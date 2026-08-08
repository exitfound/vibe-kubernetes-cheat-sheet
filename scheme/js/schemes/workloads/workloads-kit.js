export {
  valChip, setVal, setChip, setBoxLabel, setBoxSublabel, setPodSublabel, makeInit, packetAlong,
  routePacket, segmentPacket, routeDur, routeLength, packetArrival,
  topPacket, setConnectorDir, clearPodHighlight,
  diagramRoot, wrapPod, arrivalRipple, clearHighlights, clearWires, setWire, flashChips, lightBoxAt, at,
  makeRidingLabel, relationPath, revealAt, laneOf, REVEAL_MS, FADE, BEAT, OPACITY,
} from '../../lib/scheme-kit.js';

// The derived half of a card header, as formulas (lib/layout.js). A SECOND source, so these six
// are own to the kit rather than part of the shared scheme-kit list, and S-21 stays one line.
export { laneY, ladder, strip, spread, midX, shade } from '../../lib/layout.js';
import { makeTintedPulses } from '../../lib/scheme-kit.js';
import { makePartKinds, POD_VIOLET } from '../../lib/scene-spec.js';
import { makeFlowKinds, defineCardWith } from '../../lib/step-spec.js';
export { POD_VIOLET };
// Per-category wrapper over scheme-kit for the Workloads cards. All four categories reach the base
// the same way, so the base carries no category of its own and the workloads blue lives here.

// The Workloads layout canon: the X grammar every card in the category shares. Y values stay per
// card, because each card's panel bottom is its own measurement. Full grammar in ./CLAUDE.md.
export const WL = Object.freeze({
  M: 60, L: 60, R: 1140, CX: 600, W: 1080,
  TOP_Y: 40, BOX_H: 80, TOP_BOTTOM: 120,
  SPINE_X: 600,
  LADDER_X: 60, LADDER_W: 480,          // 60..540
  CHIP_X: 660, CHIP_W: 480, CHIP_H: 34, // 660..1140
  ROW_H: 32, ROW_GAP: 10,
  LANE_DY: 12,
});

// `base` MUST equal the natural resting stroke: the non-persist pulse fills FORWARDS to `base`,
// so a mismatch makes every pulse settle on a paler tone instead of returning to the pod colour.
export const WORKLOADS_TINT = Object.freeze({ base: 'rgb(91, 184, 255)', bright: 'rgb(142, 198, 247)' });

export const { pulsePod, pulsePodDim } = makeTintedPulses(WORKLOADS_TINT);

// The A/B/C column choice stays prose (WL.L-03..L-05) until this category is migrated: turning it
// into constants with no card to check them against is how a wrong number ships.

// Workloads Pods are already the category blue, so no Pod recolour: tint stays null.
const BIND = { role: 'workloads', podRole: 'workloads', tint: null, pulsePod, pulsePodDim };
export const P = makePartKinds(BIND);
export const F = makeFlowKinds(BIND);
export const defineCard = defineCardWith(BIND);
