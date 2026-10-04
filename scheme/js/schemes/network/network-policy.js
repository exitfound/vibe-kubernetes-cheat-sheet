import { P, F, defineCard, laneY, BEAT, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS/network-policy.md

// One road with a checkpoint at each end of it. A boundary is a BAR standing across the road, 100
// units out from the Pod whose boundary it is, and absent while that Pod is non-isolated.
// Everything below is derived from these literals.
const SCHEME_L = 40, SCHEME_R = 1160;   // content edges, mirrored about x=600
const FLOW_Y = 380;                     // the web-1 centre, and the axis the two lanes split about

const POD_W = 232, POD_H = 100;         // NET.L-01
const POD_INNER = { dx: 20, dy: 30, h: 46 };

const SRC_X = SCHEME_L;
const SRC_CX = SRC_X + POD_W / 2;       // 156
const SRC_Y = FLOW_Y - POD_H / 2;       // 330
const SRC_R = SRC_X + POD_W;            // 272
const SRC_B = SRC_Y + POD_H;            // 430

// The two lanes leave one face as a mirrored pair (L-12), and db-1 sits 12 low so the road is dead
// straight and still lands on its face midpoint: the main story carries no jog anywhere.
const LANE_DY = 12;
const { out: CACHE_LANE_Y, back: DB_LANE_Y } = laneY(FLOW_Y, LANE_DY);   // 368 upper, 392 lower

const DEST_X = SCHEME_R - POD_W;        // 928: db-1 flush right, so the road spans the full width
const DEST_CX = DEST_X + POD_W / 2;     // 1044
const DEST_Y = DB_LANE_Y - POD_H / 2;   // 342
const DEST_B = DEST_Y + POD_H;          // 442

// cache-1 rides a branch off the road rather than a second slot in the destination column: it is
// the Pod NOBODY ever selects, and what says so is that its lane carries no bar on any step.
const CACHE_X = 620, CACHE_CY = 220;
const CACHE_Y = CACHE_CY - POD_H / 2;   // 170
const CACHE_RISE_X = 520;

// A bar. 44 wide and POD_H tall, so it is a thing on the road rather than a rule about a face, and
// it carries no string at all: the road runs through it, and a block with ink in the middle is a
// block the road would have to cut. BAR_RUNUP 100 is what makes a refusal READABLE, measured off
// the shortest journey on the card: flush against the sender it would be 22 units of travel.
const BAR_W = 44, BAR_RUNUP = 100;
const BAR_Y = FLOW_Y - POD_H / 2 + 6;   // 336: centred between the two lanes at 368 and 392
const EG_X = SRC_R + BAR_RUNUP;                 // 372 .. 416
const IN_X = DEST_X - BAR_RUNUP - BAR_W;        // 784 .. 828
const EG_CX = EG_X + BAR_W / 2;         // 394: where a packet web-1 refuses dies
const IN_CX = IN_X + BAR_W / 2;         // 806
const BAR_CAP_Y = BAR_Y - 14;           // 322: the caption that names each bar, above both

// Both roads carry a WAYPOINT at the centre of every bar they meet. The points are collinear, so
// the drawn line is unchanged to the unit, and the road then terminates on each checkpoint instead
// of running past one: a checkpoint is a place the traffic arrives at, which is what L-10 says a
// block on a path has to be.
const LANE_DB = [[SRC_R, DB_LANE_Y], [EG_CX, DB_LANE_Y], [IN_CX, DB_LANE_Y], [DEST_X, DB_LANE_Y]];
const LANE_CACHE = [[SRC_R, CACHE_LANE_Y], [EG_CX, CACHE_LANE_Y], [CACHE_RISE_X, CACHE_LANE_Y], [CACHE_RISE_X, CACHE_CY], [CACHE_X, CACHE_CY]];
// Where a refused packet stops: INSIDE the bar that refused it. A ball that halts at the near edge
// of a bar flush on the face it left has travelled nothing and reads as a ball that never fired.
const LANE_DB_REFUSED = [[SRC_R, DB_LANE_Y], [EG_CX, DB_LANE_Y], [IN_CX, DB_LANE_Y]];
const LANE_CACHE_REFUSED = [[SRC_R, CACHE_LANE_Y], [EG_CX, CACHE_LANE_Y]];

// Each policy hangs off the Pod it selects and drops straight onto that face: a podSelector is a
// reference to a Pod, so the line lands on the Pod, and the bar it raised appears on the same step.
const POL_W = 180, POL_H = 72;
const POL_LOW_Y = 476, POL_LOW_B = POL_LOW_Y + POL_H;   // 548
const IN_POL_Y = CACHE_Y, IN_POL_B = IN_POL_Y + POL_H;  // 170 .. 242

const PLUG_W = 232, PLUG_H = 72;
const PLUG_X = 292, PLUG_R = PLUG_X + PLUG_W;           // 292 .. 524
const PLUG_CY = POL_LOW_Y + PLUG_H / 2;                 // 512
const PLUG_CX = PLUG_X + PLUG_W / 2;                    // 408

const SEL_EGRESS = [[SRC_CX, POL_LOW_Y], [SRC_CX, SRC_B]];
const SEL_INGRESS = [[DEST_CX, IN_POL_B], [DEST_CX, DEST_Y]];
// Enforcement, the same kind of line on the opposite axis. The right one leaves the plugin side
// face because the corridor at y=512 from 524 to 806 is empty and the riser at 806 meets the bar
// from below, so neither link crosses a lane and neither needs a detour around the canvas.
const PROG_EGRESS = [[EG_CX, POL_LOW_Y], [EG_CX, BAR_Y + POD_H]];
const PROG_INGRESS = [[PLUG_R, PLUG_CY], [IN_CX, PLUG_CY], [IN_CX, BAR_Y + POD_H]];

// Chip strip: three cells spanning SCHEME_L..SCHEME_R, so it centres on x=600. Each is sized for
// its own longest value, so re-run `render/chipfit.test.mjs` after any wording change here.
const CHIP_Y = 582, CHIP_H = 34, CHIP_GAP = 20;
const CHIP_W = [340, 350, 390];
const CHIP_X = CHIP_W.reduce((acc, w, i) => (i ? [...acc, acc[i - 1] + CHIP_W[i - 1] + CHIP_GAP] : [SCHEME_L]), []);

const NOTE_Y = POL_LOW_Y - 14;          // 462: the counterfactual caption, in the empty corridor

const workload = (key, x, y, label, role) => P.pod({
  key, innerKey: `${key}Box`, x, y, w: POD_W, h: POD_H,
  label, sublabel: role,
  inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: POD_W - POD_INNER.dx * 2, h: POD_INNER.h, label: 'app', sublabel: 'eth0' },
});

// Both policies are the same kind, so the label is the kind and the sublabel is the name plus the
// direction it puts in policyTypes. Each starts absent: the card creates its objects one step at a
// time and a Pod acquires a boundary only when one of them selects it.
const policy = (key, cx, y, sublabel) => P.box({ key, x: cx - POL_W / 2, y, w: POL_W, h: POL_H, label: 'NetworkPolicy', sublabel, opacity: 0 });

// The list order IS the append order, which is the z-order: blocks and Pods, then the bars, then
// the two dashed systems, then the lanes ON TOP of the bars so the road runs visibly through them,
// then the captions, the chips and the packet layer.
export const SCENE = {
  'aria-label': 'NetworkPolicy drawn as a checkpoint at each end of one road: while no policy selects them every Pod reaches every Pod and no road carries a checkpoint, a policy that selects a Pod for a direction raises one on that Pod in that direction and everything it does not explicitly allow dies there, an allow rule is what opens a hole in a checkpoint that was refusing everything, the same connection is then judged at two checkpoints that know nothing about each other so both the egress of the sender and the ingress of the receiver have to pass it, a Pod that no policy ever selected has no checkpoint of its own and still cannot be reached when the sender refuses at its, and both checkpoints are raised by the network plugin rather than by the API server',
  parts: [
    P.defs(),
    policy('npIngress', DEST_CX, IN_POL_Y, 'db-ingress · Ingress'),
    policy('npEgress', SRC_CX, POL_LOW_Y, 'web-egress · Egress'),
    P.box({ key: 'plugin', x: PLUG_X, y: POL_LOW_Y, w: PLUG_W, h: PLUG_H, label: 'Network plugin', sublabel: 'programs the dataplane' }),
    workload('src', SRC_X, SRC_Y, 'Pod web-1', 'role=web'),
    workload('db', DEST_X, DEST_Y, 'Pod db-1', 'role=db'),
    workload('cache', CACHE_X, CACHE_Y, 'Pod cache-1', 'role=cache'),
    P.box({ key: 'barEgress', x: EG_X, y: BAR_Y, w: BAR_W, h: POD_H, rx: 4, opacity: 0 }),
    P.box({ key: 'barIngress', x: IN_X, y: BAR_Y, w: BAR_W, h: POD_H, rx: 4, opacity: 0 }),
    // A podSelector is a reference and never traffic, so no selection line carries an arrowhead and
    // no ball ever rides one (A-06). The enforcement pair is the same kind of line, denser dashed.
    P.relation({ key: 'selIngress', points: SEL_INGRESS, dash: '5 5', opacity: 0 }),
    P.relation({ key: 'selEgress', points: SEL_EGRESS, dash: '5 5', opacity: 0 }),
    P.relation({ key: 'progEgress', points: PROG_EGRESS, dash: '2 6', opacity: 0 }),
    P.relation({ key: 'progIngress', points: PROG_INGRESS, dash: '2 6', opacity: 0 }),
    P.lane({ points: LANE_DB, dashed: true, dim: true }),
    P.lane({ points: LANE_CACHE, dashed: true, dim: true }),
    // A bar carries no string of its own, so its name rides above it and is written on exactly the
    // steps the bar is drawn on: a caption over an empty road names nothing.
    P.wire({ key: 'egCap', x: EG_CX, y: BAR_CAP_Y }),
    P.wire({ key: 'inCap', x: IN_CX, y: BAR_CAP_Y }),
    P.wire({ key: 'note', x: PLUG_CX, y: NOTE_Y }),
    P.chip({ key: 'egChip', x: CHIP_X[0], y: CHIP_Y, w: CHIP_W[0], h: CHIP_H, name: 'web-1 egress', value: 'no boundary' }),
    P.chip({ key: 'inChip', x: CHIP_X[1], y: CHIP_Y, w: CHIP_W[1], h: CHIP_H, name: 'db-1 ingress', value: 'no boundary' }),
    P.chip({ key: 'vChip', x: CHIP_X[2], y: CHIP_Y, w: CHIP_W[2], h: CHIP_H, name: 'verdict', value: 'allowed' }),
    P.packets(),
  ],
  reset: {
    keys: ['npIngress', 'npEgress', 'plugin', 'barEgress', 'barIngress', 'egChip', 'inChip', 'vChip', 'srcBox', 'dbBox', 'cacheBox'],
    pods: ['src', 'db', 'cache'],
  },
};

// Every bar, policy, caption and enforcement link is stated on EVERY step as a field, so a state
// one step set cannot survive into the next: this card turns on whether a checkpoint is there at
// all. An enforcement link is the MIN of the plugin and the bar it programs, because a link into a
// bar that does not exist yet points at nothing (A-05).
const gates = ({ egress = 0, ingress = 0, policies = 0, plugin = 1 }) => ({
  opacity: {
    barEgress: egress, barIngress: ingress, plugin,
    progEgress: Math.min(plugin, egress), progIngress: Math.min(plugin, ingress),
    npIngress: policies >= 1 ? 1 : 0, selIngress: policies >= 1 ? 1 : 0,
    npEgress: policies >= 2 ? 1 : 0, selEgress: policies >= 2 ? 1 : 0,
  },
  wires: { egCap: egress ? 'web-1 egress' : '', inCap: ingress ? 'db-1 ingress' : '', note: '' },
});
const NONE = 'no boundary';
const FROM_WEB = 'from role=web';
const TO_DB = 'to role=db';
// What the verdict reads while the call is still travelling: the rule chips are the premise and
// stand from entry, and the verdict turns over on the arrival or the drop that decides it (P-03).
const PENDING = { chips: { vChip: 'in flight' } };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { egChip: NONE, inChip: NONE, vChip: 'allowed' },
    ...gates({}),
  },
  {
    id: 'open',
    duration: 3400,
    narration: 'No policy selects any of these Pods, so no Pod has a boundary and nothing is refused anywhere. Both calls out of web-1 are served, the one to db-1 and the one to cache-1, and no rule exists anywhere that could have stopped either. This is the flat promise the network model opens with.',
    chips: { egChip: NONE, inChip: NONE, vChip: 'allowed' },
    ...gates({}),
    // The animated path says web-1 reached both by pulsing them, which no lights list can name.
    reducedLit: ['dbBox', 'cacheBox'],
    flow: [
      F.pulse({ pod: 'src' }),
      F.route({ points: LANE_DB, delay: BEAT.afterPulse, name: 'toDb' }),
      F.route({ points: LANE_CACHE, delay: BEAT.afterPulse, name: 'toCache' }),
      F.pulse({ pod: 'db', at: 'toDb' }),
      F.pulse({ pod: 'cache', at: 'toCache' }),
    ],
  },
  {
    id: 'isolate',
    duration: 3600,
    narration: 'A NetworkPolicy selects db-1 for Ingress. That selection is the whole act: a boundary now stands on the way into db-1, and everything the policy does not explicitly allow is dropped there. This one allows nothing yet, so the call from web-1 crosses the wire, reaches the boundary and dies inside it.',
    chips: { egChip: NONE, inChip: 'allows nothing', vChip: 'dropped at db-1' },
    ...gates({ ingress: 1, policies: 1 }),
    // The bar is lit from entry rather than cued on arrival: it exists from the moment the policy
    // selects the Pod, and the ball demonstrates what it does rather than revealing that it is there.
    lit: ['npIngress', 'barIngress', 'inChip', 'vChip'],
    rewind: PENDING,
    flow: [
      F.pulse({ pod: 'src' }),
      F.route({ points: LANE_DB_REFUSED, delay: BEAT.afterPulse, name: 'send' }),
      F.tag({ text: FROM_WEB, points: LANE_DB_REFUSED, delay: BEAT.afterPulse }),
      F.set({ at: 'send', chips: { vChip: 'dropped at db-1' } }),
    ],
  },
  {
    id: 'allow',
    duration: 3400,
    narration: 'The same policy gains one ingress rule, from podSelector role=web. Isolation and permission are two different things: selecting the Pod is what raised the boundary, and a rule is what opens a hole in one that was refusing everything. The same call passes through now, and db-1 answers it.',
    chips: { egChip: NONE, inChip: FROM_WEB, vChip: 'allowed' },
    ...gates({ ingress: 1, policies: 1 }),
    lit: ['npIngress', 'barIngress', 'inChip', 'vChip'],
    rewind: PENDING,
    flow: [
      F.pulse({ pod: 'src' }),
      F.route({ points: LANE_DB, delay: BEAT.afterPulse, name: 'send' }),
      F.tag({ text: FROM_WEB, points: LANE_DB, delay: BEAT.afterPulse }),
      F.pulse({ pod: 'db', at: 'send' }),
      F.set({ at: 'send', chips: { vChip: 'allowed' } }),
    ],
    reducedLit: ['dbBox'],
  },
  {
    id: 'both-ends',
    duration: 3600,
    narration: 'A second NetworkPolicy selects web-1 for Egress, so a boundary appears on the way out of web-1 as well. The same connection is judged twice now, at two boundaries that know nothing about each other: the egress rules of the sender, then the ingress rules of the receiver. Both allow it, so it stands.',
    chips: { egChip: TO_DB, inChip: FROM_WEB, vChip: 'allowed at both ends' },
    ...gates({ egress: 1, ingress: 1, policies: 2 }),
    lit: ['npEgress', 'barEgress', 'barIngress', 'egChip', 'vChip'],
    rewind: PENDING,
    flow: [
      F.pulse({ pod: 'src' }),
      F.route({ points: LANE_DB, delay: BEAT.afterPulse, name: 'send' }),
      F.tag({ text: FROM_WEB, points: LANE_DB, delay: BEAT.afterPulse }),
      F.pulse({ pod: 'db', at: 'send' }),
      F.set({ at: 'send', chips: { vChip: 'allowed at both ends' } }),
    ],
    reducedLit: ['dbBox'],
  },
  {
    id: 'either-side',
    duration: 3400,
    narration: 'Now the same sender calls cache-1, which no policy has ever selected: nothing stands on the way into it and it would take a connection from anyone. It still never happens. The egress rules on web-1 name role=db and nothing else, so the call dies in the boundary it has to leave through.',
    chips: { egChip: TO_DB, inChip: FROM_WEB, vChip: 'to cache-1 · dropped at web-1' },
    ...gates({ egress: 1, ingress: 1, policies: 2 }),
    lit: ['barEgress', 'egChip', 'vChip'],
    rewind: PENDING,
    // No riding tag: this ball travels 122 units, and a tag centred on it would rest across the
    // caption of the bar that is refusing it. What the bar is judging is the chip beside it.
    flow: [
      F.pulse({ pod: 'src' }),
      F.route({ points: LANE_CACHE_REFUSED, delay: BEAT.afterPulse, name: 'stop' }),
      F.set({ at: 'stop', chips: { vChip: 'to cache-1 · dropped at web-1' } }),
    ],
  },
  {
    id: 'implementer',
    duration: 3800,
    narration: 'Neither boundary belongs to the API server. A network plugin watches NetworkPolicy objects and programs the dataplane, and both boundaries here are its work. Where nothing implements NetworkPolicy the API server stores both objects and reports success, no boundary is ever raised, and both calls are served exactly as they were before either object existed.',
    chips: { egChip: NONE, inChip: NONE, vChip: 'nothing enforced' },
    ...gates({ policies: 2, plugin: OPACITY.notready }),
    wires: { egCap: '', inCap: '', note: 'where nothing implements NetworkPolicy' },
    // Both objects stay bright: the API server accepted them and they exist. The picture under them
    // is `open` again, which is the whole claim of the step.
    lit: ['npIngress', 'npEgress', 'egChip', 'inChip', 'vChip'],
    reducedLit: ['dbBox', 'cacheBox'],
    flow: [
      F.pulse({ pod: 'src' }),
      F.route({ points: LANE_DB, delay: BEAT.afterPulse, name: 'toDb' }),
      F.route({ points: LANE_CACHE, delay: BEAT.afterPulse, name: 'toCache' }),
      F.pulse({ pod: 'db', at: 'toDb' }),
      F.pulse({ pod: 'cache', at: 'toCache' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
