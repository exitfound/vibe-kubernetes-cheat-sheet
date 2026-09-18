import { P, F, defineCard, makeRidingLabel, ladder, BEAT, FADE, OPACITY } from './network-kit.js';
import { g, rect, line } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/network-service-terminating-endpoints.md


// Narration panel at 1100x800: right <= 396.5, bottom 180.1 on every step but `gone` (155.3).
// The client is the one block left of 420 above the slice frame, and it opens at y=245.
const SCHEME_L = 60, SCHEME_R = 1140;
const FLOW_Y = 300;                         // the traffic line: client, dataplane and web-c on it

// The client stands centred over the slice frame, so the two read as one left column.
const SLICE_W = 320;
const CLIENT_W = 190, CLIENT_H = 110;
const CLIENT_X = SCHEME_L + (SLICE_W - CLIENT_W) / 2;   // 125, centre 220 like the slice
const CLIENT_EDGE = CLIENT_X + CLIENT_W;    // 315

// NET.L-01: the dataplane and kube-proxy are 232x80 and share one column, kube-proxy UNDER it.
const COL_L = 470, COL_W = 232, ACTOR_H = 80;
const COL_R = COL_L + COL_W;                // 702: the fan leaves this face
const COL_CX = COL_L + COL_W / 2;           // 586: the relation runs on it
const DP_H = ACTOR_H, DP_TOP = FLOW_Y - DP_H / 2;   // 260..340

// The slice frame: a title, one endpoint header, then its three conditions as a chip column.
const SLICE_Y = 380, SLICE_PAD = 14;
const SLICE_R = SCHEME_L + SLICE_W;         // 380: the face the watch lane leaves
const TITLE_Y = SLICE_Y + 22, HDR_Y = SLICE_Y + 40;
const COND_H = 34;
const condY = ladder({ y: SLICE_Y + 52, rowH: COND_H, gap: 6 });   // 432 / 472 / 512
const SLICE_H = 52 + 3 * COND_H + 2 * 6 + 12;                    // 178, bottom 558
const SLICE_CY = SLICE_Y + SLICE_H / 2;     // 469

const KP_H = ACTOR_H, KP_Y = SLICE_CY - KP_H / 2;   // 429..509, centred on the frame face midpoint
const WATCH = [[SLICE_R, SLICE_CY], [COL_L, SLICE_CY]];

// Backends: one column of three on a 170 pitch, web-c on the flow line so its leg is straight.
const POD_L = 930, POD_W = SCHEME_R - POD_L, POD_H = 100, POD_PITCH = 170;
const PODA_CY = FLOW_Y - POD_PITCH, PODC_CY = FLOW_Y, PODD_CY = FLOW_Y + POD_PITCH;   // 130 / 300 / 470
const BUS_X = 816;                          // midway between the dataplane face and the Pod column
const LEG_DY = 26;                          // web-a and web-d legs leave the face 26 off the flow line
const LANE = [[CLIENT_EDGE, FLOW_Y], [COL_L, FLOW_Y]];
const FAN_A = [[COL_R, FLOW_Y - LEG_DY], [BUS_X, FLOW_Y - LEG_DY], [BUS_X, PODA_CY], [POD_L, PODA_CY]];
const FAN_C = [[COL_R, FLOW_Y], [POD_L, FLOW_Y]];
const FAN_D = [[COL_R, FLOW_Y + LEG_DY], [BUS_X, FLOW_Y + LEG_DY], [BUS_X, PODD_CY], [POD_L, PODD_CY]];

// The grace clock: 30 seconds across the full content width, so one second is 36 units.
const SEC = (SCHEME_R - SCHEME_L) / 30;
const tx = (s) => SCHEME_L + s * SEC;       // 0s 60, 5s 240, 14s 564, 30s 1140
const PRESTOP_S = 5, EXIT_S = 14;
const TRACK_Y = 600, TRACK_H = 8;
const RULER_CAPTION_Y = 584, TICK_LABEL_Y = 630;
const RULER = Object.freeze({
  track: 'rgba(79, 229, 255, 0.10)',
  edge: 'rgba(79, 229, 255, 0.40)',
  fill: 'rgba(79, 229, 255, 0.70)',
  tick: 'rgba(79, 229, 255, 0.60)',
});

const bar = (cls, from, to, fill) => {
  const r = rect({ class: cls, x: tx(from), y: TRACK_Y, width: tx(to) - tx(from), height: TRACK_H, rx: 2 });
  r.style.fill = fill;
  return r;
};

// The time axis no part kind draws: a track, the two elapsed spans the steps light, four ticks.
function graceRuler() {
  const grp = g({ 'data-role': 'network' });
  const track = bar('tg-track', 0, 30, RULER.track);
  track.style.stroke = RULER.edge;
  grp.appendChild(track);
  grp.appendChild(bar('tg-prestop', 0, PRESTOP_S, RULER.fill));
  grp.appendChild(bar('tg-drain', PRESTOP_S, EXIT_S, RULER.fill));
  for (const s of [0, PRESTOP_S, EXIT_S, 30]) {
    const t = line({ x1: tx(s), y1: TRACK_Y - 6, x2: tx(s), y2: TRACK_Y + TRACK_H + 6 });
    t.style.stroke = RULER.tick;
    t.style.strokeWidth = '1.4';
    grp.appendChild(t);
  }
  return grp;
}

// Every tag is lit by its ball's departure. The bus-leg tags ride clear of the dataplane and 25.5 left
// of the x 816 trunk. The straight leg has no such room (record MOTION), so its tag inks no text.
const ridingLabel = makeRidingLabel({ role: 'network', dy: -8, outMs: 170, hold: 0 });
const tag = (p) => F.tag({ fn: ridingLabel, ...p });
const TAG_STRAIGHT = { dx: -24 };                // web-c leg: 8.6 clear of the dataplane label, 7.2 of the app box
const TAG_BUS = { dx: -50, dy: -22 };            // web-a leg: 5.5 above the dataplane top as the ball leaves
const TAG_DOWN = { dx: -50, dy: 30 };            // web-d leg: 6.2 under the dataplane, and under the trunk corner

const POD_INNER = { dx: 20, dy: 30, w: POD_W - 40, h: 44, label: 'app', sublabel: 'eth0' };
const backend = (key, cy, label, sublabel) => P.pod({
  key, innerKey: `${key}Box`, x: POD_L, y: cy - POD_H / 2, w: POD_W, h: POD_H, label, sublabel, inner: POD_INNER,
});

// The list order IS the append order, which is the z-order: blocks and Pods, the wires ABOVE them,
// the slice rows and the ruler, then the packet layer on top.
export const SCENE = {
  'aria-label': 'Terminating endpoints and draining during a rolling update of two replicas: the rollout first adds a Ready web-d, then deletes web-c. The 5s preStop sleep web-c declares starts at the same moment its endpoint in the slice turns ready=false and terminating=true with serving still true, kube-proxy reads the slice and rewrites the Service rules in the Node dataplane without web-c, the established TCP flow still reaches web-c on its conntrack entry while new connections go to the other Pods, and web-c exits at 14s inside its 30s grace period so SIGKILL is never sent, then once the Pod reaches a terminal phase its endpoint leaves the slice and the Pod object is removed',
  parts: [
    P.defs(),
    P.box({ key: 'dp', x: COL_L, y: DP_TOP, w: COL_W, h: DP_H, label: 'Node dataplane', sublabel: 'Service rules · conntrack' }),
    P.box({ key: 'kproxy', x: COL_L, y: KP_Y, w: COL_W, h: KP_H, label: 'kube-proxy', sublabel: 'reads the slice · writes rules' }),
    P.box({ key: 'slice', x: SCHEME_L, y: SLICE_Y, w: SLICE_W, h: SLICE_H }),
    P.tag({ x: SCHEME_L + SLICE_W / 2, y: TITLE_Y, text: 'EndpointSlice web-x9f2', cls: 'scheme-box-label' }),
    P.wire({ key: 'epHdr', x: SCHEME_L + SLICE_W / 2, y: HDR_Y }),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: CLIENT_X, y: FLOW_Y - CLIENT_H / 2, w: CLIENT_W, h: CLIENT_H,
      label: 'Client Pod', sublabel: '10.244.1.5',
      inner: { dx: 20, dy: 30, w: CLIENT_W - 40, h: 48, label: 'app', sublabel: 'eth0' },
    }),
    backend('podA', PODA_CY, 'Pod web-a', '10.244.2.7 · Ready'),
    backend('podC', PODC_CY, 'Pod web-c', '10.244.3.9 · Ready'),
    P.arrow({ from: LANE[0], to: LANE[1], dashed: true, dim: true }),
    P.lane({ points: FAN_A, dashed: true, dim: true }),
    P.lane({ key: 'legC', points: FAN_C, dashed: true, dim: true }),
    // web-d does not exist before the surge step, so its leg lives and dies with it (A-14).
    P.group({
      key: 'podDGroup',
      parts: [
        backend('podD', PODD_CY, 'Pod web-d', '10.244.4.2 · starting'),
        P.lane({ points: FAN_D, dashed: true, dim: true }),
      ],
    }),
    P.arrow({ from: WATCH[0], to: WATCH[1], dashed: true, dim: true }),
    // kube-proxy WRITES the rules the dataplane runs and never forwards a packet: no head, no ball.
    P.relation({ points: [[COL_CX, KP_Y], [COL_CX, DP_TOP + DP_H]] }),
    P.chip({ key: 'epReady', x: SCHEME_L + SLICE_PAD, y: condY(0), w: SLICE_W - 2 * SLICE_PAD, h: COND_H, name: 'condition', value: 'ready=true' }),
    P.chip({ key: 'epServing', x: SCHEME_L + SLICE_PAD, y: condY(1), w: SLICE_W - 2 * SLICE_PAD, h: COND_H, name: 'condition', value: 'serving=true' }),
    P.chip({ key: 'epTerm', x: SCHEME_L + SLICE_PAD, y: condY(2), w: SLICE_W - 2 * SLICE_PAD, h: COND_H, name: 'condition', value: 'terminating=false' }),
    // One raw, one tune: the tune files two LITERAL ref keys so each step lights a span by opacity.
    P.raw({
      make: () => graceRuler(),
      tune: (el, refs) => {
        refs.segPre = el.querySelector('.tg-prestop');
        refs.segDrain = el.querySelector('.tg-drain');
      },
    }),
    P.tag({ x: SCHEME_L, y: RULER_CAPTION_Y, anchor: 'start', text: 'terminationGracePeriodSeconds 30' }),
    P.tag({ x: tx(0), y: TICK_LABEL_Y, anchor: 'start', text: '0s delete' }),
    P.tag({ x: tx(PRESTOP_S), y: TICK_LABEL_Y, text: '5s SIGTERM' }),
    P.tag({ x: tx(EXIT_S), y: TICK_LABEL_Y, text: '14s exit' }),
    P.tag({ x: tx(30), y: TICK_LABEL_Y, anchor: 'end', text: '30s SIGKILL if still running' }),
    P.packets(),
  ],
  reset: {
    keys: ['dp', 'kproxy', 'slice', 'epReady', 'epServing', 'epTerm', 'clientBox', 'podABox', 'podCBox', 'podDBox'],
    pods: ['client', 'podA', 'podC', 'podD'],
  },
};

// A-16: one factory owns the whole opacity field, web-d with its leg, web-c with its leg, the clock.
const stage = ({ d = 1, c = 1, leg = 1, pre = 0, drain = 0 }) => ({
  podDGroup: d, podC: c, legC: leg, segPre: pre, segDrain: drain,
});

const EP_HDR = 'endpoint 10.244.3.9 · web-c';
const EP_GONE = 'endpoint 10.244.3.9 removed';
const EMPTY = '(empty)';
const COND_UP = { epReady: 'ready=true', epServing: 'serving=true', epTerm: 'terminating=false' };
const COND_TERM = { epReady: 'ready=false', epServing: 'serving=true', epTerm: 'terminating=true' };
const COND_GONE = { epReady: EMPTY, epServing: EMPTY, epTerm: EMPTY };
const D_START = '10.244.4.2 · starting', D_READY = '10.244.4.2 · Ready';
const C_READY = '10.244.3.9 · Ready', C_TERM = '10.244.3.9 · Terminating', C_GONE = '10.244.3.9 · deleted';

const CONN_GAP = 540;                       // two connections off one client pulse, two rides

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: COND_UP,
    wires: { epHdr: EP_HDR },
    podSublabels: { podC: C_READY, podD: D_START },
    opacity: stage({ d: 0 }),
  },
  {
    id: 'steady',
    duration: 4200,
    narration: 'The slice for the Service web lists endpoints for web-a and web-c, drawn here for web-c: ready=true, serving=true, terminating=false. A long request lands on web-c and a new connection on web-a, each pinned to its Pod by a conntrack entry in the Node dataplane.',
    chips: COND_UP,
    wires: { epHdr: EP_HDR },
    podSublabels: { podC: C_READY, podD: D_START },
    opacity: stage({ d: 0 }),
    reducedLit: ['clientBox', 'podCBox', 'podABox'],
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: LANE[0], to: LANE[1], delay: BEAT.afterPulse, name: 'send' }),
      F.light({ targets: ['dp'], at: 'send' }),
      F.route({ points: FAN_C, after: 'send', name: 'giveC' }),
      tag({ text: 'long request', points: FAN_C, after: 'send', easing: 'ease-in-out', ...TAG_STRAIGHT }),
      F.pulse({ pod: 'podC', at: 'giveC' }),
      F.segment({ from: LANE[0], to: LANE[1], delay: BEAT.afterPulse + CONN_GAP, name: 'send2' }),
      F.route({ points: FAN_A, after: 'send2', name: 'giveA' }),
      tag({ text: 'new conn', points: FAN_A, after: 'send2', easing: 'ease-in-out', ...TAG_BUS }),
      F.pulse({ pod: 'podA', at: 'giveA' }),
    ],
  },
  {
    id: 'surge',
    duration: 5000,
    narration: 'With two replicas the default maxUnavailable of 25% rounds down to 0, so the rollout adds web-d before it removes anything. Once its readiness probe passes, its endpoint turns ready=true and the Service rules send it new connections too.',
    chips: COND_UP,
    wires: { epHdr: EP_HDR },
    podSublabels: { podC: C_READY, podD: D_READY },
    opacity: stage({}),
    reducedLit: ['podDBox', 'clientBox'],
    rewind: { opacity: { podDGroup: 0 }, podSublabels: { podD: D_START } },
    // web-d and its leg appear together, it turns Ready on its pulse, and only then takes a ride.
    flow: [
      F.reveal({ target: 'podDGroup', name: 'born' }),
      F.pulse({ pod: 'podD', at: 'born' }),
      F.set({ at: 'born', plus: 900, podSublabels: { podD: D_READY } }),
      F.light({ targets: ['slice'], at: 'born', plus: 900 }),
      F.pulse({ pod: 'client', at: 'born', plus: 900 }),
      F.segment({ from: LANE[0], to: LANE[1], at: 'born', plus: 900 + BEAT.afterPulse, name: 'send' }),
      F.light({ targets: ['dp'], at: 'send' }),
      F.route({ points: FAN_D, after: 'send', name: 'giveD' }),
      tag({ text: 'new conn', points: FAN_D, after: 'send', easing: 'ease-in-out', ...TAG_DOWN }),
      F.pulse({ pod: 'podD', at: 'giveD' }),
    ],
  },
  {
    id: 'delete',
    duration: 3400,
    narration: 'Only then does the rollout delete web-c, and the grace clock starts at 0s. At once the 5s preStop sleep web-c declares begins, and its endpoint turns ready=false and terminating=true, while serving follows readiness and stays true.',
    chips: COND_TERM,
    wires: { epHdr: EP_HDR },
    podSublabels: { podC: C_TERM, podD: D_READY },
    opacity: stage({ c: OPACITY.terminating, pre: 1 }),
    reducedLit: ['podCBox'],
    rewind: { chips: COND_UP, opacity: { podC: 1, segPre: 0 }, podSublabels: { podC: C_READY } },
    // No packet: web-c blinks as it is deleted, and the clock and the slice rows move together.
    flow: [
      F.pulse({ pod: 'podC' }),
      F.fade({ target: 'segPre', from: 0, to: 1, dur: FADE.in, easing: 'ease-out' }),
      F.set({ delay: 450, chips: COND_TERM, podSublabels: { podC: C_TERM } }),
      F.light({ targets: ['epReady', 'epTerm'], delay: 450 }),
      F.fade({ target: 'podC', from: 1, to: OPACITY.terminating, dur: FADE.out, delay: 900, fill: 'forwards', easing: 'ease-in' }),
    ],
  },
  {
    id: 'reprogram',
    duration: 5400,
    narration: 'Inside that 5s window kube-proxy reads the flip and, as ready endpoints remain, rewrites the Service rules without web-c, so a new connection lands on web-a. The sleep exists because this update races the shutdown: web-c must keep answering until it lands.',
    chips: COND_TERM,
    wires: { epHdr: EP_HDR },
    podSublabels: { podC: C_TERM, podD: D_READY },
    opacity: stage({ c: OPACITY.terminating, pre: 1 }),
    lit: ['slice'],
    reducedLit: ['clientBox', 'podABox'],
    // The slice acts first, so it is lit and its ball leaves at BEAT.lead. The write has no ball.
    flow: [
      F.segment({ from: WATCH[0], to: WATCH[1], delay: BEAT.lead, name: 'watch' }),
      F.light({ targets: ['kproxy'], at: 'watch' }),
      F.light({ targets: ['dp'], after: 'watch' }),
      F.pulse({ pod: 'client', after: 'watch', plus: 200 }),
      F.segment({ from: LANE[0], to: LANE[1], after: 'watch', plus: 200 + BEAT.afterPulse, name: 'send' }),
      F.route({ points: FAN_A, after: 'send', name: 'giveA' }),
      tag({ text: 'new conn', points: FAN_A, after: 'send', easing: 'ease-in-out', ...TAG_BUS }),
      F.pulse({ pod: 'podA', at: 'giveA' }),
    ],
  },
  {
    id: 'drain',
    duration: 4400,
    narration: 'SIGTERM arrives at 5s as the sleep ends, and Pod web-c takes until 14s to finish what it holds. The long request still reaches it on its established TCP conntrack entry, which the rule change does not touch, while the next new connection goes to web-d.',
    chips: COND_TERM,
    wires: { epHdr: EP_HDR },
    podSublabels: { podC: C_TERM, podD: D_READY },
    opacity: stage({ c: OPACITY.terminating, pre: 1, drain: 1 }),
    reducedLit: ['clientBox', 'podCBox', 'podDBox'],
    rewind: { opacity: { segDrain: 0 } },
    // Two rides off one client pulse, told apart by their tags where their legs part.
    flow: [
      F.fade({ target: 'segDrain', from: 0, to: 1, dur: FADE.in, easing: 'ease-out' }),
      F.pulse({ pod: 'client' }),
      F.segment({ from: LANE[0], to: LANE[1], delay: BEAT.afterPulse, name: 'send' }),
      F.light({ targets: ['dp'], at: 'send' }),
      F.route({ points: FAN_C, after: 'send', name: 'est' }),
      tag({ text: 'established', points: FAN_C, after: 'send', easing: 'ease-in-out', ...TAG_STRAIGHT }),
      F.pulse({ pod: 'podC', at: 'est', dim: true, from: OPACITY.terminating }),
      F.segment({ from: LANE[0], to: LANE[1], delay: BEAT.afterPulse + CONN_GAP, name: 'send2' }),
      F.route({ points: FAN_D, after: 'send2', name: 'giveD' }),
      tag({ text: 'new conn', points: FAN_D, after: 'send2', easing: 'ease-in-out', ...TAG_DOWN }),
      F.pulse({ pod: 'podD', at: 'giveD' }),
    ],
  },
  {
    id: 'gone',
    duration: 3400,
    narration: 'Pod web-c exits at 14s, well inside the 30s grace period, so SIGKILL is never sent. Once the Pod reaches a terminal phase, its endpoint leaves the slice and the Pod object is removed. Pods web-a and web-d carry the Service on, and no request was dropped.',
    chips: COND_GONE,
    wires: { epHdr: EP_GONE },
    podSublabels: { podC: C_GONE, podD: D_READY },
    opacity: stage({ c: OPACITY.terminated, leg: 0, pre: 1, drain: 1 }),
    reducedLit: ['podCBox'],
    rewind: {
      chips: COND_TERM, wires: { epHdr: EP_HDR }, podSublabels: { podC: C_TERM },
      opacity: { podC: OPACITY.terminating, legC: 1 },
    },
    flow: [
      F.pulse({ pod: 'podC', dim: true, from: OPACITY.terminating }),
      F.fade({ target: 'podC', from: OPACITY.terminating, to: OPACITY.terminated, dur: FADE.out, delay: 900, fill: 'forwards', easing: 'ease-in' }),
      F.fade({ target: 'legC', from: 1, to: 0, dur: FADE.out, delay: 900, fill: 'forwards', easing: 'ease-in' }),
      F.set({ delay: 1600, chips: COND_GONE, wires: { epHdr: EP_GONE }, podSublabels: { podC: C_GONE } }),
      F.light({ targets: ['slice', 'epReady', 'epServing', 'epTerm'], delay: 1600 }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
