import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, box, cylinder, chainList, arrow, pathArrow, packet, animateAlong, pulse, fadeIn, flowDash } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

function valChip({ x, y, w, h = 32, name, value, cat = 'control' }) {
  const grp = g({ class: 'scheme-chip', 'data-cat': cat, transform: `translate(${x},${y})` });
  grp.appendChild(rect({ class: 'scheme-chip-rect', x: 0, y: 0, width: w, height: h, rx: 4 }));
  grp.appendChild(text({ class: 'scheme-chip-text', x: 12, y: h / 2 + 4, 'text-anchor': 'start' }, [name]));
  const valueT = text({ class: 'scheme-chip-text', x: w - 12, y: h / 2 + 4, 'text-anchor': 'end' }, [value]);
  grp.appendChild(valueT);
  grp.valueText = valueT;
  return grp;
}
function setVal(node, txt) { if (node && node.valueText) node.valueText.textContent = txt; }

function eventSlot({ x, y, w = 140, h = 44, cat = 'control' }) {
  const grp = g({ class: 'scheme-chip', 'data-cat': cat, transform: `translate(${x},${y})` });
  grp.appendChild(rect({ class: 'scheme-chip-rect', x: 0, y: 0, width: w, height: h, rx: 4 }));
  const top = text({ class: 'scheme-chip-text', x: w / 2, y: h / 2 - 2, 'text-anchor': 'middle' }, ['—']);
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
      viewBox: '0 0 1200 540',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'List-watch cycle: discovery, LIST, watch, re-list, CRD',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Top row: three actors (client, apiserver, etcd). Client is shifted right to clear the narration overlay zone.
    const client = box({ x: 290, y: 60, w: 130, h: 80, label: 'Client', sublabel: 'client-go controller', cat: 'control' });
    root.appendChild(client);

    const api = box({ x: 460, y: 60, w: 300, h: 80, label: 'ApiServer', sublabel: 'discovery: /api · /apis', cat: 'control' });
    root.appendChild(api);

    const etcdC = cylinder({ x: 800, y: 50, w: 140, h: 100, label: 'ETCD', cat: 'control' });
    root.appendChild(etcdC);

    // State chips, stacked to the right of etcd.
    const rvChip    = valChip({ x: 960, y: 60,  w: 220, h: 32, name: 'resourceVersion', value: '—' });
    const watchChip = valChip({ x: 960, y: 98,  w: 220, h: 32, name: 'watch',           value: 'closed' });
    const cacheChip = valChip({ x: 960, y: 136, w: 220, h: 32, name: 'cache size',      value: '0' });
    root.appendChild(rvChip); root.appendChild(watchChip); root.appendChild(cacheChip);

    // Mid row: informer (under client column), GVR catalogue (under apiserver column).
    // Note: informer is appended at the very end of build() so it renders on top of
    // the packet layer — the event packet visually passes UNDER informer, not over it.
    const informer = box({ x: 290, y: 240, w: 180, h: 70, label: 'Informer', sublabel: 'shared list-watch', cat: 'control' });

    const gvr = chainList({
      x: 510, y: 240, w: 320, rowH: 24, gap: 4,
      items: [
        '/api/v1/pods',
        '/apis/apps/v1/deployments',
        '/apis/batch/v1/jobs',
        '/apis/example.com/v1/widgets (CRD)',
      ],
      cat: 'control',
    });
    root.appendChild(gvr);
    const crdRow = gvr.querySelector('[data-idx="3"]');
    if (crdRow) crdRow.style.opacity = '0';

    // Bottom-left: Indexer cylinder under informer (client column continues).
    const cache = cylinder({ x: 290, y: 360, w: 180, h: 110, label: 'Indexer', cat: 'control' });
    root.appendChild(cache);

    // Bottom-right: event stream timeline.
    root.appendChild(text({ class: 'scheme-label dim code', x: 510, y: 372, 'text-anchor': 'start' }, ['watch event stream (resourceVersion grows)']));
    const slots = [];
    const slotXs = [510, 660, 810, 960];
    for (let i = 0; i < 4; i++) {
      const slot = eventSlot({ x: slotXs[i], y: 385 });
      slot.style.opacity = '0';
      root.appendChild(slot);
      slots.push(slot);
    }

    // Top-row arrows: out at y=100, return at y=130 (30px gap, matches apply-flow visual separation).
    root.appendChild(arrow({ x1: 420, y1: 100, x2: 460, y2: 100, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 460, y1: 130, x2: 420, y2: 130, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 760, y1: 100, x2: 800, y2: 100, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 800, y1: 130, x2: 760, y2: 130, dim: true, dashed: true, color: 'control' }));

    // L-bent: apiserver → informer (watch stream); flowDash animates this in step 'watch'.
    const watchArrow = pathArrow({ points: [[540, 140], [540, 200], [380, 200], [380, 240]], dim: true, dashed: true, color: 'control' });
    root.appendChild(watchArrow);

    // Internal: informer → Indexer (events feed the cache).
    root.appendChild(arrow({ x1: 380, y1: 310, x2: 380, y2: 360, dim: true, dashed: true, color: 'control' }));

    // Wire labels at fixed positions, populated per step (apply-flow pattern).
    const wireReq      = text({ class: 'scheme-label code dim', x: 440, y: 46,  'text-anchor': 'middle' }, [' ']);
    const wireApiEtcd  = text({ class: 'scheme-label code dim', x: 780, y: 46,  'text-anchor': 'middle' }, [' ']);
    const wireWatch    = text({ class: 'scheme-label code dim', x: 440, y: 158, 'text-anchor': 'middle' }, [' ']);
    const wireEtcdRet  = text({ class: 'scheme-label code dim', x: 780, y: 158, 'text-anchor': 'middle' }, [' ']);
    const wireGvr      = text({ class: 'scheme-label code dim', x: 670, y: 215, 'text-anchor': 'middle' }, [' ']);
    const wireEvent    = text({ class: 'scheme-label code dim', x: 380, y: 340, 'text-anchor': 'middle' }, [' ']);
    [wireReq, wireApiEtcd, wireWatch, wireEtcdRet, wireGvr, wireEvent].forEach(t => root.appendChild(t));

    // Packet layer (cleared and refilled per step).
    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    // Informer is appended LAST so it renders on top of packetLayer — packets passing
    // through informer's y-range visually go under the block (z-order trick).
    root.appendChild(informer);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      client, informer, cache, api, gvr, etcdC,
      rvChip, watchChip, cacheChip,
      watchArrow,
      slots,
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
  ['client','informer','cache','api','etcdC','rvChip','watchChip','cacheChip']
    .forEach(k => s.refs[k].classList.remove('highlight'));
  s.refs.gvr.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
  s.refs.slots.forEach(slot => slot.classList.remove('highlight'));
}

// flowDash sets inline strokeDasharray on watchArrow. Cancelling the animation
// leaves that inline style behind, so the arrow renders half-empty in later
// steps. Reset to CSS-driven dash pattern at the start of every step.
function resetWatchArrow(s) {
  if (s.refs.watchArrow) {
    s.refs.watchArrow.style.strokeDasharray = '';
    s.refs.watchArrow.style.strokeDashoffset = '';
  }
}

function clearWires(s) {
  Object.values(s.refs.wires).forEach(t => { t.textContent = ''; });
}

function setWire(s, key, txt) {
  if (s.refs.wires[key]) s.refs.wires[key].textContent = txt;
}

function hideAllSlots(s) {
  s.refs.slots.forEach(slot => { slot.style.opacity = '0'; setSlot(slot, '—', ''); });
}

const STEPS = [
  {
    id: 'discovery',
    duration: 1900,
    narration: 'The API is a catalogue of GVRs grouped by core/v1, apps/v1, batch/v1. Non-core groups follow /apis/<group>/<version>/<resource>, and the legacy core group lives under /api/v1/<resource>. The client first calls /api and /apis on the apiserver to discover this catalogue, including any CRDs that have registered.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      resetWatchArrow(s);
      clearHL(s);
      clearWires(s);
      hideAllSlots(s);
      setVal(s.refs.rvChip, '—');
      setVal(s.refs.watchChip, 'closed');
      setVal(s.refs.cacheChip, '0');
      setWire(s, 'req', 'GET /api  +  GET /apis');
      setWire(s, 'gvr', 'GVR catalogue');
      s.refs.client.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      s.refs.gvr.querySelectorAll('.scheme-chip').forEach((r, i) => { if (i < 3) r.classList.add('highlight'); });
      if (!ctx.reduced) ctx.register(pulse(s.refs.api, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'list',
    duration: 2000,
    narration: 'The informer fires the initial LIST. The apiserver reads from etcd and returns the full set at a snapshot resourceVersion (rv=842). The informer fills its Indexer cache, and the controller can now reconcile from local memory without hitting the apiserver again.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      resetWatchArrow(s);
      clearHL(s);
      clearWires(s);
      hideAllSlots(s);
      setVal(s.refs.rvChip, '842');
      setVal(s.refs.cacheChip, '3');
      setWire(s, 'req', 'LIST /api/v1/pods · rv=842');
      s.refs.client.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      const labels = [['ADDED', 'pod-a · rv=840'], ['ADDED', 'pod-b · rv=841'], ['ADDED', 'pod-c · rv=842']];
      s.refs.slots.slice(0, 3).forEach((slot, i) => {
        setSlot(slot, labels[i][0], labels[i][1]);
        slot.style.opacity = '1';
      });
      if (ctx.reduced) return;
      // Single packet: client→apiserver (LIST request).
      const p = packet({ x: 420, y: 100, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[420, 100], [460, 100]], { duration: 800 }));
      // Slots fade in as the LIST response items appear on the event timeline.
      s.refs.slots.slice(0, 3).forEach((slot, i) => {
        ctx.register(slot.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400 + i * 120, delay: 900, fill: 'forwards' }));
      });
    },
  },
  {
    id: 'watch',
    duration: 2000,
    narration: 'The informer opens GET /api/v1/pods?watch=true&resourceVersion=842. The apiserver streams every change since that RV as a chunked HTTP response. The connection stays open for as long as the controller wants.',
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
      if (ctx.reduced) return;
      // Single packet run along watchArrow — conveys the watch event arriving
      // once, matching the cadence of the other steps' packets.
      const pStream = packet({ x: 540, y: 140, cat: 'control' });
      s.refs.packetLayer.appendChild(pStream);
      ctx.register(animateAlong(pStream, [[540, 140], [540, 200], [380, 200], [380, 240]], {
        duration: 1500,
      }));
    },
  },
  {
    id: 'event',
    duration: 2400,
    narration: 'A new pod lands in etcd. The apiserver pushes an ADDED event over the open watch (rv=843). The informer enqueues the object key and updates the Indexer cache.',
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
      const fourth = s.refs.slots[3];
      setSlot(fourth, 'ADDED', 'pod-d · rv=843');
      fourth.classList.add('highlight');
      fourth.style.opacity = '1';
      if (ctx.reduced) return;
      // Continuous packet: etcd → apiserver → informer → Indexer (the full event journey).
      const p = packet({ x: 800, y: 130, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(p.animate(
        [
          { transform: 'translate(800px, 130px)' },
          { transform: 'translate(760px, 130px)', offset: 0.06 },
          { transform: 'translate(540px, 140px)', offset: 0.41 },
          { transform: 'translate(540px, 200px)', offset: 0.50 },
          { transform: 'translate(380px, 200px)', offset: 0.75 },
          { transform: 'translate(380px, 240px)', offset: 0.81 },
          { transform: 'translate(380px, 360px)' },
        ],
        { duration: 2000, fill: 'forwards', easing: 'linear' }
      ));
      // Slot fades in around when the event reaches the informer (~1620ms in).
      ctx.register(fadeIn(fourth, { duration: 500, delay: 1500 }));
      // Indexer pulses when the packet lands on it (~1900ms in).
      ctx.register(s.refs.cache.animate(
        [
          { filter: 'brightness(1)' },
          { filter: 'brightness(1.45)' },
          { filter: 'brightness(1)' },
        ],
        { duration: 700, delay: 1900, iterations: 1, easing: 'ease-in-out' }
      ));
    },
  },
  {
    id: 'relist-on-410',
    duration: 1900,
    narration: 'If the apiserver has compacted history past the informer\'s resourceVersion, the next watch chunk returns HTTP 410 Gone. The informer drops its watch, re-LISTs to a fresh resourceVersion, and resumes the watch.',
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
      s.refs.client.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      s.refs.informer.classList.add('highlight');
      s.refs.watchChip.classList.add('highlight');
      if (ctx.reduced) return;
      // apiserver→client packet showing the 410 response
      const p = packet({ x: 460, y: 130, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[460, 130], [420, 130]], { duration: 800 }));
      ctx.register(pulse(s.refs.watchChip, { duration: 800, iterations: 2 }));
    },
  },
  {
    id: 'crd',
    duration: 1900,
    narration: 'CRDs add their own group (example.com/v1). The apiserver serves them under /apis just like built-ins. Same list-then-watch contract, same informer story, same controller pattern.',
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
        if (!ctx.reduced) ctx.register(fadeIn(crdRow, { duration: 700 }));
      }
      s.refs.api.classList.add('highlight');
    },
  },
];

export function init(root, callbacks = {}) {
  const scene = new Scene(root);
  const tl = new Timeline({
    steps: STEPS,
    scene,
    onSceneReset: () => scene.reset(),
    onChange: callbacks.onStepChange,
    onPlayingChange: callbacks.onPlayingChange,
  });
  return {
    play: () => tl.play(),
    pause: () => tl.pause(),
    reset: () => tl.reset(),
    restart: () => tl.restart(),
    gotoStep: (i) => tl.gotoStep(i),
    setLoop: (b) => tl.setLoop(b),
    isLooping: () => tl.isLooping(),
    step: (dir) => tl.step(dir),
    setSpeed: (r) => tl.setSpeed(r),
    isPlaying: () => tl.isPlaying(),
    destroy: () => { tl.destroy(); root.replaceChildren(); },
  };
}
