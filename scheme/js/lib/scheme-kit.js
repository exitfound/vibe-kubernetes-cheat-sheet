import { g, rect, text, circle, path } from './svg.js';
import { packet, animateAlong } from './primitives.js';
import { Timeline } from './timeline.js';
import { PULSE_POD, PULSE_BLOCK, OPACITY } from './tokens.js';
export { FADE, BEAT, OPACITY } from './tokens.js';
// Design notes: scheme/docs/INTERNALS.md#schemejslibscheme-kitjs

// ---- geometry constants ----
// Not exported: only the connector wrappers below read it, and no card ever did.
// The two connector routes that used to live here were the 320 gutter: one hardcoded left-margin
// dogleg shared by every workloads card. They are gone, each card owns its spine, and the ball
// rides the same points array the wire is drawn from. See WL in workloads-kit.js.
//
// A LAYOUT constant holding POD_SHELL_FILL went with them. It was module-local and unread: its own
// comment said the connector wrappers were its only readers, and those wrappers had been deleted.
// The colour it named is written out at the ~100 sites that build a Pod shell.

export function valChip({ x, y, w, h = 32, name, value, role = '' }) {
  const grp = g({ class: 'scheme-chip', 'data-role': role || null, transform: `translate(${x},${y})` });
  grp.appendChild(rect({ class: 'scheme-chip-rect', x: 0, y: 0, width: w, height: h, rx: 4 }));
  grp.appendChild(text({ class: 'scheme-chip-text', x: 12, y: h / 2 + 4, 'text-anchor': 'start' }, [name]));
  const valueT = text({ class: 'scheme-chip-text', x: w - 12, y: h / 2 + 4, 'text-anchor': 'end' }, [value]);
  grp.appendChild(valueT);
  grp.valueText = valueT;
  return grp;
}
export function setVal(node, txt) { if (node && node.valueText) node.valueText.textContent = txt; }

// setVal, plus the diff that decides whether the chip glows for this step: a chip whose value
// CHANGES lights, a chip that stays the same does not. Steps are always entered in order, so
// comparing against what the chip currently reads is deterministic.
//
// This was 29 byte-identical copies, one per storage card. Note for anything that reads card
// sources rather than running them: prose.mjs resolves chip VALUES by finding a card-local
// function that forwards both parameters to a known setter, and an imported one is invisible to
// that search. It seeds `setChip` by name for exactly this reason. A future rename here has to
// rename it there too, or check-inline and check-labels quietly stop seeing two thirds of the
// values drawn on storage cards while still reporting zero findings.
export function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}
export function setBoxLabel(boxEl, txt) {
  const l = boxEl && boxEl.querySelector('.scheme-box-label');
  if (l) l.textContent = txt;
}
export function setBoxSublabel(boxEl, txt) {
  const sub = boxEl && boxEl.querySelector('.scheme-box-sublabel');
  if (sub) sub.textContent = txt;
}
// The pod shell's own sublabel (its state line). Was byte-identical in all three
// category kits before it was hoisted here.
export function setPodSublabel(podEl, txt) {
  const sub = podEl && podEl.querySelector('.scheme-pod-sublabel');
  if (sub) sub.textContent = txt;
}

// A lane joins two things and is only as present as the fainter of them, so its shade is the MIN of
// its endpoints. Hoisted 2026-07-30 out of two byte-identical card copies (storage-pvc-retention-policy
// and storage-volumeclaimtemplates) written days apart, which is the shape that becomes a third copy
// next: the rule itself is catalog-wide (see the lane rules in scheme/CLAUDE.md), so the one-liner
// belongs where every card can reach it.
export const laneOf = (from, to) => String(Math.min(Number(from), Number(to)));

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
      _timeline: tl,
    };
  };
}

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
export function pulsePodDimWithTint(podEl, ctx, delay, { from = OPACITY.pending, peak = PULSE_POD.dimPeak, dur = PULSE_POD.ms } = {}, tint) {
  if (!podEl) return;
  pulsePodWithTint(podEl, ctx, delay, {}, tint);
  ctx.register(podEl.animate(
    [{ opacity: from }, { opacity: peak }, { opacity: from }],
    { duration: dur, delay, fill: 'both', easing: 'ease-in-out' }
  ));
}
export function clearPodHighlight(podEl) {
  if (!podEl) return;
  for (const el of podEl.querySelectorAll('.scheme-pod-rect, .scheme-box-rect')) {
    el.style.stroke = ''; el.style.strokeOpacity = ''; el.style.strokeWidth = ''; el.style.transition = '';
  }
}

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

export function makeRidingLabel({
  role,                        // palette role for the tag
  dy = -14,                   // resting offset above the ball
  dx = 0,
  easing = 'ease-in-out',     // default; a call may override per hop
  inMs = 150,                 // fade-in duration
  outMs = 180,                // fade-out duration
  hold = 160,                 // gap between arrival and the fade-out starting
  emergeMode = false,         // fade in at delay+emerge (tag appears from inside a block)
} = {}) {
  return function ridingLabel(s, ctx, txt, points, opts = {}) {
    if (ctx.reduced) return;
    const { delay = 0, dur = null, emerge = 0 } = opts;
    const ease = opts.easing ?? easing;
    const yOff = opts.dy ?? dy;
    const xOff = opts.dx ?? dx;
    const d = dur == null ? routeDur(points) : dur;
    const lbl = text({ class: 'scheme-box-sublabel', x: xOff, y: yOff, 'text-anchor': 'middle', 'data-role': role }, [txt]);
    lbl.style.opacity = '0';
    lbl.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px)`;
    s.refs.packetLayer.appendChild(lbl);
    const inDelay = emergeMode ? delay + emerge : Math.max(0, delay - inMs);
    ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: inMs, delay: inDelay, fill: 'forwards', easing: 'ease-out' }));
    ctx.register(animateAlong(lbl, points, { duration: d, delay, easing: ease }));
    ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: outMs, delay: delay + d + hold, fill: 'forwards', easing: 'ease-in' }));
  };
}

// A RELATIONSHIP line: a wire that carries no ball on any step. It must not take an arrowhead,
// because a marker with no traffic under it reads as traffic, and `arrow()` / `pathArrow()` always
// attach one. Written 2026-07-27 to retire 29 hand-rolled copies of the same class string across
// 26 cards, which had already drifted (some omitted the role suffix, some the dasharray).
// Pass `points` for the ordinary case; `d` is for the few cards that build a multi-subpath spine.
export function relationPath({ points, d, role = null, dash = null }) {
  // scheme-arrow-relation sinks the line behind the route wires while keeping the category hue.
  // Without it a relationship reads as traffic: see docs/INTERNALS.md#schemecssdiagramscss.
  const cls = ['scheme-arrow', 'scheme-arrow-dashed', 'scheme-arrow-dim', 'scheme-arrow-relation'];
  if (role) cls.push(`scheme-arrow-${role}`);
  const attrs = { class: cls.join(' '), 'data-role': role || null, fill: 'none' };
  attrs.d = d !== undefined ? d : points.map(([px, py], i) => `${i ? 'L' : 'M'} ${px} ${py}`).join(' ');
  if (dash) attrs['stroke-dasharray'] = dash;
  return path(attrs);
}

// An object COMING INTO EXISTENCE part way through a step: it rests at `from` and lands on full
// when its packet arrives. Hoisted 2026-07-29 out of nine byte-similar storage copies, which is
// also what fixes them: every copy short-circuited on `delay <= 0` straight to opacity 1, so a
// reveal at step entry silently played no fade AND threw `from` away. That put two live cards on
// the wrong resting shade. Duration is the landing fade the nine copies all used, deliberately
// not FADE.in (600), which is the general-purpose one. Exported because three cards sequence the
// NEXT beat off the end of a reveal, and a private copy of the number is how those two drift apart.
// `from` is the shade the object rests at while a lane already points AT it: hiding it outright
// aims the arrowhead at blank canvas for the whole flight.
export const REVEAL_MS = 500;
export function revealAt(el, ctx, delay = 0, from = 0) {
  if (!el) return;
  if (ctx.reduced) { el.style.opacity = '1'; return; }
  el.style.opacity = String(from);
  ctx.register(el.animate([{ opacity: from }, { opacity: 1 }],
    { duration: REVEAL_MS, delay, fill: 'forwards', easing: 'ease-out' }));
}

// The keyframe list is EMPTY, and that is the whole point: this animation is a timer, it must not
// name a property. It used to be `[{ opacity: 1 }, { opacity: 1 }]`, which draws nothing and yet
// costs the block its rendering, because Chrome composites an element for as long as an opacity
// animation is attached to it, delay phase included. lightBoxAt is pending for exactly the flight
// of the ball, so every block about to light was promoted to its own layer while the ball
// travelled and dropped back on arrival, and its 72% opaque fill was blended by the compositor
// instead of in the raster pass for that window: the canvas of the block shifts tone for a beat
// and snaps back. Confirmed on cluster-architecture with CDP LayerTree (`g.scheme-box 222x82`
// appears mid-flight and is gone after), and it cascades, because anything painted above a
// composited layer and overlapping it is promoted too, which took three lanes and a wire label
// with it. Empty keyframes animate nothing, so there is nothing to composite.
export function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// Run fn at a point INSIDE a step, or at once on the static path so the reduced end-state stays
// right. The sibling of lightBoxAt: same zero-effect 1ms animation used purely as a timer, but
// carrying an arbitrary callback instead of a class. It is what turns a chip over on the beat that
// earns its value, so a chip does not run ahead of the motion that produces it.
//
// This had TWELVE copies in twelve cards with four different bodies, differing only in which
// element they hung the timer on (svg / chain / agent / packetLayer, all arbitrary since the
// animation has no visible effect) and in whether they had the reduced guard at all: the
// workloads-job-parallelism copy did not. That one happened to be harmless because its only call
// site sits below the step's `ctx.reduced` guard, but it was one edit away from breaking prev/reset.
// Same retirement as lightBoxAt (52 copies) and ridingLabel (51).
//
// Note what it CANNOT do: Timeline cancels a step's animations on the way out, and cancel() fires
// oncancel, never onfinish, so a pending callback is dropped when the reader steps away mid-flight.
// Do not "fix" that with an oncancel handler: _cancelAnims runs BEFORE the next step's enter(), and
// the event is asynchronous, so the callback would land on top of the step the reader moved TO.
// The guarantee has to come from the card instead: every enter() writes every chip.
//
// Empty keyframes for the reason written over lightBoxAt, and here the cost was the whole card
// rather than one block: the timer hangs on the SVG ROOT, so an opacity keyframe promoted the
// entire diagram to its own layer for the length of the wait.
export function at(s, ctx, delay, fn) {
  if (ctx.reduced || delay <= 0) { fn(); return; }
  const a = s.refs.svg.animate([], { duration: 1, delay });
  a.onfinish = fn;
  ctx.register(a);
}

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

export function packetAlong(packetLayer, ctx, points, {
  delay = 0, dur = null, role = '', easing = 'ease-in-out',
  offsets = null, fadeIn = true, fadeOut = true, fadeMs = 200,
} = {}) {
  const travel = dur == null ? routeDur(points) : dur;
  const p = packet({ x: points[0][0], y: points[0][1], role });
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
  arrivalRipple(packetLayer, ctx, points[points.length - 1], delay + travel, role);
  p.arrivalMs = delay + travel;
  return p;
}
export function arrivalRipple(packetLayer, ctx, point, delay, role = '') {
  if (!packetLayer || ctx.reduced) return;
  const ring = circle({ class: 'scheme-ripple', 'data-role': role, cx: 0, cy: 0, r: 9 });
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
// Short packet on a top arrow (animateAlong). fadeIn only when delayed (matches the cards).
export function topPacket(s, ctx, { from = 540, to = 580, y = 65, delay = 0, dur = HOP_MS, role = '' } = {}) {
  return packetAlong(s.refs.packetLayer, ctx, [[from, y], [to, y]], { delay, dur, role, fadeIn: delay > 0 });
}
// Toggle which connector copy (down/up) is visible to match the packet direction.
export function setConnectorDir(s, dir) {
  s.refs.connectorDown.style.opacity = dir === 'up' ? '0' : '1';
  s.refs.connectorUp.style.opacity   = dir === 'up' ? '1' : '0';
}

export function routePacket(s, ctx, points, {
  delay = 0, dur = null, role = '', easing = 'ease-in-out',
  offsets = null, fadeIn = (delay > 0), fadeOut = true,
} = {}) {
  return packetAlong(s.refs.packetLayer, ctx, points, { delay, dur, role, easing, offsets, fadeIn, fadeOut });
}
// Segment-visible hop across a single arrow: crisp short fades, always linear.
export function segmentPacket(s, ctx, { from, to, delay = 0, dur = null, role = '', fadeMs = 100 } = {}) {
  return packetAlong(s.refs.packetLayer, ctx, [from, to], { delay, dur, role, easing: 'linear', fadeMs, fadeIn: true, fadeOut: true });
}
