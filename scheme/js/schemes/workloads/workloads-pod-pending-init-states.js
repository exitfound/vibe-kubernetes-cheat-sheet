import { P, F, defineCard, ladder, strip, midX, WL, FADE, BEAT, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-pod-pending-init-states.md

// Layout C on the Workloads canon (WL): the Node band sits under the panel and the chips take the
// floor as a strip THREE across, because the strip IS the subject here rather than a readout beside
// it. Both bands are narrowed off the full width and centred on CX, each to the measurement written
// on it. Panel measured at x<=397, y<=255 (worst of 1600/1280/1100).

// The strip is narrowed off LAYOUT.C.strip.three, which would give 350.67, and 340 is the whole
// reduction available. The thesis cell is what binds it: chipfit measures the gap between the name
// and the VALUE PILL, not between the two texts, and at 350.67 that gap is 23.7 against a MIN_GAP
// of 4. So a cell of 330 collides on three steps and 340 leaves 13.
// It is declared first because the actor row and the frame are both measured off it.
const CHIP_GAP = 14, CHIP_VGAP = 8, CHIP_COLS = 3;
const STRIP_W = 1048;                                    // 3 cells of 340 plus 2 gaps of 14
const STRIP_X = WL.CX - STRIP_W / 2;                     // 76..1124, centred on CX
const STRIP_R = STRIP_X + STRIP_W;                       // 1124

// The Node band, lifted off the floor to leave the whole floor to the kubectl row. NODE_H 140 is
// the workloads frame family (daemonset, deployment-rollback, rolling-update carry it).
const NODE_Y = 316, NODE_H = 140;                        // 316..456, 61 clear of the deepest panel
// 820 and not the WL.L-02 full width: 1080 around a 460 Pod left the band 57 percent empty, and
// 820 leaves 44. WL.A-03 requires a narrowed frame to be centred on WL.CX so its top midpoint
// still equals the spine the corridor lands on. 820 rather than less is set by the actor row it
// right-aligns: under 816 the Kubelet crosses the house 60 unit gap from the Scheduler, and the
// content box geometry-soft measures stops balancing on CX. The working is in the record.
const NODE_W = 820, NODE_X = WL.CX - NODE_W / 2;         // 190..1010, 180 either side of the Pod
const NODE_R = NODE_X + NODE_W;                          // 1010

// Both actor boxes take the 232 that workloads-pod-startup-conditions draws its pair at, and its
// arrangement too: the left box centred on CX, the right one right-aligned. Workloads declares no
// box width of its own, so it is a literal here rather than an import past the kit (S-21).
// extents.mjs at 1100x800 reads `holds it while Pending` at 135 and `holds it after that` at
// 116.6, so 232 leaves 97 and 115.4.
const TOP1_W = 232, TOP1_X = WL.CX - TOP1_W / 2;         // 484..716, centred on CX (WL.L-07)
const TOP2_W = 232, TOP2_X = NODE_R - TOP2_W;            // 778..1010, right edge on the frame
const TOP2_CX = TOP2_X + TOP2_W / 2;                     // 894
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);

const POD_W = 460, POD_H = 96, POD_X = WL.CX - POD_W / 2;
const POD_Y = NODE_Y + 22;                               // 338..434
// 44 and not 52: the Pod sublabel is written per step and its ink runs 415.7 to 428.6 (measured),
// so the inner box has to stop at 412 and the Pod floor at 434 clears the text by 5.4.
const CONT_W = 300, CONT_H = 44, CONT_X = WL.CX - CONT_W / 2;
const CONT_Y = POD_Y + 30;                               // 368..412

// The kubectl get pods -o wide row, on the floor, THREE cells across and wrapped onto two rows
// (WL.L-05: two or three, never four). 350.67 is what LAYOUT.C.strip.three names. The reading
// order across then down IS the column order kubectl prints, and the one cell that is NOT a
// kubectl column sits last, off the end of the row.
const CHIPS_Y = 500;                                     // 500..576, 44 under the frame, 48 off the floor
const CHIP_COL = strip({ from: STRIP_X, to: STRIP_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;                               // 340
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: WL.CHIP_H, gap: CHIP_VGAP });
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

// The corridor belongs to the Kubelet and stops on the FRAME top face, never on the Pod inside it
// (WL.A-03). The Scheduler carries no path of its own: it holds the Pod while it is Pending and
// sends it nothing, and a line drawn to a Pod that no Node has been chosen for asserts the
// relationship step 1 exists to deny.
// The jog takes the MIDPOINT of the 120..316 band rather than the house 140, which centres it
// between the actor row and the frame. The path is the same length at any DROP_Y.
const DROP_Y = midX(WL.TOP_BOTTOM, NODE_Y);              // 218
// The corridor is a PAIR, both halves drawn on every step, mirrored by WL.LANE_DY about the two
// face midpoints they touch: 588 and 612 on the frame top face, 882 and 906 on the Kubelet bottom.
// L-12 is what a mirrored pair is, and OFFEDGE reads exactly that, an endpoint alone on its face.
// Offsetting each segment perpendicular to itself keeps both paths 490 units, so the ball takes
// the same routeDur either way and the spans do not move with the direction.
const D = WL.LANE_DY;
const LANE_DOWN = [[TOP2_CX - D, WL.TOP_BOTTOM], [TOP2_CX - D, DROP_Y - D], [WL.SPINE_X - D, DROP_Y - D], [WL.SPINE_X - D, NODE_Y]];
const LANE_UP = [[WL.SPINE_X + D, NODE_Y], [WL.SPINE_X + D, DROP_Y + D], [TOP2_CX + D, DROP_Y + D], [TOP2_CX + D, WL.TOP_BOTTOM]];

export const SCENE = {
  'aria-label': 'Where a Pod stalls before Running: five columns of the kubectl get pods -o wide row are drawn on the floor, and each STATUS value names the component still holding the Pod, from the Scheduler on Pending with no Node to the Kubelet on Init and PodInitializing, while READY stays 0 of 1 through all of them',
  parts: [
    P.defs(),
    // The Kubelet corridor, both directions drawn on every step: the takeover comes down and the
    // report goes up, and which one the ball takes is the step saying which way the traffic ran.
    P.lane({ key: 'laneKubeDown', points: LANE_DOWN, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'laneKubeUp', points: LANE_UP, dim: true, dashed: true, role: 'cluster' }),
    // The two actors never talk to each other, so the top row is a RELATION and carries no ball.
    P.relation({ points: [[TOP1_X + TOP1_W, TOP_CY], [TOP2_X, TOP_CY]], role: 'cluster', dash: '5 5' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
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
      inner: { dx: CONT_X - POD_X, dy: CONT_Y - POD_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'container' },
    }),
    P.box({ key: 'scheduler', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Scheduler', sublabel: 'holds it while Pending', role: 'cluster' }),
    P.box({ key: 'kubelet', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'holds it after that', role: 'cluster' }),
  ],
  reset: {
    keys: ['scheduler', 'kubelet', 'readyChip', 'statusChip', 'restartChip', 'ageChip', 'nodeChip', 'holdChip'],
    pods: ['podGroup'],
  },
};

// READY answers a different question from STATUS, so it reads the same on every step of this card.
// That is the thesis and not an oversight: P-01 states it six times on purpose.
const NOT_READY = '0/1';
const NO_NODE = '<none>';
// The NODE column prints the Node object name, and the frame above the row is labelled Node-1.
const ON_NODE = 'Node-1';
// The column stops counting a regular init container the moment it completes, so the count the
// backoff step shows is gone by PodInitializing (kubectl printPod, printers.go).
const NO_RESTARTS = '0';


export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: {
      readyChip: NOT_READY, statusChip: 'Pending', restartChip: NO_RESTARTS,
      ageChip: '15s', nodeChip: NO_NODE, holdChip: 'nothing yet',
    },
    opacity: { podGroup: OPACITY.notready, nodeEl: OPACITY.notready },
    podSublabels: { podGroup: 'not on a Node yet' },
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
    opacity: { podGroup: OPACITY.notready, nodeEl: OPACITY.notready },
    podSublabels: { podGroup: 'not on a Node yet' },
    // No packet and no Pod act here, so the beat is a static highlight alone (M-27).
    lit: ['scheduler', 'statusChip', 'nodeChip', 'holdChip'],
  },
  {
    id: 'init-running',
    duration: 2800,
    narration: 'A Node is chosen, the Node column fills in, and the Kubelet takes over. STATUS turns into a counter: Init:0/2 means two init containers with none completed, and Init:1/2 means one has. That counter is the only field here that reports progress, because READY cannot move until an app container starts.',
    chips: {
      readyChip: NOT_READY, statusChip: 'Init:0/2', restartChip: NO_RESTARTS,
      ageChip: '50s', nodeChip: ON_NODE, holdChip: 'the Kubelet, running init 1',
    },
    wires: { req: 'Init:N/M · N of M init containers completed' },
    opacity: { podGroup: OPACITY.pending, nodeEl: 1 },
    podSublabels: { podGroup: 'init container 1 of 2 running' },
    lit: ['statusChip', 'nodeChip', 'holdChip'],
    flow: [
      F.route({ points: LANE_DOWN, name: 'take' }),
      F.pulse({ pod: 'podGroup', dim: true, at: 'take' }),
      F.fade({ target: 'podGroup', from: OPACITY.notready, to: OPACITY.pending, dur: FADE.in, at: 'take', fill: 'both', easing: 'ease-out' }),
    ],
  },
  {
    id: 'init-failing',
    duration: 3300,
    narration: 'Init:Error means an init container has failed to execute, and when it keeps failing the same cell reads Init:CrashLoopBackOff. The counter is replaced by the reason, and RESTARTS carries the count and the time of the last one. AGE is the age of the Pod, so an Init: value still on the row at four minutes is a stall.',
    chips: {
      readyChip: NOT_READY, statusChip: 'Init:CrashLoopBackOff', restartChip: '3 (20s ago)',
      ageChip: '4m10s', nodeChip: ON_NODE, holdChip: 'the Kubelet, backoff timer',
    },
    wires: { req: 'init 1 exited non-zero · init 2 has not started' },
    opacity: { podGroup: OPACITY.pending, nodeEl: 1 },
    podSublabels: { podGroup: 'init container 1 keeps exiting 1' },
    lit: ['statusChip', 'restartChip', 'ageChip', 'holdChip'],
    flow: [
      // Up-arrow: the Pod blinks first and the report leaves at BEAT.afterPulse (M-15).
      F.pulse({ pod: 'podGroup', dim: true }),
      F.route({ points: LANE_UP, delay: BEAT.afterPulse, lights: ['kubelet'] }),
    ],
  },
  {
    id: 'initializing',
    duration: 2800,
    narration: 'PodInitializing means the Pod has already finished executing its init containers and the app containers are being created. It is what those containers read until the runtime reports on them, so a Pod that sits here is held by the app image or its mounts and not by anything the init containers did.',
    chips: {
      readyChip: NOT_READY, statusChip: 'PodInitializing', restartChip: NO_RESTARTS,
      ageChip: '4m40s', nodeChip: ON_NODE, holdChip: 'the Kubelet, app containers',
    },
    // The caption and not the narration: the panel is a character budget on this card (L-08) and
    // the head room over the frame is 61.34 units, so the mechanism goes where it costs nothing.
    wires: { req: 'regular init containers done · RESTARTS drops their count' },
    opacity: { podGroup: OPACITY.pending, nodeEl: 1 },
    podSublabels: { podGroup: 'app container being created' },
    lit: ['statusChip', 'restartChip', 'holdChip'],
    flow: [
      F.route({ points: LANE_DOWN, name: 'create' }),
      F.pulse({ pod: 'podGroup', dim: true, at: 'create' }),
    ],
  },
  {
    id: 'running-not-ready',
    duration: 3200,
    narration: 'Running ends the STATUS column and starts the confusion, because READY has read 0/1 at every value before it. STATUS answers whether the containers exist and have started, READY answers whether they are serving, and the gap between them is the readiness half of the condition ladder. Running here is the Pod phase, which never reports readiness.',
    chips: {
      readyChip: NOT_READY, statusChip: 'Running', restartChip: NO_RESTARTS,
      ageChip: '5m10s', nodeChip: ON_NODE, holdChip: 'the app, readiness is next',
    },
    wires: { req: 'Running · STATUS is done, READY is not' },
    opacity: { podGroup: 1, nodeEl: 1 },
    podSublabels: { podGroup: 'started, not ready' },
    lit: ['statusChip', 'readyChip', 'holdChip'],
    flow: [
      F.route({ points: LANE_DOWN, name: 'start' }),
      // NOT dim: pulsePodDim fills opacity forward to OPACITY.pending and this step ends at full.
      F.pulse({ pod: 'podGroup', at: 'start' }),
      F.fade({ target: 'podGroup', from: OPACITY.pending, to: 1, dur: FADE.in, at: 'start', fill: 'both', easing: 'ease-out' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
