import { P, F, defineCard, ladder, midX, WL, FADE, BEAT, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-graceful-shutdown.md

// A FORK, not the A / B / C column preset: one delete leaves the API and lands in two zones at
// once, the control plane that owns the endpoint on the left and the Node that owns the process on
// the right. Panel worst case x<=397, y<=280; a longer narration invalidates that measurement.

// Actor row: the API centred on CX, because both fork legs leave its bottom face (WL.L-07), and the
// store on the right wall in the slot cluster-cascading-deletion gives it, 10 taller than a box.
const API_W = 232, API_X = WL.CX - API_W / 2, API_R = API_X + API_W;   // 484..716
const ETCD_W = 140, ETCD_X = WL.R - ETCD_W;              // 1000..1140
const ETCD_Y = WL.TOP_Y - 10, ETCD_H = WL.BOX_H + 20;    // 30..130, the cylinder overhang
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;                  // 80
// One lane, no pair: nothing this card narrates ever comes back from the store (WL.A-01).
const WRITE = [[API_R, TOP_CY], [ETCD_X, TOP_CY]];
const WIRE_TOP_X = midX(API_R, ETCD_X), WIRE_TOP_Y = WL.TOP_Y - 12;   // 858 / 28, WL.A-02

// The fork: the trunk down the spine to a bus 20 under the deepest panel, then one tap into each
// zone. Both taps are the same 30 because both watchers see the same write at the same moment.
const BUS_Y = 300;
const ZONE_Y = 330;                                      // the top edge of both zones
const LZ_CX = WL.COL_L.x + WL.COL_L.w / 2;               // 300
const RZ_CX = WL.COL_R.x + WL.COL_R.w / 2;               // 900
const FORK_L = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, BUS_Y], [LZ_CX, BUS_Y], [LZ_CX, ZONE_Y]];
const FORK_R = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, BUS_Y], [RZ_CX, BUS_Y], [RZ_CX, ZONE_Y]];
const REPORT_UP = [...FORK_R].reverse();
const WIRE_FORK_X = WL.SPINE_X + 12, WIRE_FORK_Y = midX(WL.TOP_BOTTOM, BUS_Y) + 4;   // 612 / 214

// Left zone: the two control-plane blocks stacked on the tap, then the chip column under them.
// Below the panel bottom the whole column is legal (L-03), and 232 is the actor width.
const LZ_W = 232, LZ_X = LZ_CX - LZ_W / 2;               // 184..416
const LZ_H = 60;
const CTRL_Y = ZONE_Y;                                   // 330..390
// kube-proxy is centred on the frame's own centre line, so the traffic lane meets the frame on its
// left face midpoint (L-11) and runs level.
const NODE_Y = ZONE_Y, NODE_H = 268;                     // 330..598
const NODE_CY = NODE_Y + NODE_H / 2;                     // 464
const KP_Y = NODE_CY - LZ_H / 2;                         // 434..494
const LINK = [[LZ_CX, CTRL_Y + LZ_H], [LZ_CX, KP_Y]];    // 44 units, the slice reaching kube-proxy
const WIRE_LINK_X = LZ_CX + 12, WIRE_LINK_Y = midX(CTRL_Y + LZ_H, KP_Y) + 4;   // 312 / 416
const TRAFFIC = [[LZ_X + LZ_W, NODE_CY], [WL.COL_R.x, NODE_CY]];   // 416..660 on 464
const WIRE_TRAFFIC_X = midX(LZ_X + LZ_W, WL.COL_R.x), WIRE_TRAFFIC_Y = NODE_CY - 12;   // 538 / 452
const CHIP_X = WL.COL_L.x, CHIP_W = WL.COL_L.w;          // 60..540
const CHIPS_TOP = KP_Y + LZ_H + 16;                      // 510
const CHIP_Y = ladder({ y: CHIPS_TOP, rowH: WL.CHIP_H, gap: 8 });   // 510 / 552

// Right zone: the Node frame with the Kubelet INSIDE it, the way workloads-crashloopbackoff draws
// per-node state, and the Pod under it on the same centre line as the fork tap.
const KUBE_W = 240, KUBE_H = 52, KUBE_X = RZ_CX - KUBE_W / 2;   // 780..1020
const KUBE_Y = NODE_Y + 28;                              // 358..410, clear of the frame label
const POD_W = 400, POD_H = 122, POD_X = RZ_CX - POD_W / 2;      // 700..1100
const POD_Y = KUBE_Y + KUBE_H + 42;                      // 452..574
const CONT_W = 300, CONT_H = 64, CONT_X = RZ_CX - CONT_W / 2;   // 750..1050
const CONT_DY = 30;                                      // 482..546, sublabel baseline 12 under it
const SIGNAL = [[RZ_CX, KUBE_Y + KUBE_H], [RZ_CX, POD_Y]];       // 410..452, the signal path
const WIRE_SIGNAL_X = RZ_CX + 12, WIRE_SIGNAL_Y = midX(KUBE_Y + KUBE_H, POD_Y) + 4;   // 912 / 435

// The list order IS the append order, so it is the z-order: the fork, the link and the store lane
// first, the frame, then the two in-frame lanes above its fill, the wire labels, the chips, the
// packet layer, and every block above the ball.
export const SCENE = {
  'aria-label': 'Graceful Pod shutdown: one delete stamps deletionTimestamp on the stored object and two tracks start at once, the EndpointSlice controller marking the endpoint terminating so kube-proxy stops choosing it while other endpoints stay ready, and the Kubelet running preStop and having the runtime send the stop signal, then SIGKILL if a container outlives the 30s grace window, before the object leaves ETCD',
  parts: [
    P.defs(),
    P.lane({ key: 'forkLeft', points: FORK_L, dim: true, dashed: true, role: 'cluster' }),
    // The right tap is drawn twice, down for the order and up for the report, and the up copy
    // is visible only while the report climbs.
    P.lane({ key: 'forkRight', points: FORK_R, dim: true, dashed: true, role: 'cluster' }),
    // It runs the trunk in the OPPOSITE direction to forkLeft, and two dash patterns on one
    // segment fall on each other's gaps and read as a solid line, so the two are never visible
    // together: forkLeft is out while the report climbs and comes back once it has landed.
    P.lane({ key: 'reportUp', points: REPORT_UP, dim: true, dashed: true, role: 'cluster', opacity: 0 }),
    P.arrow({ from: LINK[0], to: LINK[1], dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ from: WRITE[0], to: WRITE[1], dim: true, dashed: true, role: 'cluster' }),
    P.node({ key: 'nodeEl', x: WL.COL_R.x, y: NODE_Y, w: WL.COL_R.w, h: NODE_H, label: 'Node-1' }),
    // Both lanes that enter or cross the frame sit ABOVE its translucent fill, or it greys them.
    P.arrow({ key: 'trafficLane', from: TRAFFIC[0], to: TRAFFIC[1], dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ key: 'signalLane', from: SIGNAL[0], to: SIGNAL[1], dim: true, dashed: true, role: 'cluster' }),
    P.wire({ key: 'wireTop', x: WIRE_TOP_X, y: WIRE_TOP_Y }),
    P.wire({ key: 'wireFork', x: WIRE_FORK_X, y: WIRE_FORK_Y, anchor: 'start' }),
    P.wire({ key: 'wireLink', x: WIRE_LINK_X, y: WIRE_LINK_Y, anchor: 'start' }),
    P.wire({ key: 'wireTraffic', x: WIRE_TRAFFIC_X, y: WIRE_TRAFFIC_Y }),
    P.wire({ key: 'wireSignal', x: WIRE_SIGNAL_X, y: WIRE_SIGNAL_Y, anchor: 'start' }),
    P.chip({ key: 'epChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'endpoint 10.244.1.7', value: 'ready=true' }),
    P.chip({ key: 'graceChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'grace window', value: '30s left' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
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

// Chip values that recur, named once so a chips block stays one readable line.
const EP_READY = 'ready=true', EP_TERM = 'terminating · ready=false', EP_GONE = 'removed';
const G30 = '30s left', G25 = '25s left';

// The whole opacity field from one place (A-16): the Pod, the two lanes whose shade follows it,
// and the fork resting in its down direction. Only `gone` winds the report lane in, in `rewind`.
const stage = ({ pod = 1, traffic = 1, signal = 1 } = {}) => ({
  podGroup: pod, trafficLane: traffic, signalLane: signal,
  forkLeft: 1, forkRight: 1, reportUp: 0,
});

// The top-row write, stated once. Both times it is the API acting on its own after a report has
// landed, so the caller decides the delay.
const WRITE_HOP = { from: API_R, to: ETCD_X, y: TOP_CY };
const signal = (p = {}) => F.segment({ from: SIGNAL[0], to: SIGNAL[1], ...p });
const traffic = (p = {}) => F.segment({ from: TRAFFIC[0], to: TRAFFIC[1], ...p });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { epChip: EP_READY, graceChip: G30 },
    // Serving: everything at full weight and nothing lit.
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
    // Two senders and no earlier arrival for either: kube-proxy is routing the connection that
    // lands first, the API acts on the delete after it, so both are lit at entry (M-18a).
    lit: ['api', 'kubeproxy'],
    rewind: { podSublabels: { podGroup: 'Running · serving' } },
    flow: [
      // A connection still lands on the Pod while the delete is in flight: the two tracks have
      // not started yet, and the Pod blinks on the arrival (M-16).
      traffic({ name: 'conn' }),
      F.pulse({ pod: 'podGroup', at: 'conn' }),
      // Self-initiated write, so it waits BEAT.lead. The stamp is what kubectl then reads.
      F.top({ ...WRITE_HOP, delay: BEAT.lead, name: 'write', lights: ['etcd'] }),
      F.set({ at: 'write', podSublabels: { podGroup: 'Terminating · phase Running' } }),
      // Both watch events leave the API after the write has landed, one per zone.
      F.route({ points: FORK_L, after: 'write', lights: ['controller'] }),
      F.route({ points: FORK_R, after: 'write', lights: ['kubelet'] }),
    ],
  },
  {
    id: 'deregister',
    duration: 3400,
    narration: 'The EndpointSlice controller never waits for the Node. It marks the endpoint for 10.244.1.7 terminating, ready false and serving still true, and kube-proxy on every Node picks that up and stops choosing the address for new connections while the Service has other ready endpoints. Propagation takes real time, and established connections keep flowing on their conntrack entries.',
    chips: { epChip: EP_TERM, graceChip: G30 },
    wires: { wireLink: 'slice: terminating, ready=false', wireTraffic: 'established flows only' },
    // The traffic lane keeps its full weight: established flows still ride it, and the label
    // beside it is what says no new connection does.
    opacity: stage(),
    podSublabels: { podGroup: 'Terminating · phase Running' },
    lit: ['controller', 'epChip'],
    // The chip reads its old value until the slice lands.
    rewind: { chips: { epChip: EP_READY } },
    flow: [
      F.segment({ from: LINK[0], to: LINK[1], delay: BEAT.lead, name: 'slice', lights: ['kubeproxy'] }),
      F.set({ at: 'slice', chips: { epChip: EP_TERM } }),
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
    // kube-proxy is still carrying the established flow that lands mid-step, so it stands lit
    // beside the Kubelet rather than sending from a dark box (M-18a).
    lit: ['kubelet', 'kubeproxy', 'graceChip'],
    rewind: { chips: { graceChip: G30 } },
    flow: [
      // Down-arrow: the hook lands first and the Pod blinks on arrival (M-16).
      signal({ delay: BEAT.lead, name: 'hook' }),
      F.pulse({ pod: 'podGroup', at: 'hook' }),
      // An established flow finishes while the hook holds the process, one blink later.
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
    flow: [
      signal({ delay: BEAT.lead, name: 'term' }),
      F.pulse({ pod: 'podGroup', at: 'term' }),
    ],
  },
  {
    id: 'expiry',
    duration: 3800,
    narration: 'If a container is still running when the window reaches 0, the runtime sends SIGKILL to every process still alive in any container of the Pod, not just to PID 1. Whatever the app was still doing is lost, which is why the window has to cover the preStop pause plus the real drain time, and why a hook that outlives the window is cut short after a 2s extension, not waited for.',
    chips: { epChip: EP_TERM, graceChip: '0s · expired' },
    wires: { wireSignal: 'if alive at 0s: SIGKILL' },
    // Killed: the Pod drops to its faint terminal shade and both lanes that end on it follow (A-13).
    opacity: stage({ pod: OPACITY.terminated, traffic: OPACITY.terminated, signal: OPACITY.terminated }),
    podSublabels: { podGroup: 'killed · exit non-zero' },
    lit: ['kubelet', 'graceChip'],
    rewind: { opacity: { podGroup: 1, trafficLane: 1, signalLane: 1 }, podSublabels: { podGroup: 'Terminating · PID 1 draining' } },
    flow: [
      signal({ delay: BEAT.lead, name: 'kill' }),
      // The blink comes first, the fade hangs off it one beat later (M-08).
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
    narration: 'Either way, once every container has stopped the Kubelet sets the terminal phase, Failed or Succeeded, and asks the API to delete the object with grace 0. The API removes it from ETCD, the EndpointSlice controller drops the endpoint from the slice, kube-proxy forgets the last rule for it, and kubectl no longer finds web-0.',
    chips: { epChip: EP_GONE, graceChip: 'closed' },
    wires: { wireTop: 'remove · object gone', wireFork: 'terminal phase · DELETE grace 0', wireLink: 'endpoint removed' },
    // The step ENDS with the fork pointing down again: the report has landed by then and the
    // last two balls leave the API, so nothing may still point at it (A-14 in spirit).
    opacity: stage({ pod: OPACITY.terminated, traffic: OPACITY.terminated, signal: OPACITY.terminated }),
    podSublabels: { podGroup: 'object removed' },
    lit: ['kubelet', 'epChip', 'graceChip'],
    // Both chips read their old value until the beat that earns the new one: the report closes
    // the window, the last slice change removes the endpoint. The right tap opens pointing UP for
    // the report and turns back down once it has landed.
    rewind: { chips: { epChip: EP_TERM, graceChip: '0s · expired' }, opacity: { forkLeft: 0, forkRight: 0, reportUp: 1 } },
    flow: [
      // The Kubelet reports on its own, up the tap and the trunk, and the API acts on the report.
      F.route({ points: REPORT_UP, delay: BEAT.lead, name: 'report', lights: ['api'] }),
      F.set({ at: 'report', chips: { graceChip: 'closed' } }),
      F.fade({ target: 'reportUp', from: 1, to: 0, dur: FADE.out, at: 'report', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'forkLeft', from: 0, to: 1, dur: FADE.in, at: 'report', fill: 'both', easing: 'ease-out' }),
      F.fade({ target: 'forkRight', from: 0, to: 1, dur: FADE.in, at: 'report', fill: 'both', easing: 'ease-out' }),
      F.top({ ...WRITE_HOP, after: 'report', name: 'del', lights: ['etcd'] }),
      // The removal is one more write the controller watches, and the slice change reaches
      // kube-proxy the way the first one did.
      F.route({ points: FORK_L, after: 'del', name: 'watchGone', lights: ['controller'] }),
      F.segment({ from: LINK[0], to: LINK[1], after: 'watchGone', name: 'drop', lights: ['kubeproxy'] }),
      F.set({ at: 'drop', chips: { epChip: EP_GONE } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
