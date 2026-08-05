import { svg, g, text, rect } from '../../lib/svg.js';
import { arrowDefs, pod, podShell, node, box, arrow } from '../../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, pulsePod, topPacket, makeInit, clearHighlights, clearWires, setWire, relationPath, FADE, lightBoxAt, at, OPACITY } from './cluster-kit.js';
// Design notes for this card: ./CARDS.md#cluster-cpu-throttling

// Layout C, the twin of cluster-oom-kill with the sibling ladder replaced by the time scale.
// Panel x<=397, bottom 280 worst case; frame top 380 leaves ~550 characters. Re-measure after prose.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600, the canvas centre by construction

const BOX_W = 232, BOX_H = 80;
const TOP_Y = 40, TOP_BOTTOM = TOP_Y + BOX_H;            // 40 / 120
const SPINE_X = CX;                                      // 600, the Node frame midpoint
const KUBE_X = SPINE_X - BOX_W / 2;                      // 484..716
const KERN_X = CONTENT_R - BOX_W;                        // 908..1140, flush with the content edge
const KERN_CX = KERN_X + BOX_W / 2;                      // 1024
const LANE_DY = 12, TOP_CY = TOP_Y + BOX_H / 2;          // 80
const UP_Y = TOP_CY - LANE_DY, DOWN_Y = TOP_CY + LANE_DY;// 68 / 92
const WIRE_X = (KUBE_X + BOX_W + KERN_X) / 2;            // 812, the gap midpoint
const WIRE_Y = TOP_Y - 14;                               // 26, above the row

// Three equal bars, one 100ms CFS period each, stacked so successive periods read as one clock
// rather than as three containers. Takes the right column, so it clears the panel by construction.
const SCALE_X = 660, SCALE_W = CONTENT_R - SCALE_X;      // 480, 660..1140
const SCALE_CX = SCALE_X + SCALE_W / 2;                  // 900
const BAR_H = 44, BAR_GAP = 16, BAR_N = 3;
const SCALE_Y = 176;
const BAR_Y = i => SCALE_Y + i * (BAR_H + BAR_GAP);      // 176 / 236 / 296, the stack ends on 340
const CAP_Y = SCALE_Y - 10;                              // 166, the axis caption baseline
// Half the bar: limits.cpu 500m against the default 100ms period is 50ms of run time in every 100.
// The bar is wall clock, and one busy thread on one CPU makes the run portion equal the quota.
const RUN_W = SCALE_W / 2;                               // 240

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;// 60..1140
const NODE_Y = 380, NODE_H = 152;                        // 380..532, the family frame
const POD_W = 480, POD_H = 106;
const POD_X = CX - POD_W / 2;                            // 360..840
const POD_Y = NODE_Y + 34;                               // 414..520, 34 of label padding
const CONT_W = 300, CONT_H = 64;
const CONT_X = CX - CONT_W / 2;                          // 450..750
const CONT_Y = POD_Y + 30;                               // 444..508

// Bottom strip, TWO per row: four across leaves 258 units and the names overlap their values.
const CHIP_H = 34, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = NODE_Y + NODE_H + 16;                    // 548, second row ends on 624
const CHIP_W = (NODE_W - CHIP_GAP * (CHIP_COLS - 1)) / CHIP_COLS;     // 532
const CHIP_X = i => CONTENT_L + (i % CHIP_COLS) * (CHIP_W + CHIP_GAP);
const CHIP_Y = i => CHIPS_Y + Math.floor(i / CHIP_COLS) * (CHIP_H + CHIP_VGAP);

// Two RELATIONSHIP lines: no step names anything travelling either way. The scale hangs off the
// KERNEL, and lives inside the scale group so it cannot outlive what it points at.
const NODE_RELATION = [[SPINE_X, TOP_BOTTOM], [SPINE_X, NODE_Y]];
const JOG_Y = (TOP_BOTTOM + SCALE_Y) / 2;                // 148
const SCALE_RELATION = [[KERN_CX, TOP_BOTTOM], [KERN_CX, JOG_Y], [SCALE_CX, JOG_Y], [SCALE_CX, SCALE_Y]];

// Presentation shades, not lifecycle phases: a spent budget is not a phase. Channel list is the
// cluster tint (125, 134, 255), copied because a presentation attribute cannot resolve a token.
const BAR = Object.freeze({
  track:  'rgba(255, 255, 255, 0.04)',
  stroke: 'rgba(125, 134, 255, 0.35)',
  run:    'rgba(125, 134, 255, 0.55)',
});

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'CPU throttling and the CFS quota: a CPU request becomes a cgroup cpu.weight that only binds under contention, a CPU limit becomes a cpu.max quota of 50ms inside every 100ms period, the kernel stops scheduling the cgroup once that budget is spent, and the only record is cpu.stat',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubelet = box({ x: KUBE_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Kubelet',      sublabel: 'CRI resources + cAdvisor', role: 'cluster' });
    const kernel  = box({ x: KERN_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Linux kernel', sublabel: 'CFS bandwidth control',    role: 'cluster' });

    // The pair of lanes between the two blocks: the request goes up on 68, the counter comes back
    // down on 92, mirrored around the row centre so neither endpoint stands alone on a face.
    root.appendChild(arrow({ x1: KUBE_X + BOX_W, y1: UP_Y,   x2: KERN_X, y2: UP_Y,   dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: KERN_X, y1: DOWN_Y, x2: KUBE_X + BOX_W, y2: DOWN_Y, dim: true, dashed: true, role: 'cluster' }));

    const wireKernel = text({ class: 'scheme-label code dim', x: WIRE_X, y: WIRE_Y, 'text-anchor': 'middle' }, [' ']);
    root.appendChild(wireKernel);

    const weightChip = valChip({ x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'cpu.weight',     value: 'unset · 100 is the raw cgroup default', role: 'cluster' });
    const maxChip    = valChip({ x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'cpu.max',        value: 'max 100000 · no quota', role: 'cluster' });
    const statChip   = valChip({ x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'cpu.stat',       value: 'nr_throttled 0 of 0 · throttled_usec 0', role: 'cluster' });
    const stateChip  = valChip({ x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'container state', value: 'Running · restartCount 0', role: 'cluster' });
    [weightChip, maxChip, statChip, stateChip].forEach(c => root.appendChild(c));

    // Track rect + a run rect growing from its left edge + a right-aligned caption over the stall.
    // Bare rects on purpose: box() here would drag CENTRE-LOW's content centre to 750 against 600.
    const scaleG = g({ id: 'timeScale' });
    scaleG.style.opacity = String(OPACITY.pending);
    scaleG.appendChild(relationPath({ points: SCALE_RELATION, role: 'cluster' }));
    scaleG.appendChild(text({ class: 'scheme-box-sublabel', x: SCALE_X, y: CAP_Y, 'text-anchor': 'start' }, ['one CFS period per bar']));
    scaleG.appendChild(text({ class: 'scheme-box-sublabel', x: CONTENT_R, y: CAP_Y, 'text-anchor': 'end' }, ['100ms']));
    const runs = [], barTexts = [];
    for (let i = 0; i < BAR_N; i++) {
      const track = rect({ x: SCALE_X, y: BAR_Y(i), width: SCALE_W, height: BAR_H, rx: 6, ry: 6 });
      track.style.fill = BAR.track;
      track.style.stroke = BAR.stroke;
      track.style.strokeWidth = '1.2';
      const run = rect({ x: SCALE_X, y: BAR_Y(i), width: 0, height: BAR_H, rx: 6, ry: 6 });
      run.style.fill = BAR.run;
      run.style.width = '0px';
      const cap = text({ class: 'scheme-box-sublabel', x: CONTENT_R - 12, y: BAR_Y(i) + BAR_H / 2 + 4, 'text-anchor': 'end' }, [' ']);
      scaleG.appendChild(track);
      scaleG.appendChild(run);
      scaleG.appendChild(cap);
      runs.push(run);
      barTexts.push(cap);
    }

    const nodeEl = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });

    const shellEl = podShell({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
    shellEl.style.setProperty('--workloads-color', '#c0b0ff');

    const containerBox = box({ x: CONT_X, y: CONT_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'requests.cpu 250m · limits.cpu 500m', role: 'workloads' });
    containerBox.style.setProperty('--workloads-color', '#c0b0ff');

    // Grouped so the pulse reaches the shell AND the container box. Nothing here ever fades this
    // group, which is the whole point of the pair with cluster-oom-kill.
    const podGroup = g({ id: 'podGroup' });
    podGroup.appendChild(shellEl);
    podGroup.appendChild(containerBox);

    root.appendChild(relationPath({ points: NODE_RELATION, role: 'cluster' }));

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order canon: packetLayer first (under the blocks) so a packet tucks under
    // its destination on arrival; then the scale, node, pod, then top-row blocks last.
    root.appendChild(packetLayer);
    root.appendChild(scaleG);
    root.appendChild(nodeEl);
    root.appendChild(podGroup);
    root.appendChild(kubelet);
    root.appendChild(kernel);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubelet, kernel, nodeEl, podGroup, containerBox,
      scaleG, runs, barTexts,
      weightChip, maxChip, statChip, stateChip,
      packetLayer,
      wires: { kernel: wireKernel },
    };
  }

  reset() { this.build(); }
}

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  clearHighlights(s,
    ['kubelet','kernel','weightChip','maxChip','statChip','stateChip'],
    [s.refs.podGroup]);
  clearWires(s);
}

// container state never moves on this card. It is the answer to the question the description asks,
// so it is a standing value written by every step rather than a parameter of the helper.
const STATE = 'Running · restartCount 0';
const STAT_IDLE = 'nr_throttled 0 of 0 · throttled_usec 0';
const MAX_SET = '50000 100000 · 50ms of every 100ms';
// requests.cpu 250m is 250 * 1024 / 1000 = 256 cpu.shares, which cgroup v2 maps to
// 1 + ((256 - 2) * 9999) / 262142 = 10, ten times LESS than the 100 a fresh cgroup starts at.
const WEIGHT_UNSET = 'unset · 100 is the raw cgroup default';
const WEIGHT_SET = '10 · from requests.cpu 250m';
function setChips(s, { weight, max, stat }) {
  setVal(s.refs.weightChip, weight);
  setVal(s.refs.maxChip, max);
  setVal(s.refs.statChip, stat);
  setVal(s.refs.stateChip, STATE);
}

// Every enter() writes EVERY bar: one left alone reads as a period that behaved differently.
function setBars(s, runs, caps) {
  s.refs.runs.forEach((r, i) => { r.style.width = `${runs[i]}px`; });
  s.refs.barTexts.forEach((t, i) => { t.textContent = caps[i]; });
}
const NO_CAPS = [' ', ' ', ' '];
const FILL_MS = 700;

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      resetStep(s);
      s.refs.scaleG.style.opacity = String(OPACITY.pending);
      setBars(s, [0, 0, 0], NO_CAPS);
      setBoxSublabel(s.refs.containerBox, 'requests.cpu 250m · limits.cpu 500m');
      setChips(s, { weight: WEIGHT_UNSET, max: 'max 100000 · no quota', stat: STAT_IDLE });
    },
  },
  {
    id: 'request',
    duration: 2400,
    narration: 'The Kubelet hands the CPU request to the container runtime, which turns it into a cgroup v2 cpu.weight. A weight is not a reservation. It only decides how the runnable cgroups on this Node divide the CPUs when they all want to run at once, so on a quiet Node this container may use far more than its 250m.',
    enter(s, ctx) {
      resetStep(s);
      s.refs.scaleG.style.opacity = String(OPACITY.pending);
      setBars(s, [0, 0, 0], NO_CAPS);
      setBoxSublabel(s.refs.containerBox, 'requests.cpu 250m · limits.cpu 500m');
      setChips(s, { weight: WEIGHT_SET, max: 'max 100000 · no quota', stat: STAT_IDLE });
      setWire(s, 'kernel', 'requests.cpu 250m · cgroup cpu.weight');
      s.refs.kubelet.classList.add('highlight');
      s.refs.weightChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.kernel.classList.add('highlight'); return; }
      // The weight is what the Kubelet sends, so the chip stays unset until the request reaches
      // the kernel on the upper lane.
      setVal(s.refs.weightChip, WEIGHT_UNSET);
      const pkt = topPacket(s, ctx, { from: KUBE_X + BOX_W, to: KERN_X, y: UP_Y, role: 'cluster' });
      lightBoxAt(s.refs.kernel, ctx, pkt.arrivalMs);
      at(s, ctx, pkt.arrivalMs, () => setVal(s.refs.weightChip, WEIGHT_SET));
    },
  },
  {
    id: 'quota',
    duration: 2800,
    narration: 'The CPU limit becomes a quota. On cgroup v2 the runtime writes one line, cpu.max, carrying the quota and the period together, so limits.cpu 500m against the default 100ms period is 50000 100000. That is 50ms of run time this cgroup may spend inside every 100ms period, and the period repeats for as long as the container lives.',
    enter(s, ctx) {
      resetStep(s);
      setBoxSublabel(s.refs.containerBox, 'requests.cpu 250m · limits.cpu 500m');
      setChips(s, { weight: WEIGHT_SET, max: MAX_SET, stat: STAT_IDLE });
      setWire(s, 'kernel', 'limits.cpu 500m · cpu.max 50000 100000');
      s.refs.kernel.classList.add('highlight');
      s.refs.maxChip.classList.add('highlight');
      // Pin final state inline so cancel between steps does not flash to default.
      s.refs.scaleG.style.opacity = '1';
      setBars(s, [0, 0, 0], NO_CAPS);
      if (ctx.reduced) return;
      // Until cpu.max is written there is no bandwidth enforcement and nr_periods is genuinely 0,
      // so the scale rests at OPACITY.pending (declared, not working yet) and comes up here.
      ctx.register(s.refs.scaleG.animate(
        [{ opacity: OPACITY.pending }, { opacity: 1 }],
        { duration: FADE.in, fill: 'both', easing: 'ease-out' }
      ));
    },
  },
  {
    id: 'spend',
    duration: 2600,
    narration: 'The container runs, and every microsecond of CPU time it burns is charged against the 50ms budget. One busy thread on one CPU empties it 50ms into the period. Nothing is wrong with the code, it has simply reached the ceiling that the limit bought.',
    enter(s, ctx) {
      resetStep(s);
      s.refs.scaleG.style.opacity = '1';
      setBoxSublabel(s.refs.containerBox, 'running · 50ms of CPU this period');
      // cpu.stat does not move yet: the kernel increments both counters from the period TIMER, so
      // half way through the first period they are still 0. They turn over on the throttle step.
      setChips(s, { weight: WEIGHT_SET, max: MAX_SET, stat: STAT_IDLE });
      setWire(s, 'kernel', '50ms of run time charged to the cgroup');
      // The kernel is what accounts the run time, so it owns the wire label above it here too.
      s.refs.kernel.classList.add('highlight');
      s.refs.maxChip.classList.add('highlight');
      // Pin final state inline: the first period is full at the end of this step.
      setBars(s, [RUN_W, 0, 0], ['quota spent at 50ms', ' ', ' ']);
      if (ctx.reduced) return;
      // The fill marches across the first period at the pace the thread burns it, and the caption
      // lands when the budget is gone rather than announcing it at step entry.
      setBars(s, [0, 0, 0], NO_CAPS);
      pulsePod(s.refs.podGroup, ctx, 0);
      ctx.register(s.refs.runs[0].animate(
        [{ width: '0px' }, { width: `${RUN_W}px` }],
        { duration: FILL_MS, fill: 'both', easing: 'linear' }
      ));
      at(s, ctx, FILL_MS, () => setBars(s, [RUN_W, 0, 0], ['quota spent at 50ms', ' ', ' ']));
    },
  },
  {
    id: 'throttle',
    duration: 3400,
    narration: 'With the budget gone the kernel takes the cgroup off the run queues until the period timer refills it, so for 50ms of every 100ms the container is runnable and not running. Threads share one budget, so four busy threads would empty it 12.5ms in and stall for the remaining 87.5ms.',
    enter(s, ctx) {
      resetStep(s);
      s.refs.scaleG.style.opacity = '1';
      setBoxSublabel(s.refs.containerBox, 'throttled · waiting for the next period');
      setChips(s, { weight: WEIGHT_SET, max: MAX_SET, stat: 'nr_throttled 3 of 3 · throttled_usec 150000' });
      setWire(s, 'kernel', 'quota spent · dequeued until the next period');
      s.refs.kernel.classList.add('highlight');
      s.refs.statChip.classList.add('highlight');
      // Pin final state inline: three periods, each half run and half stall.
      setBars(s, [RUN_W, RUN_W, RUN_W], ['throttled 50ms', 'throttled 50ms', 'throttled 50ms']);
      if (ctx.reduced) return;
      // Two and three fill on the same rhythm, so the repetition is what the eye reads. The counter
      // turns over when the third period closes, which is the reading the chip claims.
      setBars(s, [RUN_W, 0, 0], ['throttled 50ms', ' ', ' ']);
      setVal(s.refs.statChip, 'nr_throttled 1 of 1 · throttled_usec 50000');
      pulsePod(s.refs.podGroup, ctx, 0);
      [1, 2].forEach((i) => {
        const start = i * FILL_MS;
        ctx.register(s.refs.runs[i].animate(
          [{ width: '0px' }, { width: `${RUN_W}px` }],
          { duration: FILL_MS, delay: start, fill: 'both', easing: 'linear' }
        ));
        at(s, ctx, start + FILL_MS, () => {
          s.refs.barTexts[i].textContent = 'throttled 50ms';
          setVal(s.refs.statChip, `nr_throttled ${i + 1} of ${i + 1} · throttled_usec ${(i + 1) * 50000}`);
        });
      });
    },
  },
  {
    id: 'observe',
    duration: 3000,
    narration: 'Nothing died. The Pod stays Running, restartCount stays 0, and kubectl describe shows no event and no condition, because throttling is not a state any Kubernetes object carries. The kernel counts it in cpu.stat, which cAdvisor inside the Kubelet exports as container_cpu_cfs_throttled_seconds_total. Here that is 5 seconds of stall in the last 10, and all the workload lost was latency.',
    enter(s, ctx) {
      resetStep(s);
      s.refs.scaleG.style.opacity = '1';
      setBars(s, [RUN_W, RUN_W, RUN_W], ['throttled 50ms', 'throttled 50ms', 'throttled 50ms']);
      setBoxSublabel(s.refs.containerBox, 'running · latency up, no restart');
      // 100 periods x 50ms of stall is throttled_usec 5000000, the 5 seconds the metric reports.
      // It is the kernel's counter and it climbed already: reading it does not move it.
      setChips(s, { weight: WEIGHT_SET, max: MAX_SET, stat: 'nr_throttled 100 of 100 · throttled_usec 5000000' });
      setWire(s, 'kernel', 'cpu.stat scraped · no Pod event, no condition');
      s.refs.kernel.classList.add('highlight');
      s.refs.statChip.classList.add('highlight');
      s.refs.stateChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.kubelet.classList.add('highlight'); return; }
      // cAdvisor reads the cgroup files, so the counter surfaces kernel to Kubelet on the lower
      // lane. Same shape and same lane as the observe step of cluster-oom-kill, on purpose.
      const pkt = topPacket(s, ctx, { from: KERN_X, to: KUBE_X + BOX_W, y: DOWN_Y, role: 'cluster' });
      lightBoxAt(s.refs.kubelet, ctx, pkt.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
