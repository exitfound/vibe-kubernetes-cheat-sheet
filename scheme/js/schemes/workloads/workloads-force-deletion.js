import { P, F, defineCard, ladder, midX, WL, LAYOUT, FADE, BEAT, OPACITY } from './workloads-kit.js';
import { path } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/workloads-force-deletion.md

// Record over reality: the top half is what the API holds, the bottom half what is running,
// joined by the one channel that keeps them equal. That channel is drawn and then broken.
const PANEL_B = 280;

// kubectl stops at the API (A-09): everything below is that write taking effect.
const TOP1_X = 420, TOP1_W = 232;
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = 232;
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const TOP2_CX = TOP2_X + TOP2_W / 2;
const WIRE_TOP_X = midX(TOP1_X + TOP1_W, TOP2_X);
const WIRE_TOP_Y = WL.TOP_Y - 12;  // WL.A-02
// One pair of endpoints feeds the arrow and the ball on it (A-01, A-02).
const CALL = [[TOP1_X + TOP1_W, TOP_CY], [TOP2_X, TOP_CY]];
const CALL_HOP = { from: CALL[0][0], to: CALL[1][0], y: TOP_CY };

// The record slot: one StatefulSet identity, the stored object inside. Its caption is a tag
// because box() centres a label where the occupant sits.
const SLOT_W = 360, SLOT_X = WL.SPINE_X - SLOT_W / 2;
const SLOT_Y = 170, SLOT_H = 110;
const SLOT_CY = SLOT_Y + SLOT_H / 2;
const SLOT_R = SLOT_X + SLOT_W;
const CAP_X = WL.SPINE_X, CAP_Y = SLOT_Y + 24;
const OBJ_W = 280, OBJ_X = WL.SPINE_X - OBJ_W / 2;
const OBJ_Y = 210, OBJ_H = 56;

// The write reaching the store: down off the API, across, into the slot top face.
const JOG_Y = WL.TOP_BOTTOM + 25;
const WRITE = [[TOP2_CX, WL.TOP_BOTTOM], [TOP2_CX, JOG_Y], [WL.SPINE_X, JOG_Y], [WL.SPINE_X, SLOT_Y]];
const WIRE_WRITE_X = midX(WL.SPINE_X, TOP2_CX), WIRE_WRITE_Y = JOG_Y - 12;

// Chips as a column in the left band, which only opens below the panel.
const CHIP_GAP = 8;
const CHIPS_TOP = PANEL_B + 20;
const CHIP_X = LAYOUT.B.chips.x, CHIP_W = LAYOUT.B.chips.w;
const CHIP_Y = ladder({ y: CHIPS_TOP, rowH: WL.CHIP_H, gap: CHIP_GAP });

// 16 rather than 34 of label band: the frame top is pinned by the bus corridor under the chips.
const NODE_H = 134, CANVAS_B = 624;
const NODE_Y = CANVAS_B - NODE_H;
const POD_W = 300, POD_H = 106;
const POD_Y = CANVAS_B - 12 - POD_H;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };

// Two Node frames side by side, the pair filling the content width.
const NODE_GAP = 40;
const N_W = (WL.W - NODE_GAP) / 2;
const N_A_X = WL.L, N_B_X = WL.L + N_W + NODE_GAP;
const P_A_X = N_A_X + (N_W - POD_W) / 2;
const P_B_X = N_B_X + (N_W - POD_W) / 2;
const N_A_CX = N_A_X + N_W / 2, N_B_CX = N_B_X + N_W / 2;

// Nothing rides the acknowledgement channel, which is the subject, so it is a relation with no
// arrowhead (A-05). It ends on the Node-1 frame face (WL.A-03).
const BUS_Y = NODE_Y - 15;
const ACK = [[WL.SPINE_X, SLOT_Y + SLOT_H], [WL.SPINE_X, BUS_Y], [N_A_CX, BUS_Y], [N_A_CX, NODE_Y]];
// The break is a mark over a lane, not a lane segment, so L-09 does not reach it.
const CUT_CY = 373, CUT_R = 11;
const CUT_D = `M ${WL.SPINE_X - CUT_R} ${CUT_CY - CUT_R} L ${WL.SPINE_X + CUT_R} ${CUT_CY + CUT_R}`
  + ` M ${WL.SPINE_X + CUT_R} ${CUT_CY - CUT_R} L ${WL.SPINE_X - CUT_R} ${CUT_CY + CUT_R}`;
const ACK_CAP_X = WL.SPINE_X + 26, ACK_CAP_Y = 330;

// The replacement leaves the slot right face so it never shares a corridor with the dead channel.
const RECREATE = [[SLOT_R, SLOT_CY], [N_B_CX, SLOT_CY], [N_B_CX, NODE_Y]];
const WIRE_NEW_X = N_B_CX + 12, WIRE_NEW_Y = 300;

// Z-order: channels, labels, break, chips, packets, then Nodes, Pods, slot and actor row.
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
    // Appended after the packet layer, so the ball runs under it.
    P.node({ key: 'node1', x: N_A_X, y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'node2', x: N_B_X, y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-2' }),
    P.pod({
      key: 'podOld', id: 'podOld', innerKey: 'podOldBox',
      x: P_A_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod A', sublabel: '', containers: 0,
      // No build-time opacity: every step pins Pod A, and the poster frame is `idle`.
      inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: 'the running process' },
    }),
    P.pod({
      key: 'podNew', id: 'podNew', innerKey: 'podNewBox',
      x: P_B_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod B', sublabel: '', containers: 0,
      // Born invisible: the replacement does not exist until the identity is freed.
      opacity: 0,
      inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: 'recreated replica' },
    }),
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

// Node-1, its Pod and the dead channel ending on its frame move as one (A-13).
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
    // Both chips are cued by the F.set at the cut, so the reduced path names them.
    reducedLit: ['realityChip', 'focusChip'],
    // The cut lands first, then Node-1 and its Pod fall back. The chips wind back with it (P-03).
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
    // flowLights reads `lights` alone, so what an F.set lights is named here (S-17, S-16).
    reducedLit: ['recordChip', 'obj', 'focusChip'],
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
    // Nothing travels and no Pod acts, so the beat is carried by the highlight alone (M-27).
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
    // The object stays on screen until the drop lands, and its two chips turn on the same beat.
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
    // Node-1 does not move: the reality the record described was never touched.
    opacity: { ...node1At(OPACITY.notready), podNew: 1, breakMark: 1, obj: 1 },
    // Only the slot is lit at entry, because it sends the ball (M-18a). Chips earned on arrival are
    // reducedLit only, or they would glow at t=0 over the values `force` left.
    lit: ['slot'],
    // podNew appears on arrival. As a static `lit` it would pulse twice, once while invisible.
    reducedLit: ['podNewBox', 'recordChip', 'obj', 'realityChip', 'identityChip', 'focusChip'],
    // The record leads the reality here, the one place on this card it does.
    rewind: { opacity: { obj: 0 }, labels: { obj: 'Pod A' }, sublabels: { obj: 'Terminating' }, chips: { recordChip: '0 objects · dropped from ETCD', realityChip: '1 · Node-1, unconfirmed', identityChip: 'free', focusChip: 'record cleared, reality untouched' } },
    flow: [
      // The empty slot stands for BEAT.lead before the new object lands in it.
      F.set({ delay: BEAT.lead, labels: { obj: 'Pod B' }, sublabels: { obj: 'Running' }, chips: { recordChip: '1 object · Pod B Running' }, lit: ['obj', 'recordChip'] }),
      F.fade({ target: 'obj', from: 0, to: 1, dur: FADE.in, delay: BEAT.lead, fill: 'both', easing: 'ease-out', name: 'created' }),
      F.route({ points: RECREATE, after: 'created', name: 'start' }),
      F.fade({ target: 'podNew', from: 0, to: 1, dur: FADE.in, at: 'start', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'podNew', at: 'start' }),
      // Held twice only once the second container is on screen (P-03, P-04).
      F.set({ at: 'start', chips: { realityChip: '2 · Node-2 live, Node-1 unconfirmed', identityChip: 'held twice', focusChip: 'split-brain hazard' }, lit: ['realityChip', 'identityChip', 'focusChip'] }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
