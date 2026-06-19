import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/network-kit.js';

// DNS resolution via CoreDNS (viewBox 1200x640). Standard contract: the client is a shell + inner
// eth0 box; CoreDNS is a shell wrapping its plugin boxes; value chips never flash; only Pods pulse.
// Packets ride the dashed wires edge-to-edge.
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

    const client = podBlock({ x: 70, y: 175, w: 230, h: 170, label: 'client Pod', ip: 'resolves web' });

    const rcNS    = valChip({ x: 70, y: 400, w: 320, h: 32, name: 'nameserver', value: '10.96.0.10', cat: 'network' });
    const rcSearch = valChip({ x: 70, y: 440, w: 320, h: 32, name: 'search', value: 'default.svc.cluster.local', cat: 'network' });
    const rcNdots = valChip({ x: 70, y: 480, w: 320, h: 32, name: 'options', value: 'ndots:5', cat: 'network' });
    const rcLabel = text({ class: 'scheme-label code dim', x: 230, y: 388, 'text-anchor': 'middle', 'font-size': 11 }, ['/etc/resolv.conf']);

    const coredns = pod({ x: 470, y: 170, w: 320, h: 280, label: 'CoreDNS Pod', sublabel: '10.244.4.2', containers: 0, cat: 'network' });
    const corednsRect = coredns.querySelector('.scheme-pod-rect');
    if (corednsRect) corednsRect.style.fill = 'rgba(255, 255, 255, 0.03)';
    const pCache = box({ x: 500, y: 230, w: 260, h: 50, label: 'cache', sublabel: 'first hit wins', cat: 'network' });
    const pK8s   = box({ x: 500, y: 295, w: 260, h: 50, label: 'kubernetes', sublabel: 'reads from Api', cat: 'network' });
    const pFwd   = box({ x: 500, y: 360, w: 260, h: 50, label: 'forward', sublabel: 'upstream resolver', cat: 'network' });

    const qWire = arrow({ x1: 300, y1: 260, x2: 470, y2: 260, dashed: true, dim: true, color: 'network' });
    const wireLabel = text({ class: 'scheme-label code dim', x: 385, y: 248, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    const cWire = arrow({ x1: 630, y1: 280, x2: 630, y2: 295, dashed: true, dim: true, color: 'network' });

    const queryChip = valChip({ x: 830, y: 240, w: 300, h: 34, name: 'query', value: '-', cat: 'network' });
    const ansChip   = valChip({ x: 830, y: 320, w: 300, h: 34, name: 'answer A', value: '-', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    root.appendChild(client.group);
    root.appendChild(coredns);
    root.appendChild(pCache);
    root.appendChild(pK8s);
    root.appendChild(pFwd);
    [rcNS, rcSearch, rcNdots, rcLabel, qWire, wireLabel, cWire, queryChip, ansChip].forEach(el => root.appendChild(el));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, client: client.group, clientBox: client.innerBox, coredns, pCache, pK8s, pFwd,
      rcNS, rcSearch, rcNdots, queryChip, ansChip,
      packetLayer, wires: { w: wireLabel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['pCache', 'pK8s', 'pFwd', 'rcNS', 'rcSearch', 'rcNdots', 'queryChip', 'ansChip'], [s.refs.client, s.refs.coredns]);
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
      setWire(s, 'w', 'A? web.default.svc...');
      s.refs.rcNdots.classList.add('highlight');
      s.refs.queryChip.classList.add('highlight');
      setVal(s.refs.queryChip, 'web.default.svc.cluster.local');
      if (ctx.reduced) { s.refs.clientBox.classList.add('highlight'); return; }
      // Up-arrow: client pulses first, the query departs at BEAT.afterPulse and CoreDNS pulses on arrival.
      pulsePod(s.refs.client, ctx, 0);
      const q = segmentPacket(s, ctx, { from: [300, 260], to: [470, 260], delay: BEAT.afterPulse, cat: 'network' });
      pulsePod(s.refs.coredns, ctx, q.arrivalMs);
    },
  },
  {
    id: 'plugin-chain',
    duration: 2500,
    narration: 'Inside CoreDNS the request runs down the plugin chain. The cache plugin checks first and misses on a fresh name, so it passes to the kubernetes plugin, which knows the cluster Services and Pods and resolves the name straight from the Api. Names outside the cluster zone would instead fall through to forward.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.pCache.classList.add('highlight');
      s.refs.pK8s.classList.add('highlight');
      if (ctx.reduced) return;
      // The request falls from cache to the kubernetes plugin: a clean hop between the two boxes.
      segmentPacket(s, ctx, { from: [630, 280], to: [630, 295], cat: 'network' });
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
      setWire(s, 'w', 'A 10.96.0.20');
      s.refs.ansChip.classList.add('highlight');
      setVal(s.refs.ansChip, '10.96.0.20');
      if (ctx.reduced) { s.refs.clientBox.classList.add('highlight'); return; }
      // Down-arrow: the answer travels back and the client pulses on arrival (the receiver).
      const a = segmentPacket(s, ctx, { from: [470, 260], to: [300, 260], cat: 'network' });
      pulsePod(s.refs.client, ctx, a.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
