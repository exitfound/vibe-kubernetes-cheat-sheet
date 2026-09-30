import { P, F, BEAT, defineCard } from './storage-kit.js';
import { rect } from '../../lib/svg.js';
// Design notes for this card: ./CARDS/storage-csi-architecture.md


// One margin both sides, so CONTENT_L / CONTENT_R and CX fall out of it and the canvas centre is
// construction rather than a typed 600. Changing M re-solves every tier.
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

// Every actor block is the catalog 80 tall (NET.L-01), so the tiers are chained off each other
// rather than typed: each gap is named once and a block height change re-solves the rest.
const BLOCK_H = 80;
const CF_Y = 48;
const S_Y = 82, S_H = BLOCK_H;                               // sidecar row 82..162
const S_BOTTOM = S_Y + S_H;                                  // 162
const BUS_Y = S_BOTTOM + 28;                                 // 190, the shared gRPC bus, 28 below the row
const DRV_Y = BUS_Y + 22, DRV_H = BLOCK_H;                   // 212..292
const DRV_BOTTOM = DRV_Y + DRV_H;                            // 292
const CF_H = (DRV_BOTTOM + 22) - CF_Y;                       // 266 -> frame 48..314
const CF_BOTTOM = CF_Y + CF_H;                               // 314

const MID_Y = CF_BOTTOM + 22, MID_H = BLOCK_H;               // apiserver + cloud row, 336..416
const MID_CY = MID_Y + MID_H / 2;                            // 376

const NF_Y = MID_Y + MID_H + 26;                             // 442
const B_Y = NF_Y + 32, B_H = BLOCK_H;                        // node-row boxes 474..554
const B_CY = B_Y + B_H / 2;                                  // 514
const NF_H = (B_Y + B_H + 20) - NF_Y;                        // 132 -> frame 442..574

const CHIPS_Y = 590, CHIP_H = 34;                            // 590..624, 16 clear of the viewBox and the node frame

// The four sidecars cannot take the catalog 232: four of them need 928 plus the gaps against the
// frame's inner span of 696, which the panel wall (FRAME_X 420) and the right margin fix. So the
// widths are SOLVED from that span: each box gets its widest string, measured after fonts.ready at
// 1100x800 (the widest of label and sublabel), plus an equal share of what is left over.
const S_GAP = 14;
const S_NEED = [120.2, 147.2, 110.4, 177.9];                 // provisioner label, then three sublabels
const S_SPAN = CF_INNER_R - CF_INNER_L - S_GAP * 3;          // 654
const S_AIR = (S_SPAN - S_NEED.reduce((a, b) => a + b)) / 4; // ~24.6 per box, ~12.3 either side
const S_W = S_NEED.map(n => 2 * Math.round((n + S_AIR) / 2)); // even, so every centre is whole
S_W[3] += S_SPAN - S_W.reduce((a, b) => a + b);              // 144 / 172 / 134 / 204, any rounding lands on the last
const S_X = S_W.reduce((acc, w, i) => {
  acc.push(i === 0 ? CF_INNER_L : acc[i - 1] + S_W[i - 1] + S_GAP);
  return acc;
}, []);                                                      // 432 / 590 / 776 / 924, last ends 1128
const S_CX = S_X.map((x, i) => x + S_W[i] / 2);              // 504 / 676 / 843 / 1026

const DRV_CX = (CF_INNER_L + CF_INNER_R) / 2;                // 780
const DRV_W = SIDE_W;
const DRV_X = DRV_CX - DRV_W / 2;                            // 664, right edge 896
const DRV_EXIT_X = DRV_CX;                                   // 780

// Node frame: same left edge as the controller frame, right edge set so the node driver ends 140
// from the node fs disk, matching the kubelet gutter on the other side.
const NF_INNER_L = FRAME_X + FRAME_PAD;                      // 432
const REG_W = SIDE_W, B_GAP = 16, ND_W = SIDE_W;
const REG_X = NF_INNER_L, REG_R = REG_X + REG_W;             // 432 / 664
const ND_X = REG_R + B_GAP, ND_R = ND_X + ND_W;              // 680 / 912
const NF_W = (ND_R + FRAME_PAD) - FRAME_X;                   // 504 -> frame 420..924

// Kubelet sits ASK_DY above the node row so its right face carries a mirrored lane pair: the reply
// lands at +ASK_DY and the ask leaves at -ASK_DY, clear of the reply tag that inks 12..24 above its ball.
const ASK_DY = 18;
const KUBE_CY = B_CY - ASK_DY, KUBE_Y = KUBE_CY - B_H / 2;   // 496, box 456..536
const ASK_Y = KUBE_CY - ASK_DY;                              // 478
const ASK_X = (KUBE_R + FRAME_X) / 2;                        // 356, the gutter midline
const OVER_Y = NF_Y - 18;                                    // 424, over the node frame and its caption
const ND_CX = ND_X + ND_W / 2;                               // 796, right of the caption ink (ends 696)

const GUTTER = REG_X - KUBE_R;                               // 140, the matched wire length
const FS_X = ND_R + GUTTER, FS_W = CONTENT_R - FS_X;         // 1052 / 88, flush to the right edge
const FS_H = 116;
// A cylinder's straight side edges run from y+8 to y+h-8, so the middle of its FACE is y + h/2. Pin
// that to the node-row centre and the wire from the node driver enters the disk dead on its side.
const FS_Y = B_CY - FS_H / 2;                                // 456 -> 456..572, 2 above the node frame foot
const FS_CY = B_CY;                                          // 514

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
const W_KUBE_ND    = [[KUBE_R, ASK_Y], [ASK_X, ASK_Y], [ASK_X, OVER_Y], [ND_CX, OVER_Y], [ND_CX, B_Y]];

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
    // Nothing travels and the card has no Pod, so the beat is the static highlight on the apiserver
    // (M-27): the sentence is about the control plane, and no chip and no block flashes (M-26, M-01).
    narration: 'The control plane deals only in objects: a PVC, a PersistentVolume, a VolumeAttachment. It has no idea how any particular disk is made or attached. That deliberate ignorance is what lets one Kubernetes talk to dozens of storage backends it was never taught about.',
    chipsCued: chips('objects only', 'idle', 'idle', 'sidecars'),
    lit: ['api'],
  },
  {
    id: 'controller',
    duration: 2600,
    // Structural step: the four sidecars light as ONE set and STAY lit, because the sentence names
    // all four as the actor and singling one out would say what the next step says.
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
    // Three chained hops, the first BEAT.lead after the lit apiserver (M-18), each later one off the
    // previous arrival: object out of the apiserver, one gRPC call into the driver, one vendor call out.
    flow: [
      F.route({ points: W_API_PROV, delay: BEAT.lead, name: 'watch', lights: ['prov'] }),
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
    narration: 'The other half is the node plugin, a DaemonSet, so a copy runs on every eligible Node. Its node-driver-registrar sidecar leaves a socket where Kubelet looks for plugins, and answers Kubelet with the driver name and socket path. Kubelet then sends mount requests for this driver to this plugin.',
    chipsCued: chips('objects only', 'idle', 'registered', 'registrar sidecar'),
    wires: { reg: 'plugin socket' },
    lit: ['reg'],
    flow: [
      F.route({ points: W_REG_KUBE, delay: BEAT.lead, name: 'reg' }),
      F.tag({ text: 'name + socket', points: W_REG_KUBE, delay: BEAT.lead }),
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
    // Two chained hops: the call rides the caller lane from the lit Kubelet (M-18), the mount the next.
    flow: [
      F.route({ points: W_KUBE_ND, delay: BEAT.lead, name: 'ask' }),
      F.tag({ text: 'NodePublish', points: W_KUBE_ND, delay: BEAT.lead }),
      F.light({ targets: ['nd'], at: 'ask' }),
      F.route({ points: W_ND_FS, after: 'ask', name: 'mount' }),
      F.tag({ text: 'mount', points: W_ND_FS, after: 'ask' }),
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
