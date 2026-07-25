export {
  valChip, setVal, setBoxLabel, setBoxSublabel, makeInit, packetAlong,
  routePacket, segmentPacket, routeDur, routeLength, packetArrival,
  connectorPacket, connectorPacketDir, topPacket, setConnectorDir, clearPodHighlight,
  arrivalRipple, clearHighlights, clearWires, setWire, flashChips, lightBoxAt, makeRidingLabel,
  setPodSublabel, FADE, BEAT,
} from './scheme-kit.js';
import { pulsePodWithTint, pulsePodDimWithTint } from './scheme-kit.js';
// Design notes: scheme/docs/INTERNALS.md#schemejslibstorage-kitjs

export const STORAGE_TINT = Object.freeze({ base: 'rgb(94, 202, 148)', bright: 'rgb(174, 224, 199)' });


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
