import { P, F, defineCard, laneY, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-nodelocal-dnscache


const FLOW_Y = 300;
const LANE_DY = 12;
// 288: query lanes (Pod -> agent, agent -> CoreDNS). 312: answer lanes (agent -> Pod, CoreDNS -> agent)
const { out: FWD_Y, back: RET_Y } = laneY(FLOW_Y, LANE_DY);
const POD_EDGE = 290;
const AGENT_LEFT = 430;
const AGENT_RIGHT = 630;
const DNS_LEFT = 880;

// One wire per direction per hop, and each ball rides the very array its wire was drawn from, so no
// ball ever travels over a line that was drawn pointing the other way.
const QUERY = [[POD_EDGE, FWD_Y], [AGENT_LEFT, FWD_Y]];
const ANSWER = [[AGENT_LEFT, RET_Y], [POD_EDGE, RET_Y]];
const UP = [[AGENT_RIGHT, FWD_Y], [DNS_LEFT, FWD_Y]];
const DOWN = [[DNS_LEFT, RET_Y], [AGENT_RIGHT, RET_Y]];

// The list order IS the append order, which is the z-order: the Node frame in back, then the agent,
// CoreDNS and the Pod, then the wires + their labels above, then the chips, then the packet layer.
export const SCENE = {
  'aria-label': 'NodeLocal DNSCache: a DNS cache agent runs as a DaemonSet on every Node on a link-local address that Pods query, answering cached names locally with no cluster hop and no conntrack entry, and forwarding only misses upstream to CoreDNS over a long-lived TCP connection',
  parts: [
    P.defs(),
    P.node({ key: 'theNode', x: 70, y: 200, w: 620, h: 220, label: 'Node   ·   192.168.1.20' }),
    P.box({ key: 'agent', x: AGENT_LEFT, y: FLOW_Y - 31, w: 200, h: 62, label: 'node-local-dns', sublabel: '169.254.20.10' }),
    P.box({ key: 'dns', x: DNS_LEFT, y: FLOW_Y - 31, w: 240, h: 62, label: 'CoreDNS', sublabel: 'kube-dns 10.96.0.10' }),
    // The resolver is the Pod's INNER box: pulsePod walks descendants, so a box appended beside the
    // shell would be left out of the pulse and the Pod would blink with a dead centre.
    P.pod({
      key: 'podGroup', innerKey: 'podBox', x: 110, y: FLOW_Y - 60, w: 180, h: 120,
      label: 'Client Pod', sublabel: 'curl api',
      inner: { dx: 20, dy: 34, w: 140, h: 52, label: 'Resolver', sublabel: 'getaddrinfo' },
    }),
    P.arrow({ from: QUERY[0], to: QUERY[1], dashed: true, dim: true }),
    P.arrow({ from: ANSWER[0], to: ANSWER[1], dashed: true, dim: true }),
    P.arrow({ from: UP[0], to: UP[1], dashed: true, dim: true }),
    P.arrow({ from: DOWN[0], to: DOWN[1], dashed: true, dim: true }),
    P.wire({ key: 'q', x: 360, y: FWD_Y - 12 }),
    P.wire({ key: 'a', x: 360, y: RET_Y + 22 }),
    P.wire({ key: 'u', x: 755, y: FWD_Y - 12 }),
    P.wire({ key: 'd', x: 755, y: RET_Y + 22 }),
    P.chip({ key: 'pathChip', x: 80, y: 450, w: 250, h: 34, name: 'query path', value: 'idle' }),
    P.chip({ key: 'cacheChip', x: 350, y: 450, w: 250, h: 34, name: 'cache', value: 'empty' }),
    P.chip({ key: 'upChip', x: 620, y: 450, w: 230, h: 34, name: 'upstream', value: 'none' }),
    P.chip({ key: 'ctChip', x: 870, y: 450, w: 250, h: 34, name: 'conntrack', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: ['podBox', 'agent', 'dns', 'pathChip', 'cacheChip', 'upChip', 'ctChip'],
    pods: ['podGroup'],
  },
};

// The wires a step ends on are exactly the ones its flow writes as the balls land, so the step states
// them for the static path and winds them back blank for the animated one to fill in on the beat.
const said = (wires) => ({
  wires,
  rewind: { wires: Object.fromEntries(Object.keys(wires).map(k => [k, ''])) },
});

// The Pod asks its on-Node agent: it pulses, the destination is named as the ball leaves, and the
// agent lights when the question lands. The query arrival is named `q`.
const ask = (wire) => [
  F.pulse({ pod: 'podGroup' }),
  F.set({ wires: { q: wire }, delay: BEAT.afterPulse }),
  F.segment({ from: QUERY[0], to: QUERY[1], delay: BEAT.afterPulse, name: 'q', lights: ['agent'] }),
];

// The agent answers on the RETURN lane one beat after `prev` lands, and the Pod pulses as it receives.
const answer = (wire, prev) => [
  F.set({ wires: { a: wire }, after: prev }),
  F.segment({ from: ANSWER[0], to: ANSWER[1], after: prev, name: 'a' }),
  F.pulse({ pod: 'podGroup', at: 'a' }),
];

const DST = 'dst 169.254.20.10';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    // The rest state is the world BEFORE the agent exists, which is exactly what this step narrates.
    chips: { pathChip: 'cluster hop', cacheChip: 'none', upChip: 'UDP per lookup', ctChip: 'entry per lookup' },
  },
  {
    id: 'agent',
    duration: 2600,
    narration: 'NodeLocal DNSCache runs as a DaemonSet, so a DNS agent sits on every Node listening on a link-local address such as 169.254.20.10, and the Kubelet cluster-dns setting points every Pod resolv.conf at it. A query now travels only to this agent on the same Node, never leaving the host to start with. In iptables mode the agent can bind the kube-dns ClusterIP too, so Pods reach it either way.',
    chips: { pathChip: 'on-node agent', cacheChip: 'empty', upChip: 'not used', ctChip: 'no entry' },
    ...said({ q: DST }),
    lit: ['pathChip', 'cacheChip', 'upChip', 'ctChip'],
    // The animated path says the resolver asked by PULSING the Pod, which no lights list can name.
    reducedLit: ['podBox'],
    flow: ask(DST),
  },
  {
    id: 'hit',
    duration: 3600,
    narration: 'If the name is already cached, the agent answers right there on the Node. No packet crosses the cluster, no DNAT happens, and because the agent installs NOTRACK rules for its own traffic, no conntrack entry is created either. This is the fast path that most repeated lookups take.',
    chips: { pathChip: 'on-node agent', cacheChip: 'hit', upChip: 'not used', ctChip: 'no entry' },
    ...said({ q: DST, a: 'cached answer' }),
    lit: ['cacheChip', 'ctChip'],
    reducedLit: ['podBox'],
    // The whole fast path in one beat: ask on the forward lane, answered on the return lane. The
    // answer rides its OWN wire, so it never retraces the arrow the question went out on.
    flow: [...ask(DST), ...answer('cached answer', 'q')],
  },
  {
    id: 'miss',
    duration: 5400,
    narration: 'On a cache miss the agent forwards the query upstream to CoreDNS, but over a long-lived TCP connection rather than a fresh UDP flow per lookup. It caches the answer it gets back before passing it to the Pod, so the next Pod on this Node asking for the same name is served locally.',
    chips: { pathChip: 'agent -> CoreDNS', cacheChip: 'miss -> fill', upChip: 'TCP keep-alive', ctChip: '1 long-lived' },
    ...said({ q: DST, u: 'TCP to CoreDNS', d: 'answer cached', a: 'answer to Pod' }),
    lit: ['cacheChip', 'upChip', 'ctChip', 'pathChip'],
    reducedLit: ['podBox'],
    // Four hops, because the narration promises all four: the Pod asks, the agent misses and forwards
    // upstream, CoreDNS answers the agent, and only then does the agent answer the Pod.
    flow: [
      ...ask(DST),
      F.set({ wires: { u: 'TCP to CoreDNS' }, at: 'q' }),
      F.segment({ from: UP[0], to: UP[1], after: 'q', name: 'fwd', lights: ['dns'] }),
      F.set({ wires: { d: 'answer cached' }, at: 'fwd' }),
      F.segment({ from: DOWN[0], to: DOWN[1], after: 'fwd', name: 'back' }),
      ...answer('answer to Pod', 'back'),
    ],
  },
  {
    id: 'benefit',
    duration: 3600,
    narration: 'The payoff is two-fold: a warm name is served from the Node without a single packet leaving it, and the flood of short-lived UDP flows that used to fill the conntrack table is gone. On busy clusters this is one of the simplest ways to make DNS stop being the bottleneck.',
    chips: { pathChip: 'on-node agent', cacheChip: 'warm', upChip: 'idle', ctChip: 'pressure gone' },
    ...said({ q: DST, a: 'served locally' }),
    lit: ['pathChip', 'cacheChip', 'ctChip', 'upChip'],
    reducedLit: ['podBox'],
    // The steady state IS the fast path, so replay it rather than pulsing at nothing: this is what
    // every lookup looks like once the cache is warm, and CoreDNS stays dark throughout.
    flow: [...ask(DST), ...answer('served locally', 'q')],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
