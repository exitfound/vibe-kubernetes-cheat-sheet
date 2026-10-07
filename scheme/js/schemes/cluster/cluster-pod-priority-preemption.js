import { P, F, defineCard, ladder, strip, spread, midX, shade, CLU, LAYOUT, BEAT, FADE, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-pod-priority-preemption.md

// Layout C, ladder right, Node frame under the panel: the cluster-node-drain shape.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;
const CONTENT_W = CONTENT_R - CONTENT_L;
const CX = midX(CONTENT_L, CONTENT_R);

// The API is centred on the Node frame so the one lane down is a straight drop, the Scheduler sits right of it.
const BOX_W = CLU.BOX_W, BOX_H = CLU.BOX_H;
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;
const API_X = CX - BOX_W / 2, API_R = API_X + BOX_W;  // centred on the Node frame
const API_CX = midX(API_X, API_R);
// Right-aligned to the content edge, on the same vertical as the ladder, chips and frame.
const SCHED_X = CONTENT_R - BOX_W;  // the face every top hop leaves from
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);  // the box centre line, and the lane on it
const WIRE_X = midX(API_R, SCHED_X);
const WIRE_Y = TOP_Y - 14;  // above the row: the drop owns below it

const LAD_X = LAYOUT.C.ladder.x, LAD_W = LAYOUT.C.ladder.w;  // right of the drop
const LAD_Y = 170;
const ROW_H = CLU.ROW_H, ROW_GAP = CLU.ROW_GAP;

const NODE_Y = 380, NODE_H = CLU.NODE.H;  // the family frame
const POD_W = 300, POD_H = CLU.NODE.POD_H, POD_Y = NODE_Y + CLU.NODE.POD_DY;
const POD_PAD = 24;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };

// Pod slots spread across the frame inner width, so the row centres on CX.
const SLOT_N = 3, SLOT_W = POD_W;
const SLOT_X = spread({ from: CONTENT_L + POD_PAD, to: CONTENT_R - POD_PAD, count: SLOT_N, w: SLOT_W }).x;

// Chips two across: four across runs every name into its value.
const CHIP_COLS = 2, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_H = CLU.CHIP_H;
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;
const CHIPS_Y = NODE_Y + NODE_H + 16;
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// The strip is a grid: the index wraps across the columns and steps down every second.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

// One lane, addressed to the Node, leaving the API because the API is what acts.
const NODE_LANE = [[API_CX, TOP_BOTTOM], [API_CX, NODE_Y]];

// Slot 0 carries two identities: Pod NEW binds into the slot Pod A frees.
const PODS = [
  { key: 'pod1',   label: 'Pod A',   sub: 'priority: 100',  slot: 0 },
  { key: 'pod2',   label: 'Pod B',   sub: 'priority: 1000', slot: 1 },
  { key: 'pod3',   label: 'Pod C',   sub: 'priority: 100',  slot: 2 },
  { key: 'podNew', label: 'Pod NEW', sub: 'priority: 2e9',  slot: 0, opacity: 0 },
];

// Append order is z-order: top lane and wire, chips, the drop, packets, ladder, Node frame and Pods.
export const SCENE = {
  'aria-label': 'Pod priority and preemption: Scheduler preempts the lowest-priority victim to make room for a high-priority Pod on a full Node',
  parts: [
    P.defs(),
    // One top lane on the centre line: every step sends Scheduler to API and none names an answer.
    P.arrow({ x1: SCHED_X, y1: TOP_CY, x2: API_R, y2: TOP_CY, dim: true, dashed: true }),
    P.wire({ key: 'req', x: WIRE_X, y: WIRE_Y }),
    P.chip({ key: 'newPodChip',  x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'Pod NEW · pri', value: '2e9 (system-cluster-critical)' }),
    P.chip({ key: 'attemptChip', x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'sched attempt',      value: 'none' }),
    P.chip({ key: 'victimChip',  x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'victim',             value: 'none' }),
    P.chip({ key: 'focusChip',   x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'focus',              value: 'none' }),
    // Ends on the Node frame: which Pod is addressed comes from the pulse, not a tap into the Pod row.
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
    // The id tells one Pod's shell and inner box from the next, and is what fades and pins address.
    ...PODS.map(d => P.pod({
      key: d.key, id: d.key, innerKey: `${d.key}Box`, opacity: d.opacity,
      x: SLOT_X(d.slot), y: POD_Y, w: SLOT_W, h: POD_H, label: d.label, sublabel: '', containers: 0,
      inner: { ...POD_INNER, label: 'app', sublabel: d.sub },
    })),
    // Top-row blocks last.
    P.box({ key: 'apiserver', x: API_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'API', sublabel: 'PriorityClass + delete + bind' }),
    P.box({ key: 'scheduler', x: SCHED_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Scheduler', sublabel: 'filter + score + preempt' }),
  ],
  // All four Pods go to clearHighlights, since the pulse has to come off between steps.
  reset: {
    keys: ['scheduler', 'apiserver', 'newPodChip', 'attemptChip', 'victimChip', 'focusChip', 'pod1Box', 'pod2Box', 'pod3Box', 'podNewBox'],
    pods: ['pod1', 'pod2', 'pod3', 'podNew'],
  },
};

const NEW_PRI = '2e9 (system-cluster-critical)';
// Every step writes all four Pod shades: STANDING is the row before preemption.
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
    duration: 2400,
    narration: 'Pod NEW arrives at the API. The Priority admission plugin resolves spec.priorityClassName to a number, system-cluster-critical being 2000000000, and writes it into spec.priority. That plugin rejects a spec.priority differing from the one it computed, so PriorityClass is the only route. The other built-in class, system-node-critical, is slightly higher.',
    chips: { newPodChip: NEW_PRI, attemptChip: 'pending', victimChip: 'none', focusChip: 'priority resolved at admission' },
    wires: { req: 'PriorityClass admission · spec.priority=2e9' },
    opacity: STANDING,
    // Admission resolves in place, nothing travels: static highlight only.
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
    // The cycle fails inside the Scheduler, nothing travels: static highlight only.
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
    // No ball: victim selection reads the Scheduler's own cache (M-10). One pulse, on the victim.
    flow: [F.pulse({ pod: 'pod1', delay: BEAT.lead })],
  },
  {
    id: 'delete',
    duration: 2800,
    narration: 'Scheduler sends a standard DELETE for Pod A, not an eviction, so PodDisruptionBudget gates are bypassed, though victim choice prefers PDB-friendly sets. Pod A enters Terminating for its terminationGracePeriodSeconds: preStop, SIGTERM, SIGKILL. Pod NEW gets status.nominatedNodeName=Node-1, reserved but not guaranteed: a higher priority Pod can still take it.',
    chips: { newPodChip: NEW_PRI, attemptChip: 'preempt · nominated Node-1', victimChip: 'Pod A · Terminating', focusChip: 'standard DELETE · PDB best effort' },
    wires: { req: 'DELETE .../pods/pod-a · Graceful · nominatedNodeName=Node-1' },
    // At entry these would have Pod A Terminating before the DELETE has left.
    rewind: { chips: { attemptChip: 'preempt mode', victimChip: 'Pod A · priority 100' } },
    // Do not pin Pod A to 0: a Pod inside its grace period is present, not absent. It leaves on the bind step.
    opacity: { ...STANDING, pod1: OPACITY.terminating },
    lit: ['attemptChip', 'focusChip', 'scheduler', 'victimChip'],
    chain: 3,
    // Pod A pulses and sinks to Terminating only when the DELETE reaches the Node.
    flow: [
      F.top({ from: SCHED_X, to: API_R, y: TOP_CY, name: 'del', lights: ['apiserver'] }),
      // nominatedNodeName is a field on the Pod object, so it turns over where it is written.
      F.set({ at: 'del', chips: { attemptChip: 'preempt · nominated Node-1' } }),
      F.route({ points: NODE_LANE, after: 'del', fadeIn: true, name: 'evict' }),
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
    // victimChip is not wound back: Pod A left during the previous step's grace period.
    rewind: { chips: { attemptChip: 'preempt · nominated Node-1', focusChip: 'standard DELETE · PDB best effort' } },
    opacity: { ...STANDING, pod1: 0, podNew: 1 },
    lit: ['victimChip', 'focusChip', 'scheduler', 'attemptChip'],
    chain: 4,
    // Pod NEW materializes in the freed slot when the bind arrives.
    flow: [
      F.top({ from: SCHED_X, to: API_R, y: TOP_CY, name: 'bind', lights: ['apiserver'] }),
      // The API binds and drops the hint in one write.
      F.set({ at: 'bind', chips: { attemptChip: 'bound to Node-1', focusChip: 'nominatedNodeName cleared' } }),
      F.route({ points: NODE_LANE, after: 'bind', fadeIn: true, name: 'place', pulse: 'podNew' }),
      F.fade({ target: 'podNew', from: 0, to: 1, dur: FADE.in, at: 'place', easing: 'ease-out' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
