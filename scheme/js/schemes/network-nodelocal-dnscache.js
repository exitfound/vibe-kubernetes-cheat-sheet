import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, arrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. A Node box
// holds the client Pod and the node-local-dns agent, with the upstream CoreDNS on the right. The
// query lane runs along y360: pod -> local agent (cache), and on a miss agent -> CoreDNS. The
// agent and CoreDNS are infrastructure (they light, never pulse); only the Pod pulses.
const FLOW_Y = 360;
const POD_EDGE = 290;
const AGENT_LEFT = 430;
const AGENT_RIGHT = 630;
const DNS_LEFT = 880;

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
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
      'aria-label': 'NodeLocal DNSCache: a DNS cache agent runs on every Node on a link-local address that Pods query, answering cached names locally with no cluster hop and no conntrack entry, and forwarding only misses upstream to CoreDNS over a long-lived TCP connection',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const theNode = node({ x: 70, y: 214, w: 620, h: 312, label: 'Node   ·   192.168.1.20' });

    const shell = pod({ x: 110, y: 300, w: 180, h: 120, label: 'client Pod', sublabel: 'curl api', containers: 0, cat: 'network' });
    const shellRect = shell.querySelector('.scheme-pod-rect');
    if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
    const podGroup = g({});
    podGroup.appendChild(shell);
    const podBox = box({ x: 130, y: 334, w: 140, h: 52, label: 'resolver', sublabel: 'eth0', cat: 'network' });

    const agent = box({ x: AGENT_LEFT, y: 329, w: 200, h: 62, label: 'node-local-dns', sublabel: '169.254.20.10', cat: 'network' });
    const dns = box({ x: 880, y: 329, w: 240, h: 62, label: 'CoreDNS', sublabel: 'upstream', cat: 'network' });

    const qWire = arrow({ x1: POD_EDGE, y1: FLOW_Y, x2: AGENT_LEFT, y2: FLOW_Y, dashed: true, dim: true, color: 'network' });
    const uWire = arrow({ x1: AGENT_RIGHT, y1: FLOW_Y, x2: DNS_LEFT, y2: FLOW_Y, dashed: true, dim: true, color: 'network' });
    const qLabel = text({ class: 'scheme-label code dim', x: 360, y: FLOW_Y - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    const uLabel = text({ class: 'scheme-label code dim', x: 755, y: FLOW_Y - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    const pathChip  = valChip({ x: 80,  y: 560, w: 250, h: 34, name: 'query path', value: 'idle', cat: 'network' });
    const cacheChip = valChip({ x: 350, y: 560, w: 250, h: 34, name: 'cache', value: 'empty', cat: 'network' });
    const upChip    = valChip({ x: 620, y: 560, w: 230, h: 34, name: 'upstream', value: 'none', cat: 'network' });
    const ctChip    = valChip({ x: 870, y: 560, w: 250, h: 34, name: 'conntrack', value: 'none', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: Node background, then Pod + resolver + agent + CoreDNS, then wires + labels above,
    // then chips, then the packet layer on top.
    root.appendChild(theNode);
    root.appendChild(agent);
    root.appendChild(dns);
    root.appendChild(podGroup);
    root.appendChild(podBox);
    [qWire, uWire, qLabel, uLabel].forEach(el => root.appendChild(el));
    [pathChip, cacheChip, upChip, ctChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, theNode, podGroup, podBox, agent, dns,
      pathChip, cacheChip, upChip, ctChip,
      packetLayer, wires: { q: qLabel, u: uLabel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['podBox', 'agent', 'dns', 'pathChip', 'cacheChip', 'upChip', 'ctChip'], [s.refs.podGroup]);
}

function flashBox(s, ctx, key) {
  if (ctx.reduced) return;
  const el = s.refs[key];
  if (!el) return;
  ctx.register(el.animate(
    [{ filter: 'brightness(1)' }, { filter: 'brightness(1.5)' }, { filter: 'brightness(1)' }],
    { duration: 600, easing: 'ease-out' }
  ));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Without a local cache, every Pod DNS query is a UDP packet that kube-proxy DNATs across the cluster to a CoreDNS Pod. Each lookup adds latency and a conntrack entry, and at scale that churn can overload the DNS path. NodeLocal DNSCache fixes this on the Node.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.pathChip, 'idle');
      setVal(s.refs.cacheChip, 'empty');
      setVal(s.refs.upChip, 'none');
      setVal(s.refs.ctChip, 'none');
    },
  },
  {
    id: 'agent',
    duration: 2400,
    narration: 'NodeLocal DNSCache runs a DNS agent on every Node, listening on a link-local address such as 169.254.20.10 that Pods are pointed at. A query now travels only to this agent on the same Node, never leaving the host to start with.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'q', 'dst 169.254.20.10');
      s.refs.pathChip.classList.add('highlight');
      setVal(s.refs.pathChip, 'on-node agent');
      if (ctx.reduced) { s.refs.podBox.classList.add('highlight'); s.refs.agent.classList.add('highlight'); return; }
      // Up-arrow: the Pod pulses first, the query leaves at BEAT.afterPulse and reaches the local
      // agent, which lights on arrival.
      pulsePod(s.refs.podGroup, ctx, 0);
      const q = segmentPacket(s, ctx, { from: [POD_EDGE, FLOW_Y], to: [AGENT_LEFT, FLOW_Y], delay: BEAT.afterPulse, cat: 'network' });
      lightBoxAt(s.refs.agent, ctx, q.arrivalMs);
    },
  },
  {
    id: 'hit',
    duration: 2400,
    narration: 'If the name is already cached, the agent answers right there on the Node. No packet crosses the cluster, no DNAT happens, and no conntrack entry is created. This is the fast path that most repeated lookups take.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'q', 'cached answer');
      s.refs.agent.classList.add('highlight');
      s.refs.cacheChip.classList.add('highlight');
      s.refs.ctChip.classList.add('highlight');
      setVal(s.refs.cacheChip, 'hit');
      setVal(s.refs.ctChip, 'no entry');
      if (ctx.reduced) { s.refs.podBox.classList.add('highlight'); return; }
      // Down-arrow: the cached answer leaves the agent and hops back into the Pod, which pulses on
      // arrival as the receiver.
      const back = segmentPacket(s, ctx, { from: [AGENT_LEFT, FLOW_Y], to: [POD_EDGE, FLOW_Y], cat: 'network' });
      pulsePod(s.refs.podGroup, ctx, back.arrivalMs);
    },
  },
  {
    id: 'miss',
    duration: 2600,
    narration: 'On a cache miss the agent forwards the query upstream to CoreDNS, but over a long-lived TCP connection rather than a fresh UDP flow per lookup. It caches the answer it gets back, so the next Pod asking for the same name is served locally.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'u', 'TCP to CoreDNS');
      s.refs.agent.classList.add('highlight');
      s.refs.cacheChip.classList.add('highlight');
      s.refs.upChip.classList.add('highlight');
      setVal(s.refs.cacheChip, 'miss -> fill');
      setVal(s.refs.upChip, 'TCP keep-alive');
      if (ctx.reduced) { s.refs.dns.classList.add('highlight'); return; }
      // The forwarded query leaves the agent and reaches upstream CoreDNS, which lights on arrival.
      const fwd = segmentPacket(s, ctx, { from: [AGENT_RIGHT, FLOW_Y], to: [DNS_LEFT, FLOW_Y], cat: 'network' });
      lightBoxAt(s.refs.dns, ctx, fwd.arrivalMs);
    },
  },
  {
    id: 'benefit',
    duration: 2400,
    narration: 'The payoff is two-fold: lookups served from the Node return in microseconds, and the flood of short UDP flows that used to fill the conntrack table is gone. On busy clusters this is one of the simplest ways to make DNS stop being the bottleneck.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.agent.classList.add('highlight');
      s.refs.cacheChip.classList.add('highlight');
      s.refs.ctChip.classList.add('highlight');
      setVal(s.refs.pathChip, 'on-node agent');
      setVal(s.refs.cacheChip, 'warm');
      setVal(s.refs.ctChip, 'pressure gone');
      if (ctx.reduced) return;
      // No new traffic: the Pod pulses to mark the local fast path as the steady state.
      pulsePod(s.refs.podGroup, ctx, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
