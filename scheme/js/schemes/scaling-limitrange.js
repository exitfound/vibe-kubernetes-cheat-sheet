import { svg, g, text, rect, line, path } from '../lib/svg.js';
import { arrowDefs, box, pod, pathArrow, chainList, setChainActive, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, flashChips, FADE, BEAT,
} from '../lib/scaling-kit.js';

// VERTICAL scaling card. A LimitRange sits over a namespace admission gate and one Pod passes through
// it. At admission the LimitRange injects a defaultRequest into a Pod that omits one (so the request
// gauge appears where there was none) and REJECTS a Pod whose present request falls outside min or
// max with 403. It never bumps a present value into range: it only fills values that are absent. This
// is how a namespace guarantees every Pod has a request in range, which utilization autoscaling
// depends on.
//
// GEOMETRY. The LimitRange box sits top center over the gate. One Pod is centered below it with a
// request gauge carrying a min and a max marker line. Two lanes carry admission traffic, a down lane
// for an injected defaultRequest and an up lane for the Pod submitting its own request. A stage ladder
// sits in the free right band. Chips along the bottom.
//
// PULSE MODEL: the LimitRange box lights via .highlight, only the Pod pulses. The admitted Pod (the
// defaultRequest inject) pulses. Both rejected Pods, over max and under min, ghost to a dim state and
// never pulse. The why step carries no packet and no Pod action, so it flashes its chips.
const SPINE_X = 600;

const LR_X = 440, LR_Y = 96, LR_W = 320, LR_H = 72;        // 440..760, center 600
const LR_BOTTOM = LR_Y + LR_H;                             // 168

const POD_X = 490, POD_Y = 252, POD_W = 220, POD_H = 200;  // 490..710, center 600
const POD_TOP = POD_Y;

const G_X = 560, G_W = 80;                                 // gauge column
const G_TOP = 300, G_BOTTOM = 440;                         // track top / bottom
const G_MAX = 316, G_MIN = 424;                            // max marker (2000m), min marker (50m)

const CHIPS_Y = 556;

const LANE_DX = 12;
const LANE_DOWN = [[SPINE_X - LANE_DX, LR_BOTTOM], [SPINE_X - LANE_DX, POD_TOP]];
const LANE_UP   = [[SPINE_X + LANE_DX, POD_TOP], [SPINE_X + LANE_DX, LR_BOTTOM]];

function reqRect(y) {
  const r = rect({ x: G_X, y, width: G_W, height: G_BOTTOM - y, rx: 2, fill: 'rgba(255, 160, 77, 0.50)', stroke: 'var(--scaling-color)', 'stroke-width': 1 });
  r.style.opacity = '0';
  return r;
}

function buildPod() {
  const shell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web', sublabel: 'submitted for admission', containers: 0, cat: 'scaling' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const track = rect({ x: G_X, y: G_TOP, width: G_W, height: G_BOTTOM - G_TOP, rx: 3, fill: 'rgba(255, 160, 77, 0.06)', stroke: 'var(--scaling-color)', 'stroke-width': 1, 'stroke-opacity': 0.35 });
  const maxLine = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-scaling', x1: G_X - 6, y1: G_MAX, x2: G_X + G_W + 6, y2: G_MAX, 'stroke-dasharray': '4 4', fill: 'none' });
  const minLine = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-scaling', x1: G_X - 6, y1: G_MIN, x2: G_X + G_W + 6, y2: G_MIN, 'stroke-dasharray': '4 4', fill: 'none' });
  const maxLbl = text({ class: 'scheme-pod-sublabel', x: G_X - 12, y: G_MAX + 4, 'text-anchor': 'end' }, ['max']);
  const minLbl = text({ class: 'scheme-pod-sublabel', x: G_X - 12, y: G_MIN + 4, 'text-anchor': 'end' }, ['min']);
  const reqDefault = reqRect(360);                          // 250m, between min and max
  const reqOver    = reqRect(300);                          // 4000m, above the max line
  const reqUnder   = reqRect(430);                          // 10m, a sliver below the min line
  const cap = text({ class: 'scheme-pod-sublabel', x: SPINE_X, y: G_TOP - 8, 'text-anchor': 'middle' }, ['cpu request']);
  const wrap = g({});
  [shell, track, reqOver, reqDefault, reqUnder, maxLine, minLine, maxLbl, minLbl, cap].forEach(el => wrap.appendChild(el));
  return { wrap, reqDefault, reqOver, reqUnder };
}

// A tag riding along with the ball, matching timing and easing so the packet visibly carries the
// request string. Balls are routePacket (eased), so the label defaults to the same ease-in-out.
function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'ease-in-out' } = {}) {
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

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'LimitRange defaults and bounds. A LimitRange in a namespace injects a defaultRequest into any Pod that omits one at admission, so every Pod ends up with a request. It only fills values that are absent, and it rejects a Pod whose present request falls outside the configured min or max with 403 Forbidden, rather than bumping it into range. This guarantees the requests that utilization autoscaling depends on always exist and stay within a per-Pod range.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const lr = box({ x: LR_X, y: LR_Y, w: LR_W, h: LR_H, label: 'LimitRange', sublabel: 'defaultRequest 250m, min 50m, max 2000m', cat: 'scaling' });
    const podUnit = buildPod();
    const wDown = pathArrow({ points: LANE_DOWN, dashed: true, dim: true, color: 'scaling' });
    const wUp   = pathArrow({ points: LANE_UP,   dashed: true, dim: true, color: 'scaling' });

    // The admission stage ladder in the free right band, clear of the Pod column and the overlay.
    const chain = chainList({
      x: 800, y: 250, w: 380, rowH: 32, gap: 12,
      items: [
        '1. inject · defaultRequest if absent',
        '2. reject · request > max',
        '3. reject · request < min',
      ],
      cat: 'scaling',
    });

    const defChip = valChip({ x: 130, y: CHIPS_Y, w: 300, h: 34, name: 'defaultRequest', value: '250m',        cat: 'scaling' });
    const rngChip = valChip({ x: 450, y: CHIPS_Y, w: 300, h: 34, name: 'min-max',        value: '50m..2000m',  cat: 'scaling' });
    const vChip   = valChip({ x: 770, y: CHIPS_Y, w: 300, h: 34, name: 'verdict',        value: 'awaiting Pods', cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): LimitRange box, the two lanes, the Pod, chips, packet layer, then the
    // chain ladder LAST so its rows render above the packet layer.
    [lr, wDown, wUp, podUnit.wrap].forEach(el => root.appendChild(el));
    [defChip, rngChip, vChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);
    root.appendChild(chain);

    this.host.appendChild(root);
    this.refs = {
      svg: root, lr, pod: podUnit.wrap, reqDefault: podUnit.reqDefault, reqOver: podUnit.reqOver, reqUnder: podUnit.reqUnder, wDown, wUp, chain,
      defChip, rngChip, vChip,
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
function setChips(s, { def, range, verdict }) {
  setChip(s.refs.defChip, def);
  setChip(s.refs.rngChip, range);
  setChip(s.refs.vChip, verdict);
}
// mode: 'none' | 'default' | 'over' | 'under'
function setReq(s, mode) {
  s.refs.reqDefault.style.opacity = mode === 'default' ? '1' : '0';
  s.refs.reqOver.style.opacity = mode === 'over' ? '1' : '0';
  s.refs.reqUnder.style.opacity = mode === 'under' ? '1' : '0';
}

function clearHL(s) {
  clearHighlights(s, ['lr', 'defChip', 'rngChip', 'vChip'], [s.refs.pod]);
  s.refs.pod.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'This namespace has a LimitRange: a defaultRequest of 250m, a minimum of 50m, and a maximum of 2000m. Every Pod created here passes through admission, where the LimitRange gets a chance to fill in an absent request or reject an out-of-range one.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, -1);
      setChips(s, { def: '250m', range: '50m..2000m', verdict: 'awaiting Pods' });
      setReq(s, 'none');
    },
  },
  {
    id: 'default-inject',
    duration: 2600,
    narration: 'A Pod arrives with no cpu request at all. The LimitRange fills in its defaultRequest of 250m during admission, so the Pod is admitted already carrying a request. defaultRequest sets the request, the plain default field would set the limit.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 0);
      setChips(s, { def: '250m injected', range: '50m..2000m', verdict: 'admitted' });
      setReq(s, 'default');
      s.refs.lr.classList.add('highlight');
      if (ctx.reduced) return;
      // Down-arrow: the defaultRequest is injected from the LimitRange into the Pod, which pulses on
      // arrival as the gauge appears.
      s.refs.reqDefault.style.opacity = '0';
      const pkt = routePacket(s, ctx, LANE_DOWN, { cat: 'scaling' });
      ridingLabel(s, ctx, 'inject defaultRequest 250m', LANE_DOWN);
      ctx.register(s.refs.reqDefault.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: pkt.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.pod, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'bound-check',
    duration: 2800,
    narration: 'A second Pod asks for 4000m, above the maximum of 2000m. Its request crosses the max line, so the LimitRange rejects the Pod at admission with 403 and it is never created. The bound is a hard ceiling on any single Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 1);
      setChips(s, { def: '250m', range: 'max 2000m', verdict: 'rejected, over max' });
      // The oversized request shows, then the Pod is refused, so it settles to a ghost. Pinned dim.
      setReq(s, 'over');
      s.refs.lr.classList.add('highlight');
      s.refs.pod.style.opacity = '0.3';
      if (ctx.reduced) return;
      // Up-arrow: the Pod submits its oversized request to the LimitRange, which rejects it, so the
      // Pod ghosts out. A rejected Pod never pulses.
      s.refs.pod.style.opacity = '1';
      routePacket(s, ctx, LANE_UP, { cat: 'scaling' });
      ridingLabel(s, ctx, 'request 4000m', LANE_UP);
      ctx.register(s.refs.pod.animate([{ opacity: 1 }, { opacity: 1 }, { opacity: 0.3 }], { duration: 1600, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'min-check',
    duration: 2800,
    narration: 'A third Pod asks for only 10m, below the minimum of 50m. A LimitRange does not raise a present value it dislikes, it only fills values that are absent, so a request that is present but under the floor is rejected with 403 too. Too small is refused just like too large.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 2);
      setChips(s, { def: '250m', range: 'min 50m', verdict: 'rejected, under min' });
      // The under-min request shows, then the Pod is refused, so it settles to a ghost. Pinned dim.
      setReq(s, 'under');
      s.refs.lr.classList.add('highlight');
      s.refs.pod.style.opacity = '0.3';
      if (ctx.reduced) return;
      // Up-arrow: the Pod submits its under-min request to the LimitRange, which rejects it, so the
      // Pod ghosts out. A rejected Pod never pulses.
      s.refs.pod.style.opacity = '1';
      routePacket(s, ctx, LANE_UP, { cat: 'scaling' });
      ridingLabel(s, ctx, 'request 10m', LANE_UP);
      ctx.register(s.refs.pod.animate([{ opacity: 1 }, { opacity: 1 }, { opacity: 0.3 }], { duration: 1600, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'why',
    duration: 2400,
    narration: 'Together these rules mean every Pod in the namespace ends up with a request that exists and sits within range. That is what makes utilization autoscaling possible here, because a request is the denominator every utilization target is measured against.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, -1);
      setChips(s, { def: 'always set', range: 'always in range', verdict: 'requests guaranteed' });
      setReq(s, 'default');
      // Conceptual step, no packet and no Pod action, so the two config chips flash once.
      s.refs.defChip.classList.add('highlight');
      s.refs.rngChip.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['defChip', 'rngChip']);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
