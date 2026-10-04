import { P, F, defineCard, strip, laneY, WL, FADE, BEAT, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-pod-scheduling-gates.md

// A THRESHOLD, not the A / B / C column preset (WL.L-06): the subject is one line a Pod is on the
// wrong side of, so the canvas is TWO tiers and everything but the actor row stands on one floor.
// Panel measured at x<=396.55, y<=254.66 (worst of 1600/1280/1100, on the poster frame). It stays
// in this comment and in no constant, because nothing on this card derives from it (L-07).

// The floor: Pod, the two gates and the queue, all on ONE y and ONE height, so a single horizontal
// line runs through every face midpoint and the card has two bands rather than four.
const FLOOR_Y = 340, FLOOR_H = WL.BOX_H;                 // 340..420, 85.34 clear of the panel
const FLOOR_CY = FLOOR_Y + FLOOR_H / 2;                  // 380, the route

// The span is WL.L..WL.R exactly, so the content bbox centres on WL.CX by construction (L-13).
const POD_X = WL.L, POD_W = 240;                         // 60..300
// RUN_W is the DRAWN half of the route and it is the same on both sides, so the gate assembly is
// centred on WL.CX without being told to: 120 is what is left once the four bodies have their span.
const RUN_W = 120;
const GATE_W = 180, GA_X = POD_X + POD_W + RUN_W;        // 420..600, and the twin at 600..780
const GB_X = GA_X + GATE_W;                              // the two gates TOUCH: they are one list
const SCH_W = 240, SCH_X = GB_X + GATE_W + RUN_W;        // 900..1140, which ends on WL.R

// The API, centred on WL.SPINE_X (WL.L-07). Both writes leave its face as an L-12 mirrored pair at
// +-90, which is the gate half-width, so each drop lands on a gate top midpoint.
const API_W = 232, API_X = WL.CX - API_W / 2;            // 484..716, the family actor width
const DROP = laneY(WL.CX, GATE_W / 2);                   // 510 and 690
// The controller that owns the gates, on the actor row right of the API and ending on WL.R: every
// PATCH the narration names leaves HERE, and the API only accepts or refuses it (A-09). The
// top-row pair is WL.A-01: the request runs leftward on REQ_Y, the refusal comes back on RESP_Y.
const OWN_W = 232, OWN_X = WL.R - OWN_W;                 // 908..1140, a 192 gap to the API
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);   // 68 and 92
const API_R = API_X + API_W;                             // 716, the face both top lanes end on
// Built ONCE each: the drawn lane and every ball on it index the same array (A-02), which a
// factory called per use cannot do because it makes two arrays that are only equal.
const drop = (x) => [[x, WL.TOP_BOTTOM], [x, FLOOR_Y]];  // 220 units, no turn
const DROP_A = drop(DROP.out), DROP_B = drop(DROP.back);

// The route, in TWO pieces with the gates between them. Nothing is drawn across the gate assembly:
// a ball entering it fades at one face and re-emerges at the far one (A-19), which is what makes
// the closed state readable as two stubs pointing at each other.
const LANE_IN = [[POD_X + POD_W, FLOOR_CY], [GA_X, FLOOR_CY]];
const LANE_OUT = [[GB_X + GATE_W, FLOOR_CY], [SCH_X, FLOOR_CY]];

// Two rows of two, 532 wide, which is LAYOUT.C.strip.two arrived at from the span: four across is
// refused by WL.L-05 and 350.7 is narrower than `False · SchedulingGated` beside its own name.
const CHIP = strip({ from: WL.L, to: WL.R, count: 2, gap: 16 });
const CHIP_Y = [500, 542];     // 500..534 and 542..576, 80 under the floor and 64 off the edge

// The list order IS the append order, so it is the z-order: the four lanes and the wire label
// first, then the chips and the packet layer, then gates / Pod / queue / API above the ball.
export const SCENE = {
  'aria-label': 'Pod scheduling gates: two named entries in spec.schedulingGates stand between a Pod and the scheduling queue, a controller that owns them patches each one out and the API accepts removals in any order but never an addition, and the Pod is queued only once the list is empty',
  parts: [
    P.defs(),
    // All four lanes carry the role, as every other lane in this category does. Omitting it on the
    // two the balls ride costs rgb(63, 93, 138) against rgb(91, 184, 255): there is no
    // `.scheme-arrow-workloads` rule in diagrams.css, so a role-less lane falls to the generic dim
    // token and reads fainter than the two idle write lanes above it. State is opacity's job here,
    // and `route()` and `gates()` below are where all of it is said.
    P.lane({ key: 'laneIn', points: LANE_IN, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'laneOut', points: LANE_OUT, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'dropA', points: DROP_A, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'dropB', points: DROP_B, dim: true, dashed: true, role: 'cluster' }),
    // The top-row pair. The request is ridden on four steps and the answer on one, the refusal,
    // which is the only thing the API ever sends back on this card (A-06).
    P.arrow({ key: 'reqLane', x1: OWN_X, y1: REQ_Y, x2: API_R, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ key: 'respLane', x1: API_R, y1: RESP_Y, x2: OWN_X, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WL.CX, y: WL.TOP_Y - 12 }),
    P.chip({ key: 'statusChip', x: CHIP.x(0), y: CHIP_Y[0], w: CHIP.w, h: WL.CHIP_H, name: 'kubectl STATUS', value: 'SchedulingGated' }),
    P.chip({ key: 'condChip', x: CHIP.x(1), y: CHIP_Y[0], w: CHIP.w, h: WL.CHIP_H, name: 'PodScheduled', value: 'False · SchedulingGated' }),
    P.chip({ key: 'gatesChip', x: CHIP.x(0), y: CHIP_Y[1], w: CHIP.w, h: WL.CHIP_H, name: 'spec.schedulingGates', value: '2 entries' }),
    P.chip({ key: 'metricChip', x: CHIP.x(1), y: CHIP_Y[1], w: CHIP.w, h: WL.CHIP_H, name: 'scheduler_pending_pods', value: 'queue="gated"' }),
    P.packets(),
    // Appended AFTER the packet layer, so the ball runs under the gates it passes through.
    P.box({ key: 'gateA', x: GA_X, y: FLOOR_Y, w: GATE_W, h: FLOOR_H, label: 'example.com/foo', sublabel: 'holds the Pod', role: 'cluster' }),
    P.box({ key: 'gateB', x: GB_X, y: FLOOR_Y, w: GATE_W, h: FLOOR_H, label: 'example.com/bar', sublabel: 'holds the Pod', role: 'cluster' }),
    P.pod({
      key: 'podGroup', id: 'podGroup',
      // No inner box and no container glyph: nothing about this Pod has been placed or started,
      // and it is the only bare Pod in the section (five of the eight draw a Node frame).
      x: POD_X, y: FLOOR_Y, w: POD_W, h: FLOOR_H, label: 'Pod test-pod', sublabel: 'no Node assigned', containers: 0,
    }),
    P.box({ key: 'schedEl', x: SCH_X, y: FLOOR_Y, w: SCH_W, h: FLOOR_H, label: 'Scheduler', sublabel: 'active queue', role: 'cluster' }),
    P.box({ key: 'apiEl', x: API_X, y: WL.TOP_Y, w: API_W, h: WL.BOX_H, label: 'API', sublabel: 'accepts or refuses', role: 'cluster' }),
    P.box({ key: 'ownerEl', x: OWN_X, y: WL.TOP_Y, w: OWN_W, h: WL.BOX_H, label: 'Controller', sublabel: 'owns the gates', role: 'cluster' }),
  ],
  reset: {
    keys: ['apiEl', 'ownerEl', 'schedEl', 'gateA', 'gateB', 'statusChip', 'condChip', 'gatesChip', 'metricChip'],
    pods: ['podGroup'],
  },
};

// Chip values that recur, named once so a four-key `chips` block stays one readable line.
const GATED = 'SchedulingGated', COND_GATED = 'False · SchedulingGated', Q_GATED = 'queue="gated"';
const HOLDS = 'holds the Pod', REMOVED = 'removed from the list';

// One request hop, the same on every step that sends one: the controller is the sender and is lit
// at entry, the API is the receiver and lights on arrival. Named so a drop can chain `after` it.
const request = (name = 'req') => F.top({ from: OWN_X, to: API_R, y: REQ_Y, name, lights: ['apiEl'] });

// The two route lanes take the shade of the ACTOR at their far end, the Pod and the queue, never
// of the gate standing in the middle: a gate is what sits ON the route rather than an end of it,
// and A-15 outranks A-13 on any step that rides one. Stated once, so no step can split the pair.
const route = (queued) => ({ laneIn: 1, laneOut: queued ? 1 : OPACITY.notready, schedEl: queued ? 1 : OPACITY.notready });
// The list as FIELDS, so a step cannot show one gate gone and its chip still counting two. They
// come OFF bar first and foo second, which is the arbitrary order step 3 is about, so gateB is
// the one that leaves at n=1 and gateA is the one that survives it. The list order is the other
// way round, foo then bar, which is how the two gates are drawn and what step 3 calls second.
const gates = (n) => ({
  gateA: n > 0 ? 1 : OPACITY.terminated, dropA: n > 0 ? 1 : OPACITY.terminated,
  gateB: n > 1 ? 1 : OPACITY.terminated, dropB: n > 1 ? 1 : OPACITY.terminated,
});

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { statusChip: GATED, condChip: COND_GATED, gatesChip: '2 entries', metricChip: Q_GATED },
    opacity: { ...route(false), ...gates(2) },
    sublabels: { gateA: HOLDS, gateB: HOLDS, ownerEl: 'owns the gates', apiEl: 'accepts or refuses' },
  },
  {
    id: 'created',
    duration: 4200,
    narration: 'A Pod created one minute ago, and the Scheduler has not looked at it once. Its spec carries spec.schedulingGates with two entries, and each entry is an opaque criterion that some other component owns. A gate can only be set while the Pod is being created, by the client that posts it or by an admission plugin that mutates it on the way in.',
    chips: { statusChip: GATED, condChip: COND_GATED, gatesChip: '2 entries', metricChip: Q_GATED },
    wires: { req: 'POST Pod test-pod · a gate can be set only here' },
    opacity: { ...route(false), ...gates(2) },
    sublabels: { apiEl: 'writes the gates at admission', ownerEl: 'POSTs the Pod, two gates on it', schedEl: 'active queue', gateA: HOLDS, gateB: HOLDS },
    // The controller POSTs, the API lights on arrival and then writes: the two gates are receivers
    // and light when their entry lands (A-06). The second write waits a full BEAT.lead rather than
    // overlapping the first, two entries written one after the other.
    lit: ['ownerEl'],
    flow: [
      request(),
      F.route({ points: DROP_A, after: 'req', lights: ['gateA'] }),
      F.route({ points: DROP_B, after: 'req', plus: BEAT.lead, lights: ['gateB'] }),
    ],
  },
  {
    id: 'held',
    duration: 3600,
    narration: 'While the list holds any entry the Pod never enters the scheduling queue, so the Scheduler runs no cycle on it and no Node is ever filtered or scored. That is not the same as unschedulable, which means every Node was tried and none fit. The metric separates the two: scheduler_pending_pods carries a queue label and this Pod is counted under gated.',
    chips: { statusChip: GATED, condChip: COND_GATED, gatesChip: '2 entries', metricChip: Q_GATED },
    wires: { req: 'no enqueue · the Scheduler is never called' },
    opacity: { ...route(false), ...gates(2) },
    sublabels: { apiEl: 'holds the Pod object', ownerEl: 'its criteria are not met yet', schedEl: 'never enqueued this Pod', gateA: HOLDS, gateB: HOLDS },
    // The Pod is the sender, so it blinks FIRST and the ball leaves at BEAT.afterPulse (M-15). It
    // reaches the first gate and stops there, which is the whole of the card in one frame.
    flow: [
      F.pulse({ pod: 'podGroup' }),
      F.route({ points: LANE_IN, delay: BEAT.afterPulse, lights: ['gateA'] }),
    ],
  },
  {
    id: 'remove-one',
    duration: 4200,
    narration: 'The component that owns example.com/bar patches it out of the list. Entries come off in any order, and this one was second, so removing it says nothing about the other. Nothing else moves: STATUS still reads SchedulingGated and PodScheduled is still False, because one entry left in the list is enough to hold the Pod out.',
    chips: { statusChip: GATED, condChip: COND_GATED, gatesChip: '1 entry', metricChip: Q_GATED },
    wires: { req: 'PATCH · remove example.com/bar' },
    opacity: { ...route(false), ...gates(1) },
    sublabels: { apiEl: 'accepts the removal', ownerEl: 'done with example.com/bar', schedEl: 'never enqueued this Pod', gateA: HOLDS, gateB: REMOVED },
    // The chip that moved is cued in the same step it moves (P-03): workloads is bound to `chips`
    // and not `chipsCued` (P-09), so the cue is a name in `lit` rather than an automatic one.
    lit: ['ownerEl', 'gatesChip'],
    // The entry is gone when the write lands on it, so the count and its sublabel wait for that.
    rewind: { chips: { gatesChip: '2 entries' }, sublabels: { gateB: HOLDS } },
    flow: [
      // The PATCH leaves the controller and the API lights on arrival, then the write drops. The
      // entry it lands on is cued like any other arrival (A-06), the same way step 1 cues the two
      // it creates, so the reader is told WHICH entry this PATCH names before it goes.
      // The cue is an F.set and NOT `lights`: `flowLights` would mirror it onto the static path,
      // where the fade below never runs to take it back, and prev would settle on a marked ghost.
      request(),
      F.route({ points: DROP_B, after: 'req', name: 'write' }),
      F.set({ lit: ['gateB'], at: 'write', chips: { gatesChip: '1 entry' }, sublabels: { gateB: REMOVED } }),
      // The fade waits a BEAT after the cue instead of starting on the same frame: at `at: 'write'`
      // the highlight arrived and dissolved together, so the entry was never lit while it was
      // still there. Now the beat reads ball, then THIS entry, then gone.
      F.fade({ target: 'gateB', at: 'write', plus: BEAT.lead, to: OPACITY.terminated, dur: FADE.out, unlight: ['gateB'] }),
      // A-13 and A-14: the write lane goes with the entry it addressed, or a full strength arrow
      // is left pointing into a ghost. The fade holds opacity 1 through the flight (A-15).
      F.fade({ target: 'dropB', at: 'write', plus: BEAT.lead, to: OPACITY.terminated, dur: FADE.out }),
    ],
  },
  {
    id: 'one-way',
    duration: 3000,
    narration: 'There is no way back. After creation the API accepts a removal and refuses an addition, so a component that lets its gate go cannot take it again, and a Pod created without gates can never be given one. Whatever wants to hold a Pod has to put the gate on at creation or lose the chance.',
    chips: { statusChip: GATED, condChip: COND_GATED, gatesChip: '1 entry', metricChip: Q_GATED },
    wires: { req: 'PATCH · an addition is refused, removal only' },
    opacity: { ...route(false), ...gates(1) },
    sublabels: { apiEl: 'refuses the addition', ownerEl: 'tries to put example.com/bar back', schedEl: 'never enqueued this Pod', gateA: HOLDS, gateB: REMOVED },
    // The one round trip on the card: the addition goes up and the refusal comes back, and nothing
    // drops. The controller sources it, so it does not light again on the return (WL.A-01), and
    // the entry still standing is lit through the step as the only thing the refusal leaves.
    lit: ['ownerEl', 'gateA'],
    flow: [
      request(),
      F.top({ from: API_R, to: OWN_X, y: RESP_Y, after: 'req' }),
    ],
  },
  {
    id: 'remove-last',
    duration: 4000,
    narration: 'The last entry goes the same way and the list is now empty. Emptying it is the whole trigger: there is no separate signal and nothing else has to happen, so the moment spec.schedulingGates has no entries left the Pod is ready to be considered for scheduling.',
    chips: { statusChip: GATED, condChip: COND_GATED, gatesChip: 'empty', metricChip: Q_GATED },
    wires: { req: 'PATCH · remove example.com/foo' },
    opacity: { ...route(false), ...gates(0) },
    sublabels: { apiEl: 'accepts the removal', ownerEl: 'done with example.com/foo', schedEl: 'never enqueued this Pod', gateA: REMOVED, gateB: REMOVED },
    lit: ['ownerEl', 'gatesChip'],
    rewind: { chips: { gatesChip: '1 entry' }, sublabels: { gateA: HOLDS } },
    flow: [
      request(),
      F.route({ points: DROP_A, after: 'req', name: 'write' }),
      F.set({ lit: ['gateA'], at: 'write', chips: { gatesChip: 'empty' }, sublabels: { gateA: REMOVED } }),
      F.fade({ target: 'gateA', at: 'write', plus: BEAT.lead, to: OPACITY.terminated, dur: FADE.out, unlight: ['gateA'] }),
      F.fade({ target: 'dropA', at: 'write', plus: BEAT.lead, to: OPACITY.terminated, dur: FADE.out }),
    ],
  },
  {
    id: 'queued',
    duration: 3800,
    narration: 'The Pod enters the active queue and the Scheduler sees it for the first time. Only the metric moves, to queue active. STATUS and PodScheduled still read SchedulingGated, because the API server wrote that condition at creation and nothing rewrites it until the Scheduler finishes an attempt. What follows is the ordinary cycle: filter the Nodes, score, and bind.',
    chips: { statusChip: GATED, condChip: COND_GATED, gatesChip: 'empty', metricChip: 'queue="active"' },
    wires: { req: 'enqueue · the Pod joins the active queue' },
    opacity: { ...route(true), ...gates(0) },
    sublabels: { apiEl: 'the list is empty', ownerEl: 'nothing left to remove', schedEl: 'filters and scores from here', gateA: REMOVED, gateB: REMOVED },
    // ONE reading turns over here and it is the metric: the STATUS column and the condition are
    // both written at creation and neither is rewritten until the Scheduler finishes an attempt.
    lit: ['metricChip'],
    // The ball crosses the spent gate assembly as one A-19 skip: it enters the first face and
    // re-emerges at the far one, which is why the route is two lanes and never one across them.
    flow: [
      F.pulse({ pod: 'podGroup' }),
      F.route({ points: LANE_IN, delay: BEAT.afterPulse, name: 'in' }),
      F.route({ points: LANE_OUT, after: 'in', lights: ['schedEl'] }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
