import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, connectorPacket, topPacket, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT } from '../lib/workloads-kit.js';

// valChip / setVal are imported from ../lib/workloads-kit.js

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'StatefulSet ordered rollout: pods start one at a time in ordinal order, each gets a sticky hostname and PVC',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const controller = box({ x: 320, y: 40, w: 220, h: 80, label: 'StatefulSet', sublabel: 'serial scale-up', role: 'cluster' });
    const apiserver  = box({ x: 580, y: 40, w: 220, h: 80, label: 'Api',       sublabel: 'PVC + Pod CRUD',     role: 'cluster' });
    const svc        = box({ x: 840, y: 40, w: 220, h: 80, label: 'Service web',     sublabel: 'clusterIP=None (headless)', role: 'cluster' });

    root.appendChild(arrow({ x1: 540, y1: 65, x2: 580, y2: 65, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: 580, y1: 95, x2: 540, y2: 95, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: 800, y1: 80, x2: 840, y2: 80, dim: true, dashed: true, role: 'cluster' }));

    const wireReq = text({ class: 'scheme-label code dim', x: 560, y: 148, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    const wireSvc = text({ class: 'scheme-label code dim', x: 820, y: 148, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    [wireReq, wireSvc].forEach(t => root.appendChild(t));

    const web0Chip = valChip({ x: 830, y: 220, w: 350, h: 32, name: 'web-0',  value: 'pending', role: 'workloads' });
    const web1Chip = valChip({ x: 830, y: 262, w: 350, h: 32, name: 'web-1',  value: 'not created', role: 'workloads' });
    const web2Chip = valChip({ x: 830, y: 304, w: 350, h: 32, name: 'web-2',  value: 'not created', role: 'workloads' });
    const focusChip= valChip({ x: 830, y: 346, w: 350, h: 32, name: 'focus',  value: 'none', role: 'workloads' });
    [web0Chip, web1Chip, web2Chip, focusChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
      items: [
        '1. spec       ·  replicas=3, volumeClaimTemplate: data',
        '2. ordinal 0  ·  PVC data-web-0 bound, web-0 created',
        '3. ordering   ·  ordinal N+1 blocked until N is Ready',
        '4. ordinal 1  ·  PVC data-web-1, web-1 after web-0 Ready',
        '5. ordinal 2  ·  PVC data-web-2, web-2 after web-1 Ready',
      ],
      role: 'cluster',
    });

    const nodeEl = node({ x: 320, y: 480, w: 860, h: 140, label: 'Node-1' });

    const POD_NAMES = ['web-0', 'web-1', 'web-2'];
    const POD_PVCS  = ['data-web-0', 'data-web-1', 'data-web-2'];
    const POD_XS    = [386, 642, 898];
    const podBoxes = [];
    const podWrappers = POD_XS.map((px, i) => {
      const shell = pod({ x: px, y: 497, w: 216, h: 106, label: POD_NAMES[i], sublabel: '', containers: 0, role: 'workloads' });
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: px + 10, y: 525, w: 196, h: 52, label: 'app', sublabel: 'pvc: ' + POD_PVCS[i], role: 'workloads' });

      const wrap = g({ id: `pod${i}` });
      wrap.style.opacity = '0';
      wrap.appendChild(shell);
      wrap.appendChild(innerBox);
      podBoxes.push(innerBox);
      return wrap;
    });
    const [pod0, pod1, pod2] = podWrappers;
    const [pod0Box, pod1Box, pod2Box] = podBoxes;

    const connector = pathArrow({
      points: [[320, 80], [280, 80], [280, 550], [320, 550]],
      dim: true, dashed: true, role: 'cluster',
    });
    root.appendChild(connector);

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeEl);
    [pod0, pod1, pod2].forEach(p => root.appendChild(p));
    root.appendChild(svc);
    root.appendChild(apiserver);
    root.appendChild(controller);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      controller, apiserver, svc, chain, nodeEl, connector,
      web0Chip, web1Chip, web2Chip, focusChip,
      pod0, pod1, pod2, pod0Box, pod1Box, pod2Box,
      packetLayer,
      wires: { req: wireReq, svc: wireSvc },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['controller','apiserver','svc','web0Chip','web1Chip','web2Chip','focusChip','pod0Box','pod1Box','pod2Box'],
    [s.refs.pod0, s.refs.pod1, s.refs.pod2]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A StatefulSet web is declared with replicas=3 and a volumeClaimTemplate named data. No Pods exist yet. The headless Service web (clusterIP=None) will publish per-Pod DNS names web-N.web once Pods are created.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.pod0.style.opacity = '0';
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '0';
      setVal(s.refs.web0Chip, 'pending');
      setVal(s.refs.web1Chip, 'not created');
      setVal(s.refs.web2Chip, 'not created');
      setVal(s.refs.focusChip, 'none');
      setChainActive(s.refs.chain, 0);
    },
  },
  {
    id: 'pod-0',
    duration: 2600,
    narration: 'Controller picks ordinal 0 first. Api creates PVC data-web-0 (sticky to ordinal 0 by name, never recycled), the binding controller pairs it with a fresh PV, then a Pod web-0 is created with spec.hostname=web-0 and spec.subdomain=web. Once readinessProbe passes, web-0 is Ready and gets registered as web-0.web in the headless Service EndpointSlice.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.pod0.style.opacity = '1';
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '0';
      setVal(s.refs.web0Chip, 'Ready · web-0.web');
      setVal(s.refs.web1Chip, 'not created');
      setVal(s.refs.web2Chip, 'not created');
      setVal(s.refs.focusChip, 'PVC data-web-0 bound');
      setWire(s, 'req', 'Create PVC data-web-0 · Create Pod web-0');
      setWire(s, 'svc', 'register web-0.web');
      s.refs.controller.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.svc.classList.add('highlight');
      s.refs.web0Chip.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) { s.refs.pod0Box.classList.add('highlight'); return; }
      // Controller asks Api to create the PVC and Pod, then the Pod is created
      // on the node. web-0 materializes and pulses when the create reaches the node.
      const req = topPacket(s, ctx, { role: 'workloads' });
      const create = connectorPacket(s, ctx, { delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      ctx.register(s.refs.pod0.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod0, ctx, create.arrivalMs);
    },
  },
  {
    id: 'gate',
    duration: 1900,
    narration: 'spec.podManagementPolicy defaults to OrderedReady. The controller will not create web-1 while web-0 is not Ready, will not create web-2 while web-1 is not Ready, and so on. A stuck ordinal stalls every subsequent one. Setting podManagementPolicy=Parallel lifts this gate at the cost of ordering guarantees during scale-up and scale-down.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.pod0.style.opacity = '1';
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '0';
      setVal(s.refs.web0Chip, 'Ready · web-0.web');
      setVal(s.refs.web1Chip, 'waits for web-0 Ready');
      setVal(s.refs.web2Chip, 'waits for web-1 Ready');
      setVal(s.refs.focusChip, 'podManagementPolicy: OrderedReady');
      s.refs.controller.classList.add('highlight');
      s.refs.web1Chip.classList.add('highlight');
      s.refs.web2Chip.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      // The gate is pure controller logic, nothing travels and the Pods are untouched:
      // the blocked ordinals show via the static highlight only (no chip pulse).
    },
  },
  {
    id: 'pod-1',
    duration: 2600,
    narration: 'web-0 cleared the gate. Controller creates PVC data-web-1 and Pod web-1 with spec.hostname=web-1, served as DNS web-1.web by the headless Service. Same flow as ordinal 0. Pod web-1 reaches Ready and the headless Service EndpointSlice now lists two backends: web-0.web and web-1.web.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.pod0.style.opacity = '1';
      s.refs.pod1.style.opacity = '1';
      s.refs.pod2.style.opacity = '0';
      setVal(s.refs.web0Chip, 'Ready · web-0.web');
      setVal(s.refs.web1Chip, 'Ready · web-1.web');
      setVal(s.refs.web2Chip, 'not created');
      setVal(s.refs.focusChip, 'PVC data-web-1 bound');
      setWire(s, 'req', 'Create PVC data-web-1 · Create Pod web-1');
      setWire(s, 'svc', 'register web-1.web');
      s.refs.controller.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.svc.classList.add('highlight');
      s.refs.web1Chip.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.pod1Box.classList.add('highlight'); return; }
      // Same create flow as ordinal 0. web-1 materializes and pulses on arrival.
      const req = topPacket(s, ctx, { role: 'workloads' });
      const create = connectorPacket(s, ctx, { delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      ctx.register(s.refs.pod1.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod1, ctx, create.arrivalMs);
    },
  },
  {
    id: 'pod-2',
    duration: 2600,
    narration: 'web-1 reached Ready, the gate unlocks for ordinal 2. PVC data-web-2 is provisioned and Pod web-2 starts with spec.hostname=web-2, served as DNS web-2.web. Once Ready, all three replicas are alive with sticky identities. Termination on scale-down runs in reverse order (web-2 first, then web-1, then web-0).',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.pod0.style.opacity = '1';
      s.refs.pod1.style.opacity = '1';
      s.refs.pod2.style.opacity = '1';
      setVal(s.refs.web0Chip, 'Ready · web-0.web');
      setVal(s.refs.web1Chip, 'Ready · web-1.web');
      setVal(s.refs.web2Chip, 'Ready · web-2.web');
      setVal(s.refs.focusChip, 'all 3 ordinals Ready');
      setWire(s, 'req', 'Create PVC data-web-2 · Create Pod web-2');
      setWire(s, 'svc', 'register web-2.web');
      s.refs.controller.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.svc.classList.add('highlight');
      s.refs.web2Chip.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) { s.refs.pod2Box.classList.add('highlight'); return; }
      // Final ordinal. web-2 materializes and pulses on arrival, all three are Ready.
      const req = topPacket(s, ctx, { role: 'workloads' });
      const create = connectorPacket(s, ctx, { delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      ctx.register(s.refs.pod2.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod2, ctx, create.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
