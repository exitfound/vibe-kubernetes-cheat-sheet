import { P, F, defineCard, OPACITY, BEAT, makeRidingLabel } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-reclaim-policy.md


// Every tier declares its own bottom alongside its top, so the lanes between tiers are built from
// those edges rather than from typed y values and re-solve when a tier moves.
// Every block is 80 tall (NET.L-01), and the three gaps between the four tiers are equal, so the
// shelf still ends at 490 and the five text rows under it keep their room.
const BOX_H = 80, TIER_GAP = 40;
const PVC_Y = 30, PVC_H = BOX_H, PVC_BOTTOM = PVC_Y + PVC_H;   // 110
const PV_Y = PVC_BOTTOM + TIER_GAP, PV_H = BOX_H, PV_TOP = PV_Y, PV_BOTTOM = PV_Y + PV_H;  // 150 / 230
const BAND_Y = PV_BOTTOM + TIER_GAP, BAND_H = BOX_H, BAND_TOP = BAND_Y, BAND_BOTTOM = BAND_Y + BAND_H;  // 270 / 350
const DISK_Y = BAND_BOTTOM + TIER_GAP, DISK_H = 100, DISK_TOP = DISK_Y;   // 390, shelf ends at 490
// 176 wide, not 232: two columns centred on 600 from a left edge of 400 have 400 between them.
const COL_W = 176;

const LEFT_X = 400, STACK_W = 400;                             // 400..800, so the center is 600
const COL_GAP = STACK_W - COL_W * 2;                           // 48
const DEL_X = LEFT_X, RET_X = LEFT_X + COL_W + COL_GAP;        // 400 / 624
const DEL_CX = DEL_X + COL_W / 2, RET_CX = RET_X + COL_W / 2;  // 488 / 712
const BAND_X = LEFT_X, BAND_W = STACK_W;
const RET_RIGHT = RET_X + COL_W;                               // 800

// The two actors outside the stack flank it, both 232 by 80 (NET.L-01): the StorageClass left of
// the provisioner it feeds, which stands below the panel (L-03), and the administrator right of the
// claims, where the panel leaves the only room level with them. Each sits one COL_GAP off the stack.
const SIDE_W = 232;
const SC_X = LEFT_X - COL_GAP - SIDE_W, SC_Y = BAND_Y;          // 120..352
const SIDE_X = RET_RIGHT + COL_GAP, SIDE_CX = SIDE_X + SIDE_W / 2;   // 848, 964
const ADMIN_Y = PVC_Y;

// Up and down between a volume and the provisioner are two lanes, a pair 24 apart (LANE_DY 12).
const LANE_DY = 12;

const SPEC_GAP = 14;
const SPEC_Y = DISK_Y + DISK_H / 2 + 5 + SPEC_GAP;             // 485
const VERDICT_Y = DISK_Y + DISK_H + 28;                        // 518
// The Retain lane down to the disk is never ridden, and this says so in the gap it crosses.
const NO_CALL_X = RET_CX + 48, NO_CALL_Y = BAND_BOTTOM + TIER_GAP / 2 + 4;   // 760 / 374

const CHIP_W = COL_W;                        // each chip is exactly as wide as the column above it
const CHIP_H = 34;
const CHIP_ROW_1 = VERDICT_Y + 18;           // 536: the volumes
const CHIP_ROW_2 = CHIP_ROW_1 + CHIP_H + 8;  // 578: their disks, strip ends at 612


// The same points arrays feed the static lanes and the balls, so the two cannot drift apart.
// PV to provisioner is the policy READ, provisioner to PV the policy WRITE when a volume is made.
const up = (cx) => [[cx - LANE_DY, BAND_TOP], [cx - LANE_DY, PV_BOTTOM]];
const down = (cx) => [[cx + LANE_DY, PV_BOTTOM], [cx + LANE_DY, BAND_TOP]];
const W_DEL_STAMP = up(DEL_CX), W_RET_STAMP = up(RET_CX);
const W_DEL_POLICY = down(DEL_CX), W_RET_POLICY = down(RET_CX);
const W_DEL_WIPE = [[DEL_CX, BAND_BOTTOM], [DEL_CX, DISK_TOP]];
const W_RET_WIPE = [[RET_CX, BAND_BOTTOM], [RET_CX, DISK_TOP]];  // drawn, never travelled: that is Retain
const W_SC = [[SC_X + SIDE_W, SC_Y + BOX_H / 2], [BAND_X, BAND_Y + BAND_H / 2]];
const W_ADMIN_PV = [[SIDE_CX, ADMIN_Y + BOX_H], [SIDE_CX, PV_Y + PV_H / 2], [RET_RIGHT, PV_Y + PV_H / 2]];
// Every vertical hop crosses a 40 gap from one box floor to the next box top, so a tag riding above
// its ball is born inside the SENDER. It fades in once it has cleared that floor instead, and parks
// in the gap above the receiver as before (./CARDS/storage-reclaim-policy.md).
const gapTag = makeRidingLabel({ role: 'storage', emergeMode: true });
const GAP_TAG = { fn: gapTag, emerge: 400 };
// The admin lane ends on the PV right face, so a centred tag parks half over it: it rides right of
// the ball and stops 8 short of the face. It leaves the admin floor, so it emerges too, sooner.
const ADMIN_TAG_DX = 51;
// A policy tag rides the DOWN lane of a pair, and centred on it (86 wide at 1100x800) it would lie
// across the up lane 24 to its left. It rides right of its ball, clear of both lanes and the column.
const POLICY_TAG_DX = 50;
// A lane that is born on this step fades in over this long and is whole just before its ball shows.
const LANE_IN_MS = 300, LANE_EARLY = 400;

// Shorter than FADE.out because these land ON a beat inside a step: the wipe has to read as caused
// by the ball that just arrived. The Bound cross-fade shares it so its two halves swap at one rate.
const REMOVE_MS = 500;

// A block, its caption or its lane taken away exactly when the ball reaches it, dropping the
// highlight that same ball left on it: a faded block never keeps a lit stroke.
const removeAt = (target, at, plus = 0, to = OPACITY.terminated) => F.fade({
  target, to, dur: REMOVE_MS, at, plus, fill: 'forwards', unlight: [target],
});

// A lane born mid-step, whole LANE_EARLY before the arrival its ball leaves `after`, so it stands
// complete before that ball fades in (A-15) and points at an empty slot for as short as that allows.
const laneIn = (target, at) => F.fade({ target, from: 0, to: 1, dur: LANE_IN_MS, at, plus: -LANE_EARLY - LANE_IN_MS, easing: 'ease-out' });

// A relation, dashed and arrowhead-free, because a bound pair carries no traffic.
const boundLink = (key, cx) => P.relation({ key, points: [[cx, PVC_BOTTOM], [cx, PV_TOP]], dash: '5 5' });

const lane = (points, key) => P.lane({ key, points, dashed: true, dim: true });

const spec = (cx, key, text) => P.tag({ key, x: cx, y: SPEC_Y, text });

export const SCENE = {
  'aria-label': 'Reclaim policy decides whether deleting a claim also destroys the real disk behind its PersistentVolume. The external-provisioner copies the policy from StorageClass gp3 onto both volumes as Delete, and an administrator patches the right one to Retain. Both claims are deleted and both volumes go to Released. Under Delete the provisioner calls DeleteVolume, the disk is destroyed and the PV removed. Under Retain it makes no call and the disk survives, but a new claim of the same class is not offered the Released volume and gets a new empty disk instead, and even deleting the retained PV by hand leaves its disk behind in the backend.',
  parts: [
    P.defs(),
    P.box({ key: 'delPvc', x: DEL_X, y: PVC_Y, w: COL_W, h: PVC_H, label: 'PVC data-a', sublabel: 'Bound' }),
    P.box({ key: 'delPv', x: DEL_X, y: PV_Y, w: COL_W, h: PV_H, label: 'PV del', sublabel: 'reclaim: Delete' }),
    P.cylinder({ key: 'delDisk', x: DEL_X, y: DISK_Y, w: COL_W, h: DISK_H, label: 'vol-aaa' }),
    // The claim that arrives after the first two are deleted takes the freed left column, and it,
    // its volume and its disk are their OWN blocks, born invisible.
    P.box({ key: 'newPvc', x: DEL_X, y: PVC_Y, w: COL_W, h: PVC_H, label: 'PVC data-c', sublabel: 'Pending', opacity: 0 }),
    P.box({ key: 'newPv', x: DEL_X, y: PV_Y, w: COL_W, h: PV_H, label: 'PV new', sublabel: 'reclaim: Delete', opacity: 0 }),
    P.cylinder({ key: 'newDisk', x: DEL_X, y: DISK_Y, w: COL_W, h: DISK_H, label: 'vol-ccc', opacity: 0 }),
    P.box({ key: 'retPvc', x: RET_X, y: PVC_Y, w: COL_W, h: PVC_H, label: 'PVC data-b', sublabel: 'Bound' }),
    P.box({ key: 'retPv', x: RET_X, y: PV_Y, w: COL_W, h: PV_H, label: 'PV ret', sublabel: 'reclaim: Delete' }),
    P.cylinder({ key: 'retDisk', x: RET_X, y: DISK_Y, w: COL_W, h: DISK_H, label: 'vol-bbb' }),
    // One provisioner for both columns: the reclaim policy is a field it writes and reads, not two machines.
    P.box({ key: 'band', x: BAND_X, y: BAND_Y, w: BAND_W, h: BAND_H, label: 'External-provisioner', sublabel: 'CSI sidecar, writes and reads the reclaim policy' }),
    P.box({ key: 'sc', x: SC_X, y: SC_Y, w: SIDE_W, h: BOX_H, label: 'StorageClass gp3', sublabel: 'reclaimPolicy: Delete' }),
    P.box({ key: 'admin', x: SIDE_X, y: ADMIN_Y, w: SIDE_W, h: BOX_H, label: 'Administrator', sublabel: 'kubectl patch, delete pv', opacity: 0 }),
    boundLink('delBound', DEL_CX),
    boundLink('newBound', DEL_CX),
    boundLink('retBound', RET_CX),
    // Every lane that ends on a block born or removed mid-story is keyed, so it follows that block.
    lane(W_DEL_STAMP, 'lDelStamp'),
    lane(W_DEL_POLICY, 'lDelPolicy'),
    lane(W_DEL_WIPE, 'lDelWipe'),
    lane(W_RET_STAMP, 'lRetStamp'),
    lane(W_RET_POLICY, 'lRetPolicy'),
    lane(W_RET_WIPE),
    lane(W_SC),
    P.lane({ key: 'wAdminPv', points: W_ADMIN_PV, dashed: true, dim: true, opacity: 0 }),
    P.wire({ key: 'noCall', x: NO_CALL_X, y: NO_CALL_Y }),
    P.wire({ key: 'del', x: DEL_CX, y: VERDICT_Y }),
    P.wire({ key: 'ret', x: RET_CX, y: VERDICT_Y }),
    spec(DEL_CX, 'delSpec', 'real disk, EBS'),
    spec(DEL_CX, 'newSpec', 'new disk, empty'),
    spec(RET_CX, 'retSpec', 'real disk, EBS'),
    P.chip({ key: 'delChip', x: DEL_X, y: CHIP_ROW_1, w: CHIP_W, h: CHIP_H, name: 'PV del', value: 'Bound' }),
    P.chip({ key: 'delDiskChip', x: DEL_X, y: CHIP_ROW_2, w: CHIP_W, h: CHIP_H, name: 'vol-aaa', value: 'holds data' }),
    P.chip({ key: 'newChip', x: DEL_X, y: CHIP_ROW_1, w: CHIP_W, h: CHIP_H, name: 'PV new', value: 'none', opacity: 0 }),
    P.chip({ key: 'newDiskChip', x: DEL_X, y: CHIP_ROW_2, w: CHIP_W, h: CHIP_H, name: 'vol-ccc', value: 'none', opacity: 0 }),
    P.chip({ key: 'retChip', x: RET_X, y: CHIP_ROW_1, w: CHIP_W, h: CHIP_H, name: 'PV ret', value: 'Bound' }),
    P.chip({ key: 'retDiskChip', x: RET_X, y: CHIP_ROW_2, w: CHIP_W, h: CHIP_H, name: 'vol-bbb', value: 'holds data' }),
    P.packets(),
  ],
  reset: {
    keys: ['delPvc', 'delPv', 'delDisk', 'newPvc', 'newPv', 'newDisk', 'retPvc', 'retPv', 'retDisk',
      'band', 'sc', 'admin', 'delChip', 'delDiskChip', 'newChip', 'newDiskChip', 'retChip', 'retDiskChip'],
  },
};

const T = OPACITY.terminated;

// Every step pins EVERY opacity that any step can change, so a step can never inherit a stale one
// and a cancel mid-flight always lands on this step's own end state. The left column holds either
// the deleted stack or the new one, so its chips and lanes follow whichever of the two is there.
const stage = ({ delPvc, delPv, delDisk, newPvc = 0, newPv = 0, newDisk = 0, retPvc, retPv = 1, admin = 0, delBound, newBound = 0, retBound }) => ({
  delPvc, delPv, delDisk, newPvc, newPv, newDisk, retPvc, retPv, admin, delBound, newBound, retBound,
  delSpec: delDisk, newSpec: newDisk, retSpec: 1,   // a caption lives and dies with its disk
  // A lane is only as present as its fainter end, and the provisioner is drawn on every step.
  lDelStamp: Math.max(delPv, newPv), lDelPolicy: Math.max(delPv, newPv), lDelWipe: Math.max(delDisk, newDisk),
  lRetStamp: retPv, lRetPolicy: retPv,
  wAdminPv: admin,
  delChip: newPv ? 0 : 1, delDiskChip: newDisk ? 0 : 1, newChip: newPv ? 1 : 0, newDiskChip: newDisk ? 1 : 0,
});

const chips = (del, delDisk, ret, retDisk, nw = 'none', nwDisk = 'none') => ({
  delChip: del, delDiskChip: delDisk, retChip: ret, retDiskChip: retDisk, newChip: nw, newDiskChip: nwDisk,
});

// The claims both stand, bound, on the two steps before anything is deleted.
const BOTH_BOUND = { delPvc: 1, delPv: 1, delDisk: 1, retPvc: 1, delBound: 1, retBound: 1 };
// Once the Delete branch has run its whole left stack is gone, and both claims are deleted.
const DEL_GONE = { delPvc: T, delPv: T, delDisk: T, retPvc: T, delBound: 0, retBound: 0 };
// The new claim takes the left column, so the ghosts that stood there leave it entirely.
const LEFT_NEW = { delPvc: 0, delPv: 0, delDisk: 0, newPvc: 1, newPv: 1, newDisk: 1, retPvc: T, delBound: 0, newBound: 1, retBound: 0 };

const SUBS = (retPv, newPvc = 'Pending', claims = 'Bound') => ({
  delPvc: claims, retPvc: claims, retPv, newPvc,
});

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('Bound', 'holds data', 'Bound', 'holds data'),
    sublabels: SUBS('reclaim: Delete'),
    wires: { noCall: '' },
    opacity: stage(BOTH_BOUND),
  },
  {
    id: 'stamp',
    duration: 3200,
    narration: 'Every PV carries a reclaim policy, set when the volume is made. The external-provisioner copied it from StorageClass gp3 onto both volumes here, and gp3 says Delete, which is also what a class gets when it names no policy. As things stand both disks die with their claims.',
    chipsCued: chips('Bound', 'holds data', 'Bound', 'holds data'),
    sublabels: SUBS('reclaim: Delete'),
    wires: { noCall: '' },
    opacity: stage(BOTH_BOUND),
    // The class is where the value comes from, so it sends first, lit from entry (M-18a).
    lit: ['sc'],
    flow: [
      F.route({ points: W_SC, delay: BEAT.lead, name: 'cls' }),
      F.light({ targets: ['band'], at: 'cls' }),
      F.route({ points: W_DEL_STAMP, after: 'cls', lights: ['delPv'] }),
      F.tag({ text: 'Delete', points: W_DEL_STAMP, after: 'cls', ...GAP_TAG }),
      F.route({ points: W_RET_STAMP, after: 'cls', lights: ['retPv'] }),
      F.tag({ text: 'Delete', points: W_RET_STAMP, after: 'cls', ...GAP_TAG }),
    ],
  },
  {
    id: 'patch',
    duration: 3000,
    narration: 'The field is not frozen. An administrator runs kubectl patch pv on the right volume and sets its persistentVolumeReclaimPolicy to Retain. Only that one PV changes: the class and every other volume it made keep Delete. This is how you protect the data on a volume before you delete its claim.',
    chipsCued: chips('Bound', 'holds data', 'Bound', 'holds data'),
    sublabels: SUBS('reclaim: Retain'),
    wires: { noCall: '', ret: 'patched to Retain' },
    opacity: stage({ ...BOTH_BOUND, admin: 1 }),
    lit: ['admin'],
    // The new value is what the patch WRITES, so the sublabel and the caption wait for it to land.
    rewind: { sublabels: { retPv: 'reclaim: Delete' }, wires: { ret: '' } },
    flow: [
      F.route({ points: W_ADMIN_PV, delay: BEAT.lead, name: 'patch' }),
      F.tag({ text: 'policy: Retain', points: W_ADMIN_PV, delay: BEAT.lead, dx: ADMIN_TAG_DX, fn: gapTag, emerge: 160 }),
      F.light({ targets: ['retPv'], at: 'patch' }),
      F.set({ at: 'patch', sublabels: { retPv: 'reclaim: Retain' }, wires: { ret: 'patched to Retain' } }),
    ],
  },
  {
    id: 'delete-pvc',
    duration: 2400,
    // Packet-less and Pod-less, and no block flashes: the two claims going to the terminating
    // shade under a Released chip IS the movement, so a flash would compete with it.
    narration: 'Both claims are deleted with kubectl delete pvc. The Bound links break and both volumes move to the Released phase, which means only that the claim they belonged to is gone. Nothing has touched the disks yet. What happens next is decided by the policy each volume now carries.',
    chipsCued: chips('Released', 'holds data', 'Released', 'holds data'),
    sublabels: SUBS('reclaim: Retain', 'Pending', 'Terminating'),
    wires: { noCall: '' },
    // The claims are on their way out, so they end this step faded but still readable.
    opacity: stage({ ...BOTH_BOUND, delPvc: OPACITY.terminating, retPvc: OPACITY.terminating, delBound: 0, retBound: 0 }),
    lit: ['delPv', 'retPv'],
  },
  {
    id: 'delete-branch',
    duration: 4200,
    narration: 'The external-provisioner reads Delete on the left volume and calls DeleteVolume on the CSI driver. The backend destroys the real disk, and only then is the PV object removed. Convenient for scratch data and unforgiving for anything you meant to keep, because nothing of it is left to recover.',
    chipsCued: chips('removed', 'deleted', 'Released', 'holds data'),
    sublabels: SUBS('reclaim: Retain', 'Pending', 'deleted'),
    wires: { noCall: '', del: 'disk deleted, PV removed' },
    opacity: stage({ ...DEL_GONE, retPvc: OPACITY.terminating }),
    // `band` is absent from lit: F.light cues it on the arrival instead, and flowLights re-derives it
    // for the reduced path. rewind revives the objects and lanes the balls then ride and kill, and
    // holds the two chips and the caption until the ball that earns them lands.
    rewind: {
      opacity: { delPv: 1, delDisk: 1, delSpec: 1, lDelStamp: 1, lDelPolicy: 1, lDelWipe: 1 },
      lit: ['delPv'],
      chips: { delChip: 'Released', delDiskChip: 'holds data' },
      wires: { del: '' },
    },
    flow: [
      F.route({ points: W_DEL_POLICY, delay: BEAT.lead, name: 'policy' }),
      F.tag({ text: 'policy: Delete', points: W_DEL_POLICY, delay: BEAT.lead, dx: POLICY_TAG_DX, ...GAP_TAG }),
      F.light({ targets: ['band'], at: 'policy' }),
      F.route({ points: W_DEL_WIPE, after: 'policy', name: 'wipe' }),
      F.tag({ text: 'DeleteVolume', points: W_DEL_WIPE, after: 'policy', ...GAP_TAG }),
      // An F.set on the disk, NOT `lights`: the fade below takes the class off again, and the reduced
      // path returned before any of this, so it must not show the light at all.
      F.set({ on: 'delDisk', lit: ['delDisk'], at: 'wipe' }),
      F.set({ at: 'wipe', plus: 180, chipsCued: { delDiskChip: 'deleted' } }),
      removeAt('delDisk', 'wipe', 180),
      removeAt('delSpec', 'wipe', 180),
      removeAt('lDelWipe', 'wipe', 180),
      F.set({ at: 'wipe', plus: 580, chipsCued: { delChip: 'removed' }, wires: { del: 'disk deleted, PV removed' } }),
      removeAt('delPv', 'wipe', 580),
      removeAt('lDelStamp', 'wipe', 580),
      removeAt('lDelPolicy', 'wipe', 580),
    ],
  },
  {
    id: 'retain-branch',
    duration: 3000,
    narration: 'The same provisioner reads Retain on the right volume and makes no call at all, so the disk and every byte on it survive. The volume stays Released, still carrying the claimRef of a claim that no longer exists, and nothing in the cluster will touch it again on its own.',
    chipsCued: chips('removed', 'deleted', 'Released', 'data intact'),
    sublabels: SUBS('reclaim: Retain', 'Pending', 'deleted'),
    wires: { noCall: 'no call', ret: 'nothing touched, data kept' },
    opacity: stage(DEL_GONE),
    // Static end state, which the reduced replay also snaps to. The disk is NOT lit: surviving
    // intact reads off the full opacity it keeps beside a Delete column at the terminated shade.
    lit: ['retPv'],
    // The policy hop is made on this side too, and it is the SECOND hop that never happens: the
    // lane down to the disk is drawn and stays empty. Retain shown as an absence, not as a gap.
    // The verdict under the disk and its chip are what the read DECIDES, so both wait for it to land.
    rewind: { chips: { retDiskChip: 'holds data' }, wires: { noCall: '', ret: '' } },
    flow: [
      F.route({ points: W_RET_POLICY, delay: BEAT.lead, name: 'policy' }),
      F.tag({ text: 'policy: Retain', points: W_RET_POLICY, delay: BEAT.lead, dx: POLICY_TAG_DX, ...GAP_TAG }),
      F.light({ targets: ['band'], at: 'policy' }),
      F.set({ at: 'policy', chipsCued: { retDiskChip: 'data intact' }, wires: { noCall: 'no call', ret: 'nothing touched, data kept' } }),
    ],
  },
  {
    id: 'new-claim',
    duration: 4400,
    narration: 'A fresh claim data-c of the same class arrives, and it does not get the old disk. A Released volume is not offered to a new claim, so the provisioner reads gp3 again and makes a brand new, empty vol-ccc. The old data sits one column away, out of reach and still billed.',
    chipsCued: chips('removed', 'deleted', 'Released', 'orphaned', 'Bound', 'new, empty'),
    sublabels: SUBS('reclaim: Retain', 'Bound', 'deleted'),
    wires: { noCall: 'no call', del: 'new disk, new PV', ret: 'skipped: still Released' },
    opacity: stage(LEFT_NEW),
    // The class sends first, as on the stamp step. The disk and the volume are what the two calls
    // CREATE, so each is revealed by its own ball, and the claim binds when the volume exists.
    lit: ['sc'],
    // The left lanes lead to blocks that do not exist yet, so each fades in as its call departs
    // rather than pointing into an empty column for the whole lead.
    rewind: {
      opacity: { newBound: 0, lDelWipe: 0, lDelStamp: 0, lDelPolicy: 0 },
      sublabels: { newPvc: 'Pending' },
      chips: { newChip: 'none', newDiskChip: 'none' },
      wires: { del: '' },
    },
    flow: [
      F.route({ points: W_SC, delay: BEAT.lead, name: 'cls' }),
      F.light({ targets: ['band'], at: 'cls' }),
      laneIn('lDelWipe', 'cls'),
      F.route({ points: W_DEL_WIPE, after: 'cls', name: 'mk' }),
      laneIn('lDelStamp', 'mk'),
      laneIn('lDelPolicy', 'mk'),
      F.tag({ text: 'CreateVolume', points: W_DEL_WIPE, after: 'cls', ...GAP_TAG }),
      F.reveal({ target: 'newDisk', at: 'mk' }),
      F.reveal({ target: 'newSpec', at: 'mk' }),
      F.set({ at: 'mk', chipsCued: { newDiskChip: 'new, empty' } }),
      F.route({ points: W_DEL_STAMP, after: 'mk', name: 'pv' }),
      F.tag({ text: 'Delete', points: W_DEL_STAMP, after: 'mk', ...GAP_TAG }),
      F.reveal({ target: 'newPv', at: 'pv' }),
      F.light({ targets: ['newPv', 'newPvc'], at: 'pv' }),
      F.fade({ target: 'newBound', from: 0, to: 1, dur: REMOVE_MS, at: 'pv', fill: 'forwards', easing: 'ease-out' }),
      F.set({ at: 'pv', sublabels: { newPvc: 'Bound' }, chipsCued: { newChip: 'Bound' }, wires: { del: 'new disk, new PV' } }),
    ],
  },
  {
    id: 'cleanup',
    duration: 3200,
    narration: 'Clean up by hand and the trap shows once more. Deleting PV ret removes the object, and vol-bbb stays: under Retain nothing in the cluster deletes the disk, not even deleting its PV. It has to be deleted in the storage backend, or kept and given a new PV by hand before a claim can use it.',
    chipsCued: chips('removed', 'deleted', 'deleted', 'still billed', 'Bound', 'new, empty'),
    sublabels: SUBS('reclaim: Retain', 'Bound', 'deleted'),
    wires: { noCall: 'no call', del: 'new disk, new PV', ret: 'PV gone, disk still there' },
    opacity: stage({ ...LEFT_NEW, retPv: T, admin: 1 }),
    lit: ['admin'],
    // The PV and its two lanes are what the delete takes away, so they stand until the ball lands.
    rewind: {
      opacity: { retPv: 1, lRetStamp: 1, lRetPolicy: 1 },
      chips: { retChip: 'Released', retDiskChip: 'orphaned' },
      wires: { ret: 'skipped: still Released' },
    },
    flow: [
      F.route({ points: W_ADMIN_PV, delay: BEAT.lead, name: 'del' }),
      F.tag({ text: 'delete pv', points: W_ADMIN_PV, delay: BEAT.lead, dx: ADMIN_TAG_DX, fn: gapTag, emerge: 160 }),
      F.set({ on: 'retPv', lit: ['retPv'], at: 'del' }),
      F.set({ at: 'del', plus: 180, chipsCued: { retChip: 'deleted', retDiskChip: 'still billed' }, wires: { ret: 'PV gone, disk still there' } }),
      removeAt('retPv', 'del', 180),
      removeAt('lRetStamp', 'del', 180),
      removeAt('lRetPolicy', 'del', 180),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
