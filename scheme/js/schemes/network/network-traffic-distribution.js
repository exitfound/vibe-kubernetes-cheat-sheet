import { P, F, defineCard, makeRidingLabel, shade, strip, BEAT, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS/network-traffic-distribution.md


// The two setting chips are a full-width bottom strip across this span, the grammar the rest of the
// category uses. Narrow it and the strip centres on the client column instead of on 600.
const SCHEME_L = 60, SCHEME_R = 1140;        // content edges, mirrored about x=600
const FLOW_Y = 320;                          // central flow line

const CLIENT_X = SCHEME_L, CLIENT_W = 200, CLIENT_H = 110;
const CLIENT_OUT = [CLIENT_X + CLIENT_W, FLOW_Y];   // 260: client right edge
// The control column: the Node dataplane on the flow line over kube-proxy, both NET.L-01 232x80. Its
// right edge 588 stands 10 short of a riding tag on the rail: the record LAYOUT says why it is not 420.
const COL_X = 356, COL_W = 232;
const COL_CX = COL_X + COL_W / 2;            // 472: the relation from kube-proxy lands here
const DP_H = 80, KP_H = 80, REL_GAP = 44;
const DP_TOP = FLOW_Y - DP_H / 2;            // 280
const KP_Y = DP_TOP + DP_H + REL_GAP;        // 404: under the dataplane, clear of the panel
const DP_IN = [COL_X, FLOW_Y];               // dataplane left edge (connection arrives)
const DP_OUT = [COL_X + COL_W, FLOW_Y];      // 588: dataplane right edge, where the fan leaves
const RAIL_X = 700;                          // shared vertical fan rail, left of the zones (740)
const ZONE_X = 740, ZONE_W = SCHEME_R - 740, ZONE_H = 240;   // 740..1140
const ZONE_A_Y = 60, ZONE_B_Y = 340;         // mirrored about FLOW_Y
const POD_W = 240, POD_H = 96;
const POD_L = ZONE_X + 92;                   // 832: 12 right of centre, so the frame label ends 13 short of it
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
// Every leg ends on its zone frame face at x 740, never on a Pod inside it (A-21), at the mirrored
// offsets +-56 about each face midpoint (L-12).
const FAN_A1 = [DP_OUT, [RAIL_X, FLOW_Y], [RAIL_X, A1Y], [ZONE_X, A1Y]];
const FAN_A2 = [DP_OUT, [RAIL_X, FLOW_Y], [RAIL_X, A2Y], [ZONE_X, A2Y]];
const FAN_B1 = [DP_OUT, [RAIL_X, FLOW_Y], [RAIL_X, B1Y], [ZONE_X, B1Y]];
const FAN_B2 = [DP_OUT, [RAIL_X, FLOW_Y], [RAIL_X, B2Y], [ZONE_X, B2Y]];

const POD_INNER = { dx: 18, dy: 30, w: POD_W - 36, h: 44, label: 'app', sublabel: 'eth0' };
const backend = (key, cy, ip) => P.pod({
  key, innerKey: `${key}Box`, x: POD_L, y: cy - POD_H / 2, w: POD_W, h: POD_H,
  label: 'Pod web', sublabel: ip, inner: POD_INNER,
});

// The list order IS the append order, which is the z-order: the zone frames in back, then the Pods
// inside them, the client and the control column, then the wires ABOVE, then the chips, then packets.
export const SCENE = {
  'aria-label': 'Session affinity and traffic distribution: kube-proxy on a zone-a Node writes the Service rules and the Node dataplane picks a backend per connection. By default every ready endpoint is in the rules and zones are ignored. sessionAffinity ClientIP makes the dataplane pin a client source IP to one Pod while that Pod stays in the rules and the client connects again within a sticky window, 10800 seconds by default. trafficDistribution PreferSameZone makes kube-proxy write only the endpoints hinted for its own zone, and when that zone has no ready endpoint it falls back to every ready endpoint in the cluster.',
  parts: [
    P.defs(),
    // `in zone-a`, not `zone-a`: the frame is the endpoints in that zone, and the client in zone-a
    // stands outside it. It inks 67 wide at 1600x1000, so the Pods sit at 832 rather than centred.
    P.node({ key: 'zoneA', x: ZONE_X, y: ZONE_A_Y, w: ZONE_W, h: ZONE_H, label: 'in zone-a' }),
    P.node({ key: 'zoneB', x: ZONE_X, y: ZONE_B_Y, w: ZONE_W, h: ZONE_H, label: 'in zone-b' }),
    backend('a1', A1Y, '10.244.2.7'),
    backend('a2', A2Y, '10.244.2.8'),
    backend('b1', B1Y, '10.244.3.4'),
    backend('b2', B2Y, '10.244.3.5'),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: CLIENT_X, y: FLOW_Y - CLIENT_H / 2, w: CLIENT_W, h: CLIENT_H,
      label: 'Client Pod · zone-a', sublabel: '10.244.2.50',
      inner: { dx: 20, dy: 34, w: CLIENT_W - 40, h: 48, label: 'app', sublabel: 'to Service web' },
    }),
    P.box({ key: 'kproxy', x: COL_X, y: KP_Y, w: COL_W, h: KP_H, label: 'kube-proxy', sublabel: 'reads zone hints · writes rules' }),
    P.box({ key: 'dp', x: COL_X, y: DP_TOP, w: COL_W, h: DP_H, label: 'Node dataplane · zone-a', sublabel: 'Service rules · conntrack' }),
    // Dim dashed wires: client -> dataplane, plus the four fan routes (no route crosses a Pod). None
    // names a role, so the kit fills the networking one (S-42). `dim` is a stroke WEIGHT (A-22).
    P.arrow({ from: CLIENT_OUT, to: DP_IN, dashed: true, dim: true }),
    // kube-proxy WRITES the rules the dataplane runs and never forwards a packet: no head, no ball.
    P.relation({ points: [[COL_CX, KP_Y], [COL_CX, DP_TOP + DP_H]], dash: '5 5' }),
    P.lane({ key: 'legA1', points: FAN_A1, dashed: true, dim: true }),
    P.lane({ key: 'legA2', points: FAN_A2, dashed: true, dim: true }),
    P.lane({ key: 'legB1', points: FAN_B1, dashed: true, dim: true }),
    P.lane({ key: 'legB2', points: FAN_B2, dashed: true, dim: true }),
    P.chip({ key: 'modeChip', x: CHIPS.x(0), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'trafficDistribution', value: 'unset · all zones' }),
    P.chip({ key: 'pinChip', x: CHIPS.x(1), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'sessionAffinity', value: 'None' }),
    P.packets(),
  ],
  reset: {
    keys: ['kproxy', 'dp', 'modeChip', 'pinChip', 'clientBox', 'a1Box', 'a2Box', 'b1Box', 'b2Box'],
    pods: ['client', 'a1', 'a2', 'b1', 'b2'],
  },
};

// The tag that rides a ball on this card, built once here and handed to every F.tag as `fn`: hold 260
// keeps the source IP up while the backend pulses, so the address and the chosen zone read as one.
const ridingLabel = makeRidingLabel({ role: 'network', inMs: 160, outMs: 200, hold: 260 });
const tag = (p) => F.tag({ fn: ridingLabel, ...p });
// The tag is up from departure and trails LEFT of the rail, above the dataplane on an up ride and below
// it on a down ride, parking past the rail end. The inner legs a2 and b1 have no such clear end.
const TAG_UP = { dx: -56, dy: -52 };
const TAG_DOWN = { dx: -56, dy: 60 };

// Two connections landing on ONE Pod are held a whole PULSE_POD.ms (900) apart, so the second blink
// starts on the millisecond the first one ends. The 540 of the default step is for two DIFFERENT Pods.
const SAME_POD_GAP = 900;

const CLIENT_IP = 'src 10.244.2.50';
const AFFINITY = 'ClientIP · 10800s';
const PINNED = 'ClientIP · .2.50 pinned to .2.7 · 10800s';

// One connection into the dataplane: the ball, lighting the dataplane on arrival because the rules
// that pick the backend run there.
const arrive = (name, delay) => F.segment({ from: CLIENT_OUT, to: DP_IN, delay, name, lights: ['dp'] });

// One fan leg: the ball, the source-IP tag riding its routeDur so it stays glued to it (M-30), then
// the backend Pod pulsing on arrival.
const fan = (points, pod, name, after, plus) => [
  F.route({ points, after, plus, name }),
  tag({ text: CLIENT_IP, points, after, plus, ...(points === FAN_A1 ? TAG_UP : TAG_DOWN) }),
  F.pulse({ pod, at: name }),
];

// What the rules on the client Node hold, as ONE opacity field (A-16): an endpoint left out of the
// rules dims from step entry, while the headed leg that would reach it stays at full on every step.
const ALL_UP = { a1: 1, a2: 1, b1: 1, b2: 1, legA1: 1, legA2: 1, legB1: 1, legB2: 1 };
const ZONE_A = ['a1', 'a2'];
const ZONE_B = ['b1', 'b2'];
const stage = (out = []) => ({ opacity: { ...ALL_UP, ...shade(out, OPACITY.notready) } });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { modeChip: 'unset · all zones', pinChip: 'None' },
    ...stage(),
  },
  {
    id: 'default',
    duration: 4600,
    narration: 'With both fields unset, kube-proxy writes every ready endpoint into the Service rules on the client Node and ignores zones. The dataplane picks a backend per connection, so two connections from one client can land in different zones, here zone-a and zone-b. Load spreads evenly, but traffic may cross the zone boundary.',
    chips: { modeChip: 'unset · all zones', pinChip: 'None' },
    ...stage(),
    lit: ['modeChip'],
    // The animated path says the two backends were served by PULSING them, which no lights list names.
    reducedLit: ['a1Box', 'b2Box'],
    // TWO connections from one client, the second staggered by 540 so they read as two rides rather
    // than one ball splitting.
    flow: [
      F.pulse({ pod: 'client' }),
      arrive('arr', BEAT.afterPulse),
      ...fan(FAN_A1, 'a1', 'fa1', 'arr'),
      arrive('arr2', BEAT.afterPulse + 540),
      ...fan(FAN_B2, 'b2', 'fb2', 'arr2'),
    ],
  },
  {
    id: 'session-affinity',
    // Motion: the first connection reaches a1 at 2373 and the second at 3273, whose blink ends at 4173.
    duration: 4900,
    narration: 'First lever, per client: set sessionAffinity to ClientIP. The opening connection still picks a backend freely, and the dataplane pins source 10.244.2.50 to the Pod it picked, 10.244.2.7. Later connections from that client return there while that Pod stays in the rules and the client reconnects within the sticky window, 10800 seconds by default.',
    chips: { modeChip: 'unset · all zones', pinChip: PINNED },
    ...stage(),
    lit: ['pinChip'],
    // The animated path says the pinned backend was served by PULSING it, which no lights list names.
    reducedLit: ['a1Box'],
    // The setting stands from entry. The pin is runtime state, written as the dataplane DNATs the first connection.
    rewind: { chips: { pinChip: AFFINITY } },
    // Both connections land on the SAME Pod (a1, 10.244.2.7), so the second waits SAME_POD_GAP.
    flow: [
      F.pulse({ pod: 'client' }),
      arrive('arr', BEAT.afterPulse),
      ...fan(FAN_A1, 'a1', 'fa1', 'arr'),
      ...fan(FAN_A1, 'a1', 'fa2', 'arr', SAME_POD_GAP),
      F.set({ at: 'arr', chips: { pinChip: PINNED } }),
    ],
  },
  {
    id: 'topology',
    duration: 4000,
    narration: 'Second lever, per zone: set trafficDistribution to PreferSameZone (PreferClose is its deprecated alias). Each ready endpoint in the EndpointSlice carries a zone hint, and kube-proxy on this zone-a Node writes only the zone-a endpoints into its rules. The connection stays in zone-a, which can cut latency and cross-zone costs.',
    chips: { modeChip: 'PreferSameZone · zone-a only', pinChip: 'None' },
    // Programming time: the zone-b endpoints are not in the rules before any connection is made.
    ...stage(ZONE_B),
    // sessionAffinity is back to None, a changed value, so it is cued with the setting that replaced it.
    lit: ['modeChip', 'kproxy', 'pinChip'],
    // The animated path says the in-zone backend was served by PULSING it, which no lights list names.
    reducedLit: ['a1Box'],
    flow: [
      F.pulse({ pod: 'client' }),
      arrive('arr', BEAT.afterPulse),
      ...fan(FAN_A1, 'a1', 'fa1', 'arr'),
    ],
  },
  {
    id: 'fallback',
    duration: 3800,
    narration: 'PreferSameZone is a preference, not a hard rule. When zone-a has no ready endpoint, kube-proxy finds none hinted for its zone and writes every ready endpoint in the cluster instead, which here is only the two in zone-b. The connection crosses zones rather than failing. Availability wins over locality.',
    chips: { modeChip: 'PreferSameZone · fallback to all zones', pinChip: 'None' },
    // a1 and a2 are ready=false, so the rules kube-proxy rewrote hold neither of them.
    ...stage(ZONE_A),
    lit: ['modeChip', 'kproxy'],
    // The animated path says the fallback backend was served by PULSING it, which no lights list names.
    reducedLit: ['b1Box'],
    // No source tag on this ride: the rail runs on past the b1 stub, so any tag parked there is struck.
    flow: [
      F.pulse({ pod: 'client' }),
      arrive('arr', BEAT.afterPulse),
      F.route({ points: FAN_B1, after: 'arr', name: 'fb1' }),
      F.pulse({ pod: 'b1', at: 'fb1' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
