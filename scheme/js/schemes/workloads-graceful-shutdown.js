import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, setConnectorDir, routePacket, topPacket, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT } from '../lib/workloads-kit.js';


const CONNECTOR_DOWN = [[690, 120], [690, 185], [280, 185], [280, 550], [320, 550]];
const CONNECTOR_UP   = [[320, 550], [280, 550], [280, 185], [690, 185], [690, 120]];

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

    const kubectl = box({ x: 320, y: 40, w: 220, h: 80, label: 'Kubectl', sublabel: 'delete pod app-pod', role: 'cluster' });
    const api     = box({ x: 580, y: 40, w: 220, h: 80, label: 'Api', sublabel: 'sets deletionTimestamp', role: 'cluster' });

    root.appendChild(arrow({ x1: 540, y1: 65, x2: 580, y2: 65, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: 580, y1: 95, x2: 540, y2: 95, dim: true, dashed: true, role: 'cluster' }));

    const connectorDown = pathArrow({ points: CONNECTOR_DOWN, dim: true, dashed: true, role: 'cluster' });
    const connectorUp   = pathArrow({ points: CONNECTOR_UP,   dim: true, dashed: true, role: 'cluster' });
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
        '3. preStop   ·  Kubelet runs hook synchronously',
        '4. SIGTERM   ·  signal PID 1, drain in-flight work',
        '5. countdown ·  terminationGracePeriodSeconds ticks',
        '6. SIGKILL   ·  force-kill, remove Pod from etcd',
      ],
      role: 'cluster',
    });

    // State chips on the right, y-aligned to the first five chain rows.
    const preStopChip = valChip({ x: 830, y: 220, w: 350, h: 32, name: 'preStop hook',     value: 'idle', role: 'workloads' });
    const sigChip     = valChip({ x: 830, y: 262, w: 350, h: 32, name: 'signal',           value: 'none', role: 'workloads' });
    const graceChip   = valChip({ x: 830, y: 304, w: 350, h: 32, name: 'grace remaining',  value: '30s', role: 'workloads' });
    const statusChip  = valChip({ x: 830, y: 346, w: 350, h: 32, name: 'pod status',       value: 'Running', role: 'workloads' });
    const sliceChip   = valChip({ x: 830, y: 388, w: 350, h: 32, name: 'EndpointSlice',    value: '[10.244.1.7]', role: 'workloads' });
    [preStopChip, sigChip, graceChip, statusChip, sliceChip].forEach(c => root.appendChild(c));

    const nodeEl = node({ x: 320, y: 480, w: 860, h: 140, label: 'Node-1' });

    const podShell = pod({ x: 520, y: 500, w: 460, h: 110, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
    const podShellRect = podShell.querySelector('.scheme-pod-rect');
    if (podShellRect) podShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    // The container box. Signals target its main process, PID 1.
    const containerBox = box({ x: 600, y: 530, w: 300, h: 64, label: 'app', sublabel: 'container: PID 1', role: 'workloads' });

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
  clearHighlights(s,
    ['kubectl','api','preStopChip','sigChip','graceChip','statusChip','sliceChip'],
    [s.refs.podGroup]);
}

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
      setChainActive(s.refs.chain, 0);
    },
  },
  {
    id: 'delete',
    duration: 3300,
    narration: 'Kubectl delete reaches the Api, which stamps metadata.deletionTimestamp on the Pod. That field is what makes Kubectl report the Pod as Terminating, while status.phase itself stays Running. In parallel the endpoint controller drops 10.244.1.7 from the EndpointSlice, so kube-proxy stops sending new connections while the Kubelet termination sequence begins.',
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
      // DELETE hits the apiserver (top hop), then the termination order travels
      // down to the kubelet side and the Pod pulses on arrival.
      const req = topPacket(s, ctx, { role: 'workloads' });
      const order = routePacket(s, ctx, CONNECTOR_DOWN, { delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      pulsePod(s.refs.podGroup, ctx, order.arrivalMs);
    },
  },
  {
    id: 'prestop',
    duration: 2000,
    narration: 'The Kubelet runs the container preStop hook synchronously, before any signal is sent. A common pattern is a short sleep, which holds the process alive long enough for load balancers and kube-proxy to finish deregistering the endpoint. New requests stop arriving while in-flight ones still complete.',
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
      // The hook runs inside the container: the Pod pulses (the hook chip lights via
      // the static highlight only, no chip pulse).
      pulsePod(s.refs.podGroup, ctx, 0);
    },
  },
  {
    id: 'sigterm',
    duration: 2000,
    narration: 'Once preStop returns, the Kubelet sends SIGTERM to PID 1. A well-behaved app traps this signal, stops accepting new work, drains in-flight requests and closes its connections and pools. The time the preStop hook consumed is already gone from the same grace budget.',
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
      // SIGTERM lands on PID 1: the Pod pulses (the signal chips light via the
      // static highlight only, no chip pulse).
      pulsePod(s.refs.podGroup, ctx, 0);
    },
  },
  {
    id: 'countdown',
    duration: 2100,
    narration: 'terminationGracePeriodSeconds, 30 by default, counts down from the moment of deletion. The preStop hook and the SIGTERM drain both spend this single shared budget. Most applications exit well before the timer reaches zero, and the Kubelet then proceeds straight to cleanup.',
    enter(s) {
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
      // Pure timer step, nothing travels and the Pod is untouched: the ticking grace
      // budget shows via the static highlight only (no chip pulse).
    },
  },
  {
    id: 'sigkill',
    duration: 3100,
    narration: 'If the container is still alive when the grace timer reaches 0, the Kubelet sends SIGKILL, which the kernel delivers unconditionally to PID 1. Once the process is gone the Kubelet reports the terminated container, and the Api removes the Pod object from etcd.',
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
        { duration: FADE.out, fill: 'both', easing: 'ease-in' }
      ));
      // After the process is gone, the kubelet reports up to the apiserver.
      routePacket(s, ctx, CONNECTOR_UP, { delay: BEAT.afterPulse, role: 'workloads' });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
