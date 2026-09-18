import { P, F, defineCard, makeRidingLabel, routeDur, shade, BEAT, OPACITY } from './network-kit.js';
import { g, rect, text, line, path } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/network-model.md


// Band, Pods and chips all move with RAISE, a net 10% lift, while the kubelet keeps its own higher
// KUBELET_RAISE, so the gap between it and the band is deliberate rather than left over. Pod centres
// are spread with equal end-margins inside SCHEME_L..SCHEME_R.
const RAISE = 64;
const SCHEME_L = 120, SCHEME_R = 1080;   // content edges, mirrored about x=600
const BAND_X = SCHEME_L, BAND_W = SCHEME_R - SCHEME_L;   // flat-network band: 120..1080 (width is optimal, kept)
const BAND_H = 80;                       // taller, so the rail clears both text rows with room
const BAND_Y = 302 - RAISE;              // raised band top
const BAND_BOTTOM = BAND_Y + BAND_H;     // Pod wires meet the band here
const LABEL_LOCAL_Y = 27;                // 'Flat Pod Network' row, upper third
const RAIL_LOCAL_Y = 42;                 // dashed bus spine, centred in the gap between the two text rows
const SUBLABEL_LOCAL_Y = 61;             // sublabel row, lower third
const BUS_Y = BAND_Y + RAIL_LOCAL_Y;     // the spine the packet rides along
const CHIP_H = 34, CHIP_GAP = 21, CHIP_W = (SCHEME_R - SCHEME_L - 2 * CHIP_GAP) / 3;   // 306
const chipX = (i) => SCHEME_L + i * (CHIP_W + CHIP_GAP);

// Which Node each Pod sits on, drawn as a FRAME around its own Pods. `node()` is already dashed
// 6 4 in the CSS, so the Node reads as an outline rather than as a second solid block, and the
// frame carries the name at its own top-left corner. The Pod wires cross the frame edge and land on
// the POD: the wire is a Pod attaching itself to the space, not an actor reaching into a Node.
const NODE_PAD = 28;                     // side and inner padding, matching network-pod-to-pod-cross-node
const NODE_HEAD = 40;                    // frame top to Pod top, room for the uppercased frame label
const NODE_FOOT = 30;                    // Pod bottom to frame bottom
const POD_W = 180;                       // Pod block width (matches podBlock)
const POD_H = 120;
const POD_SPLIT = 20;                    // between the two Pods INSIDE Node-1, tighter than the gap
                                         // between frames so the pair reads as one Node unaided
const N1_W = 2 * NODE_PAD + 2 * POD_W + POD_SPLIT;   // 436
const N_W = 2 * NODE_PAD + POD_W;                    // 236, a one-Pod Node
const NODE_GAP = (BAND_W - N1_W - 2 * N_W) / 2;      // 26: what is left over, split evenly
const N1_X = BAND_X;                     // 120
const N2_X = N1_X + N1_W + NODE_GAP;     // 582
const N3_X = N2_X + N_W + NODE_GAP;      // 844, right edge on SCHEME_R
const NODE_DROP = 40;                    // band floor to frame top: the flat space is one thing and
                                         // the Nodes are another, so the gap between them is stated
const NODE_Y = BAND_BOTTOM + NODE_DROP;  // 358: the Pod wires cross this edge on their way down
const POD_TOP = NODE_Y + NODE_HEAD;      // 398
const NODE_H = NODE_HEAD + POD_H + NODE_FOOT;        // 190
const NODE_BOTTOM = NODE_Y + NODE_H;     // 548
const CHIP_Y = NODE_BOTTOM + 20;         // 568, and 38 clear of the 640 viewBox floor

const AX = N1_X + NODE_PAD + POD_W / 2;   // 238
const BX = AX + POD_W + POD_SPLIT;        // 438
const CX = N2_X + NODE_PAD + POD_W / 2;   // 700
const DX = N3_X + NODE_PAD + POD_W / 2;   // 962

// Pod IPs are not shown at idle: rule one (step 1) is where each Pod gets its address, so idle
// shows a pending placeholder and step 1 reveals the real IPs.
const POD_IPS = ['10.244.1.5', '10.244.1.6', '10.244.2.7', '10.244.3.4'];
const IP_PENDING = 'x.x.x.x';
// The SAME address written twice per Pod: on the interface inside it, which is what the Pod itself
// sees, and on its state line outside, which is what other Pods dial. Rule one IS that those two
// strings are equal, so both are drawn and neither is a generic placeholder.
const IFACE = (ip) => `eth0 ${ip}`;
// The top-centre actor block of `workloads-replicaset`: WL.CX 600, WL.TOP_Y 40, 232 x WL.BOX_H 80,
// which is the width 14 cluster cards share. It is as high as a block goes in this catalog, and the
// height it frees is what opens the gap between the band and the Node frames below it.
const KUBELET_W = 232, KUBELET_H = 80;
const KUBELET_X = BAND_X + BAND_W / 2;   // 600: centred over the band, 484..716
const KUBELET_Y = 40;
const KUBELET_BOTTOM = KUBELET_Y + KUBELET_H;   // 120

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
// It carries no arrowhead, because nothing discrete travels it, and otherwise it is drawn EXACTLY
// as the rail is: the plugin reaching the fabric must not read fainter than the fabric.
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

// The bus rail, at full stroke-opacity in the category colour and with no arrowhead: the spine is
// direction-less and the Pod wires either side of it carry the heads.
const railPath = (points) => path({
  class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-network',
  'data-role': 'network', fill: 'none',
  d: typeof points === 'string' ? points : points.map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' '),
});

// Flat-network band built by hand so a dashed rail can sit inside it, below the centred label and
// above the sublabel. No part kind carries a data-role plus six ordered children, so this is P.raw.
function busBand(refs) {
  const bus = g({ class: 'scheme-box', 'data-role': 'network', transform: `translate(${BAND_X},${BAND_Y})` });
  bus.appendChild(rect({ class: 'scheme-box-rect', x: 0, y: 0, width: BAND_W, height: BAND_H, rx: 6, ry: 6 }));
  bus.appendChild(text({ class: 'scheme-box-label', x: BAND_W / 2, y: LABEL_LOCAL_Y, 'text-anchor': 'middle' }, ['Flat Pod Network']));
  bus.appendChild(text({ class: 'scheme-box-sublabel', x: BAND_W / 2, y: SUBLABEL_LOCAL_Y, 'text-anchor': 'middle' }, [BUS_SUBLABEL]));
  // The rail goes on LAST, over everything the band draws, and it is NOT a relation: balls ride it,
  // so `scheme-arrow-relation` and its 0.45 would sink a route behind the wires that feed it. The
  // CSS note says the same in the other direction, a relationship must not read as a route.
  refs.busRail = railPath(RAIL_D);
  bus.appendChild(refs.busRail);
  refs.busRailExt = railPath(RAIL_EXT);
  refs.busRailExt.style.opacity = '0';
  bus.appendChild(refs.busRailExt);
  return bus;
}

// The plugin connector, built by the rail factory and hidden until the CNI step reveals it.
function cniConnector() {
  const el = railPath(CNI_CONNECTOR);
  el.style.opacity = '0';
  return el;
}

// Pod wires are bidirectional: traffic flows both ways between a Pod and the flat space, so each is
// a double-headed dashed <line>, which pathArrow cannot draw, hence four more P.raw parts. They
// carry the ROLE class and the role marker, so the wire and its arrowheads take the saturated
// network stop rgb(79, 229, 255) instead of the role-less rgb(53, 125, 140): `dim` stays a stroke
// WEIGHT and the role owns the colour, which is what every workloads and cluster card does.
const podWire = (x) => line({
  class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-network',
  'data-role': 'network',
  x1: x, y1: BAND_BOTTOM, x2: x, y2: POD_TOP,
  'marker-start': 'url(#arrowhead-net)', 'marker-end': 'url(#arrowhead-net)',
});

// The IP line fades in on the address step, so each Pod hands its sublabel child up as a ref: an
// animation target no part kind keys. The tune assigns a LITERAL key (unit/spec-steps.test.mjs).
const podPart = ({ key, innerKey, tune, x, label }) => P.pod({
  key, innerKey, tune, x: x - POD_W / 2, y: POD_TOP, w: POD_W, h: POD_H, label, sublabel: IP_PENDING,
  inner: { dx: 18, dy: 34, w: POD_W - 36, h: 50, label: 'app', sublabel: IFACE(IP_PENDING) },
});
const SUB = '.scheme-pod-sublabel';
// The Pod shell carries no .scheme-box-sublabel of its own, so this reaches the inner box's line.
const IFACE_SUB = '.scheme-box-sublabel';

// Z-order: band + kubelet + cni, then the Node frames, then the pods inside them, then the wires
// ABOVE all of it, then chips, then packets.
export const SCENE = {
  'aria-label': 'The Kubernetes network model, drawn as four Pods across three Nodes: every Pod attaches to one flat cluster-wide address space, any Pod reaches any other Pod on any Node with no NAT barring intentional segmentation, the model promises the Kubelet only the Pods on its own Node, and the container runtime on each Node implements the model, almost always through a CNI plugin',
  parts: [
    P.defs(),
    P.raw({ key: 'bus', make: busBand }),
    P.box({ key: 'kubelet', x: KUBELET_X - KUBELET_W / 2, y: KUBELET_Y, w: KUBELET_W, h: KUBELET_H, label: 'Kubelet', sublabel: 'Node agent on Node-2' }),
    // CNI plugin badge + its wire into the band. Hidden until the last step, where it is revealed
    // as the thing that implements the flat space.
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
    // kubelet down to the band stays a single directional reach, and it is the one SINGLE-headed
    // line on the card: every other head here belongs to a double-headed Pod wire above. The role
    // is left to the kit binding (`S-42`), so line and arrowhead both land on the saturated network
    // stop instead of the role-less dim token.
    P.arrow({ from: [KUBELET_X, KUBELET_BOTTOM], to: [KUBELET_X, BAND_Y], dashed: true, dim: true }),
    P.raw({ key: 'cniWire', make: cniConnector }),
    // Info chips stretched evenly across the whole composition: left edge on the band left,
    // right edge on the CNI badge right, so the strip spans SCHEME_L..SCHEME_R and centres on 600.
    P.chip({ key: 'ipChip', x: chipX(0), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'Pod IP', value: 'one per Pod' }),
    P.chip({ key: 'natChip', x: chipX(1), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'NAT', value: 'none' }),
    P.chip({ key: 'reachChip', x: chipX(2), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'reachability', value: 'any to any' }),
    P.packets(),
  ],
  reset: {
    // The four container boxes are keys, not pod groups: the pod-group list only resets inline pulse
    // strokes, so a .highlight put on a container would stay on for the rest of the card.
    keys: ['bus', 'kubelet', 'cni', 'node1', 'node2', 'node3', 'podABox', 'podBBox', 'podCBox', 'podDBox', 'ipChip', 'natChip', 'reachChip'],
    pods: ['podA', 'podB', 'podC', 'podD'],
  },
};

// The tag that rides a ball on this card, built once here and handed to every F.tag as `fn`: hold 260
// leaves the source IP standing after the ball lands, which is how a step shows it arrived unchanged.
// dy -46 is the middle of a four unit window. The ball crosses on the rail at BUS_Y 280 with the band
// label at 265, so the tag has to clear the band TOP on the crossing (dy <= -45) and the band FLOOR at
// rest (dy >= -48): ink 226..235 crossing, 3 under the top, and 322..331 at rest, 4 under the floor.
const ridingLabel = makeRidingLabel({ role: 'network', dy: -46, inMs: 160, outMs: 200, hold: 260 });
const tag = (p) => F.tag({ fn: ridingLabel, ...p });

// Pods return to full opacity (the node-agent step dims out-of-scope ones), and the CNI badge with
// the spine extension stay hidden until the CNI step reveals them.
const REST = { podA: 1, podB: 1, podC: 1, podD: 1, node1: 1, node2: 1, node3: 1,
  wireA: 1, wireB: 1, wireC: 1, wireD: 1, cni: 0, cniWire: 0, busRailExt: 0 };
const PENDING_IPS = { podA: IP_PENDING, podB: IP_PENDING, podC: IP_PENDING, podD: IP_PENDING };
const REAL_IPS = { podA: POD_IPS[0], podB: POD_IPS[1], podC: POD_IPS[2], podD: POD_IPS[3] };
// The interface half of the pair, written onto the inner box of each Pod.
const BAND = { bus: BUS_SUBLABEL };
const PENDING_IFACE = { podABox: IFACE(IP_PENDING), podBBox: IFACE(IP_PENDING), podCBox: IFACE(IP_PENDING), podDBox: IFACE(IP_PENDING) };
const REAL_IFACE = { podABox: IFACE(POD_IPS[0]), podBBox: IFACE(POD_IPS[1]), podCBox: IFACE(POD_IPS[2]), podDBox: IFACE(POD_IPS[3]) };

// All eight address lines come up on ONE fade, at the same instant: the space they are drawn from
// is one thing, and a stagger says the Pods were addressed in a running order they do not have.
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
    // The address appears here: x.x.x.x at idle becomes the real Pod IP on this step.
    podSublabels: REAL_IPS,
    opacity: REST,
    lit: ['ipChip'],
    // The animated path says every Pod owns an address by PULSING all four, which no lights list names.
    reducedLit: ['podABox', 'podBBox', 'podCBox', 'podDBox'],
    // Both halves of every pair come up together and all four Pods together, then all four pulse
    // once the addresses have landed.
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
    // The end state, which is what the reduced path settles on (S-13). The played path winds both
    // chips back below and turns them over together when the ball lands: the src address IS the
    // answer this step is asking about, and it stood on screen 2240ms before the ball ever left.
    chips: { ipChip: 'unique, cluster-wide', natChip: 'none, src 10.244.1.5', reachChip: 'cross-Node direct' },
    sublabels: { ...BAND, ...REAL_IFACE },
    podSublabels: REAL_IPS,
    opacity: REST,
    // The animated path says the far Pod was reached by PULSING it, which no lights list can name,
    // and the two chips light on the arrival rather than at entry.
    reducedLit: ['podCBox', 'natChip', 'reachChip'],
    rewind: { chips: { natChip: 'none', reachChip: 'any to any' } },
    // Up-arrow: the sender pulses first. The route omits `dur` (canon: routeDur normalizes by
    // length) and the tag uses the same routeDur so it stays locked to the packet.
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
    // NAT still applies on the same-Node path and the src arrives unchanged, so the chip carries the
    // same value in from the step before. That is why only reachChip is wound back and cued: a value
    // that did not change earns no cue (P-05), and lighting it here would say something happened.
    chips: { ipChip: 'unique, cluster-wide', natChip: 'none, src 10.244.1.5', reachChip: 'same-Node direct' },
    sublabels: { ...BAND, ...REAL_IFACE },
    podSublabels: REAL_IPS,
    opacity: REST,
    // The animated path says the neighbour was reached by PULSING it, which no lights list can name.
    reducedLit: ['podBBox', 'reachChip'],
    rewind: { chips: { reachChip: 'cross-Node direct' } },
    // Same mechanism as cross-Node, just a shorter ride: A pulses, packet rides A -> B, B pulses.
    // The same src-IP tag rides along and arrives unchanged, no NAT on the local path either.
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
    // Local scope: the kubelet on Node-2 reaches only its Node-2 Pod (C). Fade the other Nodes
    // out so the guarantee reads as local-only, not the any-to-any of rule two.
    opacity: { ...REST, ...shade(['podA', 'podB', 'podD', 'node1', 'node3', 'wireA', 'wireB', 'wireD'], OPACITY.notready) },
    // The sender must not be dark when its ball leaves (M-18a), so the kubelet alone lights at entry.
    lit: ['kubelet'],
    // The animated path says the local Pod was reached by PULSING it, which no lights list can name,
    // and both chips light on the arrival rather than at entry.
    reducedLit: ['podCBox', 'natChip', 'reachChip'],
    rewind: { chips: { natChip: 'none, src 10.244.1.5', reachChip: 'same-Node direct' } },
    // Down-arrow: infrastructure reaches a Pod, so the packet goes first and the Pod pulses on
    // arrival.
    flow: [
      F.route({ points: KUBELET_TO_C, name: 'hop' }),
      F.pulse({ pod: 'podC', at: 'hop' }),
      F.set({ at: 'hop', chipsCued: { natChip: 'none', reachChip: 'agent to local Pod' } }),
    ],
  },
  {
    id: 'cni',
    duration: 2600,
    narration: 'Only a few parts of this live in the core. The container runtime on each Node implements the model, almost always through a CNI plugin such as Calico, Cilium or Flannel. Here the plugin lights up the whole fabric. Swap it and the model stays the same.',
    chips: { ipChip: 'unique, cluster-wide', natChip: 'none', reachChip: 'any to any' },
    // 30 characters, the width `one cluster-wide address space` proves clear: the rail tooth at CX
    // 700 stands 10 units off the end of a 30 character sublabel and cuts through a 36 character one.
    sublabels: { bus: 'built by the container runtime', ...REAL_IFACE },
    podSublabels: REAL_IPS,
    // The badge, its wire, and the spine reaching the band's right edge to meet that wire, all of
    // which the animated path fades in on top of this resting state.
    opacity: { podA: 1, podB: 1, podC: 1, podD: 1, node1: 1, node2: 1, node3: 1,
      wireA: 1, wireB: 1, wireC: 1, wireD: 1, cni: 1, cniWire: 1, busRailExt: 1 },
    // reachability returns to any to any here, so the chip that carries it lights with the fabric.
    lit: ['bus', 'cni', 'reachChip'],
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
