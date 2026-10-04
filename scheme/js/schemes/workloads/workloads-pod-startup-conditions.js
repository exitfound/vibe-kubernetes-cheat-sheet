import { P, F, defineCard, ladder, laneY, midX, routeDur, WL, FADE, BEAT, OPACITY } from './workloads-kit.js';
import { chip } from '../../lib/primitives.js';
import { g, rect, text } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/workloads-pod-startup-conditions.md

// An instrument, not the A / B / C column preset: the argument is in the record.

// Both actor boxes take the 232 that cluster-node-restart draws its Kubelet and Container runtime
// at, which is CLU.BOX_W and the width 14 cluster cards share. Workloads declares no box width of
// its own, so it is a literal here rather than an import past the kit (S-21). The arrangement is
// that card's too: the left box centred on CX, which WL.L-07 needs for the spine, and the right box
// right-aligned on WL.R, where the chip column beneath it also ends. extents.mjs at 1100x800 reads
// `decides four of the five` at 147.2 and `status.conditions` at 104.3, so 232 leaves 42.4 and 63.9.
const TOP1_W = 232, TOP1_X = WL.CX - TOP1_W / 2;         // 484..716, centred on CX for the spine
const TOP2_W = 232, TOP2_X = WL.R - TOP2_W;              // 908..1140, right edge on the chip column
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);

// Band 1: the two API readings, in the RIGHT column only. L-03 leaves the full height free right
// of 420, and the corridor owns 540..660, so this band can only be the one column.
const CHIP_X = WL.COL_R.x, CHIP_W = WL.COL_R.w;          // 660..1140
const CHIP_GAP = 8;
const CHIPS_TOP = 160;                                   // centred in the 120..276 band: 160..236
const CHIP_Y = ladder({ y: CHIPS_TOP, rowH: WL.CHIP_H, gap: CHIP_GAP });

// Band 2: the Node carrying the Pod. It sits ABOVE the instrument so the corridor reaches it
// without crossing the staircase (L-10), and it is 600 wide rather than the WL.L-02 full width.
const NODE_Y = 270, NODE_H = 158;                        // 270..428, 15.3 under the deepest panel
const NODE_W = 600, NODE_X = WL.CX - NODE_W / 2;         // 300..900, top midpoint on SPINE_X
const POD_W = 460, POD_H = 108, POD_X = WL.CX - POD_W / 2;
const POD_Y = NODE_Y + 32;                               // 302..410
// pod() fixes its label baseline at 16 and its sublabel at h - 8, so the inner box is what buys
// the air between them: 10.3 over the label ink and 10.2 under it to the sublabel ink.
const CONT_W = 300, CONT_H = 48, CONT_X = WL.CX - CONT_W / 2;
const CONT_Y = POD_Y + 30;                               // 332..380

// Band 3: the staircase. Five equal treads across the full 1080, touching at their vertical
// edges and each RISING half its own height, so the profile is a stair rather than a list.
const TREAD_W = WL.W / 5, TREAD_H = 44, RISE = TREAD_H / 2;    // 216 wide
const STAIR_TOP = 440;                                   // tread 4, the top of the climb
const TREAD_X = (i) => WL.L + i * TREAD_W;               // 60 / 276 / 492 / 708 / 924
const TREAD_Y = (i) => STAIR_TOP + (4 - i) * RISE;       // 528 / 506 / 484 / 462 / 440
// box() measured its optical centres over every height from 38.75 to 81.38, so a two-line cell
// takes those two baselines rather than a second guess at the same problem.
const LINE1_Y = TREAD_H / 2 - 3.22, LINE2_Y = TREAD_H / 2 + 12.78;

// Band 4: the phase rail. One bar under the whole staircase, split ONCE, and the split sits on the
// left edge of tread 3 because that is the tread whose container start moves status.phase.
const RAIL_Y = 592, RAIL_H = 34;                         // 592..626, under the 630 floor ceiling
const RAIL_SPLIT = TREAD_X(3);                           // 708
const RAIL_PAD = 12;

// One corridor between the actor row and the Node, drawn down and up, on the frame top midpoint.
const SPINE = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, NODE_Y]];
const SPINE_UP = [...SPINE].reverse();

// The five conditions in the order the API page lists them. The second line is who writes one
// and what makes it flip, and tread 4 carries a conjunction because Ready is one.
const RUNGS = [
  { name: 'PodScheduled', sub: 'kube-scheduler · nodeName set' },
  { name: 'PodReadyToStartContainers', sub: 'kubelet · sandbox and network' },
  { name: 'Initialized', sub: 'kubelet · init exited 0' },
  { name: 'ContainersReady', sub: 'kubelet · every container ready' },
  { name: 'Ready', sub: 'kubelet · AND readinessGates' },
];
const RUNG_KEYS = RUNGS.map((_, i) => 'rung' + i);

// A tread is a two-line cell no part kind builds. It is a `.scheme-chip` so `lit` and the
// highlight CSS reach it, and P.raw bypasses the kit binding, so the role is written by hand.
const tread = ({ name, sub }, i) => P.raw({
  key: RUNG_KEYS[i],
  make: () => {
    const cell = g({ class: 'scheme-chip', 'data-role': 'cluster', transform: `translate(${TREAD_X(i)},${TREAD_Y(i)})` });
    cell.appendChild(rect({ class: 'scheme-chip-rect', x: 0, y: 0, width: TREAD_W, height: TREAD_H, rx: 4 }));
    cell.appendChild(text({ class: 'scheme-chip-text', x: TREAD_W / 2, y: LINE1_Y, 'text-anchor': 'middle' }, [name]));
    cell.appendChild(text({ class: 'scheme-box-sublabel', x: TREAD_W / 2, y: LINE2_Y, 'text-anchor': 'middle' }, [sub]));
    return cell;
  },
});

// A rail segment is a label-only chip(), which is the same escape the backoff ladder takes.
const railSeg = (key, x, w, lbl) => P.raw({
  key,
  make: () => chip({ x, y: RAIL_Y, w, h: RAIL_H, label: lbl, role: 'cluster' }),
});

// The list order IS the append order, so it is the z-order: lanes and the wire label first, then
// the packet layer, and instrument / Node / Pod / actors above the ball.
export const SCENE = {
  'aria-label': 'Pod startup conditions: PodScheduled, PodReadyToStartContainers, Initialized, ContainersReady and Ready flip roughly in that order, the Kubelet deciding four of the five and writing them to the API, while status.phase moves once',
  parts: [
    P.defs(),
    // One corridor drawn twice, down for a Kubelet action and up for the Pod reporting back.
    // Exactly one is visible per step, which is what the corridor() pair in every step says.
    P.lane({ key: 'connectorDown', points: SPINE, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'connectorUp', points: SPINE_UP, dim: true, dashed: true, role: 'cluster', opacity: 0 }),
    // Both top lanes carry a ball: the watch delivers the bound Pod, the PATCH carries a condition.
    P.arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    // The two readings the staircase and the rail do NOT carry, under the API box that owns them.
    P.chip({ key: 'timeChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'lastTransitionTime', value: 'none yet' }),
    P.chip({ key: 'epChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'Service endpoints', value: 'empty' }),
    P.packets(),
    // Appended AFTER the packet layer, so the ball runs under the frame and the actors.
    ...RUNGS.map(tread),
    railSeg('railPending', WL.L, RAIL_SPLIT - WL.L, 'Pending'),
    railSeg('railRunning', RAIL_SPLIT, WL.R - RAIL_SPLIT, 'Running'),
    P.tag({ key: 'phaseTag', x: WL.L + RAIL_PAD, y: RAIL_Y + RAIL_H / 2 + 4, text: 'status.phase', anchor: 'start' }),
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.pod({
      key: 'podGroup', id: 'podGroup',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'bound, nothing running', containers: 0,
      inner: { dx: CONT_X - POD_X, dy: CONT_Y - POD_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'container' },
    }),
    P.box({ key: 'kubelet', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'decides four of the five', role: 'cluster' }),
    P.box({ key: 'apiEl', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'status.conditions', role: 'cluster' }),
  ],
  reset: {
    keys: ['kubelet', 'apiEl', 'timeChip', 'epChip', ...RUNG_KEYS, 'railPending', 'railRunning'],
    pods: ['podGroup'],
  },
};

// Values that recur, named once so a two-key chips block stays one readable line.
const EMPTY = 'empty', NOTREADY = '10.244.1.5 ready=false', SERVING = '10.244.1.5 ready=true';

// The staircase as a PREFIX and never a single lit rung: `n` is the rung this step flips, and every
// rung already climbed stays at full weight while the ones ahead hold the notready shade.
const climb = (n) => Object.fromEntries(RUNG_KEYS.map((k, i) => [k, i <= n ? 1 : OPACITY.notready]));
// The rail as FIELDS, so no step can leave both segments live or neither.
const phase = (which) => ({
  railPending: which === 'running' ? OPACITY.notready : 1,
  railRunning: which === 'running' ? 1 : OPACITY.notready,
});
// The corridor pair as FIELDS, so no step can leave both directions on or neither.
const corridor = (dir) => ({ connectorDown: dir === 'up' ? 0 : 1, connectorUp: dir === 'up' ? 1 : 0 });
// The top-row hops, stated once: the watch comes back on RESP_Y, the status PATCH goes out on REQ_Y.
// Both take their OWN route time rather than topPacket's fixed HOP_MS. That default is the floor
// routeDur clamps to, and it only matches under about 315 units: this gap is 352, so a fixed 700
// would fly the ball faster than every other ball in the catalog (M-12).
const TOP_DUR = routeDur([[TOP1_X + TOP1_W, REQ_Y], [TOP2_X, REQ_Y]]);
const WATCH = { from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, dur: TOP_DUR };
const PATCH = { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, dur: TOP_DUR };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { timeChip: 'none yet', epChip: EMPTY },
    // Nothing has been placed yet, so the Pod sits at its dimmest and no tread is taken.
    opacity: { podGroup: OPACITY.notready, ...climb(-1), ...phase('pending'), ...corridor('down') },
    podSublabels: { podGroup: 'bound, nothing running' },
  },
  {
    id: 'scheduled',
    duration: 2400,
    narration: 'The Scheduler picks Node-1 and posts a Binding, so the API writes spec.nodeName and adds PodScheduled=True to status.conditions. The Kubelet on that Node sees the bound Pod arrive on its watch and admits it. Nothing is running yet and status.phase is still Pending, which is why the phase field cannot tell you where a slow start is stuck.',
    chips: { timeChip: '12:00:03', epChip: EMPTY },
    wires: { req: 'watch · spec.nodeName=Node-1 · PodScheduled=True' },
    opacity: { podGroup: OPACITY.notready, ...climb(0), ...phase('pending'), ...corridor('down') },
    podSublabels: { podGroup: 'bound, nothing running' },
    lit: ['apiEl', 'timeChip', RUNG_KEYS[0]],
    flow: [
      // The watch event is self-initiated by the API, so it waits BEAT.lead before it leaves.
      F.top({ ...WATCH, delay: BEAT.lead, lights: ['kubelet'] }),
    ],
  },
  {
    id: 'sandbox',
    duration: 2600,
    narration: 'The Kubelet has the container runtime create the Pod sandbox and the CNI plugin configure its network. Once both are done it sets PodReadyToStartContainers, and only after that flips True does it start pulling images and creating containers. The condition has been beta and on by default since 1.29 and it goes stable in 1.37.',
    chips: { timeChip: '12:00:09', epChip: NOTREADY },
    wires: { req: 'PATCH status · PodReadyToStartContainers=True' },
    opacity: { podGroup: OPACITY.pending, ...climb(1), ...phase('pending'), ...corridor('down') },
    podSublabels: { podGroup: 'sandbox up, network configured' },
    // Everything this step changes is earned by the sandbox ball: the Pod line, the tread and its
    // stamp, and the endpoint, which exists once the Pod has an IP. All of it waits for `create`.
    lit: ['kubelet', 'timeChip', 'epChip'],
    rewind: {
      chips: { timeChip: '12:00:03', epChip: EMPTY },
      opacity: { [RUNG_KEYS[1]]: OPACITY.notready },
      podSublabels: { podGroup: 'bound, nothing running' },
    },
    flow: [
      F.route({ points: SPINE, name: 'create' }),
      // Down-arrow: the ball lands first, then the Pod blinks and lifts out of its dimmest shade.
      F.pulse({ pod: 'podGroup', at: 'create' }),
      F.fade({ target: 'podGroup', from: OPACITY.notready, to: OPACITY.pending, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
      F.fade({ target: RUNG_KEYS[1], from: OPACITY.notready, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
      F.light({ at: 'create', targets: [RUNG_KEYS[1]] }),
      F.set({ at: 'create', chips: { timeChip: '12:00:09', epChip: NOTREADY }, podSublabels: { podGroup: 'sandbox up, network configured' } }),
      F.top({ ...PATCH, after: 'create', lights: ['apiEl'] }),
    ],
  },
  {
    id: 'initialized',
    duration: 3100,
    narration: 'The init containers run in order and exit 0, so the Kubelet sets Initialized to True. On a Pod that declares no init container at all this rung is True before the sandbox even exists, so the climb is a rough order and not a fixed sequence. Even so, status.phase stays Pending until the app container is created and starts.',
    chips: { timeChip: '12:00:22', epChip: NOTREADY },
    wires: { req: 'PATCH status · Initialized=True' },
    opacity: { podGroup: OPACITY.pending, ...climb(2), ...phase('pending'), ...corridor('up') },
    podSublabels: { podGroup: 'init containers exited 0' },
    lit: ['timeChip', RUNG_KEYS[2]],
    flow: [
      // Up-arrow: the Pod blinks first and the report leaves at BEAT.afterPulse.
      F.pulse({ pod: 'podGroup', dim: true }),
      F.route({ points: SPINE_UP, delay: BEAT.afterPulse, name: 'report', lights: ['kubelet'] }),
      F.top({ ...PATCH, after: 'report', lights: ['apiEl'] }),
    ],
  },
  {
    id: 'containers-ready',
    duration: 3200,
    narration: 'The app container starts, and that start alone is what moves status.phase to Running, its single transition on the whole climb. Its readinessProbe then passes, so every container is ready and the Kubelet sets ContainersReady. A container that starts and never passes that probe leaves the Pod Running with ContainersReady still False.',
    chips: { timeChip: '12:00:26', epChip: NOTREADY },
    wires: { req: 'PATCH status · ContainersReady=True' },
    opacity: { podGroup: 1, ...climb(3), ...phase('running'), ...corridor('up') },
    podSublabels: { podGroup: 'every container ready' },
    // The rail is lit on this step ALONE: it is the one step of the climb that moves status.phase.
    lit: ['timeChip', RUNG_KEYS[3], 'railRunning'],
    flow: [
      // M-08: the blink comes first, the lift to full opacity hangs off it one beat later.
      F.pulse({ pod: 'podGroup' }),
      F.fade({ target: 'podGroup', from: OPACITY.pending, to: 1, dur: FADE.in, delay: BEAT.afterPulse, fill: 'both', easing: 'ease-out' }),
      F.route({ points: SPINE_UP, delay: BEAT.afterPulse, name: 'report', lights: ['kubelet'] }),
      F.top({ ...PATCH, after: 'report', lights: ['apiEl'] }),
    ],
  },
  {
    id: 'ready',
    duration: 3000,
    narration: 'Ready is not a copy of ContainersReady. The Kubelet computes it as ContainersReady AND every condition named in spec.readinessGates, so a gate nobody has set yet holds Ready at False while all the containers are serving. The Pod IP already sits in the EndpointSlice of every matching Service, and Ready flipping is what turns that endpoint ready=true.',
    chips: { timeChip: '12:00:31', epChip: SERVING },
    wires: { req: 'PATCH status · Ready=True' },
    // The only traffic this step names rides the top row, so the corridor returns to its resting
    // down direction and points at the Pod the verdict is about rather than back at the Kubelet.
    opacity: { podGroup: 1, ...climb(4), ...phase('running'), ...corridor('down') },
    podSublabels: { podGroup: 'serving' },
    lit: ['kubelet', 'timeChip', 'epChip', RUNG_KEYS[4]],
    // Ready landing on the API is what turns the endpoint ready=true and the Pod to serving, so
    // both wait for the PATCH. The verdict, its tread and its stamp are the Kubelet's, at entry.
    rewind: { chips: { epChip: NOTREADY }, podSublabels: { podGroup: 'every container ready' } },
    flow: [
      // Self-initiated: the Kubelet reaches the verdict on its own, so the ball waits BEAT.lead.
      F.top({ ...PATCH, delay: BEAT.lead, name: 'patch', lights: ['apiEl'] }),
      F.pulse({ pod: 'podGroup', at: 'patch' }),
      F.set({ at: 'patch', chips: { epChip: SERVING }, podSublabels: { podGroup: 'serving' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
