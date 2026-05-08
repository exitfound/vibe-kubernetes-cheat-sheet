import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, box, cylinder, arrow, pathArrow, packet, animateAlong, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

function valChip({ x, y, w, h = 32, name, value, cat = 'workloads' }) {
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
      'aria-label': 'ConfigMap and Secret injection paths',
    });
    root.appendChild(arrowDefs());

    const cm = cylinder({ x: 470, y: 20, w: 200, h: 80, label: 'ConfigMap app', cat: 'storage' });
    root.appendChild(cm);

    const cmValue = valChip({ x: 360, y: 110, w: 420, h: 32, name: 'data.api-url', value: 'https://old' });
    root.appendChild(cmValue);

    const containerA = box({ x: 80,  y: 200, w: 440, h: 280, label: 'container-a', sublabel: 'envFrom: configMapRef', cat: 'workloads' });
    const containerB = box({ x: 580, y: 200, w: 440, h: 280, label: 'container-b', sublabel: 'volumeMount: /etc/config', cat: 'workloads' });
    root.appendChild(containerA);
    root.appendChild(containerB);

    const envChip   = valChip({ x: 110, y: 290, w: 380, h: 32, name: 'env API_URL', value: '—' });
    const envFreshChip = valChip({ x: 110, y: 332, w: 380, h: 32, name: 'set when',   value: 'process start (PID 1)' });
    const envHotChip   = valChip({ x: 110, y: 374, w: 380, h: 32, name: 'on update',   value: 'requires Pod restart' });
    root.appendChild(envChip); root.appendChild(envFreshChip); root.appendChild(envHotChip);

    const fileChip   = valChip({ x: 610, y: 290, w: 380, h: 32, name: '/etc/config/api-url', value: '—' });
    const fileFreshChip = valChip({ x: 610, y: 332, w: 380, h: 32, name: 'projected by', value: 'kubelet (atomic symlink swap)' });
    const fileHotChip   = valChip({ x: 610, y: 374, w: 380, h: 32, name: 'on update',   value: 'live (~ minutes)' });
    root.appendChild(fileChip); root.appendChild(fileFreshChip); root.appendChild(fileHotChip);

    root.appendChild(pathArrow({ points: [[570, 100], [570, 170], [300, 170], [300, 200]], dim: true, dashed: true, color: 'storage' }));
    root.appendChild(pathArrow({ points: [[570, 100], [570, 170], [800, 170], [800, 200]], dim: true, dashed: true, color: 'storage' }));

    this.host.appendChild(root);
    this.refs = { svg: root, cm, cmValue, containerA, containerB, envChip, envFreshChip, envHotChip, fileChip, fileFreshChip, fileHotChip };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['cm','cmValue','containerA','containerB','envChip','fileChip'].forEach(k => s.refs[k].classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'ConfigMap app holds api-url=https://old. Pod has two containers consuming it via different mechanisms.',
    enter(s) {
      clearHL(s);
      setVal(s.refs.cmValue, 'https://old');
      setVal(s.refs.envChip, '—');
      setVal(s.refs.fileChip, '—');
      s.refs.cm.classList.add('highlight');
    },
  },
  {
    id: 'inject',
    duration: 1900,
    narration: 'Pod starts. kubelet reads ConfigMap from apiserver and projects it two ways: container-a gets env vars at process start, while container-b gets files in a tmpfs volume.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.cmValue, 'https://old');
      setVal(s.refs.envChip, 'https://old');
      setVal(s.refs.fileChip, 'https://old');
      s.refs.cm.classList.add('highlight');
      s.refs.containerA.classList.add('highlight');
      s.refs.containerB.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(pulse(s.refs.envChip, { duration: 800, iterations: 1 }));
        ctx.register(pulse(s.refs.fileChip, { duration: 800, iterations: 1 }));
      }
    },
  },
  {
    id: 'running',
    duration: 1500,
    narration: 'Both containers are Running. Their values match the ConfigMap source.',
    enter(s) {
      clearHL(s);
      setVal(s.refs.cmValue, 'https://old');
      setVal(s.refs.envChip, 'https://old');
      setVal(s.refs.fileChip, 'https://old');
    },
  },
  {
    id: 'update',
    duration: 1700,
    narration: 'Operator PATCHes the ConfigMap: api-url=https://new. apiserver writes the new version to etcd.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.cmValue, 'https://new');
      setVal(s.refs.envChip, 'https://old');
      setVal(s.refs.fileChip, 'https://old');
      s.refs.cm.classList.add('highlight');
      s.refs.cmValue.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.cmValue, { duration: 800, iterations: 2 }));
    },
  },
  {
    id: 'propagation',
    duration: 2100,
    narration: 'kubelet syncs the projected volume: container-b sees /etc/config/api-url update on its next read. container-a env stays as it was, and it needs a restart to pick up the new value.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.cmValue, 'https://new');
      setVal(s.refs.envChip, 'https://old');
      setVal(s.refs.fileChip, 'https://new');
      s.refs.fileChip.classList.add('highlight');
      s.refs.envChip.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(pulse(s.refs.fileChip, { duration: 800, iterations: 2 }));
        ctx.register(pulse(s.refs.envChip, { duration: 600, iterations: 1 }));
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
