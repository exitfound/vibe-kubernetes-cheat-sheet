import { P, F, defineCard, chipStrip, BEAT, FADE, OPACITY, REVEAL_MS } from './storage-kit.js';
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

const CHIP_W = 232, CHIP_GAP = 16;
const STRIP = chipStrip({ w: CHIP_W, gap: CHIP_GAP });   // 976 wide, x0 112, so the strip centres on CX

// Each static wire and its ball share ONE points array, so they cannot drift apart. Every endpoint is
// a block edge midpoint.
const W_REQ = [[CLONE_CX, CLAIM_TOP], [CLONE_CX, REQ_CORRIDOR_Y], [CX, REQ_CORRIDOR_Y], [CX, PROV_BOTTOM]];
const W_CALL = [[PROV_X + PROV_W, PROV_Y + PROV_H / 2], [CALL_WRAP_X, PROV_Y + PROV_H / 2], [CALL_WRAP_X, DISK_MY], [CLONE_CX + DISK_W / 2, DISK_MY]];
const W_COPY = [[SRC_CX + DISK_W / 2, DISK_MY], [CLONE_CX - DISK_W / 2, DISK_MY]];

// A tag on the shelf hop rides in the band between the frame top and the disks, not on the disk
// midline: on the midline a disk wall prints through it at both ends of the hop.
const SHELF_TAG_DY = FRAME_Y + FRAME_INSET / 2 + 4 - DISK_MY;   // -62

// The list order IS the append order, which is the z-order: the frame, then the blocks and disks on
// it, then the relationships and lanes and their captions, then the chip strip, then the packets.
export const SCENE = {
  'aria-label': 'Cloning a PVC: a new PersistentVolumeClaim whose dataSource points at an existing PVC rather than a snapshot, so the external provisioner calls CreateVolume and the storage system makes an exact duplicate server-side with no snapshot object in between, subject to the constraints that the two claims share a namespace and a volumeMode, that the destination asks for at least the size of the source, and that the source is bound and not in use, while the StorageClass is free to differ, after which the clone is a fully independent volume',
  parts: [
    P.defs(),
    P.node({ key: 'frame', x: FRAME_X, y: FRAME_Y, w: FRAME_W, h: FRAME_H, label: 'Storage backend' }),
    P.box({ key: 'prov', x: PROV_X, y: PROV_Y, w: PROV_W, h: PROV_H, label: 'External-provisioner', sublabel: 'driver: ebs.csi.aws.com' }),
    P.box({ key: 'srcPvc', x: SRC_CX - CLAIM_W / 2, y: CLAIM_Y, w: CLAIM_W, h: CLAIM_H, label: 'PVC data-src', sublabel: 'Bound, 10Gi gp3' }),
    P.box({ key: 'clonePvc', x: CLONE_CX - CLAIM_W / 2, y: CLAIM_Y, w: CLAIM_W, h: CLAIM_H, label: 'PVC clone-1', sublabel: 'dataSource: data-src' }),
    // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse
    // is not part of the visible front face. Re-centre on the face, derived from the height.
    P.cylinder({ key: 'srcDisk', x: SRC_CX - DISK_W / 2, y: DISK_Y, w: DISK_W, h: DISK_H, label: 'Source Volume', labelY: DISK_H / 2 + 10 }),
    P.cylinder({ key: 'cloneDisk', x: CLONE_CX - DISK_W / 2, y: DISK_Y, w: DISK_W, h: DISK_H, label: 'Cloned Volume', labelY: DISK_H / 2 + 10 }),
    // A relationship, not traffic: markerless because a head with no ball reads as traffic that never
    // runs, dashed because a solid line reads as a live route. Each claim bound to its own volume.
    P.relation({ d: `M ${SRC_CX} ${CLAIM_BOTTOM} L ${SRC_CX} ${DISK_TOP}`, dash: '5 5' }),
    P.relation({ key: 'cloneBound', d: `M ${CLONE_CX} ${CLAIM_BOTTOM} L ${CLONE_CX} ${DISK_TOP}`, dash: '5 5', opacity: 0 }),
    // dataSource: the clone references the source CLAIM directly, face midpoint to face midpoint.
    P.relation({ key: 'dsRef', d: `M ${CLONE_CX - CLAIM_W / 2} ${CLAIM_MY} L ${SRC_CX + CLAIM_W / 2} ${CLAIM_MY}`, dash: '5 5', opacity: 0 }),
    P.lane({ key: 'wReq', points: W_REQ, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wCall', points: W_CALL, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wCopy', points: W_COPY, dashed: true, dim: true, opacity: 0 }),
    P.wire({ key: 'ns', x: CX, y: RULE_Y[0] }),
    P.wire({ key: 'mode', x: CX, y: RULE_Y[1] }),
    P.wire({ key: 'size', x: CX, y: RULE_Y[2] }),
    P.wire({ key: 'state', x: CX, y: RULE_Y[3] }),
    P.wire({ key: 'srcCap', x: SRC_CX, y: CAPTION_Y }),
    P.wire({ key: 'cloneCap', x: CLONE_CX, y: CAPTION_Y }),
    // The first two are the real phase field on each claim, the third is the real dataSource field,
    // and the fourth reports the copy the storage system is making.
    P.chip({ key: 'srcChip', x: STRIP.x(0), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'data-src', value: 'Bound' }),
    P.chip({ key: 'destChip', x: STRIP.x(1), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'clone-1', value: 'none' }),
    P.chip({ key: 'methodChip', x: STRIP.x(2), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'dataSource', value: 'none' }),
    P.chip({ key: 'copyChip', x: STRIP.x(3), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'copy', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: ['prov', 'srcPvc', 'clonePvc', 'srcDisk', 'cloneDisk',
      'srcChip', 'destChip', 'methodChip', 'copyChip'],
  },
};

// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a card
// comes to report a completed copy on the step that is still checking the constraints.
const chips = (src, dest, method, copy) => ({ srcChip: src, destChip: dest, methodChip: method, copyChip: copy });

// STO.S-01 as a field: the clone half of the mirror and all three lanes are pinned on EVERY step and
// never inherited, since the reduced replay walks 0..n and clearHighlights clears classes, not styles.
const LANES_OFF = { wReq: 0, wCall: 0, wCopy: 0 };
const LANES_ON = { wReq: 1, wCall: 1, wCopy: 1 };
const NOT_YET = { clonePvc: OPACITY.pending, cloneDisk: OPACITY.pending, cloneBound: 0, dsRef: 0, ...LANES_OFF };
const REQUESTED = { clonePvc: 1, cloneDisk: OPACITY.pending, cloneBound: 0, dsRef: 1, ...LANES_OFF };
const COPYING = { clonePvc: 1, cloneDisk: 1, cloneBound: 0, dsRef: 1, ...LANES_ON };
const CLONED = { clonePvc: 1, cloneDisk: 1, cloneBound: 1, dsRef: 1, ...LANES_OFF };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('Bound', 'none', 'none', 'none'),
    wires: { srcCap: 'holds real data', cloneCap: 'not created yet' },
    sublabels: { clonePvc: 'dataSource: data-src' },
    opacity: NOT_YET,
  },
  {
    id: 'dest',
    duration: 3000,
    narration: 'You create a new PVC named clone-1 whose dataSource is not a snapshot but the existing claim data-src, with kind PersistentVolumeClaim. That single field turns an ordinary claim into a clone request pointing straight at another live volume.',
    chipsCued: chips('Bound', 'Pending', 'kind: PVC', 'none'),
    wires: { srcCap: 'holds real data', cloneCap: 'not created yet' },
    opacity: REQUESTED,
    lit: ['clonePvc', 'srcPvc'],
    // The clone claim and its dataSource line are what this step ADDS, so the animated path starts
    // from the state the idle step left and lets the reveal and the fade bring them up.
    rewind: { opacity: NOT_YET },
    flow: [
      F.reveal({ target: 'clonePvc', from: OPACITY.pending }),
      // The dataSource line only means anything once both claims exist, so it draws in after the
      // clone has landed rather than alongside it.
      F.fade({ target: 'dsRef', from: 0, to: 1, dur: FADE.in, delay: REVEAL_MS, fill: 'forwards', easing: 'ease-out' }),
    ],
  },
  {
    id: 'constraints',
    duration: 3400,
    narration: 'A clone is only allowed within limits. Both claims must live in the same namespace and use the same volumeMode, the new claim must ask for at least the size of the source, and the source must be bound and not in use. The StorageClass is free to differ.',
    chipsCued: chips('Bound', 'Pending', 'kind: PVC', 'none'),
    wires: {
      ns: 'same namespace', mode: 'same volumeMode', size: 'size at least the source',
      state: 'source bound and not in use', srcCap: 'not in use', cloneCap: 'not created yet',
    },
    opacity: REQUESTED,
    // Both claims light and hold, since the rules are about the pair. No blink: see the PULSE MODEL
    // note at the top of the file.
    lit: ['clonePvc', 'srcPvc'],
  },
  {
    id: 'copy',
    duration: 5900,
    narration: 'The external-provisioner sees a dataSource of kind PVC on a claim it owns, and calls CreateVolume on the driver naming the source volume. The storage system makes an exact duplicate of it, server-side, with no snapshot object created along the way and nothing copied out through the cluster.',
    chipsCued: chips('Bound', 'Pending', 'kind: PVC', 'server-side'),
    wires: { srcCap: 'read as the source', cloneCap: 'exact duplicate' },
    opacity: COPYING,
    // The clone claim is where the request departs from, so it is lit at entry. The provisioner, the
    // source disk and the new disk are receivers and earn their highlights on arrival.
    lit: ['clonePvc'],
    // The new volume is MADE on this step, so the animated path starts with it still pending.
    rewind: { opacity: { cloneDisk: OPACITY.pending } },
    flow: [
      F.route({ points: W_REQ, delay: BEAT.lead, name: 'req' }),
      // Rides BELOW the ball: this hop ends ON the provisioner bottom edge, and above the ball the tag
      // would print across the box sublabel.
      F.tag({ text: 'clone of data-src', points: W_REQ, delay: BEAT.lead, dy: 22 }),
      F.light({ targets: ['prov'], at: 'req' }),
      F.route({ points: W_CALL, after: 'req', name: 'call' }),
      F.tag({ text: 'CreateVolume', points: W_CALL, after: 'req' }),
      // The duplicate is only made once the target volume exists, so it waits out the materialisation.
      F.reveal({ target: 'cloneDisk', from: OPACITY.pending, at: 'call', name: 'made' }),
      F.route({ points: W_COPY, at: 'made', name: 'copy' }),
      F.tag({ text: 'exact duplicate', points: W_COPY, at: 'made', dy: SHELF_TAG_DY }),
      F.light({ targets: ['srcDisk'], at: 'made' }),
      F.light({ targets: ['cloneDisk'], at: 'copy' }),
    ],
  },
  {
    id: 'bound',
    duration: 3200,
    narration: 'A PV is created for the new volume and clone-1 binds to it. From that moment the clone is an independent object: it can be consumed, cloned, snapshotted or deleted on its own, and the source can be modified or deleted without affecting it.',
    chipsCued: chips('Bound', 'Bound', 'kind: PVC', 'complete'),
    wires: { srcCap: 'unchanged', cloneCap: 'independent volume' },
    sublabels: { clonePvc: 'Bound, 10Gi gp3' },
    opacity: CLONED,
    lit: ['clonePvc', 'cloneDisk'],
    // The identity link is the one thing this step adds, so it draws itself in. It is held back to
    // here rather than drawn during the copy, because the claim binds only once the volume exists.
    rewind: { opacity: { cloneBound: 0 } },
    flow: [
      F.fade({ target: 'cloneBound', from: 0, to: 1, dur: FADE.in, delay: BEAT.afterHop, fill: 'forwards', easing: 'ease-out' }),
    ],
  },
  {
    id: 'contrast',
    duration: 3200,
    narration: 'This is the difference from a snapshot restore. A snapshot needs its own VolumeSnapshot and VolumeSnapshotContent objects in between, and can be kept and restored many times. A clone is a one-shot claim to claim copy with nothing in the middle, so use it when you just want a duplicate now.',
    chipsCued: chips('Bound', 'Bound', 'kind: PVC', 'complete'),
    wires: { srcCap: 'unchanged', cloneCap: 'independent volume' },
    sublabels: { clonePvc: 'Bound, 10Gi gp3' },
    opacity: CLONED,
    // The closing step comes to rest: the two lit claims and the dataSource line between them are
    // the whole point and they are already on screen. No blink, see the PULSE MODEL note.
    lit: ['srcPvc', 'clonePvc'],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
