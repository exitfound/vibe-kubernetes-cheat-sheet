import { P, F, defineCard, ladder, WL, LAYOUT, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS.md#workloads-pod-phase-machine

// Layout C, the TIGHTEST card in the catalog: panel 397 x 504, three quarters of the canvas height,
// so only the phase chip and the Node frame fit below it. Re-measure after any prose edit.
const PANEL_R = 420;

const TOP_W = 280, TOP_X = PANEL_R;                      // 420..700

const CHIPCOL_X = 740, CHIPCOL_W = WL.R - CHIPCOL_X;     // 400, 740..1140
const CHIPCOL_VGAP = 10;
const CHIPCOL_Y = ladder({ y: WL.TOP_Y, rowH: WL.CHIP_H, gap: CHIPCOL_VGAP });  // 40 / 84 / 128

// LAYOUT.C of the kit: the ladder takes the RIGHT column, because C has no free column at all.
const LAD_X = LAYOUT.C.ladder.x, LAD_W = LAYOUT.C.ladder.w;    // 660..1140, the pipeline
const LAD_Y = 236;                                       // 6 rows -> 236..478

// status.phase takes the left column of the band below the panel, so the chip strip still
// straddles CX and the lane down to the Pod has a clear corridor at x = SPINE_X.
const STRIP_X = WL.COL_L.x, STRIP_W = WL.COL_L.w;        // 60..540
const STRIP_Y = 506;

const NODE_Y = 546, NODE_H = 78;                         // 546..624
const POD_W = 460, POD_X = WL.CX - POD_W / 2;            // 370..830
const POD_Y = 552, POD_H = 64;                           // 552..616
const CONT_W = 300, CONT_X = WL.CX - CONT_W / 2;         // 450..750
const CONT_Y = 574, CONT_H = 36;                         // 574..610

// The sync lane runs down the corridor between the status.phase chip and the pipeline, and ends
// on the Pod it addresses rather than on the Node frame edge above it.
const SPINE_X = TOP_X + TOP_W / 2;                       // 560
const SPINE = [[SPINE_X, WL.TOP_BOTTOM], [SPINE_X, POD_Y]];

// Z-order: the Node frame is a 70% opaque fill, so the lane leg inside it and the ball riding it
// follow it, and ladder / Pod / Kubelet sit above the packets.
export const SCENE = {
  'aria-label': 'Pod lifecycle phases: Kubelet reconciles status.phase through Pending, Running and a terminal Succeeded or Failed, with CrashLoopBackOff sitting inside Running as a container waiting reason',
  parts: [
    P.defs(),
    // Wire label sits ABOVE the Kubelet box: below it the spine runs through the same point and
    // would split the string in two.
    P.wire({ key: 'req', x: SPINE_X, y: WL.TOP_Y - 12 }),
    P.chip({ key: 'phaseChip', x: STRIP_X, y: STRIP_Y, w: STRIP_W, h: WL.CHIP_H, name: 'status.phase', value: 'Pending' }),
    P.chip({ key: 'cStateChip', x: CHIPCOL_X, y: CHIPCOL_Y(0), w: CHIPCOL_W, h: WL.CHIP_H, name: 'container state', value: 'none' }),
    P.chip({ key: 'restartChip', x: CHIPCOL_X, y: CHIPCOL_Y(1), w: CHIPCOL_W, h: WL.CHIP_H, name: 'restartCount', value: '0' }),
    P.chip({ key: 'policyChip', x: CHIPCOL_X, y: CHIPCOL_Y(2), w: CHIPCOL_W, h: WL.CHIP_H, name: 'restartPolicy', value: 'OnFailure' }),
    P.node({ key: 'nodeEl', x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' }),
    // Kubelet -> the Pod on Node-1, straight down the corridor. Appended after the Node frame,
    // whose fill would otherwise hide its last leg.
    P.lane({ key: 'connector', points: SPINE, dim: true, dashed: true, role: 'cluster' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.chain({
      key: 'chain', x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP, role: 'cluster',
      items: [
        '1. admit     ·  stored in etcd, no node yet',
        '2. schedule  ·  bound to node, sandbox + image pull',
        '3. start     ·  at least one container started',
        '4. crashloop ·  exit + backoff, waiting reason inside Running',
        '5. recover   ·  restart succeeds, container Running again',
        '6. terminal  ·  all containers exit, Succeeded or Failed',
      ],
    }),
    // Shell and container share one wrapper group so opacity animates uniformly.
    P.pod({
      key: 'podGroup', id: 'podGroup', shellKey: 'shellEl', innerKey: 'containerBox',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      opacity: OPACITY.pending,
      inner: { dx: CONT_X - POD_X, dy: CONT_Y - POD_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'no container yet' },
    }),
    P.box({ key: 'kubelet', x: TOP_X, y: WL.TOP_Y, w: TOP_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'reconciles status.phase', role: 'cluster' }),
  ],
  reset: {
    keys: ['kubelet', 'phaseChip', 'cStateChip', 'restartChip', 'policyChip', 'shellEl', 'containerBox'],
    pods: ['podGroup'],
  },
};

// The four status chips as FIELDS, in one place with the policy default, so no step can move the
// phase and leave the container state carrying the previous step's value.
const phaseState = (phase, cstate, restart, policy = 'OnFailure') => ({
  phaseChip: phase, cStateChip: cstate, restartChip: restart, policyChip: policy,
});

// The Pod, the Node frame around it and the lane into it are pinned in ONE place (A-16). The lane
// ENDS on the Pod, so it is only as present as the Pod is (A-13); only `admit` is unplaced.
const stage = (podGroup, placed = true) => ({
  podGroup, nodeEl: placed ? 1 : OPACITY.pending, connector: podGroup,
});

const PHASE_FADE_MS = 700, PHASE_FADE_DELAY = 400;

// A phase move re-shades the Pod AND the lane into it, one event, stated once. `fill: both` holds
// both at `from` through the delay, which is what keeps the lane lit under its riding ball (A-15).
const phaseFade = (from, to, delay = PHASE_FADE_DELAY) => {
  const easing = to > from ? 'ease-out' : 'ease-in';
  return ['podGroup', 'connector'].map(target =>
    F.fade({ target, from, to, dur: PHASE_FADE_MS, delay, fill: 'both', easing }));
};

export const STEPS_SPEC = [
  {
    id: 'admit',
    duration: 1500,
    chips: phaseState('Pending', 'none', '0'),
    sublabels: { containerBox: 'no node yet · no container' },
    wires: { req: 'spec.nodeName not set · Waiting for scheduler' },
    opacity: stage(OPACITY.pending, false),
    chain: 0,
  },
  {
    id: 'schedule',
    duration: 2000,
    narration: 'The Scheduler has bound the Pod to Node-1, so spec.nodeName is set and Kubelet picks the Pod up via its watch. Kubelet pulls images, creates the Pod sandbox and the container is in Waiting with reason ContainerCreating. The status.phase field stays Pending while any container is still waiting.',
    chips: phaseState('Pending', 'Waiting · ContainerCreating', '0'),
    sublabels: { containerBox: 'Waiting · ContainerCreating' },
    wires: { req: 'spec.nodeName=Node-1 · SyncPod · Image pull + sandbox' },
    opacity: stage(OPACITY.pending),
    lit: ['kubelet', 'phaseChip', 'cStateChip'],
    chain: 1,
    flow: [
      F.route({ points: SPINE, fadeIn: true }),
    ],
  },
  {
    id: 'running',
    duration: 2300,
    narration: 'Every container has been created and at least one has started, so status.phase becomes Running. Each container reports a Running state, and the Pod does its work until its containers exit. The Running phase covers the entire working life of the Pod.',
    chips: phaseState('Running', 'Running', '0'),
    sublabels: { containerBox: 'Running · serving' },
    wires: { req: 'StartContainer OK · Phase Pending → Running' },
    opacity: stage(1),
    lit: ['kubelet', 'phaseChip', 'cStateChip'],
    chain: 2,
    flow: [
      F.route({ points: SPINE, fadeIn: true, name: 'sync' }),
      // The phase cross-fade hangs off the step, not off the ball: it is the state machine moving,
      // and the Pod blinks when the sync that moved it lands.
      ...phaseFade(OPACITY.pending, OPACITY.running),
      F.pulse({ pod: 'podGroup', at: 'sync' }),
    ],
  },
  {
    id: 'crashloop',
    duration: 2400,
    narration: 'The container exits with a non-zero code. With restartPolicy OnFailure Kubelet restarts it inside the same sandbox, but repeated fast failures trigger an exponential backoff: the delay starts at 10s and doubles on each subsequent restart (10s, 20s, 40s, 80s, 160s, capped at 300s by default). The container sits in Waiting with reason=CrashLoopBackOff while the timer ticks. The status.phase field stays Running the whole time, because CrashLoopBackOff is a container-level waiting reason, never a phase of its own.',
    chips: phaseState('Running', 'Waiting · CrashLoopBackOff', '4'),
    sublabels: { containerBox: 'CrashLoopBackOff' },
    wires: { req: 'exit != 0 · CrashLoopBackOff · Phase stays Running' },
    opacity: stage(OPACITY.notready),
    lit: ['kubelet', 'cStateChip', 'restartChip'],
    chain: 3,
    flow: [
      F.route({ points: SPINE, fadeIn: true }),
      // The crash dims the Pod from the start of the step: no delay, unlike the recoveries.
      ...phaseFade(OPACITY.running, OPACITY.notready, 0),
    ],
  },
  {
    id: 'recover',
    duration: 2300,
    narration: 'The backoff timer elapses and Kubelet retries the container. This time it starts cleanly and runs to its next reconcile, so the container state returns to Running and restartCount records how many times the container was restarted. The status.phase field was Running through the whole episode, only the container-level state moved.',
    chips: phaseState('Running', 'Running', '5'),
    sublabels: { containerBox: 'Running · restarted' },
    wires: { req: 'backoff elapsed · StartContainer · restartCount++' },
    opacity: stage(1),
    lit: ['kubelet', 'cStateChip', 'restartChip'],
    chain: 4,
    flow: [
      F.route({ points: SPINE, fadeIn: true, name: 'sync' }),
      ...phaseFade(OPACITY.notready, OPACITY.running),
      F.pulse({ pod: 'podGroup', at: 'sync' }),
    ],
  },
  {
    id: 'terminal',
    duration: 2400,
    narration: 'The container finally exits 0. restartPolicy OnFailure does not restart a success, so every container is Terminated and status.phase becomes Succeeded, a terminal state common for Jobs. Under restartPolicy=Never a non-zero exit is not restarted either and ends at Failed instead. Both are terminal, the Pod will not run again. If the Node hosting the Pod becomes unreachable, the node controller sets the Node Ready condition to Unknown and evicts its Pods, and the Pods sit in Terminating until the Node returns or the Node object is deleted, at which point Pod garbage collection marks them Failed with a DisruptionTarget condition. The Unknown phase is not part of that path, it was deprecated in 1.22 and nothing has set it since 2015.',
    chips: phaseState('Succeeded', 'Terminated · Completed · exit 0', '5'),
    sublabels: { containerBox: 'Terminated · Completed' },
    wires: { req: 'exit 0 · Phase Running → Succeeded · Terminal' },
    opacity: stage(OPACITY.terminated),
    lit: ['kubelet', 'phaseChip', 'cStateChip'],
    chain: 5,
    flow: [
      F.route({ points: SPINE, fadeIn: true }),
      // Terminal is a phase move like Running, so it keeps the same beat of delay before the fade.
      ...phaseFade(OPACITY.running, OPACITY.terminated),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
