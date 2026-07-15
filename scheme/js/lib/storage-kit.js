// storage-kit.js — shared helpers for the storage scheme cards.
//
// Generic chip/label/init/packet helpers are re-exported from scheme-kit.js so
// every card family shares one source of truth. The storage-specific pieces
// (teal pod tint, pulsePod, pulsePodDim, setCylinderLabel) live here; hops use
// the shared topPacket (top row, eased) and segmentPacket (in-diagram, linear).
export {
  valChip, setVal, setBoxLabel, setBoxSublabel, makeInit, packetAlong,
  routePacket, segmentPacket, routeDur, routeLength, packetArrival,
  connectorPacket, connectorPacketDir, topPacket, setConnectorDir, clearPodHighlight,
  arrivalRipple, clearHighlights, clearWires, setWire, flashChips, FADE, BEAT,
} from './scheme-kit.js';
import { pulsePodWithTint, pulsePodDimWithTint } from './scheme-kit.js';

// Storage pods carry --storage-color (#5eca94 = rgb(94,202,148)), so the pulse must
// REST on that exact stroke and flash up to the brighter --tint-bright stop
// (#aee0c7 = rgb(174,224,199)). base == the natural stroke is what makes the pulse
// return to the original colour instead of settling on a paler/warmer tone (the
// non-persist pulse fills forwards to `base`). Mirrors the networking tint.
export const STORAGE_TINT = Object.freeze({ base: 'rgb(94, 202, 148)', bright: 'rgb(174, 224, 199)' });

export function setPodSublabel(podEl, txt) {
  const sub = podEl && podEl.querySelector('.scheme-pod-sublabel');
  if (sub) sub.textContent = txt;
}

// The cylinder is the storage family's own block (the backing disk / PV). No other
// kit touches it, so its label setter lives here rather than in scheme-kit.
export function setCylinderLabel(cylEl, txt) {
  const l = cylEl && cylEl.querySelector('.scheme-cylinder-label');
  if (l) l.textContent = txt;
}

// Storage pods pulse with the teal tint. The body is shared with scheme-kit
// (pulsePodWithTint), so the families differ only in colour.
export function pulsePod(podEl, ctx, delay = 0, opts = {}) {
  return pulsePodWithTint(podEl, ctx, delay, opts, STORAGE_TINT);
}
export function pulsePodDim(podEl, ctx, delay = 0, opts = {}) {
  return pulsePodDimWithTint(podEl, ctx, delay, opts, STORAGE_TINT);
}
