export {
  valChip, setVal, setChip, setBoxLabel, setBoxSublabel, makeInit, packetAlong,
  routePacket, segmentPacket, routeDur, routeLength, packetArrival,
  topPacket, setConnectorDir, clearPodHighlight,
  arrivalRipple, clearHighlights, clearWires, setWire, flashChips, lightBoxAt, at, makeRidingLabel,
  relationPath, revealAt, laneOf, REVEAL_MS,
  setPodSublabel, FADE, BEAT, OPACITY,
} from '../../lib/scheme-kit.js';
import { pulsePodWithTint, pulsePodDimWithTint } from '../../lib/scheme-kit.js';
// Design notes: scheme/INTERNALS.md#schemejsschemesclustercluster-kitjs

// Cluster pods are recoloured violet (#c0b0ff), so the pulse
// stroke tint matches them rather than the workloads blue in scheme-kit.
export const CLUSTER_TINT = Object.freeze({ base: 'rgb(192, 176, 255)', bright: 'rgb(224, 214, 255)' });


// Cluster pods pulse with the violet tint. The body is shared with scheme-kit
// (pulsePodWithTint), so the two families differ only in colour.
export function pulsePod(podEl, ctx, delay = 0, opts = {}) {
  return pulsePodWithTint(podEl, ctx, delay, opts, CLUSTER_TINT);
}
export function pulsePodDim(podEl, ctx, delay = 0, opts = {}) {
  return pulsePodDimWithTint(podEl, ctx, delay, opts, CLUSTER_TINT);
}
