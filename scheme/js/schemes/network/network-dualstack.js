import { P, F, defineCard, makeRidingLabel, laneY, routeDur, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-dualstack


const CONFIG_X = 480, CONFIG_W = 600;        // band spans Service..Pod only (480..1080), clear of the client
const CONFIG_Y = 136, CONFIG_H = 80;
const CONFIG_BOTTOM = CONFIG_Y + CONFIG_H;   // 216
const CONFIG_CX = CONFIG_X + CONFIG_W / 2;   // 780
const ROW_Y = 286, ROW_H = 150;              // client / Service / Pod row
const LANE_Y = ROW_Y + ROW_H / 2;            // 361: data lane through the row centres
const CLIENT_X = 120, CLIENT_W = 300;        // client Pod: 120..420
const SVC_X = 480, SVC_W = 240;              // Service web: 480..720
const POD_X = 780, POD_W = 300;              // Pod web: 780..1080
const ROW_RIGHT = POD_X + POD_W;             // 1080
// The band applies to BOTH the Service and the Pod, so its two drops are a mirrored pair about the
// BAND centre rather than one tap per target centre, each still landing well inside its target face.
const TAP_DX = 165;
const { out: TAP_SVC, back: TAP_POD } = laneY(CONFIG_CX, TAP_DX);   // 615 into the Service top edge, 945 into the Pod
// Info chips span the whole row, client left edge to Pod right edge, so the strip centres on x=600:
// two ClusterIP chips on a top row, then the ipFamilyPolicy chip stretched the full width below.
const CHIP_X = CLIENT_X, CHIP_SPAN = ROW_RIGHT - CLIENT_X, CHIP_GAP = 20;
const CHIP_W = (CHIP_SPAN - CHIP_GAP) / 2;   // 470
const CHIP_Y = 472, CHIP_Y2 = 516;

// Each static wire and the ball that rides it come from the same points array.
const DROP_SVC = [[TAP_SVC, CONFIG_BOTTOM], [TAP_SVC, ROW_Y]];
const DROP_POD = [[TAP_POD, CONFIG_BOTTOM], [TAP_POD, ROW_Y]];
const HOP_CLIENT = [[CLIENT_X + CLIENT_W, LANE_Y], [SVC_X, LANE_Y]];   // client -> Service ClusterIP
const HOP_SVC = [[SVC_X + SVC_W, LANE_Y], [POD_X, LANE_Y]];            // Service -> Pod (after DNAT)

// The list order IS the append order, which is the z-order: config + service + client + pod, then
// the wires ABOVE them, then the chips, then the packet layer.
export const SCENE = {
  'aria-label': 'Dual-stack IPv4 and IPv6: with both families enabled a Pod gets one address from each family, a Service gets one ClusterIP per family ordered by ipFamilies, and the client connects over whichever family it prefers',
  parts: [
    P.defs(),
    // Config band spans Service..Pod (480..1080), centred on x=780, label centred.
    P.box({ key: 'config', x: CONFIG_X, y: CONFIG_Y, w: CONFIG_W, h: CONFIG_H, label: 'dual-stack enabled', sublabel: 'Pod + Service CIDRs: IPv4 and IPv6' }),
    // Centred row: two identical Pod shells aligned to the band edges flank the Service at x=600.
    P.box({ key: 'svc', x: SVC_X, y: ROW_Y, w: SVC_W, h: ROW_H, label: 'Service web', sublabel: 'ipFamilyPolicy' }),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: CLIENT_X, y: ROW_Y, w: CLIENT_W, h: ROW_H,
      label: 'Client Pod', sublabel: 'dual-stack',
      inner: { dx: 16, dy: 36, w: CLIENT_W - 32, h: 50, label: 'app', sublabel: 'to Service web' },
    }),
    P.pod({
      key: 'pod', innerKey: 'podBox', x: POD_X, y: ROW_Y, w: POD_W, h: ROW_H,
      label: 'Pod web', sublabel: 'IPv4 10.244.1.5',
      inner: { dx: 22, dy: 42, w: POD_W - 44, h: 56, label: 'app', sublabel: 'eth0' },
    }),
    // All four wires carry `role: ''` so they keep the dim arrowhead instead of the cyan one.
    P.arrow({ from: HOP_CLIENT[0], to: HOP_CLIENT[1], dashed: true, dim: true, role: '' }),
    P.arrow({ from: HOP_SVC[0], to: HOP_SVC[1], dashed: true, dim: true, role: '' }),
    P.arrow({ from: DROP_SVC[0], to: DROP_SVC[1], dashed: true, dim: true, role: '' }),
    P.arrow({ from: DROP_POD[0], to: DROP_POD[1], dashed: true, dim: true, role: '' }),
    // Second row first: ipFamilyPolicy is stretched the full width BENEATH the two ClusterIP chips,
    // so the three sit aligned under the client, Service and Pod above.
    P.chip({ key: 'famChip', x: CHIP_X, y: CHIP_Y2, w: CHIP_SPAN, h: 34, name: 'ipFamilyPolicy', value: 'SingleStack' }),
    P.chip({ key: 'v4Chip', x: CHIP_X, y: CHIP_Y, w: CHIP_W, h: 34, name: 'clusterIP v4', value: '10.96.0.20' }),
    P.chip({ key: 'v6Chip', x: CHIP_X + CHIP_W + CHIP_GAP, y: CHIP_Y, w: CHIP_W, h: 34, name: 'clusterIP v6', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: ['config', 'svc', 'famChip', 'v4Chip', 'v6Chip', 'clientBox', 'podBox'],
    pods: ['client', 'pod'],
  },
};

// The tag that rides a ball on this card: dy -16 lifts the long IPv6 text clear of the ball, and the
// short 140/150 fades retire the first address as the second hop fades its own in.
const ridingLabel = makeRidingLabel({ role: 'network', dy: -16, inMs: 140, hold: 150 });
const tag = (p) => F.tag({ fn: ridingLabel, ...p });

const SINGLE = { famChip: 'SingleStack', v4Chip: '10.96.0.20', v6Chip: 'none' };
const DUAL = { famChip: 'PreferDualStack', v4Chip: '10.96.0.20', v6Chip: 'fd00:96::a' };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { ...SINGLE },
    sublabels: { clientBox: 'to Service web' },
    podSublabels: { pod: 'IPv4 10.244.1.5' },
  },
  {
    id: 'enable',
    duration: 2300,
    narration: 'Dual-stack is enabled cluster-wide: the API server and controller-manager take an IPv4 and an IPv6 service CIDR, the controller-manager and kube-proxy take both pod CIDRs, the Kubelet takes a Node IP of each family, and the CNI has to support both. Nothing has a second address yet, but the address space for one now exists.',
    chips: { ...SINGLE },
    sublabels: { clientBox: 'to Service web' },
    podSublabels: { pod: 'IPv4 10.244.1.5' },
    lit: ['config'],
  },
  {
    id: 'pod-two-ips',
    duration: 2500,
    narration: 'When the Pod is created, the CNI now allocates one address from each family, an IPv4 from the v4 pod CIDR and an IPv6 from the v6 pod CIDR. Both live on the same eth0, and the Pod can speak either protocol.',
    chips: { ...SINGLE },
    sublabels: { clientBox: 'to Service web' },
    podSublabels: { pod: 'IPv4 10.244.1.5 . IPv6 fd00::1:5' },
    // The dual-stack config (its CNI plus the v6 pod CIDR) is the source of the new address, so the
    // band stays lit as the allocation flows out of it.
    lit: ['config'],
    // The animated path says the Pod took the address by PULSING it, which no lights list can name.
    reducedLit: ['podBox'],
    // Down-arrow: the IPv6 address drops from the config band into the Pod, which pulses on arrival.
    // This is the CNI allocating the second family onto eth0.
    flow: [
      F.segment({ from: DROP_POD[0], to: DROP_POD[1], name: 'drop' }),
      F.pulse({ pod: 'pod', at: 'drop' }),
    ],
  },
  {
    id: 'service-two-clusterips',
    duration: 2500,
    narration: 'A Service with ipFamilyPolicy PreferDualStack is given one ClusterIP per family, ordered by its ipFamilies list, here IPv4 then IPv6. Each ClusterIP is backed by the same set of Pods, just reached over a different protocol.',
    chips: { ...DUAL },
    sublabels: { clientBox: 'to Service web' },
    podSublabels: { pod: 'IPv4 10.244.1.5 . IPv6 fd00::1:5' },
    lit: ['config', 'famChip', 'v4Chip', 'v6Chip'],
    // Down-arrow: the second ClusterIP drops from the config band into the Service.
    flow: [
      F.segment({ from: DROP_SVC[0], to: DROP_SVC[1], lights: ['svc'] }),
    ],
  },
  {
    id: 'client-chooses',
    duration: 3300,
    narration: 'A client resolving the Service gets both an A and an AAAA record, and connects over whichever family it prefers. Here it dials the IPv6 ClusterIP, and the Service forwards the connection to the Pod IPv6 address. The same Service is reachable both ways.',
    chips: { ...DUAL },
    sublabels: { clientBox: 'dials IPv6 fd00:96::a' },
    podSublabels: { pod: 'IPv4 10.244.1.5 . IPv6 fd00::1:5' },
    lit: ['v6Chip'],
    // The animated path says the Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['podBox'],
    // The Service is the first hop's destination, so it lights when the client packet lands on it
    // and forwards one beat later, rather than being lit before the client has dialled.
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: HOP_CLIENT[0], to: HOP_CLIENT[1], delay: BEAT.afterPulse, name: 'h1' }),
      tag({ text: 'dst fd00:96::a', points: HOP_CLIENT, delay: BEAT.afterPulse, dur: routeDur(HOP_CLIENT), easing: 'linear' }),
      F.light({ targets: ['svc'], at: 'h1' }),
      F.segment({ from: HOP_SVC[0], to: HOP_SVC[1], after: 'h1', name: 'h2' }),
      tag({ text: 'dst fd00::1:5', points: HOP_SVC, after: 'h1', dur: routeDur(HOP_SVC), easing: 'linear' }),
      F.pulse({ pod: 'pod', at: 'h2' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
