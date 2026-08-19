import { P, F, defineCard, laneY, midX, WL, LAYOUT, FADE, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS.md#workloads-hooks

// Layout C of the Workloads canon (WL): the deepest panel in the category leaves room for no column.
// Panel worst case x<=397, y<=379; a longer narration invalidates that measurement.
const TOP1_X = 420, TOP1_W = 220;
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = 220;
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);
const WIRE_Y = WL.TOP_Y - 12;                            // above the actor row, off the spine

// LAYOUT.C of the kit: the ladder takes the RIGHT column, because C has no free column at all.
const LAD_X = LAYOUT.C.ladder.x, LAD_W = LAYOUT.C.ladder.w;    // 660..1140, the pipeline
const LAD_Y = 140;                                       // 6 rows -> 140..382

const NODE_Y = 394, NODE_H = 134;                        // 394..528, below the ladder and the panel
const POD_W = 460, POD_H = 106, POD_TOP_PAD = 20;
const POD_X = WL.CX - POD_W / 2;                         // 370..830, centred on CX
const POD_Y = NODE_Y + POD_TOP_PAD;                      // 414..520, clear of the frame label
const CONT_W = 300, CONT_X = WL.CX - CONT_W / 2, CONT_H = 64;
const POD_INNER = { dx: CONT_X - POD_X, dy: 28, w: CONT_W, h: CONT_H };

// Chips as a full-width bottom strip, three per row so name and value never collide. Five chips
// means a row of three and a row of two, the short row centred on CX (WL.L-05: never four).
const CHIP_PER_ROW = 3, CHIP_GAP = 14;
const CHIP_W = (WL.W - CHIP_GAP * (CHIP_PER_ROW - 1)) / CHIP_PER_ROW;   // 350.67
const CHIP_ROW_H = WL.CHIP_H + 8;
const CHIPS_TOP = 548;                                   // two rows -> 548..624
const CHIP_ROW_N = i => (i < CHIP_PER_ROW ? CHIP_PER_ROW : 2);
const CHIP_X = i => {
  const col = i % CHIP_PER_ROW, n = CHIP_ROW_N(i);
  const rowW = n * CHIP_W + (n - 1) * CHIP_GAP;
  return WL.CX - rowW / 2 + col * (CHIP_W + CHIP_GAP);
};
const CHIP_Y = i => CHIPS_TOP + Math.floor(i / CHIP_PER_ROW) * CHIP_ROW_H;

// The spine steps into the central corridor beside the ladder and reaches the Pod itself.
const TOP2_CX = TOP2_X + TOP2_W / 2;                     // 810
const JOG_Y = WL.TOP_BOTTOM + 20;                        // 140, below the boxes, above the ladder
// The lane into the container leaves the RUNTIME, not Kubelet: Kubelet never touches a container
// directly, which is the whole subject of the card. Both wire labels that ride this say so.
const SPINE = [[TOP2_CX, WL.TOP_BOTTOM], [TOP2_CX, JOG_Y], [WL.SPINE_X, JOG_Y], [WL.SPINE_X, POD_Y]];

// The list order IS the append order, so it is the z-order: the two lanes and the wire label first,
// then the chip strip, the spine, the packet layer, and chain / Node / Pod / actors above the ball.
export const SCENE = {
  'aria-label': 'Container lifecycle hooks: postStart races the ENTRYPOINT, preStop runs synchronously before SIGTERM',
  parts: [
    P.defs(),
    P.arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the single wire label sits ABOVE the actor row, set per step.
    P.wire({ key: 'req', x: WIRE_X, y: WIRE_Y }),
    P.chip({ key: 'postStartChip', x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'postStart hook', value: 'declared' }),
    P.chip({ key: 'entrypointChip', x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'ENTRYPOINT', value: 'not started' }),
    P.chip({ key: 'preStopChip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'preStop hook', value: 'declared' }),
    P.chip({ key: 'stateChip', x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'container state', value: 'Waiting' }),
    P.chip({ key: 'graceChip', x: CHIP_X(4), y: CHIP_Y(4), w: CHIP_W, h: WL.CHIP_H, name: 'grace remaining', value: '30s' }),
    P.lane({ key: 'connector', points: SPINE, dim: true, dashed: true, role: 'cluster' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.chain({
      key: 'chain', x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP, role: 'cluster',
      items: [
        '1. declared  ·  spec defines postStart + preStop',
        '2. created   ·  runtime starts the ENTRYPOINT',
        '3. postStart ·  hook races the ENTRYPOINT, no order',
        '4. running   ·  both settled, container serves',
        '5. preStop   ·  delete fires hook before any signal',
        '6. sigterm   ·  SIGTERM, SIGKILL if alive at grace 0',
      ],
    }),
    P.node({ key: 'nodeEl', x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' }),
    P.pod({
      key: 'podGroup', id: 'podGroup', shellKey: 'shell', innerKey: 'containerBox',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      // No build-time opacity: every step pins the Pod's own, and the poster frame is `idle`.
      inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: 'terminationGracePeriod: 30s' },
    }),
    P.box({ key: 'kubelet', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'lifecycle handler', role: 'cluster' }),
    P.box({ key: 'runtime', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'Runtime', sublabel: 'CRI runc / containerd', role: 'cluster' }),
  ],
  reset: {
    keys: ['kubelet', 'runtime', 'postStartChip', 'entrypointChip', 'preStopChip', 'stateChip', 'graceChip', 'shell', 'containerBox'],
    pods: ['podGroup'],
  },
};

// Chip values that recur, named once so a five-key `chips` block stays one readable line.
const DECLARED = 'declared', EXIT0 = 'completed (exit 0)';

// Ask, deliver, return: Kubelet asks over CRI and the runtime RECEIVES the ask, so it lights on
// arrival. The ack hangs off whatever landed last, which is the spine ball on the riding steps.
const ask = () => F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'req', lights: ['runtime'] });
const ack = (after) => F.segment({ from: [TOP2_X, RESP_Y], to: [TOP1_X + TOP1_W, RESP_Y], after });
// The handler runs INSIDE the container, which is what the wire label says, so the ball reaches the
// Pod and it pulses on arrival: the ack cannot precede the exec that produced it.
const deliver = (name) => [
  F.route({ points: SPINE, after: 'req', name }),
  F.pulse({ pod: 'podGroup', at: name }),
];

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { postStartChip: DECLARED, entrypointChip: 'not started', preStopChip: DECLARED, stateChip: 'Waiting', graceChip: '30s' },
    opacity: { podGroup: OPACITY.pending },
    chain: -1,
  },
  {
    id: 'declared',
    duration: 1900,
    narration: 'The Pod spec carries two per-container handlers. The lifecycle.postStart hook will fire concurrently with the ENTRYPOINT the moment the container is created, with no ordering guarantee between the two. The lifecycle.preStop hook will run synchronously on delete, before any signal, and eats into terminationGracePeriodSeconds while it runs. Each handler is one of exec (a command inside the container), httpGet (an HTTP request Kubelet issues against the Pod IP), or sleep (a fixed-duration pause). A tcpSocket handler also exists but is deprecated.',
    chips: { postStartChip: DECLARED, entrypointChip: 'not started', preStopChip: DECLARED, stateChip: 'Waiting', graceChip: '30s' },
    wires: { req: 'lifecycle.postStart + preStop declared' },
    opacity: { podGroup: OPACITY.pending },
    // Declaration only, nothing travels. The two declared hooks light up via the
    // static highlight outline; pulsing is reserved for the Pod blocks, so no chip flash.
    lit: ['postStartChip', 'preStopChip'],
    chain: 0,
  },
  {
    id: 'created',
    duration: 2200,
    narration: 'The runtime creates the container from the image and starts the ENTRYPOINT process as PID 1. The Kubelet has issued the CreateContainer and StartContainer calls over the CRI socket, so the container has just been started and is moving into the Running state.',
    chips: { postStartChip: 'fires with ENTRYPOINT', entrypointChip: 'starting (PID 1)', preStopChip: DECLARED, stateChip: 'Running', graceChip: '30s' },
    wires: { req: 'CRI CreateContainer + StartContainer · OK' },
    opacity: { podGroup: 1 },
    lit: ['stateChip', 'kubelet', 'entrypointChip', 'postStartChip'],
    chain: 1,
    // The CRI calls hop to the runtime, the OK hops back, and the container
    // materializes once the start call lands.
    flow: [
      ask(),
      ack('req'),
      F.fade({ target: 'podGroup', from: OPACITY.pending, to: 1, dur: FADE.in, at: 'req', fill: 'both', easing: 'ease-out' }),
    ],
  },
  {
    id: 'poststart',
    duration: 3800,
    narration: 'Kubelet fires the postStart hook the moment the container is created, concurrently with the ENTRYPOINT. There is no guarantee which one finishes first. Exec handlers run inside the container over CRI ExecSync, httpGet handlers are issued by Kubelet directly against the Pod IP. If the handler exits non-zero or times out, Kubelet kills the container (subject to the Pod restartPolicy).',
    chips: { postStartChip: 'exec running (racing)', entrypointChip: 'running (racing)', preStopChip: DECLARED, stateChip: 'Running', graceChip: '30s' },
    wires: { req: 'CRI ExecSync · postStart · Exit 0' },
    opacity: { podGroup: 1 },
    lit: ['kubelet', 'postStartChip', 'entrypointChip'],
    chain: 2,
    flow: [ask(), ...deliver('exec'), ack('exec')],
  },
  {
    id: 'running',
    duration: 2200,
    narration: 'Both the ENTRYPOINT and the postStart handler have settled. The container reports Running and the postStart chip flips to completed. Kubelet keeps watching via PLEG and running readiness/liveness probes, the runtime keeps the process alive, and the Pod takes traffic through its Service endpoints once Ready.',
    chips: { postStartChip: EXIT0, entrypointChip: 'running', preStopChip: DECLARED, stateChip: 'Running', graceChip: '30s' },
    wires: { req: 'PLEG watch · Readiness probe OK · Serving traffic' },
    opacity: { podGroup: 1 },
    lit: ['kubelet', 'postStartChip', 'entrypointChip', 'stateChip'],
    chain: 3,
    flow: [ask(), ack('req')],
  },
  {
    id: 'prestop',
    duration: 3800,
    narration: 'A delete arrives and the container is about to be stopped. Before sending any signal, Kubelet runs the preStop hook synchronously and waits for it to return. The ENTRYPOINT is still Running here. The hook executes inside the terminationGracePeriodSeconds budget, so its runtime is subtracted from the 30s window.',
    chips: { postStartChip: EXIT0, entrypointChip: 'running', preStopChip: 'exec running (sync)', stateChip: 'Running', graceChip: '22s' },
    wires: { req: 'CRI ExecSync · preStop · Sync' },
    opacity: { podGroup: 1 },
    lit: ['kubelet', 'preStopChip', 'graceChip'],
    chain: 4,
    flow: [ask(), ...deliver('exec'), ack('exec')],
  },
  {
    id: 'sigterm',
    duration: 4000,
    narration: 'Once preStop returns, Kubelet asks the runtime to stop the container via CRI StopContainer. The runtime delivers SIGTERM to the ENTRYPOINT process inside the Pod. The grace timer keeps counting down from where preStop left off. If the process is still alive when it reaches 0, the runtime escalates to SIGKILL. The container then exits and the Pod object is removed from the API.',
    chips: { postStartChip: EXIT0, entrypointChip: 'received SIGTERM', preStopChip: EXIT0, stateChip: 'Terminated', graceChip: '0s · SIGKILL if alive' },
    wires: { req: 'CRI StopContainer · SIGTERM · ACK' },
    // Final state pinned on the static path too, so cancel between steps does not flash to default.
    opacity: { podGroup: OPACITY.terminating },
    lit: ['preStopChip', 'entrypointChip', 'kubelet', 'stateChip', 'graceChip'],
    chain: 5,
    flow: [
      ask(),
      ...deliver('stop'),
      ack('stop'),
      F.fade({ target: 'podGroup', from: 1, to: OPACITY.terminating, dur: FADE.out, at: 'stop', fill: 'both', easing: 'ease-in' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
