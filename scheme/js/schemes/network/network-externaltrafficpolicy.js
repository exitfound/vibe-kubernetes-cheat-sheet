import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, pod, node, arrow, pathArrow } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt, makeRidingLabel } from '../../lib/network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-externaltrafficpolicy


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
const CROSS = [[N2_CX, NODE_BOTTOM], [N2_CX, UNDER_Y], [N1_CX, UNDER_Y], [N1_CX, NODE_BOTTOM]]; // Node-2 -> underlay -> Node-1

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'network', outMs: 170, hold: 0, emergeMode: true });

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
      'aria-label': 'ExternalTrafficPolicy Cluster versus Local: Cluster forwards to a backend on any Node but SNATs away the client IP, while Local keeps the client IP and avoids the extra hop at the cost of dropping traffic on Nodes with no local backend',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = box({ x: CLIENT_X, y: CLIENT_Y, w: CLIENT_W, h: CLIENT_H, label: 'External client', sublabel: 'src 198.51.100.9', role: 'network' });
    const lb     = box({ x: LB_X, y: LB_Y, w: LB_W, h: LB_H, label: 'LoadBalancer', sublabel: 'targets node ports', role: 'network' });

    const cWire = arrow({ x1: C_WIRE[0][0], y1: C_WIRE[0][1], x2: C_WIRE[1][0], y2: C_WIRE[1][1], dashed: true, dim: true, role: 'network' });
    const fan1 = pathArrow({ points: TO_N1, dashed: true, dim: true, role: 'network' });
    const fan2 = pathArrow({ points: TO_N2, dashed: true, dim: true, role: 'network' });
    const crossWire = pathArrow({ points: CROSS, dashed: true, dim: true, role: 'network' });
    // No inline src-IP text on the client wire: the address RIDES the ball (ridingLabel), so each leg is
    // tagged with the source it actually carries. The client box sublabel still states the origin address.

    const node1 = node({ x: N1_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1   ·   has local backend' });
    const node2 = node({ x: N2_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2   ·   no local backend' });
    const podW = podBlock({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web', ip: '10.244.1.5' });
    // What the healthCheckNodePort reports on each Node. Both sit on the same baseline so they read as a
    // pair, low enough to clear the Pod above (sublabel baseline 423) and the crossWire arrowhead below.
    const node1Note = text({ class: 'scheme-label code dim', x: N1_CX, y: 448, 'text-anchor': 'middle' }, [' ']);
    const node2Note = text({ class: 'scheme-label code dim', x: N2_CX, y: 448, 'text-anchor': 'middle' }, [' ']);

    // The four chips span the scheme 1:1, from the Node-1 left edge to the Node-2 right edge, with even
    // 20px gaps. Widths are tuned to their content (externalTrafficPolicy carries the longest name).
    const modeChip = valChip({ x: SCHEME_LEFT, y: CHIP_Y, w: 240, h: CHIP_H, name: 'externalTrafficPolicy', value: 'Cluster', role: 'network' });
    // src IP and extra hop are OUTCOMES of a request, so they read none until traffic actually flows.
    // Widths are still sized for their widest value (lost (SNAT) / yes), not for none.
    const srcChip  = valChip({ x: 440, y: CHIP_Y, w: 225, h: CHIP_H, name: 'client src IP', value: 'none', role: 'network' });
    const hopChip  = valChip({ x: 685, y: CHIP_Y, w: 135, h: CHIP_H, name: 'extra hop', value: 'none', role: 'network' });
    const hcChip   = valChip({ x: 840, y: CHIP_Y, w: SCHEME_RIGHT - 840, h: CHIP_H, name: 'healthCheck', value: 'unused', role: 'network' });

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
    // Motion runs the client entry leg, then fan(693) + hop beat(100) + underlay(1271), then the Pod
    // pulse (900), ending at 3771. It was 2964 before the entry leg was drawn (review stage 2.4
    // family B): every step here opens with a client hitting the external address, and that first leg
    // was drawn and never rode.
    duration: 4200,
    narration: 'With the default policy Cluster, every Node accepts the traffic even with no local Pod. The balancer happens to pick Node-2, which has no backend, so the Node SNATs the packet and forwards it across the cluster network to the Pod on Node-1. Load spreads evenly over every backend, wherever it runs.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.modeChip, 'Cluster');
      // The SNAT and the Node-to-Node hop both happen in THIS step, so their chips take their values
      // here. The next step is the one that highlights them and talks about what they cost.
      setVal(s.refs.srcChip, 'lost (SNAT)');
      s.refs.srcChip.classList.add('highlight');
      setVal(s.refs.hopChip, 'yes');
      s.refs.hopChip.classList.add('highlight');
      setVal(s.refs.hcChip, 'unused');
      // The LB RECEIVES the client request now, so it lights on arrival rather than at step entry.
      s.refs.modeChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.lb.classList.add('highlight'); s.refs.podWBox.classList.add('highlight'); return; }
      // LB -> Node-2 (no backend), then SNAT and forward across the underlay to the Pod on Node-1,
      // which pulses on arrival. The ball is hidden inside Node-2 between the two legs.
      // The client request reaches the load balancer first, on the leg the card draws and never
      // rode: every one of these steps opens with a client hitting the external address.
      const entry = segmentPacket(s, ctx, { from: C_WIRE[0], to: C_WIRE[1], role: 'network' });
      lightBoxAt(s.refs.lb, ctx, entry.arrivalMs);
      const toN2 = routePacket(s, ctx, TO_N2, { delay: entry.arrivalMs + BEAT.afterHop, role: 'network' });
      ridingLabel(s, ctx, 'src 198.51.100.9', TO_N2, { emerge: 140 });
      const hopDelay = toN2.arrivalMs + BEAT.afterHop;
      const hop = routePacket(s, ctx, CROSS, { delay: hopDelay, role: 'network' });
      // Node-2 SNAT-ed it, so the second leg carries the Node as its source, not the client.
      ridingLabel(s, ctx, 'src Node-2 (SNAT)', CROSS, { delay: hopDelay, dy: 20 });
      pulsePod(s.refs.podW, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'cluster-cost',
    // Reflective step: no packet at all, so the entry-leg change above does not reach it.
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
    // Motion: the client entry leg now precedes the fan, adding about 470ms.
    duration: 3100,
    narration: 'Switching to externalTrafficPolicy Local changes the rules. A Node only serves the request from its own local Pods, never forwarding to another Node. The balancer sends to Node-1, the packet goes straight to its Pod with no SNAT, so the Pod sees the true client IP 198.51.100.9 and there is no extra hop.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.modeChip, 'Local');
      setVal(s.refs.srcChip, 'preserved');
      setVal(s.refs.hopChip, 'no');
      setVal(s.refs.hcChip, 'unused');
      // The LB RECEIVES the client request now, so it lights on arrival rather than at step entry.
      s.refs.modeChip.classList.add('highlight');
      s.refs.srcChip.classList.add('highlight');
      s.refs.hopChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.lb.classList.add('highlight'); s.refs.podWBox.classList.add('highlight'); return; }
      // LB -> Node-1 (right-angle fan), stopping on the Node edge. No SNAT, so the ball carries the
      // client address the whole way and the local Pod pulses as it is served.
      // The client request reaches the load balancer first, on the leg the card draws and never
      // rode: every one of these steps opens with a client hitting the external address.
      const entry = segmentPacket(s, ctx, { from: C_WIRE[0], to: C_WIRE[1], role: 'network' });
      lightBoxAt(s.refs.lb, ctx, entry.arrivalMs);
      const toN1 = routePacket(s, ctx, TO_N1, { delay: entry.arrivalMs + BEAT.afterHop, role: 'network' });
      ridingLabel(s, ctx, 'src 198.51.100.9', TO_N1, { emerge: 140 });
      pulsePod(s.refs.podW, ctx, toN1.arrivalMs);
    },
  },
  {
    id: 'healthcheck',
    // Motion: the client entry leg now precedes the fan, adding about 470ms.
    duration: 3100,
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
      // The LB RECEIVES the client request now, so it lights on arrival rather than at step entry.
      if (ctx.reduced) { s.refs.lb.classList.add('highlight'); s.refs.podWBox.classList.add('highlight'); return; }
      // The health check excludes Node-2, so the LB steers only to Node-1 and its local Pod pulses.
      // The client request reaches the load balancer first, on the leg the card draws and never
      // rode: every one of these steps opens with a client hitting the external address.
      const entry = segmentPacket(s, ctx, { from: C_WIRE[0], to: C_WIRE[1], role: 'network' });
      lightBoxAt(s.refs.lb, ctx, entry.arrivalMs);
      const toN1 = routePacket(s, ctx, TO_N1, { delay: entry.arrivalMs + BEAT.afterHop, role: 'network' });
      ridingLabel(s, ctx, 'src 198.51.100.9', TO_N1, { emerge: 140 });
      pulsePod(s.refs.podW, ctx, toN1.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
