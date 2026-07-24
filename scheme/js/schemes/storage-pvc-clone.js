import { svg, g, text, path } from '../lib/svg.js';
import { arrowDefs, box, node, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT, FADE,
} from '../lib/storage-kit.js';

// Cloning a PVC. A new PVC whose dataSource points at an EXISTING PVC, not a snapshot. The storage
// system makes an exact duplicate server-side and there is no snapshot object in between, which is the
// whole contrast with the snapshot card.
//
// ---- What the docs actually say (kubernetes.io, CSI Volume Cloning) ----
// Three of these were wrong or missing on an earlier pass, and two of them were the opposite of what
// the page says, so they are quoted here rather than paraphrased:
//   "Cloning is supported with a different Storage Class. Destination volume can be the same or a
//    different storage class as the source."     <- the card used to require the SAME StorageClass
//   "The source PVC must be bound and available (not in use)."
//                                                <- the card used to promise the source stays online
//   "Cloning can only be performed between two volumes that use the same VolumeMode setting"
//                                                <- was missing entirely
//   "You can only clone a PVC when it exists in the same namespace as the destination PVC"
//   "the value you specify must be the same or larger than the capacity of the source volume"
//   "the back end device creates an exact duplicate of the specified Volume"
//   "the source is not linked in any way to the newly created clone, it may also be modified or
//    deleted without affecting the newly created clone"
// CreateVolume is a call into the DRIVER that produces a volume, so its ball lands on the new disk in
// the backend. It used to land on the clone CLAIM, which is neither where the call goes nor what it
// creates.
//
// ---- Horizontal composition ----
// The card is a mirror: source on the left, clone on the right, reflected about the canvas centre.
// CLAIM_CX = [CX - SPREAD, CX + SPREAD] with CX = 600, and the disks hang on the same two centre
// lines, so the reflection holds on every tier. The provisioner sits alone on the centre line above
// them because it is the one thing that belongs to neither side, and the backend frame below holds
// both disks because the copy never leaves the storage system: that frame IS the word server-side.
//
// ---- Vertical composition ----
// Every horizontal run of every zigzag sits at the midpoint of what it crosses, and the backend frame
// insets are equal, so the column is symmetric and nothing is pinned to a free gap. It is deliberately
// the same rhythm as storage-volume-snapshot from the frame down, since the two cards sit in one row:
//   36    canvas top margin
//   36    External-provisioner   68 tall, to 104
//   150   request corridor       46 below the provisioner, 46 above the claim row
//   196   claim row              68 tall, to 264
//   278   the constraint list    four lines, 22 apart, on the centre line, to 344
//   356   storage backend frame  174 tall, to 530
//   398   disks                  90 tall, to 488, frame insets 42 above and below
//   512   disk captions          18 above the frame floor
//   570   chip strip             34 tall, to 604
//   36    canvas bottom margin, equal to the top one
//
// ---- Narration overlay ----
// Measured (tools/overlay-measure.mjs), overlay bottom-right in viewBox units:
//   1920x900  right 102  bottom 183
//   1600x1000 right 291  bottom 160
//   1280x900  right 378  bottom 173
//   1100x900  right 397  bottom 173
// Worst case x <= 397 and y <= 183. Only the provisioner sits inside that y band, and at 420..780 it
// clears the widest measured panel by 23 while still centring on CX. The request corridor at y=150 is
// inside the band too, but it only ever runs between x=612 and x=880, far right of any panel. The
// claim row (y 196) and everything below it clear the overlay entirely, which is what frees the full
// width for the mirror. A longer narration than the ones below would invalidate this measurement.
//
// PULSE MODEL: nothing pulses and nothing blinks. There is no Pod on this card, and every block is
// infrastructure that lights via .highlight, on packet arrival where there is a packet and at step
// entry where there is not. The constraints step and the contrast step carry no packet, and the canon
// would allow them the one sanctioned block blink so they do not read as frozen: they deliberately do
// not take it. Both state a fact rather than move something, and a brightness blink on a block that is
// only being pointed at reads as traffic that never arrives. Do not add it back.
//
// WIRES: the card has ZERO crossings, and every lane meets its blocks on a face midpoint: the request
// leaves the clone claim through the middle of its top face and arrives dead centre under the
// provisioner, and the call leaves the provisioner through the midpoint of its right face and enters
// the new volume through the midpoint of its right side, on the same line the duplicate arrives on
// from the left. The two meet the disk from opposite sides, which is what keeps them apart.
//
// The call takes the long way round, out to x=1060 and down the outside, and that is not decoration.
// The dataSource link runs straight across the gap between the two claims at their mid height, so ANY
// descent from the provisioner through that gap crosses it, and the gap is the only opening in the
// claim row. Hiding the link for one step would make it blink out and back. Going around the outside
// is what keeps both a permanent dataSource line and a crossing-free card, and it reads correctly on
// its own terms: every lane on this card lives in the right half, because the clone side is where all
// the work happens and the source side is only ever read.
//
// Both identity links are dashed and carry no arrowhead, because a solid line between two objects
// reads as a route that never runs: each claim to its own volume, and the dataSource between the
// claims. The clone identity link is held back until the claim actually binds.
const CX = 600;

const PROV_X = 420, PROV_Y = 36, PROV_W = 360, PROV_H = 68;
const PROV_BOTTOM = PROV_Y + PROV_H;                                    // 104

const CLAIM_W = 280, CLAIM_H = 68, CLAIM_Y = 196;
const CLAIM_TOP = CLAIM_Y, CLAIM_BOTTOM = CLAIM_Y + CLAIM_H;            // 196 / 264
const CLAIM_MY = CLAIM_Y + CLAIM_H / 2;                                 // 230
const SPREAD = 280;
const SRC_CX = CX - SPREAD, CLONE_CX = CX + SPREAD;                     // 320 / 880

// The disks sit DEAD CENTRE in the backend frame: one inset used both above and below, so the frame is
// sized from its contents. The top band carries the frame label (node() puts its label baseline 18
// below the frame top) and the bottom band carries the disk captions, and the two come out equal.
const DISK_W = 200, DISK_H = 90;
const FRAME_INSET = 42;
const FRAME_X = 180, FRAME_W = 840, FRAME_Y = 356;                      // 180..1020, level with the
const FRAME_H = DISK_H + FRAME_INSET * 2;                               // claim row, 356..530

const DISK_Y = FRAME_Y + FRAME_INSET;                                   // 398
const DISK_TOP = DISK_Y, DISK_BOTTOM = DISK_Y + DISK_H;                 // 398 / 488
const DISK_MY = DISK_Y + DISK_H / 2;                                    // 443
// Two disks 200 wide at 320 and 880 span 220..420 and 780..980 inside a frame at 180..1020, so the
// frame keeps 40 of margin on each side and the copy hop has 360 units of shelf to travel.

// The horizontal run of a zigzag belongs at the MIDPOINT OF WHAT IT CROSSES, not in whatever gap
// happens to be free:
//   REQ_CORRIDOR_Y   provisioner bottom 104 to claim row top 196, so the request rises 46 and 46.
// The call has no corridor of its own: it drops the outer column straight to the disk mid height and
// turns in through the SIDE face of the cap, so its only horizontal runs are the two short ones at the
// faces it leaves and enters. It used to turn in over the cap and drop onto the top instead, which put
// two arrowheads on one disk pointing from the same direction as the copy.
const REQ_CORRIDOR_Y = (PROV_BOTTOM + CLAIM_TOP) / 2;                   // 150
// The outbound column for the call, in the margin between the backend frame (ends 1020) and the chip
// strip (ends 1088), so it clears both.
const CALL_WRAP_X = 1060;
// Four constraints, four lines, on the centre line in the band between the claims and the backend.
const RULE_Y = [278, 300, 322, 344];
const CAPTION_Y = DISK_BOTTOM + 24;               // 512, leaving 18 to the frame floor
const CHIPS_Y = 570;                              // 40 below the frame, and 36 above the canvas floor

// Each static wire and its ball share ONE points array, so they cannot drift apart. Every endpoint is
// a block edge midpoint.
const W_REQ = [[CLONE_CX, CLAIM_TOP], [CLONE_CX, REQ_CORRIDOR_Y], [CX, REQ_CORRIDOR_Y], [CX, PROV_BOTTOM]];
const W_CALL = [[PROV_X + PROV_W, PROV_Y + PROV_H / 2], [CALL_WRAP_X, PROV_Y + PROV_H / 2], [CALL_WRAP_X, DISK_MY], [CLONE_CX + DISK_W / 2, DISK_MY]];
const W_COPY = [[SRC_CX + DISK_W / 2, DISK_MY], [CLONE_CX - DISK_W / 2, DISK_MY]];

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
// PLACEHOLDER is the dim an object is drawn at while it does not exist yet. Hiding it outright leaves
// a block-sized hole in a mirrored row and a half empty frame, which reads as a rendering fault rather
// than as an absence, so both halves of the mirror are always drawn and the absent one is dim.
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
// dy flips a tag under its ball. The request hop needs it: that hop ends ON the provisioner bottom
// edge, and a tag 14 above the ball prints across the box sublabel and the two strings smear into each
// other. Below the ball it comes to rest in the 46 unit gap under the block, which is empty.
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

// A relationship, not traffic: no marker, because an arrowhead with no ball reads as traffic that
// never runs, and DASHED, because a solid line between two objects reads as a live route.
const relLink = d => path({
  class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage',
  d, 'stroke-dasharray': '5 5', fill: 'none',
});

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Cloning a PVC: a new PersistentVolumeClaim whose dataSource points at an existing PVC rather than a snapshot, so the external provisioner calls CreateVolume and the storage system makes an exact duplicate server-side with no snapshot object in between, subject to the constraints that the two claims share a namespace and a volumeMode, that the destination asks for at least the size of the source, and that the source is bound and not in use, while the StorageClass is free to differ, after which the clone is a fully independent volume',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // External-provisioner, capitalised like every other CSI sidecar block in the family
    // (External-attacher, External-snapshotter, External-resizer): a hyphenated name capitalises its
    // first segment only. The narration keeps it lowercase mid-sentence, as those cards do.
    const prov = box({ x: PROV_X, y: PROV_Y, w: PROV_W, h: PROV_H, label: 'External-provisioner', sublabel: 'driver: ebs.csi.aws.com', cat: 'storage' });

    const srcPvc = box({ x: SRC_CX - CLAIM_W / 2, y: CLAIM_Y, w: CLAIM_W, h: CLAIM_H, label: 'PVC data-src', sublabel: 'Bound, 10Gi gp3', cat: 'storage' });
    const clonePvc = box({ x: CLONE_CX - CLAIM_W / 2, y: CLAIM_Y, w: CLAIM_W, h: CLAIM_H, label: 'PVC clone-1', sublabel: 'dataSource: data-src', cat: 'storage' });

    const frame = node({ x: FRAME_X, y: FRAME_Y, w: FRAME_W, h: FRAME_H, label: 'storage backend' });

    const mkDisk = (cx, label) => {
      const c = cylinder({ x: cx - DISK_W / 2, y: DISK_Y, w: DISK_W, h: DISK_H, label, cat: 'storage' });
      // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse
      // is not part of the visible front face. Re-centre on the face, derived from the height.
      const l = c.querySelector('.scheme-cylinder-label');
      if (l) l.setAttribute('y', DISK_H / 2 + 10);
      return c;
    };
    const srcDisk = mkDisk(SRC_CX, 'Source Volume');
    const cloneDisk = mkDisk(CLONE_CX, 'Cloned Volume');

    // Identity: each claim bound to its own volume, straight down the column centre line.
    const srcBound = relLink(`M ${SRC_CX} ${CLAIM_BOTTOM} L ${SRC_CX} ${DISK_TOP}`);
    const cloneBound = relLink(`M ${CLONE_CX} ${CLAIM_BOTTOM} L ${CLONE_CX} ${DISK_TOP}`);
    cloneBound.style.opacity = '0';
    // dataSource: the clone references the source CLAIM directly, face midpoint to face midpoint.
    const dsRef = relLink(`M ${CLONE_CX - CLAIM_W / 2} ${CLAIM_MY} L ${SRC_CX + CLAIM_W / 2} ${CLAIM_MY}`);
    dsRef.style.opacity = '0';

    const wReq = lane(W_REQ);
    const wCall = lane(W_CALL);
    const wCopy = lane(W_COPY);
    [wReq, wCall, wCopy].forEach(w => { w.style.opacity = '0'; });

    const ruleLbls = RULE_Y.map(y => text({ class: 'scheme-label code dim', x: CX, y, 'text-anchor': 'middle' }, [' ']));
    const srcLbl = text({ class: 'scheme-label code dim', x: SRC_CX, y: CAPTION_Y, 'text-anchor': 'middle' }, [' ']);
    const cloneLbl = text({ class: 'scheme-label code dim', x: CLONE_CX, y: CAPTION_Y, 'text-anchor': 'middle' }, [' ']);

    // CHIP_W 232 is the storage family default. Worst case here is 'dataSource' + 'kind: PVC' at 19
    // characters, and .scheme-chip-text runs 6.89 viewBox units per character, so 19 * 6.89 + 24 of
    // padding is 155 against the 232 available.
    const CHIP_W = 232, CHIP_GAP = 16;
    const CHIPS_W = CHIP_W * 4 + CHIP_GAP * 3;                  // 976
    const CHIPS_X = CX - CHIPS_W / 2;                           // 112, so the strip centres on CX
    const chipX = i => CHIPS_X + i * (CHIP_W + CHIP_GAP);
    // The first two are the real phase field on each claim, the third is the real dataSource field,
    // and the fourth reports the copy the storage system is making.
    const srcChip    = valChip({ x: chipX(0), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'data-src',   value: 'Bound',     cat: 'storage' });
    const destChip   = valChip({ x: chipX(1), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'clone-1',    value: 'none',      cat: 'storage' });
    const methodChip = valChip({ x: chipX(2), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'dataSource', value: 'none',      cat: 'storage' });
    const copyChip   = valChip({ x: chipX(3), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'copy',       value: 'none',      cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): the backend frame, then the blocks and disks, then the relationship
    // links and lanes and their captions above them, then the chip strip, then the packet layer so
    // every ball rides above everything.
    [frame, prov, srcPvc, clonePvc, srcDisk, cloneDisk].forEach(el => root.appendChild(el));
    [srcBound, cloneBound, dsRef, wReq, wCall, wCopy, ...ruleLbls, srcLbl, cloneLbl].forEach(el => root.appendChild(el));
    [srcChip, destChip, methodChip, copyChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, prov, srcPvc, clonePvc, frame, srcDisk, cloneDisk,
      cloneBound, dsRef, wReq, wCall, wCopy,
      srcChip, destChip, methodChip, copyChip,
      wires: { ns: ruleLbls[0], mode: ruleLbls[1], size: ruleLbls[2], state: ruleLbls[3], srcCap: srcLbl, cloneCap: cloneLbl },
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
// comes to report a completed copy on the step that is still checking the constraints.
function setChips(s, { src, dest, method, copy }) {
  setChip(s.refs.srcChip, src);
  setChip(s.refs.destChip, dest);
  setChip(s.refs.methodChip, method);
  setChip(s.refs.copyChip, copy);
}

// Pins the visibility of EVERY element born mid-story, and of every lane, exactly as setChips pins
// every chip. A lane into an object that does not exist points at nothing, so lanes are pinned to 0
// rather than left at whatever the previous step happened to set. The clone claim and the clone disk
// default to PLACEHOLDER, not to 0: they are one half of a mirrored pair each, and cutting one half
// out leaves a hole rather than an absence.
function setStage(s, { clone = PLACEHOLDER, cloneDisk = PLACEHOLDER, bound = 0, ds = 0, lanes = [] } = {}) {
  s.refs.clonePvc.style.opacity = String(clone);
  s.refs.cloneDisk.style.opacity = String(cloneDisk);
  s.refs.cloneBound.style.opacity = String(bound);
  s.refs.dsRef.style.opacity = String(ds);
  ['wReq', 'wCall', 'wCopy'].forEach(k => { s.refs[k].style.opacity = lanes.includes(k) ? '1' : '0'; });
}

function clearHL(s) {
  clearHighlights(s, ['prov', 'srcPvc', 'clonePvc', 'srcDisk', 'cloneDisk',
    'srcChip', 'destChip', 'methodChip', 'copyChip'], []);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A claim named data-src is Bound to a volume that already holds real data. You want a second, independent copy of that volume, and you do not want to create a snapshot object first. Cloning does exactly that in one step, straight from claim to claim.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: 'Bound', dest: 'none', method: 'none', copy: 'none' });
      setStage(s);
      setBoxSublabel(s.refs.clonePvc, 'dataSource: data-src');
      setWire(s, 'srcCap', 'holds real data');
      setWire(s, 'cloneCap', 'not created yet');
    },
  },
  {
    id: 'dest',
    duration: 3000,
    narration: 'You create a new PVC named clone-1 whose dataSource is not a snapshot but the existing claim data-src, with kind PersistentVolumeClaim. That single field turns an ordinary claim into a clone request pointing straight at another live volume.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: 'Bound', dest: 'Pending', method: 'kind: PVC', copy: 'none' });
      setStage(s, { clone: 1, ds: 1 });
      setWire(s, 'srcCap', 'holds real data');
      setWire(s, 'cloneCap', 'not created yet');
      s.refs.clonePvc.classList.add('highlight');
      s.refs.srcPvc.classList.add('highlight');
      if (ctx.reduced) return;
      setStage(s, { ds: 0 });
      revealAt(s.refs.clonePvc, ctx, 0, PLACEHOLDER);
      // The dataSource line only means anything once both claims exist, so it draws in after the
      // clone has landed rather than alongside it.
      ctx.register(s.refs.dsRef.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: LAND_MS, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'constraints',
    duration: 3400,
    narration: 'A clone is only allowed within limits. Both claims must live in the same namespace and use the same volumeMode, the new claim must ask for at least the size of the source, and the source must be bound and not in use. The StorageClass is free to differ.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: 'Bound', dest: 'Pending', method: 'kind: PVC', copy: 'none' });
      setStage(s, { clone: 1, ds: 1 });
      setWire(s, 'ns', 'same namespace');
      setWire(s, 'mode', 'same volumeMode');
      setWire(s, 'size', 'size at least the source');
      setWire(s, 'state', 'source bound and not in use');
      setWire(s, 'srcCap', 'not in use');
      setWire(s, 'cloneCap', 'not created yet');
      // Both claims light and hold, since the rules are about the pair. No blink: see the PULSE MODEL
      // note at the top of the file.
      s.refs.clonePvc.classList.add('highlight');
      s.refs.srcPvc.classList.add('highlight');
    },
  },
  {
    id: 'copy',
    // Three chained hops: the claim picked up, the CreateVolume call out and down into the backend, and
    // the duplicate made on the shelf once the target exists. anim-dump puts the span at 5338 after the
    // call was rerouted around the outside. Routes are length-based, so re-measure after ANY geometry
    // change here rather than trusting this number.
    duration: 5900,
    narration: 'The external-provisioner sees a dataSource of kind PVC on a claim it owns, and calls CreateVolume on the driver naming the source volume. The storage system makes an exact duplicate of it, server-side, with no snapshot object created along the way and nothing copied out through the cluster.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: 'Bound', dest: 'Pending', method: 'kind: PVC', copy: 'server-side' });
      setStage(s, { clone: 1, ds: 1, cloneDisk: 1, lanes: ['wReq', 'wCall', 'wCopy'] });
      setWire(s, 'srcCap', 'read as the source');
      setWire(s, 'cloneCap', 'exact duplicate');
      // The clone claim is where the request departs from, so it is lit at entry. The provisioner, the
      // source disk and the new disk are receivers and earn their highlights on arrival.
      s.refs.clonePvc.classList.add('highlight');
      if (ctx.reduced) {
        s.refs.prov.classList.add('highlight');
        s.refs.srcDisk.classList.add('highlight');
        s.refs.cloneDisk.classList.add('highlight');
        return;
      }
      setStage(s, { clone: 1, ds: 1, lanes: ['wReq', 'wCall', 'wCopy'] });
      const req = routePacket(s, ctx, W_REQ, { delay: BEAT.lead, cat: 'storage' });
      // Rides BELOW the ball: this hop ends ON the provisioner bottom edge, and above the ball the tag
      // would print across the box sublabel. See the dy note on ridingLabel.
      ridingLabel(s, ctx, 'clone of data-src', W_REQ, { delay: BEAT.lead, dy: 22 });
      lightBoxAt(s.refs.prov, ctx, req.arrivalMs);
      const call = routePacket(s, ctx, W_CALL, { delay: req.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'CreateVolume', W_CALL, { delay: req.arrivalMs + BEAT.afterHop });
      revealAt(s.refs.cloneDisk, ctx, call.arrivalMs, PLACEHOLDER);
      // The duplicate is only made once the target volume exists, so it waits out the materialisation.
      const copyAt = call.arrivalMs + LAND_MS;
      const copy = routePacket(s, ctx, W_COPY, { delay: copyAt, cat: 'storage' });
      ridingLabel(s, ctx, 'exact duplicate', W_COPY, { delay: copyAt });
      lightBoxAt(s.refs.srcDisk, ctx, copyAt);
      lightBoxAt(s.refs.cloneDisk, ctx, copy.arrivalMs);
    },
  },
  {
    id: 'bound',
    duration: 3200,
    narration: 'A PV is created for the new volume and clone-1 binds to it. From that moment the clone is an independent object: it can be consumed, cloned, snapshotted or deleted on its own, and the source can be modified or deleted without affecting it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: 'Bound', dest: 'Bound', method: 'kind: PVC', copy: 'complete' });
      setStage(s, { clone: 1, ds: 1, cloneDisk: 1, bound: 1 });
      setBoxSublabel(s.refs.clonePvc, 'Bound, 10Gi gp3');
      setWire(s, 'srcCap', 'unchanged');
      setWire(s, 'cloneCap', 'independent volume');
      s.refs.clonePvc.classList.add('highlight');
      s.refs.cloneDisk.classList.add('highlight');
      if (ctx.reduced) return;
      // The identity link is the one thing this step adds, so it draws itself in. It is held back to
      // here rather than drawn during the copy, because the claim binds only once the volume exists.
      setStage(s, { clone: 1, ds: 1, cloneDisk: 1, bound: 0 });
      ctx.register(s.refs.cloneBound.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: BEAT.afterHop, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'contrast',
    duration: 3200,
    narration: 'This is the difference from a snapshot restore. A snapshot needs its own VolumeSnapshot and VolumeSnapshotContent objects in between, and can be kept and restored many times. A clone is a one-shot claim to claim copy with nothing in the middle, so use it when you just want a duplicate now.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: 'Bound', dest: 'Bound', method: 'kind: PVC', copy: 'complete' });
      setStage(s, { clone: 1, ds: 1, cloneDisk: 1, bound: 1 });
      setBoxSublabel(s.refs.clonePvc, 'Bound, 10Gi gp3');
      setWire(s, 'srcCap', 'unchanged');
      setWire(s, 'cloneCap', 'independent volume');
      // The closing step comes to rest: the two lit claims and the dataSource line between them are
      // the whole point and they are already on screen. No blink, see the PULSE MODEL note.
      s.refs.srcPvc.classList.add('highlight');
      s.refs.clonePvc.classList.add('highlight');
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
