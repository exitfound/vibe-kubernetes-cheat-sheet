import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, pulsePod, pulsePodDim, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// CSI Storage Capacity. With local or topology-constrained storage the scheduler can bind a Pod to a
// node whose storage pool is already full, and the Pod then sits in ContainerCreating forever because
// provisioning fails on that node. CSIStorageCapacity objects, published by the driver per topology
// segment, let the scheduler SEE the free capacity and filter out the nodes that cannot fit the claim
// before it commits. Two nodes sit side by side, each with its local pool on the shelf below it. The
// scheduler is top-right, the pending Pod top-left. The capacity objects appear between them once the
// driver publishes. Overlay owns x<=380 & y<=300, so every block starts at x>=430.
const POD_X = 430, POD_Y = 46, POD_W = 210, POD_H = 96;
const POD_CX = POD_X + POD_W / 2, POD_BOTTOM = POD_Y + POD_H; // 535 / 142

const SCHED_X = 720, SCHED_Y = 48, SCHED_W = 360, SCHED_H = 90;
const SCHED_BOTTOM = SCHED_Y + SCHED_H;                       // 138

const NODE_Y = 250, NODE_W = 330, NODE_H = 120, NODE_BOTTOM = NODE_Y + NODE_H; // 370
const N1_X = 400, N2_X = 820;
const N1_CX = N1_X + NODE_W / 2, N2_CX = N2_X + NODE_W / 2;   // 565 / 985

const POOL_W = 170, POOL_H = 110, POOL_Y = 402, POOL_TOP = POOL_Y;

const CAP_W = 180, CAP_H = 50, CAP_Y = 178, CAP_BOTTOM = CAP_Y + CAP_H; // 228
const CAP_A_CX = 520, CAP_B_CX = 970;
const CHIPS_Y = 590;

const W_SCHED_N1 = [[760, SCHED_BOTTOM], [760, 236], [N1_CX, 236], [N1_CX, NODE_Y]];
const W_SCHED_N2 = [[985, SCHED_BOTTOM], [985, NODE_Y]];
const W_PROV_A = [[N1_CX, NODE_BOTTOM], [N1_CX, POOL_TOP]];
const W_PROV_B = [[N2_CX, NODE_BOTTOM], [N2_CX, POOL_TOP]];
const W_PUB_A = [[N1_CX, POOL_TOP], [N1_CX, 300], [CAP_A_CX, 300], [CAP_A_CX, CAP_BOTTOM]];
const W_PUB_B = [[N2_CX, POOL_TOP], [N2_CX, 300], [CAP_B_CX, 300], [CAP_B_CX, CAP_BOTTOM]];
const W_CAP_A_SCHED = [[CAP_A_CX + CAP_W / 2, CAP_Y + 25], [730, CAP_Y + 25], [730, SCHED_BOTTOM]];
const W_CAP_B_SCHED = [[CAP_B_CX, CAP_Y], [CAP_B_CX, SCHED_BOTTOM]];
const W_ASSIGN_N2 = [[POD_CX, POD_BOTTOM], [POD_CX, 236], [N2_CX, 236], [N2_CX, NODE_Y]];

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

function revealAt(el, ctx, delay = 0) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = '1'; return; }
  el.style.opacity = '0';
  ctx.register(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, delay, fill: 'forwards', easing: 'ease-out' }));
}

function dimAt(el, ctx, delay = 0, to = 0.4) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = String(to); return; }
  ctx.register(el.animate([{ opacity: 1 }, { opacity: to }], { duration: 420, delay, fill: 'forwards', easing: 'ease-out' }));
}

function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'ease-in-out' } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: -14, 'text-anchor': 'middle', 'data-cat': 'storage' }, [txt]);
  lbl.style.opacity = '0';
  lbl.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px)`;
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 160, fill: 'forwards', easing: 'ease-in' }));
}

function podBlock() {
  const shell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod app-0', sublabel: 'PVC needs 20Gi', containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: POD_X + 22, y: POD_Y + 42, w: POD_W - 44, h: 36, label: 'local storage', cat: 'storage' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
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
      'aria-label': 'CSI storage capacity tracking: without it the scheduler can place a Pod on a node whose local storage pool is already full and the Pod hangs in ContainerCreating because provisioning fails there, while CSIStorageCapacity objects published by the driver per topology segment let the scheduler see the free capacity and filter out nodes that cannot fit the claim before committing',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const podB  = podBlock();
    const sched = box({ x: SCHED_X, y: SCHED_Y, w: SCHED_W, h: SCHED_H, label: 'kube-scheduler', sublabel: 'filter and score', cat: 'storage' });
    const node1 = box({ x: N1_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'node-1', sublabel: 'local storage', cat: 'storage' });
    const node2 = box({ x: N2_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'node-2', sublabel: 'local storage', cat: 'storage' });

    const poolA = cylinder({ x: N1_CX - POOL_W / 2, y: POOL_Y, w: POOL_W, h: POOL_H, label: 'pool 5Gi free', cat: 'storage' });
    const poolB = cylinder({ x: N2_CX - POOL_W / 2, y: POOL_Y, w: POOL_W, h: POOL_H, label: 'pool 50Gi free', cat: 'storage' });

    const capA = box({ x: CAP_A_CX - CAP_W / 2, y: CAP_Y, w: CAP_W, h: CAP_H, label: 'CSIStorageCapacity', sublabel: 'node-1: 5Gi', cat: 'storage' });
    const capB = box({ x: CAP_B_CX - CAP_W / 2, y: CAP_Y, w: CAP_W, h: CAP_H, label: 'CSIStorageCapacity', sublabel: 'node-2: 50Gi', cat: 'storage' });
    capA.style.opacity = '0';
    capB.style.opacity = '0';

    const wSchedN1 = pathArrow({ points: W_SCHED_N1, dashed: true, dim: true, color: 'storage' });
    const wSchedN2 = pathArrow({ points: W_SCHED_N2, dashed: true, dim: true, color: 'storage' });
    const wProvA = pathArrow({ points: W_PROV_A, dashed: true, dim: true, color: 'storage' });
    const wProvB = pathArrow({ points: W_PROV_B, dashed: true, dim: true, color: 'storage' });
    const wPubA = pathArrow({ points: W_PUB_A, dashed: true, dim: true, color: 'storage' });
    const wPubB = pathArrow({ points: W_PUB_B, dashed: true, dim: true, color: 'storage' });
    const wCapASched = pathArrow({ points: W_CAP_A_SCHED, dashed: true, dim: true, color: 'storage' });
    const wCapBSched = pathArrow({ points: W_CAP_B_SCHED, dashed: true, dim: true, color: 'storage' });
    const wAssignN2 = pathArrow({ points: W_ASSIGN_N2, dashed: true, dim: true, color: 'storage' });
    [wSchedN1, wSchedN2].forEach(w => { w.style.opacity = '1'; });
    [wProvA, wProvB, wPubA, wPubB, wCapASched, wCapBSched, wAssignN2].forEach(w => { w.style.opacity = '0'; });

    const n1Lbl = text({ class: 'scheme-label code dim', x: N1_CX, y: POOL_Y - 12, 'text-anchor': 'middle' }, [' ']);
    const n2Lbl = text({ class: 'scheme-label code dim', x: N2_CX, y: POOL_Y - 12, 'text-anchor': 'middle' }, [' ']);

    const podChip  = valChip({ x: 110, y: CHIPS_Y, w: 260, h: 34, name: 'Pod', value: 'Pending', cat: 'storage' });
    const needChip = valChip({ x: 380, y: CHIPS_Y, w: 200, h: 34, name: 'claim', value: 'needs 20Gi', cat: 'storage' });
    const awareChip = valChip({ x: 590, y: CHIPS_Y, w: 260, h: 34, name: 'capacity-aware', value: 'no', cat: 'storage' });
    const resChip  = valChip({ x: 860, y: CHIPS_Y, w: 230, h: 34, name: 'result', value: 'unscheduled', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: blocks, then wires and their labels above them, then the chip strip, then the packet
    // layer on top so every ball rides above everything.
    [podB.group, sched, node1, node2, poolA, poolB, capA, capB].forEach(el => root.appendChild(el));
    [wSchedN1, wSchedN2, wProvA, wProvB, wPubA, wPubB, wCapASched, wCapBSched, wAssignN2, n1Lbl, n2Lbl].forEach(el => root.appendChild(el));
    [podChip, needChip, awareChip, resChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, podB: podB.group, podBox: podB.innerBox, sched, node1, node2, poolA, poolB, capA, capB,
      wProvA, wProvB, wPubA, wPubB, wCapASched, wCapBSched, wAssignN2, wSchedN1, wSchedN2,
      podChip, needChip, awareChip, resChip,
      wires: { n1: n1Lbl, n2: n2Lbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { pod, need, aware, res }) {
  setVal(s.refs.podChip, pod);
  setVal(s.refs.needChip, need);
  setVal(s.refs.awareChip, aware);
  setVal(s.refs.resChip, res);
}

function clearHL(s) {
  clearHighlights(s, ['sched', 'node1', 'node2', 'poolA', 'poolB', 'capA', 'capB', 'podBox',
    'podChip', 'needChip', 'awareChip', 'resChip'], [s.refs.podB]);
  s.refs.node1.style.opacity = '1';
  s.refs.poolA.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Pod needs a 20Gi volume from local storage, which can only be provisioned on the node the Pod lands on. Two nodes can take it, but node-1 has only 5Gi of pool left while node-2 has 50Gi. The scheduler cannot see any of that yet.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Pending', need: 'needs 20Gi', aware: 'no', res: 'unscheduled' });
      s.refs.podB.style.opacity = '0.55';
      s.refs.capA.style.opacity = '0';
      s.refs.capB.style.opacity = '0';
      [s.refs.wProvA, s.refs.wProvB, s.refs.wPubA, s.refs.wPubB, s.refs.wCapASched, s.refs.wCapBSched, s.refs.wAssignN2].forEach(w => { w.style.opacity = '0'; });
    },
  },
  {
    id: 'blind-schedule',
    duration: 3000,
    narration: 'Without capacity tracking the scheduler scores the nodes on cpu, memory and affinity only, and node-1 wins on those. It binds the Pod to node-1, having no idea that the local pool there is nearly empty. On paper this was a perfectly good choice.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'bound to node-1', need: 'needs 20Gi', aware: 'no', res: 'scheduling' });
      s.refs.podB.style.opacity = '0.55';
      s.refs.capA.style.opacity = '0';
      s.refs.capB.style.opacity = '0';
      s.refs.sched.classList.add('highlight');
      s.refs.node1.classList.add('highlight');
      if (ctx.reduced) return;
      const bind = routePacket(s, ctx, W_SCHED_N1, { cat: 'storage' });
      ridingLabel(s, ctx, 'bind app-0', W_SCHED_N1);
      lightBoxAt(s.refs.node1, ctx, bind.arrivalMs);
    },
  },
  {
    id: 'blind-fail',
    duration: 3200,
    narration: 'Now provisioning runs on node-1, and the pool has 5Gi against a 20Gi request. There is no room, so the volume is never created and the Pod is stuck in ContainerCreating. It cannot be moved either, because the binding already happened, so it hangs there indefinitely.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'stuck on node-1', need: 'needs 20Gi', aware: 'no', res: 'ContainerCreating' });
      s.refs.podB.style.opacity = '0.55';
      s.refs.capA.style.opacity = '0';
      s.refs.capB.style.opacity = '0';
      s.refs.wProvA.style.opacity = '1';
      s.refs.node1.classList.add('highlight');
      s.refs.poolA.classList.add('highlight');
      setWire(s, 'n1', '5Gi < 20Gi');
      if (ctx.reduced) return;
      const prov = routePacket(s, ctx, W_PROV_A, { cat: 'storage' });
      ridingLabel(s, ctx, 'provision fails', W_PROV_A);
      pulsePodDim(s.refs.podB, ctx, prov.arrivalMs + 200, { from: 0.55, peak: 0.8 });
    },
  },
  {
    id: 'publish',
    duration: 3200,
    narration: 'Turn on capacity tracking and the CSI driver publishes a CSIStorageCapacity object for each node, reporting the free space in its pool. node-1 advertises 5Gi, node-2 advertises 50Gi. These objects are readable cluster state the scheduler can consult.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Pending', need: 'needs 20Gi', aware: 'yes', res: 'rescheduling' });
      s.refs.podB.style.opacity = '0.55';
      s.refs.wPubA.style.opacity = '1';
      s.refs.wPubB.style.opacity = '1';
      s.refs.poolA.classList.add('highlight');
      s.refs.poolB.classList.add('highlight');
      s.refs.capA.style.opacity = '1';
      s.refs.capB.style.opacity = '1';
      s.refs.capA.classList.add('highlight');
      s.refs.capB.classList.add('highlight');
      if (ctx.reduced) return;
      s.refs.capA.style.opacity = '0';
      s.refs.capB.style.opacity = '0';
      const pa = routePacket(s, ctx, W_PUB_A, { cat: 'storage' });
      ridingLabel(s, ctx, '5Gi free', W_PUB_A);
      const pb = routePacket(s, ctx, W_PUB_B, { cat: 'storage' });
      ridingLabel(s, ctx, '50Gi free', W_PUB_B);
      revealAt(s.refs.capA, ctx, pa.arrivalMs);
      revealAt(s.refs.capB, ctx, pb.arrivalMs);
    },
  },
  {
    id: 'filter',
    duration: 3200,
    narration: 'This time the scheduler reads both capacity objects during its filter phase. node-1 cannot fit 20Gi in 5Gi, so it is filtered out before scoring even begins. node-2 has ample room and survives the filter, so it becomes the only candidate.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Pending', need: 'needs 20Gi', aware: 'yes', res: 'node-1 filtered out' });
      s.refs.podB.style.opacity = '0.55';
      s.refs.capA.style.opacity = '1';
      s.refs.capB.style.opacity = '1';
      s.refs.wCapASched.style.opacity = '1';
      s.refs.wCapBSched.style.opacity = '1';
      s.refs.sched.classList.add('highlight');
      s.refs.capB.classList.add('highlight');
      s.refs.node2.classList.add('highlight');
      setWire(s, 'n1', 'too small');
      setWire(s, 'n2', 'fits 20Gi');
      s.refs.node1.style.opacity = '0.4';
      s.refs.poolA.style.opacity = '0.4';
      if (ctx.reduced) return;
      // node-1 is at full opacity until the capacity read rejects it, so reset the start value below
      // the guard and let dimAt carry it down to the 0.4 pinned above.
      s.refs.node1.style.opacity = '1';
      s.refs.poolA.style.opacity = '1';
      const ra = routePacket(s, ctx, W_CAP_A_SCHED, { cat: 'storage' });
      const rb = routePacket(s, ctx, W_CAP_B_SCHED, { cat: 'storage' });
      lightBoxAt(s.refs.sched, ctx, Math.max(ra.arrivalMs, rb.arrivalMs));
      dimAt(s.refs.node1, ctx, ra.arrivalMs);
      dimAt(s.refs.poolA, ctx, ra.arrivalMs);
    },
  },
  {
    id: 'success',
    duration: 3400,
    narration: 'The scheduler binds the Pod to node-2, where the pool has room. Provisioning succeeds, the volume is mounted, and the Pod starts. Capacity tracking turned a permanent hang into a clean placement, simply by letting the scheduler look before it leaped.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Running on node-2', need: 'needs 20Gi', aware: 'yes', res: 'scheduled and mounted' });
      s.refs.capA.style.opacity = '1';
      s.refs.capB.style.opacity = '1';
      s.refs.wAssignN2.style.opacity = '1';
      s.refs.wProvB.style.opacity = '1';
      s.refs.node2.classList.add('highlight');
      s.refs.poolB.classList.add('highlight');
      s.refs.node1.style.opacity = '0.4';
      s.refs.poolA.style.opacity = '0.4';
      setWire(s, 'n2', 'provisioned');
      s.refs.podB.style.opacity = '1';
      if (ctx.reduced) { s.refs.podBox.classList.add('highlight'); return; }
      s.refs.podB.style.opacity = '0.55';
      const bind = routePacket(s, ctx, W_ASSIGN_N2, { cat: 'storage' });
      ridingLabel(s, ctx, 'bind app-0', W_ASSIGN_N2);
      const prov = routePacket(s, ctx, W_PROV_B, { delay: bind.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'provision ok', W_PROV_B, { delay: bind.arrivalMs + BEAT.afterHop });
      ctx.register(s.refs.podB.animate([{ opacity: 0.55 }, { opacity: 1 }], { duration: 460, delay: prov.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.podB, ctx, prov.arrivalMs);
      lightBoxAt(s.refs.podBox, ctx, prov.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
