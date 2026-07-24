import { svg, g, text, path } from '../lib/svg.js';
import { arrowDefs, box, pod, animateAlong, chainList, setChainActive } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, pulsePodDim, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, flashChips, BEAT, FADE,
} from '../lib/scaling-kit.js';

// scaling-hpa-missing-unready: the HPA leaves not-yet-Ready Pods and Pods with a missing metric out of
// the average, and treats the ones it cannot read conservatively. When scaling UP it assumes a missing
// Pod is at zero percent so it cannot inflate the desired count, and when scaling DOWN it assumes a
// hundred percent so it cannot over-shrink. This one-sided caution damps overshoot during churn.
//
// GEOMETRY. The HPA sits top center, the average box sits between it and the row, and the row of five
// Pods sits low on y=ROW_Y. Two Pods are not Ready (dim) and one Ready Pod has no metric yet. Only the
// Pods that are actually counted send a metric up to the average box, and dim Pods use pulsePodDim so
// the blink reads on a faded shell.
const SPINE_X = 600;

const HPA_X = 460, HPA_Y = 88, HPA_W = 280, HPA_H = 72;    // center 600,124
const HPA_BOTTOM = HPA_Y + HPA_H;                          // 160

const AVG_X = 490, AVG_Y = 250, AVG_W = 220, AVG_H = 60;   // center 600,280

const SLOTS = 5;
const P_W = 96, P_H = 118, P_GAP = 28;
const ROW_Y = 392;
const ROW_W = SLOTS * P_W + (SLOTS - 1) * P_GAP;           // 592
const ROW_X0 = SPINE_X - ROW_W / 2;                        // 304
const slotX = i => ROW_X0 + i * (P_W + P_GAP);
const slotCX = i => slotX(i) + P_W / 2;                    // 352,476,600,724,848

const CHIPS_Y = 556;

// The three Ready Pods each feed the average box through a lane into its top, entry points spread so
// the lanes do not overlap.
const AVG_ENTRY = { 0: 545, 1: 600, 2: 655 };
const readyLane = i => [[slotCX(i), ROW_Y], [slotCX(i), 332], [AVG_ENTRY[i], 332], [AVG_ENTRY[i], AVG_Y]];

function laneWire(points, { dim = true } = {}) {
  const cls = 'scheme-arrow scheme-arrow-dashed scheme-arrow-scaling' + (dim ? ' scheme-arrow-dim' : '');
  const d = 'M ' + points.map(p => p.join(' ')).join(' L ');
  return path({ class: cls, d, 'stroke-dasharray': '5 5', fill: 'none' });
}

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

function buildReplica(i) {
  const x = slotX(i), y = ROW_Y;
  const shell = pod({ x, y, w: P_W, h: P_H, label: 'web', containers: 0, cat: 'scaling' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const state = text({ class: 'scheme-pod-sublabel', x: x + P_W / 2, y: y + P_H - 16, 'text-anchor': 'middle' }, ['Ready']);
  const wrap = g({});
  [shell, state].forEach(el => wrap.appendChild(el));
  return { wrap, shell, state };
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
      'aria-label': 'How the HPA handles unready and missing Pods. Pods that are not yet Ready and Pods with no reported metric are left out of the average. For the ones it cannot read the HPA is deliberately one-sided: when scaling up it assumes a missing Pod is at zero percent so it cannot inflate the desired count, and when scaling down it assumes a hundred percent so it cannot over-shrink. This caution keeps the autoscaler from overshooting while Pods are still churning.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const hpa = box({ x: HPA_X, y: HPA_Y, w: HPA_W, h: HPA_H, label: 'HPA', sublabel: 'averages the counted Pods', cat: 'scaling' });
    const avg = box({ x: AVG_X, y: AVG_Y, w: AVG_W, h: AVG_H, label: 'average', sublabel: 'Ready with metric', cat: 'scaling' });

    // The ordered decision walk for Pods the HPA cannot fully read, one row lit per step.
    const chain = chainList({
      x: 800, y: 168, w: 380, rowH: 30, gap: 8,
      items: [
        '1. exclude     ·  drop not-Ready',
        '2. set aside   ·  no metric',
        '3. scale up    ·  assume 0%',
        '4. scale down  ·  assume 100%',
        '5. settle      ·  recompute all Ready',
      ],
      cat: 'scaling',
    });

    const replicas = [];
    for (let i = 0; i < SLOTS; i++) replicas.push(buildReplica(i));
    const rowGroup = g({});
    replicas.forEach(r => rowGroup.appendChild(r.wrap));

    const readyChip = valChip({ x: 150, y: CHIPS_Y, w: 260, h: 34, name: 'ready',      value: '3 of 5', cat: 'scaling' });
    const countChip = valChip({ x: 450, y: CHIPS_Y, w: 260, h: 34, name: 'counted',    value: '3',      cat: 'scaling' });
    const assumeChip = valChip({ x: 750, y: CHIPS_Y, w: 300, h: 34, name: 'assumption', value: 'none',  cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): HPA and average box, replica row, chip strip, packet layer, then the
    // ladder LAST so its rows read above everything.
    [hpa, avg, rowGroup].forEach(el => root.appendChild(el));
    [readyChip, countChip, assumeChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);
    root.appendChild(chain);

    this.host.appendChild(root);
    this.refs = {
      svg: root, hpa, avg, chain, replicas,
      readyChip, countChip, assumeChip,
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
function setChips(s, { ready, counted, assumption }) {
  setChip(s.refs.readyChip, ready);
  setChip(s.refs.countChip, counted);
  setChip(s.refs.assumeChip, assumption);
}

// Pin each Pod's opacity and state sublabel for this step. states is an array of {op, txt} per slot.
function setStates(s, states) {
  s.refs.replicas.forEach((r, i) => {
    r.wrap.style.opacity = String(states[i].op);
    r.state.textContent = states[i].txt;
  });
}

function clearHL(s) {
  clearHighlights(s, ['hpa', 'avg', 'readyChip', 'countChip', 'assumeChip'],
    s.refs.replicas.map(r => r.wrap));
}

// The resting picture: slots 0,1 Ready with metric, slot 2 Ready but no metric, slots 3,4 not Ready.
const READY_FULL = { op: 1, txt: 'Ready' };
const NO_METRIC = { op: 0.6, txt: 'no metric' };
const UNREADY = { op: 0.4, txt: 'not Ready' };

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'This workload has five Pods, but two of them are still starting and are not Ready. The HPA has to decide what to do about Pods it cannot fully account for before it averages anything.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, -1);
      setChips(s, { ready: '3 of 5', counted: '3', assumption: 'none' });
      setStates(s, [READY_FULL, READY_FULL, READY_FULL, UNREADY, UNREADY]);
    },
  },
  {
    id: 'exclude',
    duration: 2800,
    narration: 'First it excludes the two not-Ready Pods. A Pod that has not passed its readiness check is still warming up, so counting its low early load would drag the average down and hide real pressure. Only the three Ready Pods feed the average. On a scale-up tick these unready Pods are also treated as zero percent, the same conservative guess used for a missing metric, so they can only hold the count down.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 0);
      setChips(s, { ready: '3 of 5', counted: '3', assumption: 'none' });
      setStates(s, [READY_FULL, READY_FULL, READY_FULL, UNREADY, UNREADY]);
      if (ctx.reduced) { s.refs.avg.classList.add('highlight'); return; }
      // Up-arrow: the three Ready Pods pulse first, then each sends its metric up to the average box,
      // which lights on arrival. The two not-Ready Pods dim-pulse once to show they were skipped.
      [0, 1, 2].forEach(i => pulsePod(s.refs.replicas[i].wrap, ctx, 0));
      [3, 4].forEach(i => pulsePodDim(s.refs.replicas[i].wrap, ctx, 0, { from: 0.4, peak: 0.62 }));
      let last = 0;
      [0, 1, 2].forEach(i => {
        const lane = readyLane(i);
        s.refs.packetLayer.appendChild(laneWire(lane));
        const pkt = routePacket(s, ctx, lane, { delay: BEAT.afterPulse, cat: 'scaling' });
        last = Math.max(last, pkt.arrivalMs);
      });
      lightBoxAt(s.refs.avg, ctx, last);
    },
  },
  {
    id: 'missing',
    duration: 2800,
    narration: 'Among the three Ready Pods, one has not reported a metric yet, so metrics.k8s.io has no value for it. The HPA cannot simply drop it the way it drops an unready Pod, because a real running Pod is carrying load. It counts as a special case.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 1);
      setChips(s, { ready: '3 of 5', counted: '2', assumption: 'held aside' });
      setStates(s, [READY_FULL, READY_FULL, NO_METRIC, UNREADY, UNREADY]);
      s.refs.avg.classList.add('highlight');
      if (ctx.reduced) return;
      // The missing-metric Pod dim-pulses to single it out. No packet leaves it, it has no value to send.
      pulsePodDim(s.refs.replicas[2].wrap, ctx, 0, { from: 0.6, peak: 0.85 });
    },
  },
  {
    id: 'conservative-up',
    duration: 2600,
    narration: 'When the tick is scaling up, the HPA assumes the missing Pod is at zero percent. A Pod pinned at zero can only pull the average down, so it can never inflate the desired count. Scale-up decisions stay honest and do not add Pods on a guess.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 2);
      setChips(s, { ready: '3 of 5', counted: '2', assumption: '0% when up' });
      setStates(s, [READY_FULL, READY_FULL, NO_METRIC, UNREADY, UNREADY]);
      // Conceptual step: the average box lights and the assumption chip flashes once. No packet.
      s.refs.avg.classList.add('highlight');
      s.refs.assumeChip.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['assumeChip']);
    },
  },
  {
    id: 'conservative-down',
    duration: 2600,
    narration: 'When the same tick is scaling down, it flips the assumption to a hundred percent instead. A Pod pinned at the top can only hold the average up, so it can never justify shrinking. Neither guess is ever the one that would cause an overshoot.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 3);
      setChips(s, { ready: '3 of 5', counted: '2', assumption: '100% when down' });
      setStates(s, [READY_FULL, READY_FULL, NO_METRIC, UNREADY, UNREADY]);
      s.refs.avg.classList.add('highlight');
      s.refs.assumeChip.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['assumeChip']);
    },
  },
  {
    id: 'settle',
    duration: 2800,
    narration: 'Once the starting Pods pass readiness and the quiet Pod finally reports a metric, the next tick recomputes over the full set of five. The conservative assumptions were only ever a bridge across the churn, not a permanent state.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 4);
      setChips(s, { ready: '5 of 5', counted: '5', assumption: 'none' });
      setStates(s, [READY_FULL, READY_FULL, READY_FULL, READY_FULL, READY_FULL]);
      if (ctx.reduced) return;
      // All five are now Ready with a metric and pulse together as the full set is averaged.
      [0, 1, 2, 3, 4].forEach(i => pulsePod(s.refs.replicas[i].wrap, ctx, 0));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
