import { P, F, defineCard, ladder, midX, laneY, WL, FADE, OPACITY } from './workloads-kit.js';
import { box } from '../../lib/primitives.js';

// Design notes for this card: ./CARDS/workloads-termination-order.md

// No A / B / C preset: this card carries chips in BOTH columns and no ladder at all, so there is
// nothing for WL.L-06 to choose between and the two columns are read straight off WL.
// Panel worst case x<=396.55, y<=229.82 at 1100x800 on step 4, and a longer narration
// invalidates that measurement. 230 is that bottom rounded up to a whole unit.
const PANEL_B = 230, PANEL_GAP = 20;
const BAND_Y = PANEL_B + PANEL_GAP;                      // 250, the first chip row

// The RUNTIME sits on CX, not the Kubelet: the Kubelet asks, and the runtime is what sends the
// signal to the container (A-09), so the spine leaves the runtime. That reverses the actor row
// workloads-init-containers-and-sidecars draws, where the Kubelet is the one sequencing.
const TOP_W = 232;
const TOP1_X = WL.CX - TOP_W / 2, TOP1_R = TOP1_X + TOP_W;     // 484..716, centred on CX
const TOP_GAP = 56;
const TOP2_X = TOP1_R + TOP_GAP;                         // 772..1004
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;                  // 80
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(TOP1_R, TOP2_X);                     // 744
const WIRE_Y = WL.TOP_Y - 12;                            // 28, the WL.A-02 line

// The corridor label hangs off the SIDE of the spine, in the band between the actor row and the
// chip rows: centred on the spine it would sit on the lane it names.
const SPINE_WIRE_Y = 184, SPINE_WIRE_DX = 14;

// Six chips as a 2 x 3 grid filling both columns: the three containers on the left in spec order,
// the two orders and the budget on the right. 3 x 34 + 2 x 8 = 118 tall, so 250..368.
const CHIP_GAP = 8;
const CHIP_Y = ladder({ y: BAND_Y, rowH: WL.CHIP_H, gap: CHIP_GAP });
const LCOL = WL.COL_L, RCOL = WL.COL_R;                  // 60..540 and 660..1140

// The frame is 218 rather than the 134 / 140 the category usually draws, because the Pod holds a
// three-row STACK and not a row: 30 + 144 + 12 inside the Pod, plus 16 of frame air a side.
const NODE_H = 218, CANVAS_B = 624;
const NODE_Y = CANVAS_B - NODE_H;                        // 406..624
const POD_W = 808, POD_H = 186;
const POD_X = WL.CX - POD_W / 2;                         // 196..1004, centred on CX
const POD_Y = NODE_Y + 16;                               // 422..608

// The three containers stack in SPEC order, and the gaps carry the grouping: 8 between the two
// sidecars, 16 between that pair and the app container, so the row reads as a pair plus one
// rather than as three peers. Three equal boxes on one gap would draw the symmetric picture of an
// asymmetric mechanism.
const C_PAD = 30, C_H = 40, C_GAP_PEER = 8, C_GAP_SPLIT = 16;
const C_W = POD_W - C_PAD * 2, C_X = POD_X + C_PAD;      // 226..974
const C_Y0 = POD_Y + 30;                                 // 452..492, mesh-proxy
const C_Y1 = C_Y0 + C_H + C_GAP_PEER;                    // 500..540, log-agent
const C_Y2 = C_Y1 + C_H + C_GAP_SPLIT;                   // 556..596, web

// One corridor, downward only, from the Runtime bottom face midpoint to the Node FRAME face
// midpoint (WL.A-03), never to the Pod inside it. The frame is full width, so its top midpoint is
// WL.SPINE_X already. The same array feeds the drawn lane and every ball on it (WL.S-01).
const SPINE = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, NODE_Y]];

// The list order IS the append order, so it is the z-order: the two top lanes and the corridor
// first, then the chip grid and the packet layer, then Node / Pod / actor row above the ball.
export const SCENE = {
  'aria-label': 'Pod termination order: the app container is stopped first, then the native sidecars in the reverse of the order they are declared in the Pod spec, and the whole sequence is spent from one terminationGracePeriodSeconds',
  parts: [
    P.defs(),
    P.arrow({ x1: TOP2_X, y1: REQ_Y, x2: TOP1_R, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: TOP1_R, y1: RESP_Y, x2: TOP2_X, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'spineLane', points: SPINE, dim: true, dashed: true, role: 'cluster' }),
    // Left column: one chip per container, in the order the Pod spec declares them.
    P.chip({ key: 'proxyChip', x: LCOL.x, y: CHIP_Y(0), w: LCOL.w, h: WL.CHIP_H, name: 'mesh-proxy', value: 'Running' }),
    P.chip({ key: 'logshipChip', x: LCOL.x, y: CHIP_Y(1), w: LCOL.w, h: WL.CHIP_H, name: 'log-agent', value: 'Running' }),
    P.chip({ key: 'webChip', x: LCOL.x, y: CHIP_Y(2), w: LCOL.w, h: WL.CHIP_H, name: 'web', value: 'Running' }),
    // Right column: the two orders read against each other, and the budget all three spend.
    P.chip({ key: 'declaredChip', x: RCOL.x, y: CHIP_Y(0), w: RCOL.w, h: WL.CHIP_H, name: 'declared order', value: 'mesh-proxy, log-agent, web' }),
    P.chip({ key: 'stopChip', x: RCOL.x, y: CHIP_Y(1), w: RCOL.w, h: WL.CHIP_H, name: 'stop order', value: 'not started' }),
    P.chip({ key: 'graceChip', x: RCOL.x, y: CHIP_Y(2), w: RCOL.w, h: WL.CHIP_H, name: 'grace budget', value: 'terminationGracePeriodSeconds 30' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.node({ key: 'nodeEl', x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' }),
    P.pod({
      key: 'podGroup', id: 'podGroup', shellKey: 'shellEl',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      // buildPod carries ONE inner box and these three are peers, so they are appended here. They
      // sit INSIDE the shell group because pulsePod reaches only what the Pod contains, and box()
      // defaults its role to the empty string, so the kit binding is written out by hand.
      tune: (el, refs) => {
        refs.containerProxy = box({ x: C_X, y: C_Y0, w: C_W, h: C_H, label: 'mesh-proxy', sublabel: 'initContainers[0] · sidecar · egress for the Pod', role: 'workloads' });
        refs.containerLogship = box({ x: C_X, y: C_Y1, w: C_W, h: C_H, label: 'log-agent', sublabel: 'initContainers[1] · sidecar · tails the log file', role: 'workloads' });
        refs.containerWeb = box({ x: C_X, y: C_Y2, w: C_W, h: C_H, label: 'web', sublabel: 'containers[0] · the app process on PID 1', role: 'workloads' });
        for (const k of ['containerProxy', 'containerLogship', 'containerWeb']) el.appendChild(refs[k]);
      },
    }),
    P.box({ key: 'runtimeEl', x: TOP1_X, y: WL.TOP_Y, w: TOP_W, h: WL.BOX_H, label: 'Runtime', sublabel: 'containerd · CRI', role: 'cluster' }),
    P.box({ key: 'kubeletEl', x: TOP2_X, y: WL.TOP_Y, w: TOP_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'sequences the shutdown', role: 'cluster' }),
    P.wire({ key: 'top', x: WIRE_X, y: WIRE_Y }),
    P.wire({ key: 'spine', x: WL.SPINE_X + SPINE_WIRE_DX, y: SPINE_WIRE_Y, anchor: 'start' }),
  ],
  reset: {
    keys: ['runtimeEl', 'kubeletEl', 'containerProxy', 'containerLogship', 'containerWeb',
      'proxyChip', 'logshipChip', 'webChip', 'declaredChip', 'stopChip', 'graceChip'],
    pods: ['podGroup'],
  },
};

// The container states this card cycles through, named once so a six-key `chips` block stays one
// readable line. The two right-hand chips that never move are written at their part.
const RUN = 'Running', GONE = 'Terminated', SIGNALLED = 'preStop, then SIGTERM';
const DECLARED = 'mesh-proxy, log-agent, web', GRACE = 'terminationGracePeriodSeconds 30';

// Every block opacity in ONE place (A-16): the shell and the three containers together, so no step
// can dim a container and leave the shell claiming the Pod is whole.
const stage = (o = {}) => ({
  shellEl: o.shell === undefined ? 1 : o.shell,
  containerProxy: o.proxy === undefined ? 1 : o.proxy,
  containerLogship: o.logship === undefined ? 1 : o.logship,
  containerWeb: o.web === undefined ? 1 : o.web,
});

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { proxyChip: RUN, logshipChip: RUN, webChip: RUN, declaredChip: DECLARED, stopChip: 'not started', graceChip: GRACE },
    opacity: stage(),
  },
  {
    id: 'terminating',
    duration: 2700,
    narration: 'The Pod is marked for deletion and the Kubelet begins the local shutdown on this Node. All three containers are still running and none of them has been signalled yet. One terminationGracePeriodSeconds budget, 30 by default, covers everything that follows.',
    chips: { proxyChip: RUN, logshipChip: RUN, webChip: RUN, declaredChip: DECLARED, stopChip: 'not started', graceChip: GRACE },
    opacity: stage(),
    lit: ['kubeletEl', 'graceChip'],
    // Nothing travels: the Pod itself is what changed, so the Pod is what blinks.
    flow: [F.pulse({ pod: 'podGroup' })],
  },
  {
    id: 'app-first',
    duration: 3100,
    narration: 'The app container goes first. The Kubelet runs the preStop hook of web, then has the runtime send the stop signal to PID 1. Both sidecars are left alone on purpose, because the Kubelet holds their signal back until the last container in spec.containers has fully terminated.',
    chips: { proxyChip: RUN, logshipChip: RUN, webChip: SIGNALLED, declaredChip: DECLARED, stopChip: 'web', graceChip: GRACE },
    wires: { top: 'StopContainer · web', spine: 'stop signal to web · PID 1' },
    opacity: stage(),
    // The Kubelet sends before it receives anything here, so it is lit at entry.
    lit: ['kubeletEl'],
    flow: [
      F.top({ from: TOP2_X, to: TOP1_R, y: REQ_Y, name: 'req', lights: ['runtimeEl'] }),
      F.route({ points: SPINE, after: 'req', lights: ['containerWeb', 'webChip', 'stopChip'] }),
    ],
  },
  {
    id: 'route-still-open',
    duration: 2900,
    narration: 'That delay is the reason the order runs the way it does. While web drains its in-flight work, mesh-proxy is still up to carry its outbound calls and log-agent is still tailing the log file web writes. A sidecar stopped alongside the app would cut the path the app needs in order to finish cleanly.',
    chips: { proxyChip: RUN, logshipChip: RUN, webChip: SIGNALLED, declaredChip: DECLARED, stopChip: 'web', graceChip: GRACE },
    opacity: stage(),
    // Nothing travels and no Pod acts: the beat is the two sidecars still standing at full weight
    // under a draining app container, carried by the static highlight alone (M-27).
    lit: ['containerProxy', 'containerLogship', 'proxyChip', 'logshipChip'],
  },
  {
    id: 'reverse-sidecars',
    duration: 3400,
    narration: 'The web container has fully terminated, so the sidecars follow, in the reverse of the order they are declared in. Of the two, the one at initContainers[1] goes first, which is log-agent, while mesh-proxy at initContainers[0] stays up. That is what lets log-agent flush its last lines out through mesh-proxy on the way down.',
    chips: { proxyChip: RUN, logshipChip: 'SIGTERM sent', webChip: GONE, declaredChip: DECLARED, stopChip: 'web, log-agent', graceChip: GRACE },
    wires: { top: 'web exited · StopContainer · log-agent', spine: 'stop signal to log-agent' },
    opacity: stage({ web: OPACITY.terminated }),
    // The runtime REPORTS the exit before the Kubelet sends the next call, so the Kubelet is dark
    // at entry and lights on that report instead.
    flow: [
      F.top({ from: TOP1_R, to: TOP2_X, y: RESP_Y, name: 'done', lights: ['kubeletEl'] }),
      F.top({ from: TOP2_X, to: TOP1_R, y: REQ_Y, after: 'done', name: 'req', lights: ['runtimeEl'] }),
      F.route({ points: SPINE, after: 'req', lights: ['containerLogship', 'logshipChip', 'stopChip'] }),
      // The exit and the report of it are the same event, so the box dims while the report
      // that names it is still in flight, on the house delay of 0 (workloads-graceful-shutdown).
      F.fade({ target: 'containerWeb', from: 1, to: OPACITY.terminated, dur: FADE.out, fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'proxy-last',
    duration: 3500,
    narration: 'The mesh-proxy container is declared first, so it is stopped last, which is what kept a route open for the two that went before it. Its exit code does not matter here. A sidecar that runs out of time and is killed reports a code other than zero, and on termination that is normal rather than a failure to chase.',
    chips: { proxyChip: 'SIGTERM sent', logshipChip: GONE, webChip: GONE, declaredChip: DECLARED, stopChip: 'web, log-agent, mesh-proxy', graceChip: GRACE },
    wires: { top: 'log-agent exited · StopContainer · mesh-proxy', spine: 'stop signal to mesh-proxy' },
    opacity: stage({ web: OPACITY.terminated, logship: OPACITY.terminated }),
    flow: [
      F.top({ from: TOP1_R, to: TOP2_X, y: RESP_Y, name: 'done', lights: ['kubeletEl'] }),
      F.top({ from: TOP2_X, to: TOP1_R, y: REQ_Y, after: 'done', name: 'req', lights: ['runtimeEl'] }),
      F.route({ points: SPINE, after: 'req', lights: ['containerProxy', 'proxyChip', 'stopChip'] }),
      F.fade({ target: 'containerLogship', from: 1, to: OPACITY.terminated, dur: FADE.out, fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'one-budget',
    duration: 3300,
    narration: 'With mesh-proxy gone the Pod has nothing left running. All three stops came out of the one budget the Pod carries rather than one budget each, which makes the ordering best effort: if the grace period runs out while containers are still terminating, the Pod enters forced termination and everything still alive is stopped together.',
    chips: { proxyChip: GONE, logshipChip: GONE, webChip: GONE, declaredChip: DECLARED, stopChip: 'web, log-agent, mesh-proxy', graceChip: GRACE },
    // The containers are already at their terminal shade, so the SHELL is what fades: fading the
    // whole group would multiply the two and take the stack to 0.014.
    opacity: stage({ shell: OPACITY.terminated, proxy: OPACITY.terminated, logship: OPACITY.terminated, web: OPACITY.terminated }),
    lit: ['graceChip', 'stopChip'],
    flow: [
      F.fade({ target: 'containerProxy', from: 1, to: OPACITY.terminated, dur: FADE.out, fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'shellEl', from: 1, to: OPACITY.terminated, dur: FADE.out, fill: 'both', easing: 'ease-in' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
