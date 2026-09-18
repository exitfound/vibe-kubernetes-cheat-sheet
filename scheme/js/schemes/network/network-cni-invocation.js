import { P, F, defineCard } from './network-kit.js';
import { path } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/network-cni-invocation.md


// Lifts every tier together rather than one at a time. The sandbox height is then tuned so its block
// centre lands exactly on PAUSE_Y, which is what keeps the result and join arrows straight.
const RAISE = 64;                           // lift the whole diagram up ~10% of the viewBox height
const ROW_Y = 352 - RAISE;                  // 288: Kubelet / CRI / bridge-tap row (straight ADD)

// Actor boxes, both at the `NET.L-01` default 232 and the workloads-standard height 80. RUN_GAP is
// the MEASURED width of the `RunPodSandbox` label plus a clearance a side, and it is what fixes the
// CRI: two 232 boxes cannot both sit where the 200 and the 220 did and still leave the label room.
const CONTENT_L = 60, CONTENT_R = 1140;     // the content band, so the chip strip centres on 600
const BOX_W = 232, BOX_H = 80;
const RUN_GAP = 110;                        // label inks 89.6 at 1600x1000, its widest, plus 10.2 a side
const KUBE = [CONTENT_L, 312 - RAISE, BOX_W, BOX_H];   // 60..292  centre 176  bottom 328
const CRI  = [KUBE[0] + BOX_W + RUN_GAP, 312 - RAISE, BOX_W, BOX_H];  // 402..634  centre 518  bottom 328
const CRI_CX = CRI[0] + CRI[2] / 2;         // 518

// The sandbox rides the CRI centre, so the netns drop lands on its top-face midpoint rather than
// beside it. Its own centre y is tuned onto PAUSE_Y, which keeps the result and join arrows straight.
const SBX_W = 240;
const SBX = [CRI_CX - SBX_W / 2, 442 - RAISE, SBX_W, 116];  // 398..638  top 378  centre y 436 = PAUSE_Y
const SBX_RIGHT = SBX[0] + SBX[2];          // 638
const PAUSE_Y = 500 - RAISE;                 // 436: pause / eth0 inner box centre = result-tap height = block centre
const CHIP_Y = SBX[1] + SBX[3] + 12;        // 506: ONE baseline for both chips, 12 under the deeper of the two blocks

// CNI plugin container + internal spine. TWO taps, one per plugin in the list: the first at the
// runtime row so the ADD arrow is straight, the last at the sandbox row so the result arrow is.
// The rows are CENTRED in the frame, 34 clear of either wall, and the trunk stands TAP_STUB left of
// them. Centring is what lets the delegate below sit on the frame centre and under the rows at once.
const CHAIN_W = 252, CHAIN_ROWH = 40;
const TAP_STUB = 20;                        // the tap stub length, the whole width of a relation here
const TAP = [ROW_Y, PAUSE_Y];               // 288, 436
const CHAIN_GAP = (TAP[1] - TAP[0]) - CHAIN_ROWH;       // 108: pitch derived from the tap spacing
const CHAIN_Y = TAP[0] - CHAIN_ROWH / 2;                // 268: first row top
const ROW1_BOT = CHAIN_Y + CHAIN_ROWH;                  // 308
const ROW2_TOP = CHAIN_Y + CHAIN_ROWH + CHAIN_GAP;      // 416
// The frame BOTTOM is the sandbox bottom, so the two deepest blocks on the card end on one line. Its
// top stays where the label sits, which leaves 24 above the first row against 38 under the last: the
// rows hang off the tap heights and cannot move without bending the ADD and result arrows.
const CNI_TOP = 308 - RAISE;                             // 244
const CNI_W = 320;
const CNI_X = CONTENT_R - CNI_W;            // 820, so its chip can end on the content edge
const CNI_BOT = SBX[1] + SBX[3];            // 494: level with the sandbox bottom
const CNI = [CNI_X, CNI_TOP, CNI_W, CNI_BOT - CNI_TOP];  // 250 -> 244..494
const CNI_CX = CNI_X + CNI_W / 2;           // 980: the frame centre, which the rows and the delegate share
const CHAIN_X = CNI_CX - CHAIN_W / 2;       // 854: rows centred, 854..1106, 34 clear of either wall
const SPINE_X = CHAIN_X - TAP_STUB;         // 834: the trunk, one stub left of the rows

// The delegate. host-local is NOT a member of the plugin list: it is named inside the bridge
// plugin's own config, so the picture NESTS it, inset from the row on both sides and hung off THAT
// ROW rather than off the trunk. Its 212 is the row width less the inset, which is the third
// `NET.L-01` clause: a block sized BY the row it hangs under, not an actor in an actor row.
const DLG_INSET = 20;
const DLG_H = 44;
const DLG_Y = (ROW1_BOT + ROW2_TOP) / 2 - DLG_H / 2;    // 340: centred in the 108 gap, 32 clear a side
const DLG = [CHAIN_X + DLG_INSET, DLG_Y, CHAIN_W - 2 * DLG_INSET, DLG_H];  // 874..1086, y 340..384
const DLG_STUB_X = DLG[0] + DLG[2] / 2;     // 980: the delegate top-face midpoint, on the frame centre (`L-11`)

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

// Every centred wire label stands on the MIDPOINT of the leg it names, so none of them leans toward
// the block it leaves. Derived off the lane rather than typed, because a lane that moves used to
// leave its label behind and the two that did sat 6 units into the gap they were meant to centre in.
const labelX = leg => (leg[0][0] + leg[leg.length - 1][0]) / 2;
const JOIN_LEG = JOIN.slice(1);             // the horizontal run, which is the leg the label names

// The trunk at FULL stroke-opacity in the category hue and with no arrowhead: a ball rides it, so it
// must not read fainter than the wires feeding it, and a line at rest takes no head because the ball
// is what carries the direction (`A-05`). `P.lane` and `P.arrow` cannot draw it, since `pathArrow`
// attaches a marker unconditionally, so it is a hand-built path like the bus rail of `network-model`.
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
      // `netns owner` and NOT `eth0`: the sublabel is static, so an interface name here would be on
      // the canvas from the poster frame onward and contradict both step 1, which says the namespace
      // holds loopback only, and the step 5 payoff that brings eth0 up. What pause owns before, during
      // and after the call is the namespace, which is also the string the other two cards drawing a
      // pause box already carry (`T-13`).
      inner: { dx: 22, dy: PAUSE_Y - 30 - SBX[1], w: SBX[2] - 44, h: 60, label: 'pause', sublabel: 'netns owner' },
    }),
    P.node({ key: 'cniBox', x: CNI[0], y: CNI[1], w: CNI[2], h: CNI[3], label: 'CNI plugin chain' }),
    // The taps are relations: they say the two plugin rows hang off ONE list rather than carrying
    // anything, so they draw in the category hue at stroke-opacity 0.45 with no arrowhead. The trunk
    // is a route and goes on top of them, because a ball rides it and its own hue is not faded.
    P.relation({ d: SPINE_TAPS_D }),
    P.raw({ make: spineTrunk }),
    P.chain({
      key: 'chain', x: CHAIN_X, y: CHAIN_Y, w: CHAIN_W, rowH: CHAIN_ROWH, gap: CHAIN_GAP,
      items: ['1 · bridge', '2 · portmap'],
    }),
    // Indented under the bridge row and hung off it, never off the trunk: host-local is named inside
    // the bridge config rather than listed beside it, so the picture nests it instead of stacking it.
    P.box({ key: 'delegate', x: DLG[0], y: DLG[1], w: DLG[2], h: DLG[3], label: 'host-local', sublabel: 'ipam delegate' }),
    // The six route wires, drawn from the same point arrays as the packets that ride them, with
    // blank labels filled per step. Dashed because each is a call rather than a standing link, and
    // dim because dim is a stroke WEIGHT here: the category role owns the hue and the arrowhead.
    P.arrow({ from: RUN[0], to: RUN[1], dashed: true, dim: true }),
    P.arrow({ from: ADD[0], to: ADD[1], dashed: true, dim: true }),
    P.arrow({ from: NETNS[0], to: NETNS[1], dashed: true, dim: true }),
    P.arrow({ from: DELEG[0], to: DELEG[1], dashed: true, dim: true }),
    P.arrow({ from: RESULT[0], to: RESULT[1], dashed: true, dim: true }),
    P.lane({ points: JOIN, dashed: true, dim: true }),
    P.wire({ key: 'run', x: labelX(RUN), y: ROW_Y - 10 }),          // 347
    P.wire({ key: 'add', x: labelX(ADD), y: ROW_Y - 10 }),          // 734
    // Started 24 right of the lane rather than 12: the ball rides x 480 with a 5 unit body and a
    // 6px glow, which reaches 492 at 1100x800 and grazed the label where it sat before.
    P.wire({ key: 'netns', x: CRI_CX + 24, y: CRI[1] + CRI[3] + 30, anchor: 'start' }),
    P.wire({ key: 'result', x: labelX(RESULT), y: PAUSE_Y - 10 }),  // 736
    P.wire({ key: 'join', x: labelX(JOIN_LEG), y: PAUSE_Y + 16 }),  // 287
    // Status chips on ONE baseline, hung on the CONTENT BAND rather than on the blocks above them,
    // so the strip spans CONTENT_L..CONTENT_R and centres on 600 without anything stretched.
    P.chip({ key: 'ipChip', x: CONTENT_L, y: CHIP_Y, w: SBX_RIGHT - CONTENT_L, h: 30, name: 'Pod IP', value: 'pending' }),
    P.chip({ key: 'opChip', x: CNI[0], y: CHIP_Y, w: CONTENT_R - CNI[0], h: 30, name: 'CNI op', value: 'idle' }),
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
      F.segment({ from: NETNS[0], to: NETNS[1], after: 'h1', name: 'h2' }),
      F.pulse({ pod: 'sandbox', at: 'h2' }),
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
      F.segment({ from: RESULT[0], to: RESULT[1], name: 'hop' }),
      F.pulse({ pod: 'sandbox', at: 'hop' }),
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
      F.route({ points: JOIN, name: 'hop' }),
      F.pulse({ pod: 'sandbox', at: 'hop' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
