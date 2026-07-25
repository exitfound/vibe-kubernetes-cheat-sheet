import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, arrow } from '../lib/primitives.js';
import { valChip, setVal, routePacket, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT } from '../lib/cluster-kit.js';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 -45 1200 620',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Leader election via Lease: acquire, renew, expire, failover',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Three Controller-manager replicas (boxes, standard 220x80), edges flush with
    // the Lease below (360..1040). Centres 470 / 700 / 930.
    const r1 = box({ x: 360, y: 50, w: 220, h: 80, label: 'Controller-mgr-1', role: 'cluster' });
    const r2 = box({ x: 590, y: 50, w: 220, h: 80, label: 'Controller-mgr-2', role: 'cluster' });
    const r3 = box({ x: 820, y: 50, w: 220, h: 80, label: 'Controller-mgr-3', role: 'cluster' });

    // role chip under each replica.
    const v1 = valChip({ x: 360, y: 170, w: 220, name: 'role', value: 'standby', role: 'cluster' });
    const v2 = valChip({ x: 590, y: 170, w: 220, name: 'role', value: 'standby', role: 'cluster' });
    const v3 = valChip({ x: 820, y: 170, w: 220, name: 'role', value: 'standby', role: 'cluster' });
    root.appendChild(v1); root.appendChild(v2); root.appendChild(v3);

    // Each replica's CAS exchange is a parallel pair (like the previous card):
    // PUT request down the left lane (cx-10), response up the right lane (cx+10).
    [470, 700, 930].forEach(cx => {
      root.appendChild(arrow({ x1: cx - 10, y1: 202, x2: cx - 10, y2: 300, dim: true, dashed: true, role: 'cluster' }));
      root.appendChild(arrow({ x1: cx + 10, y1: 300, x2: cx + 10, y2: 202, dim: true, dashed: true, role: 'cluster' }));
    });

    // PUT result labels, set per step, to the right of each pair.
    const wire1 = text({ class: 'scheme-label code dim', x: 492, y: 255, 'text-anchor': 'start' }, [' ']);
    const wire2 = text({ class: 'scheme-label code dim', x: 722, y: 255, 'text-anchor': 'start' }, [' ']);
    const wire3 = text({ class: 'scheme-label code dim', x: 952, y: 255, 'text-anchor': 'start' }, [' ']);
    [wire1, wire2, wire3].forEach(t => root.appendChild(t));

    // The Lease object all three watch and contend for.
    const lease = box({ x: 360, y: 300, w: 680, h: 80, label: 'Lease', sublabel: 'kube-controller-manager · coordination.k8s.io/v1', role: 'cluster' });

    // Lease fields, grouped directly under it. holderIdentity is the headline.
    const holderChip = valChip({ x: 360, y: 400, w: 680, h: 32, name: 'holderIdentity', value: 'none', role: 'cluster' });
    const durChip    = valChip({ x: 360, y: 447, w: 220, h: 32, name: 'leaseDuration',    value: '15s', role: 'cluster' });
    const renewChip  = valChip({ x: 590, y: 447, w: 220, h: 32, name: 'renewTime',        value: 'none', role: 'cluster' });
    const transChip  = valChip({ x: 820, y: 447, w: 220, h: 32, name: 'leaseTransitions', value: '0', role: 'cluster' });
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
  return routePacket(s, ctx, [[cx - 10, 202], [cx - 10, 300]], { delay, role: 'cluster' });
}

// A losing CAS: the request lands, the resourceVersion check fails, and a 409
// response travels back up the right lane (cx+10). The winner commits with no bounce.
function loserPut(s, ctx, cx) {
  const down = putPacket(s, ctx, cx);
  routePacket(s, ctx, [[cx + 10, 300], [cx + 10, 202]], { delay: down.arrivalMs + BEAT.afterHop, role: 'cluster' });
  return down;
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Three Controller-manager replicas run on the Control Plane for high availability. Each one watches the same Lease object in coordination.k8s.io/v1. Until a replica writes the Lease successfully there is no holder, so no leader exists and no control loops run.',
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
    duration: 2400,
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
      s.refs.lease.classList.add('highlight');
      s.refs.holderChip.classList.add('highlight');
      if (ctx.reduced) return;
      // Three CAS-PUTs leave together. mgr-1 commits (stays); the other two are
      // rejected and bounce back as 409.
      putPacket(s, ctx, 470);
      loserPut(s, ctx, 700);
      loserPut(s, ctx, 930);
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
      s.refs.lease.classList.add('highlight');
      s.refs.renewChip.classList.add('highlight');
      if (ctx.reduced) return;
      putPacket(s, ctx, 470);
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
      s.refs.r1.style.opacity = '0.3';
      s.refs.r2.style.opacity = '1';
      s.refs.r3.style.opacity = '1';
      s.refs.renewChip.classList.add('highlight');
      s.refs.holderChip.classList.add('highlight');
      if (ctx.reduced) return;
      // The dead leader fades out; the stale renewTime is the event, no packet travels.
      ctx.register(s.refs.r1.animate([{ opacity: 1 }, { opacity: 0.3 }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'failover',
    duration: 2400,
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
      s.refs.r1.style.opacity = '0.3';
      s.refs.r2.style.opacity = '1';
      s.refs.r3.style.opacity = '1';
      s.refs.r2.classList.add('highlight');
      s.refs.v2.classList.add('highlight');
      s.refs.lease.classList.add('highlight');
      s.refs.holderChip.classList.add('highlight');
      s.refs.transChip.classList.add('highlight');
      if (ctx.reduced) return;
      // The two survivors race; mgr-2 commits (stays), mgr-3 is rejected and bounces back as 409.
      putPacket(s, ctx, 700);
      loserPut(s, ctx, 930);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
