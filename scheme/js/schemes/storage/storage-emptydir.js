import { P, F, defineCard, setCylinderLabel, BEAT, OPACITY, FADE, chipStrip } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-emptydir.md


// Two Nodes side by side: the directory is born, shared and deleted on Node-1, and the replacement
// Pod finds a new one on Node-2. Node-1 starts left of the panel edge, below the deepest panel.
// Each frame holds the catalog padding, the Pod 34 under its top and the directory 12 over its floor.
const NODE_W = 520, NODE_Y = 222, NODE_H = 326;
const NODE_1_X = 40, NODE_2_X = 1200 - NODE_1_X - NODE_W;

// The catalog Pod height and container box, two containers side by side.
const POD_W = 480, POD_H = 104, POD_DX = 20, POD_Y = NODE_Y + 34;
const POD_BOTTOM = POD_Y + POD_H;
const C_W = 192, C_H = 44, C_DY = 34, C_GAP = 56;
const APP_DX = 20, SIDE_DX = APP_DX + C_W + C_GAP;

// The directory under the Pod centre, as low in the frame as it sits.
const ED_W = 176, ED_H = 96, ED_Y = NODE_Y + NODE_H - 12 - ED_H;
const ED_MY = ED_Y + ED_H / 2;
const ED_LABEL_Y = ED_H / 2 + 10;
const LANE_DX = ED_W / 2 + 24;                                           // each lane 24 out from a face

const CHIP_Y = 580, CHIP_H = 34;
// The ledger spans the two frames exactly, outer face to outer face.
const CH_COUNT = 6, CH_GAP = 16;
const CH = chipStrip({ w: (NODE_2_X + NODE_W - NODE_1_X - (CH_COUNT - 1) * CH_GAP) / CH_COUNT, gap: CH_GAP, count: CH_COUNT });

// A lane ends on the Pod floor, never on a container inside it: every request the Pod sends goes
// down the left lane and every read comes up the right one, mirrored about the Pod floor midpoint
// (L-12) and entering each cylinder side face at its midpoint (L-11).
const site = (nodeX) => {
  const cx = nodeX + NODE_W / 2;
  return {
    podX: nodeX + POD_DX, edX: cx - ED_W / 2,
    write: [[cx - LANE_DX, POD_BOTTOM], [cx - LANE_DX, ED_MY], [cx - ED_W / 2, ED_MY]],
    read: [[cx + ED_W / 2, ED_MY], [cx + LANE_DX, ED_MY], [cx + LANE_DX, POD_BOTTOM]],
  };
};
const N1 = site(NODE_1_X), N2 = site(NODE_2_X);

// Each tag rides outside its lane and below the ball, clear of the Pod floor at departure and of
// the directory at arrival. `ls /cache` and `no files` are wider, so they sit further out.
const WRITE_TAG = { dx: -32, dy: 16 };
const LS_TAG = { ...WRITE_TAG, dx: -41 };
const READ_TAG = { dx: 32, dy: 16 };
const NO_FILES_TAG = { ...READ_TAG, dx: 38 };

// The 900ms Pod pulse masks the app highlight until it ends, so the app ball leaves at SEND, never
// before the sender reads as lit (M-18a).
const SEND = BEAT.afterPulse + 500;

// A Pod is its shell plus two peer containers in one group, so the pulse takes the whole Pod.
const pod = (n, x, label, sublabel) => P.group({
  key: `pod${n}`,
  parts: [
    P.pod({ key: `shell${n}`, x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel, containers: 0 }),
    P.box({ key: `appBox${n}`, x: x + APP_DX, y: POD_Y + C_DY, w: C_W, h: C_H, label: 'app', sublabel: 'mounts /cache' }),
    P.box({ key: `sideBox${n}`, x: x + SIDE_DX, y: POD_Y + C_DY, w: C_W, h: C_H, label: 'sidecar', sublabel: 'mounts /cache' }),
  ],
});
const emptyDir = (n, x) => P.cylinder({ key: `ed${n}`, x, y: ED_Y, w: ED_W, h: ED_H, label: 'emptyDir', labelY: ED_LABEL_Y });
const lanes = (n, s) => [
  P.lane({ key: `write${n}`, points: s.write, dashed: true, dim: true }),
  P.lane({ key: `read${n}`, points: s.read, dashed: true, dim: true }),
];
const chip = (key, i, name, value) => P.chip({ key, x: CH.x(i), y: CHIP_Y, w: CH.w, h: CHIP_H, name, value });

// Z-order: the two frames, the Pods, the directories, the lanes and the counterfactual caption,
// the chip ledger, then the packet layer.
export const SCENE = {
  'aria-label': 'emptyDir lifetime across two Nodes: Pod web-a is assigned to Node-1 and the Kubelet creates its emptyDir there, empty, before any container starts. The app and the sidecar mount it at /cache, so the sidecar reads the part-1 file the app writes, and after the app container crashes and restarts it reads part-1 back. Node-1 is cordoned and web-a is evicted, the emptyDir is deleted with it, and the replacement Pod web-b lands on Node-2 with a new, empty emptyDir. With medium Memory the emptyDir would be a tmpfs whose bytes count against the memory limit of the container that writes them, capped at a sizeLimit of 256Mi, or at the Pod memory limit if that is lower.',
  parts: [
    P.defs(),
    P.node({ x: NODE_1_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.node({ x: NODE_2_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2' }),
    pod(1, N1.podX, 'Pod web-a', 'volume cache: emptyDir: {}'),
    pod(2, N2.podX, 'Pod web-b', 'replacement, same template'),
    emptyDir(1, N1.edX),
    emptyDir(2, N2.edX),
    ...lanes(1, N1),
    ...lanes(2, N2),
    // The memory step is a counterfactual, so it says so above the directory it relabels (T-35),
    // between the two lanes.
    P.tag({ key: 'ifMemory', x: NODE_2_X + NODE_W / 2, y: POD_BOTTOM + 48, text: 'if medium: Memory' }),
    chip('podChip', 0, 'Pod', 'web-a, Node-1'),
    chip('edChip', 1, 'emptyDir', 'none yet'),
    chip('cacheChip', 2, '/cache', 'nothing'),
    chip('restartChip', 3, 'app restarts', '0'),
    chip('mediumChip', 4, 'medium', 'node storage'),
    chip('limitChip', 5, 'sizeLimit', 'none'),
    P.packets(),
  ],
  reset: {
    keys: ['appBox1', 'sideBox1', 'appBox2', 'sideBox2', 'ed1', 'ed2',
      'podChip', 'edChip', 'cacheChip', 'restartChip', 'mediumChip', 'limitChip'],
    pods: ['pod1', 'pod2'],
  },
};

// STO.S-01 and A-16: a Pod, its directory and the lanes between them are one construction, so a
// lane is live only while both of its ends are (A-14, STO.S-02).
const stage = ({ p1 = 1, e1 = 1, p2 = 0, e2 = 0, memory = 0 } = {}) => {
  const l1 = p1 === 1 && e1 === 1 ? 1 : 0, l2 = p2 === 1 && e2 === 1 ? 1 : 0;
  return {
    pod1: p1, ed1: e1, write1: l1, read1: l1,
    pod2: p2, ed2: e2, write2: l2, read2: l2, ifMemory: memory,
  };
};
const ASSIGNED = stage({ e1: 0 });
const ON_1 = stage();
const GONE_1 = stage({ p1: OPACITY.terminated, e1: OPACITY.terminated });
const ON_2 = stage({ p1: OPACITY.terminated, e1: OPACITY.terminated, p2: 1, e2: 1 });
const MEMORY = stage({ p1: OPACITY.terminated, e1: OPACITY.terminated, p2: 1, e2: 1, memory: 1 });

// The Node-2 directory label is the one face no field writes, so every step states it.
const face = (txt) => (s) => setCylinderLabel(s.refs.ed2, txt);
const DISK = { mediumChip: 'node storage', limitChip: 'none' };
const fadeIn = (target, delay, extra = {}) =>
  F.fade({ target, from: 0, to: 1, dur: FADE.in, delay, easing: 'ease-out', ...extra });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: { podChip: 'web-a, Node-1', edChip: 'none yet', cacheChip: 'nothing', restartChip: '0', ...DISK },
    opacity: ASSIGNED,
    enter: face('emptyDir'),
  },
  {
    id: 'create',
    duration: 3000,
    narration: 'Pod web-a is assigned to Node-1, and before any container starts, the Kubelet there creates its emptyDir: a new, empty directory on Node-1 storage. The spec says only emptyDir: {}, so there is no source and nothing to copy in.',
    chips: { edChip: 'on Node-1', cacheChip: 'empty' },
    chipsCued: { podChip: 'web-a, Node-1', restartChip: '0', ...DISK },
    opacity: ON_1,
    rewind: { chips: { edChip: 'none yet', cacheChip: 'nothing' } },
    enter: face('emptyDir'),
    // The Pod blinks as the one it is created for, then the directory and its mounts appear together.
    flow: [
      F.pulse({ pod: 'pod1' }),
      ...['write1', 'read1'].map(target => fadeIn(target, BEAT.afterPulse)),
      fadeIn('ed1', BEAT.afterPulse, { name: 'made', lights: ['ed1'] }),
      F.set({ at: 'made', chips: { edChip: 'on Node-1', cacheChip: 'empty' }, lights: ['edChip', 'cacheChip'] }),
    ],
  },
  {
    id: 'share',
    duration: 4000,
    narration: 'Both containers mount the same emptyDir at /cache. The app writes part-1 into it and the sidecar reads part-1 straight back, because every container that mounts it sees the same files.',
    chips: { cacheChip: 'part-1' },
    chipsCued: { podChip: 'web-a, Node-1', edChip: 'on Node-1', restartChip: '0', ...DISK },
    opacity: ON_1,
    lit: ['appBox1'],
    rewind: { chips: { cacheChip: 'empty' } },
    enter: face('emptyDir'),
    // The app sends, lit from entry, as the Pod blinks. The directory lights as the write lands and
    // then sends the file on to the sidecar.
    flow: [
      F.pulse({ pod: 'pod1' }),
      F.route({ points: N1.write, delay: SEND, name: 'w', lights: ['ed1'], tag: { text: 'part-1', ...WRITE_TAG } }),
      F.set({ at: 'w', chips: { cacheChip: 'part-1' }, lights: ['cacheChip'] }),
      F.route({ points: N1.read, after: 'w', lights: ['sideBox1'], tag: { text: 'part-1', ...READ_TAG } }),
    ],
  },
  {
    id: 'restart',
    duration: 3000,
    narration: 'The app container crashes and the Kubelet restarts it. A container crash does not remove the Pod from Node-1, so the emptyDir stays, and the restarted app reads part-1 back from /cache.',
    chips: { restartChip: '1' },
    chipsCued: { podChip: 'web-a, Node-1', edChip: 'on Node-1', cacheChip: 'part-1', ...DISK },
    opacity: ON_1,
    lit: ['ed1'],
    rewind: { chips: { restartChip: '0' } },
    enter: face('emptyDir'),
    // The restart is the Pod blink and the count, with no crash flicker. The directory, lit from
    // entry, answers up the read lane.
    flow: [
      F.pulse({ pod: 'pod1' }),
      F.set({ delay: 0, chips: { restartChip: '1' }, lights: ['restartChip'] }),
      F.route({ points: N1.read, delay: BEAT.afterPulse, lights: ['appBox1'], tag: { text: 'part-1', ...READ_TAG } }),
    ],
  },
  {
    id: 'drain',
    duration: 3000,
    narration: 'Node-1 is drained with --delete-emptydir-data: cordoned so no new Pod lands there, then Pod web-a is evicted, and its controller creates a replacement under a new name. A Pod removed from its Node for any reason loses its emptyDir, so part-1 is gone.',
    chips: { podChip: 'web-a evicted', edChip: 'deleted', cacheChip: 'gone' },
    chipsCued: { restartChip: '1', ...DISK },
    opacity: GONE_1,
    rewind: { chips: { podChip: 'web-a, Node-1', edChip: 'on Node-1', cacheChip: 'part-1' } },
    enter: face('emptyDir'),
    // The evicted Pod blinks at full first and goes at afterPulse (M-08), its mounts with it, and
    // the directory follows, each chip on the beat that earns it.
    flow: [
      F.pulse({ pod: 'pod1' }),
      ...['pod1', 'write1', 'read1'].map((target, i) => F.fade({
        target, to: i === 0 ? OPACITY.terminated : 0, dur: FADE.out, delay: BEAT.afterPulse,
      })),
      F.set({ delay: BEAT.afterPulse, chips: { podChip: 'web-a evicted' }, lights: ['podChip'] }),
      F.fade({ target: 'ed1', to: OPACITY.terminated, dur: FADE.out, delay: BEAT.afterPulse + 250 }),
      F.set({ delay: BEAT.afterPulse + 250, chips: { edChip: 'deleted', cacheChip: 'gone' }, lights: ['edChip', 'cacheChip'] }),
    ],
  },
  {
    id: 'replace',
    duration: 5200,
    narration: 'The replacement, Pod web-b, lands on Node-2, since Node-1 is cordoned. Its emptyDir: {} names nothing to bring back, so Node-2 makes a new, empty directory and ls /cache finds no files. A claim-backed volume would be found again through its claim.',
    chips: { podChip: 'web-b, Node-2', edChip: 'on Node-2', cacheChip: 'empty', restartChip: '0' },
    chipsCued: DISK,
    opacity: ON_2,
    rewind: { chips: { podChip: 'web-a evicted', edChip: 'deleted', cacheChip: 'gone', restartChip: '1' } },
    enter: face('emptyDir'),
    // The Pod arrives first, then its new directory with the mounts, and only then does the app
    // light and list /cache: the request goes down the write lane, the answer up the read lane.
    flow: [
      fadeIn('pod2', 0, { name: 'in' }),
      F.set({ at: 'in', chips: { podChip: 'web-b, Node-2', restartChip: '0' }, lights: ['podChip', 'restartChip'] }),
      ...['write2', 'read2'].map(target => fadeIn(target, FADE.in)),
      fadeIn('ed2', FADE.in, { name: 'made', lights: ['ed2'] }),
      F.set({ at: 'made', chips: { edChip: 'on Node-2', cacheChip: 'empty' }, lights: ['edChip', 'cacheChip'] }),
      F.pulse({ pod: 'pod2', at: 'made' }),
      F.light({ targets: ['appBox2'], at: 'made' }),
      F.route({ points: N2.write, at: 'made', plus: SEND, name: 'ls', tag: { text: 'ls /cache', ...LS_TAG } }),
      F.route({ points: N2.read, after: 'ls', tag: { text: 'no files', ...NO_FILES_TAG } }),
    ],
  },
  {
    id: 'memory',
    duration: 4000,
    narration: 'With medium: Memory, this emptyDir would be a tmpfs in Node-2 RAM, shared as before. Its bytes count against the memory limit of the container that writes them, and the tmpfs is capped at the 256Mi sizeLimit, or at the Pod memory limit if lower.',
    chips: { cacheChip: 'part-2' },
    chipsCued: { podChip: 'web-b, Node-2', edChip: 'in RAM', restartChip: '0', mediumChip: 'Memory', limitChip: '256Mi' },
    opacity: MEMORY,
    rewind: { chips: { cacheChip: 'empty' } },
    lit: ['appBox2'],
    enter: face('tmpfs'),
    // The same share as on Node-1, into the tmpfs: the app sends, the directory hands it on.
    flow: [
      F.pulse({ pod: 'pod2' }),
      F.route({ points: N2.write, delay: SEND, name: 'w', lights: ['ed2'], tag: { text: 'part-2', ...WRITE_TAG } }),
      F.set({ at: 'w', chips: { cacheChip: 'part-2' }, lights: ['cacheChip'] }),
      F.route({ points: N2.read, after: 'w', lights: ['sideBox2'], tag: { text: 'part-2', ...READ_TAG } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
