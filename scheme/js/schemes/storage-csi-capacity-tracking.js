import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, cylinder, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, pulsePodDim, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, FADE, lightBoxAt, makeRidingLabel, OPACITY } from '../lib/storage-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#storage-csi-capacity-tracking


const CX = 600;

const SCHED_X = 400, SCHED_Y = 36, SCHED_W = 400, SCHED_H = 68;
const SCHED_LEFT = SCHED_X, SCHED_RIGHT = SCHED_X + SCHED_W;                 // 400 / 800
const SCHED_MY = SCHED_Y + SCHED_H / 2, SCHED_BOTTOM = SCHED_Y + SCHED_H;    // 70 / 104

const POD_W = 160, POD_H = 100, POD_Y = 148;
const POD_X = CX - POD_W / 2, POD_MY = POD_Y + POD_H / 2;                    // 520 / 198

const NODE_W = 360, NODE_GAP = 180, NODE_Y = 300, NODE_H = 236;
const NODE_TOP = NODE_Y, NODE_BOTTOM = NODE_Y + NODE_H;                      // 300 / 536
const SPREAD = (NODE_W + NODE_GAP) / 2;                                      // 270
const NODE_CX = [CX - SPREAD, CX + SPREAD];                                  // 330 / 870
const NODE_X = NODE_CX.map(cx => cx - NODE_W / 2);                           // 150 / 690

const POOL_W = 168, POOL_H = 84, POOL_Y = 336;
const POOL_TOP = POOL_Y, POOL_BOTTOM = POOL_Y + POOL_H;                      // 336 / 420

const CAP_W = 300, CAP_H = 50, CAP_Y = 472;
const CAP_TOP = CAP_Y;                                                       // 472

const CAPTION_Y = (POOL_BOTTOM + CAP_TOP) / 2 + 4;   // 450, centred in the gap it labels
const CHIPS_Y = 588;

// Each static wire and its ball share ONE points array, so they cannot drift apart. Every endpoint is
// a block edge midpoint.
const W_DECIDE = [[CX, SCHED_BOTTOM], [CX, POD_Y]];
const wBind = (cx) => {
  const side = cx < CX ? POD_X : POD_X + POD_W;
  return [[side, POD_MY], [cx, POD_MY], [cx, NODE_TOP]];
};
const wProv = cx => [[cx, NODE_TOP], [cx, POOL_TOP]];
const wPub  = cx => [[cx, POOL_BOTTOM], [cx, CAP_TOP]];
// The capacity read leaves the node frame through its TOP edge at the node centre, rises straight up
// and enters the scheduler through the side facing it. i=0 exits left, i=1 mirrors it exactly.
function wRead(i) {
  const topX = NODE_CX[i];
  const schedEdge = i === 0 ? SCHED_LEFT : SCHED_RIGHT;
  return [[topX, NODE_TOP], [topX, SCHED_MY], [schedEdge, SCHED_MY]];
}

// A capacity object materialises when the publish that creates it lands, so no arrowhead is ever
// aimed at nothing. LAND_MS is shorter than BEAT.lead for the same reason.
const LAND_MS = 500;
function revealAt(el, ctx, delay = 0) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = '1'; return; }
  el.style.opacity = '0';
  ctx.register(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: LAND_MS, delay, fill: 'forwards', easing: 'ease-out' }));
}

// A node that the filter rejects dims when the read that rejects it lands, not at step entry.
function dimAt(el, ctx, delay = 0, to = OPACITY.notready) {
  if (!el) return;
  // A filtered element loses its highlight as it dims: it is no longer a live candidate, so its glow
  // must go as the fade completes, not linger at reduced opacity.
  if (ctx.reduced || delay <= 0) { el.style.opacity = String(to); el.classList.remove('highlight'); return; }
  const a = el.animate([{ opacity: 1 }, { opacity: to }], { duration: FADE.in, delay, fill: 'forwards', easing: 'ease-out' });
  a.onfinish = () => el.classList.remove('highlight');
  ctx.register(a);
}

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

function podBlock() {
  const cy = POD_Y + POD_H / 2;
  const shell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod app-0', sublabel: 'needs 20Gi', containers: 0, role: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: POD_X + 16, y: cy - 21, w: POD_W - 32, h: 42, label: 'app', sublabel: 'local disk', role: 'storage' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

const lane = points => pathArrow({ points, dashed: true, dim: true, role: 'storage' });

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'CSI storage capacity tracking: without it the scheduler can pick a Node whose local storage pool is already full, provisioning of the volume fails there, and because binding waits on provisioning the Pod never schedules and stays Pending forever, while CSIStorageCapacity objects published by the driver per topology segment let the scheduler see the free capacity and filter out Nodes that cannot fit the claim before committing',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const sched = box({ x: SCHED_X, y: SCHED_Y, w: SCHED_W, h: SCHED_H, label: 'Scheduler', sublabel: 'filter and score', role: 'storage' });
    const podB = podBlock();

    const nodes = NODE_X.map((x, i) => node({ x, y: NODE_Y, w: NODE_W, h: NODE_H, label: `Node-${i + 1}` }));

    const caps = NODE_CX.map((cx, i) => {
      const b = box({
        x: cx - CAP_W / 2, y: CAP_Y, w: CAP_W, h: CAP_H,
        label: 'CSIStorageCapacity', sublabel: i === 0 ? 'node-1: 5Gi' : 'node-2: 50Gi', role: 'storage',
      });
      b.style.opacity = '0';   // no capacity object exists until the driver publishes one
      return b;
    });

    const pools = NODE_CX.map((cx, i) => {
      const c = cylinder({ x: cx - POOL_W / 2, y: POOL_Y, w: POOL_W, h: POOL_H, label: i === 0 ? 'Pool 5Gi free' : 'Pool 50Gi free', role: 'storage' });
      // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse
      // is not part of the visible front face. Re-centre on the face, derived from the height.
      const l = c.querySelector('.scheme-cylinder-label');
      if (l) l.setAttribute('y', POOL_H / 2 + 10);
      return c;
    });

    const wDecide = lane(W_DECIDE);
    const bindWires = NODE_CX.map(cx => lane(wBind(cx)));
    const provWires = NODE_CX.map(cx => lane(wProv(cx)));
    const pubWires  = NODE_CX.map(cx => lane(wPub(cx)));
    const readWires = [0, 1].map(i => lane(wRead(i)));
    [...bindWires, ...provWires, ...pubWires, ...readWires].forEach(w => { w.style.opacity = '0'; });

    const poolLbls = NODE_CX.map(cx => text({ class: 'scheme-label code dim', x: cx, y: CAPTION_Y, 'text-anchor': 'middle' }, [' ']));

    const CHIP_W = 232, CHIP_GAP = 16;
    const CHIPS_W = CHIP_W * 4 + CHIP_GAP * 3;                  // 976
    const CHIPS_X = CX - CHIPS_W / 2;                           // 112, so the strip centres on CX
    const chipX = i => CHIPS_X + i * (CHIP_W + CHIP_GAP);
    const podChip   = valChip({ x: chipX(0), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'Pod',            value: 'Pending',      role: 'storage' });
    const needChip  = valChip({ x: chipX(1), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'claim',          value: 'needs 20Gi',   role: 'storage' });
    const awareChip = valChip({ x: chipX(2), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'capacity-aware', value: 'no',           role: 'storage' });
    const resChip   = valChip({ x: chipX(3), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'result',         value: 'unscheduled',  role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    [...nodes, sched, ...pools, ...caps, podB.group].forEach(el => root.appendChild(el));
    [wDecide, ...bindWires, ...provWires, ...pubWires, ...readWires, ...poolLbls].forEach(el => root.appendChild(el));
    [podChip, needChip, awareChip, resChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, sched, podB: podB.group, podBox: podB.innerBox,
      node1: nodes[0], node2: nodes[1], cap1: caps[0], cap2: caps[1], pool1: pools[0], pool2: pools[1],
      wDecide, bind1: bindWires[0], bind2: bindWires[1],
      prov1: provWires[0], prov2: provWires[1],
      pub1: pubWires[0], pub2: pubWires[1], read1: readWires[0], read2: readWires[1],
      podChip, needChip, awareChip, resChip,
      wires: { n1: poolLbls[0], n2: poolLbls[1] },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}

// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a card
// comes to claim it is capacity-aware on the step that is still explaining the blind path.
function setChips(s, { pod, need, aware, res }) {
  setChip(s.refs.podChip, pod);
  setChip(s.refs.needChip, need);
  setChip(s.refs.awareChip, aware);
  setChip(s.refs.resChip, res);
}

// The Pod is dim until it actually reaches Running.

const DECIDE_DUR = 850, BIND_DUR = 1000, READ_DUR = 1000;

function setStage(s, { caps = [0, 0], nodes = [1, 1], pools = [1, 1], lanes = [] } = {}) {
  s.refs.cap1.style.opacity = String(caps[0]);
  s.refs.cap2.style.opacity = String(caps[1]);
  s.refs.node1.style.opacity = String(nodes[0]);
  s.refs.node2.style.opacity = String(nodes[1]);
  s.refs.pool1.style.opacity = String(pools[0]);
  s.refs.pool2.style.opacity = String(pools[1]);
  const all = ['wDecide', 'bind1', 'bind2', 'prov1', 'prov2', 'pub1', 'pub2', 'read1', 'read2'];
  all.forEach(k => { s.refs[k].style.opacity = lanes.includes(k) ? '1' : '0'; });
}

function clearHL(s) {
  clearHighlights(s, ['sched', 'node1', 'node2', 'cap1', 'cap2', 'pool1', 'pool2', 'podBox',
    'podChip', 'needChip', 'awareChip', 'resChip'], [s.refs.podB]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Pod needs a 20Gi volume from local storage, which can only be provisioned on the Node the Pod lands on. Two Nodes can take it, but Node-1 has only 5Gi of pool left while Node-2 has 50Gi. The scheduler cannot see any of that yet.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Pending', need: 'needs 20Gi', aware: 'no', res: 'unscheduled' });
      setStage(s);
      s.refs.podB.style.opacity = String(OPACITY.pending);
    },
  },
  {
    id: 'blind-schedule',
    duration: 4300,
    narration: 'Without capacity tracking the scheduler scores the Nodes on cpu, memory and affinity only, and Node-1 wins on those. It selects Node-1 for the Pod, having no idea that the local pool there is nearly empty. On paper this was a perfectly good choice.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'node-1 selected', need: 'needs 20Gi', aware: 'no', res: 'scheduling' });
      setStage(s, { lanes: ['wDecide', 'bind1'] });
      s.refs.podB.style.opacity = String(OPACITY.pending);
      // The scheduler is where the ball departs from, so it is lit at step entry: a ball must never
      // leave an unlit block or it reads as coming from nowhere. node-1 is the receiver.
      s.refs.sched.classList.add('highlight');
      if (ctx.reduced) { s.refs.node1.classList.add('highlight'); return; }
      const decide = routePacket(s, ctx, W_DECIDE, { delay: BEAT.lead, dur: DECIDE_DUR, role: 'storage' });
      pulsePodDim(s.refs.podB, ctx, decide.arrivalMs, { from: OPACITY.pending, peak: 0.9 });
      // The bind ball leaves only AFTER that pulse has played out (BEAT.afterPulse), never mid-blink.
      const pts = wBind(NODE_CX[0]);
      const bindAt = decide.arrivalMs + BEAT.afterPulse;
      const bind = routePacket(s, ctx, pts, { delay: bindAt, dur: BIND_DUR, role: 'storage' });
      // The tag rides the BIND hop, and shares its dur so it stays locked to the ball.
      ridingLabel(s, ctx, 'assign app-0 to node-1', pts, { delay: bindAt, dur: BIND_DUR });
      lightBoxAt(s.refs.node1, ctx, bind.arrivalMs);
    },
  },
  {
    id: 'blind-fail',
    duration: 3600,
    narration: 'Provisioning is now triggered on Node-1, where the pool has 5Gi against a 20Gi request. There is no room, so the volume is never created and the claim stays unbound. The Pod cannot bind until its volume does, so it never schedules and sits Pending, and with no capacity signal the Node choice is reset and the scheduler keeps landing back on Node-1.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Pending', need: 'needs 20Gi', aware: 'no', res: 'provision fails' });
      setStage(s, { lanes: ['prov1'] });
      s.refs.podB.style.opacity = String(OPACITY.pending);
      s.refs.node1.classList.add('highlight');
      setWire(s, 'n1', '5Gi against 20Gi');
      if (ctx.reduced) { s.refs.pool1.classList.add('highlight'); return; }
      const pts = wProv(NODE_CX[0]);
      const prov = routePacket(s, ctx, pts, { delay: BEAT.lead, role: 'storage' });
      ridingLabel(s, ctx, 'provision fails', pts, { delay: BEAT.lead });
      lightBoxAt(s.refs.pool1, ctx, prov.arrivalMs);
      // The Pod never went Ready, so it stays dim and needs the dim variant with an opacity lift or
      // the blink is invisible against the 0.55 it sits at.
      pulsePodDim(s.refs.podB, ctx, prov.arrivalMs, { from: OPACITY.pending, peak: 0.9 });
    },
  },
  {
    id: 'publish',
    duration: 3600,
    narration: 'Turn on capacity tracking and a CSIStorageCapacity object appears for each Node, published by the driver from the free space in its pool. Node-1 advertises 5Gi, Node-2 advertises 50Gi. These objects are readable cluster state the scheduler can consult.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Pending', need: 'needs 20Gi', aware: 'yes', res: 'rescheduling' });
      setStage(s, { caps: [1, 1], lanes: ['pub1', 'pub2'] });
      s.refs.podB.style.opacity = String(OPACITY.pending);
      // The pools are where the balls depart from, so both are lit at step entry.
      s.refs.pool1.classList.add('highlight');
      s.refs.pool2.classList.add('highlight');
      if (ctx.reduced) { s.refs.cap1.classList.add('highlight'); s.refs.cap2.classList.add('highlight'); return; }
      setStage(s, { caps: [0, 0], lanes: ['pub1', 'pub2'] });
      // Both drivers publish independently and simultaneously, so the two balls leave on one beat.
      [0, 1].forEach(i => {
        const pts = wPub(NODE_CX[i]);
        const pub = routePacket(s, ctx, pts, { delay: BEAT.lead, role: 'storage' });
        ridingLabel(s, ctx, i === 0 ? '5Gi free' : '50Gi free', pts, { delay: BEAT.lead });
        revealAt(s.refs[`cap${i + 1}`], ctx, pub.arrivalMs);
        lightBoxAt(s.refs[`cap${i + 1}`], ctx, pub.arrivalMs);
      });
    },
  },
  {
    id: 'filter',
    duration: 3800,
    narration: 'This time the scheduler reads both capacity objects during its filter phase. Node-1 cannot fit 20Gi in 5Gi, so it is filtered out before scoring even begins. Node-2 has ample room and survives the filter, so it becomes the only candidate.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Pending', need: 'needs 20Gi', aware: 'yes', res: 'node-1 filtered out' });
      // node-1 is filtered out, so its WHOLE subtree (frame, pool, capacity object) ends dimmed and
      // unlit. Only node-2, the survivor, keeps its capacity object highlighted.
      setStage(s, { caps: [OPACITY.notready, 1], nodes: [OPACITY.notready, 1], pools: [OPACITY.notready, 1], lanes: ['read1', 'read2'] });
      s.refs.podB.style.opacity = String(OPACITY.pending);
      s.refs.cap2.classList.add('highlight');
      setWire(s, 'n1', 'too small');
      setWire(s, 'n2', 'fits 20Gi');
      if (ctx.reduced) { s.refs.sched.classList.add('highlight'); return; }
      // Animated: everything starts full and both capacity objects light as senders, then node-1's whole
      // subtree dims on its read arrival and cap1 loses its glow (dimAt clears the highlight on finish).
      setStage(s, { caps: [1, 1], nodes: [1, 1], pools: [1, 1], lanes: ['read1', 'read2'] });
      s.refs.cap1.classList.add('highlight');
      const reads = [0, 1].map(i => routePacket(s, ctx, wRead(i), { delay: BEAT.lead, dur: READ_DUR, role: 'storage' }));
      ridingLabel(s, ctx, 'only 5Gi', wRead(0), { delay: BEAT.lead, dur: READ_DUR });
      ridingLabel(s, ctx, '50Gi free', wRead(1), { delay: BEAT.lead, dur: READ_DUR });
      lightBoxAt(s.refs.sched, ctx, Math.max(reads[0].arrivalMs, reads[1].arrivalMs));
      dimAt(s.refs.node1, ctx, reads[0].arrivalMs);
      dimAt(s.refs.pool1, ctx, reads[0].arrivalMs);
      dimAt(s.refs.cap1, ctx, reads[0].arrivalMs);
    },
  },
  {
    id: 'success',
    duration: 5500,
    narration: 'The scheduler selects Node-2, where the pool has room. Provisioning succeeds there, so the Pod is bound to the Node, the volume is mounted, and the Pod starts. Capacity tracking turned blind retries into a clean placement, simply by letting the scheduler look before it leaped.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Running on node-2', need: 'needs 20Gi', aware: 'yes', res: 'scheduled and mounted' });
      setStage(s, { caps: [OPACITY.notready, 1], nodes: [OPACITY.notready, 1], pools: [OPACITY.notready, 1], lanes: ['wDecide', 'bind2', 'prov2'] });
      s.refs.sched.classList.add('highlight');
      s.refs.node2.classList.add('highlight');
      setWire(s, 'n2', 'provisioned');
      s.refs.podB.style.opacity = '1';
      if (ctx.reduced) { s.refs.podBox.classList.add('highlight'); s.refs.pool2.classList.add('highlight'); return; }
      s.refs.podB.style.opacity = String(OPACITY.pending);
      const decide = routePacket(s, ctx, W_DECIDE, { delay: BEAT.lead, dur: DECIDE_DUR, role: 'storage' });
      // Same scheduling beat as step 1: the decision lands on the Pod, the Pod takes its full pulse (dim,
      // since it is only scheduled here), and the bind ball leaves only after the pulse plays out.
      pulsePodDim(s.refs.podB, ctx, decide.arrivalMs, { from: OPACITY.pending, peak: 0.9 });
      const bindAt = decide.arrivalMs + BEAT.afterPulse;
      const bindPts = wBind(NODE_CX[1]);
      const bind = routePacket(s, ctx, bindPts, { delay: bindAt, dur: BIND_DUR, role: 'storage' });
      ridingLabel(s, ctx, 'assign app-0 to node-2', bindPts, { delay: bindAt, dur: BIND_DUR });
      const provPts = wProv(NODE_CX[1]);
      const provAt = bind.arrivalMs + BEAT.afterHop;
      const prov = routePacket(s, ctx, provPts, { delay: provAt, role: 'storage' });
      ridingLabel(s, ctx, 'provision ok', provPts, { delay: provAt });
      lightBoxAt(s.refs.pool2, ctx, prov.arrivalMs);
      ctx.register(s.refs.podB.animate([{ opacity: OPACITY.pending }, { opacity: 1 }], { duration: FADE.in, delay: prov.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.podB, ctx, prov.arrivalMs);
      lightBoxAt(s.refs.podBox, ctx, prov.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
