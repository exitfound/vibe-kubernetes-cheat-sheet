import { LANE_DY, P, F, defineCard, laneY, midX, BEAT, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS/network-dns-coredns.md

// The chain is the SPINE of this card: the client and the stage that answers it share FLOW_Y, so the
// query runs dead straight in, and everything after that happens on the vertical the stages stand on.
const CONTENT_L = 70, CONTENT_R = 1130;
const FLOW_Y = 340;                 // the client centre AND the cache row centre
const { out: FWD_Y, back: RET_Y } = laneY(FLOW_Y, LANE_DY);

// Every actor is NET.L-01: 232 by 80, and the Pod form 232 by 104 with a 192 by 44 app box.
const BOX_W = 232, BOX_H = 80, POD_H = 104;

// The client column hangs below the panel (L-03), the Pod centred over the resolv.conf column.
const CLIENT_X = 114, CLIENT_Y = 288;
const CLIENT_EDGE = CLIENT_X + BOX_W;

// CoreDNS is infrastructure and lights rather than pulses (NET.S-01), so the three stages stand as
// boxes under one caption instead of inside a Pod shell, which is what both sibling DNS cards do.
const ST_X = 620, ST_R = ST_X + BOX_W;
const ST_CX = midX(ST_X, ST_R);               // the seam the chain hops down
const ST_Y = [300, 420, 540];                 // cache / kubernetes / forward
const stCY = (i) => ST_Y[i] + BOX_H / 2;
const stB = (i) => ST_Y[i] + BOX_H;

// The API the kubernetes plugin watches (T-21), in the top band the panel leaves free (L-01).
const API_X = CONTENT_R - BOX_W, API_Y = 60;
const API_CY = API_Y + BOX_H / 2;
const WATCH_X = 876;                          // between the stage column and the readouts

// Down one side of the seam and up the other, mirrored about the face midpoint so the pair is one
// deliberate lane pair (L-12). The answer climbing back through cache is the whole point.
const SEAM_DX = 12;
const SEAM_Y = midX(stB(0), ST_Y[1]) + 4;     // the seam gap, the two half labels sit on it
const FALL_LABEL_X = 660;
// `watch` stands off its own rail: on the rail the text lies across the line.
const WATCH_LABEL_X = 844;
const DESCENT = [[ST_CX - SEAM_DX, stB(0)], [ST_CX - SEAM_DX, ST_Y[1]]];
const ASCENT  = [[ST_CX + SEAM_DX, ST_Y[1]], [ST_CX + SEAM_DX, stB(0)]];
// Drawn and never ridden: the leg a name outside the cluster zone would take (NET.A-03), and the
// watch that feeds the kubernetes plugin, which is a relationship rather than traffic.
const FALL  = [[ST_CX, stB(1)], [ST_CX, ST_Y[2]]];
const WATCH = [[API_X, API_CY], [WATCH_X, API_CY], [WATCH_X, stCY(1)], [ST_R, stCY(1)]];

const QUERY  = [[CLIENT_EDGE, FWD_Y], [ST_X, FWD_Y]];
const ANSWER = [[ST_X, RET_Y], [CLIENT_EDGE, RET_Y]];
const WIRE_MID_X = midX(CLIENT_EDGE, ST_X);

// resolv.conf hangs under the client as the file it is, and the three readouts stand in ONE column
// right of the chain, each on the row of the stage it reports on.
const RC_X = CONTENT_L, RC_W = 320, RC_H = 34; // wide enough for `default.svc.cluster.local +2`
const RC_Y = [422, 464, 506];
const CH_X = API_X, CH_H = 34;                 // the readouts share the API block column
const chipY = (i) => stCY(i) - CH_H / 2;

// The list order IS the append order, which is the z-order: the client Pod, the API and the three
// stages, resolv.conf and the captions, the lanes with their labels, the readouts, then the packets.
export const SCENE = {
  'aria-label': 'DNS resolution via CoreDNS: the Pod resolv.conf points at the kube-dns ClusterIP, and the query runs down the CoreDNS plugin chain to cache, the first stage that can answer it. Cache holds nothing for a fresh name, so the request falls down the chain to the kubernetes plugin, which answers the cluster zone from its own watch of Services and EndpointSlices on the API, and the answer climbs back up through cache, which keeps a copy, before it returns to the client',
  parts: [
    P.defs(),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: CLIENT_X, y: CLIENT_Y, w: BOX_W, h: POD_H,
      label: 'Client Pod', sublabel: '10.244.1.5',
      inner: { dx: 20, dy: 26, w: BOX_W - 40, h: 44, label: 'app', sublabel: 'eth0' },
    }),
    P.box({ key: 'api', x: API_X, y: API_Y, w: BOX_W, h: BOX_H, label: 'API server', sublabel: 'holds Services and EndpointSlices' }),
    P.box({ key: 'pCache', x: ST_X, y: ST_Y[0], w: BOX_W, h: BOX_H, label: 'cache', sublabel: 'first stage that can answer' }),
    P.box({ key: 'pK8s', x: ST_X, y: ST_Y[1], w: BOX_W, h: BOX_H, label: 'kubernetes', sublabel: 'answers the cluster zone' }),
    // The stage this story never reaches stands at notready, which is the shade for a block outside
    // the path (`C-14`), and the caption on its leg says why.
    P.box({ key: 'pFwd', x: ST_X, y: ST_Y[2], w: BOX_W, h: BOX_H, label: 'forward', sublabel: 'upstream resolver', opacity: OPACITY.notready }),
    P.tag({ x: ST_CX, y: ST_Y[0] - 18, text: 'CoreDNS Pod  ·  10.244.4.2' }),
    P.chip({ key: 'rcNS', x: RC_X, y: RC_Y[0], w: RC_W, h: RC_H, name: 'nameserver', value: '10.96.0.10' }),
    P.chip({ key: 'rcSearch', x: RC_X, y: RC_Y[1], w: RC_W, h: RC_H, name: 'search', value: 'default.svc.cluster.local +2' }),
    P.chip({ key: 'rcNdots', x: RC_X, y: RC_Y[2], w: RC_W, h: RC_H, name: 'options', value: 'ndots:5' }),
    P.tag({ x: RC_X + RC_W / 2, y: RC_Y[0] - 12, text: '/etc/resolv.conf' }),
    // One straight lane out and one straight home, both on the cache face the query is answered at.
    P.arrow({ from: QUERY[0], to: QUERY[1], dashed: true, dim: true }),
    P.arrow({ from: ANSWER[0], to: ANSWER[1], dashed: true, dim: true }),
    P.wire({ key: 'q', x: WIRE_MID_X, y: FWD_Y - 12 }),
    P.wire({ key: 'a', x: WIRE_MID_X, y: RET_Y + 22 }),
    // The seam is 24 wide and carries no room for text, so each half is labelled in the gap beside
    // it, centred between the stage edge and its own rail.
    P.wire({ key: 'dn', x: midX(ST_X, ST_CX - SEAM_DX), y: SEAM_Y }),
    P.wire({ key: 'up', x: midX(ST_CX + SEAM_DX, ST_R), y: SEAM_Y }),
    // The two halves of the seam a ball rides, then the two lines nothing ever rides.
    P.arrow({ from: DESCENT[0], to: DESCENT[1], dashed: true, dim: true }),
    P.arrow({ from: ASCENT[0], to: ASCENT[1], dashed: true, dim: true }),
    P.relation({ points: FALL, dash: '5 5' }),
    P.relation({ points: WATCH, dash: '5 5' }),
    // Both lines are true on every step, so they take standing captions rather than step labels.
    P.tag({ x: FALL_LABEL_X, y: midX(stB(1), ST_Y[2]) + 4, text: 'outside the zone' }),
    P.tag({ x: WATCH_LABEL_X, y: midX(API_Y + BOX_H, ST_Y[0]) + 4, text: 'watch' }),
    P.chip({ key: 'cacheChip', x: CH_X, y: chipY(0), w: BOX_W, h: CH_H, name: 'cache', value: 'empty' }),
    P.chip({ key: 'ansChip', x: CH_X, y: chipY(1), w: BOX_W, h: CH_H, name: 'answer A', value: '-' }),
    P.chip({ key: 'fwdChip', x: CH_X, y: chipY(2), w: BOX_W, h: CH_H, name: 'upstream', value: 'not used' }),
    P.packets(),
  ],
  reset: {
    keys: ['api', 'pCache', 'pK8s', 'pFwd', 'rcNS', 'rcSearch', 'rcNdots', 'cacheChip', 'ansChip', 'fwdChip', 'clientBox'],
    pods: ['client'],
  },
};

const FQDN = 'web.default.svc.cluster.local';
// resolv.conf is a file the Kubelet wrote before this card starts, so its three lines are constants
// of the diagram: every step states them and no step turns one over.
const RESOLV = { rcNS: '10.96.0.10', rcSearch: 'default.svc.cluster.local +2', rcNdots: 'ndots:5' };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { cacheChip: 'empty', ansChip: '-', fwdChip: 'not used', ...RESOLV },
  },
  {
    id: 'resolv',
    duration: 2200,
    narration: 'The Kubelet configured the Pod /etc/resolv.conf when the Pod started. Its nameserver is the kube-dns Service ClusterIP, it lists the cluster search domains, and it sets ndots:5. The app asks for a name and knows nothing about CoreDNS.',
    chips: { cacheChip: 'empty', ansChip: '-', fwdChip: 'not used', ...RESOLV },
    lit: ['rcNS', 'rcSearch', 'rcNdots'],
    // The client consults its own resolv.conf by PULSING, which no lights list can name.
    reducedLit: ['clientBox'],
    flow: [F.pulse({ pod: 'client' })],
  },
  {
    id: 'query',
    duration: 2800,
    narration: 'The short name web has fewer than 5 dots, so the resolver expands it against the search list to web.default.svc.cluster.local and sends it to the kube-dns ClusterIP. The query reaches a CoreDNS Pod and runs down its plugin chain to cache, the first stage that can answer it.',
    chips: { cacheChip: 'looking up', ansChip: '-', fwdChip: 'not used', ...RESOLV },
    wires: { q: `A? ${FQDN}` },
    // Both lines the expansion rule reads: search supplies the suffix, ndots decides it is tried first.
    // cacheChip is cued from entry and its VALUE lands on the arrival, so the reader sees it turn over.
    lit: ['rcSearch', 'rcNdots', 'cacheChip'],
    reducedLit: ['clientBox'],
    // The chip waits for the arrival that earns it, so it winds back to the value idle left (P-03).
    rewind: { chips: { cacheChip: 'empty' } },
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: QUERY[0], to: QUERY[1], delay: BEAT.afterPulse, name: 'q', lights: ['pCache'] }),
      F.set({ chips: { cacheChip: 'looking up' }, at: 'q' }),
    ],
  },
  {
    id: 'fall-through',
    duration: 2600,
    narration: 'The order of the chain is compiled into the binary rather than taken from the Corefile, and cache stands before the kubernetes plugin in it. A fresh name is not in the cache, so the request falls to that plugin. A name outside the cluster zone would keep falling, to forward.',
    chips: { cacheChip: 'miss', ansChip: '-', fwdChip: 'outside zone only', ...RESOLV },
    // `request` names what rides the seam, and the chip beside it already says what cache held.
    wires: { q: `A? ${FQDN}`, dn: 'request' },
    // pCache is the SENDER here, so it is lit at entry: a ball must not leave a dark block (M-18a).
    lit: ['pCache', 'cacheChip', 'fwdChip'],
    flow: [
      F.segment({ from: DESCENT[0], to: DESCENT[1], delay: BEAT.lead, lights: ['pK8s'] }),
    ],
  },
  {
    id: 'climb',
    duration: 3000,
    narration: 'The kubernetes plugin answers the cluster zone from its own watch of Services and EndpointSlices on the API, never querying it per lookup, and it builds an A record holding the Service ClusterIP 10.96.0.20. The answer climbs back up the chain, and cache keeps a copy on the way out.',
    chips: { cacheChip: 'stores the answer', ansChip: '10.96.0.20', fwdChip: 'outside zone only', ...RESOLV },
    wires: { q: `A? ${FQDN}`, dn: 'request', up: 'answer' },
    // The watch is what the sentence turns on, so the API stands lit beside the plugin it feeds.
    // Both readouts are cued from entry and both land their VALUE on the climb arrival.
    lit: ['pK8s', 'api', 'cacheChip', 'ansChip'],
    // Both readouts are produced by the climb, so both wind back to what fall-through left.
    rewind: { chips: { cacheChip: 'miss', ansChip: '-' } },
    flow: [
      F.segment({ from: ASCENT[0], to: ASCENT[1], delay: BEAT.lead, name: 'up', lights: ['pCache'] }),
      F.set({ chips: { cacheChip: 'stores the answer', ansChip: '10.96.0.20' }, at: 'up' }),
    ],
  },
  {
    id: 'answer',
    duration: 2800,
    narration: 'The answer leaves the chain the way the query came in and travels home. The client now has an address and opens its connection to that ClusterIP, which is where the kube-proxy path takes over. While the record is inside its TTL the next lookup of this name that lands on this Pod is answered by cache alone.',
    chips: { cacheChip: 'answers within TTL', ansChip: '10.96.0.20', fwdChip: 'outside zone only', ...RESOLV },
    wires: { a: 'A 10.96.0.20' },
    lit: ['pCache', 'cacheChip', 'ansChip'],
    reducedLit: ['clientBox'],
    flow: [
      F.segment({ from: ANSWER[0], to: ANSWER[1], name: 'a', pulse: 'client' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
