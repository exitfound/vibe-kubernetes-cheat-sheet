import { LANE_DY, P, F, defineCard, laneY, ladder, midX, shade, CLU, FADE } from './cluster-kit.js';
import { g, rect, text } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/cluster-list-watch-informers.md

// The Client sits bottom-left under the panel and reaches the API up a riser clear of it.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;
const CX = midX(CONTENT_L, CONTENT_R);

const TOP_Y = 60, TOP_H = 80, TOP_BOTTOM = TOP_Y + TOP_H;
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);
const { out: OUT_Y, back: BACK_Y } = laneY(TOP_CY, LANE_DY);
const API_W = 232, API_X = CX - API_W / 2, API_R = API_X + API_W;
// ETCD bottom-right balances the Client bottom-left.
const ETCD_W = 140, ETCD_X = CONTENT_R - ETCD_W;
const ETCD_Y = 390, ETCD_H = 100;
const ETCD_CY = midX(ETCD_Y, ETCD_Y + ETCD_H);
const ETCD_LANE_DY = 12;
// Both risers run the corridor left of the chip column and enter the ETCD LEFT face, clear of the chips.
const RISER_OUT_X = 764, RISER_BACK_X = 740;             // out right of back, so they never cross
const API_TO_ETCD = [[API_R, OUT_Y], [RISER_OUT_X, OUT_Y], [RISER_OUT_X, ETCD_CY - ETCD_LANE_DY], [ETCD_X, ETCD_CY - ETCD_LANE_DY]];
const ETCD_TO_API = [[ETCD_X, ETCD_CY + ETCD_LANE_DY], [RISER_BACK_X, ETCD_CY + ETCD_LANE_DY], [RISER_BACK_X, BACK_Y], [API_R, BACK_Y]];

const CLIENT_X = CONTENT_L, CLIENT_W = 232, CLIENT_H = 80;
const CLIENT_Y = 390, CLIENT_R = CLIENT_X + CLIENT_W;
const CLIENT_CY = midX(CLIENT_Y, CLIENT_Y + CLIENT_H);
const RISER_X = 412;                                     // clear of the panel
const CLIENT_TO_API = [[CLIENT_R, CLIENT_CY], [RISER_X, CLIENT_CY], [RISER_X, TOP_CY], [API_X, TOP_CY]];

const GVR_X = CONTENT_L, GVR_W = 300;                    // in the left band below the panel
const GVR_Y = 217;
const SCHIP_X = 840, SCHIP_W = CONTENT_R - SCHIP_X;
const GVR_ROW_H = 32, GVR_GAP = 6;
const GVR_ROW = ladder({ y: GVR_Y, rowH: GVR_ROW_H, gap: GVR_GAP });
// Each chip centres on the GVR row it is level with.
const SCHIP_H = CLU.CHIP_H, SCHIP_Y = i => GVR_ROW(i) - (SCHIP_H - GVR_ROW_H) / 2;

// Centre column under the API: the Informer feeds the Indexer down the CX spine.
const COL_W = 232, COL_X = CX - COL_W / 2;
const INF_Y = 235, INF_H = 80, INF_BOTTOM = INF_Y + INF_H;
// The Indexer is a box, never a cylinder: that glyph is ETCD's.
const IDX_Y = 390, IDX_H = 80;                           // level with the Client
const LANE_INSET = 4;
const WATCH_LANE = [[CX, TOP_BOTTOM + LANE_INSET], [CX, INF_Y - LANE_INSET]];
const FEED_LANE  = [[CX, INF_BOTTOM + LANE_INSET], [CX, IDX_Y - LANE_INSET]];

// The watch event stream: four slots centred on CX below the Indexer.
const SLOT_W = 140, SLOT_H = 44, SLOT_GAP = 20, SLOT_N = 4;
const SLOT_SPAN = SLOT_N * SLOT_W + (SLOT_N - 1) * SLOT_GAP;
const SLOT_X = i => CX - SLOT_SPAN / 2 + i * (SLOT_W + SLOT_GAP);
const SLOT_Y = 548, STREAM_LABEL_Y = SLOT_Y - 12;
const SLOT_KEYS = ['slot0', 'slot1', 'slot2', 'slot3'];
const WIRE_REQ_Y = midX(INF_BOTTOM, IDX_Y);
// +4 puts the glyph middle, not the baseline, on the gap centre.
const WIRE_WATCH_Y = midX(TOP_BOTTOM, INF_Y) + 4;


// Two stacked texts, a shape no part kind builds, so the slots are P.raw and setSlot writes them.
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

// The list order is the z-order: the four blocks go last, after the packet layer.
export const SCENE = {
  'aria-label': 'How a controller stays in step with the API server, over the list-watch cycle. A client-go Client, the API, an Informer, an Indexer and ETCD stand around a group-version-resource catalogue and a row of watch events. The controller lists once, then holds one watch open for later changes, re-listing when history is compacted past its resourceVersion.',
  parts: [
    P.defs(),
    P.chip({ key: 'rvChip', x: SCHIP_X, y: SCHIP_Y(0), w: SCHIP_W, h: SCHIP_H, name: 'resourceVersion', value: 'none' }),
    P.chip({ key: 'watchChip', x: SCHIP_X, y: SCHIP_Y(1), w: SCHIP_W, h: SCHIP_H, name: 'watch', value: 'closed' }),
    P.chip({ key: 'cacheChip', x: SCHIP_X, y: SCHIP_Y(2), w: SCHIP_W, h: SCHIP_H, name: 'cache size', value: '0' }),
    P.box({ key: 'cache', x: COL_X, y: IDX_Y, w: COL_W, h: IDX_H, label: 'Indexer', sublabel: 'in-memory cache' }),
    // Keyed `chain` so clearHighlights clears its rows and `chain: 'all'` lights them.
    P.chain({
      key: 'chain', x: GVR_X, y: GVR_Y, w: GVR_W, rowH: GVR_ROW_H, gap: GVR_GAP,
      items: [
        '/api/v1/pods',
        '/apis/apps/v1/deployments',
        '/apis/batch/v1/jobs',
        '/apis/example.com/v1/widgets (CRD)',
      ],
      // The CRD row arrives mid-card, so it is captured and pinned hidden here.
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
    // The Client link is a single lane: no step sends traffic back along it.
    P.lane({ points: CLIENT_TO_API, dim: true, dashed: true }),
    P.lane({ points: API_TO_ETCD, dim: true, dashed: true }),
    P.lane({ points: ETCD_TO_API, dim: true, dashed: true }),
    P.lane({ key: 'watchArrow', points: WATCH_LANE, dim: true, dashed: true }),
    P.lane({ points: FEED_LANE, dim: true, dashed: true }),
    // Beside the riser, not under it: the LIST string is too wide for that gap.
    P.wire({ key: 'req', x: RISER_X + 10, y: WIRE_REQ_Y, anchor: 'start' }),
    // Both ETCD labels sit on the bottom legs, where the lanes actually reach ETCD.
    P.wire({ key: 'api-etcd', x: midX(RISER_OUT_X, ETCD_X), y: ETCD_CY - ETCD_LANE_DY - 10 }),
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
  },
};

// Slot text only: the opacity half of hiding a slot is the `opacity` field.
function hideSlotText(s) {
  SLOT_KEYS.forEach(k => setSlot(s.refs[k], 'none', ''));
}
const HIDDEN = { ...shade(SLOT_KEYS, 0), streamLabel: 0 };
const SHOWN = { ...shade(SLOT_KEYS.slice(0, 3), 1), streamLabel: 1 };
const LIST_EVENTS = [['ADDED', 'pod-a · rv=840'], ['ADDED', 'pod-b · rv=841'], ['ADDED', 'pod-c · rv=842']];

export const STEPS_SPEC = [
  {
    // A pure reset: nothing may draw here, the poster position is entered reduced.
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
    wires: { req: 'GET /api · GET /apis', gvr: 'GVR catalogue' },
    opacity: HIDDEN,
    lit: ['client'],
    enter: hideSlotText,
    flow: [F.route({ points: CLIENT_TO_API, lights: ['api'] })],
  },
  {
    id: 'list',
    // The tail after the flow is reading time for the longest narration, not slack.
    duration: 5400,
    narration: 'The informer fires the initial LIST at resourceVersion 0. The API keeps its watch cache filled from ETCD and answers the list from there, with no quorum read, so the full set lands in the Indexer at rv=842 and the controller reconciles from local memory.',
    chips: { rvChip: '842', watchChip: 'closed', cacheChip: '3' },
    // The ETCD lanes are the API keeping its own cache current: an rv=0 list never reaches etcd.
    wires: {
      req: 'LIST /api/v1/pods · rv=0', watch: '200 OK · rv=842',
      'api-etcd': 'list-watch on ETCD', 'etcd-ret': 'objects · rv=842',
    },
    // The cancel/reduced final, the fade below back-fills it hidden until arrival.
    opacity: { ...HIDDEN, ...SHOWN },
    lit: ['rvChip', 'cacheChip', 'api'],
    enter(s) {
      hideSlotText(s);
      LIST_EVENTS.forEach((ev, i) => setSlot(s.refs[SLOT_KEYS[i]], ev[0], ev[1]));
    },
    rewind: { chips: { rvChip: 'none', cacheChip: '0' } },
    // Leaves the API at once: gating it on the ETCD return would draw a quorum read.
    flow: [
      F.segment({ from: WATCH_LANE[0], to: WATCH_LANE[1], name: 'stream', lights: ['informer'] }),
      F.segment({ from: FEED_LANE[0], to: FEED_LANE[1], after: 'stream', name: 'toCache', lights: ['cache'] }),
      F.set({ at: 'toCache', chips: { rvChip: '842', cacheChip: '3' } }),
      // Background traffic: nothing waits on it and it waits on nothing.
      F.route({ points: API_TO_ETCD, name: 'ask', lights: ['etcdC'] }),
      F.route({ points: ETCD_TO_API, after: 'ask' }),
      ...[0, 1, 2].map(i => F.anim({
        target: SLOT_KEYS[i], keyframes: [{ opacity: 0 }, { opacity: 1 }],
        options: { duration: 400 + i * 120, fill: 'both' }, at: 'toCache',
      })),
      F.fade({ target: 'streamLabel', from: 0, to: 1, dur: FADE.in, at: 'toCache', fill: 'both', easing: 'ease-out' }),
    ],
  },
  {
    id: 'watch',
    duration: 2000,
    narration: 'The informer opens GET /api/v1/pods?watch=true&resourceVersion=842. The API streams every change since that RV as a chunked HTTP response. The connection stays open for as long as the controller wants.',
    chips: { rvChip: '842', watchChip: 'open · chunked HTTP', cacheChip: '3' },
    wires: { watch: 'chunked HTTP · stream' },
    opacity: SHOWN,
    lit: ['api', 'watchChip'],
    flow: [F.segment({ from: WATCH_LANE[0], to: WATCH_LANE[1], lights: ['informer'] })],
  },
  {
    id: 'event',
    duration: 3800,
    narration: 'A new Pod lands in ETCD. The API pushes an ADDED event over the open watch (rv=843). The informer enqueues the object key and updates the Indexer cache.',
    chips: { rvChip: '843', watchChip: 'open · streaming', cacheChip: '4' },
    wires: { watch: 'ADDED · rv=843', 'etcd-ret': 'new Pod · rv=843' },
    opacity: { ...SHOWN, slot3: 1 },
    lit: ['etcdC', 'rvChip', 'cacheChip', 'watchChip', 'slot3'],
    enter(s) { setSlot(s.refs.slot3, 'ADDED', 'pod-d · rv=843'); },
    rewind: { chips: { rvChip: '842', watchChip: 'open · chunked HTTP', cacheChip: '3' } },
    flow: [
      F.route({ points: ETCD_TO_API, name: 'ret', lights: ['api'] }),
      F.segment({ from: WATCH_LANE[0], to: WATCH_LANE[1], after: 'ret', name: 'stream', lights: ['informer'] }),
      F.set({ at: 'stream', chips: { watchChip: 'open · streaming' } }),
      F.segment({ from: FEED_LANE[0], to: FEED_LANE[1], after: 'stream', name: 'toCache', lights: ['cache'] }),
      F.set({ at: 'toCache', chips: { rvChip: '843', cacheChip: '4' } }),
      F.fade({ target: 'slot3', from: 0, to: 1, dur: FADE.in, at: 'toCache', fill: 'both', easing: 'ease-out' }),
      // This card draws no Pod, so nothing here pulses.
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
    // The slots carry the four events into the fade.
    enter(s) {
      LIST_EVENTS.forEach((ev, i) => setSlot(s.refs[SLOT_KEYS[i]], ev[0], ev[1]));
      setSlot(s.refs.slot3, 'ADDED', 'pod-d · rv=843');
    },
    rewind: { chips: { rvChip: '843', watchChip: 'open · streaming', cacheChip: '4' }, wires: { req: '' } },
    // The 410 arrives on the open watch, not on the client lane.
    flow: [
      F.segment({ from: WATCH_LANE[0], to: WATCH_LANE[1], name: 'gone', lights: ['informer'] }),
      F.set({
        at: 'gone',
        chips: { rvChip: 'reset', watchChip: '410 Gone · re-listing', cacheChip: 're-syncing' },
        wires: { req: 're-LIST · fresh rv' },
      }),
      ...[...SLOT_KEYS, 'streamLabel'].map(target => F.fade({ target, from: 1, to: 0, dur: FADE.out, at: 'gone', fill: 'both' })),
    ],
  },
  {
    id: 'crd',
    duration: 2800,
    narration: 'CRDs add their own group (example.com/v1). The API serves them under /apis just like built-ins. Same list-then-watch contract, same informer story. Since 1.35 client-go opens that watch with the initial list on it, falling back to the LIST drawn here.',
    // The 410 step is a conditional aside, so the chips return to the steady state of `event`.
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
