import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, pathArrow } from '../../lib/primitives.js';
import { valChip, setVal, routePacket, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT, lightBoxAt, OPACITY } from '../../lib/cluster-kit.js';

// One column, centred on the canvas, and every replica reaches the Lease on its own axis.
// Design notes, including what this costs vertically: scheme/docs/CARDS.md#cluster-leader-election
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600, the canvas centre line
const PANEL_B = 155;                                     // measured worst case over 1600/1280/1100: 400 wide

// The column: three standard boxes and their two gaps, centred on CX. Every block below takes it.
const REP_W = 220, REP_H = 80, REP_GAP = 30;
const STACK_W = 3 * REP_W + 2 * REP_GAP;                 // 720
const STACK_L = CX - STACK_W / 2;                        // 240..960
const REP_XS = [0, 1, 2].map(i => STACK_L + i * (REP_W + REP_GAP));  // 240 / 490 / 740
const REP_CXS = REP_XS.map(x => x + REP_W / 2);          // 350 / 600 / 850

// The row is pinned by the panel, not by the canvas centre: centred horizontally, its left third
// sits in the panel's column, so it has to start below PANEL_B. 15 units of clearance, and
// PANEL_B is what every narration on this card is written to hold at (five lines on 1100x800).
const REP_Y = PANEL_B + 15, REP_BOTTOM = REP_Y + REP_H;  // 170 / 250

const ROW_H = 34;
const ROLE_Y = REP_BOTTOM + 12, ROLE_BOTTOM = ROLE_Y + ROW_H;   // 262 / 296

// One PUT lane and one answer lane per replica, both vertical, both on that replica's own axis.
// They used to fan into a single Lease entry over a shared horizontal corridor, which put six
// routes on one line and made it unreadable which answer belonged to which replica.
const LANE_DX = 10;                                      // request lane left, answer lane right
const LANE_RUN = 56;                                     // the straight drop from role chip to Lease

const LEASE_X = STACK_L, LEASE_W = STACK_W;              // 240..960, the replica column
const LEASE_Y = ROLE_BOTTOM + LANE_RUN, LEASE_H = 80;    // 352..432
const LEASE_TOP = LEASE_Y;

const putRoute = cx => [[cx - LANE_DX, ROLE_BOTTOM], [cx - LANE_DX, LEASE_TOP]];
const ackRoute = cx => [[cx + LANE_DX, LEASE_TOP], [cx + LANE_DX, ROLE_BOTTOM]];

// The three Lease fields split the column with the same 20 unit gap the row above uses.
const FIELD_GAP = 20, FIELD_W = (LEASE_W - 2 * FIELD_GAP) / 3;   // 226.67

const HOLDER_Y = LEASE_Y + LEASE_H + 16;                 // 448..482
const FIELD_Y = HOLDER_Y + ROW_H + 10;                   // 492..526, the bottom of the band

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

    // Three controller-manager replicas (boxes, standard 220x80), the row centred on CX and
    // flush with the Lease on both edges. Centres REP_CXS, 350 / 600 / 850.
    const r1 = box({ x: REP_XS[0], y: REP_Y, w: REP_W, h: REP_H, label: 'Controller-mgr-1', role: 'cluster' });
    const r2 = box({ x: REP_XS[1], y: REP_Y, w: REP_W, h: REP_H, label: 'Controller-mgr-2', role: 'cluster' });
    const r3 = box({ x: REP_XS[2], y: REP_Y, w: REP_W, h: REP_H, label: 'Controller-mgr-3', role: 'cluster' });

    // role chip under each replica.
    const v1 = valChip({ x: REP_XS[0], y: ROLE_Y, w: REP_W, h: ROW_H, name: 'role', value: 'standby', role: 'cluster' });
    const v2 = valChip({ x: REP_XS[1], y: ROLE_Y, w: REP_W, h: ROW_H, name: 'role', value: 'standby', role: 'cluster' });
    const v3 = valChip({ x: REP_XS[2], y: ROLE_Y, w: REP_W, h: ROW_H, name: 'role', value: 'standby', role: 'cluster' });
    root.appendChild(v1); root.appendChild(v2); root.appendChild(v3);

    // Each replica's CAS exchange is a parallel pair on its own axis: PUT straight down the left
    // lane, 409 or 200 straight back up the right one. Wire and packet share one points array.
    REP_CXS.forEach(cx => {
      root.appendChild(pathArrow({ points: putRoute(cx), dim: true, dashed: true, role: 'cluster' }));
      root.appendChild(pathArrow({ points: ackRoute(cx), dim: true, dashed: true, role: 'cluster' }));
    });

    // PUT result labels, set per step, beside each replica's own lane pair at mid-run, so the
    // answer a step reports sits on the axis of the replica that received it.
    const WIRE_Y = ROLE_BOTTOM + LANE_RUN / 2 + 4;       // 328
    const wire1 = text({ class: 'scheme-label code dim', x: REP_CXS[0] + 22, y: WIRE_Y, 'text-anchor': 'start' }, [' ']);
    const wire2 = text({ class: 'scheme-label code dim', x: REP_CXS[1] + 22, y: WIRE_Y, 'text-anchor': 'start' }, [' ']);
    const wire3 = text({ class: 'scheme-label code dim', x: REP_CXS[2] + 22, y: WIRE_Y, 'text-anchor': 'start' }, [' ']);
    [wire1, wire2, wire3].forEach(t => root.appendChild(t));

    // The Lease object all three watch and contend for.
    const lease = box({ x: LEASE_X, y: LEASE_Y, w: LEASE_W, h: LEASE_H, label: 'Lease', sublabel: 'kube-controller-manager · coordination.k8s.io/v1', role: 'cluster' });

    // Lease fields, grouped directly under it. holderIdentity is the headline.
    const holderChip = valChip({ x: LEASE_X, y: HOLDER_Y, w: LEASE_W, h: ROW_H, name: 'holderIdentity', value: 'none', role: 'cluster' });
    const durChip    = valChip({ x: LEASE_X + 0 * (FIELD_W + FIELD_GAP), y: FIELD_Y, w: FIELD_W, h: ROW_H, name: 'leaseDurationSeconds',    value: '15s', role: 'cluster' });
    const renewChip  = valChip({ x: LEASE_X + 1 * (FIELD_W + FIELD_GAP), y: FIELD_Y, w: FIELD_W, h: ROW_H, name: 'renewTime',        value: 'none', role: 'cluster' });
    const transChip  = valChip({ x: LEASE_X + 2 * (FIELD_W + FIELD_GAP), y: FIELD_Y, w: FIELD_W, h: ROW_H, name: 'leaseTransitions', value: '0', role: 'cluster' });
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

// One request/answer exchange on a replica's own axis: the request goes down the left lane (cx-10)
// and the API answers on the right one (cx+10). Winner or loser, the answer is what the replica
// acts on, so both get one. WHICH call it is depends on the step and the wire labels say so: the
// acquire step is a create (201 Created, or 409 AlreadyExists for the two that lose the race),
// renew and failover are compare-and-swap on resourceVersion (200 OK, or 409 Conflict), and the
// standby poll on the renew step is a plain GET. It was called casPut, which named one of the
// three, and briefly leaseWrite, which still excluded the GET.
function leaseExchange(s, ctx, cx) {
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
    duration: 2700,
    narration: 'All three replicas race for the Lease. The first write creates the object, so Controller-mgr-1 becomes holder and the other two get 409. Every write after that is a compare-and-swap on resourceVersion.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetReplicaOpacity(s);
      setVal(s.refs.v1, 'leader');
      // The role chip holds a ROLE. The 409 is a response code and it already rides both wires
      // below, so annotating the chip with it duplicated the wire and then decayed back to plain
      // "standby" one step later with nothing marking the change.
      setVal(s.refs.v2, 'standby');
      setVal(s.refs.v3, 'standby');
      setVal(s.refs.holderChip, 'Controller-mgr-1');
      setVal(s.refs.renewChip, 'fresh');
      // The verbs differ from the failover step on purpose. This is the FIRST acquisition, and
      // client-go creates the Lease when its Get comes back NotFound, so the winner takes a 201 and
      // the losers an AlreadyExists 409. Every later race (failover) is an update guarded by
      // resourceVersion, which is where PUT and a conflict 409 belong.
      setWire(s, 'w1', 'POST 201 Created');
      setWire(s, 'w2', 'POST 409');
      setWire(s, 'w3', 'POST 409');
      s.refs.r1.classList.add('highlight');
      s.refs.r2.classList.add('highlight');
      s.refs.r3.classList.add('highlight');
      s.refs.v1.classList.add('highlight');
      s.refs.v2.classList.add('highlight');
      s.refs.v3.classList.add('highlight');
      s.refs.holderChip.classList.add('highlight');
      s.refs.renewChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.lease.classList.add('highlight'); return; }
      // Three creates leave together and each is answered on its own lane: mgr-1 takes the
      // 201 Created its wire label promises, the other two the 409. The Lease lights when the
      // winning write lands on it, the same shape the renew step uses.
      const wins = leaseExchange(s, ctx, REP_CXS[0]);
      lightBoxAt(s.refs.lease, ctx, wins.arrivalMs);
      leaseExchange(s, ctx, REP_CXS[1]);
      leaseExchange(s, ctx, REP_CXS[2]);
    },
  },
  {
    id: 'renew',
    // Three exchanges, but they run in parallel on three separate axes, so the span is unchanged at
    // 2060 and the duration stays where it was.
    duration: 2700,
    // The standby poll is DRAWN rather than written around. client-go runs the losers in
    // acquire(), which calls tryAcquireOrRenew on a JitterUntilWithContext every RetryPeriod, and
    // that does a Get on the Lease: the standbys are not idle, they are polling. An earlier fix
    // here reworded the sentence to "Standbys stay idle" so that it would match two empty lanes,
    // which traded a true sentence for a matching picture. The lanes carry the poll instead.
    narration: 'Only the leader runs control loops (Deployment, ReplicaSet, Job and the rest). It PUTs a fresh renewTime well inside leaseDurationSeconds (15s), and the standbys only GET the Lease to check it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetReplicaOpacity(s);
      setVal(s.refs.v1, 'leader · reconciling');
      setVal(s.refs.v2, 'standby · polling');
      setVal(s.refs.v3, 'standby · polling');
      setVal(s.refs.holderChip, 'Controller-mgr-1');
      setVal(s.refs.renewChip, 'fresh');
      setWire(s, 'w1', 'PUT renewTime');
      setWire(s, 'w2', 'GET Lease');
      setWire(s, 'w3', 'GET Lease');
      s.refs.r1.classList.add('highlight');
      s.refs.r2.classList.add('highlight');
      s.refs.r3.classList.add('highlight');
      s.refs.v1.classList.add('highlight');
      s.refs.v2.classList.add('highlight');
      s.refs.v3.classList.add('highlight');
      s.refs.renewChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.lease.classList.add('highlight'); return; }
      // A renewal is the same CAS-PUT as an acquisition and comes back 200, so it rides the answer
      // lane home like every other PUT on this card. Without it mgr-1's answer lane was the one
      // drawn lane that never carried anything while its twin did.
      const leasePkt = leaseExchange(s, ctx, REP_CXS[0]);
      lightBoxAt(s.refs.lease, ctx, leasePkt.arrivalMs);
      // The two standby polls, the same shape: a read down the request lane, the answer back up the
      // reply lane. Without them the sentence named a GET per standby that no lane ever carried.
      leaseExchange(s, ctx, REP_CXS[1]);
      leaseExchange(s, ctx, REP_CXS[2]);
    },
  },
  {
    id: 'expire',
    duration: 2200,
    narration: 'Controller-mgr-1 crashes or its network partitions, so renewals stop. Once leaseDurationSeconds passes with no new renewTime, the Lease counts as expired and any replica may CAS-acquire it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.v1, 'unreachable');
      // Not "polling": this step animates nothing, so a chip naming traffic points at two empty
      // lanes. What actually changes here is that both standbys become eligible to take the Lease.
      setVal(s.refs.v2, 'standby · may acquire');
      setVal(s.refs.v3, 'standby · may acquire');
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
    duration: 2700,
    narration: 'With the Lease expired, both survivors race again. Controller-mgr-2 wins the CAS, holderIdentity flips to its name and leaseTransitions increments. Control loops resume there within about a lease duration.',
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
      // Both survivors take part in this race, so both light: mgr-3 sends a CAS-PUT and takes
      // the 409 its own wire label reports. Only mgr-1 is out, and it is dimmed rather than lit.
      s.refs.r2.classList.add('highlight');
      s.refs.v2.classList.add('highlight');
      s.refs.r3.classList.add('highlight');
      s.refs.v3.classList.add('highlight');
      s.refs.holderChip.classList.add('highlight');
      s.refs.renewChip.classList.add('highlight');
      s.refs.transChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.lease.classList.add('highlight'); return; }
      // The two survivors race, and each is answered: mgr-2 takes the 200 OK, mgr-3 the 409.
      // The Lease lights on the winning write landing, not before it.
      const wins = leaseExchange(s, ctx, REP_CXS[1]);
      lightBoxAt(s.refs.lease, ctx, wins.arrivalMs);
      leaseExchange(s, ctx, REP_CXS[2]);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
