import { P, F, defineCard, makeRidingLabel, routeDur, shade, BEAT, OPACITY } from './network-kit.js';
import { g, rect, text, line, path } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/network-flat-pod-network.md

// Band, Pods and chips move with RAISE while the Kubelet keeps KUBELET_Y, so the gap between them
// is deliberate. RAISE centres the whole card vertically.
const RAISE = 52;
const SCHEME_L = 120, SCHEME_R = 1080;   // content edges, mirrored about x=600
const BAND_X = SCHEME_L, BAND_W = SCHEME_R - SCHEME_L;
const BAND_H = 80;                       // the rail clears both text rows
const BAND_Y = 302 - RAISE;
const BAND_BOTTOM = BAND_Y + BAND_H;     // Pod wires meet the band here
const LABEL_LOCAL_Y = 27;                // 'Flat Pod Network' row, upper third
const RAIL_LOCAL_Y = 42;                 // dashed bus spine, centred in the gap between the two text rows
const SUBLABEL_LOCAL_Y = 61;             // sublabel row, lower third
const BUS_Y = BAND_Y + RAIL_LOCAL_Y;     // the spine the packet rides along
const CHIP_H = 34, CHIP_GAP = 21, CHIP_W = (SCHEME_R - SCHEME_L - 2 * CHIP_GAP) / 3;
const chipX = (i) => SCHEME_L + i * (CHIP_W + CHIP_GAP);

// Each Node is a frame around its own Pods. The Pod wires cross the frame edge and land on the
// Pod: the wire is a Pod attaching itself to the space, not an actor reaching into a Node.
const NODE_PAD = 28;                     // side and inner padding, matching network-pod-to-pod-cross-node
const NODE_HEAD = 34;                    // frame top to Pod top, the label band of every frame
const NODE_FOOT = 12;                    // Pod bottom to frame bottom
const POD_W = 180;
const POD_H = 120;
const POD_SPLIT = 20;                    // tighter than the frame gap so the pair reads as one Node
const N1_W = 2 * NODE_PAD + 2 * POD_W + POD_SPLIT;
const N_W = 2 * NODE_PAD + POD_W;                    // a one-Pod Node
const NODE_GAP = (BAND_W - N1_W - 2 * N_W) / 2;
const N1_X = BAND_X;
const N2_X = N1_X + N1_W + NODE_GAP;
const N3_X = N2_X + N_W + NODE_GAP;      // right edge on SCHEME_R
const NODE_DROP = 40;                    // band floor to frame top: the space and the Nodes stay apart
const NODE_Y = BAND_BOTTOM + NODE_DROP;
const POD_TOP = NODE_Y + NODE_HEAD;
const NODE_H = NODE_HEAD + POD_H + NODE_FOOT;
const NODE_BOTTOM = NODE_Y + NODE_H;
const CHIP_Y = NODE_BOTTOM + 20;

const AX = N1_X + NODE_PAD + POD_W / 2;
const BX = AX + POD_W + POD_SPLIT;
const CX = N2_X + NODE_PAD + POD_W / 2;
const DX = N3_X + NODE_PAD + POD_W / 2;

// Idle shows a placeholder: step 1 is where each Pod gets its address.
const POD_IPS = ['10.244.1.5', '10.244.1.6', '10.244.2.7', '10.244.3.4'];
const IP_PENDING = 'x.x.x.x';
// The same address twice per Pod: on its interface (what it sees) and on its state line (what
// others dial). Rule one is that those two strings are equal.
const IFACE = (ip) => `eth0 ${ip}`;
// The catalog actor block (NET.L-01).
const KUBELET_W = 232, KUBELET_H = 80;
const KUBELET_X = BAND_X + BAND_W / 2;   // centred over the band
const KUBELET_Y = 52;
const KUBELET_BOTTOM = KUBELET_Y + KUBELET_H;

// Up the wire, across the rail, down the far wire.
const A_TO_C = [[AX, POD_TOP], [AX, BUS_Y], [CX, BUS_Y], [CX, POD_TOP]];
// Same-Node is no special case, just a shorter ride.
const A_TO_B = [[AX, POD_TOP], [AX, BUS_Y], [BX, BUS_Y], [BX, POD_TOP]];
const KUBELET_TO_C = [[KUBELET_X, KUBELET_BOTTOM], [KUBELET_X, BUS_Y], [CX, BUS_Y], [CX, POD_TOP]];

// NET.L-01, level with the Kubelet, centred 28 clear of the Pod D wire.
const CNI_W = 232, CNI_H = 80;
const CNI_X = DX + 28;
const CNI_Y = KUBELET_Y;
const CNI_BOTTOM = CNI_Y + CNI_H;
// Ends on the rail itself, with no arrowhead since nothing discrete travels it. Drawn exactly as
// the rail: the plugin reaching the fabric must not read fainter than the fabric.
const CNI_CONNECTOR = [[CNI_X, CNI_BOTTOM], [CNI_X, BUS_Y]];

// Band-local: one spine, a tooth down to each Pod, and an extension to the band edge for the CNI step.
const POD_LOCAL_X = [AX, BX, CX, DX].map(x => x - BAND_X);
const RAIL_LAST_X = POD_LOCAL_X[POD_LOCAL_X.length - 1];
const RAIL_SPINE = `M ${POD_LOCAL_X[0]} ${RAIL_LOCAL_Y} L ${RAIL_LAST_X} ${RAIL_LOCAL_Y}`;
const RAIL_TEETH = POD_LOCAL_X.map(px => `M ${px} ${RAIL_LOCAL_Y} L ${px} ${BAND_H}`).join(' ');
const RAIL_D = `${RAIL_SPINE} ${RAIL_TEETH}`;
const RAIL_EXT = [[RAIL_LAST_X, RAIL_LOCAL_Y], [BAND_W, RAIL_LOCAL_Y]];

const BUS_SUBLABEL = 'one cluster-wide address space';

// No arrowhead: the spine is direction-less and the Pod wires carry the heads.
const railPath = (points) => path({
  class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-network',
  'data-role': 'network', fill: 'none',
  d: typeof points === 'string' ? points : points.map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' '),
});

// Built by hand so a dashed rail can sit between the label and the sublabel: no part kind does that.
function busBand(refs) {
  const bus = g({ class: 'scheme-box', 'data-role': 'network', transform: `translate(${BAND_X},${BAND_Y})` });
  bus.appendChild(rect({ class: 'scheme-box-rect', x: 0, y: 0, width: BAND_W, height: BAND_H, rx: 6, ry: 6 }));
  bus.appendChild(text({ class: 'scheme-box-label', x: BAND_W / 2, y: LABEL_LOCAL_Y, 'text-anchor': 'middle' }, ['Flat Pod Network']));
  bus.appendChild(text({ class: 'scheme-box-sublabel', x: BAND_W / 2, y: SUBLABEL_LOCAL_Y, 'text-anchor': 'middle' }, [BUS_SUBLABEL]));
  // Not a relation: balls ride it (NET.A-04).
  refs.busRail = railPath(RAIL_D);
  bus.appendChild(refs.busRail);
  refs.busRailExt = railPath(RAIL_EXT);
  refs.busRailExt.style.opacity = '0';
  bus.appendChild(refs.busRailExt);
  return bus;
}

// Hidden until the CNI step reveals it.
function cniConnector() {
  const el = railPath(CNI_CONNECTOR);
  el.style.opacity = '0';
  return el;
}

// Double-headed, which pathArrow cannot draw, hence P.raw. The role class keeps the saturated
// network colour: `dim` stays a stroke weight.
const podWire = (x) => line({
  class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-network',
  'data-role': 'network',
  x1: x, y1: BAND_BOTTOM, x2: x, y2: POD_TOP,
  'marker-start': 'url(#arrowhead-net)', 'marker-end': 'url(#arrowhead-net)',
});

// Each Pod hands its sublabel up as a ref for the address fade. The tune assigns a literal key
// (unit/spec-steps.test.mjs).
const podPart = ({ key, innerKey, tune, x, label }) => P.pod({
  key, innerKey, tune, x: x - POD_W / 2, y: POD_TOP, w: POD_W, h: POD_H, label, sublabel: IP_PENDING,
  inner: { dx: 18, dy: 34, w: POD_W - 36, h: 50, label: 'app', sublabel: IFACE(IP_PENDING) },
});
const SUB = '.scheme-pod-sublabel';
// The Pod shell carries no .scheme-box-sublabel of its own, so this reaches the inner box's line.
const IFACE_SUB = '.scheme-box-sublabel';

export const SCENE = {
  'aria-label': 'The Kubernetes network model, drawn as four Pods across three Nodes: every Pod attaches to one flat cluster-wide address space, any Pod reaches any other Pod on any Node with no NAT barring intentional segmentation, the model promises the Kubelet only the Pods on its own Node, and the container runtime on each Node implements the model, almost always through a CNI plugin',
  parts: [
    P.defs(),
    P.raw({ key: 'bus', make: busBand }),
    P.box({ key: 'kubelet', x: KUBELET_X - KUBELET_W / 2, y: KUBELET_Y, w: KUBELET_W, h: KUBELET_H, label: 'Kubelet', sublabel: 'Node agent on Node-2' }),
    // Hidden until the last step.
    P.box({ key: 'cni', x: CNI_X - CNI_W / 2, y: CNI_Y, w: CNI_W, h: CNI_H, label: 'CNI plugin', sublabel: 'Calico · Cilium · Flannel', opacity: 0 }),
    P.node({ key: 'node1', x: N1_X, y: NODE_Y, w: N1_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'node2', x: N2_X, y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-2' }),
    P.node({ key: 'node3', x: N3_X, y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-3' }),
    podPart({ key: 'podA', innerKey: 'podABox', tune: (el, refs) => { refs.podASub = el.querySelector(SUB); refs.podAIface = el.querySelector(IFACE_SUB); }, x: AX, label: 'Pod' }),
    podPart({ key: 'podB', innerKey: 'podBBox', tune: (el, refs) => { refs.podBSub = el.querySelector(SUB); refs.podBIface = el.querySelector(IFACE_SUB); }, x: BX, label: 'Pod' }),
    podPart({ key: 'podC', innerKey: 'podCBox', tune: (el, refs) => { refs.podCSub = el.querySelector(SUB); refs.podCIface = el.querySelector(IFACE_SUB); }, x: CX, label: 'Pod' }),
    podPart({ key: 'podD', innerKey: 'podDBox', tune: (el, refs) => { refs.podDSub = el.querySelector(SUB); refs.podDIface = el.querySelector(IFACE_SUB); }, x: DX, label: 'Pod' }),
    P.raw({ key: 'wireA', make: () => podWire(AX) }),
    P.raw({ key: 'wireB', make: () => podWire(BX) }),
    P.raw({ key: 'wireC', make: () => podWire(CX) }),
    P.raw({ key: 'wireD', make: () => podWire(DX) }),
    // The one single-headed line on the card.
    P.arrow({ from: [KUBELET_X, KUBELET_BOTTOM], to: [KUBELET_X, BAND_Y], dashed: true, dim: true }),
    P.raw({ key: 'cniWire', make: cniConnector }),
    P.chip({ key: 'ipChip', x: chipX(0), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'Pod IP', value: 'one per Pod' }),
    P.chip({ key: 'natChip', x: chipX(1), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'NAT', value: 'none' }),
    P.chip({ key: 'reachChip', x: chipX(2), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'reachability', value: 'any to any' }),
    P.packets(),
  ],
  reset: {
    // Inner boxes listed by key (NET.S-02).
    keys: ['bus', 'kubelet', 'cni', 'node1', 'node2', 'node3', 'podABox', 'podBBox', 'podCBox', 'podDBox', 'ipChip', 'natChip', 'reachChip'],
    pods: ['podA', 'podB', 'podC', 'podD'],
  },
};

// dy -46 keeps the tag above the band label while its ball crosses on the rail.
const ridingLabel = makeRidingLabel({ role: 'network', dy: -46 });
const tag = (p) => F.tag({ fn: ridingLabel, ...p });

const REST = { podA: 1, podB: 1, podC: 1, podD: 1, node1: 1, node2: 1, node3: 1,
  wireA: 1, wireB: 1, wireC: 1, wireD: 1, cni: 0, cniWire: 0, busRailExt: 0 };
const PENDING_IPS = { podA: IP_PENDING, podB: IP_PENDING, podC: IP_PENDING, podD: IP_PENDING };
const REAL_IPS = { podA: POD_IPS[0], podB: POD_IPS[1], podC: POD_IPS[2], podD: POD_IPS[3] };
const BAND = { bus: BUS_SUBLABEL };
const PENDING_IFACE = { podABox: IFACE(IP_PENDING), podBBox: IFACE(IP_PENDING), podCBox: IFACE(IP_PENDING), podDBox: IFACE(IP_PENDING) };
const REAL_IFACE = { podABox: IFACE(POD_IPS[0]), podBBox: IFACE(POD_IPS[1]), podCBox: IFACE(POD_IPS[2]), podDBox: IFACE(POD_IPS[3]) };

// One fade for all eight lines: a stagger would say the Pods were addressed in an order.
const IP_FADE = { keyframes: [{ opacity: 0 }, { opacity: 1 }], options: { duration: 320, fill: 'forwards', easing: 'ease-out' } };
const CNI_FADE = { keyframes: [{ opacity: 0 }, { opacity: 1 }], options: { duration: 300, fill: 'forwards', easing: 'ease-out' } };
const MARCH = { keyframes: [{ strokeDashoffset: 0 }, { strokeDashoffset: -20 }], options: { duration: 700, iterations: Infinity, easing: 'linear' } };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { ipChip: 'one per Pod', natChip: 'none', reachChip: 'any to any' },
    sublabels: { ...BAND, ...PENDING_IFACE },
    podSublabels: PENDING_IPS,
    opacity: REST,
  },
  {
    id: 'pod-ip',
    duration: 2200,
    narration: 'Rule one: every Pod gets its own IP, unique across the entire cluster. A Pod sees that same address as the one other Pods use to reach it, so there is no port mapping and no rewriting to reason about.',
    chips: { ipChip: 'unique, cluster-wide', natChip: 'none', reachChip: 'any to any' },
    sublabels: { ...BAND, ...REAL_IFACE },
    podSublabels: REAL_IPS,
    opacity: REST,
    lit: ['ipChip'],
    // All four Pods pulse in the animated path, which no lights list names.
    reducedLit: ['podABox', 'podBBox', 'podCBox', 'podDBox'],
    flow: [
      F.anim({ target: 'podAIface', ...IP_FADE }),
      F.anim({ target: 'podASub', ...IP_FADE }),
      F.anim({ target: 'podBIface', ...IP_FADE }),
      F.anim({ target: 'podBSub', ...IP_FADE }),
      F.anim({ target: 'podCIface', ...IP_FADE }),
      F.anim({ target: 'podCSub', ...IP_FADE }),
      F.anim({ target: 'podDIface', ...IP_FADE }),
      F.anim({ target: 'podDSub', ...IP_FADE, name: 'ips' }),
      F.pulse({ pod: 'podA', at: 'ips' }),
      F.pulse({ pod: 'podB', at: 'ips' }),
      F.pulse({ pod: 'podC', at: 'ips' }),
      F.pulse({ pod: 'podD', at: 'ips' }),
    ],
  },
  {
    id: 'no-nat',
    duration: 3400,
    narration: 'Rule two: any Pod can reach any other Pod on any Node directly, with no NAT on the way, barring intentional segmentation such as a NetworkPolicy. The source address that arrives is the real Pod IP, here 10.244.1.5, even when the packet crosses to another Node.',
    // End state (S-13). The played path rewinds both chips and turns them over on the landing.
    chips: { ipChip: 'unique, cluster-wide', natChip: 'none, src 10.244.1.5', reachChip: 'cross-Node direct' },
    sublabels: { ...BAND, ...REAL_IFACE },
    podSublabels: REAL_IPS,
    opacity: REST,
    // The far Pod pulse is named here, and the chips light on the arrival, not at entry.
    reducedLit: ['podCBox', 'natChip', 'reachChip'],
    rewind: { chips: { natChip: 'none', reachChip: 'any to any' } },
    flow: [
      F.pulse({ pod: 'podA' }),
      F.route({ points: A_TO_C, delay: BEAT.afterPulse, name: 'hop' }),
      tag({ text: 'src 10.244.1.5', points: A_TO_C, delay: BEAT.afterPulse, dur: routeDur(A_TO_C) }),
      F.pulse({ pod: 'podC', at: 'hop' }),
      F.set({ at: 'hop', chipsCued: { natChip: 'none, src 10.244.1.5', reachChip: 'cross-Node direct' } }),
    ],
  },
  {
    id: 'same-node',
    duration: 2800,
    narration: 'Same address space on one Node too. Pod 10.244.1.5 reaches its neighbour 10.244.1.6, both on Node-1, with the same flat addressing and no NAT. The traffic never leaves the Node, but to the Pods it is the very same model, no special case to reason about.',
    // natChip carries the same value in from the step before, so only reachChip is cued (P-05).
    chips: { ipChip: 'unique, cluster-wide', natChip: 'none, src 10.244.1.5', reachChip: 'same-Node direct' },
    sublabels: { ...BAND, ...REAL_IFACE },
    podSublabels: REAL_IPS,
    opacity: REST,
    // The neighbour pulse, which no lights list names.
    reducedLit: ['podBBox', 'reachChip'],
    rewind: { chips: { reachChip: 'cross-Node direct' } },
    flow: [
      F.pulse({ pod: 'podA' }),
      F.route({ points: A_TO_B, delay: BEAT.afterPulse, name: 'hop' }),
      tag({ text: 'src 10.244.1.5', points: A_TO_B, delay: BEAT.afterPulse, dur: routeDur(A_TO_B) }),
      F.pulse({ pod: 'podB', at: 'hop' }),
      F.set({ at: 'hop', chipsCued: { reachChip: 'same-Node direct' } }),
    ],
  },
  {
    id: 'node-agent',
    duration: 2800,
    narration: 'Rule three is narrower, and it is about the guarantee and not the reach: the model promises the Kubelet only the Pods on its own Node. It talks to Pod 10.244.2.7 on Node-2 to run the probes that say whether that Pod is live and ready. Other Nodes are outside the promise.',
    chips: { ipChip: 'unique, cluster-wide', natChip: 'none', reachChip: 'agent to local Pod' },
    sublabels: { ...BAND, ...REAL_IFACE },
    podSublabels: REAL_IPS,
    // The other Nodes fade so the guarantee reads as local-only, not the any-to-any of rule two.
    opacity: { ...REST, ...shade(['podA', 'podB', 'podD', 'node1', 'node3', 'wireA', 'wireB', 'wireD'], OPACITY.notready) },
    // The sender must not be dark when its ball leaves (M-18a), so the kubelet alone lights at entry.
    lit: ['kubelet'],
    // The local Pod pulse is named here, and the chips light on the arrival, not at entry.
    reducedLit: ['podCBox', 'natChip', 'reachChip'],
    rewind: { chips: { natChip: 'none, src 10.244.1.5', reachChip: 'same-Node direct' } },
    flow: [
      F.route({ points: KUBELET_TO_C, name: 'hop', pulse: 'podC' }),
      F.set({ at: 'hop', chipsCued: { natChip: 'none', reachChip: 'agent to local Pod' } }),
    ],
  },
  {
    id: 'cni',
    duration: 2600,
    narration: 'Only a few parts of this live in the core. The container runtime on each Node implements the model, almost always through a CNI plugin such as Calico, Cilium or Flannel. Here the plugin lights up the whole fabric. Swap it and the model stays the same.',
    chips: { ipChip: 'unique, cluster-wide', natChip: 'none', reachChip: 'any to any' },
    // At most 30 characters, or the rail tooth at CX cuts through the sublabel.
    sublabels: { bus: 'built by the container runtime', ...REAL_IFACE },
    podSublabels: REAL_IPS,
    opacity: { podA: 1, podB: 1, podC: 1, podD: 1, node1: 1, node2: 1, node3: 1,
      wireA: 1, wireB: 1, wireC: 1, wireD: 1, cni: 1, cniWire: 1, busRailExt: 1 },
    lit: ['bus', 'cni', 'reachChip'],
    flow: [
      F.anim({ target: 'cni', ...CNI_FADE }),
      F.anim({ target: 'cniWire', ...CNI_FADE }),
      F.anim({ target: 'busRailExt', ...CNI_FADE }),
      F.anim({ target: 'cniWire', ...MARCH }),
      F.anim({ target: 'busRail', ...MARCH, delay: 120 }),
      F.anim({ target: 'busRailExt', ...MARCH, delay: 120 }),
      F.anim({ target: 'wireA', ...MARCH, delay: 240 }),
      F.anim({ target: 'wireB', ...MARCH, delay: 330 }),
      F.anim({ target: 'wireC', ...MARCH, delay: 420 }),
      F.anim({ target: 'wireD', ...MARCH, delay: 510 }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
