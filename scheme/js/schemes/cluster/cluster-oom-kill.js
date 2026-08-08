import { P, F, defineCard, laneY, ladder, strip, midX, CLU, LAYOUT, FADE, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS.md#cluster-oom-kill

// Layout C: ladder right, chips in a two-row bottom strip. Panel x<=397 y<=280, frame top 388, so
// NO NARRATION MAY PASS ROUGHLY 570 CHARACTERS. The ceiling belongs to the frame, not to the text.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = midX(CONTENT_L, CONTENT_R);                   // 600, the canvas centre by construction

const BOX_W = CLU.BOX_W, BOX_H = CLU.BOX_H;              // 232 / 80
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;     // 40 / 120
const SPINE_X = CX;                                      // 600, the Node frame midpoint, clear of the panel
const KUBE_X = SPINE_X - BOX_W / 2;                      // 484..716
const KUBE_R = KUBE_X + BOX_W;                           // 716, the face both top hops leave from
// The kernel right-aligns on CONTENT_R, level with the right chip column, the ladder and the frame.
// One box centred on the spine, one flush to the content edge, as on cluster-node-pressure-eviction.
const KERN_X = CONTENT_R - BOX_W;                        // 908..1140
const LANE_DY = CLU.LANE_DY, TOP_CY = midX(TOP_Y, TOP_BOTTOM);   // 12 / 80
const { out: UP_Y, back: DOWN_Y } = laneY(TOP_CY, LANE_DY);      // 68 / 92
const WIRE_X = midX(KUBE_R, KERN_X);                     // 812, the gap midpoint
const WIRE_Y = TOP_Y - 14;                               // 26, above the row: the spine owns below it

const LADDER_X = LAYOUT.C.ladder.x, LADDER_W = LAYOUT.C.ladder.w;   // 660..1140
const LADDER_Y = 170, ROW_H = CLU.ROW_H, ROW_GAP = CLU.ROW_GAP;     // 5 rows -> 170..370

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;// 60..1140
const NODE_Y = 388, NODE_H = 144;                        // 388..532, the first row clear of the panel
const POD_W = 480, POD_H = 110;
const POD_X = CX - POD_W / 2;                            // 360..840
const POD_Y = NODE_Y + 20;                               // 408..518
const CONT_W = 300, CONT_H = 64;
const CONT_X = CX - CONT_W / 2;                          // 450..750
const CONT_Y = POD_Y + 30;                               // 438..502

// Bottom strip, TWO per row: four across leaves 258 units and the names overlap their values.
const CHIP_H = CLU.CHIP_H, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = NODE_Y + NODE_H + 16;                    // 548, second row ends on 624
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;                               // 532, which is LAYOUT.C.strip.two
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// The strip is read as a GRID: the index wraps across the two columns and steps down every second.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

// The one lane, shared by the static pathArrow and the packet route: Kubelet bottom face midpoint to
// Node frame top face midpoint, both on the spine. Addressed to the NODE, not the Pod inside it.
const NODE_CONNECTOR = [[SPINE_X, TOP_BOTTOM], [SPINE_X, NODE_Y]];

// NO tie from a top-row block to the ladder: that line is only true when ONE block owns every row,
// and this ladder has three owners in five. Hanging it off one would say that block does all five.

// oom_score_adj is a standing value carrying the whole ranking scale, so it is a lookup on the chip
// rather than a sentence: it is written at build and restated by every step, idle included.
const OOM_SCORE = '900 Burstable 3 to 999, Guaranteed -997, BestEffort 1000';

// The list order IS the append order, so it is the z-order: the two top lanes and the wire label,
// the four chips, the one connector, the packet layer, the ladder, the Node frame and its Pod.
export const SCENE = {
  'aria-label': 'Container OOMKill: cgroup memory.max, kernel cgroup OOM killer, Kubelet observation via PLEG, restart',
  parts: [
    P.defs(),
    // Top-row lanes, one per direction, straddling the row centre line by LANE_DY.
    P.arrow({ x1: KUBE_R, y1: UP_Y, x2: KERN_X, y2: UP_Y, dim: true, dashed: true }),
    P.arrow({ x1: KERN_X, y1: DOWN_Y, x2: KUBE_R, y2: DOWN_Y, dim: true, dashed: true }),
    P.wire({ key: 'kernel', x: WIRE_X, y: WIRE_Y }),
    // State chips, a two-column bottom strip across the content width.
    P.chip({ key: 'memChip', x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'memory.current / max', value: '100Mi / 256Mi' }),
    P.chip({ key: 'oomScoreChip', x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'oom_score_adj', value: OOM_SCORE }),
    P.chip({ key: 'terminationChip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'container state', value: 'Running' }),
    P.chip({ key: 'restartChip', x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'restartCount', value: '0' }),
    P.lane({ points: NODE_CONNECTOR, dim: true, dashed: true }),
    // Z-order canon: packetLayer first (under the blocks) so a packet tucks under
    // its destination on arrival; then chain, node, pod, then top-row blocks last.
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
    // Grouped for z-order, shared pulse AND shared opacity: the kill dims the whole group, shell
    // included. Opacity lives on the GROUP, never on containerBox, or the two multiply.
    P.pod({
      key: 'podGroup', id: 'podGroup', innerKey: 'containerBox',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { dx: CONT_X - POD_X, dy: CONT_Y - POD_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'using 100Mi of 256Mi' },
    }),
    // Top-row blocks ABSOLUTE LAST.
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
    // Pulse marks the new reading the container block just showed (220Mi).
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
    // Pulse marks the container block hitting the cap (256Mi of 256Mi).
    flow: [F.pulse({ pod: 'podGroup' })],
  },
  {
    id: 'oomkill',
    duration: 2300,
    // The RUNTIME writes memory.oom.group, the Kubelet only asks for it over CRI. Verification and
    // the singleProcessOOMKill footnote are in ./CARDS.md.
    narration: 'Reclaim has failed at memory.max, so the kernel invokes the cgroup-scoped OOM killer. The runtime sets memory.oom.group on that cgroup under cgroup v2, so the kernel SIGKILLs every process in the container as one unit rather than the single worst offender. The oom_score_adj applied at container start from the QoS class ranks containers when the whole Node runs out, not inside one cgroup.',
    // containerStatuses[].state is still Running at this instant: the kernel killed the process
    // and the Kubelet has not told the API yet, which is the observe step.
    chips: { memChip: AT_LIMIT, oomScoreChip: OOM_SCORE, terminationChip: 'Running · not yet observed', restartChip: '0' },
    wires: { kernel: 'cgroup OOM killer · SIGKILL to the container' },
    sublabels: { containerBox: 'OOMKilled · SIGKILL' },
    // Pin final state inline so cancel between steps does not flash to default.
    opacity: { podGroup: GONE },
    lit: ['kernel', 'oomScoreChip'],
    chain: 2,
    // An in-place kernel event, so nothing travels: the Pod flinches, then goes dark a beat later.
    // The sandbox surviving is carried by the restart step in words, not by holding the shell lit.
    flow: [
      F.pulse({ pod: 'podGroup', delay: 200 }),
      F.fade({ target: 'podGroup', from: 1, to: GONE, dur: FADE.out, delay: 700, fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'observe',
    duration: 2100,
    narration: 'PLEG (Pod Lifecycle Event Generator) spots the dead container on its next relist of the container runtime. Kubelet PATCHes the container status to terminated with reason OOMKilled and exitCode 137 (128 + 9 for SIGKILL). After the restart this record moves to lastState.terminated, which is what kubectl describe and get show.',
    // memory.current fell away with the processes the SIGKILL took: it read at limit here for as
    // long as the step wrote only one chip, beside a container the same step calls terminated.
    chips: { memChip: DEAD_MEM, oomScoreChip: OOM_SCORE, terminationChip: DEAD_STATE, restartChip: '0' },
    wires: { kernel: 'container exited 137 · PLEG relist · PATCH status' },
    sublabels: { containerBox: 'terminated · exit 137' },
    opacity: { podGroup: GONE },
    lit: ['memChip', 'terminationChip', 'kernel'],
    chain: 3,
    // `container state` is what the Kubelet KNOWS, so it holds what oomkill left until the relist
    // result lands, which is the whole point of this step.
    rewind: { chips: { terminationChip: 'Running · not yet observed' } },
    flow: [
      F.top({ from: KERN_X, to: KUBE_R, y: DOWN_Y, name: 'relist', lights: ['kubelet'] }),
      F.set({ at: 'relist', chips: { terminationChip: DEAD_STATE } }),
    ],
  },
  {
    id: 'restart',
    duration: 2500,
    narration: 'The restartPolicy is Always (the default), so Kubelet starts a fresh container inside the same Pod sandbox. The Pod IP and Linux namespaces are preserved and restartCount increments. Repeated OOMKills trip CrashLoopBackOff, so each retry is delayed exponentially from 10s up to a 5 min cap, and 10 minutes of clean running resets it.',
    chips: { memChip: '120Mi / 256Mi', oomScoreChip: OOM_SCORE, terminationChip: 'Running (restarted)', restartChip: '1' },
    // "applied", not "written": Kubelet passes both in the CRI create call and the runtime is what
    // touches the cgroup file and /proc/PID/oom_score_adj. This card draws no runtime block.
    wires: { kernel: 'new container · memory.max + oom_score_adj applied' },
    sublabels: { containerBox: 'using 120Mi of 256Mi' },
    // Pin final state inline.
    opacity: { podGroup: 1 },
    lit: ['kubelet', 'memChip', 'terminationChip', 'restartChip'],
    chain: 4,
    // The new container does not exist until the create lands, so the box and the three chips it
    // moves hold what observe left and turn over together on arrival, with the pulse and the fade.
    rewind: {
      chips: { memChip: DEAD_MEM, oomScoreChip: OOM_SCORE, terminationChip: DEAD_STATE, restartChip: '0' },
      sublabels: { containerBox: 'terminated · exit 137' },
    },
    // The create drops down the connector while the CRI call rides the top hop 200ms behind it. The
    // turnover is emitted where the handwritten at() stood, AFTER that hop, because order is observable.
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
