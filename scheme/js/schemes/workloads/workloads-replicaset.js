import { P, F, defineCard, laneY, ladder, midX, WL, FADE, BEAT, OPACITY } from './workloads-kit.js';
import { g, rect, text } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/workloads-replicaset.md

// TWO OWNERSHIP BANDS AND A COUNT MARK, not the A / B / C column preset (WL.L-06): this card
// carries no ladder and no flanking chip column, so there are no columns for A / B / C to choose
// between. Panel measured over 1600x1000 / 1280x860 / 1100x800: right edge worst 396.55, bottom
// worst 329.20, both at 1100x800 on the poster frame. PANEL_B rounds that up and the owned band
// clears it by 14.8. The argument for the arrangement is in the record under LAYOUT.
const PANEL_B = 330;

// Band 1: the actor row, the PAIR the exemplar `workloads-pod-startup-conditions` draws, at the
// 232 that is CLU.BOX_W and the width 14 cluster cards share. Same arrangement as well: the left
// box centred on WL.CX, which WL.L-07 needs so the trunk leaves a face MIDPOINT, and the right box
// right-aligned on WL.R where the chip column beneath it also ends.
const RS_W = 232, RS_X = WL.CX - RS_W / 2;               // 484..716, centred on CX for the trunk
const API_W = 232, API_X = WL.R - API_W;                 // 908..1140, right edge on the chip column
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;                  // 80
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(RS_X + RS_W, API_X);                 // 812

// Band 2: three chips in the RIGHT column. They sit ABOVE the panel bottom, which is legal because
// they start at x=660 and the panel never reaches past 397 (L-01, L-03): the free height right of
// the panel is what pays for the two full-width bands below it. THREE and not the family four:
// spec.replicas and the observed count are DRAWN by the mark and the band, and a chip repeating a
// value the instrument already carries is the one way this composition can contradict itself.
const CHIP_X = WL.COL_R.x, CHIP_W = WL.COL_R.w;          // 660..1140
const CHIP_Y = ladder({ y: 150, rowH: WL.CHIP_H, gap: 8 });   // 150 / 192 / 234, ink to 268

// Bands 3 and 4: OWNERSHIP is the axis. A Pod in the upper band carries a controller
// ownerReference back to this ReplicaSet, a Pod in the lower band carries none. Adoption and
// release are then the SAME move in opposite directions, which is what the card is about.
// The whole budget is 294 units, from the deepest panel to the 624 floor, and both bands plus the
// gap between them have to come out of it: 150 + 12 + 112 = 274, with 6 to spare at the bottom.
const POD_H = 80, BAND_LABEL_DY = 16;
const OWN_Y = PANEL_B + 14, OWN_H = 150;                 // 344..494
const BUS_Y = OWN_Y + 28;                                // 372, above the Pod tops
const OWN_POD_Y = OWN_Y + 62;                            // 406..486
const UNOWN_Y = OWN_Y + OWN_H + 12, UNOWN_H = 112;       // 506..618
const UNOWN_POD_Y = UNOWN_Y + 24;                        // 530..610

// Four slots. The first three are the desired count and the fourth sits PAST the mark, so a
// surplus replica is over a line rather than merely fourth in a row. MARK_GAP is doubled around
// the rule so the slot pitch reads as a break and not as a wider gap.
const SLOT_W = 216, SLOT_GAP = 30, MARK_GAP = 54, SLOT_PAD = 24;
const SLOT_L = WL.L + SLOT_PAD;                          // 84
// 846: the desired-count rule, one MARK_GAP past the third slot.
const MARK_X = SLOT_L + 2 * (SLOT_W + SLOT_GAP) + SLOT_W + MARK_GAP;
const SLOT_X = i => (i < 3 ? SLOT_L + i * (SLOT_W + SLOT_GAP) : MARK_X + MARK_GAP);
const SLOT_CX = i => SLOT_X(i) + SLOT_W / 2;             // 192 / 438 / 684 / 1008
const SLOT_INNER_DX = 26;
const POD_INNER = { dy: 22, h: 40 };

// The rule starts BELOW the bus so the two never cross, and its caption sits above the bus on the
// band label baseline. Mark and caption share MARK_X, so the caption names the line under it.
const MARK_TOP = BUS_Y + 14, MARK_BOTTOM = OWN_Y + OWN_H - 4;   // 386..490
const MARK_W = 2;

// One trunk out of the ReplicaSet, a bus above the owned row, and one tap per slot. THE TAP IS THE
// OWNERREFERENCE: it is drawn for an owned Pod and absent for an unowned one, which is the whole
// reason ownership needed a device of its own rather than a third sublabel string.
const TRUNK = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y]];
// The bus is split at the third slot: the tail beyond it serves the surplus slot alone, which is
// empty on four of the seven steps, and a segment hanging over an empty slot points at nothing.
const BUS = [[SLOT_CX(0), BUS_Y], [SLOT_CX(2), BUS_Y]];
const BUS_TAIL = [[SLOT_CX(2), BUS_Y], [SLOT_CX(3), BUS_Y]];
const TAP = i => [[SLOT_CX(i), BUS_Y], [SLOT_CX(i), OWN_POD_Y]];
const LANE = i => [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y], [SLOT_CX(i), BUS_Y], [SLOT_CX(i), OWN_POD_Y]];

// A trunk or bus segment CARRIES the ball on every animated step, so it is a LANE and not a
// relation (A-06), and `tune` drops the marker because the arrowhead belongs on the tap that lands
// on a Pod (A-05, the qos model). `relationPath` paints at stroke-opacity 0.45, which is right for
// a line nothing rides and reads half-dark beside the taps and the actor arrows, which do not.
const trunkPath = (key, points) => P.lane({
  key, points, dim: true, dashed: true, role: 'cluster',
  tune: (el) => el.removeAttribute('marker-end'),
});

// A band is a naked dashed rect plus its caption, grouped so it reads as one region. No part kind
// builds a fill-less boundary, and a node() here would draw a Node: where these Pods run is not in
// this story, and a frame saying otherwise is the block T-21 has nothing to say about.
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

// The desired-count rule: a 2 unit bar, not a box() and not an arrow(). A box would be scored as a
// block by the geometry probe and as a body by CENTRE, and a graduation is neither. P.raw bypasses
// the kit binding, so the paint is written by hand.
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

// Slot names are stable identities. The inner box carries the label the SELECTOR matches on and the
// ownership state, which are the two facts that decide which band a Pod belongs in.
const POD_NAMES = ['web-a1', 'web-b2', 'web-c3', 'web-d4'];

// Z-order: the bands are boundaries and go under everything, the bus and the taps ride above them,
// then the packet layer, then the Pods and the actor row so a ball runs UNDER the bodies.
export const SCENE = {
  'aria-label': 'ReplicaSet controller: Pods it owns through ownerReferences sit in the owned band against a mark at spec.replicas, the reconcile loop creates when the band falls short of the mark and deletes when it runs past it, a matching Pod with no owner is adopted up out of the unowned band, and a relabelled Pod is released down into it',
  parts: [
    P.defs(),
    band(OWN_Y, OWN_H, 'owned · metadata.ownerReferences points at this ReplicaSet', 0.55),
    band(UNOWN_Y, UNOWN_H, 'unowned · no controller ownerReference, nothing is watching', 0.3),
    markRule(),
    P.tag({ x: MARK_X, y: OWN_Y + BAND_LABEL_DY, text: 'spec.replicas = 3' }),
    P.arrow({ x1: RS_X + RS_W, y1: REQ_Y, x2: API_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: API_X, y1: RESP_Y, x2: RS_X + RS_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    P.chip({ key: 'selChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'selector', value: 'matchLabels app=web' }),
    P.chip({ key: 'ownChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'ownerReferences', value: 'controller=true' }),
    P.chip({ key: 'actChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'reconcile', value: 'in sync' }),
    trunkPath('trunk', TRUNK),
    trunkPath('bus', BUS),
    trunkPath('busTail', BUS_TAIL),
    ...[0, 1, 2, 3].map(i => P.lane({ key: `tap${i + 1}`, points: TAP(i), dim: true, dashed: true, role: 'cluster' })),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    ...POD_NAMES.map((name, i) => P.pod({
      key: `pod${i + 1}`, id: `pod${i + 1}`, innerKey: `pod${i + 1}Box`,
      x: SLOT_X(i), y: OWN_POD_Y, w: SLOT_W, h: POD_H, label: name, sublabel: '', containers: 0,
      opacity: i === 3 ? 0 : undefined,
      inner: { dx: SLOT_INNER_DX, dy: POD_INNER.dy, w: SLOT_W - SLOT_INNER_DX * 2, h: POD_INNER.h, label: 'app=web', sublabel: 'owner: rs' },
    })),
    // The replacement the loop creates after a release is a DIFFERENT Pod, so it is its own element
    // stacked in the freed slot rather than the released one relabelled back: one name cannot
    // stand in both bands at once, and reusing `pod3` put web-c3 in each of them.
    P.pod({
      key: 'repl', id: 'repl', innerKey: 'replBox',
      x: SLOT_X(2), y: OWN_POD_Y, w: SLOT_W, h: POD_H, label: 'web-e5', sublabel: '', containers: 0, opacity: 0,
      inner: { dx: SLOT_INNER_DX, dy: POD_INNER.dy, w: SLOT_W - SLOT_INNER_DX * 2, h: POD_INNER.h, label: 'app=web', sublabel: 'owner: rs' },
    }),
    // The unowned band holds the two Pods that cross it, each directly UNDER the owned slot it
    // crosses to or from, so the crossing reads as vertical rather than as a delete and a create.
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
    P.box({ key: 'rs', x: RS_X, y: WL.TOP_Y, w: RS_W, h: WL.BOX_H, label: 'ReplicaSet', sublabel: 'owned by Deployment web', role: 'cluster' }),
  ],
  reset: {
    keys: ['rs', 'api', 'selChip', 'ownChip', 'actChip', 'pod1Box', 'pod2Box', 'pod3Box', 'pod4Box', 'replBox', 'free3Box', 'free4Box'],
    pods: ['pod1', 'pod2', 'pod3', 'pod4', 'repl', 'free3', 'free4'],
  },
};

// A slot is THREE facts at once: whether the Pod is there, what the selector sees on it, and
// whether the ownerReference tap is drawn. One helper writes all three for BOTH bands, because a
// step that moved one of them and not the others is exactly the contradiction this composition
// exists to prevent. The surplus slot owns the bus tail as well, which goes WITH its tap.
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
// A Pod materialising ON an arrival takes this and not FADE.in, whose 600 reads as a wait once
// the ball has landed. The MOTION block of the record has the reading, for all five sites.
const LAND_MS = 260;

// A managed replica, and the surplus slot when nothing is standing in it. A Pod in the unowned
// band is alive and outside this controller path, which is what OPACITY.notready means, so it is
// never drawn at full strength and the default for both of them is absent.
const OWNED = { label: 'app=web', sub: 'owner: rs', opacity: 1, tap: 1 };
const EMPTY = { opacity: 0, tap: 0 };
const THREE = [OWNED, OWNED, OWNED];
// The third slot at the end of `orphan`: the Pod is gone from the band and the tap it left behind
// belongs to the replacement standing in its place.
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
    duration: 3700,
    narration: 'Every Pod the ReplicaSet manages carries a metadata.ownerReferences entry pointing back to it, with controller set to true. Those are the links drawn into the owned band, and they are what lets garbage collection remove the Pods when the ReplicaSet is deleted. The ownership is a chain: a Deployment owns this ReplicaSet, and the ReplicaSet owns the Pods. You scale the Deployment, it updates spec.replicas on the ReplicaSet, and the ReplicaSet is what actually creates and deletes Pods.',
    chips: { selChip: 'matchLabels app=web', ownChip: 'controller=true', actChip: 'in sync' },
    wires: { req: 'ownerReferences · controller=true · Deployment → RS → Pod' },
    ...bands([...THREE, EMPTY]),
    lit: ['rs', 'ownChip'],
    // One ball down each tap: the ownerReference is a link the controller holds, and the three
    // Pods pulse on arrival to say the link is theirs.
    flow: [0, 1, 2].flatMap(i => [
      F.route({ points: LANE(i), delay: BEAT.lead, name: `decl${i}` }),
      F.pulse({ pod: `pod${i + 1}`, at: `decl${i}` }),
    ]),
  },
  {
    id: 'reconcile',
    // No motion at all, so the duration IS the reading time, and 446 characters want the catalog
    // median of 10.18 ms/char. At 2000 this was the 4th most hurried step in the catalog.
    duration: 4500,
    narration: 'The controller runs a continuous reconcile loop. On every relevant change it compares the desired count against the Pods it owns and acts only on the difference. The mark on the band is spec.replicas, so a set that ends exactly on the mark needs nothing done. Because the loop is level-triggered it works off the current observed state rather than off one-time events, so a missed event or a controller restart still converges to the same result.',
    chips: { selChip: 'matchLabels app=web', ownChip: 'controller=true', actChip: 'balanced · no-op' },
    wires: { req: 'watch owned Pods · count meets the mark · no-op' },
    ...bands([...THREE, EMPTY]),
    lit: ['rs', 'actChip'],
    // No packet moves on a no-op reconcile and no Pod is touched: the band already ends on the
    // mark, which is the whole statement of the step.
  },
  {
    id: 'self-heal',
    // Motion: the Pod fade (700) plus a beat, the watch event in (700), the create out (700), then
    // the new Pod down the lane and its arrival pulse. The watch hop cost 800 of it.
    duration: 4700,
    narration: 'One Pod is lost, its Node failed or the Pod was deleted. The owned band falls to two and a gap opens before the mark, so the controller creates a replacement to close it. It learns of the loss through its Pod watch and acts on the difference, not on the event. This self-healing is the whole point of a controller. A bare Pod created on its own has no owner watching it, so once gone it stays gone.',
    chips: { selChip: 'matchLabels app=web', ownChip: 'controller=true', actChip: 'create +1' },
    wires: { req: 'owned count below the mark · create Pod web-b2' },
    ...bands([...THREE, EMPTY]),
    // The API ACTS FIRST here, sending the watch event, so it is lit at entry: a ball leaving a
    // dark block is `report:arrival/R4` (M-18a), and the ReplicaSet stays dark until it arrives.
    lit: ['api', 'actChip'],
    // The animated path says the replacement landed by PULSING it, which no lights list can name:
    // the static path has to say it with the inner box instead.
    reducedLit: ['pod2Box'],
    // The decision and the request it sends are made when the watch lands, so both wait for it.
    rewind: { chips: { actChip: 'balanced · no-op' }, wires: { req: '' } },
    flow: [
      // The loss reaches the controller as a watch event down the answer lane, so the ReplicaSet is
      // dark until that lands: it acts on what it RECEIVES. Only then does the create go out. The
      // tap goes with the Pod, because an ownerReference to a Pod that is gone is not a link.
      F.fade({ target: 'pod2', from: 1, to: 0, dur: FADE.out, delay: 0, fill: 'forwards', easing: 'ease-in' }),
      F.fade({ target: 'tap2', from: 1, to: 0, dur: FADE.out, delay: 0, fill: 'forwards', easing: 'ease-in' }),
      F.top({ from: API_X, to: RS_X + RS_W, y: RESP_Y, delay: FADE.out + BEAT.afterHop, name: 'watch', lights: ['rs'] }),
      F.set({ at: 'watch', chips: { actChip: 'create +1' }, wires: { req: 'owned count below the mark · create Pod web-b2' } }),
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
    // Motion: the orphan surfaces in the unowned band (600), the PATCH leaves a beat later and
    // lands at 1400, the claim rides to 2902 and the arrival pulse closes at 3802.
    duration: 4400,
    narration: 'A standalone Pod is already running with the label app=web and no controller ownerReference, which is what the unowned band holds. The ReplicaSet matches Pods by selector and not by who created them, so it adopts this one: it PATCHes metadata.ownerReferences to point at itself. The Pod was already running, adoption only restamps its owner, and it crosses up into the owned band past the mark as a fourth replica.',
    chips: { selChip: 'matchLabels app=web', ownChip: 'PATCH · owner set', actChip: 'adopt +1' },
    wires: { req: 'PATCH ownerReferences · adopt web-d4 (app=web)' },
    ...bands([...THREE, OWNED]),
    lit: ['rs', 'ownChip', 'actChip'],
    reducedLit: ['pod4Box'],
    // The orphan is NOT created by the ReplicaSet, so it winds back to the unowned band and the
    // surplus slot winds back to empty. The bus tail stays ON: the claim rides it.
    // The decision turns over as the PATCH leaves, and the owner field when the claim lands.
    rewind: {
      opacity: { pod4: 0, tap4: 0, free4: OPACITY.notready, busTail: 1 },
      chips: { ownChip: 'controller=true', actChip: 'create +1' }, wires: { req: '' },
    },
    flow: [
      // ADOPTION IS A CHANGE OF OWNER, NOT A BIRTH. The Pod surfaces in the UNOWNED band first, at
      // OPACITY.notready, which is the shade for alive but outside this path. Only then does the
      // ReplicaSet see a selector match and PATCH, and the crossing is a handover between the two
      // bands rather than a fade from nothing: the Pod is on screen for the whole step.
      F.fade({ target: 'free4', from: 0, to: OPACITY.notready, dur: FADE.in, delay: 0, fill: 'both', easing: 'ease-out' }),
      F.set({ delay: FADE.in + BEAT.afterHop, chips: { actChip: 'adopt +1' }, wires: { req: 'PATCH ownerReferences · adopt web-d4 (app=web)' } }),
      F.top({ from: RS_X + RS_W, to: API_X, y: REQ_Y, delay: FADE.in + BEAT.afterHop, name: 'patch', lights: ['api'] }),
      F.route({ points: LANE(3), after: 'patch', name: 'join' }),
      F.set({ at: 'join', chips: { ownChip: 'PATCH · owner set' } }),
      // The two halves of the crossing land on ONE beat, and the tap arrives with them: the owner
      // link is what the whole step bought.
      F.fade({ target: 'pod4', from: 0, to: 1, dur: LAND_MS, at: 'join', fill: 'both', easing: 'ease-out' }),
      F.fade({ target: 'tap4', from: 0, to: 1, dur: LAND_MS, at: 'join', fill: 'both', easing: 'ease-out' }),
      F.fade({ target: 'free4', from: OPACITY.notready, to: 0, dur: LAND_MS, at: 'join', fill: 'both', easing: 'ease-in' }),
      F.pulse({ pod: 'pod4', at: 'join' }),
    ],
  },
  {
    id: 'converge',
    // The dissolve waits a full BEAT.afterPulse behind the blink: run together the Pod reaches 0
    // at 3002 with 200ms of its own pulse still to go, and the two read as one event.
    duration: 3900,
    narration: 'Adoption pushed the owned count to four, one past the mark. The same reconcile loop now deletes a Pod to return to exactly three. A ReplicaSet never settles above its desired count, no matter where the extra Pod came from. Picking the victim prefers pending and unschedulable Pods, then the lowest controller.kubernetes.io/pod-deletion-cost, and that ordering is best effort rather than a guarantee.',
    chips: { selChip: 'matchLabels app=web', ownChip: 'controller=true', actChip: 'delete -1' },
    wires: { req: 'owned count past the mark · DELETE surplus Pod' },
    ...bands([...THREE, { label: 'app=web', sub: 'surplus · deleting', opacity: 0, tap: 0 }]),
    lit: ['rs', 'actChip'],
    // The whole surplus slot comes back for the flight, bus tail and tap included: LANE(3) runs
    // along both, so restoring the Pod alone leaves the last legs of the ball on blank canvas.
    rewind: { opacity: { pod4: 1, tap4: 1, busTail: 1 } },
    flow: [
      F.top({ from: RS_X + RS_W, to: API_X, y: REQ_Y, name: 'del', lights: ['api'] }),
      F.route({ points: LANE(3), after: 'del', name: 'evict' }),
      F.pulse({ pod: 'pod4', at: 'evict' }),
      // Pod, tap and tail leave on one beat, a pulse behind the arrival that earned it.
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
    // web-e5 in the freed slot and web-c3 alive below it, which is the whole point: releasing a
    // Pod does not stop it. pod3 ends absent with its box left reading app=debug, the label that
    // put it there, and tap3 stays UP because the replacement standing in the slot owns it now.
    ...bands([OWNED, OWNED, RELEASED, EMPTY], { repl: 1, free3: OPACITY.notready }),
    lit: ['rs', 'ownChip', 'actChip'],
    reducedLit: ['replBox'],
    // Relabelled but still owned until the release lands: the decision waits for the PATCH to leave.
    rewind: {
      opacity: { repl: 0, free3: 0 }, sublabels: { pod3Box: 'owner: rs' },
      chips: { ownChip: 'controller=true', actChip: 'delete -1' }, wires: { req: '' },
    },
    flow: [
      // The relabel is done to the Pod from OUTSIDE, so it is true at entry and the ReplicaSet acts
      // on it first. pod3 drops with no pulse once released: a blink there reads as a create.
      F.set({ delay: BEAT.lead, chips: { actChip: 'release + create' }, wires: { req: 'remove ownerReference · create replacement' } }),
      F.top({ from: RS_X + RS_W, to: API_X, y: REQ_Y, delay: BEAT.lead, name: 'release', lights: ['api'] }),
      F.set({ at: 'release', chips: { ownChip: 'removed · released' }, sublabels: { pod3Box: 'released · no owner' } }),
      F.fade({ target: 'pod3', from: 1, to: 0, dur: FADE.out, at: 'release', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'tap3', from: 1, to: 0, dur: FADE.out, at: 'release', fill: 'forwards', easing: 'ease-in' }),
      F.fade({ target: 'free3', from: 0, to: OPACITY.notready, dur: FADE.in, at: 'release', fill: 'both', easing: 'ease-out' }),
      F.route({ points: LANE(2), after: 'release', name: 'replace' }),
      // A DIFFERENT Pod stands in the freed slot, and the tap comes back with it: the slot is a
      // position in the count, and what fills it is new.
      F.fade({ target: 'repl', from: 0, to: 1, dur: LAND_MS, at: 'replace', fill: 'both', easing: 'ease-out' }),
      F.fade({ target: 'tap3', from: 0, to: 1, dur: LAND_MS, at: 'replace', fill: 'forwards', easing: 'ease-out' }),
      F.pulse({ pod: 'repl', at: 'replace' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
