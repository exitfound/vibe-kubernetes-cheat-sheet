import { P, F, defineCard, makeRidingLabel, relationPath, routeDur, shade, BEAT, OPACITY } from './network-kit.js';
import { g, rect, text, line } from '../../lib/svg.js';

// Design notes for this card: ./CARDS.md#network-model


const RAISE = 64;                        // band/Pods/chips: net +10% up (lowered 5% from the old 96)
const KUBELET_RAISE = 96;                // kubelet stays one notch higher than the rest
const SCHEME_L = 120, SCHEME_R = 1080;   // content edges, mirrored about x=600
const BAND_X = SCHEME_L, BAND_W = SCHEME_R - SCHEME_L;   // flat-network band: 120..1080 (width is optimal, kept)
const BAND_H = 80;                       // taller, so the rail clears both text rows with room
const BAND_Y = 302 - RAISE;              // raised band top
const BAND_BOTTOM = BAND_Y + BAND_H;     // Pod wires meet the band here
const LABEL_LOCAL_Y = 27;                // 'Flat Pod Network' row, upper third
const RAIL_LOCAL_Y = 42;                 // dashed bus spine, centred in the gap between the two text rows
const SUBLABEL_LOCAL_Y = 61;             // sublabel row, lower third
const BUS_Y = BAND_Y + RAIL_LOCAL_Y;     // the spine the packet rides along
const POD_TOP = 440 - RAISE;             // Pods hang below the band
const CHIP_Y = 588 - RAISE;              // info chips row
const CHIP_H = 34, CHIP_GAP = 21, CHIP_W = (SCHEME_R - SCHEME_L - 2 * CHIP_GAP) / 3;   // 306
const chipX = (i) => SCHEME_L + i * (CHIP_W + CHIP_GAP);

const POD_W = 180;                       // Pod block width (matches podBlock)
const POD_N = 4;
const POD_GAP = (BAND_W - POD_N * POD_W) / (POD_N + 1);  // 48: equal end-margin and inner gap
const AX = BAND_X + POD_GAP + POD_W / 2;  // 258
const BX = AX + POD_W + POD_GAP;          // 486
const CX = BX + POD_W + POD_GAP;          // 714
const DX = CX + POD_W + POD_GAP;          // 942, right edge 1032 (POD_GAP in from the band edge)

// Pod IPs are not shown at idle: rule one (step 1) is where each Pod gets its address, so idle
// shows a pending placeholder and step 1 reveals the real IPs.
const POD_IPS = ['10.244.1.5', '10.244.1.6', '10.244.2.7', '10.244.3.4'];
const IP_PENDING = 'x.x.x.x';
const KUBELET_W = 220, KUBELET_H = 80;   // workloads-standard kubelet block size
const KUBELET_X = BAND_X + BAND_W / 2;   // 600: centred over the band
const KUBELET_Y = 192 - KUBELET_RAISE;   // kubelet top, held higher to open the gap to the band
const KUBELET_BOTTOM = KUBELET_Y + KUBELET_H;

// A -> band -> C (Node-1 Pod to Node-2 Pod): up the wire, across the rail, down the far wire.
const A_TO_C = [[AX, POD_TOP], [AX, BUS_Y], [CX, BUS_Y], [CX, POD_TOP]];
// A -> band -> B (both Node-1): the same flat path, just a shorter ride. Same-Node is no special case.
const A_TO_B = [[AX, POD_TOP], [AX, BUS_Y], [BX, BUS_Y], [BX, POD_TOP]];
// kubelet -> band -> C (the Node agent reaching its local Pod).
const KUBELET_TO_C = [[KUBELET_X, KUBELET_BOTTOM], [KUBELET_X, BUS_Y], [CX, BUS_Y], [CX, POD_TOP]];

const CNI_W = 180, CNI_H = 72;
const CNI_X = SCHEME_R - CNI_W / 2;       // 990: badge tucked under the right end of the content, so
const CNI_Y = KUBELET_Y + 4;              // the composition still ends on SCHEME_R and centres on 600
const CNI_BOTTOM = CNI_Y + CNI_H;
// CNI connector: straight down from the bottom-centre of the badge onto the bus spine itself, the
// one line inside the band. It stops on the rail rather than on a border, like the Pod wires do.
const CNI_CONNECTOR = [[CNI_X, CNI_BOTTOM], [CNI_X, BUS_Y]];

// The dashed bus inside the band, in band-local coordinates: one spine plus a tooth turning down
// toward each Pod, and a spine extension that reaches the band edge only on the CNI step.
const POD_LOCAL_X = [AX, BX, CX, DX].map(x => x - BAND_X);
const RAIL_LAST_X = POD_LOCAL_X[POD_LOCAL_X.length - 1];
const RAIL_SPINE = `M ${POD_LOCAL_X[0]} ${RAIL_LOCAL_Y} L ${RAIL_LAST_X} ${RAIL_LOCAL_Y}`;
const RAIL_TEETH = POD_LOCAL_X.map(px => `M ${px} ${RAIL_LOCAL_Y} L ${px} ${BAND_H}`).join(' ');
const RAIL_D = `${RAIL_SPINE} ${RAIL_TEETH}`;
const RAIL_EXT = [[RAIL_LAST_X, RAIL_LOCAL_Y], [BAND_W, RAIL_LOCAL_Y]];

const BUS_SUBLABEL = 'one cluster-wide address space';

// Flat-network band built by hand so a dashed rail can sit inside it, below the centred label and
// above the sublabel. No part kind carries a data-role plus six ordered children, so this is P.raw.
function busBand(refs) {
  const bus = g({ class: 'scheme-box', 'data-role': 'network', transform: `translate(${BAND_X},${BAND_Y})` });
  bus.appendChild(rect({ class: 'scheme-box-rect', x: 0, y: 0, width: BAND_W, height: BAND_H, rx: 6, ry: 6 }));
  bus.appendChild(text({ class: 'scheme-box-label', x: BAND_W / 2, y: LABEL_LOCAL_Y, 'text-anchor': 'middle' }, ['Flat Pod Network']));
  refs.busRail = relationPath({ d: RAIL_D });
  bus.appendChild(refs.busRail);
  refs.busRailExt = relationPath({ points: RAIL_EXT });
  refs.busRailExt.style.opacity = '0';
  bus.appendChild(refs.busRailExt);
  bus.appendChild(text({ class: 'scheme-box-sublabel', x: BAND_W / 2, y: SUBLABEL_LOCAL_Y, 'text-anchor': 'middle' }, [BUS_SUBLABEL]));
  return bus;
}

// Pod wires are bidirectional: traffic flows both ways between a Pod and the flat space, so each is
// a double-headed dashed <line>, which pathArrow cannot draw, hence four more P.raw parts.
const podWire = (x) => line({
  class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim',
  x1: x, y1: BAND_BOTTOM, x2: x, y2: POD_TOP,
  'marker-start': 'url(#arrowhead-dim)', 'marker-end': 'url(#arrowhead-dim)',
});

// The IP line inside a Pod fades in on the address step, so each Pod hands its sublabel child up as
// a ref: an animation target the part kinds have no key for. The tune is passed IN and assigns a
// LITERAL key, because unit/spec-steps.test.mjs reads escape bodies for `refs.x =` and a computed
// key is invisible to it: four writers would look like four targets that resolve to nothing.
const podPart = ({ key, innerKey, tune, x, label }) => P.pod({
  key, innerKey, tune, x: x - POD_W / 2, y: POD_TOP, w: POD_W, h: 120, label, sublabel: IP_PENDING,
  inner: { dx: 18, dy: 34, w: POD_W - 36, h: 50, label: 'app', sublabel: 'eth0' },
});
const SUB = '.scheme-pod-sublabel';

// Z-order: band + kubelet + cni + pods, then the dim wires ABOVE them, then chips, then packets.
export const SCENE = {
  'aria-label': 'The Kubernetes network model: every Pod attaches to one flat cluster-wide address space, any Pod reaches any other Pod on any Node with no NAT, the Node agent reaches its local Pods, and a CNI plugin is what implements the model',
  parts: [
    P.defs(),
    P.raw({ key: 'bus', make: busBand }),
    P.box({ key: 'kubelet', x: KUBELET_X - KUBELET_W / 2, y: KUBELET_Y, w: KUBELET_W, h: KUBELET_H, label: 'Kubelet', sublabel: 'Node agent on Node-2' }),
    // CNI plugin badge + its wire into the band. Hidden until the last step, where it is revealed
    // as the thing that implements the flat space.
    P.box({ key: 'cni', x: CNI_X - CNI_W / 2, y: CNI_Y, w: CNI_W, h: CNI_H, label: 'CNI plugin', sublabel: 'Calico . Cilium . Flannel', opacity: 0 }),
    podPart({ key: 'podA', innerKey: 'podABox', tune: (el, refs) => { refs.podASub = el.querySelector(SUB); }, x: AX, label: 'Pod . Node-1' }),
    podPart({ key: 'podB', innerKey: 'podBBox', tune: (el, refs) => { refs.podBSub = el.querySelector(SUB); }, x: BX, label: 'Pod . Node-1' }),
    podPart({ key: 'podC', innerKey: 'podCBox', tune: (el, refs) => { refs.podCSub = el.querySelector(SUB); }, x: CX, label: 'Pod . Node-2' }),
    podPart({ key: 'podD', innerKey: 'podDBox', tune: (el, refs) => { refs.podDSub = el.querySelector(SUB); }, x: DX, label: 'Pod . Node-3' }),
    P.raw({ key: 'wireA', make: () => podWire(AX) }),
    P.raw({ key: 'wireB', make: () => podWire(BX) }),
    P.raw({ key: 'wireC', make: () => podWire(CX) }),
    P.raw({ key: 'wireD', make: () => podWire(DX) }),
    // kubelet down to the band stays a single directional reach. It and the CNI wire predate the kit
    // binding and carry NO role, so `role: ''` keeps the neutral dim arrowhead.
    P.arrow({ from: [KUBELET_X, KUBELET_BOTTOM], to: [KUBELET_X, BAND_Y], dashed: true, dim: true, role: '' }),
    P.lane({ key: 'cniWire', points: CNI_CONNECTOR, dashed: true, dim: true, role: '', opacity: 0 }),
    // Info chips stretched evenly across the whole composition: left edge on the band left,
    // right edge on the CNI badge right, so the strip spans SCHEME_L..SCHEME_R and centres on 600.
    P.chip({ key: 'ipChip', x: chipX(0), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'Pod IP', value: 'one per Pod' }),
    P.chip({ key: 'natChip', x: chipX(1), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'NAT', value: 'none' }),
    P.chip({ key: 'reachChip', x: chipX(2), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'reachability', value: 'any to any' }),
    P.packets(),
  ],
  reset: {
    // The four container boxes are keys, not pod groups: the pod-group list only resets inline pulse
    // strokes, so a .highlight put on a container stayed on for the rest of the card.
    keys: ['bus', 'kubelet', 'cni', 'podABox', 'podBBox', 'podCBox', 'podDBox', 'ipChip', 'natChip', 'reachChip'],
    pods: ['podA', 'podB', 'podC', 'podD'],
  },
};

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy, so the
// factory is built once and handed to every F.tag as `fn`.
const ridingLabel = makeRidingLabel({ role: 'network', dy: -15, inMs: 160, outMs: 200, hold: 260 });
const tag = (p) => F.tag({ fn: ridingLabel, ...p });

// Pods return to full opacity (the node-agent step dims out-of-scope ones), and the CNI badge with
// the spine extension stay hidden until the CNI step reveals them.
const REST = { podA: 1, podB: 1, podC: 1, podD: 1, cni: 0, cniWire: 0, busRailExt: 0 };
const PENDING_IPS = { podA: IP_PENDING, podB: IP_PENDING, podC: IP_PENDING, podD: IP_PENDING };
const REAL_IPS = { podA: POD_IPS[0], podB: POD_IPS[1], podC: POD_IPS[2], podD: POD_IPS[3] };

// The address line fading in as it appears, one per Pod, in Pod order.
const IP_FADE = { keyframes: [{ opacity: 0 }, { opacity: 1 }], options: { duration: 320, fill: 'forwards', easing: 'ease-out' } };
// A block coming into view on the CNI step, and the marching dashes that read as current flowing
// along a dim wire without touching its dash pattern.
const CNI_FADE = { keyframes: [{ opacity: 0 }, { opacity: 1 }], options: { duration: 300, fill: 'forwards', easing: 'ease-out' } };
const MARCH = { keyframes: [{ strokeDashoffset: 0 }, { strokeDashoffset: -20 }], options: { duration: 700, iterations: Infinity, easing: 'linear' } };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { ipChip: 'one per Pod', natChip: 'none', reachChip: 'any to any' },
    sublabels: { bus: BUS_SUBLABEL },
    podSublabels: PENDING_IPS,
    opacity: REST,
  },
  {
    id: 'pod-ip',
    duration: 2200,
    narration: 'Rule one: every Pod gets its own IP, unique across the entire cluster. A Pod sees that same address as the one other Pods use to reach it, so there is no port mapping and no rewriting to reason about.',
    chips: { ipChip: 'unique, cluster-wide', natChip: 'none', reachChip: 'any to any' },
    sublabels: { bus: BUS_SUBLABEL },
    // The address appears here: x.x.x.x at idle becomes the real Pod IP on this step.
    podSublabels: REAL_IPS,
    opacity: REST,
    lit: ['ipChip'],
    // The animated path says every Pod owns an address by PULSING all four, which no lights list names.
    reducedLit: ['podABox', 'podBBox', 'podCBox', 'podDBox'],
    // The IP text fades in Pod by Pod, then all four pulse together to read as one address space.
    flow: [
      F.anim({ target: 'podASub', ...IP_FADE }),
      F.anim({ target: 'podBSub', ...IP_FADE }),
      F.anim({ target: 'podCSub', ...IP_FADE }),
      F.anim({ target: 'podDSub', ...IP_FADE }),
      F.pulse({ pod: 'podA' }),
      F.pulse({ pod: 'podB' }),
      F.pulse({ pod: 'podC' }),
      F.pulse({ pod: 'podD' }),
    ],
  },
  {
    id: 'no-nat',
    duration: 3300,
    narration: 'Rule two: any Pod can reach any other Pod on any Node directly, with no NAT on the way. The source address that arrives is the real Pod IP, here 10.244.1.5, even when the packet crosses to another Node.',
    chips: { ipChip: 'unique, cluster-wide', natChip: 'none, src 10.244.1.5', reachChip: 'cross-Node direct' },
    sublabels: { bus: BUS_SUBLABEL },
    podSublabels: REAL_IPS,
    opacity: REST,
    lit: ['natChip', 'reachChip'],
    // The animated path says the far Pod was reached by PULSING it, which no lights list can name.
    reducedLit: ['podCBox'],
    // Up-arrow: the sender pulses first. The route omits `dur` (canon: routeDur normalizes by
    // length) and the tag uses the same routeDur so it stays locked to the packet.
    flow: [
      F.pulse({ pod: 'podA' }),
      F.route({ points: A_TO_C, delay: BEAT.afterPulse, name: 'hop' }),
      tag({ text: 'src 10.244.1.5', points: A_TO_C, delay: BEAT.afterPulse, dur: routeDur(A_TO_C) }),
      F.pulse({ pod: 'podC', at: 'hop' }),
    ],
  },
  {
    id: 'same-node',
    duration: 2800,
    narration: 'Same address space on one Node too. Pod 10.244.1.5 reaches its neighbour 10.244.1.6, both on Node-1, with the same flat addressing and no NAT. The traffic never leaves the Node, but to the Pods it is the very same model, no special case to reason about.',
    // NAT still applies on the same-Node path: the src arrives unchanged, so the chip stays
    // highlighted and current, not dropped while its neighbour stays lit.
    chips: { ipChip: 'unique, cluster-wide', natChip: 'none, src 10.244.1.5', reachChip: 'same-Node direct' },
    sublabels: { bus: BUS_SUBLABEL },
    podSublabels: REAL_IPS,
    opacity: REST,
    lit: ['natChip', 'reachChip'],
    // The animated path says the neighbour was reached by PULSING it, which no lights list can name.
    reducedLit: ['podBBox'],
    // Same mechanism as cross-Node, just a shorter ride: A pulses, packet rides A -> B, B pulses.
    // The same src-IP tag rides along and arrives unchanged, no NAT on the local path either.
    flow: [
      F.pulse({ pod: 'podA' }),
      F.route({ points: A_TO_B, delay: BEAT.afterPulse, name: 'hop' }),
      tag({ text: 'src 10.244.1.5', points: A_TO_B, delay: BEAT.afterPulse, dur: routeDur(A_TO_B) }),
      F.pulse({ pod: 'podB', at: 'hop' }),
    ],
  },
  {
    id: 'node-agent',
    duration: 2400,
    narration: 'Rule three is narrower: the Node agent, the Kubelet, reaches only the Pods on its own Node. The Kubelet on Node-2 talks to Pod 10.244.2.7, its local Pod, to run the HTTP and TCP probes that decide whether it is live and ready. Pods on other Nodes are out of this guarantee.',
    chips: { ipChip: 'unique, cluster-wide', natChip: 'none', reachChip: 'agent to local Pod' },
    sublabels: { bus: BUS_SUBLABEL },
    podSublabels: REAL_IPS,
    // Local scope: the kubelet on Node-2 reaches only its Node-2 Pod (C). Fade the other Nodes
    // out so the guarantee reads as local-only, not the any-to-any of rule two.
    opacity: { ...REST, ...shade(['podA', 'podB', 'podD'], OPACITY.notready) },
    lit: ['kubelet', 'reachChip', 'natChip'],
    // The animated path says the local Pod was reached by PULSING it, which no lights list can name.
    reducedLit: ['podCBox'],
    // Down-arrow: infrastructure reaches a Pod, so the packet goes first and the Pod pulses on
    // arrival.
    flow: [
      F.route({ points: KUBELET_TO_C, name: 'hop' }),
      F.pulse({ pod: 'podC', at: 'hop' }),
    ],
  },
  {
    id: 'cni',
    duration: 2600,
    narration: 'None of this is hard-wired into the core. A CNI plugin, such as Calico, Cilium or Flannel, is what attaches every Pod to the flat space and upholds all of these rules. Here it lights up the whole fabric. Swap the plugin and the model stays the same.',
    chips: { ipChip: 'unique, cluster-wide', natChip: 'none', reachChip: 'agent to local Pod' },
    sublabels: { bus: 'implemented by your CNI plugin' },
    podSublabels: REAL_IPS,
    // The badge, its wire, and the spine reaching the band's right edge to meet that wire, all of
    // which the animated path fades in on top of this resting state.
    opacity: { podA: 1, podB: 1, podC: 1, podD: 1, cni: 1, cniWire: 1, busRailExt: 1 },
    lit: ['bus', 'cni'],
    // The badge appears and energizes the fabric: the bus spine and every Pod wire get marching
    // dashes, as if the plugin is wiring the whole flat space at once.
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
