import { svg, g } from '../lib/svg.js';
import { arrowDefs, box, pod, node, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, makeInit, clearHighlights, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): the top-left band (x<=380, y<=300) is reserved for the
// narration overlay, so the client and its chips sit low-left and the two zones sit at x>=680. The
// client is in zone-a, kube-proxy fans to backends in zone-a (top) and zone-b (bottom), and the
// steps change which backend the same client lands on.
// Standard contract: only Pods pulse, boxes light via .highlight, the fan routes are shared by the
// static wires and the moving packets.
const KP = [580, 355];                    // kube-proxy right-edge anchor
const A1 = 225, A2 = 225, B1 = 475, B2 = 475;   // backend Pod centre rows (zone-a top, zone-b bottom)
const TO_A1 = [[KP[0], KP[1]], [636, KP[1]], [636, A1], [720, A1]];
const TO_B1 = [[KP[0], KP[1]], [636, KP[1]], [636, B1], [720, B1]];
const TO_B2 = [[KP[0], KP[1]], [660, KP[1]], [660, B2], [920, B2]];

function podBlock({ x, y, label, ip }) {
  const shell = pod({ x, y, w: 180, h: 110, label, sublabel: ip, containers: 0, cat: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 16, y: y + 32, w: 148, h: 46, label: 'app', sublabel: 'eth0', cat: 'network' });
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
      'aria-label': 'Session affinity and topology-aware routing: kube-proxy spreads connections across all endpoints by default, sessionAffinity pins a client to one Pod, and trafficDistribution PreferClose keeps traffic in the client zone with a fallback to other zones',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = clientBlock({ x: 80, y: 300, w: 200, h: 120 });
    const kproxy = box({ x: 380, y: 310, w: 200, h: 90, label: 'kube-proxy', sublabel: 'endpoint pick', cat: 'network' });

    const zoneA = node({ x: 680, y: 130, w: 440, h: 190, label: 'zone-a' });
    const zoneB = node({ x: 680, y: 380, w: 440, h: 190, label: 'zone-b' });

    const a1 = podBlock({ x: 720, y: 170, label: 'Pod web', ip: '10.244.2.7' });
    const a2 = podBlock({ x: 920, y: 170, label: 'Pod web', ip: '10.244.2.8' });
    const b1 = podBlock({ x: 720, y: 420, label: 'Pod web', ip: '10.244.3.4' });
    const b2 = podBlock({ x: 920, y: 420, label: 'Pod web', ip: '10.244.3.5' });

    // Dim dashed wires: client -> kube-proxy, plus the four fan routes to each backend.
    const wClient = arrow({ x1: 280, y1: 360, x2: 380, y2: 355, dashed: true, dim: true });
    const fA1 = pathArrow({ points: TO_A1, dashed: true, dim: true });
    const fA2 = pathArrow({ points: [[KP[0], KP[1]], [660, KP[1]], [660, A2], [920, A2]], dashed: true, dim: true });
    const fB1 = pathArrow({ points: TO_B1, dashed: true, dim: true });
    const fB2 = pathArrow({ points: TO_B2, dashed: true, dim: true });

    const modeChip = valChip({ x: 80, y: 472, w: 270, h: 34, name: 'distribution', value: 'default spread', cat: 'network' });
    const pinChip = valChip({ x: 80, y: 520, w: 270, h: 34, name: 'session', value: 'none', cat: 'network' });

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

function clientBlock({ x, y, w, h }) {
  const shell = pod({ x, y, w, h, label: 'client . zone-a', sublabel: '10.244.2.50', containers: 0, cat: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 16, y: y + 34, w: w - 32, h: 48, label: 'app', sublabel: 'to Service web', cat: 'network' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

function clearHL(s) {
  clearHighlights(s, ['kproxy', 'modeChip', 'pinChip', 'clientBox', 'a1Box', 'a2Box', 'b1Box', 'b2Box'],
    [s.refs.client, s.refs.a1, s.refs.a2, s.refs.b1, s.refs.b2]);
  [s.refs.a1, s.refs.a2, s.refs.b1, s.refs.b2].forEach(p => { p.style.opacity = '1'; });
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'The web Service has four ready Pods, two in zone-a and two in zone-b, and the client lives in zone-a. How kube-proxy chooses among those backends depends on two Service settings.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.modeChip, 'default spread');
      setVal(s.refs.pinChip, 'none');
    },
  },
  {
    id: 'default',
    duration: 2600,
    narration: 'By default kube-proxy spreads connections roughly evenly across every ready endpoint, ignoring zones. Two connections from this client can land on Pods in different zones, which balances load but can cross the zone boundary.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.kproxy.classList.add('highlight');
      setVal(s.refs.modeChip, 'spread: all endpoints');
      if (ctx.reduced) { s.refs.a1Box.classList.add('highlight'); s.refs.b2Box.classList.add('highlight'); return; }
      // Two connections fan to two different zones. Client pulses first, both land and pulse.
      pulsePod(s.refs.client, ctx, 0);
      const h1 = routePacket(s, ctx, TO_A1, { delay: BEAT.afterPulse, cat: 'network' });
      const h2 = routePacket(s, ctx, TO_B2, { delay: BEAT.afterPulse, cat: 'network' });
      pulsePod(s.refs.a1, ctx, h1.arrivalMs);
      pulsePod(s.refs.b2, ctx, h2.arrivalMs);
    },
  },
  {
    id: 'session-affinity',
    duration: 2700,
    narration: 'Set sessionAffinity to ClientIP and the first packet picks a backend, then connection tracking pins that client to the same Pod. Every later connection from the same source IP is sent to that one Pod, here 10.244.2.7, so a session stays put.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.kproxy.classList.add('highlight');
      s.refs.pinChip.classList.add('highlight');
      setVal(s.refs.modeChip, 'spread: all endpoints');
      setVal(s.refs.pinChip, 'ClientIP -> .2.7');
      if (ctx.reduced) { s.refs.a1Box.classList.add('highlight'); return; }
      // Two sequential connections from the same client both land on the SAME Pod.
      pulsePod(s.refs.client, ctx, 0);
      const h1 = routePacket(s, ctx, TO_A1, { delay: BEAT.afterPulse, cat: 'network' });
      const h2 = routePacket(s, ctx, TO_A1, { delay: h1.arrivalMs + BEAT.afterHop, cat: 'network' });
      pulsePod(s.refs.a1, ctx, h2.arrivalMs);
    },
  },
  {
    id: 'topology',
    duration: 2600,
    narration: 'With trafficDistribution set to PreferClose, kube-proxy favours endpoints in the client own zone. The zone-a client is routed to a zone-a Pod, which keeps the traffic in-zone, cutting latency and the cross-zone data charges a cloud would bill.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.kproxy.classList.add('highlight');
      setVal(s.refs.modeChip, 'PreferClose: same zone');
      s.refs.b1.style.opacity = '0.4';
      s.refs.b2.style.opacity = '0.4';
      if (ctx.reduced) { s.refs.a1Box.classList.add('highlight'); return; }
      pulsePod(s.refs.client, ctx, 0);
      const hop = routePacket(s, ctx, TO_A1, { delay: BEAT.afterPulse, cat: 'network' });
      pulsePod(s.refs.a1, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'fallback',
    duration: 2700,
    narration: 'PreferClose is a preference, not a hard rule. If zone-a has no ready endpoint, kube-proxy falls back to Pods in other zones rather than dropping the traffic, so the client still reaches zone-b. Availability wins over locality.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.kproxy.classList.add('highlight');
      setVal(s.refs.modeChip, 'fallback: other zones');
      s.refs.a1.style.opacity = '0.4';
      s.refs.a2.style.opacity = '0.4';
      if (ctx.reduced) { s.refs.b1Box.classList.add('highlight'); return; }
      pulsePod(s.refs.client, ctx, 0);
      const hop = routePacket(s, ctx, TO_B1, { delay: BEAT.afterPulse, cat: 'network' });
      pulsePod(s.refs.b1, ctx, hop.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
