import { BEAT, FADE, LANE_DY, OPACITY, P, F, defineCard, chipStrip, makeRidingLabel } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-dynamic-provisioning.md

// The panel wall (L-02) pins the top row at LEFT_X, so the columns centre on 652, not 600.
// CANVAS_CX is separate on purpose: only the chip strip has the full width.
const LEFT_X = 400;                                   // leftmost the TOP ROW may go, all viewports
const CANVAS_CX = 600;                                // where the chip strip sits, always

// Every block is the catalog 232 by 80 (NET.L-01). The 40 channel holds the class reference and the elbow.
const COL_GAP = 40;                                   // the elbow channel lives in here
const BOX_W = 232, BOX_H = 80;
const COL_L_W = BOX_W;                                // identity column: the claim and its volume
const COL_R_W = BOX_W;                                // machinery column: class, provisioner, backend
const COL_R_X = LEFT_X + COL_L_W + COL_GAP;
// The claim tier sits in the narration panel band, so the left edge stays pinned at LEFT_X.

const PVC_X = LEFT_X, PVC_Y = 70, PVC_W = COL_L_W, PVC_H = BOX_H;
const PVC_RIGHT = PVC_X + PVC_W, PVC_BOTTOM = PVC_Y + PVC_H;

const SC_X = COL_R_X, SC_Y = 70, SC_W = COL_R_W, SC_H = BOX_H;
const SC_LEFT = SC_X, SC_BOTTOM = SC_Y + SC_H;
const SC_CX = SC_X + SC_W / 2;
const ROW_MY = SC_Y + SC_H / 2;                                // shared by the claim and the class

const PROV_X = COL_R_X, PROV_Y = 250, PROV_W = COL_R_W, PROV_H = BOX_H;
const PROV_LEFT = PROV_X, PROV_TOP = PROV_Y, PROV_BOTTOM = PROV_Y + PROV_H;
const PROV_MY = PROV_Y + PROV_H / 2;

const CLOUD_X = COL_R_X, CLOUD_Y = 440, CLOUD_W = COL_R_W, CLOUD_H = BOX_H;
const CLOUD_TOP = CLOUD_Y;

// The cylinder sits exactly under the claim, same width and x, so the identity column reads as one stack.
const PV_X = LEFT_X, PV_Y = 430, PV_W = COL_L_W, PV_H = 110;
const PV_TOP = PV_Y;
const PV_CX = PV_X + PV_W / 2;

const SPINE_X = PV_CX;
const DOWN_X = SC_CX + LANE_DY;  // provisioner -> backend
const UP_X = SC_CX - LANE_DY;    // backend -> provisioner
const CHIPS_Y = 585;

const CHIP = chipStrip({ cx: CANVAS_CX });   // four equal chips, the category 232 width and 16 gap

const ELBOW_X = PVC_RIGHT + COL_GAP / 2;

// A tag sits beside its ball, near edge 16 from it, or straight over or under it.
const beside = (side, dy) => (text) => ({ text, dx: side * (16 + 3 * text.length), dy });
// A falling ball carries its tag under it: above, it would touch the sublabel it leaves from.
const under = (text) => ({ text, dx: 0, dy: 16 });
// A ball that leaves at t=0 does not fade in, so its tag shows at once (inMs 0).
const tagNow = makeRidingLabel({ role: 'storage', inMs: 0 });

// Two lanes share each of these faces, so they sit as a mirrored pair about the face midpoint.
const ROW_LANE = 12, PROV_LANE = 16;

// Each static wire and its ball share one array, so they cannot drift. Every endpoint is a block edge.
const W_SC_REF     = [[PVC_RIGHT, ROW_MY - ROW_LANE], [SC_LEFT, ROW_MY - ROW_LANE]];      // reference, no ball
// The same line as a headed lane, class to claim, shown only on `nomatch` where the annotation rides it.
const W_SC_TO_PVC  = [W_SC_REF[1], W_SC_REF[0]];
const W_PVC_TO_PROV = [[PVC_RIGHT, ROW_MY + ROW_LANE], [ELBOW_X, ROW_MY + ROW_LANE], [ELBOW_X, PROV_MY - PROV_LANE], [PROV_LEFT, PROV_MY - PROV_LANE]];
const W_SC_TO_PROV  = [[SC_CX, SC_BOTTOM], [SC_CX, PROV_TOP]];
const W_PROV_TO_CLOUD = [[DOWN_X, PROV_BOTTOM], [DOWN_X, CLOUD_TOP]];
const W_CLOUD_TO_PROV = [[UP_X, CLOUD_TOP], [UP_X, PROV_BOTTOM]];
const W_PROV_TO_PV  = [[PROV_LEFT, PROV_MY + PROV_LANE], [ELBOW_X, PROV_MY + PROV_LANE], [ELBOW_X, 396], [PV_CX, 396], [PV_CX, PV_TOP]];
const W_BOUND       = [[SPINE_X, PVC_BOTTOM], [SPINE_X, PV_TOP]];

// List order is z-order: blocks, wires and labels, the chip strip, then the packet layer.
export const SCENE = {
  'aria-label': 'Dynamic provisioning: a claim finds no existing volume to bind to, so the binding controller copies the provisioner its StorageClass names onto the claim, that provisioner asks the storage backend to create a real disk and writes a PersistentVolume object already carrying a claimRef to the claim, and the binding controller binds that brand new volume to the claim it was made for',
  parts: [
    P.defs(),
    P.box({ key: 'pvc', x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-claim', sublabel: 'wants 5Gi, class gp3' }),
    P.box({ key: 'sc', x: SC_X, y: SC_Y, w: SC_W, h: SC_H, label: 'StorageClass gp3', sublabel: 'provisioner: ebs.csi.aws.com' }),
    P.box({ key: 'prov', x: PROV_X, y: PROV_Y, w: PROV_W, h: PROV_H, label: 'External-provisioner', sublabel: 'CSI controller sidecar' }),
    P.box({ key: 'cloud', x: CLOUD_X, y: CLOUD_Y, w: CLOUD_W, h: CLOUD_H, label: 'Storage backend', sublabel: 'reached via the CSI driver' }),
    // The volume does not exist until CreateVolume returns, so it starts invisible.
    P.cylinder({ key: 'pv', x: PV_X, y: PV_Y, w: PV_W, h: PV_H, label: 'PV pvc-a7f2', opacity: 0 }),
    P.relation({ key: 'scRef', points: W_SC_REF, dash: '5 5' }),
    // The Bound link is a relation, dashed like the class reference: nothing travels it.
    P.relation({ key: 'boundLink', points: W_BOUND, dash: '5 5', opacity: 0 }),
    P.lane({ key: 'wScToPvc', points: W_SC_TO_PVC, dashed: true, dim: true, opacity: 0 }),
    P.lane({ points: W_PVC_TO_PROV, dashed: true, dim: true }),
    P.lane({ points: W_SC_TO_PROV, dashed: true, dim: true }),
    P.lane({ points: W_PROV_TO_CLOUD, dashed: true, dim: true }),
    P.lane({ points: W_CLOUD_TO_PROV, dashed: true, dim: true }),
    P.lane({ key: 'wProvToPv', points: W_PROV_TO_PV, dashed: true, dim: true, opacity: 0 }),
    // Right of the spine and below the provisioner floor, clear of the provisioner face.
    P.wire({ key: 'bound', x: SPINE_X + 16, y: 380, anchor: 'start' }),
    P.wire({ key: 'call', x: DOWN_X + 22, y: 396, anchor: 'start' }),
    P.wire({ key: 'pv', x: PV_X + PV_W / 2, y: 566 }),
    P.chip({ key: 'pvcChip', x: CHIP.x(0), y: CHIPS_Y, w: CHIP.w, h: 34, name: 'PVC', value: 'Pending' }),
    P.chip({ key: 'scChip', x: CHIP.x(1), y: CHIPS_Y, w: CHIP.w, h: 34, name: 'class', value: 'gp3' }),
    P.chip({ key: 'diskChip', x: CHIP.x(2), y: CHIPS_Y, w: CHIP.w, h: 34, name: 'disk', value: 'none' }),
    P.chip({ key: 'pvChip', x: CHIP.x(3), y: CHIPS_Y, w: CHIP.w, h: 34, name: 'PV', value: 'none' }),
    P.packets(),
  ],
  reset: { keys: ['pvc', 'sc', 'prov', 'cloud', 'pv', 'pvcChip', 'scChip', 'diskChip', 'pvChip'] },
};

const chips = (pvc, sc, disk, pv) => ({ pvcChip: pvc, scChip: sc, diskChip: disk, pvChip: pv });

// STO.S-01 as a field: the disk, the write arrow and the Bound link are born mid-story, and the
// class reference swaps for its headed lane on one step, so all five are pinned on every step.
const REF = { scRef: 1, wScToPvc: 0 };
const STACK_OFF = { pv: 0, wProvToPv: 0, boundLink: 0, ...REF };

const DISK_ID = 'vol-0abc123';
const PV_BACKED = 'backed by ' + DISK_ID;
// The claim turns Bound this long after the volume, the order bind() writes them in.
const CLAIM_BOUND_MS = 600;

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('Pending', 'gp3', 'none', 'none'),
    opacity: STACK_OFF,
  },
  {
    id: 'nomatch',
    duration: 3700,
    narration: 'With static provisioning an administrator has to create the volume by hand before anyone can claim it. Here nobody did, so the binding controller finds no candidate to bind to. Under the default Immediate binding mode it turns to the class the claim names, and copies the provisioner that class names onto the claim as an annotation.',
    chipsCued: chips('Pending', 'gp3', 'none', 'none'),
    opacity: { ...STACK_OFF, scRef: 0, wScToPvc: 1 },
    // The claim is not lit statically, or its arrival cue below would be hidden.
    lit: ['sc'],
    // No binding-controller box is drawn: the ball leaves the class, the value it copies.
    flow: [
      F.route({ points: W_SC_TO_PVC, delay: BEAT.lead, name: 'annot', tag: { text: 'storage-provisioner: ebs.csi.aws.com', dx: 0, dy: -16 } }),
      F.light({ targets: ['pvc'], at: 'annot' }),
    ],
  },
  {
    id: 'provision',
    duration: 3500,
    narration: 'The StorageClass names a provisioner and the parameters to build with. The external-provisioner sidecar watches for unbound claims whose volume.kubernetes.io/storage-provisioner annotation carries its own name, picks this one up, and reads both the size the claim asks for and the parameters its class carries.',
    chipsCued: chips('Pending', 'gp3', 'none', 'none'),
    opacity: STACK_OFF,
    lit: ['pvc', 'sc'],
    flow: [
      F.route({ points: W_PVC_TO_PROV, name: 'claim', tag: { text: '5Gi, class gp3', fn: tagNow } }),
      F.route({ points: W_SC_TO_PROV, name: 'params', tag: { ...under('type: gp3'), fn: tagNow } }),
      F.light({ targets: ['prov'], at: 'claim' }),
    ],
  },
  {
    id: 'createvolume',
    duration: 3700,
    narration: 'The provisioner calls CreateVolume on the driver, which asks the storage backend for a real disk of the requested size. The backend carves one out and hands back the identifier it can be addressed by later. This is the only step here that touches real hardware: getting the disk onto a Node comes later, once a Pod uses the claim.',
    chipsCued: chips('Pending', 'gp3', DISK_ID, 'none'),
    wires: { call: 'CreateVolume' },
    opacity: STACK_OFF,
    // The backend is not lit statically, or its own arrival cue below would be hidden.
    lit: ['prov'],
    // The chip turns over when the return ball carrying the same string lands.
    rewind: { chips: { diskChip: 'none' } },
    // Descent then ascent, on separate lanes, so the round trip reads as a loop, not a retrace.
    flow: [
      F.route({ points: W_PROV_TO_CLOUD, name: 'call', tag: { ...under('5Gi'), fn: tagNow } }),
      F.light({ targets: ['cloud'], at: 'call' }),
      F.route({ points: W_CLOUD_TO_PROV, after: 'call', name: 'back', tag: beside(-1, 12)(DISK_ID) }),
      F.light({ targets: ['prov'], at: 'back' }),
      F.set({ at: 'back', chipsCued: { diskChip: DISK_ID } }),
    ],
  },
  {
    id: 'createpv',
    duration: 3000,
    narration: 'A disk on its own is invisible to Kubernetes. The provisioner writes a PersistentVolume object carrying the identifier it just got back, and that object is the cluster representation of the disk. Only now does the volume exist as something a claim can be paired with.',
    chipsCued: chips('Pending', 'gp3', DISK_ID, 'pvc-a7f2 created'),
    wires: { pv: PV_BACKED },
    // F.reveal writes its own `from`: the volume rests pending while the write arrow points at it (M-24).
    opacity: { pv: 1, wProvToPv: 1, boundLink: 0, ...REF },
    lit: ['prov'],
    // The object and its caption land with the write ball, on the same beat as the volume.
    rewind: { chips: { pvChip: 'none' }, wires: { pv: '' } },
    flow: [
      F.route({ points: W_PROV_TO_PV, name: 'write', tag: { ...beside(-1, -14)('PV pvc-a7f2'), fn: tagNow } }),
      F.reveal({ target: 'pv', from: OPACITY.pending, at: 'write' }),
      F.light({ targets: ['pv'], at: 'write' }),
      F.set({ at: 'write', chipsCued: { pvChip: 'pvc-a7f2 created' }, wires: { pv: PV_BACKED } }),
    ],
  },
  {
    id: 'bind',
    duration: 3800,
    narration: 'The new volume was built for this one claim, so the provisioner already stamped it with a claimRef pointing back at the claim. The binding controller still runs its usual match, and that pre-bound volume wins outright. It marks the volume Bound first, then writes volumeName on the claim and turns the claim Bound. The volume was made to order.',
    chipsCued: chips('Bound', 'gp3', DISK_ID, 'Bound'),
    wires: { bound: 'claimRef: data-claim', pv: PV_BACKED },
    // The write arrow is retired: it shares the identity column centre with the spine.
    opacity: { pv: 1, wProvToPv: 0, boundLink: 1, ...REF },
    lit: ['pvc', 'pv'],
    // The link is the static end-state, so only the animated path winds it back to fade it in.
    // The claim chip waits too: bind() writes the volume Bound before the claim.
    rewind: { opacity: { boundLink: 0 }, chips: { pvcChip: 'Pending' } },
    // Delay 0 on purpose: the claimRef label is static, so the link must be on screen from frame one.
    flow: [
      F.fade({ target: 'boundLink', from: 0, to: 1, dur: FADE.in, fill: 'forwards', easing: 'ease-out' }),
      F.set({ delay: CLAIM_BOUND_MS, chipsCued: { pvcChip: 'Bound' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
