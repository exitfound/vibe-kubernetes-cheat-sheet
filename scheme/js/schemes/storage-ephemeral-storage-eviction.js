import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, pod, node, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur, flashChips,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// Ephemeral Storage Limits. The whole scene is one node: the focus Pod at top-left, the three things
// that make up its ephemeral usage (writable layer, emptyDir, logs) in a row beneath it, the node
// filesystem (nodefs) as the disk on the shelf, and other Pods on the right that matter only for the
// node-wide path.
//
// The card must keep TWO eviction paths distinct. Path A is per-Pod: writable + emptyDir + logs going
// over limits.ephemeral-storage evicts THIS Pod at once, regardless of node health. Path B is
// node-wide: nodefs usage crossing the eviction threshold taints the node DiskPressure, and kubelet
// then evicts Pods ranked by QoS class and by how far each is over its request, which can hit a Pod
// that was within its own limit. Only Pods pulse. The disk and contributor boxes light. Overlay owns
// x<=380 & y<=300, so blocks start to the right of it.
const NODE_X = 410, NODE_Y = 45, NODE_W = 740, NODE_H = 485;

const POD_X = 455, POD_Y = 85, POD_W = 290, POD_H = 150;
const POD_BOTTOM = POD_Y + POD_H;                     // 235

const CB_Y = 268, CB_H = 54, CB_BOTTOM = CB_Y + CB_H; // contributor boxes
const WR_X = 452, WR_CX = 515;
const ED_X = 588, ED_CX = 651;
const LG_X = 724, LG_CX = 787;

const DISK_X = 520, DISK_Y = 400, DISK_W = 280, DISK_H = 120;
const DISK_TOP = DISK_Y;                               // 400
const THRESH_Y = 432;

const PB_X = 895, PB_Y = 90, PC_Y = 182, OP_W = 215, OP_H = 72;

const CHIPS_Y = 590;

// Each static wire and its ball share one array. The three contributors all consume the node disk.
const W_WD = [[WR_CX, CB_BOTTOM], [WR_CX, 365], [600, 365], [600, DISK_TOP]];
const W_ED = [[ED_CX, CB_BOTTOM], [ED_CX, DISK_TOP]];
const W_LD = [[LG_CX, CB_BOTTOM], [LG_CX, 365], [720, 365], [720, DISK_TOP]];

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

function podBlock({ x, y, w, h, label, sublabel }) {
  const shell = pod({ x, y, w, h, label, sublabel, containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 22, y: y + 46, w: w - 44, h: 58, label: 'app', sublabel: 'writes logs and temp', cat: 'storage' });
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
      'aria-label': 'Ephemeral storage limits: a container filling the node disk with its writable layer, emptyDir and logs. The per-Pod path evicts the Pod the moment those sum past its limits.ephemeral-storage. The separate node-wide path is disk pressure: when the node filesystem crosses its threshold kubelet taints the node DiskPressure and evicts Pods ranked by QoS class and by how far each is over its request.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const nd = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'node-a' });

    const podB = podBlock({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod app-0', sublabel: 'QoS Guaranteed' });

    const bWrite = box({ x: WR_X, y: CB_Y, w: 126, h: CB_H, label: 'writable', sublabel: 'layer', cat: 'storage' });
    const bEmpty = box({ x: ED_X, y: CB_Y, w: 126, h: CB_H, label: 'emptyDir', sublabel: 'scratch', cat: 'storage' });
    const bLogs  = box({ x: LG_X, y: CB_Y, w: 126, h: CB_H, label: 'logs', sublabel: 'stdout', cat: 'storage' });

    const disk = cylinder({ x: DISK_X, y: DISK_Y, w: DISK_W, h: DISK_H, label: 'nodefs', cat: 'storage' });

    const threshLine = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: DISK_X + 10, y1: THRESH_Y, x2: DISK_X + DISK_W - 10, y2: THRESH_Y, 'stroke-dasharray': '4 4', fill: 'none' });
    const threshLbl = text({ class: 'scheme-label code dim', x: DISK_X + DISK_W + 8, y: THRESH_Y + 4, 'text-anchor': 'start' }, ['eviction threshold']);

    const otherB = pod({ x: PB_X, y: PB_Y, w: OP_W, h: OP_H, label: 'pod-b', sublabel: 'QoS BestEffort', containers: 0, cat: 'storage' });
    const otherC = pod({ x: PB_X, y: PC_Y, w: OP_W, h: OP_H, label: 'pod-c', sublabel: 'QoS Burstable', containers: 0, cat: 'storage' });

    const taintLbl = text({ class: 'scheme-label code dim', x: NODE_X + NODE_W - 20, y: 72, 'text-anchor': 'end' }, [' ']);

    const wWd = pathArrow({ points: W_WD, dashed: true, dim: true, color: 'storage' });
    const wEd = pathArrow({ points: W_ED, dashed: true, dim: true, color: 'storage' });
    const wLd = pathArrow({ points: W_LD, dashed: true, dim: true, color: 'storage' });

    const usageChip = valChip({ x: 80,  y: CHIPS_Y, w: 360, h: 34, name: 'ephemeral use', value: 'writable + emptyDir + logs', cat: 'storage' });
    const limitChip = valChip({ x: 460, y: CHIPS_Y, w: 320, h: 34, name: 'limit', value: '1Gi', cat: 'storage' });
    const nodeChip  = valChip({ x: 800, y: CHIPS_Y, w: 300, h: 34, name: 'nodefs', value: 'below threshold', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): node, then blocks and disk, then wires and labels above them, then the
    // chip strip, then the packet layer so every ball rides above everything.
    root.appendChild(nd);
    [podB.group, bWrite, bEmpty, bLogs, disk, otherB, otherC].forEach(el => root.appendChild(el));
    [threshLine, wWd, wEd, wLd, threshLbl, taintLbl].forEach(el => root.appendChild(el));
    [usageChip, limitChip, nodeChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, focusPod: podB.group, focusBox: podB.innerBox,
      bWrite, bEmpty, bLogs, disk, otherB, otherC,
      usageChip, limitChip, nodeChip,
      wires: { taint: taintLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { usage, limit, nodefs }) {
  setVal(s.refs.usageChip, usage);
  setVal(s.refs.limitChip, limit);
  setVal(s.refs.nodeChip, nodefs);
}

function clearHL(s) {
  clearHighlights(s, ['bWrite', 'bEmpty', 'bLogs', 'disk', 'focusBox', 'otherB', 'otherC',
    'usageChip', 'limitChip', 'nodeChip'], [s.refs.focusPod]);
  s.refs.focusPod.style.opacity = '1';
  s.refs.otherB.style.opacity = '1';
  s.refs.otherC.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Ephemeral storage is all the scratch space a Pod uses on the node disk. The container writable layer, any emptyDir, and the logs kubelet keeps for it all count as one pool. There are two completely separate ways that pool can get a Pod evicted.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { usage: 'writable + emptyDir + logs', limit: '1Gi', nodefs: 'below threshold' });
    },
  },
  {
    id: 'sources',
    duration: 3000,
    narration: 'The Pod ephemeral usage is the sum of three things on the node disk: what its writable layer holds, what it wrote to an emptyDir, and the container logs. kubelet adds them up continuously as the container runs.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { usage: 'writable + emptyDir + logs', limit: '1Gi', nodefs: 'filling' });
      s.refs.bWrite.classList.add('highlight');
      s.refs.bEmpty.classList.add('highlight');
      s.refs.bLogs.classList.add('highlight');
      if (ctx.reduced) { s.refs.disk.classList.add('highlight'); return; }
      // The container is doing the writing, so the Pod pulses first, then all three contributors
      // land on the node disk.
      pulsePod(s.refs.focusPod, ctx, 0);
      const wd = routePacket(s, ctx, W_WD, { delay: BEAT.afterPulse, cat: 'storage' });
      const ed = routePacket(s, ctx, W_ED, { delay: BEAT.afterPulse, cat: 'storage' });
      const ld = routePacket(s, ctx, W_LD, { delay: BEAT.afterPulse, cat: 'storage' });
      lightBoxAt(s.refs.disk, ctx, Math.max(wd.arrivalMs, ed.arrivalMs, ld.arrivalMs));
    },
  },
  {
    id: 'request',
    duration: 2200,
    narration: 'requests.ephemeral-storage is the amount the scheduler reserves when it places the Pod, the same way it reserves CPU and memory. It picks a node with room for that request, but the request alone does not cap what the Pod may actually use.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { usage: 'reserved by request', limit: '1Gi', nodefs: 'filling' });
      s.refs.focusBox.classList.add('highlight');
      if (ctx.reduced) return;
      pulsePod(s.refs.focusPod, ctx, 0);
    },
  },
  {
    id: 'podLimit',
    duration: 2800,
    narration: 'limits.ephemeral-storage does cap it. The moment the writable layer plus emptyDir plus logs go over the limit, kubelet evicts this one Pod, right away and regardless of how healthy the node is. This is the per-Pod path, and it only ever touches the Pod that overran.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { usage: 'over 1Gi', limit: 'exceeded, Pod evicted', nodefs: 'below threshold' });
      s.refs.disk.classList.add('highlight');
      // This Pod is evicted by the end of the step, so terminal opacity is the static end-state.
      s.refs.focusPod.style.opacity = '0.25';
      if (ctx.reduced) return;
      s.refs.focusPod.style.opacity = '1';
      pulsePod(s.refs.focusPod, ctx, 0);
      const over = routePacket(s, ctx, W_LD, { delay: BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'over limit', W_LD, { delay: BEAT.afterPulse });
      // Once usage crosses the limit, kubelet evicts this Pod: it fades to terminal.
      ctx.register(s.refs.focusPod.animate([{ opacity: 1 }, { opacity: 0.25 }], { duration: 600, delay: over.arrivalMs + 150, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'diskPressure',
    duration: 2600,
    narration: 'The second path is node-wide. When actual usage of the node filesystem crosses the eviction threshold, kubelet declares the node under DiskPressure and taints it, no matter whose data filled the disk.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { usage: 'within its own limit', limit: '1Gi', nodefs: 'over threshold, DiskPressure' });
      s.refs.disk.classList.add('highlight');
      setWire(s, 'taint', 'taint: node.kubernetes.io/disk-pressure');
      if (ctx.reduced) return;
      // Packet-less and pod-less: the disk box gives one blink as it crosses the threshold, then the
      // taint appears. This is the sanctioned block flash (flashChips takes blocks, not value chips).
      flashChips(s, ctx, ['disk'], 200);
      s.refs.wires.taint.style.opacity = '0';
      ctx.register(s.refs.wires.taint.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 500, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'rankEvict',
    duration: 2600,
    narration: 'Now kubelet has to reclaim space, so it ranks the Pods and starts evicting. It goes by QoS class first, BestEffort before Burstable before Guaranteed, and within a class by how far each Pod is over its ephemeral request. A Pod with no offending usage of its own can be evicted here.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { usage: 'within its own limit', limit: '1Gi', nodefs: 'reclaiming space' });
      s.refs.disk.classList.add('highlight');
      s.refs.otherB.classList.add('highlight');
      setWire(s, 'taint', 'taint: node.kubernetes.io/disk-pressure');
      // pod-b is the lowest QoS, so it is evicted first: terminal opacity is the end-state.
      s.refs.otherB.style.opacity = '0.25';
      s.refs.otherC.style.opacity = '0.6';
      if (ctx.reduced) return;
      s.refs.otherB.style.opacity = '1';
      ctx.register(s.refs.otherB.animate([{ opacity: 1 }, { opacity: 0.25 }], { duration: 600, delay: 300, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(s.refs.otherC.animate([{ opacity: 1 }, { opacity: 0.6 }], { duration: 600, delay: 600, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'distinct',
    duration: 2400,
    narration: 'So keep the two apart. A per-Pod limit is a promise about one Pod, enforced on that Pod alone. Node DiskPressure is a whole-node emergency that evicts by QoS and overage, and can take out a Pod that was well within its own limit.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { usage: 'writable + emptyDir + logs', limit: 'per-Pod limit', nodefs: 'node-wide pressure' });
      // pod-b stays evicted from the node-wide path for contrast.
      s.refs.otherB.style.opacity = '0.4';
      if (ctx.reduced) return;
      pulsePod(s.refs.focusPod, ctx, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
