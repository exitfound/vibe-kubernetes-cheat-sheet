import { P, F, defineCard, chipStrip, BEAT, FADE, OPACITY } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-generic-ephemeral-volume


const CX = 600;

// 226 x 110 is the storage family Pod (storage-csi-attach-mount sets it). This card was drawing a
// 300 x 116 one, which made the Pod the heaviest object on a card whose subject is what hangs below it.
const POD_W = 226, POD_H = 110, POD_Y = 36;
const POD_X = CX - POD_W / 2, POD_BOTTOM = POD_Y + POD_H;               // 487 / 146

const ROW_Y = 212, ROW_H = 72, ROW_BOTTOM = ROW_Y + ROW_H;              // 284
const ROW_MY = ROW_Y + ROW_H / 2;                                       // 248
const CLAIM_W = 280, SIDE_W = 280, SIDE_SPREAD = 340;
const SC_CX = CX - SIDE_SPREAD, PROV_CX = CX + SIDE_SPREAD;             // 260 / 940

const PV_W = 200, PV_H = 110, PV_Y = 350;
const PV_TOP = PV_Y, PV_MY = PV_Y + PV_H / 2;                           // 350 / 405

const CAPTION_Y = 500;
const CHIPS_Y = 570;              // 34 above the canvas floor, equal to the top margin

const CHIP_W = 232, CHIP_GAP = 16;
const STRIP = chipStrip({ w: CHIP_W, gap: CHIP_GAP });      // 976 wide, x0 112, so it centres on CX

const ROW_TAG_DY = ROW_Y - ROW_MY - 6;    // -42: a tag on a row hop rides 3 above the row top

// When the cascade leaves on the gc step: the deleted Pod blinks, then it goes, then the ordinary
// gap between an event and the send it causes. 1600, and the step spans 3800 against a 4200 hold.
const GC_SEND = BEAT.afterPulse + FADE.out + BEAT.afterHop;

const W_CLAIM_PROV = [[CX + CLAIM_W / 2, ROW_MY], [PROV_CX - SIDE_W / 2, ROW_MY]];
const W_CREATE     = [[PROV_CX, ROW_BOTTOM], [PROV_CX, PV_MY], [CX + PV_W / 2, PV_MY]];
const W_DOWN_HIGH  = [[CX, POD_BOTTOM], [CX, ROW_Y]];
const W_DOWN_LOW   = [[CX, ROW_BOTTOM], [CX, PV_TOP]];
const W_UP_HIGH    = [[CX, ROW_Y], [CX, POD_BOTTOM]];
const W_UP_LOW     = [[CX, PV_TOP], [CX, ROW_BOTTOM]];

// The list order IS the append order, which is the z-order: the Pod and the three row blocks and the
// disk, then the column lanes and their captions above them, then the chip strip, then the packets.
export const SCENE = {
  'aria-label': 'Generic ephemeral volumes: an inline volumeClaimTemplate on the Pod under ephemeral mints a real PVC with dynamic provisioning and a real CSI mount, so unlike emptyDir it can be large and of a specific class and even snapshotted, but the PVC carries an ownerReference to the Pod and is garbage-collected the moment the Pod is deleted, so its lifetime is exactly the lifetime of the Pod',
  parts: [
    P.defs(),
    // The inner box is centred in the band the pod primitive leaves free between its label (baseline
    // 16) and its sublabel (baseline h - 8). The GROUP is the pulse target, not the shell.
    P.pod({
      key: 'podB', x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod app-0', sublabel: 'ephemeral: volumeClaimTemplate', containers: 0,
      inner: { dx: 24, dy: 33, w: POD_W - 48, h: 44, label: 'app', sublabel: 'writes /scratch' }, innerKey: 'podBox',
    }),
    P.box({ key: 'pvc', x: CX - CLAIM_W / 2, y: ROW_Y, w: CLAIM_W, h: ROW_H, label: 'PVC app-0-scratch', sublabel: 'owned by Pod', opacity: 0 }),
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
    keys: ['pvc', 'sc', 'prov', 'pv', 'podBox', 'podChip', 'pvcChip', 'backChip', 'lifeChip'],
    pods: ['podB'],
  },
};

// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a card
// comes to report a mounted volume on the step that is still explaining the claim does not exist yet.
const chips = (pod, pvc, back, life) => ({ podChip: pod, pvcChip: pvc, backChip: back, lifeChip: life });

// STO.S-01 as a field: the Pod is dim until it reaches Running and the claim and disk are born
// mid-story, so every lane and box is pinned on EVERY step rather than inherited from the last.
const LANES = ['wClaimProv', 'wCreate', 'wDownHigh', 'wDownLow', 'wUpHigh', 'wUpLow'];
const stage = ({ podOn = OPACITY.pending, claim = OPACITY.pending, disk = 0, on = [] } = {}) => ({
  podB: podOn, pvc: claim, pv: disk,
  ...Object.fromEntries(LANES.map(k => [k, on.includes(k) ? 1 : 0])),
});

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('Pending', 'none', 'CSI dynamic', 'tied to Pod'),
    sublabels: { pvc: 'owned by Pod' },
    opacity: stage(),
  },
  {
    id: 'mint',
    duration: 3000,
    narration: 'When the Pod is created, that inline template becomes a real PVC, in the same namespace and named after the Pod and the volume with a hyphen between them: app-0-scratch. It carries an ownerReference straight back at the Pod that spawned it.',
    chipsCued: chips('Pending', 'Pending', 'CSI dynamic', 'tied to Pod'),
    opacity: stage({ claim: 1, on: ['wDownHigh'] }),
    // The claim is the RECEIVER here, so it earns its highlight on arrival, not at entry. The reduced
    // path applies it directly, which flowLights derives from the cue below: no `lit` entry for it.
    rewind: { opacity: stage({ on: ['wDownHigh'] }) },
    flow: [
      F.route({ points: W_DOWN_HIGH, delay: BEAT.lead, name: 'own' }),
      F.tag({ text: 'ownerReference', points: W_DOWN_HIGH, delay: BEAT.lead }),
      F.reveal({ target: 'pvc', from: OPACITY.pending, at: 'own' }),
      F.light({ targets: ['pvc'], at: 'own' }),
    ],
  },
  {
    id: 'provision',
    duration: 4200,
    narration: 'The claim names a real StorageClass, so the provisioner treats it like any other and calls CreateVolume for a fresh disk of the size and class asked for. This is what emptyDir cannot do: the volume can be large, on fast SSD, on any driver, and it can be snapshotted, cloned or resized.',
    chipsCued: chips('Pending', 'Pending', 'real disk, fast-ssd', 'tied to Pod'),
    wires: { owner: 'ownerReference' },
    opacity: stage({ claim: 1, disk: 1, on: ['wClaimProv', 'wCreate'] }),
    // The claim is where the ball departs from, so it is lit at step entry. The class it names is
    // read here too. The provisioner and the disk are receivers and earn their highlights on arrival.
    lit: ['pvc', 'sc'],
    rewind: { opacity: stage({ claim: 1, disk: OPACITY.pending, on: ['wClaimProv', 'wCreate'] }) },
    flow: [
      F.route({ points: W_CLAIM_PROV, delay: BEAT.lead, name: 'claim' }),
      // Rides above the row: the claim and the provisioner leave a 60 unit gap and the tag is three
      // times that, so on the midline the two block edges print through it for the whole hop.
      F.tag({ text: 'storageClassName: fast-ssd', points: W_CLAIM_PROV, delay: BEAT.lead, dy: ROW_TAG_DY }),
      F.light({ targets: ['prov'], at: 'claim' }),
      F.route({ points: W_CREATE, after: 'claim', name: 'create' }),
      F.tag({ text: 'CreateVolume', points: W_CREATE, after: 'claim' }),
      F.reveal({ target: 'pv', from: OPACITY.pending, at: 'create' }),
      F.light({ targets: ['pv'], at: 'create' }),
    ],
  },
  {
    id: 'mount',
    duration: 4200,
    narration: 'The volume is attached and mounted at /scratch inside the container over CSI, exactly as it would be for any ordinary PVC. The Pod starts and writes to a real, dynamically provisioned volume. Nothing about this path is a shortcut.',
    chipsCued: chips('Running', 'Bound', 'mounted at /scratch', 'tied to Pod'),
    wires: { owner: 'ownerReference', mount: 'attach and mount' },
    sublabels: { pvc: 'Bound' },
    opacity: stage({ podOn: 1, claim: 1, disk: 1, on: ['wUpLow', 'wUpHigh'] }),
    lit: ['pv'],
    rewind: { opacity: stage({ podOn: OPACITY.pending, claim: 1, disk: 1, on: ['wUpLow', 'wUpHigh'] }) },
    // Down-arrow into the Pod, so the balls lead and the pulse lands on the second one arriving.
    flow: [
      F.route({ points: W_UP_LOW, delay: BEAT.lead, name: 'low' }),
      F.light({ targets: ['pvc'], at: 'low' }),
      F.route({ points: W_UP_HIGH, after: 'low', name: 'high' }),
      F.tag({ text: '/scratch', points: W_UP_HIGH, after: 'low' }),
      F.fade({ target: 'podB', from: OPACITY.pending, to: 1, dur: FADE.in, fill: 'forwards', easing: 'ease-out', at: 'high' }),
      F.pulse({ pod: 'podB', at: 'high' }),
      F.light({ targets: ['podBox'], at: 'high' }),
    ],
  },
  {
    id: 'owner',
    duration: 3000,
    narration: 'The ownerReference is what makes this ephemeral. A normal PVC outlives the Pods that use it, but this one belongs to the Pod, the way a container belongs to it. It also means anyone who can create a Pod can create a claim indirectly, without the right to create one directly.',
    chipsCued: chips('Running', 'Bound', 'mounted at /scratch', 'owned by Pod'),
    wires: { owner: 'ownerReference: Pod app-0' },
    sublabels: { pvc: 'Bound' },
    opacity: stage({ podOn: 1, claim: 1, disk: 1 }),
    // The owned claim holds its highlight and the card rests on it. No blink: see the PULSE MODEL
    // note at the top of the file.
    lit: ['pvc'],
  },
  {
    id: 'gc',
    duration: 4200,
    narration: 'Delete the Pod and the ownerReference does the rest. Garbage collection removes the PVC, and since the default reclaim policy is Delete, the volume goes with it. The scratch data lived exactly as long as the Pod did. A class set to Retain would leave the disk behind instead.',
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
    rewind: { opacity: stage({ podOn: 1, claim: 1, disk: 1, on: ['wDownHigh', 'wDownLow'] }) },
    // The deleted Pod blinks at full and only then goes (M-08), and the cascade follows it down the
    // column: the claim, then the disk, each fade timed off the arrival of the lane that carried it.
    flow: [
      F.pulse({ pod: 'podB' }),
      F.fade({ target: 'podB', to: OPACITY.terminated, dur: FADE.out, delay: BEAT.afterPulse, fill: 'forwards' }),
      F.route({ points: W_DOWN_HIGH, delay: GC_SEND, name: 'gcHigh' }),
      F.tag({ text: 'ownerReference GC', points: W_DOWN_HIGH, delay: GC_SEND }),
      F.fade({ target: 'pvc', to: OPACITY.terminated, dur: FADE.out, fill: 'forwards', at: 'gcHigh' }),
      F.fade({ target: 'wDownHigh', to: 0, dur: FADE.out, fill: 'forwards', at: 'gcHigh' }),
      F.route({ points: W_DOWN_LOW, after: 'gcHigh', name: 'gcLow' }),
      F.fade({ target: 'pv', to: OPACITY.terminated, dur: FADE.out, fill: 'forwards', at: 'gcLow' }),
      F.fade({ target: 'wDownLow', to: 0, dur: FADE.out, fill: 'forwards', at: 'gcLow' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
