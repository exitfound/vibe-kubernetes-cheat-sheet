import { P, F, defineCard, ladder, laneY, midX, strip, WL, FADE, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-daemonset.md

// An eligibility ROSTER, not a pipeline: the Node band carries the labels each Node holds and the
// chips carry the status the controller derives from them. No ladder, so no LAYOUT preset applies.
// Panel x<=397 y<=255; a longer narration invalidates that measurement.
const PANEL_B = 255;

// The actor row takes the `workloads-replicaset` arrangement: two boxes 232 wide, the one the trunk
// leaves centred on WL.CX and the other right-aligned on WL.R. Here the write that lands on a Node
// leaves the API (A-09), so the API is the centred box and the controller sits to its RIGHT: the
// narration panel holds the top-left corner, so that is the only side left, and it buys a trunk
// that drops straight off the API face instead of jogging across the canvas to reach the spine.
const API_W = 232, API_X = WL.CX - API_W / 2;            // 484..716, centred on CX for the trunk
const DS_W = 232, DS_X = WL.R - DS_W;                    // 908..1140, right edge on the chip column
const API_EDGE = API_X + API_W;                          // 716, the face the controller talks to
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;                  // 80
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(API_EDGE, DS_X);                     // 812
const WIRE_Y = WL.TOP_Y - 12;                            // above the actor row, off the spine

// The status board: four chips over BOTH columns, two rows deep. Using WL.COL_L and WL.COL_R for
// the two columns keeps the 540..660 corridor open, which is the only room the trunk has.
const CHIP_GAP = 8;
const CHIPS_TOP = PANEL_B + 20;                          // 275
const CHIP_ROW = ladder({ y: CHIPS_TOP, rowH: WL.CHIP_H, gap: CHIP_GAP });   // 275 / 317

// Two standing rules, one centred in each chip column, saying what the board above and the roster
// below are measured against. Neither is ever rewritten, so neither is a wire.
const RULE_Y = 400;
const COL_L_CX = WL.COL_L.x + WL.COL_L.w / 2;            // 300
const COL_R_CX = WL.COL_R.x + WL.COL_R.w / 2;            // 900

const NODE_H = 140, CANVAS_B = 624;
const NODE_Y = CANVAS_B - NODE_H;                        // 484..624, the frames rest on the floor
// The Pod is 6 shorter than the frame budget allows and spends all 6 on its TOP edge, so the Node
// label sitting on the frame baseline (NODE_Y + 18 = 502) no longer touches the Pod border. The
// inner box takes 4 more of the same kind, which is what lifts the Pod label off its roof: label
// baseline 528, inner top 544, inner bottom 596, Pod floor 612.
const POD_H = 100, POD_Y = NODE_Y + 28;                  // 512..612
const POD_INNER = { dy: 32, h: 52 };                     // 544..596

// Four Node frames laid across the content width, so the row centres on CX by construction.
const NODE_N = 4, NODE_GAP = 24;
const NODES = strip({ from: WL.L, to: WL.R, count: NODE_N, gap: NODE_GAP });
const N_W = NODES.w, N_X = NODES.x;                      // 252 wide, at 60 / 336 / 612 / 888
const N_POD_DX = 12, N_INNER_DX = 22;                    // Pod and container insets in the frame
const N_POD_W = N_W - N_POD_DX * 2, N_INNER_W = N_W - N_INNER_DX * 2;
const POD_CX = i => N_X(i) + N_W / 2;                    // 186 / 462 / 738 / 1014
// The roster caption sits on the node label baseline at the far end of the frame, so it costs the
// band no height at all: Node-N reads from the left corner and its labels from the right.
const LBL_X = i => N_X(i) + N_W - 12;
const LBL_Y = NODE_Y + 18;

// The trunk leaves the API, which is the box whose write lands on a Node (A-09), and drops STRAIGHT
// down the 540..660 corridor the two chip columns leave open, because that corridor and the API
// face now share x. One tap per Node, each ending on that frame's own top face midpoint (WL.A-03).
// The bus sits 42 above the frames rather than 24: a tap needs a run of its own after the turn or
// the arrowhead lands on the corner and the elbow reads as a single sharp point.
const BUS_Y = NODE_Y - 42;                               // 442, clear of the standing rules at 400
const TRUNK = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, BUS_Y]];
// Built ONCE per Pod: the drawn lane and every ball addressed to it read one array, so the two
// cannot drift apart on a geometry edit.
const LANES = [0, 1, 2, 3].map(i => [...TRUNK, [POD_CX(i), BUS_Y], [POD_CX(i), NODE_Y]]);

const NODE_JOIN_DELAY = 200;                             // Node-4 fades in a beat before the watch

// Z-order: the two top arrows, the wire label, the status board and the standing rules, then the
// four lanes and the packet layer, then Nodes / roster captions / Pods / actor row above the ball.
export const SCENE = {
  'aria-label': 'DaemonSet controller: counts the Nodes whose labels match the Pod template nodeSelector, places one Pod on each of them, adds a Pod when a Node starts matching, rolls a new image out one Node at a time under updateStrategy, and removes a Pod when a Node leaves the cluster',
  parts: [
    P.defs(),
    P.arrow({ x1: DS_X, y1: REQ_Y, x2: API_EDGE, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: API_EDGE, y1: RESP_Y, x2: DS_X, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WIRE_X, y: WIRE_Y }),
    // The DaemonSetStatus board, two rows over the two columns.
    P.chip({ key: 'desiredChip', x: WL.COL_L.x, y: CHIP_ROW(0), w: WL.COL_L.w, h: WL.CHIP_H, name: 'desiredNumberScheduled', value: '0' }),
    P.chip({ key: 'currentChip', x: WL.COL_R.x, y: CHIP_ROW(0), w: WL.COL_R.w, h: WL.CHIP_H, name: 'currentNumberScheduled', value: '0' }),
    P.chip({ key: 'readyChip', x: WL.COL_L.x, y: CHIP_ROW(1), w: WL.COL_L.w, h: WL.CHIP_H, name: 'numberReady', value: '0' }),
    P.chip({ key: 'focusChip', x: WL.COL_R.x, y: CHIP_ROW(1), w: WL.COL_R.w, h: WL.CHIP_H, name: 'focus', value: 'one Pod per matching Node' }),
    P.tag({ key: 'ruleSel', x: COL_L_CX, y: RULE_Y, text: 'nodeSelector logging=enabled' }),
    P.tag({ key: 'ruleCount', x: COL_R_CX, y: RULE_Y, text: 'no replicas field: the Node set is the count' }),
    // One drawn lane per Pod, sharing the trunk and the bus, so the four paths read as a single
    // wiring tree with four arrowheads. Lane 3 starts pinned out: Node-4 matches nothing yet.
    ...[0, 1, 2, 3].map(i => P.lane({ key: `lane${i}`, points: LANES[i], dim: true, dashed: true, role: 'cluster', opacity: i === 3 ? 0 : undefined })),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.node({ key: 'node1El', x: N_X(0), y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'node2El', x: N_X(1), y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-2' }),
    P.node({ key: 'node3El', x: N_X(2), y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-3' }),
    P.node({ key: 'node4El', x: N_X(3), y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-4', opacity: 0 }),
    // The roster: what each Node carries, which is the whole reason three of them get a Pod. Node-4
    // holds two captions in one place and cross-fades between them when it is labelled.
    P.tag({ key: 'lbl1', x: LBL_X(0), y: LBL_Y, text: 'logging=enabled', anchor: 'end' }),
    P.tag({ key: 'lbl2', x: LBL_X(1), y: LBL_Y, text: 'logging=enabled', anchor: 'end' }),
    P.tag({ key: 'lbl3', x: LBL_X(2), y: LBL_Y, text: 'logging=enabled', anchor: 'end' }),
    P.tag({ key: 'lbl4off', x: LBL_X(3), y: LBL_Y, text: 'no logging label', anchor: 'end', opacity: 0 }),
    P.tag({ key: 'lbl4on', x: LBL_X(3), y: LBL_Y, text: 'logging=enabled', anchor: 'end', opacity: 0 }),
    // Born invisible: every step pins all four Pods, and `place` is the one that creates the first three.
    ...[0, 1, 2, 3].map(i => P.pod({
      key: `pod${i + 1}`, id: `pod${i + 1}`, innerKey: `pod${i + 1}Box`,
      x: N_X(i) + N_POD_DX, y: POD_Y, w: N_POD_W, h: POD_H, label: 'fluentd', sublabel: '', containers: 0,
      opacity: 0,
      inner: { dx: N_INNER_DX - N_POD_DX, dy: POD_INNER.dy, w: N_INNER_W, h: POD_INNER.h, label: 'fluentd', sublabel: 'log agent' },
    })),
    P.box({ key: 'apiserver', x: API_X, y: WL.TOP_Y, w: API_W, h: WL.BOX_H, label: 'API', sublabel: 'watch Nodes · Pod CRUD', role: 'cluster' }),
    P.box({ key: 'daemonset', x: DS_X, y: WL.TOP_Y, w: DS_W, h: WL.BOX_H, label: 'DaemonSet', sublabel: 'fluentd · log agent', role: 'cluster' }),
  ],
  reset: {
    keys: ['daemonset', 'apiserver', 'desiredChip', 'currentChip', 'readyChip', 'focusChip', 'pod1Box', 'pod2Box', 'pod3Box', 'pod4Box'],
    pods: ['pod1', 'pod2', 'pod3', 'pod4'],
  },
};

// The whole fleet is written in ONE place, so no step can leave a lane pointing into a Node that is
// not in the cluster, a Pod sitting on one, or a roster caption outliving the frame it describes.
// Captions 1 to 3 take their Node's own shade for exactly that reason (A-14); Node-4 carries a pair
// and states them itself, because which of the two is showing is not a function of the frame.
const fleet = (nodes, pods, lanes, lbl4off, lbl4on) => ({
  ...Object.fromEntries(nodes.map((v, i) => [`node${i + 1}El`, v])),
  ...Object.fromEntries(nodes.slice(0, 3).map((v, i) => [`lbl${i + 1}`, v])),
  ...Object.fromEntries(pods.map((v, i) => [`pod${i + 1}`, v])),
  ...Object.fromEntries(lanes.map((v, i) => [`lane${i}`, v])),
  lbl4off, lbl4on,
});

// One create per matching Node, each on its own tap, so every Pod that pulses has a ball that
// reached it. Ranks are LITERALS: `routeDur` is length-based, tap-0 has the longest lane and ranks 3.
const create = (i, rank) => [
  F.route({ points: LANES[i], after: 'req', name: `create${i}` }),
  F.fade({ target: `pod${i + 1}`, from: 0, to: 1, dur: FADE.in, at: `create${i}`, fill: 'both', easing: 'ease-out' }),
  F.pulse({ pod: `pod${i + 1}`, at: `create${i}` }),
  F.set({ at: `create${i}`, chips: { currentChip: rank, readyChip: rank } }),
];

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { desiredChip: '0', currentChip: '0', readyChip: '0', focusChip: 'one Pod per matching Node' },
    opacity: fleet([1, 1, 1, 0], [0, 0, 0, 0], [1, 1, 1, 0], 0, 0),
  },
  {
    id: 'match',
    // Motion: the list goes out (700), the answer comes back (1500), and the count it carries is
    // written on that arrival.
    duration: 3200,
    narration: 'The controller reads no replica count, because a DaemonSet has no replicas field. It lists Nodes through the API and matches each one against the nodeSelector in its Pod template, and the three Nodes carrying logging=enabled are what desiredNumberScheduled counts. Nothing is running yet.',
    chips: { desiredChip: '3', currentChip: '0', readyChip: '0', focusChip: 'list Nodes, match the selector' },
    wires: { req: 'list Nodes · match nodeSelector · three of three' },
    opacity: fleet([1, 1, 1, 0], [0, 0, 0, 0], [1, 1, 1, 0], 0, 0),
    // The DaemonSet asks first, so it is lit at entry (M-18a) and the API stays dark until the list
    // request lands on it.
    lit: ['daemonset', 'desiredChip', 'focusChip'],
    // The count is derived on the answer, so the step starts before it exists (S-13).
    rewind: { chips: { desiredChip: '0' } },
    flow: [
      F.top({ from: DS_X, to: API_EDGE, y: REQ_Y, name: 'list', lights: ['apiserver'] }),
      F.top({ from: API_EDGE, to: DS_X, y: RESP_Y, after: 'list', name: 'nodes' }),
      F.set({ at: 'nodes', chips: { desiredChip: '3' } }),
    ],
  },
  {
    id: 'place',
    // Motion: the create request goes out (700), then three balls ride their own taps, the two
    // short ones landing together at 1916 and the long one last, at 2529.
    duration: 4200,
    narration: 'The controller creates one Pod per matching Node through the API, each one pinned to its own Node by nodeAffinity. A DaemonSet keeps exactly one Pod per Node, and only a non-zero maxSurge during a rollout ever puts a second there, so the fleet follows the Node set instead of a replica number. A Node counts in numberReady once its Pod reports Ready.',
    chips: { desiredChip: '3', currentChip: '3', readyChip: '3', focusChip: 'one Pod per matching Node' },
    wires: { req: 'create one Pod per matching Node' },
    // Pin final opacities so a step change does not revert the Pods to the built 0.
    opacity: fleet([1, 1, 1, 0], [1, 1, 1, 0], [1, 1, 1, 0], 0, 0),
    lit: ['daemonset', 'focusChip', 'currentChip', 'readyChip'],
    // The animated path says the three creates arrived by PULSING their Pods, which no `lights`
    // list can name: the static path has to say it with the inner boxes instead.
    reducedLit: ['pod1Box', 'pod2Box', 'pod3Box'],
    // The step starts from what it narrates, three matching Nodes and ZERO Pods, and the creates
    // raise both counts one arrival at a time. The static block states where it ENDS (S-13).
    rewind: { chips: { currentChip: '0', readyChip: '0' } },
    flow: [
      F.top({ from: DS_X, to: API_EDGE, y: REQ_Y, name: 'req', lights: ['apiserver'] }),
      // In NODE order and not in arrival order, which unit/spec-steps.test.mjs depends on: this
      // is the catalog's one step whose settled chips differ from its static ones.
      ...create(0, '3'),
      ...create(1, '1'),
      ...create(2, '2'),
    ],
  },
  {
    id: 'node-join',
    // Motion: Node-4 and its caption fade in (200 + 600), the Node watch event reaches the
    // controller (700), and the step then stands on what it did NOT do.
    duration: 3200,
    narration: 'Node-4 joins the cluster and turns Ready, but it carries no logging=enabled label, so the nodeSelector in the Pod template does not select it. The controller sees the new Node object and leaves desiredNumberScheduled at three. Joining the cluster is not what earns a Node a Pod, matching the selector is.',
    chips: { desiredChip: '3', currentChip: '3', readyChip: '3', focusChip: 'Node-4 joined, no match, no Pod' },
    wires: { req: 'watch Node added · nodeSelector does not match' },
    // Node-4 is on the canvas and stays empty: no Pod, and no tap either, because a lane into a
    // Node nothing is addressed to is an arrowhead over no traffic (A-05).
    opacity: fleet([1, 1, 1, 1], [1, 1, 1, 0], [1, 1, 1, 0], 1, 0),
    // The API sends the only ball of this step, so it is lit at entry (M-18a).
    lit: ['apiserver', 'focusChip'],
    rewind: { opacity: { node4El: 0, lbl4off: 0 } },
    flow: [
      F.fade({ target: 'node4El', from: 0, to: 1, dur: FADE.in, delay: NODE_JOIN_DELAY, fill: 'both', easing: 'ease-out' }),
      F.fade({ target: 'lbl4off', from: 0, to: 1, dur: FADE.in, delay: NODE_JOIN_DELAY, fill: 'both', easing: 'ease-out' }),
      F.top({ from: API_EDGE, to: DS_X, y: RESP_Y, delay: NODE_JOIN_DELAY + FADE.in, name: 'watch', lights: ['daemonset'] }),
    ],
  },
  {
    id: 'label',
    // Motion: the caption cross-fades (700), the Node update reaches the controller (1400), the
    // create goes out (2200), the ball rides Node-4 own tap and pulses it, landing at 4029.
    duration: 5700,
    narration: 'An operator labels Node-4 with logging=enabled. The controller watches Node objects, sees the update, recomputes desiredNumberScheduled to four and creates one Pod there. The three Pods already running are untouched, because the controller reconciles the difference and nothing about their Nodes changed.',
    chips: { desiredChip: '4', currentChip: '4', readyChip: '4', focusChip: 'a label makes a Node eligible' },
    wires: { req: 'Node-4 labelled logging=enabled · desiredNumberScheduled 3 to 4' },
    opacity: fleet([1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], 0, 1),
    lit: ['apiserver', 'desiredChip', 'currentChip', 'readyChip', 'focusChip'],
    // pod4 appears on arrival and the animated path pulses it there, so the static path says it here.
    reducedLit: ['pod4Box'],
    // The label lands FIRST and the controller learns of it by watching Node objects, so the frame
    // still reads unlabelled and the counters still read the three-Node cluster at entry.
    rewind: {
      opacity: { pod4: 0, lane3: 0, lbl4off: 1, lbl4on: 0 },
      chips: { desiredChip: '3', currentChip: '3', readyChip: '3' },
    },
    flow: [
      F.fade({ target: 'lbl4off', from: 1, to: 0, dur: FADE.out, fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'lbl4on', from: 0, to: 1, dur: FADE.in, fill: 'both', easing: 'ease-out' }),
      F.top({ from: API_EDGE, to: DS_X, y: RESP_Y, delay: FADE.out, name: 'watch', lights: ['daemonset'] }),
      // The tap is drawn the moment the Node enters the matching set, so the ball that follows has
      // a wire under it for its whole run (A-01).
      F.fade({ target: 'lane3', from: 0, to: 1, dur: FADE.in, at: 'watch', fill: 'both', easing: 'ease-out' }),
      F.set({ at: 'watch', chips: { desiredChip: '4' } }),
      F.top({ from: DS_X, to: API_EDGE, y: REQ_Y, after: 'watch', name: 'req', lights: ['apiserver'] }),
      F.route({ points: LANES[3], after: 'req', name: 'create' }),
      F.fade({ target: 'pod4', from: 0, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'pod4', at: 'create' }),
      F.set({ at: 'create', chips: { currentChip: '4', readyChip: '4' } }),
    ],
  },
  {
    id: 'update',
    // Motion: the rollout request goes out (700), the delete rides Node-1 own tap and lands at
    // 2529, and the Pod fades to the not-ready shade behind it.
    duration: 4300,
    narration: 'The image is bumped from fluentd v1 to v2. The RollingUpdate strategy with maxUnavailable=1 deletes and recreates the Pods one Node at a time, so numberReady sits at three while the Pod on Node-1 is replaced and log collection keeps running on the rest. The OnDelete strategy would instead wait until you delete each Pod by hand.',
    chips: { desiredChip: '4', currentChip: '4', readyChip: '3', focusChip: 'RollingUpdate · maxUnavailable=1' },
    wires: { req: 'RollingUpdate · maxUnavailable=1 · v1 to v2' },
    // maxUnavailable=1 means exactly ONE Pod is down at a time, which the count states. The one
    // being recreated holds the not-ready shade while its Node stays present.
    opacity: fleet([1, 1, 1, 1], [OPACITY.notready, 1, 1, 1], [1, 1, 1, 1], 0, 1),
    lit: ['daemonset', 'readyChip', 'focusChip'],
    reducedLit: ['pod1Box'],
    // It is at full strength until the delete reaches it, then it drops: the ball is what takes it
    // down, so the shade must not be there before the ball arrives. numberReady goes with it, or
    // the count says a Pod is gone while all four are still drawn at full strength.
    rewind: { opacity: { pod1: 1 }, chips: { readyChip: '4' } },
    flow: [
      F.top({ from: DS_X, to: API_EDGE, y: REQ_Y, name: 'req', lights: ['apiserver'] }),
      // The rollout travels controller to API to Node-1 down the drawn tap, and only when it
      // arrives does Node-1 react: ball first, pulse on arrival, which is the shape the surge step
      // of workloads-rolling-update takes.
      F.route({ points: LANES[0], after: 'req', name: 'update' }),
      F.pulse({ pod: 'pod1', at: 'update' }),
      F.fade({ target: 'pod1', from: 1, to: OPACITY.notready, dur: FADE.out, at: 'update', fill: 'both', easing: 'ease-in' }),
      F.set({ at: 'update', chips: { readyChip: '3' } }),
    ],
  },
  {
    id: 'node-removed',
    // Motion: the Node watch event reaches the controller (700), the delete rides Node-2 own tap
    // and lands at 1916, and the frame, its Pod, its caption and its tap go out together.
    duration: 3700,
    narration: 'Node-2 leaves the cluster and its Node object is deleted, so the DaemonSet Pod on it is garbage collected. A drain alone would not have removed it, because a drain never evicts DaemonSet Pods. Unlike a Deployment replica the Pod is not recreated elsewhere, so desiredNumberScheduled drops back to three.',
    chips: { desiredChip: '3', currentChip: '3', readyChip: '3', focusChip: 'Node-2 gone, Pod not rescheduled' },
    wires: { req: 'Node-2 removed · delete its Pod · no reschedule' },
    // Pin final: Node-2, its Pod, its roster caption and its tap are gone together, because a lane
    // or a label outliving the Node it belongs to points at nothing (A-13, A-14).
    opacity: fleet([1, OPACITY.terminated, 1, 1], [1, 0, 1, 1], [1, 0, 1, 1], 0, 1),
    // The API sends the first ball, so it is lit at entry (M-18a); the DaemonSet is not, it lights
    // on the watch arrival. The three counters carry the highlight and turn over on their beats.
    lit: ['currentChip', 'readyChip', 'focusChip', 'desiredChip', 'apiserver'],
    // The Node leaving is news the controller LEARNS, exactly as on `label`, so the three counters
    // stand on the four-Node cluster this step inherits until the events that move them land.
    rewind: {
      opacity: { pod2: 1, node2El: 1, lbl2: 1, lane1: 1 },
      chips: { desiredChip: '4', currentChip: '4', readyChip: '4' },
    },
    flow: [
      // The API reports the Node object gone. The controller is dark until that lands, then the
      // delete reaches Node-2 down its own tap: pod2 pulses and the whole slot goes out with it.
      F.top({ from: API_EDGE, to: DS_X, y: RESP_Y, name: 'watch', lights: ['daemonset'] }),
      F.set({ at: 'watch', chips: { desiredChip: '3' } }),
      F.route({ points: LANES[1], after: 'watch', name: 'del' }),
      F.set({ at: 'del', chips: { currentChip: '3', readyChip: '3' } }),
      F.pulse({ pod: 'pod2', at: 'del' }),
      F.fade({ target: 'pod2', from: 1, to: 0, dur: FADE.out, at: 'del', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'node2El', from: 1, to: OPACITY.terminated, dur: FADE.out, at: 'del', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'lbl2', from: 1, to: OPACITY.terminated, dur: FADE.out, at: 'del', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'lane1', from: 1, to: 0, dur: FADE.out, at: 'del', fill: 'both', easing: 'ease-in' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
