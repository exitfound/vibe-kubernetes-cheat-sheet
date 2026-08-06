export {
  valChip, setVal, setChip, setBoxLabel, setBoxSublabel, makeInit, packetAlong,
  routePacket, segmentPacket, routeDur, routeLength, packetArrival,
  topPacket, setConnectorDir, clearPodHighlight,
  diagramRoot, wrapPod, arrivalRipple, clearHighlights, clearWires, setWire, flashChips, lightBoxAt, at, makeRidingLabel,
  relationPath, revealAt, laneOf, REVEAL_MS,
  setPodSublabel, FADE, BEAT, OPACITY,
} from '../../lib/scheme-kit.js';
import { makeTintedPulses } from '../../lib/scheme-kit.js';
// Design notes: scheme/INTERNALS.md#schemejsschemesnetworknetwork-kitjs

export const NETWORK_TINT = Object.freeze({ base: 'rgb(79, 229, 255)', bright: 'rgb(158, 234, 247)' });

export const { pulsePod, pulsePodDim } = makeTintedPulses(NETWORK_TINT);
