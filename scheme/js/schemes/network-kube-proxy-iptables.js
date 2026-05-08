import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, box, chainList, arrow, packet, animateAlong, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1100 480',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'kube-proxy iptables chain traversal',
    });
    root.appendChild(arrowDefs());

    const incoming = box({ x: 30, y: 60, w: 260, h: 60, label: 'Packet → 10.96.7.42:80', sublabel: 'ClusterIP target', cat: 'network' });
    root.appendChild(incoming);

    root.appendChild(text({ class: 'scheme-label code', x: 30, y: 168 }, ['KUBE-SERVICES']));
    const chainSvc = chainList({
      x: 30, y: 180, w: 340,
      items: [
        '10.96.0.10:53  → KUBE-SVC-DNS',
        '10.96.7.42:80  → KUBE-SVC-XXX',
        '10.96.5.1:443  → KUBE-SVC-API',
      ],
      cat: 'network',
    });
    root.appendChild(chainSvc);

    root.appendChild(text({ class: 'scheme-label code', x: 400, y: 168 }, ['KUBE-SVC-XXX']));
    const chainSvcXxx = chainList({
      x: 400, y: 180, w: 340,
      items: ['--probability 0.5 → KUBE-SEP-A', 'else              → KUBE-SEP-B'],
      cat: 'network',
    });
    root.appendChild(chainSvcXxx);

    root.appendChild(text({ class: 'scheme-label code', x: 770, y: 168 }, ['KUBE-SEP-A']));
    const chainSep = chainList({
      x: 770, y: 180, w: 320,
      items: ['DNAT to 10.244.1.5:8080'],
      cat: 'network',
    });
    root.appendChild(chainSep);

    const podBackend = pod({ x: 820, y: 340, w: 220, h: 80, label: 'Pod 10.244.1.5', sublabel: ':8080', cat: 'workloads' });
    root.appendChild(podBackend);

    root.appendChild(arrow({ x1: 160, y1: 120, x2: 160, y2: 175, dim: true, color: 'network' }));
    root.appendChild(arrow({ x1: 370, y1: 230, x2: 400, y2: 230, dim: true, color: 'network' }));
    root.appendChild(arrow({ x1: 740, y1: 230, x2: 770, y2: 230, dim: true, color: 'network' }));
    root.appendChild(arrow({ x1: 930, y1: 215, x2: 930, y2: 340, dim: true, color: 'network' }));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = { svg: root, incoming, chainSvc, chainSvcXxx, chainSep, podBackend, packetLayer };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  s.refs.incoming.classList.remove('highlight');
  s.refs.podBackend.classList.remove('highlight');
  s.refs.chainSvc.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
  s.refs.chainSvcXxx.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
  s.refs.chainSep.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1400,
    narration: 'A packet wants ClusterIP 10.96.7.42:80. kube-proxy has already programmed iptables NAT rules on every node.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.incoming.classList.add('highlight');
    },
  },
  {
    id: 'enter',
    duration: 1500,
    narration: 'PREROUTING (external) or OUTPUT (in-cluster) jumps the packet into the KUBE-SERVICES chain. Every Service has one rule here.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.incoming.classList.add('highlight');
      const p = packet({ x: 160, y: 120, cat: 'network' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(160px, 175px)';
      } else {
        ctx.register(animateAlong(p, [[160, 120], [160, 148], [160, 175]], { duration: 1300 }));
      }
    },
  },
  {
    id: 'svc-match',
    duration: 1900,
    narration: 'KUBE-SERVICES matches dst 10.96.7.42:80 and jumps to the per-Service chain KUBE-SVC-XXX.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      const rows = s.refs.chainSvc.querySelectorAll('.scheme-chip');
      if (rows[1]) rows[1].classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.chainSvc, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'random-pick',
    duration: 1900,
    narration: 'KUBE-SVC-XXX uses statistic random with probability 1/N per endpoint. The coin flip lands on the first rule, jumping to KUBE-SEP-A.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      const rows = s.refs.chainSvcXxx.querySelectorAll('.scheme-chip');
      if (rows[0]) rows[0].classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.chainSvcXxx, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'dnat',
    duration: 1700,
    narration: 'KUBE-SEP-A holds the DNAT rule. dst is rewritten from ClusterIP 10.96.7.42:80 to backing Pod IP 10.244.1.5:8080.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      const rows = s.refs.chainSep.querySelectorAll('.scheme-chip');
      if (rows[0]) rows[0].classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.chainSep, { duration: 800, iterations: 2 }));
    },
  },
  {
    id: 'egress',
    duration: 1900,
    narration: 'Packet leaves the host stack with the rewritten dst and lands on the backing Pod via the normal pod-network path.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.chainSep.querySelectorAll('.scheme-chip')[0].classList.add('highlight');
      s.refs.podBackend.classList.add('highlight');
      const p = packet({ x: 930, y: 215, cat: 'network' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(930px, 340px)';
      } else {
        ctx.register(animateAlong(p, [[930, 215], [930, 280], [930, 340]], { duration: 1500 }));
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
