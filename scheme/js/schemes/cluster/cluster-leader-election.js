import { P, F, defineCard, midX, strip, FADE, OPACITY } from './cluster-kit.js';

// One column, centred on the canvas, and every replica reaches the Lease on its own axis.
// Design notes for this card: ./CARDS.md#cluster-leader-election
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = midX(CONTENT_L, CONTENT_R);                   // 600, the canvas centre line
const PANEL_B = 155;                                     // measured worst case over 1600/1280/1100: 400 wide

// The column: three standard boxes and their two gaps, centred on CX. Every block below takes it.
const REP_W = 220, REP_H = 80, REP_GAP = 30;
const STACK_W = 3 * REP_W + 2 * REP_GAP;                 // 720
const STACK_L = CX - STACK_W / 2;                        // 240..960
const REP_XS = [0, 1, 2].map(i => STACK_L + i * (REP_W + REP_GAP));  // 240 / 490 / 740
const REP_CXS = REP_XS.map(x => midX(x, x + REP_W));     // 350 / 600 / 850

// The row is pinned by the PANEL, not the canvas centre: centred horizontally its left third sits
// in the panel's column, so it starts below PANEL_B with 15 units of clearance.
const REP_Y = PANEL_B + 15, REP_BOTTOM = REP_Y + REP_H;  // 170 / 250

const ROW_H = 34;
const ROLE_Y = REP_BOTTOM + 12, ROLE_BOTTOM = ROLE_Y + ROW_H;   // 262 / 296

// One PUT lane and one answer lane per replica, both vertical on that replica's own axis. A shared
// horizontal corridor puts six routes on one line and hides which answer belongs to which replica.
const LANE_DX = 10;                                      // request lane left, answer lane right
const LANE_RUN = 56;                                     // the straight drop from role chip to Lease

const LEASE_X = STACK_L, LEASE_W = STACK_W;              // 240..960, the replica column
const LEASE_Y = ROLE_BOTTOM + LANE_RUN, LEASE_H = 80;    // 352..432
const LEASE_TOP = LEASE_Y;

// The request goes down the left lane (cx-10) from the role chip to the Lease, the answer back up
// the right one. Wire and packet share one points array, so a ball cannot leave its own lane.
const putRoute = cx => [[cx - LANE_DX, ROLE_BOTTOM], [cx - LANE_DX, LEASE_TOP]];
const ackRoute = cx => [[cx + LANE_DX, LEASE_TOP], [cx + LANE_DX, ROLE_BOTTOM]];

// The three Lease fields split the column with the same 20 unit gap the row above uses: fixed GAP,
// derived width. strip reproduces (LEASE_W - 2 * FIELD_GAP) / 3 to the bit, 226.66666666666666.
const FIELD_GAP = 20;
const FIELD = strip({ from: LEASE_X, to: LEASE_X + LEASE_W, count: 3, gap: FIELD_GAP });  // w 226.67

const HOLDER_Y = LEASE_Y + LEASE_H + 16;                 // 448..482
const FIELD_Y = HOLDER_Y + ROW_H + 10;                   // 492..526, the bottom of the band

// Mid-run of the lane pair, so a result label sits on the axis of the replica that received it.
const WIRE_Y = midX(ROLE_BOTTOM, LEASE_TOP) + 4;         // 328

// The list order IS the append order, so it is the z-order: the three replicas and the Lease go
// absolute last, so they render on top of the packet layer.
export const SCENE = {
  'aria-label': 'Leader election via Lease: acquire, renew, expire, failover',
  parts: [
    P.defs(),
    // role chip under each replica.
    P.chip({ key: 'v1', x: REP_XS[0], y: ROLE_Y, w: REP_W, h: ROW_H, name: 'role', value: 'standby' }),
    P.chip({ key: 'v2', x: REP_XS[1], y: ROLE_Y, w: REP_W, h: ROW_H, name: 'role', value: 'standby' }),
    P.chip({ key: 'v3', x: REP_XS[2], y: ROLE_Y, w: REP_W, h: ROW_H, name: 'role', value: 'standby' }),
    // Each replica's CAS exchange is a parallel pair on its own axis: PUT straight down the left
    // lane, 409 or 200 straight back up the right one.
    ...REP_CXS.flatMap(cx => [
      P.lane({ points: putRoute(cx), dim: true, dashed: true }),
      P.lane({ points: ackRoute(cx), dim: true, dashed: true }),
    ]),
    // PUT result labels, set per step, beside each replica's own lane pair at mid-run, so the
    // answer a step reports sits on the axis of the replica that received it.
    P.wire({ key: 'w1', x: REP_CXS[0] + 22, y: WIRE_Y, anchor: 'start' }),
    P.wire({ key: 'w2', x: REP_CXS[1] + 22, y: WIRE_Y, anchor: 'start' }),
    P.wire({ key: 'w3', x: REP_CXS[2] + 22, y: WIRE_Y, anchor: 'start' }),
    // Lease fields, grouped directly under it. holderIdentity is the headline.
    P.chip({ key: 'holderChip', x: LEASE_X, y: HOLDER_Y, w: LEASE_W, h: ROW_H, name: 'holderIdentity', value: 'none' }),
    P.chip({ key: 'durChip', x: FIELD.x(0), y: FIELD_Y, w: FIELD.w, h: ROW_H, name: 'leaseDurationSeconds', value: '15s' }),
    P.chip({ key: 'renewChip', x: FIELD.x(1), y: FIELD_Y, w: FIELD.w, h: ROW_H, name: 'renewTime', value: 'none' }),
    P.chip({ key: 'transChip', x: FIELD.x(2), y: FIELD_Y, w: FIELD.w, h: ROW_H, name: 'leaseTransitions', value: '0' }),
    P.packets(),
    // Three controller-manager replicas (standard 220x80), the row centred on CX and flush with the
    // Lease on both edges. Appended LAST, with the Lease, so they render on top of packetLayer.
    P.box({ key: 'r1', x: REP_XS[0], y: REP_Y, w: REP_W, h: REP_H, label: 'Controller-mgr-1' }),
    P.box({ key: 'r2', x: REP_XS[1], y: REP_Y, w: REP_W, h: REP_H, label: 'Controller-mgr-2' }),
    P.box({ key: 'r3', x: REP_XS[2], y: REP_Y, w: REP_W, h: REP_H, label: 'Controller-mgr-3' }),
    // The Lease object all three watch and contend for.
    P.box({ key: 'lease', x: LEASE_X, y: LEASE_Y, w: LEASE_W, h: LEASE_H, label: 'Lease', sublabel: 'kube-controller-manager · coordination.k8s.io/v1' }),
  ],
  reset: { keys: ['r1', 'r2', 'r3', 'v1', 'v2', 'v3', 'lease', 'holderChip', 'durChip', 'renewChip', 'transChip'] },
};

// One request/answer exchange per replica axis: the call VARIES by step, so do not name it after
// one. It returns the two flow ENTRIES, which spread into the program in their emission order.
const exchange = (cx, name) => [
  F.route({ points: putRoute(cx), name }),
  F.route({ points: ackRoute(cx), after: name }),
];

const LIVE = { r1: 1, r2: 1, r3: 1 };
// Pin final opacity inline so a cancel between steps does not flash to default.
const LEADER_GONE = { r1: OPACITY.notready, r2: 1, r3: 1 };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { v1: 'standby', v2: 'standby', v3: 'standby', holderChip: 'none', durChip: '15s', renewChip: 'none', transChip: '0' },
    opacity: LIVE,
  },
  {
    id: 'acquire',
    duration: 2700,
    narration: 'All three replicas race for the Lease. The first write creates the object, so Controller-mgr-1 becomes holder and the other two get 409. Every write after that is a compare-and-swap on resourceVersion.',
    // The role chip holds a ROLE. The 409 is a response code and already rides both wires below,
    // so putting it here duplicates the wire and then decays with nothing marking the change.
    chips: { v1: 'leader', v2: 'standby', v3: 'standby', holderChip: 'Controller-mgr-1', durChip: '15s', renewChip: 'fresh', transChip: '0' },
    // The verbs differ from failover on purpose: this is the FIRST acquisition, a create (201, or
    // AlreadyExists 409). Later races are updates guarded by resourceVersion.
    wires: { w1: 'POST 201 Created', w2: 'POST 409', w3: 'POST 409' },
    opacity: LIVE,
    lit: ['r1', 'r2', 'r3', 'v1', 'v2', 'v3', 'holderChip', 'renewChip'],
    // Three creates leave together, each answered on its own lane. The Lease lights when the
    // WINNING write lands, the same shape renew uses.
    flow: [
      ...exchange(REP_CXS[0], 'wins'),
      F.light({ targets: ['lease'], at: 'wins' }),
      ...exchange(REP_CXS[1], 'race2'),
      ...exchange(REP_CXS[2], 'race3'),
    ],
  },
  {
    id: 'renew',
    // Three exchanges, but they run in parallel on three separate axes, so the span is unchanged at
    // 2060 and the duration stays where it was.
    duration: 2700,
    // The standby poll is DRAWN rather than written around: client-go polls the Lease every
    // RetryPeriod, so the standbys are not idle. Do not reword the sentence to match empty lanes.
    narration: 'Only the leader runs control loops (Deployment, ReplicaSet, Job and the rest). It PUTs a fresh renewTime well inside leaseDurationSeconds (15s), and the standbys only GET the Lease to check it.',
    chips: { v1: 'leader · reconciling', v2: 'standby · polling', v3: 'standby · polling', holderChip: 'Controller-mgr-1', durChip: '15s', renewChip: 'fresh', transChip: '0' },
    wires: { w1: 'PUT renewTime', w2: 'GET Lease', w3: 'GET Lease' },
    opacity: LIVE,
    lit: ['r1', 'r2', 'r3', 'v1', 'v2', 'v3', 'renewChip'],
    flow: [
      // A renewal is the same CAS-PUT and comes back 200, so it rides the answer lane home like
      // every other PUT here. Without it mgr-1's answer lane is the one drawn lane nothing rides.
      ...exchange(REP_CXS[0], 'renewal'),
      F.light({ targets: ['lease'], at: 'renewal' }),
      // The two standby polls, the same shape: a read down the request lane, the answer back up the
      // reply lane. Without them the sentence named a GET per standby that no lane ever carried.
      ...exchange(REP_CXS[1], 'poll2'),
      ...exchange(REP_CXS[2], 'poll3'),
    ],
  },
  {
    id: 'expire',
    duration: 2200,
    narration: 'Controller-mgr-1 crashes or its network partitions, so renewals stop. Once leaseDurationSeconds passes with no new renewTime, the Lease counts as expired and any replica may CAS-acquire it.',
    // Not "polling": this step animates nothing, so a chip naming traffic points at two empty
    // lanes. What actually changes here is that both standbys become eligible to take the Lease.
    chips: { v1: 'unreachable', v2: 'standby · may acquire', v3: 'standby · may acquire', holderChip: 'Controller-mgr-1 (stale)', durChip: '15s', renewChip: 'stale (>15s)', transChip: '0' },
    opacity: LEADER_GONE,
    lit: ['v1', 'v2', 'v3', 'renewChip', 'holderChip'],
    // The dead leader fades out; the stale renewTime is the event, no packet travels.
    flow: [F.fade({ target: 'r1', from: 1, to: OPACITY.notready, dur: FADE.out, fill: 'forwards', easing: 'ease-in' })],
  },
  {
    id: 'failover',
    duration: 2700,
    narration: 'With the Lease expired, both survivors race again. Controller-mgr-2 wins the CAS, holderIdentity flips to its name and leaseTransitions increments. Control loops resume there within about a lease duration.',
    chips: { v1: 'unreachable', v2: 'leader', v3: 'standby', holderChip: 'Controller-mgr-2', durChip: '15s', renewChip: 'fresh', transChip: '1' },
    wires: { w2: 'PUT 200 OK', w3: 'PUT 409' },
    opacity: LEADER_GONE,
    // Both survivors take part in this race, so both light: mgr-3 sends a CAS-PUT and takes
    // the 409 its own wire label reports. Only mgr-1 is out, and it is dimmed rather than lit.
    lit: ['r2', 'v2', 'r3', 'v3', 'holderChip', 'renewChip', 'transChip'],
    // The two survivors race, and each is answered: mgr-2 takes the 200 OK, mgr-3 the 409.
    // The Lease lights on the winning write landing, not before it.
    flow: [
      ...exchange(REP_CXS[1], 'wins'),
      F.light({ targets: ['lease'], at: 'wins' }),
      ...exchange(REP_CXS[2], 'loses'),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
