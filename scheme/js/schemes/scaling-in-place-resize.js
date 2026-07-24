import { svg, g, text, rect, path } from '../lib/svg.js';
import { arrowDefs, box, pod, pathArrow, chainList, setChainActive, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, flashChips, BEAT, FADE,
} from '../lib/scaling-kit.js';

// VERTICAL scaling card. The signature gesture of the vertical subcategory is a SINGLE Pod that
// grows its resource gauge IN PLACE, never a row multiplying. Here one running Pod is PATCHed through
// its resize subresource and the kubelet raises the cpu request live: the gauge reveals its grown
// overlay (reqGrow) on the same Pod, which keeps running. The whole point is NO RESTART for a
// resizable resource, so the Pod pulses but is never recreated.
//
// GEOMETRY. The resize subresource box sits top center (right of the narration overlay in x, so it
// clears it). One Pod sits centered on SPINE_X below it with a vertical cpu gauge inside. A single
// down lane carries the PATCH from the subresource to the Pod. Chips strip along the bottom.
//
// PULSE MODEL: the subresource box is infrastructure, it lights via .highlight and never pulses. Only
// the Pod pulses, and only on the steps where the kubelet actually acts on it (patch, apply). The
// status and ceiling steps carry no packet and no Pod action, so they flash their chip instead.
const SPINE_X = 600;

const EP_X = 440, EP_Y = 96, EP_W = 320, EP_H = 72;        // 440..760, center 600
const EP_BOTTOM = EP_Y + EP_H;                             // 168

const POD_X = 490, POD_Y = 250, POD_W = 220, POD_H = 210;  // 490..710, center 600
const POD_TOP = POD_Y;

const G_X = 560, G_W = 80;                                 // gauge column, centered in the Pod
const G_BASE_Y = 410, G_BASE_H = 20;                       // resting request (cpu 250m)
const G_GROW_Y = 306, G_GROW_H = 124;                      // grown request (cpu 1000m), revealed live

const CHIPS_Y = 556;

// The PATCH lane: straight down from the subresource box into the Pod top.
const LANE = [[SPINE_X, EP_BOTTOM], [SPINE_X, POD_TOP]];

function laneWire(points) {
  const d = 'M ' + points.map(p => p.join(' ')).join(' L ');
  return path({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-scaling scheme-arrow-dim', d, 'stroke-dasharray': '5 5', fill: 'none' });
}

// A tag that rides ALONG with the ball on the same path, timing and easing, so the packet visibly
// carries the request string. Balls are routePacket (eased), so the label defaults to the same
// ease-in-out and the same routeDur, or it would drift off the ball mid-flight.
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

// The Pod shell wrapped in a bare g so pulsePod reaches the shell (and only the shell). The cpu
// gauge is two rects: reqBase is the resting request that is always visible, reqGrow is the enlarged
// request revealed in place when the resize is applied.
function buildPod() {
  const shell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web', sublabel: 'Running, not recreated', containers: 0, cat: 'scaling' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const track = rect({ x: G_X, y: G_GROW_Y, width: G_W, height: G_BASE_Y + G_BASE_H - G_GROW_Y, rx: 3, fill: 'rgba(255, 160, 77, 0.06)', stroke: 'var(--scaling-color)', 'stroke-width': 1, 'stroke-opacity': 0.35 });
  const reqBase = rect({ x: G_X, y: G_BASE_Y, width: G_W, height: G_BASE_H, rx: 2, fill: 'rgba(255, 160, 77, 0.30)', stroke: 'var(--scaling-color)', 'stroke-width': 1 });
  const reqGrow = rect({ x: G_X, y: G_GROW_Y, width: G_W, height: G_GROW_H, rx: 2, fill: 'rgba(255, 160, 77, 0.55)', stroke: 'var(--scaling-color)', 'stroke-width': 1 });
  reqGrow.style.opacity = '0';
  const cap = text({ class: 'scheme-pod-sublabel', x: SPINE_X, y: G_BASE_Y - 4, 'text-anchor': 'middle' }, ['cpu request']);
  const wrap = g({});
  [shell, track, reqGrow, reqBase, cap].forEach(el => wrap.appendChild(el));
  return { wrap, shell, reqBase, reqGrow };
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
      'aria-label': 'In-place Pod resize. A running Pod is PATCHed through its resize subresource and the kubelet raises the cpu request by rewriting the cgroup limits on the live process, so the Pod keeps running with no restart. status.resources reflects the applied value and allocatedResources tracks the node accounting. If the node has no room the resize stays Deferred or Infeasible rather than disrupting the Pod.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const ep = box({ x: EP_X, y: EP_Y, w: EP_W, h: EP_H, label: 'resize subresource', sublabel: 'apiserver endpoint', cat: 'scaling' });
    const podUnit = buildPod();
    const lane = laneWire(LANE);

    // The stage ladder sits in the free right band, clear of the Pod column and the narration overlay.
    const chain = chainList({
      x: 780, y: 250, w: 400, rowH: 32, gap: 12,
      items: [
        '1. PATCH .../pods/web/resize',
        '2. kubelet rewrites cgroup limits live',
        '3. status.resources + allocatedResources',
        '4. Deferred or Infeasible if no room',
      ],
      cat: 'scaling',
    });

    const reqChip     = valChip({ x: 150, y: CHIPS_Y, w: 300, h: 34, name: 'request', value: 'cpu 250m',  cat: 'scaling' });
    const stateChip   = valChip({ x: 470, y: CHIPS_Y, w: 340, h: 34, name: 'state',   value: 'Running',   cat: 'scaling' });
    const restartChip = valChip({ x: 830, y: CHIPS_Y, w: 220, h: 34, name: 'restart', value: '0',         cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): subresource box, the down lane, the Pod, chips, packet layer, then the
    // chain ladder LAST so its rows render above the packet layer.
    [ep, lane, podUnit.wrap].forEach(el => root.appendChild(el));
    [reqChip, stateChip, restartChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);
    root.appendChild(chain);

    this.host.appendChild(root);
    this.refs = {
      svg: root, ep, pod: podUnit.wrap, reqBase: podUnit.reqBase, reqGrow: podUnit.reqGrow, lane, chain,
      reqChip, stateChip, restartChip,
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
function setChips(s, { request, state, restart }) {
  setChip(s.refs.reqChip, request);
  setChip(s.refs.stateChip, state);
  setChip(s.refs.restartChip, restart);
}

// mode: 'base' resting only, 'grown' grown overlay full, 'wanted' grown overlay at a dim ghost (the
// resize that could not be applied because the node had no room).
function setGauge(s, mode) {
  s.refs.reqGrow.style.opacity = mode === 'grown' ? '1' : mode === 'wanted' ? '0.28' : '0';
}

function clearHL(s) {
  clearHighlights(s, ['ep', 'reqChip', 'stateChip', 'restartChip'], [s.refs.pod]);
  s.refs.pod.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'This Pod is running and asking for cpu 250m. In the old model the only way to change that was to delete the Pod and let it be recreated with a new size. In-place resize removes that restart.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, -1);
      setChips(s, { request: 'cpu 250m', state: 'Running', restart: '0' });
      setGauge(s, 'base');
    },
  },
  {
    id: 'patch',
    duration: 2600,
    narration: 'You PATCH the running Pod through its resize subresource, asking for cpu 1000m. The request goes to the apiserver, which records the desired size on the resize subresource. The Pod is never deleted to receive it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 0);
      setChips(s, { request: 'cpu 1000m', state: 'resize requested', restart: '0' });
      setGauge(s, 'base');
      s.refs.ep.classList.add('highlight');
      if (ctx.reduced) return;
      // Down-arrow: the PATCH rides the lane to the Pod, carrying its subresource path, and the Pod
      // pulses on arrival.
      const pkt = routePacket(s, ctx, LANE, { cat: 'scaling' });
      ridingLabel(s, ctx, 'PATCH .../pods/web/resize', LANE);
      pulsePod(s.refs.pod, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'apply',
    duration: 2600,
    narration: 'The kubelet sees the change on its watch and rewrites the cgroup limits on the live process, so the cpu request grows in place while the container keeps running. There is no restart for a resizable resource like cpu. One Pod, more room, same process.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 1);
      setChips(s, { request: 'cpu 1000m', state: 'applied live', restart: '0' });
      // The grown gauge is the static end-state, pinned above the guard, the fade below only eases in.
      setGauge(s, 'grown');
      if (ctx.reduced) return;
      s.refs.reqGrow.style.opacity = '0';
      ctx.register(s.refs.reqGrow.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.pod, ctx, 260);
    },
  },
  {
    id: 'status',
    duration: 2400,
    narration: 'status.resources now reports the values actually in effect on the container, and status.allocatedResources tracks what the node has set aside. The spec is what you asked for, the status is what the kubelet really applied.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 2);
      setChips(s, { request: 'cpu 1000m', state: 'status.resources actual', restart: '0' });
      setGauge(s, 'grown');
      // A reporting step with no packet and no Pod action, so the state chip flashes once.
      s.refs.stateChip.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['stateChip']);
    },
  },
  {
    id: 'ceiling',
    duration: 2400,
    narration: 'The resize still needs the node to have room. If there is no capacity for the larger request, the kubelet leaves it Deferred or Infeasible and the Pod keeps running at its old size. A resize is never allowed to disrupt the Pod it targets.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 3);
      setChips(s, { request: 'cpu 1000m', state: 'Deferred, no room', restart: '-' });
      // The wanted size shows only as a dim ghost: it was not applied, so the resting gauge stands.
      setGauge(s, 'wanted');
      s.refs.stateChip.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['stateChip']);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
