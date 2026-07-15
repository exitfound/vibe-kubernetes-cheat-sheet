import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow, pathArrow, animateAlong } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, routePacket, routeDur, makeInit, clearHighlights, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. The client sits
// on the center line (FLOW_Y) facing kube-proxy, and the two backend Pods sit SYMMETRIC above and
// below that line, podY the exact vertical mirror of podX. Each backend is wired to kube-proxy by a
// forward fan (kube-proxy -> Pod) and a return fan (Pod -> kube-proxy) of the identical shape, so the
// arrows travel the same on top and bottom and always meet a Pod at its left edge. The virtual
// ClusterIP is lifted ABOVE kube-proxy (it owns no interface, the packet never reaches it, kube-proxy
// intercepts). Forward and return traffic ride SEPARATE lanes so a round trip reads as a loop, never a
// retrace. The DNAT and the reverse NAT happen INSIDE kube-proxy, so the ball fades at one edge and
// re-emerges at the far edge. vip and kube-proxy are infrastructure: they light, they never pulse.
// Only Pods pulse. Addresses ride ALONG with the ball on each hop (ridingLabel), not as inline wire
// text: the ClusterIP dst on the way in, the Pod IP after DNAT, the Pod IP then the reversed ClusterIP
// src on the way back. Flow 1 runs to podX (send/dnat/reply), flow 2 to podY (balance/balance-reply).
const FLOW_Y = 312;                 // center line: client, kube-proxy and the two fans are symmetric about it
const LANE_DY = 12;                 // half-gap between the two client <-> kube-proxy lanes
const FWD_Y = FLOW_Y - LANE_DY;     // 300: client -> kube-proxy lane, above center
const RET_Y = FLOW_Y + LANE_DY;     // 324: kube-proxy -> client lane, below center
const CLIENT_EDGE = 260;            // right edge of the client Pod shell: the two client lanes meet it
const KP_LEFT = 440, KP_RIGHT = 660;// kube-proxy box left/right edges (center y = FLOW_Y)
const POD_LEFT = 820, POD_W = 210, POD_H = 114;
const POD_OFFSET = 150;             // each backend centre is this far above/below FLOW_Y (mirror pair)
const PODX_CY = FLOW_Y - POD_OFFSET;// 162: top backend centre
const PODY_CY = FLOW_Y + POD_OFFSET;// 462: bottom backend centre
const PODX_Y = PODX_CY - POD_H / 2; // 105
const PODY_Y = PODY_CY - POD_H / 2; // 405
const FAN_DY = 12;                  // fan attaches +/-FAN_DY from a Pod centre at its left edge
const FAN_OUT_X = 700, FAN_IN_X = 730; // forward (out) vertical bus and return (in) vertical bus
// kube-proxy right-edge attach points, symmetric about FLOW_Y: top pair for podX, bottom pair mirrors it.
const KPX_FWD_Y = 294, KPX_RET_Y = 306; // podX forward-out / return-in (both just above center)
const KPY_FWD_Y = 330, KPY_RET_Y = 318; // podY forward-out / return-in (mirror, both just below center)

// Each static wire and its moving ball share the exact same array, and podY's fans are the vertical
// mirror of podX's, so both backends are wired identically. Both ends sit at block edges so a ball
// never travels under a box.
const LANE_FWD = [[CLIENT_EDGE, FWD_Y], [KP_LEFT, FWD_Y]];
const LANE_RET = [[KP_LEFT, RET_Y], [CLIENT_EDGE, RET_Y]];
const FAN_FWD_X = [[KP_RIGHT, KPX_FWD_Y], [FAN_OUT_X, KPX_FWD_Y], [FAN_OUT_X, PODX_CY - FAN_DY], [POD_LEFT, PODX_CY - FAN_DY]];
const FAN_RET_X = [[POD_LEFT, PODX_CY + FAN_DY], [FAN_IN_X, PODX_CY + FAN_DY], [FAN_IN_X, KPX_RET_Y], [KP_RIGHT, KPX_RET_Y]];
const FAN_FWD_Y = [[KP_RIGHT, KPY_FWD_Y], [FAN_OUT_X, KPY_FWD_Y], [FAN_OUT_X, PODY_CY + FAN_DY], [POD_LEFT, PODY_CY + FAN_DY]];
const FAN_RET_Y = [[POD_LEFT, PODY_CY - FAN_DY], [FAN_IN_X, PODY_CY - FAN_DY], [FAN_IN_X, KPY_RET_Y], [KP_RIGHT, KPY_RET_Y]];

// This card glides its packets 10% slower than the shared canon speed (routeDur). Only the ball
// travel is slowed, via an explicit dur; every other beat (pulses, hops, step floors) stays on the
// standard canon, so the overall process matches every other card. Riding src/dst-IP labels use the
// same slowDur so they stay locked to the ball. Registered in tools/check-canon.mjs ALLOW_EXPLICIT_DUR.
const SLOWMO = 1.1;
const slowDur = (points) => Math.round(routeDur(points) * SLOWMO);

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// A small label that rides ALONG with the ball on the same path, timing and easing, tagging it with
// the source/destination address the step narrates. It lives in the packet layer but is not a
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
      'aria-label': 'ClusterIP routing via kube-proxy: a client sends to a virtual ClusterIP that no interface owns, kube-proxy intercepts and DNATs the packet to one of two symmetric backing Pods, and connection tracking rewrites the reply so the client never sees the Pod address',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = podBlock({ x: 70, y: 252, w: 190, h: 120, label: 'Client Pod', ip: '10.244.1.5' });
    const vip    = box({ x: 440, y: 120, w: 220, h: 72, label: 'ClusterIP 10.96.0.10:80', sublabel: 'virtual · no interface', cat: 'network' });
    const kproxy = box({ x: 440, y: 276, w: 220, h: 72, label: 'kube-proxy', sublabel: 'DNAT dataplane', cat: 'network' });
    const podX = podBlock({ x: POD_LEFT, y: PODX_Y, w: POD_W, h: POD_H, label: 'Pod web', ip: '10.244.2.7:8080' });
    const podY = podBlock({ x: POD_LEFT, y: PODY_Y, w: POD_W, h: POD_H, label: 'Pod web', ip: '10.244.3.9:8080' });

    // Client <-> kube-proxy lanes (upper forward, lower return). The vip->kproxy ownership link. Then
    // the four backend fans: forward and return for podX (top) and their vertical mirror for podY
    // (bottom), so both Pods are wired to kube-proxy identically.
    const cWireFwd = arrow({ x1: CLIENT_EDGE, y1: FWD_Y, x2: KP_LEFT, y2: FWD_Y, dashed: true, dim: true, color: 'network' });
    const cWireRet = arrow({ x1: KP_LEFT, y1: RET_Y, x2: CLIENT_EDGE, y2: RET_Y, dashed: true, dim: true, color: 'network' });
    // Ownership marker, NOT a traffic path: kube-proxy realizes this virtual IP. No packet ever
    // travels it (the ClusterIP never appears on a wire), so it is a plain dashed line with no
    // arrowhead, to read as an association rather than a wire missing its ball.
    const ownLink  = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-network', x1: 550, y1: 192, x2: 550, y2: 276, 'stroke-dasharray': '5 5', fill: 'none' });
    const fanFwdX  = pathArrow({ points: FAN_FWD_X, dashed: true, dim: true, color: 'network' });
    const fanRetX  = pathArrow({ points: FAN_RET_X, dashed: true, dim: true, color: 'network' });
    const fanFwdY  = pathArrow({ points: FAN_FWD_Y, dashed: true, dim: true, color: 'network' });
    const fanRetY  = pathArrow({ points: FAN_RET_Y, dashed: true, dim: true, color: 'network' });

    // The four chips span the full block width of the scheme 1:1: the leftmost starts at the Client
    // Pod left edge (x=70) and the rightmost ends at the backend Pod right edge (POD_LEFT+POD_W=1030),
    // with even 20px gaps. Widths are tuned to their content (DNAT carries the longest value).
    const vipChip  = valChip({ x: 70,  y: 548, w: 240, h: 34, name: 'dst', value: '10.96.0.10:80', cat: 'network' });
    const dnatChip = valChip({ x: 330, y: 548, w: 270, h: 34, name: 'DNAT', value: 'none', cat: 'network' });
    const ctChip   = valChip({ x: 620, y: 548, w: 200, h: 34, name: 'conntrack', value: 'none', cat: 'network' });
    const backChip = valChip({ x: 840, y: 548, w: 190, h: 34, name: 'backend', value: 'none', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: boxes/pods, then wires ABOVE them, then chips, then the packet layer (ball + riding
    // label) on top.
    root.appendChild(vip);
    root.appendChild(kproxy);
    root.appendChild(client.group);
    root.appendChild(podX.group);
    root.appendChild(podY.group);
    [cWireFwd, cWireRet, ownLink, fanFwdX, fanRetX, fanFwdY, fanRetY].forEach(el => root.appendChild(el));
    [vipChip, dnatChip, ctChip, backChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, vip, kproxy, client: client.group, clientBox: client.innerBox,
      podX: podX.group, podXBox: podX.innerBox, podY: podY.group, podYBox: podY.innerBox,
      vipChip, dnatChip, ctChip, backChip,
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  // The inner app boxes (clientBox/podXBox/podYBox) are listed so their .highlight is cleared every
  // step: without them a highlight set in a reduced-replay block would leak into later steps, since
  // reduced replay never runs the forward motion path that would otherwise re-clear them. Both Pod
  // opacities reset to 1 so a dim set by an earlier flow does not persist into the next.
  clearHighlights(s, ['vip', 'kproxy', 'vipChip', 'dnatChip', 'ctChip', 'backChip', 'clientBox', 'podXBox', 'podYBox'], [s.refs.client, s.refs.podX, s.refs.podY]);
  s.refs.podX.style.opacity = '1';
  s.refs.podY.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'The web Service has a ClusterIP, 10.96.0.10, and two Ready backend Pods. That ClusterIP is a stable address clients connect to, but as the next steps show, nothing actually owns it on the network.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.dnatChip, 'none');
      setVal(s.refs.ctChip, 'none');
      setVal(s.refs.backChip, 'none');
    },
  },
  {
    id: 'virtual',
    duration: 2100,
    narration: 'The ClusterIP is virtual. No network interface holds it and no Pod answers ARP for it, so it never appears on a wire. It exists only as a target that kube-proxy has taught every Node how to intercept.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      // Infrastructure block: it lights via .highlight, it never blinks. Only Pods pulse.
      s.refs.vip.classList.add('highlight');
    },
  },
  {
    id: 'program',
    duration: 2300,
    narration: 'kube-proxy watches the Service and its EndpointSlices and installs the dataplane rules: any packet whose destination is 10.96.0.10:80 should be DNAT-ed to one of the backend Pod IPs. The rules are in place before any traffic arrives.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.kproxy.classList.add('highlight');
      s.refs.dnatChip.classList.add('highlight');
      setVal(s.refs.dnatChip, '-> .2.7 / .3.9');
      // The endpoint IPs the rules point at are named in the DNAT chip. The backend Pods are NOT
      // highlighted yet: nothing has been DNAT-ed to them at this stage, they light only when a flow
      // actually lands on them (dnat / balance). Here only kube-proxy is the actor.
    },
  },
  {
    id: 'send',
    duration: 2300,
    narration: 'The client opens a connection to the ClusterIP 10.96.0.10:80. As the packet leaves the client it is caught by the kube-proxy rules on the Node before it can go anywhere, because there is no real host at that address to route to.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      // The dst chip is the ClusterIP the ball currently carries.
      s.refs.vipChip.classList.add('highlight');
      setVal(s.refs.vipChip, '10.96.0.10:80');
      if (ctx.reduced) { s.refs.clientBox.classList.add('highlight'); s.refs.kproxy.classList.add('highlight'); return; }
      // Up-arrow: the client pulses first, the packet leaves at BEAT.afterPulse along the forward lane
      // and is caught at kube-proxy, which lights on arrival. The ClusterIP dst rides with the ball.
      pulsePod(s.refs.client, ctx, 0);
      const send = segmentPacket(s, ctx, { from: LANE_FWD[0], to: LANE_FWD[1], delay: BEAT.afterPulse, dur: slowDur(LANE_FWD), cat: 'network' });
      ridingLabel(s, ctx, 'dst 10.96.0.10:80', LANE_FWD, { delay: BEAT.afterPulse, dur: slowDur(LANE_FWD), easing: 'linear' });
      lightBoxAt(s.refs.kproxy, ctx, send.arrivalMs);
    },
  },
  {
    id: 'dnat',
    duration: 2500,
    narration: 'kube-proxy picks one backend and rewrites the destination to that Pod IP, here 10.244.2.7:8080. Connection tracking records the mapping so every later packet of the same flow takes the same backend. The DNAT-ed packet is then delivered to the chosen Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.kproxy.classList.add('highlight');
      s.refs.dnatChip.classList.add('highlight');
      s.refs.ctChip.classList.add('highlight');
      s.refs.backChip.classList.add('highlight');
      setVal(s.refs.dnatChip, '-> 10.244.2.7:8080');
      setVal(s.refs.ctChip, 'flow pinned');
      setVal(s.refs.backChip, '10.244.2.7');
      // podY is idle for this flow: dim it so the chosen backend reads clearly.
      s.refs.podY.style.opacity = '0.4';
      if (ctx.reduced) { s.refs.podXBox.classList.add('highlight'); return; }
      // Down-arrow: the DNAT-ed packet emerges from kube-proxy (the rewrite happened inside it) and
      // rides the forward fan to the chosen Pod, which pulses on arrival. The rewritten Pod IP rides
      // with the ball.
      const give = routePacket(s, ctx, FAN_FWD_X, { dur: slowDur(FAN_FWD_X), cat: 'network' });
      ridingLabel(s, ctx, 'dst 10.244.2.7:8080', FAN_FWD_X, { dur: slowDur(FAN_FWD_X) });
      pulsePod(s.refs.podX, ctx, give.arrivalMs);
    },
  },
  {
    id: 'reply',
    // Two-hop round trip: the motion runs ~3340ms, so this floor gives a ~460ms settle after the
    // reply lands, matching the dwell of the single-hop steps instead of snapping straight on.
    duration: 3800,
    narration: 'The Pod replies from its own IP, but conntrack reverses the translation on the way back so the source looks like 10.96.0.10 again. The client only ever sees the ClusterIP it dialed, never the Pod address it was actually served by.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.ctChip.classList.add('highlight');
      setVal(s.refs.ctChip, 'reverse NAT');
      setVal(s.refs.backChip, '10.244.2.7');
      s.refs.podY.style.opacity = '0.4';
      if (ctx.reduced) { s.refs.kproxy.classList.add('highlight'); s.refs.clientBox.classList.add('highlight'); return; }
      // Up-arrow first: the chosen Pod pulses, then the reply leaves along the return fan carrying the
      // Pod source IP and reaches kube-proxy, which lights as it reverses the NAT inside the box. The
      // ball hides at the kube-proxy right edge and re-emerges at the left edge carrying the restored
      // ClusterIP source, then runs the return lane to the client, which pulses on arrival.
      pulsePod(s.refs.podX, ctx, 0);
      const h1 = routePacket(s, ctx, FAN_RET_X, { delay: BEAT.afterPulse, dur: slowDur(FAN_RET_X), cat: 'network' });
      ridingLabel(s, ctx, 'src 10.244.2.7', FAN_RET_X, { delay: BEAT.afterPulse, dur: slowDur(FAN_RET_X) });
      lightBoxAt(s.refs.kproxy, ctx, h1.arrivalMs);
      const h2 = segmentPacket(s, ctx, { from: LANE_RET[0], to: LANE_RET[1], delay: h1.arrivalMs + BEAT.afterHop, dur: slowDur(LANE_RET), cat: 'network' });
      ridingLabel(s, ctx, 'src 10.96.0.10', LANE_RET, { delay: h1.arrivalMs + BEAT.afterHop, dur: slowDur(LANE_RET), easing: 'linear' });
      pulsePod(s.refs.client, ctx, h2.arrivalMs);
    },
  },
  {
    id: 'balance',
    // Same two-hop round trip as reply (~3340ms of motion): match the settle so it is not rushed.
    duration: 3800,
    narration: 'A second connection to the same ClusterIP is a brand new flow, so kube-proxy is free to pick the other backend. It DNATs this one to 10.244.3.9 and conntrack pins it there, while the first flow stays on 10.244.2.7. Each connection sticks to its own Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.kproxy.classList.add('highlight');
      s.refs.dnatChip.classList.add('highlight');
      s.refs.ctChip.classList.add('highlight');
      s.refs.backChip.classList.add('highlight');
      setVal(s.refs.dnatChip, '-> 10.244.3.9:8080');
      setVal(s.refs.ctChip, 'two flows');
      setVal(s.refs.backChip, '10.244.3.9');
      // Mirror of flow 1: podX is not the backend this flow acts on, so dim it exactly as flow 1 dims podY.
      s.refs.podX.style.opacity = '0.4';
      if (ctx.reduced) { s.refs.podYBox.classList.add('highlight'); return; }
      // Second connection, mirror of the first flow but to podY: the client pulses, the packet runs the
      // forward lane to kube-proxy carrying the ClusterIP dst, then the DNAT-ed packet emerges and rides
      // podY forward fan (down) to the OTHER backend, which pulses on arrival. Flow 1 stays on podX.
      pulsePod(s.refs.client, ctx, 0);
      const send = segmentPacket(s, ctx, { from: LANE_FWD[0], to: LANE_FWD[1], delay: BEAT.afterPulse, dur: slowDur(LANE_FWD), cat: 'network' });
      ridingLabel(s, ctx, 'dst 10.96.0.10:80', LANE_FWD, { delay: BEAT.afterPulse, dur: slowDur(LANE_FWD), easing: 'linear' });
      const give = routePacket(s, ctx, FAN_FWD_Y, { delay: send.arrivalMs + BEAT.afterHop, dur: slowDur(FAN_FWD_Y), cat: 'network' });
      ridingLabel(s, ctx, 'dst 10.244.3.9:8080', FAN_FWD_Y, { delay: send.arrivalMs + BEAT.afterHop, dur: slowDur(FAN_FWD_Y) });
      pulsePod(s.refs.podY, ctx, give.arrivalMs);
    },
  },
  {
    id: 'balance-reply',
    // Same two-hop round trip (~3340ms of motion): match the settle so the final step does not snap.
    duration: 3800,
    narration: 'podY replies from its own 10.244.3.9, and conntrack reverses this second flow the same way, rewriting the source back to 10.96.0.10 before the reply reaches the client. Two Pods served two connections, and the client only ever saw the single ClusterIP.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.ctChip.classList.add('highlight');
      setVal(s.refs.ctChip, 'reverse NAT');
      setVal(s.refs.backChip, '10.244.3.9');
      // Mirror of flow 1 reply: podX is not this flow backend, so dim it as flow 1 dims podY.
      s.refs.podX.style.opacity = '0.4';
      if (ctx.reduced) { s.refs.kproxy.classList.add('highlight'); s.refs.clientBox.classList.add('highlight'); return; }
      // Exact mirror of reply, but for podY on the lower fans: podY pulses, the reply rides podY return
      // fan (up) to kube-proxy, which lights as it reverses the NAT inside the box, then the ball hides
      // at the right edge, re-emerges at the left with the restored ClusterIP source and runs the return
      // lane to the client, which pulses on arrival.
      pulsePod(s.refs.podY, ctx, 0);
      const h1 = routePacket(s, ctx, FAN_RET_Y, { delay: BEAT.afterPulse, dur: slowDur(FAN_RET_Y), cat: 'network' });
      ridingLabel(s, ctx, 'src 10.244.3.9', FAN_RET_Y, { delay: BEAT.afterPulse, dur: slowDur(FAN_RET_Y) });
      lightBoxAt(s.refs.kproxy, ctx, h1.arrivalMs);
      const h2 = segmentPacket(s, ctx, { from: LANE_RET[0], to: LANE_RET[1], delay: h1.arrivalMs + BEAT.afterHop, dur: slowDur(LANE_RET), cat: 'network' });
      ridingLabel(s, ctx, 'src 10.96.0.10', LANE_RET, { delay: h1.arrivalMs + BEAT.afterHop, dur: slowDur(LANE_RET), easing: 'linear' });
      pulsePod(s.refs.client, ctx, h2.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
