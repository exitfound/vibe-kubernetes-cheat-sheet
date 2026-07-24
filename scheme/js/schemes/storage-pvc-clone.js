import { svg, g, text, path } from '../lib/svg.js';
import { arrowDefs, box, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT, FADE,
} from '../lib/storage-kit.js';

// Cloning a PVC. A new PVC whose dataSource points at an EXISTING PVC, not a snapshot. The driver
// copies the volume server-side and there is no snapshot object in between, which is the whole
// contrast with the snapshot card.
//
// ---- Horizontal composition ----
// The card is a mirror: source on the left, clone on the right, reflected about the canvas centre.
// CLAIM_CX = [CX - SPREAD, CX + SPREAD] with CX = 600, and the disks hang on the same two centre
// lines, so the reflection holds on every tier. The provisioner sits alone on the centre line above
// them because it is the one thing that belongs to neither side. Content spans 180..1020, margins 180
// a side. The earlier pass ran 430..1095 with the provisioner at 815 against a claim midpoint of 762,
// so the one block that should have been centred was the one visibly off it.
//
// ---- Narration overlay ----
// Measured (tools/overlay-measure.mjs), overlay bottom-right in viewBox units:
//   1920x900  right 102  bottom 183
//   1600x1000 right 291  bottom 160
//   1280x900  right 378  bottom 173
//   1100x900  right 397  bottom 173
// Worst case x <= 397 and y <= 183. Only the provisioner sits inside that y band, and at 400..800 it
// clears the overlay on x while still centring on CX. The claim row (y 196) and everything below it
// clear the overlay entirely, which is what frees the full width for the mirror. A longer narration
// than the ones below would invalidate this measurement.
//
// PULSE MODEL: nothing pulses. There is no Pod on this card, and every block is infrastructure that
// lights via .highlight on packet arrival. The two sanctioned block blinks are on the constraints step
// and the contrast step, both of which carry no packet and no Pod.
//
// WIRES: the card has ZERO wire crossings. The clone request and the provisioning call both run
// between the provisioner and the clone claim, in opposite directions, so they are a LANE pair: the
// request rises at CLONE_CX + LANE through its own corridor and the call descends at CLONE_CX - LANE
// through a lower one, and the two corridors and two axes are chosen so neither leg meets the other.
// The dataSource line between the two claims is a relationship, so it has no arrowhead.
const CX = 600;

const PROV_X = 400, PROV_Y = 36, PROV_W = 400, PROV_H = 68;
const PROV_BOTTOM = PROV_Y + PROV_H;                                    // 104

const CLAIM_W = 280, CLAIM_H = 68, CLAIM_Y = 196;
const CLAIM_TOP = CLAIM_Y, CLAIM_BOTTOM = CLAIM_Y + CLAIM_H;            // 196 / 264
const CLAIM_MY = CLAIM_Y + CLAIM_H / 2;                                 // 230
const SPREAD = 280;
const SRC_CX = CX - SPREAD, CLONE_CX = CX + SPREAD;                     // 320 / 880

const DISK_W = 200, DISK_H = 100, DISK_Y = 380;
const DISK_TOP = DISK_Y, DISK_BOTTOM = DISK_Y + DISK_H, DISK_MY = DISK_Y + DISK_H / 2;   // 380 / 480 / 430

const REQ_CORRIDOR_Y = 140;      // the clone request rises through here, above the claims
const CALL_CORRIDOR_Y = 164;     // the provisioning call descends through here, below the request
const RULE_Y = [300, 326, 352];  // the three constraint captions, on the centre line
const COPY_CAPTION_Y = DISK_BOTTOM + 28;
const CHIPS_Y = 548;

// The request and the call share both the provisioner bottom face and the clone claim top face, in
// opposite directions, so each takes one side of the axis. 12 is the family value for a narrow lane pair.
const LANE = 12;

// Each static wire and its ball share ONE points array, so they cannot drift apart. Every endpoint is
// a block edge midpoint, or one of the two LANE twins around it.
const W_REQ = [[CLONE_CX + LANE, CLAIM_TOP], [CLONE_CX + LANE, REQ_CORRIDOR_Y], [CX + LANE, REQ_CORRIDOR_Y], [CX + LANE, PROV_BOTTOM]];
const W_CALL = [[CX - LANE, PROV_BOTTOM], [CX - LANE, CALL_CORRIDOR_Y], [CLONE_CX - LANE, CALL_CORRIDOR_Y], [CLONE_CX - LANE, CLAIM_TOP]];
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
// read as a frozen frame. Never used on a value chip.
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

// A relationship, not traffic, so a bare path with no marker: an arrowhead with no ball reads as
// traffic that never runs.
function relLink(d, { dashed = true } = {}) {
  const cls = 'scheme-arrow scheme-arrow-storage' + (dashed ? ' scheme-arrow-dashed scheme-arrow-dim' : '');
  const attrs = { class: cls, d, fill: 'none' };
  if (dashed) attrs['stroke-dasharray'] = '5 5';
  return path(attrs);
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
      'aria-label': 'Cloning a PVC: a new PersistentVolumeClaim whose dataSource points at an existing PVC rather than a snapshot, so the driver copies the volume server-side with no snapshot object in between, subject to the constraints that the two claims share a namespace and StorageClass and the destination is at least as large as the source',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const prov = box({ x: PROV_X, y: PROV_Y, w: PROV_W, h: PROV_H, label: 'CSI provisioner', sublabel: 'controller sidecar', cat: 'storage' });

    const srcPvc = box({ x: SRC_CX - CLAIM_W / 2, y: CLAIM_Y, w: CLAIM_W, h: CLAIM_H, label: 'PVC data-src', sublabel: 'Bound, 10Gi gp3', cat: 'storage' });
    const clonePvc = box({ x: CLONE_CX - CLAIM_W / 2, y: CLAIM_Y, w: CLAIM_W, h: CLAIM_H, label: 'PVC clone-1', sublabel: 'dataSource: data-src', cat: 'storage' });
    clonePvc.style.opacity = '0';

    const mkDisk = (cx, label) => {
      const c = cylinder({ x: cx - DISK_W / 2, y: DISK_Y, w: DISK_W, h: DISK_H, label, cat: 'storage' });
      // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse
      // is not part of the visible front face. Re-centre on the face, derived from the height.
      const l = c.querySelector('.scheme-cylinder-label');
      if (l) l.setAttribute('y', DISK_H / 2 + 10);
      return c;
    };
    const srcDisk = mkDisk(SRC_CX, 'source disk');
    const cloneDisk = mkDisk(CLONE_CX, 'clone disk');
    cloneDisk.style.opacity = '0';

    // Identity: each claim bound to its own disk, straight down the column centre line.
    const srcBound = relLink(`M ${SRC_CX} ${CLAIM_BOTTOM} L ${SRC_CX} ${DISK_TOP}`, { dashed: false });
    const cloneBound = relLink(`M ${CLONE_CX} ${CLAIM_BOTTOM} L ${CLONE_CX} ${DISK_TOP}`, { dashed: false });
    cloneBound.style.opacity = '0';
    // dataSource: the clone references the source CLAIM directly, face midpoint to face midpoint.
    const dsRef = relLink(`M ${CLONE_CX - CLAIM_W / 2} ${CLAIM_MY} L ${SRC_CX + CLAIM_W / 2} ${CLAIM_MY}`);
    dsRef.style.opacity = '0';

    const wReq = lane(W_REQ);
    const wCall = lane(W_CALL);
    const wCopy = lane(W_COPY);
    [wReq, wCall, wCopy].forEach(w => { w.style.opacity = '0'; });

    const ruleLbls = RULE_Y.map(y => text({ class: 'scheme-label code dim', x: CX, y, 'text-anchor': 'middle' }, [' ']));
    const copyLbl = text({ class: 'scheme-label code dim', x: CX, y: COPY_CAPTION_Y, 'text-anchor': 'middle' }, [' ']);

    // CHIP_W 232 is the storage family default. Worst case here is 'dataSource' + 'PVC to PVC, direct'
    // at 28 characters, and .scheme-chip-text runs 6.89 viewBox units per character, so 28 * 6.89 + 24
    // of padding is 217 against the 232 available.
    const CHIP_W = 232, CHIP_GAP = 16;
    const CHIPS_W = CHIP_W * 4 + CHIP_GAP * 3;                  // 976
    const CHIPS_X = CX - CHIPS_W / 2;                           // 112, so the strip centres on CX
    const chipX = i => CHIPS_X + i * (CHIP_W + CHIP_GAP);
    const srcChip    = valChip({ x: chipX(0), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'source',     value: 'data-src Bound', cat: 'storage' });
    const destChip   = valChip({ x: chipX(1), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'clone-1',    value: 'none',           cat: 'storage' });
    const methodChip = valChip({ x: chipX(2), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'dataSource', value: 'kind: PVC',      cat: 'storage' });
    const copyChip   = valChip({ x: chipX(3), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'copy',       value: 'none',           cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): blocks and disks, then the relationship links and lanes and their
    // captions above them, then the chip strip, then the packet layer so every ball rides above
    // everything.
    [prov, srcPvc, clonePvc, srcDisk, cloneDisk].forEach(el => root.appendChild(el));
    [srcBound, cloneBound, dsRef, wReq, wCall, wCopy, ...ruleLbls, copyLbl].forEach(el => root.appendChild(el));
    [srcChip, destChip, methodChip, copyChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, prov, srcPvc, clonePvc, srcDisk, cloneDisk,
      cloneBound, dsRef, wReq, wCall, wCopy,
      srcChip, destChip, methodChip, copyChip,
      wires: { ns: ruleLbls[0], sc: ruleLbls[1], size: ruleLbls[2], copy: copyLbl },
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
// rather than left at whatever the previous step happened to set.
function setStage(s, { clone = 0, cloneDisk = 0, bound = 0, ds = 0, lanes = [] } = {}) {
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
    narration: 'A claim data-src is Bound to a disk that already holds real data. You want a second, independent copy of that disk right now, without stopping the workload and without setting up a snapshot first. Cloning does exactly this in one step.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: 'data-src Bound', dest: 'none', method: 'kind: PVC', copy: 'none' });
      setStage(s);
      setBoxSublabel(s.refs.clonePvc, 'dataSource: data-src');
    },
  },
  {
    id: 'dest',
    duration: 2800,
    narration: 'You create a new PVC named clone-1 whose dataSource is not a snapshot but the existing claim data-src, with kind PersistentVolumeClaim. That single field turns an ordinary claim into a clone request pointing straight at another live volume.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: 'data-src Bound', dest: 'Pending', method: 'kind: PVC', copy: 'none' });
      setStage(s, { clone: 1, ds: 1 });
      s.refs.clonePvc.classList.add('highlight');
      s.refs.srcPvc.classList.add('highlight');
      if (ctx.reduced) return;
      setStage(s, { clone: PLACEHOLDER, ds: 0 });
      revealAt(s.refs.clonePvc, ctx, 0);
      // The dataSource line only means anything once both claims exist, so it draws in after the
      // clone has landed rather than alongside it.
      ctx.register(s.refs.dsRef.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: LAND_MS, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'constraints',
    duration: 2800,
    narration: 'A clone is only allowed within limits. The two claims must live in the same namespace and use the same StorageClass, because the copy happens inside one driver, and the destination must be at least as large as the source. Break any of these and the clone is rejected outright.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: 'data-src Bound', dest: 'Pending', method: 'kind: PVC', copy: 'none' });
      setStage(s, { clone: 1, ds: 1 });
      s.refs.clonePvc.classList.add('highlight');
      s.refs.srcPvc.classList.add('highlight');
      setWire(s, 'ns', 'same namespace: ok');
      setWire(s, 'sc', 'same StorageClass: ok');
      setWire(s, 'size', 'size at least the source: ok');
      // No packet and no Pod on this step, so the sanctioned block blink keeps it from reading frozen.
      flashBox(s.refs.clonePvc, ctx, BEAT.afterHop);
    },
  },
  {
    id: 'copy',
    duration: 5200,
    // 5200: the step chains four hops (request up, call down, the disk materialising, then the copy
    // across the shelf), which anim-dump puts at a span just under this.
    narration: 'The provisioner sees a dataSource of kind PVC and asks the driver to clone. The driver copies the source volume to a fresh one entirely server-side, block for block, with no snapshot object created along the way. The source stays online the whole time.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: 'data-src Bound', dest: 'provisioning', method: 'kind: PVC', copy: 'server-side' });
      setStage(s, { clone: 1, ds: 1, cloneDisk: 1, bound: 1, lanes: ['wReq', 'wCall', 'wCopy'] });
      // The clone claim is where the request departs from, so it is lit at entry. The provisioner, the
      // source disk and the new clone disk are receivers and earn their highlights on arrival.
      s.refs.clonePvc.classList.add('highlight');
      setWire(s, 'copy', 'block-for-block copy');
      if (ctx.reduced) {
        s.refs.prov.classList.add('highlight');
        s.refs.srcDisk.classList.add('highlight');
        s.refs.cloneDisk.classList.add('highlight');
        return;
      }
      setStage(s, { clone: 1, ds: 1, cloneDisk: PLACEHOLDER, bound: 0, lanes: ['wReq', 'wCall', 'wCopy'] });
      const req = routePacket(s, ctx, W_REQ, { delay: BEAT.lead, cat: 'storage' });
      ridingLabel(s, ctx, 'clone data-src', W_REQ, { delay: BEAT.lead });
      lightBoxAt(s.refs.prov, ctx, req.arrivalMs);
      const call = routePacket(s, ctx, W_CALL, { delay: req.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'CreateVolume', W_CALL, { delay: req.arrivalMs + BEAT.afterHop });
      revealAt(s.refs.cloneDisk, ctx, call.arrivalMs, PLACEHOLDER);
      ctx.register(s.refs.cloneBound.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: call.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      // The copy only starts once the target disk exists, so it waits out the materialisation.
      const copyAt = call.arrivalMs + LAND_MS;
      const copy = routePacket(s, ctx, W_COPY, { delay: copyAt, cat: 'storage' });
      ridingLabel(s, ctx, 'server-side copy', W_COPY, { delay: copyAt });
      lightBoxAt(s.refs.srcDisk, ctx, copyAt);
      lightBoxAt(s.refs.cloneDisk, ctx, copy.arrivalMs);
    },
  },
  {
    id: 'bound',
    duration: 2800,
    narration: 'The fresh disk is wrapped in a new PV and clone-1 binds to it. The clone is now a fully independent volume: writing to it never touches data-src, and deleting data-src never touches the clone. They only shared bytes at the instant of the copy.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: 'data-src Bound', dest: 'Bound', method: 'kind: PVC', copy: 'complete' });
      setStage(s, { clone: 1, ds: 1, cloneDisk: 1, bound: 1 });
      setBoxSublabel(s.refs.clonePvc, 'Bound, 10Gi gp3');
      s.refs.clonePvc.classList.add('highlight');
      s.refs.cloneDisk.classList.add('highlight');
      setWire(s, 'copy', 'independent disk');
      if (ctx.reduced) return;
      // The Bound link is the one thing this step adds, so it draws itself in.
      setStage(s, { clone: 1, ds: 1, cloneDisk: 1, bound: 0 });
      ctx.register(s.refs.cloneBound.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: BEAT.afterHop, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'contrast',
    duration: 2800,
    narration: 'This is the difference from a snapshot restore. A snapshot needs its own VolumeSnapshot and VolumeSnapshotContent objects as a middle step, and can be kept and restored many times. A clone is a one-shot PVC to PVC copy with nothing in between, so use it when you just want a duplicate right now.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: 'data-src Bound', dest: 'Bound', method: 'PVC to PVC, direct', copy: 'complete' });
      setStage(s, { clone: 1, ds: 1, cloneDisk: 1, bound: 1 });
      setBoxSublabel(s.refs.clonePvc, 'Bound, 10Gi gp3');
      s.refs.srcPvc.classList.add('highlight');
      s.refs.clonePvc.classList.add('highlight');
      setWire(s, 'copy', 'no snapshot object in between');
      // The closing step comes to rest: no flash here, the two lit claims and the dataSource line
      // between them are the whole point and they are already on screen.
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
