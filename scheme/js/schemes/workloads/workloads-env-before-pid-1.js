import { P, F, defineCard, ladder, laneY, midX, WL, LAYOUT, FADE, BEAT, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS.md#workloads-container-env-injection

// Layout B on the Workloads canon (WL): chips left, ladder right, Node frame full width on the
// floor. Panel measured at x<=397, y<=279.51 (worst of 1600/1280/1100).
const PANEL_B = 280, PANEL_GAP = 20;

// Kubelet leads the row and is centred on CX (WL.L-07), so the spine to the Pod clears both bands.
const TOP1_X = 420, TOP1_W = 2 * (WL.CX - 420);          // 420..780, centred on CX
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = WL.R - TOP2_X;   // 840..1140
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);

// LAYOUT.B of the kit: A needs a panel bottom of 262 or less and this card measures 279.51, so
// the short column takes the band under the panel and the ladder the free right one (WL.L-06).
const CHIP_X = LAYOUT.B.chips.x, CHIP_W = LAYOUT.B.chips.w;    // 60..540, four rows
const CHIP_VGAP = 8;
const CHIP_Y = ladder({ y: PANEL_B + PANEL_GAP, rowH: WL.CHIP_H, gap: CHIP_VGAP });   // 300..460
const LAD_X = LAYOUT.B.ladder.x, LAD_W = LAYOUT.B.ladder.w;    // 660..1140, the five stages
const LAD_Y = 150;                                       // 5 rows -> 150..350, clear of the top row

const NODE_Y = 496, NODE_H = 128;                        // 496..624
const POD_W = 460, POD_H = 96, POD_X = WL.CX - POD_W / 2;
const POD_Y = NODE_Y + 22;                               // 518..614
// 44 and not 52: pod() puts the Pod sublabel on the baseline h - 8, whose ink runs to about 595,
// so a container box ending on 600 is struck through by the sublabel this card writes per step.
const CONT_W = 300, CONT_H = 44, CONT_X = WL.CX - CONT_W / 2;
const CONT_Y = POD_Y + 30;                               // 548..592

// One corridor between the two columns, drawn down and up, ending on the Pod top midpoint.
const SPINE = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, POD_Y]];
const SPINE_UP = [...SPINE].reverse();

// The list order IS the append order, so it is the z-order: lanes and the wire label first, then
// the chip column and the packet layer, and ladder / Node / Pod / actors above the ball.
export const SCENE = {
  'aria-label': 'Container environment injection: the Kubelet resolves env, envFrom and the downward API into one set of variables, hands them to the container at creation, and never updates them again',
  parts: [
    P.defs(),
    // One corridor drawn twice. Only the down direction ever carries a ball on this card, and the
    // up lane exists so the pair is stated once rather than being special-cased per step.
    P.lane({ key: 'connectorDown', points: SPINE, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'connectorUp', points: SPINE_UP, dim: true, dashed: true, role: 'cluster', opacity: 0 }),
    // The pair: the Kubelet asks on REQ_Y and the API answers on RESP_Y (WL.A-01).
    P.arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    // Three variables from three different sources, then the object one of them came from.
    P.chip({ key: 'cfgVar', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'DB_HOST', value: 'unset' }),
    P.chip({ key: 'downVar', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'MY_POD_IP', value: 'unset' }),
    P.chip({ key: 'svcVar', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'WEB_SERVICE_HOST', value: 'unset' }),
    P.chip({ key: 'cmChip', x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'ConfigMap app-config', value: 'db.prod.svc' }),
    P.packets(),
    // Appended AFTER the packet layer, so the ball runs under the ladder, the frame and the actors.
    P.chain({
      key: 'chain', x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP, role: 'cluster',
      items: [
        '1. spec     ·  env, envFrom and valueFrom',
        '2. resolve  ·  Kubelet reads the ConfigMap',
        '3. service  ·  one pair per Service that exists now',
        '4. create   ·  the whole set is handed to PID 1',
        '5. frozen   ·  the object moves, the container does not',
      ],
    }),
    P.node({ key: 'nodeEl', x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' }),
    P.pod({
      key: 'podGroup', id: 'podGroup',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'no container yet', containers: 0,
      inner: { dx: CONT_X - POD_X, dy: CONT_Y - POD_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'container' },
    }),
    P.box({ key: 'kubelet', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'assembles the environment', role: 'cluster' }),
    P.box({ key: 'apiEl', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'ConfigMap · Secret · Service', role: 'cluster' }),
  ],
  reset: {
    keys: ['kubelet', 'apiEl', 'cfgVar', 'downVar', 'svcVar', 'cmChip'],
    pods: ['podGroup'],
  },
};

// Values that recur, named once so a four-key chips block stays one readable line.
const UNSET = 'unset', DB = 'db.prod.svc', POD_IP = '10.244.1.5', SVC_IP = '10.96.0.42';

// The corridor pair as FIELDS, so no step can leave both directions on or neither.
const corridor = (dir) => ({ connectorDown: dir === 'up' ? 0 : 1, connectorUp: dir === 'up' ? 1 : 0 });
// The two top-row hops, stated once: the Kubelet asks on REQ_Y, the API answers on RESP_Y.
const ASK = { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y };
const ANSWER = { from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { cfgVar: UNSET, downVar: UNSET, svcVar: UNSET, cmChip: DB },
    // Nothing has been created on the Node yet, so the Pod sits at its dimmest and no rung is lit.
    opacity: { podGroup: OPACITY.notready, ...corridor('down') },
    podSublabels: { podGroup: 'no container yet' },
    chain: -1,
  },
  {
    id: 'spec',
    duration: 3400,
    narration: 'One container declares its environment three ways at once. A literal env pair is written in the spec, envFrom pulls every key of a ConfigMap in under its own name, and valueFrom with a fieldRef asks the downward API for something only Kubernetes knows, here the Pod IP. None of the three is resolved yet, because a value that does not exist until the Pod is placed cannot be written into a manifest.',
    chips: { cfgVar: UNSET, downVar: UNSET, svcVar: UNSET, cmChip: DB },
    wires: { req: ' ' },
    opacity: { podGroup: OPACITY.notready, ...corridor('down') },
    podSublabels: { podGroup: 'no container yet' },
    // Nothing travels and no Pod acts, so the beat is a static highlight and nothing else (M-27).
    lit: ['kubelet'],
    chain: 0,
  },
  {
    id: 'resolve',
    duration: 2800,
    narration: 'The Kubelet reads the objects the spec named. It uses the data from the ConfigMap at the moment it launches the container, not at the moment the Pod was created, and a Secret is read the same way. DB_HOST takes the value the key holds right now. The downward API needs no read at all, because the Pod IP is already on the Pod the Kubelet is holding.',
    chips: { cfgVar: DB, downVar: POD_IP, svcVar: UNSET, cmChip: DB },
    wires: { req: 'GET ConfigMap app-config · GET Secret db-auth' },
    opacity: { podGroup: OPACITY.notready, ...corridor('down') },
    podSublabels: { podGroup: 'no container yet' },
    lit: ['kubelet'],
    chain: 1,
    flow: [
      F.top({ ...ASK, name: 'ask', lights: ['apiEl'] }),
      F.top({ ...ANSWER, after: 'ask', lights: ['kubelet'] }),
    ],
  },
  {
    id: 'service',
    duration: 2600,
    narration: 'The Kubelet adds a pair of variables for every Service that exists in this namespace at this instant, WEB_SERVICE_HOST and WEB_SERVICE_PORT for a Service named web. That list is a snapshot: a Service created one second later is simply absent from this container, and no amount of waiting brings it in. DNS is the way out of that ordering trap.',
    chips: { cfgVar: DB, downVar: POD_IP, svcVar: SVC_IP, cmChip: DB },
    wires: { req: 'Service web exists now · WEB_SERVICE_HOST + _PORT' },
    opacity: { podGroup: OPACITY.notready, ...corridor('down') },
    podSublabels: { podGroup: 'no container yet' },
    lit: ['kubelet'],
    chain: 2,
    flow: [
      F.top({ ...ANSWER, delay: BEAT.lead, lights: ['kubelet'] }),
    ],
  },
  {
    id: 'create',
    duration: 3000,
    narration: 'The assembled set goes to the container in the CreateContainer call, and PID 1 starts with it already in its environment. What the downward API can carry here has a limit worth knowing: a named label or annotation comes through, but the whole metadata.labels map is available only as a file in a downwardAPI volume and never as a variable.',
    chips: { cfgVar: DB, downVar: POD_IP, svcVar: SVC_IP, cmChip: DB },
    wires: { req: 'CreateContainer · env baked in · StartContainer' },
    opacity: { podGroup: 1, ...corridor('down') },
    podSublabels: { podGroup: 'PID 1 running with the environment' },
    lit: ['kubelet'],
    chain: 3,
    flow: [
      F.route({ points: SPINE, name: 'create' }),
      // Down-arrow: the ball lands first, then the Pod blinks and lifts out of its dimmest shade.
      F.pulse({ pod: 'podGroup', at: 'create' }),
      F.fade({ target: 'podGroup', from: OPACITY.notready, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
    ],
  },
  {
    id: 'frozen',
    duration: 3000,
    narration: 'Somebody edits the ConfigMap. A volume mount would pick the new value up on the next sync, and a downwardAPI volume behaves the same way after a resize, but a variable does nothing at all: it is a copy taken once. The update reaches the Kubelet and stops there, because no call rewrites the environment of a process that is already running, and only a restarted container reads the new value.',
    chips: { cfgVar: DB, downVar: POD_IP, svcVar: SVC_IP, cmChip: 'edited · now db.staging.svc' },
    wires: { req: 'watch · ConfigMap app-config modified' },
    opacity: { podGroup: 1, ...corridor('down') },
    podSublabels: { podGroup: 'PID 1 running with the environment' },
    // Only the ConfigMap chip changed. The three variables are deliberately NOT lit: that they did
    // not move is the sentence of the step.
    lit: ['cmChip'],
    chain: 4,
    flow: [
      // The update is self-initiated by the API and DIES at the Kubelet: no spine hop follows, and
      // the empty corridor below is what the step is about.
      F.top({ ...ANSWER, delay: BEAT.lead, lights: ['kubelet'] }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
