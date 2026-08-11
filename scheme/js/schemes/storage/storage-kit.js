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
import { makeTintedPulses, makeRidingLabel } from '../../lib/scheme-kit.js';
import { makePartKinds, POD_VIOLET } from '../../lib/scene-spec.js';
import { makeFlowKinds, defineCardWith } from '../../lib/step-spec.js';
export { POD_VIOLET };
// Per-category wrapper over scheme-kit for the Storage cards. The storage-specific pieces are the
// jade pod tint, its two pulse wrappers and setCylinderLabel.

// `base` must be the exact resting stroke and `bright` the tint-bright stop, for the reason under
// WORKLOADS_TINT: the non-persist pulse fills forwards to `base`.
export const STORAGE_TINT = Object.freeze({ base: 'rgb(94, 202, 148)', bright: 'rgb(174, 224, 199)' });


// The cylinder is the storage family's own block (the backing disk / PV). No other
// kit touches it, so its label setter lives here rather than in scheme-kit.
export function setCylinderLabel(cylEl, txt) {
  const l = cylEl && cylEl.querySelector('.scheme-cylinder-label');
  if (l) l.textContent = txt;
}

export const { pulsePod, pulsePodDim } = makeTintedPulses(STORAGE_TINT);

// No geometry grammar yet, and no empty placeholder for one: a grammar is named after the category
// that owns it. The shape here is STO.L-01's vertical stack, so no cluster field would fit anyway.

// All 600 role literals in this folder are 'storage', its 26 Pods included, so no recolour.
// The default tag that rides a ball (M-30). A card needing other timings makes its own with
// makeRidingLabel and hands it to F.tag as `fn`.
const ridingLabel = makeRidingLabel({ role: 'storage' });

const BIND = { role: 'storage', podRole: 'storage', tint: null, pulsePod, pulsePodDim, ridingLabel };
export const P = makePartKinds(BIND);
export const F = makeFlowKinds(BIND);
export const defineCard = defineCardWith(BIND);
