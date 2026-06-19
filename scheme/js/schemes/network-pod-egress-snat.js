import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, arrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. A Node box
// holds the client Pod and the MASQUERADE box, with the Internet on the right. The egress lane
// runs along y360. The SNAT and the reverse SNAT happen INSIDE the masquerade box, so the ball
// fades at one edge and re-emerges at the far edge. masquerade is infrastructure: it lights, it
// never pulses. Only the Pod pulses.
const EGRESS_Y = 360;
const POD_EDGE = 290;
const MASQ_LEFT = 440;
const MASQ_RIGHT = 630;
const NET_LEFT = 880;

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
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
      'aria-label': 'Pod egress to the internet: a Pod IP is private to the cluster and not routable outside, so as the packet leaves the Node it is source-NATed to the Node IP by an iptables MASQUERADE rule, conntrack records the mapping, the internet replies to the Node IP, and conntrack reverses the translation so the reply reaches the Pod',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const theNode = node({ x: 70, y: 214, w: 620, h: 312, label: 'Node   ·   192.168.1.20' });

    const shell = pod({ x: 110, y: 300, w: 200, h: 124, label: 'client Pod', sublabel: '10.244.1.5', containers: 0, cat: 'network' });
    const shellRect = shell.querySelector('.scheme-pod-rect');
    if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
    const podGroup = g({});
    podGroup.appendChild(shell);
    const eth0 = box({ x: 130, y: 334, w: 160, h: 52, label: 'app', sublabel: 'eth0', cat: 'network' });

    const masq = box({ x: MASQ_LEFT, y: 329, w: 190, h: 62, label: 'MASQUERADE', sublabel: 'iptables SNAT', cat: 'network' });
    const net = box({ x: 880, y: 329, w: 230, h: 62, label: 'Internet', sublabel: '1.1.1.1:443', cat: 'network' });

    const eWire = arrow({ x1: POD_EDGE, y1: EGRESS_Y, x2: MASQ_LEFT, y2: EGRESS_Y, dashed: true, dim: true, color: 'network' });
    const nWire = arrow({ x1: MASQ_RIGHT, y1: EGRESS_Y, x2: NET_LEFT, y2: EGRESS_Y, dashed: true, dim: true, color: 'network' });
    const eLabel = text({ class: 'scheme-label code dim', x: 365, y: EGRESS_Y - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    const nLabel = text({ class: 'scheme-label code dim', x: 755, y: EGRESS_Y - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    const srcChip  = valChip({ x: 80,  y: 560, w: 270, h: 34, name: 'src', value: '10.244.1.5', cat: 'network' });
    const snatChip = valChip({ x: 370, y: 560, w: 270, h: 34, name: 'SNAT', value: 'none', cat: 'network' });
    const ctChip   = valChip({ x: 660, y: 560, w: 230, h: 34, name: 'conntrack', value: 'none', cat: 'network' });
    const dstChip  = valChip({ x: 910, y: 560, w: 210, h: 34, name: 'dst', value: '1.1.1.1:443', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: Node background, then Pod + masquerade + internet boxes, then wires + labels above,
    // then chips, then the packet layer on top.
    root.appendChild(theNode);
    root.appendChild(masq);
    root.appendChild(net);
    root.appendChild(podGroup);
    root.appendChild(eth0);
    [eWire, nWire, eLabel, nLabel].forEach(el => root.appendChild(el));
    [srcChip, snatChip, ctChip, dstChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, theNode, podGroup, eth0, masq, net,
      srcChip, snatChip, ctChip, dstChip,
      packetLayer, wires: { e: eLabel, n: nLabel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['masq', 'net', 'eth0', 'srcChip', 'snatChip', 'ctChip', 'dstChip'], [s.refs.podGroup]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Pod wants to reach an address out on the internet. Its source IP, 10.244.1.5, is private to the cluster and the outside world has no route back to it. If the packet left with that source untouched, the reply would have nowhere to return.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.srcChip, '10.244.1.5');
      setVal(s.refs.snatChip, 'none');
      setVal(s.refs.ctChip, 'none');
      setVal(s.refs.dstChip, '1.1.1.1:443');
    },
  },
  {
    id: 'send',
    duration: 2200,
    narration: 'The Pod sends to 1.1.1.1 out its eth0. The packet carries src 10.244.1.5 and rides the veth into the Node, where it heads for the egress path on its way off the host.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'e', 'src 10.244.1.5');
      s.refs.srcChip.classList.add('highlight');
      setVal(s.refs.srcChip, '10.244.1.5');
      if (ctx.reduced) { s.refs.eth0.classList.add('highlight'); s.refs.masq.classList.add('highlight'); return; }
      // Up-arrow: the Pod pulses first, the packet leaves at BEAT.afterPulse and reaches the
      // masquerade box, which lights on arrival.
      pulsePod(s.refs.podGroup, ctx, 0);
      const send = segmentPacket(s, ctx, { from: [POD_EDGE, EGRESS_Y], to: [MASQ_LEFT, EGRESS_Y], delay: BEAT.afterPulse, cat: 'network' });
      lightBoxAt(s.refs.masq, ctx, send.arrivalMs);
    },
  },
  {
    id: 'masquerade',
    duration: 2600,
    narration: 'As the packet leaves the Node, a MASQUERADE rule rewrites the source from the Pod IP to the Node IP, 192.168.1.20, and conntrack records the mapping. The packet now looks like it came from the Node itself, an address the internet can route a reply back to.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'n', 'src 192.168.1.20');
      s.refs.masq.classList.add('highlight');
      s.refs.snatChip.classList.add('highlight');
      s.refs.ctChip.classList.add('highlight');
      setVal(s.refs.snatChip, '-> 192.168.1.20');
      setVal(s.refs.ctChip, 'flow recorded');
      if (ctx.reduced) { s.refs.net.classList.add('highlight'); return; }
      // The SNAT-ed packet emerges from the masquerade box (rewrite happened inside) and reaches
      // the internet endpoint, which lights on arrival.
      const out = segmentPacket(s, ctx, { from: [MASQ_RIGHT, EGRESS_Y], to: [NET_LEFT, EGRESS_Y], cat: 'network' });
      lightBoxAt(s.refs.net, ctx, out.arrivalMs);
    },
  },
  {
    id: 'reply',
    duration: 2600,
    narration: 'The server replies to 192.168.1.20, the only address it ever saw. The reply arrives at the Node, where conntrack matches the stored flow and reverses the translation, rewriting the destination back to 10.244.1.5.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'n', 'dst 192.168.1.20');
      s.refs.masq.classList.add('highlight');
      s.refs.ctChip.classList.add('highlight');
      setVal(s.refs.ctChip, 'reverse SNAT');
      setVal(s.refs.dstChip, '1.1.1.1:443');
      if (ctx.reduced) { s.refs.masq.classList.add('highlight'); return; }
      // Reply rides internet -> masquerade box (reverse SNAT inside) and lights the box on arrival,
      // ready to be delivered back to the Pod in the next step.
      const back = segmentPacket(s, ctx, { from: [NET_LEFT, EGRESS_Y], to: [MASQ_RIGHT, EGRESS_Y], cat: 'network' });
      lightBoxAt(s.refs.masq, ctx, back.arrivalMs);
    },
  },
  {
    id: 'deliver',
    duration: 2400,
    narration: 'With the destination restored to the Pod IP, the reply is delivered back down the veth into the Pod. The Pod only ever used its own source address, the SNAT and its reversal happened entirely on the Node, invisible to both ends.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'e', 'dst 10.244.1.5');
      s.refs.masq.classList.add('highlight');
      s.refs.srcChip.classList.add('highlight');
      setVal(s.refs.ctChip, 'reverse SNAT');
      if (ctx.reduced) { s.refs.eth0.classList.add('highlight'); return; }
      // Down-arrow: the restored packet leaves the masquerade box and hops into the Pod, which
      // pulses on arrival as the receiver.
      const into = segmentPacket(s, ctx, { from: [MASQ_LEFT, EGRESS_Y], to: [POD_EDGE, EGRESS_Y], cat: 'network' });
      pulsePod(s.refs.podGroup, ctx, into.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
