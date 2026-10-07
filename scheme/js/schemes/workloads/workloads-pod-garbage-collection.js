import { P, F, defineCard, laneY, midX, strip, WL, LAYOUT, FADE, BEAT, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-pod-garbage-collection.md

// Layout C on WL: rules in the right column, chips in a bottom strip, the four Pods in their own band.

// The API is the centred box (WL.L-07 trunk) because the object lives there and the delete
// reaching the store leaves it (A-09).
const TOP_W = 232;
const API_X = WL.CX - TOP_W / 2;
const GC_X = WL.R - TOP_W;
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
// WL.A-01: PodGC is the requester and it sits on the RIGHT, so the request runs right to left on
// REQ_Y and the watch stream comes back left to right on RESP_Y.
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(API_X + TOP_W, GC_X);

// Rules in the right column only: L-03 and the trunk corridor leave no other room.
const RULE_X = LAYOUT.C.ladder.x, RULE_W = LAYOUT.C.ladder.w;
const RULE_Y = 200;
const RULES = [
  'count over terminated-pod-gc-threshold',
  'orphan, its Node object deleted',
  'unscheduled and terminating',
  'terminating on an out-of-service Node',
];

// Four Pods span WL.L..WL.R exactly, so the content centres on CX by construction.
const POD_N = 4, POD_GAP = 24;
const POD_W = (WL.W - POD_GAP * (POD_N - 1)) / POD_N;
const POD_Y = 496, POD_H = 72;
const POD_X = (i) => WL.L + i * (POD_W + POD_GAP);
const POD_CX = (i) => POD_X(i) + POD_W / 2;

// The live count beside the configured threshold IS the reading, so two chips, not three.
const CHIPS = strip({ from: WL.L, to: WL.R, count: 2, gap: 16 });
const CHIPS_Y = 590;                                     // inside the WL.L-03 floor

// One trunk down the corridor to a bus, and one tap per Pod. The bus is SPLIT at every Pod centre
// and at the trunk, because each segment has to be able to die with the Pods it still serves.
const BUS_Y = 440;
const TRUNK = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, BUS_Y]];
const SEG = [
  [[POD_CX(0), BUS_Y], [POD_CX(1), BUS_Y]],              // serves web-1 alone
  [[POD_CX(1), BUS_Y], [WL.SPINE_X, BUS_Y]],             // serves web-1 and web-2
  [[WL.SPINE_X, BUS_Y], [POD_CX(2), BUS_Y]],             // serves web-3 and web-4
  [[POD_CX(2), BUS_Y], [POD_CX(3), BUS_Y]],              // serves web-4 alone
];
const TAP = (i) => [[POD_CX(i), BUS_Y], [POD_CX(i), POD_Y]];
// The same points feed the drawn lanes and the ball (A-02): a route is the trunk, the bus as far as
// this Pod, and its tap, so no ball crosses canvas the card has not drawn.
const LANE = (i) => [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, BUS_Y], [POD_CX(i), BUS_Y], [POD_CX(i), POD_Y]];

// The trunk and the bus carry balls, so they are lanes, but tune drops their arrowhead: one head
// per run belongs on the tap.
const busPath = (key, points) => P.lane({
  key, points, dim: true, dashed: true, role: 'cluster',
  tune: (el) => el.removeAttribute('marker-end'),
});

const POD_NAMES = ['Pod web-1', 'Pod web-2', 'Pod web-3', 'Pod web-4'];
// The word on each Pod and the reason beside it. `terminating` is lower case because it is the
// kubectl STATUS column, not a phase.
const POD_STATE = [
  ['Succeeded', 'one of many'],
  ['Running', 'Node object deleted'],
  ['terminating', 'no nodeName'],
  ['terminating', 'Node out-of-service'],
];
// The state block is the Pod own `inner`, so it fades with the Pod and pulsePod reaches it whole (M-03).
const STATE_DX = 12, STATE_W = POD_W - STATE_DX * 2;
const STATE_DY = 24, STATE_H = 40;
const stateKey = (i) => 'state' + (i + 1);
// Every step states every state block, both halves, so a prev or a reset cannot leave a phase this
// card wrote standing on a step before the write (T-30).
const ST = (over = {}) => {
  const labels = {}, sublabels = {};
  POD_STATE.forEach(([word, why], i) => { labels[stateKey(i)] = word; sublabels[stateKey(i)] = why; });
  for (const k of Object.keys(over)) { labels[k] = over[k][0]; sublabels[k] = over[k][1]; }
  return { labels, sublabels };
};
// What a rewind winds ONE block back to, which is the pair it was born with (P-03).
const born = (i) => ({ labels: { [stateKey(i)]: POD_STATE[i][0] }, sublabels: { [stateKey(i)]: POD_STATE[i][1] } });

// Append order is z-order: lanes and the wire label, the packet layer, then rules, Pods, chips, actors.
export const SCENE = {
  'aria-label': 'Pod garbage collection: four finished, orphaned or terminating Pod objects sit in the API, and PodGC in the control plane deletes each of them under a different rule, one because the count of terminated Pods crossed terminated-pod-gc-threshold, and three that ignore the count, an orphan whose Node object is gone, an unscheduled Pod carrying a deletionTimestamp, and a Pod terminating on a Node tainted out-of-service',
  parts: [
    P.defs(),
    // Both top lanes carry a ball: the watch delivers Pods and Nodes, the request carries a delete.
    P.arrow({ x1: GC_X, y1: REQ_Y, x2: API_X + TOP_W, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: API_X + TOP_W, y1: RESP_Y, x2: GC_X, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    busPath('trunk', TRUNK),
    ...SEG.map((points, i) => busPath('seg' + (i + 1), points)),
    ...[0, 1, 2, 3].map(i => P.lane({ key: 'tap' + (i + 1), points: TAP(i), dim: true, dashed: true, role: 'cluster' })),
    P.packets(),
    // Appended AFTER the packet layer, so the ball runs under the Pods and the rules.
    P.chain({
      key: 'chain', x: RULE_X, y: RULE_Y, w: RULE_W, rowH: WL.ROW_H, gap: WL.ROW_GAP,
      role: 'cluster', items: RULES,
    }),
    ...[0, 1, 2, 3].map(i => P.pod({
      key: 'pod' + (i + 1), id: 'pod' + (i + 1),
      x: POD_X(i), y: POD_Y, w: POD_W, h: POD_H,
      label: POD_NAMES[i], containers: 0,
      // The state rides INSIDE the Pod: a Pod holding nothing reads as an empty rectangle.
      innerKey: stateKey(i),
      inner: { dx: STATE_DX, dy: STATE_DY, w: STATE_W, h: STATE_H, label: POD_STATE[i][0], sublabel: POD_STATE[i][1] },
    })),
    P.chip({ key: 'countChip', x: CHIPS.x(0), y: CHIPS_Y, w: CHIPS.w, h: WL.CHIP_H, name: 'terminated Pods', value: '12498' }),
    P.chip({ key: 'thrChip', x: CHIPS.x(1), y: CHIPS_Y, w: CHIPS.w, h: WL.CHIP_H, name: 'terminated-pod-gc-threshold', value: '12500' }),
    P.box({ key: 'apiBox', x: API_X, y: WL.TOP_Y, w: TOP_W, h: WL.BOX_H, label: 'API', sublabel: 'holds the Pod objects', role: 'cluster' }),
    P.box({ key: 'gcBox', x: GC_X, y: WL.TOP_Y, w: TOP_W, h: WL.BOX_H, label: 'PodGC', sublabel: 'kube-controller-manager', role: 'cluster' }),
  ],
  reset: {
    keys: ['apiBox', 'gcBox', 'countChip', 'thrChip', 'state1', 'state2', 'state3', 'state4'],
    pods: ['pod1', 'pod2', 'pod3', 'pod4'],
  },
};

// Three shades: the Pod in focus, one still recorded, one PodGC has removed (kept as a ghost, C-09).
const LIVE = 1, HELD = OPACITY.notready, GONE = OPACITY.terminated;

// A Pod, its tap and its channel are one lifecycle value (A-16, A-13). A bus segment stays open
// while any Pod downstream of it remains.
const open = (...pods) => (pods.every(v => v === GONE) ? GONE : LIVE);
const stage = (p) => ({
  pod1: p[0], pod2: p[1], pod3: p[2], pod4: p[3],
  tap1: p[0], tap2: p[1], tap3: p[2], tap4: p[3],
  seg1: open(p[0]), seg2: open(p[0], p[1]), seg3: open(p[2], p[3]), seg4: open(p[3]),
  trunk: open(...p),
});

const DELETE = { from: GC_X, to: API_X + TOP_W, y: REQ_Y };
const WATCH = { from: API_X + TOP_W, to: GC_X, y: RESP_Y };

const THRESHOLD = '12500';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { countChip: '12498', thrChip: THRESHOLD },
    ...ST(),
    opacity: stage([HELD, HELD, HELD, HELD]),
    chain: -1,
  },
  {
    id: 'remains',
    duration: 2800,
    narration: 'A Pod whose containers have all exited for good is finished, and it is still an object. The phase reads Succeeded or Failed, nothing is running for it on any Node, and the API keeps the record: the object stays in the cluster until a human or a controller process explicitly removes it.',
    chips: { countChip: '12498', thrChip: THRESHOLD },
    ...ST(),
    opacity: stage([LIVE, HELD, HELD, HELD]),
    chain: -1,
    // Packet-less and Pod-less, so .highlight alone (M-27): a blink belongs to an arrival (M-16).
    lit: ['apiBox'],
  },
  {
    id: 'threshold',
    duration: 5000,
    narration: 'PodGC is a control plane controller inside kube-controller-manager, and its first rule is a count. Terminated Pods are left alone while there are no more of them than terminated-pod-gc-threshold, which defaults to 12500. Over that, it deletes evicted ones first, then the oldest, until the count is back down to the threshold rather than under it. Set the flag to 0 or less and this rule is off.',
    chips: { countChip: '12500', thrChip: THRESHOLD },
    wires: { req: 'DELETE .../pods/web-1' },
    ...ST(),
    opacity: stage([GONE, HELD, HELD, HELD]),
    chain: 0,
    lit: ['gcBox'],
    // The count is what the delete produces: rewound, then turned over on landing (P-03).
    rewind: { chips: { countChip: '12501' } },
    flow: [
      // PodGC self-initiates on its own timer, so the request waits BEAT.lead.
      F.top({ ...DELETE, delay: BEAT.lead, name: 'del', lights: ['apiBox'] }),
      F.route({ points: LANE(0), after: 'del', name: 'gc' }),
      F.set({ at: 'gc', chips: { countChip: '12500' }, lit: ['countChip'] }),
      // The Pod receives the delete, so it blinks on arrival and only then fades (M-16, M-08).
      F.pulse({ pod: 'pod1', at: 'gc' }),
      F.fade({ target: 'pod1', from: LIVE, to: GONE, dur: FADE.out, at: 'gc', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'tap1', from: LIVE, to: GONE, dur: FADE.out, at: 'gc', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'seg1', from: LIVE, to: GONE, dur: FADE.out, at: 'gc', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
    ],
    reducedLit: ['countChip'],
  },
  {
    id: 'beyond',
    duration: 3400,
    narration: 'The other three rules never look at the count. PodGC watches Nodes as well as Pods, and a Pod matching any one of them goes whatever the number is. Because such a Pod is often still in a non-terminal phase, PodGC patches the phase to Failed before it deletes, so the record ends rather than the object simply disappearing.',
    chips: { countChip: '12500', thrChip: THRESHOLD },
    wires: { req: 'watch · Pods and Nodes' },
    ...ST(),
    opacity: stage([GONE, LIVE, LIVE, LIVE]),
    chain: [1, 2, 3],
    lit: ['apiBox'],
    flow: [
      // The API streams the watch on its own, so the ball waits BEAT.lead before it leaves.
      F.top({ ...WATCH, delay: BEAT.lead, lights: ['gcBox'] }),
    ],
  },
  {
    id: 'orphan',
    duration: 4400,
    narration: 'First rule of the three. Pod web-2 still names node-7 in spec.nodeName and that Node object has been deleted, so no Kubelet will ever report on it again. PodGC calls it an orphan, adds a DisruptionTarget condition with reason DeletionByPodGC, patches the phase to Failed and removes the object. No other PodGC rule adds that condition.',
    chips: { countChip: '12500', thrChip: THRESHOLD },
    wires: { req: 'PATCH status · Failed, DisruptionTarget · then DELETE' },
    opacity: stage([GONE, GONE, LIVE, LIVE]),
    chain: 1,
    lit: ['gcBox'],
    ...ST({ state2: ['Failed', 'DeletionByPodGC'] }),
    rewind: born(1),
    flow: [
      F.top({ ...DELETE, delay: BEAT.lead, name: 'del', lights: ['apiBox'] }),
      F.route({ points: LANE(1), after: 'del', name: 'gc' }),
      // The phase patch lands before the delete: blink on the write, then go.
      F.set({ at: 'gc', labels: { state2: 'Failed' }, sublabels: { state2: 'DeletionByPodGC' } }),
      F.pulse({ pod: 'pod2', at: 'gc' }),
      F.fade({ target: 'pod2', from: LIVE, to: GONE, dur: FADE.out, at: 'gc', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'tap2', from: LIVE, to: GONE, dur: FADE.out, at: 'gc', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'seg2', from: LIVE, to: GONE, dur: FADE.out, at: 'gc', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'unscheduled',
    duration: 4400,
    narration: 'Second rule, and it needs no Node at all. Pod web-3 carries a deletionTimestamp and never got a nodeName. The API removes an unscheduled Pod at once, so one that stays is held by a finalizer, and no Kubelet will ever give it a final phase. PodGC patches it to Failed and deletes it, and the object goes once the finalizer is cleared.',
    chips: { countChip: '12500', thrChip: THRESHOLD },
    wires: { req: 'PATCH status · Failed · then DELETE .../pods/web-3' },
    opacity: stage([GONE, GONE, GONE, LIVE]),
    chain: 2,
    lit: ['gcBox'],
    ...ST({ state2: ['Failed', 'DeletionByPodGC'], state3: ['Failed', 'never scheduled'] }),
    rewind: born(2),
    flow: [
      F.top({ ...DELETE, delay: BEAT.lead, name: 'del', lights: ['apiBox'] }),
      F.route({ points: LANE(2), after: 'del', name: 'gc' }),
      F.set({ at: 'gc', labels: { state3: 'Failed' }, sublabels: { state3: 'never scheduled' } }),
      // The same two-write shape `orphan` blinks for: the live Pod blinks on the patch, then goes.
      F.pulse({ pod: 'pod3', at: 'gc' }),
      F.fade({ target: 'pod3', from: LIVE, to: GONE, dur: FADE.out, at: 'gc', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'tap3', from: LIVE, to: GONE, dur: FADE.out, at: 'gc', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'out-of-service',
    duration: 5000,
    narration: 'Third rule, and this one waits for an operator. Pod web-4 is terminating on a Node that is not ready, and someone has decided the Node is really gone and tainted it node.kubernetes.io/out-of-service. PodGC takes that taint as the answer and force deletes the Pod, so the object stops waiting for an acknowledgement that is not coming.',
    chips: { countChip: '12500', thrChip: THRESHOLD },
    wires: { req: 'PATCH status · Failed · then DELETE .../pods/web-4' },
    opacity: stage([GONE, GONE, GONE, GONE]),
    chain: 3,
    lit: ['gcBox'],
    ...ST({ state2: ['Failed', 'DeletionByPodGC'], state3: ['Failed', 'never scheduled'], state4: ['Failed', 'Node out-of-service'] }),
    rewind: born(3),
    flow: [
      F.top({ ...DELETE, delay: BEAT.lead, name: 'del', lights: ['apiBox'] }),
      F.route({ points: LANE(3), after: 'del', name: 'gc' }),
      F.set({ at: 'gc', labels: { state4: 'Failed' }, sublabels: { state4: 'Node out-of-service' } }),
      F.pulse({ pod: 'pod4', at: 'gc' }),
      F.fade({ target: 'pod4', from: LIVE, to: GONE, dur: FADE.out, at: 'gc', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'tap4', from: LIVE, to: GONE, dur: FADE.out, at: 'gc', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'seg3', from: LIVE, to: GONE, dur: FADE.out, at: 'gc', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'seg4', from: LIVE, to: GONE, dur: FADE.out, at: 'gc', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'trunk', from: LIVE, to: GONE, dur: FADE.out, at: 'gc', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
