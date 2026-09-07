import { P, F, defineCard, WL, FADE, BEAT, OPACITY, routeDur } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-pod-replacement-guarantees.md

// A VERDICT BOARD: five columns, one per controller kind, each an owner over the Pod it had, and
// one event reaching all five at once from the API above. The steps are grouped by ANSWER and not
// by controller, which is the whole reason the card is four steps rather than six.
// Panel measured at x<=396.55 and y<=229.82, both at 1100x800 (worst of 1600/1280/1100).
const PANEL_B = 230, PANEL_GAP = 21;
const BAND_Y = PANEL_B + PANEL_GAP;                      // 251, the first line under the panel

// One actor, centred on WL.CX so the trunk leaves a face midpoint (WL.L-07). The event is a DELETE
// that already happened, so the API is the only thing above the board: what each owner acts on is
// the object leaving, which it reads off its own watch.
const TOP_W = 232, TOP_X = WL.CX - TOP_W / 2;            // 484..716
const BUS_Y = BAND_Y + 6;                                // 257

// Five columns spanning WL.L..WL.R exactly, so the middle one centres on WL.CX and the trunk drops
// straight into it: 5 x 204 on a pitch of 219 ends on 1140.
const COL_W = 204, COL_PITCH = 219;
const COL_X = [0, 1, 2, 3, 4].map(i => WL.L + i * COL_PITCH);   // 60 / 279 / 498 / 717 / 936
const COL_CX = i => COL_X[i] + COL_W / 2;                       // 162 / 381 / 600 / 819 / 1038

// The two rows are pushed as far apart as the band allows, and the reason is the BALL rather than
// the picture: the replacement rides the ownership spine, and `routeDur` clamps anything under 314
// units to the 700ms floor (M-13), so a short spine crawls. 136 is the most the band holds with the
// verdict row still clear of 624, and it puts the four replacements on 0.194 u/ms. The narrower gap
// that was measured against it, and the number that rules it out, are in the record: MOTION.
const OWNER_Y = 300, OWNER_H = 60;
const POD_Y = 496, POD_H = 92;
const POD_INNER = { dx: 26, dy: 20, w: COL_W - 52, h: 46 };
const VERDICT_Y = POD_Y + POD_H + 22;                    // 610, the answer under each column
// The caption sits OFF the spine, not on it: centred on the column it lands on the relation and the
// dash strikes through the word. Measured at 1600x1000, where it is widest, the string inks 90.4
// units, so 62 left of the column centre leaves it 17 clear of the line and 83 clear of the Job
// column beside it, and it still ends well inside WL.R. Record: SIZES.
const OWNS_TAG_X = COL_CX(4) - 62, OWNS_TAG_Y = POD_Y - 16;

const TRUNK = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y]];
const BUS_L = [[COL_CX(0), BUS_Y], [WL.CX, BUS_Y]];
const BUS_R = [[WL.CX, BUS_Y], [COL_CX(4), BUS_Y]];
const TAP = i => [[COL_CX(i), BUS_Y], [COL_CX(i), OWNER_Y]];
const WATCH = i => (COL_CX(i) === WL.CX
  ? [[WL.CX, WL.TOP_BOTTOM], [WL.CX, OWNER_Y]]
  : [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y], [COL_CX(i), BUS_Y], [COL_CX(i), OWNER_Y]]);
// Ownership, owner down to the Pod it had. On four of the five it also carries the replacement, so
// it is built ONCE as an array rather than by a factory: a factory hands the drawn lane and the
// ball two arrays that are equal and never the same object, which is what A-02 is about.
const SPINE = [0, 1, 2, 3, 4].map(i => [[COL_CX(i), OWNER_Y + OWNER_H], [COL_CX(i), POD_Y]]);

// A trunk segment carries the ball but is not its destination, so it is a LANE with the marker
// taken off (A-06, the `workloads-replicaset` form): the arrowhead belongs on the tap that lands
// on an owner.
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
// The Pod each owner had a moment ago. A Pod carries its name in a label no field can write, so the
// name lives in the SUBLABEL, which `podSublabels` rewrites: that is what lets the same slot show a
// fresh name for a ReplicaSet and the identical one for a StatefulSet. Record: SIZES.
const HAD = ['web-7f9c8-4mzqd', 'web-1', 'agent-9x2ld', 'import-h5trn', 'report-28114500-2q9wv'];
const GONE = ['', '', '', '', ''];
// The slot shade for a Pod that is not there. C-09 and not C-08: the step says the object LEAVES
// THE API, which is the sentence `terminated` is defined by, and the board has to read as empty
// from across the card so that a slot coming back at full is the loudest thing on it.
const OFF = OPACITY.terminated;

// One call states all five slots, because the row is one instrument: the five together are the
// reading, and stating them apart is how the board drifts. The same shape carries the names and
// the shades, so the two can never fall out of step. NO LINE IS IN either: every lane is at full
// on every step, because A-13 would pin each spine to a slot that is empty on most of the card and
// wash the delivery path out with it. Record: LANES.
const perPod = (a, b, c, d, e) => ({ pod0: a, pod1: b, pod2: c, pod3: d, pod4: e });
const verdicts = (a, b, c, d, e) => ({ v0: a, v1: b, v2: c, v3: d, v4: e });

// Z-order: the lanes, then the captions and the verdicts over them, then the packet layer, then
// the Pods and the boxes, which the ball runs under.
export const SCENE = {
  'aria-label': 'Pod replacement guarantees: one Pod is lost under each of five controllers and the answers differ, a ReplicaSet and a Job hand back a new Pod with a new name, a StatefulSet hands back the same ordinal with the same claim and a DaemonSet a fresh name on the same Node, and nothing comes back at all when the Node is gone or when the owner is a CronJob, which owns Jobs rather than Pods',
  parts: [
    P.defs(),
    trunkPath('trunk', TRUNK),
    trunkPath('busL', BUS_L),
    trunkPath('busR', BUS_R),
    ...COL_X.map((_, i) => P.lane({ key: `tap${i}`, points: TAP(i), dim: true, dashed: true, role: 'cluster' })),
    // Four ownership spines are LANES, because a replacement rides each of them at some point.
    ...[0, 1, 2, 3].map(i => P.lane({ key: `spine${i}`, points: SPINE[i], dim: true, dashed: true, role: 'cluster' })),
    // The fifth is a RELATION: a CronJob never creates a Pod, so nothing ever rides this line and
    // an arrowhead on it would read as traffic (A-05).
    P.relation({ key: 'spine4', points: SPINE[4], role: 'cluster', dash: '4 4' }),
    P.tag({ x: OWNS_TAG_X, y: OWNS_TAG_Y, text: 'through a Job' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'event', x: WL.CX, y: WL.TOP_Y - 12 }),
    ...COL_X.map((_, i) => P.wire({ key: `v${i}`, x: COL_CX(i), y: VERDICT_Y })),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
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

// A replacement is handed back the same way every time: it rides the ownership spine into the slot
// the Pod left, the slot comes up out of the pending shade and the name under it is rewritten.
const handBack = (i, name, delay) => [
  F.route({ points: SPINE[i], name: `back${i}`, delay }),
  F.fade({ target: `pod${i}`, from: OFF, to: 1, dur: FADE.in, at: `back${i}`, fill: 'both', easing: 'ease-out' }),
  F.pulse({ pod: `pod${i}`, at: `back${i}` }),
  F.set({ at: `back${i}`, podSublabels: { [`pod${i}`]: name } }),
];

// The five watch hops share the longest path's duration so the one event lands on the five owners
// at one instant. At the canon speed the paths run 180 to 618 units, which puts the arrivals 673ms
// apart and the two `web` owners 486ms apart: that draws the owners learning it in an order, the
// one thing the step must not say. The two outer hops ARE their own routeDur, so the deviation this
// buys is the middle three, on this step alone (M-12, registered in `PACING`). Record: MOTION.
const WATCH_DUR = Math.max(...OWNERS.map((_, i) => routeDur(WATCH(i))));   // 1373

const NEW_RS = 'web-7f9c8-tp8vd';
// A DaemonSet Pod is generated the way a ReplicaSet Pod is, so its replacement takes a fresh
// suffix. What it keeps is the NODE, which is the verdict wire and not the name. Record: CONTENT.
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
    // The board still shows the five Pods it had when the step opens. Without this the names go
    // and every verdict reads `gone` at t=0, which answers the step 800ms before the Pods blink
    // and leaves the `F.set` below writing what is already written (T-30). `event` is deliberately
    // NOT wound back: the label is the premise the step opens on, the way `none-at-all` opens on
    // `Node-2 removed`.
    rewind: { podSublabels: perPod(...HAD), wires: verdicts('', '', '', '', '') },
    flow: [
      // The five Pods blink before they dissolve, or the two read as one event (M-08).
      ...[0, 1, 2, 3, 4].map(i => F.pulse({ pod: `pod${i}`, delay: 0 })),
      ...[0, 1, 2, 3, 4].map(i => F.fade({ target: `pod${i}`, from: 1, to: OFF, dur: FADE.out, delay: BEAT.afterPulse, fill: 'both' })),
      F.set({ delay: BEAT.afterPulse, podSublabels: perPod(...GONE), wires: verdicts('gone', 'gone', 'gone', 'gone', 'gone') }),
      // One event, five watches, so the five hops leave at ONE delay AND land on ONE beat.
      // WATCH_DUR is why, and M-12 registers the deviation.
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
    // The animated path says the Pod landed by PULSING it, which no `lights` list can name: the
    // static path has to say it with the inner box instead.
    reducedLit: ['pod0Box', 'pod3Box'],
    rewind: { wires: verdicts('gone', 'gone', 'gone', 'gone', 'gone'), podSublabels: perPod(...GONE) },
    flow: [
      // Both leave at one delay: neither controller waits on the other, and a beat between them
      // would draw an order that does not exist.
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
    // The DaemonSet Pod goes with its Node and its OWNERSHIP spine goes with the Pod: a lane whose
    // far end is gone reads as a rendering fault rather than as a claim (A-14). Its watch tap stays
    // at full, because the controller is still there and still watching, and only the Pod is not.
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
