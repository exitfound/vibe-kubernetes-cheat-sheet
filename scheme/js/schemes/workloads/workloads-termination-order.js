import { P, F, defineCard, ladder, laneY, midX, WL, BEAT, FADE, OPACITY } from './workloads-kit.js';
import { box } from '../../lib/primitives.js';
import { g, path, text } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/workloads-termination-order.md

// No A / B / C preset: this card carries chips in BOTH columns and no ladder at all, so there is
// nothing for WL.L-06 to choose between and the two columns are read straight off WL.
// Panel worst case x<=396.55, y<=229.82 at 1100x800 on the poster frame, which previews the
// longest narration this card carries, and a longer one invalidates that measurement. 230 is that
// bottom rounded up to a whole unit.
const PANEL_B = 230, PANEL_GAP = 20;
// BAND_Y hangs off the FRAME rather than off the panel, and is derived after NODE_Y: the chip grid
// reads as the caption of the Node it sits on, so what has to be constant is the air BELOW it. Off
// the panel it left 54 units of nothing between the last chip and the frame. The panel is still the
// ceiling the band may not cross (L-03) and PANEL_GAP is what checks it.

// The RUNTIME sits on CX, not the Kubelet: the Kubelet asks, and the runtime is what sends the
// signal to the container (A-09), so the spine leaves the runtime. That reverses the actor row
// workloads-init-containers-and-sidecars draws, where the Kubelet is the one sequencing.
const TOP_W = 232;
const TOP1_X = WL.CX - TOP_W / 2, TOP1_R = TOP1_X + TOP_W;     // 484..716, centred on CX
// The second actor takes the RIGHT MARGIN, which is how both peer cards anchor the pair:
// workloads-poststart-prestop-hooks (Runtime on CX, Kubelet at WL.R - TOP_W) and
// workloads-init-containers-and-sidecars (the same two slots, the boxes swapped). Their frames are
// full width, so their WL.R and their frame edge are the same line. Here the frame is inset, so the
// RELATIONSHIP is what carries over and TOP2 ends on FR_R: see the frame block for the number. A
// gap measured off the first box instead left this one floating short of both.
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;                  // 80
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_Y = WL.TOP_Y - 12;                            // 28, the WL.A-02 line

const SPINE_WIRE_DX = 14;

// Four chips as a 2 x 2 grid on the FRAME margins: 2 x 34 + 8 = 76, so 284..360. The two ORDERS
// are stacked in the same column on purpose, because one is the other read backwards and a reader
// has to be able to hold them on one line of sight. Per-container state is not a chip here: five
// containers would be five chips, and the state each one is in is already the shade of its box.
const CHIP_GAP = 8;
const CHIP_ROWS = 2;
const CHIPS_H = CHIP_ROWS * WL.CHIP_H + CHIP_GAP;        // 76

// The Pod holds two zones of containers split by the gate, so its height is the sum of what the
// zones cost rather than a number chosen for the frame. Every y inside it is an offset from POD_Y,
// and POD_H is derived from the last of them, which is what lets the frame be sized afterwards.
const Z_PAD = 20;                                        // Pod edge to zone content, against the 16 of frame to Pod
const C_H = 40, C_GAP = 12;
const ZA_CAP_DY = 40, ZA_DY = 52;                        // sidecar zone: caption baseline, then the row
const GATE_CAP_DY = 114, GATE_RAIL_DY = 124;
const ZB_CAP_DY = 148, ZB_DY = 160;                      // regular zone
const POD_FOOT = 12;
const POD_H = ZB_DY + C_H + POD_FOOT;                    // 212

// The frame is 244 rather than the 134 / 140 the category usually draws, because the Pod holds two
// zones and a gate between them: 212 of Pod plus 16 of frame air a side.
const NODE_H = POD_H + 32, CANVAS_B = 624;
const NODE_Y = CANVAS_B - NODE_H;                        // 380..624
// The frame is INSET from the walls rather than full width, on the 1004 workloads-crashloopbackoff
// measured for the same shape, and it stays centred on CX so its top face midpoint is still
// WL.SPINE_X and the corridor lands on it without a jog. Full width put 136 of empty frame either
// side of an 808 Pod, and the NODE-1 label alone in it.
const FR_W = 1004;
const FR_L = WL.CX - FR_W / 2, FR_R = FR_L + FR_W;       // 98..1102
const TOP2_X = FR_R - TOP_W;                             // 870..1102, the actor row on the frame margin
const WIRE_X = midX(TOP1_R, TOP2_X);                     // 793
const POD_W = 808;
const POD_X = WL.CX - POD_W / 2;                         // 196..1004, centred on CX
const POD_Y = NODE_Y + 16;                               // 396..608

// The chip grid sits on the frame: its outer edges are the frame's, so the two bands read as one
// column of content, and it hangs CHIP_TO_NODE above the frame instead of 20 below the panel. The
// centre gutter stays at 540..660, so only the outer edge of each chip moved.
const CHIP_TO_NODE = 20;
// max, not a bare subtraction: the band hangs off the FRAME, and the panel is the ceiling it may
// not cross (L-03). At this narration the frame wins, 284 against the 250 the panel floor allows,
// which is what makes PANEL_B a live guard rather than a number in a comment. A narration long
// enough to push the panel past 264 takes the band back.
const BAND_Y = Math.max(PANEL_B + PANEL_GAP, NODE_Y - CHIP_TO_NODE - CHIPS_H);   // 284, first chip row
const CHIP_Y = ladder({ y: BAND_Y, rowH: WL.CHIP_H, gap: CHIP_GAP });
// The corridor label hangs off the SIDE of the spine, centred in the band between the actor row
// and the chip rows: centred on the spine it would sit on the lane it names. DERIVED, because the
// band moves with BAND_Y. Typed as 184 it was the centre of a 120..250 band and stayed put when
// the chips went to 284, ending up 22 above the middle of the band it names.
const SPINE_WIRE_Y = midX(WL.TOP_BOTTOM, BAND_Y) + 4;    // 206
// The centre gutter narrows with the band, from the 120 of the WL preset to 92, which is what lets
// the chips reach the frame edges without crossing the text floor: the widest LEFT pair is
// `declared order` 96.5 against `mesh-proxy, log-agent, otel-agent, web, redis` 310.1, measured at
// 1600x1000 which is where this card reads widest, so 24 of chip padding leaves 25.4 of gutter in
// a 456. The spine still has 46 of clear air either side.
const CHIP_MID = 92;
const CHIP_W = (FR_W - CHIP_MID) / 2;                    // 456
const LCOL = { x: FR_L, w: CHIP_W }, RCOL = { x: FR_R - CHIP_W, w: CHIP_W };   // 98..554 and 646..1102

// One box width for all five, because they are peers of one Pod: a wider box on the row of two
// would read as rank where the only difference is how many the array holds. BOTH rows start on the
// zone edge, so the Pod is read down one left margin the way the spec that declares it is, and the
// slot the shorter array does not fill stands as air on the right. Centring the row of two put its
// caption 130 units left of the box it names.
const Z_X = POD_X + Z_PAD, Z_W = POD_W - Z_PAD * 2;      // 216..984
const C_W = (Z_W - C_GAP * 2) / 3;                       // 248
const C_STEP = C_W + C_GAP;                              // 260

// One corridor, downward only, from the Runtime bottom face midpoint to the Node FRAME face
// midpoint (WL.A-03), never to the Pod inside it. The frame is full width, so its top midpoint is
// WL.SPINE_X already. The same array feeds the drawn lane and every ball on it (WL.S-01).
const SPINE = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, NODE_Y]];

// The gate is the one instrument this card draws, and it is a RULE rather than a measure: a dashed
// rule with the sentence it enforces printed over it. It carries no number and no fill, because
// nothing about it is a quantity. It lives inside the Pod for the same reason the containers do.
const GATE_INK = 'rgba(91, 184, 255, 0.45)';

// The list order IS the append order, so it is the z-order: the two top lanes and the corridor
// first, then the chip grid and the packet layer, then Node / Pod / actor row above the ball.
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
      // buildPod carries ONE inner box and this Pod holds five peers, two zone captions and the
      // gate between them. They are appended INSIDE the shell group because everything here
      // belongs to the Pod and pulsePod reaches only what the Pod contains, so the step that marks
      // the Pod terminating blinks the whole assembly. box() defaults its role to the empty
      // string, so the kit binding is written out by hand.
      tune: (el, refs) => {
        const container = (x, y, label, sublabel) => box({ x, y, w: C_W, h: C_H, label, sublabel, role: 'workloads' });
        const caption = (x, y, str) => text({ class: 'scheme-label code dim', x, y, 'text-anchor': 'start' }, [str]);
        // The zones sit in DECLARATION order, initContainers above containers, which is what makes
        // the reading path and the stop path the same path in opposite directions.
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

// The two chip values that never move, and the four the stop order passes through. The stop list is
// the declared list read backwards, and writing both from literals is what keeps them that way.
const DECLARED = 'mesh-proxy, log-agent, otel-agent, web, redis';
const GRACE = 'terminationGracePeriodSeconds 30';
const GATE_HELD = 'held while containers[] run', GATE_OPEN = 'open, containers[] all terminated';
const STOP_NONE = 'not started';
const STOP_MAIN = 'web and redis';
const STOP_OTEL = 'web and redis, otel-agent';
const STOP_LOG = 'web and redis, otel-agent, log-agent';
const STOP_ALL = 'web and redis, otel-agent, log-agent, mesh-proxy';

// Every block opacity in ONE place (A-16): the shell, the five containers and the gate together, so
// no step can retire a container and leave the shell claiming the Pod is whole. The gate is in the
// list because it is spent as well: once the row below is empty it stops holding anything.
const stage = (o = {}) => ({
  shellEl: o.shell === undefined ? 1 : o.shell,
  containerProxy: o.proxy === undefined ? 1 : o.proxy,
  containerLogship: o.logship === undefined ? 1 : o.logship,
  containerOtel: o.otel === undefined ? 1 : o.otel,
  containerWeb: o.web === undefined ? 1 : o.web,
  containerRedis: o.redis === undefined ? 1 : o.redis,
  gateRail: o.gate === undefined ? 1 : o.gate,
});

// A container leaving the picture, on the house shade and the house delay: the exit and the report
// that carries the news of it are the same event (workloads-graceful-shutdown).
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
    // 302 characters against one pod pulse: 2700 read at 8.94 ms/char, in the hurried third of the
    // catalog, and 3000 puts it on the 10.10 median.
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
    // The Kubelet sends before it receives anything here, so it is lit at entry.
    lit: ['kubeletEl'],
    // ONE ball for two calls, and it lights BOTH boxes on the same arrival. Two balls staggered
    // down the corridor would draw an order between web and redis, which is the one thing the
    // narration says a reader must not rely on.
    flow: [
      F.top({ from: TOP2_X, to: TOP1_R, y: REQ_Y, name: 'req', lights: ['runtimeEl'] }),
      F.route({ points: SPINE, after: 'req', name: 'sig', lights: ['containerWeb', 'containerRedis', 'stopChip'] }),
      F.pulse({ pod: 'podGroup', at: 'sig' }),
    ],
  },
  {
    id: 'gate-holds',
    duration: 3000,
    narration: 'That gate is the reason the order runs this way. While web and redis are still winding down, mesh-proxy is still carrying their outbound calls, log-agent is still tailing the file they write and otel-agent is still shipping what they emit. A sidecar stopped alongside the app would cut a path the app still needs.',
    chips: { declaredChip: DECLARED, stopChip: STOP_MAIN, gateChip: GATE_HELD, graceChip: GRACE },
    // The frame this card is built for: the row below at the draining shade, the row above at full
    // weight, and the gate between them holding. It is legible as a still with no words at all.
    opacity: stage({ web: OPACITY.terminating, redis: OPACITY.terminating }),
    lit: ['containerProxy', 'containerLogship', 'containerOtel', 'gateChip'],
    flow: [
      F.fade({ target: 'containerWeb', from: 1, to: OPACITY.terminating, dur: FADE.out, fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'containerRedis', from: 1, to: OPACITY.terminating, dur: FADE.out, fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'gate-opens',
    // The three sweep steps are one beat played three times, so they hold one shape: 4000 of motion
    // (report, call, signal, pod pulse) and 800 of stillness after it, which is what
    // first-declared-last already held. At 4000 the pulse ended on the step boundary and the frame
    // never settled: deadair ranked both steps 1 of 629, the least still in the catalog (M-19a).
    duration: 4800,
    narration: 'The last container in spec.containers has fully terminated, so the gate opens and the sidecars follow, in the reverse of the order they are declared in. The row is walked from its end: initContainers[2] is otel-agent, so otel-agent is the first sidecar to be signalled.',
    chips: { declaredChip: DECLARED, stopChip: STOP_OTEL, gateChip: GATE_OPEN, graceChip: GRACE },
    wires: { top: 'containers[] exited · StopContainer · otel-agent', spine: 'stop signal to otel-agent' },
    opacity: stage({ web: OPACITY.terminated, redis: OPACITY.terminated, gate: OPACITY.terminated }),
    // The runtime REPORTS the exit before the Kubelet sends the next call, so the Kubelet is dark
    // at entry and lights on that report instead. The gate chip turns over on the same arrival,
    // because the report of the last exit IS what opens it. The RUNTIME is the block that acts
    // first, so it is lit at entry and its ball leaves on BEAT.lead rather than out of a dark box
    // at 0ms (M-18a).
    lit: ['runtimeEl'],
    flow: [
      F.top({ from: TOP1_R, to: TOP2_X, y: RESP_Y, delay: BEAT.lead, name: 'done', lights: ['kubeletEl', 'gateChip'] }),
      F.top({ from: TOP2_X, to: TOP1_R, y: REQ_Y, after: 'done', name: 'req', lights: ['runtimeEl'] }),
      F.route({ points: SPINE, after: 'req', name: 'sig', lights: ['containerOtel', 'stopChip'] }),
      F.pulse({ pod: 'podGroup', at: 'sig' }),
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
      F.route({ points: SPINE, after: 'req', name: 'sig', lights: ['containerLogship', 'stopChip'] }),
      F.pulse({ pod: 'podGroup', at: 'sig' }),
      retire('containerOtel'),
    ],
  },
  {
    id: 'first-declared-last',
    duration: 4800,
    narration: 'The mesh-proxy container is declared first, so it is stopped last, which is what kept a route open for the four that went before it. All five stops came out of the one budget the Pod carries, so if the grace period runs out while containers are still terminating, everything still alive is stopped together.',
    chips: { declaredChip: DECLARED, stopChip: STOP_ALL, gateChip: GATE_OPEN, graceChip: GRACE },
    wires: { top: 'log-agent exited · StopContainer · mesh-proxy', spine: 'stop signal to mesh-proxy' },
    // The containers are already at their terminal shade, so the SHELL is what fades beside the
    // last of them: fading the whole group would multiply the two and take the stack to 0.014.
    opacity: stage({ shell: OPACITY.terminated, proxy: OPACITY.terminated, logship: OPACITY.terminated,
      otel: OPACITY.terminated, web: OPACITY.terminated, redis: OPACITY.terminated, gate: OPACITY.terminated }),
    lit: ['runtimeEl', 'graceChip'],
    // The last step has no next step to retire mesh-proxy on, so its exit hangs off the arrival of
    // the signal that causes it rather than off delay 0, and the shell goes with it. The signal
    // therefore cues the stop order chip and NOT the container: the box going to the terminated
    // shade on that same arrival IS its cue, and a highlight taken straight back off by the fade
    // would leave the reduced path standing lit on a block the played path has already retired.
    flow: [
      F.top({ from: TOP1_R, to: TOP2_X, y: RESP_Y, delay: BEAT.lead, name: 'done', lights: ['kubeletEl'] }),
      F.top({ from: TOP2_X, to: TOP1_R, y: REQ_Y, after: 'done', name: 'req', lights: ['runtimeEl'] }),
      F.route({ points: SPINE, after: 'req', name: 'sig', lights: ['stopChip'] }),
      F.pulse({ pod: 'podGroup', at: 'sig' }),
      retire('containerLogship'),
      F.fade({ target: 'containerProxy', from: 1, to: OPACITY.terminated, dur: FADE.out, fill: 'both', easing: 'ease-in', after: 'sig' }),
      F.fade({ target: 'shellEl', from: 1, to: OPACITY.terminated, dur: FADE.out, fill: 'both', easing: 'ease-in', after: 'sig' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
