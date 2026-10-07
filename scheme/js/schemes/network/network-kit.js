// Per-category wrapper over scheme-kit for the Networking cards: the card-facing API (a name is
// here because a card imports it), the cyan pod tint and its two pulse wrappers.
export {
  setVal, setBoxLabel, routeDur, packetArrival,
  // No card imports flashChips, but S-25 keeps the one sanctioned block flash on the surface.
  flashChips, makeRidingLabel, relationPath, laneOf, REVEAL_MS,
  setPodSublabel, FADE, BEAT, OPACITY,
} from '../../lib/scheme-kit.js';

// A second source, kept off the shared scheme-kit list so S-21 stays one line.
export { LANE_DY, laneY, ladder, strip, spread, midX, shade } from '../../lib/layout.js';
import { makeTintedPulses, makeRidingLabel, HOP_MS } from '../../lib/scheme-kit.js';
import { makePartKinds, POD_VIOLET } from '../../lib/scene-spec.js';
import { makeFlowKinds, defineCardWith } from '../../lib/step-spec.js';
export { POD_VIOLET };

// `bright` is the tint-bright stop the pulse peaks on, for the reason under WORKLOADS_TINT.
export const NETWORK_TINT = Object.freeze({ bright: 'rgb(158, 234, 247)' });

export const { pulsePod, pulsePodDim } = makeTintedPulses(NETWORK_TINT);

// The shared pace for a short untagged hop the 700ms floor would make crawl. Cards using it
// register their balls in `PACING`, `render/motion.test.mjs` (M-12).
export const BRISK_HOP_MS = Math.round(HOP_MS * 0.85);

// The default riding tag (M-30). A card needing other timings hands its own to F.tag as `fn`.
const ridingLabel = makeRidingLabel({ role: 'network' });

// Networking Pods carry the network role and are not recoloured, so tint stays null.
const BIND = { role: 'network', podRole: 'network', tint: null, pulsePod, pulsePodDim, ridingLabel };
export const P = makePartKinds(BIND);
export const F = makeFlowKinds(BIND);
export const defineCard = defineCardWith(BIND);
