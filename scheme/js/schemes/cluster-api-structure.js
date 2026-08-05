import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, box, cylinder, chainList, fadeIn, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, segmentPacket, routePacket, makeInit, clearHighlights, clearWires, setWire, lightBoxAt, FADE, BEAT } from '../lib/cluster-kit.js';

// Laid out on the L: the narration panel owns the top-left corner and nothing is drawn there.
// Measured worst case over 1600/1440/1280/1100 is x<=397, y<=181, so the Client moves into the
// freed bottom-left and reaches the API up a riser that clears the panel. The Informer/Indexer
// stack keeps its centre column.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600
// Reserved narration corner: 400 x 200. Nothing on this card derives from it, and the measured
// worst case per viewport is in the header note above.

const TOP_Y = 60, TOP_H = 80, TOP_BOTTOM = TOP_Y + TOP_H;// 60 / 140
const TOP_CY = TOP_Y + TOP_H / 2;                        // 100
const LANE_DY = 15;
const OUT_Y = TOP_CY - LANE_DY, BACK_Y = TOP_CY + LANE_DY;   // 85 / 115
const API_W = 220, API_X = CX - API_W / 2, API_R = API_X + API_W;  // 490..710
// ETCD drops into the bottom-right so the row below the panel balances the Client on the left:
// with both corners used, the low band spans the full content width and centres on CX.
const ETCD_W = 140, ETCD_X = CONTENT_R - ETCD_W;         // 1000..1140
const ETCD_Y = 390, ETCD_H = 100;                        // 390..490
const ETCD_CY = ETCD_Y + ETCD_H / 2;                      // 440
const ETCD_LANE_DY = 12;
// The two lanes reach ETCD through the corridor between the Informer and the chip column and
// enter its LEFT face: dropping at the cylinder centre (1070) ran both risers through all three chips.
const RISER_OUT_X = 764, RISER_BACK_X = 740;             // out right of back, so they never cross
const API_TO_ETCD = [[API_R, OUT_Y], [RISER_OUT_X, OUT_Y], [RISER_OUT_X, ETCD_CY - ETCD_LANE_DY], [ETCD_X, ETCD_CY - ETCD_LANE_DY]];
const ETCD_TO_API = [[ETCD_X, ETCD_CY + ETCD_LANE_DY], [RISER_BACK_X, ETCD_CY + ETCD_LANE_DY], [RISER_BACK_X, BACK_Y], [API_R, BACK_Y]];

const CLIENT_X = CONTENT_L, CLIENT_W = 240, CLIENT_H = 80;
const CLIENT_Y = 390, CLIENT_R = CLIENT_X + CLIENT_W;    // 60..300, 390..470
const CLIENT_CY = CLIENT_Y + CLIENT_H / 2;               // 430
const RISER_X = 412;                                     // clear of the panel by 15
const CLIENT_TO_API = [[CLIENT_R, CLIENT_CY], [RISER_X, CLIENT_CY], [RISER_X, TOP_CY], [API_X, TOP_CY]];

const GVR_X = CONTENT_L, GVR_W = 300;                    // 60..360, in the left band below the panel
const GVR_Y = 217;
const SCHIP_X = 840, SCHIP_W = CONTENT_R - SCHIP_X;      // 300, 840..1140
const SCHIP_H = 32, SCHIP_GAP = 6;
const SCHIP_Y = i => GVR_Y + i * (SCHIP_H + SCHIP_GAP);  // 217 / 255 / 293, level with the GVR rows

// Centre column under the API: the Informer feeds the Indexer down the CX spine.
const COL_W = 180, COL_X = CX - COL_W / 2;               // 510..690
const INF_Y = 235, INF_H = 72, INF_BOTTOM = INF_Y + INF_H;   // 235..307
// The Indexer is a BOX, never a cylinder: that glyph is ETCD's, 400 units to the right.
const IDX_Y = 390, IDX_H = 80;                           // 390..470, level with the Client
const LANE_INSET = 4;
const WATCH_LANE = [[CX, TOP_BOTTOM + LANE_INSET], [CX, INF_Y - LANE_INSET]];
const FEED_LANE  = [[CX, INF_BOTTOM + LANE_INSET], [CX, IDX_Y - LANE_INSET]];

// The watch event stream: four slots centred on CX below the Indexer.
const SLOT_W = 140, SLOT_H = 44, SLOT_GAP = 20, SLOT_N = 4;
const SLOT_SPAN = SLOT_N * SLOT_W + (SLOT_N - 1) * SLOT_GAP;   // 620
const SLOT_X = i => CX - SLOT_SPAN / 2 + i * (SLOT_W + SLOT_GAP);
const SLOT_Y = 548, STREAM_LABEL_Y = SLOT_Y - 12;
const WIRE_REQ_Y = (INF_BOTTOM + IDX_Y) / 2;             // 348, between the Informer and the Indexer
// Centred in the API-to-Informer gap rather than pinned: the +4 puts the glyph MIDDLE on the gap
// centre, because measured that middle sits 3.9 above the baseline y sets. It read 200, i.e. 8.6 low.
const WIRE_WATCH_Y = (TOP_BOTTOM + INF_Y) / 2 + 4;       // 191.5, visual centre 187.6 against 187.5
// Design notes for this card: scheme/docs/CARDS.md#cluster-api-structure


function eventSlot({ x, y, w = 140, h = 44, role = 'cluster' }) {
  const grp = g({ class: 'scheme-chip', 'data-role': role, transform: `translate(${x},${y})` });
  grp.appendChild(rect({ class: 'scheme-chip-rect', x: 0, y: 0, width: w, height: h, rx: 4 }));
  const top = text({ class: 'scheme-chip-text', x: w / 2, y: h / 2 - 2, 'text-anchor': 'middle' }, ['none']);
  const bot = text({ class: 'scheme-chip-text', x: w / 2, y: h / 2 + 12, 'text-anchor': 'middle' }, ['']);
  bot.style.fill = 'var(--diag-text-dim)';
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
      'aria-label': 'How a controller stays in step with the API server, over the list-watch cycle. The controller opens with discovery, GET /api and GET /apis, to learn which group-version-resources it can reach. The informer then fires an initial LIST at resourceVersion 0, which the API answers from the watch cache it keeps filled from ETCD rather than with a quorum read, and that fills the Indexer cache the controller then reconciles from without going back to the API. It opens a watch from that same resourceVersion, and the API streams every later change over one connection held open for as long as the controller wants, so a new Pod reaching ETCD arrives as an ADDED event that updates the cache. When the API has compacted history past the resourceVersion the informer holds, the next chunk of that stream is HTTP 410 Gone, and the informer re-LISTs to a fresh resourceVersion and resumes watching rather than losing its place. CustomResourceDefinitions add their own API group under the same paths, with the same list-then-watch contract, so a controller for a custom resource is written exactly like one for a built-in.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = box({ x: CLIENT_X, y: CLIENT_Y, w: CLIENT_W, h: CLIENT_H, label: 'Client', sublabel: 'client-go controller', role: 'cluster' });
    const api = box({ x: API_X, y: TOP_Y, w: API_W, h: TOP_H, label: 'API', sublabel: 'discovery: /api · /apis', role: 'cluster' });
    const etcdC = cylinder({ x: ETCD_X, y: ETCD_Y, w: ETCD_W, h: ETCD_H, label: 'ETCD', role: 'cluster' });
    const etcdLbl = etcdC.querySelector('.scheme-cylinder-label');
    if (etcdLbl) etcdLbl.setAttribute('y', 60);

    const rvChip    = valChip({ x: SCHIP_X, y: SCHIP_Y(0), w: SCHIP_W, h: SCHIP_H, name: 'resourceVersion', value: 'none', role: 'cluster' });
    const watchChip = valChip({ x: SCHIP_X, y: SCHIP_Y(1), w: SCHIP_W, h: SCHIP_H, name: 'watch',           value: 'closed', role: 'cluster' });
    const cacheChip = valChip({ x: SCHIP_X, y: SCHIP_Y(2), w: SCHIP_W, h: SCHIP_H, name: 'cache size',      value: '0', role: 'cluster' });
    root.appendChild(rvChip); root.appendChild(watchChip); root.appendChild(cacheChip);

    // Centre spine under Api (cx=600), generous vertical spacing: Informer feeds the Indexer.
    const informer = box({ x: COL_X, y: INF_Y, w: COL_W, h: INF_H, label: 'Informer', sublabel: 'shared list-watch', role: 'cluster' });
    const cache = box({ x: COL_X, y: IDX_Y, w: COL_W, h: IDX_H, label: 'Indexer', sublabel: 'in-memory cache', role: 'cluster' });
    root.appendChild(cache);

    const gvr = chainList({
      x: GVR_X, y: GVR_Y, w: GVR_W, rowH: 32, gap: 6,
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

    const streamLabel = text({ class: 'scheme-label dim code', x: CX, y: STREAM_LABEL_Y, 'text-anchor': 'middle' }, ['watch event stream (resourceVersion grows)']);
    streamLabel.style.opacity = '0';
    root.appendChild(streamLabel);
    const slots = [];
    for (let i = 0; i < SLOT_N; i++) {
      const slot = eventSlot({ x: SLOT_X(i), y: SLOT_Y, w: SLOT_W, h: SLOT_H });
      slot.style.opacity = '0';
      root.appendChild(slot);
      slots.push(slot);
    }

    // The ETCD pair straddles the block centre (out at y=85, return at y=115). The Client link is a
    // single lane on the centre line, because only the discovery request is ever animated: a second
    // arrowhead pointing back at the Client would read as traffic that no step sends.
    root.appendChild(pathArrow({ points: CLIENT_TO_API, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: API_TO_ETCD, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: ETCD_TO_API, dim: true, dashed: true, role: 'cluster' }));

    // Watch stream: straight vertical drop Api → Informer (cx=600).
    const watchArrow = pathArrow({ points: WATCH_LANE, dim: true, dashed: true, role: 'cluster' });
    root.appendChild(watchArrow);

    // Internal: Informer → Indexer (events feed the cache).
    root.appendChild(pathArrow({ points: FEED_LANE, dim: true, dashed: true, role: 'cluster' }));

    // Wire labels at fixed positions, populated per step.
    // Beside the riser, not in the 112 unit gap under it: the LIST string is 140 wide, so on the
    // horizontal leg it overran the Client block on one side and the riser cut it on the other.
    const wireReq      = text({ class: 'scheme-label code dim', x: RISER_X + 10, y: WIRE_REQ_Y, 'text-anchor': 'start' }, [' ']);
    // Both ETCD registers sit on the BOTTOM legs, not up on the row. Their old slot was the midpoint
    // of API_R and the cylinder centre at row height, which the R5-a relayout left stranded: lanes turn down
    // at 764 and 740, so a label centred on 890 floats in blank canvas 120 units right of anything it
    // could be labelling. Nothing noticed for as long as both registers stayed empty.
    const wireApiEtcd  = text({ class: 'scheme-label code dim', x: (RISER_OUT_X + ETCD_X) / 2, y: ETCD_CY - ETCD_LANE_DY - 10, 'text-anchor': 'middle' }, [' ']);
    // Left of the watch arrow: the corridor on its right now carries the two ETCD risers.
    const wireWatch    = text({ class: 'scheme-label code dim', x: 580, y: WIRE_WATCH_Y, 'text-anchor': 'end'  }, [' ']);
    const wireEtcdRet  = text({ class: 'scheme-label code dim', x: (RISER_BACK_X + ETCD_X) / 2, y: ETCD_CY + ETCD_LANE_DY + 18, 'text-anchor': 'middle' }, [' ']);
    const wireGvr      = text({ class: 'scheme-label code dim', x: GVR_X + GVR_W / 2, y: GVR_Y - 12, 'text-anchor': 'middle' }, [' ']);
    [wireReq, wireApiEtcd, wireWatch, wireEtcdRet, wireGvr].forEach(t => root.appendChild(t));

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


const STEPS = [
  {
    // A pure reset, which this card did not have: `discovery` used to sit in slot 0, so the poster
    // position drew its request lane and its two wire labels under the panel text of the step AFTER
    // it. Discovery is a step of its own now and slot 0 does nothing but clear.
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      resetWatchArrow(s);
      clearHL(s);
      clearWires(s);
      hideAllSlots(s);
      setVal(s.refs.rvChip, 'none');
      setVal(s.refs.watchChip, 'closed');
      setVal(s.refs.cacheChip, '0');
    },
  },
  {
    id: 'discovery',
    duration: 1900,
    narration: 'The controller first asks the API what it can talk to. GET /api and GET /apis return the discovery document, the catalogue of every group, version and resource the informer can list and watch.',
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
      // Only the CLIENT is lit at entry. The API is the receiver of the one ball this step draws, and
      // it used to be lit from entry too, which showed the answer 1156ms before the question landed.
      s.refs.client.classList.add('highlight');
      if (ctx.reduced) { s.refs.api.classList.add('highlight'); return; }
      // The client calls /api and /apis on the Api to fetch the GVR catalogue.
      const pkt = routePacket(s, ctx, CLIENT_TO_API, { role: 'cluster' });
      lightBoxAt(s.refs.api, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'list',
    // Motion: the answer goes straight down the watch lane to the informer and its cache fills, with
    // the API's own list-watch on ETCD running alongside. Ends at 3460, down from 5140 when the
    // answer was still chained behind the ETCD round trip. `duration` is deliberately NOT cut to
    // match: this is the longest narration on the card and 5400 is reading time, not motion time.
    duration: 5400,
    narration: 'The informer fires the initial LIST at resourceVersion 0. The API keeps its watch cache filled from ETCD and answers the list from there, with no quorum read, so the full set lands in the Indexer at rv=842 and the controller reconciles from local memory.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      resetWatchArrow(s);
      clearHL(s);
      clearWires(s);
      hideAllSlots(s);
      setVal(s.refs.rvChip, '842');
      setVal(s.refs.cacheChip, '3');
      setWire(s, 'req', 'LIST /api/v1/pods · rv=0');
      // The two ETCD lanes are the API keeping its OWN cache current, and they are labelled as that.
      // Verified in apiserver/pkg/storage/cacher/delegator: ShouldDelegateList with an empty
      // ResourceVersionMatch, no Continue token and ResourceVersion "0" falls through to
      // `Result{ShouldDelegate: false}`, so the LIST is answered by the Cacher and never reaches
      // etcd. The ball crossing to ETCD is therefore not this request being read through.
      setWire(s, 'api-etcd', 'list-watch on ETCD');
      setWire(s, 'etcd-ret', 'objects · rv=842');
      // The API is the SOURCE of both balls this step draws (the answer down the watch lane and the
      // outbound list-watch), so it alone is lit at entry. ETCD, the Informer and the Indexer each
      // receive, so each lights on arrival.
      s.refs.rvChip.classList.add('highlight');
      s.refs.cacheChip.classList.add('highlight');
      const labels = [['ADDED', 'pod-a · rv=840'], ['ADDED', 'pod-b · rv=841'], ['ADDED', 'pod-c · rv=842']];
      s.refs.slots.slice(0, 3).forEach((slot, i) => {
        setSlot(slot, labels[i][0], labels[i][1]);
        slot.style.opacity = '1';
      });
      // Caption is the cancel/reduced final; the fade below back-fills it hidden until arrival.
      s.refs.streamLabel.style.opacity = '1';
      if (ctx.reduced) {
        s.refs.api.classList.add('highlight');
        s.refs.etcdC.classList.add('highlight');
        s.refs.informer.classList.add('highlight');
        s.refs.cache.classList.add('highlight');
        return;
      }
      s.refs.api.classList.add('highlight');
      // The answer to an rv=0 LIST comes out of the watch cache, which is exactly what the sentence
      // above says, so it leaves the API AT ONCE and is gated on nothing. The stream used to wait on
      // the ETCD return, which drew this request being read through and made the picture contradict
      // its own narration: the reader watched a ball go out to ETCD and come back before the
      // Informer was answered, under a panel saying no quorum read happened.
      const stream  = segmentPacket(s, ctx, { from: WATCH_LANE[0], to: WATCH_LANE[1], role: 'cluster' });
      lightBoxAt(s.refs.informer, ctx, stream.arrivalMs);
      const toCache = segmentPacket(s, ctx, { from: FEED_LANE[0], to: FEED_LANE[1], delay: stream.arrivalMs + BEAT.afterHop, role: 'cluster' });
      lightBoxAt(s.refs.cache, ctx, toCache.arrivalMs);
      // The API keeping its own cache current, running ALONGSIDE the answer rather than under it.
      // Background traffic: nothing waits on it and it waits on nothing.
      const ask = routePacket(s, ctx, API_TO_ETCD, { role: 'cluster' });
      lightBoxAt(s.refs.etcdC, ctx, ask.arrivalMs);
      routePacket(s, ctx, ETCD_TO_API, { delay: ask.arrivalMs + BEAT.afterHop, role: 'cluster' });
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
    narration: 'The informer opens GET /api/v1/pods?watch=true&resourceVersion=842. The API streams every change since that RV as a chunked HTTP response. The connection stays open for as long as the controller wants.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      resetWatchArrow(s);
      clearHL(s);
      clearWires(s);
      setVal(s.refs.watchChip, 'open · chunked HTTP');
      setWire(s, 'watch', 'chunked HTTP · streaming');
      s.refs.api.classList.add('highlight');
      s.refs.watchChip.classList.add('highlight');
      s.refs.slots.slice(0, 3).forEach(slot => { slot.style.opacity = '1'; });
      s.refs.streamLabel.style.opacity = '1';
      if (ctx.reduced) { s.refs.informer.classList.add('highlight'); return; }
      // Watch stream: Api -> Informer, straight vertical drop.
      const pkt = segmentPacket(s, ctx, { from: WATCH_LANE[0], to: WATCH_LANE[1], role: 'cluster' });
      lightBoxAt(s.refs.informer, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'event',
    duration: 3800,
    narration: 'A new Pod lands in ETCD. The API pushes an ADDED event over the open watch (rv=843). The informer enqueues the object key and updates the Indexer cache.',
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
      s.refs.rvChip.classList.add('highlight');
      s.refs.cacheChip.classList.add('highlight');
      s.refs.watchChip.classList.add('highlight');
      s.refs.slots.slice(0, 3).forEach(slot => { slot.style.opacity = '1'; });
      s.refs.streamLabel.style.opacity = '1';
      const fourth = s.refs.slots[3];
      setSlot(fourth, 'ADDED', 'pod-d · rv=843');
      fourth.classList.add('highlight');
      fourth.style.opacity = '1';
      if (ctx.reduced) {
        s.refs.api.classList.add('highlight');
        s.refs.informer.classList.add('highlight');
        s.refs.cache.classList.add('highlight');
        return;
      }
      // The ADDED event's journey as three sequenced hops on their real arrows:
      // etcd -> Api (watch return), Api -> Informer (watch stream), Informer -> Indexer. Each
      // stage lights as the event reaches it, so the row of lit blocks tracks the ball.
      const ret = routePacket(s, ctx, ETCD_TO_API, { role: 'cluster' });
      lightBoxAt(s.refs.api, ctx, ret.arrivalMs);
      const stream = segmentPacket(s, ctx, { from: WATCH_LANE[0], to: WATCH_LANE[1], delay: ret.arrivalMs + BEAT.afterHop, role: 'cluster' });
      lightBoxAt(s.refs.informer, ctx, stream.arrivalMs);
      const toCache = segmentPacket(s, ctx, { from: FEED_LANE[0], to: FEED_LANE[1], delay: stream.arrivalMs + BEAT.afterHop, role: 'cluster' });
      lightBoxAt(s.refs.cache, ctx, toCache.arrivalMs);
      ctx.register(fourth.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: toCache.arrivalMs, fill: 'both', easing: 'ease-out' }));
      // ...and lights as it lands. This card draws no Pod, so nothing here pulses.
      lightBoxAt(fourth, ctx, toCache.arrivalMs);
    },
  },
  {
    id: 'relist-on-410',
    duration: 1900,
    narration: 'If the API has compacted history past the resourceVersion the informer holds, the next watch chunk returns HTTP 410 Gone. The informer drops its watch, re-LISTs to a fresh resourceVersion, and resumes the watch.',
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
      s.refs.watchChip.classList.add('highlight');
      s.refs.rvChip.classList.add('highlight');
      s.refs.cacheChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.informer.classList.add('highlight'); return; }
      // The 410 Gone arrives on the open watch (Api -> Informer, down the watch arrow), not on the
      // top client lane. The informer then drops the watch and re-LISTs (shown via the chips/wire).
      const pkt = segmentPacket(s, ctx, { from: WATCH_LANE[0], to: WATCH_LANE[1], role: 'cluster' });
      lightBoxAt(s.refs.informer, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'crd',
    duration: 1900,
    narration: 'CRDs add their own group (example.com/v1). The API serves them under /apis just like built-ins. Same list-then-watch contract, same informer story, same controller pattern.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      resetWatchArrow(s);
      clearHL(s);
      clearWires(s);
      hideAllSlots(s);
      // The 410 step is a conditional aside (its own sentence opens with If), so the informer is
      // back in the steady state `event` left it in. Without these three the coda ran under
      // `410 Gone · re-listing`, which is the previous step leaking into a summary about CRDs.
      setVal(s.refs.rvChip, '843');
      setVal(s.refs.watchChip, 'open · streaming');
      setVal(s.refs.cacheChip, '4');
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
