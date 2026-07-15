import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// Cloning a PVC. A new PVC whose dataSource points at an EXISTING PVC, not a snapshot. The driver
// copies the volume server-side and there is no snapshot object in between, which is the whole
// contrast with the snapshot card. The source claim and its disk sit on the left identity column, the
// clone claim and its fresh disk on the right, the provisioner in the middle. The dataSource is a
// bare dashed reference across the top with no arrowhead, and the only route that carries a ball
// downward is the server-side copy along the shelf. Constraints worth stating (same namespace, same
// StorageClass, destination at least as large) are checked as text. Overlay owns x<=380 & y<=300.
const SRC_X = 430, SRC_Y = 44, SRC_W = 250, SRC_H = 64;
const SRC_CX = SRC_X + SRC_W / 2, SRC_RIGHT = SRC_X + SRC_W, SRC_BOTTOM = SRC_Y + SRC_H; // 555 / 680 / 108

const DEST_X = 845, DEST_Y = 44, DEST_W = 250, DEST_H = 64;
const DEST_CX = DEST_X + DEST_W / 2, DEST_BOTTOM = DEST_Y + DEST_H; // 970 / 108

const PROV_X = 700, PROV_Y = 214, PROV_W = 230, PROV_H = 80;
const PROV_CX = PROV_X + PROV_W / 2, PROV_BOTTOM = PROV_Y + PROV_H; // 815 / 294

const SHELF_Y = 440;
const SD_W = 170, SD_H = 100, SD_TOP = SHELF_Y;              // source disk
const DD_W = 170, DD_H = 100, DD_TOP = SHELF_Y;             // dest (clone) disk
const SD_RIGHT = SRC_CX + SD_W / 2, DD_LEFT = DEST_CX - DD_W / 2; // 640 / 885
const CHIPS_Y = 588;

const W_DEST_PROV = [[DEST_CX, DEST_BOTTOM], [DEST_CX, 178], [PROV_CX, 178], [PROV_CX, PROV_Y]];
const W_PROV_DD   = [[PROV_CX, PROV_BOTTOM], [PROV_CX, 410], [DEST_CX, 410], [DEST_CX, DD_TOP]];
const W_COPY      = [[SD_RIGHT, SHELF_Y + 50], [DD_LEFT, SHELF_Y + 50]];

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
      'aria-label': 'Cloning a PVC: a new PersistentVolumeClaim whose dataSource points at an existing PVC rather than a snapshot, so the driver copies the volume server-side with no snapshot object in between, subject to the constraints that the two claims share a namespace and StorageClass and the destination is at least as large as the source',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const srcPvc  = box({ x: SRC_X, y: SRC_Y, w: SRC_W, h: SRC_H, label: 'PVC data-src', sublabel: 'Bound, 10Gi gp3', cat: 'storage' });
    const destPvc = box({ x: DEST_X, y: DEST_Y, w: DEST_W, h: DEST_H, label: 'PVC clone-1', sublabel: 'dataSource: data-src', cat: 'storage' });
    destPvc.style.opacity = '0';
    const prov    = box({ x: PROV_X, y: PROV_Y, w: PROV_W, h: PROV_H, label: 'CSI provisioner', sublabel: 'controller sidecar', cat: 'storage' });

    const srcDisk  = cylinder({ x: SRC_CX - SD_W / 2, y: SHELF_Y, w: SD_W, h: SD_H, label: 'source disk', cat: 'storage' });
    const destDisk = cylinder({ x: DEST_CX - DD_W / 2, y: SHELF_Y, w: DD_W, h: DD_H, label: 'clone disk', cat: 'storage' });
    destDisk.style.opacity = '0';

    // Source identity: PVC bound to its disk, always present.
    const srcBound = line({ class: 'scheme-arrow scheme-arrow-storage', x1: SRC_CX, y1: SRC_BOTTOM, x2: SRC_CX, y2: SD_TOP, fill: 'none' });
    // Clone identity: dest PVC bound to its fresh disk, revealed once the clone is bound.
    const destBound = line({ class: 'scheme-arrow scheme-arrow-storage', x1: DEST_CX, y1: DEST_BOTTOM, x2: DEST_CX, y2: DD_TOP, fill: 'none' });
    destBound.style.opacity = '0';
    // dataSource: the clone references the source CLAIM directly. A relationship, so no arrowhead.
    const dsRef = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: DEST_X, y1: 68, x2: SRC_RIGHT, y2: 68, 'stroke-dasharray': '5 5', fill: 'none' });
    dsRef.style.opacity = '0';

    const wDestProv = pathArrow({ points: W_DEST_PROV, dashed: true, dim: true, color: 'storage' });
    const wProvDd   = pathArrow({ points: W_PROV_DD, dashed: true, dim: true, color: 'storage' });
    const wCopy     = pathArrow({ points: W_COPY, dashed: true, dim: true, color: 'storage' });
    wDestProv.style.opacity = '0'; wProvDd.style.opacity = '0'; wCopy.style.opacity = '0';

    const nsLbl   = text({ class: 'scheme-label code dim', x: 400, y: 158, 'text-anchor': 'start' }, [' ']);
    const scLbl   = text({ class: 'scheme-label code dim', x: 400, y: 184, 'text-anchor': 'start' }, [' ']);
    const sizeLbl = text({ class: 'scheme-label code dim', x: 400, y: 210, 'text-anchor': 'start' }, [' ']);
    const copyLbl = text({ class: 'scheme-label code dim', x: (SD_RIGHT + DD_LEFT) / 2, y: SHELF_Y + 28, 'text-anchor': 'middle' }, [' ']);

    const srcChip    = valChip({ x: 120, y: CHIPS_Y, w: 240, h: 34, name: 'source', value: 'data-src Bound', cat: 'storage' });
    const destChip   = valChip({ x: 370, y: CHIPS_Y, w: 220, h: 34, name: 'clone-1', value: 'none', cat: 'storage' });
    const methodChip = valChip({ x: 600, y: CHIPS_Y, w: 250, h: 34, name: 'dataSource', value: 'kind: PVC', cat: 'storage' });
    const copyChip   = valChip({ x: 860, y: CHIPS_Y, w: 230, h: 34, name: 'copy', value: 'none', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: blocks, then wires and their labels above them, then the chip strip, then the packet
    // layer on top so every ball rides above everything.
    [srcPvc, destPvc, prov, srcDisk, destDisk].forEach(el => root.appendChild(el));
    [srcBound, destBound, dsRef, wDestProv, wProvDd, wCopy, nsLbl, scLbl, sizeLbl, copyLbl].forEach(el => root.appendChild(el));
    [srcChip, destChip, methodChip, copyChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, srcPvc, destPvc, prov, srcDisk, destDisk,
      destBound, dsRef, wDestProv, wProvDd, wCopy,
      srcChip, destChip, methodChip, copyChip,
      wires: { ns: nsLbl, sc: scLbl, size: sizeLbl, copy: copyLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { src, dest, method, copy }) {
  setVal(s.refs.srcChip, src);
  setVal(s.refs.destChip, dest);
  setVal(s.refs.methodChip, method);
  setVal(s.refs.copyChip, copy);
}

function clearHL(s) {
  clearHighlights(s, ['srcPvc', 'destPvc', 'prov', 'srcDisk', 'destDisk',
    'srcChip', 'destChip', 'methodChip', 'copyChip'], []);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A claim data-src is Bound to a disk that already holds real data. You want a second, independent copy of that disk right now, without stopping the workload and without setting up a snapshot first. Cloning does exactly this in one step.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: 'data-src Bound', dest: 'none', method: 'kind: PVC', copy: 'none' });
      s.refs.destPvc.style.opacity = '0';
      s.refs.destDisk.style.opacity = '0';
      s.refs.destBound.style.opacity = '0';
      s.refs.dsRef.style.opacity = '0';
      s.refs.wDestProv.style.opacity = '0';
      s.refs.wProvDd.style.opacity = '0';
      s.refs.wCopy.style.opacity = '0';
    },
  },
  {
    id: 'dest',
    duration: 2600,
    narration: 'You create a new PVC named clone-1 whose dataSource is not a snapshot but the existing claim data-src, with kind PersistentVolumeClaim. That single field turns an ordinary claim into a clone request pointing straight at another live volume.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: 'data-src Bound', dest: 'Pending', method: 'kind: PVC', copy: 'none' });
      s.refs.destDisk.style.opacity = '0';
      s.refs.destBound.style.opacity = '0';
      s.refs.wDestProv.style.opacity = '0';
      s.refs.wProvDd.style.opacity = '0';
      s.refs.wCopy.style.opacity = '0';
      s.refs.destPvc.style.opacity = '1';
      s.refs.dsRef.style.opacity = '1';
      s.refs.destPvc.classList.add('highlight');
      s.refs.srcPvc.classList.add('highlight');
      if (ctx.reduced) return;
      s.refs.destPvc.style.opacity = '0';
      s.refs.dsRef.style.opacity = '0';
      revealAt(s.refs.destPvc, ctx, 150);
      ctx.register(s.refs.dsRef.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 450, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'constraints',
    duration: 2800,
    narration: 'A clone is only allowed within limits. The two claims must live in the same namespace and use the same StorageClass, because the copy happens inside one driver, and the destination must be at least as large as the source. Break any of these and the clone is rejected outright.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: 'data-src Bound', dest: 'Pending', method: 'kind: PVC', copy: 'none' });
      s.refs.destDisk.style.opacity = '0';
      s.refs.destBound.style.opacity = '0';
      s.refs.wDestProv.style.opacity = '0';
      s.refs.wProvDd.style.opacity = '0';
      s.refs.wCopy.style.opacity = '0';
      s.refs.destPvc.style.opacity = '1';
      s.refs.dsRef.style.opacity = '1';
      s.refs.destPvc.classList.add('highlight');
      setWire(s, 'ns', 'same namespace: ok');
      setWire(s, 'sc', 'same StorageClass: ok');
      setWire(s, 'size', 'size >= source: ok');
      flashBox(s.refs.destPvc, ctx, 200);
    },
  },
  {
    id: 'copy',
    duration: 3400,
    narration: 'The provisioner sees a dataSource of kind PVC and asks the driver to clone. The driver copies the source volume to a fresh one entirely server-side, block for block, with no snapshot object created along the way. The source stays online the whole time.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: 'data-src Bound', dest: 'provisioning', method: 'kind: PVC', copy: 'server-side' });
      s.refs.destPvc.style.opacity = '1';
      s.refs.dsRef.style.opacity = '1';
      s.refs.destBound.style.opacity = '0';
      s.refs.wDestProv.style.opacity = '1';
      s.refs.wProvDd.style.opacity = '1';
      s.refs.wCopy.style.opacity = '1';
      s.refs.prov.classList.add('highlight');
      s.refs.srcDisk.classList.add('highlight');
      s.refs.destDisk.style.opacity = '1';
      s.refs.destDisk.classList.add('highlight');
      setWire(s, 'copy', 'block-for-block copy');
      if (ctx.reduced) return;
      s.refs.destDisk.style.opacity = '0';
      const claim = routePacket(s, ctx, W_DEST_PROV, { cat: 'storage' });
      ridingLabel(s, ctx, 'clone data-src', W_DEST_PROV);
      const create = routePacket(s, ctx, W_PROV_DD, { delay: claim.arrivalMs + BEAT.afterHop, cat: 'storage' });
      revealAt(s.refs.destDisk, ctx, create.arrivalMs);
      const copy = routePacket(s, ctx, W_COPY, { delay: create.arrivalMs + BEAT.afterHop + 200, cat: 'storage' });
      ridingLabel(s, ctx, 'server-side copy', W_COPY, { delay: create.arrivalMs + BEAT.afterHop + 200 });
      lightBoxAt(s.refs.destDisk, ctx, copy.arrivalMs);
    },
  },
  {
    id: 'bound',
    duration: 2800,
    narration: 'The fresh disk is wrapped in a new PV and clone-1 binds to it. The clone is now a fully independent volume: writing to it never touches data-src, and deleting data-src never touches the clone. They only shared bytes at the instant of the copy.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: 'data-src Bound', dest: 'Bound', method: 'kind: PVC', copy: 'complete' });
      setBoxSublabel(s.refs.destPvc, 'Bound, 10Gi gp3');
      s.refs.destPvc.style.opacity = '1';
      s.refs.dsRef.style.opacity = '1';
      s.refs.destDisk.style.opacity = '1';
      s.refs.destDisk.classList.add('highlight');
      s.refs.destPvc.classList.add('highlight');
      setWire(s, 'copy', 'independent disk');
      s.refs.destBound.style.opacity = '1';
      if (ctx.reduced) return;
      s.refs.destBound.style.opacity = '0';
      ctx.register(s.refs.destBound.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 460, delay: 250, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'contrast',
    duration: 2800,
    narration: 'This is the difference from a snapshot restore. A snapshot needs its own VolumeSnapshot and VolumeSnapshotContent objects as a middle step, and can be kept and restored many times. A clone is a one-shot PVC to PVC copy with nothing in between, so use it when you just want a duplicate right now.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: 'data-src Bound', dest: 'Bound', method: 'PVC to PVC, direct', copy: 'complete' });
      setBoxSublabel(s.refs.destPvc, 'Bound, 10Gi gp3');
      s.refs.destPvc.style.opacity = '1';
      s.refs.dsRef.style.opacity = '1';
      s.refs.destDisk.style.opacity = '1';
      s.refs.destBound.style.opacity = '1';
      s.refs.srcPvc.classList.add('highlight');
      s.refs.destPvc.classList.add('highlight');
      setWire(s, 'copy', 'no snapshot object');
      // Packet-less and pod-less: one block flash on the clone destination. Flash the box, not the
      // dataSource value chip (chips never blink) and not the relationship line, matching the exemplars.
      flashBox(s.refs.destPvc, ctx, 200);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
