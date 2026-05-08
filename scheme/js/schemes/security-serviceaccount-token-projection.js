import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, box, arrow, packet, animateAlong, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

function valChip({ x, y, w, h = 32, name, value, cat = 'security' }) {
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
      'aria-label': 'ServiceAccount token projection',
    });
    root.appendChild(arrowDefs());

    const podBox = pod({ x: 60, y: 60, w: 480, h: 420, label: 'App Pod', sublabel: 'serviceAccountName: app-sa', cat: 'workloads' });
    root.appendChild(podBox);

    const container = box({ x: 100, y: 130, w: 400, h: 110, label: 'app container', sublabel: 'reads /var/run/secrets/...', cat: 'workloads' });
    root.appendChild(container);

    const tokenPath = valChip({ x: 100, y: 260, w: 400, h: 32, name: 'token mount', value: '—' });
    const tokenJwt  = valChip({ x: 100, y: 300, w: 400, h: 32, name: 'JWT exp',     value: '—' });
    const tokenAud  = valChip({ x: 100, y: 340, w: 400, h: 32, name: 'aud',          value: '—' });
    const tokenAge  = valChip({ x: 100, y: 380, w: 400, h: 32, name: 'rotation',     value: 'awaiting first token' });
    root.appendChild(tokenPath); root.appendChild(tokenJwt); root.appendChild(tokenAud); root.appendChild(tokenAge);

    const tr = box({ x: 600, y: 80, w: 200, h: 80, label: 'TokenRequest API', sublabel: 'kubelet client', cat: 'control' });
    const api = box({ x: 840, y: 80, w: 200, h: 80, label: 'kube-apiserver', sublabel: 'mints + signs JWT', cat: 'control' });
    root.appendChild(tr); root.appendChild(api);

    const sa = box({ x: 600, y: 200, w: 440, h: 70, label: 'ServiceAccount app-sa', sublabel: 'in namespace default', cat: 'security' });
    root.appendChild(sa);

    const validation = valChip({ x: 600, y: 300, w: 440, h: 32, name: 'apiserver validation', value: 'idle' });
    root.appendChild(validation);

    const eventChip  = valChip({ x: 600, y: 340, w: 440, h: 32, name: 'event',                value: 'idle' });
    root.appendChild(eventChip);

    root.appendChild(arrow({ x1: 540, y1: 120, x2: 600, y2: 120, dim: true, color: 'control' }));
    root.appendChild(arrow({ x1: 800, y1: 120, x2: 840, y2: 120, dim: true, color: 'control' }));
    root.appendChild(arrow({ x1: 700, y1: 200, x2: 700, y2: 160, dim: true, dashed: true, color: 'security' }));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = { svg: root, podBox, container, tokenPath, tokenJwt, tokenAud, tokenAge, tr, api, sa, validation, eventChip, packetLayer };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['podBox','container','tokenPath','tokenJwt','tokenAud','tokenAge','tr','api','sa','validation','eventChip']
    .forEach(k => s.refs[k].classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Pod is scheduled, container has not yet started. The Pod spec asks for a projected ServiceAccount token volume.',
    enter(s) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      setVal(s.refs.tokenPath, '—');
      setVal(s.refs.tokenJwt, '—');
      setVal(s.refs.tokenAud, '—');
      setVal(s.refs.tokenAge, 'awaiting first token');
      setVal(s.refs.validation, 'idle');
      setVal(s.refs.eventChip, 'idle');
      s.refs.podBox.classList.add('highlight');
    },
  },
  {
    id: 'token-request',
    duration: 1900,
    narration: 'kubelet calls TokenRequest API for serviceAccount=app-sa with audience=api, expirationSeconds=3600, bound to this Pod\'s UID.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      setVal(s.refs.tokenAge, 'requesting JWT');
      setVal(s.refs.eventChip, 'POST /api/.../token');
      s.refs.tr.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      const p = packet({ x: 540, y: 120, cat: 'security' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(840px, 120px)';
      } else {
        ctx.register(animateAlong(p, [[540, 120], [700, 120], [840, 120]], { duration: 1500 }));
      }
    },
  },
  {
    id: 'mount',
    duration: 1700,
    narration: 'apiserver returns a signed, audience-bound JWT. kubelet writes it as /var/run/secrets/kubernetes.io/serviceaccount/token via an atomic symlink swap on tmpfs.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      setVal(s.refs.tokenPath, '/var/run/secrets/.../token');
      setVal(s.refs.tokenJwt, 'exp=2026-05-07T22:14');
      setVal(s.refs.tokenAud, 'api');
      setVal(s.refs.tokenAge, 'fresh · age 0s');
      setVal(s.refs.eventChip, 'projected volume populated');
      s.refs.tokenPath.classList.add('highlight');
      s.refs.tokenJwt.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.tokenPath, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'workload-call',
    duration: 1900,
    narration: 'App container reads the token and calls the apiserver with Authorization: Bearer <jwt>. apiserver validates: signature, expiry, and audience all match.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      setVal(s.refs.validation, 'sig OK · aud=api · exp future');
      setVal(s.refs.eventChip, 'authenticated as ServiceAccount');
      s.refs.container.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      s.refs.validation.classList.add('highlight');
      const p = packet({ x: 500, y: 185, cat: 'security' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(940px, 120px)';
      } else {
        ctx.register(animateAlong(p, [[500, 185], [600, 185], [600, 120], [940, 120]], { duration: 1700 }));
        ctx.register(pulse(s.refs.validation, { duration: 800, iterations: 1 }));
      }
    },
  },
  {
    id: 'rotation',
    duration: 2000,
    narration: 'Around 80% of expirationSeconds, kubelet re-runs TokenRequest and atomically swaps the token file. The app sees the new JWT next read, and the old one stops working at exp.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      setVal(s.refs.tokenJwt, 'exp=2026-05-07T23:14 (rotated)');
      setVal(s.refs.tokenAge, 'rotated · age 0s');
      setVal(s.refs.eventChip, 'kubelet rotated token');
      s.refs.tokenJwt.classList.add('highlight');
      s.refs.tokenAge.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(pulse(s.refs.tokenJwt, { duration: 800, iterations: 1 }));
        ctx.register(pulse(s.refs.tokenAge, { duration: 800, iterations: 1 }));
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
