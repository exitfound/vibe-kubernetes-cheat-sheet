import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, box, arrow, pathArrow, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

function valChip({ x, y, w, h = 32, name, value, cat = 'control' }) {
  const grp = g({ class: 'scheme-chip', 'data-cat': cat, transform: `translate(${x},${y})` });
  grp.appendChild(rect({ class: 'scheme-chip-rect', x: 0, y: 0, width: w, height: h, rx: 4 }));
  grp.appendChild(text({ class: 'scheme-chip-text', x: 12, y: h / 2 + 4, 'text-anchor': 'start' }, [name]));
  const valueT = text({ class: 'scheme-chip-text', x: w - 12, y: h / 2 + 4, 'text-anchor': 'end' }, [value]);
  grp.appendChild(valueT);
  grp.valueText = valueT;
  return grp;
}
function setVal(node, txt) { if (node && node.valueText) node.valueText.textContent = txt; }

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1100 520',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Leader election via Lease',
    });
    root.appendChild(arrowDefs());

    const r1 = pod({ x: 80,  y: 80, w: 280, h: 130, label: 'controller-mgr-1', sublabel: 'replica', cat: 'control' });
    const r2 = pod({ x: 410, y: 80, w: 280, h: 130, label: 'controller-mgr-2', sublabel: 'replica', cat: 'control' });
    const r3 = pod({ x: 740, y: 80, w: 280, h: 130, label: 'controller-mgr-3', sublabel: 'replica', cat: 'control' });
    root.appendChild(r1); root.appendChild(r2); root.appendChild(r3);

    const r1Status = valChip({ x: 80,  y: 220, w: 280, name: 'role', value: 'standby' });
    const r2Status = valChip({ x: 410, y: 220, w: 280, name: 'role', value: 'standby' });
    const r3Status = valChip({ x: 740, y: 220, w: 280, name: 'role', value: 'standby' });
    root.appendChild(r1Status); root.appendChild(r2Status); root.appendChild(r3Status);

    const lease = box({ x: 320, y: 320, w: 460, h: 80, label: 'Lease kube-controller-manager', sublabel: 'coordination.k8s.io', cat: 'control' });
    root.appendChild(lease);

    const holder = valChip({ x: 320, y: 410, w: 460, h: 32, name: 'holderIdentity', value: '—' });
    root.appendChild(holder);

    const ttl = valChip({ x: 320, y: 446, w: 460, h: 32, name: 'leaseDurationSeconds', value: '15s · renew every 10s' });
    root.appendChild(ttl);

    root.appendChild(pathArrow({ points: [[220, 210], [220, 290], [380, 290], [380, 320]], dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 550, y1: 210, x2: 550, y2: 320, dim: true, dashed: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[880, 210], [880, 290], [720, 290], [720, 320]], dim: true, dashed: true, color: 'control' }));

    this.host.appendChild(root);
    this.refs = { svg: root, r1, r2, r3, r1Status, r2Status, r3Status, lease, holder, ttl };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['r1','r2','r3','r1Status','r2Status','r3Status','lease','holder','ttl'].forEach(k => s.refs[k].classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Three controller-manager replicas are deployed for HA. They all watch the same Lease object in coordination.k8s.io. None holds it yet.',
    enter(s) {
      clearHL(s);
      setVal(s.refs.r1Status, 'standby');
      setVal(s.refs.r2Status, 'standby');
      setVal(s.refs.r3Status, 'standby');
      setVal(s.refs.holder, '—');
      setVal(s.refs.ttl, '15s · renew every 10s');
      s.refs.r1.style.opacity = '1';
      s.refs.lease.classList.add('highlight');
    },
  },
  {
    id: 'acquire',
    duration: 1900,
    narration: 'All three race to PUT the Lease with CAS (resourceVersion preconditions). Replica-1 wins, the other two get conflict and stay standby.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.r1Status, 'leader');
      setVal(s.refs.r2Status, 'standby');
      setVal(s.refs.r3Status, 'standby');
      setVal(s.refs.holder, 'controller-mgr-1');
      s.refs.r1.classList.add('highlight');
      s.refs.r1Status.classList.add('highlight');
      s.refs.holder.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.holder, { duration: 800, iterations: 2 }));
    },
  },
  {
    id: 'reconcile',
    duration: 1700,
    narration: 'Only the leader runs control loops (Deployment ctrl, ReplicaSet ctrl, etc.). Standbys keep watching the Lease and stay quiet.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.r1Status, 'leader · reconciling');
      setVal(s.refs.r2Status, 'standby');
      setVal(s.refs.r3Status, 'standby');
      setVal(s.refs.holder, 'controller-mgr-1');
      s.refs.r1.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.r1, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'holder-die',
    duration: 1900,
    narration: 'replica-1 crashes (or its network partitions). It stops renewing the Lease. The leaseDurationSeconds clock starts ticking down.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.r1Status, 'unreachable');
      setVal(s.refs.holder, 'controller-mgr-1 (stale)');
      setVal(s.refs.ttl, '0s · expired');
      s.refs.r1.style.opacity = '0.3';
      s.refs.ttl.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(s.refs.r1.animate([{ opacity: 1 }, { opacity: 0.3 }], { duration: 700, fill: 'forwards', easing: 'ease-in' }));
        ctx.register(pulse(s.refs.ttl, { duration: 800, iterations: 2 }));
      }
    },
  },
  {
    id: 'failover',
    duration: 1900,
    narration: 'Lease expires. replica-2 wins the next CAS race and takes over. Within seconds (lease + retry), control loops resume on the new leader.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.r1Status, 'unreachable');
      setVal(s.refs.r2Status, 'leader');
      setVal(s.refs.r3Status, 'standby');
      setVal(s.refs.holder, 'controller-mgr-2');
      setVal(s.refs.ttl, '15s · renew every 10s');
      s.refs.r1.style.opacity = '0.3';
      s.refs.r2.classList.add('highlight');
      s.refs.r2Status.classList.add('highlight');
      s.refs.holder.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.r2, { duration: 800, iterations: 2 }));
    },
  },
];

export function init(root, callbacks = {}) {
  const scene = new Scene(root);
  const tl = new Timeline({
    steps: STEPS,
    scene,
    onSceneReset: () => scene.reset(),
    onChange: callbacks.onStepChange,
    onPlayingChange: callbacks.onPlayingChange,
  });
  return {
    play: () => tl.play(),
    pause: () => tl.pause(),
    reset: () => tl.reset(),
    restart: () => tl.restart(),
    gotoStep: (i) => tl.gotoStep(i),
    setLoop: (b) => tl.setLoop(b),
    isLooping: () => tl.isLooping(),
    step: (dir) => tl.step(dir),
    setSpeed: (r) => tl.setSpeed(r),
    isPlaying: () => tl.isPlaying(),
    destroy: () => { tl.destroy(); root.replaceChildren(); },
  };
}
