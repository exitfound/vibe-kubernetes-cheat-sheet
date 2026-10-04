import { P, F, defineCard, STO, BEAT, FADE, OPACITY, REVEAL_MS, makeRidingLabel } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-pvc-clone.md


// Two spec columns mirrored about CX, the source left and the clone right, with the fit test standing
// between them on the axis. The provisioner sits on the axis above the test because it runs it.
const CX = 600;
const SPREAD = 280;
const SRC_CX = CX - SPREAD, CLONE_CX = CX + SPREAD;                     // 320 / 880

// The catalog actor block, 232 by 80 (NET.L-01).
const PROV_W = 232, PROV_H = 80, PROV_X = CX - PROV_W / 2, PROV_Y = 36;  // 484..716
const PROV_BOTTOM = PROV_Y + PROV_H, PROV_MY = PROV_Y + PROV_H / 2;     // 116 / 76

// Each column head is a claim, so it is the catalog actor block too. The row starts 15 under the
// deepest panel reading, 205.0 at 1100x800.
const COL_W = 232, HEAD_H = 80, HEAD_Y = 220;
const HEAD_BOTTOM = HEAD_Y + HEAD_H;                                    // 300

// Five field rows, each one level with the gate that compares it. The gate column is as wide as the
// provisioner above it, so the test reads as the provisioner's own column.
// Chips and gates are the family chip height, STO.CHIP_H 34.
const ROW_H = STO.CHIP_H, ROW_PITCH = 40, ROW_Y0 = HEAD_BOTTOM + 12;    // 312
const ROW_Y = [0, 1, 2, 3, 4].map(i => ROW_Y0 + i * ROW_PITCH);         // 312 .. 472
const ROWS_BOTTOM = ROW_Y[4] + ROW_H;                                   // 506
const GATE_W = PROV_W, GATE_X = CX - GATE_W / 2;                        // 484..716

// The backend frame spans the width so its label clears the source disk, and the disks hang under
// their own columns. The frame is sized from the disk: one inset above and below.
const FRAME_X = 60, FRAME_W = 1080, FRAME_Y = 544;
const DISK_W = 200, DISK_H = 60, FRAME_INSET = 13;
const FRAME_H = DISK_H + FRAME_INSET * 2;                               // 86, so 544..630
const DISK_Y = FRAME_Y + FRAME_INSET, DISK_MY = DISK_Y + DISK_H / 2;    // 557 / 587

// Each static wire and its ball share ONE points array. Every endpoint is a block face midpoint.
const W_REQ = [[CLONE_CX, HEAD_Y], [CLONE_CX, PROV_MY], [PROV_X + PROV_W, PROV_MY]];
const W_CHECK = [[CX, PROV_BOTTOM], [CX, ROW_Y0]];
const W_CALL = [[CX, ROWS_BOTTOM], [CX, FRAME_Y]];
const W_COPY = [[SRC_CX + DISK_W / 2, DISK_MY], [CLONE_CX - DISK_W / 2, DISK_MY]];

// The request tag rides right of its lane and above its ball, clear of the clone head at departure
// and of the provisioner right face on arrival. The check tag leaves the provisioner floor, so it
// fades in once clear of it, and stops above the first gate.
const tagFn = makeRidingLabel({ role: 'storage', inMs: 200, outMs: 200, hold: 0 });
const REQ_TAG = { fn: tagFn, dx: 90, dy: -12 };
const CHECK_TAG = { fn: makeRidingLabel({ role: 'storage', emergeMode: true }), emerge: 200, dx: 64, dy: -14 };
// When the gates light: one row at a time, down the column, from the arrival of the check.
const SCAN_MS = 450;

// The rows, in the order the narration reads them: name, source value, clone value, and the gate.
const ROWS = [
  { key: 'Ns', name: 'namespace', gate: 'Same namespace' },
  { key: 'Phase', name: 'phase', gate: 'Source Bound, not in use' },
  { key: 'Mode', name: 'volumeMode', gate: 'Same volumeMode' },
  { key: 'Size', name: 'storage', gate: 'Size at least source' },
  { key: 'Class', name: 'storageClassName', gate: 'Class may differ, same driver' },
];
const SRC = { Ns: 'shop', Phase: 'Bound', Mode: 'Filesystem', Size: '10Gi', Class: 'rbd' };
const CLONE = { Ns: 'shop', Phase: 'Pending', Mode: 'Filesystem', Size: '20Gi', Class: 'rbd-retain' };
const GATES = ROWS.map((r, i) => `g${i}`);

const column = (side, cx, head, sub, values) => P.group({
  key: `${side}Col`,
  parts: [
    P.box({ key: `${side}Head`, x: cx - COL_W / 2, y: HEAD_Y, w: COL_W, h: HEAD_H, label: head, sublabel: sub }),
    ...ROWS.map((r, i) => P.chip({ key: `${side}${r.key}`, x: cx - COL_W / 2, y: ROW_Y[i], w: COL_W, h: ROW_H, name: r.name, value: values[r.key] })),
  ],
});

// The list order IS the append order, which is the z-order: the frame, the blocks, the two columns
// and the disks, then the relationships and lanes and their captions, then the packets.
export const SCENE = {
  'aria-label': 'Cloning a PVC: a new PersistentVolumeClaim clone-1 whose dataSource names the existing claim data-src is picked up by the external-provisioner, which holds it against its source row by row, the same namespace, the source Bound and not in use, the same volumeMode and at least the source size, while the StorageClass may differ if it names the same driver, then calls CreateVolume so the storage backend makes an exact duplicate server-side with no VolumeSnapshot object in between, after which clone-1 binds and keeps its copy when data-src is deleted',
  parts: [
    P.defs(),
    P.node({ key: 'frame', x: FRAME_X, y: FRAME_Y, w: FRAME_W, h: FRAME_H, label: 'Storage backend' }),
    P.box({ key: 'prov', x: PROV_X, y: PROV_Y, w: PROV_W, h: PROV_H, label: 'External-provisioner', sublabel: 'driver: rbd.csi.ceph.com' }),
    ...ROWS.map((r, i) => P.box({ key: GATES[i], x: GATE_X, y: ROW_Y[i], w: GATE_W, h: ROW_H, label: r.gate })),
    column('src', SRC_CX, 'PVC data-src', 'the source claim', SRC),
    column('clone', CLONE_CX, 'PVC clone-1', 'dataSource: data-src', CLONE),
    // The primitive centres the label on the raw bbox, which reads high under the cap (STO.L-02).
    P.cylinder({ key: 'srcDisk', x: SRC_CX - DISK_W / 2, y: DISK_Y, w: DISK_W, h: DISK_H, label: 'Source volume', labelY: DISK_H / 2 + 10 }),
    P.cylinder({ key: 'cloneDisk', x: CLONE_CX - DISK_W / 2, y: DISK_Y, w: DISK_W, h: DISK_H, label: 'Cloned volume', labelY: DISK_H / 2 + 10 }),
    // Each claim bound to its own volume: markerless and dashed, since nothing travels it. It stops on
    // the backend frame top face, the contour of the system holding the disk, and never crosses it.
    P.relation({ key: 'srcRel', d: `M ${SRC_CX} ${ROWS_BOTTOM} L ${SRC_CX} ${FRAME_Y}`, dash: '5 5' }),
    P.relation({ key: 'cloneRel', d: `M ${CLONE_CX} ${ROWS_BOTTOM} L ${CLONE_CX} ${FRAME_Y}`, dash: '5 5', opacity: 0 }),
    P.lane({ key: 'wReq', points: W_REQ, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wCheck', points: W_CHECK, dashed: true, dim: true }),
    P.lane({ key: 'wCall', points: W_CALL, dashed: true, dim: true }),
    P.lane({ key: 'wCopy', points: W_COPY, dashed: true, dim: true, opacity: 0 }),
    // The call hop is 38 long, too short for a tag to ride, so its name stands beside the lane,
    // centred in the gap between the last gate and the frame (+4 puts the ink centre on the midpoint).
    P.wire({ key: 'callCap', x: CX + 12, y: (ROWS_BOTTOM + FRAME_Y) / 2 + 4, anchor: 'start' }),
    P.wire({ key: 'copyCap', x: CX, y: DISK_MY - 10 }),
    P.packets(),
  ],
  reset: {
    keys: ['prov', ...GATES, 'srcHead', 'cloneHead', 'srcDisk', 'cloneDisk',
      ...ROWS.map(r => `src${r.key}`), ...ROWS.map(r => `clone${r.key}`)],
  },
};

// Every step writes EVERY chip (P-01): the one value that moves is the clone phase. A deleted claim
// has no phase to report, so the source keeps its last one, Bound, and the head sublabel says deleted.
const chips = (clonePhase) => {
  const out = {};
  for (const r of ROWS) {
    out[`src${r.key}`] = SRC[r.key];
    out[`clone${r.key}`] = r.key === 'Phase' ? clonePhase : CLONE[r.key];
  }
  return out;
};

// STO.S-01 as a field: both columns, both disks, both identity links and all four lanes are pinned on
// every step. A lane is full once both its ends exist, and 0 while either is only pending or gone.
const stage = ({ clone = OPACITY.pending, cloneDisk = OPACITY.pending, cloneRel = 0, src = 1 } = {}) => {
  const both = (a, b) => (a === 1 && b === 1 ? 1 : 0);
  return {
    srcCol: src, srcDisk: src, srcRel: src === 1 ? 1 : 0,
    cloneCol: clone, cloneDisk, cloneRel,
    wReq: both(clone, 1), wCheck: 1, wCall: 1, wCopy: both(src, cloneDisk),
  };
};

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('Pending'),
    sublabels: { srcHead: 'the source claim' },
    opacity: stage(),
  },
  {
    id: 'request',
    duration: 3200,
    narration: 'You create clone-1, an ordinary claim with one extra field: its dataSource names the existing claim data-src, of kind PersistentVolumeClaim. The external-provisioner for the driver picks the new claim up and reads that field as a clone request, not as a call for an empty volume.',
    chipsCued: chips('Pending'),
    sublabels: { srcHead: 'the source claim' },
    opacity: stage({ clone: 1 }),
    lit: ['cloneHead'],
    rewind: { opacity: stage() },
    flow: [
      F.reveal({ target: 'cloneCol', from: OPACITY.pending }),
      F.fade({ target: 'wReq', from: 0, to: 1, dur: REVEAL_MS, fill: 'forwards', easing: 'ease-out' }),
      F.route({ points: W_REQ, delay: BEAT.lead, name: 'req' }),
      F.tag({ text: 'dataSource: data-src', points: W_REQ, delay: BEAT.lead, ...REQ_TAG }),
      F.light({ targets: ['prov'], at: 'req' }),
    ],
  },
  {
    id: 'check',
    duration: 4400,
    narration: 'The new claim must fit its source row by row: the same namespace, as dataSource carries no namespace, the source Bound and not in use, the same volumeMode, and at least the source size. The class may differ but must name the same driver. A size, mode or driver misfit leaves clone-1 Pending.',
    chipsCued: chips('Pending'),
    sublabels: { srcHead: 'the source claim' },
    opacity: stage({ clone: 1 }),
    // The provisioner sends the check, so it is lit at entry. Each gate lights as the scan reaches it.
    lit: ['prov', 'srcHead', 'cloneHead'],
    flow: [
      F.route({ points: W_CHECK, delay: BEAT.lead, name: 'chk' }),
      F.tag({ text: 'fit test', points: W_CHECK, delay: BEAT.lead, ...CHECK_TAG }),
      ...GATES.map((k, i) => F.light({ targets: [k], at: 'chk', plus: i * SCAN_MS })),
    ],
  },
  {
    id: 'copy',
    duration: 4600,
    narration: 'Every row passes, so the provisioner calls CreateVolume on the driver with the source volume as its content. The storage system makes an exact duplicate of it, server-side. No VolumeSnapshot object is created on the way, and on Ceph RBD none of the data travels through the cluster.',
    chipsCued: chips('Pending'),
    sublabels: { srcHead: 'the source claim' },
    wires: { callCap: 'CreateVolume', copyCap: 'exact duplicate' },
    opacity: stage({ clone: 1, cloneDisk: 1 }),
    // The provisioner makes the call and the passed test is the state it starts from, so both are lit
    // at entry, and the call leaves the last gate.
    lit: ['prov', ...GATES],
    // The new volume is MADE on this step, so the animated path starts with it still pending, and
    // each caption is wound back blank until its exchange starts.
    rewind: { opacity: stage({ clone: 1 }), wires: { callCap: '', copyCap: '' } },
    flow: [
      F.route({ points: W_CALL, delay: BEAT.lead, name: 'call' }),
      F.set({ delay: BEAT.lead, wires: { callCap: 'CreateVolume' } }),
      F.reveal({ target: 'cloneDisk', from: OPACITY.pending, at: 'call', name: 'made' }),
      F.fade({ target: 'wCopy', from: 0, to: 1, dur: REVEAL_MS, fill: 'forwards', easing: 'ease-out', at: 'call' }),
      // The source is the SENDER of the copy, so it lights when the call lands, REVEAL_MS before its
      // ball leaves (M-18a).
      F.light({ targets: ['srcDisk'], at: 'call' }),
      F.route({ points: W_COPY, at: 'made', name: 'dup' }),
      F.set({ at: 'made', wires: { copyCap: 'exact duplicate' } }),
      F.light({ targets: ['cloneDisk'], at: 'dup' }),
    ],
  },
  {
    id: 'bound',
    duration: 2800,
    narration: 'A PV is created for the new volume and clone-1 binds to it, in its own StorageClass rbd-retain. From here it is an independent object: it can be used, snapshotted, cloned again or deleted without touching data-src.',
    chipsCued: chips('Bound'),
    sublabels: { srcHead: 'the source claim' },
    wires: { copyCap: 'exact duplicate' },
    opacity: stage({ clone: 1, cloneDisk: 1, cloneRel: 1 }),
    lit: ['cloneDisk'],
    rewind: { opacity: { cloneRel: 0 }, chips: { clonePhase: 'Pending' } },
    flow: [
      F.fade({ target: 'cloneRel', from: 0, to: 1, dur: FADE.in, delay: BEAT.lead, fill: 'forwards', easing: 'ease-out', name: 'rel' }),
      F.light({ targets: ['cloneHead'], at: 'rel' }),
      F.set({ at: 'rel', chipsCued: { clonePhase: 'Bound' } }),
    ],
  },
  {
    id: 'independent',
    duration: 3400,
    narration: 'Nothing links the two afterwards: dataSource only seeded the volume. Delete data-src, and since its class reclaims with Delete its volume goes too, yet clone-1 keeps its copy untouched. That is the line against a snapshot restore: no VolumeSnapshot stays between them to restore from again.',
    chipsCued: chips('Bound'),
    sublabels: { srcHead: 'deleted' },
    opacity: stage({ clone: 1, cloneDisk: 1, cloneRel: 1, src: OPACITY.terminated }),
    lit: ['cloneHead', 'cloneDisk'],
    rewind: {
      opacity: stage({ clone: 1, cloneDisk: 1, cloneRel: 1 }),
      sublabels: { srcHead: 'the source claim' },
      wires: { copyCap: 'exact duplicate' },
    },
    flow: [
      ...['srcCol', 'srcDisk'].map(target => F.fade({ target, to: OPACITY.terminated, dur: FADE.out, delay: BEAT.lead, fill: 'forwards' })),
      ...['srcRel', 'wCopy'].map(target => F.fade({ target, to: 0, dur: FADE.out, delay: BEAT.lead, fill: 'forwards' })),
      F.set({ delay: BEAT.lead, sublabels: { srcHead: 'deleted' }, wires: { copyCap: '' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
