import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt } from '../lib/network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-dns-coredns


// Geometry. Panel measured 2026-07-27: right <= 397, bottom <= 305, one of the deepest in the
// catalog, so the client column hangs entirely below it and the CoreDNS Pod holds the right edge of
// the canvas: the two together centre the content on x=600. A longer narration invalidates the
// measured bottom.
const CONTENT_L = 70, CONTENT_R = 1130;
const FLOW_Y = 400;                 // shared centre of the client and the CoreDNS Pod
const LANE_DY = 12;                 // half-gap between the two lanes
const FWD_Y = FLOW_Y - LANE_DY;     // 388: client -> CoreDNS query lane
const RET_Y = FLOW_Y + LANE_DY;     // 412: CoreDNS -> client answer lane

const CLIENT_X = CONTENT_L, CLIENT_W = 230, CLIENT_H = 150;
const CLIENT_EDGE = CLIENT_X + CLIENT_W;      // 300: client Pod right edge
const CLIENT_Y = FLOW_Y - CLIENT_H / 2;       // 325, clear of the panel bottom

const DNS_W = 320, DNS_H = 280;
const DNS_LEFT = CONTENT_R - DNS_W;           // 810: CoreDNS Pod left edge
const DNS_Y = FLOW_Y - DNS_H / 2;             // 260
const DNS_CX = DNS_LEFT + DNS_W / 2;          // 970: the spine the plugin chain hops down
const PLUGIN_X = DNS_LEFT + 30, PLUGIN_W = DNS_W - 60;   // 840, 260
const PLUGIN_H = 50;
const PLUGIN_Y = [DNS_Y + 37, DNS_Y + 115, DNS_Y + 193]; // cache / kubernetes / forward

// resolv.conf, drawn under the client Pod, and the two readouts stacked above CoreDNS. Together the
// two groups span CONTENT_L..CONTENT_R, so the chip strip centres on x=600 too.
const RC_X = CONTENT_L, RC_W = 320, RC_H = 32;
const RC_Y = [512, 552, 592];
const OUT_W = 300, OUT_X = CONTENT_R - OUT_W; // 830
const OUT_Y = 168, OUT_H = 34, OUT_SEAM = 4;

// Each lane and the ball that rides it come from the same points array.
const QUERY = [[CLIENT_EDGE, FWD_Y], [DNS_LEFT, FWD_Y]];
const ANSWER = [[DNS_LEFT, RET_Y], [CLIENT_EDGE, RET_Y]];
const CHAIN_HOP = [[DNS_CX, PLUGIN_Y[0] + PLUGIN_H], [DNS_CX, PLUGIN_Y[1]]];   // cache -> kubernetes

function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, role: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 48, w: w - 40, h: 60, label: 'app', sublabel: 'eth0', role: 'network' });
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
      'aria-label': 'DNS resolution via CoreDNS: the Pod resolv.conf points at the kube-dns ClusterIP with search domains and ndots, the query reaches a CoreDNS Pod whose plugin chain answers from cache or the kubernetes plugin, returning the Service ClusterIP',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = podBlock({ x: CLIENT_X, y: CLIENT_Y, w: CLIENT_W, h: CLIENT_H, label: 'Client Pod', ip: '10.244.1.5' });

    const rcNS    = valChip({ x: RC_X, y: RC_Y[0], w: RC_W, h: RC_H, name: 'nameserver', value: '10.96.0.10', role: 'network' });
    const rcSearch = valChip({ x: RC_X, y: RC_Y[1], w: RC_W, h: RC_H, name: 'search', value: 'default.svc / svc / cluster.local', role: 'network' });
    const rcNdots = valChip({ x: RC_X, y: RC_Y[2], w: RC_W, h: RC_H, name: 'options', value: 'ndots:5', role: 'network' });
    const rcLabel = text({ class: 'scheme-label code dim', x: RC_X + RC_W / 2, y: RC_Y[0] - 12, 'text-anchor': 'middle' }, ['/etc/resolv.conf']);

    const corednsShell = pod({ x: DNS_LEFT, y: DNS_Y, w: DNS_W, h: DNS_H, label: 'CoreDNS Pod', sublabel: '10.244.4.2', containers: 0, role: 'network' });
    const corednsRect = corednsShell.querySelector('.scheme-pod-rect');
    if (corednsRect) corednsRect.style.fill = 'rgba(255, 255, 255, 0.03)';
    const coredns = g({});
    coredns.appendChild(corednsShell);
    const pCache = box({ x: PLUGIN_X, y: PLUGIN_Y[0], w: PLUGIN_W, h: PLUGIN_H, label: 'Cache', sublabel: 'answers within TTL', role: 'network' });
    const pK8s   = box({ x: PLUGIN_X, y: PLUGIN_Y[1], w: PLUGIN_W, h: PLUGIN_H, label: 'Kubernetes', sublabel: 'watches the API', role: 'network' });
    const pFwd   = box({ x: PLUGIN_X, y: PLUGIN_Y[2], w: PLUGIN_W, h: PLUGIN_H, label: 'Forward', sublabel: 'upstream resolver', role: 'network' });

    // Forward query lane and its return answer lane, offset around FLOW_Y so the round trip is a loop.
    const qWire = arrow({ x1: QUERY[0][0], y1: QUERY[0][1], x2: QUERY[1][0], y2: QUERY[1][1], dashed: true, dim: true, role: 'network' });
    const aWire = arrow({ x1: ANSWER[0][0], y1: ANSWER[0][1], x2: ANSWER[1][0], y2: ANSWER[1][1], dashed: true, dim: true, role: 'network' });
    const fwdLabel = text({ class: 'scheme-label code dim', x: (CLIENT_EDGE + DNS_LEFT) / 2, y: FWD_Y - 12, 'text-anchor': 'middle' }, [' ']);
    const retLabel = text({ class: 'scheme-label code dim', x: (CLIENT_EDGE + DNS_LEFT) / 2, y: RET_Y + 22, 'text-anchor': 'middle' }, [' ']);
    // Internal hop: cache bottom -> kubernetes top, on the Pod spine.
    const cWire = arrow({ x1: CHAIN_HOP[0][0], y1: CHAIN_HOP[0][1], x2: CHAIN_HOP[1][0], y2: CHAIN_HOP[1][1], dashed: true, dim: true, role: 'network' });

    // Query and answer readouts stacked directly one above the other (4px seam), above the Pod that
    // produces them and flush with its right edge.
    const queryChip = valChip({ x: OUT_X, y: OUT_Y, w: OUT_W, h: OUT_H, name: 'query', value: '-', role: 'network' });
    const ansChip   = valChip({ x: OUT_X, y: OUT_Y + OUT_H + OUT_SEAM, w: OUT_W, h: OUT_H, name: 'answer A', value: '-', role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    root.appendChild(client.group);
    // The three plugin boxes go INSIDE the Pod group, not beside it, so the pulse reaches them:
    // a Pod blinks as one thing and everything drawn inside it blinks with it (2026-07-29). They
    // still keep their own refs, because a step lights one plugin at a time.
    coredns.appendChild(pCache);
    coredns.appendChild(pK8s);
    coredns.appendChild(pFwd);
    root.appendChild(coredns);
    [rcNS, rcSearch, rcNdots, rcLabel, qWire, aWire, fwdLabel, retLabel, cWire, queryChip, ansChip].forEach(el => root.appendChild(el));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, client: client.group, clientBox: client.innerBox, coredns, pCache, pK8s, pFwd,
      rcNS, rcSearch, rcNdots, queryChip, ansChip,
      packetLayer, wires: { q: fwdLabel, a: retLabel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['pCache', 'pK8s', 'pFwd', 'rcNS', 'rcSearch', 'rcNdots', 'queryChip', 'ansChip', 'clientBox'], [s.refs.client, s.refs.coredns]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.queryChip, '-');
      setVal(s.refs.ansChip, '-');
    },
  },
  {
    id: 'resolv',
    duration: 2200,
    narration: 'The Pod /etc/resolv.conf was written by the Kubelet at startup. Its nameserver is the kube-dns Service ClusterIP, it lists cluster search domains, and it sets ndots:5. Those three lines are what make in-cluster name resolution work without the app knowing anything about CoreDNS.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.rcNS.classList.add('highlight');
      s.refs.rcSearch.classList.add('highlight');
      s.refs.rcNdots.classList.add('highlight');
      if (ctx.reduced) { s.refs.clientBox.classList.add('highlight'); return; }
      // The client consults its own resolv.conf: it pulses, the chips just light (no flash).
      pulsePod(s.refs.client, ctx, 0);
    },
  },
  {
    id: 'query',
    // Motion: pulse beat (800) + the query lane (~1130 over 510 units) + the CoreDNS pulse (900)
    // ends at ~2830, so the step has to outlast that.
    duration: 3000,
    narration: 'Because the short name web has fewer than 5 dots, the resolver tries the search domains first, expanding it to web.default.svc.cluster.local. That query is sent to the kube-dns ClusterIP, which is itself a Service, so it is load balanced to one of the CoreDNS Pods.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'q', 'A? web.default.svc...');
      // Both lines the expansion rule reads: the search list supplies the suffix, ndots decides that
      // the list is tried first. Highlighting only ndots would leave the narration half unillustrated.
      s.refs.rcSearch.classList.add('highlight');
      s.refs.rcNdots.classList.add('highlight');
      s.refs.queryChip.classList.add('highlight');
      setVal(s.refs.queryChip, 'web.default.svc.cluster.local');
      if (ctx.reduced) { s.refs.clientBox.classList.add('highlight'); return; }
      // Up-arrow: client pulses first, the query departs the forward lane at BEAT.afterPulse and
      // CoreDNS pulses on arrival.
      pulsePod(s.refs.client, ctx, 0);
      const q = segmentPacket(s, ctx, { from: QUERY[0], to: QUERY[1], delay: BEAT.afterPulse, role: 'network' });
      pulsePod(s.refs.coredns, ctx, q.arrivalMs);
    },
  },
  {
    id: 'plugin-chain',
    duration: 2500,
    narration: 'Inside CoreDNS the request runs down the plugin chain, whose order is compiled into the binary rather than taken from the Corefile. The cache plugin checks first and misses on a fresh name, so it passes to the kubernetes plugin, which watches Services and EndpointSlices on the API and answers the cluster zone from that local cache, never querying the API per lookup. Names outside the cluster zone would instead fall through to forward.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.pCache.classList.add('highlight');
      if (ctx.reduced) { s.refs.pK8s.classList.add('highlight'); return; }
      // The request falls from cache to the kubernetes plugin: a clean hop between the two boxes.
      const pkt = segmentPacket(s, ctx, { from: CHAIN_HOP[0], to: CHAIN_HOP[1], role: 'network' });
      lightBoxAt(s.refs.pK8s, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'answer',
    duration: 2300,
    narration: 'The kubernetes plugin returns an A record holding the Service ClusterIP, 10.96.0.20, and cache stores it for the next lookup. The client now has an address and opens its connection to that ClusterIP, which is where the kube-proxy path takes over.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'a', 'A 10.96.0.20');
      // The narration credits two plugins on the way out: kubernetes produces the record, cache stores
      // it. Both stay lit so the answer visibly leaves the chain it was built in.
      s.refs.pK8s.classList.add('highlight');
      s.refs.pCache.classList.add('highlight');
      s.refs.ansChip.classList.add('highlight');
      setVal(s.refs.ansChip, '10.96.0.20');
      if (ctx.reduced) { s.refs.clientBox.classList.add('highlight'); return; }
      // Down-arrow: the answer travels back along the return lane and the client pulses on arrival.
      const a = segmentPacket(s, ctx, { from: ANSWER[0], to: ANSWER[1], role: 'network' });
      pulsePod(s.refs.client, ctx, a.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
