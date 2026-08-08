import { P, F, defineCard, laneY, ladder, strip, midX, shade, CLU, REVEAL_MS, FADE, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS.md#cluster-static-pods

// Three tiers on the L. Panel worst case x<=397 y<=230 at 1100x800, and the Node frame at y=380 is
// what it clears: 390 characters per narration. Re-measure with overlay-measure after a prose edit.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = midX(CONTENT_L, CONTENT_R);                   // 600, the canvas centre by construction

const BOX_W = CLU.BOX_W, BOX_H = CLU.BOX_H;              // 232 / 80
// Tier 1. API centred on CX so the mirror hangs straight below it and the Kubelet lane is one drop.
// kubectl therefore goes RIGHT, reversing the top row's reading direction: see ./CARDS.md.
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;     // 40 / 120
const TOP_GAP = 56;
const API_X = CX - BOX_W / 2, API_R = API_X + BOX_W;     // 484..716
const KUBECTL_X = API_R + TOP_GAP;                       // 772..1004
const LANE_DY = CLU.LANE_DY, TOP_CY = midX(TOP_Y, TOP_BOTTOM);   // 12 / 80
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, LANE_DY);     // 68 / 92
const WIRE_TOP_X = midX(API_R, KUBECTL_X);               // 744
const WIRE_TOP_Y = TOP_Y - 14;                           // 26, above the row

// Tier 2: the mirror Pod, the one object this card draws inside the API.
const MIR_W = 300, MIR_H = 106;
const MIR_X = CX - MIR_W / 2;                            // 450..750
const MIR_Y = 190, MIR_BOTTOM = MIR_Y + MIR_H;           // 190..296

// Tier 3: the Node band. Family numbers, the ones cluster-node-drain carries.
const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;// 60..1140
const NODE_Y = 380, NODE_H = CLU.NODE.H;                 // 380..532
const POD_W = 300, POD_H = CLU.NODE.POD_H, POD_Y = NODE_Y + CLU.NODE.POD_DY;   // 414..520
const ROW_CY = midX(POD_Y, POD_Y + POD_H);               // 467
const POD_PAD = 24;
const FILE_W = 300, FILE_X = NODE_X + POD_PAD, FILE_R = FILE_X + FILE_W;  // 84..384
const KUBE_X = CX - BOX_W / 2, KUBE_R = KUBE_X + BOX_W;  // 484..716, on CX like the API above it
const POD_X = CONTENT_R - POD_PAD - POD_W;               // 816..1116
const BOX_TOP = ROW_CY - BOX_H / 2;                      // 427, the two 80 tall boxes centre on the row
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };

// The Kubelet is the only box here that ever acts. The file lane still points AT it, because what
// travels is the spec off the disk.
const FILE_TO_KUBE = [[FILE_R, ROW_CY], [KUBE_X, ROW_CY]];
const KUBE_TO_POD = [[KUBE_R, ROW_CY], [POD_X, ROW_CY]];
const KUBE_TO_MIRROR = [[CX, BOX_TOP], [CX, MIR_BOTTOM]];
// The API holds the mirror Pod, it does not drive it. No ball rides this on any step and it takes no
// arrowhead: the asymmetry of the card is that nothing ever travels down out of the API.
const API_TO_MIRROR = [[CX, TOP_BOTTOM], [CX, MIR_Y]];
const WIRE_MIR_X = CX + 12, WIRE_MIR_Y = 365;            // right of the drop, above the Node frame

// Chips as a bottom strip, TWO per row: four across leaves 258 units and the names overlap
// their own values.
const CHIP_H = CLU.CHIP_H, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = NODE_Y + NODE_H + 16;                    // 548, second row ends on 624
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;                               // 532, which is LAYOUT.C.strip.two
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// The strip is read as a GRID: the index wraps across the two columns and steps down every second.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

// The list order IS the append order, so it is the z-order: the Node frame and everything that must
// sit above the balls follow the packet layer, and the two top-row blocks go absolute last.
export const SCENE = {
  'aria-label': 'Static Pods and mirror Pods: the Kubelet runs a manifest file on the Node and mirrors it into the API',
  parts: [
    P.defs(),
    // Top-row lanes, one per direction, straddling the row centre line by LANE_DY.
    P.arrow({ x1: KUBECTL_X, y1: REQ_Y, x2: API_R, y2: REQ_Y, dim: true, dashed: true }),
    P.arrow({ x1: API_R, y1: RESP_Y, x2: KUBECTL_X, y2: RESP_Y, dim: true, dashed: true }),
    // API.bottom -> mirror Pod.top. A relationship, not a route.
    P.relation({ key: 'holds', points: API_TO_MIRROR }),
    // Node band lanes plus the one lane that leaves the Node, upward.
    P.lane({ key: 'fileLane', points: FILE_TO_KUBE, dim: true, dashed: true }),
    P.lane({ key: 'podLane', points: KUBE_TO_POD, dim: true, dashed: true }),
    P.lane({ key: 'mirrorLane', points: KUBE_TO_MIRROR, dim: true, dashed: true }),
    P.wire({ key: 'top', x: WIRE_TOP_X, y: WIRE_TOP_Y }),
    P.wire({ key: 'mirror', x: WIRE_MIR_X, y: WIRE_MIR_Y, anchor: 'start' }),
    // State chips, one bottom strip across the content width.
    P.chip({ key: 'pathChip', x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'staticPodPath', value: '/etc/kubernetes/manifests' }),
    P.chip({ key: 'fileChip', x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'manifest file', value: 'none' }),
    P.chip({ key: 'podChip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'static Pod', value: 'none' }),
    P.chip({ key: 'mirrorChip', x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'mirror Pod', value: 'none' }),
    P.packets(),
    // Frame, then everything that must sit above the balls.
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.box({ key: 'fileBox', x: FILE_X, y: BOX_TOP, w: FILE_W, h: BOX_H, label: 'Manifest file', sublabel: 'no file yet' }),
    P.box({ key: 'kubelet', x: KUBE_X, y: BOX_TOP, w: BOX_W, h: BOX_H, label: 'Kubelet', sublabel: 'scans the directory' }),
    // Both shells take POD_W and POD_H: MIR_W and MIR_H carry the mirror tier's own x and bottom,
    // and the two pairs hold the same 300 x 106 by construction.
    P.pod({
      key: 'staticPod', id: 'staticPod', innerKey: 'staticPodBox',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { ...POD_INNER, label: 'static-web', sublabel: 'not started' },
    }),
    P.pod({
      key: 'mirrorPod', id: 'mirrorPod', innerKey: 'mirrorBox',
      x: MIR_X, y: MIR_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { ...POD_INNER, label: 'static-web-Node-1', sublabel: 'not in the API yet' },
    }),
    // Top-row blocks ABSOLUTE LAST.
    P.box({ key: 'apiserver', x: API_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'API', sublabel: 'holds the mirror Pod' }),
    P.box({ key: 'kubectl', x: KUBECTL_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'kubectl', sublabel: 'delete and drain' }),
  ],
  // Both Pods DO go to clearHighlights: the card pulses each of them in turn and the pulse has to
  // come back off between steps.
  reset: {
    keys: ['apiserver', 'kubectl', 'fileBox', 'kubelet', 'pathChip', 'fileChip', 'podChip', 'mirrorChip', 'staticPodBox', 'mirrorBox'],
    pods: ['staticPod', 'mirrorPod'],
  },
};

const PATH = '/etc/kubernetes/manifests';

// Presence in ONE helper: three blocks born on three beats drift the moment a step is added. An
// absent block dims to OPACITY.pending and says so in its sublabel rather than being removed.
const SUB = {
  file: ['no file yet', 'static-web.yaml'],
  pod: ['not started', 'no owner'],
  mirror: ['not in the API yet', 'mirror · read-only'],
};
// A lane is only as present as the fainter of its ends, so it is pinned with the block it depends on.
const stage = (file, pod, mirror) => ({
  opacity: {
    ...shade(['fileBox', 'fileLane'], file ? 1 : OPACITY.pending),
    ...shade(['staticPod', 'podLane'], pod ? 1 : OPACITY.pending),
    ...shade(['mirrorPod', 'mirrorLane', 'holds'], mirror ? 1 : OPACITY.pending),
  },
  sublabels: {
    fileBox: SUB.file[file ? 1 : 0],
    staticPodBox: SUB.pod[pod ? 1 : 0],
    mirrorBox: SUB.mirror[mirror ? 1 : 0],
  },
});
const EMPTY = stage(false, false, false), FILE_ONLY = stage(true, false, false);
const NO_MIRROR = stage(true, true, false), FULL = stage(true, true, true);

// Slower than FADE.out 700, where the block is gone 200ms before its own pulse ends and the delete
// reads as a cut. Fades to OPACITY.terminated, not 0, and comes back on the recreate.
const MIRROR_FADE = 1200;

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { pathChip: PATH, fileChip: 'none', podChip: 'none', mirrorChip: 'none' },
    sublabels: EMPTY.sublabels,
    opacity: EMPTY.opacity,
  },
  {
    id: 'manifest',
    duration: 2400,
    narration: 'A Pod manifest appears in the directory the Kubelet watches on Node-1, named by staticPodPath in the KubeletConfiguration and conventionally /etc/kubernetes/manifests. The Kubelet rescans it and reads every file whose name does not start with a dot.',
    chips: { pathChip: PATH, fileChip: 'static-web.yaml', podChip: 'none', mirrorChip: 'none' },
    sublabels: FILE_ONLY.sublabels,
    opacity: FILE_ONLY.opacity,
    lit: ['fileBox', 'pathChip', 'fileChip'],
    // The file has to be on disk before anything can be read off it, so it lands first and the
    // spec leaves for the Kubelet once it is there.
    flow: [
      F.reveal({ target: 'fileBox', from: OPACITY.pending }),
      F.reveal({ target: 'fileLane', from: OPACITY.pending }),
      F.segment({ from: FILE_TO_KUBE[0], to: FILE_TO_KUBE[1], delay: REVEAL_MS, lights: ['kubelet'] }),
    ],
  },
  {
    id: 'kubelet-starts',
    duration: 2800,
    narration: 'The Kubelet starts the container itself. No Scheduler placed this Pod and no controller owns it, so the Kubelet supervises it directly and restarts it when it fails. That is how a kubeadm control plane comes up: the API server, the controller-manager, the Scheduler and ETCD all run as static Pods.',
    chips: { pathChip: PATH, fileChip: 'static-web.yaml', podChip: 'static-web · Running', mirrorChip: 'none' },
    sublabels: NO_MIRROR.sublabels,
    opacity: NO_MIRROR.opacity,
    lit: ['fileBox', 'kubelet', 'podChip'],
    // The container exists once the Kubelet has actually started it, so the Pod stays at the
    // pending shade and the chip stays empty until the ball lands on the slot.
    rewind: { chips: { podChip: 'none' }, sublabels: { staticPodBox: SUB.pod[0] } },
    flow: [
      F.route({ points: KUBE_TO_POD, name: 'run' }),
      // The lane holds the pending shade for the flight rather than 0, so it is on screen while its
      // own ball rides it and only comes to full when the container it points at exists.
      F.reveal({ target: 'podLane', at: 'run', from: OPACITY.pending }),
      F.reveal({ target: 'staticPod', at: 'run', from: OPACITY.pending }),
      F.pulse({ pod: 'staticPod', at: 'run' }),
      F.set({ at: 'run', chips: { podChip: 'static-web · Running' }, sublabels: { staticPodBox: SUB.pod[1] } }),
    ],
  },
  {
    id: 'mirror',
    duration: 2800,
    narration: 'The Kubelet also creates a mirror Pod in the API for it, so kubectl get pods lists it like any other Pod. The name takes the Node name as a suffix, the kubernetes.io/config.mirror annotation marks it, and the labels on the file are copied across so selectors match it.',
    chips: { pathChip: PATH, fileChip: 'static-web.yaml', podChip: 'static-web · Running', mirrorChip: 'static-web-Node-1' },
    wires: { mirror: 'POST /api/v1/namespaces/default/pods' },
    sublabels: FULL.sublabels,
    opacity: FULL.opacity,
    lit: ['kubelet', 'mirrorChip'],
    // The object appears when the create reaches the API, not at step entry.
    rewind: { chips: { mirrorChip: 'none' }, sublabels: { mirrorBox: SUB.mirror[0] } },
    flow: [
      F.route({ points: KUBE_TO_MIRROR, name: 'create', lights: ['apiserver'] }),
      F.reveal({ target: 'mirrorPod', at: 'create', from: OPACITY.pending }),
      F.reveal({ target: 'mirrorLane', at: 'create', from: OPACITY.pending }),
      F.reveal({ target: 'holds', at: 'create', from: OPACITY.pending }),
      F.pulse({ pod: 'mirrorPod', at: 'create' }),
      F.set({ at: 'create', chips: { mirrorChip: 'static-web-Node-1' }, sublabels: { mirrorBox: SUB.mirror[1] } }),
    ],
  },
  {
    id: 'delete-mirror',
    // Request out (700), answer home (1500), the mirror pulses and dissolves from 1600 over
    // MIRROR_FADE, the recreate leaves at 2900 and lands at 3600 with a pulse behind it: 4500.
    duration: 4700,
    narration: 'Deleting the mirror Pod with kubectl removes the API object and nothing else. The container on Node-1 keeps running, because the file on disk is what the Kubelet reads, and its next scan recreates the mirror. Nothing done to the object reaches the container.',
    chips: { pathChip: PATH, fileChip: 'static-web.yaml', podChip: 'static-web · Running', mirrorChip: 'deleted, then recreated' },
    wires: { top: 'DELETE /api/v1/namespaces/default/pods/static-web-Node-1', mirror: 'POST /api/v1/namespaces/default/pods' },
    sublabels: FULL.sublabels,
    opacity: FULL.opacity,
    lit: ['kubectl', 'kubelet', 'mirrorChip'],
    // The chip walks the step instead of announcing its end: present, gone, back.
    rewind: { chips: { mirrorChip: 'static-web-Node-1' } },
    flow: [
      F.top({ from: KUBECTL_X, to: API_R, y: REQ_Y, name: 'del', lights: ['apiserver'] }),
      F.top({ from: API_R, to: KUBECTL_X, y: RESP_Y, after: 'del' }),
      // The object goes: pulse and dissolve on the same beat, so the blink is not cut off by the fade.
      F.pulse({ pod: 'mirrorPod', after: 'del' }),
      F.set({ after: 'del', chips: { mirrorChip: 'deleted from the API' }, sublabels: { mirrorBox: 'deleted from the API' } }),
      // The API tie goes with it. The Kubelet lane does NOT: the recreate rides it a beat later,
      // and a lane carrying a ball has to be on screen for the flight.
      F.fade({ target: 'mirrorPod', to: OPACITY.terminated, dur: MIRROR_FADE, after: 'del', name: 'dissolve', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'holds', to: OPACITY.terminated, dur: MIRROR_FADE, after: 'del', fill: 'both', easing: 'ease-in' }),
      // And the Kubelet puts it straight back, up the same lane it created it on.
      F.route({ points: KUBE_TO_MIRROR, after: 'dissolve', name: 'again' }),
      F.fade({ target: 'mirrorPod', from: OPACITY.terminated, to: 1, dur: FADE.in, at: 'again', fill: 'forwards', easing: 'ease-out' }),
      F.fade({ target: 'holds', from: OPACITY.terminated, to: 1, dur: FADE.in, at: 'again', fill: 'forwards', easing: 'ease-out' }),
      F.pulse({ pod: 'mirrorPod', at: 'again' }),
      F.set({ at: 'again', chips: { mirrorChip: 'deleted, then recreated' }, sublabels: { mirrorBox: SUB.mirror[1] } }),
    ],
  },
  {
    id: 'edit-file',
    // Spec off the disk (700), restart lands at 1500, the Pod pulse runs to 2400.
    duration: 3000,
    narration: 'To change a static Pod you change its file. The Kubelet applies the new spec on its next scan and restarts the container, and moving the file out of the directory removes the Pod. The spec cannot refer to a ConfigMap, a Secret or a ServiceAccount, so everything it needs comes off the file or the Node filesystem.',
    chips: { pathChip: PATH, fileChip: 'static-web.yaml · image nginx:1.27', podChip: 'static-web · restarted', mirrorChip: 'static-web-Node-1' },
    sublabels: FULL.sublabels,
    opacity: FULL.opacity,
    lit: ['fileBox', 'fileChip', 'podChip'],
    // The container is restarted by the ball that reaches it, so the chip holds what the previous
    // step left until then.
    rewind: { chips: { podChip: 'static-web · Running' } },
    flow: [
      F.segment({ from: FILE_TO_KUBE[0], to: FILE_TO_KUBE[1], name: 'spec', lights: ['kubelet'] }),
      F.route({ points: KUBE_TO_POD, after: 'spec', name: 'restart' }),
      F.pulse({ pod: 'staticPod', at: 'restart' }),
      F.set({ at: 'restart', chips: { podChip: 'static-web · restarted' } }),
    ],
  },
  {
    id: 'drain',
    duration: 2800,
    narration: 'A drain evicts or deletes the Pods on Node-1 and skips every mirror Pod, because removing one through the API would stop nothing. DaemonSet Pods are left alone too, and the Node Drain card covers the rest of that loop. So a static Pod rides out a drain and a kubeadm control plane keeps serving while its Node is cordoned.',
    chips: { pathChip: PATH, fileChip: 'static-web.yaml · image nginx:1.27', podChip: 'static-web · restarted', mirrorChip: 'static-web-Node-1 · drain skips it' },
    wires: { top: 'kubectl drain Node-1 · mirror Pods are skipped' },
    sublabels: FULL.sublabels,
    opacity: FULL.opacity,
    lit: ['kubectl', 'mirrorChip'],
    flow: [
      F.top({ from: KUBECTL_X, to: API_R, y: REQ_Y, name: 'list', lights: ['apiserver'] }),
      F.top({ from: API_R, to: KUBECTL_X, y: RESP_Y, after: 'list' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
