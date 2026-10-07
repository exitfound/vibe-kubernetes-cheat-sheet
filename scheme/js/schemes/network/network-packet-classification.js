import { P, F, defineCard, laneY, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS/network-packet-classification.md

// One Node frame holds the whole decision, and every destination sits outside it. The fork opens
// INSIDE the frame, so the two exits reach the frame face already separated. The content edges mirror
// about x=600 (L-13).
const SCHEME_L = 52, SCHEME_R = 1148;
// The frame stays symmetric about TRUNK_Y, so the floor mirrors the top.
const NODE_X = SCHEME_L, NODE_Y = 210, NODE_W = 820, NODE_H = 296;
const NODE_R = NODE_X + NODE_W;              // the Node border, where every exit lane starts
const TRUNK_Y = NODE_Y + NODE_H / 2;         // the frame's own mid-line, so the two exits mirror about it
// Widths close on the frame with nothing typed twice. Both stations take the category 232 (NET.L-01).
const PAD_L = 28, GAP = 44;
const POD_X = NODE_X + PAD_L, POD_W = 200, POD_H = 124;
const POD_R = POD_X + POD_W;
const BOX_W = 232, BOX_H = 80;   // the catalog actor size
const NAT_X = POD_R + GAP;
const NAT_R = NAT_X + BOX_W;
const RT_X = NAT_R + GAP;                    // the route lookup lands on the canvas centre
const RT_R = RT_X + BOX_W;
const BOX_Y = TRUNK_Y - BOX_H / 2;           // both stations centred on the trunk
const POD_Y = TRUNK_Y - POD_H / 2;
const APP_H = 52;
const POD_INNER = { dx: 20, dy: (POD_H - APP_H) / 2, w: POD_W - 40, h: APP_H, label: 'app', sublabel: 'eth0' };

// The fork: the two legs leave the route box through its TOP and BOTTOM face, a mirrored pair about
// TRUNK_Y, and each turns ONCE and runs level onto the Node border.
const RT_CX = RT_X + BOX_W / 2;              // the centre line both legs leave on
const RT_TOP = BOX_Y;
const RT_BOT = BOX_Y + BOX_H;
const { out: FACE_UP_Y, back: FACE_DN_Y } = laneY(TRUNK_Y, 90);    // on the Node border

// The two next hops, outside the frame in their own column, closing on SCHEME_R.
const NH_W = 232, NH_H = 80;
const NH_X = SCHEME_R - NH_W;                // the column closes on the right content edge
const NH_UP_Y = FACE_UP_Y - NH_H / 2;
const NH_DN_Y = FACE_DN_Y - NH_H / 2;

// Chip strip: three cells spanning SCHEME_L..SCHEME_R with even gaps, each sized for its own
// longest value. `verdict` carries the widest, `no match, default route`.
const CHIP_Y = 556, CHIP_H = 34, CHIP_GAP = 20;
const CHIP_W = [340, 320, 396];
const CHIP_X = CHIP_W.reduce((acc, w, i) => (i ? [...acc, acc[i - 1] + CHIP_W[i - 1] + CHIP_GAP] : [SCHEME_L]), []);

const POD_TO_NAT = [[POD_R, TRUNK_Y], [NAT_X, TRUNK_Y]];
const NAT_TO_RT = [[NAT_R, TRUNK_Y], [RT_X, TRUNK_Y]];
const RT_TO_UP = [[RT_CX, RT_TOP], [RT_CX, FACE_UP_Y], [NODE_R, FACE_UP_Y]];
const RT_TO_DN = [[RT_CX, RT_BOT], [RT_CX, FACE_DN_Y], [NODE_R, FACE_DN_Y]];
const OUT_UP = [[NODE_R, FACE_UP_Y], [NH_X, FACE_UP_Y]];
const OUT_DN = [[NODE_R, FACE_DN_Y], [NH_X, FACE_DN_Y]];

// The list order IS the append order, which is the z-order: the Node frame, the blocks, the wires,
// the chips, then the packet layer on top.
export const SCENE = {
  'aria-label': 'Packet classification on a Node: a Pod sends to one destination and the destination alone decides which machinery takes the packet, because two stations stand between the Pod and the wire in a fixed order, a nat table that owns the Service range 10.96.0.0/16 and rewrites a Service address to a backend Pod address, and a route lookup that sees only what the nat table handed on and sorts it into the Pod range 10.244.0.0/16, routed to the Node owning that slice with no further rewrite, or into no cluster range at all, taken by the default route with the source rewritten to the Node IP',
  parts: [
    P.defs(),
    P.node({ key: 'theNode', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1   ·   192.168.1.20' }),
    // The two stations, in the order the kernel runs them. The nat table is the ONLY thing on this
    // Node that ever sees a Service address, which is why it owns that range and the route lookup
    // never names it.
    P.box({ key: 'nat', x: NAT_X, y: BOX_Y, w: BOX_W, h: BOX_H, label: 'NAT table', sublabel: 'Service range 10.96.0.0/16' }),
    P.box({ key: 'route', x: RT_X, y: BOX_Y, w: BOX_W, h: BOX_H, label: 'Route lookup', sublabel: 'Pod range 10.244.0.0/16' }),
    P.box({ key: 'nhPod', x: NH_X, y: NH_UP_Y, w: NH_W, h: NH_H, label: 'Next hop · Node-2', sublabel: '10.244.2.0/24' }),
    P.box({ key: 'nhDefault', x: NH_X, y: NH_DN_Y, w: NH_W, h: NH_H, label: 'Default route', sublabel: 'via the Node gateway' }),
    P.pod({
      key: 'podGroup', innerKey: 'podApp', x: POD_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Client Pod', sublabel: '10.244.1.5', inner: POD_INNER,
    }),
    P.arrow({ from: POD_TO_NAT[0], to: POD_TO_NAT[1], dashed: true, dim: true }),
    P.arrow({ from: NAT_TO_RT[0], to: NAT_TO_RT[1], dashed: true, dim: true }),
    // Both fork legs are drawn on every step and each carries a ball on some step (NET.A-03): the
    // reader sees the verdict was taken among drawn alternatives.
    P.lane({ points: RT_TO_UP, dashed: true, dim: true }),
    P.lane({ points: RT_TO_DN, dashed: true, dim: true }),
    P.arrow({ from: OUT_UP[0], to: OUT_UP[1], dashed: true, dim: true }),
    P.arrow({ from: OUT_DN[0], to: OUT_DN[1], dashed: true, dim: true }),
    P.chip({ key: 'dstChip', x: CHIP_X[0], y: CHIP_Y, w: CHIP_W[0], h: CHIP_H, name: 'dst', value: 'none' }),
    P.chip({ key: 'srcChip', x: CHIP_X[1], y: CHIP_Y, w: CHIP_W[1], h: CHIP_H, name: 'src', value: '10.244.1.5' }),
    P.chip({ key: 'verdictChip', x: CHIP_X[2], y: CHIP_Y, w: CHIP_W[2], h: CHIP_H, name: 'verdict', value: 'none' }),
    P.packets(),
  ],
  reset: {
    // podApp is the Pod INNER box and is listed by key: clearPodHighlight resets inline strokes only,
    // so a highlight set on it by a reduced replay would otherwise leak into later steps (NET.S-02).
    keys: ['nat', 'route', 'nhPod', 'nhDefault', 'podApp', 'dstChip', 'srcChip', 'verdictChip'],
    pods: ['podGroup'],
  },
};

const POD_IP = '10.244.1.5';
const NODE_IP = '-> 192.168.1.20';
const VIP = '10.96.0.20:80';
const BACKEND = '10.244.2.7:8080';
const OUTSIDE = '1.1.1.1:443';
const V_POD = 'Pod range, routed';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { dstChip: VIP, srcChip: POD_IP, verdictChip: 'none' },
  },
  {
    id: 'stations',
    duration: 2400,
    narration: 'A packet leaves the Pod carrying one destination and naming no machinery. Two stations stand between it and the wire, in a fixed order, and only the second one is a routing decision. The nat table meets it first.',
    chips: { dstChip: VIP, srcChip: POD_IP, verdictChip: 'none' },
    lit: ['dstChip'],
    // The animated path says the Pod SENT by pulsing it, which no lights list can name.
    reducedLit: ['podApp'],
    // Up-arrow: the Pod pulses first, the ball leaves at BEAT.afterPulse and the nat table lights
    // on arrival. The dialled address rides with the ball (NET.T-01).
    flow: [
      F.pulse({ pod: 'podGroup' }),
      F.segment({ from: POD_TO_NAT[0], to: POD_TO_NAT[1], delay: BEAT.afterPulse, name: 'in', tag: { text: `dst ${VIP}` } }),
      F.light({ targets: ['nat'], at: 'in' }),
    ],
  },
  {
    id: 'service',
    duration: 2600,
    narration: 'The destination 10.96.0.20:80 falls inside the Service range, so the nat table rewrites it to a backend Pod address, 10.244.2.7:8080 on Node-2. What leaves this station is no longer addressed to a Service.',
    // The rewrite happens INSIDE the nat box, so the ball EMERGES from its far face already carrying
    // the new address (NET.A-01) and the dst chip is true from entry rather than turned over.
    chips: { dstChip: BACKEND, srcChip: POD_IP, verdictChip: 'Service range, DNAT' },
    lit: ['nat', 'dstChip', 'verdictChip'],
    // nat is the SENDER here, so it is named in lit and its ball waits BEAT.lead (M-18a).
    flow: [
      F.segment({ from: NAT_TO_RT[0], to: NAT_TO_RT[1], delay: BEAT.lead, name: 'on', tag: { text: `dst ${BACKEND}` } }),
      F.light({ targets: ['route'], at: 'on' }),
    ],
  },
  {
    id: 'podcidr',
    duration: 3000,
    narration: 'The route lookup reads the rewritten address, which now sits inside the Pod range, and that range is cut into a slice per Node. So the packet goes to the Node owning 10.244.2.0/24, with no further rewrite.',
    chips: { dstChip: BACKEND, srcChip: POD_IP, verdictChip: V_POD },
    // route is the sender, so it is lit and its ball waits BEAT.lead.
    lit: ['route', 'verdictChip'],
    flow: [
      F.route({ points: RT_TO_UP, delay: BEAT.lead, name: 'fork' }),
      // The dst rides as far as the Node border and stops there: a second copy past it reads as one line
      // with the `next hop` label.
      F.tag({ text: `dst ${BACKEND}`, points: RT_TO_UP, delay: BEAT.lead }),
      F.segment({ from: OUT_UP[0], to: OUT_UP[1], after: 'fork', lights: ['nhPod'], name: 'hop' }),
    ],
  },
  {
    id: 'direct',
    duration: 4700,
    narration: 'A Pod addressing a Pod directly walks the same two stations in the same order. The nat table holds no rule for this address and passes it straight through, and the route lookup returns the very same verdict.',
    // Every value is what the step before left: nothing turns over, and that IS the sentence, so no
    // chip is cued (P-05). The uncued strip is what says the two journeys ended the same way.
    chips: { dstChip: BACKEND, srcChip: POD_IP, verdictChip: V_POD },
    reducedLit: ['podApp'],
    flow: [
      F.pulse({ pod: 'podGroup' }),
      F.segment({ from: POD_TO_NAT[0], to: POD_TO_NAT[1], delay: BEAT.afterPulse, lights: ['nat'], name: 'a', tag: { text: `dst ${BACKEND}` } }),
      F.segment({ from: NAT_TO_RT[0], to: NAT_TO_RT[1], after: 'a', lights: ['route'], name: 'b', tag: { text: `dst ${BACKEND}` } }),
      F.route({ points: RT_TO_UP, after: 'b', name: 'c', tag: { text: `dst ${BACKEND}` } }),
      F.segment({ from: OUT_UP[0], to: OUT_UP[1], after: 'c', lights: ['nhPod'], name: 'd' }),
    ],
  },
  {
    id: 'default',
    duration: 4600,
    narration: '1.1.1.1 falls in no cluster range, so the last resort takes it, the default route off the Node. Cluster traffic is excluded from MASQUERADE by default and this is not cluster traffic, so the source becomes the Node IP.',
    chips: { dstChip: OUTSIDE, srcChip: NODE_IP, verdictChip: 'no match, default route' },
    lit: [],
    reducedLit: ['podApp'],
    // All three chips turn over, each on the arrival that earns it (P-03): dst when the ball reaches the
    // first station, verdict at the route box, source at the frame border.
    rewind: { chips: { dstChip: BACKEND, srcChip: POD_IP, verdictChip: V_POD } },
    flow: [
      F.pulse({ pod: 'podGroup' }),
      F.segment({ from: POD_TO_NAT[0], to: POD_TO_NAT[1], delay: BEAT.afterPulse, lights: ['nat'], name: 'a', tag: { text: `dst ${OUTSIDE}` } }),
      F.set({ at: 'a', chips: { dstChip: OUTSIDE } }),
      F.light({ targets: ['dstChip'], at: 'a' }),
      F.segment({ from: NAT_TO_RT[0], to: NAT_TO_RT[1], after: 'a', lights: ['route'], name: 'b', tag: { text: `dst ${OUTSIDE}` } }),
      F.set({ at: 'b', chips: { verdictChip: 'no match, default route' } }),
      F.light({ targets: ['verdictChip'], at: 'b' }),
      F.route({ points: RT_TO_DN, after: 'b', name: 'c' }),
      F.set({ at: 'c', chips: { srcChip: NODE_IP } }),
      F.light({ targets: ['srcChip'], at: 'c' }),
      F.segment({ from: OUT_DN[0], to: OUT_DN[1], after: 'c', lights: ['nhDefault'], name: 'd', tag: { text: 'src 192.168.1.20' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
