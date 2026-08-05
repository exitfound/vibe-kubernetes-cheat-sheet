import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, node, cylinder, pathArrow } from '../../lib/primitives.js';
import { valChip, setVal, setChip, setBoxSublabel, routePacket, makeInit, clearHighlights, clearWires, setWire, relationPath, BEAT, FADE, lightBoxAt, makeRidingLabel, OPACITY, revealAt, REVEAL_MS } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-pvc-clone


const CX = 600;

const PROV_X = 420, PROV_Y = 36, PROV_W = 360, PROV_H = 68;
const PROV_BOTTOM = PROV_Y + PROV_H;                                    // 104

// The claim row is the only tier the narration panel could reach (its bottom is 230 on this card,
// measured over 1600/1280/1100), and the source claim sits at x 180, so the row starts below it.
const CLAIM_W = 280, CLAIM_H = 68, CLAIM_Y = 236;
const CLAIM_TOP = CLAIM_Y, CLAIM_BOTTOM = CLAIM_Y + CLAIM_H;            // 236 / 304
const CLAIM_MY = CLAIM_Y + CLAIM_H / 2;                                 // 270
const SPREAD = 280;
const SRC_CX = CX - SPREAD, CLONE_CX = CX + SPREAD;                     // 320 / 880

const DISK_W = 200, DISK_H = 90;
const FRAME_INSET = 42;
const FRAME_X = 180, FRAME_W = 840, FRAME_Y = 396;                      // 180..1020, below the four
const FRAME_H = DISK_H + FRAME_INSET * 2;                               // constraint lines, 396..570

const DISK_Y = FRAME_Y + FRAME_INSET;                                   // 438
const DISK_TOP = DISK_Y, DISK_BOTTOM = DISK_Y + DISK_H;                 // 438 / 528
const DISK_MY = DISK_Y + DISK_H / 2;                                    // 483
// Two disks 200 wide at 320 and 880 span 220..420 and 780..980 inside a frame at 180..1020, so the
// frame keeps 40 of margin on each side and the copy hop has 360 units of shelf to travel.

const REQ_CORRIDOR_Y = (PROV_BOTTOM + CLAIM_TOP) / 2;                   // 170
// The outbound column for the call, in the margin between the backend frame (ends 1020) and the chip
// strip (ends 1088), so it clears both.
const CALL_WRAP_X = 1060;
// Four constraints, four lines, on the centre line in the band between the claims and the backend.
const RULE_Y0 = CLAIM_Y + CLAIM_H + 16, RULE_PITCH = 20;                // 320
const RULE_Y = [0, 1, 2, 3].map(i => RULE_Y0 + i * RULE_PITCH);         // 320 / 340 / 360 / 380
const CAPTION_Y = DISK_BOTTOM + 24;               // 552, leaving 18 to the frame floor
const CHIPS_Y = 588;                              // 18 below the frame, and 18 above the canvas floor

// Each static wire and its ball share ONE points array, so they cannot drift apart. Every endpoint is
// a block edge midpoint.
const W_REQ = [[CLONE_CX, CLAIM_TOP], [CLONE_CX, REQ_CORRIDOR_Y], [CX, REQ_CORRIDOR_Y], [CX, PROV_BOTTOM]];
const W_CALL = [[PROV_X + PROV_W, PROV_Y + PROV_H / 2], [CALL_WRAP_X, PROV_Y + PROV_H / 2], [CALL_WRAP_X, DISK_MY], [CLONE_CX + DISK_W / 2, DISK_MY]];
const W_COPY = [[SRC_CX + DISK_W / 2, DISK_MY], [CLONE_CX - DISK_W / 2, DISK_MY]];

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

const lane = points => pathArrow({ points, dashed: true, dim: true, role: 'storage' });

// A relationship, not traffic: no marker, because an arrowhead with no ball reads as traffic that
// never runs, and DASHED, because a solid line between two objects reads as a live route.
const relLink = d => relationPath({ d, role: 'storage', dash: '5 5' });

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

    const prov = box({ x: PROV_X, y: PROV_Y, w: PROV_W, h: PROV_H, label: 'External-provisioner', sublabel: 'driver: ebs.csi.aws.com', role: 'storage' });

    const srcPvc = box({ x: SRC_CX - CLAIM_W / 2, y: CLAIM_Y, w: CLAIM_W, h: CLAIM_H, label: 'PVC data-src', sublabel: 'Bound, 10Gi gp3', role: 'storage' });
    const clonePvc = box({ x: CLONE_CX - CLAIM_W / 2, y: CLAIM_Y, w: CLAIM_W, h: CLAIM_H, label: 'PVC clone-1', sublabel: 'dataSource: data-src', role: 'storage' });

    const frame = node({ x: FRAME_X, y: FRAME_Y, w: FRAME_W, h: FRAME_H, label: 'Storage backend' });

    const mkDisk = (cx, label) => {
      const c = cylinder({ x: cx - DISK_W / 2, y: DISK_Y, w: DISK_W, h: DISK_H, label, role: 'storage' });
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

    const CHIP_W = 232, CHIP_GAP = 16;
    const CHIPS_W = CHIP_W * 4 + CHIP_GAP * 3;                  // 976
    const CHIPS_X = CX - CHIPS_W / 2;                           // 112, so the strip centres on CX
    const chipX = i => CHIPS_X + i * (CHIP_W + CHIP_GAP);
    // The first two are the real phase field on each claim, the third is the real dataSource field,
    // and the fourth reports the copy the storage system is making.
    const srcChip    = valChip({ x: chipX(0), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'data-src',   value: 'Bound',     role: 'storage' });
    const destChip   = valChip({ x: chipX(1), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'clone-1',    value: 'none',      role: 'storage' });
    const methodChip = valChip({ x: chipX(2), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'dataSource', value: 'none',      role: 'storage' });
    const copyChip   = valChip({ x: chipX(3), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'copy',       value: 'none',      role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

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


// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a card
// comes to report a completed copy on the step that is still checking the constraints.
function setChips(s, { src, dest, method, copy }) {
  setChip(s.refs.srcChip, src);
  setChip(s.refs.destChip, dest);
  setChip(s.refs.methodChip, method);
  setChip(s.refs.copyChip, copy);
}

function setStage(s, { clone = OPACITY.pending, cloneDisk = OPACITY.pending, bound = 0, ds = 0, lanes = [] } = {}) {
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
      revealAt(s.refs.clonePvc, ctx, 0, OPACITY.pending);
      // The dataSource line only means anything once both claims exist, so it draws in after the
      // clone has landed rather than alongside it.
      ctx.register(s.refs.dsRef.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: REVEAL_MS, fill: 'forwards', easing: 'ease-out' }));
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
      const req = routePacket(s, ctx, W_REQ, { delay: BEAT.lead, role: 'storage' });
      // Rides BELOW the ball: this hop ends ON the provisioner bottom edge, and above the ball the tag
      // would print across the box sublabel. See the dy note on ridingLabel.
      ridingLabel(s, ctx, 'clone of data-src', W_REQ, { delay: BEAT.lead, dy: 22 });
      lightBoxAt(s.refs.prov, ctx, req.arrivalMs);
      const call = routePacket(s, ctx, W_CALL, { delay: req.arrivalMs + BEAT.afterHop, role: 'storage' });
      ridingLabel(s, ctx, 'CreateVolume', W_CALL, { delay: req.arrivalMs + BEAT.afterHop });
      revealAt(s.refs.cloneDisk, ctx, call.arrivalMs, OPACITY.pending);
      // The duplicate is only made once the target volume exists, so it waits out the materialisation.
      const copyAt = call.arrivalMs + REVEAL_MS;
      const copy = routePacket(s, ctx, W_COPY, { delay: copyAt, role: 'storage' });
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
