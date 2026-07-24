import { svg, g, text, rect, path } from '../lib/svg.js';
import { arrowDefs, box, pod, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, flashChips, FADE,
} from '../lib/scaling-kit.js';

// VERTICAL scaling card. One Pod, two resource gauges (cpu and memory), each grown IN PLACE by a
// resize. The point is resizePolicy: its default is NotRequired for EVERY resource including memory,
// which applies the change to the live container with no restart (on cgroup v2 even memory.max can
// rise live). RestartContainer is an OPT-IN per-resource choice that tells the kubelet to restart the
// container to apply the change. Here memory carries that opt-in, so its resize reads as a restart
// blink. Either way the POD object and its IP survive, only the container process may restart.
//
// GEOMETRY. The resize subresource box sits top center. One Pod is centered below it holding two
// vertical gauges side by side. A single down lane carries each PATCH. Chips along the bottom.
//
// PULSE MODEL: the subresource box lights via .highlight, only the Pod pulses. The cpu resize is
// NotRequired, so the Pod just pulses on arrival as the gauge rises live. The memory resize carries
// RestartContainer, so the Pod dips to a ghost and restores (the container restart blink, reusing the
// cpu-vs-memory OOM gesture) before it pulses. The why and pod-stays steps carry no packet and no Pod
// action, so they flash their chip.
const SPINE_X = 600;

const EP_X = 440, EP_Y = 96, EP_W = 320, EP_H = 72;        // 440..760, center 600
const EP_BOTTOM = EP_Y + EP_H;                             // 168

const POD_X = 440, POD_Y = 250, POD_W = 320, POD_H = 210;  // 440..760, center 600
const POD_TOP = POD_Y;

const G_TOP = 306, G_BOTTOM = 430;                         // gauge track top / bottom
const G_W = 70;
const CPU_X = 486;                                         // cpu gauge column
const MEM_X = 644;                                         // memory gauge column
const BASE_H = 20;                                         // resting fill
const GROW_H = G_BOTTOM - G_TOP;                           // grown fill (full track)

const CHIPS_Y = 556;

const LANE = [[SPINE_X, EP_BOTTOM], [SPINE_X, POD_TOP]];

function laneWire(points) {
  const d = 'M ' + points.map(p => p.join(' ')).join(' L ');
  return path({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-scaling scheme-arrow-dim', d, 'stroke-dasharray': '5 5', fill: 'none' });
}

// A tag riding along with the ball on the same path, timing and easing, so the packet visibly carries
// the request string. Balls are routePacket (eased), so the label defaults to the same ease-in-out
// and the same routeDur, or it would drift off the ball mid-flight.
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

function oneGauge(x, label) {
  const track   = rect({ x, y: G_TOP, width: G_W, height: GROW_H, rx: 3, fill: 'rgba(255, 160, 77, 0.06)', stroke: 'var(--scaling-color)', 'stroke-width': 1, 'stroke-opacity': 0.35 });
  const reqBase = rect({ x, y: G_BOTTOM - BASE_H, width: G_W, height: BASE_H, rx: 2, fill: 'rgba(255, 160, 77, 0.30)', stroke: 'var(--scaling-color)', 'stroke-width': 1 });
  const reqGrow = rect({ x, y: G_TOP, width: G_W, height: GROW_H, rx: 2, fill: 'rgba(255, 160, 77, 0.55)', stroke: 'var(--scaling-color)', 'stroke-width': 1 });
  reqGrow.style.opacity = '0';
  const cap = text({ class: 'scheme-pod-sublabel', x: x + G_W / 2, y: G_TOP - 8, 'text-anchor': 'middle' }, [label]);
  return { track, reqBase, reqGrow, cap };
}

function buildPod() {
  const shell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web', sublabel: 'one container', containers: 0, cat: 'scaling' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const cpu = oneGauge(CPU_X, 'cpu');
  const mem = oneGauge(MEM_X, 'memory');
  const wrap = g({});
  wrap.appendChild(shell);
  [cpu, mem].forEach(gg => [gg.track, gg.reqGrow, gg.reqBase, gg.cap].forEach(el => wrap.appendChild(el)));
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
      'aria-label': 'Resize restart policies. resizePolicy is set per resource and defaults to NotRequired for every resource including memory, which applies a resize to the live container with no restart. On cgroup v2 even a memory limit can be raised live. RestartContainer is an opt-in per-resource choice that tells the kubelet to restart the container to apply the change. Here memory carries that opt-in, so its resize restarts the container. Either way the Pod object and its IP survive, only the container process may restart. The case that genuinely needs care is shrinking memory below what the process already holds, which risks an OOMKill.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const ep = box({ x: EP_X, y: EP_Y, w: EP_W, h: EP_H, label: 'resize subresource', sublabel: 'PATCH pods/web/resize', cat: 'scaling' });
    const podUnit = buildPod();
    const lane = laneWire(LANE);

    const resChip    = valChip({ x: 140, y: CHIPS_Y, w: 260, h: 34, name: 'resource', value: 'cpu + mem',    cat: 'scaling' });
    const policyChip  = valChip({ x: 420, y: CHIPS_Y, w: 340, h: 34, name: 'policy',   value: 'per resource', cat: 'scaling' });
    const effectChip  = valChip({ x: 780, y: CHIPS_Y, w: 280, h: 34, name: 'effect',   value: 'Running',      cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): subresource box, the down lane, the Pod, chips, packet layer on top.
    [ep, lane, podUnit.wrap].forEach(el => root.appendChild(el));
    [resChip, policyChip, effectChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, ep, pod: podUnit.wrap, cpuGrow: podUnit.cpu.reqGrow, memGrow: podUnit.mem.reqGrow, lane,
      resChip, policyChip, effectChip,
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
function setChips(s, { resource, policy, effect }) {
  setChip(s.refs.resChip, resource);
  setChip(s.refs.policyChip, policy);
  setChip(s.refs.effectChip, effect);
}
function setGauges(s, { cpu, mem }) {
  s.refs.cpuGrow.style.opacity = cpu ? '1' : '0';
  s.refs.memGrow.style.opacity = mem ? '1' : '0';
}

function clearHL(s) {
  clearHighlights(s, ['ep', 'resChip', 'policyChip', 'effectChip'], [s.refs.pod]);
  s.refs.pod.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'This Pod sets a resizePolicy per resource. The default for every resource including memory is NotRequired, which applies a resize to the live container. You can opt a resource into RestartContainer instead, and here memory carries that choice while cpu keeps the default.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { resource: 'cpu + mem', policy: 'per resource', effect: 'Running' });
      setGauges(s, { cpu: false, mem: false });
    },
  },
  {
    id: 'cpu-resize',
    duration: 2600,
    narration: 'A cpu resize arrives. Cpu keeps the default NotRequired, so the kubelet grows the cpu limit on the live container and nothing restarts. The gauge rises in place and the container never misses a beat.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { resource: 'cpu', policy: 'NotRequired', effect: 'live, no restart' });
      setGauges(s, { cpu: true, mem: false });
      s.refs.ep.classList.add('highlight');
      if (ctx.reduced) return;
      s.refs.cpuGrow.style.opacity = '0';
      const pkt = routePacket(s, ctx, LANE, { cat: 'scaling' });
      ridingLabel(s, ctx, 'PATCH .../pods/web/resize', LANE);
      ctx.register(s.refs.cpuGrow.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: pkt.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.pod, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'mem-resize',
    duration: 3400,
    narration: 'A memory resize arrives. Memory here is set to RestartContainer, so the kubelet restarts the container to apply the new limit and restartCount goes up by one. The gauge rises after the restart, which is a container event, not a new Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { resource: 'memory', policy: 'RestartContainer', effect: 'container restart, count +1' });
      setGauges(s, { cpu: true, mem: true });
      s.refs.ep.classList.add('highlight');
      if (ctx.reduced) return;
      s.refs.memGrow.style.opacity = '0';
      const pkt = routePacket(s, ctx, LANE, { cat: 'scaling' });
      ridingLabel(s, ctx, 'PATCH .../pods/web/resize', LANE);
      const restartAt = pkt.arrivalMs;
      // RestartContainer: on arrival the container is torn down (the Pod dips to a ghost) and comes
      // back, reusing the cpu-vs-memory OOM gesture, so the restart reads distinctly from the live cpu
      // step. The memory gauge only rises once the container is back, and the Pod pulses on restore.
      ctx.register(s.refs.pod.animate(
        [
          { opacity: 1, offset: 0 },
          { opacity: 0.3, offset: 0.3 },
          { opacity: 0.3, offset: 0.5 },
          { opacity: 1, offset: 0.82 },
        ],
        { duration: 1600, delay: restartAt, fill: 'forwards', easing: 'ease-in-out' },
      ));
      ctx.register(s.refs.memGrow.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: restartAt + 1250, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.pod, ctx, restartAt + 1250);
    },
  },
  {
    id: 'why',
    duration: 2400,
    narration: 'RestartContainer is an opt-in choice, not a requirement for memory. On cgroup v2 the kubelet can raise memory.max on a live process just like cpu. The case that truly needs care is shrinking memory below what the process already holds, which risks an OOMKill.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { resource: 'memory', policy: 'opt-in restart', effect: 'shrink below usage risks OOM' });
      setGauges(s, { cpu: true, mem: true });
      // Conceptual step, no packet and no Pod action, so the policy chip flashes once.
      s.refs.policyChip.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['policyChip']);
    },
  },
  {
    id: 'pod-stays',
    duration: 2400,
    narration: 'Through both resizes the Pod object itself never changes. Its name, its IP, and its place on the node all stay put, and only the container process inside it may restart. In-place resize adjusts a Pod without ever replacing it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { resource: 'Pod', policy: 'name and IP preserved', effect: 'only container may restart' });
      setGauges(s, { cpu: true, mem: true });
      s.refs.effectChip.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['effectChip']);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
