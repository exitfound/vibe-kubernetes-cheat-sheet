import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, pod, podShell, cylinder, pathArrow } from '../../lib/primitives.js';
import { valChip, setVal, setChip, setBoxSublabel, pulsePod, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt, makeRidingLabel, OPACITY } from './storage-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#storage-pvc-protection


const CX = 600;                                                // canvas + identity-spine center
const TIER = 162;                                              // the one vertical pitch

const POD_W = 240, POD_H = 104, POD_X = CX - POD_W / 2, POD_Y = 56;
const POD_BOTTOM = POD_Y + POD_H, POD_MID = POD_Y + POD_H / 2, POD_RIGHT = POD_X + POD_W; // 160 / 108 / 720

const PVC_W = 240, PVC_H = 68, PVC_X = CX - PVC_W / 2, PVC_Y = 236;
const PVC_BOTTOM = PVC_Y + PVC_H, PVC_MID = PVC_Y + PVC_H / 2, PVC_RIGHT = PVC_X + PVC_W; // 304 / 270 / 720

const DISK_W = 230, DISK_H = 86, DISK_Y = 389;
const DISK_TOP = DISK_Y, DISK_BOTTOM = DISK_Y + DISK_H;        // 389 / 475

// Two actors, one footprint, the standard controller box, one on each side of the identity spine so
// the card is not a stack with everything hanging off its right. Both sit at or below the claim tier,
// which is what keeps the left one clear of the narration panel (its bottom is 230 on this card).
// kubectl is level with the claim it deletes, the controller one tier below it.
const ACT_W = 220, ACT_H = 72;
const ACT_R_X = 850, ACT_R_CX = ACT_R_X + ACT_W / 2;           // 850..1070 / 960
const ACT_L_X = 130, ACT_L_CX = ACT_L_X + ACT_W / 2;           // 130..350 / 240
const KUBECTL_Y = PVC_MID - ACT_H / 2;                         // 234
const CTRL_MID = PVC_MID + TIER, CTRL_Y = CTRL_MID - ACT_H / 2;             // 432 / 396

const MOUNT_LBL_X = CX + 16, MOUNT_LBL_Y = 204;
// Under the claim rather than beside it: the controller lane now runs into the claim's left face.
const VERDICT_LBL_X = PVC_X - 16, VERDICT_LBL_Y = PVC_BOTTOM + 20;  // 464 / 324, anchored end
// cylinder() draws its own name on the baseline h/2+5, so the spec line goes 14 below it.
const SPEC_Y = DISK_Y + DISK_H / 2 + 5 + 14;                   // 451
const CHIP_Y = 545, CHIP_H = 34;                               // strip ends at 579


// Each lane and its ball share one points array, so the two cannot drift apart, and every endpoint
// sits on a block edge so no ball ever travels underneath a box.
const W_MOUNT_LOW  = [[CX, DISK_TOP], [CX, PVC_BOTTOM]];       // disk -> claim, upward
const W_MOUNT_HIGH = [[CX, PVC_Y], [CX, POD_BOTTOM]];          // claim -> Pod, upward
// kubectl deletes the claim it is level with: straight horizontal, no turn. Deleting the Pod climbs
// its own column first, so the two requests never share a lane.
const W_DEL_PVC = [[ACT_R_X, PVC_MID], [PVC_RIGHT, PVC_MID]];
const W_DEL_POD = [[ACT_R_CX, KUBECTL_Y], [ACT_R_CX, POD_MID], [POD_RIGHT, POD_MID]];
// The controller reaches the claim from the other side, so a delete request and a finalizer removal
// are never drawn on the same run of canvas.
const W_RM_FINAL = [[ACT_L_CX, CTRL_Y], [ACT_L_CX, PVC_MID], [PVC_X, PVC_MID]];

// Fades an object out of existence when the delete that removes it lands, and takes its lit stroke
// with it: a block that has gone dark must not keep glowing, or it reads as deleted-but-still-live.
function removeAt(el, ctx, delay = 0, to = OPACITY.terminated) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = String(to); el.classList.remove('highlight'); return; }
  const a = el.animate([{ opacity: 1 }, { opacity: to }], { duration: 500, delay, fill: 'forwards', easing: 'ease-in' });
  a.onfinish = () => el.classList.remove('highlight');
  ctx.register(a);
}

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

// A Pod is a shell plus an inner box, wrapped in a g so pulsePod reaches BOTH. querySelectorAll
// matches descendants only, so pulsing a bare pod() would fire at half strength.
function podBlock() {
  const shell = podShell({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'volumes: data-claim', containers: 0, role: 'storage' });
  const innerBox = box({ x: POD_X + 20, y: POD_Y + (POD_H - 52) / 2, w: POD_W - 40, h: 52, label: 'app', sublabel: 'writes to /data', role: 'storage' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

// Every lane in this card is a ROUTE: something travels all of them, so they are all dashed, all
// carry a head, and all are built from the same points array as their ball.
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
      'aria-label': 'Why a deleted PersistentVolumeClaim sits in Terminating. The StorageObjectInUseProtection admission plugin puts the kubernetes.io slash pvc-protection finalizer on every claim when it is created. Deleting the claim only sets a deletionTimestamp on it, and because the finalizers list is not empty the API server will not complete the delete, so the object stays and the Pod keeps its mount. Its status phase is still Bound the whole time and only kubectl prints the word Terminating. Once the last consuming Pod is gone the controller removes the finalizer, the list empties, and only then does the API server take the object out of ETCD.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const web = podBlock();
    const pvc = box({ x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-claim', sublabel: 'phase Bound', role: 'storage' });
    const kubectl = box({ x: ACT_R_X, y: KUBECTL_Y, w: ACT_W, h: ACT_H, label: 'kubectl delete', sublabel: 'issues the request', role: 'storage' });
    const ctrl = box({ x: ACT_L_X, y: CTRL_Y, w: ACT_W, h: ACT_H, label: 'PVC protection', sublabel: 'the controller', role: 'storage' });
    const disk = cylinder({ x: CX - DISK_W / 2, y: DISK_Y, w: DISK_W, h: DISK_H, label: 'PV data-vol', role: 'storage' });
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

    const mountLbl = text({ class: 'scheme-label code dim', x: MOUNT_LBL_X, y: MOUNT_LBL_Y, 'text-anchor': 'start' }, [' ']);
    const verdictLbl = text({ class: 'scheme-label code dim', x: VERDICT_LBL_X, y: VERDICT_LBL_Y, 'text-anchor': 'end' }, [' ']);

    // Four chips over the card's own width. They are NOT one width: the first carries the longest
    // name and the longest value on the card (deletionTimestamp against gone with object) and at the
    // shared 252 the two strings met with one unit to spare, which is a collision on any re-measure.
    const CHIP_GAP = 24, CHIP_WS = [312, 232, 244, 220];   // 1008 + 3 gaps = the full 60..1140 strip
    const chipX = i => 60 + CHIP_WS.slice(0, i).reduce((a, w) => a + w + CHIP_GAP, 0);   // 60 / 396 / 652 / 920
    const tsChip = valChip({ x: chipX(0), y: CHIP_Y, w: CHIP_WS[0], h: CHIP_H, name: 'deletionTimestamp', value: 'none', role: 'storage' });
    const shownChip = valChip({ x: chipX(1), y: CHIP_Y, w: CHIP_WS[1], h: CHIP_H, name: 'kubectl shows', value: 'Bound', role: 'storage' });
    const finalChip = valChip({ x: chipX(2), y: CHIP_Y, w: CHIP_WS[2], h: CHIP_H, name: 'finalizers', value: 'pvc-protection', role: 'storage' });
    const usersChip = valChip({ x: chipX(3), y: CHIP_Y, w: CHIP_WS[3], h: CHIP_H, name: 'consumers', value: '1 Pod', role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

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
      const hop1 = routePacket(s, ctx, W_MOUNT_LOW, { role: 'storage' });
      lightBoxAt(s.refs.pvc, ctx, hop1.arrivalMs);
      const hop2 = routePacket(s, ctx, W_MOUNT_HIGH, { delay: hop1.arrivalMs + BEAT.afterHop, role: 'storage' });
      ridingLabel(s, ctx, '/data', W_MOUNT_HIGH, { delay: hop1.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.app, ctx, hop2.arrivalMs);
      pulsePod(s.refs.web, ctx, hop2.arrivalMs);
    },
  },
  {
    id: 'delete-request',
    duration: 3200,
    narration: 'You run kubectl delete pvc data-claim. The API accepts it and writes a deletionTimestamp onto the object. That is all a delete does when finalizers are present: it is a request, recorded on the object, and nothing has been removed yet.',
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
      const del = routePacket(s, ctx, W_DEL_PVC, { role: 'storage' });
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
      s.refs.app.classList.remove('highlight');
      const write = routePacket(s, ctx, W_MOUNT_HIGH, { role: 'storage' });
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
    narration: 'So remove the reason. The Pod is deleted, or it finishes and is cleaned up, and as it goes Kubelet unmounts the volume and the claim loses its last consumer. This is the event the protection controller has been waiting for the whole time.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ts: 'set', shown: 'Terminating', finalizers: 'pvc-protection', users: '0 Pods' });
      setBoxSublabel(s.refs.pvc, 'phase Bound, deleting');
      // The Pod and its half of the axis both end this step gone.
      setStage(s, { web: OPACITY.terminated, pvc: 1, kubectl: 1, ctrl: 0, mountLow: 1, mountHigh: 0, delPvc: 0, delPod: 1, rmFinal: 0 });
      setWire(s, 'verdict', 'last consumer gone');
      s.refs.kubectl.classList.add('highlight');
      if (ctx.reduced) return;
      // The Pod is alive until the delete lands on it, so the motion path restores it and the fade
      // carries it back down to the OPACITY.terminated pinned above.
      setStage(s, { web: 1, pvc: 1, kubectl: 1, ctrl: 0, mountLow: 1, mountHigh: 1, delPvc: 0, delPod: 1, rmFinal: 0 });
      const del = routePacket(s, ctx, W_DEL_POD, { role: 'storage' });
      ridingLabel(s, ctx, 'delete pod web-0', W_DEL_POD);
      pulsePod(s.refs.web, ctx, del.arrivalMs);
      const goes = del.arrivalMs + BEAT.afterPulse;
      removeAt(s.refs.web, ctx, goes, OPACITY.terminated);
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
      setStage(s, { web: OPACITY.terminated, pvc: 1, kubectl: 0, ctrl: 1, mountLow: 1, mountHigh: 0, delPvc: 0, delPod: 0, rmFinal: 1 });
      setWire(s, 'verdict', 'nothing holds it now');
      s.refs.ctrl.classList.add('highlight');
      s.refs.pvc.classList.add('highlight');
      if (ctx.reduced) return;
      // The controller sends the ball, so the claim waits for the patch to land before it lights.
      s.refs.pvc.classList.remove('highlight');
      const rm = routePacket(s, ctx, W_RM_FINAL, { role: 'storage' });
      ridingLabel(s, ctx, 'finalizers: []', W_RM_FINAL);
      lightBoxAt(s.refs.pvc, ctx, rm.arrivalMs);
    },
  },
  {
    id: 'gone',
    duration: 3000,
    narration: 'With a deletionTimestamp set and an empty finalizers list, the API server completes the delete it accepted five steps ago and the record leaves ETCD. The disk itself is a separate question, settled by the reclaim policy on the volume. The lesson of a stuck Terminating claim is short: go and find the Pod that is still mounting it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ts: 'gone with object', shown: 'not found', finalizers: 'none', users: '0 Pods' });
      // The claim and the rest of the axis end this step gone. The disk stays: it outlives the claim.
      setStage(s, { web: OPACITY.terminated, pvc: OPACITY.terminated, kubectl: 0, ctrl: 0, mountLow: 0, mountHigh: 0, delPvc: 0, delPod: 0, rmFinal: 0 });
      setWire(s, 'verdict', 'object removed from etcd');
      if (ctx.reduced) return;
      // The removal is the motion of this step: the claim fades and takes its half of the axis with
      // it, so nothing here needs a flash to look alive.
      setStage(s, { web: OPACITY.terminated, pvc: 1, kubectl: 0, ctrl: 0, mountLow: 1, mountHigh: 0, delPvc: 0, delPod: 0, rmFinal: 0 });
      removeAt(s.refs.pvc, ctx, 200, OPACITY.terminated);
      removeAt(s.refs.lMountLow, ctx, 200, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
