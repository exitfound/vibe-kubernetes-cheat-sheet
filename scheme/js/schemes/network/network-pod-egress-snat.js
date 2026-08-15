import { P, F, defineCard, laneY, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-pod-egress-snat


const EGRESS_Y = 360;               // vertical center of the Pod and masquerade boxes: both lanes sit symmetric about it
const LANE_DY = 12;                 // half-gap between the two horizontal lanes
// 348 forward lane (Pod -> Internet) above center, 372 return lane (Internet -> Pod) below it.
const { out: FWD_Y, back: RET_Y } = laneY(EGRESS_Y, LANE_DY);
const NODE_X = 80, NODE_Y = 214, NODE_W = 620, NODE_H = 312;   // Node left edge lines up with the src chip left edge
const POD_X = 110, POD_W = 200, POD_H = 124;
const POD_Y = EGRESS_Y - POD_H / 2; // 298: shell centred on the egress line so both lanes meet it symmetrically
const POD_EDGE = POD_X + POD_W;     // 310: right edge of the client Pod SHELL (not the inner app box): wires meet the Pod block itself
const APP_H = 52;
// The app box is centred on the egress line inside the shell, so dy is 36 and its own middle is 360.
const POD_INNER = { dx: 20, dy: (POD_H - APP_H) / 2, w: POD_W - 40, h: APP_H, label: 'app', sublabel: 'eth0' };
const MASQ_LEFT = 440, MASQ_W = 190, MASQ_H = 62;
const MASQ_RIGHT = MASQ_LEFT + MASQ_W;   // 630
const MASQ_Y = EGRESS_Y - MASQ_H / 2;    // 329
// Outside the Node, in its own right-hand column, its top level with the Node frame so the whole
// composition sits below the panel (bottom <= 181). Its right edge equals the dst chip right.
const NET_X = 890, NET_Y = NODE_Y, NET_W = 230, NET_H = 62;
const NET_CX = NET_X + NET_W / 2;   // 1005: horizontal center of the Internet box
const NET_BOTTOM = NET_Y + NET_H;   // 276: where the legs meet the Internet box bottom
// The two vertical legs sit symmetric about NET_CX so entry and exit are centered on the box: the
// forward leg rises into the box left of center, the return leg descends right of center.
const LEG_DX = 20;
const FWD_UP_X = NET_CX - LEG_DX;   // 985
const RET_DOWN_X = NET_CX + LEG_DX; // 1025
const OUT_PATH = [[MASQ_RIGHT, FWD_Y], [FWD_UP_X, FWD_Y], [FWD_UP_X, NET_BOTTOM]];
const RET_PATH = [[RET_DOWN_X, NET_BOTTOM], [RET_DOWN_X, RET_Y], [MASQ_RIGHT, RET_Y]];
// The two short Pod lanes, one per direction, shared by their wire and their ball.
const POD_TO_MASQ = [[POD_EDGE, FWD_Y], [MASQ_LEFT, FWD_Y]];
const MASQ_TO_POD = [[MASQ_LEFT, RET_Y], [POD_EDGE, RET_Y]];

// Chip strip: src chip left == Node left, dst chip right == Internet right, even gaps between.
const CHIP_Y = 560, CHIP_H = 34, CHIP_GAP = 20;
const CHIP_W = [270, 270, 230, 210];
const CHIP_X = CHIP_W.reduce((acc, w, i) => (i ? [...acc, acc[i - 1] + CHIP_W[i - 1] + CHIP_GAP] : [NODE_X]), []);

// The list order IS the append order, which is the z-order: Node background, then Pod + masquerade
// + internet boxes, then wires above, then chips, then the packet layer on top.
export const SCENE = {
  'aria-label': 'Pod egress to the internet: a Pod IP is private to the cluster and not routable outside, so as the packet leaves the Node it is source-NATed to the Node IP by an iptables MASQUERADE rule, conntrack records the mapping, the internet replies to the Node IP, and conntrack reverses the translation so the reply reaches the Pod',
  parts: [
    P.defs(),
    P.node({ key: 'theNode', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node   ·   192.168.1.20' }),
    P.box({ key: 'masq', x: MASQ_LEFT, y: MASQ_Y, w: MASQ_W, h: MASQ_H, label: 'MASQUERADE', sublabel: 'iptables SNAT' }),
    P.box({ key: 'net', x: NET_X, y: NET_Y, w: NET_W, h: NET_H, label: 'Internet', sublabel: '1.1.1.1:443' }),
    // eth0 is the Pod INNER box, so pulsePod (which pulses .scheme-pod-rect + .scheme-box-rect within
    // the group) blinks the app box together with the Pod shell.
    P.pod({
      key: 'podGroup', innerKey: 'eth0', x: POD_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Client Pod', sublabel: '10.244.1.5', inner: POD_INNER,
    }),
    // Forward lane: Pod eth0 -> masquerade (upper), then the right-angle leg up into the Internet box.
    P.arrow({ from: POD_TO_MASQ[0], to: POD_TO_MASQ[1], dashed: true, dim: true }),
    P.lane({ points: OUT_PATH, dashed: true, dim: true }),
    // Return lane: the reply leg down out of the Internet box, then masquerade -> Pod eth0 (lower).
    P.lane({ points: RET_PATH, dashed: true, dim: true }),
    P.arrow({ from: MASQ_TO_POD[0], to: MASQ_TO_POD[1], dashed: true, dim: true }),
    P.chip({ key: 'srcChip', x: CHIP_X[0], y: CHIP_Y, w: CHIP_W[0], h: CHIP_H, name: 'src', value: '10.244.1.5' }),
    P.chip({ key: 'snatChip', x: CHIP_X[1], y: CHIP_Y, w: CHIP_W[1], h: CHIP_H, name: 'SNAT', value: 'none' }),
    P.chip({ key: 'ctChip', x: CHIP_X[2], y: CHIP_Y, w: CHIP_W[2], h: CHIP_H, name: 'conntrack', value: 'none' }),
    P.chip({ key: 'dstChip', x: CHIP_X[3], y: CHIP_Y, w: CHIP_W[3], h: CHIP_H, name: 'dst', value: '1.1.1.1:443' }),
    P.packets(),
  ],
  reset: {
    keys: ['masq', 'net', 'eth0', 'srcChip', 'snatChip', 'ctChip', 'dstChip'],
    pods: ['podGroup'],
  },
};

const POD_IP = '10.244.1.5';
const NODE_IP = '-> 192.168.1.20';
const DST = '1.1.1.1:443';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { srcChip: POD_IP, snatChip: 'none', ctChip: 'none', dstChip: DST },
  },
  {
    id: 'send',
    duration: 2200,
    narration: 'The Pod sends to 1.1.1.1 out its eth0. The packet carries src 10.244.1.5 and rides the veth into the Node, where it heads for the egress path on its way off the host.',
    chips: { srcChip: POD_IP, snatChip: 'none', ctChip: 'none', dstChip: DST },
    // The src chip is what the ball currently carries.
    lit: ['srcChip'],
    // The animated path says the Pod SENT by pulsing it, which no lights list can name.
    reducedLit: ['eth0'],
    // Up-arrow: the Pod pulses first, the packet leaves at BEAT.afterPulse and reaches the
    // masquerade box, which lights on arrival. The src IP rides with the ball.
    flow: [
      F.pulse({ pod: 'podGroup' }),
      F.segment({ from: POD_TO_MASQ[0], to: POD_TO_MASQ[1], delay: BEAT.afterPulse, name: 'send' }),
      F.tag({ text: 'src 10.244.1.5', points: POD_TO_MASQ, delay: BEAT.afterPulse, easing: 'linear' }),
      F.light({ targets: ['masq'], at: 'send' }),
    ],
  },
  {
    id: 'masquerade',
    duration: 2600,
    narration: 'As the packet leaves the Node, a MASQUERADE rule rewrites the source from the Pod IP to the Node IP, 192.168.1.20, and conntrack records the mapping. The packet now looks like it came from the Node itself, an address the reply can be routed back to.',
    // SNAT and conntrack both update here, and the packet reaches the internet (dst).
    chips: { srcChip: POD_IP, snatChip: NODE_IP, ctChip: 'flow recorded', dstChip: DST },
    lit: ['masq', 'snatChip', 'ctChip', 'dstChip'],
    // The SNAT-ed packet emerges from the masquerade box (rewrite happened inside), turns up the
    // L into the Internet box, which lights on arrival. The rewritten src rides with the ball.
    flow: [
      F.route({ points: OUT_PATH, name: 'out' }),
      F.tag({ text: 'src 192.168.1.20', points: OUT_PATH }),
      F.light({ targets: ['net'], at: 'out' }),
    ],
  },
  {
    id: 'reply',
    duration: 2600,
    narration: 'The server replies to 192.168.1.20, the only address it ever saw. The reply arrives at the Node, where conntrack matches the stored flow and reverses the translation, rewriting the destination back to 10.244.1.5.',
    // The reply originates at the Internet server (net stays lit as the ball departs it) and
    // conntrack reverses the mapping.
    chips: { srcChip: POD_IP, snatChip: NODE_IP, ctChip: 'reverse SNAT', dstChip: DST },
    lit: ['net', 'ctChip', 'dstChip'],
    // Nothing stands between the ball and its cue here, so the masquerade box is cued by `lights`.
    flow: [
      F.route({ points: RET_PATH, lights: ['masq'] }),
      F.tag({ text: 'dst 192.168.1.20', points: RET_PATH }),
    ],
  },
  {
    id: 'deliver',
    duration: 2400,
    narration: 'With the destination restored to the Pod IP, the reply is delivered back down the veth into the Pod. The Pod only ever used its own source address, the SNAT and its reversal happened entirely on the Node, invisible to both ends.',
    chips: { srcChip: POD_IP, snatChip: NODE_IP, ctChip: 'reverse SNAT', dstChip: DST },
    // Delivered back to the src Pod.
    lit: ['masq', 'srcChip'],
    // The animated path says the Pod was SERVED by pulsing it, which no lights list can name.
    reducedLit: ['eth0'],
    // Reverse direction: the restored packet leaves the masquerade box and hops back into the Pod,
    // which pulses on arrival as the receiver. The restored dst (pod IP) rides with the ball.
    flow: [
      F.segment({ from: MASQ_TO_POD[0], to: MASQ_TO_POD[1], name: 'into' }),
      F.tag({ text: 'dst 10.244.1.5', points: MASQ_TO_POD, easing: 'linear' }),
      F.pulse({ pod: 'podGroup', at: 'into' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
