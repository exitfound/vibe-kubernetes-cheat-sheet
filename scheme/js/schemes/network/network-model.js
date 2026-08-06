import { g, rect, text, line } from '../../lib/svg.js';
import { arrowDefs, box, arrow, pathArrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, setPodSublabel, pulsePod, routePacket, routeDur, makeInit, clearHighlights, clearWires, relationPath, BEAT, makeRidingLabel, OPACITY, wrapPod, diagramRoot } from './network-kit.js';
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

function podBlock({ x, label, ip }) {
  const shell = podShell({ x, y: POD_TOP, w: POD_W, h: 120, label, sublabel: ip, containers: 0, role: 'network' });
  const innerBox = box({ x: x + 18, y: POD_TOP + 34, w: POD_W - 36, h: 50, label: 'app', sublabel: 'eth0', role: 'network' });
  return wrapPod(shell, innerBox);
}

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = diagramRoot({ 'aria-label': 'The Kubernetes network model: every Pod attaches to one flat cluster-wide address space, any Pod reaches any other Pod on any Node with no NAT, the Node agent reaches its local Pods, and a CNI plugin is what implements the model' });
    root.appendChild(arrowDefs());

    // Flat-network band built by hand so a dashed rail can sit inside it, below the centred
    // label and above the sublabel. setBoxSublabel still finds the .scheme-box-sublabel child.
    const bus = g({ class: 'scheme-box', 'data-role': 'network', transform: `translate(${BAND_X},${BAND_Y})` });
    bus.appendChild(rect({ class: 'scheme-box-rect', x: 0, y: 0, width: BAND_W, height: BAND_H, rx: 6, ry: 6 }));
    bus.appendChild(text({ class: 'scheme-box-label', x: BAND_W / 2, y: LABEL_LOCAL_Y, 'text-anchor': 'middle' }, ['Flat Pod Network']));
    const podLocalX = [AX, BX, CX, DX].map(x => x - BAND_X);
    const spine = `M ${podLocalX[0]} ${RAIL_LOCAL_Y} L ${podLocalX[podLocalX.length - 1]} ${RAIL_LOCAL_Y}`;
    const teeth = podLocalX.map(px => `M ${px} ${RAIL_LOCAL_Y} L ${px} ${BAND_H}`).join(' ');
    const busRail = relationPath({ d: `${spine} ${teeth}` });
    bus.appendChild(busRail);
    // Spine extension to the band's right edge, hidden until the CNI step, where it reaches out to
    // meet the incoming CNI arrow.
    const busRailExt = relationPath({ points: [[podLocalX[podLocalX.length - 1], RAIL_LOCAL_Y], [BAND_W, RAIL_LOCAL_Y]] });
    busRailExt.style.opacity = '0';
    bus.appendChild(busRailExt);
    bus.appendChild(text({ class: 'scheme-box-sublabel', x: BAND_W / 2, y: SUBLABEL_LOCAL_Y, 'text-anchor': 'middle' }, ['one cluster-wide address space']));

    const kubelet = box({ x: KUBELET_X - KUBELET_W / 2, y: KUBELET_Y, w: KUBELET_W, h: KUBELET_H, label: 'Kubelet', sublabel: 'Node agent on Node-2', role: 'network' });

    // CNI plugin badge + its wire into the band. Hidden until the last step, where it is revealed
    // as the thing that implements the flat space.
    const cni = box({ x: CNI_X - CNI_W / 2, y: CNI_Y, w: CNI_W, h: CNI_H, label: 'CNI plugin', sublabel: 'Calico . Cilium . Flannel', role: 'network' });
    const cniWire = pathArrow({ points: CNI_CONNECTOR, dashed: true, dim: true });
    cni.style.opacity = '0';
    cniWire.style.opacity = '0';

    const a = podBlock({ x: AX - POD_W / 2, label: 'Pod . Node-1', ip: IP_PENDING });
    const b = podBlock({ x: BX - POD_W / 2, label: 'Pod . Node-1', ip: IP_PENDING });
    const c = podBlock({ x: CX - POD_W / 2, label: 'Pod . Node-2', ip: IP_PENDING });
    const d = podBlock({ x: DX - POD_W / 2, label: 'Pod . Node-3', ip: IP_PENDING });

    // Pod wires are bidirectional: traffic flows both ways between a Pod and the flat space, so
    // each is a double-headed dashed arrow that abuts the bus tooth at the band edge.
    const podWire = (x) => line({
      class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim',
      x1: x, y1: BAND_BOTTOM, x2: x, y2: POD_TOP,
      'marker-start': 'url(#arrowhead-dim)', 'marker-end': 'url(#arrowhead-dim)',
    });
    const wA = podWire(AX), wB = podWire(BX), wC = podWire(CX), wD = podWire(DX);
    // kubelet down to the band stays a single directional reach.
    const wK = arrow({ x1: KUBELET_X, y1: KUBELET_BOTTOM, x2: KUBELET_X, y2: BAND_Y, dashed: true, dim: true });

    // Info chips stretched evenly across the whole composition: left edge on the band left,
    // right edge on the CNI badge right, so the strip spans SCHEME_L..SCHEME_R and centres on 600.
    const ipChip    = valChip({ x: chipX(0), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'Pod IP', value: 'one per Pod', role: 'network' });
    const natChip   = valChip({ x: chipX(1), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'NAT', value: 'none', role: 'network' });
    const reachChip = valChip({ x: chipX(2), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'reachability', value: 'any to any', role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: band + kubelet + cni + pods, then the dim wires ABOVE them, then chips, then packets.
    root.appendChild(bus);
    root.appendChild(kubelet);
    root.appendChild(cni);
    [a, b, c, d].forEach(p => root.appendChild(p.group));
    [wA, wB, wC, wD, wK, cniWire].forEach(w => root.appendChild(w));
    [ipChip, natChip, reachChip].forEach(ch => root.appendChild(ch));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, bus, busRail, busRailExt, kubelet, cni, cniWire,
      podA: a.group, podABox: a.innerBox, podB: b.group, podBBox: b.innerBox,
      podC: c.group, podCBox: c.innerBox, podD: d.group, podDBox: d.innerBox,
      podWires: [wA, wB, wC, wD],
      ipChip, natChip, reachChip,
      packetLayer, wires: {},
    };
  }

  reset() { this.build(); }
}

function setChips(s, { ipChip, nat, reach }) {
  setVal(s.refs.ipChip, ipChip);
  setVal(s.refs.natChip, nat);
  setVal(s.refs.reachChip, reach);
}

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  // The four container boxes are keys, not pod groups: the pod-group list only resets inline pulse
  // strokes, so a .highlight put on a container stayed on for the rest of the card.
  clearHighlights(s, ['bus', 'kubelet', 'cni', 'podABox', 'podBBox', 'podCBox', 'podDBox',
    'ipChip', 'natChip', 'reachChip'],
    [s.refs.podA, s.refs.podB, s.refs.podC, s.refs.podD]);
  setBoxSublabel(s.refs.bus, 'one cluster-wide address space');
  // Pods return to full opacity (the node-agent step dims out-of-scope ones).
  [s.refs.podA, s.refs.podB, s.refs.podC, s.refs.podD].forEach(p => { p.style.opacity = '1'; });
  // The CNI badge and the spine extension stay hidden until the CNI step reveals them.
  s.refs.cni.style.opacity = '0';
  s.refs.cniWire.style.opacity = '0';
  s.refs.busRailExt.style.opacity = '0';
  clearWires(s);
}

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'network', dy: -15, inMs: 160, outMs: 200, hold: 260 });

// Marching dashes along a dim wire, without touching its dash pattern, so it reads as current
// flowing. Used on the CNI step to energize the whole fabric.
function marchWire(s, ctx, el, delay = 0) {
  if (ctx.reduced || !el) return;
  ctx.register(el.animate(
    [{ strokeDashoffset: 0 }, { strokeDashoffset: -20 }],
    { duration: 700, delay, iterations: Infinity, easing: 'linear' }
  ));
}

const POD_KEYS = ['podA', 'podB', 'podC', 'podD'];
// Idle: no address yet. Rule one is where the IP appears.
function pendingIps(s) {
  POD_KEYS.forEach(k => setPodSublabel(s.refs[k], IP_PENDING));
}
// Rule one: each Pod gets its real IP. Reveal the text (always) and fade it in when animating.
function revealIps(s, ctx) {
  POD_KEYS.forEach((k, i) => {
    setPodSublabel(s.refs[k], POD_IPS[i]);
    if (ctx.reduced) return;
    const sub = s.refs[k].querySelector('.scheme-pod-sublabel');
    if (sub) ctx.register(sub.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, fill: 'forwards', easing: 'ease-out' }));
  });
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      resetStep(s);
      pendingIps(s);
      setChips(s, { ipChip: 'one per Pod', nat: 'none', reach: 'any to any' });
    },
  },
  {
    id: 'pod-ip',
    duration: 2200,
    narration: 'Rule one: every Pod gets its own IP, unique across the entire cluster. A Pod sees that same address as the one other Pods use to reach it, so there is no port mapping and no rewriting to reason about.',
    enter(s, ctx) {
      resetStep(s);
      s.refs.ipChip.classList.add('highlight');
      setChips(s, { ipChip: 'unique, cluster-wide', nat: 'none', reach: 'any to any' });
      // The address appears here: x.x.x.x at idle becomes the real Pod IP on this step.
      revealIps(s, ctx);
      if (ctx.reduced) {
        [s.refs.podABox, s.refs.podBBox, s.refs.podCBox, s.refs.podDBox].forEach(b => b.classList.add('highlight'));
        return;
      }
      // Every Pod owns an address: all four pulse together to read as one address space.
      pulsePod(s.refs.podA, ctx, 0);
      pulsePod(s.refs.podB, ctx, 0);
      pulsePod(s.refs.podC, ctx, 0);
      pulsePod(s.refs.podD, ctx, 0);
    },
  },
  {
    id: 'no-nat',
    duration: 3300,
    narration: 'Rule two: any Pod can reach any other Pod on any Node directly, with no NAT on the way. The source address that arrives is the real Pod IP, here 10.244.1.5, even when the packet crosses to another Node.',
    enter(s, ctx) {
      resetStep(s);
      s.refs.natChip.classList.add('highlight');
      s.refs.reachChip.classList.add('highlight');
      setChips(s, { ipChip: 'unique, cluster-wide', nat: 'none, src 10.244.1.5', reach: 'cross-Node direct' });
      if (ctx.reduced) { s.refs.podCBox.classList.add('highlight'); return; }
      pulsePod(s.refs.podA, ctx, 0);
      // routePacket omits dur (canon: routeDur normalizes by length). The label uses the same
      // routeDur so it stays locked to the packet.
      const dur = routeDur(A_TO_C);
      const hop = routePacket(s, ctx, A_TO_C, { delay: BEAT.afterPulse, role: 'network' });
      ridingLabel(s, ctx, 'src 10.244.1.5', A_TO_C, { delay: BEAT.afterPulse, dur });
      pulsePod(s.refs.podC, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'same-node',
    duration: 2800,
    narration: 'Same address space on one Node too. Pod 10.244.1.5 reaches its neighbour 10.244.1.6, both on Node-1, with the same flat addressing and no NAT. The traffic never leaves the Node, but to the Pods it is the very same model, no special case to reason about.',
    enter(s, ctx) {
      resetStep(s);
      // NAT still applies on the same-Node path: the src arrives unchanged, so the chip stays
      // highlighted and current, not dropped while its neighbour stays lit.
      s.refs.natChip.classList.add('highlight');
      setChips(s, { ipChip: 'unique, cluster-wide', nat: 'none, src 10.244.1.5', reach: 'same-Node direct' });
      s.refs.reachChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.podBBox.classList.add('highlight'); return; }
      // Same mechanism as cross-Node, just a shorter ride: A pulses, packet rides A -> B, B pulses.
      // The same src-IP tag rides along and arrives unchanged, no NAT on the local path either.
      pulsePod(s.refs.podA, ctx, 0);
      const dur = routeDur(A_TO_B);
      const hop = routePacket(s, ctx, A_TO_B, { delay: BEAT.afterPulse, role: 'network' });
      ridingLabel(s, ctx, 'src 10.244.1.5', A_TO_B, { delay: BEAT.afterPulse, dur });
      pulsePod(s.refs.podB, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'node-agent',
    duration: 2400,
    narration: 'Rule three is narrower: the Node agent, the Kubelet, reaches only the Pods on its own Node. The Kubelet on Node-2 talks to Pod 10.244.2.7, its local Pod, to run the HTTP and TCP probes that decide whether it is live and ready. Pods on other Nodes are out of this guarantee.',
    enter(s, ctx) {
      resetStep(s);
      s.refs.kubelet.classList.add('highlight');
      s.refs.reachChip.classList.add('highlight');
      setChips(s, { ipChip: 'unique, cluster-wide', nat: 'none', reach: 'agent to local Pod' });
      s.refs.natChip.classList.add('highlight');
      // Local scope: the kubelet on Node-2 reaches only its Node-2 Pod (C). Fade the other Nodes
      // out so the guarantee reads as local-only, not the any-to-any of rule two.
      s.refs.podA.style.opacity = String(OPACITY.notready);
      s.refs.podB.style.opacity = String(OPACITY.notready);
      s.refs.podD.style.opacity = String(OPACITY.notready);
      if (ctx.reduced) { s.refs.podCBox.classList.add('highlight'); return; }
      // Down-arrow: infrastructure reaches a Pod, so the packet goes first and the Pod pulses on
      // arrival.
      const hop = routePacket(s, ctx, KUBELET_TO_C, { role: 'network' });
      pulsePod(s.refs.podC, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'cni',
    duration: 2600,
    narration: 'None of this is hard-wired into the core. A CNI plugin, such as Calico, Cilium or Flannel, is what attaches every Pod to the flat space and upholds all of these rules. Here it lights up the whole fabric. Swap the plugin and the model stays the same.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { ipChip: 'unique, cluster-wide', nat: 'none', reach: 'agent to local Pod' });
      s.refs.bus.classList.add('highlight');
      setBoxSublabel(s.refs.bus, 'implemented by your CNI plugin');
      // Reveal the CNI badge and let it energize the fabric: the bus spine and every Pod wire
      // get marching dashes, as if the plugin is wiring the whole flat space at once.
      s.refs.cni.classList.add('highlight');
      s.refs.cni.style.opacity = '1';
      s.refs.cniWire.style.opacity = '1';
      // Only here does the spine reach the band's right edge, to meet the CNI arrow.
      s.refs.busRailExt.style.opacity = '1';
      if (ctx.reduced) return;
      ctx.register(s.refs.cni.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards', easing: 'ease-out' }));
      ctx.register(s.refs.cniWire.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards', easing: 'ease-out' }));
      ctx.register(s.refs.busRailExt.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards', easing: 'ease-out' }));
      marchWire(s, ctx, s.refs.cniWire, 0);
      marchWire(s, ctx, s.refs.busRail, 120);
      marchWire(s, ctx, s.refs.busRailExt, 120);
      s.refs.podWires.forEach((w, i) => marchWire(s, ctx, w, 240 + i * 90));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
