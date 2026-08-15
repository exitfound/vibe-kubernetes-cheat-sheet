import { P, F, defineCard, BEAT, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-endpointslice-reconcile


const CTLR_TOP = 350;                       // top edge of the controller box
const SLICE_BOTTOM = 290;                   // bottom edge of the lowest endpoint row
const WRITE_PATH = [[600, CTLR_TOP], [600, SLICE_BOTTOM]];   // controller -> slice, straight up
const SLICE_RIGHT = 790, KPROXY_LEFT = 840; // slice right edge, kube-proxy left edge
const READ_PATH = [[SLICE_RIGHT, 222], [KPROXY_LEFT, 222]];  // slice -> kube-proxy, straight right

const POD_Y = 488, POD_W = 250, POD_H = 128;
const POD_INNER = { dx: 20, dy: 30, w: POD_W - 40, h: 48, label: 'app', sublabel: 'eth0' };

const livePod = (key, x, ip) => P.pod({
  key, innerKey: `${key}Box`, x, y: POD_Y, w: POD_W, h: POD_H,
  label: 'Pod app=web', sublabel: ip, inner: POD_INNER,
});

// The list order IS the append order, which is the z-order: the three tiers of blocks, then the
// endpoint rows, then the wires above them, then the packet layer carrying the ball and its tag.
export const SCENE = {
  'aria-label': 'Service and EndpointSlice reconciliation: the controller watches Pods matching the Service selector and writes the ready ones into an EndpointSlice that kube-proxy consumes, with readiness gating membership',
  parts: [
    P.defs(),
    // Top: the Service owns the selector and names the slice, but holds no addresses.
    P.box({ key: 'service', x: 410, y: 52, w: 380, h: 70, label: 'Service web', sublabel: 'selector app=web · holds no addresses' }),
    // Right: kube-proxy, the consumer that reads the slice. Lower-centre: the controller, the
    // engine that watches Pods and writes the slice.
    P.box({ key: 'kproxy', x: KPROXY_LEFT, y: 178, w: 280, h: 88, label: 'kube-proxy', sublabel: 'reads the slice' }),
    P.box({ key: 'ctlr', x: 410, y: CTLR_TOP, w: 380, h: 90, label: 'EndpointSlice controller', sublabel: 'watches app=web, writes endpoints' }),
    // Bottom: the live Pods (the source of truth).
    livePod('podA', 90, '10.244.1.5 · ready'),
    livePod('podB', 475, '10.244.2.7 · ready'),
    livePod('podC', 860, '10.244.3.9 · notReady'),
    // Centre: the EndpointSlice (the derived list). One row per matching Pod.
    P.chip({ key: 'ep1', x: 410, y: 152, w: 380, h: 42, name: 'endpoint', value: '(empty)' }),
    P.chip({ key: 'ep2', x: 410, y: 200, w: 380, h: 42, name: 'endpoint', value: '(empty)' }),
    P.chip({ key: 'ep3', x: 410, y: 248, w: 380, h: 42, name: 'endpoint', value: '(empty)' }),
    // A Service NAMES its slice through a selector and a controller WATCHES a Pod set: both are
    // standing RELATIONSHIPS, not messages, so neither takes an arrowhead.
    P.relation({ points: [[600, 122], [600, 152]] }),
    P.arrow({ from: WRITE_PATH[0], to: WRITE_PATH[1], dashed: true, dim: true }),
    P.arrow({ from: READ_PATH[0], to: READ_PATH[1], dashed: true, dim: true }),
    P.relation({ points: [[600, 440], [600, 484]] }),
    P.packets(),
  ],
  // The inner pod boxes (podABox etc.) light in the reduced-motion end-states, so they must be
  // cleared here too or a replayed prior step leaks its .highlight into the next one.
  reset: {
    keys: ['service', 'ctlr', 'kproxy', 'ep1', 'ep2', 'ep3', 'podABox', 'podBBox', 'podCBox'],
    pods: ['podA', 'podB', 'podC'],
  },
};

// Pod C is notReady from the first frame and Pod B only from its own step onward, so BOTH shades
// are stated as fields on every step rather than restored by the reset prologue.
const B_READY = { podB: 1, podC: OPACITY.notready };
const B_DROPPED = { podB: OPACITY.notready, podC: OPACITY.notready };

const EMPTY = '(empty)';
const EP1_READY = '10.244.1.5:8080 · ready';
const EP2_READY = '10.244.2.7:8080 · ready';
const EP2_DROPPED = '10.244.2.7 · dropped (notReady)';
const EP3_NOTREADY = '10.244.3.9 · notReady';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { ep1: EMPTY, ep2: EMPTY, ep3: EMPTY },
    podSublabels: { podB: '10.244.2.7 · ready' },
    opacity: B_READY,
  },
  {
    id: 'selector',
    duration: 2200,
    narration: 'The Service holds only a selector, app=web, and no addresses of its own. Every Pod carrying that label is a candidate backend, here three of them, but a Pod has to be Ready before it should receive traffic. Two are Ready, one is not.',
    chips: { ep1: EMPTY, ep2: EMPTY, ep3: EMPTY },
    podSublabels: { podB: '10.244.2.7 · ready' },
    opacity: B_READY,
    lit: ['service'],
    // The animated path says the two candidates MATCHED by pulsing them, which no cue names.
    reducedLit: ['podABox', 'podBBox'],
    // The Ready candidates pulse together so the selector match reads clearly.
    flow: [
      F.pulse({ pod: 'podA' }),
      F.pulse({ pod: 'podB' }),
    ],
  },
  {
    id: 'reconcile',
    duration: 2700,
    narration: 'The EndpointSlice controller watches every matching Pod and writes the Ready ones into the slice as an IP and port, one endpoint each. So 10.244.1.5 and 10.244.2.7 are added. The third Pod is recorded too, but flagged notReady, so it stays out of the serving set.',
    chips: { ep1: EP1_READY, ep2: EP2_READY, ep3: EP3_NOTREADY },
    podSublabels: { podB: '10.244.2.7 · ready' },
    opacity: B_READY,
    lit: ['ctlr', 'ep3'],
    // Both Ready endpoints are committed in this write and light together, so the tag names the
    // set it commits rather than a single address.
    flow: [
      F.pulse({ pod: 'podA' }),
      F.pulse({ pod: 'podB' }),
      F.segment({ from: WRITE_PATH[0], to: WRITE_PATH[1], delay: BEAT.afterPulse, name: 'write' }),
      F.tag({ text: 'ready endpoints', points: WRITE_PATH, delay: BEAT.afterPulse, easing: 'linear' }),
      F.light({ targets: ['ep1', 'ep2'], at: 'write' }),
    ],
  },
  {
    id: 'readiness',
    duration: 2500,
    narration: 'Membership is gated on readiness, not liveness. When Pod 10.244.2.7 starts failing its readiness probe, the controller flips that endpoint to notReady and drops it from the serving set, so no new traffic is sent to it. The container is never restarted, and it rejoins the moment it reports Ready again.',
    chips: { ep1: EP1_READY, ep2: EP2_DROPPED, ep3: EP3_NOTREADY },
    podSublabels: { podB: '10.244.2.7 · notReady' },
    // Pod B is what this step flips, so its shade is static end-state, not motion.
    opacity: B_DROPPED,
    lit: ['ctlr'],
    // The animated path says Pod B was the one that flipped by pulsing it, which no cue names.
    reducedLit: ['podBBox'],
    // Pod B pulses FROM its dimmed state: a plain pulsePod ramps from the resting tint and a Pod
    // already at 0.40 barely registers it, so it takes the dim variant with its own opacity flash.
    flow: [
      F.pulse({ pod: 'podB', dim: true, from: OPACITY.notready }),
      F.segment({ from: WRITE_PATH[0], to: WRITE_PATH[1], delay: BEAT.afterPulse, name: 'upd' }),
      F.tag({ text: '10.244.2.7 · notReady', points: WRITE_PATH, delay: BEAT.afterPulse, easing: 'linear' }),
      F.light({ targets: ['ep2'], at: 'upd' }),
    ],
  },
  {
    id: 'consume',
    duration: 2300,
    narration: 'The kube-proxy on every Node watches the EndpointSlice, never the Pods directly. When the slice changes it reprograms the Node dataplane so traffic to the Service only ever lands on a currently Ready endpoint. The slice is the contract between what is healthy and where packets go.',
    chips: { ep1: EP1_READY, ep2: EP2_DROPPED, ep3: EP3_NOTREADY },
    podSublabels: { podB: '10.244.2.7 · notReady' },
    opacity: B_DROPPED,
    lit: ['ep1'],
    // kube-proxy reads the slice (one clean hop) and lights on arrival. The ball carries a short
    // read tag so the direction of the pull reads clearly.
    flow: [
      F.segment({ from: READ_PATH[0], to: READ_PATH[1], name: 'read' }),
      F.tag({ text: 'reads slice', points: READ_PATH, easing: 'linear' }),
      F.light({ targets: ['kproxy'], at: 'read' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
