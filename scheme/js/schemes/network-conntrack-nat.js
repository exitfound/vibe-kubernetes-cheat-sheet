import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. The flow
// runs left to right along y312, client -> netfilter (NAT + conntrack) -> server Pod. The NAT
// rewrite happens INSIDE the netfilter box, so the ball fades at one edge and re-emerges at the
// far edge, never sliding over it. netfilter is infrastructure: it lights, it never pulses. Only
// Pods pulse. The conntrack table chip carries the recorded flow tuple.
const FLOW_Y = 312;
const CLIENT_EDGE = 260;
const NF_LEFT = 470;
const NF_RIGHT = 710;
const SERVER_LEFT = 910;

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, cat: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 34, w: w - 40, h: 52, label: 'app', sublabel: 'eth0', cat: 'network' });
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
      'aria-label': 'Connection tracking and NAT: the first packet of a flow is rewritten by netfilter and recorded in the conntrack table as an entry mapping the original tuple to the translated one, so the reply is reverse-translated automatically and every later packet of the flow takes the same fast path without re-evaluating rules',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = podBlock({ x: 70, y: 252, w: 190, h: 120, label: 'client Pod', ip: '10.244.1.5' });
    const nf = box({ x: NF_LEFT, y: 276, w: 240, h: 72, label: 'netfilter', sublabel: 'NAT + conntrack', cat: 'network' });
    const server = podBlock({ x: 910, y: 252, w: 200, h: 120, label: 'server Pod', ip: '10.244.2.7:8080' });

    const cWire = arrow({ x1: CLIENT_EDGE, y1: FLOW_Y, x2: NF_LEFT, y2: FLOW_Y, dashed: true, dim: true, color: 'network' });
    const sWire = arrow({ x1: NF_RIGHT, y1: FLOW_Y, x2: SERVER_LEFT, y2: FLOW_Y, dashed: true, dim: true, color: 'network' });
    const cLabel = text({ class: 'scheme-label code dim', x: 365, y: FLOW_Y - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    const sLabel = text({ class: 'scheme-label code dim', x: 810, y: FLOW_Y - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    const origChip  = valChip({ x: 80,  y: 560, w: 270, h: 34, name: 'orig dst', value: '10.96.0.10:80', cat: 'network' });
    const natChip   = valChip({ x: 370, y: 560, w: 270, h: 34, name: 'translated', value: 'none', cat: 'network' });
    const stateChip = valChip({ x: 660, y: 560, w: 230, h: 34, name: 'ct state', value: 'none', cat: 'network' });
    const dirChip   = valChip({ x: 910, y: 560, w: 210, h: 34, name: 'reply', value: 'none', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: pods + netfilter box, then wires + labels above, then chips, then packet layer.
    root.appendChild(nf);
    root.appendChild(client.group);
    root.appendChild(server.group);
    [cWire, sWire, cLabel, sLabel].forEach(el => root.appendChild(el));
    [origChip, natChip, stateChip, dirChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, nf, client: client.group, clientBox: client.innerBox, server: server.group, serverBox: server.innerBox,
      origChip, natChip, stateChip, dirChip,
      packetLayer, wires: { c: cLabel, s: sLabel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['nf', 'origChip', 'natChip', 'stateChip', 'dirChip'], [s.refs.client, s.refs.server]);
}

function flashBox(s, ctx, key) {
  if (ctx.reduced) return;
  const el = s.refs[key];
  if (!el) return;
  ctx.register(el.animate(
    [{ filter: 'brightness(1)' }, { filter: 'brightness(1.5)' }, { filter: 'brightness(1)' }],
    { duration: 600, easing: 'ease-out' }
  ));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A connection is never a single packet. For NAT to work, the kernel has to rewrite the first packet and then remember that choice, so every packet of the same flow is translated the same way and the reply finds its way home. That memory is the conntrack table.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.origChip, '10.96.0.10:80');
      setVal(s.refs.natChip, 'none');
      setVal(s.refs.stateChip, 'none');
      setVal(s.refs.dirChip, 'none');
    },
  },
  {
    id: 'send',
    duration: 2200,
    narration: 'The client opens a connection to a Service address and the first packet leaves its eth0. On the way out it enters netfilter, where the NAT rules will decide what to do with a destination that no real host owns.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'c', 'dst 10.96.0.10:80');
      s.refs.origChip.classList.add('highlight');
      setVal(s.refs.origChip, '10.96.0.10:80');
      if (ctx.reduced) { s.refs.clientBox.classList.add('highlight'); s.refs.nf.classList.add('highlight'); return; }
      // Up-arrow: client pulses first, the packet leaves at BEAT.afterPulse and reaches netfilter.
      pulsePod(s.refs.client, ctx, 0);
      const send = segmentPacket(s, ctx, { from: [CLIENT_EDGE, FLOW_Y], to: [NF_LEFT, FLOW_Y], delay: BEAT.afterPulse, cat: 'network' });
      lightBoxAt(s.refs.nf, ctx, send.arrivalMs);
    },
  },
  {
    id: 'new',
    duration: 2500,
    narration: 'This is the first packet of an unseen flow, so conntrack creates a NEW entry. It records the original tuple and the translated one, rewrites the destination to the backend Pod IP, and forwards the packet on. The mapping is now stored for the life of the connection.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 's', 'dst 10.244.2.7:8080');
      s.refs.nf.classList.add('highlight');
      s.refs.natChip.classList.add('highlight');
      s.refs.stateChip.classList.add('highlight');
      setVal(s.refs.natChip, '-> 10.244.2.7:8080');
      setVal(s.refs.stateChip, 'NEW');
      if (ctx.reduced) { s.refs.serverBox.classList.add('highlight'); return; }
      // The rewritten packet emerges from netfilter (the DNAT happened inside) and is delivered to
      // the server, which pulses on arrival.
      const give = segmentPacket(s, ctx, { from: [NF_RIGHT, FLOW_Y], to: [SERVER_LEFT, FLOW_Y], cat: 'network' });
      pulsePod(s.refs.server, ctx, give.arrivalMs);
    },
  },
  {
    id: 'reply',
    duration: 2600,
    narration: 'The server replies from its own IP. conntrack matches the packet against the reverse tuple of the stored entry and undoes the translation automatically, so the source becomes the Service address again. The reply is not re-evaluated against the NAT rules, the recorded mapping is simply reversed.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'c', 'src restored to 10.96.0.10');
      s.refs.nf.classList.add('highlight');
      s.refs.stateChip.classList.add('highlight');
      s.refs.dirChip.classList.add('highlight');
      setVal(s.refs.stateChip, 'ESTABLISHED');
      setVal(s.refs.dirChip, 'reverse NAT');
      if (ctx.reduced) { s.refs.clientBox.classList.add('highlight'); return; }
      // Reply rides server -> netfilter (reverse NAT inside, ball hidden across the box) -> client,
      // which pulses on arrival.
      const h1 = segmentPacket(s, ctx, { from: [SERVER_LEFT, FLOW_Y], to: [NF_RIGHT, FLOW_Y], cat: 'network' });
      const h2 = segmentPacket(s, ctx, { from: [NF_LEFT, FLOW_Y], to: [CLIENT_EDGE, FLOW_Y], delay: h1.arrivalMs + BEAT.afterHop, cat: 'network' });
      pulsePod(s.refs.client, ctx, h2.arrivalMs);
    },
  },
  {
    id: 'fastpath',
    duration: 2400,
    narration: 'From now on every packet of this flow hits the existing ESTABLISHED entry and is translated the same way with no rule walk at all. This is why a flow always sticks to one backend, and why a node under heavy churn can exhaust its conntrack table and start dropping new connections.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.nf.classList.add('highlight');
      s.refs.natChip.classList.add('highlight');
      s.refs.stateChip.classList.add('highlight');
      setVal(s.refs.natChip, '-> 10.244.2.7:8080');
      setVal(s.refs.stateChip, 'ESTABLISHED');
      setVal(s.refs.dirChip, 'fast path');
      // Packet-less, pod-less recap: flash the netfilter box so the fast path reads as active.
      flashBox(s, ctx, 'nf');
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
