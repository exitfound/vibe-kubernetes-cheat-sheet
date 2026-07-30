import { svg, g, line, text } from '../lib/svg.js';
import { arrowDefs, box, cylinder, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, routePacket, segmentPacket, BEAT, makeInit, clearHighlights, clearWires, setWire, lightBoxAt } from '../lib/cluster-kit.js';

// Laid out on the L: the narration panel owns the top-left corner and nothing is drawn there.
// Measured worst case over 1600/1280/1100 is x<=397, y<=230, so the reserved corner is 400 x 240.
// One band, 150..498, centred on the canvas. The API is level with the ETCD row, below the panel.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600
const PANEL_R = 400, PANEL_B = 240;                      // the reserved corner

const CYL_W = 200, CYL_H = 130, CYL_GAP = 60;
// The row sits as high as the API allows: the API is level with it and starts at CONTENT_L,
// so API_Y = CYL_Y + CYL_H / 2 - API_H / 2 has to clear PANEL_B, giving CYL_Y >= 215.
const CYL_Y = 230, CYL_BOTTOM = CYL_Y + CYL_H;           // 230..360
const CYL_CY = CYL_Y + CYL_H / 2;                        // 295
const CYL_XS = [420, 680, 940];                          // 420..620 / 680..880 / 940..1140, right edge on CONTENT_R
const CYL_CXS = CYL_XS.map(x => x + CYL_W / 2);          // 520 / 780 / 1040

const ROW_H = 34;
const ROLE_Y = CYL_BOTTOM + 16;                          // 376..410
const LOG_Y = ROLE_Y + ROW_H + 10;                       // 420..454

const API_W = 220, API_H = 80;
const API_X = CONTENT_L, API_R = API_X + API_W;          // 60..280
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
// The far Follower is a round trip too: the ack arc nests inside the outbound one and leaves each
// cylinder top on the mirrored side of its midpoint.
const ARC_BACK_Y = ARC_Y + LANE_DY;                      // 162
const REPLICATE = [[CYL_CXS[0] - LANE_DY, CYL_Y], [CYL_CXS[0] - LANE_DY, ARC_Y], [CYL_CXS[2] - LANE_DY, ARC_Y], [CYL_CXS[2] - LANE_DY, CYL_Y]];
const ACK_E3    = [[CYL_CXS[2] + LANE_DY, CYL_Y], [CYL_CXS[2] + LANE_DY, ARC_BACK_Y], [CYL_CXS[0] + LANE_DY, ARC_BACK_Y], [CYL_CXS[0] + LANE_DY, CYL_Y]];

// State chips in the freed bottom-left, under the API, so the chip strip straddles CX.
// The third row is the bottom of the band: SCHIP_Y(2) + ROW_H = 498.
const SCHIP_X = CONTENT_L, SCHIP_W = 320;                // 60..380
const SCHIP_Y = i => ROLE_Y + i * (ROW_H + 10);          // 376 / 420 / 464

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'ETCD Raft Consensus: replicate, ack, commit',
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
    // role and log rows use. Width 320 keeps the strip clear of the ETCD column.
    const termChip   = valChip({ x: SCHIP_X, y: SCHIP_Y(0), w: SCHIP_W, h: ROW_H, name: 'term',             value: '4', role: 'cluster' });
    const acksChip   = valChip({ x: SCHIP_X, y: SCHIP_Y(1), w: SCHIP_W, h: ROW_H, name: 'acks (entry 9)', value: 'idle', role: 'cluster' });
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

    [API_TO_E1, E1_TO_API, E1_TO_E2, E2_TO_E1, REPLICATE, ACK_E3].forEach(pts =>
      content.appendChild(pathArrow({ points: pts, dim: true, dashed: true, role: 'cluster' })));

    // Tie each ETCD replica to the role chip directly below it (a binding, not flow).
    content.appendChild(line({ class: 'scheme-arrow scheme-arrow-cluster', x1: CYL_CXS[0], y1: CYL_BOTTOM, x2: CYL_CXS[0], y2: ROLE_Y }));
    content.appendChild(line({ class: 'scheme-arrow scheme-arrow-cluster', x1: CYL_CXS[1], y1: CYL_BOTTOM, x2: CYL_CXS[1], y2: ROLE_Y }));
    content.appendChild(line({ class: 'scheme-arrow scheme-arrow-cluster', x1: CYL_CXS[2], y1: CYL_BOTTOM, x2: CYL_CXS[2], y2: ROLE_Y }));

    const wireProposal  = text({ class: 'scheme-label code dim', x: (API_R + CYL_XS[0]) / 2, y: CYL_CY - 12, 'text-anchor': 'middle' }, [' ']);
    const wireReplicate = text({ class: 'scheme-label code dim', x: CX + 100, y: ARC_Y - 10, 'text-anchor': 'middle' }, [' ']);
    content.appendChild(wireProposal); content.appendChild(wireReplicate);

    const packetLayer = g({ id: 'packetLayer' });
    content.appendChild(packetLayer);

    root.appendChild(content);
    this.host.appendChild(root);
    this.refs = {
      svg: root, api, e1, e2, e3, r1, r2, r3, l1, l2, l3, termChip, acksChip, quorumChip,
      wires: { proposal: wireProposal, replicate: wireReplicate },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['api','e1','e2','e3','r1','r2','r3','l1','l2','l3','termChip','acksChip','quorumChip']);
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
      setVal(s.refs.termChip, '4');
      setVal(s.refs.acksChip, 'idle');
      setVal(s.refs.quorumChip, '2 of 3');
    },
  },
  {
    id: 'proposal',
    duration: 1900,
    narration: 'The API issues a write for a new Pod, the only path by which Kubernetes state ever reaches ETCD. Every write is funneled through the Leader so the cluster has a single point that orders all changes. A request that lands on a Follower is not served there but forwarded to the Leader internally, so clients never observe a split view.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
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
      setVal(s.refs.acksChip, '0');
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
      setVal(s.refs.acksChip, '1 (then 2)');
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
      setVal(s.refs.acksChip, '2 / 2 ✓');
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
    narration: 'On the next heartbeat the Leader carries the new commitIndex to the Followers, signalling that entry 9 is safe to apply. Each Follower applies entry 9 to its state machine, the key-value view that clients actually read from. All three replicas now hold the Pod at index 9, and every read from here on returns it consistently.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.l2, '9 / 9');
      setVal(s.refs.l3, '9 / 9');
      s.refs.e1.classList.add('highlight');
      s.refs.e2.classList.add('highlight');
      s.refs.e3.classList.add('highlight');
      s.refs.l1.classList.add('highlight');
      s.refs.l2.classList.add('highlight');
      s.refs.l3.classList.add('highlight');
      if (ctx.reduced) return;
      // This step animated nothing at all while its narration has the Leader CARRYING the new
      // commitIndex to both Followers on the next heartbeat. It is the same two outbound lanes the
      // replicate step uses, and each Follower is already lit because both apply the entry.
      const hb2 = segmentPacket(s, ctx, { from: E1_TO_E2[0], to: E1_TO_E2[1], role: 'cluster' });
      const hb3 = routePacket(s, ctx, REPLICATE, { role: 'cluster' });
      return [hb2, hb3];
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
