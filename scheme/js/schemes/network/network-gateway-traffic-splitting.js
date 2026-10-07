import { P, F, defineCard, laneY, BEAT, FADE, OPACITY } from './network-kit.js';
import { g, rect } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/network-gateway-traffic-splitting.md

// Instrument inside a branch: the Gateway holds its two rules as rows, the default rule drawn as a
// proportion bar, and the request leaves by the LEFT end face for web-v1 or the RIGHT for web-v2.
// Each Service is a frame naming the Pods behind it, never a hop the ball passes through.
const V1_X = 40, V2_R = 1160;                     // content extent, centred on 600
// Pods sit in their Service frame the way network-external-traffic-policy seats them in a Node.
const POD_W = 128, POD_H = 104, POD_GAP = 16, FRAME_PAD = 14;
const V1_W = 3 * POD_W + 2 * POD_GAP + 2 * FRAME_PAD;   // three Pods
const V2_W = POD_W + 2 * FRAME_PAD;               // one Pod
const V2_X = V2_R - V2_W;
const V1_CX = V1_X + V1_W / 2;                    // the web-v1 leg drops on it
const V2_CX = V2_X + V2_W / 2;                    // the web-v2 leg drops on it
const SVC_Y = 464, POD_Y = SVC_Y + 34;
const SVC_H = POD_Y + POD_H + 12 - SVC_Y;

// The Gateway sits between the two drops, so both legs turn down outside it.
const LEG_IN = 52;
const GW_X = V1_CX + LEG_IN, GW_R = V2_CX - LEG_IN;
const GW_W = GW_R - GW_X;
const SPINE_X = (GW_X + GW_R) / 2;                // the client drops on it
// Starts left of 420, so it opens below the panel.
const GW_Y = 296, GW_H = 140;
const GW_CY = GW_Y + GW_H / 2;                    // both end faces leave here
const GW_HEAD_Y = GW_Y + 24;

// Rows: a caption column on the left, the bar right of it, the per-backend labels above the bar.
const CAP_X = GW_X + 20;
// The bar starts clear of the widest caption, `header rule · traffic: test`.
const BAR_X = GW_X + 226, BAR_R = GW_R - 20;
const BAR_W = BAR_R - BAR_X;
const BAR_H = 16;
const R1_BAR_Y = GW_Y + 56, R2_BAR_Y = GW_Y + 104;
const LABEL_DY = -6;
// web-v1 is OPAQUE: it lies over the bright web-v2 track, and any alpha lets the track glow through.
// rgb(31, 88, 100) is the 0.28 cyan mixed onto the canvas.
const BAR = Object.freeze({
  v1: 'rgb(31, 88, 100)',
  v2: 'rgba(79, 229, 255, 0.72)',
  edge: 'rgba(79, 229, 255, 0.45)',
});

const CLIENT_W = 232, CLIENT_H = 80, CLIENT_Y = 40;
const CLIENT_X = SPINE_X - CLIENT_W / 2;
const CLIENT_BOTTOM = CLIENT_Y + CLIENT_H;
const { out: OUT_X, back: BACK_X } = laneY(SPINE_X, 12);   // request down, answer up

const CHIP_W = 360, CHIP_H = 34, CHIP_GAP = 8;
const CHIP_X = (V1_X + V1_W + V2_X - CHIP_W) / 2;             // centred in the gap between the frames
const chipY = (i) => SVC_Y + 4 + i * (CHIP_H + CHIP_GAP);

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
const v1PodX = (i) => V1_X + FRAME_PAD + i * (POD_W + POD_GAP);

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
    // T-35: the counterfactual caption, over the web-v2 frame it is about, short of the leg on V2_CX.
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

// The two TAGGED balls ride LEG_DUR so the tag is readable (M-12, PACING). The untagged keep routeDur.
const LEG_DUR = 1125;
// The tags stand OFF the lane pair. The request tag TRAILS its ball, the answer tag stays over its
// ball: either other way lands one on the Gateway label.
const TAG_DOWN = { dx: -54, dy: -10 };
const TAG_UP = { dx: 50, dy: -14 };

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
      F.route({ points: TO_V1, after: 'in', name: 'toV1', pulse: 'podV1b' }),
    ],
  },
  {
    id: 'header-canary',
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
      F.segment({ from: ENTRY[0], to: ENTRY[1], delay: BEAT.lead, dur: LEG_DUR, name: 'in', lights: ['gw', 'requestChip', 'matchedChip'], tag: { text: 'traffic: test', ...TAG_DOWN } }),
      F.set({ at: 'in', chips: { requestChip: `${GET} · traffic: test`, matchedChip: HEADER_RULE } }),
      F.route({ points: TO_V2, after: 'in', name: 'toV2', pulse: 'podV2' }),
    ],
  },
  {
    id: 'weights',
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
      // The slide ends as the first request lands, so the bar, its labels, the sum and the matched rule
      // settle on one beat.
      slide(ALL_V1, SPLIT, BEAT.lead + 700 - SLIDE_MS),
      F.segment({ from: ENTRY[0], to: ENTRY[1], delay: BEAT.lead, name: 'in1', lights: ['gw', 'requestChip', 'matchedChip', 'weightsChip'] }),
      F.set({ at: 'in1', chips: { requestChip: GET, matchedChip: DEFAULT_RULE, weightsChip: NINETY_TEN }, wires: { w1Label: 'web-v1 · 90', w2Label: 'web-v2 · 10' } }),
      F.route({ points: TO_V1, after: 'in1', name: 'toV1', pulse: 'podV1b' }),
      F.segment({ from: ENTRY[0], to: ENTRY[1], after: 'in1', name: 'in2' }),
      F.route({ points: TO_V2, after: 'in2', name: 'toV2', pulse: 'podV2' }),
    ],
  },
  {
    id: 'invalid',
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
      F.route({ points: TO_V1, after: 'in1', name: 'toV1', pulse: 'podV1b' }),
      F.segment({ from: ENTRY[0], to: ENTRY[1], after: 'in1', name: 'in2' }),
      F.segment({ from: ANSWER[0], to: ANSWER[1], after: 'in2', dur: LEG_DUR, tag: { text: 'HTTP 500', ...TAG_UP } }),
    ],
  },
  {
    id: 'cutover',
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
      F.route({ points: TO_V2, after: 'in', name: 'toV2', pulse: 'podV2' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
