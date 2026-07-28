import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, node, cylinder, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, routePacket, makeInit, clearHighlights, clearWires, setWire, relationPath, BEAT, FADE, lightBoxAt, makeRidingLabel, OPACITY } from '../lib/storage-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#storage-volume-snapshot


const CX = 600;

const REQ_X = 420, REQ_Y = 36, REQ_W = 360, REQ_H = 68;
const REQ_RIGHT = REQ_X + REQ_W;                                            // 780
const REQ_MY = REQ_Y + REQ_H / 2, REQ_BOTTOM = REQ_Y + REQ_H;               // 70 / 104

const RST_X = 840, RST_W = 240;
const RST_CX = RST_X + RST_W / 2;                                           // 960

// The middle row is three 232 wide boxes on one line, so its left box lands at 144..376 whatever the
// spread, which is under the narration panel (x<=397 down to y=280 on this card). The row therefore
// starts BELOW the panel floor, and the chain runs right to left so the request from the top row
// reaches the controller on the free side instead of diving behind the panel to get to it.
const MID_Y = 282, MID_H = 68, MID_BOTTOM = MID_Y + MID_H;                  // 350
const MID_W = 232, MID_SPREAD = 340, MID_MY = MID_Y + MID_H / 2;            // 316
const MID_CX = [CX - MID_SPREAD, CX, CX + MID_SPREAD];                      // 260 / 600 / 940
const SNAP_CX = MID_CX[0], VSC_CX = MID_CX[1], CTRL_CX = MID_CX[2];
const SNAP_RIGHT = SNAP_CX + MID_W / 2, VSC_LEFT = VSC_CX - MID_W / 2;      // 376 / 484
const VSC_RIGHT = VSC_CX + MID_W / 2, CTRL_LEFT = CTRL_CX - MID_W / 2;      // 716 / 824

const CYL_W = 176, CYL_H = 90;
const FRAME_INSET = 42;
const FRAME_X = 144, FRAME_W = 912, FRAME_Y = 396;                          // 144..1056, below the
const FRAME_H = CYL_H + FRAME_INSET * 2;                                    // middle row, 396..570

const CYL_Y = FRAME_Y + FRAME_INSET;                                        // 438
const CYL_MY = CYL_Y + CYL_H / 2, CYL_TOP = CYL_Y;                          // 443 / 398
const CYL_SPREAD = 300;
const SRC_CX = CX - CYL_SPREAD, SNAPDATA_CX = CX, RESTORED_CX = CX + CYL_SPREAD;   // 300 / 600 / 900
// Three disks 176 wide at 300/600/900 span 212..988 inside a frame at 144..1056, so the frame keeps 68
// of margin on each side and the disks keep 124 between them, which is the run each shelf hop travels.

// Kept clear of the frame rather than midway to it: the middle row now sits much closer.
const CORRIDOR_Y = FRAME_Y - 18;                            // 378
const REQ_CORRIDOR_Y = 157;
const CAPTION_Y = CYL_Y + CYL_H + 24;             // 552
const CHIPS_Y = 588;                              // 18 below the frame, and 18 above the canvas floor

// The request goes down and the mirrored status goes up, so the two share the VolumeSnapshot floor
// as a pair either side of its midpoint instead of running on one another.
const REQ_LANE = 16;
const W_REQ_CTRL  = [[CX - REQ_LANE, REQ_BOTTOM], [CX - REQ_LANE, REQ_CORRIDOR_Y], [CTRL_CX, REQ_CORRIDOR_Y], [CTRL_CX, MID_Y]];
const W_CTRL_VSC  = [[CTRL_LEFT, MID_MY], [VSC_RIGHT, MID_MY]];
const W_VSC_SNAP  = [[VSC_LEFT, MID_MY], [SNAP_RIGHT, MID_MY]];
const W_CREATE    = [[SNAP_CX, MID_BOTTOM], [SNAP_CX, CORRIDOR_Y], [SNAPDATA_CX, CORRIDOR_Y], [SNAPDATA_CX, CYL_TOP]];
// The driver answers back up the same lane, reversed, so the two hops read as one call and its return.
const W_ACK       = [...W_CREATE].reverse();
const W_SNAP_VSC  = [[SNAP_RIGHT, MID_MY], [VSC_LEFT, MID_MY]];
const W_VSC_REQ   = [[CX + REQ_LANE, MID_Y], [CX + REQ_LANE, REQ_BOTTOM]];
const W_COPY      = [[SRC_CX + CYL_W / 2, CYL_MY], [SNAPDATA_CX - CYL_W / 2, CYL_MY]];
const W_SEED      = [[SNAPDATA_CX + CYL_W / 2, CYL_MY], [RESTORED_CX - CYL_W / 2, CYL_MY]];

// An object materialises when the call that creates it lands, so no arrowhead is ever aimed at
// nothing. LAND_MS is shorter than BEAT.lead for the same reason.
const LAND_MS = 500;
function revealAt(el, ctx, delay = 0, from = 0) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = '1'; return; }
  el.style.opacity = String(from);
  ctx.register(el.animate([{ opacity: from }, { opacity: 1 }], { duration: LAND_MS, delay, fill: 'forwards', easing: 'ease-out' }));
}

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

const lane = points => pathArrow({ points, dashed: true, dim: true, role: 'storage' });

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Volume Snapshots: a VolumeSnapshot is the namespaced request like a PVC and a VolumeSnapshotClass names the CSI driver, the snapshot controller creates the cluster-scoped VolumeSnapshotContent and binds the two one to one before anything is taken, that content is what wakes the CSI snapshotter sidecar which calls CreateSnapshot on the driver, the driver returns a handle that the sidecar writes into the content status with readyToUse true and the controller mirrors up onto the snapshot, and a new PVC with a dataSource then seeds a fresh volume from it, but all of it lives in the same storage system as the source so a snapshot is not a backup',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const req = box({
      x: REQ_X, y: REQ_Y, w: REQ_W, h: REQ_H,
      label: 'VolumeSnapshot snap-1', sublabel: 'volumeSnapshotClassName: ebs-snapclass', role: 'storage',
    });
    const restore = box({
      x: RST_X, y: REQ_Y, w: RST_W, h: REQ_H,
      label: 'PVC restore-1', sublabel: 'dataSource: snap-1', role: 'storage',
    });
    restore.style.opacity = '0';

    // One per cluster and shipped independently of any driver, which is exactly why it is a separate
    // block from the sidecar rather than folded into it.
    const ctrl = box({ x: CTRL_CX - MID_W / 2, y: MID_Y, w: MID_W, h: MID_H, label: 'Snapshot-controller', sublabel: 'one per cluster', role: 'storage' });
    const vsc = box({ x: VSC_CX - MID_W / 2, y: MID_Y, w: MID_W, h: MID_H, label: 'VolumeSnapshotContent', sublabel: 'cluster-scoped', role: 'storage' });
    vsc.style.opacity = '0';
    // The sidecar rides beside the driver named by the class, which is what the sublabel states.
    const snapper = box({ x: SNAP_CX - MID_W / 2, y: MID_Y, w: MID_W, h: MID_H, label: 'External-snapshotter', sublabel: 'driver: ebs.csi.aws.com', role: 'storage' });

    const frame = node({ x: FRAME_X, y: FRAME_Y, w: FRAME_W, h: FRAME_H, label: 'Storage backend' });

    const mkCyl = (cx, label) => {
      const c = cylinder({ x: cx - CYL_W / 2, y: CYL_Y, w: CYL_W, h: CYL_H, label, role: 'storage' });
      // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse
      // is not part of the visible front face. Re-centre on the face, derived from the height.
      const l = c.querySelector('.scheme-cylinder-label');
      if (l) l.setAttribute('y', CYL_H / 2 + 10);
      return c;
    };
    const src = mkCyl(SRC_CX, 'Source Volume');
    const snapData = mkCyl(SNAPDATA_CX, 'Snapshot Data');
    snapData.style.opacity = '0';
    const restored = mkCyl(RESTORED_CX, 'Restored Volume');
    restored.style.opacity = '0';

    // dataSource: the restore claim references the snapshot. Also a relationship, so no arrowhead.
    const dsRef = relationPath({ points: [[REQ_RIGHT, REQ_MY], [RST_X, REQ_MY]], role: 'storage', dash: '5 5' });
    dsRef.style.opacity = '0';

    const wReqCtrl = lane(W_REQ_CTRL);
    const wCtrlVsc = lane(W_CTRL_VSC);
    const wVscSnap = lane(W_VSC_SNAP);
    const wCreate = lane(W_CREATE);
    const wAck = lane(W_ACK);
    const wSnapVsc = lane(W_SNAP_VSC);
    const wVscReq = lane(W_VSC_REQ);
    const wCopy = lane(W_COPY);
    const wSeed = lane(W_SEED);
    const LANES = ['wReqCtrl', 'wCtrlVsc', 'wVscSnap', 'wCreate', 'wAck', 'wSnapVsc', 'wVscReq', 'wCopy', 'wSeed'];
    [wReqCtrl, wCtrlVsc, wVscSnap, wCreate, wAck, wSnapVsc, wVscReq, wCopy, wSeed].forEach(w => { w.style.opacity = '0'; });

    const srcLbl = text({ class: 'scheme-label code dim', x: SRC_CX, y: CAPTION_Y, 'text-anchor': 'middle' }, [' ']);
    const snapLbl = text({ class: 'scheme-label code dim', x: SNAPDATA_CX, y: CAPTION_Y, 'text-anchor': 'middle' }, [' ']);
    const restoredLbl = text({ class: 'scheme-label code dim', x: RESTORED_CX, y: CAPTION_Y, 'text-anchor': 'middle' }, [' ']);

    const CHIP_W = 232, CHIP_GAP = 16;
    const CHIPS_W = CHIP_W * 4 + CHIP_GAP * 3;                  // 976
    const CHIPS_X = CX - CHIPS_W / 2;                           // 112, so the strip centres on CX
    const chipX = i => CHIPS_X + i * (CHIP_W + CHIP_GAP);
    // Every one of these is a real field except the last, which is the point of the card rather than a
    // status: 'Content' is status.boundVolumeSnapshotContentName, whose full name is too long to print.
    const contChip  = valChip({ x: chipX(0), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'Content',        value: 'none',        role: 'storage' });
    const handChip  = valChip({ x: chipX(1), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'snapshotHandle', value: 'none',        role: 'storage' });
    const readyChip = valChip({ x: chipX(2), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'readyToUse',     value: 'false',       role: 'storage' });
    const storeChip = valChip({ x: chipX(3), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'stored',         value: 'same system', role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    [frame, req, restore, ctrl, vsc, snapper, src, snapData, restored].forEach(el => root.appendChild(el));
    [dsRef, wReqCtrl, wCtrlVsc, wVscSnap, wCreate, wAck, wSnapVsc, wVscReq, wCopy, wSeed,
      srcLbl, snapLbl, restoredLbl].forEach(el => root.appendChild(el));
    [contChip, handChip, readyChip, storeChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, req, restore, ctrl, vsc, snapper, frame, src, snapData, restored,
      dsRef, wReqCtrl, wCtrlVsc, wVscSnap, wCreate, wAck, wSnapVsc, wVscReq, wCopy, wSeed,
      LANES,
      contChip, handChip, readyChip, storeChip,
      wires: { srcCap: srcLbl, snapCap: snapLbl, restoredCap: restoredLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}

// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a card
// comes to report readyToUse true on the step that is still taking the snapshot.
function setChips(s, { cont, hand, ready, store }) {
  setChip(s.refs.contChip, cont);
  setChip(s.refs.handChip, hand);
  setChip(s.refs.readyChip, ready);
  setChip(s.refs.storeChip, store);
}

function setStage(s, { vsc = OPACITY.pending, restore = 0, snapData = OPACITY.pending, restored = OPACITY.pending, ds = 0, lanes = [] } = {}) {
  s.refs.vsc.style.opacity = String(vsc);
  s.refs.restore.style.opacity = String(restore);
  s.refs.snapData.style.opacity = String(snapData);
  s.refs.restored.style.opacity = String(restored);
  s.refs.dsRef.style.opacity = String(ds);
  s.refs.LANES.forEach(k => { s.refs[k].style.opacity = lanes.includes(k) ? '1' : '0'; });
}

function clearHL(s) {
  clearHighlights(s, ['req', 'restore', 'ctrl', 'vsc', 'snapper', 'src', 'snapData', 'restored',
    'contChip', 'handChip', 'readyChip', 'storeChip'], []);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A source volume is in use in the storage backend, bound to a claim named data-1. You create a VolumeSnapshot named snap-1 whose source is that claim. This object is the namespaced request, the exact counterpart of a PVC, and right now nothing is bound behind it and readyToUse is false.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cont: 'none', hand: 'none', ready: 'false', store: 'same system' });
      setStage(s);
      setBoxSublabel(s.refs.req, 'volumeSnapshotClassName: ebs-snapclass');
      setWire(s, 'srcCap', 'claim data-1');
      setWire(s, 'snapCap', 'not taken yet');
    },
  },
  {
    id: 'class',
    duration: 2600,
    narration: 'The snapshot names a VolumeSnapshotClass, and that class carries the driver field naming the CSI plugin that knows how to take snapshots, plus a deletionPolicy of Delete or Retain that decides whether the real snapshot outlives the object. It is the same shape as a StorageClass one level up: the request states intent, the class states which driver carries it out.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cont: 'none', hand: 'none', ready: 'false', store: 'same system' });
      setStage(s);
      setWire(s, 'srcCap', 'claim data-1');
      setWire(s, 'snapCap', 'not taken yet');
      // Both ends of the class relationship light and hold: the request that names the class, and the
      // sidecar that rides beside the driver the class names. No blink: see the PULSE MODEL note.
      s.refs.req.classList.add('highlight');
      s.refs.snapper.classList.add('highlight');
    },
  },
  {
    id: 'bind',
    // Two chained hops plus the bound link drawing itself in once both ends exist.
    duration: 4400,
    narration: 'The snapshot controller runs once per cluster, independent of any driver, and watches both kinds of object. It picks up the new request, creates a VolumeSnapshotContent for it and binds the two one to one. This cluster-scoped object is the counterpart of a PV, and it exists before any snapshot has been taken.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cont: 'snapcontent-9f2', hand: 'none', ready: 'false', store: 'same system' });
      setStage(s, { vsc: 1, lanes: ['wReqCtrl', 'wCtrlVsc'] });
      setBoxSublabel(s.refs.req, 'bound to snapcontent-9f2');
      setWire(s, 'srcCap', 'claim data-1');
      setWire(s, 'snapCap', 'not taken yet');
      // The request is where the first ball departs from, so it is lit at entry. The controller and the
      // object it writes are receivers and earn their highlights on arrival.
      s.refs.req.classList.add('highlight');
      if (ctx.reduced) { s.refs.ctrl.classList.add('highlight'); s.refs.vsc.classList.add('highlight'); return; }
      setStage(s, { lanes: ['wReqCtrl', 'wCtrlVsc'] });
      const watch = routePacket(s, ctx, W_REQ_CTRL, { delay: BEAT.lead, role: 'storage' });
      // Rides BELOW the ball, the only tag on the card that does: see the dy note on ridingLabel.
      ridingLabel(s, ctx, 'snap-1', W_REQ_CTRL, { delay: BEAT.lead, dy: 22 });
      lightBoxAt(s.refs.ctrl, ctx, watch.arrivalMs);
      const write = routePacket(s, ctx, W_CTRL_VSC, { delay: watch.arrivalMs + BEAT.afterHop, role: 'storage' });
      ridingLabel(s, ctx, 'create and bind', W_CTRL_VSC, { delay: watch.arrivalMs + BEAT.afterHop });
      revealAt(s.refs.vsc, ctx, write.arrivalMs, OPACITY.pending);
      lightBoxAt(s.refs.vsc, ctx, write.arrivalMs);
    },
  },
  {
    id: 'create',
    duration: 5200,
    narration: 'Creating that content is what wakes the CSI snapshotter sidecar. It watches VolumeSnapshotContent objects and never the request itself, and it calls CreateSnapshot on the driver. The backend freezes a point in time copy beside the source, usually by reference rather than by duplicating every byte.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cont: 'snapcontent-9f2', hand: 'creating', ready: 'false', store: 'same system' });
      setStage(s, { vsc: 1, snapData: 1, lanes: ['wVscSnap', 'wCreate', 'wCopy'] });
      setBoxSublabel(s.refs.req, 'bound to snapcontent-9f2');
      setWire(s, 'srcCap', 'claim data-1');
      setWire(s, 'snapCap', 'point-in-time copy');
      // The content is where the first ball departs from, so it is lit at entry.
      s.refs.vsc.classList.add('highlight');
      if (ctx.reduced) {
        s.refs.snapper.classList.add('highlight');
        s.refs.src.classList.add('highlight');
        s.refs.snapData.classList.add('highlight');
        return;
      }
      setStage(s, { vsc: 1, lanes: ['wVscSnap', 'wCreate', 'wCopy'] });
      const wake = routePacket(s, ctx, W_VSC_SNAP, { delay: BEAT.lead, role: 'storage' });
      ridingLabel(s, ctx, 'new content', W_VSC_SNAP, { delay: BEAT.lead });
      lightBoxAt(s.refs.snapper, ctx, wake.arrivalMs);
      const call = routePacket(s, ctx, W_CREATE, { delay: wake.arrivalMs + BEAT.afterHop, role: 'storage' });
      ridingLabel(s, ctx, 'CreateSnapshot', W_CREATE, { delay: wake.arrivalMs + BEAT.afterHop });
      revealAt(s.refs.snapData, ctx, call.arrivalMs, OPACITY.pending);
      // The copy itself: the point in time frozen out of the source into the new snapshot, which is the
      // whole reason both disks sit inside one backend frame.
      const copy = routePacket(s, ctx, W_COPY, { delay: call.arrivalMs + LAND_MS, role: 'storage' });
      lightBoxAt(s.refs.src, ctx, call.arrivalMs + LAND_MS);
      lightBoxAt(s.refs.snapData, ctx, copy.arrivalMs);
    },
  },
  {
    id: 'ready',
    // Three chained hops back up the chain: driver to sidecar, sidecar to content, content to request.
    duration: 5000,
    narration: 'The driver returns a snapshot handle. The sidecar writes it into the content status and flips readyToUse to true, and the controller mirrors that status up onto snap-1, which can now be consumed. Note where the data sits: on the same storage system as the source, right beside it. If that system fails both are lost, so a snapshot is not a backup.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cont: 'snapcontent-9f2', hand: 'snap-0c41', ready: 'true', store: 'not a backup' });
      setStage(s, { vsc: 1, snapData: 1, lanes: ['wAck', 'wSnapVsc', 'wVscReq'] });
      setBoxSublabel(s.refs.req, 'bound to snapcontent-9f2');
      setWire(s, 'srcCap', 'same system');
      setWire(s, 'snapCap', 'same system');
      s.refs.snapData.classList.add('highlight');
      s.refs.ctrl.classList.add('highlight');
      if (ctx.reduced) {
        s.refs.snapper.classList.add('highlight');
        s.refs.vsc.classList.add('highlight');
        s.refs.req.classList.add('highlight');
        return;
      }
      const ack = routePacket(s, ctx, W_ACK, { delay: BEAT.lead, role: 'storage' });
      ridingLabel(s, ctx, 'snapshotHandle', W_ACK, { delay: BEAT.lead });
      lightBoxAt(s.refs.snapper, ctx, ack.arrivalMs);
      const status = routePacket(s, ctx, W_SNAP_VSC, { delay: ack.arrivalMs + BEAT.afterHop, role: 'storage' });
      ridingLabel(s, ctx, 'readyToUse true', W_SNAP_VSC, { delay: ack.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.vsc, ctx, status.arrivalMs);
      const mirror = routePacket(s, ctx, W_VSC_REQ, { delay: status.arrivalMs + BEAT.afterHop, role: 'storage' });
      // Rides BELOW the ball: this hop ends ON the request box bottom edge, and above the ball the tag
      // would print across the box sublabel. See the dy note on ridingLabel.
      ridingLabel(s, ctx, 'status mirrored', W_VSC_REQ, { delay: status.arrivalMs + BEAT.afterHop, dy: 22 });
      lightBoxAt(s.refs.req, ctx, mirror.arrivalMs);
    },
  },
  {
    id: 'restore',
    duration: 3600,
    narration: 'To restore, create a brand new PVC whose dataSource names snap-1. The external-provisioner resolves that through the bound content and asks the driver for a fresh volume seeded from the snapshot. The original is untouched, the restore is a separate independent disk, and all three of them still sit in the same backend.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cont: 'snapcontent-9f2', hand: 'snap-0c41', ready: 'true', store: 'not a backup' });
      setStage(s, { vsc: 1, snapData: 1, restored: 1, restore: 1, ds: 1, lanes: ['wSeed'] });
      setBoxSublabel(s.refs.req, 'bound to snapcontent-9f2');
      setWire(s, 'srcCap', 'untouched');
      setWire(s, 'snapCap', 'seeds the restore');
      setWire(s, 'restoredCap', 'independent disk');
      // The snapshot data is where the ball departs from, so it is lit at step entry.
      s.refs.snapData.classList.add('highlight');
      if (ctx.reduced) { s.refs.restore.classList.add('highlight'); s.refs.restored.classList.add('highlight'); return; }
      setStage(s, { vsc: 1, snapData: 1, restored: OPACITY.pending, restore: 0, ds: 0, lanes: ['wSeed'] });
      // The claim and its dataSource reference appear first: they are what triggers everything below.
      revealAt(s.refs.restore, ctx, 0);
      ctx.register(s.refs.dsRef.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: LAND_MS, fill: 'forwards', easing: 'ease-out' }));
      lightBoxAt(s.refs.restore, ctx, LAND_MS);
      const seed = routePacket(s, ctx, W_SEED, { delay: BEAT.lead + LAND_MS, role: 'storage' });
      ridingLabel(s, ctx, 'new volume from snap-1', W_SEED, { delay: BEAT.lead + LAND_MS });
      revealAt(s.refs.restored, ctx, seed.arrivalMs, OPACITY.pending);
      lightBoxAt(s.refs.restored, ctx, seed.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
