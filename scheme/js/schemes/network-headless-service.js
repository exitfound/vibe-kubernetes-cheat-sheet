import { svg, g } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, routePacket, makeInit, clearHighlights, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): the top-left band (x<=380, y<=300) is reserved for the
// narration overlay, so the client Pod sits low-left at y420 and CoreDNS sits at x430. A headless
// Service has clusterIP None, so there is no VIP hop: DNS returns the backing Pod IPs and the
// client connects to a Pod directly. The three backends are a StatefulSet (web-0..web-2) to make
// the stable per-Pod name point land.
// Standard contract: only Pods pulse, boxes light via .highlight, packet routes match the wires.
const COREDNS = [680, 189];        // CoreDNS right-edge anchor
const W0 = 168, W1 = 320, W2 = 472; // backend Pod centre rows
const POD_X = 880;                  // backend Pods left edge
const CLIENT = [290, 440];          // client Pod right-edge anchor (DNS lane)

// client <-> CoreDNS DNS lane (up from the client, across, into CoreDNS). The vertical rise is at
// x400 so the wire and its packet clear the narration overlay band (x<=380 & y<=300).
const QUERY = [[290, 440], [400, 440], [400, 189], [430, 189]];
const ANSWER = [[430, 189], [400, 189], [400, 440], [290, 440]];
// client -> a chosen Pod, direct (no proxy). Two routes: web-1 for the round-robin connect, web-0
// for the stable-name connect.
const TO_W1 = [[290, 500], [770, 500], [770, W1], [POD_X, W1]];
const TO_W0 = [[290, 460], [806, 460], [806, W0], [POD_X, W0]];

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
      'aria-label': 'Headless Service: with clusterIP None there is no virtual IP, so DNS returns the backing Pod IPs directly and the client connects to a Pod itself, and a StatefulSet gives each Pod its own stable name',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = podBlock({ x: 80, y: 420, w: 210, h: 130, label: 'client Pod', ip: '10.244.1.5' });
    const coredns = box({ x: 430, y: 150, w: 250, h: 78, label: 'CoreDNS', sublabel: 'kube-dns . 10.96.0.10', cat: 'network' });
    const svc = box({ x: 430, y: 300, w: 250, h: 70, label: 'Service web', sublabel: 'clusterIP: None', cat: 'network' });

    const w0 = podBlock({ x: POD_X, y: 110, w: 240, h: 116, label: 'web-0', ip: '10.244.2.7' });
    const w1 = podBlock({ x: POD_X, y: 262, w: 240, h: 116, label: 'web-1', ip: '10.244.3.4' });
    const w2 = podBlock({ x: POD_X, y: 414, w: 240, h: 116, label: 'web-2', ip: '10.244.1.9' });

    // Dim dashed wires. CoreDNS knows the three endpoints (fan to each Pod), the Service feeds
    // CoreDNS, plus the DNS lane and the direct data path. The data-path wires sit under the
    // packet routes so the bright ball reads on top.
    const wSvc = arrow({ x1: 555, y1: 300, x2: 555, y2: 228, dashed: true, dim: true });
    const f0 = arrow({ x1: COREDNS[0], y1: 189, x2: POD_X, y2: W0, dashed: true, dim: true });
    const f1 = arrow({ x1: COREDNS[0], y1: 189, x2: POD_X, y2: W1, dashed: true, dim: true });
    const f2 = arrow({ x1: COREDNS[0], y1: 189, x2: POD_X, y2: W2, dashed: true, dim: true });
    const wQuery = pathArrow({ points: QUERY, dashed: true, dim: true });
    const wData = pathArrow({ points: TO_W1, dashed: true, dim: true });

    const vipChip = valChip({ x: 300, y: 592, w: 180, h: 34, name: 'clusterIP', value: 'None', cat: 'network' });
    const dnsChip = valChip({ x: 494, y: 592, w: 360, h: 34, name: 'DNS answer', value: 'pending', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: boxes/pods, then wires ABOVE them, then chips, then packets on top.
    root.appendChild(coredns);
    root.appendChild(svc);
    root.appendChild(client.group);
    [w0, w1, w2].forEach(p => root.appendChild(p.group));
    [wSvc, f0, f1, f2, wQuery, wData].forEach(el => root.appendChild(el));
    [vipChip, dnsChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, coredns, svc,
      client: client.group, clientBox: client.innerBox,
      w0: w0.group, w0Box: w0.innerBox, w1: w1.group, w1Box: w1.innerBox, w2: w2.group, w2Box: w2.innerBox,
      vipChip, dnsChip, packetLayer, wires: {},
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['coredns', 'svc', 'vipChip', 'dnsChip', 'w0Box', 'w1Box', 'w2Box'],
    [s.refs.client, s.refs.w0, s.refs.w1, s.refs.w2]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'The web Service is declared with clusterIP None, which makes it headless. It still selects the three StatefulSet Pods, but the cluster gives it no virtual IP at all, so there is nothing for kube-proxy to program.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.vipChip, 'None');
      setVal(s.refs.dnsChip, 'pending');
    },
  },
  {
    id: 'query',
    duration: 2200,
    narration: 'The client looks up the Service by name, web.default.svc.cluster.local. Because there is no ClusterIP, the answer cannot be a single virtual address, so this query has to resolve to the Pods themselves.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.vipChip.classList.add('highlight');
      setVal(s.refs.dnsChip, 'query web.default.svc');
      if (ctx.reduced) { s.refs.coredns.classList.add('highlight'); return; }
      // Up-arrow: the client pulses first, the query leaves at BEAT.afterPulse and lands at CoreDNS.
      pulsePod(s.refs.client, ctx, 0);
      const q = routePacket(s, ctx, QUERY, { delay: BEAT.afterPulse, cat: 'network' });
      const light = q.arrivalMs;
      if (!ctx.reduced) {
        const a = s.refs.coredns.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay: light });
        a.onfinish = () => s.refs.coredns.classList.add('highlight');
        ctx.register(a);
      }
    },
  },
  {
    id: 'answer-all',
    duration: 2600,
    narration: 'CoreDNS reads the ready endpoints and returns one A record for every backing Pod, three addresses in this answer rather than a single VIP. The client receives the whole set of Pod IPs and gets to choose among them itself.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.coredns.classList.add('highlight');
      s.refs.w0Box.classList.add('highlight');
      s.refs.w1Box.classList.add('highlight');
      s.refs.w2Box.classList.add('highlight');
      setVal(s.refs.dnsChip, '3 A records: .2.7 .3.4 .1.9');
      if (ctx.reduced) { s.refs.clientBox.classList.add('highlight'); return; }
      // Down-arrow: the answer rides back to the client, which pulses on arrival.
      const ans = routePacket(s, ctx, ANSWER, { cat: 'network' });
      pulsePod(s.refs.client, ctx, ans.arrivalMs);
    },
  },
  {
    id: 'direct',
    duration: 2500,
    narration: 'The client opens the connection straight to one of those Pod IPs, here web-1 at 10.244.3.4. There is no ClusterIP in the path and kube-proxy does no DNAT, the traffic goes directly Pod to Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.dnsChip, 'connect 10.244.3.4 direct');
      if (ctx.reduced) { s.refs.w1Box.classList.add('highlight'); return; }
      // Up-arrow: client pulses first, the connection leaves and the chosen Pod pulses on arrival.
      pulsePod(s.refs.client, ctx, 0);
      const hop = routePacket(s, ctx, TO_W1, { delay: BEAT.afterPulse, cat: 'network' });
      pulsePod(s.refs.w1, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'stable-name',
    duration: 2600,
    narration: 'A headless Service also gives each StatefulSet Pod its own stable name, so web-0.web.default.svc.cluster.local always resolves to that exact Pod. That is how a client can address one specific replica, which is what stateful systems with a known primary depend on.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.dnsChip, 'web-0.web.default.svc');
      if (ctx.reduced) { s.refs.w0Box.classList.add('highlight'); return; }
      pulsePod(s.refs.client, ctx, 0);
      const hop = routePacket(s, ctx, TO_W0, { delay: BEAT.afterPulse, cat: 'network' });
      pulsePod(s.refs.w0, ctx, hop.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
