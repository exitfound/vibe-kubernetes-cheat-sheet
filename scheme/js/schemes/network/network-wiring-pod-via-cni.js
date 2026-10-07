import { P, F, defineCard } from './network-kit.js';
import { path } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/network-wiring-pod-via-cni.md

// Lifts every tier together. The sandbox centre lands on PAUSE_Y, which keeps the result and join
// arrows straight.
const RAISE = 64;                           // lift the whole diagram up ~10% of the viewBox height
const ROW_Y = 352 - RAISE;                  // Kubelet / CRI / bridge-tap row (straight ADD)

// Actor boxes at NET.L-01 232 x 80. RUN_GAP fits the `RunPodSandbox` label between them.
const CONTENT_L = 60, CONTENT_R = 1140;     // the content band, so the chip strip centres on it
const BOX_W = 232, BOX_H = 80;
const RUN_GAP = 110;
const KUBE = [CONTENT_L, 312 - RAISE, BOX_W, BOX_H];
const CRI  = [KUBE[0] + BOX_W + RUN_GAP, 312 - RAISE, BOX_W, BOX_H];
const CRI_CX = CRI[0] + CRI[2] / 2;

// The sandbox rides the CRI centre, so the netns drop lands on its top-face midpoint rather than
// beside it. Its own centre y is tuned onto PAUSE_Y, which keeps the result and join arrows straight.
const SBX_W = 240;
const SBX = [CRI_CX - SBX_W / 2, 442 - RAISE, SBX_W, 116];  // centre y = PAUSE_Y
const SBX_RIGHT = SBX[0] + SBX[2];
const PAUSE_Y = 500 - RAISE;                 // pause / eth0 inner box centre = result-tap height = block centre
const CHIP_Y = SBX[1] + SBX[3] + 12, CHIP_H = 34;   // one baseline for both chips, under the sandbox

// Two taps, one per plugin in the list: the first at the runtime row so the ADD arrow is straight,
// the last at the sandbox row so the result arrow is. Rows centre in the frame, the trunk TAP_STUB left.
const CHAIN_W = 252, CHAIN_ROWH = 40;
const TAP_STUB = 20;                        // the tap stub length, the whole width of a relation here
const TAP = [ROW_Y, PAUSE_Y];
const CHAIN_GAP = (TAP[1] - TAP[0]) - CHAIN_ROWH;       // pitch derived from the tap spacing
const CHAIN_Y = TAP[0] - CHAIN_ROWH / 2;                // first row top
const ROW1_BOT = CHAIN_Y + CHAIN_ROWH;
const ROW2_TOP = CHAIN_Y + CHAIN_ROWH + CHAIN_GAP;
// The rows hang off the tap heights and cannot move without bending the ADD and result arrows,
// so the frame is what moves.
const CNI_TOP = CHAIN_Y - 34;
const CNI_W = 320;
const CNI_X = CONTENT_R - CNI_W;            // so its chip can end on the content edge
const CNI_BOT = ROW2_TOP + CHAIN_ROWH + 12;
const CNI = [CNI_X, CNI_TOP, CNI_W, CNI_BOT - CNI_TOP];
const CNI_CX = CNI_X + CNI_W / 2;           // the frame centre, which the rows and the delegate share
const CHAIN_X = CNI_CX - CHAIN_W / 2;       // rows centred in the frame
const SPINE_X = CHAIN_X - TAP_STUB;         // the trunk, one stub left of the rows

// host-local is not a list member: it is named inside the bridge config, so the picture nests it
// under that row, sized by the row it hangs under (NET.L-01).
const DLG_INSET = 20;
const DLG_H = 44;
const DLG_Y = (ROW1_BOT + ROW2_TOP) / 2 - DLG_H / 2;    // centred in the gap between the rows
const DLG = [CHAIN_X + DLG_INSET, DLG_Y, CHAIN_W - 2 * DLG_INSET, DLG_H];
const DLG_STUB_X = DLG[0] + DLG[2] / 2;     // the delegate top-face midpoint, on the frame centre (`L-11`)

// The trunk down the spine, which the chain ball rides on the chain step, and the two stubs into the
// plugin rows, which nothing ever rides. Two claims, so two elements off the same SPINE_X and TAP.
const SPINE_TRUNK_D = `M ${SPINE_X} ${TAP[0]} L ${SPINE_X} ${TAP[1]}`;
const SPINE_TAPS_D = TAP.map(y => `M ${SPINE_X} ${y} L ${CHAIN_X} ${y}`).join(' ');

// Connector point arrays (each shared by the static wire and the packet that rides it).
const RUN    = [[KUBE[0] + KUBE[2], ROW_Y], [CRI[0], ROW_Y]];          // Kubelet -> CRI
const ADD    = [[CRI[0] + CRI[2], ROW_Y], [SPINE_X, ROW_Y]];          // CRI -> bridge tap (straight)
const NETNS  = [[CRI_CX, CRI[1] + CRI[3]], [CRI_CX, SBX[1]]];          // CRI -> sandbox (vertical)
const DELEG  = [[DLG_STUB_X, ROW1_BOT], [DLG_STUB_X, DLG_Y]];          // bridge row -> host-local
const TRUNK  = [[SPINE_X, TAP[0]], [SPINE_X, TAP[1]]];                 // down the list, tap 1 to tap 2
const RESULT = [[SPINE_X, PAUSE_Y], [SBX_RIGHT, PAUSE_Y]];             // last plugin -> sandbox (straight)
const JOIN   = [[KUBE[0] + KUBE[2] / 2, KUBE[1] + KUBE[3]], [KUBE[0] + KUBE[2] / 2, PAUSE_Y], [SBX[0], PAUSE_Y]];  // Kubelet -> sandbox (L)

// Every centred wire label stands on the midpoint of the leg it names, derived off the lane so a
// moved lane carries its label.
const labelX = leg => (leg[0][0] + leg[leg.length - 1][0]) / 2;
const JOIN_LEG = JOIN.slice(1);             // the horizontal run, which is the leg the label names

// The trunk at full stroke-opacity with no arrowhead: a ball rides it and carries the direction
// (`A-05`). Hand-built because `pathArrow` always attaches a marker.
const spineTrunk = () => path({
  class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-network',
  'data-role': 'network', fill: 'none', d: SPINE_TRUNK_D,
});

// The list order IS the append order, which is the z-order: body blocks + CNI container + spine +
// ladder + delegate, then wires + labels above, then chips, then packets on top.
export const SCENE = {
  'aria-label': 'CNI plugin invocation: the Kubelet asks the CRI runtime for a Pod sandbox, the runtime runs the plugin list from the CNI config directory in order, the bridge plugin delegates addressing to the host-local IPAM plugin, the result of the chain comes up in the sandbox namespace as eth0, and on delete the runtime runs the same list in reverse with CNI_COMMAND=DEL',
  parts: [
    P.defs(),
    P.box({ key: 'kubelet', x: KUBE[0], y: KUBE[1], w: KUBE[2], h: KUBE[3], label: 'Kubelet', sublabel: 'PodSpec ready' }),
    P.box({ key: 'cri', x: CRI[0], y: CRI[1], w: CRI[2], h: CRI[3], label: 'CRI · containerd', sublabel: 'sandbox runtime' }),
    // Pod sandbox = a pod shell (loopback-only netns) wrapping an inner pause/eth0 box.
    P.pod({
      key: 'sandbox', innerKey: 'sandboxInner', x: SBX[0], y: SBX[1], w: SBX[2], h: SBX[3],
      label: 'Pod sandbox', sublabel: 'netns: lo only',
      // `netns owner` and not `eth0`: the sublabel is static, and eth0 does not exist until step 5 (`T-13`).
      inner: { dx: 22, dy: PAUSE_Y - 30 - SBX[1], w: SBX[2] - 44, h: 60, label: 'pause', sublabel: 'netns owner' },
    }),
    P.node({ key: 'cniBox', x: CNI[0], y: CNI[1], w: CNI[2], h: CNI[3], label: 'CNI plugin chain' }),
    // The taps are relations at stroke-opacity 0.45 with no arrowhead. The trunk is a route and draws
    // on top of them.
    P.relation({ d: SPINE_TAPS_D }),
    P.raw({ make: spineTrunk }),
    P.chain({
      key: 'chain', x: CHAIN_X, y: CHAIN_Y, w: CHAIN_W, rowH: CHAIN_ROWH, gap: CHAIN_GAP,
      items: ['1 · bridge', '2 · portmap'],
    }),
    // Indented under the bridge row and hung off it, never off the trunk: host-local is named inside
    // the bridge config rather than listed beside it, so the picture nests it instead of stacking it.
    P.box({ key: 'delegate', x: DLG[0], y: DLG[1], w: DLG[2], h: DLG[3], label: 'host-local', sublabel: 'ipam delegate' }),
    // The six route wires share their point arrays with the packets. Dashed because each is a call,
    // dim as a stroke weight only.
    P.arrow({ from: RUN[0], to: RUN[1], dashed: true, dim: true }),
    P.arrow({ from: ADD[0], to: ADD[1], dashed: true, dim: true }),
    P.arrow({ from: NETNS[0], to: NETNS[1], dashed: true, dim: true }),
    P.arrow({ from: DELEG[0], to: DELEG[1], dashed: true, dim: true }),
    P.arrow({ from: RESULT[0], to: RESULT[1], dashed: true, dim: true }),
    P.lane({ points: JOIN, dashed: true, dim: true }),
    P.wire({ key: 'run', x: labelX(RUN), y: ROW_Y - 10 }),
    P.wire({ key: 'add', x: labelX(ADD), y: ROW_Y - 10 }),
    // Started 24 right of the lane so the ball glow does not graze the label.
    P.wire({ key: 'netns', x: CRI_CX + 24, y: CRI[1] + CRI[3] + 30, anchor: 'start' }),
    P.wire({ key: 'result', x: labelX(RESULT), y: PAUSE_Y - 10 }),
    P.wire({ key: 'join', x: labelX(JOIN_LEG), y: PAUSE_Y + 16 }),
    // Status chips on one baseline, hung on the content band so the strip centres without stretching.
    P.chip({ key: 'ipChip', x: CONTENT_L, y: CHIP_Y, w: SBX_RIGHT - CONTENT_L, h: CHIP_H, name: 'Pod IP', value: 'pending' }),
    P.chip({ key: 'opChip', x: CNI[0], y: CHIP_Y, w: CONTENT_R - CNI[0], h: CHIP_H, name: 'CNI op', value: 'idle' }),
    P.packets(),
  ],
  reset: {
    keys: ['kubelet', 'cri', 'delegate', 'ipChip', 'opChip', 'sandboxInner'],
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
    narration: 'The Kubelet asks the CRI runtime, here containerd, for a Pod sandbox, and the runtime starts the pause container that owns the network namespace. For now that namespace holds loopback only and no Pod IP. The plugin chain that follows runs inside that one RunPodSandbox call.',
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
      F.segment({ from: NETNS[0], to: NETNS[1], after: 'h1', pulse: 'sandbox' }),
    ],
  },
  {
    id: 'exec',
    duration: 2400,
    narration: 'The runtime, not the Kubelet, reads the plugin list from /etc/cni/net.d and runs the first plugin as a plain executable. CNI_COMMAND=ADD, the sandbox namespace path and CNI_IFNAME=eth0 arrive on its environment, and the network config arrives on stdin.',
    chips: { ipChip: 'pending', opChip: 'ADD' },
    wires: { add: 'exec · ADD' },
    podSublabels: { sandbox: 'netns: lo only' },
    lit: ['cri', 'opChip'],
    chain: 0,
    // The ADD exec rides straight from the runtime into the first plugin row (top of the trunk).
    flow: [
      F.segment({ from: ADD[0], to: ADD[1] }),
    ],
  },
  {
    id: 'delegate',
    duration: 2400,
    narration: 'The bridge plugin does not hand out addresses itself. Its config names an IPAM plugin, host-local, which it runs as a delegate of its own, and host-local picks 10.244.1.5 out of the range for this Node and returns it to the caller.',
    chips: { ipChip: POD_IP, opChip: 'ADD' },
    podSublabels: { sandbox: 'netns: lo only' },
    // The bridge row is lit before the ball leaves it (`chain: 0`, `M-18a`). host-local is NOT listed
    // here: it is the receiver, so it lights on the arrival instead (`report:arrival/R3`).
    lit: ['ipChip', 'opChip'],
    chain: 0,
    // The address is what the delegate call returns, so the chip waits for the ball to land on it.
    rewind: { chips: { ipChip: 'pending' } },
    flow: [
      F.segment({ from: DELEG[0], to: DELEG[1], name: 'dlg', lights: ['delegate'] }),
      F.set({ at: 'dlg', chips: { ipChip: POD_IP } }),
    ],
  },
  {
    id: 'chain',
    duration: 2600,
    narration: 'The runtime then runs the next plugin in the list. It passes the previous result in as prevResult, so portmap adds to what bridge already produced instead of starting over. That ordered list is what the word chain means here.',
    chips: { ipChip: POD_IP, opChip: 'ADD' },
    podSublabels: { sandbox: 'netns: lo only' },
    lit: ['ipChip', 'opChip'],
    // The ball leaves bridge for portmap: light both, so the row it departs is not dark.
    chain: [0, 1],
    // Down the trunk from the first tap to the second, rippling there as the next plugin is run.
    flow: [
      F.segment({ from: TRUNK[0], to: TRUNK[1] }),
    ],
  },
  {
    id: 'result',
    duration: 2600,
    narration: 'The last plugin prints one result on stdout: the interfaces the chain made, the addresses on them, the routes and the DNS. The one the chain made inside the sandbox namespace comes up as eth0 carrying 10.244.1.5, and the operation finishes as ADD ok.',
    chips: { ipChip: POD_IP, opChip: 'ADD ok' },
    wires: { result: 'eth0 up' },
    podSublabels: { sandbox: 'eth0: 10.244.1.5' },
    lit: ['ipChip', 'opChip'],
    chain: 1,
    // The animated path says eth0 came up by PULSING the sandbox, which no lights list can name.
    reducedLit: ['sandboxInner'],
    // The sublabel, the wire label and the op chip are ONE result of ONE call, so all three wait for
    // the ball to reach the sandbox, which is also where it pulses (`P-03`, `P-04`).
    rewind: { chips: { opChip: 'ADD' }, wires: { result: '' }, podSublabels: { sandbox: 'netns: lo only' } },
    flow: [
      F.segment({ from: RESULT[0], to: RESULT[1], name: 'hop', pulse: 'sandbox' }),
      F.set({
        at: 'hop',
        chips: { opChip: 'ADD ok' },
        wires: { result: 'eth0 up' },
        podSublabels: { sandbox: 'eth0: 10.244.1.5' },
      }),
    ],
  },
  {
    id: 'join',
    duration: 2600,
    narration: 'Only now does the Kubelet start the app containers, and they join the namespace that is already wired, so all of them answer on that one Pod IP. On delete the runtime runs the same list with CNI_COMMAND=DEL, in reverse order, and each plugin releases what it made.',
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
      F.route({ points: JOIN, name: 'hop', pulse: 'sandbox' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
