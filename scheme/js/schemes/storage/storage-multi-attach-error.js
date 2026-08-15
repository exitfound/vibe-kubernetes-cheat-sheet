import { P, F, defineCard, BEAT, FADE, OPACITY, chipStrip, packetArrival } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-multi-attach-error


const LEFT_X = 400;

const NODE_H = 156, BAND_H = 76, VA_H = 76, DK_H = 86, CHIP_H = 34;
const G_NODE_BAND = 56, G_BAND_VA = 56, G_VA_DK = 48, G_DK_CHIPS = 22;

const STACK_H = NODE_H + G_NODE_BAND + BAND_H + G_BAND_VA + VA_H + G_VA_DK + DK_H + G_DK_CHIPS + CHIP_H;
const STACK_TOP = (640 - STACK_H) / 2;                   // 18, and the bottom margin matches it

const NODE_W = 180, NODE_GAP = 40, NODE_PAD = 16;
const NODE_Y = STACK_TOP;                                // 18
const NODE_BOTTOM = NODE_Y + NODE_H;                     // 174
const NODE_A_X = LEFT_X;                                 // 400
const NODE_B_X = LEFT_X + NODE_W + NODE_GAP;             // 620
const CONTENT_W = NODE_W * 2 + NODE_GAP;                 // 400
const CONTENT_CX = LEFT_X + CONTENT_W / 2;               // 600: canvas center, every tier uses it
const CX_B = NODE_B_X + NODE_W / 2;                      // 710, and (490 + 710) / 2 == CONTENT_CX

const POD_W = NODE_W - NODE_PAD * 2;                     // 148
const POD_Y = NODE_Y + 28, POD_H = 102;                  // 46
const POD_A_X = NODE_A_X + NODE_PAD;                     // 416
const POD_B_X = NODE_B_X + NODE_PAD;                     // 636

const APP_DY = 30, APP_H = 44;

const BAND_W = 300;
const BAND_X = CONTENT_CX - BAND_W / 2;                  // 450..750
const BAND_Y = NODE_BOTTOM + G_NODE_BAND;                // 227
const BAND_TOP = BAND_Y, BAND_BOTTOM = BAND_Y + BAND_H;  // 227 / 303
const BAND_MID_Y = BAND_Y + BAND_H / 2;                  // 265: where both output lanes leave
const BAND_LEFT = BAND_X, BAND_RIGHT = BAND_X + BAND_W;  // 450 / 750

const VA_W = 232;                                        // storage family box width, from csi-architecture
const VA_Y = BAND_BOTTOM + G_BAND_VA;                    // 359
const VA_TOP = VA_Y, VA_BOTTOM = VA_Y + VA_H;            // 359 / 435
const VA_A_CX = 420;
const VA_B_CX = 2 * CONTENT_CX - VA_A_CX;                // 780, so the pair centers on CONTENT_CX
const VA_A_X = VA_A_CX - VA_W / 2;                       // 304..536
const VA_B_X = VA_B_CX - VA_W / 2;                       // 664..896

const DK_W = 240;
const DK_Y = VA_BOTTOM + G_VA_DK;                        // 483
const DK_X = CONTENT_CX - DK_W / 2;                      // 480
const DK_SIDE_Y = DK_Y + DK_H / 2;                       // 526
const DK_LEFT = DK_X, DK_RIGHT = DK_X + DK_W;            // 480 / 720

const BAND_LBL_Y = 337;
const CHIPS_Y = DK_Y + DK_H + G_DK_CHIPS;                // 588

const CHIP_W = 232;
const CHIP_GAP = 16;
const CHIP_COUNT = 4;                  // accessModes / attached to / new Pod / blocked by
// Fix the width and the gap, derive the 976 unit span, centre it on CONTENT_CX: 112..1088.
const CHIPS = chipStrip({ cx: CONTENT_CX, w: CHIP_W, gap: CHIP_GAP, count: CHIP_COUNT });

const NODE_BAND_TURN_Y = (NODE_BOTTOM + BAND_TOP) / 2;             // 199
const W_NODE_BAND = [[CX_B, NODE_BOTTOM], [CX_B, NODE_BAND_TURN_Y], [CONTENT_CX, NODE_BAND_TURN_Y], [CONTENT_CX, BAND_TOP]];
const W_BAND_VA_A = [[BAND_LEFT, BAND_MID_Y], [VA_A_CX, BAND_MID_Y], [VA_A_CX, VA_TOP]];
const W_BAND_VA_B = [[BAND_RIGHT, BAND_MID_Y], [VA_B_CX, BAND_MID_Y], [VA_B_CX, VA_TOP]];
const W_VAA_DISK  = [[VA_A_CX, VA_BOTTOM], [VA_A_CX, DK_SIDE_Y], [DK_LEFT, DK_SIDE_Y]];
const W_VAB_DISK  = [[VA_B_CX, VA_BOTTOM], [VA_B_CX, DK_SIDE_Y], [DK_RIGHT, DK_SIDE_Y]];

// The two arrivals the detach step chains on, off the same geometry runFlow reads, for the one call
// that cannot be a flow entry: the unlight note on that step says why it needs a number.
const DEL_LANDS = packetArrival(W_BAND_VA_A, { delay: BEAT.lead });
const DET_LANDS = packetArrival(W_VAA_DISK, { delay: DEL_LANDS + BEAT.afterHop });

// The mirror of lightBoxAt, and it takes its empty keyframe list for the same reason: a timer that
// names a property costs its target a composited layer for the wait. Reasoning is in scheme-kit.js.
function unlightAt(el, ctx, delay) {
  const a = el.animate([], { duration: 1, delay });
  a.onfinish = () => el.classList.remove('highlight');
  ctx.register(a);
}

// node() has no labelY knob the way cylinder does, so the one attribute this card moves is a tune:
// the caption's group-local y 18 drops to 14, titling the frame rather than floating inside it.
const titleNode = (el) => { const l = el.querySelector('.scheme-node-label'); if (l) l.setAttribute('y', 14); };

const pod = (key, innerKey, x, label, sublabel) => P.pod({
  key, innerKey, x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel, containers: 0,
  inner: { dx: 14, dy: APP_DY, w: POD_W - 28, h: APP_H, label: 'app', sublabel: 'uses PV web' },
});

const lane = (key, points) => P.lane({ key, points, dashed: true, dim: true });

// Z-order: the two node frames, then the blocks and the disk, then the Pods so they sit above their
// own frame, then the five lanes and the band caption, then the chip strip, then the packet layer.
export const SCENE = {
  'aria-label': 'A Multi-Attach error. PV web is ReadWriteOnce and attached to Node-1 through VolumeAttachment va-1, so when a replacement Pod lands on Node-2 the attach and detach controller refuses to write va-2. The new Pod hangs in ContainerCreating until the old Pod is deleted and the first attachment goes, which is what stalls a RollingUpdate Deployment.',
  parts: [
    P.defs(),
    P.node({ key: 'nodeA', x: NODE_A_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1', tune: titleNode }),
    P.node({ key: 'nodeB', x: NODE_B_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2', tune: titleNode }),
    P.box({
      key: 'ctrl', x: BAND_X, y: BAND_Y, w: BAND_W, h: BAND_H,
      label: 'Attach/Detach controller', sublabel: 'RWO: one node at a time',
    }),
    P.box({ key: 'vaA', x: VA_A_X, y: VA_Y, w: VA_W, h: VA_H, label: 'VolumeAttachment va-1', sublabel: 'node-1, attached: true' }),
    P.box({ key: 'vaB', x: VA_B_X, y: VA_Y, w: VA_W, h: VA_H, label: 'VolumeAttachment va-2', sublabel: 'wanted, not written' }),
    // The primitive centers the label on the raw bbox, which reads high because the top cap ellipse
    // is not part of the visible front face. Re-center on the face, as the rest of storage does.
    P.cylinder({ key: 'disk', x: DK_X, y: DK_Y, w: DK_W, h: DK_H, label: 'PV web RWO', labelY: DK_H / 2 + 10 }),
    pod('podOld', 'oldApp', POD_A_X, 'Pod web-0 old', 'Running'),
    pod('podNew', 'newApp', POD_B_X, 'Pod web-0 new', 'ContainerCreating'),
    lane('wNodeBand', W_NODE_BAND),
    lane('wBandVaA', W_BAND_VA_A),
    lane('wBandVaB', W_BAND_VA_B),
    lane('wVaADisk', W_VAA_DISK),
    lane('wVaBDisk', W_VAB_DISK),
    P.wire({ key: 'band', x: CONTENT_CX, y: BAND_LBL_Y }),
    P.chip({ key: 'modeChip', x: CHIPS.x(0), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'accessModes', value: 'ReadWriteOnce' }),
    P.chip({ key: 'attChip', x: CHIPS.x(1), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'attached to', value: 'node-1' }),
    P.chip({ key: 'podChip', x: CHIPS.x(2), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'new Pod', value: 'not scheduled' }),
    P.chip({ key: 'blockChip', x: CHIPS.x(3), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'blocked by', value: 'nothing' }),
    P.packets(),
  ],
  reset: {
    keys: ['ctrl', 'vaA', 'vaB', 'disk', 'oldApp', 'newApp',
      'modeChip', 'attChip', 'podChip', 'blockChip'],
    pods: ['podOld', 'podNew'],
  },
};

// STO.S-01 as fields: every element born or removed mid-story, and every lane, is pinned on EVERY
// step, and so is every state line. Nothing below is inherited from the step before it.
const stage = ({
  nodeB = 0,        // node-2 and everything in it: the second claimant does not exist yet
  oldOp = 1, oldSub = 'Running',
  newOp = 0, newSub = 'ContainerCreating',
  vaAOp = 1, vaASub = 'node-1, attached: true',
  // OPACITY.pending is va-2 as a WANT, not an object: the controller refuses before writing, so no
  // va-2 exists through the blocked stretch. A ghost, not a hole, and full only when it is written.
  vaBOp = 0, vaBSub = 'wanted, not written',
  linkA = 1,        // the column-a lanes: controller to va-1, and va-1 down to the disk
  linkB = 0,        // the column-b lanes: only drawn once a ball actually rides them
  linkNew = 0,      // the node-2 request lane: hidden until node-2 exists
} = {}) => ({
  opacity: {
    nodeB, podOld: oldOp, podNew: newOp, vaA: vaAOp, vaB: vaBOp,
    wBandVaA: linkA, wVaADisk: linkA, wBandVaB: linkB, wVaBDisk: linkB, wNodeBand: linkNew,
  },
  sublabels: { vaA: vaASub, vaB: vaBSub },
  podSublabels: { podOld: oldSub, podNew: newSub },
});

// All four chips are written through setChip, so all four are chipsCued. The access mode is not an
// argument: an RWO volume is the premise of the card and never moves.
const chips = (attached, newPod, blocked) => ({
  modeChip: 'ReadWriteOnce', attChip: attached, podChip: newPod, blockChip: blocked,
});

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('node-1', 'not scheduled', 'nothing'),
    ...stage(),
  },
  {
    id: 'reschedule',
    duration: 2600,
    narration: 'Now the Pod moves. A rolling update stands the replacement up on Node-2 while the old one is still running, which is exactly what RollingUpdate is designed to do. Node-1 stays healthy throughout. A second Pod now exists on the other Node, and it wants the same volume.',
    chipsCued: chips('node-1', 'scheduled on node-2', 'nothing'),
    ...stage({ nodeB: 1, newOp: 1 }),
    rewind: { opacity: { nodeB: 0, podNew: 0 } },
    // The node frame and the Pod arrive together as one event, because that is what scheduling onto
    // a second node looks like: the claimant appears, frame and contents at once.
    flow: [
      F.fade({ target: 'nodeB', from: 0, to: 1, dur: FADE.in, delay: 200, fill: 'forwards', easing: 'ease-out' }),
      F.fade({ target: 'podNew', from: 0, to: 1, dur: FADE.in, delay: 200, fill: 'forwards', easing: 'ease-out' }),
      F.pulse({ pod: 'podNew', delay: 300 }),
    ],
  },
  {
    id: 'wantattach',
    duration: 3200,
    narration: 'The attach and detach controller tries to attach the volume to Node-2, which means writing a second VolumeAttachment. The request reaches the controller and stops. PV web is ReadWriteOnce and the first attachment is still live, so the refusal comes before anything is written and va-2 stays a want rather than an object.',
    chipsCued: chips('node-1', 'ContainerCreating', 'va-1 on node-1'),
    wires: { band: 'RWO: cannot attach twice' },
    ...stage({ nodeB: 1, newOp: 1, linkNew: 1, vaBOp: OPACITY.pending }),
    // Both the lane and the want are drawn for the first time on this step, so the animated path
    // starts from the absence the step before it left.
    rewind: { opacity: { wNodeBand: 0, vaB: 0 } },
    flow: [
      // The request lane eases in rather than popping into place, and it finishes arriving before
      // the ball that rides it departs.
      F.fade({ target: 'wNodeBand', from: 0, to: 1, dur: 300, fill: 'forwards', easing: 'ease-out' }),
      // Up-arrow ordering: the Pod blinks first because it is the actor, the request leaves once the
      // blink has landed, and the controller lights when the ball reaches it.
      F.pulse({ pod: 'podNew' }),
      F.route({ points: W_NODE_BAND, delay: BEAT.afterPulse, name: 'req' }),
      F.tag({ text: 'attach node-2', points: W_NODE_BAND, delay: BEAT.afterPulse }),
      F.light({ targets: ['ctrl'], at: 'req' }),
      // The WANT appears at the placeholder shade as the refusal lands, and is never lit: nothing
      // was granted. NOT F.reveal, which lands on full.
      F.fade({ target: 'vaB', from: 0, to: OPACITY.pending, dur: FADE.in, at: 'req', fill: 'forwards', easing: 'ease-out' }),
    ],
  },
  {
    id: 'error',
    duration: 2600,
    // The stuck Pod is the actor, so it pulses and nothing else moves. va-1 lights because it is the
    // blocker: the reader should be looking at the OLD attachment while reading this sentence.
    narration: 'So the new Pod hangs. Its events read Multi-Attach error for volume PV web, already used by the old Pod on Node-1. The container never starts, because Kubelet will not mount a disk that is not attached to the Node it runs on, and the attach is refused.',
    chipsCued: chips('node-1', 'Multi-Attach error', 'va-1 on node-1'),
    wires: { band: 'first attachment still live' },
    ...stage({ nodeB: 1, newOp: 1, newSub: 'Multi-Attach error', linkNew: 1, vaBOp: OPACITY.pending }),
    lit: ['vaA'],
    flow: [
      F.pulse({ pod: 'podNew' }),
    ],
  },
  {
    id: 'wait',
    duration: 2800,
    narration: 'What clears it is the old attachment going away, and nothing else will. The controller will not delete va-1 while the old Pod runs, and the rollout will not delete that Pod until the new one is ready. Each side waits on the other, which is why this reads as a hang.',
    chipsCued: chips('node-1', 'Multi-Attach error', 'old Pod running'),
    wires: { band: 'each side waits for the other' },
    ...stage({
      nodeB: 1, newOp: 1, newSub: 'Multi-Attach error', linkNew: 1, vaBOp: OPACITY.pending,
      vaASub: 'node-1, still held',
    }),
    lit: ['vaA'],
  },
  {
    id: 'detach',
    duration: 3400,
    narration: 'Nothing inside the rollout can break the deadlock, so it takes a hand from outside: the old Pod is deleted. The controller removes va-1, the volume detaches, and for a moment it belongs to nobody. On a healthy Node this takes seconds, because Node-1 can be asked to unmount and it answers.',
    chipsCued: chips('nothing', 'Multi-Attach error', 'nothing'),
    wires: { band: 'delete va-1, then detach' },
    // Static end state: va-1 and its lanes are gone, the old Pod with them, the disk is free.
    ...stage({
      nodeB: 1, oldOp: OPACITY.terminated, oldSub: 'deleted',
      newOp: 1, newSub: 'Multi-Attach error', linkNew: 1, vaBOp: OPACITY.pending,
      vaAOp: OPACITY.terminated, vaASub: 'deleted', linkA: OPACITY.terminated,
    }),
    lit: ['ctrl'],
    // Everything this step tears down stands at full when the animated path starts, and the four
    // fades below are what take it away.
    rewind: { opacity: { vaA: 1, wBandVaA: 1, wVaADisk: 1, podOld: 1 } },
    flow: [
      F.route({ points: W_BAND_VA_A, delay: BEAT.lead, name: 'del' }),
      F.tag({ text: 'delete va-1', points: W_BAND_VA_A, delay: BEAT.lead }),
      // va-1's cue is an F.set, not `lights`, because the reduced path must not show it: the
      // unlight below takes it off again before the step settles.
      F.set({ on: 'vaA', lit: ['vaA'], at: 'del' }),
      F.route({ points: W_VAA_DISK, after: 'del', name: 'det' }),
      F.tag({ text: 'detach', points: W_VAA_DISK, after: 'del' }),
      F.light({ targets: ['disk'], at: 'det' }),
      ...['vaA', 'wBandVaA', 'wVaADisk', 'podOld'].map(target => F.fade({
        target, from: 1, to: OPACITY.terminated, dur: FADE.out, at: 'det', fill: 'forwards', easing: 'ease-in',
      })),
      // A deleted object must not keep the border that means "acting now", and no field REMOVES a
      // highlight: F.fade({ unlight }) would drop the empty 1ms timer that carries it on va-1.
      F.run({ fn: (s, ctx) => unlightAt(s.refs.vaA, ctx, DET_LANDS + FADE.out) }),
    ],
  },
  {
    id: 'attach',
    duration: 3800,
    narration: 'With the volume free the controller writes va-2, the driver attaches the disk to Node-2, Kubelet mounts it, and the new Pod starts. None of that was slow. The whole stall went on waiting for the old Pod to be deleted, not on any storage operation.',
    chipsCued: chips('node-2', 'Running', 'nothing'),
    wires: { band: 'now attach to node-2' },
    ...stage({
      nodeB: 1, oldOp: OPACITY.terminated, oldSub: 'deleted',
      newOp: 1, newSub: 'Running', linkNew: 1,
      vaAOp: OPACITY.terminated, vaASub: 'deleted', linkA: OPACITY.terminated,
      vaBOp: 1, vaBSub: 'node-2, attached: true', linkB: 1,
    }),
    // Lit from entry for the same reason as the step before: the controller is where the write
    // comes from, so it cannot be dark while a ball is leaving it.
    lit: ['ctrl'],
    flow: [
      F.route({ points: W_BAND_VA_B, delay: BEAT.lead, name: 'wr' }),
      F.tag({ text: 'write va-2', points: W_BAND_VA_B, delay: BEAT.lead }),
      // This is the step that actually creates va-2, so it rises from the want to the object as the
      // write lands rather than being at full strength before the ball has left.
      F.reveal({ target: 'vaB', from: OPACITY.pending, at: 'wr' }),
      F.light({ targets: ['vaB'], at: 'wr' }),
      F.route({ points: W_VAB_DISK, after: 'wr', name: 'att' }),
      F.tag({ text: 'attach', points: W_VAB_DISK, after: 'wr' }),
      F.light({ targets: ['disk'], at: 'att' }),
      F.pulse({ pod: 'podNew', after: 'att' }),
    ],
  },
  {
    id: 'fix',
    duration: 3400,
    narration: 'This is why a Deployment on ReadWriteOnce storage stalls whenever the replacement Pod lands on another Node. RollingUpdate creates the new Pod before deleting the old one, so both want one single-node volume and the new one is refused. Set it to Recreate, which deletes the old Pod before making the new one, the way a StatefulSet handles an ordinal.',
    chipsCued: chips('node-2', 'Running', 'nothing'),
    wires: { band: 'Recreate, not RollingUpdate' },
    ...stage({
      nodeB: 1, oldOp: OPACITY.terminated, oldSub: 'deleted',
      newOp: 1, newSub: 'Running', linkNew: 1,
      vaAOp: OPACITY.terminated, vaASub: 'deleted', linkA: OPACITY.terminated,
      vaBOp: 1, vaBSub: 'node-2, attached: true', linkB: 1,
    }),
    lit: ['vaB', 'disk'],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
