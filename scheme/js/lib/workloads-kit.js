export {
  valChip, setVal, setBoxLabel, setBoxSublabel, setPodSublabel, makeInit, packetAlong,
  routePacket, segmentPacket, routeDur, routeLength, packetArrival,
  connectorPacket, connectorPacketDir, topPacket, setConnectorDir, clearPodHighlight,
  arrivalRipple, clearHighlights, clearWires, setWire, flashChips, lightBoxAt,
  makeRidingLabel, FADE, BEAT,
} from './scheme-kit.js';
import { pulsePodWithTint, pulsePodDimWithTint } from './scheme-kit.js';
// Design notes: scheme/docs/INTERNALS.md#schemejslibworkloads-kitjs

export const WORKLOADS_TINT = Object.freeze({ base: 'rgb(91, 184, 255)', bright: 'rgb(142, 198, 247)' });

// Workloads pods pulse with the blue tint. The body is shared with scheme-kit
// (pulsePodWithTint), so the four families differ only in colour.
export function pulsePod(podEl, ctx, delay = 0, opts = {}) {
  return pulsePodWithTint(podEl, ctx, delay, opts, WORKLOADS_TINT);
}
export function pulsePodDim(podEl, ctx, delay = 0, opts = {}) {
  return pulsePodDimWithTint(podEl, ctx, delay, opts, WORKLOADS_TINT);
}
