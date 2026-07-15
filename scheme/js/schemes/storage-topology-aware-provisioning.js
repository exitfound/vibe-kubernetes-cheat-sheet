import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, pulsePod, pulsePodDim, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// WaitForFirstConsumer. Two zones side by side, each a worker node with its own zonal disk on the
// shelf below it. volumeBindingMode: Immediate provisions the disk the instant the claim exists, in
// whatever zone the provisioner happens to pick, and the scheduler then places the Pod independently,
// so the two can land in different zones and the Pod hangs forever because a zonal disk cannot be
// attached across zones. WaitForFirstConsumer inverts the order: the scheduler picks the node first,
// and only then is the volume provisioned in that same topology. The StorageClass provisions DOWN a
// lane on the far right, clear of the nodes. The overlay owns x<=380 & y<=300, blocks start at x>=430.
const PVC_X = 430, PVC_Y = 40, PVC_W = 250, PVC_H = 64;
const PVC_RIGHT = PVC_X + PVC_W;                          // 680

const SC_X = 720, SC_Y = 40, SC_W = 340, SC_H = 64;
const SC_BOTTOM = SC_Y + SC_H;                            // 104

const NODE_Y = 210, NODE_W = 320, NODE_H = 120, NODE_BOTTOM = NODE_Y + NODE_H; // 330
const NODE_A_X = 400, NODE_B_X = 820;
const ZA_CX = NODE_A_X + NODE_W / 2, ZB_CX = NODE_B_X + NODE_W / 2; // 560 / 980

const DISK_W = 170, DISK_H = 100, DISK_Y = 390, DISK_TOP = DISK_Y;
const POD_W = 124, POD_H = 82, POD_Y = 232, POD_BOTTOM = POD_Y + POD_H; // 314

const PROV_DESC_X = 1166;   // provisioning lane, right of node-2
const PROV_BUS_Y = 362;     // below the nodes, above the disk shelf
const CHIPS_Y = 588;

function wProv(cx) { return [[SC_X + SC_W - 20, SC_BOTTOM], [PROV_DESC_X, SC_BOTTOM], [PROV_DESC_X, PROV_BUS_Y], [cx, PROV_BUS_Y], [cx, DISK_TOP]]; }
const W_MOUNT_B = [[ZB_CX, DISK_TOP], [ZB_CX, POD_BOTTOM]];               // disk zone-b -> Pod, in topology
// The doomed reach: the Pod in zone-b would have to cross into zone-a for its disk. A relationship
// that cannot carry traffic, so it is arrowhead-free and never carries a ball.
const W_CROSS = [[ZB_CX, POD_BOTTOM], [ZB_CX, PROV_BUS_Y], [ZA_CX, PROV_BUS_Y], [ZA_CX, DISK_TOP]];

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
  const x = ZB_CX - POD_W / 2;
  const shell = pod({ x, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod app-0', sublabel: ' ', containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 16, y: POD_Y + 40, w: POD_W - 32, h: 34, label: 'app', cat: 'storage' });
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
      'aria-label': 'Topology-aware provisioning with WaitForFirstConsumer: under Immediate binding a zonal disk is provisioned as soon as the claim exists and the scheduler may then place the Pod in a different zone where the disk cannot be attached, leaving the Pod stuck forever, while WaitForFirstConsumer defers binding until the Pod is scheduled so the volume is created in the Pod topology',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const pvc = box({ x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-0', sublabel: 'Pending', cat: 'storage' });
    const sc  = box({ x: SC_X, y: SC_Y, w: SC_W, h: SC_H, label: 'StorageClass gp3', sublabel: 'volumeBindingMode: Immediate', cat: 'storage' });

    const nodeA = box({ x: NODE_A_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'node-1', sublabel: 'zone-a', cat: 'storage' });
    const nodeB = box({ x: NODE_B_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'node-2', sublabel: 'zone-b', cat: 'storage' });

    const diskA = cylinder({ x: ZA_CX - DISK_W / 2, y: DISK_Y, w: DISK_W, h: DISK_H, label: 'disk zone-a', cat: 'storage' });
    const diskB = cylinder({ x: ZB_CX - DISK_W / 2, y: DISK_Y, w: DISK_W, h: DISK_H, label: 'disk zone-b', cat: 'storage' });
    diskA.style.opacity = '0';
    diskB.style.opacity = '0';

    const podB = podBlock();
    podB.group.style.opacity = '0';

    const scRef = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: PVC_RIGHT, y1: 72, x2: SC_X, y2: 72, 'stroke-dasharray': '5 5', fill: 'none' });

    const wProvA = pathArrow({ points: wProv(ZA_CX), dashed: true, dim: true, color: 'storage' });
    const wProvB = pathArrow({ points: wProv(ZB_CX), dashed: true, dim: true, color: 'storage' });
    const wMountB = pathArrow({ points: W_MOUNT_B, dashed: true, dim: true, color: 'storage' });
    // The doomed cross-zone reach: a bare dashed relationship, no marker, hidden until the fail step.
    const crossLink = pathArrow({ points: W_CROSS, dashed: true, dim: true, color: 'storage' });
    crossLink.removeAttribute('marker-end');
    crossLink.style.opacity = '0';
    wProvA.style.opacity = '1'; wProvB.style.opacity = '1'; wMountB.style.opacity = '1';

    const failLbl = text({ class: 'scheme-label code dim', x: 720, y: PROV_BUS_Y - 12, 'text-anchor': 'middle' }, [' ']);

    const modeChip = valChip({ x: 120, y: CHIPS_Y, w: 320, h: 34, name: 'bindingMode', value: 'Immediate', cat: 'storage' });
    const pvcChip  = valChip({ x: 460, y: CHIPS_Y, w: 180, h: 34, name: 'PVC', value: 'Pending', cat: 'storage' });
    const podChip  = valChip({ x: 660, y: CHIPS_Y, w: 210, h: 34, name: 'Pod', value: 'Pending', cat: 'storage' });
    const zoneChip = valChip({ x: 890, y: CHIPS_Y, w: 200, h: 34, name: 'topology', value: 'unset', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: blocks, then wires and their labels above them, then the chip strip, then the packet
    // layer on top so every ball rides above everything.
    [pvc, sc, nodeA, nodeB, diskA, diskB, podB.group].forEach(el => root.appendChild(el));
    [scRef, wProvA, wProvB, wMountB, crossLink, failLbl].forEach(el => root.appendChild(el));
    [modeChip, pvcChip, podChip, zoneChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, pvc, sc, nodeA, nodeB, diskA, diskB,
      podB: podB.group, podBox: podB.innerBox, crossLink,
      modeChip, pvcChip, podChip, zoneChip,
      wires: { fail: failLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { mode, pvc, pod, zone }) {
  setVal(s.refs.modeChip, mode);
  setVal(s.refs.pvcChip, pvc);
  setVal(s.refs.podChip, pod);
  setVal(s.refs.zoneChip, zone);
}

function clearHL(s) {
  clearHighlights(s, ['pvc', 'sc', 'nodeA', 'nodeB', 'diskA', 'diskB', 'podBox',
    'modeChip', 'pvcChip', 'podChip', 'zoneChip'], [s.refs.podB]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A claim asks for a disk from a StorageClass whose volumeBindingMode is Immediate. There are two zones, each a node with its own zonal disk. A zonal disk can only ever be attached to a node in its own zone, and that single fact is the whole story here.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'Immediate', pvc: 'Pending', pod: 'Pending', zone: 'unset' });
      setBoxSublabel(s.refs.sc, 'volumeBindingMode: Immediate');
      s.refs.diskA.style.opacity = '0';
      s.refs.diskB.style.opacity = '0';
      s.refs.podB.style.opacity = '0';
      s.refs.crossLink.style.opacity = '0';
    },
  },
  {
    id: 'imm-provision',
    duration: 3000,
    narration: 'With Immediate the volume is provisioned the moment the claim appears, long before any Pod is scheduled. The provisioner has no Pod to guide it, so it just picks a zone. Here it lands in zone-a, and the claim is Bound to a disk that now physically lives on node-1.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'Immediate', pvc: 'Bound', pod: 'Pending', zone: 'disk in zone-a' });
      setBoxSublabel(s.refs.pvc, 'Bound');
      s.refs.diskB.style.opacity = '0';
      s.refs.podB.style.opacity = '0';
      s.refs.crossLink.style.opacity = '0';
      s.refs.sc.classList.add('highlight');
      s.refs.diskA.style.opacity = '1';
      s.refs.diskA.classList.add('highlight');
      if (ctx.reduced) return;
      s.refs.diskA.style.opacity = '0';
      const prov = routePacket(s, ctx, wProv(ZA_CX), { cat: 'storage' });
      ridingLabel(s, ctx, 'CreateVolume zone-a', wProv(ZA_CX));
      revealAt(s.refs.diskA, ctx, prov.arrivalMs);
    },
  },
  {
    id: 'imm-schedule',
    duration: 3000,
    narration: 'Only now does the scheduler place the Pod, and it knows nothing about where the disk went. Free capacity, taints and affinity push it onto node-2 in zone-b. The Pod and its disk are now in different zones, and neither component ever agreed to check.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'Immediate', pvc: 'Bound', pod: 'node-2 zone-b', zone: 'disk zone-a, Pod zone-b' });
      setBoxSublabel(s.refs.pvc, 'Bound');
      s.refs.diskA.style.opacity = '1';
      s.refs.diskA.classList.add('highlight');
      s.refs.diskB.style.opacity = '0';
      s.refs.crossLink.style.opacity = '0';
      s.refs.nodeB.classList.add('highlight');
      s.refs.podB.style.opacity = '1';
      if (ctx.reduced) return;
      s.refs.podB.style.opacity = '0';
      revealAt(s.refs.podB, ctx, 200);
    },
  },
  {
    id: 'imm-fail',
    duration: 3200,
    narration: 'The Pod on node-2 needs its disk, but the disk is in zone-a and cannot be attached across the zone boundary. There is no fix from here: the Pod sits in ContainerCreating forever, and the disk sits stranded in the wrong zone. This is the single most common multi-zone storage bug.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'Immediate', pvc: 'Bound', pod: 'stuck forever', zone: 'zone mismatch' });
      setBoxSublabel(s.refs.pvc, 'Bound');
      s.refs.diskA.style.opacity = '1';
      s.refs.diskB.style.opacity = '0';
      s.refs.podB.style.opacity = '1';
      s.refs.diskA.classList.add('highlight');
      s.refs.crossLink.style.opacity = '1';
      setWire(s, 'fail', 'cannot attach across zones');
      if (ctx.reduced) return;
      // The Pod is the actor here, trying and failing to mount, so it pulses (dim, it never went Ready).
      pulsePodDim(s.refs.podB, ctx, 300, { from: 1, peak: 1 });
    },
  },
  {
    id: 'wffc-schedule',
    duration: 3200,
    narration: 'Set volumeBindingMode to WaitForFirstConsumer and start over. Binding is now deferred, so the claim stays Pending on purpose while no disk exists yet. The scheduler runs first and places the Pod on node-2 in zone-b, and its choice is recorded on the claim.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'WaitForFirstConsumer', pvc: 'Pending, waiting', pod: 'node-2 zone-b', zone: 'Pod zone-b' });
      setBoxSublabel(s.refs.sc, 'volumeBindingMode: WaitForFirstConsumer');
      setBoxSublabel(s.refs.pvc, 'Pending');
      s.refs.diskA.style.opacity = '0';
      s.refs.diskB.style.opacity = '0';
      s.refs.crossLink.style.opacity = '0';
      s.refs.nodeB.classList.add('highlight');
      s.refs.podB.style.opacity = '1';
      if (ctx.reduced) return;
      s.refs.podB.style.opacity = '0';
      revealAt(s.refs.podB, ctx, 200);
      pulsePod(s.refs.podB, ctx, 700);
    },
  },
  {
    id: 'wffc-provision',
    duration: 3600,
    narration: 'Now that the Pod has a node, the provisioner knows exactly which zone to build in. The volume is created in zone-b, bound to the claim, and attached to node-2 right below it. The Pod mounts it and starts, because the order was reversed so the disk could follow the Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'WaitForFirstConsumer', pvc: 'Bound', pod: 'Running', zone: 'both zone-b' });
      setBoxSublabel(s.refs.sc, 'volumeBindingMode: WaitForFirstConsumer');
      setBoxSublabel(s.refs.pvc, 'Bound');
      s.refs.diskA.style.opacity = '0';
      s.refs.crossLink.style.opacity = '0';
      s.refs.nodeB.classList.add('highlight');
      s.refs.diskB.style.opacity = '1';
      s.refs.diskB.classList.add('highlight');
      s.refs.podB.style.opacity = '1';
      if (ctx.reduced) { s.refs.podBox.classList.add('highlight'); return; }
      s.refs.diskB.style.opacity = '0';
      const prov = routePacket(s, ctx, wProv(ZB_CX), { cat: 'storage' });
      ridingLabel(s, ctx, 'CreateVolume zone-b', wProv(ZB_CX));
      revealAt(s.refs.diskB, ctx, prov.arrivalMs);
      const mount = routePacket(s, ctx, W_MOUNT_B, { delay: prov.arrivalMs + BEAT.afterHop + 200, cat: 'storage' });
      ridingLabel(s, ctx, 'attach and mount', W_MOUNT_B, { delay: prov.arrivalMs + BEAT.afterHop + 200 });
      pulsePod(s.refs.podB, ctx, mount.arrivalMs);
      lightBoxAt(s.refs.podBox, ctx, mount.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
