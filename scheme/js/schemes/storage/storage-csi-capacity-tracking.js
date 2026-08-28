import { P, F, defineCard, BEAT, FADE, OPACITY, STO, chipStrip } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-csi-capacity-tracking


const CX = 600;

const SCHED_X = 400, SCHED_Y = 36, SCHED_W = 400, SCHED_H = 68;
const SCHED_LEFT = SCHED_X, SCHED_RIGHT = SCHED_X + SCHED_W;                 // 400 / 800
const SCHED_MY = SCHED_Y + SCHED_H / 2, SCHED_BOTTOM = SCHED_Y + SCHED_H;    // 70 / 104

const POD_W = 160, POD_H = 100, POD_Y = 148;
const POD_X = CX - POD_W / 2, POD_MY = POD_Y + POD_H / 2;                    // 520 / 198

const NODE_W = 360, NODE_GAP = 180, NODE_Y = 300, NODE_H = 236;
const NODE_TOP = NODE_Y;  // 300
const SPREAD = (NODE_W + NODE_GAP) / 2;                                      // 270
const NODE_CX = [CX - SPREAD, CX + SPREAD];                                  // 330 / 870
const NODE_X = NODE_CX.map(cx => cx - NODE_W / 2);                           // 150 / 690

const POOL_W = 168, POOL_H = 84, POOL_Y = 336;
const POOL_TOP = POOL_Y, POOL_BOTTOM = POOL_Y + POOL_H;                      // 336 / 420

const CAP_W = 300, CAP_H = 50, CAP_Y = 472;
const CAP_TOP = CAP_Y;                                                       // 472

const CAPTION_Y = (POOL_BOTTOM + CAP_TOP) / 2 + 4;   // 450, centred in the gap it labels
const CHIPS_Y = 588;
const CHIPS = chipStrip();                           // family default 232/16, so the strip centres on CX

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

const W_BIND = NODE_CX.map(wBind);
const W_PROV = NODE_CX.map(wProv);
const W_PUB = NODE_CX.map(wPub);
const W_READ = [wRead(0), wRead(1)];

const lane = (key, points, opacity) => P.lane({ key, points, dashed: true, dim: true, opacity });

// The list order IS the append order, which is the z-order: frames, blocks and disks, then the Pod
// above its own frame, then the lanes and their captions, then the chip strip, then the packets.
export const SCENE = {
  'aria-label': 'CSI storage capacity tracking: without it the Scheduler can pick a Node whose local storage pool is already full, provisioning of the volume fails there, and because binding waits on provisioning the Pod never schedules and stays Pending forever, while CSIStorageCapacity objects, one per topology segment, report the free space and let the Scheduler filter out Nodes that cannot fit the claim before committing',
  parts: [
    P.defs(),
    P.node({ key: 'node1', x: NODE_X[0], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'node2', x: NODE_X[1], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2' }),
    P.box({ key: 'sched', x: SCHED_X, y: SCHED_Y, w: SCHED_W, h: SCHED_H, label: 'Scheduler', sublabel: 'filter and score' }),
    // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse
    // is not part of the visible front face. Re-centre on the face, derived from the height.
    P.cylinder({ key: 'pool1', x: NODE_CX[0] - POOL_W / 2, y: POOL_Y, w: POOL_W, h: POOL_H, label: 'Pool 5Gi free', labelY: POOL_H / 2 + 10 }),
    P.cylinder({ key: 'pool2', x: NODE_CX[1] - POOL_W / 2, y: POOL_Y, w: POOL_W, h: POOL_H, label: 'Pool 50Gi free', labelY: POOL_H / 2 + 10 }),
    // No capacity object exists until the driver publishes one.
    P.box({ key: 'cap1', x: NODE_CX[0] - CAP_W / 2, y: CAP_Y, w: CAP_W, h: CAP_H, label: 'CSIStorageCapacity', sublabel: 'node-1: 5Gi', opacity: 0 }),
    P.box({ key: 'cap2', x: NODE_CX[1] - CAP_W / 2, y: CAP_Y, w: CAP_W, h: CAP_H, label: 'CSIStorageCapacity', sublabel: 'node-2: 50Gi', opacity: 0 }),
    P.pod({
      key: 'podB', innerKey: 'podBox',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod app-0', sublabel: 'needs 20Gi', containers: 0,
      inner: { dx: 16, dy: POD_H / 2 - 21, w: POD_W - 32, h: 42, label: 'app', sublabel: 'local disk' },
    }),
    lane('wDecide', W_DECIDE),
    lane('bind1', W_BIND[0], 0),
    lane('bind2', W_BIND[1], 0),
    lane('prov1', W_PROV[0], 0),
    lane('prov2', W_PROV[1], 0),
    lane('pub1', W_PUB[0], 0),
    lane('pub2', W_PUB[1], 0),
    lane('read1', W_READ[0], 0),
    lane('read2', W_READ[1], 0),
    P.wire({ key: 'n1', x: NODE_CX[0], y: CAPTION_Y }),
    P.wire({ key: 'n2', x: NODE_CX[1], y: CAPTION_Y }),
    P.chip({ key: 'podChip', x: CHIPS.x(0), y: CHIPS_Y, w: CHIPS.w, h: STO.CHIP_H, name: 'Pod', value: 'Pending' }),
    P.chip({ key: 'needChip', x: CHIPS.x(1), y: CHIPS_Y, w: CHIPS.w, h: STO.CHIP_H, name: 'claim', value: 'needs 20Gi' }),
    P.chip({ key: 'awareChip', x: CHIPS.x(2), y: CHIPS_Y, w: CHIPS.w, h: STO.CHIP_H, name: 'capacity-aware', value: 'no' }),
    P.chip({ key: 'resChip', x: CHIPS.x(3), y: CHIPS_Y, w: CHIPS.w, h: STO.CHIP_H, name: 'result', value: 'unscheduled' }),
    P.packets(),
  ],
  reset: {
    keys: ['sched', 'node1', 'node2', 'cap1', 'cap2', 'pool1', 'pool2', 'podBox',
      'podChip', 'needChip', 'awareChip', 'resChip'],
    pods: ['podB'],
  },
};

// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a card
// comes to claim it is capacity-aware on the step that is still explaining the blind path.
const chips = (pod, need, aware, res) => ({ podChip: pod, needChip: need, awareChip: aware, resChip: res });

const DECIDE_DUR = 850, BIND_DUR = 1000, READ_DUR = 1000;

// A provisioning tag enters through the node frame TOP edge, which cuts its glyphs at the default
// -14, and on `success` it also lands on the bind tag parked there: -40 clears both (./CARDS.md).
const PROV_TAG_DY = -40;
// The two reads run into the scheduler side edges at -14: -38 carries them over its top edge instead.
const READ_TAG_DY = -38;

// STO.S-01 as a field: every element born or removed mid-story, and every lane, is pinned on every
// step. The Pod is dim until it actually reaches Running.
const LANES = ['wDecide', 'bind1', 'bind2', 'prov1', 'prov2', 'pub1', 'pub2', 'read1', 'read2'];
const stage = ({ caps = [0, 0], nodes = [1, 1], pools = [1, 1], lanes = [], pod = OPACITY.pending } = {}) => ({
  cap1: caps[0], cap2: caps[1],
  node1: nodes[0], node2: nodes[1],
  pool1: pools[0], pool2: pools[1],
  ...Object.fromEntries(LANES.map(k => [k, lanes.includes(k) ? 1 : 0])),
  podB: pod,
});

// A rejected node dims when the read that rejects it lands, not at step entry, and `unlight` takes
// its glow with the fade, since a filtered candidate must not linger lit at reduced opacity.
const dim = (target) => F.fade({
  target, to: OPACITY.notready, dur: FADE.in, at: 'read1',
  fill: 'forwards', easing: 'ease-out', unlight: [target],
});

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('Pending', 'needs 20Gi', 'no', 'unscheduled'),
    opacity: stage(),
  },
  {
    id: 'blind-schedule',
    duration: 4300,
    narration: 'Without capacity tracking the Scheduler scores the Nodes on cpu, memory and affinity only, and Node-1 wins on those. Node-1 is written down as the chosen one, with no idea that the local pool there is nearly empty. On paper this was a perfectly good choice.',
    chipsCued: chips('node-1 selected', 'needs 20Gi', 'no', 'scheduling'),
    opacity: stage({ lanes: ['wDecide', 'bind1'] }),
    // The scheduler is where the ball departs from, so it is lit at step entry: a ball must never
    // leave an unlit block or it reads as coming from nowhere. node-1 is the receiver.
    lit: ['sched'],
    flow: [
      F.route({ points: W_DECIDE, delay: BEAT.lead, dur: DECIDE_DUR, name: 'decide' }),
      F.pulse({ pod: 'podB', dim: true, at: 'decide', from: OPACITY.pending, peak: 0.9 }),
      // The bind ball leaves only AFTER that pulse has played out (BEAT.afterPulse), never mid-blink.
      // The tag rides the BIND hop, and shares its dur so it stays locked to the ball.
      F.route({ points: W_BIND[0], at: 'decide', plus: BEAT.afterPulse, dur: BIND_DUR, name: 'bind' }),
      F.tag({ text: 'assign app-0 to node-1', points: W_BIND[0], at: 'decide', plus: BEAT.afterPulse, dur: BIND_DUR }),
      F.light({ targets: ['node1'], at: 'bind' }),
    ],
  },
  {
    id: 'blind-fail',
    duration: 3600,
    narration: 'Provisioning is now triggered on Node-1, where the pool has 5Gi against a 20Gi request. There is no room, so the volume is never created and the claim stays unbound. The Pod cannot bind until its volume does, so it never schedules and sits Pending, and with no capacity signal the Node choice is reset and the Scheduler keeps landing back on Node-1.',
    chipsCued: chips('Pending', 'needs 20Gi', 'no', 'provision fails'),
    wires: { n1: '5Gi against 20Gi' },
    opacity: stage({ lanes: ['prov1'] }),
    lit: ['node1'],
    flow: [
      F.route({ points: W_PROV[0], delay: BEAT.lead, name: 'prov' }),
      F.tag({ text: 'provision fails', points: W_PROV[0], delay: BEAT.lead, dy: PROV_TAG_DY }),
      F.light({ targets: ['pool1'], at: 'prov' }),
      // The Pod never went Ready, so it stays dim and needs the dim variant with an opacity lift or
      // the blink is invisible against the 0.55 it sits at.
      F.pulse({ pod: 'podB', dim: true, at: 'prov', from: OPACITY.pending, peak: 0.9 }),
    ],
  },
  {
    id: 'publish',
    duration: 3600,
    narration: 'Turn on capacity tracking, which means storageCapacity true on the CSIDriver, and a CSIStorageCapacity object appears for each Node, reporting the free space in its pool. Node-1 advertises 5Gi, Node-2 advertises 50Gi. These objects are readable cluster state the Scheduler can consult.',
    chipsCued: chips('Pending', 'needs 20Gi', 'yes', 'rescheduling'),
    opacity: stage({ caps: [1, 1], lanes: ['pub1', 'pub2'] }),
    // The pools are where the balls depart from, so both are lit at step entry.
    lit: ['pool1', 'pool2'],
    // The reduced path ends with both capacity objects present. The animated one starts before they
    // exist and reveals each on its own arrival.
    rewind: { opacity: { cap1: 0, cap2: 0 } },
    // Both drivers publish independently and simultaneously, so the two balls leave on one beat.
    flow: [
      F.route({ points: W_PUB[0], delay: BEAT.lead, name: 'pub1' }),
      F.tag({ text: '5Gi free', points: W_PUB[0], delay: BEAT.lead }),
      F.reveal({ target: 'cap1', at: 'pub1' }),
      F.light({ targets: ['cap1'], at: 'pub1' }),
      F.route({ points: W_PUB[1], delay: BEAT.lead, name: 'pub2' }),
      F.tag({ text: '50Gi free', points: W_PUB[1], delay: BEAT.lead }),
      F.reveal({ target: 'cap2', at: 'pub2' }),
      F.light({ targets: ['cap2'], at: 'pub2' }),
    ],
  },
  {
    id: 'filter',
    duration: 3800,
    narration: 'This time the Scheduler reads both capacity objects during its filter phase, which it does for a claim whose class binds on WaitForFirstConsumer. Node-1 cannot fit 20Gi in 5Gi, so it is filtered out before scoring even begins. Node-2 has ample room and survives the filter, so it becomes the only candidate.',
    chipsCued: chips('Pending', 'needs 20Gi', 'yes', 'node-1 filtered out'),
    wires: { n1: 'too small', n2: 'fits 20Gi' },
    // node-1 is filtered out, so its WHOLE subtree (frame, pool, capacity object) ends dimmed and
    // unlit. Only node-2, the survivor, keeps its capacity object highlighted.
    opacity: stage({ caps: [OPACITY.notready, 1], nodes: [OPACITY.notready, 1], pools: [OPACITY.notready, 1], lanes: ['read1', 'read2'] }),
    lit: ['cap2'],
    // Animated: everything starts full and both capacity objects light as senders, then node-1's whole
    // subtree dims on its read arrival and cap1 loses its glow as the fade finishes.
    rewind: { opacity: { cap1: 1, node1: 1, pool1: 1 }, lit: ['cap1'] },
    // The two reads are mirror images and share READ_DUR, so they land on the same millisecond: the
    // scheduler's cue hangs off either one of them.
    flow: [
      F.route({ points: W_READ[0], delay: BEAT.lead, dur: READ_DUR, name: 'read1' }),
      F.route({ points: W_READ[1], delay: BEAT.lead, dur: READ_DUR }),
      F.tag({ text: 'only 5Gi', points: W_READ[0], delay: BEAT.lead, dur: READ_DUR, dy: READ_TAG_DY }),
      F.tag({ text: '50Gi free', points: W_READ[1], delay: BEAT.lead, dur: READ_DUR, dy: READ_TAG_DY }),
      F.light({ targets: ['sched'], at: 'read1' }),
      dim('node1'),
      dim('pool1'),
      dim('cap1'),
    ],
  },
  {
    id: 'success',
    duration: 5500,
    narration: 'The Scheduler selects Node-2, where the pool has room. Provisioning succeeds there, so the Pod is bound to the Node, the volume is mounted, and the Pod starts. Capacity tracking turned blind retries into a clean placement, simply by letting the Scheduler look before it leaped.',
    chipsCued: chips('Running on node-2', 'needs 20Gi', 'yes', 'scheduled and mounted'),
    wires: { n2: 'provisioned' },
    opacity: stage({ caps: [OPACITY.notready, 1], nodes: [OPACITY.notready, 1], pools: [OPACITY.notready, 1], lanes: ['wDecide', 'bind2', 'prov2'], pod: 1 }),
    lit: ['sched', 'node2'],
    // The Pod only reaches full opacity when provisioning lands, so the animated path starts it dim.
    rewind: { opacity: { podB: OPACITY.pending } },
    // Same scheduling beat as step 1: the decision lands on the Pod, the Pod takes its full pulse (dim,
    // since it is only scheduled here), and the bind ball leaves only after the pulse plays out.
    flow: [
      F.route({ points: W_DECIDE, delay: BEAT.lead, dur: DECIDE_DUR, name: 'decide' }),
      F.pulse({ pod: 'podB', dim: true, at: 'decide', from: OPACITY.pending, peak: 0.9 }),
      F.route({ points: W_BIND[1], at: 'decide', plus: BEAT.afterPulse, dur: BIND_DUR, name: 'bind' }),
      F.tag({ text: 'assign app-0 to node-2', points: W_BIND[1], at: 'decide', plus: BEAT.afterPulse, dur: BIND_DUR }),
      F.route({ points: W_PROV[1], after: 'bind', name: 'prov' }),
      F.tag({ text: 'provision ok', points: W_PROV[1], after: 'bind', dy: PROV_TAG_DY }),
      F.light({ targets: ['pool2'], at: 'prov' }),
      F.fade({ target: 'podB', from: OPACITY.pending, to: 1, dur: FADE.in, at: 'prov', fill: 'forwards', easing: 'ease-out' }),
      F.pulse({ pod: 'podB', at: 'prov' }),
      F.light({ targets: ['podBox'], at: 'prov' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
