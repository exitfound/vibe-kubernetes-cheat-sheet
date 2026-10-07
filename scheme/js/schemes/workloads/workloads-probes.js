import { P, F, defineCard, ladder, WL, FADE, BEAT, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-probes.md

// Three parallel probe lanes, not the column preset: three questions on three independent periodSeconds.
// PANEL_B is the narration panel bottom, and there is no head room to spend.
const PANEL_B = 255, PANEL_GAP = 21;
const BAND_Y = PANEL_B + PANEL_GAP;

// Kubelet centred on CX: the middle probe lane leaves its bottom face on the spine (WL.L-07).
const TOP1_W = 232, TOP1_X = WL.CX - TOP1_W / 2;         // the family actor width
// Right-aligned on the NODE FRAME, not WL.R, so the actor row and the frame share both edges.
const TOP2_W = 232, TOP2_X = 1060 - TOP2_W;              // on the frame right edge

// 920, not the WL.L-02 full width, centred on WL.CX so its top face midpoint is the spine (WL.A-03).
const NODE_Y = 464, NODE_H = 142;                        // the WL padding: 34 + POD_H + 12
const NODE_W = 920, NODE_X = WL.CX - NODE_W / 2;

// Chips share the frame's LEFT EDGE rather than the canvas margin.
const CHIP_X = NODE_X, CHIP_W = 310;
const CHIP_GAP = 8;
const CHIP_Y = ladder({ y: BAND_Y, rowH: WL.CHIP_H, gap: CHIP_GAP });
const POD_W = 460, POD_H = 96, POD_X = WL.CX - POD_W / 2;
const POD_Y = NODE_Y + 34;
const CONT_W = 300, CONT_H = 52, CONT_X = WL.CX - CONT_W / 2;
const CONT_Y = POD_Y + 30;

// Three lanes symmetric about WL.SPINE_X (L-12), each ending on the FRAME face, never the Pod (WL.A-03).
const LANE_DX = 72;
const STARTUP_X = WL.SPINE_X - LANE_DX;
const LIVENESS_X = WL.SPINE_X;
const READINESS_X = WL.SPINE_X + LANE_DX;
const down = (x) => [[x, WL.TOP_BOTTOM], [x, NODE_Y]];
const up = (x) => [[x, NODE_Y], [x, WL.TOP_BOTTOM]];
const S_DOWN = down(STARTUP_X), S_UP = up(STARTUP_X);
const L_DOWN = down(LIVENESS_X), R_DOWN = down(READINESS_X);
// ONE lane carries every answer outside gate-opens, up the spine: the lit chip and the wire label
// say which probe reported.
const SPINE_UP = up(WL.SPINE_X), SPINE_DOWN = down(WL.SPINE_X);
// The top row is where the two answers part: only the readiness one travels on to the EndpointSlice.
// Do not run it up from the frame: it would share x with the readiness lane and read as a T.
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const EP_LANE = [[TOP1_X + TOP1_W, TOP_CY], [TOP2_X, TOP_CY]];

// A not-ready endpoint is FLAGGED ready=false, never absent.
const EP_READY = '10.244.1.5 ready=true', EP_NOTREADY = '10.244.1.5 ready=false';

// List order is z-order: held relations under the lanes, then wire, chips, packets, bodies above the ball.
export const SCENE = {
  'aria-label': 'Container probes: startupProbe holds livenessProbe and readinessProbe shut until it passes, a liveness failure restarts the container per restartPolicy, a readiness failure only flips the endpoint to ready=false',
  parts: [
    P.defs(),
    // The three probes stand as relations on the poster frame only: an arrowhead nothing rides is A-05.
    P.relation({ key: 'startupRel', points: S_DOWN, dim: true, role: 'cluster', opacity: 0 }),
    P.relation({ key: 'livenessHeld', points: L_DOWN, dim: true, dashed: true, role: 'cluster' }),
    P.relation({ key: 'readinessHeld', points: R_DOWN, dim: true, dashed: true, role: 'cluster' }),
    // The six lanes, each drawn only on a step whose ball rides it (`lanes()` below).
    P.lane({ key: 'spineDown', points: SPINE_DOWN, dim: true, dashed: true, role: 'cluster', opacity: 0 }),
    P.lane({ key: 'startupUp', points: S_UP, dim: true, dashed: true, role: 'cluster', opacity: 0 }),
    P.lane({ key: 'livenessDown', points: L_DOWN, dim: true, dashed: true, role: 'cluster', opacity: 0 }),
    P.lane({ key: 'readinessDown', points: R_DOWN, dim: true, dashed: true, role: 'cluster', opacity: 0 }),
    P.lane({ key: 'reportUp', points: SPINE_UP, dim: true, dashed: true, role: 'cluster', opacity: 0 }),
    P.lane({ key: 'epLane', points: EP_LANE, dim: true, dashed: true, role: 'cluster', opacity: 0 }),
    P.relation({ key: 'epRel', points: EP_LANE, dim: true, dashed: true, role: 'cluster', opacity: 0 }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WL.CX, y: WL.TOP_Y - 12 }),
    P.chip({ key: 'startupChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'startupProbe', value: 'pending' }),
    P.chip({ key: 'livenessChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'livenessProbe', value: 'held' }),
    P.chip({ key: 'readinessChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'readinessProbe', value: 'held' }),
    P.chip({ key: 'restartChip', x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'restartCount', value: '0' }),
    P.packets(),
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.pod({
      key: 'podGroup', id: 'podGroup',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { dx: CONT_X - POD_X, dy: CONT_Y - POD_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'container' },
    }),
    P.box({ key: 'kubelet', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'prober + probeManager', role: 'cluster' }),
    // A BLOCK, not a chip: a readiness failure moves a different OBJECT, not a fourth probe state.
    P.box({ key: 'epSlice', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'EndpointSlice', sublabel: EP_NOTREADY, role: 'cluster' }),
  ],
  reset: {
    keys: ['kubelet', 'epSlice', 'startupChip', 'livenessChip', 'readinessChip', 'restartChip'],
    pods: ['podGroup'],
  },
};

const RETIRED = 'passed (retired)', HELD = 'held (startupProbe)';

// Which of the ten paths a step shows, as a set: gate-opens shows three at once.
const PATH_KEYS = [
  'startupRel', 'livenessHeld', 'readinessHeld', 'epRel',
  'spineDown', 'startupUp', 'livenessDown', 'readinessDown', 'reportUp', 'epLane',
];
const lanes = (...on) => Object.fromEntries(PATH_KEYS.map((k) => [k, on.includes(k) ? 1 : 0]));

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { startupChip: 'pending', livenessChip: HELD, readinessChip: HELD, restartChip: '0' },
    sublabels: { epSlice: EP_NOTREADY },
    opacity: { podGroup: OPACITY.pending, ...lanes('startupRel', 'livenessHeld', 'readinessHeld') },
  },
  {
    id: 'startup-gating',
    duration: 3400,
    narration: 'Kubelet runs startupProbe against the container every periodSeconds, with an httpGet, tcpSocket, grpc or exec handler. While it runs, livenessProbe and readinessProbe are held shut and never execute, so a slow boot never reads as a liveness failure. If it exhausts failureThreshold, Kubelet kills the container and restartPolicy decides what follows.',
    chips: { startupChip: 'probing 4/30', livenessChip: HELD, readinessChip: HELD, restartChip: '0' },
    sublabels: { epSlice: EP_NOTREADY },
    wires: { req: 'httpGet /healthz/start' },
    opacity: { podGroup: OPACITY.pending, ...lanes('spineDown') },
    // Kubelet self-initiates, so it is lit statically and its probe waits BEAT.lead (M-18a).
    lit: ['kubelet', 'startupChip'],
    flow: [
      F.route({ points: SPINE_DOWN, delay: BEAT.lead, name: 'probe', pulse: { pod: 'podGroup', dim: true } }),
    ],
  },
  {
    id: 'gate-opens',
    duration: 3600,
    narration: 'The startupProbe succeeds once. Kubelet retires it for the lifetime of this container instance and never runs it again, and the two probes it was holding are released. From here livenessProbe and readinessProbe run independently, each on its own periodSeconds, and neither waits for the other.',
    chips: { startupChip: RETIRED, livenessChip: 'running', readinessChip: 'running', restartChip: '0' },
    sublabels: { epSlice: EP_NOTREADY },
    wires: { req: '200 OK · startup retired' },
    opacity: { podGroup: OPACITY.pending, ...lanes('startupUp', 'livenessDown', 'readinessDown') },
    lit: ['startupChip', 'livenessChip', 'readinessChip'],
    // All three chips turn over together when the pass reaches Kubelet (P-03, P-04).
    rewind: { chips: { startupChip: 'probing 4/30', livenessChip: HELD, readinessChip: HELD } },
    flow: [
      F.pulse({ pod: 'podGroup', dim: true }),
      F.route({ points: S_UP, delay: BEAT.afterPulse, name: 'pass', lights: ['kubelet'] }),
      F.set({ at: 'pass', chips: { startupChip: RETIRED, livenessChip: 'running', readinessChip: 'running' } }),
      // The gate opening: the two held probes descend TOGETHER on the answer, the beat this composition is for.
      F.route({ points: L_DOWN, after: 'pass', name: 'released' }),
      F.route({ points: R_DOWN, after: 'pass' }),
      // The released probes reach the container, so it blinks for them.
      F.pulse({ pod: 'podGroup', dim: true, at: 'released' }),
    ],
  },
  {
    id: 'ready',
    duration: 3100,
    narration: 'The readinessProbe passes successThreshold consecutive times on its own period. Kubelet flips the Pod Ready condition to True and the Pod endpoint in the EndpointSlice flips to ready=true, so new connections start reaching it. Every condition named in spec.readinessGates must be True first.',
    chips: { startupChip: RETIRED, livenessChip: 'passing', readinessChip: 'passing 1/1', restartChip: '0' },
    sublabels: { epSlice: EP_READY },
    wires: { req: '200 OK · Ready=True' },
    opacity: { podGroup: 1, ...lanes('reportUp', 'epLane') },
    lit: ['readinessChip'],
    // Neither value stands before its ball (P-03).
    rewind: { chips: { readinessChip: 'running' }, sublabels: { epSlice: EP_NOTREADY } },
    flow: [
      F.pulse({ pod: 'podGroup', dim: true }),
      F.route({ points: SPINE_UP, delay: BEAT.afterPulse, name: 'report', lights: ['kubelet'] }),
      F.fade({ target: 'podGroup', from: OPACITY.pending, to: 1, dur: FADE.in, at: 'report', fill: 'both', easing: 'ease-out' }),
      F.set({ at: 'report', chips: { readinessChip: 'passing 1/1' } }),
      // Only THIS answer travels on past Kubelet: the verdict that flips Ready moves a different object.
      F.route({ points: EP_LANE, after: 'report', name: 'ep', lights: ['epSlice'] }),
      F.set({ at: 'ep', sublabels: { epSlice: EP_READY } }),
    ],
  },
  {
    id: 'readiness-fails',
    duration: 3100,
    narration: 'The readinessProbe alone fails failureThreshold consecutive times. The Pod endpoint in the EndpointSlice is marked ready=false rather than removed, so new connections stop reaching it. Nothing is restarted and restartCount stays 0, because a readiness failure only moves traffic away.',
    chips: { startupChip: RETIRED, livenessChip: 'passing', readinessChip: 'failed 3/3', restartChip: '0' },
    sublabels: { epSlice: EP_NOTREADY },
    wires: { req: '503 · readiness failed' },
    opacity: { podGroup: 1, ...lanes('reportUp', 'epLane') },
    lit: ['readinessChip', 'restartChip'],
    rewind: { chips: { readinessChip: 'passing 1/1' }, sublabels: { epSlice: EP_READY } },
    flow: [
      F.pulse({ pod: 'podGroup' }),
      F.route({ points: SPINE_UP, delay: BEAT.afterPulse, name: 'report', lights: ['kubelet'] }),
      F.set({ at: 'report', chips: { readinessChip: 'failed 3/3' } }),
      F.route({ points: EP_LANE, after: 'report', name: 'ep', lights: ['epSlice'] }),
      F.set({ at: 'ep', sublabels: { epSlice: EP_NOTREADY } }),
    ],
  },
  {
    id: 'liveness-fails',
    duration: 3000,
    narration: 'The livenessProbe fails failureThreshold consecutive times on its own lane. Kubelet kills the container and starts a fresh instance per restartPolicy, so restartCount becomes 1 and the endpoint stays ready=false. The Pod object is not replaced and keeps its IP, because a probe restarts a container and never a Pod.',
    chips: { startupChip: 'reset', livenessChip: 'failed 3/3', readinessChip: 'reset', restartChip: '1' },
    sublabels: { epSlice: EP_NOTREADY },
    wires: { req: '503 · liveness failed' },
    opacity: { podGroup: OPACITY.notready, ...lanes('reportUp', 'epRel') },
    lit: ['livenessChip', 'restartChip', 'epSlice'],
    // The kill turns all four chips over on one beat (P-04).
    rewind: { chips: { startupChip: RETIRED, livenessChip: 'passing', readinessChip: 'failed 3/3', restartChip: '0' } },
    flow: [
      F.pulse({ pod: 'podGroup' }),
      F.route({ points: SPINE_UP, delay: BEAT.afterPulse, name: 'report', lights: ['kubelet'] }),
      // The kill hangs off the 503 REACHING Kubelet, which decides on the failure it has received.
      F.fade({ target: 'podGroup', from: 1, to: OPACITY.notready, dur: FADE.out, at: 'report', fill: 'both', easing: 'ease-in' }),
      F.set({ at: 'report', chips: { startupChip: 'reset', livenessChip: 'failed 3/3', readinessChip: 'reset', restartChip: '1' } }),
    ],
  },
  {
    id: 'fresh-container',
    duration: 3100,
    narration: 'The replacement container starts from the beginning. Kubelet runs startupProbe again and holds the other two shut until it passes, then readinessProbe succeeds and that endpoint flips back to ready=true. The restartCount carries over, so it climbs with every restart, which is how a restart loop is read off a running one.',
    chips: { startupChip: RETIRED, livenessChip: 'passing', readinessChip: 'passing 1/1', restartChip: '1' },
    sublabels: { epSlice: EP_READY },
    wires: { req: 'httpGet /healthz/start' },
    opacity: { podGroup: 1, ...lanes('spineDown', 'epLane') },
    // Kubelet self-initiates, so it is lit statically and its ball waits BEAT.lead (M-18a).
    lit: ['kubelet', 'startupChip', 'restartChip'],
    // Every changed value waits for its ball (P-03, P-04).
    rewind: { chips: { startupChip: 'reset', livenessChip: 'failed 3/3', readinessChip: 'reset' }, sublabels: { epSlice: EP_NOTREADY } },
    flow: [
      F.route({ points: SPINE_DOWN, delay: BEAT.lead, name: 'probe' }),
      F.fade({ target: 'podGroup', from: OPACITY.notready, to: 1, dur: FADE.in, at: 'probe', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'podGroup', at: 'probe' }),
      F.set({ at: 'probe', chips: { startupChip: RETIRED, livenessChip: 'passing', readinessChip: 'passing 1/1' } }),
      F.route({ points: EP_LANE, after: 'probe', name: 'ep', lights: ['epSlice'] }),
      F.set({ at: 'ep', sublabels: { epSlice: EP_READY } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
