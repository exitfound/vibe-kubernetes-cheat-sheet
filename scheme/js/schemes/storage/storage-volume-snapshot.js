import { P, F, defineCard, BEAT, FADE, OPACITY, STO, chipStrip, REVEAL_MS } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-volume-snapshot


const CX = 600;

const REQ_X = 420, REQ_Y = 36, REQ_W = 360, REQ_H = 68;
const REQ_RIGHT = REQ_X + REQ_W;                                            // 780
const REQ_MY = REQ_Y + REQ_H / 2, REQ_BOTTOM = REQ_Y + REQ_H;               // 70 / 104

const RST_X = 840, RST_W = 240;

// The middle row's left box lands at 144..376 whatever the spread, under the panel (x<=397 to y=280),
// so the row starts BELOW the panel floor and the chain runs right to left to reach it on the free side.
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
const CYL_MY = CYL_Y + CYL_H / 2, CYL_TOP = CYL_Y;                          // 483 / 438
const CYL_SPREAD = 300;
const SRC_CX = CX - CYL_SPREAD, SNAPDATA_CX = CX, RESTORED_CX = CX + CYL_SPREAD;   // 300 / 600 / 900
// Three disks 176 wide at 300/600/900 span 212..988 inside a frame at 144..1056, so the frame keeps 68
// of margin on each side and the disks keep 124 between them, which is the run each shelf hop travels.

// Kept clear of the frame rather than midway to it: the middle row now sits much closer.
const CORRIDOR_Y = FRAME_Y - 18;                            // 378
const REQ_CORRIDOR_Y = 157;
const CAPTION_Y = CYL_Y + CYL_H + 24;             // 552
const CHIPS_Y = 588;                              // 18 below the frame, and 18 above the canvas floor

const CHIP_W = 232, CHIP_GAP = 16;
const CHIPS = chipStrip({ cx: CX, w: CHIP_W, gap: CHIP_GAP });   // 112 / 360 / 608 / 856

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

// Every lane on this card is born hidden: STO.S-02 keeps a lane off screen until the step that runs it.
const lane = (key, points) => P.lane({ key, points, dashed: true, dim: true, opacity: 0 });

// The primitive centres the label on the raw bbox, which reads high because the top cap ellipse is not
// part of the visible front face. Re-centre on the face, derived from the height.
const disk = (key, cx, label) => P.cylinder({ key, x: cx - CYL_W / 2, y: CYL_Y, w: CYL_W, h: CYL_H, label, labelY: CYL_H / 2 + 10 });

// List order IS append order, which is z-order: the backend frame, then the blocks and disks that
// stand inside it, then the reference, lanes and captions, then the chip strip, then the packet layer.
export const SCENE = {
  'aria-label': 'Volume Snapshots: the namespaced VolumeSnapshot snap-1 and the cluster-scoped VolumeSnapshotContent the snapshot controller binds to it, the external-snapshotter that calls CreateSnapshot on the driver, and three disks inside one storage backend frame, the source, the snapshot beside it and a restore seeded from it, so a snapshot is not a backup',
  parts: [
    P.defs(),
    P.node({ key: 'frame', x: FRAME_X, y: FRAME_Y, w: FRAME_W, h: FRAME_H, label: 'Storage backend' }),
    P.box({ key: 'req', x: REQ_X, y: REQ_Y, w: REQ_W, h: REQ_H, label: 'VolumeSnapshot snap-1', sublabel: 'volumeSnapshotClassName: ebs-snapclass' }),
    P.box({ key: 'restore', x: RST_X, y: REQ_Y, w: RST_W, h: REQ_H, label: 'PVC restore-1', sublabel: 'dataSource: snap-1', opacity: 0 }),
    // One per cluster and shipped independently of any driver, which is exactly why it is a separate
    // block from the sidecar rather than folded into it.
    P.box({ key: 'ctrl', x: CTRL_CX - MID_W / 2, y: MID_Y, w: MID_W, h: MID_H, label: 'Snapshot-controller', sublabel: 'one per cluster' }),
    P.box({ key: 'vsc', x: VSC_CX - MID_W / 2, y: MID_Y, w: MID_W, h: MID_H, label: 'VolumeSnapshotContent', sublabel: 'cluster-scoped', opacity: 0 }),
    // The sidecar rides beside the driver named by the class, which is what the sublabel states.
    P.box({ key: 'snapper', x: SNAP_CX - MID_W / 2, y: MID_Y, w: MID_W, h: MID_H, label: 'External-snapshotter', sublabel: 'driver: ebs.csi.aws.com' }),
    disk('src', SRC_CX, 'Source Volume'),
    disk('snapData', SNAPDATA_CX, 'Snapshot Data'),
    disk('restored', RESTORED_CX, 'Restored Volume'),
    // dataSource: the restore claim references the snapshot. Also a relationship, so no arrowhead.
    P.relation({ key: 'dsRef', points: [[REQ_RIGHT, REQ_MY], [RST_X, REQ_MY]], dash: '5 5', opacity: 0 }),
    lane('wReqCtrl', W_REQ_CTRL),
    lane('wCtrlVsc', W_CTRL_VSC),
    lane('wVscSnap', W_VSC_SNAP),
    lane('wCreate', W_CREATE),
    lane('wAck', W_ACK),
    lane('wSnapVsc', W_SNAP_VSC),
    lane('wVscReq', W_VSC_REQ),
    lane('wCopy', W_COPY),
    lane('wSeed', W_SEED),
    P.wire({ key: 'srcCap', x: SRC_CX, y: CAPTION_Y }),
    P.wire({ key: 'snapCap', x: SNAPDATA_CX, y: CAPTION_Y }),
    P.wire({ key: 'restoredCap', x: RESTORED_CX, y: CAPTION_Y }),
    // Every one of these is a real field except the last, which is the point of the card rather than a
    // status: 'Content' is status.boundVolumeSnapshotContentName, whose full name is too long to print.
    P.chip({ key: 'contChip', x: CHIPS.x(0), y: CHIPS_Y, w: CHIP_W, h: STO.CHIP_H, name: 'Content', value: 'none' }),
    P.chip({ key: 'handChip', x: CHIPS.x(1), y: CHIPS_Y, w: CHIP_W, h: STO.CHIP_H, name: 'snapshotHandle', value: 'none' }),
    P.chip({ key: 'readyChip', x: CHIPS.x(2), y: CHIPS_Y, w: CHIP_W, h: STO.CHIP_H, name: 'readyToUse', value: 'false' }),
    P.chip({ key: 'storeChip', x: CHIPS.x(3), y: CHIPS_Y, w: CHIP_W, h: STO.CHIP_H, name: 'stored', value: 'same system' }),
    P.packets(),
  ],
  reset: {
    keys: ['req', 'restore', 'ctrl', 'vsc', 'snapper', 'src', 'snapData', 'restored',
      'contChip', 'handChip', 'readyChip', 'storeChip'],
  },
};


// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a card
// comes to report readyToUse true on the step that is still taking the snapshot.
const chips = (cont, hand, ready, store) => ({ contChip: cont, handChip: hand, readyChip: ready, storeChip: store });

// STO.S-01 as a field: every element born mid-story, and every lane, is pinned on EVERY step, never
// inherited, because the reduced replay walks 0..n and clearHighlights clears classes not inline styles.
const LANES = ['wReqCtrl', 'wCtrlVsc', 'wVscSnap', 'wCreate', 'wAck', 'wSnapVsc', 'wVscReq', 'wCopy', 'wSeed'];
const stage = ({ vsc = OPACITY.pending, restore = 0, snapData = OPACITY.pending, restored = OPACITY.pending, ds = 0, lanes = [] } = {}) => ({
  vsc, restore, snapData, restored, dsRef: ds,
  ...Object.fromEntries(LANES.map(k => [k, lanes.includes(k) ? 1 : 0])),
});

const BOUND_SUB = 'bound to snapcontent-9f2';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('none', 'none', 'false', 'same system'),
    sublabels: { req: 'volumeSnapshotClassName: ebs-snapclass' },
    wires: { srcCap: 'claim data-1', snapCap: 'not taken yet' },
    opacity: stage(),
  },
  {
    id: 'class',
    duration: 2600,
    narration: 'The snapshot names a VolumeSnapshotClass, and that class carries the driver field naming the CSI plugin that knows how to take snapshots, plus a deletionPolicy of Delete or Retain that decides whether the real snapshot outlives the object. It is the same shape as a StorageClass one level up: the request states intent, the class states which driver carries it out.',
    chipsCued: chips('none', 'none', 'false', 'same system'),
    // No sublabel: this step inherits what the step before it left on the request box.
    wires: { srcCap: 'claim data-1', snapCap: 'not taken yet' },
    opacity: stage(),
    // Both ends of the class relationship light and hold: the request that names the class, and the
    // sidecar that rides beside the driver the class names. No blink: see the PULSE MODEL note.
    lit: ['req', 'snapper'],
  },
  {
    id: 'bind',
    // Two chained hops plus the bound link drawing itself in once both ends exist.
    duration: 4400,
    narration: 'The snapshot controller runs once per cluster, independent of any driver, and watches both kinds of object. It picks up the new request, creates a VolumeSnapshotContent for it and binds the two one to one. This cluster-scoped object is the counterpart of a PV, and it exists before any snapshot has been taken.',
    chipsCued: chips('snapcontent-9f2', 'none', 'false', 'same system'),
    sublabels: { req: BOUND_SUB },
    wires: { srcCap: 'claim data-1', snapCap: 'not taken yet' },
    opacity: stage({ vsc: 1, lanes: ['wReqCtrl', 'wCtrlVsc'] }),
    // The request is where the first ball departs from, so it is lit at entry. The controller and the
    // object it writes are receivers and earn their highlights on arrival.
    lit: ['req'],
    // The content exists by the END of this step, so visible is the static end-state and the animated
    // path starts it back on the pending shade the reveal below lifts.
    rewind: { opacity: { vsc: OPACITY.pending } },
    flow: [
      F.route({ points: W_REQ_CTRL, delay: BEAT.lead, name: 'watch' }),
      // Rides BELOW the ball: the request corridor at 157 clears every measured panel floor but a tag
      // above the ball would not, and the offset keeps it off the request box floor it leaves from.
      F.tag({ text: 'snap-1', points: W_REQ_CTRL, delay: BEAT.lead, dy: 22 }),
      F.light({ targets: ['ctrl'], at: 'watch' }),
      F.route({ points: W_CTRL_VSC, after: 'watch', name: 'write' }),
      F.tag({ text: 'create and bind', points: W_CTRL_VSC, after: 'watch' }),
      F.reveal({ target: 'vsc', from: OPACITY.pending, at: 'write' }),
      F.light({ targets: ['vsc'], at: 'write' }),
    ],
  },
  {
    id: 'create',
    duration: 5200,
    narration: 'Creating that content is what wakes the CSI snapshotter sidecar. It watches VolumeSnapshotContent objects and never the request itself, and it calls CreateSnapshot on the driver. The backend freezes a point in time copy beside the source, usually by reference rather than by duplicating every byte.',
    chipsCued: chips('snapcontent-9f2', 'creating', 'false', 'same system'),
    sublabels: { req: BOUND_SUB },
    wires: { srcCap: 'claim data-1', snapCap: 'point-in-time copy' },
    opacity: stage({ vsc: 1, snapData: 1, lanes: ['wVscSnap', 'wCreate', 'wCopy'] }),
    // The content is where the first ball departs from, so it is lit at entry.
    lit: ['vsc'],
    rewind: { opacity: { snapData: OPACITY.pending } },
    flow: [
      F.route({ points: W_VSC_SNAP, delay: BEAT.lead, name: 'wake' }),
      F.tag({ text: 'new content', points: W_VSC_SNAP, delay: BEAT.lead }),
      F.light({ targets: ['snapper'], at: 'wake' }),
      F.route({ points: W_CREATE, after: 'wake', name: 'call' }),
      F.tag({ text: 'CreateSnapshot', points: W_CREATE, after: 'wake' }),
      F.reveal({ target: 'snapData', from: OPACITY.pending, at: 'call' }),
      // The copy itself: the point in time frozen out of the source into the new snapshot, which is the
      // whole reason both disks sit inside one backend frame.
      F.route({ points: W_COPY, at: 'call', plus: REVEAL_MS, name: 'copy' }),
      F.light({ targets: ['src'], at: 'call', plus: REVEAL_MS }),
      F.light({ targets: ['snapData'], at: 'copy' }),
    ],
  },
  {
    id: 'ready',
    // Three chained hops back up the chain: driver to sidecar, sidecar to content, content to request.
    duration: 5000,
    narration: 'A snapshot handle comes back from the driver. The sidecar writes it into the content status and flips readyToUse to true, and the controller mirrors that status up onto snap-1, which can now be consumed. Note where the data sits: on the same storage system as the source, right beside it. If that system fails both are lost, so a snapshot is not a backup.',
    chipsCued: chips('snapcontent-9f2', 'snap-0c41', 'true', 'not a backup'),
    sublabels: { req: BOUND_SUB },
    wires: { srcCap: 'same system', snapCap: 'same system' },
    opacity: stage({ vsc: 1, snapData: 1, lanes: ['wAck', 'wSnapVsc', 'wVscReq'] }),
    lit: ['snapData', 'ctrl'],
    flow: [
      F.route({ points: W_ACK, delay: BEAT.lead, name: 'ack' }),
      F.tag({ text: 'snapshotHandle', points: W_ACK, delay: BEAT.lead }),
      F.light({ targets: ['snapper'], at: 'ack' }),
      F.route({ points: W_SNAP_VSC, after: 'ack', name: 'status' }),
      F.tag({ text: 'readyToUse true', points: W_SNAP_VSC, after: 'ack' }),
      F.light({ targets: ['vsc'], at: 'status' }),
      F.route({ points: W_VSC_REQ, after: 'status', name: 'mirror' }),
      // Rides BELOW the ball: this hop ends ON the request box bottom edge, and above the ball the tag
      // would print across the box sublabel.
      F.tag({ text: 'status mirrored', points: W_VSC_REQ, after: 'status', dy: 22 }),
      F.light({ targets: ['req'], at: 'mirror' }),
    ],
  },
  {
    id: 'restore',
    duration: 3600,
    narration: 'To restore, create a brand new PVC whose dataSource names snap-1. That claim resolves through the bound content, and provisioning asks the driver for a fresh volume seeded from the snapshot. The original is untouched, the restore is a separate independent disk, and all three of them still sit in the same backend.',
    chipsCued: chips('snapcontent-9f2', 'snap-0c41', 'true', 'not a backup'),
    sublabels: { req: BOUND_SUB },
    wires: { srcCap: 'untouched', snapCap: 'seeds the restore', restoredCap: 'independent disk' },
    opacity: stage({ vsc: 1, snapData: 1, restored: 1, restore: 1, ds: 1, lanes: ['wSeed'] }),
    // The snapshot data is where the ball departs from, so it is lit at step entry.
    lit: ['snapData'],
    rewind: { opacity: { restore: 0, restored: OPACITY.pending, dsRef: 0 } },
    // The claim and its dataSource reference appear first: they are what triggers everything below.
    flow: [
      F.reveal({ target: 'restore' }),
      F.fade({ target: 'dsRef', from: 0, to: 1, dur: FADE.in, delay: REVEAL_MS, fill: 'forwards', easing: 'ease-out' }),
      F.light({ targets: ['restore'], delay: REVEAL_MS }),
      F.route({ points: W_SEED, delay: BEAT.lead + REVEAL_MS, name: 'seed' }),
      F.tag({ text: 'new volume from snap-1', points: W_SEED, delay: BEAT.lead + REVEAL_MS }),
      F.reveal({ target: 'restored', from: OPACITY.pending, at: 'seed' }),
      F.light({ targets: ['restored'], at: 'seed' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
