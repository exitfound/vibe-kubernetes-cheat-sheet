import { P, F, defineCard, spread, strip, midX, WL, FADE, BEAT, OPACITY } from './workloads-kit.js';
import { g, rect, text } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/workloads-env-before-pid-1.md

// No ladder, so not the A / B / C preset (WL.L-06). The source row starts left of the panel
// edge, a deliberate L-03 deviation the record keeps open.

// Band 1: three equal source peers. ROW_L centres the row on WL.CX. SRC_W is set by the env strip
// below, which takes this row's span and needs 220 to fit its widest pair.
const ROW_L = 254;                                       // WL.CX - (3 * SRC_W + 2 * SRC_GAP) / 2
const SRC_W = 220, SRC_GAP = 16, SRC_BOTTOM = WL.TOP_Y + WL.BOX_H;
const SRC_R = ROW_L + 3 * SRC_W + 2 * SRC_GAP;
const SRC = spread({ from: ROW_L, to: SRC_R, count: 3, w: SRC_W });
const SRC_CX = (i) => SRC.x(i) + SRC_W / 2;

// Lands on WL.SPINE_X (WL.L-07), so every leg is a straight drop and every band centres on it.
const SPINE_X = midX(ROW_L, SRC_R);

// Band 2: the merge, the width of the source row.
const BAR_X = ROW_L, BAR_W = SRC_R - BAR_X;
const BAR_Y = 302, BAR_H = 62;
const LEG = [0, 1, 2].map(i => [[SRC_CX(i), SRC_BOTTOM], [SRC_CX(i), BAR_Y]]);

// Bands 3 and 4 take the merge box span, so every band ends on the same two x. The wall is a chip
// height tall so its captions sit inside it, split by the doorway.
const LOW_L = BAR_X, LOW_R = SRC_R;
const WALL_Y = 388, WALL_H = 34, DOOR = 60;
const WALL_L_W = SPINE_X - DOOR / 2 - LOW_L;
const WALL_R_X = SPINE_X + DOOR / 2;
const WALL_TEXT_Y = WALL_Y + WALL_H / 2 + 4;
const WALL_CX = (x, w) => x + w / 2;

// Band 4: the container the set is handed to, and under it the set itself.
const POD_W = 480, POD_X = SPINE_X - POD_W / 2, POD_Y = 446, POD_H = 132;
const CONT_W = 360, CONT_X = SPINE_X - CONT_W / 2, CONT_H = 68;
const CONT_Y = POD_Y + 34;
// Clear of the Pod sublabel ink.
const ENV_Y = 594;
const ENV = strip({ from: LOW_L, to: LOW_R, count: 3, gap: 14 });

// The one crossing, down the spine through the doorway.
const HANDOVER = [[SPINE_X, BAR_Y + BAR_H], [SPINE_X, POD_Y]];
const WIRE_X = SPINE_X;

// A hand-built chip whose label is a separate P.tag, so it is addressable per step.
// P.raw bypasses the kit binding, so the role is written by hand.
const wallSeg = (key, x, w) => P.raw({
  key,
  make: () => {
    const seg = g({ class: 'scheme-box', 'data-role': 'cluster', transform: `translate(${x},${WALL_Y})` });
    seg.appendChild(rect({ class: 'scheme-box-rect', x: 0, y: 0, width: w, height: WALL_H, rx: 4 }));
    return seg;
  },
});

// List order is z-order: lanes, wire and env strip under the packet layer, the rest above the ball.
export const SCENE = {
  'aria-label': 'Environment before PID 1: three different kinds of source feed one environment, the Kubelet merges them at launch, the whole set crosses the CreateContainer line once per container start, and an edit to the source afterwards never reaches the running process',
  parts: [
    P.defs(),
    // Every leg carries a ball on some step (A-05). Nothing travels upward, so no lane pairs.
    ...LEG.map((points, i) => P.lane({ key: 'leg' + i, points, dim: true, dashed: true, role: 'cluster' })),
    P.lane({ key: 'handover', points: HANDOVER, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the wire label sits above the top row.
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    // One group: the set is handed over as one thing.
    P.group({
      key: 'envSet',
      parts: [
        P.chip({ key: 'envDb', x: ENV.x(0), y: ENV_Y, w: ENV.w, h: WL.CHIP_H, name: 'DB_HOST', value: 'unset' }),
        P.chip({ key: 'envIp', x: ENV.x(1), y: ENV_Y, w: ENV.w, h: WL.CHIP_H, name: 'MY_POD_IP', value: 'unset' }),
        P.chip({ key: 'envSvc', x: ENV.x(2), y: ENV_Y, w: ENV.w, h: WL.CHIP_H, name: 'WEB_SERVICE_HOST', value: 'unset' }),
      ],
    }),
    P.packets(),
    wallSeg('wallL', LOW_L, WALL_L_W),
    wallSeg('wallR', WALL_R_X, LOW_R - WALL_R_X),
    // Two independent captions, each centred in its own half.
    P.tag({ key: 'wallTagL', x: WALL_CX(LOW_L, WALL_L_W), y: WALL_TEXT_Y, text: 'one call carries the whole set over' }),
    P.tag({ key: 'wallTagR', x: WALL_CX(WALL_R_X, LOW_R - WALL_R_X), y: WALL_TEXT_Y, text: 'nothing rewrites it short of a restart' }),
    P.pod({
      key: 'podGroup', id: 'podGroup',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'no container yet', containers: 0,
      inner: { dx: CONT_X - POD_X, dy: CONT_Y - POD_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'container' },
    }),
    P.box({ key: 'barEl', x: BAR_X, y: BAR_Y, w: BAR_W, h: BAR_H, label: 'Kubelet', sublabel: 'waits for the container to start', role: 'cluster' }),
    P.box({ key: 'cmSrc', x: SRC.x(0), y: WL.TOP_Y, w: SRC_W, h: WL.BOX_H, label: 'ConfigMap app-config', sublabel: 'DB_HOST db.prod.svc', role: 'cluster' }),
    P.box({ key: 'podSrc', x: SRC.x(1), y: WL.TOP_Y, w: SRC_W, h: WL.BOX_H, label: 'Pod object', sublabel: 'status.podIP 10.244.1.5', role: 'cluster' }),
    P.box({ key: 'svcSrc', x: SRC.x(2), y: WL.TOP_Y, w: SRC_W, h: WL.BOX_H, label: 'Service web', sublabel: 'clusterIP 10.96.0.42', role: 'cluster' }),
  ],
  reset: {
    keys: ['cmSrc', 'podSrc', 'svcSrc', 'barEl', 'wallL', 'wallR', 'envDb', 'envIp', 'envSvc'],
    pods: ['podGroup'],
  },
};

const UNSET = 'unset', DB = 'db.prod.svc', POD_IP = '10.244.1.5', SVC_IP = '10.96.0.42';
const EMPTY = { envDb: UNSET, envIp: UNSET, envSvc: UNSET };
const FILLED = { envDb: DB, envIp: POD_IP, envSvc: SVC_IP };
// Env strip and Pod always move together.
const below = (live) => ({ envSet: live ? 1 : OPACITY.notready, podGroup: live ? 1 : OPACITY.notready });
const NO_CONTAINER = 'no container yet', RUNNING = 'PID 1 running with the environment';
// Every step states the source sublabel: reset does not restore it.
const CM_LIVE = 'DB_HOST db.prod.svc', CM_EDITED = 'DB_HOST db.staging.svc';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: EMPTY,
    opacity: below(false),
    sublabels: { barEl: 'waits for the container to start', cmSrc: CM_LIVE },
    podSublabels: { podGroup: NO_CONTAINER },
  },
  {
    id: 'declare',
    duration: 3400,
    narration: 'One container gets three variables and each comes from a different kind of place. DB_HOST is a key in a ConfigMap that somebody else owns and edits, MY_POD_IP comes off the Pod object itself through the downward API, and WEB_SERVICE_HOST is never asked for at all: by default the Kubelet adds Service pairs on its own. None of the three is resolved yet.',
    chips: EMPTY,
    wires: { req: 'env, envFrom and valueFrom name only two of the three' },
    opacity: below(false),
    sublabels: { barEl: 'nothing assembled yet', cmSrc: CM_LIVE },
    podSublabels: { podGroup: NO_CONTAINER },
    lit: ['cmSrc', 'podSrc', 'svcSrc'],
  },
  {
    id: 'resolve',
    duration: 3300,
    narration: 'The Kubelet reads the objects the spec named, and it reads them at the moment it launches the container rather than at the moment the Pod was created. DB_HOST takes whatever the key holds at that instant, and a Secret is opened the same way. The Pod IP costs no read at all, because the Kubelet set up the Pod sandbox and already knows its address.',
    chips: EMPTY,
    wires: { req: 'GET ConfigMap app-config · status.podIP needs no read' },
    opacity: below(false),
    sublabels: { barEl: 'reads the ConfigMap, holds the Pod object', cmSrc: CM_LIVE },
    podSublabels: { podGroup: NO_CONTAINER },
    lit: ['cmSrc', 'podSrc'],
    flow: [
      F.route({ points: LEG[0], delay: BEAT.lead, lights: ['barEl'] }),
      F.route({ points: LEG[1], delay: BEAT.lead + 300, lights: ['barEl'] }),
    ],
  },
  {
    id: 'snapshot',
    duration: 3700,
    narration: 'On top of what the spec asked for, and unless enableServiceLinks is false, the Kubelet writes a pair of variables for every Service in this namespace that has a cluster IP right now, WEB_SERVICE_HOST and WEB_SERVICE_PORT for a Service named web. That list is a snapshot, so a Service created one second later is simply absent from this container. DNS is the way out of that ordering trap.',
    chips: EMPTY,
    wires: { req: 'Service web exists now · WEB_SERVICE_HOST and _PORT' },
    opacity: below(false),
    sublabels: { barEl: 'adds a pair per Service with a cluster IP', cmSrc: CM_LIVE },
    podSublabels: { podGroup: NO_CONTAINER },
    lit: ['svcSrc'],
    flow: [
      F.route({ points: LEG[2], delay: BEAT.lead, lights: ['barEl'] }),
    ],
  },
  {
    id: 'handover',
    duration: 3600,
    narration: 'The whole set crosses in one call. CreateContainer carries it, PID 1 starts with the variables already in its environment, and no second call of that kind is ever made for this container. What the downward API can send across has a limit worth knowing: a named label or annotation comes through, but the whole metadata.labels map is available only as a file in a downwardAPI volume.',
    chips: FILLED,
    wires: { req: 'CreateContainer · the set crosses · StartContainer' },
    opacity: below(true),
    sublabels: { barEl: 'the set is out of its hands', cmSrc: CM_LIVE },
    podSublabels: { podGroup: RUNNING },
    lit: ['barEl', 'wallL', 'wallR'],
    flow: [
      F.route({ points: HANDOVER, name: 'create', delay: BEAT.lead }),
      // Down-arrow: the ball lands first, then the Pod blinks.
      F.pulse({ pod: 'podGroup', at: 'create' }),
      F.fade({ target: 'podGroup', from: OPACITY.notready, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
      F.fade({ target: 'envSet', from: OPACITY.notready, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
    ],
  },
  {
    id: 'frozen',
    duration: 3600,
    narration: 'Somebody edits the ConfigMap. The Kubelet sees it, because by default it watches, and the object above the line now says something the copy below the line does not. A mounted volume without subPath would pick the edit up on a later sync and a downwardAPI volume does the same after a resize, but a variable is a copy taken once, and only a restarted container reads it again.',
    // Deliberately not lit and not changed: that they did not move is the point.
    chips: FILLED,
    wires: { req: 'watch · ConfigMap app-config modified' },
    opacity: below(true),
    sublabels: { barEl: 'holds the new value and cannot deliver it', cmSrc: CM_EDITED },
    podSublabels: { podGroup: RUNNING },
    lit: ['cmSrc', 'wallL', 'wallR'],
    flow: [
      // The update dies at the Kubelet: no crossing follows.
      F.route({ points: LEG[0], delay: BEAT.lead, lights: ['barEl'] }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
