import { P, F, defineCard, midX, strip, laneOf, CLU, FADE, OPACITY } from './cluster-kit.js';

// One column, centred on the canvas, and every replica reaches the Lease on its own axis.
// Design notes for this card: ./CARDS/cluster-leader-election.md
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;
const CX = midX(CONTENT_L, CONTENT_R);
const PANEL_B = 130;                                     // measured panel bottom at 1100x800

const REP_W = 232, REP_H = 80, REP_GAP = 30;
const STACK_W = 3 * REP_W + 2 * REP_GAP;
const STACK_L = CX - STACK_W / 2;
const REP_XS = [0, 1, 2].map(i => STACK_L + i * (REP_W + REP_GAP));
const REP_CXS = REP_XS.map(x => midX(x, x + REP_W));

// The row starts below PANEL_B because its left third sits in the panel column.
const REP_Y = PANEL_B + 15, REP_BOTTOM = REP_Y + REP_H;

const ROW_H = 34;
const ROLE_Y = REP_BOTTOM + 12, ROLE_BOTTOM = ROLE_Y + ROW_H;

// One request and one answer lane per replica, on its own axis: a shared corridor would hide
// which answer belongs to which replica.
const LANE_DX = CLU.LANE_DY;                             // request lane left, answer lane right
const LANE_RUN = 130;                                    // the straight drop from role chip to Lease

const LEASE_X = STACK_L, LEASE_W = STACK_W;
const LEASE_Y = ROLE_BOTTOM + LANE_RUN, LEASE_H = 80;
const LEASE_TOP = LEASE_Y;

// Built once per replica, so wire and ball read one array.
const PUT = REP_CXS.map(cx => [[cx - LANE_DX, ROLE_BOTTOM], [cx - LANE_DX, LEASE_TOP]]);
const ACK = REP_CXS.map(cx => [[cx + LANE_DX, LEASE_TOP], [cx + LANE_DX, ROLE_BOTTOM]]);

const FIELD_GAP = 20;
const FIELD = strip({ from: LEASE_X, to: LEASE_X + LEASE_W, count: 3, gap: FIELD_GAP });

const HOLDER_Y = LEASE_Y + LEASE_H + 16;
const FIELD_Y = HOLDER_Y + ROW_H + 10;

// Mid-run of the lane pair, so a result label sits on the axis of its replica.
const WIRE_Y = midX(ROLE_BOTTOM, LEASE_TOP) + 4;
const WIRE_DX = LANE_DX + 12;                            // start-anchored 12 clear of the answer lane

const IDLE_LOOPS = 'no control loops', STARTING_LOOPS = 'control loops starting';
const RUNNING_LOOPS = 'Deployment · ReplicaSet · Job';

// The list order is the z-order: the replicas and the Lease draw above the ball.
export const SCENE = {
  'aria-label': 'Leader election via Lease: acquire, renew, expire, failover',
  parts: [
    P.defs(),
    P.chip({ key: 'v1', x: REP_XS[0], y: ROLE_Y, w: REP_W, h: ROW_H, name: 'role', value: 'standby' }),
    P.chip({ key: 'v2', x: REP_XS[1], y: ROLE_Y, w: REP_W, h: ROW_H, name: 'role', value: 'standby' }),
    P.chip({ key: 'v3', x: REP_XS[2], y: ROLE_Y, w: REP_W, h: ROW_H, name: 'role', value: 'standby' }),
    // Keyed per replica: a lane takes min(source, sink), so an unreachable replica dims its lanes.
    ...PUT.flatMap((put, i) => [
      P.lane({ key: `put${i + 1}`, points: put, dim: true, dashed: true }),
      P.lane({ key: `ack${i + 1}`, points: ACK[i], dim: true, dashed: true }),
    ]),
    P.wire({ key: 'w1', x: REP_CXS[0] + WIRE_DX, y: WIRE_Y, anchor: 'start' }),
    P.wire({ key: 'w2', x: REP_CXS[1] + WIRE_DX, y: WIRE_Y, anchor: 'start' }),
    P.wire({ key: 'w3', x: REP_CXS[2] + WIRE_DX, y: WIRE_Y, anchor: 'start' }),
    P.chip({ key: 'holderChip', x: LEASE_X, y: HOLDER_Y, w: LEASE_W, h: ROW_H, name: 'holderIdentity', value: 'none' }),
    P.chip({ key: 'durChip', x: FIELD.x(0), y: FIELD_Y, w: FIELD.w, h: ROW_H, name: 'leaseDurationSeconds', value: '15s' }),
    // Named for the age, not the field: renewTime is a MicroTime, the chip shows how old it is.
    P.chip({ key: 'renewChip', x: FIELD.x(1), y: FIELD_Y, w: FIELD.w, h: ROW_H, name: 'renewTime age', value: 'none' }),
    P.chip({ key: 'transChip', x: FIELD.x(2), y: FIELD_Y, w: FIELD.w, h: ROW_H, name: 'leaseTransitions', value: '0' }),
    P.packets(),
    // The sublabel is what each replica runs, written per step.
    P.box({ key: 'r1', x: REP_XS[0], y: REP_Y, w: REP_W, h: REP_H, label: 'Controller-mgr-1', sublabel: IDLE_LOOPS }),
    P.box({ key: 'r2', x: REP_XS[1], y: REP_Y, w: REP_W, h: REP_H, label: 'Controller-mgr-2', sublabel: IDLE_LOOPS }),
    P.box({ key: 'r3', x: REP_XS[2], y: REP_Y, w: REP_W, h: REP_H, label: 'Controller-mgr-3', sublabel: IDLE_LOOPS }),
    P.box({ key: 'lease', x: LEASE_X, y: LEASE_Y, w: LEASE_W, h: LEASE_H, label: 'Lease', sublabel: 'kube-controller-manager · coordination.k8s.io/v1' }),
  ],
  reset: { keys: ['r1', 'r2', 'r3', 'v1', 'v2', 'v3', 'lease', 'holderChip', 'durChip', 'renewChip', 'transChip'] },
};

// The call varies by step, so the helper is not named after one.
const exchange = (i, name) => [
  F.route({ points: PUT[i], name }),
  F.route({ points: ACK[i], after: name }),
];

// One factory for blocks and lanes together, so the two cannot drift.
const stage = (r1 = 1) => ({
  r1, r2: 1, r3: 1,
  put1: laneOf(r1, 1), ack1: laneOf(r1, 1),
  put2: 1, ack2: 1, put3: 1, ack3: 1,
});

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { v1: 'standby', v2: 'standby', v3: 'standby', holderChip: 'none', durChip: '15s', renewChip: 'none', transChip: '0' },
    sublabels: { r1: IDLE_LOOPS, r2: IDLE_LOOPS, r3: IDLE_LOOPS },
    opacity: stage(),
  },
  {
    id: 'acquire',
    duration: 2700,
    narration: 'All three replicas race for the Lease. The first write creates it and its sender becomes holder. Every write after that is a compare-and-swap on resourceVersion.',
    // The role chip holds a role. The 409 already rides the wires.
    chips: { v1: 'leader', v2: 'standby', v3: 'standby', holderChip: 'Controller-mgr-1', durChip: '15s', renewChip: '0s', transChip: '0' },
    sublabels: { r1: STARTING_LOOPS, r2: IDLE_LOOPS, r3: IDLE_LOOPS },
    // A create on the first acquisition (201 or 409 AlreadyExists), later races are updates.
    wires: { w1: 'POST 201 Created', w2: 'POST 409 AlreadyExists', w3: 'POST 409 AlreadyExists' },
    opacity: stage(),
    lit: ['r1', 'r2', 'r3', 'v1', 'v2', 'v3', 'holderChip', 'renewChip'],
    rewind: {
      chips: { v1: 'standby', holderChip: 'none', renewChip: 'none' },
      sublabels: { r1: IDLE_LOOPS },
    },
    // The Lease lights when the winning write lands.
    flow: [
      ...exchange(0, 'wins'),
      F.light({ targets: ['lease'], at: 'wins' }),
      F.set({
        at: 'wins',
        chips: { v1: 'leader', holderChip: 'Controller-mgr-1', renewChip: '0s' },
        sublabels: { r1: STARTING_LOOPS },
      }),
      ...exchange(1, 'race2'),
      ...exchange(2, 'race3'),
    ],
  },
  {
    id: 'renew',
    duration: 2700,
    // The standby polls are drawn, do not reword the sentence to match empty lanes.
    narration: 'Only the leader runs control loops. It PUTs a fresh renewTime well inside leaseDurationSeconds (15s), and the standbys only GET the Lease to check it.',
    chips: { v1: 'leader · reconciling', v2: 'standby · polling', v3: 'standby · polling', holderChip: 'Controller-mgr-1', durChip: '15s', renewChip: '2s', transChip: '0' },
    sublabels: { r1: RUNNING_LOOPS, r2: IDLE_LOOPS, r3: IDLE_LOOPS },
    wires: { w1: 'PUT renewTime', w2: 'GET Lease', w3: 'GET Lease' },
    opacity: stage(),
    lit: ['r1', 'r2', 'r3', 'v1', 'v2', 'v3', 'renewChip'],
    rewind: { chips: { renewChip: '0s' } },
    flow: [
      ...exchange(0, 'renewal'),
      F.light({ targets: ['lease'], at: 'renewal' }),
      F.set({ at: 'renewal', chips: { renewChip: '2s' } }),
      ...exchange(1, 'poll2'),
      ...exchange(2, 'poll3'),
    ],
  },
  {
    id: 'expire',
    duration: 2200,
    narration: 'Controller-mgr-1 crashes or is partitioned. A partitioned leader stands down at its renew deadline (10s), and a standby may acquire after leaseDurationSeconds.',
    // Not "polling": nothing travels on this step.
    chips: { v1: 'unreachable', v2: 'standby · may acquire', v3: 'standby · may acquire', holderChip: 'Controller-mgr-1', durChip: '15s', renewChip: '> 15s', transChip: '0' },
    sublabels: { r1: IDLE_LOOPS, r2: IDLE_LOOPS, r3: IDLE_LOOPS },
    opacity: stage(OPACITY.notready),
    lit: ['v1', 'v2', 'v3', 'renewChip', 'holderChip'],
    // The dead leader fades with its two lanes on one timing, no packet travels.
    flow: ['r1', 'put1', 'ack1'].map(target =>
      F.fade({ target, from: 1, to: OPACITY.notready, dur: FADE.out, fill: 'forwards', easing: 'ease-in' })),
  },
  {
    id: 'failover',
    duration: 2700,
    narration: 'With the Lease expired, both survivors race again. Controller-mgr-2 wins the CAS and becomes holder, so the control loops resume there within about a lease duration.',
    chips: { v1: 'unreachable', v2: 'leader', v3: 'standby', holderChip: 'Controller-mgr-2', durChip: '15s', renewChip: '0s', transChip: '1' },
    sublabels: { r1: IDLE_LOOPS, r2: STARTING_LOOPS, r3: IDLE_LOOPS },
    wires: { w2: 'PUT 200 OK', w3: 'PUT 409 Conflict' },
    opacity: stage(OPACITY.notready),
    // mgr-3 also sends a CAS-PUT and takes the 409, so both survivors light.
    lit: ['r2', 'v2', 'r3', 'v3', 'holderChip', 'renewChip', 'transChip'],
    rewind: {
      chips: {
        v2: 'standby · may acquire', v3: 'standby · may acquire',
        holderChip: 'Controller-mgr-1', renewChip: '> 15s', transChip: '0',
      },
      sublabels: { r2: IDLE_LOOPS },
    },
    flow: [
      ...exchange(1, 'wins'),
      F.light({ targets: ['lease'], at: 'wins' }),
      F.set({
        at: 'wins',
        chips: { v2: 'leader', v3: 'standby', holderChip: 'Controller-mgr-2', renewChip: '0s', transChip: '1' },
        sublabels: { r2: STARTING_LOOPS },
      }),
      ...exchange(2, 'loses'),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
