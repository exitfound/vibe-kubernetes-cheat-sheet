import { P, F, defineCard, BEAT, FADE, chipStrip, routeDur, setBoxLabel } from './storage-kit.js';
import { rect } from '../../lib/svg.js';
// Design notes for this card: ./CARDS.md#storage-volume-attach-limits

const LEFT_X = 400;
const CONTENT_W = 400;
const CONTENT_CX = LEFT_X + CONTENT_W / 2;               // 600

// ---- Vertical stack, chained off one origin so the whole card centres by moving one number ----
const POD_H = 110, SCHED_H = 60, CSI_H = 56, NODE_H = 150, CHIP_H = 32;
const G_POD_SCHED = 54, G_SCHED_CSI = 50, G_CSI_NODE = 48, G_NODE_CHIPS = 24;

const STACK_H = POD_H + G_POD_SCHED + SCHED_H + G_SCHED_CSI + CSI_H + G_CSI_NODE + NODE_H + G_NODE_CHIPS + CHIP_H;
const STACK_TOP = (640 - STACK_H) / 2;                   // 32, and the bottom margin matches it

// 226x110 is the storage family Pod, set by storage-csi-attach-mount and kept here so a Pod is the
// same object across the row.
const POD_W = 226;
const POD_X = CONTENT_CX - POD_W / 2;                    // 487
const POD_Y = STACK_TOP;                                 // 32
const POD_BOTTOM = POD_Y + POD_H;                        // 142

const PVC_DY = 34, PVC_H = 46;

// Matched to CSI_W (280) so the Scheduler and the CSINode box below it read as one column. The
// sublabel 'NodeVolumeLimits filter' measures about 250 units, so 280 still leaves ~30 units of air.
const SCHED_W = 280;
const SCHED_X = CONTENT_CX - SCHED_W / 2;                // 460, aligned with CSI_X
const SCHED_Y = POD_BOTTOM + G_POD_SCHED;                // 198
const SCHED_BOTTOM = SCHED_Y + SCHED_H;                  // 258

const CSI_W = 280;
const CSI_X = CONTENT_CX - CSI_W / 2;                    // 460..740
const CSI_Y = SCHED_BOTTOM + G_SCHED_CSI;                // 302
const CSI_TOP = CSI_Y, CSI_BOTTOM = CSI_Y + CSI_H;       // 302 / 358
const CSI_MID_Y = CSI_Y + CSI_H / 2;                     // 330, where the two side entries land
const CSI_LEFT = CSI_X, CSI_RIGHT = CSI_X + CSI_W;       // 460 / 740

const NODE_W = 220, NODE_GAP = 30;
const NODES_W = NODE_W * 3 + NODE_GAP * 2;               // 720
const NODES_X0 = CONTENT_CX - NODES_W / 2;               // 240
const NODE_Y = CSI_BOTTOM + G_CSI_NODE;                  // 406
const NODE_X = [0, 1, 2].map(i => NODES_X0 + i * (NODE_W + NODE_GAP)); // 240 / 490 / 740
const NODE_CX = NODE_X.map(x => x + NODE_W / 2);         // 350 / 600 / 850, centred on 600

const LANE_X = NODE_CX;                                  // 350 / 600 / 850

const SLOT_N = 8, SLOT_COLS = 4, SLOT_W = 26, SLOT_HGT = 26, SLOT_GAP = 10;
const SLOT_ROW_W = SLOT_COLS * SLOT_W + (SLOT_COLS - 1) * SLOT_GAP;    // 134
const SLOT_X0 = (NODE_W - SLOT_ROW_W) / 2;               // 43
const SLOT_Y0 = 38;                                      // two rows, 38..64 and 74..100
const CNT_X = 24, CNT_Y = 110, CNT_W = NODE_W - 48, CNT_H = 30;        // 172 wide, bottom 140, 10 clear

const CHIP_W = 232, CHIP_GAP = 16, CHIP_COUNT = 4;
// Fix the width and the gap, derive the 976 unit span, centre it on CONTENT_CX: 112..1088.
const CHIPS = chipStrip({ cx: CONTENT_CX, w: CHIP_W, gap: CHIP_GAP, count: CHIP_COUNT });
const CHIPS_Y = NODE_Y + NODE_H + G_NODE_CHIPS;          // 572

const LANE_DX = 40;
const W_POD_SCHED = [[CONTENT_CX - LANE_DX, POD_BOTTOM], [CONTENT_CX - LANE_DX, SCHED_Y]];
const W_SCHED_POD = [[CONTENT_CX + LANE_DX, SCHED_Y], [CONTENT_CX + LANE_DX, POD_BOTTOM]];

const W_SCHED_CSI = [[CONTENT_CX, SCHED_BOTTOM], [CONTENT_CX, CSI_TOP]];

const W_NODE_CSI = [
  [[LANE_X[0], NODE_Y], [LANE_X[0], CSI_MID_Y], [CSI_LEFT, CSI_MID_Y]],
  [[LANE_X[1], NODE_Y], [LANE_X[1], CSI_BOTTOM]],
  [[LANE_X[2], NODE_Y], [LANE_X[2], CSI_MID_Y], [CSI_RIGHT, CSI_MID_Y]],
];

const REPORT_DUR = Math.max(...W_NODE_CSI.map(routeDur));

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

// Z-order: the three node frames with their gauges, then the counters, then the two decision-tier
// blocks and the Pod, then the lanes, then the chip strip, then the packet layer.
export const SCENE = {
  'aria-label': 'Node volume attach limits. Three Node frames each draw eight attachment slots with a counter, a CSINode box carries allocatable.count, and the scheduler filter NodeVolumeLimits compares the two. With every Node full, Pod web-0 asks for one slot and stays Pending, and a slot frees when a detach completes and its VolumeAttachment is gone.',
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
      inner: { dx: 16, dy: PVC_DY, w: POD_W - 32, h: PVC_H, label: 'PVC data-web-0', sublabel: 'needs one slot' },
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

// `seq` counts across ALL THREE nodes: a delay computed from the node index and its own starting
// count double-counts node-1 and runs past the step. FILL_END is the instant the last slot lands.
const FILL_FROM = [2, 1, 1];
const FILL_GAP = 90, FILL_MS = 220;
const FILL_N = FILL_FROM.reduce((n, from) => n + (SLOT_N - from), 0);  // 20 slots to light
const FILL_END = FILL_GAP * (FILL_N - 1) + FILL_MS;                    // 1930

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
    duration: 2800,
    narration: 'The ceiling is not a Kubernetes setting. It is reported by the CSI node plugin as max_volumes_per_node in its NodeGetInfo answer, then written by the Kubelet into the CSINode object for that Node as allocatable.count. Real drivers report anything from a handful on a small VM to a hundred and twenty seven on GCE.',
    chipsCued: chips('4 of 24', 'not created', 'nothing'),
    ...stage(),
    ...gauge([2, 1, 1]),
    // ONE duration for all three report balls so they land together, and the riding tag takes the
    // same one or it drifts off its ball. No Pod acts, so they leave after BEAT.lead with no pulse.
    flow: [
      ...W_NODE_CSI.flatMap((points, i) => [
        F.route({ points, delay: BEAT.lead, dur: REPORT_DUR, name: `rep${i}` }),
        F.tag({ text: 'cap 8', points, delay: BEAT.lead, dur: REPORT_DUR }),
      ]),
      F.light({ targets: ['csinode'], at: 'rep2' }),
    ],
  },
  {
    id: 'fill',
    duration: 2600,
    // Packet-less and Pod-less, and it does not need the sanctioned block flash: the slots filling IS
    // the motion, and it is the only step on the card where the gauge moves on its own.
    narration: 'Now the cluster fills. More Pods with claims are provisioned, more disks attach, and every Node walks up to its own ceiling: eight of eight on all three, twenty four of twenty four across the cluster. No alarm fires, because a Node sitting exactly at its ceiling is a healthy Node.',
    chipsCued: chips('24 of 24', 'not created', 'nothing'),
    ...stage(),
    ...gauge([8, 8, 8]),
    lit: ['cnt0', 'cnt1', 'cnt2'],
    // The chip holds the count the previous step left and turns over when the LAST slot lands: its
    // final reading at entry would count slots that are still filling for two more seconds.
    rewind: { chips: { attChip: '4 of 24' } },
    flow: [
      F.run({ fn: fillSlots }),
      F.set({ delay: FILL_END, chipsCued: chips('24 of 24', 'not created', 'nothing') }),
    ],
  },
  {
    id: 'ask',
    duration: 3000,
    narration: 'Now Pod web-0 is created and it asks for one volume of its own. Before the scheduler can score any Node it has to filter out the ones that cannot take the Pod at all, and one filter exists purely for this ceiling. It is called NodeVolumeLimits, and it skips Pods that ask for no volumes.',
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
      F.tag({ text: 'schedule web-0', points: W_POD_SCHED, delay: 250 + BEAT.afterPulse }),
      F.light({ targets: ['sched'], at: 'req' }),
    ],
  },
  {
    id: 'filter',
    duration: 3200,
    narration: 'The filter reads allocatable.count out of each CSINode and compares it with what that Node already owes: the volumes of the Pods assigned to it, plus every VolumeAttachment still live on it. Eight against a ceiling of eight, so all three are rejected before scoring runs at all.',
    chipsCued: chips('24 of 24', 'Pending', 'max volume count'),
    ...stage({ podOp: 1, podSub: 'Pending', linkPod: 1, linkRead: 1 }),
    ...gauge([8, 8, 8]),
    // All three counters stay lit, being what the filter compares against, and this is a read: nothing
    // on the node tier changes. The Scheduler is lit from entry, since a ball never leaves an unlit block.
    lit: ['cnt0', 'cnt1', 'cnt2', 'sched'],
    flow: [
      F.route({ points: W_SCHED_CSI, delay: BEAT.lead, name: 'rd' }),
      F.tag({ text: 'read allocatable.count', points: W_SCHED_CSI, delay: BEAT.lead }),
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
    // ball because pod() puts the sublabel 8 units above the shell bottom, where the default -14 prints.
    flow: [
      F.route({ points: W_SCHED_POD, delay: BEAT.lead, name: 'ans' }),
      F.tag({ text: 'exceed max volume count', points: W_SCHED_POD, delay: BEAT.lead, dy: 22 }),
      F.pulse({ pod: 'podNew', at: 'ans' }),
    ],
  },
  {
    id: 'detachlag',
    duration: 3400,
    // The senior edge, and the reason this is not simply a capacity-planning card. A slot is held by
    // an ATTACHMENT, not by a Pod, so the two are not freed at the same moment.
    narration: 'What clears it is a detach completing. The slot is held by the VolumeAttachment, not by the Pod, so deleting a Pod frees nothing until that object is gone, and a detach takes seconds to tens of seconds. One finishes on Node-3, the count drops to seven, and web-0 is placed there at once.',
    chipsCued: chips('24 of 24', 'Running on node-3', 'nothing'),
    ...stage({ podOp: 1, podSub: 'Running on node-3', pvcSub: 'attached on node-3', linkPod: 1, linkBack: 1, linkRead: 1 }),
    ...gauge([8, 8, { used: 8, fresh: true }]),
    lit: ['cnt2'],
    flow: [
      F.run({ fn: detachLag }),
      F.pulse({ pod: 'podNew', delay: 2000 }),
    ],
  },
  {
    id: 'fix',
    duration: 3400,
    narration: 'Every lever here is about the ceiling and none is about CPU. Fewer volumes per Pod is the cheapest, since a Pod mounting four claims eats four slots wherever it lands. More Nodes buys more slots, and an instance type that reports a higher ceiling buys more per Node.',
    chipsCued: chips('24 of 24', 'Running on node-3', 'nothing'),
    ...stage({ podOp: 1, podSub: 'Running on node-3', pvcSub: 'attached on node-3', linkPod: 1, linkBack: 1, linkRead: 1 }),
    ...gauge([8, 8, { used: 8, fresh: true }]),
    lit: ['csinode'],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
