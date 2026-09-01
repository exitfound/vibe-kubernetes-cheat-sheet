import { P, F, defineCard, WL, OPACITY, BEAT } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-pod-lifecycle-phases.md

// NO ladder, NO Node frame, and no actor row on TOP_Y: the phase machine is DRAWN as a machine in
// the free zone right of the panel, and the container register sits alone in the band below it.
// Panel measured at x<=397, y<=279.51, the worst of the three viewports report/overlay.test.mjs
// walks: the machine clears it on X and the register band clears it on Y, so neither is pinned to it.
const PANEL_R = 420;                                     // L-03, the machine starts on it

// ---- the phase machine: Pending -> Running -> a terminal Succeeded or Failed ----
const ST_H = 58;                                         // every state box but Running
const ROW_CY = 205;                                      // the machine centre line, its one datum

const PEND_X = PANEL_R, PEND_W = 160;                    // 420..580
const PEND_Y = ROW_CY - ST_H / 2;                        // 176..234

// Running is tall because CrashLoopBackOff lives INSIDE it, which is the whole card.
const RUN_X = 680, RUN_W = 220;                          // 680..900
const RUN_Y = 130, RUN_H = 150;                          // 130..280
const CLBO_X = 705, CLBO_W = 170;                        // 705..875, inset 25 inside Running
const CLBO_Y = 198, CLBO_H = 62;                         // 198..260, 20 clear of the Running floor

const END_X = 955, END_W = 165;                          // 955..1120
const SUCC_Y = 100, FAIL_Y = 252;                        // 100..158 / 252..310
const SUCC_CY = SUCC_Y + ST_H / 2, FAIL_CY = FAIL_Y + ST_H / 2;   // 129 / 281
const FORK_X = 927;                                      // the trunk both terminal edges leave from

// ---- the container register, below the panel ----
// The strip is the DATUM the whole register is measured off: geometry-soft holds a chip strip on
// CX to +-6, and Kubelet, the Pod and the chips all live inside it, so the band centres on CX.
const STRIP_W = 888, STRIP_X = WL.CX - STRIP_W / 2;      // 156..1044
const STRIP_R = STRIP_X + STRIP_W;

const KUBE_X = STRIP_X, KUBE_W = 232;                    // 156..388, the pair width of the section
const KUBE_Y = 435, KUBE_H = WL.BOX_H;                   // 435..515

const POD_W = 400, POD_X = STRIP_R - POD_W;              // 644..1044
const POD_Y = 420, POD_H = 110;                          // 420..530
const POD_CX = POD_X + POD_W / 2, POD_CY = POD_Y + POD_H / 2;     // 844 / 475
const CONT_W = 300, CONT_H = 60;                                  // 694..994, 450..510
const CONT_DX = (POD_W - CONT_W) / 2, CONT_DY = 30;

// Three chips at the FLOOR rather than under the panel: a full-width strip anywhere higher would
// cut the only corridor between the Pod and the machine it belongs to.
// The cells are UNEQUAL and the record says why: `container state` needs 317 for its longest value
// and the other two need 182 and 114, so an equal strip is floored by one cell at three times over.
const CHIP_GAP = 14, CHIP_W = [260, 340, 260];
const CHIP_X = i => STRIP_X + CHIP_W.slice(0, i).reduce((a, w) => a + w + CHIP_GAP, 0);
const CHIP_Y = 570;                                      // 570..604

// ---- the two registers, as lanes. Neither ever carries the other's ball ----
// Kubelet works on the container. 256 units, inside the routeDur clamp with every other hop here.
const SYNC = [[KUBE_X + KUBE_W, POD_CY], [POD_X, POD_CY]];
// The field pointer: this machine is THIS Pod's status.phase, and a Pod enters it at Pending. It
// takes role cluster with every other lane here: there is no .scheme-arrow-workloads rule at all.
const ENTER_Y = 350;
const ENTER = [[POD_CX, POD_Y], [POD_CX, ENTER_Y], [PEND_X + PEND_W / 2, ENTER_Y], [PEND_X + PEND_W / 2, PEND_Y + ST_H]];
const EDGE_RUN = [[PEND_X + PEND_W, ROW_CY], [RUN_X, ROW_CY]];
const EDGE_SUCC = [[RUN_X + RUN_W, ROW_CY], [FORK_X, ROW_CY], [FORK_X, SUCC_CY], [END_X, SUCC_CY]];
const EDGE_FAIL = [[RUN_X + RUN_W, ROW_CY], [FORK_X, ROW_CY], [FORK_X, FAIL_CY], [END_X, FAIL_CY]];

// Each register carries its own wire label, because a step always has something true to say about
// both: what Kubelet did to the container, and whether the phase moved at all. Every label here
// sits directly over the thing it names: the record's WIRE LABELS block carries the clearances.
const CWIRE_X = (KUBE_X + KUBE_W + POD_X) / 2, CWIRE_Y = POD_CY - 20;   // 516 / 455, over the lane
const PWIRE_X = RUN_X + RUN_W / 2, PWIRE_Y = RUN_Y - 16;                // 790 / 114, over Running

// Z-order: edges first so the state boxes sit on their endpoints, then the packet layer, then
// everything a ball must run under.
export const SCENE = {
  'aria-label': 'Pod lifecycle phases: status.phase is a state machine, Pending to Running to a terminal Succeeded or Failed, and CrashLoopBackOff sits inside Running as a container waiting reason that never moves the phase',
  parts: [
    P.defs(),
    // The Failed leg is drawn and never taken on this card, so it carries no arrowhead (A-05).
    P.relation({ key: 'edgeFail', points: EDGE_FAIL, role: 'cluster' }),
    P.relation({ key: 'edgeEnter', points: ENTER, dash: '5 5', role: 'cluster' }),
    P.lane({ key: 'edgeRun', points: EDGE_RUN, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'edgeSucc', points: EDGE_SUCC, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'syncLane', points: SYNC, dim: true, dashed: true, role: 'cluster' }),
    P.wire({ key: 'cwire', x: CWIRE_X, y: CWIRE_Y }),
    P.wire({ key: 'pwire', x: PWIRE_X, y: PWIRE_Y }),
    P.tag({ key: 'fieldTag', x: (POD_CX + PEND_X + PEND_W / 2) / 2, y: ENTER_Y - 12, text: 'status.phase' }),
    P.tag({ key: 'terminalTag', x: END_X + END_W / 2, y: ROW_CY + 5, text: 'terminal, absorbing' }),
    P.chip({ key: 'phaseChip', x: CHIP_X(0), y: CHIP_Y, w: CHIP_W[0], h: WL.CHIP_H, name: 'status.phase', value: 'Pending' }),
    P.chip({ key: 'stateChip', x: CHIP_X(1), y: CHIP_Y, w: CHIP_W[1], h: WL.CHIP_H, name: 'container state', value: 'none' }),
    P.chip({ key: 'restartChip', x: CHIP_X(2), y: CHIP_Y, w: CHIP_W[2], h: WL.CHIP_H, name: 'restartCount', value: '0' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.box({ key: 'pending', x: PEND_X, y: PEND_Y, w: PEND_W, h: ST_H, label: 'Pending', sublabel: 'containers not up yet', role: 'cluster' }),
    P.box({
      key: 'running', x: RUN_X, y: RUN_Y, w: RUN_W, h: RUN_H, label: 'Running', role: 'cluster',
      // box() optically centres its label, which a 150-tall state box would put on the inner box.
      tune: (el) => { const t = el.querySelector('.scheme-box-label'); if (t) t.setAttribute('y', 26); },
    }),
    P.box({ key: 'clbo', x: CLBO_X, y: CLBO_Y, w: CLBO_W, h: CLBO_H, label: 'CrashLoopBackOff', sublabel: 'waiting reason', role: 'cluster' }),
    P.box({ key: 'succeeded', x: END_X, y: SUCC_Y, w: END_W, h: ST_H, label: 'Succeeded', sublabel: 'all exit 0', role: 'cluster' }),
    P.box({ key: 'failed', x: END_X, y: FAIL_Y, w: END_W, h: ST_H, label: 'Failed', sublabel: 'one exited non-zero', role: 'cluster' }),
    P.pod({
      key: 'podGroup', id: 'podGroup', shellKey: 'shellEl', innerKey: 'containerBox',
      // The sublabel is BUILT with its string, not left empty: pod() appends the text node only
      // `if (sublabel)`, so setPodSublabel has nothing to write into and every step is dropped.
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

// The three status chips as FIELDS, in one place, so no step can move the phase and leave the
// container state carrying the previous step's value. The two long container states are named,
// because the rewind form below states each of them twice.
const CREATING = 'Waiting · ContainerCreating', BACKOFF = 'Waiting · CrashLoopBackOff';
const TERMINATED = 'Terminated · exit 0';
const fields = (phase, cstate, restart) => ({ phaseChip: phase, stateChip: cstate, restartChip: restart });

// A state a step is not in is DRAWN and dim (C-14), never absent: the reader has to see the values
// the field is not carrying for the ones it is to mean anything.
const OFF = OPACITY.pending;

// The whole machine in ONE place, and it states the SETTLED shade of every part: which state the
// field is in when the step is over. What MOVES between two of these is animated on the arrival that
// moves it, never pinned at t=0. `failed` is OFF on every step: this Pod exits 0, and the leg it did
// not take is the counterfactual the last narration names. `reg` is the container REGISTER, both its
// lanes and the pointer's caption, and it is the card's one A-13 deviation (record, LANES).
const machine = ({ pending = OFF, running = OFF, succeeded = OFF, pod }) => ({
  pending, running, succeeded, failed: OFF,
  // NESTING: CrashLoopBackOff is drawn INSIDE Running, so it is not a part with a shade of its own.
  // A sub-block lit or dimmed apart from the box it sits in reads as a rendering fault, not a state.
  clbo: running,
  // Every lane and both lane captions stand at full strength on every step. A lane is a
  // RELATIONSHIP that does not stop being true, and `dim: true` is the weight that keeps it quiet.
  edgeRun: 1, edgeSucc: 1, edgeFail: 1, edgeEnter: 1, syncLane: 1, fieldTag: 1,
  // The fork caption is exactly as bright as the brighter of the two states it names, never more:
  // a full-strength caption over two boxes at 0.55 labels something that is not drawn.
  terminalTag: Math.max(succeeded, OFF),
  podGroup: pod,
});

// One fade shape for the card. `when` is the delay vocabulary verbatim, so a beat is stated as the
// arrival it hangs off rather than as a number: { delay: 0 } or { at: 'sync', plus: HOP }.
const FADE_MS = 700;
const fadeTo = (target, from, to, when) => F.fade({
  target, from, to, dur: FADE_MS, fill: 'both',
  easing: to > from ? 'ease-out' : 'ease-in', ...when,
});

// ONE choreography, seven rules, two directions, and no per-step decisions: the record's MOTION
// blocks state all of it. HOP is its only beat, and every delay below is either 0, an arrival, or
// an arrival plus HOP.
const HOP = BEAT.afterPulse;

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: fields('Pending', 'none', '0'),
    sublabels: { containerBox: 'no container yet' },
    podSublabels: { podGroup: 'restartPolicy: OnFailure' },
    wires: { cwire: 'Pod object created', pwire: 'phase Pending' },
    opacity: machine({ pending: 1, pod: OPACITY.pending }),
  },
  {
    id: 'schedule',
    duration: 2200,
    narration: 'The Pod is bound to a Node, so Kubelet picks it up, pulls the images and creates the sandbox, and the container sits in Waiting with reason ContainerCreating. The status.phase field stays Pending while any container is still waiting. The machine does not move at all on this step.',
    chips: fields('Pending', CREATING, '0'),
    sublabels: { containerBox: CREATING },
    podSublabels: { podGroup: 'restartPolicy: OnFailure' },
    wires: { cwire: 'SyncPod · image pull · sandbox', pwire: 'phase stays Pending' },
    opacity: machine({ pending: 1, pod: OPACITY.pending }),
    lit: ['kubelet', 'stateChip'],
    // P-03 FORM-B: `chips` above is the settled end state the static path needs (S-13), and the
    // rewind puts the container back where the previous step left it so the value turns over under
    // its own cue when the SyncPod ball lands, rather than standing 700ms ahead of it.
    // The pulse is the WHOLE cue for the Pod and its container box, so the static path needs
    // the one thing it cannot show. `containerBox` and not the shell: the catalog's shape.
    reducedLit: ['containerBox'],
    rewind: { chips: { stateChip: 'none' } },
    flow: [
      F.route({ points: SYNC, fadeIn: true, name: 'sync' }),
      F.pulse({ pod: 'podGroup', at: 'sync', dim: true }),
      F.set({ at: 'sync', chips: { stateChip: CREATING } }),
    ],
  },
  {
    id: 'running',
    duration: 2400,
    narration: 'Every container has been created and at least one has started, so status.phase takes its one healthy edge and moves from Pending to Running. That edge covers the entire working life of the Pod, however long it lasts and whatever happens inside it. Running is a statement about placement, not about health.',
    chips: fields('Running', 'Running', '0'),
    sublabels: { containerBox: 'Running · serving' },
    podSublabels: { podGroup: 'restartPolicy: OnFailure' },
    wires: { cwire: 'StartContainer OK', pwire: 'Pending → Running' },
    opacity: machine({ running: 1, pod: 1 }),
    // SENDER: the state box the edge leaves is lit before the ball goes, and KEEPS the cue as it
    // dims, so both ends of the transition end the step lit and the edge taken is what reads.
    lit: ['pending', 'phaseChip', 'stateChip'],
    rewind: { chips: { phaseChip: 'Pending', stateChip: CREATING } },
    flow: [
      // UP. The container coming up is the cause, so the Pod is fully alive before the edge fires.
      fadeTo('podGroup', OPACITY.pending, 1, { delay: 0 }),
      F.route({ points: EDGE_RUN, delay: HOP, fadeIn: true, name: 'edge', lights: ['running', 'clbo'] }),
      // The field changes WHERE the ball lands: the box it leaves goes dim on the same beat, and
      // the box it enters comes up with the sub-block drawn inside it.
      fadeTo('pending', 1, OFF, { at: 'edge' }),
      fadeTo('running', OFF, 1, { at: 'edge' }),
      fadeTo('clbo', OFF, 1, { at: 'edge' }),
      F.set({ at: 'edge', chips: { phaseChip: 'Running', stateChip: 'Running' } }),
    ],
  },
  {
    id: 'crashloop',
    duration: 2400,
    narration: 'The container exits with a non-zero code, Kubelet restarts it inside the same sandbox, and repeated fast failures push it into Waiting with reason CrashLoopBackOff while a backoff timer ticks. CrashLoopBackOff is a container-level waiting reason and never a phase of its own, so it is drawn inside Running. The machine has not moved and status.phase still reads Running.',
    chips: fields('Running', BACKOFF, '4'),
    sublabels: { containerBox: BACKOFF },
    podSublabels: { podGroup: 'restartPolicy: OnFailure' },
    wires: { cwire: 'exit != 0 · restart · backoff', pwire: 'phase stays Running' },
    opacity: machine({ running: 1, pod: OPACITY.notready }),
    lit: ['kubelet', 'stateChip', 'restartChip'],
    // The backoff and the restart count are what the ball carries, so neither stands before it.
    reducedLit: ['containerBox'],
    rewind: { chips: { stateChip: 'Running', restartChip: '0' } },
    flow: [
      // Nothing in the MACHINE is cued here and that is the step: the phase does not move, so the
      // news is drawn where it happens, in the container box, the two chips and the cwire.
      F.route({ points: SYNC, fadeIn: true, name: 'sync' }),
      F.pulse({ pod: 'podGroup', at: 'sync' }),
      F.set({ at: 'sync', chips: { stateChip: BACKOFF, restartChip: '4' } }),
      fadeTo('podGroup', 1, OPACITY.notready, { at: 'sync', plus: HOP }),
    ],
  },
  {
    id: 'recover',
    duration: 2400,
    narration: 'The backoff timer elapses, Kubelet starts the container again and this time it runs, so the container state returns to Running and restartCount records how many restarts it took. The status.phase field never left Running through the whole episode. A reader watching only the phase would have seen nothing happen at all.',
    chips: fields('Running', 'Running', '5'),
    sublabels: { containerBox: 'Running · restarted' },
    podSublabels: { podGroup: 'restartPolicy: OnFailure' },
    wires: { cwire: 'backoff over · StartContainer', pwire: 'phase stays Running' },
    opacity: machine({ running: 1, pod: 1 }),
    lit: ['kubelet', 'stateChip', 'restartChip'],
    reducedLit: ['containerBox'],
    rewind: { chips: { stateChip: BACKOFF, restartChip: '4' } },
    flow: [
      F.route({ points: SYNC, fadeIn: true, name: 'sync' }),
      // The Pod pulses wherever its container box lights, so the pair is never cued apart. The
      // full pulse and not the dim one: `pulsePodDim` animates the same opacity this fade does.
      F.pulse({ pod: 'podGroup', at: 'sync' }),
      fadeTo('podGroup', OPACITY.notready, 1, { at: 'sync' }),
      F.set({ at: 'sync', chips: { stateChip: 'Running', restartChip: '5' } }),
    ],
  },
  {
    id: 'terminal',
    // 2900 and not the 2400 of its siblings: the last step has nowhere to go, so its hold IS the
    // end of the card, and 200ms of stillness read as the loop cutting it off.
    duration: 2900,
    narration: 'The container finally exits 0, and restartPolicy OnFailure does not restart a success, so every container is Terminated and status.phase becomes Succeeded. Under restartPolicy Never a non-zero exit is not restarted either, and the machine takes the other edge to Failed instead. Both are terminal and absorbing, the Pod will not run again, and the fifth value Unknown was deprecated in 1.22.',
    chips: fields('Succeeded', TERMINATED, '5'),
    sublabels: { containerBox: 'Terminated · Completed' },
    podSublabels: { podGroup: 'restartPolicy: OnFailure' },
    wires: { cwire: 'exit 0 · not restarted', pwire: 'Running → Succeeded' },
    opacity: machine({ succeeded: 1, pod: OPACITY.terminated }),
    // SENDER, and NESTING takes `clbo` with it: neither is ever cued without the other.
    lit: ['running', 'clbo', 'phaseChip', 'stateChip'],
    rewind: { chips: { phaseChip: 'Running', stateChip: 'Running' } },
    flow: [
      // UP, and the only step where the Pod both blinks and dies: the exit 0 is the last thing it
      // reports, so it blinks at full strength FIRST and everything else follows a beat later.
      F.pulse({ pod: 'podGroup', delay: 0 }),
      fadeTo('podGroup', 1, OPACITY.terminated, { delay: HOP }),
      F.route({ points: EDGE_SUCC, delay: HOP, fadeIn: true, name: 'edge', lights: ['succeeded'] }),
      fadeTo('running', 1, OFF, { at: 'edge' }),
      fadeTo('clbo', 1, OFF, { at: 'edge' }),
      fadeTo('succeeded', OFF, 1, { at: 'edge' }),
      fadeTo('terminalTag', OFF, 1, { at: 'edge' }),
      F.set({ at: 'edge', chips: { phaseChip: 'Succeeded', stateChip: TERMINATED } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
