import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, cylinder, pathArrow } from '../../lib/primitives.js';
import { valChip, setVal, routePacket, segmentPacket, BEAT, FADE, OPACITY, at, laneOf, makeInit, clearHighlights, clearWires, setWire, lightBoxAt, relationPath } from '../../lib/cluster-kit.js';

// Laid out on the L: the narration panel owns the top-left corner and nothing is drawn there.
// Measured worst case over 1600/1280/1100 is x<=397, y<=230, so the reserved corner is 400 x 240.
// CYL_Y is 230, so the panel bottom is ONE unit off the artwork and every narration on this card
// has a hard ceiling of 334 characters, which is what the longest one costs (the `proposal` step).
// Re-measure with
// overlay-measure.mjs at all three viewports after any prose edit: the extent moves NON-monotonically.
// One band, 150..512. The API is level with the ETCD row, below the panel. The band was centred on
// the canvas (150..498, centre 324) until the chip stacks dropped 14 on 2026-08-01: see CARDS.md.
// The margin is 40 rather than the usual 60 on purpose: it is what buys the proposal label its
// gap without narrowing the API off the 220 standard box width. Both sides take it, so the
// content bbox stays 40..1160 and centred on CX.
const M = 40;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 40 / 1160
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600
// Reserved narration corner: 400 x 240. Nothing on this card derives from it, and the measured
// worst case per viewport is in the header note above.

const CYL_W = 200, CYL_H = 130, CYL_GAP = 60;
// The row sits as high as the API allows: the API is level with it and starts at CONTENT_L,
// so API_Y = CYL_Y + CYL_H / 2 - API_H / 2 has to clear the panel bottom of 240, giving CYL_Y >= 215.
const CYL_Y = 230, CYL_BOTTOM = CYL_Y + CYL_H;           // 230..360
const CYL_CY = CYL_Y + CYL_H / 2;                        // 295
// Derived rather than written out, so the right edge cannot drift off CONTENT_R when the row moves.
const ROW_W = 3 * CYL_W + 2 * CYL_GAP;                   // 720
const ROW_X = CONTENT_R - ROW_W;                         // 440
const CYL_XS = [0, 1, 2].map(i => ROW_X + i * (CYL_W + CYL_GAP));  // 440..640 / 700..900 / 960..1160
const CYL_CXS = CYL_XS.map(x => x + CYL_W / 2);          // 540 / 800 / 1060

const ROW_H = 34;
// 30 rather than 16: the binding to each cylinder is a dashed relationPath now, and 16 units is
// under two dashes of `5 5`, which reads as a tick rather than as a line. 30 gives three, and the
// chip stack under every cylinder gets the air the author asked for. The left column follows,
// because SCHIP_Y is derived from ROLE_Y and the term chip shares its top edge with the role row.
const ROLE_Y = CYL_BOTTOM + 30;                          // 390..424
const LOG_Y = ROLE_Y + ROW_H + 10;                       // 434..468

const API_W = 220, API_H = 80;
const API_X = CONTENT_L, API_R = API_X + API_W;          // 40..260
const API_Y = CYL_CY - API_H / 2;                        // 255..335, level with the ETCD row
// Every exchange on this card is a round trip, so the row line is a lane PAIR: the request rides
// LANE_DY above the centre line, the answer the same distance below it, mirrored on each face so no
// endpoint stands alone. Raft is nothing but answers (an entry is not committed until a majority has
// acknowledged it), and until 2026-07-30 not one of them was drawn: the acks the replicate step
// narrates, the durable report the quorum step narrates, and the whole of the apply step.
const LANE_DY = 12;
const ROW_OUT = CYL_CY - LANE_DY;                        // 283, requests run here
const ROW_BACK = CYL_CY + LANE_DY;                       // 307, answers come home here
const API_TO_E1 = [[API_R, ROW_OUT], [CYL_XS[0], ROW_OUT]];
const E1_TO_API = [[CYL_XS[0], ROW_BACK], [API_R, ROW_BACK]];
const E1_TO_E2  = [[CYL_XS[0] + CYL_W, ROW_OUT], [CYL_XS[1], ROW_OUT]];
const E2_TO_E1  = [[CYL_XS[1], ROW_BACK], [CYL_XS[0] + CYL_W, ROW_BACK]];

// The replication arc rides above the row, between the leader and the far follower. The riser
// is what fills the top of the canvas, so it carries the band top rather than the cylinders.
const ARC_RISE = 80;
const ARC_Y = CYL_Y - ARC_RISE;                          // 150
// The far Follower is a round trip too, and the two arcs are CONCENTRIC, which takes OPPOSITE stubs
// at the two ends. Why mirrored stubs cross: docs/CARDS.md#cluster-etcd-raft.
const ARC_BACK_Y = ARC_Y + LANE_DY;                      // 162
const REPLICATE = [[CYL_CXS[0] - LANE_DY, CYL_Y], [CYL_CXS[0] - LANE_DY, ARC_Y], [CYL_CXS[2] + LANE_DY, ARC_Y], [CYL_CXS[2] + LANE_DY, CYL_Y]];
const ACK_E3    = [[CYL_CXS[2] - LANE_DY, CYL_Y], [CYL_CXS[2] - LANE_DY, ARC_BACK_Y], [CYL_CXS[0] + LANE_DY, ARC_BACK_Y], [CYL_CXS[0] + LANE_DY, CYL_Y]];

// State chips in the freed bottom-left, under the API, so the chip strip straddles CX. They take the
// API width, not one of their own: the four blocks are one column and used to end 100 units apart.
// The third row is the bottom of the band: SCHIP_Y(2) + ROW_H = 512.
const SCHIP_X = API_X, SCHIP_W = API_W;                  // 40..260, the API column
const SCHIP_Y = i => ROLE_Y + i * (ROW_H + 10);          // 390 / 434 / 478

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'ETCD Raft Consensus: replicate, ack, commit, and stop writing when quorum is lost',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Laid out at scale 1.0 (no shrink wrapper) so every block and its text match
    // the size in the other cards pixel-for-pixel.
    const content = g({});

    // ETCD replicas pitched 260 apart (60 unit gaps) so they read as distinct nodes.
    const e1 = cylinder({ x: CYL_XS[0], y: CYL_Y, w: CYL_W, h: CYL_H, label: 'ETCD-1', role: 'cluster' });
    const e2 = cylinder({ x: CYL_XS[1], y: CYL_Y, w: CYL_W, h: CYL_H, label: 'ETCD-2', role: 'cluster' });
    const e3 = cylinder({ x: CYL_XS[2], y: CYL_Y, w: CYL_W, h: CYL_H, label: 'ETCD-3', role: 'cluster' });
    content.appendChild(e1); content.appendChild(e2); content.appendChild(e3);

    // term/acks/quorum: one row per line, ROW_H 34 and a 10 unit gap, the pitch the
    // role and log rows use. The width is the API column, so the four blocks line up.
    const termChip   = valChip({ x: SCHIP_X, y: SCHIP_Y(0), w: SCHIP_W, h: ROW_H, name: 'term',             value: '4', role: 'cluster' });
    // The name states the POPULATION it counts, because the quorum chip under it counts a different
    // one: acks come from the two Followers, quorum is out of all three replicas. See CARDS.md.
    const acksChip   = valChip({ x: SCHIP_X, y: SCHIP_Y(1), w: SCHIP_W, h: ROW_H, name: 'acks from Followers', value: 'idle', role: 'cluster' });
    const quorumChip = valChip({ x: SCHIP_X, y: SCHIP_Y(2), w: SCHIP_W, h: ROW_H, name: 'quorum',           value: '2 of 3', role: 'cluster' });
    content.appendChild(termChip); content.appendChild(acksChip); content.appendChild(quorumChip);

    const r1 = valChip({ x: CYL_XS[0], y: ROLE_Y, w: CYL_W, h: ROW_H, name: 'role', value: 'Leader', role: 'cluster' });
    const r2 = valChip({ x: CYL_XS[1], y: ROLE_Y, w: CYL_W, h: ROW_H, name: 'role', value: 'Follower', role: 'cluster' });
    const r3 = valChip({ x: CYL_XS[2], y: ROLE_Y, w: CYL_W, h: ROW_H, name: 'role', value: 'Follower', role: 'cluster' });
    content.appendChild(r1); content.appendChild(r2); content.appendChild(r3);

    const l1 = valChip({ x: CYL_XS[0], y: LOG_Y, w: CYL_W, h: ROW_H, name: 'log/commit', value: '8 / 8', role: 'cluster' });
    const l2 = valChip({ x: CYL_XS[1], y: LOG_Y, w: CYL_W, h: ROW_H, name: 'log/commit', value: '8 / 8', role: 'cluster' });
    const l3 = valChip({ x: CYL_XS[2], y: LOG_Y, w: CYL_W, h: ROW_H, name: 'log/commit', value: '8 / 8', role: 'cluster' });
    content.appendChild(l1); content.appendChild(l2); content.appendChild(l3);

    const api = box({ x: API_X, y: API_Y, w: API_W, h: API_H, label: 'API', role: 'cluster' });
    content.appendChild(api);

    // The four lanes that touch a Follower are kept by name: when a Follower goes silent its lanes
    // go with it, and a lane is only as present as the fainter of its two ends. See setReplicas.
    const lane = pts => { const p = pathArrow({ points: pts, dim: true, dashed: true, role: 'cluster' }); content.appendChild(p); return p; };
    lane(API_TO_E1); lane(E1_TO_API);
    const laneE2Out = lane(E1_TO_E2), laneE2Back = lane(E2_TO_E1);
    const laneE3Out = lane(REPLICATE), laneE3Back = lane(ACK_E3);

    // Tie each replica to the chips below it: a binding, not flow, so it goes through relationPath.
    // What it used to be and what the 30 unit gap buys: docs/CARDS.md#cluster-etcd-raft.
    const ties = CYL_CXS.map(cx => {
      const p = relationPath({ points: [[cx, CYL_BOTTOM], [cx, ROLE_Y]], role: 'cluster' });
      content.appendChild(p);
      return p;
    });

    // 14 above the outbound lane, the clearance the sibling control-plane cards use. It read
    // CYL_CY - 12, which is ROW_OUT to the unit, so the dashes ran through the glyphs.
    const wireProposal  = text({ class: 'scheme-label code dim', x: (API_R + CYL_XS[0]) / 2, y: ROW_OUT - 14, 'text-anchor': 'middle' }, [' ']);
    const wireReplicate = text({ class: 'scheme-label code dim', x: CX + 100, y: ARC_Y - 10, 'text-anchor': 'middle' }, [' ']);
    content.appendChild(wireProposal); content.appendChild(wireReplicate);

    const packetLayer = g({ id: 'packetLayer' });
    content.appendChild(packetLayer);

    root.appendChild(content);
    this.host.appendChild(root);
    this.refs = {
      svg: root, api, e1, e2, e3, r1, r2, r3, l1, l2, l3, termChip, acksChip, quorumChip,
      tie2: ties[1], tie3: ties[2], laneE2Out, laneE2Back, laneE3Out, laneE3Back,
      wires: { proposal: wireProposal, replicate: wireReplicate },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['api','e1','e2','e3','r1','r2','r3','l1','l2','l3','termChip','acksChip','quorumChip']);
}

// The three summary chips are written by EVERY step, not only by the ones that move them. They used
// to be set on two steps out of six and carried elsewhere, and a carried counter is indistinguishable
// on screen from one this step just earned.
const TERM = '4', QUORUM = '2 of 3', QUORUM_MET = '2 of 3 ✓ at ack 1', QUORUM_LOST = '1 of 3 · lost';
function setSummary(s, { acks, quorum }) {
  setVal(s.refs.termChip, TERM);
  setVal(s.refs.acksChip, acks);
  setVal(s.refs.quorumChip, quorum);
}

// A Follower that stops answering does not vanish, and it does not go alone: its role chip, its
// log chip, the dashed tie holding those two to it and both of its lanes are only as present as
// the replica itself. ONE helper writes all twelve, called by EVERY step, because two independent
// assignments drift the moment a step is added. Reasoning: docs/CARDS.md#cluster-etcd-raft.
const SILENT = ['e2', 'e3', 'r2', 'r3', 'l2', 'l3', 'tie2', 'tie3', 'laneE2Out', 'laneE2Back', 'laneE3Out', 'laneE3Back'];
function setReplicas(s, o) {
  // The Leader end of every one of those lanes is live, so laneOf leaves the replica's own shade.
  const shade = laneOf(OPACITY.running, o);
  SILENT.forEach(k => { if (s.refs[k]) s.refs[k].style.opacity = shade; });
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.r1, 'Leader');
      setVal(s.refs.r2, 'Follower');
      setVal(s.refs.r3, 'Follower');
      setVal(s.refs.l1, '8 / 8');
      setVal(s.refs.l2, '8 / 8');
      setVal(s.refs.l3, '8 / 8');
      setSummary(s, { acks: 'idle', quorum: QUORUM });
      setReplicas(s, OPACITY.running);
    },
  },
  {
    id: 'proposal',
    duration: 1900,
    narration: 'The API issues a write for a new Pod, the only path by which Kubernetes state ever reaches ETCD. Every write is funneled through the Leader so the cluster has a single point that orders all changes. A request that lands on a Follower is not served there but forwarded to the Leader, so a linearizable read never observes a split view.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setSummary(s, { acks: 'idle', quorum: QUORUM });
      setReplicas(s, OPACITY.running);
      s.refs.api.classList.add('highlight');
      setWire(s, 'proposal', 'write Pod · via Leader');
      if (ctx.reduced) { s.refs.e1.classList.add('highlight'); return; }
      const pkt = routePacket(s, ctx, API_TO_E1, { role: 'cluster' });
      lightBoxAt(s.refs.e1, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'append-log',
    duration: 1700,
    narration: 'The Leader appends the write as entry 9 in its own log, right after the 8 entries already stored. For now the entry lives on a single replica and stays uncommitted, so commitIndex is still 8 and the new Pod is invisible to readers. Nothing becomes durable until a majority of replicas also hold it.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.l1, '9 / 8');
      setSummary(s, { acks: '0 of 2', quorum: QUORUM });
      setReplicas(s, OPACITY.running);
      s.refs.acksChip.classList.add('highlight');
      s.refs.e1.classList.add('highlight');
      s.refs.l1.classList.add('highlight');
    },
  },
  {
    id: 'replicate',
    // Motion: both AppendEntries out, then each ack back on its own lane once its Follower has written: 3629ms.
    duration: 3800,
    narration: 'The Leader sends an AppendEntries RPC carrying entry 9 to both Followers at once. Each Follower verifies that the term matches and that its log already lines up at index 8 before accepting, which is what keeps the replicas from ever diverging. After writing entry 9 to its own log, each Follower returns an ack to the Leader.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.l2, '9 / 8');
      setVal(s.refs.l3, '9 / 8');
      // Both acks land inside this step (the two return lanes below), so the counter ends on 2 and
      // says so in the same notation as the steps either side of it. It read "1 (then 2)" here, a
      // third notation on the one step where the count is meant to be read as progressing.
      setSummary(s, { acks: '2 of 2', quorum: QUORUM });
      setReplicas(s, OPACITY.running);
      s.refs.acksChip.classList.add('highlight');
      setWire(s, 'replicate', 'AppendEntries · entry 9');
      s.refs.e1.classList.add('highlight');
      s.refs.l2.classList.add('highlight');
      s.refs.l3.classList.add('highlight');
      if (ctx.reduced) { s.refs.e2.classList.add('highlight'); s.refs.e3.classList.add('highlight'); return; }
      // Both AppendEntries leave together: a short hop to the near Follower and
      // the over-the-top route to the far one, each at natural travel speed. Both
      // Followers are receivers, so each lights when its own packet lands.
      const e2Pkt = segmentPacket(s, ctx, { from: E1_TO_E2[0], to: E1_TO_E2[1], role: 'cluster' });
      lightBoxAt(s.refs.e2, ctx, e2Pkt.arrivalMs);
      const e3Pkt = routePacket(s, ctx, REPLICATE, { role: 'cluster' });
      lightBoxAt(s.refs.e3, ctx, e3Pkt.arrivalMs);
      // "After writing entry 9 to its own log, each Follower returns an ack to the Leader": each ack
      // leaves its own Follower a beat after that Follower received the entry, on its own lane.
      segmentPacket(s, ctx, { from: E2_TO_E1[0], to: E2_TO_E1[1], delay: e2Pkt.arrivalMs + BEAT.afterHop, role: 'cluster' });
      routePacket(s, ctx, ACK_E3, { delay: e3Pkt.arrivalMs + BEAT.afterHop, role: 'cluster' });
    },
  },
  {
    id: 'quorum',
    // Motion: the durable report leaves after BEAT.lead and reaches the API at 2060ms.
    duration: 2500,
    narration: 'The Leader counts how many replicas now hold entry 9: itself plus at least one Follower makes 2 of 3, which meets quorum. With a majority persisted, entry 9 is committed and can no longer be lost, so the Leader advances commitIndex to 9 and reports the write back to the API as durable.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.l1, '9 / 9');
      // The acks chip COUNTS, it does not judge: a tick on 2 of 2 said the commit waits for both
      // Followers, while the narration (and Raft) commit on the first ack, because the Leader plus
      // one Follower is already the majority. The verdict moved to the chip whose threshold it is.
      setSummary(s, { acks: '2 of 2', quorum: QUORUM_MET });
      setReplicas(s, OPACITY.running);
      s.refs.e1.classList.add('highlight');
      s.refs.l1.classList.add('highlight');
      s.refs.acksChip.classList.add('highlight');
      s.refs.quorumChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.api.classList.add('highlight'); return; }
      // The step used to animate NOTHING while its narration reports the write back to the API as
      // durable. That report is the whole point of a quorum, so it rides the answer lane home and the
      // API lights when it lands.
      const durable = routePacket(s, ctx, E1_TO_API, { delay: BEAT.lead, role: 'cluster' });
      lightBoxAt(s.refs.api, ctx, durable.arrivalMs);
    },
  },
  {
    id: 'apply',
    // Motion: the commitIndex heartbeat to both Followers, the far one over the arc: 2071ms.
    duration: 2500,
    narration: 'On the next heartbeat the Leader carries the new commitIndex to the Followers, signalling that entry 9 is safe to apply. Each Follower applies entry 9 to its state machine, the key-value view that clients actually read from. All three replicas now hold the Pod at index 9, and while quorum holds every read returns it consistently.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.l2, '9 / 9');
      setVal(s.refs.l3, '9 / 9');
      setSummary(s, { acks: '2 of 2', quorum: QUORUM_MET });
      setReplicas(s, OPACITY.running);
      s.refs.e1.classList.add('highlight');
      s.refs.l1.classList.add('highlight');
      s.refs.l2.classList.add('highlight');
      s.refs.l3.classList.add('highlight');
      // Both Followers now RECEIVE the heartbeat, so they are dark at step entry and light when it
      // lands: check-arrival R3 fired the moment the balls were added.
      if (ctx.reduced) { s.refs.e2.classList.add('highlight'); s.refs.e3.classList.add('highlight'); return; }
      // This step animated nothing at all while its narration has the Leader CARRYING the new
      // commitIndex to both Followers on the next heartbeat. It is the same two outbound lanes the
      // replicate step uses, and each Follower is already lit because both apply the entry.
      const hb2 = segmentPacket(s, ctx, { from: E1_TO_E2[0], to: E1_TO_E2[1], role: 'cluster' });
      lightBoxAt(s.refs.e2, ctx, hb2.arrivalMs);
      const hb3 = routePacket(s, ctx, REPLICATE, { role: 'cluster' });
      lightBoxAt(s.refs.e3, ctx, hb3.arrivalMs);
    },
  },
  {
    id: 'quorum-lost',
    // Motion: the two Followers fade out (700), the counters turn over on that beat, the role chip
    // an election beat after it: 1501ms. No packet, and the reason is in the enter() body.
    duration: 2600,
    narration: 'Both Followers go silent, so the Leader holds one vote of three and quorum is lost. Entry 10 appends but never commits, the write fails with etcdserver: request timed out, and an election timeout later the Leader steps down. Linearizable reads stop, while serializable reads answer locally from stale data until a majority returns.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.r1, 'Follower');
      setVal(s.refs.l1, '10 / 9');
      setSummary(s, { acks: '0 of 2', quorum: QUORUM_LOST });
      setReplicas(s, OPACITY.notready);
      s.refs.e1.classList.add('highlight');
      s.refs.r1.classList.add('highlight');
      s.refs.l1.classList.add('highlight');
      s.refs.acksChip.classList.add('highlight');
      s.refs.quorumChip.classList.add('highlight');
      if (ctx.reduced) return;
      // NO ball, on purpose. A packet into a member that is not answering says the opposite of the
      // step, and nothing comes back either, which is what the narration promises. The beat is the
      // two replicas going quiet, then the counters that depended on them, then the Leader giving
      // up a role it can no longer hold. The silent pair carries no highlight on either path.
      setReplicas(s, OPACITY.running);
      setVal(s.refs.r1, 'Leader');
      setSummary(s, { acks: '2 of 2', quorum: QUORUM_MET });
      SILENT.forEach(k => ctx.register(s.refs[k].animate(
        [{ opacity: OPACITY.running }, { opacity: OPACITY.notready }],
        { duration: FADE.out, fill: 'forwards', easing: 'ease-out' })));
      at(s, ctx, FADE.out, () => setSummary(s, { acks: '0 of 2', quorum: QUORUM_LOST }));
      at(s, ctx, FADE.out + BEAT.lead, () => setVal(s.refs.r1, 'Follower'));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
