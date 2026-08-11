import { P, F, defineCard } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-cni-invocation


const RAISE = 64;                           // lift the whole diagram up ~10% of the viewBox height
const ROW_Y = 352 - RAISE;                  // 288: Kubelet / CRI / bridge-tap row (straight ADD)

// Actor boxes (workloads-standard height 80). Kubelet sits well left so the inline RunPodSandbox
// label has room in the gap to the CRI.
const CONTENT_L = 60, CONTENT_R = 1140;     // the content band, so the chip strip centres on 600
const KUBE = [CONTENT_L, 312 - RAISE, 200, 80];  // x, y, w, h  -> centre 160  bottom 328
const CRI  = [370, 312 - RAISE, 220, 80];   // centre 480  right 590  bottom 328
const CRI_CX = CRI[0] + CRI[2] / 2;         // 480

const SBX = [360, 442 - RAISE, 240, 116];   // x, y, w, h  -> top 378  right 600  centre y 436 = PAUSE_Y
const SBX_RIGHT = SBX[0] + SBX[2];          // 600
const PAUSE_Y = 500 - RAISE;                 // 436: pause / eth0 inner box centre = result-tap height = block centre

// CNI plugin container + internal spine. Three taps: bridge at the runtime row, result at the
// sandbox row (PAUSE_Y), IPAM exactly between, so the spine spans the two straight arrows.
const SPINE_X = 846;
const CHAIN_X = 866, CHAIN_W = 252, CHAIN_ROWH = 40;
const TAP = [ROW_Y, (ROW_Y + PAUSE_Y) / 2, PAUSE_Y];   // 288, 362, 436
const CHAIN_GAP = (TAP[1] - TAP[0]) - CHAIN_ROWH;       // pitch derived from the tap spacing
const CHAIN_Y = TAP[0] - CHAIN_ROWH / 2;                // first row top
const CNI_TOP = 308 - RAISE;                             // 244
const CNI_X = CONTENT_R - 320;              // 820, so its chip can end on the content edge
const CNI = [CNI_X, CNI_TOP, 320, (TAP[2] + CHAIN_ROWH / 2 + 14) - CNI_TOP];  // wraps every row + padding

// One trunk down the spine plus a stub into each tap, so the whole chain ball rides a drawn line
// and the rows read as one connected chain.
const SPINE_D = `M ${SPINE_X} ${TAP[0]} L ${SPINE_X} ${TAP[2]} `
  + TAP.map(y => `M ${SPINE_X} ${y} L ${CHAIN_X} ${y}`).join(' ');

// Connector point arrays (each shared by the static wire and the packet that rides it).
const RUN    = [[KUBE[0] + KUBE[2], ROW_Y], [CRI[0], ROW_Y]];          // Kubelet -> CRI
const ADD    = [[CRI[0] + CRI[2], ROW_Y], [SPINE_X, ROW_Y]];          // CRI -> bridge tap (straight)
const NETNS  = [[CRI_CX, CRI[1] + CRI[3]], [CRI_CX, SBX[1]]];          // CRI -> sandbox (vertical)
const SP_1_2 = [[SPINE_X, TAP[0]], [SPINE_X, TAP[1]]];                 // bridge -> IPAM (down the spine)
const SP_2_3 = [[SPINE_X, TAP[1]], [SPINE_X, TAP[2]]];                 // IPAM -> result (down the spine, stops at result)
const RESULT = [[SPINE_X, PAUSE_Y], [SBX_RIGHT, PAUSE_Y]];             // result tap -> sandbox (straight)
const JOIN   = [[KUBE[0] + KUBE[2] / 2, KUBE[1] + KUBE[3]], [KUBE[0] + KUBE[2] / 2, PAUSE_Y], [SBX[0], PAUSE_Y]];  // Kubelet -> sandbox (L)

// The list order IS the append order, which is the z-order: body blocks + CNI container + spine +
// ladder, then wires + labels above, then chips, then packets on top.
export const SCENE = {
  'aria-label': 'CNI plugin invocation: the Kubelet asks the CRI runtime to create the Pod sandbox, the runtime invokes the CNI ADD operation, the plugin chain wires a veth and allocates an IP, and the result is written into the sandbox namespace as eth0',
  parts: [
    P.defs(),
    P.box({ key: 'kubelet', x: KUBE[0], y: KUBE[1], w: KUBE[2], h: KUBE[3], label: 'Kubelet', sublabel: 'PodSpec ready' }),
    P.box({ key: 'cri', x: CRI[0], y: CRI[1], w: CRI[2], h: CRI[3], label: 'CRI . containerd', sublabel: 'sandbox runtime' }),
    // Pod sandbox = a pod shell (loopback-only netns) wrapping an inner pause/eth0 box.
    P.pod({
      key: 'sandbox', innerKey: 'sandboxInner', x: SBX[0], y: SBX[1], w: SBX[2], h: SBX[3],
      label: 'Pod sandbox', sublabel: 'netns: lo only',
      inner: { dx: 22, dy: PAUSE_Y - 30 - SBX[1], w: SBX[2] - 44, h: 60, label: 'pause', sublabel: 'eth0' },
    }),
    P.node({ key: 'cniBox', x: CNI[0], y: CNI[1], w: CNI[2], h: CNI[3], label: 'CNI plugin' }),
    // The spine is drawn WITHOUT a role, so it keeps the plain relation stroke the card shipped with.
    P.relation({ d: SPINE_D, role: '' }),
    P.chain({
      key: 'chain', x: CHAIN_X, y: CHAIN_Y, w: CHAIN_W, rowH: CHAIN_ROWH, gap: CHAIN_GAP,
      items: ['bridge: veth pair, attach cni0', 'host-local IPAM: 10.244.1.5', 'result: IP, routes, DNS'],
    }),
    // Dim dashed wires, blank labels filled per step. Same point arrays as the packets, and all five
    // carry `role: ''` so they keep the dim arrowhead instead of the cyan one.
    P.arrow({ from: RUN[0], to: RUN[1], dashed: true, dim: true, role: '' }),
    P.arrow({ from: ADD[0], to: ADD[1], dashed: true, dim: true, role: '' }),
    P.arrow({ from: NETNS[0], to: NETNS[1], dashed: true, dim: true, role: '' }),
    P.arrow({ from: RESULT[0], to: RESULT[1], dashed: true, dim: true, role: '' }),
    P.lane({ points: JOIN, dashed: true, dim: true, role: '' }),
    P.wire({ key: 'run', x: 309, y: ROW_Y - 10 }),
    P.wire({ key: 'add', x: 685, y: ROW_Y - 10 }),
    P.wire({ key: 'netns', x: CRI_CX + 12, y: CRI[1] + CRI[3] + 30, anchor: 'start' }),
    P.wire({ key: 'result', x: 690, y: PAUSE_Y - 10 }),
    P.wire({ key: 'join', x: 254, y: PAUSE_Y + 16 }),
    // Status chips docked under the block each describes, but hung on the CONTENT BAND rather than on
    // those blocks, so the strip spans CONTENT_L..CONTENT_R and centres without anything stretched.
    P.chip({ key: 'ipChip', x: CONTENT_L, y: SBX[1] + SBX[3] + 12, w: SBX_RIGHT - CONTENT_L, h: 30, name: 'Pod IP', value: 'pending' }),
    P.chip({ key: 'opChip', x: CNI[0], y: CNI[1] + CNI[3] + 12, w: CONTENT_R - CNI[0], h: 30, name: 'CNI op', value: 'idle' }),
    P.packets(),
  ],
  reset: {
    keys: ['kubelet', 'cri', 'ipChip', 'opChip', 'sandboxInner'],
    pods: ['sandbox'],
  },
};

const POD_IP = '10.244.1.5';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { ipChip: 'pending', opChip: 'idle' },
    podSublabels: { sandbox: 'netns: lo only' },
    chain: -1,
  },
  {
    id: 'sandbox',
    duration: 2600,
    narration: 'First the Kubelet asks the CRI runtime, here containerd, to create the Pod sandbox. The runtime starts the pause container, which owns a fresh network namespace that every container in the Pod will share. For now that namespace holds loopback only and no Pod IP.',
    chips: { ipChip: 'pending', opChip: 'not called yet' },
    wires: { run: 'RunPodSandbox', netns: 'create netns' },
    podSublabels: { sandbox: 'netns: lo only' },
    // Both actors are in the handoff, but the kubelet initiates it: the runtime lights when the
    // RunPodSandbox call reaches it, one hop before it creates anything.
    lit: ['kubelet', 'opChip'],
    chain: -1,
    // The animated path says the sandbox was created by PULSING it, which no lights list can name.
    reducedLit: ['sandboxInner'],
    // kubelet calls the runtime, which then creates the sandbox: two chained hops, the sandbox
    // pulses on arrival (down-arrow: packet first, pulse at arrivalMs).
    flow: [
      F.segment({ from: RUN[0], to: RUN[1], name: 'h1' }),
      F.light({ targets: ['cri'], at: 'h1' }),
      F.segment({ from: NETNS[0], to: NETNS[1], after: 'h1', name: 'h2' }),
      F.pulse({ pod: 'sandbox', at: 'h2' }),
    ],
  },
  {
    id: 'invoke-add',
    duration: 2400,
    narration: 'The runtime then invokes the CNI ADD operation on the main plugin, a bridge here. It passes the sandbox namespace path and the network config from /etc/cni/net.d, handing off the actual plumbing instead of doing it itself.',
    chips: { ipChip: 'pending', opChip: 'ADD' },
    wires: { add: 'ADD + netns path' },
    podSublabels: { sandbox: 'netns: lo only' },
    lit: ['cri', 'opChip'],
    chain: 0,
    // The ADD call rides straight from the runtime into the bridge tap (top of the spine).
    flow: [
      F.segment({ from: ADD[0], to: ADD[1] }),
    ],
  },
  {
    id: 'plugin-chain',
    duration: 2600,
    narration: 'The bridge plugin creates a veth pair and attaches the host end to the cni0 bridge, then delegates to its IPAM plugin. The host-local plugin allocates 10.244.1.5 from this Node range and hands the address back.',
    chips: { ipChip: POD_IP, opChip: 'ADD' },
    podSublabels: { sandbox: 'netns: lo only' },
    lit: ['ipChip', 'opChip'],
    // The ball leaves bridge for IPAM: light both, so the row it departs is not dark.
    chain: [0, 1],
    // The bridge delegates down the spine to the IPAM tap, rippling there as the address is picked.
    flow: [
      F.segment({ from: SP_1_2[0], to: SP_1_2[1] }),
    ],
  },
  {
    id: 'result',
    duration: 2400,
    narration: 'The chain finishes and the plugin assembles a single CNI result. It carries everything that was produced, the IP, the routes and the DNS, and is handed back up to the runtime.',
    chips: { ipChip: POD_IP, opChip: 'ADD' },
    podSublabels: { sandbox: 'netns: lo only' },
    lit: ['ipChip', 'opChip'],
    // The ball leaves IPAM for result: light both, so the row it departs is not dark.
    chain: [1, 2],
    // The ball rides the spine from the IPAM tap to the result tap and stops there, rippling like it
    // did at bridge and IPAM, so every plugin in the chain gets its own arrival.
    flow: [
      F.segment({ from: SP_2_3[0], to: SP_2_3[1] }),
    ],
  },
  {
    id: 'write-eth0',
    duration: 2600,
    narration: 'The veth end the plugin placed in the sandbox namespace now comes up as eth0, carrying 10.244.1.5. The Pod has its single network identity, and the runtime records the CNI result.',
    chips: { ipChip: POD_IP, opChip: 'ADD ok' },
    wires: { result: 'eth0 up' },
    podSublabels: { sandbox: 'eth0: 10.244.1.5' },
    lit: ['ipChip', 'opChip'],
    chain: 2,
    // The animated path says eth0 came up by PULSING the sandbox, which no lights list can name.
    reducedLit: ['sandboxInner'],
    // Only now does the ball leave the result tap and ride the straight wire into the sandbox, which
    // pulses as eth0 comes up (down-arrow: packet first, pulse at arrivalMs).
    flow: [
      F.segment({ from: RESULT[0], to: RESULT[1], name: 'hop' }),
      F.pulse({ pod: 'sandbox', at: 'hop' }),
    ],
  },
  {
    id: 'join',
    duration: 2600,
    narration: 'Only now does the Kubelet start the app containers, and they join the namespace the sandbox already set up, so they all share that one Pod IP. When the Pod is later deleted, the runtime calls CNI DEL to release the address and remove the veth.',
    chips: { ipChip: POD_IP, opChip: 'DEL on delete' },
    wires: { join: 'start app containers' },
    podSublabels: { sandbox: 'eth0: 10.244.1.5' },
    lit: ['kubelet', 'opChip'],
    chain: -1,
    // The animated path says the containers joined by PULSING the sandbox, which no lights list names.
    reducedLit: ['sandboxInner'],
    // kubelet starts the app containers into the existing namespace: an L route, the sandbox pulses
    // as the containers join it (down-arrow, eased multi-point route, no explicit dur).
    flow: [
      F.route({ points: JOIN, name: 'hop' }),
      F.pulse({ pod: 'sandbox', at: 'hop' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
