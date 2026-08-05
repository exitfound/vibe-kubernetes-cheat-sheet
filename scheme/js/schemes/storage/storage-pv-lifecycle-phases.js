import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, pathArrow } from '../../lib/primitives.js';
import { valChip, setVal, setChip, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt, makeRidingLabel } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-pv-lifecycle-phases


const PITCH = 224;
const ST_W = 164, GAP = PITCH - ST_W;                          // 164 / 60
const AVAIL_CX = 264, BOUND_CX = AVAIL_CX + PITCH;             // 264 / 488
const RELEASED_CX = BOUND_CX + PITCH, FAILED_CX = RELEASED_CX + PITCH;  // 712 / 936
const stX = cx => cx - ST_W / 2;                               // 182 / 406 / 630 / 854

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
const W_RECOVER = [[RELEASED_CX, ROW_Y], [RELEASED_CX, TRANSIT_Y], [AVAIL_CX, TRANSIT_Y], [AVAIL_CX, ROW_Y]];
const W_ADMIN = [[RELEASED_CX, ADMIN_Y], [RELEASED_CX, ROW_BOTTOM]];

// Fades an object out of existence when the delete that removes it lands, and takes its lit stroke
// with it: a block that has gone dark must not keep glowing.
function removeAt(el, ctx, delay = 0, to = 0) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = String(to); el.classList.remove('highlight'); return; }
  const a = el.animate([{ opacity: 1 }, { opacity: to }], { duration: 500, delay, fill: 'forwards', easing: 'ease-in' });
  a.onfinish = () => el.classList.remove('highlight');
  ctx.register(a);
}

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

// Every lane in this card is a ROUTE: something travels all of them, including the backward arc, so
// they are all dashed with a head and all built from the same points array as their ball.
function lane(points) {
  return pathArrow({ points, dashed: true, dim: true, role: 'storage' });
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
      'aria-label': 'The phase field of a PersistentVolume as a state machine with four places. A fresh volume is Available and open to any matching claim. When a claimRef is written the volume becomes Bound. Deleting that claim moves it to Released rather than back to Available, because the claimRef stays behind and is now stale. From Released the PV controller reads the reclaim policy. Under Delete it removes both the storage asset and the PersistentVolume object, so the volume leaves the machine entirely, and if that automated reclamation errors instead the volume moves to Failed, which no automatic transition leaves. Under Retain the controller makes no call at all and the volume parks in Released. The single backward edge is manual: an administrator clears the stale claimRef and the volume returns to Available.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // The four phases. Each carries the claimRef condition that defines it as a sublabel, because the
    // phase name on its own does not explain why Released refuses to rebind and Available does not.
    const stAvail = box({ x: stX(AVAIL_CX), y: ROW_Y, w: ST_W, h: ST_H, label: 'Available', sublabel: 'no claimRef', role: 'storage' });
    const stBound = box({ x: stX(BOUND_CX), y: ROW_Y, w: ST_W, h: ST_H, label: 'Bound', sublabel: 'claimRef set', role: 'storage' });
    const stReleased = box({ x: stX(RELEASED_CX), y: ROW_Y, w: ST_W, h: ST_H, label: 'Released', sublabel: 'claimRef stale', role: 'storage' });
    const stFailed = box({ x: stX(FAILED_CX), y: ROW_Y, w: ST_W, h: ST_H, label: 'Failed', sublabel: 'reclaim errored', role: 'storage' });

    const pvc = box({ x: PVC_X, y: ACT_Y, w: ACT_W, h: ACT_H, label: 'PVC default/data', sublabel: 'the claim', role: 'storage' });
    // Delete and Retain only, never Recycle: the Recycle reclaim policy is deprecated in the upstream
    // docs, and this sublabel used to advertise it as a live option.
    const ctrl = box({ x: CTRL_X, y: ACT_Y, w: ACT_W, h: ACT_H, label: 'PV controller', sublabel: 'reads reclaim policy', role: 'storage' });
    const admin = box({ x: ADMIN_X, y: ADMIN_Y, w: ADMIN_W, h: ADMIN_H, label: 'Administrator', sublabel: 'kubectl patch pv', role: 'storage' });
    pvc.style.opacity = '0';
    ctrl.style.opacity = '0';
    admin.style.opacity = '0';

    // The three forward lanes are drawn on every step: the shape of the machine is true whether or
    // not this step travels it.
    const lAvBo = lane(W_AV_BO);
    const lBoRe = lane(W_BO_RE);
    const lReFa = lane(W_RE_FA);
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
    const verdictLbl = text({ class: 'scheme-label code dim', x: RELEASED_CX, y: WIRE_LBL_Y, 'text-anchor': 'middle' }, [' ']);
    const recoverLbl = text({ class: 'scheme-label code dim', x: (AVAIL_CX + RELEASED_CX) / 2, y: RECOVER_LBL_Y, 'text-anchor': 'middle' }, [' ']);

    const CHIP_W = 252, CHIP_GAP = 24;
    const chipX = i => (1200 - (CHIP_W * 4 + CHIP_GAP * 3)) / 2 + i * (CHIP_W + CHIP_GAP);  // 60 / 336 / 612 / 888
    const phaseChip = valChip({ x: chipX(0), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'phase', value: 'Available', role: 'storage' });
    const claimRefChip = valChip({ x: chipX(1), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'claimRef', value: 'none', role: 'storage' });
    const policyChip = valChip({ x: chipX(2), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'reclaim', value: 'Delete', role: 'storage' });
    const objChip = valChip({ x: chipX(3), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'PV object', value: 'exists', role: 'storage' });

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

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  clearHighlights(s, ['stAvail', 'stBound', 'stReleased', 'stFailed', 'pvc', 'ctrl', 'admin',
    'phaseChip', 'claimRefChip', 'policyChip', 'objChip'], []);
  clearWires(s);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      resetStep(s);
      setChips(s, { phase: 'Available', claimRef: 'none', policy: 'Delete', obj: 'exists' });
      setStage(s, { pvc: 0, ctrl: 0, admin: 0, bindLane: 0, reclaimLane: 0, adminLane: 0, recoverLane: 0 });
      s.refs.stAvail.classList.add('highlight');
    },
  },
  {
    id: 'bind',
    duration: 3200,
    narration: 'A matching claim asks for the volume. That claim is written into the claimRef field of the PV, and the phase moves to Bound. From here the volume is reserved for exactly one claim and no other claim can take it.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { phase: 'Bound', claimRef: 'default/data', policy: 'Delete', obj: 'exists' });
      setStage(s, { pvc: 1, ctrl: 0, admin: 0, bindLane: 1, reclaimLane: 0, adminLane: 0, recoverLane: 0 });
      setWire(s, 'bind', 'claimRef written');
      // Static end state: the claim, the phase it acted on and the phase the volume ended in are all
      // lit together. Available keeps its light for the whole step even though the volume has left it.
      s.refs.stAvail.classList.add('highlight');
      s.refs.stBound.classList.add('highlight');
      s.refs.pvc.classList.add('highlight');
      if (ctx.reduced) return;
      s.refs.stAvail.classList.remove('highlight');
      s.refs.stBound.classList.remove('highlight');
      const write = routePacket(s, ctx, W_BIND, { role: 'storage' });
      ridingLabel(s, ctx, 'claimRef: default/data', W_BIND);
      lightBoxAt(s.refs.stAvail, ctx, write.arrivalMs);
      const flip = routePacket(s, ctx, W_AV_BO, { delay: write.arrivalMs + BEAT.afterHop, role: 'storage' });
      lightBoxAt(s.refs.stBound, ctx, flip.arrivalMs);
    },
  },
  {
    id: 'release',
    duration: 3000,
    narration: 'The claim is deleted. The volume does not go back to Available: it moves to Released. The claimRef is still on the PV and now names a claim that no longer exists, and that stale reference is precisely what stops any other claim from binding.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { phase: 'Released', claimRef: 'default/data stale', policy: 'Delete', obj: 'exists' });
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
      const evt = routePacket(s, ctx, W_BO_RE, { delay: 620 + BEAT.afterHop, role: 'storage' });
      lightBoxAt(s.refs.stReleased, ctx, evt.arrivalMs);
    },
  },
  {
    id: 'reclaim-delete',
    duration: 3600,
    narration: 'Now the PV controller reads the reclaim policy on the released volume. Under Delete, the default for anything dynamically provisioned, it calls DeleteVolume on the driver, and on success both the storage asset and the PersistentVolume object itself are removed. Released is where this volume ends its life rather than a phase it passes through.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { phase: 'none, object gone', claimRef: 'gone with the PV', policy: 'Delete', obj: 'deleted' });
      setStage(s, { pvc: 0, ctrl: 1, admin: 0, bindLane: 0, reclaimLane: 1, adminLane: 0, recoverLane: 0 });
      setWire(s, 'verdict', 'PV object removed');
      s.refs.stReleased.classList.add('highlight');
      s.refs.ctrl.classList.add('highlight');
      if (ctx.reduced) return;
      // The controller sends the ball, so only the controller is lit to begin with. Released is the
      // destination and waits for the call to land on it.
      s.refs.stReleased.classList.remove('highlight');
      const call = routePacket(s, ctx, W_RECLAIM, { role: 'storage' });
      ridingLabel(s, ctx, 'DeleteVolume', W_RECLAIM);
      lightBoxAt(s.refs.stReleased, ctx, call.arrivalMs);
    },
  },
  {
    id: 'reclaim-failed',
    duration: 3600,
    narration: 'Take that same call and let the backend reject it. The volume has failed its automated reclamation, so it moves to Failed. This is where automatic cleanup gives up, and the volume sits in Failed until a person works out what went wrong and sorts it out by hand.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { phase: 'Failed', claimRef: 'default/data stale', policy: 'Delete', obj: 'exists' });
      setStage(s, { pvc: 0, ctrl: 1, admin: 0, bindLane: 0, reclaimLane: 1, adminLane: 0, recoverLane: 0 });
      setWire(s, 'fail', 'reclaim error');
      s.refs.stReleased.classList.add('highlight');
      s.refs.stFailed.classList.add('highlight');
      s.refs.ctrl.classList.add('highlight');
      if (ctx.reduced) return;
      s.refs.stReleased.classList.remove('highlight');
      s.refs.stFailed.classList.remove('highlight');
      const call = routePacket(s, ctx, W_RECLAIM, { role: 'storage' });
      ridingLabel(s, ctx, 'DeleteVolume rejected', W_RECLAIM);
      lightBoxAt(s.refs.stReleased, ctx, call.arrivalMs);
      const evt = routePacket(s, ctx, W_RE_FA, { delay: call.arrivalMs + BEAT.afterHop, role: 'storage' });
      lightBoxAt(s.refs.stFailed, ctx, evt.arrivalMs);
    },
  },
  {
    id: 'retain-parked',
    duration: 3200,
    narration: 'Set the policy to Retain, the default for a volume you create by hand, and the controller makes no call at all. Nothing errors, so nothing moves: the volume parks in Released holding the stale claimRef, and every fresh claim that asks for it is skipped. The data is intact and completely out of reach.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { phase: 'Released', claimRef: 'default/data stale', policy: 'Retain', obj: 'exists' });
      setStage(s, { pvc: 0, ctrl: 1, admin: 0, bindLane: 0, reclaimLane: 1, adminLane: 0, recoverLane: 0 });
      setWire(s, 'verdict', 'no DeleteVolume call');
      s.refs.stReleased.classList.add('highlight');
      s.refs.ctrl.classList.add('highlight');
      if (ctx.reduced) return;
      // The policy read still happens, and it is the SECOND act that never comes: the lane on to
      // Failed is drawn and stays empty, which is Retain shown as an absence rather than as a gap.
      s.refs.stReleased.classList.remove('highlight');
      const call = routePacket(s, ctx, W_RECLAIM, { role: 'storage' });
      ridingLabel(s, ctx, 'policy: Retain', W_RECLAIM);
      lightBoxAt(s.refs.stReleased, ctx, call.arrivalMs);
    },
  },
  {
    id: 'recover',
    duration: 3400,
    narration: 'The only edge that leads back is manual. An administrator patches the PV and removes the stale claimRef, and with no reference left the volume returns to Available and can be bound again. Every other transition here happens on its own, this is the one that needs a person.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { phase: 'Available', claimRef: 'cleared', policy: 'Retain', obj: 'exists' });
      setStage(s, { pvc: 0, ctrl: 0, admin: 1, bindLane: 0, reclaimLane: 0, adminLane: 1, recoverLane: 1 });
      setWire(s, 'recover', 'claimRef cleared, Available again');
      s.refs.stReleased.classList.add('highlight');
      s.refs.stAvail.classList.add('highlight');
      s.refs.admin.classList.add('highlight');
      if (ctx.reduced) return;
      s.refs.stReleased.classList.remove('highlight');
      s.refs.stAvail.classList.remove('highlight');
      const patch = routePacket(s, ctx, W_ADMIN, { role: 'storage' });
      ridingLabel(s, ctx, 'claimRef: null', W_ADMIN);
      lightBoxAt(s.refs.stReleased, ctx, patch.arrivalMs);
      const back = routePacket(s, ctx, W_RECOVER, { delay: patch.arrivalMs + BEAT.afterHop, role: 'storage' });
      ridingLabel(s, ctx, 'back to Available', W_RECOVER, { delay: patch.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.stAvail, ctx, back.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
