import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, node, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// Layout (viewBox 1200x640). Storage grammar: consumers on top, machinery in the middle, disks on a
// shelf at the bottom. Here the top row is TWO worker nodes, each carrying Pods, because the whole
// point of access modes is which node (and which Pod) may hold the volume at the same time. The CSI
// driver sits as a full-width band under the nodes, since every attach is mediated by it and the
// driver is what actually honours (or refuses) the requested mode. The disks are two PVs on the
// bottom shelf: a block disk that can only do single-attach, and a shared filesystem that can do many.
//
// Every mount is a DESCENT through the driver: Pod -> driver (attach request), then driver -> disk
// (the attach). A ball that enters the driver at the Pod column and re-emerges at the disk column is
// the rewrite-inside-a-box idiom: the driver is where the decision is made. A refused attach stops AT
// the driver and never reaches a disk. Only Pods pulse. The driver and the disks light, never pulse.
// The narration overlay owns x<=380 & y<=300, so every block starts at x>=400.
const NODE_A_X = 400, NODE_A_Y = 55, NODE_A_W = 330, NODE_A_H = 175;
const NODE_B_X = 770, NODE_B_Y = 55, NODE_B_W = 250, NODE_B_H = 175;

const POD_Y = 82, POD_W = 140, POD_H = 115;
const POD_BOTTOM = POD_Y + POD_H;                        // 197
const A1_X = 418, A2_X = 575, B1_X = 790;
const A1_CX = A1_X + POD_W / 2, A2_CX = A2_X + POD_W / 2, B1_CX = B1_X + POD_W / 2; // 488 / 645 / 860

const DRV_X = 430, DRV_Y = 305, DRV_W = 600, DRV_H = 70;
const DRV_TOP = DRV_Y, DRV_BOTTOM = DRV_Y + DRV_H;       // 305 / 375

const PV_Y = 450, PV_H = 100, PV_TOP = PV_Y;             // 450
const BLOCK_CX = 560, NFS_CX = 880;
const SPEC_Y = PV_Y + 66;                                // 516
const VERDICT_Y = 566;
const CHIPS_Y = 585;

const DIM = 0.55;   // a Pod that has not been granted the volume

// Attach request hops: Pod -> driver band.
const W_A1_DRV = [[A1_CX, POD_BOTTOM], [A1_CX, DRV_TOP]];
const W_A2_DRV = [[A2_CX, POD_BOTTOM], [A2_CX, DRV_TOP]];
const W_B1_DRV = [[B1_CX, POD_BOTTOM], [B1_CX, DRV_TOP]];
// Attach hops: driver -> disk. The ball re-emerges from the driver at the disk column.
const W_DRV_BLOCK = [[BLOCK_CX, DRV_BOTTOM], [BLOCK_CX, PV_TOP]];
const W_DRV_NFS   = [[NFS_CX, DRV_BOTTOM], [NFS_CX, PV_TOP]];
const W_DRV_NFS_A = [[NFS_CX - 7, DRV_BOTTOM], [NFS_CX - 7, PV_TOP]];  // app-1 lane
const W_DRV_NFS_B = [[NFS_CX + 7, DRV_BOTTOM], [NFS_CX + 7, PV_TOP]];  // app-3 lane, beside it

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// A tag that rides with the ball on the same path, timing and easing, so the packet visibly carries
// what the step narrates. Not a .scheme-packet, so the tools do not count it. easing:'linear' for a
// straight segmentPacket hop, default (eased) for a routePacket which is what every hop here is.
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

// A Pod is a shell plus an inner box, wrapped in a g so pulsePod reaches BOTH. querySelectorAll
// matches descendants only, so pulsing a bare pod() would fire at half strength.
function podBlock({ x, label }) {
  const shell = pod({ x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel: 'mounts /data', containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 18, y: POD_Y + 42, w: POD_W - 36, h: 46, label: 'ctr', sublabel: 'reads and writes', cat: 'storage' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

function specText(cx, txt) {
  return text({ class: 'scheme-label code dim', x: cx, y: SPEC_Y, 'text-anchor': 'middle' }, [txt]);
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
      'aria-label': 'Access modes decide who can mount a volume at once: ReadWriteOnce attaches a volume to a single node, so two Pods on that same node can both use it but a Pod on another node cannot, ReadWriteOncePod narrows that to one single Pod, and ReadWriteMany needs a shared filesystem because a plain block disk cannot be attached to many nodes at all. The access mode is only a request that the CSI driver has to honour, Kubernetes does not enforce it on its own.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const nodeA = node({ x: NODE_A_X, y: NODE_A_Y, w: NODE_A_W, h: NODE_A_H, label: 'node-a' });
    const nodeB = node({ x: NODE_B_X, y: NODE_B_Y, w: NODE_B_W, h: NODE_B_H, label: 'node-b' });

    const podA1 = podBlock({ x: A1_X, label: 'Pod app-1' });
    const podA2 = podBlock({ x: A2_X, label: 'Pod app-2' });
    const podB1 = podBlock({ x: B1_X, label: 'Pod app-3' });

    const driver = box({ x: DRV_X, y: DRV_Y, w: DRV_W, h: DRV_H, label: 'CSI driver and attach controller', sublabel: 'grants or refuses each attach', cat: 'storage' });

    const pvBlock = cylinder({ x: BLOCK_CX - 100, y: PV_Y, w: 200, h: PV_H, label: 'pv-block', cat: 'storage' });
    const pvNfs   = cylinder({ x: NFS_CX - 100, y: PV_Y, w: 200, h: PV_H, label: 'pv-nfs', cat: 'storage' });

    const wA1 = pathArrow({ points: W_A1_DRV, dashed: true, dim: true, color: 'storage' });
    const wA2 = pathArrow({ points: W_A2_DRV, dashed: true, dim: true, color: 'storage' });
    const wB1 = pathArrow({ points: W_B1_DRV, dashed: true, dim: true, color: 'storage' });
    const wBlock = pathArrow({ points: W_DRV_BLOCK, dashed: true, dim: true, color: 'storage' });
    const wNfs = pathArrow({ points: W_DRV_NFS, dashed: true, dim: true, color: 'storage' });

    const blockLbl = text({ class: 'scheme-label code dim', x: BLOCK_CX, y: VERDICT_Y, 'text-anchor': 'middle' }, [' ']);
    const nfsLbl   = text({ class: 'scheme-label code dim', x: NFS_CX, y: VERDICT_Y, 'text-anchor': 'middle' }, [' ']);
    const drvLbl   = text({ class: 'scheme-label code dim', x: 725, y: 408, 'text-anchor': 'middle' }, [' ']);

    const modeChip   = valChip({ x: 70,  y: CHIPS_Y, w: 240, h: 34, name: 'accessModes', value: 'ReadWriteOnce', cat: 'storage' });
    const attachChip = valChip({ x: 330, y: CHIPS_Y, w: 200, h: 34, name: 'attached to', value: 'none', cat: 'storage' });
    const shareChip  = valChip({ x: 550, y: CHIPS_Y, w: 320, h: 34, name: 'sharing', value: 'none', cat: 'storage' });
    const driverChip = valChip({ x: 890, y: CHIPS_Y, w: 240, h: 34, name: 'enforced by', value: 'CSI driver', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): node containers, then the driver band and disks, then the Pods so they
    // sit above their node, then the wires and their labels above the blocks, then the chip strip,
    // then the packet layer so every ball rides above everything.
    [nodeA, nodeB, driver, pvBlock, pvNfs, podA1.group, podA2.group, podB1.group].forEach(el => root.appendChild(el));
    [wA1, wA2, wB1, wBlock, wNfs].forEach(el => root.appendChild(el));
    [blockLbl, nfsLbl, drvLbl].forEach(el => root.appendChild(el));
    root.appendChild(specText(BLOCK_CX, 'block disk, single attach'));
    root.appendChild(specText(NFS_CX, 'shared filesystem'));
    [modeChip, attachChip, shareChip, driverChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      podA1: podA1.group, podA2: podA2.group, podB1: podB1.group,
      appA1: podA1.innerBox, appA2: podA2.innerBox, appB1: podB1.innerBox,
      driver, pvBlock, pvNfs,
      modeChip, attachChip, shareChip, driverChip,
      wires: { block: blockLbl, nfs: nfsLbl, drv: drvLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { mode, attach, share }) {
  setVal(s.refs.modeChip, mode);
  setVal(s.refs.attachChip, attach);
  setVal(s.refs.shareChip, share);
  setVal(s.refs.driverChip, 'CSI driver');
}

function setPods(s, { a1, a2, b1 }) {
  s.refs.podA1.style.opacity = String(a1);
  s.refs.podA2.style.opacity = String(a2);
  s.refs.podB1.style.opacity = String(b1);
}

function clearHL(s) {
  clearHighlights(s, ['driver', 'pvBlock', 'pvNfs', 'appA1', 'appA2', 'appB1',
    'modeChip', 'attachChip', 'shareChip', 'driverChip'], [s.refs.podA1, s.refs.podA2, s.refs.podB1]);
}

// One attach that succeeds: the Pod blinks first (it is the actor), the request rises to the driver,
// then the granted attach drops to the disk. Both the driver and the disk light on arrival.
function grantMount(s, ctx, { podEl, reqPts, attachPts, tag, disk, lead = 0 }) {
  pulsePod(podEl, ctx, lead);
  const req = routePacket(s, ctx, reqPts, { delay: lead + BEAT.afterPulse, cat: 'storage' });
  lightBoxAt(s.refs.driver, ctx, req.arrivalMs);
  const att = routePacket(s, ctx, attachPts, { delay: req.arrivalMs + BEAT.afterHop, cat: 'storage' });
  ridingLabel(s, ctx, tag, attachPts, { delay: req.arrivalMs + BEAT.afterHop });
  lightBoxAt(disk, ctx, att.arrivalMs);
  return att.arrivalMs;
}

// An attach the driver refuses: the request reaches the driver and stops there. No disk lights.
function denyMount(s, ctx, { reqPts, tag }) {
  const req = routePacket(s, ctx, reqPts, { cat: 'storage' });
  ridingLabel(s, ctx, tag, reqPts);
  lightBoxAt(s.refs.driver, ctx, req.arrivalMs);
  return req.arrivalMs;
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'The block disk pv-block offers ReadWriteOnce. Three Pods want it: two on node-a and one on node-b. The access mode is what decides how many of them can mount it at the same time, and every attach has to pass through the CSI driver.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ReadWriteOnce', attach: 'none', share: 'none' });
      setPods(s, { a1: DIM, a2: DIM, b1: DIM });
    },
  },
  {
    id: 'rwo-first',
    duration: 3100,
    narration: 'Pod app-1 mounts the volume. ReadWriteOnce attaches the disk to one node, node-a, and lets a Pod there read and write it. So far this looks exactly like a per-Pod lock, but that is not what ReadWriteOnce actually means.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ReadWriteOnce', attach: 'node-a', share: 'app-1 on node-a' });
      setPods(s, { a1: 1, a2: DIM, b1: DIM });
      setWire(s, 'block', 'attached: node-a');
      if (ctx.reduced) { s.refs.driver.classList.add('highlight'); s.refs.pvBlock.classList.add('highlight'); return; }
      grantMount(s, ctx, { podEl: s.refs.podA1, reqPts: W_A1_DRV, attachPts: W_DRV_BLOCK, tag: 'mount rw', disk: s.refs.pvBlock });
    },
  },
  {
    id: 'rwo-samenode',
    duration: 3100,
    narration: 'Pod app-2 sits on the same node and it can mount the volume too. ReadWriteOnce is per node, not per Pod. Once the disk is attached to node-a, any number of Pods scheduled onto node-a can share it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ReadWriteOnce', attach: 'node-a', share: 'app-1 and app-2 share it' });
      setPods(s, { a1: 1, a2: 1, b1: DIM });
      setWire(s, 'block', 'attached: node-a');
      if (ctx.reduced) { s.refs.driver.classList.add('highlight'); s.refs.pvBlock.classList.add('highlight'); return; }
      grantMount(s, ctx, { podEl: s.refs.podA2, reqPts: W_A2_DRV, attachPts: W_DRV_BLOCK, tag: 'shares rw', disk: s.refs.pvBlock });
    },
  },
  {
    id: 'rwo-othernode',
    duration: 2600,
    narration: 'Pod app-3 lives on node-b and asks for the same volume. This one is refused. The disk is already attached to node-a, and a block disk can be attached to only one node at a time, so app-3 gets a Multi-Attach error and never starts.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ReadWriteOnce', attach: 'node-a', share: 'node-b refused' });
      setPods(s, { a1: 1, a2: 1, b1: DIM });
      setWire(s, 'block', 'attached: node-a');
      setWire(s, 'drv', 'held by node-a');
      if (ctx.reduced) { s.refs.driver.classList.add('highlight'); return; }
      denyMount(s, ctx, { reqPts: W_B1_DRV, tag: 'Multi-Attach denied' });
    },
  },
  {
    id: 'rwop',
    duration: 2600,
    narration: 'ReadWriteOncePod is the strict one. Now even app-2 on the same node is refused, because the volume is bound to a single Pod and nothing else. This is the mode you reach for when two Pods writing the same files would corrupt each other.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ReadWriteOncePod', attach: 'node-a', share: 'app-1 only' });
      setPods(s, { a1: 1, a2: DIM, b1: DIM });
      setWire(s, 'block', 'held by app-1');
      setWire(s, 'drv', 'one Pod only');
      s.refs.pvBlock.classList.add('highlight');
      if (ctx.reduced) { s.refs.driver.classList.add('highlight'); return; }
      denyMount(s, ctx, { reqPts: W_A2_DRV, tag: 'RWOP refused' });
    },
  },
  {
    id: 'rwx-block',
    duration: 2600,
    narration: 'ReadWriteMany asks for the volume on many nodes at once. On the block disk that request cannot be honoured at all: a raw block device simply cannot attach to more than one node. Kubernetes will accept the access mode on the object, but the driver is where it fails.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ReadWriteMany', attach: 'node-a', share: 'block cannot span nodes' });
      setPods(s, { a1: DIM, a2: DIM, b1: DIM });
      setWire(s, 'block', 'RWX unsupported');
      setWire(s, 'drv', 'block disk, no RWX');
      if (ctx.reduced) { s.refs.driver.classList.add('highlight'); return; }
      denyMount(s, ctx, { reqPts: W_B1_DRV, tag: 'RWX unsupported' });
    },
  },
  {
    id: 'rwx-nfs',
    duration: 3300,
    narration: 'Point the claim at a shared filesystem instead, pv-nfs on NFS or CephFS, and ReadWriteMany works. The driver attaches it to both nodes, and app-1 on node-a and app-3 on node-b mount it together. The mode was always allowed by Kubernetes, what changed is a backend that can deliver it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ReadWriteMany', attach: 'node-a and node-b', share: 'app-1 and app-3 share it' });
      setPods(s, { a1: 1, a2: DIM, b1: 1 });
      setWire(s, 'nfs', 'attached: both nodes');
      if (ctx.reduced) { s.refs.driver.classList.add('highlight'); s.refs.pvNfs.classList.add('highlight'); return; }
      grantMount(s, ctx, { podEl: s.refs.podA1, reqPts: W_A1_DRV, attachPts: W_DRV_NFS_A, tag: 'mount rwx', disk: s.refs.pvNfs });
      grantMount(s, ctx, { podEl: s.refs.podB1, reqPts: W_B1_DRV, attachPts: W_DRV_NFS_B, tag: 'mount rwx', disk: s.refs.pvNfs, lead: 220 });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
