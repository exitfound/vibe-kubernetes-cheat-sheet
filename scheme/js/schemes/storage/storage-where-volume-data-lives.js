import { FADE, P, F, defineCard, BEAT, OPACITY, makeRidingLabel } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-where-volume-data-lives.md


// Three tiers by distance from the process: the Pod, the homes ON the Node inside its frame, the
// homes OFF the Node below it. The frame is the lifetime boundary the node-lost step makes visible.
const POD_CX = 790;
// The Pod stands 34 under the frame top, and the disk caption ends 12 over its floor: the catalog
// frame padding.
const NODE_X = 410, NODE_Y = 16, NODE_W = 760, NODE_H = 424;
const POD_W = 720, POD_H = 120, POD_X = POD_CX - POD_W / 2, POD_Y = NODE_Y + 34;
const POD_BOTTOM = POD_Y + POD_H;

// Six lanes leave the Pod floor at three mirrored pairs about POD_CX (L-12), and every home is
// centred on its lane: the disk on its pair, Kubelet on its own.
const OFF_OUT = 280, OFF_MID = 190, OFF_IN = 77;
const WR_LX = POD_CX - OFF_OUT;  // writable layer
const DATA_LX = POD_CX - OFF_MID;  // the data corridor down to remote storage
const SCR_LX = POD_CX - OFF_IN;  // Node RAM
const CFG_LX = POD_CX + OFF_IN;  // Kubelet and the API server under it
const CACHE_LX = POD_CX + OFF_MID;  // Node disk, left of the disk pair
const LOGS_LX = POD_CX + OFF_OUT;  // Node disk, right of the disk pair

// The homes are 80 tall (NET.L-01) and one width.
const HOME_Y = 322, HOME_H = 80, HOME_BOTTOM = HOME_Y + HOME_H;
const HOME_W = 120;
const WR_W = HOME_W, RAM_W = HOME_W, KUBE_W = HOME_W, DISK_W = HOME_W;
const DISK_CX = (CACHE_LX + LOGS_LX) / 2;  // the pair centre
const WR_X = WR_LX - WR_W / 2, RAM_X = SCR_LX - RAM_W / 2;
const KUBE_X = CFG_LX - KUBE_W / 2, DISK_X = DISK_CX - DISK_W / 2;

const OFF_Y = 484;                                                        // the tier below the frame
const REMOTE_W = 180, REMOTE_H = 90, API_W = 232, API_H = 80;

// The lifetime ledger: four chips in ONE column in the free zone under the panel, the second axis.
// Its last row ends level with the Network storage floor, so the two bottoms share one line.
const LEDGER_X = 60, LEDGER_W = 320, CHIP_H = 34, CHIP_GAP = 10, ROWS = 4;
const LEDGER_Y = OFF_Y + REMOTE_H - (ROWS * CHIP_H + (ROWS - 1) * CHIP_GAP);
const ROW_Y = i => LEDGER_Y + i * (CHIP_H + CHIP_GAP);
// A right-angle relation ties the ledger to the Node it reads: up from the column centre, then
// right into the midpoint of the frame's left wall, captioned just above its run.
const LEDGER_CX = LEDGER_X + LEDGER_W / 2;
const REL_Y = NODE_Y + NODE_H / 2, CAP_CX = (LEDGER_CX + NODE_X) / 2;
const L_LEDGER = [[LEDGER_CX, LEDGER_Y], [LEDGER_CX, REL_Y], [NODE_X, REL_Y]];

const L_WR    = [[WR_LX, POD_BOTTOM], [WR_LX, HOME_Y]];
const L_DATA  = [[DATA_LX, POD_BOTTOM], [DATA_LX, OFF_Y]];
const L_SCR   = [[SCR_LX, POD_BOTTOM], [SCR_LX, HOME_Y]];
const L_API   = [[CFG_LX, OFF_Y], [CFG_LX, HOME_BOTTOM]];                 // API server -> Kubelet
const L_CFG   = [[CFG_LX, HOME_Y], [CFG_LX, POD_BOTTOM]];                 // Kubelet -> Pod
const L_CACHE = [[CACHE_LX, POD_BOTTOM], [CACHE_LX, HOME_Y]];
const L_LOGS  = [[LOGS_LX, POD_BOTTOM], [LOGS_LX, HOME_Y]];

// Tags ride BESIDE their lane, never on it. Most ride above the ball, clear of the home a down ball
// lands on. ConfigMap rides level, as the API box and Kubelet cap its lane.
const tagAbove = makeRidingLabel({ role: 'storage', dy: -10, inMs: 200, outMs: 200, hold: 0 });
const tagLevel = makeRidingLabel({ role: 'storage', dy: 4, inMs: 200, outMs: 200, hold: 0 });

// The list order IS the append order, which is the z-order: the Node group (frame and the homes on
// the Node), then the Pod and the writable layer, then the homes off the Node, then the lanes and
// the disk caption, then the ledger, then the packet layer.
export const SCENE = {
  'aria-label': 'Where volume data lives: one Pod mounts five volumes. A write to a path no volume covers lands in the container writable layer and dies with the container. The emptyDir and hostPath volumes sit on the storage backing the Node, its disk here, and a Memory emptyDir in Node RAM. A ConfigMap is an API object, and Kubelet copies its keys into the Pod as files. Here a PersistentVolumeClaim is bound to network storage outside the Node. Deleting the Pod removes the emptyDirs and the copied files, losing the Node removes the hostPath, and only the ConfigMap and the claim data outlive both.',
  parts: [
    P.defs(),
    P.group({
      key: 'nodeG',
      parts: [
        P.node({ key: 'nodeFrame', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
        P.box({ key: 'ram', x: RAM_X, y: HOME_Y, w: RAM_W, h: HOME_H, label: 'Node RAM', sublabel: 'tmpfs: scratch' }),
        P.box({ key: 'kubelet', x: KUBE_X, y: HOME_Y, w: KUBE_W, h: HOME_H, label: 'Kubelet', sublabel: 'on Node-1' }),
        P.cylinder({ key: 'disk', x: DISK_X, y: HOME_Y, w: DISK_W, h: HOME_H, label: 'Node disk', labelY: HOME_H / 2 + 10 }),
      ],
    }),
    P.pod({
      key: 'pod', innerKey: 'appBox',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', containers: 0,
      inner: { dx: 24, dy: 34, w: POD_W - 48, h: 52, label: 'app', sublabel: 'mounts five volumes, writes /tmp/report' },
    }),
    // Outside nodeG: it already ghosts with the Pod, and a second ghost on top would erase it.
    P.box({ key: 'wr', x: WR_X, y: HOME_Y, w: WR_W, h: HOME_H, label: 'Writable layer', sublabel: 'app container' }),
    P.cylinder({ key: 'remote', x: DATA_LX - REMOTE_W / 2, y: OFF_Y, w: REMOTE_W, h: REMOTE_H, label: 'Network storage', labelY: REMOTE_H / 2 + 10 }),
    P.box({ key: 'api', x: CFG_LX - API_W / 2, y: OFF_Y, w: API_W, h: API_H, label: 'API server', sublabel: 'ConfigMap config' }),
    P.lane({ key: 'lWr', points: L_WR, dashed: true, dim: true }),
    P.lane({ key: 'lData', points: L_DATA, dashed: true, dim: true }),
    P.lane({ key: 'lScr', points: L_SCR, dashed: true, dim: true }),
    P.lane({ key: 'lApi', points: L_API, dashed: true, dim: true }),
    P.lane({ key: 'lCfg', points: L_CFG, dashed: true, dim: true }),
    P.lane({ key: 'lCache', points: L_CACHE, dashed: true, dim: true }),
    P.lane({ key: 'lLogs', points: L_LOGS, dashed: true, dim: true }),
    // What the disk holds right now, written per step: the cylinder face carries its name only.
    P.wire({ key: 'diskCap', x: DISK_CX, y: HOME_BOTTOM + 22 }),
    P.relation({ points: L_LEDGER }),
    P.tag({ key: 'ledgerHead', x: CAP_CX, y: REL_Y - 5, anchor: 'middle', text: 'lives as long as' }),
    P.chip({ key: 'ctrChip', x: LEDGER_X, y: ROW_Y(0), w: LEDGER_W, h: CHIP_H, name: 'container', value: 'none yet' }),
    P.chip({ key: 'podChip', x: LEDGER_X, y: ROW_Y(1), w: LEDGER_W, h: CHIP_H, name: 'Pod', value: 'none yet' }),
    P.chip({ key: 'nodeChip', x: LEDGER_X, y: ROW_Y(2), w: LEDGER_W, h: CHIP_H, name: 'Node', value: 'none yet' }),
    P.chip({ key: 'ownChip', x: LEDGER_X, y: ROW_Y(3), w: LEDGER_W, h: CHIP_H, name: 'API object', value: 'none yet' }),
    P.packets(),
  ],
  reset: {
    keys: ['wr', 'ram', 'kubelet', 'disk', 'remote', 'api', 'ctrChip', 'podChip', 'nodeChip', 'ownChip'],
    pods: ['pod'],
  },
};

// STO.S-01 as one literal: every step states the three things that ghost, and every lane. Lanes
// stay at full into a ghost block, except on node-lost, where they fade with the whole scheme.
const T = OPACITY.terminated;
const LANES = ['lWr', 'lData', 'lScr', 'lApi', 'lCfg', 'lCache', 'lLogs'];
const stage = ({ pod = 1, wr = 1, node = 1, lanes = 1 } = {}) => ({
  pod, wr, nodeG: node, ...Object.fromEntries(LANES.map(k => [k, lanes])),
});

const DISK_BOTH = 'cache, node-logs';
const WR_SUB = 'app container';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: { ctrChip: 'none yet', podChip: 'none yet', nodeChip: 'none yet', ownChip: 'none yet' },
    wires: { diskCap: '' },
    sublabels: { wr: WR_SUB, ram: 'tmpfs: scratch' },
    opacity: stage(),
  },
  {
    id: 'rootfs',
    duration: 3400,
    narration: 'The app writes /tmp/report, a path no volume covers, so the bytes land in the writable layer of its own container. That layer sits on the Node storage, here its disk, but it belongs to that one container and to nothing else. It is the shortest lived home on this map.',
    chipsCued: { ctrChip: 'writable layer', podChip: 'none yet', nodeChip: 'none yet', ownChip: 'none yet' },
    wires: { diskCap: '' },
    sublabels: { wr: WR_SUB, ram: 'tmpfs: scratch' },
    opacity: stage(),
    // Down-arrow out of the Pod: it blinks first, the write leaves on afterPulse and rides routeDur.
    flow: [
      F.pulse({ pod: 'pod' }),
      F.route({ points: L_WR, delay: BEAT.afterPulse, lights: ['wr'], tag: { text: '/tmp/report', fn: tagAbove, dx: -48 } }),
    ],
  },
  {
    id: 'node',
    duration: 3800,
    narration: 'Three volumes keep their bytes on the Node. The emptyDir cache and the hostPath node-logs are directories on its storage, here its disk. The emptyDir scratch sets medium Memory, a tmpfs in Node RAM, and what it holds counts against the memory limit of the container that writes it.',
    chipsCued: { ctrChip: 'writable layer', podChip: 'cache, scratch', nodeChip: 'node-logs', ownChip: 'none yet' },
    wires: { diskCap: DISK_BOTH },
    sublabels: { wr: WR_SUB, ram: 'tmpfs: scratch' },
    opacity: stage(),
    // Three writes on one beat: the lanes are far enough apart that the tags never meet.
    flow: [
      F.pulse({ pod: 'pod' }),
      F.route({ points: L_SCR, delay: BEAT.afterPulse, lights: ['ram'], tag: { text: 'scratch', fn: tagAbove, dx: 35 } }),
      F.route({ points: L_CACHE, delay: BEAT.afterPulse, lights: ['disk'], tag: { text: 'cache', fn: tagAbove, dx: -29 } }),
      F.route({ points: L_LOGS, delay: BEAT.afterPulse, tag: { text: 'node-logs', fn: tagAbove, dx: -42 } }),
    ],
  },
  {
    id: 'api',
    duration: 5600,
    narration: 'The config volume is a ConfigMap, an API object the API server stores in ETCD. Kubelet fetches it and writes each key into the Pod as a read-only file, so the app reads a copy. A Secret volume arrives the same way, into a tmpfs in RAM.',
    chipsCued: { ctrChip: 'writable layer', podChip: 'cache, scratch, config', nodeChip: 'node-logs', ownChip: 'ConfigMap' },
    wires: { diskCap: DISK_BOTH },
    sublabels: { wr: WR_SUB, ram: 'tmpfs: scratch' },
    opacity: stage(),
    // The API server acts first, so it is lit at entry and sends on BEAT.lead. Kubelet lights on
    // arrival and sends the files up one hop later, and the Pod blinks when they land.
    lit: ['api'],
    flow: [
      F.route({ points: L_API, delay: BEAT.lead, name: 'fetch', lights: ['kubelet'], tag: { text: 'ConfigMap', fn: tagLevel, dx: 42 } }),
      F.route({ points: L_CFG, after: 'fetch', tag: { text: 'config files', fn: tagAbove, dx: -49 }, pulse: 'pod' }),
    ],
  },
  {
    id: 'remote',
    duration: 3400,
    narration: 'The data volume is a PersistentVolumeClaim. Here the claim is bound to network storage, so its bytes live outside the Node entirely, reached over the network. Neither the Pod nor the Node owns that disk, and the data lasts at least as long as the claim that points at it.',
    chipsCued: { ctrChip: 'writable layer', podChip: 'cache, scratch, config', nodeChip: 'node-logs', ownChip: 'ConfigMap, PVC data' },
    wires: { diskCap: DISK_BOTH },
    sublabels: { wr: WR_SUB, ram: 'tmpfs: scratch' },
    opacity: stage(),
    flow: [
      F.pulse({ pod: 'pod' }),
      F.route({ points: L_DATA, delay: BEAT.afterPulse, lights: ['remote'], tag: { text: 'data', fn: tagAbove, dx: 25 } }),
    ],
  },
  {
    id: 'restart',
    duration: 3000,
    narration: 'The app container crashes and Kubelet restarts it. The new container gets a fresh writable layer, so /tmp/report is gone and it starts clean. All five volumes are untouched, because none of them belonged to the container.',
    chipsCued: { ctrChip: 'fresh writable layer', podChip: 'cache, scratch, config', nodeChip: 'node-logs', ownChip: 'ConfigMap, PVC data' },
    wires: { diskCap: DISK_BOTH },
    sublabels: { wr: 'new and empty', ram: 'tmpfs: scratch' },
    opacity: stage(),
    // Kubelet does the restart, so it is lit at entry. The old layer ghosts out and a fresh one
    // comes back in its place: the static end state is the new layer at full.
    lit: ['kubelet'],
    flow: [
      F.pulse({ pod: 'pod' }),
      F.fade({ target: 'wr', to: T, dur: FADE.out, fill: 'forwards' }),
      F.fade({ target: 'wr', from: T, to: 1, dur: 500, delay: 1100, fill: 'forwards', easing: 'ease-out' }),
    ],
  },
  {
    id: 'pod-deleted',
    duration: 3200,
    narration: 'Now the Pod is deleted. The emptyDir volumes cache and scratch are deleted with it, and the config files Kubelet wrote are removed. The ConfigMap object stays in the API server, the claim still holds its data, and node-logs stays on the Node disk.',
    chipsCued: { ctrChip: 'writable layer gone', podChip: 'cache, scratch, config gone', nodeChip: 'node-logs', ownChip: 'ConfigMap, PVC data' },
    wires: { diskCap: 'node-logs only' },
    sublabels: { wr: 'removed', ram: 'scratch deleted' },
    opacity: stage({ pod: T, wr: T }),
    // The Pod blinks BEFORE it goes (M-08), and the fades wait the blink out: the rewind puts the
    // animated path back at full to travel from. The two homes that outlive it light on entry.
    lit: ['api', 'remote'],
    rewind: { opacity: stage() },
    flow: [
      F.pulse({ pod: 'pod' }),
      F.fade({ target: 'pod', to: T, dur: FADE.out, delay: BEAT.afterPulse, fill: 'forwards' }),
      F.fade({ target: 'wr', to: T, dur: FADE.out, delay: BEAT.afterPulse, fill: 'forwards' }),
    ],
  },
  {
    id: 'node-lost',
    duration: 3200,
    narration: 'Finally the Node itself is lost, disk and all, and everything that lived on it goes too, node-logs included: a hostPath lasts only as long as that one Node disk. The ConfigMap and the claim data survive because they never lived on the Node. Where data lives decides how long it lives.',
    chipsCued: { ctrChip: 'writable layer gone', podChip: 'cache, scratch, config gone', nodeChip: 'node-logs lost', ownChip: 'ConfigMap, PVC data kept' },
    wires: { diskCap: '' },
    sublabels: { wr: 'removed', ram: 'scratch deleted' },
    opacity: stage({ pod: T, wr: T, node: T, lanes: T }),
    // The two homes outside the frame are the only survivors, so they are lit and stay at full.
    // Every lane fades with the Node, since each one ends on the ghosted Pod or the Node.
    lit: ['api', 'remote'],
    flow: [
      F.fade({ target: 'nodeG', to: T, dur: 900, fill: 'none' }),
      ...LANES.map(k => F.fade({ target: k, to: T, dur: 900, fill: 'none' })),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
