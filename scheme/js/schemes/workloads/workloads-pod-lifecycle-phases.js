import { P, F, defineCard, WL, OPACITY, BEAT } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-pod-lifecycle-phases.md

// No ladder and no Node frame: the phase machine is drawn over the container register, both on one strip.

// The strip is the datum of the whole card: everything inside it centres on CX.
const STRIP_W = 888, STRIP_X = WL.CX - STRIP_W / 2;
const STRIP_R = STRIP_X + STRIP_W;

// ---- the phase machine: Pending -> Running -> a terminal Succeeded or Failed ----
const MACH_INSET = 20;
const MACH_L = STRIP_X + MACH_INSET, MACH_R = STRIP_R - MACH_INSET;
const ST_H = 58;                                         // every state box but Running
const ROW_CY = 288;  // Pending top clear of the narration panel

const PEND_X = MACH_L, PEND_W = 190;
const PEND_Y = ROW_CY - ST_H / 2;
const EDGE_RUN_GAP = 100;                                // the one drawn edge with a ball on this row

// Running is tall because CrashLoopBackOff lives inside it.
const RUN_X = PEND_X + PEND_W + EDGE_RUN_GAP, RUN_W = 260;
const RUN_Y = ROW_CY - 75, RUN_H = 150;
const CLBO_INSET = 25;
const CLBO_X = RUN_X + CLBO_INSET, CLBO_W = RUN_W - 2 * CLBO_INSET;
const CLBO_Y = ROW_CY - 7, CLBO_H = 62;

// Running sits FORK_GAP*2 from the terminal pair, matching its gap to Pending, so the board reads equidistant.
const FORK_GAP = 50;                                     // Running wall to trunk, trunk to terminal wall
const FORK_X = RUN_X + RUN_W + FORK_GAP;  // the trunk both terminal edges leave from
const END_X = FORK_X + FORK_GAP, END_W = MACH_R - END_X;
const SUCC_Y = ROW_CY - 105, FAIL_Y = ROW_CY + 47;
const SUCC_CY = SUCC_Y + ST_H / 2, FAIL_CY = FAIL_Y + ST_H / 2;

// ---- the container register, below the panel, on the same strip ----
const KUBE_X = STRIP_X, KUBE_W = 232;
const KUBE_Y = 465, KUBE_H = WL.BOX_H;

const POD_W = 400, POD_X = STRIP_R - POD_W;
const POD_Y = 450, POD_H = 110;
const POD_CX = POD_X + POD_W / 2, POD_CY = POD_Y + POD_H / 2;
const CONT_W = 300, CONT_H = 60;
const CONT_DX = (POD_W - CONT_W) / 2, CONT_DY = 30;

// Chips sit at the floor so they never cut the Pod-to-machine corridor. Unequal cells sized to their longest values.
const CHIP_GAP = 14, CHIP_W = [260, 340, 260];
const CHIP_X = i => STRIP_X + CHIP_W.slice(0, i).reduce((a, w) => a + w + CHIP_GAP, 0);
const CHIP_Y = 590;

// ---- the two registers, as lanes. Neither ever carries the other's ball ----
// Kubelet works on the container.
const SYNC = [[KUBE_X + KUBE_W, POD_CY], [POD_X, POD_CY]];
// The field pointer: this machine is this Pod's status.phase, entered at Pending.
const ENTER_Y = (FAIL_Y + ST_H + POD_Y) / 2;  // midway from the Failed floor to the Pod top
const ENTER = [[POD_CX, POD_Y], [POD_CX, ENTER_Y], [PEND_X + PEND_W / 2, ENTER_Y], [PEND_X + PEND_W / 2, PEND_Y + ST_H]];
const EDGE_RUN = [[PEND_X + PEND_W, ROW_CY], [RUN_X, ROW_CY]];
const EDGE_SUCC = [[RUN_X + RUN_W, ROW_CY], [FORK_X, ROW_CY], [FORK_X, SUCC_CY], [END_X, SUCC_CY]];
// Failed takes two edges, landing as an L-12 pair either side of its left-face midpoint.
const FAIL_PAIR = 10;
const EDGE_FAIL = [[RUN_X + RUN_W, ROW_CY], [FORK_X, ROW_CY], [FORK_X, FAIL_CY - FAIL_PAIR], [END_X, FAIL_CY - FAIL_PAIR]];
// Pending's second exit runs under Running, since both face midpoints it could use are taken.
const SKIP_X = PEND_X + PEND_W / 2 + 30;
const SKIP_Y = FAIL_CY + FAIL_PAIR;
const EDGE_PEND_FAIL = [[SKIP_X, PEND_Y + ST_H], [SKIP_X, SKIP_Y], [END_X, SKIP_Y]];

// Each register carries its own wire label, set directly over the thing it names.
const CWIRE_X = (KUBE_X + KUBE_W + POD_X) / 2, CWIRE_Y = POD_CY - 20;
const PWIRE_X = RUN_X + RUN_W / 2, PWIRE_Y = RUN_Y - 16;

// Z-order: edges first, then the packet layer, then everything a ball must run under.
export const SCENE = {
  'aria-label': 'Pod lifecycle phases: status.phase drawn as a coarse state machine, Pending to Running to a terminal Succeeded or Failed, plus a direct edge from Pending to Failed, and CrashLoopBackOff sits inside Running as a container waiting reason that never moves the phase',
  parts: [
    P.defs(),
    // The Failed leg is drawn and never taken on this card, so it carries no arrowhead (A-05).
    P.relation({ key: 'edgeFail', points: EDGE_FAIL, role: 'cluster' }),
    P.relation({ key: 'edgePendFail', points: EDGE_PEND_FAIL, role: 'cluster' }),
    P.relation({ key: 'edgeEnter', points: ENTER, role: 'cluster' }),
    P.lane({ key: 'edgeRun', points: EDGE_RUN, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'edgeSucc', points: EDGE_SUCC, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'syncLane', points: SYNC, dim: true, dashed: true, role: 'cluster' }),
    P.wire({ key: 'cwire', x: CWIRE_X, y: CWIRE_Y }),
    P.wire({ key: 'pwire', x: PWIRE_X, y: PWIRE_Y }),
    P.tag({ key: 'fieldTag', x: PEND_X + PEND_W / 2 - 10, y: (PEND_Y + ST_H + ENTER_Y) / 2 + 4, anchor: 'end', text: 'status.phase' }),
    P.tag({ key: 'terminalTag', x: END_X + END_W / 2, y: ROW_CY + 5, text: 'terminal, absorbing' }),
    P.chip({ key: 'phaseChip', x: CHIP_X(0), y: CHIP_Y, w: CHIP_W[0], h: WL.CHIP_H, name: 'status.phase', value: 'Pending' }),
    P.chip({ key: 'stateChip', x: CHIP_X(1), y: CHIP_Y, w: CHIP_W[1], h: WL.CHIP_H, name: 'container state', value: 'none' }),
    P.chip({ key: 'restartChip', x: CHIP_X(2), y: CHIP_Y, w: CHIP_W[2], h: WL.CHIP_H, name: 'restartCount', value: '0' }),
    P.packets(),
    // Everything below is appended after the packet layer, so the ball runs under it.
    P.box({ key: 'pending', x: PEND_X, y: PEND_Y, w: PEND_W, h: ST_H, label: 'Pending', sublabel: 'containers not up yet', role: 'cluster' }),
    P.box({
      key: 'running', x: RUN_X, y: RUN_Y, w: RUN_W, h: RUN_H, label: 'Running', role: 'cluster',
      // box() optically centres its label, which on a tall state box would land on the inner box.
      tune: (el) => { const t = el.querySelector('.scheme-box-label'); if (t) t.setAttribute('y', 26); },
    }),
    P.box({ key: 'clbo', x: CLBO_X, y: CLBO_Y, w: CLBO_W, h: CLBO_H, label: 'CrashLoopBackOff', sublabel: 'waiting reason', role: 'cluster' }),
    P.box({ key: 'succeeded', x: END_X, y: SUCC_Y, w: END_W, h: ST_H, label: 'Succeeded', sublabel: 'all exit 0', role: 'cluster' }),
    P.box({ key: 'failed', x: END_X, y: FAIL_Y, w: END_W, h: ST_H, label: 'Failed', sublabel: 'one exited non-zero', role: 'cluster' }),
    P.pod({
      key: 'podGroup', id: 'podGroup', shellKey: 'shellEl', innerKey: 'containerBox',
      // Sublabel must be non-empty: pod() only appends the text node if (sublabel), or setPodSublabel has no target.
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: 'restartPolicy: OnFailure', containers: 0,
      opacity: OPACITY.pending,
      inner: { dx: CONT_DX, dy: CONT_DY, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'no container yet' },
    }),
    P.box({ key: 'kubelet', x: KUBE_X, y: KUBE_Y, w: KUBE_W, h: KUBE_H, label: 'Kubelet', sublabel: 'syncs the container', role: 'cluster' }),
  ],
  reset: {
    keys: ['kubelet', 'pending', 'running', 'clbo', 'succeeded', 'failed', 'phaseChip', 'stateChip', 'restartChip', 'shellEl', 'containerBox'],
    pods: ['podGroup'],
  },
};

// The three status chips as fields in one place, so no step can move the phase and leave a stale container state.
const CREATING = 'Waiting · ContainerCreating', BACKOFF = 'Waiting · CrashLoopBackOff';
const TERMINATED = 'Terminated · Completed';
const fields = (phase, cstate, restart) => ({ phaseChip: phase, stateChip: cstate, restartChip: restart });

// A state a step is not in is drawn dim (C-14), never absent.
const OFF = OPACITY.pending;

// Settled shade of every part per step. `failed` is OFF throughout: this Pod exits 0. All lanes stand at 1 (A-13 deviation).
const machine = ({ pending = OFF, running = OFF, succeeded = OFF, pod }) => ({
  pending, running, succeeded, failed: OFF,
  // CrashLoopBackOff is drawn inside Running, so it shares Running's shade.
  clbo: running,
  edgeRun: 1, edgeSucc: 1, edgeFail: 1, edgePendFail: 1, edgeEnter: 1, syncLane: 1, fieldTag: 1,
  // The fork caption is never brighter than the brighter of the two states it names.
  terminalTag: Math.max(succeeded, OFF),
  podGroup: pod,
});

// `when` is the delay vocabulary verbatim: { delay: 0 } or { at: 'sync', plus: HOP }.
const FADE_MS = 700;
const fadeTo = (target, from, to, when) => F.fade({
  target, from, to, dur: FADE_MS, fill: 'both',
  easing: to > from ? 'ease-out' : 'ease-in', ...when,
});

const HOP = BEAT.afterPulse;

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: fields('Pending', 'none', '0'),
    sublabels: { containerBox: 'no container yet' },
    podSublabels: { podGroup: 'restartPolicy: OnFailure' },
    wires: { cwire: 'not picked up yet', pwire: 'phase Pending' },
    opacity: machine({ pending: 1, pod: OPACITY.pending }),
  },
  {
    id: 'schedule',
    duration: 2900,
    narration: 'The Pod is bound to a Node, so Kubelet picks it up, creates the sandbox and pulls the image, and the container sits in Waiting with reason ContainerCreating. The status.phase field stays Pending while any container is still waiting for its first start. The machine does not move at all on this step.',
    chips: fields('Pending', CREATING, '0'),
    sublabels: { containerBox: CREATING },
    podSublabels: { podGroup: 'restartPolicy: OnFailure' },
    wires: { cwire: 'SyncPod · sandbox · image pull', pwire: 'phase stays Pending' },
    opacity: machine({ pending: 1, pod: OPACITY.pending }),
    lit: ['kubelet', 'stateChip'],
    // P-03 form B: the rewind restores the previous container state so it turns over when the SyncPod ball lands.
    reducedLit: ['containerBox'],
    rewind: { chips: { stateChip: 'none' }, sublabels: { containerBox: 'no container yet' } },
    flow: [
      // Down, and Kubelet is lit at entry, so its ball waits BEAT.lead (M-18).
      F.route({ points: SYNC, delay: BEAT.lead, fadeIn: true, name: 'sync', pulse: { pod: 'podGroup', dim: true } }),
      F.set({ at: 'sync', chips: { stateChip: CREATING }, sublabels: { containerBox: CREATING } }),
    ],
  },
  {
    id: 'running',
    duration: 2900,
    narration: 'Every container has been created and at least one is running, so status.phase takes its one healthy edge and moves from Pending to Running. That edge covers the entire working life of the Pod, however long it lasts and whatever happens inside it. Running says where the Pod is in its life, not its health.',
    chips: fields('Running', 'Running', '0'),
    sublabels: { containerBox: 'Running · serving' },
    podSublabels: { podGroup: 'restartPolicy: OnFailure' },
    wires: { cwire: 'StartContainer OK', pwire: 'Pending → Running' },
    opacity: machine({ running: 1, pod: 1 }),
    // Sender: the state box the edge leaves is lit before the ball goes.
    lit: ['pending', 'phaseChip', 'stateChip'],
    rewind: { chips: { phaseChip: 'Pending', stateChip: CREATING }, sublabels: { containerBox: CREATING } },
    flow: [
      // Up: the container coming up is the cause, so the Pod is fully alive before the edge fires.
      fadeTo('podGroup', OPACITY.pending, 1, { delay: 0 }),
      F.route({ points: EDGE_RUN, delay: HOP, fadeIn: true, name: 'edge', lights: ['running', 'clbo'] }),
      fadeTo('pending', 1, OFF, { at: 'edge' }),
      fadeTo('running', OFF, 1, { at: 'edge' }),
      fadeTo('clbo', OFF, 1, { at: 'edge' }),
      F.set({ at: 'edge', chips: { phaseChip: 'Running', stateChip: 'Running' }, sublabels: { containerBox: 'Running · serving' } }),
    ],
  },
  {
    id: 'crashloop',
    duration: 3500,
    narration: 'The container exits with a non-zero code, Kubelet restarts it inside the same sandbox, and repeated fast failures push it into Waiting with reason CrashLoopBackOff while a backoff timer ticks. CrashLoopBackOff is a container-level waiting reason and never a phase of its own, so it is drawn inside Running. The machine has not moved and status.phase still reads Running.',
    chips: fields('Running', BACKOFF, '4'),
    sublabels: { containerBox: BACKOFF },
    podSublabels: { podGroup: 'restartPolicy: OnFailure' },
    wires: { cwire: 'exit != 0 · restart · backoff', pwire: 'phase stays Running' },
    opacity: machine({ running: 1, pod: OPACITY.notready }),
    lit: ['kubelet', 'stateChip', 'restartChip'],
    reducedLit: ['containerBox'],
    rewind: { chips: { stateChip: 'Running', restartChip: '0' }, sublabels: { containerBox: 'Running · serving' } },
    flow: [
      // Nothing in the machine is cued: the phase does not move.
      F.route({ points: SYNC, delay: BEAT.lead, fadeIn: true, name: 'sync', pulse: 'podGroup' }),
      F.set({ at: 'sync', chips: { stateChip: BACKOFF, restartChip: '4' }, sublabels: { containerBox: BACKOFF } }),
      fadeTo('podGroup', 1, OPACITY.notready, { at: 'sync', plus: HOP }),
    ],
  },
  {
    id: 'recover',
    duration: 3000,
    narration: 'The backoff timer elapses, Kubelet starts the container again and this time it runs, so the container state returns to Running and restartCount records how many restarts it took. The status.phase field never left Running through the whole episode. A reader watching only the phase would have seen nothing happen at all.',
    chips: fields('Running', 'Running', '5'),
    sublabels: { containerBox: 'Running · restarted' },
    podSublabels: { podGroup: 'restartPolicy: OnFailure' },
    wires: { cwire: 'backoff over · StartContainer', pwire: 'phase stays Running' },
    opacity: machine({ running: 1, pod: 1 }),
    lit: ['kubelet', 'stateChip', 'restartChip'],
    reducedLit: ['containerBox'],
    rewind: { chips: { stateChip: BACKOFF, restartChip: '4' }, sublabels: { containerBox: BACKOFF } },
    flow: [
      F.route({ points: SYNC, delay: BEAT.lead, fadeIn: true, name: 'sync' }),
      // Full pulse, not the dim one: pulsePodDim animates the same opacity this fade does.
      F.pulse({ pod: 'podGroup', at: 'sync' }),
      fadeTo('podGroup', OPACITY.notready, 1, { at: 'sync' }),
      F.set({ at: 'sync', chips: { stateChip: 'Running', restartChip: '5' }, sublabels: { containerBox: 'Running · restarted' } }),
    ],
  },
  {
    id: 'terminal',
    duration: 3600,
    narration: 'The container exits 0 and OnFailure does not restart a success, so every container is Terminated and status.phase becomes Succeeded. Under restartPolicy Never, with no container-level rule, a non-zero exit is not restarted and the machine takes the edge to Failed. Both are terminal and absorbing, the Pod will not run again, and the fifth value Unknown was deprecated in 1.22.',
    chips: fields('Succeeded', TERMINATED, '5'),
    sublabels: { containerBox: TERMINATED },
    podSublabels: { podGroup: 'restartPolicy: OnFailure' },
    wires: { cwire: 'exit 0 · not restarted', pwire: 'Running → Succeeded' },
    opacity: machine({ succeeded: 1, pod: OPACITY.terminated }),
    // Sender, and `clbo` is always cued with `running`.
    lit: ['running', 'clbo', 'phaseChip', 'stateChip'],
    rewind: { chips: { phaseChip: 'Running', stateChip: 'Running' }, sublabels: { containerBox: 'Running · restarted' } },
    flow: [
      // Up: the Pod blinks at full strength first, everything else follows a beat later.
      F.pulse({ pod: 'podGroup', delay: 0 }),
      fadeTo('podGroup', 1, OPACITY.terminated, { delay: HOP }),
      F.route({ points: EDGE_SUCC, delay: HOP, fadeIn: true, name: 'edge', lights: ['succeeded'] }),
      fadeTo('running', 1, OFF, { at: 'edge' }),
      fadeTo('clbo', 1, OFF, { at: 'edge' }),
      fadeTo('succeeded', OFF, 1, { at: 'edge' }),
      fadeTo('terminalTag', OFF, 1, { at: 'edge' }),
      F.set({ at: 'edge', chips: { phaseChip: 'Succeeded', stateChip: TERMINATED }, sublabels: { containerBox: TERMINATED } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
