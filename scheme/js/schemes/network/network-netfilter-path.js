import { P, F, defineCard, makeRidingLabel, BEAT, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-netfilter-path


const NODE_X = 40, NODE_Y = 305, NODE_W = 1120, NODE_H = 251;
// The Node frame is the widest element, so it is what the chip strip spans, edge to edge.
const SCHEME_LEFT = NODE_X;                    // 40

const ROW_Y = 380, ROW_H = 70;
const ROW_CY = ROW_Y + ROW_H / 2;              // 415
const ROW_BOTTOM = ROW_Y + ROW_H;              // 450

const PRE_X = 70, PRE_W = 210;
const PRE_RIGHT = PRE_X + PRE_W;               // 280
const PRE_CX = PRE_X + PRE_W / 2;              // 175
const RT_X = 320, RT_W = 180;
const RT_RIGHT = RT_X + RT_W;                  // 500
const FW_X = 540, FW_W = 160;
const FW_RIGHT = FW_X + FW_W;                  // 700
const PO_X = 740, PO_W = 210;
const PO_RIGHT = PO_X + PO_W;                  // 950
const ETH_X = 990, ETH_W = 150;
const ETH_CX = ETH_X + ETH_W / 2;              // 1065

const CT_X = PRE_X, CT_Y = 480, CT_W = PO_RIGHT - PRE_X, CT_H = 56;   // under the four hooks, 70..950
const CT_CX = CT_X + CT_W / 2;                 // 510: where the ownership marker meets the table
// Ownership marker: PREROUTING bottom-centre, a short step in the gap between the rows, then down
// onto the conntrack table's own top-edge centre. Both ends sit on a face midpoint.
const CT_LINK = [[PRE_CX, ROW_BOTTOM], [PRE_CX, (ROW_BOTTOM + CT_Y) / 2], [CT_CX, (ROW_BOTTOM + CT_Y) / 2], [CT_CX, CT_Y]];

const POD_X = 450, POD_Y = 60, POD_W = 210, POD_H = 110;
const POD_CX = POD_X + POD_W / 2;              // 555
const POD_BOTTOM = POD_Y + POD_H;              // 170

const IN_LANE_Y = 336;                         // the lane the client packet turns left on, inside the Node
const RETURN_LANE_Y = 360;                     // the reply lane, its own, so it never rides a forward wire
// Chip strip: four cells with even gaps spanning the Node frame 1:1, each sized for its own values.
const CHIP_Y = 576, CHIP_H = 34, CHIP_GAP = 20;
const CHIP_W = [270, 320, 260, 210];
const CHIP_X = CHIP_W.reduce((acc, w, i) => (i ? [...acc, acc[i - 1] + CHIP_W[i - 1] + CHIP_GAP] : [SCHEME_LEFT]), []);


// Each static wire and the ball that rides it share the same points array. The forward chain is four
// short hops, one per hook boundary, so the ball visibly stops at every hook instead of gliding past it.
const ENTRY = [[POD_CX, POD_BOTTOM], [POD_CX, IN_LANE_Y], [140, IN_LANE_Y], [140, ROW_Y]];
const PRE_TO_RT = [[PRE_RIGHT, ROW_CY], [RT_X, ROW_CY]];
const RT_TO_FW = [[RT_RIGHT, ROW_CY], [FW_X, ROW_CY]];
const FW_TO_PO = [[FW_RIGHT, ROW_CY], [PO_X, ROW_CY]];
const PO_TO_ETH = [[PO_RIGHT, ROW_CY], [ETH_X, ROW_CY]];
// The reply comes back off the wire and re-enters at PREROUTING, landing on its top edge well right of
// where the request landed, so the two never share a point.
const RETURN = [[ETH_CX, ROW_Y], [ETH_CX, RETURN_LANE_Y], [210, RETURN_LANE_Y], [210, ROW_Y]];

// The tag that rides a ball on this card, built once here and handed to every F.tag as `fn`: emergeMode
// floats the reply source out of eth0, and hold 0 clears each chain address before the next one rides.
const ridingLabel = makeRidingLabel({ role: 'network', outMs: 170, hold: 0, emergeMode: true });
const tag = (p) => F.tag({ fn: ridingLabel, ...p });
// A hop between two hooks is a 40 unit gap against a 100 unit address, so on the lane both hook faces
// cut it. -40 parks the tag in the band between the return lane and the row, clear on all viewports.
const HOOK_TAG_DY = -40;

// The list order IS the append order, which is the z-order: the Node frame in back, then the Pod and
// the chain blocks, then wires + the exit label, then chips, then the packet layer on top.
export const SCENE = {
  'aria-label': 'The netfilter path a packet takes: PREROUTING with conntrack and the nat table, then the routing decision, FORWARD, POSTROUTING and eth0, drawn as one row inside the Node kernel above the conntrack table. DNAT runs before routing, MASQUERADE waits for the last hook, and the reply is untangled from the recorded flow with no rule walk.',
  parts: [
    P.defs(),
    P.node({ key: 'theNode', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node kernel' }),
    P.pod({
      key: 'podC', innerKey: 'podCBox', x: POD_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Client Pod', sublabel: '10.244.1.5',
      inner: { dx: 20, dy: 30, w: POD_W - 40, h: 48, label: 'app', sublabel: 'eth0' },
    }),
    P.box({ key: 'pre', x: PRE_X, y: ROW_Y, w: PRE_W, h: ROW_H, label: 'PREROUTING', sublabel: 'conntrack + nat' }),
    P.box({ key: 'rt', x: RT_X, y: ROW_Y, w: RT_W, h: ROW_H, label: 'Routing decision', sublabel: 'local or forward' }),
    P.box({ key: 'fw', x: FW_X, y: ROW_Y, w: FW_W, h: ROW_H, label: 'FORWARD', sublabel: 'filter' }),
    P.box({ key: 'po', x: PO_X, y: ROW_Y, w: PO_W, h: ROW_H, label: 'POSTROUTING', sublabel: 'nat · MASQUERADE' }),
    P.box({ key: 'eth', x: ETH_X, y: ROW_Y, w: ETH_W, h: ROW_H, label: 'eth0', sublabel: 'the wire' }),
    P.box({ key: 'ct', x: CT_X, y: CT_Y, w: CT_W, h: CT_H, label: 'Conntrack table', sublabel: 'no flow yet' }),
    P.lane({ points: ENTRY, dashed: true, dim: true }),
    P.arrow({ from: PRE_TO_RT[0], to: PRE_TO_RT[1], dashed: true, dim: true }),
    P.arrow({ from: RT_TO_FW[0], to: RT_TO_FW[1], dashed: true, dim: true }),
    P.arrow({ from: FW_TO_PO[0], to: FW_TO_PO[1], dashed: true, dim: true }),
    P.arrow({ from: PO_TO_ETH[0], to: PO_TO_ETH[1], dashed: true, dim: true }),
    P.lane({ points: RETURN, dashed: true, dim: true }),
    // Ownership marker, NOT a traffic path: PREROUTING is where the flow is looked up and recorded. No
    // packet ever travels it, so it is a plain dashed line with NO arrowhead.
    P.relation({ points: CT_LINK, dash: '5 5' }),
    // One wire label, under the NIC: where this packet is actually headed once it is on the wire. Blank at
    // build, filled per step.
    P.wire({ key: 'exit', x: ETH_CX, y: ROW_BOTTOM + 20 }),
    P.chip({ key: 'hookChip', x: CHIP_X[0], y: CHIP_Y, w: CHIP_W[0], h: CHIP_H, name: 'hook', value: 'none' }),
    P.chip({ key: 'dstChip', x: CHIP_X[1], y: CHIP_Y, w: CHIP_W[1], h: CHIP_H, name: 'dst', value: '10.96.0.20:80' }),
    P.chip({ key: 'srcChip', x: CHIP_X[2], y: CHIP_Y, w: CHIP_W[2], h: CHIP_H, name: 'src', value: '10.244.1.5' }),
    P.chip({ key: 'ctChip', x: CHIP_X[3], y: CHIP_Y, w: CHIP_W[3], h: CHIP_H, name: 'conntrack', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: ['pre', 'rt', 'fw', 'po', 'eth', 'ct', 'hookChip', 'dstChip', 'srcChip', 'ctChip', 'podCBox'],
    pods: ['podC'],
  },
};

// Every dimmable block states its opacity on EVERY step, so the dim the eBPF step puts on the chain
// cannot leak into a replay of an earlier one.
const CHAIN_UP = { pre: 1, rt: 1, fw: 1, po: 1, eth: 1, ct: 1 };
const FLOW_CT = '10.244.1.5 -> 10.244.2.7:8080';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { hookChip: 'none', dstChip: '10.96.0.20:80', srcChip: '10.244.1.5', ctChip: 'none' },
    sublabels: { ct: 'no flow yet' },
    opacity: CHAIN_UP,
  },
  {
    id: 'prerouting',
    // Motion: the Pod pulses first, the ball leaves at BEAT.afterPulse(800) and rides the entry route
    // (1389ms), so PREROUTING lights at 2189.
    duration: 2900,
    narration: 'The client Pod opens a connection to a Service. The packet leaves the Pod and enters the Node kernel at PREROUTING, the very first hook, before any routing decision has been made. The conntrack table sees a flow it has never seen and records it, which is what will let the reply be untangled later with no work at all.',
    chips: { hookChip: 'PREROUTING', dstChip: '10.96.0.20:80', srcChip: '10.244.1.5', ctChip: 'new flow' },
    sublabels: { ct: '10.244.1.5 -> 10.96.0.20:80' },
    opacity: CHAIN_UP,
    lit: ['ct', 'hookChip', 'ctChip'],
    // The hook the packet is AT and the flow conntrack records are both made by the arrival, so the
    // animated path holds the idle none and the empty table until the ball lands at 2189.
    rewind: { chips: { hookChip: 'none', ctChip: 'none' }, sublabels: { ct: 'no flow yet' } },
    // Up-arrow: the Pod is the sender, so it pulses FIRST and the packet leaves at BEAT.afterPulse. It
    // still carries the ClusterIP, which is what the tag says, and PREROUTING lights on arrival.
    flow: [
      F.pulse({ pod: 'podC' }),
      F.route({ points: ENTRY, delay: BEAT.afterPulse, name: 'inb' }),
      tag({ text: 'dst 10.96.0.20:80', points: ENTRY, delay: BEAT.afterPulse }),
      F.light({ targets: ['pre'], at: 'inb' }),
      F.set({ at: 'inb', chips: { hookChip: 'PREROUTING', ctChip: 'new flow' }, sublabels: { ct: '10.244.1.5 -> 10.96.0.20:80' } }),
    ],
  },
  {
    id: 'dnat',
    duration: 2600,
    narration: 'Still inside PREROUTING, the nat table runs and the KUBE-SERVICES chain matches the ClusterIP. It DNATs the destination to a real backend, 10.244.2.7:8080 on Node-2, and conntrack stores the translation next to the flow. The packet that leaves this hook is no longer addressed to a Service at all.',
    chips: { hookChip: 'PREROUTING (nat)', dstChip: '10.244.2.7:8080', srcChip: '10.244.1.5', ctChip: 'DNAT recorded' },
    sublabels: { ct: FLOW_CT },
    opacity: CHAIN_UP,
    lit: ['hookChip', 'pre', 'ct', 'dstChip', 'ctChip'],
    // The rewrite happened INSIDE the hook, so the ball re-emerges at its right edge already carrying
    // the backend address, and the routing decision lights as it arrives.
    flow: [
      F.segment({ from: PRE_TO_RT[0], to: PRE_TO_RT[1], name: 'hop' }),
      tag({ text: 'dst 10.244.2.7:8080', points: PRE_TO_RT, easing: 'linear', dy: HOOK_TAG_DY }),
      F.light({ targets: ['rt'], at: 'hop' }),
    ],
  },
  {
    id: 'routing',
    duration: 2600,
    narration: 'Only now does the kernel decide where to send the packet, and it decides on the rewritten address: 10.244.2.7 lives on another Node, so this is not local traffic and it goes out. That is the whole reason DNAT sits in PREROUTING. Run it after routing and the kernel would first try to route to a ClusterIP that no interface anywhere owns.',
    chips: { hookChip: 'routing decision', dstChip: '10.244.2.7:8080', srcChip: '10.244.1.5', ctChip: 'DNAT recorded' },
    sublabels: { ct: FLOW_CT },
    opacity: CHAIN_UP,
    lit: ['rt', 'hookChip', 'dstChip'],
    // Not local, so the packet is handed to the FORWARD chain, which lights as it arrives.
    flow: [
      F.segment({ from: RT_TO_FW[0], to: RT_TO_FW[1], name: 'hop' }),
      tag({ text: 'not local, forward', points: RT_TO_FW, easing: 'linear', dy: HOOK_TAG_DY }),
      F.light({ targets: ['fw'], at: 'hop' }),
    ],
  },
  {
    id: 'postrouting',
    // Motion: FORWARD -> POSTROUTING (700) + hop beat(100) + POSTROUTING -> the wire (700) = 1500.
    duration: 2800,
    narration: 'A packet that is only passing through the Node crosses FORWARD, which is the filter table and where an iptables NetworkPolicy implementation drops what is not allowed. Then comes POSTROUTING, the last hook before the wire. MASQUERADE lives here and nowhere else, because only now are the outgoing interface and the source address it implies actually known. Traffic staying inside the cluster is excluded from it, so this packet keeps its Pod source and leaves untouched.',
    chips: { hookChip: 'FORWARD, POSTROUTING', dstChip: '10.244.2.7:8080', srcChip: '10.244.1.5 (no SNAT)', ctChip: 'DNAT recorded' },
    wires: { exit: 'to Node-2' },
    sublabels: { ct: FLOW_CT },
    opacity: CHAIN_UP,
    lit: ['fw', 'hookChip', 'srcChip'],
    // Two chained hops: through POSTROUTING and out onto the wire. The source rides the ball on the last
    // leg, because that is the value MASQUERADE would have changed and here deliberately does not.
    flow: [
      F.segment({ from: FW_TO_PO[0], to: FW_TO_PO[1], name: 'toPo', lights: ['po'] }),
      F.segment({ from: PO_TO_ETH[0], to: PO_TO_ETH[1], after: 'toPo', name: 'out' }),
      tag({ text: 'src 10.244.1.5', points: PO_TO_ETH, after: 'toPo', easing: 'linear', dy: HOOK_TAG_DY }),
      F.light({ targets: ['eth'], at: 'out' }),
    ],
  },
  {
    id: 'reply',
    // Motion: the reply rides its own lane back to PREROUTING (1989ms), which lights on arrival.
    duration: 3000,
    narration: 'The backend answers, and the reply arrives on the wire addressed from 10.244.2.7 to the Pod. At PREROUTING conntrack matches it against the flow it recorded and sees an established connection, so the stored translation is reversed automatically on the way back out: the source becomes 10.96.0.20 again, the address the Pod dialed. Not a single Service rule is walked, which is why the rule walk is a first-packet cost and nothing more.',
    chips: { hookChip: 'PREROUTING', dstChip: '10.244.1.5', srcChip: '10.96.0.20:80 (restored)', ctChip: 'ESTABLISHED' },
    sublabels: { ct: FLOW_CT },
    opacity: CHAIN_UP,
    lit: ['hookChip', 'dstChip', 'ct', 'ctChip', 'srcChip'],
    // The strip reads the last state a hook saw, so it carries the outbound values until the reply
    // reaches PREROUTING at 1989 and conntrack reverses the translation there.
    rewind: { chips: { hookChip: 'FORWARD, POSTROUTING', dstChip: '10.244.2.7:8080', srcChip: '10.244.1.5 (no SNAT)', ctChip: 'DNAT recorded' } },
    // The reply rides its own lane, never a forward wire backwards, and PREROUTING lights as it lands.
    // The tag carries the source the backend actually sent, which conntrack is about to rewrite.
    flow: [
      F.route({ points: RETURN, name: 'back' }),
      tag({ text: 'src 10.244.2.7:8080', points: RETURN, emerge: 150 }),
      F.light({ targets: ['pre'], at: 'back' }),
      F.set({ at: 'back', chips: { hookChip: 'PREROUTING', dstChip: '10.244.1.5', srcChip: '10.96.0.20:80 (restored)', ctChip: 'ESTABLISHED' } }),
    ],
  },
  {
    id: 'ebpf',
    duration: 2600,
    narration: 'An eBPF dataplane does not walk this chain at all. It attaches to the socket hook instead, above netfilter, and rewrites the destination at connect time, before the first packet is even built. The hooks below stay empty, which is exactly what lets kube-proxy and its iptables chains be removed from the Node entirely.',
    chips: { hookChip: 'socket, above netfilter', dstChip: '10.244.2.7:8080', srcChip: '10.244.1.5', ctChip: 'in BPF maps' },
    sublabels: { ct: 'kept in BPF maps instead' },
    // The chain the packet no longer walks: dimming it is the message of the step.
    opacity: { pre: OPACITY.notready, rt: OPACITY.notready, fw: OPACITY.notready, po: OPACITY.notready, eth: 1, ct: OPACITY.notready },
    lit: ['srcChip', 'ctChip', 'hookChip', 'dstChip'],
    // Reflective beat: nothing travels here, because the point is the path NOT taken. The chips carry
    // the comparison, and the dimmed chain carries the rest.
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
