import { P, F, defineCard, BEAT, makeRidingLabel } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-configmap-secret-mount.md


// The mounted directory drawn as its own listing: one row per entry, in name order, so every entry
// owns a fixed slot and an entry that does not exist leaves its slot empty. The listing and the
// right column sit right of x 420, the Pod left of the listing below the panel. Panel extent
// measured per viewport in the record.
const CX = 600;                                                   // canvas centre: the listing and the chips sit on it
const ROW_W = 232, ROW_H = 56, ROW_GAP = 12;
const ROW_X = CX - ROW_W / 2;                                     // 484..716, the pointer gutter left of it
// The listing starts at 94 rather than at the top edge: with the chips at 530 that leaves 74 above
// the title and 76 under the chips, so the drawing sits centred in the canvas rather than high in it.
const ROW_Y0 = 94, TITLE_Y = ROW_Y0 - 20;                         // the listing title sits over row 0
const rowY = (i) => ROW_Y0 + i * (ROW_H + ROW_GAP);               // 94 / 162 / 230 / 298 / 366
const rowMY = (i) => rowY(i) + ROW_H / 2;                         // 122 / 190 / 258 / 326 / 394
const ROW_CX = ROW_X + ROW_W / 2;                                 // 600, the canvas centre
const ROW_R = ROW_X + ROW_W;
// Name order, the way ls -a sorts it: the digits of a timestamp sort before the d of ..data.
const V1 = 0, V2 = 1, DATA = 2, TMP = 3, CONF = 4;
const GUTTER_X = ROW_X - 30;                                      // 454, the ..data pointer bracket

// The writer and its source in one column right of the listing, 232 by 80 (NET.L-01).
const BOX_W = 232, BOX_H = 80;
// The column mirrors the Pod about CX: the Pod runs 100..332, so the column runs 868..1100.
const POD_X = 100, POD_W = 232, POD_H = 104;
const COL_X = 1200 - POD_X - BOX_W, COL_CX = COL_X + BOX_W / 2;    // 868..1100, centre 984
const KUBE_Y = 184, KUBE_MY = KUBE_Y + BOX_H / 2;                 // 184..264, mid 224, inside the bus span
const BUS_X = (ROW_X + ROW_W + COL_X) / 2;                        // 792, midway between listing and column

// One Pod under the panel, 232 by 104 with a 192 by 44 app box (NET.L-01), level with the app.conf
// row so the read is one straight run out of the row's left face.
const POD_Y = rowMY(CONF) - POD_H / 2;                            // 342..446
const API_Y = POD_Y + POD_H - BOX_H;                              // 366..446, floor level with the Pod
const CAPTION_Y = POD_Y + POD_H + 30;                             // 476, the backing caption under the listing

const CHIP_W = 300, CHIP_GAP = 16, CHIP_H = 34, CHIPS_Y = 530;
const chipX = (i) => CX - (3 * CHIP_W + 2 * CHIP_GAP) / 2 + i * (CHIP_W + CHIP_GAP);    // 134 / 450 / 766

// Each static wire and its ball share one array.
const W_WATCH = [[COL_CX, API_Y], [COL_CX, KUBE_Y + BOX_H]];
const writeTo = (i) => [[COL_X, KUBE_MY], [BUS_X, KUBE_MY], [BUS_X, rowMY(i)], [ROW_R, rowMY(i)]];
const W_V1 = writeTo(V1), W_V2 = writeTo(V2), W_TMP = writeTo(TMP);
const W_READ = [[ROW_X, rowMY(CONF)], [POD_X + POD_W, rowMY(CONF)]];
// The ..data pointer: out of its row left face, along the gutter, into a version row. Only one of
// the two is ever drawn at rest, which is the whole swap.
const pointTo = (i) => [[ROW_X, rowMY(DATA)], [GUTTER_X, rowMY(DATA)], [GUTTER_X, rowMY(i)], [ROW_X, rowMY(i)]];

// ONE speed for every ball on the card: routeDur clamps the 102 unit watch leg to the 700ms floor
// and leaves the 266 unit writes at the same 700, so the short leg crawls beside the long one. At
// 0.14 units per ms the shortest leg still rides 729ms, above that floor, and a tag stays readable.
const PKT_SPEED = 0.14;
const legLen = (pts) => pts.slice(1).reduce((n, q, i) => n + Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]), 0);
const legDur = (pts) => Math.round(legLen(pts) / PKT_SPEED);
const D_WATCH = legDur(W_WATCH), D_V1 = legDur(W_V1), D_V2 = legDur(W_V2);   // 729 / 1900 / 1414
const D_TMP = legDur(W_TMP), D_READ = legDur(W_READ);                        // 1900 / 1229
const riding = makeRidingLabel({ role: 'storage', inMs: 200, outMs: 200, hold: 0 });   // lives as long as its ball (M-30a)
// The watch lane is a 102 unit gap between two 232 wide boxes, and the ..data_tmp write ends on a
// row face: both tags TRAIL their ball, so they end in the gap short of the face, and emerge once
// clear of the box they leave. Each lives exactly as long as its ball (M-30a).
const emerging = makeRidingLabel({ role: 'storage', inMs: 200, outMs: 200, hold: 0, emergeMode: true });
const WATCH_TAG = { fn: emerging, dx: 60, dy: 20, emerge: 550 };
// The two version writes climb, so their tag trails right of the ball and 50 above it: clear of the
// Kubelet top at departure and right of the row face at arrival.
const WRITE_TAG = { fn: riding, dx: 40, dy: -50 };
const TMP_TAG = { fn: emerging, dx: 40, dy: 20, emerge: 500 };
// The read runs left, so its tag trails right of the ball and above the app.conf row top.
const READ_TAG = { fn: riding, dx: 24, dy: -34 };

// Z-order (bottom -> top): the listing rows, the Pod, the column, the pointers and lanes,
// the captions, the chips, then the packet layer.
export const SCENE = {
  'aria-label': 'ConfigMap and Secret volumes as files: the mounted directory is a listing of symlinks. Kubelet writes the keys of ConfigMap app, every key or only the ones the volume lists in items, as files into a hidden timestamped directory, points ..data at it, and app.conf is a symlink to ..data/app.conf. When the ConfigMap changes, Kubelet writes the whole new version into a second timestamped directory on its next sync, points a ..data_tmp symlink at it and renames it over ..data in one rename, atomic on Linux, then deletes the old directory. The app is not restarted and reads the new file the next time it opens it. A Secret volume is written the same way, on tmpfs on a Linux Node.',
  parts: [
    P.defs(),
    P.box({ key: 'dirV1', x: ROW_X, y: rowY(V1), w: ROW_W, h: ROW_H, label: '..2026_09_19_10_00', sublabel: 'app.conf v1, mode 0644', opacity: 0 }),
    P.box({ key: 'dirV2', x: ROW_X, y: rowY(V2), w: ROW_W, h: ROW_H, label: '..2026_09_19_10_07', sublabel: 'app.conf v2, mode 0644', opacity: 0 }),
    P.box({ key: 'dataRow', x: ROW_X, y: rowY(DATA), w: ROW_W, h: ROW_H, label: '..data', sublabel: '-> ..2026_09_19_10_00', opacity: 0 }),
    P.box({ key: 'tmpRow', x: ROW_X, y: rowY(TMP), w: ROW_W, h: ROW_H, label: '..data_tmp', sublabel: '-> ..2026_09_19_10_07', opacity: 0 }),
    P.box({ key: 'confRow', x: ROW_X, y: rowY(CONF), w: ROW_W, h: ROW_H, label: 'app.conf', sublabel: '-> ..data/app.conf', opacity: 0 }),
    P.pod({
      key: 'pod', innerKey: 'appBox', x: POD_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Pod api-0', sublabel: 'mounts /etc/config',
      inner: { dx: 20, dy: 26, w: POD_W - 40, h: 44, label: 'app', sublabel: 'reads app.conf' },
    }),
    P.box({ key: 'kubelet', x: COL_X, y: KUBE_Y, w: BOX_W, h: BOX_H, label: 'Kubelet', sublabel: 'writes the volume' }),
    P.box({ key: 'api', x: COL_X, y: API_Y, w: BOX_W, h: BOX_H, label: 'API server', sublabel: 'holds ConfigMap app' }),
    // The ..data pointers are relationships, not traffic: no ball ever rides them.
    P.relation({ key: 'symV1', points: pointTo(V1), opacity: 0 }),
    P.relation({ key: 'symV2', points: pointTo(V2), opacity: 0 }),
    P.lane({ key: 'wWatch', points: W_WATCH, dashed: true, dim: true }),
    P.lane({ key: 'wV1', points: W_V1, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wV2', points: W_V2, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wTmp', points: W_TMP, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wRead', points: W_READ, dashed: true, dim: true, opacity: 0 }),
    P.tag({ key: 'title', cls: 'scheme-label code', x: ROW_CX, y: TITLE_Y, text: '/etc/config', opacity: 0 }),
    // What backs the listing, and so born with it: on idle there are no files for it to be about.
    P.tag({ key: 'backing', x: ROW_CX, y: CAPTION_Y, text: 'these files sit on Node storage, and a Secret volume on Linux sits in tmpfs, in RAM', opacity: 0 }),
    P.chip({ key: 'target', x: chipX(0), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: '..data target', value: 'none' }),
    P.chip({ key: 'dirs', x: chipX(1), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'version dirs', value: '0' }),
    P.chip({ key: 'reads', x: chipX(2), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'app reads', value: 'nothing yet' }),
    P.packets(),
  ],
  reset: {
    keys: ['dirV1', 'dirV2', 'dataRow', 'tmpRow', 'confRow', 'kubelet', 'api', 'target', 'dirs', 'reads'],
    pods: ['pod'],
  },
};

// STO.S-01 as a field: every row is born or removed mid-story, and every lane and pointer goes with
// the row on its end (STO.S-02, A-14), so the whole set is pinned on EVERY step.
const stage = (o) => ({
  pod: 1, wWatch: 1, title: 0, backing: 0,
  dirV1: 0, dirV2: 0, dataRow: 0, tmpRow: 0, confRow: 0,
  symV1: 0, symV2: 0, wV1: 0, wV2: 0, wTmp: 0, wRead: 0, ...o,
});
const EMPTY = stage({});
const PROJECTED = stage({ title: 1, backing: 1, dirV1: 1, dataRow: 1, confRow: 1, symV1: 1, wV1: 1, wRead: 1 });
const STAGED = { ...PROJECTED, dirV2: 1, wV2: 1 };
const SWAPPED = { ...STAGED, symV1: 0, symV2: 1, dirV1: 0, wV1: 0 };

const C_EMPTY = { target: 'none', dirs: '0', reads: 'nothing yet' };
const C_PROJECTED = { ...C_EMPTY, target: 'v1 dir', dirs: '1' };
const C_STAGED = { target: 'v1 dir', dirs: '2', reads: 'app.conf v1' };
const C_RENAMED = { ...C_STAGED, target: 'v2 dir' };
const C_SWAPPED = { ...C_RENAMED, dirs: '1' };
const C_REREAD = { ...C_SWAPPED, reads: 'app.conf v2' };
const TO_V1 = { dataRow: '-> ..2026_09_19_10_00' };
const TO_V2 = { dataRow: '-> ..2026_09_19_10_07' };
const SHOW = (target) => ({ target, from: 0, to: 1, dur: 300, fill: 'forwards', easing: 'ease-out' });
const HIDE = (target) => ({ target, from: 1, to: 0, dur: 300, fill: 'forwards', easing: 'ease-in' });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: C_EMPTY,
    sublabels: TO_V1,
    opacity: EMPTY,
  },
  {
    id: 'project',
    duration: 5200,
    narration: 'By default Kubelet watches ConfigMap app on the API server. Before the container starts it writes every key as a file, or only the keys the volume lists in items, into a hidden timestamped directory, then points the ..data symlink at it. The app.conf entry is a symlink to ..data/app.conf. On Linux a Secret volume is built the same way, on tmpfs.',
    chips: C_PROJECTED,
    sublabels: TO_V1,
    opacity: PROJECTED,
    rewind: { chips: C_EMPTY, opacity: EMPTY },
    lit: ['api'],
    flow: [
      F.route({ points: W_WATCH, delay: BEAT.lead, dur: D_WATCH, name: 'watch', lights: ['kubelet'] }),
      F.tag({ text: 'ConfigMap app', points: W_WATCH, delay: BEAT.lead, dur: D_WATCH, ...WATCH_TAG }),
      // The directory and its lane appear together before the write leaves (STO.S-02, A-15).
      F.fade({ ...SHOW('title'), at: 'watch' }),
      F.fade({ ...SHOW('dirV1'), at: 'watch' }),
      F.fade({ ...SHOW('wV1'), at: 'watch' }),
      F.route({ points: W_V1, after: 'watch', plus: 250, dur: D_V1, name: 'write', lights: ['dirV1'] }),
      F.tag({ text: 'app.conf v1', points: W_V1, after: 'watch', plus: 250, dur: D_V1, ...WRITE_TAG }),
      // The pointer and the user-visible link exist once the files do.
      F.fade({ ...SHOW('dataRow'), at: 'write' }),
      F.fade({ ...SHOW('symV1'), at: 'write' }),
      F.fade({ ...SHOW('confRow'), at: 'write' }),
      F.fade({ ...SHOW('wRead'), at: 'write' }),
      F.fade({ ...SHOW('backing'), at: 'write' }),
      F.set({ at: 'write', chips: C_PROJECTED }),
      F.light({ targets: ['dataRow', 'confRow', 'target', 'dirs'], at: 'write' }),
    ],
  },
  {
    id: 'stage',
    duration: 7000,
    narration: 'Someone edits ConfigMap app. The watch updates the Kubelet cache, and on its next periodic sync, by default a minute or so later, Kubelet writes the whole v2 into a second timestamped directory. Nothing points at it yet, so the app still reads v1.',
    chips: C_STAGED,
    sublabels: TO_V1,
    opacity: STAGED,
    rewind: { chips: C_PROJECTED, opacity: PROJECTED },
    lit: ['api'],
    flow: [
      F.route({ points: W_WATCH, delay: BEAT.lead, dur: D_WATCH, name: 'watch', lights: ['kubelet'] }),
      F.tag({ text: 'ConfigMap app v2', points: W_WATCH, delay: BEAT.lead, dur: D_WATCH, ...WATCH_TAG }),
      F.fade({ ...SHOW('dirV2'), at: 'watch' }),
      F.fade({ ...SHOW('wV2'), at: 'watch' }),
      F.route({ points: W_V2, after: 'watch', plus: 250, dur: D_V2, name: 'write', lights: ['dirV2'] }),
      F.tag({ text: 'app.conf v2', points: W_V2, after: 'watch', plus: 250, dur: D_V2, ...WRITE_TAG }),
      F.set({ at: 'write', chips: { ...C_PROJECTED, dirs: '2' } }),
      F.light({ targets: ['dirs', 'confRow'], at: 'write' }),
      // With v2 on disk, the app opens app.conf and still resolves through ..data to v1.
      F.route({ points: W_READ, after: 'write', plus: 700, dur: D_READ, name: 'read' }),
      F.tag({ text: 'v1', points: W_READ, after: 'write', plus: 700, dur: D_READ, ...READ_TAG }),
      F.pulse({ pod: 'pod', at: 'read' }),
      F.set({ at: 'read', chips: C_STAGED }),
      F.light({ targets: ['reads'], at: 'read' }),
    ],
  },
  {
    id: 'swap',
    duration: 7800,
    narration: 'In the same sync, Kubelet points a new ..data_tmp symlink at v2 and renames it over ..data. On Linux the rename is atomic, so opening app.conf gets all of v1 or all of v2, never a mix, and only then is the v1 directory deleted. Nothing restarts the app: the next time it opens app.conf, it reads v2.',
    chips: C_REREAD,
    sublabels: TO_V2,
    // The static end state is after the rename, the delete and the re-read, and rewind puts the
    // pre-swap listing back for the animated path alone.
    opacity: SWAPPED,
    rewind: { chips: C_STAGED, sublabels: TO_V1, opacity: STAGED },
    lit: ['kubelet'],
    flow: [
      F.fade({ ...SHOW('tmpRow'), delay: 400 }),
      F.fade({ ...SHOW('wTmp'), delay: 400 }),
      // The ..data_tmp cue rides an F.set rather than `lights`, so `flowLights` never derives it
      // onto the static path, where the row is already gone (S-18), and the fade below takes the
      // class off with the row.
      F.route({ points: W_TMP, delay: BEAT.lead, dur: D_TMP, name: 'link' }),
      F.tag({ text: '..data_tmp', points: W_TMP, delay: BEAT.lead, dur: D_TMP, ...TMP_TAG }),
      F.set({ at: 'link', lit: ['tmpRow'] }),
      // The rename: ..data_tmp is gone and ..data, so app.conf, resolves to v2, in one beat.
      F.fade({ ...HIDE('tmpRow'), at: 'link', plus: 500, unlight: ['tmpRow'] }),
      F.fade({ ...HIDE('wTmp'), at: 'link', plus: 500 }),
      F.fade({ ...HIDE('symV1'), at: 'link', plus: 500 }),
      F.fade({ ...SHOW('symV2'), at: 'link', plus: 500 }),
      F.set({ at: 'link', plus: 500, chips: C_RENAMED, sublabels: TO_V2 }),
      F.light({ targets: ['dataRow', 'dirV2', 'target', 'confRow'], at: 'link', plus: 500 }),
      // Then, a separate beat, the old directory is deleted.
      F.fade({ ...HIDE('dirV1'), dur: 400, at: 'link', plus: 1700 }),
      F.fade({ ...HIDE('wV1'), dur: 400, at: 'link', plus: 1700 }),
      F.set({ at: 'link', plus: 2100, chips: C_SWAPPED }),
      F.light({ targets: ['dirs'], at: 'link', plus: 2100 }),
      // With v1 gone, the app opens app.conf again and resolves through ..data to v2.
      F.route({ points: W_READ, at: 'link', plus: 2400, dur: D_READ, name: 'read' }),
      F.tag({ text: 'v2', points: W_READ, at: 'link', plus: 2400, dur: D_READ, ...READ_TAG }),
      F.pulse({ pod: 'pod', at: 'read' }),
      F.set({ at: 'read', chips: C_REREAD }),
      F.light({ targets: ['reads'], at: 'read' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
