import { LANE_DY, P, F, defineCard, laneY, ladder, spread, midX, shade, CLU, LAYOUT, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-graceful-node-shutdown.md

// Laid out on the L. The narration budget is a line count, see the card record before lengthening it.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;
const CX = midX(CONTENT_L, CONTENT_R);

// The spine is on CX, so the lane below is a straight drop through the ladder to chip corridor.
const BOX_W = CLU.BOX_W, BOX_H = CLU.BOX_H;
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;
const SPINE_X = CX;
const KUBE_X = SPINE_X - BOX_W / 2;
// systemd sits at the right wall so the top row spans the same width as the band below.
const SYS_X = CONTENT_R - BOX_W;
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);
const { out: SIG_Y, back: REL_Y } = laneY(TOP_CY, LANE_DY);   // 68 / 92, one lane per direction
const WIRE_Y = TOP_BOTTOM + 26;
const WIRE_X = midX(KUBE_X + BOX_W, SYS_X);

const LADDER_X = LAYOUT.A.ladder.x, LADDER_W = LAYOUT.A.ladder.w;
const LADDER_Y = 250, ROW_H = CLU.ROW_H, ROW_GAP = CLU.ROW_GAP;     // 5 rows -> 250..450
const LADDER_BOTTOM = LADDER_Y + 5 * ROW_H + 4 * ROW_GAP;

// The chip column starts where the lane corridor ends, not at LAYOUT.A.chips.
const CHIP_X = 620, CHIP_W = CONTENT_R - CHIP_X;
// Hung off the ladder bottom, so the two columns close on one line.
const CHIP_H = CLU.CHIP_H, CHIP_GAP = 8, CHIP_N = 4;
const CHIP_TOP = LADDER_BOTTOM - (CHIP_N * CHIP_H + (CHIP_N - 1) * CHIP_GAP);
const CHIP_Y = ladder({ y: CHIP_TOP, rowH: CHIP_H, gap: CHIP_GAP });

// node() draws its label at NODE_Y + 18, so the Pod row needs the 34 of top padding.
const NODE_H = CLU.NODE.H, NODE_BOTTOM = 624, NODE_Y = NODE_BOTTOM - NODE_H;
const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;
const POD_W = 300, POD_H = CLU.NODE.POD_H;
const POD_Y = NODE_Y + CLU.NODE.POD_DY;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };
const POD_PAD = 24;
const POD_X = spread({ from: NODE_X + POD_PAD, to: CONTENT_R - POD_PAD, count: 3, w: POD_W }).x;

// One lane addressed to the Node, never a Pod in it: which Pods a SIGTERM reaches is carried by the pulses.
const SIG_LANE = [[SPINE_X, TOP_BOTTOM], [SPINE_X, NODE_Y]];

// Two non-critical Pods and one at the system-critical cutoff.
const POD_SUBS = ['priority: 0', 'priority: 0', 'priority: 2e9'];

// The list order is the z-order: the Node, its Pods and the top row draw above the ball.
export const SCENE = {
  'aria-label': 'Graceful Node shutdown: the Kubelet holds a delay inhibitor lock, systemd signals it over D-Bus, and the Kubelet sets NotReady, terminates non-critical then critical Pods, then releases the lock',
  parts: [
    P.defs(),
    P.arrow({ x1: SYS_X, y1: SIG_Y, x2: KUBE_X + BOX_W, y2: SIG_Y, dim: true, dashed: true }),
    P.arrow({ x1: KUBE_X + BOX_W, y1: REL_Y, x2: SYS_X, y2: REL_Y, dim: true, dashed: true }),
    // Renders at 11px from `.scheme-label.code`: do not add a `font-size` attribute.
    P.wire({ key: 'sig', x: WIRE_X, y: WIRE_Y }),
    P.chip({ key: 'lockChip',   x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'inhibitor lock',                   value: 'held by Kubelet' }),
    P.chip({ key: 'gpChip',     x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'shutdownGracePeriod',              value: '60s' }),
    P.chip({ key: 'gpCritChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'shutdownGracePeriodCriticalPods', value: '20s' }),
    P.chip({ key: 'phaseChip',  x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'shutdown phase',                   value: 'normal' }),
    P.lane({ points: SIG_LANE, dim: true, dashed: true }),
    P.packets(),
    P.chain({
      key: 'chain', x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        // Padded so the separators line up with the sibling eviction ladder. SVG collapses the spaces.
        '1. signal    ·  systemd PrepareForShutdown over D-Bus',
        '2. condition ·  set NotReady, bucket by priority',
        '3. normal    ·  SIGTERM non-critical, await up to 40s',
        '4. critical  ·  SIGTERM critical, await up to 20s',
        '5. release   ·  drop lock, OS proceeds with shutdown',
      ],
    }),
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    // The id tells one Pod's shell and inner box from the next, and the fades address it.
    ...POD_SUBS.map((sub, i) => P.pod({
      key: `pod${i + 1}`, id: `pod${i + 1}`, innerKey: `pod${i + 1}Box`,
      x: POD_X(i), y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { ...POD_INNER, label: 'app', sublabel: sub },
    })),
    P.box({ key: 'systemd', x: SYS_X,  y: TOP_Y, w: BOX_W, h: BOX_H, label: 'systemd', sublabel: 'logind' }),
    P.box({ key: 'kubelet', x: KUBE_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Kubelet', sublabel: 'shutdown manager' }),
  ],
  reset: {
    keys: ['systemd', 'kubelet', 'lockChip', 'gpChip', 'gpCritChip', 'phaseChip'],
    pods: ['pod1', 'pod2', 'pod3'],
  },
};

// Longer than the 900ms pulse so the Pod stays visible while it blinks.
// Settles on OPACITY.terminated, not 0, or it leaves a hole in the Node frame.
const POD_FADE = 1200;
const GONE = OPACITY.terminated;
const PODS = ['pod1', 'pod2', 'pod3'];
const LIVE = shade(PODS, 1);
const ALL_DOWN = shade(PODS, GONE);
// Each phase is written at the static end of the step that earns it (S-13) and in that step's rewind.
const NORMAL = 'normal';
const SIGNALLED = 'shutdown signal received';
const BUCKETING = 'NotReady · bucketing pods';
const NON_CRIT = 'terminating non-critical · 40s';
const CRITICAL = 'terminating critical · 20s';
const RELEASED = 'lock released · OS shutdown';
const LOCK_HELD = 'held by Kubelet';
const LOCK_FREE = 'released';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { lockChip: LOCK_HELD, gpChip: '60s', gpCritChip: '20s', phaseChip: NORMAL },
    opacity: LIVE,
    chain: -1,
  },
  {
    id: 'signal',
    duration: 2800,
    narration: 'The Node is about to shut down (poweroff, reboot, or halt), and systemd emits PrepareForShutdown over D-Bus. Kubelet catches the signal via its logind subscription. Its delay-type inhibitor lock makes systemd pause the actual shutdown, so Kubelet can enter shutdown mode rather than let the OS kill processes outright.',
    chips: { lockChip: LOCK_HELD, gpChip: '60s', gpCritChip: '20s', phaseChip: SIGNALLED },
    wires: { sig: 'PrepareForShutdown · D-Bus' },
    opacity: LIVE,
    lit: ['systemd', 'phaseChip'],
    chain: 0,
    rewind: { chips: { phaseChip: NORMAL } },
    flow: [
      F.top({ from: SYS_X, to: KUBE_X + BOX_W, y: SIG_Y, name: 'sig', lights: ['kubelet'] }),
      F.set({ at: 'sig', chips: { phaseChip: SIGNALLED } }),
    ],
  },
  {
    id: 'condition',
    duration: 2850,
    narration: 'Kubelet sets a NotReady condition on the Node with the reason node is shutting down, which stops the Scheduler placing anything here, and its admission handler rejects even Pods tolerating the not-ready taint. Existing Pods are bucketed by priority: at or above 2,000,000,000 is the critical bucket, the rest are non-critical.',
    chips: { lockChip: LOCK_HELD, gpChip: '60s', gpCritChip: '20s', phaseChip: BUCKETING },
    opacity: LIVE,
    lit: ['kubelet', 'phaseChip'],
    chain: 1,
    // Nothing travels and no block flashes: the phase chip carries the step.
  },
  {
    id: 'terminate-normal',
    duration: 2650,
    narration: 'Kubelet sends SIGTERM to every non-critical Pod in parallel. The window is shutdownGracePeriod minus shutdownGracePeriodCriticalPods (40s here), or the terminationGracePeriodSeconds on the Pod when that is shorter. Each ends up with the status reason Terminated.',
    chips: { lockChip: LOCK_HELD, gpChip: '60s', gpCritChip: '20s', phaseChip: NON_CRIT },
    opacity: { ...LIVE, pod1: GONE, pod2: GONE },
    lit: ['kubelet', 'phaseChip', 'gpChip'],
    chain: 2,
    rewind: { chips: { phaseChip: BUCKETING } },
    // One SIGTERM, both non-critical Pods react on arrival: that is "in parallel".
    flow: [
      F.route({ points: SIG_LANE, name: 'sig' }),
      F.set({ at: 'sig', chips: { phaseChip: NON_CRIT } }),
      F.pulse({ pod: 'pod1', at: 'sig' }),
      F.pulse({ pod: 'pod2', at: 'sig' }),
      // No `unlight`: no highlight stands in for the pulse, so there is nothing to take back.
      F.fade({ target: 'pod1', to: GONE, dur: POD_FADE, at: 'sig' }),
      F.fade({ target: 'pod2', to: GONE, dur: POD_FADE, at: 'sig' }),
    ],
  },
  {
    id: 'terminate-critical',
    duration: 3200,
    narration: 'After non-critical Pods are gone (or their grace expired), Kubelet sends SIGTERM to system-critical Pods, again in parallel. The window is shutdownGracePeriodCriticalPods (20s here), capped the same way by terminationGracePeriodSeconds. DaemonSet infra workloads such as CNI or kube-proxy usually sit in this bucket.',
    chips: { lockChip: LOCK_HELD, gpChip: '60s', gpCritChip: '20s', phaseChip: CRITICAL },
    opacity: ALL_DOWN,
    lit: ['kubelet', 'phaseChip', 'gpCritChip'],
    chain: 3,
    rewind: { chips: { phaseChip: NON_CRIT } },
    flow: [
      F.route({ points: SIG_LANE, name: 'sig' }),
      F.set({ at: 'sig', chips: { phaseChip: CRITICAL } }),
      F.pulse({ pod: 'pod3', at: 'sig' }),
      F.fade({ target: 'pod3', to: GONE, dur: POD_FADE, at: 'sig' }),
    ],
  },
  {
    id: 'release',
    duration: 2900,
    narration: 'All Pods are gone or their grace expired. Kubelet releases the inhibitor lock, and systemd resumes the shutdown sequence. The Node has carried NotReady since the Kubelet set that condition, and once Lease renewals in kube-node-lease stop the control plane treats it as unreachable as well.',
    chips: { lockChip: LOCK_FREE, gpChip: '60s', gpCritChip: '20s', phaseChip: RELEASED },
    wires: { sig: 'release lock' },
    opacity: ALL_DOWN,
    lit: ['kubelet', 'lockChip', 'phaseChip'],
    chain: 4,
    rewind: { chips: { lockChip: LOCK_HELD, phaseChip: CRITICAL } },
    flow: [
      F.top({ from: KUBE_X + BOX_W, to: SYS_X, y: REL_Y, name: 'rel', lights: ['systemd'] }),
      F.set({ at: 'rel', chips: { lockChip: LOCK_FREE, phaseChip: RELEASED } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
