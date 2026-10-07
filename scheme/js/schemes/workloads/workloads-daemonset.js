import { P, F, defineCard, ladder, laneY, midX, strip, WL, FADE, BEAT, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-daemonset.md

// An eligibility roster, not a pipeline: Nodes carry labels, chips carry the derived status. Panel bottom at PANEL_B.
const PANEL_B = 255;

// The write lands from the API (A-09), so the API is centred on CX and the controller sits right of it.
const API_W = 232, API_X = WL.CX - API_W / 2;
const DS_W = 232, DS_X = WL.R - DS_W;
const API_EDGE = API_X + API_W;  // the face the controller talks to
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(API_EDGE, DS_X);
const WIRE_Y = WL.TOP_Y - 12;

// The status board spans WL.COL_L and WL.COL_R, keeping the middle corridor open for the trunk.
const CHIP_GAP = 8;
const CHIPS_TOP = PANEL_B + 20;
const CHIP_ROW = ladder({ y: CHIPS_TOP, rowH: WL.CHIP_H, gap: CHIP_GAP });

// Two standing rules under the board, never rewritten, so neither is a wire.
const RULE_Y = 400;
const COL_L_CX = WL.COL_L.x + WL.COL_L.w / 2;
const COL_R_CX = WL.COL_R.x + WL.COL_R.w / 2;

// Frames rest on the canvas floor and grow upward (L-24): a label band over the Pod, a floor under it.
const CANVAS_B = 624, POD_H = 100;
const NODE_H = 34 + POD_H + 12;
const NODE_Y = CANVAS_B - NODE_H;
const POD_Y = NODE_Y + 34;
const POD_INNER = { dy: 32, h: 52 };

// Four Node frames across the content width, so the row centres on CX.
const NODE_N = 4, NODE_GAP = 24;
const NODES = strip({ from: WL.L, to: WL.R, count: NODE_N, gap: NODE_GAP });
const N_W = NODES.w, N_X = NODES.x;
const N_POD_DX = 12, N_INNER_DX = 22;                    // Pod and container insets in the frame
const N_POD_W = N_W - N_POD_DX * 2, N_INNER_W = N_W - N_INNER_DX * 2;
const POD_CX = i => N_X(i) + N_W / 2;
// The roster caption sits on the Node label baseline at the far end of the frame.
const LBL_X = i => N_X(i) + N_W - 12;
const LBL_Y = NODE_Y + 18;

// The trunk leaves the API (A-09) down the open corridor, one tap per Node to its top face (WL.A-03). The bus sits high enough that each tap has a run after its turn.
const BUS_Y = NODE_Y - 42;
const TRUNK = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, BUS_Y]];
// Built once per Pod: the drawn lane and every ball on it read one array.
const LANES = [0, 1, 2, 3].map(i => [...TRUNK, [POD_CX(i), BUS_Y], [POD_CX(i), NODE_Y]]);

const NODE_JOIN_DELAY = 200;                             // Node-4 fades in a beat before the watch

// Z-order: arrows, wire, board and rules, then lanes and the packet layer, then Nodes, captions, Pods and actors.
export const SCENE = {
  'aria-label': 'DaemonSet controller: counts the Nodes whose labels match the Pod template nodeSelector, places one Pod on each of them, adds a Pod when a Node starts matching, rolls a new image out one Node at a time under updateStrategy, and removes a Pod when a Node leaves the cluster',
  parts: [
    P.defs(),
    P.arrow({ x1: DS_X, y1: REQ_Y, x2: API_EDGE, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: API_EDGE, y1: RESP_Y, x2: DS_X, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WIRE_X, y: WIRE_Y }),
    P.chip({ key: 'desiredChip', x: WL.COL_L.x, y: CHIP_ROW(0), w: WL.COL_L.w, h: WL.CHIP_H, name: 'desiredNumberScheduled', value: '0' }),
    P.chip({ key: 'currentChip', x: WL.COL_R.x, y: CHIP_ROW(0), w: WL.COL_R.w, h: WL.CHIP_H, name: 'currentNumberScheduled', value: '0' }),
    P.chip({ key: 'readyChip', x: WL.COL_L.x, y: CHIP_ROW(1), w: WL.COL_L.w, h: WL.CHIP_H, name: 'numberReady', value: '0' }),
    P.chip({ key: 'focusChip', x: WL.COL_R.x, y: CHIP_ROW(1), w: WL.COL_R.w, h: WL.CHIP_H, name: 'focus', value: 'one Pod per matching Node' }),
    P.tag({ key: 'ruleSel', x: COL_L_CX, y: RULE_Y, text: 'nodeSelector logging=enabled' }),
    P.tag({ key: 'ruleCount', x: COL_R_CX, y: RULE_Y, text: 'no replicas field: the Node set is the count' }),
    // One lane per Pod sharing trunk and bus. Lane 3 starts out: Node-4 matches nothing yet.
    ...[0, 1, 2, 3].map(i => P.lane({ key: `lane${i}`, points: LANES[i], dim: true, dashed: true, role: 'cluster', opacity: i === 3 ? 0 : undefined })),
    P.packets(),
    // Everything below is appended after the packet layer, so the ball runs under it.
    P.node({ key: 'node1El', x: N_X(0), y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'node2El', x: N_X(1), y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-2' }),
    P.node({ key: 'node3El', x: N_X(2), y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-3' }),
    P.node({ key: 'node4El', x: N_X(3), y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-4', opacity: 0 }),
    // The roster. Node-4 holds two captions in one place and cross-fades between them.
    P.tag({ key: 'lbl1', x: LBL_X(0), y: LBL_Y, text: 'logging=enabled', anchor: 'end' }),
    P.tag({ key: 'lbl2', x: LBL_X(1), y: LBL_Y, text: 'logging=enabled', anchor: 'end' }),
    P.tag({ key: 'lbl3', x: LBL_X(2), y: LBL_Y, text: 'logging=enabled', anchor: 'end' }),
    P.tag({ key: 'lbl4off', x: LBL_X(3), y: LBL_Y, text: 'no logging label', anchor: 'end', opacity: 0 }),
    P.tag({ key: 'lbl4on', x: LBL_X(3), y: LBL_Y, text: 'logging=enabled', anchor: 'end', opacity: 0 }),
    // Born invisible: `place` creates the first three.
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

// The whole fleet in one place, so no lane, Pod or caption outlives its Node (A-14). Node-4 states its caption pair itself.
const fleet = (nodes, pods, lanes, lbl4off, lbl4on) => ({
  ...Object.fromEntries(nodes.map((v, i) => [`node${i + 1}El`, v])),
  ...Object.fromEntries(nodes.slice(0, 3).map((v, i) => [`lbl${i + 1}`, v])),
  ...Object.fromEntries(pods.map((v, i) => [`pod${i + 1}`, v])),
  ...Object.fromEntries(lanes.map((v, i) => [`lane${i}`, v])),
  lbl4off, lbl4on,
});

// One create per Node on its own tap. Ranks are literals: routeDur is length-based, so tap 0 lands last.
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
    duration: 3700,
    narration: 'The controller reads no replica count, because a DaemonSet has no replicas field. It lists Nodes through the API and matches each one against the nodeSelector in its Pod template. All three Nodes carry logging=enabled, so desiredNumberScheduled counts three. Nothing is running yet.',
    chips: { desiredChip: '3', currentChip: '0', readyChip: '0', focusChip: 'list Nodes, match the selector' },
    wires: { req: 'list Nodes · match nodeSelector · three of three' },
    opacity: fleet([1, 1, 1, 0], [0, 0, 0, 0], [1, 1, 1, 0], 0, 0),
    // The DaemonSet asks first, so it is lit at entry (M-18a).
    lit: ['daemonset', 'desiredChip', 'focusChip'],
    // The count is derived on the answer (S-13).
    rewind: { chips: { desiredChip: '0' } },
    flow: [
      F.top({ from: DS_X, to: API_EDGE, y: REQ_Y, delay: BEAT.lead, name: 'list', lights: ['apiserver'] }),
      F.top({ from: API_EDGE, to: DS_X, y: RESP_Y, after: 'list', name: 'nodes' }),
      F.set({ at: 'nodes', chips: { desiredChip: '3' } }),
    ],
  },
  {
    id: 'place',
    duration: 5000,
    narration: 'The controller creates one Pod per matching Node through the API, each one pinned to its own Node by nodeAffinity. A DaemonSet keeps exactly one Pod per Node, and only a non-zero maxSurge during a rollout ever puts a second there, so the fleet follows the Node set instead of a replica number. A Node counts in numberReady once its Pod reports Ready.',
    chips: { desiredChip: '3', currentChip: '3', readyChip: '3', focusChip: 'one Pod per matching Node' },
    wires: { req: 'create one Pod per matching Node' },
    opacity: fleet([1, 1, 1, 0], [1, 1, 1, 0], [1, 1, 1, 0], 0, 0),
    lit: ['daemonset', 'focusChip', 'currentChip', 'readyChip'],
    // Pod pulses are the animated cue, so the static path lights the inner boxes instead.
    reducedLit: ['pod1Box', 'pod2Box', 'pod3Box'],
    // Starts from zero Pods, the creates raise both counts per arrival (S-13).
    rewind: { chips: { currentChip: '0', readyChip: '0' } },
    flow: [
      F.top({ from: DS_X, to: API_EDGE, y: REQ_Y, delay: BEAT.lead, name: 'req', lights: ['apiserver'] }),
      // In Node order: each count lands with its own create, so the played path ends on 3.
      ...create(0, '3'),
      ...create(1, '1'),
      ...create(2, '2'),
    ],
  },
  {
    id: 'node-join',
    duration: 3200,
    narration: 'Node-4 joins the cluster, but it carries no logging=enabled label, so the nodeSelector in the Pod template does not select it. The controller sees the new Node object and leaves desiredNumberScheduled at three. Joining the cluster is not what earns a Node a Pod, matching the selector is.',
    chips: { desiredChip: '3', currentChip: '3', readyChip: '3', focusChip: 'Node-4 joined, no match, no Pod' },
    wires: { req: 'watch Node added · nodeSelector does not match' },
    // Node-4 stays empty with no tap: a lane nothing is addressed to is an arrowhead over no traffic (A-05).
    opacity: fleet([1, 1, 1, 1], [1, 1, 1, 0], [1, 1, 1, 0], 1, 0),
    // The API sends the only ball, so it is lit at entry (M-18a).
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
    duration: 5700,
    narration: 'An operator labels Node-4 with logging=enabled. The controller watches Node objects, sees the update, recomputes desiredNumberScheduled to four and creates one Pod there. The three Pods already running are untouched, because the controller reconciles the difference and nothing about their Nodes changed.',
    chips: { desiredChip: '4', currentChip: '4', readyChip: '4', focusChip: 'a label makes a Node eligible' },
    wires: { req: 'Node-4 labelled logging=enabled · desiredNumberScheduled 3 to 4' },
    opacity: fleet([1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], 0, 1),
    lit: ['apiserver', 'desiredChip', 'currentChip', 'readyChip', 'focusChip'],
    reducedLit: ['pod4Box'],
    // The controller learns of the label by watching, so the frame and counters read unlabelled at entry.
    rewind: {
      opacity: { pod4: 0, lane3: 0, lbl4off: 1, lbl4on: 0 },
      chips: { desiredChip: '3', currentChip: '3', readyChip: '3' },
    },
    flow: [
      F.fade({ target: 'lbl4off', from: 1, to: 0, dur: FADE.out, fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'lbl4on', from: 0, to: 1, dur: FADE.in, fill: 'both', easing: 'ease-out' }),
      F.top({ from: API_EDGE, to: DS_X, y: RESP_Y, delay: FADE.out, name: 'watch', lights: ['daemonset'] }),
      // The tap is drawn as the Node enters the matching set, so the ball has a wire for its whole run (A-01).
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
    duration: 5100,
    narration: 'The image is bumped from fluentd v1 to v2. The RollingUpdate strategy with maxUnavailable=1 deletes and recreates the Pods one Node at a time, so numberReady sits at three while the Pod on Node-1 is replaced and log collection keeps running on the rest. The OnDelete strategy would instead wait until you delete each Pod by hand.',
    chips: { desiredChip: '4', currentChip: '4', readyChip: '3', focusChip: 'RollingUpdate · maxUnavailable=1' },
    wires: { req: 'delete the v1 Pod on Node-1 · then create v2' },
    // maxUnavailable=1: exactly one Pod down at a time, holding the not-ready shade.
    opacity: fleet([1, 1, 1, 1], [OPACITY.notready, 1, 1, 1], [1, 1, 1, 1], 0, 1),
    lit: ['daemonset', 'readyChip', 'focusChip'],
    reducedLit: ['pod1Box'],
    // The ball takes the Pod down, so the shade and numberReady change only on arrival.
    rewind: { opacity: { pod1: 1 }, chips: { readyChip: '4' } },
    flow: [
      F.top({ from: DS_X, to: API_EDGE, y: REQ_Y, delay: BEAT.lead, name: 'req', lights: ['apiserver'] }),
      // Ball first, pulse on arrival.
      F.route({ points: LANES[0], after: 'req', name: 'update', pulse: 'pod1' }),
      F.fade({ target: 'pod1', from: 1, to: OPACITY.notready, dur: FADE.out, at: 'update', fill: 'both', easing: 'ease-in' }),
      F.set({ at: 'update', chips: { readyChip: '3' } }),
    ],
  },
  {
    id: 'node-removed',
    duration: 4500,
    narration: 'Node-2 leaves the cluster and its Node object is deleted, so desiredNumberScheduled drops back to three and the Pod on Node-2 is garbage collected, not recreated elsewhere as a Deployment replica would be. A drain would not have removed it: a drain never evicts running DaemonSet Pods.',
    chips: { desiredChip: '3', currentChip: '3', readyChip: '3', focusChip: 'Node-2 gone, Pod not rescheduled' },
    wires: { req: 'Node-2 removed · delete its Pod · no reschedule' },
    // Node-2, its Pod, caption and tap go together (A-13, A-14).
    opacity: fleet([1, OPACITY.terminated, 1, 1], [1, 0, 1, 1], [1, 0, 1, 1], 0, 1),
    // The API sends the first ball, so it is lit at entry (M-18a), the DaemonSet lights on arrival.
    lit: ['currentChip', 'readyChip', 'focusChip', 'desiredChip', 'apiserver'],
    // The controller learns the Node left, so the counters stand on four Nodes until the event lands.
    rewind: {
      opacity: { pod2: 1, node2El: 1, lbl2: 1, lane1: 1 },
      chips: { desiredChip: '4', currentChip: '4', readyChip: '4' },
    },
    flow: [
      F.top({ from: API_EDGE, to: DS_X, y: RESP_Y, delay: BEAT.lead, name: 'watch', lights: ['daemonset'] }),
      // One status pass counts the Nodes that exist, so all three drop on the watch (P-04).
      F.set({ at: 'watch', chips: { desiredChip: '3', currentChip: '3', readyChip: '3' } }),
      F.route({ points: LANES[1], after: 'watch', name: 'del', pulse: 'pod2' }),
      F.fade({ target: 'pod2', from: 1, to: 0, dur: FADE.out, at: 'del', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'node2El', from: 1, to: OPACITY.terminated, dur: FADE.out, at: 'del', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'lbl2', from: 1, to: OPACITY.terminated, dur: FADE.out, at: 'del', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'lane1', from: 1, to: 0, dur: FADE.out, at: 'del', fill: 'both', easing: 'ease-in' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
