import { P, F, defineCard, ladder, strip, spread, midX, shade, CLU, BEAT, FADE, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-taints-tolerations.md

// Layout C with no ladder: chips in a three-across bottom strip, the evictor in the mid band.
// The evictor top at 252 caps narration at 313 characters.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;
const CX = midX(CONTENT_L, CONTENT_R);

const BOX_W = CLU.BOX_W, BOX_H = CLU.BOX_H;
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;
const API_X = CX - BOX_W / 2, API_R = API_X + BOX_W;
// Right-aligned to the content edge, in line with the chip strip and the Node frame.
const SCHED_X = CONTENT_R - BOX_W;
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);
const WIRE_X = midX(API_R, SCHED_X);
const WIRE_Y = TOP_Y - 14;                               // above the row: the drop owns the band below

// 420 is the leftmost x a riser out of the mid band may take (L-03). The block is centred on it so
// its riser leaves the top face midpoint.
const EV_CX = 420;
const EV_X = EV_CX - BOX_W / 2;
const EV_Y = 252, EV_BOTTOM = EV_Y + BOX_H;

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;
const NODE_Y = 372, NODE_H = CLU.NODE.H;
const POD_W = 300, POD_H = CLU.NODE.POD_H, POD_Y = NODE_Y + CLU.NODE.POD_DY;
const POD_PAD = 24;
// Fixed width, derived gap.
const POD_X = spread({ from: NODE_X + POD_PAD, to: CONTENT_R - POD_PAD, count: 3, w: POD_W }).x;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };

// The drop leaves the API bottom midpoint and lands on the Node frame top midpoint.
const DROP_X = CX;
// ONE right angle: up the evictor spine at 420, the only x that clears the panel, then into the
// API left face on the top lane midline.
const EVICT_REQ = [[EV_CX, EV_Y], [EV_CX, TOP_CY], [API_X, TOP_CY]];
// ONE lane into the Node band, addressed to the frame rather than to a Pod inside it: a single
// vertical drop, and which Pod it is about comes from the pulse.
const NODE_LANE = [[DROP_X, TOP_BOTTOM], [DROP_X, NODE_Y]];

// THREE per row: two across leaves the six chips on three rows and no room under the frame.
const CHIP_H = CLU.CHIP_H, CHIP_GAP = 14, CHIP_VGAP = 8, CHIP_COLS = 3;
const CHIPS_Y = NODE_Y + NODE_H + 16;
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// The strip is read as a GRID: the index wraps across the three columns and steps down every third.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

// Under the evictor: the riser band beside it belongs to the drop at 600.
const EV_WIRE_X = EV_CX;
const EV_WIRE_Y = EV_BOTTOM + 24;
// Right of the drop it names, glyph box centred on the open band between the two it runs between.
const DROP_WIRE_X = DROP_X + 14;
const DROP_WIRE_Y = 250;
// The taint reads as the frame HEADER, just past the NODE-1 label.
const TAINT_X = NODE_X + 80, TAINT_Y = NODE_Y + 21;

// Only db-1 carries a toleration, and its inner sublabel is the contract the card turns on.
const PODS = [
  { key: 'podDb',   label: 'Pod db-1',  sub: 'tolerates dedicated', slot: 0 },
  { key: 'podWeb1', label: 'Pod web-1', sub: 'no toleration',       slot: 1 },
  { key: 'podWeb2', label: 'Pod web-2', sub: 'no toleration',       slot: 2, opacity: 0 },
];

// Append order is z-order: top lane, wires, chips, lanes, packet layer, Node and Pods, blocks last.
export const SCENE = {
  'aria-label': 'Taints and tolerations: a taint on Node-1 and the tolerations on the Pods it holds, the Scheduler filtering a Pod that tolerates nothing out of the placement decision under NoSchedule and merely scoring it down under PreferNoSchedule, and the taint-eviction-controller deleting the Pods that carry no matching toleration once a NoExecute taint is added, while the Pod that tolerates the key stays bound',
  parts: [
    P.defs(),
    // ONE top lane: every step sends the Scheduler to the API and none names an answer.
    P.arrow({ x1: SCHED_X, y1: TOP_CY, x2: API_R, y2: TOP_CY, dim: true, dashed: true }),
    // One register per lane (T-22), plus the frame header, which is state rather than traffic.
    P.wire({ key: 'req', x: WIRE_X, y: WIRE_Y }),
    P.wire({ key: 'evict', x: EV_WIRE_X, y: EV_WIRE_Y }),
    P.wire({ key: 'drop', x: DROP_WIRE_X, y: DROP_WIRE_Y, anchor: 'start' }),
    P.wire({ key: 'taint', x: TAINT_X, y: TAINT_Y, anchor: 'start' }),
    // Row 1 is what the taint and the toleration ARE, row 2 is what they DO.
    P.chip({ key: 'taintsChip',  x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'Node-1 taints',     value: 'none' }),
    P.chip({ key: 'tolerChip',   x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'db-1 tolerates',    value: 'none' }),
    P.chip({ key: 'opChip',      x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'operator',          value: 'none' }),
    P.chip({ key: 'effectChip',  x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'effect in force',   value: 'none' }),
    P.chip({ key: 'web2Chip',    x: CHIP_X(4), y: CHIP_Y(4), w: CHIP_W, h: CHIP_H, name: 'Pod web-2',         value: 'none' }),
    P.chip({ key: 'secondsChip', x: CHIP_X(5), y: CHIP_Y(5), w: CHIP_W, h: CHIP_H, name: 'tolerationSeconds', value: 'none' }),
    P.lane({ points: EVICT_REQ, dim: true, dashed: true }),
    P.lane({ points: NODE_LANE, dim: true, dashed: true }),
    P.packets(),
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    // Bare `g` wrappers: the id tells one Pod from the next and is what fades and pins address.
    ...PODS.map(d => P.pod({
      key: d.key, id: d.key, innerKey: `${d.key}Box`, opacity: d.opacity,
      x: POD_X(d.slot), y: POD_Y, w: POD_W, h: POD_H, label: d.label, sublabel: '', containers: 0,
      inner: { ...POD_INNER, label: 'app', sublabel: d.sub },
    })),
    // Blocks that must sit above packets, ABSOLUTE LAST.
    P.box({ key: 'evictor', x: EV_X, y: EV_Y, w: BOX_W, h: BOX_H, label: 'Taint-eviction controller', sublabel: 'deletes Pods on NoExecute' }),
    P.box({ key: 'api', x: API_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'API', sublabel: 'spec.taints + spec.tolerations' }),
    P.box({ key: 'sched', x: SCHED_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Scheduler', sublabel: 'TaintToleration filter + score' }),
  ],
  // All three Pods go to clearHighlights: two of them pulse and the pulse has to come back off.
  reset: {
    keys: ['api', 'sched', 'evictor', 'nodeEl', 'taintsChip', 'tolerChip', 'opChip', 'effectChip', 'web2Chip', 'secondsChip', 'podDbBox', 'podWeb1Box', 'podWeb2Box'],
    pods: ['podDb', 'podWeb1', 'podWeb2'],
  },
};

const NS = 'NoSchedule', PNS = 'PreferNoSchedule', BOTH = 'PreferNoSchedule, NoExecute';
// The header carries the whole taint, the chip above carries only what changes.
const HDR_NS = 'dedicated=db · NoSchedule';
const HDR_PNS = 'dedicated=db · PreferNoSchedule';
const HDR_BOTH = 'dedicated=db · PreferNoSchedule + NoExecute';
// The three chips that settle on step 2, restated on every step rather than inherited (P-01).
const CONTRACT = { tolerChip: 'dedicated · any effect', opChip: 'defaults to Equal, or Exists', secondsChip: 'unset · stays bound' };
const DYING = OPACITY.terminating, GONE = OPACITY.terminated;
// Every step writes all three Pod shades. web-2 is not on the Node until it binds.
const STANDING = { ...shade(['podDb', 'podWeb1'], 1), podWeb2: 0 };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { taintsChip: 'none', tolerChip: 'none', opChip: 'none', effectChip: 'none', web2Chip: 'none', secondsChip: 'none' },
    opacity: STANDING,
  },
  {
    id: 'taint',
    duration: 2600,
    narration: 'A taint is three fields on the Node object: a key, an optional value, and an effect. Node-1 takes dedicated=db:NoSchedule into spec.taints. Nothing on the Node stirs, because NoSchedule is a gate on the way in and says nothing about the Pods already bound here.',
    chips: { taintsChip: NS, tolerChip: 'none', opChip: 'none', effectChip: NS, web2Chip: 'none', secondsChip: 'none' },
    wires: { drop: 'PATCH .../nodes/node-1 · spec.taints', taint: HDR_NS },
    // S-13: the taint does not exist until the PATCH lands, so the chips and the header rewind.
    rewind: { chips: { taintsChip: 'none', effectChip: 'none' }, wires: { taint: ' ' } },
    opacity: STANDING,
    lit: ['api', 'taintsChip', 'effectChip'],
    // NO Pod pulses, which is the assertion: NoSchedule never reaches an already bound Pod.
    // The write self-initiates on the API, so the ball waits BEAT.lead.
    flow: [
      F.route({ points: NODE_LANE, delay: BEAT.lead, name: 'patch', lights: ['nodeEl'] }),
      F.set({ at: 'patch', chips: { taintsChip: NS, effectChip: NS }, wires: { taint: HDR_NS } }),
    ],
  },
  {
    id: 'match',
    duration: 2400,
    narration: 'A toleration is the matching field on the Pod. It matches when the keys are equal and the effects are equal, and the operator decides the value: Equal compares it, Exists ignores it. The toleration on Pod db-1 leaves the effect empty, which matches every effect on that key. Pod web-1 has none.',
    chips: { taintsChip: NS, ...CONTRACT, effectChip: NS, web2Chip: 'unscheduled' },
    wires: { taint: HDR_NS },
    opacity: STANDING,
    // Packet-less and Pod-less: the changed chips carry the beat as static highlights (M-27).
    lit: ['tolerChip', 'opChip', 'web2Chip', 'secondsChip'],
  },
  {
    id: 'noschedule',
    duration: 2600,
    narration: 'Pod web-2 carries no toleration, so the TaintToleration filter plugin drops Node-1 before scoring and the Pod is recorded Unschedulable with a FailedScheduling event. Nothing reaches the Node, and Pod web-1 keeps running untouched, because it was bound before the taint arrived.',
    chips: { taintsChip: NS, ...CONTRACT, effectChip: 'NoSchedule · gates entry', web2Chip: 'Pending · FailedScheduling' },
    wires: { req: 'filter TaintToleration · NoFit · Event FailedScheduling', taint: HDR_NS },
    // Both values are the OUTCOME of the cycle, so neither may stand before the Event lands.
    rewind: { chips: { effectChip: NS, web2Chip: 'unscheduled' } },
    opacity: STANDING,
    lit: ['sched', 'effectChip', 'web2Chip'],
    // NOTHING rides the drop: the verdict is an Event on the API and no write reaches the Node.
    flow: [
      F.top({ from: SCHED_X, to: API_R, y: TOP_CY, delay: BEAT.lead, name: 'nofit', lights: ['api'] }),
      F.set({ at: 'nofit', chips: { effectChip: 'NoSchedule · gates entry', web2Chip: 'Pending · FailedScheduling' } }),
    ],
  },
  {
    id: 'prefer',
    duration: 2800,
    narration: 'The taint is rewritten with PreferNoSchedule. The same mismatch is now scored rather than filtered: the plugin marks Node-1 down among the Nodes that fit but does not remove it, so Pod web-2 can still land here. The control plane tries to avoid that and does not guarantee it.',
    chips: { taintsChip: PNS, ...CONTRACT, effectChip: 'PreferNoSchedule · scores', web2Chip: 'bound to Node-1' },
    wires: { req: 'POST .../pods/web-2/binding', drop: 'bound · Node-1 scored down', taint: HDR_PNS },
    // The rewrite stands at entry. Where web-2 ends up turns over when the binding lands.
    rewind: { chips: { web2Chip: 'Pending · FailedScheduling' } },
    // Pin final state inline so cancel between steps does not flash to default.
    opacity: { ...STANDING, podWeb2: 1 },
    // The rewrite is the premise, so both taint chips are cued at entry (P-06, P-04).
    lit: ['sched', 'taintsChip', 'effectChip', 'web2Chip'],
    // M-16, down-arrow: Pod web-2 materialises and pulses as the binding lands.
    flow: [
      F.top({ from: SCHED_X, to: API_R, y: TOP_CY, name: 'bind', lights: ['api'] }),
      F.route({ points: NODE_LANE, after: 'bind', name: 'place' }),
      F.set({ at: 'place', chips: { web2Chip: 'bound to Node-1' } }),
      F.pulse({ pod: 'podWeb2', at: 'place' }),
      F.fade({ target: 'podWeb2', from: 0, to: 1, dur: FADE.in, at: 'place', easing: 'ease-out' }),
    ],
  },
  {
    id: 'noexecute',
    duration: 2800,
    narration: 'A second taint, dedicated=db:NoExecute, is added. This effect is the only one that reaches Pods already running: the taint-eviction-controller deletes Pod web-1 and Pod web-2, since neither tolerates it. Pod db-1 does, and with no tolerationSeconds set this taint never evicts it.',
    chips: { taintsChip: BOTH, ...CONTRACT, effectChip: 'NoExecute · evicts', web2Chip: 'Terminating · evicted' },
    wires: { evict: 'DELETE Pods with no matching toleration', drop: 'evicted · web-1 and web-2', taint: HDR_BOTH },
    rewind: { chips: { web2Chip: 'bound to Node-1' } },
    // Pin final state. db-1 does NOT sink, which is the whole sentence.
    opacity: { ...STANDING, podWeb1: DYING, podWeb2: DYING },
    // The second taint sends the first ball, so its chips are cued at entry (P-06).
    lit: ['evictor', 'taintsChip', 'effectChip', 'web2Chip'],
    // M-08: both Pods pulse and fade on the same arrival. Pod db-1 takes neither, its toleration matches.
    flow: [
      F.route({ points: EVICT_REQ, name: 'del', lights: ['api'] }),
      F.route({ points: NODE_LANE, after: 'del', name: 'evict' }),
      F.set({ at: 'evict', chips: { web2Chip: 'Terminating · evicted' } }),
      F.pulse({ pod: 'podWeb1', at: 'evict' }),
      F.pulse({ pod: 'podWeb2', at: 'evict' }),
      F.fade({ target: 'podWeb1', to: DYING, dur: FADE.out, at: 'evict' }),
      F.fade({ target: 'podWeb2', to: DYING, dur: FADE.out, at: 'evict' }),
    ],
  },
  {
    id: 'seconds',
    duration: 2400,
    narration: 'A NoExecute toleration may carry tolerationSeconds, which holds the Pod that many seconds after the taint lands and then lets the eviction through. Any Pod that sets none of its own is given 300 for the built-in not-ready and unreachable taints, which is the few minutes on the Node Failure and Pod Recovery card.',
    chips: { taintsChip: BOTH, ...CONTRACT, effectChip: 'NoExecute · evicts', web2Chip: 'gone', secondsChip: '300 on built-in taints' },
    wires: { taint: HDR_BOTH },
    // The evicted Pods finished terminating during the step before, so they hold the terminated shade.
    opacity: { ...STANDING, podWeb1: GONE, podWeb2: GONE },
    // Packet-less and Pod-less again (M-27): the blocks that store and enforce the field are drawn.
    lit: ['api', 'evictor', 'secondsChip', 'web2Chip'],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
