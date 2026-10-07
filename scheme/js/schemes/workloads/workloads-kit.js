// The Workloads card-facing API: a name is here because a card imports it.
// What only lib/ calls stays in lib/ and is not re-exported.
export {
  setVal, setBoxLabel, setPodSublabel, routeDur, packetArrival,
  // No card imports flashChips, S-25 keeps the one sanctioned block flash on the surface.
  flashChips, makeRidingLabel, relationPath, laneOf, REVEAL_MS, FADE, BEAT, OPACITY,
} from '../../lib/scheme-kit.js';

// The layout formulas, a second source kept out of the scheme-kit list so S-21 stays one line.
export { LANE_DY, laneY, ladder, strip, spread, midX, shade } from '../../lib/layout.js';
import { GRID, LAYOUT } from '../../lib/layout.js';
import { makeTintedPulses, makeRidingLabel } from '../../lib/scheme-kit.js';
import { makePartKinds, POD_VIOLET } from '../../lib/scene-spec.js';
import { makeFlowKinds, defineCardWith } from '../../lib/step-spec.js';
export { POD_VIOLET };

// The shared X grid. Y values stay per card.
export const WL = GRID;
export { LAYOUT };

// Only the peak is named: the pulse ramps from and back to whatever the rect shows.
export const WORKLOADS_TINT = Object.freeze({ bright: 'rgb(142, 198, 247)' });

export const { pulsePod, pulsePodDim } = makeTintedPulses(WORKLOADS_TINT);

// The default riding tag (M-30, M-30a). Other timings: makeRidingLabel, passed to the tag as `fn`.
const ridingLabel = makeRidingLabel({ role: 'workloads' });

// Workloads Pods are already the category blue, so tint stays null.
const BIND = { role: 'workloads', podRole: 'workloads', tint: null, pulsePod, pulsePodDim, ridingLabel };
export const P = makePartKinds(BIND);
export const F = makeFlowKinds(BIND);
export const defineCard = defineCardWith(BIND);
