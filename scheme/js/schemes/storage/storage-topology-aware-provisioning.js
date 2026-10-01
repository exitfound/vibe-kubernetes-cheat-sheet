import { P, F, defineCard, chipStrip, makeRidingLabel, BEAT, FADE, OPACITY, REVEAL_MS } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-topology-aware-provisioning.md


// NODE_CX is CX -/+ SPREAD, derived from the node width and the gap rather than typed, so the two
// zones stay mirrored. The StorageClass and the claim stack on CX because the card is about ONE
// claim resolving into ONE of two zones.
const CX = 600;

// Every actor block is 232 by 80 (NET.L-01). The class sublabel carries the mode VALUE alone:
// `volumeBindingMode: WaitForFirstConsumer` inks 239.2, more than a 232 box holds.
const BOX_W = 232, BOX_H = 80, TIER_GAP = 28;
const SC_W = BOX_W, SC_H = BOX_H, SC_X = CX - SC_W / 2, SC_Y = 36;                // 484
const SC_RIGHT = SC_X + SC_W, SC_MY = SC_Y + SC_H / 2, SC_BOTTOM = SC_Y + SC_H;   // 716 / 76 / 116

const PVC_W = BOX_W, PVC_H = BOX_H, PVC_Y = SC_BOTTOM + TIER_GAP;                    // 144
const PVC_X = CX - PVC_W / 2;  // 484

// The class sublabel and the claim annotation, read by the scene and by the steps.
const IMMEDIATE = 'Immediate';
const WFFC = 'WaitForFirstConsumer';
const SELECTED = 'selected-node: node-2';

const NODE_W = 430, NODE_GAP = 60, NODE_Y = PVC_Y + PVC_H + TIER_GAP, NODE_H = 140;   // 252
const NODE_BOTTOM = NODE_Y + NODE_H;                                               // 392
const SPREAD = (NODE_W + NODE_GAP) / 2;                                            // 245
const NODE_CX = [CX - SPREAD, CX + SPREAD];                                        // 355 / 845
const NODE_X = NODE_CX.map(cx => cx - NODE_W / 2);                                 // 140 / 630

const POD_W = 232, POD_H = 104;
const POD_Y = NODE_Y + (NODE_H - POD_H) / 2;                                       // 270
const POD_X = NODE_CX[1] - POD_W / 2;                                              // 729
const APP_W = 192, APP_H = 44, APP_DY = 26;         // 26 under the Pod label, as network-gateway-api
// What already runs on node-1 and leaves it no room: an actor box, centred in the frame as the Pod is.
const BUSY_Y = NODE_Y + (NODE_H - BOX_H) / 2;                                      // 282

const DISK_W = 190, DISK_H = 90, DISK_Y = NODE_BOTTOM + 68;                         // 460
const DISK_TOP = DISK_Y;                                                           // 460
const DISK_MY = DISK_Y + DISK_H / 2;                                               // 505

const CROSS_Y = (NODE_BOTTOM + DISK_TOP) / 2;      // 426, centred in the gap it crosses
const PROV_WRAP_X = 1120;                          // outer margin, right of node-2 (ends 1060)
const CAPTION_Y = DISK_TOP - 14, CAPTION_DX = 12;
const CHIPS_Y = 588;

const W_PROV_B = [[SC_RIGHT, SC_MY], [PROV_WRAP_X, SC_MY], [PROV_WRAP_X, DISK_MY], [NODE_CX[1] + DISK_W / 2, DISK_MY]];
const W_PROV_A = [[SC_RIGHT, SC_MY], [PROV_WRAP_X, SC_MY], [PROV_WRAP_X, DISK_MY], [NODE_CX[0] + DISK_W / 2, DISK_MY]];
const W_MOUNT_B = [[NODE_CX[1], DISK_TOP], [NODE_CX[1], NODE_BOTTOM]];
// The doomed reach: node-2 would have to cross into zone-a for its disk. It leaves the node-2 frame
// bottom centre and enters the zone-a disk through its top centre.
const W_CROSS = [[NODE_CX[1], NODE_BOTTOM], [NODE_CX[1], CROSS_Y], [NODE_CX[0], CROSS_Y], [NODE_CX[0], DISK_TOP]];

// The mount tag starts ON the zone-b caption, which sits 14 above the disk exactly where the tag
// rides: it fades in 300ms into the flight instead, 40 units clear of it. See ./CARDS/storage-topology-aware-provisioning.md.
const MOUNT_TAG_EMERGE = 300;
const mountLabel = makeRidingLabel({ role: 'storage', emergeMode: true });

// Family width. Worst case `mode` + `WaitForFirstConsumer` at 189 against 232.
const CHIP_W = 232, CHIP_GAP = 16;
const STRIP = chipStrip({ cx: CX, w: CHIP_W, gap: CHIP_GAP });   // 112 / 360 / 608 / 856, centred on CX

// List order IS append order, which is z-order: node frames and their zone captions, the class and
// the claim, the disks, the Pod, then lanes and captions, then the chip strip, then the packet layer.
export const SCENE = {
  'aria-label': 'Topology-aware provisioning with WaitForFirstConsumer: under Immediate binding a zonal disk is provisioned as soon as the claim exists, and here it lands in zone-a while Node-1 in zone-a has no room, so no Node both fits the Pod and lies in the disk zone and the Pod stays Pending unschedulable because Node-2 does not match the PersistentVolume node affinity, while WaitForFirstConsumer defers binding and provisioning until the Scheduler has chosen a Node for the Pod, so the volume is created in that Node topology',
  parts: [
    P.defs(),
    P.node({ key: 'nodeA', x: NODE_X[0], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'node-1' }),
    P.node({ key: 'nodeB', x: NODE_X[1], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'node-2' }),
    // node() carries no sublabel, so the zone shares the frame header line, right-anchored.
    P.tag({ x: NODE_X[0] + NODE_W - 12, y: NODE_Y + 18, anchor: 'end', text: 'zone-a' }),
    P.tag({ x: NODE_X[1] + NODE_W - 12, y: NODE_Y + 18, anchor: 'end', text: 'zone-b' }),
    P.box({ key: 'busyA', x: NODE_CX[0] - POD_W / 2, y: BUSY_Y, w: POD_W, h: BOX_H, label: 'Pods already here', sublabel: 'CPU fully requested' }),
    P.box({ key: 'sc', x: SC_X, y: SC_Y, w: SC_W, h: SC_H, label: 'StorageClass gp3', sublabel: IMMEDIATE }),
    P.box({ key: 'pvc', x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-0', sublabel: 'Pending' }),
    // labelY re-centres on the visible front face: the raw bbox includes the top cap ellipse, so the
    // default label reads high. Neither disk exists until provisioned, so both start at zero.
    P.cylinder({ key: 'diskA', x: NODE_CX[0] - DISK_W / 2, y: DISK_Y, w: DISK_W, h: DISK_H, label: 'Disk zone-a', labelY: DISK_H / 2 + 10, opacity: 0 }),
    P.cylinder({ key: 'diskB', x: NODE_CX[1] - DISK_W / 2, y: DISK_Y, w: DISK_W, h: DISK_H, label: 'Disk zone-b', labelY: DISK_H / 2 + 10, opacity: 0 }),
    P.pod({
      key: 'podB', x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod app-0', sublabel: 'mounts /data', containers: 0, opacity: 0,
      inner: { dx: (POD_W - APP_W) / 2, dy: APP_DY, w: APP_W, h: APP_H, label: 'app', sublabel: 'read/write' }, innerKey: 'podBox',
    }),
    // The claim names its class: a relationship, not traffic, so a bare dashed path with no marker.
    P.relation({ points: [[CX, SC_BOTTOM], [CX, PVC_Y]], dash: '5 5' }),
    P.lane({ key: 'wProvA', points: W_PROV_A, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wProvB', points: W_PROV_B, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wMountB', points: W_MOUNT_B, dashed: true, dim: true, opacity: 0 }),
    // The doomed cross-zone reach: the Pod aims at its stranded disk, entering the zone-a disk dead
    // centre on its top edge. A relationship rather than traffic, since the attach never succeeds.
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
    keys: ['sc', 'pvc', 'nodeA', 'nodeB', 'diskA', 'diskB', 'podBox',
      'modeChip', 'pvcChip', 'podChip', 'zoneChip'],
    pods: ['podB'],
  },
};

// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a card
// comes to display the old binding mode on the step that just changed it.
const chips = (mode, pvc, pod, zones) => ({ modeChip: mode, pvcChip: pvc, podChip: pod, zoneChip: zones });


// Pins the visibility of EVERY element that is born mid-story, exactly as `chips` pins every chip,
// so a step can never silently inherit a disk, a Pod or a lane from the step before it (STO.S-01).
const OFF = { diskA: 0, diskB: 0, podB: 0, crossLink: 0, nodeA: 1, busyA: 1, nodeB: 1, wProvA: 0, wProvB: 0, wMountB: 0 };
// The scheduler rejects BOTH (node-1 for room, node-2 for the zone), so both frames carry the
// filtered-out shade: it is also what separates these steps from the wffc one. See ./CARDS/storage-topology-aware-provisioning.md.
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
    // 4400, not 3600: the provisioning route wraps the outer margin and runs the shelf midline into
    // the zone-a disk from the right, which measures out at a 3960ms span (ball plus its ripple).
    duration: 4400,
    narration: 'With Immediate the volume is provisioned the moment the claim appears, long before any Pod is scheduled. With no Pod to guide it, provisioning just picks a zone. Here it lands in zone-a, and the claim is Bound to a disk that now physically lives in zone-a, reachable only by Node-1.',
    chipsCued: chips('Immediate', 'Bound', 'Pending', 'disk in zone-a'),
    wires: { za: 'provisioned here' },
    sublabels: { sc: IMMEDIATE, pvc: 'Bound' },
    opacity: { ...OFF, diskA: 1, wProvA: 1 },
    // The class is where the ball departs from, so it is lit at step entry. The disk is the receiver
    // and earns its highlight only once the CreateVolume ball reaches it, not before.
    lit: ['sc'],
    // The disk is pinned full above for the reduced path, and wound back to its unprovisioned rest
    // here so the reveal fade owns its opacity on the animated one.
    // The claim binds, and the caption and zone chip turn over, only when the disk exists (P-03).
    rewind: {
      opacity: { diskA: OPACITY.pending }, sublabels: { pvc: 'Pending' }, wires: { za: '' },
      chips: { pvcChip: 'Pending', zoneChip: 'unset' },
    },
    // F.light is registered before the reveal so the reveal fade owns the disk opacity, and the
    // highlight class lands exactly on the ball's arrival.
    flow: [
      F.route({ points: W_PROV_A, delay: BEAT.lead, name: 'prov' }),
      F.tag({ text: 'CreateVolume', points: W_PROV_A, delay: BEAT.lead }),
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
    lit: ['sc', 'nodeB'],
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
    duration: 5800,
    narration: 'Now that a Node is chosen, the zone to build in is no longer a guess. The volume is created in zone-b and bound to the claim, the Pod is bound to Node-2, and the disk is attached there. The Pod mounts it and starts, because the order was reversed so the disk could follow the Pod.',
    chipsCued: chips('WaitForFirstConsumer', 'Bound', 'Running', 'both zone-b'),
    wires: { zb: 'provisioned in topology' },
    sublabels: { sc: WFFC, pvc: 'Bound' },
    opacity: { ...OFF, diskB: 1, podB: 1, wProvB: 1, wMountB: 1 },
    lit: ['sc', 'nodeB'],
    // Bound and the zones chip wait for the disk, Running waits for the mount (P-03).
    rewind: {
      opacity: { diskB: OPACITY.pending, podB: OPACITY.pending },
      sublabels: { pvc: SELECTED }, wires: { zb: 'Pod placed first' },
      chips: { pvcChip: 'Pending, waiting', podChip: 'node-2 zone-b', zoneChip: 'Pod zone-b' },
    },
    // The disk earns its highlight on the ball's arrival, not at step entry. Then a down-arrow into
    // the Pod, so the ball leads and the pulse lands on its arrival.
    flow: [
      F.route({ points: W_PROV_B, delay: BEAT.lead, name: 'prov' }),
      F.tag({ text: 'CreateVolume', points: W_PROV_B, delay: BEAT.lead }),
      F.light({ targets: ['diskB'], at: 'prov' }),
      F.reveal({ target: 'diskB', at: 'prov', from: OPACITY.pending }),
      F.set({ at: 'prov', chipsCued: { pvcChip: 'Bound', zoneChip: 'both zone-b' }, sublabels: { pvc: 'Bound' }, wires: { zb: 'provisioned in topology' } }),
      F.route({ points: W_MOUNT_B, after: 'prov', plus: REVEAL_MS, name: 'mount' }),
      F.tag({ text: 'attach and mount', points: W_MOUNT_B, after: 'prov', plus: REVEAL_MS, fn: mountLabel, emerge: MOUNT_TAG_EMERGE }),
      F.fade({ target: 'podB', from: OPACITY.pending, to: 1, dur: FADE.in, at: 'mount', fill: 'forwards', easing: 'ease-out' }),
      F.pulse({ pod: 'podB', at: 'mount' }),
      F.light({ targets: ['podBox'], at: 'mount' }),
      F.set({ at: 'mount', chipsCued: { podChip: 'Running' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
