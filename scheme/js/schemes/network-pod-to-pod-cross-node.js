import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt } from '../lib/network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-pod-to-pod-cross-node


const VETH_Y = 338;       // veth links inside each node + the short packets on them
const CNI_BOTTOM = 370;   // bottom edge of each cni0 box, where the underlay path drops/rises
const UNDERLAY_Y = 495;   // physical underlay segment between the two Node IPs
const CNI1_X = 445;       // cni1 horizontal centre (drop point)
const CNI2_X = 755;       // cni2 horizontal centre (rise point), symmetric about x=600

const UNDERLAY_PATH = [[CNI1_X, CNI_BOTTOM], [CNI1_X, UNDERLAY_Y], [CNI2_X, UNDERLAY_Y], [CNI2_X, CNI_BOTTOM]];

// Build one Pod as a shell (translucent outer) wrapping an eth0 container box, in a group
// so pulsePod animates both rects together. Returns { group, innerBox }.
function podBlock({ x, label, ip }) {
  const shell = pod({ x, y: 280, w: 180, h: 120, label, sublabel: ip, containers: 0, role: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: 310, w: 140, h: 56, label: 'app', sublabel: 'eth0', role: 'network' });
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
      'aria-label': 'Pod-to-Pod traffic across Nodes: the source Node routes the off-subnet packet to its CNI dataplane, which in overlay mode wraps it in VXLAN over UDP and ships it across the physical underlay to the remote Node, whose kernel decapsulates and bridges it into the local Pod; a routed BGP mode is shown as the no-encapsulation alternative',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const node1 = node({ x: 70,  y: 220, w: 470, h: 230, label: 'Node-1   ·   10.244.1.0/24' });
    const node2 = node({ x: 660, y: 220, w: 470, h: 230, label: 'Node-2   ·   10.244.2.0/24' });

    const a = podBlock({ x: 98,  label: 'Pod A', ip: '10.244.1.5' });
    const b = podBlock({ x: 922, label: 'Pod B', ip: '10.244.2.7' });
    const cni1 = box({ x: 370, y: 306, w: 150, h: 64, label: 'cni0', sublabel: 'Node-1 dataplane', role: 'network' });
    const cni2 = box({ x: 680, y: 306, w: 150, h: 64, label: 'cni0', sublabel: 'Node-2 dataplane', role: 'network' });

    // veth links inside each node (dim dashed): A -> cni1 on the left, cni2 -> B on the right.
    const vethA = arrow({ x1: 278, y1: VETH_Y, x2: 370, y2: VETH_Y, dashed: true, dim: true, role: 'network' });
    const vethB = arrow({ x1: 830, y1: VETH_Y, x2: 922, y2: VETH_Y, dashed: true, dim: true, role: 'network' });
    // The cni0-to-cni0 link is ONE continuous turning arrow that drops to the underlay, runs
    // across, and rises into the remote cni0. The packet rides this same UNDERLAY_PATH.
    const underlay = pathArrow({ points: UNDERLAY_PATH, dashed: true, dim: true, role: 'network' });
    const underlayLabel = text({ class: 'scheme-label code dim', x: 600, y: UNDERLAY_Y - 14, 'text-anchor': 'middle' }, ['physical network']);
    const vethALabel = text({ class: 'scheme-label code dim', x: 324, y: VETH_Y - 12, 'text-anchor': 'middle' }, [' ']);
    const vethBLabel = text({ class: 'scheme-label code dim', x: 876, y: VETH_Y - 12, 'text-anchor': 'middle' }, [' ']);
    const encapLabel = text({ class: 'scheme-label code dim', x: 600, y: UNDERLAY_Y + 22, 'text-anchor': 'middle' }, [' ']);

    // Chip strip: first chip left edge == Node-1 left (x70), last chip right edge == Node-2 right
    // (x1130). Four equal chips of 250 with 20px gaps span the full 1060 between the node edges.
    const innerChip = valChip({ x: 70,  y: 538, w: 250, h: 34, name: 'inner src/dst', value: '.1.5 -> .2.7', role: 'network' });
    const outerChip = valChip({ x: 340, y: 538, w: 250, h: 34, name: 'outer',         value: 'node IPs',    role: 'network' });
    const encapChip = valChip({ x: 610, y: 538, w: 250, h: 34, name: 'encap',         value: 'none',        role: 'network' });
    const modeChip  = valChip({ x: 880, y: 538, w: 250, h: 34, name: 'mode',          value: 'overlay',     role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    root.appendChild(node1);
    root.appendChild(node2);
    root.appendChild(cni1);
    root.appendChild(cni2);
    root.appendChild(a.group);
    root.appendChild(b.group);
    [vethA, vethB, underlay, underlayLabel, vethALabel, vethBLabel, encapLabel].forEach(el => root.appendChild(el));
    [innerChip, outerChip, encapChip, modeChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, node1, node2, podA: a.group, podABox: a.innerBox, podB: b.group, podBBox: b.innerBox, cni1, cni2,
      innerChip, outerChip, encapChip, modeChip,
      packetLayer,
      wires: { va: vethALabel, vb: vethBLabel, encap: encapLabel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  // The two inner Pod boxes belong in the KEY list, not in the pod-group list: a pod group only has
  // its inline pulse strokes reset, so a .highlight put on a container would never come off again.
  clearHighlights(s, ['cni1', 'cni2', 'podABox', 'podBBox', 'innerChip', 'outerChip', 'encapChip', 'modeChip'], [s.refs.podA, s.refs.podB]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.innerChip, '.1.5 -> .2.7');
      setVal(s.refs.outerChip, 'node IPs');
      setVal(s.refs.encapChip, 'none');
      setVal(s.refs.modeChip, 'overlay');
    },
  },
  {
    id: 'route',
    duration: 2200,
    narration: 'Pod A sends to 10.244.2.7 out its eth0. The frame rides the veth into the Node-1 network stack, which consults its routing table. The destination is not in the local Pod subnet, so the route points at the CNI dataplane that handles off-Node traffic rather than the local bridge path.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'va', 'veth · eth0');
      s.refs.innerChip.classList.add('highlight');
      setVal(s.refs.innerChip, '.1.5 -> .2.7');
      if (ctx.reduced) { s.refs.podABox.classList.add('highlight'); s.refs.cni1.classList.add('highlight'); return; }
      // Up-arrow: A pulses FIRST, the packet leaves only after the blink lands (BEAT.afterPulse)
      // and hops the veth to cni1, which lights on arrival.
      pulsePod(s.refs.podA, ctx, 0);
      const hop = segmentPacket(s, ctx, { from: [278, VETH_Y], to: [370, VETH_Y], delay: BEAT.afterPulse, role: 'network' });
      lightBoxAt(s.refs.cni1, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'encap',
    duration: 2600,
    narration: 'In overlay mode the CNI dataplane wraps the original frame inside a VXLAN header carried over UDP to the Node-2 address. The outer headers are Node IPs the physical network already knows how to route, dport 8472 for flannel, while the inner Pod IPs ride untouched. The wrapped packet crosses the underlay to Node-2.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'encap', 'VXLAN over UDP · dport 8472');
      s.refs.cni1.classList.add('highlight'); // the overlay device acts; infra stays lit, never pulses
      s.refs.outerChip.classList.add('highlight');
      s.refs.encapChip.classList.add('highlight');
      setVal(s.refs.outerChip, 'node1 -> node2');
      setVal(s.refs.encapChip, 'VXLAN/UDP 8472');
      setVal(s.refs.modeChip, 'overlay');
      if (ctx.reduced) { s.refs.cni2.classList.add('highlight'); return; }
      // The wrapped packet glides as ONE continuous motion: cni1 -> down -> across -> up to cni2,
      // which lights on arrival.
      const trip = routePacket(s, ctx, UNDERLAY_PATH, { role: 'network' });
      lightBoxAt(s.refs.cni2, ctx, trip.arrivalMs);
    },
  },
  {
    id: 'decap',
    duration: 2400,
    narration: 'Node-2 receives the UDP packet on the VXLAN port and its kernel strips the outer headers. The bare inner frame, still addressed to 10.244.2.7, is bridged across the local cni0 and out the veth into Pod B, exactly as a same-node frame would be delivered.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'vb', 'veth · eth0');
      setWire(s, 'encap', 'decap · inner frame restored');
      s.refs.cni2.classList.add('highlight');
      s.refs.innerChip.classList.add('highlight');
      setVal(s.refs.innerChip, '.1.5 -> .2.7');
      if (ctx.reduced) { s.refs.podBBox.classList.add('highlight'); return; }
      // Down-arrow: the decapsulated inner frame leaves cni2 and hops the veth into Pod B,
      // which pulses on arrival (the receiver).
      const into = segmentPacket(s, ctx, { from: [830, VETH_Y], to: [922, VETH_Y], role: 'network' });
      pulsePod(s.refs.podB, ctx, into.arrivalMs);
    },
  },
  {
    id: 'routed',
    duration: 4700,
    narration: 'Not every CNI encapsulates. A routed plugin such as Calico with BGP advertises each Node Pod subnet to the network, so the packet crosses the underlay carrying its real Pod IPs with no outer headers at all. It travels Pod A to Pod B in one routed path. This drops the encapsulation cost and the MTU overhead, at the price of the network having to carry Pod routes.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'va', 'veth');
      setWire(s, 'vb', 'veth');
      setWire(s, 'encap', 'routed · no outer headers');
      // Both dataplanes are on the path and never pulse, but each is a receiver before it forwards,
      // so both light on arrival below and the pair reads as a route rather than as a lit corridor.
      s.refs.outerChip.classList.add('highlight');
      s.refs.encapChip.classList.add('highlight');
      s.refs.modeChip.classList.add('highlight');
      setVal(s.refs.outerChip, 'pod IPs routed');
      setVal(s.refs.encapChip, 'none');
      setVal(s.refs.modeChip, 'routed · BGP');
      if (ctx.reduced) {
        s.refs.cni1.classList.add('highlight');
        s.refs.cni2.classList.add('highlight');
        s.refs.podABox.classList.add('highlight');
        s.refs.podBBox.classList.add('highlight');
        return;
      }
      pulsePod(s.refs.podA, ctx, 0);
      const h1 = segmentPacket(s, ctx, { from: [278, VETH_Y], to: [370, VETH_Y], delay: BEAT.afterPulse, role: 'network' });           // Pod A -> cni1 (veth)
      lightBoxAt(s.refs.cni1, ctx, h1.arrivalMs);
      const h2 = routePacket(s, ctx, UNDERLAY_PATH, { delay: h1.arrivalMs + BEAT.afterHop, role: 'network' });                          // cni1 -> underlay -> cni2
      lightBoxAt(s.refs.cni2, ctx, h2.arrivalMs);
      const h3 = segmentPacket(s, ctx, { from: [830, VETH_Y], to: [922, VETH_Y], delay: h2.arrivalMs + BEAT.afterHop, role: 'network' }); // cni2 -> Pod B (veth)
      pulsePod(s.refs.podB, ctx, h3.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
