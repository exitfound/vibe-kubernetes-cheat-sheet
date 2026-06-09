import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, box, arrow, packet, animateAlong } from '../lib/primitives.js';
import { valChip, setVal, makeInit } from '../lib/control-kit.js';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 460',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Leader election via Lease: acquire, renew, expire, failover',
      'data-style': 'outline',
    });
    const content = g({ transform: 'translate(60, 23) scale(0.9)' });
    content.appendChild(arrowDefs());

    const r1 = pod({ x: 320, y: 40, w: 200, h: 140, label: 'Controller-mgr-1', sublabel: '', containers: 1, cat: 'control' });
    const r2 = pod({ x: 540, y: 40, w: 200, h: 140, label: 'Controller-mgr-2', sublabel: '', containers: 1, cat: 'control' });
    const r3 = pod({ x: 760, y: 40, w: 200, h: 140, label: 'Controller-mgr-3', sublabel: '', containers: 1, cat: 'control' });

    [r1, r2, r3].forEach(r => {
      const glyph = r.querySelector('.scheme-pod-container');
      if (!glyph) return;
      const cw = 80, ch = 56, gx = (200 - cw) / 2, gy = 30;
      glyph.setAttribute('width',  String(cw));
      glyph.setAttribute('height', String(ch));
      glyph.setAttribute('x',      String(gx));
      glyph.setAttribute('y',      String(gy));
      r.appendChild(text({ class: 'scheme-pod-sublabel', x: 100, y: gy + ch / 2 + 4, 'text-anchor': 'middle' }, ['replica']));
    });

    // Right column state chips, vertical band aligned with replicas.
    const ttlChip   = valChip({ x: 980, y: 40,  w: 200, h: 32, name: 'lease ttl', value: '15s' });
    const renewChip = valChip({ x: 980, y: 84,  w: 200, h: 32, name: 'renewDeadline',        value: '10s' });
    const transChip = valChip({ x: 980, y: 128, w: 200, h: 32, name: 'leaseTransitions',     value: '0' });
    content.appendChild(ttlChip);
    content.appendChild(renewChip);
    content.appendChild(transChip);

    const v1 = valChip({ x: 320, y: 220, w: 200, h: 32, name: 'role', value: 'standby' });
    const v2 = valChip({ x: 540, y: 220, w: 200, h: 32, name: 'role', value: 'standby' });
    const v3 = valChip({ x: 760, y: 220, w: 200, h: 32, name: 'role', value: 'standby' });
    content.appendChild(v1);
    content.appendChild(v2);
    content.appendChild(v3);

    content.appendChild(arrow({ x1: 420, y1: 252, x2: 420, y2: 300, dim: true, dashed: true, color: 'control' }));
    content.appendChild(arrow({ x1: 640, y1: 252, x2: 640, y2: 300, dim: true, dashed: true, color: 'control' }));
    content.appendChild(arrow({ x1: 860, y1: 252, x2: 860, y2: 300, dim: true, dashed: true, color: 'control' }));

    const wire1 = text({ class: 'scheme-label code dim', x: 420, y: 202, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    const wire2 = text({ class: 'scheme-label code dim', x: 640, y: 202, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    const wire3 = text({ class: 'scheme-label code dim', x: 860, y: 202, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    [wire1, wire2, wire3].forEach(t => content.appendChild(t));

    // Lease object box, centred under the three replicas.
    const lease = box({ x: 320, y: 300, w: 640, h: 80, label: 'Kube-controller-manager', sublabel: 'coordination.k8s.io/v1', cat: 'control' });

    // holderIdentity chip, full-width below the Lease.
    const holderChip = valChip({ x: 320, y: 400, w: 640, h: 32, name: 'holderIdentity', value: '—' });
    content.appendChild(holderChip);

    const packetLayer = g({ id: 'packetLayer' });
    content.appendChild(packetLayer);

    // Replicas and Lease appended LAST so they render on top of packetLayer.
    content.appendChild(r1);
    content.appendChild(r2);
    content.appendChild(r3);
    content.appendChild(lease);

    root.appendChild(content);
    this.host.appendChild(root);
    this.refs = {
      svg: root,
      r1, r2, r3, v1, v2, v3,
      ttlChip, renewChip, transChip,
      lease, holderChip,
      packetLayer,
      wires: { w1: wire1, w2: wire2, w3: wire3 },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['r1','r2','r3','v1','v2','v3','ttlChip','renewChip','transChip','lease','holderChip']
    .forEach(k => s.refs[k].classList.remove('highlight'));
}

function clearWires(s) {
  Object.values(s.refs.wires).forEach(t => { t.textContent = ''; });
}

function setWire(s, key, txt) {
  if (s.refs.wires[key]) s.refs.wires[key].textContent = txt;
}

function resetReplicaOpacity(s) {
  ['r1','r2','r3'].forEach(k => { s.refs[k].style.opacity = '1'; });
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Three Controller-manager replicas are deployed on the Control Plane for HA. They all watch the same Lease object in coordination.k8s.io/v1. Until one PUTs successfully, no replica is leader and no control loops run.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetReplicaOpacity(s);
      setVal(s.refs.v1, 'standby');
      setVal(s.refs.v2, 'standby');
      setVal(s.refs.v3, 'standby');
      setVal(s.refs.ttlChip, '15s');
      setVal(s.refs.renewChip, '10s');
      setVal(s.refs.transChip, '0');
      setVal(s.refs.holderChip, '—');
    },
  },
  {
    id: 'acquire',
    duration: 2400,
    narration: 'All three replicas race to PUT the Lease with CAS preconditions on resourceVersion. Only the first PUT succeeds. The others get HTTP 409 Conflict and stay standby. Controller-mgr-1 wins, and the Lease holderIdentity becomes its name.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetReplicaOpacity(s);
      setVal(s.refs.v1, 'leader');
      setVal(s.refs.v2, 'standby (409)');
      setVal(s.refs.v3, 'standby (409)');
      setVal(s.refs.holderChip, 'Controller-mgr-1');
      setWire(s, 'w1', 'PUT  200 OK');
      setWire(s, 'w2', 'PUT  409');
      setWire(s, 'w3', 'PUT  409');
      s.refs.r1.classList.add('highlight');
      s.refs.r2.classList.add('highlight');
      s.refs.r3.classList.add('highlight');
      s.refs.v1.classList.add('highlight');
      s.refs.lease.classList.add('highlight');
      s.refs.holderChip.classList.add('highlight');
      if (ctx.reduced) return;
      // Three packets fly simultaneously from each replica role chip down to the Lease box.
      [[420, 252], [640, 252], [860, 252]].forEach(([x, y]) => {
        const p = packet({ x, y, cat: 'control' });
        s.refs.packetLayer.appendChild(p);
        ctx.register(animateAlong(p, [[x, y], [x, 300]], { duration: 1100 }));
        ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1100, fill: 'forwards', easing: 'ease-in' }));
      });
    },
  },
  {
    id: 'renew',
    duration: 2000,
    narration: 'Only the leader runs control loops (Deployment, ReplicaSet, Job, ...). It periodically updates the Lease renewTime to keep its leadership valid for another leaseDurationSeconds (default 15s). Standby replicas keep watching but stay quiet.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetReplicaOpacity(s);
      setVal(s.refs.v1, 'leader · reconciling');
      setVal(s.refs.v2, 'standby');
      setVal(s.refs.v3, 'standby');
      setVal(s.refs.holderChip, 'Controller-mgr-1');
      setWire(s, 'w1', 'PUT  renewTime');
      s.refs.r1.classList.add('highlight');
      s.refs.v1.classList.add('highlight');
      s.refs.lease.classList.add('highlight');
      s.refs.renewChip.classList.add('highlight');
      if (ctx.reduced) return;
      const p = packet({ x: 420, y: 252, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[420, 252], [420, 300]], { duration: 1500 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1500, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'holder-die',
    duration: 2200,
    narration: 'Controller-mgr-1 crashes or its network partitions. Renewals stop. Once leaseDurationSeconds passes without an update to renewTime, the Lease is considered expired and any replica may CAS-acquire it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.v1, 'unreachable');
      setVal(s.refs.v2, 'standby · watching');
      setVal(s.refs.v3, 'standby · watching');
      setVal(s.refs.holderChip, 'Controller-mgr-1 (stale)');
      setVal(s.refs.ttlChip, '0s · expired');
      // Pin final opacity inline so cancel between steps does not flash to default.
      s.refs.r1.style.opacity = '0.3';
      s.refs.r2.style.opacity = '1';
      s.refs.r3.style.opacity = '1';
      s.refs.ttlChip.classList.add('highlight');
      if (ctx.reduced) return;
      ctx.register(s.refs.r1.animate([{ opacity: 1 }, { opacity: 0.3 }], { duration: 800, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'failover',
    duration: 2400,
    narration: 'Controller-mgr-2 wins the next CAS race. The Lease holderIdentity flips to its name and leaseTransitions increments. Control loops resume on the new leader within roughly leaseDurationSeconds plus the client retry period after the failure.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.v1, 'unreachable');
      setVal(s.refs.v2, 'leader');
      setVal(s.refs.v3, 'standby');
      setVal(s.refs.holderChip, 'Controller-mgr-2');
      setVal(s.refs.transChip, '1');
      setVal(s.refs.ttlChip, '15s');
      setWire(s, 'w2', 'PUT  200 OK');
      setWire(s, 'w3', 'PUT  409');
      s.refs.r1.style.opacity = '0.3';
      s.refs.r2.classList.add('highlight');
      s.refs.v2.classList.add('highlight');
      s.refs.holderChip.classList.add('highlight');
      s.refs.transChip.classList.add('highlight');
      s.refs.lease.classList.add('highlight');
      if (ctx.reduced) return;
      const p = packet({ x: 640, y: 252, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[640, 252], [640, 300]], { duration: 1400 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1400, fill: 'forwards', easing: 'ease-in' }));
    },
  },
];

export const init = makeInit(Scene, STEPS);
