import { P, F, defineCard, BEAT, FADE, OPACITY } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-detach-on-node-failure.md


// A storage card pinned right of the panel starts here, 20 left of the L-03 line at 420.
const LEFT_X = 400;

// The two node columns stay identical in width and centre the content on 600: any difference
// between them would read as part of the story.
const NODE_W = 192, NODE_GAP = 16, NODE_PAD = 12;
const A_X = LEFT_X;
const B_X = A_X + NODE_W + NODE_GAP;
const CONTENT_CX = A_X + (NODE_W * 2 + NODE_GAP) / 2;

// The catalog Pod height (STO.L-05), narrowed to fit its node column.
const POD_Y = 76, POD_W = NODE_W - NODE_PAD * 2, POD_H = 104;
// The catalog frame padding round the Pod (L-23).
const NODE_Y = POD_Y - 34, NODE_H = 34 + POD_H + 12;
const NODE_BOTTOM = NODE_Y + NODE_H;                     // where the attach lanes terminate
const APP_W = POD_W - 40, APP_H = 44, APP_DY = 26;              // the catalog 20 unit side pads
const A_CX = A_X + NODE_W / 2;
const B_CX = B_X + NODE_W / 2;

// One disk on the spine, deliberately wider than the corridor so it reads as shared by both Nodes.
const DK_W = 190, DK_H = 104, DK_Y = 282;
const DK_X = CONTENT_CX - DK_W / 2;
const DK_TOP = DK_Y;
// Beside the disk, not under it: the taint lane comes up the spine into the disk floor.
const DK_LBL_X = 711, DK_LBL_Y = 340;

// Ladder left, chips right. The escalation box is the only block beside the disk, so it stands on
// the spine, under the disk it acts on.
const M = 60;
const CHIP_W = 210, CHIP_GAP = 16, CHIP_COUNT = 3, CHIP_H = 34;
const CHIPS_W = CHIP_W * CHIP_COUNT + CHIP_GAP * (CHIP_COUNT - 1);
const CHIPS_L = 1200 - M - CHIPS_W;
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) => CHIPS_L + i * (CHIP_W + CHIP_GAP));
const CHIPS_Y = 596;

const LAD_X = M, LAD_Y = 448, LAD_W = 380, LAD_ROW = 38, LAD_GAP = 9;
const ESC_W = 232, ESC_H = 80;                           // the catalog actor block (STO.L-05)
const ESC_X = CONTENT_CX - ESC_W / 2;
const ESC_GAP = 42;                                      // clear air over the chip strip under it
const ESC_Y = CHIPS_Y - ESC_GAP - ESC_H;
const ESC_CX = CONTENT_CX;
const ESC_TOP = ESC_Y;
// T-35: the counterfactual caption, right of the spine so the taint lane never runs through it.
const BRANCH_LBL_X = ESC_CX + 20, BRANCH_LBL_Y = 440;


const LANE = 22, CORRIDOR_Y = 260;
const W_ATTACH_A = [[CONTENT_CX - LANE, DK_TOP], [CONTENT_CX - LANE, CORRIDOR_Y], [A_CX, CORRIDOR_Y], [A_CX, NODE_BOTTOM]];
const W_ATTACH_B = [[CONTENT_CX + LANE, DK_TOP], [CONTENT_CX + LANE, CORRIDOR_Y], [B_CX, CORRIDOR_Y], [B_CX, NODE_BOTTOM]];
const DK_BOTTOM = DK_Y + DK_H;
// The force delete: kubectl right of Node-2, top-aligned with the frames, its lane over both frames
// into the Node-1 top face level with the old Pod (A-21), so it crosses no block and no lane.
const KC_W = 232, KC_H = 80, KC_GAP = 48;                // the catalog actor block (STO.L-05)
const KC_X = B_X + NODE_W + KC_GAP, KC_Y = NODE_Y;
const KC_CX = KC_X + KC_W / 2;
const KILL_Y = NODE_Y - 20;
const W_KILL = [[KC_CX, KC_Y], [KC_CX, KILL_Y], [A_CX, KILL_Y], [A_CX, NODE_Y]];
// The house tag offset: the near edge of the text 16 units off the ball.
const beside = (side, dy) => (text) => ({ text, dx: side * (16 + 3 * text.length), dy });
// Trails low, in the strip between the lane and the frame tops: it leaves on the kubectl top edge
// above its label and lands right of the Node-1 caption, never on the lane.
const killTag = beside(1, 12);
// The taint arrives from directly below, on the spine, so it needs no elbow and crosses nothing.
const W_TAINT = [[ESC_CX, ESC_TOP], [ESC_CX, DK_BOTTOM]];
// Left of its lane, clear of the branch caption, and trailing low: it leaves in the strip above the
// escape label and parks under the disk floor.
const taintTag = beside(-1, 14);
// Trails its ball so it lands under the Node-2 frame, clear of the Pod floor.
const attachTag = beside(1, 16);


const podBlock = ({ key, shellKey, innerKey, x, label, sublabel, opacity }) => P.pod({
  key, shellKey, innerKey, x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel, containers: 0,
  inner: { dx: (POD_W - APP_W) / 2, dy: APP_DY, w: APP_W, h: APP_H, label: 'app', sublabel: 'writes PV web' },
  opacity,
});

export const SCENE = {
  'aria-label': 'Detach on Node failure: when a Node goes NotReady and its Kubelet is silent, Kubernetes will not detach the volume, because the old Pod cannot be confirmed dead and detaching while it might still write can corrupt the data. After the 300 second unreachable toleration the Pod is marked for deletion and a replacement waits on another Node. However, the deletion cannot complete, so the disk stays held until the old Pod object is gone, force deleted by hand or by PodGC once the Node object is deleted. Roughly six minutes after that, with the Node still not Ready, the controller force-detaches the disk and the new Pod starts. This is a deliberate safety property, not a bug. The non-graceful node shutdown out-of-service taint is the operator escape hatch. The taint declares the Node shut down, its Pods are force deleted and the volume is detached at once',
  parts: [
    P.defs(),
    P.node({ key: 'nodeA', x: A_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'nodeB', x: B_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2' }),
    // Re-centred on the front face below the cap ellipse (STO.L-02).
    P.cylinder({ key: 'disk', x: DK_X, y: DK_Y, w: DK_W, h: DK_H, label: 'PV web RWO', labelY: 61 }),
    P.box({
      key: 'escape', x: ESC_X, y: ESC_Y, w: ESC_W, h: ESC_H,
      label: 'Out-of-service taint', sublabel: 'operator confirms Node is down',
    }),
    P.box({ key: 'kubectl', x: KC_X, y: KC_Y, w: KC_W, h: KC_H, label: 'kubectl', sublabel: 'delete pod --force' }),
    podBlock({ key: 'oldPod', shellKey: 'oldShell', innerKey: 'oldBox', x: A_X + NODE_PAD, label: 'Pod web-7f9c8-tp8vd', sublabel: 'Running' }),
    podBlock({ key: 'newPod', shellKey: 'newShell', innerKey: 'newBox', x: B_X + NODE_PAD, label: 'Pod web-7f9c8-x2k4m', sublabel: 'Pending', opacity: 0 }),
    // Both attach lanes are built identically at full colour, deliberately, so neither reads as lesser.
    P.lane({ key: 'wAttachA', points: W_ATTACH_A, dashed: true, dim: false }),
    P.lane({ key: 'wAttachB', points: W_ATTACH_B, dashed: true, dim: false, opacity: 0 }),
    P.lane({ key: 'wTaint', points: W_TAINT, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wKill', points: W_KILL, dashed: true, dim: true, opacity: 0 }),
    P.wire({ key: 'disk', x: DK_LBL_X, y: DK_LBL_Y, anchor: 'start' }),
    // Written on the escape step alone, so its replay does not read as a seventh event (T-35).
    P.wire({ key: 'branch', x: BRANCH_LBL_X, y: BRANCH_LBL_Y, anchor: 'start' }),
    P.chip({ key: 'nodeChip', x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'Node-1', value: 'Ready' }),
    P.chip({ key: 'diskChip', x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'volume', value: 'attached to Node-1' }),
    P.chip({ key: 'podChip', x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'new Pod', value: 'not created' }),
    P.chain({
      key: 'chain',
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: LAD_ROW, gap: LAD_GAP,
      items: [
        '1. unreachable taint  ·  300s, old Pod marked',
        '2. stuck Terminating  ·  no clock runs',
        '3. Pod object gone  ·  ~6 min, then force-detach',
        '4. attach on Node-2  ·  new Pod finally starts',
      ],
    }),
    P.packets(),
  ],
  reset: {
    keys: ['disk', 'escape', 'kubectl', 'oldBox', 'newBox', 'nodeChip', 'diskChip', 'podChip'],
    pods: ['oldPod', 'newPod'],
  },
};

// Every step writes every chip and Pod sublabel, or a value from another step survives.
const chips = (nodeA, volume, newPod) => ({ nodeChip: nodeA, diskChip: volume, podChip: newPod });
const pods = (oldSub, newSub) => ({ oldShell: oldSub, newShell: newSub });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('Ready', 'attached to Node-1', 'not created'),
    podSublabels: pods('Running', 'Pending'),
    opacity: { nodeA: 1, oldPod: 1, newPod: 0, wAttachA: 1, wAttachB: 0, wTaint: 0, wKill: 0 },
    lit: ['disk'],
    chain: -1,
  },
  {
    id: 'notready',
    duration: 2600,
    narration: 'Node-1 stops answering. Its Kubelet goes silent and the Node is marked NotReady, but there is no word from Node-1 about whether the old Pod stopped. It might be dead. It might be a network blip with the Pod still writing.',
    chipsCued: chips('NotReady', 'attached to Node-1', 'not created'),
    podSublabels: pods('status unknown', 'Pending'),
    // Node-2 stays empty: a ReplicaSet replaces a Pod only once it carries a deletionTimestamp.
    opacity: { oldPod: 1, newPod: 0, wAttachA: 1, wAttachB: 0, wTaint: 0, wKill: 0 },
    lit: ['disk'],
    chain: -1,
    // Nothing travels on this step, so the pulse is its only beat.
    flow: [F.pulse({ pod: 'oldPod' })],
  },
  {
    id: 'refuse',
    duration: 3800,
    narration: 'So Kubernetes will not detach the disk, although no other Pod holds the volume or contends for it. Pull PV web off Node-1 while the old Pod might still be writing and the data can be corrupted, so keeping the disk attached is safer as long as nobody can say whether that Pod stopped.',
    chipsCued: chips('NotReady', 'held on Node-1', 'not created'),
    podSublabels: pods('may still write', 'Pending'),
    wires: { disk: 'do not detach yet' },
    opacity: { oldPod: 1, newPod: 0 },
    lit: ['disk'],
    chain: -1,
    // The old Pod is the reason nothing may move, so it is the one that blinks.
    flow: [F.pulse({ pod: 'oldPod' })],
  },
  {
    id: 'evict',
    duration: 4600,
    narration: 'The first clock starts. Node-1 takes the unreachable taint, and the old Pod tolerates it for 300 seconds by default before it is marked for deletion. A live Kubelet would finish that deletion and free the volume. Here nothing can, so the disk stays held. But the mark lets the ReplicaSet of the Deployment create a replacement on Node-2, which is stuck in ContainerCreating waiting for that disk.',
    chipsCued: chips('NotReady', 'held on Node-1', 'ContainerCreating'),
    podSublabels: pods('marked for deletion', 'ContainerCreating'),
    wires: { disk: 'still held' },
    // Marked for deletion reads at the Terminating shade, terminated comes on the next step.
    opacity: { oldPod: OPACITY.terminating, newPod: 1 },
    lit: ['disk'],
    chain: 0,
    // Starts where the previous step left the pair.
    rewind: { opacity: { oldPod: 1, newPod: 0 } },
    // The old Pod blinks at full first, then takes the mark: pulse and fade must not read as one event.
    flow: [
      F.pulse({ pod: 'oldPod' }),
      F.fade({ target: 'oldPod', from: 1, to: OPACITY.terminating, dur: FADE.out, delay: BEAT.afterPulse, fill: 'forwards', easing: 'ease-in' }),
      F.fade({ target: 'newPod', from: 0, to: 1, dur: FADE.in, delay: 200, fill: 'forwards', easing: 'ease-out' }),
    ],
  },
  {
    id: 'stuck',
    duration: 3100,
    narration: 'And there it stays. The old Pod object still exists and its container statuses still read running, so the controller keeps PV web wanted on Node-1 and never asks for a detach. With no timeout, the Pod sits in Terminating until something removes it, and the replacement waits with it.',
    chipsCued: chips('NotReady', 'held, no timer', 'ContainerCreating'),
    podSublabels: pods('stuck Terminating', 'ContainerCreating'),
    wires: { disk: 'no detach asked' },
    opacity: { oldPod: OPACITY.terminating, newPod: 1, wKill: 0 },
    // Nothing travels and no Pod acts: the beat is the rung and the turned chip (M-27).
    lit: ['disk'],
    chain: 1,
  },
  {
    id: 'forcedetach',
    duration: 6500,
    narration: 'The second clock starts only once the Pod object is gone. Here kubectl force deletes it by hand, as PodGC would once the Node object is deleted. Roughly six minutes later, if Node-1 is still not Ready and force detach is not disabled in the controller manager, the controller force-detaches the disk. Only now is it free.',
    chipsCued: chips('NotReady', 'force-detached', 'ContainerCreating'),
    podSublabels: pods('force deleted', 'ContainerCreating'),
    wires: { disk: 'force-detach' },
    opacity: { oldPod: OPACITY.terminated, wAttachA: OPACITY.terminated, newPod: 1, wKill: 1 },
    lit: ['kubectl', 'disk'],
    chain: 2,
    // Starts at the previous step's shade, never full, or the mark reads as undone for a frame.
    rewind: {
      opacity: { oldPod: OPACITY.terminating, wAttachA: 1, wKill: 0 },
      chips: { diskChip: 'held, no timer' },
      wires: { disk: 'no detach asked' },
      podSublabels: { oldShell: 'stuck Terminating' },
    },
    // The delete lands first and the old Pod blinks before it goes. The detach waits a beat after,
    // the six minute clock, and the lane fading with it carries the severed attachment.
    flow: [
      F.fade({ target: 'wKill', from: 0, to: 1, dur: 300, fill: 'forwards', easing: 'ease-out' }),
      F.route({ points: W_KILL, delay: BEAT.lead, name: 'kill', tag: killTag('force delete'), pulse: { pod: 'oldPod', dim: true, from: OPACITY.terminating } }),
      F.set({ at: 'kill', podSublabels: { oldShell: 'force deleted' } }),
      F.fade({ target: 'oldPod', from: OPACITY.terminating, to: OPACITY.terminated, dur: FADE.out, at: 'kill', plus: BEAT.afterPulse, fill: 'forwards', easing: 'ease-in', name: 'gone' }),
      F.fade({ target: 'wAttachA', from: 1, to: OPACITY.terminated, dur: FADE.out, at: 'gone', plus: BEAT.lead, fill: 'forwards', easing: 'ease-in', name: 'detached' }),
      F.set({ at: 'detached', chipsCued: { diskChip: 'force-detached' }, wires: { disk: 'force-detach' } }),
    ],
  },
  {
    id: 'attachb',
    duration: 3500,
    narration: 'With PV web detached, it attaches to Node-2 and is mounted there, and the new Pod finally starts. Nothing in that sequence was slow. The outage was all waiting: the eviction toleration, however long the stuck Pod object lingered, and then six more minutes of deliberate doubt about a Node that could not be asked.',
    chipsCued: chips('NotReady', 'attached to Node-2', 'Running'),
    podSublabels: pods('force deleted', 'Running'),
    opacity: { oldPod: OPACITY.terminated, wAttachA: OPACITY.terminated, wAttachB: 1, newPod: 1, wKill: 1 },
    // The disk is lit from entry, since a ball never leaves an unlit block.
    lit: ['disk'],
    chain: 3,
    rewind: { opacity: { wAttachB: 0 } },
    flow: [
      F.fade({ target: 'wAttachB', from: 0, to: 1, dur: 300, fill: 'forwards', easing: 'ease-out' }),
      F.route({ points: W_ATTACH_B, delay: BEAT.lead, tag: attachTag('attach to Node-2'), pulse: 'newPod' }),
    ],
  },
  {
    id: 'escape',
    duration: 4700,
    narration: 'If an operator has confirmed Node-1 is shut down, all that waiting is wasted downtime. The non-graceful shutdown escape hatch is the taint node.kubernetes.io/out-of-service with effect NoExecute: Pods without a matching toleration are force deleted and the volume is detached at once, with no six minute timer. A StatefulSet needs it even more: its replacement cannot be created at all while the old Pod keeps the name.',
    chipsCued: chips('NotReady, tainted', 'detached at once', 'Running'),
    podSublabels: pods('deleted by PodGC', 'Running'),
    wires: { disk: 'skip the wait', branch: 'if instead the taint lands first' },
    opacity: { oldPod: OPACITY.terminated, wAttachA: OPACITY.terminated, wAttachB: 1, wTaint: 1, newPod: 1, wKill: 1 },
    lit: ['escape'],
    // Deliberately no active rung: this step skips the ladder, it is not rung 3.
    chain: -1,
    rewind: { opacity: { wTaint: 0 } },
    // No Pod acts here, so no pulse. The disk lights on arrival, reduced path included.
    flow: [
      F.fade({ target: 'wTaint', from: 0, to: 1, dur: 300, fill: 'forwards', easing: 'ease-out' }),
      F.route({ points: W_TAINT, delay: BEAT.lead, name: 'taint', tag: taintTag('out-of-service') }),
      F.light({ targets: ['disk'], at: 'taint' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
