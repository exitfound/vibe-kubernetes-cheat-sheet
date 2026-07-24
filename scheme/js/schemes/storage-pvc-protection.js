import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// ---- What this card has to get RIGHT, because the obvious version of it is wrong ----
//
// 1. The finalizer is put on the claim WHEN THE CLAIM IS CREATED, not when a Pod picks it up. The
//    pvc-protection controller adds kubernetes.io/pvc-protection to every PVC whose deletionTimestamp
//    is nil and that does not carry it yet, use or no use. What being in use changes is the REMOVAL:
//    the controller refuses to take the finalizer off while a Pod still consumes the claim. An earlier
//    cut of this card said the finalizer appeared "the moment a Pod started using it", which invents
//    a trigger that does not exist and makes the protection sound reactive when it is standing.
//
// 2. status.phase NEVER becomes Terminating. A PVC phase is Pending, Bound or Lost, and there is no
//    Terminating among them. What prints Terminating is kubectl: its printer swaps the phase out for
//    the literal string Terminating whenever deletionTimestamp is non-nil. So the object under a
//    stuck delete is still phase Bound, and the word the user is staring at in the STATUS column is a
//    display convention rather than a field. That gap IS the card: the reason a stuck PVC is
//    confusing is that its status looks like a state it is not actually in. The claim keeps the
//    sublabel 'phase Bound' the whole way through and a chip reports what kubectl shows next to it.
//
// 3. What finally removes the object is the API SERVER, not the garbage collector. The GC is the
//    thing that walks ownerReferences to delete dependents. A finalizer is settled in the API server
//    itself: with a deletionTimestamp set and the finalizers list empty, the delete that was
//    outstanding completes and the record leaves etcd.
//
// ---- Layout (viewBox 1200x640) ----
// Storage grammar, the centered vertical stack: the consumer Pod on top, the claim under it, the
// backing disk on the shelf below, all three on ONE axis at the canvas center CX=600, so the identity
// chain reads as a single column rather than as three boxes that happen to be near each other. The
// spine is drawn as the mount ASCENT (disk -> claim -> Pod, upward), the same single arrowed axis
// storage-pvc-binding settled on, and balls really travel it, so the arrowheads are earned. Nothing
// here is a headless relationship line.
//
// The two actors that drive the delete sit in ONE right-hand column at a shared x and a shared
// footprint, and they are placed so that every lane they send is a straight run or a single right
// angle. There is no dog-leg anywhere in this card and no lane turns twice.
//
// The vertical rhythm is one pitch, TIER=162, and it does double duty:
//   - kubectl sits at 108, the claim at 270, the controller at 432. Three actors, evenly spaced.
//   - 108 is also the Pod center, so kubectl deletes the Pod along a STRAIGHT horizontal.
//   - 270 is the claim center, so the two lanes that reach the claim, the delete coming DOWN from
//     kubectl and the finalizer patch coming UP from the controller, are exact MIRRORS of each other
//     around the claim midline, each turning once and each landing dead center on its right edge.
// The two forces of the card, the request to delete and the release that finally allows it, arrive on
// mirrored lanes. That is the composition saying what the narration says.
//
// Every block and every lane clears the narration overlay by the blanket rule alone: the stack starts
// at x=480 and no lane runs left of x=600. The ONE element that reaches into the left column is the
// verdict caption beside the claim, which is anchored end at x=464 and runs back to about x=306 on its
// longest string.
//
// That one is placed on a MEASUREMENT, not on the blanket rule. This card's own overlay was measured
// across viewport widths 1920 down to 900: its right edge peaks at 399 and its bottom peaks at 201,
// both at the narrow end (the right edge is driven by the VIEWPORT rather than by the text, because
// the overlay is fixed-size HTML over an SVG that scales, so a narrower window eats more viewBox
// units). The caption sits at y=274, which clears that 201 by 73 units at every width. LENGTHENING ANY
// NARRATION INVALIDATES THIS: re-measure before doing it, or move the caption back to the right of the
// axis. Nothing else in the card depends on the measurement.
const CX = 600;                                                // canvas + identity-spine center
const TIER = 162;                                              // the one vertical pitch

const POD_W = 240, POD_H = 104, POD_X = CX - POD_W / 2, POD_Y = 56;
const POD_BOTTOM = POD_Y + POD_H, POD_MID = POD_Y + POD_H / 2, POD_RIGHT = POD_X + POD_W; // 160 / 108 / 720

const PVC_W = 240, PVC_H = 68, PVC_X = CX - PVC_W / 2, PVC_Y = 236;
const PVC_BOTTOM = PVC_Y + PVC_H, PVC_MID = PVC_Y + PVC_H / 2, PVC_RIGHT = PVC_X + PVC_W; // 304 / 270 / 720

const DISK_W = 230, DISK_H = 86, DISK_Y = 389;
const DISK_TOP = DISK_Y, DISK_BOTTOM = DISK_Y + DISK_H;        // 389 / 475

// One actor column, one footprint, the standard controller box. kubectl is centered on the Pod tier
// and the controller on the tier below the claim, so the pair straddles the claim symmetrically.
const ACT_W = 220, ACT_H = 72, ACT_X = 850;
const ACT_CX = ACT_X + ACT_W / 2;                              // 960
const KUBECTL_Y = POD_MID - ACT_H / 2, KUBECTL_BOTTOM = KUBECTL_Y + ACT_H;   // 72 / 144
const CTRL_MID = PVC_MID + TIER, CTRL_Y = CTRL_MID - ACT_H / 2;             // 432 / 396

// The two captions take one side of the axis each, so neither can be mistaken for the other's lane.
// The mount caption names the lane it sits beside. The VERDICT caption reports the state of the
// CLAIM, not of any lane, so it sits hard against the claim at its own midline instead: parked beside
// the lower lane, as an earlier cut had it, it read as that lane's name, which it never was.
const MOUNT_LBL_X = CX + 16, MOUNT_LBL_Y = 204;
const VERDICT_LBL_X = PVC_X - 16, VERDICT_LBL_Y = PVC_MID + 4;  // 464 / 274, anchored end
// cylinder() draws its own name on the baseline h/2+5, so the spec line goes 14 below it.
const SPEC_Y = DISK_Y + DISK_H / 2 + 5 + 14;                   // 451
const CHIP_Y = 545, CHIP_H = 34;                               // strip ends at 579

const GONE = 0.12;      // an object the API server has removed

// Each lane and its ball share one points array, so the two cannot drift apart, and every endpoint
// sits on a block edge so no ball ever travels underneath a box.
const W_MOUNT_LOW  = [[CX, DISK_TOP], [CX, PVC_BOTTOM]];       // disk -> claim, upward
const W_MOUNT_HIGH = [[CX, PVC_Y], [CX, POD_BOTTOM]];          // claim -> Pod, upward
// kubectl deletes the Pod: straight horizontal, no turn, because the two share the 108 tier.
const W_DEL_POD = [[ACT_X, POD_MID], [POD_RIGHT, POD_MID]];
// The mirrored pair into the claim. One turn each, and BOTH land dead center on the claim's right
// edge, at PVC_MID exactly, rather than on lanes offset either side of it. Splitting them by a lane
// gap is the usual way to keep two routes from overlapping, and it is wrong here: the two are never
// on stage together (kubectl appears only on the delete step, the controller only on the release
// step), so the gap bought nothing and cost the thing that matters, which is that an arrow arriving
// off center reads as aimed at a corner of the block instead of at the block.
const W_DEL_PVC  = [[ACT_CX, KUBECTL_BOTTOM], [ACT_CX, PVC_MID], [PVC_RIGHT, PVC_MID]];
const W_RM_FINAL = [[ACT_CX, CTRL_Y], [ACT_CX, PVC_MID], [PVC_RIGHT, PVC_MID]];

// Lights a block ON PACKET ARRIVAL rather than at step entry, via a zero-effect animation whose
// onfinish sets the class. Under reduced motion it applies immediately so the static end-state stays
// correct. This is how a block receives a packet without pulsing.
function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// Fades an object out of existence when the delete that removes it lands, and takes its lit stroke
// with it: a block that has gone dark must not keep glowing, or it reads as deleted-but-still-live.
function removeAt(el, ctx, delay = 0, to = GONE) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = String(to); el.classList.remove('highlight'); return; }
  const a = el.animate([{ opacity: 1 }, { opacity: to }], { duration: 500, delay, fill: 'forwards', easing: 'ease-in' });
  a.onfinish = () => el.classList.remove('highlight');
  ctx.register(a);
}

// There is deliberately NO flashBox in this card. The sanctioned block blink exists so that a step
// with no packet and no Pod does not read frozen, and no step here is in that position: every
// narrated step carries a ball, a Pod pulse or a fade. An earlier cut brightened the claim on the
// finalizer-holds step, which put a blink on infrastructure for no reason. That step now carries the
// mount ball instead, which is both real traffic and the actual point being made: the claim is still
// mounted, which is exactly why it cannot go.

// A tag that rides ALONG with the ball on the same path, timing and easing, so the packet visibly
// carries what the step narrates. It lives in the packet layer but is not a .scheme-packet, so the
// tools do not count it as one. dur omitted => routeDur(points), matching a ball that also omits it.
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

// A Pod is a shell plus an inner box, wrapped in a g so pulsePod reaches BOTH. querySelectorAll
// matches descendants only, so pulsing a bare pod() would fire at half strength.
function podBlock() {
  const shell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'volumes: data-claim', containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: POD_X + 20, y: POD_Y + (POD_H - 52) / 2, w: POD_W - 40, h: 52, label: 'App', sublabel: 'writes to /data', cat: 'storage' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

// Every lane in this card is a ROUTE: something travels all of them, so they are all dashed, all
// carry a head, and all are built from the same points array as their ball.
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
      'aria-label': 'Why a deleted PersistentVolumeClaim sits in Terminating. The pvc-protection controller puts the kubernetes.io slash pvc-protection finalizer on every claim when it is created. Deleting the claim only sets a deletionTimestamp on it, and because the finalizers list is not empty the API server will not complete the delete, so the object stays and the Pod keeps its mount. Its status phase is still Bound the whole time and only kubectl prints the word Terminating. Once the last consuming Pod is gone the controller removes the finalizer, the list empties, and only then does the API server take the object out of etcd.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const web = podBlock();
    const pvc = box({ x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-claim', sublabel: 'phase Bound', cat: 'storage' });
    // Block labels lead with the capitalized object TYPE, matching the sibling cards (PV controller,
    // PVC default/data in storage-pv-lifecycle-phases). The lowercase pvc-protection that appears in
    // the finalizers chip and in the narration is a different thing: that is the literal finalizer
    // string kubernetes.io/pvc-protection, so it stays exactly as the API spells it.
    const kubectl = box({ x: ACT_X, y: KUBECTL_Y, w: ACT_W, h: ACT_H, label: 'Kubectl Delete', sublabel: 'issues the request', cat: 'storage' });
    const ctrl = box({ x: ACT_X, y: CTRL_Y, w: ACT_W, h: ACT_H, label: 'PVC protection', sublabel: 'the controller', cat: 'storage' });
    const disk = cylinder({ x: CX - DISK_W / 2, y: DISK_Y, w: DISK_W, h: DISK_H, label: 'PV data-vol', cat: 'storage' });
    // Both actors appear only on the steps they act on, so the card is never crossed by a lane
    // belonging to somebody who is not on stage, and the six-block frame reads as the centered stack
    // plus one visitor rather than as a permanent crowd.
    kubectl.style.opacity = '0';
    ctrl.style.opacity = '0';

    const lMountLow = lane(W_MOUNT_LOW);
    const lMountHigh = lane(W_MOUNT_HIGH);
    const lDelPvc = lane(W_DEL_PVC);
    const lDelPod = lane(W_DEL_POD);
    const lRmFinal = lane(W_RM_FINAL);
    lDelPvc.style.opacity = '0';
    lDelPod.style.opacity = '0';
    lRmFinal.style.opacity = '0';

    // Lane captions, blank at build and filled per step by setWire. The lower one is a VERDICT slot:
    // it reports whatever the claim currently is, which changes kind across the card (a binding, then
    // a block on removal, then a removal), so it is named for its job rather than for one lane.
    const mountLbl = text({ class: 'scheme-label code dim', x: MOUNT_LBL_X, y: MOUNT_LBL_Y, 'text-anchor': 'start' }, [' ']);
    const verdictLbl = text({ class: 'scheme-label code dim', x: VERDICT_LBL_X, y: VERDICT_LBL_Y, 'text-anchor': 'end' }, [' ']);

    // A centered four-chip strip, derived rather than hand-placed, so the readout is concentric with
    // the stack above it. deletionTimestamp and the kubectl column sit next to each other on purpose:
    // the second is a display of the first, and seeing them light together is the lesson.
    const CHIP_W = 252, CHIP_GAP = 24;
    const chipX = i => (1200 - (CHIP_W * 4 + CHIP_GAP * 3)) / 2 + i * (CHIP_W + CHIP_GAP);  // 60 / 336 / 612 / 888
    const tsChip = valChip({ x: chipX(0), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'deletionTimestamp', value: 'none', cat: 'storage' });
    const shownChip = valChip({ x: chipX(1), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'kubectl shows', value: 'Bound', cat: 'storage' });
    const finalChip = valChip({ x: chipX(2), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'finalizers', value: 'pvc-protection', cat: 'storage' });
    const usersChip = valChip({ x: chipX(3), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'consumers', value: '1 Pod', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): the blocks and the disk, then every lane above them, then the lane
    // captions, then the Pod so it sits above the axis that ends on its edge, then the disk spec,
    // then the chip strip, then the packet layer so every ball rides above everything.
    [pvc, kubectl, ctrl, disk].forEach(el => root.appendChild(el));
    [lMountLow, lMountHigh, lDelPvc, lDelPod, lRmFinal].forEach(el => root.appendChild(el));
    [mountLbl, verdictLbl].forEach(el => root.appendChild(el));
    root.appendChild(web.group);
    root.appendChild(text({ class: 'scheme-label code dim', x: CX, y: SPEC_Y, 'text-anchor': 'middle' }, ['the backing disk']));
    [tsChip, shownChip, finalChip, usersChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, web: web.group, app: web.innerBox,
      pvc, kubectl, ctrl, disk,
      lMountLow, lMountHigh, lDelPvc, lDelPod, lRmFinal,
      tsChip, shownChip, finalChip, usersChip,
      wires: { mount: mountLbl, verdict: verdictLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

// A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
// holds the previous step value at call time (clearHL clears the class, not the text) and steps are
// always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}
function setChips(s, { ts, shown, finalizers, users }) {
  setChip(s.refs.tsChip, ts);
  setChip(s.refs.shownChip, shown);
  setChip(s.refs.finalChip, finalizers);
  setChip(s.refs.usersChip, users);
}

// Every step pins EVERY opacity that any step can change, so a step can never inherit a stale one and
// a cancel mid-flight always lands on this step's own end state.
function setStage(s, { web, pvc, kubectl, ctrl, mountLow, mountHigh, delPvc, delPod, rmFinal }) {
  s.refs.web.style.opacity = String(web);
  s.refs.pvc.style.opacity = String(pvc);
  s.refs.kubectl.style.opacity = String(kubectl);
  s.refs.ctrl.style.opacity = String(ctrl);
  s.refs.lMountLow.style.opacity = String(mountLow);
  s.refs.lMountHigh.style.opacity = String(mountHigh);
  s.refs.lDelPvc.style.opacity = String(delPvc);
  s.refs.lDelPod.style.opacity = String(delPod);
  s.refs.lRmFinal.style.opacity = String(rmFinal);
}

// app is listed so its .highlight is cleared every step: without it a highlight set during a reduced
// replay would leak forward, since replay never runs the motion path that would re-clear it.
function clearHL(s) {
  clearHighlights(s, ['pvc', 'kubectl', 'ctrl', 'disk', 'app',
    'tsChip', 'shownChip', 'finalChip', 'usersChip'], [s.refs.web]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Pod web-0 is running and mounts data-claim, which is Bound to a real disk. The claim already carries one finalizer, kubernetes.io slash pvc-protection. The controller put it there when the claim was created, not when a Pod picked it up, so the protection is standing before anything needs it.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ts: 'none', shown: 'Bound', finalizers: 'pvc-protection', users: '1 Pod' });
      setBoxSublabel(s.refs.pvc, 'phase Bound');
      setStage(s, { web: 1, pvc: 1, kubectl: 0, ctrl: 0, mountLow: 1, mountHigh: 1, delPvc: 0, delPod: 0, rmFinal: 0 });
    },
  },
  {
    id: 'in-use',
    duration: 3400,
    narration: 'The claim is a handle, and the volume behind it is what stores the bytes. Kubelet resolved data-claim to data-vol and mounted it at slash data, so the app writes through the claim into the disk. That live mount is the thing the finalizer is guarding.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ts: 'none', shown: 'Bound', finalizers: 'pvc-protection', users: '1 Pod' });
      setBoxSublabel(s.refs.pvc, 'phase Bound');
      setStage(s, { web: 1, pvc: 1, kubectl: 0, ctrl: 0, mountLow: 1, mountHigh: 1, delPvc: 0, delPod: 0, rmFinal: 0 });
      setWire(s, 'mount', 'mounted at /data');
      setWire(s, 'verdict', 'Bound to data-vol');
      // Static end state: the whole chain is live by the end of the ascent.
      s.refs.disk.classList.add('highlight');
      s.refs.pvc.classList.add('highlight');
      s.refs.app.classList.add('highlight');
      if (ctx.reduced) return;
      // Only the disk is lit to begin with, because only the disk sends a ball. The claim and the
      // container are destinations and each earns its light at its own arrival.
      s.refs.pvc.classList.remove('highlight');
      s.refs.app.classList.remove('highlight');
      const hop1 = routePacket(s, ctx, W_MOUNT_LOW, { cat: 'storage' });
      lightBoxAt(s.refs.pvc, ctx, hop1.arrivalMs);
      const hop2 = routePacket(s, ctx, W_MOUNT_HIGH, { delay: hop1.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, '/data', W_MOUNT_HIGH, { delay: hop1.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.app, ctx, hop2.arrivalMs);
      pulsePod(s.refs.web, ctx, hop2.arrivalMs);
    },
  },
  {
    id: 'delete-request',
    duration: 3200,
    narration: 'You run kubectl delete pvc data-claim. The Api accepts it and writes a deletionTimestamp onto the object. That is all a delete does when finalizers are present: it is a request, recorded on the object, and nothing has been removed yet.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ts: 'set', shown: 'Terminating', finalizers: 'pvc-protection', users: '1 Pod' });
      setBoxSublabel(s.refs.pvc, 'phase Bound, deleting');
      setStage(s, { web: 1, pvc: 1, kubectl: 1, ctrl: 0, mountLow: 1, mountHigh: 1, delPvc: 1, delPod: 0, rmFinal: 0 });
      setWire(s, 'mount', 'mount still live');
      setWire(s, 'verdict', 'marked for deletion');
      s.refs.kubectl.classList.add('highlight');
      s.refs.pvc.classList.add('highlight');
      if (ctx.reduced) return;
      // kubectl sends the ball, so kubectl alone is lit at entry and the claim waits for it to land.
      s.refs.pvc.classList.remove('highlight');
      const del = routePacket(s, ctx, W_DEL_PVC, { cat: 'storage' });
      ridingLabel(s, ctx, 'deletionTimestamp set', W_DEL_PVC);
      lightBoxAt(s.refs.pvc, ctx, del.arrivalMs);
    },
  },
  {
    id: 'finalizer-holds',
    duration: 3200,
    narration: 'Now watch what does not happen. The finalizers list is not empty, so the API server refuses to complete the delete and the object stays exactly where it was. The Pod never noticed: the volume is still mounted and the app is still writing to it, straight through a claim you already deleted.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ts: 'set', shown: 'Terminating', finalizers: 'pvc-protection', users: '1 Pod' });
      setBoxSublabel(s.refs.pvc, 'phase Bound, deleting');
      setStage(s, { web: 1, pvc: 1, kubectl: 0, ctrl: 0, mountLow: 1, mountHigh: 1, delPvc: 0, delPod: 0, rmFinal: 0 });
      setWire(s, 'mount', 'still mounted');
      setWire(s, 'verdict', 'finalizer blocks removal');
      s.refs.pvc.classList.add('highlight');
      s.refs.app.classList.add('highlight');
      if (ctx.reduced) return;
      // The claim is the source here: the mount it still serves is what the step is about, so the
      // write rides up the same axis it did before the delete. No block flash is needed or wanted,
      // the traffic itself is the proof that nothing has changed.
      s.refs.app.classList.remove('highlight');
      const write = routePacket(s, ctx, W_MOUNT_HIGH, { cat: 'storage' });
      ridingLabel(s, ctx, 'writes continue', W_MOUNT_HIGH);
      lightBoxAt(s.refs.app, ctx, write.arrivalMs);
      pulsePod(s.refs.web, ctx, write.arrivalMs);
    },
  },
  {
    id: 'why',
    duration: 3000,
    narration: 'The protection is deliberate. Taking the claim away under a running Pod would pull the mount out from beneath it and could lose writes that are still in flight. The same rule works forwards too: a new Pod that asks for a claim with a deletionTimestamp on it is refused and will not start.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ts: 'set', shown: 'Terminating', finalizers: 'pvc-protection', users: '1 Pod' });
      setBoxSublabel(s.refs.pvc, 'phase Bound, deleting');
      setStage(s, { web: 1, pvc: 1, kubectl: 0, ctrl: 0, mountLow: 1, mountHigh: 1, delPvc: 0, delPod: 0, rmFinal: 0 });
      setWire(s, 'mount', 'held open by web-0');
      setWire(s, 'verdict', 'pinned while in use');
      s.refs.pvc.classList.add('highlight');
      s.refs.app.classList.add('highlight');
      if (ctx.reduced) return;
      // The Pod IS the reason the claim is pinned, so it is the one thing that moves here.
      pulsePod(s.refs.web, ctx, 0);
    },
  },
  {
    id: 'pod-gone',
    duration: 3400,
    narration: 'So remove the reason. The Pod is deleted, or it finishes and is cleaned up, and as it goes kubelet unmounts the volume and the claim loses its last consumer. This is the event the protection controller has been waiting for the whole time.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ts: 'set', shown: 'Terminating', finalizers: 'pvc-protection', users: '0 Pods' });
      setBoxSublabel(s.refs.pvc, 'phase Bound, deleting');
      // The Pod and its half of the axis both end this step gone.
      setStage(s, { web: GONE, pvc: 1, kubectl: 1, ctrl: 0, mountLow: 1, mountHigh: 0, delPvc: 0, delPod: 1, rmFinal: 0 });
      setWire(s, 'verdict', 'last consumer gone');
      s.refs.kubectl.classList.add('highlight');
      if (ctx.reduced) return;
      // The Pod is alive until the delete lands on it, so the motion path restores it and the fade
      // carries it back down to the GONE pinned above.
      setStage(s, { web: 1, pvc: 1, kubectl: 1, ctrl: 0, mountLow: 1, mountHigh: 1, delPvc: 0, delPod: 1, rmFinal: 0 });
      const del = routePacket(s, ctx, W_DEL_POD, { cat: 'storage' });
      ridingLabel(s, ctx, 'delete pod web-0', W_DEL_POD);
      // Down-arrow order, and the Pod is the one thing on stage allowed to pulse: the ball lands, the
      // Pod BLINKS to acknowledge the delete, and only once that blink has landed does it start to go.
      // Fading straight from arrival, as an earlier cut did, skipped the acknowledgement entirely and
      // the Pod just dimmed under an arriving ball, which reads as the ball erasing it rather than as
      // the Pod receiving a delete and then terminating.
      pulsePod(s.refs.web, ctx, del.arrivalMs);
      const goes = del.arrivalMs + BEAT.afterPulse;
      removeAt(s.refs.web, ctx, goes, GONE);
      // The mount goes with the Pod, so the upper lane leaves on the same beat rather than lingering
      // as an arrow pointing at a ghost.
      removeAt(s.refs.lMountHigh, ctx, goes, 0);
    },
  },
  {
    id: 'finalizer-removed',
    duration: 3400,
    narration: 'The pvc-protection controller checks whether any Pod still uses the claim, finds none, and does its one job: it patches the finalizer off the object. The finalizers list is now empty and nothing is holding the outstanding delete back any more.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ts: 'set', shown: 'Terminating', finalizers: 'none', users: '0 Pods' });
      setBoxSublabel(s.refs.pvc, 'phase Bound, deleting');
      setStage(s, { web: GONE, pvc: 1, kubectl: 0, ctrl: 1, mountLow: 1, mountHigh: 0, delPvc: 0, delPod: 0, rmFinal: 1 });
      setWire(s, 'verdict', 'nothing holds it now');
      s.refs.ctrl.classList.add('highlight');
      s.refs.pvc.classList.add('highlight');
      if (ctx.reduced) return;
      // The controller sends the ball, so the claim waits for the patch to land before it lights.
      s.refs.pvc.classList.remove('highlight');
      const rm = routePacket(s, ctx, W_RM_FINAL, { cat: 'storage' });
      ridingLabel(s, ctx, 'finalizers: []', W_RM_FINAL);
      lightBoxAt(s.refs.pvc, ctx, rm.arrivalMs);
    },
  },
  {
    id: 'gone',
    duration: 3000,
    narration: 'With a deletionTimestamp set and an empty finalizers list, the API server completes the delete it accepted six steps ago and the record leaves etcd. The disk itself is a separate question, settled by the reclaim policy on the volume. The lesson of a stuck Terminating claim is short: go and find the Pod that is still mounting it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ts: 'gone with object', shown: 'not found', finalizers: 'none', users: '0 Pods' });
      // The claim and the rest of the axis end this step gone. The disk stays: it outlives the claim.
      setStage(s, { web: GONE, pvc: GONE, kubectl: 0, ctrl: 0, mountLow: 0, mountHigh: 0, delPvc: 0, delPod: 0, rmFinal: 0 });
      setWire(s, 'verdict', 'object removed from etcd');
      if (ctx.reduced) return;
      // The removal is the motion of this step: the claim fades and takes its half of the axis with
      // it, so nothing here needs a flash to look alive.
      setStage(s, { web: GONE, pvc: 1, kubectl: 0, ctrl: 0, mountLow: 1, mountHigh: 0, delPvc: 0, delPod: 0, rmFinal: 0 });
      removeAt(s.refs.pvc, ctx, 200, GONE);
      removeAt(s.refs.lMountLow, ctx, 200, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
