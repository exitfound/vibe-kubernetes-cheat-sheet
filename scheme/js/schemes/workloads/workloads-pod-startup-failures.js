import { P, F, defineCard, ladder, laneY, midX, WL, LAYOUT, FADE, BEAT, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS.md#workloads-pod-startup-failures

// Layout B on the Workloads canon (WL): chips left, ladder right, Node frame full width on the
// floor. Panel measured at x<=397, y<=255 (worst of 1600/1280/1100).
const PANEL_B = 255;

// Scheduler is centred on CX (WL.L-07) because the shared drop leaves its bottom midpoint.
const TOP1_X = 420, TOP1_W = 2 * (WL.CX - 420);          // 420..780, centred on CX
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = WL.R - TOP2_X;   // 840..1140
const TOP2_CX = TOP2_X + TOP2_W / 2;                     // 990
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);

const CHIP_GAP = 8;
const CHIP_X = LAYOUT.B.chips.x, CHIP_W = LAYOUT.B.chips.w;    // 60..540
const CHIP_Y = ladder({ y: PANEL_B + 20, rowH: WL.CHIP_H, gap: CHIP_GAP });   // 275..435
const LAD_X = LAYOUT.B.ladder.x, LAD_W = LAYOUT.B.ladder.w;    // 660..1140
const LAD_Y = 150;                                       // 5 rows -> 150..350

const NODE_Y = 496, NODE_H = 128;                        // 496..624
const POD_W = 460, POD_H = 96, POD_X = WL.CX - POD_W / 2;
const POD_Y = NODE_Y + 22;                               // 518..614
// 44 and not 52: the Pod sublabel is written per step and its ink reaches about 595.
const CONT_W = 300, CONT_H = 44, CONT_X = WL.CX - CONT_W / 2;
const CONT_Y = POD_Y + 30;                               // 548..592

// A-10: two actors reach ONE slot, so both lanes are drawn over a shared drop rather than one of
// them being picked. The drop runs at WL.SPINE_X from the jog line down to the Pod top midpoint.
const DROP_Y = WL.TOP_BOTTOM + 20;                       // 140, under the boxes, over the ladder
const LANE_SCHED = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, POD_Y]];
const LANE_KUBE = [[TOP2_CX, WL.TOP_BOTTOM], [TOP2_CX, DROP_Y], [WL.SPINE_X, DROP_Y], [WL.SPINE_X, POD_Y]];
const LANE_KUBE_UP = [...LANE_KUBE].reverse();

export const SCENE = {
  'aria-label': 'Where a Pod stalls before Running: each STATUS value names the component still holding the Pod, from the Scheduler on Pending to the Kubelet on Init and PodInitializing, while READY stays 0 of 1 through all of them',
  parts: [
    P.defs(),
    // A RELATIONSHIP and not a lane: the Scheduler holds the Pod while it is Pending and sends it
    // nothing, so nothing can ride this and it carries no arrowhead (A-05, A-20 wants both keys).
    P.relation({ key: 'laneSched', points: LANE_SCHED, role: 'cluster', dash: '5 5' }),
    P.lane({ key: 'laneKube', points: LANE_KUBE, dim: true, dashed: true, role: 'cluster' }),
    // The two actors never talk to each other, so the top row is a RELATION and carries no ball.
    P.relation({ points: [[TOP1_X + TOP1_W, TOP_CY], [TOP2_X, TOP_CY]], role: 'cluster', dash: '5 5' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    P.chip({ key: 'statusChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'STATUS', value: 'Pending' }),
    P.chip({ key: 'readyChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'READY', value: '0/1' }),
    P.chip({ key: 'restartChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'RESTARTS', value: '0' }),
    P.chip({ key: 'holdChip', x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'who is holding it', value: 'nothing has looked at it' }),
    P.packets(),
    P.chain({
      key: 'chain', x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP, role: 'cluster',
      items: [
        '1. Pending               ·  no Node has been chosen',
        '2. Init:0/2              ·  first init container running',
        '3. Init:CrashLoopBackOff ·  an init container keeps failing',
        '4. PodInitializing       ·  init done, app containers starting',
        '5. Running               ·  started, and READY still says 0/1',
      ],
    }),
    P.node({ key: 'nodeEl', x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' }),
    P.pod({
      key: 'podGroup', id: 'podGroup',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'unscheduled', containers: 0,
      inner: { dx: CONT_X - POD_X, dy: CONT_Y - POD_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'container' },
    }),
    P.box({ key: 'scheduler', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Scheduler', sublabel: 'holds it while Pending', role: 'cluster' }),
    P.box({ key: 'kubelet', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'holds it after that', role: 'cluster' }),
  ],
  reset: {
    keys: ['scheduler', 'kubelet', 'statusChip', 'readyChip', 'restartChip', 'holdChip'],
    pods: ['podGroup'],
  },
};

const NOT_READY = '0/1';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { statusChip: 'Pending', readyChip: NOT_READY, restartChip: '0', holdChip: 'nothing has looked at it' },
    opacity: { podGroup: OPACITY.notready },
    podSublabels: { podGroup: 'unscheduled' },
    chain: -1,
  },
  {
    id: 'pending',
    duration: 2600,
    narration: 'Pending means the Pod has not begun executing init containers, and the commonest reason is that no Node has been chosen for it. Nothing on any Node is wrong yet, so reading Kubelet logs here finds nothing at all: the component still holding the Pod is the Scheduler, and kubectl describe pod prints its reason under Events.',
    chips: { statusChip: 'Pending', readyChip: NOT_READY, restartChip: '0', holdChip: 'the Scheduler, no Node fits' },
    wires: { req: 'STATUS names the component, not the symptom' },
    opacity: { podGroup: OPACITY.notready },
    podSublabels: { podGroup: 'unscheduled' },
    // No packet and no Pod act here, so the beat is a static highlight alone (M-27).
    lit: ['scheduler', 'statusChip', 'holdChip'],
    chain: 0,
  },
  {
    id: 'init-running',
    duration: 2800,
    narration: 'Once a Node is chosen the Kubelet takes over and the STATUS turns into a counter. Init:0/2 means this Pod has two init containers and none has completed, Init:1/2 means one has. That number moving is the only proof anything is progressing, because READY cannot move until every app container is ready.',
    chips: { statusChip: 'Init:0/2', readyChip: NOT_READY, restartChip: '0', holdChip: 'the Kubelet, init container 1' },
    wires: { req: 'Init:N/M · N of M init containers completed' },
    opacity: { podGroup: OPACITY.pending },
    podSublabels: { podGroup: 'init container 1 of 2 running' },
    lit: ['statusChip', 'holdChip'],
    chain: 1,
    flow: [
      F.route({ points: LANE_KUBE, name: 'take' }),
      F.pulse({ pod: 'podGroup', dim: true, at: 'take' }),
      F.fade({ target: 'podGroup', from: OPACITY.notready, to: OPACITY.pending, dur: FADE.in, at: 'take', fill: 'both', easing: 'ease-out' }),
    ],
  },
  {
    id: 'init-failing',
    duration: 3300,
    narration: 'Init:Error means an init container has failed to execute, and Init:CrashLoopBackOff means it has failed repeatedly. The counter stops where it is, RESTARTS climbs, and the Pod waits out the same exponential backoff a crashing app container would. Nothing later in the sequence has been attempted, so the app image may not even have been pulled.',
    chips: { statusChip: 'Init:CrashLoopBackOff', readyChip: NOT_READY, restartChip: '3', holdChip: 'the Kubelet, backoff timer' },
    wires: { req: 'init container exited non-zero · restarting' },
    opacity: { podGroup: OPACITY.pending },
    podSublabels: { podGroup: 'init container 1 keeps exiting 1' },
    lit: ['statusChip', 'restartChip', 'holdChip'],
    chain: 2,
    flow: [
      // Up-arrow: the Pod blinks first and the report leaves at BEAT.afterPulse (M-15).
      F.pulse({ pod: 'podGroup', dim: true }),
      F.route({ points: LANE_KUBE_UP, delay: BEAT.afterPulse, lights: ['kubelet'] }),
    ],
  },
  {
    id: 'initializing',
    duration: 2800,
    narration: 'PodInitializing means the Pod has already finished executing its init containers and the app containers are being created. On a healthy Pod it is the shortest lived value on this list, and a Pod that sits in it is usually waiting on the app image rather than on anything the init containers did.',
    chips: { statusChip: 'PodInitializing', readyChip: NOT_READY, restartChip: '3', holdChip: 'the Kubelet, creating containers' },
    wires: { req: 'init containers done · creating app containers' },
    opacity: { podGroup: OPACITY.pending },
    podSublabels: { podGroup: 'app container being created' },
    lit: ['statusChip', 'holdChip'],
    chain: 3,
    flow: [
      F.route({ points: LANE_KUBE, name: 'create' }),
      F.pulse({ pod: 'podGroup', dim: true, at: 'create' }),
    ],
  },
  {
    id: 'running-not-ready',
    duration: 3200,
    narration: 'Running is where this list ends and where the confusion starts, because READY still reads 0/1. The STATUS column answers whether the containers exist and have started, the READY column answers whether they are serving, and everything between those two answers is the readiness half of the condition ladder. No value in the STATUS column reports it.',
    chips: { statusChip: 'Running', readyChip: NOT_READY, restartChip: '3', holdChip: 'nobody, readiness is next' },
    wires: { req: 'Running · STATUS is done, READY is not' },
    opacity: { podGroup: 1 },
    podSublabels: { podGroup: 'started, not ready' },
    lit: ['statusChip', 'readyChip', 'holdChip'],
    chain: 4,
    flow: [
      F.route({ points: LANE_KUBE, name: 'start' }),
      // NOT dim: pulsePodDim fills opacity forward to OPACITY.pending and this step ends at full.
      F.pulse({ pod: 'podGroup', at: 'start' }),
      F.fade({ target: 'podGroup', from: OPACITY.pending, to: 1, dur: FADE.in, at: 'start', fill: 'both', easing: 'ease-out' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
