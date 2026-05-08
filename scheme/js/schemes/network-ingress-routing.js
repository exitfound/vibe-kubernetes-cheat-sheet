import { svg, g } from '../lib/svg.js';
import { arrowDefs, pod, box, chainList, arrow, pathArrow, packet, animateAlong, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1020 480',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Ingress controller routing',
    });
    root.appendChild(arrowDefs());

    const client = box({ x: 50, y: 180, w: 130, h: 80, label: 'External', sublabel: 'GET a.com/api', cat: 'network' });
    root.appendChild(client);

    const lb = box({ x: 230, y: 180, w: 140, h: 80, label: 'Cloud LB', sublabel: '1.2.3.4:443', cat: 'network' });
    root.appendChild(lb);

    const ctrl = pod({ x: 420, y: 180, w: 160, h: 80, label: 'Ingress', sublabel: 'nginx pod', cat: 'workloads' });
    root.appendChild(ctrl);

    const rules = chainList({
      x: 630,
      y: 60,
      w: 250,
      items: ['Host a.com  → svc-a', 'Host b.com  → svc-b', 'path /api   → svc-api'],
      cat: 'network',
    });
    root.appendChild(rules);

    const svcA = box({ x: 640, y: 250, w: 140, h: 50, label: 'svc-a', sublabel: 'ClusterIP', cat: 'network' });
    root.appendChild(svcA);

    const podA = pod({ x: 820, y: 235, w: 150, h: 80, label: 'App Pod', sublabel: 'backend', cat: 'workloads' });
    root.appendChild(podA);

    root.appendChild(arrow({ x1: 180, y1: 220, x2: 230, y2: 220, dim: true, color: 'network' }));
    root.appendChild(arrow({ x1: 370, y1: 220, x2: 420, y2: 220, dim: true, color: 'network' }));
    root.appendChild(pathArrow({ points: [[580, 220], [610, 220], [610, 275], [640, 275]], dim: true, dashed: true, color: 'network' }));
    root.appendChild(arrow({ x1: 780, y1: 275, x2: 820, y2: 275, dim: true, color: 'network' }));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = { svg: root, client, lb, ctrl, rules, svcA, podA, packetLayer };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['client', 'lb', 'ctrl', 'svcA', 'podA'].forEach(k => s.refs[k].classList.remove('highlight'));
  s.refs.rules.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1400,
    narration: 'An external client wants GET a.com/api. The cluster runs an Ingress controller (nginx) and exposes it via a cloud LoadBalancer Service.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.client.classList.add('highlight');
    },
  },
  {
    id: 'external',
    duration: 1700,
    narration: 'TLS request hits the cloud LB at 1.2.3.4. The LB front-ends the Ingress controller Service.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.client.classList.add('highlight');
      s.refs.lb.classList.add('highlight');
      const p = packet({ x: 180, y: 220, cat: 'network' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(230px, 220px)';
      } else {
        ctx.register(animateAlong(p, [[180, 220], [205, 220], [230, 220]], { duration: 1300 }));
      }
    },
  },
  {
    id: 'controller',
    duration: 1700,
    narration: 'LB forwards to the Ingress controller Pod (NodePort or a LoadBalancer Service backed by the nginx pod).',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.lb.classList.add('highlight');
      s.refs.ctrl.classList.add('highlight');
      const p = packet({ x: 370, y: 220, cat: 'network' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(420px, 220px)';
      } else {
        ctx.register(animateAlong(p, [[370, 220], [395, 220], [420, 220]], { duration: 1300 }));
      }
    },
  },
  {
    id: 'match',
    duration: 2000,
    narration: 'nginx reads the Host header (a.com) and path (/api). It walks the Ingress rules table and picks svc-a as the backend.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.ctrl.classList.add('highlight');
      const rows = s.refs.rules.querySelectorAll('.scheme-chip');
      if (rows[0]) rows[0].classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.ctrl, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'backend',
    duration: 1900,
    narration: 'Ingress controller proxies the request through svc-a to a backing App Pod. Response travels back the same path.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.ctrl.classList.add('highlight');
      s.refs.svcA.classList.add('highlight');
      s.refs.podA.classList.add('highlight');
      const rows = s.refs.rules.querySelectorAll('.scheme-chip');
      if (rows[0]) rows[0].classList.add('highlight');
      const p = packet({ x: 580, y: 220, cat: 'network' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(820px, 275px)';
      } else {
        ctx.register(animateAlong(p, [[580, 220], [610, 220], [610, 275], [820, 275]], { duration: 1900 }));
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
