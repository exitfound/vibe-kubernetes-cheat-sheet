import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, routePacket, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT, lightBoxAt, OPACITY } from '../lib/cluster-kit.js';

// Laid out on the L: the narration panel owns the top-left corner and nothing is drawn there.
// Measured worst case over 1600/1280/1100 is x<=397, y<=205, so the replica row starts at 420.
// Three boxes that all clear the panel cannot also be symmetric about CX, so they converge on
// one corridor and enter the Lease on its top midpoint, which is what keeps the lanes paired.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600
const CY = 640 / 2;                                      // 320, the canvas centre line
const PANEL_R = 400, PANEL_B = 215;                      // the reserved corner

// Every row below is derived from REP_Y, so the whole stack moves as one. The band runs
// REP_Y .. FIELD_Y + ROW_H, 431 tall, and REP_Y is picked to centre that band on CY.
const REP_W = 220, REP_H = 80, REP_GAP = 30;
const BAND_H = 431;
const REP_Y = Math.round(CY - BAND_H / 2), REP_BOTTOM = REP_Y + REP_H;   // 105 / 185
const REP_XS = [420, 670, 920];                          // 420..640 / 670..890 / 920..1140
const REP_CXS = REP_XS.map(x => x + REP_W / 2);          // 530 / 780 / 1030

const ROW_H = 34;
const ROLE_Y = REP_BOTTOM + 40, ROLE_BOTTOM = ROLE_Y + ROW_H;   // 225 / 259

const LANE_DX = 10;                                      // request lane left, response lane right
const LANE_RUN = 48;                                     // one leg of the L, above and below the corridor
const CORRIDOR_Y = ROLE_BOTTOM + LANE_RUN;               // 307, the shared run below the replicas

const LEASE_X = CONTENT_L, LEASE_W = CONTENT_R - CONTENT_L;  // 60..1140
const LEASE_Y = CORRIDOR_Y + LANE_RUN, LEASE_H = 80;     // 355..435
const LEASE_TOP = LEASE_Y;

// One L per direction per replica: down its own lane, along the corridor, into the Lease on its
// top midpoint. Both directions land on CX +/- LANE_DX, so the face carries a mirrored pair.
const putRoute = cx => [[cx - LANE_DX, ROLE_BOTTOM], [cx - LANE_DX, CORRIDOR_Y], [CX - LANE_DX, CORRIDOR_Y], [CX - LANE_DX, LEASE_TOP]];
const ackRoute = cx => [[CX + LANE_DX, LEASE_TOP], [CX + LANE_DX, CORRIDOR_Y], [cx + LANE_DX, CORRIDOR_Y], [cx + LANE_DX, ROLE_BOTTOM]];

const HOLDER_Y = LEASE_Y + LEASE_H + 20;                 // 455..489
const FIELD_Y = HOLDER_Y + ROW_H + 13;                   // 502..536, the bottom of the band

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Leader election via Lease: acquire, renew, expire, failover',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Three controller-manager replicas (boxes, standard 220x80), the row right of the
    // panel and flush with the Lease right edge. Centres REP_CXS, 530 / 780 / 1030.
    const r1 = box({ x: REP_XS[0], y: REP_Y, w: REP_W, h: REP_H, label: 'Controller-mgr-1', role: 'cluster' });
    const r2 = box({ x: REP_XS[1], y: REP_Y, w: REP_W, h: REP_H, label: 'Controller-mgr-2', role: 'cluster' });
    const r3 = box({ x: REP_XS[2], y: REP_Y, w: REP_W, h: REP_H, label: 'Controller-mgr-3', role: 'cluster' });

    // role chip under each replica.
    const v1 = valChip({ x: REP_XS[0], y: ROLE_Y, w: REP_W, h: ROW_H, name: 'role', value: 'standby', role: 'cluster' });
    const v2 = valChip({ x: REP_XS[1], y: ROLE_Y, w: REP_W, h: ROW_H, name: 'role', value: 'standby', role: 'cluster' });
    const v3 = valChip({ x: REP_XS[2], y: ROLE_Y, w: REP_W, h: ROW_H, name: 'role', value: 'standby', role: 'cluster' });
    root.appendChild(v1); root.appendChild(v2); root.appendChild(v3);

    // Each replica's CAS exchange is a parallel pair: PUT down its own lane and along the
    // corridor, 409 or 200 back up the other. Wire and packet share one points array.
    REP_CXS.forEach(cx => {
      root.appendChild(pathArrow({ points: putRoute(cx), dim: true, dashed: true, role: 'cluster' }));
      root.appendChild(pathArrow({ points: ackRoute(cx), dim: true, dashed: true, role: 'cluster' }));
    });

    // PUT result labels, set per step, to the right of each pair.
    const wire1 = text({ class: 'scheme-label code dim', x: REP_CXS[0] + 22, y: CORRIDOR_Y - 10, 'text-anchor': 'start' }, [' ']);
    const wire2 = text({ class: 'scheme-label code dim', x: REP_CXS[1] + 22, y: CORRIDOR_Y - 10, 'text-anchor': 'start' }, [' ']);
    const wire3 = text({ class: 'scheme-label code dim', x: REP_CXS[2] + 22, y: CORRIDOR_Y - 10, 'text-anchor': 'start' }, [' ']);
    [wire1, wire2, wire3].forEach(t => root.appendChild(t));

    // The Lease object all three watch and contend for.
    const lease = box({ x: LEASE_X, y: LEASE_Y, w: LEASE_W, h: LEASE_H, label: 'Lease', sublabel: 'kube-controller-manager · coordination.k8s.io/v1', role: 'cluster' });

    // Lease fields, grouped directly under it. holderIdentity is the headline.
    const holderChip = valChip({ x: LEASE_X, y: HOLDER_Y, w: LEASE_W, h: ROW_H, name: 'holderIdentity', value: 'none', role: 'cluster' });
    const durChip    = valChip({ x: CONTENT_L + 0 * ((LEASE_W - 40) / 3 + 20), y: FIELD_Y, w: (LEASE_W - 40) / 3, h: ROW_H, name: 'leaseDurationSeconds',    value: '15s', role: 'cluster' });
    const renewChip  = valChip({ x: CONTENT_L + 1 * ((LEASE_W - 40) / 3 + 20), y: FIELD_Y, w: (LEASE_W - 40) / 3, h: ROW_H, name: 'renewTime',        value: 'none', role: 'cluster' });
    const transChip  = valChip({ x: CONTENT_L + 2 * ((LEASE_W - 40) / 3 + 20), y: FIELD_Y, w: (LEASE_W - 40) / 3, h: ROW_H, name: 'leaseTransitions', value: '0', role: 'cluster' });
    [holderChip, durChip, renewChip, transChip].forEach(c => root.appendChild(c));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    // Replicas and Lease appended LAST so they render on top of packetLayer.
    root.appendChild(r1); root.appendChild(r2); root.appendChild(r3);
    root.appendChild(lease);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      r1, r2, r3, v1, v2, v3,
      lease, holderChip, durChip, renewChip, transChip,
      packetLayer,
      wires: { w1: wire1, w2: wire2, w3: wire3 },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['r1','r2','r3','v1','v2','v3','lease','holderChip','durChip','renewChip','transChip']);
}

function resetReplicaOpacity(s) {
  ['r1','r2','r3'].forEach(k => { s.refs[k].style.opacity = '1'; });
}

// PUT request: down the left lane (cx-10) from the role chip to the Lease.
function putPacket(s, ctx, cx, delay = 0) {
  return routePacket(s, ctx, putRoute(cx), { delay, role: 'cluster' });
}

// A losing CAS: the request lands, the resourceVersion check fails, and a 409
// response travels back up the right lane (cx+10). The winner commits with no bounce.
function loserPut(s, ctx, cx) {
  const down = putPacket(s, ctx, cx);
  routePacket(s, ctx, ackRoute(cx), { delay: down.arrivalMs + BEAT.afterHop, role: 'cluster' });
  return down;
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetReplicaOpacity(s);
      setVal(s.refs.v1, 'standby');
      setVal(s.refs.v2, 'standby');
      setVal(s.refs.v3, 'standby');
      setVal(s.refs.holderChip, 'none');
      setVal(s.refs.durChip, '15s');
      setVal(s.refs.renewChip, 'none');
      setVal(s.refs.transChip, '0');
    },
  },
  {
    id: 'acquire',
    duration: 3200,
    narration: 'All three replicas race to PUT the Lease, each guarded by a compare-and-swap on resourceVersion. Only the first write commits: Controller-mgr-1 gets 200 OK and the Lease holderIdentity becomes its name. The other two get HTTP 409 Conflict and stay standby.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetReplicaOpacity(s);
      setVal(s.refs.v1, 'leader');
      setVal(s.refs.v2, 'standby (409)');
      setVal(s.refs.v3, 'standby (409)');
      setVal(s.refs.holderChip, 'Controller-mgr-1');
      setVal(s.refs.renewChip, 'fresh');
      setWire(s, 'w1', 'PUT 200 OK');
      setWire(s, 'w2', 'PUT 409');
      setWire(s, 'w3', 'PUT 409');
      s.refs.r1.classList.add('highlight');
      s.refs.r2.classList.add('highlight');
      s.refs.r3.classList.add('highlight');
      s.refs.v1.classList.add('highlight');
      s.refs.v2.classList.add('highlight');
      s.refs.v3.classList.add('highlight');
      s.refs.holderChip.classList.add('highlight');
      s.refs.renewChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.lease.classList.add('highlight'); return; }
      // Three CAS-PUTs leave together. mgr-1 commits (stays); the other two are
      // rejected and bounce back as 409. The Lease lights when the winning write lands on it,
      // the same shape the renew step uses.
      const wins = putPacket(s, ctx, REP_CXS[0]);
      lightBoxAt(s.refs.lease, ctx, wins.arrivalMs);
      loserPut(s, ctx, REP_CXS[1]);
      loserPut(s, ctx, REP_CXS[2]);
    },
  },
  {
    id: 'renew',
    duration: 2000,
    narration: 'Only the leader runs control loops (Deployment, ReplicaSet, Job and the rest). It periodically PUTs a new renewTime to the Lease, extending its hold for another leaseDurationSeconds (default 15s). The standby replicas keep watching but stay quiet.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetReplicaOpacity(s);
      setVal(s.refs.v1, 'leader · reconciling');
      setVal(s.refs.v2, 'standby');
      setVal(s.refs.v3, 'standby');
      setVal(s.refs.holderChip, 'Controller-mgr-1');
      setVal(s.refs.renewChip, 'fresh');
      setWire(s, 'w1', 'PUT renewTime');
      s.refs.r1.classList.add('highlight');
      s.refs.v1.classList.add('highlight');
      s.refs.renewChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.lease.classList.add('highlight'); return; }
      const leasePkt = putPacket(s, ctx, REP_CXS[0]);
      lightBoxAt(s.refs.lease, ctx, leasePkt.arrivalMs);
    },
  },
  {
    id: 'expire',
    duration: 2200,
    narration: 'Controller-mgr-1 crashes or its network partitions, so renewals stop. Once leaseDurationSeconds passes with no update to renewTime, the Lease is treated as expired and any replica is free to CAS-acquire it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.v1, 'unreachable');
      setVal(s.refs.v2, 'standby · watching');
      setVal(s.refs.v3, 'standby · watching');
      setVal(s.refs.holderChip, 'Controller-mgr-1 (stale)');
      setVal(s.refs.renewChip, 'stale (>15s)');
      // Pin final opacity inline so a cancel between steps does not flash to default.
      s.refs.r1.style.opacity = String(OPACITY.notready);
      s.refs.r2.style.opacity = '1';
      s.refs.r3.style.opacity = '1';
      s.refs.v1.classList.add('highlight');
      s.refs.v2.classList.add('highlight');
      s.refs.v3.classList.add('highlight');
      s.refs.renewChip.classList.add('highlight');
      s.refs.holderChip.classList.add('highlight');
      if (ctx.reduced) return;
      // The dead leader fades out; the stale renewTime is the event, no packet travels.
      ctx.register(s.refs.r1.animate([{ opacity: 1 }, { opacity: OPACITY.notready }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'failover',
    duration: 3200,
    narration: 'With the Lease expired, the surviving replicas race again. Controller-mgr-2 wins the CAS, holderIdentity flips to its name, and leaseTransitions increments. Control loops resume on the new leader within roughly leaseDurationSeconds plus the client retry period.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.v1, 'unreachable');
      setVal(s.refs.v2, 'leader');
      setVal(s.refs.v3, 'standby');
      setVal(s.refs.holderChip, 'Controller-mgr-2');
      setVal(s.refs.renewChip, 'fresh');
      setVal(s.refs.transChip, '1');
      setWire(s, 'w2', 'PUT 200 OK');
      setWire(s, 'w3', 'PUT 409');
      s.refs.r1.style.opacity = String(OPACITY.notready);
      s.refs.r2.style.opacity = '1';
      s.refs.r3.style.opacity = '1';
      s.refs.r2.classList.add('highlight');
      s.refs.v2.classList.add('highlight');
      s.refs.holderChip.classList.add('highlight');
      s.refs.renewChip.classList.add('highlight');
      s.refs.transChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.lease.classList.add('highlight'); return; }
      // The two survivors race; mgr-2 commits (stays), mgr-3 is rejected and bounces back as 409.
      // The Lease lights on the winning write landing, not before it.
      const wins = putPacket(s, ctx, REP_CXS[1]);
      lightBoxAt(s.refs.lease, ctx, wins.arrivalMs);
      loserPut(s, ctx, REP_CXS[2]);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
