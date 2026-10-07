import { P, F, BEAT, defineCard } from './storage-kit.js';
import { rect } from '../../lib/svg.js';
// Design notes for this card: ./CARDS/storage-csi-architecture.md


const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;
const CX = (CONTENT_L + CONTENT_R) / 2;

const SIDE_W = 232;
const API_X = CONTENT_L, API_R = API_X + SIDE_W;
const KUBE_X = CONTENT_L, KUBE_R = KUBE_X + SIDE_W;
const CLOUD_X = CONTENT_R - SIDE_W;

const FRAME_X = 420, FRAME_PAD = 12;
const CF_W = CONTENT_R - FRAME_X;
const CF_INNER_L = FRAME_X + FRAME_PAD;
const CF_INNER_R = CONTENT_R - FRAME_PAD;

// Every actor block is the catalog 80 tall (NET.L-01), and the tiers chain off each other.
const BLOCK_H = 80;
const CF_Y = 48;
const S_Y = 82, S_H = BLOCK_H;
const S_BOTTOM = S_Y + S_H;
const BUS_Y = S_BOTTOM + 28;                                 // the shared gRPC bus
const DRV_Y = BUS_Y + 22, DRV_H = BLOCK_H;
const DRV_BOTTOM = DRV_Y + DRV_H;
const CF_H = (DRV_BOTTOM + 22) - CF_Y;
const CF_BOTTOM = CF_Y + CF_H;

const MID_Y = CF_BOTTOM + 22, MID_H = BLOCK_H;               // apiserver + cloud row
const MID_CY = MID_Y + MID_H / 2;

const NF_Y = MID_Y + MID_H + 26;
const B_Y = NF_Y + 32, B_H = BLOCK_H;
const B_CY = B_Y + B_H / 2;
const NF_H = (B_Y + B_H + 20) - NF_Y;

const CHIPS_Y = 590, CHIP_H = 34;

// The four sidecars cannot take the catalog 232 inside the frame, so widths are solved from the
// inner span: each box gets its widest string (measured after fonts.ready) plus an equal share of the rest.
const S_GAP = 14;
const S_NEED = [120.2, 147.2, 110.4, 177.9];                 // widest string per box: provisioner label, then three sublabels
const S_SPAN = CF_INNER_R - CF_INNER_L - S_GAP * 3;
const S_AIR = (S_SPAN - S_NEED.reduce((a, b) => a + b)) / 4;
const S_W = S_NEED.map(n => 2 * Math.round((n + S_AIR) / 2)); // even, so every centre is whole
S_W[3] += S_SPAN - S_W.reduce((a, b) => a + b);              // any rounding lands on the last
const S_X = S_W.reduce((acc, w, i) => {
  acc.push(i === 0 ? CF_INNER_L : acc[i - 1] + S_W[i - 1] + S_GAP);
  return acc;
}, []);
const S_CX = S_X.map((x, i) => x + S_W[i] / 2);

const DRV_CX = (CF_INNER_L + CF_INNER_R) / 2;
const DRV_W = SIDE_W;
const DRV_X = DRV_CX - DRV_W / 2;
const DRV_EXIT_X = DRV_CX;

// The node driver ends one GUTTER from the node fs disk, matching the kubelet gutter on the other side.
const NF_INNER_L = FRAME_X + FRAME_PAD;
const REG_W = SIDE_W, B_GAP = 16, ND_W = SIDE_W;
const REG_X = NF_INNER_L, REG_R = REG_X + REG_W;
const ND_X = REG_R + B_GAP, ND_R = ND_X + ND_W;
const NF_W = (ND_R + FRAME_PAD) - FRAME_X;

// Kubelet sits ASK_DY above the node row so its right face carries a mirrored lane pair, the ask
// clear of the reply tag above its ball.
const ASK_DY = 18;
const KUBE_CY = B_CY - ASK_DY, KUBE_Y = KUBE_CY - B_H / 2;
const ASK_Y = KUBE_CY - ASK_DY;
const ASK_X = (KUBE_R + FRAME_X) / 2;                        // the gutter midline
const OVER_Y = NF_Y - 18;                                    // over the node frame and its caption
const ND_CX = ND_X + ND_W / 2;                               // right of the frame caption ink

const GUTTER = REG_X - KUBE_R;                               // the matched wire length
const FS_X = ND_R + GUTTER, FS_W = CONTENT_R - FS_X;         // flush to the right edge
const FS_H = 116;
// A cylinder face centre is y + h/2, so pinning it to the node-row centre lands the wire on its side.
const FS_Y = B_CY - FS_H / 2;
const FS_CY = B_CY;

const CHIP_GAP = 16, CHIP_COUNT = 4;
const CHIPS_W = CONTENT_R - CONTENT_L;
const CHIP_W = (CHIPS_W - CHIP_GAP * (CHIP_COUNT - 1)) / CHIP_COUNT;
// Laid out from CX outwards, so the strip is centred by construction.
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) =>
  CX - CHIPS_W / 2 + i * (CHIP_W + CHIP_GAP));

const LANE = 14;
const W_API_PROV   = [[API_R, MID_CY], [S_CX[0] - LANE, MID_CY], [S_CX[0] - LANE, S_BOTTOM]];
const W_PROV_DRV   = [[S_CX[0] + LANE, S_BOTTOM], [S_CX[0] + LANE, BUS_Y], [DRV_CX, BUS_Y], [DRV_CX, DRV_Y]];
const W_DRV_CLOUD  = [[DRV_EXIT_X, DRV_BOTTOM], [DRV_EXIT_X, MID_CY], [CLOUD_X, MID_CY]];
const W_REG_KUBE   = [[REG_X, B_CY], [KUBE_R, B_CY]];
const W_ND_FS      = [[ND_R, B_CY], [FS_X, FS_CY]];
const W_KUBE_ND    = [[KUBE_R, ASK_Y], [ASK_X, ASK_Y], [ASK_X, OVER_Y], [ND_CX, OVER_Y], [ND_CX, B_Y]];

const W_BUS_TAIL   = [[DRV_CX, BUS_Y], [S_CX[3], BUS_Y]];
const W_STUB_ATT   = [[S_CX[1], S_BOTTOM], [S_CX[1], BUS_Y]];
const W_STUB_RES   = [[S_CX[2], S_BOTTOM], [S_CX[2], BUS_Y]];
const W_STUB_SNAP  = [[S_CX[3], S_BOTTOM], [S_CX[3], BUS_Y]];

// No part kind emits a bare dashed outline, so this rect sets its stroke and dash INLINE.
const frameRect = (x, y, w, h) => {
  const r = rect({ x, y, width: w, height: h, rx: 12, fill: 'none' });
  r.style.stroke = 'var(--diag-node-stroke)';
  r.style.strokeDasharray = '3 6';
  return r;
};

const frame = (x, y, w, h, label) => P.group({
  parts: [
    P.raw({ make: () => frameRect(x, y, w, h) }),
    P.tag({ cls: 'scheme-label dim', x: x + 16, y: y + 22, anchor: 'start', text: label }),
  ],
});

// Z-order: frames, blocks and disk, busses, routes and captions, chip strip, packets.
export const SCENE = {
  'aria-label': 'CSI driver architecture: the Kubernetes control plane deals only in objects and has no idea how any disk is made or attached, so a CSI driver ships in two halves, a controller plugin that runs as a Deployment or StatefulSet with the sidecars its driver needs, four drawn here, that each watch one kind of Kubernetes object and turn it into gRPC calls on a shared bus into a single vendor driver, which asks the cloud storage API to make a disk, and a node plugin that runs as a DaemonSet on every eligible Node, whose node-driver-registrar sidecar answers the local Kubelet with the driver name and socket path, after which Kubelet calls the CSI node driver, NodeStageVolume if the driver stages and then NodePublishVolume, and never mounts a vendor filesystem itself: only the node plugin mounts one for a Pod, and the container runtime only binds that mount into the container',
  parts: [
    P.defs(),
    frame(FRAME_X, CF_Y, CF_W, CF_H, 'CSI CONTROLLER PLUGIN  ·  Deployment or StatefulSet'),
    frame(FRAME_X, NF_Y, NF_W, NF_H, 'CSI NODE PLUGIN  ·  DaemonSet, one per node'),
    P.box({ key: 'api', x: API_X, y: MID_Y, w: SIDE_W, h: MID_H, label: 'Kube-apiserver', sublabel: 'control plane, no driver' }),
    P.box({ key: 'prov', x: S_X[0], y: S_Y, w: S_W[0], h: S_H, label: 'External-provisioner', sublabel: 'watches PVC' }),
    P.box({ key: 'att', x: S_X[1], y: S_Y, w: S_W[1], h: S_H, label: 'External-attacher', sublabel: 'watches VolumeAttachment' }),
    P.box({ key: 'res', x: S_X[2], y: S_Y, w: S_W[2], h: S_H, label: 'External-resizer', sublabel: 'watches PVC resize' }),
    P.box({ key: 'snap', x: S_X[3], y: S_Y, w: S_W[3], h: S_H, label: 'External-snapshotter', sublabel: 'watches VolumeSnapshotContent' }),
    P.box({ key: 'drv', x: DRV_X, y: DRV_Y, w: DRV_W, h: DRV_H, label: 'CSI controller driver', sublabel: 'one vendor gRPC server' }),
    P.box({ key: 'cloud', x: CLOUD_X, y: MID_Y, w: SIDE_W, h: MID_H, label: 'Cloud storage API', sublabel: 'makes + attaches disks' }),
    P.box({ key: 'kube', x: KUBE_X, y: KUBE_Y, w: SIDE_W, h: B_H, label: 'Kubelet', sublabel: 'asks node driver to mount' }),
    P.box({ key: 'reg', x: REG_X, y: B_Y, w: REG_W, h: B_H, label: 'Node-driver-registrar', sublabel: 'sidecar, registers driver' }),
    P.box({ key: 'nd', x: ND_X, y: B_Y, w: ND_W, h: B_H, label: 'CSI node driver', sublabel: 'mounts the volume' }),
    // Re-centre the label on the visible front face, not the raw bbox with its top cap.
    P.cylinder({ key: 'fs', x: FS_X, y: FS_Y, w: FS_W, h: FS_H, label: 'NodeFS', labelY: FS_H / 2 + 10 }),
    // A relation, not a lane: nothing travels on the bus or its stubs, so no marker-end.
    P.relation({ points: W_BUS_TAIL }),
    P.relation({ points: W_STUB_ATT }),
    P.relation({ points: W_STUB_RES }),
    P.relation({ points: W_STUB_SNAP }),
    P.lane({ points: W_API_PROV, dashed: true, dim: true }),
    P.lane({ points: W_PROV_DRV, dashed: true, dim: true }),
    P.lane({ points: W_DRV_CLOUD, dashed: true, dim: true }),
    P.lane({ points: W_REG_KUBE, dashed: true, dim: true }),
    P.lane({ points: W_ND_FS, dashed: true, dim: true }),
    P.lane({ points: W_KUBE_ND, dashed: true, dim: true }),
    P.wire({ key: 'watch', x: (API_R + S_CX[0] - LANE) / 2, y: MID_CY + 20 }),
    P.wire({ key: 'reg', x: (KUBE_R + REG_X) / 2, y: B_CY + 22 }),
    P.wire({ key: 'fs', x: (ND_R + FS_X) / 2, y: B_CY + 22 }),
    P.chip({ key: 'coreChip', x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'control plane', value: 'vendor-agnostic' }),
    P.chip({ key: 'ctrlChip', x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'controller',  value: 'idle' }),
    P.chip({ key: 'nodeChip', x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'node plugin', value: 'idle' }),
    P.chip({ key: 'brdgChip', x: CHIP_X[3], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'bridge',      value: 'sidecars' }),
    P.packets(),
  ],
  reset: {
    keys: ['api', 'prov', 'att', 'res', 'snap', 'drv', 'cloud', 'kube', 'reg', 'nd', 'fs',
      'coreChip', 'ctrlChip', 'nodeChip', 'brdgChip'],
  },
};

const chips = (core, ctrl, node, bridge) => ({ coreChip: core, ctrlChip: ctrl, nodeChip: node, brdgChip: bridge });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('vendor-agnostic', 'idle', 'idle', 'sidecars'),
  },
  {
    id: 'core',
    duration: 2400,
    // No packet and no Pod, so the beat is the static highlight on the apiserver (M-27).
    narration: 'The control plane deals only in objects: a PVC, a PersistentVolume, a VolumeAttachment. It has no idea how any particular disk is made or attached. That deliberate ignorance is what lets one Kubernetes talk to dozens of storage backends it was never taught about.',
    chipsCued: chips('objects only', 'idle', 'idle', 'sidecars'),
    lit: ['api'],
  },
  {
    id: 'controller',
    duration: 2600,
    // The four sidecars light as one set: the sentence names all four as the actor.
    narration: 'The controller plugin runs as a Deployment or a StatefulSet, with the sidecars its driver needs beside it. Each watches one kind of object and has one task: provisioner for claims, attacher for attachments, resizer for resizes, snapshotter for snapshots. All of them call one driver.',
    chipsCued: chips('objects only', 'sidecars as needed', 'idle', 'one object kind each'),
    lit: ['prov', 'att', 'res', 'snap'],
  },
  {
    id: 'translate',
    duration: 4400,
    narration: 'Follow one sidecar. The external-provisioner sees a Pending PVC in the API server and turns it into a single gRPC call, CreateVolume, into the vendor driver. The driver, not the sidecar, is what speaks to the cloud API and asks it to carve out a real disk. Object in, gRPC out.',
    chipsCued: chips('PVC Pending', 'CreateVolume', 'idle', 'object -> gRPC'),
    wires: { watch: 'PVC Pending' },
    lit: ['api'],
    // Three chained hops, the first BEAT.lead after the lit apiserver (M-18).
    flow: [
      F.route({ points: W_API_PROV, delay: BEAT.lead, name: 'watch', lights: ['prov'] }),
      F.route({ points: W_PROV_DRV, after: 'watch', name: 'call', tag: { text: 'CreateVolume' } }),
      F.light({ targets: ['drv'], at: 'call' }),
      F.route({ points: W_DRV_CLOUD, after: 'call', name: 'out', tag: { text: 'make a disk' } }),
      F.light({ targets: ['cloud'], at: 'out' }),
    ],
  },
  {
    id: 'node',
    duration: 2800,
    narration: 'The other half is the node plugin, a DaemonSet, so a copy runs on every eligible Node. Its node-driver-registrar sidecar leaves a socket where Kubelet looks for plugins, and answers Kubelet with the driver name and socket path. Kubelet then sends mount requests for this driver to this plugin.',
    chipsCued: chips('objects only', 'idle', 'registered', 'registrar sidecar'),
    wires: { reg: 'plugin socket' },
    lit: ['reg'],
    flow: [
      F.route({ points: W_REG_KUBE, delay: BEAT.lead, name: 'reg', tag: { text: 'name + socket' } }),
      F.light({ targets: ['kube'], at: 'reg' }),
    ],
  },
  {
    id: 'fstoucher',
    duration: 3700,
    narration: 'Kubelet never mounts a vendor filesystem itself: it calls NodePublishVolume, after NodeStageVolume if the driver stages, and only the node plugin mounts it for a Pod. The runtime just binds that mount into the container. The controller makes no mount a Pod uses. The app writes through it.',
    chipsCued: chips('objects only', 'no Pod mount', 'mounts the disk', 'no sidecar in path'),
    wires: { fs: '/var/lib/kubelet' },
    lit: ['kube'],
    // The call leaves the lit Kubelet (M-18), the mount chains off its arrival.
    flow: [
      F.route({ points: W_KUBE_ND, delay: BEAT.lead, name: 'ask', tag: { text: 'NodePublish' } }),
      F.light({ targets: ['nd'], at: 'ask' }),
      F.route({ points: W_ND_FS, after: 'ask', name: 'mount', tag: { text: 'mount' } }),
      F.light({ targets: ['fs'], at: 'mount' }),
    ],
  },
  {
    id: 'bridge',
    duration: 2600,
    narration: 'So the sidecars are the bridge. The control plane writes plain objects and runs no vendor driver. The sidecars translate the objects into gRPC calls, the driver runs them, and the node plugin does the privileged work, like the mount. Swap the driver, keep the objects.',
    chipsCued: chips('objects only', 'translates', 'mounts the disk', 'the sidecars'),
    lit: ['api', 'prov', 'att', 'res', 'snap', 'drv', 'nd'],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
