import { svg, g, rect, text, circle, path } from './svg.js';
import { packet, animateAlong } from './primitives.js';
import { Timeline } from './timeline.js';
import { PULSE_POD, PULSE_BLOCK, OPACITY } from './tokens.js';
export { FADE, BEAT, OPACITY } from './tokens.js';

// The shared BASE kit for all four categories: each kit re-exports it whole and overrides only the
// pod tint, so no card imports this file, and a name added here goes into all four kits (S-22).

// ---- geometry constants ----
// Not exported: each card owns its own spine, and the ball rides the SAME points array as the wire.

// `role` has NO category default: omitting it leaves the attribute off and the chip falls back to
// the generic .scheme-chip-rect stroke, rather than silently borrowing a neighbouring category's.
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

// setVal plus a static highlight (never a flash) on a chip whose value CHANGED. The diff is
// deterministic: resetStep clears the class and not the text, and steps are entered in order.
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

// A lane is only as present as the fainter of its two ends, so its shade is the MIN of them and is
// never derived from one end alone: ../../CANON.md A-13, A-14, A-16.
export const laneOf = (from, to) => String(Math.min(Number(from), Number(to)));

// `keys` and `pods` are NOT interchangeable: `pods` clears the inline stroke a pulse leaves and no
// class at all, so a `.highlight` put on a Pod inner box has to be named in `keys` or it leaks.
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
      // Block auto-pulse (a brightness flash on any freshly highlighted block or chip) is OFF for
      // the whole catalog: only Pods pulse, through explicit pulsePod calls. Override per card.
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
      // Inert debug handle: a probe plays one step with no auto-advance, then seeks its WAAPI
      // animations deterministically. Reachable only through window.__schemeCtl, in inspect mode.
      _timeline: tl,
    };
  };
}

// The single source of truth for the pod pulse, bound to a tint by each kit. `podEl` is the WRAPPER
// GROUP: the queries match descendants only, so a bare pod() pulses at half strength (CANON.md M-03).
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
// Pulse a DIMMED pod (booting, not-Ready): the ordinary pulse plus an opacity flash up to `peak`
// and back to `from`, so the blink reads against the faded shade instead of vanishing into it.
export function pulsePodDimWithTint(podEl, ctx, delay, { from = OPACITY.pending, peak = PULSE_POD.dimPeak, dur = PULSE_POD.ms } = {}, tint) {
  if (!podEl) return;
  pulsePodWithTint(podEl, ctx, delay, {}, tint);
  ctx.register(podEl.animate(
    [{ opacity: from }, { opacity: peak }, { opacity: from }],
    { duration: dur, delay, fill: 'both', easing: 'ease-in-out' }
  ));
}
// The camera: only the aria sentence varies. 'aria-label' STAYS A SPELLED-OUT OBJECT KEY, because
// the prose scrapes match it in source (108 sentences), and attribute ORDER is observable.
export function diagramRoot({ 'aria-label': ariaLabel }) {
  return svg({
    class: 'diagram',
    viewBox: '0 0 1200 640',
    preserveAspectRatio: 'xMidYMid meet',
    'aria-label': ariaLabel,
    'data-style': 'outline',
  });
}

// A category kit binds its tint once here instead of writing the same two wrappers itself.
// The bodies stay above, so a change to the pulse is one edit rather than five.
export function makeTintedPulses(tint) {
  return {
    pulsePod: (podEl, ctx, delay = 0, opts = {}) => pulsePodWithTint(podEl, ctx, delay, opts, tint),
    pulsePodDim: (podEl, ctx, delay = 0, opts = {}) => pulsePodDimWithTint(podEl, ctx, delay, opts, tint),
  };
}

// The tail every card-local podBlock() shares: geometry stays in the card, only the assembly is
// here. The returned GROUP is what pulsePod takes, since a bare shell pulses at half strength.
export function wrapPod(shell, innerBox) {
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

export function clearPodHighlight(podEl) {
  if (!podEl) return;
  for (const el of podEl.querySelectorAll('.scheme-pod-rect, .scheme-box-rect')) {
    el.style.stroke = ''; el.style.strokeOpacity = ''; el.style.strokeWidth = ''; el.style.transition = '';
  }
}

// The only sanctioned block flash, for a step with no packet motion and no Pod so it does not read
// as a frozen frame. ZERO CALLERS: it stays exported because dropping it takes all four kits (S-25).
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

// An address tag that travels WITH a ball instead of sitting as static wire text. ITS EASING AND
// `dur` MUST MATCH THE BALL (M-30): mismatched, it drifts off mid-flight and rejoins at the ends.
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
    // Pin the tag at the route START. Without it the tag sits at the SVG origin until animateAlong's
    // delay elapses, so its fade-in plays in the top-left corner under the narration panel.
    lbl.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px)`;
    s.refs.packetLayer.appendChild(lbl);
    const inDelay = emergeMode ? delay + emerge : Math.max(0, delay - inMs);
    ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: inMs, delay: inDelay, fill: 'forwards', easing: 'ease-out' }));
    ctx.register(animateAlong(lbl, points, { duration: d, delay, easing: ease }));
    ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: outMs, delay: delay + d + hold, fill: 'forwards', easing: 'ease-in' }));
  };
}

// A RELATIONSHIP line: no ball rides it on any step, so it must NOT take the arrowhead arrow() and
// pathArrow() always attach. Pass the card's OWN points array so the line cannot drift off it.
export function relationPath({ points, d, role = null, dash = null }) {
  // scheme-arrow-relation sinks the line behind the route wires while keeping the category hue.
  // Without it a relationship reads as traffic: see the note in css/diagrams.css.
  const cls = ['scheme-arrow', 'scheme-arrow-dashed', 'scheme-arrow-dim', 'scheme-arrow-relation'];
  if (role) cls.push(`scheme-arrow-${role}`);
  const attrs = { class: cls.join(' '), 'data-role': role || null, fill: 'none' };
  attrs.d = d !== undefined ? d : points.map(([px, py], i) => `${i ? 'L' : 'M'} ${px} ${py}`).join(' ');
  if (dash) attrs['stroke-dasharray'] = dash;
  return path(attrs);
}

// A thing coming INTO EXISTENCE mid-step rests at `from` and lands on full when its packet arrives:
// hiding it aims the arrowhead at blank canvas for the whole flight.
export const REVEAL_MS = 500;   // the landing beat: inside BEAT.lead 800, and not FADE.in's 600
// DO NOT short-circuit `delay <= 0` to opacity 1: that throws `from` away and leaves the element on
// the wrong resting shade. Only ctx.reduced snaps, because a zero-delay reveal is still a real beat.
export function revealAt(el, ctx, delay = 0, from = 0) {
  if (!el) return;
  if (ctx.reduced) { el.style.opacity = '1'; return; }
  el.style.opacity = String(from);
  ctx.register(el.animate([{ opacity: from }, { opacity: 1 }],
    { duration: REVEAL_MS, delay, fill: 'forwards', easing: 'ease-out' }));
}

// Lights a box ON PACKET ARRIVAL through a 1ms animation whose `onfinish` sets the class. THE
// KEYFRAME LIST MUST STAY EMPTY (M-28): an opacity pair composites the block for the whole delay.
export function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// Run fn INSIDE a step, or at once on the static path: this is what turns a chip over on the beat
// that earns it. A pending callback is DROPPED mid-flight, so every enter() must write every chip.
export function at(s, ctx, delay, fn) {
  if (ctx.reduced || delay <= 0) { fn(); return; }
  const a = s.refs.svg.animate([], { duration: 1, delay });
  a.onfinish = fn;
  ctx.register(a);
}

// THE SPEED CANON, and the one place to tune pacing: travel time comes from path LENGTH at
// PKT_SPEED, so route calls omit `dur` and an explicit one needs a justification at the call site.
const HOP_MS = 700;   // topPacket's duration AND routeDur's FLOOR: under ~315 units a path would
                      // otherwise outrun a hop and read as a dart (a 220 unit arrow at 489ms)
const PKT_SPEED = 0.45, PKT_DUR_MIN = HOP_MS, PKT_DUR_MAX = 2600;   // units per ms, clamped
export function routeLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  return total;
}
// Length-based, so MOVING a lane is a TIMING change: pushing a start from 300 to 400 units right
// takes the ball from 250 to 870ms. Raise the step's duration, never shorten the motion.
export function routeDur(points) {
  return Math.round(Math.min(PKT_DUR_MAX, Math.max(PKT_DUR_MIN, routeLength(points) / PKT_SPEED)));
}
// Arrival time at the destination, for timing a pulse off real geometry instead
// of a hard-coded delay (delay + travel). Mirrors packetAlong's dur resolution.
export function packetArrival(points, { delay = 0, dur = null } = {}) {
  return delay + (dur == null ? routeDur(points) : dur);
}

// Every packet ripples at its destination: the delivered cue is arrival canon, with no opt-in. The
// returned element carries `arrivalMs`, so cards anchor pulses to real geometry, not to a constant.
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
// The delivered ring. It carries `.scheme-ripple` and never `.scheme-packet`, so anything counting
// packets sees ONE ball per hop. Exported for a card that animates its packets by hand.
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

// ROUTES glide eased; a short hop is topPacket (eased, top strip) or segmentPacket (linear, body).
// The points array is SHARED with the matching pathArrow, so the wire and the packet cannot differ.
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
