import { P, F, defineCard, ladder, WL, FADE, BEAT, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-probes.md

// THREE PARALLEL PROBE LANES, not the A / B / C column preset: the subject is three questions on
// three independent periodSeconds, and one corridor says the opposite. Panel measured at x<=396.55
// and y<=254.66, the worst of the three viewports report/overlay.test.mjs walks, so PANEL_B 255 is
// that reading rounded up and BAND_Y stands 21.34 clear of it. There is no head room to spend.
const PANEL_B = 255, PANEL_GAP = 21;
const BAND_Y = PANEL_B + PANEL_GAP;                      // 276

// Actor row. Kubelet centred on CX because the middle probe lane leaves its bottom face on the
// spine (WL.L-07), EndpointSlice right-aligned on WL.R, the pair arrangement
// workloads-pod-startup-conditions draws. The two never talk to each other, so no top-row lane
// joins them (A-05): what connects them is the Node between them.
const TOP1_W = 232, TOP1_X = WL.CX - TOP1_W / 2;         // 484..716, the family actor width
// EndpointSlice is right-aligned on the NODE FRAME and not on WL.R, so the actor row and the frame
// share both edges and the content box centres on 600 exactly. Aligned on WL.R instead it reached
// 1140 against a frame starting at 190 and CENTRE read 665 against a 600 +-40 window.
const TOP2_W = 210, TOP2_X = 1060 - TOP2_W;              // 850..1060, on the frame right edge

// The Node frame is 920 and not the WL.L-02 full width, and it is centred on WL.CX so its top face
// midpoint is still the spine (WL.A-03). 820 was measured first and read too narrow beside a Pod of
// 460: at 920 the band left of the Pod is 230 against the 180 that read as a squeeze.
const NODE_Y = 476, NODE_H = 140;                        // 476..616, the workloads frame family
const NODE_W = 920, NODE_X = WL.CX - NODE_W / 2;         // 140..1060

// Chips share the frame's LEFT EDGE rather than the canvas margin: the two bands line up on 190
// instead of one starting 130 units outside the other. 310 wide, four rows of CHIP_H + 8.
const CHIP_X = NODE_X, CHIP_W = 310;                     // 140..450
const CHIP_GAP = 8;
const CHIP_Y = ladder({ y: BAND_Y, rowH: WL.CHIP_H, gap: CHIP_GAP });
const POD_W = 460, POD_H = 96, POD_X = WL.CX - POD_W / 2;
const POD_Y = NODE_Y + 22;                               // 498..594
const CONT_W = 300, CONT_H = 52, CONT_X = WL.CX - CONT_W / 2;
const CONT_Y = POD_Y + 30;                               // 528..580

// The three lanes, 72 apart and SYMMETRIC about WL.SPINE_X, so the set centres on the spine the
// frame top midpoint sits on even though no single lane is alone on that face (L-12). Every one of
// them ends on the FRAME face at NODE_Y and never on the Pod inside it (WL.A-03).
const LANE_DX = 72;
const STARTUP_X = WL.SPINE_X - LANE_DX;                  // 528
const LIVENESS_X = WL.SPINE_X;                           // 600
const READINESS_X = WL.SPINE_X + LANE_DX;                // 672
const down = (x) => [[x, WL.TOP_BOTTOM], [x, NODE_Y]];
const up = (x) => [[x, NODE_Y], [x, WL.TOP_BOTTOM]];
const S_DOWN = down(STARTUP_X), S_UP = up(STARTUP_X);
const L_DOWN = down(LIVENESS_X), R_DOWN = down(READINESS_X);
// ONE lane carries every answer, and it runs up the SPINE. Which probe reported is said by the lit
// chip and by the wire label, not by a third x: an answer riding its own probe x needed a second
// path beside it on every step to keep the other probes on the canvas, and a relation standing next
// to an arrowhead reads as two things happening where one is.
const SPINE_UP = up(WL.SPINE_X), SPINE_DOWN = down(WL.SPINE_X);
// THE TOP ROW IS WHERE THE TWO ANSWERS PART. Both climb to Kubelet, and only the readiness one
// travels on: this lane carries it right, from the Kubelet right face midpoint to the EndpointSlice
// left face midpoint. A first version ran it from the frame straight up to the EndpointSlice
// bottom face and was REJECTED at the frame: it shares x with the readiness lane, so on every step
// that showed both, a down arrow and an up arrow were drawn on one segment and the pair read as a T.
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;                  // 80
const EP_LANE = [[TOP1_X + TOP1_W, TOP_CY], [TOP2_X, TOP_CY]];

// The EndpointSlice carries the Pod endpoint from the moment the Pod has an IP, flagged ready=false
// until the readinessProbe passes: a not-ready endpoint is FLAGGED and never absent, which is the
// same fact step readiness-fails states and network-endpointslice-reconcile draws from the slice side.
const EP_READY = '10.244.1.5 ready=true', EP_NOTREADY = '10.244.1.5 ready=false';

// The list order IS the append order, so it is the z-order: the held relations under the lanes,
// then the wire label, the chips, the packet layer, and the bodies above the ball.
export const SCENE = {
  'aria-label': 'Container probes: startupProbe holds livenessProbe and readinessProbe shut until it passes, a liveness failure restarts the container, a readiness failure only flips the endpoint to ready=false',
  parts: [
    P.defs(),
    // THE THREE PROBES ARE STRUCTURE AND STAND ON EVERY STEP, as relations under the lanes: a card
    // that shows only the probe currently talking is one corridor again with a moving x. Each is a
    // relation and not a lane because nothing rides it on the step it is showing, and an arrowhead
    // on a path nothing travels is A-05.
    // Held is DASHED, released is SOLID, and that difference IS the gate. Startup is never held and
    // never released, so it carries one relation and it disappears outright once retired.
    P.relation({ key: 'startupRel', points: S_DOWN, dim: true, role: 'cluster', opacity: 0 }),
    P.relation({ key: 'livenessHeld', points: L_DOWN, dim: true, dashed: true, role: 'cluster' }),
    P.relation({ key: 'readinessHeld', points: R_DOWN, dim: true, dashed: true, role: 'cluster' }),
    // Each probe is a PAIR, down for the probe and up for the answer, and exactly one of a pair is
    // visible per step. Same idiom the corridor of this card used to carry, three times over.
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
    // The second destination. It is a BLOCK and not a chip row on purpose: a readiness failure
    // moves a different OBJECT, and a chip beside the other three would have said it was a
    // fourth probe state.
    P.box({ key: 'epSlice', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'EndpointSlice', sublabel: EP_NOTREADY, role: 'cluster' }),
  ],
  reset: {
    keys: ['kubelet', 'epSlice', 'startupChip', 'livenessChip', 'readinessChip', 'restartChip'],
    pods: ['podGroup'],
  },
};

const RETIRED = 'passed (retired)', HELD = 'held (startupProbe)';

// Every probe is drawn as a PAIR, down for the question and up for the answer, and this states in
// one place which of the seven paths a step shows. Written as a set rather than as one direction,
// because gate-opens is the step that shows two of them at once.
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
    narration: 'Kubelet runs startupProbe against the container every periodSeconds, with an httpGet, tcpSocket, grpc or exec handler. While it runs, livenessProbe and readinessProbe are held shut and never execute, so a slow boot never reads as a liveness failure. A startupProbe that exhausts failureThreshold kills the container per restartPolicy.',
    chips: { startupChip: 'probing 4/30', livenessChip: HELD, readinessChip: HELD, restartChip: '0' },
    sublabels: { epSlice: EP_NOTREADY },
    wires: { req: 'httpGet /healthz/start' },
    opacity: { podGroup: OPACITY.pending, ...lanes('spineDown') },
    lit: ['startupChip'],
    flow: [
      F.route({ points: SPINE_DOWN, name: 'probe' }),
      F.pulse({ pod: 'podGroup', dim: true, at: 'probe' }),
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
    flow: [
      F.pulse({ pod: 'podGroup', dim: true }),
      F.route({ points: S_UP, delay: BEAT.afterPulse, name: 'pass', lights: ['kubelet'] }),
      // THE GATE OPENING, as motion rather than as a line that vanishes. The two probes that were
      // held descend TOGETHER on the answer, which is the one beat this whole composition is for:
      // a reader sees two lanes start carrying traffic at the same instant and on their own paths.
      F.route({ points: L_DOWN, after: 'pass', name: 'released' }),
      F.route({ points: R_DOWN, after: 'pass' }),
      // The two released probes REACH the container, so it blinks for them: without this the step
      // ends with two balls landing on a Pod that does not react.
      F.pulse({ pod: 'podGroup', dim: true, at: 'released' }),
    ],
  },
  {
    id: 'ready',
    duration: 3100,
    narration: 'The readinessProbe passes successThreshold consecutive times on its own period. Kubelet flips the Pod Ready condition to True and the Pod endpoint in the EndpointSlice flips to ready=true, so the Service starts sending it traffic. Every condition named in spec.readinessGates must be True first.',
    chips: { startupChip: RETIRED, livenessChip: 'passing', readinessChip: 'passing 1/1', restartChip: '0' },
    sublabels: { epSlice: EP_READY },
    wires: { req: '200 OK · Ready=True' },
    opacity: { podGroup: 1, ...lanes('reportUp', 'epLane') },
    lit: ['readinessChip'],
    flow: [
      F.pulse({ pod: 'podGroup' }),
      F.fade({ target: 'podGroup', from: OPACITY.pending, to: 1, dur: FADE.in, fill: 'both', easing: 'ease-out' }),
      F.route({ points: SPINE_UP, delay: BEAT.afterPulse, name: 'report', lights: ['kubelet'] }),
      // And only THIS answer travels on past Kubelet, which is the sentence the composition exists
      // to say: the same verdict that flips Ready is what moves a different object.
      F.route({ points: EP_LANE, after: 'report', lights: ['epSlice'] }),
    ],
  },
  {
    id: 'readiness-fails',
    duration: 3100,
    narration: 'The readinessProbe alone fails failureThreshold consecutive times. The EndpointSlice marks that endpoint ready=false rather than removing it, and kube-proxy stops sending new connections to it. Nothing is restarted and restartCount stays 0, because a readiness failure only moves traffic away.',
    chips: { startupChip: RETIRED, livenessChip: 'passing', readinessChip: 'failed 3/3', restartChip: '0' },
    sublabels: { epSlice: EP_NOTREADY },
    wires: { req: '503 · readiness failed' },
    opacity: { podGroup: 1, ...lanes('reportUp', 'epLane') },
    lit: ['readinessChip', 'restartChip'],
    flow: [
      F.pulse({ pod: 'podGroup' }),
      F.route({ points: SPINE_UP, delay: BEAT.afterPulse, name: 'report', lights: ['kubelet'] }),
      F.route({ points: EP_LANE, after: 'report', lights: ['epSlice'] }),
    ],
  },
  {
    id: 'liveness-fails',
    duration: 3000,
    narration: 'The livenessProbe fails failureThreshold consecutive times on its own lane. Kubelet kills the container and starts a fresh instance per restartPolicy, so restartCount becomes 1 and the endpoint goes ready=false with it. The Pod object is not replaced and keeps its IP, because a probe restarts a container and never a Pod.',
    chips: { startupChip: 'reset', livenessChip: 'failed 3/3', readinessChip: 'reset', restartChip: '1' },
    sublabels: { epSlice: EP_NOTREADY },
    wires: { req: '503 · liveness failed' },
    opacity: { podGroup: OPACITY.notready, ...lanes('reportUp', 'epRel') },
    lit: ['livenessChip', 'restartChip', 'epSlice'],
    flow: [
      F.pulse({ pod: 'podGroup' }),
      F.route({ points: SPINE_UP, delay: BEAT.afterPulse, lights: ['kubelet'] }),
      // The kill hangs off the PULSE and not off the report arriving: the container dies when
      // Kubelet decides, and the report is what it sends afterwards.
      F.fade({ target: 'podGroup', from: 1, to: OPACITY.notready, dur: FADE.out, delay: BEAT.afterPulse + BEAT.afterHop, fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'fresh-container',
    duration: 3100,
    narration: 'The replacement container starts from the beginning. Kubelet runs startupProbe again and holds the other two shut until it passes, then readinessProbe succeeds and that endpoint flips back to ready=true. The restartCount never resets, so it climbs with every restart, which is how a restart loop is read off a running one.',
    chips: { startupChip: RETIRED, livenessChip: 'passing', readinessChip: 'passing 1/1', restartChip: '1' },
    sublabels: { epSlice: EP_READY },
    wires: { req: 'httpGet /healthz/start' },
    opacity: { podGroup: 1, ...lanes('spineDown', 'epLane') },
    // Kubelet self-initiates here, so it is lit STATICALLY and its ball waits BEAT.lead (M-18a):
    // the 800 is the beat where the lit sender stands alone before the probe leaves. Span 2951
    // against duration 3100, the reading `ready` and `readiness-fails` take on 800 plus two hops.
    lit: ['kubelet', 'startupChip', 'restartChip'],
    flow: [
      F.route({ points: SPINE_DOWN, delay: BEAT.lead, name: 'probe' }),
      F.fade({ target: 'podGroup', from: OPACITY.notready, to: 1, dur: FADE.in, at: 'probe', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'podGroup', at: 'probe' }),
      F.route({ points: EP_LANE, after: 'probe', lights: ['epSlice'] }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
