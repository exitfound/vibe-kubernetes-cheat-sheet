import { LANE_DY, P, F, defineCard, laneY, ladder, midX, shade, laneOf, BEAT, FADE, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-etcd-raft.md

// Laid out on the L with the narration panel almost touching CYL_Y, so narration has a hard character ceiling.
const M = 40;
const CONTENT_L = M, CONTENT_R = 1200 - M;
const CX = midX(CONTENT_L, CONTENT_R);

const CYL_W = 200, CYL_H = 130, CYL_GAP = 60;
// The API is level with the row, so CYL_Y is as high as the API can sit and still clear the panel.
const CYL_Y = 230, CYL_BOTTOM = CYL_Y + CYL_H;
const CYL_CY = midX(CYL_Y, CYL_BOTTOM);
// Derived, so the right edge stays on CONTENT_R when the row moves.
const ROW_W = 3 * CYL_W + 2 * CYL_GAP;
const ROW_X = CONTENT_R - ROW_W;
const CYL_XS = [0, 1, 2].map(i => ROW_X + i * (CYL_W + CYL_GAP));
const CYL_CXS = CYL_XS.map(x => midX(x, x + CYL_W));

const ROW_H = 34;
// The tie gap fits at least three dashes, so the relation reads as a line, not a tick.
const ROLE_Y = CYL_BOTTOM + 30;
// Role row, log row and the state column ride one rhythm off ROLE_Y.
const ROW_Y = ladder({ y: ROLE_Y, rowH: ROW_H, gap: 10 });
const LOG_Y = ROW_Y(1);

const API_W = 232, API_H = 80;
const API_X = CONTENT_L, API_R = API_X + API_W;
const API_Y = CYL_CY - API_H / 2;  // level with the ETCD row
// Every exchange is a round trip, so each row line is a lane pair mirrored on each face.
const { out: ROW_OUT, back: ROW_BACK } = laneY(CYL_CY, LANE_DY);
const API_TO_E1 = [[API_R, ROW_OUT], [CYL_XS[0], ROW_OUT]];
const E1_TO_API = [[CYL_XS[0], ROW_BACK], [API_R, ROW_BACK]];
const E1_TO_E2  = [[CYL_XS[0] + CYL_W, ROW_OUT], [CYL_XS[1], ROW_OUT]];
const E2_TO_E1  = [[CYL_XS[1], ROW_BACK], [CYL_XS[0] + CYL_W, ROW_BACK]];

// The replication arc rides above the row, between the leader and the far follower. The riser
// is what fills the top of the canvas, so it carries the band top rather than the cylinders.
const ARC_RISE = 80;
const ARC_Y = CYL_Y - ARC_RISE;
// The far Follower arcs are concentric, which takes opposite stubs at the two ends.
const ARC_BACK_Y = ARC_Y + 2 * LANE_DY;  // the stub gap inside the outbound arc
const REPLICATE = [[CYL_CXS[0] - LANE_DY, CYL_Y], [CYL_CXS[0] - LANE_DY, ARC_Y], [CYL_CXS[2] + LANE_DY, ARC_Y], [CYL_CXS[2] + LANE_DY, CYL_Y]];
const ACK_E3    = [[CYL_CXS[2] - LANE_DY, CYL_Y], [CYL_CXS[2] - LANE_DY, ARC_BACK_Y], [CYL_CXS[0] + LANE_DY, ARC_BACK_Y], [CYL_CXS[0] + LANE_DY, CYL_Y]];

// State chips under the API, in its column, so the four blocks read as one column.
const SCHIP_X = API_X, SCHIP_W = API_W;

// Append order is z-order: replicas, chips, API, lanes, ties, wire labels, then the packet layer.
export const SCENE = {
  'aria-label': 'ETCD Raft Consensus: the API sends a write to the Leader of three ETCD replicas, which appends it, replicates it to both Followers, commits once a majority has stored it, carries the commit index on the next heartbeat, and stops writing when quorum is lost',
  parts: [
    P.defs(),
    // Scale 1.0, no shrink wrapper, so block text matches the other cards.
    P.group({
      parts: [
        P.cylinder({ key: 'e1', x: CYL_XS[0], y: CYL_Y, w: CYL_W, h: CYL_H, label: 'ETCD-1' }),
        P.cylinder({ key: 'e2', x: CYL_XS[1], y: CYL_Y, w: CYL_W, h: CYL_H, label: 'ETCD-2' }),
        P.cylinder({ key: 'e3', x: CYL_XS[2], y: CYL_Y, w: CYL_W, h: CYL_H, label: 'ETCD-3' }),
        // term/acks/quorum on the role and log row pitch, in the API column.
        P.chip({ key: 'termChip', x: SCHIP_X, y: ROW_Y(0), w: SCHIP_W, h: ROW_H, name: 'term', value: '4' }),
        // acks counts the two Followers, quorum counts all three replicas.
        P.chip({ key: 'acksChip', x: SCHIP_X, y: ROW_Y(1), w: SCHIP_W, h: ROW_H, name: 'acks from Followers', value: 'idle' }),
        P.chip({ key: 'quorumChip', x: SCHIP_X, y: ROW_Y(2), w: SCHIP_W, h: ROW_H, name: 'quorum', value: '2 of 3' }),
        P.chip({ key: 'r1', x: CYL_XS[0], y: ROLE_Y, w: CYL_W, h: ROW_H, name: 'role', value: 'Leader' }),
        P.chip({ key: 'r2', x: CYL_XS[1], y: ROLE_Y, w: CYL_W, h: ROW_H, name: 'role', value: 'Follower' }),
        P.chip({ key: 'r3', x: CYL_XS[2], y: ROLE_Y, w: CYL_W, h: ROW_H, name: 'role', value: 'Follower' }),
        P.chip({ key: 'l1', x: CYL_XS[0], y: LOG_Y, w: CYL_W, h: ROW_H, name: 'log/commit', value: '8 / 8' }),
        P.chip({ key: 'l2', x: CYL_XS[1], y: LOG_Y, w: CYL_W, h: ROW_H, name: 'log/commit', value: '8 / 8' }),
        P.chip({ key: 'l3', x: CYL_XS[2], y: LOG_Y, w: CYL_W, h: ROW_H, name: 'log/commit', value: '8 / 8' }),
        P.box({ key: 'api', x: API_X, y: API_Y, w: API_W, h: API_H, label: 'API' }),
        // Lanes touching a Follower are keyed, so they fade with it (see SILENT).
        P.lane({ points: API_TO_E1, dim: true, dashed: true }),
        P.lane({ points: E1_TO_API, dim: true, dashed: true }),
        P.lane({ key: 'laneE2Out', points: E1_TO_E2, dim: true, dashed: true }),
        P.lane({ key: 'laneE2Back', points: E2_TO_E1, dim: true, dashed: true }),
        P.lane({ key: 'laneE3Out', points: REPLICATE, dim: true, dashed: true }),
        P.lane({ key: 'laneE3Back', points: ACK_E3, dim: true, dashed: true }),
        // A binding, not flow, so it goes through relationPath.
        ...CYL_CXS.map((cx, i) => P.relation({
          key: i === 0 ? undefined : 'tie' + (i + 1),
          points: [[cx, CYL_BOTTOM], [cx, ROLE_Y]],
        })),
        // Offset off the outbound lane so the dashes do not run through the glyphs.
        P.wire({ key: 'proposal', x: midX(API_R, CYL_XS[0]), y: ROW_OUT - 14 }),
        // Further below than proposal is above: a text box reaches about 11 units above its baseline.
        P.wire({ key: 'report', x: midX(API_R, CYL_XS[0]), y: ROW_BACK + 21 }),
        P.wire({ key: 'replicate', x: CX + 100, y: ARC_Y - 10 }),
        // Under the ack arc, mirroring replicate above the outbound one.
        P.wire({ key: 'ack', x: CX + 100, y: ARC_BACK_Y + 18 }),
        P.packets(),
      ],
    }),
  ],
  reset: { keys: ['api', 'e1', 'e2', 'e3', 'r1', 'r2', 'r3', 'l1', 'l2', 'l3', 'termChip', 'acksChip', 'quorumChip'] },
};

// Written by every step: a carried counter is indistinguishable from one this step just earned.
const TERM = '4', QUORUM = '2 of 3', QUORUM_MET = '2 of 3 ✓ at ack 1', QUORUM_LOST = '1 of 3 · lost';
const ROLES = { r1: 'Leader', r2: 'Follower', r3: 'Follower' };

// A silent Follower takes its chips, tie and both lanes with it: one list writes them all.
const SILENT = ['e2', 'e3', 'r2', 'r3', 'l2', 'l3', 'tie2', 'tie3', 'laneE2Out', 'laneE2Back', 'laneE3Out', 'laneE3Back'];
// The Leader end of every one of those lanes is live, so laneOf leaves the replica's own shade.
const replicas = (o) => shade(SILENT, laneOf(OPACITY.running, o));
const LIVE = replicas(OPACITY.running), SILENCED = replicas(OPACITY.notready);

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { ...ROLES, l1: '8 / 8', l2: '8 / 8', l3: '8 / 8', termChip: TERM, acksChip: 'idle', quorumChip: QUORUM },
    opacity: LIVE,
  },
  {
    id: 'proposal',
    duration: 2700,
    narration: 'The API issues a write for a new Pod, and it should be the only component reaching ETCD at all. Every write is funneled through the Leader so the cluster has a single point that orders all changes. A write that lands on a Follower is not served there but forwarded to the Leader, so a linearizable read never observes a split view.',
    chips: { ...ROLES, l1: '8 / 8', l2: '8 / 8', l3: '8 / 8', termChip: TERM, acksChip: 'idle', quorumChip: QUORUM },
    wires: { proposal: 'write Pod · via Leader' },
    opacity: LIVE,
    lit: ['api'],
    flow: [F.route({ points: API_TO_E1, lights: ['e1'] })],
  },
  {
    id: 'append-log',
    duration: 2400,
    narration: 'The Leader appends the write as entry 9 in its own log, right after the 8 entries already stored. For now the entry lives on a single replica and stays uncommitted, so commitIndex is still 8 and the new Pod is invisible to readers. Nothing becomes durable until a majority holds it, and the Leader counts as one.',
    chips: { ...ROLES, l1: '9 / 8', l2: '8 / 8', l3: '8 / 8', termChip: TERM, acksChip: '0 of 2', quorumChip: QUORUM },
    opacity: LIVE,
    lit: ['acksChip', 'e1', 'l1'],
  },
  {
    id: 'replicate',
    duration: 3800,
    narration: 'The Leader sends an AppendEntries RPC carrying entry 9 to both Followers at once. Each Follower verifies that the term matches and that its log already lines up at index 8 before accepting, which is what keeps the replicas from ever diverging. After writing entry 9 to its own log, each Follower returns an ack to the Leader.',
    chips: { ...ROLES, l1: '9 / 8', l2: '9 / 8', l3: '9 / 8', termChip: TERM, acksChip: '2 of 2', quorumChip: QUORUM },
    wires: { replicate: 'AppendEntries · entry 9', ack: 'ack · entry 9' },
    opacity: LIVE,
    lit: ['acksChip', 'e1', 'l2', 'l3'],
    // The animated path starts on the state append-log left.
    rewind: { chips: { l2: '8 / 8', l3: '8 / 8', acksChip: '0 of 2' } },
    // Each Follower lights when its own packet lands, and its ack leaves on its own lane.
    flow: [
      F.segment({ from: E1_TO_E2[0], to: E1_TO_E2[1], name: 'toE2', lights: ['e2'] }),
      F.route({ points: REPLICATE, name: 'toE3', lights: ['e3'] }),
      F.segment({ from: E2_TO_E1[0], to: E2_TO_E1[1], after: 'toE2', name: 'ackE2' }),
      F.route({ points: ACK_E3, after: 'toE3', name: 'ackE3' }),
      // No value stands before the packet that earns it.
      F.set({ at: 'toE2', chips: { l2: '9 / 8' } }),
      F.set({ at: 'toE3', chips: { l3: '9 / 8' } }),
      F.set({ at: 'ackE2', chips: { acksChip: '1 of 2' } }),
      F.set({ at: 'ackE3', chips: { acksChip: '2 of 2' } }),
    ],
  },
  {
    id: 'quorum',
    duration: 2500,
    narration: 'The Leader needs a majority rather than every replica: itself plus the first Follower to ack already makes 2 of 3, which meets quorum. With a majority persisted, entry 9 is committed and can no longer be lost, so the Leader advances commitIndex to 9 and reports the write back to the API as durable.',
    // acks counts, it does not judge: Raft commits on the first ack, so the verdict sits on quorumChip.
    chips: { ...ROLES, l1: '9 / 9', l2: '9 / 8', l3: '9 / 8', termChip: TERM, acksChip: '2 of 2', quorumChip: QUORUM_MET },
    wires: { report: 'durable · commit 9' },
    opacity: LIVE,
    lit: ['e1', 'l1', 'acksChip', 'quorumChip'],
    flow: [F.route({ points: E1_TO_API, delay: BEAT.lead, lights: ['api'] })],
  },
  {
    id: 'apply',
    duration: 2500,
    narration: 'On the next heartbeat the Leader carries the new commitIndex to the Followers, signalling that entry 9 is safe to apply. Each Follower applies entry 9 to its state machine, the key-value view that clients actually read from. All three replicas now hold the Pod at index 9, and a linearizable read returns it from any member.',
    chips: { ...ROLES, l1: '9 / 9', l2: '9 / 9', l3: '9 / 9', termChip: TERM, acksChip: '2 of 2', quorumChip: QUORUM_MET },
    wires: { replicate: 'commit index 9 · heartbeat' },
    opacity: LIVE,
    lit: ['e1', 'l1', 'l2', 'l3'],
    // Each Follower commit index turns over when its own heartbeat lands.
    rewind: { chips: { l2: '9 / 8', l3: '9 / 8' } },
    // Receivers are dark at step entry and light on arrival (check-arrival R3).
    flow: [
      F.segment({ from: E1_TO_E2[0], to: E1_TO_E2[1], name: 'toE2', lights: ['e2'] }),
      F.route({ points: REPLICATE, name: 'toE3', lights: ['e3'] }),
      F.set({ at: 'toE2', chips: { l2: '9 / 9' } }),
      F.set({ at: 'toE3', chips: { l3: '9 / 9' } }),
    ],
  },
  {
    id: 'quorum-lost',
    duration: 2600,
    narration: 'Both Followers go silent, so the Leader holds one vote of three and quorum is lost. Entry 10 appends but never commits, the write fails with etcdserver: request timed out, and an election timeout later the Leader steps down. Linearizable reads stop, while serializable reads answer locally from stale data until a majority returns.',
    // r1 ends stood down (S-13), the rewind puts the Leader back.
    chips: { ...ROLES, r1: 'Follower', l1: '10 / 9', l2: '9 / 9', l3: '9 / 9', termChip: TERM, acksChip: '0 of 2', quorumChip: QUORUM_LOST },
    opacity: SILENCED,
    lit: ['e1', 'r1', 'l1', 'acksChip', 'quorumChip'],
    // The rewind is the whole healthy start: live shades, Leader, log at 9, quorum met.
    rewind: { chips: { r1: ROLES.r1, l1: '9 / 9', termChip: TERM, acksChip: '2 of 2', quorumChip: QUORUM_MET }, opacity: LIVE },
    // No ball on purpose: a packet into a member that is not answering says the opposite of the step.
    flow: [
      ...SILENT.map(k => F.fade({ target: k, from: OPACITY.running, to: OPACITY.notready, dur: FADE.out, fill: 'forwards', easing: 'ease-out' })),
      F.set({ delay: FADE.out, chips: { l1: '10 / 9', termChip: TERM, acksChip: '0 of 2', quorumChip: QUORUM_LOST } }),
      F.set({ delay: FADE.out + BEAT.lead, chips: { r1: 'Follower' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
