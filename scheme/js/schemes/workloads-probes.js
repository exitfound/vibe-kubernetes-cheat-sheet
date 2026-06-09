import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, pathArrow, packet } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, clearPodHighlight, setConnectorDir, makeInit } from '../lib/scheme-kit.js';


function connectorPacket(s, ctx, dir, { delay = 0, dur = 1100 } = {}) {
  const pts = dir === 'up'
    ? [[320, 550], [280, 550], [280, 80], [320, 80]]
    : [[320, 80], [280, 80], [280, 550], [320, 550]];
  const offs = [0, 0.15, 0.85, 1];
  const p = packet({ x: pts[0][0], y: pts[0][1], cat: 'control' });
  p.style.opacity = '0';
  s.refs.packetLayer.appendChild(p);
  // Pre-move fade-in: packet appears AT source block BEFORE moving.
  const fadeInDelay = Math.max(0, delay - 200);
  ctx.register(p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: fadeInDelay, fill: 'forwards', easing: 'ease-out' }));
  ctx.register(p.animate(
    pts.map((pt, i) => ({ transform: `translate(${pt[0]}px, ${pt[1]}px)`, offset: offs[i] })),
    { duration: dur, delay, fill: 'forwards', easing: 'linear' }
  ));
  ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: delay + dur, fill: 'forwards', easing: 'ease-in' }));
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
      'aria-label': 'Container probes: startupProbe gates liveness and readiness, liveness restarts the container, readiness toggles the EndpointSlice',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubelet = box({ x: 320, y: 40, w: 280, h: 80, label: 'Kubelet', sublabel: 'prober + probeManager', cat: 'control' });

    const connectorDown = pathArrow({
      points: [[320, 80], [280, 80], [280, 550], [320, 550]],
      dim: true, dashed: true, color: 'control',
    });
    const connectorUp = pathArrow({
      points: [[320, 550], [280, 550], [280, 80], [320, 80]],
      dim: true, dashed: true, color: 'control',
    });
    connectorUp.style.opacity = '0';
    root.appendChild(connectorDown);
    root.appendChild(connectorUp);

    const wireReq = text({ class: 'scheme-label code dim', x: 460, y: 146, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
      items: [
        '1. starting   ·  container booting, startup gates the rest',
        '2. startup    ·  probe retries up to failureThreshold',
        '3. released   ·  startup passes, liveness + readiness run',
        '4. ready      ·  readiness passes, Pod IP joins endpoints',
        '5. liveness   ·  failure restarts container, readiness drops IP',
        '6. recovery   ·  fresh container starts, readiness rejoins',
      ],
      cat: 'control',
    });

    // State chips column on the right.
    const startupChip   = valChip({ x: 830, y: 220, w: 350, h: 32, name: 'startupProbe',   value: 'pending' });
    const livenessChip  = valChip({ x: 830, y: 262, w: 350, h: 32, name: 'livenessProbe',  value: 'not running' });
    const readinessChip = valChip({ x: 830, y: 304, w: 350, h: 32, name: 'readinessProbe', value: 'not running' });
    const restartChip   = valChip({ x: 830, y: 346, w: 350, h: 32, name: 'restartCount',   value: '0' });
    const endpointChip  = valChip({ x: 830, y: 388, w: 350, h: 32, name: 'EndpointSlice',  value: 'empty' });
    [startupChip, livenessChip, readinessChip, restartChip, endpointChip].forEach(c => root.appendChild(c));

    const nodeEl = node({ x: 320, y: 480, w: 860, h: 140, label: 'Node-1' });

    const podShell = pod({ x: 520, y: 500, w: 460, h: 110, label: 'Pod', sublabel: '', containers: 0, cat: 'workloads' });
    const podShellRect = podShell.querySelector('.scheme-pod-rect');
    if (podShellRect) podShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const containerBox = box({ x: 600, y: 530, w: 300, h: 64, label: 'app', sublabel: 'container', cat: 'workloads' });

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
  ['kubelet','startupChip','livenessChip','readinessChip','restartChip','endpointChip']
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
      // Booting, not Ready: the Pod sits dim. Nothing is lit at step 0.
      s.refs.podGroup.style.opacity = '0.55';
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, -1);
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
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      connectorPacket(s, ctx, 'down');
      pulsePod(s.refs.podGroup, ctx, 1000);
      // Pod is still booting (dim 0.55), so flash its opacity on probe arrival so the blink shows.
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: 0.55 }, { opacity: 0.8 }, { opacity: 0.55 }],
        { duration: 900, delay: 1000, fill: 'both', easing: 'ease-in-out' }
      ));
    },
  },
  {
    id: 'startup-success',
    duration: 2000,
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
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
      pulsePod(s.refs.podGroup, ctx, 0);
      // Pod flashes brighter so the blink is clearly visible, then settles back
      // to its dim not-yet-Ready state. Only after that does the packet leave.
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: 0.55 }, { opacity: 1 }, { opacity: 0.55 }],
        { duration: 900, delay: 0, fill: 'both', easing: 'ease-in-out' }
      ));
      connectorPacket(s, ctx, 'up', { delay: 800 });
    },
  },
  {
    id: 'ready',
    duration: 2100,
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
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) return;
      pulsePod(s.refs.podGroup, ctx, 0);
      // Pod lights up to Ready first (the visible blink), then reports up to Kubelet.
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: 0.55 }, { opacity: 1 }],
        { duration: 500, delay: 0, fill: 'both', easing: 'ease-out' }
      ));
      connectorPacket(s, ctx, 'up', { delay: 800 });
    },
  },
  {
    id: 'liveness-fail',
    duration: 2300,
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
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) return;
      // Pod is still bright here, so the pulse blink reads clearly. Ball leaves
      // after the blink, then the container is killed and the Pod dims.
      pulsePod(s.refs.podGroup, ctx, 0);
      connectorPacket(s, ctx, 'up', { delay: 800 });
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: 1 }, { opacity: 0.3 }],
        { duration: 700, delay: 900, fill: 'both', easing: 'ease-in' }
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
      setChainActive(s.refs.chain, 5);
      if (ctx.reduced) return;
      connectorPacket(s, ctx, 'down');
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: 0.3 }, { opacity: 1 }],
        { duration: 800, delay: 1000, fill: 'both', easing: 'ease-out' }
      ));
      pulsePod(s.refs.podGroup, ctx, 1000);
    },
  },
];

export const init = makeInit(Scene, STEPS);
