import { svg, g } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow, pathArrow, chainList, setChainActive } from '../lib/primitives.js';
import { valChip, setVal, setBoxLabel, setBoxSublabel, pulsePod, routePacket, segmentPacket, makeInit, clearHighlights, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): the top-left band (x<=380, y<=300) is reserved for the narration
// overlay, so the flow line sits below it and the FQDN anatomy band is lifted clear above everything.
//
// Everything hangs off ONE horizontal flow line (FLOW_Y). The client Pod and CoreDNS are centred on
// it, so the query is a single straight hop with no jog, and the four-row record ladder is centred on
// it too: with 4 rows of 54 + 8 gaps the ladder spans 300..540, whose middle is exactly FLOW_Y. So the
// two inner rows sit just above/below the line and the two outer rows mirror them, and the answer fan
// is symmetric about CoreDNS.
//
// Each record row is reached by its OWN dashed wire: a trunk out of the CoreDNS right edge, a vertical
// bus at FAN_X, then a horizontal leg entering the row square-on at its left edge (the same fan idiom
// as network-service-clusterip). The four wires share the trunk and diverge at the bus. The answer ball
// rides ANS[i], the exact same array that drew wire i, so a ball is never travelling over blank canvas.
// Standard contract: only the client Pod pulses, boxes/ladder light via .highlight.
const FLOW_Y = 380;                       // client + CoreDNS centre line, and the ladder centre
const CD_LEFT = 400, CD_RIGHT = 630;      // CoreDNS box left/right edges
const CLIENT_EDGE = 290;                  // client Pod shell right edge
const PANEL_X = 760;                      // record ladder left edge
const FAN_X = 700;                        // vertical bus the four answer wires branch on
const ROWS = [287, 349, 411, 473];        // record ladder row centres (symmetric about FLOW_Y)
const QUERY = [[CLIENT_EDGE, FLOW_Y], [CD_LEFT, FLOW_Y]];
const ANS = ROWS.map(cy => [[CD_RIGHT, FLOW_Y], [FAN_X, FLOW_Y], [FAN_X, cy], [PANEL_X, cy]]);

// The FQDN band is NOT decoration and NOT a one-step cameo: it is the live query name, and it MUTATES
// per step, because the whole point of the card is that a different record kind is a different name.
// SRV prefixes the name with _port._proto, a Pod record swaps the service label for the dashed Pod
// address AND swaps the kind from svc to pod, while headless asks the exact same name as A (that is
// the lesson: same name, three answers instead of one). Segments light statically and never flash.
// Band spans 392..858, centred on x=625, which is the centre of the whole lower row (client left edge
// 80 to ladder right edge 1170), so it sits square above the three groups below it. It cannot reach
// further left than ~390: at this height it would collide with the narration overlay (x<=380, y<=300).
const SEG_Y = 140;
const SEGS = [
  { key: 'seg1', x: 392, w: 156 },
  { key: 'seg2', x: 554, w: 116 },
  { key: 'seg3', x: 676, w: 76 },
  { key: 'seg4', x: 758, w: 100 },
];
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
      'aria-label': 'Kubernetes DNS records: a Service name is a fully qualified name made of service, namespace, svc and the cluster domain, and CoreDNS answers it with an A record to the ClusterIP, an SRV record for ports, multiple A records for a headless Service, or a per-Pod record',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Client Pod (h 130) and CoreDNS (h 96) are both centred on FLOW_Y, so the query lane is straight.
    const client = clientBlock({ x: 80, y: FLOW_Y - 65, w: 210, h: 130 });
    const coredns = box({ x: CD_LEFT, y: FLOW_Y - 48, w: 230, h: 96, label: 'CoreDNS', sublabel: 'kubernetes plugin', cat: 'network' });

    // FQDN band: the four segments of the name being asked. Built in the service form, rewritten per step.
    const segs = SEGS.map((spec, i) => box({
      x: spec.x, y: SEG_Y, w: spec.w, h: 64,
      label: NAME_SVC[i][0], sublabel: NAME_SVC[i][1], cat: 'network',
    }));
    const [seg1, seg2, seg3, seg4] = segs;

    const records = chainList({
      x: PANEL_X, y: FLOW_Y - 120, w: 410, rowH: 54, gap: 8, cat: 'network',
      items: [
        'A: web.default.svc -> 10.96.0.20',
        'SRV: _http._tcp.web -> :80',
        'Headless A: -> .2.7 .3.4 .1.9',
        'Pod A: 10-244-2-7.default.pod',
      ],
    });

    // Dim dashed wires: the straight query lane client -> CoreDNS, then ONE wire per record row so
    // every answer ball has a line under it. Each wire is drawn from the same array the ball rides.
    const wQuery = arrow({ x1: CLIENT_EDGE, y1: FLOW_Y, x2: CD_LEFT, y2: FLOW_Y, dashed: true, dim: true, color: 'network' });
    const wAns = ANS.map(points => pathArrow({ points, dashed: true, dim: true }));

    // The two readouts are the DNS exchange itself, and neither repeats what the band or ladder says:
    // the QUESTION is the exact qname plus type the resolver puts on the wire, and ANSWERS is how many
    // records come back. That count is the whole difference between a normal and a headless Service
    // (1 record vs one per ready Pod), which nothing else on the diagram states.
    const qChip = valChip({ x: 80, y: 560, w: 660, h: 34, name: 'question', value: '-', cat: 'network' });
    const ansChip = valChip({ x: PANEL_X, y: 560, w: 250, h: 34, name: 'answers', value: '-', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: anatomy + coredns + client + ladder, then wires ABOVE, then chips, then packets.
    [seg1, seg2, seg3, seg4, coredns, client.group, records].forEach(el => root.appendChild(el));
    [wQuery, ...wAns].forEach(el => root.appendChild(el));
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
  const shell = pod({ x, y, w, h, label: 'Client Pod', sublabel: '10.244.1.5', containers: 0, cat: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 36, w: w - 40, h: 50, label: 'resolver', sublabel: 'getaddrinfo', cat: 'network' });
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

// Light an infrastructure box on packet ARRIVAL rather than at step entry, without pulsing it.
function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// Resolve one record kind: pulse the client, run the query straight along the flow line into CoreDNS,
// then send the answer out along the fan wire belonging to THIS record row. Shared by the four record
// steps. The answer rides ANS[rowIdx], which is the array wire rowIdx was drawn from, so the ball
// tracks a visible dashed line the whole way and enters the row square-on.
function resolve(s, ctx, rowIdx) {
  s.refs.qChip.classList.add('highlight');
  s.refs.ansChip.classList.add('highlight');
  if (ctx.reduced) { s.refs.coredns.classList.add('highlight'); setChainActive(s.refs.records, rowIdx); return; }
  pulsePod(s.refs.client, ctx, 0);
  const q = segmentPacket(s, ctx, { from: QUERY[0], to: QUERY[1], delay: BEAT.afterPulse, cat: 'network' });
  // CoreDNS is the answering infra: it lights on query arrival, then the answer leaves for its row.
  lightBoxAt(s.refs.coredns, ctx, q.arrivalMs);
  const ans = routePacket(s, ctx, ANS[rowIdx], { delay: q.arrivalMs + BEAT.afterHop, cat: 'network' });
  const row = s.refs.coredns.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay: ans.arrivalMs });
  row.onfinish = () => setChainActive(s.refs.records, rowIdx);
  ctx.register(row);
  return ans;
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Service name in Kubernetes is really a fully qualified DNS name, and the kind of record CoreDNS returns depends on what you ask for. These are the record types behind in-cluster name resolution.',
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
    duration: 2500,
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
    duration: 2500,
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
    duration: 2600,
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
    duration: 2500,
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
