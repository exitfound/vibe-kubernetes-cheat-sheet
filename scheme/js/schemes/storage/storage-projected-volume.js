import { P, F, defineCard, chipStrip, BEAT } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-projected-volume


const POD_X = 330, POD_Y = 56, POD_W = 640, POD_H = 120;  // 330..970, over the projected directory
const POD_BOTTOM = POD_Y + POD_H;                         // 176
const POD_CX = POD_X + POD_W / 2;                         // 650

// The source objects are not part of the Pod, so the column sits out to its left rather than under
// it. That is also what puts the low content on the canvas centre: 230..970 straddles 600.
const SRC_X = 230, SRC_W = 220, SRC_RIGHT = SRC_X + SRC_W; // 230..450, left source column
const SRC_CX = SRC_X + SRC_W / 2;                          // 340, the metadata drop lane
const SRC_H = 54;
const DOWN_Y = 264, CM_Y = 336, SEC_Y = 408, TOK_Y = 480;  // downwardAPI first: the drop crosses nothing
const midOf = y => y + SRC_H / 2;                          // 291 / 363 / 435 / 507

const DIR_X = 630, DIR_Y = 225, DIR_W = 340, DIR_H = 333;  // 630..970, 225..558
const DIR_CX = DIR_X + DIR_W / 2;                          // 800, the read lane
const ROW_X = 660, ROW_W = 280, ROW_H = 44;
const R_LBL_Y = 269, R_CFG_Y = 341, R_PWD_Y = 413, R_TOK_Y = 485; // row mids == source mids

// Uniform chip strip: three chips of one size on one 20 unit pitch, centred on the canvas, so the
// 1000 unit strip runs 100..1100.
const CHIPS_Y = 594;
const STRIP = chipStrip({ w: 320, gap: 20, count: 3 });    // 100 / 440 / 780

const W_DOWN = [[SRC_RIGHT, midOf(DOWN_Y)], [ROW_X, midOf(DOWN_Y)]];
const W_CM   = [[SRC_RIGHT, midOf(CM_Y)],   [ROW_X, midOf(CM_Y)]];
const W_SEC  = [[SRC_RIGHT, midOf(SEC_Y)],  [ROW_X, midOf(SEC_Y)]];
const W_TOK  = [[SRC_RIGHT, midOf(TOK_Y)],  [ROW_X, midOf(TOK_Y)]];
// Both Pod lanes leave its bottom edge as a mirrored pair either side of the Pod centre and then
// step out to the column they address, rather than landing out at the Pod corners.
const POD_LANE = 100;
const META_ELBOW_Y = 232, READ_ELBOW_Y = 200;   // the metadata elbow clears the panel floor (181)
const W_POD_META = [[POD_CX - POD_LANE, POD_BOTTOM], [POD_CX - POD_LANE, META_ELBOW_Y], [SRC_CX, META_ELBOW_Y], [SRC_CX, DOWN_Y]];
const W_READ = [[DIR_CX, DIR_Y], [DIR_CX, READ_ELBOW_Y], [POD_CX + POD_LANE, READ_ELBOW_Y], [POD_CX + POD_LANE, POD_BOTTOM]];

const source = (key, y, label, sublabel) => P.box({ key, x: SRC_X, y, w: SRC_W, h: SRC_H, label, sublabel });
const fileRow = (key, y, label) => P.box({ key, x: ROW_X, y, w: ROW_W, h: ROW_H, label, sublabel: '' });
const lane = (points) => P.lane({ points, dashed: true, dim: true });

// Z-order (bottom -> top): dir container, then blocks and file rows, then wires and labels above
// them, then the chip strip, then the packet layer so every ball rides above everything.
export const SCENE = {
  'aria-label': 'Projected volumes: one directory is assembled from several sources at once, a ConfigMap, a Secret, the downwardAPI carrying Pod metadata, and a serviceAccountToken. The token source is short-lived and audience-bound, and Kubelet rotates it in place before it expires, unlike the old forever-valid Secret-based token.',
  parts: [
    P.defs(),
    // The directory is an ENCLOSURE rather than a block, so its rect carries a faint wash. No part
    // kind writes `fill`, which is why the nested rect is reached here.
    P.box({
      key: 'dir', x: DIR_X, y: DIR_Y, w: DIR_W, h: DIR_H, label: '', sublabel: '',
      tune: (el) => { el.querySelector('.scheme-box-rect').style.fill = 'rgba(255, 255, 255, 0.02)'; },
    }),
    P.pod({
      key: 'pod', innerKey: 'podBox', x: POD_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Pod api-0', sublabel: 'projected volume', containers: 0,
      inner: { dx: (POD_W - 260) / 2, dy: 34, w: 260, h: 56, label: 'app', sublabel: 'reads /var/run/secrets' },
    }),
    // Column order top to bottom: downwardAPI first (the metadata drop from the Pod bottom lands on
    // its top edge without crossing anything), then the plain sources, the token source last.
    source('srcDown', DOWN_Y, 'downwardAPI', 'Pod labels, name'),
    source('srcCM', CM_Y, 'ConfigMap', 'key: config.yaml'),
    source('srcSec', SEC_Y, 'Secret', 'key: password'),
    source('srcTok', TOK_Y, 'serviceAccountToken', 'audience-bound'),
    fileRow('rowLbl', R_LBL_Y, 'labels'),
    fileRow('rowCfg', R_CFG_Y, 'config.yaml'),
    fileRow('rowPwd', R_PWD_Y, 'password'),
    fileRow('rowTok', R_TOK_Y, 'token'),
    lane(W_CM),
    lane(W_SEC),
    lane(W_DOWN),
    lane(W_TOK),
    lane(W_POD_META),
    lane(W_READ),
    P.tag({ cls: 'scheme-label code', x: DIR_CX, y: DIR_Y + 27, text: '/var/run/secrets (projected)' }),
    P.wire({ key: 'clock', x: DIR_CX, y: 580 }),
    P.chip({ key: 'srcChip', x: STRIP.x(0), y: CHIPS_Y, w: STRIP.w, h: 34, name: 'sources', value: '4 into one dir' }),
    P.chip({ key: 'tokChip', x: STRIP.x(1), y: CHIPS_Y, w: STRIP.w, h: 34, name: 'SA token', value: 'audience-bound' }),
    P.chip({ key: 'expChip', x: STRIP.x(2), y: CHIPS_Y, w: STRIP.w, h: 34, name: 'expiry', value: 'short-lived' }),
    P.packets(),
  ],
  reset: {
    keys: ['srcCM', 'srcSec', 'srcDown', 'srcTok', 'dir', 'rowCfg', 'rowPwd', 'rowLbl', 'rowTok', 'podBox',
      'srcChip', 'tokChip', 'expChip'],
    pods: ['pod'],
  },
};

// The three chips are written with setVal, not setChip, so no changed value ever lights: the
// highlights on this card are all placed by hand. Argument order is the old setChips helper's.
const chips = (src, tok, exp) => ({ srcChip: src, tokChip: tok, expChip: exp });
const SAT = 'serviceAccountToken', BOUND = 'audience-bound', SHORT = 'short-lived';
// STO.S-01 as a field: resetStep used to pin the Pod by hand, so every step states it.
const POD_ON = { pod: 1 };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: chips('4 into one dir', BOUND, SHORT),
    opacity: POD_ON,
  },
  {
    id: 'assemble',
    duration: 2800,
    narration: 'Four sources feed this one directory at once: a ConfigMap, a Secret, the downwardAPI and a serviceAccountToken. Kubelet gathers them and lays each out as a file, so the app opens files and never has to call the API for any of it.',
    chips: chips('4 into one dir', BOUND, SHORT),
    opacity: POD_ON,
    // The four sources are the actors of this step: they light at entry, their balls depart.
    lit: ['srcDown', 'srcCM', 'srcSec', 'srcTok'],
    // Four sources land at once, each on its own lane, each lighting its file row. The dir lights
    // WITH them, not at entry, or the delivery is announced a full second before any of it lands.
    flow: [
      F.route({ points: W_CM, lights: ['rowCfg', 'dir'] }),
      F.route({ points: W_SEC, lights: ['rowPwd'] }),
      F.route({ points: W_DOWN, lights: ['rowLbl'] }),
      F.route({ points: W_TOK, lights: ['rowTok'] }),
    ],
  },
  {
    id: 'sources',
    duration: 2400,
    narration: 'The ConfigMap and the Secret contribute the plain material. A config key lands as config.yaml and a secret key lands as password, exactly as they would from a standalone volume, just sharing one directory here.',
    chips: chips('ConfigMap + Secret', BOUND, SHORT),
    opacity: POD_ON,
    lit: ['srcChip', 'srcCM', 'srcSec'],
    // Each row's cue stands AFTER its tag, which is where the hand-written step emitted it.
    flow: [
      F.route({ points: W_CM, name: 'cm' }),
      F.tag({ text: 'config.yaml', points: W_CM }),
      F.light({ targets: ['rowCfg'], at: 'cm' }),
      F.route({ points: W_SEC, name: 'sec' }),
      F.tag({ text: 'password', points: W_SEC }),
      F.light({ targets: ['rowPwd'], at: 'sec' }),
    ],
  },
  {
    id: 'downward',
    duration: 3400,
    narration: 'The downwardAPI projects facts about the Pod itself. Its labels, its name, its namespace, even a resource limit, are written out as files, computed by Kubelet from the Pod object rather than fetched from anywhere.',
    chips: chips('downwardAPI: Pod metadata', BOUND, SHORT),
    opacity: POD_ON,
    lit: ['srcChip'],
    // The Pod is the SOURCE of its own metadata, so it pulses first. downwardAPI is mid-chain
    // here, unlike on the assemble step where it sends, so it lights on the metadata landing.
    flow: [
      F.pulse({ pod: 'pod' }),
      F.route({ points: W_POD_META, delay: BEAT.afterPulse, name: 'meta' }),
      F.tag({ text: 'labels, name', points: W_POD_META, delay: BEAT.afterPulse }),
      F.light({ targets: ['srcDown'], at: 'meta' }),
      F.route({ points: W_DOWN, after: 'meta', lights: ['rowLbl'] }),
    ],
  },
  {
    id: 'token',
    duration: 2400,
    narration: 'The serviceAccountToken source writes a bearer token the Pod uses to call the API. It is short-lived and bound to a specific audience, so a token minted for one service cannot be replayed against another.',
    // The chip tracks WHICH source is in play, as the two steps before it do: snapping back to the
    // standing value changes it with no cue on the one step that introduces the token source.
    chips: chips(SAT, 'bound to audience', SHORT),
    opacity: POD_ON,
    lit: ['srcChip', 'tokChip', 'srcTok'],
    flow: [
      F.route({ points: W_TOK, name: 'tok' }),
      F.tag({ text: 'signed token', points: W_TOK }),
      F.light({ targets: ['rowTok'], at: 'tok' }),
    ],
  },
  {
    id: 'rotate',
    duration: 2800,
    narration: 'Because the token is short-lived, Kubelet refreshes it in place well before it expires, rewriting the same token file with a new one. The app just keeps reading the file and always finds a valid token, with no restart.',
    chips: chips(SAT, 'rotated in place', 'refreshed before expiry'),
    opacity: POD_ON,
    wires: { clock: 'kubelet rewrites token before it expires' },
    lit: ['expChip', 'tokChip', 'srcTok'],
    // The one step whose cue stands BEFORE its tag, so the shorthand is the faithful form here.
    flow: [
      F.route({ points: W_TOK, lights: ['rowTok'] }),
      F.tag({ text: 'fresh token', points: W_TOK }),
    ],
  },
  {
    id: 'contrast',
    duration: 2600,
    narration: 'This is the whole reason to use the projected token over the old style. A legacy Secret-based service account token never expired and stayed valid forever if leaked, while a projected token rotates, expires, and is scoped to an audience.',
    chips: chips(SAT, 'rotated, scoped', 'legacy token never expired'),
    opacity: POD_ON,
    lit: ['expChip', 'tokChip', 'rowTok'],
    // The app reads the current, rotated token straight out of the dir.
    flow: [
      F.route({ points: W_READ, name: 'read' }),
      F.tag({ text: 'valid token', points: W_READ }),
      F.pulse({ pod: 'pod', at: 'read' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
