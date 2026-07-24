import { svg, g, text, path } from '../lib/svg.js';
import { arrowDefs, box, pod, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, flashChips, BEAT, FADE,
} from '../lib/scaling-kit.js';

// scaling-hpa-multiple-metrics: highest wins. Given several metrics, the HPA runs the ratio formula
// independently for EACH one, gets a desired replica count from each, and takes the MAXIMUM. Here cpu
// wants seven Pods and memory wants six, so it scales to seven. Taking the max means no single
// dimension is ever left under-provisioned.
//
// GEOMETRY. The two metric dials sit top left and top right (clear of the overlay), a max box sits
// between and below them, and the replica row sits low on y=ROW_Y with full width. Each branch sends
// its desired count down into the max box (box to box, no pod), the max box then feeds the row, and
// only the new Pods pulse.
const SPINE_X = 600;

const CPU_X = 430, CPU_Y = 90, CPU_W = 230, CPU_H = 64;    // center 545,122
const CPU_CX = CPU_X + CPU_W / 2, CPU_BOTTOM = CPU_Y + CPU_H; // 545, 154
const MEM_X = 740, MEM_Y = 90, MEM_W = 230, MEM_H = 64;    // center 855,122
const MEM_CX = MEM_X + MEM_W / 2, MEM_BOTTOM = MEM_Y + MEM_H; // 855, 154

const MAX_X = 490, MAX_Y = 250, MAX_W = 220, MAX_H = 60;   // center 600,280
const MAX_BOTTOM = MAX_Y + MAX_H;                          // 310

const SLOTS = 7;
const P_W = 96, P_H = 118, P_GAP = 28;
const ROW_Y = 396;
const ROW_W = SLOTS * P_W + (SLOTS - 1) * P_GAP;           // 840
const ROW_X0 = SPINE_X - ROW_W / 2;                        // 180
const slotX = i => ROW_X0 + i * (P_W + P_GAP);
const slotCX = i => slotX(i) + P_W / 2;                    // 228,352,476,600,724,848,972

const CHIPS_Y = 556;
const BUS_Y = 372;

const CPU_LANE = [[CPU_CX, CPU_BOTTOM], [CPU_CX, MAX_Y]];
const MEM_LANE = [[MEM_CX, MEM_BOTTOM], [MEM_CX, 210], [655, 210], [655, MAX_Y]];
const createLane = i => [[SPINE_X, MAX_BOTTOM], [SPINE_X, BUS_Y], [slotCX(i), BUS_Y], [slotCX(i), ROW_Y]];

function laneWire(points, { dim = true } = {}) {
  const cls = 'scheme-arrow scheme-arrow-dashed scheme-arrow-scaling' + (dim ? ' scheme-arrow-dim' : '');
  const d = 'M ' + points.map(p => p.join(' ')).join(' L ');
  return path({ class: cls, d, 'stroke-dasharray': '5 5', fill: 'none' });
}

function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'ease-in-out' } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: -14, 'text-anchor': 'middle', 'data-cat': 'scaling' }, [txt]);
  lbl.style.opacity = '0';
  lbl.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px)`;
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 160, fill: 'forwards', easing: 'ease-in' }));
}

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

function buildReplica(i) {
  const x = slotX(i), y = ROW_Y;
  const shell = pod({ x, y, w: P_W, h: P_H, label: 'web', containers: 0, cat: 'scaling' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const wrap = g({});
  wrap.appendChild(shell);
  return { wrap, shell };
}

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Scaling on multiple metrics: highest wins. The HPA runs the ratio formula independently for each metric and takes the maximum of the results. Here cpu at eighty percent wants seven Pods and memory at sixty five percent wants six, so the HPA scales to seven. Taking the maximum guarantees that no single dimension is ever left under-provisioned, at the cost of scaling for whichever resource happens to be hottest.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const cpu = box({ x: CPU_X, y: CPU_Y, w: CPU_W, h: CPU_H, label: 'cpu 80%', sublabel: 'target 50%', cat: 'scaling' });
    const mem = box({ x: MEM_X, y: MEM_Y, w: MEM_W, h: MEM_H, label: 'memory 65%', sublabel: 'target 50%', cat: 'scaling' });
    const maxBox = box({ x: MAX_X, y: MAX_Y, w: MAX_W, h: MAX_H, label: 'max( ... )', sublabel: 'highest wins', cat: 'scaling' });

    const replicas = [];
    for (let i = 0; i < SLOTS; i++) replicas.push(buildReplica(i));
    const rowGroup = g({});
    replicas.forEach(r => rowGroup.appendChild(r.wrap));

    const cpuChip    = valChip({ x: 120, y: CHIPS_Y, w: 300, h: 34, name: 'cpu',    value: '80%', cat: 'scaling' });
    const memChip    = valChip({ x: 450, y: CHIPS_Y, w: 300, h: 34, name: 'mem',    value: '65%', cat: 'scaling' });
    const chosenChip = valChip({ x: 780, y: CHIPS_Y, w: 280, h: 34, name: 'chosen', value: '-',   cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): dials and max box, replica row, chip strip, packet layer.
    [cpu, mem, maxBox, rowGroup].forEach(el => root.appendChild(el));
    [cpuChip, memChip, chosenChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, cpu, mem, maxBox, replicas,
      cpuChip, memChip, chosenChip,
      wires: {}, packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}
function setChips(s, { cpu, mem, chosen }) {
  setChip(s.refs.cpuChip, cpu);
  setChip(s.refs.memChip, mem);
  setChip(s.refs.chosenChip, chosen);
}

function setRow(s, visibleCount) {
  s.refs.replicas.forEach((r, i) => {
    r.wrap.style.opacity = i < visibleCount ? '1' : '0';
    r.wrap.style.transform = 'translate(0px, 0px)';
  });
}

function clearHL(s) {
  clearHighlights(s, ['cpu', 'mem', 'maxBox', 'cpuChip', 'memChip', 'chosenChip'],
    s.refs.replicas.map(r => r.wrap));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'This HPA watches two metrics at once, cpu and memory, both targeting fifty percent. The workload runs four replicas. When more than one metric is set, the HPA does not average them, it computes each one separately.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cpu: '80%', mem: '65%', chosen: '-' });
      setRow(s, 4);
    },
  },
  {
    id: 'cpu-branch',
    duration: 2600,
    narration: 'Take cpu first. It is at eighty percent against a fifty percent target, so with four replicas the formula gives the ceiling of four times eighty over fifty, which is the ceiling of six point four, so seven. The cpu branch wants seven Pods.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cpu: '80% -> 7', mem: '65%', chosen: '-' });
      setRow(s, 4);
      s.refs.cpu.classList.add('highlight');
      if (ctx.reduced) { s.refs.maxBox.classList.add('highlight'); return; }
      // Box to box hop: the cpu branch result drops into the max box, which lights on arrival. No Pod
      // acts, so nothing pulses.
      s.refs.packetLayer.appendChild(laneWire(CPU_LANE));
      const pkt = routePacket(s, ctx, CPU_LANE, { cat: 'scaling' });
      ridingLabel(s, ctx, 'desired 7', CPU_LANE);
      lightBoxAt(s.refs.maxBox, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'mem-branch',
    duration: 2600,
    narration: 'Now memory, independently. It is at sixty five percent against fifty, so four times sixty five over fifty is the ceiling of five point two, which is six. The memory branch wants six Pods. Two branches, two different answers.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cpu: '80% -> 7', mem: '65% -> 6', chosen: '-' });
      setRow(s, 4);
      s.refs.mem.classList.add('highlight');
      if (ctx.reduced) { s.refs.maxBox.classList.add('highlight'); return; }
      s.refs.packetLayer.appendChild(laneWire(MEM_LANE));
      const pkt = routePacket(s, ctx, MEM_LANE, { cat: 'scaling' });
      ridingLabel(s, ctx, 'desired 6', MEM_LANE);
      lightBoxAt(s.refs.maxBox, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'max',
    duration: 2400,
    narration: 'The HPA compares the two desired counts and keeps the larger. The max of seven and five is seven. Whichever metric demands the most capacity wins the tick, so the hottest resource sets the size.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cpu: '80% -> 7', mem: '65% -> 6', chosen: '7' });
      setRow(s, 4);
      // Conceptual step: the max box lights and the chosen chip flashes once. No packet, no Pod acts.
      s.refs.maxBox.classList.add('highlight');
      s.refs.chosenChip.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['chosenChip']);
    },
  },
  {
    id: 'grow',
    duration: 3800,
    narration: 'The winning count drives the scale endpoint, so the workload grows from four Pods to seven. Memory alone would have stopped at six, but because cpu asked for more, the HPA provisions enough for cpu and memory rides along with headroom to spare.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cpu: '80% -> 7', mem: '65% -> 6', chosen: '7' });
      setRow(s, 7);
      s.refs.maxBox.classList.add('highlight');
      if (ctx.reduced) return;
      // The max feeds the row: three new replicas are created down their create lanes and pulse as
      // each create ball lands.
      const NEW = [4, 5, 6];
      NEW.forEach((i, k) => {
        const lane = createLane(i);
        s.refs.packetLayer.appendChild(laneWire(lane));
        const start = BEAT.afterHop + k * 180;
        const pkt = routePacket(s, ctx, lane, { delay: start, cat: 'scaling' });
        const w = s.refs.replicas[i].wrap;
        w.style.opacity = '0';
        w.style.transform = 'translate(0px, 14px)';
        ctx.register(w.animate(
          [{ opacity: 0, transform: 'translate(0px, 14px)' }, { opacity: 1, transform: 'translate(0px, 0px)' }],
          { duration: 340, delay: pkt.arrivalMs, fill: 'forwards', easing: 'ease-out' },
        ));
        pulsePod(w, ctx, pkt.arrivalMs + 120);
      });
    },
  },
  {
    id: 'why',
    duration: 2400,
    narration: 'The max rule is deliberately one-sided. Averaging the metrics could leave the hottest one starved, so the HPA always sizes for the most demanding dimension. The trade is that a single spiky metric can pull the whole workload up.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cpu: '80% -> 7', mem: '65% -> 6', chosen: '7' });
      setRow(s, 7);
      // Conceptual close: the max box lights and both branch chips flash once. No packet, no Pod acts.
      s.refs.maxBox.classList.add('highlight');
      s.refs.cpuChip.classList.add('highlight');
      s.refs.memChip.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['cpuChip', 'memChip']);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
