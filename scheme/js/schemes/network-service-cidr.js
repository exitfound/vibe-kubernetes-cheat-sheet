import { svg, g } from '../lib/svg.js';
import { arrowDefs, box, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, routePacket, segmentPacket, arrivalRipple, makeInit, clearHighlights } from '../lib/network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-service-cidr


const POOL_X = 580;   // pool centre (kept right of the overlay band)
const STATIC_X = 260; // static band centre, flush under Service kubernetes
const DYN_X = 750;    // dynamic band centre
const WEB_X = 940;    // web column (Service web, IPAddress chip, add-on CIDR all align here)
const RAIL1 = 230;    // pool -> bands rail
const RAIL2 = 428;    // bands -> Services rail

const SPLIT_STATIC  = [[POOL_X, 108], [POOL_X, RAIL1], [STATIC_X, RAIL1], [STATIC_X, 320]]; // pool -> static band
const SPLIT_DYNAMIC = [[POOL_X, 108], [POOL_X, RAIL1], [DYN_X, RAIL1], [DYN_X, 320]];        // pool -> dynamic band
const DNS_ROUTE     = [[STATIC_X, 404], [STATIC_X, RAIL2], [600, RAIL2], [600, 450]];        // static band -> Service kube-dns
const WEB_ROUTE     = [[DYN_X, 404], [DYN_X, RAIL2], [WEB_X, RAIL2], [WEB_X, 450]];          // dynamic band -> Service web

// The opening divide is deliberately slowed (and both packets share one dur so the two bands
// light up together) so the split into a static and a dynamic band reads clearly.
const SPLIT_DUR = 1600;

// The add-on CIDR enters the Dynamic Band from its right side, centred on that edge (DYN_MID_Y),
// so the extend step reads as the range growing into the band, not a straight top-down drop.
const DYN_RIGHT = 1080, DYN_MID_Y = 362;
const EXTEND_ROUTE = [[WEB_X, 108], [WEB_X, RAIL1], [1130, RAIL1], [1130, DYN_MID_Y], [DYN_RIGHT, DYN_MID_Y]];

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Service CIDR and ClusterIP allocation: the configured Service CIDR is divided into a low static band for well-known IPs like 10.96.0.1 and 10.96.0.10 and a high dynamic band the allocator draws ClusterIPs from, each tracked by an IPAddress object, and a second ServiceCIDR can be added to extend the range without disruption',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Top row: the configured Service CIDR, plus a second one stacked over the web column,
    // revealed only on the extend step.
    const pool = box({ x: POOL_X - 140, y: 44, w: 280, h: 64, label: 'ServiceCIDR Kubernetes', sublabel: '10.96.0.0/16', role: 'network' });
    const cidr2 = box({ x: WEB_X - 140, y: 44, w: 280, h: 64, label: 'ServiceCIDR Add-on', sublabel: '10.97.0.0/16', role: 'network' });
    cidr2.style.opacity = '0';

    // The range, drawn as two adjacent bands so it reads as one divided CIDR: a small static band
    // flush under Service kubernetes, and the much wider dynamic band filling the rest.
    const staticBand  = box({ x: 120, y: 320, w: 280, h: 84, label: 'Static Band', sublabel: 'low IPs . reserved', role: 'network' });
    const dynamicBand = box({ x: 420, y: 320, w: 660, h: 84, label: 'Dynamic Band', sublabel: 'high IPs . auto-assigned', role: 'network' });

    // Three Services on an even grid, IP assigned across the steps (pending at rest).
    const svcK8s = box({ x: 120, y: 450, w: 280, h: 86, label: 'Service Kubernetes', sublabel: 'clusterIP pending', role: 'network' });
    const svcDns = box({ x: 460, y: 450, w: 280, h: 86, label: 'Service Kube-dns', sublabel: 'clusterIP pending', role: 'network' });
    const svcWeb = box({ x: 800, y: 450, w: 280, h: 86, label: 'Service Web', sublabel: 'clusterIP pending', role: 'network' });

    // The IPAddress object that records the dynamic binding, parked under the web column so it
    // reads as web's record (revealed and highlighted on the dynamic step).
    const ipaddrChip = valChip({ x: 800, y: 556, w: 280, h: 34, name: 'IPAddress', value: ' ', role: 'network' });
    ipaddrChip.style.opacity = '0';

    const aSplit1 = pathArrow({ points: SPLIT_STATIC, dashed: true, dim: true });
    const aSplit2 = pathArrow({ points: SPLIT_DYNAMIC, dashed: true, dim: true });
    const aK8s    = arrow({ x1: STATIC_X, y1: 404, x2: STATIC_X, y2: 450, dashed: true, dim: true });
    const aDns    = pathArrow({ points: DNS_ROUTE, dashed: true, dim: true });
    const aWeb    = pathArrow({ points: WEB_ROUTE, dashed: true, dim: true });
    const aExtend = pathArrow({ points: EXTEND_ROUTE, dashed: true, dim: true });
    aExtend.style.opacity = '0';

    const packetLayer = g({ id: 'packetLayer' });

    root.appendChild(staticBand);
    root.appendChild(dynamicBand);
    root.appendChild(svcK8s);
    root.appendChild(svcDns);
    root.appendChild(svcWeb);
    root.appendChild(ipaddrChip);
    root.appendChild(pool);
    root.appendChild(cidr2);
    // arrows on top of the blocks so the dim wires read clearly, then packets on top.
    [aSplit1, aSplit2, aK8s, aDns, aWeb, aExtend].forEach(el => root.appendChild(el));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, pool, cidr2, staticBand, dynamicBand,
      svcK8s, svcDns, svcWeb, ipaddrChip, aExtend,
      packetLayer, wires: {},
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['pool', 'cidr2', 'staticBand', 'dynamicBand', 'svcK8s', 'svcDns', 'svcWeb', 'ipaddrChip']);
  // The add-on CIDR, its wire and the IPAddress object are revealed only on later steps.
  s.refs.cidr2.style.opacity = '0';
  s.refs.aExtend.style.opacity = '0';
  s.refs.ipaddrChip.style.opacity = '0';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Every Service of type ClusterIP needs a virtual IP, but nobody assigns it by hand. The cluster carves one out of a single configured range, the Service CIDR, here 10.96.0.0/16.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setBoxSublabel(s.refs.svcK8s, 'clusterIP pending');
      setBoxSublabel(s.refs.svcDns, 'clusterIP pending');
      setBoxSublabel(s.refs.svcWeb, 'clusterIP pending');
      setVal(s.refs.ipaddrChip, ' ');
    },
  },
  {
    id: 'range-split',
    duration: 2400,
    narration: 'The range is divided into two bands. A small low static band is reserved for hand-picked addresses, and the much larger high dynamic band is used for automatic assignment, so a manual IP can never collide with an auto-assigned one.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.pool.classList.add('highlight');
      s.refs.staticBand.classList.add('highlight');
      s.refs.dynamicBand.classList.add('highlight');
      setBoxSublabel(s.refs.svcK8s, 'clusterIP pending');
      setBoxSublabel(s.refs.svcDns, 'clusterIP pending');
      setBoxSublabel(s.refs.svcWeb, 'clusterIP pending');
      if (ctx.reduced) return;
      // The pool divides into the two bands: a packet rides into each, slowed and synchronized
      // (shared SPLIT_DUR) so the divide is easy to follow and both bands light together.
      routePacket(s, ctx, SPLIT_STATIC, { dur: SPLIT_DUR, fadeIn: true, role: 'network' });
      routePacket(s, ctx, SPLIT_DYNAMIC, { dur: SPLIT_DUR, fadeIn: true, role: 'network' });
    },
  },
  {
    id: 'well-known',
    duration: 2600,
    narration: 'At cluster bootstrap two addresses are reserved from the static band. 10.96.0.1 always fronts the kubernetes API Service and 10.96.0.10 always fronts kube-dns, which is why those two IPs are predictable in every cluster.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.staticBand.classList.add('highlight');
      s.refs.svcK8s.classList.add('highlight');
      s.refs.svcDns.classList.add('highlight');
      setBoxSublabel(s.refs.svcK8s, 'clusterIP 10.96.0.1');
      setBoxSublabel(s.refs.svcDns, 'clusterIP 10.96.0.10');
      setBoxSublabel(s.refs.svcWeb, 'clusterIP pending');
      if (ctx.reduced) return;
      // Two reservations leave the static band together (packet first, ripple on arrival: the
      // Service boxes are receivers, and only Pods pulse so a box gets the ripple instead).
      const p1 = segmentPacket(s, ctx, { from: [STATIC_X, 404], to: [STATIC_X, 450], dur: 540, role: 'network' });
      const p2 = routePacket(s, ctx, DNS_ROUTE, { fadeIn: true, role: 'network' });
      arrivalRipple(s.refs.packetLayer, ctx, [STATIC_X, 450], p1.arrivalMs, 'network');
      arrivalRipple(s.refs.packetLayer, ctx, [600, 450], p2.arrivalMs, 'network');
    },
  },
  {
    id: 'dynamic',
    duration: 2600,
    narration: 'A new Service web is created with no clusterIP, so the allocator picks the next free address from the dynamic band, here 10.96.137.42, and records it as an IPAddress object that points back to the Service. Every ClusterIP in the cluster is now tracked by one of these objects.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.dynamicBand.classList.add('highlight');
      s.refs.svcWeb.classList.add('highlight');
      s.refs.ipaddrChip.classList.add('highlight');
      setBoxSublabel(s.refs.svcK8s, 'clusterIP 10.96.0.1');
      setBoxSublabel(s.refs.svcDns, 'clusterIP 10.96.0.10');
      setBoxSublabel(s.refs.svcWeb, 'clusterIP 10.96.137.42');
      setVal(s.refs.ipaddrChip, '10.96.137.42 . default/web');
      if (ctx.reduced) { s.refs.ipaddrChip.style.opacity = '1'; return; }
      const give = routePacket(s, ctx, WEB_ROUTE, { role: 'network' });
      arrivalRipple(s.refs.packetLayer, ctx, [WEB_X, 450], give.arrivalMs, 'network');
      // The IPAddress object materializes once the address lands on the Service.
      ctx.register(s.refs.ipaddrChip.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, delay: give.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'extend',
    duration: 2600,
    narration: 'When the dynamic band fills up, the old fix was to resize the API server service-cluster-ip-range and restart it, a disruptive operation. Now you add a second ServiceCIDR object, here 10.97.0.0/16, and fresh ClusterIPs are drawn from it. The Service IP space grows with no downtime.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      // Keep the earlier assignments visible.
      setBoxSublabel(s.refs.svcK8s, 'clusterIP 10.96.0.1');
      setBoxSublabel(s.refs.svcDns, 'clusterIP 10.96.0.10');
      setBoxSublabel(s.refs.svcWeb, 'clusterIP 10.96.137.42');
      setVal(s.refs.ipaddrChip, '10.96.137.42 . default/web');
      s.refs.ipaddrChip.style.opacity = '1';
      s.refs.cidr2.classList.add('highlight');
      s.refs.dynamicBand.classList.add('highlight');
      if (ctx.reduced) {
        s.refs.cidr2.style.opacity = '1';
        s.refs.aExtend.style.opacity = '1';
        return;
      }
      ctx.register(s.refs.cidr2.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, fill: 'forwards', easing: 'ease-out' }));
      ctx.register(s.refs.aExtend.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, fill: 'forwards', easing: 'ease-out' }));
      // The add-on CIDR feeds fresh addresses into the Dynamic Band from its right side.
      const give = routePacket(s, ctx, EXTEND_ROUTE, { delay: 420, role: 'network' });
      arrivalRipple(s.refs.packetLayer, ctx, [DYN_RIGHT, DYN_MID_Y], give.arrivalMs, 'network');
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
