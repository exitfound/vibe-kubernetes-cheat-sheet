export {
  valChip, setVal, setChip, setBoxLabel, setBoxSublabel, setPodSublabel, makeInit, packetAlong,
  routePacket, segmentPacket, routeDur, routeLength, packetArrival,
  topPacket, setConnectorDir, clearPodHighlight,
  arrivalRipple, clearHighlights, clearWires, setWire, flashChips, lightBoxAt, at,
  makeRidingLabel, relationPath, revealAt, laneOf, REVEAL_MS, FADE, BEAT, OPACITY,
} from '../../lib/scheme-kit.js';
import { pulsePodWithTint, pulsePodDimWithTint } from '../../lib/scheme-kit.js';
// Design notes: scheme/INTERNALS.md#schemejsschemesworkloadsworkloads-kitjs

// The Workloads layout canon: the X grammar every card in the category shares. Y values stay per
// card, because each card's panel bottom is its own measurement. Full grammar in ./CLAUDE.md.
export const WL = Object.freeze({
  M: 60, L: 60, R: 1140, CX: 600, W: 1080,
  PANEL_R: 400,
  TOP_Y: 40, BOX_H: 80, TOP_BOTTOM: 120,
  SPINE_X: 600,
  LADDER_X: 60, LADDER_W: 480,          // 60..540
  CHIP_X: 660, CHIP_W: 480, CHIP_H: 34, // 660..1140
  ROW_H: 32, ROW_GAP: 10,
  LANE_DY: 12,
});

export const WORKLOADS_TINT = Object.freeze({ base: 'rgb(91, 184, 255)', bright: 'rgb(142, 198, 247)' });

// Workloads pods pulse with the blue tint. The body is shared with scheme-kit
// (pulsePodWithTint), so the four families differ only in colour.
export function pulsePod(podEl, ctx, delay = 0, opts = {}) {
  return pulsePodWithTint(podEl, ctx, delay, opts, WORKLOADS_TINT);
}
export function pulsePodDim(podEl, ctx, delay = 0, opts = {}) {
  return pulsePodDimWithTint(podEl, ctx, delay, opts, WORKLOADS_TINT);
}
