import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, box, cylinder, chainList, arrow, fadeIn } from '../lib/primitives.js';
import { valChip, setVal, segmentPacket, topPacket, makeInit, clearHighlights, clearWires, setWire, CLUSTER_TINT, FADE, BEAT } from '../lib/cluster-kit.js';
import { PULSE_POD } from '../lib/tokens.js';
// Design notes for this card: scheme/docs/CARDS.md#cluster-api-structure


function eventSlot({ x, y, w = 140, h = 44, role = 'cluster' }) {
  const grp = g({ class: 'scheme-chip', 'data-role': role, transform: `translate(${x},${y})` });
  grp.appendChild(rect({ class: 'scheme-chip-rect', x: 0, y: 0, width: w, height: h, rx: 4 }));
  const top = text({ class: 'scheme-chip-text', x: w / 2, y: h / 2 - 2, 'text-anchor': 'middle' }, ['none']);
  const bot = text({ class: 'scheme-chip-text', x: w / 2, y: h / 2 + 12, 'text-anchor': 'middle' }, ['']);
  bot.style.opacity = '0.7';
  grp.appendChild(top);
  grp.appendChild(bot);
  grp._top = top;
  grp._bot = bot;
  return grp;
}
function setSlot(slot, type, sub) {
  if (!slot) return;
  if (slot._top) slot._top.textContent = type;
  if (slot._bot) slot._bot.textContent = sub;
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
      'aria-label': 'List-watch cycle: discovery, LIST, watch, re-list, CRD',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = box({ x: 220, y: 60, w: 200, h: 80, label: 'Client', sublabel: 'client-go controller', role: 'cluster' });
    const api = box({ x: 490, y: 60, w: 220, h: 80, label: 'Api', sublabel: 'discovery: /api · /apis', role: 'cluster' });
    const etcdC = cylinder({ x: 780, y: 50, w: 140, h: 100, label: 'ETCD', role: 'cluster' });
    const etcdLbl = etcdC.querySelector('.scheme-cylinder-label');
    if (etcdLbl) etcdLbl.setAttribute('y', 60);

    const rvChip    = valChip({ x: 800, y: 217, w: 240, h: 32, name: 'resourceVersion', value: 'none', role: 'cluster' });
    const watchChip = valChip({ x: 800, y: 255, w: 240, h: 32, name: 'watch',           value: 'closed', role: 'cluster' });
    const cacheChip = valChip({ x: 800, y: 293, w: 240, h: 32, name: 'cache size',      value: '0', role: 'cluster' });
    root.appendChild(rvChip); root.appendChild(watchChip); root.appendChild(cacheChip);

    // Centre spine under Api (cx=600), generous vertical spacing: Informer feeds the Indexer.
    const informer = box({ x: 510, y: 235, w: 180, h: 72, label: 'Informer', sublabel: 'shared list-watch', role: 'cluster' });
    const cache = cylinder({ x: 510, y: 390, w: 180, h: 110, label: 'Indexer', role: 'cluster' });
    const cacheLbl = cache.querySelector('.scheme-cylinder-label');
    if (cacheLbl) cacheLbl.setAttribute('y', 66);
    root.appendChild(cache);

    const gvr = chainList({
      x: 100, y: 217, w: 300, rowH: 32, gap: 6,
      items: [
        '/api/v1/pods',
        '/apis/apps/v1/deployments',
        '/apis/batch/v1/jobs',
        '/apis/example.com/v1/widgets (CRD)',
      ],
      role: 'cluster',
    });
    root.appendChild(gvr);
    const crdRow = gvr.querySelector('[data-idx="3"]');
    if (crdRow) crdRow.style.opacity = '0';

    const streamLabel = text({ class: 'scheme-label dim code', x: 600, y: 536, 'text-anchor': 'middle' }, ['watch event stream (resourceVersion grows)']);
    streamLabel.style.opacity = '0';
    root.appendChild(streamLabel);
    const slots = [];
    const slotXs = [290, 450, 610, 770];
    for (let i = 0; i < 4; i++) {
      const slot = eventSlot({ x: slotXs[i], y: 548 });
      slot.style.opacity = '0';
      root.appendChild(slot);
      slots.push(slot);
    }

    // Top-row arrows: out at y=85, return at y=115 (straddle the block centre y=100).
    root.appendChild(arrow({ x1: 420, y1: 85,  x2: 490, y2: 85,  dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: 490, y1: 115, x2: 420, y2: 115, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: 710, y1: 85,  x2: 780, y2: 85,  dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: 780, y1: 115, x2: 710, y2: 115, dim: true, dashed: true, role: 'cluster' }));

    // Watch stream: straight vertical drop Api → Informer (cx=600).
    const watchArrow = arrow({ x1: 600, y1: 144, x2: 600, y2: 231, dim: true, dashed: true, role: 'cluster' });
    root.appendChild(watchArrow);

    // Internal: Informer → Indexer (events feed the cache).
    root.appendChild(arrow({ x1: 600, y1: 309, x2: 600, y2: 386, dim: true, dashed: true, role: 'cluster' }));

    // Wire labels at fixed positions, populated per step.
    const wireReq      = text({ class: 'scheme-label code dim', x: 455, y: 46,  'text-anchor': 'middle' }, [' ']);
    const wireApiEtcd  = text({ class: 'scheme-label code dim', x: 745, y: 46,  'text-anchor': 'middle' }, [' ']);
    const wireWatch    = text({ class: 'scheme-label code dim', x: 620, y: 192, 'text-anchor': 'start'  }, [' ']);
    const wireEtcdRet  = text({ class: 'scheme-label code dim', x: 745, y: 158, 'text-anchor': 'middle' }, [' ']);
    const wireGvr      = text({ class: 'scheme-label code dim', x: 250, y: 205, 'text-anchor': 'middle' }, [' ']);
    const wireEvent    = text({ class: 'scheme-label code dim', x: 620, y: 352, 'text-anchor': 'start'  }, [' ']);
    [wireReq, wireApiEtcd, wireWatch, wireEtcdRet, wireGvr, wireEvent].forEach(t => root.appendChild(t));

    // Packet layer (cleared and refilled per step).
    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(client);
    root.appendChild(api);
    root.appendChild(etcdC);
    root.appendChild(informer);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      client, informer, cache, api, gvr, etcdC,
      rvChip, watchChip, cacheChip,
      watchArrow,
      slots,
      streamLabel,
      packetLayer,
      wires: {
        req:        wireReq,
        'api-etcd': wireApiEtcd,
        watch:      wireWatch,
        'etcd-ret': wireEtcdRet,
        gvr:        wireGvr,
        event:      wireEvent,
      },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['client','informer','cache','api','etcdC','rvChip','watchChip','cacheChip']);
  // Card-specific extras: the GVR catalogue rows and the event slots.
  s.refs.gvr.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
  s.refs.slots.forEach(slot => slot.classList.remove('highlight'));
}

function resetWatchArrow(s) {
  if (s.refs.watchArrow) {
    s.refs.watchArrow.style.strokeDasharray = '';
    s.refs.watchArrow.style.strokeDashoffset = '';
  }
}

function hideAllSlots(s) {
  s.refs.slots.forEach(slot => { slot.style.opacity = '0'; setSlot(slot, 'none', ''); });
  // The "watch event stream" caption only makes sense with slots on screen.
  if (s.refs.streamLabel) s.refs.streamLabel.style.opacity = '0';
}

function pulseSlot(slot, ctx, delay = 0) {
  if (!slot) return;
  const RAMP = PULSE_POD.ms / 2;
  const rect = slot.querySelector('.scheme-chip-rect');
  if (rect) {
    const rest = getComputedStyle(rect).stroke; // the steady .highlight stroke colour
    rect.style.transition = 'none';
    const up = rect.animate([
      { stroke: rest,                strokeWidth: 2.4 },
      { stroke: CLUSTER_TINT.bright, strokeWidth: 3.2 },
    ], { duration: RAMP, delay, fill: 'forwards', easing: 'ease-in-out' });
    ctx.register(up);
    const down = rect.animate([
      { stroke: CLUSTER_TINT.bright, strokeWidth: 3.2 },
      { stroke: rest,                strokeWidth: 2.4 },
    ], { duration: RAMP, delay: delay + RAMP, fill: 'forwards', easing: 'ease-in-out' });
    ctx.register(down);
    down.onfinish = () => { rect.style.stroke = ''; rect.style.strokeWidth = ''; rect.style.transition = ''; };
  }
  ctx.register(slot.animate(
    [{ filter: 'brightness(1)' }, { filter: `brightness(${PULSE_POD.bright})` }, { filter: 'brightness(1)' }],
    { duration: PULSE_POD.ms, delay, fill: 'forwards', easing: 'ease-in-out' }));
}

const STEPS = [
  {
    id: 'discovery',
    duration: 1900,
    narration: 'The Api is a catalogue of GVRs grouped by core/v1, apps/v1, batch/v1. Non-core groups follow /apis/<group>/<version>/<resource>, and the legacy core group lives under /api/v1/<resource>. The client first calls /api and /apis on the Api to discover this catalogue, including any CRDs that have registered.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      resetWatchArrow(s);
      clearHL(s);
      clearWires(s);
      hideAllSlots(s);
      setVal(s.refs.rvChip, 'none');
      setVal(s.refs.watchChip, 'closed');
      setVal(s.refs.cacheChip, '0');
      setWire(s, 'req', 'GET /api  +  GET /apis');
      setWire(s, 'gvr', 'GVR catalogue');
      s.refs.client.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      if (ctx.reduced) return;
      // The client calls /api and /apis on the Api to fetch the GVR catalogue.
      topPacket(s, ctx, { from: 420, to: 490, y: 85, role: 'cluster' });
    },
  },
  {
    id: 'list',
    duration: 2400,
    narration: 'The informer fires the initial LIST. The Api reads from ETCD and returns the full set at a snapshot resourceVersion (rv=842). The informer fills its Indexer cache, and the controller can now reconcile from local memory without hitting the Api again.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      resetWatchArrow(s);
      clearHL(s);
      clearWires(s);
      hideAllSlots(s);
      setVal(s.refs.rvChip, '842');
      setVal(s.refs.cacheChip, '3');
      setWire(s, 'req', 'LIST /api/v1/pods · rv=842');
      // Actors named by the narration: the Api reads ETCD and the Informer fills its Indexer.
      s.refs.api.classList.add('highlight');
      s.refs.etcdC.classList.add('highlight');
      s.refs.informer.classList.add('highlight');
      s.refs.cache.classList.add('highlight');
      const labels = [['ADDED', 'pod-a · rv=840'], ['ADDED', 'pod-b · rv=841'], ['ADDED', 'pod-c · rv=842']];
      s.refs.slots.slice(0, 3).forEach((slot, i) => {
        setSlot(slot, labels[i][0], labels[i][1]);
        slot.style.opacity = '1';
      });
      // Caption is the cancel/reduced final; the fade below back-fills it hidden until arrival.
      s.refs.streamLabel.style.opacity = '1';
      if (ctx.reduced) return;
      const read    = segmentPacket(s, ctx, { from: [780, 115], to: [710, 115], role: 'cluster' });
      const stream  = segmentPacket(s, ctx, { from: [600, 150], to: [600, 229], delay: read.arrivalMs + BEAT.afterHop, role: 'cluster' });
      const toCache = segmentPacket(s, ctx, { from: [600, 312], to: [600, 384], delay: stream.arrivalMs + BEAT.afterHop, role: 'cluster' });
      s.refs.slots.slice(0, 3).forEach((slot, i) => {
        ctx.register(slot.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400 + i * 120, delay: toCache.arrivalMs, fill: 'both' }));
      });
      // The caption reveals together with the first item.
      ctx.register(s.refs.streamLabel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: toCache.arrivalMs, fill: 'both', easing: 'ease-out' }));
    },
  },
  {
    id: 'watch',
    duration: 2000,
    narration: 'The informer opens GET /api/v1/pods?watch=true&resourceVersion=842. The Api streams every change since that RV as a chunked HTTP response. The connection stays open for as long as the controller wants.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      resetWatchArrow(s);
      clearHL(s);
      clearWires(s);
      setVal(s.refs.watchChip, 'open · chunked HTTP');
      setWire(s, 'watch', 'chunked HTTP · streaming');
      s.refs.api.classList.add('highlight');
      s.refs.informer.classList.add('highlight');
      s.refs.watchChip.classList.add('highlight');
      s.refs.slots.slice(0, 3).forEach(slot => { slot.style.opacity = '1'; });
      s.refs.streamLabel.style.opacity = '1';
      if (ctx.reduced) return;
      // Watch stream: Api -> Informer, straight vertical drop.
      segmentPacket(s, ctx, { from: [600, 150], to: [600, 229], role: 'cluster' });
    },
  },
  {
    id: 'event',
    duration: 2400,
    narration: 'A new pod lands in ETCD. The Api pushes an ADDED event over the open watch (rv=843). The informer enqueues the object key and updates the Indexer cache.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      resetWatchArrow(s);
      clearHL(s);
      clearWires(s);
      setVal(s.refs.rvChip, '843');
      setVal(s.refs.cacheChip, '4');
      setVal(s.refs.watchChip, 'open · streaming');
      setWire(s, 'watch', 'ADDED · rv=843');
      s.refs.etcdC.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      s.refs.informer.classList.add('highlight');
      s.refs.cache.classList.add('highlight');
      s.refs.slots.slice(0, 3).forEach(slot => { slot.style.opacity = '1'; });
      s.refs.streamLabel.style.opacity = '1';
      const fourth = s.refs.slots[3];
      setSlot(fourth, 'ADDED', 'pod-d · rv=843');
      fourth.classList.add('highlight');
      fourth.style.opacity = '1';
      if (ctx.reduced) return;
      // The ADDED event's journey as three sequenced hops on their real arrows:
      // etcd -> Api (watch return), Api -> Informer (watch stream), Informer -> Indexer.
      const ret = segmentPacket(s, ctx, { from: [780, 115], to: [710, 115], role: 'cluster' });
      const stream = segmentPacket(s, ctx, { from: [600, 150], to: [600, 229], delay: ret.arrivalMs + BEAT.afterHop, role: 'cluster' });
      const toCache = segmentPacket(s, ctx, { from: [600, 312], to: [600, 384], delay: stream.arrivalMs + BEAT.afterHop, role: 'cluster' });
      ctx.register(fourth.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: toCache.arrivalMs, fill: 'both', easing: 'ease-out' }));
      // ...and pulses as it lands, the same pod-block pulse as the postStart/preStop card.
      pulseSlot(fourth, ctx, toCache.arrivalMs);
    },
  },
  {
    id: 'relist-on-410',
    duration: 1900,
    narration: 'If the Api has compacted history past the resourceVersion the informer holds, the next watch chunk returns HTTP 410 Gone. The informer drops its watch, re-LISTs to a fresh resourceVersion, and resumes the watch.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      resetWatchArrow(s);
      clearHL(s);
      clearWires(s);
      hideAllSlots(s);
      setVal(s.refs.watchChip, '410 Gone · re-listing');
      setVal(s.refs.rvChip, 'reset');
      setVal(s.refs.cacheChip, 're-syncing');
      setWire(s, 'watch', 'HTTP 410 Gone');
      setWire(s, 'req', 're-LIST · fresh rv');
      s.refs.api.classList.add('highlight');
      s.refs.informer.classList.add('highlight');
      s.refs.watchChip.classList.add('highlight');
      if (ctx.reduced) return;
      // The 410 Gone arrives on the open watch (Api -> Informer, down the watch arrow), not on the
      // top client lane. The informer then drops the watch and re-LISTs (shown via the chips/wire).
      segmentPacket(s, ctx, { from: [600, 150], to: [600, 229], role: 'cluster' });
    },
  },
  {
    id: 'crd',
    duration: 1900,
    narration: 'CRDs add their own group (example.com/v1). The Api serves them under /apis just like built-ins. Same list-then-watch contract, same informer story, same controller pattern.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      resetWatchArrow(s);
      clearHL(s);
      clearWires(s);
      hideAllSlots(s);
      setWire(s, 'gvr', 'CRD · widgets · watchable');
      const rows = s.refs.gvr.querySelectorAll('.scheme-chip');
      rows.forEach(r => r.classList.add('highlight'));
      const crdRow = rows[3];
      if (crdRow) {
        crdRow.style.opacity = '1';
        if (!ctx.reduced) ctx.register(fadeIn(crdRow, { duration: FADE.in }));
      }
      s.refs.api.classList.add('highlight');
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
