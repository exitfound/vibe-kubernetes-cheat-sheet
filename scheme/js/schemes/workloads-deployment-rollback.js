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
      'aria-label': 'Deployment rollback and revision history: a bad rollout stalls past progressDeadlineSeconds, rollout undo scales the previous ReplicaSet back up',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const controller = box({ x: 320, y: 40, w: 220, h: 80, label: 'Deployment', sublabel: 'owns RS revisions', role: 'cluster' });
    const apiserver  = box({ x: 580, y: 40, w: 220, h: 80, label: 'Api',  sublabel: 'PATCH .scale + Pod CRUD', role: 'cluster' });

    root.appendChild(arrow({ x1: 540, y1: 65, x2: 580, y2: 65, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: 580, y1: 95, x2: 540, y2: 95, dim: true, dashed: true, role: 'cluster' }));

    const wireReq = text({ class: 'scheme-label code dim', x: 560, y: 148, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const rs1Chip  = valChip({ x: 830, y: 40,  w: 350, h: 32, name: 'RS-v1 (rev 1) · Ready', value: '3 / 3', role: 'workloads' });
    const rs2Chip  = valChip({ x: 830, y: 82,  w: 350, h: 32, name: 'RS-v2 (rev 2) · Ready', value: '0 / 0', role: 'workloads' });
    const condChip = valChip({ x: 830, y: 124, w: 350, h: 32, name: 'condition', value: 'Available=True', role: 'workloads' });
    const revChip  = valChip({ x: 830, y: 166, w: 350, h: 32, name: 'rollout',   value: 'stable @ rev 1', role: 'workloads' });
    [rs1Chip, rs2Chip, condChip, revChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
      items: [
        '1. stable   ·  rev 1, RS-v1 owns 3 Ready Pods',
        '2. rollout  ·  set image v2, RS-v2 surges (rev 2)',
        '3. bad      ·  v2 crashes, readiness never passes',
        '4. stuck    ·  progressDeadline, Progressing=False',
        '5. undo     ·  rollout undo, RS-v1 up, RS-v2 to 0',
        '6. restored ·  rev 3 copies rev 1, Available=True',
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
      rs1Chip, rs2Chip, condChip, revChip,
      pod1, pod2, pod3, pod1Box, pod2Box, pod3Box,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['controller','apiserver','rs1Chip','rs2Chip','condChip','revChip','pod1Box','pod2Box','pod3Box'],
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
    id: 'stable',
    duration: 1500,
    narration: 'A Deployment web sits at revision 1. ReplicaSet RS-v1 owns three Ready Pods on image v1.0. When the template changes the old ReplicaSets are not deleted, they are retained as revision history up to revisionHistoryLimit (default 10), so every past template stays available for a one-step rollback.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVersions(s, 'v1.0', 'v1.0', 'v1.0');
      setVal(s.refs.rs1Chip, '3 / 3');
      setVal(s.refs.rs2Chip, '0 / 0');
      setVal(s.refs.condChip, 'Available=True');
      setVal(s.refs.revChip, 'stable @ rev 1');
      setChainActive(s.refs.chain, 0);
    },
  },
  {
    id: 'rollout',
    duration: 2600,
    narration: 'Kubectl set image deployment/web app=v2.0 PATCHes the Pod template. The new template hash differs, so the Deployment controller creates ReplicaSet RS-v2 as revision 2 and starts the rollout, surging a v2 Pod under the RollingUpdate strategy while the old Pods keep serving.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVersions(s, 'v2.0 · starting', 'v1.0', 'v1.0');
      setVal(s.refs.rs1Chip, '3 / 3');
      setVal(s.refs.rs2Chip, '0 / 1');
      setVal(s.refs.condChip, 'Progressing=True');
      setVal(s.refs.revChip, 'rolling out rev 2');
      setWire(s, 'req', 'PATCH .spec.template · create RS-v2 (rev 2)');
      s.refs.controller.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.rs2Chip.classList.add('highlight');
      s.refs.revChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) { s.refs.pod1Box.classList.add('highlight'); return; }
      // The PATCH hits the Api, then the surge order travels down the
      // connector and the surging Pod pulses on arrival.
      const req = topPacket(s, ctx, { role: 'workloads' });
      const surge = connectorPacket(s, ctx, { delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      pulsePod(s.refs.pod1, ctx, surge.arrivalMs);
    },
  },
  {
    id: 'bad',
    duration: 2400,
    narration: 'The v2 Pod is broken. Its readinessProbe never passes, so it churns in CrashLoopBackOff and never reports Ready. Because maxUnavailable kept the old Pods alive, the Service still has healthy v1 backends, but RS-v2 cannot reach its target and the rollout makes no progress.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVersions(s, 'v2.0 · CrashLoopBackOff', 'v1.0', 'v1.0');
      setVal(s.refs.rs1Chip, '3 / 3');
      setVal(s.refs.rs2Chip, '0 / 1 (crashing)');
      setVal(s.refs.condChip, 'Progressing=True');
      setVal(s.refs.revChip, 'rev 2 never Ready');
      setWire(s, 'req', 'readinessProbe fail · v2 not Ready');
      s.refs.apiserver.classList.add('highlight');
      s.refs.rs2Chip.classList.add('highlight');
      // Pin final opacities: the broken v2 Pod dims, the v1 Pods stay up.
      s.refs.pod1.style.opacity = '0.4';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
      // The failed status reaches the controller over the connector. The v2 Pod
      // pulses then dims to show it is crash-looping, the v1 Pods are untouched.
      const status = connectorPacket(s, ctx, { role: 'workloads' });
      pulsePod(s.refs.pod1, ctx, status.arrivalMs);
      ctx.register(s.refs.pod1.animate([{ opacity: 1 }, { opacity: 0.4 }], { duration: FADE.out, delay: status.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'stuck',
    duration: 2300,
    narration: 'After progressDeadlineSeconds (600 by default), the Deployment sets the condition Progressing=False with reason ProgressDeadlineExceeded. The rollout is wedged: RS-v2 cannot reach its count, while RS-v1 keeps all three v1.0 Pods serving, so traffic stays healthy on the old version until someone steps in.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVersions(s, 'v2.0 · stuck', 'v1.0', 'v1.0');
      setVal(s.refs.rs1Chip, '3 / 3');
      setVal(s.refs.rs2Chip, '0 / 1 stuck');
      setVal(s.refs.condChip, 'Progressing=False');
      setVal(s.refs.revChip, 'ProgressDeadlineExceeded');
      setWire(s, 'req', 'progressDeadlineSeconds elapsed · rollout halts');
      s.refs.condChip.classList.add('highlight');
      s.refs.revChip.classList.add('highlight');
      // The broken v2 Pod stays dim, the v1 Pods keep serving.
      s.refs.pod1.style.opacity = '0.4';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      setChainActive(s.refs.chain, 3);
      // The deadline lapses with nothing moving and the Pods are untouched: the wedged
      // conditions show via the static highlight only (no chip pulse).
    },
  },
  {
    id: 'undo',
    duration: 2600,
    narration: 'Kubectl rollout undo deployment/web rolls back to the previous good revision. The controller scales RS-v1 back up to three and scales RS-v2 down to zero. The broken v2 Pod is deleted and the v1 Pod is recreated in its slot, so all three serving Pods are on v1.0 again.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVersions(s, 'v1.0 · restored', 'v1.0', 'v1.0');
      setVal(s.refs.rs1Chip, '3 / 3');
      setVal(s.refs.rs2Chip, '0 / 0');
      setVal(s.refs.condChip, 'Progressing=True');
      setVal(s.refs.revChip, 'undo → rev 1 template');
      setWire(s, 'req', 'rollout undo · scale RS-v1 up · scale RS-v2 to 0');
      s.refs.controller.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.rs1Chip.classList.add('highlight');
      s.refs.revChip.classList.add('highlight');
      // Pin final state: the slot is a healthy v1 Pod again.
      s.refs.pod1.style.opacity = '1';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) { s.refs.pod1Box.classList.add('highlight'); return; }
      const req = topPacket(s, ctx, { role: 'workloads' });
      // The undo reaches the node. The recreated v1 Pod lifts from the dim broken
      // state back to full opacity and pulses on arrival.
      const undo = connectorPacket(s, ctx, { delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      ctx.register(s.refs.pod1.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: FADE.in, delay: undo.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod1, ctx, undo.arrivalMs);
    },
  },
  {
    id: 'restored',
    duration: 2300,
    narration: 'The rollback is itself recorded as a new revision 3 whose template equals revision 1. Undo does not erase revision 2, it stays in history, and revisionHistoryLimit caps how many old ReplicaSets are kept. kubectl rollout history lists all three revisions, and the Deployment reports Available=True again.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVersions(s, 'v1.0', 'v1.0', 'v1.0');
      setVal(s.refs.rs1Chip, '3 / 3 (now rev 3)');
      setVal(s.refs.rs2Chip, '0 / 0 (retained)');
      setVal(s.refs.condChip, 'Available=True');
      setVal(s.refs.revChip, 'restored @ rev 3');
      s.refs.condChip.classList.add('highlight');
      s.refs.revChip.classList.add('highlight');
      setChainActive(s.refs.chain, 5);
      if (ctx.reduced) { ['pod1Box','pod2Box','pod3Box'].forEach(k => s.refs[k].classList.add('highlight')); return; }
      // Rolled back and healthy: the three v1 Pods pulse together (the pulse fades).
      pulsePod(s.refs.pod1, ctx, 0);
      pulsePod(s.refs.pod2, ctx, 0);
      pulsePod(s.refs.pod3, ctx, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
