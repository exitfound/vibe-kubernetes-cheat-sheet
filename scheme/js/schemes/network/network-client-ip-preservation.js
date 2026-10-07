import { P, F, defineCard, makeRidingLabel, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS/network-client-ip-preservation.md

// Two connections drawn as two packets, the edge standing OVER both of them. The content band is
// symmetric about the canvas centre, so the edge, both packet frames and the strip centre on 600.
const SCHEME_L = 60, SCHEME_R = 1140;          // midpoint 600, the canvas centre

// The edge is the APEX: it stands above both packets and each leg meets it on a SIDE face, so a
// side block leaves its OWN TOP face, rises to the leg row, and turns 90 degrees into the edge.
const EDGE_W = 232, POD_H = 124;               // NET.L-01 width, a Pod height of this card's own
const EDGE_X = 600 - EDGE_W / 2;
const EDGE_R = EDGE_X + EDGE_W;
// Low enough that the ENTRY tag, riding UNDER its ball, clears the panel floor.
const LANE_Y = 244;
// The edge hangs OFF the row: L-11 wants a lone endpoint on the MIDPOINT of the face it lands on.
const EDGE_Y = LANE_Y - POD_H / 2;
// The side blocks hang under the leg row, no lower: Pod web must clear the caption over the right packet.
const ROW_Y = 286;

// A packet frame holds three rows sized by the widest value either side ever writes,
// `192.0.2.1, 198.51.100.9`. The two frames close on the content edges.
const ROW_W = 290, ROW_H = 34, ROW_GAP = 8, FRAME_PAD = 14;
const FRAME_W = ROW_W + 2 * FRAME_PAD;
const FRAME_H = 3 * ROW_H + 2 * ROW_GAP + 2 * FRAME_PAD;
const FRAME_Y = 444;                           // under the tag band and the captions
const L_FRAME_X = SCHEME_L;
const R_FRAME_X = SCHEME_R - FRAME_W;
const frameCX = (x) => x + FRAME_W / 2;
const rowY = (i) => FRAME_Y + FRAME_PAD + i * (ROW_H + ROW_GAP);
const CAP_Y = FRAME_Y - 14;                    // the caption baseline over each frame

// Each actor centres on its own packet frame, so a column reads as one column.
const ACTOR_W = 232, CLIENT_H = 80;
const CLIENT_CX = frameCX(L_FRAME_X);                      // the leg leaves this top face
const CLIENT_X = CLIENT_CX - ACTOR_W / 2;
const POD_CX = frameCX(R_FRAME_X);                         // the leg drops on this top face
const POD_X = POD_CX - ACTOR_W / 2;

// Chip strip: three cells spanning the content edges, each sized for its own longest value.
const CHIP_Y = FRAME_Y + FRAME_H + 10, CHIP_H = 34, CHIP_GAP = 20;
const CHIP_WS = [340, 360, 340];               // sums with the gaps to SCHEME_R - SCHEME_L
const CHIP_X = i => SCHEME_L + CHIP_WS.slice(0, i).reduce((a, w) => a + w + CHIP_GAP, 0);

// Each static wire and the ball that rides it share the same endpoints, an L mirrored about the centre.
const ENTRY = [[CLIENT_CX, ROW_Y], [CLIENT_CX, LANE_Y], [EDGE_X, LANE_Y]];
const DELIVER = [[EDGE_R, LANE_Y], [POD_CX, LANE_Y], [POD_CX, ROW_Y]];

// A TAGGED leg rides LEG_DUR so its tag is readable (M-12, PACING).
const LEG_DUR = 1200;
// Each tag rides on the side AWAY FROM THE EDGE: centred on a face it prints over the app box inside.
// ENTRY leaves at t=0, where a route ball does not fade in, so its tag shows at once (inMs 0).
const labelIn = makeRidingLabel({ role: 'network', dy: 14, dx: -95, inMs: 0, outMs: 200, hold: 0 });
const labelOut = makeRidingLabel({ role: 'network', dy: -14, dx: 110, inMs: 200, outMs: 200, hold: 0 });
// Both legs glide EASED, so each tag keeps the default easing to stay on its ball (M-30).
const tagIn = (p) => F.tag({ fn: labelIn, ...p });
const tagOut = (p) => F.tag({ fn: labelOut, ...p });

const podInner = { dx: 20, dy: 34, w: ACTOR_W - 40, h: 52, label: 'app', sublabel: 'eth0' };
const row = (key, i, x, name) => P.chip({ key, x: x + FRAME_PAD, y: rowY(i), w: ROW_W, h: ROW_H, name, value: 'none' });

// The list order IS the append order, which is the z-order: body blocks and the two packet frames,
// then the wires and captions above them, then the chips, then the packet layer with its tags on top.
export const SCENE = {
  'aria-label': 'Preserving the client IP: an edge proxy ends the connection the client opened and starts one of its own to the backend, so the two packets carry different source addresses and the backend socket no longer names the client. The edge writes the original address into X-Forwarded-For, which a client can also send, so the row becomes a list a reader must trust from its last entry inwards, and for raw TCP or TLS passthrough the PROXY protocol prepends a preamble instead',
  parts: [
    P.defs(),
    P.box({ key: 'client', x: CLIENT_X, y: ROW_Y, w: ACTOR_W, h: CLIENT_H, label: 'Client', sublabel: '198.51.100.9' }),
    P.pod({
      key: 'proxy', innerKey: 'proxyBox', x: EDGE_X, y: EDGE_Y, w: EDGE_W, h: POD_H,
      label: 'Edge proxy Pod', sublabel: '10.244.0.9', inner: podInner,
    }),
    P.pod({
      key: 'podW', innerKey: 'podWBox', x: POD_X, y: ROW_Y, w: ACTOR_W, h: POD_H,
      label: 'Pod web', sublabel: '10.244.2.7', inner: podInner,
    }),
    // Same three rows on both sides, so a difference reads as a difference. The keys are required by
    // `unit/spec-scene.test.mjs`, whatever `statics.mjs` reports.
    P.box({ key: 'lFrame', x: L_FRAME_X, y: FRAME_Y, w: FRAME_W, h: FRAME_H }),
    P.box({ key: 'rFrame', x: R_FRAME_X, y: FRAME_Y, w: FRAME_W, h: FRAME_H }),
    P.lane({ points: ENTRY, dashed: true, dim: true }),
    P.lane({ points: DELIVER, dashed: true, dim: true }),
    P.tag({ x: frameCX(L_FRAME_X), y: CAP_Y, text: 'connection 1  ·  client to edge' }),
    P.tag({ x: frameCX(R_FRAME_X), y: CAP_Y, text: 'connection 2  ·  edge to backend' }),
    row('lSrc', 0, L_FRAME_X, 'src'),
    row('lXff', 1, L_FRAME_X, 'X-Forwarded-For'),
    row('lPre', 2, L_FRAME_X, 'PROXY preamble'),
    row('rSrc', 0, R_FRAME_X, 'src'),
    row('rXff', 1, R_FRAME_X, 'X-Forwarded-For'),
    row('rPre', 2, R_FRAME_X, 'PROXY preamble'),
    P.chip({ key: 'readsChip', x: CHIP_X(0), y: CHIP_Y, w: CHIP_WS[0], h: CHIP_H, name: 'app reads', value: 'none' }),
    P.chip({ key: 'ipChip', x: CHIP_X(1), y: CHIP_Y, w: CHIP_WS[1], h: CHIP_H, name: 'client IP', value: 'unknown' }),
    P.chip({ key: 'modeChip', x: CHIP_X(2), y: CHIP_Y, w: CHIP_WS[2], h: CHIP_H, name: 'edge mode', value: 'L7 proxy' }),
    P.packets(),
  ],
  reset: {
    keys: ['client', 'lSrc', 'lXff', 'lPre', 'rSrc', 'rXff', 'rPre', 'readsChip', 'ipChip', 'modeChip', 'proxyBox', 'podWBox'],
    pods: ['proxy', 'podW'],
  },
};

// The left packet is what the CLIENT sent and the right what the EDGE sent, so most left rows read
// none: that emptiness is the control the right side is compared against.
const L_QUIET = { lSrc: '198.51.100.9', lXff: 'none', lPre: 'none' };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: {
      lSrc: 'none', lXff: 'none', lPre: 'none', rSrc: 'none', rXff: 'none', rPre: 'none',
      readsChip: 'none', ipChip: 'unknown', modeChip: 'L7 proxy',
    },
  },
  {
    id: 'arrive',
    duration: 2800,
    narration: 'The client opens the connection to the edge, an Ingress or Gateway proxy Pod. Its packets carry the real source address, 198.51.100.9, and they arrive unchanged only because nothing on the way rewrote them. That is the assumption everything below rests on.',
    chips: {
      ...L_QUIET, rSrc: 'none', rXff: 'none', rPre: 'none',
      readsChip: 'none', ipChip: 'seen at the edge', modeChip: 'L7 proxy',
    },
    lit: ['client', 'lSrc', 'ipChip'],
    // The animated path says the proxy received the request by PULSING it, which no lights list
    // can name.
    reducedLit: ['proxyBox'],
    // `client IP` is what the EDGE observes, so it waits for the arrival. `lSrc` does not: the
    // source the client put on its own packet is true the moment it sends (`P-03`).
    rewind: { chips: { ipChip: 'unknown' } },
    // Down-arrow: the request reaches the proxy, which pulses on arrival. The true source rides with
    // the ball, because that is what this leg still carries.
    flow: [
      F.route({ points: ENTRY, dur: LEG_DUR, name: 'inb' }),
      tagIn({ text: 'src 198.51.100.9', points: ENTRY, dur: LEG_DUR }),
      F.pulse({ pod: 'proxy', at: 'inb' }),
      F.set({ at: 'inb', chips: { ipChip: 'seen at the edge' } }),
    ],
  },
  {
    id: 'terminate',
    duration: 3200,
    narration: 'The edge does not forward those packets. It ends that connection and opens a new one of its own to the backend, so what the app receives is sourced from the proxy Pod, 10.244.0.9. Compare the two src rows: read from the socket, the client address is gone.',
    chips: {
      ...L_QUIET, rSrc: '10.244.0.9', rXff: 'none', rPre: 'none',
      readsChip: 'socket', ipChip: 'lost', modeChip: 'L7 proxy',
    },
    lit: ['rSrc', 'readsChip', 'ipChip'],
    reducedLit: ['podWBox'],
    // All three read the packet the BACKEND receives and cannot be true before it lands, so the
    // animated path winds them back to what `arrive` left and turns them over on the arrival.
    rewind: { chips: { rSrc: 'none', readsChip: 'none', ipChip: 'seen at the edge' } },
    flow: [
      F.pulse({ pod: 'proxy' }),
      F.route({ points: DELIVER, delay: BEAT.afterPulse, dur: LEG_DUR, name: 'out' }),
      tagOut({ text: 'src 10.244.0.9 (proxy)', points: DELIVER, delay: BEAT.afterPulse, dur: LEG_DUR }),
      F.pulse({ pod: 'podW', at: 'out' }),
      F.set({ at: 'out', chips: { rSrc: '10.244.0.9', readsChip: 'socket', ipChip: 'lost' } }),
    ],
  },
  {
    id: 'xff',
    duration: 3200,
    narration: 'So the edge writes the address into the request instead. Before proxying it adds X-Forwarded-For carrying the client address, and the RFC 7239 Forwarded header carries the same address as for=198.51.100.9. The socket still reads 10.244.0.9, and the app reads the header.',
    chips: {
      ...L_QUIET, rSrc: '10.244.0.9', rXff: '198.51.100.9', rPre: 'none',
      readsChip: 'header', ipChip: 'recovered', modeChip: 'L7 proxy',
    },
    lit: ['rXff', 'readsChip', 'ipChip'],
    reducedLit: ['podWBox'],
    rewind: { chips: { rXff: 'none', readsChip: 'socket', ipChip: 'lost' } },
    flow: [
      F.pulse({ pod: 'proxy' }),
      F.route({ points: DELIVER, delay: BEAT.afterPulse, dur: LEG_DUR, name: 'out' }),
      tagOut({ text: 'X-Forwarded-For: 198.51.100.9', points: DELIVER, delay: BEAT.afterPulse, dur: LEG_DUR }),
      F.pulse({ pod: 'podW', at: 'out' }),
      F.set({ at: 'out', chips: { rXff: '198.51.100.9', readsChip: 'header', ipChip: 'recovered' } }),
    ],
  },
  {
    id: 'forge',
    duration: 4400,
    narration: 'A header is only data, and the client can send an X-Forwarded-For of its own claiming any address. An edge that keeps what arrived appends what it saw, so the row becomes a list: the forged value first, your own edge last. Trust that list from its last entry inwards.',
    chips: {
      lSrc: '198.51.100.9', lXff: '192.0.2.1', lPre: 'none',
      rSrc: '10.244.0.9', rXff: '192.0.2.1, 198.51.100.9', rPre: 'none',
      readsChip: 'header', ipChip: 'trusted hop only', modeChip: 'L7 proxy',
    },
    lit: ['client', 'lXff', 'rXff', 'ipChip'],
    reducedLit: ['proxyBox', 'podWBox'],
    // The only two-hop step: the forged claim arrives, the edge appends to it, and the list leaves.
    // Each row turns over on the arrival that produces it.
    rewind: { chips: { lXff: 'none', rXff: '198.51.100.9', ipChip: 'recovered' } },
    flow: [
      F.route({ points: ENTRY, dur: LEG_DUR, name: 'inb' }),
      tagIn({ text: 'X-Forwarded-For: 192.0.2.1', points: ENTRY, dur: LEG_DUR }),
      F.pulse({ pod: 'proxy', at: 'inb' }),
      F.set({ at: 'inb', chips: { lXff: '192.0.2.1' } }),
      // The list itself and no header name, or the tag grows into the caption (DO NOT).
      F.route({ points: DELIVER, at: 'inb', plus: BEAT.afterPulse, dur: LEG_DUR, name: 'out' }),
      tagOut({ text: '192.0.2.1, 198.51.100.9', points: DELIVER, at: 'inb', plus: BEAT.afterPulse, dur: LEG_DUR }),
      F.pulse({ pod: 'podW', at: 'out' }),
      F.set({ at: 'out', chips: { rXff: '192.0.2.1, 198.51.100.9', ipChip: 'trusted hop only' } }),
    ],
  },
  {
    id: 'passthrough',
    duration: 3200,
    narration: 'Raw TCP and passed-through TLS have no header to write into. The PROXY protocol prepends a short preamble to the first bytes of the stream, carrying the original source address, and the backend must be configured to expect it or it reads the preamble as request bytes.',
    // A raw stream carries no HTTP header, so the X-Forwarded-For row empties on both sides: this
    // mode HAS none, which is a property of the mode and not an event on this step.
    chips: {
      ...L_QUIET, rSrc: '10.244.0.9', rXff: 'none', rPre: 'TCP4 198.51.100.9',
      readsChip: 'preamble', ipChip: 'recovered', modeChip: 'TCP passthrough',
    },
    lit: ['rPre', 'readsChip', 'modeChip'],
    reducedLit: ['podWBox'],
    // `client IP` rides the same beat as the other two: all three are one reading of the stream the
    // backend receives (`P-04`). It takes no cue, which `R2-STEP` carries as a restoration.
    rewind: { chips: { rPre: 'none', readsChip: 'header', ipChip: 'trusted hop only' } },
    flow: [
      F.pulse({ pod: 'proxy' }),
      F.route({ points: DELIVER, delay: BEAT.afterPulse, dur: LEG_DUR, name: 'out' }),
      tagOut({ text: 'PROXY TCP4 198.51.100.9', points: DELIVER, delay: BEAT.afterPulse, dur: LEG_DUR }),
      F.pulse({ pod: 'podW', at: 'out' }),
      F.set({ at: 'out', chips: { rPre: 'TCP4 198.51.100.9', readsChip: 'preamble', ipChip: 'recovered' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
