import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, connectorPacket, topPacket, segmentPacket, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT } from '../lib/scheme-kit.js';


class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Container lifecycle hooks: postStart races the ENTRYPOINT, preStop runs synchronously before SIGTERM',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubelet = box({ x: 320, y: 40, w: 220, h: 80, label: 'Kubelet', sublabel: 'lifecycle handler', cat: 'control' });
    const runtime = box({ x: 580, y: 40, w: 220, h: 80, label: 'Runtime', sublabel: 'CRI runc / Containerd', cat: 'control' });

    root.appendChild(arrow({ x1: 540, y1: 65, x2: 580, y2: 65, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 580, y1: 95, x2: 540, y2: 95, dim: true, dashed: true, color: 'control' }));

    // Single wire label centered below the top row, set per step via setWire.
    const wireReq = text({ class: 'scheme-label code dim', x: 560, y: 148, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const postStartChip   = valChip({ x: 830, y: 220, w: 350, h: 32, name: 'postStart hook',  value: 'declared' });
    const entrypointChip  = valChip({ x: 830, y: 262, w: 350, h: 32, name: 'ENTRYPOINT',       value: 'not started' });
    const preStopChip     = valChip({ x: 830, y: 304, w: 350, h: 32, name: 'preStop hook',     value: 'declared' });
    const stateChip       = valChip({ x: 830, y: 346, w: 350, h: 32, name: 'container state',  value: 'Waiting' });
    const graceChip       = valChip({ x: 830, y: 388, w: 350, h: 32, name: 'grace remaining',  value: '30s' });
    [postStartChip, entrypointChip, preStopChip, stateChip, graceChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
      items: [
        '1. declared  ·  spec defines postStart + preStop',
        '2. created   ·  runtime starts the ENTRYPOINT',
        '3. postStart ·  hook races the ENTRYPOINT, no order',
        '4. running   ·  both settled, container serves',
        '5. preStop   ·  delete fires hook before any signal',
        '6. sigterm   ·  SIGTERM, then SIGKILL at grace=0',
      ],
      cat: 'control',
    });

    const nodeEl = node({ x: 320, y: 480, w: 860, h: 140, label: 'Node-1' });

    const podShell = pod({ x: 520, y: 500, w: 460, h: 110, label: 'Pod', sublabel: '', containers: 0, cat: 'workloads' });
    const podShellRect = podShell.querySelector('.scheme-pod-rect');
    if (podShellRect) podShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const containerBox = box({ x: 600, y: 530, w: 300, h: 64, label: 'app', sublabel: 'terminationGracePeriod: 30s', cat: 'workloads' });

    const podGroup = g({ id: 'podGroup' });
    podGroup.appendChild(podShell);
    podGroup.appendChild(containerBox);

    const connector = pathArrow({
      points: [[320, 80], [280, 80], [280, 550], [320, 550]],
      dim: true, dashed: true, color: 'control',
    });
    root.appendChild(connector);

    // Packet layer.
    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeEl);
    root.appendChild(podGroup);
    root.appendChild(kubelet);
    root.appendChild(runtime);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubelet, runtime, chain, nodeEl, podGroup, podShell, containerBox, connector,
      postStartChip, entrypointChip, preStopChip, stateChip, graceChip,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['kubelet','runtime','postStartChip','entrypointChip','preStopChip','stateChip','graceChip','podShell','containerBox'],
    [s.refs.podGroup]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Pod with two lifecycle hooks defined in its spec, sitting before Kubelet has touched it. This card walks through the start-up race between postStart and the ENTRYPOINT, then the graceful termination handled by preStop before SIGTERM.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podGroup.style.opacity = '0.4';
      setVal(s.refs.postStartChip, 'declared');
      setVal(s.refs.entrypointChip, 'not started');
      setVal(s.refs.preStopChip, 'declared');
      setVal(s.refs.stateChip, 'Waiting');
      setVal(s.refs.graceChip, '30s');
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'declared',
    duration: 1900,
    narration: 'The Pod spec carries two per-container handlers. lifecycle.postStart will fire concurrently with the ENTRYPOINT the moment the container is created, with no ordering guarantee between the two. lifecycle.preStop will run synchronously on delete, before any signal, and eats into terminationGracePeriodSeconds while it runs. Each handler is one of exec (a command inside the container), httpGet (an HTTP request Kubelet issues against the Pod IP), or sleep (a fixed-duration pause, GA in 1.34). A tcpSocket field also exists in the API but is not honored for lifecycle hooks.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podGroup.style.opacity = '0.4';
      setVal(s.refs.postStartChip, 'declared');
      setVal(s.refs.entrypointChip, 'not started');
      setVal(s.refs.preStopChip, 'declared');
      setVal(s.refs.stateChip, 'Waiting');
      setVal(s.refs.graceChip, '30s');
      setWire(s, 'req', 'spec.lifecycle.postStart + preStop declared');
      s.refs.postStartChip.classList.add('highlight');
      s.refs.preStopChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      // Declaration only, nothing travels. The two declared hooks light up via the
      // static highlight outline; pulsing is reserved for the Pod blocks, so no chip flash.
    },
  },
  {
    id: 'created',
    duration: 1800,
    narration: 'The runtime creates the container from the image and starts the ENTRYPOINT process as PID 1. The Kubelet has issued the CreateContainer and StartContainer calls over the CRI socket, so the container has just been started and is moving into the Running state.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podGroup.style.opacity = '1';
      setVal(s.refs.entrypointChip, 'starting (PID 1)');
      setVal(s.refs.stateChip, 'Running');
      setWire(s, 'req', 'CRI CreateContainer + StartContainer · OK');
      s.refs.kubelet.classList.add('highlight');
      s.refs.runtime.classList.add('highlight');
      s.refs.entrypointChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      // The CRI calls hop to the runtime, the OK hops back, and the container
      // materializes once the start call lands.
      const req = topPacket(s, ctx);
      segmentPacket(s, ctx, { from: [580, 95], to: [540, 95], delay: req.arrivalMs + BEAT.afterHop });
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: 0.4 }, { opacity: 1 }],
        { duration: FADE.in, delay: req.arrivalMs, fill: 'both', easing: 'ease-out' }
      ));
    },
  },
  {
    id: 'poststart',
    duration: 2100,
    narration: 'Kubelet fires the postStart hook the moment the container is created, concurrently with the ENTRYPOINT. There is no guarantee which one finishes first. Exec handlers run inside the container over CRI ExecSync, httpGet handlers are issued by Kubelet directly against the Pod IP. If the handler exits non-zero or times out, Kubelet kills the container (subject to the Pod restartPolicy).',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podGroup.style.opacity = '1';
      setVal(s.refs.postStartChip, 'exec running (racing)');
      setVal(s.refs.entrypointChip, 'running (racing)');
      setVal(s.refs.stateChip, 'Running');
      setWire(s, 'req', 'CRI ExecSync · postStart · Exit 0');
      s.refs.kubelet.classList.add('highlight');
      s.refs.runtime.classList.add('highlight');
      s.refs.postStartChip.classList.add('highlight');
      s.refs.entrypointChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
      const req = topPacket(s, ctx);
      segmentPacket(s, ctx, { from: [580, 95], to: [540, 95], delay: req.arrivalMs + BEAT.afterHop });
    },
  },
  {
    id: 'running',
    duration: 2000,
    narration: 'Both the ENTRYPOINT and the postStart handler have settled. The container reports Running and the postStart chip flips to completed. Kubelet keeps watching via PLEG and running readiness/liveness probes, the runtime keeps the process alive, and the Pod takes traffic through its Service endpoints once Ready.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podGroup.style.opacity = '1';
      setVal(s.refs.postStartChip, 'completed (exit 0)');
      setVal(s.refs.entrypointChip, 'running');
      setVal(s.refs.stateChip, 'Running');
      setWire(s, 'req', 'PLEG watch · Readiness probe OK · Serving traffic');
      s.refs.kubelet.classList.add('highlight');
      s.refs.runtime.classList.add('highlight');
      s.refs.postStartChip.classList.add('highlight');
      s.refs.entrypointChip.classList.add('highlight');
      s.refs.stateChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) return;
      const req = topPacket(s, ctx);
      segmentPacket(s, ctx, { from: [580, 95], to: [540, 95], delay: req.arrivalMs + BEAT.afterHop });
    },
  },
  {
    id: 'prestop',
    duration: 3800,
    narration: 'A delete arrives and the container is about to be stopped. Before sending any signal, Kubelet runs the preStop hook synchronously and waits for it to return. The ENTRYPOINT is still Running here. The hook executes inside the terminationGracePeriodSeconds budget, so its runtime is subtracted from the 30s window.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podGroup.style.opacity = '1';
      setVal(s.refs.preStopChip, 'exec running (sync)');
      setVal(s.refs.stateChip, 'Running');
      setVal(s.refs.graceChip, '22s');
      setWire(s, 'req', 'CRI ExecSync · preStop · Sync');
      s.refs.kubelet.classList.add('highlight');
      s.refs.runtime.classList.add('highlight');
      s.refs.preStopChip.classList.add('highlight');
      s.refs.graceChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) return;
      // ExecSync hops to the runtime and acks back; once that ack lands at the
      // kubelet the exec order travels down to the Pod, which pulses as the hook
      // starts running inside it.
      const req = topPacket(s, ctx);
      const ack = segmentPacket(s, ctx, { from: [580, 95], to: [540, 95], delay: req.arrivalMs + BEAT.afterHop });
      const exec = connectorPacket(s, ctx, { delay: ack.arrivalMs + BEAT.afterHop });
      pulsePod(s.refs.podGroup, ctx, exec.arrivalMs);
    },
  },
  {
    id: 'sigterm',
    duration: 4000,
    narration: 'Once preStop returns, Kubelet asks the runtime to stop the container via CRI StopContainer. The runtime delivers SIGTERM to the ENTRYPOINT process inside the Pod. The grace timer keeps counting down from where preStop left off. If the process is still alive when it reaches 0, the runtime escalates to SIGKILL. The container then exits and the Pod object is removed from the Api.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.preStopChip, 'completed (exit 0)');
      setVal(s.refs.entrypointChip, 'received SIGTERM');
      setVal(s.refs.stateChip, 'Terminated');
      setVal(s.refs.graceChip, '0s · SIGKILL');
      setWire(s, 'req', 'CRI StopContainer · SIGTERM · ACK');
      s.refs.kubelet.classList.add('highlight');
      s.refs.runtime.classList.add('highlight');
      s.refs.stateChip.classList.add('highlight');
      s.refs.graceChip.classList.add('highlight');
      // Pin final state inline so cancel between steps does not flash to default.
      s.refs.podGroup.style.opacity = '0.3';
      setChainActive(s.refs.chain, 5);
      if (ctx.reduced) return;
      // StopContainer hops to the runtime and acks back; once that ack lands at
      // the kubelet the SIGTERM order travels down to the Pod, which pulses then
      // dims out as the process exits.
      const req = topPacket(s, ctx);
      const ack = segmentPacket(s, ctx, { from: [580, 95], to: [540, 95], delay: req.arrivalMs + BEAT.afterHop });
      const stop = connectorPacket(s, ctx, { delay: ack.arrivalMs + BEAT.afterHop });
      pulsePod(s.refs.podGroup, ctx, stop.arrivalMs);
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: 1 }, { opacity: 0.3 }],
        { duration: FADE.out, delay: stop.arrivalMs, fill: 'both', easing: 'ease-in' }
      ));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
