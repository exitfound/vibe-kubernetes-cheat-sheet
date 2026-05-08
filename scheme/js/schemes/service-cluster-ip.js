import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, box, chip, packet, arrow, curveArrow, animateAlong, pulse, fadeIn } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1000 500',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Service ClusterIP routing',
    });
    root.appendChild(arrowDefs());

    const client = pod({ x: 60, y: 210, w: 120, h: 80, label: 'Client', sublabel: 'curl …', containers: 1, cat: 'workloads' });
    root.appendChild(client);

    const svc = chip({ x: 360, y: 50, w: 280, h: 40, label: 'svc/web · ClusterIP 10.96.5.3', cat: 'network' });
    root.appendChild(svc);

    const proxy = box({ x: 390, y: 220, w: 220, h: 60, label: 'kube-proxy', sublabel: 'iptables / IPVS DNAT', cat: 'control' });
    root.appendChild(proxy);

    const endpoints = chip({ x: 390, y: 320, w: 220, h: 36, label: 'EndpointSlice (selector app=web)', cat: 'network' });
    endpoints.style.opacity = '0.35';
    root.appendChild(endpoints);

    const podsCoords = [
      { y: 90,  ip: '10.244.2.5'  },
      { y: 210, ip: '10.244.3.7'  },
      { y: 330, ip: '10.244.1.11' },
    ];
    const backends = podsCoords.map((c, i) => {
      const p = pod({ x: 770, y: c.y, w: 130, h: 80, label: `web-${i + 1}`, sublabel: c.ip, containers: 1, cat: 'workloads' });
      root.appendChild(p);
      return p;
    });

    // Static dashed lines kube-proxy → backends (DNAT candidates)
    backends.forEach((b, i) => {
      root.appendChild(arrow({
        x1: 610, y1: 250,
        x2: 770, y2: podsCoords[i].y + 40,
        dim: true, dashed: true, color: 'network',
      }));
    });

    // Service → kube-proxy
    root.appendChild(arrow({ x1: 500, y1: 90, x2: 500, y2: 220, dim: true, color: 'control' }));
    // kube-proxy → endpoints (info)
    root.appendChild(arrow({ x1: 500, y1: 280, x2: 500, y2: 320, dim: true, dashed: true, color: 'control' }));

    // labels
    root.appendChild(text({ class: 'scheme-label code dim', x: 500, y: 195, 'text-anchor': 'middle' }, ['watch endpoints']));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = { svg: root, client, svc, proxy, endpoints, backends, packetLayer, podsCoords };
  }

  reset() { this.build(); }
}

const STEPS = [
  {
    id: 'idle',
    duration: 1400,
    narration: 'A Service named web exposes ClusterIP 10.96.5.3. Three Pods carry the label app=web.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      s.refs.endpoints.style.opacity = '0.35';
      s.refs.svc.classList.remove('highlight');
      s.refs.proxy.classList.remove('highlight');
      s.refs.backends.forEach(b => b.classList.remove('highlight'));
      s.refs.client.classList.add('highlight');
    },
  },
  {
    id: 'endpoints',
    duration: 1500,
    narration: 'The endpoint controller watches matching Pods. Their IPs land in the EndpointSlice that backs the Service.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      s.refs.endpoints.style.opacity = '1';
      if (!ctx.reduced) ctx.register(fadeIn(s.refs.endpoints, { duration: 600 }));
    },
  },
  {
    id: 'client-send',
    duration: 1800,
    narration: 'Client opens a connection to ClusterIP 10.96.5.3 — a virtual IP with no real interface anywhere.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      s.refs.svc.classList.add('highlight');
      const p = packet({ x: 180, y: 250, cat: 'network' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(500px, 90px)';
      } else {
        ctx.register(animateAlong(p, [[180, 250], [320, 200], [400, 130], [500, 90]], { duration: 1700 }));
      }
    },
  },
  {
    id: 'dnat',
    duration: 1900,
    narration: 'kube-proxy\'s DNAT rules pick a backend (random or round-robin) and rewrite the destination to a real Pod IP.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      s.refs.svc.classList.remove('highlight');
      s.refs.proxy.classList.add('highlight');
      const targetIdx = 1; // pick web-2
      const targetY = s.refs.podsCoords[targetIdx].y + 40;
      const p = packet({ x: 500, y: 90, cat: 'network' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = `translate(770px, ${targetY}px)`;
      } else {
        ctx.register(animateAlong(p, [[500, 90], [500, 250], [610, 250], [770, targetY]], { duration: 1800 }));
        ctx.register(pulse(s.refs.proxy, { duration: 800 }));
      }
    },
  },
  {
    id: 'arrive',
    duration: 1500,
    narration: 'Backend Pod web-2 receives the request. The reply path uses connection tracking to undo the DNAT.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      s.refs.proxy.classList.remove('highlight');
      const target = s.refs.backends[1];
      target.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(target, { duration: 700, iterations: 2 }));
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
