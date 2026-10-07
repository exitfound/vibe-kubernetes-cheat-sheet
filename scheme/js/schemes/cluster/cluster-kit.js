// Per-category wrapper over scheme-kit for the Cluster cards: the violet Pod tint and its pulses.
// A name is re-exported here only because a card imports it.
export {
  setVal, setBoxLabel, routeDur, packetArrival,
  // flashChips: imported by no card, kept on the surface by S-25.
  flashChips, makeRidingLabel, relationPath, laneOf, REVEAL_MS,
  setPodSublabel, FADE, BEAT, OPACITY,
} from '../../lib/scheme-kit.js';

// A second source, kept apart from the scheme-kit list so S-21 stays one line.
export { LANE_DY, laneY, ladder, strip, spread, midX, shade } from '../../lib/layout.js';
import { GRID, LAYOUT } from '../../lib/layout.js';
import { makeTintedPulses, makeRidingLabel } from '../../lib/scheme-kit.js';
import { makePartKinds, POD_VIOLET } from '../../lib/scene-spec.js';
import { makeFlowKinds, defineCardWith } from '../../lib/step-spec.js';
export { POD_VIOLET };

// Pulse stroke tint matching the violet cluster Pods, not the workloads blue.
export const CLUSTER_TINT = Object.freeze({ bright: 'rgb(224, 214, 255)' });

export const { pulsePod, pulsePodDim } = makeTintedPulses(CLUSTER_TINT);

// The Cluster grammar: the shared grid plus the actor width and the Node frame (CLU.L-01).
export const CLU = Object.freeze({ ...GRID, BOX_W: 232, NODE: Object.freeze({ H: 152, POD_DY: 34, POD_H: 106 }) });
export { LAYOUT };

// Default riding tag (M-30, M-30a). Other timings: makeRidingLabel, handed to F.tag as `fn`.
const ridingLabel = makeRidingLabel({ role: 'cluster' });

// No path from here leads to the workloads palette (S-42).
const BIND = { role: 'cluster', podRole: 'workloads', tint: POD_VIOLET, pulsePod, pulsePodDim, ridingLabel };
export const P = makePartKinds(BIND);
export const F = makeFlowKinds(BIND);
export const defineCard = defineCardWith(BIND);
