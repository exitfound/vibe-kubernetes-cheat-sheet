import { P, F, defineCard, BEAT, OPACITY, FADE, chipStrip, makeRidingLabel } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-hostpath.md


// Catalog sizes: actor blocks 232 by 80, Pods 232 by 104 with a 192 by 44 app box.
const BLK_W = 232, BLK_H = 80, POD_W = 232, POD_H = 104;

// Two chip rows centred on the whole scheme (600): the premise `type` alone on top, right of the
// panel, and the three outcomes it decides under it, which reach left of x 397 and so sit below the
// deepest panel, 180.12 at 1100x800 (the record's PANEL line).
const CX = 600, CHIP_H = 34, CHIP_GAP = 12;
const CHIP_ROW_Y = 192;                                                // 192..226, 12 under the panel
const CHIP_TOP_Y = CHIP_ROW_Y - CHIP_GAP - CHIP_H;                     // 146..180
const CH = chipStrip({ cx: CX, w: 168, count: 3 });                    // 332..868
const TYPE_W = 232;                                                    // 484..716

// Two Nodes of unequal width under the chips: Node-1 carries the whole mount path (the runtime, the
// Kubelet, the Pod and four cells of its own filesystem), Node-2 only what the replacement meets.
const ROW_GAP = 32;
const NODE_Y = CHIP_ROW_Y + CHIP_H + 16;                               // 242
const NODE_H = 32 + POD_H + 2 * (ROW_GAP + BLK_H) + 24;                 // 372, to 614
const N1_X = 40, N1_W = 704, N2_X = 784, N2_W = 1160 - 784;            // 40..744 / 784..1160
const N2_CX = N2_X + N2_W / 2;                                         // 972

const POD_Y = NODE_Y + 32, POD_BOTTOM = POD_Y + POD_H;                 // 274..378
const CRI_Y = POD_Y + (POD_H - BLK_H) / 2;                             // 286, centred on the Pod
const MID_Y = CRI_Y + BLK_H + ROW_GAP;                                 // 398
const LEFT_X = N1_X + 32;                                              // 72
const POD_1_X = N1_X + N1_W - 32 - POD_W;                              // 480..712
const POD_1_CX = POD_1_X + POD_W / 2;                                  // 596
const POD_2_X = N2_CX - POD_W / 2;                                     // 856..1088

// The Node filesystem as a row of path cells. The directory a Pod mounts is a catalog block
// under that Pod's centre on both Nodes. The three system paths on Node-1 share what is left
// of the frame on one 16 gap (the SIZES line).
const CELL_H = BLK_H, CELL_Y = MID_Y + BLK_H + ROW_GAP;                // 510..590
const SYS_GAP = 16;
const SYS_W = (POD_1_X - LEFT_X - 3 * SYS_GAP) / 3;                    // 120
const SYS_X = (i) => LEFT_X + i * (SYS_W + SYS_GAP);                   // 72 / 208 / 344

// Lanes, each in its one traffic direction. The check and the mount are an L-12 pair on the
// /data/app top face, 24 either side of its midpoint, so the check turns down with one corner.
const PAIR_D = 24;
const CRI = [[LEFT_X + BLK_W / 2, MID_Y], [LEFT_X + BLK_W / 2, CRI_Y + BLK_H]];
const BIND = [[LEFT_X + BLK_W, CRI_Y + BLK_H / 2], [POD_1_X, CRI_Y + BLK_H / 2]];
const CHECK_1 = [[LEFT_X + BLK_W, MID_Y + BLK_H / 2], [POD_1_CX - PAIR_D, MID_Y + BLK_H / 2], [POD_1_CX - PAIR_D, CELL_Y]];
const MOUNT = [[POD_1_CX + PAIR_D, POD_BOTTOM], [POD_1_CX + PAIR_D, CELL_Y]];
const CHECK_2 = [[N2_CX, MID_Y + BLK_H], [N2_CX, CELL_Y]];

// The two writes ride LEG_DUR: on routeDur the 132 unit leg sits on the 700ms floor and its tag
// retires unread. Every tag lives exactly as long as its ball (M-30a), emerging clear of its sender.
const LEG_DUR = 1200;
const tagFn = makeRidingLabel({ role: 'storage', inMs: 200, outMs: 200, hold: 0, emergeMode: true });
const CHECK_TAG = { dx: 0, dy: -16, emerge: 150, fn: tagFn };
const CRI_TAG = { dx: 176, dy: 0, emerge: 0, fn: tagFn };
const BIND_TAG = { dx: 0, dy: -16, emerge: 250, fn: tagFn };
const WRITE_TAG = { dur: LEG_DUR, dx: 48, dy: 0, emerge: 300, fn: tagFn };

const blk = (key, x, y, label, sublabel) => P.box({ key, x, y, w: BLK_W, h: BLK_H, label, sublabel });
const cell = (key, x, w, label, sublabel) => P.box({ key, x, y: CELL_Y, w, h: CELL_H, label, sublabel });
const pod = (key, x, label, sublabel) => P.pod({
  key, shellKey: `${key}Shell`, innerKey: `${key}Box`, x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel,
  inner: { dx: 20, dy: 34, w: POD_W - 40, h: 44, label: 'app', sublabel: 'mountPath /cache' },
});
const chip = (key, i, name, value) => P.chip({ key, x: CH.x(i), y: CHIP_ROW_Y, w: CH.w, h: CHIP_H, name, value });

// Z-order (bottom -> top): the two frames, the blocks, the path cells, the lanes, the chips, then
// the packet layer.
export const SCENE = {
  'aria-label': 'hostPath across two Nodes: Pod app asks for hostPath /data/app with type Directory, mounted at /cache, and lands on Node-1. The Kubelet checks that /data/app exists on Node-1, then asks containerd to create the container, which starts with the directory bind-mounted at /cache. The app writes cache.db, which lands straight on the Node-1 disk, and grows it to 8Gi while the ephemeral-storage limit of 1Gi counts none of it. Deleting the Pod leaves cache.db on Node-1. The replacement Pod app-2 lands on Node-2, where /data/app does not exist, so the check fails with FailedMount and the Pod stays in ContainerCreating. The volume spec itself limits no path: /var/lib/kubelet holds the Secret volumes of the Pods on Node-1 and the containerd socket hands out root on it, so the Baseline and Restricted Pod Security Standards forbid hostPath.',
  parts: [
    P.defs(),
    P.node({ x: N1_X, y: NODE_Y, w: N1_W, h: NODE_H, label: 'Node-1' }),
    P.node({ x: N2_X, y: NODE_Y, w: N2_W, h: NODE_H, label: 'Node-2' }),
    blk('criBox', LEFT_X, CRI_Y, 'containerd', 'container runtime'),
    blk('kubeletBox', LEFT_X, MID_Y, 'Kubelet', 'hostPath type check'),
    pod('app', POD_1_X, 'Pod app', ''),
    pod('app2', POD_2_X, 'Pod app-2', 'replacement'),
    blk('kubelet2Box', POD_2_X, MID_Y, 'Kubelet', 'hostPath type check'),
    cell('logCell', SYS_X(0), SYS_W, '/var/log', 'Node logs'),
    cell('kubeCell', SYS_X(1), SYS_W, '/var/lib/kubelet', 'Pod volumes'),
    cell('sockCell', SYS_X(2), SYS_W, 'containerd.sock', 'runtime API'),
    cell('dataCell', POD_1_X, POD_W, '/data/app', 'directory'),
    cell('data2Cell', POD_2_X, POD_W, '/data/app', 'does not exist'),
    P.lane({ key: 'lCri', points: CRI, dashed: true, dim: true }),
    P.lane({ key: 'lBind', points: BIND, dashed: true, dim: true }),
    P.lane({ key: 'lCheck', points: CHECK_1, dashed: true, dim: true }),
    P.lane({ key: 'lMount', points: MOUNT, dashed: true, dim: true }),
    P.lane({ key: 'lCheck2', points: CHECK_2, dashed: true, dim: true }),
    P.chip({ key: 'typeChip', x: CX - TYPE_W / 2, y: CHIP_TOP_Y, w: TYPE_W, h: CHIP_H, name: 'type', value: 'Directory' }),
    chip('n1Chip', 0, 'Node-1', 'unchecked'),
    chip('ephChip', 1, 'counted', '0 of 1Gi'),
    chip('n2Chip', 2, 'Node-2', 'no Pod'),
    P.packets(),
  ],
  reset: {
    keys: ['criBox', 'kubeletBox', 'appShell', 'appBox', 'app2Shell', 'app2Box', 'kubelet2Box',
      'logCell', 'kubeCell', 'sockCell', 'dataCell', 'data2Cell',
      'typeChip', 'n1Chip', 'ephChip', 'n2Chip'],
    pods: ['app', 'app2'],
  },
};

// STO.S-01 and A-16 as one factory. A lane is live only while both of its ends are: the bind and
// the mount die with Pod app, the Node-2 check lives with Pod app-2. The missing Node-2 directory
// is drawn at the notready weight throughout, since there is nothing there to be at full.
const stage = ({ app = 1, mount = 0, app2 = 0 } = {}) => ({
  app, app2, lCri: 1, lCheck: 1, lBind: app === 1 ? 1 : 0, lMount: app === 1 ? mount : 0,
  lCheck2: app2 === 1 ? 1 : 0, data2Cell: OPACITY.notready,
});

// Every step states every face a step rewrites: the /data/app sublabel, the two cells the last
// step relabels, and the Pod app-2 status.
const faces = (data, { reach = false, app2 = 'replacement' } = {}) => ({
  sublabels: {
    dataCell: data, kubeCell: reach ? 'Pod Secrets' : 'Pod volumes',
    sockCell: reach ? 'root on Node' : 'runtime API',
  },
  podSublabels: { app2 },
});
const TYPE = { typeChip: 'Directory' };
// A Pod that sends or receives lights as ONE unit, shell and app box, and holds it steady. It does
// not also pulse: a blink starts from the unlit base, so on a lit Pod it reads as a dip.
const POD_APP = ['appShell', 'appBox'];
const fadeIn = (target, delay, extra = {}) =>
  F.fade({ target, from: 0, to: 1, dur: FADE.in, delay, easing: 'ease-out', ...extra });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: { ...TYPE, n1Chip: 'unchecked', ephChip: '0 of 1Gi', n2Chip: 'no Pod' },
    opacity: stage(),
    ...faces('directory'),
  },
  {
    id: 'check',
    duration: 3200,
    narration: 'Pod app asks for hostPath /data/app, type Directory, mounted at /cache, and lands on Node-1. Before any container starts, the Kubelet checks the path on Node-1: Directory means it must already exist there, and it does.',
    chips: { n1Chip: 'dir exists' },
    chipsCued: { ...TYPE, ephChip: '0 of 1Gi', n2Chip: 'no Pod' },
    opacity: stage(),
    lit: ['kubeletBox'],
    rewind: { chips: { n1Chip: 'unchecked' } },
    ...faces('directory'),
    // The Pod blinks as the one being set up, then the Kubelet, lit from entry, sends the check.
    flow: [
      F.pulse({ pod: 'app' }),
      F.route({ points: CHECK_1, delay: BEAT.afterPulse, name: 'c', lights: ['dataCell'] }),
      F.tag({ text: 'type check', points: CHECK_1, delay: BEAT.afterPulse, ...CHECK_TAG }),
      F.set({ at: 'c', chips: { n1Chip: 'dir exists' }, lights: ['n1Chip'] }),
    ],
  },
  {
    id: 'bind',
    duration: 4600,
    narration: 'The Kubelet asks containerd to create the app container with that mount, and the container starts with /data/app of Node-1 bind-mounted at /cache. It is one directory under two names: nothing is copied into the Pod.',
    chips: { n1Chip: 'at /cache' },
    chipsCued: { ...TYPE, ephChip: '0 of 1Gi', n2Chip: 'no Pod' },
    opacity: stage({ mount: 1 }),
    lit: ['kubeletBox'],
    rewind: { chips: { n1Chip: 'dir exists' }, opacity: { lMount: 0 } },
    ...faces('directory'),
    // Two hops: the request up to the runtime, then the runtime starts the container with the
    // mount, and the mount lane appears as the Pod blinks on arrival.
    flow: [
      F.route({ points: CRI, delay: BEAT.lead, name: 'r', lights: ['criBox'] }),
      F.tag({ text: 'CreateContainer', points: CRI, delay: BEAT.lead, ...CRI_TAG }),
      F.route({ points: BIND, after: 'r', name: 'b' }),
      F.tag({ text: 'mount /cache', points: BIND, after: 'r', ...BIND_TAG }),
      F.light({ targets: POD_APP, at: 'b' }),
      fadeIn('lMount', 0, { at: 'b', lights: ['dataCell'] }),
      F.set({ at: 'b', chips: { n1Chip: 'at /cache' }, lights: ['n1Chip'] }),
    ],
  },
  {
    id: 'write',
    duration: 3200,
    narration: 'The app writes cache.db to /cache. No copy sits in between, so the file lands straight in /data/app on the Node-1 disk, where the Node sees it at once.',
    chips: { n1Chip: 'cache.db' },
    chipsCued: { ...TYPE, ephChip: '0 of 1Gi', n2Chip: 'no Pod' },
    opacity: stage({ mount: 1 }),
    rewind: { chips: { n1Chip: 'at /cache' }, sublabels: { dataCell: 'directory' } },
    lit: POD_APP,
    ...faces('cache.db'),
    flow: [
      F.route({ points: MOUNT, delay: BEAT.lead, dur: LEG_DUR, name: 'w', lights: ['dataCell'] }),
      F.tag({ text: 'cache.db', points: MOUNT, delay: BEAT.lead, ...WRITE_TAG }),
      F.set({ at: 'w', chips: { n1Chip: 'cache.db' }, sublabels: { dataCell: 'cache.db' }, lights: ['n1Chip'] }),
    ],
  },
  {
    id: 'uncounted',
    duration: 3400,
    narration: 'The Pod has an ephemeral-storage limit of 1Gi, yet cache.db grows to 8Gi and nothing stops it: hostPath usage is not counted as ephemeral storage. Only the Node-1 disk fills, which can put the whole Node under disk pressure.',
    chips: { n1Chip: 'cache.db 8Gi' },
    chipsCued: { ...TYPE, ephChip: '0 of 1Gi', n2Chip: 'no Pod' },
    opacity: stage({ mount: 1 }),
    rewind: { chips: { n1Chip: 'cache.db' }, sublabels: { dataCell: 'cache.db' } },
    lit: POD_APP,
    ...faces('cache.db 8Gi'),
    // The same write lane, a bigger payload. The counter lights with its value unchanged.
    flow: [
      F.route({ points: MOUNT, delay: BEAT.lead, dur: LEG_DUR, name: 'w', lights: ['dataCell'] }),
      F.tag({ text: '+8Gi', points: MOUNT, delay: BEAT.lead, ...WRITE_TAG }),
      F.set({ at: 'w', chips: { n1Chip: 'cache.db 8Gi' }, sublabels: { dataCell: 'cache.db 8Gi' }, lights: ['n1Chip', 'ephChip'] }),
    ],
  },
  {
    id: 'delete',
    duration: 2800,
    narration: 'Pod app is deleted. The Kubelet has containerd stop the container, and its bind mount goes with it, but hostPath teardown deletes nothing, so /data/app and cache.db stay on Node-1 after the Pod is gone.',
    chips: { n1Chip: 'cache.db kept', ephChip: 'Pod gone' },
    chipsCued: { ...TYPE, n2Chip: 'no Pod' },
    opacity: stage({ app: OPACITY.terminated }),
    lit: ['kubeletBox', 'dataCell'],
    rewind: { chips: { n1Chip: 'cache.db 8Gi', ephChip: '0 of 1Gi' } },
    ...faces('cache.db 8Gi'),
    // The Pod blinks at full first (M-08), the Kubelet asks the runtime to remove its container, and
    // the Pod goes with its bind and mount as that request lands.
    flow: [
      F.pulse({ pod: 'app' }),
      F.route({ points: CRI, delay: BEAT.afterPulse, name: 'rm', lights: ['criBox'] }),
      F.tag({ text: 'StopContainer', points: CRI, delay: BEAT.afterPulse, ...CRI_TAG }),
      F.fade({ target: 'app', from: 1, to: OPACITY.terminated, dur: FADE.out, at: 'rm' }),
      ...['lBind', 'lMount'].map(target => F.fade({ target, from: 1, to: 0, dur: FADE.out, at: 'rm' })),
      F.set({ at: 'rm', chips: { n1Chip: 'cache.db kept', ephChip: 'Pod gone' }, lights: ['n1Chip', 'ephChip'] }),
    ],
  },
  {
    id: 'elsewhere',
    duration: 4400,
    narration: 'Its replacement, Pod app-2, lands on Node-2: hostPath ties no Pod to a Node. There is no /data/app on Node-2, so the Kubelet check fails with FailedMount and app-2 stays in ContainerCreating. DirectoryOrCreate would start it empty.',
    chips: { n2Chip: 'FailedMount' },
    chipsCued: { ...TYPE, n1Chip: 'cache.db kept', ephChip: 'Pod gone' },
    opacity: stage({ app: OPACITY.terminated, app2: 1 }),
    lit: ['kubelet2Box'],
    rewind: { chips: { n2Chip: 'no Pod' }, podSublabels: { app2: 'replacement' } },
    ...faces('cache.db 8Gi', { app2: 'ContainerCreating' }),
    // The Pod arrives with its check lane, the Kubelet there checks, and the failure lands on it.
    flow: [
      fadeIn('app2', 0, { name: 'in' }),
      fadeIn('lCheck2', 0),
      F.route({ points: CHECK_2, at: 'in', plus: BEAT.afterHop, name: 'c', lights: ['data2Cell'] }),
      F.light({ targets: ['app2Shell', 'app2Box'], at: 'c' }),
      F.set({
        at: 'c', chips: { n2Chip: 'FailedMount' }, podSublabels: { app2: 'ContainerCreating' }, lights: ['n2Chip'],
      }),
    ],
  },
  {
    id: 'reach',
    duration: 2400,
    narration: 'The hostPath spec limits no path. On Node-1, /var/lib/kubelet holds the Secret volumes of its Pods and containerd.sock hands out root. So Baseline and Restricted Pod Security Standards forbid hostPath: it is for Node agents such as log readers.',
    chipsCued: { ...TYPE, n1Chip: 'cache.db kept', ephChip: 'Pod gone', n2Chip: 'FailedMount' },
    opacity: stage({ app: OPACITY.terminated, app2: 1 }),
    ...faces('cache.db 8Gi', { reach: true, app2: 'ContainerCreating' }),
    // No packet: the three other paths of the same filesystem light together.
    flow: [
      F.light({ targets: ['logCell', 'kubeCell', 'sockCell'], delay: 300 }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
