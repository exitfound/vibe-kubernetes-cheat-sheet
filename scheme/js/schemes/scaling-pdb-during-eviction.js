import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, box, chip, fadeIn, fadeOut, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

function valChip({ x, y, w, h = 32, name, value, cat = 'scaling' }) {
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
      'aria-label': 'PodDisruptionBudget gates eviction',
    });
    root.appendChild(arrowDefs());

    const pdb = box({ x: 60, y: 20, w: 480, h: 56, label: 'PodDisruptionBudget app-pdb', sublabel: 'minAvailable: 4', cat: 'scaling' });
    root.appendChild(pdb);

    const readyChip = valChip({ x: 580, y: 28, w: 460, h: 44, name: 'ready replicas', value: '5 / 5' });
    root.appendChild(readyChip);

    const pods = [];
    for (let i = 0; i < 5; i++) {
      const p = pod({ x: 60 + i * 200, y: 200, w: 180, h: 90, label: `pod-${i + 1}`, sublabel: 'app=front', cat: 'workloads' });
      pods.push(p);
      root.appendChild(p);
    }

    const evictChip = valChip({ x: 60, y: 340, w: 980, h: 36, name: 'eviction API', value: 'idle' });
    root.appendChild(evictChip);

    const responseChip = valChip({ x: 60, y: 390, w: 980, h: 36, name: 'response',     value: '—' });
    root.appendChild(responseChip);

    const noteChip = valChip({ x: 60, y: 440, w: 980, h: 36, name: 'note',             value: 'minAvailable enforces a floor; eviction returns 429 if it would breach it' });
    root.appendChild(noteChip);

    this.host.appendChild(root);
    this.refs = { svg: root, pdb, readyChip, pods, evictChip, responseChip, noteChip };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['pdb','readyChip','evictChip','responseChip','noteChip'].forEach(k => s.refs[k].classList.remove('highlight'));
  s.refs.pods.forEach(p => p.classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: '5 replicas of app=front are all Ready. PodDisruptionBudget app-pdb requires at least 4 to remain Ready at any time.',
    enter(s) {
      clearHL(s);
      setVal(s.refs.readyChip, '5 / 5');
      setVal(s.refs.evictChip, 'idle');
      setVal(s.refs.responseChip, '—');
      s.refs.pods.forEach(p => { p.style.opacity = '1'; });
      s.refs.pdb.classList.add('highlight');
    },
  },
  {
    id: 'evict-1',
    duration: 1900,
    narration: 'Operator calls Eviction API on pod-1. PDB allows 1 disruption (5 → 4 ≥ 4). Returns 200 OK, and pod-1 is terminated.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.readyChip, '4 / 5');
      setVal(s.refs.evictChip, 'POST .../pods/pod-1/eviction');
      setVal(s.refs.responseChip, '200 OK · evicted');
      s.refs.pods[0].style.opacity = '0';
      s.refs.pods[0].classList.add('highlight');
      s.refs.responseChip.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(fadeOut(s.refs.pods[0], { duration: 700 }));
        ctx.register(pulse(s.refs.responseChip, { duration: 800, iterations: 1 }));
      }
    },
  },
  {
    id: 'evict-2-blocked',
    duration: 2100,
    narration: 'Right after, drain tries to evict pod-2. ready=4, and granting would drop to 3 (< minAvailable). API returns 429 Too Many Requests, eviction is rejected.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.readyChip, '4 / 5');
      setVal(s.refs.evictChip, 'POST .../pods/pod-2/eviction');
      setVal(s.refs.responseChip, '429 · would breach minAvailable');
      s.refs.pods[1].classList.add('highlight');
      s.refs.responseChip.classList.add('highlight');
      s.refs.pdb.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(pulse(s.refs.responseChip, { duration: 800, iterations: 2 }));
        ctx.register(pulse(s.refs.pdb, { duration: 800, iterations: 1 }));
      }
    },
  },
  {
    id: 'retry',
    duration: 2000,
    narration: 'ReplicaSet has spawned a replacement for pod-1 and it became Ready. ready=5 again. Drain retries pod-2, and this time PDB lets it through.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.readyChip, '5 / 5 → 4 / 5');
      setVal(s.refs.evictChip, 'POST .../pods/pod-2/eviction (retry)');
      setVal(s.refs.responseChip, '200 OK · evicted');
      s.refs.pods[0].style.opacity = '1';
      s.refs.pods[1].style.opacity = '0';
      s.refs.responseChip.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(fadeIn(s.refs.pods[0], { duration: 700 }));
        ctx.register(fadeOut(s.refs.pods[1], { duration: 700 }));
        ctx.register(pulse(s.refs.responseChip, { duration: 800, iterations: 1 }));
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
