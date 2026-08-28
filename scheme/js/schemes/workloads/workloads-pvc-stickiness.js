import { P, F, defineCard, ladder, strip, laneY, midX, WL, LAYOUT, FADE, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS.md#workloads-pvc-stickiness

// Layout C on the Workloads canon (WL): panel x<=397 y<=330, so pipeline right and chips two-across.
// The PV sits BETWEEN the two Node frames, which is where the story puts it.
const TOP1_X = 420, TOP1_W = 220;
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = 220;
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);
const TOP1_CX = TOP1_X + TOP1_W / 2;                     // 530, and the corridor the lane uses

// LAYOUT.C of the kit: the ladder takes the RIGHT column, because C has no free column at all.
const LAD_X = LAYOUT.C.ladder.x, LAD_W = LAYOUT.C.ladder.w;    // 660..1140, the pipeline
const LAD_Y = 150;                                       // 5 rows -> 150..350

// Chips two across, 532 wide (LAYOUT.C.strip.two): four across was 258 and every name ran into
// its own value. The strip spans WL.L..WL.R exactly, so the gap is fixed and the width derives.
const CHIP_COLS = 2, CHIP_GAP = 16, CHIP_VGAP = 8;
const CHIPS = strip({ from: WL.L, to: WL.R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIPS_Y = 548;                                     // 2 rows -> 548..582 / 590..624
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: WL.CHIP_H, gap: CHIP_VGAP });
const CHIP_X = i => CHIPS.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

// Node band: two frames with the PV disk parked in the gap between them, centred on CX.
const NODE_Y = 392, NODE_H = 140;                        // 392..532
const PV_W = 140, PV_GAP = 30;
const PV_X = WL.CX - PV_W / 2;                           // 530..670
const N_W = PV_X - PV_GAP - WL.L;                        // 440
const N_A_X = WL.L, N_B_X = PV_X + PV_W + PV_GAP;        // 60..500 / 700..1140
const PV_H = 100, PV_Y = NODE_Y + (NODE_H - PV_H) / 2;   // 412..512
const PV_CY = PV_Y + PV_H / 2;                           // 462

const POD_W = 300, POD_H = 94, POD_Y = NODE_Y + 34;      // 426..520
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 26, h: 50 };
const P_A_X = N_A_X + (N_W - POD_W) / 2;                 // 130
const P_B_X = N_B_X + (N_W - POD_W) / 2;                 // 770
const P_A_CX = P_A_X + POD_W / 2, P_B_CX = P_B_X + POD_W / 2;   // 280 / 920

// One trunk down the corridor, a bus above the Node band, one tap per Node ending on the Pod that
// reacts. It leaves the API, not the StatefulSet: every ball here is an API write taking effect.
const TOP2_CX = TOP2_X + TOP2_W / 2;                     // 810
const JOG_Y = WL.TOP_BOTTOM + 20;                        // 140, below the boxes, above the pipeline
const BUS_Y = NODE_Y - 20;                               // 372
const TRUNK = [[TOP2_CX, WL.TOP_BOTTOM], [TOP2_CX, JOG_Y], [TOP1_CX, JOG_Y], [TOP1_CX, BUS_Y]];
const BUS_L = [[P_A_CX, BUS_Y], [TOP1_CX, BUS_Y]];
const BUS_R = [[TOP1_CX, BUS_Y], [P_B_CX, BUS_Y]];
const TAP_A = [[P_A_CX, BUS_Y], [P_A_CX, POD_Y]];
const TAP_B = [[P_B_CX, BUS_Y], [P_B_CX, POD_Y]];
const NODE1_LANE = [...TRUNK, [P_A_CX, BUS_Y], [P_A_CX, POD_Y]];
const NODE2_LANE = [...TRUNK, [P_B_CX, BUS_Y], [P_B_CX, POD_Y]];
// The CSI reattach out of the PV right face. The mirrored line on the left is the mount web-0
// already holds on Node-1, a RELATIONSHIP no ball rides, so it carries no arrowhead.
const PV_LANE = [[PV_X + PV_W, PV_CY], [P_B_X, PV_CY]];
const PV_MOUNT_A = [[P_A_X + POD_W, PV_CY], [PV_X, PV_CY]];

// A trunk segment carries the ball but is not its destination, so it is drawn without a marker:
// the arrowhead belongs on the tap that lands on a Pod.
const trunkPath = (key, points, role = 'cluster') => P.relation({ key, points, role, dash: '5 5' });

// Z-order: the Node frames are a 70% opaque fill, so the lanes inside them and the balls riding
// them follow, and ladder / Pods / actors sit above the packets.
export const SCENE = {
  'aria-label': 'StatefulSet PVC stickiness: a Pod evicted from one Node is recreated with the same ordinal, reattaches the same PVC, sees the previous on-disk state',
  parts: [
    P.defs(),
    P.arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    P.chip({ key: 'podChip', x: CHIP_X(0), y: CHIP_Y(0), w: CHIPS.w, h: WL.CHIP_H, name: 'pod identity', value: 'web-0 · Running' }),
    P.chip({ key: 'pvcChip', x: CHIP_X(1), y: CHIP_Y(1), w: CHIPS.w, h: WL.CHIP_H, name: 'PVC name', value: 'data-web-0 · Bound', role: 'storage' }),
    P.chip({ key: 'pvChip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIPS.w, h: WL.CHIP_H, name: 'PV name', value: 'cloud-vol-x · ReadWriteOnce', role: 'storage' }),
    P.chip({ key: 'dataChip', x: CHIP_X(3), y: CHIP_Y(3), w: CHIPS.w, h: WL.CHIP_H, name: 'on-disk data', value: 'rev=1234', role: 'storage' }),
    P.node({ key: 'nodeA', x: N_A_X, y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'nodeB', x: N_B_X, y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-2' }),
    // One trunk and one bus above the Node band, then a tap per Node. Only the taps land on a
    // Pod, so only they take an arrowhead.
    trunkPath('trunk', TRUNK),
    trunkPath('busL', BUS_L),
    trunkPath('busR', BUS_R),
    P.lane({ key: 'connector', points: TAP_A, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'connectorB', points: TAP_B, dim: true, dashed: true, role: 'cluster' }),
    // Storage lanes: the mount web-0 holds on Node-1, and the reattach into web-0 on Node-2.
    trunkPath('pvMountA', PV_MOUNT_A, 'storage'),
    P.lane({ key: 'pvConnector', points: PV_LANE, dim: true, dashed: true, role: 'storage' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    // Pipeline chain, 5 stages of the lifecycle.
    P.chain({
      key: 'chain', x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP, role: 'cluster',
      items: [
        '1. running  ·  web-0 on Node-1 · PV mounted at /data',
        '2. evict    ·  Pod deleted, PVC retained',
        '3. recreate ·  controller spawns web-0 again (same name)',
        '4. bind     ·  scheduler picks Node-2 · PVC stays bound',
        '5. reattach ·  CSI mounts the same PV · /data preserved',
      ],
    }),
    // Pod web-0 on Node-1: starts visible, fades on evict.
    P.pod({
      key: 'podA', id: 'podA', innerKey: 'podABox',
      x: P_A_X, y: POD_Y, w: POD_W, h: POD_H, label: 'web-0', sublabel: '', containers: 0,
      inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: 'mount: /data' },
    }),
    // Pod web-0 on Node-2: hidden initially, fades in on recreate.
    P.pod({
      key: 'podB', id: 'podB', innerKey: 'podBBox', opacity: 0,
      x: P_B_X, y: POD_Y, w: POD_W, h: POD_H, label: 'web-0', sublabel: '', containers: 0,
      inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: 'mount: /data' },
    }),
    P.box({ key: 'apiserver', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'PVC retained on Pod delete', role: 'cluster' }),
    P.box({ key: 'controller', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'StatefulSet', sublabel: 'sticky identity, sticky PVC', role: 'cluster' }),
    P.cylinder({ key: 'pv', x: PV_X, y: PV_Y, w: PV_W, h: PV_H, label: 'PV cloud-vol-x', role: 'storage' }),
  ],
  reset: {
    keys: ['controller', 'apiserver', 'pv', 'podChip', 'pvcChip', 'pvChip', 'dataChip', 'podABox', 'podBBox'],
    pods: ['podA', 'podB'],
  },
};

// A lane into a Pod that is not there points at nothing, so each is pinned to 0 until its Pod is on
// that Node, and Node-1 is pinned here too (A-16): LOST on four of five steps, so that is `alive`s default.
const lanes = (toA, toB, alive = false) => ({
  nodeA: alive ? 1 : OPACITY.notready,
  trunk: (toA || toB) ? 1 : 0,
  busL: toA ? 1 : 0,
  connector: toA ? 1 : 0,
  pvMountA: toA ? 1 : 0,
  busR: toB ? 1 : 0,
  connectorB: toB ? 1 : 0,
  pvConnector: toB ? 1 : 0,
});

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { podChip: 'web-0 · Running on Node-1', pvcChip: 'data-web-0 · Bound', pvChip: 'cloud-vol-x · ReadWriteOnce', dataChip: 'rev=1234' },
    opacity: { podA: 1, podB: 0, ...lanes(true, false, true) },
    // Row 0 is the steady state this frame draws, so the poster lights it: eight cards in the
    // category open on `chain: 0` and the four steps below then take rows 1 to 4.
    chain: 0,
  },
  {
    id: 'evict',
    // Motion: the eviction now leaves the API, 280 units further along, and runs to 2558ms.
    duration: 2700,
    narration: 'Node-1 goes NotReady (kernel panic, power loss, network partition). After the toleration on node.kubernetes.io/unreachable expires, taint-based eviction deletes the Pod, which sits in Terminating until the Node returns or an operator clears it, and only then is the object gone. Critically, the PVC data-web-0 is NOT deleted, the StatefulSet retains it for the ordinal under the default PVC retention policy. The PV cloud-vol-x stays Bound, the cloud disk is intact, rev=1234 persists.',
    chips: { podChip: 'web-0 · Terminating, then removed', pvcChip: 'data-web-0 · Bound (retained)', pvChip: 'cloud-vol-x · on lost Node-1', dataChip: 'rev=1234 · preserved' },
    wires: { req: 'DELETE Pod web-0 · Keep PVC data-web-0' },
    // Pin final opacity inline so a cancel between steps does not flash it back. The chip says
    // Terminating on this step, so web-0 sinks to that shade rather than leaving its slot.
    opacity: { podB: 0, ...lanes(true, false), podA: OPACITY.terminating },
    lit: ['controller', 'apiserver', 'podChip', 'pvcChip', 'pvChip', 'dataChip'],
    chain: 1,
    // Node-1 is at full strength until this step: the heartbeats stop HERE, which is the first
    // sentence, so the frame is wound back and dims where the words say it goes NotReady.
    rewind: { opacity: { nodeA: 1 } },
    flow: [
      // The Node goes first and the eviction follows it: the ball is still 1858ms out when the
      // frame has finished dimming, so no delay is needed to put the two in the right order.
      F.fade({ target: 'nodeA', from: 1, to: OPACITY.notready, dur: FADE.out, delay: 0, fill: 'both', easing: 'ease-in' }),
      F.route({ points: NODE1_LANE, fadeIn: true, name: 'del' }),
      F.fade({ target: 'podA', from: 1, to: OPACITY.terminating, dur: FADE.out, at: 'del', fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'recreate',
    duration: 2300,
    narration: 'The StatefulSet controller observes the missing replica and creates a new Pod object with the same name web-0 (sticky identity). The Pod is unbound (spec.nodeName empty). Scheduler runs filter and score on the remaining Ready Nodes. PVC data-web-0 stays Bound to PV cloud-vol-x throughout, so no re-provisioning is needed.',
    chips: { podChip: 'web-0 · Pending (created again)', pvcChip: 'data-web-0 · Bound (reused)', pvChip: 'cloud-vol-x · on lost Node-1', dataChip: 'rev=1234 · preserved' },
    wires: { req: 'create Pod web-0 (sticky name)' },
    opacity: { podA: 0, podB: 0, ...lanes(false, false) },
    lit: ['podChip', 'pvcChip'],
    chain: 2,
    flow: [
      // Control-plane only, in the narration's order: the controller OBSERVES the missing replica
      // down the answer lane and only THEN posts the new Pod. Still Pending, so nothing lands yet.
      F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, name: 'observe', lights: ['controller'] }),
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, after: 'observe', lights: ['apiserver'] }),
    ],
  },
  {
    id: 'bind',
    // Motion: the binding now leaves the API and crosses to the far Node, running to 3069ms.
    duration: 3200,
    narration: 'Scheduler binds web-0 to Node-2. POST .../pods/web-0/binding writes spec.nodeName=Node-2 in ETCD. PVC data-web-0 stays bound to the same PV cloud-vol-x. The cloud volume is ReadWriteOnce, so it can be safely attached to Node-2 only because the old Pod is fully removed from API (force-delete a stuck Pod and you risk a dual mount, see the Force Deletion card).',
    chips: { podChip: 'web-0 · bound to Node-2', pvcChip: 'data-web-0 · Bound (reused)', pvChip: 'cloud-vol-x · attaching to Node-2', dataChip: 'rev=1234 · preserved' },
    wires: { req: 'POST .../pods/web-0/binding · Node-2' },
    // Pin final opacity inline (web-0 now placed on Node-2) so a cancel does not hide it.
    opacity: { podA: 0, ...lanes(false, true), podB: 1 },
    lit: ['apiserver', 'podChip', 'pvChip'],
    chain: 3,
    // The attach is what the binding sets off, so the volume is still on the lost Node until the
    // ball that names Node-2 lands. The end value is above, this is where the step starts from.
    rewind: { chips: { podChip: 'web-0 · Pending (created again)', pvChip: 'cloud-vol-x · on lost Node-1' } },
    flow: [
      F.route({ points: NODE2_LANE, fadeIn: true, name: 'bind' }),
      // Both chips are wound back to what the previous step left and turn over when the binding
      // LANDS: at entry they would read as placed and attaching while the slot on Node-2 is empty.
      F.set({ at: 'bind', chips: { podChip: 'web-0 · bound to Node-2', pvChip: 'cloud-vol-x · attaching to Node-2' } }),
      F.fade({ target: 'podB', from: 0, to: 1, dur: FADE.in, at: 'bind', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'podB', at: 'bind' }),
    ],
  },
  {
    id: 'reattach',
    duration: 2600,
    narration: 'Kubelet on Node-2 starts the Pod. The CSI external-attacher detaches the PV from the lost Node-1 (force-detached because that Node is unreachable), then attaches it to Node-2 via ControllerPublishVolume. The node driver runs NodeStageVolume and NodePublishVolume to mount the volume at /data inside the new container. The application reads the same files at rev=1234, no data loss. The cloud-vol-x identity, the PVC name, and the Pod name all stayed sticky to ordinal 0.',
    chips: { podChip: 'web-0 · Running on Node-2', pvcChip: 'data-web-0 · Bound', pvChip: 'cloud-vol-x · mounted on Node-2', dataChip: 'rev=1234 · preserved' },
    wires: { req: 'CSI attach to Node-2 · NodeStage + NodePublish · /data' },
    opacity: { podA: 0, podB: 1, ...lanes(false, true) },
    lit: ['pv', 'podChip', 'pvcChip', 'pvChip', 'dataChip'],
    chain: 4,
    flow: [
      F.route({ points: PV_LANE, role: 'storage', fadeIn: true, name: 'mount' }),
      F.pulse({ pod: 'podB', at: 'mount' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
