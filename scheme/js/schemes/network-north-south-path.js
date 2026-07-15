import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, pod, node, arrow, animateAlong } from '../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, pulsePod, segmentPacket, routeDur, makeInit, clearHighlights, BEAT } from '../lib/network-kit.js';

// North-south request path (viewBox 1200x640). NORTH-SOUTH is the name of the thing being drawn:
// traffic crossing the cluster boundary, as opposed to east-west Pod to Pod traffic. Instead of a bare
// full-height divider line, the composition is framed by two faint regions: an outside-the-cluster box
// on the left holding the client and cloud LB, and the Node box on the right holding kube-proxy,
// conntrack and the Pod. The empty GAP between the two regions IS the boundary, and the ball visibly
// crosses it once on the way in (LB2KP) and once on the way out (KP2LB).
//
// Standard contract: the Pod is a shell + inner box; only the Pod pulses; infrastructure (client, LB,
// kube-proxy, conntrack) lights via lightBoxAt and never pulses; value chips never flash; packets ride
// the wires and stop at block edges.
//
// GEOMETRY. Every wire and every packet is derived from a block edge, never hand-typed.
//
// Vertical: two lanes, FWD_Y above and RET_Y below the spine, because this card is a ROUND TRIP. A
// single retraced lane would send the reply backwards along a right-pointing arrowhead. Every block on
// the path is centred on FLOW_Y, so both lanes meet every block on its edge. The narration overlay
// really covers x 0..399, y 0..300, so the client and LB blocks sit at y >= 315 while the faint region
// boxes frame up to REGION_TOP to fill the top of the canvas and pull the whole scheme up and centred.
//
// Horizontal: client and cloud LB live in the outside region, kube-proxy, conntrack and the backend Pod
// live inside the Node region. conntrack is a real block here rather than a word in the narration: it is
// what pins the flow on the way in and what unwinds the DNAT on the way out, and it fills the Node
// interior. The framed diagram and the info-chip strip both span the same width, from the outside region
// left edge (22) to the Node region right edge (1176), so the scheme reads as one column.
//
// Addresses ride ALONG with the ball (ridingLabel) instead of sitting as static wire text. That is the
// whole point of the card: the same packet carries dst 203.0.113.9:443, then dst 192.168.1.20:31000,
// then dst 10.244.2.7:8080, and the reply unwinds those same three values as src. As inline wire text
// the longest of them overflowed its 80-unit gap and printed straight through the Pod border.
const FLOW_Y = 356;                 // spine: client, cloud LB, kube-proxy and the Pod are centred on it
const LANE_DY = 20;                 // half-gap between the forward and return lanes
const FWD_Y = FLOW_Y - LANE_DY;     // 336: request lane, above the spine
const RET_Y = FLOW_Y + LANE_DY;     // 376: reply lane, below the spine

const CLIENT_X = 40, CLIENT_W = 170, CLIENT_H = 74;
const CLIENT_RIGHT = CLIENT_X + CLIENT_W;      // 210
const LB_X = 290, LB_W = 180, LB_H = 74;
const LB_RIGHT = LB_X + LB_W;                  // 470

// Two faint framing regions replace the old full-height divider line. Both share the same top and
// height so they read as a matched pair, and the empty gap between them (EXT right 492 .. Node left 540)
// is the cluster boundary the north-south hops cross.
const REGION_TOP = 264, REGION_BOT = 488;
const REGION_H = REGION_BOT - REGION_TOP;      // 224
const EXT_X = 22, EXT_W = 470;                 // outside-the-cluster region: 22..492, wraps client + LB
const EXT_RIGHT = EXT_X + EXT_W;               // 492

const NODE_X = 540, NODE_W = 636;              // Node region: 540..1176, wraps kube-proxy, conntrack, Pod
const KP_X = 580, KP_W = 210, KP_H = 80;
const KP_RIGHT = KP_X + KP_W;                  // 790
const KP_CX = KP_X + KP_W / 2;                 // 685
const KP_BOTTOM = FLOW_Y + KP_H / 2;           // 396
const POD_X = 930, POD_W = 210, POD_H = 100;
const CT_X = 580, CT_Y = 418, CT_W = 560, CT_H = 54;            // conntrack table, under kube-proxy

const CHIP_Y = 500;

// Info-chip strip: four equal-width cells with equal gaps, spanning the full framed width (outside
// region left edge .. Node region right edge). Equal size + equal gap keeps the row symmetric.
const CHIP_STRIP_X = EXT_X;                                             // 22
const CHIP_STRIP_RIGHT = NODE_X + NODE_W;                              // 1176
const CHIP_GAP = 22;
const CHIP_H = 34;
const CHIP_W = (CHIP_STRIP_RIGHT - CHIP_STRIP_X - 3 * CHIP_GAP) / 4;   // 272
const chipX = (i) => CHIP_STRIP_X + i * (CHIP_W + CHIP_GAP);

// Each static wire and the ball that rides it share the same endpoints. Forward lane runs left to
// right, return lane right to left, and every arrowhead points the way its ball travels.
const C2LB = [[CLIENT_RIGHT, FWD_Y], [LB_X, FWD_Y]];
const LB2KP = [[LB_RIGHT, FWD_Y], [KP_X, FWD_Y]];               // the hop that crosses the gap
const KP2POD = [[KP_RIGHT, FWD_Y], [POD_X, FWD_Y]];
const POD2KP = [[POD_X, RET_Y], [KP_RIGHT, RET_Y]];
const KP2LB = [[KP_X, RET_Y], [LB_RIGHT, RET_Y]];               // crosses the gap on the way back
const LB2C = [[LB_X, RET_Y], [CLIENT_RIGHT, RET_Y]];

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// A tag that rides ALONG with the ball on the same path, timing and easing. Every ball here is a
// segmentPacket, which is always linear, so the tag must be linear too or it drifts off the ball
// mid-flight. dy places it above the forward lane and below the return lane, so a tag never lands on
// the other lane.
function ridingLabel(s, ctx, txt, points, { delay = 0, dy = -14 } = {}) {
  if (ctx.reduced) return;
  const d = routeDur(points);
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: dy, 'text-anchor': 'middle', 'data-cat': 'network' }, [txt]);
  lbl.style.opacity = '0';
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing: 'linear' }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 160, fill: 'forwards', easing: 'ease-in' }));
}

function podBlock({ x, y, w, h, label }) {
  const shell = pod({ x, y, w, h, label, containers: 0, cat: 'network' });
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
      'aria-label': 'North-south request path: an external client reaches a cloud load balancer at its public IP, the load balancer crosses the cluster boundary and forwards to a Node on the service NodePort, kube-proxy rules DNAT the packet to a backing Pod IP while conntrack pins the flow, the Pod serves the request, and the reply travels a separate return lane where conntrack unwinds every rewrite so the client sees an answer from the public IP it dialed',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // The two faint framing regions. Both use the node() primitive so they read as one matched pair of
    // barely-visible dashed containers: left is everything outside Kubernetes, right is the Node. The
    // outside region carries its title at the BOTTOM-left instead of the top so the narration overlay
    // (which sits over the top-left) never hides it.
    const extRegion = node({ x: EXT_X, y: REGION_TOP, w: EXT_W, h: REGION_H, label: '' });
    const extLabel = text({ class: 'scheme-node-label', x: EXT_RIGHT - 12, y: REGION_TOP + 18, 'text-anchor': 'end' }, ['internet   ·   outside cluster']);
    const theNode = node({ x: NODE_X, y: REGION_TOP, w: NODE_W, h: REGION_H, label: 'Node   ·   192.168.1.20' });
    const client = box({ x: CLIENT_X, y: FLOW_Y - CLIENT_H / 2, w: CLIENT_W, h: CLIENT_H, label: 'Client', sublabel: 'internet', cat: 'network' });
    const lb = box({ x: LB_X, y: FLOW_Y - LB_H / 2, w: LB_W, h: LB_H, label: 'Cloud LB', sublabel: '203.0.113.9:443', cat: 'network' });
    const kproxy = box({ x: KP_X, y: FLOW_Y - KP_H / 2, w: KP_W, h: KP_H, label: 'Kube-proxy rules', sublabel: 'NodePort 31000', cat: 'network' });
    const conntrack = box({ x: CT_X, y: CT_Y, w: CT_W, h: CT_H, label: 'Conntrack', sublabel: 'no flow yet', cat: 'network' });
    const podX = podBlock({ x: POD_X, y: FLOW_Y - POD_H / 2, w: POD_W, h: POD_H, label: 'Pod web' });

    const cFwd = arrow({ x1: C2LB[0][0], y1: C2LB[0][1], x2: C2LB[1][0], y2: C2LB[1][1], dashed: true, dim: true, color: 'network' });
    const lFwd = arrow({ x1: LB2KP[0][0], y1: LB2KP[0][1], x2: LB2KP[1][0], y2: LB2KP[1][1], dashed: true, dim: true, color: 'network' });
    const kFwd = arrow({ x1: KP2POD[0][0], y1: KP2POD[0][1], x2: KP2POD[1][0], y2: KP2POD[1][1], dashed: true, dim: true, color: 'network' });
    const kRet = arrow({ x1: POD2KP[0][0], y1: POD2KP[0][1], x2: POD2KP[1][0], y2: POD2KP[1][1], dashed: true, dim: true, color: 'network' });
    const lRet = arrow({ x1: KP2LB[0][0], y1: KP2LB[0][1], x2: KP2LB[1][0], y2: KP2LB[1][1], dashed: true, dim: true, color: 'network' });
    const cRet = arrow({ x1: LB2C[0][0], y1: LB2C[0][1], x2: LB2C[1][0], y2: LB2C[1][1], dashed: true, dim: true, color: 'network' });

    // Ownership marker, NOT a traffic path: the rules and the flow table are two halves of one
    // dataplane. No packet ever travels it, so it is a plain dashed line with no arrowhead.
    const ctLink = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-network', x1: KP_CX, y1: KP_BOTTOM, x2: KP_CX, y2: CT_Y, 'stroke-dasharray': '5 5', fill: 'none' });

    // Four equal cells, equal gaps, spanning the full framed width.
    const stageChip = valChip({ x: chipX(0), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'stage', value: 'idle', cat: 'network' });
    const svcChip   = valChip({ x: chipX(1), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'Service', value: 'type: LoadBalancer', cat: 'network' });
    const dnatChip  = valChip({ x: chipX(2), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'DNAT', value: 'none', cat: 'network' });
    const backChip  = valChip({ x: chipX(3), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'backend', value: 'none', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: the two framing regions in back, then the blocks, then wires + labels above them,
    // then chips, then the packet layer with its riding tags on top.
    root.appendChild(extRegion);
    root.appendChild(extLabel);
    root.appendChild(theNode);
    root.appendChild(client);
    root.appendChild(lb);
    root.appendChild(kproxy);
    root.appendChild(conntrack);
    root.appendChild(podX.group);
    [cFwd, lFwd, kFwd, kRet, lRet, cRet, ctLink].forEach(el => root.appendChild(el));
    [stageChip, svcChip, dnatChip, backChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, theNode, client, lb, kproxy, conntrack, podX: podX.group, podXBox: podX.innerBox,
      stageChip, svcChip, dnatChip, backChip, packetLayer,
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['client', 'lb', 'kproxy', 'conntrack', 'podXBox', 'stageChip', 'svcChip', 'dnatChip', 'backChip'], [s.refs.podX]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'North-south traffic is traffic that crosses the cluster boundary, as opposed to east-west traffic between Pods inside it. A request from the public internet does not reach a Pod in one jump. It crosses a chain of hops, each doing one job, that a LoadBalancer Service sets up for it.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.stageChip, 'idle');
      setVal(s.refs.dnatChip, 'none');
      setVal(s.refs.backChip, 'none');
      setBoxSublabel(s.refs.conntrack, 'no flow yet');
    },
  },
  {
    id: 'lb',
    duration: 2200,
    narration: 'The client connects to the public IP, which belongs to a cloud load balancer provisioned for the LoadBalancer Service. The LB is the only address exposed to the internet, and it is still outside the cluster. It picks one healthy Node to forward the connection to.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.stageChip, 'Cloud LB');
      setVal(s.refs.dnatChip, 'none');
      setVal(s.refs.backChip, 'none');
      setBoxSublabel(s.refs.conntrack, 'no flow yet');
      s.refs.client.classList.add('highlight');
      s.refs.stageChip.classList.add('highlight');
      s.refs.svcChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.lb.classList.add('highlight'); return; }
      // The packet carries the public IP as its destination, and the tag rides with it.
      const hop = segmentPacket(s, ctx, { from: C2LB[0], to: C2LB[1], cat: 'network' });
      ridingLabel(s, ctx, 'dst 203.0.113.9:443', C2LB);
      lightBoxAt(s.refs.lb, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'nodeport',
    duration: 2400,
    narration: 'The load balancer rewrites the destination to a Node and the service NodePort, a high port opened on every Node, and the packet crosses the cluster edge. kube-proxy programmed the rules that catch that port, so the packet is matched on arrival with the destination still the Node IP and that port.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.stageChip, 'NodePort');
      setVal(s.refs.dnatChip, 'none');
      setVal(s.refs.backChip, 'none');
      setBoxSublabel(s.refs.conntrack, 'no flow yet');
      s.refs.lb.classList.add('highlight');
      s.refs.stageChip.classList.add('highlight');
      s.refs.svcChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.kproxy.classList.add('highlight'); return; }
      // The only hop that crosses the region gap on the way in: the destination is now a Node, not the LB.
      const hop = segmentPacket(s, ctx, { from: LB2KP[0], to: LB2KP[1], cat: 'network' });
      ridingLabel(s, ctx, 'dst 192.168.1.20:31000', LB2KP);
      lightBoxAt(s.refs.kproxy, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'dnat',
    duration: 2800,
    narration: 'The Service rules DNAT the destination to a backing Pod IP, and conntrack records the flow so every later packet of this connection takes the same backend and the reply can be unwound. The rewritten packet is delivered to the Pod, which serves the request on its real port.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.stageChip, 'DNAT');
      setVal(s.refs.dnatChip, '-> 10.244.2.7:8080');
      setVal(s.refs.backChip, '10.244.2.7:8080');
      setBoxSublabel(s.refs.conntrack, '203.0.113.9 -> 10.244.2.7:8080  pinned');
      s.refs.kproxy.classList.add('highlight');
      s.refs.conntrack.classList.add('highlight');
      s.refs.stageChip.classList.add('highlight');
      s.refs.svcChip.classList.add('highlight');
      s.refs.dnatChip.classList.add('highlight');
      s.refs.backChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.podXBox.classList.add('highlight'); return; }
      // The rewrite happens INSIDE kube-proxy, so the ball re-emerges at its right edge already
      // carrying the Pod address. Down-arrow: packet first, the Pod pulses on arrival.
      const give = segmentPacket(s, ctx, { from: KP2POD[0], to: KP2POD[1], cat: 'network' });
      ridingLabel(s, ctx, 'dst 10.244.2.7:8080', KP2POD);
      pulsePod(s.refs.podX, ctx, give.arrivalMs);
    },
  },
  {
    id: 'reply',
    // Pod pulse (900) at 0, then three 700ms hops chained on BEAT: the last lands at 3100 and its
    // ripple + tag fade run to ~3660, so the step holds a touch longer than that before auto-advancing.
    duration: 3700,
    narration: 'The Pod replies, and the answer retraces the same chain in reverse, drawn here as its own lane. conntrack matches the reply to the flow it pinned and undoes the DNAT, so the source becomes the Node and its NodePort again, then the load balancer rewrites it once more and the client sees an answer from the public IP it dialed. The client never learns the Pod address, and every rewrite the request crossed is unwound on the way out.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.stageChip, 'reply unwinds');
      setVal(s.refs.dnatChip, 'reverse NAT');
      setVal(s.refs.backChip, '10.244.2.7:8080');
      setBoxSublabel(s.refs.conntrack, '203.0.113.9 -> 10.244.2.7:8080  pinned');
      s.refs.conntrack.classList.add('highlight');
      s.refs.stageChip.classList.add('highlight');
      s.refs.dnatChip.classList.add('highlight');
      s.refs.backChip.classList.add('highlight');
      if (ctx.reduced) {
        ['kproxy', 'lb', 'client'].forEach(k => s.refs[k].classList.add('highlight'));
        return;
      }
      // Up-arrow: the Pod is the sender, so it pulses FIRST and the reply leaves at BEAT.afterPulse.
      // Each hop unwinds one rewrite, and its tag says which source address the packet now carries.
      pulsePod(s.refs.podX, ctx, 0);
      const h1 = segmentPacket(s, ctx, { from: POD2KP[0], to: POD2KP[1], delay: BEAT.afterPulse, cat: 'network' });
      ridingLabel(s, ctx, 'src 10.244.2.7:8080', POD2KP, { delay: BEAT.afterPulse, dy: 24 });
      lightBoxAt(s.refs.kproxy, ctx, h1.arrivalMs);
      const h2 = segmentPacket(s, ctx, { from: KP2LB[0], to: KP2LB[1], delay: h1.arrivalMs + BEAT.afterHop, cat: 'network' });
      ridingLabel(s, ctx, 'src 192.168.1.20:31000', KP2LB, { delay: h1.arrivalMs + BEAT.afterHop, dy: 24 });
      lightBoxAt(s.refs.lb, ctx, h2.arrivalMs);
      const h3 = segmentPacket(s, ctx, { from: LB2C[0], to: LB2C[1], delay: h2.arrivalMs + BEAT.afterHop, cat: 'network' });
      ridingLabel(s, ctx, 'src 203.0.113.9:443', LB2C, { delay: h2.arrivalMs + BEAT.afterHop, dy: 24 });
      lightBoxAt(s.refs.client, ctx, h3.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
