import { svg, g, text, rect, path } from '../lib/svg.js';
import { arrowDefs, box, pod, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, segmentPacket, routeDur,
  makeInit, clearHighlights, clearWires, flashChips, BEAT, FADE,
} from '../lib/scaling-kit.js';

// FOUNDATIONS card: requests define utilization. Utilization percent = usage / request, so the
// resource request is the DENOMINATOR every utilization autoscaler needs. Without a request there is
// no denominator, the ratio is undefined, and the HPA reports the metric as unknown and refuses to
// act. The limit never enters this arithmetic. This is the VERTICAL grammar of the category: one Pod
// in focus, its two inner bars (usage and request) driving a computed percent, no replica row.
//
// GEOMETRY. The narration overlay owns the top-left, so the focus Pod sits right of x=380 with its
// two vertical bars, the utilization gauge is a box to its right, and the HPA that reads the gauge
// sits above the gauge. Only the Pod pulses, the gauge and HPA are infrastructure and light via
// .highlight. The bars are detail rects, they reveal and ghost but never pulse.
const PD_X = 410, PD_Y = 196, PD_W = 320, PD_H = 260;   // focus Pod, center 570

const BAR_BOTTOM = 420, BAR_TOP = 252, BAR_H = BAR_BOTTOM - BAR_TOP;  // full bar = the request scale
const UX = 470, RX = 630, BAR_W = 48;                   // usage column, request column
const USAGE_H = Math.round(BAR_H * 200 / 250);          // usage 200m on a 250m scale

const GX = 800, GY = 250, GW = 250, GH = 140;           // utilization gauge, center 925
const HX = 800, HY = 96,  HW = 250, HH = 64;            // HPA reading the gauge, center 925
const GAUGE_CX = GX + GW / 2;
const LANE_UP = [[GAUGE_CX, GY], [GAUGE_CX, HY + HH]];   // gauge top -> HPA bottom

const CHIPS_Y = 556;

function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'linear' } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: -14, 'text-anchor': 'middle', 'data-cat': 'scaling' }, [txt]);
  lbl.style.opacity = '0';
  lbl.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px)`;
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 160, fill: 'forwards', easing: 'ease-in' }));
}

function laneWire(points) {
  const d = 'M ' + points.map(p => p.join(' ')).join(' L ');
  return path({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-scaling', d, 'stroke-dasharray': '5 5', fill: 'none' });
}

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Requests define utilization. Utilization percent is usage divided by the resource request, so the request is the denominator every utilization autoscaler needs. When usage is 200m against a 250m request the utilization is 80 percent, but with no request set the ratio is undefined, the HPA reports the metric as unknown, and it cannot act. The limit never enters this arithmetic, only the request does.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // The Pod shell lives in a wrap alongside its bars, so the pulse (which queries .scheme-pod
    // descendants) reaches only the shell, never the bar rects.
    const shell = pod({ x: PD_X, y: PD_Y, w: PD_W, h: PD_H, label: 'Pod web', containers: 0, cat: 'scaling' });
    const shellRect = shell.querySelector('.scheme-pod-rect');
    if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const usageTrack = rect({ x: UX, y: BAR_TOP, width: BAR_W, height: BAR_H, rx: 3, fill: 'rgba(255, 255, 255, 0.04)', stroke: 'var(--scaling-color)', 'stroke-width': 1, 'stroke-opacity': 0.4 });
    const usageFill  = rect({ x: UX, y: BAR_BOTTOM - USAGE_H, width: BAR_W, height: USAGE_H, rx: 3, fill: 'rgba(255, 160, 77, 0.55)', stroke: 'var(--scaling-color)', 'stroke-width': 1 });
    const reqTrack   = rect({ x: RX, y: BAR_TOP, width: BAR_W, height: BAR_H, rx: 3, fill: 'rgba(255, 160, 77, 0.22)', stroke: 'var(--scaling-color)', 'stroke-width': 1 });
    const usageCap = text({ class: 'scheme-pod-sublabel', x: UX + BAR_W / 2, y: BAR_BOTTOM + 20, 'text-anchor': 'middle' }, ['usage']);
    const reqCap   = text({ class: 'scheme-pod-sublabel', x: RX + BAR_W / 2, y: BAR_BOTTOM + 20, 'text-anchor': 'middle' }, ['request']);

    const podWrap = g({});
    [shell, usageTrack, usageFill, reqTrack, usageCap, reqCap].forEach(el => podWrap.appendChild(el));

    // The gauge is a labeled box, not a giant glyph: the utilization value lives in its chip, and the
    // box sublabel carries the state of the ratio (usage / request, over target, or no denominator).
    const gaugeBox = box({ x: GX, y: GY, w: GW, h: GH, label: 'utilization', cat: 'scaling' });
    const gaugeSub = text({ class: 'scheme-box-sublabel', x: GAUGE_CX, y: GY + GH / 2 + 32, 'text-anchor': 'middle' }, ['usage / request']);
    const gaugeGroup = g({});
    [gaugeBox, gaugeSub].forEach(el => gaugeGroup.appendChild(el));

    const hpaBox = box({ x: HX, y: HY, w: HW, h: HH, label: 'HPA', sublabel: 'target 50%', cat: 'scaling' });

    const usageChip = valChip({ x: 120, y: CHIPS_Y, w: 280, h: 34, name: 'usage',       value: '200m',  cat: 'scaling' });
    const reqChip   = valChip({ x: 440, y: CHIPS_Y, w: 300, h: 34, name: 'request',     value: '250m',  cat: 'scaling' });
    const utilChip  = valChip({ x: 780, y: CHIPS_Y, w: 300, h: 34, name: 'utilization', value: '80%',   cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): HPA and gauge and Pod, then the chip strip, then the packet layer.
    [hpaBox, gaugeGroup, podWrap].forEach(el => root.appendChild(el));
    [usageChip, reqChip, utilChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, podWrap, usageFill, reqTrack, gaugeBox, gaugeSub, hpaBox,
      usageChip, reqChip, utilChip,
      wires: {}, packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}
function setChips(s, { usage, request, util }) {
  setChip(s.refs.usageChip, usage);
  setChip(s.refs.reqChip, request);
  setChip(s.refs.utilChip, util);
}

function setGauge(s, sub) {
  s.refs.gaugeSub.textContent = sub;
}

function clearHL(s) {
  clearHighlights(s, ['gaugeBox', 'hpaBox', 'usageChip', 'reqChip', 'utilChip', 'reqTrack'], [s.refs.podWrap]);
  s.refs.reqTrack.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'This Pod uses 200m of cpu and requests 250m. Utilization is not a raw number, it is usage measured against the request. The gauge and the two bars on the Pod are the pieces that arithmetic needs.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { usage: '200m', request: '250m', util: '80%' });
      setGauge(s, 'usage / request');
    },
  },
  {
    id: 'the-ratio',
    duration: 2200,
    narration: 'The ratio is simple. Usage 200m divided by request 250m is 0.8, so the Pod is running at 80 percent of what it asked for. The request is the denominator, the fixed scale the usage is compared against.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { usage: '200m', request: '250m', util: '80%' });
      setGauge(s, 'usage / request');
      // Conceptual arithmetic, no packet and no Pod action, so the gauge and the three chips that
      // carry the ratio flash once.
      s.refs.gaugeBox.classList.add('highlight');
      s.refs.usageChip.classList.add('highlight');
      s.refs.reqChip.classList.add('highlight');
      s.refs.utilChip.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['gaugeBox', 'usageChip', 'reqChip', 'utilChip']);
    },
  },
  {
    id: 'target',
    duration: 3000,
    narration: 'The HPA reads this utilization, the average across the Ready Pods, and compares it to its target. The target is 50 percent and the Pods sit at 80, which is over, so the HPA decides to scale out. The whole decision hangs on that percent being computable in the first place.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { usage: '200m', request: '250m', util: '80%' });
      setGauge(s, 'over target 50%');
      s.refs.gaugeBox.classList.add('highlight');
      s.refs.hpaBox.classList.add('highlight');
      s.refs.utilChip.classList.add('highlight');
      if (ctx.reduced) return;
      // Up-arrow: the measured Pod pulses first, then its utilization rides up the lane to the HPA.
      pulsePod(s.refs.podWrap, ctx, 0);
      s.refs.packetLayer.appendChild(laneWire(LANE_UP));
      segmentPacket(s, ctx, { from: LANE_UP[0], to: LANE_UP[1], delay: BEAT.afterPulse, cat: 'scaling' });
      ridingLabel(s, ctx, 'util 80%', LANE_UP, { delay: BEAT.afterPulse, easing: 'linear' });
    },
  },
  {
    id: 'no-request',
    duration: 2600,
    narration: 'Now remove the request. Usage is still 200m, but there is nothing to divide it by, so the utilization is undefined. The HPA reads the metric as unknown for this Pod and cannot act on it at all. Autoscaling on utilization silently stops working.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { usage: '200m', request: 'unset', util: 'unknown' });
      setGauge(s, 'no denominator');
      // The request bar ghosts away (the denominator is gone) and the gauge and request chip flash
      // to mark the unknown. No packet, no Pod action.
      s.refs.reqTrack.style.opacity = '0.12';
      s.refs.gaugeBox.classList.add('highlight');
      s.refs.reqChip.classList.add('highlight');
      s.refs.utilChip.classList.add('highlight');
      if (ctx.reduced) return;
      ctx.register(s.refs.reqTrack.animate([{ opacity: 1 }, { opacity: 0.12 }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' }));
      flashChips(s, ctx, ['gaugeBox', 'reqChip', 'utilChip']);
    },
  },
  {
    id: 'takeaway',
    duration: 2200,
    narration: 'The lesson is short. A request is the denominator every utilization autoscaler depends on, so always set requests on workloads you want to autoscale. The limit is a separate cap and never enters this math, only the request does.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { usage: '200m', request: '250m', util: '80%' });
      setGauge(s, 'usage / request');
      // Restore and settle on the request as the anchor, flashing the request pieces.
      s.refs.gaugeBox.classList.add('highlight');
      s.refs.reqChip.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['gaugeBox', 'reqChip']);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
