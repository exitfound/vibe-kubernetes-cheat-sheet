import { P, F, defineCard, ladder, WL, LAYOUT, FADE, BEAT, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS.md#workloads-probes

// Layout A and THE WORKLOADS EXEMPLAR: ladder left, chip column right, Node frame full width at the
// bottom. Panel measured at x<=397, y<=255 (worst of 1600/1440/1280/1100).
const PANEL_B = 255, PANEL_GAP = 21;
const TOP_W = 280, TOP_X = WL.CX - TOP_W / 2;            // 460..740, centred on CX (WL.L-07)

// Both columns start on the same line, one panel gap below the panel bottom.
const BAND_Y = PANEL_B + PANEL_GAP;                      // 276
// LAYOUT.A of the kit, which this card is the exemplar of: ladder in the left column, state chips
// in the right, both 480 wide. WL.L-06 picks A / B / C against THIS card's measured panel bottom.
const LAD_X = LAYOUT.A.ladder.x, LAD_W = LAYOUT.A.ladder.w;    // 60..540, the pipeline
const LAD_Y = BAND_Y;                                    // 5 rows of ROW_H + ROW_GAP -> 276..476
const CHIP_X = LAYOUT.A.chips.x, CHIP_W = LAYOUT.A.chips.w;    // 660..1140

// The chip column keeps the ladder's formula on its own row height and gap, so the two columns
// start on one line and drift apart by design rather than by accident.
const CHIP_VGAP = 8;
const CHIP_Y = ladder({ y: BAND_Y, rowH: WL.CHIP_H, gap: CHIP_VGAP });

const NODE_Y = 496, NODE_H = 128;                        // 496..624
const POD_W = 460, POD_H = 96, POD_X = WL.CX - POD_W / 2;
const POD_Y = NODE_Y + 22;                               // 518..614
const CONT_W = 300, CONT_H = 52, CONT_X = WL.CX - CONT_W / 2;
const CONT_Y = POD_Y + 30;                               // 548..600

// The lane runs down the corridor between the two columns and ends on the Pod it addresses.
const SPINE = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, POD_Y]];
const SPINE_UP = [...SPINE].reverse();

// The list order IS the append order, so it is the z-order: the two corridors and the wire label
// first, then the chip column, the packet layer, and chain / Node / Pod / Kubelet above the ball.
export const SCENE = {
  'aria-label': 'Container probes: startupProbe gates liveness and readiness, liveness restarts the container, readiness toggles the EndpointSlice',
  parts: [
    P.defs(),
    // One corridor drawn twice, down for a probe and up for the report. Exactly one is visible per
    // step, which is what the `corridor()` pair in every `opacity` block below says.
    P.lane({ key: 'connectorDown', points: SPINE, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'connectorUp', points: SPINE_UP, dim: true, dashed: true, role: 'cluster', opacity: 0 }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WL.CX, y: WL.TOP_Y - 12 }),
    // State chips in the right column: the three probes, then the two things a failure moves.
    P.chip({ key: 'startupChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'startupProbe', value: 'pending' }),
    P.chip({ key: 'livenessChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'livenessProbe', value: 'not running' }),
    P.chip({ key: 'readinessChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'readinessProbe', value: 'not running' }),
    P.chip({ key: 'restartChip', x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'restartCount', value: '0' }),
    P.chip({ key: 'endpointChip', x: CHIP_X, y: CHIP_Y(4), w: CHIP_W, h: WL.CHIP_H, name: 'EndpointSlice', value: 'empty' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.chain({
      key: 'chain', x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP, role: 'cluster',
      items: [
        '1. startup   ·  container boots, startupProbe gates the rest',
        '2. released  ·  startup passes, liveness + readiness run',
        '3. ready     ·  readiness passes, Pod IP joins endpoints',
        '4. liveness  ·  failure restarts container, ready=false',
        '5. recovery  ·  fresh container starts, readiness rejoins',
      ],
    }),
    P.node({ key: 'nodeEl', x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' }),
    P.pod({
      key: 'podGroup', id: 'podGroup',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      // No build-time opacity: every step pins the Pod's own, and the poster frame is `idle`.
      inner: { dx: CONT_X - POD_X, dy: CONT_Y - POD_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'container' },
    }),
    P.box({ key: 'kubelet', x: TOP_X, y: WL.TOP_Y, w: TOP_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'prober + probeManager', role: 'cluster' }),
  ],
  reset: {
    keys: ['kubelet', 'startupChip', 'livenessChip', 'readinessChip', 'restartChip', 'endpointChip'],
    pods: ['podGroup'],
  },
};

// Chip values that recur, named once so a five-key `chips` block stays one readable line.
const RETIRED = 'passed (retired)', NOT_RUNNING = 'not running', EP_READY = '10.244.1.5 ready=true';

// setConnectorDir as FIELDS: the pair is written in one place, so no step can leave both corridors
// on or neither. Key order is the order the helper wrote them in.
const corridor = (dir) => ({ connectorDown: dir === 'up' ? 0 : 1, connectorUp: dir === 'up' ? 1 : 0 });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { startupChip: 'pending', livenessChip: NOT_RUNNING, readinessChip: NOT_RUNNING, restartChip: '0', endpointChip: 'empty' },
    // Booting, not Ready: the Pod sits dim. The poster carries the startup row, so chain row 0 is
    // lit on the rest frame to match the booting state.
    opacity: { podGroup: OPACITY.pending, ...corridor('down') },
    chain: 0,
  },
  {
    id: 'startup-running',
    duration: 2300,
    narration: 'Kubelet runs startupProbe every periodSeconds against the container handler, which can be httpGet, tcpSocket, grpc or exec. A slow app gets failureThreshold attempts before Kubelet gives up and restarts the container. The livenessProbe and readinessProbe do not run yet, so a long boot is never mistaken for a failure.',
    chips: { startupChip: 'probing 4/30', livenessChip: NOT_RUNNING, readinessChip: NOT_RUNNING, restartChip: '0', endpointChip: 'empty' },
    wires: { req: 'httpGet /healthz/start' },
    opacity: { podGroup: OPACITY.pending, ...corridor('down') },
    lit: ['startupChip', 'kubelet'],
    chain: 0,
    flow: [
      F.route({ points: SPINE, name: 'probe' }),
      // Pod is still booting (dim), so flash its opacity on probe arrival so the blink shows.
      F.pulse({ pod: 'podGroup', dim: true, at: 'probe' }),
    ],
  },
  {
    id: 'startup-success',
    duration: 2600,
    narration: 'The startupProbe passes once. Kubelet retires it permanently for the lifetime of this container instance and never runs it again. The livenessProbe and readinessProbe are released and now execute on their own periodSeconds.',
    chips: { startupChip: RETIRED, livenessChip: 'running', readinessChip: 'running', restartChip: '0', endpointChip: 'empty' },
    wires: { req: '200 OK · Startup done' },
    opacity: { podGroup: OPACITY.pending, ...corridor('up') },
    lit: ['startupChip', 'livenessChip', 'readinessChip'],
    chain: 1,
    flow: [
      F.pulse({ pod: 'podGroup', dim: true }),
      F.route({ points: SPINE_UP, delay: BEAT.afterPulse, lights: ['kubelet'] }),
    ],
  },
  {
    id: 'ready',
    duration: 2600,
    narration: 'The readinessProbe passes successThreshold consecutive times. Kubelet flips the Pod Ready condition to True, and the EndpointSlice controller adds the Pod IP to the Service EndpointSlice. The Pod now receives traffic.',
    chips: { startupChip: RETIRED, livenessChip: 'passing', readinessChip: 'passing', restartChip: '0', endpointChip: EP_READY },
    wires: { req: '200 OK · Ready=True' },
    // readiness passed: the Pod becomes Ready and lifts to full opacity.
    opacity: { podGroup: 1, ...corridor('up') },
    lit: ['livenessChip', 'readinessChip', 'endpointChip'],
    chain: 2,
    flow: [
      // Pod lights up to Ready first (the visible blink), then reports up to Kubelet.
      F.pulse({ pod: 'podGroup' }),
      F.fade({ target: 'podGroup', from: OPACITY.pending, to: 1, dur: FADE.in, fill: 'both', easing: 'ease-out' }),
      F.route({ points: SPINE_UP, delay: BEAT.afterPulse, lights: ['kubelet'] }),
    ],
  },
  {
    id: 'liveness-fail',
    duration: 2600,
    narration: 'The livenessProbe fails failureThreshold consecutive times. Kubelet kills the container and restarts it per restartPolicy, so restartCount becomes 1. readinessProbe fails too, so the EndpointSlice marks that endpoint ready=false at once rather than removing it, and kube-proxy stops sending new connections.',
    chips: { startupChip: 'reset', livenessChip: 'failed 3/3', readinessChip: 'failed 3/3', restartChip: '1', endpointChip: '10.244.1.5 ready=false' },
    wires: { req: '503 · Liveness failed' },
    // Container killed: the Pod drops to its dimmest state.
    opacity: { podGroup: OPACITY.notready, ...corridor('up') },
    lit: ['startupChip', 'livenessChip', 'readinessChip', 'restartChip', 'endpointChip'],
    chain: 3,
    flow: [
      // Pod is still bright here, so the pulse blink reads clearly. Ball leaves
      // after the blink, then the container is killed and the Pod dims.
      F.pulse({ pod: 'podGroup' }),
      F.route({ points: SPINE_UP, delay: BEAT.afterPulse, lights: ['kubelet'] }),
      // A literal delay, not `after:` the hop: the kill hangs off the PULSE, one beat later.
      F.fade({ target: 'podGroup', from: 1, to: OPACITY.notready, dur: FADE.out, delay: BEAT.afterPulse + BEAT.afterHop, fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'recovery',
    duration: 2300,
    narration: 'Kubelet probes the fresh container with startupProbe again. Once it passes, livenessProbe and readinessProbe are released, readinessProbe quickly succeeds, and the EndpointSlice controller rejoins the Pod IP. Traffic resumes while restartCount stays at 1.',
    chips: { startupChip: RETIRED, livenessChip: 'passing', readinessChip: 'passing', restartChip: '1', endpointChip: EP_READY },
    wires: { req: 'httpGet /healthz/start' },
    // Replacement container is Ready: the Pod returns to full opacity.
    opacity: { podGroup: 1, ...corridor('down') },
    lit: ['kubelet', 'startupChip', 'livenessChip', 'readinessChip', 'endpointChip'],
    chain: 4,
    flow: [
      F.route({ points: SPINE, name: 'probe' }),
      F.fade({ target: 'podGroup', from: OPACITY.notready, to: 1, dur: FADE.in, at: 'probe', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'podGroup', at: 'probe' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
