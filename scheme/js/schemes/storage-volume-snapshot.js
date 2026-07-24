import { svg, g, text, path } from '../lib/svg.js';
import { arrowDefs, box, node, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT, FADE,
} from '../lib/storage-kit.js';

// Volume Snapshots. The snapshot API mirrors the volume API exactly: VolumeSnapshot is the namespaced
// request (like a PVC) and VolumeSnapshotContent is the cluster-scoped object it binds to (like a PV).
// The external-snapshotter sidecar drives CreateSnapshot into the storage backend, where the snapshot
// data physically lands BESIDE the source volume, which is exactly why a snapshot is not a backup.
//
// ---- Horizontal composition ----
// A three-block middle row mirrored about the canvas centre: the snapshotter that does the work, the
// VolumeSnapshotContent it writes, and the restore claim that consumes it, at cx 280 / 600 / 920, even
// spacing 320, so the row centres on CX exactly. The storage backend frame below spans 180..1020,
// also centred, and holds both cylinders so the shared-fate point is made by the picture rather than
// by the caption. Content spans 140..1060, margins 140 a side.
//
// The VolumeSnapshotClass is folded into the request box as a sublabel rather than drawn as a fourth
// block. It is a pointer, not an actor: nothing ever flows through it, and as a separate block up in
// the overlay band it could not have been centred (see the overlay note below), which is what pushed
// the whole earlier composition right.
//
// ---- Narration overlay ----
// Measured (tools/overlay-measure.mjs), overlay bottom-right in viewBox units:
//   1920x900  right 102  bottom 183
//   1600x1000 right 291  bottom 143
//   1280x900  right 378  bottom 173
//   1100x900  right 397  bottom 149
// Worst case x <= 397 and y <= 183. The request box at y=36 sits inside that y band, so it starts at
// x=400 and is 400 wide, which puts it dead centre. Everything from the middle row down (y >= 210)
// clears the overlay entirely, and so does the request corridor at y=196. A longer narration than the ones below would invalidate this.
//
// PULSE MODEL: nothing pulses. There is no Pod on this card, and every block is infrastructure that
// lights via .highlight on packet arrival. The two sanctioned block blinks are on the class step and
// the ready step, both of which carry no packet and no Pod and would otherwise read as frozen frames.
//
// WIRES: the snapshot request leaves the request box through its BOTTOM face (offset by LANE so it
// does not sit on the bound link) and turns left along a corridor at y=196, which is the first line
// that clears the narration overlay at every viewport. The restore claim dataSource comes IN to the
// right face, far from the overlay. The bound link down the centre line is a relationship, so it has
// no arrowhead. The CreateSnapshot bus and the restore bus share one corridor y between the middle
// row and the backend frame, which is safe because their x spans are disjoint.
const CX = 600;

const REQ_X = 400, REQ_Y = 36, REQ_W = 400, REQ_H = 68;
const REQ_LEFT = REQ_X, REQ_RIGHT = REQ_X + REQ_W;                          // 400 / 800
const REQ_MY = REQ_Y + REQ_H / 2, REQ_BOTTOM = REQ_Y + REQ_H;               // 70 / 104

const MID_Y = 210, MID_H = 68, MID_BOTTOM = MID_Y + MID_H;                  // 278
const MID_W = 280, MID_SPREAD = 320;
const MID_CX = [CX - MID_SPREAD, CX, CX + MID_SPREAD];                      // 280 / 600 / 920
const SNAP_CX = MID_CX[0], VSC_CX = MID_CX[1], RESTORE_CX = MID_CX[2];

const FRAME_W = 840, FRAME_Y = 306, FRAME_H = 200;
const FRAME_X = CX - FRAME_W / 2, FRAME_RIGHT = FRAME_X + FRAME_W;          // 180 / 1020

const CYL_W = 200, CYL_H = 100, CYL_Y = 356;
const CYL_MY = CYL_Y + CYL_H / 2, CYL_TOP = CYL_Y;                          // 406 / 356
const CYL_SPREAD = 200;
const SRC_CX = CX - CYL_SPREAD, SNAPDATA_CX = CX + CYL_SPREAD;              // 400 / 800

const CORRIDOR_Y = (MID_BOTTOM + FRAME_Y) / 2;    // 292, the exact midpoint of the gap it crosses
const RESTORE_WRAP_X = 1090;                      // outer margin, right of the restore claim
// The request corridor must clear the narration overlay, whose worst measured bottom is 183. An
// earlier pass ran the request out of the LEFT face of the request box at y=70 and down at x=280,
// which put both the lane and the ball riding it BEHIND the overlay panel for most of the hop.
const REQ_CORRIDOR_Y = 196;
// The cylinder captions sit BELOW the disks, inside the frame. Above them they collided with the
// riding tag on the CreateSnapshot hop, which lands on the same cylinder top: the two strings printed
// over each other into one unreadable smear.
const CAPTION_Y = CYL_Y + CYL_H + 26;             // 482
const CHIPS_Y = 548;

// The request drop and the bound link share the request box bottom face, so the drop takes one side.
const LANE = 12;

// Each static wire and its ball share ONE points array, so they cannot drift apart. Every endpoint is
// a block edge midpoint.
const W_REQ_SNAP  = [[CX - LANE, REQ_BOTTOM], [CX - LANE, REQ_CORRIDOR_Y], [SNAP_CX, REQ_CORRIDOR_Y], [SNAP_CX, MID_Y]];
const W_SNAP_VSC  = [[SNAP_CX + MID_W / 2, MID_Y + MID_H / 2], [VSC_CX - MID_W / 2, MID_Y + MID_H / 2]];
const W_CREATE    = [[SNAP_CX, MID_BOTTOM], [SNAP_CX, CORRIDOR_Y], [SNAPDATA_CX, CORRIDOR_Y], [SNAPDATA_CX, CYL_TOP]];
const W_COPY      = [[SRC_CX + CYL_W / 2, CYL_MY], [SNAPDATA_CX - CYL_W / 2, CYL_MY]];
const W_RESTORE   = [[SNAPDATA_CX + CYL_W / 2, CYL_MY], [RESTORE_WRAP_X, CYL_MY], [RESTORE_WRAP_X, CORRIDOR_Y], [RESTORE_CX, CORRIDOR_Y], [RESTORE_CX, MID_BOTTOM]];

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

// The sole sanctioned block blink, for a step that carries no packet and no Pod and would otherwise
// read as a frozen frame. Never used on a value chip, and never on the closing step, which should
// come to rest.
function flashBox(el, ctx, delay = 0) {
  if (!el || ctx.reduced) return;
  ctx.register(el.animate(
    [{ filter: 'brightness(1)' }, { filter: 'brightness(1.55)' }, { filter: 'brightness(1)' }],
    { duration: 600, delay, easing: 'ease-out' }));
}

// A tag that rides ALONG with the ball on the same path, timing and easing, so the packet visibly
// carries what the step narrates. Balls are routePacket (eased), so the label defaults to the same
// ease-in-out and the same routeDur, or it would drift off the ball mid-flight.
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
      'aria-label': 'Volume Snapshots: a VolumeSnapshot is the namespaced request like a PVC, a VolumeSnapshotClass names the driver, the external-snapshotter sidecar calls CreateSnapshot, a cluster-scoped VolumeSnapshotContent binds to it like a PV, readyToUse flips true, and a new PVC with a dataSource restores it into a fresh volume, but the snapshot lives in the same storage system as the source so it is not a backup',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const req = box({
      x: REQ_X, y: REQ_Y, w: REQ_W, h: REQ_H,
      label: 'VolumeSnapshot snap-1', sublabel: 'volumeSnapshotClass: ebs-snapclass', cat: 'storage',
    });

    const snapper = box({ x: SNAP_CX - MID_W / 2, y: MID_Y, w: MID_W, h: MID_H, label: 'external-snapshotter', sublabel: 'driver: ebs.csi.aws.com', cat: 'storage' });
    const vsc = box({ x: VSC_CX - MID_W / 2, y: MID_Y, w: MID_W, h: MID_H, label: 'VolumeSnapshotContent', sublabel: 'cluster-scoped', cat: 'storage' });
    vsc.style.opacity = '0';
    const restore = box({ x: RESTORE_CX - MID_W / 2, y: MID_Y, w: MID_W, h: MID_H, label: 'PVC restore-1', sublabel: 'dataSource: snap-1', cat: 'storage' });
    restore.style.opacity = '0';

    const frame = node({ x: FRAME_X, y: FRAME_Y, w: FRAME_W, h: FRAME_H, label: 'storage backend' });

    const mkCyl = (cx, label) => {
      const c = cylinder({ x: cx - CYL_W / 2, y: CYL_Y, w: CYL_W, h: CYL_H, label, cat: 'storage' });
      // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse
      // is not part of the visible front face. Re-centre on the face, derived from the height.
      const l = c.querySelector('.scheme-cylinder-label');
      if (l) l.setAttribute('y', CYL_H / 2 + 10);
      return c;
    };
    const src = mkCyl(SRC_CX, 'source volume');
    const snapData = mkCyl(SNAPDATA_CX, 'snapshot data');
    snapData.style.opacity = '0';

    // Identity: the request bound to its content. A relationship, not traffic, so a bare path with no
    // marker: an arrowhead with no ball reads as traffic that never runs.
    const boundLink = path({ class: 'scheme-arrow scheme-arrow-storage', d: `M ${CX} ${REQ_BOTTOM} L ${CX} ${MID_Y}`, fill: 'none' });
    boundLink.style.opacity = '0';
    // dataSource: the restore claim references the snapshot. Also a relationship, so no arrowhead.
    const dsRef = path({
      class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage',
      d: `M ${RESTORE_CX} ${MID_Y} L ${RESTORE_CX} ${REQ_MY} L ${REQ_RIGHT} ${REQ_MY}`,
      'stroke-dasharray': '5 5', fill: 'none',
    });
    dsRef.style.opacity = '0';

    const wReqSnap = lane(W_REQ_SNAP);
    const wSnapVsc = lane(W_SNAP_VSC);
    const wCreate = lane(W_CREATE);
    const wCopy = lane(W_COPY);
    const wRestore = lane(W_RESTORE);
    [wReqSnap, wSnapVsc, wCreate, wCopy, wRestore].forEach(w => { w.style.opacity = '0'; });

    const srcLbl = text({ class: 'scheme-label code dim', x: SRC_CX, y: CAPTION_Y, 'text-anchor': 'middle' }, [' ']);
    const snapLbl = text({ class: 'scheme-label code dim', x: SNAPDATA_CX, y: CAPTION_Y, 'text-anchor': 'middle' }, [' ']);

    // CHIP_W 232 is the storage family default. Worst case here is 'VolumeSnapshot' + 'Pending' at 21
    // characters, and .scheme-chip-text runs 6.89 viewBox units per character, so 21 * 6.89 + 24 of
    // padding is 169 against the 232 available.
    const CHIP_W = 232, CHIP_GAP = 16;
    const CHIPS_W = CHIP_W * 4 + CHIP_GAP * 3;                  // 976
    const CHIPS_X = CX - CHIPS_W / 2;                           // 112, so the strip centres on CX
    const chipX = i => CHIPS_X + i * (CHIP_W + CHIP_GAP);
    const vsChip    = valChip({ x: chipX(0), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'VolumeSnapshot', value: 'Pending',     cat: 'storage' });
    const contChip  = valChip({ x: chipX(1), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'Content',        value: 'none',        cat: 'storage' });
    const readyChip = valChip({ x: chipX(2), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'readyToUse',     value: 'false',       cat: 'storage' });
    const storeChip = valChip({ x: chipX(3), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'stored',         value: 'same system', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): the backend frame, then the blocks and cylinders, then the lanes and
    // their captions above them, then the chip strip, then the packet layer so every ball rides above
    // everything.
    [frame, req, snapper, vsc, restore, src, snapData].forEach(el => root.appendChild(el));
    [boundLink, dsRef, wReqSnap, wSnapVsc, wCreate, wCopy, wRestore, srcLbl, snapLbl].forEach(el => root.appendChild(el));
    [vsChip, contChip, readyChip, storeChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, req, snapper, vsc, restore, frame, src, snapData,
      boundLink, dsRef, wReqSnap, wSnapVsc, wCreate, wCopy, wRestore,
      vsChip, contChip, readyChip, storeChip,
      wires: { srcCap: srcLbl, snapCap: snapLbl },
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
// comes to report readyToUse true on the step that is still creating the copy.
function setChips(s, { vs, cont, ready, store }) {
  setChip(s.refs.vsChip, vs);
  setChip(s.refs.contChip, cont);
  setChip(s.refs.readyChip, ready);
  setChip(s.refs.storeChip, store);
}

// Pins the visibility of EVERY element born mid-story, and of every lane, exactly as setChips pins
// every chip. A lane into an object that does not exist points at nothing, so lanes are pinned to 0
// rather than left at whatever the previous step happened to set.
function setStage(s, { vsc = 0, restore = 0, snapData = 0, bound = 0, ds = 0, lanes = [] } = {}) {
  s.refs.vsc.style.opacity = String(vsc);
  s.refs.restore.style.opacity = String(restore);
  s.refs.snapData.style.opacity = String(snapData);
  s.refs.boundLink.style.opacity = String(bound);
  s.refs.dsRef.style.opacity = String(ds);
  ['wReqSnap', 'wSnapVsc', 'wCreate', 'wCopy', 'wRestore'].forEach(k => {
    s.refs[k].style.opacity = lanes.includes(k) ? '1' : '0';
  });
}

function clearHL(s) {
  clearHighlights(s, ['req', 'snapper', 'vsc', 'restore', 'src', 'snapData',
    'vsChip', 'contChip', 'readyChip', 'storeChip'], []);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A source volume is in use in the storage backend. You create a VolumeSnapshot named snap-1, which points at the claim behind that volume. This object is the namespaced request, the exact counterpart of a PVC, and right now it is Pending with nothing behind it.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vs: 'Pending', cont: 'none', ready: 'false', store: 'same system' });
      setStage(s);
      setBoxSublabel(s.refs.req, 'volumeSnapshotClass: ebs-snapclass');
    },
  },
  {
    id: 'class',
    duration: 2400,
    narration: 'The snapshot names a VolumeSnapshotClass, and that class names the CSI driver that knows how to take snapshots. It is the same shape as a StorageClass one level up: the request states intent, the class states which driver carries it out.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vs: 'Pending', cont: 'none', ready: 'false', store: 'same system' });
      setStage(s);
      s.refs.req.classList.add('highlight');
      s.refs.snapper.classList.add('highlight');
      // No packet and no Pod on this step, so the sanctioned block blink keeps it from reading frozen.
      // It lands on the driver the class resolves to, which is what the step is actually about.
      flashBox(s.refs.snapper, ctx, BEAT.afterHop);
    },
  },
  {
    id: 'create',
    // 5200, not 4200: this step chains three hops (request, CreateSnapshot, then the copy across the
    // shelf once the target has materialised), which anim-dump puts at a 4720ms span.
    duration: 5200,
    narration: 'The external-snapshotter sidecar watches for snapshot requests it owns, picks up snap-1, and calls CreateSnapshot on the driver against the source volume. The backend freezes a point-in-time copy of the data. This is the only step where anything physical happens.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vs: 'Pending', cont: 'creating', ready: 'false', store: 'same system' });
      setStage(s, { snapData: 1, lanes: ['wReqSnap', 'wCreate', 'wCopy'] });
      // The request is where the first ball departs from, so it is lit at entry. The snapshotter, the
      // source and the new copy are receivers and earn their highlights on arrival.
      s.refs.req.classList.add('highlight');
      setWire(s, 'snapCap', 'point-in-time copy');
      if (ctx.reduced) {
        s.refs.snapper.classList.add('highlight');
        s.refs.src.classList.add('highlight');
        s.refs.snapData.classList.add('highlight');
        return;
      }
      setStage(s, { snapData: PLACEHOLDER, lanes: ['wReqSnap', 'wCreate', 'wCopy'] });
      const req = routePacket(s, ctx, W_REQ_SNAP, { delay: BEAT.lead, cat: 'storage' });
      ridingLabel(s, ctx, 'snap-1', W_REQ_SNAP, { delay: BEAT.lead });
      lightBoxAt(s.refs.snapper, ctx, req.arrivalMs);
      const call = routePacket(s, ctx, W_CREATE, { delay: req.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'CreateSnapshot', W_CREATE, { delay: req.arrivalMs + BEAT.afterHop });
      revealAt(s.refs.snapData, ctx, call.arrivalMs, PLACEHOLDER);
      // The copy itself: source bytes flowing across the shelf into the new snapshot, which is the
      // whole reason both cylinders sit inside one backend frame.
      const copy = routePacket(s, ctx, W_COPY, { delay: call.arrivalMs + LAND_MS, cat: 'storage' });
      lightBoxAt(s.refs.src, ctx, call.arrivalMs + LAND_MS);
      lightBoxAt(s.refs.snapData, ctx, copy.arrivalMs);
    },
  },
  {
    id: 'content',
    duration: 3400,
    narration: 'The snapshotter writes a VolumeSnapshotContent object carrying the handle the backend gave back, and binds it to snap-1. This cluster-scoped object is the counterpart of a PV: the snapshot in the request, the content behind it, joined one to one.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vs: 'Bound', cont: 'Bound', ready: 'false', store: 'same system' });
      setStage(s, { vsc: 1, snapData: 1, bound: 1, lanes: ['wSnapVsc'] });
      setBoxSublabel(s.refs.req, 'snap-1, Bound');
      s.refs.snapper.classList.add('highlight');
      setWire(s, 'snapCap', 'point-in-time copy');
      if (ctx.reduced) { s.refs.vsc.classList.add('highlight'); return; }
      setStage(s, { vsc: 0, snapData: 1, bound: 0, lanes: ['wSnapVsc'] });
      const write = routePacket(s, ctx, W_SNAP_VSC, { delay: BEAT.lead, cat: 'storage' });
      ridingLabel(s, ctx, 'snapshotHandle', W_SNAP_VSC, { delay: BEAT.lead });
      revealAt(s.refs.vsc, ctx, write.arrivalMs);
      lightBoxAt(s.refs.vsc, ctx, write.arrivalMs);
      // The Bound link draws itself in once both ends of it exist.
      ctx.register(s.refs.boundLink.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: write.arrivalMs + LAND_MS, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'ready',
    duration: 2800,
    narration: 'Once the backend confirms the copy is complete, readyToUse flips to true and the snapshot can be consumed. Note where the data lives: on the same storage system as the source, right beside it. If that system fails both are lost, so a snapshot is not a backup.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vs: 'Bound', cont: 'Bound', ready: 'true', store: 'not a backup' });
      setStage(s, { vsc: 1, snapData: 1, bound: 1 });
      setBoxSublabel(s.refs.req, 'snap-1, Bound');
      s.refs.req.classList.add('highlight');
      s.refs.vsc.classList.add('highlight');
      s.refs.src.classList.add('highlight');
      s.refs.snapData.classList.add('highlight');
      setWire(s, 'srcCap', 'same system');
      setWire(s, 'snapCap', 'same system');
      // No packet and no Pod, so the sanctioned block blink lands on the content object, whose
      // readyToUse field is what actually flips. Never on the readyToUse chip: value chips never blink.
      flashBox(s.refs.vsc, ctx, BEAT.afterHop);
    },
  },
  {
    id: 'restore',
    duration: 4200,
    narration: 'To restore, create a brand new PVC whose dataSource points at snap-1. The provisioner reads the snapshot content and carves a fresh volume seeded from it. The original is untouched, the restore is a separate independent disk, and both still sit in the same backend.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vs: 'Bound', cont: 'Bound', ready: 'true', store: 'not a backup' });
      setStage(s, { vsc: 1, snapData: 1, bound: 1, restore: 1, ds: 1, lanes: ['wRestore'] });
      setBoxSublabel(s.refs.req, 'snap-1, Bound');
      s.refs.req.classList.add('highlight');
      // The snapshot data is where the ball departs from, so it is lit at step entry.
      s.refs.snapData.classList.add('highlight');
      setWire(s, 'snapCap', 'seeds the restore');
      if (ctx.reduced) { s.refs.restore.classList.add('highlight'); return; }
      setStage(s, { vsc: 1, snapData: 1, bound: 1, restore: 0, ds: 0, lanes: ['wRestore'] });
      revealAt(s.refs.restore, ctx, 0);
      ctx.register(s.refs.dsRef.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: LAND_MS, fill: 'forwards', easing: 'ease-out' }));
      const seed = routePacket(s, ctx, W_RESTORE, { delay: BEAT.lead, cat: 'storage' });
      ridingLabel(s, ctx, 'restore from snap-1', W_RESTORE, { delay: BEAT.lead });
      lightBoxAt(s.refs.restore, ctx, seed.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
