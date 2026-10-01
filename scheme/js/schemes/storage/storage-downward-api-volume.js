import { P, F, defineCard, BEAT, makeRidingLabel } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-downward-api-volume.md


// Two listings level with each other across one writer: the Pod object on the left, Kubelet in the
// middle, the labels file on the right, each file line level with the label it comes from. The
// running Pod stands over Kubelet on the canvas centre. Panel extent measured in the record.
const CX = 600;
const COL_W = 232;                                                // NET.L-01, every column
const OBJ_X = 100, MID_X = CX - COL_W / 2, FILE_X = 1200 - OBJ_X - COL_W;   // 100 / 484 / 868
const OBJ_R = OBJ_X + COL_W, MID_R = MID_X + COL_W;               // 332 / 716
const OBJ_CX = OBJ_X + COL_W / 2, FILE_CX = FILE_X + COL_W / 2;   // 216 / 984

// The two listings: a header line, then four row slots, inset inside a frame of one height. The
// inset is wider than the 16 a ball is judged AT a block by, so a lane on the frame face is the frame's.
const LIST_Y = 262;                                               // the object frame top clears the panel
const HEAD_H = 32, INSET = 18, ROW_H = 44, ROW_GAP = 10;
const ROW_W = COL_W - 2 * INSET;                                  // 196
const rowY = (i) => LIST_Y + HEAD_H + i * (ROW_H + ROW_GAP);
const LIST_H = HEAD_H + 4 * ROW_H + 3 * ROW_GAP + INSET;          // 256
const MID_Y = LIST_Y + LIST_H / 2;                                // the two frames and Kubelet share it
const HEAD_Y = LIST_Y + 21;                                       // the header baseline
// Keys in name order, the order the writer sorts them into (FormatMap in pkg/fieldpath).
const CLUSTER = 0, RACK = 1, ZONE = 2, NODE = 3;

const BOX_H = 80;
const KUBE_Y = MID_Y - BOX_H / 2;
// The running Pod over Kubelet on the centre line, 232 by 104 with a 192 by 44 app box (NET.L-01).
const POD_Y = 60, POD_H = 104, POD_B = POD_Y + POD_H, POD_MY = POD_Y + POD_H / 2;

// The three copies of the zone, stacked under Kubelet in the middle column.
const CHIP_H = 34, CHIP_GAP = 12, CHIPS_Y = KUBE_Y + BOX_H + 24;
const chipY = (i) => CHIPS_Y + i * (CHIP_H + CHIP_GAP);

// Each static wire and its ball share one array.
const W_GET = [[OBJ_R, MID_Y], [MID_X, MID_Y]];
const W_WRITE = [[MID_R, MID_Y], [FILE_X, MID_Y]];
const W_ENV = [[CX, KUBE_Y], [CX, POD_B]];
const W_READ = [[FILE_CX, LIST_Y], [FILE_CX, POD_MY], [MID_R, POD_MY]];

// Every ball rides routeDur, and every tag lives exactly as long as its ball (M-30a).
const riding = makeRidingLabel({ role: 'storage', inMs: 200, outMs: 200, hold: 0 });
// The two horizontal legs run between blocks taller than the lane gap, so both tags ride above the
// Kubelet top: the get tag trails right of its ball, the write tag leads left of it.
const GET_TAG = { fn: riding, dx: 40, dy: -50 };
const WRITE_TAG = { fn: riding, dx: -40, dy: -50 };
// The env leg climbs between two 232 wide blocks on its own axis, so the tag rides beside them,
// its left end 8 right of the column face at 716 (94.4 wide at 1280x860).
const ENV_TAG = { fn: riding, dx: 172, dy: 0 };
const READ_TAG = { fn: riding, dx: 50, dy: -20 };

const row = (key, x, i, label, opacity) => P.box({ key, x: x + INSET, y: rowY(i), w: ROW_W, h: ROW_H, label, opacity });

// Z-order (bottom -> top): the two frames and their rows, the Pod, Kubelet, the lanes, the
// headers, the chips, then the packet layer.
export const SCENE = {
  'aria-label': 'Downward API volume: Pod api-0 carries the labels cluster, rack and zone. Kubelet on Node-1 gets the Pod object and, before the container starts, writes a downwardAPI volume whose labels file holds the whole labels map, one key="value" line per label. It then starts the container with ZONE and NODE_NAME as environment variables, resolved once. When the zone label changes to west, Kubelet rewrites the labels file and the app reads west, while ZONE in the environment still says east until the container restarts. Fields such as spec.nodeName, status.podIP, status.hostIP and spec.serviceAccountName reach a container only as env, the whole labels or annotations map only as a file, and a single key either way.',
  parts: [
    P.defs(),
    P.box({ key: 'objBox', x: OBJ_X, y: LIST_Y, w: COL_W, h: LIST_H }),
    row('oCluster', OBJ_X, CLUSTER, 'cluster: prod'),
    row('oRack', OBJ_X, RACK, 'rack: r22'),
    row('oZone', OBJ_X, ZONE, 'zone: east'),
    row('oNode', OBJ_X, NODE, 'spec.nodeName: Node-1'),
    P.box({ key: 'fileBox', x: FILE_X, y: LIST_Y, w: COL_W, h: LIST_H, opacity: 0 }),
    row('fCluster', FILE_X, CLUSTER, 'cluster="prod"', 0),
    row('fRack', FILE_X, RACK, 'rack="r22"', 0),
    row('fZone', FILE_X, ZONE, 'zone="east"', 0),
    P.box({ key: 'fNone', x: FILE_X + INSET, y: rowY(NODE), w: ROW_W, h: ROW_H, label: 'No nodeName line', sublabel: 'env only', opacity: 0 }),
    P.pod({
      key: 'pod', innerKey: 'appBox', x: MID_X, y: POD_Y, w: COL_W, h: POD_H,
      label: 'Pod api-0', sublabel: 'mounts /etc/podinfo',
      inner: { dx: 20, dy: 26, w: COL_W - 40, h: 44, label: 'app', sublabel: 'not started' },
    }),
    P.box({ key: 'kubelet', x: MID_X, y: KUBE_Y, w: COL_W, h: BOX_H, label: 'Kubelet', sublabel: 'on Node-1' }),
    P.lane({ key: 'wGet', points: W_GET, dashed: true, dim: true }),
    P.lane({ key: 'wWrite', points: W_WRITE, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wEnv', points: W_ENV, dashed: true, dim: true }),
    P.lane({ key: 'wRead', points: W_READ, dashed: true, dim: true, opacity: 0 }),
    P.tag({ cls: 'scheme-label code', x: OBJ_CX, y: HEAD_Y, text: 'Pod api-0 object' }),
    P.tag({ key: 'fileHead', cls: 'scheme-label code', x: FILE_CX, y: HEAD_Y, text: '/etc/podinfo/labels', opacity: 0 }),
    P.chip({ key: 'objChip', x: MID_X, y: chipY(0), w: COL_W, h: CHIP_H, name: 'object zone', value: 'east' }),
    P.chip({ key: 'fileChip', x: MID_X, y: chipY(1), w: COL_W, h: CHIP_H, name: 'file zone', value: 'no file' }),
    P.chip({ key: 'envChip', x: MID_X, y: chipY(2), w: COL_W, h: CHIP_H, name: 'env ZONE', value: 'unset' }),
    P.packets(),
  ],
  reset: {
    keys: ['objBox', 'oZone', 'oNode', 'fileBox', 'fZone', 'fNone', 'kubelet', 'objChip', 'fileChip', 'envChip'],
    pods: ['pod'],
  },
};

// STO.S-01 as a field: the file frame, its rows, its header and both of its lanes are born together
// on the write (STO.S-02, A-14), and the empty-slot caption only on the last step.
const stage = (o) => ({
  fileBox: 0, fileHead: 0, fCluster: 0, fRack: 0, fZone: 0, fNone: 0, wWrite: 0, wRead: 0, ...o,
});
const NO_FILE = stage({});
const FILE = stage({ fileBox: 1, fileHead: 1, fCluster: 1, fRack: 1, fZone: 1, wWrite: 1, wRead: 1 });
const SPLIT = { ...FILE, fNone: 1 };

const C_START = { objChip: 'east', fileChip: 'no file', envChip: 'unset' };
const C_FILE = { ...C_START, fileChip: 'east' };
const C_ENV = { ...C_FILE, envChip: 'east' };
const C_RELABEL = { ...C_ENV, objChip: 'west' };
const C_REWRITE = { ...C_RELABEL, fileChip: 'west' };
const L_EAST = { oZone: 'zone: east', fZone: 'zone="east"' };
const L_RELABEL = { oZone: 'zone: west', fZone: 'zone="east"' };
const L_WEST = { oZone: 'zone: west', fZone: 'zone="west"' };
const APP_IDLE = { appBox: 'not started' };
const APP_ENV = { appBox: 'ZONE=east NODE_NAME=Node-1' };
const SHOW = (target) => ({ target, from: 0, to: 1, dur: 300, fill: 'forwards', easing: 'ease-out' });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: C_START,
    labels: L_EAST,
    sublabels: APP_IDLE,
    opacity: NO_FILE,
  },
  {
    id: 'get',
    duration: 3600,
    narration: 'Pod api-0 asks for its labels two ways: a downwardAPI volume whose labels file takes fieldRef metadata.labels, and an env var ZONE that takes the zone key alone. NODE_NAME takes spec.nodeName. Kubelet on Node-1 gets the Pod object bound to its Node.',
    chips: C_START,
    labels: L_EAST,
    sublabels: APP_IDLE,
    opacity: NO_FILE,
    lit: ['objBox'],
    flow: [
      F.route({ points: W_GET, delay: BEAT.lead, name: 'get', lights: ['kubelet'] }),
      F.tag({ text: 'Pod api-0', points: W_GET, delay: BEAT.lead, ...GET_TAG }),
    ],
  },
  {
    id: 'write',
    duration: 3200,
    narration: 'Before the container starts, Kubelet writes the volume. /etc/podinfo/labels holds the whole labels map, one key="value" line per label, which is something no single env var can carry.',
    chips: C_FILE,
    labels: L_EAST,
    sublabels: APP_IDLE,
    opacity: FILE,
    rewind: { chips: C_START, opacity: NO_FILE },
    lit: ['kubelet'],
    flow: [
      // The frame and its lane appear together before the write leaves (STO.S-02, A-15).
      F.fade({ ...SHOW('fileBox') }),
      F.fade({ ...SHOW('fileHead') }),
      F.fade({ ...SHOW('wWrite') }),
      F.route({ points: W_WRITE, delay: BEAT.lead, name: 'write', lights: ['fileBox'] }),
      F.tag({ text: 'labels file', points: W_WRITE, delay: BEAT.lead, ...WRITE_TAG }),
      // The lines exist once the write lands, and the read lane with them.
      F.fade({ ...SHOW('fCluster'), at: 'write' }),
      F.fade({ ...SHOW('fRack'), at: 'write' }),
      F.fade({ ...SHOW('fZone'), at: 'write' }),
      F.fade({ ...SHOW('wRead'), at: 'write' }),
      F.set({ at: 'write', chips: C_FILE }),
      F.light({ targets: ['fileChip'], at: 'write' }),
    ],
  },
  {
    id: 'start',
    duration: 3600,
    narration: 'Kubelet starts the app container and hands it ZONE=east and NODE_NAME=Node-1 as environment variables, resolved once as the container is created. The app now holds the zone twice, in its environment and in the labels file.',
    chips: C_ENV,
    labels: L_EAST,
    sublabels: APP_ENV,
    opacity: FILE,
    rewind: { chips: C_FILE, sublabels: APP_IDLE },
    lit: ['kubelet'],
    flow: [
      F.route({ points: W_ENV, delay: BEAT.lead, name: 'env' }),
      F.tag({ text: 'ZONE, NODE_NAME', points: W_ENV, delay: BEAT.lead, ...ENV_TAG }),
      F.pulse({ pod: 'pod', at: 'env' }),
      F.set({ at: 'env', chips: C_ENV, sublabels: APP_ENV }),
      F.light({ targets: ['envChip'], at: 'env' }),
    ],
  },
  {
    id: 'relabel',
    duration: 3200,
    narration: 'Someone changes the label zone to west on the Pod object. A label change does not restart the container. Kubelet watches the Pods bound to Node-1, so the new object reaches it.',
    chips: C_RELABEL,
    labels: L_RELABEL,
    sublabels: APP_ENV,
    opacity: FILE,
    lit: ['objBox', 'oZone', 'objChip'],
    flow: [
      F.route({ points: W_GET, delay: BEAT.lead, name: 'get', lights: ['kubelet'] }),
      F.tag({ text: 'zone: west', points: W_GET, delay: BEAT.lead, ...GET_TAG }),
    ],
  },
  {
    id: 'rewrite',
    duration: 4800,
    narration: 'Kubelet rewrites the labels file and swaps it in through a ..data symlink, the way a ConfigMap volume is updated, so a read after the swap returns zone="west". ZONE in the environment still says east, and nothing changes it short of a container restart.',
    chips: C_REWRITE,
    labels: L_WEST,
    sublabels: APP_ENV,
    opacity: FILE,
    rewind: { chips: C_RELABEL, labels: L_RELABEL },
    lit: ['kubelet'],
    flow: [
      F.route({ points: W_WRITE, delay: BEAT.lead, name: 'write', lights: ['fileBox', 'fZone'] }),
      F.tag({ text: 'zone="west"', points: W_WRITE, delay: BEAT.lead, ...WRITE_TAG }),
      F.set({ at: 'write', chips: C_REWRITE, labels: L_WEST }),
      F.light({ targets: ['fileChip'], at: 'write' }),
      F.route({ points: W_READ, after: 'write', plus: 400, name: 'read' }),
      F.tag({ text: 'zone="west"', points: W_READ, after: 'write', plus: 400, ...READ_TAG }),
      F.pulse({ pod: 'pod', at: 'read' }),
    ],
  },
  {
    id: 'split',
    duration: 3800,
    narration: 'Not every field goes both ways. Fields such as spec.nodeName, status.podIP, status.hostIP and spec.serviceAccountName reach a container only as env, so the file has no line for them. The whole labels or annotations map reaches it only as a file, and a single key goes either way.',
    chips: C_REWRITE,
    labels: L_WEST,
    sublabels: APP_ENV,
    opacity: SPLIT,
    rewind: { opacity: FILE },
    lit: ['oNode', 'fNone'],
    // The nodeName row lights first, then the empty slot beside it takes its caption.
    flow: [F.fade({ ...SHOW('fNone'), delay: BEAT.lead })],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
