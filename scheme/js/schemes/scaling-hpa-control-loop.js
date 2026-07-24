import { svg, g, text, path } from '../lib/svg.js';
import { arrowDefs, box, pod, animateAlong, chainList, setChainActive } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, flashChips, BEAT, FADE,
} from '../lib/scaling-kit.js';

// scaling-hpa-control-loop: the HEARTBEAT of the scaling category, and the card that sets the ladder
// standard for it. The HPA is a plain reconcile loop that never stops: on a fixed cadence it lists the
// target Pods by selector, reads their metric from the metrics API, computes a desired replica count,
// and if that differs from the current count it PATCHes the scale subresource, then waits for the next
// tick. The five reconcile stages ride a chainList on the right, one row lit per step, while the flow
// plays down the center: a metric read rises from the row through metrics.k8s.io to the HPA, the HPA
// computes, then a PATCH drops to the scale endpoint and the controller stamps out the new replicas.
//
// GEOMETRY. The HPA sits top center, clear of the overlay. metrics.k8s.io straddles the read lane
// (rising at x=538 from a representative Pod), the /scale endpoint straddles the patch lane (dropping
// at x=660), so the two vertical lanes never cross each other. The reconcile ladder sits on the right
// (x>=800), clear of both the overlay on the left and the center flow, and the create lanes stop short
// of it. The replica row sits low on ROW_Y with full width. Only Pods pulse.
const SPINE_X = 600;

const HPA_X = 430, HPA_Y = 56, HPA_W = 340, HPA_H = 74;    // center 600,93
const HPA_BOTTOM = HPA_Y + HPA_H;                          // 130

const READ_X = 538;                                        // read lane vertical, rises from slot 2
const MET_X = 438, MET_Y = 176, MET_W = 200, MET_H = 52;   // straddles the read lane, center 538,202

const PATCH_X = 660;                                       // patch lane vertical, drops right of center
const SCALE_X = 580, SCALE_Y = 280, SCALE_W = 160, SCALE_H = 44; // straddles the patch lane, center 660,302
const SCALE_BOTTOM = SCALE_Y + SCALE_H;                    // 324

const SLOTS = 6;
const P_W = 96, P_H = 118, P_GAP = 28;
const ROW_Y = 400;
const ROW_W = SLOTS * P_W + (SLOTS - 1) * P_GAP;           // 716
const ROW_X0 = SPINE_X - ROW_W / 2;                        // 242
const slotX = i => ROW_X0 + i * (P_W + P_GAP);
const slotCX = i => slotX(i) + P_W / 2;                    // 290,414,538,662,786,910

const CHIPS_Y = 556;
const BUS_Y = 376;

// The read lane: straight up the x=538 vertical, through metrics.k8s.io, into the HPA bottom.
const READ_LANE = [[READ_X, ROW_Y], [READ_X, HPA_BOTTOM]];
// The PATCH lane: straight down the x=660 vertical from the HPA to the scale endpoint.
const PATCH_LANE = [[PATCH_X, HPA_BOTTOM], [PATCH_X, SCALE_Y]];
// A create lane from the scale endpoint down onto a bus, across to a slot, and into its top.
const createLane = i => [[PATCH_X, SCALE_BOTTOM], [PATCH_X, BUS_Y], [slotCX(i), BUS_Y], [slotCX(i), ROW_Y]];

function laneWire(points, { dim = true } = {}) {
  const cls = 'scheme-arrow scheme-arrow-dashed scheme-arrow-scaling' + (dim ? ' scheme-arrow-dim' : '');
  const d = 'M ' + points.map(p => p.join(' ')).join(' L ');
  return path({ class: cls, d, 'stroke-dasharray': '5 5', fill: 'none' });
}

// A tag that rides ALONG with the ball on the same path, timing and easing, so the ball visibly
// carries what the step narrates. Balls are routePacket (eased), so the label defaults to the same
// ease-in-out and the same routeDur, or it drifts off the ball mid-flight.
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

// Light an infrastructure box on packet arrival (not at step entry) via a zero-effect 1ms animation.
// Under reduced motion this is bypassed (the step's reduced branch sets the class directly instead).
function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// A replica: a Pod shell wrapped in a bare g so pulsePod reaches it (never a bare pod, the descendant
// trap) and its rise-in can be animated on the wrap without clobbering the Pod translate. A load
// sublabel carries the current reading and is repainted per step so it never goes stale.
function buildReplica(i) {
  const x = slotX(i), y = ROW_Y;
  const shell = pod({ x, y, w: P_W, h: P_H, label: 'web', containers: 0, cat: 'scaling' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const load = text({ class: 'scheme-pod-sublabel', x: x + P_W / 2, y: y + P_H - 16, 'text-anchor': 'middle' }, ['cpu 75%']);
  const wrap = g({});
  [shell, load].forEach(el => wrap.appendChild(el));
  return { wrap, shell, load };
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
      'aria-label': 'The HorizontalPodAutoscaler reconcile loop. On a fixed cadence of fifteen seconds by default, the HPA controller lists the target Pods by selector, reads their metric from metrics.k8s.io, computes a desired replica count, and if it differs from the current count it PATCHes the scale subresource so the workload controller creates the new Pods. Then it waits for the next tick, PATCHing again only when the ratio leaves the ten percent tolerance, and runs the whole loop.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const hpa = box({ x: HPA_X, y: HPA_Y, w: HPA_W, h: HPA_H, label: 'HorizontalPodAutoscaler', sublabel: 'reconcile every 15s', cat: 'scaling' });
    const metrics = box({ x: MET_X, y: MET_Y, w: MET_W, h: MET_H, label: 'metrics.k8s.io', cat: 'scaling' });
    const scaleBox = box({ x: SCALE_X, y: SCALE_Y, w: SCALE_W, h: SCALE_H, label: '/scale', cat: 'scaling' });

    // The reconcile ladder on the right: the five stages of one loop iteration, one row lit per step.
    const chain = chainList({
      x: 800, y: 172, w: 380, rowH: 30, gap: 8,
      items: [
        '1. list      ·  Pods by selector',
        '2. read      ·  metric from metrics.k8s.io',
        '3. compute   ·  desired = ceil(cur/tgt x n)',
        '4. patch     ·  PATCH /scale if changed',
        '5. wait      ·  next tick 15s, 10% tolerance',
      ],
      cat: 'scaling',
    });

    const replicas = [];
    for (let i = 0; i < SLOTS; i++) replicas.push(buildReplica(i));
    const rowGroup = g({});
    replicas.forEach(r => rowGroup.appendChild(r.wrap));

    const currentChip  = valChip({ x: 90,  y: CHIPS_Y, w: 240, h: 34, name: 'current',  value: 'cpu 75%', cat: 'scaling' });
    const targetChip   = valChip({ x: 360, y: CHIPS_Y, w: 240, h: 34, name: 'target',   value: '50%',     cat: 'scaling' });
    const desiredChip  = valChip({ x: 630, y: CHIPS_Y, w: 240, h: 34, name: 'desired',  value: '-',       cat: 'scaling' });
    const replicasChip = valChip({ x: 900, y: CHIPS_Y, w: 240, h: 34, name: 'replicas', value: '3',       cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): controller and endpoint boxes, replica row, chip strip, packet layer,
    // then the ladder LAST so its rows read above everything (it sits clear of the packets anyway).
    [hpa, metrics, scaleBox, rowGroup].forEach(el => root.appendChild(el));
    [currentChip, targetChip, desiredChip, replicasChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);
    root.appendChild(chain);

    this.host.appendChild(root);
    this.refs = {
      svg: root, hpa, metrics, scaleBox, chain, replicas,
      currentChip, targetChip, desiredChip, replicasChip,
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
function setChips(s, { current, target, desired, replicas }) {
  setChip(s.refs.currentChip, current);
  setChip(s.refs.targetChip, target);
  setChip(s.refs.desiredChip, desired);
  setChip(s.refs.replicasChip, replicas);
}

// Show the leftmost visibleCount replicas, hide the rest, and pin opacities so a mid-step cancel and
// reduced motion both land on the right picture.
function setRow(s, visibleCount) {
  s.refs.replicas.forEach((r, i) => {
    r.wrap.style.opacity = i < visibleCount ? '1' : '0';
    r.wrap.style.transform = 'translate(0px, 0px)';
  });
}

// Repaint each visible Pod's load sublabel so it always matches the current reading (never stale).
function setLoads(s, txts) {
  s.refs.replicas.forEach((r, i) => { if (txts[i] != null) r.load.textContent = txts[i]; });
}

function clearHL(s) {
  clearHighlights(s, ['hpa', 'metrics', 'scaleBox', 'currentChip', 'targetChip', 'desiredChip', 'replicasChip'],
    s.refs.replicas.map(r => r.wrap));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A HorizontalPodAutoscaler is a control loop that keeps a workload the right size. This one targets a Deployment running three replicas, watches their cpu, and aims to hold the average at fifty percent. It wakes on a fixed cadence and reconciles.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, -1);
      setChips(s, { current: 'cpu 75%', target: '50%', desired: '-', replicas: '3' });
      setLoads(s, ['cpu 75%', 'cpu 75%', 'cpu 75%']);
      setRow(s, 3);
    },
  },
  {
    id: 'list',
    duration: 2200,
    narration: 'Each tick begins by listing the target Pods. The HPA does not track individual Pods, it selects them by the same label selector the Deployment uses, and finds the three that make up this workload. Those three are the set it will average.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 0);
      setChips(s, { current: 'cpu 75%', target: '50%', desired: '-', replicas: '3' });
      setLoads(s, ['cpu 75%', 'cpu 75%', 'cpu 75%']);
      setRow(s, 3);
      s.refs.hpa.classList.add('highlight');
      if (ctx.reduced) return;
      // The selector enumerates the three Pods: they pulse together to show they are the target set.
      // No metric has been read yet, so nothing travels.
      [0, 1, 2].forEach(i => pulsePod(s.refs.replicas[i].wrap, ctx, 0));
    },
  },
  {
    id: 'read',
    duration: 3000,
    narration: 'Next it reads their metric. The kubelets have reported cpu into metrics.k8s.io, and the HPA does a GET against that API for the listed Pods. The three are averaging seventy five percent, and that reading rises through metrics.k8s.io to the HPA.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 1);
      setChips(s, { current: 'cpu 75%', target: '50%', desired: '-', replicas: '3' });
      setLoads(s, ['cpu 75%', 'cpu 75%', 'cpu 75%']);
      setRow(s, 3);
      if (ctx.reduced) { s.refs.metrics.classList.add('highlight'); s.refs.hpa.classList.add('highlight'); return; }
      // Up-arrow: the read Pods pulse first, then the metric rises through metrics.k8s.io to the HPA,
      // lighting each box on arrival. The request rides with the ball.
      [0, 1, 2].forEach(i => pulsePod(s.refs.replicas[i].wrap, ctx, 0));
      s.refs.packetLayer.appendChild(laneWire(READ_LANE));
      const read = routePacket(s, ctx, READ_LANE, { delay: BEAT.afterPulse, cat: 'scaling' });
      ridingLabel(s, ctx, 'GET metrics.k8s.io', READ_LANE, { delay: BEAT.afterPulse });
      // metrics.k8s.io straddles the lane about three-quarters of the way up, so it lights as the ball
      // passes it, the HPA as it arrives.
      lightBoxAt(s.refs.metrics, ctx, BEAT.afterPulse + Math.round(routeDur(READ_LANE) * 0.72));
      lightBoxAt(s.refs.hpa, ctx, read.arrivalMs);
    },
  },
  {
    id: 'compute',
    duration: 2400,
    narration: 'With the reading in hand the HPA runs its formula. Current seventy five over target fifty is a ratio of one point five, and three replicas times that ratio rounds up to five. So the desired count is five, above the current three, and the HPA decides to scale out.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 2);
      setChips(s, { current: 'cpu 75%', target: '50%', desired: '5', replicas: '3' });
      setLoads(s, ['cpu 75%', 'cpu 75%', 'cpu 75%']);
      setRow(s, 3);
      // A conceptual step: no packet, no Pod acts. The HPA lights and the three input chips flash once,
      // the only sanctioned block flash, so the frame does not read as frozen.
      s.refs.hpa.classList.add('highlight');
      s.refs.currentChip.classList.add('highlight');
      s.refs.targetChip.classList.add('highlight');
      s.refs.desiredChip.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['currentChip', 'targetChip', 'desiredChip']);
    },
  },
  {
    id: 'patch',
    duration: 3800,
    narration: 'Because desired differs from current, the HPA PATCHes the scale subresource to five. It never touches the Pods directly. The workload controller sees the new count and stamps out two more Pods from the template, so the row grows to five.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 3);
      setChips(s, { current: 'cpu 75%', target: '50%', desired: '5', replicas: '5' });
      setLoads(s, ['cpu 75%', 'cpu 75%', 'cpu 75%', 'starting', 'starting']);
      setRow(s, 5);
      s.refs.hpa.classList.add('highlight');
      if (ctx.reduced) { s.refs.scaleBox.classList.add('highlight'); return; }
      // Down-arrow: the PATCH drops from the HPA to the scale endpoint, which lights on arrival, then
      // the controller creates the two new replicas down their create lanes. Each new Pod rises and
      // fades in as its create ball lands, then pulses.
      s.refs.packetLayer.appendChild(laneWire(PATCH_LANE));
      const patch = routePacket(s, ctx, PATCH_LANE, { cat: 'scaling' });
      ridingLabel(s, ctx, 'PATCH /scale replicas=5', PATCH_LANE);
      lightBoxAt(s.refs.scaleBox, ctx, patch.arrivalMs);
      const NEW = [3, 4];
      NEW.forEach((i, k) => {
        const lane = createLane(i);
        s.refs.packetLayer.appendChild(laneWire(lane));
        const start = patch.arrivalMs + BEAT.afterHop + k * 200;
        const pkt = routePacket(s, ctx, lane, { delay: start, cat: 'scaling' });
        const w = s.refs.replicas[i].wrap;
        w.style.opacity = '0';
        w.style.transform = 'translate(0px, 14px)';
        ctx.register(w.animate(
          [{ opacity: 0, transform: 'translate(0px, 14px)' }, { opacity: 1, transform: 'translate(0px, 0px)' }],
          { duration: 360, delay: pkt.arrivalMs, fill: 'forwards', easing: 'ease-out' },
        ));
        pulsePod(w, ctx, pkt.arrivalMs + 120);
      });
    },
  },
  {
    id: 'wait',
    duration: 3000,
    narration: 'The two new Pods pass their probes and become Ready. Five Pods now share the load, so the average cpu falls back toward fifty percent. The HPA then simply waits for the next tick, PATCHing again only when the ratio leaves the ten percent tolerance around the target.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 4);
      setChips(s, { current: 'cpu 45%', target: '50%', desired: '5', replicas: '5' });
      setLoads(s, ['cpu 45%', 'cpu 45%', 'cpu 45%', 'cpu 45%', 'cpu 45%']);
      setRow(s, 5);
      s.refs.hpa.classList.add('highlight');
      if (ctx.reduced) return;
      // The now-Ready replicas pulse together to show the settled, correctly sized row inside tolerance.
      [0, 1, 2, 3, 4].forEach(i => pulsePod(s.refs.replicas[i].wrap, ctx, 0));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
