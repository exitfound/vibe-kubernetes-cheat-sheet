import { P, F, defineCard, strip, WL, FADE, BEAT } from './workloads-kit.js';
import { g, rect, text } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/workloads-cronjob.md

// A time axis with the runs standing on it, not the A / B / C column preset: there is no ladder.

// The only actor, centred on the spine because the trunk leaves its bottom face (WL.L-07).
const CJ_W = 232, CJ_X = WL.CX - CJ_W / 2;
const WIRE_Y = WL.TOP_Y - 12;                            // above the actor row (WL.A-02)

// One equal slot per tick, so a filled slot and an empty one read as the same kind of thing.
const SLOT_N = 7, SLOT_GAP = 14;
const SLOT = strip({ from: WL.L, to: WL.R, count: SLOT_N, gap: SLOT_GAP });
const SLOT_CX = (i) => SLOT.x(i) + SLOT.w / 2;
const SLOT_Y = 396, SLOT_H = 100;
const POD_INNER = { dx: 18, dy: 30, h: 46 };
// The two baselines box() uses for a label+sublabel pair, so a mark matches a run.
const MARK_CY = SLOT_Y + SLOT_H / 2;
const LINE1_Y = MARK_CY - 3.22, LINE2_Y = MARK_CY + 12.78;

// The bus runs in the band the panel gives back, between its floor and the row.
const BUS_Y = 352;

// One graduation under each slot centre, so a tick and its outcome share an x.
const AXIS_Y = 512, AXIS_H = 2;
const GRAD_W = 2, GRAD_TOP = 506, GRAD_H = 12;
const TIME_Y = 538;                                      // baseline of the tick labels
const CAPTION_Y = 562;

// Chips carry only what the picture cannot say: the two spec fields and the last Event (WL.L-05).
const CHIP = strip({ from: WL.L, to: WL.R, count: 3, gap: 14 });
const CHIPS_TOP = 578;

// A Job name suffix is the scheduled time in minutes since the epoch, the tick label written another way.
const TICKS = ['12:00', '12:05', '12:10', '12:15', '12:20', '12:25', '12:30'];
const RUNS = [0, 2, 3, 4];
const JOB_NAME = { 0: 'backup-28394400', 2: 'backup-28394410', 3: 'backup-28394415', 4: 'backup-28394420' };

// Presentation shades, not lifecycle phases. grad is the workloads tint, copied because a style
// value here cannot resolve a token.
const RULE = Object.freeze({
  axis: 'rgba(255, 255, 255, 0.16)',
  grad: 'rgba(91, 184, 255, 0.9)',
  cell: 'rgba(255, 255, 255, 0.14)',
});

// Raw and unkeyed: the clock is true on every step, and a rule this thin is not a block.
const axis = () => P.raw({
  make: () => {
    const el = g({});
    const bar = rect({ x: WL.L, y: AXIS_Y, width: WL.W, height: AXIS_H });
    bar.style.fill = RULE.axis;
    el.appendChild(bar);
    TICKS.forEach((t, i) => {
      const mark = rect({ x: SLOT_CX(i) - GRAD_W / 2, y: GRAD_TOP, width: GRAD_W, height: GRAD_H });
      mark.style.fill = RULE.grad;
      el.appendChild(mark);
      el.appendChild(text({ class: 'scheme-label code dim', x: SLOT_CX(i), y: TIME_Y, 'text-anchor': 'middle' }, [t]));
    });
    return el;
  },
});

// The slots stand on every step, so no arrowhead points at blank canvas. Their rect matches the
// podShell's, so a Job drawn into a slot covers its cell exactly.
const cells = () => P.raw({
  make: () => {
    const el = g({});
    TICKS.forEach((_, i) => {
      const r = rect({ x: SLOT.x(i), y: SLOT_Y, width: SLOT.w, height: SLOT_H, rx: 8, ry: 8 });
      r.style.fill = 'none';
      r.style.stroke = RULE.cell;
      r.style.strokeWidth = '1.2';
      el.appendChild(r);
    });
    return el;
  },
});

// An empty tick reveals the reason no run took it: verdict and cause as one keyed group.
const mark = (i, verb, why) => P.raw({
  key: 'mark' + i,
  make: () => {
    const el = g({ id: 'mark' + i });
    el.appendChild(text({ class: 'scheme-label code', x: SLOT_CX(i), y: LINE1_Y, 'text-anchor': 'middle' }, [verb]));
    el.appendChild(text({ class: 'scheme-box-sublabel', x: SLOT_CX(i), y: LINE2_Y, 'text-anchor': 'middle' }, [why]));
    el.style.opacity = '0';
    return el;
  },
});

// Built once and shared by the lane and every route, so wire and ball are the same array (A-02).
// The slot on the spine has no turn, so its redundant vertex is dropped.
const TRUNK = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, BUS_Y]];
const lane = (i) => (SLOT_CX(i) === WL.SPINE_X
  ? [...TRUNK, [SLOT_CX(i), SLOT_Y]]
  : [...TRUNK, [SLOT_CX(i), BUS_Y], [SLOT_CX(i), SLOT_Y]]);
const LANES = { 0: lane(0), 2: lane(2), 3: lane(3), 4: lane(4) };

// The list order is the z-order: marks, runs and the CronJob sit above the packet layer.
export const SCENE = {
  'aria-label': 'CronJob schedule and concurrency: seven five-minute ticks drawn as a time axis, where each tick either creates one Job that runs its own Pod or stays empty for a named reason, skipped by concurrencyPolicy, missed past startingDeadlineSeconds, or held back while the CronJob is suspended, and where the oldest run is later pruned by the history limits',
  parts: [
    P.defs(),
    P.wire({ key: 'req', x: WL.CX, y: WIRE_Y }),
    P.chip({ key: 'scheduleChip', x: CHIP.x(0), y: CHIPS_TOP, w: CHIP.w, h: WL.CHIP_H, name: 'schedule', value: '*/5 * * * *' }),
    P.chip({ key: 'concChip', x: CHIP.x(1), y: CHIPS_TOP, w: CHIP.w, h: WL.CHIP_H, name: 'concurrencyPolicy', value: 'Forbid' }),
    P.chip({ key: 'eventChip', x: CHIP.x(2), y: CHIPS_TOP, w: CHIP.w, h: WL.CHIP_H, name: 'last event', value: 'none' }),
    axis(),
    cells(),
    P.tag({ x: WL.CX, y: CAPTION_Y, text: 'wall clock · one tick every 5 minutes' }),
    ...RUNS.map(i => P.lane({ key: 'lane' + i, points: LANES[i], dim: true, dashed: true, role: 'cluster', opacity: 0 })),
    P.packets(),
    mark(0, 'pruned', 'history limit 3'),
    mark(1, 'skipped', 'policy Forbid'),
    mark(5, 'missed', 'past the deadline'),
    mark(6, 'suspended', 'spec.suspend=true'),
    // The rounded shell is the Job, the inner box the Pod that Job starts.
    ...RUNS.map(i => P.pod({
      key: 'job' + i, id: 'job' + i, innerKey: `job${i}Box`,
      x: SLOT.x(i), y: SLOT_Y, w: SLOT.w, h: SLOT_H, label: JOB_NAME[i], sublabel: '', containers: 0,
      opacity: 0,
      inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: SLOT.w - POD_INNER.dx * 2, h: POD_INNER.h, label: 'Pod', sublabel: 'Pending' },
    })),
    P.box({ key: 'cronjob', x: CJ_X, y: WL.TOP_Y, w: CJ_W, h: WL.BOX_H, label: 'CronJob', sublabel: 'schedule evaluator', role: 'cluster' }),
  ],
  reset: {
    keys: ['cronjob', 'scheduleChip', 'concChip', 'eventChip', 'job0Box', 'job2Box', 'job3Box', 'job4Box'],
    pods: ['job0', 'job2', 'job3', 'job4'],
  },
};

// A run and its lane are stated in one place, so no arrowhead outlives its run (A-16, A-13, A-14).
const stage = (r0, r2, r3, r4) => ({
  job0: r0, job2: r2, job3: r3, job4: r4,
  lane0: r0, lane2: r2, lane3: r3, lane4: r4,
});

// Every step states all three chips (P-01).
const SPEC = { scheduleChip: '*/5 * * * *', concChip: 'Forbid' };
const chips = (event) => ({ ...SPEC, eventChip: event });

// A decline that records an Event: the reason reveals in the slot and the chip turns over on it.
const decline = (key, was, event) => ({
  lit: ['cronjob'],
  reducedLit: ['eventChip'],
  rewind: { chips: { eventChip: was } },
  flow: [
    F.reveal({ target: key, delay: BEAT.lead, name: 'mark' }),
    F.set({ at: 'mark', chips: { eventChip: event }, lit: ['eventChip'] }),
  ],
});

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: chips('none'),
    opacity: { ...stage(0, 0, 0, 0), mark0: 0, mark1: 0, mark5: 0, mark6: 0 },
    sublabels: { cronjob: 'schedule evaluator' },
  },
  {
    id: 'create',
    duration: 3800,
    narration: 'At 12:00 the wall clock matches the schedule, and the controller creates one Job, backup-28394400, from spec.jobTemplate. That Job in turn starts its own Pod. The path is always CronJob then Job then Pod, never CronJob straight to Pod. The numeric suffix is the scheduled time in minutes, so a repeated create for one tick collides on the name instead of adding a second run.',
    chips: chips('created backup-28394400'),
    sublabels: { cronjob: 'schedule evaluator', job0Box: 'Running' },
    wires: { req: 'create Job backup-28394400 · from jobTemplate' },
    opacity: { ...stage(1, 0, 0, 0), mark0: 0, mark1: 0, mark5: 0, mark6: 0 },
    // M-18: the source is lit at entry and its ball waits BEAT.lead.
    lit: ['cronjob'],
    // What an F.set lights is invisible to flowLights, so the reduced path is told by name (S-17).
    reducedLit: ['job0Box', 'eventChip'],
    rewind: { opacity: { job0: 0 }, chips: { eventChip: 'none' } },
    flow: [
      F.route({ points: LANES[0], delay: BEAT.lead, name: 'create' }),
      F.fade({ target: 'job0', from: 0, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'job0', at: 'create' }),
      F.set({ at: 'create', chips: { eventChip: 'created backup-28394400' }, lit: ['eventChip'] }),
    ],
  },
  {
    id: 'forbid',
    duration: 4200,
    narration: 'The 12:00 backup is slow and still Running when the 12:05 tick arrives. The spec.concurrencyPolicy field decides what happens to overlapping runs. With Forbid the controller skips this tick and records the Event JobAlreadyActive. The default Allow would let a second Job start alongside the first, and Replace would delete the still-running Job and start a fresh one in its place. Once the 12:00 run finishes, that skipped tick can still start if it is inside startingDeadlineSeconds.',
    chips: chips('JobAlreadyActive · 12:05 skipped'),
    sublabels: { cronjob: 'schedule evaluator', job0Box: 'Running' },
    wires: { req: 'concurrencyPolicy=Forbid · skip this tick' },
    opacity: { ...stage(1, 0, 0, 0), mark0: 0, mark1: 1, mark5: 0, mark6: 0 },
    ...decline('mark1', 'created backup-28394400', 'JobAlreadyActive · 12:05 skipped'),
  },
  {
    id: 'next',
    duration: 4400,
    narration: 'By 12:10 the 12:00 run has finished, so there is no overlap left to forbid and the schedule simply runs. The 12:10, 12:15 and 12:20 ticks each create a Job of their own, and each of those Jobs starts its own Pod. Runs are never reused and one tick never feeds another: each of these ticks gets a Job of its own, and the skipped 12:05 tick gets none.',
    chips: chips('created backup-28394420'),
    sublabels: {
      cronjob: 'schedule evaluator', job0Box: 'Succeeded',
      job2Box: 'Running', job3Box: 'Running', job4Box: 'Running',
    },
    wires: { req: 'create a Job for 12:10, 12:15 and 12:20' },
    opacity: { ...stage(1, 1, 1, 1), mark0: 0, mark1: 1, mark5: 0, mark6: 0 },
    lit: ['cronjob'],
    reducedLit: ['job2Box', 'job3Box', 'job4Box', 'eventChip'],
    rewind: { opacity: { job2: 0, job3: 0, job4: 0 }, chips: { eventChip: 'JobAlreadyActive · 12:05 skipped' } },
    // Staggered so the row fills left to right rather than in one burst.
    flow: [
      F.route({ points: LANES[2], delay: BEAT.lead, name: 'c2' }),
      F.fade({ target: 'job2', from: 0, to: 1, dur: FADE.in, at: 'c2', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'job2', at: 'c2' }),
      F.route({ points: LANES[3], delay: BEAT.lead + 450, name: 'c3' }),
      F.fade({ target: 'job3', from: 0, to: 1, dur: FADE.in, at: 'c3', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'job3', at: 'c3' }),
      F.route({ points: LANES[4], delay: BEAT.lead + 900, name: 'c4' }),
      F.fade({ target: 'job4', from: 0, to: 1, dur: FADE.in, at: 'c4', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'job4', at: 'c4' }),
      F.set({ at: 'c4', chips: { eventChip: 'created backup-28394420' }, lit: ['eventChip'] }),
    ],
  },
  {
    id: 'history',
    duration: 4600,
    narration: 'Finished Jobs pile up, so the controller caps how many it keeps with successfulJobsHistoryLimit, which defaults to 3, and failedJobsHistoryLimit, which defaults to 1. Once a fourth successful Job exists it deletes the oldest, here backup-28394400, and that Job takes its Pod with it. Trimming history is why kubectl get jobs shows only the most recent runs of a schedule.',
    chips: chips('deleted backup-28394400'),
    sublabels: {
      cronjob: 'schedule evaluator',
      job2Box: 'Succeeded', job3Box: 'Succeeded', job4Box: 'Succeeded',
    },
    wires: { req: 'delete backup-28394400 · successfulJobsHistoryLimit=3' },
    opacity: { ...stage(0, 1, 1, 1), mark0: 1, mark1: 1, mark5: 0, mark6: 0 },
    lit: ['cronjob'],
    reducedLit: ['eventChip'],
    // The pruned run and its lane come back for the flight and leave when the delete lands.
    rewind: {
      opacity: { job0: 1, lane0: 1, mark0: 0 },
      sublabels: { job0Box: 'Succeeded' },
      chips: { eventChip: 'created backup-28394420' },
    },
    flow: [
      F.route({ points: LANES[0], delay: BEAT.lead, name: 'prune' }),
      // M-08: a Pod that fades out blinks first.
      F.pulse({ pod: 'job0', at: 'prune' }),
      F.fade({ target: 'job0', from: 1, to: 0, dur: FADE.out, at: 'prune', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'lane0', from: 1, to: 0, dur: FADE.out, at: 'prune', fill: 'both', easing: 'ease-in' }),
      F.reveal({ target: 'mark0', at: 'prune', plus: FADE.out, name: 'mark' }),
      F.set({ at: 'mark', chips: { eventChip: 'deleted backup-28394400' }, lit: ['eventChip'] }),
    ],
  },
  {
    id: 'missed',
    duration: 4600,
    narration: 'The controller was down when 12:25 came round, so on recovery it sees a missed tick. The spec.startingDeadlineSeconds field bounds how late a missed run may still start, and a tick older than that deadline is counted as missed rather than run late. Past 100 missed start times, deadline or not, the controller records a TooManyMissedTimes warning and still starts the latest tick. A CronJob is not exactly-once and may rarely create two Jobs or none for a tick, so the Job should be idempotent.',
    chips: chips('missed 12:25 · past deadline'),
    sublabels: {
      cronjob: 'schedule evaluator',
      job2Box: 'Succeeded', job3Box: 'Succeeded', job4Box: 'Succeeded',
    },
    wires: { req: 'missed start past startingDeadlineSeconds' },
    opacity: { ...stage(0, 1, 1, 1), mark0: 1, mark1: 1, mark5: 1, mark6: 0 },
    ...decline('mark5', 'deleted backup-28394400', 'missed 12:25 · past deadline'),
  },
  {
    id: 'suspend',
    duration: 4200,
    narration: 'Setting spec.suspend=true pauses the CronJob. The clock keeps advancing and 12:30 still matches the schedule, but the controller creates no new Jobs while it is suspended, and a Job already running is left to finish on its own. Clearing the flag back to false resumes creation, and only the latest tick missed while suspended starts immediately, if startingDeadlineSeconds allows. This pauses a schedule without deleting the CronJob and losing its history.',
    // Deliberately unchanged: a suspended tick records no Event (syncCronJob returns early).
    chips: chips('missed 12:25 · past deadline'),
    sublabels: {
      cronjob: 'spec.suspend=true · paused',
      job2Box: 'Succeeded', job3Box: 'Succeeded', job4Box: 'Succeeded',
    },
    wires: { req: 'spec.suspend=true · no new Job created' },
    opacity: { ...stage(0, 1, 1, 1), mark0: 1, mark1: 1, mark5: 1, mark6: 1 },
    lit: ['cronjob'],
    flow: [F.reveal({ target: 'mark6', delay: BEAT.lead, name: 'mark' })],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
