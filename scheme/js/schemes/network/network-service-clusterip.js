import { P, F, defineCard, laneY, routeDur, BEAT, OPACITY, makeRidingLabel } from './network-kit.js';

// Design notes for this card: ./CARDS/network-service-clusterip.md

// The three extents the rest of the category copies. Every block on this card is derived from CX,
// SCHEME_L and SCHEME_R, so moving one moves the client, the centre column, the backend column
// and both fan buses together. The chip strip does NOT follow: its four widths are sized to their
// own longest values, so re-run `render/chipfit.test.mjs` after any change here.
const CX = 600;                     // canvas centre: the control column and the chip strip sit on it
const SCHEME_L = 60, SCHEME_R = 1140; // content edges, mirrored about CX

const FLOW_Y = 340;                 // center line: client, dataplane and the two fans are symmetric about it
const LANE_DY = 12;                 // half-gap between the two client <-> dataplane lanes
const { out: FWD_Y, back: RET_Y } = laneY(FLOW_Y, LANE_DY);   // 328 out, 352 back
const CLIENT_X = SCHEME_L, CLIENT_W = 190, CLIENT_H = 120;
const CLIENT_EDGE = CLIENT_X + CLIENT_W;  // 250: right edge of the client Pod shell, where both client lanes meet it
const COL_W = 232;                  // NET.L-01 actor width, shared by the three column boxes
const COL_LEFT = CX - COL_W / 2;    // 484
const COL_RIGHT = CX + COL_W / 2;   // 716
const DP_H = 80;                    // the kubelet block of network-model, on the flow line, carrying the fan pairs
const DP_TOP = FLOW_Y - DP_H / 2;   // 300
const CTL_H = 80;                   // API server and kube-proxy, the two boxes no packet reaches, same 232 x 80
const REL_GAP = 44;                 // kube-proxy to dataplane: a relation, nothing rides it
const WATCH_GAP = 56;               // API server to kube-proxy: the watch lane, on routeDur's 700ms floor
const KP_Y = DP_TOP - REL_GAP - CTL_H;      // 176
const API_Y = KP_Y - WATCH_GAP - CTL_H;     // 40
const POD_W = 210, POD_H = 114;
const POD_LEFT = SCHEME_R - POD_W;  // 930: backend column, flush with the right content edge
const POD_OFFSET = 150;             // each backend centre is this far above/below FLOW_Y (mirror pair)
const { out: PODX_CY, back: PODY_CY } = laneY(FLOW_Y, POD_OFFSET);   // 190 top, 490 bottom
const PODX_Y = PODX_CY - POD_H / 2; // 133
const PODY_Y = PODY_CY - POD_H / 2; // 433
const POD_INNER = { dx: 20, dy: 34, h: 52 };
const FAN_DY = 12;                  // fan attaches +/-FAN_DY from a Pod centre at its left edge
const FAN_OUT_X = COL_RIGHT + 40, FAN_IN_X = COL_RIGHT + 70; // forward (out) and return (in) vertical buses
// Dataplane right-edge attach points, two mirrored pairs about FLOW_Y: the forward legs sit 18 out
// (322 / 358), the return legs 6 out (334 / 346), so podX takes the upper of each pair.
const { out: KPX_FWD_Y, back: KPY_FWD_Y } = laneY(FLOW_Y, 18);
const { out: KPX_RET_Y, back: KPY_RET_Y } = laneY(FLOW_Y, 6);

// Chip strip: four cells spanning SCHEME_L..SCHEME_R with even gaps, so it centres on CX. Widths are
// not equal: each is sized for its own longest value (DNAT carries the widest).
const CHIP_Y = 576, CHIP_H = 34, CHIP_GAP = 20;
const CHIP_W = [270, 310, 225, 215];
const CHIP_X = CHIP_W.reduce((acc, w, i) => (i ? [...acc, acc[i - 1] + CHIP_W[i - 1] + CHIP_GAP] : [SCHEME_L]), []);

const LANE_FWD = [[CLIENT_EDGE, FWD_Y], [COL_LEFT, FWD_Y]];
const LANE_RET = [[COL_LEFT, RET_Y], [CLIENT_EDGE, RET_Y]];
const FAN_FWD_X = [[COL_RIGHT, KPX_FWD_Y], [FAN_OUT_X, KPX_FWD_Y], [FAN_OUT_X, PODX_CY - FAN_DY], [POD_LEFT, PODX_CY - FAN_DY]];
const FAN_RET_X = [[POD_LEFT, PODX_CY + FAN_DY], [FAN_IN_X, PODX_CY + FAN_DY], [FAN_IN_X, KPX_RET_Y], [COL_RIGHT, KPX_RET_Y]];
const FAN_FWD_Y = [[COL_RIGHT, KPY_FWD_Y], [FAN_OUT_X, KPY_FWD_Y], [FAN_OUT_X, PODY_CY + FAN_DY], [POD_LEFT, PODY_CY + FAN_DY]];
const FAN_RET_Y = [[POD_LEFT, PODY_CY - FAN_DY], [FAN_IN_X, PODY_CY - FAN_DY], [FAN_IN_X, KPY_RET_Y], [COL_RIGHT, KPY_RET_Y]];
const WATCH = [[CX, API_Y + CTL_H], [CX, KP_Y]];

// The 10% glide on the traffic balls. `render/motion.test.mjs` allows it because the card is named in
// its `PACING` map, a ceiling of 8, so the watch ball rides plain routeDur and stays off that count.
const SLOWMO = 1.1;
const slowDur = (points) => Math.round(routeDur(points) * SLOWMO);

// Every tag fades in with its ball, so each stands where no block is when the ball leaves. Tag ink
// spans baseline-10..baseline+2, and each dy below parks that ink 4 clear of the nearest block face.
const tag = makeRidingLabel({ role: 'network', outMs: 170, hold: 0, emergeMode: true });
const WATCH_TAG = { dx: 174, dy: -4 };          // left end 8 right of the column face at 716
const TAG_OUT = { dy: FLOW_Y - CLIENT_H / 2 - FWD_Y - 6 };      // -54: above the client Pod top
const TAG_BACK = { dy: FLOW_Y + CLIENT_H / 2 - RET_Y + 14 };    // 62: below the client Pod bottom
const TAG_FAN = { dx: 92, dy: PODX_Y - PODX_CY + FAN_DY - 6 };  // -51: right of both buses, above podX
const TAG_FAN_Y = { dx: 92, dy: -TAG_FAN.dy + 8 };              // 59: the podY mirror, below it
const TAG_FAN_BACK = { dx: 48, dy: 59 }, TAG_FAN_BACK_Y = { dx: 48, dy: -51 };   // below podX, above podY

const backend = (key, y, ip) => P.pod({
  key, innerKey: `${key}Box`, x: POD_LEFT, y, w: POD_W, h: POD_H, label: 'Pod web', sublabel: ip,
  inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: POD_W - POD_INNER.dx * 2, h: POD_INNER.h, label: 'app', sublabel: 'eth0' },
});

// The list order IS the append order, which is the z-order: boxes and Pods, then the wires ABOVE
// them, then the chips, then the packet layer carrying the ball and its riding tag on top.
export const SCENE = {
  'aria-label': 'ClusterIP via kube-proxy: kube-proxy watches the Service and its EndpointSlices on the API server and writes rules into the Node dataplane but never forwards a packet, the client sends to a virtual ClusterIP that no Pod or single host owns, the dataplane DNATs the packet to one of two symmetric backing Pods, conntrack rewrites the reply so the client never sees the Pod address, and a second connection may land on the other Pod and is pinned there',
  parts: [
    P.defs(),
    P.box({ key: 'api', x: COL_LEFT, y: API_Y, w: COL_W, h: CTL_H, label: 'API server', sublabel: 'Service web · EndpointSlice' }),
    P.box({ key: 'kproxy', x: COL_LEFT, y: KP_Y, w: COL_W, h: CTL_H, label: 'kube-proxy', sublabel: 'watches · writes rules' }),
    P.box({ key: 'dp', x: COL_LEFT, y: DP_TOP, w: COL_W, h: DP_H, label: 'Node dataplane', sublabel: 'Service rules · conntrack' }),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: CLIENT_X, y: FLOW_Y - CLIENT_H / 2, w: CLIENT_W, h: CLIENT_H,
      label: 'Client Pod', sublabel: '10.244.1.5',
      inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: CLIENT_W - POD_INNER.dx * 2, h: POD_INNER.h, label: 'app', sublabel: 'eth0' },
    }),
    backend('podX', PODX_Y, '10.244.2.7:8080'),
    backend('podY', PODY_Y, '10.244.3.9:8080'),
    P.arrow({ x1: CLIENT_EDGE, y1: FWD_Y, x2: COL_LEFT, y2: FWD_Y, dashed: true, dim: true }),
    P.arrow({ x1: COL_LEFT, y1: RET_Y, x2: CLIENT_EDGE, y2: RET_Y, dashed: true, dim: true }),
    P.lane({ points: WATCH, dashed: true, dim: true }),
    // kube-proxy WRITES the rules the dataplane runs and never forwards a packet, so this link
    // carries no arrowhead and no ball ever rides it.
    P.relation({ points: [[CX, KP_Y + CTL_H], [CX, DP_TOP]], dash: '5 5' }),
    P.lane({ points: FAN_FWD_X, dashed: true, dim: true }),
    P.lane({ points: FAN_RET_X, dashed: true, dim: true }),
    P.lane({ points: FAN_FWD_Y, dashed: true, dim: true }),
    P.lane({ points: FAN_RET_Y, dashed: true, dim: true }),
    // Named clusterIP, not dst: it holds the spec.clusterIP field, one address true on every step,
    // while the port the client dials rides the `dst` tag on the ball.
    P.chip({ key: 'vipChip', x: CHIP_X[0], y: CHIP_Y, w: CHIP_W[0], h: CHIP_H, name: 'clusterIP', value: '10.96.0.20' }),
    P.chip({ key: 'dnatChip', x: CHIP_X[1], y: CHIP_Y, w: CHIP_W[1], h: CHIP_H, name: 'DNAT', value: 'none' }),
    P.chip({ key: 'ctChip', x: CHIP_X[2], y: CHIP_Y, w: CHIP_W[2], h: CHIP_H, name: 'conntrack', value: 'none' }),
    P.chip({ key: 'backChip', x: CHIP_X[3], y: CHIP_Y, w: CHIP_W[3], h: CHIP_H, name: 'backend', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: ['api', 'kproxy', 'dp', 'vipChip', 'dnatChip', 'ctChip', 'backChip', 'clientBox', 'podXBox', 'podYBox'],
    pods: ['client', 'podX', 'podY'],
  },
};

// Which backend this flow is NOT serving, as FIELDS: both Pods are stated on every step, so a dim
// set by an earlier flow cannot survive into the next one (NET.S-02 for the boxes, this for the shells).
const serving = (lit) => ({ opacity: { podX: lit === 'podX' ? 1 : OPACITY.notready, podY: lit === 'podY' ? 1 : OPACITY.notready } });
const BOTH_UP = { opacity: { podX: 1, podY: 1 } };
const VIP = '10.96.0.20';
const RULES = '-> .2.7 / .3.9';

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
    narration: 'The ClusterIP is a field of the Service web, stored in the API server. No Pod holds 10.96.0.20 and no single host answers for it, and in the default iptables mode no interface carries it at all.',
    chips: { dnatChip: 'none', ctChip: 'none', backChip: 'none', vipChip: VIP },
    ...BOTH_UP,
    // Infrastructure block: it lights via .highlight, it never blinks. Only Pods pulse.
    lit: ['api', 'vipChip'],
  },
  {
    id: 'program',
    duration: 2700,
    narration: 'The kube-proxy on the Node watches the Service and its EndpointSlices, then writes Service rules into the Node dataplane: a packet to 10.96.0.20:80 is DNAT-ed to one of the two Pod IPs. It writes rules and never forwards a packet itself.',
    chips: { dnatChip: RULES, ctChip: 'none', backChip: 'none', vipChip: VIP },
    ...BOTH_UP,
    lit: ['api'],
    rewind: { chips: { dnatChip: 'none' } },
    // The API server acts first, so it is lit and its ball leaves at BEAT.lead. The write has no
    // ball: the dataplane and the DNAT chip light together one beat after kube-proxy receives.
    flow: [
      F.segment({ from: WATCH[0], to: WATCH[1], delay: BEAT.lead, name: 'watch' }),
      F.tag({ fn: tag, text: 'Service + slices', points: WATCH, delay: BEAT.lead, easing: 'linear', ...WATCH_TAG }),
      F.light({ targets: ['kproxy'], at: 'watch' }),
      F.set({ after: 'watch', chips: { dnatChip: RULES } }),
      F.light({ targets: ['dp', 'dnatChip'], after: 'watch' }),
    ],
  },
  {
    id: 'send',
    duration: 2300,
    narration: 'The client opens a connection to 10.96.0.20:80. The packet never passes through kube-proxy: the Service rules in the Node dataplane match that address the moment the packet crosses from the client Pod into the Node.',
    chips: { dnatChip: RULES, ctChip: 'none', backChip: 'none', vipChip: VIP },
    ...BOTH_UP,
    lit: ['vipChip'],
    // The animated path says the client SENT by pulsing it, which no lights list can name.
    reducedLit: ['clientBox'],
    // Up-arrow: the client pulses first, the packet leaves at BEAT.afterPulse along the forward lane
    // and is caught at the dataplane, which lights on arrival. The ClusterIP dst rides with the ball.
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: LANE_FWD[0], to: LANE_FWD[1], delay: BEAT.afterPulse, dur: slowDur(LANE_FWD), name: 'send' }),
      F.tag({ fn: tag, text: 'dst 10.96.0.20:80', points: LANE_FWD, delay: BEAT.afterPulse, dur: slowDur(LANE_FWD), easing: 'linear', ...TAG_OUT }),
      F.light({ targets: ['dp'], at: 'send' }),
    ],
  },
  {
    id: 'dnat',
    duration: 3300,
    narration: 'The kernel picks one backend as the Service rules direct and rewrites the destination to it, here 10.244.2.7:8080. Connection tracking records the mapping so every later packet of the flow takes the same backend, and the packet reaches the chosen Pod.',
    chips: { dnatChip: '-> 10.244.2.7:8080', ctChip: 'flow pinned', backChip: '10.244.2.7', vipChip: VIP },
    ...serving('podX'),
    lit: ['dp', 'dnatChip', 'ctChip', 'backChip'],
    reducedLit: ['podXBox'],
    // Down-arrow on a rewrite: the packet EMERGES from the dataplane, because the DNAT happened inside
    // the box one BEAT.lead after it lights (M-18), and rides the forward fan to the Pod, which pulses.
    flow: [
      F.route({ points: FAN_FWD_X, delay: BEAT.lead, dur: slowDur(FAN_FWD_X), name: 'give' }),
      F.tag({ fn: tag, text: 'dst 10.244.2.7:8080', points: FAN_FWD_X, delay: BEAT.lead, dur: slowDur(FAN_FWD_X), ...TAG_FAN }),
      F.pulse({ pod: 'podX', at: 'give' }),
    ],
  },
  {
    id: 'reply',
    // Two-hop round trip at SLOWMO: the motion runs 3430ms, so this floor gives a 370ms settle after
    // the reply lands, matching the dwell of the single-hop steps instead of snapping straight on.
    duration: 3800,
    narration: 'The Pod replies from its own IP, and conntrack in the same Node dataplane reverses the translation so the source reads 10.96.0.20 again. The client only ever sees the ClusterIP it dialed, never the Pod address that served it.',
    chips: { dnatChip: '-> 10.244.2.7:8080', ctChip: 'reverse NAT', backChip: '10.244.2.7', vipChip: VIP },
    ...serving('podX'),
    reducedLit: ['clientBox'],
    // conntrack reverses the NAT when the reply reaches the dataplane, so the chip turns over there.
    rewind: { chips: { ctChip: 'flow pinned' } },
    flow: [
      F.pulse({ pod: 'podX' }),
      F.route({ points: FAN_RET_X, delay: BEAT.afterPulse, dur: slowDur(FAN_RET_X), name: 'h1' }),
      F.tag({ fn: tag, text: 'src 10.244.2.7', points: FAN_RET_X, delay: BEAT.afterPulse, dur: slowDur(FAN_RET_X), ...TAG_FAN_BACK }),
      F.set({ at: 'h1', chips: { ctChip: 'reverse NAT' } }),
      F.light({ targets: ['dp', 'ctChip'], at: 'h1' }),
      F.segment({ from: LANE_RET[0], to: LANE_RET[1], after: 'h1', dur: slowDur(LANE_RET), name: 'h2' }),
      F.tag({ fn: tag, text: 'src 10.96.0.20', points: LANE_RET, after: 'h1', dur: slowDur(LANE_RET), easing: 'linear', ...TAG_BACK }),
      F.pulse({ pod: 'client', at: 'h2' }),
    ],
  },
  {
    id: 'balance',
    // Same two-hop round trip as reply (3460ms of motion): match the settle so it is not rushed.
    duration: 3800,
    narration: 'A second connection to the ClusterIP is a new flow, and with no session affinity the kernel may pick the other backend. It DNATs this one to 10.244.3.9 and conntrack pins it there, while the first flow stays on 10.244.2.7. Each connection keeps its own Pod.',
    chips: { dnatChip: '-> 10.244.3.9:8080', ctChip: 'two flows', backChip: '10.244.3.9', vipChip: VIP },
    ...serving('podY'),
    reducedLit: ['podYBox'],
    // The pick, the second conntrack entry and the backend it names are one decision the rules make
    // when the client packet reaches the dataplane, so all three carry the reply values until then.
    rewind: { chips: { dnatChip: '-> 10.244.2.7:8080', ctChip: 'reverse NAT', backChip: '10.244.2.7' } },
    // This step is the send and the DNAT in one, so the dataplane lights on the client packet
    // arriving, exactly as it does on the send step, and only then picks the second backend.
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: LANE_FWD[0], to: LANE_FWD[1], delay: BEAT.afterPulse, dur: slowDur(LANE_FWD), name: 'send' }),
      F.tag({ fn: tag, text: 'dst 10.96.0.20:80', points: LANE_FWD, delay: BEAT.afterPulse, dur: slowDur(LANE_FWD), easing: 'linear', ...TAG_OUT }),
      F.set({ at: 'send', chips: { dnatChip: '-> 10.244.3.9:8080', ctChip: 'two flows', backChip: '10.244.3.9' } }),
      F.light({ targets: ['dp', 'dnatChip', 'ctChip', 'backChip'], at: 'send' }),
      F.route({ points: FAN_FWD_Y, after: 'send', dur: slowDur(FAN_FWD_Y), name: 'give' }),
      F.tag({ fn: tag, text: 'dst 10.244.3.9:8080', points: FAN_FWD_Y, after: 'send', dur: slowDur(FAN_FWD_Y), ...TAG_FAN_Y }),
      F.pulse({ pod: 'podY', at: 'give' }),
    ],
  },
  {
    id: 'balance-reply',
    // Same two-hop round trip (3430ms of motion): match the settle so the final step does not snap.
    duration: 3800,
    narration: 'The second Pod replies from 10.244.3.9, and conntrack reverses this flow the same way, rewriting the source back to 10.96.0.20 before the reply reaches the client. Two Pods served two connections, and the client only ever saw one ClusterIP.',
    chips: { dnatChip: '-> 10.244.3.9:8080', ctChip: 'reverse NAT', backChip: '10.244.3.9', vipChip: VIP },
    ...serving('podY'),
    reducedLit: ['clientBox'],
    rewind: { chips: { ctChip: 'two flows' } },
    flow: [
      F.pulse({ pod: 'podY' }),
      F.route({ points: FAN_RET_Y, delay: BEAT.afterPulse, dur: slowDur(FAN_RET_Y), name: 'h1' }),
      F.tag({ fn: tag, text: 'src 10.244.3.9', points: FAN_RET_Y, delay: BEAT.afterPulse, dur: slowDur(FAN_RET_Y), ...TAG_FAN_BACK_Y }),
      F.set({ at: 'h1', chips: { ctChip: 'reverse NAT' } }),
      F.light({ targets: ['dp', 'ctChip'], at: 'h1' }),
      F.segment({ from: LANE_RET[0], to: LANE_RET[1], after: 'h1', dur: slowDur(LANE_RET), name: 'h2' }),
      F.tag({ fn: tag, text: 'src 10.96.0.20', points: LANE_RET, after: 'h1', dur: slowDur(LANE_RET), easing: 'linear', ...TAG_BACK }),
      F.pulse({ pod: 'client', at: 'h2' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
