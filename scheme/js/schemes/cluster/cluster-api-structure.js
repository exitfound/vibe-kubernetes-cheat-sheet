import { P, F, defineCard, laneY, ladder, midX, shade, FADE } from './cluster-kit.js';
import { g, rect, text } from '../../lib/svg.js';

// Design notes for this card: ./CARDS.md#cluster-api-structure

// Laid out on the L. Panel worst case x<=397 y<=181, so the Client sits in the freed bottom-left
// and reaches the API up a riser clear of it. The Informer/Indexer stack keeps the centre column.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = midX(CONTENT_L, CONTENT_R);                   // 600
// Reserved narration corner: 400 x 200. Nothing on this card derives from it, and the measured
// worst case per viewport is in the header note above.

const TOP_Y = 60, TOP_H = 80, TOP_BOTTOM = TOP_Y + TOP_H;// 60 / 140
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);                  // 100
const LANE_DY = 15;
const { out: OUT_Y, back: BACK_Y } = laneY(TOP_CY, LANE_DY);  // 85 / 115
const API_W = 220, API_X = CX - API_W / 2, API_R = API_X + API_W;  // 490..710
// ETCD drops into the bottom-right so the row below the panel balances the Client on the left:
// with both corners used, the low band spans the full content width and centres on CX.
const ETCD_W = 140, ETCD_X = CONTENT_R - ETCD_W;         // 1000..1140
const ETCD_Y = 390, ETCD_H = 100;                        // 390..490
const ETCD_CY = midX(ETCD_Y, ETCD_Y + ETCD_H);           // 440
const ETCD_LANE_DY = 12;
// The two lanes reach ETCD through the corridor between the Informer and the chip column and
// enter its LEFT face: dropping at the cylinder centre (1070) ran both risers through all three chips.
const RISER_OUT_X = 764, RISER_BACK_X = 740;             // out right of back, so they never cross
const API_TO_ETCD = [[API_R, OUT_Y], [RISER_OUT_X, OUT_Y], [RISER_OUT_X, ETCD_CY - ETCD_LANE_DY], [ETCD_X, ETCD_CY - ETCD_LANE_DY]];
const ETCD_TO_API = [[ETCD_X, ETCD_CY + ETCD_LANE_DY], [RISER_BACK_X, ETCD_CY + ETCD_LANE_DY], [RISER_BACK_X, BACK_Y], [API_R, BACK_Y]];

const CLIENT_X = CONTENT_L, CLIENT_W = 240, CLIENT_H = 80;
const CLIENT_Y = 390, CLIENT_R = CLIENT_X + CLIENT_W;    // 60..300, 390..470
const CLIENT_CY = midX(CLIENT_Y, CLIENT_Y + CLIENT_H);   // 430
const RISER_X = 412;                                     // clear of the panel by 15
const CLIENT_TO_API = [[CLIENT_R, CLIENT_CY], [RISER_X, CLIENT_CY], [RISER_X, TOP_CY], [API_X, TOP_CY]];

const GVR_X = CONTENT_L, GVR_W = 300;                    // 60..360, in the left band below the panel
const GVR_Y = 217;
const SCHIP_X = 840, SCHIP_W = CONTENT_R - SCHIP_X;      // 300, 840..1140
const SCHIP_H = 32, SCHIP_GAP = 6;
const SCHIP_Y = ladder({ y: GVR_Y, rowH: SCHIP_H, gap: SCHIP_GAP });  // 217 / 255 / 293, level with the GVR rows

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
const SLOT_KEYS = ['slot0', 'slot1', 'slot2', 'slot3'];
const WIRE_REQ_Y = midX(INF_BOTTOM, IDX_Y);              // 348.5, between the Informer and the Indexer
// Centred in the API-to-Informer gap rather than pinned: the +4 puts the glyph MIDDLE on the gap
// centre, because measured that middle sits 3.9 above the baseline y sets. It read 200, i.e. 8.6 low.
const WIRE_WATCH_Y = midX(TOP_BOTTOM, INF_Y) + 4;        // 191.5, visual centre 187.6 against 187.5


// Two STACKED texts rather than a name/value pair, which is the one shape no part kind builds, so
// the four slots are the card's only P.raw. setSlot writes the pair the layer has no verb for.
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

// The watch arrow takes no dash offset on any step, so this clears nothing today. It stands as the
// arrow's reset guard: a step that ever dashes it needs the offset cleared before the next one.
function resetWatchArrow(s) {
  if (s.refs.watchArrow) {
    s.refs.watchArrow.style.strokeDasharray = '';
    s.refs.watchArrow.style.strokeDashoffset = '';
  }
}

// The list order IS the append order, so it is the z-order: the four blocks that must sit on top of
// everything else go last, after the packet layer.
export const SCENE = {
  'aria-label': 'How a controller stays in step with the API server, over the list-watch cycle. A client-go Client, the API, an Informer, an Indexer and ETCD stand around a group-version-resource catalogue and a row of watch events. The controller lists once, then holds one watch open for later changes, re-listing when history is compacted past its resourceVersion.',
  parts: [
    P.defs(),
    P.chip({ key: 'rvChip', x: SCHIP_X, y: SCHIP_Y(0), w: SCHIP_W, h: SCHIP_H, name: 'resourceVersion', value: 'none' }),
    P.chip({ key: 'watchChip', x: SCHIP_X, y: SCHIP_Y(1), w: SCHIP_W, h: SCHIP_H, name: 'watch', value: 'closed' }),
    P.chip({ key: 'cacheChip', x: SCHIP_X, y: SCHIP_Y(2), w: SCHIP_W, h: SCHIP_H, name: 'cache size', value: '0' }),
    // Centre spine under Api (cx=600), generous vertical spacing: Informer feeds the Indexer.
    P.box({ key: 'cache', x: COL_X, y: IDX_Y, w: COL_W, h: IDX_H, label: 'Indexer', sublabel: 'in-memory cache' }),
    // Keyed `chain` so clearHighlights clears its rows and `chain: 'all'` lights them: the wire
    // label beside it keeps the name gvr, because that names the catalogue rather than the glyph.
    P.chain({
      key: 'chain', x: GVR_X, y: GVR_Y, w: GVR_W, rowH: 32, gap: 6,
      items: [
        '/api/v1/pods',
        '/apis/apps/v1/deployments',
        '/apis/batch/v1/jobs',
        '/apis/example.com/v1/widgets (CRD)',
      ],
      // The CRD row is the only one that arrives mid-card, so it is captured and pinned hidden here.
      tune: (el, refs) => {
        const crdRow = el.querySelector('[data-idx="3"]');
        refs.crdRow = crdRow;
        if (crdRow) crdRow.style.opacity = '0';
      },
    }),
    P.tag({ key: 'streamLabel', cls: 'scheme-label dim code', x: CX, y: STREAM_LABEL_Y, text: 'watch event stream (resourceVersion grows)', opacity: 0 }),
    ...SLOT_KEYS.map((key, i) => P.raw({
      key, opacity: 0,
      make: () => eventSlot({ x: SLOT_X(i), y: SLOT_Y, w: SLOT_W, h: SLOT_H }),
    })),
    // ETCD pair straddles the block centre (out 85, return 115). The Client link is a SINGLE lane:
    // only the discovery request is animated, and a second arrowhead would be traffic no step sends.
    P.lane({ points: CLIENT_TO_API, dim: true, dashed: true }),
    P.lane({ points: API_TO_ETCD, dim: true, dashed: true }),
    P.lane({ points: ETCD_TO_API, dim: true, dashed: true }),
    // Watch stream: straight vertical drop Api → Informer (cx=600).
    P.lane({ key: 'watchArrow', points: WATCH_LANE, dim: true, dashed: true }),
    // Internal: Informer → Indexer (events feed the cache).
    P.lane({ points: FEED_LANE, dim: true, dashed: true }),
    // Wire labels at fixed positions, populated per step. Beside the riser, not in the 112 unit gap
    // under it: the LIST string is 140 wide and overran the Client on one side, the riser on the other.
    P.wire({ key: 'req', x: RISER_X + 10, y: WIRE_REQ_Y, anchor: 'start' }),
    // Both ETCD registers sit on the BOTTOM legs, not up on the row: the lanes turn down at 764 and
    // 740, so a label centred on 890 would float 120 units right of anything it could be labelling.
    P.wire({ key: 'api-etcd', x: midX(RISER_OUT_X, ETCD_X), y: ETCD_CY - ETCD_LANE_DY - 10 }),
    // Left of the watch arrow: the corridor on its right now carries the two ETCD risers.
    P.wire({ key: 'watch', x: 580, y: WIRE_WATCH_Y, anchor: 'end' }),
    P.wire({ key: 'etcd-ret', x: midX(RISER_BACK_X, ETCD_X), y: ETCD_CY + ETCD_LANE_DY + 18 }),
    P.wire({ key: 'gvr', x: GVR_X + GVR_W / 2, y: GVR_Y - 12 }),
    P.packets(),
    P.box({ key: 'client', x: CLIENT_X, y: CLIENT_Y, w: CLIENT_W, h: CLIENT_H, label: 'Client', sublabel: 'client-go controller' }),
    P.box({ key: 'api', x: API_X, y: TOP_Y, w: API_W, h: TOP_H, label: 'API', sublabel: 'discovery: /api · /apis' }),
    P.cylinder({ key: 'etcdC', x: ETCD_X, y: ETCD_Y, w: ETCD_W, h: ETCD_H, label: 'ETCD', labelY: 60 }),
    P.box({ key: 'informer', x: COL_X, y: INF_Y, w: COL_W, h: INF_H, label: 'Informer', sublabel: 'shared list-watch' }),
  ],
  reset: {
    keys: ['client', 'informer', 'cache', 'api', 'etcdC', 'rvChip', 'watchChip', 'cacheChip', ...SLOT_KEYS],
    extra: resetWatchArrow,
  },
};

// Slot TEXT only: hiding a slot is two halves, and the opacity half is the `opacity` field. The
// caption goes with the slots because it only makes sense with them on screen.
function hideSlotText(s) {
  SLOT_KEYS.forEach(k => setSlot(s.refs[k], 'none', ''));
}
const HIDDEN = { ...shade(SLOT_KEYS, 0), streamLabel: 0 };
const SHOWN = { ...shade(SLOT_KEYS.slice(0, 3), 1), streamLabel: 1 };
const LIST_EVENTS = [['ADDED', 'pod-a · rv=840'], ['ADDED', 'pod-b · rv=841'], ['ADDED', 'pod-c · rv=842']];

export const STEPS_SPEC = [
  {
    // A pure reset. Slot 0 must not DRAW: a real step here paints under the panel text of the step
    // AFTER it, and its packet never runs because the poster position is entered reduced.
    id: 'idle',
    duration: 1500,
    chips: { rvChip: 'none', watchChip: 'closed', cacheChip: '0' },
    opacity: HIDDEN,
    enter: hideSlotText,
  },
  {
    id: 'discovery',
    duration: 1900,
    narration: 'The controller first asks the API what it can talk to. GET /api and GET /apis return the discovery document, the catalogue of every group, version and resource the informer can list and watch.',
    chips: { rvChip: 'none', watchChip: 'closed', cacheChip: '0' },
    wires: { req: 'GET /api  +  GET /apis', gvr: 'GVR catalogue' },
    opacity: HIDDEN,
    // Only the CLIENT is lit at entry. The API is the receiver of the one ball this step draws, so it
    // lights on arrival: lighting it at entry shows the answer 1156ms before the question lands.
    lit: ['client'],
    enter: hideSlotText,
    // The client calls /api and /apis on the Api to fetch the GVR catalogue.
    flow: [F.route({ points: CLIENT_TO_API, lights: ['api'] })],
  },
  {
    id: 'list',
    // The answer goes straight down the watch lane, with the API's own list-watch on ETCD alongside.
    // Span 3460 against duration 5400: the gap is reading time for the longest narration, not slack.
    duration: 5400,
    narration: 'The informer fires the initial LIST at resourceVersion 0. The API keeps its watch cache filled from ETCD and answers the list from there, with no quorum read, so the full set lands in the Indexer at rv=842 and the controller reconciles from local memory.',
    chips: { rvChip: '842', watchChip: 'closed', cacheChip: '3' },
    // The two ETCD lanes are the API keeping its OWN cache current, not this LIST being read
    // through: an rv=0 list is answered by the Cacher and never reaches etcd.
    wires: { req: 'LIST /api/v1/pods · rv=0', 'api-etcd': 'list-watch on ETCD', 'etcd-ret': 'objects · rv=842' },
    // Caption is the cancel/reduced final; the fade below back-fills it hidden until arrival.
    opacity: { ...HIDDEN, ...SHOWN },
    // The API SOURCES both balls, so it alone is lit at entry. ETCD, Informer and Indexer receive,
    // so each lights on arrival.
    lit: ['rvChip', 'cacheChip', 'api'],
    enter(s) {
      hideSlotText(s);
      LIST_EVENTS.forEach((ev, i) => setSlot(s.refs[SLOT_KEYS[i]], ev[0], ev[1]));
    },
    // Leaves the API AT ONCE, gated on nothing. Gating it on the ETCD return draws this request
    // being read through, contradicting the panel that says no quorum read happened.
    flow: [
      F.segment({ from: WATCH_LANE[0], to: WATCH_LANE[1], name: 'stream', lights: ['informer'] }),
      F.segment({ from: FEED_LANE[0], to: FEED_LANE[1], after: 'stream', name: 'toCache', lights: ['cache'] }),
      // The API keeping its own cache current, running ALONGSIDE the answer rather than under it.
      // Background traffic: nothing waits on it and it waits on nothing.
      F.route({ points: API_TO_ETCD, name: 'ask', lights: ['etcdC'] }),
      F.route({ points: ETCD_TO_API, after: 'ask' }),
      ...[0, 1, 2].map(i => F.anim({
        target: SLOT_KEYS[i], keyframes: [{ opacity: 0 }, { opacity: 1 }],
        options: { duration: 400 + i * 120, fill: 'both' }, at: 'toCache',
      })),
      // The caption reveals together with the first item.
      F.fade({ target: 'streamLabel', from: 0, to: 1, dur: FADE.in, at: 'toCache', fill: 'both', easing: 'ease-out' }),
    ],
  },
  {
    id: 'watch',
    duration: 2000,
    narration: 'The informer opens GET /api/v1/pods?watch=true&resourceVersion=842. The API streams every change since that RV as a chunked HTTP response. The connection stays open for as long as the controller wants.',
    chips: { rvChip: '842', watchChip: 'open · chunked HTTP', cacheChip: '3' },
    wires: { watch: 'chunked HTTP · streaming' },
    opacity: SHOWN,
    lit: ['api', 'watchChip'],
    // Watch stream: Api -> Informer, straight vertical drop.
    flow: [F.segment({ from: WATCH_LANE[0], to: WATCH_LANE[1], lights: ['informer'] })],
  },
  {
    id: 'event',
    duration: 3800,
    narration: 'A new Pod lands in ETCD. The API pushes an ADDED event over the open watch (rv=843). The informer enqueues the object key and updates the Indexer cache.',
    chips: { rvChip: '843', watchChip: 'open · streaming', cacheChip: '4' },
    wires: { watch: 'ADDED · rv=843' },
    opacity: { ...SHOWN, slot3: 1 },
    lit: ['etcdC', 'rvChip', 'cacheChip', 'watchChip', 'slot3'],
    enter(s) { setSlot(s.refs.slot3, 'ADDED', 'pod-d · rv=843'); },
    // The ADDED event as three sequenced hops on their real arrows. Each stage lights as the
    // event reaches it, so the row of lit blocks tracks the ball.
    flow: [
      F.route({ points: ETCD_TO_API, name: 'ret', lights: ['api'] }),
      F.segment({ from: WATCH_LANE[0], to: WATCH_LANE[1], after: 'ret', name: 'stream', lights: ['informer'] }),
      F.segment({ from: FEED_LANE[0], to: FEED_LANE[1], after: 'stream', name: 'toCache', lights: ['cache'] }),
      F.fade({ target: 'slot3', from: 0, to: 1, dur: FADE.in, at: 'toCache', fill: 'both', easing: 'ease-out' }),
      // ...and lights as it lands. This card draws no Pod, so nothing here pulses.
      F.light({ targets: ['slot3'], at: 'toCache' }),
    ],
  },
  {
    id: 'relist-on-410',
    duration: 1900,
    narration: 'If the API has compacted history past the resourceVersion the informer holds, the next watch chunk returns HTTP 410 Gone. The informer drops its watch, re-LISTs to a fresh resourceVersion, and resumes the watch.',
    chips: { rvChip: 'reset', watchChip: '410 Gone · re-listing', cacheChip: 're-syncing' },
    wires: { watch: 'HTTP 410 Gone', req: 're-LIST · fresh rv' },
    opacity: HIDDEN,
    lit: ['api', 'watchChip', 'rvChip', 'cacheChip'],
    enter: hideSlotText,
    // The 410 Gone arrives on the open watch (Api -> Informer, down the watch arrow), not on the
    // top client lane. The informer then drops the watch and re-LISTs (shown via the chips/wire).
    flow: [F.segment({ from: WATCH_LANE[0], to: WATCH_LANE[1], lights: ['informer'] })],
  },
  {
    id: 'crd',
    duration: 1900,
    narration: 'CRDs add their own group (example.com/v1). The API serves them under /apis just like built-ins. Same list-then-watch contract, same informer story, same controller pattern.',
    // The 410 step is a conditional aside, so the informer is back in the steady state `event`
    // left it in. Without these three the coda runs under `410 Gone . re-listing`.
    chips: { rvChip: '843', watchChip: 'open · streaming', cacheChip: '4' },
    wires: { gvr: 'CRD · widgets · watchable' },
    opacity: { ...HIDDEN, crdRow: 1 },
    lit: ['api'],
    chain: 'all',
    enter: hideSlotText,
    flow: [F.fade({ target: 'crdRow', from: 0, to: 1, dur: FADE.in, fill: 'forwards', easing: 'ease-out' })],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
