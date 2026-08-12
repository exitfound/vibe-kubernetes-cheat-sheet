import { P, F, defineCard, BEAT, FADE, OPACITY } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-volume-detach-on-node-loss


const LEFT_X = 400;

const NODE_Y = 48, NODE_H = 160;
const NODE_W = 192, NODE_GAP = 16, NODE_PAD = 12;
const A_X = LEFT_X;                                      // node-1 frame
const B_X = A_X + NODE_W + NODE_GAP;                     // 608, node-2 frame
const CONTENT_CX = A_X + (NODE_W * 2 + NODE_GAP) / 2;    // 600: canvas center, every tier uses it
const NODE_BOTTOM = NODE_Y + NODE_H;                     // 208, where the attach lanes terminate

const POD_Y = 76, POD_W = NODE_W - NODE_PAD * 2, POD_H = 104;   // 168 wide, family two-column height
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
const DK_BOTTOM = DK_Y + DK_H;                              // 386
// The taint arrives from directly below, on the spine, so it needs no elbow and crosses nothing.
const W_TAINT = [[ESC_CX, ESC_TOP], [ESC_CX, DK_BOTTOM]];


// The two Pods differ only in x, name and sublabel: same shell, same inner box, same footprint.
const podBlock = ({ key, shellKey, innerKey, x, label, sublabel, opacity }) => P.pod({
  key, shellKey, innerKey, x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel, containers: 0,
  inner: { dx: 14, dy: 30, w: POD_W - 28, h: 44, label: 'app', sublabel: 'writes PV-web' },
  opacity,
});

// The list order IS the append order, which is the z-order: the two node frames, then the disk, the
// escape box and the Pods, then the lanes and the disk caption above them, then the chip strip, then
// the ladder, then the packet layer.
export const SCENE = {
  'aria-label': 'Detach on Node failure: when a Node goes NotReady and its Kubelet is silent, Kubernetes will not detach the volume immediately, because the old Pod cannot be confirmed dead and detaching while it might still write would let two Nodes write one filesystem, so it waits out the 300 second unreachable toleration and then the roughly six minute force-detach before attaching the disk on a new Node, a deliberate safety property rather than a bug, and the non-graceful node shutdown out-of-service taint is the operator escape hatch that asserts the Node is truly dead and skips the wait',
  parts: [
    P.defs(),
    P.node({ key: 'nodeA', x: A_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'nodeB', x: B_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2' }),
    // The primitive centers the label on the raw bbox, which reads high because the top cap ellipse
    // is not part of the visible front face. Re-center on the face, as storage-volume-model does.
    P.cylinder({ key: 'disk', x: DK_X, y: DK_Y, w: DK_W, h: DK_H, label: 'PV-web RWO', labelY: 61 }),
    P.box({
      key: 'escape', x: ESC_X, y: ESC_Y, w: ESC_W, h: ESC_H,
      label: 'Out-of-service taint', sublabel: 'operator asserts node is dead',
    }),
    podBlock({ key: 'oldPod', shellKey: 'oldShell', innerKey: 'oldBox', x: A_X + NODE_PAD, label: 'Pod web-0 (old)', sublabel: 'Running' }),
    podBlock({ key: 'newPod', shellKey: 'newShell', innerKey: 'newBox', x: B_X + NODE_PAD, label: 'Pod web-0 (new)', sublabel: 'Pending', opacity: 0 }),
    // Both attach lanes are built IDENTICALLY and both are real arrows in the full storage colour,
    // so the left one never reads as the lesser arrow of a deliberately symmetric pair.
    P.lane({ key: 'wAttachA', points: W_ATTACH_A, dashed: true, dim: false }),
    P.lane({ key: 'wAttachB', points: W_ATTACH_B, dashed: true, dim: false, opacity: 0 }),
    P.lane({ key: 'wTaint', points: W_TAINT, dashed: true, dim: true, opacity: 0 }),
    P.wire({ key: 'disk', x: DK_LBL_X, y: DK_LBL_Y, anchor: 'start' }),
    P.chip({ key: 'nodeChip', x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'node-1', value: 'Ready' }),
    P.chip({ key: 'diskChip', x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'volume', value: 'attached to node-1' }),
    P.chip({ key: 'podChip', x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'new Pod', value: 'not created' }),
    P.chain({
      key: 'chain',
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: LAD_ROW, gap: LAD_GAP,
      items: [
        '1. unreachable taint  ·  300s, old Pod deleted',
        '2. force-detach timeout  ·  ~6 min, then rip attach',
        '3. attach on node-2  ·  new Pod finally starts',
      ],
    }),
    P.packets(),
  ],
  reset: {
    keys: ['disk', 'escape', 'oldBox', 'newBox', 'nodeChip', 'diskChip', 'podChip'],
    pods: ['oldPod', 'newPod'],
  },
};

// Every step writes EVERY chip and EVERY Pod sublabel: unset, the volume chip reads `force-detached`
// on the step explaining why nothing has been detached yet, and a Pod still reading `Running` three
// steps after its node went silent is a lie the reader cannot catch.
const chips = (nodeA, volume, newPod) => ({ nodeChip: nodeA, diskChip: volume, podChip: newPod });
const pods = (oldSub, newSub) => ({ oldShell: oldSub, newShell: newSub });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('Ready', 'attached to node-1', 'not created'),
    podSublabels: pods('Running', 'Pending'),
    opacity: { nodeA: 1, oldPod: 1, newPod: 0, wAttachA: 1, wAttachB: 0, wTaint: 0 },
    lit: ['disk'],
    chain: -1,
  },
  {
    id: 'notready',
    duration: 2600,
    narration: 'Node-1 stops answering. Its Kubelet goes silent and the Node is marked NotReady, but there is no word from Node-1 about whether the old Pod actually stopped. It might be dead. It might be a network blip with the Pod still writing.',
    chipsCued: chips('NotReady', 'attached to node-1', 'not created'),
    podSublabels: pods('status unknown', 'Pending'),
    // Node-2 stays empty: nothing can create a second web-0 while the first is still a live object
    // with no deletionTimestamp. The replacement appears on the evict step, which writes it.
    opacity: { oldPod: 1, newPod: 0, wAttachA: 1, wAttachB: 0, wTaint: 0 },
    lit: ['disk'],
    chain: -1,
    // The old Pod is the thing that changed: its sublabel flips to status unknown. Nothing
    // travels on this step, so the pulse is the only beat it has.
    flow: [F.pulse({ pod: 'oldPod' })],
  },
  {
    id: 'refuse',
    duration: 2800,
    narration: 'So Kubernetes refuses to detach the disk. Notice what it is not waiting on: no other Pod holds the volume and nothing is contending for it. It is waiting on doubt. Pull PV-web off Node-1 while the old Pod might still be writing and two Nodes write one filesystem, which corrupts it. Refusing is the safe answer to a question that cannot be answered.',
    chipsCued: chips('NotReady', 'held on node-1', 'not created'),
    podSublabels: pods('may still write', 'Pending'),
    wires: { disk: 'do not detach yet' },
    opacity: { oldPod: 1, newPod: 0 },
    lit: ['disk'],
    chain: -1,
    // The old Pod is the reason nothing may move, so it is the one that blinks, with the ordinary
    // smooth pulsePod like every other Pod in the section.
    flow: [F.pulse({ pod: 'oldPod' })],
  },
  {
    id: 'evict',
    duration: 2600,
    narration: 'The clocks start. First the eviction wait: Node-1 takes the unreachable taint, and the old Pod tolerates that for 300 seconds by default before it is marked for deletion. On a reachable Node that would delete the Pod cleanly and release the volume. On an unreachable Node the deletion cannot be confirmed, so the disk is still held. That same deletion mark is what finally lets a replacement be created on Node-2, where it sits in ContainerCreating waiting for a disk it cannot have.',
    chipsCued: chips('NotReady', 'held on node-1', 'ContainerCreating'),
    podSublabels: pods('marked for deletion', 'ContainerCreating'),
    wires: { disk: 'still held' },
    // Marked for deletion is the Terminating phase, so the old Pod sits at that shade rather
    // than at full. It drops again to terminated on the next step, where it is assumed gone.
    opacity: { oldPod: OPACITY.terminating, newPod: 1 },
    lit: ['disk'],
    chain: 0,
    // The animated path starts where the previous step left the pair and travels to the statics
    // above: the old Pod blinks at FULL before it takes the mark, and the replacement is not drawn
    // at all until it fades in.
    rewind: { opacity: { oldPod: 1, newPod: 0 } },
    // The OLD Pod is what this timeout acts on, so the old Pod is what blinks, again with the
    // ordinary pulsePod. An earlier pass pulsed the new Pod here, pointing at the wrong node.
    // It blinks at full first, then takes the mark: the pulse says which Pod this is about, the
    // fade says what just happened to it, and the two must not read as one event. The replacement
    // can exist from this step on, so this is where it fades in. It cannot start: the disk it needs
    // is still held by a Node nobody can reach.
    flow: [
      F.pulse({ pod: 'oldPod' }),
      F.fade({ target: 'oldPod', from: 1, to: OPACITY.terminating, dur: FADE.out, delay: BEAT.afterPulse, fill: 'forwards', easing: 'ease-in' }),
      F.fade({ target: 'newPod', from: 0, to: 1, dur: FADE.in, delay: 200, fill: 'forwards', easing: 'ease-out' }),
    ],
  },
  {
    id: 'forcedetach',
    duration: 2800,
    narration: 'Then the force-detach timeout, roughly six minutes after that Pod deletion fails to complete. At that point Kubernetes gives up waiting for Node-1 and rips the attachment away, on the assumption that after this long the old Pod cannot still be running. Only now is the disk free.',
    chipsCued: chips('NotReady', 'force-detached', 'ContainerCreating'),
    podSublabels: pods('assumed gone', 'ContainerCreating'),
    wires: { disk: 'force-detach' },
    opacity: { oldPod: OPACITY.terminated, wAttachA: OPACITY.terminated, newPod: 1 },
    lit: ['disk'],
    chain: 1,
    // The old Pod starts at the shade the previous step left it on, never back at full, or the mark
    // reads as undone for a frame.
    rewind: { opacity: { oldPod: OPACITY.terminating, wAttachA: 1 } },
    // The old Pod fades the rest of the way, Terminating to terminated, and the severing of the
    // node-1 attachment is carried by the lane fading with it. The disk does NOT flash.
    flow: [
      F.fade({ target: 'oldPod', from: OPACITY.terminating, to: OPACITY.terminated, dur: FADE.out, fill: 'forwards', easing: 'ease-in' }),
      F.fade({ target: 'wAttachA', from: 1, to: OPACITY.terminated, dur: FADE.out, fill: 'forwards', easing: 'ease-in' }),
    ],
  },
  {
    id: 'attachb',
    duration: 3400,
    narration: 'With PV-web detached, it attaches to Node-2 and is mounted there, and the new Pod finally starts. Nothing in that sequence was slow. The entire outage was the safety margin: the eviction wait and then six more minutes of deliberate doubt about a Node that could not be asked.',
    chipsCued: chips('NotReady', 'attached to node-2', 'Running'),
    podSublabels: pods('assumed gone', 'Running'),
    opacity: { oldPod: OPACITY.terminated, wAttachA: OPACITY.terminated, wAttachB: 1, newPod: 1 },
    // The disk is the SOURCE of the attach hop and is lit from entry, because a ball must never
    // leave an unlit block, while node-2 lights on ARRIVAL through the Pod blink.
    lit: ['disk'],
    chain: 2,
    rewind: { opacity: { wAttachB: 0 } },
    // The lane ends at the node frame bottom, so the tag rides ABOVE the ball and comes to rest in
    // the clear strip inside node-2 between the Pod bottom and the frame bottom.
    flow: [
      F.fade({ target: 'wAttachB', from: 0, to: 1, dur: 300, fill: 'forwards', easing: 'ease-out' }),
      F.route({ points: W_ATTACH_B, delay: BEAT.lead, name: 'attach' }),
      F.tag({ text: 'attach to node-2', points: W_ATTACH_B, delay: BEAT.lead }),
      F.pulse({ pod: 'newPod', at: 'attach' }),
    ],
  },
  {
    id: 'escape',
    duration: 3200,
    narration: 'If an operator knows the Node is really dead, waiting out both clocks is wasted downtime. Non-graceful node shutdown is the escape hatch: tainting the Node out-of-service tells Kubernetes to stop assuming the Pod might live, so it deletes the Pod and detaches the volume at once. The safety wait exists for uncertainty, and the taint is how you remove the uncertainty by hand.',
    chipsCued: chips('NotReady, tainted', 'detached at once', 'Running'),
    podSublabels: pods('deleted by taint', 'Running'),
    wires: { disk: 'skip the wait' },
    opacity: { oldPod: OPACITY.terminated, wAttachA: OPACITY.terminated, wAttachB: 1, wTaint: 1, newPod: 1 },
    lit: ['escape'],
    // The ladder is deliberately left with NO active rung. This step is not the next rung, it is
    // the path that skips the ladder, and lighting rung 3 here would say the opposite.
    chain: -1,
    rewind: { opacity: { wTaint: 0 } },
    // No Pod acts here (the operator does), so there is no pulse, and the ball leaves after
    // BEAT.lead so the lit escape box registers as the source. The disk lights on arrival, which is
    // also the cue the reduced path shows in place of the hop.
    flow: [
      F.fade({ target: 'wTaint', from: 0, to: 1, dur: 300, fill: 'forwards', easing: 'ease-out' }),
      F.route({ points: W_TAINT, delay: BEAT.lead, name: 'taint' }),
      F.tag({ text: 'out-of-service', points: W_TAINT, delay: BEAT.lead }),
      F.light({ targets: ['disk'], at: 'taint' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
