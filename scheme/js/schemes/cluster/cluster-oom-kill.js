import { LANE_DY, P, F, defineCard, laneY, ladder, strip, midX, CLU, LAYOUT, FADE, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-oom-kill.md

// Layout C: ladder right, chips in a two-row bottom strip. The Node frame top caps narration at roughly 570 characters.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;
const CX = midX(CONTENT_L, CONTENT_R);

const BOX_W = CLU.BOX_W, BOX_H = CLU.BOX_H;
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;
const SPINE_X = CX;  // the Node frame midpoint, clear of the panel
const KUBE_X = SPINE_X - BOX_W / 2;
const KUBE_R = KUBE_X + BOX_W;  // the face both top hops leave from
// The kernel right-aligns on CONTENT_R, level with the right chip column, the ladder and the frame.
const KERN_X = CONTENT_R - BOX_W;
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);
const { out: UP_Y, back: DOWN_Y } = laneY(TOP_CY, LANE_DY);
const WIRE_X = midX(KUBE_R, KERN_X);
const WIRE_Y = TOP_Y - 14;  // above the row: the spine owns below it

const LADDER_X = LAYOUT.C.ladder.x, LADDER_W = LAYOUT.C.ladder.w;
const LADDER_Y = 170, ROW_H = CLU.ROW_H, ROW_GAP = CLU.ROW_GAP;

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;
// The family padding (CLU.L-01) round a taller Pod.
const POD_W = 480, POD_H = 110;
const NODE_Y = 380, NODE_H = CLU.NODE.POD_DY + POD_H + 12;
const POD_X = CX - POD_W / 2;
const POD_Y = NODE_Y + CLU.NODE.POD_DY;
const CONT_W = 300, CONT_H = 64;
const CONT_X = CX - CONT_W / 2;
const CONT_Y = POD_Y + 30;

// Two per row: four across overlaps names and values.
const CHIP_H = CLU.CHIP_H, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = NODE_Y + NODE_H + 16;
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// The strip is a grid: the index wraps across the columns and steps down every second.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

// The one lane, addressed to the Node frame, not the Pod inside it. routeDur is length-based, so moving an end retimes the ball (A-11, M-20).
const NODE_CONNECTOR = [[SPINE_X, TOP_BOTTOM], [SPINE_X, NODE_Y]];

// No tie from a top-row block to the ladder: it has three owners in five rows.

// oom_score_adj is a standing lookup, written at build and restated by every step.
const OOM_SCORE = '900 Burstable 3 to 999, Guaranteed -997, BestEffort 1000';

// Append order is z-order: top lanes and wire, chips, connector, packets, ladder, Node frame and Pod.
export const SCENE = {
  'aria-label': 'Container OOMKill: cgroup memory.max, kernel cgroup OOM killer, Kubelet observation via PLEG, restart',
  parts: [
    P.defs(),
    // Top-row lanes, one per direction, straddling the row centre by LANE_DY.
    P.arrow({ x1: KUBE_R, y1: UP_Y, x2: KERN_X, y2: UP_Y, dim: true, dashed: true }),
    P.arrow({ x1: KERN_X, y1: DOWN_Y, x2: KUBE_R, y2: DOWN_Y, dim: true, dashed: true }),
    P.wire({ key: 'kernel', x: WIRE_X, y: WIRE_Y }),
    P.chip({ key: 'memChip', x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'memory.current / max', value: '100Mi / 256Mi' }),
    P.chip({ key: 'oomScoreChip', x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'oom_score_adj', value: OOM_SCORE }),
    P.chip({ key: 'terminationChip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'container state', value: 'Running' }),
    P.chip({ key: 'restartChip', x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'restartCount', value: '0' }),
    P.lane({ points: NODE_CONNECTOR, dim: true, dashed: true }),
    // Packet layer under the blocks so a packet tucks under its destination on arrival.
    P.packets(),
    P.chain({
      key: 'chain', x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. allocate ·  workload pushes memory.current up',
        '2. cgroup   ·  usage hits memory.max, kernel notified',
        '3. OOMKill  ·  cgroup OOM killer SIGKILLs the container',
        '4. observe  ·  PLEG sees terminated, PATCH Pod status',
        '5. restart  ·  same sandbox, new container, count++',
      ],
    }),
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    // Opacity lives on the group, never on containerBox, or the two multiply.
    P.pod({
      key: 'podGroup', id: 'podGroup', innerKey: 'containerBox',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { dx: CONT_X - POD_X, dy: CONT_Y - POD_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'using 100Mi of 256Mi' },
    }),
    // Top-row blocks last.
    P.box({ key: 'kubelet', x: KUBE_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Kubelet', sublabel: 'PLEG + status patch' }),
    P.box({ key: 'kernel', x: KERN_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Linux kernel', sublabel: 'cgroup OOM killer' }),
  ],
  reset: {
    keys: ['kubelet', 'kernel', 'memChip', 'oomScoreChip', 'terminationChip', 'restartChip'],
    pods: ['podGroup'],
  },
};

// What memory.current reads once the SIGKILL has taken the container down.
const DEAD_MEM = 'near 0 / 256Mi · processes killed';
const DEAD_STATE = 'Terminated · OOMKilled · 137';
const AT_LIMIT = '256Mi / 256Mi · at limit';
const GONE = OPACITY.terminated;

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { memChip: '100Mi / 256Mi', oomScoreChip: OOM_SCORE, terminationChip: 'Running', restartChip: '0' },
    sublabels: { containerBox: 'using 100Mi of 256Mi' },
    opacity: { podGroup: 1 },
    chain: -1,
  },
  {
    id: 'allocate',
    duration: 2000,
    narration: 'The workload grows, and memory.current keeps rising toward memory.max as the container allocates anonymous pages, page cache, and slab. The cgroup memory controller accounts every byte against the limit.',
    chips: { memChip: '220Mi / 256Mi · climbing', oomScoreChip: OOM_SCORE, terminationChip: 'Running', restartChip: '0' },
    wires: { kernel: 'memory.current rising · charged to the cgroup' },
    sublabels: { containerBox: 'using 220Mi of 256Mi' },
    opacity: { podGroup: 1 },
    lit: ['memChip'],
    chain: 0,
    flow: [F.pulse({ pod: 'podGroup' })],
  },
  {
    id: 'cgroup',
    duration: 2000,
    narration: 'Usage in memory.current reaches memory.max. The cgroup memory controller cannot reclaim enough (swap is disabled on most Kubernetes Nodes), so the kernel raises an out-of-memory event scoped to this one cgroup.',
    chips: { memChip: AT_LIMIT, oomScoreChip: OOM_SCORE, terminationChip: 'Running', restartChip: '0' },
    wires: { kernel: 'memory.current == memory.max · cgroup OOM event' },
    sublabels: { containerBox: 'using 256Mi of 256Mi · at limit' },
    opacity: { podGroup: 1 },
    lit: ['memChip', 'kernel'],
    chain: 1,
    flow: [F.pulse({ pod: 'podGroup' })],
  },
  {
    id: 'oomkill',
    duration: 2300,
    // The runtime writes memory.oom.group, the Kubelet only asks for it over CRI.
    narration: 'Reclaim has failed at memory.max, so the kernel invokes the cgroup-scoped OOM killer. The runtime set memory.oom.group on that cgroup at container start under cgroup v2, so the kernel SIGKILLs every process in the container as one unit rather than the single worst offender. The oom_score_adj applied at container start from the QoS class ranks containers when the whole Node runs out, not inside one cgroup.',
    // Container state still reads Running: the Kubelet has not observed the kill yet.
    chips: { memChip: AT_LIMIT, oomScoreChip: OOM_SCORE, terminationChip: 'Running · not yet observed', restartChip: '0' },
    wires: { kernel: 'cgroup OOM killer · SIGKILL to the container' },
    sublabels: { containerBox: 'OOMKilled · SIGKILL' },
    opacity: { podGroup: GONE },
    lit: ['kernel', 'oomScoreChip'],
    chain: 2,
    // An in-place kernel event, nothing travels: the Pod flinches, then goes dark a beat later.
    flow: [
      F.pulse({ pod: 'podGroup', delay: 200 }),
      F.fade({ target: 'podGroup', from: 1, to: GONE, dur: FADE.out, delay: 700, fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'observe',
    duration: 2100,
    narration: 'PLEG (Pod Lifecycle Event Generator) spots the dead container on its next relist of the container runtime. Kubelet PATCHes the container status to terminated with reason OOMKilled and exitCode 137 (128 + 9 for SIGKILL). Where that record goes once the container restarts is covered in the Container Restarts and lastState card.',
    // memory.current fell away with the killed processes.
    chips: { memChip: DEAD_MEM, oomScoreChip: OOM_SCORE, terminationChip: DEAD_STATE, restartChip: '0' },
    wires: { kernel: 'container exited 137 · PLEG relist · PATCH status' },
    sublabels: { containerBox: 'terminated · exit 137' },
    opacity: { podGroup: GONE },
    lit: ['memChip', 'terminationChip', 'kernel'],
    chain: 3,
    // Container state is what the Kubelet knows, so it holds until the relist result lands.
    rewind: { chips: { terminationChip: 'Running · not yet observed' } },
    // The relist result rides the answer lane, and the Kubelet lights on its arrival.
    flow: [
      F.top({ from: KERN_X, to: KUBE_R, y: DOWN_Y, name: 'relist', lights: ['kubelet'] }),
      F.set({ at: 'relist', chips: { terminationChip: DEAD_STATE } }),
    ],
  },
  {
    id: 'restart',
    duration: 2500,
    narration: 'The restartPolicy is Always (the default), so Kubelet starts a fresh container inside the same Pod sandbox. The Pod IP and Linux namespaces are preserved and restartCount increments. Repeated OOMKills trip CrashLoopBackOff, and the backoff behind it is covered in the CrashLoopBackOff and Restart Backoff card.',
    chips: { memChip: '120Mi / 256Mi', oomScoreChip: OOM_SCORE, terminationChip: 'Running (restarted)', restartChip: '1' },
    // "applied", not "written": the runtime touches the cgroup file, and this card draws no runtime block.
    wires: { kernel: 'new container · memory.max + oom_score_adj applied' },
    sublabels: { containerBox: 'using 120Mi of 256Mi' },
    opacity: { podGroup: 1 },
    lit: ['kubelet', 'memChip', 'terminationChip', 'restartChip'],
    chain: 4,
    // The new container does not exist until the create lands, so box and chips turn over on arrival.
    rewind: {
      chips: { memChip: DEAD_MEM, oomScoreChip: OOM_SCORE, terminationChip: DEAD_STATE, restartChip: '0' },
      sublabels: { containerBox: 'terminated · exit 137' },
    },
    // The turnover is emitted after the CRI hop, because order is observable.
    flow: [
      F.route({ points: NODE_CONNECTOR, name: 'create' }),
      F.top({ from: KUBE_R, to: KERN_X, y: UP_Y, delay: 200, lights: ['kernel'] }),
      F.set({
        at: 'create',
        chips: { memChip: '120Mi / 256Mi', oomScoreChip: OOM_SCORE, terminationChip: 'Running (restarted)', restartChip: '1' },
        sublabels: { containerBox: 'using 120Mi of 256Mi' },
      }),
      F.pulse({ pod: 'podGroup', at: 'create' }),
      F.fade({ target: 'podGroup', from: GONE, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
