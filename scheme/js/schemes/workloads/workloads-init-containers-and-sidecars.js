import { P, F, defineCard, ladder, laneY, midX, strip, WL, LAYOUT } from './workloads-kit.js';
import { box } from '../../lib/primitives.js';

// Design notes for this card: ./CARDS.md#workloads-init-containers-and-sidecars

// Layout B of the Workloads canon (WL): chips left, pipeline right, spine into the Pod.
// Panel worst case x<=397, y<=255; a longer narration invalidates that measurement.
const PANEL_B = 255;
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
const LAD_Y = 160;                                       // 5 rows -> 160..360

// Chips as a column in the left band, which only opens below the panel.
const CHIP_GAP = 8;
const CHIPS_TOP = PANEL_B + 20;                          // 275
const CHIP_X = LAYOUT.B.chips.x, CHIP_W = LAYOUT.B.chips.w;    // 60..540
const CHIP_Y = ladder({ y: CHIPS_TOP, rowH: WL.CHIP_H, gap: CHIP_GAP });   // 275..435

const NODE_H = 140, CANVAS_B = 624;
const NODE_Y = CANVAS_B - NODE_H;                        // 484..624, the frame rests on the floor

// Pod shell and its four containers, solved once so the row stays centred in the Node frame.
const POD_W = 828, POD_H = 106;
const POD_X = WL.CX - POD_W / 2;                            // 186..1014, centred on CX
const POD_Y = NODE_Y + (NODE_H - POD_H) / 2;                // 501..607, centred in the frame
const C_PAD = 10, C_GAP = 16, C_H = 52;
// The four containers span the shell inside its padding at a fixed gap, so the width is derived:
// strip fixes the GAP, and 190 is what four of them leave.
const CONT = strip({ from: POD_X + C_PAD, to: POD_X + POD_W - C_PAD, count: 4, gap: C_GAP });
const C_Y = POD_Y + 28;                                     // the family inner-box offset

// The spine steps into the central corridor between the two columns and reaches the Pod itself,
// not the frame edge above it.
const TOP1_CX = TOP1_X + TOP1_W / 2;                     // 530
const JOG_Y = WL.TOP_BOTTOM + 20;                        // 140, below the boxes, above the ladder
const SPINE = [[TOP1_CX, WL.TOP_BOTTOM], [TOP1_CX, JOG_Y], [WL.SPINE_X, JOG_Y], [WL.SPINE_X, POD_Y]];

// The list order IS the append order, so it is the z-order: the two top lanes, the wire label and
// the chip column first, then the spine and the packet layer, and chain / Node / Pod / actor row
// above the ball.
export const SCENE = {
  'aria-label': 'Init containers and native sidecars: strictly sequential bootstrap, sidecar gates main, then parallel run',
  parts: [
    P.defs(),
    P.arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the wire label sits ABOVE the top row, so the spine leaving the Kubelet box does
    // not strike it.
    P.wire({ key: 'req', x: WIRE_X, y: WIRE_Y }),
    // State chip column in the left band: one chip per container.
    P.chip({ key: 'waitDbChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'wait-for-db', value: 'Waiting' }),
    P.chip({ key: 'migrateChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'migrate-schema', value: 'Waiting' }),
    P.chip({ key: 'sidecarChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'sidecar', value: 'Waiting' }),
    P.chip({ key: 'mainChip', x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'main', value: 'Waiting' }),
    // Connector from the Kubelet box into the Pod, down the central corridor.
    P.lane({ key: 'connector', points: SPINE, dim: true, dashed: true, role: 'cluster' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.chain({
      key: 'chain', x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP, role: 'cluster',
      items: [
        '1. wait-for-db    ·  first init container, must exit 0',
        '2. migrate-schema ·  next init, after #1 succeeds',
        '3. sidecar        ·  Always-restart initC, gates main',
        '4. main           ·  starts when sidecar reports Started',
        '5. running        ·  sidecar + main in parallel until term',
      ],
    }),
    P.node({ key: 'nodeEl', x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' }),
    // These four are containers of ONE Pod, so the Pod has to be on the canvas: without a shell
    // there was nothing for a pulse to belong to. They are appended INSIDE the shell rather than
    // beside it, because pulsePod only reaches what the Pod group contains.
    P.pod({
      key: 'podGroup', id: 'podGroup', shellKey: 'shellEl',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod app-7d4', sublabel: ' ', containers: 0,
      // buildPod carries ONE inner box and hands it the Pod's own role. These four are peers and
      // are cluster-role, so the pod part cannot state them and they are appended here.
      tune: (el, refs) => {
        refs.containerWaitDb   = box({ x: CONT.x(0), y: C_Y, w: CONT.w, h: C_H, label: 'wait-for-db',    sublabel: 'init container',       role: 'cluster' });
        refs.containerMigrate  = box({ x: CONT.x(1), y: C_Y, w: CONT.w, h: C_H, label: 'migrate-schema', sublabel: 'init container',       role: 'cluster' });
        refs.containerSidecar  = box({ x: CONT.x(2), y: C_Y, w: CONT.w, h: C_H, label: 'sidecar',        sublabel: 'restartPolicy=Always', role: 'cluster' });
        refs.containerMain     = box({ x: CONT.x(3), y: C_Y, w: CONT.w, h: C_H, label: 'main',           sublabel: 'app-server',           role: 'cluster' });
        for (const k of ['containerWaitDb', 'containerMigrate', 'containerSidecar', 'containerMain']) el.appendChild(refs[k]);
      },
    }),
    P.box({ key: 'runtime', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'Runtime', sublabel: 'containerd · CRI', role: 'cluster' }),
    P.box({ key: 'kubelet', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'container orchestrator', role: 'cluster' }),
  ],
  reset: {
    keys: ['kubelet', 'runtime', 'waitDbChip', 'migrateChip', 'sidecarChip', 'mainChip',
      'containerWaitDb', 'containerMigrate', 'containerSidecar', 'containerMain'],
    pods: ['podGroup'],
  },
};

// The three container states this card cycles through, named once so a four-key `chips` block
// stays one readable line.
const WAITING = 'Waiting', DONE = 'Completed', RUNNING = 'Running';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { waitDbChip: WAITING, migrateChip: WAITING, sidecarChip: WAITING, mainChip: WAITING },
    chain: -1,
  },
  {
    id: 'wait-for-db',
    duration: 2600,
    narration: 'Kubelet asks the runtime to Create and Start wait-for-db via CRI. Init containers run strictly sequentially: each one must exit with code 0 before the next can start. A non-zero exit keeps the Pod in Init:0/3 with a Kubelet restart-backoff (respecting Pod.spec.restartPolicy).',
    chips: { waitDbChip: RUNNING, migrateChip: WAITING, sidecarChip: WAITING, mainChip: WAITING },
    wires: { req: 'CreateContainer · StartContainer · wait-for-db' },
    lit: ['kubelet', 'waitDbChip'],
    chain: 0,
    // CRI request hits the runtime (top hop), then the create travels down to
    // the node and the container box lights up on arrival.
    flow: [
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'req', lights: ['runtime'] }),
      F.route({ points: SPINE, after: 'req', fadeIn: true, lights: ['containerWaitDb'] }),
    ],
  },
  {
    id: 'migrate-schema',
    duration: 3400,
    narration: 'The wait-for-db container exits 0. Kubelet observes the exit via PLEG (Pod Lifecycle Event Generator) and immediately creates migrate-schema. The same rule applies, it must exit 0 before any later container can start. Each init container image is pulled lazily, just before that container is created, per its imagePullPolicy.',
    chips: { waitDbChip: DONE, migrateChip: RUNNING, sidecarChip: WAITING, mainChip: WAITING },
    wires: { req: 'wait-for-db exit 0 (PLEG) · StartContainer · migrate-schema' },
    lit: ['waitDbChip', 'runtime', 'migrateChip'],
    chain: 1,
    // PLEG callback, then the next CRI request, then the create down to the node, each hop chained
    // on the previous arrival. The runtime REPORTS first, so the Kubelet lights when it lands.
    flow: [
      F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, name: 'pleg', lights: ['kubelet'] }),
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, after: 'pleg', name: 'req' }),
      F.route({ points: SPINE, after: 'req', fadeIn: true, lights: ['containerMigrate'] }),
    ],
  },
  {
    id: 'sidecar-start',
    // Motion: the runtime's report comes back (700), then StartContainer goes out and the
    // container lands on the node, ending at 3162.
    duration: 3400,
    narration: 'Both regular init containers exited 0. The sidecar (declared as an initContainer with restartPolicy=Always since 1.29) is started next, allowed to run for the full lifetime of the Pod. Once it reports Started (its startupProbe succeeded, or immediately if no probe is set), Kubelet treats the bootstrap phase as complete and unblocks the main container.',
    chips: { waitDbChip: DONE, migrateChip: DONE, sidecarChip: 'Started', mainChip: WAITING },
    wires: { req: 'migrate-schema exit 0 · StartContainer · sidecar' },
    // Kubelet RECEIVES the exit report before it sends the next call, so it is dark at entry: R3
    // exempts a source only if it sends no later than it receives.
    lit: ['migrateChip', 'sidecarChip'],
    chain: 2,
    // The wire label opens with the runtime REPORTING the init container finished, so that report
    // comes back first on the answer lane and only then does the next StartContainer go out.
    flow: [
      F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, name: 'done', lights: ['kubelet'] }),
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, after: 'done', name: 'req', lights: ['runtime'] }),
      F.route({ points: SPINE, after: 'req', fadeIn: true, lights: ['containerSidecar'] }),
    ],
  },
  {
    id: 'main-start',
    // Motion: the runtime's report comes back (700), then StartContainer goes out and the
    // container lands on the node, ending at 3162.
    duration: 3400,
    narration: 'As soon as the sidecar Started flag flips true, Kubelet creates and starts the main container. From here both run in parallel. Pod phase flips from Pending to Running once the main container has started.',
    chips: { waitDbChip: DONE, migrateChip: DONE, sidecarChip: RUNNING, mainChip: 'Starting' },
    wires: { req: 'sidecar Started · StartContainer · main' },
    // Same as the step above: the report arrives before the call goes out, so Kubelet lights on it.
    lit: ['sidecarChip', 'mainChip'],
    chain: 3,
    // The wire label opens with `sidecar Started`, the runtime reporting the sidecar up. It arrives
    // first on the answer lane, and the StartContainer for the main container follows it.
    flow: [
      F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, name: 'done', lights: ['kubelet'] }),
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, after: 'done', name: 'req', lights: ['runtime'] }),
      F.route({ points: SPINE, after: 'req', fadeIn: true, lights: ['containerMain'] }),
    ],
  },
  {
    id: 'running',
    duration: 2000,
    narration: 'Pod is Running. The sidecar handles cross-cutting concerns (proxy, log shipping, credential rotation) alongside main. Kubelet restarts the sidecar independently if it crashes (because restartPolicy=Always on the init slot). On Pod termination the order reverses: regular containers terminate first, then sidecars, so cleanup paths can still talk through the proxy.',
    chips: { waitDbChip: DONE, migrateChip: DONE, sidecarChip: RUNNING, mainChip: RUNNING },
    wires: { req: 'Pod Running · sidecar + main in parallel' },
    lit: ['sidecarChip', 'mainChip', 'containerSidecar', 'containerMain'],
    chain: 4,
    // The Pod is what changed state here, so the Pod is what pulses.
    flow: [
      F.pulse({ pod: 'podGroup' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
