import { svg, g } from '../../lib/svg.js';
import { arrowDefs, box, arrow, pathArrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, routePacket, routeDur, makeInit, clearHighlights, relationPath, BEAT, lightBoxAt, makeRidingLabel, OPACITY } from './network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-service-clusterip


const CX = 600;                     // canvas centre: the ClusterIP column and the chip strip sit on it
const SCHEME_L = 60, SCHEME_R = 1140; // content edges, mirrored about CX

const FLOW_Y = 312;                 // center line: client, kube-proxy and the two fans are symmetric about it
const LANE_DY = 12;                 // half-gap between the two client <-> kube-proxy lanes
const FWD_Y = FLOW_Y - LANE_DY;     // 300: client -> kube-proxy lane, above center
const RET_Y = FLOW_Y + LANE_DY;     // 324: kube-proxy -> client lane, below center
const CLIENT_X = SCHEME_L, CLIENT_W = 190, CLIENT_H = 120;
const CLIENT_EDGE = CLIENT_X + CLIENT_W;  // 250: right edge of the client Pod shell, where both client lanes meet it
const KP_W = 220, KP_H = 72;        // ClusterIP box and kube-proxy box share one size, centred on CX
const KP_LEFT = CX - KP_W / 2;      // 490
const KP_RIGHT = CX + KP_W / 2;     // 710
const KP_TOP = FLOW_Y - KP_H / 2;   // 276: kube-proxy sits on the flow line
const VIP_Y = 120;                  // the virtual ClusterIP is lifted clear above it
const VIP_BOTTOM = VIP_Y + KP_H;    // 192
const POD_W = 210, POD_H = 114;
const POD_LEFT = SCHEME_R - POD_W;  // 930: backend column, flush with the right content edge
const POD_OFFSET = 150;             // each backend centre is this far above/below FLOW_Y (mirror pair)
const PODX_CY = FLOW_Y - POD_OFFSET;// 162: top backend centre
const PODY_CY = FLOW_Y + POD_OFFSET;// 462: bottom backend centre
const PODX_Y = PODX_CY - POD_H / 2; // 105
const PODY_Y = PODY_CY - POD_H / 2; // 405
const FAN_DY = 12;                  // fan attaches +/-FAN_DY from a Pod centre at its left edge
const FAN_OUT_X = KP_RIGHT + 40, FAN_IN_X = KP_RIGHT + 70; // forward (out) and return (in) vertical buses
// kube-proxy right-edge attach points, symmetric about FLOW_Y: top pair for podX, bottom pair mirrors it.
const KPX_FWD_Y = 294, KPX_RET_Y = 306; // podX forward-out / return-in (both just above center)
const KPY_FWD_Y = 330, KPY_RET_Y = 318; // podY forward-out / return-in (mirror, both just below center)

// Chip strip: four cells spanning SCHEME_L..SCHEME_R with even gaps, so it centres on CX. Widths are
// not equal: each is sized for its own longest value (DNAT carries the widest).
const CHIP_Y = 548, CHIP_H = 34, CHIP_GAP = 20;
const CHIP_W = [270, 310, 225, 215];
const CHIP_X = CHIP_W.reduce((acc, w, i) => (i ? [...acc, acc[i - 1] + CHIP_W[i - 1] + CHIP_GAP] : [SCHEME_L]), []);

const LANE_FWD = [[CLIENT_EDGE, FWD_Y], [KP_LEFT, FWD_Y]];
const LANE_RET = [[KP_LEFT, RET_Y], [CLIENT_EDGE, RET_Y]];
const FAN_FWD_X = [[KP_RIGHT, KPX_FWD_Y], [FAN_OUT_X, KPX_FWD_Y], [FAN_OUT_X, PODX_CY - FAN_DY], [POD_LEFT, PODX_CY - FAN_DY]];
const FAN_RET_X = [[POD_LEFT, PODX_CY + FAN_DY], [FAN_IN_X, PODX_CY + FAN_DY], [FAN_IN_X, KPX_RET_Y], [KP_RIGHT, KPX_RET_Y]];
const FAN_FWD_Y = [[KP_RIGHT, KPY_FWD_Y], [FAN_OUT_X, KPY_FWD_Y], [FAN_OUT_X, PODY_CY + FAN_DY], [POD_LEFT, PODY_CY + FAN_DY]];
const FAN_RET_Y = [[POD_LEFT, PODY_CY - FAN_DY], [FAN_IN_X, PODY_CY - FAN_DY], [FAN_IN_X, KPY_RET_Y], [KP_RIGHT, KPY_RET_Y]];

const SLOWMO = 1.1;
const slowDur = (points) => Math.round(routeDur(points) * SLOWMO);

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'network' });

function podBlock({ x, y, w, h, label, ip }) {
  const shell = podShell({ x, y, w, h, label, sublabel: ip, containers: 0, role: 'network' });
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
      'aria-label': 'ClusterIP routing via kube-proxy: a client sends to a virtual ClusterIP that no interface owns, kube-proxy intercepts and DNATs the packet to one of two symmetric backing Pods, and connection tracking rewrites the reply so the client never sees the Pod address',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = podBlock({ x: CLIENT_X, y: FLOW_Y - CLIENT_H / 2, w: CLIENT_W, h: CLIENT_H, label: 'Client Pod', ip: '10.244.1.5' });
    const vip    = box({ x: KP_LEFT, y: VIP_Y, w: KP_W, h: KP_H, label: 'ClusterIP 10.96.0.20:80', sublabel: 'virtual · no interface', role: 'network' });
    const kproxy = box({ x: KP_LEFT, y: KP_TOP, w: KP_W, h: KP_H, label: 'kube-proxy', sublabel: 'DNAT dataplane', role: 'network' });
    const podX = podBlock({ x: POD_LEFT, y: PODX_Y, w: POD_W, h: POD_H, label: 'Pod web', ip: '10.244.2.7:8080' });
    const podY = podBlock({ x: POD_LEFT, y: PODY_Y, w: POD_W, h: POD_H, label: 'Pod web', ip: '10.244.3.9:8080' });

    const cWireFwd = arrow({ x1: CLIENT_EDGE, y1: FWD_Y, x2: KP_LEFT, y2: FWD_Y, dashed: true, dim: true, role: 'network' });
    const cWireRet = arrow({ x1: KP_LEFT, y1: RET_Y, x2: CLIENT_EDGE, y2: RET_Y, dashed: true, dim: true, role: 'network' });
    const ownLink  = relationPath({ points: [[CX, VIP_BOTTOM], [CX, KP_TOP]], role: 'network', dash: '5 5' });
    const fanFwdX  = pathArrow({ points: FAN_FWD_X, dashed: true, dim: true, role: 'network' });
    const fanRetX  = pathArrow({ points: FAN_RET_X, dashed: true, dim: true, role: 'network' });
    const fanFwdY  = pathArrow({ points: FAN_FWD_Y, dashed: true, dim: true, role: 'network' });
    const fanRetY  = pathArrow({ points: FAN_RET_Y, dashed: true, dim: true, role: 'network' });

    // Named clusterIP, not dst: this chip holds the ONE address the client dials and it is true on
    // every step, while `dst` is what the ball carries, which the riding tag says and which the
    // DNAT step changes to a Pod IP. Two things called dst on screen at once, one of them stale,
    // was the contradiction here.
    const vipChip  = valChip({ x: CHIP_X[0], y: CHIP_Y, w: CHIP_W[0], h: CHIP_H, name: 'clusterIP', value: '10.96.0.20:80', role: 'network' });
    const dnatChip = valChip({ x: CHIP_X[1], y: CHIP_Y, w: CHIP_W[1], h: CHIP_H, name: 'DNAT', value: 'none', role: 'network' });
    const ctChip   = valChip({ x: CHIP_X[2], y: CHIP_Y, w: CHIP_W[2], h: CHIP_H, name: 'conntrack', value: 'none', role: 'network' });
    const backChip = valChip({ x: CHIP_X[3], y: CHIP_Y, w: CHIP_W[3], h: CHIP_H, name: 'backend', value: 'none', role: 'network' });

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
  clearHighlights(s, ['vip', 'kproxy', 'vipChip', 'dnatChip', 'ctChip', 'backChip', 'clientBox', 'podXBox', 'podYBox'], [s.refs.client, s.refs.podX, s.refs.podY]);
  s.refs.podX.style.opacity = '1';
  s.refs.podY.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
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
    narration: 'The kube-proxy watches the Service and its EndpointSlices and installs the dataplane rules: any packet whose destination is 10.96.0.20:80 should be DNAT-ed to one of the backend Pod IPs. The rules are in place before any traffic arrives.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.kproxy.classList.add('highlight');
      s.refs.dnatChip.classList.add('highlight');
      setVal(s.refs.dnatChip, '-> .2.7 / .3.9');
    },
  },
  {
    id: 'send',
    duration: 2300,
    narration: 'The client opens a connection to the ClusterIP 10.96.0.20:80. As the packet leaves the client it is caught by the kube-proxy rules on the Node before it can go anywhere, because there is no real host at that address to route to.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.vipChip.classList.add('highlight');
      setVal(s.refs.vipChip, '10.96.0.20:80');
      if (ctx.reduced) { s.refs.clientBox.classList.add('highlight'); s.refs.kproxy.classList.add('highlight'); return; }
      // Up-arrow: the client pulses first, the packet leaves at BEAT.afterPulse along the forward lane
      // and is caught at kube-proxy, which lights on arrival. The ClusterIP dst rides with the ball.
      pulsePod(s.refs.client, ctx, 0);
      const send = segmentPacket(s, ctx, { from: LANE_FWD[0], to: LANE_FWD[1], delay: BEAT.afterPulse, dur: slowDur(LANE_FWD), role: 'network' });
      ridingLabel(s, ctx, 'dst 10.96.0.20:80', LANE_FWD, { delay: BEAT.afterPulse, dur: slowDur(LANE_FWD), easing: 'linear' });
      lightBoxAt(s.refs.kproxy, ctx, send.arrivalMs);
    },
  },
  {
    id: 'dnat',
    duration: 2500,
    narration: 'The kube-proxy picks one backend and rewrites the destination to that Pod IP, here 10.244.2.7:8080. Connection tracking records the mapping so every later packet of the same flow takes the same backend. The DNAT-ed packet is then delivered to the chosen Pod.',
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
      s.refs.podY.style.opacity = String(OPACITY.notready);
      if (ctx.reduced) { s.refs.podXBox.classList.add('highlight'); return; }
      const give = routePacket(s, ctx, FAN_FWD_X, { dur: slowDur(FAN_FWD_X), role: 'network' });
      ridingLabel(s, ctx, 'dst 10.244.2.7:8080', FAN_FWD_X, { dur: slowDur(FAN_FWD_X) });
      pulsePod(s.refs.podX, ctx, give.arrivalMs);
    },
  },
  {
    id: 'reply',
    // Two-hop round trip: the motion runs ~3340ms, so this floor gives a ~460ms settle after the
    // reply lands, matching the dwell of the single-hop steps instead of snapping straight on.
    duration: 3800,
    narration: 'The Pod replies from its own IP, but conntrack reverses the translation on the way back so the source looks like 10.96.0.20 again. The client only ever sees the ClusterIP it dialed, never the Pod address it was actually served by.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.ctChip.classList.add('highlight');
      setVal(s.refs.ctChip, 'reverse NAT');
      setVal(s.refs.backChip, '10.244.2.7');
      s.refs.podY.style.opacity = String(OPACITY.notready);
      if (ctx.reduced) { s.refs.kproxy.classList.add('highlight'); s.refs.clientBox.classList.add('highlight'); return; }
      pulsePod(s.refs.podX, ctx, 0);
      const h1 = routePacket(s, ctx, FAN_RET_X, { delay: BEAT.afterPulse, dur: slowDur(FAN_RET_X), role: 'network' });
      ridingLabel(s, ctx, 'src 10.244.2.7', FAN_RET_X, { delay: BEAT.afterPulse, dur: slowDur(FAN_RET_X) });
      lightBoxAt(s.refs.kproxy, ctx, h1.arrivalMs);
      const h2 = segmentPacket(s, ctx, { from: LANE_RET[0], to: LANE_RET[1], delay: h1.arrivalMs + BEAT.afterHop, dur: slowDur(LANE_RET), role: 'network' });
      ridingLabel(s, ctx, 'src 10.96.0.20', LANE_RET, { delay: h1.arrivalMs + BEAT.afterHop, dur: slowDur(LANE_RET), easing: 'linear' });
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
      s.refs.dnatChip.classList.add('highlight');
      s.refs.ctChip.classList.add('highlight');
      s.refs.backChip.classList.add('highlight');
      setVal(s.refs.dnatChip, '-> 10.244.3.9:8080');
      setVal(s.refs.ctChip, 'two flows');
      setVal(s.refs.backChip, '10.244.3.9');
      // Mirror of flow 1: podX is not the backend this flow acts on, so dim it exactly as flow 1 dims podY.
      s.refs.podX.style.opacity = String(OPACITY.notready);
      if (ctx.reduced) { s.refs.kproxy.classList.add('highlight'); s.refs.podYBox.classList.add('highlight'); return; }
      // This step is the send and the DNAT in one, so kube-proxy lights on the client packet
      // arriving, exactly as it does on the send step, and only then picks the second backend.
      pulsePod(s.refs.client, ctx, 0);
      const send = segmentPacket(s, ctx, { from: LANE_FWD[0], to: LANE_FWD[1], delay: BEAT.afterPulse, dur: slowDur(LANE_FWD), role: 'network' });
      ridingLabel(s, ctx, 'dst 10.96.0.20:80', LANE_FWD, { delay: BEAT.afterPulse, dur: slowDur(LANE_FWD), easing: 'linear' });
      lightBoxAt(s.refs.kproxy, ctx, send.arrivalMs);
      const give = routePacket(s, ctx, FAN_FWD_Y, { delay: send.arrivalMs + BEAT.afterHop, dur: slowDur(FAN_FWD_Y), role: 'network' });
      ridingLabel(s, ctx, 'dst 10.244.3.9:8080', FAN_FWD_Y, { delay: send.arrivalMs + BEAT.afterHop, dur: slowDur(FAN_FWD_Y) });
      pulsePod(s.refs.podY, ctx, give.arrivalMs);
    },
  },
  {
    id: 'balance-reply',
    // Same two-hop round trip (~3340ms of motion): match the settle so the final step does not snap.
    duration: 3800,
    narration: 'The second backend Pod replies from its own 10.244.3.9, and conntrack reverses this second flow the same way, rewriting the source back to 10.96.0.20 before the reply reaches the client. Two Pods served two connections, and the client only ever saw the single ClusterIP.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.ctChip.classList.add('highlight');
      setVal(s.refs.ctChip, 'reverse NAT');
      setVal(s.refs.backChip, '10.244.3.9');
      // Mirror of flow 1 reply: podX is not this flow backend, so dim it as flow 1 dims podY.
      s.refs.podX.style.opacity = String(OPACITY.notready);
      if (ctx.reduced) { s.refs.kproxy.classList.add('highlight'); s.refs.clientBox.classList.add('highlight'); return; }
      pulsePod(s.refs.podY, ctx, 0);
      const h1 = routePacket(s, ctx, FAN_RET_Y, { delay: BEAT.afterPulse, dur: slowDur(FAN_RET_Y), role: 'network' });
      ridingLabel(s, ctx, 'src 10.244.3.9', FAN_RET_Y, { delay: BEAT.afterPulse, dur: slowDur(FAN_RET_Y) });
      lightBoxAt(s.refs.kproxy, ctx, h1.arrivalMs);
      const h2 = segmentPacket(s, ctx, { from: LANE_RET[0], to: LANE_RET[1], delay: h1.arrivalMs + BEAT.afterHop, dur: slowDur(LANE_RET), role: 'network' });
      ridingLabel(s, ctx, 'src 10.96.0.20', LANE_RET, { delay: h1.arrivalMs + BEAT.afterHop, dur: slowDur(LANE_RET), easing: 'linear' });
      pulsePod(s.refs.client, ctx, h2.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
