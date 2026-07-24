// scaling-kit.js — shared helpers for the scaling scheme cards.
//
// Generic chip/label/init/packet helpers are re-exported from scheme-kit.js so
// every card family shares one source of truth. The scaling-specific pieces
// (orange pod tint, pulsePod, pulsePodDim, setPodSublabel) live here; hops use
// the shared topPacket (top row, eased) and segmentPacket (in-diagram, linear).
export {
  valChip, setVal, setBoxLabel, setBoxSublabel, makeInit, packetAlong,
  routePacket, segmentPacket, routeDur, routeLength, packetArrival,
  connectorPacket, connectorPacketDir, topPacket, setConnectorDir, clearPodHighlight,
  arrivalRipple, clearHighlights, clearWires, setWire, flashChips, FADE, BEAT,
} from './scheme-kit.js';
import { pulsePodWithTint, pulsePodDimWithTint } from './scheme-kit.js';

// Scaling pods carry --scaling-color (#ffa04d = rgb(255,160,77)), so the pulse must
// REST on that exact stroke and flash up to the brighter --tint-bright stop
// (#f5c694 = rgb(245,198,148)). base == the natural stroke is what makes the pulse
// return to the original colour instead of settling on a paler/warmer tone (the
// non-persist pulse fills forwards to `base`). Mirrors the networking / storage tint.
export const SCALING_TINT = Object.freeze({ base: 'rgb(255, 160, 77)', bright: 'rgb(245, 198, 148)' });

export function setPodSublabel(podEl, txt) {
  const sub = podEl && podEl.querySelector('.scheme-pod-sublabel');
  if (sub) sub.textContent = txt;
}

// Scaling pods pulse with the orange tint. The body is shared with scheme-kit
// (pulsePodWithTint), so the families differ only in colour.
export function pulsePod(podEl, ctx, delay = 0, opts = {}) {
  return pulsePodWithTint(podEl, ctx, delay, opts, SCALING_TINT);
}
export function pulsePodDim(podEl, ctx, delay = 0, opts = {}) {
  return pulsePodDimWithTint(podEl, ctx, delay, opts, SCALING_TINT);
}
