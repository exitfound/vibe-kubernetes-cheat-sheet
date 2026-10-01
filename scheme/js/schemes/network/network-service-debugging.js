import { P, F, defineCard, strip, makeRidingLabel, BEAT, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS/network-service-debugging.md


// One flow row: client, Service, backend Pod, centred on FLOW_Y. The slice stands above the Service
// on CX, and the three links the card is about are relations hung off those four blocks.
const CX = 600;
const FLOW_Y = 350;                 // measured against the panel: the client Pod top must clear it
const BOX_W = 232, SVC_H = 80, SLICE_H = 80;   // both object boxes, the kubelet block of network-model
const SVC_L = CX - BOX_W / 2, SVC_R = CX + BOX_W / 2;     // 484 / 716
const SVC_TOP = FLOW_Y - SVC_H / 2, SVC_BOTTOM = FLOW_Y + SVC_H / 2;   // 310 / 390
const SLICE_Y = 60, SLICE_BOTTOM = SLICE_Y + SLICE_H;    // 140
const SLICE_MID = SLICE_Y + SLICE_H / 2;                 // 100: the readiness link leaves here

const POD_W = 210, POD_H = 120;
const CLIENT_X = 60, CLIENT_R = CLIENT_X + POD_W;        // 270
const POD_L = 1140 - POD_W, POD_CX = POD_L + POD_W / 2;  // 930 / 1035
const POD_TOP = FLOW_Y - POD_H / 2, POD_BOTTOM = FLOW_Y + POD_H / 2;  // 290 / 410
const POD_INNER = { dx: 20, dy: 34, w: POD_W - 40, h: 52 };

// The two lanes a ball rides, one hop each side of the Service, and the same arrays feed the wire
// and the ball (A-02).
const LANE_IN = [[CLIENT_R, FLOW_Y], [SVC_L, FLOW_Y]];
const LANE_OUT = [[SVC_R, FLOW_Y], [POD_L, FLOW_Y]];

// The three links. None carries traffic, so none takes an arrowhead (A-05, NET.A-04).
const SEL_Y = 470;                  // the selector link runs under the flow row, above the chip grid
const OWN_LINK = [[CX, SLICE_BOTTOM], [CX, SVC_TOP]];
const SEL_LINK = [[CX, SVC_BOTTOM], [CX, SEL_Y], [POD_CX, SEL_Y], [POD_CX, POD_BOTTOM]];
const READY_LINK = [[SVC_R, SLICE_MID], [POD_CX, SLICE_MID], [POD_CX, POD_TOP]];

// Chip grid, two rows by three: the top row is the empty-slice causes, the bottom row the port.
const CHIP_H = 34;
const CHIP = strip({ from: 70, to: 1130, count: 3, gap: 20 });   // 340 wide, mirrored about CX
const CHIP_W = CHIP.w, CHIP_X = [0, 1, 2].map(CHIP.x);
const ROW_A = 520, ROW_B = 566;

// The list order IS the append order, which is the z-order: blocks, then the lanes and relations,
// then the standing captions and the chips, then the packet layer with the ball and its tag on top.
export const SCENE = {
  'aria-label': 'A Service call that never reaches the app: the client resolves the Service name and sends to it, but the app in the Pod gets the call only while the selector matches the Pod labels, the Pod is Ready, unless the Service sets publishNotReadyAddresses, so the EndpointSlice serves it, and targetPort is the port the container listens on, and a named targetPort resolves to the port the Pod declares under that name',
  parts: [
    P.defs(),
    P.box({ key: 'slice', x: SVC_L, y: SLICE_Y, w: BOX_W, h: SLICE_H, label: 'EndpointSlice web-x9f2', sublabel: '1 serving endpoint' }),
    P.box({ key: 'svc', x: SVC_L, y: SVC_TOP, w: BOX_W, h: SVC_H, label: 'Service web', sublabel: 'selector app=web' }),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: CLIENT_X, y: POD_TOP, w: POD_W, h: POD_H,
      label: 'Client Pod', sublabel: '10.244.1.5',
      inner: { ...POD_INNER, label: 'app', sublabel: 'eth0' },
    }),
    P.pod({
      key: 'pod', innerKey: 'podBox', x: POD_L, y: POD_TOP, w: POD_W, h: POD_H,
      label: 'Pod web', sublabel: '10.244.2.7',
      inner: { ...POD_INNER, label: 'app', sublabel: 'listens :9376' },
    }),
    P.arrow({ key: 'inLane', from: LANE_IN[0], to: LANE_IN[1], dashed: true, dim: true }),
    P.arrow({ key: 'outLane', from: LANE_OUT[0], to: LANE_OUT[1], dashed: true, dim: true }),
    P.relation({ key: 'ownLink', points: OWN_LINK }),
    P.relation({ key: 'selLink', points: SEL_LINK }),
    P.relation({ key: 'readyLink', points: READY_LINK }),
    // Standing captions, true on every step: the name always resolves, and what each link means.
    P.tag({ x: CLIENT_X + POD_W / 2, y: POD_BOTTOM + 26, text: 'web resolves to 10.96.0.20' }),
    P.tag({ key: 'selCap', x: (CX + POD_CX) / 2, y: SEL_Y - 8, text: 'selector matches labels' }),
    P.tag({ key: 'readyCap', x: (SVC_R + POD_CX) / 2, y: SLICE_MID - 8, text: 'serves the Pod if Ready' }),
    P.chip({ key: 'labelsChip', x: CHIP_X[0], y: ROW_A, w: CHIP_W, h: CHIP_H, name: 'Pod labels', value: 'app=web' }),
    P.chip({ key: 'readyChip', x: CHIP_X[1], y: ROW_A, w: CHIP_W, h: CHIP_H, name: 'Pod Ready', value: 'True' }),
    P.chip({ key: 'servingChip', x: CHIP_X[2], y: ROW_A, w: CHIP_W, h: CHIP_H, name: 'serving', value: '10.244.2.7:9376' }),
    P.chip({ key: 'portChip', x: CHIP_X[0], y: ROW_B, w: CHIP_W, h: CHIP_H, name: 'port', value: '80' }),
    P.chip({ key: 'targetChip', x: CHIP_X[1], y: ROW_B, w: CHIP_W, h: CHIP_H, name: 'targetPort', value: '9376' }),
    P.chip({ key: 'listenChip', x: CHIP_X[2], y: ROW_B, w: CHIP_W, h: CHIP_H, name: 'container listens', value: '9376' }),
    P.packets(),
  ],
  reset: {
    keys: ['slice', 'svc', 'clientBox', 'podBox', 'labelsChip', 'readyChip', 'servingChip', 'portChip', 'targetChip', 'listenChip'],
    pods: ['client', 'pod'],
  },
};

// Every shade the card moves, stated in one place per step (A-16): the Pod, the lane into it, and
// the two links that break. A broken link drops to terminated and its caption dims with it, so the
// caption never states a link the picture shows as gone.
const capOf = (link) => (link < 1 ? OPACITY.notready : 1);
const stage = ({ pod = 1, out = 1, sel = 1, ready = 1 } = {}) => ({
  opacity: { pod, outLane: out, selLink: sel, selCap: capOf(sel), readyLink: ready, readyCap: capOf(ready) },
});
const HOLDS = stage();
const NO_MATCH = stage({ out: OPACITY.notready, sel: OPACITY.terminated, ready: OPACITY.terminated });
const NOT_READY = stage({ pod: OPACITY.notready, out: OPACITY.notready, ready: OPACITY.terminated });

const chips = (o = {}) => ({
  chips: {
    labelsChip: 'app=web', readyChip: 'True', servingChip: '10.244.2.7:9376',
    portChip: '80', targetChip: '9376', listenChip: '9376', ...o,
  },
});

// Every tag fades in with its ball and fades at arrival, lifted over the flow row so it never prints
// inside the block it leaves or lands on: its ink stands 4 above the Pod top, the taller block.
const tag = makeRidingLabel({ role: 'network', easing: 'linear', outMs: 170, hold: 0, emergeMode: true });
const TAG_DY = POD_TOP - FLOW_Y - 6;   // -66
// The dial every step opens with: the client pulses, then one hop into the Service, which lights.
const dial = [
  F.pulse({ pod: 'client' }),
  F.segment({ from: LANE_IN[0], to: LANE_IN[1], delay: BEAT.afterPulse, name: 'send', lights: ['svc'] }),
  F.tag({ fn: tag, text: 'dst 10.96.0.20:80', points: LANE_IN, delay: BEAT.afterPulse, easing: 'linear', dy: TAG_DY }),
];
const deliver = (dst) => [
  F.segment({ from: LANE_OUT[0], to: LANE_OUT[1], after: 'send', name: 'give' }),
  F.tag({ fn: tag, text: dst, points: LANE_OUT, after: 'send', easing: 'linear', dy: TAG_DY }),
];

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    ...chips(),
    sublabels: { slice: '1 serving endpoint', podBox: 'listens :9376' },
    ...HOLDS,
  },
  {
    id: 'healthy',
    duration: 3800,
    narration: 'The client calls web on port 80 and the name resolves to the ClusterIP 10.96.0.20. The call reaches the app only while three links hold: the selector matches the Pod labels, the Pod is Ready so the slice serves it, and targetPort 9376 is the port the container listens on.',
    ...chips(),
    sublabels: { slice: '1 serving endpoint', podBox: 'listens :9376' },
    ...HOLDS,
    lit: ['portChip', 'targetChip', 'listenChip'],
    reducedLit: ['podBox'],
    flow: [...dial, ...deliver('dst 10.244.2.7:9376'), F.pulse({ pod: 'pod', at: 'give' })],
  },
  {
    id: 'no-match',
    duration: 3000,
    narration: 'The Pod carries app=web-v2 while the selector still asks for app=web. Nothing matches, so the Pod is not listed even though it is Ready, and the EndpointSlice holds no endpoints at all. The name still resolves and the client still sends, but with nothing behind the Service the call never reaches a Pod.',
    ...chips({ labelsChip: 'app=web-v2', servingChip: 'none' }),
    sublabels: { slice: 'no endpoints', podBox: 'listens :9376' },
    ...NO_MATCH,
    lit: ['slice', 'labelsChip', 'servingChip'],
    reducedLit: ['clientBox'],
    flow: dial,
  },
  {
    id: 'not-ready',
    duration: 3000,
    narration: 'The labels match again, but the Pod is not Ready, for example because its readiness probe fails. The slice still lists it, marked not ready, so no endpoint is serving and the call never reaches a Pod, unless the Service sets publishNotReadyAddresses, which marks every endpoint ready.',
    ...chips({ readyChip: 'False', servingChip: 'none' }),
    sublabels: { slice: '1 endpoint, not ready', podBox: 'listens :9376' },
    ...NOT_READY,
    lit: ['slice', 'readyChip', 'servingChip'],
    reducedLit: ['clientBox'],
    flow: dial,
  },
  {
    id: 'wrong-port',
    duration: 3400,
    narration: 'Now the Pod is Ready and the slice serves 10.244.2.7:9376, so both empty-slice checks pass. But the container listens on 8080 while targetPort still says 9376. A numeric targetPort goes into the endpoint as it is, so the call reaches the Pod on a port where nothing listens.',
    ...chips({ listenChip: '8080' }),
    sublabels: { slice: '1 serving endpoint', podBox: 'listens :8080' },
    ...HOLDS,
    lit: ['targetChip', 'listenChip'],
    reducedLit: ['clientBox'],
    // The ball reaches the Pod edge and nothing answers: no pulse, and the inner box stays unlit.
    flow: [...dial, ...deliver('dst 10.244.2.7:9376')],
  },
  {
    id: 'named-port',
    duration: 3800,
    narration: 'Naming the port takes the number out of the Service. The targetPort becomes a port name, and the Pod declares containerPort 8080 under that name, so the endpoint resolves to 10.244.2.7:8080, where the container listens, and the call is served. If the port moves, only the Pod changes, and its declaration has to move with the process.',
    ...chips({ servingChip: '10.244.2.7:8080', targetChip: 'http', listenChip: '8080' }),
    sublabels: { slice: '1 serving endpoint', podBox: 'declares http :8080' },
    ...HOLDS,
    lit: ['servingChip', 'targetChip', 'listenChip'],
    reducedLit: ['podBox'],
    flow: [...dial, ...deliver('dst 10.244.2.7:8080'), F.pulse({ pod: 'pod', at: 'give' })],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
