import { P, F, defineCard, ladder, laneY, midX, WL, FADE, BEAT, OPACITY } from './workloads-kit.js';
import { rect } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/workloads-crashloopbackoff.md

// An INSTRUMENT over a Node floor: each restart delay is a bar that doubles up to the 300s ceiling.
// Kubelet sits INSIDE the Node because the backoff is per-node kubelet state.

// The frame is sized off the instrument, not the full WL width, and centred on WL.CX.
const BAR_W = 42, BAR_PITCH = 58, BAR_N = 9;
const AXIS_IN = 16;                                      // the first bar clears the axis rule
const CHART_W = AXIS_IN + (BAR_N - 1) * BAR_PITCH + BAR_W;
const CHIP_W = 442, COL_GAP = 40;                        // the chip column, and its gap to the axis
const FR_W = CHIP_W + COL_GAP + CHART_W;
const FR_L = WL.CX - FR_W / 2, FR_R = FR_L + FR_W;

// State chips as a column in the left band, which only opens below the panel.
const CHIP_GAP = 8;
const CHIPS_TOP = 240;
const CHIP_X = FR_L;
const CHIP_Y = ladder({ y: CHIPS_TOP, rowH: WL.CHIP_H, gap: CHIP_GAP });

// The chart's right edge is the frame's, and its baseline is the chip column's bottom edge.
const CH_R = FR_R, CH_L = CH_R - CHART_W;
const BASE_Y = CHIP_Y(3) + WL.CHIP_H;                    // zero of the instrument
// 0.8 units per second: the 300s to 10s height ratio IS the lesson.
const SCALE = 0.8;
const SEC = (s) => s * SCALE;
const CAP_S = 300;
const CAP_Y = BASE_Y - SEC(CAP_S);
// The immediate first restart, six doublings, one more at the cap, then the ghost after the healthy run.
const DELAYS = [0, 10, 20, 40, 80, 160, 300, 300, 10];
const BAR_X = (i) => CH_L + AXIS_IN + i * BAR_PITCH;
const BAR_CX = (i) => BAR_X(i) + BAR_W / 2;
const BAR_KEYS = DELAYS.map((_, i) => 'bar' + i);
const GHOST = 8;                                         // the bar of the crash that has not come
// A bar of 0s is a mark on the baseline, the graduation weight, or the first restart is invisible.
const MARK_H = 3.5;
const LBL_DY = 8;                                        // bar label baseline above the bar top
const AXIS_CAP_Y = BASE_Y + 18;                          // the two captions under the axis

// The frame top stays 22 under the axis captions, the WL padding sets the rest.
const NODE_Y = 440;
const IN = 40;                                           // the inset of both blocks from the frame walls
const POD_X = 640, POD_R = FR_R - IN, POD_W = POD_R - POD_X, POD_H = 116;
const POD_Y = NODE_Y + 34;
const NODE_H = 34 + POD_H + 12;
const KUBE_W = 232, KUBE_X = FR_L + IN;                  // WL actor width
const KUBE_Y = POD_Y + (POD_H - WL.BOX_H) / 2;
const KUBE_R = KUBE_X + KUBE_W;
const CONT_W = 300, CONT_X = POD_X + (POD_W - CONT_W) / 2, CONT_H = 64;
const CONT_Y = POD_Y + 30;
// Restart order on the upper lane, exit report on the lower, mirrored around the face centre (A-03).
const LANE_CY = midX(KUBE_Y, KUBE_Y + WL.BOX_H);
const { out: RESTART_Y, back: EXIT_Y } = laneY(LANE_CY, WL.LANE_DY);
const LANE_RESTART = { from: [KUBE_R, RESTART_Y], to: [POD_X, RESTART_Y] };
const LANE_EXIT = { from: [POD_X, EXIT_Y], to: [KUBE_R, EXIT_Y] };
const WIRE_X = midX(KUBE_R, POD_X);
const WIRE_OUT_Y = RESTART_Y - 12, WIRE_IN_Y = EXIT_Y + 18;

// Presentation shades, not lifecycle phases. Bars inherit the dialog's tint tokens.
const RULE = Object.freeze({
  axis: 'rgba(255, 255, 255, 0.16)',
  cap: 'rgba(255, 255, 255, 0.35)',
});

// A restart that has not happened yet DIMS rather than vanishing (C-14).
const AHEAD = OPACITY.terminating;
// A naked rect, not box(): a bar is neither a block nor a body to the geometry probes. Every bar is
// built at its final height and shown by opacity.
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

// The ladder fills as a PREFIX. The ninth bar is the ghost only the reset step raises.
const shown = (upTo, ghost = AHEAD) => Object.fromEntries(BAR_KEYS.map((k, i) => [k, i === GHOST ? ghost : i <= upTo ? 1 : AHEAD]));

// The lane pair and packets sit ABOVE the Node frame, whose translucent fill would grey them.
export const SCENE = {
  'aria-label': 'CrashLoopBackOff: the first restart is immediate, then Kubelet inserts an exponentially growing delay before each later restart, doubling to a 300s cap',
  parts: [
    P.defs(),
    P.chip({ key: 'stateChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'container state', value: 'Running' }),
    P.chip({ key: 'reasonChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'reason', value: 'none' }),
    P.chip({ key: 'restartChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'restartCount', value: '0' }),
    P.chip({ key: 'delayChip', x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'current backoff', value: '0s' }),
    P.raw({ make: () => { const r = rect({ x: CH_L, y: BASE_Y, width: CH_R - CH_L, height: 1.5 }); r.style.fill = RULE.axis; return r; } }),
    P.raw({ make: () => { const r = rect({ x: CH_L, y: CAP_Y, width: CH_R - CH_L, height: 1.5 }); r.style.fill = RULE.cap; return r; } }),
    P.tag({ x: CH_L, y: CAP_Y - LBL_DY, anchor: 'start', text: '300s cap · per-node default' }),
    ...DELAYS.map(barGroup),
    P.tag({ x: CH_L, y: AXIS_CAP_Y, anchor: 'start', text: 'delay before each restart' }),
    // The reset step counterfactual (T-35), under the axis because the space above the ghost is taken.
    P.wire({ key: 'next', x: CH_R, y: AXIS_CAP_Y, anchor: 'end' }),
    P.node({ key: 'nodeEl', x: FR_L, y: NODE_Y, w: FR_W, h: NODE_H, label: 'Node-1' }),
    P.arrow({ ...LANE_RESTART, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ ...LANE_EXIT, dim: true, dashed: true, role: 'cluster' }),
    P.packets(),
    P.pod({
      key: 'podGroup', id: 'podGroup',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      // No build-time opacity: every step pins the Pod.
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

const exitReport = (p = {}) => F.segment({ ...LANE_EXIT, name: 'exit', lights: ['kubelet'], ...p });
const grow = (i, p) => F.reveal({ target: BAR_KEYS[i], from: AHEAD, ...p });
const STAGGER = 400;
// A hold step climb: bar i and its record turn over on the same beat (P-03).
const climb = (i, delay, set) => [grow(i, { delay }), F.set({ delay, ...set })];

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
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
    // The pulse at 0 is the CRASH, so the chips turn over together on the restart (P-03, P-04).
    rewind: { chips: { stateChip: 'Running', restartChip: '0', delayChip: '0s' } },
    flow: [
      F.pulse({ pod: 'podGroup' }),
      exitReport({ delay: BEAT.afterPulse }),
      F.segment({ ...LANE_RESTART, after: 'exit', name: 'restart', pulse: 'podGroup' }),
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
    rewind: { chips: { stateChip: 'Running (restarted)', reasonChip: 'none', restartChip: '1', delayChip: '10s · base' }, wires: { out: '' } },
    flow: [
      F.pulse({ pod: 'podGroup' }),
      exitReport({ delay: BEAT.afterPulse }),
      F.fade({ target: 'podGroup', from: 1, to: OPACITY.notready, dur: FADE.out, at: 'exit', fill: 'both', easing: 'ease-in' }),
      F.set({ at: 'exit', chips: { stateChip: 'Waiting', reasonChip: 'CrashLoopBackOff', restartChip: '2', delayChip: '20s · doubled' }, wires: { out: 'hold restart, 20s' } }),
      grow(1, { at: 'exit' }),
      grow(2, { at: 'exit', plus: STAGGER }),
    ],
  },
  {
    id: 'doubling',
    duration: 2600,
    narration: 'The crashes keep coming and the backoff delay doubles with each failure, climbing 40s then 80s then 160s. The restartCount keeps incrementing on every attempt. The backoff is kept per container, and it stops a hot-looping process from saturating the Node.',
    chips: { stateChip: 'Waiting', reasonChip: 'CrashLoopBackOff', restartChip: '5', delayChip: '160s · doubling' },
    wires: { out: 'hold restart, 160s' },
    opacity: { podGroup: OPACITY.notready, ...shown(5) },
    lit: ['kubelet', 'restartChip', 'delayChip'],
    rewind: { chips: { restartChip: '2', delayChip: '20s · doubled' }, wires: { out: 'hold restart, 20s' } },
    flow: [
      ...climb(3, BEAT.lead, { chips: { restartChip: '3', delayChip: '40s · doubling' }, wires: { out: 'hold restart, 40s' } }),
      ...climb(4, BEAT.lead + STAGGER, { chips: { restartChip: '4', delayChip: '80s · doubling' }, wires: { out: 'hold restart, 80s' } }),
      ...climb(5, BEAT.lead + STAGGER * 2, { chips: { restartChip: '5', delayChip: '160s · doubling' }, wires: { out: 'hold restart, 160s' } }),
    ],
  },
  {
    id: 'cap',
    duration: 2700,
    narration: 'The next doubling would exceed 300s, so the delay is clamped at the 300s ceiling, a per-node default since 1.35, and stays there. Kubelet now retries the container at most once every 5 minutes for as long as it keeps failing. The restartCount continues to climb at this slow cadence.',
    chips: { stateChip: 'Waiting', reasonChip: 'CrashLoopBackOff', restartChip: '7', delayChip: '300s · capped' },
    wires: { out: 'retry every 5 min' },
    opacity: { podGroup: OPACITY.notready, ...shown(7) },
    lit: ['restartChip', 'kubelet', 'delayChip'],
    rewind: { chips: { restartChip: '5', delayChip: '160s · doubling' }, wires: { out: 'hold restart, 160s' } },
    flow: [
      ...climb(6, BEAT.lead, { chips: { restartChip: '6', delayChip: '300s · capped' }, wires: { out: 'retry every 5 min' } }),
      ...climb(7, BEAT.lead + STAGGER, { chips: { restartChip: '7' } }),
    ],
  },
  {
    id: 'reset',
    duration: 3000,
    narration: 'The bug is fixed and the new container runs stably. After 10 minutes healthy Kubelet resets the backoff: a new crash counts as a first one, restarted at once, and the ladder starts over from 10s, not 300s. The container state returns to Running and the CrashLoopBackOff reason clears.',
    chips: { stateChip: 'Running', reasonChip: 'none', restartChip: '8', delayChip: '0s · reset' },
    wires: { in: 'healthy run, backoff reset', next: 'if it crashes: restarted at once, then 10s' },
    // The ghost bar is the crash that has not come, so it rests at pending.
    opacity: { podGroup: 1, ...shown(7, OPACITY.pending) },
    lit: ['reasonChip', 'stateChip', 'restartChip', 'delayChip'],
    // The backoff reset is earned by the healthy report landing.
    rewind: { chips: { delayChip: '300s · capped' }, wires: { next: '' } },
    flow: [
      F.pulse({ pod: 'podGroup' }),
      F.fade({ target: 'podGroup', from: OPACITY.notready, to: 1, dur: FADE.in, fill: 'both', easing: 'ease-out' }),
      exitReport({ delay: BEAT.afterPulse }),
      F.fade({ target: BAR_KEYS[GHOST], from: AHEAD, to: OPACITY.pending, dur: FADE.in, fill: 'both', easing: 'ease-out', at: 'exit' }),
      F.set({ at: 'exit', chips: { delayChip: '0s · reset' }, wires: { next: 'if it crashes: restarted at once, then 10s' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
