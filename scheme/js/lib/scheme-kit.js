// scheme-kit.js — shared helpers for the workloads scheme cards.
//
// These functions were copy-pasted byte-for-byte into every workloads card; this module
// is the single source of truth. The bodies are reproduced verbatim from the cards so
// migration is behaviour-preserving (verified by visual-regression + play-probe).
//
// Conventions:
//   - `s` is the Scene instance (uses s.refs.packetLayer, s.refs.connectorDown/Up).
//   - `ctx` is the Timeline step context ({ reduced, speed, register }).
//   - `podEl` is the wrapper <g> that contains a `.scheme-pod` shell and a `.scheme-box`.
import { g, rect, text, circle } from './svg.js';
import { packet, animateAlong } from './primitives.js';
import { Timeline } from './timeline.js';
import { PULSE_POD, PULSE_BLOCK, OPACITY } from './tokens.js';
export { FADE, BEAT } from './tokens.js';

// ---- tint + geometry constants ----
export const TINT_BASE   = 'rgb(91, 184, 255)';
export const TINT_BRIGHT = 'rgb(142, 198, 247)';

export const LAYOUT = Object.freeze({
  VIEWBOX: '0 0 1200 640',
  CONNECTOR_DOWN: [[320, 80], [280, 80], [280, 550], [320, 550]],
  CONNECTOR_UP:   [[320, 550], [280, 550], [280, 80], [320, 80]],
  POD_SHELL_FILL: 'rgba(255, 255, 255, 0.03)',
});

// ---- chip + label setters ----
export function valChip({ x, y, w, h = 32, name, value, cat = 'control' }) {
  const grp = g({ class: 'scheme-chip', 'data-cat': cat, transform: `translate(${x},${y})` });
  grp.appendChild(rect({ class: 'scheme-chip-rect', x: 0, y: 0, width: w, height: h, rx: 4 }));
  grp.appendChild(text({ class: 'scheme-chip-text', x: 12, y: h / 2 + 4, 'text-anchor': 'start' }, [name]));
  const valueT = text({ class: 'scheme-chip-text', x: w - 12, y: h / 2 + 4, 'text-anchor': 'end' }, [value]);
  grp.appendChild(valueT);
  grp.valueText = valueT;
  return grp;
}
export function setVal(node, txt) { if (node && node.valueText) node.valueText.textContent = txt; }
export function setBoxLabel(boxEl, txt) {
  const l = boxEl && boxEl.querySelector('.scheme-box-label');
  if (l) l.textContent = txt;
}
export function setBoxSublabel(boxEl, txt) {
  const sub = boxEl && boxEl.querySelector('.scheme-box-sublabel');
  if (sub) sub.textContent = txt;
}

// ---- step-reset helpers (were byte-identical in every card) ----
// Clears .highlight from the given s.refs keys, every chain chip (when the card
// has a chain strip), and the pod stroke highlight on the given pod elements.
// Card-specific extras (tick ladders, event slots) stay in the card's clearHL.
export function clearHighlights(s, keys, pods = []) {
  keys.forEach(k => { const el = s.refs[k]; if (el) el.classList.remove('highlight'); });
  if (s.refs.chain) s.refs.chain.querySelectorAll('.scheme-chip').forEach(c => c.classList.remove('highlight'));
  pods.forEach(p => clearPodHighlight(p));
}
export function clearWires(s) {
  if (!s.refs.wires) return;
  Object.values(s.refs.wires).forEach(t => { t.textContent = ''; });
}
export function setWire(s, key, txt) {
  if (s.refs.wires && s.refs.wires[key]) s.refs.wires[key].textContent = txt;
}

// ---- init() boilerplate (20 cards were byte-identical) ----
export function makeInit(SceneClass, STEPS, opts = {}) {
  return function init(root, callbacks = {}) {
    const scene = new SceneClass(root);
    const tl = new Timeline({
      steps: STEPS,
      scene,
      onSceneReset: () => scene.reset(),
      onChange: callbacks.onStepChange,
      onPlayingChange: callbacks.onPlayingChange,
      // Workloads + control cards: only pods pulse. The generic block auto-pulse
      // (brightness flash on any freshly highlighted block/chip) is off here; pods
      // pulse via explicit pulsePod calls. Override per card with opts.autoPulse.
      autoPulse: false,
      ...opts,
    });
    return {
      play: () => tl.play(),
      pause: () => tl.pause(),
      reset: () => tl.reset(),
      restart: () => tl.restart(),
      gotoStep: (i) => tl.gotoStep(i),
      setLoop: (b) => tl.setLoop(b),
      isLooping: () => tl.isLooping(),
      step: (dir) => tl.step(dir),
      setSpeed: (r) => tl.setSpeed(r),
      isPlaying: () => tl.isPlaying(),
      autoPlay: (ms) => tl.autoPlay(ms),
      destroy: () => { tl.destroy(); root.replaceChildren(); },
      posterFirst: !!opts.posterFirst,
      total: STEPS.length,
      // Inert debug handle for scheme/tools (anim-dump, frame-strip): lets a tool run a
      // single step's play-path with no auto-advance and then seek its WAAPI animations
      // deterministically. Never touched in normal use; exposed only via window.__schemeCtl
      // when inspect mode is on.
      _timeline: tl,
    };
  };
}

// ---- pod pulse (unified, element-based, tinted) ----
// podEl is the wrapper group; the function queries the shell/box rects inside it.
// Single-pod cards pass s.refs.podGroup; multi-pod cards pass s.refs.pod1 etc.
// pulsePodWithTint is the single source of truth; both card families call it through
// a thin tinted wrapper (workloads blue here, control violet in control-kit).
export function pulsePodWithTint(podEl, ctx, delay, { persist = false } = {}, tint) {
  if (!podEl) return;
  const RAMP = PULSE_POD.ms / 2;
  for (const el of podEl.querySelectorAll('.scheme-pod-rect, .scheme-box-rect')) {
    el.style.transition = 'none';
    const up = el.animate([
      { stroke: tint.base,   strokeOpacity: 0.65, strokeWidth: 1.2 },
      { stroke: tint.bright, strokeOpacity: 1,    strokeWidth: 2.4 },
    ], { duration: RAMP, delay, fill: 'forwards', easing: 'ease-in-out' });
    ctx.register(up);
    if (persist) {
      up.onfinish = () => { el.style.stroke = tint.bright; el.style.strokeOpacity = '1'; el.style.strokeWidth = '2.4'; };
    } else {
      ctx.register(el.animate([
        { stroke: tint.bright, strokeOpacity: 1,    strokeWidth: 2.4 },
        { stroke: tint.base,   strokeOpacity: 0.65, strokeWidth: 1.2 },
      ], { duration: RAMP, delay: delay + RAMP, fill: 'forwards', easing: 'ease-in-out' }));
    }
  }
  const BRIGHTNESS_FRAMES = [
    { filter: 'brightness(1)' }, { filter: `brightness(${PULSE_POD.bright})` }, { filter: 'brightness(1)' },
  ];
  for (const el of podEl.querySelectorAll('.scheme-pod, .scheme-box')) {
    ctx.register(el.animate(BRIGHTNESS_FRAMES, { duration: PULSE_POD.ms, delay, fill: 'forwards', easing: 'ease-in-out' }));
  }
}
const POD_TINT = { base: TINT_BASE, bright: TINT_BRIGHT };
export function pulsePod(podEl, ctx, delay = 0, opts = {}) {
  return pulsePodWithTint(podEl, ctx, delay, opts, POD_TINT);
}
// Pulse a dimmed pod (booting / not-Ready): pulsePod plus an opacity flash up to
// `peak` and back to `from`, so the highlight reads on the faded pod. Replaces the
// hand-rolled "pulse + opacity blink" idiom. control-kit binds the violet tint.
export function pulsePodDimWithTint(podEl, ctx, delay, { from = OPACITY.booting, peak = OPACITY.partial, dur = PULSE_POD.ms } = {}, tint) {
  if (!podEl) return;
  pulsePodWithTint(podEl, ctx, delay, {}, tint);
  ctx.register(podEl.animate(
    [{ opacity: from }, { opacity: peak }, { opacity: from }],
    { duration: dur, delay, fill: 'both', easing: 'ease-in-out' }
  ));
}
export function pulsePodDim(podEl, ctx, delay = 0, opts = {}) {
  return pulsePodDimWithTint(podEl, ctx, delay, opts, POD_TINT);
}
export function clearPodHighlight(podEl) {
  if (!podEl) return;
  for (const el of podEl.querySelectorAll('.scheme-pod-rect, .scheme-box-rect')) {
    el.style.stroke = ''; el.style.strokeOpacity = ''; el.style.strokeWidth = ''; el.style.transition = '';
  }
}

// One-shot brightness flash for chips/blocks whose value changes on a step that
// has no packet motion, so the step does not read as a frozen frame. This is the
// only sanctioned block flash: steps with packets keep the static highlight
// outline only (blocks do not blink, pods do).
export function flashChips(s, ctx, keys, delay = 0) {
  if (ctx.reduced) return;
  const FRAMES = [
    { filter: 'brightness(1)' }, { filter: `brightness(${PULSE_BLOCK.bright})` }, { filter: 'brightness(1)' },
  ];
  keys.forEach(k => {
    const el = s.refs[k];
    if (el) ctx.register(el.animate(FRAMES, { duration: PULSE_BLOCK.ms, delay, easing: PULSE_BLOCK.easing }));
  });
}

// ---- packet travel: one core + thin route wrappers ----
// easing 'ease-in-out' => animateAlong (even-by-distance). easing 'linear' => explicit
// keyframes; offsets null => even-by-distance, else use the provided offset array.
// Travel duration from path length (0.45 px/ms, clamped). This is THE speed canon:
// route calls omit `dur` so the ball moves at one speed everywhere regardless of
// distance. An explicit `dur` is reserved for narrative pacing and needs a one-line
// justification at the call site. Length math mirrors animateAlong's accumulator.
//
// HOP_MS is the one comfortable-hop-time knob: it is both topPacket's fixed duration
// AND routeDur's floor. A SHORT routed hop reads as a calm hop, not a dart. Below
// ~315 units a path would otherwise finish under HOP_MS (e.g. a 220u control-plane
// arrow at 489ms), which reads as too fast next to the long connector glide. Long
// routes stay length-proportional and are unaffected. Tune pacing here, in one place.
const HOP_MS = 700;
const PKT_SPEED = 0.45, PKT_DUR_MIN = HOP_MS, PKT_DUR_MAX = 2600;
export function routeLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  return total;
}
export function routeDur(points) {
  return Math.round(Math.min(PKT_DUR_MAX, Math.max(PKT_DUR_MIN, routeLength(points) / PKT_SPEED)));
}
// Arrival time at the destination, for timing a pulse off real geometry instead
// of a hard-coded delay (delay + travel). Mirrors packetAlong's dur resolution.
export function packetArrival(points, { delay = 0, dur = null } = {}) {
  return delay + (dur == null ? routeDur(points) : dur);
}

// Every packet ripples at its destination (the "delivered" cue is part of the
// arrival canon, no per-call opt-in). The returned packet element carries
// `arrivalMs = delay + travel` so cards anchor arrival pulses and fades to real
// geometry instead of hard-coded delays.
export function packetAlong(packetLayer, ctx, points, {
  delay = 0, dur = null, cat = 'control', easing = 'ease-in-out',
  offsets = null, fadeIn = true, fadeOut = true, fadeMs = 200,
} = {}) {
  const travel = dur == null ? routeDur(points) : dur;
  const p = packet({ x: points[0][0], y: points[0][1], cat });
  if (fadeIn) p.style.opacity = '0';
  packetLayer.appendChild(p);
  if (fadeIn) {
    const fadeInDelay = Math.max(0, delay - fadeMs);
    ctx.register(p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: fadeMs, delay: fadeInDelay, fill: 'forwards', easing: 'ease-out' }));
  }
  if (easing === 'linear') {
    let frames;
    if (offsets) {
      frames = points.map((pt, i) => ({ transform: `translate(${pt[0]}px, ${pt[1]}px)`, offset: offsets[i] }));
    } else {
      const seg = []; let total = 0;
      for (let i = 1; i < points.length; i++) { const d = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]); seg.push(d); total += d; }
      let acc = 0;
      frames = points.map((pt, i) => { if (i > 0) acc += seg[i - 1]; return { transform: `translate(${pt[0]}px, ${pt[1]}px)`, offset: total ? acc / total : 0 }; });
    }
    ctx.register(p.animate(frames, { duration: travel, delay, fill: 'forwards', easing: 'linear' }));
  } else {
    ctx.register(animateAlong(p, points, { duration: travel, delay }));
  }
  if (fadeOut) {
    ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: fadeMs, delay: delay + travel, fill: 'forwards', easing: 'ease-in' }));
  }
  arrivalRipple(packetLayer, ctx, points[points.length - 1], delay + travel, cat);
  p.arrivalMs = delay + travel;
  return p;
}
// Arrival ripple: a one-shot ring that expands and fades at `point` at time `delay`,
// reinforcing "delivered". Separate .scheme-ripple class so play-probe (which counts
// .scheme-packet) is unaffected. Exposed so cards that animate packets by hand (not via
// the route wrappers) can still add the same arrival cue.
export function arrivalRipple(packetLayer, ctx, point, delay, cat = 'control') {
  if (!packetLayer || ctx.reduced) return;
  const ring = circle({ class: 'scheme-ripple', 'data-cat': cat, cx: 0, cy: 0, r: 9 });
  ring.style.opacity = '0';
  packetLayer.appendChild(ring);
  ctx.register(ring.animate(
    [
      { transform: `translate(${point[0]}px, ${point[1]}px) scale(0.35)`, opacity: 0.95 },
      { transform: `translate(${point[0]}px, ${point[1]}px) scale(3)`, opacity: 0 },
    ],
    { duration: 560, delay, fill: 'forwards', easing: 'ease-out' }
  ));
}
// Canonical left-margin connector, top->node (animateAlong). dur omitted => routeDur.
export function connectorPacket(s, ctx, { delay = 0, dur = null } = {}) {
  return packetAlong(s.refs.packetLayer, ctx, LAYOUT.CONNECTOR_DOWN, { delay, dur });
}
// Directional connector, top<->node. Glides ease-in-out by canon (animateAlong,
// distance-weighted); dur omitted => routeDur normalizes speed by path length.
// Pass easing:'linear' + offsets:[0,0.15,0.85,1] only for a deliberate per-segment profile.
export function connectorPacketDir(s, ctx, dir, { delay = 0, dur = null, easing = 'ease-in-out', offsets = null } = {}) {
  const pts = dir === 'up' ? LAYOUT.CONNECTOR_UP : LAYOUT.CONNECTOR_DOWN;
  return packetAlong(s.refs.packetLayer, ctx, pts, { delay, dur, easing, offsets });
}
// Short packet on a top arrow (animateAlong). fadeIn only when delayed (matches the cards).
export function topPacket(s, ctx, { from = 540, to = 580, y = 65, delay = 0, dur = HOP_MS } = {}) {
  return packetAlong(s.refs.packetLayer, ctx, [[from, y], [to, y]], { delay, dur, fadeIn: delay > 0 });
}
// Toggle which connector copy (down/up) is visible to match the packet direction.
export function setConnectorDir(s, dir) {
  s.refs.connectorDown.style.opacity = dir === 'up' ? '0' : '1';
  s.refs.connectorUp.style.opacity   = dir === 'up' ? '1' : '0';
}

// ---- unified packet wrappers ----
// Easing + hop canon: multi-point ROUTES (connectors) glide ease-in-out via
// animateAlong. Short hops come in exactly two flavours: top-row request/ack
// hops use topPacket (eased, the stately top-strip pacing) and hops inside the
// diagram body use segmentPacket (linear, crisp fades). dur omitted =>
// distance-based (routeDur).
//
// Multi-point route along an explicit path. Generalizes every per-card
// connectorPacket and the raw `packet()+animateAlong()+manual fade` idiom. The
// path array stays a local const in the card (geometry is card-specific) and is
// shared with the matching pathArrow so the static wire and the packet agree.
export function routePacket(s, ctx, points, {
  delay = 0, dur = null, cat = 'control', easing = 'ease-in-out',
  offsets = null, fadeIn = (delay > 0), fadeOut = true,
} = {}) {
  return packetAlong(s.refs.packetLayer, ctx, points, { delay, dur, cat, easing, offsets, fadeIn, fadeOut });
}
// Segment-visible hop across a single arrow: crisp short fades, always linear.
export function segmentPacket(s, ctx, { from, to, delay = 0, dur = null, cat = 'control', fadeMs = 100 } = {}) {
  return packetAlong(s.refs.packetLayer, ctx, [from, to], { delay, dur, cat, easing: 'linear', fadeMs, fadeIn: true, fadeOut: true });
}
