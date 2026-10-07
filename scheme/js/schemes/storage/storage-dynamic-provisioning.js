import { FADE, LANE_DY, P, F, defineCard, chipStrip, makeRidingLabel } from './storage-kit.js';
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

// Only the return tag steps out: the call tag rides its own lane.
const RETURN_TAG_DX = -30;
// Keeps the params tag inside the class box bottom edge.
const PARAMS_TAG_DY = -6;
// Rides left of its ball, clear of the provisioner face it leaves from t=0.
const PV_TAG_DX = -41;
// A ball that leaves at t=0 does not fade in, so its tag shows at once (inMs 0).
const tagNow = makeRidingLabel({ role: 'storage', inMs: 0 });

// Two lanes share each of these faces, so they sit as a mirrored pair about the face midpoint.
const ROW_LANE = 12, PROV_LANE = 16;

// Each static wire and its ball share one array, so they cannot drift. Every endpoint is a block edge.
const W_SC_REF     = [[PVC_RIGHT, ROW_MY - ROW_LANE], [SC_LEFT, ROW_MY - ROW_LANE]];      // reference, no ball
const W_PVC_TO_PROV = [[PVC_RIGHT, ROW_MY + ROW_LANE], [ELBOW_X, ROW_MY + ROW_LANE], [ELBOW_X, PROV_MY - PROV_LANE], [PROV_LEFT, PROV_MY - PROV_LANE]];
const W_SC_TO_PROV  = [[SC_CX, SC_BOTTOM], [SC_CX, PROV_TOP]];
const W_PROV_TO_CLOUD = [[DOWN_X, PROV_BOTTOM], [DOWN_X, CLOUD_TOP]];
const W_CLOUD_TO_PROV = [[UP_X, CLOUD_TOP], [UP_X, PROV_BOTTOM]];
const W_PROV_TO_PV  = [[PROV_LEFT, PROV_MY + PROV_LANE], [ELBOW_X, PROV_MY + PROV_LANE], [ELBOW_X, 396], [PV_CX, 396], [PV_CX, PV_TOP]];
const W_BOUND       = [[SPINE_X, PVC_BOTTOM], [SPINE_X, PV_TOP]];

// List order is z-order: blocks, wires and labels, the chip strip, then the packet layer.
export const SCENE = {
  'aria-label': 'Dynamic provisioning: a claim finds no existing volume to bind to, so the StorageClass it names points at a provisioner, the provisioner asks the storage backend to create a real disk, writes a PersistentVolume object to represent it, and that brand new volume is bound to the claim straight away',
  parts: [
    P.defs(),
    P.box({ key: 'pvc', x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-claim', sublabel: 'wants 5Gi, class gp3' }),
    P.box({ key: 'sc', x: SC_X, y: SC_Y, w: SC_W, h: SC_H, label: 'StorageClass gp3', sublabel: 'provisioner: ebs.csi.aws.com' }),
    P.box({ key: 'prov', x: PROV_X, y: PROV_Y, w: PROV_W, h: PROV_H, label: 'External-provisioner', sublabel: 'CSI controller sidecar' }),
    P.box({ key: 'cloud', x: CLOUD_X, y: CLOUD_Y, w: CLOUD_W, h: CLOUD_H, label: 'Storage backend', sublabel: 'reached via the CSI driver' }),
    // The volume does not exist until CreateVolume returns, so it starts invisible.
    P.cylinder({ key: 'pv', x: PV_X, y: PV_Y, w: PV_W, h: PV_H, label: 'PV pvc-a7f2', opacity: 0 }),
    P.relation({ points: W_SC_REF, dash: '5 5' }),
    // The Bound link is a relation, dashed like the class reference: nothing travels it.
    P.relation({ key: 'boundLink', points: W_BOUND, dash: '5 5', opacity: 0 }),
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

// STO.S-01 as a field: the disk, the write arrow and the Bound link are born mid-story, so all
// three are pinned on every step.
const STACK_OFF = { pv: 0, wProvToPv: 0, boundLink: 0 };

const DISK_ID = 'vol-0abc123';
const PV_BACKED = 'backed by ' + DISK_ID;

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('Pending', 'gp3', 'none', 'none'),
    opacity: STACK_OFF,
  },
  {
    id: 'nomatch',
    duration: 2100,
    narration: 'With static provisioning an administrator has to create the volume by hand before anyone can claim it. Here nobody did, so there is no candidate to bind to. What saves the claim is the class it names, because that class knows who can build a volume on demand.',
    chipsCued: chips('Pending', 'gp3', 'none', 'none'),
    opacity: STACK_OFF,
    lit: ['pvc', 'sc'],
  },
  {
    id: 'provision',
    duration: 2600,
    narration: 'The StorageClass is the piece of configuration that names a provisioner and the parameters to build with. The external-provisioner sidecar watches for Pending claims whose class names it, picks this one up, and reads both the size the claim asks for and the settings the class carries.',
    chipsCued: chips('Pending', 'gp3', 'none', 'none'),
    opacity: STACK_OFF,
    lit: ['pvc', 'sc'],
    flow: [
      F.route({ points: W_PVC_TO_PROV, name: 'claim', tag: { text: '5Gi, class gp3', fn: tagNow } }),
      F.route({ points: W_SC_TO_PROV, name: 'params', tag: { text: 'type: gp3', dy: PARAMS_TAG_DY, fn: tagNow } }),
      F.light({ targets: ['prov'], at: 'claim' }),
    ],
  },
  {
    id: 'createvolume',
    duration: 3400,
    narration: 'The provisioner calls CreateVolume on the driver, which asks the storage backend for a real disk of the requested size. The backend carves one out and hands back the identifier it can be addressed by later. This is the only step where anything physical actually happens.',
    chipsCued: chips('Pending', 'gp3', DISK_ID, 'none'),
    wires: { call: 'CreateVolume' },
    opacity: STACK_OFF,
    // The backend is not lit statically, or its own arrival cue below would be hidden.
    lit: ['prov'],
    // The chip turns over when the return ball carrying the same string lands.
    rewind: { chips: { diskChip: 'none' } },
    // Descent then ascent, on separate lanes, so the round trip reads as a loop, not a retrace.
    flow: [
      F.route({ points: W_PROV_TO_CLOUD, name: 'call', tag: { text: '5Gi', fn: tagNow } }),
      F.light({ targets: ['cloud'], at: 'call' }),
      F.route({ points: W_CLOUD_TO_PROV, after: 'call', name: 'back', tag: { text: DISK_ID, dx: RETURN_TAG_DX } }),
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
    // F.reveal writes its own `from`, so the animated path needs no rewind to start it hidden.
    opacity: { pv: 1, wProvToPv: 1, boundLink: 0 },
    lit: ['prov'],
    // The object and its caption land with the write ball, on the same beat as the volume.
    rewind: { chips: { pvChip: 'none' }, wires: { pv: '' } },
    flow: [
      F.route({ points: W_PROV_TO_PV, name: 'write', tag: { text: 'PV pvc-a7f2', dx: PV_TAG_DX, fn: tagNow } }),
      F.reveal({ target: 'pv', at: 'write' }),
      F.light({ targets: ['pv'], at: 'write' }),
      F.set({ at: 'write', chipsCued: { pvChip: 'pvc-a7f2 created' }, wires: { pv: PV_BACKED } }),
    ],
  },
  {
    id: 'bind',
    duration: 2600,
    narration: 'The new volume was built for this one claim, so the provisioner already stamped it with a claimRef pointing back at the claim. The binding controller has nothing to search for: it writes volumeName on the claim, and the pair goes straight to Bound. The volume was made to order.',
    chipsCued: chips('Bound', 'gp3', DISK_ID, 'Bound'),
    wires: { bound: 'claimRef: data-claim', pv: PV_BACKED },
    // The write arrow is retired: it shares the identity column centre with the spine.
    opacity: { pv: 1, wProvToPv: 0, boundLink: 1 },
    lit: ['pvc', 'pv'],
    // The link is the static end-state, so only the animated path winds it back to fade it in.
    rewind: { opacity: { boundLink: 0 } },
    // Delay 0 on purpose: the claimRef label is static, so the link must be on screen from frame one.
    flow: [
      F.fade({ target: 'boundLink', from: 0, to: 1, dur: FADE.in, fill: 'forwards', easing: 'ease-out' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
