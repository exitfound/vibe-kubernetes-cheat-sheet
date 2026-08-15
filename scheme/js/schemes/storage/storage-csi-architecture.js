import { P, F, defineCard } from './storage-kit.js';
import { rect } from '../../lib/svg.js';
// Design notes for this card: ./CARDS.md#storage-csi-architecture


const M = 60;                                    // one margin, both sides
const CONTENT_L = M, CONTENT_R = 1200 - M;       // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;          // 600, the canvas centre by construction

const SIDE_W = 232;
const API_X = CONTENT_L, API_R = API_X + SIDE_W;             // 60 / 292
const KUBE_X = CONTENT_L, KUBE_R = KUBE_X + SIDE_W;          // 60 / 292
const CLOUD_X = CONTENT_R - SIDE_W;                          // 908, right edge lands on CONTENT_R

const FRAME_X = 420, FRAME_PAD = 12;
const CF_W = CONTENT_R - FRAME_X;                            // 720
const CF_INNER_L = FRAME_X + FRAME_PAD;                      // 432
const CF_INNER_R = CONTENT_R - FRAME_PAD;                    // 1128

const CF_Y = 48;
const S_Y = 82, S_H = 76;                                    // sidecar row 82..158
const S_BOTTOM = S_Y + S_H;                                  // 158
const BUS_Y = 186;                                           // the shared gRPC bus, 28 below the row
const DRV_Y = 208, DRV_H = 68;                               // 208..276
const DRV_BOTTOM = DRV_Y + DRV_H;                            // 276
const CF_H = (DRV_BOTTOM + 22) - CF_Y;                       // 250 -> frame 48..298

const MID_Y = 350, MID_H = 72;                               // apiserver + cloud row, 350..422
const MID_CY = MID_Y + MID_H / 2;                            // 386

const NF_Y = 448;
const B_Y = 480, B_H = 72;                                   // node-row boxes 480..552
const B_CY = B_Y + B_H / 2;                                  // 516
const NF_H = (B_Y + B_H + 20) - NF_Y;                        // 124 -> frame 448..572

const CHIPS_Y = 590, CHIP_H = 34;                            // 590..624, 16 clear of the viewBox

const S_GAP = 14;
const S_W = [158, 182, 146, 168];
const S_X = S_W.reduce((acc, w, i) => {
  acc.push(i === 0 ? CF_INNER_L : acc[i - 1] + S_W[i - 1] + S_GAP);
  return acc;
}, []);                                                      // 432 / 604 / 800 / 960, last ends 1128
const S_CX = S_X.map((x, i) => x + S_W[i] / 2);              // 511 / 695 / 873 / 1044

const DRV_CX = (CF_INNER_L + CF_INNER_R) / 2;                // 780
const DRV_W = SIDE_W;
const DRV_X = DRV_CX - DRV_W / 2;                            // 664, right edge 896
const DRV_EXIT_X = DRV_CX;                                   // 780

// Node frame: same left edge as the controller frame, right edge set so the node driver ends 140
// from the node fs disk, matching the kubelet gutter on the other side.
const NF_INNER_L = FRAME_X + FRAME_PAD;                      // 432
const REG_W = 216, B_GAP = 24, ND_W = 184;
const REG_X = NF_INNER_L, REG_R = REG_X + REG_W;             // 432 / 648
const ND_X = REG_R + B_GAP, ND_R = ND_X + ND_W;              // 672 / 856
const NF_W = (ND_R + FRAME_PAD) - FRAME_X;                   // 448 -> frame 420..868

const GUTTER = REG_X - KUBE_R;                               // 140, the matched wire length
const FS_X = ND_R + GUTTER, FS_W = CONTENT_R - FS_X;         // 996 / 144, flush to the right edge
const FS_H = 116;
// A cylinder's straight side edges run from y+8 to y+h-8, so the middle of its FACE is y + h/2. Pin
// that to the node-row centre and the wire from the node driver enters the disk dead on its side.
const FS_Y = B_CY - FS_H / 2;                                // 458 -> 458..574, 2 below the node band
const FS_CY = B_CY;                                          // 516

const CHIP_GAP = 16, CHIP_COUNT = 4;
const CHIPS_W = CONTENT_R - CONTENT_L;                                              // 1080
const CHIP_W = (CHIPS_W - CHIP_GAP * (CHIP_COUNT - 1)) / CHIP_COUNT;                // 258
// Laid out from CX outwards rather than from the left edge inwards, so the strip is centred on the
// canvas by construction and stays centred if the band or the chip count ever changes.
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) =>
  CX - CHIPS_W / 2 + i * (CHIP_W + CHIP_GAP));

const LANE = 14;
const W_API_PROV   = [[API_R, MID_CY], [S_CX[0] - LANE, MID_CY], [S_CX[0] - LANE, S_BOTTOM]];
const W_PROV_DRV   = [[S_CX[0] + LANE, S_BOTTOM], [S_CX[0] + LANE, BUS_Y], [DRV_CX, BUS_Y], [DRV_CX, DRV_Y]];
const W_DRV_CLOUD  = [[DRV_EXIT_X, DRV_BOTTOM], [DRV_EXIT_X, MID_CY], [CLOUD_X, MID_CY]];
const W_REG_KUBE   = [[REG_X, B_CY], [KUBE_R, B_CY]];
const W_ND_FS      = [[ND_R, B_CY], [FS_X, FS_CY]];

const W_BUS_TAIL   = [[DRV_CX, BUS_Y], [S_CX[3], BUS_Y]];
const W_STUB_ATT   = [[S_CX[1], S_BOTTOM], [S_CX[1], BUS_Y]];
const W_STUB_RES   = [[S_CX[2], S_BOTTOM], [S_CX[2], BUS_Y]];
const W_STUB_SNAP  = [[S_CX[3], S_BOTTOM], [S_CX[3], BUS_Y]];

// No part kind emits a bare dashed outline, so this rect sets its stroke and dash INLINE.
// Only the rect needs that escape: the caption stays a P.tag and the pair stays a P.group.
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

// List order IS append order, which is z-order: both frames first so every block sits above its own,
// then the blocks and disk, then busses, routes and captions, then the chip strip, then the packets.
export const SCENE = {
  'aria-label': 'CSI driver architecture: Kubernetes core knows nothing about any storage vendor, so a CSI driver ships in two halves, a controller plugin that runs as a Deployment or StatefulSet with four sidecars that each watch one kind of Kubernetes object and turn it into one gRPC call on a shared bus into a single vendor driver, and a node plugin that runs as a DaemonSet on every Node, registers itself with the local Kubelet, and is the only component that ever mounts vendor storage on the Node',
  parts: [
    P.defs(),
    frame(FRAME_X, CF_Y, CF_W, CF_H, 'CSI CONTROLLER PLUGIN  ·  Deployment or StatefulSet'),
    frame(FRAME_X, NF_Y, NF_W, NF_H, 'CSI NODE PLUGIN  ·  DaemonSet on every node'),
    P.box({ key: 'api', x: API_X, y: MID_Y, w: SIDE_W, h: MID_H, label: 'Kube-apiserver', sublabel: 'core, no vendor code' }),
    P.box({ key: 'prov', x: S_X[0], y: S_Y, w: S_W[0], h: S_H, label: 'External-provisioner', sublabel: 'watches PVC' }),
    P.box({ key: 'att', x: S_X[1], y: S_Y, w: S_W[1], h: S_H, label: 'External-attacher', sublabel: 'watches VolumeAttachment' }),
    P.box({ key: 'res', x: S_X[2], y: S_Y, w: S_W[2], h: S_H, label: 'External-resizer', sublabel: 'watches PVC resize' }),
    P.box({ key: 'snap', x: S_X[3], y: S_Y, w: S_W[3], h: S_H, label: 'External-snapshotter', sublabel: 'watches VolumeSnapshotContent' }),
    P.box({ key: 'drv', x: DRV_X, y: DRV_Y, w: DRV_W, h: DRV_H, label: 'CSI controller driver', sublabel: 'one vendor gRPC server' }),
    P.box({ key: 'cloud', x: CLOUD_X, y: MID_Y, w: SIDE_W, h: MID_H, label: 'Cloud storage API', sublabel: 'makes + attaches disks' }),
    P.box({ key: 'kube', x: KUBE_X, y: B_Y, w: SIDE_W, h: B_H, label: 'Kubelet', sublabel: 'asks node plugin to mount' }),
    P.box({ key: 'reg', x: REG_X, y: B_Y, w: REG_W, h: B_H, label: 'Node-driver-registrar', sublabel: 'sidecar, registers driver' }),
    P.box({ key: 'nd', x: ND_X, y: B_Y, w: ND_W, h: B_H, label: 'CSI node driver', sublabel: 'the only mounter' }),
    // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse
    // is not part of the visible front face. Re-centre on the face, as storage-volume-model does.
    P.cylinder({ key: 'fs', x: FS_X, y: FS_Y, w: FS_W, h: FS_H, label: 'NodeFS', labelY: FS_H / 2 + 10 }),
    // A relationship line, not a route: same dim dashed storage styling as a lane but with no
    // marker-end, because nothing ever travels along the bus or its stubs.
    P.relation({ points: W_BUS_TAIL }),
    P.relation({ points: W_STUB_ATT }),
    P.relation({ points: W_STUB_RES }),
    P.relation({ points: W_STUB_SNAP }),
    P.lane({ points: W_API_PROV, dashed: true, dim: true }),
    P.lane({ points: W_PROV_DRV, dashed: true, dim: true }),
    P.lane({ points: W_DRV_CLOUD, dashed: true, dim: true }),
    P.lane({ points: W_REG_KUBE, dashed: true, dim: true }),
    P.lane({ points: W_ND_FS, dashed: true, dim: true }),
    P.wire({ key: 'watch', x: (API_R + S_CX[0] - LANE) / 2, y: MID_CY + 20 }),
    P.wire({ key: 'reg', x: (KUBE_R + REG_X) / 2, y: B_CY + 22 }),
    P.wire({ key: 'fs', x: (ND_R + FS_X) / 2, y: B_CY + 22 }),
    P.chip({ key: 'coreChip', x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'K8s core',    value: 'vendor-agnostic' }),
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
    duration: 2100,
    // Packet-less and Pod-less, and still NO blink: the pulse is reserved for Pods, and this card has
    // none, so an infrastructure box states itself with a steady .highlight outline and nothing else.
    narration: 'Kubernetes core deals only in objects: a PVC, a PersistentVolume, a VolumeAttachment. It has no idea how any particular disk is made or attached. That deliberate ignorance is what lets one Kubernetes talk to dozens of storage backends it was never taught about.',
    chipsCued: chips('objects only', 'idle', 'idle', 'sidecars'),
    lit: ['api'],
  },
  {
    id: 'controller',
    duration: 2400,
    // Structural step: the four sidecars light and STAY lit. No blink here either, same reason as
    // the core step: this is a set of four boxes to be read side by side, not a beat to be noticed.
    narration: 'The controller plugin runs as a Deployment or a StatefulSet, and inside it ride the sidecars. Each watches one kind of object and does one job: provisioner for claims, attacher for attachments, resizer for resizes, snapshotter for snapshots. All four call one driver.',
    chipsCued: chips('objects only', 'four sidecars', 'idle', 'one call each'),
    lit: ['prov', 'att', 'res', 'snap'],
  },
  {
    id: 'translate',
    duration: 3600,
    narration: 'Follow one sidecar. The external-provisioner sees a Pending PVC in the API server and turns it into a single gRPC call, CreateVolume, into the vendor driver. The driver is the only part that speaks to the cloud API and asks it to carve out a real disk. Object in, gRPC out.',
    chipsCued: chips('PVC Pending', 'CreateVolume', 'idle', 'object -> gRPC'),
    wires: { watch: 'PVC Pending' },
    lit: ['api'],
    // Three chained hops, each timed off the previous arrival rather than a hard-coded delay: object
    // out of the apiserver, one gRPC call into the driver, one vendor call out to the cloud.
    flow: [
      F.route({ points: W_API_PROV, name: 'watch', lights: ['prov'] }),
      F.route({ points: W_PROV_DRV, after: 'watch', name: 'call' }),
      F.tag({ text: 'CreateVolume', points: W_PROV_DRV, after: 'watch' }),
      F.light({ targets: ['drv'], at: 'call' }),
      F.route({ points: W_DRV_CLOUD, after: 'call', name: 'out' }),
      F.tag({ text: 'make a disk', points: W_DRV_CLOUD, after: 'call' }),
      F.light({ targets: ['cloud'], at: 'out' }),
    ],
  },
  {
    id: 'node',
    duration: 2800,
    narration: 'The other half is the node plugin, a DaemonSet, so a copy runs on every Node. It cannot mount anything until Kubelet knows it exists, so the node-driver-registrar sidecar registers the driver with the local Kubelet. From then on Kubelet routes mount requests for this driver to this node plugin.',
    chipsCued: chips('objects only', 'idle', 'registered', 'registrar sidecar'),
    wires: { reg: 'plugin socket' },
    lit: ['reg'],
    flow: [
      F.route({ points: W_REG_KUBE, name: 'reg' }),
      F.tag({ text: 'driver ready', points: W_REG_KUBE }),
      F.light({ targets: ['kube'], at: 'reg' }),
    ],
  },
  {
    id: 'fstoucher',
    duration: 2800,
    narration: 'One rule holds the whole design together: only the node plugin ever mounts the volume on the Node. The controller talks to the cloud and never sees a mount, and Kubelet never mounts vendor storage itself. When bytes finally land on disk, it is the CSI node driver that put them there.',
    chipsCued: chips('objects only', 'never mounts', 'mounts the disk', 'gRPC NodePublish'),
    wires: { fs: 'mount' },
    lit: ['nd'],
    flow: [
      F.route({ points: W_ND_FS, name: 'mount' }),
      F.tag({ text: 'NodePublish', points: W_ND_FS }),
      F.light({ targets: ['fs'], at: 'mount' }),
    ],
  },
  {
    id: 'bridge',
    duration: 2600,
    narration: 'So the sidecars are the bridge. Kubernetes core writes plain objects and knows nothing about the vendor. The sidecars translate each object into a gRPC call, the driver runs it, and the node plugin does the one privileged thing of touching the disk. Swap the driver, keep the objects.',
    chipsCued: chips('objects only', 'translates', 'mounts the disk', 'the sidecars'),
    lit: ['api', 'prov', 'att', 'res', 'snap', 'drv', 'nd'],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
