import { P, F, defineCard, laneY, ladder, spread, midX, shade, CLU, LAYOUT, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-graceful-node-shutdown.md

// Laid out on the L. Panel x<=397 y<=230 against a ladder starting at 250, so 20 units of
// headroom. The budget is a LINE count, measured: see ./CARDS/cluster-graceful-node-shutdown.md before passing 326 characters.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = midX(CONTENT_L, CONTENT_R);                   // 600, the canvas centre by construction

// Top row, right of the panel. The spine is on CX so the lane below is a straight drop, running the
// 540..620 corridor between ladder and chips so it crosses nothing.
const BOX_W = CLU.BOX_W, BOX_H = CLU.BOX_H;              // 232 / 80
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;     // 40 / 120
const SPINE_X = CX;                                      // 600
const KUBE_X = SPINE_X - BOX_W / 2;                      // 484..716
// systemd sits at the right wall, its edge on the chip column's, so the top row spans the same
// 484..1140 the band below it does and the wire label gets the whole gap to breathe in.
const SYS_X = CONTENT_R - BOX_W;                         // 908..1140
const LANE_DY = CLU.LANE_DY;                             // catalog standard: a lane pair straddles the flow line
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);                  // 80
const { out: SIG_Y, back: REL_Y } = laneY(TOP_CY, LANE_DY);   // 68 / 92, one lane per direction
const WIRE_Y = TOP_BOTTOM + 26;                          // 146
const WIRE_X = midX(KUBE_X + BOX_W, SYS_X);              // 812, centred in the 192 unit gap

// Left band, which only opens up below the panel.
const LADDER_X = LAYOUT.A.ladder.x, LADDER_W = LAYOUT.A.ladder.w;   // 60..540
const LADDER_Y = 250, ROW_H = CLU.ROW_H, ROW_GAP = CLU.ROW_GAP;     // 5 rows -> 250..450
const LADDER_BOTTOM = LADDER_Y + 5 * ROW_H + 4 * ROW_GAP;           // 450

// The chip column is this card's own 520 wide band, not LAYOUT.A.chips at 660: it starts where the
// 540..620 lane corridor ends.
const CHIP_X = 620, CHIP_W = CONTENT_R - CHIP_X;         // 520, 620..1140
// Four chips on the cluster house gap of 8, then hung off the ladder's BOTTOM rather than its top,
// so the two columns close on one line at 450 and the shorter one takes its slack above.
const CHIP_H = CLU.CHIP_H, CHIP_GAP = 8, CHIP_N = 4;
const CHIP_TOP = LADDER_BOTTOM - (CHIP_N * CHIP_H + (CHIP_N - 1) * CHIP_GAP);   // 290
const CHIP_Y = ladder({ y: CHIP_TOP, rowH: CHIP_H, gap: CHIP_GAP });  // 290 / 332 / 374 / 416, bottom 450

// node() draws its own label at NODE_Y + 18, so the Pod row needs the family's 34 of top padding or
// NODE-1 prints on the first Pod. 34 + 106 + 12 is the family 152.
const NODE_H = CLU.NODE.H, NODE_BOTTOM = 624, NODE_Y = NODE_BOTTOM - NODE_H;   // 472..624
const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;// 60..1140
const POD_W = 300, POD_H = CLU.NODE.POD_H;               // 300 / 106
const POD_Y = NODE_Y + CLU.NODE.POD_DY;                  // 506..612
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };
const POD_PAD = 24;
// Fixed WIDTH, derived gap: three 300-wide Pods inset by POD_PAD leave 66 between them.
const POD_X = spread({ from: NODE_X + POD_PAD, to: CONTENT_R - POD_PAD, count: 3, w: POD_W }).x;  // 84 / 450 / 816

// ONE lane, addressed to the Node rather than a Pod inside it. Both SIGTERM phases ride it, and
// WHICH Pods each reaches is carried by the pulses, not by a fan of taps.
const SIG_LANE = [[SPINE_X, TOP_BOTTOM], [SPINE_X, NODE_Y]];

// Two non-critical Pods and one at the system-critical cutoff, which is what buckets them.
const POD_SUBS = ['priority: 0', 'priority: 0', 'priority: 2e9'];

// The list order IS the append order, so it is the z-order: the two top lanes and the wire label,
// the four chips, the signal lane, the packet layer, the ladder, the Node frame and its Pods.
export const SCENE = {
  'aria-label': 'Graceful Node shutdown: the Kubelet holds a delay inhibitor lock, systemd signals it over D-Bus, and the Kubelet sets NotReady, terminates non-critical then critical Pods, then releases the lock',
  parts: [
    P.defs(),
    // Top-row lanes, one per direction, straddling the row centre line by LANE_DY.
    P.arrow({ x1: SYS_X, y1: SIG_Y, x2: KUBE_X + BOX_W, y2: SIG_Y, dim: true, dashed: true }),
    P.arrow({ x1: KUBE_X + BOX_W, y1: REL_Y, x2: SYS_X, y2: REL_Y, dim: true, dashed: true }),
    // Wire label centred in the gap below the top row, populated per step. It renders at 11px from
    // `.scheme-label.code`: do not add a `font-size` attribute and do not size a gap against one.
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
        // The separator column is set by the longest stage name, so every row pads to that width
        // and the dots line up at index 13, the same column the sibling eviction ladder uses.
        '1. signal    ·  systemd PrepareForShutdown over D-Bus',
        '2. condition ·  set NotReady, bucket by priority',
        '3. normal    ·  SIGTERM non-critical, await up to 40s',
        '4. critical  ·  SIGTERM critical, await up to 20s',
        '5. release   ·  drop lock, OS proceeds with shutdown',
      ],
    }),
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    // Bare `g` wrappers with no class of their own: the id tells one Pod's shell and inner box from
    // the next one's, and it is what the fades and the opacity pins address.
    ...POD_SUBS.map((sub, i) => P.pod({
      key: `pod${i + 1}`, id: `pod${i + 1}`, innerKey: `pod${i + 1}Box`,
      x: POD_X(i), y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { ...POD_INNER, label: 'app', sublabel: sub },
    })),
    // Top-row blocks ABSOLUTE LAST.
    P.box({ key: 'systemd', x: SYS_X,  y: TOP_Y, w: BOX_W, h: BOX_H, label: 'systemd', sublabel: 'logind' }),
    P.box({ key: 'kubelet', x: KUBE_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Kubelet', sublabel: 'shutdown manager' }),
  ],
  reset: {
    keys: ['systemd', 'kubelet', 'lockChip', 'gpChip', 'gpCritChip', 'phaseChip'],
    pods: ['pod1', 'pod2', 'pod3'],
  },
};

// The lane ends on the Node frame, which is on screen for the whole card, so it is never pinned to a
// Pod: nothing it points at can go away under it.

// 1200 against a 900ms pulse keeps the Pod on screen while it blinks instead of vanishing mid-blink.
// Settles on OPACITY.terminated, not 0, or it leaves a block-sized hole in the Node frame.
const POD_FADE = 1200;
const GONE = OPACITY.terminated;
const PODS = ['pod1', 'pod2', 'pod3'];
const LIVE = shade(PODS, 1);
const ALL_DOWN = shade(PODS, GONE);
// Each phase is written in exactly two places, so the hand-off is visible: the static END of the
// step that earns it (S-13), and the `rewind` of that same step, which is where it started.
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
    // Idle baseline: nothing is happening yet, no chain row highlighted.
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
    // The Kubelet has not received anything until the signal lands, so the animated path winds the
    // phase back to where the step started and the F.set turns it over when the ball arrives.
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
    // Kubelet flips admission state internally: nothing travels and no block
    // flashes, the phase value change carries the step.
  },
  {
    id: 'terminate-normal',
    duration: 2650,
    narration: 'Kubelet sends SIGTERM to every non-critical Pod in parallel. The window is shutdownGracePeriod minus shutdownGracePeriodCriticalPods (40s here), or the terminationGracePeriodSeconds on the Pod when that is shorter. Each ends up with the status reason Terminated.',
    chips: { lockChip: LOCK_HELD, gpChip: '60s', gpCritChip: '20s', phaseChip: NON_CRIT },
    // Pin final state so cancel between steps does not flash to default. The two non-critical Pods
    // stay on screen as ghosts at the terminated shade, the critical Pod survives at full.
    opacity: { ...LIVE, pod1: GONE, pod2: GONE },
    lit: ['kubelet', 'phaseChip', 'gpChip'],
    chain: 2,
    rewind: { chips: { phaseChip: BUCKETING } },
    // ONE SIGTERM down the one lane, and BOTH non-critical Pods react to it on arrival, which is
    // what the narration means by in parallel. The phase waits for the signal to land too.
    flow: [
      F.route({ points: SIG_LANE, name: 'sig' }),
      F.set({ at: 'sig', chips: { phaseChip: NON_CRIT } }),
      F.pulse({ pod: 'pod1', at: 'sig' }),
      F.pulse({ pod: 'pod2', at: 'sig' }),
      // No `unlight` on either fade: neither terminate step stands a highlight in for the pulse, so
      // there is nothing on the inner box for an onfinish to take back off.
      F.fade({ target: 'pod1', to: GONE, dur: POD_FADE, at: 'sig' }),
      F.fade({ target: 'pod2', to: GONE, dur: POD_FADE, at: 'sig' }),
    ],
  },
  {
    id: 'terminate-critical',
    duration: 3200,
    narration: 'After non-critical Pods are gone (or their grace expired), Kubelet sends SIGTERM to system-critical Pods, again in parallel. The window is shutdownGracePeriodCriticalPods (20s here), capped the same way by terminationGracePeriodSeconds. DaemonSet infra workloads such as CNI or kube-proxy usually sit in this bucket.',
    chips: { lockChip: LOCK_HELD, gpChip: '60s', gpCritChip: '20s', phaseChip: CRITICAL },
    // Pin final state. Nothing is left running in the Node frame, and all three Pods hold the
    // terminated shade rather than leaving three block-sized holes in the Pod row.
    opacity: ALL_DOWN,
    lit: ['kubelet', 'phaseChip', 'gpCritChip'],
    chain: 3,
    rewind: { chips: { phaseChip: NON_CRIT } },
    // SIGTERM reaches the critical Pod: it flinches (pulse) then terminates (fade).
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
    // Pin final state. All three Pods stay on screen at the terminated shade.
    opacity: ALL_DOWN,
    lit: ['kubelet', 'lockChip', 'phaseChip'],
    chain: 4,
    // systemd is not free to proceed until the release actually reaches it, so both chips wind
    // back to what the step started from and turn over when the ball lands.
    rewind: { chips: { lockChip: LOCK_HELD, phaseChip: CRITICAL } },
    flow: [
      F.top({ from: KUBE_X + BOX_W, to: SYS_X, y: REL_Y, name: 'rel', lights: ['systemd'] }),
      F.set({ at: 'rel', chips: { lockChip: LOCK_FREE, phaseChip: RELEASED } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
