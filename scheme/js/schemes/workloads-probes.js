import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, pulsePodDim, setConnectorDir, connectorPacketDir, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT } from '../lib/workloads-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#workloads-probes


class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Container probes: startupProbe gates liveness and readiness, liveness restarts the container, readiness toggles the EndpointSlice',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubelet = box({ x: 320, y: 40, w: 280, h: 80, label: 'Kubelet', sublabel: 'prober + probeManager', role: 'cluster' });

    const connectorDown = pathArrow({
      points: [[320, 80], [280, 80], [280, 550], [320, 550]],
      dim: true, dashed: true, role: 'cluster',
    });
    const connectorUp = pathArrow({
      points: [[320, 550], [280, 550], [280, 80], [320, 80]],
      dim: true, dashed: true, role: 'cluster',
    });
    connectorUp.style.opacity = '0';
    root.appendChild(connectorDown);
    root.appendChild(connectorUp);

    const wireReq = text({ class: 'scheme-label code dim', x: 460, y: 146, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
      items: [
        '1. startup   ·  container boots, startupProbe gates the rest',
        '2. released  ·  startup passes, liveness + readiness run',
        '3. ready     ·  readiness passes, Pod IP joins endpoints',
        '4. liveness  ·  failure restarts container, readiness drops IP',
        '5. recovery  ·  fresh container starts, readiness rejoins',
      ],
      role: 'cluster',
    });

    // State chips column on the right.
    const startupChip   = valChip({ x: 830, y: 220, w: 350, h: 32, name: 'startupProbe',   value: 'pending', role: 'workloads' });
    const livenessChip  = valChip({ x: 830, y: 262, w: 350, h: 32, name: 'livenessProbe',  value: 'not running', role: 'workloads' });
    const readinessChip = valChip({ x: 830, y: 304, w: 350, h: 32, name: 'readinessProbe', value: 'not running', role: 'workloads' });
    const restartChip   = valChip({ x: 830, y: 346, w: 350, h: 32, name: 'restartCount',   value: '0', role: 'workloads' });
    const endpointChip  = valChip({ x: 830, y: 388, w: 350, h: 32, name: 'EndpointSlice',  value: 'empty', role: 'workloads' });
    [startupChip, livenessChip, readinessChip, restartChip, endpointChip].forEach(c => root.appendChild(c));

    const nodeEl = node({ x: 320, y: 480, w: 860, h: 140, label: 'Node-1' });

    const podShell = pod({ x: 520, y: 500, w: 460, h: 110, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
    const podShellRect = podShell.querySelector('.scheme-pod-rect');
    if (podShellRect) podShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const containerBox = box({ x: 600, y: 530, w: 300, h: 64, label: 'app', sublabel: 'container', role: 'workloads' });

    const podGroup = g({ id: 'podGroup' });
    podGroup.appendChild(podShell);
    podGroup.appendChild(containerBox);

    // Packet layer.
    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeEl);
    root.appendChild(podGroup);
    root.appendChild(kubelet);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubelet, chain, nodeEl, podGroup, connectorDown, connectorUp,
      startupChip, livenessChip, readinessChip, restartChip, endpointChip,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['kubelet','startupChip','livenessChip','readinessChip','restartChip','endpointChip'],
    [s.refs.podGroup]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'An app container declares all three probe types. The container is still booting, so Kubelet will run only startupProbe at first. livenessProbe and readinessProbe do not run until startupProbe passes, and the Pod IP is not yet a member of the Service EndpointSlice.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.startupChip, 'pending');
      setVal(s.refs.livenessChip, 'not running');
      setVal(s.refs.readinessChip, 'not running');
      setVal(s.refs.restartChip, '0');
      setVal(s.refs.endpointChip, 'empty');
      // Booting, not Ready: the Pod sits dim. The poster carries the startup row,
      // so chain row 0 is lit on the rest frame to match the booting state.
      s.refs.podGroup.style.opacity = '0.55';
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 0);
    },
  },
  {
    id: 'startup-running',
    duration: 2000,
    narration: 'Kubelet runs startupProbe every periodSeconds against the container handler, which can be httpGet, tcpSocket, grpc or exec. A slow app gets failureThreshold attempts before Kubelet gives up and restarts the container. livenessProbe and readinessProbe do not run yet, so a long boot is never mistaken for a failure.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.startupChip, 'probing 4/30');
      setVal(s.refs.livenessChip, 'not running');
      setVal(s.refs.readinessChip, 'not running');
      setVal(s.refs.restartChip, '0');
      setVal(s.refs.endpointChip, 'empty');
      setWire(s, 'req', 'httpGet /healthz/start');
      s.refs.startupChip.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      s.refs.podGroup.style.opacity = '0.55';
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) return;
      const probe = connectorPacketDir(s, ctx, 'down', { role: 'workloads' });
      // Pod is still booting (dim), so flash its opacity on probe arrival so the blink shows.
      pulsePodDim(s.refs.podGroup, ctx, probe.arrivalMs);
    },
  },
  {
    id: 'startup-success',
    duration: 2600,
    narration: 'startupProbe passes once. Kubelet retires it permanently for the lifetime of this container instance and never runs it again. livenessProbe and readinessProbe are released and now execute on their own periodSeconds.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.startupChip, 'passed (retired)');
      setVal(s.refs.livenessChip, 'running');
      setVal(s.refs.readinessChip, 'running');
      setVal(s.refs.restartChip, '0');
      setVal(s.refs.endpointChip, 'empty');
      setWire(s, 'req', '200 OK · Startup done');
      s.refs.kubelet.classList.add('highlight');
      s.refs.startupChip.classList.add('highlight');
      s.refs.livenessChip.classList.add('highlight');
      s.refs.readinessChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = '0.55';
      setConnectorDir(s, 'up');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      pulsePodDim(s.refs.podGroup, ctx, 0);
      connectorPacketDir(s, ctx, 'up', { delay: BEAT.afterPulse, role: 'workloads' });
    },
  },
  {
    id: 'ready',
    duration: 2600,
    narration: 'readinessProbe passes successThreshold consecutive times. Kubelet flips the Pod Ready condition to True, and the EndpointSlice controller adds the Pod IP to the Service EndpointSlice. The Pod now receives traffic.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.startupChip, 'passed (retired)');
      setVal(s.refs.livenessChip, 'passing');
      setVal(s.refs.readinessChip, 'passing');
      setVal(s.refs.restartChip, '0');
      setVal(s.refs.endpointChip, '10.244.1.5 Ready');
      setWire(s, 'req', '200 OK · Ready=True');
      s.refs.kubelet.classList.add('highlight');
      s.refs.readinessChip.classList.add('highlight');
      s.refs.endpointChip.classList.add('highlight');
      // readiness passed: the Pod becomes Ready and lifts to full opacity.
      s.refs.podGroup.style.opacity = '1';
      setConnectorDir(s, 'up');
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
      pulsePod(s.refs.podGroup, ctx, 0);
      // Pod lights up to Ready first (the visible blink), then reports up to Kubelet.
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: 0.55 }, { opacity: 1 }],
        { duration: FADE.in, delay: 0, fill: 'both', easing: 'ease-out' }
      ));
      connectorPacketDir(s, ctx, 'up', { delay: BEAT.afterPulse, role: 'workloads' });
    },
  },
  {
    id: 'liveness-fail',
    duration: 2600,
    narration: 'livenessProbe fails failureThreshold consecutive times. Kubelet kills the container and restarts it per restartPolicy, so restartCount becomes 1. readinessProbe fails too, which drops the Pod IP from the EndpointSlice at once, without waiting for the restart.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.startupChip, 'reset');
      setVal(s.refs.livenessChip, 'failed 3/3');
      setVal(s.refs.readinessChip, 'failed 3/3');
      setVal(s.refs.restartChip, '1');
      setVal(s.refs.endpointChip, 'IP removed');
      setWire(s, 'req', '503 · Liveness failed');
      s.refs.livenessChip.classList.add('highlight');
      s.refs.readinessChip.classList.add('highlight');
      s.refs.restartChip.classList.add('highlight');
      s.refs.endpointChip.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      // Container killed: the Pod drops to its dimmest state.
      s.refs.podGroup.style.opacity = '0.3';
      setConnectorDir(s, 'up');
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) return;
      // Pod is still bright here, so the pulse blink reads clearly. Ball leaves
      // after the blink, then the container is killed and the Pod dims.
      pulsePod(s.refs.podGroup, ctx, 0);
      connectorPacketDir(s, ctx, 'up', { delay: BEAT.afterPulse, role: 'workloads' });
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: 1 }, { opacity: 0.3 }],
        { duration: FADE.out, delay: BEAT.afterPulse + BEAT.afterHop, fill: 'both', easing: 'ease-in' }
      ));
    },
  },
  {
    id: 'recovery',
    duration: 2300,
    narration: 'Kubelet probes the fresh container with startupProbe again. Once it passes, livenessProbe and readinessProbe are released, readinessProbe quickly succeeds, and the EndpointSlice controller rejoins the Pod IP. Traffic resumes while restartCount stays at 1.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.startupChip, 'passed (retired)');
      setVal(s.refs.livenessChip, 'passing');
      setVal(s.refs.readinessChip, 'passing');
      setVal(s.refs.restartChip, '1');
      setVal(s.refs.endpointChip, '10.244.1.5 Ready');
      setWire(s, 'req', 'httpGet /healthz/start');
      s.refs.kubelet.classList.add('highlight');
      s.refs.startupChip.classList.add('highlight');
      s.refs.livenessChip.classList.add('highlight');
      s.refs.readinessChip.classList.add('highlight');
      s.refs.endpointChip.classList.add('highlight');
      // Replacement container is Ready: the Pod returns to full opacity.
      s.refs.podGroup.style.opacity = '1';
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) return;
      const probe = connectorPacketDir(s, ctx, 'down', { role: 'workloads' });
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: 0.3 }, { opacity: 1 }],
        { duration: FADE.in, delay: probe.arrivalMs, fill: 'both', easing: 'ease-out' }
      ));
      pulsePod(s.refs.podGroup, ctx, probe.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
