import { P, F, defineCard, spread, strip, midX, shade, CLU, BEAT, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-pod-cgroup-hierarchy.md

// A tree, not a sequence: tiers of one cgroup v2 hierarchy, each revealed with the lanes into it.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;
const CX = midX(CONTENT_L, CONTENT_R);                   // the spine every tier centres on

const BOX_W = CLU.BOX_W, BOX_H = CLU.BOX_H;
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;
const ROOT_X = CX - BOX_W / 2, ROOT_R = ROOT_X + BOX_W;
const KUBE_X = CONTENT_R - BOX_W, KUBE_CX = midX(KUBE_X, CONTENT_R);

// 52 is the shortest box that clears a label plus a sublabel.
const TIER_H = 52;
const T1_Y = 172, T1_B = T1_Y + TIER_H;                  // kubepods.slice
const T2_Y = 288, T2_B = T2_Y + TIER_H;                  // the three children
const T3_Y = 388, T3_B = T3_Y + TIER_H;                  // the per-Pod slice
const T4_Y = 488, T4_H = 68, T4_B = T4_Y + T4_H;         // the container leaf
const T1_CY = midX(T1_Y, T1_B), T4_CY = midX(T4_Y, T4_B);
// The fork elbows turn half way down the band under tier 1.
const FORK_Y = midX(T1_B, T2_Y);

const T1_W = 320, T1_X = CX - T1_W / 2, T1_R = T1_X + T1_W;
const T3_W = 420, T3_X = CX - T3_W / 2;
const LEAF_W = 440, LEAF_X = CX - LEAF_W / 2, LEAF_R = LEAF_X + LEAF_W;
const RT_X = CONTENT_R - BOX_W, RT_CX = midX(RT_X, CONTENT_R);
// Centred on the leaf it writes, so the hop leaves its face midpoint.
const RT_Y = T4_CY - BOX_H / 2;

// Fixed width, so the middle child lands on the spine and the outer two sit symmetric about it.
const KID_W = 340;
const KID = spread({ from: CONTENT_L, to: CONTENT_R, count: 3, w: KID_W });
const KID_CX = i => KID.x(i) + KID_W / 2;

// Mirrored endpoints on the kubepods bottom face, the deliberate pair L-12 reads.
const FORK_DX = 60;

const ROOT_TO_KUBEPODS = [[CX, TOP_BOTTOM], [CX, T1_Y]];
const KUBELET_TO_KUBEPODS = [[KUBE_CX, TOP_BOTTOM], [KUBE_CX, T1_CY], [T1_R, T1_CY]];
const KUBEPODS_TO_BE = [[CX - FORK_DX, T1_B], [CX - FORK_DX, FORK_Y], [KID_CX(0), FORK_Y], [KID_CX(0), T2_Y]];
const KUBEPODS_TO_BU = [[CX, T1_B], [CX, T2_Y]];
const KUBEPODS_TO_GTD = [[CX + FORK_DX, T1_B], [CX + FORK_DX, FORK_Y], [KID_CX(2), FORK_Y], [KID_CX(2), T2_Y]];
const BU_TO_POD = [[CX, T2_B], [CX, T3_Y]];
const POD_TO_LEAF = [[CX, T3_B], [CX, T4_Y]];
const RUNTIME_TO_LEAF = [[RT_X, T4_CY], [LEAF_R, T4_CY]];

// Anchored end just left of the drop: centred, the string runs back over the kubepods block.
const WIRE_CREATE_X = KUBE_CX - 14, WIRE_CREATE_Y = midX(TOP_BOTTOM, T1_Y) + 6;
const WIRE_POD_X = CX + 14, WIRE_POD_Y = midX(T2_B, T3_Y) + 6;
// Above the hop rather than on it: the string is longer than the hop.
const WIRE_LEAF_X = midX(LEAF_R, RT_X), WIRE_LEAF_Y = midX(T3_B, T4_Y) + 4;

const CHIP_H = CLU.CHIP_H, CHIPS_Y = 580;
const CHIP = strip({ from: CONTENT_L, to: CONTENT_R, count: 3, gap: 14 });

// Parts order is z-order: lanes and chips, packets under every block, the top row last.
export const SCENE = {
  'aria-label': 'Pod cgroup hierarchy on a Node: the unified cgroup v2 tree at /sys/fs/cgroup, kubepods.slice under it holding every end-user Pod, the BestEffort and Burstable QoS slices beside a Guaranteed Pod slice, one slice per Pod below Burstable, and the container leaf where the runtime writes cpu.max, memory.max and cpu.weight',
  parts: [
    P.defs(),
    // Parentage links: nothing rides them, so no arrowhead.
    P.relation({ key: 'rootRel', points: ROOT_TO_KUBEPODS, opacity: OPACITY.pending }),
    P.relation({ key: 'leafRel', points: POD_TO_LEAF, opacity: OPACITY.pending }),
    P.lane({ key: 'kubeLane', points: KUBELET_TO_KUBEPODS, dim: true, dashed: true, opacity: OPACITY.pending }),
    P.lane({ key: 'beLane',   points: KUBEPODS_TO_BE,  dim: true, dashed: true, opacity: OPACITY.pending }),
    P.lane({ key: 'buLane',   points: KUBEPODS_TO_BU,  dim: true, dashed: true, opacity: OPACITY.pending }),
    P.lane({ key: 'gtdLane',  points: KUBEPODS_TO_GTD, dim: true, dashed: true, opacity: OPACITY.pending }),
    P.lane({ key: 'podLane',  points: BU_TO_POD,       dim: true, dashed: true, opacity: OPACITY.pending }),
    P.lane({ key: 'rtLane',   points: RUNTIME_TO_LEAF, dim: true, dashed: true, opacity: OPACITY.pending }),
    P.wire({ key: 'create', x: WIRE_CREATE_X, y: WIRE_CREATE_Y, anchor: 'end' }),
    P.wire({ key: 'pod',    x: WIRE_POD_X,    y: WIRE_POD_Y,    anchor: 'start' }),
    P.wire({ key: 'leaf',   x: WIRE_LEAF_X,   y: WIRE_LEAF_Y }),
    P.chip({ key: 'cpuMaxChip',  x: CHIP.x(0), y: CHIPS_Y, w: CHIP.w, h: CHIP_H, name: 'cpu.max',    value: 'no leaf cgroup yet' }),
    P.chip({ key: 'memMaxChip',  x: CHIP.x(1), y: CHIPS_Y, w: CHIP.w, h: CHIP_H, name: 'memory.max', value: 'no leaf cgroup yet' }),
    P.chip({ key: 'weightChip',  x: CHIP.x(2), y: CHIPS_Y, w: CHIP.w, h: CHIP_H, name: 'cpu.weight', value: 'no leaf cgroup yet' }),
    P.packets(),
    P.box({ key: 'kubepodsBox', x: T1_X, y: T1_Y, w: T1_W, h: TIER_H, opacity: OPACITY.pending, label: 'kubepods.slice', sublabel: 'every end-user Pod' }),
    P.box({ key: 'beBox',  x: KID.x(0), y: T2_Y, w: KID_W, h: TIER_H, opacity: OPACITY.pending, label: 'kubepods-besteffort.slice', sublabel: 'one slice per BestEffort Pod' }),
    P.box({ key: 'buBox',  x: KID.x(1), y: T2_Y, w: KID_W, h: TIER_H, opacity: OPACITY.pending, label: 'kubepods-burstable.slice',  sublabel: 'one slice per Burstable Pod' }),
    P.box({ key: 'gtdBox', x: KID.x(2), y: T2_Y, w: KID_W, h: TIER_H, opacity: OPACITY.pending, label: 'kubepods-pod<uid>.slice',   sublabel: 'a Guaranteed Pod · no QoS slice' }),
    P.box({ key: 'podBox',  x: T3_X,  y: T3_Y, w: T3_W,   h: TIER_H, opacity: OPACITY.pending, label: 'kubepods-burstable-pod<uid>.slice', sublabel: 'Pod web-0 · Burstable' }),
    P.box({ key: 'leafBox', x: LEAF_X, y: T4_Y, w: LEAF_W, h: T4_H,  opacity: OPACITY.pending, label: 'Leaf cgroup', sublabel: 'app container · where the processes live' }),
    P.box({ key: 'rootBox', x: ROOT_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: '/sys/fs/cgroup', sublabel: 'cgroup2fs · one hierarchy' }),
    P.box({ key: 'kubelet', x: KUBE_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Kubelet', sublabel: 'cgroupDriver systemd' }),
    P.box({ key: 'runtimeBox', x: RT_X, y: RT_Y, w: BOX_W, h: BOX_H, label: 'Container runtime', sublabel: 'containerd or CRI-O' }),
  ],
  reset: {
    keys: [
      'rootBox', 'kubelet', 'runtimeBox', 'kubepodsBox',
      'beBox', 'buBox', 'gtdBox', 'podBox', 'leafBox',
      'cpuMaxChip', 'memMaxChip', 'weightChip',
    ],
  },
};

// A block and the lanes into it are one construction, shaded together (A-14, A-16).
const T1 = ['kubepodsBox', 'rootRel', 'kubeLane'];
const T2 = ['beBox', 'buBox', 'gtdBox', 'beLane', 'buLane', 'gtdLane'];
const T3 = ['podBox', 'podLane'];
const T4 = ['leafBox', 'leafRel', 'rtLane'];
// An unreached tier rests at pending rather than being cut out (C-14).
const NONE = shade([...T1, ...T2, ...T3, ...T4], OPACITY.pending);
const UPTO1 = { ...NONE, ...shade(T1, 1) };
const UPTO2 = { ...UPTO1, ...shade(T2, 1) };
const UPTO3 = { ...UPTO2, ...shade(T3, 1) };
const UPTO4 = { ...UPTO3, ...shade(T4, 1) };

// Every step writes every chip: until the leaf exists there is no file to read.
const ABSENT = 'no leaf cgroup yet';
const EMPTY = { cpuMaxChip: ABSENT, memMaxChip: ABSENT, weightChip: ABSENT };
// The three kernel defaults a fresh non-root cgroup carries before anything is written into it.
const DEFAULTS = { cpuMaxChip: 'max 100000', memMaxChip: 'max', weightChip: '100' };
// memory.max holds bytes. The cpu values match the CPU Throttling and CFS Quota card.
const WRITTEN = {
  cpuMaxChip: '50000 100000 · limits.cpu 500m',
  memMaxChip: '268435456 · limits.memory 256Mi',
  weightChip: '35 · from requests.cpu 250m',
};

const reveal = (keys) => keys.map(target => F.reveal({ target, from: OPACITY.pending }));

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: EMPTY,
    opacity: NONE,
  },
  {
    id: 'unified',
    duration: 2800,
    narration: 'On a cgroup v2 Node the whole tree is one unified hierarchy mounted at /sys/fs/cgroup, and stat -fc %T on that path answers cgroup2fs. The Kubelet and the container runtime both write into it, so they have to agree on one cgroup driver, and with cgroup v2 that is the systemd driver on both.',
    chips: EMPTY,
    opacity: NONE,
    lit: ['rootBox', 'kubelet', 'runtimeBox'],
  },
  {
    id: 'kubepods',
    duration: 3000,
    narration: 'Under that root the Kubelet creates kubepods.slice and parents every end-user Pod below it, which is what cgroupsPerQOS does and it is on by default. The default enforceNodeAllocatable setting then makes Allocatable the ceiling over that whole subtree, enforced by evicting once the Pods together pass it.',
    chips: EMPTY,
    wires: { create: 'creates kubepods.slice' },
    opacity: UPTO1,
    lit: ['kubelet'],
    flow: [
      ...reveal(T1),
      F.route({ points: KUBELET_TO_KUBEPODS, delay: BEAT.lead, lights: ['kubepodsBox'] }),
    ],
  },
  {
    id: 'qos',
    duration: 3200,
    narration: 'One level down, kubepods.slice has three kinds of child. Burstable Pods go under kubepods-burstable.slice and BestEffort Pods under kubepods-besteffort.slice, so a value written on one QoS cgroup reaches the whole tier below it. A Guaranteed Pod gets no QoS slice: its own slice hangs straight off kubepods.slice.',
    chips: EMPTY,
    opacity: UPTO2,
    lit: ['kubelet', 'kubepodsBox'],
    flow: [
      ...reveal(T2),
      F.route({ points: KUBEPODS_TO_BE,  delay: BEAT.lead, lights: ['beBox'] }),
      F.route({ points: KUBEPODS_TO_BU,  delay: BEAT.lead, lights: ['buBox'] }),
      F.route({ points: KUBEPODS_TO_GTD, delay: BEAT.lead, lights: ['gtdBox'] }),
    ],
  },
  {
    id: 'pod-slice',
    duration: 2800,
    narration: 'When Pod web-0 starts, the Kubelet gives it a slice of its own inside the tier its QoS class picked, named for the Pod uid. That slice is the parent of every container in the Pod, so the Pod is accounted in one place whatever its containers do inside it.',
    chips: EMPTY,
    wires: { pod: 'created at Pod start' },
    opacity: UPTO3,
    lit: ['kubelet', 'buBox'],
    flow: [
      ...reveal(T3),
      F.route({ points: BU_TO_POD, delay: BEAT.lead, lights: ['podBox'] }),
    ],
  },
  {
    id: 'leaf',
    duration: 3000,
    narration: 'The container runtime creates the last level, one leaf cgroup per container, and writes the limits into it: cpu.max from limits.cpu, memory.max from limits.memory in bytes, cpu.weight from requests.cpu. The no-internal-process rule keeps processes on the leaves, so this is the cgroup the app runs in.',
    chips: WRITTEN,
    wires: { leaf: 'creates the container leaf' },
    opacity: UPTO4,
    lit: ['runtimeBox', 'podBox', 'cpuMaxChip', 'memMaxChip', 'weightChip'],
    // The chips stand at the kernel defaults until the write lands on the leaf.
    rewind: { chips: DEFAULTS },
    flow: [
      ...reveal(T4),
      F.route({ points: RUNTIME_TO_LEAF, delay: BEAT.lead, name: 'write', lights: ['leafBox'] }),
      F.set({ at: 'write', chips: WRITTEN }),
    ],
  },
  {
    id: 'readers',
    duration: 2800,
    narration: 'The tree is where the numbers sit, not what acts on them. Two cards pick them up from here: CPU Throttling and CFS Quota takes cpu.max as the budget a container may spend inside each period, and Container OOMKill takes memory.max as the cap that gets a container killed. Read those two next.',
    chips: WRITTEN,
    opacity: UPTO4,
    lit: ['leafBox', 'cpuMaxChip', 'memMaxChip'],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
