import { P, F, defineCard, BEAT, FADE, OPACITY } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-csidriver.md


// Two halves mirrored about one spine: the disk driver left, the NFS driver right, and the two
// consumers that read both CSIDriver objects standing ON the spine between them.
const CX = 600;

// The catalog actor block (NET.L-01). The side blocks sit SIDE_D off the spine, which leaves a
// 128 gap for every hop and centres the drawn extent on CX.
const BLOCK_W = 232, BLOCK_H = 80, SIDE_D = 360;
const L_CX = CX - SIDE_D, R_CX = CX + SIDE_D;
const L_X = L_CX - BLOCK_W / 2, R_X = R_CX - BLOCK_W / 2;
const M_X = CX - BLOCK_W / 2;
const L_FACE = L_X + BLOCK_W, R_FACE = R_X;
const M_L = M_X, M_R = M_X + BLOCK_W;

// The head: the two objects side by side right of the panel wall, each a name box over a column
// of its three fields. 172 is the widest the pair can be and still start at the wall.
const OBJ_W = 172, OBJ_GAP = 16, OBJ_Y = 24, OBJ_H = 48;
const OBJ_D_X = CX - OBJ_GAP / 2 - OBJ_W, OBJ_N_X = CX + OBJ_GAP / 2;
const CHIP_H = 34, CHIP_GAP = 8;
const chipY = i => OBJ_Y + OBJ_H + CHIP_GAP + i * (CHIP_H + CHIP_GAP);

// Row 1, the control plane: it hangs below the panel.
const ROW1_Y = 252, ROW1_MID = ROW1_Y + BLOCK_H / 2;

// Node-1 holds Kubelet, the two node plugins and the one Pod, with the catalog 34 label band over
// row 2 and 12 of floor under the Pod.
const NODE_X = L_X - 20, NODE_W = 2 * SIDE_D + BLOCK_W + 40;
const ROW2_Y = ROW1_Y + BLOCK_H + 56, ROW2_MID = ROW2_Y + BLOCK_H / 2;
const NODE_Y = ROW2_Y - 34;
const ROW2_BOT = ROW2_Y + BLOCK_H;

// One Pod spanning both halves, so each volume box sits under the node plugin that mounts it.
const POD_X = L_X, POD_W = 2 * SIDE_D + BLOCK_W, POD_H = 104;
const POD_Y = ROW2_BOT + 36;
const IN_W = 192, IN_H = 44, IN_Y = POD_Y + 26;
const NODE_H = POD_Y + POD_H + 12 - NODE_Y;

const W_VA_D  = [[M_L, ROW1_MID], [L_FACE, ROW1_MID]];                      // controller -> va-1
const W_VA_N  = [[M_R, ROW1_MID], [R_FACE, ROW1_MID]];                      // controller -> va-2
const W_PUB_D = [[M_L, ROW2_MID], [L_FACE, ROW2_MID]];                      // Kubelet -> disk plugin
const W_PUB_N = [[M_R, ROW2_MID], [R_FACE, ROW2_MID]];                      // Kubelet -> NFS plugin
// A mount drop stops on the Pod roof, never inside the shell, above the volume box it mounts.
const W_MNT_D = [[L_CX, ROW2_BOT], [L_CX, POD_Y]];                          // disk plugin -> data
const W_MNT_N = [[R_CX, ROW2_BOT], [R_CX, POD_Y]];                          // NFS plugin -> shared

// A row hop runs between two roofs and its string is as wide as the gap, so it rides 50 up. A
// mount drop rides outside its lane.
const ROW_TAG = { dy: -50 };
const DROP_L_TAG = { dx: -30, dy: 4 };
const DROP_R_TAG = { dx: 30, dy: 4 };

const obj = (key, x, driver) => P.box({ key, x, y: OBJ_Y, w: OBJ_W, h: OBJ_H, label: 'CSIDriver', sublabel: driver });
const field = (key, x, i, name, value) => P.chip({ key, x, y: chipY(i), w: OBJ_W, h: CHIP_H, name, value });
const block = (key, x, y, label, sublabel, opacity) => P.box({ key, x, y, w: BLOCK_W, h: BLOCK_H, label, sublabel, opacity });
const lane = (key, points) => P.lane({ key, points, dashed: true, dim: true });

// Z-order: the Node frame, the blocks and the Pod, the head with its fields, the lanes, the
// counterfactual caption, then the packet layer.
export const SCENE = {
  'aria-label': 'The CSIDriver object: one Pod app-0 with fsGroup 2000 mounts volume data from disk.csi.example.com and volume shared from nfs.csi.example.com. Each driver here has a cluster scoped CSIDriver object of the same name. The attach and detach controller reads attachRequired: true for the disk driver, so it writes VolumeAttachment va-1, and false for the NFS driver, so it writes none. Kubelet calls NodePublishVolume on both node plugins, passes Pod info such as the Pod name, namespace and UID only to the NFS driver because its podInfoOnMount is true, and changes the group of data to 2000 because the disk driver has fsGroupPolicy File, while None leaves shared as exported. If the NFS driver had no CSIDriver object, the controller and Kubelet would treat it as attachRequired true, a VolumeAttachment would be written that no attacher answers, and the Pod would wait in ContainerCreating.',
  parts: [
    P.defs(),
    P.node({ key: 'nodeFrame', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    block('vaD', L_X, ROW1_Y, 'VolumeAttachment', 'not written yet', OPACITY.pending),
    block('ctrl', M_X, ROW1_Y, 'Attach/Detach controller', 'kube-controller-manager'),
    block('vaN', R_X, ROW1_Y, 'VolumeAttachment', 'not written yet', OPACITY.notready),
    block('npD', L_X, ROW2_Y, 'Node plugin', 'disk.csi.example.com'),
    block('kubelet', M_X, ROW2_Y, 'Kubelet', 'on Node-1'),
    block('npN', R_X, ROW2_Y, 'Node plugin', 'nfs.csi.example.com'),
    // One Pod: the shell and its three peer boxes in one group, so the pulse takes the whole Pod.
    P.group({
      key: 'pod', opacity: OPACITY.pending,
      parts: [
        P.pod({ key: 'podShell', x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod app-0', sublabel: 'ContainerCreating · fsGroup 2000', containers: 0 }),
        P.box({ key: 'data', x: L_CX - IN_W / 2, y: IN_Y, w: IN_W, h: IN_H, label: 'Volume data', sublabel: 'not mounted' }),
        P.box({ key: 'app', x: CX - IN_W / 2, y: IN_Y, w: IN_W, h: IN_H, label: 'app', sublabel: 'mounts /data and /shared' }),
        P.box({ key: 'shared', x: R_CX - IN_W / 2, y: IN_Y, w: IN_W, h: IN_H, label: 'Volume shared', sublabel: 'not mounted' }),
      ],
    }),
    obj('objD', OBJ_D_X, 'disk.csi.example.com'),
    obj('objN', OBJ_N_X, 'nfs.csi.example.com'),
    field('attD', OBJ_D_X, 0, 'attachRequired', 'true'),
    field('podD', OBJ_D_X, 1, 'podInfoOnMount', 'false'),
    field('fsgD', OBJ_D_X, 2, 'fsGroupPolicy', 'File'),
    field('attN', OBJ_N_X, 0, 'attachRequired', 'false'),
    field('podN', OBJ_N_X, 1, 'podInfoOnMount', 'true'),
    field('fsgN', OBJ_N_X, 2, 'fsGroupPolicy', 'None'),
    lane('lVaD', W_VA_D),
    lane('lVaN', W_VA_N),
    lane('lPubD', W_PUB_D),
    lane('lPubN', W_PUB_N),
    lane('lMntD', W_MNT_D),
    lane('lMntN', W_MNT_N),
    // T-35: the caption over the half a counterfactual changes, blank on every other step. It sits
    // high enough that the row tag riding above its lane passes under it.
    P.wire({ key: 'branch', x: R_CX, y: ROW1_Y - 30 }),
    P.packets(),
  ],
  reset: {
    keys: ['objD', 'objN', 'attD', 'podD', 'fsgD', 'attN', 'podN', 'fsgN',
      'vaD', 'ctrl', 'vaN', 'npD', 'kubelet', 'npN'],
    pods: ['pod'],
  },
};

// STO.S-01 as one literal: everything born, ghosted or started mid-story, and every lane.
const PEND = OPACITY.pending, GHOST = OPACITY.notready;
const LANES = ['lVaD', 'lVaN', 'lPubD', 'lPubN', 'lMntD', 'lMntN'];
const stage = ({ vaD = PEND, vaN = GHOST, pod = PEND, objN = 1 } = {}) => ({
  vaD, vaN, pod, objN, ...Object.fromEntries(LANES.map(k => [k, 1])),
});
// Every step states all six fields (P-01), and the NFS column reads unset when its object is gone.
const fields = (n = ['false', 'true', 'None']) => ({
  attD: 'true', podD: 'false', fsgD: 'File', attN: n[0], podN: n[1], fsgN: n[2],
});
const UNSET = ['unset', 'unset', 'unset'];

const IDLE_SUB = { vaD: 'not written yet', vaN: 'not written yet', data: 'not mounted', shared: 'not mounted' };
const ATTACHED_SUB = { vaD: 'data on Node-1', vaN: 'attach skipped', data: 'not mounted', shared: 'not mounted' };
const MOUNTED_SUB = { vaD: 'data on Node-1', vaN: 'attach skipped', data: 'mounted, group 2000', shared: 'mounted as exported' };
const ATTACHED_LBL = { vaD: 'VolumeAttachment va-1', vaN: 'No VolumeAttachment', objN: 'CSIDriver' };
const WAIT = { podShell: 'ContainerCreating · fsGroup 2000' };
const RUN = { podShell: 'Running · fsGroup 2000' };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: fields(),
    labels: { vaD: 'VolumeAttachment', vaN: 'VolumeAttachment', objN: 'CSIDriver' },
    sublabels: IDLE_SUB,
    podSublabels: WAIT,
    opacity: stage(),
  },
  {
    id: 'attach',
    duration: 4000,
    narration: 'Each volume names its driver, and each driver here has a cluster scoped CSIDriver object of that exact name. The attach and detach controller reads attachRequired from it. The disk driver says true, so the controller writes VolumeAttachment va-1. The NFS driver says false, so no attach is needed.',
    chipsCued: fields(),
    labels: ATTACHED_LBL,
    sublabels: ATTACHED_SUB,
    podSublabels: WAIT,
    opacity: stage({ vaD: 1 }),
    // The controller acts and the two fields it reads light with it. va-1 is the receiver and is
    // born as the write lands. The NFS half gets no ball: that no attach happens is the point.
    lit: ['ctrl', 'attD', 'attN'],
    rewind: { labels: { vaD: 'VolumeAttachment', vaN: 'VolumeAttachment' }, sublabels: IDLE_SUB, opacity: { vaD: PEND } },
    flow: [
      F.route({ points: W_VA_D, delay: BEAT.lead, name: 'write', lights: ['vaD'], tag: { text: 'create', ...ROW_TAG } }),
      F.reveal({ target: 'vaD', from: PEND, at: 'write' }),
      F.set({ labels: ATTACHED_LBL, sublabels: ATTACHED_SUB, at: 'write' }),
    ],
  },
  {
    id: 'mount',
    duration: 5400,
    narration: 'Kubelet reads the same two objects. It calls NodePublishVolume on each node plugin, and podInfoOnMount true adds Pod info such as the Pod name, namespace and UID to the NFS call only. With fsGroupPolicy File, Kubelet changes the group of data to 2000, and None leaves shared as it is exported.',
    chipsCued: fields(),
    labels: ATTACHED_LBL,
    sublabels: MOUNTED_SUB,
    podSublabels: RUN,
    opacity: stage({ vaD: 1, pod: 1 }),
    lit: ['kubelet', 'podD', 'podN', 'fsgD', 'fsgN'],
    // Both calls leave together and each plugin mounts as its call lands. The Pod is the receiver
    // of the last mount: it turns Running and blinks as a whole (M-03), so no inner box is lit.
    rewind: { sublabels: ATTACHED_SUB, podSublabels: WAIT, opacity: { pod: PEND } },
    flow: [
      F.route({ points: W_PUB_D, delay: BEAT.lead, name: 'pubD', lights: ['npD'], tag: { text: 'NodePublish', ...ROW_TAG } }),
      F.route({ points: W_PUB_N, delay: BEAT.lead, name: 'pubN', lights: ['npN'], tag: { text: 'NodePublish + Pod info', ...ROW_TAG } }),
      F.route({ points: W_MNT_D, after: 'pubD', tag: { text: 'mount', ...DROP_L_TAG } }),
      F.route({ points: W_MNT_N, after: 'pubN', name: 'mntN', tag: { text: 'mount', ...DROP_R_TAG } }),
      F.set({ sublabels: MOUNTED_SUB, podSublabels: RUN, at: 'mntN' }),
      F.fade({ target: 'pod', from: PEND, to: 1, dur: FADE.in, fill: 'forwards', easing: 'ease-out', at: 'mntN' }),
      F.pulse({ pod: 'pod', at: 'mntN' }),
    ],
  },
  {
    id: 'missing',
    duration: 4200,
    narration: 'Suppose instead the NFS driver ships no CSIDriver object: no field is set. The controller and Kubelet treat it as attachRequired true. The controller writes va-2, but unlike va-1, no external-attacher marks it attached, so shared stays unmounted and the Pod waits in ContainerCreating.',
    chipsCued: fields(UNSET),
    labels: { vaD: 'VolumeAttachment va-1', vaN: 'VolumeAttachment va-2', objN: 'No CSIDriver' },
    sublabels: { vaD: 'data on Node-1', vaN: 'attached: false', data: 'mounted, group 2000', shared: 'not mounted' },
    podSublabels: WAIT,
    wires: { branch: 'if instead nfs.csi.example.com had no CSIDriver' },
    opacity: stage({ vaD: 1, vaN: 1, objN: GHOST }),
    // Only the right half changes: the object goes, the controller acts, and va-2 is born as the
    // write lands. Nothing answers it, so no plugin, volume or Pod on the right is ever lit.
    lit: ['ctrl'],
    rewind: { labels: { vaN: 'No VolumeAttachment', objN: 'CSIDriver' }, sublabels: { vaN: 'attach skipped' }, opacity: { vaN: GHOST, objN: 1 } },
    flow: [
      F.fade({ target: 'objN', from: 1, to: GHOST, dur: FADE.out, fill: 'forwards' }),
      F.set({ labels: { objN: 'No CSIDriver' }, delay: FADE.out }),
      F.route({ points: W_VA_N, delay: BEAT.lead, name: 'write', lights: ['vaN'], tag: { text: 'create', ...ROW_TAG } }),
      F.reveal({ target: 'vaN', from: GHOST, at: 'write' }),
      F.set({ labels: { vaN: 'VolumeAttachment va-2' }, sublabels: { vaN: 'attached: false' }, at: 'write' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
