import { P, F, defineCard, ladder, strip, spread, midX, shade, CLU, LAYOUT, BEAT, FADE, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-pod-priority-preemption.md

// Layout C, ladder right, Node frame under the panel. Panel x<=397 y<=280, frame top 380: clear by
// 100. The shape is cluster-node-drain's, and the numbers below are the same ones.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CONTENT_W = CONTENT_R - CONTENT_L;                 // 1080
const CX = midX(CONTENT_L, CONTENT_R);                   // 600, the canvas centre by construction

// The API is centred on the Node frame so the one lane down is a straight drop, and the Scheduler
// sits to its RIGHT rather than its left. Why that side: ./CARDS/cluster-pod-priority-preemption.md, the LAYOUT block.
const BOX_W = CLU.BOX_W, BOX_H = CLU.BOX_H;              // 232 / 80
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;     // 40 / 120
const API_X = CX - BOX_W / 2, API_R = API_X + BOX_W;     // 484..716, centred on the Node frame
const API_CX = midX(API_X, API_R);                       // 600
// Right-aligned to the content edge, so the top row ends on the same vertical as the ladder, the
// chip strip and the Node frame below it. Why that side and that edge: ./CARDS/cluster-pod-priority-preemption.md, the LAYOUT block.
const SCHED_X = CONTENT_R - BOX_W;                       // 908..1140, the face every top hop leaves from
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);                  // 80, the box centre line, and the lane on it
const WIRE_X = midX(API_R, SCHED_X);                     // 812, the gap midpoint
const WIRE_Y = TOP_Y - 14;                               // 26, above the row: the drop owns below it

const LAD_X = LAYOUT.C.ladder.x, LAD_W = LAYOUT.C.ladder.w;   // 660..1140, right of the drop
const LAD_Y = 170;                                       // 5 rows -> 170..370
const ROW_H = CLU.ROW_H, ROW_GAP = CLU.ROW_GAP;

const NODE_Y = 380, NODE_H = CLU.NODE.H;                 // 380..532, the family frame
const POD_W = 300, POD_H = CLU.NODE.POD_H, POD_Y = NODE_Y + CLU.NODE.POD_DY;   // 414..520
const POD_PAD = 24;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };

// Pod slots spread across the frame's inner width, so the row centres on CX.
const SLOT_N = 3, SLOT_W = POD_W;
const SLOT_X = spread({ from: CONTENT_L + POD_PAD, to: CONTENT_R - POD_PAD, count: SLOT_N, w: SLOT_W }).x;

// Chips two across, 532 wide: four across was 258 and every name ran into its own value.
const CHIP_COLS = 2, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_H = CLU.CHIP_H;
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;                               // 532, which is LAYOUT.C.strip.two
const CHIPS_Y = NODE_Y + NODE_H + 16;                    // 548, second row ends on 624
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// The strip is read as a GRID: the index wraps across the two columns and steps down every second.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

// ONE lane, addressed to the Node rather than a Pod inside it: a single vertical drop, both
// endpoints on face midpoints. It leaves the API, not the Scheduler, because the API is what acts.
const NODE_LANE = [[API_CX, TOP_BOTTOM], [API_CX, NODE_Y]];

// Slot 0 carries two identities, which is why both Pods sit on SLOT_X(0): Pod A is the victim, and
// Pod NEW is bound into the slot Pod A frees. The violet tint comes from the kit binding.
const PODS = [
  { key: 'pod1',   label: 'Pod A',   sub: 'priority: 100',  slot: 0 },
  { key: 'pod2',   label: 'Pod B',   sub: 'priority: 1000', slot: 1 },
  { key: 'pod3',   label: 'Pod C',   sub: 'priority: 100',  slot: 2 },
  { key: 'podNew', label: 'Pod NEW', sub: 'priority: 2e9',  slot: 0, opacity: 0 },
];

// The list order IS the append order, so it is the z-order: the two top lanes and the wire label,
// the four chips, the one drop, the packet layer, the ladder, the Node frame and its Pods.
export const SCENE = {
  'aria-label': 'Pod priority and preemption: Scheduler preempts the lowest-priority victim to make room for a high-priority Pod on a full Node',
  parts: [
    P.defs(),
    // ONE top lane, on the box centre line rather than the pair 13 cluster cards draw: every step
    // sends the Scheduler to the API and none names an answer, so the back half would ride nothing.
    P.arrow({ x1: SCHED_X, y1: TOP_CY, x2: API_R, y2: TOP_CY, dim: true, dashed: true }),
    P.wire({ key: 'req', x: WIRE_X, y: WIRE_Y }),
    P.chip({ key: 'newPodChip',  x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'Pod NEW · pri', value: '2e9 (system-cluster-critical)' }),
    P.chip({ key: 'attemptChip', x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'sched attempt',      value: 'none' }),
    P.chip({ key: 'victimChip',  x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'victim',             value: 'none' }),
    P.chip({ key: 'focusChip',   x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'focus',              value: 'none' }),
    // One lane, and it ends on the Node frame: the DELETE and the bind are addressed to a Pod on
    // this Node, and which Pod that is comes from the pulse, not from a tap into the Pod row.
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
    P.node({ key: 'nodeEl', x: CONTENT_L, y: NODE_Y, w: CONTENT_W, h: NODE_H, label: 'Node-1' }),
    // Bare `g` wrappers with no class of their own: the id is what tells one Pod's shell and inner
    // box from the next one's, and it is what the fades and the opacity pins address.
    ...PODS.map(d => P.pod({
      key: d.key, id: d.key, innerKey: `${d.key}Box`, opacity: d.opacity,
      x: SLOT_X(d.slot), y: POD_Y, w: SLOT_W, h: POD_H, label: d.label, sublabel: '', containers: 0,
      inner: { ...POD_INNER, label: 'app', sublabel: d.sub },
    })),
    // Top-row blocks ABSOLUTE LAST.
    P.box({ key: 'apiserver', x: API_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'API', sublabel: 'PriorityClass + delete + bind' }),
    P.box({ key: 'scheduler', x: SCHED_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Scheduler', sublabel: 'filter + score + preempt' }),
  ],
  // All four Pods DO go to clearHighlights: this card pulses three of them across the steps and the
  // pulse has to be taken back off between them.
  reset: {
    keys: ['scheduler', 'apiserver', 'newPodChip', 'attemptChip', 'victimChip', 'focusChip', 'pod1Box', 'pod2Box', 'pod3Box', 'podNewBox'],
    pods: ['pod1', 'pod2', 'pod3', 'podNew'],
  },
};

// The lane ends on the Node frame, which is on screen for the whole card, so it never has to be
// pinned to the presence of a Pod: nothing it points at can go away under it.

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
    // Durations are aligned PER STEP TYPE to the measured cluster averages, not to a reading pace:
    // still steps 2400 against a mean of 2393, moving steps to the mean tail. Numbers: ./CARDS/cluster-pod-priority-preemption.md.
    id: 'spec',
    duration: 2400,
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
    duration: 2400,
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
    narration: 'Preemption scans the running Pods on each Node for the smallest victim set whose deletion lets Pod NEW fit, every victim at strictly lower priority, the more important ones reprieved first. Pod A at 100 is enough alone: freeing its 1 CPU and 1Gi memory matches the Pod NEW requests. Pod C is also 100 but unneeded, and Pod B at 1000 is a candidate the greedy order never reaches.',
    chips: { newPodChip: NEW_PRI, attemptChip: 'preempt mode', victimChip: 'Pod A · priority 100', focusChip: 'min victim set · smallest, lowest pri' },
    wires: { req: 'preempt scan · Victim set: {Pod A}' },
    opacity: STANDING,
    lit: ['attemptChip', 'focusChip', 'scheduler', 'victimChip'],
    chain: 2,
    // NO ball: victim selection reads the Scheduler's own cached node state and nothing travels
    // (M-10). ONE pulse, on the victim, the same thing it means on the two steps after this.
    flow: [F.pulse({ pod: 'pod1', delay: BEAT.lead })],
  },
  {
    id: 'delete',
    duration: 2800,
    narration: 'Scheduler sends a standard DELETE for Pod A, not an eviction, so PodDisruptionBudget gates are bypassed, though victim choice prefers PDB-friendly sets. Pod A enters Terminating for its terminationGracePeriodSeconds: preStop, SIGTERM, SIGKILL. Pod NEW gets status.nominatedNodeName=Node-1, reserved but not guaranteed: a higher priority Pod can still take it.',
    chips: { newPodChip: NEW_PRI, attemptChip: 'preempt · nominated Node-1', victimChip: 'Pod A · Terminating', focusChip: 'standard DELETE · PDB best effort' },
    wires: { req: 'DELETE .../pods/pod-a · Graceful · nominatedNodeName=Node-1' },
    // What step 3 left. At entry these would have Pod A Terminating before the DELETE has left.
    rewind: { chips: { attemptChip: 'preempt mode', victimChip: 'Pod A · priority 100' } },
    // Pin final state inline so cancel does not flash to default. Pod A is Terminating here, as
    // the victim chip says in words, so it keeps its slot at that shade.
    opacity: { ...STANDING, pod1: OPACITY.terminating },
    lit: ['attemptChip', 'focusChip', 'scheduler', 'victimChip'],
    chain: 3,
    // DELETE hits the apiserver (top hop), then drops to the Node frame.
    // Pod A pulses and sinks to Terminating only when the DELETE reaches the node.
    flow: [
      F.top({ from: SCHED_X, to: API_R, y: TOP_CY, name: 'del', lights: ['apiserver'] }),
      // nominatedNodeName is a field on the Pod object, so it turns over where it is written.
      F.set({ at: 'del', chips: { attemptChip: 'preempt · nominated Node-1' } }),
      F.route({ points: NODE_LANE, after: 'del', fadeIn: true, name: 'evict' }),
      // The victim reads Terminating on the same beat the Pod sinks to that shade, never before.
      F.set({ at: 'evict', chips: { victimChip: 'Pod A · Terminating' } }),
      F.pulse({ pod: 'pod1', at: 'evict' }),
      F.fade({ target: 'pod1', to: OPACITY.terminating, dur: FADE.out, at: 'evict' }),
    ],
  },
  {
    id: 'bind',
    duration: 2800,
    narration: 'Pod A exited gracefully, its capacity back on Node-1. Scheduler retries Pod NEW, Filter and Score now pass, and it binds to Node-1. The controller owning Pod A puts a replacement elsewhere or queues it. This is not node-pressure eviction, covered separately, where Kubelet ranks by over-request first, then Priority, then how far over the request each sits.',
    chips: { newPodChip: NEW_PRI, attemptChip: 'bound to Node-1', victimChip: 'Pod A · gone', focusChip: 'nominatedNodeName cleared' },
    wires: { req: 'POST .../pods/pod-new/binding · Node-1' },
    // victimChip is NOT wound back: Pod A left during the grace period the previous step narrated.
    rewind: { chips: { attemptChip: 'preempt · nominated Node-1', focusChip: 'standard DELETE · PDB best effort' } },
    // Pin final state.
    opacity: { ...STANDING, pod1: 0, podNew: 1 },
    lit: ['victimChip', 'focusChip', 'scheduler', 'attemptChip'],
    chain: 4,
    // Bind hits the apiserver (top hop), then drops to the Node frame.
    // Pod NEW pulses once (pulse fades) and materializes in the freed slot when the bind arrives.
    flow: [
      F.top({ from: SCHED_X, to: API_R, y: TOP_CY, name: 'bind', lights: ['apiserver'] }),
      // The API binds and drops the hint in one write, so both chips turn over where it lands.
      F.set({ at: 'bind', chips: { attemptChip: 'bound to Node-1', focusChip: 'nominatedNodeName cleared' } }),
      F.route({ points: NODE_LANE, after: 'bind', fadeIn: true, name: 'place' }),
      F.pulse({ pod: 'podNew', at: 'place' }),
      F.fade({ target: 'podNew', from: 0, to: 1, dur: FADE.in, at: 'place', easing: 'ease-out' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
