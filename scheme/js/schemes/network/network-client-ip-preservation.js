import { P, F, defineCard, makeRidingLabel, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-client-ip-preservation


// The content band is symmetric about the canvas centre by construction, so the flow row and the
// chip strip both centre on 600 without anything being stretched to make them.
const CONTENT_L = 65, CONTENT_R = 1135;         // midpoint 600, the canvas centre
// Narration panel measured at bottom <= 355 over 1600x1000 / 1280x860 / 1100x800, the deepest
// in networking. FLOW_Y clears it, so a longer narration invalidates the row placement.
const FLOW_Y = 410;                            // Client top lands at 372, clear of the panel

const CLIENT_X = CONTENT_L, CLIENT_W = 230, CLIENT_H = 76;
const CLIENT_Y = FLOW_Y - CLIENT_H / 2;        // 372, below the narration panel
const CLIENT_RIGHT = CLIENT_X + CLIENT_W;      // 295

const PROXY_X = 455, PROXY_W = 230, PROXY_H = 124;
const PROXY_TOP = FLOW_Y - PROXY_H / 2;        // 348
const PROXY_RIGHT = PROXY_X + PROXY_W;         // 685
const PROXY_CX = PROXY_X + PROXY_W / 2;        // 570

const POD_W = 210, POD_H = 124;
const POD_X = CONTENT_R - POD_W;               // 925
const POD_TOP = FLOW_Y - POD_H / 2;            // 348, and the Pod right edge is CONTENT_R 1135

const PANEL_W = 260;
const PANEL_X = PROXY_CX - PANEL_W / 2;        // 440, clear of the narration panel edge (397)
const PANEL_BOTTOM = 190;                      // bottom edge of the lower header chip
const CHIP_Y = 552;

// Four chips spanning CONTENT_L..CONTENT_R, so the strip centres on 600 by construction.
const CHIP_GAP = 20, CHIP_H = 34;
const CHIP_WS = [300, 220, 250, 240];          // sums with the gaps to CONTENT_R - CONTENT_L
const CHIP_X = i => CONTENT_L + CHIP_WS.slice(0, i).reduce((a, w) => a + w + CHIP_GAP, 0);

// Each static wire and the ball that rides it share the same endpoints.
const ENTRY = [[CLIENT_RIGHT, FLOW_Y], [PROXY_X, FLOW_Y]];
const DELIVER = [[PROXY_RIGHT, FLOW_Y], [POD_X, FLOW_Y]];

// The tag rides the free band BELOW the row: every hop is shorter than the header it carries, and
// the panel floor at 355 leaves nothing above, so on the lane the proxy face prints through it.
const TAG_DY = PROXY_H / 2 + 20;      // +82: 10 under the row, 57 clear of the chip strip

// Every ball on this card is a linear segmentPacket, so the tag rides LINEAR too: the eased default
// drifts off its ball mid-flight and rejoins at the ends.
const ridingLabel = makeRidingLabel({ role: 'network', hold: 140, easing: 'linear', dy: TAG_DY });
const tag = (p) => F.tag({ fn: ridingLabel, ...p });

const podInner = (w) => ({ dx: 20, dy: 34, w: w - 40, h: 52, label: 'app', sublabel: 'eth0' });

// The list order IS the append order, which is the z-order: body blocks, then wires + panel above
// them, then chips, then the packet layer with its riding tags on top.
export const SCENE = {
  'aria-label': 'Preserving the client IP: an edge proxy terminates the client connection and opens a new one to the backend from its own Pod address, so the backend socket no longer carries the client. The edge writes the original address into the X-Forwarded-For and Forwarded headers, which only the trusted edge hop may set, and for raw TCP or TLS passthrough it prepends a PROXY protocol preamble instead',
  parts: [
    P.defs(),
    P.box({ key: 'client', x: CLIENT_X, y: CLIENT_Y, w: CLIENT_W, h: CLIENT_H, label: 'Client', sublabel: '198.51.100.9' }),
    P.pod({
      key: 'proxy', innerKey: 'proxyBox', x: PROXY_X, y: PROXY_TOP, w: PROXY_W, h: PROXY_H,
      label: 'Edge proxy Pod', sublabel: '10.244.0.9', inner: podInner(PROXY_W),
    }),
    P.pod({
      key: 'podW', innerKey: 'podWBox', x: POD_X, y: POD_TOP, w: POD_W, h: POD_H,
      label: 'Pod web', sublabel: '10.244.2.7', inner: podInner(POD_W),
    }),
    P.arrow({ from: ENTRY[0], to: ENTRY[1], dashed: true, dim: true }),
    P.arrow({ from: DELIVER[0], to: DELIVER[1], dashed: true, dim: true }),
    // Ownership marker, NOT a traffic path: those headers are what this Pod writes, so the link
    // carries no arrowhead.
    P.relation({ points: [[PROXY_CX, PROXY_TOP], [PROXY_CX, PANEL_BOTTOM]], dash: '5 5' }),
    P.tag({ x: PROXY_CX, y: 100, text: 'headers written by the edge' }),
    P.chip({ key: 'xffChip', x: PANEL_X, y: 110, w: PANEL_W, h: 36, name: 'X-Forwarded-For', value: 'none' }),
    P.chip({ key: 'fwdChip', x: PANEL_X, y: 154, w: PANEL_W, h: 36, name: 'Forwarded', value: 'none' }),
    P.chip({ key: 'srcChip', x: CHIP_X(0), y: CHIP_Y, w: CHIP_WS[0], h: CHIP_H, name: 'src at backend', value: 'none' }),
    P.chip({ key: 'readsChip', x: CHIP_X(1), y: CHIP_Y, w: CHIP_WS[1], h: CHIP_H, name: 'app reads', value: 'none' }),
    P.chip({ key: 'modeChip', x: CHIP_X(2), y: CHIP_Y, w: CHIP_WS[2], h: CHIP_H, name: 'edge mode', value: 'L7 proxy' }),
    P.chip({ key: 'ipChip', x: CHIP_X(3), y: CHIP_Y, w: CHIP_WS[3], h: CHIP_H, name: 'client IP', value: 'unknown' }),
    P.packets(),
  ],
  reset: {
    keys: ['client', 'xffChip', 'fwdChip', 'srcChip', 'readsChip', 'modeChip', 'ipChip', 'proxyBox', 'podWBox'],
    pods: ['proxy', 'podW'],
  },
};

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { xffChip: 'none', fwdChip: 'none', srcChip: 'none', readsChip: 'none', modeChip: 'L7 proxy', ipChip: 'unknown' },
  },
  {
    id: 'arrive',
    duration: 2400,
    narration: 'The client opens the connection to the edge, an Ingress or Gateway proxy Pod. On this leg the source address is still the real one, 198.51.100.9, so the edge is the last place on the path that sees the client without having to be told.',
    chips: { xffChip: 'none', fwdChip: 'none', srcChip: 'none', readsChip: 'none', modeChip: 'L7 proxy', ipChip: 'seen at the edge' },
    lit: ['client', 'ipChip'],
    // The animated path says the proxy Pod received the request by PULSING it, which no lights list
    // can name.
    reducedLit: ['proxyBox'],
    // Down-arrow: the request arrives at the proxy Pod, which pulses on arrival. The true source
    // rides with the ball, because that is what this leg still carries.
    flow: [
      F.segment({ from: ENTRY[0], to: ENTRY[1], name: 'inb' }),
      tag({ text: 'src 198.51.100.9', points: ENTRY }),
      F.pulse({ pod: 'proxy', at: 'inb' }),
    ],
  },
  {
    id: 'reproxy',
    duration: 2800,
    narration: 'The proxy terminates that connection and opens a brand new one to the backend, out of its own Pod address. The packet the app receives has source 10.244.0.9, the proxy, and nothing in it mentions the client. Read from the socket, the client address is simply lost.',
    chips: { xffChip: 'none', fwdChip: 'none', srcChip: 'proxy 10.244.0.9', readsChip: 'socket', modeChip: 'L7 proxy', ipChip: 'lost' },
    lit: ['srcChip', 'readsChip', 'ipChip'],
    // The animated path says the backend Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['podWBox'],
    // All three read the packet the backend RECEIVES, so the animated path starts on what the
    // arrive step left and writes them together when that packet lands.
    rewind: { chips: { srcChip: 'none', readsChip: 'none', ipChip: 'seen at the edge' } },
    flow: [
      F.pulse({ pod: 'proxy' }),
      F.segment({ from: DELIVER[0], to: DELIVER[1], delay: BEAT.afterPulse, name: 'out' }),
      tag({ text: 'src 10.244.0.9 (proxy)', points: DELIVER, delay: BEAT.afterPulse }),
      F.pulse({ pod: 'podW', at: 'out' }),
      F.set({ at: 'out', chips: { srcChip: 'proxy 10.244.0.9', readsChip: 'socket', ipChip: 'lost' } }),
    ],
  },
  {
    id: 'xff',
    duration: 2800,
    narration: 'So the edge writes the address down instead. Before proxying it adds X-Forwarded-For with the client address, and the standard Forwarded header carries the same value. The socket still says 10.244.0.9, but the application reads the header and logs the real client.',
    chips: { xffChip: '198.51.100.9', fwdChip: 'for=198.51.100.9', srcChip: 'proxy 10.244.0.9', readsChip: 'header', modeChip: 'L7 proxy', ipChip: 'recovered' },
    lit: ['xffChip', 'fwdChip', 'readsChip', 'ipChip'],
    reducedLit: ['podWBox'],
    // Same up-arrow as the previous step, but now the request the proxy sends carries the header, so
    // that is what rides the ball. The backend pulses on arrival.
    flow: [
      F.pulse({ pod: 'proxy' }),
      F.segment({ from: DELIVER[0], to: DELIVER[1], delay: BEAT.afterPulse, name: 'out' }),
      tag({ text: 'X-Forwarded-For: 198.51.100.9', points: DELIVER, delay: BEAT.afterPulse }),
      F.pulse({ pod: 'podW', at: 'out' }),
    ],
  },
  {
    id: 'trust',
    duration: 2600,
    narration: 'A header is only data, and a client can send an X-Forwarded-For of its own to claim any address it likes. That is why the edge overwrites the header rather than appending to whatever arrived, and why an app should believe the value only when it comes from a proxy it trusts. Behind two proxies the header becomes a list, and only the hop written by your own edge can be trusted.',
    // Short by necessity: the chip name is the longest on the card, so a value beyond ~12 characters
    // collides with it. "rewritten" is the whole point anyway: the forged claim did not survive.
    chips: { xffChip: 'rewritten', fwdChip: 'for=198.51.100.9', srcChip: 'proxy 10.244.0.9', readsChip: 'header', modeChip: 'L7 proxy', ipChip: 'trusted hop only' },
    lit: ['client', 'xffChip', 'ipChip'],
    reducedLit: ['proxyBox'],
    // Down-arrow: the client sends its own forged header, and the proxy pulses as it receives it and
    // overwrites the value. The forged claim is what rides the ball, so the spoof is literal traffic.
    flow: [
      F.segment({ from: ENTRY[0], to: ENTRY[1], name: 'inb' }),
      tag({ text: 'X-Forwarded-For: 1.2.3.4', points: ENTRY }),
      F.pulse({ pod: 'proxy', at: 'inb' }),
    ],
  },
  {
    id: 'passthrough',
    duration: 2800,
    narration: 'Not every protocol has a header to write into. With raw TCP, or with TLS passed through untouched, the edge cannot add anything to the payload. The PROXY protocol solves it by prepending a short preamble ahead of the first bytes, carrying the original source and destination, and the backend has to be configured to expect it or it reads that preamble as part of the request. At layer 4 there is one more option: externalTrafficPolicy Local keeps the real source on the packet itself, with no header and no preamble.',
    // A raw TCP stream carries no headers, so the panel goes back to none and stays unlit: this mode
    // recovers the address a different way.
    chips: { xffChip: 'none', fwdChip: 'none', srcChip: 'proxy 10.244.0.9', readsChip: 'preamble', modeChip: 'TCP passthrough', ipChip: 'recovered' },
    lit: ['modeChip', 'readsChip', 'ipChip'],
    reducedLit: ['podWBox'],
    // Up-arrow again: the proxy pulses as it prepends the preamble, then the stream leaves carrying it
    // and the backend pulses on arrival.
    flow: [
      F.pulse({ pod: 'proxy' }),
      F.segment({ from: DELIVER[0], to: DELIVER[1], delay: BEAT.afterPulse, name: 'out' }),
      tag({ text: 'PROXY TCP4 198.51.100.9', points: DELIVER, delay: BEAT.afterPulse }),
      F.pulse({ pod: 'podW', at: 'out' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
