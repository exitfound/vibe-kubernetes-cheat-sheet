import { P, F, defineCard, ladder, spread, WL, BEAT, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-controller-kinds.md

// No A / B / C preset: the card carries neither a ladder nor a chip column flanking a spine, so it
// has no columns for the three presets to choose between. The argument is in the record.

// Four columns over the full WL width, one per kind that creates Pods directly. spread fixes the
// box WIDTH and derives the gap, so the board spans 60..1140 and centres on WL.CX by construction.
const BOX_W = 240;
const COL = spread({ from: WL.L, to: WL.R, count: 4, w: BOX_W });   // gap 40, x 60 / 340 / 620 / 900
const CX = (i) => COL.x(i) + BOX_W / 2;                             // 180 / 460 / 740 / 1020

// Band 1: the two kinds that create another controller, over columns 0 and 3 only. The measured
// panel bottom is 180.12 at 1100x800, so 224 stands 43.88 clear of it and L-03 is met on the left.
const OWNER_Y = 224, OWNER_H = 56, OWNER_B = OWNER_Y + OWNER_H;     // 224..280
// Band 2: the four kinds that create Pods. The two gaps left over once all three bands are placed
// are spent on the lanes, 106 and 100, because the ownership hop is what the card is about.
const KIND_Y = 386, KIND_H = 64, KIND_B = KIND_Y + KIND_H;          // 386..450
// Band 3: one Pod per column, at the FULL column width, so a column reads as one stack rather than
// as a box with a narrower tile under it. Bottom on the 624 floor the category draws its Node rows to.
const POD_W = BOX_W, POD_H = 74, POD_Y = 550;                       // 550..624
const POD_X = (i) => COL.x(i);                                      // 60 / 340 / 620 / 900

// What the controller hands its Pod rides INSIDE the Pod, the way workloads-pod-garbage-collection
// draws a phase: a Pod holding nothing reads as an empty rectangle, and this is the one thing each
// of these four actually holds. 216 wide leaves 39.1 clear at each wall on the longest string,
// measured 137.8 as a 12px scheme-box-label.
const IN_DX = 12, IN_W = POD_W - IN_DX * 2;                         // 216, inset 12 each side
const IN_DY = 24, IN_H = 42;                                        // 574..616, 8 clear under it

// The band above the board is the only one L-03 leaves: the full height right of x=420 is free.
// The column is 360 rather than the 480 of WL.COL_R, which is what lets it sit CENTRED on WL.CX
// while its left wall stands exactly on the 420 L-03 allows, 23.45 clear of this card's widest
// panel. 336 of usable width is still 46.5 more than the longest name and value pair needs.
const CHIP_W = 360, CHIP_X = WL.CX - CHIP_W / 2;                    // 420..780, centred on WL.CX
const CHIP_Y = ladder({ y: WL.TOP_Y, rowH: WL.CHIP_H, gap: 8 });    // 40..158

// Every lane is built ONCE and the P.arrow and the F.segment index the SAME two point objects, so
// the drawn wire and the ball it carries cannot drift apart (A-02).
const LANE = (x, y1, y2) => ({ from: [x, y1], to: [x, y2] });
const LANES = {
  laneDep:  LANE(CX(0), OWNER_B, KIND_Y),
  laneCron: LANE(CX(3), OWNER_B, KIND_Y),
  laneRs:   LANE(CX(0), KIND_B, POD_Y),
  laneSts:  LANE(CX(1), KIND_B, POD_Y),
  laneDs:   LANE(CX(2), KIND_B, POD_Y),
  laneJob:  LANE(CX(3), KIND_B, POD_Y),
};
const lanePart = (key) => P.arrow({ key, ...LANES[key], dim: true, dashed: true, role: 'cluster' });

// What each Pod IS to the controller above it, in the two halves the reader needs: the thing it
// holds, and the consequence. The kind BOX says what the controller does, so this says what the Pod
// is, and no half of a pair repeats the sublabel over it.
const POD_HELD = [
  ['Pod', 'Name generated', 'replaced by an equal'],
  ['Pod web-0', 'Ordinal 0', 'the same name returns'],
  ['Pod', 'One per matching Node', 'no replica count'],
  ['Pod', 'Exits when done', 'no restart on success'],
];

// The list order IS the append order, so it is the z-order: lanes, chips and the two captions
// first, then the packet layer, and every box and Pod above the ball it sends.
export const SCENE = {
  'aria-label': 'Six workload controller kinds over one row of Pods: a Deployment creates a ReplicaSet and a CronJob creates a Job, while ReplicaSet, StatefulSet, DaemonSet and Job each create the Pods, and three questions separate them, whether a replica carries a stable identity, whether the count follows the matching Node set, and whether the work ends',
  parts: [
    P.defs(),
    ...Object.keys(LANES).map(lanePart),
    P.chip({ key: 'identityChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'replica identity', value: 'none yet' }),
    P.chip({ key: 'countChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'what sets the count', value: 'none yet' }),
    P.chip({ key: 'endChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'does the work end', value: 'none yet' }),
    P.tag({ key: 'chipTag', x: WL.CX, y: CHIP_Y(0) - 14, text: 'three questions that pick one' }),
    // The middle of the owner band is empty because only two kinds stand there, so the caption
    // saying why sits in the 300..900 gap the two of them leave.
    P.tag({ key: 'ownerTag', x: WL.CX, y: OWNER_Y + OWNER_H / 2 + 4, text: 'neither of these creates a Pod' }),
    P.packets(),
    P.box({ key: 'dep', x: COL.x(0), y: OWNER_Y, w: BOX_W, h: OWNER_H, label: 'Deployment', sublabel: 'owns a ReplicaSet', role: 'cluster' }),
    P.box({ key: 'cron', x: COL.x(3), y: OWNER_Y, w: BOX_W, h: OWNER_H, label: 'CronJob', sublabel: 'owns a Job per tick', role: 'cluster' }),
    P.box({ key: 'rs', x: COL.x(0), y: KIND_Y, w: BOX_W, h: KIND_H, label: 'ReplicaSet', sublabel: 'a count you set', role: 'cluster' }),
    P.box({ key: 'sts', x: COL.x(1), y: KIND_Y, w: BOX_W, h: KIND_H, label: 'StatefulSet', sublabel: 'identity per ordinal', role: 'cluster' }),
    P.box({ key: 'ds', x: COL.x(2), y: KIND_Y, w: BOX_W, h: KIND_H, label: 'DaemonSet', sublabel: 'follows the Node set', role: 'cluster' }),
    P.box({ key: 'job', x: COL.x(3), y: KIND_Y, w: BOX_W, h: KIND_H, label: 'Job', sublabel: 'runs to completion', role: 'cluster' }),
    ...POD_HELD.map(([label, held, why], i) => P.pod({
      key: 'pod' + i, id: 'pod' + i, x: POD_X(i), y: POD_Y, w: POD_W, h: POD_H, label, containers: 0,
      inner: { dx: IN_DX, dy: IN_DY, w: IN_W, h: IN_H, label: held, sublabel: why },
    })),
  ],
  reset: {
    keys: ['dep', 'cron', 'rs', 'sts', 'ds', 'job', 'identityChip', 'countChip', 'endChip'],
    pods: ['pod0', 'pod1', 'pod2', 'pod3'],
  },
};

// The board as ONE opacity field (A-16): whatever is not named LIVE holds the outside-this-path
// shade, and every lane then takes min(source, sink) so no lane outshines the box it leaves (A-13).
const BLOCKS = ['dep', 'cron', 'rs', 'sts', 'ds', 'job', 'pod0', 'pod1', 'pod2', 'pod3'];
const LANE_ENDS = [
  ['laneDep', 'dep', 'rs'], ['laneCron', 'cron', 'job'],
  ['laneRs', 'rs', 'pod0'], ['laneSts', 'sts', 'pod1'],
  ['laneDs', 'ds', 'pod2'], ['laneJob', 'job', 'pod3'],
];
const stage = (live) => {
  const on = new Set(live);
  const o = {};
  for (const k of BLOCKS) o[k] = on.has(k) ? 1 : OPACITY.notready;
  for (const [k, a, b] of LANE_ENDS) o[k] = Math.min(o[a], o[b]);
  return o;
};

// Values that recur, named once so a three-key chips block stays one readable line.
const PLAIN = 'none, interchangeable', SET = 'spec.replicas', FOREVER = 'no, it keeps running';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { identityChip: 'none yet', countChip: 'none yet', endChip: 'none yet' },
    // Nothing is picked yet, so the whole board sits at the outside-this-path shade.
    opacity: stage([]),
  },
  {
    id: 'kinds',
    duration: 2400,
    narration: 'Six built-in kinds manage Pods for you, and each one of them ends at the same thing, a Pod. Four create Pods directly. The other two create another controller instead, so their Pods always arrive through something else.',
    chips: { identityChip: 'none yet', countChip: 'none yet', endChip: 'none yet' },
    opacity: stage(BLOCKS),
    // The whole map lifts to full and the Pod row blinks left to right. The three chips still read
    // `none yet`, which is what the CARD has claimed so far: what each Pod holds stands on the
    // canvas from the poster on, and this beat is the row every one of the six ends at.
    flow: [0, 1, 2, 3].map(i => F.pulse({ pod: `pod${i}`, delay: 300 + i * 200 })),
  },
  {
    id: 'replicas',
    duration: 3800,
    narration: 'A Deployment is the common case for a stateless app. It creates a ReplicaSet and the ReplicaSet creates the Pods, which is why you rarely write a ReplicaSet yourself. Those replicas are interchangeable and how many there are is a number you set.',
    chips: { identityChip: PLAIN, countChip: SET, endChip: FOREVER },
    opacity: stage(['dep', 'rs', 'pod0']),
    lit: ['dep', 'identityChip', 'countChip', 'endChip'],
    flow: [
      // The Deployment acts on its own, so its ball waits BEAT.lead and the ReplicaSet lights on
      // arrival, which is what makes it a receiver before it is the next sender.
      F.segment({ ...LANES.laneDep, delay: BEAT.lead, name: 'own', lights: ['rs'] }),
      F.segment({ ...LANES.laneRs, after: 'own', name: 'make' }),
      F.pulse({ pod: 'pod0', at: 'make' }),
    ],
  },
  {
    id: 'identity',
    duration: 3000,
    narration: 'First question, does a replica need an identity. A StatefulSet names each Pod after itself and an ordinal, so ordinal 0 of a StatefulSet called web is web-0 and a replacement comes back under that name. A Deployment promises none of it.',
    chips: { identityChip: 'ordinal, web-0 stays web-0', countChip: SET, endChip: FOREVER },
    opacity: stage(['sts', 'pod1']),
    lit: ['sts', 'identityChip'],
    flow: [
      F.segment({ ...LANES.laneSts, delay: BEAT.lead, name: 'make' }),
      F.pulse({ pod: 'pod1', at: 'make' }),
    ],
  },
  {
    id: 'nodes',
    duration: 3000,
    narration: 'Second question, does the count follow the Nodes. A DaemonSet carries no replica number at all. It places one Pod on each Node that matches, so a Node joining the cluster gains a Pod and a Node leaving takes one away.',
    chips: { identityChip: PLAIN, countChip: 'the matching Node set', endChip: FOREVER },
    opacity: stage(['ds', 'pod2']),
    lit: ['ds', 'identityChip', 'countChip'],
    flow: [
      F.segment({ ...LANES.laneDs, delay: BEAT.lead, name: 'make' }),
      F.pulse({ pod: 'pod2', at: 'make' }),
    ],
  },
  {
    id: 'ends',
    duration: 3000,
    narration: 'Third question, does the work end. A Job runs Pods until the work is finished and then stops, where a ReplicaSet, a StatefulSet and a DaemonSet are each meant to keep running. That is the line between a workload you keep up and a task you want finished.',
    chips: { identityChip: PLAIN, countChip: 'spec.parallelism', endChip: 'yes, at completions' },
    opacity: stage(['job', 'pod3']),
    lit: ['job', 'countChip', 'endChip'],
    flow: [
      F.segment({ ...LANES.laneJob, delay: BEAT.lead, name: 'make' }),
      F.pulse({ pod: 'pod3', at: 'make' }),
    ],
  },
  {
    id: 'schedule',
    duration: 3800,
    narration: 'A CronJob answers when rather than what. On each tick of its schedule it creates a Job, about one per tick and not exactly one, and that Job creates the Pods, so a CronJob reaches a Pod through a second controller.',
    chips: { identityChip: PLAIN, countChip: 'about one Job per tick', endChip: 'no, only each Job ends' },
    opacity: stage(['cron', 'job', 'pod3']),
    lit: ['cron', 'countChip', 'endChip'],
    flow: [
      F.segment({ ...LANES.laneCron, delay: BEAT.lead, name: 'tick', lights: ['job'] }),
      F.segment({ ...LANES.laneJob, after: 'tick', name: 'make' }),
      F.pulse({ pod: 'pod3', at: 'make' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
