import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// Four phases, not five. k8s.io/api/core/v1 also defines VolumePending ("used for PersistentVolumes
// that are not available"), so the API type has five constants, but the upstream Phase docs list only
// Available, Bound, Released and Failed, and Pending is not something a PV is observed sitting in on
// a modern cluster. The card teaches the documented four and the narration is worded to say the
// lifecycle runs through them, never that the status field can hold only these. Do not "complete" the
// row with a fifth box.
//
// Reclaim policy defaults are per-origin and the narration says so explicitly: Delete is the default
// for dynamically provisioned volumes, Retain for a PV created by hand. An earlier cut called Delete
// "the default" flat out, which is only half true.
//
// Layout (viewBox 1200x640). This card is the one genuine state machine in the storage family, so the
// middle band is a ROW of the four phases a PV status field can hold, with exactly one lit at a time.
// The row is the BOARD, not the object: the phases are places, and the volume is whichever place is
// currently lit. That distinction is what lets the card show the Delete outcome honestly, because a
// deleted PV does not move to some final phase, it leaves the board and every box goes dark.
//
// Actors that DRIVE transitions sit above the row, and the one actor that drives the single backward
// edge sits below it. Each transition is a real event, so it is drawn as a lane that CARRIES a ball
// when it fires. There is no Pod anywhere in this card, so nothing pulses: boxes light, and the one
// packet-less step is allowed a box flash.
//
// Two rules govern that light:
//   1. A box is lit at step entry ONLY if a ball departs from it. Every box a ball arrives at starts
//      the step looking ordinary and earns its highlight at the moment of arrival (lightBoxAt at
//      pkt.arrivalMs), with no pulse. Once lit, nothing goes dark again until the step boundary, so
//      by the end of a transition both of its ends are lit. Pre-lighting a destination is the single
//      easiest way to ruin one of these steps: it answers the question before the ball that carries
//      the answer has arrived, and the arrival then registers as nothing at all.
//   2. Chips light on the step their value CHANGES, which is how the reader sees the phase field flip
//      rather than having to remember what it said one step ago.
//
// Deliberately NOT drawn: the backing disk. Every other storage card puts a cylinder on a bottom
// shelf, and this one does not, because its subject is the phase field of the API object rather than
// the bytes behind it. What happens to the real storage asset under each reclaim policy is the whole
// subject of storage-reclaim-policy, which draws the disks properly and in both branches. Adding a
// cylinder here would either duplicate that card or, worse, need a spine that the backward edge below
// the row would have to cross.
//
// ---- Horizontal composition ----
// The row is centered on the CANVAS at 600, and every other x is derived from it rather than typed by
// hand. One pitch governs the whole card: PITCH 224, which is the phase box width 164 plus the 60px
// gap that each forward transition lane lives in. Four phases at that pitch put their centers at
// 264 / 488 / 712 / 936, so the row spans 182..1018 and its midpoint is exactly 600.
//
// The two top actors reuse that same grid: the claim sits at 488, dead above Bound, which is the
// phase it puts the volume into, and the PV controller sits at 712, dead above Released, which is the
// only phase it ever acts on. So the controller lane is a straight vertical drop with no dog-leg at
// all. Their band spans 400..800, which is centered on 600 as well, so the pair reads as concentric
// with the wider row beneath it rather than as two boxes parked somewhere above it.
const PITCH = 224;
const ST_W = 164, GAP = PITCH - ST_W;                          // 164 / 60
const AVAIL_CX = 264, BOUND_CX = AVAIL_CX + PITCH;             // 264 / 488
const RELEASED_CX = BOUND_CX + PITCH, FAILED_CX = RELEASED_CX + PITCH;  // 712 / 936
const stX = cx => cx - ST_W / 2;                               // 182 / 406 / 630 / 854

// ---- Vertical rhythm ----
// A centered four-phase row cannot dodge the narration overlay horizontally, because staying centered
// on 600 is the whole point and its leftmost box lands at x=182, deep inside the overlay column. So
// the ROW dodges it vertically, sitting below the overlay entirely.
//
// That is the trade the previous cut of this card got backwards. It kept the row up at y=250 while
// letting it stay inside the overlay band, and paid for that horizontally by shoving all four boxes
// right to x>=420, which put the row center at 780 against a canvas center of 600 and left a 420px
// left margin against a 60px right one. Dropping the row under the overlay buys back the full width
// and costs only vertical room, which this card has to spare because it carries no disk shelf.
//
// MEASURED, not assumed. The blanket rule (keep out of x<=380 and y<=300) is a catalog-wide worst
// case, so the real overlay was measured for this card's own narrations across viewport widths 1920
// down to 900. Its right edge peaks at 399 and its bottom peaks at 201, both at the narrow end. Two
// things follow, and the layout below is built on them:
//
//   - The right edge is driven by the VIEWPORT, not by the text: the overlay is HTML at a fixed pixel
//     size laid over an SVG that scales, so the narrower the window the more viewBox units it eats.
//     399 at 900px is therefore a property of every card in the catalog, not of this one, and it is
//     already past the 380 the blanket rule quotes. The house value of x>=400 for top-band content
//     really does clear it, but by a single pixel, so nothing here is placed left of 400 above y=201.
//   - The bottom IS driven by the text, so the 201 is this card's own number. Lengthening any
//     narration invalidates it and the stack has to be re-measured.
//
// So the card splits the difference rather than obeying one rule everywhere. The actors live in the
// top band and are held to x>=400 like their equivalents in every sibling card. Everything that has
// to reach left of 400, which is the phase row itself (its leftmost box starts at x=182) and the
// dog-leg that feeds it, is kept BELOW y=201 instead, where the overlay cannot reach at any width.
// Both the bind dog-leg and the backward arc turn in ONE corridor between the actor band and the row,
// at TRANSIT_Y. That y is the exact midpoint of the gap it crosses ((128 + 300) / 2 = 214), so the
// horizontal run sits centered in its band rather than hugging the row beneath it. It also has to
// clear the overlay bottom of 201, because both of those runs reach left to x=264, and 214 does that
// by 13px. Those two constraints very nearly collide, which is what sets the height of everything
// above: the actor band cannot go lower and the row cannot go higher without pushing the corridor
// into the overlay.
const ACT_Y = 60, ACT_H = 68, ACT_BOTTOM = ACT_Y + ACT_H;      // 60 / 128
const TRANSIT_Y = 214;
const RECOVER_LBL_Y = 238;                                     // names the backward edge, under its run
const ROW_Y = 300, ST_H = 72;
const ROW_BOTTOM = ROW_Y + ST_H, ROW_MID = ROW_Y + ST_H / 2;   // 372 / 336
const WIRE_LBL_Y = 392;                                        // event names, under the row
const ADMIN_Y = 440, ADMIN_H = 68;                             // 440 / 508
const CHIP_Y = 548, CHIP_H = 34;                               // strip ends at 582

const ACT_W = 176;
const PVC_X = BOUND_CX - ACT_W / 2, CTRL_X = RELEASED_CX - ACT_W / 2;   // 400 / 624
const ADMIN_W = 176, ADMIN_X = RELEASED_CX - ADMIN_W / 2;              // 624

// The forward lanes sit in the gaps between phases, so each is exactly GAP long and the same points
// array feeds both the drawn lane and the ball. Gap centers carry the event name.
const gapMid = cx => cx + ST_W / 2 + GAP / 2;
const W_AV_BO = [[stX(AVAIL_CX) + ST_W, ROW_MID], [stX(BOUND_CX), ROW_MID]];
const W_BO_RE = [[stX(BOUND_CX) + ST_W, ROW_MID], [stX(RELEASED_CX), ROW_MID]];
const W_RE_FA = [[stX(RELEASED_CX) + ST_W, ROW_MID], [stX(FAILED_CX), ROW_MID]];

// The claim reaches over to whichever phase the volume is in NOW, which on the binding step is
// Available, and the volume then travels the row to Bound and ends up directly under the claim.
const W_BIND = [[BOUND_CX, ACT_BOTTOM], [BOUND_CX, TRANSIT_Y], [AVAIL_CX, TRANSIT_Y], [AVAIL_CX, ROW_Y]];
// The controller only ever acts on Released, which it sits directly above: a straight drop.
const W_RECLAIM = [[RELEASED_CX, ACT_BOTTOM], [RELEASED_CX, ROW_Y]];
// The one backward edge, and it runs OVER the row rather than under it: out of the top center of
// Released, back along the corridor, and down into the top center of Available. It used to loop
// underneath, which put it in the same band as the admin lane, and the two then arrived at the
// underside of the row pointing the same way, so the pair read as one broken fork instead of as two
// unrelated events. Above the row it has the corridor to itself.
//
// It leaves from exactly the same x as the controller lane arrives on (RELEASED_CX), which is only
// safe because the two are never on stage together: the arc is pinned visible on the recover step
// alone, and that step hides the controller. Same story for its descent into Available at x=264,
// which the bind dog-leg also uses one step earlier.
const W_RECOVER = [[RELEASED_CX, ROW_Y], [RELEASED_CX, TRANSIT_Y], [AVAIL_CX, TRANSIT_Y], [AVAIL_CX, ROW_Y]];
const W_ADMIN = [[RELEASED_CX, ADMIN_Y], [RELEASED_CX, ROW_BOTTOM]];

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// There is deliberately no unlightAt here. A box NEVER gives up its highlight part way through a
// step. An earlier cut of this card had the source phase go dark the instant the destination lit, on
// the theory that a state machine should show exactly one live state, and it read as a bug every
// time: the eye is following the ball, so a box dimming behind it looks like something being switched
// off rather than like a phase being left. Both ends of a transition therefore stay lit, and it is
// the ball and the arrowhead that carry the direction of travel. A phase only goes dark at a step
// boundary, when clearHL wipes the board.

// Fades an object out of existence when the delete that removes it lands, and takes its lit stroke
// with it: a block that has gone dark must not keep glowing.
function removeAt(el, ctx, delay = 0, to = 0) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = String(to); el.classList.remove('highlight'); return; }
  const a = el.animate([{ opacity: 1 }, { opacity: to }], { duration: 500, delay, fill: 'forwards', easing: 'ease-in' });
  a.onfinish = () => el.classList.remove('highlight');
  ctx.register(a);
}

// No flashBox helper here, unlike its sibling cards. The sanctioned block blink exists so a step with
// no packet and no Pod does not read frozen, and this card has no such step: idle is the static
// poster, and all six narrated steps carry at least one ball.

// A tag that rides with the ball on the same path, timing and easing, so the packet visibly carries
// what the step narrates. Not a .scheme-packet, so the tools do not count it. Used on the long actor
// lanes and the backward arc only: the forward row hops are GAP (60px) long, which is far shorter
// than the tag itself, so those carry a static event name under the gap instead.
function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'ease-in-out' } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: -14, 'text-anchor': 'middle', 'data-cat': 'storage' }, [txt]);
  lbl.style.opacity = '0';
  lbl.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px)`;
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 160, fill: 'forwards', easing: 'ease-in' }));
}

// Every lane in this card is a ROUTE: something travels all of them, including the backward arc, so
// they are all dashed with a head and all built from the same points array as their ball.
function lane(points) {
  return pathArrow({ points, dashed: true, dim: true, color: 'storage' });
}

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'The phase field of a PersistentVolume as a state machine with four places. A fresh volume is Available and open to any matching claim. When the binding controller writes a claimRef the volume becomes Bound. Deleting that claim moves it to Released rather than back to Available, because the claimRef stays behind and is now stale. From Released the PV controller reads the reclaim policy. Under Delete it removes both the storage asset and the PersistentVolume object, so the volume leaves the machine entirely, and if that automated reclamation errors instead the volume moves to Failed, which is terminal. Under Retain the controller makes no call at all and the volume parks in Released. The single backward edge is manual: an administrator clears the stale claimRef and the volume returns to Available.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // The four phases. Each carries the claimRef condition that defines it as a sublabel, because the
    // phase name on its own does not explain why Released refuses to rebind and Available does not.
    const stAvail = box({ x: stX(AVAIL_CX), y: ROW_Y, w: ST_W, h: ST_H, label: 'Available', sublabel: 'no claimRef', cat: 'storage' });
    const stBound = box({ x: stX(BOUND_CX), y: ROW_Y, w: ST_W, h: ST_H, label: 'Bound', sublabel: 'claimRef set', cat: 'storage' });
    const stReleased = box({ x: stX(RELEASED_CX), y: ROW_Y, w: ST_W, h: ST_H, label: 'Released', sublabel: 'claimRef stale', cat: 'storage' });
    const stFailed = box({ x: stX(FAILED_CX), y: ROW_Y, w: ST_W, h: ST_H, label: 'Failed', sublabel: 'reclaim errored', cat: 'storage' });

    const pvc = box({ x: PVC_X, y: ACT_Y, w: ACT_W, h: ACT_H, label: 'PVC default/data', sublabel: 'the claim', cat: 'storage' });
    // Delete and Retain only, never Recycle: the Recycle reclaim policy is deprecated in the upstream
    // docs, and this sublabel used to advertise it as a live option.
    const ctrl = box({ x: CTRL_X, y: ACT_Y, w: ACT_W, h: ACT_H, label: 'PV controller', sublabel: 'reads reclaim policy', cat: 'storage' });
    const admin = box({ x: ADMIN_X, y: ADMIN_Y, w: ADMIN_W, h: ADMIN_H, label: 'Administrator', sublabel: 'kubectl patch pv', cat: 'storage' });
    pvc.style.opacity = '0';
    ctrl.style.opacity = '0';
    admin.style.opacity = '0';

    // The three forward lanes are drawn on every step: the shape of the machine is true whether or
    // not this step travels it.
    const lAvBo = lane(W_AV_BO);
    const lBoRe = lane(W_BO_RE);
    const lReFa = lane(W_RE_FA);
    // Everything else appears only on the step that uses it, so the card is never crossed by a lane
    // belonging to somebody who is not on stage. The backward arc is in this group rather than drawn
    // permanently because it shares the corridor above the row with the bind dog-leg and shares its
    // exit x with the controller lane.
    const lBind = lane(W_BIND);
    const lReclaim = lane(W_RECLAIM);
    const lAdmin = lane(W_ADMIN);
    const lRecover = lane(W_RECOVER);
    lBind.style.opacity = '0';
    lReclaim.style.opacity = '0';
    lAdmin.style.opacity = '0';
    lRecover.style.opacity = '0';

    // Event names under each forward gap, blank at build and filled per step by setWire.
    const bindLbl = text({ class: 'scheme-label code dim', x: gapMid(AVAIL_CX), y: WIRE_LBL_Y, 'text-anchor': 'middle' }, [' ']);
    const relLbl = text({ class: 'scheme-label code dim', x: gapMid(BOUND_CX), y: WIRE_LBL_Y, 'text-anchor': 'middle' }, [' ']);
    const failLbl = text({ class: 'scheme-label code dim', x: gapMid(RELEASED_CX), y: WIRE_LBL_Y, 'text-anchor': 'middle' }, [' ']);
    // The verdict reports an outcome that moves the volume nowhere, which is exactly the case the row
    // lanes cannot express: a successful Delete and a Retain that declines to act. No step ever fills
    // it at the same time as a neighbouring gap label.
    //
    // It centers on Released, which it can do now that the backward arc runs over the row instead of
    // under it. While the arc was below, this label had to dodge the point where it dropped out of
    // the box, which cost it half its usable width.
    const verdictLbl = text({ class: 'scheme-label code dim', x: RELEASED_CX, y: WIRE_LBL_Y, 'text-anchor': 'middle' }, [' ']);
    // The backward edge gets its own name, centered under its own horizontal run rather than borrowed
    // from a forward gap. Parking it in the Available-to-Bound gap, which is what the first cut did,
    // put the caption for a right-to-left event on the one lane that runs left to right.
    const recoverLbl = text({ class: 'scheme-label code dim', x: (AVAIL_CX + RELEASED_CX) / 2, y: RECOVER_LBL_Y, 'text-anchor': 'middle' }, [' ']);

    const CHIP_W = 252, CHIP_GAP = 24;
    const chipX = i => (1200 - (CHIP_W * 4 + CHIP_GAP * 3)) / 2 + i * (CHIP_W + CHIP_GAP);  // 60 / 336 / 612 / 888
    const phaseChip = valChip({ x: chipX(0), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'phase', value: 'Available', cat: 'storage' });
    const claimRefChip = valChip({ x: chipX(1), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'claimRef', value: 'none', cat: 'storage' });
    const policyChip = valChip({ x: chipX(2), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'reclaim', value: 'Delete', cat: 'storage' });
    const objChip = valChip({ x: chipX(3), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'PV object', value: 'exists', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): the phase boxes and the actors, then every lane above them, then the
    // event labels, then the chip strip, then the packet layer so every ball rides above everything.
    [stAvail, stBound, stReleased, stFailed, pvc, ctrl, admin].forEach(el => root.appendChild(el));
    [lAvBo, lBoRe, lReFa, lBind, lReclaim, lAdmin, lRecover].forEach(el => root.appendChild(el));
    [bindLbl, relLbl, failLbl, verdictLbl, recoverLbl].forEach(el => root.appendChild(el));
    [phaseChip, claimRefChip, policyChip, objChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      stAvail, stBound, stReleased, stFailed, pvc, ctrl, admin,
      lBind, lReclaim, lAdmin, lRecover,
      phaseChip, claimRefChip, policyChip, objChip,
      wires: { bind: bindLbl, rel: relLbl, fail: failLbl, verdict: verdictLbl, recover: recoverLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

// A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
// holds the previous step value at call time and steps are always entered in order, so the diff is
// deterministic. Catalog-wide chip pattern.
function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}
function setChips(s, { phase, claimRef, policy, obj }) {
  setChip(s.refs.phaseChip, phase);
  setChip(s.refs.claimRefChip, claimRef);
  setChip(s.refs.policyChip, policy);
  setChip(s.refs.objChip, obj);
}

// Every step pins EVERY opacity that any step can change, so a step can never inherit a stale one and
// a cancel mid-flight always lands on this step's own end state.
function setStage(s, { pvc, ctrl, admin, bindLane, reclaimLane, adminLane, recoverLane }) {
  s.refs.pvc.style.opacity = String(pvc);
  s.refs.ctrl.style.opacity = String(ctrl);
  s.refs.admin.style.opacity = String(admin);
  s.refs.lBind.style.opacity = String(bindLane);
  s.refs.lReclaim.style.opacity = String(reclaimLane);
  s.refs.lAdmin.style.opacity = String(adminLane);
  s.refs.lRecover.style.opacity = String(recoverLane);
}

function clearHL(s) {
  clearHighlights(s, ['stAvail', 'stBound', 'stReleased', 'stFailed', 'pvc', 'ctrl', 'admin',
    'phaseChip', 'claimRefChip', 'policyChip', 'objChip'], []);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A PersistentVolume and the four phases its lifecycle runs through. Right now it is Available, which means no claim points at it and the binding controller is free to match it to the next claim that fits on size, access mode and storage class.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Available', claimRef: 'none', policy: 'Delete', obj: 'exists' });
      setStage(s, { pvc: 0, ctrl: 0, admin: 0, bindLane: 0, reclaimLane: 0, adminLane: 0, recoverLane: 0 });
      s.refs.stAvail.classList.add('highlight');
    },
  },
  {
    id: 'bind',
    duration: 3200,
    narration: 'A matching claim asks for the volume. The binding controller writes that claim into the claimRef field of the PV, and the phase moves to Bound. From here the volume is reserved for exactly one claim and no other claim can take it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Bound', claimRef: 'default/data', policy: 'Delete', obj: 'exists' });
      setStage(s, { pvc: 1, ctrl: 0, admin: 0, bindLane: 1, reclaimLane: 0, adminLane: 0, recoverLane: 0 });
      setWire(s, 'bind', 'claimRef written');
      // Static end state: the claim, the phase it acted on and the phase the volume ended in are all
      // lit together. Available keeps its light for the whole step even though the volume has left it.
      s.refs.stAvail.classList.add('highlight');
      s.refs.stBound.classList.add('highlight');
      s.refs.pvc.classList.add('highlight');
      if (ctx.reduced) return;
      // Only the claim is lit from the start, because only the claim sends a ball. The two phases are
      // both destinations here and each waits for its own arrival: Available for the claimRef write
      // landing on it, Bound for the phase flip that follows.
      s.refs.stAvail.classList.remove('highlight');
      s.refs.stBound.classList.remove('highlight');
      const write = routePacket(s, ctx, W_BIND, { cat: 'storage' });
      ridingLabel(s, ctx, 'claimRef: default/data', W_BIND);
      lightBoxAt(s.refs.stAvail, ctx, write.arrivalMs);
      const flip = routePacket(s, ctx, W_AV_BO, { delay: write.arrivalMs + BEAT.afterHop, cat: 'storage' });
      lightBoxAt(s.refs.stBound, ctx, flip.arrivalMs);
    },
  },
  {
    id: 'release',
    duration: 3000,
    narration: 'The claim is deleted. The volume does not go back to Available: it moves to Released. The claimRef is still on the PV and now names a claim that no longer exists, and that stale reference is precisely what stops any other claim from binding.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Released', claimRef: 'default/data stale', policy: 'Delete', obj: 'exists' });
      // The claim is deleted on this step, so it ends at zero rather than as a ghost. It used to settle
      // at a dim 0.45 and stay on the canvas for the rest of the card, where it read as an object
      // that was still somehow around and pulled the eye away from the row.
      setStage(s, { pvc: 0, ctrl: 0, admin: 0, bindLane: 0, reclaimLane: 0, adminLane: 0, recoverLane: 0 });
      setWire(s, 'rel', 'claim deleted');
      s.refs.stBound.classList.add('highlight');
      s.refs.stReleased.classList.add('highlight');
      if (ctx.reduced) return;
      s.refs.stReleased.classList.remove('highlight');
      // The claim starts alive and is killed on this step, and the transition fires only once it has
      // finished going: the phase flip is caused by the deletion, so it may not overlap it.
      s.refs.pvc.style.opacity = '1';
      removeAt(s.refs.pvc, ctx, 120, 0);
      const evt = routePacket(s, ctx, W_BO_RE, { delay: 620 + BEAT.afterHop, cat: 'storage' });
      lightBoxAt(s.refs.stReleased, ctx, evt.arrivalMs);
    },
  },
  {
    id: 'reclaim-delete',
    duration: 3600,
    narration: 'Now the PV controller reads the reclaim policy on the released volume. Under Delete, the default for anything dynamically provisioned, it calls DeleteVolume on the driver, and on success both the storage asset and the PersistentVolume object itself are removed. Released is where this volume ends its life rather than a phase it passes through.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'none, object gone', claimRef: 'gone with the PV', policy: 'Delete', obj: 'deleted' });
      setStage(s, { pvc: 0, ctrl: 1, admin: 0, bindLane: 0, reclaimLane: 1, adminLane: 0, recoverLane: 0 });
      setWire(s, 'verdict', 'PV object removed');
      // Released stays lit for the whole step: it is the phase the volume is in when the call runs,
      // and it is where the ball is heading. An earlier cut had it go dark on arrival to say "the
      // object left the machine", but a box dimming under an incoming ball reads as the ball breaking
      // something. The disappearance is carried by the three chips and the verdict line instead, all
      // of which say the object is gone, and none of which can be mistaken for a lighting bug.
      s.refs.stReleased.classList.add('highlight');
      s.refs.ctrl.classList.add('highlight');
      if (ctx.reduced) return;
      // The controller sends the ball, so only the controller is lit to begin with. Released is the
      // destination and waits for the call to land on it.
      s.refs.stReleased.classList.remove('highlight');
      const call = routePacket(s, ctx, W_RECLAIM, { cat: 'storage' });
      ridingLabel(s, ctx, 'DeleteVolume', W_RECLAIM);
      lightBoxAt(s.refs.stReleased, ctx, call.arrivalMs);
    },
  },
  {
    id: 'reclaim-failed',
    duration: 3600,
    narration: 'Take that same call and let the backend reject it. The volume has failed its automated reclamation, so it moves to Failed. This is where automatic cleanup gives up, and the volume sits in Failed until a person works out what went wrong and sorts it out by hand.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Failed', claimRef: 'default/data stale', policy: 'Delete', obj: 'exists' });
      setStage(s, { pvc: 0, ctrl: 1, admin: 0, bindLane: 0, reclaimLane: 1, adminLane: 0, recoverLane: 0 });
      setWire(s, 'fail', 'reclaim error');
      s.refs.stReleased.classList.add('highlight');
      s.refs.stFailed.classList.add('highlight');
      s.refs.ctrl.classList.add('highlight');
      if (ctx.reduced) return;
      s.refs.stReleased.classList.remove('highlight');
      s.refs.stFailed.classList.remove('highlight');
      const call = routePacket(s, ctx, W_RECLAIM, { cat: 'storage' });
      ridingLabel(s, ctx, 'DeleteVolume rejected', W_RECLAIM);
      lightBoxAt(s.refs.stReleased, ctx, call.arrivalMs);
      const evt = routePacket(s, ctx, W_RE_FA, { delay: call.arrivalMs + BEAT.afterHop, cat: 'storage' });
      lightBoxAt(s.refs.stFailed, ctx, evt.arrivalMs);
    },
  },
  {
    id: 'retain-parked',
    duration: 3200,
    narration: 'Set the policy to Retain, the default for a volume you create by hand, and the controller makes no call at all. Nothing errors, so nothing moves: the volume parks in Released holding the stale claimRef, and every fresh claim that asks for it is skipped. The data is intact and completely out of reach.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Released', claimRef: 'default/data stale', policy: 'Retain', obj: 'exists' });
      setStage(s, { pvc: 0, ctrl: 1, admin: 0, bindLane: 0, reclaimLane: 1, adminLane: 0, recoverLane: 0 });
      setWire(s, 'verdict', 'no DeleteVolume call');
      s.refs.stReleased.classList.add('highlight');
      s.refs.ctrl.classList.add('highlight');
      if (ctx.reduced) return;
      // The policy read still happens, and it is the SECOND act that never comes: the lane on to
      // Failed is drawn and stays empty, which is Retain shown as an absence rather than as a gap.
      s.refs.stReleased.classList.remove('highlight');
      const call = routePacket(s, ctx, W_RECLAIM, { cat: 'storage' });
      ridingLabel(s, ctx, 'policy: Retain', W_RECLAIM);
      lightBoxAt(s.refs.stReleased, ctx, call.arrivalMs);
    },
  },
  {
    id: 'recover',
    duration: 3400,
    narration: 'The only edge that leads back is manual. An administrator patches the PV and removes the stale claimRef, and with no reference left the volume returns to Available and can be bound again. Every other transition here happens on its own, this is the one that needs a person.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Available', claimRef: 'cleared', policy: 'Retain', obj: 'exists' });
      setStage(s, { pvc: 0, ctrl: 0, admin: 1, bindLane: 0, reclaimLane: 0, adminLane: 1, recoverLane: 1 });
      setWire(s, 'recover', 'claimRef cleared, Available again');
      s.refs.stReleased.classList.add('highlight');
      s.refs.stAvail.classList.add('highlight');
      s.refs.admin.classList.add('highlight');
      if (ctx.reduced) return;
      s.refs.stReleased.classList.remove('highlight');
      s.refs.stAvail.classList.remove('highlight');
      const patch = routePacket(s, ctx, W_ADMIN, { cat: 'storage' });
      ridingLabel(s, ctx, 'claimRef: null', W_ADMIN);
      lightBoxAt(s.refs.stReleased, ctx, patch.arrivalMs);
      const back = routePacket(s, ctx, W_RECOVER, { delay: patch.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'back to Available', W_RECOVER, { delay: patch.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.stAvail, ctx, back.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
