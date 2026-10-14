import { P, F, defineCard, WL, FADE, BEAT, OPACITY, fanTiming } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-pod-replacement-guarantees.md

// A verdict board: five controller columns, one event reaching all five at once from the API.
// PANEL_B is a layout line set below the card's measured panel bottom, not the measurement.
const PANEL_B = 230, PANEL_GAP = 21;
const BAND_Y = PANEL_B + PANEL_GAP;

// Centred on WL.CX so the trunk leaves a face midpoint (WL.L-07).
const TOP_W = 232, TOP_X = WL.CX - TOP_W / 2;
const BUS_Y = BAND_Y + 6;

// Five columns spanning WL.L..WL.R exactly, so the middle one centres on WL.CX.
const COL_W = 204, COL_PITCH = 219;
const COL_X = [0, 1, 2, 3, 4].map(i => WL.L + i * COL_PITCH);
const COL_CX = i => COL_X[i] + COL_W / 2;

// Owners take the WL actor height, the Pods sit on the floor, and the spine spans the rest.
const OWNER_Y = 300, OWNER_H = WL.BOX_H;
const POD_Y = 496, POD_H = 92;
const POD_INNER = { dx: 26, dy: 20, w: COL_W - 52, h: 46 };
const VERDICT_Y = POD_Y + POD_H + 22;
// The Job the CronJob created, a tier as wide as the app box. The short relation gap leaves the lane the room.
const JOB_W = POD_INNER.w, JOB_H = 44, JOB_GAP = 26;
const JOB_X = COL_CX(4) - JOB_W / 2, JOB_Y = OWNER_Y + OWNER_H + JOB_GAP;

// The CronJob column's watch ends on its Job, the controller that watches Pods. The CronJob box
// fills the column, so the tap drops through the column gap into the Job's left face.
const GAP_X = COL_X[4] - (COL_PITCH - COL_W) / 2, JOB_CY = JOB_Y + JOB_H / 2;
const TRUNK = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y]];
const BUS_L = [[COL_CX(0), BUS_Y], [WL.CX, BUS_Y]];
const BUS_R = [[WL.CX, BUS_Y], [GAP_X, BUS_Y]];
const TAP = i => (i === 4
  ? [[GAP_X, BUS_Y], [GAP_X, JOB_CY], [JOB_X, JOB_CY]]
  : [[COL_CX(i), BUS_Y], [COL_CX(i), OWNER_Y]]);
// The middle watch keeps the bus corner too, so all five balls can share one trunk timing.
const WATCH = i => [...TRUNK, ...TAP(i).slice(COL_CX(i) === WL.CX ? 1 : 0)];
// Built once as arrays, not by a factory, so lane and ball share the same object (A-02).
// The CronJob column's spine leaves its Job tier, the one that owns the Pod.
const SPINE = [0, 1, 2, 3, 4].map(i => [[COL_CX(i), i === 4 ? JOB_Y + JOB_H : OWNER_Y + OWNER_H], [COL_CX(i), POD_Y]]);
const OWNS_JOB = [[COL_CX(4), OWNER_Y + OWNER_H], [COL_CX(4), JOB_Y]];

// A trunk segment carries the ball but is not its destination: a lane without its marker (A-06).
const trunkPath = (key, points) => P.lane({
  key, points, dim: true, dashed: true, role: 'cluster',
  tune: (el) => el.removeAttribute('marker-end'),
});

const OWNERS = [
  { key: 'rs', label: 'ReplicaSet web-7f9c8', sub: 'replicas 3' },
  { key: 'sts', label: 'StatefulSet web', sub: 'replicas 3' },
  { key: 'ds', label: 'DaemonSet agent', sub: 'one per Node' },
  { key: 'job', label: 'Job import', sub: 'completions 4' },
  { key: 'cron', label: 'CronJob report', sub: 'schedule hourly' },
];
// Pod names live in the sublabel, the one Pod text `podSublabels` can rewrite.
const HAD = ['web-7f9c8-4mzqd', 'web-1', 'agent-9x2ld', 'import-h5trn', 'report-28114500-2q9wv'];
const CRON_SUB = OWNERS[4].sub;
// Who hears the Pod deletion: the CronJob holds no Pod informer, its Job does.
const WATCHER = ['rs', 'sts', 'ds', 'job', 'cronJob'];
const GONE = ['', '', '', '', ''];
// C-09, not C-08: the object leaves the API, which is what `terminated` means.
const OFF = OPACITY.terminated;

// One call states all five slots, so the row cannot drift. Lanes stay at full on every step.
const perPod = (a, b, c, d, e) => ({ pod0: a, pod1: b, pod2: c, pod3: d, pod4: e });
const verdicts = (a, b, c, d, e) => ({ v0: a, v1: b, v2: c, v3: d, v4: e });

export const SCENE = {
  'aria-label': 'Pod replacement guarantees: one Pod is lost under each of five controllers and the answers differ, a ReplicaSet, a Job and the Job a CronJob created hand back a new Pod with a new name while the CronJob itself starts nothing, a StatefulSet hands back the same ordinal with the same claim and a DaemonSet a fresh name on the same Node, and nothing comes back when the Node is gone',
  parts: [
    P.defs(),
    trunkPath('trunk', TRUNK),
    trunkPath('busL', BUS_L),
    trunkPath('busR', BUS_R),
    ...COL_X.map((_, i) => P.lane({ key: `tap${i}`, points: TAP(i), dim: true, dashed: true, role: 'cluster' })),
    // Five spines are lanes, because a replacement rides each of them.
    ...COL_X.map((_, i) => P.lane({ key: `spine${i}`, points: SPINE[i], dim: true, dashed: true, role: 'cluster' })),
    // A CronJob creates Jobs and never a Pod, so its link to the Job is a relation (A-05).
    P.relation({ key: 'ownsJob', points: OWNS_JOB, role: 'cluster', dash: '4 4' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'event', x: WL.CX, y: WL.TOP_Y - 12 }),
    ...COL_X.map((_, i) => P.wire({ key: `v${i}`, x: COL_CX(i), y: VERDICT_Y })),
    P.packets(),
    // Appended after the packet layer, so the ball runs under it.
    ...COL_X.map((_, i) => P.pod({
      key: `pod${i}`, id: `pod${i}`, innerKey: `pod${i}Box`,
      x: COL_X[i], y: POD_Y, w: COL_W, h: POD_H, label: '', sublabel: HAD[i], containers: 0,
      inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app' },
    })),
    ...OWNERS.map((o, i) => P.box({ key: o.key, x: COL_X[i], y: OWNER_Y, w: COL_W, h: OWNER_H, label: o.label, sublabel: o.sub, role: 'cluster' })),
    P.box({ key: 'cronJob', x: JOB_X, y: JOB_Y, w: JOB_W, h: JOB_H, label: 'Job report-28114500', sublabel: 'owns the Pod', role: 'cluster' }),
    P.box({ key: 'apiserver', x: TOP_X, y: WL.TOP_Y, w: TOP_W, h: WL.BOX_H, label: 'API', sublabel: 'Pod objects live here', role: 'cluster' }),
  ],
  reset: {
    keys: ['apiserver', 'rs', 'sts', 'ds', 'job', 'cron', 'cronJob', 'pod0Box', 'pod1Box', 'pod2Box', 'pod3Box', 'pod4Box'],
    pods: ['pod0', 'pod1', 'pod2', 'pod3', 'pod4'],
  },
};

const handBack = (i, name, delay) => [
  F.route({ points: SPINE[i], name: `back${i}`, delay }),
  F.fade({ target: `pod${i}`, from: OFF, to: 1, dur: FADE.in, at: `back${i}`, fill: 'both', easing: 'ease-out' }),
  F.pulse({ pod: `pod${i}`, at: `back${i}` }),
  F.set({ at: `back${i}`, podSublabels: { [`pod${i}`]: name } }),
];

// The five watch hops share the longest duration and one trunk corner, so they ride the trunk as
// one ball and all owners learn at one instant (M-12).
const WATCH_FAN = fanTiming(OWNERS.map((_, i) => WATCH(i)));

const NEW_RS = 'web-7f9c8-tp8vd';
// A DaemonSet replacement takes a fresh suffix: what it keeps is the Node.
const NEW_DS = 'agent-4tk8p';
const NEW_JOB = 'import-c4knz';
// Named by the Job, not the CronJob: the Job's name plus a fresh suffix.
const NEW_CJ = 'report-28114500-k7xfm';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    wires: { ...verdicts('', '', '', '', ''), event: '' },
    podSublabels: perPod(...HAD),
    sublabels: { cron: CRON_SUB },
    opacity: perPod(1, 1, 1, 1, 1),
  },
  {
    id: 'the-blow',
    duration: 3800,
    narration: 'The same thing happens to all five: the Pod is gone, and the object leaves the API. It happens at one moment and is equally true of every column, so nothing that follows is a matter of who noticed first. From here the answers are not the same, and what separates them is what each controller promises rather than how fast it reacts.',
    wires: { ...verdicts('gone', 'gone', 'gone', 'gone', 'gone'), event: 'Pod deleted' },
    podSublabels: perPod(...GONE),
    sublabels: { cron: CRON_SUB },
    opacity: perPod(OFF, OFF, OFF, OFF, OFF),
    lit: ['apiserver'],
    // Names and verdicts wait for the blink (T-30). `event` is not wound back: it is the premise.
    rewind: { podSublabels: perPod(...HAD), wires: verdicts('', '', '', '', '') },
    flow: [
      // The five Pods blink before they dissolve, or the two read as one event (M-08).
      ...[0, 1, 2, 3, 4].map(i => F.pulse({ pod: `pod${i}`, delay: 0 })),
      ...[0, 1, 2, 3, 4].map(i => F.fade({ target: `pod${i}`, from: 1, to: OFF, dur: FADE.out, delay: BEAT.afterPulse, fill: 'both' })),
      F.set({ delay: BEAT.afterPulse, podSublabels: perPod(...GONE), wires: verdicts('gone', 'gone', 'gone', 'gone', 'gone') }),
      // One event, five watches: one delay, one landing beat (WATCH_FAN).
      ...WATCHER.map((key, i) => F.route({ points: WATCH(i), name: `w${i}`, delay: BEAT.afterPulse + 260, dur: WATCH_FAN.dur, offsets: WATCH_FAN.offsets[i], lights: [key] })),
    ],
  },
  {
    id: 'a-new-one',
    duration: 3700,
    narration: 'Three of them hand back a NEW Pod. A ReplicaSet replica is interchangeable, so its replacement comes at once with a fresh name. A Job makes one after a back-off delay while its completions are unmet, counting the loss against backoffLimit, 6 by default. The CronJob itself starts nothing before its next tick, but its Job does.',
    wires: { ...verdicts('a new name', 'gone', 'gone', 'a new name', 'its Job, a new name'), event: 'Pod deleted' },
    podSublabels: perPod(NEW_RS, '', '', NEW_JOB, NEW_CJ),
    sublabels: { cron: 'started nothing' },
    opacity: perPod(1, OFF, OFF, 1, 1),
    // The CronJob stays dark: its Job is the sender.
    lit: ['rs', 'job', 'cronJob'],
    // The reduced path shows the landing pulse as the inner box lit.
    reducedLit: ['pod0Box', 'pod3Box', 'pod4Box'],
    rewind: { wires: verdicts('gone', 'gone', 'gone', 'gone', 'gone'), podSublabels: perPod(...GONE), sublabels: { cron: CRON_SUB } },
    flow: [
      // Both Jobs land a beat later: their replacement waits out the back-off the ReplicaSet never has.
      ...handBack(0, NEW_RS, 0),
      ...handBack(3, NEW_JOB, BEAT.lead),
      ...handBack(4, NEW_CJ, BEAT.lead),
      F.set({ at: 'back0', wires: verdicts('a new name', 'gone', 'gone', 'gone', 'gone') }),
      F.set({ at: 'back3', wires: { v3: 'a new name' } }),
      F.set({ at: 'back4', wires: { v4: 'its Job, a new name' }, sublabels: { cron: 'started nothing' } }),
    ],
  },
  {
    id: 'the-same-one',
    duration: 3800,
    narration: 'Two of them hand back something the lost Pod already had. A StatefulSet returns the identical ordinal and keeps its claim, and the cluster attaches that volume to the Node the replacement lands on. A DaemonSet returns a fresh name, but only to the Node it lost one on, because its count follows the Nodes it targets and never a number you set.',
    wires: { ...verdicts('a new name', 'same ordinal, same claim', 'same Node', 'a new name', 'its Job, a new name'), event: 'Pod deleted' },
    podSublabels: perPod(NEW_RS, HAD[1], NEW_DS, NEW_JOB, NEW_CJ),
    sublabels: { cron: 'started nothing' },
    opacity: perPod(1, 1, 1, 1, 1),
    lit: ['sts', 'ds'],
    reducedLit: ['pod1Box', 'pod2Box'],
    rewind: {
      wires: verdicts('a new name', 'gone', 'gone', 'a new name', 'its Job, a new name'),
      podSublabels: { pod1: '', pod2: '' },
    },
    flow: [
      ...handBack(1, HAD[1], 0),
      ...handBack(2, NEW_DS, 0),
      F.set({ at: 'back2', wires: verdicts('a new name', 'same ordinal, same claim', 'same Node', 'a new name', 'its Job, a new name') }),
    ],
  },
  {
    id: 'none-at-all',
    duration: 3000,
    narration: 'The last answer is nothing at all, and here only the DaemonSet gives it. Take the Node away and its Pod is garbage collected with it, and nothing is rescheduled elsewhere, because no other Node is short of one.',
    wires: { ...verdicts('a new name', 'same ordinal, same claim', 'the Node went too', 'a new name', 'its Job, a new name'), event: 'Node-2 removed' },
    podSublabels: perPod(NEW_RS, HAD[1], '', NEW_JOB, NEW_CJ),
    sublabels: { cron: 'started nothing' },
    // The ownership spine dies with the Pod (A-14). The watch tap stays: the controller still watches.
    opacity: { ...perPod(1, 1, OFF, 1, 1), spine2: 0 },
    lit: ['ds'],
    rewind: {
      wires: verdicts('a new name', 'same ordinal, same claim', 'same Node', 'a new name', 'its Job, a new name'),
      podSublabels: { pod2: NEW_DS },
    },
    flow: [
      F.pulse({ pod: 'pod2', delay: 0 }),
      F.fade({ target: 'pod2', from: 1, to: OFF, dur: FADE.out, delay: BEAT.afterPulse, fill: 'both' }),
      F.fade({ target: 'spine2', from: 1, to: 0, dur: FADE.out, delay: BEAT.afterPulse, fill: 'both' }),
      F.set({
        delay: BEAT.afterPulse,
        podSublabels: { pod2: '' },
        wires: verdicts('a new name', 'same ordinal, same claim', 'the Node went too', 'a new name', 'its Job, a new name'),
      }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
