import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, arrow, pathArrow, animateAlong } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, routePacket, routeDur, makeInit, clearHighlights, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. A Node box
// holds the client Pod and the MASQUERADE box; the Internet box is lifted to the top-right, well
// above the egress lanes. Forward and return traffic ride SEPARATE parallel lanes so the round trip
// reads as a loop: the request goes out along the upper lane (FWD_Y) and turns up into the Internet
// box, the reply comes down and returns along the lower lane (RET_Y). Both lanes sit inside the box
// heights so a ball never travels under a box. The Node left edge and the Internet right edge line up
// with the leftmost (src) and rightmost (dst) chips below, so the top row and the info strip share
// extremes. The SNAT and the reverse SNAT happen INSIDE the masquerade box, so the ball fades at one
// edge and re-emerges at the far edge. masquerade/net are infrastructure: they light, they never
// pulse. Only the Pod pulses. Source/destination IPs are not inline wire text: they ride ALONG with
// the ball on each hop (ridingLabel), forward on send/masquerade and in reverse on reply/deliver.
const EGRESS_Y = 360;               // vertical center of the Pod and masquerade boxes: both lanes sit symmetric about it
const LANE_DY = 12;                 // half-gap between the two horizontal lanes
const FWD_Y = EGRESS_Y - LANE_DY;   // 348: forward lane (Pod -> Internet), above center
const RET_Y = EGRESS_Y + LANE_DY;   // 372: return lane (Internet -> Pod), below center
const POD_EDGE = 310;               // right edge of the client Pod SHELL (not the inner app box): wires meet the Pod block itself
const MASQ_LEFT = 440;
const MASQ_RIGHT = 630;
// Internet box, raised to the top-right. Its right edge (NET_X + NET_W) equals the dst chip right.
const NET_X = 890, NET_Y = 110, NET_W = 230, NET_H = 62;
const NET_CX = NET_X + NET_W / 2;   // 1005: horizontal center of the Internet box
const NET_BOTTOM = NET_Y + NET_H;   // 172: where the legs meet the Internet box bottom
// The two vertical legs sit symmetric about NET_CX so entry and exit are centered on the box: the
// forward leg rises into the box left of center, the return leg descends right of center.
const LEG_DX = 20;
const FWD_UP_X = NET_CX - LEG_DX;   // 985
const RET_DOWN_X = NET_CX + LEG_DX; // 1025
// Forward leg as one right-angle path: out from MASQ_RIGHT along FWD_Y, then up at FWD_UP_X into the
// box bottom. Return leg mirrors it on the lower lane: down at RET_DOWN_X, then back along RET_Y to
// MASQ_RIGHT. Each static wire and its moving ball share the exact array. Both ends sit at block
// edges so the ball never travels under a box.
const OUT_PATH = [[MASQ_RIGHT, FWD_Y], [FWD_UP_X, FWD_Y], [FWD_UP_X, NET_BOTTOM]];
const RET_PATH = [[RET_DOWN_X, NET_BOTTOM], [RET_DOWN_X, RET_Y], [MASQ_RIGHT, RET_Y]];

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// A small label that rides ALONG with the ball on the same path, timing and easing, tagging it with
// the source/destination IP the step narrates. It lives in the packet layer but is not a
// .scheme-packet, so it does not count as a packet to the tools. dur omitted => routeDur(points),
// matching a ball that also omits dur. Pass easing:'linear' for straight segmentPacket hops so the
// tag stays locked to the linear ball; routePacket legs keep the default ease-in-out.
function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'ease-in-out' } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: -14, 'text-anchor': 'middle', 'data-cat': 'network' }, [txt]);
  lbl.style.opacity = '0';
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 160, fill: 'forwards', easing: 'ease-in' }));
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
      'aria-label': 'Pod egress to the internet: a Pod IP is private to the cluster and not routable outside, so as the packet leaves the Node it is source-NATed to the Node IP by an iptables MASQUERADE rule, conntrack records the mapping, the internet replies to the Node IP, and conntrack reverses the translation so the reply reaches the Pod',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Node left edge (80) lines up with the src chip left edge below.
    const theNode = node({ x: 80, y: 214, w: 620, h: 312, label: 'Node   ·   192.168.1.20' });

    // Shell vertical center pinned to EGRESS_Y (298 + 124/2 = 360) so the two lanes enter/exit it symmetrically.
    const shell = pod({ x: 110, y: 298, w: 200, h: 124, label: 'client Pod', sublabel: '10.244.1.5', containers: 0, cat: 'network' });
    const shellRect = shell.querySelector('.scheme-pod-rect');
    if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
    const podGroup = g({});
    podGroup.appendChild(shell);
    // eth0 lives INSIDE podGroup so pulsePod (which pulses .scheme-pod-rect + .scheme-box-rect within
    // the group) blinks the app box together with the Pod shell.
    const eth0 = box({ x: 130, y: 334, w: 160, h: 52, label: 'app', sublabel: 'eth0', cat: 'network' });
    podGroup.appendChild(eth0);

    const masq = box({ x: MASQ_LEFT, y: 329, w: 190, h: 62, label: 'MASQUERADE', sublabel: 'iptables SNAT', cat: 'network' });
    const net = box({ x: NET_X, y: NET_Y, w: NET_W, h: NET_H, label: 'Internet', sublabel: '1.1.1.1:443', cat: 'network' });

    // Forward lane: Pod eth0 -> masquerade (upper), then the right-angle leg up into the Internet box.
    const eWire = arrow({ x1: POD_EDGE, y1: FWD_Y, x2: MASQ_LEFT, y2: FWD_Y, dashed: true, dim: true, color: 'network' });
    const outWire = pathArrow({ points: OUT_PATH, dashed: true, dim: true, color: 'network' });
    // Return lane: the reply leg down out of the Internet box, then masquerade -> Pod eth0 (lower).
    const retWire = pathArrow({ points: RET_PATH, dashed: true, dim: true, color: 'network' });
    const eWireBack = arrow({ x1: MASQ_LEFT, y1: RET_Y, x2: POD_EDGE, y2: RET_Y, dashed: true, dim: true, color: 'network' });

    // Chip strip: src chip left (80) == Node left, dst chip right (1120) == Internet right.
    const srcChip  = valChip({ x: 80,  y: 560, w: 270, h: 34, name: 'src', value: '10.244.1.5', cat: 'network' });
    const snatChip = valChip({ x: 370, y: 560, w: 270, h: 34, name: 'SNAT', value: 'none', cat: 'network' });
    const ctChip   = valChip({ x: 660, y: 560, w: 230, h: 34, name: 'conntrack', value: 'none', cat: 'network' });
    const dstChip  = valChip({ x: 910, y: 560, w: 210, h: 34, name: 'dst', value: '1.1.1.1:443', cat: 'network' });

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

function clearHL(s) {
  clearHighlights(s, ['masq', 'net', 'eth0', 'srcChip', 'snatChip', 'ctChip', 'dstChip'], [s.refs.podGroup]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Pod wants to reach an address out on the internet. Its source IP, 10.244.1.5, is private to the cluster and the outside world has no route back to it. If the packet left with that source untouched, the reply would have nowhere to return.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.srcChip, '10.244.1.5');
      setVal(s.refs.snatChip, 'none');
      setVal(s.refs.ctChip, 'none');
      setVal(s.refs.dstChip, '1.1.1.1:443');
    },
  },
  {
    id: 'send',
    duration: 2200,
    narration: 'The Pod sends to 1.1.1.1 out its eth0. The packet carries src 10.244.1.5 and rides the veth into the Node, where it heads for the egress path on its way off the host.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      // The src chip is what the ball currently carries.
      s.refs.srcChip.classList.add('highlight');
      setVal(s.refs.srcChip, '10.244.1.5');
      if (ctx.reduced) { s.refs.eth0.classList.add('highlight'); s.refs.masq.classList.add('highlight'); return; }
      // Up-arrow: the Pod pulses first, the packet leaves at BEAT.afterPulse and reaches the
      // masquerade box, which lights on arrival. The src IP rides with the ball.
      pulsePod(s.refs.podGroup, ctx, 0);
      const pts = [[POD_EDGE, FWD_Y], [MASQ_LEFT, FWD_Y]];
      const send = segmentPacket(s, ctx, { from: pts[0], to: pts[1], delay: BEAT.afterPulse, cat: 'network' });
      ridingLabel(s, ctx, 'src 10.244.1.5', pts, { delay: BEAT.afterPulse, easing: 'linear' });
      lightBoxAt(s.refs.masq, ctx, send.arrivalMs);
    },
  },
  {
    id: 'masquerade',
    duration: 2600,
    narration: 'As the packet leaves the Node, a MASQUERADE rule rewrites the source from the Pod IP to the Node IP, 192.168.1.20, and conntrack records the mapping. The packet now looks like it came from the Node itself, an address the reply can be routed back to.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      // SNAT and conntrack both update here, and the packet reaches the internet (dst).
      s.refs.masq.classList.add('highlight');
      s.refs.snatChip.classList.add('highlight');
      s.refs.ctChip.classList.add('highlight');
      s.refs.dstChip.classList.add('highlight');
      setVal(s.refs.snatChip, '-> 192.168.1.20');
      setVal(s.refs.ctChip, 'flow recorded');
      if (ctx.reduced) { s.refs.net.classList.add('highlight'); return; }
      // The SNAT-ed packet emerges from the masquerade box (rewrite happened inside), turns up the
      // L into the Internet box, which lights on arrival. The rewritten src rides with the ball.
      const out = routePacket(s, ctx, OUT_PATH, { cat: 'network' });
      ridingLabel(s, ctx, 'src 192.168.1.20', OUT_PATH, {});
      lightBoxAt(s.refs.net, ctx, out.arrivalMs);
    },
  },
  {
    id: 'reply',
    duration: 2600,
    narration: 'The server replies to 192.168.1.20, the only address it ever saw. The reply arrives at the Node, where conntrack matches the stored flow and reverses the translation, rewriting the destination back to 10.244.1.5.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      // The reply originates at the Internet server (net stays lit as the ball departs it) and
      // conntrack reverses the mapping.
      s.refs.net.classList.add('highlight');
      s.refs.masq.classList.add('highlight');
      s.refs.ctChip.classList.add('highlight');
      s.refs.dstChip.classList.add('highlight');
      setVal(s.refs.ctChip, 'reverse SNAT');
      if (ctx.reduced) return;
      // Return lane: the reply ball descends out of the Internet box and runs back along RET_Y into
      // the masquerade box (reverse SNAT inside), which lights on arrival. The dst it still carries
      // (node IP) rides along.
      const back = routePacket(s, ctx, RET_PATH, { cat: 'network' });
      ridingLabel(s, ctx, 'dst 192.168.1.20', RET_PATH, {});
      lightBoxAt(s.refs.masq, ctx, back.arrivalMs);
    },
  },
  {
    id: 'deliver',
    duration: 2400,
    narration: 'With the destination restored to the Pod IP, the reply is delivered back down the veth into the Pod. The Pod only ever used its own source address, the SNAT and its reversal happened entirely on the Node, invisible to both ends.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      // Delivered back to the src Pod.
      s.refs.masq.classList.add('highlight');
      s.refs.srcChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.eth0.classList.add('highlight'); return; }
      // Reverse direction: the restored packet leaves the masquerade box and hops back into the Pod,
      // which pulses on arrival as the receiver. The restored dst (pod IP) rides with the ball.
      const pts = [[MASQ_LEFT, RET_Y], [POD_EDGE, RET_Y]];
      const into = segmentPacket(s, ctx, { from: pts[0], to: pts[1], cat: 'network' });
      ridingLabel(s, ctx, 'dst 10.244.1.5', pts, { easing: 'linear' });
      pulsePod(s.refs.podGroup, ctx, into.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
