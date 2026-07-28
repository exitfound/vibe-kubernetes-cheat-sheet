import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, pulsePod, segmentPacket, routePacket, makeInit, clearHighlights, clearWires, setWire, relationPath, BEAT, lightBoxAt, makeRidingLabel, OPACITY } from '../lib/network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-netfilter-path


const NODE_X = 40, NODE_Y = 305, NODE_W = 1120, NODE_H = 251;
// The Node frame is the widest element, so it is what the chip strip spans, edge to edge.
const SCHEME_LEFT = NODE_X;                    // 40
const SCHEME_RIGHT = NODE_X + NODE_W;          // 1160

const ROW_Y = 380, ROW_H = 70;
const ROW_CY = ROW_Y + ROW_H / 2;              // 415
const ROW_BOTTOM = ROW_Y + ROW_H;              // 450

const PRE_X = 70, PRE_W = 210;
const PRE_RIGHT = PRE_X + PRE_W;               // 280
const PRE_CX = PRE_X + PRE_W / 2;              // 175
const RT_X = 320, RT_W = 180;
const RT_RIGHT = RT_X + RT_W;                  // 500
const FW_X = 540, FW_W = 160;
const FW_RIGHT = FW_X + FW_W;                  // 700
const PO_X = 740, PO_W = 210;
const PO_RIGHT = PO_X + PO_W;                  // 950
const ETH_X = 990, ETH_W = 150;
const ETH_RIGHT = ETH_X + ETH_W;               // 1140
const ETH_CX = ETH_X + ETH_W / 2;              // 1065

const CT_X = PRE_X, CT_Y = 480, CT_W = PO_RIGHT - PRE_X, CT_H = 56;   // under the four hooks, 70..950
const CT_CX = CT_X + CT_W / 2;                 // 510: where the ownership marker meets the table
// Ownership marker: PREROUTING bottom-centre, a short step in the gap between the rows, then down
// onto the conntrack table's own top-edge centre. Both ends sit on a face midpoint.
const CT_LINK = [[PRE_CX, ROW_BOTTOM], [PRE_CX, (ROW_BOTTOM + CT_Y) / 2], [CT_CX, (ROW_BOTTOM + CT_Y) / 2], [CT_CX, CT_Y]];

const POD_X = 450, POD_Y = 60, POD_W = 210, POD_H = 110;
const POD_CX = POD_X + POD_W / 2;              // 555
const POD_BOTTOM = POD_Y + POD_H;              // 170

const IN_LANE_Y = 336;                         // the lane the client packet turns left on, inside the Node
const RETURN_LANE_Y = 360;                     // the reply lane, its own, so it never rides a forward wire
// Chip strip: four cells with even gaps spanning the Node frame 1:1, each sized for its own values.
const CHIP_Y = 576, CHIP_H = 34, CHIP_GAP = 20;
const CHIP_W = [270, 320, 260, 210];
const CHIP_X = CHIP_W.reduce((acc, w, i) => (i ? [...acc, acc[i - 1] + CHIP_W[i - 1] + CHIP_GAP] : [SCHEME_LEFT]), []);


// Each static wire and the ball that rides it share the same points array. The forward chain is four
// short hops, one per hook boundary, so the ball visibly stops at every hook instead of gliding past it.
const ENTRY = [[POD_CX, POD_BOTTOM], [POD_CX, IN_LANE_Y], [140, IN_LANE_Y], [140, ROW_Y]];
const PRE_TO_RT = [[PRE_RIGHT, ROW_CY], [RT_X, ROW_CY]];
const RT_TO_FW = [[RT_RIGHT, ROW_CY], [FW_X, ROW_CY]];
const FW_TO_PO = [[FW_RIGHT, ROW_CY], [PO_X, ROW_CY]];
const PO_TO_ETH = [[PO_RIGHT, ROW_CY], [ETH_X, ROW_CY]];
// The reply comes back off the wire and re-enters at PREROUTING, landing on its top edge well right of
// where the request landed, so the two never share a point.
const RETURN = [[ETH_CX, ROW_Y], [ETH_CX, RETURN_LANE_Y], [210, RETURN_LANE_Y], [210, ROW_Y]];

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
      'aria-label': 'The netfilter path a packet takes: a packet leaving a Pod enters the Node kernel at the PREROUTING hook, where conntrack records the new flow and the nat table DNATs the Service address to a backend Pod. Only then does the routing decision run, on the rewritten address, which is why DNAT must happen before it. The packet is not local, so it crosses FORWARD, where an iptables NetworkPolicy is enforced, and reaches POSTROUTING, the last hook before the wire, which is where MASQUERADE lives because only there is the outgoing interface known. The reply matches the conntrack entry at PREROUTING and every rewrite is undone with no rule walk, while an eBPF dataplane skips the whole chain by hooking the socket instead.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const theNode = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node kernel' });

    const podC = podBlock({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Client Pod', ip: '10.244.1.5' });

    const pre  = box({ x: PRE_X, y: ROW_Y, w: PRE_W, h: ROW_H, label: 'PREROUTING', sublabel: 'conntrack + nat', role: 'network' });
    const rt   = box({ x: RT_X,  y: ROW_Y, w: RT_W,  h: ROW_H, label: 'Routing decision', sublabel: 'local or forward', role: 'network' });
    const fw   = box({ x: FW_X,  y: ROW_Y, w: FW_W,  h: ROW_H, label: 'FORWARD', sublabel: 'filter', role: 'network' });
    const po   = box({ x: PO_X,  y: ROW_Y, w: PO_W,  h: ROW_H, label: 'POSTROUTING', sublabel: 'nat · MASQUERADE', role: 'network' });
    const eth  = box({ x: ETH_X, y: ROW_Y, w: ETH_W, h: ROW_H, label: 'eth0', sublabel: 'the wire', role: 'network' });
    const ct   = box({ x: CT_X, y: CT_Y, w: CT_W, h: CT_H, label: 'Conntrack table', sublabel: 'no flow yet', role: 'network' });

    const entryWire = pathArrow({ points: ENTRY, dashed: true, dim: true, role: 'network' });
    const h1 = arrow({ x1: PRE_TO_RT[0][0], y1: PRE_TO_RT[0][1], x2: PRE_TO_RT[1][0], y2: PRE_TO_RT[1][1], dashed: true, dim: true, role: 'network' });
    const h2 = arrow({ x1: RT_TO_FW[0][0], y1: RT_TO_FW[0][1], x2: RT_TO_FW[1][0], y2: RT_TO_FW[1][1], dashed: true, dim: true, role: 'network' });
    const h3 = arrow({ x1: FW_TO_PO[0][0], y1: FW_TO_PO[0][1], x2: FW_TO_PO[1][0], y2: FW_TO_PO[1][1], dashed: true, dim: true, role: 'network' });
    const h4 = arrow({ x1: PO_TO_ETH[0][0], y1: PO_TO_ETH[0][1], x2: PO_TO_ETH[1][0], y2: PO_TO_ETH[1][1], dashed: true, dim: true, role: 'network' });
    const returnWire = pathArrow({ points: RETURN, dashed: true, dim: true, role: 'network' });

    // Ownership marker, NOT a traffic path: PREROUTING is where the flow is looked up and recorded. No
    // packet ever travels it, so it is a plain dashed line with NO arrowhead.
    const ctLink = relationPath({ points: CT_LINK, role: 'network', dash: '5 5' });

    // One wire label, under the NIC: where this packet is actually headed once it is on the wire. Blank at
    // build, filled per step.
    const exitLabel = text({ class: 'scheme-label code dim', x: ETH_CX, y: ROW_BOTTOM + 20, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    const hookChip = valChip({ x: CHIP_X[0], y: CHIP_Y, w: CHIP_W[0], h: CHIP_H, name: 'hook', value: 'none', role: 'network' });
    const dstChip  = valChip({ x: CHIP_X[1], y: CHIP_Y, w: CHIP_W[1], h: CHIP_H, name: 'dst', value: '10.96.0.20:80', role: 'network' });
    const srcChip  = valChip({ x: CHIP_X[2], y: CHIP_Y, w: CHIP_W[2], h: CHIP_H, name: 'src', value: '10.244.1.5', role: 'network' });
    const ctChip   = valChip({ x: CHIP_X[3], y: CHIP_Y, w: CHIP_W[3], h: CHIP_H, name: 'conntrack', value: 'none', role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: the Node frame in back, then the Pod and the chain blocks, then wires + the exit label,
    // then chips, then the packet layer with its riding tags on top.
    root.appendChild(theNode);
    root.appendChild(podC.group);
    [pre, rt, fw, po, eth, ct].forEach(b => root.appendChild(b));
    [entryWire, h1, h2, h3, h4, returnWire, ctLink, exitLabel].forEach(el => root.appendChild(el));
    [hookChip, dstChip, srcChip, ctChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, theNode, podC: podC.group, podCBox: podC.innerBox,
      pre, rt, fw, po, eth, ct,
      hookChip, dstChip, srcChip, ctChip,
      packetLayer, wires: { exit: exitLabel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['pre', 'rt', 'fw', 'po', 'eth', 'ct', 'hookChip', 'dstChip', 'srcChip', 'ctChip', 'podCBox'], [s.refs.podC]);
  ['pre', 'rt', 'fw', 'po', 'eth', 'ct'].forEach(k => { s.refs[k].style.opacity = '1'; });
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'The DNAT that kube-proxy programs, the conntrack entry that pins a flow, the MASQUERADE that rewrites an egress source: none of them float somewhere in the kernel. Each runs at a fixed netfilter hook, and the order of those hooks is what makes them work at all.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setBoxSublabel(s.refs.ct, 'no flow yet');
      setVal(s.refs.hookChip, 'none');
      setVal(s.refs.dstChip, '10.96.0.20:80');
      setVal(s.refs.srcChip, '10.244.1.5');
      setVal(s.refs.ctChip, 'none');
    },
  },
  {
    id: 'prerouting',
    // Motion: the Pod pulses first, the ball leaves at BEAT.afterPulse(800) and rides the entry route
    // (1389ms), so PREROUTING lights at 2189.
    duration: 2900,
    narration: 'The client Pod opens a connection to a Service. The packet leaves the Pod and enters the Node kernel at PREROUTING, the very first hook, before any routing decision has been made. The conntrack table sees a flow it has never seen and records it, which is what will let the reply be untangled later with no work at all.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setBoxSublabel(s.refs.ct, '10.244.1.5 -> 10.96.0.20:80');
      setVal(s.refs.hookChip, 'PREROUTING');
      setVal(s.refs.dstChip, '10.96.0.20:80');
      setVal(s.refs.srcChip, '10.244.1.5');
      setVal(s.refs.ctChip, 'new flow');
      s.refs.ct.classList.add('highlight');
      s.refs.hookChip.classList.add('highlight');
      s.refs.ctChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.pre.classList.add('highlight'); return; }
      // Up-arrow: the Pod is the sender, so it pulses FIRST and the packet leaves at BEAT.afterPulse. It
      // still carries the ClusterIP, which is what the tag says, and PREROUTING lights on arrival.
      pulsePod(s.refs.podC, ctx, 0);
      const inb = routePacket(s, ctx, ENTRY, { delay: BEAT.afterPulse, role: 'network' });
      ridingLabel(s, ctx, 'dst 10.96.0.20:80', ENTRY, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.pre, ctx, inb.arrivalMs);
    },
  },
  {
    id: 'dnat',
    duration: 2600,
    narration: 'Still inside PREROUTING, the nat table runs and the KUBE-SERVICES chain matches the ClusterIP. It DNATs the destination to a real backend, 10.244.2.7:8080 on Node-2, and conntrack stores the translation next to the flow. The packet that leaves this hook is no longer addressed to a Service at all.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setBoxSublabel(s.refs.ct, '10.96.0.20:80 -> 10.244.2.7:8080');
      setVal(s.refs.hookChip, 'PREROUTING (nat)');
      s.refs.hookChip.classList.add('highlight');
      setVal(s.refs.dstChip, '10.244.2.7:8080');
      setVal(s.refs.srcChip, '10.244.1.5');
      setVal(s.refs.ctChip, 'DNAT recorded');
      s.refs.pre.classList.add('highlight');
      s.refs.ct.classList.add('highlight');
      s.refs.dstChip.classList.add('highlight');
      s.refs.ctChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.rt.classList.add('highlight'); return; }
      // The rewrite happened INSIDE the hook, so the ball re-emerges at its right edge already carrying
      // the backend address, and the routing decision lights as it arrives.
      const hop = segmentPacket(s, ctx, { from: PRE_TO_RT[0], to: PRE_TO_RT[1], role: 'network' });
      ridingLabel(s, ctx, 'dst 10.244.2.7:8080', PRE_TO_RT, { easing: 'linear' });
      lightBoxAt(s.refs.rt, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'routing',
    duration: 2600,
    narration: 'Only now does the kernel decide where to send the packet, and it decides on the rewritten address: 10.244.2.7 lives on another Node, so this is not local traffic and it goes out. That is the whole reason DNAT sits in PREROUTING. Run it after routing and the kernel would first try to route to a ClusterIP that no interface anywhere owns.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setBoxSublabel(s.refs.ct, '10.96.0.20:80 -> 10.244.2.7:8080');
      setVal(s.refs.hookChip, 'routing decision');
      setVal(s.refs.dstChip, '10.244.2.7:8080');
      setVal(s.refs.srcChip, '10.244.1.5');
      setVal(s.refs.ctChip, 'DNAT recorded');
      s.refs.rt.classList.add('highlight');
      s.refs.hookChip.classList.add('highlight');
      s.refs.dstChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.fw.classList.add('highlight'); return; }
      // Not local, so the packet is handed to the FORWARD chain, which lights as it arrives.
      const hop = segmentPacket(s, ctx, { from: RT_TO_FW[0], to: RT_TO_FW[1], role: 'network' });
      ridingLabel(s, ctx, 'not local, forward', RT_TO_FW, { easing: 'linear' });
      lightBoxAt(s.refs.fw, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'postrouting',
    // Motion: FORWARD -> POSTROUTING (700) + hop beat(100) + POSTROUTING -> the wire (700) = 1500.
    duration: 2800,
    narration: 'A packet that is only passing through the Node crosses FORWARD, which is the filter table and where an iptables NetworkPolicy implementation drops what is not allowed. Then comes POSTROUTING, the last hook before the wire. MASQUERADE lives here and nowhere else, because only now are the outgoing interface and the source address it implies actually known. Traffic staying inside the cluster is excluded from it, so this packet keeps its Pod source and leaves untouched.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'exit', 'to Node-2');
      setBoxSublabel(s.refs.ct, '10.96.0.20:80 -> 10.244.2.7:8080');
      setVal(s.refs.hookChip, 'FORWARD, POSTROUTING');
      setVal(s.refs.dstChip, '10.244.2.7:8080');
      setVal(s.refs.srcChip, '10.244.1.5 (no SNAT)');
      setVal(s.refs.ctChip, 'DNAT recorded');
      s.refs.fw.classList.add('highlight');
      s.refs.hookChip.classList.add('highlight');
      s.refs.srcChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.po.classList.add('highlight'); s.refs.eth.classList.add('highlight'); return; }
      // Two chained hops: through POSTROUTING and out onto the wire. The source rides the ball on the last
      // leg, because that is the value MASQUERADE would have changed and here deliberately does not.
      const toPo = segmentPacket(s, ctx, { from: FW_TO_PO[0], to: FW_TO_PO[1], role: 'network' });
      lightBoxAt(s.refs.po, ctx, toPo.arrivalMs);
      const outDelay = toPo.arrivalMs + BEAT.afterHop;
      const out = segmentPacket(s, ctx, { from: PO_TO_ETH[0], to: PO_TO_ETH[1], delay: outDelay, role: 'network' });
      ridingLabel(s, ctx, 'src 10.244.1.5', PO_TO_ETH, { delay: outDelay, easing: 'linear' });
      lightBoxAt(s.refs.eth, ctx, out.arrivalMs);
    },
  },
  {
    id: 'reply',
    // Motion: the reply rides its own lane back to PREROUTING (1998ms), which lights on arrival.
    duration: 3000,
    narration: 'The backend answers, and the reply arrives on the wire addressed from 10.244.2.7 to the Pod. At PREROUTING conntrack matches it against the flow it recorded and sees an established connection, so the stored translation is reversed automatically on the way back out: the source becomes 10.96.0.20 again, the address the Pod dialed. Not a single Service rule is walked, which is why the rule walk is a first-packet cost and nothing more.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setBoxSublabel(s.refs.ct, '10.96.0.20:80 -> 10.244.2.7:8080');
      setVal(s.refs.hookChip, 'PREROUTING');
      s.refs.hookChip.classList.add('highlight');
      setVal(s.refs.dstChip, '10.244.1.5');
      s.refs.dstChip.classList.add('highlight');
      setVal(s.refs.srcChip, '10.96.0.20:80 (restored)');
      setVal(s.refs.ctChip, 'ESTABLISHED');
      s.refs.ct.classList.add('highlight');
      s.refs.ctChip.classList.add('highlight');
      s.refs.srcChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.pre.classList.add('highlight'); return; }
      // The reply rides its own lane, never a forward wire backwards, and PREROUTING lights as it lands.
      // The tag carries the source the backend actually sent, which conntrack is about to rewrite.
      const back = routePacket(s, ctx, RETURN, { role: 'network' });
      ridingLabel(s, ctx, 'src 10.244.2.7:8080', RETURN, { emerge: 150 });
      lightBoxAt(s.refs.pre, ctx, back.arrivalMs);
    },
  },
  {
    id: 'ebpf',
    duration: 2600,
    narration: 'An eBPF dataplane does not walk this chain at all. It attaches to the socket hook instead, above netfilter, and rewrites the destination at connect time, before the first packet is even built. The hooks below stay empty, which is exactly what lets kube-proxy and its iptables chains be removed from the Node entirely.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setBoxSublabel(s.refs.ct, 'kept in BPF maps instead');
      setVal(s.refs.hookChip, 'socket, above netfilter');
      setVal(s.refs.dstChip, '10.244.2.7:8080');
      setVal(s.refs.srcChip, '10.244.1.5');
      s.refs.srcChip.classList.add('highlight');
      setVal(s.refs.ctChip, 'in BPF maps');
      s.refs.ctChip.classList.add('highlight');
      // The chain the packet no longer walks: dimming it is the message of the step.
      ['pre', 'rt', 'fw', 'po', 'ct'].forEach(k => { s.refs[k].style.opacity = String(OPACITY.notready); });
      s.refs.hookChip.classList.add('highlight');
      s.refs.dstChip.classList.add('highlight');
      // Reflective beat: nothing travels here, because the point is the path NOT taken. The chips carry
      // the comparison, and the dimmed chain carries the rest.
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
