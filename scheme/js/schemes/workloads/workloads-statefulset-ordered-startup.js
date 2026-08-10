import { P, F, defineCard, ladder, laneY, midX, WL, LAYOUT, FADE, BEAT } from './workloads-kit.js';

// Design notes for this card: ./CARDS.md#workloads-statefulset-ordered-startup

// Layout A on the Workloads canon (WL in the kit): ladder left, chip column right, Node frame
// full width at the bottom. Panel measured at x<=397, y<=255 (worst of 1600/1440/1280/1100).
const PANEL_B = 255, PANEL_GAP = 21;

// The controller is centred on CX so the lane leaves its bottom midpoint and drops down the
// corridor between the two columns. The headless Service hangs under the Api, not beside it.
const TOP1_X = 420, TOP1_W = 2 * (WL.CX - 420);          // 420..780, centred on CX
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = WL.R - (TOP1_X + TOP1_W + TOP_GAP);
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);
const SVC_X = TOP2_X, SVC_W = TOP2_W, SVC_Y = 152, SVC_H = WL.BOX_H;
const SVC_CX = SVC_X + SVC_W / 2;
// The registration lane, API down into the headless Service. Wire and ball share these points.
const SVC_LANE = [[SVC_CX, WL.TOP_BOTTOM], [SVC_CX, SVC_Y]];

const BAND_Y = PANEL_B + PANEL_GAP;                      // 276, both columns start here
// LAYOUT.A of the kit: the ladder takes the LEFT column and the chips the RIGHT, both 480 wide.
// WL.L-06 picks A / B / C against THIS card's measured panel bottom.
const LAD_X = LAYOUT.A.ladder.x, LAD_W = LAYOUT.A.ladder.w;     // 60..540, the pipeline
const LAD_Y = BAND_Y;                                    // 5 rows -> 276..476
const CHIP_X = LAYOUT.A.chips.x, CHIP_W = LAYOUT.A.chips.w;     // 660..1140

const CHIP_VGAP = 8;
const CHIP_Y = ladder({ y: BAND_Y, rowH: WL.CHIP_H, gap: CHIP_VGAP });

const NODE_Y = 496, NODE_H = 128;                        // 496..624
const POD_W = 300, POD_H = 82, POD_Y = NODE_Y + 34;      // 530..612
const POD_PAD = 24;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 24, h: 46 };
const POD_XS = [0, 1, 2].map(i => WL.L + POD_PAD + i * ((WL.W - POD_PAD * 2 - POD_W) / 2));
const POD_CX = i => POD_XS[i] + POD_W / 2;               // 234 / 600 / 966

// The lane drops from the controller into the Node frame, runs along a bus above the Pod row
// and taps down into the ordinal the step creates. Wires and balls share these points.
const BUS_Y = NODE_Y + 12;
const TRUNK = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y]];
// The bus is split at the centre slot: each half, like each tap, belongs to an ordinal that does
// not exist until the rollout reaches it, and a lane into an absent Pod points at nothing.
const BUS_L = [[POD_CX(0), BUS_Y], [POD_CX(1), BUS_Y]];
const BUS_R = [[POD_CX(1), BUS_Y], [POD_CX(2), BUS_Y]];
const TAP = i => [[POD_CX(i), BUS_Y], [POD_CX(i), POD_Y]];
const LANE = i => (POD_CX(i) === WL.CX
  ? [[WL.CX, WL.TOP_BOTTOM], [WL.CX, POD_Y]]
  : [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y], [POD_CX(i), BUS_Y], [POD_CX(i), POD_Y]]);

// A trunk segment carries the ball but is not its destination, so it is drawn without a marker:
// the arrowhead belongs on the tap that lands on a Pod.
const trunkPath = (key, points) => P.relation({ key, points, role: 'cluster', dash: '5 5' });

const POD_NAMES = ['web-0', 'web-1', 'web-2'];
const POD_PVCS  = ['data-web-0', 'data-web-1', 'data-web-2'];

// The list order IS the append order, so it is the z-order: the Node frame is a 70% opaque fill,
// so the bus that runs inside it and the balls that ride it are appended after it. Ladder, Pods
// and the actor row sit above the packets.
export const SCENE = {
  'aria-label': 'StatefulSet ordered rollout: Pods start one at a time in ordinal order, each gets a sticky hostname and PVC',
  parts: [
    P.defs(),
    P.arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    // The answer lane is a relationship here, not a route: no step on this card names anything
    // travelling back from the API, so it carries no arrowhead and sits behind the live lane.
    P.relation({ points: [[TOP2_X, RESP_Y], [TOP1_X + TOP1_W, RESP_Y]], role: 'cluster' }),
    P.lane({ points: SVC_LANE, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row. The Service hangs below the row,
    // so its own label sits under it where nothing else runs.
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    P.wire({ key: 'svc', x: SVC_CX, y: SVC_Y + SVC_H + 16 }),
    P.chip({ key: 'web0Chip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'web-0', value: 'pending' }),
    P.chip({ key: 'web1Chip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'web-1', value: 'not created' }),
    P.chip({ key: 'web2Chip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'web-2', value: 'not created' }),
    P.chip({ key: 'focusChip', x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'focus', value: 'none' }),
    P.node({ key: 'nodeEl', x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' }),
    trunkPath('trunk', TRUNK),
    trunkPath('busL', BUS_L),
    trunkPath('busR', BUS_R),
    ...POD_XS.map((_, i) => P.lane({ key: `tap${i}`, points: TAP(i), dim: true, dashed: true, role: 'cluster' })),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.chain({
      key: 'chain', x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP, role: 'cluster',
      items: [
        '1. spec       ·  replicas=3, volumeClaimTemplate: data',
        '2. ordinal 0  ·  PVC data-web-0 bound, web-0 created',
        '3. ordering   ·  ordinal N+1 blocked until N is Ready',
        '4. ordinal 1  ·  PVC data-web-1, web-1 after web-0 Ready',
        '5. ordinal 2  ·  PVC data-web-2, web-2 after web-1 Ready',
      ],
    }),
    ...POD_XS.map((px, i) => P.pod({
      key: `pod${i}`, id: `pod${i}`, innerKey: `pod${i}Box`,
      x: px, y: POD_Y, w: POD_W, h: POD_H, label: POD_NAMES[i], sublabel: '', containers: 0,
      // Born invisible: an ordinal does not exist until the rollout reaches it, and every step
      // pins all three anyway.
      opacity: 0,
      inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: 'pvc: ' + POD_PVCS[i] },
    })),
    P.box({ key: 'svc', x: SVC_X, y: SVC_Y, w: SVC_W, h: SVC_H, label: 'Service web', sublabel: 'clusterIP=None (headless)', role: 'cluster' }),
    P.box({ key: 'apiserver', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'PVC + Pod CRUD', role: 'cluster' }),
    P.box({ key: 'controller', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'StatefulSet', sublabel: 'serial scale-up', role: 'cluster' }),
  ],
  reset: {
    keys: ['controller', 'apiserver', 'svc', 'web0Chip', 'web1Chip', 'web2Chip', 'focusChip', 'pod0Box', 'pod1Box', 'pod2Box'],
    pods: ['pod0', 'pod1', 'pod2'],
  },
};

// setPods as FIELDS: one call pins the three ordinals and the lanes that end on them, so a tap
// goes with its Pod and each half of the bus goes with the ordinal it reaches.
const ordinals = (o0, o1, o2) => ({
  pod0: o0, tap0: o0, pod1: o1, tap1: o1, pod2: o2, tap2: o2, busL: o0, busR: o2,
});

// Ordinal N is created the same way every time: the controller asks the API, the create travels
// down the trunk into the slot, the Pod materializes and pulses, and registration follows
// readiness one beat later. The Api and the Service light when their traffic LANDS.
const createOrdinal = (i) => [
  F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'req', lights: ['apiserver'] }),
  F.route({ points: LANE(i), after: 'req', name: 'create' }),
  F.fade({ target: `pod${i}`, from: 0, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
  F.pulse({ pod: `pod${i}`, at: 'create' }),
  F.route({ points: SVC_LANE, at: 'create', plus: BEAT.afterPulse, lights: ['svc'] }),
];

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { web0Chip: 'not created', web1Chip: 'not created', web2Chip: 'not created', focusChip: 'none' },
    opacity: ordinals(0, 0, 0),
    chain: 0,
  },
  {
    id: 'pod-0',
    duration: 4800,
    narration: 'Controller picks ordinal 0 first. API creates PVC data-web-0 (sticky to ordinal 0 by name, never recycled), the binding controller pairs it with a fresh PV, then a Pod web-0 is created with spec.hostname=web-0 and spec.subdomain=web. Once readinessProbe passes, web-0 is Ready and gets registered as web-0.web in the headless Service EndpointSlice.',
    chips: { web0Chip: 'Ready · web-0.web', web1Chip: 'not created', web2Chip: 'not created', focusChip: 'PVC data-web-0 bound' },
    wires: { req: 'create PVC data-web-0 · Create Pod web-0', svc: 'register web-0.web' },
    opacity: ordinals(1, 0, 0),
    lit: ['controller', 'web0Chip', 'focusChip'],
    // The animated path says the Pod arrived by PULSING it, which no `lights` list can name:
    // the static path has to say it with the inner box instead.
    reducedLit: ['pod0Box'],
    chain: 1,
    flow: createOrdinal(0),
  },
  {
    id: 'gate',
    duration: 1900,
    narration: 'The spec.podManagementPolicy field defaults to OrderedReady. The controller will not create web-1 while web-0 is not Ready, will not create web-2 while web-1 is not Ready, and so on. A stuck ordinal stalls every subsequent one. Setting podManagementPolicy=Parallel lifts this gate at the cost of ordering guarantees during scale-up and scale-down.',
    chips: { web0Chip: 'Ready · web-0.web', web1Chip: 'gate open · web-0 Ready', web2Chip: 'waits for web-1 Ready', focusChip: 'podManagementPolicy: OrderedReady' },
    opacity: ordinals(1, 0, 0),
    // The gate is pure controller logic, nothing travels and the Pods are untouched:
    // the blocked ordinals show via the static highlight only (no chip pulse).
    lit: ['controller', 'web1Chip', 'web2Chip', 'focusChip'],
    chain: 2,
  },
  {
    id: 'pod-1',
    duration: 4000,
    narration: 'Replica web-0 cleared the gate. Controller creates PVC data-web-1 and Pod web-1 with spec.hostname=web-1, served as DNS web-1.web by the headless Service. Same flow as ordinal 0. Pod web-1 reaches Ready and the headless Service EndpointSlice now lists two backends: web-0.web and web-1.web.',
    chips: { web0Chip: 'Ready · web-0.web', web1Chip: 'Ready · web-1.web', web2Chip: 'gate open · web-1 Ready', focusChip: 'PVC data-web-1 bound' },
    wires: { req: 'create PVC data-web-1 · Create Pod web-1', svc: 'register web-1.web' },
    opacity: ordinals(1, 1, 0),
    // web-1 reaching Ready is what opens web-2's gate and the chip changes value to say so, so it
    // lights WITH the event rather than sitting unlit beside it.
    lit: ['controller', 'web1Chip', 'web2Chip', 'focusChip'],
    reducedLit: ['pod1Box'],
    chain: 3,
    flow: createOrdinal(1),
  },
  {
    id: 'pod-2',
    duration: 4800,
    narration: 'Replica web-1 reached Ready, the gate unlocks for ordinal 2. PVC data-web-2 is provisioned and Pod web-2 starts with spec.hostname=web-2, served as DNS web-2.web. Once Ready, all three replicas are alive with sticky identities. Termination on scale-down runs in reverse order (web-2 first, then web-1, then web-0).',
    chips: { web0Chip: 'Ready · web-0.web', web1Chip: 'Ready · web-1.web', web2Chip: 'Ready · web-2.web', focusChip: 'all 3 ordinals Ready' },
    wires: { req: 'create PVC data-web-2 · Create Pod web-2', svc: 'register web-2.web' },
    opacity: ordinals(1, 1, 1),
    lit: ['controller', 'web2Chip', 'focusChip'],
    reducedLit: ['pod2Box'],
    chain: 4,
    flow: createOrdinal(2),
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
