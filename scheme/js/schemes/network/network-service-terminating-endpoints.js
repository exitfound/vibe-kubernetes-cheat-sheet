import { P, F, defineCard, makeRidingLabel, BEAT, FADE, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-service-terminating-endpoints


const FLOW_Y = 326;                     // center line: client and kube-proxy are centred on it
const CLIENT_EDGE = 255;                // right edge of the client Pod shell
const KP_LEFT = 440, KP_RIGHT = 660;    // kube-proxy box left / right edges
const POD_LEFT = 880, POD_W = 210, POD_H = 104;
// Backends are the exact vertical mirror of each other about FLOW_Y (326 +/- 158), so both sit
// symmetric above and below the kube-proxy block.
const PODA_CY = 168, PODC_CY = 484;
const BUS_X = 770;                       // shared vertical bus: the fans turn here so each one enters
                                         // its Pod horizontally, a right-angle approach not a diagonal
const PULSE_MS = 900;                    // PULSE_POD.ms: web-c fades only after its pulse completes
const CONN_GAP = 540;                    // gap between two connections off one client, the stagger
                                         // `network-traffic-distribution` uses for the same sentence
const LANE  = [[CLIENT_EDGE, FLOW_Y], [KP_LEFT, FLOW_Y]];                                              // client -> kube-proxy
const FAN_A = [[KP_RIGHT, FLOW_Y - 14], [BUS_X, FLOW_Y - 14], [BUS_X, PODA_CY], [POD_LEFT, PODA_CY]];  // kube-proxy -> web-a
const FAN_C = [[KP_RIGHT, FLOW_Y + 14], [BUS_X, FLOW_Y + 14], [BUS_X, PODC_CY], [POD_LEFT, PODC_CY]];  // kube-proxy -> web-c

// The tag that rides a ball on this card, built once here and handed to every F.tag as `fn`: linear by
// default because the lane tags ride segment balls, and each fan tag overrides back to ease-in-out.
const ridingLabel = makeRidingLabel({ role: 'network', easing: 'linear' });
const tag = (p) => F.tag({ fn: ridingLabel, ...p });

const BACKEND_INNER = { dx: 20, dy: 30, w: POD_W - 40, h: 48, label: 'app', sublabel: 'eth0' };

// The list order IS the append order, which is the z-order: boxes and Pods, then wires ABOVE them,
// then chips, then the packet layer on top.
export const SCENE = {
  'aria-label': 'Terminating endpoints and connection draining: when a backing Pod is deleted its endpoint is flagged terminating so kube-proxy stops sending new connections to it while in-flight connections keep draining through the grace period, then the endpoint is removed',
  parts: [
    P.defs(),
    P.box({ key: 'kproxy', x: KP_LEFT, y: 286, w: KP_RIGHT - KP_LEFT, h: 80, label: 'kube-proxy', sublabel: 'routes new connections' }),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: 70, y: 270, w: 185, h: 112,
      label: 'Client Pod', sublabel: '10.244.1.5',
      inner: { dx: 20, dy: 30, w: 145, h: 48, label: 'app', sublabel: 'eth0' },
    }),
    P.pod({
      key: 'podA', innerKey: 'podABox', x: POD_LEFT, y: PODA_CY - POD_H / 2, w: POD_W, h: POD_H,
      label: 'Pod web-a', sublabel: '10.244.2.7 · ready', inner: BACKEND_INNER,
    }),
    P.pod({
      key: 'podC', innerKey: 'podCBox', x: POD_LEFT, y: PODC_CY - POD_H / 2, w: POD_W, h: POD_H,
      label: 'Pod web-c', sublabel: '10.244.3.9 · ready', inner: BACKEND_INNER,
    }),
    P.arrow({ from: LANE[0], to: LANE[1], dashed: true, dim: true }),
    P.lane({ points: FAN_A, dashed: true, dim: true }),
    P.lane({ points: FAN_C, dashed: true, dim: true }),
    // The three chips span the block width: web-c endpoint conditions (the state that drives routing),
    // where new connections may land, and the grace-period window.
    P.chip({ key: 'condChip', x: 70, y: 566, w: 340, h: 34, name: 'endpoint web-c', value: 'ready · serving' }),
    P.chip({ key: 'newChip', x: 430, y: 566, w: 290, h: 34, name: 'new conns', value: 'web-a and web-c' }),
    P.chip({ key: 'graceChip', x: 740, y: 566, w: 390, h: 34, name: 'grace period', value: 'not draining' }),
    P.packets(),
  ],
  // Inner app boxes are listed so a .highlight set in a reduced-replay block does not leak into later
  // steps (NET.S-02).
  reset: {
    keys: ['kproxy', 'condChip', 'newChip', 'graceChip', 'clientBox', 'podABox', 'podCBox'],
    pods: ['client', 'podA', 'podC'],
  },
};

// Both backend opacities are stated on EVERY step, so a dim set by an earlier step cannot persist
// into a replay of a later one. web-a never leaves full.
const BOTH_UP = { podA: 1, podC: 1 };
const C_TERMINATING = { podA: 1, podC: OPACITY.terminating };
const C_TERMINATED = { podA: 1, podC: OPACITY.terminated };

const GRACE_30S = 'terminationGracePeriod 30s';
const C_TERMINATING_SUB = '10.244.3.9 · terminating';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { condChip: 'ready · serving', newChip: 'web-a and web-c', graceChip: 'not draining' },
    podSublabels: { podC: '10.244.3.9 · ready' },
    opacity: BOTH_UP,
  },
  {
    id: 'steady',
    // Motion: client pulse, the first connection lands on web-a at 2409, the second leaves 540 later
    // and lands on web-c at 2949, whose pulse ends at 3849.
    duration: 4000,
    narration: 'Both Pods are Ready endpoints in the slice, so kube-proxy spreads new connections across the two of them. This is the normal state, before anything starts to change.',
    chips: { condChip: 'ready · serving', newChip: 'web-a and web-c', graceChip: 'not draining' },
    podSublabels: { podC: '10.244.3.9 · ready' },
    opacity: BOTH_UP,
    // The animated path says the client sent and both backends were served by PULSING them, and no
    // cue names those three inner boxes.
    reducedLit: ['clientBox', 'podABox', 'podCBox'],
    // Up-arrow: the client pulses, then TWO connections leave it in turn, one per backend, so the
    // spread across both endpoints is two rides rather than one ball splitting in two.
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: LANE[0], to: LANE[1], delay: BEAT.afterPulse, name: 'send' }),
      tag({ text: 'new conn', points: LANE, delay: BEAT.afterPulse }),
      F.light({ targets: ['kproxy'], at: 'send' }),
      F.route({ points: FAN_A, after: 'send', name: 'giveA' }),
      F.pulse({ pod: 'podA', at: 'giveA' }),
      // The second connection, staggered by CONN_GAP. It carries no tag of its own: a second `new conn`
      // on the same 185 unit lane would still be up while the first one fades.
      F.segment({ from: LANE[0], to: LANE[1], delay: BEAT.afterPulse + CONN_GAP, name: 'send2' }),
      F.route({ points: FAN_C, after: 'send2', name: 'giveC' }),
      F.pulse({ pod: 'podC', at: 'giveC' }),
    ],
  },
  {
    id: 'terminate',
    duration: 2400,
    narration: 'The rollout deletes Pod web-c. Its preStop hook runs first and SIGTERM follows from the Kubelet, but the container does not vanish at once. It enters Terminating and keeps serving whatever it is already handling.',
    // NOT `ready · serving`: ready is a shortcut for serving AND NOT terminating, so it is already
    // false the moment this Pod takes a deletionTimestamp. The two slots carry what just became true.
    chips: { condChip: 'terminating · serving', newChip: 'web-a and web-c', graceChip: GRACE_30S },
    podSublabels: { podC: C_TERMINATING_SUB },
    // Static end-state: web-c has taken the signal and dimmed out of the normal set.
    opacity: C_TERMINATING,
    lit: ['condChip', 'graceChip'],
    // The animated path says web-c took the signal by PULSING it, and no cue names its inner box.
    reducedLit: ['podCBox'],
    // web-c starts calm at full opacity, pulses as it receives SIGTERM, THEN fades out to the dimmed
    // end-state (pulse first, dim after, never the reverse). No packet on this step.
    rewind: { opacity: { podC: 1 } },
    flow: [
      F.pulse({ pod: 'podC' }),
      F.fade({ target: 'podC', from: 1, to: OPACITY.terminating, dur: FADE.out, delay: PULSE_MS, fill: 'forwards', easing: 'ease-in' }),
    ],
  },
  {
    id: 'condition',
    duration: 3500,
    narration: 'Almost at once that endpoint flips in the slice: ready becomes false while serving and terminating stay true. The kube-proxy reads the change and stops handing NEW connections to web-c, so fresh traffic now goes to web-a only.',
    chips: { condChip: 'notReady · serving', newChip: 'web-a only', graceChip: GRACE_30S },
    podSublabels: { podC: C_TERMINATING_SUB },
    // web-c is out of the new-connection set: keep it dim at the shared DIM level.
    opacity: C_TERMINATING,
    lit: ['condChip', 'newChip'],
    // The client and web-a only pulse here, so the static path has to say so itself.
    reducedLit: ['clientBox', 'podABox'],
    // A new connection now lands on web-a only: client pulses, packet runs the lane then the web-a
    // fan, and web-a pulses on arrival. No ball goes to web-c, which is the whole point.
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: LANE[0], to: LANE[1], delay: BEAT.afterPulse, name: 'send' }),
      tag({ text: 'new conn', points: LANE, delay: BEAT.afterPulse }),
      F.light({ targets: ['kproxy'], at: 'send' }),
      F.route({ points: FAN_A, after: 'send', name: 'giveA' }),
      tag({ text: 'to web-a', points: FAN_A, after: 'send', easing: 'ease-in-out' }),
      F.pulse({ pod: 'podA', at: 'giveA' }),
    ],
  },
  {
    id: 'drain',
    duration: 4600,
    narration: 'The connection already established on web-c is not cut. Its conntrack entry already maps that flow to web-c, so kube-proxy never picks a backend for it again and web-c finishes the request it holds, while every new connection lands on web-a. That overlap lets a rollout finish without dropped requests.',
    chips: { condChip: 'notReady · serving', newChip: 'web-a only', graceChip: 'draining in grace window' },
    podSublabels: { podC: C_TERMINATING_SUB },
    opacity: C_TERMINATING,
    lit: ['kproxy', 'condChip', 'graceChip'],
    // All three Pods pulse on this step and nothing cues their inner boxes, so the static path
    // names them itself.
    reducedLit: ['podCBox', 'podABox', 'clientBox'],
    // Two flows at once: the in-flight connection drains to web-c, and as it lands a fresh connection
    // starts from the client, runs the lane and the web-a fan.
    flow: [
      F.route({ points: FAN_C, name: 'drain' }),
      tag({ text: 'in-flight', points: FAN_C, easing: 'ease-in-out' }),
      F.pulse({ pod: 'podC', at: 'drain' }),
      F.pulse({ pod: 'client', after: 'drain' }),
      F.segment({ from: LANE[0], to: LANE[1], after: 'drain', plus: BEAT.afterPulse, name: 'send' }),
      tag({ text: 'new conn', points: LANE, after: 'drain', plus: BEAT.afterPulse }),
      F.route({ points: FAN_A, after: 'send', name: 'giveA' }),
      tag({ text: 'to web-a', points: FAN_A, after: 'send', easing: 'ease-in-out' }),
      F.pulse({ pod: 'podA', at: 'giveA' }),
    ],
  },
  {
    id: 'gone',
    duration: 3500,
    narration: 'When the grace period ends web-c exits and its endpoint leaves the slice. Its replacement is already Ready in the new ReplicaSet, so the Service never dropped below its backend count. Traffic carried on throughout, and no client saw a reset.',
    chips: { condChip: 'removed', newChip: 'web-a + replica', graceChip: 'grace elapsed' },
    podSublabels: { podC: '10.244.3.9 · terminated' },
    // web-c is gone, so it drops from the terminating shade to the terminated one.
    opacity: C_TERMINATED,
    lit: ['condChip', 'newChip', 'graceChip'],
    // The client and web-a only pulse here, so the static path has to say so itself.
    reducedLit: ['clientBox', 'podABox'],
    // Service carries on: a new connection lands on web-a and it pulses on arrival.
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: LANE[0], to: LANE[1], delay: BEAT.afterPulse, name: 'send' }),
      tag({ text: 'new conn', points: LANE, delay: BEAT.afterPulse }),
      F.light({ targets: ['kproxy'], at: 'send' }),
      F.route({ points: FAN_A, after: 'send', name: 'giveA' }),
      F.pulse({ pod: 'podA', at: 'giveA' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
