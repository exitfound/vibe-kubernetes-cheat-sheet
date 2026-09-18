import { P, F, defineCard, laneY, strip, shade, BEAT, OPACITY, REVEAL_MS } from './network-kit.js';

// Design notes for this card: ./CARDS/network-mtu-overhead.md

// A BUDGET IN BYTES, drawn to scale. U is the only scale on the card and every width in the three
// measure rows is a product of it, so the drawing and the arithmetic cannot disagree. 0.72 is what
// puts 1500 bytes exactly across the content width, which is also the chip strip span (L-13).
const U = 0.72;                                  // viewBox units per byte
const bw = (bytes) => bytes * U;
const CONTENT_L = 60, CONTENT_R = CONTENT_L + bw(1500);   // 60 / 1140

// The three measure rows, each read from CONTENT_L on the WIRE. Row 1 is the local link, row 2 is
// what a wrapped frame is made of, row 3 is what the step actually puts on that link.
const TRACK_H = 38;
// 238 is measured against this card's own panel, which reads 244.54 at 1100x800 on `clamp`
// (`OVERLAY_IDS=network-mtu-overhead node --test report/overlay.test.mjs`). The rows open at x=60,
// left of the x=420 L-03 guards, so that one reading covers the top 6.54 units of row 1's left end.
const LINK_Y = 238;                              // 238..276
const FRAME_Y = 284;                             // 284..322
const HDR_R = CONTENT_L + bw(50);                // 96: the VXLAN over IPv4 outer header
const PATH_X = CONTENT_L + bw(1400);             // 1068: what the tunnel leg carries
// The baseline, not the ink: the string inks about 11 units above it and 3.7 below, so 386 clears
// row 2's floor at 322 by 2.8 at worst and leaves 8.3 over row 3, reading as row 2's own label.
const CAP_Y = 336;
const SENT_Y = 348, SENT_H = 18;                 // 348..366
const GAP_Y = 230;                               // the path-limit label, above row 1

// The Node, the two boxes inside it and the two ends of the path. The NIC keeps the same 18 the Pod
// has, so the frame wall is the Node BORDER and not a box face: every ball departs from it and
// lands on it, and NET.A-02 holds with no wire crossing an edge.
const NODE_X = CONTENT_L, NODE_Y = 382, NODE_W = 478, NODE_H = 148;   // 60..538, 382..530
// 110 rather than a shorter Pod because `pod()` prints the sublabel at h - 8: at 90 that baseline
// lands on the inner box floor and the address is struck through. 110 leaves the address 16 units
// under the inner box and 8 above the shell.
const POD_W = 200, POD_H = 110, POD_Y = 410;     // 410..520
const PODA_X = NODE_X + 18;                      // 78..278, 18 in from the frame wall
const IN_GAP = 42;                               // Pod A to the NIC, the one gap inside the frame
const NIC_W = 200, NIC_X = PODA_X + POD_W + IN_GAP;   // 320..520, 18 in from the border
const NODE_R = NODE_X + NODE_W;                  // 538: 18 + 200 + 42 + 200 + 18
const BOX_H = 62, BOX_Y = 434;                   // 434..496, centred on FLOW_Y
const HOP_W = 200;
const PODB_X = CONTENT_R - POD_W;                // 940..1140
// Derived rather than typed so the two legs cannot drift apart: the hop stands midway between the
// Node border and Pod B, which leaves 101 units each side.
const HOP_X = NODE_R + (PODB_X - NODE_R - HOP_W) / 2, HOP_R = HOP_X + HOP_W;   // 639..839
const POD_INNER = { dx: 20, dy: 30, w: POD_W - 40, h: 56, label: 'app', sublabel: 'eth0' };

const FLOW_Y = 465;                              // the Pod centres and the two box centres
const LANE_DY = 12;
const { out: FWD_Y, back: RET_Y } = laneY(FLOW_Y, LANE_DY);   // 453 out, 477 back
const OUT_A = [[NODE_R, FWD_Y], [HOP_X, FWD_Y]];
const OUT_B = [[HOP_R, FWD_Y], [PODB_X, FWD_Y]];
const BACK_B = [[PODB_X, RET_Y], [HOP_R, RET_Y]];
const BACK_A = [[HOP_X, RET_Y], [NODE_R, RET_Y]];
// Pod A and the NIC are joined and nothing ever travels between them: the veth hop belongs to
// `network-pod-ip-and-veth`, so this is recession at 0.45 rather than a route (NET.A-04).
const VETH = [[PODA_X + POD_W, FLOW_Y], [NIC_X, FLOW_Y]];   // 278..320

// Four equal chips spanning the same outer verticals as the three measure rows, so the strip and
// the picture share both edges. 1080 less three 20s over 4.
const CHIP_Y = 547, CHIP_H = 34;
const CHIPS = strip({ from: CONTENT_L, to: CONTENT_R, count: 4, gap: 20 });   // w 255

// A piece laid OVER another row carries strokes only, so the fill underneath is never doubled.
const clearFill = (el) => { const r = el.querySelector('.scheme-box-rect'); if (r) r.style.fill = 'transparent'; };

// One bar on the sent row, hidden until its step reveals it. Every width is bw() of the number the
// step states, so a bar cannot claim a size the narration does not.
const sent = (key, bytes) => P.box({ key, x: CONTENT_L, y: SENT_Y, w: bw(bytes), h: SENT_H, rx: 3, opacity: 0 });

// The list order IS the append order, which is the z-order: the measure rows, then the Node frame,
// then the blocks inside and beside it, then the wires and their labels, then the chips, then the
// packet layer carrying the ball on top.
export const SCENE = {
  'aria-label': 'MTU overhead and path MTU blackholes: a VXLAN outer header spends 50 of the 1500 bytes a link carries so the CNI sets the Pod interface to 1450, and when one tunnel hop further along the path carries only 1400 that frame is refused for being 100 bytes too big, the ICMP that reports it is filtered, and small packets keep crossing while large ones disappear',
  parts: [
    P.defs(),
    P.box({ key: 'trackLink', x: CONTENT_L, y: LINK_Y, w: bw(1500), h: TRACK_H, label: 'Local link 1500 B' }),
    P.box({ key: 'trackHdr', x: CONTENT_L, y: FRAME_Y, w: bw(50), h: TRACK_H, opacity: 0 }),
    P.box({ key: 'trackInner', x: HDR_R, y: FRAME_Y, w: bw(1450), h: TRACK_H, opacity: 0, label: 'Inner frame 1450 B' }),
    sent('sentPing', 134),
    sent('sentFull', 1500),
    sent('sentClamp', 1400),
    // The last 100 bytes of the link, which the tunnel leg does not carry. It is laid OVER all three
    // rows rather than given a row of its own, because it is a ceiling and not a quantity: whatever
    // ends to the right of its left edge is what the hop refuses, on whichever row it was drawn.
    // It therefore comes AFTER all three rows in this list: painted before them, the soft fill of
    // `trackInner` and of a sent bar washes its two verticals out exactly where they cross a row,
    // which reads as a stripe lit at two different strengths on one line.
    P.box({ key: 'pathGap', x: PATH_X, y: LINK_Y, w: CONTENT_R - PATH_X, h: SENT_Y + SENT_H - LINK_Y, rx: 0, opacity: 0, tune: clearFill }),
    P.node({ key: 'node1', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.pod({
      key: 'podA', innerKey: 'podABox', x: PODA_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Pod A', sublabel: '10.244.1.5', inner: POD_INNER,
    }),
    // The NIC is infrastructure: it lights and never pulses (NET.S-01). Its mtu is the number the
    // card spends five steps saying is not the one that matters.
    P.box({ key: 'nic', x: NIC_X, y: BOX_Y, w: NIC_W, h: BOX_H, label: 'Node NIC', sublabel: 'mtu 1500' }),
    P.box({ key: 'hop', x: HOP_X, y: BOX_Y, w: HOP_W, h: BOX_H, label: 'Underlay hop', sublabel: 'VPN leg to Node-2' }),
    P.pod({
      key: 'podB', innerKey: 'podBBox', x: PODB_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Pod B', sublabel: '10.244.2.7', inner: POD_INNER,
    }),
    P.relation({ points: VETH, dash: '5 5' }),
    P.arrow({ from: OUT_A[0], to: OUT_A[1], dashed: true, dim: true }),
    P.arrow({ from: OUT_B[0], to: OUT_B[1], dashed: true, dim: true }),
    P.arrow({ from: BACK_B[0], to: BACK_B[1], dashed: true, dim: true }),
    P.arrow({ from: BACK_A[0], to: BACK_A[1], dashed: true, dim: true }),
    P.wire({ key: 'gap', x: CONTENT_R, y: GAP_Y, anchor: 'end' }),
    P.wire({ key: 'hdr', x: CONTENT_L, y: CAP_Y, anchor: 'start' }),
    P.wire({ key: 'lane', x: HOP_X + HOP_W / 2, y: BOX_Y - 18 }),
    P.chip({ key: 'ethChip', x: CHIPS.x(0), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'pod eth0', value: '1500 · default' }),
    P.chip({ key: 'wireChip', x: CHIPS.x(1), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'on the wire', value: 'none' }),
    P.chip({ key: 'icmpChip', x: CHIPS.x(2), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'ICMP 3/4', value: 'none' }),
    P.chip({ key: 'pmtuChip', x: CHIPS.x(3), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'node pmtu', value: '1500' }),
    P.packets(),
  ],
  // The two inner Pod boxes go in the KEY list and not the pod list: a pod group only has its
  // inline pulse strokes reset, so a .highlight on a container would never come off (NET.S-02).
  reset: {
    keys: [
      'trackLink', 'trackHdr', 'trackInner', 'pathGap', 'sentPing', 'sentFull', 'sentClamp',
      'nic', 'hop', 'podABox', 'podBBox', 'ethChip', 'wireChip', 'icmpChip', 'pmtuChip',
    ],
    pods: ['podA', 'podB'],
  },
};

// One list for every hidden measure piece, so a step cannot pin five of six and drift on the sixth.
const BARS = ['trackHdr', 'trackInner', 'pathGap', 'sentPing', 'sentFull', 'sentClamp'];
const NONE = shade(BARS, 0);
const CARVED = { ...NONE, trackHdr: 1, trackInner: 1 };
const PINGED = { ...CARVED, sentPing: 1 };
const OVER = { ...CARVED, pathGap: 1, sentFull: 1 };
const CLAMPED = { ...CARVED, pathGap: 1, sentClamp: 1 };

// Pod B is stated on EVERY step, so a dim set by a frame that never arrived cannot survive into the
// next one. It is dim exactly on the two steps where nothing reaches it.
const REACHED = { podB: 1 };
const UNREACHED = { podB: OPACITY.notready };

const ETH_SET = '1450 · set by CNI';
const HDR_CAP = '50 B outer header';
const PATH_CAP = 'this hop carries 1400 B';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { ethChip: '1500 · default', wireChip: 'none', icmpChip: 'none', pmtuChip: '1500' },
    opacity: { ...NONE, ...REACHED },
  },
  {
    id: 'budget',
    duration: 2600,
    narration: 'A link carries 1500 bytes in a frame and the overlay wrap is paid out of that number rather than added to it. A VXLAN header over IPv4 spends 50 of them, so 1450 are left for the frame a Pod puts inside. An IPIP wrap costs 20 and leaves 1480.',
    chips: { ethChip: '1500 · default', wireChip: 'none', icmpChip: 'none', pmtuChip: '1500' },
    wires: { hdr: HDR_CAP },
    opacity: { ...CARVED, ...REACHED },
    lit: ['trackHdr', 'trackInner'],
    // The caption is the static end state, so `rewind` holds it blank while the row it names is
    // still fading in and an F.set writes it once the header is fully there. Written statically
    // alone it stands over an empty band for the length of the reveal.
    rewind: { wires: { hdr: '' } },
    // The carve is the whole beat: the header first, then what is left, one landing apart.
    flow: [
      F.reveal({ target: 'trackHdr' }),
      F.set({ delay: REVEAL_MS, wires: { hdr: HDR_CAP } }),
      F.reveal({ target: 'trackInner', delay: REVEAL_MS }),
    ],
  },
  {
    id: 'interface',
    duration: 2900,
    narration: 'That 1450 has to be written onto the interface that builds the frame. The CNI plugin sets the Pod eth0 MTU from its own config when it creates the interface, while the Node NIC keeps the full 1500. The cost lands one layer in, on the Pod, and the NIC number an operator reads does not show it.',
    chips: { ethChip: ETH_SET, wireChip: 'none', icmpChip: 'none', pmtuChip: '1500' },
    wires: { hdr: HDR_CAP },
    opacity: { ...CARVED, ...REACHED },
    lit: ['nic', 'ethChip'],
    // The Pod is the one that receives the number, and a pulse is the only thing that says so.
    reducedLit: ['podABox'],
    flow: [F.pulse({ pod: 'podA', delay: BEAT.lead })],
  },
  {
    id: 'small',
    duration: 4900,
    narration: 'A ping is a tiny frame. The default 56 byte payload with its ICMP and IPv4 headers is an 84 byte datagram, and 134 on the wire once wrapped, nowhere near the limit. It crosses the underlay to Pod B and the echo comes home, which is why a cluster with an MTU problem still answers its health checks.',
    chips: { ethChip: ETH_SET, wireChip: '134 B', icmpChip: 'none', pmtuChip: '1500' },
    wires: { hdr: HDR_CAP, lane: 'echo and reply' },
    opacity: { ...PINGED, ...REACHED },
    lit: ['nic', 'sentPing', 'wireChip'],
    // The animated path says Pod A sent and Pod B answered by PULSING them, which no lights list
    // can name.
    reducedLit: ['podABox', 'podBBox'],
    // Up-arrow: A pulses first, the frame leaves the Node at the NIC face, which is the Node
    // border, crosses the hop to Pod B, and the reply comes home on its own lane (A-03).
    flow: [
      F.pulse({ pod: 'podA' }),
      F.reveal({ target: 'sentPing', delay: BEAT.afterPulse }),
      F.segment({ from: OUT_A[0], to: OUT_A[1], delay: BEAT.afterPulse, name: 'o1', lights: ['hop'] }),
      F.segment({ from: OUT_B[0], to: OUT_B[1], after: 'o1', name: 'o2' }),
      F.pulse({ pod: 'podB', at: 'o2' }),
      F.segment({ from: BACK_B[0], to: BACK_B[1], after: 'o2', name: 'b1', lights: ['hop'] }),
      F.segment({ from: BACK_A[0], to: BACK_A[1], after: 'b1', name: 'b2', lights: ['nic'] }),
      F.pulse({ pod: 'podA', at: 'b2' }),
    ],
  },
  {
    id: 'path',
    duration: 3900,
    narration: 'The route to Node-2 crosses a VPN leg that carries only 1400 bytes, and nothing on the Node knows it. A full size frame is 1500 on the wire, 100 more than that hop can take, so where the tunnel sets the do not fragment bit the hop drops it and returns ICMP type 3 code 4 to the Node naming 1400.',
    chips: { ethChip: ETH_SET, wireChip: '1500 B · 100 over', icmpChip: 'to Node · 1400', pmtuChip: '1400 · learned' },
    wires: { hdr: HDR_CAP, gap: PATH_CAP, lane: 'refused · ICMP 3/4 back' },
    opacity: { ...OVER, ...UNREACHED },
    lit: ['nic', 'pathGap', 'sentFull', 'wireChip'],
    reducedLit: ['podABox'],
    // The ICMP is addressed to the SOURCE OF THE DATAGRAM the hop refused, and that datagram is the
    // wrapped one, whose source is the Node. So the reply lands on the NIC and Pod A never pulses.
    // `gap` joins the rewind for the reason the carve step states: the caption is the static end
    // state and the band it names is still fading in for REVEAL_MS.
    rewind: { chips: { icmpChip: 'none', pmtuChip: '1500' }, wires: { gap: '' } },
    flow: [
      F.reveal({ target: 'pathGap' }),
      F.set({ delay: REVEAL_MS, wires: { gap: PATH_CAP } }),
      F.pulse({ pod: 'podA', delay: BEAT.lead }),
      F.reveal({ target: 'sentFull', delay: BEAT.lead + BEAT.afterPulse }),
      F.segment({ from: OUT_A[0], to: OUT_A[1], delay: BEAT.lead + BEAT.afterPulse, name: 'o1', lights: ['hop'] }),
      F.segment({ from: BACK_A[0], to: BACK_A[1], after: 'o1', name: 'icmp', lights: ['nic'] }),
      F.set({ at: 'icmp', chips: { icmpChip: 'to Node · 1400', pmtuChip: '1400 · learned' } }),
      F.light({ targets: ['icmpChip', 'pmtuChip'], at: 'icmp' }),
    ],
  },
  {
    id: 'blackhole',
    duration: 3400,
    narration: 'Where a firewall or a cloud security group filters ICMP, that reply never arrives and the Node never lowers anything. It keeps putting 1500 on a path that will not carry it. Pings and some interactive connections still work, while a bulk transfer fails on its first large packet and the connection times out.',
    chips: { ethChip: ETH_SET, wireChip: '1500 B · 100 over', icmpChip: 'filtered', pmtuChip: '1500 · stale' },
    wires: { hdr: HDR_CAP, gap: PATH_CAP, lane: 'nothing comes back' },
    opacity: { ...OVER, ...UNREACHED },
    lit: ['nic', 'pathGap', 'sentFull', 'icmpChip', 'pmtuChip'],
    reducedLit: ['podABox'],
    // Two identical frames on the forward lane and nothing on the return one: the retransmission is
    // the picture of a blackhole, and the empty return lane is the half that makes it one.
    flow: [
      F.pulse({ pod: 'podA' }),
      F.segment({ from: OUT_A[0], to: OUT_A[1], delay: BEAT.afterPulse, name: 'o1', lights: ['hop'] }),
      F.segment({ from: OUT_A[0], to: OUT_A[1], after: 'o1', name: 'o2', lights: ['hop'] }),
    ],
  },
  {
    id: 'clamp',
    duration: 4200,
    narration: 'The fix that does not need ICMP is to clamp the TCP MSS. A rule on the path rewrites the value both ends announce in the handshake down to 1310, which is the 1400 on that hop less the outer header and the IPv4 and TCP headers, so no TCP segment is built too big. It does nothing for UDP or anything else with no MSS.',
    chips: { ethChip: ETH_SET, wireChip: '1400 B · MSS 1310', icmpChip: 'not needed', pmtuChip: '1500 · stale' },
    wires: { hdr: HDR_CAP, gap: PATH_CAP, lane: 'fits the hop' },
    opacity: { ...CLAMPED, ...REACHED },
    lit: ['nic', 'pathGap', 'sentClamp', 'wireChip', 'icmpChip'],
    reducedLit: ['podABox', 'podBBox'],
    // The clamped bar lands exactly on the path limit, which is the arithmetic the step states.
    flow: [
      F.pulse({ pod: 'podA', delay: BEAT.lead }),
      F.reveal({ target: 'sentClamp', delay: BEAT.lead + BEAT.afterPulse }),
      F.segment({ from: OUT_A[0], to: OUT_A[1], delay: BEAT.lead + BEAT.afterPulse, name: 'o1', lights: ['hop'] }),
      F.segment({ from: OUT_B[0], to: OUT_B[1], after: 'o1', name: 'o2' }),
      F.pulse({ pod: 'podB', at: 'o2' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
