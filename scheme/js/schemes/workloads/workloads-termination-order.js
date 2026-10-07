import { P, F, defineCard, ladder, laneY, midX, WL, BEAT, FADE, OPACITY } from './workloads-kit.js';
import { box } from '../../lib/primitives.js';
import { g, path, text } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/workloads-termination-order.md

// No A / B / C preset: chips sit in both columns and there is no ladder (WL.L-06).
// PANEL_B is the measured panel bottom, valid only for the longest narration here.
const PANEL_B = 230, PANEL_GAP = 20;

// The Runtime sits on CX because it sends the signal (A-09), so the spine leaves it.
const TOP_W = 232;
const TOP1_X = WL.CX - TOP_W / 2, TOP1_R = TOP1_X + TOP_W;
// The second actor ends on the frame edge, the relationship both peer cards use.
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_Y = WL.TOP_Y - 12;

const SPINE_WIRE_DX = 14;

// The two orders stack in one column because one is the other read backwards.
const CHIP_GAP = 8;
const CHIP_ROWS = 2;
const CHIPS_H = CHIP_ROWS * WL.CHIP_H + CHIP_GAP;

// POD_H is the sum of the two zones and the gate, every y inside is an offset from POD_Y.
const Z_PAD = 20;                                        // Pod edge to zone content
const C_H = 40, C_GAP = 12;
const ZA_CAP_DY = 40, ZA_DY = 52;                        // sidecar zone: caption baseline, then the row
const GATE_CAP_DY = 114, GATE_RAIL_DY = 124;
const ZB_CAP_DY = 148, ZB_DY = 160;                      // regular zone
const POD_FOOT = 12;
const POD_H = ZB_DY + C_H + POD_FOOT;

// The frame rests on the floor and grows upward.
const NODE_H = 34 + POD_H + 12, CANVAS_B = 624;
const NODE_Y = CANVAS_B - NODE_H;
// Inset rather than full width, centred on CX so its top midpoint stays WL.SPINE_X.
const FR_W = 1004;
const FR_L = WL.CX - FR_W / 2, FR_R = FR_L + FR_W;
const TOP2_X = FR_R - TOP_W;                             // 870..1102, the actor row on the frame margin
const WIRE_X = midX(TOP1_R, TOP2_X);
const POD_W = 808;
const POD_X = WL.CX - POD_W / 2;
const POD_Y = NODE_Y + 34;

// The chip grid shares the frame edges and hangs CHIP_TO_NODE above it.
const CHIP_TO_NODE = 20;
// The band hangs off the frame, the panel is the ceiling it may not cross (L-03).
const BAND_Y = Math.max(PANEL_B + PANEL_GAP, NODE_Y - CHIP_TO_NODE - CHIPS_H);
const CHIP_Y = ladder({ y: BAND_Y, rowH: WL.CHIP_H, gap: CHIP_GAP });
// Beside the spine, centred in the band between actor row and chips, derived from BAND_Y.
const SPINE_WIRE_Y = midX(WL.TOP_BOTTOM, BAND_Y) + 4;
// Narrowed gutter so the chips reach the frame edges, sized off the widest chip text.
const CHIP_MID = 92;
const CHIP_W = (FR_W - CHIP_MID) / 2;
const LCOL = { x: FR_L, w: CHIP_W }, RCOL = { x: FR_R - CHIP_W, w: CHIP_W };

// One width for all five peers, both rows start on the zone edge.
const Z_X = POD_X + Z_PAD, Z_W = POD_W - Z_PAD * 2;
const C_W = (Z_W - C_GAP * 2) / 3;
const C_STEP = C_W + C_GAP;

// Runtime bottom face to the Node frame, never the Pod (WL.A-03), one array for lane and ball (WL.S-01).
const SPINE = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, NODE_Y]];

// The gate is a rule, not a measure: no number, no fill.
const GATE_INK = 'rgba(91, 184, 255, 0.45)';

// The list order is the z-order: the actor row and Node / Pod draw above the ball.
export const SCENE = {
  'aria-label': 'Container termination order in a five container Pod: every container in spec.containers is signalled first and in no guaranteed order among them, and only once the last of them has terminated does the Kubelet signal the three native sidecars, in the reverse of the order they are declared, with every stop spent from one terminationGracePeriodSeconds',
  parts: [
    P.defs(),
    P.arrow({ x1: TOP2_X, y1: REQ_Y, x2: TOP1_R, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: TOP1_R, y1: RESP_Y, x2: TOP2_X, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'spineLane', points: SPINE, dim: true, dashed: true, role: 'cluster' }),
    // Left column: the two orders, stacked, because one is the other read backwards.
    P.chip({ key: 'declaredChip', x: LCOL.x, y: CHIP_Y(0), w: LCOL.w, h: WL.CHIP_H, name: 'declared order', value: 'mesh-proxy, log-agent, otel-agent, web, redis' }),
    P.chip({ key: 'stopChip', x: LCOL.x, y: CHIP_Y(1), w: LCOL.w, h: WL.CHIP_H, name: 'stop order', value: 'not started' }),
    // Right column: the gate that splits the sequence in two, and the budget all of it is spent from.
    P.chip({ key: 'gateChip', x: RCOL.x, y: CHIP_Y(0), w: RCOL.w, h: WL.CHIP_H, name: 'gate', value: 'held while containers[] run' }),
    P.chip({ key: 'graceChip', x: RCOL.x, y: CHIP_Y(1), w: RCOL.w, h: WL.CHIP_H, name: 'grace budget', value: 'terminationGracePeriodSeconds 30' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.node({ key: 'nodeEl', x: FR_L, y: NODE_Y, w: FR_W, h: NODE_H, label: 'Node-1' }),
    P.pod({
      key: 'podGroup', id: 'podGroup', shellKey: 'shellEl',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      // Peers, captions and gate go inside the shell so pulsePod blinks the whole assembly.
      // box() defaults its role to '' so the kit role is passed by hand.
      tune: (el, refs) => {
        const container = (x, y, label, sublabel) => box({ x, y, w: C_W, h: C_H, label, sublabel, role: 'workloads' });
        const caption = (x, y, str) => text({ class: 'scheme-label code dim', x, y, 'text-anchor': 'start' }, [str]);
        // Declaration order top to bottom, so the stop path is the reading path reversed.
        refs.zoneInit = caption(Z_X, POD_Y + ZA_CAP_DY, 'spec.initContainers · restartPolicy: Always');
        refs.containerProxy = container(Z_X, POD_Y + ZA_DY, 'mesh-proxy', 'initContainers[0] · sidecar');
        refs.containerLogship = container(Z_X + C_STEP, POD_Y + ZA_DY, 'log-agent', 'initContainers[1] · sidecar');
        refs.containerOtel = container(Z_X + C_STEP * 2, POD_Y + ZA_DY, 'otel-agent', 'initContainers[2] · sidecar');
        refs.gateRail = g({}, [
          path({ d: `M ${Z_X} ${POD_Y + GATE_RAIL_DY} L ${Z_X + Z_W} ${POD_Y + GATE_RAIL_DY}` }),
          text({ class: 'scheme-label code dim', x: WL.CX, y: POD_Y + GATE_CAP_DY, 'text-anchor': 'middle' }, ['no sidecar is signalled until every container below has terminated']),
        ]);
        const rule = refs.gateRail.firstChild;
        rule.style.fill = 'none';
        rule.style.stroke = GATE_INK;
        rule.style.strokeWidth = '1.5';
        rule.style.strokeDasharray = '6 5';
        refs.zoneMain = caption(Z_X, POD_Y + ZB_CAP_DY, 'spec.containers');
        refs.containerWeb = container(Z_X, POD_Y + ZB_DY, 'web', 'containers[0]');
        refs.containerRedis = container(Z_X + C_STEP, POD_Y + ZB_DY, 'redis', 'containers[1]');
        for (const k of ['zoneInit', 'containerProxy', 'containerLogship', 'containerOtel',
          'gateRail', 'zoneMain', 'containerWeb', 'containerRedis']) el.appendChild(refs[k]);
      },
    }),
    P.box({ key: 'runtimeEl', x: TOP1_X, y: WL.TOP_Y, w: TOP_W, h: WL.BOX_H, label: 'Runtime', sublabel: 'containerd · CRI', role: 'cluster' }),
    P.box({ key: 'kubeletEl', x: TOP2_X, y: WL.TOP_Y, w: TOP_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'sequences the shutdown', role: 'cluster' }),
    P.wire({ key: 'top', x: WIRE_X, y: WIRE_Y }),
    P.wire({ key: 'spine', x: WL.SPINE_X + SPINE_WIRE_DX, y: SPINE_WIRE_Y, anchor: 'start' }),
  ],
  reset: {
    keys: ['runtimeEl', 'kubeletEl', 'containerProxy', 'containerLogship', 'containerOtel',
      'containerWeb', 'containerRedis', 'declaredChip', 'stopChip', 'gateChip', 'graceChip'],
    pods: ['podGroup'],
  },
};

// The stop list is the declared list read backwards.
const DECLARED = 'mesh-proxy, log-agent, otel-agent, web, redis';
const GRACE = 'terminationGracePeriodSeconds 30';
const GATE_HELD = 'held while containers[] run', GATE_OPEN = 'open, containers[] all terminated';
const STOP_NONE = 'not started';
const STOP_MAIN = 'web and redis';
const STOP_OTEL = 'web and redis, otel-agent';
const STOP_LOG = 'web and redis, otel-agent, log-agent';
const STOP_ALL = 'web and redis, otel-agent, log-agent, mesh-proxy';

// Every block opacity in one place (A-16), so no step retires a container and leaves the shell whole.
const stage = (o = {}) => ({
  shellEl: o.shell === undefined ? 1 : o.shell,
  containerProxy: o.proxy === undefined ? 1 : o.proxy,
  containerLogship: o.logship === undefined ? 1 : o.logship,
  containerOtel: o.otel === undefined ? 1 : o.otel,
  containerWeb: o.web === undefined ? 1 : o.web,
  containerRedis: o.redis === undefined ? 1 : o.redis,
  gateRail: o.gate === undefined ? 1 : o.gate,
});

const retire = (target, from = 1) => F.fade({ target, from, to: OPACITY.terminated, dur: FADE.out, fill: 'both', easing: 'ease-in' });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { declaredChip: DECLARED, stopChip: STOP_NONE, gateChip: GATE_HELD, graceChip: GRACE },
    opacity: stage(),
  },
  {
    id: 'terminating',
    duration: 3000,
    narration: 'The Pod is marked for deletion and the Kubelet begins the local shutdown on this Node. Nothing has been signalled yet. Five containers are running here, three declared in spec.initContainers with restartPolicy Always and two in spec.containers, and one terminationGracePeriodSeconds covers all of them.',
    chips: { declaredChip: DECLARED, stopChip: STOP_NONE, gateChip: GATE_HELD, graceChip: GRACE },
    opacity: stage(),
    lit: ['kubeletEl', 'graceChip'],
    // Nothing travels: the Pod itself is what changed, so the Pod is what blinks.
    flow: [F.pulse({ pod: 'podGroup' })],
  },
  {
    id: 'regulars-first',
    duration: 3100,
    narration: 'Every container in spec.containers goes first. The Kubelet runs the preStop hook of each one and has the runtime send the stop signal to web and to redis, at different times and in an arbitrary order, so which of the two goes first is not something to rely on. No sidecar above has been touched.',
    chips: { declaredChip: DECLARED, stopChip: STOP_MAIN, gateChip: GATE_HELD, graceChip: GRACE },
    wires: { top: 'StopContainer · web and redis', spine: 'stop signal to containers[]' },
    opacity: stage(),
    lit: ['kubeletEl'],
    // One ball for both calls: two staggered balls would imply an order between web and redis.
    flow: [
      F.top({ from: TOP2_X, to: TOP1_R, y: REQ_Y, name: 'req', lights: ['runtimeEl'] }),
      F.route({ points: SPINE, after: 'req', name: 'sig', lights: ['containerWeb', 'containerRedis', 'stopChip'], pulse: 'podGroup' }),
    ],
  },
  {
    id: 'gate-holds',
    duration: 3000,
    narration: 'That gate is the reason the order runs this way. While web and redis are still winding down, mesh-proxy is still carrying their outbound calls, log-agent is still tailing the file they write and otel-agent is still shipping what they emit. A sidecar stopped alongside the app would cut a path the app still needs.',
    chips: { declaredChip: DECLARED, stopChip: STOP_MAIN, gateChip: GATE_HELD, graceChip: GRACE },
    opacity: stage({ web: OPACITY.terminating, redis: OPACITY.terminating }),
    lit: ['containerProxy', 'containerLogship', 'containerOtel', 'gateChip'],
    flow: [
      F.fade({ target: 'containerWeb', from: 1, to: OPACITY.terminating, dur: FADE.out, fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'containerRedis', from: 1, to: OPACITY.terminating, dur: FADE.out, fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'gate-opens',
    // The three sweep steps share one shape: 4000 of motion then 800 still (M-19a).
    duration: 4800,
    narration: 'The last container in spec.containers has fully terminated, so the gate opens and the sidecars follow, in the reverse of the order they are declared in. The row is walked from its end: initContainers[2] is otel-agent, so otel-agent is the first sidecar to be signalled.',
    chips: { declaredChip: DECLARED, stopChip: STOP_OTEL, gateChip: GATE_OPEN, graceChip: GRACE },
    wires: { top: 'containers[] exited · StopContainer · otel-agent', spine: 'stop signal to otel-agent' },
    opacity: stage({ web: OPACITY.terminated, redis: OPACITY.terminated, gate: OPACITY.terminated }),
    // The runtime reports the exit first, the gate chip turns on that report (M-18a).
    lit: ['runtimeEl'],
    flow: [
      F.top({ from: TOP1_R, to: TOP2_X, y: RESP_Y, delay: BEAT.lead, name: 'done', lights: ['kubeletEl', 'gateChip'] }),
      F.top({ from: TOP2_X, to: TOP1_R, y: REQ_Y, after: 'done', name: 'req', lights: ['runtimeEl'] }),
      F.route({ points: SPINE, after: 'req', name: 'sig', lights: ['containerOtel', 'stopChip'], pulse: 'podGroup' }),
      retire('containerWeb', OPACITY.terminating),
      retire('containerRedis', OPACITY.terminating),
      // The gate is spent along with the row it was holding back, so it retires on the same beat.
      retire('gateRail'),
    ],
  },
  {
    id: 'reverse-sweep',
    duration: 4800,
    narration: 'Next is initContainers[1], which is log-agent, while mesh-proxy at initContainers[0] is still running. That is what lets log-agent flush its last lines out through mesh-proxy on the way down, and it is the whole reason the row is walked backwards rather than forwards.',
    chips: { declaredChip: DECLARED, stopChip: STOP_LOG, gateChip: GATE_OPEN, graceChip: GRACE },
    wires: { top: 'otel-agent exited · StopContainer · log-agent', spine: 'stop signal to log-agent' },
    opacity: stage({ web: OPACITY.terminated, redis: OPACITY.terminated, gate: OPACITY.terminated, otel: OPACITY.terminated }),
    lit: ['runtimeEl'],
    flow: [
      F.top({ from: TOP1_R, to: TOP2_X, y: RESP_Y, delay: BEAT.lead, name: 'done', lights: ['kubeletEl'] }),
      F.top({ from: TOP2_X, to: TOP1_R, y: REQ_Y, after: 'done', name: 'req', lights: ['runtimeEl'] }),
      F.route({ points: SPINE, after: 'req', name: 'sig', lights: ['containerLogship', 'stopChip'], pulse: 'podGroup' }),
      retire('containerOtel'),
    ],
  },
  {
    id: 'first-declared-last',
    duration: 4800,
    narration: 'The mesh-proxy container is declared first, so it is stopped last, which is what kept a route open for the four that went before it. All five stops came out of the one budget the Pod carries, so if the grace period runs out while containers are still terminating, everything still alive is stopped together.',
    chips: { declaredChip: DECLARED, stopChip: STOP_ALL, gateChip: GATE_OPEN, graceChip: GRACE },
    wires: { top: 'log-agent exited · StopContainer · mesh-proxy', spine: 'stop signal to mesh-proxy' },
    // The shell fades, not the group, or the two opacities multiply.
    opacity: stage({ shell: OPACITY.terminated, proxy: OPACITY.terminated, logship: OPACITY.terminated,
      otel: OPACITY.terminated, web: OPACITY.terminated, redis: OPACITY.terminated, gate: OPACITY.terminated }),
    lit: ['runtimeEl', 'graceChip'],
    // The last exit hangs off the signal arrival, and the signal lights the chip, not the container.
    flow: [
      F.top({ from: TOP1_R, to: TOP2_X, y: RESP_Y, delay: BEAT.lead, name: 'done', lights: ['kubeletEl'] }),
      F.top({ from: TOP2_X, to: TOP1_R, y: REQ_Y, after: 'done', name: 'req', lights: ['runtimeEl'] }),
      F.route({ points: SPINE, after: 'req', name: 'sig', lights: ['stopChip'], pulse: 'podGroup' }),
      retire('containerLogship'),
      F.fade({ target: 'containerProxy', from: 1, to: OPACITY.terminated, dur: FADE.out, fill: 'both', easing: 'ease-in', after: 'sig' }),
      F.fade({ target: 'shellEl', from: 1, to: OPACITY.terminated, dur: FADE.out, fill: 'both', easing: 'ease-in', after: 'sig' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
