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
import { g, rect, text } from './svg.js';
import { packet, animateAlong } from './primitives.js';
import { Timeline } from './timeline.js';

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
      destroy: () => { tl.destroy(); root.replaceChildren(); },
    };
  };
}

// ---- pod pulse (unified, element-based) ----
// podEl is the wrapper group; the function queries the shell rect / box rect inside it.
// Single-pod cards pass s.refs.podGroup; multi-pod cards pass s.refs.pod1 etc.
export function pulsePod(podEl, ctx, delay = 0, { persist = false } = {}) {
  if (!podEl) return;
  const podShellRect     = podEl.querySelector('.scheme-pod-rect');
  const containerBoxRect = podEl.querySelector('.scheme-box-rect');
  const targets = [podShellRect, containerBoxRect].filter(Boolean);
  const PULSE = 900, RAMP = PULSE / 2;
  for (const el of targets) {
    el.style.transition = 'none';
    const up = el.animate([
      { stroke: TINT_BASE,   strokeOpacity: 0.65, strokeWidth: 1.2 },
      { stroke: TINT_BRIGHT, strokeOpacity: 1,    strokeWidth: 2.4 },
    ], { duration: RAMP, delay, fill: 'forwards', easing: 'ease-in-out' });
    ctx.register(up);
    if (persist) {
      up.onfinish = () => { el.style.stroke = TINT_BRIGHT; el.style.strokeOpacity = '1'; el.style.strokeWidth = '2.4'; };
    } else {
      ctx.register(el.animate([
        { stroke: TINT_BRIGHT, strokeOpacity: 1,    strokeWidth: 2.4 },
        { stroke: TINT_BASE,   strokeOpacity: 0.65, strokeWidth: 1.2 },
      ], { duration: RAMP, delay: delay + RAMP, fill: 'forwards', easing: 'ease-in-out' }));
    }
  }
  const BRIGHTNESS_FRAMES = [
    { filter: 'brightness(1)' }, { filter: 'brightness(1.4)' }, { filter: 'brightness(1)' },
  ];
  const podShell     = podEl.querySelector('.scheme-pod');
  const containerBox = podEl.querySelector('.scheme-box');
  if (podShell)     ctx.register(podShell.animate(BRIGHTNESS_FRAMES, { duration: PULSE, delay, fill: 'forwards', easing: 'ease-in-out' }));
  if (containerBox) ctx.register(containerBox.animate(BRIGHTNESS_FRAMES, { duration: PULSE, delay, fill: 'forwards', easing: 'ease-in-out' }));
}
export function clearPodHighlight(podEl) {
  if (!podEl) return;
  const targets = [
    podEl.querySelector('.scheme-pod-rect'),
    podEl.querySelector('.scheme-box-rect'),
  ].filter(Boolean);
  for (const el of targets) {
    el.style.stroke = ''; el.style.strokeOpacity = ''; el.style.strokeWidth = ''; el.style.transition = '';
  }
}

// Light a Node-internal box and pulse it exactly when a packet arrives (init-containers).
// The class toggle rides a registered no-op animation so a step change cancels it.
export function pulseBoxOnArrival(boxEl, ctx, delay) {
  if (!boxEl) return;
  const trigger = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  ctx.register(trigger);
  trigger.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(boxEl.animate(
    [{ filter: 'brightness(1)' }, { filter: 'brightness(1.55)' }, { filter: 'brightness(1)' }],
    { duration: 600, delay, easing: 'ease-out' }
  ));
}

// ---- packet travel: one core + thin route wrappers ----
// easing 'ease-in-out' => animateAlong (even-by-distance). easing 'linear' => explicit
// keyframes; offsets null => even-by-distance, else use the provided offset array.
export function packetAlong(packetLayer, ctx, points, {
  delay = 0, dur = 1100, cat = 'control', easing = 'ease-in-out',
  offsets = null, fadeIn = true, fadeOut = true,
} = {}) {
  const p = packet({ x: points[0][0], y: points[0][1], cat });
  if (fadeIn) p.style.opacity = '0';
  packetLayer.appendChild(p);
  if (fadeIn) {
    const fadeInDelay = Math.max(0, delay - 200);
    ctx.register(p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: fadeInDelay, fill: 'forwards', easing: 'ease-out' }));
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
    ctx.register(p.animate(frames, { duration: dur, delay, fill: 'forwards', easing: 'linear' }));
  } else {
    ctx.register(animateAlong(p, points, { duration: dur, delay }));
  }
  if (fadeOut) {
    ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: delay + dur, fill: 'forwards', easing: 'ease-in' }));
  }
  return p;
}
// Canonical left-margin connector, top->node (animateAlong).
export function connectorPacket(s, ctx, { delay = 0, dur = 1100 } = {}) {
  return packetAlong(s.refs.packetLayer, ctx, LAYOUT.CONNECTOR_DOWN, { delay, dur });
}
// Directional connector (linear); pass offsets:[0,0.15,0.85,1] for the probes-style fixed offsets.
export function connectorPacketDir(s, ctx, dir, { delay = 0, dur = 1100, offsets = null } = {}) {
  const pts = dir === 'up' ? LAYOUT.CONNECTOR_UP : LAYOUT.CONNECTOR_DOWN;
  return packetAlong(s.refs.packetLayer, ctx, pts, { delay, dur, easing: 'linear', offsets });
}
// Short packet on a top arrow (animateAlong). fadeIn only when delayed (matches the cards).
export function topPacket(s, ctx, { from = 540, to = 580, y = 65, delay = 0, dur = 700 } = {}) {
  return packetAlong(s.refs.packetLayer, ctx, [[from, y], [to, y]], { delay, dur, fadeIn: delay > 0 });
}
// Two-point linear packet between arbitrary [x,y] endpoints (hooks-style), always fades in.
export function arrowPacket(s, ctx, { from, to, delay = 0, dur = 500, easing = 'linear' } = {}) {
  return packetAlong(s.refs.packetLayer, ctx, [from, to], { delay, dur, easing });
}
// Toggle which connector copy (down/up) is visible to match the packet direction.
export function setConnectorDir(s, dir) {
  s.refs.connectorDown.style.opacity = dir === 'up' ? '0' : '1';
  s.refs.connectorUp.style.opacity   = dir === 'up' ? '1' : '0';
}
