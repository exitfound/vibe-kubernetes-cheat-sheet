import { P, F, defineCard } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-service-cidr


const SCHEME_L = 120, SCHEME_R = 1080;   // content edges, mirrored about x=600

// Service row: three equal boxes with equal gaps, spanning the composition.
const SVC_Y = 450, SVC_W = 280, SVC_H = 86;
const SVC_GAP = (SCHEME_R - SCHEME_L - 3 * SVC_W) / 2;                 // 60
const SVC_X = [0, 1, 2].map(i => SCHEME_L + i * (SVC_W + SVC_GAP));    // 120, 460, 800
const SVC_CX = SVC_X.map(x => x + SVC_W / 2);                          // 260, 600, 940

const POOL_X = 580;          // pool centre (kept right of the overlay band)
const POOL_Y = 44, POOL_W = 280, POOL_H = 64;
const POOL_BOTTOM = POOL_Y + POOL_H;   // 108: where both split lanes leave the pool

const BAND_Y = 320, BAND_H = 84;
const BAND_BOTTOM = BAND_Y + BAND_H;   // 404
const STATIC_W = 280;                  // static band: 120..400, flush under Service kubernetes
const DYN_L = 420, DYN_RIGHT = SCHEME_R;
const STATIC_X = SVC_CX[0];            // 260: static band centre
const DYN_X = (DYN_L + DYN_RIGHT) / 2; // 750: dynamic band centre
const DYN_MID_Y = BAND_Y + BAND_H / 2; // 362
const WEB_X = SVC_CX[2];               // 940: web column (Service web and the add-on CIDR align here)

const CHIP_Y = 556, CHIP_H = 34;
const RAIL1 = 230;    // pool -> bands rail
const RAIL2 = 428;    // bands -> Services rail
const EXT_RAIL_X = 1130;   // the add-on CIDR comes down outside the bands before turning in

const SPLIT_STATIC  = [[POOL_X, POOL_BOTTOM], [POOL_X, RAIL1], [STATIC_X, RAIL1], [STATIC_X, BAND_Y]];
const SPLIT_DYNAMIC = [[POOL_X, POOL_BOTTOM], [POOL_X, RAIL1], [DYN_X, RAIL1], [DYN_X, BAND_Y]];
const K8S_ROUTE     = [[STATIC_X, BAND_BOTTOM], [STATIC_X, SVC_Y]];                                     // static band -> Service kubernetes
const DNS_ROUTE     = [[STATIC_X, BAND_BOTTOM], [STATIC_X, RAIL2], [SVC_CX[1], RAIL2], [SVC_CX[1], SVC_Y]];
const WEB_ROUTE     = [[DYN_X, BAND_BOTTOM], [DYN_X, RAIL2], [WEB_X, RAIL2], [WEB_X, SVC_Y]];

// The opening divide is deliberately slowed (and both packets share one dur so the two bands
// light up together) so the split into a static and a dynamic band reads clearly.
const SPLIT_DUR = 1600;

// The add-on CIDR enters the dynamic band from its right side, centred on that edge (DYN_MID_Y),
// so the extend step reads as the range growing into the band, not a straight top-down drop.
const EXTEND_ROUTE = [[WEB_X, POOL_BOTTOM], [WEB_X, RAIL1], [EXT_RAIL_X, RAIL1], [EXT_RAIL_X, DYN_MID_Y], [DYN_RIGHT, DYN_MID_Y]];

// The six wires predate the kit binding and carry NO role, so the arrowhead stays the neutral dim
// one. Omitting `role: ''` here would stamp the category role and swap the marker.
const WIRE = { dashed: true, dim: true, role: '' };

// A block that comes into existence mid-card: born hidden, revealed by its own 350ms fade.
const REVEAL = { keyframes: [{ opacity: 0 }, { opacity: 1 }], options: { duration: 350, fill: 'forwards', easing: 'ease-out' } };

// The list order IS the append order, which is the z-order: bands and Services first, then the
// pool row over them, then the wires above the blocks so the dim lines read, then the packets.
export const SCENE = {
  'aria-label': 'Service CIDR and ClusterIP allocation: the configured Service CIDR is divided into a low static band for well-known IPs like 10.96.0.1 and 10.96.0.10 and a high dynamic band the allocator draws ClusterIPs from, each tracked by an IPAddress object, and a second ServiceCIDR can be added to extend the range without disruption',
  parts: [
    P.defs(),
    // The range, drawn as two adjacent bands so it reads as one divided CIDR: a small static band
    // flush under Service kubernetes, and the much wider dynamic band filling the rest.
    P.box({ key: 'staticBand', x: SCHEME_L, y: BAND_Y, w: STATIC_W, h: BAND_H, label: 'Static band', sublabel: 'low IPs . by hand' }),
    P.box({ key: 'dynamicBand', x: DYN_L, y: BAND_Y, w: DYN_RIGHT - DYN_L, h: BAND_H, label: 'Dynamic band', sublabel: 'high IPs . auto-assigned' }),
    // Three Services on an even grid, IP assigned across the steps (pending at rest).
    P.box({ key: 'svcK8s', x: SVC_X[0], y: SVC_Y, w: SVC_W, h: SVC_H, label: 'Service kubernetes', sublabel: 'clusterIP pending' }),
    P.box({ key: 'svcDns', x: SVC_X[1], y: SVC_Y, w: SVC_W, h: SVC_H, label: 'Service kube-dns', sublabel: 'clusterIP pending' }),
    P.box({ key: 'svcWeb', x: SVC_X[2], y: SVC_Y, w: SVC_W, h: SVC_H, label: 'Service web', sublabel: 'clusterIP pending' }),
    // The IPAddress object recording the dynamic binding. It spans the whole composition, not the web
    // column: its value names the Service it points at, and 280 units cannot clear the chip name.
    P.chip({ key: 'ipaddrChip', x: SCHEME_L, y: CHIP_Y, w: SCHEME_R - SCHEME_L, h: CHIP_H, name: 'IPAddress', value: ' ', opacity: 0 }),
    // Top row: the configured Service CIDR, plus a second one stacked over the web column,
    // revealed only on the extend step.
    P.box({ key: 'pool', x: POOL_X - POOL_W / 2, y: POOL_Y, w: POOL_W, h: POOL_H, label: 'ServiceCIDR kubernetes', sublabel: '10.96.0.0/16' }),
    P.box({ key: 'cidr2', x: WEB_X - POOL_W / 2, y: POOL_Y, w: POOL_W, h: POOL_H, label: 'ServiceCIDR add-on', sublabel: '10.97.0.0/16', opacity: 0 }),
    P.lane({ points: SPLIT_STATIC, ...WIRE }),
    P.lane({ points: SPLIT_DYNAMIC, ...WIRE }),
    P.arrow({ from: K8S_ROUTE[0], to: K8S_ROUTE[1], ...WIRE }),
    P.lane({ points: DNS_ROUTE, ...WIRE }),
    P.lane({ points: WEB_ROUTE, ...WIRE }),
    P.lane({ key: 'aExtend', points: EXTEND_ROUTE, ...WIRE, opacity: 0 }),
    P.packets(),
  ],
  reset: {
    keys: ['pool', 'cidr2', 'staticBand', 'dynamicBand', 'svcK8s', 'svcDns', 'svcWeb', 'ipaddrChip'],
  },
};

// The three Service sublabels are one fact per step, so one helper states all three and no step
// can leave a stale IP behind on the Service it is not talking about.
const assigned = (k8s, dns, web) => ({ sublabels: { svcK8s: k8s, svcDns: dns, svcWeb: web } });
const PENDING = 'clusterIP pending';
const K8S_IP = 'clusterIP 10.96.0.1', DNS_IP = 'clusterIP 10.96.0.10', WEB_IP = 'clusterIP 10.96.137.42';
// The IPAddress object, said twice on the dynamic step: once as the state it ends in, once as the
// value the flow writes when the address lands.
const IPADDR = '10.96.137.42 . default/web';
// The add-on CIDR, its wire and the IPAddress object are revealed only on later steps.
const LATER_HIDDEN = { cidr2: 0, aExtend: 0, ipaddrChip: 0 };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { ipaddrChip: ' ' },
    ...assigned(PENDING, PENDING, PENDING),
    opacity: LATER_HIDDEN,
  },
  {
    id: 'range-split',
    duration: 2400,
    narration: 'The range is divided into two bands. A small low static band is left for hand-picked addresses, and the much larger high dynamic band is used for automatic assignment, so a manual IP taken from the low band is very unlikely to collide with an auto-assigned one. Only once the dynamic band is exhausted does the allocator fall back to the low one.',
    chips: { ipaddrChip: ' ' },
    ...assigned(PENDING, PENDING, PENDING),
    opacity: LATER_HIDDEN,
    lit: ['pool'],
    // The pool divides into the two bands: a packet rides into each, slowed and synchronized
    // (shared SPLIT_DUR) so the divide is easy to follow and both bands light together.
    flow: [
      F.route({ points: SPLIT_STATIC, dur: SPLIT_DUR, fadeIn: true, lights: ['staticBand'] }),
      F.route({ points: SPLIT_DYNAMIC, dur: SPLIT_DUR, fadeIn: true, lights: ['dynamicBand'] }),
    ],
  },
  {
    id: 'well-known',
    duration: 2600,
    narration: 'At cluster bootstrap two addresses are taken from the static band. 10.96.0.1 is the first address of the range and always fronts the kubernetes API Service, while installers assign kube-dns the tenth by convention, here 10.96.0.10, which is why those two IPs are predictable in most clusters.',
    chips: { ipaddrChip: ' ' },
    ...assigned(K8S_IP, DNS_IP, PENDING),
    opacity: LATER_HIDDEN,
    lit: ['staticBand'],
    // Both Services end the step holding their reserved IP, which is what the static path shows. The
    // animated path winds them back to pending so each address arrives with its own packet.
    rewind: { sublabels: { svcK8s: PENDING, svcDns: PENDING } },
    // Two reservations leave the static band together, and each ball rings on the Service it lands
    // on: the Service boxes are receivers, and only Pods pulse.
    flow: [
      F.segment({ from: K8S_ROUTE[0], to: K8S_ROUTE[1], dur: 540, name: 'k8s', lights: ['svcK8s'] }),
      F.route({ points: DNS_ROUTE, fadeIn: true, name: 'dns', lights: ['svcDns'] }),
      // Each IP is written where its own ball lands, 540 for the API Service and 858 for kube-dns.
      F.set({ sublabels: { svcK8s: K8S_IP }, at: 'k8s' }),
      F.set({ sublabels: { svcDns: DNS_IP }, at: 'dns' }),
    ],
  },
  {
    id: 'dynamic',
    duration: 2600,
    narration: 'A new Service web is created with no clusterIP, so the allocator picks the next free address from the dynamic band, here 10.96.137.42, and records it as an IPAddress object that points back to the Service. Every ClusterIP in the cluster is now tracked by one of these objects.',
    chips: { ipaddrChip: IPADDR },
    ...assigned(K8S_IP, DNS_IP, WEB_IP),
    // The IPAddress object ends the step present, which is what the static path shows. The animated
    // path winds it back to hidden so its own fade can bring it in on arrival.
    opacity: { cidr2: 0, aExtend: 0, ipaddrChip: 1 },
    lit: ['dynamicBand', 'ipaddrChip'],
    // The address is one fact said in two places, the Service sublabel and the IPAddress object, so
    // both wind back to what the step before left and both are written on the same arrival.
    rewind: { opacity: { ipaddrChip: 0 }, sublabels: { svcWeb: PENDING }, chips: { ipaddrChip: ' ' } },
    flow: [
      F.route({ points: WEB_ROUTE, name: 'give', lights: ['svcWeb'] }),
      // The IPAddress object materializes once the address lands on the Service, at 700.
      F.anim({ target: 'ipaddrChip', ...REVEAL, at: 'give' }),
      F.set({ sublabels: { svcWeb: WEB_IP }, chips: { ipaddrChip: IPADDR }, at: 'give' }),
    ],
  },
  {
    id: 'extend',
    duration: 2600,
    narration: 'When the whole range fills up, the old fix was to resize the API server service-cluster-ip-range and restart it, a disruptive operation. Now you add a second ServiceCIDR object, here 10.97.0.0/16, and fresh ClusterIPs are drawn from it. The Service IP space grows with no downtime.',
    chips: { ipaddrChip: IPADDR },
    // Keep the earlier assignments visible.
    ...assigned(K8S_IP, DNS_IP, WEB_IP),
    opacity: { cidr2: 1, aExtend: 1, ipaddrChip: 1 },
    lit: ['cidr2'],
    // The add-on CIDR and its wire arrive with the step on the static path, and fade in on the
    // animated one, so both are wound back before the flow.
    rewind: { opacity: { cidr2: 0, aExtend: 0 } },
    flow: [
      F.anim({ target: 'cidr2', ...REVEAL }),
      F.anim({ target: 'aExtend', ...REVEAL }),
      // The add-on CIDR feeds fresh addresses into the dynamic band from its right side.
      F.route({ points: EXTEND_ROUTE, delay: 420, name: 'give', lights: ['dynamicBand'] }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
