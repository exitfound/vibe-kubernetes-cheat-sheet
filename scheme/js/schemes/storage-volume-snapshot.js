import { svg, g, text, path } from '../lib/svg.js';
import { arrowDefs, box, node, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT, FADE,
} from '../lib/storage-kit.js';

// Volume Snapshots. The snapshot API mirrors the volume API exactly: VolumeSnapshot is the namespaced
// request (like a PVC) and VolumeSnapshotContent is the cluster-scoped object it binds to (like a PV).
// The snapshot data physically lands BESIDE the source volume, in the same storage system, which is
// exactly why a snapshot is not a backup.
//
// ---- Who does what, and in which order ----
// This is the part the card gets right and most diagrams get wrong. TWO components are involved and
// they are not the same thing (kubernetes-csi docs, snapshot-controller and external-snapshotter):
//   snapshot-controller   one per cluster, shipped independently of any CSI driver, "watching the
//                         Kubernetes API server for VolumeSnapshot and VolumeSnapshotContent CRD
//                         objects". In dynamic provisioning it is the component that CREATES the
//                         VolumeSnapshotContent object and binds it one to one, and that creation is
//                         what "triggers the CSI external-snapshotter sidecar".
//   csi-snapshotter       the sidecar next to the driver. From v4.0.0 (beta and GA) it "only watches
//                         the Kubernetes API server for VolumeSnapshotContent CRD objects", never the
//                         VolumeSnapshot, and it is "responsible for calling the CSI RPCs
//                         CreateSnapshot, DeleteSnapshot, and ListSnapshots".
// So the object exists BEFORE the snapshot is taken, and the sidecar never reads the user request.
// An earlier version of this card had the sidecar pick up the VolumeSnapshot itself and then write the
// Content afterwards, carrying the handle, which inverts both the actor and the causality.
//
// ---- Horizontal composition ----
// Three bands, every one of them centred on CX, and the widest of them (the chip strip at 112..1088)
// sets the margins the rest answer to:
//   top    the two objects the USER writes: VolumeSnapshot snap-1 centred on CX, and the restore claim
//          beside it on the right, joined by the dataSource reference. The top-left is unusable (the
//          narration overlay lives there), so the request box starts at x=420 and the pair leans right,
//          which is what balances the panel rather than fighting it.
//   middle the control plane, left to right in the order the story runs: the controller that creates
//          and binds, the object it creates, the sidecar the object wakes. 232 wide, the storage family
//          default, at cx 260 / 600 / 940.
//   bottom the storage backend, holding all three disks so the shared-fate point is made by the picture
//          rather than by the caption: source, snapshot, restore, left to right in the order they exist.
// The Content sits on CX so the two lanes it shares with the request run as one straight vertical on
// the centre line of both blocks, and the snapshot disk sits on CX under it so the CreateSnapshot
// zigzag lands on that same line.
//
// ---- Vertical composition ----
// Every horizontal run of every zigzag sits at the MIDPOINT OF THE TWO BLOCKS IT JOINS, and both frame
// insets are equal, so the whole column is symmetric and nothing is pinned to a free gap:
//   36    canvas top margin
//   36    VolumeSnapshot request and restore claim   68 tall, to 104
//   157   request corridor                          53 below the request box, 53 above the mid row
//   210   middle row                                68 tall, to 278
//   338   CreateSnapshot corridor                   60 below the mid row, 60 above the disk tops
//   356   storage backend frame                     174 tall, to 530
//   398   disks                                     90 tall, to 488, frame insets 42 above and below
//   512   disk captions                             18 above the frame floor
//   570   chip strip                                34 tall, to 604
//   36    canvas bottom margin, equal to the top one
//
// ---- Narration overlay ----
// Measured (tools/overlay-measure.mjs), overlay bottom-right in viewBox units:
//   1920x900  right 102  bottom 163
//   1600x1000 right 291  bottom 143
//   1440x1080 right 335  bottom  94
//   1280x900  right 378  bottom 152
//   1100x900  right 397  bottom 149
// Worst case x <= 397 and y <= 163, and the two never peak together: the panel is TALL when it is
// narrow (1920: bottom 163, right 102) and WIDE when it is short (1100: right 397, bottom 149). That
// is what lets the request corridor sit at its centred 157: the only viewports whose panel reaches
// right of the corridor start (x=260) have a floor at 143..152, so the lane runs below the panel, and
// the one viewport with a deeper panel stops at x=102, far left of anything drawn. The request box at
// y=36 sits inside the y band, so it starts at x=420, clear of the widest measured panel by 23.
// A longer narration than the ones below would invalidate all of this: re-measure before trusting it.
//
// PULSE MODEL: nothing pulses and nothing blinks. There is no Pod on this card, and every block is
// infrastructure that lights via .highlight, on packet arrival where there is a packet and at step
// entry where there is not. The class step carries no packet, and the canon would allow it the one
// sanctioned block blink so it does not read as frozen: it is deliberately NOT taking it. That step
// states a fact rather than moves something, and a brightness blink on a block that is only being
// pointed at reads as traffic that never arrives. Do not add it back.
//
// WIRES: three of them are zigzags (down, across, down) and all three are drawn symmetric, with the
// horizontal run exactly halfway between the block it leaves and the block it enters: the request into
// the controller (53 and 53), CreateSnapshot down into the snapshot disk (60 and 60), and the answer
// back up out of that disk (60 and 60). The answer lane is the create lane mirrored: same corridor,
// same columns, opposite arrowhead, and it leaves through the TOP of the disk rather than a side face.
// The two never appear in one step, which is what makes sharing the corridor safe, and the same is
// true of the two lanes that meet the request box from below, which is why both run dead centre on it
// rather than taking a side each. The ONE remaining link that carries no ball is the dataSource
// reference across the top band, dashed and undirected because it is a reference and not a route. The
// binding between the request and its content is stated by the request sublabel and the Content chip
// instead of by a line: an undirected dashed line hanging under the request box, in the same column
// two directed lanes use on the steps either side of it, read as a third route that never runs.
const CX = 600;

const REQ_X = 420, REQ_Y = 36, REQ_W = 360, REQ_H = 68;
const REQ_RIGHT = REQ_X + REQ_W;                                            // 780
const REQ_MY = REQ_Y + REQ_H / 2, REQ_BOTTOM = REQ_Y + REQ_H;               // 70 / 104

// The restore claim is a user-authored object exactly like the snapshot request, so it belongs in the
// same band rather than down among the controllers. Sitting beside snap-1 also turns its dataSource
// into a 60 unit horizontal reference between two adjacent boxes, which is the shortest honest way to
// draw "this claim names that snapshot".
const RST_X = 840, RST_W = 240;
const RST_CX = RST_X + RST_W / 2;                                           // 960

const MID_Y = 210, MID_H = 68, MID_BOTTOM = MID_Y + MID_H;                  // 278
const MID_W = 232, MID_SPREAD = 340, MID_MY = MID_Y + MID_H / 2;            // 244
const MID_CX = [CX - MID_SPREAD, CX, CX + MID_SPREAD];                      // 260 / 600 / 940
const CTRL_CX = MID_CX[0], VSC_CX = MID_CX[1], SNAP_CX = MID_CX[2];
const CTRL_RIGHT = CTRL_CX + MID_W / 2, VSC_LEFT = VSC_CX - MID_W / 2;      // 376 / 484
const VSC_RIGHT = VSC_CX + MID_W / 2, SNAP_LEFT = SNAP_CX - MID_W / 2;      // 716 / 824

// The disks sit DEAD CENTRE in the backend frame: one inset, used both above and below, so the frame
// is sized from its contents rather than typed. The top band carries the frame label (node() puts its
// label baseline 18 below the frame top) and the bottom band carries the disk captions, and the two
// bands come out the same height, which is what makes the frame read as a container rather than as a
// box with its contents pushed up. FRAME_Y is then the one number that positions the whole backend,
// and it is set so the CreateSnapshot corridor clears the frame edge (see CORRIDOR_Y).
const CYL_W = 176, CYL_H = 90;
const FRAME_INSET = 42;
const FRAME_X = 144, FRAME_W = 912, FRAME_Y = 356;                          // 144..1056, aligned with
const FRAME_H = CYL_H + FRAME_INSET * 2;                                    // the middle row, 356..530

const CYL_Y = FRAME_Y + FRAME_INSET;                                        // 398
const CYL_MY = CYL_Y + CYL_H / 2, CYL_TOP = CYL_Y;                          // 443 / 398
const CYL_SPREAD = 300;
const SRC_CX = CX - CYL_SPREAD, SNAPDATA_CX = CX, RESTORED_CX = CX + CYL_SPREAD;   // 300 / 600 / 900
// Three disks 176 wide at 300/600/900 span 212..988 inside a frame at 144..1056, so the frame keeps 68
// of margin on each side and the disks keep 124 between them, which is the run each shelf hop travels.

// The horizontal run of a zigzag belongs at the MIDPOINT OF THE TWO BLOCKS IT JOINS, not in whatever
// gap happens to be free. Both of these are measured that way, off the real block edges:
//   CORRIDOR_Y     mid row bottom 278 to disk top 398, so CreateSnapshot drops 60, runs across, drops
//                  60, and the answer climbs the same lane in reverse. Centring it this way also lands
//                  it 18 clear of the frame edge, so the lane and the frame do not read as one doubled
//                  dashed line: that clearance is FRAME_INSET / 2 and is why FRAME_Y is 356.
//   REQ_CORRIDOR_Y request box bottom 104 to mid row top 210, so the request drops 53 and 53. This one
//                  runs left to x=260 and so has to answer to the narration overlay (see the measured
//                  table above): the lane clears every measured panel floor, but the tag riding it
//                  would not, which is why that one hop rides its label BELOW the ball.
const CORRIDOR_Y = (MID_BOTTOM + CYL_TOP) / 2;              // 338
const REQ_CORRIDOR_Y = (REQ_BOTTOM + MID_Y) / 2;            // 157
// The disk captions sit BELOW the disks, inside the frame. Above them they would collide with the tag
// riding the CreateSnapshot hop, which lands on a disk top: the two strings print over each other into
// one unreadable smear. 24 below the disk leaves 18 to the frame floor.
const CAPTION_Y = CYL_Y + CYL_H + 24;             // 512
const CHIPS_Y = 570;                              // 40 below the frame, and 36 above the canvas floor

// Both lanes that touch the request box bottom face run dead centre on it. They used to be offset 12
// to a side each because a dashed identity link held the centre column between the request and its
// content: that link is gone (the sublabel and the Content chip already say the two are bound, and an
// undirected dashed line beside two directed lanes read as a third route), so the ball now leaves and
// arrives on the block centre line. The two never share a step, so neither needs a lane of its own.
// Each static wire and its ball share ONE points array, so they cannot drift apart. Every endpoint is
// a block edge midpoint.
const W_REQ_CTRL  = [[CX, REQ_BOTTOM], [CX, REQ_CORRIDOR_Y], [CTRL_CX, REQ_CORRIDOR_Y], [CTRL_CX, MID_Y]];
const W_CTRL_VSC  = [[CTRL_RIGHT, MID_MY], [VSC_LEFT, MID_MY]];
const W_VSC_SNAP  = [[VSC_RIGHT, MID_MY], [SNAP_LEFT, MID_MY]];
const W_CREATE    = [[SNAP_CX, MID_BOTTOM], [SNAP_CX, CORRIDOR_Y], [SNAPDATA_CX, CORRIDOR_Y], [SNAPDATA_CX, CYL_TOP]];
// The driver answers back up the same lane, reversed, so the two hops read as one call and its return.
const W_ACK       = [...W_CREATE].reverse();
const W_SNAP_VSC  = [[SNAP_LEFT, MID_MY], [VSC_RIGHT, MID_MY]];
const W_VSC_REQ   = [[CX, MID_Y], [CX, REQ_BOTTOM]];
const W_COPY      = [[SRC_CX + CYL_W / 2, CYL_MY], [SNAPDATA_CX - CYL_W / 2, CYL_MY]];
const W_SEED      = [[SNAPDATA_CX + CYL_W / 2, CYL_MY], [RESTORED_CX - CYL_W / 2, CYL_MY]];

// Lights an infrastructure block ON PACKET ARRIVAL rather than at step entry, via a zero-effect
// animation whose onfinish sets the class. Under reduced motion it applies immediately so the static
// end-state stays correct. This is how a box receives a packet without pulsing.
function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// An object materialises when the call that creates it lands, so no arrowhead is ever aimed at
// nothing. LAND_MS is shorter than BEAT.lead for the same reason.
const LAND_MS = 500;
// PLACEHOLDER is the dim an object is drawn at while a lane already points AT it but it has not been
// created yet. Hiding it outright leaves the arrowhead aimed at blank canvas for the whole flight,
// which reads as a rendering fault rather than as an absence.
const PLACEHOLDER = 0.4;
function revealAt(el, ctx, delay = 0, from = 0) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = '1'; return; }
  el.style.opacity = String(from);
  ctx.register(el.animate([{ opacity: from }, { opacity: 1 }], { duration: LAND_MS, delay, fill: 'forwards', easing: 'ease-out' }));
}

// A tag that rides ALONG with the ball on the same path, timing and easing, so the packet visibly
// carries what the step narrates. Balls are routePacket (eased), so the label defaults to the same
// ease-in-out and the same routeDur, or it would drift off the ball mid-flight.
//
// dy flips a tag under its ball, and exactly two hops on this card need it, both for the same reason
// in different guises: above the ball, the tag would land on top of something already written there.
//   the request hop     its corridor runs at y=157 (see REQ_CORRIDOR_Y). The lane clears the narration
//                       panel on every measured viewport, but a tag 14 ABOVE it sits at 131..143 and
//                       passes behind the panel on the two viewports whose panel reaches right of
//                       x=260. Below the ball it sits at 179, clear everywhere.
//   the status mirror   it climbs INTO the request box from underneath and stops on its bottom edge,
//                       so a tag above the ball prints across the box sublabel and the two strings
//                       smear into each other. Below the ball it comes to rest under the box.
// Both then live in the 53 and 106 unit gaps under their destinations, with nothing else in them.
function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'ease-in-out', dy = -14 } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: dy, 'text-anchor': 'middle', 'data-cat': 'storage' }, [txt]);
  lbl.style.opacity = '0';
  lbl.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px)`;
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 160, fill: 'forwards', easing: 'ease-in' }));
}

const lane = points => pathArrow({ points, dashed: true, dim: true, color: 'storage' });

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
      label: 'VolumeSnapshot snap-1', sublabel: 'volumeSnapshotClassName: ebs-snapclass', cat: 'storage',
    });
    const restore = box({
      x: RST_X, y: REQ_Y, w: RST_W, h: REQ_H,
      label: 'PVC restore-1', sublabel: 'dataSource: snap-1', cat: 'storage',
    });
    restore.style.opacity = '0';

    // One per cluster and shipped independently of any driver, which is exactly why it is a separate
    // block from the sidecar rather than folded into it.
    const ctrl = box({ x: CTRL_CX - MID_W / 2, y: MID_Y, w: MID_W, h: MID_H, label: 'Snapshot-controller', sublabel: 'one per cluster', cat: 'storage' });
    const vsc = box({ x: VSC_CX - MID_W / 2, y: MID_Y, w: MID_W, h: MID_H, label: 'VolumeSnapshotContent', sublabel: 'cluster-scoped', cat: 'storage' });
    vsc.style.opacity = '0';
    // The sidecar rides beside the driver named by the class, which is what the sublabel states.
    const snapper = box({ x: SNAP_CX - MID_W / 2, y: MID_Y, w: MID_W, h: MID_H, label: 'External-snapshotter', sublabel: 'driver: ebs.csi.aws.com', cat: 'storage' });

    const frame = node({ x: FRAME_X, y: FRAME_Y, w: FRAME_W, h: FRAME_H, label: 'storage backend' });

    const mkCyl = (cx, label) => {
      const c = cylinder({ x: cx - CYL_W / 2, y: CYL_Y, w: CYL_W, h: CYL_H, label, cat: 'storage' });
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
    const dsRef = path({
      class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage',
      d: `M ${REQ_RIGHT} ${REQ_MY} L ${RST_X} ${REQ_MY}`, 'stroke-dasharray': '5 5', fill: 'none',
    });
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

    // CHIP_W 232 is the storage family default. Worst case here is 'snapshotHandle' + 'snap-0c41' at 23
    // characters, and .scheme-chip-text runs 6.89 viewBox units per character, so 23 * 6.89 + 24 of
    // padding is 183 against the 232 available.
    const CHIP_W = 232, CHIP_GAP = 16;
    const CHIPS_W = CHIP_W * 4 + CHIP_GAP * 3;                  // 976
    const CHIPS_X = CX - CHIPS_W / 2;                           // 112, so the strip centres on CX
    const chipX = i => CHIPS_X + i * (CHIP_W + CHIP_GAP);
    // Every one of these is a real field except the last, which is the point of the card rather than a
    // status: 'Content' is status.boundVolumeSnapshotContentName, whose full name is too long to print.
    const contChip  = valChip({ x: chipX(0), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'Content',        value: 'none',        cat: 'storage' });
    const handChip  = valChip({ x: chipX(1), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'snapshotHandle', value: 'none',        cat: 'storage' });
    const readyChip = valChip({ x: chipX(2), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'readyToUse',     value: 'false',       cat: 'storage' });
    const storeChip = valChip({ x: chipX(3), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'stored',         value: 'same system', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): the backend frame, then the blocks and disks, then the lanes and their
    // captions above them, then the chip strip, then the packet layer so every ball rides above
    // everything.
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

// A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
// holds the previous step's text at call time (clearHL clears the class, not the text) and steps are
// always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
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

// Pins the visibility of EVERY element born mid-story, and of every lane, exactly as setChips pins
// every chip. A lane into an object that does not exist points at nothing, so lanes are pinned to 0
// rather than left at whatever the previous step happened to set.
//
// The three objects that live INSIDE a structure default to PLACEHOLDER rather than to 0: the content
// in the middle row and the two disks that do not exist yet in the backend frame. Hiding them outright
// leaves a block-sized hole in a row and a frame three quarters empty around one floating disk, which
// reads as a rendering fault rather than as an absence. The restore claim is the exception and stays
// at 0, because the top band holds nothing else on that side, so its absence leaves no hole to explain.
function setStage(s, { vsc = PLACEHOLDER, restore = 0, snapData = PLACEHOLDER, restored = PLACEHOLDER, ds = 0, lanes = [] } = {}) {
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
      const watch = routePacket(s, ctx, W_REQ_CTRL, { delay: BEAT.lead, cat: 'storage' });
      // Rides BELOW the ball, the only tag on the card that does: see the dy note on ridingLabel.
      ridingLabel(s, ctx, 'snap-1', W_REQ_CTRL, { delay: BEAT.lead, dy: 22 });
      lightBoxAt(s.refs.ctrl, ctx, watch.arrivalMs);
      const write = routePacket(s, ctx, W_CTRL_VSC, { delay: watch.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'create and bind', W_CTRL_VSC, { delay: watch.arrivalMs + BEAT.afterHop });
      revealAt(s.refs.vsc, ctx, write.arrivalMs, PLACEHOLDER);
      lightBoxAt(s.refs.vsc, ctx, write.arrivalMs);
    },
  },
  {
    id: 'create',
    // Three chained hops: the content waking the sidecar, the CreateSnapshot call down into the
    // backend, and the copy taken on the shelf once the target has materialised. Routes are
    // length-based, so re-measure with anim-dump after ANY geometry change here.
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
      const wake = routePacket(s, ctx, W_VSC_SNAP, { delay: BEAT.lead, cat: 'storage' });
      ridingLabel(s, ctx, 'new content', W_VSC_SNAP, { delay: BEAT.lead });
      lightBoxAt(s.refs.snapper, ctx, wake.arrivalMs);
      const call = routePacket(s, ctx, W_CREATE, { delay: wake.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'CreateSnapshot', W_CREATE, { delay: wake.arrivalMs + BEAT.afterHop });
      revealAt(s.refs.snapData, ctx, call.arrivalMs, PLACEHOLDER);
      // The copy itself: the point in time frozen out of the source into the new snapshot, which is the
      // whole reason both disks sit inside one backend frame.
      const copy = routePacket(s, ctx, W_COPY, { delay: call.arrivalMs + LAND_MS, cat: 'storage' });
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
      // The snapshot data is where the answer departs from, so it is lit at entry. The controller is
      // lit for the whole step because the last hop, the status mirrored onto the snapshot, is its
      // work: the ball runs straight up the bound column rather than detouring through the block.
      s.refs.snapData.classList.add('highlight');
      s.refs.ctrl.classList.add('highlight');
      if (ctx.reduced) {
        s.refs.snapper.classList.add('highlight');
        s.refs.vsc.classList.add('highlight');
        s.refs.req.classList.add('highlight');
        return;
      }
      const ack = routePacket(s, ctx, W_ACK, { delay: BEAT.lead, cat: 'storage' });
      ridingLabel(s, ctx, 'snapshotHandle', W_ACK, { delay: BEAT.lead });
      lightBoxAt(s.refs.snapper, ctx, ack.arrivalMs);
      const status = routePacket(s, ctx, W_SNAP_VSC, { delay: ack.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'readyToUse true', W_SNAP_VSC, { delay: ack.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.vsc, ctx, status.arrivalMs);
      const mirror = routePacket(s, ctx, W_VSC_REQ, { delay: status.arrivalMs + BEAT.afterHop, cat: 'storage' });
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
      setStage(s, { vsc: 1, snapData: 1, restored: PLACEHOLDER, restore: 0, ds: 0, lanes: ['wSeed'] });
      // The claim and its dataSource reference appear first: they are what triggers everything below.
      revealAt(s.refs.restore, ctx, 0);
      ctx.register(s.refs.dsRef.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: LAND_MS, fill: 'forwards', easing: 'ease-out' }));
      lightBoxAt(s.refs.restore, ctx, LAND_MS);
      const seed = routePacket(s, ctx, W_SEED, { delay: BEAT.lead + LAND_MS, cat: 'storage' });
      ridingLabel(s, ctx, 'new volume from snap-1', W_SEED, { delay: BEAT.lead + LAND_MS });
      revealAt(s.refs.restored, ctx, seed.arrivalMs, PLACEHOLDER);
      lightBoxAt(s.refs.restored, ctx, seed.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
