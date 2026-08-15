import { P, F, defineCard, makeRidingLabel, shade, BEAT, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-internal-traffic-policy


const FLOW_Y = 405;

const SVC_X = 450, SVC_Y = 56, SVC_W = 300, SVC_H = 74;
const SVC_CX = SVC_X + SVC_W / 2;              // 600
const SVC_BOTTOM = SVC_Y + SVC_H;              // 130

const NODE_Y = 312, NODE_H = 186;
const NODE_BOTTOM = NODE_Y + NODE_H;           // 498
const N1_X = 40, N1_W = 700;
const N1_CX = N1_X + N1_W / 2;                 // 390, the axis the Service ownership line lands on
const N2_X = 780, N2_W = 380;

const POD_W = 190, POD_H = 104;
const POD_Y = FLOW_Y - POD_H / 2;              // 353
const CLIENT_X = 70;
const CLIENT_RIGHT = CLIENT_X + POD_W;         // 260
const KP_X = 300, KP_W = 180, KP_H = 68;
const KP_TOP = FLOW_Y - KP_H / 2;              // 371
const KP_RIGHT = KP_X + KP_W;                  // 480
const KP_CX = KP_X + KP_W / 2;                 // 390
const PODA_X = 530;                            // local backend, inside Node-1
const PODB_X = 875;                            // remote backend, inside Node-2
const PODB_CX = PODB_X + POD_W / 2;            // 970

const UNDER_Y = NODE_BOTTOM + 40;              // 538, the underlay lane between the Nodes
const CHIP_Y = 578, CHIP_H = 34;
const SCHEME_LEFT = N1_X;                      // 40
const SCHEME_RIGHT = N2_X + N2_W;              // 1160


// Each static wire and the ball that rides it share the same points array.
const TO_KP = [[CLIENT_RIGHT, FLOW_Y], [KP_X, FLOW_Y]];
const TO_LOCAL = [[KP_RIGHT, FLOW_Y], [PODA_X, FLOW_Y]];
// The DNAT happens inside kube-proxy, so the remote leg re-emerges BELOW it, on the Node-1 bottom edge:
// by the time the ball is on this path the packet has already left the Node.
const TO_REMOTE = [[KP_CX, NODE_BOTTOM], [KP_CX, UNDER_Y], [PODB_CX, UNDER_Y], [PODB_CX, NODE_BOTTOM]];
// Ownership marker from the Service down onto the Node-1 top edge, not into kube-proxy.
const OWN = [[SVC_CX, SVC_BOTTOM], [SVC_CX, 240], [N1_CX, 240], [N1_CX, NODE_Y]];

// The tag that rides a ball on this card, built once here and handed to every F.tag as `fn`: hold 0
// drops the ClusterIP the instant the ball reaches kube-proxy, so the DNAT-ed address stands alone.
const ridingLabel = makeRidingLabel({ role: 'network', outMs: 170, hold: 0 });
const tag = (p) => F.tag({ fn: ridingLabel, ...p });

const POD_INNER = { dx: 20, dy: 30, w: POD_W - 40, h: 46, label: 'app', sublabel: 'eth0' };

// The list order IS the append order, which is the z-order: the two Nodes in back, then the blocks
// inside them, then the Service, then wires + notes, then chips, then the packet layer on top.
export const SCENE = {
  'aria-label': 'internalTrafficPolicy Cluster versus Local: with Cluster the kube-proxy on the client Node programs every ready endpoint, so a call to the ClusterIP can be DNAT-ed to a backend on another Node and cross the cluster network. With Local it keeps only the endpoints on that same Node, so the packet never leaves it, and if the Node runs no backend at all the endpoint set is empty and kube-proxy drops the packets, so the caller hangs and times out, because Local has no fallback and no health check.',
  parts: [
    P.defs(),
    P.node({ key: 'node1', x: N1_X, y: NODE_Y, w: N1_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'node2', x: N2_X, y: NODE_Y, w: N2_W, h: NODE_H, label: 'Node-2' }),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: CLIENT_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Client Pod', sublabel: '10.244.1.5', inner: POD_INNER,
    }),
    P.box({ key: 'kproxy', x: KP_X, y: KP_TOP, w: KP_W, h: KP_H, label: 'kube-proxy', sublabel: 'on Node-1' }),
    P.pod({
      key: 'podA', innerKey: 'podABox', x: PODA_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Pod web', sublabel: '10.244.1.9', inner: POD_INNER,
    }),
    P.pod({
      key: 'podB', innerKey: 'podBBox', x: PODB_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Pod web', sublabel: '10.244.2.7', inner: POD_INNER,
    }),
    P.box({ key: 'svc', x: SVC_X, y: SVC_Y, w: SVC_W, h: SVC_H, label: 'Service web', sublabel: 'ClusterIP 10.96.0.20:80' }),
    P.arrow({ from: TO_KP[0], to: TO_KP[1], dashed: true, dim: true }),
    P.arrow({ key: 'localWire', from: TO_LOCAL[0], to: TO_LOCAL[1], dashed: true, dim: true }),
    P.lane({ key: 'remoteWire', points: TO_REMOTE, dashed: true, dim: true }),
    P.relation({ points: OWN, dash: '5 5' }),
    // What each backend is to the kube-proxy on Node-1. Both notes sit on one baseline under the Pods,
    // inside their Nodes, so they read as a pair that the policy flips.
    P.wire({ key: 'a', x: PODA_X + POD_W / 2, y: 480 }),
    P.wire({ key: 'b', x: PODB_CX, y: 480 }),
    P.chip({ key: 'policyChip', x: SCHEME_LEFT, y: CHIP_Y, w: 290, h: CHIP_H, name: 'internalTrafficPolicy', value: 'Cluster' }),
    P.chip({ key: 'scopeChip', x: 350, y: CHIP_Y, w: 300, h: CHIP_H, name: 'endpoints in scope', value: 'none' }),
    P.chip({ key: 'hopChip', x: 670, y: CHIP_Y, w: 210, h: CHIP_H, name: 'leaves Node', value: 'none' }),
    P.chip({ key: 'resultChip', x: 900, y: CHIP_Y, w: SCHEME_RIGHT - 900, h: CHIP_H, name: 'result', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: ['svc', 'kproxy', 'policyChip', 'scopeChip', 'hopChip', 'resultChip', 'clientBox', 'podABox', 'podBBox'],
    pods: ['client', 'podA', 'podB'],
  },
};

// A backend and the lane kube-proxy would reach it by are ONE thing: out of scope, the lane is not a
// route any more. Every step states all seven, or a dim set by one policy leaks into the next.
const ALL_UP = { node1: 1, client: 1, podA: 1, localWire: 1, podB: 1, node2: 1, remoteWire: 1 };
const REMOTE = ['podB', 'node2', 'remoteWire'];
const LOCAL = ['podA', 'localWire'];
const outOfScope = (keys) => ({ opacity: { ...ALL_UP, ...shade(keys, OPACITY.notready) } });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { policyChip: 'Cluster', scopeChip: 'none', hopChip: 'none', resultChip: 'none' },
    opacity: ALL_UP,
  },
  {
    id: 'cluster',
    // Motion: client pulse, the ball leaves at BEAT.afterPulse(800), reaches kube-proxy at 1500, the
    // remote leg runs 1600..3067, and the backend pulse (900) ends at 3967. The floor leaves a settle.
    duration: 4400,
    narration: 'With the default Cluster, kube-proxy on Node-1 programs every ready endpoint of the Service, on any Node. The client dials the ClusterIP and the packet is DNAT-ed to the backend on Node-2, so it leaves the Node and crosses the cluster network. Load spreads evenly over all backends, at the price of a cross-node, and possibly cross-zone, hop.',
    chips: { policyChip: 'Cluster', scopeChip: 'all ready (2)', hopChip: 'yes', resultChip: 'served by Node-2' },
    // Both backends are programmed, so both notes read as endpoints. This flow happens to take the
    // remote one.
    wires: { a: 'endpoint · local', b: 'endpoint · remote' },
    opacity: ALL_UP,
    lit: ['resultChip', 'svc', 'policyChip', 'scopeChip', 'hopChip'],
    // The animated path says the remote backend was served by PULSING it, which no lights list names.
    reducedLit: ['podBBox'],
    // Up-arrow: the client is the sender, so it pulses FIRST and the ball leaves at BEAT.afterPulse
    // carrying the ClusterIP. The DNAT happens inside kube-proxy, so the remote leg carries the Pod address.
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: TO_KP[0], to: TO_KP[1], delay: BEAT.afterPulse, name: 'toKp' }),
      tag({ text: 'dst 10.96.0.20:80', points: TO_KP, delay: BEAT.afterPulse, easing: 'linear' }),
      F.light({ targets: ['kproxy'], at: 'toKp' }),
      F.route({ points: TO_REMOTE, after: 'toKp', name: 'out' }),
      tag({ text: 'dst 10.244.2.7:8080', points: TO_REMOTE, after: 'toKp', dy: 20 }),
      F.pulse({ pod: 'podB', at: 'out' }),
    ],
  },
  {
    id: 'local',
    // Motion: client pulse, ball leaves at 800, lands on kube-proxy at 1500, the local leg runs
    // 1600..2300, and the backend pulse (900) ends at 3200.
    duration: 3600,
    narration: 'Set internalTrafficPolicy to Local and kube-proxy keeps only the endpoints that live on Node-1 itself. The same call to the same ClusterIP now goes to the local Pod, the packet never leaves the Node, and the cross-node hop is gone. This is how a Pod reaches the node-local agent of a DaemonSet, a log shipper or a per-node cache, without paying to cross the cluster.',
    chips: { policyChip: 'Local', scopeChip: 'node-local (1)', hopChip: 'no', resultChip: 'served by Node-1' },
    wires: { a: 'endpoint · in scope', b: 'endpoint · out of scope' },
    // The remote backend is no longer programmed on this Node, so it, its Node and the lane that
    // would have reached it go dim: out of scope is the whole point of Local.
    ...outOfScope(REMOTE),
    lit: ['resultChip', 'svc', 'policyChip', 'scopeChip', 'hopChip'],
    // The animated path says the local backend was served by PULSING it, which no lights list names.
    reducedLit: ['podABox'],
    // The DNAT resolves to the local Pod, so the ball leaves the FAR edge of kube-proxy and the
    // packet never leaves the Node.
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: TO_KP[0], to: TO_KP[1], delay: BEAT.afterPulse, name: 'toKp' }),
      tag({ text: 'dst 10.96.0.20:80', points: TO_KP, delay: BEAT.afterPulse, easing: 'linear' }),
      F.light({ targets: ['kproxy'], at: 'toKp' }),
      F.segment({ from: TO_LOCAL[0], to: TO_LOCAL[1], after: 'toKp', name: 'give' }),
      tag({ text: 'dst 10.244.1.9:8080', points: TO_LOCAL, after: 'toKp', easing: 'linear' }),
      F.pulse({ pod: 'podA', at: 'give' }),
    ],
  },
  {
    id: 'no-local-backend',
    // Motion: client pulse, ball leaves at 800 and lands on kube-proxy at 1500. Nothing leaves it: the
    // point of the step is the hop that does NOT happen.
    duration: 2900,
    narration: 'The catch is that Local has no fallback. If Node-1 runs no backend of its own the endpoint set is empty, kube-proxy has nothing to DNAT to, and it drops the packets rather than forwarding them to Node-2, so the caller just hangs until it times out. There is no health check to steer callers elsewhere, which is the real difference from externalTrafficPolicy, so Local is safe only when a backend is guaranteed on every Node, as a DaemonSet gives.',
    chips: { policyChip: 'Local', scopeChip: 'node-local (0)', hopChip: 'no', resultChip: 'traffic dropped' },
    wires: { a: 'no local backend', b: 'endpoint · out of scope' },
    // Node-1 has lost its backend and the remote one is still out of scope, so both Pods go dim, and
    // both lanes with them: there is nothing left for kube-proxy to send to.
    ...outOfScope([...LOCAL, ...REMOTE]),
    lit: ['policyChip', 'scopeChip', 'resultChip'],
    // The call is made exactly as before, and it dies at kube-proxy: the ball arrives, the box lights,
    // and no further ball leaves. The absent second hop is the whole point of the step.
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: TO_KP[0], to: TO_KP[1], delay: BEAT.afterPulse, name: 'toKp' }),
      tag({ text: 'dst 10.96.0.20:80', points: TO_KP, delay: BEAT.afterPulse, easing: 'linear' }),
      F.light({ targets: ['kproxy'], at: 'toKp' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
