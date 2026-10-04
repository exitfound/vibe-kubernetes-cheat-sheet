import { P, F, defineCard, makeRidingLabel, laneOf, BEAT, FADE, OPACITY, REVEAL_MS } from './storage-kit.js';
import { rect } from '../../lib/svg.js';
// Design notes for this card: ./CARDS/storage-pvc-retention-policy.md


// A 2x2 policy matrix: one ROW per field (the two ways a replica leaves), one COLUMN per position,
// Retain left and Delete right, and the owner that leaves in each row standing between its cells.
const CX = 600;

// A cell holds the three ordinal claims, each over its disk. 116 is the slot the worst claim string
// `PVC data-web-0` fits with its inset (measured in the record), and the cell frame pads it by 10.
const SLOT_W = 116, SLOT_GAP = 8, CELL_PAD = 10;
const CLAIM_H = 44, DISK_H = 40, DISK_DY = CELL_PAD + CLAIM_H + 6;
const CELL_W = 3 * SLOT_W + 2 * SLOT_GAP + 2 * CELL_PAD;           // 384
const CELL_H = DISK_DY + DISK_H + CELL_PAD;                        // 110

// The owner column is the catalog block (NET.L-01), 40 off each cell, so the matrix spans 60..1140.
const OWNER_W = 232, OWNER_GAP = 40;
const RET_X = CX - OWNER_W / 2 - OWNER_GAP - CELL_W;              // 60
const DEL_X = CX + OWNER_W / 2 + OWNER_GAP;                        // 756
const RET_CX = RET_X + CELL_W / 2, DEL_CX = DEL_X + CELL_W / 2;    // 252 / 948

// Row 0 is whenScaled, row 1 whenDeleted. The matrix is centred in the band under the deepest panel
// (1100x800), and the pitch keeps a row 0 verdict clear of the row 1 caption (both in the record).
const CELL_Y = [272, 456];
const ROW_CY = CELL_Y.map(y => y + CELL_H / 2);                    // 327 / 511
const CAP_DY = 12, VERDICT_DY = CELL_H + 18;

// The Retain cell counts ordinals 0, 1, 2 away from the panel, the Delete cell mirrors it, so in
// both cells the claim of the ordinal a scale-down removes stands next to its owner.
const slotX = (col, i) => (col === 'R'
  ? RET_X + CELL_PAD + i * (SLOT_W + SLOT_GAP)
  : DEL_X + CELL_PAD + (2 - i) * (SLOT_W + SLOT_GAP));

// The owners: Pod web-2, 232 by 104 around a 192 by 44 app box, and StatefulSet web, 232 by 80.
const POD_W = 232, POD_H = 104, APP_W = 192, APP_H = 44, APP_DY = 26;
const POD_X = CX - POD_W / 2, POD_Y = ROW_CY[0] - POD_H / 2;       // 484 / 275
const POD_BOTTOM = POD_Y + POD_H;                                  // 379
const STS_W = 232, STS_H = 80, STS_X = CX - STS_W / 2, STS_Y = ROW_CY[1] - STS_H / 2;   // 471

// The garbage collector acts only on the Delete column, so it stands in the free band over it,
// centred on the row 0 claim it deletes. Its second lane runs a gutter 30 right of the matrix.
const GC_W = 232, GC_H = 80, GC_CX = slotX('D', 2) + SLOT_W / 2;  // 824
const GC_X = GC_CX - GC_W / 2, GC_Y = 56, GC_MY = GC_Y + GC_H / 2;
const GUTTER_X = DEL_X + CELL_W + 30;                              // 1170

// Every lane array is built ONCE and read by both the lane and the ball (A-02). The Pod lane stops on
// the Pod shell, and both GC lanes stop on a cell FRAME face, which holds every claim a ball deletes.
const POD_LANE = [[CX, STS_Y], [CX, POD_BOTTOM]];
const GC_S = [[GC_CX, GC_Y + GC_H], [GC_CX, CELL_Y[0]]];
// GC_D rides untagged: down its 30 wide gutter a tag sits on the lane, runs off the canvas to the
// right or over the Delete cells to the left. The GC_S ball on scale-down already names the verb.
const GC_D = [[GC_X + GC_W, GC_MY], [GUTTER_X, GC_MY], [GUTTER_X, ROW_CY[1]], [DEL_X + CELL_W, ROW_CY[1]]];

// The ownerReference lives ON the claims and names the owner: a relation, no arrowhead, never a
// ball, and only ever into the Delete cell. The Retain cells have no line, which is the point.
const OWN_S = [[POD_X + POD_W, ROW_CY[0]], [DEL_X, ROW_CY[0]]];
const OWN_D = [[STS_X + STS_W, ROW_CY[1]], [DEL_X, ROW_CY[1]]];

// No part kind emits a bare dashed outline, so the cell frame sets its stroke and dash INLINE.
const frameRect = (x, y) => {
  const r = rect({ x, y, width: CELL_W, height: CELL_H, rx: 10, fill: 'none' });
  r.style.stroke = 'var(--diag-node-stroke)';
  r.style.strokeDasharray = '3 6';
  return r;
};

const ROWS = ['s', 'd'];
const ORD = [0, 1, 2];
const claimKey = (row, col, i) => `${row}${col}c${i}`;
const diskKey = (row, col, i) => `${row}${col}k${i}`;

// One cell: its frame, then its three claims each over its disk. The disk label takes the family
// re-centre, h/2 + 10 (STO.L-02).
const cell = (r, col) => P.group({
  key: `cell${ROWS[r]}${col}`,
  parts: [
    P.raw({ make: () => frameRect(col === 'R' ? RET_X : DEL_X, CELL_Y[r]) }),
    ...ORD.flatMap(i => [
      P.box({ key: claimKey(ROWS[r], col, i), x: slotX(col, i), y: CELL_Y[r] + CELL_PAD, w: SLOT_W, h: CLAIM_H, label: `PVC data-web-${i}`, sublabel: 'Bound' }),
      P.cylinder({ key: diskKey(ROWS[r], col, i), x: slotX(col, i), y: CELL_Y[r] + DISK_DY, w: SLOT_W, h: DISK_H, label: `PV web-${i}`, labelY: DISK_H / 2 + 10 }),
    ]),
  ],
});

const CLAIMS = ROWS.flatMap(row => ['R', 'D'].flatMap(col => ORD.map(i => claimKey(row, col, i))));
const DISKS = ROWS.flatMap(row => ['R', 'D'].flatMap(col => ORD.map(i => diskKey(row, col, i))));

// Z-order (bottom -> top): the four cells, the owners and the collector, then the lanes, relations
// and captions, then the packet layer. No chip: the matrix itself is the readout.
export const SCENE = {
  'aria-label': 'StatefulSet persistentVolumeClaimRetentionPolicy as a two by two matrix: whenScaled governs the claims of replicas removed by a scale-down and whenDeleted the claims when the StatefulSet itself is deleted, each Retain, the default, or Delete. A field at Retain adds no ownerReference, so its event deletes no claim. Delete gives the claim an ownerReference, to the removed Pod for whenScaled and to the StatefulSet for whenDeleted, so the garbage collector deletes it after its owner is gone, and only ordinals at or above the new replica count lose theirs on a scale-down. Deleting a claim releases its PersistentVolume, whose own reclaimPolicy decides whether the disk goes too',
  parts: [
    P.defs(),
    cell(0, 'R'), cell(0, 'D'), cell(1, 'R'), cell(1, 'D'),
    P.pod({
      key: 'pod', x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-2', sublabel: 'mounts data-web-2', containers: 0,
      inner: { dx: (POD_W - APP_W) / 2, dy: APP_DY, w: APP_W, h: APP_H, label: 'app', sublabel: 'read/write' },
    }),
    P.box({ key: 'sts', x: STS_X, y: STS_Y, w: STS_W, h: STS_H, label: 'StatefulSet web', sublabel: 'replicas: 3' }),
    P.box({ key: 'gc', x: GC_X, y: GC_Y, w: GC_W, h: GC_H, label: 'Garbage collector', sublabel: 'kube-controller-manager' }),
    P.lane({ key: 'podLane', points: POD_LANE, dashed: true, dim: true }),
    P.lane({ key: 'gcS', points: GC_S, dashed: true, dim: true }),
    P.lane({ key: 'gcD', points: GC_D, dashed: true, dim: true }),
    P.relation({ key: 'ownS', points: OWN_S, opacity: 0 }),
    P.relation({ key: 'ownD', points: OWN_D, opacity: 0 }),
    // Standing captions: the two positions over the columns, and each row's field, which also says
    // what the other field is held at, so no cell stands for a combination it does not draw.
    P.tag({ x: RET_CX, y: CELL_Y[0] - CAP_DY, text: 'if Retain' }),
    P.tag({ x: DEL_CX, y: CELL_Y[0] - CAP_DY, text: 'if Delete' }),
    P.tag({ x: CX, y: CELL_Y[0] - CAP_DY, text: 'whenScaled flips, whenDeleted stays Retain' }),
    P.tag({ x: CX, y: CELL_Y[1] + VERDICT_DY, text: 'whenDeleted flips, whenScaled stays Retain' }),
    // One verdict per cell, stated on every step, and the PV reclaimPolicy over the cell the disk
    // step replays, stated as fact until `disk` turns it into the T-35 counterfactual caption.
    ...ROWS.flatMap((row, r) => [
      P.wire({ key: `v${row}R`, x: RET_CX, y: CELL_Y[r] + VERDICT_DY }),
      P.wire({ key: `v${row}D`, x: DEL_CX, y: CELL_Y[r] + VERDICT_DY }),
    ]),
    P.wire({ key: 'pvCap', x: DEL_CX, y: CELL_Y[1] - CAP_DY }),
    P.packets(),
  ],
  reset: {
    keys: ['sts', 'gc', ...CLAIMS, ...DISKS],
    pods: ['pod'],
  },
};

const T = OPACITY.terminated;

// STO.S-01 as a field: every block that ever changes, and every lane and relation, on EVERY step.
// A lane or relation takes the MIN of its two ends (A-13), so it leaves with whichever end goes.
const stage = ({ sts = 1, pod = 1, sDc2 = 1, sDk2 = 1, dDc = 1, dDk = 1, ownS = 0, ownD = 0 } = {}) => ({
  sts, pod, sDc2, sDk2,
  dDc0: dDc, dDc1: dDc, dDc2: dDc, dDk0: dDk, dDk1: dDk, dDk2: dDk,
  podLane: laneOf(sts, pod),
  ownS: ownS ? laneOf(pod, sDc2) : '0',
  ownD: ownD ? laneOf(sts, dDc) : '0',
});

// Every claim sublabel on every step, so a step entered out of order cannot inherit an owner line.
const subs = ({ sD2 = 'Bound', dD = 'Bound' } = {}) => ({
  ...Object.fromEntries(CLAIMS.map(k => [k, 'Bound'])),
  sDc2: sD2, dDc0: dD, dDc1: dD, dDc2: dD,
});

// Every verdict wire on every step (T-30): the prologue blanks them, so a wire no step states reads
// blank on prev and reset while the narration names it.
const verdicts = ({ sR = '', sD = '', dR = '', dD = '', pv = '' } = {}) => ({ vsR: sR, vsD: sD, vdR: dR, vdD: dD, pvCap: pv });
const BLANK = verdicts();
// The PV reclaimPolicy the narration speaks from scale-down on, drawn where `disk` flips it.
const PV_DEL = { pv: 'the PVs say Delete' };

// The two resolved rows, written once so the later steps restate exactly what the earlier ones left.
const ROW_S_DOWN = { sR: 'data-web-2 kept, Bound', sD: 'data-web-2 and its disk deleted' };
const ROW_S_UP = { sR: 'same claim, same data', sD: 'fresh claim, empty disk' };
const ROW_D_GONE = { dR: 'all three kept, no owner', dD: 'claims and disks deleted' };

// Every tag lives exactly as long as its ball (M-30a): in before departure, out as it lands.
const tagFn = makeRidingLabel({ role: 'storage', inMs: 200, outMs: 200, hold: 0 });
// A tag rides right of its vertical lane and TRAILS its ball, below it up the Pod lane and above it
// down the collector lane. The Pod lane tag hugs its ball and emerges once clear of the StatefulSet,
// so it never prints over `StatefulSet web` (record, SIZES).
const podTagFn = makeRidingLabel({ role: 'storage', inMs: 200, outMs: 200, hold: 0, emergeMode: true });
const POD_TAG = { dx: 34, dy: 16, fn: podTagFn, emerge: 250 }, GC_TAG = { dx: 34, dy: -10 };

// How long a deleted block stays lit after its cue, so the reader sees what was hit before it goes.
const LIGHT_HOLD = 260;
// The disk goes a beat after its claim: the PV reclaims it, not the collector.
const DISK_LAG = 600;

// A deleted claim or disk lights, holds, fades to the terminated shade, and takes its highlight back
// as the fade ends (S-18): a deleted block cannot stay the thing the step points at. The light is an
// F.set, not `lights`, because the static path must not show it.
const vanish = (keys, at, plus = 0) => [
  F.set({ on: keys[0], lit: keys, at, plus }),
  ...keys.map(target => F.fade({
    target, from: 1, to: T, dur: FADE.out, fill: 'forwards', easing: 'ease-in',
    at, plus: plus + LIGHT_HOLD, unlight: [target],
  })),
];

// A removed Pod blinks first and fades once the blink is spent (M-08), its lane and relation with it.
const removePod = (at, withLanes) => [
  F.pulse({ pod: 'pod', at }),
  ...['pod', ...withLanes].map(target => F.fade({
    target, from: 1, to: T, dur: FADE.out, at, plus: BEAT.afterPulse, fill: 'forwards', easing: 'ease-in',
  })),
];

const D_CLAIMS = ['dDc0', 'dDc1', 'dDc2'];
const D_DISKS = ['dDk0', 'dDk1', 'dDk2'];

// Set-delete: StatefulSet web goes at entry, its Pod blinks once the set is gone, and the collector
// sends once the Pod has faded.
const STS_GONE = BEAT.lead + FADE.out;                           // 1500
const POD_GONE = STS_GONE + BEAT.afterPulse + FADE.out;          // 3000

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    sublabels: { ...subs(), sts: 'replicas: 3' },
    wires: BLANK,
    opacity: stage(),
  },
  {
    id: 'mark',
    duration: 3200,
    narration: 'Each row flips one field of the policy on StatefulSet web while the other stays at the default, Retain. A field at Retain adds no ownerReference, so its event deletes no claim. Under whenDeleted Delete, the controller writes an ownerReference to web on every claim, existing or new.',
    sublabels: { ...subs({ dD: 'owner: web' }), sts: 'replicas: 3' },
    wires: BLANK,
    opacity: stage({ ownD: 1 }),
    // The controller of web is the writer, so web lights at entry. The three claims light as the
    // reference lands on them, and the Retain cell beside them stays exactly as it was.
    lit: ['sts'],
    rewind: { opacity: { ownD: '0' }, sublabels: subs() },
    flow: [
      F.reveal({ target: 'ownD', delay: BEAT.lead, from: 0, name: 'mark', lights: D_CLAIMS }),
      F.set({ at: 'mark', sublabels: { dDc0: 'owner: web', dDc1: 'owner: web', dDc2: 'owner: web' } }),
    ],
  },
  {
    id: 'scale-down',
    duration: 6200,
    narration: 'Scale web to two and the controller deletes the highest ordinal, Pod web-2. Retain leaves data-web-2 Bound with its data. Delete first makes Pod web-2 its owner, so once the Pod is gone the garbage collector deletes the claim, and its PV, set to Delete, takes the disk.',
    sublabels: { ...subs({ sD2: 'owner: web-2', dD: 'owner: web' }), sts: 'replicas: 2' },
    wires: verdicts({ ...ROW_S_DOWN, ...PV_DEL }),
    opacity: stage({ pod: T, sDc2: T, sDk2: T, ownS: 1, ownD: 1 }),
    // The controller sends first and the collector later, so both actors light at entry. Every cue on
    // a claim or disk is an arrival, taken back as it fades.
    lit: ['sts', 'gc'],
    rewind: {
      opacity: { pod: 1, podLane: 1, sDc2: 1, sDk2: 1, ownS: '0' },
      sublabels: { sDc2: 'Bound' },
      wires: verdicts(PV_DEL),
    },
    flow: [
      // The reference is written BEFORE the Pod is deleted, and only on the claim of the removed
      // ordinal, which lights as it lands the way the mark claims do (an F.set, off the static path).
      F.reveal({ target: 'ownS', delay: BEAT.lead - REVEAL_MS, from: 0, name: 'own' }),
      F.set({ on: 'sDc2', at: 'own', lit: ['sDc2'], sublabels: { sDc2: 'owner: web-2' } }),
      F.route({ points: POD_LANE, after: 'own', name: 'del' }),
      F.tag({ text: 'delete', points: POD_LANE, after: 'own', ...POD_TAG }),
      ...removePod('del', ['podLane', 'ownS']),
      // Both cells answer the same event on the same beat: the Retain one by doing nothing at all.
      F.set({ at: 'del', plus: BEAT.afterPulse + FADE.out, wires: { vsR: ROW_S_DOWN.sR } }),
      F.route({ points: GC_S, at: 'del', plus: BEAT.afterPulse + FADE.out + BEAT.afterHop, name: 'gc' }),
      F.tag({ text: 'delete', points: GC_S, at: 'del', plus: BEAT.afterPulse + FADE.out + BEAT.afterHop, ...GC_TAG, fn: tagFn }),
      ...vanish(['sDc2'], 'gc'),
      ...vanish(['sDk2'], 'gc', DISK_LAG),
      F.set({ at: 'gc', plus: DISK_LAG + LIGHT_HOLD + FADE.out, wires: { vsD: ROW_S_DOWN.sD } }),
    ],
  },
  {
    id: 'scale-up',
    duration: 4600,
    narration: 'Scale back to three and the controller creates web-2 again. Under Retain it mounts the same data-web-2, data intact. Under Delete a fresh claim of the same name comes first, and with WaitForFirstConsumer binding its empty volume is provisioned once the Pod is created.',
    sublabels: { ...subs({ dD: 'owner: web' }), sts: 'replicas: 3' },
    wires: verdicts({ ...ROW_S_UP, ...PV_DEL }),
    opacity: stage({ ownD: 1 }),
    lit: ['sts'],
    // The Pod waits at the pending shade under a full lane, never a faint one (M-24), and the fresh
    // claim and disk rise from the ghosts the scale-down left.
    rewind: {
      opacity: { pod: OPACITY.pending, sDc2: T, sDk2: T },
      wires: verdicts({ ...ROW_S_DOWN, ...PV_DEL }),
    },
    flow: [
      // The controller creates the claim before the Pod, then the Pod, then the new volume is bound.
      F.reveal({ target: 'sDc2', delay: BEAT.lead, from: T, name: 'mint', lights: ['sDc2'] }),
      F.route({ points: POD_LANE, after: 'mint', name: 'make' }),
      F.tag({ text: 'create', points: POD_LANE, after: 'mint', ...POD_TAG }),
      // The Pod blinks as the create lands, as it does when the delete lands on scale-down.
      F.pulse({ pod: 'pod', at: 'make' }),
      F.reveal({ target: 'pod', at: 'make', from: OPACITY.pending, name: 'up' }),
      F.set({ at: 'up', wires: { vsR: ROW_S_UP.sR } }),
      F.reveal({ target: 'sDk2', after: 'up', from: T, name: 'disk', lights: ['sDk2'] }),
      F.set({ at: 'disk', wires: { vsD: ROW_S_UP.sD } }),
    ],
  },
  {
    id: 'set-delete',
    duration: 6800,
    narration: 'Delete web with the default background cascade and its Pods go too. Under Retain all three claims stay Bound with no owner until deleted by hand. Under Delete the ownerReference to web lets the garbage collector delete every claim after its Pod, and each PV set to Delete takes its disk.',
    sublabels: { ...subs({ dD: 'owner: web' }), sts: 'deleted' },
    wires: verdicts({ ...ROW_S_UP, ...ROW_D_GONE, ...PV_DEL }),
    opacity: stage({ sts: T, pod: T, dDc: T, dDk: T, ownD: 1 }),
    // web is deleted by its user, not by anything drawn: the collector is the one actor that sends.
    lit: ['gc'],
    rewind: {
      opacity: { sts: 1, pod: 1, podLane: 1, ownD: 1, ...Object.fromEntries([...D_CLAIMS, ...D_DISKS].map(k => [k, 1])) },
      sublabels: { sts: 'replicas: 3' },
      wires: verdicts({ ...ROW_S_UP, ...PV_DEL }),
    },
    flow: [
      ...['sts', 'podLane', 'ownD'].map(target => F.fade({
        target, from: 1, to: T, dur: FADE.out, delay: BEAT.lead, fill: 'forwards', easing: 'ease-in',
      })),
      F.set({ delay: STS_GONE, sublabels: { sts: 'deleted' } }),
      F.pulse({ pod: 'pod', delay: STS_GONE }),
      F.fade({ target: 'pod', from: 1, to: T, dur: FADE.out, delay: STS_GONE + BEAT.afterPulse, fill: 'forwards', easing: 'ease-in' }),
      F.route({ points: GC_D, delay: POD_GONE + BEAT.afterHop, name: 'gc' }),
      F.set({ at: 'gc', wires: { vdR: ROW_D_GONE.dR } }),
      ...vanish(D_CLAIMS, 'gc'),
      ...vanish(D_DISKS, 'gc', DISK_LAG),
      F.set({ at: 'gc', plus: DISK_LAG + LIGHT_HOLD + FADE.out, wires: { vdD: ROW_D_GONE.dD } }),
    ],
  },
  {
    id: 'disk',
    duration: 4200,
    narration: 'Delete removes claims, never disks directly. Had the PVs said Retain, the same garbage collection would delete the three claims and leave every volume Released with its data. The reclaimPolicy on each PV decides the disk, not this policy.',
    sublabels: { ...subs({ dD: 'owner: web' }), sts: 'deleted' },
    wires: verdicts({ ...ROW_S_UP, dR: ROW_D_GONE.dR, dD: 'claims deleted, disks Released', pv: 'if the PVs say Retain' }),
    // Only the three claims of the counterfactual cell are replayed. Everything else stands where
    // set-delete left it, and the disks stand because in this branch nothing reclaims them.
    opacity: stage({ sts: T, pod: T, dDc: T, dDk: 1, ownD: 1 }),
    lit: ['gc'],
    rewind: {
      opacity: Object.fromEntries(D_CLAIMS.map(k => [k, 1])),
      wires: { vdD: '' },
    },
    flow: [
      F.route({ points: GC_D, delay: BEAT.lead, name: 'gc' }),
      ...vanish(D_CLAIMS, 'gc'),
      F.light({ targets: D_DISKS, at: 'gc', plus: DISK_LAG }),
      F.set({ at: 'gc', plus: DISK_LAG, wires: { vdD: 'claims deleted, disks Released' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
