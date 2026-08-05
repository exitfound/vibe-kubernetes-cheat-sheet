import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, node, cylinder, pathArrow, chainList, setChainActive, podShell } from '../../lib/primitives.js';
import { valChip, setVal, setChip, setPodSublabel, pulsePod, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, FADE, lightBoxAt, makeRidingLabel, OPACITY } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-volume-detach-on-node-loss


const LEFT_X = 400;

const NODE_Y = 48, NODE_H = 160;
const NODE_W = 192, NODE_GAP = 16, NODE_PAD = 12;
const A_X = LEFT_X;                                      // node-1 frame
const B_X = A_X + NODE_W + NODE_GAP;                     // 608, node-2 frame
const CONTENT_CX = A_X + (NODE_W * 2 + NODE_GAP) / 2;    // 600: canvas center, every tier uses it
const NODE_BOTTOM = NODE_Y + NODE_H;                     // 208, where the attach lanes terminate

const POD_Y = 76, POD_W = NODE_W - NODE_PAD * 2, POD_H = 104;   // 168 wide, family two-column height
const POD_BOTTOM = POD_Y + POD_H;                        // 180
const A_CX = A_X + NODE_W / 2;                           // 496, node-1 centre
const B_CX = B_X + NODE_W / 2;                           // 704, and (496 + 704) / 2 == CONTENT_CX

// One disk, centered on the spine, deliberately wider than the corridor between the columns so it
// reads as shared by both rather than as belonging to the gap.
const DK_W = 190, DK_H = 104, DK_Y = 282;
const DK_X = CONTENT_CX - DK_W / 2;                      // 505
const DK_TOP = DK_Y;                                     // 282
// Beside the disk, not under it: the taint lane now comes up the spine into the disk floor.
const DK_LBL_X = 711, DK_LBL_Y = 340;

// Ladder left, chips right, so the strip spans the content width and centres on it. The escalation
// box is the only BLOCK down there beside the disk, so it stands on the SPINE or the half leans.
const M = 60;
const CHIP_W = 210, CHIP_GAP = 16, CHIP_COUNT = 3, CHIP_H = 32;
const CHIPS_W = CHIP_W * CHIP_COUNT + CHIP_GAP * (CHIP_COUNT - 1);   // 662
const CHIPS_L = 1200 - M - CHIPS_W;                      // 478
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) => CHIPS_L + i * (CHIP_W + CHIP_GAP));
const CHIPS_Y = 598;

const LAD_X = M, LAD_Y = 448, LAD_W = 380, LAD_ROW = 38, LAD_GAP = 9;
const LAD_BOTTOM = LAD_Y + LAD_ROW * 3 + LAD_GAP * 2;    // 580
const ESC_W = 230, ESC_H = 72;
const ESC_X = CONTENT_CX - ESC_W / 2;                    // 485
const ESC_Y = LAD_Y + (LAD_BOTTOM - LAD_Y - ESC_H) / 2;  // 478, vertically centered on the ladder
const ESC_CX = CONTENT_CX;                               // on the spine, under the disk it acts on
const ESC_TOP = ESC_Y;


const LANE = 22, CORRIDOR_Y = 260;
const W_ATTACH_A = [[CONTENT_CX - LANE, DK_TOP], [CONTENT_CX - LANE, CORRIDOR_Y], [A_CX, CORRIDOR_Y], [A_CX, NODE_BOTTOM]];
const W_ATTACH_B = [[CONTENT_CX + LANE, DK_TOP], [CONTENT_CX + LANE, CORRIDOR_Y], [B_CX, CORRIDOR_Y], [B_CX, NODE_BOTTOM]];
const DK_RIGHT = DK_X + DK_W, DK_MID_Y = DK_Y + DK_H / 2;   // 695 / 334
const DK_BOTTOM = DK_Y + DK_H;                              // 386
// The taint arrives from directly below, on the spine, so it needs no elbow and crosses nothing.
const W_TAINT = [[ESC_CX, ESC_TOP], [ESC_CX, DK_BOTTOM]];

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

function podBlock({ x, label, sublabel }) {
  const shell = podShell({ x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel, containers: 0, role: 'storage' });
  const innerBox = box({ x: x + 14, y: POD_Y + 30, w: POD_W - 28, h: 44, label: 'app', sublabel: 'writes PV-web', role: 'storage' });
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
      'aria-label': 'Detach on Node failure: when a Node goes NotReady and its Kubelet is silent, Kubernetes will not detach the volume immediately, because the old Pod cannot be confirmed dead and detaching while it might still write would let two Nodes write one filesystem, so it waits out the 300 second unreachable toleration and then the roughly six minute force-detach before attaching the disk on a new Node, a deliberate safety property rather than a bug, and the non-graceful node shutdown out-of-service taint is the operator escape hatch that asserts the Node is truly dead and skips the wait',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const nodeA = node({ x: A_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });
    const nodeB = node({ x: B_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2' });

    const oldPod = podBlock({ x: A_X + NODE_PAD, label: 'Pod web-0 (old)', sublabel: 'Running' });
    const newPod = podBlock({ x: B_X + NODE_PAD, label: 'Pod web-0 (new)', sublabel: 'Pending' });
    newPod.group.style.opacity = '0';

    const disk = cylinder({ x: DK_X, y: DK_Y, w: DK_W, h: DK_H, label: 'PV-web RWO', role: 'storage' });
    // The primitive centers the label on the raw bbox, which reads high because the top cap ellipse
    // is not part of the visible front face. Re-center on the face, as storage-volume-model does.
    const diskLabel = disk.querySelector('.scheme-cylinder-label');
    if (diskLabel) diskLabel.setAttribute('y', 61);

    const escape = box({
      x: ESC_X, y: ESC_Y, w: ESC_W, h: ESC_H,
      label: 'Out-of-service taint', sublabel: 'operator asserts node is dead', role: 'storage',
    });

    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: LAD_ROW, gap: LAD_GAP,
      items: [
        '1. unreachable taint  ·  300s, old Pod deleted',
        '2. force-detach timeout  ·  ~6 min, then rip attach',
        '3. attach on node-2  ·  new Pod finally starts',
      ],
      role: 'storage',
    });

    const wAttachA = pathArrow({ points: W_ATTACH_A, dashed: true, dim: false, role: 'storage' });
    const wAttachB = pathArrow({ points: W_ATTACH_B, dashed: true, dim: false, role: 'storage' });
    const wTaint   = pathArrow({ points: W_TAINT, dashed: true, dim: true, role: 'storage' });
    wAttachB.style.opacity = '0';
    wTaint.style.opacity = '0';

    const diskLbl = text({ class: 'scheme-label code dim', x: DK_LBL_X, y: DK_LBL_Y, 'text-anchor': 'start' }, [' ']);

    const nodeChip = valChip({ x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'node-1',  value: 'Ready',              role: 'storage' });
    const diskChip = valChip({ x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'volume',  value: 'attached to node-1', role: 'storage' });
    const podChip  = valChip({ x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'new Pod', value: 'not created',        role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    [nodeA, nodeB, disk, escape, oldPod.group, newPod.group].forEach(el => root.appendChild(el));
    [wAttachA, wAttachB, wTaint].forEach(el => root.appendChild(el));
    root.appendChild(diskLbl);
    [nodeChip, diskChip, podChip].forEach(c => root.appendChild(c));
    root.appendChild(chain);
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, chain, nodeA, nodeB,
      oldPod: oldPod.group, oldBox: oldPod.innerBox, oldShell: oldPod.group.querySelector('.scheme-pod'),
      newPod: newPod.group, newBox: newPod.innerBox, newShell: newPod.group.querySelector('.scheme-pod'),
      disk, escape, wAttachA, wAttachB, wTaint,
      nodeChip, diskChip, podChip,
      wires: { disk: diskLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { nodeA, volume, newPod }) {
  setChip(s.refs.nodeChip, nodeA);
  setChip(s.refs.diskChip, volume);
  setChip(s.refs.podChip, newPod);
}

function setPods(s, { oldSub, newSub }) {
  setPodSublabel(s.refs.oldShell, oldSub);
  setPodSublabel(s.refs.newShell, newSub);
}

function clearHL(s) {
  clearHighlights(s, ['disk', 'escape', 'oldBox', 'newBox',
    'nodeChip', 'diskChip', 'podChip'], [s.refs.oldPod, s.refs.newPod]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, -1);
      setChips(s, { nodeA: 'Ready', volume: 'attached to node-1', newPod: 'not created' });
      setPods(s, { oldSub: 'Running', newSub: 'Pending' });
      s.refs.nodeA.style.opacity = '1';
      s.refs.oldPod.style.opacity = '1';
      s.refs.newPod.style.opacity = '0';
      s.refs.wAttachA.style.opacity = '1';
      s.refs.wAttachB.style.opacity = '0';
      s.refs.wTaint.style.opacity = '0';
      s.refs.disk.classList.add('highlight');
    },
  },
  {
    id: 'notready',
    duration: 2600,
    narration: 'Node-1 stops answering. Its Kubelet goes silent and the Node is marked NotReady, but there is no word from Node-1 about whether the old Pod actually stopped. It might be dead. It might be a network blip with the Pod still writing.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, -1);
      setChips(s, { nodeA: 'NotReady', volume: 'attached to node-1', newPod: 'not created' });
      setPods(s, { oldSub: 'status unknown', newSub: 'Pending' });
      s.refs.oldPod.style.opacity = '1';
      // Node-2 stays empty: nothing can create a second web-0 while the first is still a live object
      // with no deletionTimestamp. The replacement appears on the evict step, which writes it.
      s.refs.newPod.style.opacity = '0';
      s.refs.disk.classList.add('highlight');
      s.refs.wAttachA.style.opacity = '1';
      s.refs.wAttachB.style.opacity = '0';
      s.refs.wTaint.style.opacity = '0';
      if (ctx.reduced) return;
      // The old Pod is the thing that changed: its sublabel flips to status unknown. Nothing
      // travels on this step, so the pulse is the only beat it has.
      pulsePod(s.refs.oldPod, ctx, 0);
    },
  },
  {
    id: 'refuse',
    duration: 2800,
    narration: 'So Kubernetes refuses to detach the disk. Notice what it is not waiting on: no other Pod holds the volume and nothing is contending for it. It is waiting on doubt. Pull PV-web off Node-1 while the old Pod might still be writing and two Nodes write one filesystem, which corrupts it. Refusing is the safe answer to a question that cannot be answered.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, -1);
      setChips(s, { nodeA: 'NotReady', volume: 'held on node-1', newPod: 'not created' });
      setPods(s, { oldSub: 'may still write', newSub: 'Pending' });
      s.refs.oldPod.style.opacity = '1';
      s.refs.newPod.style.opacity = '0';
      s.refs.disk.classList.add('highlight');
      setWire(s, 'disk', 'do not detach yet');
      if (ctx.reduced) return;
      // The old Pod is the reason nothing may move, so it is the one that blinks, with the ordinary
      // smooth pulsePod like every other Pod in the section.
      pulsePod(s.refs.oldPod, ctx, 0);
    },
  },
  {
    id: 'evict',
    duration: 2600,
    narration: 'The clocks start. First the eviction wait: Node-1 takes the unreachable taint, and the old Pod tolerates that for 300 seconds by default before it is marked for deletion. On a reachable Node that would delete the Pod cleanly and release the volume. On an unreachable Node the deletion cannot be confirmed, so the disk is still held. That same deletion mark is what finally lets a replacement be created on Node-2, where it sits in ContainerCreating waiting for a disk it cannot have.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 0);
      setChips(s, { nodeA: 'NotReady', volume: 'held on node-1', newPod: 'ContainerCreating' });
      setPods(s, { oldSub: 'marked for deletion', newSub: 'ContainerCreating' });
      // Marked for deletion is the Terminating phase, so the old Pod sits at that shade rather
      // than at full. It drops again to terminated on the next step, where it is assumed gone.
      s.refs.oldPod.style.opacity = String(OPACITY.terminating);
      s.refs.newPod.style.opacity = '1';
      s.refs.disk.classList.add('highlight');
      setWire(s, 'disk', 'still held');
      if (ctx.reduced) return;
      // The OLD Pod is what this timeout acts on, so the old Pod is what blinks, again with the
      // ordinary pulsePod. An earlier pass pulsed the new Pod here, pointing at the wrong node.
      pulsePod(s.refs.oldPod, ctx, 0);
      // It blinks at full first, then takes the mark: the pulse says which Pod this is about, the
      // fade says what just happened to it, and the two must not read as one event.
      s.refs.oldPod.style.opacity = '1';
      ctx.register(s.refs.oldPod.animate([{ opacity: 1 }, { opacity: OPACITY.terminating }], { duration: FADE.out, delay: BEAT.afterPulse, fill: 'forwards', easing: 'ease-in' }));
      // The replacement can exist from this step on, so this is where it fades in. It cannot start:
      // the disk it needs is still held by a Node nobody can reach.
      s.refs.newPod.style.opacity = '0';
      ctx.register(s.refs.newPod.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: 200, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'forcedetach',
    duration: 2800,
    narration: 'Then the force-detach timeout, roughly six minutes after that Pod deletion fails to complete. At that point Kubernetes gives up waiting for Node-1 and rips the attachment away, on the assumption that after this long the old Pod cannot still be running. Only now is the disk free.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 1);
      setChips(s, { nodeA: 'NotReady', volume: 'force-detached', newPod: 'ContainerCreating' });
      setPods(s, { oldSub: 'assumed gone', newSub: 'ContainerCreating' });
      s.refs.oldPod.style.opacity = OPACITY.terminated;
      s.refs.wAttachA.style.opacity = OPACITY.terminated;
      s.refs.newPod.style.opacity = '1';
      s.refs.disk.classList.add('highlight');
      setWire(s, 'disk', 'force-detach');
      if (ctx.reduced) return;
      // The old Pod fades the rest of the way, Terminating to terminated. It starts at the shade
      // the previous step left it on, never back at full, or the mark reads as undone for a frame.
      s.refs.oldPod.style.opacity = String(OPACITY.terminating);
      ctx.register(s.refs.oldPod.animate([{ opacity: OPACITY.terminating }, { opacity: OPACITY.terminated }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' }));
      s.refs.wAttachA.style.opacity = '1';
      ctx.register(s.refs.wAttachA.animate([{ opacity: 1 }, { opacity: OPACITY.terminated }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'attachb',
    duration: 3400,
    narration: 'With PV-web detached, it attaches to Node-2 and is mounted there, and the new Pod finally starts. Nothing in that sequence was slow. The entire outage was the safety margin: the eviction wait and then six more minutes of deliberate doubt about a Node that could not be asked.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 2);
      setChips(s, { nodeA: 'NotReady', volume: 'attached to node-2', newPod: 'Running' });
      setPods(s, { oldSub: 'assumed gone', newSub: 'Running' });
      s.refs.oldPod.style.opacity = OPACITY.terminated;
      s.refs.wAttachA.style.opacity = OPACITY.terminated;
      s.refs.wAttachB.style.opacity = '1';
      s.refs.newPod.style.opacity = '1';
      s.refs.disk.classList.add('highlight');
      if (ctx.reduced) return;
      s.refs.wAttachB.style.opacity = '0';
      ctx.register(s.refs.wAttachB.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards', easing: 'ease-out' }));
      const a = routePacket(s, ctx, W_ATTACH_B, { delay: BEAT.lead, role: 'storage' });
      // The lane now ends at the node frame bottom, so the tag rides ABOVE the ball and comes to rest
      // in the clear strip inside node-2 between the Pod bottom and the frame bottom.
      ridingLabel(s, ctx, 'attach to node-2', W_ATTACH_B, { delay: BEAT.lead });
      pulsePod(s.refs.newPod, ctx, a.arrivalMs);
    },
  },
  {
    id: 'escape',
    duration: 3200,
    narration: 'If an operator knows the Node is really dead, waiting out both clocks is wasted downtime. Non-graceful node shutdown is the escape hatch: tainting the Node out-of-service tells Kubernetes to stop assuming the Pod might live, so it deletes the Pod and detaches the volume at once. The safety wait exists for uncertainty, and the taint is how you remove the uncertainty by hand.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // The ladder is deliberately left with NO active rung. This step is not the next rung, it is
      // the path that skips the ladder, and lighting rung 3 here would say the opposite.
      setChainActive(s.refs.chain, -1);
      setChips(s, { nodeA: 'NotReady, tainted', volume: 'detached at once', newPod: 'Running' });
      setPods(s, { oldSub: 'deleted by taint', newSub: 'Running' });
      s.refs.oldPod.style.opacity = OPACITY.terminated;
      s.refs.wAttachA.style.opacity = OPACITY.terminated;
      s.refs.wAttachB.style.opacity = '1';
      s.refs.wTaint.style.opacity = '1';
      s.refs.newPod.style.opacity = '1';
      s.refs.escape.classList.add('highlight');
      setWire(s, 'disk', 'skip the wait');
      if (ctx.reduced) { s.refs.disk.classList.add('highlight'); return; }
      s.refs.wTaint.style.opacity = '0';
      ctx.register(s.refs.wTaint.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards', easing: 'ease-out' }));
      const t = routePacket(s, ctx, W_TAINT, { delay: BEAT.lead, role: 'storage' });
      ridingLabel(s, ctx, 'out-of-service', W_TAINT, { delay: BEAT.lead });
      lightBoxAt(s.refs.disk, ctx, t.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
