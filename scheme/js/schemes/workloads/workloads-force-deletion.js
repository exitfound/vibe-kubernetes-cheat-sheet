import { P, F, defineCard, ladder, midX, WL, LAYOUT, FADE, BEAT, OPACITY } from './workloads-kit.js';
import { path } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/workloads-force-deletion.md

// RECORD OVER REALITY, not the A / B / C column preset: the top half is what the API holds and the
// bottom half is what is actually running, joined by the one channel that keeps them equal. That
// channel is the subject, so it is drawn and then broken.
// Panel worst case x<=397, y<=280; a longer narration invalidates that measurement.
const PANEL_B = 280;

// Actor row, right of the panel wall. kubectl stops at the API (A-09): everything below the API is
// that write taking effect, and the record slot is the API state the Kubelet watches.
const TOP1_X = 420, TOP1_W = 220;
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = 220;  // 700..920
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;                  // 80
const TOP2_CX = TOP2_X + TOP2_W / 2;                     // 810
const WIRE_TOP_X = midX(TOP1_X + TOP1_W, TOP2_X);
const WIRE_TOP_Y = WL.TOP_Y - 12;                        // above the actor row, WL.A-02
// The call kubectl makes. ONE pair of endpoints feeds the drawn arrow and the ball on it (A-02), so
// the two cannot drift: a top hop with no arrow under it is a ball crossing blank canvas (A-01).
const CALL = [[TOP1_X + TOP1_W, TOP_CY], [TOP2_X, TOP_CY]];
const CALL_HOP = { from: CALL[0][0], to: CALL[1][0], y: TOP_CY };

// The record slot: one identity of a StatefulSet, drawn as a frame with the stored object inside
// it. Centred on the spine, because both Nodes below relate to it. It carries no box label of its
// own: box() centres a label on the box, which is where the occupant sits, so the caption is a tag.
const SLOT_W = 360, SLOT_X = WL.SPINE_X - SLOT_W / 2;    // 420..780
const SLOT_Y = 170, SLOT_H = 110;                        // 170..280, its bottom on the panel bottom
const SLOT_CY = SLOT_Y + SLOT_H / 2;                     // 225
const SLOT_R = SLOT_X + SLOT_W;                          // 780
const CAP_X = WL.SPINE_X, CAP_Y = SLOT_Y + 24;           // the caption, centred over its occupant
const OBJ_W = 280, OBJ_X = WL.SPINE_X - OBJ_W / 2;       // 460..740
const OBJ_Y = 210, OBJ_H = 56;                           // 210..266, clear of the caption above it

// The write reaching the store: down off the API, across, into the slot's top face.
const JOG_Y = WL.TOP_BOTTOM + 25;                        // 145, below the boxes, above the slot
const WRITE = [[TOP2_CX, WL.TOP_BOTTOM], [TOP2_CX, JOG_Y], [WL.SPINE_X, JOG_Y], [WL.SPINE_X, SLOT_Y]];
const WIRE_WRITE_X = midX(WL.SPINE_X, TOP2_CX), WIRE_WRITE_Y = JOG_Y - 12;

// Chips as a column in the left band, which only opens below the panel.
const CHIP_GAP = 8;
const CHIPS_TOP = PANEL_B + 20;                          // 300
const CHIP_X = LAYOUT.B.chips.x, CHIP_W = LAYOUT.B.chips.w;    // 60..540
const CHIP_Y = ladder({ y: CHIPS_TOP, rowH: WL.CHIP_H, gap: CHIP_GAP });   // 300..460

const NODE_H = 134, CANVAS_B = 624;
const NODE_Y = CANVAS_B - NODE_H;                        // 490..624, the frames rest on the floor
const POD_W = 300, POD_H = 106;
const POD_Y = NODE_Y + (NODE_H - POD_H) / 2;             // 504..610, centred in the frame
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };

// Two Node frames side by side, the pair filling the content width so it centres on CX.
const NODE_GAP = 40;
const N_W = (WL.W - NODE_GAP) / 2;                       // 520
const N_A_X = WL.L, N_B_X = WL.L + N_W + NODE_GAP;       // 60..580 / 620..1140
const P_A_X = N_A_X + (N_W - POD_W) / 2;                 // 170
const P_B_X = N_B_X + (N_W - POD_W) / 2;                 // 730
// The Pods are mirrored about CX, which is what puts each one under its own frame midpoint.
const N_A_CX = N_A_X + N_W / 2, N_B_CX = N_B_X + N_W / 2;       // 320 / 880, the frame top midpoints

// The acknowledgement channel. NOTHING rides it on this card, which is the whole subject, so it is
// a relation and carries no arrowhead (A-05). It leaves the slot's bottom face and ends on Node-1's
// FRAME face (WL.A-03), through the 30 unit corridor the chip column's bottom at 460 leaves open.
const BUS_Y = NODE_Y - 15;                               // 475, between the chip column and the frames
const ACK = [[WL.SPINE_X, SLOT_Y + SLOT_H], [WL.SPINE_X, BUS_Y], [N_A_CX, BUS_Y], [N_A_CX, NODE_Y]];
// The break: a cross ON the dead channel. It is a MARK over a lane rather than a segment of one, so
// L-09 does not reach it: that rule reads `.scheme-arrow` and this carries the label class.
const CUT_CY = 373, CUT_R = 11;
const CUT_D = `M ${WL.SPINE_X - CUT_R} ${CUT_CY - CUT_R} L ${WL.SPINE_X + CUT_R} ${CUT_CY + CUT_R}`
  + ` M ${WL.SPINE_X + CUT_R} ${CUT_CY - CUT_R} L ${WL.SPINE_X - CUT_R} ${CUT_CY + CUT_R}`;
const ACK_CAP_X = WL.SPINE_X + 26, ACK_CAP_Y = 330;      // right of the ticks, left of the Node-2 lane

// The replacement leaves the slot's RIGHT face and drops into Node-2, so it shares no corridor with
// the dead channel: the two things this card compares never run down the same line.
const RECREATE = [[SLOT_R, SLOT_CY], [N_B_CX, SLOT_CY], [N_B_CX, NODE_Y]];
const WIRE_NEW_X = N_B_CX + 12, WIRE_NEW_Y = 300;

// Z-order: the four channels and their labels, the break, the chip column and the packet layer,
// then the Nodes, the Pods, the slot and the actor row above the ball.
export const SCENE = {
  'aria-label': 'Force deletion and stuck Terminating Pods: the Pod object in ETCD and the container on the Node are kept equal by the Kubelet acknowledgement alone, and when that channel is lost the object cannot leave ETCD, so a force delete clears the record while the container may still be running',
  parts: [
    P.defs(),
    P.arrow({ key: 'callLane', from: CALL[0], to: CALL[1], dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'writeLane', points: WRITE, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'recreateLane', points: RECREATE, dim: true, dashed: true, role: 'cluster' }),
    P.relation({ key: 'ackLane', points: ACK, role: 'cluster' }),
    P.raw({ key: 'breakMark', opacity: 0, make: () => path({ class: 'scheme-label dim', d: CUT_D, fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }) }),
    P.tag({ x: ACK_CAP_X, y: ACK_CAP_Y, anchor: 'start', text: 'Kubelet ack: the one thing' }),
    P.tag({ x: ACK_CAP_X, y: ACK_CAP_Y + 18, anchor: 'start', text: 'that removes the object' }),
    P.wire({ key: 'req', x: WIRE_TOP_X, y: WIRE_TOP_Y }),
    P.wire({ key: 'write', x: WIRE_WRITE_X, y: WIRE_WRITE_Y }),
    P.wire({ key: 'recreate', x: WIRE_NEW_X, y: WIRE_NEW_Y, anchor: 'start' }),
    P.chip({ key: 'recordChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'ETCD record', value: '1 object · Pod A Running' }),
    P.chip({ key: 'realityChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'containers running', value: '1 · Node-1, confirmed' }),
    P.chip({ key: 'identityChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'identity web-0', value: 'held by Pod A' }),
    P.chip({ key: 'focusChip', x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'focus', value: 'none' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.node({ key: 'node1', x: N_A_X, y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'node2', x: N_B_X, y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-2' }),
    P.pod({
      key: 'podOld', id: 'podOld', innerKey: 'podOldBox',
      x: P_A_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod A', sublabel: '', containers: 0,
      // No build-time opacity: every step pins Pod A's own, and the poster frame is `idle`.
      inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: 'the running process' },
    }),
    P.pod({
      key: 'podNew', id: 'podNew', innerKey: 'podNewBox',
      x: P_B_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod B', sublabel: '', containers: 0,
      // Born invisible: the replacement does not exist until the identity is freed.
      opacity: 0,
      inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: 'recreated replica' },
    }),
    // The slot frame carries no label of its own, so the caption sits inside it as a tag.
    P.box({ key: 'slot', x: SLOT_X, y: SLOT_Y, w: SLOT_W, h: SLOT_H, role: 'cluster' }),
    P.tag({ x: CAP_X, y: CAP_Y, anchor: 'middle', text: 'ETCD · StatefulSet identity web-0' }),
    P.box({ key: 'obj', x: OBJ_X, y: OBJ_Y, w: OBJ_W, h: OBJ_H, label: 'Pod A', sublabel: 'Running', role: 'cluster' }),
    P.box({ key: 'kubectl', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'kubectl', sublabel: 'delete pod pod-a', role: 'cluster' }),
    P.box({ key: 'api', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API server', sublabel: 'the stored object', role: 'cluster' }),
  ],
  reset: {
    keys: ['kubectl', 'api', 'slot', 'obj', 'recordChip', 'realityChip', 'identityChip', 'focusChip', 'podOldBox', 'podNewBox'],
    pods: ['podOld', 'podNew'],
  },
};

// Node-1 and everything pinned to it move as one: the frame, the Pod inside it and the dead channel
// that ends on the frame face, whose shade is the min of its two ends (A-13).
const node1At = (v) => ({ node1: v, podOld: v, ackLane: v });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { recordChip: '1 object · Pod A Running', realityChip: '1 · Node-1, confirmed', identityChip: 'held by Pod A', focusChip: 'none' },
    labels: { obj: 'Pod A' },
    sublabels: { obj: 'Running' },
    opacity: { ...node1At(1), podNew: 0, breakMark: 0, obj: 1 },
  },
  {
    id: 'silent',
    duration: 3200,
    narration: 'Node-1 stops posting Kubelet heartbeats, from a kernel panic, a power loss or a network partition. After node-monitor-grace-period, 50s by default, the Ready condition goes to Unknown and Node-1 is marked NotReady. What goes with it is the acknowledgement channel, the one thing that keeps the stored object and the running container in step.',
    chips: { recordChip: '1 object · Pod A Running', realityChip: '1 · Node-1, unconfirmed', identityChip: 'held by Pod A', focusChip: 'ack channel lost' },
    labels: { obj: 'Pod A' },
    sublabels: { obj: 'Running' },
    opacity: { ...node1At(OPACITY.notready), podNew: 0, breakMark: 1, obj: 1 },
    // Both chips are cued by the `F.set` at the cut and by nothing else, so the reduced path is
    // told by name: a static `lit` would glow at t=0 over the value the cut has not changed yet.
    reducedLit: ['realityChip', 'focusChip'],
    // The severance IS the step, so nothing may be dim at t=0: the channel is cut first, and Node-1
    // and the Pod pinned to it fall back only once the cut has landed. The two chips the cut earns
    // wind back with it, or they read the loss a beat before it is drawn (P-03).
    rewind: { opacity: { ...node1At(1), breakMark: 0 }, chips: { realityChip: '1 · Node-1, confirmed', focusChip: 'none' } },
    flow: [
      F.fade({ target: 'breakMark', from: 0, to: 1, dur: FADE.in, fill: 'both', easing: 'ease-out', name: 'cut' }),
      F.fade({ target: 'node1', from: 1, to: OPACITY.notready, dur: FADE.out, at: 'cut', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'podOld', from: 1, to: OPACITY.notready, dur: FADE.out, at: 'cut', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'ackLane', from: 1, to: OPACITY.notready, dur: FADE.out, at: 'cut', fill: 'both', easing: 'ease-in' }),
      F.set({ at: 'cut', chips: { realityChip: '1 · Node-1, unconfirmed', focusChip: 'ack channel lost' }, lit: ['realityChip', 'focusChip'] }),
    ],
  },
  {
    id: 'terminating',
    duration: 3200,
    narration: 'A delete is issued for Pod A, by hand here and automatically once a lost Node is written off. The API stamps metadata.deletionTimestamp on the stored object, so kubectl prints Terminating. Normally the Kubelet stops the container and reports back, and that report is what lets the API drop the object. Here nothing reports back.',
    chips: { recordChip: '1 object · deletionTimestamp set', realityChip: '1 · Node-1, unconfirmed', identityChip: 'held by Pod A', focusChip: 'delete stamped, no ack possible' },
    wires: { req: 'DELETE .../pods/pod-a', write: 'deletionTimestamp' },
    labels: { obj: 'Pod A' },
    sublabels: { obj: 'Terminating' },
    opacity: { ...node1At(OPACITY.notready), podNew: 0, breakMark: 1, obj: 1 },
    lit: ['kubectl'],
    // What an F.set lights on arrival is invisible to flowLights, which reads `lights` alone, so
    // the reduced path is told by name (S-17, S-16 HIGHLIGHT).
    reducedLit: ['recordChip', 'obj', 'focusChip'],
    // The stamp lands on the record, so the record says Running until the ball gets there.
    rewind: { sublabels: { obj: 'Running' }, chips: { recordChip: '1 object · Pod A Running', focusChip: 'ack channel lost' } },
    flow: [
      F.top({ ...CALL_HOP, delay: BEAT.lead, name: 'call', lights: ['api'] }),
      F.route({ points: WRITE, after: 'call', name: 'write', lights: ['slot'] }),
      F.set({ at: 'write', sublabels: { obj: 'Terminating' }, chips: { recordChip: '1 object · deletionTimestamp set', focusChip: 'delete stamped, no ack possible' }, lit: ['obj', 'recordChip', 'focusChip'] }),
    ],
  },
  {
    id: 'stuck',
    duration: 3200,
    narration: 'Pod A is stuck in Terminating with no time limit, while status.phase stays Running. The StatefulSet creates no replacement, because the sticky identity web-0 and its RWO volume are still held by the object nobody removed. A leftover metadata.finalizers entry produces the same stuck Terminating, and there the fix is clearing the finalizer rather than reaching for force.',
    chips: { recordChip: '1 object · Terminating, no ack', realityChip: '1 · Node-1, unconfirmed', identityChip: 'held, replacement blocked', focusChip: 'no time limit on this' },
    labels: { obj: 'Pod A' },
    sublabels: { obj: 'Terminating' },
    opacity: { ...node1At(OPACITY.notready), podNew: 0, breakMark: 1, obj: 1 },
    // Nothing travels and no Pod acts, so the deadlock carries its beat with the highlight alone
    // (M-27): the object that cannot leave, the identity it holds and the two chips reading it.
    lit: ['obj', 'identityChip', 'focusChip', 'recordChip'],
  },
  {
    id: 'force',
    duration: 3400,
    narration: 'Running kubectl delete pod pod-a --grace-period=0 --force tells the API to drop the object from ETCD at once, with no wait for any acknowledgement. The slot empties and the identity is free. Notice what did not happen: nothing was sent to Node-1 and nothing ran there, so the record now reads zero while the container it described may still be running.',
    chips: { recordChip: '0 objects · dropped from ETCD', realityChip: '1 · Node-1, unconfirmed', identityChip: 'free', focusChip: 'record cleared, reality untouched' },
    wires: { req: 'DELETE .../pods/pod-a · gracePeriodSeconds=0', write: 'remove from ETCD' },
    labels: { obj: 'Pod A' },
    sublabels: { obj: 'Terminating' },
    opacity: { ...node1At(OPACITY.notready), podNew: 0, breakMark: 1, obj: 0 },
    lit: ['kubectl'],
    reducedLit: ['recordChip', 'identityChip', 'focusChip'],
    // The object is on screen until the drop lands on it, and the two chips it owns turn over on
    // the same beat: the record is what changes here, and nothing else does.
    rewind: { opacity: { obj: 1 }, chips: { recordChip: '1 object · Terminating, no ack', identityChip: 'held, replacement blocked', focusChip: 'no time limit on this' } },
    flow: [
      F.top({ ...CALL_HOP, delay: BEAT.lead, name: 'call', lights: ['api'] }),
      F.route({ points: WRITE, after: 'call', name: 'drop', lights: ['slot'] }),
      F.fade({ target: 'obj', from: 1, to: 0, dur: FADE.out, at: 'drop', fill: 'both', easing: 'ease-in' }),
      F.set({ at: 'drop', chips: { recordChip: '0 objects · dropped from ETCD', identityChip: 'free', focusChip: 'record cleared, reality untouched' }, lit: ['recordChip', 'identityChip', 'focusChip'] }),
    ],
  },
  {
    id: 'split',
    duration: 3800,
    narration: 'The StatefulSet takes the freed identity and creates Pod B on Node-2. If Node-1 was only network-partitioned, its Kubelet is alive and the original container is still running and still writing. One identity now has two live writers, which is how the volume gets corrupted. Force-delete only once the Node is confirmed dead, or delete the Node object and let the garbage collector clear its Pods.',
    chips: { recordChip: '1 object · Pod B Running', realityChip: '2 · Node-2 live, Node-1 unconfirmed', identityChip: 'held twice', focusChip: 'split-brain hazard' },
    wires: { recreate: 'StatefulSet creates Pod B' },
    labels: { obj: 'Pod B' },
    sublabels: { obj: 'Running' },
    // Node-1 does not move on this step, and that is the argument: the record was cleared and the
    // reality it described was never touched, so the only thing that changes is on the right.
    opacity: { ...node1At(OPACITY.notready), podNew: 1, breakMark: 1, obj: 1 },
    // Only the slot is lit at entry, because it is what sends the ball (M-18a). The three chips the
    // arrival earns are named for the reduced path alone: in a static `lit` they would glow at t=0
    // over the values `force` left, and glow a second time when they actually turn over.
    lit: ['slot'],
    // podNew appears on arrival, so the animated path pulses it there. As a static `lit` it would
    // auto-pulse at delay 0 on a still-invisible Pod and double the pulse, hence reducedLit.
    reducedLit: ['podNewBox', 'recordChip', 'obj', 'realityChip', 'identityChip', 'focusChip'],
    // The new object is written into the freed slot FIRST, and only then does anything reach
    // Node-2: the record leads the reality here, which is the one place on this card it does.
    rewind: { opacity: { obj: 0 }, labels: { obj: 'Pod A' }, sublabels: { obj: 'Terminating' }, chips: { recordChip: '0 objects · dropped from ETCD', realityChip: '1 · Node-1, unconfirmed', identityChip: 'free', focusChip: 'record cleared, reality untouched' } },
    flow: [
      // The empty slot stands for BEAT.lead before the new object lands in it, so the step opens on
      // the state `force` left rather than on its own answer.
      F.set({ delay: BEAT.lead, labels: { obj: 'Pod B' }, sublabels: { obj: 'Running' }, chips: { recordChip: '1 object · Pod B Running' }, lit: ['obj', 'recordChip'] }),
      F.fade({ target: 'obj', from: 0, to: 1, dur: FADE.in, delay: BEAT.lead, fill: 'both', easing: 'ease-out', name: 'created' }),
      F.route({ points: RECREATE, after: 'created', name: 'start' }),
      F.fade({ target: 'podNew', from: 0, to: 1, dur: FADE.in, at: 'start', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'podNew', at: 'start' }),
      // The identity is held TWICE only once the second container is on screen, so it turns over
      // with the other two chips the arrival earns, never at step entry (P-03, P-04).
      F.set({ at: 'start', chips: { realityChip: '2 · Node-2 live, Node-1 unconfirmed', identityChip: 'held twice', focusChip: 'split-brain hazard' }, lit: ['realityChip', 'identityChip', 'focusChip'] }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
