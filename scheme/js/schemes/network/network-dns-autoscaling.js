import { P, F, defineCard, shade, BEAT, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS/network-dns-autoscaling.md


// AN INSTRUMENT, not a path: the subject is a COUNT that follows another count, so the card is two
// axis meters either side of one spine and a replica row under them. No Pod stands on this canvas
// (see the record): the replicas are a reading, and six Pod shells would put six pulsing actors on
// a card whose whole argument is arithmetic.
const CONTENT_L = 60, CONTENT_R = 1140;
const CX = 600;                              // the spine the two actors and the write rail share

// The three actors are NET.L-01 exactly: 232 by 80.
const BOX_W = 232, BOX_H = 80;
const BOX_X = CX - BOX_W / 2;                // 484..716
const API_Y = 60,  API_B = API_Y + BOX_H;    // 60..140
const AUTO_Y = 240, AUTO_B = AUTO_Y + BOX_H; // 240..320

// The poll is a round trip, so it takes a lane PAIR mirrored about the top face midpoint (L-12):
// the request climbs at 588 and the counts come back down at 612.
const LANE_DX = 12;
const POLL_UP   = [[CX - LANE_DX, AUTO_Y], [CX - LANE_DX, API_B]];
const POLL_DOWN = [[CX + LANE_DX, API_B], [CX + LANE_DX, AUTO_Y]];

// THE METERS, and the reading is a LENGTH: a counted cell is DRAWN and an uncounted one is not, so
// the two axes compare the way a reader compares two rows. A cell is 40 by 22 at a 48 pitch inside
// a TROUGH, which is what says where the cells that are not there would go (C-14). Eight cells and
// not six because the card never fills more than six, so the track cannot be read as a cap and this
// card states no `max`. Separating the two states by OPACITY instead is measured and fails: see
// WHY NOT in the record.
const SLOTS = 8, CELL_W = 40, CELL_H = 22, CELL_GAP = 8;
const PITCH = CELL_W + CELL_GAP;                            // 48
const ROW_W = SLOTS * CELL_W + (SLOTS - 1) * CELL_GAP;      // 376
const TROUGH_PAD = 6;
const TRACK_W = ROW_W + 2 * TROUGH_PAD;                     // 388
const TRACK_H = CELL_H + 2 * TROUGH_PAD;                    // 34
const NODES_X = CONTENT_L;                    // trough 60..448
const CORES_X = CONTENT_R - TRACK_W;          // trough 752..1140
const MET_Y = 368;                            // 368..402, well under the deepest panel reading
const CELL_Y = MET_Y + TROUGH_PAD;            // 374..396
const MET_LBL_Y = 356;                        // the per-step arithmetic, centred over its own track
const cellX = (base, i) => base + i * PITCH;

// The Deployment is the third trough, and a FRAME rather than a labelled block: `box()` prints its
// label on the vertical centre, which is exactly where the row stands. The name is a P.tag above
// its top-left corner instead, clear of the rail that lands on the top face midpoint.
const DEP_W = 450, DEP_H = 60;
const DEP_X = CX - DEP_W / 2, DEP_Y = 452;    // 375..825 x 452..512
const REP_X = CX - ROW_W / 2;                 // 412..788, the same width and pitch as the meters
const REP_Y = DEP_Y + (DEP_H - CELL_H) / 2;   // 471..493
const DEP_TAG_X = 470, DEP_TAG_Y = 442;

// The write runs straight down the spine, between the two meters and into the frame top face.
const WRITE = [[CX, AUTO_B], [CX, DEP_Y]];

// Nine chips in two rows over the full content span, each width sized to its own longest string:
// `preventSinglePointFailure` and `includeUnschedulableNodes` ink past a 255 chip on their names
// alone, so the two rows are laid by hand rather than by one `strip`.
const CHIP_H = 34, ROW1_Y = 546, ROW2_Y = 586;
const R1 = [150, 250, 250, 370];
const R2 = [370, 200, 150, 150, 130];
const lay = (widths, gap = 20) => {
  let x = CONTENT_L;
  return widths.map((w) => { const at = x; x += w + gap; return { x: at, w }; });
};
const C1 = lay(R1), C2 = lay(R2);

// One row of cells. A cell is born undrawn and a step draws the ones its reading counts.
const cellRow = (prefix, base, y) =>
  Array.from({ length: SLOTS }, (_, i) =>
    P.box({ key: prefix + i, x: cellX(base, i), y, w: CELL_W, h: CELL_H, rx: 3, opacity: 0 }));

// The reading of one row as an opacity set: the first `n` cells are drawn and the rest are not.
// Every step states all 24 cells this way, which is the shape P-01 asks of a chip.
const KEYS = (prefix) => Array.from({ length: SLOTS }, (_, i) => prefix + i);
const N_KEYS = KEYS('n'), C_KEYS = KEYS('c'), R_KEYS = KEYS('r');
const read = (keys, n) => ({ ...shade(keys.slice(0, n), 1), ...shade(keys.slice(n), 0) });
const meters = (nodes, cores, reps) => ({
  ...read(N_KEYS, nodes), ...read(C_KEYS, cores), ...read(R_KEYS, reps),
});

// The list order IS the append order, which is the z-order: the two actors, the two meter tracks,
// the Deployment frame and its replica row, then the lanes with their captions, then the chips,
// then the packet layer so the ball rides above everything.
export const SCENE = {
  'aria-label': 'DNS horizontal autoscaling: a separate kube-dns-autoscaler Deployment polls the API server for the Node and core counts of the cluster and reads a parameter set from a ConfigMap, then the linear control pattern divides each count by its own per-replica figure, rounds both up and keeps the larger, clamps the result with min and with preventSinglePointFailure, and writes it to the scale subresource of the CoreDNS Deployment, so the replica row grows as the cluster grows, while the ladder pattern answers the same two counts from two step tables instead',
  parts: [
    P.defs(),
    P.box({ key: 'api', x: BOX_X, y: API_Y, w: BOX_W, h: BOX_H, label: 'API server', sublabel: 'Node objects and their cores' }),
    P.box({ key: 'auto', x: BOX_X, y: AUTO_Y, w: BOX_W, h: BOX_H, label: 'kube-dns-autoscaler', sublabel: 'cluster-proportional-autoscaler' }),
    // The two troughs stand at `notready` on every step and are never written: they are where the
    // cells that are not drawn would go, which is the hole C-14 asks a card not to leave.
    P.box({ key: 'nTrack', x: NODES_X, y: MET_Y, w: TRACK_W, h: TRACK_H, opacity: OPACITY.notready }),
    P.box({ key: 'cTrack', x: CORES_X, y: MET_Y, w: TRACK_W, h: TRACK_H, opacity: OPACITY.notready }),
    ...cellRow('n', NODES_X + TROUGH_PAD, CELL_Y),
    ...cellRow('c', CORES_X + TROUGH_PAD, CELL_Y),
    // The Deployment is the third trough. It carries no label of its own: its name is the tag above
    // its top-left corner, and the row inside it is the reading.
    P.box({ key: 'deploy', x: DEP_X, y: DEP_Y, w: DEP_W, h: DEP_H }),
    ...cellRow('r', REP_X, REP_Y),
    P.tag({ x: DEP_TAG_X, y: DEP_TAG_Y, text: 'Deployment coredns' }),
    // The poll pair and the write rail. All three are ridden on some step, so all three are lanes
    // and none is dimmed on the steps that leave it idle: a lane says `not yet` with its caption.
    P.arrow({ from: POLL_UP[0], to: POLL_UP[1], dashed: true, dim: true }),
    P.arrow({ from: POLL_DOWN[0], to: POLL_DOWN[1], dashed: true, dim: true }),
    P.arrow({ from: WRITE[0], to: WRITE[1], dashed: true, dim: true }),
    // True on every step, so they are standing captions and not step labels.
    P.tag({ x: 500, y: 172, text: 'list, watch nodes' }),
    P.tag({ x: 690, y: 345, text: 'deployments/scale' }),
    // What comes DOWN changes between the counts and the ConfigMap, so that one is per step.
    P.wire({ key: 'back', x: 700, y: 208 }),
    // The two readings, each centred over its own track.
    P.wire({ key: 'nodesMet', x: NODES_X + TRACK_W / 2, y: MET_LBL_Y }),
    P.wire({ key: 'coresMet', x: CORES_X + TRACK_W / 2, y: MET_LBL_Y }),
    P.chip({ key: 'cKey', x: C1[0].x, y: ROW1_Y, w: C1[0].w, h: CHIP_H, name: 'key', value: '-' }),
    P.chip({ key: 'cCores', x: C1[1].x, y: ROW1_Y, w: C1[1].w, h: CHIP_H, name: 'cores rule', value: '-' }),
    P.chip({ key: 'cNodes', x: C1[2].x, y: ROW1_Y, w: C1[2].w, h: CHIP_H, name: 'nodes rule', value: '-' }),
    P.chip({ key: 'cSpof', x: C1[3].x, y: ROW1_Y, w: C1[3].w, h: CHIP_H, name: 'preventSinglePointFailure', value: '-' }),
    P.chip({ key: 'cUnsched', x: C2[0].x, y: ROW2_Y, w: C2[0].w, h: CHIP_H, name: 'includeUnschedulableNodes', value: '-' }),
    P.chip({ key: 'cMin', x: C2[1].x, y: ROW2_Y, w: C2[1].w, h: CHIP_H, name: 'min', value: '-' }),
    P.chip({ key: 'cNodeCount', x: C2[2].x, y: ROW2_Y, w: C2[2].w, h: CHIP_H, name: 'nodes', value: '-' }),
    P.chip({ key: 'cCoreCount', x: C2[3].x, y: ROW2_Y, w: C2[3].w, h: CHIP_H, name: 'cores', value: '-' }),
    P.chip({ key: 'cReplicas', x: C2[4].x, y: ROW2_Y, w: C2[4].w, h: CHIP_H, name: 'replicas', value: '-' }),
    P.packets(),
  ],
  reset: {
    keys: ['api', 'auto', 'deploy', 'nTrack', 'cTrack', ...N_KEYS, ...C_KEYS, ...R_KEYS,
      'cKey', 'cCores', 'cNodes', 'cSpof', 'cUnsched', 'cMin', 'cNodeCount', 'cCoreCount', 'cReplicas'],
    pods: [],
  },
};

// MEASURED, not the quotient. The poll legs are 100 units and the write rail 132, which at the
// canon 0.45 u/ms would finish in 222 and 293 and therefore clamp to the M-13 floor of 700, where
// a ball this short reads as crawling. 595 is the same 15 percent off the floor that
// `network-nodelocal-dnscache` measured for its 56 to 164 unit hops, so the two cards of this
// section that hop short distances run at one pace. `render/motion.test.mjs` PACING records all
// eight balls as explicit and under the floor.
const HOP_MS = 595;

// The ConfigMap as the manifest writes it, and what each key is once it is read. `min` is NOT in
// the manifest `--default-params`, so its chip says where the 1 comes from (see the record).
const LINEAR = {
  cKey: 'linear',
  cCores: 'coresPerReplica 256',
  cNodes: 'nodesPerReplica 16',
  cSpof: 'true',
  cUnsched: 'true',
  cMin: '1 by default',
};
// The same ConfigMap with its key swapped. Neither clamp is a ladder sub-key, so both read absent
// rather than a value they do not have.
const LADDER = {
  cKey: 'ladder',
  cCores: '[[1,1],[512,5]]',
  cNodes: '[[1,1],[2,2]]',
  cSpof: 'absent',
  cUnsched: 'true',
  cMin: 'absent',
};
const UNREAD = { cKey: '-', cCores: '-', cNodes: '-', cSpof: '-', cUnsched: '-', cMin: '-' };

const SMALL = { cNodeCount: '16', cCoreCount: '128' };
const BIG = { cNodeCount: '48', cCoreCount: '1536' };

// The three meter readings. Each one is a PAIR, because the two labels always state the same
// cluster and the same mode: a step that turns one over turns both over, in `rewind` and in the
// `F.set` that lands with the cells, so a label never states a count the row is not showing.
const AXIS_IDLE = { nodesMet: 'nodes axis', coresMet: 'cores axis' };
const READ_SMALL = { nodesMet: 'nodes  ceil( 16 / 16 ) = 1', coresMet: 'cores  ceil( 128 / 256 ) = 1' };
const READ_BIG = { nodesMet: 'nodes  ceil( 48 / 16 ) = 3', coresMet: 'cores  ceil( 1536 / 256 ) = 6' };
const READ_LADDER = { nodesMet: 'nodes  48 takes the 2 step = 2', coresMet: 'cores  1536 takes the 512 step = 5' };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { ...UNREAD, cNodeCount: '-', cCoreCount: '-', cReplicas: '-' },
    wires: { ...AXIS_IDLE, back: 'counts' },
    opacity: meters(0, 0, 0),
  },
  {
    id: 'poll',
    duration: 3000,
    narration: 'The kube-dns-autoscaler Deployment is a separate controller and no part of CoreDNS. It runs a client that polls the API server for the number of Nodes and for the cores those Nodes add up to, every 10 seconds by default. This cluster answers with 16 Nodes and 128 cores.',
    chips: { ...UNREAD, ...SMALL, cReplicas: '-' },
    wires: { ...AXIS_IDLE, back: '16 Nodes, 128 cores' },
    opacity: meters(0, 0, 0),
    // The autoscaler ACTS first and its ball must not leave a dark block (M-18a). The two count
    // chips are cued from entry because their VALUE changes on this step (P-05).
    lit: ['auto', 'cNodeCount', 'cCoreCount'],
    // The two counts land on the arrival that produced them (P-03).
    rewind: { chips: { cNodeCount: '-', cCoreCount: '-' } },
    flow: [
      F.segment({ from: POLL_UP[0], to: POLL_UP[1], delay: BEAT.lead, dur: HOP_MS, name: 'up', lights: ['api'] }),
      F.segment({ from: POLL_DOWN[0], to: POLL_DOWN[1], after: 'up', dur: HOP_MS, name: 'down' }),
      F.set({ chips: { ...SMALL }, at: 'down' }),
    ],
  },
  {
    id: 'params',
    // 3900 and not 2600: this is the longest narration on the card, 388 characters, and at 2600 it
    // reads at 6.70 ms/char, rank 5 of 712 in the catalog. The step is READING-bound, so the hold
    // buys the prose rather than the motion (span 1955).
    duration: 3900,
    narration: 'On the same poll it fetches ConfigMap kube-dns-autoscaler, which holds its parameters. The manifest passes coresPerReplica 256, nodesPerReplica 16 and both flags as default-params, and the autoscaler writes those into the ConfigMap when none exists. Setting includeUnschedulableNodes true counts cordoned and draining Nodes in the total, and with no min passed the library holds min at 1.',
    chips: { ...LINEAR, ...SMALL, cReplicas: '-' },
    wires: { ...AXIS_IDLE, back: 'configmap params' },
    opacity: meters(0, 0, 0),
    // The API server is the SENDER of this one, so it stands lit before the ball leaves it.
    lit: ['api', 'cKey', 'cCores', 'cNodes', 'cSpof', 'cUnsched', 'cMin'],
    rewind: { chips: { ...UNREAD } },
    flow: [
      F.segment({ from: POLL_DOWN[0], to: POLL_DOWN[1], delay: BEAT.lead, dur: HOP_MS, name: 'cm', lights: ['auto'] }),
      F.set({ chips: { ...LINEAR }, at: 'cm' }),
    ],
  },
  {
    id: 'linear',
    duration: 2900,
    narration: 'The linear pattern reads both axes and rounds each one up. The Nodes axis gives ceil of 16 over 16, which is 1, and the cores axis gives ceil of 128 over 256, which is also 1. The equation keeps the larger of the two, so both meters read one replica.',
    chips: { ...LINEAR, ...SMALL, cReplicas: '-' },
    wires: { ...READ_SMALL, back: '16 Nodes, 128 cores' },
    opacity: meters(1, 1, 0),
    lit: ['auto', 'cCores', 'cNodes'],
    // The LABEL is wound back with the cells it counts, or it states a 1 over an empty row for the
    // whole lead beat. Each half lands with its own cell.
    rewind: { wires: { ...AXIS_IDLE } },
    // No ball: nothing travels while the controller does arithmetic. The beat is the two readings
    // landing one after the other, which is what a reader has to see happen.
    flow: [
      F.reveal({ target: 'n0', delay: BEAT.lead }),
      F.set({ wires: { nodesMet: READ_SMALL.nodesMet }, delay: BEAT.lead }),
      F.reveal({ target: 'c0', delay: BEAT.lead + 500 }),
      F.set({ wires: { coresMet: READ_SMALL.coresMet }, delay: BEAT.lead + 500 }),
    ],
  },
  {
    id: 'floor',
    duration: 3100,
    narration: 'Two clamps follow. A max would cap the result and none is set, and min 1 lifts nothing here. But preventSinglePointFailure holds at least 2 replicas while the cluster has more than one Node, so the autoscaler writes 2 to the CoreDNS scale subresource.',
    chips: { ...LINEAR, ...SMALL, cReplicas: '2' },
    wires: { ...READ_SMALL, back: '16 Nodes, 128 cores' },
    opacity: meters(1, 1, 2),
    lit: ['auto', 'cSpof', 'cMin', 'cReplicas'],
    rewind: { chips: { cReplicas: '-' }, opacity: meters(1, 1, 0) },
    flow: [
      F.segment({ from: WRITE[0], to: WRITE[1], delay: BEAT.lead, dur: HOP_MS, name: 'w', lights: ['deploy'] }),
      F.reveal({ target: 'r0', at: 'w' }),
      F.reveal({ target: 'r1', at: 'w', plus: 200 }),
      F.set({ chips: { cReplicas: '2' }, at: 'w' }),
    ],
  },
  {
    id: 'grow',
    duration: 3000,
    narration: 'The cluster grows to 48 Nodes of 32 cores each. Nothing restarts and nothing is edited. The next poll simply counts 48 Nodes in total and 1536 cores, and the same two axes are read again against the same parameters.',
    chips: { ...LINEAR, ...BIG, cReplicas: '2' },
    wires: { ...READ_SMALL, back: '48 Nodes, 1536 cores' },
    opacity: meters(1, 1, 2),
    lit: ['auto', 'cNodeCount', 'cCoreCount'],
    rewind: { chips: { ...SMALL } },
    flow: [
      F.segment({ from: POLL_UP[0], to: POLL_UP[1], delay: BEAT.lead, dur: HOP_MS, name: 'up', lights: ['api'] }),
      F.segment({ from: POLL_DOWN[0], to: POLL_DOWN[1], after: 'up', dur: HOP_MS, name: 'down' }),
      F.set({ chips: { ...BIG }, at: 'down' }),
    ],
  },
  {
    id: 'dominate',
    duration: 3800,
    narration: 'Now the two axes disagree. The Nodes axis gives ceil of 48 over 16, which is 3, and the cores axis gives ceil of 1536 over 256, which is 6. On Nodes with many cores the cores axis dominates, and the larger reading, 6, is written to the Deployment.',
    chips: { ...LINEAR, ...BIG, cReplicas: '6' },
    wires: { ...READ_BIG, back: '48 Nodes, 1536 cores' },
    opacity: meters(3, 6, 6),
    lit: ['auto', 'cCores', 'cReplicas'],
    rewind: { chips: { cReplicas: '2' }, wires: { ...READ_SMALL }, opacity: meters(1, 1, 2) },
    flow: [
      F.set({ wires: { ...READ_BIG }, delay: BEAT.lead }),
      F.reveal({ target: 'n1', delay: BEAT.lead }),
      F.reveal({ target: 'n2', delay: BEAT.lead + 80 }),
      F.reveal({ target: 'c1', delay: BEAT.lead }),
      F.reveal({ target: 'c2', delay: BEAT.lead + 80 }),
      F.reveal({ target: 'c3', delay: BEAT.lead + 160 }),
      F.reveal({ target: 'c4', delay: BEAT.lead + 240 }),
      F.reveal({ target: 'c5', delay: BEAT.lead + 320 }),
      F.segment({ from: WRITE[0], to: WRITE[1], delay: 1750, dur: HOP_MS, name: 'w', lights: ['deploy'] }),
      F.reveal({ target: 'r2', at: 'w' }),
      F.reveal({ target: 'r3', at: 'w', plus: 80 }),
      F.reveal({ target: 'r4', at: 'w', plus: 160 }),
      F.reveal({ target: 'r5', at: 'w', plus: 240 }),
      F.set({ chips: { cReplicas: '6' }, at: 'w' }),
    ],
  },
  {
    id: 'ladder',
    duration: 3400,
    narration: 'The other control pattern is ladder, and swapping the ConfigMap key swaps the mode with no restart. The two divisors give way to two step tables, coresToReplicas and nodesToReplicas. Each count is looked up on its own table, and the lookup yielding more replicas wins, which is 5 here. A ladder may name 0 replicas, which linear may not.',
    chips: { ...LADDER, ...BIG, cReplicas: '5' },
    wires: { ...READ_LADDER, back: '48 Nodes, 1536 cores' },
    opacity: meters(2, 5, 5),
    lit: ['auto', 'cKey', 'cCores', 'cNodes', 'cSpof', 'cMin', 'cReplicas'],
    rewind: { chips: { ...LINEAR, cReplicas: '6' }, wires: { ...READ_BIG }, opacity: meters(3, 6, 6) },
    flow: [
      F.set({ chips: { ...LADDER }, wires: { ...READ_LADDER }, delay: BEAT.lead }),
      F.fade({ target: 'n2', to: 0, dur: 400, delay: BEAT.lead }),
      F.fade({ target: 'c5', to: 0, dur: 400, delay: BEAT.lead }),
      F.segment({ from: WRITE[0], to: WRITE[1], delay: 1500, dur: HOP_MS, name: 'w', lights: ['deploy'] }),
      F.fade({ target: 'r5', to: 0, dur: 400, at: 'w' }),
      F.set({ chips: { cReplicas: '5' }, at: 'w' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
