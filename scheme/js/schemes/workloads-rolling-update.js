import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, pulsePod, connectorPacket, topPacket, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT } from '../lib/workloads-kit.js';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Deployment rolling update: maxSurge surges a new ReplicaSet pod first, maxUnavailable drains an old one once the new is Ready, repeat until converged',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const controller = box({ x: 320, y: 40, w: 220, h: 80, label: 'Deployment', sublabel: 'scales RS-v1, RS-v2', role: 'cluster' });
    const apiserver  = box({ x: 580, y: 40, w: 220, h: 80, label: 'Api',     sublabel: 'PATCH .scale + Pod CRUD', role: 'cluster' });

    root.appendChild(arrow({ x1: 540, y1: 65, x2: 580, y2: 65, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: 580, y1: 95, x2: 540, y2: 95, dim: true, dashed: true, role: 'cluster' }));

    const wireReq = text({ class: 'scheme-label code dim', x: 560, y: 148, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const v1Chip       = valChip({ x: 830, y: 40,  w: 350, h: 32, name: 'RS-v1 (old) · Ready', value: '3 / 3', role: 'workloads' });
    const v2Chip       = valChip({ x: 830, y: 82,  w: 350, h: 32, name: 'RS-v2 (new) · Ready', value: '0 / 0', role: 'workloads' });
    const surgeChip    = valChip({ x: 830, y: 124, w: 350, h: 32, name: 'maxSurge · maxUnavailable', value: '1 · 1', role: 'workloads' });
    const progressChip = valChip({ x: 830, y: 166, w: 350, h: 32, name: 'rollout',  value: 'idle', role: 'workloads' });
    [v1Chip, v2Chip, surgeChip, progressChip].forEach(c => root.appendChild(c));

    // Pipeline chain, 6 stages of the rolling update cycle.
    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
      items: [
        '1. spec      ·  image v1.0 → v2.0 patch',
        '2. surge     ·  create v2 Pod (maxSurge=1)',
        '3. probe     ·  readinessProbe marks Ready',
        '4. drain     ·  terminate v1 Pod (maxUnavailable=1)',
        '5. repeat    ·  surge + drain per old replica',
        '6. converged ·  3 v2 Ready, RS-v1 scaled to 0',
      ],
      role: 'cluster',
    });

    const nodeEl = node({ x: 320, y: 480, w: 860, h: 140, label: 'Node-1' });

    const POD_NAMES = ['web-1', 'web-2', 'web-3'];
    const POD_XS    = [386, 642, 898];
    const podBoxes = [];
    const podWrappers = POD_XS.map((px, i) => {
      const shell = pod({ x: px, y: 497, w: 216, h: 106, label: POD_NAMES[i], sublabel: '', containers: 0, role: 'workloads' });
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: px + 10, y: 525, w: 196, h: 52, label: 'app', sublabel: 'v1.0', role: 'workloads' });

      const wrap = g({ id: `pod${i + 1}` });
      wrap.appendChild(shell);
      wrap.appendChild(innerBox);
      podBoxes.push(innerBox);
      return wrap;
    });
    const [pod1, pod2, pod3] = podWrappers;
    const [pod1Box, pod2Box, pod3Box] = podBoxes;

    const connector = pathArrow({
      points: [[320, 80], [280, 80], [280, 550], [320, 550]],
      dim: true, dashed: true, role: 'cluster',
    });
    root.appendChild(connector);

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeEl);
    [pod1, pod2, pod3].forEach(p => root.appendChild(p));
    root.appendChild(apiserver);
    root.appendChild(controller);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      controller, apiserver, chain, nodeEl, connector,
      v1Chip, v2Chip, surgeChip, progressChip,
      pod1, pod2, pod3, pod1Box, pod2Box, pod3Box,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['controller','apiserver','v1Chip','v2Chip','surgeChip','progressChip','pod1Box','pod2Box','pod3Box'],
    [s.refs.pod1, s.refs.pod2, s.refs.pod3]);
}
function setVersions(s, a, b, c) {
  setBoxSublabel(s.refs.pod1Box, a);
  setBoxSublabel(s.refs.pod2Box, b);
  setBoxSublabel(s.refs.pod3Box, c);
}
function resetPodOpacity(s) {
  ['pod1','pod2','pod3'].forEach(k => { s.refs[k].style.opacity = '1'; });
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Deployment owns a ReplicaSet (RS-v1) at replicas=3, all Pods running image v1.0 and Ready. Strategy is RollingUpdate with maxSurge=1 and maxUnavailable=1, so during a rollout the cluster will hold between 2 and 4 Pods alive while the swap happens.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVersions(s, 'v1.0', 'v1.0', 'v1.0');
      setVal(s.refs.v1Chip, '3 / 3');
      setVal(s.refs.v2Chip, '0 / 0');
      setVal(s.refs.surgeChip, '1 · 1');
      setVal(s.refs.progressChip, 'idle');
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'spec',
    duration: 1900,
    narration: 'Kubectl set image deployment/web app=v2.0 PATCHes .spec.template. The new template hash differs, so the Deployment controller creates ReplicaSet RS-v2 with replicas=0. RS-v1 still owns all 3 live Pods, no churn yet.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVersions(s, 'v1.0', 'v1.0', 'v1.0');
      setVal(s.refs.v1Chip, '3 / 3');
      setVal(s.refs.v2Chip, '0 / 0');
      setVal(s.refs.progressChip, 'spec PATCHed · RS-v2 created');
      setWire(s, 'req', 'PATCH .spec.template · New RS-v2');
      s.refs.controller.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.progressChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) return;
      topPacket(s, ctx, { role: 'workloads' });
    },
  },
  {
    id: 'surge',
    duration: 2600,
    narration: 'maxSurge=1 lets the controller scale RS-v2 from 0 to 1 before any old Pod leaves. A fresh v2.0 Pod is created on Node-1, Kubelet starts the container. Total live Pods is now 4 (3 v1 plus 1 surge), 1 above .spec.replicas.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVersions(s, 'v2.0 · starting', 'v1.0', 'v1.0');
      setVal(s.refs.v1Chip, '3 / 3');
      setVal(s.refs.v2Chip, '0 / 1');
      setVal(s.refs.progressChip, 'surged +1 · 4 Pods alive');
      setWire(s, 'req', 'Scale RS-v2 replicas: 0 → 1');
      s.refs.controller.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.v2Chip.classList.add('highlight');
      s.refs.progressChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) { s.refs.pod1Box.classList.add('highlight'); return; }
      // kubectl-style scale PATCH reaches Api, then the create flows down to the node.
      const patch = topPacket(s, ctx, { role: 'workloads' });
      // New v2 Pod is created in slot web-1: the ball travels down, the Pod pulses on arrival.
      const create = connectorPacket(s, ctx, { delay: patch.arrivalMs + BEAT.afterHop, role: 'workloads' });
      pulsePod(s.refs.pod1, ctx, create.arrivalMs);
    },
  },
  {
    id: 'probe-and-drain',
    duration: 2600,
    narration: 'The new Pod becomes Ready (readinessProbe passes successThreshold times). RS-v2 sees Ready=1. Now maxUnavailable=1 allows scaling RS-v1 from 3 down to 2, the controller picks the oldest Pod and triggers a graceful delete (preStop, then SIGTERM, then grace period).',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVersions(s, 'v2.0 · Ready', 'v1.0', 'terminating');
      setVal(s.refs.v1Chip, '2 / 2');
      setVal(s.refs.v2Chip, '1 / 1');
      setVal(s.refs.progressChip, 'replaced 1/3 · 3 Pods alive');
      setWire(s, 'req', 'Scale RS-v1 replicas: 3 → 2');
      s.refs.apiserver.classList.add('highlight');
      s.refs.v1Chip.classList.add('highlight');
      s.refs.v2Chip.classList.add('highlight');
      s.refs.progressChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) { s.refs.pod3.style.opacity = '0.4'; s.refs.pod1Box.classList.add('highlight'); return; }
      // Scale-down delete travels to the node. On arrival the new v2 Pod (web-1) confirms
      // Ready with a pulse, and the oldest v1 Pod (web-3) begins terminating and fades out.
      const drain = connectorPacket(s, ctx, { delay: BEAT.lead, role: 'workloads' });
      pulsePod(s.refs.pod1, ctx, drain.arrivalMs);
      pulsePod(s.refs.pod3, ctx, drain.arrivalMs);
      ctx.register(s.refs.pod3.animate([{ opacity: 1 }, { opacity: 0.4 }], { duration: FADE.out, delay: drain.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'second-cycle',
    duration: 2600,
    narration: 'Same dance for slot web-2: surge a new v2 Pod, wait for Ready, drain the old v1. The controller does not move to a third replacement until this one is committed, so the rollout proceeds one Pod at a time.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVersions(s, 'v2.0 · Ready', 'v2.0 · Ready', 'terminating');
      setVal(s.refs.v1Chip, '1 / 1');
      setVal(s.refs.v2Chip, '2 / 2');
      setVal(s.refs.progressChip, 'replaced 2/3 · 3 Pods alive');
      setWire(s, 'req', 'Scale RS-v2: 1 → 2 · Scale RS-v1: 2 → 1');
      s.refs.controller.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.v1Chip.classList.add('highlight');
      s.refs.v2Chip.classList.add('highlight');
      s.refs.progressChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      // web-3 is still draining from the previous cycle: hold it dimmed.
      s.refs.pod3.style.opacity = '0.4';
      if (ctx.reduced) { s.refs.pod2Box.classList.add('highlight'); return; }
      // Scale PATCH reaches Api, then the create flows down to slot web-2.
      const patch = topPacket(s, ctx, { role: 'workloads' });
      // New v2 Pod in slot web-2 reaches the node and pulses Ready on arrival.
      const create = connectorPacket(s, ctx, { delay: patch.arrivalMs + BEAT.afterHop, role: 'workloads' });
      pulsePod(s.refs.pod2, ctx, create.arrivalMs);
    },
  },
  {
    id: 'third-cycle',
    duration: 2600,
    narration: 'Last slot web-3: surge final v2 Pod, wait for Ready, drain the last v1. The Deployment status moves to .status.updatedReplicas=3, observedGeneration catches up to .metadata.generation, and the condition Progressing=True is set with reason NewReplicaSetAvailable.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVersions(s, 'v2.0 · Ready', 'v2.0 · Ready', 'v2.0 · Ready');
      setVal(s.refs.v1Chip, '0 / 0');
      setVal(s.refs.v2Chip, '3 / 3');
      setVal(s.refs.progressChip, 'replaced 3/3 · 3 Pods alive');
      setWire(s, 'req', 'Scale RS-v2: 2 → 3 · Scale RS-v1: 1 → 0');
      s.refs.apiserver.classList.add('highlight');
      s.refs.v1Chip.classList.add('highlight');
      s.refs.v2Chip.classList.add('highlight');
      s.refs.progressChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      // web-3 is re-filled as a v2 Pod: it starts dimmed from the prior drain and lifts to full.
      s.refs.pod3.style.opacity = '0.4';
      if (ctx.reduced) { s.refs.pod3.style.opacity = '1'; s.refs.pod3Box.classList.add('highlight'); return; }
      // Final v2 Pod is created in slot web-3: ball travels down, the Pod lifts to full and pulses on arrival.
      const create = connectorPacket(s, ctx, { delay: BEAT.lead, role: 'workloads' });
      ctx.register(s.refs.pod3.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod3, ctx, create.arrivalMs);
    },
  },
  {
    id: 'converged',
    duration: 2200,
    narration: 'RS-v2 owns 3 Ready Pods, RS-v1 sits at replicas=0 but is retained for revisionHistoryLimit (default 10) so kubectl rollout undo can flip back in one PATCH. Deployment condition Available=True, rollout complete.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVersions(s, 'v2.0 · Ready', 'v2.0 · Ready', 'v2.0 · Ready');
      setVal(s.refs.v1Chip, '0 / 0 (retained)');
      setVal(s.refs.v2Chip, '3 / 3');
      setVal(s.refs.progressChip, 'Complete · Available=True');
      s.refs.progressChip.classList.add('highlight');
      setChainActive(s.refs.chain, 5);
      if (ctx.reduced) { ['pod1Box','pod2Box','pod3Box'].forEach(k => s.refs[k].classList.add('highlight')); return; }
      // Rollout converged: all three v2 Pods are Ready, pulse them together (the pulse fades back to the resting outline).
      pulsePod(s.refs.pod1, ctx, 0);
      pulsePod(s.refs.pod2, ctx, 0);
      pulsePod(s.refs.pod3, ctx, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
