import { P, F, defineCard, BEAT, FADE, chipStrip, routeDur, setBoxLabel, makeRidingLabel } from './storage-kit.js';
import { rect } from '../../lib/svg.js';
// Design notes for this card: ./CARDS/storage-volume-attach-limits.md

// The panel wall. CONTENT_CX lands on 600, set by the chip strip, the widest tier. The node row is
// the one tier allowed outside CONTENT_W, because it sits below the panel floor.
const LEFT_X = 400;
const CONTENT_W = 400;
const CONTENT_CX = LEFT_X + CONTENT_W / 2;

// A vertical stack chained off one origin, so the whole card centres by moving one number.
const BLOCK_W = 232, BLOCK_H = 80;
const POD_H = 104, SCHED_H = BLOCK_H, CSI_H = BLOCK_H, NODE_H = 140, CHIP_H = 34;
const G_POD_SCHED = 46, G_SCHED_CSI = 50, G_CSI_NODE = 48, G_NODE_CHIPS = 24;

const STACK_H = POD_H + G_POD_SCHED + SCHED_H + G_SCHED_CSI + CSI_H + G_CSI_NODE + NODE_H + G_NODE_CHIPS + CHIP_H;
const STACK_TOP = (640 - STACK_H) / 2;                   // the bottom margin matches it

const POD_W = BLOCK_W;
const POD_X = CONTENT_CX - POD_W / 2;
const POD_Y = STACK_TOP;
const POD_BOTTOM = POD_Y + POD_H;

const PVC_W = 192, PVC_DY = 26, PVC_H = 44;              // the catalog app box

// One width for the Scheduler and the CSINode box below it, so they read as one column.
const SCHED_W = BLOCK_W;
const SCHED_X = CONTENT_CX - SCHED_W / 2;                // aligned with CSI_X
const SCHED_Y = POD_BOTTOM + G_POD_SCHED;
const SCHED_BOTTOM = SCHED_Y + SCHED_H;

const CSI_W = BLOCK_W;
const CSI_X = CONTENT_CX - CSI_W / 2;
const CSI_Y = SCHED_BOTTOM + G_SCHED_CSI;
const CSI_TOP = CSI_Y, CSI_BOTTOM = CSI_Y + CSI_H;
const CSI_MID_Y = CSI_Y + CSI_H / 2;                     // where the two side entries land
const CSI_LEFT = CSI_X, CSI_RIGHT = CSI_X + CSI_W;

const NODE_W = 220, NODE_GAP = 30;
const NODES_W = NODE_W * 3 + NODE_GAP * 2;
const NODES_X0 = CONTENT_CX - NODES_W / 2;
const NODE_Y = CSI_BOTTOM + G_CSI_NODE;
const NODE_X = [0, 1, 2].map(i => NODES_X0 + i * (NODE_W + NODE_GAP));
const NODE_CX = NODE_X.map(x => x + NODE_W / 2);         // centred on CONTENT_CX

const LANE_X = NODE_CX;

const SLOT_N = 8, SLOT_COLS = 4, SLOT_W = 26, SLOT_HGT = 26, SLOT_GAP = 10;
const SLOT_ROW_W = SLOT_COLS * SLOT_W + (SLOT_COLS - 1) * SLOT_GAP;
const SLOT_X0 = (NODE_W - SLOT_ROW_W) / 2;
// The catalog frame padding: slots 34 under the frame top, the counter 12 over its floor.
const SLOT_Y0 = 34;
const CNT_X = 24, CNT_Y = 98, CNT_W = NODE_W - 48, CNT_H = 30;

// Sized against `allocatable.count` and `8 per node`.
const CHIP_W = 232, CHIP_GAP = 16, CHIP_COUNT = 4;
const CHIPS = chipStrip({ cx: CONTENT_CX, w: CHIP_W, gap: CHIP_GAP, count: CHIP_COUNT });
const CHIPS_Y = NODE_Y + NODE_H + G_NODE_CHIPS;

// The request and the answer are an out/back pair, the catalog 24 apart about the spine.
const LANE_DX = 12;
const W_POD_SCHED = [[CONTENT_CX - LANE_DX, POD_BOTTOM], [CONTENT_CX - LANE_DX, SCHED_Y]];
const W_SCHED_POD = [[CONTENT_CX + LANE_DX, SCHED_Y], [CONTENT_CX + LANE_DX, POD_BOTTOM]];

const W_SCHED_CSI = [[CONTENT_CX, SCHED_BOTTOM], [CONTENT_CX, CSI_TOP]];

const W_NODE_CSI = [
  [[LANE_X[0], NODE_Y], [LANE_X[0], CSI_MID_Y], [CSI_LEFT, CSI_MID_Y]],
  [[LANE_X[1], NODE_Y], [LANE_X[1], CSI_BOTTOM]],
  [[LANE_X[2], NODE_Y], [LANE_X[2], CSI_MID_Y], [CSI_RIGHT, CSI_MID_Y]],
];

const REPORT_DUR = Math.max(...W_NODE_CSI.map(routeDur));

// The outer report lanes end on the CSINode side faces, so each outer tag steps further out.
const CAP_TAG_DX = [-16, 0, 16];
// The middle lane ends on the CSINode floor: its tag parks below the ball, clear of the floor and the ball.
const CAP_TAG_DY = [-14, 22, -14];

// The read lane tag starts inside the Scheduler, so it fades in once the ball clears that floor.
const emergeTag = makeRidingLabel({ role: 'storage', emergeMode: true });
const READ_TAG_EMERGE = 300;
// The answer tag rides OUTSIDE its pair, right of the answer lane, or it crosses the request lane.
const ANS_TAG_DX = 85;

const SLOT_FILL = Object.freeze({
  free: 'rgba(255, 255, 255, 0.04)',
  used: 'rgba(94, 202, 148, 0.30)',
  fresh: 'rgba(94, 202, 148, 0.62)',
});
const SLOT_STROKE = 'rgba(94, 202, 148, 0.35)';

// Eight bare rects with inline stroke and fill inside the node group: no part kind emits them, and
// node() has no labelY knob for the caption y. A ref key on the rects renames the settled-dump probe.
const nodeFrame = (i, label) => P.node({
  x: NODE_X[i], y: NODE_Y, w: NODE_W, h: NODE_H, label,
  tune: (el, refs) => {
    const cap = el.querySelector('.scheme-node-label');
    if (cap) cap.setAttribute('y', 14);
    const slots = [];
    for (let j = 0; j < SLOT_N; j++) {
      const col = j % SLOT_COLS, row = Math.floor(j / SLOT_COLS);
      const r = rect({
        x: SLOT_X0 + col * (SLOT_W + SLOT_GAP),
        y: SLOT_Y0 + row * (SLOT_HGT + SLOT_GAP),
        width: SLOT_W, height: SLOT_HGT, rx: 3,
      });
      r.style.stroke = SLOT_STROKE;
      r.style.strokeWidth = '1';
      r.style.fill = SLOT_FILL.free;
      el.appendChild(r);
      slots.push(r);
    }
    refs.nodes = refs.nodes || [];
    refs.nodes[i] = { slots };
  },
});

const counter = (i) => P.box({
  key: `cnt${i}`, x: NODE_X[i] + CNT_X, y: NODE_Y + CNT_Y, w: CNT_W, h: CNT_H, label: '0 of 8',
});

// The three report lanes carry no key at all: no step addresses them, they are the static track the
// cap-report balls ride over.
const reportLane = (points) => P.lane({ points, dashed: true, dim: true });

const lane = (key, points) => P.lane({ key, points, dashed: true, dim: true });

export const SCENE = {
  'aria-label': 'Node volume attach limits: every Node has a hard ceiling on how many volumes one CSI driver may have attached at once, reported by the node plugin as max_volumes_per_node, written into CSINode as allocatable.count and read by the Scheduler filter NodeVolumeLimits. With all three Nodes at eight of eight, Pod web-0 asks for one slot and stays Pending, and a slot frees when a detach completes and its VolumeAttachment is gone, not when a Pod dies.',
  parts: [
    P.defs(),
    nodeFrame(0, 'node-1'),
    nodeFrame(1, 'node-2'),
    nodeFrame(2, 'node-3'),
    counter(0),
    counter(1),
    counter(2),
    P.box({
      key: 'csinode', x: CSI_X, y: CSI_Y, w: CSI_W, h: CSI_H,
      label: 'CSINode (one per node)', sublabel: 'allocatable.count: 8',
    }),
    P.box({
      key: 'sched', x: SCHED_X, y: SCHED_Y, w: SCHED_W, h: SCHED_H,
      label: 'Scheduler', sublabel: 'NodeVolumeLimits filter',
    }),
    P.pod({
      key: 'podNew', shellKey: 'podShell', innerKey: 'podBox',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Pod web-0', sublabel: 'not created', containers: 0,
      inner: { dx: (POD_W - PVC_W) / 2, dy: PVC_DY, w: PVC_W, h: PVC_H, label: 'PVC data-web-0', sublabel: 'needs one slot' },
    }),
    lane('wPodSched', W_POD_SCHED),
    lane('wSchedPod', W_SCHED_POD),
    lane('wSchedCsi', W_SCHED_CSI),
    ...W_NODE_CSI.map(reportLane),
    P.chip({ key: 'capChip', x: CHIPS.x(0), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'allocatable.count', value: '8 per node' }),
    P.chip({ key: 'attChip', x: CHIPS.x(1), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'attached', value: '4 of 24' }),
    P.chip({ key: 'podChip', x: CHIPS.x(2), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'Pod web-0', value: 'not created' }),
    P.chip({ key: 'blockChip', x: CHIPS.x(3), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'blocked by', value: 'nothing' }),
    P.packets(),
  ],
  reset: {
    keys: ['sched', 'csinode', 'cnt0', 'cnt1', 'cnt2', 'podBox',
      'capChip', 'attChip', 'podChip', 'blockChip'],
    pods: ['podNew'],
  },
};

// All four chips go through setChip, so all four are chipsCued. The ceiling is not an argument:
// eight per node is the premise of the card and never moves.
const chips = (attached, pod, blocked) => ({
  capChip: '8 per node', attChip: attached, podChip: pod, blockChip: blocked,
});

// STO.S-01 as fields: the Pod and the three talking lanes are born mid-story, so every step states
// every one of them. Nothing below is inherited from the step before it.
const stage = ({
  podOp = 0, podSub = 'not created', pvcSub = 'needs one slot',
  linkPod = 0,        // the Pod to Scheduler request lane
  linkBack = 0,       // the Scheduler to Pod answer lane
  linkRead = 0,       // the Scheduler reading allocatable.count off CSINode
} = {}) => ({
  opacity: { podNew: podOp, wPodSched: linkPod, wSchedPod: linkBack, wSchedCsi: linkRead },
  podSublabels: { podShell: podSub },
  sublabels: { podBox: pvcSub },
});

const usedOf = (spec) => (typeof spec === 'number' ? spec : spec.used);

// No spec field writes a slot FILL (`opacity:` writes style.opacity), so the gauge is an enter hook
// on every step, and all three counters are stated every step or a node keeps its previous reading.
function setSlots(s, counts) {
  s.refs.nodes.forEach((n, i) => {
    const spec = counts[i];
    const used = usedOf(spec);
    const fresh = typeof spec === 'number' ? false : Boolean(spec.fresh);
    n.slots.forEach((r, j) => {
      if (j >= used) { r.style.fill = SLOT_FILL.free; return; }
      r.style.fill = (fresh && j === used - 1) ? SLOT_FILL.fresh : SLOT_FILL.used;
    });
  });
}

const gauge = (counts) => ({
  labels: Object.fromEntries(counts.map((spec, i) => [`cnt${i}`, usedOf(spec) + ' of ' + SLOT_N])),
  enter: (s) => setSlots(s, counts),
});

// `seq` counts across ALL THREE nodes: a delay from the node index and its own start double-counts.
// FILL_END is the instant the last slot lands.
const FILL_FROM = [2, 1, 1];
const FILL_GAP = 90, FILL_MS = 220;
const FILL_N = FILL_FROM.reduce((n, from) => n + (SLOT_N - from), 0);
const FILL_END = FILL_GAP * (FILL_N - 1) + FILL_MS;

// The slots carry no ref key, so no opacity field and no F.fade reaches them. F.run at delay 0 calls
// its body inline and registers no timer, so the twenty fades are created right here.
const fillSlots = (s, ctx) => {
  let seq = 0;
  s.refs.nodes.forEach((n, i) => {
    for (let j = FILL_FROM[i]; j < SLOT_N; j++, seq++) {
      n.slots[j].style.opacity = '0';
      ctx.register(n.slots[j].animate([{ opacity: 0 }, { opacity: 1 }],
        { duration: FILL_MS, delay: FILL_GAP * seq, fill: 'forwards', easing: 'ease-out' }));
    }
  });
};

// The slot is retaken and THAT instant is when web-0 is placed: the Pod blink and every value the
// placement earns hang off this one number.
const PLACE_MS = 2000;

// Same escape, plus each fade's COMPLETION rewrites the counter text and `unlight` is the only
// onfinish F.fade carries. Opacity only, never fill, so a seek or a cancel lands on the pinned `fresh`.
const detachLag = (s, ctx) => {
  const slot = s.refs.nodes[2].slots[SLOT_N - 1];
  const cnt = s.refs.cnt2;
  const free = slot.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, delay: 200, fill: 'forwards', easing: 'ease-in' });
  free.onfinish = () => setBoxLabel(cnt, '7 of ' + SLOT_N);
  ctx.register(free);
  const take = slot.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 1600, fill: 'forwards', easing: 'ease-out' });
  take.onfinish = () => setBoxLabel(cnt, SLOT_N + ' of ' + SLOT_N);
  ctx.register(take);
};

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('4 of 24', 'not created', 'nothing'),
    ...stage(),
    ...gauge([2, 1, 1]),
  },
  {
    id: 'cap',
    duration: 3400,
    narration: 'The ceiling is not a Kubernetes setting. It is reported by the CSI node plugin as max_volumes_per_node in its NodeGetInfo answer, then written by the Kubelet into the CSINode object for that Node as allocatable.count. Real drivers report anything from a handful on a small VM to a hundred and twenty seven on GCE.',
    chipsCued: chips('4 of 24', 'not created', 'nothing'),
    ...stage(),
    ...gauge([2, 1, 1]),
    // ONE duration for all three report balls so they land together. No Pod acts, so no pulse.
    flow: [
      ...W_NODE_CSI.flatMap((points, i) => [
        F.route({ points, delay: BEAT.lead, dur: REPORT_DUR, name: `rep${i}`, tag: { text: 'cap 8', dx: CAP_TAG_DX[i], dy: CAP_TAG_DY[i] } }),
      ]),
      F.light({ targets: ['csinode'], at: 'rep2' }),
    ],
  },
  {
    id: 'fill',
    duration: 3000,
    // Packet-less and Pod-less, and it does not need the sanctioned block flash: the slots filling IS
    // the motion, and it is the only step on the card where the gauge moves on its own.
    narration: 'Now the cluster fills. More Pods with claims are provisioned, more disks attach, and every Node walks up to its own ceiling: eight of eight on all three, twenty four of twenty four across the cluster. No alarm fires, because a Node sitting exactly at its ceiling is a healthy Node.',
    chipsCued: chips('24 of 24', 'not created', 'nothing'),
    ...stage(),
    ...gauge([8, 8, 8]),
    lit: ['cnt0', 'cnt1', 'cnt2'],
    // The chip turns over when the LAST slot lands, not at entry while slots are still filling.
    rewind: { chips: { attChip: '4 of 24' } },
    flow: [
      F.run({ fn: fillSlots }),
      F.set({ delay: FILL_END, chipsCued: chips('24 of 24', 'not created', 'nothing') }),
    ],
  },
  {
    id: 'ask',
    duration: 3000,
    narration: 'Now Pod web-0 is created and it asks for one volume of its own. Before the Scheduler can score any Node it has to filter out the ones that cannot take the Pod at all, and one filter exists purely for this ceiling. It is called NodeVolumeLimits, and a Pod that claims no volume is skipped.',
    chipsCued: chips('24 of 24', 'Pending', 'nothing'),
    ...stage({ podOp: 1, podSub: 'Pending', linkPod: 1 }),
    ...gauge([8, 8, 8]),
    // The Pod is ABSENT at rest, not dim, so the animated path starts from the absence the step
    // before it left and the arrival IS the event.
    rewind: { opacity: { podNew: 0 } },
    // It fades in first, and then takes the up-arrow ordering: it blinks because it is the actor,
    // and the request leaves once the blink has landed.
    flow: [
      F.fade({ target: 'podNew', from: 0, to: 1, dur: FADE.in, delay: 150, fill: 'forwards', easing: 'ease-out' }),
      F.pulse({ pod: 'podNew', delay: 250 }),
      F.route({ points: W_POD_SCHED, delay: 250 + BEAT.afterPulse, name: 'req' }),
      // The tag starts on the Pod sublabel, so it emerges once the ball is clear of the floor, as `rd` does.
      F.tag({ text: 'schedule web-0', points: W_POD_SCHED, delay: 250 + BEAT.afterPulse, fn: emergeTag, emerge: READ_TAG_EMERGE }),
      F.light({ targets: ['sched'], at: 'req' }),
    ],
  },
  {
    id: 'filter',
    duration: 3200,
    narration: 'The filter reads allocatable.count out of each CSINode and compares it with what that Node already owes: the volumes of the Pods assigned to it, plus every VolumeAttachment still live on it. Eight plus the one web-0 needs is over a ceiling of eight, so all three are rejected before scoring runs.',
    chipsCued: chips('24 of 24', 'Pending', 'max volume count'),
    ...stage({ podOp: 1, podSub: 'Pending', linkPod: 1, linkRead: 1 }),
    ...gauge([8, 8, 8]),
    // All three counters stay lit, being what the filter compares against, and this is a read: nothing
    // on the node tier changes. The Scheduler is lit from entry, since a ball never leaves an unlit block.
    lit: ['cnt0', 'cnt1', 'cnt2', 'sched'],
    flow: [
      F.route({ points: W_SCHED_CSI, delay: BEAT.lead, name: 'rd' }),
      F.tag({ text: 'read allocatable.count', points: W_SCHED_CSI, delay: BEAT.lead, fn: emergeTag, emerge: READ_TAG_EMERGE }),
      F.light({ targets: ['csinode'], at: 'rd' }),
    ],
  },
  {
    id: 'reject',
    duration: 3000,
    narration: 'So web-0 stays Pending, and its event reads zero of three Nodes are available, three Nodes exceed max volume count. Every one of those Nodes has spare CPU and spare memory, which is what makes this hard to recognise: the cluster looks half empty and the Pod will not schedule.',
    chipsCued: chips('24 of 24', 'FailedScheduling', 'max volume count'),
    ...stage({ podOp: 1, podSub: 'FailedScheduling', linkPod: 1, linkBack: 1, linkRead: 1 }),
    ...gauge([8, 8, 8]),
    lit: ['sched'],
    // Down-arrow ordering: the ball goes first, the Pod blinks on arrival. The tag rides BELOW the
    // ball, clear of the Pod sublabel.
    flow: [
      F.route({ points: W_SCHED_POD, delay: BEAT.lead, tag: { text: 'exceed max volume count', dx: ANS_TAG_DX, dy: 22 }, pulse: 'podNew' }),
    ],
  },
  {
    id: 'detachlag',
    duration: 3400,
    // The senior edge, and the reason this is not simply a capacity-planning card. A slot is held by
    // an ATTACHMENT, not by a Pod, so the two are not freed at the same moment.
    narration: 'What clears it is a detach completing. The slot is held by the VolumeAttachment, not by the Pod, so deleting a Pod frees nothing until that object is gone, and a detach takes seconds to tens of seconds. One finishes on Node-3, the count drops to seven, and web-0 is placed there at once.',
    chipsCued: chips('24 of 24', 'placed on node-3', 'nothing'),
    ...stage({ podOp: 1, podSub: 'placed on node-3', pvcSub: 'attaching to node-3', linkPod: 1, linkBack: 1, linkRead: 1 }),
    ...gauge([8, 8, { used: 8, fresh: true }]),
    lit: ['cnt2'],
    // web-0 is Pending until the freed slot is taken, so the chip and both sublabels hold what the
    // reject step left and turn over together on the placement, the way `fill` waits for its slots.
    rewind: {
      chips: { podChip: 'FailedScheduling' },
      podSublabels: { podShell: 'FailedScheduling' },
      sublabels: { podBox: 'needs one slot' },
    },
    flow: [
      F.run({ fn: detachLag }),
      F.pulse({ pod: 'podNew', delay: PLACE_MS }),
      F.set({
        delay: PLACE_MS,
        chipsCued: { podChip: 'placed on node-3' },
        podSublabels: { podShell: 'placed on node-3' },
        sublabels: { podBox: 'attaching to node-3' },
      }),
    ],
  },
  {
    id: 'fix',
    duration: 3400,
    narration: 'Every lever here is about the ceiling and none is about CPU. Fewer volumes per Pod is the cheapest, since a Pod mounting four claims eats four slots wherever it lands. More Nodes buys more slots, and an instance type that reports a higher ceiling buys more per Node.',
    chipsCued: chips('24 of 24', 'placed on node-3', 'nothing'),
    ...stage({ podOp: 1, podSub: 'placed on node-3', pvcSub: 'attaching to node-3', linkPod: 1, linkBack: 1, linkRead: 1 }),
    ...gauge([8, 8, { used: 8, fresh: true }]),
    lit: ['csinode'],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
