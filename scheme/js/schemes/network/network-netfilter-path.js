import { P, F, defineCard, makeRidingLabel, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS/network-netfilter-path.md

// One row of stations with the fork hanging off the routing decision. No Node frame: the host
// namespace boundary is named by its two interfaces, the veth in and eth0 out.
const SCHEME_LEFT = 40, SCHEME_RIGHT = 1160;
const SCHEME_CX = (SCHEME_LEFT + SCHEME_RIGHT) / 2;

const ROW_Y = 380, ROW_H = 70;
const ROW_CY = ROW_Y + ROW_H / 2;
const ROW_BOTTOM = ROW_Y + ROW_H;

// Unequal widths: PREROUTING shares its column with the conntrack table, and eth0 is narrowest
// because it is an interface, not a hook.
const PRE_X = SCHEME_LEFT, PRE_W = 290;
const PRE_RIGHT = PRE_X + PRE_W;
const PRE_CX = PRE_X + PRE_W / 2;
const RT_X = 370, RT_W = 180;
const RT_RIGHT = RT_X + RT_W;
const RT_CX = RT_X + RT_W / 2;
const FW_X = 590, FW_W = 160;
const FW_RIGHT = FW_X + FW_W;
const PO_X = 790, PO_W = 210;
const PO_RIGHT = PO_X + PO_W;
const ETH_X = 1040, ETH_W = 120;
const ETH_CX = ETH_X + ETH_W / 2;

// The conntrack table shares PREROUTING's column, the hook that writes and reads it, so the
// ownership marker is a straight drop.
const CT_X = PRE_X, CT_W = PRE_W, CT_Y = 490, CT_H = ROW_H;
const CT_CX = CT_X + CT_W / 2;
const CT_LINK = [[PRE_CX, ROW_BOTTOM], [CT_CX, CT_Y]];

// INPUT hangs below the row: a packet on the local leg never reaches what stands right of the
// routing decision.
const IN_X = 600, IN_W = 230, IN_Y = 490, IN_H = 70;
const IN_CX = IN_X + IN_W / 2;

const POD_W = 232, POD_Y = 60, POD_H = 110;
// The only block above the row, so it stands on the scheme centre line.
const POD_CX = SCHEME_CX;
const POD_X = POD_CX - POD_W / 2;
const POD_BOTTOM = POD_Y + POD_H;

// Both lanes into PREROUTING run in the corridor between the narration panel and the row.
const ENTRY_LANE_Y = 336;
const RETURN_LANE_Y = 360;
// The local leg runs in the band under the row, clear of the ownership marker.
const BRANCH_LANE_Y = 470;
// A deliberate lane pair on PREROUTING's top face (L-12), so the reply reads as its own arrival.
const TOP_DX = 55;

// Four unequal widths, each sized for its own values, spanning the row edge to edge.
const CHIP_Y = 586, CHIP_H = 34, CHIP_GAP = 20;
const CHIP_W = [270, 320, 260, 210];
const CHIP_X = CHIP_W.reduce((acc, w, i) => (i ? [...acc, acc[i - 1] + CHIP_W[i - 1] + CHIP_GAP] : [SCHEME_LEFT]), []);

// Wire and ball share each points array. The through path is one hop per station boundary, so the
// ball visibly stops at every one.
const ENTRY = [[POD_CX, POD_BOTTOM], [POD_CX, ENTRY_LANE_Y], [PRE_CX - TOP_DX, ENTRY_LANE_Y], [PRE_CX - TOP_DX, ROW_Y]];
const PRE_TO_RT = [[PRE_RIGHT, ROW_CY], [RT_X, ROW_CY]];
const RT_TO_FW = [[RT_RIGHT, ROW_CY], [FW_X, ROW_CY]];
const FW_TO_PO = [[FW_RIGHT, ROW_CY], [PO_X, ROW_CY]];
const PO_TO_ETH = [[PO_RIGHT, ROW_CY], [ETH_X, ROW_CY]];
// Nothing rides the local leg until the closing step, which is the point of the card.
const RT_TO_IN = [[RT_CX, ROW_BOTTOM], [RT_CX, BRANCH_LANE_Y], [IN_CX, BRANCH_LANE_Y], [IN_CX, IN_Y]];
// The reply has its own lane, so it never rides a forward wire backwards.
const RETURN = [[ETH_CX, ROW_Y], [ETH_CX, RETURN_LANE_Y], [PRE_CX + TOP_DX, RETURN_LANE_Y], [PRE_CX + TOP_DX, ROW_Y]];

// Only the entry tag emerges out of the Pod.
const emergeLabel = makeRidingLabel({ role: 'network', emergeMode: true });
const tag = (p) => F.tag({ ...p });
// A hook tag is wider than the gap between stations, so it rides between the return lane and the
// row top, where no block face cuts it.
const HOOK_TAG_DY = -40;
// Lifts the reply tag clear of the entry lane above it.
const RETURN_TAG_DY = -50;
// Offset right of the entry lane so the label clears it.
const VETH_LABEL_X = POD_CX + 84;

export const SCENE = {
  'aria-label': 'The netfilter path a packet takes: a client Pod packet crosses the veth into the host namespace and meets PREROUTING with conntrack and the nat table, then the routing decision, which is a fork with INPUT below it and FORWARD, POSTROUTING and eth0 along the row. DNAT runs before routing so routing judges the rewritten address, MASQUERADE waits for the last hook, the reply is untangled from the recorded flow with no rule walk, and an address the Node itself owns takes the other leg of the fork and never reaches POSTROUTING.',
  parts: [
    P.defs(),
    P.pod({
      key: 'podC', innerKey: 'podCBox', x: POD_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Client Pod', sublabel: '10.244.1.5 · own netns',
      inner: { dx: 20, dy: 30, w: POD_W - 40, h: 48, label: 'app', sublabel: 'eth0' },
    }),
    P.box({ key: 'pre', x: PRE_X, y: ROW_Y, w: PRE_W, h: ROW_H, label: 'PREROUTING', sublabel: 'nat · conntrack' }),
    P.box({ key: 'rt', x: RT_X, y: ROW_Y, w: RT_W, h: ROW_H, label: 'Routing decision', sublabel: 'not a hook' }),
    P.box({ key: 'fw', x: FW_X, y: ROW_Y, w: FW_W, h: ROW_H, label: 'FORWARD', sublabel: 'filter' }),
    P.box({ key: 'po', x: PO_X, y: ROW_Y, w: PO_W, h: ROW_H, label: 'POSTROUTING', sublabel: 'nat · MASQUERADE' }),
    P.box({ key: 'eth', x: ETH_X, y: ROW_Y, w: ETH_W, h: ROW_H, label: 'eth0', sublabel: 'NIC' }),
    P.box({ key: 'in', x: IN_X, y: IN_Y, w: IN_W, h: IN_H, label: 'INPUT', sublabel: 'filter · local socket' }),
    P.box({ key: 'ct', x: CT_X, y: CT_Y, w: CT_W, h: CT_H, label: 'Conntrack table', sublabel: 'no flow yet' }),
    P.lane({ points: ENTRY, dashed: true, dim: true }),
    P.arrow({ from: PRE_TO_RT[0], to: PRE_TO_RT[1], dashed: true, dim: true }),
    P.arrow({ from: RT_TO_FW[0], to: RT_TO_FW[1], dashed: true, dim: true }),
    P.arrow({ from: FW_TO_PO[0], to: FW_TO_PO[1], dashed: true, dim: true }),
    P.arrow({ from: PO_TO_ETH[0], to: PO_TO_ETH[1], dashed: true, dim: true }),
    P.lane({ points: RT_TO_IN, dashed: true, dim: true }),
    P.lane({ points: RETURN, dashed: true, dim: true }),
    // Ownership marker, not a traffic path: no packet travels it.
    P.relation({ points: CT_LINK, dash: '5 5' }),
    P.wire({ key: 'veth', x: VETH_LABEL_X, y: 252 }),
    P.wire({ key: 'exit', x: ETH_CX, y: ROW_BOTTOM + 20 }),
    P.chip({ key: 'hookChip', x: CHIP_X[0], y: CHIP_Y, w: CHIP_W[0], h: CHIP_H, name: 'hook', value: 'none' }),
    P.chip({ key: 'dstChip', x: CHIP_X[1], y: CHIP_Y, w: CHIP_W[1], h: CHIP_H, name: 'dst', value: '10.96.0.20:80' }),
    P.chip({ key: 'srcChip', x: CHIP_X[2], y: CHIP_Y, w: CHIP_W[2], h: CHIP_H, name: 'src', value: '10.244.1.5' }),
    P.chip({ key: 'ctChip', x: CHIP_X[3], y: CHIP_Y, w: CHIP_W[3], h: CHIP_H, name: 'conntrack', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: ['pre', 'rt', 'fw', 'po', 'eth', 'in', 'ct', 'hookChip', 'dstChip', 'srcChip', 'ctChip', 'podCBox'],
    pods: ['podC'],
  },
};

const VIP = '10.96.0.20:80';
const BACKEND = '10.244.2.7:8080';
const POD_IP = '10.244.1.5';
const NODE_IP = '10.0.1.4:8080';
const FLOW_VIP = '10.244.1.5 -> 10.96.0.20:80';
const FLOW_DNAT = '10.244.1.5 -> 10.244.2.7:8080';
const FLOW_LOCAL = '10.244.1.5 -> 10.0.1.4:8080';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { hookChip: 'none', dstChip: VIP, srcChip: POD_IP, ctChip: 'none' },
    sublabels: { ct: 'no flow yet' },
  },
  {
    id: 'enter',
    duration: 3200,
    narration: 'A packet leaves the client Pod through its veth pair and arrives in the host network namespace, so the kernel sees it as incoming traffic. The first hook it meets is PREROUTING, before any routing decision has run, and conntrack records a flow it has never seen.',
    chips: { hookChip: 'PREROUTING', dstChip: VIP, srcChip: POD_IP, ctChip: 'new flow' },
    sublabels: { ct: FLOW_VIP },
    wires: { veth: 'veth · into host netns' },
    lit: ['hookChip', 'ctChip'],
    reducedLit: ['podCBox'],
    // The hook and the recorded flow are both made by the arrival.
    rewind: { chips: { hookChip: 'none', ctChip: 'none' }, sublabels: { ct: 'no flow yet' } },
    // The tag emerges out of the Pod so it never prints over the Pod sublabel.
    flow: [
      F.pulse({ pod: 'podC' }),
      F.route({ points: ENTRY, delay: BEAT.afterPulse, name: 'inb' }),
      F.tag({ fn: emergeLabel, text: `dst ${VIP}`, points: ENTRY, delay: BEAT.afterPulse, emerge: 150 }),
      F.light({ targets: ['pre'], at: 'inb' }),
      F.set({ at: 'inb', chips: { hookChip: 'PREROUTING', ctChip: 'new flow' }, sublabels: { ct: FLOW_VIP } }),
    ],
  },
  {
    id: 'dnat',
    // T-20: the hold pays for the mode qualifier rather than dropping the clause.
    duration: 3000,
    narration: 'Inside PREROUTING the nat table runs, and the KUBE-SERVICES chain kube-proxy writes in iptables mode matches the ClusterIP. It rewrites the destination to a real backend, 10.244.2.7:8080 on Node-2, and conntrack stores that translation beside the flow. What leaves this hook is no longer addressed to a Service.',
    chips: { hookChip: 'PREROUTING (nat)', dstChip: BACKEND, srcChip: POD_IP, ctChip: 'DNAT recorded' },
    sublabels: { ct: FLOW_DNAT },
    lit: ['hookChip', 'pre', 'ct', 'dstChip', 'ctChip'],
    // The rewrite happened inside the hook, so the ball re-emerges already carrying the backend.
    flow: [
      F.segment({ from: PRE_TO_RT[0], to: PRE_TO_RT[1], name: 'hop' }),
      tag({ text: `dst ${BACKEND}`, points: PRE_TO_RT, easing: 'linear', dy: HOOK_TAG_DY }),
      F.light({ targets: ['rt'], at: 'hop' }),
    ],
  },
  {
    id: 'fork',
    duration: 2700,
    narration: 'Only now does the kernel decide where to send the packet, and it decides on the rewritten address. This box is the one on the row that is not a hook: it is a fork. An address the Node itself owns goes to INPUT and is delivered locally, everything else goes on to FORWARD.',
    chips: { hookChip: 'routing decision', dstChip: BACKEND, srcChip: POD_IP, ctChip: 'DNAT recorded' },
    sublabels: { ct: FLOW_DNAT },
    lit: ['rt', 'hookChip', 'dstChip'],
    // The backend is on another Node, so the through leg is taken.
    flow: [
      F.segment({ from: RT_TO_FW[0], to: RT_TO_FW[1], name: 'hop' }),
      tag({ text: 'not local, forward', points: RT_TO_FW, easing: 'linear', dy: HOOK_TAG_DY }),
      F.light({ targets: ['fw'], at: 'hop' }),
    ],
  },
  {
    id: 'out',
    // The hold carries the by-default qualifier, as on `dnat`.
    duration: 3000,
    narration: 'FORWARD is where the filter table runs, and where an iptables NetworkPolicy implementation drops what is not allowed. POSTROUTING is the last hook before the wire, and MASQUERADE lives there because only after routing is the outgoing interface known. Cluster traffic is excluded by default, so the Pod source survives.',
    chips: { hookChip: 'FORWARD, POSTROUTING', dstChip: BACKEND, srcChip: '10.244.1.5 (no SNAT)', ctChip: 'DNAT recorded' },
    wires: { exit: 'to Node-2' },
    sublabels: { ct: FLOW_DNAT },
    lit: ['fw'],
    // MASQUERADE is decided at POSTROUTING, so `hook` and `src` turn over on that arrival (P-03).
    rewind: { chips: { hookChip: 'FORWARD', srcChip: POD_IP } },
    // The source rides the last leg: the value MASQUERADE would have changed and does not.
    flow: [
      F.segment({ from: FW_TO_PO[0], to: FW_TO_PO[1], name: 'toPo', lights: ['po', 'hookChip', 'srcChip'] }),
      F.set({ at: 'toPo', chips: { hookChip: 'FORWARD, POSTROUTING', srcChip: '10.244.1.5 (no SNAT)' } }),
      F.segment({ from: PO_TO_ETH[0], to: PO_TO_ETH[1], after: 'toPo', name: 'exit' }),
      tag({ text: `src ${POD_IP}`, points: PO_TO_ETH, after: 'toPo', easing: 'linear', dy: HOOK_TAG_DY }),
      F.light({ targets: ['eth'], at: 'exit' }),
    ],
  },
  {
    id: 'reply',
    duration: 3800,
    narration: 'The reply arrives on eth0 from 10.244.2.7. At PREROUTING conntrack matches the recorded flow and sees an established connection, so no Service rule is read on the way back. The reversal itself is a source rewrite, so it lands at POSTROUTING: the source becomes 10.96.0.20 again, the address the Pod dialed, and the veth hands the packet to the Pod.',
    chips: { hookChip: 'PREROUTING, POSTROUTING', dstChip: POD_IP, srcChip: '10.96.0.20:80 (restored)', ctChip: 'ESTABLISHED' },
    wires: { exit: 'from Node-2' },
    sublabels: { ct: FLOW_DNAT },
    lit: ['eth', 'hookChip', 'dstChip', 'ct', 'ctChip', 'srcChip'],
    // The strip reads the last state a hook saw, so it turns over when the reply reaches PREROUTING.
    rewind: { chips: { hookChip: 'FORWARD, POSTROUTING', dstChip: BACKEND, srcChip: '10.244.1.5 (no SNAT)', ctChip: 'DNAT recorded' } },
    // The tag carries the source the backend sent, which conntrack is about to rewrite.
    flow: [
      F.route({ points: RETURN, delay: BEAT.lead, name: 'back', tag: { text: `src ${BACKEND}`, dy: RETURN_TAG_DY } }),
      F.light({ targets: ['pre'], at: 'back' }),
      F.set({ at: 'back', chips: { hookChip: 'PREROUTING, POSTROUTING', dstChip: POD_IP, srcChip: '10.96.0.20:80 (restored)', ctChip: 'ESTABLISHED' } }),
    ],
  },
  {
    id: 'local',
    duration: 3300,
    narration: 'The fork resolves the other way when the address after the rewrite belongs to the Node itself, which is what a hostNetwork backend gives it. Routing sends the packet to INPUT and a local socket has it. POSTROUTING is never reached, so MASQUERADE can never see such a packet.',
    chips: { hookChip: 'INPUT', dstChip: '10.0.1.4:8080 (this Node)', srcChip: POD_IP, ctChip: 'second flow' },
    sublabels: { ct: FLOW_LOCAL },
    lit: ['pre', 'hookChip', 'dstChip', 'srcChip', 'ctChip'],
    // All four chips turn over on one beat, as on `reply`: the alternative flow is one act.
    rewind: { chips: { hookChip: 'PREROUTING, POSTROUTING', dstChip: POD_IP, srcChip: '10.96.0.20:80 (restored)', ctChip: 'ESTABLISHED' }, sublabels: { ct: FLOW_DNAT } },
    flow: [
      F.segment({ from: PRE_TO_RT[0], to: PRE_TO_RT[1], delay: BEAT.lead, name: 'hop', lights: ['rt'] }),
      tag({ text: `dst ${NODE_IP}`, points: PRE_TO_RT, delay: BEAT.lead, easing: 'linear', dy: HOOK_TAG_DY }),
      F.route({ points: RT_TO_IN, after: 'hop', name: 'up' }),
      F.light({ targets: ['in'], at: 'up' }),
      F.set({ at: 'up', chips: { hookChip: 'INPUT', dstChip: '10.0.1.4:8080 (this Node)', srcChip: POD_IP, ctChip: 'second flow' }, sublabels: { ct: FLOW_LOCAL } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
