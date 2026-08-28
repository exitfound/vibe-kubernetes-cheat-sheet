import { P, F, defineCard, laneY, midX, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-headless-service


const CY = 320;                      // canvas centre line: Pods column + CoreDNS are centred on it
const W0 = 168, W1 = CY, W2 = 472;   // backend Pod centre rows (W0/W2 mirror about CY)
const POD_X = 880, POD_W = 240, POD_H = 116;   // backend Pods
const CORE_LEFT = 430, CORE_RIGHT = 680, CORE_H = 78;
const CORE_CX = midX(CORE_LEFT, CORE_RIGHT);   // 555: the Service -> CoreDNS relationship line
const SVC_Y = 430, SVC_H = 70;
const FAN_X = 760;                   // vertical bus for the CoreDNS -> Pods endpoint fan
const DATA_X = 820;                  // vertical bus for the client -> Pod direct data path
const CHIP_Y = 575, CHIP_H = 34;
const CLIENT_X = 80, CLIENT_W = 210, CLIENT_H = 130;
const CLIENT_TOP = 420, CLIENT_RIGHT = CLIENT_X + CLIENT_W;   // 290
const CLIENT_CY = CLIENT_TOP + CLIENT_H / 2;                  // 485: the data trunk leaves here
const DATA_Y = 520;                  // the data trunk runs below CoreDNS and the Service box
// The trunk has to clear the Service box (y 430..500) on its way right, so it steps down from the
// Pod edge to DATA_Y here, in the free gap between the client and CoreDNS.
const DATA_STEP_X = 355;
const POD_INNER = { dx: 20, dy: 34, h: 48 };

// Up out of the client's TOP edge, then square into CoreDNS's left edge. TWO lanes 20 apart on both
// faces, so the answer comes home on its own wire, and both pairs straddle their face midpoint.
const LANE_DX = 10, LANE_DY = 10;
const CLIENT_CX = CLIENT_X + CLIENT_W / 2;   // 185
const { out: QUERY_X, back: ANSWER_X } = laneY(CLIENT_CX, LANE_DX);   // 175 up, 195 home
const { out: QUERY_Y, back: ANSWER_Y } = laneY(CY, LANE_DY);          // 310 query, 330 answer
const QUERY = [[QUERY_X, CLIENT_TOP], [QUERY_X, QUERY_Y], [CORE_LEFT, QUERY_Y]];
const ANSWER = [[CORE_LEFT, ANSWER_Y], [ANSWER_X, ANSWER_Y], [ANSWER_X, CLIENT_TOP]];

// Direct data path to each backend, leaving the Pod at the middle of its right edge. Same array
// draws the wire and flies the ball.
const toPod = (cy) => [[CLIENT_RIGHT, CLIENT_CY], [DATA_STEP_X, CLIENT_CY], [DATA_STEP_X, DATA_Y], [DATA_X, DATA_Y], [DATA_X, cy], [POD_X, cy]];
const TO_W0 = toPod(W0);
const TO_W1 = toPod(W1);
const TO_W2 = toPod(W2);

// CoreDNS endpoint fan: trunk, bus, then square-on into each Pod's left edge.
const fanTo = (cy) => [[CORE_RIGHT, CY], [FAN_X, CY], [FAN_X, cy], [POD_X, cy]];

const backend = (key, cy, label, ip) => P.pod({
  key, innerKey: `${key}Box`, x: POD_X, y: cy - POD_H / 2, w: POD_W, h: POD_H, label, sublabel: ip,
  inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: POD_W - POD_INNER.dx * 2, h: POD_INNER.h, label: 'app', sublabel: 'eth0' },
});

// The list order IS the append order, which is the z-order: boxes and Pods, then the wires ABOVE
// them, then the chips, then the packet layer on top.
export const SCENE = {
  'aria-label': 'Headless Service: with clusterIP None there is no virtual IP, so DNS returns one A record per ready backing Pod and the client connects to a Pod itself, and a StatefulSet gives each Pod its own stable name',
  parts: [
    P.defs(),
    P.box({ key: 'coredns', x: CORE_LEFT, y: CY - CORE_H / 2, w: CORE_RIGHT - CORE_LEFT, h: CORE_H, label: 'CoreDNS', sublabel: 'kube-dns 10.96.0.10' }),
    P.box({ key: 'svc', x: CORE_LEFT, y: SVC_Y, w: CORE_RIGHT - CORE_LEFT, h: SVC_H, label: 'Service web', sublabel: 'clusterIP: None' }),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: CLIENT_X, y: CLIENT_TOP, w: CLIENT_W, h: CLIENT_H,
      label: 'Client Pod', sublabel: '10.244.1.5',
      inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: CLIENT_W - POD_INNER.dx * 2, h: POD_INNER.h, label: 'app', sublabel: 'eth0' },
    }),
    backend('w0', W0, 'web-0', '10.244.2.7'),
    backend('w1', W1, 'web-1', '10.244.3.4'),
    backend('w2', W2, 'web-2', '10.244.1.9'),
    // The Service -> CoreDNS link is ownership, not traffic, so it carries no role and no arrowhead.
    P.relation({ points: [[CORE_CX, SVC_Y], [CORE_CX, CY + CORE_H / 2]], dash: '5 5', role: '' }),
    // TWO fans, and only one is traffic: the DATA fan is what the client opens, the ENDPOINT fan is
    // CoreDNS knowing which Pods back the Service. No traffic, so no arrowhead and no role either.
    P.relation({ points: fanTo(W0), role: '' }),
    P.relation({ points: fanTo(W1), role: '' }),
    P.relation({ points: fanTo(W2), role: '' }),
    // The five dim dashed lanes carry `role: ''` so they keep the neutral arrowhead, not the cyan one.
    P.lane({ points: TO_W0, dashed: true, dim: true, role: '' }),
    P.lane({ points: TO_W1, dashed: true, dim: true, role: '' }),
    P.lane({ points: TO_W2, dashed: true, dim: true, role: '' }),
    P.lane({ points: QUERY, dashed: true, dim: true, role: '' }),
    P.lane({ points: ANSWER, dashed: true, dim: true, role: '' }),
    P.chip({ key: 'vipChip', x: CLIENT_X, y: CHIP_Y, w: CLIENT_W, h: CHIP_H, name: 'clusterIP', value: 'None' }),
    P.chip({ key: 'dnsChip', x: CORE_LEFT, y: CHIP_Y, w: CORE_RIGHT - CORE_LEFT, h: CHIP_H, name: 'A records', value: 'pending' }),
    P.chip({ key: 'connChip', x: POD_X, y: CHIP_Y, w: POD_W, h: CHIP_H, name: 'connection', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: ['coredns', 'svc', 'vipChip', 'dnsChip', 'connChip', 'clientBox', 'w0Box', 'w1Box', 'w2Box'],
    pods: ['client', 'w0', 'w1', 'w2'],
  },
};

// Every step repaints all three readouts, so no value can survive from the previous step.
const ANSWER_SET = '.2.7 .3.4 .1.9';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { vipChip: 'None', dnsChip: 'pending', connChip: 'none' },
  },
  {
    id: 'query',
    duration: 2600,
    narration: 'The client looks up the Service by name, web.default.svc.cluster.local. Because there is no ClusterIP, the answer cannot be a single virtual address, so this query has to resolve to the Pods themselves.',
    chips: { vipChip: 'None', dnsChip: 'pending', connChip: 'none' },
    lit: ['svc', 'vipChip'],
    // Up-arrow: the client pulses first, the query leaves at BEAT.afterPulse and lands at CoreDNS,
    // which lights on arrival.
    flow: [
      F.pulse({ pod: 'client' }),
      F.route({ points: QUERY, delay: BEAT.afterPulse, lights: ['coredns'] }),
    ],
  },
  {
    id: 'answer-all',
    duration: 3000,
    narration: 'CoreDNS reads the ready endpoints and returns one A record for every backing Pod, three addresses in this answer rather than a single VIP. The client receives the whole set of Pod IPs and picks one itself, which is why a headless Service does no load balancing of its own.',
    chips: { vipChip: 'None', dnsChip: ANSWER_SET, connChip: 'none' },
    lit: ['coredns', 'w0Box', 'w1Box', 'w2Box', 'dnsChip'],
    // The animated path says the answer arrived by PULSING the client, which no lights list can name.
    reducedLit: ['clientBox'],
    // Down-arrow: the answer comes home on its OWN lane and the client pulses on arrival.
    flow: [
      F.route({ points: ANSWER, name: 'ans' }),
      F.pulse({ pod: 'client', at: 'ans' }),
    ],
  },
  {
    id: 'direct',
    duration: 3600,
    narration: 'The client opens the connection straight to one of those Pod IPs, here web-1 at 10.244.3.4. There is no ClusterIP in the path and kube-proxy does no DNAT, so the traffic goes directly Pod to Pod.',
    chips: { vipChip: 'None', dnsChip: ANSWER_SET, connChip: '10.244.3.4' },
    lit: ['connChip'],
    // The animated path says web-1 was served by PULSING it, which no lights list can name.
    reducedLit: ['w1Box'],
    // Up-arrow: client pulses first, the connection leaves and the chosen Pod pulses on arrival.
    flow: [
      F.pulse({ pod: 'client' }),
      F.route({ points: TO_W1, delay: BEAT.afterPulse, name: 'hop' }),
      F.pulse({ pod: 'w1', at: 'hop' }),
    ],
  },
  {
    id: 'stable-name',
    // The route to web-0 is the longest on the card (it climbs the full column), so its ball runs
    // ~3.8s. The step must outlast its own motion or auto-advance clips the ball in mid-flight.
    duration: 4200,
    narration: 'A headless Service also gives each StatefulSet Pod its own stable name, so web-0.web.default.svc.cluster.local resolves to that one Pod and nothing else. That is how a client addresses one specific replica, which is what stateful systems with a known primary depend on.',
    chips: { vipChip: 'None', dnsChip: 'web-0 only: .2.7', connChip: '10.244.2.7' },
    lit: ['dnsChip', 'connChip'],
    // The animated path says web-0 was served by PULSING it, which no lights list can name.
    reducedLit: ['w0Box'],
    flow: [
      F.pulse({ pod: 'client' }),
      F.route({ points: TO_W0, delay: BEAT.afterPulse, name: 'hop' }),
      F.pulse({ pod: 'w0', at: 'hop' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
