import { P, F, defineCard } from './storage-kit.js';
import { line } from '../../lib/svg.js';
// Design notes for this card: ./CARDS.md#storage-dynamic-provisioning


const LEFT_X = 400;                                   // leftmost the TOP ROW may go, all viewports
const CANVAS_CX = 600;                                // where the chip strip sits, always

const COL_L_W = 200;                                  // identity column: the claim and its volume
const COL_R_W = 220;                                  // machinery column: class, provisioner, backend
const COL_GAP = 40;                                   // the elbow channel lives in here
const COL_R_X = LEFT_X + COL_L_W + COL_GAP;           // 640
// The claim tier sits inside the narration panel's y band, so the left edge is pinned at 400 and the
// composition is centred by pulling the machinery column in, not by sliding the whole card left.

const PVC_X = LEFT_X, PVC_Y = 70, PVC_W = COL_L_W, PVC_H = 80;
const PVC_RIGHT = PVC_X + PVC_W, PVC_BOTTOM = PVC_Y + PVC_H;   // 600 / 150

const SC_X = COL_R_X, SC_Y = 70, SC_W = COL_R_W, SC_H = 80;
const SC_LEFT = SC_X, SC_BOTTOM = SC_Y + SC_H;                 // 640 / 150
const SC_CX = SC_X + SC_W / 2;                                 // 750
const ROW_MY = SC_Y + SC_H / 2;                                // 110, shared by the claim and the class

const PROV_X = COL_R_X, PROV_Y = 250, PROV_W = COL_R_W, PROV_H = 90;
const PROV_LEFT = PROV_X, PROV_TOP = PROV_Y, PROV_BOTTOM = PROV_Y + PROV_H; // 640 / 250 / 340
const PROV_MY = PROV_Y + PROV_H / 2;                                        // 295

const CLOUD_X = COL_R_X, CLOUD_Y = 440, CLOUD_W = COL_R_W, CLOUD_H = 90;
const CLOUD_TOP = CLOUD_Y;                                     // 440

// The cylinder sits exactly under the claim, same width and same x, so the identity column reads as
// one stack rather than two blocks that happen to be near each other.
const PV_X = LEFT_X, PV_Y = 430, PV_W = COL_L_W, PV_H = 110;
const PV_TOP = PV_Y;                                           // 430
const PV_CX = PV_X + PV_W / 2;                                 // 500

const SPINE_X = PV_CX;  // 500
const LANE_DY = 15;     // half-gap between the CreateVolume lane and the handle-return lane
const DOWN_X = SC_CX + LANE_DY;  // 765: provisioner -> backend
const UP_X = SC_CX - LANE_DY;    // 735: backend -> provisioner
const CHIPS_Y = 585;

// Chip widths keep their hand-tuned values (each is sized for its longest value, PV holds
// 'a7f2 created'), but the x positions are DERIVED so the strip is centered on CANVAS_CX.
const CHIP_W = [210, 250, 240, 230];
const CHIP_GAP = 20;
const CHIPS_W = CHIP_W.reduce((a, b) => a + b, 0) + CHIP_GAP * (CHIP_W.length - 1);   // 990
const CHIPS_X0 = CHIP_W.reduce((acc, w, i) => {
  acc.push(i === 0 ? CANVAS_CX - CHIPS_W / 2 : acc[i - 1] + CHIP_W[i - 1] + CHIP_GAP);
  return acc;
}, []);                                                                               // 105 / 335 / 605 / 865

const ELBOW_X = PVC_RIGHT + COL_GAP / 2;   // 620

// Two lanes share each of these two faces, so they sit as a mirrored pair either side of the face
// midpoint: alone and off-centre, a single endpoint reads as a slip rather than as a pair.
const ROW_LANE = 12, PROV_LANE = 16;

// Each static wire and its ball share one array, so they cannot drift. Every endpoint is a block edge.
const W_SC_REF     = [[PVC_RIGHT, ROW_MY - ROW_LANE], [SC_LEFT, ROW_MY - ROW_LANE]];      // reference, no ball
const W_PVC_TO_PROV = [[PVC_RIGHT, ROW_MY + ROW_LANE], [ELBOW_X, ROW_MY + ROW_LANE], [ELBOW_X, PROV_MY - PROV_LANE], [PROV_LEFT, PROV_MY - PROV_LANE]];
const W_SC_TO_PROV  = [[SC_CX, SC_BOTTOM], [SC_CX, PROV_TOP]];
const W_PROV_TO_CLOUD = [[DOWN_X, PROV_BOTTOM], [DOWN_X, CLOUD_TOP]];
const W_CLOUD_TO_PROV = [[UP_X, CLOUD_TOP], [UP_X, PROV_BOTTOM]];
const W_PROV_TO_PV  = [[PROV_LEFT, PROV_MY + PROV_LANE], [ELBOW_X, PROV_MY + PROV_LANE], [ELBOW_X, 396], [PV_CX, 396], [PV_CX, PV_TOP]];
const W_BOUND       = [[SPINE_X, PVC_BOTTOM], [SPINE_X, PV_TOP]];

// The Bound link is the ONE element no part kind emits: a bare <line> with no arrowhead and no
// data-role, where P.arrow emits a marked <path> and P.relation adds the relation class too.
const [[bndX1, bndY1], [bndX2, bndY2]] = W_BOUND;
const boundLine = () => line({ class: 'scheme-arrow scheme-arrow-storage', x1: bndX1, y1: bndY1, x2: bndX2, y2: bndY2, fill: 'none' });

// The list order IS the append order, which is the z-order: blocks, then wires and their labels above
// them, then the chip strip, then the packet layer so every ball rides above everything.
export const SCENE = {
  'aria-label': 'Dynamic provisioning: a claim finds no existing volume to bind to, so the StorageClass it names points at a provisioner, the provisioner asks the storage backend to create a real disk, writes a PersistentVolume object to represent it, and that brand new volume is bound to the claim straight away',
  parts: [
    P.defs(),
    P.box({ key: 'pvc', x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-claim', sublabel: 'wants 5Gi, class gp3' }),
    P.box({ key: 'sc', x: SC_X, y: SC_Y, w: SC_W, h: SC_H, label: 'StorageClass gp3', sublabel: 'provisioner: ebs.csi.aws.com' }),
    P.box({ key: 'prov', x: PROV_X, y: PROV_Y, w: PROV_W, h: PROV_H, label: 'External-provisioner', sublabel: 'CSI controller sidecar' }),
    P.box({ key: 'cloud', x: CLOUD_X, y: CLOUD_Y, w: CLOUD_W, h: CLOUD_H, label: 'Storage backend', sublabel: 'reached via the CSI driver' }),
    // The volume does not exist until CreateVolume returns, so it starts invisible.
    P.cylinder({ key: 'pv', x: PV_X, y: PV_Y, w: PV_W, h: PV_H, label: 'PV a7f2', opacity: 0 }),
    P.relation({ points: W_SC_REF, dash: '5 5' }),
    P.raw({ key: 'boundLink', make: boundLine, opacity: 0 }),
    P.lane({ points: W_PVC_TO_PROV, dashed: true, dim: true }),
    P.lane({ points: W_SC_TO_PROV, dashed: true, dim: true }),
    P.lane({ points: W_PROV_TO_CLOUD, dashed: true, dim: true }),
    P.lane({ points: W_CLOUD_TO_PROV, dashed: true, dim: true }),
    P.lane({ key: 'wProvToPv', points: W_PROV_TO_PV, dashed: true, dim: true, opacity: 0 }),
    P.wire({ key: 'bound', x: SPINE_X + 22, y: 296, anchor: 'start' }),
    P.wire({ key: 'call', x: DOWN_X + 22, y: 396, anchor: 'start' }),
    P.wire({ key: 'pv', x: PV_X + PV_W / 2, y: 566 }),
    P.chip({ key: 'pvcChip', x: CHIPS_X0[0], y: CHIPS_Y, w: CHIP_W[0], h: 34, name: 'PVC', value: 'Pending' }),
    P.chip({ key: 'scChip', x: CHIPS_X0[1], y: CHIPS_Y, w: CHIP_W[1], h: 34, name: 'class', value: 'gp3' }),
    P.chip({ key: 'diskChip', x: CHIPS_X0[2], y: CHIPS_Y, w: CHIP_W[2], h: 34, name: 'disk', value: 'none' }),
    P.chip({ key: 'pvChip', x: CHIPS_X0[3], y: CHIPS_Y, w: CHIP_W[3], h: 34, name: 'PV', value: 'none' }),
    P.packets(),
  ],
  reset: { keys: ['pvc', 'sc', 'prov', 'cloud', 'pv', 'pvcChip', 'scChip', 'diskChip', 'pvChip'] },
};

const chips = (pvc, sc, disk, pv) => ({ pvcChip: pvc, scChip: sc, diskChip: disk, pvChip: pv });

// STO.S-01 as a field: the disk, the write arrow and the Bound link are all born mid-story, so all
// three are pinned on EVERY step and nothing is inherited from the step before it.
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
    narration: 'The StorageClass is the piece of configuration that names a provisioner and the parameters to build with. The external-provisioner sidecar watches for Pending claims that point at a class it owns, picks this one up, and reads both the size the claim asks for and the settings the class carries.',
    chipsCued: chips('Pending', 'gp3', 'none', 'none'),
    opacity: STACK_OFF,
    lit: ['pvc', 'sc'],
    // Both routes clear on the same beat: 197 and 100 units both land under routeDur's 700ms floor,
    // so the later of the two arrivals is exactly the claim's own, which is what the light keys off.
    flow: [
      F.route({ points: W_PVC_TO_PROV, name: 'claim' }),
      F.tag({ text: '5Gi, class gp3', points: W_PVC_TO_PROV }),
      F.route({ points: W_SC_TO_PROV, name: 'params' }),
      F.tag({ text: 'ebs.csi.aws.com', points: W_SC_TO_PROV }),
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
    // The provisioner calls, so it is lit from entry. The backend is NOT lit statically, which would
    // hide its own arrival cue below: a call cannot land on a block that was already answering.
    lit: ['prov'],
    // Descent then ascent, on separate lanes, so the round trip reads as a loop, not a retrace.
    flow: [
      F.route({ points: W_PROV_TO_CLOUD, name: 'call' }),
      F.tag({ text: 'CreateVolume 5Gi', points: W_PROV_TO_CLOUD }),
      F.light({ targets: ['cloud'], at: 'call' }),
      F.route({ points: W_CLOUD_TO_PROV, after: 'call', name: 'back' }),
      F.tag({ text: DISK_ID, points: W_CLOUD_TO_PROV, after: 'call' }),
      F.light({ targets: ['prov'], at: 'back' }),
    ],
  },
  {
    id: 'createpv',
    duration: 3000,
    narration: 'A disk on its own is invisible to Kubernetes. The provisioner writes a PersistentVolume object carrying the identifier it just got back, and that object is the cluster representation of the disk. Only now does the volume exist as something a claim can be paired with.',
    chipsCued: chips('Pending', 'gp3', DISK_ID, 'a7f2 created'),
    wires: { pv: PV_BACKED },
    // The volume exists by the end of this step, so its visibility is the static end-state. F.reveal
    // writes its own `from`, so the animated path needs no rewind to start it hidden.
    opacity: { pv: 1, wProvToPv: 1, boundLink: 0 },
    lit: ['prov', 'cloud'],
    flow: [
      F.route({ points: W_PROV_TO_PV, name: 'write' }),
      F.tag({ text: 'PV a7f2', points: W_PROV_TO_PV }),
      F.reveal({ target: 'pv', at: 'write' }),
      F.light({ targets: ['pv'], at: 'write' }),
    ],
  },
  {
    id: 'bind',
    duration: 2600,
    narration: 'The new volume was built for this one claim, so the provisioner already stamped it with a claimRef pointing back at the claim. There is nothing to search for and no shelf to pick from, so the pair goes straight to Bound. The volume was made to order.',
    chipsCued: chips('Bound', 'gp3', DISK_ID, 'Bound'),
    wires: { bound: 'claimRef: data-claim', pv: PV_BACKED },
    // The write arrow is retired here: it shares the identity column center with the spine, so the
    // two must never be on screen at once. It has also done its job, this step is about the pairing.
    opacity: { pv: 1, wProvToPv: 0, boundLink: 1 },
    lit: ['pvc', 'pv'],
    // The link is the static end-state, so only the animated path winds it back to fade it in.
    rewind: { opacity: { boundLink: 0 } },
    // delay 0, not 200: the claimRef wire label is static (written above) so it is on screen from
    // the first frame. Any delay here leaves it captioning a link that does not exist yet.
    flow: [
      F.fade({ target: 'boundLink', from: 0, to: 1, dur: 600, fill: 'forwards', easing: 'ease-out' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
