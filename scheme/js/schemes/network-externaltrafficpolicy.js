import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, arrow, pathArrow, animateAlong } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, routeDur, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/network-kit.js';

// externalTrafficPolicy Cluster vs Local (viewBox 1200x640). Client above the LB, the LB fans down
// to two Nodes; Node-1 has a local backend, Node-2 has none. In Cluster mode the packet that lands
// on Node-2 is SNAT-ed and forwarded across the underlay lane to the Pod on Node-1; in Local mode
// the Node-1 path is straight. Standard contract: Pod is shell + inner box; only the Pod pulses;
// value chips never flash; packets ride wires and the underlay, stopping at edges.
//
// GEOMETRY. Every wire is derived from a block edge, never hand-typed, so a block and the packet that
// rides to it cannot drift apart. The backend is a standard podBlock (POD_W x POD_H, the same shell as
// every other card) and it is centred BOTH ways inside Node-1, on N1_CX and on the node rect centre, so
// the fan drops straight down the Pod axis onto the Node edge above it.
//
// Horizontal: the two Nodes are the widest row, mirrored about MID_X with NODE_GAP between them, so the
// scheme spans SCHEME_LEFT..SCHEME_RIGHT = 180..1020 and centres on 600. The chip strip spans that same
// extent 1:1. Vertical: the stack is client / LB / Nodes / underlay / chips with deliberate gaps, and
// the totals leave an equal 40 margin above the client and below the chips, so it centres on the canvas.
const MID_X = 600;

const CLIENT_W = 240, CLIENT_H = 58, CLIENT_Y = 40;
const LB_W = 300, LB_H = 74, LB_Y = 134;              // 36 below the client
const NODE_W = 360, NODE_H = 188, NODE_Y = 280;       // 72 below the LB, leaving room for the fan bus
const POD_W = 210, POD_H = 114;                       // the standard pod shell
const CHIP_Y = 566, CHIP_H = 34;

const CLIENT_X = MID_X - CLIENT_W / 2;                // 480
const CLIENT_BOTTOM = CLIENT_Y + CLIENT_H;            // 98
const LB_X = MID_X - LB_W / 2;                        // 450
const LB_BOTTOM = LB_Y + LB_H;                        // 208

const NODE_GAP = 120;
const N1_X = MID_X - NODE_GAP / 2 - NODE_W;           // 180
const N2_X = MID_X + NODE_GAP / 2;                    // 660
const N1_CX = N1_X + NODE_W / 2;                      // 360
const N2_CX = N2_X + NODE_W / 2;                      // 840
const NODE_BOTTOM = NODE_Y + NODE_H;                  // 468

// The pod is centred in the Node-1 block itself, both ways: on N1_CX horizontally, and on the node
// rect centre vertically, so the clearance above and below it is equal (37 each).
const POD_X = N1_CX - POD_W / 2;                      // 255
const POD_Y = NODE_Y + (NODE_H - POD_H) / 2;          // 317

const BUS_Y = (LB_BOTTOM + NODE_Y) / 2;               // 244, the horizontal bus the fan splits on
const UNDER_Y = NODE_BOTTOM + 46;                     // 514, the underlay lane between the Nodes

const SCHEME_LEFT = N1_X;                             // 180
const SCHEME_RIGHT = N2_X + NODE_W;                   // 1020

// Each static wire and the packet that rides it share the same points array.
const C_WIRE = [[MID_X, CLIENT_BOTTOM], [MID_X, LB_Y]];
const TO_N1 = [[MID_X, LB_BOTTOM], [MID_X, BUS_Y], [N1_CX, BUS_Y], [N1_CX, NODE_Y]];
const TO_N2 = [[MID_X, LB_BOTTOM], [MID_X, BUS_Y], [N2_CX, BUS_Y], [N2_CX, NODE_Y]];
// Traffic is delivered TO A NODE, never drawn as entering the Pod: a packet stops at the Node boundary
// it arrives on (the top edge coming down from the LB, the bottom edge coming up off the underlay) and
// the Pod inside pulses to show it was served. So no wire and no ball ever crosses a Node border.
const CROSS = [[N2_CX, NODE_BOTTOM], [N2_CX, UNDER_Y], [N1_CX, UNDER_Y], [N1_CX, NODE_BOTTOM]]; // Node-2 -> underlay -> Node-1

// A small label that rides ALONG with the ball on the same path, timing and easing, tagging it with the
// source address that leg actually carries. It lives in the packet layer but is not a .scheme-packet, so
// it does not count as a packet to the tools. dur omitted => routeDur(points), matching a ball that also
// omits dur, and routePacket legs keep the default ease-in-out so the tag stays locked to the ball.
//
// Two card-specific options. `emerge` holds the tag invisible for the first few hundred ms: both fan legs
// LEAVE the LoadBalancer bottom edge, and a tag 14 above the ball would otherwise paint over the LB
// sublabel before the ball clears the box. `dy` flips the tag below the ball for the underlay leg, whose
// endpoints sit on Node edges: above the ball it would render inside a Node, below it stays in the
// underlay lane the whole way.
function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'ease-in-out', emerge = 0, dy = -14 } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: dy, 'text-anchor': 'middle', 'data-cat': 'network' }, [txt]);
  lbl.style.opacity = '0';
  lbl.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px)`;
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: delay + emerge, fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 170, delay: delay + d, fill: 'forwards', easing: 'ease-in' }));
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
      'aria-label': 'ExternalTrafficPolicy Cluster versus Local: Cluster forwards to a backend on any node but SNATs away the client IP, while Local keeps the client IP and avoids the extra hop at the cost of dropping traffic on nodes with no local backend',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = box({ x: CLIENT_X, y: CLIENT_Y, w: CLIENT_W, h: CLIENT_H, label: 'External Client', sublabel: 'src 198.51.100.9', cat: 'network' });
    const lb     = box({ x: LB_X, y: LB_Y, w: LB_W, h: LB_H, label: 'LoadBalancer', sublabel: 'targets node ports', cat: 'network' });

    const cWire = arrow({ x1: C_WIRE[0][0], y1: C_WIRE[0][1], x2: C_WIRE[1][0], y2: C_WIRE[1][1], dashed: true, dim: true, color: 'network' });
    const fan1 = pathArrow({ points: TO_N1, dashed: true, dim: true, color: 'network' });
    const fan2 = pathArrow({ points: TO_N2, dashed: true, dim: true, color: 'network' });
    const crossWire = pathArrow({ points: CROSS, dashed: true, dim: true, color: 'network' });
    // No inline src-IP text on the client wire: the address RIDES the ball (ridingLabel), so each leg is
    // tagged with the source it actually carries. The client box sublabel still states the origin address.

    const node1 = node({ x: N1_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1   ·   has local backend' });
    const node2 = node({ x: N2_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2   ·   no local backend' });
    const podW = podBlock({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web', ip: '10.244.1.5' });
    // What the healthCheckNodePort reports on each Node. Both sit on the same baseline so they read as a
    // pair, low enough to clear the Pod above (sublabel baseline 423) and the crossWire arrowhead below.
    const node1Note = text({ class: 'scheme-label code dim', x: N1_CX, y: 448, 'text-anchor': 'middle', 'font-size': 11 }, [' ']);
    const node2Note = text({ class: 'scheme-label code dim', x: N2_CX, y: 448, 'text-anchor': 'middle', 'font-size': 11 }, [' ']);

    // The four chips span the scheme 1:1, from the Node-1 left edge to the Node-2 right edge, with even
    // 20px gaps. Widths are tuned to their content (externalTrafficPolicy carries the longest name).
    const modeChip = valChip({ x: SCHEME_LEFT, y: CHIP_Y, w: 240, h: CHIP_H, name: 'externalTrafficPolicy', value: 'Cluster', cat: 'network' });
    // src IP and extra hop are OUTCOMES of a request, so they read none until traffic actually flows.
    // Widths are still sized for their widest value (lost (SNAT) / yes), not for none.
    const srcChip  = valChip({ x: 440, y: CHIP_Y, w: 225, h: CHIP_H, name: 'client src IP', value: 'none', cat: 'network' });
    const hopChip  = valChip({ x: 685, y: CHIP_Y, w: 135, h: CHIP_H, name: 'extra hop', value: 'none', cat: 'network' });
    const hcChip   = valChip({ x: 840, y: CHIP_Y, w: SCHEME_RIGHT - 840, h: CHIP_H, name: 'healthCheck', value: 'unused', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    root.appendChild(node1);
    root.appendChild(node2);
    root.appendChild(podW.group);
    root.appendChild(client);
    root.appendChild(lb);
    [cWire, fan1, fan2, crossWire, node1Note, node2Note].forEach(el => root.appendChild(el));
    [modeChip, srcChip, hopChip, hcChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, client, lb, node1, node2, podW: podW.group, podWBox: podW.innerBox,
      modeChip, srcChip, hopChip, hcChip,
      packetLayer, wires: { n1: node1Note, n2: node2Note },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  // podWBox is listed so its .highlight is cleared every step: clearPodHighlight only resets inline
  // strokes, so without it a highlight set in a reduced-replay block leaks into later steps.
  clearHighlights(s, ['client', 'lb', 'modeChip', 'srcChip', 'hopChip', 'hcChip', 'podWBox'], [s.refs.podW]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A LoadBalancer sends external traffic to Node ports, but the backing Pods are not evenly spread: Node-1 runs one, Node-2 runs none. How the Node handles that gap is decided by the Service externalTrafficPolicy.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // Cluster is the default policy, so the mode chip is true from the start. Its consequences are
      // not: nothing has been SNAT-ed or hopped yet.
      setVal(s.refs.modeChip, 'Cluster');
      setVal(s.refs.srcChip, 'none');
      setVal(s.refs.hopChip, 'none');
      setVal(s.refs.hcChip, 'unused');
    },
  },
  {
    id: 'cluster',
    // Motion runs fan(693) + hop beat(100) + underlay(1271) = 2064, then the Pod pulse (900) ends at
    // 2964. The old 2700 floor cut that pulse off mid-flight when the step advanced.
    duration: 3300,
    narration: 'With the default policy Cluster, every Node accepts the traffic even with no local Pod. The balancer happens to pick Node-2, which has no backend, so the Node SNATs the packet and forwards it across the cluster network to the Pod on Node-1. Load spreads evenly over every backend, wherever it runs.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.modeChip, 'Cluster');
      // The SNAT and the Node-to-Node hop both happen in THIS step, so their chips take their values
      // here. The next step is the one that highlights them and talks about what they cost.
      setVal(s.refs.srcChip, 'lost (SNAT)');
      setVal(s.refs.hopChip, 'yes');
      setVal(s.refs.hcChip, 'unused');
      s.refs.lb.classList.add('highlight');
      s.refs.modeChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.podWBox.classList.add('highlight'); return; }
      // LB -> Node-2 (no backend), then SNAT and forward across the underlay to the Pod on Node-1,
      // which pulses on arrival. The ball is hidden inside Node-2 between the two legs.
      const toN2 = routePacket(s, ctx, TO_N2, { cat: 'network' });
      ridingLabel(s, ctx, 'src 198.51.100.9', TO_N2, { emerge: 140 });
      const hopDelay = toN2.arrivalMs + BEAT.afterHop;
      const hop = routePacket(s, ctx, CROSS, { delay: hopDelay, cat: 'network' });
      // Node-2 SNAT-ed it, so the second leg carries the Node as its source, not the client.
      ridingLabel(s, ctx, 'src Node-2 (SNAT)', CROSS, { delay: hopDelay, dy: 20 });
      pulsePod(s.refs.podW, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'cluster-cost',
    duration: 2300,
    narration: 'That convenience has a cost. The extra Node-to-Node hop adds latency, and because Node-2 had to SNAT, the Pod sees the packet as coming from the Node, not from 198.51.100.9. The real client IP is gone, which breaks source-IP allowlists and access logs.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.modeChip, 'Cluster');
      setVal(s.refs.srcChip, 'lost (SNAT)');
      setVal(s.refs.hopChip, 'yes');
      setVal(s.refs.hcChip, 'unused');
      s.refs.srcChip.classList.add('highlight');
      s.refs.hopChip.classList.add('highlight');
      // Reflective beat: the cost chips just light, no flash.
    },
  },
  {
    id: 'local',
    duration: 2500,
    narration: 'Switching to externalTrafficPolicy Local changes the rules. A Node only serves the request from its own local Pods, never forwarding to another Node. The balancer sends to Node-1, the packet goes straight to its Pod with no SNAT, so the Pod sees the true client IP 198.51.100.9 and there is no extra hop.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.modeChip, 'Local');
      setVal(s.refs.srcChip, 'preserved');
      setVal(s.refs.hopChip, 'no');
      setVal(s.refs.hcChip, 'unused');
      s.refs.lb.classList.add('highlight');
      s.refs.modeChip.classList.add('highlight');
      s.refs.srcChip.classList.add('highlight');
      s.refs.hopChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.podWBox.classList.add('highlight'); return; }
      // LB -> Node-1 (right-angle fan), stopping on the Node edge. No SNAT, so the ball carries the
      // client address the whole way and the local Pod pulses as it is served.
      const toN1 = routePacket(s, ctx, TO_N1, { cat: 'network' });
      ridingLabel(s, ctx, 'src 198.51.100.9', TO_N1, { emerge: 140 });
      pulsePod(s.refs.podW, ctx, toN1.arrivalMs);
    },
  },
  {
    id: 'healthcheck',
    duration: 2500,
    narration: 'But Local would silently drop traffic that lands on Node-2, which has no Pod to serve it. To avoid that, Local exposes a healthCheckNodePort that reports healthy only on Nodes with a local backend, so the load balancer stops sending to Node-2 and targets only Node-1.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // The probe answers on BOTH Nodes, healthy only where a local backend exists. Showing only the
      // failing Node would assert the rule instead of demonstrating it.
      setWire(s, 'n1', 'health: 1 local pod');
      setWire(s, 'n2', 'health: 0 local pods');
      setVal(s.refs.hcChip, 'used');
      setVal(s.refs.modeChip, 'Local');
      setVal(s.refs.srcChip, 'preserved');
      setVal(s.refs.hopChip, 'no');
      s.refs.hcChip.classList.add('highlight');
      s.refs.lb.classList.add('highlight');
      if (ctx.reduced) { s.refs.podWBox.classList.add('highlight'); return; }
      // The health check excludes Node-2, so the LB steers only to Node-1 and its local Pod pulses.
      const toN1 = routePacket(s, ctx, TO_N1, { cat: 'network' });
      ridingLabel(s, ctx, 'src 198.51.100.9', TO_N1, { emerge: 140 });
      pulsePod(s.refs.podW, ctx, toN1.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
