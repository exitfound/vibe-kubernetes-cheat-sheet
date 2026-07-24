import { svg, g, text, rect, line, path } from '../lib/svg.js';
import { arrowDefs, box, pod } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod,
  makeInit, clearHighlights, clearWires, flashChips, FADE,
} from '../lib/scaling-kit.js';

// VERTICAL scaling card. One Pod, two usage gauges (cpu and memory), each with a limit line. The
// point is the asymmetry: cpu is COMPRESSIBLE, so over the limit the container is throttled and the
// Pod survives with higher latency, while memory is INCOMPRESSIBLE, so over the limit the container
// is OOMKilled and restarts. That is why scaling on memory rarely scales back down and why an
// in-place memory downsize can trip an OOM.
//
// GEOMETRY. A context box names the two limits on top. One Pod is centered below it holding a cpu
// gauge and a memory gauge, each with a dashed limit line. Chips along the bottom.
//
// PULSE MODEL: only the Pod pulses. On cpu-over it pulses while surviving the throttle. On mem-over
// the container is OOMKilled, so the Pod ghosts to a dim state like the storage delete step and then
// comes back and pulses on restart. The hpa and resize implication steps carry no packet and no Pod
// action, so they flash their chip.
const SPINE_X = 600;

const HDR_X = 460, HDR_Y = 96, HDR_W = 280, HDR_H = 66;    // 460..740, center 600, context only

const POD_X = 440, POD_Y = 232, POD_W = 320, POD_H = 226;  // 440..760, center 600

const G_TOP = 300, G_BOTTOM = 436, G_LIMIT = 344;          // gauge track top / bottom, limit line
const G_W = 70;
const CPU_X = 486, MEM_X = 644;
const BASE_H = 20;                                         // resting usage, well under the limit

const CHIPS_Y = 556;

function oneGauge(x, label, growFromLimit) {
  const track   = rect({ x, y: G_TOP, width: G_W, height: G_BOTTOM - G_TOP, rx: 3, fill: 'rgba(255, 160, 77, 0.06)', stroke: 'var(--scaling-color)', 'stroke-width': 1, 'stroke-opacity': 0.35 });
  const usageBase = rect({ x, y: G_BOTTOM - BASE_H, width: G_W, height: BASE_H, rx: 2, fill: 'rgba(255, 160, 77, 0.30)', stroke: 'var(--scaling-color)', 'stroke-width': 1 });
  // cpu clamps AT the limit line (throttle), memory crosses ABOVE it (OOM). Fixed geometry per gauge.
  const growY = growFromLimit ? G_LIMIT : G_TOP;
  const over = rect({ x, y: growY, width: G_W, height: G_BOTTOM - growY, rx: 2, fill: 'rgba(255, 160, 77, 0.55)', stroke: 'var(--scaling-color)', 'stroke-width': 1 });
  over.style.opacity = '0';
  const limit = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-scaling', x1: x - 6, y1: G_LIMIT, x2: x + G_W + 6, y2: G_LIMIT, 'stroke-dasharray': '4 4', fill: 'none' });
  const cap = text({ class: 'scheme-pod-sublabel', x: x + G_W / 2, y: G_TOP - 8, 'text-anchor': 'middle' }, [label]);
  return { track, usageBase, over, limit, cap };
}

function buildPod() {
  const shell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web', sublabel: 'one container', containers: 0, cat: 'scaling' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const cpu = oneGauge(CPU_X, 'cpu usage', true);
  const mem = oneGauge(MEM_X, 'memory usage', false);
  const wrap = g({});
  wrap.appendChild(shell);
  [cpu, mem].forEach(gg => [gg.track, gg.over, gg.usageBase, gg.limit, gg.cap].forEach(el => wrap.appendChild(el)));
  return { wrap, cpu, mem };
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
      'aria-label': 'Compressible versus incompressible resources. Cpu is compressible, so when a container goes over its cpu limit it is throttled and survives with higher latency. Memory is incompressible, so when a container goes over its memory limit it is OOMKilled and restarted. This is why scaling on memory rarely scales back down, since a leaking app never lowers its usage, and why shrinking memory in place can trip an OOM without headroom.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const hdr = box({ x: HDR_X, y: HDR_Y, w: HDR_W, h: HDR_H, label: 'container limits', sublabel: 'cpu 500m, memory 256Mi', cat: 'scaling' });
    const podUnit = buildPod();

    const cpuChip = valChip({ x: 130, y: CHIPS_Y, w: 300, h: 34, name: 'cpu',     value: 'under limit', cat: 'scaling' });
    const memChip = valChip({ x: 450, y: CHIPS_Y, w: 300, h: 34, name: 'memory',  value: 'under limit', cat: 'scaling' });
    const outChip = valChip({ x: 770, y: CHIPS_Y, w: 300, h: 34, name: 'outcome', value: 'healthy',     cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): context box, the Pod, chips, packet layer on top.
    [hdr, podUnit.wrap].forEach(el => root.appendChild(el));
    [cpuChip, memChip, outChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, hdr, pod: podUnit.wrap, cpuOver: podUnit.cpu.over, memOver: podUnit.mem.over,
      cpuChip, memChip, outChip,
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
function setChips(s, { cpu, memory, outcome }) {
  setChip(s.refs.cpuChip, cpu);
  setChip(s.refs.memChip, memory);
  setChip(s.refs.outChip, outcome);
}
function setUsage(s, { cpu, mem }) {
  s.refs.cpuOver.style.opacity = cpu ? '1' : '0';
  s.refs.memOver.style.opacity = mem ? '1' : '0';
}

function clearHL(s) {
  clearHighlights(s, ['hdr', 'cpuChip', 'memChip', 'outChip'], [s.refs.pod]);
  s.refs.pod.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'This container has a cpu limit and a memory limit, and its usage of both sits comfortably under them. What happens when usage crosses a limit depends entirely on which resource it is, because the two behave in opposite ways.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cpu: 'under limit', memory: 'under limit', outcome: 'healthy' });
      setUsage(s, { cpu: false, mem: false });
    },
  },
  {
    id: 'cpu-over',
    duration: 2600,
    narration: 'Cpu is compressible. When the container tries to use more cpu than its limit, the kernel simply throttles it: the usage is clamped at the limit line and the work just runs slower. Latency rises but the container stays alive.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cpu: 'over limit, throttled', memory: 'under limit', outcome: 'slower but alive' });
      setUsage(s, { cpu: true, mem: false });
      if (ctx.reduced) return;
      s.refs.cpuOver.style.opacity = '0';
      ctx.register(s.refs.cpuOver.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, fill: 'forwards', easing: 'ease-out' }));
      // The Pod survives the throttle, so it pulses rather than dying.
      pulsePod(s.refs.pod, ctx, 300);
    },
  },
  {
    id: 'mem-over',
    duration: 3400,
    narration: 'Memory is incompressible. When the container tries to use more memory than its limit, there is nothing to throttle: the kernel OOMKills it with exit code 137. The container is torn down and then restarted, and this time the Pod really does lose its process.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cpu: 'under limit', memory: 'over limit, OOMKilled', outcome: 'killed then restarted' });
      // The static end-state is the restarted Pod with memory usage shown, pinned above the guard.
      setUsage(s, { cpu: false, mem: true });
      if (ctx.reduced) return;
      s.refs.memOver.style.opacity = '0';
      ctx.register(s.refs.memOver.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.out, fill: 'forwards', easing: 'ease-out' }));
      // The container is OOMKilled (the Pod ghosts) and then restarts (comes back), then pulses on
      // restart. Opacity keyframes ride the pod wrap, the final value 1 matches the pinned state.
      ctx.register(s.refs.pod.animate(
        [
          { opacity: 1, offset: 0 },
          { opacity: 1, offset: 0.32 },
          { opacity: 0.3, offset: 0.5 },
          { opacity: 0.3, offset: 0.66 },
          { opacity: 1, offset: 0.86 },
        ],
        { duration: 2200, fill: 'forwards', easing: 'ease-in-out' },
      ));
      pulsePod(s.refs.pod, ctx, 1900);
    },
  },
  {
    id: 'hpa-implication',
    duration: 2600,
    narration: 'This asymmetry makes autoscaling on memory awkward. A container that leaks memory keeps its usage high and never releases it, so an autoscaler watching memory scales up but almost never sees a reason to scale back down.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cpu: 'compressible', memory: 'stays high', outcome: 'rarely scales down' });
      setUsage(s, { cpu: false, mem: true });
      // Conceptual step, no packet and no Pod action, so the memory chip flashes once.
      s.refs.memChip.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['memChip']);
    },
  },
  {
    id: 'resize-implication',
    duration: 2600,
    narration: 'The same asymmetry makes an in-place memory downsize risky. If you lower the memory limit below what the process is already holding, you trip an OOMKill on the spot. A safe memory resize needs headroom above the current usage.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cpu: 'safe to squeeze', memory: 'shrink can OOM', outcome: 'needs headroom' });
      setUsage(s, { cpu: false, mem: true });
      s.refs.outChip.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['outChip']);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
