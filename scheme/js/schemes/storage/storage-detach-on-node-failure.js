import { P, F, defineCard, BEAT, FADE, OPACITY, makeRidingLabel } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-detach-on-node-failure.md


// The panel wall (L-02).
const LEFT_X = 400;

// The two node columns stay identical in width and centre the content on 600: any difference
// between them would read as part of the story.
const NODE_W = 192, NODE_GAP = 16, NODE_PAD = 12;
const A_X = LEFT_X;
const B_X = A_X + NODE_W + NODE_GAP;
const CONTENT_CX = A_X + (NODE_W * 2 + NODE_GAP) / 2;

// The catalog Pod height (NET.L-01), narrowed to fit its node column.
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
const LAD_BOTTOM = LAD_Y + LAD_ROW * 3 + LAD_GAP * 2;
const ESC_W = 232, ESC_H = 80;                           // the catalog actor block (NET.L-01)
const ESC_X = CONTENT_CX - ESC_W / 2;
const ESC_Y = LAD_Y + (LAD_BOTTOM - LAD_Y - ESC_H) / 2;  // centred on the ladder
const ESC_CX = CONTENT_CX;
const ESC_TOP = ESC_Y;
// T-35: the counterfactual caption, right of the spine so the taint lane never runs through it.
const BRANCH_LBL_X = ESC_CX + 20, BRANCH_LBL_Y = 440;


const LANE = 22, CORRIDOR_Y = 260;
const W_ATTACH_A = [[CONTENT_CX - LANE, DK_TOP], [CONTENT_CX - LANE, CORRIDOR_Y], [A_CX, CORRIDOR_Y], [A_CX, NODE_BOTTOM]];
const W_ATTACH_B = [[CONTENT_CX + LANE, DK_TOP], [CONTENT_CX + LANE, CORRIDOR_Y], [B_CX, CORRIDOR_Y], [B_CX, NODE_BOTTOM]];
const DK_BOTTOM = DK_Y + DK_H;
// The taint arrives from directly below, on the spine, so it needs no elbow and crosses nothing.
const W_TAINT = [[ESC_CX, ESC_TOP], [ESC_CX, DK_BOTTOM]];
// Rides left of its lane, clear of the branch caption, and under its ball so it parks below the disk.
// It fades in once clear of the escape box it leaves.
const TAINT_TAG = { dx: -51, dy: 22, fn: makeRidingLabel({ role: 'storage', emergeMode: true }), emerge: 250 };
// Trails its ball so it lands under the Node-2 frame, clear of the Pod floor, and fades in once the
// ball is off the disk cap.
const ATTACH_TAG = { dx: 62, dy: 16, fn: makeRidingLabel({ role: 'storage', emergeMode: true }), emerge: 200 };


const podBlock = ({ key, shellKey, innerKey, x, label, sublabel, opacity }) => P.pod({
  key, shellKey, innerKey, x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel, containers: 0,
  inner: { dx: (POD_W - APP_W) / 2, dy: APP_DY, w: APP_W, h: APP_H, label: 'app', sublabel: 'writes PV web' },
  opacity,
});

export const SCENE = {
  'aria-label': 'Detach on Node failure: when a Node goes NotReady and its Kubelet is silent, Kubernetes will not detach the volume immediately, because the old Pod cannot be confirmed dead and detaching while it might still write would let two Nodes write one filesystem, so it waits out the 300 second unreachable toleration and then the roughly six minute force-detach before attaching the disk on a new Node, a deliberate safety property rather than a bug, and the non-graceful node shutdown out-of-service taint is the operator escape hatch that asserts the Node is truly dead and skips the wait',
  parts: [
    P.defs(),
    P.node({ key: 'nodeA', x: A_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'nodeB', x: B_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2' }),
    // Re-centred on the front face below the cap ellipse (STO.L-02).
    P.cylinder({ key: 'disk', x: DK_X, y: DK_Y, w: DK_W, h: DK_H, label: 'PV web RWO', labelY: 61 }),
    P.box({
      key: 'escape', x: ESC_X, y: ESC_Y, w: ESC_W, h: ESC_H,
      label: 'Out-of-service taint', sublabel: 'operator asserts node is dead',
    }),
    podBlock({ key: 'oldPod', shellKey: 'oldShell', innerKey: 'oldBox', x: A_X + NODE_PAD, label: 'Pod web-0 (old)', sublabel: 'Running' }),
    podBlock({ key: 'newPod', shellKey: 'newShell', innerKey: 'newBox', x: B_X + NODE_PAD, label: 'Pod web-0 (new)', sublabel: 'Pending', opacity: 0 }),
    // Both attach lanes are built identically at full colour, deliberately, so neither reads as lesser.
    P.lane({ key: 'wAttachA', points: W_ATTACH_A, dashed: true, dim: false }),
    P.lane({ key: 'wAttachB', points: W_ATTACH_B, dashed: true, dim: false, opacity: 0 }),
    P.lane({ key: 'wTaint', points: W_TAINT, dashed: true, dim: true, opacity: 0 }),
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
        '2. force-detach timeout  ·  ~6 min, then rip attach',
        '3. attach on Node-2  ·  new Pod finally starts',
      ],
    }),
    P.packets(),
  ],
  reset: {
    keys: ['disk', 'escape', 'oldBox', 'newBox', 'nodeChip', 'diskChip', 'podChip'],
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
    opacity: { nodeA: 1, oldPod: 1, newPod: 0, wAttachA: 1, wAttachB: 0, wTaint: 0 },
    lit: ['disk'],
    chain: -1,
  },
  {
    id: 'notready',
    duration: 2600,
    narration: 'Node-1 stops answering. Its Kubelet goes silent and the Node is marked NotReady, but there is no word from Node-1 about whether the old Pod actually stopped. It might be dead. It might be a network blip with the Pod still writing.',
    chipsCued: chips('NotReady', 'attached to Node-1', 'not created'),
    podSublabels: pods('status unknown', 'Pending'),
    // Node-2 stays empty: a ReplicaSet replaces a Pod only once it carries a deletionTimestamp.
    opacity: { oldPod: 1, newPod: 0, wAttachA: 1, wAttachB: 0, wTaint: 0 },
    lit: ['disk'],
    chain: -1,
    // Nothing travels on this step, so the pulse is its only beat.
    flow: [F.pulse({ pod: 'oldPod' })],
  },
  {
    id: 'refuse',
    duration: 3800,
    narration: 'So Kubernetes refuses to detach the disk. Notice what it is not waiting on: no other Pod holds the volume and nothing is contending for it. It is waiting on doubt. Pull PV web off Node-1 while the old Pod might still be writing and two Nodes write one filesystem, which corrupts it. Refusing is the safe answer to a question that cannot be answered.',
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
    duration: 4200,
    narration: 'The clocks start. Node-1 takes the unreachable taint, and the old Pod tolerates it for 300 seconds by default before it is marked for deletion. On a reachable Node that deletes the Pod and frees the volume. Here the deletion cannot be confirmed, so the disk stays held, but the mark lets the Deployment create a replacement on Node-2, stuck in ContainerCreating waiting for that disk.',
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
    id: 'forcedetach',
    duration: 3300,
    narration: 'Then the force-detach timeout, roughly six minutes after that Pod deletion fails to complete. Unless it is disabled in the controller manager, Kubernetes then gives up waiting for Node-1 and rips the attachment away, assuming the old Pod cannot still be running after this long. Only now is the disk free.',
    chipsCued: chips('NotReady', 'force-detached', 'ContainerCreating'),
    podSublabels: pods('assumed gone', 'ContainerCreating'),
    wires: { disk: 'force-detach' },
    opacity: { oldPod: OPACITY.terminated, wAttachA: OPACITY.terminated, newPod: 1 },
    lit: ['disk'],
    chain: 1,
    // Starts at the previous step's shade, never full, or the mark reads as undone for a frame.
    rewind: { opacity: { oldPod: OPACITY.terminating, wAttachA: 1 } },
    // The lane fading with the old Pod carries the severed attachment. The disk does not flash.
    flow: [
      F.fade({ target: 'oldPod', from: OPACITY.terminating, to: OPACITY.terminated, dur: FADE.out, fill: 'forwards', easing: 'ease-in' }),
      F.fade({ target: 'wAttachA', from: 1, to: OPACITY.terminated, dur: FADE.out, fill: 'forwards', easing: 'ease-in' }),
    ],
  },
  {
    id: 'attachb',
    duration: 3400,
    narration: 'With PV web detached, it attaches to Node-2 and is mounted there, and the new Pod finally starts. Nothing in that sequence was slow. The entire outage was the safety margin: the eviction wait and then six more minutes of deliberate doubt about a Node that could not be asked.',
    chipsCued: chips('NotReady', 'attached to Node-2', 'Running'),
    podSublabels: pods('assumed gone', 'Running'),
    opacity: { oldPod: OPACITY.terminated, wAttachA: OPACITY.terminated, wAttachB: 1, newPod: 1 },
    // The disk is lit from entry, since a ball never leaves an unlit block.
    lit: ['disk'],
    chain: 2,
    rewind: { opacity: { wAttachB: 0 } },
    flow: [
      F.fade({ target: 'wAttachB', from: 0, to: 1, dur: 300, fill: 'forwards', easing: 'ease-out' }),
      F.route({ points: W_ATTACH_B, delay: BEAT.lead, tag: { text: 'attach to Node-2', ...ATTACH_TAG }, pulse: 'newPod' }),
    ],
  },
  {
    id: 'escape',
    duration: 3900,
    narration: 'If an operator knows the Node is really dead, both clocks are wasted downtime. Tainting it out-of-service, the non-graceful shutdown escape hatch, tells Kubernetes to stop assuming the Pod might live, so it deletes the Pod and detaches the volume at once. A StatefulSet needs this most: its replacement cannot even be created while the old Pod keeps the name.',
    chipsCued: chips('NotReady, tainted', 'detached at once', 'Running'),
    podSublabels: pods('deleted by taint', 'Running'),
    wires: { disk: 'skip the wait', branch: 'if instead the taint lands first' },
    opacity: { oldPod: OPACITY.terminated, wAttachA: OPACITY.terminated, wAttachB: 1, wTaint: 1, newPod: 1 },
    lit: ['escape'],
    // Deliberately no active rung: this step skips the ladder, it is not rung 3.
    chain: -1,
    rewind: { opacity: { wTaint: 0 } },
    // No Pod acts here, so no pulse. The disk lights on arrival, reduced path included.
    flow: [
      F.fade({ target: 'wTaint', from: 0, to: 1, dur: 300, fill: 'forwards', easing: 'ease-out' }),
      F.route({ points: W_TAINT, delay: BEAT.lead, name: 'taint', tag: { text: 'out-of-service', ...TAINT_TAG } }),
      F.light({ targets: ['disk'], at: 'taint' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
