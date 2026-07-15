import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// Generic Ephemeral Volumes. An inline volumeClaimTemplate written directly on the Pod under
// ephemeral. It gets a real PVC, a real StorageClass, real dynamic provisioning and a real CSI mount,
// so unlike emptyDir it can be large, of a specific class, and even snapshotted. But its lifetime is
// the Pod: the PVC carries an ownerReference back to the Pod and is garbage-collected when the Pod
// dies. This card is the bridge between the ephemeral world and the persistent machinery, so the
// identity column is the Pod on top owning its PVC below owning its PV on the shelf, and the last
// gesture is the whole column collapsing when the Pod goes away. Overlay owns x<=380 & y<=300.
const POD_X = 430, POD_Y = 44, POD_W = 260, POD_H = 110;
const POD_CX = POD_X + POD_W / 2, POD_RIGHT = POD_X + POD_W, POD_BOTTOM = POD_Y + POD_H; // 560 / 690 / 154

const PVC_X = 430, PVC_Y = 250, PVC_W = 260, PVC_H = 70;
const PVC_CX = PVC_X + PVC_W / 2, PVC_RIGHT = PVC_X + PVC_W, PVC_BOTTOM = PVC_Y + PVC_H; // 560 / 690 / 320

const SC_X = 770, SC_Y = 44, SC_W = 320, SC_H = 70;
const SC_CX = SC_X + SC_W / 2, SC_BOTTOM = SC_Y + SC_H;   // 930 / 114

const PROV_X = 770, PROV_Y = 250, PROV_W = 320, PROV_H = 80;
const PROV_CX = PROV_X + PROV_W / 2, PROV_BOTTOM = PROV_Y + PROV_H; // 930 / 330

const PV_W = 170, PV_H = 100, PV_Y = 440, PV_TOP = PV_Y;  // 440
const CHIPS_Y = 588;

const W_PVC_PROV  = [[PVC_RIGHT, 285], [PROV_X, 290]];
const W_SC_PROV   = [[SC_CX, SC_BOTTOM], [SC_CX, PROV_Y]];
const W_PROV_DISK = [[PROV_CX, PROV_BOTTOM], [PROV_CX, 405], [POD_CX, 405], [POD_CX, PV_TOP]];
const W_MOUNT_LOW = [[POD_CX, PV_TOP], [POD_CX, PVC_BOTTOM]];
const W_MOUNT_HIGH = [[POD_CX, PVC_Y], [POD_CX, POD_BOTTOM]];
const W_GC_PVC  = [[POD_CX, POD_BOTTOM], [POD_CX, PVC_Y]];
const W_GC_DISK = [[POD_CX, PVC_BOTTOM], [POD_CX, PV_TOP]];

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

function vanishAt(el, ctx, delay = 0, to = 0.1) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = String(to); return; }
  ctx.register(el.animate([{ opacity: 1 }, { opacity: to }], { duration: 480, delay, fill: 'forwards', easing: 'ease-in' }));
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

function podBlock() {
  const shell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod app-0', sublabel: 'ephemeral: volumeClaimTemplate', containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: POD_X + 24, y: POD_Y + 44, w: POD_W - 48, h: 44, label: 'app', sublabel: 'writes /scratch', cat: 'storage' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
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
      'aria-label': 'Generic ephemeral volumes: an inline volumeClaimTemplate on the Pod under ephemeral mints a real PVC with dynamic provisioning and a real CSI mount, so unlike emptyDir it can be large and of a specific class and even snapshotted, but the PVC carries an ownerReference to the Pod and is garbage-collected the moment the Pod is deleted, so its lifetime is exactly the lifetime of the Pod',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const podB = podBlock();
    const pvc  = box({ x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC app-0-scratch', sublabel: 'owned by Pod', cat: 'storage' });
    pvc.style.opacity = '0';
    const sc   = box({ x: SC_X, y: SC_Y, w: SC_W, h: SC_H, label: 'StorageClass fast-ssd', sublabel: 'provisioner: ebs.csi.aws.com', cat: 'storage' });
    const prov = box({ x: PROV_X, y: PROV_Y, w: PROV_W, h: PROV_H, label: 'external-provisioner', sublabel: 'CSI controller sidecar', cat: 'storage' });
    const pv   = cylinder({ x: POD_CX - PV_W / 2, y: PV_Y, w: PV_W, h: PV_H, label: 'pv-e91c', cat: 'storage' });
    pv.style.opacity = '0';

    // ownerReference: the PVC is owned by the Pod. Ownership, not traffic, so no arrowhead.
    const ownerLink = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: POD_CX, y1: POD_BOTTOM, x2: POD_CX, y2: PVC_Y, 'stroke-dasharray': '5 5', fill: 'none' });
    ownerLink.style.opacity = '0';
    // Bound link PVC -> PV, revealed once provisioned.
    const boundLink = line({ class: 'scheme-arrow scheme-arrow-storage', x1: POD_CX, y1: PVC_BOTTOM, x2: POD_CX, y2: PV_TOP, fill: 'none' });
    boundLink.style.opacity = '0';
    // The claim names its class: reference line across the top, no arrowhead.
    const classRef = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: POD_RIGHT, y1: 90, x2: SC_X, y2: 90, 'stroke-dasharray': '5 5', fill: 'none' });
    classRef.style.opacity = '0';

    const wPvcProv  = pathArrow({ points: W_PVC_PROV, dashed: true, dim: true, color: 'storage' });
    const wScProv   = pathArrow({ points: W_SC_PROV, dashed: true, dim: true, color: 'storage' });
    const wProvDisk = pathArrow({ points: W_PROV_DISK, dashed: true, dim: true, color: 'storage' });
    const wMountLow = pathArrow({ points: W_MOUNT_LOW, dashed: true, dim: true, color: 'storage' });
    const wMountHigh = pathArrow({ points: W_MOUNT_HIGH, dashed: true, dim: true, color: 'storage' });

    const ownerLbl = text({ class: 'scheme-label code dim', x: POD_CX + 22, y: 202, 'text-anchor': 'start' }, [' ']);
    const mountLbl = text({ class: 'scheme-label code dim', x: POD_CX + 22, y: 388, 'text-anchor': 'start' }, [' ']);

    const podChip  = valChip({ x: 120, y: CHIPS_Y, w: 220, h: 34, name: 'Pod', value: 'Pending', cat: 'storage' });
    const pvcChip  = valChip({ x: 350, y: CHIPS_Y, w: 250, h: 34, name: 'PVC', value: 'none', cat: 'storage' });
    const backChip = valChip({ x: 610, y: CHIPS_Y, w: 250, h: 34, name: 'backing', value: 'CSI dynamic', cat: 'storage' });
    const lifeChip = valChip({ x: 870, y: CHIPS_Y, w: 220, h: 34, name: 'lifetime', value: 'tied to Pod', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: blocks, then wires and their labels above them, then the chip strip, then the packet
    // layer on top so every ball rides above everything.
    [podB.group, pvc, sc, prov, pv].forEach(el => root.appendChild(el));
    [ownerLink, boundLink, classRef, wPvcProv, wScProv, wProvDisk, wMountLow, wMountHigh, ownerLbl, mountLbl].forEach(el => root.appendChild(el));
    [podChip, pvcChip, backChip, lifeChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, podB: podB.group, podBox: podB.innerBox, pvc, sc, prov, pv,
      ownerLink, boundLink, classRef,
      podChip, pvcChip, backChip, lifeChip,
      wires: { owner: ownerLbl, mount: mountLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { pod, pvc, back, life }) {
  setVal(s.refs.podChip, pod);
  setVal(s.refs.pvcChip, pvc);
  setVal(s.refs.backChip, back);
  setVal(s.refs.lifeChip, life);
}

function clearHL(s) {
  clearHighlights(s, ['pvc', 'sc', 'prov', 'pv', 'podBox',
    'podChip', 'pvcChip', 'backChip', 'lifeChip'], [s.refs.podB]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Pod carries an inline volumeClaimTemplate under a field named ephemeral. It reads like a throwaway scratch volume, the same slot where emptyDir would go, but everything below this Pod is about to become real storage machinery rather than a folder on the node.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Pending', pvc: 'none', back: 'CSI dynamic', life: 'tied to Pod' });
      s.refs.podB.style.opacity = '0.55';
      s.refs.pvc.style.opacity = '0';
      s.refs.pv.style.opacity = '0';
      s.refs.ownerLink.style.opacity = '0';
      s.refs.boundLink.style.opacity = '0';
      s.refs.classRef.style.opacity = '0';
    },
  },
  {
    id: 'mint',
    duration: 3000,
    narration: 'When the Pod is created a real PVC is minted from that inline template, named after the Pod and the volume: app-0-scratch. It is a genuine PersistentVolumeClaim object, and it carries an ownerReference pointing straight back at the Pod that spawned it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Pending', pvc: 'app-0-scratch', back: 'CSI dynamic', life: 'tied to Pod' });
      s.refs.podB.style.opacity = '0.55';
      s.refs.pv.style.opacity = '0';
      s.refs.boundLink.style.opacity = '0';
      s.refs.pvc.style.opacity = '1';
      s.refs.ownerLink.style.opacity = '1';
      s.refs.classRef.style.opacity = '1';
      s.refs.pvc.classList.add('highlight');
      setWire(s, 'owner', 'ownerReference');
      if (ctx.reduced) return;
      s.refs.pvc.style.opacity = '0';
      s.refs.ownerLink.style.opacity = '0';
      revealAt(s.refs.pvc, ctx, 150);
      ctx.register(s.refs.ownerLink.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 450, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'provision',
    duration: 3400,
    narration: 'The claim names a real StorageClass, so the provisioner treats it like any other and calls CreateVolume for a fresh disk of the size and class asked for. This is what emptyDir cannot do: the volume can be large, on fast SSD, on any driver, and it can be snapshotted.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Pending', pvc: 'provisioning', back: 'real disk, fast-ssd', life: 'tied to Pod' });
      s.refs.podB.style.opacity = '0.55';
      s.refs.pvc.style.opacity = '1';
      s.refs.ownerLink.style.opacity = '1';
      s.refs.classRef.style.opacity = '1';
      s.refs.sc.classList.add('highlight');
      s.refs.prov.classList.add('highlight');
      setWire(s, 'owner', 'ownerReference');
      s.refs.pv.style.opacity = '1';
      s.refs.pv.classList.add('highlight');
      s.refs.boundLink.style.opacity = '1';
      if (ctx.reduced) return;
      s.refs.pv.style.opacity = '0';
      s.refs.boundLink.style.opacity = '0';
      const claim = routePacket(s, ctx, W_PVC_PROV, { cat: 'storage' });
      const params = routePacket(s, ctx, W_SC_PROV, { cat: 'storage' });
      const create = routePacket(s, ctx, W_PROV_DISK, { delay: Math.max(claim.arrivalMs, params.arrivalMs) + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'CreateVolume', W_PROV_DISK, { delay: Math.max(claim.arrivalMs, params.arrivalMs) + BEAT.afterHop });
      revealAt(s.refs.pv, ctx, create.arrivalMs);
      ctx.register(s.refs.boundLink.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 460, delay: create.arrivalMs + 200, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'mount',
    duration: 3400,
    narration: 'The CSI driver attaches the disk to the node and mounts it at /scratch inside the container, exactly as it would for any ordinary PVC. The Pod starts and writes to a real, dynamically provisioned volume. Nothing about this path is a shortcut.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Running', pvc: 'Bound', back: 'mounted at /scratch', life: 'tied to Pod' });
      setBoxSublabel(s.refs.pvc, 'Bound');
      s.refs.pvc.style.opacity = '1';
      s.refs.pv.style.opacity = '1';
      s.refs.ownerLink.style.opacity = '1';
      s.refs.classRef.style.opacity = '1';
      s.refs.boundLink.style.opacity = '1';
      s.refs.pv.classList.add('highlight');
      s.refs.pvc.classList.add('highlight');
      setWire(s, 'owner', 'ownerReference');
      setWire(s, 'mount', 'attach and mount');
      s.refs.podB.style.opacity = '1';
      if (ctx.reduced) { s.refs.podBox.classList.add('highlight'); return; }
      s.refs.podB.style.opacity = '0.55';
      const low = routePacket(s, ctx, W_MOUNT_LOW, { cat: 'storage' });
      const high = routePacket(s, ctx, W_MOUNT_HIGH, { delay: low.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, '/scratch', W_MOUNT_HIGH, { delay: low.arrivalMs + BEAT.afterHop });
      ctx.register(s.refs.podB.animate([{ opacity: 0.55 }, { opacity: 1 }], { duration: 460, delay: high.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.podB, ctx, high.arrivalMs);
      lightBoxAt(s.refs.podBox, ctx, high.arrivalMs);
    },
  },
  {
    id: 'owner',
    duration: 2800,
    narration: 'The ownerReference is what makes this ephemeral. A normal PVC outlives the Pods that use it, but this one belongs to the Pod, the way a container belongs to it. There is no separate object to forget about and no manual cleanup to remember.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Running', pvc: 'Bound', back: 'mounted at /scratch', life: 'owned by Pod' });
      setBoxSublabel(s.refs.pvc, 'Bound');
      s.refs.pvc.style.opacity = '1';
      s.refs.pv.style.opacity = '1';
      s.refs.ownerLink.style.opacity = '1';
      s.refs.classRef.style.opacity = '1';
      s.refs.boundLink.style.opacity = '1';
      s.refs.podB.style.opacity = '1';
      s.refs.pvc.classList.add('highlight');
      setWire(s, 'owner', 'ownerReference: Pod app-0');
      if (ctx.reduced) return;
      // Packet-less and pod-less: flash the owned PVC box (the sanctioned block flash target), not the
      // ownerReference line, so the beat lands on a block the way the exemplars do.
      ctx.register(s.refs.pvc.animate(
        [{ filter: 'brightness(1)' }, { filter: 'brightness(1.6)' }, { filter: 'brightness(1)' }],
        { duration: 700, delay: 250, easing: 'ease-in-out' }));
    },
  },
  {
    id: 'gc',
    duration: 3400,
    narration: 'Delete the Pod and the ownerReference does the rest. Garbage collection removes the PVC, which releases the volume, and the disk is reclaimed. The scratch data existed for exactly as long as the Pod did, which is the whole point of a generic ephemeral volume.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Deleted', pvc: 'garbage-collected', back: 'reclaimed', life: 'ended with Pod' });
      s.refs.ownerLink.style.opacity = '1';
      s.refs.classRef.style.opacity = '0';
      s.refs.boundLink.style.opacity = '1';
      setWire(s, 'owner', 'cascade delete');
      if (ctx.reduced) {
        s.refs.podB.style.opacity = '0.1';
        s.refs.pvc.style.opacity = '0.1';
        s.refs.pv.style.opacity = '0.1';
        return;
      }
      s.refs.podB.style.opacity = '1';
      s.refs.pvc.style.opacity = '1';
      s.refs.pv.style.opacity = '1';
      ctx.register(s.refs.podB.animate([{ opacity: 1 }, { opacity: 0.1 }], { duration: 500, fill: 'forwards', easing: 'ease-in' }));
      const gcPvc = routePacket(s, ctx, W_GC_PVC, { delay: 600, cat: 'storage' });
      ridingLabel(s, ctx, 'ownerReference GC', W_GC_PVC, { delay: 600 });
      vanishAt(s.refs.pvc, ctx, gcPvc.arrivalMs);
      const gcDisk = routePacket(s, ctx, W_GC_DISK, { delay: gcPvc.arrivalMs + BEAT.afterHop + 200, cat: 'storage' });
      vanishAt(s.refs.pv, ctx, gcDisk.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
