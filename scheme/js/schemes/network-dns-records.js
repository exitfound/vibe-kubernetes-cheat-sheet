import { svg, g } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow, pathArrow, chainList, setChainActive } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, segmentPacket, makeInit, clearHighlights, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): the top-left band (x<=380, y<=300) is reserved for the
// narration overlay, so the client Pod sits low-left and everything else is at x>=400. The FQDN
// anatomy band sits top-right, CoreDNS in the middle, and the record-type ladder on the right.
// Each step resolves one record kind, so the answer detail lives in the highlighted ladder row.
// Standard contract: only the client Pod pulses, boxes/ladder light via .highlight, the query
// packet rides the lane whose endpoints match the static wires.
const COREDNS_CY = 348;
const PANEL_X = 760;
const ROWS = [327, 389, 451, 513];        // record ladder row centres
const QUERY = [[290, 470], [355, 470], [355, COREDNS_CY], [400, COREDNS_CY]];

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

    const client = clientBlock({ x: 80, y: 430, w: 210, h: 130 });
    const coredns = box({ x: 400, y: 300, w: 230, h: 96, label: 'CoreDNS', sublabel: 'kubernetes plugin', cat: 'network' });

    // FQDN anatomy band: four segments of web.default.svc.cluster.local.
    const seg1 = box({ x: 400, y: 150, w: 120, h: 64, label: 'web', sublabel: 'service', cat: 'network' });
    const seg2 = box({ x: 524, y: 150, w: 134, h: 64, label: 'default', sublabel: 'namespace', cat: 'network' });
    const seg3 = box({ x: 662, y: 150, w: 86, h: 64, label: 'svc', sublabel: 'kind', cat: 'network' });
    const seg4 = box({ x: 752, y: 150, w: 170, h: 64, label: 'cluster.local', sublabel: 'base domain', cat: 'network' });

    const records = chainList({
      x: PANEL_X, y: 300, w: 410, rowH: 54, gap: 8, cat: 'network',
      items: [
        'A: web.default.svc -> 10.96.0.10',
        'SRV: _http._tcp.web -> :80',
        'Headless A: -> .2.7 .3.4 .1.9',
        'Pod A: 10-244-2-7.default.pod',
      ],
    });

    // Dim dashed wires: query lane client -> CoreDNS, and CoreDNS -> record panel.
    const wQuery = pathArrow({ points: QUERY, dashed: true, dim: true });
    const wAns = arrow({ x1: 630, y1: COREDNS_CY, x2: PANEL_X, y2: 420, dashed: true, dim: true });

    const searchChip = valChip({ x: 80, y: 578, w: 430, h: 34, name: 'resolv.conf', value: 'ndots:5 search default.svc', cat: 'network' });
    const typeChip = valChip({ x: 540, y: 578, w: 200, h: 34, name: 'record type', value: 'pending', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: anatomy + coredns + client + ladder, then wires ABOVE, then chips, then packets.
    [seg1, seg2, seg3, seg4, coredns, client.group, records].forEach(el => root.appendChild(el));
    [wQuery, wAns].forEach(el => root.appendChild(el));
    [searchChip, typeChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, coredns, seg1, seg2, seg3, seg4, records,
      client: client.group, clientBox: client.innerBox,
      searchChip, typeChip, packetLayer, wires: {},
    };
  }

  reset() { this.build(); }
}

function clientBlock({ x, y, w, h }) {
  const shell = pod({ x, y, w, h, label: 'client Pod', sublabel: '10.244.1.5', containers: 0, cat: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 36, w: w - 40, h: 50, label: 'resolver', sublabel: 'getaddrinfo', cat: 'network' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

function clearHL(s) {
  clearHighlights(s, ['coredns', 'seg1', 'seg2', 'seg3', 'seg4', 'searchChip', 'typeChip', 'clientBox'], [s.refs.client]);
  setChainActive(s.refs.records, -1);
}

// One-shot box flash for a packet-less, pod-less step (the only sanctioned block blink).
function flashBox(s, ctx, key) {
  if (ctx.reduced) return;
  const el = s.refs[key];
  if (!el) return;
  ctx.register(el.animate(
    [{ filter: 'brightness(1)' }, { filter: 'brightness(1.5)' }, { filter: 'brightness(1)' }],
    { duration: 600, easing: 'ease-out' }
  ));
}

// Resolve one record kind: pulse the client, send the query up to CoreDNS, then the answer down to
// the named ladder row. Shared by the four record steps.
function resolve(s, ctx, rowIdx) {
  if (ctx.reduced) { setChainActive(s.refs.records, rowIdx); return; }
  pulsePod(s.refs.client, ctx, 0);
  const q = routePacket(s, ctx, QUERY, { delay: BEAT.afterPulse, cat: 'network' });
  const ans = segmentPacket(s, ctx, { from: [630, COREDNS_CY], to: [PANEL_X, ROWS[rowIdx]], delay: q.arrivalMs + BEAT.afterHop, cat: 'network' });
  const a = s.refs.coredns.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay: q.arrivalMs });
  a.onfinish = () => setChainActive(s.refs.records, rowIdx);
  ctx.register(a);
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
      setVal(s.refs.typeChip, 'pending');
    },
  },
  {
    id: 'fqdn',
    duration: 2500,
    narration: 'The full name is web.default.svc.cluster.local: the Service, its namespace, the literal svc, then the cluster domain. A Pod resolv.conf carries search domains and ndots:5, so a short name like web is expanded to this fully qualified form before it leaves the Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.seg1.classList.add('highlight');
      s.refs.seg2.classList.add('highlight');
      s.refs.seg3.classList.add('highlight');
      s.refs.seg4.classList.add('highlight');
      s.refs.searchChip.classList.add('highlight');
      // Packet-less, pod-less step: flash the service segment so the anatomy does not read frozen.
      flashBox(s, ctx, 'seg1');
    },
  },
  {
    id: 'a-record',
    duration: 2500,
    narration: 'Ask for the name itself and you get an A record, or AAAA on IPv6, pointing at the Service ClusterIP, 10.96.0.10. This is the common case: a name in, the stable virtual IP out, which kube-proxy then load-balances to a Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.typeChip, 'A / AAAA');
      resolve(s, ctx, 0);
    },
  },
  {
    id: 'srv-record',
    duration: 2500,
    narration: 'A named port also publishes an SRV record, _http._tcp.web.default.svc, that returns the port number and the target host. It lets a client discover which port a Service exposes without that port being hard-coded anywhere.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.typeChip, 'SRV');
      resolve(s, ctx, 1);
    },
  },
  {
    id: 'headless-record',
    duration: 2600,
    narration: 'If the Service is headless, the same name returns one A record per ready Pod instead of a single VIP. The client receives the full set of Pod IPs, here three of them, and chooses an endpoint itself.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.typeChip, 'Headless A');
      resolve(s, ctx, 2);
    },
  },
  {
    id: 'pod-record',
    duration: 2500,
    narration: 'Finally each Pod has its own record. The address form, 10-244-2-7.default.pod.cluster.local, resolves the Pod IP directly, and a StatefulSet Pod also gets a stable hostname under its headless Service. These let you reach one specific Pod by name.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.typeChip, 'Pod A');
      resolve(s, ctx, 3);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
