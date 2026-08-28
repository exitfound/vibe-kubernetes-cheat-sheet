import { P, F, defineCard, ladder, WL, LAYOUT, FADE, BEAT, OPACITY } from './workloads-kit.js';
import { chip } from '../../lib/primitives.js';

// Design notes for this card: ./CARDS.md#workloads-crashloopbackoff

// Layout B of the Workloads canon (WL): chips and the backoff ladder left, pipeline right. Panel
// worst case x<=397, y<=205, 225 reserved as a floor, and a longer narration invalidates that.
const TOP_W = 280, TOP_X = WL.CX - TOP_W / 2;            // 460..740, centred on CX
const WIRE_OUT_Y = 28, WIRE_IN_Y = 146, WIRE_IN_DX = 14; // 28 is the WL.A-02 line, WL.TOP_Y - 12

// LAYOUT.B of the kit, which this card is on: chips in the LEFT column, pipeline in the RIGHT.
// WL.L-06 picks A / B / C against THIS card's measured panel bottom, and B is the one that fits.
const LAD_X = LAYOUT.B.ladder.x, LAD_W = LAYOUT.B.ladder.w;    // 660..1140, the pipeline
const LAD_Y = 160;                                       // 6 rows -> 160..402

// State chips as a column in the left band, which only opens below the panel.
const CHIP_GAP = 8;
const CHIPS_TOP = 240;                                   // measured, clear of the 225 floor
const CHIP_X = LAYOUT.B.chips.x, CHIP_W = LAYOUT.B.chips.w;    // 60..540, below the panel
const CHIP_Y = ladder({ y: CHIPS_TOP, rowH: WL.CHIP_H, gap: CHIP_GAP });   // 240 / 282 / 324 / 366

// The backoff ladder is a row, and it shares the left column with the chips stacked above it.
const BACKOFF_X = CHIP_X, BACKOFF_Y = 410, BACKOFF_W = 51, BACKOFF_H = 28, BACKOFF_GAP = 8;

const NODE_Y = 470, NODE_H = 140;                        // 470..610
const POD_W = 460, POD_H = 110, POD_X = WL.CX - POD_W / 2;   // 370..830
const POD_Y = NODE_Y + 22;                               // 492..602
const CONT_W = 300, CONT_X = WL.CX - CONT_W / 2, CONT_H = 64;
const CONT_Y = POD_Y + 30;                               // 522..586

// The spine reaches the Pod it addresses, not the frame edge above it.
const SPINE = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, POD_Y]];
const SPINE_UP = [...SPINE].reverse();

// The exponential ladder: six rungs, and the per-rung ref keys `lit` and `reset.keys` address.
const RUNGS = ['10s', '20s', '40s', '80s', '160s', '300s'];
const RUNG_KEYS = RUNGS.map((_, i) => 'rung' + i);
// The ladder fills as a PREFIX, never a single rung: a step names how far the doubling has climbed.
const filled = (idx) => RUNG_KEYS.slice(0, idx + 1);

// A rung is a chip() from primitives, not a valChip: one centred label and no value, which no part
// kind builds. The attributes are the primitive's own, so the serialised order is untouched (R3).
const rung = (lbl, i) => P.raw({
  key: RUNG_KEYS[i],
  make: () => chip({ x: i * (BACKOFF_W + BACKOFF_GAP), y: 0, w: BACKOFF_W, h: BACKOFF_H, label: lbl, role: 'cluster' }),
});

// Z-order: the two corridors and the chip column, then the packet layer, then chain / ladder /
// Node / Pod / Kubelet above the ball, and the two wire labels last.
export const SCENE = {
  'aria-label': 'CrashLoopBackOff: the first restart is immediate, then Kubelet inserts an exponentially growing delay before each later restart, doubling to a 300s cap',
  parts: [
    P.defs(),
    // One corridor drawn twice, down for the restart order and up for the exit report. Exactly one
    // is visible per step, which is what the `corridor()` pair in every `opacity` block below says.
    P.lane({ key: 'connectorDown', points: SPINE, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'connectorUp', points: SPINE_UP, dim: true, dashed: true, role: 'cluster', opacity: 0 }),
    P.chip({ key: 'stateChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'container state', value: 'Running' }),
    P.chip({ key: 'reasonChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'reason', value: 'none' }),
    P.chip({ key: 'restartChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'restartCount', value: '0' }),
    P.chip({ key: 'delayChip', x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'current backoff', value: '0s' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.chain({
      key: 'chain', x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP, role: 'cluster',
      items: [
        '1. running    ·  container healthy, no backoff active',
        '2. exit       ·  process exits non-zero, Kubelet sees it',
        '3. waiting    ·  state Waiting, reason CrashLoopBackOff',
        '4. backoff    ·  delay doubles each crash, 40s 80s 160s',
        '5. cap        ·  delay clamped at the 300s ceiling',
        '6. reset      ·  healthy run resets backoff to 10s base',
      ],
    }),
    P.group({ key: 'ladder', cls: 'scheme-ladder', transform: `translate(${BACKOFF_X},${BACKOFF_Y})`, parts: RUNGS.map(rung) }),
    P.node({ key: 'nodeEl', x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' }),
    P.pod({
      key: 'podGroup', id: 'podGroup',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      // No build-time opacity: every step pins the Pod's own, and the poster frame is `idle`.
      inner: { dx: CONT_X - POD_X, dy: CONT_Y - POD_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'restartPolicy: Always' },
    }),
    // Top row: Kubelet, the restart manager, centred on CX and clear of the narration panel.
    P.box({ key: 'kubelet', x: TOP_X, y: WL.TOP_Y, w: TOP_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'restart manager + backoff', role: 'cluster' }),
    // Wire labels above and below the Kubelet block, set per step by `wires`. The lower one hangs
    // off the SIDE of the spine, because a centred one sits on the lane and is struck out.
    P.wire({ key: 'out', x: WL.CX, y: WIRE_OUT_Y }),
    P.wire({ key: 'in', x: WL.SPINE_X + WIRE_IN_DX, y: WIRE_IN_Y, anchor: 'start' }),
  ],
  reset: {
    // The five the prologue always took back, plus the six rungs the ladder loop cleared by hand.
    keys: ['kubelet', 'stateChip', 'reasonChip', 'restartChip', 'delayChip', ...RUNG_KEYS],
    pods: ['podGroup'],
  },
};

// setConnectorDir as FIELDS: the pair is written in one place, so no step can leave both corridors
// on or neither. Key order is the order the helper wrote them in.
const corridor = (dir) => ({ connectorDown: dir === 'up' ? 0 : 1, connectorUp: dir === 'up' ? 1 : 0 });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    // Every step pins the whole record, so the four chips are always stated together.
    chips: { stateChip: 'Running', reasonChip: 'none', restartChip: '0', delayChip: '0s' },
    opacity: { podGroup: 1, ...corridor('down') },
    chain: 0,
  },
  {
    id: 'first-crash',
    duration: 2600,
    narration: 'The container process exits with a non-zero code and Kubelet observes the termination. With restartPolicy Always, Kubelet restarts it immediately the first time and arms a 10s base delay for the next one. Once the new container starts, restartCount becomes 1.',
    chips: { stateChip: 'Running (restarted)', reasonChip: 'none', restartChip: '1', delayChip: '10s · base' },
    wires: { in: 'container exited, code 1', out: 'restart now, next wait 10s' },
    opacity: { podGroup: 1, ...corridor('up') },
    lit: ['stateChip', 'restartChip', 'delayChip', ...filled(0)],
    chain: 1,
    flow: [
      // Pod blinks first (the container just crashed), then the Node reports the
      // exit up the connector to Kubelet.
      F.pulse({ pod: 'podGroup' }),
      F.route({ points: SPINE_UP, delay: BEAT.afterPulse, lights: ['kubelet'] }),
    ],
  },
  {
    id: 'backoff-named',
    duration: 2200,
    narration: 'The fresh container crashes again almost immediately. This restart is the one that waits, and each further crash doubles the delay, so 10s becomes 20s. While Kubelet holds off the restart the container state is Waiting with reason CrashLoopBackOff, which surfaces in kubectl get pods.',
    chips: { stateChip: 'Waiting', reasonChip: 'CrashLoopBackOff', restartChip: '2', delayChip: '20s · doubled' },
    wires: { out: 'hold restart, 20s' },
    opacity: { podGroup: OPACITY.notready, ...corridor('down') },
    lit: ['restartChip', 'kubelet', 'stateChip', 'reasonChip', 'delayChip', ...filled(1)],
    chain: 2,
    flow: [
      F.pulse({ pod: 'podGroup' }),
      F.fade({ target: 'podGroup', from: 1, to: OPACITY.notready, dur: FADE.out, fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'doubling',
    duration: 2300,
    narration: 'The crashes keep coming and the backoff delay doubles with each failure, climbing 40s then 80s then 160s. The restartCount keeps incrementing on every attempt. The exponential growth is per container, so a hot-looping process cannot saturate the Node.',
    chips: { stateChip: 'Waiting', reasonChip: 'CrashLoopBackOff', restartChip: '5', delayChip: '160s · doubling' },
    wires: { out: 'hold restart, 160s' },
    opacity: { podGroup: OPACITY.notready, ...corridor('down') },
    lit: ['kubelet', 'reasonChip', 'restartChip', 'delayChip', ...filled(4)],
    chain: 3,
  },
  {
    id: 'cap',
    duration: 2200,
    narration: 'The next doubling would exceed 300s, so the delay is clamped at the 300s ceiling, a per-node default since 1.35, and stays there. Kubelet now retries the container at most once every 5 minutes for as long as it keeps failing. The restartCount continues to climb at this slow cadence.',
    chips: { stateChip: 'Waiting', reasonChip: 'CrashLoopBackOff', restartChip: '7', delayChip: '300s · capped' },
    wires: { out: 'retry every 5 min' },
    opacity: { podGroup: OPACITY.notready, ...corridor('down') },
    // The cap holds: the clamped 300s ceiling shows via the full ladder and the
    // static chip highlight (no chip pulse).
    lit: ['restartChip', 'kubelet', 'delayChip', 'reasonChip', ...filled(5)],
    chain: 4,
  },
  {
    id: 'reset',
    duration: 2600,
    narration: 'The bug is fixed and the new container runs stably. After a sustained healthy run Kubelet resets the backoff counter, so the next crash would start over from the 10s base rather than the 300s cap. The container state returns to Running and the CrashLoopBackOff reason clears.',
    chips: { stateChip: 'Running', reasonChip: 'none', restartChip: '8', delayChip: '0s · reset to base' },
    wires: { in: 'healthy run, backoff reset' },
    // Pin final state inline so cancel between steps does not flash to default.
    opacity: { podGroup: 1, ...corridor('up') },
    lit: ['reasonChip', 'stateChip', 'restartChip', 'delayChip', ...filled(0)],
    chain: 5,
    flow: [
      // Pod recovers to full opacity first (the visible blink of a healthy run),
      // then reports the healthy status up to Kubelet which resets the backoff.
      F.pulse({ pod: 'podGroup' }),
      F.fade({ target: 'podGroup', from: OPACITY.notready, to: 1, dur: FADE.in, fill: 'both', easing: 'ease-out' }),
      F.route({ points: SPINE_UP, delay: BEAT.afterPulse, lights: ['kubelet'] }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
