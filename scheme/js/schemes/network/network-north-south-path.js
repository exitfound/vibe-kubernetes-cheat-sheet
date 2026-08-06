import { g, text } from '../../lib/svg.js';
import { arrowDefs, box, node, arrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, relationPath, BEAT, lightBoxAt, makeRidingLabel, wrapPod, diagramRoot } from './network-kit.js';
// Design notes for this card: ./CARDS.md#network-north-south-path


const FLOW_Y = 356;                 // spine: client, cloud LB, kube-proxy and the Pod are centred on it
const LANE_DY = 20;                 // half-gap between the forward and return lanes
const FWD_Y = FLOW_Y - LANE_DY;     // 336: request lane, above the spine
const RET_Y = FLOW_Y + LANE_DY;     // 376: reply lane, below the spine

const CLIENT_X = 40, CLIENT_W = 170, CLIENT_H = 74;
const CLIENT_RIGHT = CLIENT_X + CLIENT_W;      // 210
const LB_X = 290, LB_W = 180, LB_H = 74;
const LB_RIGHT = LB_X + LB_W;                  // 470

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
const CT_CX = CT_X + CT_W / 2;                 // 860: where the ownership marker meets the table
// Ownership marker: kube-proxy bottom-centre, a step across the gap between the rows, then down onto
// the conntrack table's own top-edge centre. Both ends sit on a face midpoint.
const CT_LINK = [[KP_CX, KP_BOTTOM], [KP_CX, (KP_BOTTOM + CT_Y) / 2], [CT_CX, (KP_BOTTOM + CT_Y) / 2], [CT_CX, CT_Y]];

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

// The tag that rides a ball here. Every ball on this card is a linear segmentPacket, so the tag
// rides LINEAR too: the eased default drifts up to 11 units ahead of its ball mid-flight.
const ridingLabel = makeRidingLabel({ role: 'network', easing: 'linear' });

function podBlock({ x, y, w, h, label }) {
  const shell = podShell({ x, y, w, h, label, containers: 0, role: 'network' });
  const innerBox = box({ x: x + 20, y: y + 34, w: w - 40, h: 52, label: 'app', sublabel: 'eth0', role: 'network' });
  return wrapPod(shell, innerBox);
}

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = diagramRoot({ 'aria-label': 'North-south request path: an external client reaches a cloud load balancer at its public IP, the load balancer crosses the cluster boundary and forwards to a Node on the Service NodePort, kube-proxy rules DNAT the packet to a backing Pod IP while conntrack pins the flow, the Pod serves the request, and the reply travels a separate return lane where conntrack unwinds every rewrite so the client sees an answer from the public IP it dialed' });
    root.appendChild(arrowDefs());

    const extRegion = node({ x: EXT_X, y: REGION_TOP, w: EXT_W, h: REGION_H, label: '' });
    const extLabel = text({ class: 'scheme-node-label', x: EXT_RIGHT - 12, y: REGION_TOP + 18, 'text-anchor': 'end' }, ['internet   ·   outside cluster']);
    const theNode = node({ x: NODE_X, y: REGION_TOP, w: NODE_W, h: REGION_H, label: 'Node   ·   192.168.1.20' });
    const client = box({ x: CLIENT_X, y: FLOW_Y - CLIENT_H / 2, w: CLIENT_W, h: CLIENT_H, label: 'Client', sublabel: 'internet', role: 'network' });
    const lb = box({ x: LB_X, y: FLOW_Y - LB_H / 2, w: LB_W, h: LB_H, label: 'Cloud LB', sublabel: '203.0.113.9:443', role: 'network' });
    const kproxy = box({ x: KP_X, y: FLOW_Y - KP_H / 2, w: KP_W, h: KP_H, label: 'kube-proxy rules', sublabel: 'NodePort 31000', role: 'network' });
    const conntrack = box({ x: CT_X, y: CT_Y, w: CT_W, h: CT_H, label: 'Conntrack', sublabel: 'no flow yet', role: 'network' });
    const podX = podBlock({ x: POD_X, y: FLOW_Y - POD_H / 2, w: POD_W, h: POD_H, label: 'Pod web' });

    const cFwd = arrow({ x1: C2LB[0][0], y1: C2LB[0][1], x2: C2LB[1][0], y2: C2LB[1][1], dashed: true, dim: true, role: 'network' });
    const lFwd = arrow({ x1: LB2KP[0][0], y1: LB2KP[0][1], x2: LB2KP[1][0], y2: LB2KP[1][1], dashed: true, dim: true, role: 'network' });
    const kFwd = arrow({ x1: KP2POD[0][0], y1: KP2POD[0][1], x2: KP2POD[1][0], y2: KP2POD[1][1], dashed: true, dim: true, role: 'network' });
    const kRet = arrow({ x1: POD2KP[0][0], y1: POD2KP[0][1], x2: POD2KP[1][0], y2: POD2KP[1][1], dashed: true, dim: true, role: 'network' });
    const lRet = arrow({ x1: KP2LB[0][0], y1: KP2LB[0][1], x2: KP2LB[1][0], y2: KP2LB[1][1], dashed: true, dim: true, role: 'network' });
    const cRet = arrow({ x1: LB2C[0][0], y1: LB2C[0][1], x2: LB2C[1][0], y2: LB2C[1][1], dashed: true, dim: true, role: 'network' });

    // Ownership marker, NOT a traffic path: the rules and the flow table are two halves of one
    // dataplane. No packet ever travels it, so it is a plain dashed line with no arrowhead.
    const ctLink = relationPath({ points: CT_LINK, role: 'network', dash: '5 5' });

    // Four equal cells, equal gaps, spanning the full framed width.
    const stageChip = valChip({ x: chipX(0), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'stage', value: 'idle', role: 'network' });
    const svcChip   = valChip({ x: chipX(1), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'Service', value: 'type: LoadBalancer', role: 'network' });
    const dnatChip  = valChip({ x: chipX(2), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'DNAT', value: 'none', role: 'network' });
    const backChip  = valChip({ x: chipX(3), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'backend', value: 'none', role: 'network' });

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

function setChips(s, { stage, dnat, back }) {
  setVal(s.refs.stageChip, stage);
  setVal(s.refs.dnatChip, dnat);
  setVal(s.refs.backChip, back);
}

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  clearHighlights(s, ['client', 'lb', 'kproxy', 'conntrack', 'podXBox', 'stageChip', 'svcChip', 'dnatChip', 'backChip'], [s.refs.podX]);
  clearWires(s);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      resetStep(s);
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
      resetStep(s);
      setChips(s, { stage: 'cloud LB', dnat: 'none', back: 'none' });
      setBoxSublabel(s.refs.conntrack, 'no flow yet');
      s.refs.client.classList.add('highlight');
      s.refs.stageChip.classList.add('highlight');
      s.refs.svcChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.lb.classList.add('highlight'); return; }
      // The packet carries the public IP as its destination, and the tag rides with it.
      const hop = segmentPacket(s, ctx, { from: C2LB[0], to: C2LB[1], role: 'network' });
      ridingLabel(s, ctx, 'dst 203.0.113.9:443', C2LB);
      lightBoxAt(s.refs.lb, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'nodeport',
    duration: 2400,
    narration: 'The load balancer rewrites the destination to a Node and the Service NodePort, a high port opened on every Node, and the packet crosses the cluster edge. The kube-proxy programmed the rules that catch that port, so the packet is matched on arrival with the destination still the Node IP and that port.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { stage: 'NodePort', dnat: 'none', back: 'none' });
      setBoxSublabel(s.refs.conntrack, 'no flow yet');
      s.refs.lb.classList.add('highlight');
      s.refs.stageChip.classList.add('highlight');
      s.refs.svcChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.kproxy.classList.add('highlight'); return; }
      // The only hop that crosses the region gap on the way in: the destination is now a Node, not the LB.
      const hop = segmentPacket(s, ctx, { from: LB2KP[0], to: LB2KP[1], role: 'network' });
      ridingLabel(s, ctx, 'dst 192.168.1.20:31000', LB2KP);
      lightBoxAt(s.refs.kproxy, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'dnat',
    duration: 2800,
    narration: 'The Service rules DNAT the destination to a backing Pod IP, and conntrack records the flow so every later packet of this connection takes the same backend and the reply can be unwound. The rewritten packet is delivered to the Pod, which serves the request on its real port.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { stage: 'DNAT', dnat: '-> 10.244.2.7:8080', back: '10.244.2.7:8080' });
      setBoxSublabel(s.refs.conntrack, '192.168.1.20:31000 -> 10.244.2.7:8080  pinned');
      s.refs.kproxy.classList.add('highlight');
      s.refs.conntrack.classList.add('highlight');
      s.refs.stageChip.classList.add('highlight');
      s.refs.svcChip.classList.add('highlight');
      s.refs.dnatChip.classList.add('highlight');
      s.refs.backChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.podXBox.classList.add('highlight'); return; }
      // The rewrite happens INSIDE kube-proxy, so the ball re-emerges at its right edge already
      // carrying the Pod address. Down-arrow: packet first, the Pod pulses on arrival.
      const give = segmentPacket(s, ctx, { from: KP2POD[0], to: KP2POD[1], role: 'network' });
      ridingLabel(s, ctx, 'dst 10.244.2.7:8080', KP2POD);
      pulsePod(s.refs.podX, ctx, give.arrivalMs);
    },
  },
  {
    id: 'reply',
    // Pod pulse (900) at 0, then three 700ms hops chained on BEAT: the last lands at 3100 and its
    // ripple + tag fade run to ~3660, so the step holds a touch longer than that before auto-advancing.
    duration: 3700,
    narration: 'The Pod replies, and the answer retraces the same chain in reverse, drawn here as its own lane. The conntrack table matches the reply to the flow it pinned and undoes the DNAT, so the source becomes the Node and its NodePort again, then the load balancer rewrites it once more and the client sees an answer from the public IP it dialed. The client never learns the Pod address, and every rewrite the request crossed is unwound on the way out.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { stage: 'reply unwinds', dnat: 'reverse NAT', back: '10.244.2.7:8080' });
      setBoxSublabel(s.refs.conntrack, '192.168.1.20:31000 -> 10.244.2.7:8080  pinned');
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
      const h1 = segmentPacket(s, ctx, { from: POD2KP[0], to: POD2KP[1], delay: BEAT.afterPulse, role: 'network' });
      ridingLabel(s, ctx, 'src 10.244.2.7:8080', POD2KP, { delay: BEAT.afterPulse, dy: 24 });
      lightBoxAt(s.refs.kproxy, ctx, h1.arrivalMs);
      const h2 = segmentPacket(s, ctx, { from: KP2LB[0], to: KP2LB[1], delay: h1.arrivalMs + BEAT.afterHop, role: 'network' });
      ridingLabel(s, ctx, 'src 192.168.1.20:31000', KP2LB, { delay: h1.arrivalMs + BEAT.afterHop, dy: 24 });
      lightBoxAt(s.refs.lb, ctx, h2.arrivalMs);
      const h3 = segmentPacket(s, ctx, { from: LB2C[0], to: LB2C[1], delay: h2.arrivalMs + BEAT.afterHop, role: 'network' });
      ridingLabel(s, ctx, 'src 203.0.113.9:443', LB2C, { delay: h2.arrivalMs + BEAT.afterHop, dy: 24 });
      lightBoxAt(s.refs.client, ctx, h3.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
