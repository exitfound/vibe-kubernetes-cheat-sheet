import { svg, g, text, rect, line, path, circle } from '../lib/svg.js';
import { arrowDefs, box, pod } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket,
  makeInit, clearHighlights, clearWires, flashChips,
} from '../lib/scaling-kit.js';

// SCALING behavior card: THE TOLERANCE BAND. The HPA does nothing while the metric ratio stays within
// a tolerance (default 0.1, +/-10 percent) of the target, so ordinary noise is ignored. Because the
// tolerance is applied to the RATIO of metric to target, the dead band scales with the target rather
// than being a fixed percentage spread. It acts only when the ratio leaves the band.
//
// GEOMETRY. The HPA controller sits top center (right of the narration overlay). Below it a horizontal
// BAND BAR runs across the free width: a dim track from 30 to 70 percent, a shaded band covering 45 to
// 55, a dashed target line at 50, and a MARKER dot that slides left and right to the current metric.
// The marker is a canon ball marker whose translateX is animated (it is a dial on the band, not a
// packet on a wire). The replica ROW sits below on ROW_Y, three at rest, growing to four only when the
// marker leaves the band.
//
// PULSE MODEL. The HPA is infrastructure: it lights via .highlight, it never pulses. Only the Pod
// replicas pulse, and only on the breach step where the row actually grows. The inside / noise / back
// steps are DELIBERATELY packet-less and pod-less (nothing scales, the marker is a dial not a packet),
// so nothing pulses there and the relevant chip is flashed via flashChips so the step does not read
// frozen.
const SPINE_X = 600;

const HPA_X = 460, HPA_Y = 104, HPA_W = 280, HPA_H = 74;   // 460..740, center 600
const HPA_BOTTOM = HPA_Y + HPA_H;                          // 178
const BUS_Y = 322;                                         // the create bus the create lane drops onto

// The band bar: a linear metric axis from 30 to 70 percent mapped across the free width.
const AX_LO = 30, AX_HI = 70, AX_X0 = 440, AX_X1 = 1060;
const PX_PER = (AX_X1 - AX_X0) / (AX_HI - AX_LO);          // 15.5 px per percent
const mx = p => AX_X0 + (p - AX_LO) * PX_PER;
const BAND_Y = 232, BAND_H = 24;
const BAND_LO = 45, BAND_HI = 55, TARGET = 50;
const MARK_Y = BAND_Y + BAND_H / 2;                        // 244: marker rides the band centre

const SLOTS = 4;
const P_W = 96, P_H = 120, P_GAP = 28;
const ROW_Y = 384;
const ROW_W = SLOTS * P_W + (SLOTS - 1) * P_GAP;           // 468
const ROW_X0 = SPINE_X - ROW_W / 2;                        // 366
const slotX = i => ROW_X0 + i * (P_W + P_GAP);            // 366,490,614,738
const slotCX = i => slotX(i) + P_W / 2;

const CHIPS_Y = 556;

// A create lane from the controller down onto the bus, across to a slot, and down into its top.
const createLane = i => [[SPINE_X, HPA_BOTTOM], [SPINE_X, BUS_Y], [slotCX(i), BUS_Y], [slotCX(i), ROW_Y]];

// The marker transform at a given metric percent (rides the band centre horizontally).
const markTransform = p => `translate(${mx(p)}px, ${MARK_Y}px)`;

function laneWire(points) {
  const d = 'M ' + points.map(p => p.join(' ')).join(' L ');
  return path({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-scaling scheme-arrow-dim', d, 'stroke-dasharray': '5 5', fill: 'none' });
}

// A replica is a Pod shell wrapped in a bare g so pulsePod reaches the shell and its rise-in can be
// animated on the wrap without clobbering the Pod translate.
function buildReplica(i) {
  const x = slotX(i), y = ROW_Y;
  const shell = pod({ x, y, w: P_W, h: P_H, label: 'web', containers: 0, cat: 'scaling' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const wrap = g({});
  wrap.appendChild(shell);
  return { wrap, shell };
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
      'aria-label': 'The HPA tolerance band. The autoscaler ignores any deviation within a tolerance, ten percent by default, applied to the ratio of the metric to the target, so a metric wobbling just above or below the target does not trigger a scale event and the band scales with the target rather than being a fixed spread. A shaded band covers forty five to fifty five percent around a target of fifty, and a marker rides the band to the live metric. While the marker stays inside the band nothing happens, and only when it leaves the band does the HPA recompute and grow the row of Pods.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const hpa = box({ x: HPA_X, y: HPA_Y, w: HPA_W, h: HPA_H, label: 'HorizontalPodAutoscaler', sublabel: 'tolerance 0.1 on metric / target ratio', cat: 'scaling' });

    // The band bar: dim track, shaded tolerance band, dashed target line, and tick labels.
    const track = rect({ x: AX_X0, y: BAND_Y, width: AX_X1 - AX_X0, height: BAND_H, rx: 3, fill: 'rgba(255, 255, 255, 0.04)', stroke: 'rgba(255, 255, 255, 0.14)', 'stroke-width': 1 });
    const bandRect = rect({ x: mx(BAND_LO), y: BAND_Y, width: mx(BAND_HI) - mx(BAND_LO), height: BAND_H, rx: 2, fill: 'rgba(255, 160, 77, 0.16)', stroke: 'var(--scaling-color)', 'stroke-width': 1 });
    const targetLine = line({ x1: mx(TARGET), y1: BAND_Y - 8, x2: mx(TARGET), y2: BAND_Y + BAND_H + 8, stroke: 'var(--scaling-color)', 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
    const tLo = text({ class: 'scheme-label code dim', x: AX_X0, y: BAND_Y + BAND_H + 24, 'text-anchor': 'middle' }, ['30%']);
    const tMid = text({ class: 'scheme-label code dim', x: mx(TARGET), y: BAND_Y - 16, 'text-anchor': 'middle' }, ['target 50%']);
    const tHi = text({ class: 'scheme-label code dim', x: AX_X1, y: BAND_Y + BAND_H + 24, 'text-anchor': 'middle' }, ['70%']);
    const bandLbl = text({ class: 'scheme-label code dim', x: mx(TARGET), y: BAND_Y + BAND_H + 24, 'text-anchor': 'middle' }, ['target x (1 +/- 0.1)']);

    // The marker: a canon ball dot around x=0, positioned by translate onto the band centre. It is a
    // dial on the band, not a packet on a wire, so it carries no scheme-packet class and the tools do
    // not count it as traffic.
    const marker = circle({ class: 'scheme-marker', 'data-cat': 'scaling', cx: 0, cy: 0, r: 8, fill: 'var(--scaling-color)', stroke: '#110f1f', 'stroke-width': 2 });
    marker.style.transform = markTransform(TARGET);

    const replicas = [];
    for (let i = 0; i < SLOTS; i++) replicas.push(buildReplica(i));
    const rowGroup = g({});
    replicas.forEach(r => rowGroup.appendChild(r.wrap));

    const metricChip = valChip({ x: 150, y: CHIPS_Y, w: 290, h: 34, name: 'metric',  value: '50%',   cat: 'scaling' });
    const bandChip   = valChip({ x: 470, y: CHIPS_Y, w: 320, h: 34, name: 'band',    value: '45 to 55%', cat: 'scaling' });
    const actionChip = valChip({ x: 820, y: CHIPS_Y, w: 240, h: 34, name: 'action',  value: 'hold',  cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: controller and band bar and replica row, then the marker above the bar, then chips,
    // then the packet layer on top.
    [hpa, track, bandRect, targetLine, tLo, tMid, tHi, bandLbl, rowGroup, marker].forEach(el => root.appendChild(el));
    [metricChip, bandChip, actionChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, hpa, marker, replicas,
      metricChip, bandChip, actionChip,
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
function setChips(s, { metric, band, action }) {
  setChip(s.refs.metricChip, metric);
  setChip(s.refs.bandChip, band);
  setChip(s.refs.actionChip, action);
}

function setRow(s, visibleCount) {
  s.refs.replicas.forEach((r, i) => {
    r.wrap.style.opacity = i < visibleCount ? '1' : '0';
    r.wrap.style.transform = 'translate(0px, 0px)';
  });
}

function setMarker(s, p) { s.refs.marker.style.transform = markTransform(p); }

function clearHL(s) {
  clearHighlights(s, ['hpa', 'metricChip', 'bandChip', 'actionChip'], s.refs.replicas.map(r => r.wrap));
}

const BAND_STR = '45 to 55%';

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'The HPA targets fifty percent utilization but does not react to every small deviation. The tolerance is measured on the ratio of metric to target, so the band scales with the target rather than being a fixed spread. Around fifty that band runs from forty five to fifty five percent, and while the marker stays inside it the autoscaler holds the current three replicas.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { metric: '50%', band: BAND_STR, action: 'hold' });
      setRow(s, 3);
      setMarker(s, TARGET);
    },
  },
  {
    id: 'inside',
    duration: 2200,
    narration: 'The metric drifts up to fifty three percent. That is above the target, but still inside the tolerance band, so the HPA treats it as noise and does nothing. The replica count stays at three.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { metric: '53%', band: BAND_STR, action: 'hold' });
      setRow(s, 3);
      setMarker(s, 53);
      s.refs.bandChip.classList.add('highlight');
      if (ctx.reduced) return;
      // Packet-less and pod-less: nothing scales. The marker slides to 53 and the band chip flashes so
      // the step does not read frozen.
      ctx.register(s.refs.marker.animate(
        [{ transform: markTransform(TARGET) }, { transform: markTransform(53) }],
        { duration: 600, fill: 'forwards', easing: 'ease-in-out' },
      ));
      flashChips(s, ctx, ['bandChip'], 650);
    },
  },
  {
    id: 'noise',
    duration: 2800,
    narration: 'Real metrics jitter. The reading bounces between forty eight and fifty four percent tick after tick, but every one of those values falls inside the band. The HPA absorbs all of it and never touches the replica count.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { metric: '48 to 54%', band: BAND_STR, action: 'hold' });
      setRow(s, 3);
      setMarker(s, 51);
      s.refs.bandChip.classList.add('highlight');
      if (ctx.reduced) return;
      // Still packet-less and pod-less: the marker jitters inside the band, settling near the target.
      ctx.register(s.refs.marker.animate(
        [
          { transform: markTransform(53), offset: 0 },
          { transform: markTransform(48), offset: 0.25 },
          { transform: markTransform(54), offset: 0.5 },
          { transform: markTransform(49), offset: 0.75 },
          { transform: markTransform(51), offset: 1 },
        ],
        { duration: 1800, fill: 'forwards', easing: 'ease-in-out' },
      ));
      flashChips(s, ctx, ['bandChip'], 400);
    },
  },
  {
    id: 'breach',
    duration: 3400,
    narration: 'Now the metric jumps to sixty two percent. The ratio is one point two four, well past the tolerance, so the marker leaves the band. This is a real signal, not noise, so the HPA finally recomputes and scales out. A fourth Pod is created and the row grows.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { metric: '62%', band: BAND_STR, action: 'scale out' });
      setRow(s, 4);
      setMarker(s, 62);
      s.refs.hpa.classList.add('highlight');
      s.refs.actionChip.classList.add('highlight');
      if (ctx.reduced) return;
      // The marker leaves the band, then the HPA sends a create down the lane to the new slot, which
      // rises and pulses on arrival (down-arrow: packet first, pulse on arrival).
      ctx.register(s.refs.marker.animate(
        [{ transform: markTransform(51) }, { transform: markTransform(62) }],
        { duration: 600, fill: 'forwards', easing: 'ease-in-out' },
      ));
      const lane = createLane(3);
      s.refs.packetLayer.appendChild(laneWire(lane));
      const pkt = routePacket(s, ctx, lane, { delay: 650, cat: 'scaling' });
      const w = s.refs.replicas[3].wrap;
      w.style.opacity = '0';
      w.style.transform = 'translate(0px, 14px)';
      ctx.register(w.animate(
        [{ opacity: 0, transform: 'translate(0px, 14px)' }, { opacity: 1, transform: 'translate(0px, 0px)' }],
        { duration: 360, delay: pkt.arrivalMs, fill: 'forwards', easing: 'ease-out' },
      ));
      pulsePod(w, ctx, pkt.arrivalMs + 120);
    },
  },
  {
    id: 'back',
    duration: 2400,
    narration: 'The extra Pod brings load down and the metric settles back to fifty two percent, inside the band again. The HPA does not immediately undo the scale out, it simply holds at four replicas. The band is what keeps it from twitching on every wobble.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { metric: '52%', band: BAND_STR, action: 'hold' });
      setRow(s, 4);
      setMarker(s, 52);
      s.refs.metricChip.classList.add('highlight');
      if (ctx.reduced) return;
      // Back inside the band: packet-less and pod-less. The marker returns and the metric chip flashes.
      ctx.register(s.refs.marker.animate(
        [{ transform: markTransform(62) }, { transform: markTransform(52) }],
        { duration: 600, fill: 'forwards', easing: 'ease-in-out' },
      ));
      flashChips(s, ctx, ['metricChip'], 650);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
