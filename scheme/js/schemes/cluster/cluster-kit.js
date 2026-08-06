export {
  valChip, setVal, setChip, setBoxLabel, setBoxSublabel, makeInit, packetAlong,
  routePacket, segmentPacket, routeDur, routeLength, packetArrival,
  topPacket, setConnectorDir, clearPodHighlight,
  diagramRoot, wrapPod, arrivalRipple, clearHighlights, clearWires, setWire, flashChips, lightBoxAt, at, makeRidingLabel,
  relationPath, revealAt, laneOf, REVEAL_MS,
  setPodSublabel, FADE, BEAT, OPACITY,
} from '../../lib/scheme-kit.js';
import { makeTintedPulses } from '../../lib/scheme-kit.js';
// Design notes: scheme/INTERNALS.md#schemejsschemesclustercluster-kitjs

// Cluster pods are recoloured violet (#c0b0ff), so the pulse
// stroke tint matches them rather than the workloads blue in scheme-kit.
export const CLUSTER_TINT = Object.freeze({ base: 'rgb(192, 176, 255)', bright: 'rgb(224, 214, 255)' });

export const { pulsePod, pulsePodDim } = makeTintedPulses(CLUSTER_TINT);
