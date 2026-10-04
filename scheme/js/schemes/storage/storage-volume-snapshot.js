import { P, F, defineCard, BEAT, FADE, OPACITY, REVEAL_MS, chipStrip, makeRidingLabel } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-volume-snapshot.md


// The volume is drawn as its blocks: three rows of six cells in one pool frame, each row led by a
// header naming whose data it is. The row unit (header, gap, cells) centres on CX.
const CX = 600;
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const HEAD_W = 144, HEAD_GAP = 24;
const CELL_W = 104, CELL_GAP = 28, CELLS = LETTERS.length;
const CELLS_W = CELLS * CELL_W + (CELLS - 1) * CELL_GAP;                    // 764
const ROW_W = HEAD_W + HEAD_GAP + CELLS_W;                                  // 932
const HEAD_X = CX - ROW_W / 2, HEAD_CX = HEAD_X + HEAD_W / 2;               // 134 / 206
const CELL_X0 = HEAD_X + HEAD_W + HEAD_GAP;                                 // 302
const cellX = (i) => CELL_X0 + i * (CELL_W + CELL_GAP);
const cellCX = (i) => cellX(i) + CELL_W / 2;                                // 354 .. 1014
const C_CX = cellCX(2);                                                     // 618

// The pool starts under the deepest measured panel floor (see the record PANEL). The top inset holds
// the frame label, the rows sit ROW_PITCH apart, and the bottom inset closes the frame under the last.
const FRAME_Y = 268, FRAME_INSET_X = 24, FRAME_TOP = 36, FRAME_BOTTOM = 20;
const ROW_H = 52, ROW_PITCH = 88;
const LIVE_Y = FRAME_Y + FRAME_TOP;                                         // 304
const SNAP_Y = LIVE_Y + ROW_PITCH, REST_Y = SNAP_Y + ROW_PITCH;             // 392 / 480
const FRAME_X = HEAD_X - FRAME_INSET_X, FRAME_W = ROW_W + 2 * FRAME_INSET_X; // 110 / 980
const FRAME_H = REST_Y + ROW_H + FRAME_BOTTOM - FRAME_Y;                    // 284, floor 552

// The catalog Pod (NET.L-01), centred on block C: every write it makes lands straight down on C.
const POD_W = 232, POD_H = 104, POD_Y = 36, POD_BOTTOM = POD_Y + POD_H;     // 140
const APP_W = 192, APP_H = 44, APP_DY = 26;

// The two API objects stand as one column, the catalog actor block 232 by 80, its right edge flush
// with the pool frame. The column is the snapshot pair (a PVC and its PV, one level up).
const OBJ_W = 232, OBJ_H = 80, OBJ_X = FRAME_X + FRAME_W - OBJ_W, OBJ_CX = OBJ_X + OBJ_W / 2;   // 858 / 974
const SNAP_OBJ_Y = 36, CONT_Y = SNAP_OBJ_Y + OBJ_H + 40;                    // 36 / 156

const CHIPS_Y = 572;             // 20 under the frame floor
const CHIP_W = 232, CHIP_GAP = 16;
const CHIPS = chipStrip({ cx: CX, w: CHIP_W, gap: CHIP_GAP });              // 112 .. 1088

// A write is addressed to the volume in the pool, so it stops on the frame face level with block C.
const W_WRITE = [[C_CX, POD_BOTTOM], [C_CX, FRAME_Y]];
const W_BIND  = [[OBJ_CX, SNAP_OBJ_Y + OBJ_H], [OBJ_CX, CONT_Y]];
// The call is addressed to the whole pool, so it leaves the content side face and drops onto the
// centre of the pool frame top. The write lane at C_CX is never drawn on the same step.
const CONT_MY = CONT_Y + OBJ_H / 2;                                         // 196
const W_CALL  = [[OBJ_X, CONT_MY], [CX, CONT_MY], [CX, FRAME_Y]];
const W_KEEP  = [[C_CX, LIVE_Y + ROW_H], [C_CX, SNAP_Y]];
const W_SEED  = [[HEAD_CX, SNAP_Y + ROW_H], [HEAD_CX, REST_Y]];
// A snapshot block is a POINTER at a live block until something writes that block, so the row keeps
// one undirected link per column. Block C's link is the one the keep lane replaces.
const ptr = (i) => [[cellCX(i), SNAP_Y], [cellCX(i), LIVE_Y + ROW_H]];

// Every tag lives exactly as long as its ball (M-30a), and fades in once clear of the block it leaves.
const tagFn = makeRidingLabel({ role: 'storage', inMs: 200, outMs: 200, hold: 0, emergeMode: true });
// Every tag hugs its ball (dy is the text baseline, 4 centres it on the ball). The bind tag rides
// right of its 40 long hop in the gap between the two objects, emerging once clear of the upper one.
// The call tag rides just above its ball and ahead of it, on both legs. The two hops inside the pool
// cross a 36 gap between rows of cells and carry no tag at all: any tag there prints into a cell.
const WRITE_TAG = { dx: 46, dy: 4, emerge: 200 };
const BIND_TAG = { dx: 40, dy: 0, emerge: 250 };
const CALL_TAG = { dx: -56, dy: -8, emerge: 150 };

const lane = (key, points) => P.lane({ key, points, dashed: true, dim: true, opacity: 0 });
const head = (key, y, label, sublabel) => P.box({ key, x: HEAD_X, y, w: HEAD_W, h: ROW_H, label, sublabel });
const cell = (row, y, i, sublabel, opacity) => P.box({ key: `${row}${LETTERS[i]}`, x: cellX(i), y, w: CELL_W, h: ROW_H, label: LETTERS[i], sublabel, opacity });
const row = (prefix, y, subs, opacity) => LETTERS.map((_, i) => cell(prefix, y, i, subs[i], opacity));

// The versions each row holds: the live volume at 09:58, and the 10:00 state the snapshot froze.
const V_BEFORE = ['v1', 'v1', 'v1', 'v1', 'v1', 'v1'];
const V_FROZEN = ['v1', 'v1', 'v2', 'v1', 'v1', 'v1'];

// List order IS append order, which is z-order: the pool frame, the Pod and the two API objects, the
// three row groups (the snapshot row carries its pointers), the lanes and caption, chips, packets.
export const SCENE = {
  'aria-label': 'Volume Snapshots: Pod db-0 keeps writing the blocks of PVC data-1 in a Ceph pool, VolumeSnapshot snap-1 binds to a cluster-scoped VolumeSnapshotContent the way a PVC binds a PV, and at 10:00 CreateSnapshot freezes the volume as pointers to its six blocks with nothing copied. At 10:05 a new write to block C makes the pool keep the old C for the snapshot, so the live volume moves on while snap-1 still reads 10:00, and PVC restore-1 with dataSource snap-1 gets a new, crash-consistent volume holding that 10:00 state. All three live in one pool, so if the pool is lost they are lost together and the snapshot was not a backup',
  parts: [
    P.defs(),
    P.node({ key: 'frame', x: FRAME_X, y: FRAME_Y, w: FRAME_W, h: FRAME_H, label: 'Ceph pool rbd' }),
    // The GROUP is the pulse target, and nothing inside it lights (STO.C-02).
    P.pod({
      key: 'pod', x: C_CX - POD_W / 2, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod db-0', sublabel: 'claim: data-1', containers: 0,
      inner: { dx: (POD_W - APP_W) / 2, dy: APP_DY, w: APP_W, h: APP_H, label: 'app', sublabel: 'writes /data' },
    }),
    P.box({ key: 'snap', x: OBJ_X, y: SNAP_OBJ_Y, w: OBJ_W, h: OBJ_H, label: 'VolumeSnapshot snap-1', sublabel: 'source: PVC data-1', opacity: 0 }),
    P.box({ key: 'cont', x: OBJ_X, y: CONT_Y, w: OBJ_W, h: OBJ_H, label: 'VolumeSnapshotContent', sublabel: 'cluster-scoped', opacity: 0 }),
    P.group({ key: 'rowLive', parts: [
      head('hLive', LIVE_Y, 'Live volume', 'PVC data-1'),
      ...row('l', LIVE_Y, V_BEFORE),
    ] }),
    // The snapshot blocks rest at the pending shade while they only POINT at a live block, and a block
    // turns full once the snapshot holds its own copy of it.
    P.group({ key: 'rowSnap', opacity: 0, parts: [
      head('hSnap', SNAP_Y, 'Snapshot data', 'frozen at 10:00'),
      ...row('s', SNAP_Y, V_FROZEN, OPACITY.pending),
      ...LETTERS.map((L, i) => P.relation({ key: `p${L}`, points: ptr(i), dash: '3 3' })),
    ] }),
    P.group({ key: 'rowRest', opacity: 0, parts: [
      head('hRest', REST_Y, 'Restored volume', 'PVC restore-1'),
      ...row('r', REST_Y, V_FROZEN),
    ] }),
    lane('wWrite', W_WRITE),
    lane('wBind', W_BIND),
    lane('wCall', W_CALL),
    lane('wKeep', W_KEEP),
    lane('wSeed', W_SEED),
    // The counterfactual caption of the last step (T-35), in the frame label band, above all three rows.
    P.wire({ key: 'poolCap', x: CX, y: FRAME_Y + 22 }),
    P.chip({ key: 'timeChip', x: CHIPS.x(0), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'time', value: '09:58' }),
    P.chip({ key: 'readyChip', x: CHIPS.x(1), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'readyToUse', value: 'none' }),
    P.chip({ key: 'sharedChip', x: CHIPS.x(2), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'shared blocks', value: 'none' }),
    P.chip({ key: 'storeChip', x: CHIPS.x(3), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'stored', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: ['snap', 'cont', 'hSnap', 'hRest', 'lC', 'sC', 'rC',
      'timeChip', 'readyChip', 'sharedChip', 'storeChip'],
    pods: ['pod'],
  },
};


// Every step writes EVERY chip (P-01).
const chips = (time, ready, shared, store) => ({ timeChip: time, readyChip: ready, sharedChip: shared, storeChip: store });

// STO.S-01 as a field: every element born or changed mid-story, and every lane, is pinned on EVERY
// step. The pointer of block C goes the moment its keep lane takes its place.
const LANES = ['wWrite', 'wBind', 'wCall', 'wKeep', 'wSeed'];
const stage = ({ snap = 0, cont = 0, rowSnap = 0, ptrC = 1, sC = OPACITY.pending, rowRest = 0, rows = 1, lanes = [] } = {}) => ({
  snap, cont, rowSnap, pC: ptrC, sC, rowRest, rowLive: rows,
  ...Object.fromEntries(LANES.map(k => [k, lanes.includes(k) ? 1 : 0])),
});
// The objects and rows that stand once each step is over, so a later step starts from them.
const BOUND = { snap: 1, cont: 1 };
const CUT = { ...BOUND, rowSnap: 1 };
const KEPT = { ...CUT, ptrC: 0, sC: 1 };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('09:58', 'none', 'none', 'none'),
    sublabels: { lC: 'v1' },
    opacity: stage(),
  },
  {
    id: 'live',
    duration: 3000,
    narration: 'Pod db-0 writes to PVC data-1, whose volume lives in a Ceph pool. The card draws that volume as six blocks, A to F, and every write gives a block a new version: this one turns C v1 into C v2. The volume keeps changing like this for as long as the Pod runs.',
    chipsCued: chips('09:58', 'none', 'none', 'none'),
    sublabels: { lC: 'v2' },
    opacity: stage({ lanes: ['wWrite'] }),
    rewind: { sublabels: { lC: 'v1' } },
    // Up-arrow out of a Pod: it blinks first and the write leaves on BEAT.afterPulse (M-15).
    flow: [
      F.pulse({ pod: 'pod' }),
      F.route({ points: W_WRITE, delay: BEAT.afterPulse, name: 'write', lights: ['lC'] }),
      F.tag({ text: 'write C v2', points: W_WRITE, delay: BEAT.afterPulse, ...WRITE_TAG, fn: tagFn }),
      F.set({ at: 'write', sublabels: { lC: 'v2' } }),
    ],
  },
  {
    id: 'request',
    duration: 3400,
    narration: 'You create VolumeSnapshot snap-1 with source data-1 and a VolumeSnapshotClass that names the CSI driver. A cluster-scoped VolumeSnapshotContent is created and bound to it one to one, the same pair shape as a PVC and its PV. All three kinds are CRDs, installed with the snapshot controller, not built in.',
    chipsCued: chips('09:59', 'false', 'none', 'none'),
    sublabels: { lC: 'v2' },
    opacity: stage({ ...BOUND, lanes: ['wBind'] }),
    // The request is where the ball leaves, so it is lit at entry. The content is the receiver.
    lit: ['snap'],
    rewind: { opacity: { snap: 0, cont: OPACITY.pending, wBind: 0 }, chips: { readyChip: 'none' } },
    flow: [
      F.reveal({ target: 'snap' }),
      // The content is what the lane points AT, so it comes in at the pending shade (M-24).
      F.fade({ target: 'cont', from: 0, to: OPACITY.pending, dur: REVEAL_MS, fill: 'forwards', easing: 'ease-out' }),
      // The lane is one construction with the two objects on its ends (STO.S-02), so it comes in with them.
      F.fade({ target: 'wBind', from: 0, to: 1, dur: REVEAL_MS, fill: 'forwards', easing: 'ease-out' }),
      F.route({ points: W_BIND, delay: BEAT.lead, name: 'bind', lights: ['cont'] }),
      F.tag({ text: 'bind 1:1', points: W_BIND, delay: BEAT.lead, ...BIND_TAG, fn: tagFn }),
      F.reveal({ target: 'cont', from: OPACITY.pending, at: 'bind' }),
      F.set({ at: 'bind', chipsCued: { readyChip: 'false' } }),
    ],
  },
  {
    id: 'cut',
    duration: 3200,
    narration: 'At 10:00 the content triggers CreateSnapshot, which the CSI driver runs against the pool. On a copy-on-write backend like this one no data moves: the snapshot is a frozen map pointing at the six blocks exactly as they are now, C v2 included. That is why it can be ready in seconds.',
    chipsCued: chips('10:00', 'true', '6 of 6', 'same pool'),
    sublabels: { lC: 'v2' },
    opacity: stage({ ...CUT, lanes: ['wCall'] }),
    lit: ['cont'],
    rewind: { opacity: { rowSnap: 0 }, chips: { readyChip: 'false', sharedChip: 'none', storeChip: 'none' } },
    flow: [
      F.route({ points: W_CALL, delay: BEAT.lead, name: 'call' }),
      F.tag({ text: 'CreateSnapshot', points: W_CALL, delay: BEAT.lead, ...CALL_TAG, fn: tagFn }),
      F.reveal({ target: 'rowSnap', at: 'call' }),
      F.light({ targets: ['hSnap'], at: 'call' }),
      F.set({ at: 'call', chipsCued: { readyChip: 'true', sharedChip: '6 of 6', storeChip: 'same pool' } }),
    ],
  },
  {
    id: 'diverge',
    duration: 3800,
    narration: 'At 10:05 the Pod writes block C again. The pool keeps the old C v2 for the snapshot before the new version lands, so this one block now exists twice. The live volume reads C v3, while snap-1 still sees every block exactly as it was at 10:00.',
    chipsCued: chips('10:05', 'true', '5 of 6', 'same pool'),
    sublabels: { lC: 'v3' },
    opacity: stage({ ...KEPT, lanes: ['wWrite', 'wKeep'] }),
    rewind: { opacity: { sC: OPACITY.pending }, sublabels: { lC: 'v2' }, chips: { sharedChip: '6 of 6' } },
    // The write reaches C first, the old version drops into the snapshot, and only then does the
    // live block read the new one: the order the narration states.
    flow: [
      F.pulse({ pod: 'pod' }),
      F.route({ points: W_WRITE, delay: BEAT.afterPulse, name: 'write', lights: ['lC'] }),
      F.tag({ text: 'write C v3', points: W_WRITE, delay: BEAT.afterPulse, ...WRITE_TAG, fn: tagFn }),
      F.route({ points: W_KEEP, after: 'write', name: 'keep', lights: ['sC'] }),
      F.reveal({ target: 'sC', from: OPACITY.pending, at: 'keep' }),
      F.set({ at: 'keep', sublabels: { lC: 'v3' }, chipsCued: { sharedChip: '5 of 6' } }),
    ],
  },
  {
    id: 'restore',
    duration: 3000,
    narration: 'To go back, create PVC restore-1 in the same StorageClass, with dataSource snap-1. Provisioning builds a new volume holding C v2, the 10:00 state, not the C v3 live now. It is only crash consistent: whatever db-0 still held in memory at 10:00 is not in it.',
    chipsCued: chips('10:20', 'true', '5 of 6', 'same pool'),
    sublabels: { lC: 'v3' },
    opacity: stage({ ...KEPT, rowRest: 1, lanes: ['wSeed'] }),
    // The snapshot is what the new volume is built from, so it is lit at entry.
    lit: ['hSnap'],
    rewind: { opacity: { rowRest: OPACITY.pending, wSeed: 0 } },
    flow: [
      F.fade({ target: 'rowRest', from: 0, to: OPACITY.pending, dur: REVEAL_MS, fill: 'forwards', easing: 'ease-out' }),
      F.fade({ target: 'wSeed', from: 0, to: 1, dur: REVEAL_MS, fill: 'forwards', easing: 'ease-out' }),
      F.route({ points: W_SEED, delay: BEAT.lead, name: 'seed', lights: ['hRest', 'rC'] }),
      F.reveal({ target: 'rowRest', from: OPACITY.pending, at: 'seed' }),
    ],
  },
  {
    id: 'loss',
    duration: 3000,
    narration: 'All three sit in one pool. If that pool is lost, the live volume, the snapshot and the restored copy go with it, while snap-1 and its content stay in the API naming data that is gone. On a backend like this a snapshot is not a backup until it is copied somewhere else.',
    chipsCued: chips('10:20', 'true', '5 of 6', 'lost with pool'),
    sublabels: { lC: 'v3' },
    wires: { poolCap: 'if the pool is lost' },
    opacity: stage({ ...KEPT, rowSnap: OPACITY.terminated, rowRest: OPACITY.terminated, rows: OPACITY.terminated }),
    // No ball and no Pod blink: the step states a counterfactual, and the objects that outlive the
    // data carry its beat as a static highlight (M-27).
    lit: ['snap', 'cont'],
    rewind: { opacity: { rowSnap: 1, rowRest: 1, rowLive: 1 }, chips: { storeChip: 'same pool' } },
    flow: [
      ...['rowLive', 'rowSnap', 'rowRest'].map(target => F.fade({ target, to: OPACITY.terminated, dur: FADE.out, delay: BEAT.lead, fill: 'forwards' })),
      F.set({ delay: BEAT.lead, chipsCued: { storeChip: 'lost with pool' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
