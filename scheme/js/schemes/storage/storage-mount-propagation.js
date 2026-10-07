import { P, F, defineCard, BEAT, OPACITY, STO } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-mount-propagation.md


// Three mount tables on one Node: Pod csi-node, the host, Pod A. Their rows share one pitch, so an
// entry the kernel repeats in another table crosses one straight corridor. The panel may cover the left edge.
const FRAME_W = 740;                                     // three tables, two corridors, frame pads
const FRAME_X = STO.CX - FRAME_W / 2, FRAME_R = FRAME_X + FRAME_W;
const PAD = 16;                                          // frame wall to the tables
const SHELL_W = 220, ROW_W = 180;                        // a Pod table, and the rows inside it
const ROW_IN = (SHELL_W - ROW_W) / 2;
const PLUG_X = FRAME_X + PAD;
const APP_X = FRAME_R - PAD - SHELL_W;
const HOST_CX = (FRAME_X + FRAME_R) / 2;                 // the host table between the Pods
const HOST_X = HOST_CX - ROW_W / 2;                      // so both corridors are equal
const PLUG_ROW_X = PLUG_X + ROW_IN, APP_ROW_X = APP_X + ROW_IN;

const FRAME_Y = 31;                                      // frame, caption and chip grid share this margin
const SHELL_Y = FRAME_Y + 34;                            // under the label band
const HDR_H = 40;                                        // the host table heading, level with the Pod labels
const ROW0_Y = SHELL_Y + 52;
const ROW_H = 64, ROW_GAP = 24, PITCH = ROW_H + ROW_GAP; // four rows on one pitch
const ROW_Y = (i) => ROW0_Y + i * PITCH;
const ROW_MY = (i) => ROW_Y(i) + ROW_H / 2;
const SHELL_H = ROW_Y(3) + ROW_H + 28 - SHELL_Y;         // the Pod sublabel under the last row
const FRAME_H = SHELL_Y + SHELL_H + 12 - FRAME_Y;        // the catalog floor under the Pods
const FRAME_B = FRAME_Y + FRAME_H;
const BRANCH_Y = FRAME_B + 28;                           // the step 5 counterfactual (T-35)
// The host root mount spans the first two rows, so the two peer links meet its face as a mirrored pair.
const ROOT_H = ROW_H * 2 + ROW_GAP;

// The chips stand two by two under the frame: four in one row do not fit its width.
const CHIP_GAP = 12, CHIP_COLS = 2;
const CHIP_X0 = HOST_CX - (STO.CHIP_W * CHIP_COLS + CHIP_GAP * (CHIP_COLS - 1)) / 2;
const CHIP_Y0 = BRANCH_Y + 16;
const CHIP_X = (i) => CHIP_X0 + (i % CHIP_COLS) * (STO.CHIP_W + CHIP_GAP);
const CHIP_Y = (i) => CHIP_Y0 + Math.floor(i / CHIP_COLS) * (STO.CHIP_H + CHIP_GAP);

// A lane leaves a row inside a Pod and crosses the Pod wall: an endpoint inside the shell is an
// arrival, not a crossing (render/geometry.test.mjs THROUGH).
const PLUG_R = PLUG_ROW_X + ROW_W;
const HOST_L = HOST_X, HOST_R = HOST_X + ROW_W;
const APP_L = APP_ROW_X;
const W_STAGE = [[PLUG_R, ROW_MY(2)], [HOST_L, ROW_MY(2)]];   // the staging entry repeated
const W_BIND = [[PLUG_R, ROW_MY(3)], [HOST_L, ROW_MY(3)]];    // the Pod bind entry repeated
const W_START = [[HOST_R, ROW_MY(3)], [APP_L, ROW_MY(3)]];    // the runtime binds it at /data
// The counterfactual ball rides the first leg of W_STAGE and stops on the Pod wall.
const W_STOP = [[PLUG_R, ROW_MY(2)], [PLUG_X + SHELL_W, ROW_MY(2)]];
const REL_PLUG = [[PLUG_R, ROW_MY(0)], [HOST_L, ROW_MY(0)]];
const REL_PODS = [[PLUG_R, ROW_MY(1)], [HOST_L, ROW_MY(1)]];

const row = (key, x, i, label, sublabel, h = ROW_H) => P.box({ key, x, y: ROW_Y(i), w: ROW_W, h, label, sublabel });

export const SCENE = {
  'aria-label': 'Mount namespaces on Node-1, drawn as three mount tables side by side: Pod csi-node, the CSI node plugin, on the left, the host where Kubelet and the runtime run in the middle, and Pod A on the right. The plugin volumeMounts set mountPropagation Bidirectional on /var/lib/kubelet/plugins and /var/lib/kubelet/pods, so the runtime binds both from the host root mount, shared on a systemd host, and all three are one peer group, shared:1. The staging mount of /dev/nvme1n1 and the bind mount into the Pod A directory are made inside the plugin and the kernel repeats both in the host table, which then lists /dev/nvme1n1 twice with no bytes copied. When the app container starts, the runtime gives it its own mount namespace and binds the host entry at /data, private because mountPropagation None is rprivate by default. If instead the plugin volumeMounts used None, its mounts would stay in its own table, the host table would get neither entry, and Pod A would get the empty host directory at /data.',
  parts: [
    P.defs(),
    P.node({ x: FRAME_X, y: FRAME_Y, w: FRAME_W, h: FRAME_H, label: 'Node-1' }),
    // A Pod is ONE group, shell and rows, so its pulse carries the whole table (M-03).
    P.group({
      key: 'plugPod',
      parts: [
        P.pod({ x: PLUG_X, y: SHELL_Y, w: SHELL_W, h: SHELL_H, label: 'Pod csi-node', sublabel: 'CSI node plugin, privileged', containers: 0 }),
        row('plugR0', PLUG_ROW_X, 0, '.../kubelet/plugins', 'shared:1'),
        row('plugR1', PLUG_ROW_X, 1, '.../kubelet/pods', 'shared:1'),
        row('plugR2', PLUG_ROW_X, 2, '.../globalmount', 'no entry yet'),
        row('plugR3', PLUG_ROW_X, 3, '.../uid-a/.../mount', 'no entry yet'),
      ],
    }),
    P.box({ key: 'hostHdr', x: HOST_X, y: SHELL_Y, w: ROW_W, h: HDR_H, label: 'Host namespace', sublabel: 'Kubelet, runtime' }),
    row('hostR01', HOST_X, 0, '/', 'host root, shared:1', ROOT_H),
    row('hostR2', HOST_X, 2, '.../globalmount', 'no entry yet'),
    row('hostR3', HOST_X, 3, '.../uid-a/.../mount', 'no entry yet'),
    P.group({
      key: 'appPod',
      parts: [
        P.pod({ key: 'appShell', x: APP_X, y: SHELL_Y, w: SHELL_W, h: SHELL_H, label: 'Pod A', sublabel: 'not started yet', containers: 0 }),
        row('appR0', APP_ROW_X, 0, '/', 'no namespace yet'),
        row('appR3', APP_ROW_X, 3, '/data', 'no namespace yet'),
      ],
    }),
    // Nothing rides a peer link: it says the two mounts are one peer group, so it has no arrowhead.
    P.relation({ key: 'relPlug', points: REL_PLUG }),
    P.relation({ key: 'relPods', points: REL_PODS }),
    P.lane({ key: 'wStage', points: W_STAGE, dashed: true, dim: true }),
    P.lane({ key: 'wBind', points: W_BIND, dashed: true, dim: true }),
    P.lane({ key: 'wStart', points: W_START, dashed: true, dim: true }),
    P.wire({ key: 'branch', x: HOST_CX, y: BRANCH_Y }),
    P.chip({ key: 'peerChip', x: CHIP_X(0), y: CHIP_Y(0), w: STO.CHIP_W, h: STO.CHIP_H, name: 'peer group', value: 'shared:1' }),
    P.chip({ key: 'hostChip', x: CHIP_X(1), y: CHIP_Y(1), w: STO.CHIP_W, h: STO.CHIP_H, name: 'nvme1n1 on host', value: 'none' }),
    P.chip({ key: 'appChip', x: CHIP_X(2), y: CHIP_Y(2), w: STO.CHIP_W, h: STO.CHIP_H, name: 'app /data', value: 'not mounted' }),
    P.chip({ key: 'copyChip', x: CHIP_X(3), y: CHIP_Y(3), w: STO.CHIP_W, h: STO.CHIP_H, name: 'bytes copied', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: [
      'hostHdr', 'hostR01', 'hostR2', 'hostR3', 'plugR0', 'plugR1', 'plugR2', 'plugR3', 'appR0', 'appR3',
      'peerChip', 'hostChip', 'appChip', 'copyChip',
    ],
    pods: ['plugPod', 'appPod'],
  },
};

// STO.S-01: every entry that comes and goes, and every lane, on every step. An entry not in a
// table yet is pending, with a sublabel saying so (C-14).
const PEND = OPACITY.pending;
const stage = ({ r2 = PEND, r3 = PEND, h2 = PEND, h3 = PEND, app = PEND, peers = 1 } = {}) => ({
  plugR2: r2, plugR3: r3, hostR2: h2, hostR3: h3, appPod: app,
  relPlug: peers, relPods: peers, wStage: 1, wBind: 1, wStart: 1,
});
// Every chip on every step (P-01). The copy chip never moves: no hop copies a byte.
const chips = (peer, host, app) => ({ peerChip: peer, hostChip: host, appChip: app, copyChip: 'none' });

const NO_ENTRY = 'no entry yet';
const DEV = '/dev/nvme1n1';
const SHARED = { plugR0: 'shared:1', plugR1: 'shared:1' };
const EMPTY = { ...SHARED, plugR2: NO_ENTRY, plugR3: NO_ENTRY, hostR2: NO_ENTRY, hostR3: NO_ENTRY, appR0: 'no namespace yet', appR3: 'no namespace yet' };
const STAGED = { ...EMPTY, plugR2: DEV, hostR2: DEV };
const BOUND = { ...STAGED, plugR3: DEV, hostR3: DEV };
const STARTED = { ...BOUND, appR0: 'overlay, container root', appR3: DEV };
const PRIVATE = { ...EMPTY, plugR0: 'private, None', plugR1: 'private, None', plugR2: DEV, hostR2: 'no entry', hostR3: 'no entry' };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('shared:1', 'none', 'not mounted'),
    sublabels: EMPTY,
    podSublabels: { appShell: 'not started yet' },
    opacity: stage(),
  },
  {
    id: 'tables',
    duration: 3800,
    narration: 'The CSI node plugin runs in a container, so how can a mount it makes reach the host, and then Pod A? Each container gets its own mount namespace, a private list of mounts, and by default a mount call in a container changes only that list. Two lists matter so far: the plugin and the host, where Kubelet and the runtime run. Pod A gets one when its container starts.',
    chipsCued: chips('shared:1', 'none', 'not mounted'),
    sublabels: EMPTY,
    podSublabels: { appShell: 'not started yet' },
    opacity: stage(),
    // Two tables exist, and each lights as the sentence names it: the plugin blinks, the host follows.
    flow: [
      F.pulse({ pod: 'plugPod' }),
      F.light({ targets: ['hostHdr'], delay: BEAT.afterPulse }),
    ],
  },
  {
    id: 'shared',
    duration: 4800,
    narration: 'The plugin volumeMounts give /var/lib/kubelet/plugins and /var/lib/kubelet/pods mountPropagation: Bidirectional, allowed only in a privileged container. The runtime binds each from the host mount holding them, shared on a systemd host, so all three sit in one peer group, shared:1. The staging mount the plugin itself makes for /dev/nvme1n1 lands in its own list, and the kernel repeats it in the host list.',
    chipsCued: chips('shared:1', '1 entry', 'not mounted'),
    sublabels: STAGED,
    podSublabels: { appShell: 'not started yet' },
    opacity: stage({ r2: 1, h2: 1 }),
    lit: ['hostR01'],
    rewind: { chips: { hostChip: 'none' }, sublabels: EMPTY, opacity: { plugR2: PEND, hostR2: PEND } },
    // Up-arrow order: the plugin blinks, its own entry appears, then the kernel repeats it sideways.
    flow: [
      F.pulse({ pod: 'plugPod' }),
      F.fade({ target: 'plugR2', from: PEND, to: 1, dur: 500, delay: BEAT.afterPulse, fill: 'forwards', easing: 'ease-out', name: 'made', lights: ['plugR2'] }),
      F.set({ at: 'made', sublabels: { plugR2: DEV } }),
      F.route({ points: W_STAGE, after: 'made', name: 'rep', lights: ['hostR2'] }),
      F.fade({ target: 'hostR2', from: PEND, to: 1, dur: 500, at: 'rep', fill: 'forwards', easing: 'ease-out' }),
      F.set({ at: 'rep', sublabels: { hostR2: DEV }, chipsCued: { hostChip: '1 entry' } }),
    ],
  },
  {
    id: 'bind',
    duration: 4000,
    narration: 'Publishing the volume to Pod A usually adds a bind mount of that staged directory under /var/lib/kubelet/pods, and it reaches the host list the same way. A bind is not a copy: both entries are one filesystem on /dev/nvme1n1, the same files and the same inodes. That is why findmnt on Node-1 lists /dev/nvme1n1 twice.',
    chipsCued: chips('shared:1', '2 entries', 'not mounted'),
    sublabels: BOUND,
    podSublabels: { appShell: 'not started yet' },
    opacity: stage({ r2: 1, h2: 1, r3: 1, h3: 1 }),
    rewind: { chips: { hostChip: '1 entry' }, sublabels: STAGED, opacity: { plugR3: PEND, hostR3: PEND } },
    flow: [
      F.pulse({ pod: 'plugPod' }),
      F.fade({ target: 'plugR3', from: PEND, to: 1, dur: 500, delay: BEAT.afterPulse, fill: 'forwards', easing: 'ease-out', name: 'made', lights: ['plugR3'] }),
      F.set({ at: 'made', sublabels: { plugR3: DEV } }),
      F.route({ points: W_BIND, after: 'made', name: 'rep', lights: ['hostR3'] }),
      F.fade({ target: 'hostR3', from: PEND, to: 1, dur: 500, at: 'rep', fill: 'forwards', easing: 'ease-out' }),
      F.set({ at: 'rep', sublabels: { hostR3: DEV }, chipsCued: { hostChip: '2 entries' } }),
    ],
  },
  {
    id: 'start',
    duration: 4100,
    narration: 'Now the runtime starts the app container. It creates a new mount namespace for the container and binds the host entry of that Pod directory at /data, a third view of the same files. The volumeMount leaves mountPropagation at None, which is rprivate by default, so a mount the host adds under that directory later does not reach /data.',
    chipsCued: chips('shared:1', '2 entries', 'private bind'),
    sublabels: STARTED,
    podSublabels: { appShell: 'app container' },
    opacity: stage({ r2: 1, h2: 1, r3: 1, h3: 1, app: 1 }),
    lit: ['hostHdr', 'hostR3'],
    rewind: {
      chips: { appChip: 'not mounted' }, sublabels: BOUND, podSublabels: { appShell: 'not started yet' },
      opacity: { appPod: PEND },
    },
    // Down-arrow order: the host sends first, and Pod A comes up and blinks as /data lands in it.
    flow: [
      F.route({ points: W_START, delay: BEAT.lead, name: 'bind', lights: ['appR3'] }),
      F.fade({ target: 'appPod', from: PEND, to: 1, dur: 500, at: 'bind', fill: 'forwards', easing: 'ease-out' }),
      F.pulse({ pod: 'appPod', at: 'bind' }),
      F.set({ at: 'bind', sublabels: { appR0: STARTED.appR0, appR3: DEV }, podSublabels: { appShell: 'app container' }, chipsCued: { appChip: 'private bind' } }),
    ],
  },
  {
    id: 'without',
    duration: 5000,
    narration: 'If instead the plugin volumeMounts used None, its mounts would stay in its own list. The host list would get neither entry, so Kubelet could not see the mount, and Pod A would get the empty host directory at /data, on the Node disk. Bidirectional is the one mode that sends mounts back to the host, and HostToContainer only receives them. The docs advise propagation only on hostPath or memory-backed emptyDir volumes, which the plugin directories are.',
    chipsCued: chips('plugin not in it', 'none', 'not mounted'),
    sublabels: PRIVATE,
    podSublabels: { appShell: 'not started yet' },
    wires: { branch: 'if instead the plugin volumeMounts use None' },
    opacity: stage({ r2: 1, peers: 0 }),
    rewind: { opacity: { plugR2: PEND }, sublabels: { plugR2: NO_ENTRY } },
    // The plugin makes its entry, and the repeat stops on its own Pod wall: nothing crosses.
    flow: [
      F.pulse({ pod: 'plugPod' }),
      F.fade({ target: 'plugR2', from: PEND, to: 1, dur: 500, delay: BEAT.afterPulse, fill: 'forwards', easing: 'ease-out', name: 'made', lights: ['plugR2'] }),
      F.set({ at: 'made', sublabels: { plugR2: DEV } }),
      F.route({ points: W_STOP, after: 'made', name: 'stop' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
