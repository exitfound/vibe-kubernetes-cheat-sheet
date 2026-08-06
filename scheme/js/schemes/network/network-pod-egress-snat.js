import { g } from '../../lib/svg.js';
import { arrowDefs, box, node, arrow, pathArrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, routePacket, makeInit, clearHighlights, clearWires, BEAT, lightBoxAt, makeRidingLabel, diagramRoot } from './network-kit.js';
// Design notes for this card: ./CARDS.md#network-pod-egress-snat


const EGRESS_Y = 360;               // vertical center of the Pod and masquerade boxes: both lanes sit symmetric about it
const LANE_DY = 12;                 // half-gap between the two horizontal lanes
const FWD_Y = EGRESS_Y - LANE_DY;   // 348: forward lane (Pod -> Internet), above center
const RET_Y = EGRESS_Y + LANE_DY;   // 372: return lane (Internet -> Pod), below center
const NODE_X = 80, NODE_Y = 214, NODE_W = 620, NODE_H = 312;   // Node left edge lines up with the src chip left edge
const POD_X = 110, POD_W = 200, POD_H = 124;
const POD_Y = EGRESS_Y - POD_H / 2; // 298: shell centred on the egress line so both lanes meet it symmetrically
const POD_EDGE = POD_X + POD_W;     // 310: right edge of the client Pod SHELL (not the inner app box): wires meet the Pod block itself
const MASQ_LEFT = 440, MASQ_W = 190, MASQ_H = 62;
const MASQ_RIGHT = MASQ_LEFT + MASQ_W;   // 630
const MASQ_Y = EGRESS_Y - MASQ_H / 2;    // 329
// Outside the Node, in its own right-hand column, its top level with the Node frame so the whole
// composition sits below the panel (bottom <= 181). Its right edge equals the dst chip right.
const NET_X = 890, NET_Y = NODE_Y, NET_W = 230, NET_H = 62;
const NET_CX = NET_X + NET_W / 2;   // 1005: horizontal center of the Internet box
const NET_BOTTOM = NET_Y + NET_H;   // 172: where the legs meet the Internet box bottom
// The two vertical legs sit symmetric about NET_CX so entry and exit are centered on the box: the
// forward leg rises into the box left of center, the return leg descends right of center.
const LEG_DX = 20;
const FWD_UP_X = NET_CX - LEG_DX;   // 985
const RET_DOWN_X = NET_CX + LEG_DX; // 1025
const OUT_PATH = [[MASQ_RIGHT, FWD_Y], [FWD_UP_X, FWD_Y], [FWD_UP_X, NET_BOTTOM]];
const RET_PATH = [[RET_DOWN_X, NET_BOTTOM], [RET_DOWN_X, RET_Y], [MASQ_RIGHT, RET_Y]];
// The two short Pod lanes, one per direction, shared by their wire and their ball.
const POD_TO_MASQ = [[POD_EDGE, FWD_Y], [MASQ_LEFT, FWD_Y]];
const MASQ_TO_POD = [[MASQ_LEFT, RET_Y], [POD_EDGE, RET_Y]];

// Chip strip: src chip left == Node left, dst chip right == Internet right, even gaps between.
const CHIP_Y = 560, CHIP_H = 34, CHIP_GAP = 20;
const CHIP_W = [270, 270, 230, 210];
const CHIP_X = CHIP_W.reduce((acc, w, i) => (i ? [...acc, acc[i - 1] + CHIP_W[i - 1] + CHIP_GAP] : [NODE_X]), []);

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'network' });

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = diagramRoot({ 'aria-label': 'Pod egress to the internet: a Pod IP is private to the cluster and not routable outside, so as the packet leaves the Node it is source-NATed to the Node IP by an iptables MASQUERADE rule, conntrack records the mapping, the internet replies to the Node IP, and conntrack reverses the translation so the reply reaches the Pod' });
    root.appendChild(arrowDefs());

    const theNode = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node   ·   192.168.1.20' });

    const shell = podShell({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Client Pod', sublabel: '10.244.1.5', containers: 0, role: 'network' });
    const podGroup = g({});
    podGroup.appendChild(shell);
    // eth0 lives INSIDE podGroup so pulsePod (which pulses .scheme-pod-rect + .scheme-box-rect within
    // the group) blinks the app box together with the Pod shell.
    const eth0 = box({ x: POD_X + 20, y: EGRESS_Y - 26, w: POD_W - 40, h: 52, label: 'app', sublabel: 'eth0', role: 'network' });
    podGroup.appendChild(eth0);

    const masq = box({ x: MASQ_LEFT, y: MASQ_Y, w: MASQ_W, h: MASQ_H, label: 'MASQUERADE', sublabel: 'iptables SNAT', role: 'network' });
    const net = box({ x: NET_X, y: NET_Y, w: NET_W, h: NET_H, label: 'Internet', sublabel: '1.1.1.1:443', role: 'network' });

    // Forward lane: Pod eth0 -> masquerade (upper), then the right-angle leg up into the Internet box.
    const eWire = arrow({ x1: POD_TO_MASQ[0][0], y1: POD_TO_MASQ[0][1], x2: POD_TO_MASQ[1][0], y2: POD_TO_MASQ[1][1], dashed: true, dim: true, role: 'network' });
    const outWire = pathArrow({ points: OUT_PATH, dashed: true, dim: true, role: 'network' });
    // Return lane: the reply leg down out of the Internet box, then masquerade -> Pod eth0 (lower).
    const retWire = pathArrow({ points: RET_PATH, dashed: true, dim: true, role: 'network' });
    const eWireBack = arrow({ x1: MASQ_TO_POD[0][0], y1: MASQ_TO_POD[0][1], x2: MASQ_TO_POD[1][0], y2: MASQ_TO_POD[1][1], dashed: true, dim: true, role: 'network' });

    const srcChip  = valChip({ x: CHIP_X[0], y: CHIP_Y, w: CHIP_W[0], h: CHIP_H, name: 'src', value: '10.244.1.5', role: 'network' });
    const snatChip = valChip({ x: CHIP_X[1], y: CHIP_Y, w: CHIP_W[1], h: CHIP_H, name: 'SNAT', value: 'none', role: 'network' });
    const ctChip   = valChip({ x: CHIP_X[2], y: CHIP_Y, w: CHIP_W[2], h: CHIP_H, name: 'conntrack', value: 'none', role: 'network' });
    const dstChip  = valChip({ x: CHIP_X[3], y: CHIP_Y, w: CHIP_W[3], h: CHIP_H, name: 'dst', value: '1.1.1.1:443', role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: Node background, then Pod + masquerade + internet boxes, then wires above,
    // then chips, then the packet layer (ball + riding label) on top.
    root.appendChild(theNode);
    root.appendChild(masq);
    root.appendChild(net);
    root.appendChild(podGroup);
    [eWire, outWire, retWire, eWireBack].forEach(el => root.appendChild(el));
    [srcChip, snatChip, ctChip, dstChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, theNode, podGroup, eth0, masq, net,
      srcChip, snatChip, ctChip, dstChip,
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { src, snat, ct, dst }) {
  setVal(s.refs.srcChip, src);
  setVal(s.refs.snatChip, snat);
  setVal(s.refs.ctChip, ct);
  setVal(s.refs.dstChip, dst);
}

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  clearHighlights(s, ['masq', 'net', 'eth0', 'srcChip', 'snatChip', 'ctChip', 'dstChip'], [s.refs.podGroup]);
  clearWires(s);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      resetStep(s);
      setChips(s, { src: '10.244.1.5', snat: 'none', ct: 'none', dst: '1.1.1.1:443' });
    },
  },
  {
    id: 'send',
    duration: 2200,
    narration: 'The Pod sends to 1.1.1.1 out its eth0. The packet carries src 10.244.1.5 and rides the veth into the Node, where it heads for the egress path on its way off the host.',
    enter(s, ctx) {
      resetStep(s);
      // The src chip is what the ball currently carries.
      s.refs.srcChip.classList.add('highlight');
      setChips(s, { src: '10.244.1.5', snat: 'none', ct: 'none', dst: '1.1.1.1:443' });
      if (ctx.reduced) { s.refs.eth0.classList.add('highlight'); s.refs.masq.classList.add('highlight'); return; }
      // Up-arrow: the Pod pulses first, the packet leaves at BEAT.afterPulse and reaches the
      // masquerade box, which lights on arrival. The src IP rides with the ball.
      pulsePod(s.refs.podGroup, ctx, 0);
      const send = segmentPacket(s, ctx, { from: POD_TO_MASQ[0], to: POD_TO_MASQ[1], delay: BEAT.afterPulse, role: 'network' });
      ridingLabel(s, ctx, 'src 10.244.1.5', POD_TO_MASQ, { delay: BEAT.afterPulse, easing: 'linear' });
      lightBoxAt(s.refs.masq, ctx, send.arrivalMs);
    },
  },
  {
    id: 'masquerade',
    duration: 2600,
    narration: 'As the packet leaves the Node, a MASQUERADE rule rewrites the source from the Pod IP to the Node IP, 192.168.1.20, and conntrack records the mapping. The packet now looks like it came from the Node itself, an address the reply can be routed back to.',
    enter(s, ctx) {
      resetStep(s);
      // SNAT and conntrack both update here, and the packet reaches the internet (dst).
      s.refs.masq.classList.add('highlight');
      s.refs.snatChip.classList.add('highlight');
      s.refs.ctChip.classList.add('highlight');
      s.refs.dstChip.classList.add('highlight');
      setChips(s, { src: '10.244.1.5', snat: '-> 192.168.1.20', ct: 'flow recorded', dst: '1.1.1.1:443' });
      if (ctx.reduced) { s.refs.net.classList.add('highlight'); return; }
      // The SNAT-ed packet emerges from the masquerade box (rewrite happened inside), turns up the
      // L into the Internet box, which lights on arrival. The rewritten src rides with the ball.
      const out = routePacket(s, ctx, OUT_PATH, { role: 'network' });
      ridingLabel(s, ctx, 'src 192.168.1.20', OUT_PATH, {});
      lightBoxAt(s.refs.net, ctx, out.arrivalMs);
    },
  },
  {
    id: 'reply',
    duration: 2600,
    narration: 'The server replies to 192.168.1.20, the only address it ever saw. The reply arrives at the Node, where conntrack matches the stored flow and reverses the translation, rewriting the destination back to 10.244.1.5.',
    enter(s, ctx) {
      resetStep(s);
      // The reply originates at the Internet server (net stays lit as the ball departs it) and
      // conntrack reverses the mapping.
      s.refs.net.classList.add('highlight');
      s.refs.ctChip.classList.add('highlight');
      s.refs.dstChip.classList.add('highlight');
      setChips(s, { src: '10.244.1.5', snat: '-> 192.168.1.20', ct: 'reverse SNAT', dst: '1.1.1.1:443' });
      if (ctx.reduced) { s.refs.masq.classList.add('highlight'); return; }
      const back = routePacket(s, ctx, RET_PATH, { role: 'network' });
      lightBoxAt(s.refs.masq, ctx, back.arrivalMs);
      ridingLabel(s, ctx, 'dst 192.168.1.20', RET_PATH, {});
    },
  },
  {
    id: 'deliver',
    duration: 2400,
    narration: 'With the destination restored to the Pod IP, the reply is delivered back down the veth into the Pod. The Pod only ever used its own source address, the SNAT and its reversal happened entirely on the Node, invisible to both ends.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { src: '10.244.1.5', snat: '-> 192.168.1.20', ct: 'reverse SNAT', dst: '1.1.1.1:443' });
      // Delivered back to the src Pod.
      s.refs.masq.classList.add('highlight');
      s.refs.srcChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.eth0.classList.add('highlight'); return; }
      // Reverse direction: the restored packet leaves the masquerade box and hops back into the Pod,
      // which pulses on arrival as the receiver. The restored dst (pod IP) rides with the ball.
      const into = segmentPacket(s, ctx, { from: MASQ_TO_POD[0], to: MASQ_TO_POD[1], role: 'network' });
      ridingLabel(s, ctx, 'dst 10.244.1.5', MASQ_TO_POD, { easing: 'linear' });
      pulsePod(s.refs.podGroup, ctx, into.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
