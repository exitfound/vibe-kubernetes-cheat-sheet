import { P, F, defineCard, ladder, spread, WL, BEAT, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-controller-kinds.md

// No ladder and no flanking chip column, so no A / B / C preset applies.

// Four columns, one per kind that creates Pods directly. Fixed width, derived gap.
const BOX_W = 232;
const COL = spread({ from: WL.L, to: WL.R, count: 4, w: BOX_W });
const CX = (i) => COL.x(i) + BOX_W / 2;

// Band 1: the two kinds that create another controller, over columns 0 and 3 only.
const OWNER_Y = 224, OWNER_H = WL.BOX_H, OWNER_B = OWNER_Y + OWNER_H;
// Band 2: the four kinds that create Pods.
const KIND_Y = 386, KIND_H = WL.BOX_H, KIND_B = KIND_Y + KIND_H;
// Band 3: one Pod per column at full column width, so a column reads as one stack.
const POD_W = BOX_W, POD_H = 74, POD_Y = 550;
const POD_X = (i) => COL.x(i);

// What the controller hands its Pod rides inside the Pod, or the Pod reads empty.
const IN_DX = 12, IN_W = POD_W - IN_DX * 2;
const IN_DY = 24, IN_H = 42;

// Narrower than WL.COL_R so it centres on WL.CX with its left wall on the L-03 limit.
const CHIP_W = 360, CHIP_X = WL.CX - CHIP_W / 2;
const CHIP_Y = ladder({ y: WL.TOP_Y, rowH: WL.CHIP_H, gap: 8 });

// P.arrow and F.segment index the same point objects, so wire and ball cannot drift (A-02).
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

// What each Pod is to its controller: what it holds, and the consequence. Never repeats the kind box.
const POD_HELD = [
  ['Pod', 'Name generated', 'replaced by an equal'],
  ['Pod web-0', 'Ordinal 0', 'the same name returns'],
  ['Pod', 'One per matching Node', 'no replica count'],
  ['Pod', 'Exits when done', 'no restart on success'],
];

// List order is z-order: boxes and Pods sit above the packet layer.
export const SCENE = {
  'aria-label': 'Six workload controller kinds over one row of Pods: a Deployment creates a ReplicaSet and a CronJob creates a Job, while ReplicaSet, StatefulSet, DaemonSet and Job each create the Pods, and three questions separate them, whether a replica carries a stable identity, whether the count follows the matching Node set, and whether the work ends',
  parts: [
    P.defs(),
    ...Object.keys(LANES).map(lanePart),
    P.chip({ key: 'identityChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'replica identity', value: 'none yet' }),
    P.chip({ key: 'countChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'what sets the count', value: 'none yet' }),
    P.chip({ key: 'endChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'does the work end', value: 'none yet' }),
    P.tag({ key: 'chipTag', x: WL.CX, y: CHIP_Y(0) - 14, text: 'three questions that pick one' }),
    // Says why the middle of the owner band is empty.
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

// One opacity field (A-16): unnamed blocks hold the outside-this-path shade, and each lane takes
// min(source, sink) so it never outshines its box (A-13).
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

const PLAIN = 'none, interchangeable', SET = 'spec.replicas', FOREVER = 'no, it keeps running';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { identityChip: 'none yet', countChip: 'none yet', endChip: 'none yet' },
    opacity: stage([]),
  },
  {
    id: 'kinds',
    duration: 2400,
    narration: 'Six built-in kinds manage Pods for you, and each one of them ends at the same thing, a Pod. Four create Pods directly. The other two create another controller instead, so their Pods always arrive through something else.',
    chips: { identityChip: 'none yet', countChip: 'none yet', endChip: 'none yet' },
    opacity: stage(BLOCKS),
    // The chips still read `none yet`: nothing has been picked.
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
      // The Deployment acts on its own, so its ball waits BEAT.lead.
      F.segment({ ...LANES.laneDep, delay: BEAT.lead, name: 'own', lights: ['rs'] }),
      F.segment({ ...LANES.laneRs, after: 'own', name: 'make', pulse: 'pod0' }),
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
      F.segment({ ...LANES.laneSts, delay: BEAT.lead, name: 'make', pulse: 'pod1' }),
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
      F.segment({ ...LANES.laneDs, delay: BEAT.lead, name: 'make', pulse: 'pod2' }),
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
      F.segment({ ...LANES.laneJob, delay: BEAT.lead, name: 'make', pulse: 'pod3' }),
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
      F.segment({ ...LANES.laneJob, after: 'tick', name: 'make', pulse: 'pod3' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
