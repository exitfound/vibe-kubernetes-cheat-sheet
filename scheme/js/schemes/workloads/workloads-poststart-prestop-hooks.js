import { P, F, defineCard, laneY, midX, WL, BEAT, FADE, OPACITY } from './workloads-kit.js';
import { rect, text, g } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/workloads-poststart-prestop-hooks.md

// A time-rail instrument, not an actor row: the frame is a region enclosure, never a Node.

// The centred box is the Runtime, not Kubelet, because the lane into the container leaves it, so
// the request rides REQ_Y right to left.
const TOP_W = 232;
const RUN_X = WL.CX - TOP_W / 2;
const KUB_X = WL.R - TOP_W;
const RUN_R = RUN_X + TOP_W;
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(RUN_R, KUB_X);
const WIRE_Y = WL.TOP_Y - 12;                            // above the actor row (WL.A-02)

// Kubelet is a CRI client and never touches a container, so the corridor leaves the Runtime.
const POD_W = 460, POD_H = 100, POD_Y = 280;
const POD_X = WL.CX - POD_W / 2;
const CONT_W = 300, CONT_X = WL.CX - CONT_W / 2;
const POD_INNER = { dx: CONT_X - POD_X, dy: 26, w: CONT_W, h: 56 };
const SPINE = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, POD_Y]];
// The corridor label (T-22: a label names only the traffic on its own lane). The +4 centres the
// ink block, not the baseline, on the corridor midpoint.
const VIA_X = WL.SPINE_X + 14, VIA_Y = (WL.TOP_BOTTOM + POD_Y) / 2 + 4;

// The rail draws ORDER, never DURATION: both hook slots share one width and only the grace window
// carries a number.

// Every y below hangs off the frame top.
const FRAME_X = WL.L, FRAME_W = WL.W;
const FRAME_Y = 404;
const HEAD_Y = FRAME_Y + 18;                             // where node() prints its own label
const RAIL_L = 150, RAIL_R = 1050;
const SLOT_W = 170;
const T_CREATE = RAIL_L, T_PS_END = T_CREATE + SLOT_W;   // the postStart slot
const T_DELETE = 700, T_SIGTERM = T_DELETE + SLOT_W;     // the preStop slot
const T_END = RAIL_R;
const BAR_H = 18, LANE_GAP = 10;
const HOOK_Y = FRAME_Y + 42;
const PROC_Y = HOOK_Y + BAR_H + LANE_GAP;                // the PID 1 lane
const AXIS_Y = PROC_Y + BAR_H + 10;                      // the lifetime rule
// Ticks hang below the axis, where a bar over the same x cannot swallow them.
const TICK_H = 10, TICK_W = 2;
// 32 so the tick words clear the band bottom edge.
const TICK_LABEL_Y = AXIS_Y + 32;
const BAND_TOP = HOOK_Y - 8, BAND_BOT = AXIS_Y + 16;     // over both lanes and the ticks
// The WL floor: 12 under the tick words, the lowest register in the frame.
const FRAME_H = TICK_LABEL_Y + 12 - FRAME_Y;
const CAP_Y = HEAD_Y;                                    // both half captions ride the frame header
// The start half is named, never boxed: a second rect would claim a bounded window the start side
// does not have.
const CAP_LEFT_X = 420;
const LANE_LABEL_X = RAIL_L - 12;

// One row of three chips (WL.L-05). No `grace remaining` chip: the band already draws that window.
const CHIP_N = 3, CHIP_GAP = 14;
const CHIP_W = (WL.W - CHIP_GAP * (CHIP_N - 1)) / CHIP_N;
const CHIP_X = (i) => WL.L + i * (CHIP_W + CHIP_GAP);
const CHIPS_TOP = 588;

const INK = Object.freeze({
  axis: 'rgba(255, 255, 255, 0.16)',
  tick: 'rgba(91, 184, 255, 0.85)',
  slot: 'rgba(91, 184, 255, 0.45)',
  band: 'rgba(91, 184, 255, 0.09)',
  bandEdge: 'rgba(91, 184, 255, 0.28)',
  // PID 1 draining under a signal: filled at low weight, because dashed means a slot that has not run.
  drain: 'rgba(91, 184, 255, 0.06)',
  drainEdge: 'rgba(91, 184, 255, 0.5)',
});

// A naked rect, so the geometry probe never scores a bar as a block, and it carries no role.
const bar = ({ key, x0, x1, y, fill, stroke, dash }) => P.raw({
  key,
  opacity: 0,
  make: () => {
    const r = rect({ x: x0, y, width: x1 - x0, height: BAR_H, rx: 4, ry: 4 });
    r.style.fill = fill;
    r.style.stroke = stroke;
    if (dash) r.style.strokeDasharray = dash;
    return r;
  },
});

// A tick is its rule AND its word under one key, so they appear together.
const tick = ({ key, x, label }) => P.raw({
  key,
  opacity: 0,
  make: () => {
    const rule = rect({ x: x - TICK_W / 2, y: AXIS_Y + 2, width: TICK_W, height: TICK_H });
    rule.style.fill = INK.tick;
    const word = text({ class: 'scheme-label code dim', x, y: TICK_LABEL_Y, 'text-anchor': 'middle' }, [label]);
    return g({}, [rule, word]);
  },
});

// Append order is z-order: lanes, rail, chips, packet layer, then the Pod and the actors so a ball
// passes behind them.
export const SCENE = {
  'aria-label': 'Container lifecycle hooks on one container timeline: the postStart slot opens on the same tick as the ENTRYPOINT with no ordering guarantee, the preStop slot is run to completion before SIGTERM, and the hook and the drain share one termination grace window',
  parts: [
    P.defs(),
    P.arrow({ x1: KUB_X, y1: REQ_Y, x2: RUN_R, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: RUN_R, y1: RESP_Y, x2: KUB_X, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'connector', points: SPINE, dim: true, dashed: true, role: 'cluster' }),
    P.wire({ key: 'req', x: WIRE_X, y: WIRE_Y }),
    P.wire({ key: 'via', x: VIA_X, y: VIA_Y, anchor: 'start' }),
    // The frame first, so everything it holds sits on top of it.
    P.node({ x: FRAME_X, y: FRAME_Y, w: FRAME_W, h: FRAME_H, label: 'container lifetime   ·   order, not duration' }),
    // Both lanes sit inside the band: that containment IS the claim that preStop and the drain
    // spend one budget.
    P.raw({
      key: 'graceBand',
      opacity: 0,
      make: () => {
        const r = rect({ x: T_DELETE, y: BAND_TOP, width: T_END - T_DELETE, height: BAND_BOT - BAND_TOP, rx: 6, ry: 6 });
        r.style.fill = INK.band;
        r.style.stroke = INK.bandEdge;
        return r;
      },
    }),
    P.raw({
      make: () => {
        const r = rect({ x: RAIL_L, y: AXIS_Y, width: RAIL_R - RAIL_L, height: 1.5 });
        r.style.fill = INK.axis;
        return r;
      },
    }),
    // Declared slots stand empty and fill in place later. Identical, because the declaration is symmetric.
    bar({ key: 'psSlot', x0: T_CREATE, x1: T_PS_END, y: HOOK_Y, fill: 'none', stroke: INK.slot, dash: '5 4' }),
    bar({ key: 'preSlot', x0: T_DELETE, x1: T_SIGTERM, y: HOOK_Y, fill: 'none', stroke: INK.slot, dash: '5 4' }),
    bar({ key: 'postStartBar', x0: T_CREATE, x1: T_PS_END, y: HOOK_Y, fill: 'var(--tint-fill)', stroke: 'rgb(var(--tint-base-rgb))' }),
    bar({ key: 'preStopBar', x0: T_DELETE, x1: T_SIGTERM, y: HOOK_Y, fill: 'var(--tint-fill)', stroke: 'rgb(var(--tint-base-rgb))' }),
    bar({ key: 'entryBar', x0: T_CREATE, x1: T_DELETE, y: PROC_Y, fill: 'var(--tint-fill)', stroke: 'rgb(var(--tint-base-rgb))' }),
    bar({ key: 'holdBar', x0: T_DELETE, x1: T_SIGTERM, y: PROC_Y, fill: 'var(--tint-fill)', stroke: 'rgb(var(--tint-base-rgb))' }),
    bar({ key: 'drainBar', x0: T_SIGTERM, x1: T_END, y: PROC_Y, fill: INK.drain, stroke: INK.drainEdge }),
    tick({ key: 'tickCreate', x: T_CREATE, label: 'created' }),
    tick({ key: 'tickDelete', x: T_DELETE, label: 'delete' }),
    tick({ key: 'tickSigterm', x: T_SIGTERM, label: 'SIGTERM' }),
    tick({ key: 'tickEnd', x: T_END, label: 'grace 0' }),
    // Names the window, not the field: the field is an integer of seconds, written on the Pod.
    P.tag({ key: 'bandLabel', x: midX(T_DELETE, T_END), y: CAP_Y, text: 'termination grace window: 30s', opacity: 0 }),
    P.tag({ key: 'startCap', x: CAP_LEFT_X, y: CAP_Y, text: 'no window: postStart has no deadline', anchor: 'start', opacity: 0 }),
    P.tag({ x: LANE_LABEL_X, y: HOOK_Y + BAR_H - 5, text: 'hook slots', anchor: 'end' }),
    P.tag({ x: LANE_LABEL_X, y: PROC_Y + BAR_H - 5, text: 'ENTRYPOINT', anchor: 'end' }),
    P.tag({ key: 'psExitTag', x: T_PS_END + 10, y: HOOK_Y + BAR_H - 5, text: 'exit 0', anchor: 'start', opacity: 0 }),
    P.tag({ key: 'preStopExitTag', x: T_SIGTERM + 10, y: HOOK_Y + BAR_H - 5, text: 'exit 0', anchor: 'start', opacity: 0 }),
    P.chip({ key: 'postStartChip', x: CHIP_X(0), y: CHIPS_TOP, w: CHIP_W, h: WL.CHIP_H, name: 'postStart hook', value: 'declared (exec)' }),
    P.chip({ key: 'preStopChip', x: CHIP_X(1), y: CHIPS_TOP, w: CHIP_W, h: WL.CHIP_H, name: 'preStop hook', value: 'declared (exec)' }),
    P.chip({ key: 'stateChip', x: CHIP_X(2), y: CHIPS_TOP, w: CHIP_W, h: WL.CHIP_H, name: 'container state', value: 'Waiting' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.pod({
      key: 'podGroup', id: 'podGroup', shellKey: 'shell', innerKey: 'containerBox',
      // The grace period is a Pod field, so it is the Pod sublabel.
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: 'terminationGracePeriodSeconds: 30', containers: 0,
      // No build-time opacity: every step pins the Pod own value, and the poster frame is `idle`.
      inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: '' },
    }),
    P.box({ key: 'runtime', x: RUN_X, y: WL.TOP_Y, w: TOP_W, h: WL.BOX_H, label: 'Runtime', sublabel: 'CRI exec / stop', role: 'cluster' }),
    P.box({ key: 'kubelet', x: KUB_X, y: WL.TOP_Y, w: TOP_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'hook runner', role: 'cluster' }),
  ],
  reset: {
    keys: ['kubelet', 'runtime', 'postStartChip', 'preStopChip', 'stateChip'],
    pods: ['podGroup'],
  },
};

// Every step pins EVERY rail entry, so a seek or a step back never leaves a segment behind.
const RAIL_ORDER = [
  ['psSlot', 'preSlot'],                                              // the two declared slots
  ['tickCreate', 'postStartBar', 'entryBar', 'startCap'],             // created
  ['psExitTag'],                                                      // postStart returned
  ['tickDelete', 'graceBand', 'bandLabel', 'preStopBar', 'holdBar'],  // delete, and the window
  ['tickSigterm', 'preStopExitTag', 'drainBar', 'tickEnd'],           // the signal, and the drain
];
const railAt = (n) => {
  const o = {};
  RAIL_ORDER.forEach((group, i) => group.forEach((k) => { o[k] = i < n ? 1 : 0; }));
  return o;
};

const DECLARED = 'declared (exec)', EXIT0 = 'exit 0', DRAINING = 'Running (draining)';

// The Runtime lights on receiving the ask. A self-initiated ask waits BEAT.lead so the lit Kubelet
// reads as the sender first (M-18).
const ask = (after) => (after
  ? F.top({ from: KUB_X, to: RUN_R, y: REQ_Y, after, name: 'req', lights: ['runtime'] })
  : F.top({ from: KUB_X, to: RUN_R, y: REQ_Y, delay: BEAT.lead, name: 'req', lights: ['runtime'] }));
// The answer leaves the runtime a beat after the Pod blink that produced it (M-15, up-arrow).
const ack = (name) => F.segment({ from: [RUN_R, RESP_Y], to: [KUB_X, RESP_Y], delay: BEAT.afterPulse, name, lights: ['kubelet'] });
// The exec travels the corridor and the Pod pulses on arrival as the handler starts in it (M-16).
const deliver = (name) => [
  F.route({ points: SPINE, after: 'req', name, pulse: 'podGroup' }),
];
// A rail segment is drawn by the arrival that earns it, never at step entry.
const draw = (keys, at) => keys.map((target) => F.reveal({ target, at }));

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { postStartChip: DECLARED, preStopChip: DECLARED, stateChip: 'Waiting' },
    opacity: { ...railAt(0), podGroup: OPACITY.pending },
    wires: { req: ' ', via: ' ' },
  },
  {
    id: 'slots',
    // Both slots are declared together, so their reveal is not staggered.
    duration: 3600,
    narration: 'A container may declare two lifecycle handlers of its own. The lifecycle.postStart field is bound to the moment the container is created, and lifecycle.preStop to the moment it is asked to stop. Each handler is one of exec, a command run inside the container, httpGet, a request Kubelet issues against the Pod IP by default, or sleep, a fixed pause. Neither slot has run yet.',
    chips: { postStartChip: DECLARED, preStopChip: DECLARED, stateChip: 'Waiting' },
    wires: { req: ' ', via: ' ' },
    opacity: { ...railAt(1), podGroup: OPACITY.pending },
    // Declaration only: a static outline on the chips, no flash (M-27, M-01).
    lit: ['postStartChip', 'preStopChip'],
    rewind: { opacity: railAt(0) },
    flow: draw(['psSlot', 'preSlot'], 0),
  },
  {
    id: 'start',
    duration: 4000,
    narration: 'The runtime creates the container and starts the ENTRYPOINT as PID 1. Kubelet fires postStart on that same moment, so the handler and the entrypoint run at once with no guarantee about which of them starts or finishes first. A handler that assumes the entrypoint is already listening is a race you wrote yourself.',
    chips: { preStopChip: DECLARED, stateChip: 'Waiting' },
    chipsCued: { postStartChip: 'running (exec)' },
    wires: { req: 'CRI StartContainer · ExecSync postStart', via: 'ENTRYPOINT starts, postStart runs beside it' },
    opacity: { ...railAt(2), podGroup: 1 },
    // Kubelet acts first and receives nothing, so it is lit at entry (R3).
    lit: ['kubelet'],
    rewind: { chips: { postStartChip: DECLARED }, opacity: railAt(1) },
    // One arrival draws both bars, so nothing between them draws an order.
    flow: [
      ask(),
      ...deliver('exec'),
      F.fade({ target: 'podGroup', from: OPACITY.pending, to: 1, dur: FADE.in, at: 'exec', fill: 'both', easing: 'ease-out' }),
      ...draw(['tickCreate', 'postStartBar', 'entryBar'], 'exec'),
      F.set({ at: 'exec', chipsCued: { postStartChip: 'running (exec)' } }),
    ],
  },
  {
    id: 'settled',
    duration: 3000,
    narration: 'The handler returns and Kubelet reads the exit code. Only now does the container report Running, because a postStart that hangs holds it out of that state. A non-zero exit makes Kubelet kill the container, and the Pod restartPolicy decides what happens next.',
    chips: { preStopChip: DECLARED },
    chipsCued: { postStartChip: EXIT0, stateChip: 'Running' },
    wires: { req: 'CRI ExecSync · postStart · exit 0', via: ' ' },
    opacity: { ...railAt(3), podGroup: 1 },
    // The Runtime sends and receives nothing here, so it carries the entry cue.
    lit: ['runtime'],
    rewind: { chips: { postStartChip: 'running (exec)', stateChip: 'Waiting' }, opacity: railAt(2) },
    // The handler finishes inside the container: the Pod blinks first, the result leaves on BEAT.afterPulse (M-15).
    flow: [
      F.pulse({ pod: 'podGroup' }),
      ack('ack'),
      ...draw(['psExitTag'], 'ack'),
      F.set({ at: 'ack', chipsCued: { postStartChip: EXIT0, stateChip: 'Running' } }),
    ],
  },
  {
    id: 'delete',
    duration: 4200,
    narration: 'A delete opens the termination grace window. Kubelet runs preStop and waits until it returns or the window runs out: the signal comes after this handler, where the ENTRYPOINT never waited for postStart. PID 1 is still running and has had nothing delivered to it. Whatever preStop spends comes out of the same window the stop itself has to finish in.',
    chips: { postStartChip: EXIT0, stateChip: 'Running' },
    chipsCued: { preStopChip: 'running (sync)' },
    wires: { req: 'CRI ExecSync · preStop', via: 'preStop handler runs in the container' },
    opacity: { ...railAt(4), podGroup: 1 },
    lit: ['kubelet'],
    rewind: { chips: { preStopChip: DECLARED }, opacity: railAt(3) },
    flow: [
      ask(),
      ...deliver('exec'),
      ...draw(['tickDelete', 'graceBand', 'bandLabel', 'preStopBar', 'holdBar'], 'exec'),
      F.set({ at: 'exec', chipsCued: { preStopChip: 'running (sync)' } }),
    ],
  },
  {
    id: 'stop',
    // Three hops make this the longest step by construction (M-34).
    duration: 4500,
    narration: 'The handler returns, and only then does Kubelet ask the runtime for StopContainer, which delivers SIGTERM to PID 1, unless the image defines a different STOPSIGNAL. The signal lands where the hook left off, so a slow handler leaves the app less of the window to drain in. Graceful Pod Shutdown owns the rest of that window and the SIGKILL if anything is still alive at zero.',
    chips: { postStartChip: EXIT0 },
    // SIGTERM does not end the container: PID 1 is still draining, so the state stays Running.
    chipsCued: { preStopChip: EXIT0, stateChip: DRAINING },
    wires: { req: 'preStop returned · CRI StopContainer', via: 'SIGTERM to PID 1' },
    // The Runtime sends the return before it receives anything (R3). Kubelet lights on that return,
    // which makes it the sender of StopContainer.
    lit: ['runtime'],
    // Final state pinned on the static path too, so a cancel between steps does not flash to default.
    opacity: { ...railAt(5), podGroup: OPACITY.terminating },
    rewind: { chips: { preStopChip: 'running (sync)', stateChip: 'Running' }, opacity: railAt(4) },
    // The request for the signal cannot leave before the hook returns: that order is the mechanism.
    flow: [
      F.pulse({ pod: 'podGroup' }),
      ack('ret'),
      ...draw(['preStopExitTag'], 'ret'),
      F.set({ at: 'ret', chipsCued: { preStopChip: EXIT0 } }),
      ask('ret'),
      F.route({ points: SPINE, after: 'req', name: 'sig', pulse: 'podGroup' }),
      ...draw(['tickSigterm', 'drainBar', 'tickEnd'], 'sig'),
      F.set({ at: 'sig', chipsCued: { stateChip: DRAINING } }),
      F.fade({ target: 'podGroup', from: 1, to: OPACITY.terminating, dur: FADE.out, at: 'sig', fill: 'both', easing: 'ease-in' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
