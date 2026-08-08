import { P, F, defineCard, laneY, ladder, strip, midX, setVal, CLU, LAYOUT, FADE, OPACITY } from './cluster-kit.js';
import { rect } from '../../lib/svg.js';

// Design notes for this card: ./CARDS.md#cluster-cpu-throttling

// Layout C, the twin of cluster-oom-kill with the sibling ladder replaced by the time scale.
// Panel x<=397, bottom 280 worst case; frame top 380 leaves ~550 characters. Re-measure after prose.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = midX(CONTENT_L, CONTENT_R);                   // 600, the canvas centre by construction

const BOX_W = CLU.BOX_W, BOX_H = CLU.BOX_H;              // 232 / 80
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;     // 40 / 120
const SPINE_X = CX;                                      // 600, the Node frame midpoint
const KUBE_X = SPINE_X - BOX_W / 2;                      // 484..716
const KUBE_R = KUBE_X + BOX_W;                           // 716, the face both top hops leave from
const KERN_X = CONTENT_R - BOX_W;                        // 908..1140, flush with the content edge
const KERN_CX = midX(KERN_X, CONTENT_R);                 // 1024
const LANE_DY = CLU.LANE_DY, TOP_CY = midX(TOP_Y, TOP_BOTTOM);   // 12 / 80
const { out: UP_Y, back: DOWN_Y } = laneY(TOP_CY, LANE_DY);      // 68 / 92
const WIRE_X = midX(KUBE_R, KERN_X);                     // 812, the gap midpoint
const WIRE_Y = TOP_Y - 14;                               // 26, above the row

// Three equal bars, one 100ms CFS period each, stacked so successive periods read as one clock
// rather than as three containers. Takes the right column, so it clears the panel by construction.
const SCALE_X = LAYOUT.C.ladder.x, SCALE_W = LAYOUT.C.ladder.w;   // 480, 660..1140
const SCALE_CX = midX(SCALE_X, CONTENT_R);               // 900
const BAR_H = 44, BAR_GAP = 16, BAR_N = 3;
const SCALE_Y = 176;
const BAR_Y = ladder({ y: SCALE_Y, rowH: BAR_H, gap: BAR_GAP });  // 176 / 236 / 296, the stack ends on 340
const CAP_Y = SCALE_Y - 10;                              // 166, the axis caption baseline
// Half the bar: limits.cpu 500m against the default 100ms period is 50ms of run time in every 100.
// The bar is wall clock, and one busy thread on one CPU makes the run portion equal the quota.
const RUN_W = SCALE_W / 2;                               // 240

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;// 60..1140
const NODE_Y = 380, NODE_H = CLU.NODE.H;                 // 380..532, the family frame
const POD_W = 480, POD_H = CLU.NODE.POD_H;               // 106
const POD_X = CX - POD_W / 2;                            // 360..840
const POD_Y = NODE_Y + CLU.NODE.POD_DY;                  // 414..520, 34 of label padding
const CONT_W = 300, CONT_H = 64;
const CONT_X = CX - CONT_W / 2;                          // 450..750
const CONT_Y = POD_Y + 30;                               // 444..508

// Bottom strip, TWO per row: four across leaves 258 units and the names overlap their values.
const CHIP_H = CLU.CHIP_H, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = NODE_Y + NODE_H + 16;                    // 548, second row ends on 624
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;                               // 532, which is LAYOUT.C.strip.two
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

// Two RELATIONSHIP lines: no step names anything travelling either way. The scale hangs off the
// KERNEL, and lives inside the scale group so it cannot outlive what it points at.
const NODE_RELATION = [[SPINE_X, TOP_BOTTOM], [SPINE_X, NODE_Y]];
const JOG_Y = midX(TOP_BOTTOM, SCALE_Y);                 // 148
const SCALE_RELATION = [[KERN_CX, TOP_BOTTOM], [KERN_CX, JOG_Y], [SCALE_CX, JOG_Y], [SCALE_CX, SCALE_Y]];

// Presentation shades, not lifecycle phases: a spent budget is not a phase. Channel list is the
// cluster tint (125, 134, 255), copied because a presentation attribute cannot resolve a token.
const BAR = Object.freeze({
  track:  'rgba(255, 255, 255, 0.04)',
  stroke: 'rgba(125, 134, 255, 0.35)',
  run:    'rgba(125, 134, 255, 0.55)',
});

const BAR_I = [...Array(BAR_N).keys()];                  // 0 / 1 / 2
const RUN_KEYS = BAR_I.map(i => 'run' + i);
const CAP_KEYS = BAR_I.map(i => 'cap' + i);

// Bare rects on purpose: box() here would drag CENTRE-LOW's content centre to 750 against 600, and
// P.raw is the one way to a naked rect.
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
  // A standing caption, NOT a wire: refs.wires is the card's per-step label bucket and a frozen
  // probe reads it by key, so putting three bar captions in it would change what the card declares.
  P.tag({ key: CAP_KEYS[i], cls: 'scheme-box-sublabel', x: CONTENT_R - 12, y: BAR_Y(i) + BAR_H / 2 + 4, anchor: 'end' }),
];

// container state never moves on this card. It is the answer to the question the description asks,
// so it is a standing value written by every step rather than a parameter of a helper.
const STATE = 'Running · restartCount 0';
// One formula for every cpu.stat reading: n closed periods of 50ms of stall each.
const THR = n => `nr_throttled ${n} of ${n} · throttled_usec ${n * 50000}`;
const STAT_IDLE = THR(0);
const MAX_UNSET = 'max 100000 · no quota';
const MAX_SET = '50000 100000 · 50ms of every 100ms';
// requests.cpu 250m is 250 * 1024 / 1000 = 256 cpu.shares, which cgroup v2 maps to
// 1 + ((256 - 2) * 9999) / 262142 = 10, ten times LESS than the 100 a fresh cgroup starts at.
const WEIGHT_UNSET = 'unset · 100 is the raw cgroup default';
const WEIGHT_SET = '10 · from requests.cpu 250m';
const SPEC_LINE = 'requests.cpu 250m · limits.cpu 500m';

// The list order IS the append order, so it is the z-order: the time scale, the Node frame and its Pod
// sit above the packet layer, and the top-row blocks go last.
export const SCENE = {
  'aria-label': 'CPU throttling and the CFS quota: a CPU request becomes a cgroup cpu.weight that only binds under contention, a CPU limit becomes a cpu.max quota of 50ms inside every 100ms period, the kernel stops scheduling the cgroup once that budget is spent, and the only record is cpu.stat',
  parts: [
    P.defs(),
    // The pair of lanes between the two blocks: the request goes up on 68, the counter comes back
    // down on 92, mirrored around the row centre so neither endpoint stands alone on a face.
    P.arrow({ x1: KUBE_R, y1: UP_Y, x2: KERN_X, y2: UP_Y, dim: true, dashed: true }),
    P.arrow({ x1: KERN_X, y1: DOWN_Y, x2: KUBE_R, y2: DOWN_Y, dim: true, dashed: true }),
    P.wire({ key: 'kernel', x: WIRE_X, y: WIRE_Y }),
    P.chip({ key: 'weightChip', x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'cpu.weight',      value: WEIGHT_UNSET }),
    P.chip({ key: 'maxChip',    x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'cpu.max',         value: MAX_UNSET }),
    P.chip({ key: 'statChip',   x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'cpu.stat',        value: STAT_IDLE }),
    P.chip({ key: 'stateChip',  x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'container state', value: STATE }),
    P.relation({ points: NODE_RELATION }),
    // Z-order canon: packetLayer first (under the blocks) so a packet tucks under
    // its destination on arrival; then the scale, node, pod, then top-row blocks last.
    P.packets(),
    P.group({
      key: 'scaleG', id: 'timeScale', opacity: OPACITY.pending,
      parts: [
        P.relation({ points: SCALE_RELATION }),
        P.tag({ cls: 'scheme-box-sublabel', x: SCALE_X, y: CAP_Y, anchor: 'start', text: 'one CFS period per bar' }),
        P.tag({ cls: 'scheme-box-sublabel', x: CONTENT_R, y: CAP_Y, anchor: 'end', text: '100ms' }),
        ...BAR_I.flatMap(period),
      ],
    }),
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    // Grouped so the pulse reaches the shell AND the container box. Nothing here ever fades this
    // group, which is the whole point of the pair with cluster-oom-kill.
    P.pod({
      key: 'podGroup', id: 'podGroup', innerKey: 'containerBox',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { dx: CONT_X - POD_X, dy: CONT_Y - POD_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: SPEC_LINE },
    }),
    // Top-row blocks ABSOLUTE LAST.
    P.box({ key: 'kubelet', x: KUBE_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Kubelet',      sublabel: 'CRI resources + cAdvisor' }),
    P.box({ key: 'kernel',  x: KERN_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Linux kernel', sublabel: 'CFS bandwidth control' }),
  ],
  reset: {
    keys: ['kubelet', 'kernel', 'weightChip', 'maxChip', 'statChip', 'stateChip'],
    pods: ['podGroup'],
  },
};

// Every enter() writes EVERY bar, or one left alone reads as a period that behaved differently. No
// step field writes an inline width or a standing caption, so painting the scale is the one escape.
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
// A period closing and the counter it moves are ONE beat, so they are one at(): two flow entries
// here would be two rows in the motion record.
const closePeriod = (i) => (s) => {
  s.refs[CAP_KEYS[i]].textContent = THROTTLED;
  setVal(s.refs.statChip, THR(i + 1));
};

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
    narration: 'The Kubelet hands the CPU request to the container runtime, which turns it into a cgroup v2 cpu.weight. A weight is not a reservation. It only decides how the runnable cgroups on this Node divide the CPUs when they all want to run at once, so on a quiet Node this container may use far more than its 250m.',
    chips: { weightChip: WEIGHT_SET, maxChip: MAX_UNSET, statChip: STAT_IDLE, stateChip: STATE },
    wires: { kernel: 'requests.cpu 250m · cgroup cpu.weight' },
    sublabels: { containerBox: SPEC_LINE },
    opacity: { scaleG: OPACITY.pending },
    lit: ['kubelet', 'weightChip'],
    enter: bars([0, 0, 0], NO_CAPS),
    // The weight is what the Kubelet sends, so the chip stays unset until the request reaches
    // the kernel on the upper lane.
    rewind: { chips: { weightChip: WEIGHT_UNSET } },
    flow: [
      F.top({ from: KUBE_R, to: KERN_X, y: UP_Y, name: 'apply', lights: ['kernel'] }),
      F.set({ at: 'apply', chips: { weightChip: WEIGHT_SET } }),
    ],
  },
  {
    id: 'quota',
    duration: 2800,
    narration: 'The CPU limit becomes a quota. On cgroup v2 the runtime writes one line, cpu.max, carrying the quota and the period together, so limits.cpu 500m against the default 100ms period is 50000 100000. That is 50ms of run time this cgroup may spend inside every 100ms period, and the period repeats for as long as the container lives.',
    chips: { weightChip: WEIGHT_SET, maxChip: MAX_SET, statChip: STAT_IDLE, stateChip: STATE },
    wires: { kernel: 'limits.cpu 500m · cpu.max 50000 100000' },
    sublabels: { containerBox: SPEC_LINE },
    // Pin final state inline so cancel between steps does not flash to default.
    opacity: { scaleG: 1 },
    lit: ['kernel', 'maxChip'],
    enter: bars([0, 0, 0], NO_CAPS),
    // Until cpu.max is written there is no bandwidth enforcement and nr_periods is genuinely 0,
    // so the scale rests at OPACITY.pending (declared, not working yet) and comes up here.
    flow: [F.fade({ target: 'scaleG', from: OPACITY.pending, to: 1, dur: FADE.in, fill: 'both', easing: 'ease-out' })],
  },
  {
    id: 'spend',
    duration: 2600,
    narration: 'The container runs, and every microsecond of CPU time it burns is charged against the 50ms budget. One busy thread on one CPU empties it 50ms into the period. Nothing is wrong with the code, it has simply reached the ceiling that the limit bought.',
    // cpu.stat does not move yet: the kernel increments both counters from the period TIMER, so
    // half way through the first period they are still 0. They turn over on the throttle step.
    chips: { weightChip: WEIGHT_SET, maxChip: MAX_SET, statChip: STAT_IDLE, stateChip: STATE },
    // The kernel is what accounts the run time, so it owns the wire label above it here too.
    wires: { kernel: '50ms of run time charged to the cgroup' },
    sublabels: { containerBox: 'running · 50ms of CPU this period' },
    opacity: { scaleG: 1 },
    lit: ['kernel', 'maxChip'],
    // Pin final state inline: the first period is full at the end of this step.
    enter: bars([RUN_W, 0, 0], SPENT_CAPS),
    // The fill marches across the first period at the pace the thread burns it, and the caption
    // lands when the budget is gone rather than announcing it at step entry.
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
    narration: 'With the budget gone the kernel takes the cgroup off the run queues until the period timer refills it, so for 50ms of every 100ms the container is runnable and not running. Threads share one budget, so four busy threads would empty it 12.5ms in and stall for the remaining 87.5ms.',
    chips: { weightChip: WEIGHT_SET, maxChip: MAX_SET, statChip: THR(BAR_N), stateChip: STATE },
    wires: { kernel: 'quota spent · dequeued until the next period' },
    sublabels: { containerBox: 'throttled · waiting for the next period' },
    opacity: { scaleG: 1 },
    lit: ['kernel', 'statChip'],
    // Pin final state inline: three periods, each half run and half stall.
    enter: bars([RUN_W, RUN_W, RUN_W], ALL_CAPS),
    rewind: { chips: { statChip: THR(1) } },
    flow: [
      F.run({ fn: bars([RUN_W, 0, 0], FIRST_CAPS) }),
      F.pulse({ pod: 'podGroup' }),
      // Two and three fill on the same rhythm, so the repetition is what the eye reads. The counter
      // turns over as each period closes, so fill and turnover ALTERNATE: written out, never sorted.
      ...[1, 2].flatMap(i => [
        F.anim({ target: RUN_KEYS[i], keyframes: FILL_FRAMES, options: FILL_TIMING, delay: i * FILL_MS }),
        F.run({ delay: (i + 1) * FILL_MS, fn: closePeriod(i) }),
      ]),
    ],
  },
  {
    id: 'observe',
    duration: 3000,
    narration: 'Nothing died. The Pod stays Running, restartCount stays 0, and kubectl describe shows no event and no condition, because throttling is not a state any Kubernetes object carries. The kernel counts it in cpu.stat, which cAdvisor inside the Kubelet exports as container_cpu_cfs_throttled_seconds_total. Here that is 5 seconds of stall in the last 10, and all the workload lost was latency.',
    // 100 periods x 50ms of stall is throttled_usec 5000000, the 5 seconds the metric reports.
    // It is the kernel's counter and it climbed already: reading it does not move it.
    chips: { weightChip: WEIGHT_SET, maxChip: MAX_SET, statChip: THR(100), stateChip: STATE },
    wires: { kernel: 'cpu.stat scraped · no Pod event, no condition' },
    sublabels: { containerBox: 'running · latency up, no restart' },
    opacity: { scaleG: 1 },
    lit: ['kernel', 'statChip', 'stateChip'],
    enter: bars([RUN_W, RUN_W, RUN_W], ALL_CAPS),
    // cAdvisor reads the cgroup files, so the counter surfaces kernel to Kubelet on the lower
    // lane. Same shape and same lane as the observe step of cluster-oom-kill, on purpose.
    flow: [F.top({ from: KERN_X, to: KUBE_R, y: DOWN_Y, lights: ['kubelet'] })],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
