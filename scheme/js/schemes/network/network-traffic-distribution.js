import { svg, g } from '../../lib/svg.js';
import { arrowDefs, box, node, arrow, pathArrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, routePacket, routeDur, makeInit, clearHighlights, lightBoxAt, BEAT, makeRidingLabel, OPACITY } from './network-kit.js';
// Design notes for this card: scheme/docs/CARDS-network.md#network-traffic-distribution


const SCHEME_L = 60, SCHEME_R = 1140;        // content edges, mirrored about x=600
const FLOW_Y = 320;                          // central flow line

const CLIENT_X = SCHEME_L, CLIENT_W = 200, CLIENT_H = 110;
const CLIENT_OUT = [CLIENT_X + CLIENT_W, FLOW_Y];   // 260: client right edge
const KP_X = 440, KP_W = 190, KP_H = 80;
const KP_IN = [KP_X, FLOW_Y];                // kube-proxy left edge (connection arrives)
const KP = [KP_X + KP_W, FLOW_Y];            // 630: kube-proxy right edge (fan origin, after the pick)
const RAIL_X = 700;                          // shared vertical fan rail, left of the zones (740)
const ZONE_X = 740, ZONE_W = SCHEME_R - 740, ZONE_H = 240;   // 740..1140
const ZONE_A_Y = 60, ZONE_B_Y = 340;         // mirrored about FLOW_Y
const POD_W = 240, POD_H = 96;
const POD_L = ZONE_X + (ZONE_W - POD_W) / 2; // 820: Pod centred in the zone, clear of its top-left label
const POD_PAD = (ZONE_H - 2 * POD_H) / 3;    // 16: equal padding above, between and below the two Pods
// Backend Pod centre rows: zone-a stacked on top (a1, a2), zone-b below (b1, b2), symmetric about
// FLOW_Y so the fan is balanced.
const A1Y = ZONE_A_Y + POD_PAD + POD_H / 2;  // 124
const A2Y = A1Y + POD_H + POD_PAD;           // 236
const B1Y = ZONE_B_Y + POD_PAD + POD_H / 2;  // 404
const B2Y = B1Y + POD_H + POD_PAD;           // 516

// Bottom strip: two equal chips spanning the composition, so the row centres on 600 like the rest.
const CHIP_Y = 592, CHIP_H = 34, CHIP_GAP = 20;
const CHIP_W = (SCHEME_R - SCHEME_L - CHIP_GAP) / 2;   // 530
const chipX = (i) => SCHEME_L + i * (CHIP_W + CHIP_GAP);
const FAN_A1 = [KP, [RAIL_X, FLOW_Y], [RAIL_X, A1Y], [POD_L, A1Y]];
const FAN_A2 = [KP, [RAIL_X, FLOW_Y], [RAIL_X, A2Y], [POD_L, A2Y]];
const FAN_B1 = [KP, [RAIL_X, FLOW_Y], [RAIL_X, B1Y], [POD_L, B1Y]];
const FAN_B2 = [KP, [RAIL_X, FLOW_Y], [RAIL_X, B2Y], [POD_L, B2Y]];

function podBlock({ x, y, w = POD_W, h = POD_H, label, ip }) {
  const shell = podShell({ x, y, w, h, label, sublabel: ip, containers: 0, role: 'network' });
  const innerBox = box({ x: x + 18, y: y + 30, w: w - 36, h: 44, label: 'app', sublabel: 'eth0', role: 'network' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

function clientBlock({ x, y, w, h }) {
  const shell = podShell({ x, y, w, h, label: 'Client . zone-a', sublabel: '10.244.2.50', containers: 0, role: 'network' });
  const innerBox = box({ x: x + 16, y: y + 34, w: w - 32, h: 48, label: 'app', sublabel: 'to Service web', role: 'network' });
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
      'aria-label': 'Session affinity and topology-aware routing: kube-proxy spreads connections across all endpoints by default, sessionAffinity pins a client to one Pod, and trafficDistribution PreferSameZone keeps traffic in the client zone with a fallback to other zones',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = clientBlock({ x: CLIENT_X, y: FLOW_Y - CLIENT_H / 2, w: CLIENT_W, h: CLIENT_H });
    const kproxy = box({ x: KP_X, y: FLOW_Y - KP_H / 2, w: KP_W, h: KP_H, label: 'kube-proxy', sublabel: 'endpoint pick', role: 'network' });

    const zoneA = node({ x: ZONE_X, y: ZONE_A_Y, w: ZONE_W, h: ZONE_H, label: 'zone-a' });
    const zoneB = node({ x: ZONE_X, y: ZONE_B_Y, w: ZONE_W, h: ZONE_H, label: 'zone-b' });

    const a1 = podBlock({ x: POD_L, y: A1Y - POD_H / 2, label: 'Pod web', ip: '10.244.2.7' });
    const a2 = podBlock({ x: POD_L, y: A2Y - POD_H / 2, label: 'Pod web', ip: '10.244.2.8' });
    const b1 = podBlock({ x: POD_L, y: B1Y - POD_H / 2, label: 'Pod web', ip: '10.244.3.4' });
    const b2 = podBlock({ x: POD_L, y: B2Y - POD_H / 2, label: 'Pod web', ip: '10.244.3.5' });

    // Dim dashed wires: client -> kube-proxy, plus the four fan routes (no route crosses a Pod).
    const wClient = arrow({ x1: CLIENT_OUT[0], y1: CLIENT_OUT[1], x2: KP_IN[0], y2: KP_IN[1], dashed: true, dim: true });
    const fA1 = pathArrow({ points: FAN_A1, dashed: true, dim: true });
    const fA2 = pathArrow({ points: FAN_A2, dashed: true, dim: true });
    const fB1 = pathArrow({ points: FAN_B1, dashed: true, dim: true });
    const fB2 = pathArrow({ points: FAN_B2, dashed: true, dim: true });

    const modeChip = valChip({ x: chipX(0), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'distribution', value: 'unset . spread', role: 'network' });
    const pinChip = valChip({ x: chipX(1), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'session', value: 'None', role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: zones, then pods, then client + kube-proxy, then wires ABOVE, chips, packets on top.
    root.appendChild(zoneA);
    root.appendChild(zoneB);
    [a1, a2, b1, b2].forEach(p => root.appendChild(p.group));
    root.appendChild(client.group);
    root.appendChild(kproxy);
    [wClient, fA1, fA2, fB1, fB2].forEach(el => root.appendChild(el));
    [modeChip, pinChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, client: client.group, clientBox: client.innerBox, kproxy, zoneA, zoneB,
      a1: a1.group, a1Box: a1.innerBox, a2: a2.group, a2Box: a2.innerBox,
      b1: b1.group, b1Box: b1.innerBox, b2: b2.group, b2Box: b2.innerBox,
      modeChip, pinChip, packetLayer, wires: {},
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['kproxy', 'modeChip', 'pinChip', 'clientBox', 'a1Box', 'a2Box', 'b1Box', 'b2Box'],
    [s.refs.client, s.refs.a1, s.refs.a2, s.refs.b1, s.refs.b2]);
  [s.refs.a1, s.refs.a2, s.refs.b1, s.refs.b2].forEach(p => { p.style.opacity = '1'; });
}

// The client's connection arrives at kube-proxy: client pulses, a packet rides client -> kube-proxy.
// Returns the arrival ms so the fan hop can chain off it.
function clientHop(s, ctx, delay) {
  return segmentPacket(s, ctx, { from: CLIENT_OUT, to: KP_IN, delay, role: 'network' }).arrivalMs;
}
// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'network', dy: -15, inMs: 160, outMs: 200, hold: 260 });
const FAN_SLOW = 1.6;
function fanTo(s, ctx, fan, backendKey, delay, ipTag) {
  const dur = Math.round(routeDur(fan) * FAN_SLOW);
  const h = routePacket(s, ctx, fan, { delay, dur, role: 'network' });
  if (ipTag) ridingLabel(s, ctx, ipTag, fan, { delay, dur });
  pulsePod(s.refs[backendKey], ctx, h.arrivalMs);
  return h.arrivalMs;
}

const CLIENT_IP = 'src 10.244.2.50';

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.modeChip, 'unset . spread');
      setVal(s.refs.pinChip, 'None');
    },
  },
  {
    id: 'default',
    duration: 4600,
    narration: 'With both fields unset, kube-proxy spreads connections roughly evenly across every ready endpoint and ignores zones. Two connections from the same client can land on Pods in different zones, here one in zone-a and one in zone-b. Load is balanced but traffic may cross the zone boundary.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.modeChip.classList.add('highlight');
      setVal(s.refs.modeChip, 'unset . spread all');
      setVal(s.refs.pinChip, 'None');
      if (ctx.reduced) { s.refs.kproxy.classList.add('highlight'); s.refs.a1Box.classList.add('highlight'); s.refs.b2Box.classList.add('highlight'); return; }
      // TWO connections from the same client, the second staggered by the same 540 that session-affinity
      // uses, so they read as two rides rather than one ball splitting across two backends. The first
      // lands in zone-a (a1), the second in zone-b (b2), symmetric about the flow line. kube-proxy is
      // the subject of every step here, but it is still the RECEIVER of the client hop, so it lights
      // when that ball lands.
      pulsePod(s.refs.client, ctx, 0);
      const arr = clientHop(s, ctx, BEAT.afterPulse);
      lightBoxAt(s.refs.kproxy, ctx, arr);
      fanTo(s, ctx, FAN_A1, 'a1', arr + BEAT.afterHop, CLIENT_IP);
      const arr2 = clientHop(s, ctx, BEAT.afterPulse + 540);
      fanTo(s, ctx, FAN_B2, 'b2', arr2 + BEAT.afterHop, CLIENT_IP);
    },
  },
  {
    id: 'session-affinity',
    duration: 4600,
    narration: 'First lever: stickiness. Set sessionAffinity to ClientIP and the opening connection still picks a backend freely, then kube-proxy pins that client source IP to the chosen Pod, here 10.244.2.7. Every later connection from the same client returns to that one Pod, so a session stays put.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.pinChip.classList.add('highlight');
      setVal(s.refs.modeChip, 'unset . spread all');
      setVal(s.refs.pinChip, 'ClientIP . pin .2.7');
      if (ctx.reduced) { s.refs.kproxy.classList.add('highlight'); s.refs.a1Box.classList.add('highlight'); return; }
      // Two connections from the same client both land on the SAME Pod (a1, 10.244.2.7).
      pulsePod(s.refs.client, ctx, 0);
      const arr = clientHop(s, ctx, BEAT.afterPulse);
      lightBoxAt(s.refs.kproxy, ctx, arr);
      fanTo(s, ctx, FAN_A1, 'a1', arr + BEAT.afterHop, CLIENT_IP);
      fanTo(s, ctx, FAN_A1, 'a1', arr + BEAT.afterHop + 540, CLIENT_IP);
    },
  },
  {
    id: 'topology',
    duration: 4000,
    narration: 'Second lever: locality, independent of the first. Set trafficDistribution to PreferSameZone (older clusters spell it PreferClose) and kube-proxy favors endpoints in the same zone as the client. The zone-a client is routed to a zone-a Pod, keeping traffic in-zone, which cuts latency and the cross-zone data charges a cloud would bill.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.modeChip.classList.add('highlight');
      setVal(s.refs.modeChip, 'PreferSameZone . in-zone');
      setVal(s.refs.pinChip, 'None');
      s.refs.pinChip.classList.add('highlight');
      // The far zone is not preferred: dim its Pods.
      s.refs.b1.style.opacity = String(OPACITY.notready);
      s.refs.b2.style.opacity = String(OPACITY.notready);
      if (ctx.reduced) { s.refs.kproxy.classList.add('highlight'); s.refs.a1Box.classList.add('highlight'); return; }
      pulsePod(s.refs.client, ctx, 0);
      const arr = clientHop(s, ctx, BEAT.afterPulse);
      lightBoxAt(s.refs.kproxy, ctx, arr);
      fanTo(s, ctx, FAN_A1, 'a1', arr + BEAT.afterHop, CLIENT_IP);
    },
  },
  {
    id: 'fallback',
    duration: 3800,
    narration: 'PreferSameZone is a preference, not a hard rule. The field is still PreferSameZone, but if zone-a has no ready endpoint kube-proxy falls back to a Pod in another zone rather than dropping the connection, so the client still reaches zone-b. Availability wins over locality.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.modeChip.classList.add('highlight');
      setVal(s.refs.modeChip, 'PreferSameZone . fallback');
      setVal(s.refs.pinChip, 'None');
      // zone-a has no ready endpoint: dim its Pods, traffic falls back to zone-b.
      s.refs.a1.style.opacity = String(OPACITY.notready);
      s.refs.a2.style.opacity = String(OPACITY.notready);
      if (ctx.reduced) { s.refs.kproxy.classList.add('highlight'); s.refs.b1Box.classList.add('highlight'); return; }
      pulsePod(s.refs.client, ctx, 0);
      const arr = clientHop(s, ctx, BEAT.afterPulse);
      lightBoxAt(s.refs.kproxy, ctx, arr);
      fanTo(s, ctx, FAN_B1, 'b1', arr + BEAT.afterHop, CLIENT_IP);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
