import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow, packet } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, clearPodHighlight, setConnectorDir, makeInit } from '../lib/scheme-kit.js';


const CONNECTOR_DOWN = [[690, 120], [690, 185], [280, 185], [280, 550], [320, 550]];
const CONNECTOR_UP   = [[320, 550], [280, 550], [280, 185], [690, 185], [690, 120]];

function connectorPacket(s, ctx, pts, { delay = 0, dur = 1300 } = {}) {
  const seg = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    seg.push(d);
    total += d;
  }
  let acc = 0;
  const frames = pts.map((pt, i) => {
    if (i > 0) acc += seg[i - 1];
    return { transform: `translate(${pt[0]}px, ${pt[1]}px)`, offset: total ? acc / total : 0 };
  });
  const p = packet({ x: pts[0][0], y: pts[0][1], cat: 'control' });
  p.style.opacity = '0';
  s.refs.packetLayer.appendChild(p);
  // Pre-move fade-in so the packet appears AT source BEFORE travelling.
  const fadeInDelayMain = Math.max(0, delay - 200);
  ctx.register(p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: fadeInDelayMain, fill: 'forwards', easing: 'ease-out' }));
  ctx.register(p.animate(frames, { duration: dur, delay, fill: 'forwards', easing: 'linear' }));
  ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: delay + dur, fill: 'forwards', easing: 'ease-in' }));
}

// A short packet on the kubectl -> apiserver request arrow.
function arrowPacket(s, ctx, { from, to, delay = 0, dur = 500 }) {
  const p = packet({ x: from[0], y: from[1], cat: 'control' });
  p.style.opacity = '0';
  s.refs.packetLayer.appendChild(p);
  const fadeInDelay = Math.max(0, delay - 200);
  ctx.register(p.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: 200, delay: fadeInDelay, fill: 'forwards', easing: 'ease-out' }
  ));
  ctx.register(p.animate(
    [
      { transform: `translate(${from[0]}px, ${from[1]}px)` },
      { transform: `translate(${to[0]}px, ${to[1]}px)` },
    ],
    { duration: dur, delay, fill: 'forwards', easing: 'linear' }
  ));
  ctx.register(p.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: 200, delay: delay + dur, fill: 'forwards', easing: 'ease-in' }
  ));
}

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Graceful Pod shutdown: deletionTimestamp, EndpointSlice removal, preStop, SIGTERM, grace countdown, SIGKILL',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubectl = box({ x: 320, y: 40, w: 220, h: 80, label: 'kubectl', sublabel: 'delete pod app-pod', cat: 'control' });
    const api     = box({ x: 580, y: 40, w: 220, h: 80, label: 'kube-apiserver', sublabel: 'sets deletionTimestamp', cat: 'control' });

    root.appendChild(arrow({ x1: 540, y1: 65, x2: 580, y2: 65, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 580, y1: 95, x2: 540, y2: 95, dim: true, dashed: true, color: 'control' }));

    const connectorDown = pathArrow({ points: CONNECTOR_DOWN, dim: true, dashed: true, color: 'control' });
    const connectorUp   = pathArrow({ points: CONNECTOR_UP,   dim: true, dashed: true, color: 'control' });
    connectorUp.style.opacity = '0';
    root.appendChild(connectorDown);
    root.appendChild(connectorUp);

    // Single wire label centered below the top row, set per step via setWire.
    const wireReq = text({ class: 'scheme-label code dim', x: 560, y: 148, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
      items: [
        '1. running   ·  Pod IP serving traffic',
        '2. delete    ·  deletionTimestamp, drop from EndpointSlice',
        '3. preStop   ·  kubelet runs hook synchronously',
        '4. SIGTERM   ·  signal PID 1, drain in-flight work',
        '5. countdown ·  terminationGracePeriodSeconds ticks',
        '6. SIGKILL   ·  force-kill, remove Pod from etcd',
      ],
      cat: 'control',
    });

    // State chips on the right, y-aligned to the first five chain rows.
    const preStopChip = valChip({ x: 830, y: 220, w: 350, h: 32, name: 'preStop hook',     value: 'idle' });
    const sigChip     = valChip({ x: 830, y: 262, w: 350, h: 32, name: 'signal',           value: 'none' });
    const graceChip   = valChip({ x: 830, y: 304, w: 350, h: 32, name: 'grace remaining',  value: '30s' });
    const statusChip  = valChip({ x: 830, y: 346, w: 350, h: 32, name: 'pod status',       value: 'Running' });
    const sliceChip   = valChip({ x: 830, y: 388, w: 350, h: 32, name: 'EndpointSlice',    value: '[10.244.1.7]' });
    [preStopChip, sigChip, graceChip, statusChip, sliceChip].forEach(c => root.appendChild(c));

    const nodeEl = node({ x: 320, y: 480, w: 860, h: 140, label: 'Node-1' });

    const podShell = pod({ x: 520, y: 500, w: 460, h: 110, label: 'Pod', sublabel: '', containers: 0, cat: 'workloads' });
    const podShellRect = podShell.querySelector('.scheme-pod-rect');
    if (podShellRect) podShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    // The container box. Signals target its main process, PID 1.
    const containerBox = box({ x: 600, y: 530, w: 300, h: 64, label: 'app', sublabel: 'container: PID 1', cat: 'workloads' });

    const podGroup = g({ id: 'podGroup' });
    podGroup.appendChild(podShell);
    podGroup.appendChild(containerBox);

    // Packet layer.
    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeEl);
    root.appendChild(podGroup);
    root.appendChild(kubectl);
    root.appendChild(api);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubectl, api, chain, nodeEl, podGroup, connectorDown, connectorUp,
      preStopChip, sigChip, graceChip, statusChip, sliceChip,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['kubectl','api','preStopChip','sigChip','graceChip','statusChip','sliceChip']
    .forEach(k => s.refs[k].classList.remove('highlight'));
  s.refs.chain.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
  clearPodHighlight(s.refs.podGroup);
}



function clearWires(s) {
  Object.values(s.refs.wires).forEach(t => { t.textContent = ''; });
}

function setWire(s, key, txt) {
  if (s.refs.wires[key]) s.refs.wires[key].textContent = txt;
}

// Show the connector copy whose arrowhead matches the packet direction.

const STEPS = [
  {
    id: 'running',
    duration: 1500,
    narration: 'The Pod app-pod runs on Node-1 with its single container as PID 1. Its IP 10.244.1.7 is published in the Service EndpointSlice, so kube-proxy routes client traffic straight to it. The phase is Running and the full terminationGracePeriodSeconds budget of 30s is untouched.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.preStopChip, 'idle');
      setVal(s.refs.sigChip, 'none');
      setVal(s.refs.graceChip, '30s');
      setVal(s.refs.statusChip, 'Running');
      setVal(s.refs.sliceChip, '[10.244.1.7]');
      // Serving traffic: full opacity. Nothing is lit at step 0.
      s.refs.podGroup.style.opacity = '1';
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'delete',
    duration: 2400,
    narration: 'kubectl delete reaches the apiserver, which stamps metadata.deletionTimestamp on the Pod. That field is what makes kubectl report the Pod as Terminating, while status.phase itself stays Running. In parallel the endpoint controller drops 10.244.1.7 from the EndpointSlice, so kube-proxy stops sending new connections while the kubelet termination sequence begins.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.preStopChip, 'idle');
      setVal(s.refs.sigChip, 'none');
      setVal(s.refs.graceChip, '30s');
      setVal(s.refs.statusChip, 'Terminating');
      setVal(s.refs.sliceChip, '[] removed');
      setWire(s, 'req', 'DELETE /api/v1/.../app-pod');
      s.refs.kubectl.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      s.refs.statusChip.classList.add('highlight');
      s.refs.sliceChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = '1';
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      arrowPacket(s, ctx, { from: [540, 65], to: [580, 65], delay: 0, dur: 600 });
      connectorPacket(s, ctx, CONNECTOR_DOWN, { delay: 700, dur: 1300 });
      pulsePod(s.refs.podGroup, ctx, 2000);
    },
  },
  {
    id: 'prestop',
    duration: 2000,
    narration: 'The kubelet runs the container preStop hook synchronously, before any signal is sent. A common pattern is a short sleep, which holds the process alive long enough for load balancers and kube-proxy to finish deregistering the endpoint. New requests stop arriving while in-flight ones still complete.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.preStopChip, 'exec: sleep 5');
      setVal(s.refs.sigChip, 'none');
      setVal(s.refs.graceChip, '30s');
      setVal(s.refs.statusChip, 'Terminating');
      setVal(s.refs.sliceChip, '[]');
      s.refs.preStopChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = '1';
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
    },
  },
  {
    id: 'sigterm',
    duration: 2000,
    narration: 'Once preStop returns, the kubelet sends SIGTERM to PID 1. A well-behaved app traps this signal, stops accepting new work, drains in-flight requests and closes its connections and pools. The time the preStop hook consumed is already gone from the same grace budget.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.preStopChip, 'completed');
      setVal(s.refs.sigChip, 'SIGTERM');
      setVal(s.refs.graceChip, '25s');
      setVal(s.refs.statusChip, 'Terminating');
      setVal(s.refs.sliceChip, '[]');
      s.refs.sigChip.classList.add('highlight');
      s.refs.graceChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = '1';
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) return;
    },
  },
  {
    id: 'countdown',
    duration: 2100,
    narration: 'terminationGracePeriodSeconds, 30 by default, counts down from the moment of deletion. The preStop hook and the SIGTERM drain both spend this single shared budget. Most applications exit well before the timer reaches zero, and the kubelet then proceeds straight to cleanup.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.preStopChip, 'completed');
      setVal(s.refs.sigChip, 'SIGTERM');
      setVal(s.refs.graceChip, '6s');
      setVal(s.refs.statusChip, 'Terminating');
      setVal(s.refs.sliceChip, '[]');
      s.refs.graceChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = '1';
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) return;
    },
  },
  {
    id: 'sigkill',
    duration: 2400,
    narration: 'If the container is still alive when the grace timer reaches 0, the kubelet sends SIGKILL, which the kernel delivers unconditionally to PID 1. Once the process is gone the kubelet reports the terminated container, and the apiserver removes the Pod object from etcd.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.preStopChip, 'completed');
      setVal(s.refs.sigChip, 'SIGKILL');
      setVal(s.refs.graceChip, '0s · expired');
      setVal(s.refs.statusChip, 'deleted');
      setVal(s.refs.sliceChip, '[]');
      setWire(s, 'req', 'Pod removed from etcd');
      s.refs.sigChip.classList.add('highlight');
      s.refs.statusChip.classList.add('highlight');
      s.refs.graceChip.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      // Killed and purged: the whole Pod block drops to its faint terminal state.
      s.refs.podGroup.style.opacity = '0.3';
      setConnectorDir(s, 'up');
      setChainActive(s.refs.chain, 5);
      if (ctx.reduced) return;
      pulsePod(s.refs.podGroup, ctx, 0);
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: 1 }, { opacity: 0.3 }],
        { duration: 700, fill: 'both', easing: 'ease-in' }
      ));
      // After the process is gone, the kubelet reports up to the apiserver.
      connectorPacket(s, ctx, CONNECTOR_UP, { delay: 700, dur: 1300 });
    },
  },
];

export const init = makeInit(Scene, STEPS);
