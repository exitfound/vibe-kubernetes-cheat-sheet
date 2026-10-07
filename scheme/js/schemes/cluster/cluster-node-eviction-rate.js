import { P, F, defineCard, ladder, strip, spread, midX, shade, CLU, LAYOUT, BEAT, FADE, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-node-eviction-rate.md

// Layout C, ladder right, two zone frames under the panel.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;
const CX = midX(CONTENT_L, CONTENT_R);

const TOP_Y = CLU.TOP_Y, TOP_H = CLU.BOX_H, TOP_BOTTOM = TOP_Y + TOP_H;
// Centred on CX so the two zone drops leave its bottom face as a mirrored pair.
const CTRL_W = CLU.BOX_W, CTRL_X = CX - CTRL_W / 2;

const LADDER_X = LAYOUT.C.ladder.x, LADDER_W = LAYOUT.C.ladder.w;
const LADDER_Y = 136, ROW_H = CLU.ROW_H, ROW_GAP = CLU.ROW_GAP;

// Two zone frames, each holding the head of its taint queue. Shorter than the family frame
// because the slots are plain boxes, not Pod shells (CLU.L-01).
const ZONE_W = 530;
const ZONE_Y = 406, ZONE_H = 126, ZONE_BOTTOM = ZONE_Y + ZONE_H;
const ZONE_X = spread({ from: CONTENT_L, to: CONTENT_R, count: 2, w: ZONE_W }).x;
const ZONE_A_CX = midX(ZONE_X(0), ZONE_X(0) + ZONE_W);
const ZONE_B_CX = midX(ZONE_X(1), ZONE_X(1) + ZONE_W);
const SLOT_W = 235, SLOT_H = 80, SLOT_PAD = 20;
const SLOT_Y = ZONE_Y + CLU.NODE.POD_DY;
const SLOT_X = (z) => spread({ from: ZONE_X(z) + SLOT_PAD, to: ZONE_X(z) + ZONE_W - SLOT_PAD, count: 2, w: SLOT_W }).x;

// Chips two per row: a table, one zone per row, state then rate.
const CHIP_H = CLU.CHIP_H, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = ZONE_BOTTOM + 16;
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

// Both taint lanes leave the controller at mirrored offsets (L-12) and land on the zone top face.
const LANE_DX = 24;
// The left leg runs back inside the panel column, so only the jog depth clears it (L-01).
const JOG_Y = 366;
const LANE_A = [[CX - LANE_DX, TOP_BOTTOM], [CX - LANE_DX, JOG_Y], [ZONE_A_CX, JOG_Y], [ZONE_A_CX, ZONE_Y]];
const LANE_B = [[CX + LANE_DX, TOP_BOTTOM], [CX + LANE_DX, JOG_Y], [ZONE_B_CX, JOG_Y], [ZONE_B_CX, ZONE_Y]];
// Each caption sits below and centred on its leg: the only placement clear of both verticals.
const WIRE_Y = JOG_Y + 18;
const WIRE_A_X = midX(ZONE_A_CX, CX - LANE_DX);
const WIRE_B_X = midX(CX + LANE_DX, ZONE_B_CX);
// The counterfactual caption sits above the arrow entering zone A, outside the frame it names.
const BRANCH_X = ZONE_A_CX, BRANCH_Y = JOG_Y - 16;

// List order is z-order: lanes, captions, chips, packets, ladder, zones and slots, controller last.
export const SCENE = {
  'aria-label': 'Eviction rate limiting across two availability zones: the node-lifecycle-controller taints NotReady Nodes one at a time, at the normal rate while a zone is healthy, at the reduced secondary rate once the unhealthy share of that zone reaches the threshold, at no rate at all while every zone is fully down, and back on a per zone rate as soon as one zone recovers',
  parts: [
    P.defs(),
    P.lane({ points: LANE_A, dim: true, dashed: true }),
    P.lane({ points: LANE_B, dim: true, dashed: true }),
    P.wire({ key: 'wA', x: WIRE_A_X, y: WIRE_Y }),
    P.wire({ key: 'wB', x: WIRE_B_X, y: WIRE_Y }),
    P.wire({ key: 'branch', x: BRANCH_X, y: BRANCH_Y }),
    // The grid is a table: row one is zone A, row two zone B, state left and rate right.
    P.chip({ key: 'zoneAChip',     x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'zone us-east-1a',          value: 'none' }),
    P.chip({ key: 'rateAChip',     x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'us-east-1a eviction rate', value: 'none' }),
    P.chip({ key: 'zoneBChip',     x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'zone us-east-1b',          value: 'none' }),
    P.chip({ key: 'rateBChip',     x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'us-east-1b eviction rate', value: 'none' }),
    P.packets(),
    P.chain({
      key: 'chain', x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. monitor   ·  Ready re-read every 5s, grouped by zone',
        '2. normal    ·  healthy zone, 0.1 Nodes per second',
        '3. reduced   ·  share at or over 0.55, rate drops to 0.01',
        '4. stopped   ·  every zone fully down, nothing tainted',
        '5. resumed   ·  a zone recovers, each zone on its own rate',
      ],
    }),
    P.node({ key: 'zoneA', x: ZONE_X(0), y: ZONE_Y, w: ZONE_W, h: ZONE_H, label: 'zone us-east-1a' }),
    P.node({ key: 'zoneB', x: ZONE_X(1), y: ZONE_Y, w: ZONE_W, h: ZONE_H, label: 'zone us-east-1b' }),
    // Two slots per zone, the head of that zone's queue. The rest of the count is the state chip.
    P.box({ key: 'nodeA1', x: SLOT_X(0)(0), y: SLOT_Y, w: SLOT_W, h: SLOT_H, label: 'Node-17', sublabel: ' ' }),
    P.box({ key: 'nodeA2', x: SLOT_X(0)(1), y: SLOT_Y, w: SLOT_W, h: SLOT_H, label: 'Node-18', sublabel: ' ' }),
    P.box({ key: 'nodeB1', x: SLOT_X(1)(0), y: SLOT_Y, w: SLOT_W, h: SLOT_H, label: 'Node-41', sublabel: ' ' }),
    P.box({ key: 'nodeB2', x: SLOT_X(1)(1), y: SLOT_Y, w: SLOT_W, h: SLOT_H, label: 'Node-42', sublabel: ' ' }),
    // The one actor, last.
    P.box({ key: 'ctrl', x: CTRL_X, y: TOP_Y, w: CTRL_W, h: TOP_H, label: 'controller-manager', sublabel: 'node-lifecycle-controller' }),
  ],
  reset: {
    keys: ['ctrl', 'nodeA1', 'nodeA2', 'nodeB1', 'nodeB2', 'zoneAChip', 'rateAChip', 'zoneBChip', 'rateBChip'],
  },
};

const DOWN = OPACITY.notready;
// The NoExecute taint write is what starts the eviction of a Node's Pods.
const NEXT = 'NotReady · next in queue';
const WAITING = 'NotReady · waiting';
const QUEUED = 'NotReady · queued';
const TAINTED = 'NoExecute taint applied';
const READY = 'Ready';
// Every step writes every slot state, or a Node left alone reads as skipped.
const SLOTS = (a1, a2, b1, b2) => ({ nodeA1: a1, nodeA2: a2, nodeB1: b1, nodeB2: b2 });
const A_DOWN = shade(['nodeA1', 'nodeA2'], DOWN);
const B_UP = shade(['nodeB1', 'nodeB2'], 1);
const B_DOWN = shade(['nodeB1', 'nodeB2'], DOWN);

// P-01: every step states every chip, the poster included.
const A_HEALTHY = '6 of 60 NotReady · 0.10 under 0.55';
const A_SICK = '36 of 60 NotReady · 0.60 at or over 0.55';
const B_HEALTHY = '0 of 60 NotReady · 0.00 under 0.55';
const B_BACK = '4 of 60 NotReady · 0.07 under 0.55';
// Full disruption is a state, not a bigger fraction, and stops eviction only while every zone is in it.
const FULL = '60 of 60 NotReady · zone fully down';
const NORMAL = '--node-eviction-rate 0.1/s';
const SECONDARY = '--secondary-node-eviction-rate 0.01/s';
const STOPPED = 'stopped · every zone fully down';
const TAINT_10 = 'NoExecute taint · 1 Node per 10s';
const TAINT_100 = 'NoExecute taint · 1 Node per 100s';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { zoneAChip: A_HEALTHY, rateAChip: NORMAL, zoneBChip: B_HEALTHY, rateBChip: NORMAL },
    sublabels: SLOTS(NEXT, WAITING, READY, READY),
    opacity: { ...A_DOWN, ...B_UP },
    chain: -1,
  },
  {
    id: 'monitor',
    duration: 3000,
    narration: 'Every --node-monitor-period, 5 seconds by default, the node-lifecycle-controller re-reads the Ready condition of every Node and groups the answers by zone. Six of the sixty Nodes in zone us-east-1a are NotReady, a share of 0.10, and zone us-east-1b is untouched. Both shares are under --unhealthy-zone-threshold 0.55, so both zones count as healthy.',
    chips: { zoneAChip: A_HEALTHY, rateAChip: NORMAL, zoneBChip: B_HEALTHY, rateBChip: NORMAL },
    sublabels: SLOTS(NEXT, WAITING, READY, READY),
    opacity: { ...A_DOWN, ...B_UP },
    // Nothing travels and no chip is cued: neither share moves (P-09a).
    lit: ['ctrl'],
    chain: 0,
    flow: [F.light({ targets: ['nodeA1', 'nodeA2', 'nodeB1', 'nodeB2'], delay: BEAT.lead })],
  },
  {
    id: 'normal-rate',
    duration: 3300,
    narration: 'A healthy zone is worked at --node-eviction-rate, 0.1 Nodes per second by default, which is one Node every 10 seconds. The controller takes Node-17 off the front of the queue for us-east-1a. Its Ready condition reads Unknown rather than False, so the key is node.kubernetes.io/unreachable:NoExecute, and that taint is what starts the eviction of the Pods on it. Node-18 waits its turn.',
    chips: { zoneAChip: A_HEALTHY, rateAChip: NORMAL, zoneBChip: B_HEALTHY, rateBChip: NORMAL },
    wires: { wA: TAINT_10 },
    // S-13: the static block states the end, so the tainted slot winds back until the ball lands.
    sublabels: SLOTS(TAINTED, WAITING, READY, READY),
    rewind: { sublabels: { nodeA1: NEXT } },
    opacity: { ...A_DOWN, ...B_UP },
    lit: ['ctrl'],
    chain: 1,
    // The controller decides with no preceding hop, so the ball waits BEAT.lead (M-18).
    flow: [
      F.route({ points: LANE_A, delay: BEAT.lead, name: 'taint', lights: ['nodeA1'] }),
      F.set({ at: 'taint', sublabels: { nodeA1: TAINTED } }),
    ],
  },
  {
    id: 'zone-unhealthy',
    duration: 3600,
    narration: 'A rack switch fails and 36 of the 60 Nodes in us-east-1a stop answering. The share reaches 0.60, at or over the 0.55 threshold and past its 3 Node floor, so the zone is unhealthy and drops to --secondary-node-eviction-rate, 0.01 per second. A zone that loses every Node goes back to the normal rate instead, so the work can move out. The picture stands still because the next taint here is 100 seconds away.',
    chips: { zoneAChip: A_SICK, rateAChip: SECONDARY, zoneBChip: B_HEALTHY, rateBChip: NORMAL },
    // T-35: the counterfactual sits above the branch it names, outside the zone A frame.
    wires: { branch: 'if instead the zone had 50 Nodes or fewer · rate 0' },
    sublabels: SLOTS(TAINTED, WAITING, READY, READY),
    opacity: { ...A_DOWN, ...B_UP },
    // Nothing travels on purpose: the next taint is 100 seconds out, so the still frame is the rate.
    lit: ['ctrl', 'zoneAChip', 'rateAChip'],
    chain: 2,
  },
  {
    id: 'all-zones',
    duration: 3100,
    narration: 'The outage spreads until not one Node in either zone answers, 60 of 60 in each. Only with every zone fully down does the node-lifecycle-controller read this as a problem between the control plane and the Nodes rather than as 120 dead machines, and it stops evicting everywhere: no Node is tainted in either zone while that holds.',
    chips: { zoneAChip: FULL, rateAChip: STOPPED, zoneBChip: FULL, rateBChip: STOPPED },
    sublabels: SLOTS(TAINTED, WAITING, QUEUED, QUEUED),
    // S-13, P-03: the chips wind back so none counts zone B out while its slots still read Ready.
    rewind: {
      chips: { zoneAChip: A_SICK, zoneBChip: B_HEALTHY, rateAChip: SECONDARY, rateBChip: NORMAL },
      sublabels: { nodeB1: READY, nodeB2: READY },
    },
    opacity: { ...A_DOWN, ...B_DOWN },
    lit: ['ctrl', 'zoneAChip', 'zoneBChip', 'rateAChip', 'rateBChip'],
    chain: 3,
    // Zone B losing contact is the only motion. No ball rides either lane, which is the point.
    flow: [
      F.fade({ target: 'nodeB1', to: DOWN, dur: FADE.out, delay: BEAT.lead }),
      F.fade({ target: 'nodeB2', to: DOWN, dur: FADE.out, delay: BEAT.lead }),
      F.set({
        delay: BEAT.lead,
        chips: { zoneAChip: FULL, zoneBChip: FULL, rateAChip: STOPPED, rateBChip: STOPPED },
        sublabels: { nodeB1: QUEUED, nodeB2: QUEUED },
      }),
    ],
  },
  {
    id: 'resumed',
    duration: 3300,
    narration: 'The partition clears. Most of us-east-1b answers again, 4 of 60 NotReady, and us-east-1a comes back to the 36 of 60 it had. No zone is fully down now, so eviction resumes with each zone rated on its own: us-east-1b is healthy and taints at 0.1 per second while us-east-1a is over the threshold and taints at 0.01. The Pods on the Nodes that stayed unreachable are evicted after all.',
    chips: { zoneAChip: A_SICK, rateAChip: SECONDARY, zoneBChip: B_BACK, rateBChip: NORMAL },
    wires: { wA: TAINT_100, wB: TAINT_10 },
    sublabels: SLOTS(TAINTED, TAINTED, READY, TAINTED),
    // P-03: everything the recovery produces turns over on it, not ahead of the first ball.
    rewind: {
      chips: { zoneAChip: FULL, zoneBChip: FULL, rateAChip: STOPPED, rateBChip: STOPPED },
      sublabels: { nodeA2: WAITING, nodeB1: QUEUED, nodeB2: QUEUED },
      wires: { wA: '', wB: '' },
    },
    // Node-42 stayed unreachable, so it holds its shade while tainted.
    opacity: { ...A_DOWN, nodeB1: 1, nodeB2: DOWN },
    lit: ['ctrl', 'zoneAChip', 'zoneBChip', 'rateAChip', 'rateBChip'],
    chain: 4,
    // Node-41 comes back before either ball leaves. Both zones are then worked at once.
    flow: [
      F.fade({ target: 'nodeB1', from: DOWN, to: 1, dur: FADE.in, easing: 'ease-out', name: 'recover' }),
      F.set({
        at: 'recover',
        chips: { zoneAChip: A_SICK, zoneBChip: B_BACK, rateAChip: SECONDARY, rateBChip: NORMAL },
        sublabels: { nodeB1: READY },
        wires: { wA: TAINT_100, wB: TAINT_10 },
      }),
      F.route({ points: LANE_A, delay: BEAT.lead, name: 'slow', lights: ['nodeA2'] }),
      F.route({ points: LANE_B, delay: BEAT.lead, name: 'fast', lights: ['nodeB2'] }),
      F.set({ at: 'slow', sublabels: { nodeA2: TAINTED } }),
      F.set({ at: 'fast', sublabels: { nodeB2: TAINTED } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
