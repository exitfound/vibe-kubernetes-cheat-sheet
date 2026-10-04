import { P, F, defineCard, laneY, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS/network-pod-egress-snat.md


// Three bands rather than one line. The masqueraded path is the middle band and owns EGRESS_Y, the
// exempt destination sits in the top band reached from the rule box TOP face, and the conntrack
// store sits in the bottom band under the rule box. The whole content spans x 80..1120, centred on
// x=600 exactly, and the chip strip takes the same two extremes.
const EGRESS_Y = 390;               // the masqueraded path: Client Pod, POSTROUTING and Internet share it
const LANE_DY = 12;                 // half-gap between the out and back lanes of every pair
// 378 forward (Pod -> Internet) above the centre, 402 return (Internet -> Pod) below it.
const { out: FWD_Y, back: RET_Y } = laneY(EGRESS_Y, LANE_DY);

const NODE_X = 80, NODE_Y = 215, NODE_W = 620, NODE_H = 335;   // 80..700 x 215..550
const NODE_RIGHT = NODE_X + NODE_W;  // 700: the host boundary the masqueraded lanes cross

// 200 and not 232: the width this category's own client Pods run at, and the number
// `network-packet-classification` cites in its own SIZES block.
const POD_X = 100, POD_W = 200, POD_H = 120;
const POD_Y = EGRESS_Y - POD_H / 2;  // 330: shell centred on the egress line so both lanes meet it symmetrically
const POD_EDGE = POD_X + POD_W;      // 300: right edge of the client Pod SHELL, where the wires meet the block
const APP_H = 52;
// The app box is centred on the egress line inside the shell, so its own middle is 390 too.
const POD_INNER = { dx: 20, dy: (POD_H - APP_H) / 2, w: POD_W - 40, h: APP_H, label: 'app', sublabel: 'eth0' };

// The rule box is the LAST thing on the host, so it sits 20 inside the Node right edge rather than
// floating mid-frame: the packet crossing x=700 is the packet leaving the host. 232 is the
// `NET.L-01` default and it holds here: the widest string the box ever draws inks 168.8, which
// leaves 31.6 a side, measured with extents.mjs at 1600x1000.
const RULE_W = 232, RULE_H = 62;
const RULE_X = NODE_RIGHT - 20 - RULE_W;   // 448
const RULE_Y = EGRESS_Y - RULE_H / 2;      // 359: 359..421
const RULE_RIGHT = RULE_X + RULE_W;        // 680
const RULE_CX = RULE_X + RULE_W / 2;       // 564: the top and bottom face midpoints, which the exempt leg and the store both use
const RULE_BOTTOM = RULE_Y + RULE_H;       // 421

// The right-hand column, outside the Node, holds the two destinations the rule chooses between.
// Both end on x=1120, which is also where the chip strip ends.
const COL_X = 888, COL_W = 232, COL_RIGHT = COL_X + COL_W;   // 1120
const NET_H = 62;
const NET_Y = EGRESS_Y - NET_H / 2;        // 359: level with the rule box, so the masqueraded path is one straight band
// The exempt destination shares the Node frame top, which is what makes the top band read as a band.
const PEER_Y = NODE_Y, PEER_H = 110;
const PEER_MID = PEER_Y + PEER_H / 2;      // 270: the left face midpoint the exempt leg lands on
const PEER_INNER = { dx: 20, dy: (PEER_H - APP_H) / 2, w: COL_W - 40, h: APP_H, label: 'app', sublabel: 'eth0' };

// The conntrack store, in the band under the rule box, centred on the same RULE_CX.
const CT_W = 160, CT_H = 60;
const CT_X = RULE_CX - CT_W / 2;   // 484
const CT_Y = 470;                  // 470..530, leaving 20 inside the Node bottom

// Lane pairs. Every pair is +-LANE_DY about a face midpoint, which is the L-12 shape.
const POD_TO_RULE = [[POD_EDGE, FWD_Y], [RULE_X, FWD_Y]];
const RULE_TO_POD = [[RULE_X, RET_Y], [POD_EDGE, RET_Y]];
const OUT_PATH = [[RULE_RIGHT, FWD_Y], [COL_X, FWD_Y]];
const BACK_PATH = [[COL_X, RET_Y], [RULE_RIGHT, RET_Y]];
// The exempt leg leaves the rule box through its TOP face, so the two exits never share a face and
// never cross: the masqueraded one carries straight on out, the exempt one turns up and away.
const EXEMPT_PATH = [[RULE_CX, RULE_Y], [RULE_CX, PEER_MID], [COL_X, PEER_MID]];
// The store is written on the way out and read on the way back, so it gets a pair of its own.
const CT_WRITE = [[RULE_CX - LANE_DY, RULE_BOTTOM], [RULE_CX - LANE_DY, CT_Y]];
const CT_READ = [[RULE_CX + LANE_DY, CT_Y], [RULE_CX + LANE_DY, RULE_BOTTOM]];

// The caption stands over the part of the exempt run that is OUTSIDE the Node, not over the whole
// run: centred on the run midpoint (719) its longer form inked across the Node right edge at 700 and
// the comma of its shorter form sat on the dashed frame line. 794 is the midpoint of 700..888, which
// leaves 17 units a side on the widest of the two strings at 6.94 units a glyph.
const BRANCH_X = (NODE_RIGHT + COL_X) / 2;   // 794
const BRANCH_Y = PEER_MID - 12;              // 258

// Chip strip: the first chip starts on the Node left edge and the last ends on the column right
// edge, so the readout spans exactly the same width as the picture and both centre on x=600.
const CHIP_Y = 566, CHIP_H = 34, CHIP_GAP = 20;
const CHIP_W = [240, 220, 270, 250];
const CHIP_X = CHIP_W.reduce((acc, w, i) => (i ? [...acc, acc[i - 1] + CHIP_W[i - 1] + CHIP_GAP] : [NODE_X]), []);

// The list order IS the append order, which is the z-order: Node background, then the blocks, then
// the wires above them, then the caption and the chips, then the packet layer on top.
export const SCENE = {
  'aria-label': 'Pod egress to the internet: no route on the internet leads back to a Pod IP, so the last netfilter hook on the way out walks the POSTROUTING rules, where a destination inside the cluster pod CIDR is exempted and returned unchanged while everything else is source-NATed to the Node IP by MASQUERADE, conntrack stores the flow it translated, and the reply that comes back to the Node IP is reversed off that stored entry without walking a masquerade rule at all',
  parts: [
    P.defs(),
    P.node({ key: 'theNode', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node   ·   192.168.1.20' }),
    P.box({ key: 'ruleBox', x: RULE_X, y: RULE_Y, w: RULE_W, h: RULE_H, label: 'POSTROUTING', sublabel: 'nat table · masquerade rules' }),
    P.cylinder({ key: 'ctStore', x: CT_X, y: CT_Y, w: CT_W, h: CT_H, label: 'Conntrack' }),
    P.box({ key: 'net', x: COL_X, y: NET_Y, w: COL_W, h: NET_H, label: 'Internet', sublabel: '1.1.1.1:443' }),
    // eth0 is the Pod INNER box, so pulsePod (which pulses .scheme-pod-rect + .scheme-box-rect within
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
    P.arrow({ from: RULE_TO_POD[0], to: RULE_TO_POD[1], dashed: true, dim: true }),
    // The masqueraded path, out and back across the host boundary.
    P.arrow({ from: OUT_PATH[0], to: OUT_PATH[1], dashed: true, dim: true }),
    P.arrow({ from: BACK_PATH[0], to: BACK_PATH[1], dashed: true, dim: true }),
    // The exempt leg, and the store lanes under the rule box.
    P.lane({ points: EXEMPT_PATH, dashed: true, dim: true }),
    P.arrow({ from: CT_WRITE[0], to: CT_WRITE[1], dashed: true, dim: true }),
    P.arrow({ from: CT_READ[0], to: CT_READ[1], dashed: true, dim: true }),
    P.wire({ key: 'branch', x: BRANCH_X, y: BRANCH_Y }),
    P.chip({ key: 'srcChip', x: CHIP_X[0], y: CHIP_Y, w: CHIP_W[0], h: CHIP_H, name: 'packet src', value: '10.244.1.5' }),
    P.chip({ key: 'dstChip', x: CHIP_X[1], y: CHIP_Y, w: CHIP_W[1], h: CHIP_H, name: 'packet dst', value: '1.1.1.1:443' }),
    P.chip({ key: 'ruleChip', x: CHIP_X[2], y: CHIP_Y, w: CHIP_W[2], h: CHIP_H, name: 'rule matched', value: 'none' }),
    P.chip({ key: 'ctChip', x: CHIP_X[3], y: CHIP_Y, w: CHIP_W[3], h: CHIP_H, name: 'conntrack', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: ['ruleBox', 'ctStore', 'net', 'eth0', 'peerApp', 'srcChip', 'dstChip', 'ruleChip', 'ctChip'],
    pods: ['podGroup', 'peerPod'],
  },
};

const POD_IP = '10.244.1.5';
const NODE_IP = '192.168.1.20';
const PEER_IP = '10.244.2.7';
const DST = '1.1.1.1:443';
const KEPT = 'RETURN, source kept';
// The default -14 puts a riding address INSIDE the block it is arriving at, which is where the two
// addresses this card used to cut were lost. Measured at the two arrivals rather than mid-flight,
// because a riding tag holds for 160ms after the ball stops: the out tag clears into the 34-unit
// band between the peer Pod bottom (325) and the Internet top (359), and the return tag goes BELOW
// its lane instead, into the band between the rule box bottom (421) and the store top (470).
const TAG_UP = -38;
const TAG_DOWN = 38;

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
    // Up-arrow: the Pod pulses first, the packet leaves at BEAT.afterPulse and reaches the rule box,
    // which lights on arrival. The run is 110 units, too narrow for a riding address, and it does
    // not need one: the packet src chip is the readout this card rebuilt itself around.
    flow: [
      F.pulse({ pod: 'podGroup' }),
      F.segment({ from: POD_TO_RULE[0], to: POD_TO_RULE[1], delay: BEAT.afterPulse, name: 'send' }),
      F.light({ targets: ['ruleBox'], at: 'send' }),
    ],
  },
  {
    id: 'rule',
    duration: 2800,
    narration: 'Only the first packet of a flow walks these rules, in order. The first exempts anything inside the cluster, which is why Pod to Pod traffic keeps its own source, and 1.1.1.1 is outside 10.244.0.0/16, so it falls past RETURN to masquerade.',
    chips: { srcChip: POD_IP, dstChip: DST, ruleChip: 'RETURN not taken', ctChip: 'none' },
    // T-35: the leg this step plays is the road NOT taken, and the caption says so above it.
    wires: { branch: `if dst were ${PEER_IP}` },
    // The rule box is lit BEFORE its ball leaves (M-18a), and the chip carries the verdict.
    lit: ['ruleBox', 'ruleChip'],
    // A pulse names nothing `flowLights` can derive, so the static path states the inner box itself.
    reducedLit: ['peerApp'],
    // The ball arrives INTO a Pod, so the receiver blinks as a whole Pod rather than lighting its
    // inner box alone (`M-03`): a highlight on `peerApp` left the shell dark and read as the packet
    // reaching a box that happens to sit inside a Pod. Down-arrow order, so the packet travels first
    // and the pulse fires on its arrival.
    flow: [
      F.route({ points: EXEMPT_PATH, name: 'exempt' }),
      F.pulse({ pod: 'peerPod', at: 'exempt' }),
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
    // The store is written first and the packet leaves after that arrival, which is the order the
    // narration states: conntrack records the translation, then the translated packet goes out. The
    // rewritten source rides the out leg, whose 208 units are the only clear run on the card.
    flow: [
      F.segment({ from: CT_WRITE[0], to: CT_WRITE[1], lights: ['ctStore', 'ctChip'], name: 'store' }),
      F.set({ at: 'store', chips: { ctChip: 'entry stored' } }),
      F.segment({ from: OUT_PATH[0], to: OUT_PATH[1], after: 'store', name: 'out' }),
      F.tag({ text: `src ${NODE_IP}`, points: OUT_PATH, after: 'store', easing: 'linear', dy: TAG_UP }),
      F.light({ targets: ['net'], at: 'out' }),
    ],
  },
  {
    id: 'reply',
    duration: 3000,
    narration: 'The server answers 192.168.1.20, the only address it ever saw. The reply walks no masquerade rule at all. A conntrack lookup finds the stored entry and reverses the translation off it alone, which costs a lookup rather than a rule scan.',
    chips: { srcChip: DST, dstChip: POD_IP, ruleChip: 'no nat rule walked', ctChip: 'translation reversed' },
    wires: { branch: KEPT },
    // srcChip and ruleChip are news on this step and not carry-overs: the reply is a packet with the
    // SERVER as its source, and `no nat rule walked` is the sentence the step exists to make.
    lit: ['net', 'ctStore', 'srcChip', 'dstChip', 'ruleChip', 'ctChip'],
    // The reversal happens where the reply MEETS the rule box, so the two chips it moves cannot
    // already read their end state while the ball is still crossing: `chips` keeps the end state,
    // `rewind` carries what the reply actually arrives with, and one F.set writes both on arrival.
    rewind: { chips: { dstChip: NODE_IP, ctChip: 'entry matched' } },
    flow: [
      F.segment({ from: BACK_PATH[0], to: BACK_PATH[1], lights: ['ruleBox'], name: 'back' }),
      F.tag({ text: `dst ${NODE_IP}`, points: BACK_PATH, easing: 'linear', dy: TAG_DOWN }),
      F.segment({ from: CT_READ[0], to: CT_READ[1], at: 'back', name: 'read' }),
      F.set({ at: 'back', chips: { dstChip: POD_IP, ctChip: 'translation reversed' } }),
    ],
  },
  {
    id: 'deliver',
    duration: 2400,
    narration: 'With the destination restored to 10.244.1.5 the reply goes down the veth into the Pod. The Pod used its own source address the whole way, and the rewrite and its reversal both happened on the Node, invisible to either end of the connection.',
    chips: { srcChip: DST, dstChip: POD_IP, ruleChip: 'no nat rule walked', ctChip: 'translation reversed' },
    wires: { branch: KEPT },
    lit: ['ruleBox', 'dstChip'],
    // The animated path says the Pod was SERVED by pulsing it, which no lights list can name.
    reducedLit: ['eth0'],
    flow: [
      F.segment({ from: RULE_TO_POD[0], to: RULE_TO_POD[1], name: 'into' }),
      F.pulse({ pod: 'podGroup', at: 'into' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
