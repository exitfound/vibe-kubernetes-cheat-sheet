import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, pod, node, cylinder, pathArrow } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, makeInit, clearHighlights, clearWires, setWire, relationPath, BEAT, lightBoxAt, makeRidingLabel, OPACITY } from '../../lib/storage-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#storage-ephemeral-storage-eviction


const NODE_X = 210, NODE_Y = 45, NODE_W = 780, NODE_H = 485; // 210..990, canvas-centered

// This card carries the longest narration in the storage set: its panel reaches x<=397 all the way
// down to y=355, so the Pod tier and the contributor tier both live to the right of it. The column
// centre is 620 rather than the canvas 600 for that reason, and the disk and the chips follow it.
const COL_CX = 620;

const POD_X = COL_CX - 145, POD_Y = 85, POD_W = 290, POD_H = 150; // 475..765
const POD_BOTTOM = POD_Y + POD_H;                     // 235

const CB_Y = 268, CB_H = 54, CB_BOTTOM = CB_Y + CB_H; // contributor boxes, 140 wide on a 160 pitch
const CB_W = 140, CB_PITCH = 160;
const ED_X = COL_CX - CB_W / 2, ED_CX = COL_CX;                    // 550..690
const WR_X = ED_X - CB_PITCH, WR_CX = ED_CX - CB_PITCH;            // 390..530
const LG_X = ED_X + CB_PITCH, LG_CX = ED_CX + CB_PITCH;            // 710..850

const DISK_W = 360, DISK_X = COL_CX - DISK_W / 2, DISK_Y = 400, DISK_H = 120; // 440..800
const DISK_TOP = DISK_Y;                               // 400
const THRESH_Y = 432;

const PB_X = 790, PB_Y = 85, PC_Y = 177, OP_W = 180, OP_H = 72; // top-aligned with the focus Pod

const CHIPS_Y = 550;  // just below the node bottom (530), tucked close to it rather than floating
const CHIP_W = 250, CHIP_GAP = 15, CHIP_H = 34;
const CHIP_X = i => 600 - (CHIP_W * 3 + CHIP_GAP * 2) / 2 + i * (CHIP_W + CHIP_GAP);   // 210 / 475 / 740

// Each static wire and its ball share one array. The three contributors all consume the node disk,
// each dropping straight down its own center line onto the disk top.
const W_WD = [[WR_CX, CB_BOTTOM], [WR_CX, DISK_TOP]];
const W_ED = [[ED_CX, CB_BOTTOM], [ED_CX, DISK_TOP]];
const W_LD = [[LG_CX, CB_BOTTOM], [LG_CX, DISK_TOP]];

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

function podBlock({ x, y, w, h, label, sublabel }) {
  const shell = pod({ x, y, w, h, label, sublabel, containers: 0, role: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 22, y: y + 46, w: w - 44, h: 58, label: 'app', sublabel: 'writes logs and temp', role: 'storage' });
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
      'aria-label': 'Ephemeral storage limits: a container filling the Node disk with its writable layer, emptyDir and logs. The per-Pod path evicts the Pod the moment those sum past its limits.ephemeral-storage. The separate node-wide path is disk pressure: when the Node filesystem crosses its threshold Kubelet reports the DiskPressure condition and the control plane taints the Node, and Kubelet evicts Pods ranked by whether each is over its ephemeral-storage request, then by Pod Priority and by how far over it sits.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const nd = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });

    const podB = podBlock({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod app-0', sublabel: 'req 512Mi · within' });

    const bWrite = box({ x: WR_X, y: CB_Y, w: CB_W, h: CB_H, label: 'Writable', sublabel: 'layer', role: 'storage' });
    const bEmpty = box({ x: ED_X, y: CB_Y, w: CB_W, h: CB_H, label: 'emptyDir', sublabel: 'scratch', role: 'storage' });
    const bLogs  = box({ x: LG_X, y: CB_Y, w: CB_W, h: CB_H, label: 'Logs', sublabel: 'stdout', role: 'storage' });

    // The block and its chip are both titled NodeFS, matching the cylinder in storage-csi-architecture,
    // so the same object is never named two ways across the storage set.
    const disk = cylinder({ x: DISK_X, y: DISK_Y, w: DISK_W, h: DISK_H, label: 'NodeFS', role: 'storage' });

    const threshLine = relationPath({ points: [[DISK_X + 10, THRESH_Y], [DISK_X + DISK_W - 10, THRESH_Y]], role: 'storage', dash: '4 4' });
    const threshLbl = text({ class: 'scheme-label code dim', x: DISK_X + DISK_W + 8, y: THRESH_Y + 4, 'text-anchor': 'start' }, ['eviction threshold']);

    // Each neighbour pod gets a wrapping g so pulsePod reaches the pod element itself (the
    // descendant trap: a bare pod() would pulse at half strength).
    const otherB = pod({ x: PB_X, y: PB_Y, w: OP_W, h: OP_H, label: 'pod-b', sublabel: 'no request', containers: 0, role: 'storage' });
    const otherC = pod({ x: PB_X, y: PC_Y, w: OP_W, h: OP_H, label: 'pod-c', sublabel: 'req 1Gi · over', containers: 0, role: 'storage' });
    const otherBG = g({}); otherBG.appendChild(otherB);
    const otherCG = g({}); otherCG.appendChild(otherC);
    // The eviction-order note under the neighbour column, filled on the rank step.
    const rankLbl = text({ class: 'scheme-label code dim', x: PB_X + OP_W / 2, y: 284, 'text-anchor': 'middle' }, [' ']);

    // The taint note sits centered over the main column, in the band between the node top edge and
    // the Pod top (the top-right corner belongs to the node tag).
    const taintLbl = text({ class: 'scheme-label code dim', x: ED_CX, y: 72, 'text-anchor': 'middle' }, [' ']);

    const wWd = pathArrow({ points: W_WD, dashed: true, dim: true, role: 'storage' });
    const wEd = pathArrow({ points: W_ED, dashed: true, dim: true, role: 'storage' });
    const wLd = pathArrow({ points: W_LD, dashed: true, dim: true, role: 'storage' });

    // Uniform chip strip: three 250px chips on a 15px pitch spanning exactly the node width
    // (210..990), so the strip lines up with the node block above it.
    const usageChip = valChip({ x: CHIP_X(0), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'usage', value: 'writable + emptyDir + logs', role: 'storage' });
    const limitChip = valChip({ x: CHIP_X(1), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'limit', value: '1Gi', role: 'storage' });
    const nodeChip  = valChip({ x: CHIP_X(2), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'NodeFS', value: 'below threshold', role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): node, then blocks and disk, then wires and labels above them, then the
    // chip strip, then the packet layer so every ball rides above everything.
    root.appendChild(nd);
    [podB.group, bWrite, bEmpty, bLogs, disk, otherBG, otherCG].forEach(el => root.appendChild(el));
    [threshLine, wWd, wEd, wLd, threshLbl, taintLbl, rankLbl].forEach(el => root.appendChild(el));
    [usageChip, limitChip, nodeChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, focusPod: podB.group, focusBox: podB.innerBox,
      bWrite, bEmpty, bLogs, disk, otherB, otherC, otherBG, otherCG,
      usageChip, limitChip, nodeChip,
      wires: { taint: taintLbl, rank: rankLbl },
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
    'usageChip', 'limitChip', 'nodeChip'], [s.refs.focusPod, s.refs.otherBG, s.refs.otherCG]);
  s.refs.focusPod.style.opacity = '1';
  s.refs.otherB.style.opacity = '1';
  s.refs.otherC.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
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
    narration: 'The Pod ephemeral usage is the sum of three things on the Node disk: what its writable layer holds, what it wrote to an emptyDir, and the container logs. Kubelet adds them up continuously as the container runs.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { usage: 'writable + emptyDir + logs', limit: '1Gi', nodefs: 'filling' });
      s.refs.nodeChip.classList.add('highlight');
      s.refs.bWrite.classList.add('highlight');
      s.refs.bEmpty.classList.add('highlight');
      s.refs.bLogs.classList.add('highlight');
      if (ctx.reduced) { s.refs.disk.classList.add('highlight'); return; }
      // The container is doing the writing, so the Pod pulses first, then all three contributors
      // land on the node disk.
      pulsePod(s.refs.focusPod, ctx, 0);
      const wd = routePacket(s, ctx, W_WD, { delay: BEAT.afterPulse, role: 'storage' });
      const ed = routePacket(s, ctx, W_ED, { delay: BEAT.afterPulse, role: 'storage' });
      const ld = routePacket(s, ctx, W_LD, { delay: BEAT.afterPulse, role: 'storage' });
      lightBoxAt(s.refs.disk, ctx, Math.max(wd.arrivalMs, ed.arrivalMs, ld.arrivalMs));
    },
  },
  {
    id: 'request',
    duration: 2200,
    narration: 'The requests.ephemeral-storage value is what the Pod reserves on the Node when it is placed, the same way it reserves CPU and memory. The Pod lands only on a Node with room for that request, but the request alone does not cap what it may actually use.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { usage: 'reserved by request', limit: '1Gi', nodefs: 'filling' });
      s.refs.usageChip.classList.add('highlight');
      s.refs.focusBox.classList.add('highlight');
      if (ctx.reduced) return;
      pulsePod(s.refs.focusPod, ctx, 0);
    },
  },
  {
    id: 'podLimit',
    duration: 2800,
    narration: 'The limits.ephemeral-storage value does cap it. The moment the writable layer plus emptyDir plus logs go over the limit, Kubelet evicts this one Pod, right away and regardless of how healthy the Node is. This is the per-Pod path, and it only ever touches the Pod that overran.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { usage: 'over 1Gi', limit: '1Gi exceeded, evicted', nodefs: 'below threshold' });
      s.refs.limitChip.classList.add('highlight');
      s.refs.nodeChip.classList.add('highlight');
      s.refs.usageChip.classList.add('highlight');
      // It is the SUM of the three contributors that crosses the per-Pod limit, so all three light
      // (matching the narration), each sending its ball down onto the disk like the sources step.
      s.refs.bWrite.classList.add('highlight');
      s.refs.bEmpty.classList.add('highlight');
      s.refs.bLogs.classList.add('highlight');
      // This Pod is evicted by the end of the step, so terminal opacity is the static end-state.
      s.refs.focusPod.style.opacity = String(OPACITY.terminating);
      if (ctx.reduced) { s.refs.disk.classList.add('highlight'); return; }
      s.refs.focusPod.style.opacity = '1';
      pulsePod(s.refs.focusPod, ctx, 0);
      const wd = routePacket(s, ctx, W_WD, { delay: BEAT.afterPulse, role: 'storage' });
      const ed = routePacket(s, ctx, W_ED, { delay: BEAT.afterPulse, role: 'storage' });
      const ld = routePacket(s, ctx, W_LD, { delay: BEAT.afterPulse, role: 'storage' });
      ridingLabel(s, ctx, 'over limit', W_ED, { delay: BEAT.afterPulse });
      const arrival = Math.max(wd.arrivalMs, ed.arrivalMs, ld.arrivalMs);
      lightBoxAt(s.refs.disk, ctx, arrival);
      // Once the summed usage crosses the limit, kubelet evicts this Pod: it fades to terminal.
      ctx.register(s.refs.focusPod.animate([{ opacity: 1 }, { opacity: OPACITY.terminating }], { duration: 600, delay: arrival + 150, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'diskPressure',
    duration: 2600,
    narration: 'The second path is node-wide. When actual usage of the Node filesystem crosses the eviction threshold, Kubelet reports the DiskPressure condition on the Node and the node controller taints it, no matter whose data filled the disk.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { usage: 'within its own limit', limit: '1Gi', nodefs: 'over threshold' });
      s.refs.limitChip.classList.add('highlight');
      s.refs.nodeChip.classList.add('highlight');
      s.refs.usageChip.classList.add('highlight');
      s.refs.disk.classList.add('highlight');
      setWire(s, 'taint', 'taint: node.kubernetes.io/disk-pressure');
      if (ctx.reduced) return;
      // The disk carries only its static step highlight (no flash), the taint fades in after it.
      s.refs.wires.taint.style.opacity = '0';
      ctx.register(s.refs.wires.taint.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 500, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'rankEvict',
    duration: 2600,
    narration: 'Now Kubelet has to reclaim space, so it ranks the Pods for eviction. The Pods using more ephemeral storage than they requested go first, ordered by Pod Priority and then by how far over the request each one sits. A Pod that declared no ephemeral-storage request is over the moment it writes anything, so pod-b goes first, then pod-c which sits over its own 1Gi, while app-0 stays within its request and goes last. QoS class is derived from CPU and memory alone, so it does not decide this order. A Pod with no offending usage of its own can still be taken here.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { usage: 'within its own limit', limit: '1Gi', nodefs: 'reclaiming space' });
      s.refs.nodeChip.classList.add('highlight');
      s.refs.disk.classList.add('highlight');
      s.refs.otherB.classList.add('highlight');
      setWire(s, 'taint', 'taint: node.kubernetes.io/disk-pressure');
      setWire(s, 'rank', 'over request first, then Priority');
      // pod-b declared no ephemeral-storage request, so it is over the moment it writes: evicted
      // first, and the terminal opacity is the end-state.
      s.refs.otherB.style.opacity = String(OPACITY.terminating);
      s.refs.otherC.style.opacity = String(OPACITY.terminating);
      if (ctx.reduced) return;
      // The ranking plays as a sequence: kubelet picks pod-b (pulse), evicts it (fade out), then
      // turns to pod-c (pulse) which dims as the next in line. The Guaranteed focus Pod never moves.
      s.refs.otherB.style.opacity = '1';
      s.refs.otherC.style.opacity = '1';
      pulsePod(s.refs.otherBG, ctx, 0);
      ctx.register(s.refs.otherB.animate([{ opacity: 1 }, { opacity: OPACITY.terminating }], { duration: 600, delay: BEAT.afterPulse, fill: 'forwards', easing: 'ease-in' }));
      pulsePod(s.refs.otherCG, ctx, 1000);
      ctx.register(s.refs.otherC.animate([{ opacity: 1 }, { opacity: OPACITY.terminating }], { duration: 600, delay: 1000 + BEAT.afterPulse, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'distinct',
    duration: 2400,
    narration: 'So keep the two apart. A per-Pod limit is a promise about one Pod, enforced on that Pod alone. Node DiskPressure is a whole-node emergency that evicts by Pod Priority and by how far each Pod is over its request, and can take out a Pod that was well within its own limit.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { usage: 'writable + emptyDir + logs', limit: 'per-Pod limit', nodefs: 'node-wide pressure' });
      s.refs.limitChip.classList.add('highlight');
      s.refs.nodeChip.classList.add('highlight');
      s.refs.usageChip.classList.add('highlight');
      // Recap both paths side by side: the Pod pool is the per-Pod limit actor, the node disk is the
      // node-wide pressure actor, so both light while the summary plays.
      s.refs.focusBox.classList.add('highlight');
      s.refs.disk.classList.add('highlight');
      // pod-b stays evicted from the node-wide path for contrast.
      s.refs.otherB.style.opacity = String(OPACITY.terminating);
      if (ctx.reduced) return;
      pulsePod(s.refs.focusPod, ctx, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
