import { P, F, defineCard, laneY, midX, WL, BEAT, FADE, OPACITY } from './workloads-kit.js';
import { rect, text, g } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/workloads-poststart-prestop-hooks.md

// An INSTRUMENT, not an actor row over a Node floor. The subject is WHEN the two hook slots sit in
// one container life and how differently each one behaves, so the picture is a time rail under the
// pair that acts and the Pod it acts on. The frame around that rail holds no Pod and is not a
// Node: it is the enclosure the catalog already uses for a region that is not one (`Control
// plane`, `Storage backend`), and it carries the caption as its label.

// Panel measured at x<=396.55, y<=254.66, both worst at 1100x800 on the poster frame (1600x1000
// reads 177.44 and 1280x860 reads 213.92), so the Pod at y=280 stands 25.34 clear of the deepest
// narration this card can draw, on the 26.55 units of its left edge that stand in the panel column
// at all.

// The 232 pair of the WL exemplar: the box the corridor leaves is centred on WL.CX (WL.L-07) and
// the other is right aligned on WL.R. That centred box is the RUNTIME here and not the Kubelet,
// because the lane into the container leaves the runtime, so the request rides WL.A-01's request
// lane RIGHT TO LEFT. A direction, not a role swap: REQ_Y still carries the ask.
const TOP_W = 232;
const RUN_X = WL.CX - TOP_W / 2;                         // 484..716, Runtime, centred on CX
const KUB_X = WL.R - TOP_W;                              // 908..1140, Kubelet, right edge on WL.R
const RUN_R = RUN_X + TOP_W;                             // 716, the face the pair talks across
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(RUN_R, KUB_X);                       // 812
const WIRE_Y = WL.TOP_Y - 12;                            // 28, above the actor row (WL.A-02)

// The lane into the container leaves the RUNTIME, not Kubelet: Kubelet is a CRI client and never
// touches a container, which is half the subject. Both wire labels that ride this say so.
// It is one straight segment, the exemplar's own corridor: the runtime bottom face midpoint is
// WL.SPINE_X and so is the Pod top face midpoint, so the jog the old 150 wide pair needed is gone.
const POD_W = 460, POD_H = 100, POD_Y = 280;
const POD_X = WL.CX - POD_W / 2;                         // 370..830, centred on CX
const CONT_W = 300, CONT_X = WL.CX - CONT_W / 2;
const POD_INNER = { dx: CONT_X - POD_X, dy: 26, w: CONT_W, h: 56 };
const SPINE = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, POD_Y]];
// The second wire label, for the corridor rather than the top row: what rides the spine is not what
// rides the actor lanes, and T-22 lets a label name only the traffic on its own lane. It sits right
// of the trunk, on the MIDDLE of the corridor and derived from its two ends: the +4 is the ink,
// which runs baseline-11.2 to baseline+3.4, so the BLOCK centres on the midpoint and not the
// baseline. At the 250 it carried before it read as a caption on the Pod.
const VIA_X = WL.SPINE_X + 14, VIA_Y = (WL.TOP_BOTTOM + POD_Y) / 2 + 4;   // 204

// THE RAIL. It draws ORDER, never DURATION: a bar length says what came first and what overlapped
// what, and no tick, cap or caption attaches a number to one. The single number the instrument
// carries is the grace window, because 30s is a value the card actually states, and the frame
// label says so out loud so no proportion on it reads back as seconds. The two hook slots are
// therefore drawn at ONE width: unequal bars would claim one handler outran the other.

// THE FRAME IS THE INSTRUMENT'S WALL, and every y below hangs off its top rather than off a
// number of its own. Two rows of bars, an axis and four ticks standing on open canvas gave a
// reader nothing saying where the instrument began, where it ended or what it was. Full width on
// WL.L..WL.R so it lines up with the chip strip under it, and 34 clear of that strip.
const FRAME_X = WL.L, FRAME_W = WL.W;                    // 60..1140
const FRAME_Y = 404, FRAME_H = 150;                      // 404..554
const HEAD_Y = FRAME_Y + 18;                             // 422, where node() prints its own label
const RAIL_L = 150, RAIL_R = 1050;                       // 900 wide, centred on WL.CX, 90 inside
const SLOT_W = 170;                                      // BOTH hook slots, and they are equal
const T_CREATE = RAIL_L, T_PS_END = T_CREATE + SLOT_W;   // 150..320, the postStart slot
const T_DELETE = 700, T_SIGTERM = T_DELETE + SLOT_W;     // 700..870, the preStop slot
const T_END = RAIL_R;                                    // 1050, the far edge of the window
const BAR_H = 18, LANE_GAP = 10;
const HOOK_Y = FRAME_Y + 40;                             // 444..462, the two hook slots
const PROC_Y = HOOK_Y + BAR_H + LANE_GAP;                // 472..490, PID 1
const AXIS_Y = PROC_Y + BAR_H + 10;                      // 500, the lifetime rule
// The ticks hang BELOW the axis. Above it they sat in the 12 units between the bar bottom and the
// rule, where a bar drawn over that x reads the mark as its own edge and the two ticks inside the
// window disappeared under the band entirely.
const TICK_H = 10, TICK_W = 2;
// 32 and not the 26 the rail carried on open canvas: at 26 the tick words ink from 515 and the
// band's own bottom edge at 516 ruled through their ascenders. Measured at 1100x800, where the
// glyphs are tallest in viewBox units.
const TICK_LABEL_Y = AXIS_Y + 32;                        // 532, inking 521..535.7, 18.3 off the wall
const BAND_TOP = HOOK_Y - 8, BAND_BOT = AXIS_Y + 16;     // 436..516, over both lanes and the ticks
const CAP_Y = HEAD_Y;                                    // both half captions ride the frame header
// The start half is NAMED and never boxed, start-anchored clear of the frame label (which inks to
// 369.6 at 1600x1000) and ending short of the seam at T_DELETE. A second rect here would draw a
// second bounded window, and the one claim this card makes about the start side is that there is
// none: two rects of unequal width also invite the duration reading the caption denies.
const CAP_LEFT_X = 420;
const LANE_LABEL_X = RAIL_L - 12;                        // 138, right-anchored off the rail

// Chips as a single full-width row of three (WL.L-05: never four, and 350.67 is the measured width
// the longest value here, `declared (exec)`, sits well inside). `grace remaining` is deliberately
// gone: the band draws that window, and a value written in a chip AND drawn as a bar is the one
// way an instrument card contradicts itself.
const CHIP_N = 3, CHIP_GAP = 14;
const CHIP_W = (WL.W - CHIP_GAP * (CHIP_N - 1)) / CHIP_N;
const CHIP_X = (i) => WL.L + i * (CHIP_W + CHIP_GAP);
const CHIPS_TOP = 588;                                   // 588..622

const INK = Object.freeze({
  axis: 'rgba(255, 255, 255, 0.16)',
  tick: 'rgba(91, 184, 255, 0.85)',
  slot: 'rgba(91, 184, 255, 0.45)',
  band: 'rgba(91, 184, 255, 0.09)',
  bandEdge: 'rgba(91, 184, 255, 0.28)',
  // The drain is PID 1 still running under a signal it has been sent, so it is a filled bar at a
  // lower weight. A dashed outline is this card's word for a slot that has NOT run, and reusing it
  // here said the app was waiting to start draining rather than draining.
  drain: 'rgba(91, 184, 255, 0.06)',
  drainEdge: 'rgba(91, 184, 255, 0.5)',
});

// A bar is a naked rect: box() here would be scored as a block by the geometry probe and as a body
// by CENTRE, and an 18 unit tread is neither. P.raw bypasses the kit binding by construction, and
// these carry no role at all, so probePaint never walks them, which is what a graduation wants.
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

// A tick is its rule AND its word: they appear together or the mark is a decoration (the Timeline
// family fails exactly there), so one key carries both.
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

// The list order IS the append order, so it is the z-order: the lanes and their labels first, then
// the rail from the band upward, then the chips and the packet layer, and the Pod and the two
// actors last so a ball passes behind them rather than over their labels.
export const SCENE = {
  'aria-label': 'Container lifecycle hooks on one container timeline: the postStart slot opens on the same tick as the ENTRYPOINT with no ordering guarantee, the preStop slot is run to completion before SIGTERM, and the hook and the drain share one termination grace window',
  parts: [
    P.defs(),
    P.arrow({ x1: KUB_X, y1: REQ_Y, x2: RUN_R, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: RUN_R, y1: RESP_Y, x2: KUB_X, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'connector', points: SPINE, dim: true, dashed: true, role: 'cluster' }),
    P.wire({ key: 'req', x: WIRE_X, y: WIRE_Y }),
    P.wire({ key: 'via', x: VIA_X, y: VIA_Y, anchor: 'start' }),
    // The wall, drawn before everything it holds so every bar, tick and string sits on top of it.
    // Its label is the caption the rail used to carry as a free tag at (150, 474), which is the
    // whole point of the frame: the instrument now says what it is at its own top-left corner.
    P.node({ x: FRAME_X, y: FRAME_Y, w: FRAME_W, h: FRAME_H, label: 'container lifetime   ·   order, not duration' }),
    // The band is drawn first of the rail so both lanes sit inside it rather than beside it: that
    // containment IS the claim that preStop and the drain spend one budget.
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
    // The two slots stand empty from the step that declares them, and each fills later in place.
    // They are identical rects because the DECLARATION is symmetric: everything that follows is not.
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
    // The band names the WINDOW, never the field: the Pod below already writes
    // `terminationGracePeriodSeconds: 30`, and that field is an integer of seconds, not `30s`.
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
      // The grace period is a POD field (`spec.terminationGracePeriodSeconds`), so it is the POD
      // sublabel: on the container it stated a field the container API does not carry.
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

// The rail in the order the life happens in. Every step pins EVERY entry, so a seek, a step back or
// a reduced replay can never leave a segment of the timeline behind, and `rewind` is then one call
// on the group the step is about to draw.
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

// Kubelet asks over CRI and the runtime RECEIVES the ask, so it lights on arrival. The ack hangs
// off whatever landed last, and never before it: an answer that arrives before the thing it
// answers reports ExecSync complete before the handler has been exec-ed.
// A self-initiated ask waits BEAT.lead, so the Kubelet the step lit at entry is on screen as the
// SENDER before its own ball leaves it (M-18). Chained off a return there is nothing to wait for:
// the box lit itself on that arrival a beat ago.
const ask = (after) => (after
  ? F.top({ from: KUB_X, to: RUN_R, y: REQ_Y, after, name: 'req', lights: ['runtime'] })
  : F.top({ from: KUB_X, to: RUN_R, y: REQ_Y, delay: BEAT.lead, name: 'req', lights: ['runtime'] }));
// The answer leaves the runtime a beat after the Pod blink that produced it (M-15, up-arrow).
const ack = (name) => F.segment({ from: [RUN_R, RESP_Y], to: [KUB_X, RESP_Y], delay: BEAT.afterPulse, name, lights: ['kubelet'] });
// The handler runs INSIDE the container: the ask hops to the runtime, the exec order travels down
// the corridor, and the Pod pulses on arrival as the handler starts running in it (M-16).
const deliver = (name) => [
  F.route({ points: SPINE, after: 'req', name }),
  F.pulse({ pod: 'podGroup', at: name }),
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
    // 364 characters at 3600 reads 9.89 ms per character against a catalog median of 10.07. The
    // step stands still for 86 percent of that, which is what a declaration beat costs: the two
    // slots are declared TOGETHER, so staggering their reveal to buy motion would draw an order
    // between them that the spec does not have.
    duration: 3600,
    narration: 'A container may declare two lifecycle handlers of its own. The lifecycle.postStart field is bound to the moment the container is created, and lifecycle.preStop to the moment it is asked to stop. Each handler is one of exec, a command run inside the container, httpGet, a request Kubelet issues against the Pod IP by default, or sleep, a fixed pause. Neither slot has run yet.',
    chips: { postStartChip: DECLARED, preStopChip: DECLARED, stateChip: 'Waiting' },
    wires: { req: ' ', via: ' ' },
    opacity: { ...railAt(1), podGroup: OPACITY.pending },
    // Declaration only, so nothing travels the lanes and the two named chips carry the beat as a
    // static outline: M-27 rules out the block flash, since flashChips animates brightness and
    // M-01 keeps that on Pods.
    lit: ['postStartChip', 'preStopChip'],
    rewind: { opacity: railAt(0) },
    flow: draw(['psSlot', 'preSlot'], 0),
  },
  {
    id: 'start',
    // 4000 and not 3600: BEAT.lead pushed the span to 3200, and 400ms of hold is not a payoff
    // frame. The pace stays where this card's other steps sit, 12.78 ms per character.
    duration: 4000,
    narration: 'The runtime creates the container and starts the ENTRYPOINT as PID 1. Kubelet fires postStart on that same moment, so the handler and the entrypoint run at once with no guarantee about which of them starts or finishes first. A handler that assumes the entrypoint is already listening is a race you wrote yourself.',
    chips: { preStopChip: DECLARED, stateChip: 'Waiting' },
    chipsCued: { postStartChip: 'running (exec)' },
    wires: { req: 'CRI StartContainer · ExecSync postStart', via: 'ENTRYPOINT starts, postStart runs beside it' },
    opacity: { ...railAt(2), podGroup: 1 },
    // Kubelet ACTS FIRST here and receives nothing, so it is lit at entry: R3 exempts a source
    // that sends no later than it receives, and a ball leaving a dark box has no sender.
    lit: ['kubelet'],
    rewind: { chips: { postStartChip: DECLARED }, opacity: railAt(1) },
    // The two bars are drawn by ONE arrival, so they open on one tick and nothing between them
    // draws an order: that absence is the whole claim the step makes.
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
    // The RUNTIME is the sender on this step and receives nothing, so it carries the entry cue and
    // stands lit for the 800 of BEAT.afterPulse before its answer leaves. Kubelet lights on arrival.
    lit: ['runtime'],
    rewind: { chips: { postStartChip: 'running (exec)', stateChip: 'Waiting' }, opacity: railAt(2) },
    // The handler finishes INSIDE the container, so the Pod blinks first and the result leaves on
    // BEAT.afterPulse (M-15, up-arrow). Both readouts turn over when that answer lands, not before.
    flow: [
      F.pulse({ pod: 'podGroup' }),
      ack('ack'),
      ...draw(['psExitTag'], 'ack'),
      F.set({ at: 'ack', chipsCued: { postStartChip: EXIT0, stateChip: 'Running' } }),
    ],
  },
  {
    id: 'delete',
    // 4200 for the same reason `start` reads 4000: BEAT.lead is 800 of the span, and the hold that
    // is left has to be long enough to look at.
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
    // Three hops in one step (the return, the stop request, the signal) put the span at 4044, so
    // this is the card's longest step by construction (M-34). 4500 leaves 456ms between the SIGTERM
    // landing and the auto-advance, where 4200 left 156 and made the payoff frame the one nobody
    // gets to look at.
    duration: 4500,
    narration: 'The handler returns, and only then does Kubelet ask the runtime for StopContainer, which delivers SIGTERM to PID 1, unless the image defines a different STOPSIGNAL. The signal lands where the hook left off, so a slow handler leaves the app less of the window to drain in. Graceful Pod Shutdown owns the rest of that window and the SIGKILL if anything is still alive at zero.',
    chips: { postStartChip: EXIT0 },
    // The signal does not end the container: `Terminated` carries an exit code and a finishedAt, and
    // the drain the card draws is PID 1 still executing, so the state stays Running through it.
    chipsCued: { preStopChip: EXIT0, stateChip: DRAINING },
    wires: { req: 'preStop returned · CRI StopContainer', via: 'SIGTERM to PID 1' },
    // The runtime opens lit because it sends the return, and it sends at 800 against a receive at
    // 1600, which is the order R3 exempts. Kubelet stays dark and lights on that return landing,
    // which is also what makes it the sender of the StopContainer that follows.
    lit: ['runtime'],
    // Final state pinned on the static path too, so a cancel between steps does not flash to default.
    opacity: { ...railAt(5), podGroup: OPACITY.terminating },
    rewind: { chips: { preStopChip: 'running (sync)', stateChip: 'Running' }, opacity: railAt(4) },
    // The hook returns first and the request for the signal cannot leave before it: that ORDER is
    // the mechanism, and the SIGTERM tick lands on the right edge of the bar the hook just filled.
    flow: [
      F.pulse({ pod: 'podGroup' }),
      ack('ret'),
      ...draw(['preStopExitTag'], 'ret'),
      F.set({ at: 'ret', chipsCued: { preStopChip: EXIT0 } }),
      ask('ret'),
      F.route({ points: SPINE, after: 'req', name: 'sig' }),
      F.pulse({ pod: 'podGroup', at: 'sig' }),
      ...draw(['tickSigterm', 'drainBar', 'tickEnd'], 'sig'),
      F.set({ at: 'sig', chipsCued: { stateChip: DRAINING } }),
      F.fade({ target: 'podGroup', from: 1, to: OPACITY.terminating, dur: FADE.out, at: 'sig', fill: 'both', easing: 'ease-in' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
