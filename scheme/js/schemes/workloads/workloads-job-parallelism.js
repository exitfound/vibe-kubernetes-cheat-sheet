import { P, F, defineCard, laneY, midX, WL, LAYOUT, FADE, BEAT, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS.md#workloads-job-parallelism

// Layout C of the Workloads canon (WL): full-width chip strip, a bus tapping all three workers.
// Panel worst case x<=397, y<=280; a longer narration invalidates that measurement.
const TOP1_X = 420, TOP1_W = 220;
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = 220;
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);
const WIRE_Y = WL.TOP_Y - 12;                            // above the actor row, off the spine

// LAYOUT.C of the kit, which this card is on: neither column fits under the panel, so the pipeline
// takes the RIGHT band and the chips become a bottom strip. WL.L-06 picks A / B / C per card.
const LAD_X = LAYOUT.C.ladder.x, LAD_W = LAYOUT.C.ladder.w;   // 660..1140, the pipeline
const LAD_Y = 150;                                       // 5 rows -> 150..350

const NODE_Y = 386, NODE_H = 142;                        // 386..528, below the ladder and the panel
const POD_W = 300, POD_H = 106, POD_TOP_PAD = 24;
const POD_Y = NODE_Y + POD_TOP_PAD;                      // 410..516, clear of the frame label
const POD_PAD = 24;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };
const POD_XS = [0, 1, 2].map(i => WL.L + POD_PAD + i * ((WL.W - POD_PAD * 2 - POD_W) / 2));
const POD_CX = i => POD_XS[i] + POD_W / 2;               // 234 / 600 / 966
const POD_NAMES = ['worker-1', 'worker-2', 'worker-3'];

// Chips as a full-width bottom strip, three per row so name and value never collide. Five chips
// means a row of three and a row of two, the short row centred on CX.
const CHIP_PER_ROW = 3, CHIP_GAP = 14;
const CHIP_W = (WL.W - CHIP_GAP * (CHIP_PER_ROW - 1)) / CHIP_PER_ROW;   // 350.67
const CHIP_ROW_H = WL.CHIP_H + 8;
const CHIPS_TOP = 548;                                   // two rows -> 548..624
const CHIP_ROW_N = i => (i < CHIP_PER_ROW ? CHIP_PER_ROW : 2);
const CHIP_X = i => {
  const col = i % CHIP_PER_ROW, n = CHIP_ROW_N(i);
  const rowW = n * CHIP_W + (n - 1) * CHIP_GAP;
  return WL.CX - rowW / 2 + col * (CHIP_W + CHIP_GAP);
};
const CHIP_Y = i => CHIPS_TOP + Math.floor(i / CHIP_PER_ROW) * CHIP_ROW_H;

// The trunk steps into the central corridor beside the ladder, drops to a bus above the Pod row
// and taps down into each worker, so every ball ends on the Pod it makes pulse.
const TOP1_CX = TOP1_X + TOP1_W / 2;                     // 530
const JOG_Y = WL.TOP_BOTTOM + 20;                        // 140, below the boxes, above the ladder
const BUS_Y = NODE_Y - 12;                               // 374, between the ladder and the frame
const TRUNK = [[TOP1_CX, WL.TOP_BOTTOM], [TOP1_CX, JOG_Y], [WL.SPINE_X, JOG_Y], [WL.SPINE_X, BUS_Y]];
const LANE = i => (POD_CX(i) === WL.SPINE_X
  ? [...TRUNK, [WL.SPINE_X, POD_Y]]
  : [...TRUNK, [POD_CX(i), BUS_Y], [POD_CX(i), POD_Y]]);

// The list order IS the append order, so it is the z-order: the two top arrows, the wire label and
// the five strip chips first, then the three lanes and the packet layer, and chain / Node / Pods /
// actor row above the ball.
export const SCENE = {
  'aria-label': 'Job parallelism and completions: at most parallelism workers run concurrently, until completions successful runs are recorded',
  parts: [
    P.defs(),
    P.arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WIRE_X, y: WIRE_Y }),
    P.chip({ key: 'parChip', x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'parallelism', value: '3' }),
    P.chip({ key: 'compChip', x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'completions', value: '6' }),
    P.chip({ key: 'succChip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'succeeded', value: '0' }),
    P.chip({ key: 'failChip', x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'failed', value: '0' }),
    // State chip for the Job status: last chip of the strip.
    P.chip({ key: 'phaseChip', x: CHIP_X(4), y: CHIP_Y(4), w: CHIP_W, h: WL.CHIP_H, name: 'job status', value: '0 active' }),
    // One drawn lane per worker. They share the trunk and the bus, so the three paths coincide
    // there and read as a single wiring tree with three arrowheads.
    ...[0, 1, 2].map(i => P.lane({ key: `lane${i}`, points: LANE(i), dim: true, dashed: true, role: 'cluster' })),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.chain({
      key: 'chain', x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP, role: 'cluster',
      items: [
        '1. spec     ·  parallelism=3, completions=6',
        '2. spawn    ·  controller creates Pods up to parallelism',
        '3. progress ·  exit 0 → succeeded++ · then start next',
        '4. retry    ·  exit != 0 → failed++ · respawn (backoffLimit)',
        '5. complete ·  succeeded == completions · Complete=True',
      ],
    }),
    P.node({ key: 'nodeEl', x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' }),
    // Born invisible: every step pins all three workers, and step 2 is the one that creates them.
    ...[0, 1, 2].map(i => P.pod({
      key: `pod${i + 1}`, id: `pod${i + 1}`, innerKey: `pod${i + 1}Box`,
      x: POD_XS[i], y: POD_Y, w: POD_W, h: POD_H, label: POD_NAMES[i], sublabel: '', containers: 0,
      opacity: 0,
      inner: { ...POD_INNER, label: 'app', sublabel: 'idle' },
    })),
    P.box({ key: 'apiserver', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'create Pod · watch exit', role: 'cluster' }),
    P.box({ key: 'controller', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Job', sublabel: 'spawn + count', role: 'cluster' }),
  ],
  reset: {
    keys: ['controller', 'apiserver', 'parChip', 'compChip', 'succChip', 'failChip', 'phaseChip', 'pod1Box', 'pod2Box', 'pod3Box'],
    pods: ['pod1', 'pod2', 'pod3'],
  },
};

// A worker slot and its own lane are pinned by ONE helper: a tap that outlives its Pod lands an
// arrowhead in an empty Node frame, and on this card the idle frame is the first thing a reader sees.
const row = (a, b, c) => ({ pod1: a, lane0: a, pod2: b, lane1: b, pod3: c, lane2: c });

// One ball per worker, all leaving together: every Pod that pulses has a ball that reached it.
// `routeDur` is length-based, so which tap lands LAST is fixed geometry: taps 0 and 2 sit 366 units
// off the spine (726 units of lane, 1613ms) and tie for last, tap 1 lands on the spine itself
// (360 units, 800ms). The chip that counts the Pods therefore hangs off `create0`.
const fan = (i) => [
  F.route({ points: LANE(i), after: 'req', name: `create${i}` }),
  F.pulse({ pod: `pod${i + 1}`, at: `create${i}` }),
];
const born = (i) => F.fade({ target: `pod${i + 1}`, from: 0, to: 1, dur: FADE.in, at: `create${i}`, fill: 'both', easing: 'ease-out' });

// Every worker reports its OWN exit, so all three pulse together and nothing rides down. `fan` is
// the CREATE helper and must not stand in here: its lane is built trunk-first from the controller
// box down to the Pod, so a step whose wire reads `watch Pod exits` would draw three creates.
const EXITS = ['pod1', 'pod2', 'pod3'].map(pod => F.pulse({ pod }));

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { parChip: '3', compChip: '6', succChip: '0', failChip: '0', phaseChip: '0 active' },
    sublabels: { pod1Box: 'idle', pod2Box: 'idle', pod3Box: 'idle' },
    opacity: row(0, 0, 0),
    chain: 0,
  },
  {
    id: 'spawn',
    duration: 3500,
    narration: 'Job controller observes 0 live Pods against a parallelism of 3, so it creates 3 Pods to fill the cap. They all run the same Pod template. How they divide work is up to the app (pull from an external queue, or, with completionMode=Indexed, read JOB_COMPLETION_INDEX from the env). With three Pods now running, .status.active becomes 3.',
    // The step STARTS from zero live Pods, the observation its narration opens with, and the chip
    // turns over only once the creates land: parallelism=3 starts the three Pods simultaneously.
    chips: { parChip: '3', compChip: '6', succChip: '0', failChip: '0', phaseChip: '0 active' },
    wires: { req: 'create 3 Pods (parallelism cap)' },
    sublabels: { pod1Box: 'running · unit-1', pod2Box: 'running · unit-2', pod3Box: 'running · unit-3' },
    // Pin final opacities so a step change (which cancels the fade-in animations) leaves the Pods
    // visible instead of reverting to the built 0.
    opacity: row(1, 1, 1),
    lit: ['controller', 'phaseChip'],
    chain: 1,
    flow: [
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'req', lights: ['apiserver'] }),
      ...fan(0), ...fan(1), ...fan(2),
      born(0), born(1), born(2),
      F.set({ at: 'create0', chips: { phaseChip: 'Running · 3 active' } }),
    ],
  },
  {
    id: 'partial',
    // Motion: the three workers pulse their exits (to 900), then the watch event leaves at 800 and
    // lands on the controller at 1500, its ripple closing the step at 2060.
    duration: 2600,
    narration: 'Both worker-1 and worker-2 exit 0, so .status.succeeded increments to 2. worker-3 exits with code 1, .status.failed becomes 1. The failed Pod is retained in Failed phase as a tombstone (visible in kubectl get pods until the Job is garbage-collected), so the post-mortem stays inspectable. A replacement still needs to run to reach completions=6.',
    chips: { parChip: '3', compChip: '6', succChip: '2', failChip: '1', phaseChip: 'Running · 1 failed' },
    wires: { req: 'watch Pod exits · 2 exit 0 · 1 exit 1' },
    sublabels: { pod1Box: 'unit-1 done · exit 0', pod2Box: 'unit-2 done · exit 0', pod3Box: 'unit-3 FAILED · exit 1' },
    // Pin final opacities (worker-3 exited 1 and settles to the terminated shade) so a cancel does
    // not drop worker-1 and worker-2 back to the built 0.
    opacity: row(1, 1, OPACITY.terminated),
    // The API is the source of the watch and is lit from entry. The controller RECEIVES it, so it
    // stays dark until the event lands.
    lit: ['apiserver', 'succChip', 'failChip', 'phaseChip'],
    chain: 2,
    // Up-arrow: the workers act and the controller receives. The three exits happen first, then the
    // watch event carries the counts up. Nothing is created here, so nothing rides down.
    flow: [
      ...EXITS,
      F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, delay: BEAT.afterPulse, lights: ['controller'] }),
      // Worker-3 exited 1, so it and the lane that feeds it settle to the tombstone shade on the beat
      // its own exit pulse hands over. fill:'both' holds both at full through the delay window.
      F.fade({ target: 'pod3', from: 1, to: OPACITY.terminated, dur: FADE.out, delay: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'lane2', from: 1, to: OPACITY.terminated, dur: FADE.out, delay: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'retry',
    duration: 3500,
    narration: 'Per spec.backoffLimit (default 6, total failures across the Job), the controller respawns a replacement Pod for the failed unit, gated by an exponential backoff that starts at 10s. Meanwhile worker-1 and worker-2 have finished, so fresh Pods take their slots for units 4 and 5 (each completion is its own Pod run, Pods are never reused). Three Pods active again, the parallelism cap respected.',
    chips: { parChip: '3', compChip: '6', succChip: '2', failChip: '1', phaseChip: 'Running · 3 active' },
    wires: { req: 'create Pods · units 4, 5 + unit-3 retry' },
    sublabels: { pod1Box: 'running · unit-4', pod2Box: 'running · unit-5', pod3Box: 'running · unit-3 (retry)' },
    // Pin final opacities (worker-3 replacement back to 1) so a cancel does not drop the three live
    // Pods back to the built 0.
    opacity: row(1, 1, 1),
    lit: ['controller', 'phaseChip'],
    chain: 3,
    flow: [
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'req', lights: ['apiserver'] }),
      ...fan(0), ...fan(1), ...fan(2),
    ],
  },
  {
    id: 'complete',
    // Motion: the three workers pulse their final exits and nothing else, so the step closes at 900.
    duration: 2200,
    narration: 'Between them the three workers have completed all 6 units, the last one (unit-6) just finishing on worker-1. .status.succeeded now equals .spec.completions (6), so the controller sets condition Complete=True and stops creating Pods. The earlier single failure stays counted in .status.failed, and the terminated Pods are retained until ttlSecondsAfterFinished elapses (Job auto-cleanup) or until kubectl delete job is issued.',
    chips: { parChip: '3', compChip: '6', succChip: '6', failChip: '1', phaseChip: 'Complete · 6/6 succeeded' },
    wires: { req: 'watch final exit · succeeded == completions' },
    sublabels: { pod1Box: 'unit-6 done · exit 0', pod2Box: 'unit-5 done · exit 0', pod3Box: 'unit-3 done · exit 0' },
    // Pin final opacities so the three Pods stay visible after a cancel.
    opacity: row(1, 1, 1),
    lit: ['controller', 'phaseChip', 'succChip'],
    chain: 4,
    // Complete=True is a state the controller REACHES, not traffic it sends: the sentence ends with
    // the controller no longer creating Pods, so the only motion is the workers reporting done.
    flow: [...EXITS],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
