import { P, F, defineCard, laneY, ladder, midX, WL, FADE, BEAT, OPACITY } from './workloads-kit.js';
import { g, rect, text } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/workloads-replicaset.md

// Two ownership bands and a count mark, no column preset (WL.L-06). PANEL_B is the measured panel bottom.
const PANEL_B = 330;

// The ReplicaSet is centred on WL.CX so the trunk leaves a face midpoint (WL.L-07).
const RS_W = 232, RS_X = WL.CX - RS_W / 2;
const API_W = 232, API_X = WL.R - API_W;                 // right edge on the chip column
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(RS_X + RS_W, API_X);

// Right of the panel, so the chips may sit above its bottom (L-01, L-03). No replicas chip: the mark draws it.
const CHIP_X = WL.COL_R.x, CHIP_W = WL.COL_R.w;
const CHIP_Y = ladder({ y: 150, rowH: WL.CHIP_H, gap: 8 });

// Upper band: Pods with a controller ownerReference to this ReplicaSet. Lower band: Pods with none.
// Both bands must fit between the panel bottom and the 624 floor.
const POD_H = 80, BAND_LABEL_DY = 16;
const OWN_Y = PANEL_B + 14, OWN_H = 150;
const BUS_Y = OWN_Y + 28;                                // above the Pod tops
const OWN_POD_Y = OWN_Y + 62;
const UNOWN_Y = OWN_Y + OWN_H + 12, UNOWN_H = 112;
const UNOWN_POD_Y = UNOWN_Y + 24;

// Three slots for the desired count, the fourth PAST the mark so a surplus replica is over a line.
const SLOT_W = 216, SLOT_GAP = 30, MARK_GAP = 54, SLOT_PAD = 24;
const SLOT_L = WL.L + SLOT_PAD;
const MARK_X = SLOT_L + 2 * (SLOT_W + SLOT_GAP) + SLOT_W + MARK_GAP;
const SLOT_X = i => (i < 3 ? SLOT_L + i * (SLOT_W + SLOT_GAP) : MARK_X + MARK_GAP);
const SLOT_CX = i => SLOT_X(i) + SLOT_W / 2;
const SLOT_INNER_DX = 26;
const POD_INNER = { dy: 22, h: 40 };

// The rule starts below the bus so the two never cross.
const MARK_TOP = BUS_Y + 14, MARK_BOTTOM = OWN_Y + OWN_H - 4;
const MARK_W = 2;

// The tap IS the ownerReference: drawn for an owned Pod, absent for an unowned one.
const TRUNK = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y]];
// Split at the third slot: the tail lives and dies with the surplus slot.
const BUS = [[SLOT_CX(0), BUS_Y], [SLOT_CX(2), BUS_Y]];
const BUS_TAIL = [[SLOT_CX(2), BUS_Y], [SLOT_CX(3), BUS_Y]];
const TAP = i => [[SLOT_CX(i), BUS_Y], [SLOT_CX(i), OWN_POD_Y]];
const LANE = i => [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y], [SLOT_CX(i), BUS_Y], [SLOT_CX(i), OWN_POD_Y]];

// A lane, not a relation, because a ball rides it (A-06). No marker: the arrowhead belongs on the tap (A-05).
const trunkPath = (key, points) => P.lane({
  key, points, dim: true, dashed: true, role: 'cluster',
  tune: (el) => el.removeAttribute('marker-end'),
});

// A fill-less dashed boundary plus caption. Not a node(): where these Pods run is not in this story.
const band = (y, h, caption, opacity) => P.raw({
  make: () => {
    const grp = g({ class: 'scheme-ns', transform: `translate(${WL.L},${y})` });
    const r = rect({ class: 'scheme-ns-rect', x: 0, y: 0, width: WL.W, height: h, rx: 8 });
    r.style.fill = 'none';
    r.style.stroke = 'var(--workloads-color)';
    r.style.strokeOpacity = String(opacity);
    r.style.strokeDasharray = '4 4';
    grp.appendChild(r);
    grp.appendChild(text({ class: 'scheme-label code dim', x: 14, y: BAND_LABEL_DY, 'text-anchor': 'start' }, [caption]));
    return grp;
  },
});

// Not a box(): the geometry probe would score it as a block. P.raw bypasses the kit, so paint is by hand.
const markRule = () => P.raw({
  make: () => {
    const grp = g({ class: 'scheme-mark' });
    const r = rect({ x: MARK_X - MARK_W / 2, y: MARK_TOP, width: MARK_W, height: MARK_BOTTOM - MARK_TOP, rx: 1 });
    r.style.fill = 'var(--workloads-color)';
    r.style.fillOpacity = '0.85';
    grp.appendChild(r);
    return grp;
  },
});

const POD_NAMES = ['web-a1', 'web-b2', 'web-c3', 'web-d4'];

// Parts order is z-order: bands, lanes, packets, then Pods and actors so a ball runs under the bodies.
export const SCENE = {
  'aria-label': 'ReplicaSet controller: Pods it owns through ownerReferences sit in the owned band against a mark at spec.replicas, the reconcile loop creates when the band falls short of the mark and deletes when it runs past it, a matching Pod with no controller owner is adopted up out of the unowned band, and a relabelled Pod is released down into it',
  parts: [
    P.defs(),
    band(OWN_Y, OWN_H, 'owned · metadata.ownerReferences points at this ReplicaSet', 0.55),
    band(UNOWN_Y, UNOWN_H, 'unowned · no controller ownerReference, no owner recreates it', 0.3),
    markRule(),
    P.tag({ x: MARK_X, y: OWN_Y + BAND_LABEL_DY, text: 'spec.replicas = 3' }),
    P.arrow({ x1: RS_X + RS_W, y1: REQ_Y, x2: API_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: API_X, y1: RESP_Y, x2: RS_X + RS_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    P.chip({ key: 'selChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'selector', value: 'matchLabels app=web' }),
    P.chip({ key: 'ownChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'ownerReferences', value: 'controller=true' }),
    P.chip({ key: 'actChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'reconcile', value: 'in sync' }),
    trunkPath('trunk', TRUNK),
    trunkPath('bus', BUS),
    trunkPath('busTail', BUS_TAIL),
    ...[0, 1, 2, 3].map(i => P.lane({ key: `tap${i + 1}`, points: TAP(i), dim: true, dashed: true, role: 'cluster' })),
    P.packets(),
    ...POD_NAMES.map((name, i) => P.pod({
      key: `pod${i + 1}`, id: `pod${i + 1}`, innerKey: `pod${i + 1}Box`,
      x: SLOT_X(i), y: OWN_POD_Y, w: SLOT_W, h: POD_H, label: name, sublabel: '', containers: 0,
      opacity: i === 3 ? 0 : undefined,
      inner: { dx: SLOT_INNER_DX, dy: POD_INNER.dy, w: SLOT_W - SLOT_INNER_DX * 2, h: POD_INNER.h, label: 'app=web', sublabel: 'owner: rs' },
    })),
    // The replacement after a release is a different Pod, so it is its own element in the freed slot.
    P.pod({
      key: 'repl', id: 'repl', innerKey: 'replBox',
      x: SLOT_X(2), y: OWN_POD_Y, w: SLOT_W, h: POD_H, label: 'web-e5', sublabel: '', containers: 0, opacity: 0,
      inner: { dx: SLOT_INNER_DX, dy: POD_INNER.dy, w: SLOT_W - SLOT_INNER_DX * 2, h: POD_INNER.h, label: 'app=web', sublabel: 'owner: rs' },
    }),
    // Each directly under the owned slot it crosses to or from, so the crossing reads vertical.
    P.pod({
      key: 'free3', id: 'free3', innerKey: 'free3Box',
      x: SLOT_X(2), y: UNOWN_POD_Y, w: SLOT_W, h: POD_H, label: 'web-c3', sublabel: '', containers: 0, opacity: 0,
      inner: { dx: SLOT_INNER_DX, dy: POD_INNER.dy, w: SLOT_W - SLOT_INNER_DX * 2, h: POD_INNER.h, label: 'app=debug', sublabel: 'owner: none' },
    }),
    P.pod({
      key: 'free4', id: 'free4', innerKey: 'free4Box',
      x: SLOT_X(3), y: UNOWN_POD_Y, w: SLOT_W, h: POD_H, label: 'web-d4', sublabel: '', containers: 0, opacity: 0,
      inner: { dx: SLOT_INNER_DX, dy: POD_INNER.dy, w: SLOT_W - SLOT_INNER_DX * 2, h: POD_INNER.h, label: 'app=web', sublabel: 'owner: none' },
    }),
    P.box({ key: 'api', x: API_X, y: WL.TOP_Y, w: API_W, h: WL.BOX_H, label: 'API', sublabel: 'Pod create · delete · patch', role: 'cluster' }),
    P.box({ key: 'rs', x: RS_X, y: WL.TOP_Y, w: RS_W, h: WL.BOX_H, label: 'ReplicaSet', sublabel: 'standalone · no Deployment', role: 'cluster' }),
  ],
  reset: {
    keys: ['rs', 'api', 'selChip', 'ownChip', 'actChip', 'pod1Box', 'pod2Box', 'pod3Box', 'pod4Box', 'replBox', 'free3Box', 'free4Box'],
    pods: ['pod1', 'pod2', 'pod3', 'pod4', 'repl', 'free3', 'free4'],
  },
};

// Writes presence, labels and tap together for both bands so no step can move one without the others.
// The surplus slot's bus tail goes with its tap.
const bands = (row, free = {}) => {
  const labels = {}, sublabels = {}, opacity = { repl: 0, free3: 0, free4: 0, ...free };
  row.forEach((v, i) => {
    const n = i + 1;
    if (v.label !== undefined) labels[`pod${n}Box`] = v.label;
    if (v.sub !== undefined) sublabels[`pod${n}Box`] = v.sub;
    if (v.opacity !== undefined) opacity[`pod${n}`] = v.opacity;
    if (v.tap !== undefined) {
      opacity[`tap${n}`] = v.tap;
      if (n === 4) opacity.busTail = v.tap;
    }
  });
  return { labels, sublabels, opacity };
};
// A Pod materialising on an arrival: FADE.in reads as a wait once the ball has landed.
const LAND_MS = 260;

const OWNED = { label: 'app=web', sub: 'owner: rs', opacity: 1, tap: 1 };
const EMPTY = { opacity: 0, tap: 0 };
const THREE = [OWNED, OWNED, OWNED];
// The third slot after `orphan`: the tap belongs to the replacement now.
const RELEASED = { label: 'app=debug', sub: 'released · no owner', opacity: 0, tap: 1 };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { selChip: 'matchLabels app=web', ownChip: 'controller=true', actChip: 'in sync' },
    ...bands([...THREE, EMPTY]),
  },
  {
    id: 'own',
    duration: 4800,
    narration: 'Every Pod the ReplicaSet manages carries a metadata.ownerReferences entry pointing back to it, with controller set to true. Those are the links drawn into the owned band, and they are what lets garbage collection remove the Pods when the ReplicaSet is deleted. This ReplicaSet is standalone: no Deployment owns it, so you scale it by editing its own spec.replicas, and it is what actually creates and deletes the Pods. One owned by a Deployment also selects on a pod-template-hash label.',
    chips: { selChip: 'matchLabels app=web', ownChip: 'controller=true', actChip: 'in sync' },
    wires: { req: 'ownerReferences · controller=true · standalone RS → Pod' },
    ...bands([...THREE, EMPTY]),
    lit: ['rs', 'ownChip'],
    flow: [0, 1, 2].flatMap(i => [
      F.route({ points: LANE(i), delay: BEAT.lead, pulse: `pod${i + 1}` }),
    ]),
  },
  {
    id: 'reconcile',
    duration: 4500,
    narration: 'The controller runs a continuous reconcile loop. On every relevant change it compares the desired count against the Pods it owns and acts only on the difference. The mark on the band is spec.replicas, so a set that ends exactly on the mark needs nothing done. Because the loop is level-triggered it works off the current observed state rather than off one-time events, so a missed event or a controller restart still converges to the same result.',
    chips: { selChip: 'matchLabels app=web', ownChip: 'controller=true', actChip: 'balanced · no-op' },
    wires: { req: 'watch owned Pods · count meets the mark · no-op' },
    ...bands([...THREE, EMPTY]),
    lit: ['rs', 'actChip'],
  },
  {
    id: 'self-heal',
    duration: 4700,
    narration: 'One Pod is lost: it was deleted, or its Node failed and the Pod was evicted once its default 300 second toleration ran out. A Pod being deleted no longer counts, so the owned band falls to two and a gap opens before the mark, and the controller creates a replacement to close it. It learns of the loss through its Pod watch and acts on the difference, not on the event. This self-healing is the whole point of a controller. A bare Pod created on its own has no owner watching it, so once gone it stays gone.',
    chips: { selChip: 'matchLabels app=web', ownChip: 'controller=true', actChip: 'create +1' },
    wires: { req: 'owned count below the mark · create replacement Pod' },
    ...bands([...THREE, EMPTY]),
    // The API sends the watch event, so it is lit at entry (M-18a).
    lit: ['api', 'actChip'],
    reducedLit: ['pod2Box'],
    rewind: { chips: { actChip: 'balanced · no-op' }, wires: { req: '' } },
    flow: [
      // The tap goes with the Pod: an ownerReference to a Pod that is gone is not a link.
      F.fade({ target: 'pod2', from: 1, to: 0, dur: FADE.out, delay: 0, fill: 'forwards', easing: 'ease-in' }),
      F.fade({ target: 'tap2', from: 1, to: 0, dur: FADE.out, delay: 0, fill: 'forwards', easing: 'ease-in' }),
      F.top({ from: API_X, to: RS_X + RS_W, y: RESP_Y, delay: FADE.out + BEAT.afterHop, name: 'watch', lights: ['rs'] }),
      F.set({ at: 'watch', chips: { actChip: 'create +1' }, wires: { req: 'owned count below the mark · create replacement Pod' } }),
      F.top({ from: RS_X + RS_W, to: API_X, y: REQ_Y, after: 'watch', name: 'req', lights: ['api'] }),
      F.route({ points: LANE(1), after: 'req', name: 'create' }),
      // `forwards`, not `both`: a backwards fill would hold 0 from step entry and cut the loss fade.
      F.fade({ target: 'pod2', from: 0, to: 1, dur: LAND_MS, at: 'create', fill: 'forwards', easing: 'ease-out' }),
      F.fade({ target: 'tap2', from: 0, to: 1, dur: LAND_MS, at: 'create', fill: 'forwards', easing: 'ease-out' }),
      F.pulse({ pod: 'pod2', at: 'create' }),
    ],
  },
  {
    id: 'adopt',
    duration: 4400,
    narration: 'A standalone Pod is already running with the label app=web and no controller ownerReference, which is what the unowned band holds. The ReplicaSet matches Pods by selector and not by who created them, so it adopts this one: it PATCHes metadata.ownerReferences to point at itself. The Pod was already running, adoption only restamps its owner, and it crosses up into the owned band past the mark as a fourth replica.',
    chips: { selChip: 'matchLabels app=web', ownChip: 'PATCH · owner set', actChip: 'adopt +1' },
    wires: { req: 'PATCH ownerReferences · adopt web-d4 (app=web)' },
    ...bands([...THREE, OWNED]),
    lit: ['rs', 'ownChip', 'actChip'],
    reducedLit: ['pod4Box'],
    // The bus tail stays on: the claim rides it.
    rewind: {
      opacity: { pod4: 0, tap4: 0, free4: OPACITY.notready, busTail: 1 },
      chips: { ownChip: 'controller=true', actChip: 'create +1' }, wires: { req: '' },
    },
    flow: [
      // Adoption is a change of owner, not a birth: the Pod is on screen in one band or the other throughout.
      F.fade({ target: 'free4', from: 0, to: OPACITY.notready, dur: FADE.in, delay: 0, fill: 'both', easing: 'ease-out' }),
      F.set({ delay: FADE.in + BEAT.afterHop, chips: { actChip: 'adopt +1' }, wires: { req: 'PATCH ownerReferences · adopt web-d4 (app=web)' } }),
      F.top({ from: RS_X + RS_W, to: API_X, y: REQ_Y, delay: FADE.in + BEAT.afterHop, name: 'patch', lights: ['api'] }),
      F.route({ points: LANE(3), after: 'patch', name: 'join' }),
      F.set({ at: 'join', chips: { ownChip: 'PATCH · owner set' } }),
      F.fade({ target: 'pod4', from: 0, to: 1, dur: LAND_MS, at: 'join', fill: 'both', easing: 'ease-out' }),
      F.fade({ target: 'tap4', from: 0, to: 1, dur: LAND_MS, at: 'join', fill: 'both', easing: 'ease-out' }),
      F.fade({ target: 'free4', from: OPACITY.notready, to: 0, dur: LAND_MS, at: 'join', fill: 'both', easing: 'ease-in' }),
      F.pulse({ pod: 'pod4', at: 'join' }),
    ],
  },
  {
    id: 'converge',
    duration: 4300,
    narration: 'Adoption pushed the owned count to four, one past the mark. The same reconcile loop now deletes a Pod to return to exactly three. A ReplicaSet never settles above its desired count, no matter where the extra Pod came from. Picking the victim prefers pending and unschedulable Pods, then the lowest controller.kubernetes.io/pod-deletion-cost, and that ordering is best effort rather than a guarantee.',
    chips: { selChip: 'matchLabels app=web', ownChip: 'controller=true', actChip: 'delete -1' },
    wires: { req: 'owned count past the mark · DELETE surplus Pod' },
    ...bands([...THREE, { label: 'app=web', sub: 'surplus · deleting', opacity: 0, tap: 0 }]),
    lit: ['rs', 'actChip'],
    // LANE(3) runs along the bus tail and tap, so both come back for the flight.
    rewind: { opacity: { pod4: 1, tap4: 1, busTail: 1 } },
    flow: [
      F.top({ from: RS_X + RS_W, to: API_X, y: REQ_Y, name: 'del', lights: ['api'] }),
      F.route({ points: LANE(3), after: 'del', name: 'evict', pulse: 'pod4' }),
      // A full BEAT.afterPulse behind the blink, or the dissolve and the pulse read as one event.
      F.fade({ target: 'pod4', from: 1, to: 0, dur: FADE.out, at: 'evict', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'tap4', from: 1, to: 0, dur: FADE.out, at: 'evict', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'busTail', from: 1, to: 0, dur: FADE.out, at: 'evict', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'orphan',
    duration: 3700,
    narration: 'The reverse of adoption. A Pod is relabelled so it no longer matches the selector, here app=web becomes app=debug. The ReplicaSet releases it by removing its ownerReference, and it drops into the unowned band still running. That leaves the owned band short of the mark, so the same loop creates a replacement to close the gap. Labels are the binding: change them and a Pod crosses between the two bands.',
    chips: { selChip: 'matchLabels app=web', ownChip: 'removed · released', actChip: 'release + create' },
    wires: { req: 'remove ownerReference · create replacement' },
    // tap3 stays up: the replacement in the slot owns it now.
    ...bands([OWNED, OWNED, RELEASED, EMPTY], { repl: 1, free3: OPACITY.notready }),
    lit: ['rs', 'ownChip', 'actChip'],
    reducedLit: ['replBox'],
    rewind: {
      opacity: { repl: 0, free3: 0 }, sublabels: { pod3Box: 'owner: rs' },
      chips: { ownChip: 'controller=true', actChip: 'delete -1' }, wires: { req: '' },
    },
    flow: [
      // pod3 drops with no pulse: a blink there reads as a create.
      F.set({ delay: BEAT.lead, chips: { actChip: 'release + create' }, wires: { req: 'remove ownerReference · create replacement' } }),
      F.top({ from: RS_X + RS_W, to: API_X, y: REQ_Y, delay: BEAT.lead, name: 'release', lights: ['api'] }),
      F.set({ at: 'release', chips: { ownChip: 'removed · released' }, sublabels: { pod3Box: 'released · no owner' } }),
      F.fade({ target: 'pod3', from: 1, to: 0, dur: FADE.out, at: 'release', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'tap3', from: 1, to: 0, dur: FADE.out, at: 'release', fill: 'forwards', easing: 'ease-in' }),
      F.fade({ target: 'free3', from: 0, to: OPACITY.notready, dur: FADE.in, at: 'release', fill: 'both', easing: 'ease-out' }),
      F.route({ points: LANE(2), after: 'release', name: 'replace' }),
      F.fade({ target: 'repl', from: 0, to: 1, dur: LAND_MS, at: 'replace', fill: 'both', easing: 'ease-out' }),
      F.fade({ target: 'tap3', from: 0, to: 1, dur: LAND_MS, at: 'replace', fill: 'forwards', easing: 'ease-out' }),
      F.pulse({ pod: 'repl', at: 'replace' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
