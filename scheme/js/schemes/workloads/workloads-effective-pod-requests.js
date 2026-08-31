import { P, F, defineCard, ladder, laneY, midX, strip, WL, LAYOUT, BEAT, OPACITY } from './workloads-kit.js';
import { box } from '../../lib/primitives.js';

// Design notes for this card: ./CARDS.md#workloads-effective-pod-request

// Layout B on the Workloads canon (WL): chips left, ladder right, a four-container Pod on the
// floor. Panel measured at x<=397, y<=254.66 (worst of 1600/1280/1100).
const PANEL_B = 255;

// Scheduler leads the row and is centred on CX (WL.L-07), so the spine to the Pod needs no jog.
const TOP1_X = 420, TOP1_W = 2 * (WL.CX - 420);          // 420..780, centred on CX
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = WL.R - TOP2_X;   // 840..1140
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);

// LAYOUT.B: the short chip column takes the band under the panel, the five-row ladder the free one.
const CHIP_GAP = 8;
const CHIP_X = LAYOUT.B.chips.x, CHIP_W = LAYOUT.B.chips.w;    // 60..540
const CHIP_Y = ladder({ y: PANEL_B + 20, rowH: WL.CHIP_H, gap: CHIP_GAP });   // 275..435
const LAD_X = LAYOUT.B.ladder.x, LAD_W = LAYOUT.B.ladder.w;    // 660..1140
const LAD_Y = 160;                                       // 5 rows -> 160..360

const NODE_H = 140, CANVAS_B = 624;
const NODE_Y = CANVAS_B - NODE_H;                        // 484..624, the frame rests on the floor

// Pod shell and its four containers, on the family workloads-init-containers-and-sidecars solved:
// four peers span the shell inside its padding at a fixed gap, so the width is derived.
const POD_W = 828, POD_H = 106;
const POD_X = WL.CX - POD_W / 2;                         // 186..1014, centred on CX
const POD_Y = NODE_Y + (NODE_H - POD_H) / 2;             // 501..607, centred in the frame
const C_PAD = 10, C_GAP = 16, C_H = 52;
const CONT = strip({ from: POD_X + C_PAD, to: POD_X + POD_W - C_PAD, count: 4, gap: C_GAP });
const C_Y = POD_Y + 28;                                  // 529..581, the family inner-box offset

// The spine leaves the Scheduler bottom midpoint and lands on the Pod top midpoint.
const SPINE = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, POD_Y]];

const CONT_KEYS = ['contInitA', 'contInitB', 'contSidecar', 'contApp'];

// The list order IS the append order, so it is the z-order: lanes and the wire label first, then
// the chip column and the packet layer, and ladder / Node / Pod / actors above the ball.
export const SCENE = {
  'aria-label': 'Effective Pod request: the highest single init container against the sum of the app and sidecar containers, plus Pod overhead, is the one number the Scheduler reserves and the Kubelet sizes the Pod cgroup from',
  parts: [
    P.defs(),
    P.lane({ key: 'connector', points: SPINE, dim: true, dashed: true, role: 'cluster' }),
    // The pair: the Scheduler asks on REQ_Y and the API answers on RESP_Y (WL.A-01).
    P.arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    // The three inputs of the formula, then the one number they produce.
    P.chip({ key: 'initChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'effective init request', value: 'not computed' }),
    P.chip({ key: 'appChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'effective non-init request', value: 'not computed' }),
    P.chip({ key: 'ovhChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'pod overhead', value: 'not read yet' }),
    P.chip({ key: 'effChip', x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'effective Pod request', value: 'not computed' }),
    P.packets(),
    // Appended AFTER the packet layer, so the ball runs under the ladder, the frame and the actors.
    P.chain({
      key: 'chain', x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP, role: 'cluster',
      items: [
        '1. spec      ·  four containers, four cpu requests',
        '2. init max  ·  highest single init, never their sum',
        '3. app sum   ·  app plus sidecar, they run together',
        '4. overhead  ·  RuntimeClass adds a fixed amount',
        '5. reserve   ·  the higher of the two, plus overhead',
      ],
    }),
    P.node({ key: 'nodeEl', x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' }),
    // These four are containers of ONE Pod, so they go INSIDE the shell rather than beside it:
    // pulsePod reaches only what the Pod group contains.
    P.pod({
      key: 'podGroup', id: 'podGroup', shellKey: 'shellEl',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: ' ', containers: 0,
      // buildPod carries ONE inner box and hands it the Pod's own role. These four are peers and
      // are cluster-role, so the pod part cannot state them and they are appended here.
      tune: (el, refs) => {
        refs.contInitA   = box({ x: CONT.x(0), y: C_Y, w: CONT.w, h: C_H, label: 'init-a',  sublabel: 'init · cpu 800m',    role: 'cluster' });
        refs.contInitB   = box({ x: CONT.x(1), y: C_Y, w: CONT.w, h: C_H, label: 'init-b',  sublabel: 'init · cpu 300m',    role: 'cluster' });
        refs.contSidecar = box({ x: CONT.x(2), y: C_Y, w: CONT.w, h: C_H, label: 'sidecar', sublabel: 'always · cpu 200m',  role: 'cluster' });
        refs.contApp     = box({ x: CONT.x(3), y: C_Y, w: CONT.w, h: C_H, label: 'app',     sublabel: 'app · cpu 400m',     role: 'cluster' });
        for (const k of CONT_KEYS) el.appendChild(refs[k]);
      },
    }),
    P.box({ key: 'scheduler', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Scheduler', sublabel: 'bins on the effective request', role: 'cluster' }),
    P.box({ key: 'apiEl', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'RuntimeClass · admission', role: 'cluster' }),
  ],
  reset: {
    keys: ['scheduler', 'apiEl', 'initChip', 'appChip', 'ovhChip', 'effChip', ...CONT_KEYS],
    pods: ['podGroup'],
  },
};

const NONE = 'not computed', INIT_MAX = 'max(800m, 300m) = 800m', APP_SUM = 'sum(200m, 400m) = 600m';
const OVH = '250m · RuntimeClass kata-fc', EFF = '250m + 800m = 1050m';

// The two top-row hops, stated once: the Scheduler asks on REQ_Y, the API answers on RESP_Y.
const ASK = { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y };
const ANSWER = { from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { initChip: NONE, appChip: NONE, ovhChip: 'not read yet', effChip: NONE },
    opacity: { podGroup: OPACITY.pending },
    chain: -1,
  },
  {
    id: 'spec',
    duration: 2600,
    narration: 'The Pod declares four containers and four cpu requests. Two are ordinary init containers, one is a native sidecar, which is an init container with restartPolicy=Always, and one is the app. Adding the four numbers up gives 1700m, and that is the answer almost everybody expects and the one Kubernetes never uses.',
    chips: { initChip: NONE, appChip: NONE, ovhChip: 'not read yet', effChip: NONE },
    wires: { req: 'unscheduled Pod · four cpu requests' },
    opacity: { podGroup: OPACITY.pending },
    lit: [...CONT_KEYS],
    chain: 0,
    flow: [
      F.top({ ...ANSWER, delay: BEAT.lead, lights: ['scheduler'] }),
    ],
  },
  {
    id: 'init-max',
    duration: 2600,
    narration: 'Init containers run strictly one at a time, so at no instant do two of them hold cpu together. The effective init request is therefore the HIGHEST single one, 800m here, and not the 1100m they add up to. A resource with no limit set anywhere counts as the highest limit, which is how one unbounded init container erases the ceiling for the whole Pod.',
    chips: { initChip: INIT_MAX, appChip: NONE, ovhChip: 'not read yet', effChip: NONE },
    wires: { req: 'effective init = max over init containers' },
    opacity: { podGroup: OPACITY.pending },
    // No packet and no Pod act here, so the beat is a static highlight alone (M-27): the two boxes
    // the maximum is taken over, and the chip it lands in.
    lit: ['contInitA', 'contInitB', 'initChip'],
    chain: 1,
  },
  {
    id: 'app-sum',
    duration: 2600,
    narration: 'The app container and the sidecar run at the same time for the whole life of the Pod, so their requests are SUMMED, 600m here. This is the line that catches people: the sidecar sits in the initContainers array, and it is still counted with the app containers and never in the init maximum.',
    chips: { initChip: INIT_MAX, appChip: APP_SUM, ovhChip: 'not read yet', effChip: NONE },
    wires: { req: 'effective non-init = sum of app and sidecar' },
    opacity: { podGroup: OPACITY.pending },
    lit: ['contSidecar', 'contApp', 'appChip'],
    chain: 2,
  },
  {
    id: 'overhead',
    duration: 2800,
    narration: 'If the Pod names a RuntimeClass that declares overhead, admission adds that fixed amount to the Pod, here 250m of cpu for a sandboxed runtime. It pays for the sandbox itself rather than for anything the containers asked for, it has been stable since 1.24, and a Pod on the default runtime simply has none of it.',
    chips: { initChip: INIT_MAX, appChip: APP_SUM, ovhChip: OVH, effChip: NONE },
    wires: { req: 'RuntimeClass overhead.podFixed · cpu 250m' },
    opacity: { podGroup: OPACITY.pending },
    lit: ['ovhChip'],
    chain: 3,
    flow: [
      F.top({ ...ASK, name: 'ask', lights: ['apiEl'] }),
      F.top({ ...ANSWER, after: 'ask', lights: ['scheduler'] }),
    ],
  },
  {
    id: 'reserve',
    duration: 3200,
    narration: 'The effective Pod request is the overhead plus the HIGHER of the two totals, so 1050m and not 1700m. The Scheduler bins the Pod on that number and the Kubelet sizes the Pod cgroup from the same one, which is the sting: init-a runs for eight seconds and its 800m is held against the Node for as long as the Pod lives.',
    chips: { initChip: INIT_MAX, appChip: APP_SUM, ovhChip: OVH, effChip: EFF },
    wires: { req: 'scheduled on cpu 1050m · held for the Pod lifetime' },
    opacity: { podGroup: 1 },
    lit: ['effChip', 'scheduler'],
    chain: 4,
    flow: [
      F.route({ points: SPINE, name: 'bind' }),
      // Down-arrow: the ball lands first, then the Pod blinks (M-16). NOT dim: pulsePodDim fills
      // opacity forward to OPACITY.pending, and this step ends at full.
      F.pulse({ pod: 'podGroup', at: 'bind' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
