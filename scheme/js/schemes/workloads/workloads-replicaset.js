import { P, F, defineCard, ladder, laneY, midX, WL, LAYOUT, FADE, BEAT, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS.md#workloads-replicaset

// Layout B on the Workloads canon (WL): panel x<=397 y<=305 leaves room for the chip column but not
// the six-row pipeline, so the columns SWAP: chips left, ladder right, Node frame full width.
const PANEL_B = 305, PANEL_GAP = 20;

// The ReplicaSet is centred on CX so the lane leaves its bottom midpoint and drops down the
// corridor between the two columns.
const TOP1_X = 420, TOP1_W = 2 * (WL.CX - 420);          // 420..780, centred on CX
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = WL.R - (TOP1_X + TOP1_W + TOP_GAP);
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);

// LAYOUT.B of the kit: chips in the LEFT column, pipeline in the RIGHT. WL.L-06 picks A / B / C
// against THIS card's measured panel bottom, and only B fits a six-row ladder beside a panel at 305.
const LAD_X = LAYOUT.B.ladder.x, LAD_W = LAYOUT.B.ladder.w;    // 660..1140, the pipeline
const LAD_Y = 150;                                       // 6 rows -> 150..392

// Chips take the left column, which the panel frees below PANEL_B.
const CHIP_X = LAYOUT.B.chips.x, CHIP_W = LAYOUT.B.chips.w;    // 60..540
const CHIP_VGAP = 8;
const CHIP_Y = ladder({ y: PANEL_B + PANEL_GAP, rowH: WL.CHIP_H, gap: CHIP_VGAP });   // 325..485

const NODE_Y = 500, NODE_H = 124;                        // 500..624
const POD_H = 78, POD_Y = NODE_Y + 34;                   // 534..612
const POD_PAD = 24;
const POD_INNER = { dy: 24, h: 44 };

// Four Pod slots spread across the frame's inner width, so the row centres on CX.
const SLOT_N = 4, SLOT_W = 220, SLOT_INNER_DX = 30;
const SLOT_SPAN = WL.W - POD_PAD * 2;
const SLOT_X = i => WL.L + POD_PAD + i * ((SLOT_SPAN - SLOT_W) / (SLOT_N - 1));
const SLOT_CX = i => SLOT_X(i) + SLOT_W / 2;

// The lane drops from the ReplicaSet into the Node frame, runs along a bus above the Pod row and
// taps down into whichever Pod the step addresses. Wires and balls share these points.
const BUS_Y = NODE_Y + 12;
const TRUNK = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y]];
// The bus is split at slot 2: the tail and the tap beyond it belong to the fourth slot, which is
// empty on four of the seven steps, and a lane into a Pod that is not there points at nothing.
const BUS = [[SLOT_CX(0), BUS_Y], [SLOT_CX(SLOT_N - 2), BUS_Y]];
const BUS_TAIL = [[SLOT_CX(SLOT_N - 2), BUS_Y], [SLOT_CX(SLOT_N - 1), BUS_Y]];
const TAP = i => [[SLOT_CX(i), BUS_Y], [SLOT_CX(i), POD_Y]];
const LANE = i => (SLOT_CX(i) === WL.CX
  ? [[WL.CX, WL.TOP_BOTTOM], [WL.CX, POD_Y]]
  : [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y], [SLOT_CX(i), BUS_Y], [SLOT_CX(i), POD_Y]]);

// A trunk segment carries the ball but is not its destination, so it is drawn without a marker:
// the arrowhead belongs on the tap that lands on a Pod.
const trunkPath = (key, points) => P.relation({ key, points, role: 'cluster', dash: '5 5' });

// Slot names are stable identities (like the Deployment card), the inner box carries the selector
// label and the ownerReference state.
const POD_NAMES = ['web-a1', 'web-b2', 'web-c3', 'web-d4'];

// Z-order: the Node frame is a 70% opaque fill, so the bus inside it and the balls riding it are
// appended after it. Ladder, Pods and the actor row sit above the packets.
export const SCENE = {
  'aria-label': 'ReplicaSet controller: a reconcile loop keeps spec.replicas Pods running, owns them through ownerReferences, adopts a matching orphan and releases a relabeled Pod',
  parts: [
    P.defs(),
    P.arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    P.chip({ key: 'selectorChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'selector', value: 'app=web' }),
    P.chip({ key: 'desiredChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'spec.replicas', value: '3' }),
    P.chip({ key: 'observedChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'status.replicas', value: '3' }),
    P.chip({ key: 'actionChip', x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'reconcile', value: 'in sync' }),
    P.node({ key: 'nodeEl', x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' }),
    // Trunk and bus carry the ball, the taps land it on a Pod: only the taps take an arrowhead.
    trunkPath('trunk', TRUNK),
    trunkPath('bus', BUS),
    trunkPath('busTail', BUS_TAIL),
    ...[0, 1, 2, 3].map(i => P.lane({ key: `tap${i}`, points: TAP(i), dim: true, dashed: true, role: 'cluster' })),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.chain({
      key: 'chain', x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP, role: 'cluster',
      items: [
        '1. own       ·  ownerReferences, Deployment → RS → Pod',
        '2. reconcile ·  desired vs observed, level-triggered',
        '3. self-heal ·  a Pod dies, the controller recreates it',
        '4. adopt     ·  a matching orphan is claimed by selector',
        '5. converge  ·  surplus deleted, never exceed replicas',
        '6. orphan    ·  relabel releases a Pod, RS replaces it',
      ],
    }),
    // The fourth slot is empty until an orphan appears, so it alone is born pinned out.
    ...POD_NAMES.map((name, i) => P.pod({
      key: `pod${i + 1}`, id: `pod${i + 1}`, innerKey: `pod${i + 1}Box`,
      x: SLOT_X(i), y: POD_Y, w: SLOT_W, h: POD_H, label: name, sublabel: '', containers: 0,
      opacity: i === SLOT_N - 1 ? 0 : undefined,
      inner: { dx: SLOT_INNER_DX, dy: POD_INNER.dy, w: SLOT_W - SLOT_INNER_DX * 2, h: POD_INNER.h, label: 'app=web', sublabel: 'owner: rs' },
    })),
    P.box({ key: 'api', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'Pod create · delete · watch', role: 'cluster' }),
    P.box({ key: 'rs', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'ReplicaSet', sublabel: 'owned by Deployment web', role: 'cluster' }),
  ],
  reset: {
    keys: ['rs', 'api', 'selectorChip', 'desiredChip', 'observedChip', 'actionChip', 'pod1Box', 'pod2Box', 'pod3Box', 'pod4Box'],
    pods: ['pod1', 'pod2', 'pod3', 'pod4'],
  },
};

// A slot's label, its owner state and its presence are ONE fact, so one helper writes all three.
// The fourth slot owns the bus tail and its own tap, which come and go WITH the Pod, not per step.
const slots = (...row) => {
  const labels = {}, sublabels = {}, opacity = {};
  row.forEach((v, i) => {
    const n = i + 1;
    if (v.label !== undefined) labels[`pod${n}Box`] = v.label;
    if (v.sub !== undefined) sublabels[`pod${n}Box`] = v.sub;
    if (v.opacity !== undefined) {
      opacity[`pod${n}`] = v.opacity;
      if (n === SLOT_N) { opacity.busTail = v.opacity; opacity[`tap${SLOT_N - 1}`] = v.opacity; }
    }
  });
  return { labels, sublabels, opacity };
};
// A managed replica, and the empty fourth slot. GONE states no label: three steps deliberately
// leave the fourth slot's text at whatever the step before wrote, and hiding it is the whole write.
const OWNED = { label: 'app=web', sub: 'owner: rs', opacity: 1 };
const GONE = { opacity: 0 };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { selectorChip: 'app=web', desiredChip: '3', observedChip: '3', actionChip: 'in sync' },
    ...slots(OWNED, OWNED, OWNED, { label: 'app=web', sub: 'owner: none', opacity: 0 }),
    chain: -1,
  },
  {
    id: 'own',
    duration: 3700,
    narration: 'Every Pod the ReplicaSet manages carries a metadata.ownerReferences entry pointing back to it, with controller=true. That link is what lets garbage collection clean up the Pods when the ReplicaSet is deleted. The ownership is a chain: a Deployment owns this ReplicaSet, and the ReplicaSet owns the Pods. You scale the Deployment, it updates the ReplicaSet spec.replicas, and the ReplicaSet is what actually creates and deletes Pods.',
    chips: { selectorChip: 'app=web', desiredChip: '3', observedChip: '3', actionChip: 'in sync' },
    wires: { req: 'ownerReferences · controller=true · Deployment → RS → Pod' },
    ...slots(OWNED, OWNED, OWNED, GONE),
    lit: ['rs', 'observedChip'],
    chain: 0,
    // Declaration: a packet runs from the ReplicaSet down the connector to the node, and the
    // three Pods pulse on arrival, announcing they exist and belong to the RS by ownerReference.
    flow: [0, 1, 2].flatMap(i => [
      F.route({ points: LANE(i), delay: BEAT.lead, name: `decl${i}` }),
      F.pulse({ pod: `pod${i + 1}`, at: `decl${i}` }),
    ]),
  },
  {
    id: 'reconcile',
    duration: 2000,
    narration: 'The controller runs a continuous reconcile loop. On every relevant change it compares the desired count (spec.replicas=3) against the observed count of matching Pods (3 right now) and acts only on the difference. Because it is level-triggered it works off the current observed state, not off one-time events, so a missed event or a controller restart still converges to the same result. With desired equal to observed there is nothing to do.',
    chips: { selectorChip: 'app=web', desiredChip: '3', observedChip: '3', actionChip: 'balanced · no-op' },
    wires: { req: 'watch Pods · desired 3 == observed 3 · no-op' },
    ...slots(OWNED, OWNED, OWNED, GONE),
    lit: ['rs', 'desiredChip', 'observedChip', 'actionChip'],
    chain: 1,
    // No packet moves on a no-op reconcile and the Pods are untouched: the compared
    // values show via the static highlight only (no chip pulse).
  },
  {
    id: 'self-heal',
    // Motion: the Pod fade (700) + beat, the watch event in (700), the create out (700), the new Pod
    // down the lane and its arrival pulse, which lands at 4521. The watch hop cost 800 of that.
    duration: 4700,
    narration: 'One Pod is lost, its Node failed or the Pod was deleted. The controller sees the observed count drop to 2 below the desired 3 through its Pod watch, and immediately creates a replacement Pod to restore the count. This self-healing is the whole point of a controller. A bare Pod created on its own has no owner watching it, so once gone it stays gone.',
    chips: { selectorChip: 'app=web', desiredChip: '3', observedChip: '2 → 3', actionChip: 'create +1' },
    wires: { req: 'observed 2 < 3 · create Pod web-b2' },
    ...slots(OWNED, OWNED, OWNED, GONE),
    lit: ['observedChip', 'actionChip'],
    // The animated path says the replacement landed by PULSING it, which no `lights` list can name:
    // the static path has to say it with the inner box instead.
    reducedLit: ['pod2Box'],
    chain: 2,
    flow: [
      // The loss reaches the controller as a watch event down the answer lane, so it is dark until
      // that lands: it acts on what it RECEIVES. Only then does the create go out.
      F.fade({ target: 'pod2', from: 1, to: 0, dur: FADE.out, delay: 0, fill: 'forwards', easing: 'ease-in' }),
      F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, delay: FADE.out + BEAT.afterHop, name: 'watch', lights: ['rs'] }),
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, after: 'watch', name: 'req', lights: ['api'] }),
      F.route({ points: LANE(1), after: 'req', name: 'create' }),
      F.fade({ target: 'pod2', from: 0, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'pod2', at: 'create' }),
    ],
  },
  {
    id: 'adopt',
    duration: 3700,
    narration: 'A standalone Pod is created with the label app=web and no controller ownerReference. The ReplicaSet matches Pods by selector, not by who created them, so it adopts this orphan: it PATCHes the Pod metadata.ownerReferences to point at itself. The Pod was already running, adoption only restamps its owner, and it now joins the set on the Node as the fourth replica. The observed count is now 4.',
    chips: { selectorChip: 'app=web', desiredChip: '3', observedChip: '3 → 4', actionChip: 'adopt +1' },
    wires: { req: 'PATCH ownerReferences · adopt web-d4 (app=web)' },
    ...slots(OWNED, OWNED, OWNED, { label: 'app=web', sub: 'adopted · owner: rs', opacity: 1 }),
    lit: ['rs', 'observedChip', 'actionChip'],
    reducedLit: ['pod4Box'],
    chain: 3,
    // The Pod alone winds back, not the tail and tap the static block also turned on: the ball rides
    // both of those on its way in, and it cannot fly over blank canvas to reach a slot.
    rewind: { opacity: { pod4: 0 } },
    flow: [
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'patch', lights: ['api'] }),
      F.route({ points: LANE(3), after: 'patch', name: 'join' }),
      F.fade({ target: 'pod4', from: 0, to: 1, dur: FADE.in, at: 'join', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'pod4', at: 'join' }),
    ],
  },
  {
    id: 'converge',
    duration: 3700,
    narration: 'Adoption pushed the count to 4, one above spec.replicas. The same reconcile loop now deletes one Pod to return to exactly 3. A ReplicaSet never runs more than its desired count, no matter where the extra Pod came from. When it has to pick a victim it ranks candidates (unscheduled and not-ready Pods first, then by the controller.kubernetes.io/pod-deletion-cost annotation), then issues a delete.',
    chips: { selectorChip: 'app=web', desiredChip: '3', observedChip: '4 → 3', actionChip: 'delete -1' },
    wires: { req: 'observed 4 > 3 · DELETE surplus Pod' },
    ...slots(OWNED, OWNED, OWNED, { label: 'app=web', sub: 'surplus · deleting', opacity: 0 }),
    lit: ['rs', 'observedChip', 'actionChip'],
    chain: 4,
    // The whole fourth slot comes back for the flight, bus tail and tap included: LANE(3) runs
    // along both, so restoring the Pod alone leaves the last two legs of the ball on blank canvas.
    rewind: { opacity: { pod4: 1, busTail: 1, tap3: 1 } },
    flow: [
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'del', lights: ['api'] }),
      F.route({ points: LANE(3), after: 'del', name: 'evict' }),
      F.pulse({ pod: 'pod4', at: 'evict' }),
      // Pod, tail and tap leave on one beat. fill:'both' holds them on screen through the delay.
      F.fade({ target: 'pod4', from: 1, to: 0, dur: FADE.out, at: 'evict', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'busTail', from: 1, to: 0, dur: FADE.out, at: 'evict', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'tap3', from: 1, to: 0, dur: FADE.out, at: 'evict', fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'orphan',
    duration: 3700,
    narration: 'The reverse of adoption. A Pod is relabeled so it no longer matches the selector, here app=web becomes app=debug. The ReplicaSet releases it by removing its ownerReference, and the Pod keeps running as an unmanaged standalone Pod. That drops the matching count to 2, so the controller creates a replacement to hold 3. Labels are the binding: change them and a Pod moves in or out of the set.',
    chips: { selectorChip: 'app=web', desiredChip: '3', observedChip: '2 → 3', actionChip: 'release + create' },
    wires: { req: 'label app=debug · remove ownerReference · create replacement' },
    // pod3 is relabeled off the selector and released, it keeps running but unmanaged, and pod4 is
    // the fresh replacement that restores the matching count to 3.
    ...slots(OWNED, OWNED, { label: 'app=debug', sub: 'released · unmanaged', opacity: OPACITY.notready }, { label: 'app=web', sub: 'owner: rs', opacity: 1 }),
    lit: ['rs', 'observedChip', 'actionChip'],
    reducedLit: ['pod4Box'],
    chain: 5,
    rewind: { opacity: { pod4: 0 } },
    flow: [
      // pod3 fades to its dim released state, the RS removes its ownerReference (top PATCH),
      // then creates a replacement that materializes in the free slot on arrival.
      F.fade({ target: 'pod3', from: 1, to: OPACITY.notready, dur: FADE.out, delay: 0, fill: 'both', easing: 'ease-in' }),
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'release', lights: ['api'] }),
      F.route({ points: LANE(3), after: 'release', name: 'replace' }),
      F.fade({ target: 'pod4', from: 0, to: 1, dur: FADE.in, at: 'replace', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'pod4', at: 'replace' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
