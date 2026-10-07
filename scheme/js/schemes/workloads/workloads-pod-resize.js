import { LANE_DY, P, F, defineCard, laneY, ladder, strip, midX, shade, WL, FADE, BEAT, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-pod-resize.md

// Three tiers on one spine. The narration panel must clear the Node frame, which caps narration length.
const M = WL.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;
const CX = midX(CONTENT_L, CONTENT_R);

// WL carries no BOX_W (the top row sizes each box to its label), so 232 is the cluster mode width.
const BOX_W = 232, BOX_H = WL.BOX_H;
// The API sits on the centre so the write descends one straight spine, which puts kubectl to its right.
const TOP_Y = WL.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;
const API_X = CX - BOX_W / 2, API_R = API_X + BOX_W;
// kubectl is right-aligned on CONTENT_R, sharing the rail the verdicts, Node frame and chips stand on.
const KUBECTL_X = CONTENT_R - BOX_W;
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, LANE_DY);
const WIRE_TOP_X = midX(API_R, KUBECTL_X);
const WIRE_TOP_Y = TOP_Y - 14;  // above the row

// Tier 2. The Kubelet on CX under the API, with the two pending verdicts hung off its right face.
const KUBE_X = API_X, KUBE_R = API_R;
const KUBE_Y = 218, KUBE_BOTTOM = KUBE_Y + BOX_H;
const KUBE_CY = midX(KUBE_Y, KUBE_BOTTOM);
const BR_W = 300, BR_H = 64;
const BR_X = CONTENT_R - BR_W;
const DEF_Y = 186, DEF_CY = DEF_Y + BR_H / 2;
const INF_Y = 266, INF_CY = INF_Y + BR_H / 2;
// The pair straddles KUBE_CY at the L-12 mirrored offsets and turns at the gap midpoint.
const BR_TURN_X = midX(KUBE_R, BR_X);
const { out: DEF_LANE_Y, back: INF_LANE_Y } = laneY(KUBE_CY, LANE_DY);
const KUBE_TO_DEFERRED = [[KUBE_R, DEF_LANE_Y], [BR_TURN_X, DEF_LANE_Y], [BR_TURN_X, DEF_CY], [BR_X, DEF_CY]];
const KUBE_TO_INFEASIBLE = [[KUBE_R, INF_LANE_Y], [BR_TURN_X, INF_LANE_Y], [BR_TURN_X, INF_CY], [BR_X, INF_CY]];
// One label row at the visual centre of the gap between the top row and the verdicts.
const WIRE_MID_Y = midX(TOP_BOTTOM, KUBE_Y) + 4;
const WIRE_MID_X = CX + 12;  // right of the drop it labels

// Tier 3: the Node band on the WL frame padding.
const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;
const POD_W = 420, POD_H = 106;
const NODE_Y = 380, NODE_H = 34 + POD_H + 12;
const POD_X = CX - POD_W / 2;
const POD_Y = NODE_Y + 34;
const CONT_W = 280, CONT_H = 64;
const CONT_X = CX - CONT_W / 2;
const CONT_Y = POD_Y + 30;
// Two straight drops on the spine, the second addressed to the Node frame, not the Pod inside it.
const API_TO_KUBELET = [[CX, TOP_BOTTOM], [CX, KUBE_Y]];
const NODE_CONNECTOR = [[CX, KUBE_BOTTOM], [CX, NODE_Y]];
// Derived off the Infeasible box, not the gap midpoint: the actuate string would cross the box.
const WIRE_ACT_Y = INF_Y + BR_H + 24;

// Two per row: four across and the names overlap their values.
const CHIP_H = WL.CHIP_H, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = 548;
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// Read as a grid: the index wraps across the two columns.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

// A standing spec field no step changes, so every step restates it.
const POLICY = 'cpu NotRequired · memory RestartContainer';

// List order is z-order: lanes, wire labels and chips, packets, then the Node and Pod, then boxes above a ball.
export const SCENE = {
  'aria-label': 'In-place Pod resize: a patch through the resize subresource, the Kubelet allocating the new values or raising PodResizePending with reason Deferred or Infeasible, resizePolicy deciding whether the container restarts, the new limit reaching the running container, and the QoS class that no resize may move',
  parts: [
    P.defs(),
    // Every actor above the Node band and every leg between them is pinned role: 'cluster'.
    P.arrow({ x1: KUBECTL_X, y1: REQ_Y, x2: API_R, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: API_R, y1: RESP_Y, x2: KUBECTL_X, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ points: API_TO_KUBELET, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ points: NODE_CONNECTOR, dim: true, dashed: true, role: 'cluster' }),
    // Nothing rides these: they say what the decision may produce.
    P.relation({ key: 'defRel', points: KUBE_TO_DEFERRED, dash: '5 5', role: 'cluster' }),
    P.relation({ key: 'infRel', points: KUBE_TO_INFEASIBLE, dash: '5 5', role: 'cluster' }),
    P.wire({ key: 'top', x: WIRE_TOP_X, y: WIRE_TOP_Y }),
    P.wire({ key: 'spec', x: WIRE_MID_X, y: WIRE_MID_Y, anchor: 'start' }),
    P.wire({ key: 'branch', x: BR_X, y: WIRE_MID_Y, anchor: 'start' }),
    P.wire({ key: 'actuate', x: WIRE_MID_X, y: WIRE_ACT_Y, anchor: 'start' }),
    P.chip({ key: 'specChip', x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'spec.containers[].resources', value: 'cpu 700m · memory 200Mi' }),
    P.chip({ key: 'statusChip', x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'status.containerStatuses[].resources', value: 'cpu 700m · memory 200Mi' }),
    P.chip({ key: 'policyChip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'resizePolicy', value: POLICY }),
    P.chip({ key: 'condChip', x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'Pod resize condition', value: 'none' }),
    P.packets(),
    // Frame, then everything that must sit above the balls.
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.pod({
      key: 'podGroup', id: 'podGroup', innerKey: 'containerBox',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-1', sublabel: '', containers: 0,
      inner: { dx: CONT_X - POD_X, dy: CONT_Y - POD_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'cpu.max 70000 100000 · restartCount 0' },
    }),
    P.box({ key: 'deferredBox', x: BR_X, y: DEF_Y, w: BR_W, h: BR_H, label: 'Deferred', sublabel: 'may fit later, the Kubelet retries', role: 'cluster' }),
    P.box({ key: 'infeasibleBox', x: BR_X, y: INF_Y, w: BR_W, h: BR_H, label: 'Infeasible', sublabel: 'this Node can never fit it', role: 'cluster' }),
    P.box({ key: 'kubelet', x: KUBE_X, y: KUBE_Y, w: BOX_W, h: BOX_H, label: 'Kubelet', sublabel: 'allocates, then actuates', role: 'cluster' }),
    P.box({ key: 'apiserver', x: API_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'API', sublabel: 'pods and the resize subresource', role: 'cluster' }),
    P.box({ key: 'kubectl', x: KUBECTL_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'kubectl', sublabel: 'patch --subresource resize', role: 'cluster' }),
  ],
  reset: {
    keys: ['apiserver', 'kubectl', 'kubelet', 'deferredBox', 'infeasibleBox', 'specChip', 'statusChip', 'policyChip', 'condChip', 'containerBox'],
    pods: ['podGroup'],
  },
};

const OLD = 'cpu 700m · memory 200Mi', NEW = 'cpu 800m · memory 200Mi';
const CG_OLD = 'cpu.max 70000 100000 · restartCount 0';
const CG_NEW = 'cpu.max 80000 100000 · restartCount 0';
const PENDING = 'PodResizePending · only if not allocated now';
const IN_PROGRESS = 'PodResizeInProgress · allocated, applying';
const SETTLED = 'none · status now matches spec';
// The verdict pair is a branch not taken, at full only on the step that argues it.
const ASIDE = OPACITY.notready;
const BRANCH_KEYS = ['deferredBox', 'infeasibleBox', 'defRel', 'infRel'];
const branchAt = v => shade(BRANCH_KEYS, v);

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { specChip: OLD, statusChip: OLD, policyChip: POLICY, condChip: 'none' },
    sublabels: { containerBox: CG_OLD },
    opacity: { podGroup: 1, ...branchAt(ASIDE) },
  },
  {
    id: 'running',
    duration: 2800,
    narration: 'One container runs with cpu 700m and memory 200Mi as both its request and its limit, so this Pod is Guaranteed. Changing those numbers once meant deleting the Pod and creating a replacement. In-place Pod resize is stable in 1.35 and moves them on the Pod that is already running.',
    chips: { specChip: OLD, statusChip: OLD, policyChip: POLICY, condChip: 'none' },
    sublabels: { containerBox: CG_OLD },
    opacity: { podGroup: 1, ...branchAt(ASIDE) },
    lit: ['specChip', 'statusChip'],
    // The app box pulses with the Pod rather than lit: a lit box outlives the blink.
    flow: [F.pulse({ pod: 'podGroup' })],
  },
  {
    id: 'patch',
    duration: 3200,
    narration: 'A patch through the resize subresource raises the desired cpu to 800m, and kubectl needs client version v1.32 or later to address that subresource. Only cpu and memory can be resized, and neither can be dropped once it is set. The spec carries the ask, so nothing on Node-1 has moved yet.',
    chips: { specChip: NEW, statusChip: OLD, policyChip: POLICY, condChip: 'none' },
    wires: { top: 'PATCH /api/v1/namespaces/default/pods/web-1/resize' },
    sublabels: { containerBox: CG_OLD },
    opacity: { podGroup: 1, ...branchAt(ASIDE) },
    lit: ['kubectl', 'specChip'],
    // The desired value exists only once the write lands.
    rewind: { chips: { specChip: OLD } },
    flow: [
      F.top({ from: KUBECTL_X, to: API_R, y: REQ_Y, delay: BEAT.lead, name: 'patch', lights: ['apiserver'] }),
      F.top({ from: API_R, to: KUBECTL_X, y: RESP_Y, after: 'patch' }),
      F.set({ at: 'patch', chips: { specChip: NEW } }),
    ],
  },
  {
    id: 'policy',
    duration: 3700,
    narration: 'The resizePolicy field answers, per resource, whether the container survives the change. NotRequired is the default and applies the new value to the running container. RestartContainer restarts it, which memory often needs because many applications cannot grow their allocation on the fly. Change two resources whose policies differ and RestartContainer takes precedence.',
    chips: { specChip: NEW, statusChip: OLD, policyChip: POLICY, condChip: 'none' },
    sublabels: { containerBox: CG_OLD },
    opacity: { podGroup: 1, ...branchAt(ASIDE) },
    lit: ['policyChip', 'containerBox'],
  },
  {
    id: 'admit',
    duration: 3300,
    narration: 'The Kubelet reads the new spec off its watch and decides. It can allocate the value now, or it raises PodResizePending with reason Deferred when the Node has no room yet and keeps retrying, or Infeasible when this Node can never fit it. Deferred retries go by Priority first, then Guaranteed before Burstable, then longest waiting.',
    chips: { specChip: NEW, statusChip: OLD, policyChip: POLICY, condChip: PENDING },
    wires: { spec: 'spec.containers[].resources', branch: 'if the Kubelet cannot allocate it now' },
    sublabels: { containerBox: CG_OLD },
    opacity: { podGroup: 1, ...branchAt(1) },
    // The API acts first, so it is lit and the event waits BEAT.lead (M-18a).
    lit: ['apiserver', 'condChip'],
    rewind: { chips: { condChip: 'none' } },
    flow: [
      F.route({ points: API_TO_KUBELET, delay: BEAT.lead, name: 'watch', lights: ['kubelet', 'deferredBox', 'infeasibleBox'] }),
      ...BRANCH_KEYS.map(k => F.fade({ target: k, from: ASIDE, to: 1, dur: FADE.in, at: 'watch', fill: 'both', easing: 'ease-out' })),
      F.set({ at: 'watch', chips: { condChip: PENDING } }),
    ],
  },
  {
    id: 'apply',
    duration: 3700,
    narration: 'Once the Kubelet allocates it, PodResizeInProgress stands while the runtime rewrites the limit on the live container and cpu.max follows, then status.containerStatuses[].resources catches up with the spec. The cpu policy is NotRequired, so restartCount stays 0. Lowering a memory limit under NotRequired is best effort and is skipped while usage sits above the new value.',
    chips: { specChip: NEW, statusChip: NEW, policyChip: POLICY, condChip: SETTLED },
    wires: { actuate: 'UpdateContainerResources · cpu.max on the live container' },
    sublabels: { containerBox: CG_NEW },
    opacity: { podGroup: 1, ...branchAt(ASIDE) },
    lit: ['kubelet', 'statusChip', 'condChip'],
    // Nothing on the container changes until the call lands.
    rewind: { chips: { statusChip: OLD, condChip: IN_PROGRESS }, sublabels: { containerBox: CG_OLD } },
    // The Kubelet acts first, so its call waits BEAT.lead (M-18a). The app box pulses with its Pod, not lit.
    flow: [
      F.route({ points: NODE_CONNECTOR, delay: BEAT.lead, name: 'apply' }),
      F.set({ at: 'apply', chips: { statusChip: NEW, condChip: SETTLED }, sublabels: { containerBox: CG_NEW } }),
      F.pulse({ pod: 'podGroup', at: 'apply' }),
    ],
  },
  {
    id: 'qos',
    duration: 3300,
    narration: 'The QoS class is fixed when the Pod is created and no resize may move it, so on this Guaranteed Pod every request must stay equal to its limit. A patch that would land it in Burstable is refused by the API server, before the Kubelet ever sees it. The Pod QoS Classes card covers how the class is derived.',
    chips: { specChip: NEW, statusChip: NEW, policyChip: POLICY, condChip: SETTLED },
    wires: { top: 'PATCH .../resize · refused by the API server' },
    sublabels: { containerBox: CG_NEW },
    opacity: { podGroup: 1, ...branchAt(ASIDE) },
    lit: ['kubectl'],
    // The refusal never reaches the Node, so the moved chips stay put.
    flow: [
      F.top({ from: KUBECTL_X, to: API_R, y: REQ_Y, delay: BEAT.lead, name: 'reject', lights: ['apiserver'] }),
      F.top({ from: API_R, to: KUBECTL_X, y: RESP_Y, after: 'reject' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
