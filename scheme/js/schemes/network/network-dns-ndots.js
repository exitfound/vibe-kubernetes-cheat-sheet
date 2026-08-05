import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, arrow, chainList, podShell } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt, at } from './network-kit.js';
// Design notes for this card: ./CARDS.md#network-dns-ndots


// Panel right <= 397, bottom <= 230, so the flow row hangs below it and the two blocks hold
// CONTENT_L and CONTENT_R, which centres the content on 600.
const CONTENT_L = 70, CONTENT_R = 1130;
const FLOW_Y = 400;
const LANE_DY = 12;
const FWD_Y = FLOW_Y - LANE_DY;   // 388: Pod -> CoreDNS query lane
const RET_Y = FLOW_Y + LANE_DY;   // 412: CoreDNS -> Pod answer lane

const POD_X = CONTENT_L, POD_W = 340, POD_H = 130;
const POD_EDGE = POD_X + POD_W;   // 410: client Pod right edge
const DNS_W = 340, DNS_H = 96;
const DNS_LEFT = CONTENT_R - DNS_W;   // 790: CoreDNS left edge

// The candidate ladder sits in the free top-right band, above CoreDNS and clear of the panel.
const ROWS_X = 740, ROWS_W = 390, ROWS_Y = 60, ROW_H = 48, ROW_GAP = 8;

// resolv.conf under the Pod on the left, the two counters under CoreDNS on the right: together the
// chip rows span CONTENT_L..CONTENT_R, so the chip strip centres on x=600 as well.
const RC_X = CONTENT_L, RC_W = 330, RC_H = 32;
const RC_Y = 512, RC_Y2 = 552;
const CNT_W = 185, CNT_Y = 512;
const CNT_X1 = ROWS_X;                       // 740
const CNT_X2 = CONTENT_R - CNT_W;            // 945

// Query and answer lanes. Wire and ball come from the same array.
const QUERY = [[POD_EDGE, FWD_Y], [DNS_LEFT, FWD_Y]];
const ANSWER = [[DNS_LEFT, RET_Y], [POD_EDGE, RET_Y]];
const LANE_CX = (POD_EDGE + DNS_LEFT) / 2;   // 600, where both lane labels sit

const CANDIDATES = ['api.ns.svc.cluster.local', 'api.svc.cluster.local', 'api.cluster.local', 'api'];


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
    const shell = podShell({ x: POD_X, y: FLOW_Y - POD_H / 2, w: POD_W, h: POD_H, label: 'Client Pod', sublabel: 'curl api', containers: 0, role: 'network' });
    // The resolver box lives INSIDE podGroup: pulsePod walks descendants, so a box appended to the root
    // beside the shell would be left out of the pulse and the Pod would blink with a dead centre.
    const podBox = box({ x: POD_X + 20, y: FLOW_Y - 26, w: POD_W - 40, h: 52, label: 'Resolver', sublabel: 'getaddrinfo', role: 'network' });
    const podGroup = g({});
    podGroup.appendChild(shell);
    podGroup.appendChild(podBox);

    const dns = box({ x: DNS_LEFT, y: FLOW_Y - DNS_H / 2, w: DNS_W, h: DNS_H, label: 'CoreDNS', sublabel: 'kube-dns 10.96.0.10', role: 'network' });

    // The candidate ladder: every name this one lookup may have to ask for, in the order tried.
    const chain = chainList({ x: ROWS_X, y: ROWS_Y, w: ROWS_W, rowH: ROW_H, gap: ROW_GAP, items: CANDIDATES, activeIdx: -1, role: 'network' });

    const qWire = arrow({ x1: QUERY[0][0], y1: QUERY[0][1], x2: QUERY[1][0], y2: QUERY[1][1], dashed: true, dim: true, role: 'network' });
    const aWire = arrow({ x1: ANSWER[0][0], y1: ANSWER[0][1], x2: ANSWER[1][0], y2: ANSWER[1][1], dashed: true, dim: true, role: 'network' });
    // No `A? ` prefix: measured at the real 11px, the longest string either label takes is 172 units,
    // spanning 514..686 and clearing both block edges by 104. Do not size off a `font-size` attribute.
    const qLabel = text({ class: 'scheme-label code dim', x: LANE_CX, y: FWD_Y - 12, 'text-anchor': 'middle' }, [' ']);
    const aLabel = text({ class: 'scheme-label code dim', x: LANE_CX, y: RET_Y + 22, 'text-anchor': 'middle' }, [' ']);

    // resolv.conf, drawn as the file it is: the two lines that decide everything on this card.
    const rcLabel = text({ class: 'scheme-label code dim', x: RC_X + RC_W / 2, y: RC_Y - 12, 'text-anchor': 'middle' }, ['/etc/resolv.conf']);
    const rcSearch = valChip({ x: RC_X, y: RC_Y, w: RC_W, h: RC_H, name: 'search', value: 'ns.svc / svc / cluster.local', role: 'network' });
    const rcNdots = valChip({ x: RC_X, y: RC_Y2, w: RC_W, h: RC_H, name: 'options', value: 'ndots:5', role: 'network' });

    const namesChip = valChip({ x: CNT_X1, y: CNT_Y, w: CNT_W, h: RC_H, name: 'names tried', value: '0', role: 'network' });
    const answerChip = valChip({ x: CNT_X2, y: CNT_Y, w: CNT_W, h: RC_H, name: 'rcode', value: 'none', role: 'network' });

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

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  clearHighlights(s, ['podBox', 'dns', 'rcSearch', 'rcNdots', 'namesChip', 'answerChip'], [s.refs.podGroup]);
  s.refs.chain.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
  clearWires(s);
}

function roundTrip(s, ctx, { start, lead, name, result, row = -1, pulseOnSend = true }) {
  if (pulseOnSend) pulsePod(s.refs.podGroup, ctx, start);
  // The name and its ladder row appear as the question DEPARTS, so it is always readable which
  // candidate is currently in flight, rather than only being told after the reply is back.
  at(s, ctx, start + lead, () => { setWire(s, 'q', name); if (row >= 0) lightRow(s, row); });
  const q = segmentPacket(s, ctx, { from: QUERY[0], to: QUERY[1], delay: start + lead, role: 'network' });
  lightBoxAt(s.refs.dns, ctx, q.arrivalMs);
  const a = segmentPacket(s, ctx, { from: ANSWER[0], to: ANSWER[1], delay: q.arrivalMs + BEAT.afterHop, role: 'network' });
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
    enter(s) {
      resetStep(s);
      setVal(s.refs.namesChip, '0');
      setVal(s.refs.answerChip, 'none');
    },
  },
  {
    id: 'resolvconf',
    duration: 2400,
    narration: 'The default resolv.conf points at the kube-dns Service and lists the namespace search domains, ending with ndots set to 5. The rule is simple: if a name has fewer than ndots dots, treat it as relative and try the search domains first.',
    enter(s, ctx) {
      resetStep(s);
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
    // Motion: pulse beat (800) + one round trip on the 380 unit lane (~1790) + the Pod pulse on the
    // answer (900) ends at ~3490.
    duration: 3600,
    narration: 'The name api has zero dots, well under ndots 5, so the resolver does not send it as is. It appends the first search domain and asks for api.ns.svc.cluster.local. Here that name exists, CoreDNS answers, and the lookup is done in a single round trip.',
    enter(s, ctx) {
      resetStep(s);
      lightRow(s, 0);
      s.refs.namesChip.classList.add('highlight');
      s.refs.answerChip.classList.add('highlight');
      setVal(s.refs.namesChip, '1');
      setVal(s.refs.answerChip, 'NOERROR');
      if (ctx.reduced) {
        s.refs.podBox.classList.add('highlight');
        s.refs.dns.classList.add('highlight');
        // Both lane labels are written from inside roundTrip, which never runs on this path, so the
        // question and its answer have to be restated here or prev/reset shows two blank lanes.
        setWire(s, 'q', 'api.ns.svc.cluster.local');
        setWire(s, 'a', 'A 10.96.0.42');
        return;
      }
      roundTrip(s, ctx, { start: 0, lead: BEAT.afterPulse, name: CANDIDATES[0], result: 'A 10.96.0.42', row: 0 });
    },
  },
  {
    id: 'walk',
    // Four round trips back to back on the same lane, ~2090 each after the first, and the last one
    // still has to finish its arrival pulse: the motion runs to ~10230.
    duration: 10400,
    narration: 'But if that first guess misses, the resolver does not give up, it walks the whole list: api.svc.cluster.local, then api.cluster.local, then finally api on its own. Every miss is a full round trip that ends in NXDOMAIN, so one name that does not exist costs four of them, and because the resolver asks for IPv4 and IPv6 the real total doubles again.',
    enter(s, ctx) {
      resetStep(s);
      s.refs.namesChip.classList.add('highlight');
      s.refs.answerChip.classList.add('highlight');
      if (ctx.reduced) {
        CANDIDATES.forEach((_, i) => lightRow(s, i));
        s.refs.podBox.classList.add('highlight');
        s.refs.dns.classList.add('highlight');
        setVal(s.refs.namesChip, '4');
        setVal(s.refs.answerChip, 'NXDOMAIN x4');
        // The lanes end the step on the LAST candidate and its miss, the state the fourth round
        // trip leaves behind, since roundTrip does not run on this path to write them.
        setWire(s, 'q', 'api');
        setWire(s, 'a', 'NXDOMAIN');
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
    // One round trip, same budget as the append step.
    duration: 3600,
    narration: 'A trailing dot makes the name absolute no matter what ndots says, as in api.ns.svc.cluster.local., so the resolver skips the search list entirely and not one candidate below is tried. The name goes on the wire exactly once. Fully qualifying hot names, or lowering ndots, is the usual fix for noisy cluster DNS.',
    enter(s, ctx) {
      resetStep(s);
      // Deliberately NO ladder row lights here: an absolute name never touches the search list, and
      // lighting the first candidate would say the opposite of what the step is about.
      s.refs.namesChip.classList.add('highlight');
      s.refs.answerChip.classList.add('highlight');
      setVal(s.refs.namesChip, '1');
      setVal(s.refs.answerChip, 'NOERROR');
      if (ctx.reduced) {
        s.refs.podBox.classList.add('highlight');
        s.refs.dns.classList.add('highlight');
        // The absolute name and its answer, restated for the path that never enters roundTrip. The
        // trailing dot has to survive here too: it is the whole subject of the step.
        setWire(s, 'q', 'api.ns.svc.cluster.local.');
        setWire(s, 'a', 'A 10.96.0.42');
        return;
      }
      // The trailing dot is the entire point, so the name is shown with it and no row is lit.
      roundTrip(s, ctx, { start: 0, lead: BEAT.afterPulse, name: 'api.ns.svc.cluster.local.', result: 'A 10.96.0.42' });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
