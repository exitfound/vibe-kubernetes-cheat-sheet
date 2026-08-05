export {
  valChip, setVal, setBoxLabel, setBoxSublabel, makeInit, packetAlong,
  routePacket, segmentPacket, routeDur, routeLength, packetArrival,
  topPacket, setConnectorDir, clearPodHighlight,
  arrivalRipple, clearHighlights, clearWires, setWire, flashChips, lightBoxAt, at, makeRidingLabel,
  relationPath, revealAt, laneOf, REVEAL_MS,
  setPodSublabel, FADE, BEAT, OPACITY,
} from './scheme-kit.js';
import { pulsePodWithTint, pulsePodDimWithTint } from './scheme-kit.js';
// Design notes: scheme/docs/INTERNALS.md#schemejslibnetwork-kitjs

export const NETWORK_TINT = Object.freeze({ base: 'rgb(79, 229, 255)', bright: 'rgb(158, 234, 247)' });


// Networking pods pulse with the cyan tint. The body is shared with scheme-kit
// (pulsePodWithTint), so the families differ only in colour.
export function pulsePod(podEl, ctx, delay = 0, opts = {}) {
  return pulsePodWithTint(podEl, ctx, delay, opts, NETWORK_TINT);
}
export function pulsePodDim(podEl, ctx, delay = 0, opts = {}) {
  return pulsePodDimWithTint(podEl, ctx, delay, opts, NETWORK_TINT);
}
