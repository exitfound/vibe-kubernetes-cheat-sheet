import { P, F, defineCard, laneY, midX, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS/network-dns-ndots.md


// Panel right <= 397, bottom <= 255, so CoreDNS hangs below it on the left and the client Pod takes
// the right column, directly under the resolv.conf it owns. Both blocks hold CONTENT_L and CONTENT_R.
const CONTENT_L = 70, CONTENT_R = 1130;
const FLOW_Y = 420;
const LANE_DY = 12;
const { out: FWD_Y, back: RET_Y } = laneY(FLOW_Y, LANE_DY);   // 408 query lane, 432 answer lane

const DNS_X = CONTENT_L, DNS_W = 232, DNS_H = 80;                  // NET.L-01
const DNS_EDGE = DNS_X + DNS_W;          // 302: CoreDNS right edge
// 340 and not 232: the Pod takes the width of the column over it (NET.L-01, sized BY a column).
const POD_W = 340, POD_H = 104;
const POD_X = CONTENT_R - POD_W;         // 790: client Pod left edge

// The resolver side of the card, one column over the Pod: the file first, then the order the
// resolver tries candidates in. Everything a lookup walks is drawn next to the Pod that walks it.
const COL_X = POD_X, COL_W = POD_W, CHIP_H = 32, CHIP_GAP = 8;
const FILE_Y = 60;
const NS_W = 180, OPT_W = COL_W - NS_W - 10;                   // nameserver 180, options 150
const TRY_Y0 = 148;
const TRY_Y = [0, 1, 2, 3].map((i) => TRY_Y0 + i * (CHIP_H + CHIP_GAP));   // 148 188 228 268

// The two counters stacked under CoreDNS, which is where every one of those queries lands.
const CNT_W = DNS_W, CNT_Y = [480, 520];

// Query and answer lanes. Wire and ball come from the same array.
const QUERY = [[POD_X, FWD_Y], [DNS_EDGE, FWD_Y]];
const ANSWER = [[DNS_EDGE, RET_Y], [POD_X, RET_Y]];
const LANE_CX = midX(DNS_EDGE, POD_X);   // 546, where both lane labels sit

// The search list of a Pod in namespace default, then the name as written: the order a relative
// name is tried in. The rows are FIXED, only their results change, so the four keys are stable.
const SUFFIXES = ['default.svc.cluster.local', 'svc.cluster.local', 'cluster.local'];
const TRY_NAMES = [...SUFFIXES, 'as written'];
const TRY_KEYS = ['try0', 'try1', 'try2', 'try3'];
const NOT_TRIED = 'not tried';
const SKIPPED = 'skipped';

const RESOLV = { rcNS: '10.96.0.10', rcNdots: 'ndots:5' };
const IDLE_ROWS = { try0: NOT_TRIED, try1: NOT_TRIED, try2: NOT_TRIED, try3: NOT_TRIED };
const CANDIDATE = (name, i) => (i < SUFFIXES.length ? `${name}.${SUFFIXES[i]}` : name);

export const SCENE = {
  'aria-label': 'Search domains and ndots: a Pod resolv.conf lists search domains and ndots:5, so a name with fewer than 5 dots is tried against each search domain before being tried as written. A same-namespace name answers on the first candidate, a cross-namespace name on the second, an external name only after three NXDOMAIN misses, each candidate costing an A and an AAAA query, while a name ending in a dot skips the search list',
  parts: [
    P.defs(),
    P.box({ key: 'dns', x: DNS_X, y: FLOW_Y - DNS_H / 2, w: DNS_W, h: DNS_H, label: 'CoreDNS', sublabel: 'kube-dns 10.96.0.10' }),
    // The resolver box is INSIDE the Pod group: a box beside it would be left out of the pulse.
    P.pod({
      key: 'podGroup', innerKey: 'podBox', x: POD_X, y: FLOW_Y - POD_H / 2, w: POD_W, h: POD_H,
      label: 'Client Pod', sublabel: 'namespace default',
      inner: { dx: 20, dy: 30, w: POD_W - 40, h: 44, label: 'Resolver', sublabel: 'getaddrinfo' },
    }),
    P.arrow({ from: QUERY[0], to: QUERY[1], dashed: true, dim: true }),
    P.arrow({ from: ANSWER[0], to: ANSWER[1], dashed: true, dim: true }),
    P.wire({ key: 'q', x: LANE_CX, y: FWD_Y - 12 }),
    P.wire({ key: 'a', x: LANE_CX, y: RET_Y + 22 }),
    // resolv.conf, drawn as the file it is. Its search line is not a chip of its own: it is the
    // first three rows of the try order below, which is where the card reads it.
    P.tag({ x: COL_X + COL_W / 2, y: FILE_Y - 12, text: '/etc/resolv.conf' }),
    P.chip({ key: 'rcNS', x: COL_X, y: FILE_Y, w: NS_W, h: CHIP_H, name: 'nameserver', value: RESOLV.rcNS }),
    P.chip({ key: 'rcNdots', x: COL_X + NS_W + 10, y: FILE_Y, w: OPT_W, h: CHIP_H, name: 'options', value: RESOLV.rcNdots }),
    P.tag({ x: COL_X + COL_W / 2, y: TRY_Y0 - 12, text: 'search domains, then as written' }),
    ...TRY_KEYS.map((key, i) => P.chip({ key, x: COL_X, y: TRY_Y[i], w: COL_W, h: CHIP_H, name: TRY_NAMES[i], value: NOT_TRIED })),
    P.chip({ key: 'namesChip', x: DNS_X, y: CNT_Y[0], w: CNT_W, h: CHIP_H, name: 'names tried', value: '0' }),
    P.chip({ key: 'queriesChip', x: DNS_X, y: CNT_Y[1], w: CNT_W, h: CHIP_H, name: 'A+AAAA queries', value: '0' }),
    P.packets(),
  ],
  reset: {
    keys: ['podBox', 'dns', 'rcNS', 'rcNdots', ...TRY_KEYS, 'namesChip', 'queriesChip'],
    pods: ['podGroup'],
  },
};

// One candidate asked and answered. `depart` is when the question leaves, and every later entry of
// the round trip chains off the two arrivals it names. The row lights as the question DEPARTS, so it
// is always readable which candidate is in flight, and its result is written when the answer lands.
const askOnce = ({ i, row, name, result, depart, tried, pulseOnSend = true }) => [
  ...(pulseOnSend ? [F.pulse({ pod: 'podGroup' })] : []),
  F.set({ wires: { q: name }, lit: [row], ...depart }),
  F.segment({ from: QUERY[0], to: QUERY[1], ...depart, name: `q${i}`, lights: ['dns'] }),
  F.segment({ from: ANSWER[0], to: ANSWER[1], after: `q${i}`, name: `a${i}` }),
  F.pulse({ pod: 'podGroup', at: `a${i}` }),
  // Both counters wait for the answer (P-03): a name counts as tried once its reply is back, and
  // each name is two queries on the wire, A and AAAA sent together.
  F.set({
    wires: { a: result },
    chips: { [row]: result, namesChip: String(tried), queriesChip: String(tried * 2) },
    at: `a${i}`,
  }),
];

// A lookup is a run of round trips, fired back to back. A retry leaves 460 after the last NXDOMAIN
// landed: 160 of gap, then the 300 lead the resolver waits before firing the next name. `tries`
// lists the rows asked, in order, each with the answer it gets.
const lookup = (name, tries) => tries.flatMap(({ row, result }, i) => askOnce({
  i,
  row: TRY_KEYS[row],
  name: CANDIDATE(name, row),
  result,
  tried: i + 1,
  depart: i === 0 ? { delay: BEAT.afterPulse } : { at: `a${i - 1}`, plus: 460 },
  pulseOnSend: i === 0,
}));

// The static end state of a lookup, from the same `tries` list: every row asked carries its answer
// and is lit, every other row keeps `rest`, and both counters hold the total.
const endState = (name, tries, rest = NOT_TRIED) => {
  const rows = { try0: rest, try1: rest, try2: rest, try3: rest };
  for (const { row, result } of tries) rows[TRY_KEYS[row]] = result;
  const last = tries[tries.length - 1];
  return {
    wires: { q: CANDIDATE(name, last.row), a: last.result },
    chips: { ...rows, namesChip: String(tries.length), queriesChip: String(tries.length * 2), ...RESOLV },
    lit: [...tries.map(({ row }) => TRY_KEYS[row]), 'namesChip', 'queriesChip'],
  };
};

const REWIND = {
  wires: { q: '', a: '' },
  chips: { ...IDLE_ROWS, namesChip: '0', queriesChip: '0' },
};

const LOCAL = 'api', LOCAL_A = 'A 10.96.0.42';
const CROSS = 'api.shop', CROSS_A = 'A 10.96.7.19';
const EXTERNAL = 'api.example.com', EXTERNAL_A = 'A 203.0.113.10';
const NX = 'NXDOMAIN';

const LOCAL_TRIES = [{ row: 0, result: LOCAL_A }];
const CROSS_TRIES = [{ row: 0, result: NX }, { row: 1, result: CROSS_A }];
const EXTERNAL_TRIES = [{ row: 0, result: NX }, { row: 1, result: NX }, { row: 2, result: NX }, { row: 3, result: EXTERNAL_A }];
// An absolute name is sent as written and nothing else: the three search rows read skipped.
const FQDN_TRIES = [{ row: 3, result: EXTERNAL_A }];

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { ...IDLE_ROWS, namesChip: '0', queriesChip: '0', ...RESOLV },
  },
  {
    id: 'resolvconf',
    duration: 2400,
    narration: 'With the default ClusterFirst policy the Kubelet writes this resolv.conf: the kube-dns Service as nameserver, the search domains of the namespace, and ndots:5. A name with fewer than 5 dots counts as relative, so the resolver tries it with every search domain first and as written last. Search domains of the Node are appended to the list as well.',
    chips: { ...IDLE_ROWS, namesChip: '0', queriesChip: '0', ...RESOLV },
    lit: ['rcNS', 'rcNdots', ...TRY_KEYS],
    // The Pod is reading its own resolv.conf and no cue names the resolver box, so the static path
    // says it here instead of the pulse it cannot show.
    reducedLit: ['podBox'],
    flow: [F.pulse({ pod: 'podGroup' })],
  },
  {
    id: 'local',
    // Motion: pulse beat (800) + one round trip on the 488 unit lane + the arrival pulse ends at 3968.
    duration: 4100,
    narration: 'The name api has zero dots, so it is relative. The first candidate, api.default.svc.cluster.local, is a Service in the same namespace, so CoreDNS answers with its ClusterIP and the walk stops there. One name tried, and still two queries, because getaddrinfo asks for A and AAAA together.',
    ...endState(LOCAL, LOCAL_TRIES),
    reducedLit: ['podBox'],
    rewind: REWIND,
    flow: lookup(LOCAL, LOCAL_TRIES),
  },
  {
    id: 'crossns',
    // Two round trips, the second chained 460 after the first NXDOMAIN lands: the motion runs to 6696.
    duration: 6850,
    narration: 'The name api.shop has one dot, still under 5. The first candidate, api.shop.default.svc.cluster.local, does not exist and comes back NXDOMAIN. The second, api.shop.svc.cluster.local, is that Service in the shop namespace and answers. This is what the search list is for: a name relative to the cluster resolves without its full suffix.',
    ...endState(CROSS, CROSS_TRIES),
    reducedLit: ['podBox'],
    rewind: REWIND,
    flow: lookup(CROSS, CROSS_TRIES),
  },
  {
    id: 'external',
    // Four round trips back to back, 2728 each after the first, and the last one still has to finish
    // its arrival pulse: the motion runs to 12152. Never below it, or auto-advance clips the walk.
    duration: 12300,
    narration: 'The name api.example.com has two dots, so it is relative too, and no cluster suffix can match it. Three round trips end in NXDOMAIN before the name as written is asked and answered. Four names and eight queries for a single external lookup, paid again on every call, since the resolver inside the Pod keeps no cache. This is the real cost of ndots:5.',
    ...endState(EXTERNAL, EXTERNAL_TRIES),
    reducedLit: ['podBox'],
    rewind: REWIND,
    flow: lookup(EXTERNAL, EXTERNAL_TRIES),
  },
  {
    id: 'fqdn',
    // One round trip, same budget as the local step.
    duration: 4100,
    narration: 'A trailing dot makes a name absolute whatever ndots says, as in api.example.com., so the resolver skips every search domain and asks it once as written: one name, two queries. Fully qualifying hot external names, or lowering ndots through the Pod dnsConfig, is the usual fix for noisy cluster DNS.',
    // The trailing dot has to survive on the query label: it is the whole subject of the step.
    ...endState(`${EXTERNAL}.`, FQDN_TRIES, SKIPPED),
    // The three skipped rows change value too, so they carry the cue (P-09a).
    lit: [...TRY_KEYS, 'namesChip', 'queriesChip'],
    reducedLit: ['podBox'],
    rewind: REWIND,
    flow: [
      ...lookup(`${EXTERNAL}.`, FQDN_TRIES),
      // The skip is decided when the resolver reads the trailing dot, which is the beat the name
      // leaves on, so the three search rows turn over with the as-written row lighting (P-04).
      F.set({ chips: { try0: SKIPPED, try1: SKIPPED, try2: SKIPPED }, lit: TRY_KEYS.slice(0, 3), delay: BEAT.afterPulse }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
