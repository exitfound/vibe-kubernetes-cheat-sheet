import { svg, g } from '../lib/svg.js';
import { arrowDefs, pod, box, node, chip, arrow, packet, animateAlong, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 480',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Pod-to-Pod across nodes via VXLAN',
    });
    root.appendChild(arrowDefs());

    const node1 = node({ x: 30,  y: 80, w: 540, h: 360, label: 'node-1' });
    const node2 = node({ x: 630, y: 80, w: 540, h: 360, label: 'node-2' });
    root.appendChild(node1);
    root.appendChild(node2);

    const podA = pod({ x: 70,  y: 150, w: 180, h: 90, label: 'Pod A', sublabel: '10.244.1.2', cat: 'workloads' });
    const podB = pod({ x: 950, y: 150, w: 180, h: 90, label: 'Pod B', sublabel: '10.244.2.5', cat: 'workloads' });
    root.appendChild(podA);
    root.appendChild(podB);

    const vethA = chip({ x: 90,  y: 280, w: 140, h: 28, label: 'veth_a', cat: 'network' });
    const vethB = chip({ x: 970, y: 280, w: 140, h: 28, label: 'veth_b', cat: 'network' });
    root.appendChild(vethA);
    root.appendChild(vethB);

    const cniA  = chip({ x: 290, y: 280, w: 130, h: 28, label: 'cni0',     cat: 'network' });
    const cniB  = chip({ x: 770, y: 280, w: 130, h: 28, label: 'cni0',     cat: 'network' });
    root.appendChild(cniA); root.appendChild(cniB);

    const eth0A = chip({ x: 460, y: 280, w: 100, h: 28, label: 'eth0',     cat: 'network' });
    const eth0B = chip({ x: 640, y: 280, w: 100, h: 28, label: 'eth0',     cat: 'network' });
    root.appendChild(eth0A); root.appendChild(eth0B);

    const vxlan = chip({ x: 480, y: 360, w: 240, h: 28, label: 'VXLAN underlay (UDP/4789)', cat: 'network' });
    root.appendChild(vxlan);

    root.appendChild(arrow({ x1: 230, y1: 294, x2: 290, y2: 294, dim: true, color: 'network' }));
    root.appendChild(arrow({ x1: 420, y1: 294, x2: 460, y2: 294, dim: true, color: 'network' }));
    root.appendChild(arrow({ x1: 740, y1: 294, x2: 770, y2: 294, dim: true, color: 'network' }));
    root.appendChild(arrow({ x1: 900, y1: 294, x2: 970, y2: 294, dim: true, color: 'network' }));
    root.appendChild(arrow({ x1: 560, y1: 320, x2: 640, y2: 320, dim: true, dashed: true, color: 'network' }));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = { svg: root, node1, node2, podA, podB, vethA, vethB, cniA, cniB, eth0A, eth0B, vxlan, packetLayer };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['podA','podB','vethA','vethB','cniA','cniB','eth0A','eth0B','vxlan'].forEach(k => s.refs[k].classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1400,
    narration: 'Pod A on node-1 wants to talk to Pod B on node-2. Their IPs are in the same flat /16 (10.244.0.0/16) but they sit on different nodes.',
    enter(s) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      s.refs.podA.classList.add('highlight');
    },
  },
  {
    id: 'emit',
    duration: 1700,
    narration: 'Pod A writes to its eth0. The frame crosses veth_a into node-1\'s cni0 bridge.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      s.refs.podA.classList.add('highlight');
      s.refs.vethA.classList.add('highlight');
      s.refs.cniA.classList.add('highlight');
      const p = packet({ x: 230, y: 294, cat: 'network' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(355px, 294px)';
      } else {
        ctx.register(animateAlong(p, [[230, 294], [290, 294], [355, 294]], { duration: 1500 }));
      }
    },
  },
  {
    id: 'encap',
    duration: 1900,
    narration: 'cni0 has no FDB entry for Pod B (different node). The CNI plugin (Flannel / Calico-VXLAN / Cilium) wraps the inner frame in a UDP packet bound for node-2\'s host IP.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      s.refs.cniA.classList.add('highlight');
      s.refs.eth0A.classList.add('highlight');
      const p = packet({ x: 420, y: 294, cat: 'network' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(510px, 294px)';
      } else {
        ctx.register(animateAlong(p, [[420, 294], [460, 294], [510, 294]], { duration: 1500 }));
        ctx.register(pulse(s.refs.eth0A, { duration: 700, iterations: 1 }));
      }
    },
  },
  {
    id: 'transit',
    duration: 1900,
    narration: 'Encapsulated packet travels over the node network (the underlay). Routers between nodes only see UDP/4789 between two host IPs.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      s.refs.eth0A.classList.add('highlight');
      s.refs.eth0B.classList.add('highlight');
      s.refs.vxlan.classList.add('highlight');
      const p = packet({ x: 560, y: 320, cat: 'network' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(640px, 320px)';
      } else {
        ctx.register(animateAlong(p, [[560, 320], [600, 320], [640, 320]], { duration: 1700 }));
        ctx.register(pulse(s.refs.vxlan, { duration: 800, iterations: 1 }));
      }
    },
  },
  {
    id: 'decap',
    duration: 1900,
    narration: 'node-2\'s kernel decapsulates the VXLAN packet. The original inner frame goes into node-2\'s cni0 bridge, which forwards out veth_b.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      s.refs.eth0B.classList.add('highlight');
      s.refs.cniB.classList.add('highlight');
      s.refs.vethB.classList.add('highlight');
      const p = packet({ x: 740, y: 294, cat: 'network' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(900px, 294px)';
      } else {
        ctx.register(animateAlong(p, [[740, 294], [820, 294], [900, 294]], { duration: 1700 }));
      }
    },
  },
  {
    id: 'arrive',
    duration: 1500,
    narration: 'Pod B receives the original frame on its eth0. From the application\'s view nothing happened, the packet arrived as if Pod A were on the same L2 segment.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      s.refs.vethB.classList.add('highlight');
      s.refs.podB.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.podB, { duration: 800, iterations: 2 }));
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
