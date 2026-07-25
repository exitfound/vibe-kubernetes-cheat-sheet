import { svg, g, text, rect, path } from '../lib/svg.js';
import { arrowDefs, box, cylinder, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt, makeRidingLabel } from '../lib/storage-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#storage-csi-architecture


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
const FS_Y = B_CY - FS_H / 2;                                // 456 -> 456..572, inside the node band
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

const W_BUS_TAIL   = [[DRV_CX, BUS_Y], [S_CX[3], BUS_Y]];
const W_STUB_ATT   = [[S_CX[1], S_BOTTOM], [S_CX[1], BUS_Y]];
const W_STUB_RES   = [[S_CX[2], S_BOTTOM], [S_CX[2], BUS_Y]];
const W_STUB_SNAP  = [[S_CX[3], S_BOTTOM], [S_CX[3], BUS_Y]];

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

// A relationship line, not a route: same dim dashed storage styling as pathArrow but with no
// marker-end, because nothing ever travels along it.
function wireNoHead(points) {
  const d = points.map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' ');
  return path({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', d, fill: 'none' });
}

function frame(x, y, w, h, label) {
  const grp = g({});
  const r = rect({ x, y, width: w, height: h, rx: 12, fill: 'none' });
  r.style.stroke = 'var(--diag-node-stroke)';
  r.style.strokeDasharray = '3 6';
  grp.appendChild(r);
  grp.appendChild(text({ class: 'scheme-label dim', x: x + 16, y: y + 22, 'text-anchor': 'start' }, [label]));
  return grp;
}

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'CSI driver architecture: Kubernetes core knows nothing about any storage vendor, so a CSI driver ships in two halves, a controller plugin that runs as a Deployment with four sidecars that each watch one kind of Kubernetes object and turn it into one gRPC call on a shared bus into a single vendor driver, and a node plugin that runs as a DaemonSet on every node, registers itself with the local kubelet, and is the only component that ever touches the node filesystem',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const ctrlFrame = frame(FRAME_X, CF_Y, CF_W, CF_H, 'CSI CONTROLLER PLUGIN  ·  Deployment, runs off-node');
    const nodeFrame = frame(FRAME_X, NF_Y, NF_W, NF_H, 'CSI NODE PLUGIN  ·  DaemonSet on every node');

    const api  = box({ x: API_X, y: MID_Y, w: SIDE_W, h: MID_H, label: 'Kube-apiserver', sublabel: 'core, no vendor code', role: 'storage' });
    const prov = box({ x: S_X[0], y: S_Y, w: S_W[0], h: S_H, label: 'External-provisioner', sublabel: 'watches PVC', role: 'storage' });
    const att  = box({ x: S_X[1], y: S_Y, w: S_W[1], h: S_H, label: 'External-attacher', sublabel: 'watches VolumeAttachment', role: 'storage' });
    const res  = box({ x: S_X[2], y: S_Y, w: S_W[2], h: S_H, label: 'External-resizer', sublabel: 'watches PVC resize', role: 'storage' });
    const snap = box({ x: S_X[3], y: S_Y, w: S_W[3], h: S_H, label: 'External-snapshotter', sublabel: 'watches VolumeSnapshot', role: 'storage' });
    const drv  = box({ x: DRV_X, y: DRV_Y, w: DRV_W, h: DRV_H, label: 'CSI controller driver', sublabel: 'one vendor gRPC server', role: 'storage' });
    const cloud = box({ x: CLOUD_X, y: MID_Y, w: SIDE_W, h: MID_H, label: 'Cloud storage API', sublabel: 'makes + attaches disks', role: 'storage' });

    const kube = box({ x: KUBE_X, y: B_Y, w: SIDE_W, h: B_H, label: 'Kubelet', sublabel: 'asks node plugin to mount', role: 'storage' });
    const reg  = box({ x: REG_X, y: B_Y, w: REG_W, h: B_H, label: 'Node-driver-registrar', sublabel: 'sidecar, registers driver', role: 'storage' });
    const nd   = box({ x: ND_X, y: B_Y, w: ND_W, h: B_H, label: 'CSI node driver', sublabel: 'the only fs toucher', role: 'storage' });
    const fs   = cylinder({ x: FS_X, y: FS_Y, w: FS_W, h: FS_H, label: 'NodeFS', role: 'storage' });
    // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse
    // is not part of the visible front face. Re-centre on the face, as storage-volume-model does.
    const fsLabelEl = fs.querySelector('.scheme-cylinder-label');
    if (fsLabelEl) fsLabelEl.setAttribute('y', FS_H / 2 + 10);

    const routes = [W_API_PROV, W_PROV_DRV, W_DRV_CLOUD, W_REG_KUBE, W_ND_FS]
      .map(points => pathArrow({ points, dashed: true, dim: true, role: 'storage' }));
    const relations = [W_BUS_TAIL, W_STUB_ATT, W_STUB_RES, W_STUB_SNAP].map(wireNoHead);

    const watchLbl = text({ class: 'scheme-label code dim', x: (API_R + S_CX[0] - LANE) / 2, y: MID_CY + 20, 'text-anchor': 'middle' }, [' ']);
    const regLbl   = text({ class: 'scheme-label code dim', x: (KUBE_R + REG_X) / 2, y: B_CY + 22, 'text-anchor': 'middle' }, [' ']);
    const fsLbl    = text({ class: 'scheme-label code dim', x: (ND_R + FS_X) / 2, y: B_CY + 22, 'text-anchor': 'middle' }, [' ']);

    const coreChip = valChip({ x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'K8s core',    value: 'vendor-agnostic', role: 'storage' });
    const ctrlChip = valChip({ x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'controller',  value: 'idle',            role: 'storage' });
    const nodeChip = valChip({ x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'node plugin', value: 'idle',            role: 'storage' });
    const brdgChip = valChip({ x: CHIP_X[3], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'bridge',      value: 'sidecars',        role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    [ctrlFrame, nodeFrame].forEach(el => root.appendChild(el));
    [api, prov, att, res, snap, drv, cloud, kube, reg, nd, fs].forEach(el => root.appendChild(el));
    relations.forEach(el => root.appendChild(el));
    routes.forEach(el => root.appendChild(el));
    [watchLbl, regLbl, fsLbl].forEach(el => root.appendChild(el));
    [coreChip, ctrlChip, nodeChip, brdgChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, api, prov, att, res, snap, drv, cloud, kube, reg, nd, fs,
      coreChip, ctrlChip, nodeChip, brdgChip,
      wires: { watch: watchLbl, reg: regLbl, fs: fsLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}
function setChips(s, { core, ctrl, node, bridge }) {
  setChip(s.refs.coreChip, core);
  setChip(s.refs.ctrlChip, ctrl);
  setChip(s.refs.nodeChip, node);
  setChip(s.refs.brdgChip, bridge);
}

function clearHL(s) {
  clearHighlights(s, ['api', 'prov', 'att', 'res', 'snap', 'drv', 'cloud', 'kube', 'reg', 'nd', 'fs',
    'coreChip', 'ctrlChip', 'nodeChip', 'brdgChip'], []);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A CSI driver is how a storage vendor plugs into Kubernetes without a line of vendor code living in Kubernetes itself. Every driver ships in two halves: a controller that runs once, off to the side, and a node component that runs on every machine. Neither half is part of Kubernetes core.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { core: 'vendor-agnostic', ctrl: 'idle', node: 'idle', bridge: 'sidecars' });
    },
  },
  {
    id: 'core',
    duration: 2100,
    // Packet-less and Pod-less, and still NO blink: the pulse is reserved for Pods, and this card has
    // none, so an infrastructure box states itself with a steady .highlight outline and nothing else.
    narration: 'Kubernetes core deals only in objects: a PVC, a VolumeAttachment, a VolumeSnapshot. It has no idea how any particular disk is made or attached. That deliberate ignorance is what lets one Kubernetes talk to dozens of storage backends it was never taught about.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { core: 'objects only', ctrl: 'idle', node: 'idle', bridge: 'sidecars' });
      s.refs.api.classList.add('highlight');
    },
  },
  {
    id: 'controller',
    duration: 2400,
    // Structural step: the four sidecars light and STAY lit. No blink here either, same reason as
    // the core step: this is a set of four boxes to be read side by side, not a beat to be noticed.
    narration: 'The controller plugin is a Deployment, and inside it ride the sidecars. Each watches one kind of object and does one job: provisioner for claims, attacher for attachments, resizer for resizes, snapshotter for snapshots. All four call one driver.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { core: 'objects only', ctrl: 'four sidecars', node: 'idle', bridge: 'one call each' });
      s.refs.prov.classList.add('highlight');
      s.refs.att.classList.add('highlight');
      s.refs.res.classList.add('highlight');
      s.refs.snap.classList.add('highlight');
    },
  },
  {
    id: 'translate',
    duration: 3600,
    narration: 'Follow one sidecar. external-provisioner sees a Pending PVC in the apiserver and turns it into a single gRPC call, CreateVolume, into the vendor driver. The driver is the only part that speaks to the cloud API and asks it to carve out a real disk. Object in, gRPC out.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { core: 'PVC Pending', ctrl: 'CreateVolume', node: 'idle', bridge: 'object -> gRPC' });
      s.refs.api.classList.add('highlight');
      s.refs.prov.classList.add('highlight');
      setWire(s, 'watch', 'PVC Pending');
      if (ctx.reduced) { s.refs.drv.classList.add('highlight'); s.refs.cloud.classList.add('highlight'); return; }
      // Three chained hops, each timed off the previous arrival rather than a hard-coded delay:
      // object out of the apiserver, one gRPC call into the driver, one vendor call out to the cloud.
      const watch = routePacket(s, ctx, W_API_PROV, { role: 'storage' });
      const call = routePacket(s, ctx, W_PROV_DRV, { delay: watch.arrivalMs + BEAT.afterHop, role: 'storage' });
      ridingLabel(s, ctx, 'CreateVolume', W_PROV_DRV, { delay: watch.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.drv, ctx, call.arrivalMs);
      const out = routePacket(s, ctx, W_DRV_CLOUD, { delay: call.arrivalMs + BEAT.afterHop, role: 'storage' });
      ridingLabel(s, ctx, 'make a disk', W_DRV_CLOUD, { delay: call.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.cloud, ctx, out.arrivalMs);
    },
  },
  {
    id: 'node',
    duration: 2800,
    narration: 'The other half is the node plugin, a DaemonSet, so a copy runs on every node. It cannot mount anything until kubelet knows it exists, so the node-driver-registrar sidecar registers the driver with the local kubelet. From then on kubelet routes mount requests for this driver to this node plugin.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { core: 'objects only', ctrl: 'idle', node: 'registered', bridge: 'registrar sidecar' });
      s.refs.reg.classList.add('highlight');
      setWire(s, 'reg', 'plugin socket');
      if (ctx.reduced) { s.refs.kube.classList.add('highlight'); return; }
      const r = routePacket(s, ctx, W_REG_KUBE, { role: 'storage' });
      ridingLabel(s, ctx, 'driver ready', W_REG_KUBE);
      lightBoxAt(s.refs.kube, ctx, r.arrivalMs);
    },
  },
  {
    id: 'fstoucher',
    duration: 2800,
    narration: 'One rule holds the whole design together: only the node plugin ever touches the node filesystem. The controller talks to the cloud and never sees a mount, and kubelet never mounts vendor storage itself. When bytes finally land on disk, it is the CSI node driver that put them there.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { core: 'objects only', ctrl: 'never mounts', node: 'mounts the disk', bridge: 'gRPC NodePublish' });
      s.refs.nd.classList.add('highlight');
      setWire(s, 'fs', 'mount');
      if (ctx.reduced) { s.refs.fs.classList.add('highlight'); return; }
      const m = routePacket(s, ctx, W_ND_FS, { role: 'storage' });
      ridingLabel(s, ctx, 'NodePublish', W_ND_FS);
      lightBoxAt(s.refs.fs, ctx, m.arrivalMs);
    },
  },
  {
    id: 'bridge',
    duration: 2600,
    narration: 'So the sidecars are the bridge. Kubernetes core writes plain objects and knows nothing about the vendor. The sidecars translate each object into a gRPC call, the driver runs it, and the node plugin does the one privileged thing of touching the disk. Swap the driver, keep the objects.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { core: 'objects only', ctrl: 'translates', node: 'mounts the disk', bridge: 'the sidecars' });
      s.refs.api.classList.add('highlight');
      s.refs.prov.classList.add('highlight');
      s.refs.att.classList.add('highlight');
      s.refs.res.classList.add('highlight');
      s.refs.snap.classList.add('highlight');
      s.refs.drv.classList.add('highlight');
      s.refs.nd.classList.add('highlight');
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
