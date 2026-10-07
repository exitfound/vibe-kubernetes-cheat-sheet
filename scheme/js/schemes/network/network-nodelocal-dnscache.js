import { LANE_DY, P, F, defineCard, laneY, midX, strip, makeRidingLabel, BEAT, OPACITY, BRISK_HOP_MS } from './network-kit.js';

// Design notes for this card: ./CARDS/network-nodelocal-dnscache.md

// Two Node frames: Node-1 holds the client, its dataplane and the agent, Node-2 holds CoreDNS, and
// the Node upstream resolver stands outside both. NODE_Y is a measured literal: Node-1 opens left of
// the panel, so L-03 puts its top under the deepest panel reading.
const NODE_Y = 250;
const N1_X = 40, N1_W = 680;
const N1_R = N1_X + N1_W;                      // the face every off-Node lane leaves from
const N2_X = 840, N2_W = 320;
const N2_R = N2_X + N2_W;
const BLOCK_W = 232, BLOCK_H = 80, POD_H = 104; // NET.L-01

// Row 1, the path every query starts on: the client Pod and the dataplane that decides DNAT or
// NOTRACK. CoreDNS on Node-2 shares the row, so the cross-Node pair is straight.
const POD_X = N1_X + 24;
const POD_R = POD_X + BLOCK_W;
const POD_Y = NODE_Y + 34;                     // under the 34 label band
const FLOW_Y = POD_Y + POD_H / 2;
const ROW1_Y = FLOW_Y - BLOCK_H / 2;
const DP_X = N1_R - 32 - BLOCK_W;              // the dataplane stands 32 inside the Node-1 face
const DP_CX = DP_X + BLOCK_W / 2;
const DNS_X = N2_X + (N2_W - BLOCK_W) / 2;
// The Node-2 floor is 20, not 12: any floor under 19 pushes the return lane landing past the 18
// percent off midpoint that L-11 accepts.
const N2_Y = NODE_Y;
const N2_H = ROW1_Y + BLOCK_H + 20 - N2_Y;

// Row 2: the agent straight under the dataplane, and the Node upstream resolver outside the frames
// under Node-2, so both of the agent's off-Node legs leave the same Node-1 face.
const ROW2_Y = ROW1_Y + BLOCK_H + 56;          // the gap between dataplane and agent carries the local pair
const AGENT_Y = ROW2_Y;
const EXT_Y = ROW2_Y;
const ROW2_CY = ROW2_Y + BLOCK_H / 2;
// The Node-1 right face carries two lane pairs, so the frame is centred between the rows and each pair
// mirrors the other about the face (L-12). That pins the floor, whatever NODE_Y is.
const N1_H = FLOW_Y + ROW2_CY - 2 * NODE_Y;

const { out: OUT_Y, back: BACK_Y } = laneY(FLOW_Y, LANE_DY);
const { out: EXT_OUT, back: EXT_BACK } = laneY(ROW2_CY, LANE_DY);
const DOWN_X = DP_CX - LANE_DY, UP_X = DP_CX + LANE_DY;

// Every lane is ONE array feeding the wire and the ball (A-02). A ball into the dataplane fades on
// its face and the next leg re-emerges on another face or on the Node-1 frame (NET.A-01, NET.A-02).
const ASK = [[POD_R, OUT_Y], [DP_X, OUT_Y]];
const REPLY = [[DP_X, BACK_Y], [POD_R, BACK_Y]];
const TO_AGENT = [[DOWN_X, ROW1_Y + BLOCK_H], [DOWN_X, AGENT_Y]];
const FROM_AGENT = [[UP_X, AGENT_Y], [UP_X, ROW1_Y + BLOCK_H]];
const TO_N2 = [[N1_R, OUT_Y], [N2_X, OUT_Y]];
const FROM_N2 = [[N2_X, BACK_Y], [N1_R, BACK_Y]];
const TO_EXT = [[N1_R, EXT_OUT], [DNS_X, EXT_OUT]];
const FROM_EXT = [[DNS_X, EXT_BACK], [N1_R, EXT_BACK]];

// Wire labels stand UNDER the return lane of their pair, so the riding tag above the query lane
// never meets them. The local pair names itself to the right, clear of both boxes it joins.
const ASK_MID = midX(POD_R, DP_X);
const CROSS_MID = midX(N1_R, N2_X);
const EXT_MID = midX(N1_R, DNS_X);
const LOCAL_TAG_X = UP_X + 58;
const LOCAL_TAG_Y = midX(ROW1_Y + BLOCK_H, AGENT_Y) + 4;

const CHIP_Y = NODE_Y + N1_H + 24;
const CHIP_H = 34;
const CHIPS = strip({ from: N1_X, to: N2_R, count: 4, gap: 20 });

// A tagged leg rides LEG_DUR so its tag is readable (M-12, PACING). The tag rides ABOVE the block
// tops rather than on the lane, so it stays visible for the whole flight including the arrival.
const LEG_DUR = 1275;
// Every other hop takes BRISK_HOP_MS (network-kit) so short legs do not crawl at the 700 floor
// (M-12, PACING).

const ASK_TAG = '10.96.0.10', EXT_TAG = '10.0.0.2';
// The resolver tag leads its ball by 30, so the frame edge over its departure point misses it.
const askLabel = makeRidingLabel({ role: 'network', dy: -54, hold: 0 });
const extLabel = makeRidingLabel({ role: 'network', dx: 30, dy: -40, hold: 0 });

// The list order IS the append order, which is the z-order: frames, blocks, lanes and their labels,
// chips, then the packet layer.
export const SCENE = {
  'aria-label': 'NodeLocal DNSCache in kube-proxy iptables mode: a client Pod on Node-1 asks the kube-dns ClusterIP 10.96.0.10. Without the cache the Node-1 rules DNAT that UDP query to a CoreDNS Pod on Node-2 and track each lookup in conntrack. With the node-local-dns DaemonSet agent on the host network, the same address is bound on Node-1 with NOTRACK rules, so the query stops at the agent. A miss for a cluster name goes to CoreDNS over TCP through the kube-dns-upstream Service, a cached answer is served on the Node for at most 30 seconds, and other names go to the upstream resolvers of the Node.',
  parts: [
    P.defs(),
    P.node({ key: 'node1', x: N1_X, y: NODE_Y, w: N1_W, h: N1_H, label: 'Node-1' }),
    P.node({ key: 'node2', x: N2_X, y: N2_Y, w: N2_W, h: N2_H, label: 'Node-2' }),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: POD_X, y: POD_Y, w: BLOCK_W, h: POD_H,
      label: 'Client Pod', sublabel: '10.244.1.5',
      inner: { dx: 20, dy: 34, w: BLOCK_W - 40, h: 44, label: 'app', sublabel: 'nameserver 10.96.0.10' },
    }),
    P.box({ key: 'dp', x: DP_X, y: ROW1_Y, w: BLOCK_W, h: BLOCK_H, label: 'Node-1 dataplane', sublabel: 'iptables rules' }),
    P.box({ key: 'agent', x: DP_X, y: AGENT_Y, w: BLOCK_W, h: BLOCK_H, label: 'node-local-dns', sublabel: '169.254.20.10 · 10.96.0.10' }),
    P.box({ key: 'dns', x: DNS_X, y: ROW1_Y, w: BLOCK_W, h: BLOCK_H, label: 'CoreDNS', sublabel: 'Pod 10.244.2.8' }),
    P.box({ key: 'ext', x: DNS_X, y: EXT_Y, w: BLOCK_W, h: BLOCK_H, label: 'Upstream DNS', sublabel: 'Node resolv.conf' }),
    P.arrow({ from: ASK[0], to: ASK[1], dashed: true, dim: true }),
    P.arrow({ from: REPLY[0], to: REPLY[1], dashed: true, dim: true }),
    P.arrow({ from: TO_AGENT[0], to: TO_AGENT[1], dashed: true, dim: true }),
    P.arrow({ from: FROM_AGENT[0], to: FROM_AGENT[1], dashed: true, dim: true }),
    P.arrow({ from: TO_N2[0], to: TO_N2[1], dashed: true, dim: true }),
    P.arrow({ from: FROM_N2[0], to: FROM_N2[1], dashed: true, dim: true }),
    P.arrow({ from: TO_EXT[0], to: TO_EXT[1], dashed: true, dim: true }),
    P.arrow({ from: FROM_EXT[0], to: FROM_EXT[1], dashed: true, dim: true }),
    P.wire({ key: 'ask', x: ASK_MID, y: BACK_Y + 22 }),
    P.wire({ key: 'local', x: LOCAL_TAG_X, y: LOCAL_TAG_Y }),
    P.wire({ key: 'cross', x: CROSS_MID, y: BACK_Y + 22 }),
    P.wire({ key: 'out', x: EXT_MID, y: EXT_BACK + 22 }),
    P.chip({ key: 'rewriteChip', x: CHIPS.x(0), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'rewrite', value: 'DNAT to CoreDNS' }),
    P.chip({ key: 'cacheChip', x: CHIPS.x(1), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'cache', value: 'no cache' }),
    P.chip({ key: 'upChip', x: CHIPS.x(2), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'upstream', value: 'CoreDNS' }),
    P.chip({ key: 'ctChip', x: CHIPS.x(3), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'conntrack', value: 'UDP per lookup' }),
    P.packets(),
  ],
  reset: {
    keys: ['clientBox', 'dp', 'agent', 'dns', 'ext', 'rewriteChip', 'cacheChip', 'upChip', 'ctChip'],
    pods: ['client'],
  },
};

// The agent is the one block that does not exist on the first step: it stands at notready there
// and full everywhere else, stated on every step so no step inherits the shade (A-16).
const stage = (installed) => ({ opacity: { agent: installed ? OPACITY.running : OPACITY.notready } });

// The two labels that describe what a LANE is rather than what rides it on one step.
const UDP = 'UDP 53';
const WIRES_BEFORE = { ask: UDP, local: 'not installed', cross: UDP, out: '' };
const WIRES_AFTER = { ask: UDP, local: 'NOTRACK', cross: 'TCP 53', out: UDP };

// The client asks 10.96.0.10, which is the same address before and after the agent exists: the
// tag is the proof that Pods change nothing. The dataplane lights when the query lands.
const ask = (name) => [
  F.pulse({ pod: 'client' }),
  F.segment({ from: ASK[0], to: ASK[1], delay: BEAT.afterPulse, dur: LEG_DUR, name, lights: ['dp'], tag: { fn: askLabel, text: ASK_TAG } }),
];

// A chip turns over on the beat where its fact happens and is cued there (P-03), so every step
// winds all four back to the step before and names the arrival each one waits for.
const turn = (at, chips) => [
  F.set({ at, chips }),
  F.light({ targets: Object.keys(chips), at }),
];

// The answer leaves the dataplane on the return lane and the client pulses as it lands.
const reply = (prev) => [
  F.segment({ from: REPLY[0], to: REPLY[1], after: prev, dur: BRISK_HOP_MS, pulse: 'client' }),
];

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { rewriteChip: 'DNAT to CoreDNS', cacheChip: 'no cache', upChip: 'CoreDNS', ctChip: 'UDP per lookup' },
    wires: WIRES_BEFORE,
    ...stage(false),
  },
  {
    id: 'before',
    duration: 6100,
    narration: 'Without a local cache, each lookup from a ClusterFirst Pod is a UDP query to the kube-dns ClusterIP 10.96.0.10. The kube-proxy rules on Node-1 DNAT it to a CoreDNS Pod, here on Node-2, and the flow opens a conntrack entry that must time out. When its A and AAAA queries race on that entry, one can be dropped, and the resolver waits out its five second timeout.',
    chips: { rewriteChip: 'DNAT to CoreDNS', cacheChip: 'no cache', upChip: 'CoreDNS', ctChip: 'UDP per lookup' },
    wires: WIRES_BEFORE,
    ...stage(false),
    // The poster already reads the world before the agent, so no chip moves and none is cued.
    lit: [],
    reducedLit: ['clientBox'],
    flow: [
      ...ask('in'),
      F.segment({ from: TO_N2[0], to: TO_N2[1], after: 'in', name: 'cross', lights: ['dns'], dur: BRISK_HOP_MS }),
      F.segment({ from: FROM_N2[0], to: FROM_N2[1], after: 'cross', name: 'back', dur: BRISK_HOP_MS }),
      ...reply('back'),
    ],
  },
  {
    id: 'agent',
    duration: 4800,
    narration: 'A DaemonSet runs node-local-dns, a caching CoreDNS, on the host network of every Node. In iptables mode it binds 169.254.20.10 and the kube-dns ClusterIP, with NOTRACK rules, so the same query stops at the agent: no DNAT, no conntrack entry, no change to Pods. IPVS mode binds only 169.254.20.10 and needs the Kubelet clusterDNS changed.',
    chips: { rewriteChip: 'none, NOTRACK', cacheChip: 'empty', upChip: 'not asked yet', ctChip: 'no entry' },
    wires: WIRES_AFTER,
    ...stage(true),
    rewind: {
      opacity: { agent: OPACITY.notready },
      chips: { rewriteChip: 'DNAT to CoreDNS', cacheChip: 'no cache', upChip: 'CoreDNS', ctChip: 'UDP per lookup' },
    },
    reducedLit: ['clientBox'],
    flow: [
      F.reveal({ target: 'agent', from: OPACITY.notready }),
      F.pulse({ pod: 'client', delay: 600 }),
      F.segment({ from: ASK[0], to: ASK[1], delay: 600 + BEAT.afterPulse, dur: LEG_DUR, name: 'in', lights: ['dp'], tag: { fn: askLabel, text: ASK_TAG } }),
      ...turn('in', { rewriteChip: 'none, NOTRACK', ctChip: 'no entry' }),
      F.segment({ from: TO_AGENT[0], to: TO_AGENT[1], after: 'in', name: 'local', lights: ['agent'], dur: BRISK_HOP_MS }),
      ...turn('local', { cacheChip: 'empty', upChip: 'not asked yet' }),
    ],
  },
  {
    id: 'miss',
    duration: 6900,
    narration: 'The cache is empty, so the agent forwards the cluster name to CoreDNS. It already owns 10.96.0.10, so it dials a second Service, kube-dns-upstream, over TCP. That leg is DNAT-ed and tracked, but a TCP entry is removed when the connection closes. The answer is cached, then returned to the Pod.',
    chips: { rewriteChip: 'DNAT to CoreDNS', cacheChip: 'miss, stored', upChip: 'TCP to CoreDNS', ctChip: 'TCP, removed on close' },
    wires: WIRES_AFTER,
    ...stage(true),
    rewind: { chips: { rewriteChip: 'none, NOTRACK', cacheChip: 'empty', upChip: 'not asked yet', ctChip: 'no entry' } },
    lit: ['agent'],
    reducedLit: ['clientBox'],
    flow: [
      F.segment({ from: FROM_AGENT[0], to: FROM_AGENT[1], delay: BEAT.lead, name: 'up', lights: ['dp'], dur: BRISK_HOP_MS }),
      ...turn('up', { rewriteChip: 'DNAT to CoreDNS', upChip: 'TCP to CoreDNS', ctChip: 'TCP, removed on close' }),
      F.segment({ from: TO_N2[0], to: TO_N2[1], after: 'up', name: 'cross', lights: ['dns'], dur: BRISK_HOP_MS }),
      F.segment({ from: FROM_N2[0], to: FROM_N2[1], after: 'cross', name: 'back', dur: BRISK_HOP_MS }),
      F.segment({ from: TO_AGENT[0], to: TO_AGENT[1], after: 'back', name: 'store', dur: BRISK_HOP_MS }),
      ...turn('store', { cacheChip: 'miss, stored' }),
      F.segment({ from: FROM_AGENT[0], to: FROM_AGENT[1], after: 'store', name: 'answer', dur: BRISK_HOP_MS }),
      ...reply('answer'),
    ],
  },
  {
    id: 'hit',
    duration: 6100,
    narration: 'The next lookup for that name is answered from the cache and never leaves Node-1. A positive answer is kept for its record TTL, held between 5 and 30 seconds, and a negative one for 5. Once it expires, the next lookup goes to CoreDNS again.',
    chips: { rewriteChip: 'none, NOTRACK', cacheChip: 'hit, 30s max', upChip: 'not asked', ctChip: 'no entry' },
    wires: WIRES_AFTER,
    ...stage(true),
    rewind: { chips: { rewriteChip: 'DNAT to CoreDNS', cacheChip: 'miss, stored', upChip: 'TCP to CoreDNS', ctChip: 'TCP, removed on close' } },
    reducedLit: ['clientBox'],
    flow: [
      ...ask('in'),
      ...turn('in', { rewriteChip: 'none, NOTRACK', ctChip: 'no entry' }),
      F.segment({ from: TO_AGENT[0], to: TO_AGENT[1], after: 'in', name: 'local', lights: ['agent'], dur: BRISK_HOP_MS }),
      ...turn('local', { cacheChip: 'hit, 30s max', upChip: 'not asked' }),
      F.segment({ from: FROM_AGENT[0], to: FROM_AGENT[1], after: 'local', name: 'answer', dur: BRISK_HOP_MS }),
      ...reply('answer'),
    ],
  },
  {
    id: 'external',
    duration: 6100,
    narration: 'By default only the cluster domain and the reverse zones go to CoreDNS. A name such as example.com reaches the agent the same way but matches its catch-all zone, which forwards to the resolvers in the resolv.conf of the Node. It never touches CoreDNS, and the answer is still cached on Node-1.',
    chips: { rewriteChip: 'none', cacheChip: 'miss, stored', upChip: 'Node resolvers', ctChip: 'UDP, tracked' },
    wires: WIRES_AFTER,
    ...stage(true),
    rewind: { chips: { rewriteChip: 'none, NOTRACK', cacheChip: 'hit, 30s max', upChip: 'not asked', ctChip: 'no entry' } },
    lit: ['agent'],
    reducedLit: ['clientBox'],
    flow: [
      F.segment({ from: TO_EXT[0], to: TO_EXT[1], delay: BEAT.lead, dur: LEG_DUR, name: 'out', lights: ['ext'], tag: { fn: extLabel, text: EXT_TAG } }),
      ...turn('out', { rewriteChip: 'none', upChip: 'Node resolvers', ctChip: 'UDP, tracked' }),
      F.segment({ from: FROM_EXT[0], to: FROM_EXT[1], after: 'out', name: 'back', dur: BRISK_HOP_MS }),
      ...turn('back', { cacheChip: 'miss, stored' }),
      F.segment({ from: FROM_AGENT[0], to: FROM_AGENT[1], after: 'back', name: 'answer', lights: ['dp'], dur: BRISK_HOP_MS }),
      ...reply('answer'),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
