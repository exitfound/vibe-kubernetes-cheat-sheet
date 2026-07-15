import { svg, g, rect, text, line, path } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow, pathArrow, animateAlong } from '../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, setPodSublabel, pulsePod, routePacket, routeDur, makeInit, clearHighlights, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640):
//   - the kubelet box sits centred above the flat-network band. After the RAISE the band reaches
//     up near the narration overlay, but only its empty left edge does, no essential text.
//   - one wide band represents the flat Pod network (a single L3 address space). Four Pods hang
//     below it on different Nodes, each wired up to the band. Packets ride up the wire, along a
//     dashed rail INSIDE the band, and down to the destination: one flat space, no NAT.
// Standard contract (matches network-ipam-pod-cidr):
//   - Pods are the shell + inner eth0 box, grouped so pulsePod animates both.
//   - the band is infrastructure: it lights and flashes, it never pulses. Only Pods pulse.
//   - the static wires and the moving packet share the same point arrays.
//   - the one place a line sits BELOW blocks not above: the dashed rail lives inside the band.
// Band, Pods and chips are raised by RAISE. The kubelet keeps its own higher raise, so the gap
// between it and the flat-network band is wider.
const RAISE = 64;                        // band/Pods/chips: net +10% up (lowered 5% from the old 96)
const KUBELET_RAISE = 96;                // kubelet stays one notch higher than the rest
const BAND_X = 120, BAND_W = 960;        // flat-network band horizontal extent (width is optimal, kept)
const BAND_H = 80;                       // taller, so the rail clears both text rows with room
const BAND_Y = 302 - RAISE;              // raised band top
const BAND_BOTTOM = BAND_Y + BAND_H;     // Pod wires meet the band here
const LABEL_LOCAL_Y = 27;                // 'Flat Pod Network' row, upper third
const RAIL_LOCAL_Y = 42;                 // dashed bus spine, centred in the gap between the two text rows
const SUBLABEL_LOCAL_Y = 61;             // sublabel row, lower third
const BUS_Y = BAND_Y + RAIL_LOCAL_Y;     // the spine the packet rides along
const POD_TOP = 440 - RAISE;             // Pods hang below the band
const CHIP_Y = 588 - RAISE;              // info chips row

// Pod centres along the band, left to right, centred under it: equal end-margins and inner gaps
// so the four blocks sit symmetric about the band centre (600) with no overflow. The cross-Node
// hop runs A -> C.
const POD_W = 180;                       // Pod block width (matches podBlock)
const POD_GAP = 48;                      // equal end-margin and inner gap
const AX = BAND_X + POD_GAP + POD_W / 2;  // 258
const BX = AX + POD_W + POD_GAP;          // 486
const CX = BX + POD_W + POD_GAP;          // 714
const DX = CX + POD_W + POD_GAP;          // 942, right edge 1032 (48 in from the band edge)

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

// CNI plugin badge: revealed on the last step, pushed to the far top-right, wired from its
// bottom-centre down and into the RIGHT SIDE of the band (centred on that edge), to show it is
// what implements the flat space.
const CNI_W = 180, CNI_H = 72;
const CNI_X = 1100;                       // centre, far top-right
const CNI_Y = KUBELET_Y + 4;
const CNI_BOTTOM = CNI_Y + CNI_H;
const BAND_SIDE_Y = BUS_Y;                // align with the bus spine, so the CNI arrow meets the rail
// CNI connector: bottom-centre of the badge, down, then left into the band's right side.
const CNI_CONNECTOR = [[CNI_X, CNI_BOTTOM], [CNI_X, BAND_SIDE_Y], [BAND_X + BAND_W, BAND_SIDE_Y]];
const POD_DIM = 0.32;                    // out-of-scope Pods fade to this on the node-agent step

function podBlock({ x, label, ip }) {
  const shell = pod({ x, y: POD_TOP, w: POD_W, h: 120, label, sublabel: ip, containers: 0, cat: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 18, y: POD_TOP + 34, w: POD_W - 36, h: 50, label: 'app', sublabel: 'eth0', cat: 'network' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'The Kubernetes network model: every Pod attaches to one flat cluster-wide address space, any Pod reaches any other Pod on any Node with no NAT, the Node agent reaches its local Pods, and a CNI plugin is what implements the model',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Flat-network band built by hand so a dashed rail can sit inside it, below the centred
    // label and above the sublabel. setBoxSublabel still finds the .scheme-box-sublabel child.
    const bus = g({ class: 'scheme-box', 'data-cat': 'network', transform: `translate(${BAND_X},${BAND_Y})` });
    bus.appendChild(rect({ class: 'scheme-box-rect', x: 0, y: 0, width: BAND_W, height: BAND_H, rx: 6, ry: 6 }));
    bus.appendChild(text({ class: 'scheme-box-label', x: BAND_W / 2, y: LABEL_LOCAL_Y, 'text-anchor': 'middle' }, ['Flat Pod Network']));
    // Flat dashed bus inside the band: a horizontal spine with a short tooth turning down toward
    // each Pod, so the bus abuts every Pod drop-wire at the band edge. No arrowheads here, the
    // bidirectional arrows live on the Pod wires.
    const podLocalX = [AX, BX, CX, DX].map(x => x - BAND_X);
    const spine = `M ${podLocalX[0]} ${RAIL_LOCAL_Y} L ${podLocalX[podLocalX.length - 1]} ${RAIL_LOCAL_Y}`;
    const teeth = podLocalX.map(px => `M ${px} ${RAIL_LOCAL_Y} L ${px} ${BAND_H}`).join(' ');
    const busRail = path({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim', d: `${spine} ${teeth}`, fill: 'none' });
    bus.appendChild(busRail);
    // Spine extension to the band's right edge, hidden until the CNI step, where it reaches out to
    // meet the incoming CNI arrow.
    const busRailExt = path({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim', d: `M ${podLocalX[podLocalX.length - 1]} ${RAIL_LOCAL_Y} L ${BAND_W} ${RAIL_LOCAL_Y}`, fill: 'none' });
    busRailExt.style.opacity = '0';
    bus.appendChild(busRailExt);
    bus.appendChild(text({ class: 'scheme-box-sublabel', x: BAND_W / 2, y: SUBLABEL_LOCAL_Y, 'text-anchor': 'middle' }, ['one cluster-wide address space']));

    const kubelet = box({ x: KUBELET_X - KUBELET_W / 2, y: KUBELET_Y, w: KUBELET_W, h: KUBELET_H, label: 'Kubelet', sublabel: 'Node agent on Node-2', cat: 'network' });

    // CNI plugin badge + its wire into the band. Hidden until the last step, where it is revealed
    // as the thing that implements the flat space.
    const cni = box({ x: CNI_X - CNI_W / 2, y: CNI_Y, w: CNI_W, h: CNI_H, label: 'CNI plugin', sublabel: 'Calico . Cilium . Flannel', cat: 'network' });
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

    // Info chips stretched evenly across the full band width: left edge on the band left,
    // right edge on the band right.
    const CHIP_W = 306, CHIP_GAP = 21;
    const ipChip    = valChip({ x: BAND_X, y: CHIP_Y, w: CHIP_W, h: 34, name: 'Pod IP', value: 'one per Pod', cat: 'network' });
    const natChip   = valChip({ x: BAND_X + CHIP_W + CHIP_GAP, y: CHIP_Y, w: CHIP_W, h: 34, name: 'NAT', value: 'none', cat: 'network' });
    const reachChip = valChip({ x: BAND_X + 2 * (CHIP_W + CHIP_GAP), y: CHIP_Y, w: CHIP_W, h: 34, name: 'reachability', value: 'any to any', cat: 'network' });

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

function clearHL(s) {
  clearHighlights(s, ['bus', 'kubelet', 'cni', 'ipChip', 'natChip', 'reachChip'],
    [s.refs.podA, s.refs.podB, s.refs.podC, s.refs.podD]);
  setBoxSublabel(s.refs.bus, 'one cluster-wide address space');
  // Pods return to full opacity (the node-agent step dims out-of-scope ones).
  [s.refs.podA, s.refs.podB, s.refs.podC, s.refs.podD].forEach(p => { p.style.opacity = '1'; });
  // The CNI badge and the spine extension stay hidden until the CNI step reveals them.
  s.refs.cni.style.opacity = '0';
  s.refs.cniWire.style.opacity = '0';
  s.refs.busRailExt.style.opacity = '0';
}

// A small label that rides ALONG with a packet on the same path, used to show the source IP is
// carried unchanged from sender to receiver (no NAT). Lives in the packet layer but is not a
// .scheme-packet, so play-probe counts are unaffected.
function ridingLabel(s, ctx, txt, points, { delay, dur }) {
  if (ctx.reduced) return;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: -15, 'text-anchor': 'middle', 'data-cat': 'network' }, [txt]);
  lbl.style.opacity = '0';
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, delay: Math.max(0, delay - 160), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: dur, delay }));      // same path + timing as the packet
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: delay + dur + 260, fill: 'forwards', easing: 'ease-in' }));
}

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
    narration: 'Kubernetes gives the whole cluster one flat network. Every Pod attaches to the same address space no matter which Node runs it, and these are the rules that space has to satisfy.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      pendingIps(s);
      setVal(s.refs.ipChip, 'one per Pod');
      setVal(s.refs.natChip, 'none');
      setVal(s.refs.reachChip, 'any to any');
    },
  },
  {
    id: 'pod-ip',
    duration: 2200,
    narration: 'Rule one: every Pod gets its own IP, unique across the entire cluster. A Pod sees that same address as the one other Pods use to reach it, so there is no port mapping and no rewriting to reason about.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.ipChip.classList.add('highlight');
      setVal(s.refs.ipChip, 'unique, cluster-wide');
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
    duration: 2600,
    narration: 'Rule two: any Pod can reach any other Pod on any Node directly, with no NAT on the way. The source address that arrives is the real Pod IP, here 10.244.1.5, even when the packet crosses to another Node.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.natChip.classList.add('highlight');
      s.refs.reachChip.classList.add('highlight');
      setVal(s.refs.natChip, 'none, src 10.244.1.5');
      setVal(s.refs.reachChip, 'cross-Node direct');
      if (ctx.reduced) { s.refs.podCBox.classList.add('highlight'); return; }
      // Pod-to-Pod: the sender pulses first, the packet leaves at BEAT.afterPulse and rides the
      // band to the far Pod, which pulses on arrival. A src-IP tag rides WITH the packet and
      // arrives unchanged, which is the no-NAT point made visible.
      pulsePod(s.refs.podA, ctx, 0);
      // routePacket omits dur (canon: routeDur normalizes by length). The label uses the same
      // routeDur so it stays locked to the packet.
      const dur = routeDur(A_TO_C);
      const hop = routePacket(s, ctx, A_TO_C, { delay: BEAT.afterPulse, cat: 'network' });
      ridingLabel(s, ctx, 'src 10.244.1.5', A_TO_C, { delay: BEAT.afterPulse, dur });
      pulsePod(s.refs.podC, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'same-node',
    duration: 2400,
    narration: 'Same address space on one Node too. Pod 10.244.1.5 reaches its neighbour 10.244.1.6, both on Node-1, with the same flat addressing and no NAT. The traffic never leaves the Node, but to the Pods it is the very same model, no special case to reason about.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      // NAT still applies on the same-Node path: the src arrives unchanged, so the chip stays
      // highlighted and current, not dropped while its neighbour stays lit.
      s.refs.natChip.classList.add('highlight');
      setVal(s.refs.natChip, 'none, src 10.244.1.5');
      s.refs.reachChip.classList.add('highlight');
      setVal(s.refs.reachChip, 'same-Node direct');
      if (ctx.reduced) { s.refs.podBBox.classList.add('highlight'); return; }
      // Same mechanism as cross-Node, just a shorter ride: A pulses, packet rides A -> B, B pulses.
      // The same src-IP tag rides along and arrives unchanged, no NAT on the local path either.
      pulsePod(s.refs.podA, ctx, 0);
      const dur = routeDur(A_TO_B);
      const hop = routePacket(s, ctx, A_TO_B, { delay: BEAT.afterPulse, cat: 'network' });
      ridingLabel(s, ctx, 'src 10.244.1.5', A_TO_B, { delay: BEAT.afterPulse, dur });
      pulsePod(s.refs.podB, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'node-agent',
    duration: 2400,
    narration: 'Rule three is narrower: the Node agent, the kubelet, reaches only the Pods on its own Node. The kubelet on Node-2 talks to Pod 10.244.2.7, its local Pod, to run liveness and readiness probes and to proxy exec and logs. Pods on other Nodes are out of this guarantee.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.kubelet.classList.add('highlight');
      s.refs.reachChip.classList.add('highlight');
      setVal(s.refs.reachChip, 'agent to local Pod');
      // The src tag belonged to the Pod-to-Pod steps. The agent path is not a Pod source, so
      // clear it rather than leaving a stale 10.244.1.5. The value changes here, so the chip
      // stays highlighted as a participant rather than going dim beside its lit neighbour.
      s.refs.natChip.classList.add('highlight');
      setVal(s.refs.natChip, 'none');
      // Local scope: the kubelet on Node-2 reaches only its Node-2 Pod (C). Fade the other Nodes
      // out so the guarantee reads as local-only, not the any-to-any of rule two.
      s.refs.podA.style.opacity = String(POD_DIM);
      s.refs.podB.style.opacity = String(POD_DIM);
      s.refs.podD.style.opacity = String(POD_DIM);
      if (ctx.reduced) { s.refs.podCBox.classList.add('highlight'); return; }
      // Down-arrow: infrastructure reaches a Pod, so the packet goes first and the Pod pulses on
      // arrival.
      const hop = routePacket(s, ctx, KUBELET_TO_C, { cat: 'network' });
      pulsePod(s.refs.podC, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'cni',
    duration: 2600,
    narration: 'None of this is hard-wired into the core. A CNI plugin, such as Calico, Cilium or Flannel, is what attaches every Pod to the flat space and upholds all of these rules. Here it lights up the whole fabric. Swap the plugin and the model stays the same.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
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
