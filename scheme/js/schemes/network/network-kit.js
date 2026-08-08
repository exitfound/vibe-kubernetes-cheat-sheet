export {
  valChip, setVal, setChip, setBoxLabel, setBoxSublabel, makeInit, packetAlong,
  routePacket, segmentPacket, routeDur, routeLength, packetArrival,
  topPacket, setConnectorDir, clearPodHighlight,
  diagramRoot, wrapPod, arrivalRipple, clearHighlights, clearWires, setWire, flashChips, lightBoxAt, at, makeRidingLabel,
  relationPath, revealAt, laneOf, REVEAL_MS,
  setPodSublabel, FADE, BEAT, OPACITY,
} from '../../lib/scheme-kit.js';

// The derived half of a card header, as formulas (lib/layout.js). A SECOND source, so these six
// are own to the kit rather than part of the shared scheme-kit list, and S-21 stays one line.
export { laneY, ladder, strip, spread, midX, shade } from '../../lib/layout.js';
import { makeTintedPulses } from '../../lib/scheme-kit.js';
import { makePartKinds, POD_VIOLET } from '../../lib/scene-spec.js';
import { makeFlowKinds, defineCardWith } from '../../lib/step-spec.js';
export { POD_VIOLET };
// Per-category wrapper over scheme-kit for the Networking cards. The networking-specific pieces
// are the cyan pod tint and its two pulse wrappers.

// `base` must be the exact resting stroke and `bright` the tint-bright stop, for the reason under
// WORKLOADS_TINT: the non-persist pulse fills forwards to `base`.
export const NETWORK_TINT = Object.freeze({ base: 'rgb(79, 229, 255)', bright: 'rgb(158, 234, 247)' });

export const { pulsePod, pulsePodDim } = makeTintedPulses(NETWORK_TINT);

// No geometry grammar yet, and no empty placeholder for one: a grammar is named after the category
// that owns it. Four bands are in use here (60/1140, 65/1135, 70/1130, 80/1120), so none would fit.

// Networking Pods carry the network role and are not recoloured, so tint stays null.
const BIND = { role: 'network', podRole: 'network', tint: null, pulsePod, pulsePodDim };
export const P = makePartKinds(BIND);
export const F = makeFlowKinds(BIND);
export const defineCard = defineCardWith(BIND);
