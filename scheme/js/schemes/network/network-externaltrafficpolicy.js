import { P, F, defineCard, makeRidingLabel, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-externaltrafficpolicy


const MID_X = 600;

const CLIENT_W = 240, CLIENT_H = 58, CLIENT_Y = 40;
const LB_W = 300, LB_H = 74, LB_Y = 134;              // 36 below the client
const NODE_W = 360, NODE_H = 188, NODE_Y = 280;       // 72 below the LB, leaving room for the fan bus
const POD_W = 210, POD_H = 114;                       // the standard pod shell
const CHIP_Y = 566, CHIP_H = 34;

const CLIENT_X = MID_X - CLIENT_W / 2;                // 480
const CLIENT_BOTTOM = CLIENT_Y + CLIENT_H;            // 98
const LB_X = MID_X - LB_W / 2;                        // 450
const LB_BOTTOM = LB_Y + LB_H;                        // 208

const NODE_GAP = 120;
const N1_X = MID_X - NODE_GAP / 2 - NODE_W;           // 180
const N2_X = MID_X + NODE_GAP / 2;                    // 660
const N1_CX = N1_X + NODE_W / 2;                      // 360
const N2_CX = N2_X + NODE_W / 2;                      // 840
const NODE_BOTTOM = NODE_Y + NODE_H;                  // 468

// The pod is centred in the Node-1 block itself, both ways: on N1_CX horizontally, and on the node
// rect centre vertically, so the clearance above and below it is equal (37 each).
const POD_X = N1_CX - POD_W / 2;                      // 255
const POD_Y = NODE_Y + (NODE_H - POD_H) / 2;          // 317

const BUS_Y = (LB_BOTTOM + NODE_Y) / 2;               // 244, the horizontal bus the fan splits on
const UNDER_Y = NODE_BOTTOM + 46;                     // 514, the underlay lane between the Nodes

const SCHEME_LEFT = N1_X;                             // 180
const SCHEME_RIGHT = N2_X + NODE_W;                   // 1020

// Each static wire and the packet that rides it share the same points array.
const C_WIRE = [[MID_X, CLIENT_BOTTOM], [MID_X, LB_Y]];
const TO_N1 = [[MID_X, LB_BOTTOM], [MID_X, BUS_Y], [N1_CX, BUS_Y], [N1_CX, NODE_Y]];
const TO_N2 = [[MID_X, LB_BOTTOM], [MID_X, BUS_Y], [N2_CX, BUS_Y], [N2_CX, NODE_Y]];
const CROSS = [[N2_CX, NODE_BOTTOM], [N2_CX, UNDER_Y], [N1_CX, UNDER_Y], [N1_CX, NODE_BOTTOM]]; // Node-2 -> underlay -> Node-1

// The tag that rides a ball on this card: emergeMode floats each address out of the block the ball
// leaves, and hold 0 retires it on arrival so the SNAT tag on the second leg is read on its own.
const ridingLabel = makeRidingLabel({ role: 'network', outMs: 170, hold: 0, emergeMode: true });
const tag = (p) => F.tag({ fn: ridingLabel, ...p });

// The Node-to-Node lane is what the POLICY decides, so its shade is a step field: Local never
// forwards to another Node, and a bright lane under that sentence contradicts it.
const CROSS_LIVE = { crossWire: 1 };
const CROSS_OFF = { crossWire: OPACITY.notready };

// Gap between the two health probes. They share the first 36 units of the fan, which a ball clears in
// 80ms, so this is the read gap rather than a collision gap: two answers landing in turn.
const PROBE_GAP = 500;

// The list order IS the append order, which is the z-order: the Node frames and the Pod in back,
// then the client and the LB, then the wires and their notes, then chips, then the packet layer.
export const SCENE = {
  'aria-label': 'ExternalTrafficPolicy Cluster versus Local: Cluster forwards to a backend on any Node but SNATs away the client IP, while Local keeps the client IP and avoids the extra hop at the cost of dropping traffic on Nodes with no local backend',
  parts: [
    P.defs(),
    P.node({ key: 'node1', x: N1_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1   ·   has local backend' }),
    P.node({ key: 'node2', x: N2_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2   ·   no local backend' }),
    P.pod({
      key: 'podW', innerKey: 'podWBox', x: POD_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Pod web', sublabel: '10.244.1.5',
      inner: { dx: 20, dy: 34, w: POD_W - 40, h: 52, label: 'app', sublabel: 'eth0' },
    }),
    P.box({ key: 'client', x: CLIENT_X, y: CLIENT_Y, w: CLIENT_W, h: CLIENT_H, label: 'External client', sublabel: 'src 198.51.100.9' }),
    P.box({ key: 'lb', x: LB_X, y: LB_Y, w: LB_W, h: LB_H, label: 'LoadBalancer', sublabel: 'targets node ports' }),
    // No inline src-IP text on the client wire: the address RIDES the ball (ridingLabel), so each leg is
    // tagged with the source it actually carries. The client box sublabel still states the origin address.
    P.arrow({ from: C_WIRE[0], to: C_WIRE[1], dashed: true, dim: true }),
    P.lane({ points: TO_N1, dashed: true, dim: true }),
    P.lane({ points: TO_N2, dashed: true, dim: true }),
    P.lane({ key: 'crossWire', points: CROSS, dashed: true, dim: true }),
    // What the healthCheckNodePort reports on each Node. Both sit on the same baseline so they read as a
    // pair, low enough to clear the Pod above (sublabel baseline 423) and the crossWire arrowhead below.
    P.wire({ key: 'n1', x: N1_CX, y: 448 }),
    P.wire({ key: 'n2', x: N2_CX, y: 448 }),
    // The four chips span the scheme 1:1, from the Node-1 left edge to the Node-2 right edge, with even
    // 20px gaps. Widths are tuned to their content (externalTrafficPolicy carries the longest name).
    P.chip({ key: 'modeChip', x: SCHEME_LEFT, y: CHIP_Y, w: 240, h: CHIP_H, name: 'externalTrafficPolicy', value: 'Cluster' }),
    // src IP and extra hop are OUTCOMES of a request, so they read none until traffic actually flows.
    // Widths are still sized for their widest value (lost (SNAT) / yes), not for none.
    P.chip({ key: 'srcChip', x: 440, y: CHIP_Y, w: 225, h: CHIP_H, name: 'client src IP', value: 'none' }),
    P.chip({ key: 'hopChip', x: 685, y: CHIP_Y, w: 135, h: CHIP_H, name: 'extra hop', value: 'none' }),
    P.chip({ key: 'hcChip', x: 840, y: CHIP_Y, w: SCHEME_RIGHT - 840, h: CHIP_H, name: 'healthCheck', value: 'unused' }),
    P.packets(),
  ],
  // podWBox is listed so its .highlight is cleared every step: clearPodHighlight only resets inline
  // strokes, so without it a highlight set in a reduced-replay block leaks into later steps.
  reset: {
    keys: ['client', 'lb', 'modeChip', 'srcChip', 'hopChip', 'hcChip', 'podWBox'],
    pods: ['podW'],
  },
};

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    opacity: CROSS_LIVE,
    // Cluster is the default policy, so the mode chip is true from the start. Its consequences are
    // not: nothing has been SNAT-ed or hopped yet.
    chips: { modeChip: 'Cluster', srcChip: 'none', hopChip: 'none', hcChip: 'unused' },
  },
  {
    id: 'cluster',
    // Motion: client entry leg, fan(700, the floor) + beat(100) + underlay(1271), pulse(900), span 3771.
    // Every step here OPENS with a client hitting the external address, so that first leg rides.
    duration: 4200,
    narration: 'With the default policy Cluster, every Node accepts the traffic even with no local Pod. The balancer happens to pick Node-2, which has no backend, so the Node SNATs the packet and forwards it across the cluster network to the Pod on Node-1. Load spreads evenly over every backend, wherever it runs.',
    chips: { modeChip: 'Cluster', srcChip: 'lost (SNAT)', hopChip: 'yes', hcChip: 'unused' },
    opacity: CROSS_LIVE,
    // The SNAT and the Node-to-Node hop both happen in THIS step, so their chips take their values
    // here. The next step is the one that highlights them and talks about what they cost.
    lit: ['srcChip', 'hopChip', 'modeChip'],
    // The animated path says the Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['podWBox'],
    // Both chips read what the Pod on Node-1 finally receives, so the animated path holds the idle
    // none until the SNAT-ed cross leg lands on it at 2871.
    rewind: { chips: { srcChip: 'none', hopChip: 'none' } },
    // Client to LB first, then LB -> Node-2 (no backend), then SNAT and forward across the underlay
    // to the Pod on Node-1. The ball is hidden inside Node-2 between the two legs.
    flow: [
      F.segment({ from: C_WIRE[0], to: C_WIRE[1], name: 'entry', lights: ['lb'] }),
      F.route({ points: TO_N2, after: 'entry', name: 'toN2' }),
      tag({ text: 'src 198.51.100.9', points: TO_N2, after: 'entry', emerge: 140 }),
      F.route({ points: CROSS, after: 'toN2', name: 'hop' }),
      // Node-2 SNAT-ed it, so the second leg carries the Node as its source, not the client.
      tag({ text: 'src Node-2 (SNAT)', points: CROSS, after: 'toN2', dy: 20 }),
      F.pulse({ pod: 'podW', at: 'hop' }),
      F.set({ at: 'hop', chips: { srcChip: 'lost (SNAT)', hopChip: 'yes' } }),
    ],
  },
  {
    id: 'cluster-cost',
    // Reflective step: no packet at all, so the entry-leg change above does not reach it.
    duration: 2300,
    narration: 'That convenience has a cost. The extra Node-to-Node hop adds latency, and because Node-2 had to SNAT, the Pod sees the packet as coming from the Node, not from 198.51.100.9. The real client IP is gone, which breaks source-IP allowlists and access logs.',
    chips: { modeChip: 'Cluster', srcChip: 'lost (SNAT)', hopChip: 'yes', hcChip: 'unused' },
    opacity: CROSS_LIVE,
    // Reflective beat: the cost chips just light, no flash.
    lit: ['srcChip', 'hopChip'],
  },
  {
    id: 'local',
    // Motion: entry(700) + the served leg to Node-1 (1500) + its pulse, then a SECOND connection
    // leaving at 1600 and dying on the Node-2 edge at 3100, whose ripple closes at 3660.
    duration: 3800,
    narration: 'Switching to externalTrafficPolicy Local changes the rules. A Node serves only from its own local Pods and never forwards to another Node, so the connection reaching Node-1 goes straight to its Pod with no SNAT and the true client IP 198.51.100.9 survives with no extra hop. A connection landing on Node-2 has no local Pod, and Local drops it.',
    chips: { modeChip: 'Local', srcChip: 'preserved', hopChip: 'no', hcChip: 'unused' },
    opacity: CROSS_OFF,
    // What each Node did with the connection it got. Both notes are the OUTCOME of a ball, so each is
    // written where its ball lands and neither pre-announces the other.
    wires: { n1: 'served by its local pod', n2: 'no local pod · dropped' },
    lit: ['modeChip', 'srcChip', 'hopChip'],
    // The animated path says the Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['podWBox'],
    rewind: { wires: { n1: '', n2: '' } },
    // Two connections, because Local has two outcomes: served on Node-1 with no SNAT, and stopped dead
    // on the Node-2 edge with nothing leaving it, which is how this category draws a drop.
    flow: [
      F.segment({ from: C_WIRE[0], to: C_WIRE[1], name: 'entry', lights: ['lb'] }),
      F.route({ points: TO_N1, after: 'entry', name: 'toN1' }),
      tag({ text: 'src 198.51.100.9', points: TO_N1, after: 'entry', emerge: 140 }),
      F.pulse({ pod: 'podW', at: 'toN1' }),
      F.set({ at: 'toN1', wires: { n1: 'served by its local pod' } }),
      F.segment({ from: C_WIRE[0], to: C_WIRE[1], after: 'toN1', name: 'entry2' }),
      F.route({ points: TO_N2, after: 'entry2', name: 'drop' }),
      tag({ text: 'src 198.51.100.9', points: TO_N2, after: 'entry2', emerge: 140 }),
      F.set({ at: 'drop', wires: { n2: 'no local pod · dropped' } }),
    ],
  },
  {
    id: 'healthcheck',
    // Motion: the two probes leave the balancer PROBE_GAP apart and answer at 700 and 1200, then the
    // steered connection leaves at 1300 and its Pod blink ends at 3700.
    duration: 3900,
    narration: 'But Local would silently drop traffic that lands on Node-2, which has no Pod to serve it. To avoid that, Local exposes a healthCheckNodePort that reports healthy only on Nodes with a local backend, so the load balancer stops sending to Node-2 and targets only Node-1.',
    chips: { modeChip: 'Local', srcChip: 'preserved', hopChip: 'no', hcChip: 'used' },
    opacity: CROSS_OFF,
    // The probe answers on BOTH Nodes, healthy only where a local backend exists. Showing only the
    // failing Node would assert the rule instead of demonstrating it.
    wires: { n1: 'health: 1 local pod', n2: 'health: 0 local pods' },
    lit: ['lb', 'hcChip'],
    // The animated path says the Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['podWBox'],
    // Each answer, and the chip that says the check is in play, are held back until a probe lands.
    rewind: { wires: { n1: '', n2: '' }, chips: { hcChip: 'unused' } },
    // The balancer probes BOTH Nodes and each Node answers where the probe lands. Only then does the
    // client connection go out, and it goes to Node-1 alone, which is what the answers bought.
    flow: [
      F.route({ points: TO_N1, name: 'p1' }),
      tag({ text: 'healthz probe', points: TO_N1, emerge: 140 }),
      F.set({ at: 'p1', wires: { n1: 'health: 1 local pod' }, chips: { hcChip: 'used' } }),
      F.route({ points: TO_N2, delay: PROBE_GAP, name: 'p2' }),
      tag({ text: 'healthz probe', points: TO_N2, delay: PROBE_GAP, emerge: 140 }),
      F.set({ at: 'p2', wires: { n2: 'health: 0 local pods' } }),
      F.segment({ from: C_WIRE[0], to: C_WIRE[1], after: 'p2', name: 'entry' }),
      F.route({ points: TO_N1, after: 'entry', name: 'toN1' }),
      tag({ text: 'src 198.51.100.9', points: TO_N1, after: 'entry', emerge: 140 }),
      F.pulse({ pod: 'podW', at: 'toN1' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
