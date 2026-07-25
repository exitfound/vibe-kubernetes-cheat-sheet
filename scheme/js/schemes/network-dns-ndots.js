import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow, chainList } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt} from '../lib/network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-dns-ndots


const FLOW_Y = 290;
const LANE_DY = 12;
const FWD_Y = FLOW_Y - LANE_DY;   // 278: Pod -> CoreDNS query lane
const RET_Y = FLOW_Y + LANE_DY;   // 302: CoreDNS -> Pod answer lane
const POD_EDGE = 270;             // client Pod right edge
const DNS_LEFT = 460;             // CoreDNS left edge
const ROWS_Y = FLOW_Y - 108;      // ladder top, so its 4 rows are symmetric about FLOW_Y

const CANDIDATES = ['api.ns.svc.cluster.local', 'api.svc.cluster.local', 'api.cluster.local', 'api'];

// Run fn at a point in the step, or immediately under reduced replay so the static end-state is right.
function at(s, ctx, delay, fn) {
  if (ctx.reduced || delay <= 0) { fn(); return; }
  const a = s.refs.chain.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = fn;
  ctx.register(a);
}

function lightRow(s, i) {
  const row = s.refs.chain && s.refs.chain.querySelector(`[data-idx="${i}"]`);
  if (row) row.classList.add('highlight');
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
      'aria-label': 'Search domains and ndots: a Pod resolv.conf lists search domains and ndots, so a short name with fewer dots than ndots is tried against each search domain in turn before being tried as is, costing one round trip per candidate, while an absolute name ending in a dot skips the search list entirely',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Client Pod and CoreDNS both centred on FLOW_Y, so the two lanes meet each at its middle.
    const shell = pod({ x: 70, y: FLOW_Y - 65, w: 200, h: 130, label: 'Client Pod', sublabel: 'curl api', containers: 0, role: 'network' });
    const shellRect = shell.querySelector('.scheme-pod-rect');
    if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
    // The resolver box lives INSIDE podGroup: pulsePod walks descendants, so a box appended to the root
    // beside the shell would be left out of the pulse and the Pod would blink with a dead centre.
    const podBox = box({ x: 90, y: FLOW_Y - 29, w: 160, h: 52, label: 'resolver', sublabel: 'getaddrinfo', role: 'network' });
    const podGroup = g({});
    podGroup.appendChild(shell);
    podGroup.appendChild(podBox);

    const dns = box({ x: DNS_LEFT, y: FLOW_Y - 48, w: 220, h: 96, label: 'CoreDNS', sublabel: 'kube-dns 10.96.0.10', role: 'network' });

    // The candidate ladder: every name this one lookup may have to ask for, in the order tried.
    const chain = chainList({ x: 740, y: ROWS_Y, w: 390, rowH: 48, gap: 8, items: CANDIDATES, activeIdx: -1, role: 'network' });

    const qWire = arrow({ x1: POD_EDGE, y1: FWD_Y, x2: DNS_LEFT, y2: FWD_Y, dashed: true, dim: true, role: 'network' });
    const aWire = arrow({ x1: DNS_LEFT, y1: RET_Y, x2: POD_EDGE, y2: RET_Y, dashed: true, dim: true, role: 'network' });
    // font-size 10 and no `A? ` prefix: the lane is only 190px wide and a full FQDN at 11px overruns it
    // onto the CoreDNS box. The longest name here, api.ns.svc.cluster.local, is ~144px at this size.
    const qLabel = text({ class: 'scheme-label code dim', x: 365, y: FWD_Y - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    const aLabel = text({ class: 'scheme-label code dim', x: 365, y: RET_Y + 22, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    // resolv.conf, drawn as the file it is: the two lines that decide everything on this card.
    const rcLabel = text({ class: 'scheme-label code dim', x: 235, y: FLOW_Y + 108, 'text-anchor': 'middle', 'font-size': 11 }, ['/etc/resolv.conf']);
    const rcSearch = valChip({ x: 70, y: FLOW_Y + 120, w: 330, h: 32, name: 'search', value: 'ns.svc / svc / cluster.local', role: 'network' });
    const rcNdots = valChip({ x: 70, y: FLOW_Y + 160, w: 330, h: 32, name: 'options', value: 'ndots:5', role: 'network' });

    const namesChip = valChip({ x: 740, y: FLOW_Y + 160, w: 185, h: 32, name: 'names tried', value: '0', role: 'network' });
    const answerChip = valChip({ x: 945, y: FLOW_Y + 160, w: 185, h: 32, name: 'rcode', value: 'none', role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: Pod + resolver + CoreDNS + ladder, then the lanes and their labels above, then chips,
    // then the packet layer on top.
    root.appendChild(podGroup);
    root.appendChild(dns);
    root.appendChild(chain);
    [qWire, aWire, qLabel, aLabel].forEach(el => root.appendChild(el));
    [rcLabel, rcSearch, rcNdots, namesChip, answerChip].forEach(el => root.appendChild(el));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, podGroup, podBox, dns, chain,
      rcSearch, rcNdots, namesChip, answerChip,
      packetLayer, wires: { q: qLabel, a: aLabel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['podBox', 'dns', 'rcSearch', 'rcNdots', 'namesChip', 'answerChip'], [s.refs.podGroup]);
  s.refs.chain.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
}

function roundTrip(s, ctx, { start, lead, name, result, row = -1, pulseOnSend = true }) {
  if (pulseOnSend) pulsePod(s.refs.podGroup, ctx, start);
  // The name and its ladder row appear as the question DEPARTS, so it is always readable which
  // candidate is currently in flight, rather than only being told after the reply is back.
  at(s, ctx, start + lead, () => { setWire(s, 'q', name); if (row >= 0) lightRow(s, row); });
  const q = segmentPacket(s, ctx, { from: [POD_EDGE, FWD_Y], to: [DNS_LEFT, FWD_Y], delay: start + lead, role: 'network' });
  lightBoxAt(s.refs.dns, ctx, q.arrivalMs);
  const a = segmentPacket(s, ctx, { from: [DNS_LEFT, RET_Y], to: [POD_EDGE, RET_Y], delay: q.arrivalMs + BEAT.afterHop, role: 'network' });
  // Down-arrow: the reply lands and the Pod pulses ON ARRIVAL, the same beat it pulsed with on the way
  // out. Without this the answer just dissolves at the Pod edge and nothing acknowledges receiving it.
  pulsePod(s.refs.podGroup, ctx, a.arrivalMs);
  at(s, ctx, a.arrivalMs, () => setWire(s, 'a', result));
  return a.arrivalMs;
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Every Pod gets a resolv.conf with a list of search domains and an ndots value. Together they decide how a short name is expanded, and a surprising amount of in-cluster DNS traffic comes down to this one setting.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.namesChip, '0');
      setVal(s.refs.answerChip, 'none');
    },
  },
  {
    id: 'resolvconf',
    duration: 2400,
    narration: 'The default resolv.conf points at the kube-dns Service and lists the namespace search domains, ending with ndots set to 5. The rule is simple: if a name has fewer than ndots dots, treat it as relative and try the search domains first.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.rcSearch.classList.add('highlight');
      s.refs.rcNdots.classList.add('highlight');
      setVal(s.refs.namesChip, '0');
      setVal(s.refs.answerChip, 'none');
      if (ctx.reduced) { s.refs.podBox.classList.add('highlight'); return; }
      // No query yet: the Pod is reading its own resolv.conf, so the Pod is what moves. The chips light
      // but never blink, since a blinking block would read as traffic that has not been sent.
      pulsePod(s.refs.podGroup, ctx, 0);
    },
  },
  {
    id: 'append',
    duration: 3400,
    narration: 'The name api has zero dots, well under ndots 5, so the resolver does not send it as is. It appends the first search domain and asks for api.ns.svc.cluster.local. Here that name exists, CoreDNS answers, and the lookup is done in a single round trip.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      lightRow(s, 0);
      s.refs.namesChip.classList.add('highlight');
      s.refs.answerChip.classList.add('highlight');
      setVal(s.refs.namesChip, '1');
      setVal(s.refs.answerChip, 'NOERROR');
      if (ctx.reduced) { s.refs.podBox.classList.add('highlight'); s.refs.dns.classList.add('highlight'); return; }
      roundTrip(s, ctx, { start: 0, lead: BEAT.afterPulse, name: CANDIDATES[0], result: 'A 10.96.0.42', row: 0 });
    },
  },
  {
    id: 'walk',
    duration: 9200,
    narration: 'But if that first guess misses, the resolver does not give up, it walks the whole list: api.svc.cluster.local, then api.cluster.local, then finally api on its own. Every miss is a full round trip that ends in NXDOMAIN, so one name that does not exist costs four of them, and because the resolver asks for IPv4 and IPv6 the real total doubles again.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.namesChip.classList.add('highlight');
      s.refs.answerChip.classList.add('highlight');
      if (ctx.reduced) {
        CANDIDATES.forEach((_, i) => lightRow(s, i));
        s.refs.podBox.classList.add('highlight');
        s.refs.dns.classList.add('highlight');
        setVal(s.refs.namesChip, '4');
        setVal(s.refs.answerChip, 'NXDOMAIN x4');
        return;
      }
      setVal(s.refs.namesChip, '0');
      setVal(s.refs.answerChip, 'none');
      // The four candidates fired back to back, each a real round trip. The row lights and the counter
      // ticks as each NXDOMAIN lands, so the cost is counted on screen rather than asserted in text.
      let t = 0;
      CANDIDATES.forEach((name, i) => {
        const landed = roundTrip(s, ctx, {
          start: t,
          lead: i === 0 ? BEAT.afterPulse : 300,
          name,
          result: 'NXDOMAIN',
          row: i,
          pulseOnSend: i === 0,
        });
        at(s, ctx, landed, () => {
          setVal(s.refs.namesChip, String(i + 1));
          setVal(s.refs.answerChip, i === CANDIDATES.length - 1 ? 'NXDOMAIN x4' : 'NXDOMAIN');
        });
        t = landed + 160;
      });
    },
  },
  {
    id: 'fqdn',
    duration: 3400,
    narration: 'End the name with a dot, api.ns.svc.cluster.local. with a trailing dot, and it counts as absolute no matter what ndots says. The resolver skips the search list entirely, so not one candidate below is tried and the name is asked for exactly once. Fully qualifying hot names, or lowering ndots, is the usual fix for noisy cluster DNS.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // Deliberately NO ladder row lights here: an absolute name never touches the search list, and
      // lighting the first candidate would say the opposite of what the step is about.
      s.refs.namesChip.classList.add('highlight');
      s.refs.answerChip.classList.add('highlight');
      setVal(s.refs.namesChip, '1');
      setVal(s.refs.answerChip, 'NOERROR');
      if (ctx.reduced) { s.refs.podBox.classList.add('highlight'); s.refs.dns.classList.add('highlight'); return; }
      // The trailing dot is the entire point, so the name is shown with it and no row is lit.
      roundTrip(s, ctx, { start: 0, lead: BEAT.afterPulse, name: 'api.ns.svc.cluster.local.', result: 'A 10.96.0.42' });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
