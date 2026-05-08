import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, box, chip, arrow, packet, animateAlong, fadeIn, fadeOut, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

function valChip({ x, y, w, h = 32, name, value, cat = 'network' }) {
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
      viewBox: '0 0 1200 540',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'ExternalTrafficPolicy: Cluster vs Local',
    });
    root.appendChild(arrowDefs());

    const modeChip   = valChip({ x: 400, y: 20, w: 400, h: 44, name: 'externalTrafficPolicy', value: 'Cluster' });
    const srcChip    = valChip({ x: 820, y: 20, w: 360, h: 44, name: 'observed src IP',        value: '—' });
    root.appendChild(modeChip); root.appendChild(srcChip);

    const client = box({ x: 40, y: 230, w: 160, h: 90, label: 'External', sublabel: 'src=8.8.8.8', cat: 'network' });
    root.appendChild(client);

    const node1 = box({ x: 240, y: 120, w: 420, h: 380, label: 'node-1', sublabel: 'no backend pod', cat: 'control' });
    const node2 = box({ x: 720, y: 120, w: 420, h: 380, label: 'node-2', sublabel: 'has backend pod', cat: 'control' });
    root.appendChild(node1); root.appendChild(node2);

    const proxy1 = chip({ x: 280, y: 200, w: 220, h: 32, label: 'kube-proxy / iptables', cat: 'network' });
    const proxy2 = chip({ x: 760, y: 200, w: 220, h: 32, label: 'kube-proxy / iptables', cat: 'network' });
    root.appendChild(proxy1); root.appendChild(proxy2);

    const backendPod = pod({ x: 760, y: 320, w: 240, h: 90, label: 'backend pod', sublabel: 'observes src IP →', cat: 'workloads' });
    root.appendChild(backendPod);

    const dropBadge = chip({ x: 320, y: 240, w: 140, h: 28, label: 'DROP', cat: 'security' });
    dropBadge.style.opacity = '0';
    root.appendChild(dropBadge);

    root.appendChild(arrow({ x1: 200, y1: 275, x2: 240, y2: 275, dim: true, color: 'network' }));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = { svg: root, modeChip, srcChip, client, node1, node2, proxy1, proxy2, backendPod, dropBadge, packetLayer };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['client','node1','node2','proxy1','proxy2','backendPod','modeChip','srcChip'].forEach(k => s.refs[k].classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A NodePort or LoadBalancer Service backs a Pod that lives on node-2. node-1 has no backend pod. The cloud LB or external client may hit either node.',
    enter(s) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      s.refs.dropBadge.style.opacity = '0';
      setVal(s.refs.modeChip, 'Cluster');
      setVal(s.refs.srcChip, '—');
      s.refs.client.classList.add('highlight');
    },
  },
  {
    id: 'cluster-snat',
    duration: 2000,
    narration: 'Cluster mode: traffic to any node is fine. node-1 has no local backend, so kube-proxy SNATs the packet (src=node-1 IP) and forwards across the cluster network to node-2.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      setVal(s.refs.modeChip, 'Cluster');
      setVal(s.refs.srcChip, 'node-1 IP (SNAT)');
      s.refs.proxy1.classList.add('highlight');
      s.refs.proxy2.classList.add('highlight');
      s.refs.backendPod.classList.add('highlight');
      s.refs.srcChip.classList.add('highlight');
      const p = packet({ x: 200, y: 275, cat: 'network' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(870px, 360px)';
      } else {
        ctx.register(animateAlong(p, [[200, 275], [390, 275], [390, 216], [870, 216], [870, 360]], { duration: 2200 }));
        ctx.register(pulse(s.refs.srcChip, { duration: 800, iterations: 1 }));
      }
    },
  },
  {
    id: 'cluster-tradeoff',
    duration: 1700,
    narration: 'Connection works. Cost: one extra hop and the backend sees node-1 IP, not the real client. Source-IP-based logic in the app is broken.',
    enter(s) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      setVal(s.refs.modeChip, 'Cluster · tradeoff');
      setVal(s.refs.srcChip, 'node-1 IP (SNAT)');
      s.refs.srcChip.classList.add('highlight');
    },
  },
  {
    id: 'local-loss',
    duration: 1900,
    narration: 'Local mode: kube-proxy only forwards to local backends. node-1 has no backend pod for this Service, so traffic that hits node-1 is dropped.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      setVal(s.refs.modeChip, 'Local');
      setVal(s.refs.srcChip, '—  (dropped)');
      s.refs.proxy1.classList.add('highlight');
      const p = packet({ x: 200, y: 275, cat: 'network' });
      s.refs.packetLayer.appendChild(p);
      s.refs.dropBadge.style.opacity = '1';
      if (ctx.reduced) {
        p.style.transform = 'translate(390px, 250px)';
      } else {
        ctx.register(animateAlong(p, [[200, 275], [390, 275], [390, 250]], { duration: 1300 }));
        ctx.register(fadeOut(p, { duration: 400 }));
        ctx.register(fadeIn(s.refs.dropBadge, { duration: 500 }));
        ctx.register(pulse(s.refs.dropBadge, { duration: 800, iterations: 2 }));
      }
    },
  },
  {
    id: 'local-good',
    duration: 1900,
    narration: 'Same Local mode, traffic hits node-2 directly (LB sends only to ready nodes). No SNAT: backend Pod observes the real client IP 8.8.8.8.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      setVal(s.refs.modeChip, 'Local');
      setVal(s.refs.srcChip, '8.8.8.8 (preserved)');
      s.refs.proxy2.classList.add('highlight');
      s.refs.backendPod.classList.add('highlight');
      s.refs.srcChip.classList.add('highlight');
      const p = packet({ x: 200, y: 275, cat: 'network' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(870px, 360px)';
      } else {
        ctx.register(animateAlong(p, [[200, 275], [220, 275], [220, 90], [870, 90], [870, 360]], { duration: 2200 }));
        ctx.register(pulse(s.refs.srcChip, { duration: 800, iterations: 1 }));
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
