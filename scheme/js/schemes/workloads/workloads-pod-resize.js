import { P, F, defineCard, laneY, ladder, strip, midX, shade, WL, FADE, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS.md#workloads-pod-resize

// Three tiers on one spine. Panel worst case x<=396.55 y<=279.51 at 1100x800, and the Node frame at
// 394 is what it clears, so no narration may pass roughly 490 characters.
const M = WL.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = midX(CONTENT_L, CONTENT_R);                   // 600, the canvas centre by construction

// WL carries no BOX_W: the workloads top row sizes each box to its own label (220, 280 or 360) and
// has no shared width to take, so 232 stays as the cluster mode this card was laid out on.
const BOX_W = 232, BOX_H = WL.BOX_H;                     // 232 / 80
// Tier 1. The API sits on CX so the whole write descends one straight spine, which puts kubectl to
// its RIGHT and reverses the top row: the same trade cluster-static-pods makes, for the same reason.
const TOP_Y = WL.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;      // 40 / 120
const TOP_GAP = 56;
const API_X = CX - BOX_W / 2, API_R = API_X + BOX_W;     // 484..716
const KUBECTL_X = API_R + TOP_GAP;                       // 772..1004
const LANE_DY = WL.LANE_DY, TOP_CY = midX(TOP_Y, TOP_BOTTOM);    // 12 / 80
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, LANE_DY);     // 68 / 92
const WIRE_TOP_X = midX(API_R, KUBECTL_X);               // 744
const WIRE_TOP_Y = TOP_Y - 14;                           // 26, above the row

// Tier 2. The Kubelet on CX under the API, with the two pending verdicts hung off its right face.
const KUBE_X = API_X, KUBE_R = API_R;                    // 484..716
const KUBE_Y = 218, KUBE_BOTTOM = KUBE_Y + BOX_H;        // 218..298
const KUBE_CY = midX(KUBE_Y, KUBE_BOTTOM);               // 258
const BR_W = 300, BR_H = 64;
const BR_X = CONTENT_R - BR_W;                           // 840..1140
const DEF_Y = 186, DEF_CY = DEF_Y + BR_H / 2;            // 186..250, face 218
const INF_Y = 266, INF_CY = INF_Y + BR_H / 2;            // 266..330, face 298
// The pair straddles KUBE_CY, so both relations leave one face at the mirrored offsets L-12 reads
// as a deliberate pair, and turn at the midpoint of the gap.
const BR_TURN_X = midX(KUBE_R, BR_X);                    // 778
const { out: DEF_LANE_Y, back: INF_LANE_Y } = laneY(KUBE_CY, LANE_DY);   // 246 / 270
const KUBE_TO_DEFERRED = [[KUBE_R, DEF_LANE_Y], [BR_TURN_X, DEF_LANE_Y], [BR_TURN_X, DEF_CY], [BR_X, DEF_CY]];
const KUBE_TO_INFEASIBLE = [[KUBE_R, INF_LANE_Y], [BR_TURN_X, INF_LANE_Y], [BR_TURN_X, INF_CY], [BR_X, INF_CY]];
// One label row across the gap between the top row and the verdicts, at the visual centre of it.
const WIRE_MID_Y = midX(TOP_BOTTOM, KUBE_Y) + 4;         // 173
const WIRE_MID_X = CX + 12;                              // 612, right of the drop it labels

// Tier 3: the Node band. Frame family 134 / 106 / 20, the one workloads-graceful-shutdown carries,
// and NODE_Y 394 is what keeps the Pod on the 414..520 band everything else was measured against.
const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;// 60..1140
const NODE_Y = 394, NODE_H = 134;                        // 394..528
const POD_W = 420, POD_H = 106;                          // 420 / 106
const POD_X = CX - POD_W / 2;                            // 390..810
const POD_Y = NODE_Y + 20;                               // 414..520
const CONT_W = 280, CONT_H = 64;
const CONT_X = CX - CONT_W / 2;                          // 460..740
const CONT_Y = POD_Y + 30;                               // 444..508
// The two lanes the write travels, each a straight drop on the spine: Api.bottom -> Kubelet.top,
// then Kubelet.bottom -> the Node frame, addressed to the NODE and not to the Pod inside it.
const API_TO_KUBELET = [[CX, TOP_BOTTOM], [CX, KUBE_Y]];
const NODE_CONNECTOR = [[CX, KUBE_BOTTOM], [CX, NODE_Y]];
// 354, not the 343 the gap midpoint gives: at 343 the 343.6 wide actuate string runs 612..955.6
// and sits 2 units under the Infeasible box it overlaps in x. Derived off that box instead.
const WIRE_ACT_Y = INF_Y + BR_H + 24;                    // 354

// Bottom strip, TWO per row: four across leaves 258 units and the names overlap their values.
const CHIP_H = WL.CHIP_H, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = 548;                                     // 2 rows -> 548..582 / 590..624
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;                               // 532, which is LAYOUT.C.strip.two
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// The strip is read as a GRID: the index wraps across the two columns and steps down every second.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

// resizePolicy is a standing spec field that no step on this card changes, so it is a lookup on the
// chip rather than a sentence, and every step restates it.
const POLICY = 'cpu NotRequired · memory RestartContainer';

// The list order IS the append order, so it is the z-order: lanes, wire labels and chips first, the
// packet layer, then the Node frame and its Pod, then every box that must sit above a ball.
export const SCENE = {
  'aria-label': 'In-place Pod resize: a patch through the resize subresource, the Kubelet allocating the new values or raising PodResizePending with reason Deferred or Infeasible, resizePolicy deciding whether the container restarts, the new limit reaching the running container, and the QoS class that no resize may move',
  parts: [
    P.defs(),
    // Top-row lanes, one per direction, straddling the row centre line by LANE_DY. Every actor
    // above the Node band and every leg between them is pinned role: 'cluster', see the record.
    P.arrow({ x1: KUBECTL_X, y1: REQ_Y, x2: API_R, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: API_R, y1: RESP_Y, x2: KUBECTL_X, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // The spine, both legs carrying a ball on the step that narrates them.
    P.lane({ points: API_TO_KUBELET, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ points: NODE_CONNECTOR, dim: true, dashed: true, role: 'cluster' }),
    // Two verdicts the Kubelet can land on. Nothing rides these, so they are relations: they say
    // what the decision may produce, they do not carry traffic.
    P.relation({ key: 'defRel', points: KUBE_TO_DEFERRED, dash: '5 5', role: 'cluster' }),
    P.relation({ key: 'infRel', points: KUBE_TO_INFEASIBLE, dash: '5 5', role: 'cluster' }),
    // Wire labels at fixed positions, populated per step.
    P.wire({ key: 'top', x: WIRE_TOP_X, y: WIRE_TOP_Y }),
    P.wire({ key: 'spec', x: WIRE_MID_X, y: WIRE_MID_Y, anchor: 'start' }),
    P.wire({ key: 'branch', x: BR_X, y: WIRE_MID_Y, anchor: 'start' }),
    P.wire({ key: 'actuate', x: WIRE_MID_X, y: WIRE_ACT_Y, anchor: 'start' }),
    // State chips, a two-column bottom strip across the content width.
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
    // Top-row blocks ABSOLUTE LAST.
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
const PENDING = 'PodResizePending · Deferred or Infeasible';
const IN_PROGRESS = 'PodResizeInProgress · allocated, applying';
const SETTLED = 'none · status now matches spec';
// The verdict pair is a branch the card shows and does not take, so it rests at the shade for
// something outside this path and comes to full only on the step that argues it.
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
    duration: 2400,
    narration: 'One container runs with cpu 700m and memory 200Mi as both its request and its limit, so this Pod is Guaranteed. Changing those numbers once meant deleting the Pod and creating a replacement. In-place Pod resize is stable in 1.35 and moves them on the Pod that is already running.',
    chips: { specChip: OLD, statusChip: OLD, policyChip: POLICY, condChip: 'none' },
    sublabels: { containerBox: CG_OLD },
    opacity: { podGroup: 1, ...branchAt(ASIDE) },
    lit: ['specChip', 'statusChip', 'containerBox'],
    // Nothing travels: the pulse is what says the Pod on the frame is the subject of the card.
    flow: [F.pulse({ pod: 'podGroup' })],
  },
  {
    id: 'patch',
    duration: 2600,
    narration: 'A patch through the resize subresource raises the desired cpu to 800m, and kubectl needs client version v1.32 or later to address that subresource. Only cpu and memory can be resized, and neither can be dropped once it is set. The spec carries the ask, so nothing on Node-1 has moved yet.',
    chips: { specChip: NEW, statusChip: OLD, policyChip: POLICY, condChip: 'none' },
    wires: { top: 'PATCH /api/v1/namespaces/default/pods/web-1/resize' },
    sublabels: { containerBox: CG_OLD },
    opacity: { podGroup: 1, ...branchAt(ASIDE) },
    lit: ['kubectl', 'specChip'],
    // The desired value only exists once the write lands, so the chip holds the old reading for
    // the flight and turns over on arrival.
    rewind: { chips: { specChip: OLD } },
    flow: [
      F.top({ from: KUBECTL_X, to: API_R, y: REQ_Y, name: 'patch', lights: ['apiserver'] }),
      F.top({ from: API_R, to: KUBECTL_X, y: RESP_Y, after: 'patch' }),
      F.set({ at: 'patch', chips: { specChip: NEW } }),
    ],
  },
  {
    id: 'policy',
    duration: 3000,
    narration: 'The resizePolicy field answers, per resource, whether the container survives the change. NotRequired is the default and applies the new value to the running container. RestartContainer restarts it, which memory often needs because many applications cannot grow their allocation on the fly. Change both resources at once and the restart wins.',
    chips: { specChip: NEW, statusChip: OLD, policyChip: POLICY, condChip: 'none' },
    sublabels: { containerBox: CG_OLD },
    opacity: { podGroup: 1, ...branchAt(ASIDE) },
    // A spec field being read, so nothing travels and nothing pulses: the two things the policy is
    // about carry the beat as a static highlight.
    lit: ['policyChip', 'containerBox'],
  },
  {
    id: 'admit',
    duration: 2800,
    narration: 'The Kubelet reads the new spec off its watch and decides. It can allocate the value now, or it raises PodResizePending with reason Deferred when the Node has no room yet and keeps retrying, or Infeasible when this Node can never fit it. Deferred retries go by Priority first, then Guaranteed before Burstable, then longest waiting.',
    chips: { specChip: NEW, statusChip: OLD, policyChip: POLICY, condChip: PENDING },
    wires: { spec: 'watch · new spec.resources', branch: 'if the Kubelet cannot allocate it now' },
    sublabels: { containerBox: CG_OLD },
    opacity: { podGroup: 1, ...branchAt(1) },
    lit: ['deferredBox', 'infeasibleBox', 'condChip'],
    // The verdict pair is the aside this step argues, so it comes to full with the watch event that
    // reaches the Kubelet, and the condition is only set once the Kubelet has read the spec.
    rewind: { chips: { condChip: 'none' } },
    flow: [
      F.route({ points: API_TO_KUBELET, name: 'watch', lights: ['kubelet'] }),
      ...BRANCH_KEYS.map(k => F.fade({ target: k, from: ASIDE, to: 1, dur: FADE.in, at: 'watch', fill: 'both', easing: 'ease-out' })),
      F.set({ at: 'watch', chips: { condChip: PENDING } }),
    ],
  },
  {
    id: 'apply',
    duration: 3000,
    narration: 'Once the Kubelet allocates it, PodResizeInProgress stands while the runtime rewrites the limit on the live container and cpu.max follows, then status.containerStatuses[].resources catches up with the spec. The cpu policy is NotRequired, so restartCount stays 0. Lowering a memory limit is best effort and is skipped while usage sits above the new value.',
    chips: { specChip: NEW, statusChip: NEW, policyChip: POLICY, condChip: SETTLED },
    wires: { actuate: 'UpdateContainerResources · cpu.max on the live container' },
    sublabels: { containerBox: CG_NEW },
    opacity: { podGroup: 1, ...branchAt(ASIDE) },
    lit: ['kubelet', 'statusChip', 'condChip', 'containerBox'],
    // Nothing on the container has changed until the call lands, so the status chip, the cgroup
    // reading and the condition all hold what admit left and turn over together on arrival.
    rewind: { chips: { statusChip: OLD, condChip: IN_PROGRESS }, sublabels: { containerBox: CG_OLD } },
    flow: [
      F.route({ points: NODE_CONNECTOR, name: 'apply' }),
      F.set({ at: 'apply', chips: { statusChip: NEW, condChip: SETTLED }, sublabels: { containerBox: CG_NEW } }),
      F.pulse({ pod: 'podGroup', at: 'apply' }),
    ],
  },
  {
    id: 'qos',
    duration: 2600,
    narration: 'The QoS class is fixed when the Pod is created and no resize may move it, so on this Guaranteed Pod every request must stay equal to its limit. A patch that would land it in Burstable is refused by admission, before the Kubelet ever sees it. The Pod QoS Classes card covers how the class is derived.',
    chips: { specChip: NEW, statusChip: NEW, policyChip: POLICY, condChip: SETTLED },
    wires: { top: 'resize refused at admission · the QoS class is fixed' },
    sublabels: { containerBox: CG_NEW },
    opacity: { podGroup: 1, ...branchAt(ASIDE) },
    lit: ['kubectl'],
    // The refusal never reaches the Node, so the two chips the card has moved stay where apply left
    // them: a request that changes nothing is the whole content of the step.
    flow: [
      F.top({ from: KUBECTL_X, to: API_R, y: REQ_Y, name: 'reject', lights: ['apiserver'] }),
      F.top({ from: API_R, to: KUBECTL_X, y: RESP_Y, after: 'reject' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
