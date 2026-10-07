import { P, F, defineCard, chipStrip, makeRidingLabel, BEAT, FADE, OPACITY, REVEAL_MS } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-volume-binding-mode.md


// Both zones mirror about CX. The StorageClass and the claim stack on CX because the card is about
// one claim resolving into one of two zones.
const CX = 600;

// Actor blocks at the catalog size (NET.L-01). The class sublabel carries the mode value alone,
// since the full field name does not fit a 232 box.
const BOX_W = 232, BOX_H = 80, TIER_GAP = 28;
const SC_W = BOX_W, SC_H = BOX_H, SC_X = CX - SC_W / 2, SC_Y = 36;
const SC_RIGHT = SC_X + SC_W, SC_MY = SC_Y + SC_H / 2, SC_BOTTOM = SC_Y + SC_H;

const PVC_W = BOX_W, PVC_H = BOX_H, PVC_Y = SC_BOTTOM + TIER_GAP;
const PVC_X = CX - PVC_W / 2;

// The external-provisioner stands level with the class it reads, the read a relation across the
// channel between them.
const PROV_GAP = 40;
const PROV_W = BOX_W, PROV_H = BOX_H, PROV_X = SC_RIGHT + PROV_GAP, PROV_Y = SC_Y;
const PROV_RIGHT = PROV_X + PROV_W, PROV_MY = PROV_Y + PROV_H / 2;

// The class sublabel and the claim annotation, read by the scene and by the steps.
const IMMEDIATE = 'Immediate';
const WFFC = 'WaitForFirstConsumer';
const SELECTED = 'selected-node: node-2';

// The catalog frame padding round the Pod, 34 over it and 12 under it, sets the row height, and
// node-1 shares it as the peer of node-2 in one row of frames.
const NODE_W = 430, NODE_GAP = 60, NODE_Y = PVC_Y + PVC_H + TIER_GAP, NODE_H = 34 + 104 + 12;
const NODE_BOTTOM = NODE_Y + NODE_H;
const SPREAD = (NODE_W + NODE_GAP) / 2;
const NODE_CX = [CX - SPREAD, CX + SPREAD];
const NODE_X = NODE_CX.map(cx => cx - NODE_W / 2);

const POD_W = 232, POD_H = 104;
const POD_Y = NODE_Y + 34;
const POD_X = NODE_CX[1] - POD_W / 2;
const APP_W = 192, APP_H = 44, APP_DY = 26;
// What already runs on node-1 and leaves it no room: an actor box, 34 under the frame top as the Pod is.
const BUSY_Y = NODE_Y + 34;

const DISK_W = 190, DISK_H = 90, DISK_Y = NODE_BOTTOM + 68;
const DISK_TOP = DISK_Y;
const DISK_MY = DISK_Y + DISK_H / 2;

const CROSS_Y = (NODE_BOTTOM + DISK_TOP) / 2;      // centred in the gap it crosses
const PROV_WRAP_X = 1120;                          // outer margin, right of node-2
const CAPTION_Y = DISK_TOP - 14, CAPTION_DX = 12;
const CHIPS_Y = 588;

const W_PROV_B = [[PROV_RIGHT, PROV_MY], [PROV_WRAP_X, PROV_MY], [PROV_WRAP_X, DISK_MY], [NODE_CX[1] + DISK_W / 2, DISK_MY]];
const W_PROV_A = [[PROV_RIGHT, PROV_MY], [PROV_WRAP_X, PROV_MY], [PROV_WRAP_X, DISK_MY], [NODE_CX[0] + DISK_W / 2, DISK_MY]];
const W_MOUNT_B = [[NODE_CX[1], DISK_TOP], [NODE_CX[1], NODE_BOTTOM]];
// The doomed reach: node-2 would have to cross into zone-a for its disk.
const W_CROSS = [[NODE_CX[1], NODE_BOTTOM], [NODE_CX[1], CROSS_Y], [NODE_CX[0], CROSS_Y], [NODE_CX[0], DISK_TOP]];

// Trails its ball so it lands under the Node-2 frame, clear of the Pod sublabel and the
// `Pod placed first` caption, and fades in once clear of the disk cap it starts inside.
const MOUNT_TAG_EMERGE = 300;
const MOUNT_TAG_DX = 62, MOUNT_TAG_DY = 16;
const mountLabel = makeRidingLabel({ role: 'storage', emergeMode: true });

const CHIP_W = 232, CHIP_GAP = 16;
const STRIP = chipStrip({ cx: CX, w: CHIP_W, gap: CHIP_GAP });

export const SCENE = {
  'aria-label': 'Immediate vs WaitForFirstConsumer volume binding: under Immediate binding a zonal disk is provisioned as soon as the claim exists, and here it lands in zone-a while Node-1 in zone-a has no room, so no Node both fits the Pod and lies in the disk zone and the Pod stays Pending unschedulable because Node-2 does not match the PersistentVolume node affinity, while WaitForFirstConsumer defers binding and provisioning until the Scheduler has chosen a Node for the Pod, so the volume is created in that Node topology',
  parts: [
    P.defs(),
    P.node({ key: 'nodeA', x: NODE_X[0], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'node-1' }),
    P.node({ key: 'nodeB', x: NODE_X[1], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'node-2' }),
    // node() carries no sublabel, so the zone shares the frame header line, right-anchored.
    P.tag({ x: NODE_X[0] + NODE_W - 12, y: NODE_Y + 18, anchor: 'end', text: 'zone-a' }),
    P.tag({ x: NODE_X[1] + NODE_W - 12, y: NODE_Y + 18, anchor: 'end', text: 'zone-b' }),
    P.box({ key: 'busyA', x: NODE_CX[0] - POD_W / 2, y: BUSY_Y, w: POD_W, h: BOX_H, label: 'Pods already here', sublabel: 'CPU fully requested' }),
    P.box({ key: 'sc', x: SC_X, y: SC_Y, w: SC_W, h: SC_H, label: 'StorageClass gp3', sublabel: IMMEDIATE }),
    P.box({ key: 'prov', x: PROV_X, y: PROV_Y, w: PROV_W, h: PROV_H, label: 'External-provisioner', sublabel: 'CSI controller sidecar' }),
    P.box({ key: 'pvc', x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-0', sublabel: 'Pending' }),
    // Re-centred on the front face (STO.L-02). Neither disk exists until provisioned.
    P.cylinder({ key: 'diskA', x: NODE_CX[0] - DISK_W / 2, y: DISK_Y, w: DISK_W, h: DISK_H, label: 'Disk zone-a', labelY: DISK_H / 2 + 10, opacity: 0 }),
    P.cylinder({ key: 'diskB', x: NODE_CX[1] - DISK_W / 2, y: DISK_Y, w: DISK_W, h: DISK_H, label: 'Disk zone-b', labelY: DISK_H / 2 + 10, opacity: 0 }),
    P.pod({
      key: 'podB', x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod app-0', sublabel: 'mounts /data', containers: 0, opacity: 0,
      inner: { dx: (POD_W - APP_W) / 2, dy: APP_DY, w: APP_W, h: APP_H, label: 'app', sublabel: 'read/write' }, innerKey: 'podBox',
    }),
    // The claim names its class: a relationship, not traffic, so a bare dashed path with no marker.
    P.relation({ points: [[CX, SC_BOTTOM], [CX, PVC_Y]], dash: '5 5' }),
    // The provisioner reads the class: a relationship, not traffic, so no ball and no marker either.
    P.relation({ points: [[SC_RIGHT, SC_MY], [PROV_X, PROV_MY]], dash: '5 5' }),
    P.lane({ key: 'wProvA', points: W_PROV_A, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wProvB', points: W_PROV_B, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wMountB', points: W_MOUNT_B, dashed: true, dim: true, opacity: 0 }),
    // The doomed cross-zone reach: a relationship rather than traffic, since the attach never succeeds.
    P.relation({ key: 'crossLink', points: W_CROSS, opacity: 0 }),
    P.wire({ key: 'fail', x: CX, y: CROSS_Y - 12 }),
    // Right-anchored 12 left of the lane that meets each disk top, so neither lane runs through its text.
    P.wire({ key: 'za', x: NODE_CX[0] - CAPTION_DX, y: CAPTION_Y, anchor: 'end' }),
    P.wire({ key: 'zb', x: NODE_CX[1] - CAPTION_DX, y: CAPTION_Y, anchor: 'end' }),
    P.chip({ key: 'modeChip', x: STRIP.x(0), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'mode',  value: 'Immediate' }),
    P.chip({ key: 'pvcChip',  x: STRIP.x(1), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'PVC',   value: 'Pending' }),
    P.chip({ key: 'podChip',  x: STRIP.x(2), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'Pod',   value: 'Pending' }),
    P.chip({ key: 'zoneChip', x: STRIP.x(3), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'zones', value: 'unset' }),
    P.packets(),
  ],
  reset: {
    keys: ['sc', 'prov', 'pvc', 'nodeA', 'nodeB', 'diskA', 'diskB', 'podBox',
      'modeChip', 'pvcChip', 'podChip', 'zoneChip'],
    pods: ['podB'],
  },
};

// Every step writes every chip, or a value from the previous step survives.
const chips = (mode, pvc, pod, zones) => ({ modeChip: mode, pvcChip: pvc, podChip: pod, zoneChip: zones });


// Pins every element born mid-story, so no step inherits a disk, Pod or lane from the one before
// it (STO.S-01).
const OFF = { diskA: 0, diskB: 0, podB: 0, crossLink: 0, nodeA: 1, busyA: 1, nodeB: 1, wProvA: 0, wProvB: 0, wMountB: 0 };
// The Scheduler rejects both Nodes, node-1 for room and node-2 for the zone, so both frames carry
// the filtered-out shade.
const STRANDED = {
  ...OFF, diskA: 1, podB: OPACITY.pending, crossLink: 1,
  nodeA: OPACITY.notready, busyA: OPACITY.notready, nodeB: OPACITY.notready,
};

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('Immediate', 'Pending', 'Pending', 'unset'),
    sublabels: { sc: IMMEDIATE, pvc: 'Pending' },
    opacity: OFF,
  },
  {
    id: 'imm-provision',
    // Longer than its siblings: the provisioning route wraps the outer margin.
    duration: 4400,
    narration: 'With Immediate the volume is provisioned the moment the claim appears, long before any Pod is scheduled. With no Pod to guide it, the provisioner just picks a zone. Here it lands in zone-a, and the claim is Bound to a disk that now physically lives in zone-a, reachable only by Node-1.',
    chipsCued: chips('Immediate', 'Bound', 'Pending', 'disk in zone-a'),
    wires: { za: 'provisioned here' },
    sublabels: { sc: IMMEDIATE, pvc: 'Bound' },
    opacity: { ...OFF, diskA: 1, wProvA: 1 },
    // The provisioner is the source, lit at entry. The disk lights on the ball's arrival.
    lit: ['prov'],
    // The disk is pinned full for the reduced path and wound back here so the reveal owns its opacity.
    // The claim binds, and the caption and zone chip turn over, only when the disk exists (P-03).
    rewind: {
      opacity: { diskA: OPACITY.pending }, sublabels: { pvc: 'Pending' }, wires: { za: '' },
      chips: { pvcChip: 'Pending', zoneChip: 'unset' },
    },
    // F.light comes before the reveal so the reveal fade owns the disk opacity.
    flow: [
      F.route({ points: W_PROV_A, delay: BEAT.lead, name: 'prov', tag: { text: 'CreateVolume' } }),
      F.light({ targets: ['diskA'], at: 'prov' }),
      F.reveal({ target: 'diskA', at: 'prov', from: OPACITY.pending }),
      F.set({ at: 'prov', chipsCued: { pvcChip: 'Bound', zoneChip: 'disk in zone-a' }, sublabels: { pvc: 'Bound' }, wires: { za: 'provisioned here' } }),
    ],
  },
  {
    id: 'imm-schedule',
    duration: 3500,
    narration: 'Only now is the Pod created, and it has to be placed around a disk that already lives in zone-a. This Pod fits Node-2 in zone-b on capacity and affinity, but a zone-a disk cannot attach to a Node in zone-b. Volume topology is read during scheduling, so Node-2 is rejected, while Node-1 in zone-a has no room for the Pod.',
    chipsCued: chips('Immediate', 'Bound', 'Pending', 'no node fits'),
    wires: { za: 'disk in zone-a', fail: 'wrong zone for this disk' },
    sublabels: { sc: IMMEDIATE, pvc: 'Bound' },
    opacity: STRANDED,
    lit: ['diskA'],
    // The Pod is created but never admitted, so it arrives at its dim Pending opacity.
    rewind: { opacity: { podB: 0 } },
    flow: [
      F.fade({ target: 'podB', from: 0, to: OPACITY.pending, dur: FADE.in, delay: BEAT.afterHop, fill: 'forwards', easing: 'ease-out' }),
    ],
  },
  {
    id: 'imm-fail',
    duration: 3600,
    narration: 'No Node satisfies both the Pod and its zone-a disk, so the Pod is not scheduled. It stays Pending until a zone-a Node has room, and its FailedScheduling event reports one Node short of CPU and one that did not match the PersistentVolume node affinity. This is a common multi-zone failure, and its one-line fix is next.',
    chipsCued: chips('Immediate', 'Bound', 'unschedulable', 'zone-a vs zone-b'),
    wires: { za: 'healthy but stranded', fail: 'no match for PV node affinity' },
    sublabels: { sc: IMMEDIATE, pvc: 'Bound' },
    opacity: STRANDED,
    lit: ['diskA'],
    flow: [
      F.pulse({ pod: 'podB', dim: true, delay: BEAT.lead, from: OPACITY.pending, peak: 0.95 }),
    ],
  },
  {
    id: 'wffc-schedule',
    duration: 3200,
    narration: 'Set volumeBindingMode to WaitForFirstConsumer and start over. Binding is now deferred, so the claim stays Pending on purpose while no disk exists yet. The Scheduler picks Node-2 in zone-b for the Pod first and records that choice on the claim, then holds the Pod until its volume is bound.',
    chipsCued: chips('WaitForFirstConsumer', 'Pending, waiting', 'node-2 zone-b', 'Pod zone-b'),
    wires: { zb: 'Pod placed first' },
    sublabels: { sc: WFFC, pvc: SELECTED },
    opacity: { ...OFF, podB: OPACITY.pending },
    lit: ['sc'],
    rewind: { opacity: { podB: 0 }, sublabels: { pvc: 'Pending' } },
    // The Pod is placed, THEN the choice lands on the claim as its selected-node annotation.
    flow: [
      F.fade({ target: 'podB', from: 0, to: OPACITY.pending, dur: FADE.in, delay: BEAT.afterHop, fill: 'forwards', easing: 'ease-out', name: 'placed' }),
      F.set({ at: 'placed', plus: BEAT.afterHop, sublabels: { pvc: SELECTED } }),
      F.light({ targets: ['pvc'], at: 'placed', plus: BEAT.afterHop }),
    ],
  },
  {
    id: 'wffc-provision',
    duration: 5200,
    narration: 'Now that a Node is chosen, the zone to build in is no longer a guess. The volume is created in zone-b and bound to the claim, the Pod is bound to Node-2, and the disk is attached there. The Pod mounts it and starts, because the order was reversed so the disk could follow the Pod.',
    chipsCued: chips('WaitForFirstConsumer', 'Bound', 'Running', 'both zone-b'),
    wires: { zb: 'provisioned in topology' },
    sublabels: { sc: WFFC, pvc: 'Bound' },
    opacity: { ...OFF, diskB: 1, podB: 1, wProvB: 1, wMountB: 1 },
    lit: ['prov'],
    // Bound and the zones chip wait for the disk, Running waits for the mount (P-03).
    rewind: {
      opacity: { diskB: OPACITY.pending, podB: OPACITY.pending },
      sublabels: { pvc: SELECTED }, wires: { zb: 'Pod placed first' },
      chips: { pvcChip: 'Pending, waiting', podChip: 'node-2 zone-b', zoneChip: 'Pod zone-b' },
    },
    // The disk lights on the ball's arrival. Then a down-arrow into the Pod: the ball leads and the
    // pulse lands on its arrival.
    flow: [
      F.route({ points: W_PROV_B, delay: BEAT.lead, name: 'prov', tag: { text: 'CreateVolume' } }),
      F.light({ targets: ['diskB'], at: 'prov' }),
      F.reveal({ target: 'diskB', at: 'prov', from: OPACITY.pending }),
      F.set({ at: 'prov', chipsCued: { pvcChip: 'Bound', zoneChip: 'both zone-b' }, sublabels: { pvc: 'Bound' }, wires: { zb: 'provisioned in topology' } }),
      F.route({ points: W_MOUNT_B, after: 'prov', plus: REVEAL_MS, name: 'mount' }),
      F.tag({ text: 'attach and mount', points: W_MOUNT_B, after: 'prov', plus: REVEAL_MS, fn: mountLabel, emerge: MOUNT_TAG_EMERGE, dx: MOUNT_TAG_DX, dy: MOUNT_TAG_DY }),
      F.fade({ target: 'podB', from: OPACITY.pending, to: 1, dur: FADE.in, at: 'mount', fill: 'forwards', easing: 'ease-out' }),
      F.pulse({ pod: 'podB', at: 'mount' }),
      F.light({ targets: ['podBox'], at: 'mount' }),
      F.set({ at: 'mount', chipsCued: { podChip: 'Running' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
