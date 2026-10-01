import { P, F, defineCard, BEAT, OPACITY, FADE, makeRidingLabel } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-volume-model.md


// Three zones: the Pod spec as a ladder left under the panel, the running Pod right of it, and a
// lifetime timeline across the floor. Panel extent measured per viewport in the record.
const POD_X = 432, POD_Y = 60, POD_W = 736;                       // 432..1168, centre 800
const POD_CX = POD_X + POD_W / 2;
// The container row: three 200 by 80 peers, sized by the shell (record SIZES).
const BOX_W = 200, BOX_H = 80, BOX_GAP = 44, ROW_IN = 24;
const ROW_Y = POD_Y + 44, ROW_B = ROW_Y + BOX_H;                  // 104..184
const SEED_X = POD_X + ROW_IN;                                    // 456
const APP_X = SEED_X + BOX_W + BOX_GAP;                           // 700
const SHIP_X = APP_X + BOX_W + BOX_GAP;                           // 944, right edge 1144
const SEED_CX = SEED_X + BOX_W / 2, APP_CX = APP_X + BOX_W / 2, SHIP_CX = SHIP_X + BOX_W / 2;
// One wide disk under the whole row, so every mount drops straight into the same volume.
const VOL_X = SEED_X + ROW_IN, VOL_W = SHIP_X + BOX_W - ROW_IN - VOL_X;   // 480..1120
const VOL_Y = ROW_B + 100, VOL_H = 80, VOL_B = VOL_Y + VOL_H;     // 284..364
const CAP_RY = 8;                                                 // cylinder() cap half-height
// Where a vertical lane meets the top edge of the cap ellipse at x.
const capTop = (x) => VOL_Y + CAP_RY - CAP_RY * Math.sqrt(1 - ((x - POD_CX) / (VOL_W / 2)) ** 2);
// The two files sit inside the disk under the lane that writes each one.
const FILE_W = 120, FILE_H = 28, FILE_Y = VOL_Y + 34;          // clear of a tag under the cap
const POD_H = VOL_B + 36 - POD_Y;                                 // bottom 400, sublabel under disk

// The spec ladder, left of the Pod and under the deepest panel reading.
const SPEC_X = 32, SPEC_W = 360, SPEC_Y = 278, SPEC_ROW = 28, SPEC_GAP = 6;

// The lifetime timeline: one row per object, one cell per phase, the same x for every row.
const TL_LABEL_X = 40, CELL_X = 200, CELL_W = 188, CELL_GAP = 4, BAR_H = 16;
const TL_Y = 448, TL_PITCH = 32;
const cellX = (c) => CELL_X + c * (CELL_W + CELL_GAP);
const rowY = (r) => TL_Y + r * TL_PITCH;
const TL_END = cellX(4) + CELL_W;                                 // 1156

// The app pair sits LANE_DY either side of the app centre: up is the read, down the write.
const LANE_DY = 12;
const W_SEED = [[SEED_CX, ROW_B], [SEED_CX, capTop(SEED_CX)]];
const W_READ = [[APP_CX - LANE_DY, capTop(APP_CX - LANE_DY)], [APP_CX - LANE_DY, ROW_B]];
const W_WRITE = [[APP_CX + LANE_DY, ROW_B], [APP_CX + LANE_DY, capTop(APP_CX + LANE_DY)]];
const W_SHIP = [[SHIP_CX, capTop(SHIP_CX)], [SHIP_CX, ROW_B]];
const CAP_Y = (ROW_B + VOL_Y) / 2 + 4;                            // mountPath captions, mid-gap

// The 100 unit lanes ride routeDur, on the 700ms floor, and each tag lives exactly as long as its
// ball (M-30a), below it and on the side away from the mountPath caption: clear of the row at
// departure, and past the cap front edge, over the disk face, on landing. Record: MOTION.
const tagFn = makeRidingLabel({ role: 'storage', inMs: 200, outMs: 200, hold: 0 });
const DOWN_TAG = { fn: tagFn, dy: 24 };
const UP_TAG = { fn: tagFn, dy: 28 };
// Every ball rides 20 percent faster than the 700ms floor routeDur puts these lanes on: 700 / 1.2.
const LEG_DUR = 580;
// The Pod pulse masks a lit sender until it ends, so a ball leaves at SEND, as on storage-emptydir.
const SEND = BEAT.afterPulse + 500;

const cell = (key, c, r) => P.box({ key, x: cellX(c), y: rowY(r), w: CELL_W, h: BAR_H, rx: 3 });
// Each row stands on a faint axis 3 under its bars, so an empty row still reads as a row.
const track = (r) => P.relation({ points: [[CELL_X, rowY(r) + BAR_H + 3], [TL_END, rowY(r) + BAR_H + 3]] });
const rowLabel = (r, text) => P.tag({ x: TL_LABEL_X, y: rowY(r) + 12, anchor: 'start', text });
const PHASES = ['on a Node', 'init', 'start', 'share', 'restart'];

// Z-order (bottom -> top): the Pod group (shell, containers, disk, files) so the pulse takes it as
// a unit, then the mount lanes and captions, the spec ladder, the timeline, then the packet layer.
export const SCENE = {
  'aria-label': 'Pod volume model: the Pod spec declares one emptyDir volume named cache under spec.volumes, and each container reaches it only through a volumeMounts entry of its own. The init container seed mounts cache at /work, writes config.json and exits. The app mounts it at /data and reads that file, the log shipper mounts it read-only at /logs and reads the app.log the app writes. When the app crashes and restarts, the new container mounts the same volume and app.log is still there. A lifetime timeline shows the volume bar starting and running with the Pod bar while every container bar is shorter, because the volume belongs to the Pod, not to any container.',
  parts: [
    P.defs(),
    P.group({
      key: 'pod',
      parts: [
        P.pod({ key: 'shellWrap', x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'status.phase: Pending', containers: 0 }),
        P.box({ key: 'seedBox', x: SEED_X, y: ROW_Y, w: BOX_W, h: BOX_H, label: 'seed', sublabel: 'init, not started' }),
        P.box({ key: 'appBox', x: APP_X, y: ROW_Y, w: BOX_W, h: BOX_H, label: 'app', sublabel: 'not started' }),
        P.box({ key: 'shipBox', x: SHIP_X, y: ROW_Y, w: BOX_W, h: BOX_H, label: 'log-shipper', sublabel: 'not started' }),
        P.cylinder({ key: 'volume', x: VOL_X, y: VOL_Y, w: VOL_W, h: VOL_H, label: 'Volume cache', labelY: VOL_H / 2 + 10 }),
        P.box({ key: 'fConfig', x: SEED_CX - FILE_W / 2, y: FILE_Y, w: FILE_W, h: FILE_H, rx: 4, label: 'config.json' }),
        P.box({ key: 'fLog', x: SHIP_CX - FILE_W / 2, y: FILE_Y, w: FILE_W, h: FILE_H, rx: 4, label: 'app.log' }),
      ],
    }),
    P.lane({ key: 'wSeed', points: W_SEED, dashed: true, dim: true }),
    P.lane({ key: 'wRead', points: W_READ, dashed: true, dim: true }),
    P.lane({ key: 'wWrite', points: W_WRITE, dashed: true, dim: true }),
    P.lane({ key: 'wShip', points: W_SHIP, dashed: true, dim: true }),
    P.tag({ key: 'capSeed', x: SEED_CX - 8, y: CAP_Y, anchor: 'end', text: '/work' }),
    P.tag({ key: 'capApp', x: APP_CX - LANE_DY - 8, y: CAP_Y, anchor: 'end', text: '/data' }),
    P.tag({ key: 'capShip', x: SHIP_CX + 8, y: CAP_Y, anchor: 'start', text: '/logs, readOnly' }),
    P.tag({ x: SPEC_X, y: SPEC_Y - 12, anchor: 'start', text: 'Pod spec' }),
    P.chain({
      key: 'chain', x: SPEC_X, y: SPEC_Y, w: SPEC_W, rowH: SPEC_ROW, gap: SPEC_GAP,
      items: [
        'volumes: cache, emptyDir: {}',
        'seed volumeMounts: cache /work',
        'app volumeMounts: cache /data',
        'log-shipper volumeMounts: cache /logs readOnly',
      ],
    }),
    ...PHASES.map((p, c) => P.tag({ x: cellX(c) + CELL_W / 2, y: TL_Y - 10, text: p })),
    ...[0, 1, 2, 3, 4].map(track),
    rowLabel(0, 'Pod web-0'), rowLabel(1, 'volume cache'), rowLabel(2, 'seed'), rowLabel(3, 'app'), rowLabel(4, 'log-shipper'),
    cell('pod0', 0, 0), cell('pod1', 1, 0), cell('pod2', 2, 0), cell('pod3', 3, 0), cell('pod4', 4, 0),
    cell('vol0', 0, 1), cell('vol1', 1, 1), cell('vol2', 2, 1), cell('vol3', 3, 1), cell('vol4', 4, 1),
    cell('seed1', 1, 2),
    cell('app2', 2, 3), cell('app3', 3, 3), cell('app4', 4, 3),
    cell('ship2', 2, 4), cell('ship3', 3, 4), cell('ship4', 4, 4),
    P.packets(),
  ],
  reset: {
    keys: ['seedBox', 'appBox', 'shipBox', 'volume', 'pod0', 'pod1', 'pod2', 'pod3', 'pod4', 'vol0', 'vol1', 'vol2', 'vol3', 'vol4'],
    pods: ['shellWrap'],
  },
};

// STO.S-01 as a field: every element born mid-story, with its lanes and captions, pinned on every
// step as a function of how far the story has got (n = the step index, idle 0).
const CELLS = { pod: [0, 1, 2, 3, 4], vol: [0, 1, 2, 3, 4], seed: [1], app: [2, 3, 4], ship: [2, 3, 4] };
function stage(n) {
  const o = {
    pod: 1,
    volume: n >= 1 ? 1 : OPACITY.pending,
    seedBox: n < 2 ? OPACITY.pending : OPACITY.terminated,
    appBox: n < 3 ? OPACITY.pending : 1,
    shipBox: n < 3 ? OPACITY.pending : 1,
    fConfig: n >= 2 ? 1 : 0,
    fLog: n >= 4 ? 1 : 0,
  };
  for (const k of ['wSeed', 'capSeed']) o[k] = n < 2 ? 0 : OPACITY.terminated;
  for (const k of ['wRead', 'wWrite', 'wShip', 'capApp', 'capShip']) o[k] = n < 3 ? 0 : 1;
  for (const row of Object.keys(CELLS)) for (const c of CELLS[row]) o[row + c] = n >= c + 1 ? 1 : 0;
  return o;
}
// The cells a step opens, revealed from nothing at its start.
const openCells = (keys, delay = 0) => keys.map((target) => F.reveal({ target, delay }));
const hidden = (keys) => Object.fromEntries(keys.map((k) => [k, 0]));

const NOT_STARTED = { seedBox: 'init, not started', appBox: 'not started', shipBox: 'not started' };
const RUNNING = { seedBox: 'init, Completed', appBox: 'running', shipBox: 'running' };
const PENDING = { shellWrap: 'status.phase: Pending' };
const RUNNING_POD = { shellWrap: 'status.phase: Running' };
const LIFETIME = ['pod0', 'pod1', 'pod2', 'pod3', 'pod4', 'vol0', 'vol1', 'vol2', 'vol3', 'vol4'];

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    sublabels: NOT_STARTED,
    podSublabels: PENDING,
    opacity: stage(0),
    chain: -1,
  },
  {
    id: 'declare',
    duration: 2600,
    narration: 'The Pod spec names one emptyDir volume, cache, under spec.volumes. It belongs to the Pod, not to a container: it is created empty when the Pod is assigned to a Node, before any container starts. Its bar starts with the Pod bar.',
    sublabels: NOT_STARTED,
    podSublabels: PENDING,
    opacity: stage(1),
    chain: 0,
    // The Pod is not acting yet, so it does not pulse. The disk and the first two cells appear.
    lit: ['volume'],
    rewind: { opacity: { volume: OPACITY.pending, ...hidden(['pod0', 'vol0']) } },
    flow: [
      F.reveal({ target: 'volume', from: OPACITY.pending }),
      ...openCells(['pod0', 'vol0']),
    ],
  },
  {
    id: 'init',
    duration: 3800,
    narration: 'The init container seed runs first, to completion. Its own volumeMounts entry puts cache at /work, where it writes config.json, then it exits. Its bar ends and its mount goes with it, but the file stays in the volume.',
    sublabels: { ...NOT_STARTED, seedBox: 'init, Completed' },
    podSublabels: PENDING,
    opacity: stage(2),
    chain: 1,
    rewind: {
      sublabels: { seedBox: 'init, running' },
      opacity: { seedBox: OPACITY.pending, wSeed: 0, capSeed: 0, fConfig: 0, ...hidden(['pod1', 'vol1', 'seed1']) },
      // seed sends the ball, so it is lit on the animated path only: its static end is Completed.
      lit: ['seedBox'],
    },
    // seed mounts with its lane and caption, writes, and 300 after the landing all three go dim.
    flow: [
      F.pulse({ pod: 'pod' }),
      F.reveal({ target: 'seedBox', from: OPACITY.pending }),
      F.reveal({ target: 'wSeed' }),
      F.reveal({ target: 'capSeed' }),
      ...openCells(['pod1', 'vol1', 'seed1']),
      F.route({ points: W_SEED, delay: SEND, dur: LEG_DUR, name: 'write', lights: ['volume'] }),
      F.tag({ text: 'write config.json', points: W_SEED, delay: SEND, dur: LEG_DUR, dx: 64, ...DOWN_TAG }),
      F.reveal({ target: 'fConfig', at: 'write' }),
      F.set({ after: 'write', plus: 300, sublabels: { seedBox: 'init, Completed' } }),
      F.fade({ target: 'seedBox', to: OPACITY.terminated, dur: FADE.out, after: 'write', plus: 300, unlight: ['seedBox'] }),
      F.fade({ target: 'wSeed', to: OPACITY.terminated, dur: FADE.out, after: 'write', plus: 300 }),
      F.fade({ target: 'capSeed', to: OPACITY.terminated, dur: FADE.out, after: 'write', plus: 300 }),
    ],
  },
  {
    id: 'start',
    duration: 3200,
    narration: 'Now app and log-shipper start, and each lists cache in a volumeMounts entry of its own: app at /data, log-shipper at /logs with readOnly set. App opens /data/config.json and finds the file seed left, although seed no longer runs.',
    sublabels: RUNNING,
    podSublabels: RUNNING_POD,
    opacity: stage(3),
    chain: [2, 3],
    lit: ['volume'],
    rewind: {
      sublabels: { appBox: NOT_STARTED.appBox, shipBox: NOT_STARTED.shipBox },
      podSublabels: PENDING,
      opacity: {
        appBox: OPACITY.pending, shipBox: OPACITY.pending,
        ...hidden(['wRead', 'wWrite', 'wShip', 'capApp', 'capShip', 'pod2', 'vol2', 'app2', 'ship2']),
      },
    },
    flow: [
      F.pulse({ pod: 'pod' }),
      F.reveal({ target: 'appBox', from: OPACITY.pending }),
      F.reveal({ target: 'shipBox', from: OPACITY.pending }),
      ...['wRead', 'wWrite', 'wShip', 'capApp', 'capShip'].map((target) => F.reveal({ target })),
      ...openCells(['pod2', 'vol2', 'app2', 'ship2']),
      F.set({ delay: 300, sublabels: RUNNING, podSublabels: RUNNING_POD }),
      F.route({ points: W_READ, delay: SEND, dur: LEG_DUR, lights: ['appBox'] }),
      F.tag({ text: 'read config.json', points: W_READ, delay: SEND, dur: LEG_DUR, dx: 86, ...UP_TAG }),
    ],
  },
  {
    id: 'share',
    duration: 3800,
    narration: 'Both containers see the same bytes under different paths. App writes app.log into /data, and log-shipper reads that very file at /logs through a mount that cannot write. That is the usual way two containers of one Pod share files.',
    sublabels: RUNNING,
    podSublabels: RUNNING_POD,
    opacity: stage(4),
    chain: [2, 3],
    lit: ['appBox'],
    rewind: { opacity: { fLog: 0, ...hidden(['pod3', 'vol3', 'app3', 'ship3']) } },
    flow: [
      F.pulse({ pod: 'pod' }),
      ...openCells(['pod3', 'vol3', 'app3', 'ship3']),
      F.route({ points: W_WRITE, delay: SEND, dur: LEG_DUR, name: 'write', lights: ['volume'] }),
      F.tag({ text: 'write app.log', points: W_WRITE, delay: SEND, dur: LEG_DUR, dx: 62, ...DOWN_TAG }),
      F.reveal({ target: 'fLog', at: 'write' }),
      F.route({ points: W_SHIP, after: 'write', dur: LEG_DUR, lights: ['shipBox'] }),
      F.tag({ text: 'read app.log', points: W_SHIP, after: 'write', dur: LEG_DUR, dx: -62, ...UP_TAG }),
    ],
  },
  {
    id: 'restart',
    duration: 3200,
    narration: 'App crashes, and restartPolicy Always, the default, restarts it in the same Pod, so its restart count goes to 1. The new container starts clean outside the volume, yet it mounts the same cache at /data and app.log is still there.',
    sublabels: { ...RUNNING, appBox: 'restarted, count 1' },
    podSublabels: RUNNING_POD,
    opacity: stage(5),
    chain: 2,
    lit: ['volume'],
    rewind: {
      sublabels: { appBox: 'crashed' },
      opacity: hidden(['pod4', 'vol4', 'app4', 'ship4']),
    },
    // DO NOT flicker the app box: the sublabel and the late app cell carry the crash.
    flow: [
      F.pulse({ pod: 'pod' }),
      ...openCells(['pod4', 'vol4', 'ship4']),
      ...openCells(['app4'], 500),
      F.set({ delay: 500, sublabels: { appBox: 'restarted, count 1' } }),
      F.route({ points: W_READ, delay: SEND, dur: LEG_DUR, lights: ['appBox'] }),
      F.tag({ text: 'app.log intact', points: W_READ, delay: SEND, dur: LEG_DUR, dx: 80, ...UP_TAG }),
    ],
  },
  {
    id: 'lifetime',
    duration: 3000,
    narration: 'No container bar spans the whole story, and none of them ever owned the volume. The cache bar is the Pod bar: this emptyDir lasts until the Pod leaves its Node, however many containers come and go inside it.',
    sublabels: { ...RUNNING, appBox: 'restarted, count 1' },
    podSublabels: RUNNING_POD,
    opacity: stage(6),
    chain: 0,
    lit: ['volume', ...LIFETIME],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
