import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, box, cylinder, arrow, fadeIn, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

function statusChip({ x, y, w, h = 30, name, value, cat = 'workloads' }) {
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
      viewBox: '0 0 1100 540',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'StatefulSet ordered rollout',
    });
    root.appendChild(arrowDefs());

    const sset = box({ x: 280, y: 20, w: 320, h: 60, label: 'StatefulSet web', sublabel: 'replicas=3, volumeClaimTemplate', cat: 'workloads' });
    root.appendChild(sset);

    const svc = box({ x: 660, y: 20, w: 280, h: 60, label: 'Service web', sublabel: 'clusterIP=None (headless)', cat: 'network' });
    root.appendChild(svc);

    const p0 = pod({ x: 80,  y: 180, w: 200, h: 90, label: 'web-0', sublabel: 'web-0.web', cat: 'workloads' });
    const p1 = pod({ x: 380, y: 180, w: 200, h: 90, label: 'web-1', sublabel: 'web-1.web', cat: 'workloads' });
    const p2 = pod({ x: 680, y: 180, w: 200, h: 90, label: 'web-2', sublabel: 'web-2.web', cat: 'workloads' });
    p0.style.opacity = '0';
    p1.style.opacity = '0';
    p2.style.opacity = '0';
    root.appendChild(p0); root.appendChild(p1); root.appendChild(p2);

    const v0 = cylinder({ x: 120, y: 310, w: 120, h: 70, label: 'data-web-0', cat: 'storage' });
    const v1 = cylinder({ x: 420, y: 310, w: 120, h: 70, label: 'data-web-1', cat: 'storage' });
    const v2 = cylinder({ x: 720, y: 310, w: 120, h: 70, label: 'data-web-2', cat: 'storage' });
    v0.style.opacity = '0';
    v1.style.opacity = '0';
    v2.style.opacity = '0';
    root.appendChild(v0); root.appendChild(v1); root.appendChild(v2);

    const s0 = statusChip({ x: 80,  y: 410, w: 200, name: 'web-0', value: 'pending' });
    const s1 = statusChip({ x: 380, y: 410, w: 200, name: 'web-1', value: 'gated' });
    const s2 = statusChip({ x: 680, y: 410, w: 200, name: 'web-2', value: 'gated' });
    root.appendChild(s0); root.appendChild(s1); root.appendChild(s2);

    root.appendChild(arrow({ x1: 180, y1: 270, x2: 180, y2: 310, dim: true, color: 'storage' }));
    root.appendChild(arrow({ x1: 480, y1: 270, x2: 480, y2: 310, dim: true, color: 'storage' }));
    root.appendChild(arrow({ x1: 780, y1: 270, x2: 780, y2: 310, dim: true, color: 'storage' }));

    this.host.appendChild(root);
    this.refs = { svg: root, sset, svc, p0, p1, p2, v0, v1, v2, s0, s1, s2 };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['sset','svc','p0','p1','p2','v0','v1','v2','s0','s1','s2'].forEach(k => s.refs[k].classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'StatefulSet declares replicas=3 with a volumeClaimTemplate. The headless Service web gives each Pod a stable DNS name web-N.web.',
    enter(s) {
      clearHL(s);
      s.refs.p0.style.opacity = '0';
      s.refs.p1.style.opacity = '0';
      s.refs.p2.style.opacity = '0';
      s.refs.v0.style.opacity = '0';
      s.refs.v1.style.opacity = '0';
      s.refs.v2.style.opacity = '0';
      setVal(s.refs.s0, 'pending');
      setVal(s.refs.s1, 'gated');
      setVal(s.refs.s2, 'gated');
      s.refs.sset.classList.add('highlight');
    },
  },
  {
    id: 'pod-0',
    duration: 1900,
    narration: 'Index 0 starts first. PVC data-web-0 is provisioned (sticky to ordinal 0). web-0 binds it, gets stable hostname web-0.web, becomes Ready.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.sset.classList.add('highlight');
      s.refs.p0.style.opacity = '1';
      s.refs.v0.style.opacity = '1';
      s.refs.p0.classList.add('highlight');
      s.refs.v0.classList.add('highlight');
      setVal(s.refs.s0, 'Running');
      setVal(s.refs.s1, 'gated');
      setVal(s.refs.s2, 'gated');
      if (!ctx.reduced) {
        ctx.register(fadeIn(s.refs.p0, { duration: 700 }));
        ctx.register(fadeIn(s.refs.v0, { duration: 700 }));
        ctx.register(pulse(s.refs.p0, { duration: 700, iterations: 1 }));
      }
    },
  },
  {
    id: 'pod-1',
    duration: 1800,
    narration: 'Controller waits for web-0 Ready. Only then does it provision data-web-1 and start web-1. Hostnames and PVCs stay paired with the ordinal.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.sset.classList.add('highlight');
      s.refs.p0.style.opacity = '1';
      s.refs.p1.style.opacity = '1';
      s.refs.v0.style.opacity = '1';
      s.refs.v1.style.opacity = '1';
      s.refs.p1.classList.add('highlight');
      s.refs.v1.classList.add('highlight');
      setVal(s.refs.s0, 'Running');
      setVal(s.refs.s1, 'Running');
      setVal(s.refs.s2, 'gated');
      if (!ctx.reduced) {
        ctx.register(fadeIn(s.refs.p1, { duration: 700 }));
        ctx.register(fadeIn(s.refs.v1, { duration: 700 }));
        ctx.register(pulse(s.refs.p1, { duration: 700, iterations: 1 }));
      }
    },
  },
  {
    id: 'pod-2',
    duration: 1800,
    narration: 'After web-1 Ready, web-2 follows. PVC data-web-2 binds. The controller never starts ordinal N+1 before N is Ready.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.sset.classList.add('highlight');
      s.refs.p0.style.opacity = '1';
      s.refs.p1.style.opacity = '1';
      s.refs.p2.style.opacity = '1';
      s.refs.v0.style.opacity = '1';
      s.refs.v1.style.opacity = '1';
      s.refs.v2.style.opacity = '1';
      s.refs.p2.classList.add('highlight');
      s.refs.v2.classList.add('highlight');
      setVal(s.refs.s0, 'Running');
      setVal(s.refs.s1, 'Running');
      setVal(s.refs.s2, 'Running');
      if (!ctx.reduced) {
        ctx.register(fadeIn(s.refs.p2, { duration: 700 }));
        ctx.register(fadeIn(s.refs.v2, { duration: 700 }));
        ctx.register(pulse(s.refs.p2, { duration: 700, iterations: 1 }));
      }
    },
  },
  {
    id: 'settled',
    duration: 1900,
    narration: 'All three Pods are Running with stable identities. If web-0 dies and reschedules, the new Pod still gets the same hostname and reattaches data-web-0.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.p0.style.opacity = '1';
      s.refs.p1.style.opacity = '1';
      s.refs.p2.style.opacity = '1';
      s.refs.v0.style.opacity = '1';
      s.refs.v1.style.opacity = '1';
      s.refs.v2.style.opacity = '1';
      s.refs.svc.classList.add('highlight');
      s.refs.p0.classList.add('highlight');
      s.refs.p1.classList.add('highlight');
      s.refs.p2.classList.add('highlight');
      setVal(s.refs.s0, 'Running');
      setVal(s.refs.s1, 'Running');
      setVal(s.refs.s2, 'Running');
      if (!ctx.reduced) ctx.register(pulse(s.refs.svc, { duration: 800, iterations: 1 }));
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
