import { P, F, defineCard, ladder, BEAT, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS/network-service-and-endpointslice.md

// The Service, the slice frame and the controller are ONE column on CX, the axis the write lane, the
// Service relation and the watch trunk run on. The slice frame is sized by its rows, the boxes are 232.
const COL_X = 420, COL_W = 360;
const CX = COL_X + COL_W / 2;
const COL_R = COL_X + COL_W;                // the slice frame edge kube-proxy reads from
const BOX_W = 232, BOX_H = 80;              // the kubelet block of network-flat-pod-network
const BOX_X = CX - BOX_W / 2;
const BOX_R = BOX_X + BOX_W;

const SVC_Y = 36;
const SVC_BOTTOM = SVC_Y + BOX_H;

// The slice is a frame, a two-line header over three rows, standing exactly midway, so the relation
// and the write lane are one length.
const COL_GAP = 38;
const SLICE_Y = SVC_BOTTOM + COL_GAP, SLICE_PAD = 14;
const TITLE_Y = SLICE_Y + 22;               // title baseline
const BUDGET_Y = SLICE_Y + 40;              // port and count baseline
const EP_X = COL_X + SLICE_PAD, EP_W = COL_W - SLICE_PAD * 2, EP_H = 34;
const epY = ladder({ y: SLICE_Y + 52, rowH: EP_H, gap: 6 });
const SLICE_BOTTOM = epY(2) + EP_H + 12;
const SLICE_H = SLICE_BOTTOM - SLICE_Y;

// The controller writes UP into the slice frame across the lower gap.
const CTLR_TOP = SLICE_BOTTOM + COL_GAP;
const CTLR_BOTTOM = CTLR_TOP + BOX_H;
const WRITE_PATH = [[CX, CTLR_TOP], [CX, SLICE_BOTTOM]];

// kube-proxy reads the slice on the frame's own vertical centre, so the lane meets both faces square.
const READ_Y = SLICE_Y + SLICE_H / 2;
const KPROXY_LEFT = 860, KPROXY_TOP = READ_Y - BOX_H / 2;
const READ_PATH = [[COL_R, READ_Y], [KPROXY_LEFT, READ_Y]];

// Three Pods on one pitch, the middle one under CX. The comb bus joins all three to the controller.
const BUS_Y = CTLR_BOTTOM + 24;
const POD_Y = BUS_Y + 24, POD_W = 250, POD_H = 120;
const POD_PITCH = POD_W + 135;
const PODB_X = CX - POD_W / 2;
const POD_CX = [CX - POD_PITCH, CX, CX + POD_PITCH];
const POD_INNER = { dx: 20, dy: 28, w: POD_W - 40, h: 48, label: 'app', sublabel: 'eth0' };
// Pod B reports through the watch trunk, straight up from its top face to the controller.
const STATUS_PATH = [[CX, POD_Y], [CX, CTLR_BOTTOM]];

// On the trunk the tags stand right of the column boxes, so no face, bus or lane crosses the text,
// and the read tag rides over the kube-proxy top.
const tag = (p) => F.tag({ easing: 'linear', ...p });
const TAG_CHAR = 6.2;
const besideBoxes = (txt) => BOX_R + 8 + (txt.length * TAG_CHAR) / 2 - CX;
const WRITE_DY = 14;                        // ink ends under the slice frame on arrival
const WATCH_DY = BUS_Y - POD_Y - 6;         // ink starts over the comb bus
const READ_TAG = { dx: 8 + ('slice'.length * TAG_CHAR) / 2, dy: KPROXY_TOP - READ_Y - 6 };

const livePod = (key, x, ip) => P.pod({
  key, innerKey: `${key}Box`, x, y: POD_Y, w: POD_W, h: POD_H,
  label: 'Pod app=web', sublabel: ip, inner: POD_INNER,
});

export const SCENE = {
  'aria-label': 'Service and EndpointSlice: the EndpointSlice controller watches the three Pods matching the Service selector and writes one endpoint per Pod, an address and its ready condition, into EndpointSlice web-x9f2k, which states the port once and by default holds up to 100 endpoints. When a Pod keeps failing its readiness probe and turns Ready=False, the controller rewrites its endpoint to ready=false without restarting the container, and kube-proxy builds Service rules from the one endpoint still ready',
  parts: [
    P.defs(),
    P.box({ key: 'service', x: BOX_X, y: SVC_Y, w: BOX_W, h: BOX_H, label: 'Service web', sublabel: 'selector app=web · lists no Pods' }),
    P.box({ key: 'slice', x: COL_X, y: SLICE_Y, w: COL_W, h: SLICE_H }),
    P.tag({ x: CX, y: TITLE_Y, text: 'EndpointSlice web-x9f2k', cls: 'scheme-box-label' }),
    P.wire({ key: 'budget', x: CX, y: BUDGET_Y }),
    P.box({ key: 'kproxy', x: KPROXY_LEFT, y: KPROXY_TOP, w: BOX_W, h: BOX_H, label: 'kube-proxy', sublabel: 'reads the slice' }),
    P.box({ key: 'ctlr', x: BOX_X, y: CTLR_TOP, w: BOX_W, h: BOX_H, label: 'EndpointSlice controller', sublabel: 'watches Pods · writes the slice' }),
    livePod('podA', PODB_X - POD_PITCH, '10.244.1.5 · Ready=True'),
    livePod('podB', PODB_X, '10.244.2.7 · Ready=True'),
    livePod('podC', PODB_X + POD_PITCH, '10.244.3.9 · Ready=False'),
    P.chip({ key: 'ep1', x: EP_X, y: epY(0), w: EP_W, h: EP_H, name: 'endpoint', value: '' }),
    P.chip({ key: 'ep2', x: EP_X, y: epY(1), w: EP_W, h: EP_H, name: 'endpoint', value: '' }),
    P.chip({ key: 'ep3', x: EP_X, y: epY(2), w: EP_W, h: EP_H, name: 'endpoint', value: '' }),
    // The Service names its slice and the controller watches the Pod set: standing relationships.
    P.relation({ points: [[CX, SVC_BOTTOM], [CX, SLICE_Y]] }),
    // The comb stays a relation but at full stroke-opacity, or it reads fainter than the dashed arrows it meets.
    P.relation({
      points: [[POD_CX[0], POD_Y - 4], [POD_CX[0], BUS_Y], [POD_CX[2], BUS_Y], [POD_CX[2], POD_Y - 4]],
      tune: (el) => { el.style.strokeOpacity = '1'; },
    }),
    P.arrow({ from: STATUS_PATH[0], to: STATUS_PATH[1], dashed: true, dim: true }),
    P.arrow({ from: WRITE_PATH[0], to: WRITE_PATH[1], dashed: true, dim: true }),
    P.arrow({ from: READ_PATH[0], to: READ_PATH[1], dashed: true, dim: true }),
    P.packets(),
  ],
  reset: {
    keys: ['service', 'slice', 'ctlr', 'kproxy', 'ep1', 'ep2', 'ep3', 'podABox', 'podBBox', 'podCBox'],
    pods: ['podA', 'podB', 'podC'],
  },
};

// Which Pods read Ready=False, stated on every step: Pod C from the first frame, Pod B from readiness.
const C_DOWN = { podA: 1, podB: 1, podC: OPACITY.notready };
const B_DOWN = { podA: 1, podB: OPACITY.notready, podC: OPACITY.notready };

const EMPTY = '(empty)';
const EP1 = '10.244.1.5 · ready=true';
const EP2_UP = '10.244.2.7 · ready=true';
const EP2_DOWN = '10.244.2.7 · ready=false';
const EP3 = '10.244.3.9 · ready=false';
const NO_ROWS = { ep1: EMPTY, ep2: EMPTY, ep3: EMPTY };
const BUDGET_0 = '0 of 100 endpoints';
const BUDGET_3 = 'port 8080 · 3 of 100 endpoints';
const KP_READS = 'reads the slice';
const KP_RULES = 'rules for 10.244.1.5 only';
const B_UP_SUB = '10.244.2.7 · Ready=True';
const B_DOWN_SUB = '10.244.2.7 · Ready=False';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: NO_ROWS,
    wires: { budget: BUDGET_0 },
    sublabels: { kproxy: KP_READS },
    podSublabels: { podB: B_UP_SUB },
    opacity: C_DOWN,
  },
  {
    id: 'selector',
    duration: 2600,
    narration: 'The Service web holds a selector, app=web, and no list of backends. All three Pods carry that label, so all three match. Matching is not serving: 10.244.3.9 is failing its readiness probe, so its Ready condition is False.',
    chips: NO_ROWS,
    wires: { budget: BUDGET_0 },
    sublabels: { kproxy: KP_READS },
    podSublabels: { podB: B_UP_SUB },
    opacity: C_DOWN,
    lit: ['service'],
    // The animated path says all three MATCHED by pulsing them, which no cue names.
    reducedLit: ['podABox', 'podBBox', 'podCBox'],
    flow: [
      F.pulse({ pod: 'podA' }),
      F.pulse({ pod: 'podB' }),
      F.pulse({ pod: 'podC', dim: true, from: OPACITY.notready }),
    ],
  },
  {
    id: 'reconcile',
    duration: 3400,
    narration: 'The EndpointSlice controller watches every matching Pod and writes one endpoint per Pod with an IP: its address and conditions, with the port stated once for the slice. 10.244.3.9 is listed with ready=false, so it stays out of the serving set. By default a slice holds up to 100 endpoints, and a bigger Service gets more slices.',
    chips: { ep1: EP1, ep2: EP2_UP, ep3: EP3 },
    wires: { budget: BUDGET_3 },
    sublabels: { kproxy: KP_READS },
    podSublabels: { podB: B_UP_SUB },
    opacity: C_DOWN,
    lit: ['ctlr'],
    reducedLit: ['podABox', 'podBBox', 'podCBox'],
    // One write fills the slice: the rows and the count hold empty until the ball lands.
    rewind: { chips: NO_ROWS, wires: { budget: BUDGET_0 } },
    flow: [
      F.pulse({ pod: 'podA' }),
      F.pulse({ pod: 'podB' }),
      F.pulse({ pod: 'podC', dim: true, from: OPACITY.notready }),
      F.segment({ from: WRITE_PATH[0], to: WRITE_PATH[1], delay: BEAT.afterPulse, name: 'write' }),
      tag({ text: '3 endpoints', points: WRITE_PATH, delay: BEAT.afterPulse, dx: besideBoxes('3 endpoints'), dy: WRITE_DY }),
      F.light({ targets: ['slice', 'ep1', 'ep2', 'ep3'], at: 'write' }),
      F.set({ at: 'write', chips: { ep1: EP1, ep2: EP2_UP, ep3: EP3 }, wires: { budget: BUDGET_3 } }),
    ],
  },
  {
    id: 'readiness',
    duration: 3600,
    narration: 'Readiness, not liveness, decides who serves. After 3 failed readiness probes in a row, the failureThreshold default, the Kubelet sets the Ready condition of 10.244.2.7 to False, and the controller sees that through its watch. It rewrites the endpoint to ready=false. The container is not restarted, and one passing probe by default turns the Pod and its endpoint ready again.',
    chips: { ep1: EP1, ep2: EP2_DOWN, ep3: EP3 },
    wires: { budget: BUDGET_3 },
    sublabels: { kproxy: KP_READS },
    podSublabels: { podB: B_DOWN_SUB },
    opacity: B_DOWN,
    reducedLit: ['podBBox'],
    rewind: { chips: { ep2: EP2_UP } },
    // Pod B blinks from its dim shade, its status rides the watch trunk up, then the controller writes.
    flow: [
      F.pulse({ pod: 'podB', dim: true, from: OPACITY.notready }),
      F.segment({ from: STATUS_PATH[0], to: STATUS_PATH[1], delay: BEAT.afterPulse, name: 'watch' }),
      tag({ text: 'Ready=False', points: STATUS_PATH, delay: BEAT.afterPulse, dx: besideBoxes('Ready=False'), dy: WATCH_DY }),
      F.light({ targets: ['ctlr'], at: 'watch' }),
      F.segment({ from: WRITE_PATH[0], to: WRITE_PATH[1], after: 'watch', name: 'upd' }),
      tag({ text: EP2_DOWN, points: WRITE_PATH, after: 'watch', dx: besideBoxes(EP2_DOWN), dy: WRITE_DY }),
      F.light({ targets: ['ep2'], at: 'upd' }),
      F.set({ at: 'upd', chips: { ep2: EP2_DOWN } }),
    ],
  },
  {
    id: 'consume',
    duration: 2800,
    narration: 'The kube-proxy on every Node watches EndpointSlices, never the Pods. It writes Service rules for the ready endpoints, so traffic to web now reaches 10.244.1.5 alone. The slice is the contract between what is ready and where packets go.',
    chips: { ep1: EP1, ep2: EP2_DOWN, ep3: EP3 },
    wires: { budget: BUDGET_3 },
    sublabels: { kproxy: KP_RULES },
    podSublabels: { podB: B_DOWN_SUB },
    opacity: B_DOWN,
    lit: ['slice', 'ep1'],
    rewind: { sublabels: { kproxy: KP_READS } },
    flow: [
      F.segment({ from: READ_PATH[0], to: READ_PATH[1], delay: BEAT.lead, name: 'read' }),
      tag({ text: 'slice', points: READ_PATH, delay: BEAT.lead, ...READ_TAG }),
      F.light({ targets: ['kproxy'], at: 'read' }),
      F.set({ at: 'read', sublabels: { kproxy: KP_RULES } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
