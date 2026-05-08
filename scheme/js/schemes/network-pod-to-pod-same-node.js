import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, pod, node, chip, packet, animateAlong, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1000 460',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Pod to pod networking on the same node',
    });
    root.appendChild(arrowDefs());

    const n = node({ x: 40, y: 60, w: 920, h: 360, label: 'node-1 · cluster' });
    root.appendChild(n);

    const podA = pod({ x: 120, y: 180, label: 'Pod A', sublabel: '10.244.1.2', containers: 1, cat: 'workloads' });
    podA.id = 'podA';
    root.appendChild(podA);

    const podB = pod({ x: 760, y: 180, label: 'Pod B', sublabel: '10.244.1.5', containers: 1, cat: 'workloads' });
    podB.id = 'podB';
    root.appendChild(podB);

    const bridge = chip({ x: 440, y: 215, w: 120, h: 38, label: 'cni0 bridge', cat: 'network' });
    bridge.id = 'bridge';
    root.appendChild(bridge);

    // veth labels + lines
    root.appendChild(line({ class: 'scheme-arrow scheme-arrow-dim', x1: 240, y1: 234, x2: 440, y2: 234 }));
    root.appendChild(line({ class: 'scheme-arrow scheme-arrow-dim', x1: 560, y1: 234, x2: 760, y2: 234 }));
    root.appendChild(text({ class: 'scheme-label code dim', x: 340, y: 224, 'text-anchor': 'middle' }, ['veth_a']));
    root.appendChild(text({ class: 'scheme-label code dim', x: 660, y: 224, 'text-anchor': 'middle' }, ['veth_b']));

    // packet layer (cleared between steps)
    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = { svg: root, podA, podB, bridge, packetLayer };
  }

  reset() { this.build(); }
}

const STEPS = [
  {
    id: 'idle',
    duration: 1400,
    narration: 'Both Pod A and Pod B live on node-1. The kubelet wired each pod\'s eth0 to a host-side veth peer plugged into the cni0 bridge.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      s.refs.podB.classList.remove('highlight');
      s.refs.bridge.classList.remove('highlight');
      s.refs.podA.classList.add('highlight');
    },
  },
  {
    id: 'emit',
    duration: 1700,
    narration: 'Pod A writes to its eth0 — the kernel forwards the frame across the veth pair into the cni0 bridge.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      s.refs.podA.classList.add('highlight');
      s.refs.podB.classList.remove('highlight');
      s.refs.bridge.classList.remove('highlight');
      const p = packet({ x: 240, y: 234 });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(440px, 234px)';
      } else {
        ctx.register(animateAlong(p, [[240, 234], [340, 234], [440, 234]], { duration: 1500 }));
      }
    },
  },
  {
    id: 'route',
    duration: 1700,
    narration: 'cni0 looks up Pod B\'s MAC in its FDB and forwards out the veth_b leg.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      s.refs.podA.classList.remove('highlight');
      s.refs.bridge.classList.add('highlight');
      s.refs.podB.classList.remove('highlight');
      const p = packet({ x: 560, y: 234 });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(760px, 234px)';
      } else {
        ctx.register(animateAlong(p, [[560, 234], [660, 234], [760, 234]], { duration: 1500 }));
        ctx.register(pulse(s.refs.bridge, { duration: 800 }));
      }
    },
  },
  {
    id: 'arrive',
    duration: 1500,
    narration: 'Pod B\'s eth0 receives the packet. No NAT, no encapsulation — same L2 segment.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      s.refs.bridge.classList.remove('highlight');
      s.refs.podB.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.podB, { duration: 700, iterations: 2 }));
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
