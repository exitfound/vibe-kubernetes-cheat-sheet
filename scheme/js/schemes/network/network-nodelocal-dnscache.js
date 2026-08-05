import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, node, arrow, podShell } from '../../lib/primitives.js';
import { at, valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt } from './network-kit.js';
// Design notes for this card: scheme/docs/CARDS-network.md#network-nodelocal-dnscache


const FLOW_Y = 300;
const LANE_DY = 12;
const FWD_Y = FLOW_Y - LANE_DY;   // 288: query lanes (Pod -> agent, agent -> CoreDNS)
const RET_Y = FLOW_Y + LANE_DY;   // 312: answer lanes (agent -> Pod, CoreDNS -> agent)
const POD_EDGE = 290;
const AGENT_LEFT = 430;
const AGENT_RIGHT = 630;
const DNS_LEFT = 880;

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'NodeLocal DNSCache: a DNS cache agent runs as a DaemonSet on every Node on a link-local address that Pods query, answering cached names locally with no cluster hop and no conntrack entry, and forwarding only misses upstream to CoreDNS over a long-lived TCP connection',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const theNode = node({ x: 70, y: 200, w: 620, h: 220, label: 'Node   ·   192.168.1.20' });

    const shell = podShell({ x: 110, y: FLOW_Y - 60, w: 180, h: 120, label: 'Client Pod', sublabel: 'curl api', containers: 0, role: 'network' });
    // The resolver box lives INSIDE podGroup: pulsePod walks descendants, so a box appended beside the
    // shell would be left out of the pulse and the Pod would blink with a dead centre.
    const podBox = box({ x: 130, y: FLOW_Y - 26, w: 140, h: 52, label: 'Resolver', sublabel: 'getaddrinfo', role: 'network' });
    const podGroup = g({});
    podGroup.appendChild(shell);
    podGroup.appendChild(podBox);

    const agent = box({ x: AGENT_LEFT, y: FLOW_Y - 31, w: 200, h: 62, label: 'node-local-dns', sublabel: '169.254.20.10', role: 'network' });
    const dns = box({ x: DNS_LEFT, y: FLOW_Y - 31, w: 240, h: 62, label: 'CoreDNS', sublabel: 'kube-dns 10.96.0.10', role: 'network' });

    // One wire per direction per hop. The same endpoints feed the balls, so no ball ever travels over a
    // line that was drawn pointing the other way.
    const qWire = arrow({ x1: POD_EDGE, y1: FWD_Y, x2: AGENT_LEFT, y2: FWD_Y, dashed: true, dim: true, role: 'network' });
    const aWire = arrow({ x1: AGENT_LEFT, y1: RET_Y, x2: POD_EDGE, y2: RET_Y, dashed: true, dim: true, role: 'network' });
    const uWire = arrow({ x1: AGENT_RIGHT, y1: FWD_Y, x2: DNS_LEFT, y2: FWD_Y, dashed: true, dim: true, role: 'network' });
    const dWire = arrow({ x1: DNS_LEFT, y1: RET_Y, x2: AGENT_RIGHT, y2: RET_Y, dashed: true, dim: true, role: 'network' });

    const qLabel = text({ class: 'scheme-label code dim', x: 360, y: FWD_Y - 12, 'text-anchor': 'middle' }, [' ']);
    const aLabel = text({ class: 'scheme-label code dim', x: 360, y: RET_Y + 22, 'text-anchor': 'middle' }, [' ']);
    const uLabel = text({ class: 'scheme-label code dim', x: 755, y: FWD_Y - 12, 'text-anchor': 'middle' }, [' ']);
    const dLabel = text({ class: 'scheme-label code dim', x: 755, y: RET_Y + 22, 'text-anchor': 'middle' }, [' ']);

    const pathChip = valChip({ x: 80, y: 450, w: 250, h: 34, name: 'query path', value: 'idle', role: 'network' });
    const cacheChip = valChip({ x: 350, y: 450, w: 250, h: 34, name: 'cache', value: 'empty', role: 'network' });
    const upChip = valChip({ x: 620, y: 450, w: 230, h: 34, name: 'upstream', value: 'none', role: 'network' });
    const ctChip = valChip({ x: 870, y: 450, w: 250, h: 34, name: 'conntrack', value: 'none', role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: Node background, then agent + CoreDNS + Pod, then wires + labels above, then chips,
    // then the packet layer on top.
    root.appendChild(theNode);
    root.appendChild(agent);
    root.appendChild(dns);
    root.appendChild(podGroup);
    [qWire, aWire, uWire, dWire, qLabel, aLabel, uLabel, dLabel].forEach(el => root.appendChild(el));
    [pathChip, cacheChip, upChip, ctChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, theNode, podGroup, podBox, agent, dns,
      pathChip, cacheChip, upChip, ctChip,
      packetLayer, wires: { q: qLabel, a: aLabel, u: uLabel, d: dLabel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['podBox', 'agent', 'dns', 'pathChip', 'cacheChip', 'upChip', 'ctChip'], [s.refs.podGroup]);
}

function setChips(s, { path, cache, up, ct }, lit = []) {
  setVal(s.refs.pathChip, path);
  setVal(s.refs.cacheChip, cache);
  setVal(s.refs.upChip, up);
  setVal(s.refs.ctChip, ct);
  lit.forEach(k => s.refs[k].classList.add('highlight'));
}

// The Pod asks its on-Node agent. Returns the ms the question lands at the agent.
function ask(s, ctx, { start = 0, wire } = {}) {
  pulsePod(s.refs.podGroup, ctx, start);
  at(s, ctx, start + BEAT.afterPulse, () => setWire(s, 'q', wire));
  const q = segmentPacket(s, ctx, { from: [POD_EDGE, FWD_Y], to: [AGENT_LEFT, FWD_Y], delay: start + BEAT.afterPulse, role: 'network' });
  lightBoxAt(s.refs.agent, ctx, q.arrivalMs);
  return q.arrivalMs;
}

// The agent answers the Pod on the RETURN lane, and the Pod pulses as it receives.
function answer(s, ctx, { start, wire } = {}) {
  at(s, ctx, start, () => setWire(s, 'a', wire));
  const a = segmentPacket(s, ctx, { from: [AGENT_LEFT, RET_Y], to: [POD_EDGE, RET_Y], delay: start, role: 'network' });
  pulsePod(s.refs.podGroup, ctx, a.arrivalMs);
  return a.arrivalMs;
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // The rest state is the world BEFORE the agent exists, which is exactly what this step narrates.
      setChips(s, { path: 'cluster hop', cache: 'none', up: 'UDP per lookup', ct: 'entry per lookup' });
    },
  },
  {
    id: 'agent',
    duration: 2600,
    narration: 'NodeLocal DNSCache runs as a DaemonSet, so a DNS agent sits on every Node listening on a link-local address such as 169.254.20.10, and the Kubelet cluster-dns setting points every Pod resolv.conf at it. A query now travels only to this agent on the same Node, never leaving the host to start with. In iptables mode the agent can bind the kube-dns ClusterIP too, so Pods reach it either way.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { path: 'on-node agent', cache: 'empty', up: 'not used', ct: 'no entry' }, ['pathChip', 'cacheChip', 'upChip', 'ctChip']);
      if (ctx.reduced) {
        s.refs.podBox.classList.add('highlight');
        s.refs.agent.classList.add('highlight');
        setWire(s, 'q', 'dst 169.254.20.10');
        return;
      }
      ask(s, ctx, { start: 0, wire: 'dst 169.254.20.10' });
    },
  },
  {
    id: 'hit',
    duration: 3600,
    narration: 'If the name is already cached, the agent answers right there on the Node. No packet crosses the cluster, no DNAT happens, and because the agent installs NOTRACK rules for its own traffic, no conntrack entry is created either. This is the fast path that most repeated lookups take.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { path: 'on-node agent', cache: 'hit', up: 'not used', ct: 'no entry' }, ['cacheChip', 'ctChip']);
      if (ctx.reduced) {
        s.refs.podBox.classList.add('highlight');
        s.refs.agent.classList.add('highlight');
        setWire(s, 'q', 'dst 169.254.20.10');
        setWire(s, 'a', 'cached answer');
        return;
      }
      // The whole fast path in one beat: ask on the forward lane, answered on the return lane. The
      // answer rides its OWN wire, so it never retraces the arrow the question went out on.
      const asked = ask(s, ctx, { start: 0, wire: 'dst 169.254.20.10' });
      answer(s, ctx, { start: asked + BEAT.afterHop, wire: 'cached answer' });
    },
  },
  {
    id: 'miss',
    duration: 5400,
    narration: 'On a cache miss the agent forwards the query upstream to CoreDNS, but over a long-lived TCP connection rather than a fresh UDP flow per lookup. It caches the answer it gets back before passing it to the Pod, so the next Pod on this Node asking for the same name is served locally.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { path: 'agent -> CoreDNS', cache: 'miss -> fill', up: 'TCP keep-alive', ct: '1 long-lived' }, ['cacheChip', 'upChip', 'ctChip', 'pathChip']);
      if (ctx.reduced) {
        s.refs.podBox.classList.add('highlight');
        s.refs.agent.classList.add('highlight');
        s.refs.dns.classList.add('highlight');
        setWire(s, 'q', 'dst 169.254.20.10');
        setWire(s, 'u', 'TCP to CoreDNS');
        setWire(s, 'd', 'answer cached');
        setWire(s, 'a', 'answer to Pod');
        return;
      }
      const asked = ask(s, ctx, { start: 0, wire: 'dst 169.254.20.10' });
      at(s, ctx, asked, () => setWire(s, 'u', 'TCP to CoreDNS'));
      const fwd = segmentPacket(s, ctx, { from: [AGENT_RIGHT, FWD_Y], to: [DNS_LEFT, FWD_Y], delay: asked + BEAT.afterHop, role: 'network' });
      lightBoxAt(s.refs.dns, ctx, fwd.arrivalMs);
      at(s, ctx, fwd.arrivalMs, () => setWire(s, 'd', 'answer cached'));
      const back = segmentPacket(s, ctx, { from: [DNS_LEFT, RET_Y], to: [AGENT_RIGHT, RET_Y], delay: fwd.arrivalMs + BEAT.afterHop, role: 'network' });
      answer(s, ctx, { start: back.arrivalMs + BEAT.afterHop, wire: 'answer to Pod' });
    },
  },
  {
    id: 'benefit',
    duration: 3600,
    narration: 'The payoff is two-fold: a warm name is served from the Node without a single packet leaving it, and the flood of short-lived UDP flows that used to fill the conntrack table is gone. On busy clusters this is one of the simplest ways to make DNS stop being the bottleneck.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { path: 'on-node agent', cache: 'warm', up: 'idle', ct: 'pressure gone' }, ['pathChip', 'cacheChip', 'ctChip', 'upChip']);
      if (ctx.reduced) {
        s.refs.podBox.classList.add('highlight');
        s.refs.agent.classList.add('highlight');
        setWire(s, 'q', 'dst 169.254.20.10');
        setWire(s, 'a', 'served locally');
        return;
      }
      // The steady state IS the fast path, so replay it rather than pulsing at nothing: this is what
      // every lookup looks like once the cache is warm, and CoreDNS stays dark throughout.
      const asked = ask(s, ctx, { start: 0, wire: 'dst 169.254.20.10' });
      answer(s, ctx, { start: asked + BEAT.afterHop, wire: 'served locally' });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
