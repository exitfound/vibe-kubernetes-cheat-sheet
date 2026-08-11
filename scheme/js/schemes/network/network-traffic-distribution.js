import { P, F, defineCard, makeRidingLabel, routeDur, shade, strip, BEAT, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-traffic-distribution


const SCHEME_L = 60, SCHEME_R = 1140;        // content edges, mirrored about x=600
const FLOW_Y = 320;                          // central flow line

const CLIENT_X = SCHEME_L, CLIENT_W = 200, CLIENT_H = 110;
const CLIENT_OUT = [CLIENT_X + CLIENT_W, FLOW_Y];   // 260: client right edge
const KP_X = 440, KP_W = 190, KP_H = 80;
const KP_IN = [KP_X, FLOW_Y];                // kube-proxy left edge (connection arrives)
const KP = [KP_X + KP_W, FLOW_Y];            // 630: kube-proxy right edge (fan origin, after the pick)
const RAIL_X = 700;                          // shared vertical fan rail, left of the zones (740)
const ZONE_X = 740, ZONE_W = SCHEME_R - 740, ZONE_H = 240;   // 740..1140
const ZONE_A_Y = 60, ZONE_B_Y = 340;         // mirrored about FLOW_Y
const POD_W = 240, POD_H = 96;
const POD_L = ZONE_X + (ZONE_W - POD_W) / 2; // 820: Pod centred in the zone, clear of its top-left label
const POD_PAD = (ZONE_H - 2 * POD_H) / 3;    // 16: equal padding above, between and below the two Pods
// Backend Pod centre rows: zone-a stacked on top (a1, a2), zone-b below (b1, b2), symmetric about
// FLOW_Y so the fan is balanced.
const A1Y = ZONE_A_Y + POD_PAD + POD_H / 2;  // 124
const A2Y = A1Y + POD_H + POD_PAD;           // 236
const B1Y = ZONE_B_Y + POD_PAD + POD_H / 2;  // 404
const B2Y = B1Y + POD_H + POD_PAD;           // 516

// Bottom strip: two equal chips spanning the composition, so the row centres on 600 like the rest.
const CHIP_Y = 592, CHIP_H = 34, CHIP_GAP = 20;
const CHIPS = strip({ from: SCHEME_L, to: SCHEME_R, count: 2, gap: CHIP_GAP });   // 530 wide each
const FAN_A1 = [KP, [RAIL_X, FLOW_Y], [RAIL_X, A1Y], [POD_L, A1Y]];
const FAN_A2 = [KP, [RAIL_X, FLOW_Y], [RAIL_X, A2Y], [POD_L, A2Y]];
const FAN_B1 = [KP, [RAIL_X, FLOW_Y], [RAIL_X, B1Y], [POD_L, B1Y]];
const FAN_B2 = [KP, [RAIL_X, FLOW_Y], [RAIL_X, B2Y], [POD_L, B2Y]];

const POD_INNER = { dx: 18, dy: 30, w: POD_W - 36, h: 44, label: 'app', sublabel: 'eth0' };
const backend = (key, cy, ip) => P.pod({
  key, innerKey: `${key}Box`, x: POD_L, y: cy - POD_H / 2, w: POD_W, h: POD_H,
  label: 'Pod web', sublabel: ip, inner: POD_INNER,
});

// The list order IS the append order, which is the z-order: the zone frames in back, then the Pods
// inside them, the client and kube-proxy, then the wires ABOVE, then the chips, then the packets.
export const SCENE = {
  'aria-label': 'Session affinity and topology-aware routing: kube-proxy spreads connections across all endpoints by default, sessionAffinity pins a client to one Pod, and trafficDistribution PreferSameZone keeps traffic in the client zone with a fallback to other zones',
  parts: [
    P.defs(),
    P.node({ key: 'zoneA', x: ZONE_X, y: ZONE_A_Y, w: ZONE_W, h: ZONE_H, label: 'zone-a' }),
    P.node({ key: 'zoneB', x: ZONE_X, y: ZONE_B_Y, w: ZONE_W, h: ZONE_H, label: 'zone-b' }),
    backend('a1', A1Y, '10.244.2.7'),
    backend('a2', A2Y, '10.244.2.8'),
    backend('b1', B1Y, '10.244.3.4'),
    backend('b2', B2Y, '10.244.3.5'),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: CLIENT_X, y: FLOW_Y - CLIENT_H / 2, w: CLIENT_W, h: CLIENT_H,
      label: 'Client . zone-a', sublabel: '10.244.2.50',
      inner: { dx: 16, dy: 34, w: CLIENT_W - 32, h: 48, label: 'app', sublabel: 'to Service web' },
    }),
    P.box({ key: 'kproxy', x: KP_X, y: FLOW_Y - KP_H / 2, w: KP_W, h: KP_H, label: 'kube-proxy', sublabel: 'endpoint pick' }),
    // Dim dashed wires: client -> kube-proxy, plus the four fan routes (no route crosses a Pod). All
    // five carry `role: ''` so they keep the dim arrowhead the card shipped with instead of the cyan one.
    P.arrow({ from: CLIENT_OUT, to: KP_IN, dashed: true, dim: true, role: '' }),
    P.lane({ points: FAN_A1, dashed: true, dim: true, role: '' }),
    P.lane({ points: FAN_A2, dashed: true, dim: true, role: '' }),
    P.lane({ points: FAN_B1, dashed: true, dim: true, role: '' }),
    P.lane({ points: FAN_B2, dashed: true, dim: true, role: '' }),
    P.chip({ key: 'modeChip', x: CHIPS.x(0), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'distribution', value: 'unset . spread' }),
    P.chip({ key: 'pinChip', x: CHIPS.x(1), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'session', value: 'None' }),
    P.packets(),
  ],
  reset: {
    keys: ['kproxy', 'modeChip', 'pinChip', 'clientBox', 'a1Box', 'a2Box', 'b1Box', 'b2Box'],
    pods: ['client', 'a1', 'a2', 'b1', 'b2'],
  },
};

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy, so the
// factory is built once and handed to every F.tag as `fn`.
const ridingLabel = makeRidingLabel({ role: 'network', dy: -15, inMs: 160, outMs: 200, hold: 260 });
const tag = (p) => F.tag({ fn: ridingLabel, ...p });

const FAN_SLOW = 1.6;
const fanDur = (points) => Math.round(routeDur(points) * FAN_SLOW);

const CLIENT_IP = 'src 10.244.2.50';

// One fan leg: the ball, the source-IP tag riding the SAME slowed dur so it stays glued to it, then
// the backend Pod pulsing on arrival.
const fan = (points, pod, name, after, plus) => [
  F.route({ points, after, plus, dur: fanDur(points), name }),
  tag({ text: CLIENT_IP, points, after, plus, dur: fanDur(points) }),
  F.pulse({ pod, at: name }),
];

// Every backend is stated on every step, because resetStep no longer restores the four shells: a zone
// the step does not prefer is dimmed here and nowhere else.
const ALL_UP = { a1: 1, a2: 1, b1: 1, b2: 1 };
const zoneDown = (keys) => ({ opacity: { ...ALL_UP, ...shade(keys, OPACITY.notready) } });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { modeChip: 'unset . spread', pinChip: 'None' },
    opacity: ALL_UP,
  },
  {
    id: 'default',
    duration: 4600,
    narration: 'With both fields unset, kube-proxy spreads connections roughly evenly across every ready endpoint and ignores zones. Two connections from the same client can land on Pods in different zones, here one in zone-a and one in zone-b. Load is balanced but traffic may cross the zone boundary.',
    chips: { modeChip: 'unset . spread all', pinChip: 'None' },
    opacity: ALL_UP,
    lit: ['modeChip'],
    // The animated path says the two backends were served by PULSING them, which no lights list names.
    reducedLit: ['a1Box', 'b2Box'],
    // TWO connections from one client, the second staggered by 540 so they read as two rides rather
    // than one ball splitting. kube-proxy is still the RECEIVER of the client hop, so it lights on it.
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: CLIENT_OUT, to: KP_IN, delay: BEAT.afterPulse, name: 'arr', lights: ['kproxy'] }),
      ...fan(FAN_A1, 'a1', 'fa1', 'arr'),
      F.segment({ from: CLIENT_OUT, to: KP_IN, delay: BEAT.afterPulse + 540, name: 'arr2' }),
      ...fan(FAN_B2, 'b2', 'fb2', 'arr2'),
    ],
  },
  {
    id: 'session-affinity',
    duration: 4600,
    narration: 'First lever: stickiness. Set sessionAffinity to ClientIP and the opening connection still picks a backend freely, then kube-proxy pins that client source IP to the chosen Pod, here 10.244.2.7. Every later connection from the same client returns to that one Pod, so a session stays put.',
    chips: { modeChip: 'unset . spread all', pinChip: 'ClientIP . pin .2.7' },
    opacity: ALL_UP,
    lit: ['pinChip'],
    // The animated path says the pinned backend was served by PULSING it, which no lights list names.
    reducedLit: ['a1Box'],
    // Two connections from the same client both land on the SAME Pod (a1, 10.244.2.7).
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: CLIENT_OUT, to: KP_IN, delay: BEAT.afterPulse, name: 'arr', lights: ['kproxy'] }),
      ...fan(FAN_A1, 'a1', 'fa1', 'arr'),
      ...fan(FAN_A1, 'a1', 'fa2', 'arr', 540),
    ],
  },
  {
    id: 'topology',
    duration: 4000,
    narration: 'Second lever: locality, independent of the first. Set trafficDistribution to PreferSameZone (older clusters spell it PreferClose) and kube-proxy favors endpoints in the same zone as the client. The zone-a client is routed to a zone-a Pod, keeping traffic in-zone, which cuts latency and the cross-zone data charges a cloud would bill.',
    chips: { modeChip: 'PreferSameZone . in-zone', pinChip: 'None' },
    // The far zone is not preferred: dim its Pods.
    ...zoneDown(['b1', 'b2']),
    lit: ['modeChip', 'pinChip'],
    // The animated path says the in-zone backend was served by PULSING it, which no lights list names.
    reducedLit: ['a1Box'],
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: CLIENT_OUT, to: KP_IN, delay: BEAT.afterPulse, name: 'arr', lights: ['kproxy'] }),
      ...fan(FAN_A1, 'a1', 'fa1', 'arr'),
    ],
  },
  {
    id: 'fallback',
    duration: 3800,
    narration: 'PreferSameZone is a preference, not a hard rule. The field is still PreferSameZone, but if zone-a has no ready endpoint kube-proxy falls back to a Pod in another zone rather than dropping the connection, so the client still reaches zone-b. Availability wins over locality.',
    chips: { modeChip: 'PreferSameZone . fallback', pinChip: 'None' },
    // zone-a has no ready endpoint: dim its Pods, traffic falls back to zone-b.
    ...zoneDown(['a1', 'a2']),
    lit: ['modeChip'],
    // The animated path says the fallback backend was served by PULSING it, which no lights list names.
    reducedLit: ['b1Box'],
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: CLIENT_OUT, to: KP_IN, delay: BEAT.afterPulse, name: 'arr', lights: ['kproxy'] }),
      ...fan(FAN_B1, 'b1', 'fb1', 'arr'),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
