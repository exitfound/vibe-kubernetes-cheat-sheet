import { P, F, defineCard, makeRidingLabel, laneY, BEAT, FADE, OPACITY } from './network-kit.js';
import { g, rect } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/network-gateway-traffic-splitting.md


// Instrument inside a branch: the Gateway holds its two rules as rows, the default rule drawn as a
// proportion bar, and the request leaves by the LEFT end face for web-v1 or the RIGHT for web-v2.
// Each Service is a frame naming the Pods behind it, never a hop the ball passes through.
const V1_X = 40, V2_R = 1160;                     // content extent 40..1160, centred on 600
// Pods sit in their Service frame the way network-external-traffic-policy seats them in a Node: 128 by
// 104 at a 16 gap inside 14 of padding, 34 under the frame top so the frame label stays clear.
const POD_W = 128, POD_H = 104, POD_GAP = 16, FRAME_PAD = 14;
const V1_W = 3 * POD_W + 2 * POD_GAP + 2 * FRAME_PAD;   // 444: three Pods
const V2_W = POD_W + 2 * FRAME_PAD;               // 156: one Pod
const V2_X = V2_R - V2_W;                         // 1004
const V1_CX = V1_X + V1_W / 2;                    // 262: the web-v1 leg drops on it
const V2_CX = V2_X + V2_W / 2;                    // 1082: the web-v2 leg drops on it
const SVC_Y = 464, POD_Y = SVC_Y + 34;            // Pods 498..602
const SVC_H = POD_Y + POD_H + FRAME_PAD - SVC_Y;  // 152: frames 464..616

// The Gateway sits between the two drops, 52 in from each, so both legs turn down outside it.
const LEG_IN = 52;
const GW_X = V1_CX + LEG_IN, GW_R = V2_CX - LEG_IN;     // 314..1030
const GW_W = GW_R - GW_X;
const SPINE_X = (GW_X + GW_R) / 2;                // 672: the client drops on it
// Starts left of 420, so it opens below the panel: deepest 279.51 at 1100x800, 16 clear.
const GW_Y = 296, GW_H = 140;
const GW_CY = GW_Y + GW_H / 2;                    // 366: both end faces leave here
const GW_HEAD_Y = GW_Y + 24;

// Rows: a caption column on the left, the bar right of it, the per-backend labels above the bar.
const CAP_X = GW_X + 20;
// 226 and not 210: `header rule · traffic: test` inks to 520.1 at 1600x1000, which a bar at 524
// clears by 3.9. At 540 it clears by 19.9.
const BAR_X = GW_X + 226, BAR_R = GW_R - 20;      // 540..1010
const BAR_W = BAR_R - BAR_X;                      // 470
const BAR_H = 16;
const R1_BAR_Y = GW_Y + 56, R2_BAR_Y = GW_Y + 104;      // 352 and 400
const LABEL_DY = -6;
// web-v1 is OPAQUE: it lies over the bright web-v2 track, and any alpha lets the track glow through
// until the whole bar reads as web-v2. rgb(31, 88, 100) is the 0.28 cyan mixed onto the canvas.
const BAR = Object.freeze({
  v1: 'rgb(31, 88, 100)',
  v2: 'rgba(79, 229, 255, 0.72)',
  edge: 'rgba(79, 229, 255, 0.45)',
});

const CLIENT_W = 232, CLIENT_H = 80, CLIENT_Y = 40;
const CLIENT_X = SPINE_X - CLIENT_W / 2;          // 556
const CLIENT_BOTTOM = CLIENT_Y + CLIENT_H;        // 120
const { out: OUT_X, back: BACK_X } = laneY(SPINE_X, 12);   // 660 request down, 684 answer up

const CHIP_W = 360, CHIP_H = 34, CHIP_GAP = 8;
const CHIP_X = (V1_X + V1_W + V2_X - CHIP_W) / 2;             // 564: centred in the 484..1004 gap
const chipY = (i) => SVC_Y + 4 + i * (CHIP_H + CHIP_GAP);     // 468 / 510 / 552

const ENTRY = [[OUT_X, CLIENT_BOTTOM], [OUT_X, GW_Y]];
const ANSWER = [[BACK_X, GW_Y], [BACK_X, CLIENT_BOTTOM]];
const TO_V1 = [[GW_X, GW_CY], [V1_CX, GW_CY], [V1_CX, SVC_Y]];
const TO_V2 = [[GW_R, GW_CY], [V2_CX, GW_CY], [V2_CX, SVC_Y]];

const trackRect = (cls, y, w, fill) => {
  const r = rect({ class: cls, x: BAR_X, y, width: w, height: BAR_H, rx: 3 });
  r.style.fill = fill;
  return r;
};
// The header rule has one backendRef, so its row is one full web-v2 track.
function headerRow() {
  const grp = g({ 'data-role': 'network' });
  const t = trackRect('gts-track', R1_BAR_Y, BAR_W, BAR.v2);
  t.style.stroke = BAR.edge;
  grp.appendChild(t);
  return grp;
}
// The default rule: a web-v2 track with the web-v1 share laid over it from the left, so ONE width
// is the whole ratio and a weight of 0 leaves the track showing web-v2 alone.
function weightBar() {
  const grp = g({ 'data-role': 'network' });
  const t = trackRect('gts-track', R2_BAR_Y, BAR_W, BAR.v2);
  t.style.stroke = BAR.edge;
  grp.appendChild(t);
  const v1 = trackRect('gts-v1', R2_BAR_Y, BAR_W, BAR.v1);
  v1.style.stroke = BAR.edge;
  grp.appendChild(v1);
  return grp;
}

const podIn = { dx: 14, dy: 26, w: POD_W - 28, h: 44, label: 'app', sublabel: ':8080' };
const podAt = (key, x, label, ip) => P.pod({
  key, innerKey: `${key}Box`, x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel: ip, inner: podIn,
});
const v1PodX = (i) => V1_X + FRAME_PAD + i * (POD_W + POD_GAP);   // 54 / 198 / 342

// The list order IS the append order, which is the z-order: frames and Pods, the Gateway with its
// rule rows, then lanes and labels above them, then the chips, then the packet layer.
export const SCENE = {
  'aria-label': 'Traffic splitting with HTTPRoute: a client sends requests to the Gateway shop, whose HTTPRoute holds two rules. The default rule has no match, so it takes every path, and lists weighted backendRefs, drawn as a bar split between Service web-v1 with three Pods and Service web-v2 with one Pod. A second rule matching the header traffic: test sends only tagged requests to web-v2. Each backend gets its weight divided by the sum of the weights, 90 and 10 of 100, whatever its Pod count. If web-v2 did not resolve, its share must get HTTP 500 rather than move to web-v1. Separately, requests to a Service with no ready endpoints should get 503. A weight of 0 on web-v1 sends every request to web-v2',
  parts: [
    P.defs(),
    // Each Service fades as ONE unit, its frame and Pods. Its leg stays at full.
    P.group({
      key: 'v1Group',
      parts: [
        P.node({ key: 'svcV1', x: V1_X, y: SVC_Y, w: V1_W, h: SVC_H, label: 'Service web-v1' }),
        podAt('podV1a', v1PodX(0), 'Pod web-v1-a', '10.244.1.5'),
        podAt('podV1b', v1PodX(1), 'Pod web-v1-b', '10.244.2.6'),
        podAt('podV1c', v1PodX(2), 'Pod web-v1-c', '10.244.3.7'),
      ],
    }),
    P.group({
      key: 'v2Group',
      parts: [
        P.node({ key: 'svcV2', x: V2_X, y: SVC_Y, w: V2_W, h: SVC_H, label: 'Service web-v2' }),
        podAt('podV2', V2_X + FRAME_PAD, 'Pod web-v2-a', '10.244.2.9'),
      ],
    }),
    P.box({ key: 'client', x: CLIENT_X, y: CLIENT_Y, w: CLIENT_W, h: CLIENT_H, label: 'Client', sublabel: 'https · shop.io' }),
    P.box({ key: 'gw', x: GW_X, y: GW_Y, w: GW_W, h: GW_H }),
    P.tag({ x: SPINE_X, y: GW_HEAD_Y, text: 'Gateway shop · HTTPRoute web', cls: 'scheme-box-label' }),
    P.group({
      key: 'rule1',
      parts: [
        P.raw({ make: () => headerRow() }),
        P.tag({ x: CAP_X, y: R1_BAR_Y + BAR_H - 3, anchor: 'start', text: 'header rule · traffic: test' }),
        P.wire({ key: 'r1Label', x: BAR_R, y: R1_BAR_Y + LABEL_DY, anchor: 'end' }),
      ],
    }),
    // One raw, one tune: the tune files the web-v1 share under a LITERAL key, so every step can
    // pin its width on both paths and the weights step can slide it.
    P.raw({
      make: () => weightBar(),
      tune: (el, refs) => { refs.barV1 = el.querySelector('.gts-v1'); },
    }),
    P.tag({ x: CAP_X, y: R2_BAR_Y + BAR_H - 3, anchor: 'start', text: 'default rule · path /' }),
    P.wire({ key: 'w1Label', x: BAR_X, y: R2_BAR_Y + LABEL_DY, anchor: 'start' }),
    P.wire({ key: 'w2Label', x: BAR_R, y: R2_BAR_Y + LABEL_DY, anchor: 'end' }),
    P.arrow({ key: 'entry', from: ENTRY[0], to: ENTRY[1], dashed: true, dim: true }),
    P.arrow({ key: 'answer', from: ANSWER[0], to: ANSWER[1], dashed: true, dim: true }),
    P.lane({ key: 'legV1', points: TO_V1, dashed: true, dim: true }),
    P.lane({ key: 'legV2', points: TO_V2, dashed: true, dim: true }),
    // T-35: the counterfactual caption, in the gap over the web-v2 frame it is about, ending 12 short
    // of the leg that drops on V2_CX so the lane never strikes it.
    P.wire({ key: 'ifLabel', x: V2_CX - 12, y: SVC_Y - 10, anchor: 'end' }),
    P.chip({ key: 'requestChip', x: CHIP_X, y: chipY(0), w: CHIP_W, h: CHIP_H, name: 'request', value: 'none' }),
    P.chip({ key: 'matchedChip', x: CHIP_X, y: chipY(1), w: CHIP_W, h: CHIP_H, name: 'matched rule', value: 'none' }),
    P.chip({ key: 'weightsChip', x: CHIP_X, y: chipY(2), w: CHIP_W, h: CHIP_H, name: 'default rule weights', value: '1 (default)' }),
    P.packets(),
  ],
  reset: {
    keys: ['client', 'gw', 'podV1aBox', 'podV1bBox', 'podV1cBox', 'podV2Box', 'requestChip', 'matchedChip', 'weightsChip'],
    pods: ['podV1a', 'podV1b', 'podV1c', 'podV2'],
  },
};

const DIM = OPACITY.notready;
// Every keyed shade in ONE place per step (A-16): whether the header rule exists yet and which Service
// serves. No lane is shaded: a Service nothing sends to is said by its own shade and the bar labels.
const stage = ({ rule1 = 1, v1 = 1, v2 = 1 }) => ({
  opacity: { rule1, v1Group: v1, v2Group: v2 },
});

// The web-v1 share of the bar, in px: a weight over the sum of the weights in the rule.
const share = (w1, w2) => `${BAR_W * w1 / (w1 + w2)}px`;
const ALL_V1 = share(1, 0), SPLIT = share(90, 10), ALL_V2 = share(0, 1);
const pinBar = (width) => (s) => { s.refs.barV1.style.width = width; };
const SLIDE_MS = 900;
const slide = (from, to, delay = 0, extra = {}) => F.anim({
  target: 'barV1', keyframes: [{ width: from }, { width: to }],
  options: { duration: SLIDE_MS, fill: 'both', easing: 'ease-in-out' }, delay, ...extra,
});

// The two TAGGED balls ride LEG_DUR 1125 rather than the 700 floor, where the tag has to clear the
// face it leaves and is gone before it can be read (M-12, PACING). The untagged balls keep routeDur.
const LEG_DUR = 1125;
// The tags stand OFF the lane pair and are readable from the moment the ball leaves, so each sits on
// the side of the ball AWAY from the face it heads for: the request tag under its ball, clear of the
// Client bottom, the answer tag over its ball, clear of the Gateway top. Each dissolves with its ball
// on arrival (M-30a).
const ridingLabel = makeRidingLabel({ role: 'network', inMs: 100, outMs: 100, hold: 0 });
const TAG_DOWN = { fn: ridingLabel, dx: -62, dy: 14 };
const TAG_UP = { fn: ridingLabel, dx: 50, dy: -14 };

const GET = 'GET shop.io/';
const DEFAULT_RULE = 'default · path /';
const HEADER_RULE = 'header · traffic: test';
const ONE = '1 (default)', NINETY_TEN = '90 + 10 = 100', ZERO_ONE = '0 + 1 = 1';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    ...stage({ rule1: OPACITY.pending, v2: DIM }),
    chips: { requestChip: 'none', matchedChip: 'none', weightsChip: ONE },
    wires: { r1Label: 'not created yet', w1Label: 'web-v1 · 1', w2Label: 'web-v2 · not listed', ifLabel: '' },
    enter: pinBar(ALL_V1),
  },
  {
    id: 'one-backend',
    // Motion: lead 800, the entry 700, a 100 beat, the web-v1 leg 700, the Pod blink 900: span 3200.
    duration: 3800,
    narration: 'An HTTPRoute attached to the Gateway shop has one rule with no match, so it takes every path, and it lists one backendRef, Service web-v1, with no weight. An unset weight defaults to 1, and a lone backend with a weight above 0 takes every request. The Gateway sends each one to a Pod behind that Service, by the Service IP or an endpoint, as its implementation chooses.',
    ...stage({ rule1: OPACITY.pending, v2: DIM }),
    chips: { requestChip: GET, matchedChip: DEFAULT_RULE, weightsChip: ONE },
    wires: { r1Label: 'not created yet', w1Label: 'web-v1 · 1', w2Label: 'web-v2 · not listed', ifLabel: '' },
    lit: ['client', 'weightsChip'],
    reducedLit: ['podV1bBox'],
    enter: pinBar(ALL_V1),
    // The request and the rule it matched are what reaches the Gateway, so both turn over there.
    rewind: { chips: { requestChip: 'none', matchedChip: 'none' } },
    flow: [
      F.segment({ from: ENTRY[0], to: ENTRY[1], delay: BEAT.lead, name: 'in', lights: ['gw', 'requestChip', 'matchedChip'] }),
      F.set({ at: 'in', chips: { requestChip: GET, matchedChip: DEFAULT_RULE } }),
      F.route({ points: TO_V1, after: 'in', name: 'toV1' }),
      F.pulse({ pod: 'podV1b', at: 'toV1' }),
    ],
  },
  {
    id: 'header-canary',
    // Motion: the rule row and web-v2 fade in 600, the tagged entry leaves at lead 800 and lands at
    // 1925, the web-v2 leg lands at 2725, the blink ends the span at 3625.
    duration: 4800,
    narration: 'Before users see web-v2, a second rule matches the header traffic: test and lists web-v2 alone. Both rules match the path prefix / and neither names a method, so the tie goes to the rule with more header matches. Only a request carrying that header reaches the one Pod of web-v2, and every other request still takes the default rule to web-v1.',
    ...stage({}),
    chips: { requestChip: `${GET} · traffic: test`, matchedChip: HEADER_RULE, weightsChip: ONE },
    wires: { r1Label: 'web-v2', w1Label: 'web-v1 · 1', w2Label: 'web-v2 · not listed', ifLabel: '' },
    lit: ['client'],
    reducedLit: ['podV2Box'],
    enter: pinBar(ALL_V1),
    rewind: { chips: { requestChip: GET, matchedChip: DEFAULT_RULE } },
    flow: [
      F.fade({ target: 'rule1', from: OPACITY.pending, to: 1, dur: FADE.in, easing: 'ease-out' }),
      F.fade({ target: 'v2Group', from: DIM, to: 1, dur: FADE.in, easing: 'ease-out' }),
      F.segment({ from: ENTRY[0], to: ENTRY[1], delay: BEAT.lead, dur: LEG_DUR, name: 'in', lights: ['gw', 'requestChip', 'matchedChip'] }),
      F.tag({ text: 'traffic: test', points: ENTRY, delay: BEAT.lead, dur: LEG_DUR, easing: 'linear', ...TAG_DOWN }),
      F.set({ at: 'in', chips: { requestChip: `${GET} · traffic: test`, matchedChip: HEADER_RULE } }),
      F.route({ points: TO_V2, after: 'in', name: 'toV2' }),
      F.pulse({ pod: 'podV2', at: 'toV2' }),
    ],
  },
  {
    id: 'weights',
    // Motion: the bar slides 900 from 0, the first request leaves at lead 800 and the second one
    // hop behind it, each leg then its blink: the web-v2 blink ends the span at 4000.
    duration: 4600,
    narration: 'The default rule now lists web-v1 with weight 90 and web-v2 with weight 10. A weight is a proportion, not a percentage: each backend gets its weight divided by the sum, 90 of 100 and 10 of 100, and the sum need not be 100. One request is drawn down each leg, but the split is far from even: whatever the replica counts, the one Pod of web-v2 gets about a tenth of the requests this rule matches, and three Pods share the rest.',
    ...stage({}),
    chips: { requestChip: GET, matchedChip: DEFAULT_RULE, weightsChip: NINETY_TEN },
    wires: { r1Label: 'web-v2', w1Label: 'web-v1 · 90', w2Label: 'web-v2 · 10', ifLabel: '' },
    lit: ['client'],
    reducedLit: ['podV1bBox', 'podV2Box'],
    enter: pinBar(SPLIT),
    rewind: {
      chips: { requestChip: `${GET} · traffic: test`, matchedChip: HEADER_RULE, weightsChip: ONE },
      wires: { w1Label: 'web-v1 · 1', w2Label: 'web-v2 · not listed' },
    },
    flow: [
      // The slide ends as the first request lands (600 + 900 = lead 800 + 700), so the bar, its
      // labels, the sum and the rule that request matched all settle on one beat.
      slide(ALL_V1, SPLIT, BEAT.lead + 700 - SLIDE_MS),
      F.segment({ from: ENTRY[0], to: ENTRY[1], delay: BEAT.lead, name: 'in1', lights: ['gw', 'requestChip', 'matchedChip', 'weightsChip'] }),
      F.set({ at: 'in1', chips: { requestChip: GET, matchedChip: DEFAULT_RULE, weightsChip: NINETY_TEN }, wires: { w1Label: 'web-v1 · 90', w2Label: 'web-v2 · 10' } }),
      F.route({ points: TO_V1, after: 'in1', name: 'toV1' }),
      F.pulse({ pod: 'podV1b', at: 'toV1' }),
      F.segment({ from: ENTRY[0], to: ENTRY[1], after: 'in1', name: 'in2' }),
      F.route({ points: TO_V2, after: 'in2', name: 'toV2' }),
      F.pulse({ pod: 'podV2', at: 'toV2' }),
    ],
  },
  {
    id: 'invalid',
    // Motion: as on weights, but the Gateway answers the second request itself, the tagged answer
    // leaving at 2400 and landing at 3525.
    duration: 5000,
    narration: 'If instead web-v2 did not resolve, say its Service were deleted, the route would report ResolvedRefs False. The tenth of requests weighted to web-v2 must then get HTTP 500, and so must every request of the header rule, which lists web-v2 alone and has no filters. That tenth is not handed to web-v1, which still serves its 90 of 100.',
    ...stage({ v2: DIM }),
    chips: { requestChip: GET, matchedChip: DEFAULT_RULE, weightsChip: NINETY_TEN },
    wires: { r1Label: 'web-v2 · HTTP 500', w1Label: 'web-v1 · 90', w2Label: 'web-v2 · 10 · HTTP 500', ifLabel: 'if instead web-v2 did not resolve' },
    lit: ['client'],
    reducedLit: ['podV1bBox'],
    enter: pinBar(SPLIT),
    flow: [
      F.segment({ from: ENTRY[0], to: ENTRY[1], delay: BEAT.lead, name: 'in1', lights: ['gw'] }),
      F.route({ points: TO_V1, after: 'in1', name: 'toV1' }),
      F.pulse({ pod: 'podV1b', at: 'toV1' }),
      F.segment({ from: ENTRY[0], to: ENTRY[1], after: 'in1', name: 'in2' }),
      F.segment({ from: ANSWER[0], to: ANSWER[1], after: 'in2', dur: LEG_DUR }),
      F.tag({ text: 'HTTP 500', points: ANSWER, after: 'in2', dur: LEG_DUR, easing: 'linear', ...TAG_UP }),
    ],
  },
  {
    id: 'cutover',
    // Motion: web-v2 fades back in 600, the bar slides 900 from 700 as web-v1 dims, the request
    // leaves at 1700 and lands on web-v2, the blink ends the span at 4100.
    duration: 4500,
    narration: 'Back in the real rollout, where web-v2 resolves, the weights become 0 for web-v1 and 1 for web-v2. A weight of 0 forwards no traffic, so web-v2 takes every request. The Pods of web-v1 are still running, so shifting traffic back is one edit to the weights.',
    ...stage({ v1: DIM }),
    chips: { requestChip: GET, matchedChip: DEFAULT_RULE, weightsChip: ZERO_ONE },
    wires: { r1Label: 'web-v2', w1Label: 'web-v1 · 0', w2Label: 'web-v2 · 1', ifLabel: '' },
    lit: ['client'],
    reducedLit: ['podV2Box'],
    enter: pinBar(ALL_V2),
    // The weights turn over when the bar stops, the edit landing, as they do on the weights step.
    rewind: { chips: { weightsChip: NINETY_TEN }, wires: { w1Label: 'web-v1 · 90', w2Label: 'web-v2 · 10' } },
    flow: [
      F.fade({ target: 'v2Group', from: DIM, to: 1, dur: FADE.in, easing: 'ease-out' }),
      slide(SPLIT, ALL_V2, 700, { name: 'slid', lights: ['weightsChip'] }),
      F.set({ at: 'slid', chips: { weightsChip: ZERO_ONE }, wires: { w1Label: 'web-v1 · 0', w2Label: 'web-v2 · 1' } }),
      // SLIDE_MS rather than FADE.out: web-v1 dims over the same 900 its share slides to 0.
      F.fade({ target: 'v1Group', from: 1, to: DIM, delay: 700, dur: SLIDE_MS, easing: 'ease-in-out' }),
      F.segment({ from: ENTRY[0], to: ENTRY[1], after: 'slid', name: 'in', lights: ['gw'] }),
      F.route({ points: TO_V2, after: 'in', name: 'toV2' }),
      F.pulse({ pod: 'podV2', at: 'toV2' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
