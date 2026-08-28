import { P, F, defineCard, ladder, laneY, midX, spread, WL, LAYOUT, BEAT, FADE, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS.md#workloads-deployment-rollback

// Layout B of the Workloads canon (WL): chips left, pipeline right, one tap into the surging Pod.
// Panel worst case x<=397, y<=230; a longer narration invalidates that measurement.
const PANEL_B = 230;
const TOP1_X = 420, TOP1_W = 220;
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = 220;
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);
const WIRE_Y = WL.TOP_Y - 12;                            // above the actor row, off the spine

// LAYOUT.B of the kit, which this card is on: chips in the LEFT column, pipeline in the RIGHT.
// WL.L-06 picks A / B / C against THIS card's measured panel bottom, and B is the one that fits.
const LAD_X = LAYOUT.B.ladder.x, LAD_W = LAYOUT.B.ladder.w;    // 660..1140, the pipeline
const LAD_Y = 160;                                       // 6 rows -> 160..402

// Chips as a column in the left band, which only opens below the panel.
const CHIP_GAP = 8;
const CHIPS_TOP = PANEL_B + 20;                          // 250
const CHIP_X = LAYOUT.B.chips.x, CHIP_W = LAYOUT.B.chips.w;    // 60..540
const CHIP_Y = ladder({ y: CHIPS_TOP, rowH: WL.CHIP_H, gap: CHIP_GAP });

const NODE_H = 140, CANVAS_B = 624;
const NODE_Y = CANVAS_B - NODE_H;                        // 484..624, the frame rests on the floor
// FOUR slots: RS-v1 is pinned at 3 / 3 on every step, so the three v1 Pods are always drawn and the
// FOURTH carries the whole v2 story. With three, the broken v2 stands in a v1 Pod's place.
const POD_W = 234, POD_H = 106, POD_Y = NODE_Y + 22;     // 506..612
const POD_PAD = 24;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };
const SLOT_N = 4;
// Fixed Pod width, derived gap: spread, not strip. 84 / 350 / 616 / 882 on a gap of 32.
const SLOT = spread({ from: WL.L + POD_PAD, to: WL.R - POD_PAD, count: SLOT_N, w: POD_W });
const POD_CX = i => SLOT.x(i) + POD_W / 2;               // 201 / 467 / 733 / 999

// The trunk leaves the actor on its own midpoint, into the central corridor, down to a bus above the
// Pod row and one tap into the surging Pod, the only Pod any ball here is addressed to.
const TOP1_CX = TOP1_X + TOP1_W / 2;                     // 530
const JOG_Y = WL.TOP_BOTTOM + 20;                        // 140, below the boxes, above the ladder
const BUS_Y = NODE_Y - 24;                               // 460, clear of the chip column
const SPINE = [
  [TOP1_CX, WL.TOP_BOTTOM], [TOP1_CX, JOG_Y], [WL.SPINE_X, JOG_Y],
  [WL.SPINE_X, BUS_Y], [POD_CX(3), BUS_Y], [POD_CX(3), POD_Y],
];

const POD_NAMES = ['web-a1', 'web-b2', 'web-c3', 'web-d4'];

// Z-order: the top lane pair, the wire label, the chip column and the trunk, then the packet layer,
// then chain / Node / Pods / actor row above the ball.
export const SCENE = {
  'aria-label': 'Deployment rollback and revision history: a bad rollout stalls past progressDeadlineSeconds, rollout undo scales the broken ReplicaSet to zero while the previous one keeps serving',
  parts: [
    P.defs(),
    P.arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    // The answer lane is a relationship here, not a route: no step on this card names anything
    // travelling back from the API, so it carries no arrowhead and sits behind the live lane.
    P.relation({ points: [[TOP2_X, RESP_Y], [TOP1_X + TOP1_W, RESP_Y]], role: 'cluster' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WIRE_X, y: WIRE_Y }),
    // State chips in the left band: the two ReplicaSets and what the rollout says about them.
    P.chip({ key: 'rs1Chip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'RS-v1 (rev 1) · Ready', value: '3 / 3' }),
    P.chip({ key: 'rs2Chip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'RS-v2 (rev 2) · Ready', value: '0 / 0' }),
    P.chip({ key: 'condChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'condition', value: 'Available=True' }),
    P.chip({ key: 'revChip', x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'rollout', value: 'stable @ rev 1' }),
    P.lane({ key: 'connector', points: SPINE, dim: true, dashed: true, role: 'cluster' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.chain({
      key: 'chain', x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP, role: 'cluster',
      items: [
        '1. stable   ·  rev 1, RS-v1 owns 3 Ready Pods',
        '2. rollout  ·  set image v2, RS-v2 surges (rev 2)',
        '3. bad      ·  v2 crashes, readiness never passes',
        '4. stuck    ·  progressDeadline, Progressing=False',
        '5. undo     ·  rollout undo, RS-v2 to 0, RS-v1 kept',
        '6. restored ·  rev 3 copies rev 1, Available=True',
      ],
    }),
    P.node({ key: 'nodeEl', x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' }),
    // No build-time opacity: every step pins each slot's own through slots() below.
    ...POD_NAMES.map((name, i) => P.pod({
      key: `pod${i + 1}`, id: `pod${i + 1}`, innerKey: `pod${i + 1}Box`,
      x: SLOT.x(i), y: POD_Y, w: POD_W, h: POD_H, label: name, sublabel: '', containers: 0,
      inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: 'v1.0' },
    })),
    P.box({ key: 'apiserver', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'PATCH .scale + Pod CRUD', role: 'cluster' }),
    P.box({ key: 'controller', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Deployment', sublabel: 'owns RS revisions', role: 'cluster' }),
  ],
  reset: {
    keys: ['controller', 'apiserver', 'rs1Chip', 'rs2Chip', 'condChip', 'revChip', 'pod1Box', 'pod2Box', 'pod3Box', 'pod4Box'],
    pods: ['pod1', 'pod2', 'pod3', 'pod4'],
  },
};

// A slot's version and its presence are one fact: `null` means the slot is empty on this step. The
// three v1 Pods never leave, so only the fourth argument ever changes.
const V1 = { v: 'v1.0' };
const V2_NEW = { v: 'v2.0 · starting' };
const V2_CRASH = { v: 'v2.0 · CrashLoopBackOff', op: OPACITY.notready };
const V2_STUCK = { v: 'v2.0 · stuck', op: OPACITY.notready };
// setSlots as FIELDS: an empty slot writes no sublabel, so a vanished Pod keeps the version text it
// died with. Key order is the order the helper wrote them in.
const shadeOf = v => (v ? (v.op === undefined ? 1 : v.op) : 0);
// The one lane ends on web-d4 and on nothing else, so it takes that slot's own shade (A-13) and
// goes with it when the slot empties (A-14). Pinned here, so no step can state the two apart.
const slots = (...vs) => ({
  sublabels: Object.fromEntries(vs.flatMap((v, i) => (v ? [[`pod${i + 1}Box`, v.v]] : []))),
  opacity: { ...Object.fromEntries(vs.map((v, i) => [`pod${i + 1}`, shadeOf(v)])), connector: shadeOf(vs[3]) },
});

export const STEPS_SPEC = [
  {
    id: 'stable',
    duration: 1500,
    chips: { rs1Chip: '3 / 3', rs2Chip: '0 / 0', condChip: 'Available=True', revChip: 'stable @ rev 1' },
    ...slots(V1, V1, V1, null),
    chain: 0,
  },
  {
    id: 'rollout',
    duration: 3700,
    narration: 'You run kubectl set image deployment/web app=v2.0, which PATCHes the Pod template. The new template hash differs, so the Deployment controller creates ReplicaSet RS-v2 as revision 2 and starts the rollout, surging a v2 Pod under the RollingUpdate strategy while the old Pods keep serving.',
    chips: { rs1Chip: '3 / 3', rs2Chip: '0 / 1', condChip: 'Progressing=True', revChip: 'rolling out rev 2' },
    wires: { req: 'PATCH .spec.template · create RS-v2 (rev 2)' },
    ...slots(V1, V1, V1, V2_NEW),
    lit: ['condChip', 'controller', 'rs2Chip', 'revChip'],
    // The surging Pod is only PULSED, so the static path has to say the v2 slot is the subject.
    reducedLit: ['pod4Box'],
    chain: 1,
    // The surge Pod does not exist until the order lands, so it winds back to absent and RISES on
    // that arrival. Drawn at entry it is a create standing 2700ms ahead of its own ball.
    rewind: { opacity: { pod4: 0 } },
    flow: [
      // The PATCH hits the Api, then the surge order travels down the
      // connector and the surging Pod pulses on arrival.
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'req', lights: ['apiserver'] }),
      F.route({ points: SPINE, after: 'req', name: 'surge' }),
      F.fade({ target: 'pod4', from: 0, to: 1, dur: FADE.in, at: 'surge', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'pod4', at: 'surge' }),
    ],
  },
  {
    id: 'bad',
    duration: 2900,
    narration: 'The v2 Pod is broken. Its readinessProbe never passes, so it churns in CrashLoopBackOff and never reports Ready. Because maxUnavailable kept the old Pods alive, the Service still has healthy v1 backends, but RS-v2 cannot reach its target and the rollout makes no progress.',
    chips: { rs1Chip: '3 / 3', rs2Chip: '0 / 1 (crashing)', condChip: 'Progressing=True', revChip: 'rev 2 never Ready' },
    wires: { req: 'readinessProbe fail · v2 not Ready' },
    ...slots(V1, V1, V1, V2_CRASH),
    lit: ['revChip', 'rs2Chip'],
    chain: 2,
    // The static block already carries the crashed shade, so the animated path winds the v2 Pod
    // back to full and dims it on arrival instead.
    rewind: { opacity: { pod4: 1, connector: 1 } },
    flow: [
      // NOTHING travels on this step, which is the content: the probe NEVER passes, so no Ready
      // report leaves the Pod. It crash-loops in place, pulses, then settles to the crashed shade.
      F.pulse({ pod: 'pod4' }),
      F.fade({ target: 'pod4', from: 1, to: OPACITY.notready, dur: FADE.out, delay: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
      // The lane dims on the same beat as the Pod it lands on: with no ball on this step it is the
      // only bright thing left pointing at a crashed Pod (A-13).
      F.fade({ target: 'connector', from: 1, to: OPACITY.notready, dur: FADE.out, delay: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'stuck',
    duration: 2300,
    narration: 'After progressDeadlineSeconds (600 by default), the Deployment sets the condition Progressing=False with reason ProgressDeadlineExceeded. The rollout is wedged: RS-v2 cannot reach its count, while RS-v1 keeps all three v1.0 Pods serving, so traffic stays healthy on the old version until someone steps in.',
    chips: { rs1Chip: '3 / 3', rs2Chip: '0 / 1 stuck', condChip: 'Progressing=False', revChip: 'ProgressDeadlineExceeded' },
    wires: { req: 'progressDeadlineSeconds elapsed · rollout halts' },
    ...slots(V1, V1, V1, V2_STUCK),
    // The deadline lapses with nothing moving and the Pods are untouched: the wedged
    // conditions show via the static highlight only (no chip pulse).
    lit: ['rs2Chip', 'condChip', 'revChip'],
    chain: 3,
  },
  {
    id: 'undo',
    duration: 3700,
    narration: 'Running kubectl rollout undo deployment/web rolls back to the previous good revision. The controller scales RS-v2 down to zero, while RS-v1 was never scaled below three and simply keeps serving. The broken v2 Pod is deleted, so all three serving Pods are on v1.0 again.',
    chips: { rs1Chip: '3 / 3', rs2Chip: '0 / 0', condChip: 'Progressing=True', revChip: 'undo → rev 1 template' },
    wires: { req: 'rollout undo · RS-v2 to 0 · RS-v1 stays 3' },
    ...slots(V1, V1, V1, null),
    lit: ['rs2Chip', 'condChip', 'controller', 'rs1Chip', 'revChip'],
    // The v2 Pod is only PULSED on its way out, so the static path names the slot instead.
    reducedLit: ['pod4Box'],
    chain: 4,
    // The broken v2 Pod is DELETED, not converted back: RS-v2 goes to zero and the three v1 Pods
    // simply keep serving, so the row LOSES its fourth Pod.
    rewind: { opacity: { pod4: OPACITY.notready, connector: OPACITY.notready } },
    flow: [
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'req', lights: ['apiserver'] }),
      F.route({ points: SPINE, after: 'req', name: 'undo' }),
      F.pulse({ pod: 'pod4', at: 'undo' }),
      F.fade({ target: 'pod4', from: OPACITY.notready, to: 0, dur: FADE.out, at: 'undo', fill: 'both', easing: 'ease-in' }),
      // Pod and lane leave on one beat. `fill: both` holds the lane on screen for the whole flight
      // that deletes the Pod, and takes it with the slot it pointed at (A-14, A-15).
      F.fade({ target: 'connector', from: OPACITY.notready, to: 0, dur: FADE.out, at: 'undo', fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'restored',
    duration: 2300,
    narration: 'The rollback is itself recorded as a new revision 3 whose template equals revision 1. Undo does not erase revision 2, it stays in history, and revisionHistoryLimit caps how many old ReplicaSets are kept. Running kubectl rollout history lists all three revisions, and the Deployment reports Available=True again.',
    chips: { rs1Chip: '3 / 3 (now rev 3)', rs2Chip: '0 / 0 (retained)', condChip: 'Available=True', revChip: 'restored @ rev 3' },
    ...slots(V1, V1, V1, null),
    lit: ['rs1Chip', 'rs2Chip', 'condChip', 'revChip'],
    // The three v1 Pods are only PULSED, so the static path lights their boxes instead.
    reducedLit: ['pod1Box', 'pod2Box', 'pod3Box'],
    chain: 5,
    flow: [
      // Rolled back and healthy: the three v1 Pods pulse together (the pulse fades).
      F.pulse({ pod: 'pod1' }),
      F.pulse({ pod: 'pod2' }),
      F.pulse({ pod: 'pod3' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
