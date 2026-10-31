import { LANE_DY, P, F, defineCard, laneY, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS/network-pod-egress-snat.md

// Three bands: the masqueraded path in the middle owns EGRESS_Y, the exempt destination in the top
// band is reached from the rule box top face, and the conntrack store sits in the bottom band.
const EGRESS_Y = 390;               // the masqueraded path: Client Pod, POSTROUTING and Internet share it
// Forward above the centre, return below it.
const { out: FWD_Y, back: RET_Y } = laneY(EGRESS_Y, LANE_DY);

const NODE_X = 80, NODE_Y = 215, NODE_W = 620;   // the height closes 12 under the store below
const NODE_RIGHT = NODE_X + NODE_W;  // the host edge: the out lane crosses it, the reply stops

// 200, a client Pod width of this card's own, cited by `network-packet-classification`.
const POD_X = 100, POD_W = 200, POD_H = 120;
const POD_Y = EGRESS_Y - POD_H / 2;  // shell centred on the egress line so both lanes meet it symmetrically
const POD_EDGE = POD_X + POD_W;      // right edge of the client Pod shell, where the wires meet the block
const APP_H = 52;
// The app box is centred on the egress line inside the shell.
const POD_INNER = { dx: 20, dy: (POD_H - APP_H) / 2, w: POD_W - 40, h: APP_H, label: 'app', sublabel: 'eth0' };

// The rule box is the last thing on the host, 20 inside the Node right edge: the packet crossing
// x=700 is the packet leaving the host.
const RULE_W = 232, RULE_H = 80;
const RULE_X = NODE_RIGHT - 20 - RULE_W;
const RULE_Y = EGRESS_Y - RULE_H / 2;
const RULE_RIGHT = RULE_X + RULE_W;
const RULE_CX = RULE_X + RULE_W / 2;       // the top and bottom face midpoints, which the exempt leg and the store both use
const RULE_BOTTOM = RULE_Y + RULE_H;

// The right-hand column, outside the Node, holds the two destinations the rule chooses between.
// Both end on x=1120, which is also where the chip strip ends.
const COL_X = 888, COL_W = 232, COL_RIGHT = COL_X + COL_W;
const NET_H = 80;
const NET_Y = EGRESS_Y - NET_H / 2;        // level with the rule box, so the masqueraded path is one straight band
// The exempt destination shares the Node frame top, which is what makes the top band read as a band.
const PEER_Y = NODE_Y, PEER_H = 110;
const PEER_MID = PEER_Y + PEER_H / 2;      // the left face midpoint the exempt leg lands on
const PEER_INNER = { dx: 20, dy: (PEER_H - APP_H) / 2, w: COL_W - 40, h: APP_H, label: 'app', sublabel: 'eth0' };

// The conntrack store, in the band under the rule box, centred on the same RULE_CX.
const CT_W = 160, CT_H = 60;
const CT_X = RULE_CX - CT_W / 2;
const CT_Y = 470;
const NODE_H = CT_Y + CT_H + 12 - NODE_Y;   // the 12 floor under the store

// Lane pairs. Every pair is +-LANE_DY about a face midpoint, which is the L-12 shape.
const POD_TO_RULE = [[POD_EDGE, FWD_Y], [RULE_X, FWD_Y]];
const OUT_PATH = [[RULE_RIGHT, FWD_Y], [COL_X, FWD_Y]];
// The reply stops on the Node frame edge: it is reversed as it enters, not in the POSTROUTING box.
const BACK_PATH = [[COL_X, RET_Y], [NODE_RIGHT, RET_Y]];
// The de-NATed reply goes on from that edge to the Pod UNDER the rule box, midway between it and
// the store, because no nat rule runs for an established flow. It climbs back to RET_Y between them.
const UNDER_Y = (RULE_BOTTOM + CT_Y) / 2, DROP_X = (RULE_RIGHT + NODE_RIGHT) / 2, CLIMB_X = (POD_EDGE + RULE_X) / 2;
const DELIVER_PATH = [[NODE_RIGHT, RET_Y], [DROP_X, RET_Y], [DROP_X, UNDER_Y], [CLIMB_X, UNDER_Y], [CLIMB_X, RET_Y], [POD_EDGE, RET_Y]];
// The exempt leg leaves the rule box through its TOP face, so the two exits never share a face and
// never cross: the masqueraded one carries straight on out, the exempt one turns up and away.
const EXEMPT_PATH = [[RULE_CX, RULE_Y], [RULE_CX, PEER_MID], [COL_X, PEER_MID]];
// MASQUERADE writes the store on the way out. Nothing reads it back in the rule box: one lane.
const CT_WRITE = [[RULE_CX, RULE_BOTTOM], [RULE_CX, CT_Y]];

// The caption stands over the part of the exempt run outside the Node, so it clears the Node edge.
const BRANCH_X = (NODE_RIGHT + COL_X) / 2;
const BRANCH_Y = PEER_MID - 12;

// Chip strip: the first chip starts on the Node left edge and the last ends on the column right
// edge, so the readout spans exactly the same width as the picture and both centre on x=600.
const CHIP_Y = 566, CHIP_H = 34, CHIP_GAP = 20;
const CHIP_W = [240, 220, 270, 250];
const CHIP_X = CHIP_W.reduce((acc, w, i) => (i ? [...acc, acc[i - 1] + CHIP_W[i - 1] + CHIP_GAP] : [NODE_X]), []);

// The list order IS the append order, which is the z-order: Node background, then the blocks, then
// the wires above them, then the caption and the chips, then the packet layer on top.
export const SCENE = {
  'aria-label': 'Pod egress to the internet: no route on the internet leads back to a Pod IP, so the last netfilter hook on the way out walks the POSTROUTING rules. There RETURN exempts a destination in a non-masquerade range (one of them covers the cluster pod CIDR) with its source unchanged, while everything else is source-NATed to the Node IP by MASQUERADE. The conntrack table stores the translated flow, and the reply that comes back to the Node IP is reversed off that stored entry as it enters the Node, without walking a masquerade rule at all',
  parts: [
    P.defs(),
    P.node({ key: 'theNode', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node   ·   192.168.1.20' }),
    P.box({ key: 'ruleBox', x: RULE_X, y: RULE_Y, w: RULE_W, h: RULE_H, label: 'POSTROUTING', sublabel: 'nat table · masquerade rules' }),
    P.cylinder({ key: 'ctStore', x: CT_X, y: CT_Y, w: CT_W, h: CT_H, label: 'Conntrack' }),
    P.box({ key: 'net', x: COL_X, y: NET_Y, w: COL_W, h: NET_H, label: 'Internet', sublabel: '1.1.1.1:443' }),
    // eth0 is the Pod INNER box, so pulsePod (which pulses .diagram-pod-rect + .diagram-box-rect within
    // the group) blinks the app box together with the Pod shell.
    P.pod({
      key: 'podGroup', innerKey: 'eth0', x: POD_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Client Pod', sublabel: '10.244.1.5', inner: POD_INNER,
    }),
    // The exempt destination. It is on the canvas because the rule step names it (T-21): a rule that
    // exempts a range is only legible next to something inside that range.
    P.pod({
      key: 'peerPod', innerKey: 'peerApp', x: COL_X, y: PEER_Y, w: COL_W, h: PEER_H,
      label: 'Pod on Node B', sublabel: '10.244.2.7', inner: PEER_INNER,
    }),
    // The Pod lanes, one per direction, shared by their wire and their ball.
    P.arrow({ from: POD_TO_RULE[0], to: POD_TO_RULE[1], dashed: true, dim: true }),
    P.lane({ points: DELIVER_PATH, dashed: true, dim: true }),
    // The masqueraded path: out across the host boundary, back onto it.
    P.arrow({ from: OUT_PATH[0], to: OUT_PATH[1], dashed: true, dim: true }),
    P.arrow({ from: BACK_PATH[0], to: BACK_PATH[1], dashed: true, dim: true }),
    // The exempt leg, and the store lane under the rule box.
    P.lane({ points: EXEMPT_PATH, dashed: true, dim: true }),
    P.arrow({ from: CT_WRITE[0], to: CT_WRITE[1], dashed: true, dim: true }),
    P.wire({ key: 'branch', x: BRANCH_X, y: BRANCH_Y }),
    P.chip({ key: 'srcChip', x: CHIP_X[0], y: CHIP_Y, w: CHIP_W[0], h: CHIP_H, name: 'packet src', value: '10.244.1.5' }),
    P.chip({ key: 'dstChip', x: CHIP_X[1], y: CHIP_Y, w: CHIP_W[1], h: CHIP_H, name: 'packet dst', value: '1.1.1.1:443' }),
    P.chip({ key: 'ruleChip', x: CHIP_X[2], y: CHIP_Y, w: CHIP_W[2], h: CHIP_H, name: 'rule matched', value: 'none' }),
    P.chip({ key: 'ctChip', x: CHIP_X[3], y: CHIP_Y, w: CHIP_W[3], h: CHIP_H, name: 'conntrack', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: ['theNode', 'ruleBox', 'ctStore', 'net', 'eth0', 'peerApp', 'srcChip', 'dstChip', 'ruleChip', 'ctChip'],
    pods: ['podGroup', 'peerPod'],
  },
};

const POD_IP = '10.244.1.5';
const NODE_IP = '192.168.1.20';
const PEER_IP = '10.244.2.7';
const DST = '1.1.1.1:443';
const KEPT = 'RETURN, source kept';
// Riding tags offset off their lanes, so at each arrival they stand in clear bands rather than inside
// the block the ball reaches, and left of the ball, clear of the frame edge.
const TAG_UP = -38, TAG_DOWN = 54, TAG_DX = -36;
// The reply tag trails its ball on the right, under the Internet box and outside the Node, so it
// never sweeps across the deliver drop at DROP_X or prints through the frame where the ball lands.
const BACK_TAG_DX = 64;

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { srcChip: POD_IP, dstChip: DST, ruleChip: 'none', ctChip: 'none' },
    wires: { branch: KEPT },
  },
  {
    id: 'send',
    duration: 2200,
    narration: 'The app opens a connection to 1.1.1.1 and the packet leaves eth0 carrying src 10.244.1.5. No route on the internet leads back to that address, so the last netfilter hook on the way out is where the Node walks its POSTROUTING rules.',
    chips: { srcChip: POD_IP, dstChip: DST, ruleChip: 'none', ctChip: 'none' },
    wires: { branch: KEPT },
    // The src chip is what the ball currently carries.
    lit: ['srcChip'],
    // The animated path says the Pod SENT by pulsing it, which no lights list can name.
    reducedLit: ['eth0'],
    // Up-arrow: the Pod pulses first, the packet leaves at BEAT.afterPulse and lights the rule box on
    // arrival. No riding address: the run is too short, and the src chip is the readout.
    flow: [
      F.pulse({ pod: 'podGroup' }),
      F.segment({ from: POD_TO_RULE[0], to: POD_TO_RULE[1], delay: BEAT.afterPulse, name: 'send' }),
      F.light({ targets: ['ruleBox'], at: 'send' }),
    ],
  },
  {
    id: 'rule',
    duration: 3000,
    narration: 'Only the first packet of a flow walks these rules, in order. RETURN rules for the non-masquerade ranges come first (one covers the pod CIDR 10.244.0.0/16), so Pod to Pod traffic keeps its source. 1.1.1.1 is in none of them, so the packet falls past RETURN to masquerade.',
    chips: { srcChip: POD_IP, dstChip: DST, ruleChip: 'RETURN not taken', ctChip: 'none' },
    // T-35: the leg this step plays is the road NOT taken, and the caption says so above it.
    wires: { branch: `if dst were ${PEER_IP}` },
    // The rule box is lit BEFORE its ball leaves (M-18a), and the chip carries the verdict.
    lit: ['ruleBox', 'ruleChip'],
    // A pulse names nothing `flowLights` can derive, so the static path states the inner box itself.
    reducedLit: ['peerApp'],
    // The ball arrives into a Pod, so the whole Pod blinks rather than its inner box alone (`M-03`).
    // Down-arrow order: packet first, pulse on arrival.
    flow: [
      F.route({ points: EXEMPT_PATH, pulse: 'peerPod' }),
    ],
  },
  {
    id: 'masquerade',
    duration: 3000,
    narration: 'MASQUERADE rewrites the source to the address of the interface the packet leaves by, 192.168.1.20. The flow it just translated goes into conntrack, and the packet leaves looking like it came from the Node, an address the reply can be routed to.',
    chips: { srcChip: NODE_IP, dstChip: DST, ruleChip: 'MASQUERADE', ctChip: 'entry stored' },
    wires: { branch: KEPT },
    lit: ['ruleBox', 'srcChip', 'ruleChip'],
    // The rewrite is made in the rule box the packet stands in, so src and rule read it from entry.
    // The entry exists only once the store ball lands, so ctChip turns over and lights there (P-03).
    rewind: { chips: { ctChip: 'none' } },
    // The store is written first and the packet leaves after that arrival, the order the narration
    // states. The rewritten source rides the out leg, the only clear run on the card.
    flow: [
      F.segment({ from: CT_WRITE[0], to: CT_WRITE[1], lights: ['ctStore', 'ctChip'], name: 'store' }),
      F.set({ at: 'store', chips: { ctChip: 'entry stored' } }),
      F.segment({ from: OUT_PATH[0], to: OUT_PATH[1], after: 'store', name: 'out', tag: { text: `src ${NODE_IP}`, dx: TAG_DX, dy: TAG_UP } }),
      F.light({ targets: ['net'], at: 'out' }),
    ],
  },
  {
    id: 'reply',
    duration: 3000,
    narration: 'The server never saw the Pod IP, and its reply returns to 192.168.1.20. It walks no masquerade rule at all. As it enters the Node, a conntrack lookup finds the stored entry and reverses the translation off it alone, which costs a lookup rather than a rule scan.',
    chips: { srcChip: DST, dstChip: POD_IP, ruleChip: 'no nat rule walked', ctChip: 'translation reversed' },
    wires: { branch: KEPT },
    // srcChip and ruleChip are news on this step and not carry-overs: the reply is a packet with the
    // SERVER as its source, and `no nat rule walked` is the sentence the step exists to make.
    lit: ['net', 'ctStore', 'srcChip', 'dstChip', 'ruleChip', 'ctChip'],
    // The reversal happens where the reply ENTERS the Node, so the two chips it moves cannot
    // already read their end state while the ball is still crossing: `chips` keeps the end state,
    // `rewind` carries what the reply actually arrives with, and one F.set writes both on arrival.
    rewind: { chips: { dstChip: NODE_IP, ctChip: 'entry matched' } },
    // The reply is addressed to the Node IP, so the Node frame lights where it lands.
    flow: [
      F.segment({ from: BACK_PATH[0], to: BACK_PATH[1], lights: ['theNode'], name: 'back', tag: { text: `dst ${NODE_IP}`, dx: BACK_TAG_DX, dy: TAG_DOWN } }),
      F.set({ at: 'back', chips: { dstChip: POD_IP, ctChip: 'translation reversed' } }),
    ],
  },
  {
    id: 'deliver',
    duration: 2400,
    narration: 'With the destination restored to 10.244.1.5 the reply goes down the veth into the Pod. The Pod used its own source address the whole way. The rewrite and its reversal both happened on the Node, invisible to either end of the connection.',
    chips: { srcChip: DST, dstChip: POD_IP, ruleChip: 'no nat rule walked', ctChip: 'translation reversed' },
    wires: { branch: KEPT },
    // The ball leaves the Node edge the reply landed on, so the Node frame is the lit sender (M-18a).
    lit: ['theNode', 'dstChip'],
    // The animated path says the Pod was SERVED by pulsing it, which no lights list can name.
    reducedLit: ['eth0'],
    flow: [
      F.route({ points: DELIVER_PATH, pulse: 'podGroup' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
