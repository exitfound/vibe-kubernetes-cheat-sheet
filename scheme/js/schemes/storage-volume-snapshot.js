import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// Volume Snapshots. The snapshot API mirrors the volume API exactly: VolumeSnapshot is the namespaced
// request (like a PVC), VolumeSnapshotClass names the driver (like a StorageClass), and
// VolumeSnapshotContent is the cluster-scoped object the request binds to (like a PV). The left column
// is that identity spine: VolumeSnapshot on top, its VolumeSnapshotContent below, joined by a Bound
// link. The external-snapshotter sidecar on the right drives CreateSnapshot down into the storage
// backend on the shelf, where the snapshot data physically lands beside the source volume, which is
// exactly why a snapshot is NOT a backup. A fresh PVC with dataSource then restores it. Overlay owns
// x<=380 & y<=300, so every block starts at x>=430 except the shelf disks whose top is at y=436.
const VS_X = 430, VS_Y = 44, VS_W = 250, VS_H = 64;
const VS_CX = VS_X + VS_W / 2, VS_RIGHT = VS_X + VS_W, VS_BOTTOM = VS_Y + VS_H; // 555 / 680 / 108

const VSCLASS_X = 760, VSCLASS_Y = 44, VSCLASS_W = 330, VSCLASS_H = 64;

const SNAP_X = 760, SNAP_Y = 214, SNAP_W = 330, SNAP_H = 82;
const SNAP_CX = SNAP_X + SNAP_W / 2, SNAP_BOTTOM = SNAP_Y + SNAP_H; // 925 / 296

const VSC_X = 430, VSC_Y = 244, VSC_W = 250, VSC_H = 70;
const VSC_CX = VSC_X + VSC_W / 2, VSC_TOP = VSC_Y;                  // 555 / 244

const SHELF_Y = 436;
const SRC_CX = 245, SRC_W = 190, SRC_H = 104;
const BACK_X = 790, BACK_W = 260, BACK_H = 104, BACK_CX = BACK_X + BACK_W / 2, BACK_TOP = SHELF_Y; // 920
const NPVC_X = 430, NPVC_W = 250, NPVC_H = 90, NPVC_RIGHT = NPVC_X + NPVC_W;  // 680
const CHIPS_Y = 588;

const W_VS_SNAP   = [[VS_RIGHT, 76], [725, 76], [725, 255], [SNAP_X, 255]];
const W_SNAP_BACK = [[SNAP_CX, SNAP_BOTTOM], [SNAP_CX, BACK_TOP]];
const W_BACK_NPVC = [[BACK_X, SHELF_Y + 49], [NPVC_RIGHT, SHELF_Y + 49]];

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

function revealAt(el, ctx, delay = 0) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = '1'; return; }
  el.style.opacity = '0';
  ctx.register(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, delay, fill: 'forwards', easing: 'ease-out' }));
}

function flashBox(el, ctx, delay = 0) {
  if (!el || ctx.reduced) return;
  ctx.register(el.animate(
    [{ filter: 'brightness(1)' }, { filter: 'brightness(1.55)' }, { filter: 'brightness(1)' }],
    { duration: 600, delay, easing: 'ease-out' }));
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

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Volume Snapshots: a VolumeSnapshot is the namespaced request like a PVC, a VolumeSnapshotClass names the driver, the external-snapshotter sidecar calls CreateSnapshot, a cluster-scoped VolumeSnapshotContent binds to it like a PV, readyToUse flips true, and a new PVC with a dataSource restores it into a fresh volume, but the snapshot lives in the same storage system as the source so it is not a backup',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const vs      = box({ x: VS_X, y: VS_Y, w: VS_W, h: VS_H, label: 'VolumeSnapshot', sublabel: 'snap-1, Pending', cat: 'storage' });
    const vsclass = box({ x: VSCLASS_X, y: VSCLASS_Y, w: VSCLASS_W, h: VSCLASS_H, label: 'VolumeSnapshotClass', sublabel: 'driver: ebs.csi.aws.com', cat: 'storage' });
    const snap    = box({ x: SNAP_X, y: SNAP_Y, w: SNAP_W, h: SNAP_H, label: 'external-snapshotter', sublabel: 'CSI sidecar', cat: 'storage' });
    const vsc     = box({ x: VSC_X, y: VSC_Y, w: VSC_W, h: VSC_H, label: 'VolumeSnapshotContent', sublabel: 'cluster-scoped', cat: 'storage' });
    vsc.style.opacity = '0';

    const src  = cylinder({ x: SRC_CX - SRC_W / 2, y: SHELF_Y, w: SRC_W, h: SRC_H, label: 'source volume', cat: 'storage' });
    const back = cylinder({ x: BACK_X, y: SHELF_Y, w: BACK_W, h: BACK_H, label: 'storage backend', cat: 'storage' });
    const npvc = box({ x: NPVC_X, y: SHELF_Y, w: NPVC_W, h: NPVC_H, label: 'PVC restore-1', sublabel: 'dataSource: snap-1', cat: 'storage' });
    npvc.style.opacity = '0';

    // The snapshot targets the source volume: a relationship, not traffic, so no arrowhead. Routed
    // left of the identity column so it never crosses the VolumeSnapshotContent below the request.
    const srcRef = pathArrow({ points: [[425, VS_BOTTOM], [425, 360], [SRC_CX, 360], [SRC_CX, SHELF_Y]], dashed: true, dim: true, color: 'storage' });
    srcRef.removeAttribute('marker-end');
    // VolumeSnapshot names its class: reference line, no arrowhead.
    const classRef = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: VS_RIGHT, y1: 60, x2: VSCLASS_X, y2: 60, 'stroke-dasharray': '5 5', fill: 'none' });
    // Identity: VolumeSnapshot bound to its VolumeSnapshotContent. Revealed once the content exists.
    const boundLink = line({ class: 'scheme-arrow scheme-arrow-storage', x1: VS_CX, y1: VS_BOTTOM, x2: VSC_CX, y2: VSC_TOP, fill: 'none' });
    boundLink.style.opacity = '0';
    // dataSource of the restore PVC points at the VolumeSnapshot. Routed on the right of the column.
    const dsRef = pathArrow({ points: [[VS_CX, SHELF_Y], [720, SHELF_Y], [720, 130], [VS_RIGHT, 92]], dashed: true, dim: true, color: 'storage' });
    dsRef.removeAttribute('marker-end');
    dsRef.style.opacity = '0';

    const wVsSnap  = pathArrow({ points: W_VS_SNAP, dashed: true, dim: true, color: 'storage' });
    const wSnapBack = pathArrow({ points: W_SNAP_BACK, dashed: true, dim: true, color: 'storage' });
    const wBackNpvc = pathArrow({ points: W_BACK_NPVC, dashed: true, dim: true, color: 'storage' });
    wBackNpvc.style.opacity = '0';

    const backLbl = text({ class: 'scheme-label code dim', x: BACK_CX, y: SHELF_Y - 12, 'text-anchor': 'middle' }, [' ']);

    const vsChip    = valChip({ x: 110, y: CHIPS_Y, w: 240, h: 34, name: 'VolumeSnapshot', value: 'Pending', cat: 'storage' });
    const contChip  = valChip({ x: 360, y: CHIPS_Y, w: 260, h: 34, name: 'Content', value: 'none', cat: 'storage' });
    const readyChip = valChip({ x: 630, y: CHIPS_Y, w: 210, h: 34, name: 'readyToUse', value: 'false', cat: 'storage' });
    const storeChip = valChip({ x: 850, y: CHIPS_Y, w: 240, h: 34, name: 'stored', value: 'same system', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: blocks, then wires and their labels above them, then the chip strip, then the packet
    // layer on top so every ball rides above everything.
    [vs, vsclass, snap, vsc, src, back, npvc].forEach(el => root.appendChild(el));
    [srcRef, classRef, boundLink, dsRef, wVsSnap, wSnapBack, wBackNpvc, backLbl].forEach(el => root.appendChild(el));
    [vsChip, contChip, readyChip, storeChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, vs, vsclass, snap, vsc, src, back, npvc,
      boundLink, dsRef, wBackNpvc,
      vsChip, contChip, readyChip, storeChip,
      wires: { back: backLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { vs, cont, ready, store }) {
  setVal(s.refs.vsChip, vs);
  setVal(s.refs.contChip, cont);
  setVal(s.refs.readyChip, ready);
  setVal(s.refs.storeChip, store);
}

function clearHL(s) {
  clearHighlights(s, ['vs', 'vsclass', 'snap', 'vsc', 'src', 'back', 'npvc',
    'vsChip', 'contChip', 'readyChip', 'storeChip'], []);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A source volume is in use on the shelf. You create a VolumeSnapshot named snap-1, which points at the claim behind that volume. This object is the namespaced request, the exact counterpart of a PVC, and right now it is Pending with nothing behind it.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vs: 'Pending', cont: 'none', ready: 'false', store: 'same system' });
      setBoxSublabel(s.refs.vs, 'snap-1, Pending');
      s.refs.vsc.style.opacity = '0';
      s.refs.npvc.style.opacity = '0';
      s.refs.boundLink.style.opacity = '0';
      s.refs.dsRef.style.opacity = '0';
      s.refs.wBackNpvc.style.opacity = '0';
    },
  },
  {
    id: 'class',
    duration: 2400,
    narration: 'The snapshot names a VolumeSnapshotClass, and that class names the CSI driver that knows how to take snapshots. It is the same shape as a StorageClass, one level up: the request states intent, the class states which driver carries it out.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vs: 'Pending', cont: 'none', ready: 'false', store: 'same system' });
      s.refs.vsc.style.opacity = '0';
      s.refs.npvc.style.opacity = '0';
      s.refs.boundLink.style.opacity = '0';
      s.refs.dsRef.style.opacity = '0';
      s.refs.wBackNpvc.style.opacity = '0';
      s.refs.vs.classList.add('highlight');
      s.refs.vsclass.classList.add('highlight');
      flashBox(s.refs.vsclass, ctx, 200);
    },
  },
  {
    id: 'create',
    duration: 3200,
    narration: 'The external-snapshotter sidecar watches for snapshot requests it owns, picks up snap-1, and calls CreateSnapshot on the driver against the source volume. The backend freezes a point-in-time copy of the data. This is the only step where anything physical happens.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vs: 'Pending', cont: 'creating', ready: 'false', store: 'same system' });
      s.refs.vsc.style.opacity = '0';
      s.refs.npvc.style.opacity = '0';
      s.refs.boundLink.style.opacity = '0';
      s.refs.dsRef.style.opacity = '0';
      s.refs.wBackNpvc.style.opacity = '0';
      s.refs.snap.classList.add('highlight');
      s.refs.back.classList.add('highlight');
      s.refs.src.classList.add('highlight');
      setWire(s, 'back', 'snapshot data');
      if (ctx.reduced) return;
      const req = routePacket(s, ctx, W_VS_SNAP, { cat: 'storage' });
      ridingLabel(s, ctx, 'snap-1', W_VS_SNAP);
      const call = routePacket(s, ctx, W_SNAP_BACK, { delay: req.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'CreateSnapshot', W_SNAP_BACK, { delay: req.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.back, ctx, call.arrivalMs);
    },
  },
  {
    id: 'content',
    duration: 3000,
    narration: 'The snapshotter writes a VolumeSnapshotContent object carrying the handle the backend gave back, and binds it to snap-1. This cluster-scoped object is the counterpart of a PV: the snapshot in the request, the content behind it, joined one to one.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vs: 'Bound', cont: 'Bound', ready: 'false', store: 'same system' });
      setBoxSublabel(s.refs.vs, 'snap-1, Bound');
      s.refs.npvc.style.opacity = '0';
      s.refs.dsRef.style.opacity = '0';
      s.refs.wBackNpvc.style.opacity = '0';
      s.refs.snap.classList.add('highlight');
      s.refs.back.classList.add('highlight');
      setWire(s, 'back', 'snapshot data');
      s.refs.vsc.style.opacity = '1';
      s.refs.vsc.classList.add('highlight');
      s.refs.boundLink.style.opacity = '1';
      if (ctx.reduced) return;
      s.refs.vsc.style.opacity = '0';
      s.refs.boundLink.style.opacity = '0';
      revealAt(s.refs.vsc, ctx, 200);
      ctx.register(s.refs.boundLink.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 460, delay: 600, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'ready',
    duration: 2600,
    narration: 'Once the backend confirms the copy is complete, readyToUse flips to true and the snapshot can be consumed. Note where the data lives: on the same storage system as the source, right beside it. If that system fails both are lost, so a snapshot is not a backup.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vs: 'Bound', cont: 'Bound', ready: 'true', store: 'not a backup' });
      setBoxSublabel(s.refs.vs, 'snap-1, Bound');
      s.refs.npvc.style.opacity = '0';
      s.refs.dsRef.style.opacity = '0';
      s.refs.wBackNpvc.style.opacity = '0';
      s.refs.vsc.style.opacity = '1';
      s.refs.boundLink.style.opacity = '1';
      s.refs.vsc.classList.add('highlight');
      s.refs.vs.classList.add('highlight');
      s.refs.back.classList.add('highlight');
      setWire(s, 'back', 'snapshot data');
      // readyToUse flips true on the content object, so flash the vsc box, not the readyToUse value
      // chip (value chips never blink).
      flashBox(s.refs.vsc, ctx, 200);
    },
  },
  {
    id: 'restore',
    duration: 3200,
    narration: 'To restore, create a brand new PVC whose dataSource points at snap-1. The provisioner reads the snapshot content and carves a fresh volume seeded from it. The original is untouched, the restore is a separate independent disk, and both still sit in the same backend.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vs: 'Bound', cont: 'Bound', ready: 'true', store: 'not a backup' });
      setBoxSublabel(s.refs.vs, 'snap-1, Bound');
      s.refs.vsc.style.opacity = '1';
      s.refs.boundLink.style.opacity = '1';
      s.refs.vs.classList.add('highlight');
      s.refs.back.classList.add('highlight');
      setWire(s, 'back', 'snapshot data');
      s.refs.npvc.style.opacity = '1';
      s.refs.dsRef.style.opacity = '1';
      s.refs.wBackNpvc.style.opacity = '1';
      s.refs.npvc.classList.add('highlight');
      if (ctx.reduced) return;
      s.refs.npvc.style.opacity = '0';
      revealAt(s.refs.npvc, ctx, 200);
      const seed = routePacket(s, ctx, W_BACK_NPVC, { delay: 500, cat: 'storage' });
      ridingLabel(s, ctx, 'restore from snap-1', W_BACK_NPVC, { delay: 500 });
      lightBoxAt(s.refs.npvc, ctx, seed.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
