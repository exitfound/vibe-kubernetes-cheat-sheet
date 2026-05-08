import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, box, arrow, pathArrow, fadeIn, fadeOut, pulse } from '../lib/primitives.js';
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
      'aria-label': 'VPA recommend vs auto',
    });
    root.appendChild(arrowDefs());

    const podBox = pod({ x: 60, y: 80, w: 320, h: 150, label: 'App Pod', sublabel: 'app container', cat: 'workloads' });
    root.appendChild(podBox);

    const reqChip = valChip({ x: 60, y: 250, w: 320, h: 32, name: 'requests.cpu', value: '200m' });
    const useChip = valChip({ x: 60, y: 290, w: 320, h: 32, name: 'usage',         value: '180m (~90%)' });
    root.appendChild(reqChip); root.appendChild(useChip);

    const vpa = box({ x: 460, y: 80, w: 580, h: 70, label: 'VPA app-vpa', sublabel: 'targetRef: Deployment app', cat: 'scaling' });
    root.appendChild(vpa);

    const modeChip = valChip({ x: 460, y: 160, w: 580, h: 32, name: 'updateMode', value: 'Initial' });
    root.appendChild(modeChip);

    const rec = pod({ x: 460, y: 210, w: 180, h: 90, label: 'recommender', sublabel: 'reads metrics', cat: 'scaling' });
    const upd = pod({ x: 650, y: 210, w: 180, h: 90, label: 'updater',     sublabel: 'evicts pods',  cat: 'scaling' });
    const adm = pod({ x: 840, y: 210, w: 200, h: 90, label: 'admission',   sublabel: 'mutating webhook', cat: 'scaling' });
    root.appendChild(rec); root.appendChild(upd); root.appendChild(adm);

    const recommendChip = valChip({ x: 460, y: 310, w: 580, h: 32, name: 'status.recommended', value: 'pending' });
    const eventChip     = valChip({ x: 460, y: 350, w: 580, h: 32, name: 'event',              value: 'idle' });
    root.appendChild(recommendChip); root.appendChild(eventChip);

    root.appendChild(pathArrow({ points: [[380, 306], [420, 306], [420, 255], [460, 255]], dim: true, dashed: true, color: 'scaling' }));
    root.appendChild(arrow({ x1: 740, y1: 192, x2: 740, y2: 210, dim: true, dashed: true, color: 'scaling' }));

    this.host.appendChild(root);
    this.refs = { svg: root, podBox, reqChip, useChip, vpa, modeChip, rec, upd, adm, recommendChip, eventChip };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['podBox','reqChip','useChip','vpa','modeChip','rec','upd','adm','recommendChip','eventChip'].forEach(k => s.refs[k].classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'App Pod is sized at 200m CPU but really wants ~360m. metrics-server collects per-container usage, and the VPA recommender feeds on it.',
    enter(s) {
      clearHL(s);
      setVal(s.refs.reqChip, '200m');
      setVal(s.refs.useChip, '180m (~90%)');
      setVal(s.refs.modeChip, 'Initial');
      setVal(s.refs.recommendChip, 'pending');
      setVal(s.refs.eventChip, 'idle');
      s.refs.podBox.classList.add('highlight');
    },
  },
  {
    id: 'recommend',
    duration: 1900,
    narration: 'Every minute the recommender writes status.recommendation. cpu=400m, memory=300Mi. The Pod is untouched: the recommendation is just a number on the VPA object.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.recommendChip, 'cpu=400m  memory=300Mi');
      s.refs.rec.classList.add('highlight');
      s.refs.recommendChip.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.recommendChip, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'recommend-only',
    duration: 1700,
    narration: 'updateMode=Initial means new Pods get the recommendation at admission, but live Pods are not disturbed. Operator can read status and decide what to do.',
    enter(s) {
      clearHL(s);
      setVal(s.refs.modeChip, 'Initial · live pods untouched');
      setVal(s.refs.recommendChip, 'cpu=400m  memory=300Mi');
      s.refs.modeChip.classList.add('highlight');
    },
  },
  {
    id: 'switch-auto',
    duration: 1700,
    narration: 'Operator flips updateMode to Auto. Now the updater is allowed to evict Pods whose actual requests differ enough from the recommendation.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.modeChip, 'Auto · updater armed');
      s.refs.modeChip.classList.add('highlight');
      s.refs.upd.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.upd, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'evict-restart',
    duration: 2100,
    narration: 'updater evicts the Pod (respects PDB). admission webhook intercepts the new Pod creation and patches requests to cpu=400m. Pod restarts with the right size.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.eventChip, 'evicted → admission rewrote requests');
      setVal(s.refs.reqChip, '400m  (rewritten by webhook)');
      setVal(s.refs.useChip, '180m (~45%)');
      s.refs.adm.classList.add('highlight');
      s.refs.podBox.classList.add('highlight');
      s.refs.reqChip.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(fadeOut(s.refs.podBox, { duration: 600 }));
        ctx.register(fadeIn(s.refs.podBox, { duration: 600 }));
        ctx.register(pulse(s.refs.reqChip, { duration: 800, iterations: 1 }));
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
