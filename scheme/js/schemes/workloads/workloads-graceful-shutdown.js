import { P, F, defineCard, laneY, midX, WL, LAYOUT, FADE, BEAT, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS.md#workloads-graceful-shutdown

// Layout C of the Workloads canon (WL): full-width chip strip, three per row.
// Panel worst case x<=397, y<=280; a longer narration invalidates that measurement.
const TOP1_X = 420, TOP1_W = 220;
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = 220;
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);
const WIRE_Y = WL.TOP_Y - 12;                            // above the actor row, off the spine

// LAYOUT.C of the kit: the ladder takes the RIGHT column, because C has no free column at all.
const LAD_X = LAYOUT.C.ladder.x, LAD_W = LAYOUT.C.ladder.w;    // 660..1140, the pipeline
const LAD_Y = 140;                                       // 6 rows -> 140..382

const NODE_Y = 394, NODE_H = 134;                        // 394..528, below the ladder
const POD_W = 460, POD_H = 106, POD_TOP_PAD = 20;
const POD_X = WL.CX - POD_W / 2;                         // 370..830, centred on CX
const POD_Y = NODE_Y + POD_TOP_PAD;                      // 414..520, clear of the frame label
const CONT_W = 300, CONT_X = WL.CX - CONT_W / 2, CONT_H = 64;
const POD_INNER = { dx: CONT_X - POD_X, dy: 28, w: CONT_W, h: CONT_H };

// Chips as a full-width bottom strip, three per row so name and value never collide. Five chips
// means a row of three and a row of two, the short row centred on CX (WL.L-05: never four).
const CHIP_PER_ROW = 3, CHIP_GAP = 14;
const CHIP_W = (WL.W - CHIP_GAP * (CHIP_PER_ROW - 1)) / CHIP_PER_ROW;   // 350.67
const CHIP_ROW_H = WL.CHIP_H + 8;
const CHIPS_TOP = 548;                                   // two rows -> 548..624
const CHIP_ROW_N = i => (i < CHIP_PER_ROW ? CHIP_PER_ROW : 2);
const CHIP_X = i => {
  const col = i % CHIP_PER_ROW, n = CHIP_ROW_N(i);
  const rowW = n * CHIP_W + (n - 1) * CHIP_GAP;
  return WL.CX - rowW / 2 + col * (CHIP_W + CHIP_GAP);
};
const CHIP_Y = i => CHIPS_TOP + Math.floor(i / CHIP_PER_ROW) * CHIP_ROW_H;

// The connector reaches the Pod itself, leaving the API box and not kubectl: the termination order
// is what the API sets in motion once it has stamped deletionTimestamp.
const TOP2_CX = TOP2_X + TOP2_W / 2;                     // 810
const JOG_Y = WL.TOP_BOTTOM + 20;                        // 140, below the boxes, above the ladder
const CONNECTOR_DOWN = [[TOP2_CX, WL.TOP_BOTTOM], [TOP2_CX, JOG_Y], [WL.SPINE_X, JOG_Y], [WL.SPINE_X, POD_Y]];
const CONNECTOR_UP   = [...CONNECTOR_DOWN].reverse();

// The list order IS the append order, so it is the z-order: the two corridors and the wire label
// first, then the chip strip, the packet layer, and chain / Node / Pod / actors above the ball.
export const SCENE = {
  'aria-label': 'Graceful Pod shutdown: deletionTimestamp, EndpointSlice marked terminating, preStop, SIGTERM, grace countdown, SIGKILL',
  parts: [
    P.defs(),
    P.arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // One corridor drawn twice, down for the termination order and up for the report. Exactly one
    // is visible per step, which is what the `corridor()` pair in every `opacity` block says.
    P.lane({ key: 'connectorDown', points: CONNECTOR_DOWN, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'connectorUp', points: CONNECTOR_UP, dim: true, dashed: true, role: 'cluster', opacity: 0 }),
    // WL.A-02: the single wire label sits ABOVE the actor row, clear of the connector below it.
    P.wire({ key: 'req', x: WIRE_X, y: WIRE_Y }),
    // State chips in the bottom strip, three then two.
    P.chip({ key: 'preStopChip', x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'preStop hook', value: 'idle' }),
    P.chip({ key: 'sigChip', x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'signal', value: 'none' }),
    P.chip({ key: 'graceChip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'grace remaining', value: '30s' }),
    P.chip({ key: 'statusChip', x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'pod status', value: 'Running' }),
    P.chip({ key: 'sliceChip', x: CHIP_X(4), y: CHIP_Y(4), w: CHIP_W, h: WL.CHIP_H, name: 'EndpointSlice', value: '[10.244.1.7]' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.chain({
      key: 'chain', x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP, role: 'cluster',
      items: [
        '1. running   ·  Pod IP serving traffic',
        '2. delete    ·  deletionTimestamp, endpoint ready=false',
        '3. preStop   ·  Kubelet runs hook synchronously',
        '4. SIGTERM   ·  signal PID 1, drain in-flight work',
        '5. countdown ·  terminationGracePeriodSeconds ticks',
        '6. SIGKILL   ·  force-kill, remove Pod from etcd',
      ],
    }),
    P.node({ key: 'nodeEl', x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' }),
    P.pod({
      key: 'podGroup', id: 'podGroup',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      // No build-time opacity: every step pins the Pod's own. Signals target PID 1, the inner box.
      inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: 'container: PID 1' },
    }),
    P.box({ key: 'kubectl', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'kubectl', sublabel: 'delete pod app-pod', role: 'cluster' }),
    P.box({ key: 'api', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'sets deletionTimestamp', role: 'cluster' }),
  ],
  reset: {
    keys: ['kubectl', 'api', 'preStopChip', 'sigChip', 'graceChip', 'statusChip', 'sliceChip'],
    pods: ['podGroup'],
  },
};

// Chip values that recur once the delete lands, named once so a five-key `chips` block stays
// one readable line.
const TERMINATING = 'Terminating', SLICE_NR = '[10.244.1.7] ready=false';

// setConnectorDir as FIELDS: the pair is written in one place, so no step can leave both corridors
// on or neither. Key order is the order the helper wrote them in.
const corridor = (dir) => ({ connectorDown: dir === 'up' ? 0 : 1, connectorUp: dir === 'up' ? 1 : 0 });

export const STEPS_SPEC = [
  {
    id: 'running',
    duration: 1500,
    chips: { preStopChip: 'idle', sigChip: 'none', graceChip: '30s', statusChip: 'Running', sliceChip: '[10.244.1.7]' },
    // Serving traffic: full opacity. Nothing is lit at step 0.
    opacity: { podGroup: 1, ...corridor('down') },
    chain: 0,
  },
  {
    id: 'delete',
    duration: 3800,
    narration: 'A kubectl delete reaches the API, which stamps metadata.deletionTimestamp on the Pod. That field is what makes kubectl report the Pod as Terminating, while status.phase itself stays Running. In parallel the EndpointSlice controller marks 10.244.1.7 terminating with ready false rather than removing it, so kube-proxy stops sending new connections while the Kubelet termination sequence begins.',
    chips: { preStopChip: 'idle', sigChip: 'none', graceChip: '30s', statusChip: TERMINATING, sliceChip: SLICE_NR },
    wires: { req: 'DELETE /api/v1/.../app-pod' },
    opacity: { podGroup: 1, ...corridor('down') },
    lit: ['kubectl', 'statusChip', 'sliceChip'],
    chain: 1,
    flow: [
      // DELETE hits the apiserver, then the termination order travels down and the Pod pulses on
      // arrival. The API RECEIVES the DELETE, so it lights on arrival rather than at entry.
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'req', lights: ['api'] }),
      // The stamped field goes straight back on the answer lane, which is what makes kubectl REPORT
      // Terminating. kubectl sources the round trip, so it does not light again on arrival.
      F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, after: 'req' }),
      F.route({ points: CONNECTOR_DOWN, after: 'req', name: 'order' }),
      F.pulse({ pod: 'podGroup', at: 'order' }),
    ],
  },
  {
    id: 'prestop',
    duration: 2000,
    narration: 'The Kubelet runs the container preStop hook synchronously, before any signal is sent. A common pattern is a short sleep, which holds the process alive long enough for load balancers and kube-proxy to finish deregistering the endpoint. New requests stop arriving while in-flight ones still complete.',
    chips: { preStopChip: 'exec: sleep 5', sigChip: 'none', graceChip: '30s', statusChip: TERMINATING, sliceChip: SLICE_NR },
    opacity: { podGroup: 1, ...corridor('down') },
    lit: ['preStopChip'],
    chain: 2,
    // The hook runs inside the container: the Pod pulses (the hook chip lights via
    // the static highlight only, no chip pulse).
    flow: [F.pulse({ pod: 'podGroup' })],
  },
  {
    id: 'sigterm',
    duration: 2000,
    narration: 'Once preStop returns, the Kubelet asks the runtime to send SIGTERM to PID 1. A well-behaved app traps this signal, stops accepting new work, drains in-flight requests and closes its connections and pools. The time the preStop hook consumed is already gone from the same grace budget.',
    chips: { preStopChip: 'completed', sigChip: 'SIGTERM', graceChip: '25s', statusChip: TERMINATING, sliceChip: SLICE_NR },
    opacity: { podGroup: 1, ...corridor('down') },
    lit: ['preStopChip', 'sigChip', 'graceChip'],
    chain: 3,
    // SIGTERM lands on PID 1: the Pod pulses (the signal chips light via the
    // static highlight only, no chip pulse).
    flow: [F.pulse({ pod: 'podGroup' })],
  },
  {
    id: 'countdown',
    duration: 2100,
    narration: 'The terminationGracePeriodSeconds, 30 by default, counts down from the moment of deletion. The preStop hook and the SIGTERM drain both spend this single shared budget. Most applications exit well before the timer reaches zero, and the Kubelet then proceeds straight to cleanup.',
    chips: { preStopChip: 'completed', sigChip: 'SIGTERM', graceChip: '6s', statusChip: TERMINATING, sliceChip: SLICE_NR },
    opacity: { podGroup: 1, ...corridor('down') },
    // Pure timer step, nothing travels and the Pod is untouched: the ticking grace
    // budget shows via the static highlight only (no chip pulse).
    lit: ['graceChip'],
    chain: 4,
  },
  {
    id: 'sigkill',
    duration: 3500,
    narration: 'If the container is still alive when the grace timer reaches 0, the runtime sends SIGKILL, which the kernel delivers unconditionally to PID 1. Once the process is gone the Kubelet reports the terminated container, and the API removes the Pod object from ETCD.',
    chips: { preStopChip: 'completed', sigChip: 'SIGKILL', graceChip: '0s · expired', statusChip: 'deleted', sliceChip: '[]' },
    wires: { req: 'Pod removed from etcd' },
    // Killed and purged: the whole Pod block drops to its faint terminal state.
    opacity: { podGroup: OPACITY.terminated, ...corridor('up') },
    lit: ['sliceChip', 'sigChip', 'statusChip', 'graceChip'],
    chain: 5,
    flow: [
      F.pulse({ pod: 'podGroup' }),
      F.fade({ target: 'podGroup', from: 1, to: OPACITY.terminated, dur: FADE.out, fill: 'both', easing: 'ease-in' }),
      // After the process is gone, the kubelet reports up to the apiserver.
      F.route({ points: CONNECTOR_UP, delay: BEAT.afterPulse, lights: ['api'] }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
