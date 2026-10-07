import { P, F, defineCard, WL, FADE, BEAT, OPACITY, REVEAL_MS, routeDur } from './workloads-kit.js';
import { g, rect } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/workloads-job-parallelism.md

// An INSTRUMENT card: every number is drawn as a measure, none written in a chip, so no value is stated twice.

// One actor: the Job controller is the only thing that acts, so no API box. WL.L-07 pins it to the spine.
const JOB_W = 232, JOB_X = WL.CX - JOB_W / 2;
const JOB_CY = WL.TOP_Y + WL.BOX_H / 2;
const COND_X = JOB_X + JOB_W + 20, COND_Y = JOB_CY + 5;  // born hidden

// The failure budget is deliberately a small gauge, not a peer of the completions ledger: equal
// meters would say the Job is as likely to fail as to finish.
const TICK_N = 6, TICK_W = 44, TICK_GAP = 12, TICK_H = 22;
const BUD_W = TICK_N * TICK_W + (TICK_N - 1) * TICK_GAP;
// 170, not 190: keeps the budget caption clear of the wire label beside the trunk.
const BUD_X = WL.R - BUD_W, BUD_Y = 170;
const BUD_CX = BUD_X + BUD_W / 2;
const TICK_X = i => BUD_X + i * (TICK_W + TICK_GAP);
const TICKS = Array.from({ length: TICK_N }, (_, i) => i);
const BUD_CAP_Y = BUD_Y + TICK_H + 22;

// The parallelism window: three worker slots, one per unit of the cap.
const POD_W = 300, POD_H = 106, POD_PAD = 24;
const POD_XS = [0, 1, 2].map(i => WL.L + POD_PAD + i * ((WL.W - POD_PAD * 2 - POD_W) / 2));
const POD_CX = i => POD_XS[i] + POD_W / 2;
const POD_Y = 300;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };
const PAR_CAP_Y = POD_Y + POD_H + 24;
// Empty slots are drawn on the Pod rect (podShell uses rx 8), so the parallelism cap shows with no worker in it.
const POD_RX = 8;

// Two waves of three in the same slots: a succeeded Pod is never reused, so the replacement is its own element.
const WAVES = [['worker-1', 'worker-2', 'worker-3'], ['worker-4', 'worker-5', 'worker-6']];
const POD_KEY = (w, i) => `pod${w * 3 + i + 1}`;   // wave w, slot i

// The completions ledger, full width. Slots carry no unit numbers: a NonIndexed Job has no unit identity.
const SLOT_N = 5, SLOT_GAP = 18, SLOT_H = 58;
const SLOT_W = (WL.W - SLOT_GAP * (SLOT_N - 1)) / SLOT_N;
const SLOT_X = i => WL.L + i * (SLOT_W + SLOT_GAP);
const SLOTS = Array.from({ length: SLOT_N }, (_, i) => i);
const LED_Y = 470;
const LED_CAP_Y = LED_Y + SLOT_H + 26;

// Built ONCE per worker: the drawn lane and every ball read one array. Do not turn it into a factory.
const BUS_Y = POD_Y - 26;
const TRUNK = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, BUS_Y]];
const LANES = [0, 1, 2].map(i => (POD_CX(i) === WL.SPINE_X
  ? [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, POD_Y]]
  : [...TRUNK, [POD_CX(i), BUS_Y], [POD_CX(i), POD_Y]]));
const WIRE_X = WL.SPINE_X + 20, WIRE_Y = BUS_Y - 12;     // beside the trunk, above the bus
// One duration for all three creation balls, the longest tap, so the wave leaves and lands together
// (M-12, registered in `PACING`).
const CREATE_DUR = Math.max(...LANES.map(routeDur));

// Presentation shades for the meters, not lifecycle phases. The fill copies the workloads tint, since
// a presentation attribute cannot resolve a token.
const METER = Object.freeze({
  slot: 'rgba(255, 255, 255, 0.16)',    // an empty graduation
  done: 'rgba(91, 184, 255, 0.5)',      // a recorded completion
  spent: 'rgba(255, 255, 255, 0.45)',   // a failure charged against the limit
});

// A naked rect, not box(): an empty slot is neither a block nor a body to the geometry probes.
const meterFrame = (cells, rx = 5) => P.raw({
  make: () => {
    const grp = g({});
    for (const c of cells) {
      const r = rect({ x: c.x, y: c.y, width: c.w, height: c.h, rx });
      r.style.fill = 'none';
      r.style.stroke = METER.slot;
      r.style.strokeWidth = '1.4';
      grp.appendChild(r);
    }
    return grp;
  },
});
// Born invisible, and every step pins it, so prev and reset replay the meter.
const mark = ({ key, x, y, w, h, fill }) => P.raw({
  key,
  opacity: 0,
  make: () => {
    const r = rect({ x, y, width: w, height: h, rx: 3 });
    r.style.fill = fill;
    return r;
  },
});

// Z-order: meters and captions, wire and lanes, packets, then the workers and the Job above the ball.
export const SCENE = {
  'aria-label': 'Job parallelism and completions: at most 3 Pods run at once and 5 successful Pod runs are needed, each success records one completion while each failure counts against a backoffLimit of 6 that would mark the Job Failed on exceeding it, and the Job is marked Complete when the fifth completion is recorded',
  parts: [
    P.defs(),
    meterFrame(TICKS.map(i => ({ x: TICK_X(i), y: BUD_Y, w: TICK_W, h: TICK_H }))),
    meterFrame(SLOTS.map(i => ({ x: SLOT_X(i), y: LED_Y, w: SLOT_W, h: SLOT_H }))),
    meterFrame([0, 1, 2].map(i => ({ x: POD_XS[i], y: POD_Y, w: POD_W, h: POD_H })), POD_RX),
    mark({ key: 'spent0', x: TICK_X(0) + 3, y: BUD_Y + 3, w: TICK_W - 6, h: TICK_H - 6, fill: METER.spent }),
    ...SLOTS.map(i => mark({
      key: `fill${i}`, x: SLOT_X(i) + 6, y: LED_Y + 6, w: SLOT_W - 12, h: SLOT_H - 12, fill: METER.done,
    })),
    // Each spec number is written once, as the length of the meter it names.
    P.tag({ x: BUD_CX, y: BUD_CAP_Y, text: `backoffLimit ${TICK_N} · exceeding it marks the Job Failed` }),
    P.tag({ x: WL.CX, y: PAR_CAP_Y, text: `parallelism ${POD_XS.length} · Pods allowed to run at once` }),
    P.tag({ x: WL.CX, y: LED_CAP_Y, text: `completions ${SLOT_N} · successful Pod runs the Job needs` }),
    P.wire({ key: 'req', x: WIRE_X, y: WIRE_Y, anchor: 'start' }),
    ...[0, 1, 2].map(i => P.lane({ key: `lane${i}`, points: LANES[i], dim: true, dashed: true, role: 'cluster', opacity: 0 })),
    P.packets(),
    // Both waves stand in the same three slots and only one is ever visible.
    ...WAVES.flatMap((names, w) => names.map((name, i) => P.pod({
      key: POD_KEY(w, i), id: POD_KEY(w, i), innerKey: `${POD_KEY(w, i)}Box`,
      x: POD_XS[i], y: POD_Y, w: POD_W, h: POD_H, label: name, sublabel: 'idle', containers: 0,
      opacity: 0,
      inner: { ...POD_INNER, label: 'app', sublabel: 'idle' },
    }))),
    P.box({ key: 'job', x: JOB_X, y: WL.TOP_Y, w: JOB_W, h: WL.BOX_H, label: 'Job resize-images', sublabel: 'creates Pods · counts exits', role: 'cluster' }),
    P.tag({ key: 'condTag', x: COND_X, y: COND_Y, anchor: 'start', text: 'condition Complete=True', opacity: 0 }),
  ],
  reset: {
    keys: ['job'],
    pods: ['pod1', 'pod2', 'pod3', 'pod4', 'pod5', 'pod6'],
  },
};

// EVERY opacity on the card in one place (A-16). A lane takes the shade of whichever wave occupies its slot.
const stage = ({ w1, w2, filled, spent, cond }) => {
  const o = { spent0: spent, condTag: cond };
  for (const i of [0, 1, 2]) {
    o[POD_KEY(0, i)] = w1[i];
    o[POD_KEY(1, i)] = w2[i];
    o[`lane${i}`] = Math.max(w1[i], w2[i]);
  }
  for (const i of SLOTS) o[`fill${i}`] = i < filled ? 1 : 0;
  return o;
};
const T = OPACITY.terminated;

// The three are peers under one cap: they leave and land on one beat, and any stagger states an order that does not exist.
const create = (w, i) => [
  F.route({ points: LANES[i], delay: BEAT.lead, dur: CREATE_DUR, name: `create${i}`, pulse: POD_KEY(w, i) }),
];
const born = (w, i) => F.fade({ target: POD_KEY(w, i), from: 0, to: 1, dur: FADE.in, at: `create${i}`, fill: 'both', easing: 'ease-out' });
// An exited worker settles to the tombstone shade with its lane.
const retire = (w, i, at) => [
  F.fade({ target: POD_KEY(w, i), from: 1, to: T, dur: FADE.out, delay: at, fill: 'both', easing: 'ease-in' }),
  F.fade({ target: `lane${i}`, from: 1, to: T, dur: FADE.out, delay: at, fill: 'both', easing: 'ease-in' }),
];
// The slot band is the RUNNING window: an exited worker vacates it on `refill`, not when it exits.
const vacate = (i) => F.fade({ target: POD_KEY(0, i), from: T, to: 0, dur: FADE.out, fill: 'both', easing: 'ease-in' });

// Every step states every worker label of both waves, so prev and reset replay them.
const IDLE = { box: 'idle', pod: 'idle' };
const WORK = { box: 'working', pod: 'Running' };
const OK = { box: 'exit 0', pod: 'Succeeded' };
const BAD = { box: 'exit 1', pod: 'Failed' };
const labels = (...six) => ({
  sublabels: Object.fromEntries(six.map((v, k) => [`pod${k + 1}Box`, v.box])),
  podSublabels: Object.fromEntries(six.map((v, k) => [`pod${k + 1}`, v.pod])),
});

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    ...labels(IDLE, IDLE, IDLE, IDLE, IDLE, IDLE),
    opacity: stage({ w1: [0, 0, 0], w2: [0, 0, 0], filled: 0, spent: 0, cond: 0 }),
  },
  {
    id: 'spawn',
    duration: 3400,
    narration: 'A Job runs Pods until a fixed number of them succeed. This one asks for 5 successful runs and allows 3 at a time, so the controller sees 0 Pods running against a parallelism of 3 and creates 3 from one Pod template. Nothing has finished yet, so no completion is recorded and .status.active is 3.',
    wires: { req: 'create 3 Pods · fill the parallelism cap' },
    ...labels(WORK, WORK, WORK, IDLE, IDLE, IDLE),
    // Pinned final, so a cancel mid-step leaves the three workers standing.
    opacity: stage({ w1: [1, 1, 1], w2: [0, 0, 0], filled: 0, spent: 0, cond: 0 }),
    lit: ['job'],
    flow: [
      ...create(0, 0), ...create(0, 1), ...create(0, 2),
      born(0, 0), born(0, 1), born(0, 2),
    ],
  },
  {
    id: 'succeed',
    duration: 2600,
    narration: 'Two runs finish cleanly: worker-1 and worker-2 exit 0. A Pod run that ends successfully counts once toward .spec.completions, so .status.succeeded moves from 0 to 2. A Pod that has succeeded is never restarted or reused, so the Job reaches the next completion by creating a new one.',
    wires: { req: '' },
    ...labels(OK, OK, WORK, IDLE, IDLE, IDLE),
    opacity: stage({ w1: [T, T, 1], w2: [0, 0, 0], filled: 2, spent: 0, cond: 0 }),
    rewind: {
      sublabels: { pod1Box: 'working', pod2Box: 'working' },
      podSublabels: { pod1: 'Running', pod2: 'Running' },
    },
    // Both report on one beat: the narration gives the two runs no order.
    flow: [
      F.pulse({ pod: 'pod1' }),
      F.pulse({ pod: 'pod2' }),
      F.set({ delay: BEAT.afterPulse, sublabels: { pod1Box: 'exit 0', pod2Box: 'exit 0' }, podSublabels: { pod1: 'Succeeded', pod2: 'Succeeded' } }),
      F.reveal({ target: 'fill0', delay: BEAT.afterPulse, lights: ['job'] }),
      F.reveal({ target: 'fill1', delay: BEAT.afterPulse }),
      ...retire(0, 0, BEAT.afterPulse),
      ...retire(0, 1, BEAT.afterPulse),
    ],
  },
  {
    id: 'fail',
    duration: 2600,
    narration: 'The third run fails: worker-3 exits 1. Under restartPolicy Never a failing Pod reaches phase Failed, so .status.failed increments and no completion is recorded, and that failure counts against .spec.backoffLimit, 6 by default. The Pod object is kept rather than deleted, so its logs and its exit code stay readable.',
    wires: { req: '' },
    ...labels(OK, OK, BAD, IDLE, IDLE, IDLE),
    opacity: stage({ w1: [T, T, T], w2: [0, 0, 0], filled: 2, spent: 1, cond: 0 }),
    rewind: { sublabels: { pod3Box: 'working' }, podSublabels: { pod3: 'Running' } },
    flow: [
      F.pulse({ pod: 'pod3' }),
      F.set({ delay: BEAT.afterPulse, sublabels: { pod3Box: 'exit 1' }, podSublabels: { pod3: 'Failed' } }),
      F.reveal({ target: 'spent0', delay: BEAT.afterPulse, lights: ['job'] }),
      ...retire(0, 2, BEAT.afterPulse),
    ],
  },
  {
    id: 'refill',
    duration: 3400,
    narration: 'Three completions are still owed and no Pod is running, so the controller creates 3 new Pods, which is the parallelism cap again. The replacement for the failed run waited out the back-off the controller applies to a recreated Pod, 10s then 20s then 40s and on, capped at six minutes.',
    wires: { req: 'create 3 Pods · one is the retry after backoff' },
    ...labels(OK, OK, BAD, WORK, WORK, WORK),
    opacity: stage({ w1: [0, 0, 0], w2: [1, 1, 1], filled: 2, spent: 1, cond: 0 }),
    lit: ['job'],
    rewind: {
      sublabels: { pod4Box: 'idle', pod5Box: 'idle', pod6Box: 'idle' },
      podSublabels: { pod4: 'idle', pod5: 'idle', pod6: 'idle' },
    },
    // The window empties before it refills, so no ball rides a tombstone lane (A-15).
    flow: [
      vacate(0), vacate(1), vacate(2),
      ...[0, 1, 2].map(i => F.fade({ target: `lane${i}`, from: T, to: 1, dur: 300, fill: 'both', easing: 'ease-out' })),
      ...create(1, 0), ...create(1, 1), ...create(1, 2),
      born(1, 0), born(1, 1), born(1, 2),
      F.set({ at: 'create0', sublabels: { pod4Box: 'working' }, podSublabels: { pod4: 'Running' } }),
      F.set({ at: 'create1', sublabels: { pod5Box: 'working' }, podSublabels: { pod5: 'Running' } }),
      F.set({ at: 'create2', sublabels: { pod6Box: 'working' }, podSublabels: { pod6: 'Running' } }),
    ],
  },
  {
    id: 'complete',
    duration: 3000,
    narration: 'The last three Pods exit 0 and .status.succeeded reaches 5, which equals .spec.completions. The controller stops creating Pods and records the condition Complete=True. The one earlier failure stays counted and the Job with its Pods waits for ttlSecondsAfterFinished.',
    wires: { req: '' },
    ...labels(OK, OK, BAD, OK, OK, OK),
    opacity: stage({ w1: [0, 0, 0], w2: [T, T, T], filled: 5, spent: 1, cond: 1 }),
    rewind: {
      sublabels: { pod4Box: 'working', pod5Box: 'working', pod6Box: 'working' },
      podSublabels: { pod4: 'Running', pod5: 'Running', pod6: 'Running' },
    },
    // Complete=True is a state, not traffic: the condition follows the ledger by REVEAL_MS.
    flow: [
      F.pulse({ pod: 'pod4' }),
      F.pulse({ pod: 'pod5' }),
      F.pulse({ pod: 'pod6' }),
      F.set({
        delay: BEAT.afterPulse,
        sublabels: { pod4Box: 'exit 0', pod5Box: 'exit 0', pod6Box: 'exit 0' },
        podSublabels: { pod4: 'Succeeded', pod5: 'Succeeded', pod6: 'Succeeded' },
      }),
      F.reveal({ target: 'fill2', delay: BEAT.afterPulse }),
      F.reveal({ target: 'fill3', delay: BEAT.afterPulse }),
      F.reveal({ target: 'fill4', delay: BEAT.afterPulse, lights: ['job'] }),
      F.reveal({ target: 'condTag', delay: BEAT.afterPulse + REVEAL_MS }),
      ...retire(1, 0, BEAT.afterPulse),
      ...retire(1, 1, BEAT.afterPulse),
      ...retire(1, 2, BEAT.afterPulse),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
