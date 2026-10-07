import { P, F, defineCard, ladder, midX, WL, FADE, BEAT, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-graceful-shutdown.md

// A fork, not the A / B / C preset: one delete lands in two zones at once.
// The panel bound is measured for the longest narration here, a longer one invalidates it.

// The taps mirror about the spine, and NODE_W alone keeps the content centre on 630 (L-13).
const LZ_W = 232, NODE_W = 352, CORRIDOR = 180;
const TAP_DX = (CORRIDOR + LZ_W / 2 + NODE_W / 2) / 2;
const LZ_CX = WL.SPINE_X - TAP_DX, RZ_CX = WL.SPINE_X + TAP_DX;
const NODE_X = RZ_CX - NODE_W / 2, NODE_R = NODE_X + NODE_W;

// The API sits on CX because both fork legs leave its bottom face (WL.L-07).
const API_W = 232, API_X = WL.CX - API_W / 2, API_R = API_X + API_W;
const ETCD_W = 140, ETCD_X = NODE_R - ETCD_W;
const ETCD_Y = WL.TOP_Y - 10, ETCD_H = WL.BOX_H + 20;    // 30..130, the cylinder overhang
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
// One lane, no pair: nothing this card narrates ever comes back from the store (WL.A-01).
const WRITE = [[API_R, TOP_CY], [ETCD_X, TOP_CY]];
// Ends 8 short of the store: the write label is wider than the gap.
const WIRE_TOP_X = ETCD_X - 8, WIRE_TOP_Y = WL.TOP_Y - 12;

// The trunk to a bus, then one tap per zone, equal because both watchers see one write at once.
const BUS_Y = 300;
const ZONE_Y = 330;                                      // the top edge of both zones
const LZ_X = LZ_CX - LZ_W / 2;
const FORK_L = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, BUS_Y], [LZ_CX, BUS_Y], [LZ_CX, ZONE_Y]];
const FORK_R = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, BUS_Y], [RZ_CX, BUS_Y], [RZ_CX, ZONE_Y]];
const REPORT_UP = [...FORK_R].reverse();
const WIRE_FORK_X = WL.SPINE_X + 12, WIRE_FORK_Y = midX(WL.TOP_BOTTOM, BUS_Y) + 4;

// Left zone: two control-plane blocks on the tap, then the chip column (L-03).
const LZ_H = WL.BOX_H;
const CTRL_Y = ZONE_Y;
// kube-proxy is centred on the frame centre line so the traffic lane meets its left face midpoint (L-11).
const NODE_Y = ZONE_Y, NODE_H = 294;
const NODE_CY = NODE_Y + NODE_H / 2;
const KP_Y = NODE_CY - LZ_H / 2;
const LINK = [[LZ_CX, CTRL_Y + LZ_H], [LZ_CX, KP_Y]];    // 27 units, the slice reaching kube-proxy
const WIRE_LINK_X = LZ_CX + 12, WIRE_LINK_Y = midX(CTRL_Y + LZ_H, KP_Y) + 4;
const TRAFFIC = [[LZ_X + LZ_W, NODE_CY], [NODE_X, NODE_CY]];
const WIRE_TRAFFIC_X = midX(LZ_X + LZ_W, NODE_X), WIRE_TRAFFIC_Y = NODE_CY - 12;
// 344 is the floor the widest chip pair sets.
const CHIP_W = 344, CHIP_X = LZ_CX - CHIP_W / 2;
const CHIPS_TOP = KP_Y + LZ_H + 16;
const CHIP_Y = ladder({ y: CHIPS_TOP, rowH: WL.CHIP_H, gap: 8 });

// Right zone: the Kubelet inside the Node frame, the Pod under it on the tap line.
const KUBE_W = 232, KUBE_H = WL.BOX_H, KUBE_X = RZ_CX - KUBE_W / 2;
const KUBE_Y = NODE_Y + 34;
const POD_W = 312, POD_H = 122, POD_X = RZ_CX - POD_W / 2;
const POD_Y = KUBE_Y + KUBE_H + 46;
const CONT_W = 272, CONT_H = 64, CONT_X = RZ_CX - CONT_W / 2;
const CONT_DY = 30;
const SIGNAL = [[RZ_CX, KUBE_Y + KUBE_H], [RZ_CX, POD_Y]];
// 6 off the lane, not 12: the widest signal label barely fits the frame.
const WIRE_SIGNAL_X = RZ_CX + 6, WIRE_SIGNAL_Y = midX(KUBE_Y + KUBE_H, POD_Y) + 4;

// The list order is the z-order: every block draws above the ball.
export const SCENE = {
  'aria-label': 'Graceful Pod shutdown: one delete stamps deletionTimestamp on the stored object and two tracks start at once, the EndpointSlice controller marking the endpoint terminating so kube-proxy stops choosing it while other endpoints stay ready, and the Kubelet running preStop and having the runtime send the stop signal, then SIGKILL if a container outlives the 30s grace window, before the object leaves ETCD',
  parts: [
    P.defs(),
    P.lane({ key: 'forkLeft', points: FORK_L, dim: true, dashed: true, role: 'cluster' }),
    // The right tap is drawn twice, down for the order and up for the report.
    P.lane({ key: 'forkRight', points: FORK_R, dim: true, dashed: true, role: 'cluster' }),
    // Two opposite dash patterns on one segment read as solid, so forkLeft and reportUp never show together.
    P.lane({ key: 'reportUp', points: REPORT_UP, dim: true, dashed: true, role: 'cluster', opacity: 0 }),
    P.arrow({ from: LINK[0], to: LINK[1], dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ from: WRITE[0], to: WRITE[1], dim: true, dashed: true, role: 'cluster' }),
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    // Both lanes that enter or cross the frame sit ABOVE its translucent fill, or it greys them.
    P.arrow({ key: 'trafficLane', from: TRAFFIC[0], to: TRAFFIC[1], dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ key: 'signalLane', from: SIGNAL[0], to: SIGNAL[1], dim: true, dashed: true, role: 'cluster' }),
    P.wire({ key: 'wireTop', x: WIRE_TOP_X, y: WIRE_TOP_Y, anchor: 'end' }),
    P.wire({ key: 'wireFork', x: WIRE_FORK_X, y: WIRE_FORK_Y, anchor: 'start' }),
    P.wire({ key: 'wireLink', x: WIRE_LINK_X, y: WIRE_LINK_Y, anchor: 'start' }),
    P.wire({ key: 'wireTraffic', x: WIRE_TRAFFIC_X, y: WIRE_TRAFFIC_Y }),
    P.wire({ key: 'wireSignal', x: WIRE_SIGNAL_X, y: WIRE_SIGNAL_Y, anchor: 'start' }),
    P.chip({ key: 'epChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'endpoint 10.244.1.7', value: 'ready=true' }),
    P.chip({ key: 'graceChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'grace window', value: '30s left' }),
    P.packets(),
    P.box({ key: 'controller', x: LZ_X, y: CTRL_Y, w: LZ_W, h: LZ_H, label: 'EndpointSlice controller', sublabel: 'marks the endpoint', role: 'cluster' }),
    P.box({ key: 'kubeproxy', x: LZ_X, y: KP_Y, w: LZ_W, h: LZ_H, label: 'kube-proxy', sublabel: 'Service web · rules, conntrack', role: 'cluster' }),
    P.pod({
      key: 'podGroup', id: 'podGroup',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'Running · serving', containers: 0,
      // No build-time opacity: every step pins the Pod's own. Signals target PID 1, the inner box.
      inner: { dx: CONT_X - POD_X, dy: CONT_DY, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'container · PID 1' },
    }),
    P.box({ key: 'kubelet', x: KUBE_X, y: KUBE_Y, w: KUBE_W, h: KUBE_H, label: 'Kubelet', sublabel: 'local shutdown', role: 'cluster' }),
    P.box({ key: 'api', x: API_X, y: WL.TOP_Y, w: API_W, h: WL.BOX_H, label: 'API', sublabel: 'stamps first, removes last', role: 'cluster' }),
    P.cylinder({ key: 'etcd', x: ETCD_X, y: ETCD_Y, w: ETCD_W, h: ETCD_H, label: 'ETCD', role: 'cluster' }),
  ],
  reset: {
    keys: ['api', 'etcd', 'controller', 'kubeproxy', 'kubelet', 'epChip', 'graceChip'],
    pods: ['podGroup'],
  },
};

const EP_READY = 'ready=true', EP_TERM = 'terminating · ready=false', EP_GONE = 'removed';
const G30 = '30s left', G25 = '25s left';

// The whole opacity field from one place (A-16). Only `gone` winds the report lane in, in `rewind`.
const stage = ({ pod = 1, traffic = 1, signal = 1 } = {}) => ({
  podGroup: pod, trafficLane: traffic, signalLane: signal,
  forkLeft: 1, forkRight: 1, reportUp: 0,
});

const WRITE_HOP = { from: API_R, to: ETCD_X, y: TOP_CY };
const signal = (p = {}) => F.segment({ from: SIGNAL[0], to: SIGNAL[1], ...p });
const traffic = (p = {}) => F.segment({ from: TRAFFIC[0], to: TRAFFIC[1], ...p });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { epChip: EP_READY, graceChip: G30 },
    opacity: stage(),
    podSublabels: { podGroup: 'Running · serving' },
  },
  {
    id: 'delete',
    duration: 4600,
    narration: 'A DELETE for Pod web-0 reaches the API, which removes nothing: it stamps deletionTimestamp on the stored object and records the 30s grace period beside it. Two watchers see that one write and start at once, the EndpointSlice controller and the Kubelet on Node-1. From here on kubectl prints Terminating while status.phase stays Running, and new connections are still reaching the Pod.',
    chips: { epChip: EP_READY, graceChip: G30 },
    wires: { wireTop: 'write · deletionTimestamp, grace 30s', wireFork: 'watch: Pod web-0 is terminating', wireTraffic: 'new connection' },
    opacity: stage(),
    podSublabels: { podGroup: 'Terminating · phase Running' },
    // Two senders with no earlier arrival, so both are lit at entry and wait BEAT.lead (M-18, M-18a).
    lit: ['api', 'kubeproxy'],
    rewind: { podSublabels: { podGroup: 'Running · serving' } },
    flow: [
      traffic({ delay: BEAT.lead, name: 'conn' }),
      F.pulse({ pod: 'podGroup', at: 'conn' }),
      F.top({ ...WRITE_HOP, delay: BEAT.lead, name: 'write', lights: ['etcd'] }),
      F.set({ at: 'write', podSublabels: { podGroup: 'Terminating · phase Running' } }),
      F.route({ points: FORK_L, after: 'write', lights: ['controller'] }),
      F.route({ points: FORK_R, after: 'write', lights: ['kubelet'] }),
    ],
  },
  {
    id: 'deregister',
    duration: 3600,
    narration: 'The EndpointSlice controller never waits for the Node. It marks the endpoint for 10.244.1.7 terminating, ready false and serving still true, and kube-proxy on every Node picks that up and stops choosing the address for new connections while the Service has other ready endpoints. Propagation takes real time, and established connections keep flowing on their conntrack entries.',
    chips: { epChip: EP_TERM, graceChip: G30 },
    wires: { wireLink: 'slice: terminating, ready=false', wireTraffic: 'established flows only' },
    // The traffic lane stays full weight: established flows still ride it.
    opacity: stage(),
    podSublabels: { podGroup: 'Terminating · phase Running' },
    lit: ['controller', 'epChip'],
    rewind: { chips: { epChip: EP_READY } },
    flow: [
      F.segment({ from: LINK[0], to: LINK[1], delay: BEAT.lead, name: 'slice', lights: ['kubeproxy'] }),
      F.set({ at: 'slice', chips: { epChip: EP_TERM } }),
      traffic({ after: 'slice', name: 'est' }),
      F.pulse({ pod: 'podGroup', at: 'est' }),
    ],
  },
  {
    id: 'prestop',
    duration: 4800,
    narration: 'The Node side runs the preStop hook first, before any signal is sent. A short sleep here is the usual way to line the two tracks up: it holds PID 1 alive while kube-proxy finishes deregistering the endpoint, and in-flight requests complete during the pause. The five seconds the hook takes come out of the same 30s window.',
    chips: { epChip: EP_TERM, graceChip: G25 },
    wires: { wireSignal: 'exec preStop · sleep 5', wireTraffic: 'in-flight request' },
    opacity: stage(),
    podSublabels: { podGroup: 'Terminating · preStop running' },
    // kube-proxy carries the in-flight flow that lands mid-step, so it stands lit (M-18a).
    lit: ['kubelet', 'kubeproxy', 'graceChip'],
    rewind: { chips: { graceChip: G30 }, podSublabels: { podGroup: 'Terminating · phase Running' } },
    flow: [
      signal({ delay: BEAT.lead, name: 'hook' }),
      F.pulse({ pod: 'podGroup', at: 'hook' }),
      F.set({ at: 'hook', podSublabels: { podGroup: 'Terminating · preStop running' } }),
      traffic({ at: 'hook', plus: BEAT.afterPulse, name: 'inflight' }),
      F.pulse({ pod: 'podGroup', at: 'inflight' }),
      F.set({ at: 'inflight', chips: { graceChip: G25 } }),
    ],
  },
  {
    id: 'sigterm',
    duration: 3200,
    narration: 'Once preStop returns, the Kubelet asks the runtime to deliver the stop signal to PID 1, SIGTERM unless the image sets a different STOPSIGNAL. A well-behaved app stops accepting work, drains what it still holds, closes its connections and pools and exits on its own, usually well inside the window. The timer keeps running through all of it.',
    chips: { epChip: EP_TERM, graceChip: G25 },
    wires: { wireSignal: 'SIGTERM to PID 1' },
    opacity: stage(),
    podSublabels: { podGroup: 'Terminating · PID 1 draining' },
    lit: ['kubelet'],
    rewind: { podSublabels: { podGroup: 'Terminating · phase Running' } },
    flow: [
      signal({ delay: BEAT.lead, name: 'term' }),
      F.pulse({ pod: 'podGroup', at: 'term' }),
      F.set({ at: 'term', podSublabels: { podGroup: 'Terminating · PID 1 draining' } }),
    ],
  },
  {
    id: 'expiry',
    duration: 3800,
    narration: 'If a container is still running when the window reaches 0, the runtime sends SIGKILL to every process still alive in any container of the Pod, not just to PID 1. Whatever the app was still doing is lost, which is why the window has to cover the preStop pause plus the real drain time, and why a hook that outlives the window is cut short after a 2s extension, not waited for.',
    chips: { epChip: EP_TERM, graceChip: '0s · expired' },
    wires: { wireSignal: 'if alive at 0s: SIGKILL' },
    // Killed: the Pod and both lanes ending on it drop to the terminal shade (A-13).
    opacity: stage({ pod: OPACITY.terminated, traffic: OPACITY.terminated, signal: OPACITY.terminated }),
    podSublabels: { podGroup: 'killed · exit non-zero' },
    lit: ['kubelet', 'graceChip'],
    rewind: { opacity: { podGroup: 1, trafficLane: 1, signalLane: 1 }, podSublabels: { podGroup: 'Terminating · PID 1 draining' } },
    flow: [
      signal({ delay: BEAT.lead, name: 'kill' }),
    // The blink first, the fade one beat later (M-08).
      F.pulse({ pod: 'podGroup', at: 'kill' }),
      F.fade({ target: 'podGroup', from: 1, to: OPACITY.terminated, dur: FADE.out, at: 'kill', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'trafficLane', from: 1, to: OPACITY.terminated, dur: FADE.out, at: 'kill', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'signalLane', from: 1, to: OPACITY.terminated, dur: FADE.out, at: 'kill', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
      F.set({ at: 'kill', plus: BEAT.afterPulse, podSublabels: { podGroup: 'killed · exit non-zero' } }),
    ],
  },
  {
    id: 'gone',
    duration: 5600,
    narration: 'Either way, once every container has stopped the Kubelet sets the terminal phase, Failed or Succeeded, and asks the API to delete the object with grace 0. The API removes it from ETCD and kubectl no longer finds web-0. The EndpointSlice controller drops the endpoint from the slice, as it does for any terminal Pod, and kube-proxy forgets the address.',
    chips: { epChip: EP_GONE, graceChip: 'closed' },
    wires: { wireTop: 'remove · object gone', wireFork: 'terminal phase · DELETE grace 0', wireLink: 'endpoint removed' },
    // The step ends with the fork pointing down again: the report has landed by then.
    opacity: stage({ pod: OPACITY.terminated, traffic: OPACITY.terminated, signal: OPACITY.terminated }),
    podSublabels: { podGroup: 'object removed' },
    lit: ['kubelet', 'epChip', 'graceChip'],
    // The right tap opens pointing up for the report and turns back down once it lands.
    rewind: {
      chips: { epChip: EP_TERM, graceChip: '0s · expired' }, opacity: { forkLeft: 0, forkRight: 0, reportUp: 1 },
      podSublabels: { podGroup: 'killed · exit non-zero' },
    },
    flow: [
      F.route({ points: REPORT_UP, delay: BEAT.lead, name: 'report', lights: ['api'] }),
      F.set({ at: 'report', chips: { graceChip: 'closed' } }),
      F.fade({ target: 'reportUp', from: 1, to: 0, dur: FADE.out, at: 'report', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'forkLeft', from: 0, to: 1, dur: FADE.in, at: 'report', fill: 'both', easing: 'ease-out' }),
      F.fade({ target: 'forkRight', from: 0, to: 1, dur: FADE.in, at: 'report', fill: 'both', easing: 'ease-out' }),
      F.top({ ...WRITE_HOP, after: 'report', name: 'del', lights: ['etcd'] }),
      F.set({ at: 'del', podSublabels: { podGroup: 'object removed' } }),
      F.route({ points: FORK_L, after: 'del', name: 'watchGone', lights: ['controller'] }),
      F.segment({ from: LINK[0], to: LINK[1], after: 'watchGone', name: 'drop', lights: ['kubeproxy'] }),
      F.set({ at: 'drop', chips: { epChip: EP_GONE } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
