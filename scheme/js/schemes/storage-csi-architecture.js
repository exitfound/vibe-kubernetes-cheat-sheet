import { svg, g, text, line, rect } from '../lib/svg.js';
import { arrowDefs, box, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, routePacket, routeDur, makeInit, clearHighlights, clearWires, setWire, flashChips, BEAT,
} from '../lib/storage-kit.js';

// CSI Architecture (viewBox 1200x640). Storage grammar, but the story here is STRUCTURAL rather than
// a single descent: two halves of one driver. The upper frame is the CONTROLLER PLUGIN (a Deployment
// that runs off-node and carries the four sidecars, each watching ONE kind of Kubernetes object and
// translating it into ONE gRPC call into the vendor driver, which in turn drives the cloud API). The
// lower frame is the NODE PLUGIN (a DaemonSet on every node, registered with kubelet by
// node-driver-registrar, and the only component that ever touches the node filesystem). On the left
// sits kube-apiserver: Kubernetes core, which knows nothing about any specific vendor. The sidecars
// are the bridge. The narration overlay owns x<=380 & y<=300, so every block in that band starts at
// x>=392, and the two left-hand infra boxes (apiserver, kubelet) sit with their tops at y>=330.
const API_X = 60, API_Y = 336, API_W = 250, API_H = 78;
const API_RIGHT = API_X + API_W, API_CY = API_Y + API_H / 2;   // 310 / 375

// The controller frame and its four sidecars across the top.
const CF_X = 384, CF_Y = 48, CF_W = 792, CF_H = 250;
const S_Y = 82, S_H = 76;
const S1_X = 394, S1_W = 190;   // external-provisioner
const S2_X = 596, S2_W = 182;   // external-attacher
const S3_X = 790, S3_W = 168;   // external-resizer
const S4_X = 970, S4_W = 196;   // external-snapshotter
const S1_CX = S1_X + S1_W / 2;  // 489
const S_BOTTOM = S_Y + S_H;     // 158

const DRV_X = 560, DRV_Y = 212, DRV_W = 268, DRV_H = 70;
const DRV_CX = DRV_X + DRV_W / 2, DRV_TOP = DRV_Y, DRV_RIGHT = DRV_X + DRV_W; // 694 / 212 / 828
const DRV_CY = DRV_Y + DRV_H / 2;

const CLOUD_X = 984, CLOUD_Y = 332, CLOUD_W = 196, CLOUD_H = 72;
const CLOUD_LEFT = CLOUD_X, CLOUD_CY = CLOUD_Y + CLOUD_H / 2;  // 984 / 368

// The node frame and its two boxes across the bottom.
const NF_X = 384, NF_Y = 438, NF_W = 604, NF_H = 168;
const REG_X = 414, REG_Y = 476, REG_W = 214, REG_H = 72;
const REG_LEFT = REG_X, REG_CY = REG_Y + REG_H / 2;           // 414 / 512
const ND_X = 658, ND_Y = 476, ND_W = 214, ND_H = 72;
const ND_CX = ND_X + ND_W / 2, ND_RIGHT = ND_X + ND_W, ND_CY = ND_Y + ND_H / 2; // 765 / 872 / 512

const KUBE_X = 60, KUBE_Y = 476, KUBE_W = 250, KUBE_H = 72;
const KUBE_RIGHT = KUBE_X + KUBE_W, KUBE_CY = KUBE_Y + KUBE_H / 2; // 310 / 512

const FS_X = 1018, FS_Y = 452, FS_W = 156, FS_H = 116;
const FS_LEFT = FS_X, FS_CY = FS_Y + FS_H / 2;                // 1018 / 510
const CHIPS_Y = 616;

// Each static wire and its ball share one array, so they cannot drift. Every endpoint is a block edge.
const W_API_PROV   = [[API_RIGHT, API_CY], [S1_CX, API_CY], [S1_CX, S_BOTTOM]];
const W_PROV_DRV   = [[S1_CX, S_BOTTOM], [S1_CX, DRV_TOP - 22], [DRV_CX - 40, DRV_TOP - 22], [DRV_CX - 40, DRV_TOP]];
const W_DRV_CLOUD  = [[DRV_RIGHT, DRV_CY], [906, DRV_CY], [906, CLOUD_CY], [CLOUD_LEFT, CLOUD_CY]];
const W_REG_KUBE   = [[REG_LEFT, REG_CY], [KUBE_RIGHT, KUBE_CY]];
const W_ND_FS      = [[ND_RIGHT, ND_CY], [FS_LEFT, FS_CY]];

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'ease-in-out' } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: -14, 'text-anchor': 'middle', 'data-cat': 'storage' }, [txt]);
  lbl.style.opacity = '0';
  lbl.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px)`;
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 160, fill: 'forwards', easing: 'ease-in' }));
}

// A dim, arrowhead-free frame that groups the two halves. It carries no traffic, so no marker.
function frame(x, y, w, h, label) {
  const grp = g({});
  const r = rect({ x, y, width: w, height: h, rx: 12, fill: 'none' });
  r.style.stroke = 'rgba(255, 255, 255, 0.12)';
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
      'aria-label': 'CSI driver architecture: Kubernetes core knows nothing about any storage vendor, so a CSI driver ships in two halves, a controller plugin that runs as a Deployment with sidecars that each watch one kind of Kubernetes object and turn it into one gRPC call, and a node plugin that runs as a DaemonSet on every node, registers with kubelet, and is the only component that touches the node filesystem',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const ctrlFrame = frame(CF_X, CF_Y, CF_W, CF_H, 'CSI CONTROLLER PLUGIN  ·  Deployment, runs off-node');
    const nodeFrame = frame(NF_X, NF_Y, NF_W, NF_H, 'CSI NODE PLUGIN  ·  DaemonSet on every node');

    const api  = box({ x: API_X, y: API_Y, w: API_W, h: API_H, label: 'kube-apiserver', sublabel: 'core, no vendor code', cat: 'storage' });
    const prov = box({ x: S1_X, y: S_Y, w: S1_W, h: S_H, label: 'external-provisioner', sublabel: 'watches PVC', cat: 'storage' });
    const att  = box({ x: S2_X, y: S_Y, w: S2_W, h: S_H, label: 'external-attacher', sublabel: 'watches VolumeAttachment', cat: 'storage' });
    const res  = box({ x: S3_X, y: S_Y, w: S3_W, h: S_H, label: 'external-resizer', sublabel: 'watches PVC resize', cat: 'storage' });
    const snap = box({ x: S4_X, y: S_Y, w: S4_W, h: S_H, label: 'external-snapshotter', sublabel: 'watches VolumeSnapshot', cat: 'storage' });
    const drv  = box({ x: DRV_X, y: DRV_Y, w: DRV_W, h: DRV_H, label: 'CSI controller driver', sublabel: 'one vendor gRPC server', cat: 'storage' });
    const cloud = box({ x: CLOUD_X, y: CLOUD_Y, w: CLOUD_W, h: CLOUD_H, label: 'cloud storage API', sublabel: 'makes + attaches disks', cat: 'storage' });

    const kube = box({ x: KUBE_X, y: KUBE_Y, w: KUBE_W, h: KUBE_H, label: 'kubelet', sublabel: 'asks node plugin to mount', cat: 'storage' });
    const reg  = box({ x: REG_X, y: REG_Y, w: REG_W, h: REG_H, label: 'node-driver-registrar', sublabel: 'sidecar, registers driver', cat: 'storage' });
    const nd   = box({ x: ND_X, y: ND_Y, w: ND_W, h: ND_H, label: 'CSI node driver', sublabel: 'the only fs toucher', cat: 'storage' });
    const fs   = cylinder({ x: FS_X, y: FS_Y, w: FS_W, h: FS_H, label: 'node fs', cat: 'storage' });

    const wApiProv  = pathArrow({ points: W_API_PROV, dashed: true, dim: true, color: 'storage' });
    const wProvDrv  = pathArrow({ points: W_PROV_DRV, dashed: true, dim: true, color: 'storage' });
    const wDrvCloud = pathArrow({ points: W_DRV_CLOUD, dashed: true, dim: true, color: 'storage' });
    const wRegKube  = pathArrow({ points: W_REG_KUBE, dashed: true, dim: true, color: 'storage' });
    const wNdFs     = pathArrow({ points: W_ND_FS, dashed: true, dim: true, color: 'storage' });

    const apiLbl  = text({ class: 'scheme-label code dim', x: S1_CX + 8, y: 300, 'text-anchor': 'start' }, [' ']);
    const grpcLbl = text({ class: 'scheme-label code dim', x: 906 + 10, y: 316, 'text-anchor': 'start' }, [' ']);
    const regLbl  = text({ class: 'scheme-label code dim', x: (REG_LEFT + KUBE_RIGHT) / 2, y: REG_CY - 12, 'text-anchor': 'middle' }, [' ']);
    const fsLbl   = text({ class: 'scheme-label code dim', x: (ND_RIGHT + FS_LEFT) / 2, y: ND_CY - 12, 'text-anchor': 'middle' }, [' ']);

    const coreChip = valChip({ x: 60,  y: CHIPS_Y, w: 250, h: 34, name: 'K8s core', value: 'vendor-agnostic', cat: 'storage' });
    const ctrlChip = valChip({ x: 330, y: CHIPS_Y, w: 300, h: 34, name: 'controller', value: 'idle',           cat: 'storage' });
    const nodeChip = valChip({ x: 650, y: CHIPS_Y, w: 260, h: 34, name: 'node plugin', value: 'idle',          cat: 'storage' });
    const brdgChip = valChip({ x: 930, y: CHIPS_Y, w: 250, h: 34, name: 'bridge', value: 'sidecars',           cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: frames first (behind), then blocks, then wires + labels above them, then chips, then
    // the packet layer on top so every ball rides above everything.
    [ctrlFrame, nodeFrame].forEach(el => root.appendChild(el));
    [api, prov, att, res, snap, drv, cloud, kube, reg, nd, fs].forEach(el => root.appendChild(el));
    [wApiProv, wProvDrv, wDrvCloud, wRegKube, wNdFs].forEach(el => root.appendChild(el));
    [apiLbl, grpcLbl, regLbl, fsLbl].forEach(el => root.appendChild(el));
    [coreChip, ctrlChip, nodeChip, brdgChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, api, prov, att, res, snap, drv, cloud, kube, reg, nd, fs,
      coreChip, ctrlChip, nodeChip, brdgChip,
      wires: { api: apiLbl, grpc: grpcLbl, reg: regLbl, fs: fsLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { core, ctrl, node, bridge }) {
  setVal(s.refs.coreChip, core);
  setVal(s.refs.ctrlChip, ctrl);
  setVal(s.refs.nodeChip, node);
  setVal(s.refs.brdgChip, bridge);
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
    // Packet-less and Pod-less, so a box flash keeps it from reading frozen. Value chips never blink.
    narration: 'Kubernetes core deals only in objects: a PVC, a VolumeAttachment, a VolumeSnapshot. It has no idea how any particular disk is made or attached. That deliberate ignorance is what lets one Kubernetes talk to dozens of storage backends it was never taught about.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { core: 'objects only', ctrl: 'idle', node: 'idle', bridge: 'sidecars' });
      s.refs.api.classList.add('highlight');
      flashChips(s, ctx, ['api'], 0);
    },
  },
  {
    id: 'controller',
    duration: 2400,
    // Structural step: highlight the four sidecars. No single packet, no Pod, so a box flash is fine.
    narration: 'The controller plugin is a Deployment, and inside it ride the sidecars. Each sidecar watches exactly one kind of object and does exactly one job: external-provisioner for claims, external-attacher for attachments, external-resizer for grow requests, external-snapshotter for snapshots.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { core: 'objects only', ctrl: 'Deployment + sidecars', node: 'idle', bridge: 'sidecars' });
      s.refs.prov.classList.add('highlight');
      s.refs.att.classList.add('highlight');
      s.refs.res.classList.add('highlight');
      s.refs.snap.classList.add('highlight');
      flashChips(s, ctx, ['prov', 'att', 'res', 'snap'], 0);
    },
  },
  {
    id: 'translate',
    duration: 3400,
    narration: 'Follow one sidecar. external-provisioner sees a Pending PVC in the apiserver and turns it into a single gRPC call, CreateVolume, into the vendor driver. The driver is the only part that speaks to the cloud API and asks it to carve out a real disk. Object in, gRPC out.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { core: 'PVC created', ctrl: 'CreateVolume', node: 'idle', bridge: 'object -> gRPC' });
      s.refs.api.classList.add('highlight');
      s.refs.prov.classList.add('highlight');
      setWire(s, 'grpc', 'CreateVolume');
      if (ctx.reduced) { s.refs.drv.classList.add('highlight'); s.refs.cloud.classList.add('highlight'); return; }
      const watch = routePacket(s, ctx, W_API_PROV, { cat: 'storage' });
      ridingLabel(s, ctx, 'PVC Pending', W_API_PROV);
      const call = routePacket(s, ctx, W_PROV_DRV, { delay: watch.arrivalMs + BEAT.afterHop, cat: 'storage' });
      lightBoxAt(s.refs.drv, ctx, call.arrivalMs);
      const cloud = routePacket(s, ctx, W_DRV_CLOUD, { delay: call.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'make a disk', W_DRV_CLOUD, { delay: call.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.cloud, ctx, cloud.arrivalMs);
    },
  },
  {
    id: 'node',
    duration: 2800,
    narration: 'The other half is the node plugin, a DaemonSet, so a copy runs on every node. It cannot mount anything until kubelet knows it exists, so the node-driver-registrar sidecar registers the driver with the local kubelet. From then on kubelet routes mount requests for this driver to this pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { core: 'objects only', ctrl: 'idle', node: 'DaemonSet', bridge: 'registered' });
      s.refs.reg.classList.add('highlight');
      setWire(s, 'reg', 'register');
      if (ctx.reduced) { s.refs.kube.classList.add('highlight'); return; }
      const r = routePacket(s, ctx, W_REG_KUBE, { cat: 'storage' });
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
      setChips(s, { core: 'objects only', ctrl: 'idle', node: 'mounting', bridge: 'touches fs' });
      s.refs.nd.classList.add('highlight');
      setWire(s, 'fs', 'mount');
      if (ctx.reduced) { s.refs.fs.classList.add('highlight'); return; }
      const m = routePacket(s, ctx, W_ND_FS, { cat: 'storage' });
      ridingLabel(s, ctx, 'NodePublish', W_ND_FS);
      lightBoxAt(s.refs.fs, ctx, m.arrivalMs);
    },
  },
  {
    id: 'bridge',
    duration: 2600,
    // Structural summary: light both halves and the bridge. No packet, no Pod, so a box flash is fine.
    narration: 'So the sidecars are the bridge. Kubernetes core writes plain objects and knows nothing about the vendor. The sidecars translate each object into a gRPC call, the driver runs it, and the node plugin does the one privileged thing of touching the disk. Swap the driver, keep the objects.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { core: 'objects only', ctrl: 'translates', node: 'touches fs', bridge: 'the sidecars' });
      s.refs.api.classList.add('highlight');
      s.refs.prov.classList.add('highlight');
      s.refs.att.classList.add('highlight');
      s.refs.res.classList.add('highlight');
      s.refs.snap.classList.add('highlight');
      s.refs.drv.classList.add('highlight');
      s.refs.nd.classList.add('highlight');
      flashChips(s, ctx, ['prov', 'att', 'res', 'snap', 'drv'], 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
