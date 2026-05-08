import { svg, g } from '../lib/svg.js';
import { arrowDefs, pod, box, chip, chainList, arrow, pathArrow, packet, animateAlong, pulse } from '../lib/primitives.js';
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
      'aria-label': 'DNS resolution via CoreDNS',
    });
    root.appendChild(arrowDefs());

    const client = pod({ x: 50, y: 180, w: 150, h: 80, label: 'App Pod', sublabel: 'client', cat: 'workloads' });
    root.appendChild(client);

    const resolv = chip({ x: 50, y: 285, w: 220, h: 28, label: 'resolv.conf  10.96.0.10', cat: 'network' });
    root.appendChild(resolv);

    const svcDns = box({ x: 300, y: 190, w: 160, h: 60, label: 'kube-dns', sublabel: '10.96.0.10', cat: 'network' });
    root.appendChild(svcDns);

    const pod1 = pod({ x: 560, y: 90, w: 140, h: 80, label: 'CoreDNS', sublabel: 'pod-1', cat: 'workloads' });
    root.appendChild(pod1);

    const pod2 = pod({ x: 560, y: 290, w: 140, h: 80, label: 'CoreDNS', sublabel: 'pod-2', cat: 'workloads' });
    root.appendChild(pod2);

    const chain = chainList({
      x: 760,
      y: 90,
      w: 230,
      items: ['1. cache plugin (miss)', '2. kubernetes plugin', '3. answer: 10.96.7.42'],
      cat: 'network',
    });
    root.appendChild(chain);

    root.appendChild(arrow({ x1: 200, y1: 220, x2: 300, y2: 220, dim: true, color: 'network' }));
    root.appendChild(pathArrow({ points: [[460, 220], [510, 220], [510, 130], [560, 130]], dim: true, color: 'network' }));
    root.appendChild(pathArrow({ points: [[460, 220], [510, 220], [510, 330], [560, 330]], dim: true, color: 'network' }));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = { svg: root, client, resolv, svcDns, pod1, pod2, chain, packetLayer };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['client', 'resolv', 'svcDns', 'pod1', 'pod2'].forEach(k => s.refs[k].classList.remove('highlight'));
  s.refs.chain.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1400,
    narration: 'A client Pod needs to reach service-x. Its /etc/resolv.conf points UDP queries at the kube-dns Service ClusterIP.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.client.classList.add('highlight');
    },
  },
  {
    id: 'query',
    duration: 1700,
    narration: 'Pod sends a DNS UDP query to 10.96.0.10. The query lands at the kube-dns Service.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.resolv.classList.add('highlight');
      s.refs.client.classList.add('highlight');
      s.refs.svcDns.classList.add('highlight');
      const p = packet({ x: 200, y: 220, cat: 'network' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(300px, 220px)';
      } else {
        ctx.register(animateAlong(p, [[200, 220], [250, 220], [300, 220]], { duration: 1500 }));
      }
    },
  },
  {
    id: 'proxy',
    duration: 1700,
    narration: 'kube-proxy iptables rules DNAT the query to one of the CoreDNS Pods. pod-1 receives it on port 53.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.svcDns.classList.add('highlight');
      s.refs.pod1.classList.add('highlight');
      const p = packet({ x: 460, y: 220, cat: 'network' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(560px, 130px)';
      } else {
        ctx.register(animateAlong(p, [[460, 220], [510, 220], [510, 130], [560, 130]], { duration: 1700 }));
      }
    },
  },
  {
    id: 'plugins',
    duration: 2200,
    narration: 'CoreDNS runs its plugin chain. cache plugin misses, kubernetes plugin queries the apiserver, and the chain returns service-x ClusterIP 10.96.7.42.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.pod1.classList.add('highlight');
      s.refs.chain.querySelectorAll('.scheme-chip').forEach(r => r.classList.add('highlight'));
      if (!ctx.reduced) ctx.register(pulse(s.refs.pod1, { duration: 800, iterations: 2 }));
    },
  },
  {
    id: 'respond',
    duration: 1900,
    narration: 'Reply UDP packet carries 10.96.7.42 back to the Pod. The Pod now connects to that IP directly.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.pod1.classList.add('highlight');
      s.refs.client.classList.add('highlight');
      s.refs.chain.querySelectorAll('.scheme-chip').forEach(r => r.classList.add('highlight'));
      const p = packet({ x: 560, y: 130, cat: 'network' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(200px, 220px)';
      } else {
        ctx.register(animateAlong(p, [[560, 130], [510, 130], [510, 220], [200, 220]], { duration: 1900 }));
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
