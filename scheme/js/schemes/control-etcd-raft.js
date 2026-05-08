import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, box, cylinder, arrow, pathArrow, packet, animateAlong, pulse } from '../lib/primitives.js';
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
      viewBox: '0 0 1200 460',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'ETCD Raft Consensus: replicate, ack, commit',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const e1 = cylinder({ x: 420, y: 40, w: 160, h: 160, label: 'ETCD-1', cat: 'control' });
    const e2 = cylinder({ x: 600, y: 40, w: 160, h: 160, label: 'ETCD-2', cat: 'control' });
    const e3 = cylinder({ x: 780, y: 40, w: 160, h: 160, label: 'ETCD-3', cat: 'control' });
    root.appendChild(e1); root.appendChild(e2); root.appendChild(e3);

    const termChip   = valChip({ x: 960, y: 40,  w: 220, h: 40, name: 'term',             value: '4' });
    const acksChip   = valChip({ x: 960, y: 90,  w: 220, h: 40, name: 'acks (entry 9)', value: 'idle' });
    const quorumChip = valChip({ x: 960, y: 140, w: 220, h: 40, name: 'quorum',           value: '2 of 3' });
    root.appendChild(termChip); root.appendChild(acksChip); root.appendChild(quorumChip);

    const r1 = valChip({ x: 420, y: 220, w: 160, name: 'role', value: 'Leader' });
    const r2 = valChip({ x: 600, y: 220, w: 160, name: 'role', value: 'Follower' });
    const r3 = valChip({ x: 780, y: 220, w: 160, name: 'role', value: 'Follower' });
    root.appendChild(r1); root.appendChild(r2); root.appendChild(r3);

    const l1 = valChip({ x: 420, y: 260, w: 160, name: 'log/commit', value: '8 / 8' });
    const l2 = valChip({ x: 600, y: 260, w: 160, name: 'log/commit', value: '8 / 8' });
    const l3 = valChip({ x: 780, y: 260, w: 160, name: 'log/commit', value: '8 / 8' });
    root.appendChild(l1); root.appendChild(l2); root.appendChild(l3);

    const api = box({ x: 40, y: 320, w: 180, h: 120, label: 'ApiServer', cat: 'control' });
    root.appendChild(api);

    root.appendChild(pathArrow({ points: [[220, 380], [300, 380], [300, 120], [420, 120]], dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 580, y1: 120, x2: 600, y2: 120, dim: true, dashed: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[500, 40], [500, 8], [860, 8], [860, 40]], dim: true, dashed: true, color: 'control' }));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = { svg: root, api, e1, e2, e3, r1, r2, r3, l1, l2, l3, termChip, acksChip, quorumChip, packetLayer };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['api','e1','e2','e3','r1','r2','r3','l1','l2','l3','termChip','acksChip','quorumChip']
    .forEach(k => s.refs[k].classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Three ETCD replicas form the cluster: one Leader, two Followers, all on term 4. All logs hold the same 8 entries. Quorum is 2 of 3.',
    enter(s) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      setVal(s.refs.r1, 'Leader');
      setVal(s.refs.r2, 'Follower');
      setVal(s.refs.r3, 'Follower');
      setVal(s.refs.l1, '8 / 8');
      setVal(s.refs.l2, '8 / 8');
      setVal(s.refs.l3, '8 / 8');
      setVal(s.refs.termChip, '4');
      setVal(s.refs.acksChip, 'idle');
      setVal(s.refs.quorumChip, '2 of 3');
      s.refs.e1.classList.add('highlight');
    },
  },
  {
    id: 'proposal',
    duration: 1900,
    narration: 'The ApiServer issues a write for a new Pod to ETCD. All writes go through the Leader. A request that lands on a Follower is forwarded to the Leader internally.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      s.refs.api.classList.add('highlight');
      s.refs.e1.classList.add('highlight');
      const p = packet({ x: 220, y: 380, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(420px, 120px)';
      } else {
        ctx.register(animateAlong(p, [[220, 380], [300, 380], [300, 120], [420, 120]], { duration: 1700 }));
      }
    },
  },
  {
    id: 'append-log',
    duration: 1700,
    narration: 'The Leader appends entry 9 to its local log. The entry is not committed yet, so the new key is still invisible to clients.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      setVal(s.refs.l1, '9 / 8');
      setVal(s.refs.acksChip, '0');
      s.refs.e1.classList.add('highlight');
      s.refs.l1.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.l1, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'replicate',
    duration: 2100,
    narration: 'The Leader sends an AppendEntries RPC to both Followers in parallel. Each Follower checks term and log consistency, appends entry 9 to its own log, and acks back.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      setVal(s.refs.l2, '9 / 8');
      setVal(s.refs.l3, '9 / 8');
      setVal(s.refs.acksChip, '1 (then 2)');
      s.refs.e1.classList.add('highlight');
      s.refs.e2.classList.add('highlight');
      s.refs.e3.classList.add('highlight');
      s.refs.l2.classList.add('highlight');
      s.refs.l3.classList.add('highlight');
      const p1 = packet({ x: 580, y: 120, cat: 'control' });
      const p2 = packet({ x: 500, y: 40, cat: 'control' });
      s.refs.packetLayer.appendChild(p1);
      s.refs.packetLayer.appendChild(p2);
      if (ctx.reduced) {
        p1.style.transform = 'translate(600px, 120px)';
        p2.style.transform = 'translate(860px, 40px)';
      } else {
        ctx.register(animateAlong(p1, [[580, 120], [600, 120]], { duration: 1500 }));
        ctx.register(animateAlong(p2, [[500, 40], [500, 8], [860, 8], [860, 40]], { duration: 1900 }));
      }
    },
  },
  {
    id: 'quorum',
    duration: 1900,
    narration: 'The Leader counts replicas that hold entry 9: itself plus at least one Follower equals 2 of 3, the quorum. Entry 9 is now committed, and the Leader advances commitIndex to 9.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      setVal(s.refs.l1, '9 / 9');
      setVal(s.refs.acksChip, '2 / 3 ✓');
      s.refs.e1.classList.add('highlight');
      s.refs.l1.classList.add('highlight');
      s.refs.acksChip.classList.add('highlight');
      s.refs.quorumChip.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(pulse(s.refs.l1, { duration: 800, iterations: 1 }));
        ctx.register(pulse(s.refs.acksChip, { duration: 800, iterations: 2 }));
      }
    },
  },
  {
    id: 'apply',
    duration: 1900,
    narration: 'On the next heartbeat, the Leader broadcasts the new commitIndex. Each Follower applies entry 9 to its state machine. All three replicas now hold the Pod at index 9, and subsequent reads return it.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      setVal(s.refs.l2, '9 / 9');
      setVal(s.refs.l3, '9 / 9');
      s.refs.e1.classList.add('highlight');
      s.refs.e2.classList.add('highlight');
      s.refs.e3.classList.add('highlight');
      s.refs.l1.classList.add('highlight');
      s.refs.l2.classList.add('highlight');
      s.refs.l3.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(pulse(s.refs.l2, { duration: 800, iterations: 1 }));
        ctx.register(pulse(s.refs.l3, { duration: 800, iterations: 1 }));
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
