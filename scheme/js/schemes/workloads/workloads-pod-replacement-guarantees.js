import { P, F, defineCard, WL, FADE, BEAT, OPACITY, routeDur } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-pod-replacement-guarantees.md

// A verdict board: five controller columns, one event reaching all five at once from the API.
// PANEL_B is the deepest measured panel.
const PANEL_B = 230, PANEL_GAP = 21;
const BAND_Y = PANEL_B + PANEL_GAP;

// Centred on WL.CX so the trunk leaves a face midpoint (WL.L-07).
const TOP_W = 232, TOP_X = WL.CX - TOP_W / 2;
const BUS_Y = BAND_Y + 6;

// Five columns spanning WL.L..WL.R exactly, so the middle one centres on WL.CX.
const COL_W = 204, COL_PITCH = 219;
const COL_X = [0, 1, 2, 3, 4].map(i => WL.L + i * COL_PITCH);
const COL_CX = i => COL_X[i] + COL_W / 2;

// Rows pushed as far apart as the band allows, so the spine is long enough to clear the routeDur floor (M-13).
const OWNER_Y = 300, OWNER_H = 60;
const POD_Y = 496, POD_H = 92;
const POD_INNER = { dx: 26, dy: 20, w: COL_W - 52, h: 46 };
const VERDICT_Y = POD_Y + POD_H + 22;
// Off the spine, or the relation dash strikes through the word.
const OWNS_TAG_X = COL_CX(4) - 62, OWNS_TAG_Y = POD_Y - 16;

const TRUNK = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y]];
const BUS_L = [[COL_CX(0), BUS_Y], [WL.CX, BUS_Y]];
const BUS_R = [[WL.CX, BUS_Y], [COL_CX(4), BUS_Y]];
const TAP = i => [[COL_CX(i), BUS_Y], [COL_CX(i), OWNER_Y]];
const WATCH = i => (COL_CX(i) === WL.CX
  ? [[WL.CX, WL.TOP_BOTTOM], [WL.CX, OWNER_Y]]
  : [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y], [COL_CX(i), BUS_Y], [COL_CX(i), OWNER_Y]]);
// Built once as arrays, not by a factory, so lane and ball share the same object (A-02).
const SPINE = [0, 1, 2, 3, 4].map(i => [[COL_CX(i), OWNER_Y + OWNER_H], [COL_CX(i), POD_Y]]);

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
const GONE = ['', '', '', '', ''];
// C-09, not C-08: the object leaves the API, which is what `terminated` means.
const OFF = OPACITY.terminated;

// One call states all five slots, so the row cannot drift. Lanes stay at full on every step.
const perPod = (a, b, c, d, e) => ({ pod0: a, pod1: b, pod2: c, pod3: d, pod4: e });
const verdicts = (a, b, c, d, e) => ({ v0: a, v1: b, v2: c, v3: d, v4: e });

export const SCENE = {
  'aria-label': 'Pod replacement guarantees: one Pod is lost under each of five controllers and the answers differ, a ReplicaSet and a Job hand back a new Pod with a new name, a StatefulSet hands back the same ordinal with the same claim and a DaemonSet a fresh name on the same Node, and nothing comes back at all when the Node is gone or when the owner is a CronJob, which owns Jobs rather than Pods',
  parts: [
    P.defs(),
    trunkPath('trunk', TRUNK),
    trunkPath('busL', BUS_L),
    trunkPath('busR', BUS_R),
    ...COL_X.map((_, i) => P.lane({ key: `tap${i}`, points: TAP(i), dim: true, dashed: true, role: 'cluster' })),
    // Four spines are lanes, because a replacement rides each of them.
    ...[0, 1, 2, 3].map(i => P.lane({ key: `spine${i}`, points: SPINE[i], dim: true, dashed: true, role: 'cluster' })),
    // A CronJob never creates a Pod, so its spine is a relation (A-05).
    P.relation({ key: 'spine4', points: SPINE[4], role: 'cluster', dash: '4 4' }),
    P.tag({ x: OWNS_TAG_X, y: OWNS_TAG_Y, text: 'through a Job' }),
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
    P.box({ key: 'apiserver', x: TOP_X, y: WL.TOP_Y, w: TOP_W, h: WL.BOX_H, label: 'API', sublabel: 'Pod objects live here', role: 'cluster' }),
  ],
  reset: {
    keys: ['apiserver', 'rs', 'sts', 'ds', 'job', 'cron', 'pod0Box', 'pod1Box', 'pod2Box', 'pod3Box', 'pod4Box'],
    pods: ['pod0', 'pod1', 'pod2', 'pod3', 'pod4'],
  },
};

const handBack = (i, name, delay) => [
  F.route({ points: SPINE[i], name: `back${i}`, delay }),
  F.fade({ target: `pod${i}`, from: OFF, to: 1, dur: FADE.in, at: `back${i}`, fill: 'both', easing: 'ease-out' }),
  F.pulse({ pod: `pod${i}`, at: `back${i}` }),
  F.set({ at: `back${i}`, podSublabels: { [`pod${i}`]: name } }),
];

// The five watch hops share the longest duration so all owners learn at one instant (M-12).
const WATCH_DUR = Math.max(...OWNERS.map((_, i) => routeDur(WATCH(i))));

const NEW_RS = 'web-7f9c8-tp8vd';
// A DaemonSet replacement takes a fresh suffix: what it keeps is the Node.
const NEW_DS = 'agent-4tk8p';
const NEW_JOB = 'import-c4knz';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    wires: { ...verdicts('', '', '', '', ''), event: '' },
    podSublabels: perPod(...HAD),
    opacity: perPod(1, 1, 1, 1, 1),
  },
  {
    id: 'the-blow',
    duration: 3800,
    narration: 'The same thing happens to all five: the Pod is gone, and the object leaves the API. It is one deletion in one moment and it is equally true of every column, so nothing that follows is a matter of who noticed first. From here the answers are not the same, and what separates them is what each controller promises rather than how fast it reacts.',
    wires: { ...verdicts('gone', 'gone', 'gone', 'gone', 'gone'), event: 'Pod deleted' },
    podSublabels: perPod(...GONE),
    opacity: perPod(OFF, OFF, OFF, OFF, OFF),
    lit: ['apiserver'],
    // Names and verdicts wait for the blink (T-30). `event` is not wound back: it is the premise.
    rewind: { podSublabels: perPod(...HAD), wires: verdicts('', '', '', '', '') },
    flow: [
      // The five Pods blink before they dissolve, or the two read as one event (M-08).
      ...[0, 1, 2, 3, 4].map(i => F.pulse({ pod: `pod${i}`, delay: 0 })),
      ...[0, 1, 2, 3, 4].map(i => F.fade({ target: `pod${i}`, from: 1, to: OFF, dur: FADE.out, delay: BEAT.afterPulse, fill: 'both' })),
      F.set({ delay: BEAT.afterPulse, podSublabels: perPod(...GONE), wires: verdicts('gone', 'gone', 'gone', 'gone', 'gone') }),
      // One event, five watches: one delay, one landing beat (WATCH_DUR).
      ...OWNERS.map((o, i) => F.route({ points: WATCH(i), name: `w${i}`, delay: BEAT.afterPulse + 260, dur: WATCH_DUR, lights: [o.key] })),
    ],
  },
  {
    id: 'a-new-one',
    duration: 3400,
    narration: 'Two of them hand back a NEW Pod. A ReplicaSet replica is interchangeable, so the replacement takes a fresh name and lands on any Node that fits. A Job creates one too, but only while its completions are unmet, and the failure it just saw counts against backoffLimit, which defaults to 6.',
    wires: { ...verdicts('a new name', 'gone', 'gone', 'a new name', 'gone'), event: 'Pod deleted' },
    podSublabels: perPod(NEW_RS, '', '', NEW_JOB, ''),
    opacity: perPod(1, OFF, OFF, 1, OFF),
    lit: ['rs', 'job'],
    // The reduced path shows the landing pulse as the inner box lit.
    reducedLit: ['pod0Box', 'pod3Box'],
    rewind: { wires: verdicts('gone', 'gone', 'gone', 'gone', 'gone'), podSublabels: perPod(...GONE) },
    flow: [
      // One delay: neither controller waits on the other.
      ...handBack(0, NEW_RS, 0),
      ...handBack(3, NEW_JOB, 0),
      F.set({ at: 'back3', wires: verdicts('a new name', 'gone', 'gone', 'a new name', 'gone') }),
    ],
  },
  {
    id: 'the-same-one',
    duration: 3600,
    narration: 'Two of them hand back something the lost Pod already had. A StatefulSet returns the identical ordinal and keeps its claim, and the cluster attaches that volume to whatever Node the replacement lands on. A DaemonSet returns a fresh name, but only to the Node it lost one on, because its count is the Node set and never a number you set.',
    wires: { ...verdicts('a new name', 'same ordinal, same claim', 'same Node', 'a new name', 'gone'), event: 'Pod deleted' },
    podSublabels: perPod(NEW_RS, HAD[1], NEW_DS, NEW_JOB, ''),
    opacity: perPod(1, 1, 1, 1, OFF),
    lit: ['sts', 'ds'],
    reducedLit: ['pod1Box', 'pod2Box'],
    rewind: {
      wires: verdicts('a new name', 'gone', 'gone', 'a new name', 'gone'),
      podSublabels: { pod1: '', pod2: '' },
    },
    flow: [
      ...handBack(1, HAD[1], 0),
      ...handBack(2, NEW_DS, 0),
      F.set({ at: 'back2', wires: verdicts('a new name', 'same ordinal, same claim', 'same Node', 'a new name', 'gone') }),
    ],
  },
  {
    id: 'none-at-all',
    duration: 3600,
    narration: 'The last answer is nothing at all. Take the Node away and the DaemonSet Pod is garbage collected with it, and nothing is rescheduled elsewhere, because no other Node is short of one. A CronJob gives that answer always: it creates Jobs and owns no Pods, so the CronJob itself starts nothing until the next tick of its schedule.',
    wires: { ...verdicts('a new name', 'same ordinal, same claim', 'the Node went too', 'a new name', 'nothing until the next tick'), event: 'Node-2 removed' },
    podSublabels: perPod(NEW_RS, HAD[1], '', NEW_JOB, ''),
    // The ownership spine dies with the Pod (A-14). The watch tap stays: the controller still watches.
    opacity: { ...perPod(1, 1, OFF, 1, OFF), spine2: 0 },
    lit: ['ds', 'cron'],
    rewind: {
      wires: verdicts('a new name', 'same ordinal, same claim', 'same Node', 'a new name', 'gone'),
      podSublabels: { pod2: NEW_DS },
    },
    flow: [
      F.pulse({ pod: 'pod2', delay: 0 }),
      F.fade({ target: 'pod2', from: 1, to: OFF, dur: FADE.out, delay: BEAT.afterPulse, fill: 'both' }),
      F.fade({ target: 'spine2', from: 1, to: 0, dur: FADE.out, delay: BEAT.afterPulse, fill: 'both' }),
      F.set({
        delay: BEAT.afterPulse,
        podSublabels: { pod2: '' },
        wires: verdicts('a new name', 'same ordinal, same claim', 'the Node went too', 'a new name', 'nothing until the next tick'),
      }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
