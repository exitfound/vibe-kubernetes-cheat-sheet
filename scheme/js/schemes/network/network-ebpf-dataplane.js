import { P, F, defineCard, makeRidingLabel, BEAT, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-ebpf-dataplane


// The composition spans CONTENT_L..CONTENT_R so it centres on 600. Panel right <= 397, bottom <= 205,
// and every block sits clear of it.
const CONTENT_L = 70, CONTENT_R = 1130;
const FLOW_Y = 312;                    // client <-> eBPF program lane
const CLIENT_X = CONTENT_L, CLIENT_W = 200;
const CLIENT_RIGHT = CLIENT_X + CLIENT_W;   // 270
const HOOK_X = 440, HOOK_W = 220;      // eBPF program box
const HOOK_Y = 276, HOOK_H = 72;
const HOOK_RIGHT = HOOK_X + HOOK_W;    // 660: fan origin
const POD_W = 210, POD_H = 114;
const POD_X = CONTENT_R - POD_W;       // 920: backend Pod left edge
const FAN_X = (HOOK_RIGHT + POD_X) / 2;// 790: fan turn, exactly midway between the program and the Pods
const PODX_Y = 182;                    // chosen backend centre (symmetric about FLOW_Y)
const PODY_Y = 442;                    // alternative backend centre (symmetric about FLOW_Y)
const MAP_Y = 120, MAP_H = 72;         // BPF maps box, directly above the program
const LOOKUP_X = HOOK_X + 110;         // 550: the map-lookup link, on its own vertical
const DELIVER_DUR = 1200;              // slowed so the riding src-IP tag stays readable
const CLIENT_IP = 'src 10.244.1.5';

// eBPF program -> chosen / alternative backend, each as one right-angle path (right, up/down, right).
const TO_PODX = [[HOOK_RIGHT, FLOW_Y], [FAN_X, FLOW_Y], [FAN_X, PODX_Y], [POD_X, PODX_Y]];
const TO_PODY = [[HOOK_RIGHT, FLOW_Y], [FAN_X, FLOW_Y], [FAN_X, PODY_Y], [POD_X, PODY_Y]];
const CONNECT = [[CLIENT_RIGHT, FLOW_Y], [HOOK_X, FLOW_Y]];   // client socket -> the eBPF program
// A map lookup is a ROUND TRIP, so the link is a PAIR straddling LOOKUP_X: question up on its left,
// address back down on its right, mirrored so neither endpoint stands alone on the faces it touches.
const LOOKUP_DX = 12;
const LOOKUP = [[LOOKUP_X - LOOKUP_DX, HOOK_Y], [LOOKUP_X - LOOKUP_DX, MAP_Y + MAP_H]];   // program -> BPF maps
const LOOKUP_BACK = [[LOOKUP_X + LOOKUP_DX, MAP_Y + MAP_H], [LOOKUP_X + LOOKUP_DX, HOOK_Y]];  // the answer

const CHIP_Y = 548, CHIP_H = 34, CHIP_GAP = 20;
const CHIP_W = (CONTENT_R - CONTENT_L - 2 * CHIP_GAP) / 3;   // 340
const CHIP_X1 = CONTENT_L;                                   // 70
const CHIP_X2 = CHIP_X1 + CHIP_W + CHIP_GAP;                 // 430
const CHIP_X3 = CHIP_X2 + CHIP_W + CHIP_GAP;                 // 790, ends on CONTENT_R

// The tag that rides a ball on this card, built once here and handed to F.tag as `fn`: hold 260
// keeps the client source IP readable after the ball lands, which is the no-NAT claim of that step.
const ridingLabel = makeRidingLabel({ role: 'network', dy: -15, inMs: 160, outMs: 200, hold: 260 });
const tag = (p) => F.tag({ fn: ridingLabel, ...p });

// The list order IS the append order, which is the z-order: map + program + client + pods, then
// wires + labels ABOVE, then chips, then the packet layer on top.
export const SCENE = {
  'aria-label': 'The eBPF dataplane replaces kube-proxy: an eBPF program at the socket hook reads a BPF Service map and rewrites the connection to a backend Pod at connect time, with no per-packet iptables rule walk and no DNAT',
  parts: [
    P.defs(),
    P.box({ key: 'bpfmap', x: HOOK_X, y: MAP_Y, w: HOOK_W, h: MAP_H, label: 'BPF maps', sublabel: 'service + endpoints' }),
    P.box({ key: 'hook', x: HOOK_X, y: HOOK_Y, w: HOOK_W, h: HOOK_H, label: 'eBPF program', sublabel: 'socket hook' }),
    // The socket dials the Service ClusterIP (10.96.0.20), not a Pod: shown here against the client own
    // Pod IP on the shell, so the two address kinds read side by side. Fits the 160-wide inner box.
    P.pod({
      key: 'client', innerKey: 'clientBox', x: CLIENT_X, y: 252, w: CLIENT_W, h: 120,
      label: 'Client Pod', sublabel: '10.244.1.5',
      inner: { dx: 20, dy: 34, w: CLIENT_W - 40, h: 52, label: 'Socket', sublabel: 'connect() 10.96.0.20' },
    }),
    // Pod top edge = centre - h/2, so both backends sit symmetric about FLOW_Y (PODX_Y / PODY_Y).
    P.pod({
      key: 'w1', innerKey: 'w1Box', x: POD_X, y: PODX_Y - POD_H / 2, w: POD_W, h: POD_H,
      label: 'Pod web', sublabel: '10.244.2.7:8080',
      inner: { dx: 20, dy: 34, w: POD_W - 40, h: 52, label: 'app', sublabel: 'eth0' },
    }),
    P.pod({
      key: 'w2', innerKey: 'w2Box', x: POD_X, y: PODY_Y - POD_H / 2, w: POD_W, h: POD_H,
      label: 'Pod web', sublabel: '10.244.3.9:8080',
      inner: { dx: 20, dy: 34, w: POD_W - 40, h: 52, label: 'app', sublabel: 'eth0' },
    }),
    // Five dim dashed wires, labels filled per step: connect, the map lookup pair, and the fan to
    // the two backends. All five carry `role: ''` to keep the dim arrowhead, not the cyan one.
    P.arrow({ from: CONNECT[0], to: CONNECT[1], dashed: true, dim: true, role: '' }),
    P.arrow({ from: LOOKUP[0], to: LOOKUP[1], dashed: true, dim: true, role: '' }),
    P.arrow({ from: LOOKUP_BACK[0], to: LOOKUP_BACK[1], dashed: true, dim: true, role: '' }),
    P.lane({ points: TO_PODX, dashed: true, dim: true, role: '' }),
    P.lane({ points: TO_PODY, dashed: true, dim: true, role: '' }),
    // No connect-wire label: the connect target (ClusterIP) now lives on the client socket box.
    P.wire({ key: 'lookup', x: LOOKUP_X + 15, y: 238, anchor: 'start' }),
    P.wire({ key: 'deliver', x: (HOOK_RIGHT + FAN_X) / 2, y: FLOW_Y + 20 }),
    // Info chips: three equal widths spanning the diagram content exactly, from the client left edge
    // to the backend Pod right edge, so the strip lines up with the blocks above it.
    P.chip({ key: 'svcChip', x: CHIP_X1, y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'BPF svc map', value: 'pending' }),
    P.chip({ key: 'modeChip', x: CHIP_X2, y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'load balance', value: 'per-packet DNAT' }),
    P.chip({ key: 'kpChip', x: CHIP_X3, y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'kube-proxy', value: 'present' }),
    P.packets(),
  ],
  reset: {
    keys: ['hook', 'bpfmap', 'svcChip', 'modeChip', 'kpChip', 'clientBox', 'w1Box', 'w2Box'],
    pods: ['client', 'w1', 'w2'],
  },
};

// The alternative backend is dimmed only on the step that picks the other one, so every step states
// its own shade for w2 and the dim cannot leak into a replay of an earlier one.
const MAP_HIT = '10.96.0.20 -> .2.7 .3.9';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { svcChip: 'pending', modeChip: 'per-packet DNAT', kpChip: 'present' },
    opacity: { w2: 1 },
  },
  {
    id: 'attach',
    duration: 2300,
    narration: 'Instead of installing iptables rules, the CNI agent attaches small eBPF programs directly to kernel hooks, at the socket layer and on the network interfaces. There are no Service rule chains to traverse at all.',
    chips: { svcChip: 'pending', modeChip: 'per-packet DNAT', kpChip: 'present' },
    opacity: { w2: 1 },
    lit: ['hook'],
  },
  {
    id: 'maps',
    duration: 2400,
    narration: 'Service and endpoint state lives in BPF maps, kept in sync from the API by the agent. A lookup of 10.96.0.20 returns the backend set, here 10.244.2.7 and 10.244.3.9, as a constant-time hash lookup no matter how many Services exist.',
    chips: { svcChip: MAP_HIT, modeChip: 'per-packet DNAT', kpChip: 'present' },
    opacity: { w2: 1 },
    lit: ['bpfmap', 'svcChip'],
  },
  {
    id: 'connect-time',
    // Motion: the client pulse, the connect call to the hook, then the map lookup up and its
    // answer back down, ending at 3660.
    duration: 4000,
    narration: 'When the client calls connect to the ClusterIP, the socket-level eBPF program looks the address up in the map and rewrites the destination to a chosen Pod right there, before the packet is even built. This is connect-time load balancing, not per-packet DNAT.',
    chips: { svcChip: MAP_HIT, modeChip: 'connect-time', kpChip: 'present' },
    wires: { lookup: 'map lookup' },
    opacity: { w2: 1 },
    lit: ['modeChip'],
    // Up-arrow: the client pulses first, the connect call reaches the socket hook, which lights on
    // arrival. The map lights a beat later, as the program looks the address up.
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: CONNECT[0], to: CONNECT[1], delay: BEAT.afterPulse, name: 'send', lights: ['hook'] }),
      // The lookup the sentence names: question up to the map, the map lights when it lands, address
      // back down the paired lane. The rewrite the sentence ends on happens once it is back.
      F.segment({ from: LOOKUP[0], to: LOOKUP[1], after: 'send', name: 'ask', lights: ['bpfmap'] }),
      F.segment({ from: LOOKUP_BACK[0], to: LOOKUP_BACK[1], after: 'ask' }),
    ],
  },
  {
    id: 'deliver',
    duration: 2500,
    narration: 'The connection then goes straight to the Pod address, 10.244.2.7. Because the destination was chosen at the socket, this in-cluster connection needs no connection-tracking reversal on the way back, the socket talks to the Pod as if it had dialed that address directly.',
    chips: { svcChip: MAP_HIT, modeChip: 'connect-time', kpChip: 'present' },
    wires: { deliver: 'to .2.7' },
    opacity: { w2: OPACITY.notready },
    lit: ['hook', 'modeChip'],
    // The animated path says the chosen Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['w1Box'],
    // Down-arrow: the rewritten connection rides the right-angle route to the chosen Pod, which
    // pulses on arrival. The client source IP rides with it and arrives unchanged (no NAT).
    flow: [
      F.route({ points: TO_PODX, dur: DELIVER_DUR, name: 'give' }),
      tag({ text: CLIENT_IP, points: TO_PODX, dur: DELIVER_DUR }),
      F.pulse({ pod: 'w1', at: 'give' }),
    ],
  },
  {
    id: 'no-kube-proxy',
    duration: 2400,
    narration: 'Because the whole dataplane is eBPF programs plus maps, kube-proxy and its iptables chains can be removed entirely. Lookups stay constant-time as the cluster grows to thousands of Services, which is the main reason large clusters adopt this mode.',
    chips: { svcChip: MAP_HIT, modeChip: 'connect-time', kpChip: 'not needed' },
    opacity: { w2: 1 },
    lit: ['hook', 'bpfmap', 'kpChip'],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
