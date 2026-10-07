import { P, F, defineCard, strip, laneY, midX, WL, FADE, BEAT, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-pod-scheduling-gates.md

// A threshold, not the A / B / C column preset (WL.L-06): two tiers, everything but the actor row on one floor.

// Pod, gates and queue share one y and height, so one horizontal line runs through every face midpoint.
const FLOOR_Y = 340, FLOOR_H = WL.BOX_H;
const FLOOR_CY = FLOOR_Y + FLOOR_H / 2;

// The span is WL.L..WL.R exactly, so the content bbox centres on WL.CX by construction (L-13).
const POD_X = WL.L, POD_W = 240;
// RUN_W is the drawn route left of the gates, sized so the gate assembly centres on WL.CX.
const RUN_W = 120;
const GATE_W = 180, GA_X = POD_X + POD_W + RUN_W;
const GB_X = GA_X + GATE_W;  // the two gates TOUCH: they are one list
const SCH_W = 232, SCH_X = WL.R - SCH_W;

// The API on WL.SPINE_X (WL.L-07). Both writes leave as an L-12 mirrored pair at the gate
// half-width, so each drop lands on a gate top midpoint.
const API_W = 232, API_X = WL.CX - API_W / 2;
const DROP = laneY(WL.CX, GATE_W / 2);
// Every PATCH leaves the controller, the API only accepts or refuses it (A-09). Top-row pair per WL.A-01.
const OWN_W = 232, OWN_X = WL.R - OWN_W;
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const API_R = API_X + API_W;
// Built once each: the drawn lane and every ball on it index the same array (A-02).
const drop = (x) => [[x, WL.TOP_BOTTOM], [x, FLOOR_Y]];
const DROP_A = drop(DROP.out), DROP_B = drop(DROP.back);

// Nothing is drawn across the gate assembly: a ball fades at one face and re-emerges at the far one (A-19).
const LANE_IN = [[POD_X + POD_W, FLOOR_CY], [GA_X, FLOOR_CY]];
const LANE_OUT = [[GB_X + GATE_W, FLOOR_CY], [SCH_X, FLOOR_CY]];

// Two rows of two: four across is refused by WL.L-05.
const CHIP = strip({ from: WL.L, to: WL.R, count: 2, gap: 16 });
const CHIP_Y = [500, 542];
// What rides the floor is labelled under it, never on the actor row (T-22).
const ROUTE_WIRE_Y = midX(FLOOR_Y + FLOOR_H, CHIP_Y[0]) + 4;

// List order is z-order: lanes and wire labels, chips and packets, then gates, Pod, queue and API above the ball.
export const SCENE = {
  'aria-label': 'Pod scheduling gates: two named entries in spec.schedulingGates stand between a Pod and the active queue, a controller that owns them patches each one out and the API accepts removals in any order but never an addition, and the Pod joins the active queue only once the list is empty',
  parts: [
    P.defs(),
    // Every lane carries the role: there is no `.scheme-arrow-workloads` rule, so a role-less lane falls
    // to the generic dim token and reads fainter. State is opacity's job, said in route() and gates().
    P.lane({ key: 'laneIn', points: LANE_IN, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'laneOut', points: LANE_OUT, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'dropA', points: DROP_A, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'dropB', points: DROP_B, dim: true, dashed: true, role: 'cluster' }),
    // The refusal is the only thing the API sends back on this card (A-06).
    P.arrow({ key: 'reqLane', x1: OWN_X, y1: REQ_Y, x2: API_R, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ key: 'respLane', x1: API_R, y1: RESP_Y, x2: OWN_X, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WL.CX, y: WL.TOP_Y - 12 }),
    P.wire({ key: 'route', x: WL.CX, y: ROUTE_WIRE_Y }),
    P.chip({ key: 'statusChip', x: CHIP.x(0), y: CHIP_Y[0], w: CHIP.w, h: WL.CHIP_H, name: 'kubectl STATUS', value: 'SchedulingGated' }),
    P.chip({ key: 'condChip', x: CHIP.x(1), y: CHIP_Y[0], w: CHIP.w, h: WL.CHIP_H, name: 'PodScheduled', value: 'False · SchedulingGated' }),
    P.chip({ key: 'gatesChip', x: CHIP.x(0), y: CHIP_Y[1], w: CHIP.w, h: WL.CHIP_H, name: 'spec.schedulingGates', value: '2 entries' }),
    P.chip({ key: 'metricChip', x: CHIP.x(1), y: CHIP_Y[1], w: CHIP.w, h: WL.CHIP_H, name: 'scheduler_pending_pods', value: 'queue="gated"' }),
    P.packets(),
    // After the packet layer, so the ball runs under the gates it passes through.
    P.box({ key: 'gateA', x: GA_X, y: FLOOR_Y, w: GATE_W, h: FLOOR_H, label: 'example.com/foo', sublabel: 'holds the Pod', role: 'cluster' }),
    P.box({ key: 'gateB', x: GB_X, y: FLOOR_Y, w: GATE_W, h: FLOOR_H, label: 'example.com/bar', sublabel: 'holds the Pod', role: 'cluster' }),
    P.pod({
      key: 'podGroup', id: 'podGroup',
      // No inner box and no container glyph: nothing about this Pod has been placed or started.
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

const GATED = 'SchedulingGated', COND_GATED = 'False · SchedulingGated', Q_GATED = 'queue="gated"';
const HOLDS = 'holds the Pod', REMOVED = 'removed from the list';

// Sender lit at entry, the API lights on arrival. Named so a drop can chain `after` it.
const request = (name = 'req') => F.top({ from: OWN_X, to: API_R, y: REQ_Y, name, lights: ['apiEl'] });

// Route lanes take the shade of the actor at their far end, never of the gate on them (A-15 over A-13).
const route = (queued) => ({ laneIn: 1, laneOut: queued ? 1 : OPACITY.notready, schedEl: queued ? 1 : OPACITY.notready });
// The list as fields, so a gate and its chip cannot disagree. bar comes off first, so gateB leaves at
// n=1 and gateA survives it.
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
    narration: 'A Pod is created with two entries in spec.schedulingGates, and while they stand the Scheduler makes no attempt to place it. Each entry is an opaque criterion that some other component owns. A gate can only be set while the Pod is being created, by the client that posts it or by an admission plugin that mutates it on the way in.',
    chips: { statusChip: GATED, condChip: COND_GATED, gatesChip: '2 entries', metricChip: Q_GATED },
    wires: { req: 'POST Pod test-pod · a gate can be set only here' },
    opacity: { ...route(false), ...gates(2) },
    sublabels: { apiEl: 'stores the gates at creation', ownerEl: 'POSTs the Pod, two gates on it', schedEl: 'active queue', gateA: HOLDS, gateB: HOLDS },
    // Gates are receivers and light when their entry lands (A-06).
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
    narration: 'While the list holds any entry the Pod never enters the active queue, so the Scheduler runs no cycle on it and no Node is ever filtered or scored. That is not the same as unschedulable, which means a scheduling attempt was made and failed. The metric separates the two: scheduler_pending_pods carries a queue label and this Pod is counted under gated.',
    chips: { statusChip: GATED, condChip: COND_GATED, gatesChip: '2 entries', metricChip: Q_GATED },
    wires: { route: 'not in the active queue · no cycle runs' },
    opacity: { ...route(false), ...gates(2) },
    sublabels: { apiEl: 'holds the Pod object', ownerEl: 'its criteria are not met yet', schedEl: 'no attempt on this Pod', gateA: HOLDS, gateB: HOLDS },
    // The Pod is the sender: it blinks first and the ball leaves at BEAT.afterPulse (M-15).
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
    sublabels: { apiEl: 'accepts the removal', ownerEl: 'done with example.com/bar', schedEl: 'no attempt on this Pod', gateA: HOLDS, gateB: REMOVED },
    // Cued in the step it moves (P-03). This card writes `chips`, not `chipsCued` (P-09), so the cue goes in `lit`.
    lit: ['ownerEl', 'gatesChip'],
    rewind: { chips: { gatesChip: '2 entries' }, sublabels: { gateB: HOLDS } },
    flow: [
      // The cue is an F.set and NOT `lights`: flowLights would mirror it onto the static path, where the
      // fade never runs to take it back.
      request(),
      F.route({ points: DROP_B, after: 'req', name: 'write' }),
      F.set({ lit: ['gateB'], at: 'write', chips: { gatesChip: '1 entry' }, sublabels: { gateB: REMOVED } }),
      // The fade waits a BEAT after the cue so the entry is seen lit before it goes.
      F.fade({ target: 'gateB', at: 'write', plus: BEAT.lead, to: OPACITY.terminated, dur: FADE.out, unlight: ['gateB'] }),
      // A-13, A-14: the write lane goes with the entry it addressed. It holds opacity 1 through the flight (A-15).
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
    sublabels: { apiEl: 'refuses the addition', ownerEl: 'tries to put example.com/bar back', schedEl: 'no attempt on this Pod', gateA: HOLDS, gateB: REMOVED },
    // The controller sources the round trip, so it does not light again on the return (WL.A-01).
    lit: ['ownerEl', 'gateA'],
    flow: [
      request(),
      F.top({ from: API_R, to: OWN_X, y: RESP_Y, after: 'req' }),
    ],
  },
  {
    id: 'remove-last',
    duration: 4000,
    narration: 'The last entry goes the same way and the list is now empty. Emptying it is the whole trigger: there is no separate signal and nothing else has to happen, so the moment spec.schedulingGates has no entries left this Pod is ready to be considered for scheduling.',
    chips: { statusChip: GATED, condChip: COND_GATED, gatesChip: 'empty', metricChip: Q_GATED },
    wires: { req: 'PATCH · remove example.com/foo' },
    opacity: { ...route(false), ...gates(0) },
    sublabels: { apiEl: 'accepts the removal', ownerEl: 'done with example.com/foo', schedEl: 'no attempt on this Pod', gateA: REMOVED, gateB: REMOVED },
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
    narration: 'The Pod joins the active queue, and the Scheduler can now make its first attempt at it. Only the metric moves, to queue active. STATUS and PodScheduled still read SchedulingGated, because the API server wrote that condition at creation and nothing rewrites it until the Scheduler finishes an attempt. What follows is the ordinary cycle: filter the Nodes, score, and bind.',
    chips: { statusChip: GATED, condChip: COND_GATED, gatesChip: 'empty', metricChip: 'queue="active"' },
    wires: { route: 'enqueue · the Pod joins the active queue' },
    opacity: { ...route(true), ...gates(0) },
    sublabels: { apiEl: 'the list is empty', ownerEl: 'nothing left to remove', schedEl: 'filters and scores from here', gateA: REMOVED, gateB: REMOVED },
    // Only the metric turns over: STATUS and the condition are not rewritten until a Scheduler attempt.
    lit: ['metricChip'],
    // The ball crosses the spent gate assembly as one A-19 skip.
    flow: [
      F.pulse({ pod: 'podGroup' }),
      F.route({ points: LANE_IN, delay: BEAT.afterPulse, name: 'in' }),
      F.route({ points: LANE_OUT, after: 'in', lights: ['schedEl'] }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
