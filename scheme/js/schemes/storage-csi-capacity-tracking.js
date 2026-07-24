import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, pulsePod, pulsePodDim, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT, FADE,
} from '../lib/storage-kit.js';

// CSI Storage Capacity. With local or topology-constrained storage the scheduler can pick a node whose
// storage pool is already full. Provisioning of the volume then fails there, and because the Pod cannot
// bind until its volume does, it never schedules and stays Pending forever. CSIStorageCapacity objects,
// published by the driver per topology segment, let the scheduler SEE the free capacity and filter out
// the nodes that cannot fit the claim before it commits.
//
// ---- Horizontal composition ----
// Two nodes mirrored about the canvas centre: NODE_CX = [CX - SPREAD, CX + SPREAD] with CX = 600,
// derived from the node width and gap rather than typed. Each frame HOLDS its capacity object and its
// pool, so the frames carry content instead of framing empty canvas. Content spans 195..1005, margins
// 195 a side. The earlier pass ran 400..1150, centre 775.
//
// The scheduler and the pending Pod stack on the centre line above the nodes, because there is one
// scheduler and one Pod and the whole question is which of the two symmetric nodes they pick.
//
// ---- Narration overlay ----
// Measured (tools/overlay-measure.mjs), overlay bottom-right in viewBox units:
//   1920x900  right 102  bottom 183
//   1600x1000 right 291  bottom 143
//   1280x900  right 378  bottom 173
//   1100x900  right 397  bottom 149
// Worst case x <= 397 and y <= 183. The scheduler (y 36) and the Pod (y 136) both sit inside that y
// band, so both start at x >= 400. Everything from the node row down (y >= 300) clears the overlay
// entirely. A longer narration than the ones below would invalidate this measurement.
//
// PULSE MODEL: only the Pod pulses, and it is a wrapping g. The scheduler, the node frames, the
// capacity objects and the pools are infrastructure: they light via .highlight on packet arrival and
// never pulse. On the failure step the Pod never went Ready, so it takes pulsePodDim with an opacity
// lift or the blink is invisible against the dim it sits at.
//
// WIRES: the card has ZERO wire crossings. Each capacity read leaves the node frame through its TOP
// edge at the node centre, rises straight up and enters the scheduler through the side midpoint facing
// it. The read and the bind lane never appear in the same step, so sharing the node-centre column is
// fine, and the reads clear the Pod on the centre line, so the two are exact mirrors that cross nothing. The publish lane rises from the pool to the
// object on the column axis (offset by LANE so it meets the object beside its Bound centre rather than
// on it), while the provision lane drops down the inner margin at PROV_INSET, outboard of the capacity
// object, and enters the pool through its side face, so the two never share a segment.
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

// The pool and the capacity object both live INSIDE their node frame, the pool above and the object
// below it. An earlier pass hung the pools outside and below the frames, which left each frame a
// mostly empty 400 by 180 box with one small block floating at its bottom, and the emptiness read as
// a missing element rather than as a boundary.
//
// The pool sits ABOVE the object rather than below it so that BOTH lanes inside a node can run down
// the column centre line: bind arrives at the node top, provisioning drops straight into the pool,
// and the pool publishes straight down into the object. With the object on top, provisioning had to
// detour around it and met the node frame 170 units off its edge midpoint, which reads as a lane
// stopping at a random point on an edge rather than as an arrival.
const POOL_W = 168, POOL_H = 84, POOL_Y = 336;
const POOL_TOP = POOL_Y, POOL_BOTTOM = POOL_Y + POOL_H;                      // 336 / 420

const CAP_W = 300, CAP_H = 50, CAP_Y = 472;
const CAP_TOP = CAP_Y;                                                       // 472

const CAPTION_Y = (POOL_BOTTOM + CAP_TOP) / 2 + 4;   // 450, centred in the gap it labels
const CHIPS_Y = 588;

// Each static wire and its ball share ONE points array, so they cannot drift apart. Every endpoint is
// a block edge midpoint.
const W_DECIDE = [[CX, SCHED_BOTTOM], [CX, POD_Y]];
// The bind leaves the Pod through its SIDE (left edge for the left node, right edge for the right one),
// runs out to the node centre line and drops into the node top. So the arrow exits the Pod on the side
// facing its node rather than from underneath.
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

// Lights an infrastructure block ON PACKET ARRIVAL rather than at step entry, via a zero-effect
// animation whose onfinish sets the class. Under reduced motion it applies immediately so the static
// end-state stays correct. This is how a box receives a packet without pulsing.
function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
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
const FILTERED = 0.4;
function dimAt(el, ctx, delay = 0, to = FILTERED) {
  if (!el) return;
  // A filtered element loses its highlight as it dims: it is no longer a live candidate, so its glow
  // must go as the fade completes, not linger at reduced opacity.
  if (ctx.reduced || delay <= 0) { el.style.opacity = String(to); el.classList.remove('highlight'); return; }
  const a = el.animate([{ opacity: 1 }, { opacity: to }], { duration: FADE.in, delay, fill: 'forwards', easing: 'ease-out' });
  a.onfinish = () => el.classList.remove('highlight');
  ctx.register(a);
}

// A tag that rides ALONG with the ball on the same path, timing and easing, so the packet visibly
// carries what the step narrates. Balls are routePacket (eased), so the label defaults to the same
// ease-in-out and the same routeDur, or it would drift off the ball mid-flight.
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

// The wrapping g is not optional. pulsePod finds its targets with querySelectorAll, which matches
// descendants only and never the element itself, so pulsing a bare pod() would catch its
// .scheme-pod-rect child but not the group, and the pulse would silently fire at half strength.
function podBlock() {
  const cy = POD_Y + POD_H / 2;
  const shell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod app-0', sublabel: 'needs 20Gi', containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: POD_X + 16, y: cy - 21, w: POD_W - 32, h: 42, label: 'app', sublabel: 'local disk', cat: 'storage' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

const lane = points => pathArrow({ points, dashed: true, dim: true, color: 'storage' });

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'CSI storage capacity tracking: without it the scheduler can pick a node whose local storage pool is already full, provisioning of the volume fails there, and because binding waits on provisioning the Pod never schedules and stays Pending forever, while CSIStorageCapacity objects published by the driver per topology segment let the scheduler see the free capacity and filter out nodes that cannot fit the claim before committing',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const sched = box({ x: SCHED_X, y: SCHED_Y, w: SCHED_W, h: SCHED_H, label: 'Kube-scheduler', sublabel: 'filter and score', cat: 'storage' });
    const podB = podBlock();

    const nodes = NODE_X.map((x, i) => node({ x, y: NODE_Y, w: NODE_W, h: NODE_H, label: `node-${i + 1}` }));

    const caps = NODE_CX.map((cx, i) => {
      const b = box({
        x: cx - CAP_W / 2, y: CAP_Y, w: CAP_W, h: CAP_H,
        label: 'CSIStorageCapacity', sublabel: i === 0 ? 'node-1: 5Gi' : 'node-2: 50Gi', cat: 'storage',
      });
      b.style.opacity = '0';   // no capacity object exists until the driver publishes one
      return b;
    });

    const pools = NODE_CX.map((cx, i) => {
      const c = cylinder({ x: cx - POOL_W / 2, y: POOL_Y, w: POOL_W, h: POOL_H, label: i === 0 ? 'Pool 5Gi free' : 'Pool 50Gi free', cat: 'storage' });
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

    // CHIP_W 232 is the storage family default. Worst case here is 'result' + 'scheduled and mounted'
    // at 27 characters, and .scheme-chip-text runs 6.89 viewBox units per character, so 27 * 6.89 + 24
    // of padding is 210 against the 232 available.
    const CHIP_W = 232, CHIP_GAP = 16;
    const CHIPS_W = CHIP_W * 4 + CHIP_GAP * 3;                  // 976
    const CHIPS_X = CX - CHIPS_W / 2;                           // 112, so the strip centres on CX
    const chipX = i => CHIPS_X + i * (CHIP_W + CHIP_GAP);
    const podChip   = valChip({ x: chipX(0), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'Pod',            value: 'Pending',      cat: 'storage' });
    const needChip  = valChip({ x: chipX(1), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'claim',          value: 'needs 20Gi',   cat: 'storage' });
    const awareChip = valChip({ x: chipX(2), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'capacity-aware', value: 'no',           cat: 'storage' });
    const resChip   = valChip({ x: chipX(3), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'result',         value: 'unscheduled',  cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): the node frames, then the scheduler and pools and capacity objects,
    // then the Pod, then the lanes and their captions, then the chip strip, then the packet layer so
    // every ball rides above everything.
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

// A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
// holds the previous step's text at call time (clearHL clears the class, not the text) and steps are
// always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
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
const POD_DIM = 0.55;

// The scheduler-decision walk (decide ball -> Pod pulse -> bind ball) is paced deliberately slower than
// routeDur would pick, so the beat reads clearly: the ball glides in, the Pod takes its full pulse, and
// only then does the bind ball leave (it departs BEAT.afterPulse later, after the 900ms blink lands).
// These explicit durs are why this card sits on the check-canon ALLOW_EXPLICIT_DUR list. READ_DUR
// likewise slows the capacity-read balls up from the node tops so the reported numbers read calmly.
const DECIDE_DUR = 850, BIND_DUR = 1000, READ_DUR = 1000;

// Pins the visibility of EVERY element born or dimmed mid-story, and of every lane, exactly as
// setChips pins every chip. A lane into an object that does not exist points at nothing, so lanes are
// pinned to 0 rather than left at whatever the previous step set.
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
    narration: 'A Pod needs a 20Gi volume from local storage, which can only be provisioned on the node the Pod lands on. Two nodes can take it, but node-1 has only 5Gi of pool left while node-2 has 50Gi. The scheduler cannot see any of that yet.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Pending', need: 'needs 20Gi', aware: 'no', res: 'unscheduled' });
      setStage(s);
      s.refs.podB.style.opacity = String(POD_DIM);
    },
  },
  {
    id: 'blind-schedule',
    duration: 4300,
    narration: 'Without capacity tracking the scheduler scores the nodes on cpu, memory and affinity only, and node-1 wins on those. It selects node-1 for the Pod, having no idea that the local pool there is nearly empty. On paper this was a perfectly good choice.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'node-1 selected', need: 'needs 20Gi', aware: 'no', res: 'scheduling' });
      setStage(s, { lanes: ['wDecide', 'bind1'] });
      s.refs.podB.style.opacity = String(POD_DIM);
      // The scheduler is where the ball departs from, so it is lit at step entry: a ball must never
      // leave an unlit block or it reads as coming from nowhere. node-1 is the receiver.
      s.refs.sched.classList.add('highlight');
      if (ctx.reduced) { s.refs.node1.classList.add('highlight'); return; }
      const decide = routePacket(s, ctx, W_DECIDE, { delay: BEAT.lead, dur: DECIDE_DUR, cat: 'storage' });
      // The scheduler's decision lands ON the Pod (down-arrow), so the Pod takes its full pulse on
      // arrival. It is only being scheduled, not Running, so it stays dim and needs the dim variant with
      // an opacity lift or the blink is invisible against the 0.55 it sits at.
      pulsePodDim(s.refs.podB, ctx, decide.arrivalMs, { from: POD_DIM, peak: 0.9 });
      // The bind ball leaves only AFTER that pulse has played out (BEAT.afterPulse), never mid-blink.
      const pts = wBind(NODE_CX[0]);
      const bindAt = decide.arrivalMs + BEAT.afterPulse;
      const bind = routePacket(s, ctx, pts, { delay: bindAt, dur: BIND_DUR, cat: 'storage' });
      // The tag rides the BIND hop, and shares its dur so it stays locked to the ball.
      ridingLabel(s, ctx, 'assign app-0 to node-1', pts, { delay: bindAt, dur: BIND_DUR });
      lightBoxAt(s.refs.node1, ctx, bind.arrivalMs);
    },
  },
  {
    id: 'blind-fail',
    duration: 3600,
    narration: 'Provisioning is now triggered on node-1, where the pool has 5Gi against a 20Gi request. There is no room, so the volume is never created and the claim stays unbound. The Pod cannot bind until its volume does, so it never schedules and sits Pending, and with no capacity signal the scheduler keeps landing back on node-1, so it hangs there indefinitely.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Pending', need: 'needs 20Gi', aware: 'no', res: 'provision fails' });
      setStage(s, { lanes: ['prov1'] });
      s.refs.podB.style.opacity = String(POD_DIM);
      s.refs.node1.classList.add('highlight');
      setWire(s, 'n1', '5Gi against 20Gi');
      if (ctx.reduced) { s.refs.pool1.classList.add('highlight'); return; }
      const pts = wProv(NODE_CX[0]);
      const prov = routePacket(s, ctx, pts, { delay: BEAT.lead, cat: 'storage' });
      ridingLabel(s, ctx, 'provision fails', pts, { delay: BEAT.lead });
      lightBoxAt(s.refs.pool1, ctx, prov.arrivalMs);
      // The Pod never went Ready, so it stays dim and needs the dim variant with an opacity lift or
      // the blink is invisible against the 0.55 it sits at.
      pulsePodDim(s.refs.podB, ctx, prov.arrivalMs, { from: POD_DIM, peak: 0.9 });
    },
  },
  {
    id: 'publish',
    duration: 3600,
    narration: 'Turn on capacity tracking and the CSI driver publishes a CSIStorageCapacity object for each node, reporting the free space in its pool. node-1 advertises 5Gi, node-2 advertises 50Gi. These objects are readable cluster state the scheduler can consult.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Pending', need: 'needs 20Gi', aware: 'yes', res: 'rescheduling' });
      setStage(s, { caps: [1, 1], lanes: ['pub1', 'pub2'] });
      s.refs.podB.style.opacity = String(POD_DIM);
      // The pools are where the balls depart from, so both are lit at step entry.
      s.refs.pool1.classList.add('highlight');
      s.refs.pool2.classList.add('highlight');
      if (ctx.reduced) { s.refs.cap1.classList.add('highlight'); s.refs.cap2.classList.add('highlight'); return; }
      setStage(s, { caps: [0, 0], lanes: ['pub1', 'pub2'] });
      // Both drivers publish independently and simultaneously, so the two balls leave on one beat.
      [0, 1].forEach(i => {
        const pts = wPub(NODE_CX[i]);
        const pub = routePacket(s, ctx, pts, { delay: BEAT.lead, cat: 'storage' });
        ridingLabel(s, ctx, i === 0 ? '5Gi free' : '50Gi free', pts, { delay: BEAT.lead });
        revealAt(s.refs[`cap${i + 1}`], ctx, pub.arrivalMs);
        lightBoxAt(s.refs[`cap${i + 1}`], ctx, pub.arrivalMs);
      });
    },
  },
  {
    id: 'filter',
    duration: 3800,
    narration: 'This time the scheduler reads both capacity objects during its filter phase. node-1 cannot fit 20Gi in 5Gi, so it is filtered out before scoring even begins. node-2 has ample room and survives the filter, so it becomes the only candidate.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Pending', need: 'needs 20Gi', aware: 'yes', res: 'node-1 filtered out' });
      // node-1 is filtered out, so its WHOLE subtree (frame, pool, capacity object) ends dimmed and
      // unlit. Only node-2, the survivor, keeps its capacity object highlighted.
      setStage(s, { caps: [FILTERED, 1], nodes: [FILTERED, 1], pools: [FILTERED, 1], lanes: ['read1', 'read2'] });
      s.refs.podB.style.opacity = String(POD_DIM);
      s.refs.cap2.classList.add('highlight');
      setWire(s, 'n1', 'too small');
      setWire(s, 'n2', 'fits 20Gi');
      if (ctx.reduced) { s.refs.sched.classList.add('highlight'); return; }
      // Animated: everything starts full and both capacity objects light as senders, then node-1's whole
      // subtree dims on its read arrival and cap1 loses its glow (dimAt clears the highlight on finish).
      setStage(s, { caps: [1, 1], nodes: [1, 1], pools: [1, 1], lanes: ['read1', 'read2'] });
      s.refs.cap1.classList.add('highlight');
      const reads = [0, 1].map(i => routePacket(s, ctx, wRead(i), { delay: BEAT.lead, dur: READ_DUR, cat: 'storage' }));
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
    narration: 'The scheduler binds the Pod to node-2, where the pool has room. Provisioning succeeds, the volume is mounted, and the Pod starts. Capacity tracking turned a permanent hang into a clean placement, simply by letting the scheduler look before it leaped.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Running on node-2', need: 'needs 20Gi', aware: 'yes', res: 'scheduled and mounted' });
      setStage(s, { caps: [FILTERED, 1], nodes: [FILTERED, 1], pools: [FILTERED, 1], lanes: ['wDecide', 'bind2', 'prov2'] });
      s.refs.sched.classList.add('highlight');
      s.refs.node2.classList.add('highlight');
      setWire(s, 'n2', 'provisioned');
      s.refs.podB.style.opacity = '1';
      if (ctx.reduced) { s.refs.podBox.classList.add('highlight'); s.refs.pool2.classList.add('highlight'); return; }
      s.refs.podB.style.opacity = String(POD_DIM);
      const decide = routePacket(s, ctx, W_DECIDE, { delay: BEAT.lead, dur: DECIDE_DUR, cat: 'storage' });
      // Same scheduling beat as step 1: the decision lands on the Pod, the Pod takes its full pulse (dim,
      // since it is only scheduled here), and the bind ball leaves only after the pulse plays out.
      pulsePodDim(s.refs.podB, ctx, decide.arrivalMs, { from: POD_DIM, peak: 0.9 });
      const bindAt = decide.arrivalMs + BEAT.afterPulse;
      const bindPts = wBind(NODE_CX[1]);
      const bind = routePacket(s, ctx, bindPts, { delay: bindAt, dur: BIND_DUR, cat: 'storage' });
      ridingLabel(s, ctx, 'assign app-0 to node-2', bindPts, { delay: bindAt, dur: BIND_DUR });
      const provPts = wProv(NODE_CX[1]);
      const provAt = bind.arrivalMs + BEAT.afterHop;
      const prov = routePacket(s, ctx, provPts, { delay: provAt, cat: 'storage' });
      ridingLabel(s, ctx, 'provision ok', provPts, { delay: provAt });
      lightBoxAt(s.refs.pool2, ctx, prov.arrivalMs);
      ctx.register(s.refs.podB.animate([{ opacity: POD_DIM }, { opacity: 1 }], { duration: FADE.in, delay: prov.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.podB, ctx, prov.arrivalMs);
      lightBoxAt(s.refs.podBox, ctx, prov.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
