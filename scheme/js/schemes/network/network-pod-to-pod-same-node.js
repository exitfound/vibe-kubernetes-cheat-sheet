import { g, text } from '../../lib/svg.js';
import { arrowDefs, box, node, arrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, lightBoxAt, BEAT, wrapPod, diagramRoot } from './network-kit.js';
// Design notes for this card: ./CARDS.md#network-pod-to-pod-same-node


const POD_MID = 380;          // vertical centre of the pod / cni0 blocks
const LANE = 12;              // half-gap between the two veth lanes
const TOP_Y = POD_MID - LANE; // 368, forward lane (A -> B)
const BOT_Y = POD_MID + LANE; // 392, return lane (B -> A)
const HOP = 800;              // ball travel per veth hop, a touch slower than the 700ms
                              // floor so the direction of each hop reads clearly

// Build one Pod as a shell (translucent outer) wrapping an eth0 container box, in a
// group so pulsePod animates both rects together. Returns { group, innerBox }.
function podBlock({ x, label, ip }) {
  const shell = podShell({ x, y: 315, w: 200, h: 130, label, sublabel: ip, containers: 0, role: 'network' });
  const innerBox = box({ x: x + 20, y: 352, w: 160, h: 56, label: 'app', sublabel: 'eth0', role: 'network' });
  return wrapPod(shell, innerBox);
}

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = diagramRoot({ 'aria-label': 'Pod-to-Pod traffic on the same Node: Pod A reaches Pod B through the cni0 bridge over a pair of veth links, with no NAT and no encapsulation' });
    root.appendChild(arrowDefs());

    const nodeEl = node({ x: 80, y: 255, w: 1040, h: 250, label: 'Node-1   ·   10.244.1.0/24' });

    const a = podBlock({ x: 150, label: 'Pod A', ip: '10.244.1.5' });
    const b = podBlock({ x: 850, label: 'Pod B', ip: '10.244.1.6' });
    const cni0 = box({ x: 505, y: 345, w: 170, h: 70, label: 'cni0', sublabel: 'L2 bridge', role: 'network' });

    // veth pair as two directional lanes. Dim dashed wires carry the actual frame;
    // the bright ball travels exactly along the matching lane.
    const vethA  = arrow({ x1: 350, y1: TOP_Y, x2: 505, y2: TOP_Y, dashed: true, dim: true }); // A  -> cni0
    const vethB  = arrow({ x1: 675, y1: TOP_Y, x2: 850, y2: TOP_Y, dashed: true, dim: true }); // cni0 -> B
    const vethBr = arrow({ x1: 850, y1: BOT_Y, x2: 675, y2: BOT_Y, dashed: true, dim: true }); // B  -> cni0 (reply)
    const vethAr = arrow({ x1: 505, y1: BOT_Y, x2: 350, y2: BOT_Y, dashed: true, dim: true }); // cni0 -> A (reply)
    const wireA = text({ class: 'scheme-label code dim', x: 427, y: TOP_Y - 12, 'text-anchor': 'middle' }, [' ']);
    const wireB = text({ class: 'scheme-label code dim', x: 762, y: TOP_Y - 12, 'text-anchor': 'middle' }, [' ']);

    const srcChip  = valChip({ x: 80,  y: 540, w: 250, h: 34, name: 'src',      value: '10.244.1.5', role: 'network' });
    const dstChip  = valChip({ x: 350, y: 540, w: 250, h: 34, name: 'dst',      value: '10.244.1.6', role: 'network' });
    const pathChip = valChip({ x: 620, y: 540, w: 250, h: 34, name: 'datapath', value: 'L2 bridge',  role: 'network' });
    const natChip  = valChip({ x: 890, y: 540, w: 230, h: 34, name: 'NAT',      value: 'none',       role: 'network' });
    [srcChip, dstChip, pathChip, natChip].forEach(c => root.appendChild(c));

    const packetLayer = g({ id: 'packetLayer' });

    root.appendChild(nodeEl);
    root.appendChild(cni0);
    root.appendChild(a.group);
    root.appendChild(b.group);
    // veth wires + their labels sit ABOVE the blocks: the dim arrows read clearly and
    // the wire text stays selectable instead of being trapped under the node rect.
    [vethA, vethB, vethBr, vethAr].forEach(el => root.appendChild(el));
    [wireA, wireB].forEach(t => root.appendChild(t));
    // packets ride on the very top.
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, nodeEl, podA: a.group, podABox: a.innerBox, podB: b.group, podBBox: b.innerBox, cni0,
      srcChip, dstChip, pathChip, natChip,
      packetLayer,
      wires: { a: wireA, b: wireB },
    };
  }

  reset() { this.build(); }
}

function setChips(s, { path, nat, src, dst }) {
  setVal(s.refs.pathChip, path);
  setVal(s.refs.natChip, nat);
  setVal(s.refs.srcChip, src);
  setVal(s.refs.dstChip, dst);
}

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  clearHighlights(s, ['cni0', 'podABox', 'podBBox', 'srcChip', 'dstChip', 'pathChip', 'natChip'], [s.refs.podA, s.refs.podB]);
  clearWires(s);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      resetStep(s);
      setChips(s, { path: 'L2 bridge', nat: 'none', src: '10.244.1.5', dst: '10.244.1.6' });
    },
  },
  {
    id: 'arp',
    duration: 5300,
    narration: 'A does not yet know the MAC behind 10.244.1.6, so it broadcasts an ARP request out eth0. The veth peer hands it to cni0, the Node Linux bridge, which floods it out every other port. B sees its own IP and unicasts an ARP reply with its MAC back to A, and from that reply the bridge learns which port B sits on.',
    enter(s, ctx) {
      resetStep(s);
      setWire(s, 'a', 'veth · eth0');
      setWire(s, 'b', 'veth · eth0');
      setChips(s, { path: 'ARP who-has .6', nat: 'none', src: '10.244.1.5', dst: '10.244.1.6' });
      s.refs.pathChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.cni0.classList.add('highlight'); s.refs.podABox.classList.add('highlight'); s.refs.podBBox.classList.add('highlight'); return; }
      pulsePod(s.refs.podA, ctx, 0);                // A broadcasts the request (blink first)
      const req1 = segmentPacket(s, ctx, { from: [350, TOP_Y], to: [505, TOP_Y], delay: BEAT.afterPulse, dur: HOP, role: 'network' });
      lightBoxAt(s.refs.cni0, ctx, req1.arrivalMs);   // the bridge lights as the frame reaches it, and never pulses
      const req2 = segmentPacket(s, ctx, { from: [675, TOP_Y], to: [850, TOP_Y], delay: req1.arrivalMs + BEAT.afterHop, dur: HOP, role: 'network' });
      const rep1 = segmentPacket(s, ctx, { from: [850, BOT_Y], to: [675, BOT_Y], delay: req2.arrivalMs + BEAT.afterHop, dur: HOP, role: 'network' });
      const rep2 = segmentPacket(s, ctx, { from: [505, BOT_Y], to: [350, BOT_Y], delay: rep1.arrivalMs + BEAT.afterHop, dur: HOP, role: 'network' });
      pulsePod(s.refs.podB, ctx, req2.arrivalMs);   // B receives the flood and replies
      pulsePod(s.refs.podA, ctx, rep2.arrivalMs);   // A gets B MAC from the reply
    },
  },
  {
    id: 'forward',
    duration: 3500,
    narration: 'With the MAC for B resolved and its bridge port learned, A sends the actual data frame as a unicast. It crosses the veth onto cni0, which switches it straight out the veth peer to B eth0. This is plain layer 2 forwarding inside the Node, so the packet never touches the physical NIC.',
    enter(s, ctx) {
      resetStep(s);
      setWire(s, 'a', 'veth · eth0');
      setWire(s, 'b', 'veth · eth0');
      setChips(s, { path: 'L2 bridge', nat: 'none', src: '10.244.1.5', dst: '10.244.1.6' });
      s.refs.pathChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.cni0.classList.add('highlight'); s.refs.podABox.classList.add('highlight'); s.refs.podBBox.classList.add('highlight'); return; }
      // A pulses FIRST and fully; the data frame departs only after that blink lands
      // (BEAT.afterPulse). It then rides the forward (top) lane A -> bridge -> B in two hops.
      pulsePod(s.refs.podA, ctx, 0);
      const hop1 = segmentPacket(s, ctx, { from: [350, TOP_Y], to: [505, TOP_Y], delay: BEAT.afterPulse, dur: HOP, role: 'network' });
      lightBoxAt(s.refs.cni0, ctx, hop1.arrivalMs);   // the bridge lights as the frame reaches it, and never pulses
      const hop2 = segmentPacket(s, ctx, { from: [675, TOP_Y], to: [850, TOP_Y], delay: hop1.arrivalMs + BEAT.afterHop, dur: HOP, role: 'network' });
      pulsePod(s.refs.podB, ctx, hop2.arrivalMs);
    },
  },
  {
    id: 'no-nat',
    duration: 2100,
    narration: 'B receives the packet with A real source IP intact. Same-node Pod-to-Pod traffic is never rewritten: there is no SNAT, no DNAT and no overlay encapsulation, just one bridge hop between two veth ports. Every Pod IP is routable inside the cluster, which is the flat-network promise of the Kubernetes model.',
    enter(s, ctx) {
      resetStep(s);
      setWire(s, 'b', 'veth · eth0');
      s.refs.srcChip.classList.add('highlight');
      s.refs.dstChip.classList.add('highlight');
      s.refs.natChip.classList.add('highlight');
      setChips(s, { path: 'L2 bridge', nat: 'none · src preserved', src: '10.244.1.5', dst: '10.244.1.6' });
      if (ctx.reduced) { s.refs.podBBox.classList.add('highlight'); return; }
      // Info chips get the strict static highlight only, no flash. Just the pod pulses.
      pulsePod(s.refs.podB, ctx, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
