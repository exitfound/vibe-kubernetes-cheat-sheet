import { P, F, defineCard, laneY, midX, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-dns-ndots


// Panel right <= 397, bottom <= 230, so the flow row hangs below it and the two blocks hold
// CONTENT_L and CONTENT_R, which centres the content on 600.
const CONTENT_L = 70, CONTENT_R = 1130;
const FLOW_Y = 400;
const LANE_DY = 12;
const { out: FWD_Y, back: RET_Y } = laneY(FLOW_Y, LANE_DY);   // 388 query lane, 412 answer lane

const POD_X = CONTENT_L, POD_W = 340, POD_H = 130;
const POD_EDGE = POD_X + POD_W;   // 410: client Pod right edge
const DNS_W = 340, DNS_H = 96;
const DNS_LEFT = CONTENT_R - DNS_W;   // 790: CoreDNS left edge

// The candidate ladder sits in the free top-right band, above CoreDNS and clear of the panel.
const ROWS_X = 740, ROWS_W = 390, ROWS_Y = 60, ROW_H = 48, ROW_GAP = 8;

// resolv.conf under the Pod on the left, the two counters under CoreDNS on the right: together the
// chip rows span CONTENT_L..CONTENT_R, so the chip strip centres on x=600 as well.
const RC_X = CONTENT_L, RC_W = 330, RC_H = 32;
const RC_Y = 512, RC_Y2 = 552;
const CNT_W = 185, CNT_Y = 512;
const CNT_X1 = ROWS_X;                       // 740
const CNT_X2 = CONTENT_R - CNT_W;            // 945

// Query and answer lanes. Wire and ball come from the same array.
const QUERY = [[POD_EDGE, FWD_Y], [DNS_LEFT, FWD_Y]];
const ANSWER = [[DNS_LEFT, RET_Y], [POD_EDGE, RET_Y]];
const LANE_CX = midX(POD_EDGE, DNS_LEFT);    // 600, where both lane labels sit

const CANDIDATES = ['api.ns.svc.cluster.local', 'api.svc.cluster.local', 'api.cluster.local', 'api'];

// The absolute form and the answer a hit gets, both said twice per step: once as the state the step
// ends in, once as the value the flow writes when the reply lands.
const FQDN = 'api.ns.svc.cluster.local.';
const A_RECORD = 'A 10.96.0.42';
// The two resolv.conf lines are the FILE this card reasons about, true before the first query
// and after the last, so every step states them and no step turns one over.
const RESOLV = { rcSearch: 'ns.svc / svc / cluster.local', rcNdots: 'ndots:5' };

// The ladder ACCUMULATES as the search list is walked, so each attempt lights every row up to its
// own: the `chain` field toggles, and a bare newest row would blank the rows already tried.
const upTo = (i) => Array.from({ length: i + 1 }, (_, r) => r);

// The list order IS the append order, which is the z-order: the Pod, CoreDNS and the ladder, then
// the lanes and their labels above them, then the chips, then the packet layer on top.
export const SCENE = {
  'aria-label': 'Search domains and ndots: a Pod resolv.conf lists search domains and ndots, so a short name with fewer dots than ndots is tried against each search domain in turn before being tried as is, costing one round trip per candidate, while an absolute name ending in a dot skips the search list entirely',
  parts: [
    P.defs(),
    // Client Pod and CoreDNS both centred on FLOW_Y, so the two lanes meet each at its middle. The
    // resolver box is INSIDE the Pod group: a box beside it would be left out of the pulse.
    P.pod({
      key: 'podGroup', innerKey: 'podBox', x: POD_X, y: FLOW_Y - POD_H / 2, w: POD_W, h: POD_H,
      label: 'Client Pod', sublabel: 'curl api',
      inner: { dx: 20, dy: 39, w: POD_W - 40, h: 52, label: 'Resolver', sublabel: 'getaddrinfo' },
    }),
    P.box({ key: 'dns', x: DNS_LEFT, y: FLOW_Y - DNS_H / 2, w: DNS_W, h: DNS_H, label: 'CoreDNS', sublabel: 'kube-dns 10.96.0.10' }),
    // The candidate ladder: every name this one lookup may have to ask for, in the order tried.
    P.chain({ key: 'chain', x: ROWS_X, y: ROWS_Y, w: ROWS_W, rowH: ROW_H, gap: ROW_GAP, items: CANDIDATES }),
    // T-35. The walk step re-asks the name the step before it resolved, so the caption over the
    // ladder marks that state as a hypothesis. Written on the walk alone, blank everywhere else.
    P.wire({ key: 'branch', x: ROWS_X + ROWS_W / 2, y: ROWS_Y - 12 }),
    P.arrow({ from: QUERY[0], to: QUERY[1], dashed: true, dim: true }),
    P.arrow({ from: ANSWER[0], to: ANSWER[1], dashed: true, dim: true }),
    // No `A? ` prefix: measured at the real 11px, the longest string either label takes is 172 units,
    // spanning 514..686 and clearing both block edges by 104. Do not size off a `font-size` attribute.
    P.wire({ key: 'q', x: LANE_CX, y: FWD_Y - 12 }),
    P.wire({ key: 'a', x: LANE_CX, y: RET_Y + 22 }),
    // resolv.conf, drawn as the file it is: the two lines that decide everything on this card.
    P.tag({ x: RC_X + RC_W / 2, y: RC_Y - 12, text: '/etc/resolv.conf' }),
    P.chip({ key: 'rcSearch', x: RC_X, y: RC_Y, w: RC_W, h: RC_H, name: 'search', value: 'ns.svc / svc / cluster.local' }),
    P.chip({ key: 'rcNdots', x: RC_X, y: RC_Y2, w: RC_W, h: RC_H, name: 'options', value: 'ndots:5' }),
    P.chip({ key: 'namesChip', x: CNT_X1, y: CNT_Y, w: CNT_W, h: RC_H, name: 'names tried', value: '0' }),
    P.chip({ key: 'answerChip', x: CNT_X2, y: CNT_Y, w: CNT_W, h: RC_H, name: 'rcode', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: ['podBox', 'dns', 'rcSearch', 'rcNdots', 'namesChip', 'answerChip'],
    pods: ['podGroup'],
  },
};

// One candidate asked and answered. `depart` is when the question leaves, and every later entry of
// the round trip chains off the two arrivals it names.
const askOnce = ({ i, name, result, rows, depart, pulseOnSend = true }) => [
  ...(pulseOnSend ? [F.pulse({ pod: 'podGroup' })] : []),
  // The name and its ladder row appear as the question DEPARTS, so it is always readable which
  // candidate is currently in flight, rather than only being told after the reply is back.
  F.set({ wires: { q: name }, ...(rows ? { chain: rows } : {}), ...depart }),
  F.segment({ from: QUERY[0], to: QUERY[1], ...depart, name: `q${i}`, lights: ['dns'] }),
  F.segment({ from: ANSWER[0], to: ANSWER[1], after: `q${i}`, name: `a${i}` }),
  // Down-arrow: the reply lands and the Pod pulses ON ARRIVAL, the same beat it pulsed with on the way
  // out. Without this the answer just dissolves at the Pod edge and nothing acknowledges receiving it.
  F.pulse({ pod: 'podGroup', at: `a${i}` }),
  F.set({ wires: { a: result }, at: `a${i}` }),
];

// The four candidates fired back to back, each a real round trip. A retry leaves 460 after the last
// NXDOMAIN landed: 160 of gap, then the 300 lead the resolver waits before firing the next name.
const WALK = CANDIDATES.flatMap((name, i) => [
  ...askOnce({
    i,
    name,
    result: 'NXDOMAIN',
    rows: upTo(i),
    depart: i === 0 ? { delay: BEAT.afterPulse } : { at: `a${i - 1}`, plus: 460 },
    pulseOnSend: i === 0,
  }),
  // The counter ticks as each NXDOMAIN lands, so the cost is counted on screen rather than asserted.
  F.set({
    chips: { namesChip: String(i + 1), answerChip: i === CANDIDATES.length - 1 ? 'NXDOMAIN x4' : 'NXDOMAIN' },
    at: `a${i}`,
  }),
]);

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { namesChip: '0', answerChip: 'none', ...RESOLV },
    chain: -1,
  },
  {
    id: 'resolvconf',
    duration: 2400,
    narration: 'The default resolv.conf points at the kube-dns Service and lists the namespace search domains, ending with ndots set to 5. The rule is simple: if a name has fewer than ndots dots, treat it as relative and try the search domains first.',
    chips: { namesChip: '0', answerChip: 'none', ...RESOLV },
    lit: ['rcSearch', 'rcNdots'],
    chain: -1,
    // The Pod is reading its own resolv.conf and no cue names the resolver box, so the static path
    // says it here instead of the pulse it cannot show.
    reducedLit: ['podBox'],
    // No query yet: the Pod is reading its own resolv.conf, so the Pod is what moves. The chips light
    // but never blink, since a blinking block would read as traffic that has not been sent.
    flow: [F.pulse({ pod: 'podGroup' })],
  },
  {
    id: 'append',
    // Motion: pulse beat (800) + one round trip on the 380 unit lane (~1790) + the Pod pulse on the
    // answer (900) ends at ~3490.
    duration: 3600,
    narration: 'The name api has zero dots, well under ndots 5, so the resolver does not send it as is. It appends the first search domain and asks for api.ns.svc.cluster.local. Here that name exists, CoreDNS answers, and the lookup is done in a single round trip.',
    // The state the round trip ENDS in, which the static path shows at once. The animated path winds
    // the lanes, the ladder row and both counters back, so each is written on the beat that earns it.
    wires: { q: CANDIDATES[0], a: A_RECORD, branch: '' },
    chips: { namesChip: '1', answerChip: 'NOERROR', ...RESOLV },
    lit: ['namesChip', 'answerChip'],
    chain: 0,
    reducedLit: ['podBox'],
    rewind: { wires: { q: '', a: '' }, chips: { namesChip: '0', answerChip: 'none' }, chain: -1 },
    flow: [
      ...askOnce({ i: 0, name: CANDIDATES[0], result: A_RECORD, rows: [0], depart: { delay: BEAT.afterPulse } }),
      // One name tried and one NOERROR, both counted when the answer lands at 2588, never before it.
      F.set({ chips: { namesChip: '1', answerChip: 'NOERROR' }, at: 'a0' }),
    ],
  },
  {
    id: 'walk',
    // Four round trips back to back on the same lane, 2248 each after the first, and the last one
    // still has to finish its arrival pulse: the motion runs to 10232.
    duration: 10400,
    narration: 'But if that first guess misses, the resolver does not give up, it walks the whole list: api.svc.cluster.local, then api.cluster.local, then finally api on its own. Every miss is a full round trip that ends in NXDOMAIN, so one name that does not exist costs four of them, and because the resolver asks for IPv4 and IPv6 the real total doubles again.',
    // The lanes end the step on the LAST candidate and its miss, the state the fourth round trip
    // leaves behind, and the counters end on the full cost of the walk.
    wires: { q: 'api', a: 'NXDOMAIN', branch: 'if instead that first guess misses' },
    chips: { namesChip: '4', answerChip: 'NXDOMAIN x4', ...RESOLV },
    lit: ['namesChip', 'answerChip'],
    chain: upTo(CANDIDATES.length - 1),
    reducedLit: ['podBox'],
    rewind: { wires: { q: '', a: '' }, chips: { namesChip: '0', answerChip: 'none' }, chain: -1 },
    flow: WALK,
  },
  {
    id: 'fqdn',
    // One round trip, same budget as the append step.
    duration: 3600,
    narration: 'A trailing dot makes the name absolute no matter what ndots says, as in api.ns.svc.cluster.local., so the resolver skips the search list entirely and not one candidate below is tried. The name goes on the wire exactly once. Fully qualifying hot names, or lowering ndots, is the usual fix for noisy cluster DNS.',
    // The trailing dot has to survive here: it is the whole subject of the step. Deliberately NO
    // ladder row, since an absolute name never touches the search list.
    wires: { q: FQDN, a: A_RECORD, branch: '' },
    chips: { namesChip: '1', answerChip: 'NOERROR', ...RESOLV },
    lit: ['namesChip', 'answerChip'],
    chain: -1,
    reducedLit: ['podBox'],
    // The counters carry the state the walk left, 4 names and its four misses, until this one round
    // trip replaces them on its answer at 2588.
    rewind: { wires: { q: '', a: '' }, chips: { namesChip: '4', answerChip: 'NXDOMAIN x4' } },
    flow: [
      ...askOnce({ i: 0, name: FQDN, result: A_RECORD, depart: { delay: BEAT.afterPulse } }),
      F.set({ chips: { namesChip: '1', answerChip: 'NOERROR' }, at: 'a0' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
