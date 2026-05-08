import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, box, chip, chainList, arrow, pathArrow, packet, animateAlong, fadeIn, fadeOut, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1100 520',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'NetworkPolicy enforcement',
    });
    root.appendChild(arrowDefs());

    const policy1 = box({ x: 320, y: 20, w: 460, h: 50, label: 'NP allow-from-front', sublabel: 'ingress from podSelector app=front', cat: 'security' });
    const policy2 = box({ x: 320, y: 80, w: 460, h: 50, label: 'NP default-deny',     sublabel: 'ingress: []  (deny all)',           cat: 'security' });
    root.appendChild(policy1);
    root.appendChild(policy2);

    const cni = box({ x: 820, y: 20, w: 240, h: 50, label: 'CNI agent', sublabel: 'compile to iptables/eBPF', cat: 'control' });
    root.appendChild(cni);

    const rules = chainList({
      x: 820, y: 80, w: 240,
      items: ['allow  front → backend', 'drop   *      → backend'],
      cat: 'security',
    });
    root.appendChild(rules);

    const front   = pod({ x: 60,  y: 200, w: 200, h: 80, label: 'front pod',   sublabel: 'app=front',   cat: 'workloads' });
    const backend = pod({ x: 460, y: 200, w: 200, h: 80, label: 'backend pod', sublabel: 'app=backend', cat: 'workloads' });
    const other   = pod({ x: 60,  y: 360, w: 200, h: 80, label: 'other pod',   sublabel: 'app=other',   cat: 'workloads' });
    root.appendChild(front);
    root.appendChild(backend);
    root.appendChild(other);

    root.appendChild(arrow({ x1: 260, y1: 240, x2: 460, y2: 240, dim: true, color: 'network' }));
    root.appendChild(pathArrow({ points: [[260, 400], [360, 400], [360, 280], [460, 280]], dim: true, dashed: true, color: 'network' }));

    const dropBadge = chip({ x: 295, y: 320, w: 130, h: 32, label: 'DROP', cat: 'security' });
    dropBadge.style.opacity = '0';
    root.appendChild(dropBadge);

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = { svg: root, policy1, policy2, cni, rules, front, backend, other, dropBadge, packetLayer };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['policy1','policy2','cni','front','backend','other'].forEach(k => s.refs[k].classList.remove('highlight'));
  s.refs.rules.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Three Pods share a node. Two NetworkPolicies target backend Pods: one allows ingress only from app=front, the other denies everything else.',
    enter(s) {
      clearHL(s);
      s.refs.dropBadge.style.opacity = '0';
      s.refs.packetLayer.replaceChildren();
      s.refs.policy1.classList.add('highlight');
      s.refs.policy2.classList.add('highlight');
    },
  },
  {
    id: 'policies',
    duration: 1700,
    narration: 'NetworkPolicies are declarative. They name pods via labels (podSelector) and describe allowed ingress / egress. They do nothing until the CNI plugin enforces them.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.policy1.classList.add('highlight');
      s.refs.policy2.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(pulse(s.refs.policy1, { duration: 800, iterations: 1 }));
        ctx.register(pulse(s.refs.policy2, { duration: 800, iterations: 1 }));
      }
    },
  },
  {
    id: 'compile',
    duration: 1900,
    narration: 'CNI plugin (Calico, Cilium) watches policy objects and compiles them into per-Pod iptables or eBPF rules that run before the Pod sees the packet.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.cni.classList.add('highlight');
      s.refs.rules.querySelectorAll('.scheme-chip').forEach(r => r.classList.add('highlight'));
      if (!ctx.reduced) ctx.register(pulse(s.refs.rules, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'allowed',
    duration: 2000,
    narration: 'front Pod → backend Pod: source label matches first rule (app=front allowed). Packet sails through to backend.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      s.refs.front.classList.add('highlight');
      s.refs.backend.classList.add('highlight');
      const rows = s.refs.rules.querySelectorAll('.scheme-chip');
      if (rows[0]) rows[0].classList.add('highlight');
      const p = packet({ x: 260, y: 240, cat: 'network' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(460px, 240px)';
      } else {
        ctx.register(animateAlong(p, [[260, 240], [360, 240], [460, 240]], { duration: 1700 }));
        ctx.register(pulse(s.refs.backend, { duration: 700, iterations: 1 }));
      }
    },
  },
  {
    id: 'denied',
    duration: 2200,
    narration: 'other Pod → backend Pod: source label app=other matches no allow rule, falls through to default-deny. Packet is dropped before it reaches backend.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      s.refs.other.classList.add('highlight');
      const rows = s.refs.rules.querySelectorAll('.scheme-chip');
      if (rows[1]) rows[1].classList.add('highlight');
      const p = packet({ x: 260, y: 400, cat: 'network' });
      s.refs.packetLayer.appendChild(p);
      s.refs.dropBadge.style.opacity = '1';
      if (ctx.reduced) {
        p.style.transform = 'translate(360px, 336px)';
      } else {
        ctx.register(animateAlong(p, [[260, 400], [360, 400], [360, 336]], { duration: 1300 }));
        ctx.register(fadeOut(p, { duration: 400 }));
        ctx.register(fadeIn(s.refs.dropBadge, { duration: 500 }));
        ctx.register(pulse(s.refs.dropBadge, { duration: 800, iterations: 2 }));
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
