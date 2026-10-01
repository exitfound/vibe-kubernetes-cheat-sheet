import { P, F, defineCard, chipStrip, BEAT, FADE, OPACITY, makeRidingLabel } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-generic-ephemeral-volume.md


// Pod, PVC and PV all sit on this axis and the two machinery blocks flank it symmetrically.
const CX = 600;
// The column lanes are an out and back pair 24 apart, mirrored about CX (L-12), so both stand on
// every step: down (mint, the cascade) right of the axis, up (the mount) left of it.
const DOWN_X = CX + 12, UP_X = CX - 12;

// The catalog Pod (NET.L-01): 232 by 104 around a 192 by 44 app box 26 under the Pod label.
const POD_W = 232, POD_H = 104, POD_Y = 36;
const POD_X = CX - POD_W / 2, POD_BOTTOM = POD_Y + POD_H;               // 484 / 140
const APP_W = 192, APP_H = 44, APP_DY = 26;

// Every row block is the catalog actor block, 232 by 80 (NET.L-01).
const ROW_Y = 212, ROW_H = 80, ROW_BOTTOM = ROW_Y + ROW_H;              // 292
const ROW_MY = ROW_Y + ROW_H / 2;                                       // 252
const CLAIM_W = 232, SIDE_W = 232, SIDE_SPREAD = 340;
const SC_CX = CX - SIDE_SPREAD, PROV_CX = CX + SIDE_SPREAD;             // 260 / 940

// The gap below the claim row equals the gap above it, so ownership and binding are one rhythm.
const PV_W = 200, PV_H = 110, PV_Y = ROW_BOTTOM + (ROW_Y - POD_BOTTOM);  // 364
const PV_TOP = PV_Y, PV_MY = PV_Y + PV_H / 2;                           // 364 / 419

const CAPTION_Y = 500;
const CHIPS_Y = 570;              // 34 above the canvas floor, equal to the top margin

const CHIP_W = 232, CHIP_GAP = 16;
const STRIP = chipStrip({ w: CHIP_W, gap: CHIP_GAP });      // 976 wide, x0 112, so it centres on CX

const ROW_TAG_DY = ROW_Y - ROW_MY - 6;    // -46: a tag on a row hop rides 3 above the row top

// Every tag lives exactly as long as its ball (M-30a): in before departure, out as the ball lands.
const tagFn = makeRidingLabel({ role: 'storage', inMs: 200, outMs: 200, hold: 0 });
// A column hop is 72 long between two blocks as wide as the column, so a tag beside its lane sits
// inside one of them at rest. It rides outside the column on its own lane's side, above its ball, and
// 24 off the column face: right, that clears the owner caption, which ends 16.5 out.
const TAG_GAP = 24;
// side +1 right of the column, -1 left. w is the tag ink, measured. dx is from the lane the tag rides.
const beside = (laneX, side, w) => ({ fn: tagFn, dx: CX + side * (CLAIM_W / 2 + TAG_GAP + w / 2) - laneX });
// CreateVolume leaves the provisioner floor and ends on the PV right face: it rides 16 under its
// ball and 45 right of it, so it starts under the floor and stops 8 short of the face.
const CREATE_TAG = { fn: tagFn, dx: 45, dy: 16 };

// When the cascade leaves on the gc step: the deleted Pod blinks, then it goes, then the ordinary
// gap between an event and the send it causes. 1600, and the step spans 3800 against a 4200 hold.
const GC_SEND = BEAT.afterPulse + FADE.out + BEAT.afterHop;

const W_CLAIM_PROV = [[CX + CLAIM_W / 2, ROW_MY], [PROV_CX - SIDE_W / 2, ROW_MY]];
const W_CREATE     = [[PROV_CX, ROW_BOTTOM], [PROV_CX, PV_MY], [CX + PV_W / 2, PV_MY]];
const W_DOWN_HIGH  = [[DOWN_X, POD_BOTTOM], [DOWN_X, ROW_Y]];
const W_DOWN_LOW   = [[DOWN_X, ROW_BOTTOM], [DOWN_X, PV_TOP]];
const W_UP_HIGH    = [[UP_X, ROW_Y], [UP_X, POD_BOTTOM]];
const W_UP_LOW     = [[UP_X, PV_TOP], [UP_X, ROW_BOTTOM]];

// The list order IS the append order, which is the z-order: the Pod and the three row blocks and the
// disk, then the column lanes and their captions above them, then the chip strip, then the packets.
export const SCENE = {
  'aria-label': 'Generic ephemeral volumes: an inline volumeClaimTemplate on the Pod under ephemeral mints a real PVC with dynamic provisioning and a real CSI mount, so unlike emptyDir it can be large and of a specific class and even snapshotted, but the PVC carries an ownerReference to the Pod and is garbage-collected once the Pod is deleted, so the claim lives only as long as the Pod, and the disk goes with it unless the class says Retain',
  parts: [
    P.defs(),
    // The app box sits 26 under the Pod top, between its label and its sublabel. The GROUP is the
    // pulse target, not the shell.
    P.pod({
      key: 'podB', x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod app-0', sublabel: 'ephemeral: volumeClaimTemplate', containers: 0,
      inner: { dx: (POD_W - APP_W) / 2, dy: APP_DY, w: APP_W, h: APP_H, label: 'app', sublabel: 'writes /scratch' },
    }),
    P.box({ key: 'pvc', x: CX - CLAIM_W / 2, y: ROW_Y, w: CLAIM_W, h: ROW_H, label: 'PVC app-0-scratch', sublabel: 'not created yet', opacity: 0 }),
    P.box({ key: 'sc', x: SC_CX - SIDE_W / 2, y: ROW_Y, w: SIDE_W, h: ROW_H, label: 'StorageClass fast-ssd', sublabel: 'ebs.csi.aws.com' }),
    P.box({ key: 'prov', x: PROV_CX - SIDE_W / 2, y: ROW_Y, w: SIDE_W, h: ROW_H, label: 'External-provisioner', sublabel: 'driver: ebs.csi.aws.com' }),
    // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse is
    // not part of the visible front face. Re-centre on the face, derived from the height.
    P.cylinder({ key: 'pv', x: CX - PV_W / 2, y: PV_Y, w: PV_W, h: PV_H, label: 'PV e91c', labelY: PV_H / 2 + 10, opacity: 0 }),
    P.lane({ key: 'wClaimProv', points: W_CLAIM_PROV, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wCreate', points: W_CREATE, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wDownHigh', points: W_DOWN_HIGH, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wDownLow', points: W_DOWN_LOW, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wUpHigh', points: W_UP_HIGH, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wUpLow', points: W_UP_LOW, dashed: true, dim: true, opacity: 0 }),
    P.wire({ key: 'owner', x: CX + 36, y: 184, anchor: 'start' }),
    P.wire({ key: 'mount', x: CX, y: CAPTION_Y }),
    P.chip({ key: 'podChip', x: STRIP.x(0), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'Pod', value: 'Pending' }),
    P.chip({ key: 'pvcChip', x: STRIP.x(1), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'PVC', value: 'none' }),
    P.chip({ key: 'backChip', x: STRIP.x(2), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'backing', value: 'CSI dynamic' }),
    P.chip({ key: 'lifeChip', x: STRIP.x(3), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'lifetime', value: 'tied to Pod' }),
    P.packets(),
  ],
  reset: {
    keys: ['pvc', 'sc', 'prov', 'pv', 'podChip', 'pvcChip', 'backChip', 'lifeChip'],
    pods: ['podB'],
  },
};

// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a card
// comes to report a mounted volume on the step that is still explaining the claim does not exist yet.
const chips = (pod, pvc, back, life) => ({ podChip: pod, pvcChip: pvc, backChip: back, lifeChip: life });

// STO.S-01 as a field: the Pod is dim until it reaches Running and the claim and disk are born
// mid-story, so every lane and box is pinned on EVERY step rather than inherited from the last. A
// lane is full whenever both its ends stand, pending shade included, and 0 once either is gone.
const alive = v => v > OPACITY.terminated;
const stage = ({ podOn = OPACITY.pending, claim = OPACITY.pending, disk = 0 } = {}) => {
  const both = (a, b) => (alive(a) && alive(b) ? 1 : 0);
  return {
    podB: podOn, pvc: claim, pv: disk,
    wClaimProv: both(claim, 1), wCreate: both(disk, 1),
    wDownHigh: both(podOn, claim), wUpHigh: both(podOn, claim),
    wDownLow: both(claim, disk), wUpLow: both(claim, disk),
  };
};

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('Pending', 'none', 'CSI dynamic', 'tied to Pod'),
    sublabels: { pvc: 'not created yet' },
    opacity: stage(),
  },
  {
    id: 'mint',
    duration: 3000,
    narration: 'When the Pod is created, the ephemeral volume controller turns that inline template into a real PVC, in the same namespace and named after the Pod and the volume with a hyphen between them: app-0-scratch. It carries an ownerReference straight back at the Pod.',
    chipsCued: chips('Pending', 'Pending', 'CSI dynamic', 'tied to Pod'),
    sublabels: { pvc: 'owned by Pod' },
    opacity: stage({ claim: 1 }),
    // The claim is the RECEIVER here, so it earns its highlight and its chip on arrival. The Pod is
    // the sender and still Pending, so it blinks from its dim shade before the ball leaves (M-18a).
    rewind: { opacity: stage(), chips: { pvcChip: 'none' }, sublabels: { pvc: 'not created yet' } },
    flow: [
      F.pulse({ pod: 'podB', dim: true, from: OPACITY.pending, peak: 0.95 }),
      F.route({ points: W_DOWN_HIGH, delay: BEAT.afterPulse, name: 'own' }),
      F.tag({ text: 'ownerReference', points: W_DOWN_HIGH, delay: BEAT.afterPulse, ...beside(DOWN_X, 1, 86) }),
      F.reveal({ target: 'pvc', from: OPACITY.pending, at: 'own' }),
      F.light({ targets: ['pvc'], at: 'own' }),
      F.set({ at: 'own', chipsCued: { pvcChip: 'Pending' }, sublabels: { pvc: 'owned by Pod' } }),
    ],
  },
  {
    id: 'provision',
    duration: 4200,
    narration: 'The claim names a real StorageClass, so the provisioner treats it like any other and calls CreateVolume for a fresh disk of the size and class asked for. This is what emptyDir cannot do: the volume can be large, on fast SSD, and snapshotted, cloned or resized if the driver allows.',
    chipsCued: chips('Pending', 'Pending', 'real disk, fast-ssd', 'tied to Pod'),
    wires: { owner: 'ownerReference' },
    opacity: stage({ claim: 1, disk: 1 }),
    // The claim is where the ball departs from, so it is lit at step entry. The class it names is
    // read here too. The provisioner and the disk are receivers and earn their highlights on arrival.
    lit: ['pvc', 'sc'],
    rewind: {
      opacity: stage({ claim: 1, disk: OPACITY.pending }),
      chips: { backChip: 'CSI dynamic' },
    },
    flow: [
      F.route({ points: W_CLAIM_PROV, delay: BEAT.lead, name: 'claim' }),
      // Rides above the row: the claim and the provisioner leave a 108 unit gap and the tag is half
      // as wide again, so on the midline the two block edges print through it for the whole hop.
      F.tag({ text: 'storageClassName: fast-ssd', points: W_CLAIM_PROV, delay: BEAT.lead, dy: ROW_TAG_DY, fn: tagFn }),
      F.light({ targets: ['prov'], at: 'claim' }),
      F.route({ points: W_CREATE, after: 'claim', name: 'create' }),
      F.tag({ text: 'CreateVolume', points: W_CREATE, after: 'claim', ...CREATE_TAG }),
      F.reveal({ target: 'pv', from: OPACITY.pending, at: 'create' }),
      F.light({ targets: ['pv'], at: 'create' }),
      F.set({ at: 'create', chipsCued: { backChip: 'real disk, fast-ssd' } }),
    ],
  },
  {
    id: 'mount',
    duration: 4200,
    narration: 'The claim binds to the new PV, then the volume is attached and mounted at /scratch inside the container over CSI, exactly as for any ordinary PVC. The Pod starts and writes to a real, dynamically provisioned volume. Nothing about this path is a shortcut.',
    chipsCued: chips('Running', 'Bound', 'real disk, fast-ssd', 'tied to Pod'),
    wires: { owner: 'ownerReference', mount: 'attach and mount' },
    sublabels: { pvc: 'Bound' },
    opacity: stage({ podOn: 1, claim: 1, disk: 1 }),
    lit: ['pv'],
    rewind: {
      opacity: stage({ podOn: OPACITY.pending, claim: 1, disk: 1 }),
      chips: { podChip: 'Pending', pvcChip: 'Pending' },
      sublabels: { pvc: 'owned by Pod' },
    },
    // Down-arrow into the Pod, so the balls lead and the pulse lands on the second one arriving. The
    // claim binds as the volume reaches it, and the Pod runs as the mount reaches it: each chip then.
    flow: [
      F.route({ points: W_UP_LOW, delay: BEAT.lead, name: 'low' }),
      F.light({ targets: ['pvc'], at: 'low' }),
      F.set({ at: 'low', chipsCued: { pvcChip: 'Bound' }, sublabels: { pvc: 'Bound' } }),
      F.route({ points: W_UP_HIGH, after: 'low', name: 'high' }),
      F.tag({ text: '/scratch', points: W_UP_HIGH, after: 'low', ...beside(UP_X, -1, 49) }),
      // The Pod blinks whole and nothing inside it lights (STO.C-02).
      F.fade({ target: 'podB', from: OPACITY.pending, to: 1, dur: FADE.in, fill: 'forwards', easing: 'ease-out', at: 'high' }),
      F.pulse({ pod: 'podB', at: 'high' }),
      F.set({ at: 'high', chipsCued: { podChip: 'Running' } }),
    ],
  },
  {
    id: 'owner',
    duration: 3000,
    narration: 'The ownerReference is what makes this ephemeral. A normal PVC outlives the Pods that use it, but this one belongs to its Pod. And because a controller creates it from the Pod, anyone who can create a Pod can create a claim, even without the right to create one directly.',
    chipsCued: chips('Running', 'Bound', 'real disk, fast-ssd', 'owned by Pod'),
    wires: { owner: 'ownerReferences: Pod app-0' },
    sublabels: { pvc: 'Bound' },
    opacity: stage({ podOn: 1, claim: 1, disk: 1 }),
    // The owned claim holds its highlight and the card rests on it. No blink: MOTION in the record
    // says why this step carries no packet and no Pod pulse.
    lit: ['pvc'],
  },
  {
    id: 'gc',
    duration: 4200,
    narration: 'Delete the Pod and the ownerReference does the rest. Garbage collection removes the PVC, and since the default reclaim policy is Delete, the volume goes with it. The scratch data lived only as long as the Pod did. A class set to Retain would leave the disk behind instead.',
    // The chip names what BACKS the volume, so after garbage collection it reports the backing's
    // fate in those terms rather than the policy that caused it: the disk went with the claim.
    chipsCued: chips('deleted', 'deleted by GC', 'deleted with claim', 'ended with Pod'),
    wires: { owner: 'cascade delete' },
    // Terminating, not Bound: this is the step where the claim is collected, and its own chip reads
    // deleted by GC. A Bound sublabel under a fading box contradicts both.
    sublabels: { pvc: 'Terminating' },
    // Nothing is left pointing at anything: the lanes go out behind the cascade they carried, so the
    // closing frame is the collapsed column and nothing else.
    opacity: stage({ podOn: OPACITY.terminated, claim: OPACITY.terminated, disk: OPACITY.terminated }),
    rewind: {
      opacity: stage({ podOn: 1, claim: 1, disk: 1 }),
      chips: { podChip: 'Running', pvcChip: 'Bound', backChip: 'real disk, fast-ssd', lifeChip: 'owned by Pod' },
      sublabels: { pvc: 'Bound' },
      wires: { owner: 'ownerReferences: Pod app-0' },
    },
    // The deleted Pod blinks at full and only then goes (M-08), and the cascade follows it down the
    // column: the claim, then the disk, each fade and each chip timed off the arrival that carried it.
    flow: [
      F.pulse({ pod: 'podB' }),
      F.fade({ target: 'podB', to: OPACITY.terminated, dur: FADE.out, delay: BEAT.afterPulse, fill: 'forwards' }),
      F.fade({ target: 'wUpHigh', to: 0, dur: FADE.out, delay: BEAT.afterPulse, fill: 'forwards' }),
      F.set({ delay: BEAT.afterPulse, chipsCued: { podChip: 'deleted' } }),
      F.route({ points: W_DOWN_HIGH, delay: GC_SEND, name: 'gcHigh' }),
      F.set({ delay: GC_SEND, wires: { owner: 'cascade delete' } }),
      F.tag({ text: 'ownerReference GC', points: W_DOWN_HIGH, delay: GC_SEND, ...beside(DOWN_X, 1, 104) }),
      F.fade({ target: 'pvc', to: OPACITY.terminated, dur: FADE.out, fill: 'forwards', at: 'gcHigh' }),
      ...['wDownHigh', 'wUpLow', 'wClaimProv'].map(target => F.fade({ target, to: 0, dur: FADE.out, fill: 'forwards', at: 'gcHigh' })),
      F.set({ at: 'gcHigh', chipsCued: { pvcChip: 'deleted by GC' }, sublabels: { pvc: 'Terminating' } }),
      F.route({ points: W_DOWN_LOW, after: 'gcHigh', name: 'gcLow' }),
      F.fade({ target: 'pv', to: OPACITY.terminated, dur: FADE.out, fill: 'forwards', at: 'gcLow' }),
      ...['wDownLow', 'wCreate'].map(target => F.fade({ target, to: 0, dur: FADE.out, fill: 'forwards', at: 'gcLow' })),
      F.set({ at: 'gcLow', chipsCued: { backChip: 'deleted with claim', lifeChip: 'ended with Pod' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
