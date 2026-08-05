import { svg, g } from '../../lib/svg.js';
import { arrowDefs, box, arrow, pathArrow } from '../../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, routePacket, segmentPacket, arrivalRipple, makeInit, clearHighlights, lightBoxAt } from './network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-service-cidr


const SCHEME_L = 120, SCHEME_R = 1080;   // content edges, mirrored about x=600

// Service row: three equal boxes with equal gaps, spanning the composition.
const SVC_Y = 450, SVC_W = 280, SVC_H = 86;
const SVC_GAP = (SCHEME_R - SCHEME_L - 3 * SVC_W) / 2;                 // 60
const SVC_X = [0, 1, 2].map(i => SCHEME_L + i * (SVC_W + SVC_GAP));    // 120, 460, 800
const SVC_CX = SVC_X.map(x => x + SVC_W / 2);                          // 260, 600, 940

const POOL_X = 580;          // pool centre (kept right of the overlay band)
const POOL_Y = 44, POOL_W = 280, POOL_H = 64;
const POOL_BOTTOM = POOL_Y + POOL_H;   // 108: where both split lanes leave the pool

const BAND_Y = 320, BAND_H = 84;
const BAND_BOTTOM = BAND_Y + BAND_H;   // 404
const STATIC_W = 280;                  // static band: 120..400, flush under Service kubernetes
const DYN_L = 420, DYN_RIGHT = SCHEME_R;
const STATIC_X = SVC_CX[0];            // 260: static band centre
const DYN_X = (DYN_L + DYN_RIGHT) / 2; // 750: dynamic band centre
const DYN_MID_Y = BAND_Y + BAND_H / 2; // 362
const WEB_X = SVC_CX[2];               // 940: web column (Service web and the add-on CIDR align here)

const CHIP_Y = 556, CHIP_H = 34;
const RAIL1 = 230;    // pool -> bands rail
const RAIL2 = 428;    // bands -> Services rail
const EXT_RAIL_X = 1130;   // the add-on CIDR comes down outside the bands before turning in

const SPLIT_STATIC  = [[POOL_X, POOL_BOTTOM], [POOL_X, RAIL1], [STATIC_X, RAIL1], [STATIC_X, BAND_Y]];
const SPLIT_DYNAMIC = [[POOL_X, POOL_BOTTOM], [POOL_X, RAIL1], [DYN_X, RAIL1], [DYN_X, BAND_Y]];
const K8S_ROUTE     = [[STATIC_X, BAND_BOTTOM], [STATIC_X, SVC_Y]];                                     // static band -> Service kubernetes
const DNS_ROUTE     = [[STATIC_X, BAND_BOTTOM], [STATIC_X, RAIL2], [SVC_CX[1], RAIL2], [SVC_CX[1], SVC_Y]];
const WEB_ROUTE     = [[DYN_X, BAND_BOTTOM], [DYN_X, RAIL2], [WEB_X, RAIL2], [WEB_X, SVC_Y]];

// The opening divide is deliberately slowed (and both packets share one dur so the two bands
// light up together) so the split into a static and a dynamic band reads clearly.
const SPLIT_DUR = 1600;

// The add-on CIDR enters the dynamic band from its right side, centred on that edge (DYN_MID_Y),
// so the extend step reads as the range growing into the band, not a straight top-down drop.
const EXTEND_ROUTE = [[WEB_X, POOL_BOTTOM], [WEB_X, RAIL1], [EXT_RAIL_X, RAIL1], [EXT_RAIL_X, DYN_MID_Y], [DYN_RIGHT, DYN_MID_Y]];

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
    const pool = box({ x: POOL_X - POOL_W / 2, y: POOL_Y, w: POOL_W, h: POOL_H, label: 'ServiceCIDR kubernetes', sublabel: '10.96.0.0/16', role: 'network' });
    const cidr2 = box({ x: WEB_X - POOL_W / 2, y: POOL_Y, w: POOL_W, h: POOL_H, label: 'ServiceCIDR add-on', sublabel: '10.97.0.0/16', role: 'network' });
    cidr2.style.opacity = '0';

    // The range, drawn as two adjacent bands so it reads as one divided CIDR: a small static band
    // flush under Service kubernetes, and the much wider dynamic band filling the rest.
    const staticBand  = box({ x: SCHEME_L, y: BAND_Y, w: STATIC_W, h: BAND_H, label: 'Static band', sublabel: 'low IPs . by hand', role: 'network' });
    const dynamicBand = box({ x: DYN_L, y: BAND_Y, w: DYN_RIGHT - DYN_L, h: BAND_H, label: 'Dynamic band', sublabel: 'high IPs . auto-assigned', role: 'network' });

    // Three Services on an even grid, IP assigned across the steps (pending at rest).
    const svcK8s = box({ x: SVC_X[0], y: SVC_Y, w: SVC_W, h: SVC_H, label: 'Service kubernetes', sublabel: 'clusterIP pending', role: 'network' });
    const svcDns = box({ x: SVC_X[1], y: SVC_Y, w: SVC_W, h: SVC_H, label: 'Service kube-dns', sublabel: 'clusterIP pending', role: 'network' });
    const svcWeb = box({ x: SVC_X[2], y: SVC_Y, w: SVC_W, h: SVC_H, label: 'Service web', sublabel: 'clusterIP pending', role: 'network' });

    // The IPAddress object that records the dynamic binding. It spans the whole composition rather
    // than the web column: its own value names the Service it points at, and 280 units were too
    // narrow for that value to clear the chip name.
    const ipaddrChip = valChip({ x: SCHEME_L, y: CHIP_Y, w: SCHEME_R - SCHEME_L, h: CHIP_H, name: 'IPAddress', value: ' ', role: 'network' });
    ipaddrChip.style.opacity = '0';

    const aSplit1 = pathArrow({ points: SPLIT_STATIC, dashed: true, dim: true });
    const aSplit2 = pathArrow({ points: SPLIT_DYNAMIC, dashed: true, dim: true });
    const aK8s    = arrow({ x1: K8S_ROUTE[0][0], y1: K8S_ROUTE[0][1], x2: K8S_ROUTE[1][0], y2: K8S_ROUTE[1][1], dashed: true, dim: true });
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
    narration: 'The range is divided into two bands. A small low static band is left for hand-picked addresses, and the much larger high dynamic band is used for automatic assignment, so a manual IP taken from the low band is very unlikely to collide with an auto-assigned one. Only once the dynamic band is exhausted does the allocator fall back to the low one.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.pool.classList.add('highlight');
      setBoxSublabel(s.refs.svcK8s, 'clusterIP pending');
      setBoxSublabel(s.refs.svcDns, 'clusterIP pending');
      setBoxSublabel(s.refs.svcWeb, 'clusterIP pending');
      if (ctx.reduced) { s.refs.dynamicBand.classList.add('highlight'); s.refs.staticBand.classList.add('highlight'); return; }
      // The pool divides into the two bands: a packet rides into each, slowed and synchronized
      // (shared SPLIT_DUR) so the divide is easy to follow and both bands light together.
      const staticBandPkt = routePacket(s, ctx, SPLIT_STATIC, { dur: SPLIT_DUR, fadeIn: true, role: 'network' });
      lightBoxAt(s.refs.staticBand, ctx, staticBandPkt.arrivalMs);
      const dynamicBandPkt = routePacket(s, ctx, SPLIT_DYNAMIC, { dur: SPLIT_DUR, fadeIn: true, role: 'network' });
      lightBoxAt(s.refs.dynamicBand, ctx, dynamicBandPkt.arrivalMs);
    },
  },
  {
    id: 'well-known',
    duration: 2600,
    narration: 'At cluster bootstrap two addresses are taken from the static band. 10.96.0.1 is the first address of the range and always fronts the kubernetes API Service, while installers assign kube-dns the tenth by convention, here 10.96.0.10, which is why those two IPs are predictable in most clusters.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.staticBand.classList.add('highlight');
      setBoxSublabel(s.refs.svcK8s, 'clusterIP 10.96.0.1');
      setBoxSublabel(s.refs.svcDns, 'clusterIP 10.96.0.10');
      setBoxSublabel(s.refs.svcWeb, 'clusterIP pending');
      if (ctx.reduced) { s.refs.svcDns.classList.add('highlight'); s.refs.svcK8s.classList.add('highlight'); return; }
      // Two reservations leave the static band together (packet first, ripple on arrival: the
      // Service boxes are receivers, and only Pods pulse so a box gets the ripple instead).
      const p1 = segmentPacket(s, ctx, { from: K8S_ROUTE[0], to: K8S_ROUTE[1], dur: 540, role: 'network' });
      lightBoxAt(s.refs.svcK8s, ctx, p1.arrivalMs);
      const p2 = routePacket(s, ctx, DNS_ROUTE, { fadeIn: true, role: 'network' });
      lightBoxAt(s.refs.svcDns, ctx, p2.arrivalMs);
      arrivalRipple(s.refs.packetLayer, ctx, K8S_ROUTE[1], p1.arrivalMs, 'network');
      arrivalRipple(s.refs.packetLayer, ctx, DNS_ROUTE[DNS_ROUTE.length - 1], p2.arrivalMs, 'network');
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
      s.refs.ipaddrChip.classList.add('highlight');
      setBoxSublabel(s.refs.svcK8s, 'clusterIP 10.96.0.1');
      setBoxSublabel(s.refs.svcDns, 'clusterIP 10.96.0.10');
      setBoxSublabel(s.refs.svcWeb, 'clusterIP 10.96.137.42');
      setVal(s.refs.ipaddrChip, '10.96.137.42 . default/web');
      if (ctx.reduced) { s.refs.ipaddrChip.style.opacity = '1'; s.refs.svcWeb.classList.add('highlight'); return; }
      const give = routePacket(s, ctx, WEB_ROUTE, { role: 'network' });
      lightBoxAt(s.refs.svcWeb, ctx, give.arrivalMs);
      arrivalRipple(s.refs.packetLayer, ctx, WEB_ROUTE[WEB_ROUTE.length - 1], give.arrivalMs, 'network');
      // The IPAddress object materializes once the address lands on the Service.
      ctx.register(s.refs.ipaddrChip.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, delay: give.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'extend',
    duration: 2600,
    narration: 'When the whole range fills up, the old fix was to resize the API server service-cluster-ip-range and restart it, a disruptive operation. Now you add a second ServiceCIDR object, here 10.97.0.0/16, and fresh ClusterIPs are drawn from it. The Service IP space grows with no downtime.',
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
      if (ctx.reduced) {
        s.refs.cidr2.style.opacity = '1';
        s.refs.aExtend.style.opacity = '1';
        s.refs.dynamicBand.classList.add('highlight');
        return;
      }
      ctx.register(s.refs.cidr2.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, fill: 'forwards', easing: 'ease-out' }));
      ctx.register(s.refs.aExtend.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, fill: 'forwards', easing: 'ease-out' }));
      // The add-on CIDR feeds fresh addresses into the dynamic band from its right side.
      const give = routePacket(s, ctx, EXTEND_ROUTE, { delay: 420, role: 'network' });
      lightBoxAt(s.refs.dynamicBand, ctx, give.arrivalMs);
      arrivalRipple(s.refs.packetLayer, ctx, EXTEND_ROUTE[EXTEND_ROUTE.length - 1], give.arrivalMs, 'network');
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
