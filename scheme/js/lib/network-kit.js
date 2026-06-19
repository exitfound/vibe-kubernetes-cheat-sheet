// network-kit.js — shared helpers for the networking scheme cards.
//
// Generic chip/label/init/packet helpers are re-exported from scheme-kit.js so
// every card family shares one source of truth. The networking-specific pieces
// (cyan pod tint, pulsePod, pulsePodDim) live here; hops use the shared
// topPacket (top row, eased) and segmentPacket (in-diagram, linear).
export {
  valChip, setVal, setBoxLabel, setBoxSublabel, makeInit, packetAlong,
  routePacket, segmentPacket, routeDur, routeLength, packetArrival,
  connectorPacket, connectorPacketDir, topPacket, setConnectorDir, clearPodHighlight,
  arrivalRipple, clearHighlights, clearWires, setWire, flashChips, FADE, BEAT,
} from './scheme-kit.js';
import { pulsePodWithTint, pulsePodDimWithTint } from './scheme-kit.js';

// Networking pods carry --network-color (#4fe5ff = rgb(79,229,255)), so the pulse
// must REST on that exact stroke and flash up to the brighter --tint-bright stop
// (#9eeaf7 = rgb(158,234,247)). base == the natural stroke is what makes the pulse
// return to the original colour instead of settling on a paler/warmer tone (the
// non-persist pulse fills forwards to `base`). Mirrors scheme-kit's workloads tint.
export const NETWORK_TINT = Object.freeze({ base: 'rgb(79, 229, 255)', bright: 'rgb(158, 234, 247)' });

export function setPodSublabel(podEl, txt) {
  const sub = podEl && podEl.querySelector('.scheme-pod-sublabel');
  if (sub) sub.textContent = txt;
}

// Networking pods pulse with the cyan tint. The body is shared with scheme-kit
// (pulsePodWithTint), so the families differ only in colour.
export function pulsePod(podEl, ctx, delay = 0, opts = {}) {
  return pulsePodWithTint(podEl, ctx, delay, opts, NETWORK_TINT);
}
export function pulsePodDim(podEl, ctx, delay = 0, opts = {}) {
  return pulsePodDimWithTint(podEl, ctx, delay, opts, NETWORK_TINT);
}
