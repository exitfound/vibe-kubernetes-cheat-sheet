import { P, F, defineCard, laneY, ladder, midX, CLU, POD_VIOLET, FADE, OPACITY } from './cluster-kit.js';
import { g } from '../../lib/svg.js';
import { box } from '../../lib/primitives.js';

// Design notes for this card: ./CARDS.md#cluster-pod-sandbox-cri

// Laid out on the L. Panel x<=397 y<=213, and the two do NOT peak together: widest where shallow,
// deepest where narrow. The right edge caps the top row at 404, the bottom clears the columns at 235.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = midX(CONTENT_L, CONTENT_R);                   // 600, the canvas centre by construction

// Anchored on its RIGHT edge and built leftwards, with 404 a HARD left stop. The room for the lanes
// comes out of the BOXES, not out of that stop: see ./CARDS.md.
const TOP_Y = CLU.TOP_Y, BOX_H = CLU.BOX_H, TOP_BOTTOM = TOP_Y + BOX_H;   // 40 / 120
const KUBE_W = 180, RT_W = 210, CNI_W = 180, TOP_GAP = 83;
const CNI_X = CONTENT_R - CNI_W;  // 960..1140
const RT_R = CNI_X - TOP_GAP, RT_X = RT_R - RT_W;        // 667..877
const KUBE_R = RT_X - TOP_GAP, KUBE_X = KUBE_R - KUBE_W; // 404..584
const LANE_DY = CLU.LANE_DY, TOP_CY = midX(TOP_Y, TOP_BOTTOM);   // 12 / 80
const { out: CALL_Y, back: BACK_Y } = laneY(TOP_CY, LANE_DY);    // 68 / 92
const WIRE_Y = TOP_BOTTOM + 24;                          // 144
const WIRE_KR_X = midX(KUBE_R, RT_X);                    // 625.5
const WIRE_RC_X = midX(RT_R, CNI_X);                     // 918.5

// The left band opens below the panel.
const LADDER_X = CONTENT_L, LADDER_W = 430;              // 60..490, clear of the spine
const LADDER_Y = 235, ROW_H = CLU.ROW_H, ROW_GAP = CLU.ROW_GAP;   // 5 rows -> 235..435

const CHIP_X = 620, CHIP_W = CONTENT_R - CHIP_X;         // 520, 620..1140
const CHIP_H = CLU.CHIP_H, CHIP_GAP = 22;
const CHIP_Y = ladder({ y: LADDER_Y, rowH: CHIP_H, gap: CHIP_GAP });  // 235 / 291 / 347 / 403, bottom 437

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;// 60..1140
const NODE_Y = 462, NODE_H = 158;                        // 462..620
const POD_W = 460, POD_H = 116;
const POD_X = CX - POD_W / 2;                            // 370..830
const POD_Y = NODE_Y + 22;                               // 484..600
const INNER_W = 190, INNER_H = 54, INNER_DX = 22, INNER_DY = 30;
const INNER_Y = POD_Y + INNER_DY;                        // 514..568
// The pause box is inset from the left face, the app box from the right one by the same 22.
const APP_X = POD_X + POD_W - INNER_DX - INNER_W;        // 618..808

// The lane from the RUNTIME down into the Node, not from Kubelet: Kubelet is a CRI CLIENT and never
// touches the sandbox. routeDur is length-based, so its start point IS a timing decision.
const SPINE_X = midX(RT_X, RT_R);                        // 772
// A centred zigzag into the NODE, not the Pod inside it. THE TURN GOES ABOVE BOTH COLUMNS, or the
// vertical leg drops straight through all four chips, which THROUGH cannot see.
const JOG_Y = midX(TOP_BOTTOM, LADDER_Y);                // 177.5, clear of the wire labels at y=144
const SANDBOX_CONNECTOR = [[SPINE_X, TOP_BOTTOM], [SPINE_X, JOG_Y], [CX, JOG_Y], [CX, NODE_Y]];

// The list order IS the append order, so it is the z-order: the ladder and the Node frame holding the
// Pod sandbox sit above the packet layer, and the three top-row blocks go absolute last.
export const SCENE = {
  'aria-label': 'Pod sandbox via CRI: RunPodSandbox creates the pause container, CNI attaches the network, PullImage, CreateContainer and StartContainer launch the workload inside the sandbox',
  parts: [
    P.defs(),
    // Top arrows, symmetric about each box centre (y=80, so +/-15 -> 65 and 95).
    P.arrow({ x1: KUBE_R, y1: CALL_Y, x2: RT_X, y2: CALL_Y, dim: true, dashed: true }),
    P.arrow({ x1: RT_X, y1: BACK_Y, x2: KUBE_R, y2: BACK_Y, dim: true, dashed: true }),
    P.arrow({ x1: RT_R, y1: CALL_Y, x2: CNI_X, y2: CALL_Y, dim: true, dashed: true }),
    P.arrow({ x1: CNI_X, y1: BACK_Y, x2: RT_R, y2: BACK_Y, dim: true, dashed: true }),
    P.wire({ key: 'kr', x: WIRE_KR_X, y: WIRE_Y }),
    P.wire({ key: 'rc', x: WIRE_RC_X, y: WIRE_Y }),
    // State chips in the right column, on the ladder rhythm with a wider gap.
    P.chip({ key: 'sandboxChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'sandbox id', value: 'none' }),
    P.chip({ key: 'ipChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'Pod IP', value: 'none' }),
    P.chip({ key: 'statusChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'status', value: 'none' }),
    P.chip({ key: 'lastOpChip', x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'last op', value: 'none' }),
    // The runtime does the work on the node: connector drops straight into the node top centre.
    P.lane({ key: 'connector', points: SANDBOX_CONNECTOR, dim: true, dashed: true }),
    P.packets(),
    P.chain({
      key: 'chain', x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. RunPodSandbox   ·  pause container, shared namespaces',
        '2. CNI ADD         ·  veth pair, IPAM, route',
        '3. PullImage       ·  fetch image (skipped if cached)',
        '4. CreateContainer ·  cgroups, mounts, env',
        '5. StartContainer  ·  fork ENTRYPOINT inside sandbox',
      ],
    }),
    // Full content width, so its top face midpoint is CX and the zigzag lands dead centre on it.
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    // sandboxGroup (shell + pause) appears together at RunPodSandbox; appGroup later.
    P.pod({
      key: 'sandboxGroup', id: 'sandboxGroup', shellKey: 'shellEl', innerKey: 'pauseBox',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod sandbox', sublabel: ' ', containers: 0,
      inner: { dx: INNER_DX, dy: INNER_DY, w: INNER_W, h: INNER_H, label: 'pause', sublabel: 'netns · IPC · UTS' },
      // A SECOND inner box under its own id, so it can fade and pulse on a beat of its own. Inside
      // the shell, not beside it: pulsePod only reaches what the Pod group contains.
      tune: (el, refs) => {
        const appBox = box({ x: APP_X, y: INNER_Y, w: INNER_W, h: INNER_H, label: 'app', sublabel: 'ENTRYPOINT', role: 'workloads' });
        appBox.style.setProperty('--workloads-color', POD_VIOLET);
        const appGroup = g({ id: 'appGroup' });
        appGroup.appendChild(appBox);
        el.appendChild(appGroup);
        refs.appGroup = appGroup;
        refs.appBox = appBox;
      },
    }),
    // Top-row blocks ABSOLUTE LAST.
    P.box({ key: 'kubelet', x: KUBE_X, y: TOP_Y, w: KUBE_W, h: BOX_H, label: 'Kubelet', sublabel: 'CRI client' }),
    P.box({ key: 'runtime', x: RT_X, y: TOP_Y, w: RT_W, h: BOX_H, label: 'containerd', sublabel: 'CRI gRPC server' }),
    P.box({ key: 'cni', x: CNI_X, y: TOP_Y, w: CNI_W, h: BOX_H, label: 'CNI plugin', sublabel: 'veth + IPAM' }),
  ],
  // Both groups DO go to clearHighlights: the card pulses each of them in turn, and the pulse has
  // to come back off between steps.
  reset: {
    keys: ['kubelet', 'runtime', 'cni', 'sandboxChip', 'ipChip', 'statusChip', 'lastOpChip'],
    pods: ['sandboxGroup', 'appGroup'],
  },
};

const SANDBOX_ID = 'pause-7f3a', POD_IP = '10.244.1.5';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { sandboxChip: 'none', ipChip: 'none', statusChip: 'none', lastOpChip: 'none' },
    sublabels: { appBox: 'ENTRYPOINT' },
    podSublabels: { shellEl: ' ' },
    opacity: { sandboxGroup: 0, appGroup: 0 },
    chain: -1,
  },
  {
    id: 'sandbox',
    duration: 3100,
    narration: 'Kubelet calls RunPodSandbox with the Pod namespace, labels, and resource hints. The runtime creates a pause container that holds the network, IPC, and UTS namespaces every workload container will share by default. The PID namespace is shared only when spec.shareProcessNamespace is set.',
    chips: { sandboxChip: SANDBOX_ID, ipChip: 'none', statusChip: 'sandbox ready', lastOpChip: 'RunPodSandbox' },
    wires: { kr: 'RunPodSandbox' },
    podSublabels: { shellEl: 'sandbox ready' },
    // Pin final state inline so cancel does not flash to default.
    opacity: { appGroup: 0, sandboxGroup: 1 },
    lit: ['statusChip', 'kubelet', 'sandboxChip', 'lastOpChip'],
    chain: 0,
    // gRPC to the runtime, then the runtime materialises the sandbox on the node.
    flow: [
      F.top({ from: KUBE_R, to: RT_X, y: CALL_Y, name: 'grpc', lights: ['runtime'] }),
      F.route({ points: SANDBOX_CONNECTOR, after: 'grpc', name: 'run' }),
      F.fade({ target: 'sandboxGroup', from: 0, to: 1, dur: FADE.in, at: 'run', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'sandboxGroup', at: 'run' }),
    ],
  },
  {
    id: 'cni',
    duration: 3100,
    narration: 'As part of sandbox setup the runtime invokes the configured CNI plugin with the sandbox netns path. The plugin creates a veth pair, allocates an IP via IPAM, configures routes, and returns the result. The Pod IP is now set on the sandbox.',
    chips: { sandboxChip: SANDBOX_ID, ipChip: POD_IP, statusChip: 'sandbox ready · IP set', lastOpChip: 'CNI ADD' },
    wires: { rc: 'ADD · netns + IPAM' },
    podSublabels: { shellEl: 'IP 10.244.1.5' },
    opacity: { appGroup: 0, sandboxGroup: 1 },
    lit: ['statusChip', 'lastOpChip', 'runtime', 'ipChip'],
    chain: 1,
    flow: [
      // Runtime execs CNI (right arrow), then the netns config lands on the sandbox.
      F.top({ from: RT_R, to: CNI_X, y: CALL_Y, name: 'exec' }),
      // "returns the result" is in the narration, and the return lane is drawn: it just never carried
      // anything. The result comes back to the runtime before the sandbox is configured below.
      F.top({ from: CNI_X, to: RT_R, y: BACK_Y, after: 'exec' }),
      // The CNI cue is its own entry rather than `lights` on the exec hop: it is emitted AFTER the
      // return packet, and getAnimations() hands them back in emission order.
      F.light({ targets: ['cni'], at: 'exec' }),
      F.route({ points: SANDBOX_CONNECTOR, after: 'exec', name: 'conf' }),
      F.pulse({ pod: 'sandboxGroup', at: 'conf' }),
    ],
  },
  {
    id: 'image',
    duration: 1900,
    narration: 'Kubelet calls PullImage for each container in the Pod, respecting imagePullPolicy and imagePullSecrets. The runtime fetches the image from the registry into the Node image store, or reuses a cached layer set if it is already local. No container exists yet.',
    // `pulled`, not `cached`: this step draws the PullImage call, and under IfNotPresent a cached
    // image is one Kubelet never calls for. The ladder row keeps the cached case in its parenthesis.
    chips: { sandboxChip: SANDBOX_ID, ipChip: POD_IP, statusChip: 'image pulled', lastOpChip: 'PullImage' },
    wires: { kr: 'PullImage · nginx:1.27' },
    podSublabels: { shellEl: 'IP 10.244.1.5' },
    opacity: { appGroup: 0, sandboxGroup: 1 },
    lit: ['lastOpChip', 'kubelet', 'statusChip'],
    chain: 2,
    // Image fetch is a kubelet -> runtime gRPC only. The Pod does not change yet.
    flow: [F.top({ from: KUBE_R, to: RT_X, y: CALL_Y, lights: ['runtime'] })],
  },
  {
    id: 'create',
    duration: 3100,
    narration: 'Kubelet calls CreateContainer with the sandbox id, container config (command, env, mounts), and resource limits. The runtime sets up cgroups, prepares the mounts, and returns a container id. The container now exists in the sandbox but is not yet running.',
    chips: { sandboxChip: SANDBOX_ID, ipChip: POD_IP, statusChip: 'created (not started)', lastOpChip: 'CreateContainer' },
    wires: { kr: 'CreateContainer' },
    sublabels: { appBox: 'created · not started' },
    podSublabels: { shellEl: 'IP 10.244.1.5' },
    // Pinned dim: the container exists but is not running.
    opacity: { sandboxGroup: 1, appGroup: OPACITY.pending },
    lit: ['lastOpChip', 'kubelet', 'statusChip'],
    chain: 3,
    flow: [
      // gRPC to the runtime, then the created (not started) container lands dim.
      F.top({ from: KUBE_R, to: RT_X, y: CALL_Y, name: 'grpc', lights: ['runtime'] }),
      // The container id the narration says comes back, on the drawn return lane.
      F.top({ from: RT_X, to: KUBE_R, y: BACK_Y, after: 'grpc' }),
      F.route({ points: SANDBOX_CONNECTOR, after: 'grpc', name: 'create' }),
      F.fade({ target: 'appGroup', from: 0, to: OPACITY.pending, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'appGroup', at: 'create' }),
    ],
  },
  {
    id: 'start',
    duration: 3100,
    narration: 'Kubelet calls StartContainer with the container id. The runtime forks the container ENTRYPOINT process inside the shared namespaces of the sandbox. The Pod workload is now running and the Pod reports Ready once its probes pass.',
    chips: { sandboxChip: SANDBOX_ID, ipChip: POD_IP, statusChip: 'running', lastOpChip: 'StartContainer' },
    wires: { kr: 'StartContainer' },
    sublabels: { appBox: 'running' },
    podSublabels: { shellEl: 'IP 10.244.1.5' },
    // Pinned full: the container is running.
    opacity: { sandboxGroup: 1, appGroup: 1 },
    lit: ['kubelet', 'statusChip', 'lastOpChip'],
    chain: 4,
    flow: [
      // gRPC to the runtime, then the ENTRYPOINT forks and the container brightens.
      F.top({ from: KUBE_R, to: RT_X, y: CALL_Y, name: 'grpc', lights: ['runtime'] }),
      F.route({ points: SANDBOX_CONNECTOR, after: 'grpc', name: 'start' }),
      F.fade({ target: 'appGroup', from: OPACITY.pending, to: 1, dur: FADE.in, at: 'start', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'appGroup', at: 'start' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
