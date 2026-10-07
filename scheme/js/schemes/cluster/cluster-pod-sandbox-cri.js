import { LANE_DY, P, F, defineCard, laneY, ladder, midX, CLU, POD_VIOLET, FADE, OPACITY } from './cluster-kit.js';
import { g } from '../../lib/svg.js';
import { box } from '../../lib/primitives.js';

// Design notes for this card: ./CARDS/cluster-pod-sandbox-cri.md

// Laid out on the L: the top row runs under the panel edge, the columns clear its bottom.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;
const CX = midX(CONTENT_L, CONTENT_R);

// Anchored on its right edge, so the Kubelet stands partly under the panel on narrow viewports.
const TOP_Y = CLU.TOP_Y, BOX_H = CLU.BOX_H, TOP_BOTTOM = TOP_Y + BOX_H;
const KUBE_W = CLU.BOX_W, RT_W = CLU.BOX_W, CNI_W = CLU.BOX_W, TOP_GAP = 60;
const CNI_X = CONTENT_R - CNI_W;
const RT_R = CNI_X - TOP_GAP, RT_X = RT_R - RT_W;
const KUBE_R = RT_X - TOP_GAP, KUBE_X = KUBE_R - KUBE_W;
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);
const { out: CALL_Y, back: BACK_Y } = laneY(TOP_CY, LANE_DY);
const WIRE_Y = TOP_BOTTOM + 24;
const WIRE_KR_X = midX(KUBE_R, RT_X);
const WIRE_RC_X = midX(RT_R, CNI_X);

const LADDER_X = CONTENT_L, LADDER_W = 430;
// Balances the gap under the deepest panel against the gap over the Node frame.
const LADDER_Y = 245, ROW_H = CLU.ROW_H, ROW_GAP = CLU.ROW_GAP, LADDER_ROWS = 5;
const COL_BOTTOM = LADDER_Y + LADDER_ROWS * ROW_H + (LADDER_ROWS - 1) * ROW_GAP;

const CHIP_X = 620, CHIP_W = CONTENT_R - CHIP_X;
// Bottom-aligned on the ladder floor and gap, so the two columns read as one band.
const CHIP_H = CLU.CHIP_H, CHIP_GAP = ROW_GAP, CHIP_COUNT = 4;
const CHIPS_Y = COL_BOTTOM - (CHIP_COUNT * CHIP_H + (CHIP_COUNT - 1) * CHIP_GAP);
const CHIP_Y = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_GAP });

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;
// Family padding (CLU.L-01) round a Pod taller than the family one.
const POD_W = 460, POD_H = 116;
const NODE_Y = 462, NODE_H = CLU.NODE.POD_DY + POD_H + 12;
const POD_X = CX - POD_W / 2;
const POD_Y = NODE_Y + CLU.NODE.POD_DY;
const INNER_W = 190, INNER_H = 54, INNER_DX = 22, INNER_DY = 30;
const INNER_Y = POD_Y + INNER_DY;
// Inset from the right face by the same INNER_DX the pause box takes from the left.
const APP_X = POD_X + POD_W - INNER_DX - INNER_W;

// The lane leaves the runtime, not the Kubelet: the Kubelet is a CRI client and never touches the sandbox.
const SPINE_X = midX(RT_X, RT_R);
// The turn goes above both columns, or the drop runs through the chips.
const JOG_Y = midX(TOP_BOTTOM, LADDER_Y);
const SANDBOX_CONNECTOR = [[SPINE_X, TOP_BOTTOM], [SPINE_X, JOG_Y], [CX, JOG_Y], [CX, NODE_Y]];

export const SCENE = {
  'aria-label': 'Pod sandbox via CRI: RunPodSandbox creates the pause container, CNI attaches the network, PullImage, CreateContainer and StartContainer launch the workload inside the sandbox',
  parts: [
    P.defs(),
    P.arrow({ x1: KUBE_R, y1: CALL_Y, x2: RT_X, y2: CALL_Y, dim: true, dashed: true }),
    P.arrow({ x1: RT_X, y1: BACK_Y, x2: KUBE_R, y2: BACK_Y, dim: true, dashed: true }),
    P.arrow({ x1: RT_R, y1: CALL_Y, x2: CNI_X, y2: CALL_Y, dim: true, dashed: true }),
    P.arrow({ x1: CNI_X, y1: BACK_Y, x2: RT_R, y2: BACK_Y, dim: true, dashed: true }),
    P.wire({ key: 'kr', x: WIRE_KR_X, y: WIRE_Y }),
    P.wire({ key: 'rc', x: WIRE_RC_X, y: WIRE_Y }),
    P.chip({ key: 'sandboxChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'sandbox id', value: 'none' }),
    P.chip({ key: 'ipChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'Pod IP', value: 'none' }),
    P.chip({ key: 'statusChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'status', value: 'none' }),
    P.chip({ key: 'lastOpChip', x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'last op', value: 'none' }),
    P.lane({ key: 'connector', points: SANDBOX_CONNECTOR, dim: true, dashed: true }),
    P.packets(),
    P.chain({
      key: 'chain', x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. RunPodSandbox   ·  pause container, shared namespaces',
        '2. CNI ADD         ·  veth pair, IPAM, route',
        '3. PullImage       ·  fetch image (policy can skip)',
        '4. CreateContainer ·  OCI spec, rootfs, mounts',
        '5. StartContainer  ·  fork ENTRYPOINT inside sandbox',
      ],
    }),
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.pod({
      key: 'sandboxGroup', id: 'sandboxGroup', shellKey: 'shellEl', innerKey: 'pauseBox',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod sandbox', sublabel: ' ', containers: 0,
      inner: { dx: INNER_DX, dy: INNER_DY, w: INNER_W, h: INNER_H, label: 'pause', sublabel: 'netns · IPC · UTS' },
      // A second inner box with its own fade, inside the Pod group so the sandboxGroup pulse reaches it.
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
    P.box({ key: 'kubelet', x: KUBE_X, y: TOP_Y, w: KUBE_W, h: BOX_H, label: 'Kubelet', sublabel: 'CRI client' }),
    P.box({ key: 'runtime', x: RT_X, y: TOP_Y, w: RT_W, h: BOX_H, label: 'containerd', sublabel: 'CRI gRPC server' }),
    P.box({ key: 'cni', x: CNI_X, y: TOP_Y, w: CNI_W, h: BOX_H, label: 'CNI plugin', sublabel: 'veth + IPAM' }),
  ],
  // appGroup is listed too: the Pod pulse strokes the app box and has to come off between steps.
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
    narration: 'Kubelet calls RunPodSandbox with the Pod metadata, labels, and resource hints. The runtime creates a pause container that holds the network, IPC, and UTS namespaces every workload container will share by default. The PID namespace is shared only when spec.shareProcessNamespace or spec.hostPID is set.',
    chips: { sandboxChip: SANDBOX_ID, ipChip: 'none', statusChip: 'sandbox ready', lastOpChip: 'RunPodSandbox' },
    wires: { kr: 'RunPodSandbox' },
    podSublabels: { shellEl: 'sandbox ready' },
    opacity: { appGroup: 0, sandboxGroup: 1 },
    lit: ['statusChip', 'kubelet', 'sandboxChip', 'lastOpChip'],
    chain: 0,
    rewind: { chips: { sandboxChip: 'none', statusChip: 'none' } },
    flow: [
      F.top({ from: KUBE_R, to: RT_X, y: CALL_Y, name: 'grpc', lights: ['runtime'] }),
      F.route({ points: SANDBOX_CONNECTOR, after: 'grpc', name: 'run' }),
      F.set({ at: 'run', chips: { sandboxChip: SANDBOX_ID, statusChip: 'sandbox ready' } }),
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
    rewind: { chips: { ipChip: 'none', statusChip: 'sandbox ready' }, podSublabels: { shellEl: 'sandbox ready' } },
    flow: [
      F.top({ from: RT_R, to: CNI_X, y: CALL_Y, name: 'exec' }),
      // The narrated CNI result rides the return lane, on the same beat as `conf`.
      F.top({ from: CNI_X, to: RT_R, y: BACK_Y, after: 'exec' }),
      // Its own entry, not `lights` on the hop: emitted after the return packet, and order is observable.
      F.light({ targets: ['cni'], at: 'exec' }),
      F.route({ points: SANDBOX_CONNECTOR, after: 'exec', name: 'conf' }),
      F.set({ at: 'conf', chips: { ipChip: POD_IP, statusChip: 'sandbox ready · IP set' }, podSublabels: { shellEl: 'IP 10.244.1.5' } }),
      F.pulse({ pod: 'sandboxGroup', at: 'conf' }),
    ],
  },
  {
    id: 'image',
    duration: 2600,
    narration: 'Kubelet calls PullImage for each container in the Pod, respecting imagePullPolicy and imagePullSecrets. The runtime fetches the image from the registry into the Node image store, and under IfNotPresent Kubelet skips the call when the image is already there. No workload container exists yet.',
    // `pulled`, not `cached`: this step draws the call, the skip belongs to the policy.
    chips: { sandboxChip: SANDBOX_ID, ipChip: POD_IP, statusChip: 'image pulled', lastOpChip: 'PullImage' },
    wires: { kr: 'PullImage · nginx:1.27' },
    podSublabels: { shellEl: 'IP 10.244.1.5' },
    opacity: { appGroup: 0, sandboxGroup: 1 },
    lit: ['lastOpChip', 'kubelet', 'statusChip'],
    chain: 2,
    rewind: { chips: { statusChip: 'sandbox ready · IP set' } },
    flow: [
      F.top({ from: KUBE_R, to: RT_X, y: CALL_Y, name: 'pull', lights: ['runtime'] }),
      F.set({ at: 'pull', chips: { statusChip: 'image pulled' } }),
    ],
  },
  {
    id: 'create',
    duration: 3100,
    narration: 'Kubelet calls CreateContainer with the sandbox id, container config (command, env, mounts), and resource limits. The runtime prepares the rootfs and the mounts and writes those limits into the OCI spec, then returns a container id. The container now exists but is not yet running, and its cgroup is created when it starts.',
    chips: { sandboxChip: SANDBOX_ID, ipChip: POD_IP, statusChip: 'created · not started', lastOpChip: 'CreateContainer' },
    wires: { kr: 'CreateContainer' },
    sublabels: { appBox: 'created · not started' },
    podSublabels: { shellEl: 'IP 10.244.1.5' },
    opacity: { sandboxGroup: 1, appGroup: OPACITY.pending },
    lit: ['lastOpChip', 'kubelet', 'statusChip'],
    chain: 3,
    rewind: { chips: { statusChip: 'image pulled' } },
    flow: [
      F.top({ from: KUBE_R, to: RT_X, y: CALL_Y, name: 'grpc', lights: ['runtime'] }),
      F.top({ from: RT_X, to: KUBE_R, y: BACK_Y, after: 'grpc' }),
      F.route({ points: SANDBOX_CONNECTOR, after: 'grpc', name: 'create' }),
      F.set({ at: 'create', chips: { statusChip: 'created · not started' } }),
      F.fade({ target: 'appGroup', from: 0, to: OPACITY.pending, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
      // The whole Pod blinks as one (M-03), never the app box alone.
      F.pulse({ pod: 'sandboxGroup', at: 'create' }),
    ],
  },
  {
    id: 'start',
    duration: 3100,
    narration: 'Kubelet calls StartContainer with the container id. The runtime forks the container ENTRYPOINT process inside the shared namespaces of the sandbox. The Pod workload is now running and the Pod reports Ready once all of its containers are ready, which for a container with a readiness probe means once that probe passes.',
    chips: { sandboxChip: SANDBOX_ID, ipChip: POD_IP, statusChip: 'running', lastOpChip: 'StartContainer' },
    wires: { kr: 'StartContainer' },
    sublabels: { appBox: 'running' },
    podSublabels: { shellEl: 'IP 10.244.1.5' },
    opacity: { sandboxGroup: 1, appGroup: 1 },
    lit: ['kubelet', 'statusChip', 'lastOpChip'],
    chain: 4,
    rewind: { chips: { statusChip: 'created · not started' }, sublabels: { appBox: 'created · not started' } },
    flow: [
      F.top({ from: KUBE_R, to: RT_X, y: CALL_Y, name: 'grpc', lights: ['runtime'] }),
      F.route({ points: SANDBOX_CONNECTOR, after: 'grpc', name: 'start' }),
      F.set({ at: 'start', chips: { statusChip: 'running' }, sublabels: { appBox: 'running' } }),
      F.fade({ target: 'appGroup', from: OPACITY.pending, to: 1, dur: FADE.in, at: 'start', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'sandboxGroup', at: 'start' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
