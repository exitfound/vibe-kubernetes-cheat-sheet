import { P, F, defineCard, chipStrip, BEAT, OPACITY } from './storage-kit.js';
import { pod } from '../../lib/primitives.js';
// Design notes for this card: ./CARDS.md#storage-ephemeral-storage-eviction


const NODE_X = 210, NODE_Y = 45, NODE_W = 780, NODE_H = 485; // 210..990, canvas-centered

// The longest narration in the storage set: the panel reaches x<=397 down to y=355, so both upper
// tiers live right of it and the column centre is 620 rather than the canvas 600.
const COL_CX = 620;

const POD_X = COL_CX - 145, POD_Y = 85, POD_W = 290, POD_H = 150; // 475..765

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
// Uniform chip strip: three 250 wide chips on a 15 gap, centred on the canvas, so the strip spans
// exactly the node width (210..990) and lines up with the node block above it.
const STRIP = chipStrip({ w: 250, gap: 15, count: 3 });   // 210 / 475 / 740

// Each static wire and its ball share one array. The three contributors all consume the node disk,
// each dropping straight down its own center line onto the disk top.
const W_WD = [[WR_CX, CB_BOTTOM], [WR_CX, DISK_TOP]];
const W_ED = [[ED_CX, CB_BOTTOM], [ED_CX, DISK_TOP]];
const W_LD = [[LG_CX, CB_BOTTOM], [LG_CX, DISK_TOP]];

// Bare pod() rather than podShell(), so the neighbours carry no wash and read as background actors.
// No part kind draws that, hence P.raw. The wrapping g is what pulsePod takes.
const neighbour = (gKey, key, y, label, sublabel) => P.group({
  key: gKey,
  parts: [P.raw({
    key,
    make: () => pod({ x: PB_X, y, w: OP_W, h: OP_H, label, sublabel, containers: 0, role: 'storage' }),
  })],
});

// Z-order (bottom -> top): node, then blocks and disk, then wires and labels above them, then the
// chip strip, then the packet layer so every ball rides above everything.
export const SCENE = {
  'aria-label': 'Ephemeral storage limits: a container filling the Node disk with its writable layer, emptyDir and logs. The per-Pod path evicts the Pod the moment those sum past its limits.ephemeral-storage. The separate node-wide path is disk pressure: when the Node filesystem crosses its threshold Kubelet reports the DiskPressure condition and the control plane taints the Node, and Kubelet evicts Pods ranked by whether each is over its ephemeral-storage request, then by Pod Priority and by how far over it sits.',
  parts: [
    P.defs(),
    P.node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.pod({
      key: 'focusPod', innerKey: 'focusBox', x: POD_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Pod app-0', sublabel: 'req 512Mi · within', containers: 0,
      inner: { dx: 22, dy: 46, w: POD_W - 44, h: 58, label: 'app', sublabel: 'writes logs and temp' },
    }),
    P.box({ key: 'bWrite', x: WR_X, y: CB_Y, w: CB_W, h: CB_H, label: 'Writable', sublabel: 'layer' }),
    P.box({ key: 'bEmpty', x: ED_X, y: CB_Y, w: CB_W, h: CB_H, label: 'emptyDir', sublabel: 'scratch' }),
    P.box({ key: 'bLogs', x: LG_X, y: CB_Y, w: CB_W, h: CB_H, label: 'Logs', sublabel: 'stdout' }),
    // The block and its chip are both titled NodeFS, matching the cylinder in storage-csi-architecture,
    // so the same object is never named two ways across the storage set.
    P.cylinder({ key: 'disk', x: DISK_X, y: DISK_Y, w: DISK_W, h: DISK_H, label: 'NodeFS' }),
    neighbour('otherBG', 'otherB', PB_Y, 'pod-b', 'no request'),
    neighbour('otherCG', 'otherC', PC_Y, 'pod-c', 'req 1Gi · over'),
    P.relation({ points: [[DISK_X + 10, THRESH_Y], [DISK_X + DISK_W - 10, THRESH_Y]], dash: '4 4' }),
    P.lane({ points: W_WD, dashed: true, dim: true }),
    P.lane({ points: W_ED, dashed: true, dim: true }),
    P.lane({ points: W_LD, dashed: true, dim: true }),
    P.tag({ x: DISK_X + DISK_W + 8, y: THRESH_Y + 4, anchor: 'start', text: 'eviction threshold' }),
    // The taint note sits centered over the main column between the node top edge and the Pod top
    // (the top-right corner belongs to the node tag). The rank note sits under the neighbours.
    P.wire({ key: 'taint', x: ED_CX, y: 72 }),
    // Right-aligned on the neighbour column, in the 19 unit band under it. Measured, and tight:
    // see ./CARDS.md.
    P.wire({ key: 'rank', x: PB_X + OP_W, y: 262, anchor: 'end' }),
    P.chip({ key: 'usageChip', x: STRIP.x(0), y: CHIPS_Y, w: STRIP.w, h: 34, name: 'usage', value: 'writable + emptyDir + logs' }),
    P.chip({ key: 'limitChip', x: STRIP.x(1), y: CHIPS_Y, w: STRIP.w, h: 34, name: 'limit', value: '1Gi' }),
    P.chip({ key: 'nodeChip', x: STRIP.x(2), y: CHIPS_Y, w: STRIP.w, h: 34, name: 'NodeFS', value: 'below threshold' }),
    P.packets(),
  ],
  reset: {
    keys: ['bWrite', 'bEmpty', 'bLogs', 'disk', 'focusBox', 'otherB', 'otherC',
      'usageChip', 'limitChip', 'nodeChip'],
    pods: ['focusPod', 'otherBG', 'otherCG'],
  },
};

// The three chips go through setVal, not setChip, so a changed value never lights on its own: every
// highlight on this card is placed by hand.
const chips = (usage, limit, nodefs) => ({ usageChip: usage, limitChip: limit, nodeChip: nodefs });
const SOURCES = 'writable + emptyDir + logs';
// STO.S-01 as a field: two steps ghost a Pod, so every step states all three at their own opacity.
const ALL_UP = { focusPod: 1, otherB: 1, otherC: 1 };

const TAINT = 'taint: node.kubernetes.io/disk-pressure';

// The disk carries only its static step highlight (no flash), the taint fades in after it. Its
// label lives in refs.wires, which no opacity field and no F.reveal can reach, hence the F.run.
const revealTaint = (s, ctx) => {
  s.refs.wires.taint.style.opacity = '0';
  ctx.register(s.refs.wires.taint.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 500, fill: 'forwards', easing: 'ease-out' }));
};

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: chips(SOURCES, '1Gi', 'below threshold'),
    opacity: ALL_UP,
  },
  {
    id: 'sources',
    duration: 3000,
    narration: 'The Pod ephemeral usage is the sum of three things on the Node disk: what its writable layer holds, what it wrote to an emptyDir, and the container logs. Kubelet adds them up continuously as the container runs.',
    chips: chips(SOURCES, '1Gi', 'filling'),
    opacity: ALL_UP,
    lit: ['nodeChip', 'bWrite', 'bEmpty', 'bLogs'],
    // The container is doing the writing, so the Pod pulses first. The three lanes are the same
    // 78 unit drop, so all three balls arrive together and the disk cue rides the last of them.
    flow: [
      F.pulse({ pod: 'focusPod' }),
      F.route({ points: W_WD, delay: BEAT.afterPulse }),
      F.route({ points: W_ED, delay: BEAT.afterPulse }),
      F.route({ points: W_LD, delay: BEAT.afterPulse, lights: ['disk'] }),
    ],
  },
  {
    id: 'request',
    duration: 2200,
    narration: 'The requests.ephemeral-storage value is what the Pod reserves on the Node when it is placed, the same way it reserves CPU and memory. The Pod lands only on a Node with room for that request, but the request alone does not cap what it may actually use.',
    chips: chips('not capped by request', '1Gi', 'filling'),
    opacity: ALL_UP,
    lit: ['usageChip', 'focusBox'],
    flow: [F.pulse({ pod: 'focusPod' })],
  },
  {
    id: 'podLimit',
    duration: 2800,
    narration: 'The limits.ephemeral-storage value does cap it. The moment the writable layer plus emptyDir plus logs go over the limit, Kubelet evicts this one Pod, right away and regardless of how healthy the Node is. This is the per-Pod path, and it only ever touches the Pod that overran.',
    chips: chips('over 1Gi', '1Gi exceeded, evicted', 'below threshold'),
    // It is the SUM of the three contributors that crosses the per-Pod limit, so all three light
    // (matching the narration), each sending its ball down onto the disk like the sources step.
    lit: ['limitChip', 'nodeChip', 'usageChip', 'bWrite', 'bEmpty', 'bLogs'],
    // This Pod is evicted by the end of the step, so terminal opacity is the static end-state and
    // the animated path alone winds it back to full to play the fade.
    opacity: { ...ALL_UP, focusPod: OPACITY.terminating },
    rewind: { opacity: { focusPod: 1 } },
    flow: [
      F.pulse({ pod: 'focusPod' }),
      F.route({ points: W_WD, delay: BEAT.afterPulse }),
      F.route({ points: W_ED, delay: BEAT.afterPulse }),
      F.route({ points: W_LD, delay: BEAT.afterPulse, name: 'land' }),
      F.tag({ text: 'over limit', points: W_ED, delay: BEAT.afterPulse }),
      F.light({ targets: ['disk'], at: 'land' }),
      // Once the summed usage crosses the limit, kubelet evicts this Pod: it fades to terminal.
      F.fade({ target: 'focusPod', to: OPACITY.terminating, dur: 600, at: 'land', plus: 150, fill: 'forwards' }),
    ],
  },
  {
    id: 'diskPressure',
    duration: 2600,
    narration: 'The second path is node-wide. When actual usage of the Node filesystem crosses the eviction threshold, Kubelet reports the DiskPressure condition on the Node and the node controller taints it, no matter whose data filled the disk.',
    chips: chips('within its own limit', '1Gi', 'over threshold'),
    opacity: ALL_UP,
    lit: ['limitChip', 'nodeChip', 'usageChip', 'disk'],
    wires: { taint: TAINT },
    flow: [F.run({ fn: revealTaint })],
  },
  {
    id: 'rankEvict',
    duration: 2600,
    narration: 'Now Kubelet has to reclaim space, so it ranks the Pods for eviction. The Pods using more ephemeral storage than they requested go first, ordered by Pod Priority and then by how far over the request each one sits. A Pod that declared no ephemeral-storage request is over the moment it writes anything, so pod-b goes first, then pod-c which sits over its own 1Gi, while app-0 stays within its request and goes last. QoS class is derived from CPU and memory alone, so it does not decide this order. A Pod with no offending usage of its own can still be taken here.',
    chips: chips('within its own limit', '1Gi', 'reclaiming space'),
    // pod-b declared no ephemeral-storage request, so it is over the moment it writes: evicted
    // first, and the terminal opacity is the end-state for both of them.
    opacity: { ...ALL_UP, otherB: OPACITY.terminating, otherC: OPACITY.terminating },
    rewind: { opacity: { otherB: 1, otherC: 1 } },
    lit: ['nodeChip', 'disk', 'otherB'],
    wires: { taint: TAINT, rank: 'over request first, then Priority' },
    // The ranking plays as a sequence: kubelet picks pod-b (pulse), evicts it (fade out), then
    // turns to pod-c (pulse) which dims as next in line. app-0 is within its request, so it stays.
    flow: [
      F.pulse({ pod: 'otherBG' }),
      F.fade({ target: 'otherB', to: OPACITY.terminating, dur: 600, delay: BEAT.afterPulse, fill: 'forwards' }),
      F.pulse({ pod: 'otherCG', delay: 1000 }),
      F.fade({ target: 'otherC', to: OPACITY.terminating, dur: 600, delay: 1000 + BEAT.afterPulse, fill: 'forwards' }),
    ],
  },
  {
    id: 'distinct',
    duration: 2400,
    narration: 'So keep the two apart. A per-Pod limit is a promise about one Pod, enforced on that Pod alone. Node DiskPressure is a whole-node emergency that evicts by Pod Priority and by how far each Pod is over its request, and can take out a Pod that was well within its own limit.',
    chips: chips(SOURCES, 'per-Pod limit', 'node-wide pressure'),
    // BOTH neighbours stay where the ranking left them: it took pod-b and then pod-c, and no narration
    // here brings either back, so both carry the terminating shade rather than one of them.
    opacity: { ...ALL_UP, otherB: OPACITY.terminating, otherC: OPACITY.terminating },
    // Recap both paths side by side: the Pod pool is the per-Pod limit actor, the node disk is the
    // node-wide pressure actor, so both light while the summary plays.
    lit: ['limitChip', 'nodeChip', 'usageChip', 'focusBox', 'disk'],
    flow: [F.pulse({ pod: 'focusPod' })],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
