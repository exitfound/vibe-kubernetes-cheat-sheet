import { P, F, defineCard, makeRidingLabel, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS/network-netfilter-path.md


// One row of stations spanning the full width, with the FORK hanging off the routing decision. There
// is no Node frame: the boundary of the host namespace is named by its two interfaces instead, the
// veth on the way in and eth0 on the way out, which is what buys the band above the row for the
// client Pod and its entry lane. The chip strip spans the same 40..1160 the row does.
const SCHEME_LEFT = 40, SCHEME_RIGHT = 1160;
const SCHEME_CX = (SCHEME_LEFT + SCHEME_RIGHT) / 2;   // 600, and the Pod is centred on it

const ROW_Y = 380, ROW_H = 70;
const ROW_CY = ROW_Y + ROW_H / 2;              // 415
const ROW_BOTTOM = ROW_Y + ROW_H;              // 450

// The five row widths are UNEQUAL and each is sized for its own longest label: PREROUTING is the
// widest because the conntrack table below shares its column, and eth0 is the narrowest because it
// is an interface rather than a hook and has to read as a different kind of thing.
const PRE_X = SCHEME_LEFT, PRE_W = 290;
const PRE_RIGHT = PRE_X + PRE_W;               // 330
const PRE_CX = PRE_X + PRE_W / 2;              // 185
const RT_X = 370, RT_W = 180;
const RT_RIGHT = RT_X + RT_W;                  // 550
const RT_CX = RT_X + RT_W / 2;                 // 460
const FW_X = 590, FW_W = 160;
const FW_RIGHT = FW_X + FW_W;                  // 750
const PO_X = 790, PO_W = 210;
const PO_RIGHT = PO_X + PO_W;                  // 1000
const ETH_X = 1040, ETH_W = 120;
const ETH_CX = ETH_X + ETH_W / 2;              // 1100

// The conntrack table sits in PREROUTING's own column, edge for edge, because PREROUTING is the hook
// that writes it and the hook that reads it back. Sharing the column is what makes the ownership
// marker a straight drop between two face midpoints instead of a bracket. It takes the row's own
// height, so it is a block of the card like any other and its bottom lines up with INPUT's.
const CT_X = PRE_X, CT_W = PRE_W, CT_Y = 490, CT_H = ROW_H;
const CT_CX = CT_X + CT_W / 2;                 // 185
const CT_LINK = [[PRE_CX, ROW_BOTTOM], [CT_CX, CT_Y]];

// The local leg of the fork. INPUT is a hook like the others, so it keeps the row's height and the
// category's 232, and it hangs BELOW the row rather than on it: a packet that takes this leg has
// left the through path and never reaches what stands to the right of the routing decision.
const IN_X = 600, IN_W = 230, IN_Y = 490, IN_H = 70;
const IN_CX = IN_X + IN_W / 2;                 // 715

const POD_W = 232, POD_Y = 60, POD_H = 110;
// The Pod is the only block above the row, so it stands on the scheme's own centre line
// rather than on any block below it: derived from SCHEME_CX, never typed.
const POD_CX = SCHEME_CX;                      // 600
const POD_X = POD_CX - POD_W / 2;              // 484
const POD_BOTTOM = POD_Y + POD_H;              // 170

// The two lanes that reach PREROUTING from above share the corridor between the narration panel and
// the row. Both numbers are inherited measurements: 336 and 360 were clear of the panel on all three
// viewports on the previous build of this card and the row sits at the same y.
const ENTRY_LANE_Y = 336;
const RETURN_LANE_Y = 360;
// The fork's local leg runs in the 40 unit band under the row, clear of the ownership marker, which
// lives in PREROUTING's column at x=185 and never reaches x=460.
const BRANCH_LANE_Y = 470;
// A deliberate lane PAIR on PREROUTING's top face (L-12): the request lands 55 left of the midpoint
// and the reply 55 right of it, so the two never share a point and the reply is legible as its own
// arrival rather than as the request replayed.
const TOP_DX = 55;

// Chip strip: four cells with even gaps spanning the row 1:1, each sized for its own values. Four
// UNEQUAL widths, not a computed row: editing one without re-measuring is what
// `render/chipfit.test.mjs` catches.
const CHIP_Y = 586, CHIP_H = 34, CHIP_GAP = 20;
const CHIP_W = [270, 320, 260, 210];
const CHIP_X = CHIP_W.reduce((acc, w, i) => (i ? [...acc, acc[i - 1] + CHIP_W[i - 1] + CHIP_GAP] : [SCHEME_LEFT]), []);


// Each static wire and the ball that rides it share the same points array. The through path is four
// short hops, one per station boundary, so the ball visibly stops at every one instead of gliding past.
const ENTRY = [[POD_CX, POD_BOTTOM], [POD_CX, ENTRY_LANE_Y], [PRE_CX - TOP_DX, ENTRY_LANE_Y], [PRE_CX - TOP_DX, ROW_Y]];
const PRE_TO_RT = [[PRE_RIGHT, ROW_CY], [RT_X, ROW_CY]];
const RT_TO_FW = [[RT_RIGHT, ROW_CY], [FW_X, ROW_CY]];
const FW_TO_PO = [[FW_RIGHT, ROW_CY], [PO_X, ROW_CY]];
const PO_TO_ETH = [[PO_RIGHT, ROW_CY], [ETH_X, ROW_CY]];
// The local leg of the fork: down out of the routing decision, along the band under the row and into
// INPUT's top face. Nothing rides it until the closing step, which is the point of the card.
const RT_TO_IN = [[RT_CX, ROW_BOTTOM], [RT_CX, BRANCH_LANE_Y], [IN_CX, BRANCH_LANE_Y], [IN_CX, IN_Y]];
// The reply comes back off the wire and re-enters at PREROUTING on its own lane, above the row and
// below the entry lane, so it never rides a forward wire backwards.
const RETURN = [[ETH_CX, ROW_Y], [ETH_CX, RETURN_LANE_Y], [PRE_CX + TOP_DX, RETURN_LANE_Y], [PRE_CX + TOP_DX, ROW_Y]];

// The tag that rides a ball on this card, built once here and handed to every F.tag as `fn`: emergeMode
// floats the reply source out of eth0, and hold 0 clears each chain address before the next one rides.
const ridingLabel = makeRidingLabel({ role: 'network', outMs: 170, hold: 0, emergeMode: true });
const tag = (p) => F.tag({ fn: ridingLabel, ...p });
// A hop between two stations is a 40 unit gap against an address 100 to 108 wide, so at the default
// -14 both faces cut every chain tag for 600ms. -40 parks the tag in the band between the return lane
// (360) and the row top (380): 4.7 under the lane, 2.4 over the row. Measured clear from -38 to -94 on
// all viewports, and -38 leaves only 0.4 to the row.
const HOOK_TAG_DY = -40;
// The reply tag rides the return lane at 360, and the default -14 parks it at 346, 10 under the entry
// lane at 336 and inside its own ink. -40 lifts it to 320, 16 clear of that lane and 115 under the
// deepest panel reading, so it is clear on all three viewports.
const RETURN_TAG_DY = -40;
// The veth label sits 84 right of the entry lane's vertical, which is what keeps it clear of the
// lane: measured 616.5..751.5 at 1100x800, so 16.5 units of air against the lane at 600.
const VETH_LABEL_X = POD_CX + 84;              // 684

// The list order IS the append order, which is the z-order: the Pod and the stations in back, then
// the wires and the wire labels, then the chips, then the packet layer on top.
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
    // The one block on the row that is not a netfilter hook, and its sublabel is what says so.
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
    // The second leg of the fork. It is drawn on every step and ridden on the last one (NET.A-03):
    // a decision the reader can see was made among drawn alternatives.
    P.lane({ points: RT_TO_IN, dashed: true, dim: true }),
    P.lane({ points: RETURN, dashed: true, dim: true }),
    // Ownership marker, NOT a traffic path: PREROUTING is where the flow is looked up and recorded. No
    // packet ever travels it, so it is a plain dashed line with NO arrowhead.
    P.relation({ points: CT_LINK, dash: '5 5' }),
    // Two wire labels, both blank at build and filled per step: the boundary the packet crosses on the
    // way in, and where it is headed once it is on the wire.
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
    // Motion: the Pod pulses first, the ball leaves at BEAT.afterPulse(800) and rides the entry route
    // (680 units, 1511ms), so PREROUTING lights at 2311 and the step spans 2871.
    duration: 3200,
    narration: 'A packet leaves the client Pod through its veth pair and arrives in the host network namespace, so the kernel sees it as incoming traffic. The first hook it meets is PREROUTING, before any routing decision has run, and conntrack records a flow it has never seen.',
    chips: { hookChip: 'PREROUTING', dstChip: VIP, srcChip: POD_IP, ctChip: 'new flow' },
    sublabels: { ct: FLOW_VIP },
    wires: { veth: 'veth · into host netns' },
    lit: ['hookChip', 'ctChip'],
    reducedLit: ['podCBox'],
    // The hook the packet is AT and the flow conntrack records are both made by the arrival, so the
    // animated path holds the idle none and the empty table until the ball lands at 2236.
    rewind: { chips: { hookChip: 'none', ctChip: 'none' }, sublabels: { ct: 'no flow yet' } },
    // Up-arrow: the Pod is the sender, so it pulses FIRST and the packet leaves at BEAT.afterPulse. The
    // tag emerges 150ms out of the Pod so it never prints over the Pod sublabel it starts on top of.
    flow: [
      F.pulse({ pod: 'podC' }),
      F.route({ points: ENTRY, delay: BEAT.afterPulse, name: 'inb' }),
      tag({ text: `dst ${VIP}`, points: ENTRY, delay: BEAT.afterPulse, emerge: 150 }),
      F.light({ targets: ['pre'], at: 'inb' }),
      F.set({ at: 'inb', chips: { hookChip: 'PREROUTING', ctChip: 'new flow' }, sublabels: { ct: FLOW_VIP } }),
    ],
  },
  {
    id: 'dnat',
    // The mode qualifier on KUBE-SERVICES costs 46 characters, and T-20 pays for it in the HOLD
    // rather than by dropping the clause: 2600 read the longer sentence at 8.36 ms per character.
    duration: 3000,
    narration: 'Inside PREROUTING the nat table runs, and the KUBE-SERVICES chain kube-proxy writes in iptables mode matches the ClusterIP. It rewrites the destination to a real backend, 10.244.2.7:8080 on Node-2, and conntrack stores that translation beside the flow. What leaves this hook is no longer addressed to a Service.',
    chips: { hookChip: 'PREROUTING (nat)', dstChip: BACKEND, srcChip: POD_IP, ctChip: 'DNAT recorded' },
    sublabels: { ct: FLOW_DNAT },
    lit: ['hookChip', 'pre', 'ct', 'dstChip', 'ctChip'],
    // The rewrite happened INSIDE the hook, so the ball re-emerges at its right edge already carrying
    // the backend address, and the routing decision lights as it arrives.
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
    // 10.244.2.7 is on another Node, so the through leg is taken and FORWARD lights as the ball
    // arrives. The local leg is drawn beside it and stays empty until the closing step.
    flow: [
      F.segment({ from: RT_TO_FW[0], to: RT_TO_FW[1], name: 'hop' }),
      tag({ text: 'not local, forward', points: RT_TO_FW, easing: 'linear', dy: HOOK_TAG_DY }),
      F.light({ targets: ['fw'], at: 'hop' }),
    ],
  },
  {
    id: 'out',
    // Motion: FORWARD -> POSTROUTING (89) + hop beat(100) + POSTROUTING -> eth0 (89) = 278. The
    // hold carries the by-default qualifier on the masquerade exclusion the same way `dnat` does.
    duration: 3000,
    narration: 'FORWARD is where the filter table runs, and where an iptables NetworkPolicy implementation drops what is not allowed. POSTROUTING is the last hook before the wire, and MASQUERADE lives there because only after routing is the outgoing interface known. Cluster traffic is excluded by default, so the Pod source survives.',
    chips: { hookChip: 'FORWARD, POSTROUTING', dstChip: BACKEND, srcChip: '10.244.1.5 (no SNAT)', ctChip: 'DNAT recorded' },
    wires: { exit: 'to Node-2' },
    sublabels: { ct: FLOW_DNAT },
    lit: ['fw'],
    // The packet stands in FORWARD at entry and MASQUERADE is decided at POSTROUTING one hop later, so
    // `hook` and `src` hold their entry values until that arrival and turn over and light there (P-03).
    rewind: { chips: { hookChip: 'FORWARD', srcChip: POD_IP } },
    // Two chained hops: through POSTROUTING and out onto the wire. The source rides the ball on the last
    // leg, because that is the value MASQUERADE would have changed and here deliberately does not.
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
    // Motion: eth0 is the sender, so it is lit at entry and the ball leaves at BEAT.lead(800) and rides
    // its own lane back (900 units, 2000ms), landing at PREROUTING at 2800. The step spans 3360.
    duration: 3800,
    narration: 'The reply arrives on eth0 from 10.244.2.7. At PREROUTING conntrack matches the recorded flow and sees an established connection, so no Service rule is read on the way back. The reversal itself is a source rewrite, so it lands at POSTROUTING: the source becomes 10.96.0.20 again, the address the Pod dialed, and the veth hands the packet to the Pod.',
    chips: { hookChip: 'PREROUTING, POSTROUTING', dstChip: POD_IP, srcChip: '10.96.0.20:80 (restored)', ctChip: 'ESTABLISHED' },
    wires: { exit: 'from Node-2' },
    sublabels: { ct: FLOW_DNAT },
    lit: ['eth', 'hookChip', 'dstChip', 'ct', 'ctChip', 'srcChip'],
    // The strip reads the last state a hook saw, so it carries the outbound values until the reply
    // reaches PREROUTING at 2800 and conntrack reverses the translation there.
    rewind: { chips: { hookChip: 'FORWARD, POSTROUTING', dstChip: BACKEND, srcChip: '10.244.1.5 (no SNAT)', ctChip: 'DNAT recorded' } },
    // The reply rides its own lane, never a forward wire backwards, and PREROUTING lights as it lands.
    // The tag carries the source the backend actually sent, which conntrack is about to rewrite.
    flow: [
      F.route({ points: RETURN, delay: BEAT.lead, name: 'back' }),
      tag({ text: `src ${BACKEND}`, points: RETURN, delay: BEAT.lead, emerge: 150, dy: RETURN_TAG_DY }),
      F.light({ targets: ['pre'], at: 'back' }),
      F.set({ at: 'back', chips: { hookChip: 'PREROUTING, POSTROUTING', dstChip: POD_IP, srcChip: '10.96.0.20:80 (restored)', ctChip: 'ESTABLISHED' } }),
    ],
  },
  {
    id: 'local',
    // Motion: PREROUTING is the sender, lit at entry, the ball leaves at BEAT.lead(800), crosses to the
    // routing decision (89) and takes the local leg after the hop beat, landing in INPUT at 1644.
    // The step spans 2860.
    duration: 3300,
    narration: 'The fork resolves the other way when the address after the rewrite belongs to the Node itself, which is what a hostNetwork backend gives it. Routing sends the packet to INPUT and a local socket has it. POSTROUTING is never reached, so MASQUERADE can never see such a packet.',
    chips: { hookChip: 'INPUT', dstChip: '10.0.1.4:8080 (this Node)', srcChip: POD_IP, ctChip: 'second flow' },
    sublabels: { ct: FLOW_LOCAL },
    lit: ['pre', 'hookChip', 'dstChip', 'srcChip', 'ctChip'],
    // All four chips turn over on ONE beat, as on `reply`, because the alternative flow is one act:
    // the strip carries what the reply left until the ball lands in INPUT, and the ball leaving
    // PREROUTING under `hook PREROUTING` is the previous state read correctly rather than a lag.
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
