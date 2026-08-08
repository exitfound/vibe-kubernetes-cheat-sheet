import { P, F, defineCard, ladder, midX, strip, shade, CLU, LAYOUT, BEAT, REVEAL_MS } from './cluster-kit.js';

// Design notes for this card: ./CARDS.md#cluster-node-allocatable

// An ARITHMETIC, not a sequence: one capacity bar carved segment by segment, scale exact at GI
// units per Gi. Panel x<=397 y<=304 against a frame label at 354, so the CEILING is 500 characters.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = midX(CONTENT_L, CONTENT_R);                   // 600, the canvas centre by construction

// Three actors in the 720 units right of the panel, so 200 wide rather than the family 232.
const BOX_W = 200, BOX_H = CLU.BOX_H, TOP_GAP = 60;
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;     // 40 / 120
const KUBELET_X = 420, KUBELET_R = KUBELET_X + BOX_W;    // 420..620
const API_X = KUBELET_R + TOP_GAP, API_R = API_X + BOX_W;// 680..880
const SCHED_X = API_R + TOP_GAP;                         // 940..1140
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);                  // 80, both hops ride the row centre line
const WIRE_Y = TOP_Y - 14;                               // 26, above the row
const WIRE_KA_X = midX(KUBELET_R, API_X);                // 650
const WIRE_AS_X = midX(API_R, SCHED_X);                  // 910

// Layout C of the kit: the ladder takes the right column, so the chips become a bottom strip.
const LADDER_X = LAYOUT.C.ladder.x, LADDER_W = LAYOUT.C.ladder.w;   // 660..1140, right of the panel
const LADDER_Y = 140, ROW_H = 25, ROW_GAP = 5;           // 6 rows -> 140..315

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;// 60..1140
const NODE_Y = 336, NODE_H = 196;                        // 336..532

// One Gi of memory in viewBox units. Every width on the bar is a multiple of it, so the drawing
// and the arithmetic cannot disagree: 16Gi capacity, 1Gi + 512Mi + 512Mi carved, 14Gi left.
const GI = 56;
const BAR_W = 16 * GI, BAR_X = CX - BAR_W / 2;           // 896 wide, 152..1048
const BAR_Y = NODE_Y + 34, BAR_H = 64;                   // 370..434, node() draws NODE-1 at +18
const KUBE_X = BAR_X, KUBE_W = GI;                       // 152..208, 1Gi
const SYS_X = KUBE_X + KUBE_W, SYS_W = GI / 2;           // 208..236, 512Mi
const EVICT_X = SYS_X + SYS_W, EVICT_W = GI / 2;         // 236..264, 512Mi
const ALLOC_X = EVICT_X + EVICT_W, ALLOC_W = 14 * GI;    // 264..1048, 14Gi

// Starts where Allocatable starts, the only place Pod requests are measured from, so a 15Gi request
// overhangs the end of the bar by exactly one Gi: the whole answer the card is written to give.
const REQ_Y = BAR_Y + BAR_H + 8, REQ_H = 22;             // 442..464
const REQ_LBL_X = ALLOC_X + 10;                          // 274, start-anchored inside the strip

// Three narrow segments cannot hold a label, so their captions stagger on three tiers below the
// strip. 56, 28 and 28 units wide is the truth of the proportion, not a drawing problem to solve.
const TIER = [480, 498, 516];

// The bottom strip is two across, which is LAYOUT.C.strip.two at 532 wide.
const CHIP_H = CLU.CHIP_H, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = 548;                                     // second row ends on 624
const COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });   // w 532
const ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });                         // 548 / 590
const CHIP_W = COL.w;
const CHIP_X = i => COL.x(i % CHIP_COLS);
const CHIP_Y = i => ROW(Math.floor(i / CHIP_COLS));

// Residency, not traffic: this Kubelet runs on this Node and computes its Allocatable. No ball ever
// rides it, so no arrowhead. Face midpoint to face midpoint, turning halfway between them.
const JOG_Y = midX(TOP_BOTTOM, NODE_Y);                  // 228
const KUBELET_CX = midX(KUBELET_X, KUBELET_R);           // 520
const KUBELET_TO_NODE = [[KUBELET_CX, TOP_BOTTOM], [KUBELET_CX, JOG_Y], [CX, JOG_Y], [CX, NODE_Y]];

// The segments carry only strokes, so the fill of the capacity bar underneath is never doubled up.
const clearFill = (el) => { const r = el.querySelector('.scheme-box-rect'); if (r) r.style.fill = 'transparent'; };

// One carved piece: a stroke-only box over the bar plus, where the piece is too narrow to hold a
// label, its caption on one of the three tiers. The wrapper is what the steps fade in.
const segment = ({ key, boxKey, x, w, caption, tier, label = '', sublabel = '' }) => P.group({
  key,
  opacity: 0,
  parts: [
    P.box({ key: boxKey, x, y: BAR_Y, w, h: BAR_H, rx: 0, label, sublabel, tune: clearFill }),
    caption ? P.tag({ x: x + w / 2, y: TIER[tier], text: caption }) : null,
  ],
});

// The list order IS the append order, so it is the z-order: the packet layer sits under the ladder,
// and the three top-row blocks go absolute last.
export const SCENE = {
  'aria-label': 'Node Allocatable: the Kubelet carves kubeReserved, systemReserved and the hard eviction threshold out of the Node capacity, and what is left is the only number the Scheduler sums Pod requests against',
  parts: [
    P.defs(),
    P.relation({ points: KUBELET_TO_NODE }),
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    // The whole 16Gi, undivided.
    P.box({ key: 'capBar', x: BAR_X, y: BAR_Y, w: BAR_W, h: BAR_H, rx: 6 }),
    P.tag({ x: CX, y: BAR_Y - 8, text: 'capacity 16Gi' }),
    segment({ key: 'segKube',  boxKey: 'segKubeBox',  x: KUBE_X,  w: KUBE_W,  caption: 'kubeReserved 1Gi',     tier: 0 }),
    segment({ key: 'segSys',   boxKey: 'segSysBox',   x: SYS_X,   w: SYS_W,   caption: 'systemReserved 512Mi', tier: 1 }),
    segment({ key: 'segEvict', boxKey: 'segEvictBox', x: EVICT_X, w: EVICT_W, caption: 'evictionHard 512Mi',   tier: 2 }),
    segment({ key: 'segAlloc', boxKey: 'segAllocBox', x: ALLOC_X, w: ALLOC_W, label: 'Allocatable', sublabel: '14Gi' }),
    // Pod requests, drawn to scale from the Allocatable edge. Its width is set per step.
    P.box({ key: 'reqBar', x: ALLOC_X, y: REQ_Y, w: ALLOC_W, h: REQ_H, rx: 4, opacity: 0 }),
    P.wire({ key: 'req', x: REQ_LBL_X, y: REQ_Y + REQ_H / 2 + 4, anchor: 'start' }),
    // Top-row hops, both on the row centre line: every exchange on this card runs one way.
    P.arrow({ x1: KUBELET_R, y1: TOP_CY, x2: API_X, y2: TOP_CY, dim: true, dashed: true }),
    P.arrow({ x1: API_R, y1: TOP_CY, x2: SCHED_X, y2: TOP_CY, dim: true, dashed: true }),
    P.wire({ key: 'ka', x: WIRE_KA_X, y: WIRE_Y }),
    P.wire({ key: 'as', x: WIRE_AS_X, y: WIRE_Y }),
    P.chip({ key: 'capChip',     x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'status.capacity.memory',    value: 'not reported' }),
    P.chip({ key: 'allocChip',   x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'status.allocatable.memory', value: 'not computed' }),
    P.chip({ key: 'fitChip',     x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'NodeResourcesFit',          value: 'not evaluated' }),
    P.chip({ key: 'enforceChip', x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'enforceNodeAllocatable',    value: 'pods · the default' }),
    P.packets(),
    P.chain({
      key: 'chain', x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. capacity     ·  Kubelet reports 16Gi in status.capacity',
        '2. reserved     ·  kubeReserved 1Gi and systemReserved 512Mi',
        '3. eviction     ·  evictionHard memory.available 512Mi',
        '4. allocatable  ·  16Gi - 1Gi - 512Mi - 512Mi = 14Gi',
        '5. schedule     ·  sum of Pod requests must stay under 14Gi',
        '6. overcommit   ·  limits may pass 14Gi, requests may not',
      ],
    }),
    // Top-row blocks last, so a ball passes behind them rather than over their labels.
    P.box({ key: 'kubelet', x: KUBELET_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Kubelet',   sublabel: 'computes Allocatable' }),
    P.box({ key: 'api',     x: API_X,     y: TOP_Y, w: BOX_W, h: BOX_H, label: 'API',       sublabel: 'Node status block' }),
    P.box({ key: 'sched',   x: SCHED_X,   y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Scheduler', sublabel: 'NodeResourcesFit filter' }),
  ],
  reset: {
    keys: [
      'kubelet', 'api', 'sched', 'capBar',
      'segKubeBox', 'segSysBox', 'segEvictBox', 'segAllocBox', 'reqBar',
      'capChip', 'allocChip', 'fitChip', 'enforceChip',
    ],
  },
};

// The requests strip is drawn TO SCALE, so its width is the number the step states. Nothing but an
// SVG attribute carries that, and no step field writes one, which is why two steps take the escape.
function setReqWidth(s, gi) {
  const r = s.refs.reqBar.querySelector('.scheme-box-rect');
  if (r) r.setAttribute('width', gi * GI);
}

// One list for every carved piece, so a step cannot pin four of five and drift on the fifth.
const BARS = ['segKube', 'segSys', 'segEvict', 'segAlloc', 'reqBar'];
const NONE = shade(BARS, 0);
const RESERVED = { ...NONE, segKube: 1, segSys: 1 };
const EVICTED = { ...RESERVED, segEvict: 1 };
const CARVED = { ...EVICTED, segAlloc: 1 };
const REQUESTED = { ...CARVED, reqBar: 1 };

// Every step writes every chip. A chip left alone keeps the previous step's reading, and on this
// card that would let Allocatable claim a number the arithmetic has not reached yet.
const ENFORCE = 'pods · the default';
const CAP = '16Gi', ALLOC = '14Gi';
const INSUFFICIENT = '15Gi > 14Gi · Insufficient memory';
const FITS = '12Gi of 14Gi · fits';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { capChip: 'not reported', allocChip: 'not computed', fitChip: 'not evaluated', enforceChip: ENFORCE },
    opacity: NONE,
    chain: -1,
  },
  {
    id: 'capacity',
    duration: 2600,
    narration: 'Node-1 is a machine with 16Gi of RAM, and the Kubelet reports that whole number into status.capacity on the Node object. Capacity is the total the Node has, and it says nothing about who may use it. By default Pods can consume all of it, and competing with the daemons that keep the machine alive is exactly the problem the rest of this card solves.',
    chips: { capChip: CAP, allocChip: 'not computed', fitChip: 'not evaluated', enforceChip: ENFORCE },
    wires: { ka: 'PATCH status.capacity' },
    opacity: NONE,
    lit: ['kubelet', 'capBar', 'capChip'],
    chain: 0,
    // The chip holds what the API STORES, so it turns over when the report lands there.
    rewind: { chips: { capChip: 'not reported' } },
    flow: [
      F.segment({ from: [KUBELET_R, TOP_CY], to: [API_X, TOP_CY], name: 'patch', lights: ['api'] }),
      F.set({ at: 'patch', chips: { capChip: CAP } }),
    ],
  },
  {
    id: 'reserved',
    duration: 2800,
    narration: 'Two reservations come off the top, both of them Kubelet settings. The kubeReserved budget covers the Kubernetes daemons that are not Pods, meaning the Kubelet and the container runtime, and here it is 1Gi. The systemReserved budget covers the OS daemons like sshd and udev, plus the kernel itself, and here it is 512Mi. Both are always subtracted from the arithmetic, but neither becomes a real cgroup cap unless you name it in enforceNodeAllocatable.',
    chips: { capChip: CAP, allocChip: 'not computed', fitChip: 'not evaluated', enforceChip: ENFORCE },
    opacity: RESERVED,
    lit: ['kubelet', 'segKubeBox', 'segSysBox', 'enforceChip'],
    chain: 1,
    // Two budgets, so two beats: they are separate cgroups and separate settings.
    flow: [
      F.reveal({ target: 'segKube' }),
      F.reveal({ target: 'segSys', delay: REVEAL_MS }),
    ],
  },
  {
    id: 'eviction-threshold',
    duration: 2600,
    narration: 'The hard eviction threshold comes off as well. The evictionHard setting for memory.available is the margin the Kubelet keeps free so the machine is much less likely to reach a kernel out-of-memory event, 512Mi on this Node. Even with no daemons on it at all, Pods could not use more than capacity minus this threshold, so the memory behind it counts as unavailable to Pods rather than as spare room.',
    chips: { capChip: CAP, allocChip: 'not computed', fitChip: 'not evaluated', enforceChip: ENFORCE },
    opacity: EVICTED,
    lit: ['kubelet', 'segEvictBox'],
    chain: 2,
    flow: [F.reveal({ target: 'segEvict' })],
  },
  {
    id: 'allocatable',
    duration: 3000,
    narration: 'What survives is Allocatable. 16Gi minus 1Gi minus 512Mi minus 512Mi leaves 14Gi, and the Kubelet publishes that in status.allocatable beside status.capacity, which is why kubectl describe node prints the two blocks one under the other. Allocatable is the amount on this Node available to be consumed by ordinary Pods.',
    chips: { capChip: CAP, allocChip: ALLOC, fitChip: 'not evaluated', enforceChip: ENFORCE },
    wires: { ka: 'PATCH status.allocatable' },
    opacity: CARVED,
    lit: ['kubelet', 'segAllocBox', 'allocChip'],
    chain: 3,
    // The remainder is drawn first, then published: the chip is what the API holds, so it waits
    // for the PATCH to land rather than reading 14Gi while the ball is still on the wire.
    rewind: { chips: { allocChip: 'not computed' } },
    flow: [
      F.reveal({ target: 'segAlloc' }),
      F.segment({ from: [KUBELET_R, TOP_CY], to: [API_X, TOP_CY], delay: REVEAL_MS, name: 'patch', lights: ['api'] }),
      F.set({ at: 'patch', chips: { allocChip: ALLOC } }),
    ],
  },
  {
    id: 'schedule',
    duration: 3000,
    narration: 'The Scheduler reads status.allocatable, never status.capacity, and it does not over-subscribe it: the sum of Pod requests on a Node has to stay under Allocatable. So Pod cache-0 asking for 15Gi is turned away by a Node advertising 16Gi, with a FailedScheduling event naming Insufficient memory, because the number it is measured against is 14Gi.',
    chips: { capChip: CAP, allocChip: ALLOC, fitChip: INSUFFICIENT, enforceChip: ENFORCE },
    wires: { as: 'watch · status.allocatable', req: 'Pod cache-0 requests 15Gi' },
    opacity: REQUESTED,
    lit: ['api', 'segAllocBox', 'fitChip'],
    chain: 4,
    enter(s) { setReqWidth(s, 15); },
    // The verdict is the Scheduler's, so it lands when the number it judges against arrives.
    rewind: { chips: { fitChip: 'not evaluated' } },
    flow: [
      F.reveal({ target: 'reqBar' }),
      F.segment({ from: [API_R, TOP_CY], to: [SCHED_X, TOP_CY], delay: BEAT.afterHop, name: 'watch', lights: ['sched'] }),
      F.set({ at: 'watch', chips: { fitChip: INSUFFICIENT } }),
    ],
  },
  {
    id: 'overcommit',
    duration: 2800,
    narration: 'Only requests are summed. Limits may add up far past Allocatable, which is what kubectl describe node means when it warns that total limits may be over 100 percent. Three Pods requesting 4Gi each fit inside 14Gi while their 8Gi limits total 24Gi. By default the Kubelet enforces Allocatable across Pods alone, and it enforces it by evicting once their real usage passes it.',
    chips: { capChip: CAP, allocChip: ALLOC, fitChip: FITS, enforceChip: ENFORCE },
    // The strip draws REQUESTS, so its label names requests only. The 24Gi of limits is the one
    // number on this step that is deliberately not drawn, because nothing on the bar measures it.
    wires: { req: '3 Pods · requests 12Gi of 14Gi' },
    opacity: REQUESTED,
    lit: ['sched', 'segAllocBox', 'fitChip', 'enforceChip'],
    chain: 5,
    enter(s) { setReqWidth(s, 12); },
    // A different set of Pods on the same Node, so the strip is redrawn rather than resized.
    flow: [F.reveal({ target: 'reqBar' })],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
