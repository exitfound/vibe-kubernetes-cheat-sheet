import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, cylinder, chainList, setChainActive, arrow, pathArrow, pulse, fadeIn, fadeOut } from '../lib/primitives.js';
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
      viewBox: '0 0 1200 600',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Node failure detection and pod eviction',
    });
    root.appendChild(arrowDefs());

    const cpWrap = node({ x: 20, y: 20, w: 540, h: 170, label: 'control plane' });
    root.appendChild(cpWrap);
    const ctrl = box({ x: 60, y: 70, w: 460, h: 90, label: 'node-lifecycle-controller', sublabel: 'inside kube-controller-manager', cat: 'control' });
    root.appendChild(ctrl);

    const lease = cylinder({ x: 590, y: 30, w: 120, h: 160, label: 'Lease', cat: 'control' });
    root.appendChild(lease);

    const readyChip      = valChip({ x: 740, y: 28,  w: 440, h: 30, name: 'Ready cond',     value: 'True' });
    const leaseChip      = valChip({ x: 740, y: 62,  w: 440, h: 30, name: 'Lease age',      value: '2s · fresh' });
    const taintChip      = valChip({ x: 740, y: 96,  w: 440, h: 30, name: 'Taint',          value: '—' });
    const tolerChip      = valChip({ x: 740, y: 130, w: 440, h: 30, name: 'Toleration',     value: '—' });
    const evictChip      = valChip({ x: 740, y: 164, w: 440, h: 30, name: 'evictionTimer',  value: '—' });
    root.appendChild(readyChip); root.appendChild(leaseChip); root.appendChild(taintChip);
    root.appendChild(tolerChip); root.appendChild(evictChip);

    const timeline = chainList({
      x: 20, y: 220, w: 240,
      items: [
        '1. Healthy',
        '2. Missed heartbeat',
        '3. NotReady',
        '4. Tainted (unreachable)',
        '5. Eviction',
        '6. Reschedule',
      ],
      cat: 'control',
    });
    root.appendChild(timeline);

    const nodeA = node({ x: 290, y: 220, w: 420, h: 350, label: 'node-A · Ready' });
    root.appendChild(nodeA);
    const podA  = pod({ x: 320, y: 330, w: 160, h: 110, label: 'app pod', sublabel: 'running', cat: 'workloads' });
    const podA2 = pod({ x: 510, y: 330, w: 160, h: 110, label: 'rescheduled', sublabel: 'pending', cat: 'workloads' });
    root.appendChild(podA);
    root.appendChild(podA2);
    podA2.style.opacity = '0';

    const nodeB = node({ x: 730, y: 220, w: 420, h: 350, label: 'node-B · ?' });
    root.appendChild(nodeB);
    const podB  = pod({ x: 820, y: 330, w: 240, h: 110, label: 'app pod', sublabel: 'running', cat: 'workloads' });
    root.appendChild(podB);

    root.appendChild(arrow({ x1: 520, y1: 115, x2: 590, y2: 115, dim: true, dashed: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[940, 220], [940, 195], [650, 195], [650, 190]], dim: true, dashed: true, color: 'control' }));

    this.host.appendChild(root);
    this.refs = {
      svg: root, ctrl, lease,
      readyChip, leaseChip, taintChip, tolerChip, evictChip,
      timeline,
      nodeA, podA, podA2, nodeB, podB,
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['ctrl','lease','readyChip','leaseChip','taintChip','tolerChip','evictChip','podA','podA2','podB']
    .forEach(k => s.refs[k].classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'node-B is Ready. Its kubelet renews a Lease in kube-node-lease every 10s, and node-lifecycle-controller watches the Lease, not the older NodeStatus heartbeat.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.readyChip, 'True');
      setVal(s.refs.leaseChip, '2s · fresh');
      setVal(s.refs.taintChip, '—');
      setVal(s.refs.tolerChip, '—');
      setVal(s.refs.evictChip, '—');
      s.refs.nodeB.style.opacity = '1';
      s.refs.podB.style.opacity  = '1';
      s.refs.podA2.style.opacity = '0';
      setChainActive(s.refs.timeline, 0);
      s.refs.lease.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.lease, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'kubelet-stops',
    duration: 1900,
    narration: 'node-B\'s kubelet stops renewing — kernel panic, network partition, kubelet crash. The Lease grows stale, but pods on the node keep running for now.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.readyChip, 'True (still)');
      setVal(s.refs.leaseChip, '12s → 35s · stale');
      s.refs.leaseChip.classList.add('highlight');
      s.refs.nodeB.style.opacity = '0.55';
      setChainActive(s.refs.timeline, 1);
      if (!ctx.reduced) ctx.register(pulse(s.refs.leaseChip, { duration: 800, iterations: 2 }));
    },
  },
  {
    id: 'not-ready',
    duration: 1900,
    narration: 'After --node-monitor-grace-period (default 40s), node-lifecycle-controller flips Ready: True → Unknown → False. Pods are still on the node — eviction has not started.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.readyChip, 'False · NotReady');
      setVal(s.refs.leaseChip, '42s · expired');
      s.refs.readyChip.classList.add('highlight');
      s.refs.ctrl.classList.add('highlight');
      setChainActive(s.refs.timeline, 2);
      if (!ctx.reduced) {
        ctx.register(pulse(s.refs.ctrl, { duration: 800, iterations: 1 }));
        ctx.register(pulse(s.refs.readyChip, { duration: 800, iterations: 1 }));
      }
    },
  },
  {
    id: 'taint-applied',
    duration: 1900,
    narration: 'controller adds the taint node.kubernetes.io/unreachable:NoExecute. The DefaultTolerationSeconds admission plugin already gave every pod a 300s toleration — that timer now ticks.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.taintChip, 'node.kubernetes.io/unreachable:NoExecute');
      setVal(s.refs.tolerChip, 'NoExecute · 300s');
      setVal(s.refs.evictChip, '300s · counting down');
      s.refs.taintChip.classList.add('highlight');
      s.refs.tolerChip.classList.add('highlight');
      s.refs.evictChip.classList.add('highlight');
      setChainActive(s.refs.timeline, 3);
      if (!ctx.reduced) ctx.register(pulse(s.refs.taintChip, { duration: 800, iterations: 2 }));
    },
  },
  {
    id: 'evict',
    duration: 1900,
    narration: 'Toleration expires. Taint manager evicts the pod via the Eviction API, which respects PodDisruptionBudgets. The pod is removed from etcd, while node-B still holds the orphaned container.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.evictChip, '0s · evicted');
      s.refs.evictChip.classList.add('highlight');
      setChainActive(s.refs.timeline, 4);
      if (!ctx.reduced) ctx.register(fadeOut(s.refs.podB, { duration: 700 }));
      else s.refs.podB.style.opacity = '0';
    },
  },
  {
    id: 'reschedule',
    duration: 1900,
    narration: 'A replacement pod is created (Deployment / ReplicaSet sees the missing replica). Scheduler picks node-A, and kubelet on node-A starts it. Default MTTR ≈ 40s + 300s.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.podB.style.opacity = '0';
      s.refs.podA.classList.add('highlight');
      s.refs.podA2.classList.add('highlight');
      setChainActive(s.refs.timeline, 5);
      if (!ctx.reduced) {
        ctx.register(fadeIn(s.refs.podA2, { duration: 700 }));
        ctx.register(pulse(s.refs.podA2, { duration: 800, iterations: 1 }));
      } else {
        s.refs.podA2.style.opacity = '1';
      }
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
