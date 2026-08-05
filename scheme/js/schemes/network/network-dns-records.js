import { svg, g } from '../../lib/svg.js';
import { arrowDefs, box, pod, arrow, pathArrow, chainList, setChainActive } from '../../lib/primitives.js';
import { valChip, setVal, setBoxLabel, setBoxSublabel, pulsePod, routePacket, segmentPacket, makeInit, clearHighlights, BEAT, lightBoxAt } from '../../lib/network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-dns-records


// Geometry. Panel measured 2026-07-27: right <= 397, bottom <= 330, so the query row and the FQDN
// band both hang below that bottom and only the record ladder, which is far right of 397, sits
// beside the panel. A longer narration invalidates the measured bottom.
const CONTENT_L = 80, CONTENT_R = 1120;

const FLOW_Y = 400;                       // client + CoreDNS centre line
const CLIENT_X = CONTENT_L, CLIENT_W = 210, CLIENT_H = 130;
const CLIENT_EDGE = CLIENT_X + CLIENT_W;  // 290: client Pod shell right edge
const CD_W = 230, CD_H = 96;
const CD_LEFT = 420, CD_RIGHT = CD_LEFT + CD_W;   // CoreDNS box left/right edges

// The record ladder owns the free top-right band, so the four answers climb into it.
const PANEL_X = 710, PANEL_W = 410;       // record ladder: 710..1120
const ROWS_Y = 56, ROW_H = 54, ROW_GAP = 8;
const ROWS = [0, 1, 2, 3].map(i => ROWS_Y + i * (ROW_H + ROW_GAP) + ROW_H / 2);   // 83 145 207 269
const FAN_X = 680;                        // vertical bus the four answer wires branch on
// The client leg is a PAIR: the question goes out above the flow line and the answer comes home below
// it, mirrored on both faces. Every record step says the CLIENT gets the record ("Ask for the name
// itself and you get an A record"), and until 2026-07-30 the only answer drawn went up into the record
// ladder, which is the record being displayed rather than anything reaching the asker.
const LANE_DY = 12;
const Q_OUT_Y = FLOW_Y - LANE_DY;         // 388
const Q_BACK_Y = FLOW_Y + LANE_DY;        // 412
const QUERY = [[CLIENT_EDGE, Q_OUT_Y], [CD_LEFT, Q_OUT_Y]];
const REPLY = [[CD_LEFT, Q_BACK_Y], [CLIENT_EDGE, Q_BACK_Y]];
const ANS = ROWS.map(cy => [[CD_RIGHT, FLOW_Y], [FAN_X, FLOW_Y], [FAN_X, cy], [PANEL_X, cy]]);

// FQDN band: the four name segments keep their relative widths (156:116:76:100, each sized by its
// own text) and are stretched to span CD_LEFT..CONTENT_R, which is what puts the content bbox on
// x=600 without a frame to lean on.
const SEG_Y = 490, SEG_H = 64;
const SEGS = [
  { key: 'seg1', x: CD_LEFT, w: 237 },
  { key: 'seg2', x: 663, w: 177 },
  { key: 'seg3', x: 846, w: 116 },
  { key: 'seg4', x: 968, w: 152 },
];

const CHIP_Y = 578, CHIP_H = 34;
const Q_CHIP_W = 660;                     // the question chip carries the longest SRV name
const ANS_CHIP_W = 250, ANS_CHIP_X = CONTENT_R - ANS_CHIP_W;   // 870
// The third segment is called `subdomain`, not `kind`: in Kubernetes `kind` already means the object
// kind (Pod, Service), whereas svc and pod here are the two DNS subdomains under the cluster domain.
const NAME_SVC      = [['web', 'service'], ['default', 'namespace'], ['svc', 'subdomain'], ['cluster.local', 'cluster domain']];
const NAME_SRV      = [['_http._tcp.web', 'port and protocol'], ['default', 'namespace'], ['svc', 'subdomain'], ['cluster.local', 'cluster domain']];
const NAME_HEADLESS = [['web', 'headless service'], ['default', 'namespace'], ['svc', 'subdomain'], ['cluster.local', 'cluster domain']];
const NAME_POD      = [['10-244-2-7', 'pod address'], ['default', 'namespace'], ['pod', 'subdomain'], ['cluster.local', 'cluster domain']];

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Kubernetes DNS records: a Service name is a fully qualified name made of Service, namespace, svc and the cluster domain, and CoreDNS answers it with an A record to the ClusterIP, an SRV record for ports, multiple A records for a headless Service, or a per-Pod record',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Client Pod (h 130) and CoreDNS (h 96) are both centred on FLOW_Y, so the query lane is straight.
    const client = clientBlock({ x: CLIENT_X, y: FLOW_Y - CLIENT_H / 2, w: CLIENT_W, h: CLIENT_H });
    const coredns = box({ x: CD_LEFT, y: FLOW_Y - CD_H / 2, w: CD_W, h: CD_H, label: 'CoreDNS', sublabel: 'kubernetes plugin', role: 'network' });

    // FQDN band: the four segments of the name being asked. Built in the service form, rewritten per step.
    const segs = SEGS.map((spec, i) => box({
      x: spec.x, y: SEG_Y, w: spec.w, h: SEG_H,
      label: NAME_SVC[i][0], sublabel: NAME_SVC[i][1], role: 'network',
    }));
    const [seg1, seg2, seg3, seg4] = segs;

    const records = chainList({
      x: PANEL_X, y: ROWS_Y, w: PANEL_W, rowH: ROW_H, gap: ROW_GAP, role: 'network',
      items: [
        'A: web.default.svc -> 10.96.0.20',
        'SRV: _http._tcp.web -> :80',
        'Headless A: -> .2.7 .3.4 .1.9',
        'Pod A: 10-244-2-7.default.pod',
      ],
    });

    // Dim dashed wires: the straight query lane client -> CoreDNS, then ONE wire per record row so
    // every answer ball has a line under it. Each wire is drawn from the same array the ball rides.
    const wQuery = arrow({ x1: QUERY[0][0], y1: QUERY[0][1], x2: QUERY[1][0], y2: QUERY[1][1], dashed: true, dim: true, role: 'network' });
    const wReply = arrow({ x1: REPLY[0][0], y1: REPLY[0][1], x2: REPLY[1][0], y2: REPLY[1][1], dashed: true, dim: true, role: 'network' });
    const wAns = ANS.map(points => pathArrow({ points, dashed: true, dim: true }));

    const qChip = valChip({ x: CONTENT_L, y: CHIP_Y, w: Q_CHIP_W, h: CHIP_H, name: 'question', value: '-', role: 'network' });
    const ansChip = valChip({ x: ANS_CHIP_X, y: CHIP_Y, w: ANS_CHIP_W, h: CHIP_H, name: 'answers', value: '-', role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: anatomy + coredns + client + ladder, then wires ABOVE, then chips, then packets.
    [seg1, seg2, seg3, seg4, coredns, client.group, records].forEach(el => root.appendChild(el));
    [wQuery, wReply, ...wAns].forEach(el => root.appendChild(el));
    [qChip, ansChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, coredns, seg1, seg2, seg3, seg4, records,
      client: client.group, clientBox: client.innerBox,
      qChip, ansChip, packetLayer, wires: {},
    };
  }

  reset() { this.build(); }
}

function clientBlock({ x, y, w, h }) {
  const shell = pod({ x, y, w, h, label: 'Client Pod', sublabel: '10.244.1.5', containers: 0, role: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 36, w: w - 40, h: 50, label: 'Resolver', sublabel: 'getaddrinfo', role: 'network' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

function clearHL(s) {
  clearHighlights(s, ['coredns', 'seg1', 'seg2', 'seg3', 'seg4', 'qChip', 'ansChip', 'clientBox'], [s.refs.client]);
  setChainActive(s.refs.records, -1);
}

// Rewrite the FQDN band to the name this step actually asks for, and light it. Blocks light, they never
// flash or pulse: the interest here is that the TEXT changes between steps, not that the box blinks.
function askName(s, parts, { light = true } = {}) {
  ['seg1', 'seg2', 'seg3', 'seg4'].forEach((key, i) => {
    const el = s.refs[key];
    setBoxLabel(el, parts[i][0]);
    setBoxSublabel(el, parts[i][1]);
    if (light) el.classList.add('highlight');
  });
}

function resolve(s, ctx, rowIdx) {
  s.refs.qChip.classList.add('highlight');
  s.refs.ansChip.classList.add('highlight');
  if (ctx.reduced) { s.refs.coredns.classList.add('highlight'); setChainActive(s.refs.records, rowIdx); return; }
  pulsePod(s.refs.client, ctx, 0);
  const q = segmentPacket(s, ctx, { from: QUERY[0], to: QUERY[1], delay: BEAT.afterPulse, role: 'network' });
  // CoreDNS is the answering infra: it lights on query arrival, then the answer leaves for its row.
  lightBoxAt(s.refs.coredns, ctx, q.arrivalMs);
  const ans = routePacket(s, ctx, ANS[rowIdx], { delay: q.arrivalMs + BEAT.afterHop, role: 'network' });
  // Empty keyframes: a timer must name no property, or the browser composites CoreDNS on its own
  // layer for the whole flight and its fill shifts tone. Reasoning at lightBoxAt in scheme-kit.js.
  const row = s.refs.coredns.animate([], { duration: 1, delay: ans.arrivalMs });
  row.onfinish = () => setChainActive(s.refs.records, rowIdx);
  ctx.register(row);
  // The record lights in the ladder, and THEN the same answer goes home: every step on this card says
  // the client is what gets the record, and the ladder is the record being displayed rather than
  // anything arriving at the asker.
  const reply = segmentPacket(s, ctx, { from: REPLY[0], to: REPLY[1], delay: ans.arrivalMs + BEAT.afterHop, role: 'network' });
  pulsePod(s.refs.client, ctx, reply.arrivalMs);
  return reply;
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      askName(s, NAME_SVC, { light: false });
      setVal(s.refs.qChip, '-');
      setVal(s.refs.ansChip, '-');
    },
  },
  {
    id: 'fqdn',
    duration: 2500,
    narration: 'The full name is web.default.svc.cluster.local: the Service, its namespace, the literal svc, then the cluster domain. A Pod resolv.conf carries search domains and ndots:5, so a short name like web is expanded to this fully qualified form before it leaves the Pod. Every record below is a variation on these four segments.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      askName(s, NAME_SVC);
      setVal(s.refs.qChip, 'web expands to web.default.svc.cluster.local');
      setVal(s.refs.ansChip, '-');
      s.refs.qChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.clientBox.classList.add('highlight'); return; }
      // No packet yet: the expansion happens inside the Pod resolver, so the Pod is what moves. The
      // band lights but does not blink, since a blinking block would read as traffic that is not there.
      pulsePod(s.refs.client, ctx, 0);
    },
  },
  {
    id: 'a-record',
    // Motion: the query out, the record up into the ladder, then the answer home to the
    // client and its arrival pulse, ending at ~4100.
    duration: 4400,
    narration: 'Ask for the name itself and you get an A record, or AAAA on IPv6, pointing at the Service ClusterIP, 10.96.0.20. This is the common case: a name in, the stable virtual IP out, which kube-proxy then load-balances to a Pod. Note that this is the web Service address, not 10.96.0.10, which is the kube-dns ClusterIP the query was sent to.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      askName(s, NAME_SVC);
      setVal(s.refs.qChip, 'web.default.svc.cluster.local  IN A');
      setVal(s.refs.ansChip, '1 record');
      resolve(s, ctx, 0);
    },
  },
  {
    id: 'srv-record',
    // Motion: the query out, the record up into the ladder, then the answer home to the
    // client and its arrival pulse, ending at ~4100.
    duration: 4400,
    narration: 'A named port also publishes an SRV record. The name grows a prefix, _http._tcp, naming the port and the protocol, and the answer carries the port number and the target host. It lets a client discover which port a Service exposes without that port being hard-coded anywhere.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      askName(s, NAME_SRV);
      setVal(s.refs.qChip, '_http._tcp.web.default.svc.cluster.local  IN SRV');
      setVal(s.refs.ansChip, '1 record');
      resolve(s, ctx, 1);
    },
  },
  {
    id: 'headless-record',
    // Motion: the query out, the record up into the ladder, then the answer home to the
    // client and its arrival pulse, ending at ~4100.
    duration: 4400,
    narration: 'If the Service is headless, the name does not change at all: the client asks exactly what it asked for the A record. What changes is the answer, one A record per ready Pod instead of a single virtual IP, here three of them, and the client chooses an endpoint itself.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      askName(s, NAME_HEADLESS);
      setVal(s.refs.qChip, 'web.default.svc.cluster.local  IN A');
      setVal(s.refs.ansChip, '3 records');
      resolve(s, ctx, 2);
    },
  },
  {
    id: 'pod-record',
    // Motion: the query out, the record up into the ladder, then the answer home to the
    // client and its arrival pulse, ending at ~4100.
    duration: 4400,
    narration: 'Finally a Pod can be addressed directly, and here the name changes twice: the Pod IP written with dashes takes the place of the Service, and the subdomain flips from svc to pod. CoreDNS only serves this when the kubernetes plugin has pods enabled, which kubeadm sets to insecure by default, and in that mode it reads the address straight back out of the name without checking that such a Pod exists. The stable way to reach one specific replica is a StatefulSet Pod hostname under a headless Service.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      askName(s, NAME_POD);
      setVal(s.refs.qChip, '10-244-2-7.default.pod.cluster.local  IN A');
      setVal(s.refs.ansChip, '1 record');
      resolve(s, ctx, 3);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
