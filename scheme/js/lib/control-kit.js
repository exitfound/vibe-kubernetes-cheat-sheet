// control-kit.js — shared helpers for the cluster (control) scheme cards.
//
// Generic chip/label/init/packet helpers are re-exported from scheme-kit.js so
// both card families share one source of truth. The cluster-specific pieces
// (violet pod tint, pulseActiveBlocks, the segment-visible arrowPacket) live
// here. Bodies are transcribed verbatim from the cards, so migration is
// behaviour-preserving.
import { packet } from './primitives.js';
export {
  valChip, setVal, setBoxLabel, setBoxSublabel, makeInit, packetAlong,
} from './scheme-kit.js';
import { packetAlong } from './scheme-kit.js';

// Cluster pods are recoloured violet (--workloads-color #c0b0ff), so the pulse
// stroke tint matches them rather than the workloads blue in scheme-kit.
export const CONTROL_TINT = Object.freeze({ base: 'rgb(192, 176, 255)', bright: 'rgb(224, 214, 255)' });

export function setPodSublabel(podEl, txt) {
  const sub = podEl && podEl.querySelector('.scheme-pod-sublabel');
  if (sub) sub.textContent = txt;
}

// podEl is the pod's wrapper <g> (e.g. s.refs.podB). Element-based like
// scheme-kit's pulsePod, but with the violet cluster tint.
export function pulsePod(podEl, ctx, delay = 0, { persist = false } = {}) {
  if (!podEl) return;
  const targets = [
    podEl.querySelector('.scheme-pod-rect'),
    podEl.querySelector('.scheme-box-rect'),
  ].filter(Boolean);
  const PULSE = 900, RAMP = PULSE / 2;
  for (const el of targets) {
    el.style.transition = 'none';
    const up = el.animate([
      { stroke: CONTROL_TINT.base,   strokeOpacity: 0.65, strokeWidth: 1.2 },
      { stroke: CONTROL_TINT.bright, strokeOpacity: 1,    strokeWidth: 2.4 },
    ], { duration: RAMP, delay, fill: 'forwards', easing: 'ease-in-out' });
    ctx.register(up);
    if (persist) {
      up.onfinish = () => { el.style.stroke = CONTROL_TINT.bright; el.style.strokeOpacity = '1'; el.style.strokeWidth = '2.4'; };
    } else {
      ctx.register(el.animate([
        { stroke: CONTROL_TINT.bright, strokeOpacity: 1,    strokeWidth: 2.4 },
        { stroke: CONTROL_TINT.base,   strokeOpacity: 0.65, strokeWidth: 1.2 },
      ], { duration: RAMP, delay: delay + RAMP, fill: 'forwards', easing: 'ease-in-out' }));
    }
  }
  const BRIGHTNESS_FRAMES = [
    { filter: 'brightness(1)' }, { filter: 'brightness(1.4)' }, { filter: 'brightness(1)' },
  ];
  for (const el of podEl.querySelectorAll('.scheme-pod, .scheme-box')) {
    ctx.register(el.animate(BRIGHTNESS_FRAMES, { duration: PULSE, delay, fill: 'forwards', easing: 'ease-in-out' }));
  }
}

export function clearPodHighlight(podEl) {
  if (!podEl) return;
  for (const el of podEl.querySelectorAll('.scheme-pod-rect, .scheme-box-rect')) {
    el.style.stroke = ''; el.style.strokeOpacity = ''; el.style.strokeWidth = ''; el.style.transition = '';
  }
}

// Pulse the highlighted top blocks/chips named in `keys`. Timeline auto-pulses
// only blocks highlighted for the first time, so blocks that stay highlighted
// across consecutive steps would otherwise sit still. Pods use pulsePod instead.
export function pulseActiveBlocks(s, ctx, keys) {
  const FRAMES = [
    { filter: 'brightness(1)' }, { filter: 'brightness(1.55)' }, { filter: 'brightness(1)' },
  ];
  keys.forEach(k => {
    const el = s.refs[k];
    if (el && el.classList.contains('highlight')) {
      ctx.register(el.animate(FRAMES, { duration: 600, iterations: 1, easing: 'ease-out' }));
    }
  });
}

// A packet visible only while travelling along a single arrow segment
// (linear throughout, short fades). Distinct from scheme-kit's arrowPacket.
export function arrowPacket(s, ctx, { from, to, delay = 0, dur = 500, fadeIn = 80, fadeOut = 120 }) {
  const p = packet({ x: from[0], y: from[1], cat: 'control' });
  p.style.opacity = '0';
  s.refs.packetLayer.appendChild(p);
  ctx.register(p.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: fadeIn, delay, fill: 'forwards', easing: 'linear' }
  ));
  ctx.register(p.animate(
    [
      { transform: `translate(${from[0]}px, ${from[1]}px)` },
      { transform: `translate(${to[0]}px, ${to[1]}px)` },
    ],
    { duration: dur, delay, fill: 'forwards', easing: 'linear' }
  ));
  ctx.register(p.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: fadeOut, delay: delay + dur, fill: 'forwards', easing: 'linear' }
  ));
  return p;
}

// Short hop along a wire: starts visible (no fade-in), eased travel, fades out.
export function wirePacket(s, ctx, from, to, { delay = 0, dur = 700 } = {}) {
  return packetAlong(s.refs.packetLayer, ctx, [from, to], { delay, dur, fadeIn: false });
}
