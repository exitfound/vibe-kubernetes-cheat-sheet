import { P, F, defineCard, ladder, midX, strip, shade, CLU, BEAT, OPACITY, REVEAL_MS } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-node-allocatable.md

const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;
const CX = midX(CONTENT_L, CONTENT_R);

// The ladder holds the band under the Kubelet, so the Scheduler drops beneath the API.
const BOX_W = CLU.BOX_W, BOX_H = CLU.BOX_H;
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;
const KUBELET_X = CX - BOX_W / 2, KUBELET_R = KUBELET_X + BOX_W;
const API_R = CONTENT_R, API_X = API_R - BOX_W;          // flush with the Node right edge
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);
const WIRE_Y = TOP_Y - 14;
const WIRE_KA_X = midX(KUBELET_R, API_X);

// Trimmed to its longest row and set down clear of the panel, so neither kit column fits it.
const LADDER_X = 410, LADDER_W = 400, LADDER_R = LADDER_X + LADDER_W;
const LADDER_Y = 140, ROW_H = CLU.ROW_H, ROW_GAP = CLU.ROW_GAP;
const LADDER_BOTTOM = LADDER_Y + 6 * ROW_H + 5 * ROW_GAP;

// Its wire label goes below: the corridor beside the drop belongs to the residency line.
const SCHED_X = API_X, SCHED_CX = midX(SCHED_X, API_R);
const SCHED_Y = 221, SCHED_BOTTOM = SCHED_Y + BOX_H;
const WIRE_AS_Y = SCHED_BOTTOM + 20;

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;
const NODE_Y = 394, NODE_H = 140;

// One Gi of memory in viewBox units. Every width on the bar is a multiple of it, so the drawing
// and the arithmetic cannot disagree.
const GI = 56;
const BAR_W = 16 * GI, BAR_X = CX - BAR_W / 2;
const BAR_Y = NODE_Y + 34, BAR_H = 64;                   // clears the Node label
const KUBE_X = BAR_X, KUBE_W = GI;                       // 1Gi
const SYS_X = KUBE_X + KUBE_W, SYS_W = GI / 2;           // 512Mi
const EVICT_X = SYS_X + SYS_W, EVICT_W = GI / 2;         // 512Mi
const ALLOC_X = EVICT_X + EVICT_W, ALLOC_W = 14 * GI;    // 14Gi

// Starts where Allocatable starts, so a 15Gi request overhangs the bar by exactly one Gi.
const REQ_Y = BAR_Y + BAR_H + 8, REQ_H = 22;
const REQ_LBL_X = ALLOC_X + 10;

const CHIP_H = CLU.CHIP_H, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = NODE_Y + NODE_H + 14;
const COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
const CHIP_W = COL.w;
const CHIP_X = i => COL.x(i % CHIP_COLS);
const CHIP_Y = i => ROW(Math.floor(i / CHIP_COLS));

// Residency, not traffic: no ball rides it, so no arrowhead.
const KUBELET_TO_NODE = [[CX, TOP_BOTTOM], [CX, NODE_Y]];

// The segments carry only strokes, so the fill of the capacity bar underneath is never doubled up.
const clearFill = (el) => { const r = el.querySelector('.scheme-box-rect'); if (r) r.style.fill = 'transparent'; };

// Solid row fill, so the residency line behind the ladder does not show through the glyphs.
const ROW_FILL = '#1a1838';
const solidRows = (el) => el.querySelectorAll('.scheme-chip-rect').forEach((r) => { r.style.fill = ROW_FILL; });

// One carved piece: a stroke-only box over the bar, hidden until its step reveals it.
const segment = ({ key, x, w, label = '', sublabel = '' }) =>
  P.box({ key, x, y: BAR_Y, w, h: BAR_H, rx: 0, opacity: 0, label, sublabel, tune: clearFill });

// The list order is the z-order: the three blocks go last.
export const SCENE = {
  'aria-label': 'Node Allocatable: the Kubelet carves kubeReserved, systemReserved and the hard eviction threshold out of the Node capacity, and what is left is the only number the Scheduler sums Pod requests against',
  parts: [
    P.defs(),
    P.relation({ points: KUBELET_TO_NODE }),
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    // The whole 16Gi, undivided.
    P.box({ key: 'capBar', x: BAR_X, y: BAR_Y, w: BAR_W, h: BAR_H, rx: 6 }),
    P.tag({ x: CX, y: BAR_Y - 8, text: 'capacity 16Gi' }),
    segment({ key: 'segKubeBox',  x: KUBE_X,  w: KUBE_W }),
    segment({ key: 'segSysBox',   x: SYS_X,   w: SYS_W }),
    segment({ key: 'segEvictBox', x: EVICT_X, w: EVICT_W }),
    segment({ key: 'segAllocBox', x: ALLOC_X, w: ALLOC_W, label: 'Allocatable', sublabel: '14Gi' }),
    // Pod requests, to scale from the Allocatable edge, width set per step.
    P.box({ key: 'reqBar', x: ALLOC_X, y: REQ_Y, w: ALLOC_W, h: REQ_H, rx: 4, opacity: 0 }),
    P.wire({ key: 'req', x: REQ_LBL_X, y: REQ_Y + REQ_H / 2 + 4, anchor: 'start' }),
    P.arrow({ x1: KUBELET_R, y1: TOP_CY, x2: API_X, y2: TOP_CY, dim: true, dashed: true }),
    P.arrow({ x1: SCHED_CX, y1: TOP_BOTTOM, x2: SCHED_CX, y2: SCHED_Y, dim: true, dashed: true }),
    P.wire({ key: 'ka', x: WIRE_KA_X, y: WIRE_Y }),
    P.wire({ key: 'as', x: SCHED_CX, y: WIRE_AS_Y }),
    P.chip({ key: 'capChip',     x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'status.capacity.memory',    value: 'not reported' }),
    P.chip({ key: 'allocChip',   x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'status.allocatable.memory', value: 'not computed' }),
    P.chip({ key: 'fitChip',     x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'NodeResourcesFit',          value: 'not evaluated' }),
    P.chip({ key: 'enforceChip', x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'enforceNodeAllocatable',    value: 'pods · the default' }),
    P.packets(),
    P.chain({
      key: 'chain', x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP, tune: solidRows,
      items: [
        '1. capacity     ·  Kubelet reports 16Gi in status.capacity',
        '2. reserved     ·  kubeReserved 1Gi and systemReserved 512Mi',
        '3. eviction     ·  evictionHard memory.available 512Mi',
        '4. allocatable  ·  16Gi - 1Gi - 512Mi - 512Mi = 14Gi',
        '5. schedule     ·  sum of Pod requests may not pass 14Gi',
        '6. overcommit   ·  limits may pass 14Gi, requests may not',
      ],
    }),
    P.box({ key: 'kubelet', x: KUBELET_X, y: TOP_Y,   w: BOX_W, h: BOX_H, label: 'Kubelet',   sublabel: 'computes Allocatable' }),
    P.box({ key: 'api',     x: API_X,     y: TOP_Y,   w: BOX_W, h: BOX_H, label: 'API',       sublabel: 'Node status block' }),
    P.box({ key: 'sched',   x: SCHED_X,   y: SCHED_Y, w: BOX_W, h: BOX_H, label: 'Scheduler', sublabel: 'NodeResourcesFit filter' }),
  ],
  reset: {
    keys: [
      'kubelet', 'api', 'sched', 'capBar',
      'segKubeBox', 'segSysBox', 'segEvictBox', 'segAllocBox', 'reqBar',
      'capChip', 'allocChip', 'fitChip', 'enforceChip',
    ],
  },
};

// The requests strip is drawn to scale, and no step field writes an SVG width, hence the escape.
function setReqWidth(s, gi) {
  const r = s.refs.reqBar.querySelector('.scheme-box-rect');
  if (r) r.setAttribute('width', gi * GI);
}

const BARS = ['segKubeBox', 'segSysBox', 'segEvictBox', 'segAllocBox', 'reqBar'];
const NONE = shade(BARS, 0);
const RESERVED = { ...NONE, segKubeBox: 1, segSysBox: 1 };
const EVICTED = { ...RESERVED, segEvictBox: 1 };
const CARVED = { ...EVICTED, segAllocBox: 1 };
const REQUESTED = { ...CARVED, reqBar: 1 };

// Every step writes every chip, so Allocatable never shows a number the arithmetic has not reached.
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
    duration: 3700,
    narration: 'Node-1 is a machine with 16Gi of RAM, and the Kubelet reports that whole number into status.capacity on the Node object. Capacity is the total the Node has, and it says nothing about who may use it. With nothing reserved beyond the Kubelet default eviction margin, 100Mi on a Linux Node, Pods can take nearly all of it, and competing with the daemons that keep the machine alive is exactly the problem the rest of this card solves.',
    chips: { capChip: CAP, allocChip: 'not computed', fitChip: 'not evaluated', enforceChip: ENFORCE },
    wires: { ka: 'PATCH status.capacity' },
    opacity: NONE,
    lit: ['kubelet', 'capBar', 'capChip'],
    chain: 0,
    // The chip holds what the API stores, so it turns over when the report lands.
    rewind: { chips: { capChip: 'not reported' } },
    flow: [
      F.segment({ from: [KUBELET_R, TOP_CY], to: [API_X, TOP_CY], delay: BEAT.lead, name: 'patch', lights: ['api'] }),
      F.set({ at: 'patch', chips: { capChip: CAP } }),
    ],
  },
  {
    id: 'reserved',
    duration: 4300,
    narration: 'Two reservations come off the top, both Kubelet settings. The kubeReserved budget covers the Kubernetes daemons that are not Pods, meaning the Kubelet and the container runtime, and here it is 1Gi. The systemReserved budget covers the OS daemons like sshd and udev, and should cover kernel memory too, which is not accounted to Pods, and here it is 512Mi. Both always come off Capacity, but neither becomes a real cgroup cap until you name it in enforceNodeAllocatable and set its reserved cgroup.',
    chips: { capChip: CAP, allocChip: 'not computed', fitChip: 'not evaluated', enforceChip: ENFORCE },
    opacity: RESERVED,
    lit: ['kubelet', 'segKubeBox', 'segSysBox', 'enforceChip'],
    chain: 1,
    // Two budgets, two beats, both after BEAT.lead (M-19a).
    flow: [
      F.reveal({ target: 'segKubeBox', delay: BEAT.lead }),
      F.reveal({ target: 'segSysBox', delay: BEAT.lead + REVEAL_MS }),
    ],
  },
  {
    id: 'eviction-threshold',
    duration: 3500,
    narration: 'The hard eviction threshold comes off as well. The evictionHard setting for memory.available is the margin the Kubelet keeps free so the machine is much less likely to reach a kernel out-of-memory event, 512Mi on this Node. Even with no daemons on it at all, Pods could not use more than capacity minus this threshold, so the memory behind it counts as unavailable to Pods rather than as spare room.',
    chips: { capChip: CAP, allocChip: 'not computed', fitChip: 'not evaluated', enforceChip: ENFORCE },
    opacity: EVICTED,
    lit: ['kubelet', 'segEvictBox'],
    chain: 2,
    flow: [F.reveal({ target: 'segEvictBox', delay: BEAT.lead })],
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
    // Drawn first, then published: the chip waits for the PATCH to land.
    rewind: { chips: { allocChip: 'not computed' } },
    flow: [
      F.reveal({ target: 'segAllocBox' }),
      F.segment({ from: [KUBELET_R, TOP_CY], to: [API_X, TOP_CY], delay: REVEAL_MS, name: 'patch', lights: ['api'] }),
      F.set({ at: 'patch', chips: { allocChip: ALLOC } }),
    ],
  },
  {
    id: 'schedule',
    duration: 3000,
    narration: 'The Scheduler reads status.allocatable, never status.capacity, and it does not over-subscribe it: the sum of Pod requests on a Node may not pass Allocatable. So Pod cache-0 asking for 15Gi is turned away by a Node advertising 16Gi, with a FailedScheduling event naming Insufficient memory, because the number it is measured against is 14Gi.',
    chips: { capChip: CAP, allocChip: ALLOC, fitChip: INSUFFICIENT, enforceChip: ENFORCE },
    wires: { as: 'watch · status.allocatable', req: 'Pod cache-0 requests 15Gi' },
    opacity: REQUESTED,
    lit: ['api', 'segAllocBox', 'fitChip'],
    chain: 4,
    enter(s) { setReqWidth(s, 15); },
    rewind: { chips: { fitChip: 'not evaluated' } },
    flow: [
      // From pending, not 0, or the caption stands over blank canvas.
      F.reveal({ target: 'reqBar', from: OPACITY.pending }),
      F.segment({ from: [SCHED_CX, TOP_BOTTOM], to: [SCHED_CX, SCHED_Y], delay: BEAT.afterHop, name: 'watch', lights: ['sched'] }),
      F.set({ at: 'watch', chips: { fitChip: INSUFFICIENT } }),
    ],
  },
  {
    id: 'overcommit',
    duration: 3750,
    narration: 'Only requests are summed. Limits may add up far past Allocatable, which is what kubectl describe node means when it warns that total limits may be over 100 percent. Three Pods requesting 4Gi each fit inside 14Gi while their 8Gi limits total 24Gi. By default the Kubelet enforces Allocatable across Pods alone, and it enforces it by evicting once their real usage passes it.',
    chips: { capChip: CAP, allocChip: ALLOC, fitChip: FITS, enforceChip: ENFORCE },
    // The strip draws requests only: the 24Gi of limits is deliberately not drawn.
    wires: { req: '3 Pods · requests 12Gi of 14Gi' },
    opacity: REQUESTED,
    lit: ['sched', 'kubelet', 'segAllocBox', 'fitChip', 'enforceChip'],
    chain: 5,
    enter(s) { setReqWidth(s, 12); },
    // A different set of Pods, so the strip is redrawn rather than resized.
    flow: [F.reveal({ target: 'reqBar', from: OPACITY.pending })],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
