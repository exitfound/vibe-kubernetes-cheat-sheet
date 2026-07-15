import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. The flow
// runs client -> netfilter (NAT + conntrack) -> server Pod and back, on TWO stacked lanes so the
// ball always has a matching arrow: the request lane (REQ_Y, arrows point right) carries the
// outbound packet, the reply lane (REP_Y, arrows point left) carries the return. The NAT rewrite
// happens INSIDE the netfilter box, so the ball fades at one edge and re-emerges at the far edge,
// never sliding over it. netfilter is infrastructure: it lights, it never pulses. Only Pods pulse.
// The four state chips sit in one plane under the block each describes: orig dst under the client,
// ct state + reply under netfilter, translated (the backend address) under the server.
const FLOW_Y = 312;     // mid-line, where the per-gap wire label sits between the two lanes
const REQ_Y = 300;      // request lane (left -> right)
const REP_Y = 324;      // reply lane (right -> left)
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

    // Two lanes per gap: request (top, ->) and reply (bottom, <-). The reply arrows are the reverse
    // direction the ball travels on the reply step, so the motion always has a matching arrow.
    const cReq = arrow({ x1: CLIENT_EDGE, y1: REQ_Y, x2: NF_LEFT,     y2: REQ_Y, dashed: true, dim: true, color: 'network' });
    const cRep = arrow({ x1: NF_LEFT,     y1: REP_Y, x2: CLIENT_EDGE, y2: REP_Y, dashed: true, dim: true, color: 'network' });
    const sReq = arrow({ x1: NF_RIGHT,    y1: REQ_Y, x2: SERVER_LEFT, y2: REQ_Y, dashed: true, dim: true, color: 'network' });
    const sRep = arrow({ x1: SERVER_LEFT, y1: REP_Y, x2: NF_RIGHT,    y2: REP_Y, dashed: true, dim: true, color: 'network' });
    const cLabel = text({ class: 'scheme-label code dim', x: 365, y: FLOW_Y + 3, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    const sLabel = text({ class: 'scheme-label code dim', x: 810, y: FLOW_Y + 3, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    // Chips sit in one plane with the blocks above. The outer two are flush with the pod footprints:
    // orig dst left edge = client Pod left edge (70), translated right edge = server Pod right edge
    // (1110). ct state + reply stay centred under netfilter (590). orig dst -> client, conntrack
    // bookkeeping -> netfilter, translated (the backend address) -> server.
    const origChip  = valChip({ x: 70,  y: 530, w: 250, h: 34, name: 'orig dst',   value: '10.96.0.10:80', cat: 'network' });
    const stateChip = valChip({ x: 368, y: 530, w: 215, h: 34, name: 'ct state',   value: 'none',          cat: 'network' });
    const dirChip   = valChip({ x: 597, y: 530, w: 215, h: 34, name: 'reply',      value: 'none',          cat: 'network' });
    const natChip   = valChip({ x: 860, y: 530, w: 250, h: 34, name: 'translated', value: 'none',          cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: pods + netfilter box, then wires + labels above, then chips, then packet layer.
    root.appendChild(nf);
    root.appendChild(client.group);
    root.appendChild(server.group);
    [cReq, cRep, sReq, sRep, cLabel, sLabel].forEach(el => root.appendChild(el));
    [origChip, stateChip, dirChip, natChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, nf, client: client.group, clientBox: client.innerBox, server: server.group, serverBox: server.innerBox,
      origChip, stateChip, dirChip, natChip,
      packetLayer, wires: { c: cLabel, s: sLabel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['nf', 'origChip', 'natChip', 'stateChip', 'dirChip'], [s.refs.client, s.refs.server]);
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
      // Up-arrow: client pulses first, the packet leaves on the request lane at BEAT.afterPulse and
      // reaches netfilter.
      pulsePod(s.refs.client, ctx, 0);
      const send = segmentPacket(s, ctx, { from: [CLIENT_EDGE, REQ_Y], to: [NF_LEFT, REQ_Y], delay: BEAT.afterPulse, cat: 'network' });
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
      // The rewritten packet emerges from netfilter (the DNAT happened inside) on the request lane
      // and is delivered to the server, which pulses on arrival.
      const give = segmentPacket(s, ctx, { from: [NF_RIGHT, REQ_Y], to: [SERVER_LEFT, REQ_Y], cat: 'network' });
      pulsePod(s.refs.server, ctx, give.arrivalMs);
    },
  },
  {
    id: 'reply',
    duration: 2600,
    narration: 'The server replies from its own IP, and conntrack matches the packet against the reverse tuple of the stored entry. The translation is undone automatically, so the source becomes the Service address again and seeing this reply flips the entry to ESTABLISHED. The reply is never re-evaluated against the NAT rules, the recorded mapping is simply reversed.',
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
      // Reply rides the reply lane: server -> netfilter (reverse NAT inside, ball hidden across the
      // box) -> client, which pulses on arrival.
      const h1 = segmentPacket(s, ctx, { from: [SERVER_LEFT, REP_Y], to: [NF_RIGHT, REP_Y], cat: 'network' });
      const h2 = segmentPacket(s, ctx, { from: [NF_LEFT, REP_Y], to: [CLIENT_EDGE, REP_Y], delay: h1.arrivalMs + BEAT.afterHop, cat: 'network' });
      pulsePod(s.refs.client, ctx, h2.arrivalMs);
    },
  },
  {
    id: 'fastpath',
    duration: 2600,
    narration: 'From now on every packet of this flow hits the existing ESTABLISHED entry and is translated the same way with no rule walk at all. This is why a flow always sticks to one backend, and why a Node under heavy churn can exhaust its conntrack table and start dropping new connections.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'c', 'dst 10.96.0.10:80');
      setWire(s, 's', '-> 10.244.2.7:8080');
      s.refs.nf.classList.add('highlight');
      s.refs.natChip.classList.add('highlight');
      s.refs.stateChip.classList.add('highlight');
      s.refs.dirChip.classList.add('highlight');
      setVal(s.refs.natChip, '-> 10.244.2.7:8080');
      setVal(s.refs.stateChip, 'ESTABLISHED');
      setVal(s.refs.dirChip, 'fast path');
      if (ctx.reduced) { s.refs.serverBox.classList.add('highlight'); return; }
      // A later packet takes the fast path: client pulses, then the ball runs straight through on the
      // request lane (translated inside netfilter, no pause for a rule walk) to the server.
      pulsePod(s.refs.client, ctx, 0);
      const h1 = segmentPacket(s, ctx, { from: [CLIENT_EDGE, REQ_Y], to: [NF_LEFT, REQ_Y], delay: BEAT.afterPulse, cat: 'network' });
      const h2 = segmentPacket(s, ctx, { from: [NF_RIGHT, REQ_Y], to: [SERVER_LEFT, REQ_Y], delay: h1.arrivalMs + BEAT.afterHop, cat: 'network' });
      pulsePod(s.refs.server, ctx, h2.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
