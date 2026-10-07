import { LANE_DY, P, F, defineCard, laneY, midX, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS/network-dns-ndots.md

// CoreDNS hangs below the narration panel on the left, the client Pod sits under its resolv.conf.
const CONTENT_L = 70, CONTENT_R = 1130;
const FLOW_Y = 420;
const { out: FWD_Y, back: RET_Y } = laneY(FLOW_Y, LANE_DY);

const DNS_X = CONTENT_L, DNS_W = 232, DNS_H = 80;                  // NET.L-01
const DNS_EDGE = DNS_X + DNS_W;
// The Pod takes the width of the column over it (NET.L-01, sized by a column).
const POD_W = 340, POD_H = 104;
const POD_X = CONTENT_R - POD_W;

// The resolver column over the Pod: the file, then the order candidates are tried in.
const COL_X = POD_X, COL_W = POD_W, CHIP_H = 34, CHIP_GAP = 8;
const FILE_Y = 60;
const NS_W = 180, OPT_W = COL_W - NS_W - 10;
const TRY_Y0 = 148;
const TRY_Y = [0, 1, 2, 3].map((i) => TRY_Y0 + i * (CHIP_H + CHIP_GAP));

// The two counters stacked under CoreDNS, which is where every one of those queries lands.
const CNT_W = DNS_W, CNT_Y = [480, 480 + CHIP_H + CHIP_GAP];

// Wire and ball come from the same array.
const QUERY = [[POD_X, FWD_Y], [DNS_EDGE, FWD_Y]];
const ANSWER = [[DNS_EDGE, RET_Y], [POD_X, RET_Y]];
const LANE_CX = midX(DNS_EDGE, POD_X);   // where both lane labels sit

// The search list of a Pod in namespace default, then the name as written. The rows are fixed,
// only their results change, so the four keys are stable.
const SUFFIXES = ['default.svc.cluster.local', 'svc.cluster.local', 'cluster.local'];
const TRY_NAMES = [...SUFFIXES, 'as written'];
const TRY_KEYS = ['try0', 'try1', 'try2', 'try3'];
const NOT_TRIED = 'not tried';
const SKIPPED = 'skipped';

const RESOLV = { rcNS: '10.96.0.10', rcNdots: 'ndots:5' };
const IDLE_ROWS = { try0: NOT_TRIED, try1: NOT_TRIED, try2: NOT_TRIED, try3: NOT_TRIED };
const CANDIDATE = (name, i) => (i < SUFFIXES.length ? `${name}.${SUFFIXES[i]}` : name);

export const SCENE = {
  'aria-label': 'Search domains and ndots: under the default ClusterFirst policy a Pod resolv.conf lists search domains and ndots:5, so a name with fewer than 5 dots is tried against each search domain before being tried as written. A same-namespace name answers on the first candidate, a cross-namespace name on the second, an external name only after three NXDOMAIN misses, each candidate costing an A and an AAAA query, while a name ending in a dot skips the search list',
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
    // The search line is not a chip of its own: it is the first three rows of the try order.
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

// One candidate asked and answered. The row lights as the question departs, so the candidate in
// flight is always readable, and its result is written when the answer lands.
const askOnce = ({ i, row, name, result, depart, tried, pulseOnSend = true }) => [
  ...(pulseOnSend ? [F.pulse({ pod: 'podGroup' })] : []),
  F.set({ wires: { q: name }, lit: [row], ...depart }),
  F.segment({ from: QUERY[0], to: QUERY[1], ...depart, name: `q${i}`, lights: ['dns'] }),
  F.segment({ from: ANSWER[0], to: ANSWER[1], after: `q${i}`, name: `a${i}`, pulse: 'podGroup' }),
  // Both counters wait for the answer (P-03). Each name is two queries, A and AAAA together.
  F.set({
    wires: { a: result },
    chips: { [row]: result, namesChip: String(tried), queriesChip: String(tried * 2) },
    at: `a${i}`,
  }),
];

// A run of round trips fired back to back. A retry leaves 460 after the last NXDOMAIN lands: a
// 160 gap plus the 300 lead the resolver waits. `tries` lists the rows asked, each with its answer.
const lookup = (name, tries) => tries.flatMap(({ row, result }, i) => askOnce({
  i,
  row: TRY_KEYS[row],
  name: CANDIDATE(name, row),
  result,
  tried: i + 1,
  depart: i === 0 ? { delay: BEAT.afterPulse } : { at: `a${i - 1}`, plus: 460 },
  pulseOnSend: i === 0,
}));

// The static end state from the same `tries` list: every row asked is lit with its answer, every
// other row keeps `rest`.
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
    duration: 3800,
    narration: 'With the default ClusterFirst policy the Kubelet configures this resolv.conf: the kube-dns Service as nameserver, search domains built from the namespace and the cluster domain, and ndots:5. A name with fewer than 5 dots counts as relative, so the resolver tries it with every search domain first and as written last. Any search domains of the Node are appended after them.',
    chips: { ...IDLE_ROWS, namesChip: '0', queriesChip: '0', ...RESOLV },
    lit: ['rcNS', 'rcNdots', ...TRY_KEYS],
    // No cue names the resolver box, so the static path shows here the pulse it cannot play.
    reducedLit: ['podBox'],
    flow: [F.pulse({ pod: 'podGroup' })],
  },
  {
    id: 'local',
    duration: 4100,
    narration: 'The name api has zero dots, so it is relative. The first candidate, api.default.svc.cluster.local, is a Service in the same namespace, so CoreDNS answers with its ClusterIP and the walk stops there. One name tried, and still two queries, because getaddrinfo asks for A and AAAA together.',
    ...endState(LOCAL, LOCAL_TRIES),
    reducedLit: ['podBox'],
    rewind: REWIND,
    flow: lookup(LOCAL, LOCAL_TRIES),
  },
  {
    id: 'crossns',
    duration: 6850,
    narration: 'The name api.shop has one dot, still under 5. The first candidate, api.shop.default.svc.cluster.local, does not exist and comes back NXDOMAIN. The second, api.shop.svc.cluster.local, is that Service in the shop namespace and answers. This is what the search list is for: a name relative to the cluster resolves without its full suffix.',
    ...endState(CROSS, CROSS_TRIES),
    reducedLit: ['podBox'],
    rewind: REWIND,
    flow: lookup(CROSS, CROSS_TRIES),
  },
  {
    id: 'external',
    // Never below the motion end, or auto-advance clips the walk.
    duration: 12300,
    narration: 'The name api.example.com has two dots, so it is relative too, and no cluster suffix matches it. Three round trips end in NXDOMAIN before the name as written is asked and answered. Four names and eight queries for a single external lookup, paid again on every call, since the resolver inside the Pod keeps no cache. This is the real cost of ndots:5.',
    ...endState(EXTERNAL, EXTERNAL_TRIES),
    reducedLit: ['podBox'],
    rewind: REWIND,
    flow: lookup(EXTERNAL, EXTERNAL_TRIES),
  },
  {
    id: 'fqdn',
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
      // The skip is decided as the name leaves, so the search rows turn over with it (P-04).
      F.set({ chips: { try0: SKIPPED, try1: SKIPPED, try2: SKIPPED }, lit: TRY_KEYS.slice(0, 3), delay: BEAT.afterPulse }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
