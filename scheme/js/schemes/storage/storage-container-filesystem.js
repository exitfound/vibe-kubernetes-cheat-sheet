import { P, F, defineCard, BEAT, FADE, OPACITY, REVEAL_MS, makeRidingLabel, chipStrip, routeDur } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-container-filesystem.md


// A layer-precedence grid: rows are the overlay layers top to bottom, columns are four paths, and a
// cell is drawn only where that layer holds that path.
const ROW_X = 420, ROW_W = 208, BLOCK_H = 80, GRID_R = 1180, CELL_GAP = 12;
const CELL_X0 = ROW_X + ROW_W + CELL_GAP;
const CELL_W = (GRID_R - CELL_X0 - 3 * CELL_GAP) / 4;
const colX = (i) => CELL_X0 + i * (CELL_W + CELL_GAP);
const colCX = (i) => colX(i) + CELL_W / 2;
const DATA_CX = colCX(0), CONF_CX = colCX(1), CACHE_CX = colCX(2), TOOL_CX = colCX(3);
const ROW_GAP = 52;                                                       // the gap a tag rides in
const rowY = (i) => 20 + i * (BLOCK_H + ROW_GAP);
const MERGED_Y = rowY(0), UPPER_Y = rowY(1), BASE_Y = rowY(3);
const MERGED_B = MERGED_Y + BLOCK_H, UPPER_B = UPPER_Y + BLOCK_H;

// Wider than the catalog chip: the longest value needs 256.
const CHIP_Y = 596;
const CH = chipStrip({ count: 3, w: 280 });

// The volume mirrors the grid's right margin so the content centres on 600. The /data shaft enters
// its face below the cap ellipse, level with the label (STO.L-02).
const VOL_X = 1200 - GRID_R, VOL_Y = 484, VOL_W = 200, VOL_H = 96;
const VOL_MY = VOL_Y + VOL_H / 2 + 8, VOL_RIGHT = VOL_X + VOL_W;

// The read and the copy-up never share a frame (stage), so both run on the column centre.
const L_READ   = [[CONF_CX, BASE_Y], [CONF_CX, MERGED_B]];
const L_COPY   = [[CONF_CX, BASE_Y], [CONF_CX, UPPER_B]];
const L_CREATE = [[CACHE_CX, MERGED_B], [CACHE_CX, UPPER_Y]];
const L_WHITE  = [[TOOL_CX, MERGED_B], [TOOL_CX, UPPER_Y]];
const L_VOL    = [[DATA_CX, MERGED_B], [DATA_CX, VOL_MY], [VOL_RIGHT, VOL_MY]];

// The grid legs are short enough to sit on the 700ms floor, where a tag retires unread, so they ride
// a fixed leg (M-12). Every ball runs 15 percent faster than its base pace.
const PACE = 1.15;
const LEG_DUR = Math.round(1500 / PACE);
const SHAFT_DUR = Math.round(routeDur(L_VOL) / PACE);
// dy 4 centres the 11px text on the ball.
const tagGrid = makeRidingLabel({ role: 'storage', dy: 4, inMs: 200, outMs: 200, hold: 0 });
const tagShaft = makeRidingLabel({ role: 'storage', dx: 24, dy: 17 });

const lane = (key, points) => P.lane({ key, points, dashed: true, dim: true });
const row = (key, i, label, sublabel) => P.box({ key, x: ROW_X, y: rowY(i), w: ROW_W, h: BLOCK_H, label, sublabel });
const cell = (key, col, r, label, sublabel, opacity) =>
  P.box({ key, x: colX(col), y: rowY(r), w: CELL_W, h: BLOCK_H, label, sublabel, opacity });

export const SCENE = {
  'aria-label': 'Container filesystem layers: with the default overlayfs snapshotter, a container sees its root filesystem as one overlay mount, drawn as a grid of layers by paths. The merged row on top is what the container sees. A read of /etc/app.conf falls through the empty upperdir and the app layer to the base layer. Creating /tmp/cache writes a new file into the upperdir. Editing app.conf first copies the whole file up from the base layer into the upperdir, and the base copy stays unchanged. Deleting /bin/tool writes a whiteout into the upperdir, so the merged view hides the file while the app layer still holds it. A write under /data never enters the overlay: /data is a volume mounted over the merged tree, and the bytes land on the volume. When the container is replaced, the new one starts with an empty upperdir, so /bin/tool shows again and app.conf comes from the base layer, the old upperdir is deleted once the old container is removed, and only the volume still holds db.',
  parts: [
    P.defs(),
    row('rowMerged', 0, 'merged', 'what the container sees'),
    row('rowUpper', 1, 'upperdir', 'writable, this container only'),
    row('rowApp', 2, 'lowerdir: app layer', 'image layer, read-only'),
    row('rowBase', 3, 'lowerdir: base layer', 'image layer, read-only'),
    cell('mData', 0, 0, '/data', 'volume mount'),
    cell('mConf', 1, 0, '/etc/app.conf', 'from base'),
    cell('mCache', 2, 0, '/tmp/cache', 'new file', 0),
    cell('mTool', 3, 0, '/bin/tool', 'from app layer'),
    cell('uConf', 1, 1, '/etc/app.conf', 'edited copy', 0),
    cell('uCache', 2, 1, '/tmp/cache', 'new file', 0),
    cell('uTool', 3, 1, '/bin/tool', 'whiteout', 0),
    cell('aTool', 3, 2, '/bin/tool', 'original'),
    cell('bConf', 1, 3, '/etc/app.conf', 'original'),
    // The primitive centers the label on the raw bbox, which reads high under the cap ellipse.
    P.cylinder({ key: 'volume', x: VOL_X, y: VOL_Y, w: VOL_W, h: VOL_H, label: 'Volume', labelY: VOL_H / 2 + 12 }),
    lane('lRead', L_READ),
    lane('lCopy', L_COPY),
    lane('lCreate', L_CREATE),
    lane('lWhite', L_WHITE),
    lane('lVol', L_VOL),
    P.chip({ key: 'fromChip', x: CH.x(0), y: CHIP_Y, w: CH.w, h: 34, name: 'app.conf from', value: 'not read yet' }),
    P.chip({ key: 'upperChip', x: CH.x(1), y: CHIP_Y, w: CH.w, h: 34, name: 'upperdir', value: 'empty' }),
    P.chip({ key: 'dataChip', x: CH.x(2), y: CHIP_Y, w: CH.w, h: 34, name: '/data', value: 'empty' }),
    P.packets(),
  ],
  reset: {
    keys: [
      'rowMerged', 'mData', 'mConf', 'mCache', 'mTool', 'uConf', 'uCache', 'uTool', 'bConf',
      'volume', 'fromChip', 'upperChip', 'dataChip',
    ],
    pods: [],
  },
};

// STO.S-01 as one literal: each upperdir cell is born with its lane, and the read lane is gone
// while an upperdir copy of app.conf stands in its slot. The volume shaft is always drawn.
const stage = ({ cache = 0, conf = 0, tool = 0 } = {}) => ({
  mCache: cache, uCache: cache, lCreate: cache,
  uConf: conf, lCopy: conf, lRead: conf ? 0 : 1,
  uTool: tool, lWhite: tool, lVol: 1,
});
const PEND = OPACITY.pending;
const SLOT_MS = 350;                                                      // two of these end inside BEAT.lead
const SUB = { mConf: 'from base', mTool: 'from app layer' };
const HELD = 'cache, app.conf, whiteout';
const GONE = ['mCache', 'uCache', 'lCreate', 'uConf', 'lCopy', 'uTool', 'lWhite'];

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: { fromChip: 'not read yet', upperChip: 'empty', dataChip: 'empty' },
    sublabels: SUB,
    opacity: stage(),
  },
  {
    id: 'read',
    duration: 3600,
    narration: 'The top row is what the container sees: one overlay mount over the layers below it. It reads /etc/app.conf, and a lookup takes the highest layer holding that path. The upperdir and the app layer have none, so the base layer serves it.',
    chips: { fromChip: 'base layer' },
    chipsCued: { upperChip: 'empty', dataChip: 'empty' },
    sublabels: SUB,
    opacity: stage(),
    lit: ['bConf'],
    rewind: { chips: { fromChip: 'not read yet' } },
    flow: [
      F.route({ points: L_READ, delay: BEAT.lead, dur: LEG_DUR, name: 'read', lights: ['mConf'], tag: { text: 'app.conf', fn: tagGrid, dx: -37 } }),
      F.set({ at: 'read', chips: { fromChip: 'base layer' }, lights: ['fromChip'] }),
    ],
  },
  {
    id: 'create',
    duration: 3600,
    narration: 'The container creates /tmp/cache. No image layer can be written, so the new file lands in the upperdir, the one writable layer this container owns, and the merged view shows it from there.',
    chips: { upperChip: 'cache' },
    chipsCued: { fromChip: 'base layer', dataChip: 'empty' },
    sublabels: SUB,
    opacity: stage({ cache: 1 }),
    lit: ['mCache'],
    rewind: { chips: { upperChip: 'empty' } },
    // The cell and its lane appear as one before the ball leaves (STO.S-02).
    flow: [
      F.reveal({ target: 'mCache' }),
      F.reveal({ target: 'lCreate' }),
      F.fade({ target: 'uCache', from: 0, to: PEND, dur: REVEAL_MS, easing: 'ease-out' }),
      F.route({ points: L_CREATE, delay: BEAT.lead, dur: LEG_DUR, name: 'create', lights: ['uCache'], tag: { text: 'cache', fn: tagGrid, dx: 28 } }),
      F.reveal({ target: 'uCache', from: PEND, at: 'create' }),
      F.set({ at: 'create', chips: { upperChip: 'cache' }, lights: ['upperChip'] }),
    ],
  },
  {
    id: 'copyup',
    duration: 3800,
    narration: 'Now the container edits /etc/app.conf. Overlayfs first copies the whole file up from the base layer into the upperdir, and the edit lands on that copy. The merged view now resolves to the upper copy, and the base copy is hidden but unchanged.',
    chips: { fromChip: 'upperdir', upperChip: 'cache, app.conf' },
    chipsCued: { dataChip: 'empty' },
    sublabels: { ...SUB, mConf: 'from upperdir' },
    opacity: stage({ cache: 1, conf: 1 }),
    lit: ['bConf'],
    rewind: { chips: { fromChip: 'base layer', upperChip: 'cache' }, sublabels: SUB },
    // The read lane leaves the slot before the copy takes it, so the two never share a frame.
    flow: [
      F.fade({ target: 'lRead', from: 1, to: 0, dur: SLOT_MS, fill: 'forwards', easing: 'ease-out', name: 'slot' }),
      F.fade({ target: 'uConf', from: 0, to: PEND, dur: SLOT_MS, at: 'slot', easing: 'ease-out' }),
      F.fade({ target: 'lCopy', from: 0, to: 1, dur: SLOT_MS, at: 'slot', easing: 'ease-out' }),
      F.route({ points: L_COPY, delay: BEAT.lead, dur: LEG_DUR, name: 'copy', lights: ['uConf'], tag: { text: 'copy-up', fn: tagGrid, dx: 34 } }),
      F.reveal({ target: 'uConf', from: PEND, at: 'copy' }),
      F.set({
        at: 'copy', chips: { fromChip: 'upperdir', upperChip: 'cache, app.conf' },
        sublabels: { mConf: 'from upperdir' }, lights: ['mConf', 'fromChip', 'upperChip'],
      }),
    ],
  },
  {
    id: 'whiteout',
    duration: 3800,
    narration: 'Deleting /bin/tool cannot touch the app layer, which is read-only. Overlayfs writes a whiteout for that name into the upperdir instead, and the merged view no longer shows the file. The app layer still holds it.',
    chips: { upperChip: HELD },
    chipsCued: { fromChip: 'upperdir', dataChip: 'empty' },
    sublabels: { mConf: 'from upperdir', mTool: 'no such file' },
    opacity: stage({ cache: 1, conf: 1, tool: 1 }),
    lit: ['mTool'],
    rewind: { chips: { upperChip: 'cache, app.conf' }, sublabels: { mTool: 'from app layer' } },
    flow: [
      F.reveal({ target: 'lWhite' }),
      F.fade({ target: 'uTool', from: 0, to: PEND, dur: REVEAL_MS, easing: 'ease-out' }),
      F.route({ points: L_WHITE, delay: BEAT.lead, dur: LEG_DUR, name: 'white', lights: ['uTool'], tag: { text: 'whiteout', fn: tagGrid, dx: -37 } }),
      F.reveal({ target: 'uTool', from: PEND, at: 'white' }),
      F.set({ at: 'white', chips: { upperChip: HELD }, sublabels: { mTool: 'no such file' }, lights: ['upperChip'] }),
    ],
  },
  {
    id: 'volume',
    duration: 3800,
    narration: 'The container writes db under /data, and that write never enters the overlay. /data is a volume, a separate mount placed over the merged tree at that path, so the bytes skip every layer row and land on the volume.',
    chips: { dataChip: 'db' },
    chipsCued: { fromChip: 'upperdir', upperChip: HELD },
    sublabels: { mConf: 'from upperdir', mTool: 'no such file' },
    opacity: stage({ cache: 1, conf: 1, tool: 1 }),
    lit: ['rowMerged', 'mData'],
    rewind: { chips: { dataChip: 'empty' } },
    flow: [
      F.route({ points: L_VOL, delay: BEAT.lead, dur: SHAFT_DUR, name: 'vol', lights: ['volume'], tag: { text: 'db', fn: tagShaft } }),
      F.set({ at: 'vol', chips: { dataChip: 'db' }, lights: ['dataChip'] }),
    ],
  },
  {
    id: 'remove',
    duration: 4400,
    narration: 'The container is replaced, and the merged row now shows the new one. It starts with a new, empty upperdir, so the cache, the edited app.conf and the whiteout are gone, /bin/tool shows again, and app.conf comes from the base layer. The old upperdir is deleted once the old container is removed. Only the volume still holds db.',
    chips: { fromChip: 'base layer', upperChip: 'new, empty' },
    chipsCued: { dataChip: 'db' },
    sublabels: SUB,
    opacity: stage(),
    lit: ['rowMerged', 'bConf', 'volume'],
    rewind: {
      opacity: stage({ cache: 1, conf: 1, tool: 1 }),
      chips: { fromChip: 'upperdir', upperChip: HELD },
      sublabels: { mConf: 'from upperdir', mTool: 'no such file' },
    },
    flow: [
      ...GONE.map((k, i) => F.fade({ target: k, to: 0, dur: FADE.out, fill: 'forwards', name: i ? undefined : 'wipe' })),
      F.set({ at: 'wipe', chips: { upperChip: 'new, empty' }, sublabels: { mTool: 'from app layer' }, lights: ['upperChip', 'mTool'] }),
      F.fade({ target: 'lRead', from: 0, to: 1, dur: REVEAL_MS, at: 'wipe', fill: 'forwards', easing: 'ease-out', name: 'back' }),
      F.route({ points: L_READ, after: 'back', dur: LEG_DUR, name: 'reread', lights: ['mConf'], tag: { text: 'app.conf', fn: tagGrid, dx: -37 } }),
      F.set({ at: 'reread', chips: { fromChip: 'base layer' }, sublabels: { mConf: 'from base' }, lights: ['fromChip'] }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
