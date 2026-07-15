import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/network-kit.js';

// DNS resolution via CoreDNS (viewBox 1200x640). Standard contract: the client is a shell + inner
// eth0 box; CoreDNS is a shell wrapping its plugin boxes; value chips never flash; only Pods pulse.
// Packets ride the dashed wires edge-to-edge.
//
// The client and the CoreDNS Pod share one center line (FLOW_Y) so the query lane enters CoreDNS at
// its exact middle. Forward (query) and return (answer) traffic ride SEPARATE lanes offset by
// LANE_DY around that line, so a lookup reads as a loop rather than a retrace.
const FLOW_Y = 260;                 // shared center of client and CoreDNS (client y175 + h170/2)
const LANE_DY = 12;                 // half-gap between the two lanes
const FWD_Y = FLOW_Y - LANE_DY;     // 248: client -> CoreDNS query lane
const RET_Y = FLOW_Y + LANE_DY;     // 272: CoreDNS -> client answer lane
const CLIENT_EDGE = 300;            // client Pod right edge (x 70 + w 230)
const DNS_LEFT = 470;               // CoreDNS Pod left edge

function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, cat: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 48, w: w - 40, h: 60, label: 'app', sublabel: 'eth0', cat: 'network' });
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

    const client = podBlock({ x: 70, y: 175, w: 230, h: 170, label: 'Client Pod', ip: '10.244.1.5' });

    const rcNS    = valChip({ x: 70, y: 400, w: 320, h: 32, name: 'nameserver', value: '10.96.0.10', cat: 'network' });
    const rcSearch = valChip({ x: 70, y: 440, w: 320, h: 32, name: 'search', value: 'default.svc / svc / cluster.local', cat: 'network' });
    const rcNdots = valChip({ x: 70, y: 480, w: 320, h: 32, name: 'options', value: 'ndots:5', cat: 'network' });
    const rcLabel = text({ class: 'scheme-label code dim', x: 230, y: 388, 'text-anchor': 'middle', 'font-size': 11 }, ['/etc/resolv.conf']);

    // CoreDNS Pod centered on FLOW_Y (y 120 + h 280/2 = 260), so the query lane enters at its middle.
    // The shell is wrapped in a `g` (like podBlock) because pulsePod uses querySelectorAll, which only
    // matches descendants: pulsing the bare pod element would find its rect but never the .scheme-pod
    // itself, so the brightness half of the pulse would silently not fire.
    const corednsShell = pod({ x: 470, y: 120, w: 320, h: 280, label: 'CoreDNS Pod', sublabel: '10.244.4.2', containers: 0, cat: 'network' });
    const corednsRect = corednsShell.querySelector('.scheme-pod-rect');
    if (corednsRect) corednsRect.style.fill = 'rgba(255, 255, 255, 0.03)';
    const coredns = g({});
    coredns.appendChild(corednsShell);
    // The three plugin boxes are spread wider apart and sit symmetric about FLOW_Y (kubernetes on the
    // line, cache above, forward below), leaving equal 37px margins to the pod label and sublabel.
    // Order is the CoreDNS plugin chain order (compiled into the binary, not the Corefile line order).
    const pCache = box({ x: 500, y: 157, w: 260, h: 50, label: 'Cache', sublabel: 'answers within TTL', cat: 'network' });
    const pK8s   = box({ x: 500, y: 235, w: 260, h: 50, label: 'Kubernetes', sublabel: 'watches the Api', cat: 'network' });
    const pFwd   = box({ x: 500, y: 313, w: 260, h: 50, label: 'Forward', sublabel: 'upstream resolver', cat: 'network' });

    // Forward query lane and its return answer lane, offset around FLOW_Y so the round trip is a loop.
    const qWire = arrow({ x1: CLIENT_EDGE, y1: FWD_Y, x2: DNS_LEFT, y2: FWD_Y, dashed: true, dim: true, color: 'network' });
    const aWire = arrow({ x1: DNS_LEFT, y1: RET_Y, x2: CLIENT_EDGE, y2: RET_Y, dashed: true, dim: true, color: 'network' });
    const fwdLabel = text({ class: 'scheme-label code dim', x: 385, y: FWD_Y - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    const retLabel = text({ class: 'scheme-label code dim', x: 385, y: RET_Y + 22, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    // Internal hop: cache bottom (207) -> kubernetes top (235).
    const cWire = arrow({ x1: 630, y1: 207, x2: 630, y2: 235, dashed: true, dim: true, color: 'network' });

    // Query and answer readouts stacked directly one above the other (4px seam), centered on FLOW_Y.
    const queryChip = valChip({ x: 830, y: 224, w: 300, h: 34, name: 'query', value: '-', cat: 'network' });
    const ansChip   = valChip({ x: 830, y: 262, w: 300, h: 34, name: 'answer A', value: '-', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    root.appendChild(client.group);
    root.appendChild(coredns);
    root.appendChild(pCache);
    root.appendChild(pK8s);
    root.appendChild(pFwd);
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
  // clientBox is listed so its .highlight is cleared every step: reduced replay lights it in the
  // resolv / query / answer steps, and without clearing it here that highlight leaks into the
  // plugin-chain step (reduced replay never runs the forward path that would re-clear it).
  clearHighlights(s, ['pCache', 'pK8s', 'pFwd', 'rcNS', 'rcSearch', 'rcNdots', 'queryChip', 'ansChip', 'clientBox'], [s.refs.client, s.refs.coredns]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Pod wants to talk to the Service web by name. Before any connection can open, that name has to be turned into an IP, and in a cluster that job belongs to CoreDNS rather than the host resolver.',
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
    narration: 'The Kubelet wrote the Pod /etc/resolv.conf when it started. Its nameserver is the kube-dns Service ClusterIP, it lists cluster search domains, and it sets ndots:5. Those three lines are what make in-cluster name resolution work without the app knowing anything about CoreDNS.',
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
    duration: 2400,
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
      const q = segmentPacket(s, ctx, { from: [CLIENT_EDGE, FWD_Y], to: [DNS_LEFT, FWD_Y], delay: BEAT.afterPulse, cat: 'network' });
      pulsePod(s.refs.coredns, ctx, q.arrivalMs);
    },
  },
  {
    id: 'plugin-chain',
    duration: 2500,
    narration: 'Inside CoreDNS the request runs down the plugin chain, whose order is compiled into the binary rather than taken from the Corefile. The cache plugin checks first and misses on a fresh name, so it passes to the kubernetes plugin, which watches Services and Endpoints on the Api and answers the cluster zone from that local cache, never querying the Api per lookup. Names outside the cluster zone would instead fall through to forward.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.pCache.classList.add('highlight');
      s.refs.pK8s.classList.add('highlight');
      if (ctx.reduced) return;
      // The request falls from cache to the kubernetes plugin: a clean hop between the two boxes.
      segmentPacket(s, ctx, { from: [630, 207], to: [630, 235], cat: 'network' });
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
      const a = segmentPacket(s, ctx, { from: [DNS_LEFT, RET_Y], to: [CLIENT_EDGE, RET_Y], cat: 'network' });
      pulsePod(s.refs.client, ctx, a.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
