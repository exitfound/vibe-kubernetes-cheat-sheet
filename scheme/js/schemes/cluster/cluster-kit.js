// The card-facing API: a name is here because a card imports it. What only lib/ calls (the
// builders scene-spec.js and step-spec.js run) stays in lib/ and is not re-exported.
export {
  setVal, setBoxLabel, routeDur, packetArrival,
  // flashChips is the one name here no card imports: it is the only sanctioned block flash and
  // S-25 keeps it on the surface, so it stayed when the other unimported re-exports went.
  flashChips, makeRidingLabel, relationPath, laneOf, REVEAL_MS,
  setPodSublabel, FADE, BEAT, OPACITY,
} from '../../lib/scheme-kit.js';

// The derived half of a card header, as formulas (lib/layout.js). A SECOND source, so these six
// are own to the kit rather than part of the shared scheme-kit list, and S-21 stays one line.
export { laneY, ladder, strip, spread, midX, shade } from '../../lib/layout.js';
import { makeTintedPulses, makeRidingLabel } from '../../lib/scheme-kit.js';
import { makePartKinds, POD_VIOLET } from '../../lib/scene-spec.js';
import { makeFlowKinds, defineCardWith } from '../../lib/step-spec.js';
export { POD_VIOLET };
// Per-category wrapper over scheme-kit for the Cluster cards. The cluster-specific pieces are the
// violet pod tint and its two pulse wrappers; everything else is re-exported unchanged.

// Cluster pods are recoloured violet (#c0b0ff), so the pulse
// stroke tint matches them rather than the workloads blue in scheme-kit.
export const CLUSTER_TINT = Object.freeze({ base: 'rgb(192, 176, 255)', bright: 'rgb(224, 214, 255)' });

export const { pulsePod, pulsePodDim } = makeTintedPulses(CLUSTER_TINT);

// The Cluster grammar: a grammar is named after the category that owns it, so CLU lives here alone.
// Every number was the MODE of the category when the grammar was frozen, and the count beside each
// is what takes it from here TODAY, which is the reading that can be re-measured: TOP_Y on 18 cards,
// CHIP_H on 17, BOX_W on 14, LANE_DY on 12, NODE on 11. POD_H 106 resolves on 12 cards, the two
// beyond NODE being cascading-deletion and object-create-path, which write the literal because they
// share one grid with each other rather than with this family (CLU.L-01).
export const CLU = Object.freeze({
  M: 60, L: 60, R: 1140, CX: 600, W: 1080,
  TOP_Y: 40, BOX_H: 80, TOP_BOTTOM: 120, BOX_W: 232, SPINE_X: 600,
  COL_L: Object.freeze({ x: 60, w: 480 }), COL_R: Object.freeze({ x: 660, w: 480 }),
  ROW_H: 32, ROW_GAP: 10, CHIP_H: 34, LANE_DY: 12,
  NODE: Object.freeze({ H: 152, POD_DY: 34, POD_H: 106 }),
});

// Which column holds what, per L-08a: pick the first of A / B / C that fits against THAT card's
// measured panel bottom. C has no free column, so its chips are a bottom strip two or three across.
export const LAYOUT = Object.freeze({
  A: Object.freeze({ ladder: CLU.COL_L, chips: CLU.COL_R }),
  B: Object.freeze({ chips: CLU.COL_L, ladder: CLU.COL_R }),
  C: Object.freeze({ ladder: CLU.COL_R, strip: Object.freeze({ two: 532, three: 350.7 }) }),
});

// The default tag that rides a ball (M-30). A card needing other timings makes its own with
// makeRidingLabel and hands it to F.tag as `fn`.
const ridingLabel = makeRidingLabel({ role: 'cluster' });

// One binding for the whole category: role, Pod role, Pod tint and the two tinted pulses. A cluster
// card cannot pick up the workloads palette by default because no path from here leads to it (S-42).
const BIND = { role: 'cluster', podRole: 'workloads', tint: POD_VIOLET, pulsePod, pulsePodDim, ridingLabel };
export const P = makePartKinds(BIND);
export const F = makeFlowKinds(BIND);
export const defineCard = defineCardWith(BIND);
