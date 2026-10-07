import { P, F, defineCard, ladder, laneY, midX, strip, WL, LAYOUT, BEAT } from './workloads-kit.js';
import { box } from '../../lib/primitives.js';

// Design notes for this card: ./CARDS/workloads-init-containers-and-sidecars.md

// Layout B of WL: chips left, pipeline right, spine into the Node. The chip column spends the panel
// clearance, so a longer narration must be re-measured.

// The Kubelet is centred on CX for a straight spine (WL.L-07), the Runtime right-aligned on WL.R.
const TOP1_W = 232, TOP1_X = WL.CX - TOP1_W / 2;
const TOP2_W = 232, TOP2_X = WL.R - TOP2_W;
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);
const WIRE_Y = WL.TOP_Y - 12;                            // above the actor row, off the spine

// WL.L-06 picks layout B against this card measured panel bottom.
const LAD_X = LAYOUT.B.ladder.x, LAD_W = LAYOUT.B.ladder.w;
const LAD_Y = 160;

// The WL frame padding, 34 of label band over the Pod and 12 of floor under it, so the frame grows
// upward off the floor (L-24).
const POD_W = 828, POD_H = 106, CANVAS_B = 624;
const NODE_H = 34 + POD_H + 12;
const NODE_Y = CANVAS_B - NODE_H;                        // the frame rests on the floor

// Chips bottom-anchored 20 over the Node frame, so the column reads as a caption on the Pod it names.
const CHIP_GAP = 8;
const CHIPS_H = 4 * WL.CHIP_H + 3 * CHIP_GAP;
const CHIPS_TOP = NODE_Y - 20 - CHIPS_H;
const CHIP_X = LAYOUT.B.chips.x, CHIP_W = LAYOUT.B.chips.w;
const CHIP_Y = ladder({ y: CHIPS_TOP, rowH: WL.CHIP_H, gap: CHIP_GAP });

// Pod shell and its four containers, solved once so the row stays centred on CX.
const POD_X = WL.CX - POD_W / 2;
const POD_Y = NODE_Y + 34;
const C_PAD = 10, C_GAP = 16, C_H = 52;
// strip fixes the GAP, so the container width is derived.
const CONT = strip({ from: POD_X + C_PAD, to: POD_X + POD_W - C_PAD, count: 4, gap: C_GAP });
const C_Y = POD_Y + 28;                                     // the family inner-box offset

// WL.A-03: one straight drop that stops on the Node frame top face, never piercing it to the Pod.
const SPINE = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, NODE_Y]];

// Z-order: top lanes, wire label, chips, spine, packet layer, then chain, Node, Pod, actors above the ball.
export const SCENE = {
  'aria-label': 'Init containers and native sidecars: strictly sequential bootstrap, sidecar gates main, then parallel run',
  parts: [
    P.defs(),
    P.arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: above the top row, so the spine does not strike it.
    P.wire({ key: 'req', x: WIRE_X, y: WIRE_Y }),
    // State chip column in the left band: one chip per container.
    P.chip({ key: 'waitDbChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'wait-for-db', value: 'Waiting' }),
    P.chip({ key: 'migrateChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'migrate-schema', value: 'Waiting' }),
    P.chip({ key: 'sidecarChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'sidecar', value: 'Waiting' }),
    P.chip({ key: 'mainChip', x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'main', value: 'Waiting' }),
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
        '5. running        ·  sidecar + main in parallel until termination',
      ],
    }),
    P.node({ key: 'nodeEl', x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' }),
    // These four are containers of ONE Pod, so they go INSIDE the shell rather than beside it:
    // pulsePod reaches only what the Pod group contains.
    P.pod({
      key: 'podGroup', id: 'podGroup', shellKey: 'shellEl',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod app-7d4', sublabel: ' ', containers: 0,
      // buildPod carries one inner box with the Pod role, and these four peers are cluster-role,
      // so they are appended here.
      tune: (el, refs) => {
        refs.containerWaitDb   = box({ x: CONT.x(0), y: C_Y, w: CONT.w, h: C_H, label: 'wait-for-db',    sublabel: 'init container',       role: 'cluster' });
        refs.containerMigrate  = box({ x: CONT.x(1), y: C_Y, w: CONT.w, h: C_H, label: 'migrate-schema', sublabel: 'init container',       role: 'cluster' });
        refs.containerSidecar  = box({ x: CONT.x(2), y: C_Y, w: CONT.w, h: C_H, label: 'sidecar',        sublabel: 'restartPolicy=Always', role: 'cluster' });
        refs.containerMain     = box({ x: CONT.x(3), y: C_Y, w: CONT.w, h: C_H, label: 'main',           sublabel: 'app-server',           role: 'cluster' });
        for (const k of ['containerWaitDb', 'containerMigrate', 'containerSidecar', 'containerMain']) el.appendChild(refs[k]);
      },
    }),
    P.box({ key: 'runtime', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'Runtime', sublabel: 'containerd · CRI', role: 'cluster' }),
    P.box({ key: 'kubelet', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'sequences the init list', role: 'cluster' }),
  ],
  reset: {
    keys: ['kubelet', 'runtime', 'waitDbChip', 'migrateChip', 'sidecarChip', 'mainChip',
      'containerWaitDb', 'containerMigrate', 'containerSidecar', 'containerMain'],
    pods: ['podGroup'],
  },
};

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
    duration: 3200,
    narration: 'Kubelet asks the runtime to Create and Start wait-for-db via CRI. Init containers run strictly sequentially: a regular one must exit with code 0 before the next can start. A non-zero exit shows Init:Error and is retried with backoff (Init:CrashLoopBackOff), or fails the Pod if its restartPolicy is Never.',
    chips: { waitDbChip: RUNNING, migrateChip: WAITING, sidecarChip: WAITING, mainChip: WAITING },
    wires: { req: 'CreateContainer · StartContainer · wait-for-db' },
    lit: ['kubelet', 'waitDbChip'],
    chain: 0,
    // Running is earned where the create lands on the container box, so the chip waits for it.
    rewind: { chips: { waitDbChip: WAITING } },
    // Kubelet acts first, lit at entry, so its request waits BEAT.lead (M-18).
    flow: [
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, delay: BEAT.lead, name: 'req', lights: ['runtime'] }),
      F.route({ points: SPINE, after: 'req', fadeIn: true, name: 'create', lights: ['containerWaitDb'] }),
      F.set({ at: 'create', chips: { waitDbChip: RUNNING } }),
    ],
  },
  {
    id: 'migrate-schema',
    duration: 3800,
    narration: 'The wait-for-db container exits 0. Kubelet observes the exit via PLEG (Pod Lifecycle Event Generator) and then creates migrate-schema. The same rule applies, it must exit 0 before any later container can start. Each init container image is pulled lazily, just before that container is created, per its imagePullPolicy.',
    chips: { waitDbChip: DONE, migrateChip: RUNNING, sidecarChip: WAITING, mainChip: WAITING },
    wires: { req: 'wait-for-db exit 0 (PLEG) · StartContainer · migrate-schema' },
    // The Runtime acts first with the exit report, so it is lit at entry and the report waits BEAT.lead (M-18a).
    lit: ['runtime', 'waitDbChip', 'migrateChip'],
    chain: 1,
    rewind: { chips: { migrateChip: WAITING } },
    // Each hop chains on the previous arrival. Kubelet receives here, so it lights on arrival.
    flow: [
      F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, delay: BEAT.lead, name: 'pleg', lights: ['kubelet'] }),
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, after: 'pleg', name: 'req', lights: ['runtime'] }),
      F.route({ points: SPINE, after: 'req', fadeIn: true, name: 'create', lights: ['containerMigrate'] }),
      F.set({ at: 'create', chips: { migrateChip: RUNNING } }),
    ],
  },
  {
    id: 'sidecar-start',
    duration: 3800,
    narration: 'Both regular init containers exited 0. The sidecar (declared as an initContainer with restartPolicy=Always, beta in 1.29 and GA in 1.33) is started next, allowed to run for the full lifetime of the Pod. Once it reports Started (its startupProbe succeeded, or a running process where no probe is set), Kubelet moves on, and with no init container left, the main container starts next.',
    chips: { waitDbChip: DONE, migrateChip: DONE, sidecarChip: 'Started', mainChip: WAITING },
    wires: { req: 'migrate-schema exit 0 · StartContainer · sidecar' },
    // Kubelet receives before it sends, so it is dark at entry (R3). The Runtime sends first (M-18a).
    lit: ['runtime', 'migrateChip', 'sidecarChip'],
    chain: 2,
    rewind: { chips: { sidecarChip: WAITING } },
    flow: [
      F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, delay: BEAT.lead, name: 'done', lights: ['kubelet'] }),
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, after: 'done', name: 'req', lights: ['runtime'] }),
      F.route({ points: SPINE, after: 'req', fadeIn: true, name: 'create', lights: ['containerSidecar'] }),
      F.set({ at: 'create', chips: { sidecarChip: 'Started' } }),
    ],
  },
  {
    id: 'main-start',
    duration: 3800,
    narration: 'As soon as the sidecar Started flag flips true, Kubelet creates and starts the main container. From here both run in parallel. Pod phase flips from Pending to Running once the main container is running, even before its own startupProbe passes.',
    chips: { waitDbChip: DONE, migrateChip: DONE, sidecarChip: RUNNING, mainChip: RUNNING },
    wires: { req: 'sidecar running (PLEG) · started=true · StartContainer · main' },
    // Same as the step above: the report arrives before the call goes out, so Kubelet lights on it.
    lit: ['runtime', 'sidecarChip', 'mainChip'],
    chain: 3,
    rewind: { chips: { mainChip: WAITING } },
    // Kubelet derives started=true from the sidecar running report, so the report comes first.
    flow: [
      F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, delay: BEAT.lead, name: 'done', lights: ['kubelet'] }),
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, after: 'done', name: 'req', lights: ['runtime'] }),
      F.route({ points: SPINE, after: 'req', fadeIn: true, name: 'create', lights: ['containerMain'] }),
      F.set({ at: 'create', chips: { mainChip: RUNNING } }),
    ],
  },
  {
    id: 'running',
    // Shorter than the steps above on purpose: matching their 3800 would only add dead air (M-19a).
    duration: 2700,
    narration: 'Pod is Running. The sidecar handles cross-cutting concerns (proxy, log shipping, credential rotation) alongside main. Kubelet restarts the sidecar independently if it crashes (because restartPolicy=Always on the init slot). On Pod termination that order runs backwards.',
    chips: { waitDbChip: DONE, migrateChip: DONE, sidecarChip: RUNNING, mainChip: RUNNING },
    wires: { req: 'Pod Running · sidecar + main in parallel' },
    lit: ['sidecarChip', 'mainChip'],
    chain: 4,
    // The Pod changed state, so it pulses with its containers and none is lit alone: a lit box outlives the blink.
    flow: [
      F.pulse({ pod: 'podGroup' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
