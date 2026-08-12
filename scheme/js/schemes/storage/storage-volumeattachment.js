import { P, F, defineCard, BEAT, OPACITY } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-volumeattachment


const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140, midpoint 600

// Every solid block on the card is ONE size, storage-csi-architecture's.
const BOX_W = 232, BOX_H = 76;

const LEFT_X = 400;
const NODE_W = 300;
const COL_L_X = LEFT_X;                                  // 400..700, the node frame
const COL_L_CX = COL_L_X + NODE_W / 2;                   // 550
const COL_R_X = CONTENT_R - BOX_W;                       // 908..1140, the control-plane column
const COL_R_CX = COL_R_X + BOX_W / 2;                    // 1024
const CORRIDOR_X = (COL_L_X + NODE_W + COL_R_X) / 2;     // 804: the one lane that crosses the columns

const NODE_Y = 24, NODE_H = 396;                         // 24..420
const POD_W = 226, POD_H = 110;
const POD_X = COL_L_CX - POD_W / 2;                      // 437
const POD_Y = 64;
const POD_BOTTOM = POD_Y + POD_H;                        // 174
const POD_PAD = 24, POD_INNER_Y = 40, POD_INNER_H = 46;  // the App box, same insets as attach-mount
const KUBE_W = POD_W, KUBE_H = BOX_H;
const KUBE_X = COL_L_CX - KUBE_W / 2;                    // 437, flush with the Pod above it
const KUBE_Y = 324;
const KUBE_TOP = KUBE_Y, KUBE_BOTTOM = KUBE_Y + KUBE_H;  // 324 / 400, 20 clear of the frame bottom
const KUBE_RIGHT = KUBE_X + KUBE_W;                      // 663
const KUBE_CY = KUBE_Y + KUBE_H / 2;                     // 362

const ROWS = 3;
const ROW_GAP = (NODE_H - ROWS * BOX_H) / (ROWS - 1);    // 84
const ROW_Y = i => NODE_Y + i * (BOX_H + ROW_GAP);       // 24 / 184 / 344
const ADC_Y = ROW_Y(0);
const ADC_BOTTOM = ADC_Y + BOX_H;                        // 100
const VA_Y = ROW_Y(1);
const VA_TOP = VA_Y, VA_BOTTOM = VA_Y + BOX_H;           // 184 / 260
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
// The result surfacing on the node leaves the disk's right face and climbs into kubelet from below,
// so the two lanes touching the disk use different faces and their riding tags never share a strip.
const W_ONNODE  = [[DISK_RIGHT, DISK_CY], [COL_L_CX, DISK_CY], [COL_L_CX, KUBE_BOTTOM]];
const W_GATE    = [[COL_R_X, VA_CY], [CORRIDOR_X, VA_CY], [CORRIDOR_X, KUBE_CY], [KUBE_RIGHT, KUBE_CY]];
const W_MOUNT   = [[COL_L_CX, KUBE_TOP], [COL_L_CX, POD_BOTTOM]];

// How long a born-mid-story construction takes to materialise, and how long it takes to leave. It runs
// before the ball is sent (BEAT.lead is 800), so nothing is ever aimed at a block that is not there.
const LAND_MS = 500;

// Every fade on this card is the same curve, and only `dur` ever moves off LAND_MS.
const fade = (target, from, to, p = {}) =>
  F.fade({ target, from, to, dur: LAND_MS, fill: 'forwards', easing: 'ease-out', ...p });

// The four lanes the VolumeAttachment object owns are ALSO one array, because they are born and die
// as one construction and the dumps name them `vaLanes[n]`. The keys are what the opacity field
// writes through; the array is the vocabulary. tune is the only hook that can hold both.
const vaLane = (key, points) => P.lane({
  key, points, dashed: true, dim: true, opacity: 0,
  tune: (el, refs) => { refs.vaLanes = [...(refs.vaLanes || []), el]; },
});

const lane = (key, points) => P.lane({ key, points, dashed: true, dim: true });

// Z-order: the node frame, then the blocks and the disk, then the Pod, then the lanes and their
// captions, then the chip strip, then the packet layer.
export const SCENE = {
  'aria-label': 'The VolumeAttachment object. The attach and detach controller inside kube-controller-manager, not Kubelet, decides a volume must be attached to a Node and writes a VolumeAttachment naming the volume and the Node with status.attached false. The external-attacher watches those objects, calls ControllerPublishVolume on the driver, and on success writes status.attached true back onto the same object. Kubelet is blocked on that one field and mounts only once it reads true. Because the object, not the Pod, is the cluster record of the attach, deleting it is what triggers ControllerUnpublishVolume and the detach.',
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
      inner: { dx: POD_PAD, dy: POD_INNER_Y, w: POD_W - POD_PAD * 2, h: POD_INNER_H, label: 'app', sublabel: 'wants /data' },
      innerKey: 'appBox',
    }),
    P.box({ key: 'kube', x: KUBE_X, y: KUBE_Y, w: KUBE_W, h: KUBE_H, label: 'Kubelet', sublabel: 'gated on attach' }),
    vaLane('wWrite', W_WRITE),
    vaLane('wWatch', W_WATCH),
    vaLane('wStatus', W_STATUS),
    vaLane('wGate', W_GATE),
    // Lanes between blocks that stand for the whole card, so they are always drawn.
    lane('wPublish', W_PUBLISH),
    lane('wOnNode', W_ONNODE),
    lane('mountLane', W_MOUNT),
    P.wire({ key: 'write', x: COL_R_CX + 12, y: (ADC_BOTTOM + VA_TOP) / 2 + 4, anchor: 'start' }),
    P.wire({ key: 'disk', x: DISK_CX, y: DISK_LBL_Y }),
    P.chip({ key: 'vaChip', x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'VolumeAttachment', value: 'none' }),
    P.chip({ key: 'attrChip', x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'status.attached', value: 'no object' }),
    P.chip({ key: 'diskChip', x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'disk on node-1', value: 'no' }),
    P.chip({ key: 'kubeChip', x: CHIP_X[3], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'kubelet', value: 'blocked' }),
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

// STO.S-01 as fields. `setBorn` pinned the object, its four lanes, the Pod and the mount lane, and
// the prologue pinned the disk with the two lanes that are as present as it is. Every one of the ten
// is stated on EVERY step, never inherited: the reduced replay walks 0..n.
const OBJ_OFF = { va: OPACITY.pending, wWrite: 0, wWatch: 0, wStatus: 0, wGate: 0 };
const OBJ_ON = { va: 1, wWrite: 1, wWatch: 1, wStatus: 1, wGate: 1 };
const POD_ON = { appPod: 1, mountLane: 1 };
const DISK_ON = { disk: 1, wPublish: 1, wOnNode: 1 };
const DISK_DIM = { disk: OPACITY.notready, wPublish: OPACITY.notready, wOnNode: OPACITY.notready };
const VA_LANES = ['wWrite', 'wWatch', 'wStatus', 'wGate'];

const NOT_CREATED = 'not created yet', ATTACHED_FALSE = 'node-1, attached: false', ATTACHED_TRUE = 'node-1, attached: true';
const DISK_NONE = 'not attached to any node', DISK_ON_NODE = 'attached to node-1';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('none', 'no object', 'no', 'blocked'),
    sublabels: { va: NOT_CREATED },
    wires: { disk: DISK_NONE },
    // The Pod is scheduled and waiting, which the narration states outright, so it is present at
    // full strength. Only the object is missing, and it is genuinely absent rather than greyed out.
    opacity: { ...OBJ_OFF, ...POD_ON, ...DISK_ON },
  },
  {
    id: 'decide',
    duration: 2200,
    narration: 'It is not Kubelet that decides a volume needs attaching. The attach and detach controller runs inside kube-controller-manager, sees a Pod bound to a Node with a volume that is not attached there, and takes ownership of making it happen.',
    chipsCued: chips('none', 'no object', 'no', 'blocked'),
    sublabels: { va: NOT_CREATED },
    wires: { disk: DISK_NONE },
    opacity: { ...OBJ_OFF, ...POD_ON, ...DISK_ON },
    lit: ['adc'],
  },
  {
    id: 'write',
    duration: 2600,
    narration: 'The controller writes a VolumeAttachment. It names the volume and the Node, and it starts with status.attached set to false. This object is now the single cluster record that vol-1 is meant to live on Node-1. Nothing physical has happened yet.',
    chipsCued: chips('va-7f', 'false', 'no', 'blocked'),
    sublabels: { va: ATTACHED_FALSE },
    wires: { write: 'create', disk: DISK_NONE },
    // The object exists by the END of this step, so visible is the static end-state.
    opacity: { ...OBJ_ON, ...POD_ON, ...DISK_ON },
    lit: ['adc'],
    // The animated path starts from the absence the step before it left, and the construction below
    // is what closes the gap.
    rewind: { opacity: OBJ_OFF },
    // The object and all four of its lanes materialise as ONE construction, and finish before the
    // write is sent (LAND_MS 500 against BEAT.lead 800), so no arrowhead is ever aimed at nothing.
    flow: [
      fade('va', OPACITY.pending, 1),
      ...VA_LANES.map(k => fade(k, 0, 1)),
      F.route({ points: W_WRITE, delay: BEAT.lead, name: 'write' }),
      F.tag({ text: 'vol-1 on node-1', points: W_WRITE, delay: BEAT.lead }),
      F.light({ targets: ['va'], at: 'write' }),
    ],
  },
  {
    id: 'attach',
    duration: 4800,
    narration: 'The external-attacher watches VolumeAttachment objects. It picks this one up and calls ControllerPublishVolume on the driver, and that call is what gets vol-1 attached to Node-1 in the storage backend. The device is physically on the Node now, and Kubelet still will not touch it, because the object still says false.',
    // The chip strip is the whole point of this step: the disk IS on node-1 and status.attached is
    // STILL false. Reading those two chips side by side is the card in one line.
    chipsCued: chips('va-7f', 'false', 'yes', 'blocked'),
    sublabels: { va: ATTACHED_FALSE },
    wires: { disk: DISK_ON_NODE },
    opacity: { ...OBJ_ON, ...POD_ON, ...DISK_ON },
    lit: ['va'],
    // The watch carries no tag, so its cue rides the packet. The other two do carry one, and a cue
    // written as `lights` there would stand BEFORE the tag instead of after it.
    flow: [
      F.route({ points: W_WATCH, name: 'watch', lights: ['att'] }),
      F.route({ points: W_PUBLISH, after: 'watch', name: 'call' }),
      F.tag({ text: 'ControllerPublish', points: W_PUBLISH, after: 'watch' }),
      F.light({ targets: ['disk'], at: 'call' }),
      F.route({ points: W_ONNODE, after: 'call', name: 'land' }),
      F.tag({ text: 'vol-1 on node-1', points: W_ONNODE, after: 'call' }),
      F.light({ targets: ['kube'], at: 'land' }),
    ],
  },
  {
    id: 'status',
    duration: 2600,
    narration: 'When the backend confirms the attach, the attacher writes status.attached true back onto the same VolumeAttachment. That one field is the signal everything downstream waits for. The object did not move and nothing was recreated, one field changed.',
    chipsCued: chips('va-7f', 'true', 'yes', 'blocked'),
    sublabels: { va: ATTACHED_TRUE },
    wires: { disk: DISK_ON_NODE },
    opacity: { ...OBJ_ON, ...POD_ON, ...DISK_ON },
    lit: ['att', 'disk'],
    // The status write goes up its OWN lane, offset LANE the other side of the column centre from
    // the watch it answers, so it never reads as the watch bouncing back.
    flow: [
      F.route({ points: W_STATUS, name: 'status' }),
      F.tag({ text: 'attached: true', points: W_STATUS }),
      F.light({ targets: ['va'], at: 'status' }),
    ],
  },
  {
    id: 'mount',
    duration: 3200,
    narration: 'Kubelet has been blocked this whole time, watching that one field. The moment status.attached reads true it stops waiting, mounts the disk into the Pod at /data, and the Pod starts. The VolumeAttachment gated the mount.',
    chipsCued: chips('va-7f', 'true', 'yes', 'mounted'),
    sublabels: { va: ATTACHED_TRUE },
    wires: { disk: 'attached to node-1, mounted at /data' },
    opacity: { ...OBJ_ON, ...POD_ON, ...DISK_ON },
    // The Kubelet is what the gate opens onto, and the cue below already lights it on that arrival.
    // It was lit from entry as well, so the moment it stopped waiting could not be seen.
    lit: ['va', 'disk'],
    flow: [
      F.route({ points: W_GATE, name: 'gate' }),
      F.tag({ text: 'attached: true', points: W_GATE }),
      F.light({ targets: ['kube'], at: 'gate' }),
      F.route({ points: W_MOUNT, after: 'gate', name: 'mount' }),
      F.tag({ text: 'mount /data', points: W_MOUNT, after: 'gate' }),
      F.pulse({ pod: 'appPod', at: 'mount' }),
    ],
  },
  {
    id: 'detach',
    duration: 5400,
    narration: 'Because the object is the record, deleting it is what tears the attach down. Once the Pod is gone the controller deletes the VolumeAttachment, the attacher sees the deletion mark, calls ControllerUnpublishVolume, and only when the backend has detached vol-1 from Node-1 does the object finally go. No object, no attach.',
    chipsCued: chips('deleted', 'gone', 'no', 'released'),
    sublabels: { va: 'deleted after detach' },
    wires: { disk: 'detached from node-1' },
    opacity: {
      va: OPACITY.terminated, wWrite: 0, wWatch: 0, wStatus: 0, wGate: 0,
      appPod: 0, mountLane: 0, ...DISK_DIM,
    },
    // The controller is the actor of the first clause, so it is lit from entry on both paths.
    lit: ['adc'],
    // Everything the step tears down starts the animated path standing, and the fades below are what
    // take it away.
    rewind: { opacity: { ...OBJ_ON, ...POD_ON, ...DISK_ON } },
    flow: [
      fade('appPod', 1, 0),
      fade('mountLane', 1, 0),
      // The delete rides the SAME lane the create did, because the same controller writes both.
      // The watch below is the attacher reading that deletion, so it can only follow it.
      F.route({ points: W_WRITE, delay: BEAT.lead, name: 'del' }),
      F.tag({ text: 'delete va-7f', points: W_WRITE, delay: BEAT.lead }),
      // The object's cue is an F.set on the object itself, which is byte-for-byte the timer
      // lightBoxAt hangs there. It is NOT `lights`, because the reduced path must not show it: the
      // unlight below takes it off again before the step settles.
      F.set({ on: 'va', lit: ['va'], at: 'del' }),
      F.route({ points: W_WATCH, after: 'del', name: 'watch' }),
      F.tag({ text: 'va-7f deleted', points: W_WATCH, after: 'del' }),
      F.light({ targets: ['att'], at: 'watch' }),
      // The deletion mark, not the deletion: the attacher sees deletionTimestamp and the object
      // drops to the terminating shade, still holding its finalizer.
      fade('va', 1, OPACITY.terminating, { at: 'watch' }),
      F.route({ points: W_PUBLISH, after: 'watch', name: 'call' }),
      F.tag({ text: 'ControllerUnpublish', points: W_PUBLISH, after: 'watch' }),
      // The disk and its two lanes sink together, and only after the unpublish ball has landed on it:
      // the lane the ball is riding has to be on screen for the whole flight.
      ...['disk', 'wPublish', 'wOnNode'].map(k => fade(k, 1, OPACITY.notready, { dur: 400, at: 'call' })),
      // The object goes only once the backend has detached, and its lanes with it. Its `from` is the
      // terminating shade the fade above left it on, not the 1 the rewind pinned.
      fade('va', OPACITY.terminating, OPACITY.terminated, { at: 'call', unlight: ['va'] }),
      ...VA_LANES.map(k => fade(k, 1, 0, { at: 'call' })),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
