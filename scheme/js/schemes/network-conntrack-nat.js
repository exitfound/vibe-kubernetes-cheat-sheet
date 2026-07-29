import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt } from '../lib/network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-conntrack-nat


// Geometry. Panel measured 2026-07-27: right <= 397, bottom <= 255. A longer narration invalidates
// that bottom. The flow row starts at y=252, so the top 3 units of the Client Pod (x 70..260) do
// overlap the panel corner: far under the OCCLUDED area threshold, and left as measured rather
// than nudged. Do not read this as a clearance.
const POD_Y = 252, POD_H = 120;                    // both Pod shells stand on one baseline
const CLIENT_X = 70, CLIENT_W = 190;
const CLIENT_EDGE = CLIENT_X + CLIENT_W;           // 260
const NF_X = 470, NF_W = 240, NF_Y = 276, NF_H = 72;
const NF_LEFT = NF_X, NF_RIGHT = NF_X + NF_W;      // 470 / 710
const NF_CX = NF_X + NF_W / 2;                     // 590
const CHIP_R = 1130;                               // the strip and the server Pod end here together
const SERVER_W = 200, SERVER_X = CHIP_R - SERVER_W;// 930
const SERVER_LEFT = SERVER_X;

const FLOW_Y = POD_Y + POD_H / 2;   // 312: mid-line, where the per-gap wire label sits between the lanes
const LANE_DY = 12;                 // half-gap between the request and reply lanes
const REQ_Y = FLOW_Y - LANE_DY;     // 300: request lane (left -> right)
const REP_Y = FLOW_Y + LANE_DY;     // 324: reply lane (right -> left)

// Chip strip: the outer two are flush with the Pod footprints (CHIP_L is the client left edge,
// CHIP_R the server right edge) and the middle pair stays centred under netfilter, so the strip
// spans CHIP_L..CHIP_R and centres on x=600 with every chip still under the block it describes.
const CHIP_L = CLIENT_X, CHIP_Y = 530, CHIP_H = 34;
const CHIP_W_OUT = 250, CHIP_W_MID = 215, CHIP_GAP_MID = 14;
const CHIP_X_ORIG = CHIP_L;                                     // 70
const CHIP_X_STATE = NF_CX - CHIP_GAP_MID / 2 - CHIP_W_MID;     // 368
const CHIP_X_DIR = NF_CX + CHIP_GAP_MID / 2;                    // 597
const CHIP_X_NAT = CHIP_R - CHIP_W_OUT;                         // 880

function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, role: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 34, w: w - 40, h: 52, label: 'app', sublabel: 'eth0', role: 'network' });
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

    const client = podBlock({ x: CLIENT_X, y: POD_Y, w: CLIENT_W, h: POD_H, label: 'Client Pod', ip: '10.244.1.5' });
    const nf = box({ x: NF_X, y: NF_Y, w: NF_W, h: NF_H, label: 'netfilter', sublabel: 'NAT + conntrack', role: 'network' });
    const server = podBlock({ x: SERVER_X, y: POD_Y, w: SERVER_W, h: POD_H, label: 'Server Pod', ip: '10.244.2.7:8080' });

    // Two lanes per gap: request (top, ->) and reply (bottom, <-). The reply arrows are the reverse
    // direction the ball travels on the reply step, so the motion always has a matching arrow.
    const cReq = arrow({ x1: CLIENT_EDGE, y1: REQ_Y, x2: NF_LEFT,     y2: REQ_Y, dashed: true, dim: true, role: 'network' });
    const cRep = arrow({ x1: NF_LEFT,     y1: REP_Y, x2: CLIENT_EDGE, y2: REP_Y, dashed: true, dim: true, role: 'network' });
    const sReq = arrow({ x1: NF_RIGHT,    y1: REQ_Y, x2: SERVER_LEFT, y2: REQ_Y, dashed: true, dim: true, role: 'network' });
    const sRep = arrow({ x1: SERVER_LEFT, y1: REP_Y, x2: NF_RIGHT,    y2: REP_Y, dashed: true, dim: true, role: 'network' });
    const cLabel = text({ class: 'scheme-label code dim', x: (CLIENT_EDGE + NF_LEFT) / 2, y: FLOW_Y + 3, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    const sLabel = text({ class: 'scheme-label code dim', x: (NF_RIGHT + SERVER_LEFT) / 2, y: FLOW_Y + 3, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    const origChip  = valChip({ x: CHIP_X_ORIG,  y: CHIP_Y, w: CHIP_W_OUT, h: CHIP_H, name: 'orig dst',   value: '10.96.0.20:80', role: 'network' });
    const stateChip = valChip({ x: CHIP_X_STATE, y: CHIP_Y, w: CHIP_W_MID, h: CHIP_H, name: 'ct state',   value: 'none',          role: 'network' });
    const dirChip   = valChip({ x: CHIP_X_DIR,   y: CHIP_Y, w: CHIP_W_MID, h: CHIP_H, name: 'reply',      value: 'none',          role: 'network' });
    const natChip   = valChip({ x: CHIP_X_NAT,   y: CHIP_Y, w: CHIP_W_OUT, h: CHIP_H, name: 'translated', value: 'none',          role: 'network' });

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
  // The inner boxes are keys, not pod groups: a pod group only has its pulse strokes reset, so a
  // .highlight left on a container would ride along into every later step.
  clearHighlights(s, ['nf', 'clientBox', 'serverBox', 'origChip', 'natChip', 'stateChip', 'dirChip'], [s.refs.client, s.refs.server]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.origChip, '10.96.0.20:80');
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
      setWire(s, 'c', 'dst 10.96.0.20:80');
      s.refs.origChip.classList.add('highlight');
      setVal(s.refs.origChip, '10.96.0.20:80');
      if (ctx.reduced) { s.refs.clientBox.classList.add('highlight'); s.refs.nf.classList.add('highlight'); return; }
      // Up-arrow: client pulses first, the packet leaves on the request lane at BEAT.afterPulse and
      // reaches netfilter.
      pulsePod(s.refs.client, ctx, 0);
      const send = segmentPacket(s, ctx, { from: [CLIENT_EDGE, REQ_Y], to: [NF_LEFT, REQ_Y], delay: BEAT.afterPulse, role: 'network' });
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
      const give = segmentPacket(s, ctx, { from: [NF_RIGHT, REQ_Y], to: [SERVER_LEFT, REQ_Y], role: 'network' });
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
      setWire(s, 'c', 'src restored to 10.96.0.20');
      s.refs.stateChip.classList.add('highlight');
      s.refs.dirChip.classList.add('highlight');
      setVal(s.refs.stateChip, 'ESTABLISHED');
      setVal(s.refs.dirChip, 'reverse NAT');
      if (ctx.reduced) { s.refs.nf.classList.add('highlight'); s.refs.clientBox.classList.add('highlight'); return; }
      // Reply rides the reply lane: server -> netfilter (reverse NAT inside, ball hidden across the
      // box) -> client, which pulses on arrival. netfilter lights as the reply enters it, the same
      // shape the send step uses, so the box is not already lit when its own packet lands.
      const h1 = segmentPacket(s, ctx, { from: [SERVER_LEFT, REP_Y], to: [NF_RIGHT, REP_Y], role: 'network' });
      lightBoxAt(s.refs.nf, ctx, h1.arrivalMs);
      const h2 = segmentPacket(s, ctx, { from: [NF_LEFT, REP_Y], to: [CLIENT_EDGE, REP_Y], delay: h1.arrivalMs + BEAT.afterHop, role: 'network' });
      pulsePod(s.refs.client, ctx, h2.arrivalMs);
    },
  },
  {
    id: 'fastpath',
    duration: 3300,
    narration: 'From now on every packet of this flow hits the existing ESTABLISHED entry and is translated the same way with no rule walk at all. This is why a flow always sticks to one backend, and why a Node under heavy churn can exhaust its conntrack table and start dropping new connections.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'c', 'dst 10.96.0.20:80');
      setWire(s, 's', '-> 10.244.2.7:8080');
      s.refs.natChip.classList.add('highlight');
      s.refs.stateChip.classList.add('highlight');
      s.refs.dirChip.classList.add('highlight');
      setVal(s.refs.natChip, '-> 10.244.2.7:8080');
      setVal(s.refs.stateChip, 'ESTABLISHED');
      setVal(s.refs.dirChip, 'fast path');
      if (ctx.reduced) { s.refs.nf.classList.add('highlight'); s.refs.serverBox.classList.add('highlight'); return; }
      // A later packet takes the fast path: client pulses, then the ball runs straight through on the
      // request lane (translated inside netfilter, no pause for a rule walk) to the server.
      pulsePod(s.refs.client, ctx, 0);
      const h1 = segmentPacket(s, ctx, { from: [CLIENT_EDGE, REQ_Y], to: [NF_LEFT, REQ_Y], delay: BEAT.afterPulse, role: 'network' });
      lightBoxAt(s.refs.nf, ctx, h1.arrivalMs);
      const h2 = segmentPacket(s, ctx, { from: [NF_RIGHT, REQ_Y], to: [SERVER_LEFT, REQ_Y], delay: h1.arrivalMs + BEAT.afterHop, role: 'network' });
      pulsePod(s.refs.server, ctx, h2.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
