import { P, F, defineCard, BEAT, OPACITY, makeRidingLabel } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-volumeattachment.md


// One margin both sides, so CONTENT_L / CONTENT_R and CX fall out of it. LEFT_X is a separate wall at
// 400 that only the TOP band obeys: the usable area is an L and the disk lives in its free
// bottom-left corner.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140, midpoint 600

// Every solid block on the card is ONE size, the catalog actor block (NET.L-01), and the Pod is the
// catalog Pod, 232 by 104 around a 192 by 44 app box.
const BOX_W = 232, BOX_H = 80;

const LEFT_X = 400;
const NODE_W = 300;
const COL_L_X = LEFT_X;                                  // 400..700, the node frame
const COL_L_CX = COL_L_X + NODE_W / 2;                   // 550
const COL_R_X = CONTENT_R - BOX_W;                       // 908..1140, the control-plane column
const COL_R_CX = COL_R_X + BOX_W / 2;                    // 1024
const CORRIDOR_X = (COL_L_X + NODE_W + COL_R_X) / 2;     // 804: the one lane that crosses the columns

const NODE_Y = 24, NODE_H = 396;                         // 24..420
const NODE_RIGHT = COL_L_X + NODE_W, NODE_BOTTOM = NODE_Y + NODE_H;  // 700 / 420
const POD_W = BOX_W, POD_H = 104;
const POD_X = COL_L_CX - POD_W / 2;                      // 434
const POD_Y = 64;
const POD_BOTTOM = POD_Y + POD_H;                        // 168
const APP_W = 192, APP_H = 44, APP_DY = 26;              // 26 under the Pod label, as network-gateway-api
const KUBE_W = POD_W, KUBE_H = BOX_H;
const KUBE_X = COL_L_CX - KUBE_W / 2;                    // 434, flush with the Pod above it
const KUBE_Y = NODE_Y + NODE_H - 20 - KUBE_H;            // 320
const KUBE_TOP = KUBE_Y;                                 // 320, the foot 20 clear of the frame bottom
const KUBE_CY = KUBE_Y + KUBE_H / 2;                     // 360

const ROWS = 3;
const ROW_GAP = (NODE_H - ROWS * BOX_H) / (ROWS - 1);    // 78
const ROW_Y = i => NODE_Y + i * (BOX_H + ROW_GAP);       // 24 / 182 / 340
const ADC_Y = ROW_Y(0);
const ADC_BOTTOM = ADC_Y + BOX_H;                        // 104
const VA_Y = ROW_Y(1);
const VA_TOP = VA_Y, VA_BOTTOM = VA_Y + BOX_H;           // 182 / 262
const VA_CY = VA_Y + BOX_H / 2;                          // 222
const ATT_Y = ROW_Y(2);
const ATT_TOP = ATT_Y, ATT_BOTTOM = ATT_Y + BOX_H;       // 420, level with the node frame bottom

const DISK_W = 200, DISK_H = 114;
const DISK_X = 130;
const DISK_Y = 400;
const DISK_TOP = DISK_Y, DISK_BOTTOM = DISK_Y + DISK_H;  // 400 / 514
const DISK_CX = DISK_X + DISK_W / 2;                     // 230
const DISK_RIGHT = DISK_X + DISK_W;                      // 330
const DISK_CY = DISK_Y + DISK_H / 2;                     // 457
const DISK_LBL_Y = DISK_TOP - 14;                        // 386

const CHIPS_Y = 592, CHIP_H = 34;                        // 592..626, 14 clear of the viewBox
const CHIP_GAP = 16, CHIP_COUNT = 4;
// The strip spans the card's own margins, so it centres on 600 by construction. Hanging its left end
// on DISK_X instead put the strip at 130..1140, whose centre is 635.
const CHIPS_L = CONTENT_L, CHIPS_R = CONTENT_R;          // 60 / 1140
const CHIPS_W = CHIPS_R - CHIPS_L;                                      // 1080
const CHIP_W = (CHIPS_W - CHIP_GAP * (CHIP_COUNT - 1)) / CHIP_COUNT;    // 258
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) =>
  CHIPS_L + i * (CHIP_W + CHIP_GAP));                    // 60 / 334 / 608 / 882, last ends 1140

const LANE = 40;
const W_WRITE   = [[COL_R_CX, ADC_BOTTOM], [COL_R_CX, VA_TOP]];              // controller creates it
const W_WATCH   = [[COL_R_CX - LANE, VA_BOTTOM], [COL_R_CX - LANE, ATT_TOP]];// attacher reads it
const W_STATUS  = [[COL_R_CX + LANE, ATT_TOP], [COL_R_CX + LANE, VA_BOTTOM]];// attacher writes back
const PUBLISH_JOG_Y = DISK_BOTTOM + 32;                  // 546
const W_PUBLISH = [[COL_R_CX, ATT_BOTTOM], [COL_R_CX, PUBLISH_JOG_Y], [DISK_CX, PUBLISH_JOG_Y], [DISK_CX, DISK_BOTTOM]];
// Both lanes that reach kubelet end on the NODE FRAME, not on the kubelet box: the device climbs to
// the frame floor under it and the gate stops at the frame's right face, level with its centre.
const W_ONNODE  = [[DISK_RIGHT, DISK_CY], [COL_L_CX, DISK_CY], [COL_L_CX, NODE_BOTTOM]];
const W_GATE    = [[COL_R_X, VA_CY], [CORRIDOR_X, VA_CY], [CORRIDOR_X, KUBE_CY], [NODE_RIGHT, KUBE_CY]];
const W_MOUNT   = [[COL_L_CX, KUBE_TOP], [COL_L_CX, POD_BOTTOM]];

// The write tag rides LEFT of its lane: anchored middle on x=1024 it is 90.4 wide, and the static
// `create` caption starts 12 right of the lane at 1036, so at dx 0 the two overlap for about 200ms.
const WRITE_TAG_DX = -46;

// The publish lane leaves the attacher floor and enters the disk, so at the default -14 the driver
// call is cut for 200 ms. Below the ball it clears from 12 to 42, and 22 also clears the ball itself.
const DRIVER_TAG_DY = 22;

// The right column's lanes are 78 long between 80-tall boxes, so a tag at any fixed offset starts or
// ends inside a block. This one fades in only once its ball is clear: 250 covers the 252ms crossing.
const emergeTag = makeRidingLabel({ role: 'storage', emergeMode: true });
const TAG_EMERGE = 250;
// The status write ENDS on the object it updates, where emerging cannot help: below the ball it
// parks 14 clear of the box floor, and 22 is the offset the publish lane already uses.
const STATUS_TAG_DY = DRIVER_TAG_DY;

// How long a block takes to leave on the detach step.
const LAND_MS = 500;

// Every fade on this card is the same curve, and only `dur` ever moves off LAND_MS.
const fade = (target, from, to, p = {}) =>
  F.fade({ target, from, to, dur: LAND_MS, fill: 'forwards', easing: 'ease-out', ...p });

const lane = (key, points) => P.lane({ key, points, dashed: true, dim: true });

// Z-order: the node frame, then the blocks and the disk, then the Pod, then the lanes and their
// captions, then the chip strip, then the packet layer.
export const SCENE = {
  'aria-label': 'The VolumeAttachment object. For a CSI volume that requires attach, the attach and detach controller in kube-controller-manager, not Kubelet, writes va-7f naming vol-1 and Node-1, its status.attached reading false. The external-attacher calls ControllerPublishVolume and writes that field true, and Kubelet cannot get vol-1 mounted until then. Once the Pod is gone and Kubelet has unmounted, the controller deletes the object, and deleting it is what detaches.',
  parts: [
    P.defs(),
    P.node({ x: COL_L_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.box({ key: 'adc', x: COL_R_X, y: ADC_Y, w: BOX_W, h: BOX_H, label: 'Attach/Detach controller', sublabel: 'kube-controller-manager' }),
    // The object does not exist yet on the poster, so it rests on the pending shade at build.
    P.box({ key: 'va', x: COL_R_X, y: VA_Y, w: BOX_W, h: BOX_H, label: 'VolumeAttachment va-7f', sublabel: 'not created yet', opacity: OPACITY.pending }),
    P.box({ key: 'att', x: COL_R_X, y: ATT_Y, w: BOX_W, h: BOX_H, label: 'External-attacher', sublabel: 'watches VolumeAttachment' }),
    P.cylinder({ key: 'disk', x: DISK_X, y: DISK_Y, w: DISK_W, h: DISK_H, label: 'vol-1', labelY: DISK_H / 2 + 10 }),
    P.pod({
      key: 'appPod', x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'needs vol-1', containers: 0,
      inner: { dx: (POD_W - APP_W) / 2, dy: APP_DY, w: APP_W, h: APP_H, label: 'app', sublabel: 'wants /data' },
      innerKey: 'appBox',
    }),
    P.box({ key: 'kube', x: KUBE_X, y: KUBE_Y, w: KUBE_W, h: KUBE_H, label: 'Kubelet', sublabel: 'gated on attach' }),
    // Every lane stands at full on every step, the pending object's four included. Only the mount
    // lane leaves, with the Pod it points at.
    lane('wWrite', W_WRITE),
    lane('wWatch', W_WATCH),
    lane('wStatus', W_STATUS),
    lane('wGate', W_GATE),
    lane('wPublish', W_PUBLISH),
    lane('wOnNode', W_ONNODE),
    lane('mountLane', W_MOUNT),
    P.wire({ key: 'write', x: COL_R_CX + 12, y: (ADC_BOTTOM + VA_TOP) / 2 + 4, anchor: 'start' }),
    P.wire({ key: 'disk', x: DISK_CX, y: DISK_LBL_Y }),
    P.chip({ key: 'vaChip', x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'VolumeAttachment', value: 'none' }),
    P.chip({ key: 'attrChip', x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'status.attached', value: 'no object' }),
    P.chip({ key: 'diskChip', x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'disk on Node-1', value: 'no' }),
    P.chip({ key: 'kubeChip', x: CHIP_X[3], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'Kubelet', value: 'blocked' }),
    P.packets(),
  ],
  reset: {
    keys: ['adc', 'va', 'att', 'kube', 'disk', 'appBox',
      'vaChip', 'attrChip', 'diskChip', 'kubeChip'],
    pods: ['appPod'],
  },
};

// All four chips are written through setChip, so all four are chipsCued. Argument order is the
// helper's: object, status field, device on the node, kubelet.
const chips = (va, attached, disk, kubelet) => ({ vaChip: va, attrChip: attached, diskChip: disk, kubeChip: kubelet });

// STO.S-01 as fields: the object, its four lanes, the Pod and the mount lane, plus the disk and the
// two lanes it ends. All ten are stated on EVERY step: the reduced replay walks 0..n. No lane dims.
const VA_LANES_ON = { wWrite: 1, wWatch: 1, wStatus: 1, wGate: 1 };
const OBJ_OFF = { va: OPACITY.pending, ...VA_LANES_ON };
const OBJ_ON = { va: 1, ...VA_LANES_ON };
const POD_ON = { appPod: 1, mountLane: 1 };
const DISK_ON = { disk: 1, wPublish: 1, wOnNode: 1 };

const NOT_CREATED = 'not created yet', ATTACHED_FALSE = 'Node-1, attached: false', ATTACHED_TRUE = 'Node-1, attached: true';
const DISK_NONE = 'not attached to any node', DISK_ON_NODE = 'attached to Node-1';
const DISK_MOUNTED = 'attached to Node-1, mounted at /data';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('none', 'no object', 'no', 'blocked'),
    sublabels: { va: NOT_CREATED },
    wires: { disk: DISK_NONE },
    // The Pod is scheduled and waiting, so it is present at full strength. Only the object is
    // missing: its slot rests on the pending shade and its four lanes stand at full (C-14).
    opacity: { ...OBJ_OFF, ...POD_ON, ...DISK_ON },
  },
  {
    id: 'decide',
    duration: 2500,
    narration: 'It is not Kubelet that decides a volume needs attaching. The attach and detach controller in kube-controller-manager sees a Pod bound to a Node with a volume not attached there and takes ownership of making it happen, for a CSI volume that requires attach. With attachRequired false no VolumeAttachment is written.',
    chipsCued: chips('none', 'no object', 'no', 'blocked'),
    sublabels: { va: NOT_CREATED },
    wires: { disk: DISK_NONE },
    opacity: { ...OBJ_OFF, ...POD_ON, ...DISK_ON },
    lit: ['adc'],
  },
  {
    id: 'write',
    duration: 2600,
    narration: 'The controller writes a VolumeAttachment. It names the volume and the Node, and its status.attached reads false because nothing has set it yet. This object is now the one cluster record that vol-1 is meant to be attached to Node-1. Nothing physical has happened yet.',
    chipsCued: chips('va-7f', 'false', 'no', 'blocked'),
    sublabels: { va: ATTACHED_FALSE },
    wires: { write: 'create', disk: DISK_NONE },
    // The object exists by the END of this step, so visible is the static end-state.
    opacity: { ...OBJ_ON, ...POD_ON, ...DISK_ON },
    lit: ['adc'],
    // The animated path starts from the absence the step before it left. The name, the field and the
    // state line are what the write PRODUCES, so all three read no object until it lands (P-03, P-04).
    rewind: {
      opacity: OBJ_OFF,
      chips: { vaChip: 'none', attrChip: 'no object' },
      sublabels: { va: NOT_CREATED },
    },
    // The write is aimed at the pending slot, and the object comes up to full when it lands.
    flow: [
      F.route({ points: W_WRITE, delay: BEAT.lead, name: 'write' }),
      F.tag({ text: 'vol-1 on Node-1', points: W_WRITE, delay: BEAT.lead, dx: WRITE_TAG_DX, fn: emergeTag, emerge: TAG_EMERGE }),
      F.reveal({ target: 'va', from: OPACITY.pending, at: 'write' }),
      F.light({ targets: ['va'], at: 'write' }),
      F.set({ at: 'write', chipsCued: { vaChip: 'va-7f', attrChip: 'false' }, sublabels: { va: ATTACHED_FALSE } }),
    ],
  },
  {
    id: 'attach',
    duration: 4800,
    narration: 'The external-attacher watches VolumeAttachment objects. It picks this one up and calls ControllerPublishVolume, and that call is what gets vol-1 attached to Node-1 in the storage backend. The device is physically on the Node now, and Kubelet still will not touch it, because the object still says false.',
    // The chip strip is the whole point of this step: the disk IS on node-1 and status.attached is
    // STILL false. Reading those two chips side by side is the card in one line.
    chipsCued: chips('va-7f', 'false', 'yes', 'blocked'),
    sublabels: { va: ATTACHED_FALSE },
    wires: { disk: DISK_ON_NODE },
    opacity: { ...OBJ_ON, ...POD_ON, ...DISK_ON },
    lit: ['va'],
    // The device is on the Node by the end of this step, and the third hop is what puts it there, so
    // the chip that records it waits for that hop instead of standing at entry (P-03).
    rewind: { chips: { diskChip: 'no' } },
    // The watch carries no tag, so its cue rides the packet. The other two do carry one, and a cue
    // written as `lights` there would stand BEFORE the tag instead of after it.
    flow: [
      F.route({ points: W_WATCH, name: 'watch', lights: ['att'] }),
      F.route({ points: W_PUBLISH, after: 'watch', name: 'call' }),
      F.tag({ text: 'ControllerPublish', points: W_PUBLISH, after: 'watch', dy: DRIVER_TAG_DY }),
      F.light({ targets: ['disk'], at: 'call' }),
      F.route({ points: W_ONNODE, after: 'call', name: 'land' }),
      F.tag({ text: 'vol-1 on Node-1', points: W_ONNODE, after: 'call' }),
      // Kubelet lights as the RECEIVER of the device, while its chip still reads blocked: seeing the
      // device is not permission to mount it, which is the `mount` gate.
      F.light({ targets: ['kube'], at: 'land' }),
      F.set({ at: 'land', chipsCued: { diskChip: 'yes' } }),
    ],
  },
  {
    id: 'status',
    duration: 2600,
    narration: 'When the backend confirms the attach, the attacher writes status.attached true back onto the same VolumeAttachment. That one field is the signal everything downstream waits for. The object did not move and nothing was recreated: its status changed in place.',
    chipsCued: chips('va-7f', 'true', 'yes', 'blocked'),
    sublabels: { va: ATTACHED_TRUE },
    wires: { disk: DISK_ON_NODE },
    opacity: { ...OBJ_ON, ...POD_ON, ...DISK_ON },
    lit: ['att', 'disk'],
    // The field and the state line read false until the write that carries true lands (P-03).
    rewind: { chips: { attrChip: 'false' }, sublabels: { va: ATTACHED_FALSE } },
    // The status write goes up its OWN lane, offset LANE the other side of the column centre from
    // the watch it answers, so it never reads as the watch bouncing back.
    flow: [
      F.route({ points: W_STATUS, name: 'status' }),
      F.tag({ text: 'attached: true', points: W_STATUS, fn: emergeTag, emerge: TAG_EMERGE, dy: STATUS_TAG_DY }),
      F.light({ targets: ['va'], at: 'status' }),
      F.set({ at: 'status', chipsCued: { attrChip: 'true' }, sublabels: { va: ATTACHED_TRUE } }),
    ],
  },
  {
    id: 'mount',
    duration: 3200,
    narration: 'Kubelet has been blocked all along. It waits for vol-1 to be listed as attached in the Node status, which the controller writes only after status.attached turns true, then checks that same field on the object before it has vol-1 mounted for the Pod at /data. The Pod starts: the object gated the mount.',
    chipsCued: chips('va-7f', 'true', 'yes', 'mounted'),
    sublabels: { va: ATTACHED_TRUE },
    wires: { disk: DISK_MOUNTED },
    opacity: { ...OBJ_ON, ...POD_ON, ...DISK_ON },
    // The Kubelet is what the gate opens onto, and the cue below already lights it on that arrival.
    // Lighting it from entry as well would hide the moment it stops waiting.
    lit: ['va', 'disk'],
    // Kubelet reads blocked, and the disk unmounted, until the mount lands in the Pod (P-03).
    rewind: { chips: { kubeChip: 'blocked' }, wires: { disk: DISK_ON_NODE } },
    flow: [
      F.route({ points: W_GATE, name: 'gate' }),
      F.tag({ text: 'attached: true', points: W_GATE }),
      F.light({ targets: ['kube'], at: 'gate' }),
      F.route({ points: W_MOUNT, after: 'gate', name: 'mount' }),
      F.tag({ text: 'mount /data', points: W_MOUNT, after: 'gate' }),
      F.pulse({ pod: 'appPod', at: 'mount' }),
      F.set({ at: 'mount', chipsCued: { kubeChip: 'mounted' }, wires: { disk: DISK_MOUNTED } }),
    ],
  },
  {
    id: 'detach',
    duration: 5900,
    narration: 'Deleting the object is what tears the attach down. Once the Pod is gone and Kubelet reports vol-1 unmounted, the controller deletes the VolumeAttachment. The attacher sees the deletion mark, calls ControllerUnpublishVolume, and only when the backend has detached vol-1 does it lift its finalizer and let the object go. No object, no attach.',
    chipsCued: chips('deleted', 'no object', 'no', 'unmounted'),
    sublabels: { va: 'deleted after detach' },
    wires: { disk: 'detached from Node-1' },
    opacity: { ...VA_LANES_ON, va: OPACITY.terminated, appPod: 0, mountLane: 0, ...DISK_ON },
    // The controller is the actor of the first clause, so it is lit from entry on both paths.
    lit: ['adc'],
    // Everything the step tears down starts the animated path standing, and every value it changes
    // reads what `mount` left until the arrival that earns the new one (P-03).
    rewind: {
      opacity: { ...OBJ_ON, ...POD_ON, ...DISK_ON },
      chips: { vaChip: 'va-7f', attrChip: 'true', diskChip: 'yes', kubeChip: 'mounted' },
      sublabels: { va: ATTACHED_TRUE },
      wires: { disk: DISK_MOUNTED },
    },
    flow: [
      // The Pod going is the first clause of the narration and everything below follows from it, so
      // it blinks at full before it fades, and its mount lane leaves on the same beat (M-08, P-04).
      F.pulse({ pod: 'appPod' }),
      fade('appPod', 1, 0, { delay: BEAT.afterPulse, name: 'gone' }),
      fade('mountLane', 1, 0, { delay: BEAT.afterPulse }),
      F.set({ at: 'gone', chipsCued: { kubeChip: 'unmounted' } }),
      // The delete rides the SAME lane the create did, because the same controller writes both. It
      // leaves once the Pod is gone, and the watch below can only follow it.
      F.route({ points: W_WRITE, at: 'gone', name: 'del' }),
      F.tag({ text: 'delete va-7f', points: W_WRITE, at: 'gone', fn: emergeTag, emerge: TAG_EMERGE }),
      // The object's cue is an F.set, not `lights`, because the reduced path must not show it: the
      // unlight below takes it off again before the step settles.
      F.set({ on: 'va', lit: ['va'], at: 'del' }),
      F.route({ points: W_WATCH, after: 'del', name: 'watch' }),
      F.tag({ text: 'deletion mark', points: W_WATCH, after: 'del', fn: emergeTag, emerge: TAG_EMERGE }),
      F.light({ targets: ['att'], at: 'watch' }),
      // The deletion mark, not the deletion: the attacher sees deletionTimestamp and the object
      // drops to the terminating shade, still holding its finalizer.
      fade('va', 1, OPACITY.terminating, { at: 'watch' }),
      F.route({ points: W_PUBLISH, after: 'watch', name: 'call' }),
      F.tag({ text: 'ControllerUnpublish', points: W_PUBLISH, after: 'watch', dy: DRIVER_TAG_DY }),
      // The disk lights as the unpublish lands and stays at full: detached is the idle state it
      // opened on, `not attached to any node` at full strength.
      F.light({ targets: ['disk'], at: 'call' }),
      // The object goes only once the backend has detached. Its `from` is the terminating shade the
      // fade above left it on, not the 1 the rewind pinned.
      fade('va', OPACITY.terminating, OPACITY.terminated, { at: 'call', unlight: ['va'] }),
      F.set({
        at: 'call', chipsCued: { vaChip: 'deleted', attrChip: 'no object', diskChip: 'no' },
        sublabels: { va: 'deleted after detach' }, wires: { disk: 'detached from Node-1' },
      }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
