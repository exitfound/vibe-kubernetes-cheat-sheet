import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow, chainList } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. The client
// Pod sits low-left with its resolv.conf, CoreDNS sits low-right, and the search-list ladder of
// candidate FQDNs sits up high in the middle (clear of the query lane at y420). A query hops pod
// -> CoreDNS along that lane. CoreDNS is infra (lights, never pulses); only the Pod pulses. The
// ladder rows light to show how many names a short lookup has to try.
const LANE_Y = 420;
const POD_EDGE = 270;
const DNS_LEFT = 900;
const CANDIDATES = ['api.ns.svc.cluster.local', 'api.svc.cluster.local', 'api.cluster.local', 'api'];

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

function lightRows(s, upto) {
  if (!s.refs.chain) return;
  s.refs.chain.querySelectorAll('.scheme-chip').forEach(r => {
    if (Number(r.getAttribute('data-idx')) <= upto) r.classList.add('highlight');
  });
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
      'aria-label': 'Search domains and ndots: a Pod resolv.conf lists search domains and ndots, so a short name with fewer dots than ndots is tried against each search domain in turn before being tried as is, costing several DNS queries, while an absolute name ending in a dot skips the search list entirely',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const shell = pod({ x: 70, y: 350, w: 200, h: 120, label: 'client Pod', sublabel: 'curl api', containers: 0, cat: 'network' });
    const shellRect = shell.querySelector('.scheme-pod-rect');
    if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
    const podGroup = g({});
    podGroup.appendChild(shell);
    const podBox = box({ x: 90, y: 384, w: 160, h: 52, label: 'resolver', sublabel: 'eth0', cat: 'network' });

    const resolv = box({ x: 70, y: 496, w: 200, h: 58, label: 'resolv.conf', sublabel: 'ndots: 5', cat: 'network' });
    const dns = box({ x: 900, y: 384, w: 220, h: 72, label: 'CoreDNS', sublabel: 'kube-dns 10.96.0.10', cat: 'network' });

    const chain = chainList({ x: 410, y: 150, w: 400, rowH: 34, gap: 6, items: CANDIDATES, activeIdx: -1, cat: 'network' });

    const qWire = arrow({ x1: POD_EDGE, y1: LANE_Y, x2: DNS_LEFT, y2: LANE_Y, dashed: true, dim: true, color: 'network' });
    const qLabel = text({ class: 'scheme-label code dim', x: 585, y: LANE_Y - 12, 'text-anchor': 'middle', 'font-size': 11 }, [' ']);

    const searchChip  = valChip({ x: 80,  y: 578, w: 300, h: 34, name: 'search', value: 'svc.cluster.local ...', cat: 'network' });
    const ndotsChip   = valChip({ x: 400, y: 578, w: 200, h: 34, name: 'ndots', value: '5', cat: 'network' });
    const queriesChip = valChip({ x: 620, y: 578, w: 230, h: 34, name: 'queries', value: '0', cat: 'network' });
    const answerChip  = valChip({ x: 870, y: 578, w: 250, h: 34, name: 'answer', value: 'none', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: Pod + resolver + resolv.conf + CoreDNS + ladder, then query wire + label above,
    // then chips, then the packet layer on top.
    root.appendChild(podGroup);
    root.appendChild(podBox);
    root.appendChild(resolv);
    root.appendChild(dns);
    root.appendChild(chain);
    [qWire, qLabel].forEach(el => root.appendChild(el));
    [searchChip, ndotsChip, queriesChip, answerChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, podGroup, podBox, resolv, dns, chain,
      searchChip, ndotsChip, queriesChip, answerChip,
      packetLayer, wires: { q: qLabel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['podBox', 'resolv', 'dns', 'searchChip', 'ndotsChip', 'queriesChip', 'answerChip'], [s.refs.podGroup]);
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
    narration: 'Every Pod gets a resolv.conf with a list of search domains and an ndots value. Together they decide how a short name is expanded, and a surprising amount of in-cluster DNS traffic comes down to this one setting.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.searchChip, 'svc.cluster.local ...');
      setVal(s.refs.ndotsChip, '5');
      setVal(s.refs.queriesChip, '0');
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
      s.refs.resolv.classList.add('highlight');
      s.refs.searchChip.classList.add('highlight');
      s.refs.ndotsChip.classList.add('highlight');
      setVal(s.refs.searchChip, 'ns.svc / svc / cluster.local');
      setVal(s.refs.ndotsChip, '5');
      // Packet-less, pod-less: flash the resolv.conf box that holds these settings.
      flashBox(s, ctx, 'resolv');
    },
  },
  {
    id: 'append',
    duration: 2600,
    narration: 'The name api has zero dots, well under ndots 5, so the resolver does not send it as is. It appends the first search domain and queries api.ns.svc.cluster.local. Here that name exists, CoreDNS answers, and the lookup is done in one query.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'q', 'api.ns.svc.cluster.local');
      lightRows(s, 0);
      s.refs.queriesChip.classList.add('highlight');
      setVal(s.refs.queriesChip, '1');
      setVal(s.refs.answerChip, 'hit');
      if (ctx.reduced) { s.refs.podBox.classList.add('highlight'); s.refs.dns.classList.add('highlight'); return; }
      // Up-arrow: the Pod pulses first, the query leaves at BEAT.afterPulse and reaches CoreDNS,
      // which lights on arrival.
      pulsePod(s.refs.podGroup, ctx, 0);
      const q = segmentPacket(s, ctx, { from: [POD_EDGE, LANE_Y], to: [DNS_LEFT, LANE_Y], delay: BEAT.afterPulse, cat: 'network' });
      lightBoxAt(s.refs.dns, ctx, q.arrivalMs);
    },
  },
  {
    id: 'walk',
    duration: 2600,
    narration: 'But if the first guess misses, the resolver walks the whole list: api.svc.cluster.local, then api.cluster.local, then finally api on its own. A name that does not exist can cost four round trips, and with IPv4 plus IPv6 lookups that doubles again.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      lightRows(s, 3);
      s.refs.queriesChip.classList.add('highlight');
      s.refs.answerChip.classList.add('highlight');
      setVal(s.refs.queriesChip, 'up to 4');
      setVal(s.refs.answerChip, 'miss -> walk list');
      // Packet-less, pod-less: flash CoreDNS to mark the repeated round trips the ladder counts.
      flashBox(s, ctx, 'dns');
    },
  },
  {
    id: 'fqdn',
    duration: 2600,
    narration: 'End the name with a dot, api.ns.svc.cluster.local. with a trailing dot, and it counts as absolute. The resolver skips the search list and sends exactly one query. Fully qualifying hot names, or lowering ndots, is the usual fix for noisy cluster DNS.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'q', 'absolute · trailing dot');
      lightRows(s, 0);
      s.refs.queriesChip.classList.add('highlight');
      setVal(s.refs.queriesChip, '1');
      setVal(s.refs.answerChip, 'hit');
      if (ctx.reduced) { s.refs.podBox.classList.add('highlight'); s.refs.dns.classList.add('highlight'); return; }
      // Up-arrow: a single absolute query, Pod pulses first then one hop to CoreDNS.
      pulsePod(s.refs.podGroup, ctx, 0);
      const q = segmentPacket(s, ctx, { from: [POD_EDGE, LANE_Y], to: [DNS_LEFT, LANE_Y], delay: BEAT.afterPulse, cat: 'network' });
      lightBoxAt(s.refs.dns, ctx, q.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
