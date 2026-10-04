import { P, F, defineCard, ladder, laneY, midX, WL, FADE, BEAT, OPACITY } from './workloads-kit.js';
import { rect } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/workloads-crashloopbackoff.md

// An INSTRUMENT over a Node floor, not a ladder beside a chip column: the delay before each restart
// is drawn as a bar whose height doubles, and the 300s ceiling as the line the last bars flatten
// against. Panel worst case x<=397, y<=205, 225 reserved as a floor, and a longer narration
// invalidates that. Kubelet sits INSIDE the Node, because the backoff and its cap are per-node
// kubelet state, so there is no actor row and no vertical corridor on this card.

// The frame is NOT the full WL width: nine bars on one pitch are 506 wide, and a full-width frame
// would either open a gap before the ghost bar or widen the chip column past its strings. The
// frame is sized off the instrument instead and centred on WL.CX, so the content centre holds by
// construction, the chip column stands on the frame's left edge and the axis on its right.
const BAR_W = 42, BAR_PITCH = 58, BAR_N = 9;
const AXIS_IN = 16;                                      // the first bar clears the axis rule
const CHART_W = AXIS_IN + (BAR_N - 1) * BAR_PITCH + BAR_W;   // 522
const CHIP_W = 442, COL_GAP = 40;                        // the chip column, and its gap to the axis
const FR_W = CHIP_W + COL_GAP + CHART_W;                 // 1004
const FR_L = WL.CX - FR_W / 2, FR_R = FR_L + FR_W;       // 98..1102

// State chips as a column in the left band, which only opens below the panel.
const CHIP_GAP = 8;
const CHIPS_TOP = 240;                                   // measured, clear of the 225 floor
const CHIP_X = FR_L;                                     // 98..540, below the panel
const CHIP_Y = ladder({ y: CHIPS_TOP, rowH: WL.CHIP_H, gap: CHIP_GAP });   // 240 / 282 / 324 / 366

// The chart takes the right band: its right edge is the frame's own, so the axis, the last bar and
// the frame stand on one vertical, and its baseline is the chip column's bottom edge.
const CH_R = FR_R, CH_L = CH_R - CHART_W;                // 580..1102
const BASE_Y = CHIP_Y(3) + WL.CHIP_H;                    // 400, cpu zero of the instrument
// 0.8 units per second: 300s stands 240 tall and 10s stands 8, and that ratio IS the lesson. The
// ceiling then sits at 160, which is 45 below the shallowest panel bottom and right of its wall.
const SCALE = 0.8;
const SEC = (s) => s * SCALE;
const CAP_S = 300;
const CAP_Y = BASE_Y - SEC(CAP_S);                       // 160, the ceiling line
// One bar per restart: the immediate first one, six doublings, one more at the cap, then the one
// that has not happened, after the healthy run, on the same pitch as the rest.
const DELAYS = [0, 10, 20, 40, 80, 160, 300, 300, 10];
const BAR_X = (i) => CH_L + AXIS_IN + i * BAR_PITCH;     // 596 .. 1060, ends 1102
const BAR_CX = (i) => BAR_X(i) + BAR_W / 2;
const BAR_KEYS = DELAYS.map((_, i) => 'bar' + i);
const GHOST = 8;                                         // the bar of the crash that has not come
// A bar of 0s is a mark on the baseline, the graduation weight, or the first restart is invisible.
const MARK_H = 3.5;
const LBL_DY = 8;                                        // bar label baseline above the bar top
const AXIS_CAP_Y = BASE_Y + 18;                          // 418, the two captions under the axis

const NODE_Y = 440, NODE_H = 160;                        // 440..600
const IN = 40;                                           // the inset of both blocks from the frame walls
const KUBE_W = 240, KUBE_X = FR_L + IN;                  // 138..378, inside the frame
const KUBE_Y = NODE_Y + (NODE_H - WL.BOX_H) / 2;         // 480..560, centred in the frame
const KUBE_R = KUBE_X + KUBE_W;                          // 378, the face the lanes leave and land on
const POD_X = 640, POD_R = FR_R - IN, POD_W = POD_R - POD_X, POD_H = 116;   // 640..1062
const POD_Y = NODE_Y + 22;                               // 462..578
const CONT_W = 300, CONT_X = POD_X + (POD_W - CONT_W) / 2, CONT_H = 64;   // 701..1001
const CONT_Y = POD_Y + 30;                               // 492..556
// The pair: the restart order rides right on the upper lane, the exit report rides left on the
// lower one, mirrored around the face centre so neither endpoint stands alone (A-03).
const LANE_CY = midX(KUBE_Y, KUBE_Y + WL.BOX_H);         // 520
const { out: RESTART_Y, back: EXIT_Y } = laneY(LANE_CY, WL.LANE_DY);   // 508 / 532
const LANE_RESTART = { from: [KUBE_R, RESTART_Y], to: [POD_X, RESTART_Y] };
const LANE_EXIT = { from: [POD_X, EXIT_Y], to: [KUBE_R, EXIT_Y] };
const WIRE_X = midX(KUBE_R, POD_X);                      // 509
const WIRE_OUT_Y = RESTART_Y - 12, WIRE_IN_Y = EXIT_Y + 18;   // 496 / 550

// Presentation shades for the instrument, not lifecycle phases: an axis has no phase. The bar takes
// the dialog's own tint tokens, which a bare rect inherits, so nothing is hand-copied here.
const RULE = Object.freeze({
  axis: 'rgba(255, 255, 255, 0.16)',
  cap: 'rgba(255, 255, 255, 0.35)',
});

// A restart that has not happened yet DIMS rather than vanishing (C-14), so the staircase reads as
// a scale from the poster frame on, and each step raises the bars it names to 1.
const AHEAD = OPACITY.terminating;
// A bar is a naked rect: box() would be scored as a block by the geometry probe and as a body by
// CENTRE, and a bar 8 units tall is neither. Every bar is built at its final height and shown by
// opacity, so a step states the whole history in one field and nothing is animated unpinned.
const barH = (s) => (s === 0 ? MARK_H : SEC(s));
const barRect = (s, i) => {
  const r = rect({ class: 'scheme-box-rect', x: BAR_X(i), y: BASE_Y - barH(s), width: BAR_W, height: barH(s), rx: s === 0 ? 0 : 3, ry: s === 0 ? 0 : 3 });
  r.style.fill = i === GHOST ? 'none' : 'var(--tint-fill)';
  r.style.stroke = 'rgb(var(--tint-base-rgb))';
  if (i === GHOST) r.style.strokeDasharray = '4 3';
  return r;
};
// The bar and its own value above it, grouped so the pair shows and hides as one.
const barGroup = (s, i) => P.group({ key: BAR_KEYS[i], opacity: AHEAD, parts: [
  P.raw({ make: () => barRect(s, i) }),
  P.tag({ x: BAR_CX(i), y: BASE_Y - barH(s) - LBL_DY, text: `${s}s` }),
] });

// The ladder fills as a PREFIX, never a single bar: a step names how far the doubling has climbed.
// Every step pins all nine, and the ninth is the ghost that only the reset step raises.
const shown = (upTo, ghost = AHEAD) => Object.fromEntries(BAR_KEYS.map((k, i) => [k, i === GHOST ? ghost : i <= upTo ? 1 : AHEAD]));

// Z-order: the chip column and the instrument, then the Node frame, then the lane pair and the
// packet layer ABOVE the frame (its translucent fill would otherwise grey both the lanes and the
// ball, since the pair runs inside it), then Pod / Kubelet above the ball, and the wire labels last.
export const SCENE = {
  'aria-label': 'CrashLoopBackOff: the first restart is immediate, then Kubelet inserts an exponentially growing delay before each later restart, doubling to a 300s cap',
  parts: [
    P.defs(),
    P.chip({ key: 'stateChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'container state', value: 'Running' }),
    P.chip({ key: 'reasonChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'reason', value: 'none' }),
    P.chip({ key: 'restartChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'restartCount', value: '0' }),
    P.chip({ key: 'delayChip', x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'current backoff', value: '0s' }),
    // The instrument: a baseline, a ceiling, the nine bars and two standing captions.
    P.raw({ make: () => { const r = rect({ x: CH_L, y: BASE_Y, width: CH_R - CH_L, height: 1.5 }); r.style.fill = RULE.axis; return r; } }),
    P.raw({ make: () => { const r = rect({ x: CH_L, y: CAP_Y, width: CH_R - CH_L, height: 1.5 }); r.style.fill = RULE.cap; return r; } }),
    P.tag({ x: CH_L, y: CAP_Y - LBL_DY, anchor: 'start', text: '300s cap · per-node default' }),
    ...DELAYS.map(barGroup),
    P.tag({ x: CH_L, y: AXIS_CAP_Y, anchor: 'start', text: 'delay before each restart' }),
    // The counterfactual caption of the reset step (T-35), under the axis because every place
    // above the ghost bar is inside the two capped bars.
    P.wire({ key: 'next', x: CH_R, y: AXIS_CAP_Y, anchor: 'end' }),
    P.node({ key: 'nodeEl', x: FR_L, y: NODE_Y, w: FR_W, h: NODE_H, label: 'Node-1' }),
    P.arrow({ ...LANE_RESTART, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ ...LANE_EXIT, dim: true, dashed: true, role: 'cluster' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.pod({
      key: 'podGroup', id: 'podGroup',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      // No build-time opacity: every step pins the Pod's own, and the poster frame is `idle`.
      inner: { dx: CONT_X - POD_X, dy: CONT_Y - POD_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'restartPolicy: Always' },
    }),
    P.box({ key: 'kubelet', x: KUBE_X, y: KUBE_Y, w: KUBE_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'restart manager + backoff', role: 'cluster' }),
    P.wire({ key: 'out', x: WIRE_X, y: WIRE_OUT_Y }),
    P.wire({ key: 'in', x: WIRE_X, y: WIRE_IN_Y }),
  ],
  reset: {
    keys: ['kubelet', 'stateChip', 'reasonChip', 'restartChip', 'delayChip'],
    pods: ['podGroup'],
  },
};

// The exit report and the restart order, the two hops every travelling step is built from.
const exitReport = (p = {}) => F.segment({ ...LANE_EXIT, name: 'exit', lights: ['kubelet'], ...p });
// A bar comes up on the beat the narration reaches it: revealAt from AHEAD to 1, pinned above.
const grow = (i, p) => F.reveal({ target: BAR_KEYS[i], from: AHEAD, ...p });
const STAGGER = 400;

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    // Every step pins the whole record, so the four chips are always stated together.
    chips: { stateChip: 'Running', reasonChip: 'none', restartChip: '0', delayChip: '0s' },
    opacity: { podGroup: 1, ...shown(-1) },
  },
  {
    id: 'first-crash',
    duration: 3600,
    narration: 'The container process exits with a non-zero code and Kubelet observes the termination. With restartPolicy Always, Kubelet restarts it immediately the first time and arms a 10s base delay for the next one. Once the new container starts, restartCount becomes 1.',
    chips: { stateChip: 'Running (restarted)', reasonChip: 'none', restartChip: '1', delayChip: '10s · base' },
    wires: { in: 'container exited, code 1', out: 'restart now, next wait 10s' },
    opacity: { podGroup: 1, ...shown(0) },
    lit: ['stateChip', 'restartChip', 'delayChip'],
    // The pulse at 0 is the CRASH, so the record reads what idle left until the restart lands
    // and all three chips turn over on it together (P-03, P-04).
    rewind: { chips: { stateChip: 'Running', restartChip: '0', delayChip: '0s' } },
    flow: [
      // Pod blinks first (the container just crashed), the exit goes to Kubelet, and the restart
      // comes straight back: the immediate one, the 0s mark on the chart.
      F.pulse({ pod: 'podGroup' }),
      exitReport({ delay: BEAT.afterPulse }),
      F.segment({ ...LANE_RESTART, after: 'exit', name: 'restart' }),
      F.pulse({ pod: 'podGroup', at: 'restart' }),
      F.set({ at: 'restart', chips: { stateChip: 'Running (restarted)', restartChip: '1', delayChip: '10s · base' } }),
      grow(0, { at: 'restart' }),
    ],
  },
  {
    id: 'backoff-named',
    duration: 3000,
    narration: 'The fresh container crashes again almost immediately. This second restart is the one that waits 10s, and the next crash doubles the delay to 20s. While Kubelet holds off the third restart the container state is Waiting with reason CrashLoopBackOff, which surfaces in kubectl get pods.',
    chips: { stateChip: 'Waiting', reasonChip: 'CrashLoopBackOff', restartChip: '2', delayChip: '20s · doubled' },
    wires: { in: 'container exited again', out: 'hold restart, 20s' },
    opacity: { podGroup: OPACITY.notready, ...shown(2) },
    lit: ['restartChip', 'stateChip', 'reasonChip', 'delayChip'],
    // Kubelet decides to hold only when the exit report lands, where the bars grow, so the four
    // chips wait for that arrival and read what first-crash left until then.
    rewind: { chips: { stateChip: 'Running (restarted)', reasonChip: 'none', restartChip: '1', delayChip: '10s · base' } },
    flow: [
      F.pulse({ pod: 'podGroup' }),
      exitReport({ delay: BEAT.afterPulse }),
      // The Pod dims into Waiting where the chips say so, not under a state still reading Running.
      F.fade({ target: 'podGroup', from: 1, to: OPACITY.notready, dur: FADE.out, at: 'exit', fill: 'both', easing: 'ease-in' }),
      F.set({ at: 'exit', chips: { stateChip: 'Waiting', reasonChip: 'CrashLoopBackOff', restartChip: '2', delayChip: '20s · doubled' } }),
      grow(1, { at: 'exit' }),
      grow(2, { at: 'exit', plus: STAGGER }),
    ],
  },
  {
    id: 'doubling',
    duration: 2600,
    narration: 'The crashes keep coming and the backoff delay doubles with each failure, climbing 40s then 80s then 160s. The restartCount keeps incrementing on every attempt. The exponential growth is per container, so a hot-looping process cannot saturate the Node.',
    chips: { stateChip: 'Waiting', reasonChip: 'CrashLoopBackOff', restartChip: '5', delayChip: '160s · doubling' },
    wires: { out: 'hold restart, 160s' },
    opacity: { podGroup: OPACITY.notready, ...shown(5) },
    // Kubelet only waits between attempts, nothing travels and the Pod is untouched: the climb
    // is the three bars growing in, one beat apart.
    lit: ['kubelet', 'reasonChip', 'restartChip', 'delayChip'],
    flow: [
      grow(3, { delay: BEAT.lead }),
      grow(4, { delay: BEAT.lead + STAGGER }),
      grow(5, { delay: BEAT.lead + STAGGER * 2 }),
    ],
  },
  {
    id: 'cap',
    duration: 2600,
    narration: 'The next doubling would exceed 300s, so the delay is clamped at the 300s ceiling, a per-node default since 1.35, and stays there. Kubelet now retries the container at most once every 5 minutes for as long as it keeps failing. The restartCount continues to climb at this slow cadence.',
    chips: { stateChip: 'Waiting', reasonChip: 'CrashLoopBackOff', restartChip: '7', delayChip: '300s · capped' },
    wires: { out: 'retry every 5 min' },
    opacity: { podGroup: OPACITY.notready, ...shown(7) },
    // The cap holds: two bars reach the ceiling line and stop there, and nothing travels.
    lit: ['restartChip', 'kubelet', 'delayChip', 'reasonChip'],
    flow: [
      grow(6, { delay: BEAT.lead }),
      grow(7, { delay: BEAT.lead + STAGGER }),
    ],
  },
  {
    id: 'reset',
    duration: 3000,
    narration: 'The bug is fixed and the new container runs stably. After 10 minutes healthy Kubelet resets the backoff: a new crash counts as a first one, restarted at once, and the ladder starts over from 10s, not 300s. The container state returns to Running and the CrashLoopBackOff reason clears.',
    chips: { stateChip: 'Running', reasonChip: 'none', restartChip: '8', delayChip: '0s · reset to base' },
    wires: { in: 'healthy run, backoff reset', next: 'if it crashes again: starts over at 10s' },
    // Pin final state inline so cancel between steps does not flash to default. The ghost bar is
    // the crash that has not come, so it rests at pending rather than at 1.
    opacity: { podGroup: 1, ...shown(7, OPACITY.pending) },
    lit: ['reasonChip', 'stateChip', 'restartChip', 'delayChip'],
    // The new container running is the premise, so state, reason and count stand at entry. The
    // backoff reset is earned by the healthy report landing, where the ghost bar rises.
    rewind: { chips: { delayChip: '300s · capped' } },
    flow: [
      // Pod recovers to full opacity first (the visible blink of a healthy run), then reports the
      // healthy status to Kubelet, which resets the backoff: the ghost bar is what the next crash
      // would now cost.
      F.pulse({ pod: 'podGroup' }),
      F.fade({ target: 'podGroup', from: OPACITY.notready, to: 1, dur: FADE.in, fill: 'both', easing: 'ease-out' }),
      exitReport({ delay: BEAT.afterPulse }),
      F.fade({ target: BAR_KEYS[GHOST], from: AHEAD, to: OPACITY.pending, dur: FADE.in, fill: 'both', easing: 'ease-out', at: 'exit' }),
      F.set({ at: 'exit', chips: { delayChip: '0s · reset to base' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
