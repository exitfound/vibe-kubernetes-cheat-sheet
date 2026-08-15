import { setChainActive } from './primitives.js';
import {
  makeInit, at, lightBoxAt, revealAt, routePacket, segmentPacket, topPacket, arrivalRipple,
  setVal, setChip, setWire, setBoxLabel, setBoxSublabel, setPodSublabel, BEAT, REVEAL_MS,
} from './scheme-kit.js';
import { makeScene, makeResetStep } from './scene-spec.js';

// A step as DATA, and its motion as an ordered PROGRAM: the field list and what each half means
// are in ../../CLAUDE.md. Every step keeps its `spec`, so a frozen probe can read the intent.

// ---- Flow verbs. The kit binds the category role and its two tinted pulses once. ----
export function makeFlowKinds({ role = '', pulsePod = null, pulsePodDim = null } = {}) {
  const roled = (p) => (p.role === undefined ? { ...p, role } : p);
  return {
    route:   (p = {}) => ({ verb: 'route',   p: roled(p) }),
    segment: (p = {}) => ({ verb: 'segment', p: roled(p) }),
    top:     (p = {}) => ({ verb: 'top',     p: roled(p) }),
    // The pulse carries its own function because the tint is per category and the runner is not.
    pulse:   (p = {}) => ({ verb: 'pulse',   p: { ...p, fn: p.fn || (p.dim ? pulsePodDim : pulsePod) } }),
    fade:    (p = {}) => ({ verb: 'fade',    p }),
    reveal:  (p = {}) => ({ verb: 'reveal',  p }),
    set:     (p = {}) => ({ verb: 'set',     p }),
    light:   (p = {}) => ({ verb: 'light',   p }),
    anim:    (p = {}) => ({ verb: 'anim',    p }),
    run:     (p = {}) => ({ verb: 'run',     p }),
    // The factory is resolved in runFlow, not baked in here as pulse's is: a card that needs other
    // tag timings passes its own `fn`, and every other entry stays free of a function.
    tag:     (p = {}) => ({ verb: 'tag',     p }),
    ripple:  (p = {}) => ({ verb: 'ripple',  p: roled(p) }),
  };
}

// The whole delay vocabulary. `after` covers all 53 chained hops in cluster (arrivalMs + afterHop),
// `at` covers the 47 callbacks fired on an arrival, `plus` covers the one that adds 800 on top.
function arrivalOf(ref, named) {
  if (typeof ref === 'number') return ref;
  if (!named.has(ref)) throw new Error(`flow entry refers to '${ref}', which no earlier entry named`);
  return named.get(ref);
}
function delayOf(p, named) {
  let d;
  if (p.after !== undefined) d = arrivalOf(p.after, named) + BEAT.afterHop;
  else if (p.at !== undefined) d = arrivalOf(p.at, named);
  else d = p.delay || 0;
  return d + (p.plus || 0);
}

// The static half of a step, and the body of an F.set. ONE at() writes three chips, never three:
// each at() is its own animation, so splitting them would change what getAnimations() hands back.
function writeStatics(s, o) {
  if (o.chips) for (const k of Object.keys(o.chips)) setVal(s.refs[k], o.chips[k]);
  if (o.chipsCued) for (const k of Object.keys(o.chipsCued)) setChip(s.refs[k], o.chipsCued[k]);
  if (o.wires) for (const k of Object.keys(o.wires)) setWire(s, k, o.wires[k]);
  if (o.labels) for (const k of Object.keys(o.labels)) setBoxLabel(s.refs[k], o.labels[k]);
  if (o.sublabels) for (const k of Object.keys(o.sublabels)) setBoxSublabel(s.refs[k], o.sublabels[k]);
  if (o.podSublabels) for (const k of Object.keys(o.podSublabels)) setPodSublabel(s.refs[k], o.podSublabels[k]);
  if (o.opacity) for (const k of Object.keys(o.opacity)) { const el = s.refs[k]; if (el) el.style.opacity = String(o.opacity[k]); }
  if (o.lit) light(s, o.lit);
  if (o.chain !== undefined) setChain(s, o.chain);
}

function light(s, keys) {
  if (!keys) return;
  for (const k of keys) { const el = s.refs[k]; if (el) el.classList.add('highlight'); }
}

// A number goes straight to setChainActive. A list or 'all' lights several rows, which the toggle
// form cannot express, and -1 clears, which is what a poster step wants.
function setChain(s, want) {
  const chain = s.refs.chain;
  if (!chain) return;
  if (typeof want === 'number') { setChainActive(chain, want); return; }
  const rows = chain.querySelectorAll('.scheme-chip');
  const on = want === 'all' ? null : new Set(want);
  rows.forEach((row, i) => row.classList.toggle('highlight', on === null || on.has(i)));
}

// at() with the timer on a chosen element rather than on the svg, and the same delay <= 0
// short-circuit, so a zero-delay write stays a plain call and registers nothing.
function atOn(el, ctx, delay, fn) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { fn(); return; }
  const a = el.animate([], { duration: 1, delay });
  a.onfinish = fn;
  ctx.register(a);
}

function runFlow(s, ctx, flow, bind) {
  const named = new Map();
  for (const e of flow) {
    const p = e.p;
    const delay = delayOf(p, named);
    let arrival = delay;
    switch (e.verb) {
      case 'route': {
        const pkt = routePacket(s, ctx, p.points, {
          delay, dur: p.dur, role: p.role, easing: p.easing,
          offsets: p.offsets, fadeIn: p.fadeIn, fadeOut: p.fadeOut,
        });
        if (pkt) arrival = pkt.arrivalMs;
        break;
      }
      case 'segment': {
        const pkt = segmentPacket(s, ctx, { from: p.from, to: p.to, delay, dur: p.dur, role: p.role, fadeMs: p.fadeMs });
        if (pkt) arrival = pkt.arrivalMs;
        break;
      }
      case 'top': {
        const pkt = topPacket(s, ctx, { from: p.from, to: p.to, y: p.y, delay, dur: p.dur, role: p.role });
        if (pkt) arrival = pkt.arrivalMs;
        break;
      }
      case 'pulse': {
        const fn = p.fn || (p.dim ? bind.pulsePodDim : bind.pulsePod);
        if (fn) fn(s.refs[p.pod], ctx, delay, { persist: p.persist, from: p.from, peak: p.peak, dur: p.dur });
        break;
      }
      case 'fade': {
        const el = s.refs[p.target];
        if (el) {
          const a = el.animate(
            [{ opacity: p.from === undefined ? 1 : p.from }, { opacity: p.to }],
            { duration: p.dur, delay, fill: p.fill === undefined ? 'both' : p.fill, easing: p.easing === undefined ? 'ease-in' : p.easing },
          );
          // S-18: the block dies in this step and drops its highlight when the fade ends. The
          // handler is what a frozen probe cannot see, so `unlight` is also the declaration of it.
          if (p.unlight) a.onfinish = () => unlight(s, p.unlight);
          ctx.register(a);
          arrival = delay + (p.dur || 0);
        }
        break;
      }
      case 'reveal': {
        revealAt(s.refs[p.target], ctx, delay, p.from === undefined ? 0 : p.from);
        arrival = delay + REVEAL_MS;
        break;
      }
      case 'set':
        // `on` picks which element carries the empty 1ms timer. at() hangs it on the svg; three
        // cards hang it on the block the write is ABOUT, and the timer's target is observable.
        if (p.on) atOn(s.refs[p.on], ctx, delay, () => writeStatics(s, p));
        else at(s, ctx, delay, () => writeStatics(s, p));
        break;
      case 'light':
        for (const k of p.targets || []) lightBoxAt(s.refs[k], ctx, delay);
        break;
      case 'anim': {
        const el = s.refs[p.target];
        if (el) {
          ctx.register(el.animate(p.keyframes, { ...p.options, delay }));
          arrival = delay + ((p.options && p.options.duration) || 0);
        }
        break;
      }
      case 'run':
        at(s, ctx, delay, () => p.fn(s, ctx));
        break;
      // What a receiving BOX gets instead of a pulse, since only Pods pulse (NET.S-01). Its own
      // entry because three of the four sites carry another animation after it, and order is observable.
      case 'ripple':
        arrivalRipple(s.refs.packetLayer, ctx, p.point, delay, p.role);
        break;
      // A tag RIDES a packet, so it is its own entry standing where the hand-written call stood,
      // right after that packet. It lands nothing, so `arrival` stays `delay` and nothing chains off it.
      case 'tag': {
        const fn = p.fn || bind.ridingLabel;
        if (fn) fn(s, ctx, p.text, p.points, { delay, dur: p.dur, easing: p.easing, emerge: p.emerge, dy: p.dy, dx: p.dx });
        break;
      }
      default:
        throw new Error(`flow entry of unknown verb: ${e.verb}`);
    }
    // A receiver lights when the thing addressed to it LANDS, so the cue hangs off the arrival the
    // entry just computed. Emitted after the packet, which is the order every card writes by hand.
    if (e.verb !== 'light' && p.lights) for (const k of p.lights) lightBoxAt(s.refs[k], ctx, arrival);
    if (p.name) named.set(p.name, arrival);
  }
}

function unlight(s, keys) {
  for (const k of keys) { const el = s.refs[k]; if (el) el.classList.remove('highlight'); }
}

// The reduced guard, DERIVED from every `lights` list. What it cannot derive is a highlight shown
// INSTEAD of a pulse, since no lightBoxAt names it: that is `reducedLit`, two steps in cluster.
export function flowLights(flow) {
  const out = [];
  for (const e of flow || []) {
    const keys = e.verb === 'light' ? (e.p.targets || []) : (e.p.lights || []);
    for (const k of keys) if (!out.includes(k)) out.push(k);
  }
  return out;
}

// ---- The generated enter(): static state on BOTH paths, the card escape, then the split. ----
export function makeSteps(STEPS_SPEC, { resetStep, bind = {} } = {}) {
  return STEPS_SPEC.map((spec) => {
    const step = { id: spec.id, duration: spec.duration };
    if (spec.narration !== undefined) step.narration = spec.narration;
    step.enter = function enter(s, ctx) {
      resetStep(s);
      writeStatics(s, spec);
      if (spec.enter) spec.enter(s, ctx);
      if (ctx.reduced) {
        light(s, flowLights(spec.flow));
        light(s, spec.reducedLit);
        return;
      }
      if (spec.rewind) writeStatics(s, spec.rewind);
      if (spec.flow) runFlow(s, ctx, spec.flow, bind);
      if (spec.motion) spec.motion(s, ctx);
    };
    step.spec = spec;
    return step;
  });
}

// One call per card, in place of a Scene class, a resetStep, a STEPS array and a makeInit. It
// returns one `init` and nothing else, so the module surface S-02 pins is unchanged.
export function defineCardWith(bind = {}) {
  return function defineCard(SCENE, STEPS_SPEC, opts = {}) {
    const Scene = makeScene(SCENE);
    const STEPS = makeSteps(STEPS_SPEC, { resetStep: makeResetStep(SCENE), bind });
    return makeInit(Scene, STEPS, opts);
  };
}
