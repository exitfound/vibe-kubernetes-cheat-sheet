import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, pod, node, arrow, pathArrow } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt, makeRidingLabel, OPACITY } from './network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-loadbalancer-bare-metal


const MID_X = 600;

const CLIENT_W = 240, CLIENT_H = 58, CLIENT_Y = 40;
const ROUTER_W = 300, ROUTER_H = 74, ROUTER_Y = 134;
const NODE_W = 340, NODE_H = 190, NODE_Y = 310;
const POD_W = 210, POD_H = 110;
const CHIP_Y = 560, CHIP_H = 34;

const CLIENT_X = MID_X - CLIENT_W / 2;               // 480
const CLIENT_BOTTOM = CLIENT_Y + CLIENT_H;           // 98
const ROUTER_X = MID_X - ROUTER_W / 2;               // 450
const ROUTER_BOTTOM = ROUTER_Y + ROUTER_H;           // 208

const NODE_GAP = 40;
const N1_X = MID_X - NODE_W / 2 - NODE_GAP - NODE_W; // 50
const N2_X = MID_X - NODE_W / 2;                     // 430
const N3_X = MID_X + NODE_W / 2 + NODE_GAP;          // 810
const N1_CX = N1_X + NODE_W / 2;                     // 220
const N2_CX = N2_X + NODE_W / 2;                     // 600
const N3_CX = N3_X + NODE_W / 2;                     // 980
const NODE_BOTTOM = NODE_Y + NODE_H;                 // 500

// Each Pod is centred BOTH ways inside its Node, so every fan leg drops straight down the Pod axis.
const POD_Y = NODE_Y + (NODE_H - POD_H) / 2;         // 350
const POD1_X = N1_CX - POD_W / 2;                    // 115
const POD2_X = N2_CX - POD_W / 2;                    // 495
const POD3_X = N3_CX - POD_W / 2;                    // 875

const BUS_Y = (ROUTER_BOTTOM + NODE_Y) / 2;          // 259, the bus the fan splits on
const SCHEME_LEFT = N1_X;                            // 50
const SCHEME_RIGHT = N3_X + NODE_W;                  // 1150

// Each static wire and the ball that rides it share the same points array.
const C_WIRE = [[MID_X, CLIENT_BOTTOM], [MID_X, ROUTER_Y]];
const TO_N1 = [[MID_X, ROUTER_BOTTOM], [MID_X, BUS_Y], [N1_CX, BUS_Y], [N1_CX, NODE_Y]];
const TO_N2 = [[MID_X, ROUTER_BOTTOM], [MID_X, NODE_Y]];
const TO_N3 = [[MID_X, ROUTER_BOTTOM], [MID_X, BUS_Y], [N3_CX, BUS_Y], [N3_CX, NODE_Y]];
const FANS = [TO_N1, TO_N2, TO_N3];


// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'network', outMs: 170, hold: 0, emergeMode: true });

function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, role: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 30, w: w - 40, h: 48, label: 'app', sublabel: 'eth0', role: 'network' });
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
      'aria-label': 'LoadBalancer on bare metal: with no cloud-controller-manager a LoadBalancer Service stays pending, so an in-cluster implementation such as MetalLB allocates an address from an operator-declared pool and then announces it, either in layer 2 mode where a single elected Node answers ARP for the address and takes all inbound traffic, or in BGP mode where every Node advertises the address to the router, which installs an ECMP route and hashes flows across all of them',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const node1 = node({ x: N1_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });
    const node2 = node({ x: N2_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2' });
    const node3 = node({ x: N3_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-3' });
    const pod1 = podBlock({ x: POD1_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web', ip: '10.244.1.5' });
    const pod2 = podBlock({ x: POD2_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web', ip: '10.244.2.7' });
    const pod3 = podBlock({ x: POD3_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web', ip: '10.244.3.9' });

    const client = box({ x: CLIENT_X, y: CLIENT_Y, w: CLIENT_W, h: CLIENT_H, label: 'Clients', sublabel: 'internet', role: 'network' });
    const router = box({ x: ROUTER_X, y: ROUTER_Y, w: ROUTER_W, h: ROUTER_H, label: 'Upstream router', sublabel: 'route to 203.0.113.9', role: 'network' });

    const cWire = arrow({ x1: C_WIRE[0][0], y1: C_WIRE[0][1], x2: C_WIRE[1][0], y2: C_WIRE[1][1], dashed: true, dim: true, role: 'network' });
    const fan1 = pathArrow({ points: TO_N1, dashed: true, dim: true, role: 'network' });
    const fan2 = pathArrow({ points: TO_N2, dashed: true, dim: true, role: 'network' });
    const fan3 = pathArrow({ points: TO_N3, dashed: true, dim: true, role: 'network' });

    // What each Node announces for the address. All three sit on the same baseline so they read as a
    // row, low enough to clear the Pod above (its bottom edge is 460) and to stay inside the Node.
    const n1Note = text({ class: 'scheme-label code dim', x: N1_CX, y: 482, 'text-anchor': 'middle' }, [' ']);
    const n2Note = text({ class: 'scheme-label code dim', x: N2_CX, y: 482, 'text-anchor': 'middle' }, [' ']);
    const n3Note = text({ class: 'scheme-label code dim', x: N3_CX, y: 482, 'text-anchor': 'middle' }, [' ']);

    const statusChip = valChip({ x: SCHEME_LEFT, y: CHIP_Y, w: 300, h: CHIP_H, name: 'status.loadBalancer', value: 'pending', role: 'network' });
    const poolChip   = valChip({ x: 370, y: CHIP_Y, w: 260, h: CHIP_H, name: 'address pool', value: 'none', role: 'network' });
    const modeChip   = valChip({ x: 650, y: CHIP_Y, w: 250, h: CHIP_H, name: 'announce mode', value: 'none', role: 'network' });
    const pathChip   = valChip({ x: 920, y: CHIP_Y, w: SCHEME_RIGHT - 920, h: CHIP_H, name: 'ingress path', value: 'none', role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: Nodes and their Pods, then the client and router above them, then wires + notes, then
    // chips, then the packet layer with its riding tags on top.
    [node1, node2, node3].forEach(n => root.appendChild(n));
    [pod1, pod2, pod3].forEach(p => root.appendChild(p.group));
    root.appendChild(client);
    root.appendChild(router);
    [cWire, fan1, fan2, fan3, n1Note, n2Note, n3Note].forEach(el => root.appendChild(el));
    [statusChip, poolChip, modeChip, pathChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, client, router, node1, node2, node3,
      pod1: pod1.group, pod1Box: pod1.innerBox,
      pod2: pod2.group, pod2Box: pod2.innerBox,
      pod3: pod3.group, pod3Box: pod3.innerBox,
      statusChip, poolChip, modeChip, pathChip,
      fan1, fan2, fan3,
      packetLayer, wires: { n1: n1Note, n2: n2Note, n3: n3Note },
    };
  }

  reset() { this.build(); }
}

// A Node, the Pod inside it and the fan lane that reaches it are one thing as far as presence goes,
// so one helper pins all three. Pinning them separately is how a fan arrow at full strength came to
// point into a Node dimmed out of the path.
const NODE_TRIPLES = [['node1', 'pod1', 'fan1'], ['node2', 'pod2', 'fan2'], ['node3', 'pod3', 'fan3']];

function setNodes(s, opacities) {
  NODE_TRIPLES.forEach(([n, p, w], i) => {
    const v = String(opacities[i]);
    s.refs[n].style.opacity = v;
    s.refs[p].style.opacity = v;
    s.refs[w].style.opacity = v;
  });
}

function clearHL(s) {
  clearHighlights(s, ['client', 'router', 'statusChip', 'poolChip', 'modeChip', 'pathChip', 'pod1Box', 'pod2Box', 'pod3Box'], [s.refs.pod1, s.refs.pod2, s.refs.pod3]);
  setNodes(s, [1, 1, 1]);
}

const pods = (s) => [s.refs.pod1, s.refs.pod2, s.refs.pod3];

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.statusChip, 'pending');
      setVal(s.refs.poolChip, 'none');
      setVal(s.refs.modeChip, 'none');
      setVal(s.refs.pathChip, 'none');
    },
  },
  {
    id: 'pool',
    duration: 2400,
    narration: 'On bare metal there is no cloud-controller-manager, so nothing answers a Service of type LoadBalancer and it sits pending. That gap is filled in-cluster instead, by an implementation such as MetalLB. The cluster operator declares an address pool, and an address out of it is written into status.loadBalancer.ingress, so the Service finally has 203.0.113.9. An allocated address is not a reachable one: something still has to tell the network where to send it.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.statusChip, '203.0.113.9');
      setVal(s.refs.poolChip, '203.0.113.0/24');
      setVal(s.refs.modeChip, 'none');
      setVal(s.refs.pathChip, 'none');
      s.refs.statusChip.classList.add('highlight');
      s.refs.poolChip.classList.add('highlight');
    },
  },
  {
    id: 'l2',
    // Motion runs entry(700) + hop beat(100) + fan(1071) = 1871, then the Pod pulse (900) lands at 2771.
    // The floor leaves a settle rather than snapping straight on to the next step.
    duration: 3300,
    narration: 'In layer 2 mode one Node is elected to own the address and answers ARP for it, so as far as the router is concerned 203.0.113.9 simply lives on Node-1. Every packet for the address goes there, and kube-proxy spreads them onward from that Node. No router configuration at all, which is why this is the usual place to start.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.statusChip, '203.0.113.9');
      setVal(s.refs.poolChip, '203.0.113.0/24');
      setVal(s.refs.modeChip, 'L2 (ARP)');
      setVal(s.refs.pathChip, 'one Node');
      setWire(s, 'n1', 'ARP: 203.0.113.9 is mine');
      s.refs.client.classList.add('highlight');
      s.refs.modeChip.classList.add('highlight');
      s.refs.pathChip.classList.add('highlight');
      // Only Node-1 announces, so the other two take no traffic at all in this mode, and neither do
      // the fan lanes that reach them.
      setNodes(s, [1, OPACITY.notready, OPACITY.notready]);
      if (ctx.reduced) { s.refs.router.classList.add('highlight'); s.refs.pod1Box.classList.add('highlight'); return; }
      // Down-arrow all the way: the request reaches the router, which lights on arrival, then rides the
      // fan to the one Node that claimed the address, and the Pod inside it pulses as it is served.
      const inb = segmentPacket(s, ctx, { from: C_WIRE[0], to: C_WIRE[1], role: 'network' });
      lightBoxAt(s.refs.router, ctx, inb.arrivalMs);
      const fanDelay = inb.arrivalMs + BEAT.afterHop;
      const toN1 = routePacket(s, ctx, TO_N1, { delay: fanDelay, role: 'network' });
      ridingLabel(s, ctx, 'dst 203.0.113.9', TO_N1, { delay: fanDelay, emerge: 150 });
      pulsePod(s.refs.pod1, ctx, toN1.arrivalMs);
    },
  },
  {
    id: 'failover',
    // Motion runs entry(700) + hop beat(100) + fan(700) = 1500, then the Pod pulse (900) lands at 2400.
    duration: 2900,
    narration: 'That single owner is also the ceiling. All inbound traffic funnels through Node-1, so the ingress bandwidth of the whole Service is the bandwidth of one Node, and that Node is a single point of failure. When it goes away another Node claims the address and sends a gratuitous ARP so the router updates its table. The address comes back within seconds, but every connection that was riding the old Node is gone.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.statusChip, '203.0.113.9');
      setVal(s.refs.poolChip, '203.0.113.0/24');
      setVal(s.refs.modeChip, 'L2 (ARP)');
      setVal(s.refs.pathChip, 'one Node');
      setWire(s, 'n2', 'gratuitous ARP: mine now');
      s.refs.modeChip.classList.add('highlight');
      s.refs.pathChip.classList.add('highlight');
      // Node-1 is the one that failed, and Node-3 still announces nothing: only the new owner is live.
      setNodes(s, [OPACITY.notready, 1, OPACITY.notready]);
      if (ctx.reduced) { s.refs.router.classList.add('highlight'); s.refs.pod2Box.classList.add('highlight'); return; }
      // Same down-arrow as before, but the fan now lands on the Node that took the address over, and its
      // local Pod pulses as it serves the request.
      const inb = segmentPacket(s, ctx, { from: C_WIRE[0], to: C_WIRE[1], role: 'network' });
      lightBoxAt(s.refs.router, ctx, inb.arrivalMs);
      const fanDelay = inb.arrivalMs + BEAT.afterHop;
      const toN2 = routePacket(s, ctx, TO_N2, { delay: fanDelay, role: 'network' });
      ridingLabel(s, ctx, 'dst 203.0.113.9', TO_N2, { delay: fanDelay, emerge: 150 });
      pulsePod(s.refs.pod2, ctx, toN2.arrivalMs);
    },
  },
  {
    id: 'bgp',
    // Three flows staggered 180ms apart. The last one leaves at 360, reaches the router at 1060, and its
    // fan lands at 2231, so its Pod pulse ends at 3131. The floor leaves a settle after that.
    duration: 3700,
    narration: 'BGP mode changes the shape. Every Node peers with the router and advertises the same address, so the router installs an equal-cost route and hashes each new flow across all of them. Ingress is no longer one Node wide, and router hashes are rarely stable, so losing a Node breaks most active connections and not only the ones it was carrying. The price is a router that speaks BGP with the cluster, and a change in the Node set can rehash live flows onto a different Node.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.statusChip, '203.0.113.9');
      setVal(s.refs.poolChip, '203.0.113.0/24');
      setVal(s.refs.modeChip, 'BGP (ECMP)');
      setVal(s.refs.pathChip, 'every Node');
      setWire(s, 'n1', 'BGP: advertise /32');
      setWire(s, 'n2', 'BGP: advertise /32');
      setWire(s, 'n3', 'BGP: advertise /32');
      s.refs.client.classList.add('highlight');
      s.refs.modeChip.classList.add('highlight');
      s.refs.pathChip.classList.add('highlight');
      if (ctx.reduced) {
        s.refs.router.classList.add('highlight');
        ['pod1Box', 'pod2Box', 'pod3Box'].forEach(k => s.refs[k].classList.add('highlight'));
        return;
      }
      FANS.forEach((fan, i) => {
        const start = i * 180;
        const inb = segmentPacket(s, ctx, { from: C_WIRE[0], to: C_WIRE[1], delay: start, role: 'network' });
        if (i === 0) lightBoxAt(s.refs.router, ctx, inb.arrivalMs);
        const out = routePacket(s, ctx, fan, { delay: inb.arrivalMs + BEAT.afterHop, role: 'network' });
        pulsePod(pods(s)[i], ctx, out.arrivalMs);
      });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
