import { P, F, defineCard, makeRidingLabel, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS/network-external-traffic-policy.md


// A balancer over three Nodes running UNEVEN Pods of web: two on Node-1, one on Node-2, none on
// Node-3. A share readout under every Pod is what the policy moves. Actors stand right of the panel
// wall, and the only content left of x 420 is the Node-1 leg, its bus under the deepest panel.
const SCHEME_L = 80, SCHEME_R = 1120;  // content edges, mirrored about x 600

// Node row: three equal frames on the NODE_X grid of the section, bottom 546.
const NODE_W = 300, NODE_H = 190, NODE_Y = 356;
const NODE_GAP = (SCHEME_R - SCHEME_L - 3 * NODE_W) / 2;                  // 70
const NODE_X = [0, 1, 2].map(i => SCHEME_L + i * (NODE_W + NODE_GAP));   // 80, 450, 820
const NODE_CX = NODE_X.map(x => x + NODE_W / 2);                          // 230, 600, 970
const NODE_CY = NODE_Y + NODE_H / 2;                                      // 451: the cross-Node lane

// Two Pods fill Node-1 at a 16 gap inside 14 of padding, so every Pod is 128 wide.
const POD_W = 128, POD_H = 104, POD_Y = NODE_Y + 34, POD_GAP = 16;       // 390, 16 under the frame label
const POD_X = [NODE_CX[0] - POD_GAP / 2 - POD_W, NODE_CX[0] + POD_GAP / 2, NODE_CX[1] - POD_W / 2];   // 94, 238, 536
const SHARE_Y = POD_Y + POD_H + 12, SHARE_H = 30;                         // 506..536, 10 over the frame bottom

// Actor tier, every block NET.L-01 232 wide and 80 tall, on x 600 right of the panel wall.
const ACTOR_W = 232, ACTOR_H = 80, ACTOR_X = 600 - ACTOR_W / 2;          // 484
const CLIENT_Y = 16, LB_Y = CLIENT_Y + ACTOR_H + 40;                     // 136: the client lane is 40 long
const LB_BOTTOM = LB_Y + ACTOR_H;                                         // 216

// Every Node leg leaves the balancer bottom on its own exit, the outer two a mirrored pair about 600
// (L-12), so no stretch of lane is shared and nothing is drawn twice.
const EXIT = 70, BUS_Y = 300;
const C_LANE = [[600, CLIENT_Y + ACTOR_H], [600, LB_Y]];
const TO_N1 = [[600 - EXIT, LB_BOTTOM], [600 - EXIT, BUS_Y], [NODE_CX[0], BUS_Y], [NODE_CX[0], NODE_Y]];
const TO_N2 = [[600, LB_BOTTOM], [600, NODE_Y]];
const TO_N3 = [[600 + EXIT, LB_BOTTOM], [600 + EXIT, BUS_Y], [NODE_CX[2], BUS_Y], [NODE_CX[2], NODE_Y]];
// Node-3 forwards frame face to frame face across the gap, into Node-2.
const CROSS = [[NODE_X[2], NODE_CY], [NODE_X[1] + NODE_W, NODE_CY]];

// Service strip: four chips of one size, centred on x 600 (L-13), bottom 624 mirroring the top at 16.
const CHIP_W = 232, CHIP_H = 34, CHIP_GAP = 16, CHIP_Y = 590;
const CHIP_X = [0, 1, 2, 3].map(i => 600 - (4 * CHIP_W + 3 * CHIP_GAP) / 2 + i * (CHIP_W + CHIP_GAP));   // 112..
const chip = (i, key, name, value) => P.chip({ key, x: CHIP_X[i], y: CHIP_Y, w: CHIP_W, h: CHIP_H, name, value });

// The client address rides the outer legs, beside each vertical: left of the Node-1 leg, right of the
// Node-3 leg, and it emerges once clear of the balancer bottom. Hold 0 retires it on arrival.
const ridingLabel = makeRidingLabel({ role: 'network', outMs: 170, hold: 0, emergeMode: true });
const tag = (p) => F.tag({ fn: ridingLabel, text: 'src 198.51.100.9', emerge: 300, ...p });
// The 440 unit outer legs would take routeDur 978 and the tag would retire before it is read, so a
// TAGGED ball rides them near the catalog median speed instead (M-12, PACING in motion.test).
const LEG_DUR = 1500;

// Per-step outcome notes stand over each Node top face, on the side of its lane the tag does not use,
// NOTE_DX off it: the arrival ring (r 9, scale 3) has faded to a quarter by the time it reaches 20.
const NOTE_DX = 20;
const note = (key, i, side) => P.wire({ key, x: NODE_CX[i] + side * NOTE_DX, y: NODE_Y - 10, anchor: side > 0 ? 'start' : 'end' });

const pod = (i, name, ip) => P.pod({
  key: `pod${i + 1}`, innerKey: `pod${i + 1}Box`, x: POD_X[i], y: POD_Y, w: POD_W, h: POD_H,
  label: `Pod ${name}`, sublabel: ip, inner: { dx: 14, dy: 26, w: POD_W - 28, h: 44, label: 'app', sublabel: 'eth0' },
});
const share = (i) => P.chip({ key: `share${i + 1}`, x: POD_X[i], y: SHARE_Y, w: POD_W, h: SHARE_H, name: 'share', value: 'none' });

// The list order IS the append order, which is the z-order: Node frames, Pods and their share chips
// in back, then the actor tier, then the lanes and their notes, then the Service strip and the packets.
export const SCENE = {
  'aria-label': 'externalTrafficPolicy Cluster versus Local: a cloud balancer fans connections over three Nodes running two, one and no Pods of web. Under Cluster a Node forwards to a Pod on any Node and SNATs the client address even when it serves the connection itself. Under Local each Node serves only its own Pods and keeps the client IP, a Node with none drops the traffic until healthCheckNodePort probes steer the balancer away from it, and a balancer that cannot weight its targets then splits load per Node, a quarter to each Pod on Node-1 and half to the Pod on Node-2',
  parts: [
    P.defs(),
    P.node({ key: 'node1', x: NODE_X[0], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'node2', x: NODE_X[1], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2' }),
    P.node({ key: 'node3', x: NODE_X[2], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-3' }),
    // In the middle of the empty frame, clear of the ring a ball leaves on its top face.
    P.tag({ x: NODE_CX[2], y: NODE_CY + 4, text: 'no Pod web runs here' }),
    pod(0, 'web-1', '10.244.1.5'), pod(1, 'web-2', '10.244.1.6'), pod(2, 'web-3', '10.244.2.7'),
    share(0), share(1), share(2),
    P.box({ key: 'client', x: ACTOR_X, y: CLIENT_Y, w: ACTOR_W, h: ACTOR_H, label: 'External client', sublabel: 'src 198.51.100.9' }),
    P.box({ key: 'lb', x: ACTOR_X, y: LB_Y, w: ACTOR_W, h: ACTOR_H, label: 'Cloud LoadBalancer', sublabel: 'targets every Node' }),
    P.arrow({ from: C_LANE[0], to: C_LANE[1], dashed: true, dim: true }),
    // All three Node legs are drawn though a step rides one: the balancer targets every Node.
    P.lane({ points: TO_N1, dashed: true, dim: true }),
    P.arrow({ from: TO_N2[0], to: TO_N2[1], dashed: true, dim: true }),
    P.lane({ points: TO_N3, dashed: true, dim: true }),
    P.arrow({ from: CROSS[0], to: CROSS[1], dashed: true, dim: true }),
    note('n1', 0, 1), note('n2', 1, 1), note('n3', 2, -1),
    chip(0, 'modeChip', 'externalTrafficPolicy', 'Cluster'),
    chip(1, 'srcChip', 'client src IP', 'none'),
    chip(2, 'hopChip', 'extra hop', 'none'),
    chip(3, 'hcChip', 'healthCheckNodePort', 'none'),
    P.packets(),
  ],
  // The inner app boxes are keys, not pod groups: the pod-group list only resets inline pulse strokes.
  reset: {
    keys: ['client', 'lb', 'modeChip', 'srcChip', 'hopChip', 'hcChip', 'share1', 'share2', 'share3', 'pod1Box', 'pod2Box', 'pod3Box'],
    pods: ['pod1', 'pod2', 'pod3'],
  },
};

const HC_PORT = '32021';
const ALL_NODES = 'targets every Node', HEALTHY = 'healthy: Node-1, Node-2';
// The Service fields and the last connection readouts, stated whole on every step.
const fields = (mode, src, hop, hc) => ({ modeChip: mode, srcChip: src, hopChip: hop, hcChip: hc });
// What each Pod takes of the connections the balancer sends, stated whole on every step.
const shares = (a, b, c) => ({ share1: a, share2: b, share3: c });
const THIRDS = shares('33%', '33%', '33%'), LOCAL_ALL = shares('17%', '17%', '33%'), PER_NODE = shares('25%', '25%', '50%');
const SHARE_KEYS = ['share1', 'share2', 'share3'];
// Probes leave 500 apart so the three answers land in turn and each is read where it lands.
const PROBE_GAP = 500;
// Connections leave the client 600 apart: on its 700ms lane two balls then share it for 100ms only.
const SPREAD = 600;

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { ...fields('Cluster', 'none', 'none', 'none'), ...shares('none', 'none', 'none') },
    sublabels: { lb: ALL_NODES },
  },
  {
    id: 'cluster',
    // Motion: lead 800, the client lane 700, a 100 beat, the Node-3 leg at LEG_DUR, a 100 beat, the
    // cross-Node hop 700, then the Pod blink 900: span 4800.
    duration: 5200,
    narration: 'Service web is a LoadBalancer under the default externalTrafficPolicy Cluster, so every Node accepts its traffic. The balancer picks Node-3, which runs no Pod web. Node-3 SNATs the connection to its own address and forwards it across the cluster network to Pod web-3 on Node-2. Spread at random over all ready Pods, each takes about a third.',
    chips: { ...fields('Cluster', 'lost (SNAT)', 'yes', 'none'), ...THIRDS },
    sublabels: { lb: ALL_NODES },
    wires: { n3: 'SNAT · forwarded' },
    lit: ['client'],
    // The animated path says the Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['pod3Box'],
    // The readouts are what Pod web-3 receives, so they hold the idle none until the hop lands on it.
    rewind: { chips: { ...fields('Cluster', 'none', 'none', 'none'), ...shares('none', 'none', 'none') }, wires: { n3: '' } },
    flow: [
      F.segment({ from: C_LANE[0], to: C_LANE[1], delay: BEAT.lead, name: 'entry', lights: ['lb'] }),
      F.route({ points: TO_N3, after: 'entry', dur: LEG_DUR, name: 'toN3' }),
      tag({ points: TO_N3, after: 'entry', dur: LEG_DUR, dx: 54 }),
      F.set({ at: 'toN3', wires: { n3: 'SNAT · forwarded' } }),
      F.segment({ from: CROSS[0], to: CROSS[1], after: 'toN3', name: 'hop', lights: ['srcChip', 'hopChip', ...SHARE_KEYS] }),
      F.pulse({ pod: 'pod3', at: 'hop' }),
      F.set({ at: 'hop', chips: { srcChip: 'lost (SNAT)', hopChip: 'yes', ...THIRDS } }),
    ],
  },
  {
    id: 'cluster-snat',
    // Motion: lead 800, the client lane 700, a 100 beat, the Node-1 leg at LEG_DUR, then the Pod blink 900.
    duration: 4300,
    narration: 'The SNAT is not only for forwarded traffic. The next connection lands on Node-1 and Pod web-1 on that same Node serves it, yet under Cluster its source is still replaced with a Node-1 address. The Pod never sees 198.51.100.9, so source IP allowlists and access logs lose the client, and a forwarded connection also pays an extra hop.',
    chips: { ...fields('Cluster', 'lost (SNAT)', 'no', 'none'), ...THIRDS },
    sublabels: { lb: ALL_NODES },
    wires: { n1: 'SNAT · served locally' },
    lit: ['client'],
    // The animated path says the Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['pod1Box'],
    rewind: { chips: { hopChip: 'yes' }, wires: { n1: '' } },
    flow: [
      F.segment({ from: C_LANE[0], to: C_LANE[1], delay: BEAT.lead, name: 'entry', lights: ['lb'] }),
      F.route({ points: TO_N1, after: 'entry', dur: LEG_DUR, name: 'toN1', lights: ['srcChip', 'hopChip'] }),
      tag({ points: TO_N1, after: 'entry', dur: LEG_DUR, dx: -54 }),
      F.pulse({ pod: 'pod1', at: 'toN1' }),
      F.set({ at: 'toN1', chips: { hopChip: 'no' }, wires: { n1: 'SNAT · served locally' } }),
    ],
  },
  {
    id: 'local',
    // Motion: lead 800, the client lane 700, the Node-1 leg at LEG_DUR landing at 3100 and its Pod
    // blink. The second connection leaves 700 behind the first and dies on the Node-3 face at 4600.
    duration: 5400,
    narration: 'With externalTrafficPolicy Local a Node serves only its own Pods, forwards nothing to other Nodes and does no SNAT: Pod web-2 sees 198.51.100.9. The API server allocates healthCheckNodePort 32021, but until the balancer acts on it Node-3 still gets a third of connections and, with no local Pod, drops them. Pods web-1 and web-2 split a third.',
    chips: { ...fields('Local', 'preserved', 'no', HC_PORT), ...LOCAL_ALL },
    sublabels: { lb: ALL_NODES },
    wires: { n1: 'client IP kept', n3: 'no local Pod · dropped' },
    lit: ['client', 'modeChip', 'hcChip'],
    // The animated path says the Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['pod2Box'],
    // The client address and the shares are outcomes of the two connections, the policy and its port
    // are the premise of the step.
    rewind: { chips: { srcChip: 'lost (SNAT)', ...THIRDS }, wires: { n1: '', n3: '' } },
    flow: [
      F.segment({ from: C_LANE[0], to: C_LANE[1], delay: BEAT.lead, name: 'entry', lights: ['lb'] }),
      F.route({ points: TO_N1, after: 'entry', dur: LEG_DUR, name: 'toN1', lights: ['srcChip'] }),
      tag({ points: TO_N1, after: 'entry', dur: LEG_DUR, dx: -54 }),
      F.pulse({ pod: 'pod2', at: 'toN1' }),
      F.set({ at: 'toN1', chips: { srcChip: 'preserved' }, wires: { n1: 'client IP kept' } }),
      F.segment({ from: C_LANE[0], to: C_LANE[1], after: 'entry', plus: 700, name: 'entry2' }),
      // Pod web-3 keeps its third, so only the two Node-1 shares are cued (P-09a).
      F.route({ points: TO_N3, after: 'entry2', dur: LEG_DUR, name: 'drop', lights: ['share1', 'share2'] }),
      tag({ points: TO_N3, after: 'entry2', dur: LEG_DUR, dx: 54 }),
      F.set({ at: 'drop', chips: LOCAL_ALL, wires: { n3: 'no local Pod · dropped' } }),
    ],
  },
  {
    id: 'healthcheck',
    // Motion: three probes leave the lit balancer PROBE_GAP apart from lead 800, the Node-3 one lands
    // last at 2778 and its ring closes near 3340.
    duration: 3800,
    narration: 'The balancer probes /healthz on port 32021 of every Node. A healthy kube-proxy answers from its count of ready local endpoints: 200 from Node-1 with two and from Node-2 with one, 503 from Node-3 with none. The balancer marks Node-3 unhealthy and sends new connections only to Node-1 and Node-2.',
    chips: { ...fields('Local', 'preserved', 'no', HC_PORT), ...LOCAL_ALL },
    sublabels: { lb: HEALTHY },
    wires: { n1: '200 · localEndpoints 2', n2: '200 · localEndpoints 1', n3: '503 · localEndpoints 0' },
    lit: ['lb', 'hcChip'],
    // Each answer is held back until its probe lands, and the balancer retargets on the last one.
    rewind: { sublabels: { lb: ALL_NODES }, wires: { n1: '', n2: '', n3: '' } },
    flow: [
      F.route({ points: TO_N1, delay: BEAT.lead, name: 'p1' }),
      F.set({ at: 'p1', wires: { n1: '200 · localEndpoints 2' } }),
      F.segment({ from: TO_N2[0], to: TO_N2[1], delay: BEAT.lead + PROBE_GAP, name: 'p2' }),
      F.set({ at: 'p2', wires: { n2: '200 · localEndpoints 1' } }),
      F.route({ points: TO_N3, delay: BEAT.lead + 2 * PROBE_GAP, name: 'p3' }),
      F.set({ at: 'p3', wires: { n3: '503 · localEndpoints 0' }, sublabels: { lb: HEALTHY } }),
    ],
  },
  {
    id: 'imbalance',
    // Motion: four connections leave the lit client SPREAD apart from lead 800, alternating Node-1 and
    // Node-2. The last lands on Node-2 at 4100 and its Pod blink ends at 5000.
    duration: 5400,
    narration: 'A balancer that cannot weight its targets spreads connections per Node, not per Pod. Node-1 and Node-2 get about half each, so the two Pods on Node-1 take a quarter apiece while Pod web-3 alone takes half. That uneven load is the second cost of Local. Spreading Pods evenly across Nodes, for example with topology spread constraints, reduces it.',
    chips: { ...fields('Local', 'preserved', 'no', HC_PORT), ...PER_NODE },
    sublabels: { lb: HEALTHY },
    wires: { n1: '2 Pods · half', n2: '1 Pod · half', n3: '503 · unhealthy' },
    lit: ['client'],
    // The animated path says each Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['pod1Box', 'pod2Box', 'pod3Box'],
    rewind: { chips: LOCAL_ALL, wires: { n1: '', n2: '' } },
    // Only the first connection lights the balancer: repeated cues on one block read as arrivals it did not get.
    flow: [
      F.segment({ from: C_LANE[0], to: C_LANE[1], delay: BEAT.lead, name: 'e1', lights: ['lb'] }),
      F.route({ points: TO_N1, after: 'e1', name: 'c1' }),
      F.pulse({ pod: 'pod1', at: 'c1' }),
      F.segment({ from: C_LANE[0], to: C_LANE[1], delay: BEAT.lead + SPREAD, name: 'e2' }),
      F.segment({ from: TO_N2[0], to: TO_N2[1], after: 'e2', name: 'c2' }),
      F.pulse({ pod: 'pod3', at: 'c2' }),
      F.segment({ from: C_LANE[0], to: C_LANE[1], delay: BEAT.lead + 2 * SPREAD, name: 'e3' }),
      F.route({ points: TO_N1, after: 'e3', name: 'c3' }),
      F.pulse({ pod: 'pod2', at: 'c3' }),
      F.set({ at: 'c3', wires: { n1: '2 Pods · half' } }),
      F.segment({ from: C_LANE[0], to: C_LANE[1], delay: BEAT.lead + 3 * SPREAD, name: 'e4' }),
      F.segment({ from: TO_N2[0], to: TO_N2[1], after: 'e4', name: 'c4', lights: SHARE_KEYS }),
      F.pulse({ pod: 'pod3', at: 'c4' }),
      F.set({ at: 'c4', chips: PER_NODE, wires: { n2: '1 Pod · half' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
