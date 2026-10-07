import { P, F, defineCard, ladder, laneY, midX, routeDur, WL, FADE, BEAT, OPACITY } from './workloads-kit.js';
import { chip } from '../../lib/primitives.js';
import { g, rect, text } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/workloads-pod-startup-conditions.md

// An instrument, not the A / B / C column preset.

// Both actors take the cluster box width as a literal (no import past the kit, S-21). Left box on CX
// for the spine (WL.L-07), right box on WL.R where the chip column ends.
const TOP1_W = 232, TOP1_X = WL.CX - TOP1_W / 2;  // centred on CX for the spine
const TOP2_W = 232, TOP2_X = WL.R - TOP2_W;  // right edge on the chip column
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);

// Band 1: the API readings, right column only (L-03), the corridor owns the middle.
const CHIP_X = WL.COL_R.x, CHIP_W = WL.COL_R.w;
const CHIP_GAP = 8;
const CHIPS_TOP = 160;
const CHIP_Y = ladder({ y: CHIPS_TOP, rowH: WL.CHIP_H, gap: CHIP_GAP });

// Band 2: the Node sits ABOVE the instrument so the corridor reaches it without crossing the
// staircase (L-10), narrower than the WL.L-02 full width.
const NODE_W = 600, NODE_X = WL.CX - NODE_W / 2;  // top midpoint on SPINE_X
const POD_W = 460, POD_H = 108, POD_X = WL.CX - POD_W / 2;
const NODE_Y = 270, NODE_H = 34 + POD_H + 12;
const POD_Y = NODE_Y + 34;
// pod() fixes its label and sublabel baselines, so the inner box height buys the air between them.
const CONT_W = 300, CONT_H = 48, CONT_X = WL.CX - CONT_W / 2;
const CONT_Y = POD_Y + 30;

// Band 3: five equal touching treads, each rising half its height, so it reads as a stair, not a list.
const TREAD_W = WL.W / 5, TREAD_H = 44, RISE = TREAD_H / 2;
const STAIR_TOP = 440;  // tread 4, the top of the climb
const TREAD_X = (i) => WL.L + i * TREAD_W;
const TREAD_Y = (i) => STAIR_TOP + (4 - i) * RISE;
// box()'s measured optical baselines for a two-line cell.
const LINE1_Y = TREAD_H / 2 - 3.22, LINE2_Y = TREAD_H / 2 + 12.78;

// Band 4: one phase rail split once, on tread 3, whose container start moves status.phase.
const RAIL_Y = 592, RAIL_H = 34;
const RAIL_SPLIT = TREAD_X(3);
const RAIL_PAD = 12;

// One corridor, drawn down and up, on the frame top midpoint.
const SPINE = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, NODE_Y]];
const SPINE_UP = [...SPINE].reverse();

// In the order the API page lists them. Line two is who writes it and what flips it.
const RUNGS = [
  { name: 'PodScheduled', sub: 'kube-scheduler · nodeName set' },
  { name: 'PodReadyToStartContainers', sub: 'kubelet · sandbox and network' },
  { name: 'Initialized', sub: 'kubelet · init exited 0' },
  { name: 'ContainersReady', sub: 'kubelet · every container ready' },
  { name: 'Ready', sub: 'kubelet · AND readinessGates' },
];
const RUNG_KEYS = RUNGS.map((_, i) => 'rung' + i);

// A `.scheme-chip` so `lit` and the highlight CSS reach it. P.raw bypasses the kit binding, so the
// role is written by hand.
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

// List order is z-order: lanes and the wire label, the packet layer, then instrument, Node, Pod, actors.
export const SCENE = {
  'aria-label': 'Pod startup conditions: PodScheduled, PodReadyToStartContainers, Initialized, ContainersReady and Ready flip roughly in that order, the Kubelet deciding four of the five and writing them to the API, while status.phase moves once',
  parts: [
    P.defs(),
    // One corridor drawn twice. Exactly one direction is visible per step, see corridor().
    P.lane({ key: 'connectorDown', points: SPINE, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'connectorUp', points: SPINE_UP, dim: true, dashed: true, role: 'cluster', opacity: 0 }),
    P.arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    // The readings the staircase and the rail do not carry.
    P.chip({ key: 'timeChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'lastTransitionTime', value: 'none yet' }),
    P.chip({ key: 'epChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'Service endpoints', value: 'empty' }),
    P.packets(),
    // After the packet layer, so the ball runs under the frame and the actors.
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

const EMPTY = 'empty', NOTREADY = '10.244.1.5 ready=false', SERVING = '10.244.1.5 ready=true';

// A prefix, never a single lit rung: climbed rungs stay full, the rest hold the notready shade.
const climb = (n) => Object.fromEntries(RUNG_KEYS.map((k, i) => [k, i <= n ? 1 : OPACITY.notready]));
// The rail as FIELDS, so no step can leave both segments live or neither.
const phase = (which) => ({
  railPending: which === 'running' ? OPACITY.notready : 1,
  railRunning: which === 'running' ? 1 : OPACITY.notready,
});
// The corridor pair as FIELDS, so no step can leave both directions on or neither.
const corridor = (dir) => ({ connectorDown: dir === 'up' ? 0 : 1, connectorUp: dir === 'up' ? 1 : 0 });
// Top hops take their own route time, not topPacket's fixed HOP_MS, so a wider gap keeps canon speed (M-12).
const TOP_DUR = routeDur([[TOP1_X + TOP1_W, REQ_Y], [TOP2_X, REQ_Y]]);
const WATCH = { from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, dur: TOP_DUR };
const PATCH = { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, dur: TOP_DUR };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { timeChip: 'none yet', epChip: EMPTY },
    opacity: { podGroup: OPACITY.notready, ...climb(-1), ...phase('pending'), ...corridor('down') },
    podSublabels: { podGroup: 'bound, nothing running' },
  },
  {
    id: 'scheduled',
    duration: 3200,
    narration: 'The Scheduler picks Node-1 and posts a Binding, so the API writes spec.nodeName and adds PodScheduled=True to status.conditions. The Kubelet on that Node sees the bound Pod arrive on its watch and admits it. Nothing is running yet and status.phase is still Pending, which is why the phase field cannot tell you where a slow start is stuck.',
    chips: { timeChip: '12:00:03', epChip: EMPTY },
    wires: { req: 'watch · spec.nodeName=Node-1 · PodScheduled=True' },
    opacity: { podGroup: OPACITY.notready, ...climb(0), ...phase('pending'), ...corridor('down') },
    podSublabels: { podGroup: 'bound, nothing running' },
    lit: ['apiEl', 'timeChip', RUNG_KEYS[0]],
    flow: [
      // Self-initiated by the API, so it waits BEAT.lead.
      F.top({ ...WATCH, delay: BEAT.lead, lights: ['kubelet'] }),
    ],
  },
  {
    id: 'sandbox',
    duration: 3300,
    narration: 'The Kubelet has the container runtime create the Pod sandbox, and the runtime calls the CNI plugin to configure its network. Once both are done it sets PodReadyToStartContainers, and only after that flips True does it start pulling images and creating containers. The condition has been beta and on by default since 1.29 and it goes stable in 1.37.',
    chips: { timeChip: '12:00:09', epChip: NOTREADY },
    wires: { req: 'PATCH status · PodReadyToStartContainers=True' },
    opacity: { podGroup: OPACITY.pending, ...climb(1), ...phase('pending'), ...corridor('down') },
    podSublabels: { podGroup: 'sandbox up, network configured' },
    // Everything this step changes is earned by the sandbox ball, so all of it waits for `create`.
    lit: ['kubelet', 'timeChip', 'epChip'],
    rewind: {
      chips: { timeChip: '12:00:03', epChip: EMPTY },
      opacity: { [RUNG_KEYS[1]]: OPACITY.notready },
      podSublabels: { podGroup: 'bound, nothing running' },
    },
    flow: [
      F.route({ points: SPINE, name: 'create' }),
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
      F.pulse({ pod: 'podGroup', dim: true }),
      F.route({ points: SPINE_UP, delay: BEAT.afterPulse, name: 'report', lights: ['kubelet'] }),
      F.top({ ...PATCH, after: 'report', lights: ['apiEl'] }),
    ],
  },
  {
    id: 'containers-ready',
    duration: 3300,
    narration: 'The app container starts, and that start, not readiness, is what moves status.phase to Running, its single transition on the whole climb. Its readinessProbe then passes, so every container is ready and the Kubelet sets ContainersReady. A container that starts and never passes that probe leaves the Pod Running with ContainersReady still False.',
    chips: { timeChip: '12:00:26', epChip: NOTREADY },
    wires: { req: 'PATCH status · ContainersReady=True' },
    opacity: { podGroup: 1, ...climb(3), ...phase('running'), ...corridor('up') },
    podSublabels: { podGroup: 'every container ready' },
    // The rail is lit on this step alone: the one step that moves status.phase.
    lit: ['timeChip', RUNG_KEYS[3], 'railRunning'],
    flow: [
      // M-08: blink first, the lift to full opacity one beat later.
      F.pulse({ pod: 'podGroup' }),
      F.fade({ target: 'podGroup', from: OPACITY.pending, to: 1, dur: FADE.in, delay: BEAT.afterPulse, fill: 'both', easing: 'ease-out' }),
      F.route({ points: SPINE_UP, delay: BEAT.afterPulse, name: 'report', lights: ['kubelet'] }),
      F.top({ ...PATCH, after: 'report', lights: ['apiEl'] }),
    ],
  },
  {
    id: 'ready',
    duration: 3400,
    narration: 'Ready is not a copy of ContainersReady. The Kubelet computes it as ContainersReady AND every condition in spec.readinessGates, so this Pod held Ready at False until a controller set its gate True. With no gate the two flip together. The Pod IP already sits in the EndpointSlice of every matching Service, and Ready flipping turns that endpoint ready=true.',
    chips: { timeChip: '12:00:31', epChip: SERVING },
    wires: { req: 'PATCH status · Ready=True' },
    // Only the top row carries traffic, so the corridor rests pointing down at the Pod.
    opacity: { podGroup: 1, ...climb(4), ...phase('running'), ...corridor('down') },
    podSublabels: { podGroup: 'serving' },
    lit: ['kubelet', 'timeChip', 'epChip', RUNG_KEYS[4]],
    // The endpoint and the Pod line wait for the PATCH. The verdict, tread and stamp are the Kubelet's.
    rewind: { chips: { epChip: NOTREADY }, podSublabels: { podGroup: 'every container ready' } },
    flow: [
      // Self-initiated, so the ball waits BEAT.lead.
      F.top({ ...PATCH, delay: BEAT.lead, name: 'patch', lights: ['apiEl'], pulse: 'podGroup' }),
      F.set({ at: 'patch', chips: { epChip: SERVING }, podSublabels: { podGroup: 'serving' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
