export {
  valChip, setVal, setBoxLabel, setBoxSublabel, setPodSublabel, makeInit, packetAlong,
  routePacket, segmentPacket, routeDur, routeLength, packetArrival,
  topPacket, setConnectorDir, clearPodHighlight,
  arrivalRipple, clearHighlights, clearWires, setWire, flashChips, lightBoxAt,
  makeRidingLabel, relationPath, revealAt, laneOf, REVEAL_MS, FADE, BEAT, OPACITY,
} from './scheme-kit.js';
import { pulsePodWithTint, pulsePodDimWithTint } from './scheme-kit.js';
// Design notes: scheme/docs/INTERNALS.md#schemejslibworkloads-kitjs

// The Workloads layout canon: the X grammar every card in the category shares. It replaced the
// 320 gutter, which was the same number hardcoded in all 20 cards AND in the kit's connector, and
// which reserved the whole left edge for a narration panel that only owns the top-left corner.
// Y values stay per card, because each card's panel bottom is its own measurement.
//   PANEL_R  the panel reaches x<=397 at the narrowest viewport, so nothing starts left of 420
//            unless it also sits below that card's panel bottom.
//   the ladder and the chip column flank a central spine, and the Node frame spans L..R so the
//   content bbox centres on CX by construction.
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
