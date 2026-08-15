import { P, F, defineCard, ladder, laneY, midX, WL, LAYOUT, FADE, BEAT, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS.md#workloads-rolling-update

// Layout A on the Workloads canon (WL in the kit): ladder left, chips right, Node frame full width.
// Panel x<=397, y<=205.
const PANEL_B = 205, PANEL_GAP = 21;

// The first actor box is centred on CX so the lane leaves its bottom midpoint and still drops
// down the corridor between the two columns.
const TOP1_X = 420, TOP1_W = 2 * (WL.CX - 420);          // 420..780, centred on CX
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = WL.R - (TOP1_X + TOP1_W + TOP_GAP);
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);

const BAND_Y = PANEL_B + PANEL_GAP;                      // 226, both columns start here
// LAYOUT.A of the kit: the ladder takes the LEFT column and the chips the RIGHT, both 480 wide.
// WL.L-06 picks A / B / C against THIS card's measured panel bottom.
const LAD_X = LAYOUT.A.ladder.x, LAD_W = LAYOUT.A.ladder.w;     // 60..540, the pipeline
const LAD_Y = BAND_Y;                                    // 6 rows -> 226..468
const CHIP_X = LAYOUT.A.chips.x, CHIP_W = LAYOUT.A.chips.w;     // 660..1140

const CHIP_VGAP = 8;
const CHIP_Y = ladder({ y: BAND_Y, rowH: WL.CHIP_H, gap: CHIP_VGAP });

const NODE_Y = 490, NODE_H = 134;                        // 490..624
// FOUR slots, not three, and that is CONTENT rather than layout: maxSurge=1 means the rollout is
// transiently one Pod ABOVE .spec.replicas, which the surge step says in words and in its chip.
const POD_W = 234, POD_H = 88, POD_Y = NODE_Y + 34;      // 524..612
const POD_PAD = 24;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 26, h: 48 };
const SLOT_N = 4;
const POD_XS = [0, 1, 2, 3].map(i => WL.L + POD_PAD + i * ((WL.W - POD_PAD * 2 - POD_W) / (SLOT_N - 1)));
const POD_CX = i => POD_XS[i] + POD_W / 2;               // 201 / 467 / 733 / 999

// The lane leaves the API, not the Deployment: the Deployment PATCHes .scale, and what appears on
// the Node is that write taking effect. A start point is a TIMING decision too (routeDur is length-based).
const TOP2_CX = TOP2_X + TOP2_W / 2;                     // 990
const JOG_Y = WL.TOP_BOTTOM + 25;                        // 145, below the boxes, above both columns
const BUS_Y = NODE_Y + 12;
const TRUNK = [[TOP2_CX, WL.TOP_BOTTOM], [TOP2_CX, JOG_Y], [WL.CX, JOG_Y], [WL.CX, BUS_Y]];
const BUS = [[POD_CX(0), BUS_Y], [POD_CX(POD_XS.length - 1), BUS_Y]];
const TAP = i => [[POD_CX(i), BUS_Y], [POD_CX(i), POD_Y]];
const LANE = i => (POD_CX(i) === WL.CX
  ? [...TRUNK, [WL.CX, POD_Y]]
  : [...TRUNK, [POD_CX(i), BUS_Y], [POD_CX(i), POD_Y]]);

// A trunk segment carries the ball but is not its destination, so it is drawn without a marker:
// the arrowhead belongs on the tap that lands on a Pod.
const trunkPath = (key, points) => P.relation({ key, points, role: 'cluster', dash: '5 5' });

// Random suffixes, as a Deployment really gives them: ordinals imply an age order the drawing
// never establishes, while the narration says the controller picks the OLDEST Pod.
const POD_NAMES = ['web-a1', 'web-b2', 'web-c3', 'web-d4'];

// Z-order: the Node frame is a 70% opaque fill, so the bus inside it and the balls riding it are
// appended after it. Ladder, Pods and the actor row sit above the packets.
export const SCENE = {
  'aria-label': 'Deployment rolling update: maxSurge surges a new ReplicaSet Pod first, maxUnavailable drains an old one once the new is Ready, repeat until converged',
  parts: [
    P.defs(),
    P.arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    // The answer lane is a relationship here, not a route: no step on this card names anything
    // travelling back from the API, so it carries no arrowhead and sits behind the live lane.
    P.relation({ points: [[TOP2_X, RESP_Y], [TOP1_X + TOP1_W, RESP_Y]], role: 'cluster' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    P.chip({ key: 'v1Chip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'RS-v1 (old) · Ready', value: '3 / 3' }),
    P.chip({ key: 'v2Chip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'RS-v2 (new) · Ready', value: '0 / 0' }),
    P.chip({ key: 'surgeChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'maxSurge · maxUnavailable', value: '1 · 1' }),
    P.chip({ key: 'progressChip', x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'rollout', value: 'idle' }),
    P.node({ key: 'nodeEl', x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' }),
    // Trunk and bus carry the ball, the taps land it on a Pod: only the taps take an arrowhead.
    trunkPath('trunk', TRUNK),
    trunkPath('bus', BUS),
    ...POD_XS.map((_, i) => P.lane({ key: `tap${i}`, points: TAP(i), dim: true, dashed: true, role: 'cluster' })),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.chain({
      key: 'chain', x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP, role: 'cluster',
      items: [
        '1. spec      ·  image v1.0 → v2.0 patch',
        '2. surge     ·  create v2 Pod (maxSurge=1)',
        '3. probe     ·  readinessProbe marks Ready',
        '4. drain     ·  terminate v1 Pod (maxUnavailable=1)',
        '5. repeat    ·  surge + drain per old replica',
        '6. converged ·  3 v2 Ready, RS-v1 scaled to 0',
      ],
    }),
    ...POD_XS.map((px, i) => P.pod({
      key: `pod${i + 1}`, id: `pod${i + 1}`, innerKey: `pod${i + 1}Box`,
      x: px, y: POD_Y, w: POD_W, h: POD_H, label: POD_NAMES[i], sublabel: '', containers: 0,
      // No build-time opacity: every step pins all four slots through `slots()`.
      inner: { ...POD_INNER, label: 'app', sublabel: 'v1.0' },
    })),
    P.box({ key: 'apiserver', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'PATCH .scale + Pod CRUD', role: 'cluster' }),
    P.box({ key: 'controller', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Deployment', sublabel: 'scales RS-v1, RS-v2', role: 'cluster' }),
  ],
  reset: {
    keys: ['controller', 'apiserver', 'v1Chip', 'v2Chip', 'surgeChip', 'progressChip', 'pod1Box', 'pod2Box', 'pod3Box', 'pod4Box'],
    pods: ['pod1', 'pod2', 'pod3', 'pod4'],
  },
};

// A slot's version and its presence are ONE fact, so one helper writes both (`null` = unoccupied,
// an empty slot states no version). Two assignments show more Pods alive than the chips count.
const slots = (...row) => {
  const opacity = {}, sublabels = {};
  row.forEach((v, i) => {
    const n = i + 1;
    if (v === null) { opacity[`pod${n}`] = 0; return; }
    opacity[`pod${n}`] = v.op === undefined ? 1 : v.op;
    sublabels[`pod${n}Box`] = v.v;
  });
  return { opacity, sublabels };
};
const V1 = { v: 'v1.0' }, V2 = { v: 'v2.0 · Ready' }, V2_NEW = { v: 'v2.0 · starting' };
const GOING = { v: 'terminating', op: OPACITY.terminating };

// The scale PATCH the Deployment sends the API, identical on the three steps that send one.
const patchApi = (name) => F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name, lights: ['apiserver'] });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { v1Chip: '3 / 3', v2Chip: '0 / 0', surgeChip: '1 · 1', progressChip: 'idle' },
    ...slots(V1, V1, V1, null),
    chain: -1,
  },
  {
    id: 'spec',
    duration: 1900,
    narration: 'You run kubectl set image deployment/web app=v2.0, which PATCHes .spec.template. The new template hash differs, so the Deployment controller creates ReplicaSet RS-v2 with replicas=0. RS-v1 still owns all 3 live Pods, no churn yet.',
    chips: { v1Chip: '3 / 3', v2Chip: '0 / 0', surgeChip: '1 · 1', progressChip: 'spec PATCHed · RS-v2 created' },
    wires: { req: 'PATCH .spec.template · New RS-v2' },
    ...slots(V1, V1, V1, null),
    lit: ['controller', 'progressChip'],
    chain: 0,
    flow: [patchApi()],
  },
  {
    id: 'surge',
    duration: 4500,
    narration: 'Setting maxSurge=1 lets the controller scale RS-v2 from 0 to 1 before any old Pod leaves. A fresh v2.0 Pod is created on Node-1, Kubelet starts the container. Total live Pods is now 4 (3 v1 plus 1 surge), 1 above .spec.replicas.',
    chips: { v1Chip: '3 / 3', v2Chip: '0 / 1', surgeChip: '1 · 1', progressChip: 'surged +1 · 4 Pods alive' },
    wires: { req: 'scale RS-v2 replicas: 0 → 1' },
    ...slots(V1, V1, V1, V2_NEW),
    lit: ['controller', 'v2Chip', 'progressChip'],
    // The animated path says the surge Pod arrived by PULSING it, which no `lights` list can name:
    // the static path has to say it with the inner box instead.
    reducedLit: ['pod4Box'],
    chain: 1,
    flow: [
      // kubectl-style scale PATCH reaches Api, then the create flows down to the node.
      patchApi('patch'),
      // The surge Pod is created in the FOURTH slot, beside the three v1 Pods rather than on top of
      // one of them: that is what being one above .spec.replicas looks like.
      F.route({ points: LANE(3), after: 'patch', name: 'create' }),
      F.pulse({ pod: 'pod4', at: 'create' }),
    ],
  },
  {
    id: 'probe-and-drain',
    duration: 4500,
    narration: 'The new Pod becomes Ready (readinessProbe passes successThreshold times). RS-v2 sees Ready=1. Now maxUnavailable=1 allows scaling RS-v1 from 3 down to 2, the controller picks the oldest Pod and triggers a graceful delete (preStop, then SIGTERM, then grace period).',
    chips: { v1Chip: '2 / 2', v2Chip: '1 / 1', surgeChip: '1 · 1', progressChip: 'replaced 1/3 · 3 Pods alive' },
    wires: { req: 'scale RS-v1 replicas: 3 → 2' },
    ...slots(V1, V1, GOING, V2),
    lit: ['apiserver', 'v1Chip', 'v2Chip', 'progressChip'],
    reducedLit: ['pod4Box'],
    chain: 2,
    // The drained Pod is dimmed by the static block and comes back to full for the animated path,
    // which fades it out on the drain arrival instead.
    rewind: { opacity: { pod3: 1 } },
    flow: [
      // Readiness comes FIRST and is the precondition: only then does maxUnavailable allow the
      // scale-down. Pulsing both on one arrival draws the permission and its effect as one event.
      F.pulse({ pod: 'pod4' }),
      F.route({ points: LANE(2), delay: BEAT.afterPulse, name: 'drain' }),
      F.pulse({ pod: 'pod3', at: 'drain' }),
      F.fade({ target: 'pod3', from: 1, to: OPACITY.terminating, dur: FADE.out, at: 'drain', fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'second-cycle',
    // Motion: the surge into the freed slot lands, then the next old Pod drains: 5920ms. A cycle is now TWO events, a surge and a
    // drain, where the three-slot version could only draw one.
    duration: 6200,
    narration: 'Same dance again: surge one more v2 Pod into the room the last drain gave back, wait for Ready, drain the next old v1. The controller does not move to a third replacement until this one is committed, so the rollout proceeds one Pod at a time.',
    chips: { v1Chip: '1 / 1', v2Chip: '2 / 2', surgeChip: '1 · 1', progressChip: 'replaced 2/3 · 3 Pods alive' },
    wires: { req: 'scale RS-v2: 1 → 2 · Scale RS-v1: 2 → 1' },
    ...slots(V1, GOING, V2, V2),
    lit: ['controller', 'v1Chip', 'v2Chip', 'progressChip'],
    reducedLit: ['pod3Box'],
    chain: 3,
    // The refilled slot starts dim and the one about to drain starts bright: the animated path
    // plays the swap the static block states as its outcome.
    rewind: { opacity: { pod3: OPACITY.terminating, pod2: 1 } },
    flow: [
      // Scale PATCH reaches Api, then the create flows down into the slot the previous drain freed:
      // the surge is always one Pod, so it reuses the room the last old Pod gave back.
      patchApi('patch'),
      F.route({ points: LANE(2), after: 'patch', name: 'create' }),
      F.fade({ target: 'pod3', from: OPACITY.terminating, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'pod3', at: 'create' }),
      // and the next old Pod leaves on the same beat the new one lands
      F.route({ points: LANE(1), after: 'create', name: 'drain' }),
      F.pulse({ pod: 'pod2', at: 'drain' }),
      F.fade({ target: 'pod2', from: 1, to: OPACITY.terminating, dur: FADE.out, at: 'drain', fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'third-cycle',
    // Motion: the final surge lands, then the last v1 drains: 6460ms. A cycle is now TWO events, a surge and a
    // drain, where the three-slot version could only draw one.
    duration: 6800,
    narration: 'Last cycle: surge the final v2 Pod, wait for Ready, drain the last v1. The Deployment status moves to .status.updatedReplicas=3, observedGeneration catches up to .metadata.generation, and the condition Progressing=True is set with reason NewReplicaSetAvailable.',
    chips: { v1Chip: '0 / 0', v2Chip: '3 / 3', surgeChip: '1 · 1', progressChip: 'replaced 3/3 · 3 Pods alive' },
    wires: { req: 'scale RS-v2: 2 → 3 · Scale RS-v1: 1 → 0' },
    ...slots(GOING, V2, V2, V2),
    lit: ['apiserver', 'v1Chip', 'v2Chip', 'progressChip'],
    reducedLit: ['pod2Box'],
    chain: 4,
    rewind: { opacity: { pod2: OPACITY.terminating, pod1: 1 } },
    flow: [
      // The last cycle: the final v2 lands in the slot the second drain freed, and the last v1 leaves.
      F.route({ points: LANE(1), delay: BEAT.lead, name: 'create' }),
      F.fade({ target: 'pod2', from: OPACITY.terminating, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'pod2', at: 'create' }),
      F.route({ points: LANE(0), after: 'create', name: 'drain' }),
      F.pulse({ pod: 'pod1', at: 'drain' }),
      F.fade({ target: 'pod1', from: 1, to: OPACITY.terminating, dur: FADE.out, at: 'drain', fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'converged',
    duration: 2200,
    narration: 'RS-v2 owns 3 Ready Pods, RS-v1 sits at replicas=0 but is retained for revisionHistoryLimit (default 10) so kubectl rollout undo can flip back in one PATCH. Deployment condition Available=True, rollout complete.',
    chips: { v1Chip: '0 / 0 (retained)', v2Chip: '3 / 3', surgeChip: '1 · 1', progressChip: 'Complete · Available=True' },
    ...slots(null, V2, V2, V2),
    lit: ['v1Chip', 'progressChip'],
    // The three live v2 Pods sit in slots 2, 3 and 4: the surge capacity is released from the
    // LEFTMOST slot. Light those three, never slot 1, which `slots()` has just emptied.
    reducedLit: ['pod2Box', 'pod3Box', 'pod4Box'],
    chain: 5,
    flow: [
      F.pulse({ pod: 'pod2' }),
      F.pulse({ pod: 'pod3' }),
      F.pulse({ pod: 'pod4' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
