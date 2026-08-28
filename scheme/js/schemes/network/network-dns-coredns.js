import { box } from '../../lib/primitives.js';
import { P, F, defineCard, laneY, midX, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-dns-coredns


// Panel right <= 397, bottom <= 305, one of the deepest in the catalog, so the client column hangs
// entirely below it and the CoreDNS Pod holds the right edge: the two together centre on 600.
const CONTENT_L = 70, CONTENT_R = 1130;
const FLOW_Y = 400;                 // shared centre of the client and the CoreDNS Pod
const LANE_DY = 12;                 // half-gap between the two lanes
const { out: FWD_Y, back: RET_Y } = laneY(FLOW_Y, LANE_DY);   // 388 query, 412 answer

const CLIENT_X = CONTENT_L, CLIENT_W = 230, CLIENT_H = 150;
const CLIENT_EDGE = CLIENT_X + CLIENT_W;      // 300: client Pod right edge
const CLIENT_Y = FLOW_Y - CLIENT_H / 2;       // 325, clear of the panel bottom

const DNS_W = 320, DNS_H = 280;
const DNS_LEFT = CONTENT_R - DNS_W;           // 810: CoreDNS Pod left edge
const DNS_Y = FLOW_Y - DNS_H / 2;             // 260
const DNS_CX = DNS_LEFT + DNS_W / 2;          // 970: the spine the plugin chain hops down
const PLUGIN_X = DNS_LEFT + 30, PLUGIN_W = DNS_W - 60;   // 840, 260
const PLUGIN_H = 50;
const PLUGIN_Y = [DNS_Y + 37, DNS_Y + 115, DNS_Y + 193]; // cache / kubernetes / forward

// resolv.conf, drawn under the client Pod, and the two readouts stacked above CoreDNS. Together the
// two groups span CONTENT_L..CONTENT_R, so the chip strip centres on x=600 too.
const RC_X = CONTENT_L, RC_W = 320, RC_H = 32;
const RC_Y = [512, 552, 592];
const OUT_W = 300, OUT_X = CONTENT_R - OUT_W; // 830
const OUT_Y = 168, OUT_H = 34, OUT_SEAM = 4;

// Each lane and the ball that rides it come from the same points array.
const QUERY = [[CLIENT_EDGE, FWD_Y], [DNS_LEFT, FWD_Y]];
const ANSWER = [[DNS_LEFT, RET_Y], [CLIENT_EDGE, RET_Y]];
const CHAIN_HOP = [[DNS_CX, PLUGIN_Y[0] + PLUGIN_H], [DNS_CX, PLUGIN_Y[1]]];   // cache -> kubernetes

const WIRE_MID_X = midX(CLIENT_EDGE, DNS_LEFT);

// The three plugin boxes go INSIDE the Pod group, not beside it, so the pulse reaches them: a Pod
// blinks as one thing. buildPod carries exactly one `inner`, so the three peers are appended here.
const plugins = (el, refs) => {
  refs.pCache = box({ x: PLUGIN_X, y: PLUGIN_Y[0], w: PLUGIN_W, h: PLUGIN_H, label: 'Cache', sublabel: 'answers within TTL', role: 'network' });
  refs.pK8s   = box({ x: PLUGIN_X, y: PLUGIN_Y[1], w: PLUGIN_W, h: PLUGIN_H, label: 'Kubernetes', sublabel: 'watches the API', role: 'network' });
  refs.pFwd   = box({ x: PLUGIN_X, y: PLUGIN_Y[2], w: PLUGIN_W, h: PLUGIN_H, label: 'Forward', sublabel: 'upstream resolver', role: 'network' });
  for (const k of ['pCache', 'pK8s', 'pFwd']) el.appendChild(refs[k]);
};

// The list order IS the append order, which is the z-order: the two Pods first, then resolv.conf and
// its caption, the three wires with their two labels, the readouts, and the packet layer on top.
export const SCENE = {
  'aria-label': 'DNS resolution via CoreDNS: the Pod resolv.conf points at the kube-dns ClusterIP with search domains and ndots, the query reaches a CoreDNS Pod whose plugin chain answers from cache or the kubernetes plugin, returning the Service ClusterIP',
  parts: [
    P.defs(),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: CLIENT_X, y: CLIENT_Y, w: CLIENT_W, h: CLIENT_H,
      label: 'Client Pod', sublabel: '10.244.1.5',
      inner: { dx: 20, dy: 48, w: CLIENT_W - 40, h: 60, label: 'app', sublabel: 'eth0' },
    }),
    P.pod({ key: 'coredns', x: DNS_LEFT, y: DNS_Y, w: DNS_W, h: DNS_H, label: 'CoreDNS Pod', sublabel: '10.244.4.2', tune: plugins }),
    P.chip({ key: 'rcNS', x: RC_X, y: RC_Y[0], w: RC_W, h: RC_H, name: 'nameserver', value: '10.96.0.10' }),
    P.chip({ key: 'rcSearch', x: RC_X, y: RC_Y[1], w: RC_W, h: RC_H, name: 'search', value: 'default.svc / svc / cluster.local' }),
    P.chip({ key: 'rcNdots', x: RC_X, y: RC_Y[2], w: RC_W, h: RC_H, name: 'options', value: 'ndots:5' }),
    P.tag({ x: RC_X + RC_W / 2, y: RC_Y[0] - 12, text: '/etc/resolv.conf' }),
    // Forward query lane and its return answer lane, offset around FLOW_Y so the round trip is a loop.
    P.arrow({ from: QUERY[0], to: QUERY[1], dashed: true, dim: true }),
    P.arrow({ from: ANSWER[0], to: ANSWER[1], dashed: true, dim: true }),
    P.wire({ key: 'q', x: WIRE_MID_X, y: FWD_Y - 12 }),
    P.wire({ key: 'a', x: WIRE_MID_X, y: RET_Y + 22 }),
    // Internal hop: cache bottom -> kubernetes top, on the Pod spine.
    P.arrow({ from: CHAIN_HOP[0], to: CHAIN_HOP[1], dashed: true, dim: true }),
    // Query and answer readouts stacked directly one above the other (4px seam), above the Pod that
    // produces them and flush with its right edge.
    P.chip({ key: 'queryChip', x: OUT_X, y: OUT_Y, w: OUT_W, h: OUT_H, name: 'query', value: '-' }),
    P.chip({ key: 'ansChip', x: OUT_X, y: OUT_Y + OUT_H + OUT_SEAM, w: OUT_W, h: OUT_H, name: 'answer A', value: '-' }),
    P.packets(),
  ],
  reset: {
    keys: ['pCache', 'pK8s', 'pFwd', 'rcNS', 'rcSearch', 'rcNdots', 'queryChip', 'ansChip', 'clientBox'],
    pods: ['client', 'coredns'],
  },
};

const FQDN = 'web.default.svc.cluster.local';
// resolv.conf is a file the Kubelet wrote before this card starts, so its three lines are
// constants of the diagram: every step states them and no step turns one over.
const RESOLV = { rcNS: '10.96.0.10', rcSearch: 'default.svc / svc / cluster.local', rcNdots: 'ndots:5' };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { queryChip: '-', ansChip: '-', ...RESOLV },
  },
  {
    id: 'resolv',
    duration: 2200,
    narration: 'The Pod /etc/resolv.conf was written by the Kubelet at startup. Its nameserver is the kube-dns Service ClusterIP, it lists cluster search domains, and it sets ndots:5. Those three lines are what make in-cluster name resolution work without the app knowing anything about CoreDNS.',
    chips: { queryChip: '-', ansChip: '-', ...RESOLV },
    lit: ['rcNS', 'rcSearch', 'rcNdots'],
    // The client consults its own resolv.conf by PULSING, which no lights list can name.
    reducedLit: ['clientBox'],
    // The chips just light, no flash.
    flow: [F.pulse({ pod: 'client' })],
  },
  {
    id: 'query',
    // Motion: pulse beat (800) + the query lane (~1130 over 510 units) + the CoreDNS pulse (900)
    // ends at ~2830, so the step has to outlast that.
    duration: 3000,
    narration: 'Because the short name web has fewer than 5 dots, the resolver tries the search domains first, expanding it to web.default.svc.cluster.local. That query is sent to the kube-dns ClusterIP, which is itself a Service, so it is load balanced to one of the CoreDNS Pods.',
    chips: { queryChip: FQDN, ansChip: '-', ...RESOLV },
    wires: { q: 'A? web.default.svc...' },
    // Both lines the expansion rule reads: the search list supplies the suffix, ndots decides that
    // the list is tried first. Highlighting only ndots would leave the narration half unillustrated.
    lit: ['rcSearch', 'rcNdots', 'queryChip'],
    reducedLit: ['clientBox'],
    // Up-arrow: client pulses first, the query departs the forward lane at BEAT.afterPulse and
    // CoreDNS pulses on arrival.
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: QUERY[0], to: QUERY[1], delay: BEAT.afterPulse, name: 'q' }),
      F.pulse({ pod: 'coredns', at: 'q' }),
    ],
  },
  {
    id: 'plugin-chain',
    duration: 2500,
    narration: 'Inside CoreDNS the request runs down the plugin chain, whose order is compiled into the binary rather than taken from the Corefile. The cache plugin checks first and misses on a fresh name, so it passes to the kubernetes plugin, which watches Services and EndpointSlices on the API and answers the cluster zone from that local cache, never querying the API per lookup. Names outside the cluster zone would instead fall through to forward.',
    chips: { queryChip: FQDN, ansChip: '-', ...RESOLV },
    lit: ['pCache'],
    // The request falls from cache to the kubernetes plugin: a clean hop between the two boxes.
    flow: [F.segment({ from: CHAIN_HOP[0], to: CHAIN_HOP[1], lights: ['pK8s'] })],
  },
  {
    id: 'answer',
    duration: 2300,
    narration: 'The kubernetes plugin returns an A record holding the Service ClusterIP, 10.96.0.20, and cache stores it for the next lookup. The client now has an address and opens its connection to that ClusterIP, which is where the kube-proxy path takes over.',
    chips: { queryChip: FQDN, ansChip: '10.96.0.20', ...RESOLV },
    wires: { a: 'A 10.96.0.20' },
    // The narration credits two plugins on the way out: kubernetes produces the record, cache stores
    // it. Both stay lit so the answer visibly leaves the chain it was built in.
    lit: ['pK8s', 'pCache', 'ansChip'],
    reducedLit: ['clientBox'],
    // Down-arrow: the answer travels back along the return lane and the client pulses on arrival.
    flow: [
      F.segment({ from: ANSWER[0], to: ANSWER[1], name: 'a' }),
      F.pulse({ pod: 'client', at: 'a' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
