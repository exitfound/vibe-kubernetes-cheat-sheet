import { P, F, defineCard, laneY, routeDur, BEAT, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-service-clusterip

const CX = 600;                     // canvas centre: the ClusterIP column and the chip strip sit on it
const SCHEME_L = 60, SCHEME_R = 1140; // content edges, mirrored about CX

const FLOW_Y = 312;                 // center line: client, kube-proxy and the two fans are symmetric about it
const LANE_DY = 12;                 // half-gap between the two client <-> kube-proxy lanes
const { out: FWD_Y, back: RET_Y } = laneY(FLOW_Y, LANE_DY);   // 300 out, 324 back
const CLIENT_X = SCHEME_L, CLIENT_W = 190, CLIENT_H = 120;
const CLIENT_EDGE = CLIENT_X + CLIENT_W;  // 250: right edge of the client Pod shell, where both client lanes meet it
const KP_W = 220, KP_H = 72;        // ClusterIP box and kube-proxy box share one size, centred on CX
const KP_LEFT = CX - KP_W / 2;      // 490
const KP_RIGHT = CX + KP_W / 2;     // 710
const KP_TOP = FLOW_Y - KP_H / 2;   // 276: kube-proxy sits on the flow line
const VIP_Y = 120;                  // the virtual ClusterIP is lifted clear above it
const VIP_BOTTOM = VIP_Y + KP_H;    // 192
const POD_W = 210, POD_H = 114;
const POD_LEFT = SCHEME_R - POD_W;  // 930: backend column, flush with the right content edge
const POD_OFFSET = 150;             // each backend centre is this far above/below FLOW_Y (mirror pair)
const { out: PODX_CY, back: PODY_CY } = laneY(FLOW_Y, POD_OFFSET);   // 162 top, 462 bottom
const PODX_Y = PODX_CY - POD_H / 2; // 105
const PODY_Y = PODY_CY - POD_H / 2; // 405
const POD_INNER = { dx: 20, dy: 34, h: 52 };
const FAN_DY = 12;                  // fan attaches +/-FAN_DY from a Pod centre at its left edge
const FAN_OUT_X = KP_RIGHT + 40, FAN_IN_X = KP_RIGHT + 70; // forward (out) and return (in) vertical buses
// kube-proxy right-edge attach points, two mirrored pairs about FLOW_Y: the forward legs sit 18 out
// (294 / 330), the return legs 6 out (306 / 318), so podX takes the upper of each pair.
const { out: KPX_FWD_Y, back: KPY_FWD_Y } = laneY(FLOW_Y, 18);
const { out: KPX_RET_Y, back: KPY_RET_Y } = laneY(FLOW_Y, 6);

// Chip strip: four cells spanning SCHEME_L..SCHEME_R with even gaps, so it centres on CX. Widths are
// not equal: each is sized for its own longest value (DNAT carries the widest).
const CHIP_Y = 548, CHIP_H = 34, CHIP_GAP = 20;
const CHIP_W = [270, 310, 225, 215];
const CHIP_X = CHIP_W.reduce((acc, w, i) => (i ? [...acc, acc[i - 1] + CHIP_W[i - 1] + CHIP_GAP] : [SCHEME_L]), []);

const LANE_FWD = [[CLIENT_EDGE, FWD_Y], [KP_LEFT, FWD_Y]];
const LANE_RET = [[KP_LEFT, RET_Y], [CLIENT_EDGE, RET_Y]];
const FAN_FWD_X = [[KP_RIGHT, KPX_FWD_Y], [FAN_OUT_X, KPX_FWD_Y], [FAN_OUT_X, PODX_CY - FAN_DY], [POD_LEFT, PODX_CY - FAN_DY]];
const FAN_RET_X = [[POD_LEFT, PODX_CY + FAN_DY], [FAN_IN_X, PODX_CY + FAN_DY], [FAN_IN_X, KPX_RET_Y], [KP_RIGHT, KPX_RET_Y]];
const FAN_FWD_Y = [[KP_RIGHT, KPY_FWD_Y], [FAN_OUT_X, KPY_FWD_Y], [FAN_OUT_X, PODY_CY + FAN_DY], [POD_LEFT, PODY_CY + FAN_DY]];
const FAN_RET_Y = [[POD_LEFT, PODY_CY - FAN_DY], [FAN_IN_X, PODY_CY - FAN_DY], [FAN_IN_X, KPY_RET_Y], [KP_RIGHT, KPY_RET_Y]];

const SLOWMO = 1.1;
const slowDur = (points) => Math.round(routeDur(points) * SLOWMO);

const backend = (key, y, ip) => P.pod({
  key, innerKey: `${key}Box`, x: POD_LEFT, y, w: POD_W, h: POD_H, label: 'Pod web', sublabel: ip,
  inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: POD_W - POD_INNER.dx * 2, h: POD_INNER.h, label: 'app', sublabel: 'eth0' },
});

// The list order IS the append order, which is the z-order: boxes and Pods, then the wires ABOVE
// them, then the chips, then the packet layer carrying the ball and its riding tag on top.
export const SCENE = {
  'aria-label': 'ClusterIP routing via kube-proxy: a client sends to a virtual ClusterIP that no interface owns, kube-proxy intercepts and DNATs the packet to one of two symmetric backing Pods, and connection tracking rewrites the reply so the client never sees the Pod address',
  parts: [
    P.defs(),
    P.box({ key: 'vip', x: KP_LEFT, y: VIP_Y, w: KP_W, h: KP_H, label: 'ClusterIP 10.96.0.20:80', sublabel: 'virtual · no interface' }),
    P.box({ key: 'kproxy', x: KP_LEFT, y: KP_TOP, w: KP_W, h: KP_H, label: 'kube-proxy', sublabel: 'DNAT dataplane' }),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: CLIENT_X, y: FLOW_Y - CLIENT_H / 2, w: CLIENT_W, h: CLIENT_H,
      label: 'Client Pod', sublabel: '10.244.1.5',
      inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: CLIENT_W - POD_INNER.dx * 2, h: POD_INNER.h, label: 'app', sublabel: 'eth0' },
    }),
    backend('podX', PODX_Y, '10.244.2.7:8080'),
    backend('podY', PODY_Y, '10.244.3.9:8080'),
    P.arrow({ x1: CLIENT_EDGE, y1: FWD_Y, x2: KP_LEFT, y2: FWD_Y, dashed: true, dim: true }),
    P.arrow({ x1: KP_LEFT, y1: RET_Y, x2: CLIENT_EDGE, y2: RET_Y, dashed: true, dim: true }),
    // NET.A-01 as ownership, not traffic: kube-proxy REALIZES the virtual IP, so the link carries
    // no arrowhead and no ball ever rides it.
    P.relation({ points: [[CX, VIP_BOTTOM], [CX, KP_TOP]], dash: '5 5' }),
    P.lane({ points: FAN_FWD_X, dashed: true, dim: true }),
    P.lane({ points: FAN_RET_X, dashed: true, dim: true }),
    P.lane({ points: FAN_FWD_Y, dashed: true, dim: true }),
    P.lane({ points: FAN_RET_Y, dashed: true, dim: true }),
    // Named clusterIP, not dst: this holds the ONE address the client dials, true on every step,
    // while `dst` is what the ball carries and the riding tag already says it.
    P.chip({ key: 'vipChip', x: CHIP_X[0], y: CHIP_Y, w: CHIP_W[0], h: CHIP_H, name: 'clusterIP', value: '10.96.0.20:80' }),
    P.chip({ key: 'dnatChip', x: CHIP_X[1], y: CHIP_Y, w: CHIP_W[1], h: CHIP_H, name: 'DNAT', value: 'none' }),
    P.chip({ key: 'ctChip', x: CHIP_X[2], y: CHIP_Y, w: CHIP_W[2], h: CHIP_H, name: 'conntrack', value: 'none' }),
    P.chip({ key: 'backChip', x: CHIP_X[3], y: CHIP_Y, w: CHIP_W[3], h: CHIP_H, name: 'backend', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: ['vip', 'kproxy', 'vipChip', 'dnatChip', 'ctChip', 'backChip', 'clientBox', 'podXBox', 'podYBox'],
    pods: ['client', 'podX', 'podY'],
  },
};

// Which backend this flow is NOT serving, as FIELDS: both Pods are stated on every step, so a dim
// set by an earlier flow cannot survive into the next one (NET.S-02 for the boxes, this for the shells).
const serving = (lit) => ({ opacity: { podX: lit === 'podX' ? 1 : OPACITY.notready, podY: lit === 'podY' ? 1 : OPACITY.notready } });
const BOTH_UP = { opacity: { podX: 1, podY: 1 } };
const VIP = '10.96.0.20:80';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { dnatChip: 'none', ctChip: 'none', backChip: 'none', vipChip: VIP },
    ...BOTH_UP,
  },
  {
    id: 'virtual',
    duration: 2100,
    narration: 'The ClusterIP is virtual. No network interface holds it and no Pod answers ARP for it, so it never appears on a wire. It exists only as a target that kube-proxy has taught every Node how to intercept.',
    chips: { dnatChip: 'none', ctChip: 'none', backChip: 'none', vipChip: VIP },
    ...BOTH_UP,
    // Infrastructure block: it lights via .highlight, it never blinks. Only Pods pulse.
    lit: ['vip'],
  },
  {
    id: 'program',
    duration: 2300,
    narration: 'The kube-proxy watches the Service and its EndpointSlices and installs the dataplane rules: any packet whose destination is 10.96.0.20:80 should be DNAT-ed to one of the backend Pod IPs. The rules are in place before any traffic arrives.',
    chips: { dnatChip: '-> .2.7 / .3.9', ctChip: 'none', backChip: 'none', vipChip: VIP },
    ...BOTH_UP,
    lit: ['kproxy', 'dnatChip'],
  },
  {
    id: 'send',
    duration: 2300,
    narration: 'The client opens a connection to the ClusterIP 10.96.0.20:80. As the packet leaves the client it is caught by the kube-proxy rules on the Node before it can go anywhere, because there is no real host at that address to route to.',
    chips: { dnatChip: '-> .2.7 / .3.9', ctChip: 'none', backChip: 'none', vipChip: VIP },
    ...BOTH_UP,
    lit: ['vipChip'],
    // The animated path says the client SENT by pulsing it, which no lights list can name.
    reducedLit: ['clientBox'],
    // Up-arrow: the client pulses first, the packet leaves at BEAT.afterPulse along the forward lane
    // and is caught at kube-proxy, which lights on arrival. The ClusterIP dst rides with the ball.
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: LANE_FWD[0], to: LANE_FWD[1], delay: BEAT.afterPulse, dur: slowDur(LANE_FWD), name: 'send' }),
      F.tag({ text: 'dst 10.96.0.20:80', points: LANE_FWD, delay: BEAT.afterPulse, dur: slowDur(LANE_FWD), easing: 'linear' }),
      F.light({ targets: ['kproxy'], at: 'send' }),
    ],
  },
  {
    id: 'dnat',
    duration: 2500,
    narration: 'The kube-proxy picks one backend and rewrites the destination to that Pod IP, here 10.244.2.7:8080. Connection tracking records the mapping so every later packet of the same flow takes the same backend. The DNAT-ed packet is then delivered to the chosen Pod.',
    chips: { dnatChip: '-> 10.244.2.7:8080', ctChip: 'flow pinned', backChip: '10.244.2.7', vipChip: VIP },
    ...serving('podX'),
    lit: ['kproxy', 'dnatChip', 'ctChip', 'backChip'],
    reducedLit: ['podXBox'],
    // Down-arrow on a rewrite: the packet EMERGES from kube-proxy, because the DNAT happened inside
    // the box, and rides the forward fan to the chosen Pod, which pulses on arrival.
    flow: [
      F.route({ points: FAN_FWD_X, dur: slowDur(FAN_FWD_X), name: 'give' }),
      F.tag({ text: 'dst 10.244.2.7:8080', points: FAN_FWD_X, dur: slowDur(FAN_FWD_X) }),
      F.pulse({ pod: 'podX', at: 'give' }),
    ],
  },
  {
    id: 'reply',
    // Two-hop round trip at SLOWMO: the motion runs 3430ms, so this floor gives a 370ms settle after
    // the reply lands, matching the dwell of the single-hop steps instead of snapping straight on.
    duration: 3800,
    narration: 'The Pod replies from its own IP, but conntrack reverses the translation on the way back so the source looks like 10.96.0.20 again. The client only ever sees the ClusterIP it dialed, never the Pod address it was actually served by.',
    chips: { dnatChip: '-> 10.244.2.7:8080', ctChip: 'reverse NAT', backChip: '10.244.2.7', vipChip: VIP },
    ...serving('podX'),
    lit: ['ctChip'],
    reducedLit: ['clientBox'],
    flow: [
      F.pulse({ pod: 'podX' }),
      F.route({ points: FAN_RET_X, delay: BEAT.afterPulse, dur: slowDur(FAN_RET_X), name: 'h1' }),
      F.tag({ text: 'src 10.244.2.7', points: FAN_RET_X, delay: BEAT.afterPulse, dur: slowDur(FAN_RET_X) }),
      F.light({ targets: ['kproxy'], at: 'h1' }),
      F.segment({ from: LANE_RET[0], to: LANE_RET[1], after: 'h1', dur: slowDur(LANE_RET), name: 'h2' }),
      F.tag({ text: 'src 10.96.0.20', points: LANE_RET, after: 'h1', dur: slowDur(LANE_RET), easing: 'linear' }),
      F.pulse({ pod: 'client', at: 'h2' }),
    ],
  },
  {
    id: 'balance',
    // Same two-hop round trip as reply (3460ms of motion): match the settle so it is not rushed.
    duration: 3800,
    narration: 'A second connection to the same ClusterIP is a brand new flow, so kube-proxy is free to pick the other backend. It DNATs this one to 10.244.3.9 and conntrack pins it there, while the first flow stays on 10.244.2.7. Each connection sticks to its own Pod.',
    chips: { dnatChip: '-> 10.244.3.9:8080', ctChip: 'two flows', backChip: '10.244.3.9', vipChip: VIP },
    ...serving('podY'),
    lit: ['dnatChip', 'ctChip', 'backChip'],
    reducedLit: ['podYBox'],
    // This step is the send and the DNAT in one, so kube-proxy lights on the client packet
    // arriving, exactly as it does on the send step, and only then picks the second backend.
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: LANE_FWD[0], to: LANE_FWD[1], delay: BEAT.afterPulse, dur: slowDur(LANE_FWD), name: 'send' }),
      F.tag({ text: 'dst 10.96.0.20:80', points: LANE_FWD, delay: BEAT.afterPulse, dur: slowDur(LANE_FWD), easing: 'linear' }),
      F.light({ targets: ['kproxy'], at: 'send' }),
      F.route({ points: FAN_FWD_Y, after: 'send', dur: slowDur(FAN_FWD_Y), name: 'give' }),
      F.tag({ text: 'dst 10.244.3.9:8080', points: FAN_FWD_Y, after: 'send', dur: slowDur(FAN_FWD_Y) }),
      F.pulse({ pod: 'podY', at: 'give' }),
    ],
  },
  {
    id: 'balance-reply',
    // Same two-hop round trip (3430ms of motion): match the settle so the final step does not snap.
    duration: 3800,
    narration: 'The second backend Pod replies from its own 10.244.3.9, and conntrack reverses this second flow the same way, rewriting the source back to 10.96.0.20 before the reply reaches the client. Two Pods served two connections, and the client only ever saw the single ClusterIP.',
    chips: { dnatChip: '-> 10.244.3.9:8080', ctChip: 'reverse NAT', backChip: '10.244.3.9', vipChip: VIP },
    ...serving('podY'),
    lit: ['ctChip'],
    reducedLit: ['clientBox'],
    flow: [
      F.pulse({ pod: 'podY' }),
      F.route({ points: FAN_RET_Y, delay: BEAT.afterPulse, dur: slowDur(FAN_RET_Y), name: 'h1' }),
      F.tag({ text: 'src 10.244.3.9', points: FAN_RET_Y, delay: BEAT.afterPulse, dur: slowDur(FAN_RET_Y) }),
      F.light({ targets: ['kproxy'], at: 'h1' }),
      F.segment({ from: LANE_RET[0], to: LANE_RET[1], after: 'h1', dur: slowDur(LANE_RET), name: 'h2' }),
      F.tag({ text: 'src 10.96.0.20', points: LANE_RET, after: 'h1', dur: slowDur(LANE_RET), easing: 'linear' }),
      F.pulse({ pod: 'client', at: 'h2' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
