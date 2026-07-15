import { svg, g, path } from '../lib/svg.js';
import { arrowDefs, box, pod, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, makeInit, clearHighlights, BEAT } from '../lib/network-kit.js';

// Headless Service (viewBox 1200x640). clusterIP None means there is no VIP hop: DNS hands back the
// backing Pod IPs and the client connects to a Pod itself. The three backends are a StatefulSet
// (web-0..web-2) so the stable per-Pod name lands.
//
// Geometry, all of it symmetric about the canvas centre line CY=320:
//   - The three Pods are a column on the right, centred on CY (web-1 sits ON it, web-0/web-2 mirror).
//   - CoreDNS is centred on CY too, so its fan to the three Pods is symmetric: a trunk out of its right
//     edge, a vertical bus at FAN_X, then a horizontal leg entering each Pod square-on at its left edge.
//   - The client sits low-left. Its DNS lane leaves the TOP of the Pod, rises, and turns into CoreDNS
//     at 90 degrees. Query and answer ride SEPARATE lanes (20px apart) so the answer never retraces the
//     query arrow.
//   - The data path leaves the client's RIGHT edge, runs under everything at y=520, and rises on its own
//     bus at DATA_X to enter a Pod square-on. It is drawn to ALL THREE Pods, because a headless client
//     may pick any of them, and every ball in this card rides one of these drawn wires.
// Content spans x 80..1120 (centre 600) so it is centred on the canvas.
//
// Narration safe-zone: every element left of x=380 sits at y>=310, so nothing can slide under the
// overlay (x<=380, y<=300). That is why the DNS lane turns at 310/330 rather than higher up.
const CY = 320;                      // canvas centre line: Pods column + CoreDNS are centred on it
const W0 = 168, W1 = CY, W2 = 472;   // backend Pod centre rows (W0/W2 mirror about CY)
const POD_X = 880;                   // backend Pods left edge
const CORE_LEFT = 430, CORE_RIGHT = 680;
const FAN_X = 760;                   // vertical bus for the CoreDNS -> Pods endpoint fan
const DATA_X = 820;                  // vertical bus for the client -> Pod direct data path
const CLIENT_TOP = 420, CLIENT_RIGHT = 290;
const DATA_Y = 520;                  // the data trunk runs below CoreDNS and the Service box

// DNS lane: up out of the client's TOP edge, then square into CoreDNS's left edge. Two lanes, 20px
// apart, so the answer comes home on its own wire instead of running back up the query arrow.
const QUERY = [[175, CLIENT_TOP], [175, 310], [CORE_LEFT, 310]];
const ANSWER = [[CORE_LEFT, 330], [195, 330], [195, CLIENT_TOP]];

// Direct data path to each backend. Same array draws the wire and flies the ball.
const toPod = (cy) => [[CLIENT_RIGHT, DATA_Y], [DATA_X, DATA_Y], [DATA_X, cy], [POD_X, cy]];
const TO_W0 = toPod(W0);
const TO_W1 = toPod(W1);
const TO_W2 = toPod(W2);

// CoreDNS endpoint fan: trunk, bus, then square-on into each Pod's left edge.
const fanTo = (cy) => [[CORE_RIGHT, CY], [FAN_X, CY], [FAN_X, cy], [POD_X, cy]];

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, cat: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 34, w: w - 40, h: 48, label: 'app', sublabel: 'eth0', cat: 'network' });
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

    const client = podBlock({ x: 80, y: CLIENT_TOP, w: 210, h: 130, label: 'Client Pod', ip: '10.244.1.5' });
    const coredns = box({ x: CORE_LEFT, y: CY - 39, w: 250, h: 78, label: 'CoreDNS', sublabel: 'kube-dns 10.96.0.10', cat: 'network' });
    const svc = box({ x: CORE_LEFT, y: 430, w: 250, h: 70, label: 'Service web', sublabel: 'clusterIP: None', cat: 'network' });

    const w0 = podBlock({ x: POD_X, y: W0 - 58, w: 240, h: 116, label: 'web-0', ip: '10.244.2.7' });
    const w1 = podBlock({ x: POD_X, y: W1 - 58, w: 240, h: 116, label: 'web-1', ip: '10.244.3.4' });
    const w2 = podBlock({ x: POD_X, y: W2 - 58, w: 240, h: 116, label: 'web-2', ip: '10.244.1.9' });

    // Service <-> CoreDNS is a plain dashed line with NO arrowhead: it is not a packet route, it is the
    // static fact that this Service backs those records. An arrowhead here would read as traffic, and no
    // ball ever rides it. Drawn as a bare path because arrow() always attaches a marker.
    const wSvc = path({
      class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim',
      d: `M 555 430 L 555 ${CY + 39}`,
      'stroke-dasharray': '5 5',
      fill: 'none',
    });
    // Endpoint fan and data fan. Both are drawn from the exact arrays their balls fly.
    const fans = [W0, W1, W2].map(cy => pathArrow({ points: fanTo(cy), dashed: true, dim: true }));
    const dataWires = [TO_W0, TO_W1, TO_W2].map(points => pathArrow({ points, dashed: true, dim: true }));
    const wQuery = pathArrow({ points: QUERY, dashed: true, dim: true });
    const wAnswer = pathArrow({ points: ANSWER, dashed: true, dim: true });

    // Three readouts, each of which always means exactly what its name says. The old card showed
    // `connect 10.244.3.4 direct` under a chip labelled `DNS answer`, which is not a DNS answer.
    //
    // Each chip sits directly UNDER the column it reports on and shares that column's exact x and width:
    // clusterIP under the client (80..290), the DNS answer under CoreDNS and the Service (430..680), the
    // connection under the Pods (880..1120). So the footer spans the diagram end to end and every chip
    // edge lines up vertically with the blocks above it.
    const vipChip = valChip({ x: 80, y: 575, w: 210, h: 34, name: 'clusterIP', value: 'None', cat: 'network' });
    const dnsChip = valChip({ x: CORE_LEFT, y: 575, w: 250, h: 34, name: 'A records', value: 'pending', cat: 'network' });
    const connChip = valChip({ x: POD_X, y: 575, w: 240, h: 34, name: 'connection', value: 'none', cat: 'network' });

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
    narration: 'The web Service is declared with clusterIP None, which makes it headless. It still selects the three StatefulSet Pods, but the cluster gives it no virtual IP at all, so there is nothing for kube-proxy to program.',
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
      const q = routePacket(s, ctx, QUERY, { delay: BEAT.afterPulse, cat: 'network' });
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
      const ans = routePacket(s, ctx, ANSWER, { cat: 'network' });
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
      const hop = routePacket(s, ctx, TO_W1, { delay: BEAT.afterPulse, cat: 'network' });
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
      const hop = routePacket(s, ctx, TO_W0, { delay: BEAT.afterPulse, cat: 'network' });
      pulsePod(s.refs.w0, ctx, hop.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
