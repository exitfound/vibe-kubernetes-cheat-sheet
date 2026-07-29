import { svg, g } from '../lib/svg.js';
import { arrowDefs, box, pod, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, makeInit, clearHighlights, relationPath, BEAT, lightBoxAt } from '../lib/network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-headless-service


const CY = 320;                      // canvas centre line: Pods column + CoreDNS are centred on it
const W0 = 168, W1 = CY, W2 = 472;   // backend Pod centre rows (W0/W2 mirror about CY)
const POD_X = 880, POD_W = 240, POD_H = 116;   // backend Pods
const CORE_LEFT = 430, CORE_RIGHT = 680, CORE_H = 78;
const CORE_CX = (CORE_LEFT + CORE_RIGHT) / 2;  // 555: the Service -> CoreDNS relationship line
const SVC_Y = 430, SVC_H = 70;
const FAN_X = 760;                   // vertical bus for the CoreDNS -> Pods endpoint fan
const DATA_X = 820;                  // vertical bus for the client -> Pod direct data path
const CHIP_Y = 575, CHIP_H = 34;
const CLIENT_X = 80, CLIENT_W = 210, CLIENT_H = 130;
const CLIENT_TOP = 420, CLIENT_RIGHT = CLIENT_X + CLIENT_W;   // 290
const CLIENT_CY = CLIENT_TOP + CLIENT_H / 2;                  // 485: the data trunk leaves here
const DATA_Y = 520;                  // the data trunk runs below CoreDNS and the Service box
// The trunk has to clear the Service box (y 430..500) on its way right, so it steps down from the
// Pod edge to DATA_Y here, in the free gap between the client and CoreDNS.
const DATA_STEP_X = 355;

// DNS lane: up out of the client's TOP edge, then square into CoreDNS's left edge. Two lanes, 20px
// apart on both faces, so the answer comes home on its own wire instead of running back up the
// query arrow. Both pairs straddle their face midpoint (the Pod centre, and CY at CoreDNS).
const LANE_DX = 10, LANE_DY = 10;
const CLIENT_CX = CLIENT_X + CLIENT_W / 2;   // 185
const QUERY = [[CLIENT_CX - LANE_DX, CLIENT_TOP], [CLIENT_CX - LANE_DX, CY - LANE_DY], [CORE_LEFT, CY - LANE_DY]];
const ANSWER = [[CORE_LEFT, CY + LANE_DY], [CLIENT_CX + LANE_DX, CY + LANE_DY], [CLIENT_CX + LANE_DX, CLIENT_TOP]];

// Direct data path to each backend, leaving the Pod at the middle of its right edge. Same array
// draws the wire and flies the ball.
const toPod = (cy) => [[CLIENT_RIGHT, CLIENT_CY], [DATA_STEP_X, CLIENT_CY], [DATA_STEP_X, DATA_Y], [DATA_X, DATA_Y], [DATA_X, cy], [POD_X, cy]];
const TO_W0 = toPod(W0);
const TO_W1 = toPod(W1);
const TO_W2 = toPod(W2);

// CoreDNS endpoint fan: trunk, bus, then square-on into each Pod's left edge.
const fanTo = (cy) => [[CORE_RIGHT, CY], [FAN_X, CY], [FAN_X, cy], [POD_X, cy]];

function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, role: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 34, w: w - 40, h: 48, label: 'app', sublabel: 'eth0', role: 'network' });
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
      'aria-label': 'Headless Service: with clusterIP None there is no virtual IP, so DNS returns one A record per ready backing Pod and the client connects to a Pod itself, and a StatefulSet gives each Pod its own stable name',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = podBlock({ x: CLIENT_X, y: CLIENT_TOP, w: CLIENT_W, h: CLIENT_H, label: 'Client Pod', ip: '10.244.1.5' });
    const coredns = box({ x: CORE_LEFT, y: CY - CORE_H / 2, w: CORE_RIGHT - CORE_LEFT, h: CORE_H, label: 'CoreDNS', sublabel: 'kube-dns 10.96.0.10', role: 'network' });
    const svc = box({ x: CORE_LEFT, y: SVC_Y, w: CORE_RIGHT - CORE_LEFT, h: SVC_H, label: 'Service web', sublabel: 'clusterIP: None', role: 'network' });

    const w0 = podBlock({ x: POD_X, y: W0 - POD_H / 2, w: POD_W, h: POD_H, label: 'web-0', ip: '10.244.2.7' });
    const w1 = podBlock({ x: POD_X, y: W1 - POD_H / 2, w: POD_W, h: POD_H, label: 'web-1', ip: '10.244.3.4' });
    const w2 = podBlock({ x: POD_X, y: W2 - POD_H / 2, w: POD_W, h: POD_H, label: 'web-2', ip: '10.244.1.9' });

    const wSvc = relationPath({ points: [[CORE_CX, SVC_Y], [CORE_CX, CY + CORE_H / 2]], dash: '5 5' });
    // Endpoint fan and data fan. Both are drawn from the exact arrays their balls fly.
    const fans = [W0, W1, W2].map(cy => pathArrow({ points: fanTo(cy), dashed: true, dim: true }));
    const dataWires = [TO_W0, TO_W1, TO_W2].map(points => pathArrow({ points, dashed: true, dim: true }));
    const wQuery = pathArrow({ points: QUERY, dashed: true, dim: true });
    const wAnswer = pathArrow({ points: ANSWER, dashed: true, dim: true });

    const vipChip = valChip({ x: CLIENT_X, y: CHIP_Y, w: CLIENT_W, h: CHIP_H, name: 'clusterIP', value: 'None', role: 'network' });
    const dnsChip = valChip({ x: CORE_LEFT, y: CHIP_Y, w: CORE_RIGHT - CORE_LEFT, h: CHIP_H, name: 'A records', value: 'pending', role: 'network' });
    const connChip = valChip({ x: POD_X, y: CHIP_Y, w: POD_W, h: CHIP_H, name: 'connection', value: 'none', role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: boxes/pods, then wires ABOVE them, then chips, then packets on top.
    root.appendChild(coredns);
    root.appendChild(svc);
    root.appendChild(client.group);
    [w0, w1, w2].forEach(p => root.appendChild(p.group));
    [wSvc, ...fans, ...dataWires, wQuery, wAnswer].forEach(el => root.appendChild(el));
    [vipChip, dnsChip, connChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, coredns, svc,
      client: client.group, clientBox: client.innerBox,
      w0: w0.group, w0Box: w0.innerBox, w1: w1.group, w1Box: w1.innerBox, w2: w2.group, w2Box: w2.innerBox,
      vipChip, dnsChip, connChip, packetLayer, wires: {},
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['coredns', 'svc', 'vipChip', 'dnsChip', 'connChip', 'clientBox', 'w0Box', 'w1Box', 'w2Box'],
    [s.refs.client, s.refs.w0, s.refs.w1, s.refs.w2]);
}

// Every step repaints all three readouts, so no value can survive from the previous step.
function setChips(s, { vip, dns, conn }, lit = []) {
  setVal(s.refs.vipChip, vip);
  setVal(s.refs.dnsChip, dns);
  setVal(s.refs.connChip, conn);
  lit.forEach(k => s.refs[k].classList.add('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setChips(s, { vip: 'None', dns: 'pending', conn: 'none' });
    },
  },
  {
    id: 'query',
    duration: 2600,
    narration: 'The client looks up the Service by name, web.default.svc.cluster.local. Because there is no ClusterIP, the answer cannot be a single virtual address, so this query has to resolve to the Pods themselves.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.svc.classList.add('highlight');
      setChips(s, { vip: 'None', dns: 'pending', conn: 'none' }, ['vipChip']);
      if (ctx.reduced) { s.refs.coredns.classList.add('highlight'); return; }
      // Up-arrow: the client pulses first, the query leaves at BEAT.afterPulse and lands at CoreDNS,
      // which lights on arrival.
      pulsePod(s.refs.client, ctx, 0);
      const q = routePacket(s, ctx, QUERY, { delay: BEAT.afterPulse, role: 'network' });
      lightBoxAt(s.refs.coredns, ctx, q.arrivalMs);
    },
  },
  {
    id: 'answer-all',
    duration: 3000,
    narration: 'CoreDNS reads the ready endpoints and returns one A record for every backing Pod, three addresses in this answer rather than a single VIP. The client receives the whole set of Pod IPs and picks one itself, which is why a headless Service does no load balancing of its own.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.coredns.classList.add('highlight');
      s.refs.w0Box.classList.add('highlight');
      s.refs.w1Box.classList.add('highlight');
      s.refs.w2Box.classList.add('highlight');
      setChips(s, { vip: 'None', dns: '.2.7 .3.4 .1.9', conn: 'none' }, ['dnsChip']);
      if (ctx.reduced) { s.refs.clientBox.classList.add('highlight'); return; }
      // Down-arrow: the answer comes home on its OWN lane and the client pulses on arrival.
      const ans = routePacket(s, ctx, ANSWER, { role: 'network' });
      pulsePod(s.refs.client, ctx, ans.arrivalMs);
    },
  },
  {
    id: 'direct',
    duration: 3600,
    narration: 'The client opens the connection straight to one of those Pod IPs, here web-1 at 10.244.3.4. There is no ClusterIP in the path and kube-proxy does no DNAT, so the traffic goes directly Pod to Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setChips(s, { vip: 'None', dns: '.2.7 .3.4 .1.9', conn: '10.244.3.4' }, ['connChip']);
      if (ctx.reduced) { s.refs.w1Box.classList.add('highlight'); return; }
      // Up-arrow: client pulses first, the connection leaves and the chosen Pod pulses on arrival.
      pulsePod(s.refs.client, ctx, 0);
      const hop = routePacket(s, ctx, TO_W1, { delay: BEAT.afterPulse, role: 'network' });
      pulsePod(s.refs.w1, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'stable-name',
    // The route to web-0 is the longest on the card (it climbs the full column), so its ball runs
    // ~3.8s. The step must outlast its own motion or auto-advance clips the ball in mid-flight.
    duration: 4200,
    narration: 'A headless Service also gives each StatefulSet Pod its own stable name, so web-0.web.default.svc.cluster.local resolves to that one Pod and nothing else. That is how a client addresses one specific replica, which is what stateful systems with a known primary depend on.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setChips(s, { vip: 'None', dns: 'web-0 only: .2.7', conn: '10.244.2.7' }, ['dnsChip', 'connChip']);
      if (ctx.reduced) { s.refs.w0Box.classList.add('highlight'); return; }
      pulsePod(s.refs.client, ctx, 0);
      const hop = routePacket(s, ctx, TO_W0, { delay: BEAT.afterPulse, role: 'network' });
      pulsePod(s.refs.w0, ctx, hop.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
