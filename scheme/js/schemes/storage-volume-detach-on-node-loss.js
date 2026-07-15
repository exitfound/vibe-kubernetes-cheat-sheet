import { svg, g, text, path } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, chainList, setChainActive, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, pulsePodDim, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// Detach on Node Failure (viewBox 1200x640). A node goes NotReady and its kubelet falls silent. The
// old Pod cannot be confirmed dead, so Kubernetes deliberately WILL NOT detach the volume yet:
// detaching while the old Pod might still be writing risks corrupting the disk. The wait is a chain
// of timeouts on the left ladder, lit one at a time: the pod-eviction timeout, then the ~6 minute
// force-detach, then the attach on the new node. This delay is a safety property, not a bug. The
// non-graceful node shutdown escape hatch (the out-of-service taint) lets an operator assert the node
// is truly dead and skip the wait. node-a and node-b sit up top, the RWO disk on the shelf below. The
// narration overlay owns x<=380 & y<=300, so the nodes start at x>=430 and the ladder top is y>=460.
const NA_X = 430, NA_Y = 60, NA_W = 320, NA_H = 210;
const NB_X = 800, NB_Y = 60, NB_W = 340, NB_H = 210;

const OLD_X = 456, OLD_Y = 98, OLD_W = 268, OLD_H = 100;
const OLD_CX = OLD_X + OLD_W / 2, OLD_BOTTOM = OLD_Y + OLD_H;  // 590 / 198
const NEW_X = 826, NEW_Y = 98, NEW_W = 288, NEW_H = 100;
const NEW_CX = NEW_X + NEW_W / 2, NEW_BOTTOM = NEW_Y + NEW_H;  // 970 / 198

const DK_X = 560, DK_Y = 320, DK_W = 190, DK_H = 120;
const DK_CX = DK_X + DK_W / 2, DK_TOP = DK_Y, DK_BOTTOM = DK_Y + DK_H; // 655 / 320 / 440

const LAD_X = 60, LAD_Y = 460, LAD_W = 560, LAD_ROW = 44, LAD_GAP = 12;
const ESC_X = 800, ESC_Y = 470, ESC_W = 340, ESC_H = 84;
const ESC_LEFT = ESC_X, ESC_CY = ESC_Y + ESC_H / 2;           // 800 / 512
const CHIPS_Y = 282;

const W_ATTACH_A = [[DK_CX, DK_TOP], [DK_CX, 240], [OLD_CX, 240], [OLD_CX, OLD_BOTTOM]];
const W_ATTACH_B = [[700, DK_TOP], [700, 238], [NEW_CX, 238], [NEW_CX, NEW_BOTTOM]];
const W_TAINT    = [[ESC_LEFT, 500], [DK_CX, 500], [DK_CX, DK_BOTTOM]];

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
  const innerBox = box({ x: x + 24, y: y + 42, w: w - 48, h: 44, label: 'app', sublabel: 'uses vol-1', cat: 'storage' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

function frameBox(x, y, w, h, label) {
  const b = box({ x, y, w, h, label: '', sublabel: '', cat: 'storage' });
  b.querySelector('.scheme-box-rect').style.fill = 'none';
  b.appendChild(text({ class: 'scheme-label dim', x: x + 14, y: y + 22, 'text-anchor': 'start' }, [label]));
  return b;
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
      'aria-label': 'Detach on node failure: when a node goes NotReady and its kubelet is silent, Kubernetes will not detach the volume immediately because the old Pod cannot be confirmed dead and detaching while it might still write risks corrupting the disk, so it waits out the pod-eviction timeout and then the roughly six minute force-detach before attaching on a new node, a deliberate safety property, and the non-graceful node shutdown out-of-service taint is the operator escape hatch that skips the wait',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const naFrame = frameBox(NA_X, NA_Y, NA_W, NA_H, 'node-a');
    const nbFrame = frameBox(NB_X, NB_Y, NB_W, NB_H, 'node-b');

    const oldPod = podBlock({ x: OLD_X, y: OLD_Y, w: OLD_W, h: OLD_H, label: 'Pod (old)', sublabel: 'Running' });
    const newPod = podBlock({ x: NEW_X, y: NEW_Y, w: NEW_W, h: NEW_H, label: 'Pod (new)', sublabel: 'Pending' });
    newPod.group.style.opacity = '0';

    const disk = cylinder({ x: DK_X, y: DK_Y, w: DK_W, h: DK_H, label: 'vol-1 RWO', cat: 'storage' });
    const escape = box({ x: ESC_X, y: ESC_Y, w: ESC_W, h: ESC_H, label: 'out-of-service taint', sublabel: 'operator asserts node is dead', cat: 'storage' });

    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: LAD_ROW, gap: LAD_GAP,
      items: [
        '1. pod-eviction timeout  ·  mark Pod for deletion',
        '2. force-detach timeout  ·  ~6 min, then rip attach',
        '3. attach on node-b  ·  new Pod finally starts',
      ],
      cat: 'storage',
    });

    // The disk being attached to node-a is a standing relationship, not a live hop (no ball rides it),
    // so it is an arrowhead-free dashed path. It dims once the disk is force-detached and moves to
    // node-b, the same phase where the old Pod fades out.
    const wAttachA = path({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', d: 'M ' + W_ATTACH_A.map((p, i) => (i ? 'L ' : '') + p[0] + ' ' + p[1]).join(' '), fill: 'none' });
    const wAttachB = pathArrow({ points: W_ATTACH_B, dashed: true, dim: true, color: 'storage' });
    const wTaint   = pathArrow({ points: W_TAINT, dashed: true, dim: true, color: 'storage' });
    wAttachB.style.opacity = '0';
    wTaint.style.opacity = '0';

    const diskLbl = text({ class: 'scheme-label code dim', x: DK_CX, y: 460, 'text-anchor': 'middle' }, [' ']);

    const nodeChip = valChip({ x: 430, y: CHIPS_Y, w: 230, h: 30, name: 'node-a', value: 'Ready', cat: 'storage' });
    const diskChip = valChip({ x: 676, y: CHIPS_Y, w: 250, h: 30, name: 'disk', value: 'on node-a', cat: 'storage' });
    const podChip  = valChip({ x: 942, y: CHIPS_Y, w: 200, h: 30, name: 'new Pod', value: 'none', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: node frames behind, then blocks, then wires + label, then chips, then the packet layer,
    // and finally the ladder appended last so its rows stay above the packets (it sits far-left, clear
    // of the packet lanes).
    [naFrame, nbFrame].forEach(el => root.appendChild(el));
    [disk, escape, oldPod.group, newPod.group].forEach(el => root.appendChild(el));
    [wAttachA, wAttachB, wTaint].forEach(el => root.appendChild(el));
    root.appendChild(diskLbl);
    [nodeChip, diskChip, podChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);
    root.appendChild(chain);

    this.host.appendChild(root);
    this.refs = {
      svg: root, chain, oldPod: oldPod.group, oldBox: oldPod.innerBox,
      newPod: newPod.group, newBox: newPod.innerBox, disk, escape, wAttachA, wAttachB, wTaint,
      nodeChip, diskChip, podChip,
      wires: { disk: diskLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { node, disk, pod }) {
  setVal(s.refs.nodeChip, node);
  setVal(s.refs.diskChip, disk);
  setVal(s.refs.podChip, pod);
}

function clearHL(s) {
  clearHighlights(s, ['disk', 'escape', 'oldBox', 'newBox',
    'nodeChip', 'diskChip', 'podChip'], [s.refs.oldPod, s.refs.newPod]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A healthy setup: node-a is Ready, its Pod is running, and the RWO disk vol-1 is attached there. The Pod may be writing to the volume at any instant. Everything about the safety story below turns on that one fact.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, -1);
      setChips(s, { node: 'Ready', disk: 'on node-a', pod: 'none' });
      s.refs.oldPod.style.opacity = '1';
      s.refs.newPod.style.opacity = '0';
      s.refs.wAttachB.style.opacity = '0';
      s.refs.wTaint.style.opacity = '0';
      s.refs.disk.classList.add('highlight');
    },
  },
  {
    id: 'notready',
    duration: 2600,
    // The new Pod arrives on node-b, so it pulses as it comes up Pending.
    narration: 'node-a stops answering. Its kubelet goes silent, the node is marked NotReady, and the control plane schedules a replacement Pod onto node-b. But there is no word from node-a about whether the old Pod actually stopped. It might be dead. It might be a network blip with the Pod still writing.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, -1);
      setChips(s, { node: 'NotReady', disk: 'on node-a', pod: 'Pending on node-b' });
      s.refs.oldPod.style.opacity = '0.5';
      s.refs.disk.classList.add('highlight');
      s.refs.wAttachB.style.opacity = '0';
      s.refs.wTaint.style.opacity = '0';
      s.refs.newPod.style.opacity = '0.5';
      if (ctx.reduced) return;
      s.refs.newPod.style.opacity = '0';
      ctx.register(s.refs.newPod.animate([{ opacity: 0 }, { opacity: 0.5 }], { duration: 500, delay: 200, fill: 'forwards', easing: 'ease-out' }));
      pulsePodDim(s.refs.newPod, ctx, 300, { from: 0.5, peak: 0.8 });
    },
  },
  {
    id: 'refuse',
    duration: 2800,
    // The old Pod might still be writing, so it pulses to show it is the risk, not the actor at rest.
    narration: 'So Kubernetes refuses to detach the disk. If it pulled vol-1 off node-a and handed it to node-b while the old Pod was still writing, two nodes would be writing the same filesystem and it would corrupt. Refusing to detach is the safe choice, even though it blocks the new Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, -1);
      setChips(s, { node: 'NotReady', disk: 'held on node-a', pod: 'ContainerCreating' });
      s.refs.oldPod.style.opacity = '0.5';
      s.refs.newPod.style.opacity = '0.5';
      s.refs.disk.classList.add('highlight');
      setWire(s, 'disk', 'do not detach yet');
      if (ctx.reduced) { s.refs.oldBox.classList.add('highlight'); return; }
      pulsePodDim(s.refs.oldPod, ctx, 0, { from: 0.5, peak: 0.85 });
    },
  },
  {
    id: 'evict',
    duration: 2600,
    narration: 'The clocks start. First the pod-eviction timeout: after the node has been NotReady long enough, the old Pod is marked for deletion. On a reachable node this would delete the Pod cleanly and release the volume. On an unreachable node the deletion cannot be confirmed, so the disk is still held.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 0);
      setChips(s, { node: 'NotReady', disk: 'held on node-a', pod: 'ContainerCreating' });
      s.refs.oldPod.style.opacity = '0.5';
      s.refs.newPod.style.opacity = '0.5';
      s.refs.disk.classList.add('highlight');
      if (ctx.reduced) return;
      pulsePodDim(s.refs.newPod, ctx, 0, { from: 0.5, peak: 0.8 });
    },
  },
  {
    id: 'forcedetach',
    duration: 2800,
    narration: 'Then the force-detach timeout, roughly six minutes after the node went unreachable. At that point Kubernetes gives up waiting for the node and rips the attachment away, on the assumption that after this long the old Pod cannot still be running. Only now is the disk free.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 1);
      setChips(s, { node: 'NotReady', disk: 'force-detached', pod: 'ContainerCreating' });
      // The old Pod is assumed gone and the disk is released by the end of this step, so the standing
      // attachment to node-a is severed and its wire dims with the old Pod.
      s.refs.oldPod.style.opacity = '0.25';
      s.refs.wAttachA.style.opacity = '0.25';
      s.refs.newPod.style.opacity = '0.5';
      setWire(s, 'disk', 'force-detach');
      if (ctx.reduced) return;
      pulsePodDim(s.refs.newPod, ctx, 0, { from: 0.5, peak: 0.8 });
    },
  },
  {
    id: 'attachb',
    duration: 3200,
    narration: 'With vol-1 detached, the controller attaches it to node-b, kubelet mounts it, and the new Pod finally starts. The mount itself took seconds. The long stall was the safety wait, the time Kubernetes spent making sure the old node had truly let go.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 2);
      setChips(s, { node: 'NotReady', disk: 'on node-b', pod: 'Running' });
      s.refs.oldPod.style.opacity = '0.25';
      s.refs.wAttachA.style.opacity = '0.25';
      s.refs.wAttachB.style.opacity = '1';
      s.refs.newPod.style.opacity = '1';
      s.refs.disk.classList.add('highlight');
      if (ctx.reduced) { s.refs.newBox.classList.add('highlight'); return; }
      const a = routePacket(s, ctx, W_ATTACH_B, { cat: 'storage' });
      ridingLabel(s, ctx, 'attach node-b', W_ATTACH_B);
      s.refs.newPod.style.opacity = '0.5';
      ctx.register(s.refs.newPod.animate([{ opacity: 0.5 }, { opacity: 1 }], { duration: 500, delay: a.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.newPod, ctx, a.arrivalMs);
      lightBoxAt(s.refs.newBox, ctx, a.arrivalMs);
    },
  },
  {
    id: 'escape',
    duration: 3000,
    narration: 'If an operator knows the node is really dead, waiting six minutes is wasted downtime. Non-graceful node shutdown is the escape hatch: tainting the node out-of-service tells Kubernetes to stop assuming the Pod might live, so it deletes the Pod and detaches the volume at once. The safety wait exists for uncertainty, and the taint is how you remove the uncertainty by hand.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 2);
      setChips(s, { node: 'out-of-service', disk: 'detached at once', pod: 'Running' });
      s.refs.oldPod.style.opacity = '0.25';
      s.refs.wAttachA.style.opacity = '0.25';
      s.refs.wAttachB.style.opacity = '1';
      s.refs.wTaint.style.opacity = '1';
      s.refs.newPod.style.opacity = '1';
      s.refs.escape.classList.add('highlight');
      setWire(s, 'disk', 'skip the wait');
      if (ctx.reduced) { s.refs.disk.classList.add('highlight'); return; }
      const t = routePacket(s, ctx, W_TAINT, { cat: 'storage' });
      ridingLabel(s, ctx, 'out-of-service', W_TAINT);
      lightBoxAt(s.refs.disk, ctx, t.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
