import { P, F, defineCard, laneY, ladder, midX, shade, laneOf, BEAT, FADE, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS.md#cluster-etcd-raft

// Laid out on the L. Panel x<=397 y<=230 against CYL_Y 230, ONE unit off the artwork, so every
// narration has a HARD CEILING of 334 characters. Margin 40, not 60, and both sides take it.
const M = 40;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 40 / 1160
const CX = midX(CONTENT_L, CONTENT_R);                   // 600
// Reserved narration corner: 400 x 240. Nothing on this card derives from it, and the measured
// worst case per viewport is in the header note above.

const CYL_W = 200, CYL_H = 130, CYL_GAP = 60;
// The row sits as high as the API allows: the API is level with it and starts at CONTENT_L,
// so API_Y = CYL_Y + CYL_H / 2 - API_H / 2 has to clear the panel bottom of 240, giving CYL_Y >= 215.
const CYL_Y = 230, CYL_BOTTOM = CYL_Y + CYL_H;           // 230..360
const CYL_CY = midX(CYL_Y, CYL_BOTTOM);                  // 295
// Derived rather than written out, so the right edge cannot drift off CONTENT_R when the row moves.
const ROW_W = 3 * CYL_W + 2 * CYL_GAP;                   // 720
const ROW_X = CONTENT_R - ROW_W;                         // 440
const CYL_XS = [0, 1, 2].map(i => ROW_X + i * (CYL_W + CYL_GAP));  // 440..640 / 700..900 / 960..1160
const CYL_CXS = CYL_XS.map(x => midX(x, x + CYL_W));     // 540 / 800 / 1060

const ROW_H = 34;
// 30 rather than 16: the binding to each cylinder is a dashed relationPath, and 16 units is under
// two dashes of `5 5`, which reads as a tick rather than a line. 30 gives three.
const ROLE_Y = CYL_BOTTOM + 30;                          // 390..424
// Role row, log row and the state column ride ONE rhythm: ROW_H and a 10 unit gap off ROLE_Y.
const ROW_Y = ladder({ y: ROLE_Y, rowH: ROW_H, gap: 10 });  // 390 / 434 / 478
const LOG_Y = ROW_Y(1);                                  // 434..468

const API_W = 220, API_H = 80;
const API_X = CONTENT_L, API_R = API_X + API_W;          // 40..260
const API_Y = CYL_CY - API_H / 2;                        // 255..335, level with the ETCD row
// Every exchange here is a round trip, so each row line is a lane PAIR: request LANE_DY above the
// centre, answer the same below, mirrored on each face. Raft is nothing but answers.
const LANE_DY = 12;
const { out: ROW_OUT, back: ROW_BACK } = laneY(CYL_CY, LANE_DY);   // 283 out / 307 back
const API_TO_E1 = [[API_R, ROW_OUT], [CYL_XS[0], ROW_OUT]];
const E1_TO_API = [[CYL_XS[0], ROW_BACK], [API_R, ROW_BACK]];
const E1_TO_E2  = [[CYL_XS[0] + CYL_W, ROW_OUT], [CYL_XS[1], ROW_OUT]];
const E2_TO_E1  = [[CYL_XS[1], ROW_BACK], [CYL_XS[0] + CYL_W, ROW_BACK]];

// The replication arc rides above the row, between the leader and the far follower. The riser
// is what fills the top of the canvas, so it carries the band top rather than the cylinders.
const ARC_RISE = 80;
const ARC_Y = CYL_Y - ARC_RISE;                          // 150
// The far Follower is a round trip too, and the two arcs are CONCENTRIC, which takes OPPOSITE stubs
// at the two ends. Why mirrored stubs cross: ./CARDS.md#cluster-etcd-raft.
const ARC_BACK_Y = ARC_Y + LANE_DY;                      // 162
const REPLICATE = [[CYL_CXS[0] - LANE_DY, CYL_Y], [CYL_CXS[0] - LANE_DY, ARC_Y], [CYL_CXS[2] + LANE_DY, ARC_Y], [CYL_CXS[2] + LANE_DY, CYL_Y]];
const ACK_E3    = [[CYL_CXS[2] - LANE_DY, CYL_Y], [CYL_CXS[2] - LANE_DY, ARC_BACK_Y], [CYL_CXS[0] + LANE_DY, ARC_BACK_Y], [CYL_CXS[0] + LANE_DY, CYL_Y]];

// State chips in the freed bottom-left, under the API, so the strip straddles CX. They take the API
// width so the four blocks read as one column. Third row is the band bottom: ROW_Y(2) + ROW_H.
const SCHIP_X = API_X, SCHIP_W = API_W;                  // 40..260, the API column

// The list order IS the append order, so it is the z-order: the three replicas, the four chip
// columns, the API, the six lanes, the ties, the wire labels, and the packet layer last.
export const SCENE = {
  'aria-label': 'ETCD Raft Consensus: replicate, ack, commit, and stop writing when quorum is lost',
  parts: [
    P.defs(),
    // Laid out at scale 1.0 (no shrink wrapper) so every block and its text match
    // the size in the other cards pixel-for-pixel.
    P.group({
      parts: [
        // ETCD replicas pitched 260 apart (60 unit gaps) so they read as distinct nodes.
        P.cylinder({ key: 'e1', x: CYL_XS[0], y: CYL_Y, w: CYL_W, h: CYL_H, label: 'ETCD-1' }),
        P.cylinder({ key: 'e2', x: CYL_XS[1], y: CYL_Y, w: CYL_W, h: CYL_H, label: 'ETCD-2' }),
        P.cylinder({ key: 'e3', x: CYL_XS[2], y: CYL_Y, w: CYL_W, h: CYL_H, label: 'ETCD-3' }),
        // term/acks/quorum: one row per line, ROW_H 34 and a 10 unit gap, the pitch the
        // role and log rows use. The width is the API column, so the four blocks line up.
        P.chip({ key: 'termChip', x: SCHIP_X, y: ROW_Y(0), w: SCHIP_W, h: ROW_H, name: 'term', value: '4' }),
        // The name states the POPULATION it counts, because the quorum chip under it counts a different
        // one: acks come from the two Followers, quorum is out of all three replicas. See ./CARDS.md.
        P.chip({ key: 'acksChip', x: SCHIP_X, y: ROW_Y(1), w: SCHIP_W, h: ROW_H, name: 'acks from Followers', value: 'idle' }),
        P.chip({ key: 'quorumChip', x: SCHIP_X, y: ROW_Y(2), w: SCHIP_W, h: ROW_H, name: 'quorum', value: '2 of 3' }),
        P.chip({ key: 'r1', x: CYL_XS[0], y: ROLE_Y, w: CYL_W, h: ROW_H, name: 'role', value: 'Leader' }),
        P.chip({ key: 'r2', x: CYL_XS[1], y: ROLE_Y, w: CYL_W, h: ROW_H, name: 'role', value: 'Follower' }),
        P.chip({ key: 'r3', x: CYL_XS[2], y: ROLE_Y, w: CYL_W, h: ROW_H, name: 'role', value: 'Follower' }),
        P.chip({ key: 'l1', x: CYL_XS[0], y: LOG_Y, w: CYL_W, h: ROW_H, name: 'log/commit', value: '8 / 8' }),
        P.chip({ key: 'l2', x: CYL_XS[1], y: LOG_Y, w: CYL_W, h: ROW_H, name: 'log/commit', value: '8 / 8' }),
        P.chip({ key: 'l3', x: CYL_XS[2], y: LOG_Y, w: CYL_W, h: ROW_H, name: 'log/commit', value: '8 / 8' }),
        P.box({ key: 'api', x: API_X, y: API_Y, w: API_W, h: API_H, label: 'API' }),
        // The four lanes that touch a Follower are kept by name: when a Follower goes silent its lanes
        // go with it, and a lane is only as present as the fainter of its two ends. See SILENT below.
        P.lane({ points: API_TO_E1, dim: true, dashed: true }),
        P.lane({ points: E1_TO_API, dim: true, dashed: true }),
        P.lane({ key: 'laneE2Out', points: E1_TO_E2, dim: true, dashed: true }),
        P.lane({ key: 'laneE2Back', points: E2_TO_E1, dim: true, dashed: true }),
        P.lane({ key: 'laneE3Out', points: REPLICATE, dim: true, dashed: true }),
        P.lane({ key: 'laneE3Back', points: ACK_E3, dim: true, dashed: true }),
        // Tie each replica to the chips below it: a binding, not flow, so it goes through relationPath.
        // What the 30 unit gap between cylinder and role row buys: ./CARDS.md#cluster-etcd-raft.
        ...CYL_CXS.map((cx, i) => P.relation({
          key: i === 0 ? undefined : 'tie' + (i + 1),
          points: [[cx, CYL_BOTTOM], [cx, ROLE_Y]],
        })),
        // 14 above the outbound lane, the clearance the sibling control-plane cards use. It read
        // CYL_CY - 12, which is ROW_OUT to the unit, so the dashes ran through the glyphs.
        P.wire({ key: 'proposal', x: midX(API_R, CYL_XS[0]), y: ROW_OUT - 14 }),
        P.wire({ key: 'replicate', x: CX + 100, y: ARC_Y - 10 }),
        P.packets(),
      ],
    }),
  ],
  reset: { keys: ['api', 'e1', 'e2', 'e3', 'r1', 'r2', 'r3', 'l1', 'l2', 'l3', 'termChip', 'acksChip', 'quorumChip'] },
};

// Written by EVERY step, not only the ones that move them: a carried counter is indistinguishable
// on screen from one this step just earned.
const TERM = '4', QUORUM = '2 of 3', QUORUM_MET = '2 of 3 ✓ at ack 1', QUORUM_LOST = '1 of 3 · lost';
const ROLES = { r1: 'Leader', r2: 'Follower', r3: 'Follower' };

// A Follower that stops answering does not go alone: its chips, its tie and both its lanes are only
// as present as the replica. ONE list writes all twelve, in every step and in the fade.
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
    duration: 1900,
    narration: 'The API issues a write for a new Pod, the only path by which Kubernetes state ever reaches ETCD. Every write is funneled through the Leader so the cluster has a single point that orders all changes. A request that lands on a Follower is not served there but forwarded to the Leader, so a linearizable read never observes a split view.',
    chips: { ...ROLES, l1: '8 / 8', l2: '8 / 8', l3: '8 / 8', termChip: TERM, acksChip: 'idle', quorumChip: QUORUM },
    wires: { proposal: 'write Pod · via Leader' },
    opacity: LIVE,
    lit: ['api'],
    flow: [F.route({ points: API_TO_E1, lights: ['e1'] })],
  },
  {
    id: 'append-log',
    duration: 1700,
    narration: 'The Leader appends the write as entry 9 in its own log, right after the 8 entries already stored. For now the entry lives on a single replica and stays uncommitted, so commitIndex is still 8 and the new Pod is invisible to readers. Nothing becomes durable until a majority of replicas also hold it.',
    chips: { ...ROLES, l1: '9 / 8', l2: '8 / 8', l3: '8 / 8', termChip: TERM, acksChip: '0 of 2', quorumChip: QUORUM },
    opacity: LIVE,
    lit: ['acksChip', 'e1', 'l1'],
  },
  {
    id: 'replicate',
    // Motion: both AppendEntries out, then each ack back on its own lane once its Follower has written: 3629ms.
    duration: 3800,
    narration: 'The Leader sends an AppendEntries RPC carrying entry 9 to both Followers at once. Each Follower verifies that the term matches and that its log already lines up at index 8 before accepting, which is what keeps the replicas from ever diverging. After writing entry 9 to its own log, each Follower returns an ack to the Leader.',
    // Both acks land inside this step, so the counter ends on 2 and says so in the same notation
    // as the steps either side of it.
    chips: { ...ROLES, l1: '9 / 8', l2: '9 / 8', l3: '9 / 8', termChip: TERM, acksChip: '2 of 2', quorumChip: QUORUM },
    wires: { replicate: 'AppendEntries · entry 9' },
    opacity: LIVE,
    lit: ['acksChip', 'e1', 'l2', 'l3'],
    // Both AppendEntries leave together at natural travel speed. Each Follower is a receiver, so it
    // lights when ITS OWN packet lands, and its ack leaves a beat after that, on its own lane.
    flow: [
      F.segment({ from: E1_TO_E2[0], to: E1_TO_E2[1], name: 'toE2', lights: ['e2'] }),
      F.route({ points: REPLICATE, name: 'toE3', lights: ['e3'] }),
      F.segment({ from: E2_TO_E1[0], to: E2_TO_E1[1], after: 'toE2' }),
      F.route({ points: ACK_E3, after: 'toE3' }),
    ],
  },
  {
    id: 'quorum',
    // Motion: the durable report leaves after BEAT.lead and reaches the API at 2060ms.
    duration: 2500,
    narration: 'The Leader counts how many replicas now hold entry 9: itself plus at least one Follower makes 2 of 3, which meets quorum. With a majority persisted, entry 9 is committed and can no longer be lost, so the Leader advances commitIndex to 9 and reports the write back to the API as durable.',
    // The acks chip COUNTS, it does not judge: Raft commits on the FIRST ack, because Leader plus
    // one Follower is already the majority. The verdict belongs to the chip whose threshold it is.
    chips: { ...ROLES, l1: '9 / 9', l2: '9 / 8', l3: '9 / 8', termChip: TERM, acksChip: '2 of 2', quorumChip: QUORUM_MET },
    opacity: LIVE,
    lit: ['e1', 'l1', 'acksChip', 'quorumChip'],
    // The durable report is the whole point of a quorum, so it rides the answer lane home and the
    // API lights when it lands.
    flow: [F.route({ points: E1_TO_API, delay: BEAT.lead, lights: ['api'] })],
  },
  {
    id: 'apply',
    // Motion: the commitIndex heartbeat to both Followers, the far one over the arc: 2071ms.
    duration: 2500,
    narration: 'On the next heartbeat the Leader carries the new commitIndex to the Followers, signalling that entry 9 is safe to apply. Each Follower applies entry 9 to its state machine, the key-value view that clients actually read from. All three replicas now hold the Pod at index 9, and while quorum holds every read returns it consistently.',
    chips: { ...ROLES, l1: '9 / 9', l2: '9 / 9', l3: '9 / 9', termChip: TERM, acksChip: '2 of 2', quorumChip: QUORUM_MET },
    opacity: LIVE,
    lit: ['e1', 'l1', 'l2', 'l3'],
    // Both Followers RECEIVE the heartbeat, so they are dark at step entry and light when it lands:
    // check-arrival R3 fired the moment the balls were added. Same two outbound lanes replicate uses.
    flow: [
      F.segment({ from: E1_TO_E2[0], to: E1_TO_E2[1], lights: ['e2'] }),
      F.route({ points: REPLICATE, lights: ['e3'] }),
    ],
  },
  {
    id: 'quorum-lost',
    // Motion: the two Followers fade out (700), the counters turn over on that beat, the role chip
    // an election beat after it: 1501ms. No packet, and the reason is on the flow below.
    duration: 2600,
    narration: 'Both Followers go silent, so the Leader holds one vote of three and quorum is lost. Entry 10 appends but never commits, the write fails with etcdserver: request timed out, and an election timeout later the Leader steps down. Linearizable reads stop, while serializable reads answer locally from stale data until a majority returns.',
    chips: { ...ROLES, l1: '10 / 9', l2: '9 / 9', l3: '9 / 9', termChip: TERM, acksChip: '0 of 2', quorumChip: QUORUM_LOST },
    opacity: SILENCED,
    lit: ['e1', 'r1', 'l1', 'acksChip', 'quorumChip'],
    // The step STARTS with a healthy cluster and ends with a silent one, so the rewind is the whole
    // of that start: twelve live shades and the counters that still read a met quorum.
    rewind: { chips: { termChip: TERM, acksChip: '2 of 2', quorumChip: QUORUM_MET }, opacity: LIVE },
    // NO ball, on purpose: a packet into a member that is not answering says the opposite of the
    // step. The beat is the replicas going quiet, then the counters, then the Leader standing down.
    flow: [
      ...SILENT.map(k => F.fade({ target: k, from: OPACITY.running, to: OPACITY.notready, dur: FADE.out, fill: 'forwards', easing: 'ease-out' })),
      F.set({ delay: FADE.out, chips: { termChip: TERM, acksChip: '0 of 2', quorumChip: QUORUM_LOST } }),
      F.set({ delay: FADE.out + BEAT.lead, chips: { r1: 'Follower' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
