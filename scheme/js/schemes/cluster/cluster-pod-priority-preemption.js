import { P, F, defineCard, laneY, ladder, strip, spread, midX, shade, CLU, LAYOUT, FADE, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS.md#cluster-pod-priority-preemption

// Layout C. Panel x<=397 y<=280 against NODE_Y 404, and the CEILING is 360 characters per narration,
// the tightest in the category. Growth costs about 0.5 units of panel per character.

// The category X grammar, restated locally: same numbers as CLU.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CONTENT_W = CONTENT_R - CONTENT_L;                 // 1080
const CX = midX(CONTENT_L, CONTENT_R);                   // 600, the canvas centre by construction

// Scheduler leads the row and is centred on CX, so the lane to the Node leaves its bottom
// midpoint and clears the pipeline column.
const TOP_Y = CLU.TOP_Y, BOX_H = CLU.BOX_H, TOP_BOTTOM = TOP_Y + BOX_H;   // 40 / 80 / 120
const TOP1_X = 420, TOP1_W = 2 * (CX - 420);             // 420..780, centred on CX
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = CONTENT_R - (TOP1_X + TOP1_W + TOP_GAP);
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);                  // 80
const LANE_DY = CLU.LANE_DY;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, LANE_DY);   // 68 / 92
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);            // 810

const LAD_X = LAYOUT.C.ladder.x, LAD_W = LAYOUT.C.ladder.w;   // 660..1140, the pipeline
const LAD_Y = 150;                                       // 5 rows -> 150..350
const ROW_H = CLU.ROW_H, ROW_GAP = CLU.ROW_GAP;

// Chips two across, 532 wide: four across was 258 and every name ran into its own value.
const CHIP_COLS = 2, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_H = CLU.CHIP_H;
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;                               // 532, which is LAYOUT.C.strip.two
const CHIPS_Y = 548;                                     // 2 rows -> 548..582 / 590..624
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// The strip is read as a GRID: the index wraps across the two columns and steps down every second.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

const NODE_Y = 404, NODE_H = 128;                        // 404..532, clear of the panel
const POD_W = 300, POD_H = 82, POD_Y = NODE_Y + CLU.NODE.POD_DY;   // 438..520
const POD_PAD = 24;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 24, h: 46 };

// Pod slots spread across the frame's inner width, so the row centres on CX.
const SLOT_N = 3, SLOT_W = POD_W;
const SLOT_X = spread({ from: CONTENT_L + POD_PAD, to: CONTENT_R - POD_PAD, count: SLOT_N, w: SLOT_W }).x;
const SLOT_CX = i => SLOT_X(i) + SLOT_W / 2;             // 234 / 600 / 966

// Everything the Scheduler sends down addresses slot 0: the victim it preempts and the slot Pod NEW
// is bound into. Wire and ball are built from this one array.
const BUS_Y = NODE_Y + 12;
const VICTIM_SLOT = 0;
// TWO lanes, because two actors reach that slot and a ball must leave the one that ACTS: the
// Scheduler scans, the API is what the Node then acts on. Both share the drop, one tree, two sources.
const TOP2_CX = midX(TOP2_X, TOP2_X + TOP2_W);           // 990
const JOG_Y = TOP_BOTTOM + 20;                           // 140, below the boxes, above the pipeline
const SCAN_LANE = [[CX, TOP_BOTTOM], [CX, BUS_Y], [SLOT_CX(VICTIM_SLOT), BUS_Y], [SLOT_CX(VICTIM_SLOT), POD_Y]];
const NODE_LANE = [[TOP2_CX, TOP_BOTTOM], [TOP2_CX, JOG_Y], [CX, JOG_Y], [CX, BUS_Y], [SLOT_CX(VICTIM_SLOT), BUS_Y], [SLOT_CX(VICTIM_SLOT), POD_Y]];

// Slot 0 carries two identities, which is why both Pods sit on SLOT_X(0): Pod A is the victim, and
// Pod NEW is bound into the slot Pod A frees. The violet tint comes from the kit binding.
const PODS = [
  { key: 'pod1',   label: 'Pod A',   sub: 'priority: 100',  slot: 0 },
  { key: 'pod2',   label: 'Pod B',   sub: 'priority: 1000', slot: 1 },
  { key: 'pod3',   label: 'Pod C',   sub: 'priority: 100',  slot: 2 },
  { key: 'podNew', label: 'Pod NEW', sub: 'priority: 2e9',  slot: 0, opacity: 0 },
];

// The list order IS the append order, so it is the z-order. The Node frame is a 70% opaque fill, so
// the lane legs inside it and the ball riding them are appended AFTER it, and the Pods above those.
export const SCENE = {
  'aria-label': 'Pod priority and preemption: scheduler preempts the lowest-priority victim to make room for a high-priority Pod on a full Node',
  parts: [
    P.defs(),
    P.arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true }),
    // The answer lane is a relationship here, not a route: no step on this card names anything
    // travelling back from the API, so it carries no arrowhead and sits behind the live lane.
    P.relation({ points: [[TOP2_X, RESP_Y], [TOP1_X + TOP1_W, RESP_Y]] }),
    P.wire({ key: 'req', x: WIRE_X, y: TOP_Y - 12 }),
    P.chip({ key: 'newPodChip',  x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'Pod NEW · pri', value: '2e9 (system-cluster-critical)' }),
    P.chip({ key: 'attemptChip', x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'sched attempt',      value: 'none' }),
    P.chip({ key: 'victimChip',  x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'victim',             value: 'none' }),
    P.chip({ key: 'focusChip',   x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'focus',              value: 'none' }),
    P.node({ key: 'nodeEl', x: CONTENT_L, y: NODE_Y, w: CONTENT_W, h: NODE_H, label: 'Node-1' }),
    P.lane({ key: 'connector', points: SCAN_LANE, dim: true, dashed: true }),
    P.lane({ points: NODE_LANE, dim: true, dashed: true }),
    P.packets(),
    P.chain({
      key: 'chain', x: LAD_X, y: LAD_Y, w: LAD_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. spec    ·  priorityClassName → spec.priority',
        '2. attempt ·  filter · NoFit on every node',
        '3. preempt ·  find min-priority victim set',
        '4. delete  ·  standard DELETE · PDB best effort',
        '5. bind    ·  nominatedNodeName → bind freed slot',
      ],
    }),
    // Bare `g` wrappers with no class of their own: the id is what tells one Pod's shell and inner
    // box from the next one's, and it is what the fades and the opacity pins address.
    ...PODS.map(d => P.pod({
      key: d.key, id: d.key, innerKey: `${d.key}Box`, opacity: d.opacity,
      x: SLOT_X(d.slot), y: POD_Y, w: SLOT_W, h: POD_H, label: d.label, sublabel: '', containers: 0,
      inner: { ...POD_INNER, label: 'app', sublabel: d.sub },
    })),
    // Top-row blocks ABSOLUTE LAST.
    P.box({ key: 'apiserver', x: TOP2_X, y: TOP_Y, w: TOP2_W, h: BOX_H, label: 'API', sublabel: 'PriorityClass + delete + bind' }),
    P.box({ key: 'scheduler', x: TOP1_X, y: TOP_Y, w: TOP1_W, h: BOX_H, label: 'Scheduler', sublabel: 'filter + score + preempt' }),
  ],
  // All four Pods DO go to clearHighlights: this card pulses three of them across the steps and the
  // pulse has to be taken back off between them.
  reset: {
    keys: ['scheduler', 'apiserver', 'newPodChip', 'attemptChip', 'victimChip', 'focusChip', 'pod1Box', 'pod2Box', 'pod3Box', 'podNewBox'],
    pods: ['pod1', 'pod2', 'pod3', 'podNew'],
  },
};

const NEW_PRI = '2e9 (system-cluster-critical)';
// Every step writes all four Pod shades, so a Pod that is still standing says so rather than
// inheriting it: STANDING is the row before preemption, and the last two steps override it.
const STANDING = { ...shade(['pod1', 'pod2', 'pod3'], 1), podNew: 0 };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { newPodChip: NEW_PRI, attemptChip: 'none', victimChip: 'none', focusChip: 'none' },
    opacity: STANDING,
    chain: -1,
  },
  {
    id: 'spec',
    duration: 1900,
    narration: 'Pod NEW arrives at the API. The Priority admission plugin resolves spec.priorityClassName to a number, system-cluster-critical being 2000000000, and writes it into spec.priority. That plugin rejects a spec.priority differing from the one it computed, so PriorityClass is the only route. The other built-in class, system-node-critical, is slightly higher.',
    chips: { newPodChip: NEW_PRI, attemptChip: 'pending', victimChip: 'none', focusChip: 'priority resolved at admission' },
    wires: { req: 'PriorityClass admission · spec.priority=2e9' },
    opacity: STANDING,
    // Admission resolves the priority in place, nothing travels: the changed chips
    // take the static highlight only, no flash (info chips do not pulse).
    lit: ['attemptChip', 'focusChip', 'apiserver', 'newPodChip'],
    chain: 0,
  },
  {
    id: 'attempt',
    duration: 2000,
    narration: 'Scheduler takes Pod NEW off its queue and runs a scheduling cycle. Filter plugins drop every Node failing a predicate (taints, ports, requests against allocatable), and here all of them fail on capacity, so Pod NEW is recorded Unschedulable. The default preemptionPolicy=PreemptLowerPriority opens preemption mode. A class set to Never would leave it queued.',
    chips: { newPodChip: NEW_PRI, attemptChip: 'NoFit on all nodes', victimChip: 'none', focusChip: 'Unschedulable · entering preempt mode' },
    wires: { req: 'filter all nodes · NoFit · Event FailedScheduling' },
    opacity: STANDING,
    // The scheduling cycle fails inside the Scheduler, nothing travels: the verdict
    // chips take the static highlight only, no flash (info chips do not pulse).
    lit: ['focusChip', 'scheduler', 'attemptChip'],
    chain: 1,
  },
  {
    id: 'preempt',
    duration: 2600,
    narration: 'Preemption scans the running Pods on each Node for the smallest victim set whose deletion lets Pod NEW fit, every victim at strictly lower priority, lowest tried first. Pod A at 100 is enough alone: freeing its 1 CPU and 1Gi memory matches the Pod NEW requests. Pod C is also 100 but unneeded, and Pod B at 1000 is a candidate the greedy order never reaches.',
    chips: { newPodChip: NEW_PRI, attemptChip: 'preempt mode', victimChip: 'Pod A · priority 100', focusChip: 'min victim set · smallest, lowest pri' },
    wires: { req: 'preempt scan · Victim set: {Pod A}' },
    opacity: STANDING,
    lit: ['attemptChip', 'focusChip', 'scheduler', 'victimChip'],
    chain: 2,
    // Scheduler scans the node over the connector to find the victim set.
    // Pod A pulses when the scan reaches it (victim flagged in victimChip).
    flow: [
      F.route({ points: SCAN_LANE, name: 'scan' }),
      F.pulse({ pod: 'pod1', at: 'scan' }),
    ],
  },
  {
    id: 'delete',
    // The node-band ball now leaves the API rather than the Scheduler, which is 390 units
    // further along and 867ms slower end to end: 3400 cut it off mid-flight.
    duration: 4200,
    narration: 'Scheduler sends a standard DELETE for Pod A, not an eviction, so PodDisruptionBudget gates are bypassed, though victim choice prefers PDB-friendly sets. Pod A enters Terminating for its terminationGracePeriodSeconds: preStop, SIGTERM, SIGKILL. Pod NEW gets status.nominatedNodeName=Node-1, a hint, not a reservation: a higher priority Pod can still take it.',
    chips: { newPodChip: NEW_PRI, attemptChip: 'preempt · nominated Node-1', victimChip: 'Pod A · Terminating', focusChip: 'standard DELETE · PDB best effort' },
    wires: { req: 'DELETE .../pods/pod-a · Graceful · nominatedNodeName=Node-1' },
    // Pin final state inline so cancel does not flash to default. Pod A is Terminating here, as
    // the victim chip says in words, so it keeps its slot at that shade.
    opacity: { ...STANDING, pod1: OPACITY.terminating },
    lit: ['attemptChip', 'focusChip', 'scheduler', 'victimChip'],
    chain: 3,
    // DELETE hits the apiserver (top hop), then travels down the connector.
    // Pod A pulses and sinks to Terminating only when the DELETE reaches the node.
    flow: [
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'del', lights: ['apiserver'] }),
      F.route({ points: NODE_LANE, after: 'del', fadeIn: true, name: 'evict' }),
      F.pulse({ pod: 'pod1', at: 'evict' }),
      F.fade({ target: 'pod1', to: OPACITY.terminating, dur: FADE.out, at: 'evict' }),
    ],
  },
  {
    id: 'bind',
    // The node-band ball now leaves the API rather than the Scheduler, which is 390 units
    // further along and 867ms slower end to end: 3400 cut it off mid-flight.
    duration: 4200,
    narration: 'Pod A exited gracefully, its capacity back on Node-1. Scheduler retries Pod NEW, Filter and Score now pass, and it binds to Node-1. The controller owning Pod A puts a replacement elsewhere or queues it. This is not node-pressure eviction, covered separately, where Kubelet evicts over-request Pods first, BestEffort leading, and priority only orders the queue.',
    chips: { newPodChip: NEW_PRI, attemptChip: 'bound to Node-1', victimChip: 'Pod A · gone', focusChip: 'nominatedNodeName cleared' },
    wires: { req: 'POST .../pods/pod-new/binding · Node-1' },
    // Pin final state.
    opacity: { ...STANDING, pod1: 0, podNew: 1 },
    lit: ['victimChip', 'focusChip', 'scheduler', 'attemptChip'],
    chain: 4,
    // Bind hits the apiserver (top hop), then travels down the connector.
    // Pod NEW pulses once (pulse fades) and materializes in the freed slot when the bind reaches the node.
    flow: [
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'bind', lights: ['apiserver'] }),
      F.route({ points: NODE_LANE, after: 'bind', fadeIn: true, name: 'place' }),
      F.pulse({ pod: 'podNew', at: 'place' }),
      F.fade({ target: 'podNew', from: 0, to: 1, dur: FADE.in, at: 'place', easing: 'ease-out' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
