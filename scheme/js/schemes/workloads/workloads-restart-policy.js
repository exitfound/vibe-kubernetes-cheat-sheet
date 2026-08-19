import { P, F, defineCard, ladder, strip, laneY, midX, WL, LAYOUT, FADE, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS.md#workloads-restart-policy

// Layout C on the Workloads canon (WL): panel x<=397 y<=355 leaves no column under it, so the
// pipeline keeps the right band and the chips form a two-across bottom strip.

// Kubelet is the node-facing actor, so it leads the row and is centred on CX: the line down to
// the Node leaves its bottom midpoint and clears the pipeline column.
const TOP1_X = 420, TOP1_W = 2 * (WL.CX - 420);          // 420..780, centred on CX
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = WL.R - (TOP1_X + TOP1_W + TOP_GAP);
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);

// LAYOUT.C of the kit: the ladder takes the RIGHT column, because C has no free column at all.
const LAD_X = LAYOUT.C.ladder.x, LAD_W = LAYOUT.C.ladder.w;    // 660..1140, the pipeline
const LAD_Y = 150;                                       // 5 rows -> 150..350

// Chips two across, 532 wide (LAYOUT.C.strip.two): four across was 258 and every name ran into
// its own value. The strip spans WL.L..WL.R exactly, so the gap is fixed and the width derives.
const CHIP_COLS = 2, CHIP_GAP = 16, CHIP_VGAP = 8;
const CHIPS = strip({ from: WL.L, to: WL.R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIPS_Y = 548;                                     // 2 rows -> 548..582 / 590..624
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: WL.CHIP_H, gap: CHIP_VGAP });
const CHIP_X = i => CHIPS.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

const NODE_Y = 392, NODE_H = 140;                        // 392..532, clear of the panel
const POD_W = 300, POD_H = 94, POD_Y = NODE_Y + 34;      // 426..520
const POD_PAD = 24;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 26, h: 50 };
const POD_XS = [0, 1, 2].map(i => WL.L + POD_PAD + i * ((WL.W - POD_PAD * 2 - POD_W) / 2));

// Nothing ever travels down to the Node here: restartPolicy is enforced in place and every packet is
// a top-row hop, so the line to the Node is a RELATIONSHIP and carries no arrowhead.
const OWNERSHIP = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, NODE_Y]];

const POD_NAMES = ['Pod A', 'Pod B', 'Pod C'];
const POD_SUBS  = ['restartPolicy: Always', 'restartPolicy: OnFailure', 'restartPolicy: Never'];

// The list order IS the append order, so it is the z-order: Node frame, then the ownership line,
// then packets, then ladder, Pods, actor row.
export const SCENE = {
  'aria-label': 'Pod restartPolicy: Always, OnFailure and Never decide whether Kubelet restarts a container after it exits',
  parts: [
    P.defs(),
    P.arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    // State chips in the bottom strip: one per Pod plus a focus line.
    P.chip({ key: 'pod1Chip', x: CHIP_X(0), y: CHIP_Y(0), w: CHIPS.w, h: WL.CHIP_H, name: 'Pod A · Always', value: 'Running' }),
    P.chip({ key: 'pod2Chip', x: CHIP_X(1), y: CHIP_Y(1), w: CHIPS.w, h: WL.CHIP_H, name: 'Pod B · OnFailure', value: 'Running' }),
    P.chip({ key: 'pod3Chip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIPS.w, h: WL.CHIP_H, name: 'Pod C · Never', value: 'Running' }),
    P.chip({ key: 'focusChip', x: CHIP_X(3), y: CHIP_Y(3), w: CHIPS.w, h: WL.CHIP_H, name: 'focus', value: 'none' }),
    P.node({ key: 'nodeEl', x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' }),
    P.relation({ key: 'ownership', points: OWNERSHIP, role: 'cluster', dash: '5 5' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.chain({
      key: 'chain', x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP, role: 'cluster',
      items: [
        '1. policy    ·  Pod-level default Always, container may override',
        '2. exit 0    ·  Always restarts, OnFailure and Never do not',
        '3. exit != 0 ·  Always and OnFailure restart, Never does not',
        '4. backoff   ·  Always and OnFailure share the restart backoff',
        '5. fit       ·  Always for services, OnFailure / Never for Jobs',
      ],
    }),
    ...POD_XS.map((px, i) => P.pod({
      key: `pod${i + 1}`, id: `pod${i + 1}`, innerKey: `pod${i + 1}Box`,
      x: px, y: POD_Y, w: POD_W, h: POD_H, label: POD_NAMES[i], sublabel: '', containers: 0,
      // No build-time opacity: every step pins all three Pods, and the poster frame is `idle`.
      inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: POD_SUBS[i] },
    })),
    P.box({ key: 'kubelet', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'restart enforcer', role: 'cluster' }),
    P.box({ key: 'apiserver', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'stores spec.restartPolicy', role: 'cluster' }),
  ],
  reset: {
    keys: ['apiserver', 'kubelet', 'pod1Chip', 'pod2Chip', 'pod3Chip', 'focusChip', 'pod1Box', 'pod2Box', 'pod3Box'],
    pods: ['pod1', 'pod2', 'pod3'],
  },
};

// Kubelet watches the Api, then the spec hops back down the return lane. The Api RECEIVES that
// first hop, so it lights on arrival, and `lights` is what the static path shows in place of it.
const bounce = () => [
  F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'req', lights: ['apiserver'] }),
  F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, after: 'req' }),
];

// The container exit is an in-place event with no packet to anchor to: the Pods
// react this many ms into the step (pulse, plus a fade for the ones that stop).
const REACT_MS = 400;

// The Pods react together: every one that stops fades first, then all three pulse. Written as one
// helper so no step can fade a Pod and forget to pulse it.
const react = (fades) => [
  ...fades.map(([target, to]) => F.fade({ target, from: 1, to, dur: FADE.out, delay: REACT_MS, fill: 'both', easing: 'ease-in' })),
  F.pulse({ pod: 'pod1', delay: REACT_MS }),
  F.pulse({ pod: 'pod2', delay: REACT_MS }),
  F.pulse({ pod: 'pod3', delay: REACT_MS }),
];

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { pod1Chip: 'Running', pod2Chip: 'Running', pod3Chip: 'Running', focusChip: 'none' },
    opacity: { pod1: 1, pod2: 1, pod3: 1 },
    chain: -1,
  },
  {
    id: 'policy',
    duration: 2200,
    narration: 'The restartPolicy is a Pod-level field. The Pod-level value is immutable once the Pod is created and covers every main and regular init container that does not set its own. Since 1.35 the ContainerRestartRules feature gate is beta and enabled by default, so an individual container may carry a restartPolicy that overrides the Pod one. The Pod-level default is Always. A sidecar (an initContainer with restartPolicy Always, on by default since 1.29 and GA in 1.33) ignores it. Kubelet reads the field from the Pod spec and applies it each time a container terminates.',
    chips: { pod1Chip: 'Running', pod2Chip: 'Running', pod3Chip: 'Running', focusChip: 'Pod-level, default Always' },
    wires: { req: 'watch · spec.restartPolicy delivered · Status reported back' },
    opacity: { pod1: 1, pod2: 1, pod3: 1 },
    lit: ['kubelet', 'focusChip'],
    chain: 0,
    flow: bounce(),
  },
  {
    id: 'exit-zero',
    duration: 2400,
    narration: 'Scenario: a container exits 0, a clean success. Pod A (Always) restarts the container and stays Running. Pod B (OnFailure) does not restart a successful exit, so once the container is done the Pod phase becomes Succeeded. Pod C (Never) does not restart anything either and likewise ends Succeeded.',
    chips: { pod1Chip: 'Running (restarted)', pod2Chip: 'Succeeded', pod3Chip: 'Succeeded', focusChip: 'exit 0: only Always restarts' },
    wires: { req: 'container exit 0 · Restart only if Always' },
    // Pin final opacities: A is back to Running, B and C are terminal.
    opacity: { pod1: 1, pod2: OPACITY.terminated, pod3: OPACITY.terminated },
    lit: ['focusChip', 'kubelet', 'pod1Chip', 'pod2Chip', 'pod3Chip'],
    chain: 1,
    flow: [
      ...bounce(),
      ...react([['pod2', OPACITY.terminated], ['pod3', OPACITY.terminated]]),
    ],
  },
  {
    id: 'exit-nonzero',
    duration: 2400,
    narration: 'Scenario: a container exits with a non-zero code, a failure. Pod A (Always) restarts it. Pod B (OnFailure) restarts it too, that is exactly what OnFailure means. Pod C (Never) restarts nothing, so a single failure drives the Pod phase to Failed.',
    chips: { pod1Chip: 'Running (restarted)', pod2Chip: 'Running (restarted)', pod3Chip: 'Failed', focusChip: 'exit != 0: only Never does not restart' },
    wires: { req: 'exit != 0 · Restart if Always or OnFailure' },
    // Pin: A and B are restarted back to Running, C is terminal Failed.
    opacity: { pod1: 1, pod2: 1, pod3: OPACITY.terminated },
    lit: ['focusChip', 'kubelet', 'pod1Chip', 'pod2Chip', 'pod3Chip'],
    chain: 2,
    flow: [
      ...bounce(),
      ...react([['pod3', OPACITY.terminated]]),
    ],
  },
  {
    id: 'backoff',
    duration: 2400,
    narration: 'The first restart is immediate, and every restart after it, whether driven by Always or by OnFailure, waits out the same exponential backoff. The delay starts at 10s and doubles on each subsequent restart (10s, 20s, 40s, 80s, 160s, capped at 300s by default). The container sits in Waiting with reason=CrashLoopBackOff during the wait, and the timer resets after the container has run successfully for 10 minutes. A Never Pod never restarts at all, so it cannot enter this loop.',
    chips: { pod1Chip: 'Waiting (backoff)', pod2Chip: 'Waiting (backoff)', pod3Chip: 'never enters backoff', focusChip: 'backoff 10s..300s, shared' },
    wires: { req: 'restart backoff: 10s → 20s → ... → 300s cap' },
    // Pin: A and B sit in backoff (alive, not serving), C runs normally.
    opacity: { pod1: OPACITY.notready, pod2: OPACITY.notready, pod3: 1 },
    lit: ['pod3Chip', 'kubelet', 'pod1Chip', 'pod2Chip', 'focusChip'],
    chain: 3,
    flow: [
      ...bounce(),
      ...react([['pod1', OPACITY.notready], ['pod2', OPACITY.notready]]),
    ],
  },
  {
    id: 'fit',
    duration: 2200,
    narration: 'Long-running controllers (Deployment, ReplicaSet, DaemonSet, StatefulSet) only allow restartPolicy=Always, so their Pods always restart. Job uses OnFailure or Never to let its Pods reach a terminal Succeeded or Failed phase instead of looping forever.',
    chips: { pod1Chip: 'long-running services', pod2Chip: 'Job (OnFailure)', pod3Chip: 'Job (Never)', focusChip: 'long-running vs run-to-completion' },
    wires: { req: 'Always: long-running · OnFailure / Never: Jobs' },
    opacity: { pod1: 1, pod2: OPACITY.notready, pod3: OPACITY.notready },
    lit: ['focusChip', 'pod1Chip', 'pod2Chip', 'pod3Chip'],
    chain: 4,
    // Nothing travels on this step: the fit is a property of the controller, not a message.
    flow: react([['pod2', OPACITY.notready], ['pod3', OPACITY.notready]]),
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
