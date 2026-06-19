// control-kit.js — shared helpers for the cluster (control) scheme cards.
//
// Generic chip/label/init/packet helpers are re-exported from scheme-kit.js so
// both card families share one source of truth. The cluster-specific pieces
// (violet pod tint, pulsePod, pulsePodDim) live here; hops use the shared
// topPacket (top row, eased) and segmentPacket (in-diagram, linear).
export {
  valChip, setVal, setBoxLabel, setBoxSublabel, makeInit, packetAlong,
  routePacket, segmentPacket, routeDur, routeLength, packetArrival,
  connectorPacket, connectorPacketDir, topPacket, setConnectorDir, clearPodHighlight,
  arrivalRipple, clearHighlights, clearWires, setWire, flashChips, FADE, BEAT,
} from './scheme-kit.js';
import { pulsePodWithTint, pulsePodDimWithTint } from './scheme-kit.js';

// Cluster pods are recoloured violet (--workloads-color #c0b0ff), so the pulse
// stroke tint matches them rather than the workloads blue in scheme-kit.
export const CONTROL_TINT = Object.freeze({ base: 'rgb(192, 176, 255)', bright: 'rgb(224, 214, 255)' });

export function setPodSublabel(podEl, txt) {
  const sub = podEl && podEl.querySelector('.scheme-pod-sublabel');
  if (sub) sub.textContent = txt;
}

// Cluster pods pulse with the violet tint. The body is shared with scheme-kit
// (pulsePodWithTint), so the two families differ only in colour.
export function pulsePod(podEl, ctx, delay = 0, opts = {}) {
  return pulsePodWithTint(podEl, ctx, delay, opts, CONTROL_TINT);
}
export function pulsePodDim(podEl, ctx, delay = 0, opts = {}) {
  return pulsePodDimWithTint(podEl, ctx, delay, opts, CONTROL_TINT);
}
