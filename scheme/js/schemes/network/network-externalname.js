import { P, F, defineCard, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-externalname


// Panel right <= 397, bottom <= 230, and BOTH rows hang below that bottom: at 254 the top of row A's
// Client Pod goes under the panel on the narrow viewports.
const CLIENT_X = 115, CLIENT_W = 160, CLIENT_H = 108;
const ROW_A = 300;                     // Pod 246..354, clear of the panel
const ROW_B = 480;
// x-coords are centered in the 1200 viewBox: content runs 115..1085 (client left edge to the wide
// external-target right edge), leaving equal 115px side margins.
const A_CLIENT_EDGE = CLIENT_X + CLIENT_W;   // 275
const A_DNS_LEFT = 405, A_DNS_RIGHT = 605, A_HOST_LEFT = 765;
const B_CLIENT_EDGE = A_CLIENT_EDGE;
const B_PROXY_LEFT = 405, B_PROXY_RIGHT = 605, B_EP_LEFT = 765;
const BOX_H = 60;                      // the four infra boxes share one height, centred on their row
const TARGET_W = 320;                  // the two external-target boxes: 765..1085
// Each hop as its own array, feeding both its ball and its ridingLabel tag so the two cannot drift.
// Row A carries three lanes: query, answer, and the connection the CLIENT makes to the external host.
const LANE_DY = 12;                                             // query above the row centre, answer below
const A_CONNECT_Y = 390;                                        // the free band between the rows: 354..426
const A_CLIENT_CX = CLIENT_X + CLIENT_W / 2;                    // 195
const A_CLIENT_BOTTOM = ROW_A + CLIENT_H / 2;                   // 354
const A_HOST_CX = A_HOST_LEFT + TARGET_W / 2;                   // 925
const A_HOST_BOTTOM = ROW_A + BOX_H / 2;                        // 330
const A_HOP1 = [[A_CLIENT_EDGE, ROW_A - LANE_DY], [A_DNS_LEFT, ROW_A - LANE_DY]];  // client -> CoreDNS (query)
const A_HOP2 = [[A_DNS_LEFT, ROW_A + LANE_DY], [A_CLIENT_EDGE, ROW_A + LANE_DY]];  // CoreDNS -> client (CNAME)
const A_HOP3 = [                                                                   // client -> external host
  [A_CLIENT_CX, A_CLIENT_BOTTOM], [A_CLIENT_CX, A_CONNECT_Y],
  [A_HOST_CX, A_CONNECT_Y], [A_HOST_CX, A_HOST_BOTTOM],
];
const B_HOP1 = [[B_CLIENT_EDGE, ROW_B], [B_PROXY_LEFT, ROW_B]]; // client -> kube-proxy (ClusterIP dst)
const B_HOP2 = [[B_PROXY_RIGHT, ROW_B], [B_EP_LEFT, ROW_B]];    // kube-proxy -> EndpointSlice (DNAT dst)

const POD_INNER = { dx: 18, dy: 30, h: 48 };

// The connect lane leaves a Pod floor and lands on a box floor, so its tag rides BELOW the ball: at
// the default -14 it prints over the Pod sublabel and then over `external host`. Clear from 12.
const CONNECT_TAG_DY = 14;
// Row B is 60 tall against a 118 unit address, so on the lane the box faces cut the DNAT tag. -40
// clears all four viewports and leaves the string 7 above the row.
const DNAT_TAG_DY = -40;

const clientPod = (key, cy, ip) => P.pod({
  key, innerKey: `${key}Box`, x: CLIENT_X, y: cy - CLIENT_H / 2, w: CLIENT_W, h: CLIENT_H,
  label: 'Client Pod', sublabel: ip,
  inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: CLIENT_W - POD_INNER.dx * 2, h: POD_INNER.h, label: 'curl', sublabel: 'eth0' },
});

// The list order IS the append order, which is the z-order: clients + infra boxes, then wires above,
// then chips, then the packet layer (ball + riding label) on top. No static wire text labels.
export const SCENE = {
  'aria-label': 'ExternalName and Services without selectors: a type ExternalName Service is a pure DNS alias where CoreDNS returns a CNAME to an external host with no ClusterIP and no kube-proxy, while a ClusterIP Service with no selector gets a hand-attached EndpointSlice listing an external IP that kube-proxy then DNATs to like any other Service',
  parts: [
    P.defs(),
    P.box({ key: 'dns', x: A_DNS_LEFT, y: ROW_A - BOX_H / 2, w: A_DNS_RIGHT - A_DNS_LEFT, h: BOX_H, label: 'CoreDNS', sublabel: 'returns CNAME' }),
    P.box({ key: 'host', x: A_HOST_LEFT, y: ROW_A - BOX_H / 2, w: TARGET_W, h: BOX_H, label: 'db.example.com', sublabel: 'external host' }),
    P.box({ key: 'proxy', x: B_PROXY_LEFT, y: ROW_B - BOX_H / 2, w: B_PROXY_RIGHT - B_PROXY_LEFT, h: BOX_H, label: 'kube-proxy', sublabel: 'ClusterIP 10.96.0.7' }),
    P.box({ key: 'ep', x: B_EP_LEFT, y: ROW_B - BOX_H / 2, w: TARGET_W, h: BOX_H, label: 'EndpointSlice', sublabel: 'manual · 203.0.113.5' }),
    clientPod('clientA', ROW_A, 'svc lookup'),
    clientPod('clientB', ROW_B, 'svc:5432'),
    // CoreDNS to the external host is a RELATIONSHIP, not a route: the CNAME names that host, and
    // nothing on this card ever travels it. An ExternalName Service never proxies.
    P.relation({ points: [[A_DNS_RIGHT, ROW_A], [A_HOST_LEFT, ROW_A]] }),
    P.arrow({ x1: A_HOP1[0][0], y1: A_HOP1[0][1], x2: A_HOP1[1][0], y2: A_HOP1[1][1], dashed: true, dim: true }),
    P.arrow({ x1: A_HOP2[0][0], y1: A_HOP2[0][1], x2: A_HOP2[1][0], y2: A_HOP2[1][1], dashed: true, dim: true }),
    P.lane({ points: A_HOP3, dashed: true, dim: true }),
    P.arrow({ x1: B_CLIENT_EDGE, y1: ROW_B, x2: B_PROXY_LEFT, y2: ROW_B, dashed: true, dim: true }),
    P.arrow({ x1: B_PROXY_RIGHT, y1: ROW_B, x2: B_EP_LEFT, y2: ROW_B, dashed: true, dim: true }),
    // Chip strip spans the block width 1:1: leftmost edge under the Client Pods (115), rightmost edge
    // under the external-target boxes (1085), with even 20px gaps. typeChip is widest for its long value.
    P.chip({ key: 'typeChip', x: 115, y: 566, w: 270, h: 34, name: 'type', value: 'idle' }),
    P.chip({ key: 'vipChip', x: 405, y: 566, w: 200, h: 34, name: 'clusterIP', value: 'none' }),
    P.chip({ key: 'epChip', x: 625, y: 566, w: 220, h: 34, name: 'endpoints', value: 'none' }),
    P.chip({ key: 'proxyChip', x: 865, y: 566, w: 220, h: 34, name: 'kube-proxy', value: 'none' }),
    P.packets(),
  ],
  // clientABox/clientBBox are listed so a highlight set in a reduced-replay branch is cleared every
  // step and does not leak forward (reduced replay never runs the forward path that would re-clear it).
  reset: {
    keys: ['dns', 'host', 'proxy', 'ep', 'clientABox', 'clientBBox', 'typeChip', 'vipChip', 'epChip', 'proxyChip'],
    pods: ['clientA', 'clientB'],
  },
};

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { typeChip: 'idle', vipChip: 'none', epChip: 'none', proxyChip: 'none' },
  },
  {
    id: 'externalname',
    duration: 5700,
    narration: 'A type ExternalName Service has no ClusterIP at all. When a client looks it up, CoreDNS simply returns a CNAME to an external name such as db.example.com, and the client connects straight there. The kube-proxy is never involved, the Service is purely a name pointing at another name.',
    chips: { typeChip: 'ExternalName', vipChip: 'none', epChip: 'none', proxyChip: 'not involved' },
    lit: ['typeChip', 'vipChip', 'proxyChip'],
    // The animated path says the client asked and then connected by PULSING it, which no lights list names.
    reducedLit: ['clientABox'],
    // Up-arrow: the client pulses, the query leaves at BEAT.afterPulse and lights CoreDNS on arrival.
    // The answer comes back to the CLIENT. CoreDNS hands over a name and stops there.
    flow: [
      F.pulse({ pod: 'clientA' }),
      F.segment({ from: A_HOP1[0], to: A_HOP1[1], delay: BEAT.afterPulse, name: 'q' }),
      F.tag({ text: 'db.default.svc', points: A_HOP1, delay: BEAT.afterPulse, easing: 'linear' }),
      F.light({ targets: ['dns'], at: 'q' }),
      F.segment({ from: A_HOP2[0], to: A_HOP2[1], after: 'q', name: 'ans' }),
      F.tag({ text: 'CNAME -> db.example.com', points: A_HOP2, after: 'q', easing: 'linear' }),
      F.pulse({ pod: 'clientA', at: 'ans' }),
      // Holding the name, the client connects to the external host itself, on a lane that never
      // touches CoreDNS. Eased route, so the tag rides it on the wrapper default easing.
      F.route({ points: A_HOP3, at: 'ans', plus: BEAT.afterPulse, name: 'conn' }),
      F.tag({ text: 'connect db.example.com', points: A_HOP3, at: 'ans', plus: BEAT.afterPulse, dy: CONNECT_TAG_DY }),
      F.light({ targets: ['host'], at: 'conn' }),
    ],
  },
  {
    id: 'noselector',
    duration: 3000,
    narration: 'The other case keeps a real ClusterIP but defines no selector, so Kubernetes creates no endpoints automatically. You attach an EndpointSlice yourself, listing the external IP. The kube-proxy then DNATs the ClusterIP to that address exactly as it would to a Pod, so a fixed external server looks like an in-cluster Service.',
    chips: { typeChip: 'ClusterIP · no selector', vipChip: '10.96.0.7', epChip: 'manual', proxyChip: 'DNAT' },
    lit: ['typeChip', 'vipChip', 'epChip', 'proxyChip'],
    // The animated path says the client sent by PULSING it, which no lights list can name.
    reducedLit: ['clientBBox'],
    flow: [
      F.pulse({ pod: 'clientB' }),
      F.segment({ from: B_HOP1[0], to: B_HOP1[1], delay: BEAT.afterPulse, name: 'send' }),
      F.tag({ text: 'dst 10.96.0.7', points: B_HOP1, delay: BEAT.afterPulse, easing: 'linear' }),
      F.light({ targets: ['proxy'], at: 'send' }),
      F.segment({ from: B_HOP2[0], to: B_HOP2[1], after: 'send', name: 'fwd' }),
      F.tag({ text: 'DNAT -> 203.0.113.5', points: B_HOP2, after: 'send', easing: 'linear', dy: DNAT_TAG_DY }),
      F.light({ targets: ['ep'], at: 'fwd' }),
    ],
  },
  {
    id: 'recap',
    duration: 2400,
    narration: 'So ExternalName is resolution only, a CNAME with no proxy and no virtual IP, and it breaks if the client expects to talk TLS to the original name. The no-selector ClusterIP is a real proxied Service whose backends you curate by hand. Same Service object, two very different jobs.',
    chips: { typeChip: 'two modes', vipChip: 'none / real', epChip: 'none / manual', proxyChip: 'no / yes' },
    // Packet-less, pod-less recap: the two middle boxes light via .highlight to distinguish the
    // modes. Blocks light, they never blink. Only Pods pulse.
    lit: ['dns', 'proxy', 'typeChip', 'vipChip', 'epChip', 'proxyChip'],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
