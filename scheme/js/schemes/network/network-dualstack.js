import { P, F, defineCard, laneY, strip, routeDur, BEAT, makeRidingLabel } from './network-kit.js';

// Design notes for this card: ./CARDS/network-dualstack.md

const CX = 600;                                   // canvas centre: the actor row and the chip grid sit on it
const SCHEME_L = 60, SCHEME_R = 1140;             // content edges, mirrored about CX

// NET.L-01: three actors at the category width and one height, so the row reads as one row. The
// Service is a plain box at the catalog 80 on the same axis, so the rails are sized by IT.
const ACTOR_W = 232, ACTOR_H = 106, SVC_H = 80;
const GAP = (SCHEME_R - SCHEME_L - ACTOR_W * 3) / 2;
const CLIENT_X = SCHEME_L;
const CLIENT_R = CLIENT_X + ACTOR_W;
const SVC_X = CLIENT_R + GAP;
const SVC_R = SVC_X + ACTOR_W;
const POD_X = SVC_R + GAP;                        // lands flush on SCHEME_R
// The row is pinned by its CENTRE, so the block height never moves the axis the rails mirror about.
const ROW_CY = 375;                               // the mirror axis
const ROW_Y = ROW_CY - ACTOR_H / 2;               // clear of the panel
const ROW_BOTTOM = ROW_Y + ACTOR_H;
const SVC_Y = ROW_CY - SVC_H / 2;
// CLU.NODE.POD_DY 34 assumes a frame 300 wide or more, so at 232 the inner takes the workloads pair.
const POD_INNER = { dx: 30, dy: 28, w: ACTOR_W - 60, h: 52 };   // one inner spec, so both Pods match

// The two family rails, a mirrored pair about the row's face midpoint (L-12): IPv4 rides the upper
// rail and IPv6 the lower, both inside the Service face, the shortest block they meet.
const RAIL_INSET = 18;
const RAIL_DY = SVC_H / 2 - RAIL_INSET;
const { out: RAIL_V4, back: RAIL_V6 } = laneY(ROW_CY, RAIL_DY);

// The band governs the Service and the Pod, so it spans exactly those two and its two drops are a
// mirrored pair about its own bottom face that lands on each target's top face MIDPOINT.
const CONFIG_X = SVC_X, CONFIG_Y = 56, CONFIG_H = 80;
const CONFIG_W = SCHEME_R - CONFIG_X;
const CONFIG_BOTTOM = CONFIG_Y + CONFIG_H;
const CONFIG_CX = CONFIG_X + CONFIG_W / 2;
const SVC_CX = SVC_X + ACTOR_W / 2;
const POD_CX = POD_X + ACTOR_W / 2;
const TAP_DX = (POD_CX - SVC_CX) / 2;             // half their span, which is also CONFIG_CX - SVC_CX
const { out: TAP_SVC, back: TAP_POD } = laneY(CONFIG_CX, TAP_DX);

// The readout is a family TABLE: IPv4 left, IPv6 right, the Pod address over the Service ClusterIP.
// Equal columns, so they come from strip() and no x is typed.
const CHIP_H = 34, CHIP_GAP = 24, CHIP_ROW_GAP = 12;
const CHIP_L = CX - 420, CHIP_R = CX + 420;       // narrower than the actor row
const COL = strip({ from: CHIP_L, to: CHIP_R, count: 2, gap: CHIP_GAP });
const CHIP_Y1 = ROW_BOTTOM + 62;                  // the row's own floor gap
const CHIP_Y2 = CHIP_Y1 + CHIP_H + CHIP_ROW_GAP;

// Each static wire and the ball that rides it come from the same points array.
const DROP_SVC = [[TAP_SVC, CONFIG_BOTTOM], [TAP_SVC, SVC_Y]];
const DROP_POD = [[TAP_POD, CONFIG_BOTTOM], [TAP_POD, ROW_Y]];
const HOP1_V4 = [[CLIENT_R, RAIL_V4], [SVC_X, RAIL_V4]];
const HOP1_V6 = [[CLIENT_R, RAIL_V6], [SVC_X, RAIL_V6]];
const HOP2_V4 = [[SVC_R, RAIL_V4], [POD_X, RAIL_V4]];
const HOP2_V6 = [[SVC_R, RAIL_V6], [POD_X, RAIL_V6]];

// The list order IS the append order, which is the z-order: config + service + client + pod, then
// the wires ABOVE them, then the chips, then the packet layer.
export const SCENE = {
  'aria-label': 'Dual-stack IPv4 and IPv6: two family rails run through one client, one Service and one Pod, where the Pod holds one address per family on a single eth0 and the Service one ClusterIP per family in ipFamilies order, so a client reaches the same Pod over whichever family it dials',
  parts: [
    P.defs(),
    P.box({ key: 'config', x: CONFIG_X, y: CONFIG_Y, w: CONFIG_W, h: CONFIG_H, label: 'dual-stack enabled', sublabel: 'IPv4 and IPv6 pod and service CIDRs' }),
    P.box({ key: 'svc', x: SVC_X, y: SVC_Y, w: ACTOR_W, h: SVC_H, label: 'Service web', sublabel: 'ipFamilyPolicy SingleStack' }),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: CLIENT_X, y: ROW_Y, w: ACTOR_W, h: ACTOR_H,
      label: 'Client Pod', sublabel: 'one eth0, one family',
      inner: { ...POD_INNER, label: 'app', sublabel: 'to Service web' },
    }),
    P.pod({
      key: 'pod', innerKey: 'podBox', x: POD_X, y: ROW_Y, w: ACTOR_W, h: ACTOR_H,
      label: 'Pod web', sublabel: 'one eth0, one family',
      inner: { ...POD_INNER, label: 'app', sublabel: 'eth0' },
    }),
    // Six wires in three mirrored pairs, and every one of them carries a ball on a step of its own:
    // the two drops out of the band, then the v4 and v6 rail through each gap of the row.
    P.arrow({ from: DROP_SVC[0], to: DROP_SVC[1], dashed: true, dim: true }),
    P.arrow({ from: DROP_POD[0], to: DROP_POD[1], dashed: true, dim: true }),
    P.arrow({ from: HOP1_V4[0], to: HOP1_V4[1], dashed: true, dim: true }),
    P.arrow({ from: HOP1_V6[0], to: HOP1_V6[1], dashed: true, dim: true }),
    P.arrow({ from: HOP2_V4[0], to: HOP2_V4[1], dashed: true, dim: true }),
    P.arrow({ from: HOP2_V6[0], to: HOP2_V6[1], dashed: true, dim: true }),
    P.chip({ key: 'podV4', x: COL.x(0), y: CHIP_Y1, w: COL.w, h: CHIP_H, name: 'Pod IP v4', value: '10.244.1.5' }),
    P.chip({ key: 'podV6', x: COL.x(1), y: CHIP_Y1, w: COL.w, h: CHIP_H, name: 'Pod IP v6', value: 'none' }),
    P.chip({ key: 'svcV4', x: COL.x(0), y: CHIP_Y2, w: COL.w, h: CHIP_H, name: 'clusterIP v4', value: '10.96.0.20' }),
    P.chip({ key: 'svcV6', x: COL.x(1), y: CHIP_Y2, w: COL.w, h: CHIP_H, name: 'clusterIP v6', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: ['config', 'svc', 'podV4', 'podV6', 'svcV4', 'svcV6', 'clientBox', 'podBox'],
    pods: ['client', 'pod'],
  },
};

// The v4 tag rides ABOVE its rail and out of the row, the v6 tag BELOW its rail and out of it, so
// neither ever meets a block face at any width.
const TAG_UP = ROW_Y - RAIL_V4 - 14;
const TAG_DOWN = ROW_BOTTOM - RAIL_V6 + 18;
const upLabel = makeRidingLabel({ role: 'network', dy: TAG_UP, hold: 0 });
const downLabel = makeRidingLabel({ role: 'network', dy: TAG_DOWN, hold: 0 });
const tagV4 = (p) => F.tag({ fn: upLabel, ...p });
const tagV6 = (p) => F.tag({ fn: downLabel, ...p });

const SINGLE = { podV4: '10.244.1.5', podV6: 'none', svcV4: '10.96.0.20', svcV6: 'none' };
const POD_DUAL = { ...SINGLE, podV6: 'fd00::1:5' };
const DUAL = { ...POD_DUAL, svcV6: 'fd00:96::a' };
const ONE_FAMILY = 'one eth0, one family';
const BOTH_FAMILIES = 'one eth0, both families';
const POLICY_SINGLE = 'ipFamilyPolicy SingleStack';
const POLICY_DUAL = 'ipFamilyPolicy PreferDualStack';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { ...SINGLE },
    sublabels: { svc: POLICY_SINGLE, clientBox: 'to Service web' },
    podSublabels: { client: ONE_FAMILY, pod: ONE_FAMILY },
  },
  {
    id: 'enable',
    duration: 3300,
    narration: 'Dual-stack is enabled cluster-wide. The API server and controller-manager take an IPv4 and an IPv6 service CIDR, the controller-manager and kube-proxy take both pod CIDRs, the Kubelet takes a Node IP of each family unless a cloud provider picks them, and the CNI has to support both. The Service and Pod still have one address each.',
    chips: { ...SINGLE },
    sublabels: { svc: POLICY_SINGLE, clientBox: 'to Service web' },
    podSublabels: { client: ONE_FAMILY, pod: ONE_FAMILY },
    // A cluster-wide config change moves no per-object traffic, so the band lights and nothing rides.
    lit: ['config'],
  },
  {
    id: 'pod-two-addresses',
    duration: 2500,
    narration: 'When the Pod is created the CNI allocates one address from each family, an IPv4 out of the v4 pod CIDR and an IPv6 out of the v6 pod CIDR. Both live on the same eth0, so the Pod speaks either protocol without a second interface.',
    chips: { ...POD_DUAL },
    sublabels: { svc: POLICY_SINGLE, clientBox: 'to Service web' },
    // Both Pods, because the allocation the drop carries is the CNI rule and not this Pod's luck.
    podSublabels: { client: BOTH_FAMILIES, pod: BOTH_FAMILIES },
    // The band holds the v6 pod CIDR the address comes out of, so it stays lit as the drop leaves it.
    lit: ['config', 'podV6'],
    // The animated path says the Pod took the address by PULSING it, which no lights list can name.
    reducedLit: ['podBox'],
    // P-03: the second address arrives ON the drop, so the played path starts from the single-family
    // reading and turns both the chip and the Pod sublabel over when the ball lands.
    rewind: { chips: { podV6: SINGLE.podV6 }, podSublabels: { client: ONE_FAMILY, pod: ONE_FAMILY } },
    flow: [
      F.segment({ from: DROP_POD[0], to: DROP_POD[1], name: 'drop' }),
      F.set({ chips: { podV6: POD_DUAL.podV6 }, podSublabels: { client: BOTH_FAMILIES, pod: BOTH_FAMILIES }, at: 'drop' }),
      F.pulse({ pod: 'pod', at: 'drop' }),
    ],
  },
  {
    id: 'service-two-clusterips',
    duration: 2700,
    narration: 'A Service with ipFamilyPolicy PreferDualStack is given one ClusterIP per family, in the order its ipFamilies list names, here IPv4 then IPv6. Where only one family exists, PreferDualStack falls back to a single ClusterIP and RequireDualStack fails the Service outright.',
    chips: { ...DUAL },
    sublabels: { svc: POLICY_DUAL, clientBox: 'to Service web' },
    podSublabels: { client: BOTH_FAMILIES, pod: BOTH_FAMILIES },
    lit: ['config', 'svcV6'],
    // P-03, the same beat one block along: the second ClusterIP lands with the drop, not at entry.
    rewind: { chips: { svcV6: POD_DUAL.svcV6 } },
    flow: [
      F.segment({ from: DROP_SVC[0], to: DROP_SVC[1], name: 'drop', lights: ['svc'] }),
      F.set({ chips: { svcV6: DUAL.svcV6 }, at: 'drop' }),
    ],
  },
  {
    id: 'either-family',
    duration: 3400,
    narration: 'A client resolving the Service gets an A record and an AAAA record, and which one it dials is its own choice. Both work: the v4 ClusterIP over IPv4 and the v6 ClusterIP over IPv6, each rewritten to the Pod address of that family, and both land on the same Pod.',
    chips: { ...DUAL },
    sublabels: { svc: POLICY_DUAL, clientBox: 'A and AAAA resolved' },
    podSublabels: { client: BOTH_FAMILIES, pod: BOTH_FAMILIES },
    // The client acts first, so it is lit before its own ball leaves it (M-18a).
    lit: ['clientBox', 'svcV4', 'svcV6'],
    reducedLit: ['podBox'],
    // Both families leave together and arrive together: the mirror is the point of the step. The
    // Service lights on the first arrival and forwards a beat later, after the rewrite.
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: HOP1_V4[0], to: HOP1_V4[1], delay: BEAT.afterPulse, name: 'a1' }),
      F.segment({ from: HOP1_V6[0], to: HOP1_V6[1], delay: BEAT.afterPulse, name: 'b1' }),
      tagV4({ text: 'dst 10.96.0.20', points: HOP1_V4, delay: BEAT.afterPulse, dur: routeDur(HOP1_V4), easing: 'linear' }),
      tagV6({ text: 'dst fd00:96::a', points: HOP1_V6, delay: BEAT.afterPulse, dur: routeDur(HOP1_V6), easing: 'linear' }),
      F.light({ targets: ['svc'], at: 'a1' }),
      F.segment({ from: HOP2_V4[0], to: HOP2_V4[1], after: 'a1', name: 'a2' }),
      F.segment({ from: HOP2_V6[0], to: HOP2_V6[1], after: 'b1', name: 'b2' }),
      tagV4({ text: 'dst 10.244.1.5', points: HOP2_V4, after: 'a1', dur: routeDur(HOP2_V4), easing: 'linear' }),
      tagV6({ text: 'dst fd00::1:5', points: HOP2_V6, after: 'b1', dur: routeDur(HOP2_V6), easing: 'linear' }),
      F.pulse({ pod: 'pod', at: 'a2' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
