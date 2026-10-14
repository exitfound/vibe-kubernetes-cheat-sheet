import { P, F, defineCard, chipStrip, BEAT, FADE, OPACITY } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-generic-ephemeral-volume.md


// Pod, PVC and PV all sit on this axis and the machinery blocks flank it symmetrically.
const CX = 600;
// Pod to claim is an out and back pair 24 apart, mirrored about CX (L-12): down (the GC) right of the
// axis, up (the mount) left of it. Under the claim only the mount rides, so only the up lane runs.
const DOWN_X = CX + 12, UP_X = CX - 12;

// The catalog Pod (STO.L-05).
const POD_W = 232, POD_H = 104, POD_Y = 36;
const POD_X = CX - POD_W / 2, POD_BOTTOM = POD_Y + POD_H;
const APP_W = 192, APP_H = 44, APP_DY = 26;

// The catalog actor block (STO.L-05).
const ROW_Y = 212, ROW_H = 80, ROW_BOTTOM = ROW_Y + ROW_H;
const ROW_MY = ROW_Y + ROW_H / 2;
const CLAIM_W = 232, SIDE_W = 232, SIDE_SPREAD = 340;
// The controller that makes the claim and the provisioner that serves it flank the claim on its row.
const CTRL_CX = CX - SIDE_SPREAD, PROV_CX = CX + SIDE_SPREAD;

// The gap below the claim row equals the gap above it, so ownership and binding are one rhythm.
const PV_W = 200, PV_H = 110, PV_Y = ROW_BOTTOM + (ROW_Y - POD_BOTTOM);
const PV_TOP = PV_Y, PV_MY = PV_Y + PV_H / 2;
// The class shapes the disk, so it stands beside the disk, under the controller column.
const SC_CX = CTRL_CX, SC_Y = PV_MY - ROW_H / 2;

const CAPTION_Y = 500;
const CHIPS_Y = 570;

const CHIP_W = 232, CHIP_GAP = 16;
const STRIP = chipStrip({ w: CHIP_W, gap: CHIP_GAP });

// A tag sits beside its ball, near edge 16 from it, or straight over it.
const beside = (side, dy) => (text) => ({ text, dx: side * (16 + 3 * text.length), dy });
// A row hop tags over its ball, above the block labels it leaves and reaches.
const over = (text, dy = -16) => ({ text, dx: 0, dy });
// A column hop tags left of its ball, under the Pod sublabel and over the claim label.
const columnTag = beside(-1, 12);
// CreateVolume and DeleteVolume ride under the provisioner floor and stop short of the PV face.
const callTag = beside(1, 16);

// The deleted Pod blinks, goes, then the ordinary gap between an event and the send it causes.
const GC_SEND = BEAT.afterPulse + FADE.out + BEAT.afterHop;
// A block a ball removes lights on the arrival and starts to go this much later (storage-reclaim-policy).
const REMOVE_LAG = 180;
// DeleteVolume waits until the collected claim has gone, so the PV is Released when it leaves.
const DELETE_SEND = REMOVE_LAG + FADE.out;

const W_CTRL_CLAIM = [[CTRL_CX + SIDE_W / 2, ROW_MY], [CX - CLAIM_W / 2, ROW_MY]];
const W_CLAIM_PROV = [[CX + CLAIM_W / 2, ROW_MY], [PROV_CX - SIDE_W / 2, ROW_MY]];
const W_CREATE     = [[PROV_CX, ROW_BOTTOM], [PROV_CX, PV_MY], [CX + PV_W / 2, PV_MY]];
const W_DOWN_HIGH  = [[DOWN_X, POD_BOTTOM], [DOWN_X, ROW_Y]];
const W_UP_HIGH    = [[UP_X, ROW_Y], [UP_X, POD_BOTTOM]];
const W_UP_LOW     = [[UP_X, PV_TOP], [UP_X, ROW_BOTTOM]];

// Z-order: the Pod, the row blocks and the disk, the column lanes and captions, chips, packets.
export const SCENE = {
  'aria-label': 'Generic ephemeral volumes: an inline volumeClaimTemplate on the Pod under ephemeral is turned by the ephemeral volume controller in kube-controller-manager into a real PVC named app-0-scratch, then provisioned and mounted over CSI like any ordinary claim, so unlike emptyDir it has a fixed size on a class you pick and can be snapshotted if the driver supports it, but the PVC carries an ownerReference to the Pod and is garbage-collected once the Pod is deleted, so the claim lives only as long as the Pod, and the external-provisioner then calls DeleteVolume on the disk unless the class says Retain',
  parts: [
    P.defs(),
    // The GROUP is the pulse target, not the shell.
    P.pod({
      key: 'podB', x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod app-0', sublabel: 'ephemeral: volumeClaimTemplate', containers: 0,
      inner: { dx: (POD_W - APP_W) / 2, dy: APP_DY, w: APP_W, h: APP_H, label: 'app', sublabel: 'writes /scratch' },
    }),
    P.box({ key: 'pvc', x: CX - CLAIM_W / 2, y: ROW_Y, w: CLAIM_W, h: ROW_H, label: 'PVC app-0-scratch', sublabel: 'not created yet', opacity: 0 }),
    P.box({ key: 'ctrl', x: CTRL_CX - SIDE_W / 2, y: ROW_Y, w: SIDE_W, h: ROW_H, label: 'Ephemeral volume controller', sublabel: 'kube-controller-manager' }),
    P.box({ key: 'sc', x: SC_CX - SIDE_W / 2, y: SC_Y, w: SIDE_W, h: ROW_H, label: 'StorageClass fast-ssd', sublabel: 'ebs.csi.aws.com' }),
    P.box({ key: 'prov', x: PROV_CX - SIDE_W / 2, y: ROW_Y, w: SIDE_W, h: ROW_H, label: 'External-provisioner', sublabel: 'driver: ebs.csi.aws.com' }),
    // Re-centre the label on the visible front face, not the raw bbox with its top cap.
    P.cylinder({ key: 'pv', x: CX - PV_W / 2, y: PV_Y, w: PV_W, h: PV_H, label: 'PV pvc-e91c', labelY: PV_H / 2 + 10, opacity: 0 }),
    P.lane({ key: 'wCtrlClaim', points: W_CTRL_CLAIM, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wClaimProv', points: W_CLAIM_PROV, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wCreate', points: W_CREATE, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wDownHigh', points: W_DOWN_HIGH, dashed: true, dim: true, opacity: 0 }),
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
    keys: ['pvc', 'ctrl', 'sc', 'prov', 'pv', 'podChip', 'pvcChip', 'backChip', 'lifeChip'],
    pods: ['podB'],
  },
};

// Every step writes EVERY chip, or a chip keeps a stale value from the previous step.
const chips = (pod, pvc, back, life) => ({ podChip: pod, pvcChip: pvc, backChip: back, lifeChip: life });

// The Pod and the claim and disk change mid-story, so every lane and box is pinned on EVERY step
// (STO.S-01). A lane is full whenever both its ends stand, pending shade included.
const alive = v => v > OPACITY.terminated;
const stage = ({ podOn = OPACITY.pending, claim = OPACITY.pending, disk = 0 } = {}) => {
  const both = (a, b) => (alive(a) && alive(b) ? 1 : 0);
  return {
    podB: podOn, pvc: claim, pv: disk,
    wCtrlClaim: both(claim, 1), wClaimProv: both(claim, 1), wCreate: both(disk, 1),
    wDownHigh: both(podOn, claim), wUpHigh: both(podOn, claim),
    wUpLow: both(claim, disk),
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
    duration: 3300,
    narration: 'When the Pod is created, the ephemeral volume controller turns that inline template into a real PVC in the same namespace, named after the Pod and the volume, app-0-scratch, with an ownerReference back at the Pod. A claim of that name the Pod does not own is left alone, and the Pod cannot start.',
    chipsCued: chips('Pending', 'Pending', 'CSI dynamic', 'tied to Pod'),
    wires: { owner: 'ownerReference' },
    sublabels: { pvc: 'owned by Pod' },
    opacity: stage({ claim: 1 }),
    // The new Pending Pod blinks from its dim shade, then the controller, lit from entry (M-18a), makes
    // the claim. The ownerReference is a relation, so it is written on the spine as the claim lands.
    lit: ['ctrl'],
    rewind: { opacity: stage(), chips: { pvcChip: 'none' }, sublabels: { pvc: 'not created yet' }, wires: { owner: '' } },
    flow: [
      F.pulse({ pod: 'podB', dim: true, from: OPACITY.pending, peak: 0.95 }),
      F.route({ points: W_CTRL_CLAIM, delay: BEAT.afterPulse, name: 'own', tag: over('create') }),
      F.reveal({ target: 'pvc', from: OPACITY.pending, at: 'own' }),
      F.light({ targets: ['pvc'], at: 'own' }),
      F.set({ at: 'own', chipsCued: { pvcChip: 'Pending' }, sublabels: { pvc: 'owned by Pod' }, wires: { owner: 'ownerReference' } }),
    ],
  },
  {
    id: 'provision',
    duration: 4200,
    narration: 'The claim names a real StorageClass, so once a Node is picked under the recommended WaitForFirstConsumer mode, the provisioner calls CreateVolume as for any claim. Unlike emptyDir, the disk has a fixed size the Pod cannot exceed, and snapshots, clones or resizing work if the driver allows.',
    chipsCued: chips('Pending', 'Pending', 'real disk, fast-ssd', 'tied to Pod'),
    wires: { owner: 'ownerReference' },
    sublabels: { pvc: 'owned by Pod' },
    opacity: stage({ claim: 1, disk: 1 }),
    // The claim is the departure point and lit at entry, the class it names too.
    lit: ['pvc', 'sc'],
    rewind: {
      opacity: stage({ claim: 1, disk: OPACITY.pending }),
      chips: { backChip: 'CSI dynamic' },
    },
    flow: [
      // The tag is wider than the gap, so it rides high enough to clear both row labels.
      F.route({ points: W_CLAIM_PROV, delay: BEAT.lead, name: 'claim', tag: over('storageClassName: fast-ssd', -20) }),
      F.light({ targets: ['prov'], at: 'claim' }),
      F.route({ points: W_CREATE, after: 'claim', name: 'create', tag: callTag('CreateVolume') }),
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
    // Down-arrow into the Pod: the balls lead and the pulse lands on the second arrival.
    flow: [
      F.route({ points: W_UP_LOW, delay: BEAT.lead, name: 'low' }),
      F.light({ targets: ['pvc'], at: 'low' }),
      F.set({ at: 'low', chipsCued: { pvcChip: 'Bound' }, sublabels: { pvc: 'Bound' } }),
      F.route({ points: W_UP_HIGH, after: 'low', name: 'high', tag: columnTag('/scratch') }),
      // The Pod blinks whole and nothing inside it lights (STO.C-02).
      F.fade({ target: 'podB', from: OPACITY.pending, to: 1, dur: FADE.in, fill: 'forwards', easing: 'ease-out', at: 'high' }),
      F.pulse({ pod: 'podB', at: 'high' }),
      F.set({ at: 'high', chipsCued: { podChip: 'Running' } }),
    ],
  },
  {
    id: 'owner',
    duration: 3200,
    narration: 'The ownerReference is what makes this ephemeral: a normal PVC outlives the Pods that use it, but this one belongs to its Pod. Anyone who can create a Pod can create a claim this way, even without the right to create one directly, unless a webhook rejects such Pods. PVC quota still applies.',
    chipsCued: chips('Running', 'Bound', 'real disk, fast-ssd', 'owned by Pod'),
    wires: { owner: 'ownerReferences: Pod app-0' },
    sublabels: { pvc: 'Bound' },
    opacity: stage({ podOn: 1, claim: 1, disk: 1 }),
    // Deliberate: no packet and no Pod pulse on this step.
    lit: ['pvc'],
  },
  {
    id: 'gc',
    duration: 6400,
    narration: 'Delete the Pod and the ownerReference does the rest. Garbage collection removes the PVC, and under the default Delete reclaim policy the external-provisioner calls DeleteVolume, so the disk and its PV go too. The scratch data lived as long as the Pod. A class set to Retain would keep the disk.',
    // The chip names what BACKS the volume, so it reports the backing's fate, not the policy.
    chipsCued: chips('deleted', 'deleted by GC', 'deleted with claim', 'ended with Pod'),
    wires: { owner: 'cascade delete' },
    // Terminating, not Bound: this is the step where the claim is collected.
    sublabels: { pvc: 'Terminating' },
    // The lanes go out behind the cascade, so the closing frame is the collapsed column.
    opacity: stage({ podOn: OPACITY.terminated, claim: OPACITY.terminated, disk: OPACITY.terminated }),
    rewind: {
      opacity: stage({ podOn: 1, claim: 1, disk: 1 }),
      chips: { podChip: 'Running', pvcChip: 'Bound', backChip: 'real disk, fast-ssd', lifeChip: 'owned by Pod' },
      sublabels: { pvc: 'Bound' },
      wires: { owner: 'ownerReferences: Pod app-0' },
    },
    // The deleted Pod blinks at full and only then goes (M-08). The collected claim wakes the provisioner,
    // which deletes the disk, the Delete branch of storage-reclaim-policy.
    flow: [
      F.pulse({ pod: 'podB' }),
      F.fade({ target: 'podB', to: OPACITY.terminated, dur: FADE.out, delay: BEAT.afterPulse, fill: 'forwards' }),
      F.fade({ target: 'wUpHigh', to: 0, dur: FADE.out, delay: BEAT.afterPulse, fill: 'forwards' }),
      F.set({ delay: BEAT.afterPulse, chipsCued: { podChip: 'deleted' } }),
      // Tagged left of its lane: on the right the tag would cross the owner caption mid-flight.
      F.route({ points: W_DOWN_HIGH, delay: GC_SEND, name: 'gcHigh', lights: ['prov'], tag: columnTag('ownerReference GC') }),
      F.set({ delay: GC_SEND, wires: { owner: 'cascade delete' } }),
      // An F.set on the claim and the disk, NOT lights: the fade takes the class off again.
      F.set({ on: 'pvc', lit: ['pvc'], at: 'gcHigh' }),
      F.fade({ target: 'pvc', to: OPACITY.terminated, dur: FADE.out, fill: 'forwards', at: 'gcHigh', plus: REMOVE_LAG, unlight: ['pvc'] }),
      ...['wDownHigh', 'wUpLow', 'wClaimProv', 'wCtrlClaim'].map(target => F.fade({ target, to: 0, dur: FADE.out, fill: 'forwards', at: 'gcHigh', plus: REMOVE_LAG })),
      F.set({ at: 'gcHigh', chipsCued: { pvcChip: 'deleted by GC' }, sublabels: { pvc: 'Terminating' } }),
      F.route({ points: W_CREATE, at: 'gcHigh', plus: DELETE_SEND, name: 'wipe', tag: callTag('DeleteVolume') }),
      F.set({ on: 'pv', lit: ['pv'], at: 'wipe' }),
      F.fade({ target: 'pv', to: OPACITY.terminated, dur: FADE.out, fill: 'forwards', at: 'wipe', plus: REMOVE_LAG, unlight: ['pv'] }),
      F.fade({ target: 'wCreate', to: 0, dur: FADE.out, fill: 'forwards', at: 'wipe', plus: REMOVE_LAG }),
      F.set({ at: 'wipe', chipsCued: { backChip: 'deleted with claim', lifeChip: 'ended with Pod' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
