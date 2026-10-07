import { LANE_DY, P, F, defineCard, laneY, ladder, strip, midX, CLU, LAYOUT, FADE, OPACITY } from './cluster-kit.js';
import { rect } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/cluster-cpu-throttling.md

// Layout C, the twin of cluster-oom-kill with the sibling ladder replaced by the time scale.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;
const CX = midX(CONTENT_L, CONTENT_R);

const BOX_W = CLU.BOX_W, BOX_H = CLU.BOX_H;
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;
const SPINE_X = CX;
const KUBE_X = SPINE_X - BOX_W / 2;
const KUBE_R = KUBE_X + BOX_W;
const KERN_X = CONTENT_R - BOX_W;
const KERN_CX = midX(KERN_X, CONTENT_R);
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);
const { out: UP_Y, back: DOWN_Y } = laneY(TOP_CY, LANE_DY);
const WIRE_X = midX(KUBE_R, KERN_X);
const WIRE_Y = TOP_Y - 14;

// Three equal bars, one 100ms CFS period each, stacked so they read as one clock.
const FRAME_X = LAYOUT.C.ladder.x, FRAME_W = LAYOUT.C.ladder.w;
const FRAME_R = FRAME_X + FRAME_W;
// The stack sits inside a Node-family frame on the Node padding, bars inset from the walls.
const FRAME_Y = 160, FRAME_PAD = 24;
const BAR_H = 40, BAR_GAP = 14, BAR_N = 3;
const FRAME_H = CLU.NODE.POD_DY + BAR_H * BAR_N + BAR_GAP * (BAR_N - 1) + 12;
const SCALE_X = FRAME_X + FRAME_PAD, SCALE_W = FRAME_W - FRAME_PAD * 2;
const SCALE_R = SCALE_X + SCALE_W;
const SCALE_CX = midX(SCALE_X, SCALE_R);
const SCALE_Y = FRAME_Y + CLU.NODE.POD_DY;
const BAR_Y = ladder({ y: SCALE_Y, rowH: BAR_H, gap: BAR_GAP });
const CAP_Y = FRAME_Y + 18;
// limits.cpu 500m against the default 100ms period: 50ms of run time in every 100.
const RUN_W = SCALE_W / 2;

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;
const NODE_Y = 380, NODE_H = CLU.NODE.H;
const POD_W = 480, POD_H = CLU.NODE.POD_H;
const POD_X = CX - POD_W / 2;
const POD_Y = NODE_Y + CLU.NODE.POD_DY;
const CONT_W = 300, CONT_H = 64;
const CONT_X = CX - CONT_W / 2;
const CONT_Y = POD_Y + 30;

// Two chips per row: four across and the names overlap their values.
const CHIP_H = CLU.CHIP_H, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = NODE_Y + NODE_H + 16;
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

// Relationship lines: nothing travels either way. The scale one lives inside the scale group.
const NODE_RELATION = [[SPINE_X, TOP_BOTTOM], [SPINE_X, NODE_Y]];
const JOG_Y = midX(TOP_BOTTOM, FRAME_Y);
// Lands on the frame top-wall midpoint, which OFFEDGE cannot score (a frame is not a block face).
const SCALE_RELATION = [[KERN_CX, TOP_BOTTOM], [KERN_CX, JOG_Y], [SCALE_CX, JOG_Y], [SCALE_CX, FRAME_Y]];

// Presentation shades, not lifecycle phases. The cluster tint is copied because a presentation
// attribute cannot resolve a token.
const BAR = Object.freeze({
  track:  'rgba(255, 255, 255, 0.04)',
  stroke: 'rgba(125, 134, 255, 0.35)',
  run:    'rgba(125, 134, 255, 0.55)',
});

const BAR_I = [...Array(BAR_N).keys()];
const RUN_KEYS = BAR_I.map(i => 'run' + i);
const CAP_KEYS = BAR_I.map(i => 'cap' + i);

// Bare rects: box() would drag CENTRE-LOW off centre.
const period = (i) => [
  P.raw({
    make: () => {
      const track = rect({ x: SCALE_X, y: BAR_Y(i), width: SCALE_W, height: BAR_H, rx: 6, ry: 6 });
      track.style.fill = BAR.track;
      track.style.stroke = BAR.stroke;
      track.style.strokeWidth = '1.2';
      return track;
    },
  }),
  P.raw({
    key: RUN_KEYS[i],
    make: () => {
      const run = rect({ x: SCALE_X, y: BAR_Y(i), width: 0, height: BAR_H, rx: 6, ry: 6 });
      run.style.fill = BAR.run;
      run.style.width = '0px';
      return run;
    },
  }),
  // A standing caption, not a wire: refs.wires is the per-step label bucket a probe reads by key.
  P.tag({ key: CAP_KEYS[i], cls: 'scheme-box-sublabel', x: SCALE_R - 12, y: BAR_Y(i) + BAR_H / 2 + 4, anchor: 'end' }),
];

// Container state never moves on this card: it answers the question the description asks.
const STATE = 'Running · restartCount 0';
// One formula for every cpu.stat reading: n closed periods of 50ms of stall each.
const THR = n => `nr_throttled ${n} of ${n} · throttled_usec ${n * 50000}`;
const STAT_IDLE = THR(0);
const MAX_UNSET = 'max 100000 · no quota';
const MAX_SET = '50000 100000 · 50ms of every 100ms';
// requests.cpu 250m is 256 cpu.shares, which the cgroup v2 quadratic fit maps to weight 35.
const WEIGHT_UNSET = 'unset · 100 is the raw cgroup default';
const WEIGHT_SET = '35 · from requests.cpu 250m';
const SPEC_LINE = 'requests.cpu 250m · limits.cpu 500m';

// List order is z-order: scale, Node and Pod above the packet layer, top-row blocks last.
export const SCENE = {
  'aria-label': 'CPU throttling and the CFS quota: a CPU request becomes a cgroup cpu.weight that only binds under contention, a CPU limit becomes a cpu.max quota of 50ms inside every 100ms period, the kernel stops scheduling the cgroup once that budget is spent, and the only record is cpu.stat, a kernel counter rather than a field on any Kubernetes object',
  parts: [
    P.defs(),
    P.arrow({ x1: KUBE_R, y1: UP_Y, x2: KERN_X, y2: UP_Y, dim: true, dashed: true }),
    P.arrow({ x1: KERN_X, y1: DOWN_Y, x2: KUBE_R, y2: DOWN_Y, dim: true, dashed: true }),
    P.wire({ key: 'kernel', x: WIRE_X, y: WIRE_Y }),
    P.chip({ key: 'weightChip', x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'cpu.weight',      value: WEIGHT_UNSET }),
    P.chip({ key: 'maxChip',    x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'cpu.max',         value: MAX_UNSET }),
    P.chip({ key: 'statChip',   x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'cpu.stat',        value: STAT_IDLE }),
    P.chip({ key: 'stateChip',  x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'container state', value: STATE }),
    P.relation({ points: NODE_RELATION }),
    P.packets(),
    P.group({
      key: 'scaleG', id: 'timeScale', opacity: OPACITY.pending,
      parts: [
        P.relation({ points: SCALE_RELATION }),
        // The frame corner label is the axis caption.
        P.node({ x: FRAME_X, y: FRAME_Y, w: FRAME_W, h: FRAME_H, label: 'CFS periods' }),
        P.tag({ cls: 'scheme-box-sublabel', x: FRAME_R - 12, y: CAP_Y, anchor: 'end', text: '100ms' }),
        ...BAR_I.flatMap(period),
      ],
    }),
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    // Grouped so the pulse reaches the shell and the container box. This group never fades.
    P.pod({
      key: 'podGroup', id: 'podGroup', innerKey: 'containerBox',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { dx: CONT_X - POD_X, dy: CONT_Y - POD_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: SPEC_LINE },
    }),
    P.box({ key: 'kubelet', x: KUBE_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Kubelet',      sublabel: 'CRI resources + cAdvisor' }),
    P.box({ key: 'kernel',  x: KERN_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Linux kernel', sublabel: 'CFS bandwidth control' }),
  ],
  reset: {
    keys: ['kubelet', 'kernel', 'weightChip', 'maxChip', 'statChip', 'stateChip'],
    pods: ['podGroup'],
  },
};

// Every enter() writes every bar. Painting the scale is the one escape: no step field writes
// an inline width or a standing caption.
function setBars(s, runs, caps) {
  RUN_KEYS.forEach((k, i) => { s.refs[k].style.width = `${runs[i]}px`; });
  CAP_KEYS.forEach((k, i) => { s.refs[k].textContent = caps[i]; });
}
const bars = (runs, caps) => (s) => setBars(s, runs, caps);

const SPENT = 'quota spent at 50ms';
const THROTTLED = 'throttled 50ms';
const NO_CAPS = [' ', ' ', ' '];
const SPENT_CAPS = [SPENT, ' ', ' '];
const FIRST_CAPS = [THROTTLED, ' ', ' '];
const ALL_CAPS = [THROTTLED, THROTTLED, THROTTLED];
// The caption half of a period closing. The counter half is the F.set at the same delay.
const closeCaption = (i) => (s) => { s.refs[CAP_KEYS[i]].textContent = THROTTLED; };

const FILL_MS = 700;
const FILL_FRAMES = [{ width: '0px' }, { width: `${RUN_W}px` }];
const FILL_TIMING = { duration: FILL_MS, fill: 'both', easing: 'linear' };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { weightChip: WEIGHT_UNSET, maxChip: MAX_UNSET, statChip: STAT_IDLE, stateChip: STATE },
    sublabels: { containerBox: SPEC_LINE },
    opacity: { scaleG: OPACITY.pending },
    enter: bars([0, 0, 0], NO_CAPS),
  },
  {
    id: 'request',
    duration: 2400,
    narration: 'The Kubelet sends the CPU request down the CRI and it lands as a cgroup v2 cpu.weight. A weight is not a reservation. It only decides how the runnable cgroups on this Node divide the CPUs when they all want to run at once, so on a quiet Node this container may run past its 250m, and what caps it is the limit rather than the request.',
    chips: { weightChip: WEIGHT_SET, maxChip: MAX_UNSET, statChip: STAT_IDLE, stateChip: STATE },
    wires: { kernel: 'requests.cpu 250m · cgroup cpu.weight' },
    sublabels: { containerBox: SPEC_LINE },
    opacity: { scaleG: OPACITY.pending },
    lit: ['kubelet', 'weightChip'],
    enter: bars([0, 0, 0], NO_CAPS),
    // The chip stays unset until the request reaches the kernel.
    rewind: { chips: { weightChip: WEIGHT_UNSET } },
    flow: [
      F.top({ from: KUBE_R, to: KERN_X, y: UP_Y, name: 'apply', lights: ['kernel'] }),
      F.set({ at: 'apply', chips: { weightChip: WEIGHT_SET } }),
    ],
  },
  {
    id: 'quota',
    duration: 2800,
    narration: 'The CPU limit becomes a quota. On cgroup v2 that is one line, cpu.max, carrying the quota and the period together, so limits.cpu 500m against the default 100ms period is 50000 100000. That is 50ms of run time this cgroup may spend inside every 100ms period, and the period repeats for as long as the container lives.',
    chips: { weightChip: WEIGHT_SET, maxChip: MAX_SET, statChip: STAT_IDLE, stateChip: STATE },
    wires: { kernel: 'limits.cpu 500m · cpu.max 50000 100000' },
    sublabels: { containerBox: SPEC_LINE },
    opacity: { scaleG: 1 },
    lit: ['kernel', 'maxChip'],
    enter: bars([0, 0, 0], NO_CAPS),
    // No bandwidth enforcement until cpu.max is written, so the scale rests at OPACITY.pending.
    flow: [F.fade({ target: 'scaleG', from: OPACITY.pending, to: 1, dur: FADE.in, fill: 'both', easing: 'ease-out' })],
  },
  {
    id: 'spend',
    duration: 2600,
    narration: 'The container runs, and every microsecond of CPU time it burns is charged against the 50ms budget. One busy thread on one CPU empties it 50ms into the period. Nothing is wrong with the code, it has simply reached the ceiling that the limit bought.',
    // cpu.stat counters turn over on the period timer, not mid-period, so they stay 0 here.
    chips: { weightChip: WEIGHT_SET, maxChip: MAX_SET, statChip: STAT_IDLE, stateChip: STATE },
    wires: { kernel: '50ms of run time charged to the cgroup' },
    sublabels: { containerBox: 'running · 50ms of CPU this period' },
    opacity: { scaleG: 1 },
    lit: ['kernel', 'maxChip'],
    enter: bars([RUN_W, 0, 0], SPENT_CAPS),
    // The caption lands when the budget is gone, not at step entry.
    flow: [
      F.run({ fn: bars([0, 0, 0], NO_CAPS) }),
      F.pulse({ pod: 'podGroup' }),
      F.anim({ target: RUN_KEYS[0], keyframes: FILL_FRAMES, options: FILL_TIMING }),
      F.run({ delay: FILL_MS, fn: bars([RUN_W, 0, 0], SPENT_CAPS) }),
    ],
  },
  {
    id: 'throttle',
    duration: 3400,
    narration: 'With the budget gone the kernel takes the cgroup off the run queues until the period timer refills it, so for 50ms of every 100ms the container is runnable and not running. Threads share one budget, so four busy threads on four CPUs would empty it 12.5ms in and stall for the remaining 87.5ms.',
    chips: { weightChip: WEIGHT_SET, maxChip: MAX_SET, statChip: THR(BAR_N), stateChip: STATE },
    wires: { kernel: 'quota spent · dequeued until the next period' },
    sublabels: { containerBox: 'throttled · waiting for the next period' },
    opacity: { scaleG: 1 },
    lit: ['kernel', 'statChip'],
    enter: bars([RUN_W, RUN_W, RUN_W], ALL_CAPS),
    rewind: { chips: { statChip: THR(1) } },
    flow: [
      F.run({ fn: bars([RUN_W, 0, 0], FIRST_CAPS) }),
      F.pulse({ pod: 'podGroup' }),
      // Each period closes on two entries at one delay, the caption and the counter.
      ...[1, 2].flatMap(i => [
        F.anim({ target: RUN_KEYS[i], keyframes: FILL_FRAMES, options: FILL_TIMING, delay: i * FILL_MS }),
        F.run({ delay: (i + 1) * FILL_MS, fn: closeCaption(i) }),
        F.set({ delay: (i + 1) * FILL_MS, chips: { statChip: THR(i + 1) } }),
      ]),
    ],
  },
  {
    id: 'observe',
    duration: 3000,
    narration: 'Nothing died. The Pod stays Running, restartCount stays 0, and kubectl describe shows no event and no condition, because throttling is not a state any Kubernetes object carries. The kernel counts it in cpu.stat, which cAdvisor inside the Kubelet exports as container_cpu_cfs_throttled_seconds_total. Here that is 5 seconds of stall in the last 10. The quota kills nothing, but the latency it costs can fail a liveness probe, and that restarts the container.',
    // 100 periods x 50ms of stall is throttled_usec 5000000, the 5 seconds the metric reports.
    chips: { weightChip: WEIGHT_SET, maxChip: MAX_SET, statChip: THR(100), stateChip: STATE },
    wires: { kernel: 'cpu.stat scraped · no Pod event, no condition' },
    sublabels: { containerBox: 'running · latency up, no restart' },
    opacity: { scaleG: 1 },
    lit: ['kernel', 'statChip', 'stateChip'],
    enter: bars([RUN_W, RUN_W, RUN_W], ALL_CAPS),
    // cAdvisor surfaces the counter on the lower lane, the same shape as the observe step of
    // cluster-oom-kill on purpose. The Kubelet lights on arrival, not at entry.
    flow: [F.top({ from: KERN_X, to: KUBE_R, y: DOWN_Y, lights: ['kubelet'] })],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
