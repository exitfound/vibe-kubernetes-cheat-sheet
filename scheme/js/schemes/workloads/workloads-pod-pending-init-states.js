import { P, F, defineCard, ladder, strip, midX, WL, FADE, BEAT, OPACITY } from './workloads-kit.js';
import { box } from '../../lib/primitives.js';

// Design notes for this card: ./CARDS/workloads-pod-pending-init-states.md

// Layout C (WL): the Node band under the panel, the chips a strip three across on the floor
// because the strip is the subject. The panel bound is measured for the longest narration here.

// The strip is narrowed to the width the thesis cell needs (chipfit), declared first because the
// actor row and the frame are measured off it.
const CHIP_GAP = 14, CHIP_VGAP = 8, CHIP_COLS = 3;
const STRIP_W = 1048;
const STRIP_X = WL.CX - STRIP_W / 2;
const STRIP_R = STRIP_X + STRIP_W;

// The Node band is lifted off the floor to leave the floor to the kubectl row.
const NODE_Y = 316, NODE_H = 142;
// Narrowed frame, centred on WL.CX so its top midpoint stays on the spine (WL.A-03).
const NODE_W = 820, NODE_X = WL.CX - NODE_W / 2;
const NODE_R = NODE_X + NODE_W;

// The 232 pair of workloads-pod-startup-conditions, a literal because Workloads declares no box width (S-21).
const TOP1_W = 232, TOP1_X = WL.CX - TOP1_W / 2;
const TOP2_W = 232, TOP2_X = NODE_R - TOP2_W;
const TOP2_CX = TOP2_X + TOP2_W / 2;
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);

const POD_W = 460, POD_H = 96, POD_X = WL.CX - POD_W / 2;
const POD_Y = NODE_Y + 34;
// CONT_H 44 keeps the per-step Pod sublabel clear of the boxes. Three boxes because STATUS counts
// init containers, so each step shows which one the Kubelet is on.
const C_PAD = 10, C_GAP = 12, CONT_H = 44;
const CONT = strip({ from: POD_X + C_PAD, to: POD_X + POD_W - C_PAD, count: 3, gap: C_GAP });
const CONT_Y = POD_Y + 30;

// The kubectl row, three cells across on two rows (WL.L-05), read in kubectl column order, with
// the one cell that is not a kubectl column last.
const CHIPS_Y = 500;
const CHIP_COL = strip({ from: STRIP_X, to: STRIP_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: WL.CHIP_H, gap: CHIP_VGAP });
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

// The Kubelet corridor stops on the frame, never the Pod (WL.A-03). The Scheduler has no path: a
// line to an unbound Pod would assert what step 1 denies. A mirrored pair (L-12), offset so both
// paths are the same length and take the same routeDur.
const DROP_Y = midX(WL.TOP_BOTTOM, NODE_Y);
const D = WL.LANE_DY;
const LANE_DOWN = [[TOP2_CX - D, WL.TOP_BOTTOM], [TOP2_CX - D, DROP_Y - D], [WL.SPINE_X - D, DROP_Y - D], [WL.SPINE_X - D, NODE_Y]];
const LANE_UP = [[WL.SPINE_X + D, NODE_Y], [WL.SPINE_X + D, DROP_Y + D], [TOP2_CX + D, DROP_Y + D], [TOP2_CX + D, WL.TOP_BOTTOM]];

export const SCENE = {
  'aria-label': 'Where a Pod stalls before Running: five columns of the kubectl get pods -o wide row are drawn on the floor, and each STATUS value names the component still holding the Pod, from the Scheduler on Pending with no Node to the Kubelet on Init and PodInitializing, while READY stays 0 of 1 through all of them',
  parts: [
    P.defs(),
    // Both directions drawn on every step, the ball says which way the traffic ran.
    P.lane({ key: 'laneKubeDown', points: LANE_DOWN, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'laneKubeUp', points: LANE_UP, dim: true, dashed: true, role: 'cluster' }),
    // The two actors never talk, so the top row is a relation and carries no ball.
    P.relation({ points: [[TOP1_X + TOP1_W, TOP_CY], [TOP2_X, TOP_CY]], role: 'cluster', dash: '5 5' }),
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    P.chip({ key: 'readyChip', x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'READY', value: '0/1' }),
    P.chip({ key: 'statusChip', x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'STATUS', value: 'Pending' }),
    P.chip({ key: 'restartChip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'RESTARTS', value: '0' }),
    P.chip({ key: 'ageChip', x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'AGE', value: '15s' }),
    P.chip({ key: 'nodeChip', x: CHIP_X(4), y: CHIP_Y(4), w: CHIP_W, h: WL.CHIP_H, name: 'NODE', value: '<none>' }),
    P.chip({ key: 'holdChip', x: CHIP_X(5), y: CHIP_Y(5), w: CHIP_W, h: WL.CHIP_H, name: 'who is holding it', value: 'nothing yet' }),
    P.packets(),
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.pod({
      key: 'podGroup', id: 'podGroup',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'not on a Node yet', containers: 0,
      // Three peers inside the shell so pulsePod reaches them. box() defaults its role to '' so the kit role is passed by hand.
      tune: (el, refs) => {
        refs.initA  = box({ x: CONT.x(0), y: CONT_Y, w: CONT.w, h: CONT_H, label: 'init-1', sublabel: 'init container', role: 'workloads' });
        refs.initB  = box({ x: CONT.x(1), y: CONT_Y, w: CONT.w, h: CONT_H, label: 'init-2', sublabel: 'init container', role: 'workloads' });
        refs.appBox = box({ x: CONT.x(2), y: CONT_Y, w: CONT.w, h: CONT_H, label: 'app',    sublabel: 'app container',  role: 'workloads' });
        for (const k of ['initA', 'initB', 'appBox']) el.appendChild(refs[k]);
      },
    }),
    P.box({ key: 'scheduler', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Scheduler', sublabel: 'holds it until bound', role: 'cluster' }),
    P.box({ key: 'kubelet', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'holds it after that', role: 'cluster' }),
  ],
  reset: {
    keys: ['scheduler', 'kubelet', 'initA', 'initB', 'appBox', 'readyChip', 'statusChip', 'restartChip', 'ageChip', 'nodeChip', 'holdChip'],
    pods: ['podGroup'],
  },
};

// READY reads the same on every step: that is the thesis (P-01).
const NOT_READY = '0/1';
const NO_NODE = '<none>';
const ON_NODE = 'Node-1';
// The column drops a completed regular init container's restarts, so the backoff count is gone by PodInitializing.
const NO_RESTARTS = '0';

// Sublabels are the container state in kubectl words: every not-yet-started container reads
// PodInitializing while the Pod has init containers (kubelet_pods.go).
const NO_STATUS = 'no status yet', WAITING = 'PodInitializing', DONE = 'Completed';
const crew = (a, b, app) => ({ initA: a, initB: b, appBox: app });
// The corridor takes the shade of the Node it lands on (A-13): dim while NODE reads <none>.
const corridor = (bound) => ({ laneKubeDown: bound ? 1 : OPACITY.notready, laneKubeUp: bound ? 1 : OPACITY.notready });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: {
      readyChip: NOT_READY, statusChip: 'Pending', restartChip: NO_RESTARTS,
      ageChip: '15s', nodeChip: NO_NODE, holdChip: 'the Scheduler, no Node fits',
    },
    opacity: { podGroup: OPACITY.notready, nodeEl: OPACITY.notready, ...corridor(false) },
    podSublabels: { podGroup: 'not on a Node yet' },
    sublabels: crew(NO_STATUS, NO_STATUS, NO_STATUS),
  },
  {
    id: 'pending',
    duration: 2600,
    narration: 'Pending means the Pod has not begun executing its init containers, and the Node column says why: no Node has been chosen yet, so no Kubelet has seen this Pod and reading Kubelet logs finds nothing about it. The component still holding the Pod is the Scheduler, and kubectl describe pod prints its reason under Events.',
    chips: {
      readyChip: NOT_READY, statusChip: 'Pending', restartChip: NO_RESTARTS,
      ageChip: '15s', nodeChip: NO_NODE, holdChip: 'the Scheduler, no Node fits',
    },
    wires: { req: 'STATUS names the component, not the symptom' },
    opacity: { podGroup: OPACITY.notready, nodeEl: OPACITY.notready, ...corridor(false) },
    podSublabels: { podGroup: 'not on a Node yet' },
    sublabels: crew(NO_STATUS, NO_STATUS, NO_STATUS),
    // No packet and no Pod act here, so a static highlight alone (M-27).
    lit: ['scheduler', 'statusChip', 'nodeChip', 'holdChip'],
  },
  {
    id: 'init-running',
    duration: 2800,
    narration: 'A Node is chosen, the Node column fills in, and the Kubelet takes over. STATUS turns into a counter: Init:0/2 means two init containers with none completed, and Init:1/2 means one has. That counter is the only column here that tracks init progress, because without a sidecar READY cannot move until an app container starts.',
    chips: {
      readyChip: NOT_READY, statusChip: 'Init:0/2', restartChip: NO_RESTARTS,
      ageChip: '50s', nodeChip: ON_NODE, holdChip: 'the Kubelet, running init 1',
    },
    wires: { req: 'Init:N/M · N of M init containers completed' },
    opacity: { podGroup: OPACITY.pending, nodeEl: 1, ...corridor(true) },
    podSublabels: { podGroup: 'init container 1 of 2 running' },
    sublabels: crew('Running', WAITING, WAITING),
    lit: ['kubelet', 'statusChip', 'nodeChip', 'holdChip'],
    // The readings land with the Kubelet ball (A-06), NODE is the bind and true at entry.
    rewind: {
      chips: { statusChip: 'Pending', holdChip: 'the Kubelet, init 1 next' },
      podSublabels: { podGroup: '' }, sublabels: crew(NO_STATUS, NO_STATUS, NO_STATUS),
    },
    flow: [
      F.route({ points: LANE_DOWN, name: 'take', lights: ['initA'] }),
      F.set({
        at: 'take', chips: { statusChip: 'Init:0/2', holdChip: 'the Kubelet, running init 1' },
        podSublabels: { podGroup: 'init container 1 of 2 running' }, sublabels: crew('Running', WAITING, WAITING),
      }),
    // Not dim: the fade owns the Pod opacity from entry, so a dim lift under it never renders.
      F.pulse({ pod: 'podGroup', at: 'take' }),
      F.fade({ target: 'podGroup', from: OPACITY.notready, to: OPACITY.pending, dur: FADE.in, at: 'take', fill: 'both', easing: 'ease-out' }),
    ],
  },
  {
    id: 'init-failing',
    duration: 3300,
    narration: 'Init:Error means an init container has failed to execute, and when it keeps failing the same cell reads Init:CrashLoopBackOff. The counter is replaced by the reason, and RESTARTS carries the count and the time of the last one. AGE is the age of the Pod, so an Init: value still on the row at four minutes is likely a stall.',
    chips: {
      readyChip: NOT_READY, statusChip: 'Init:CrashLoopBackOff', restartChip: '3 (20s ago)',
      ageChip: '4m10s', nodeChip: ON_NODE, holdChip: 'the Kubelet, backoff timer',
    },
    wires: { req: 'init 1 exited non-zero · init 2 has not started' },
    opacity: { podGroup: OPACITY.pending, nodeEl: 1, ...corridor(true) },
    podSublabels: { podGroup: 'init container 1 keeps exiting 1' },
    sublabels: crew('CrashLoopBackOff', WAITING, WAITING),
    lit: ['statusChip', 'restartChip', 'ageChip', 'holdChip', 'initA'],
    flow: [
    // Up-arrow: the Pod blinks first, the report leaves at BEAT.afterPulse (M-15).
      F.pulse({ pod: 'podGroup', dim: true }),
      F.route({ points: LANE_UP, delay: BEAT.afterPulse, lights: ['kubelet'] }),
    ],
  },
  {
    id: 'initializing',
    duration: 2800,
    narration: 'PodInitializing means the Pod has already finished executing its init containers and the app containers are being created. It is what those containers read until the runtime reports on them, so a Pod that sits here is held by the app image or the runtime and not by anything the init containers did.',
    chips: {
      readyChip: NOT_READY, statusChip: 'PodInitializing', restartChip: NO_RESTARTS,
      ageChip: '4m40s', nodeChip: ON_NODE, holdChip: 'the Kubelet, app containers',
    },
    // The mechanism goes in the caption: the panel is a character budget here (L-08).
    wires: { req: 'regular init containers done · RESTARTS drops their count' },
    opacity: { podGroup: OPACITY.pending, nodeEl: 1, ...corridor(true) },
    podSublabels: { podGroup: 'app container being created' },
    sublabels: crew(DONE, DONE, WAITING),
    lit: ['kubelet', 'statusChip', 'restartChip', 'holdChip'],
    rewind: {
      chips: { statusChip: 'Init:CrashLoopBackOff', restartChip: '3 (20s ago)', holdChip: 'the Kubelet, backoff timer' },
      podSublabels: { podGroup: 'init container 1 keeps exiting 1' },
      sublabels: crew('CrashLoopBackOff', WAITING, WAITING),
    },
    flow: [
      F.route({ points: LANE_DOWN, name: 'create', lights: ['appBox'] }),
      F.set({
        at: 'create',
        chips: { statusChip: 'PodInitializing', restartChip: NO_RESTARTS, holdChip: 'the Kubelet, app containers' },
        podSublabels: { podGroup: 'app container being created' },
        sublabels: crew(DONE, DONE, WAITING),
      }),
      F.pulse({ pod: 'podGroup', dim: true, at: 'create' }),
    ],
  },
  {
    id: 'running-not-ready',
    duration: 3200,
    narration: 'Running ends the STATUS column and starts the confusion, because READY has read 0/1 at every value before it. STATUS answers whether the containers exist and are running, READY answers whether they are serving, and the gap between them is the readiness half of the condition ladder. Running here is the Pod phase, which never reports readiness.',
    chips: {
      readyChip: NOT_READY, statusChip: 'Running', restartChip: NO_RESTARTS,
      ageChip: '5m10s', nodeChip: ON_NODE, holdChip: 'the app, readiness is next',
    },
    wires: { req: 'Running · STATUS is done, READY is not' },
    opacity: { podGroup: 1, nodeEl: 1, ...corridor(true) },
    podSublabels: { podGroup: 'started, not ready' },
    sublabels: crew(DONE, DONE, 'Running'),
    lit: ['kubelet', 'statusChip', 'readyChip', 'holdChip'],
    // The app box receives this step, so its cue and readings land with the ball (A-06), held back by rewind.
    rewind: {
      chips: { statusChip: 'PodInitializing', holdChip: 'the Kubelet, app containers' },
      podSublabels: { podGroup: 'app container being created' },
      sublabels: { appBox: WAITING },
    },
    flow: [
      F.route({ points: LANE_DOWN, name: 'start', lights: ['appBox'] }),
      F.set({
        at: 'start',
        chips: { statusChip: 'Running', holdChip: 'the app, readiness is next' },
        podSublabels: { podGroup: 'started, not ready' },
        sublabels: { appBox: 'Running' },
      }),
    // Not dim: pulsePodDim fills forward to OPACITY.pending and this step ends at full.
      F.pulse({ pod: 'podGroup', at: 'start' }),
      F.fade({ target: 'podGroup', from: OPACITY.pending, to: 1, dur: FADE.in, at: 'start', fill: 'both', easing: 'ease-out' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
