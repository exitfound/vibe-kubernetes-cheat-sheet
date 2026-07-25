import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, topPacket, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT } from '../lib/workloads-kit.js';


class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Pod restartPolicy: Always, OnFailure and Never decide whether Kubelet restarts a container after it exits',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const apiserver = box({ x: 320, y: 40, w: 220, h: 80, label: 'Api', sublabel: 'stores spec.restartPolicy', role: 'cluster' });
    const kubelet   = box({ x: 580, y: 40, w: 220, h: 80, label: 'Kubelet',   sublabel: 'restart enforcer',        role: 'cluster' });

    root.appendChild(arrow({ x1: 540, y1: 65, x2: 580, y2: 65, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: 580, y1: 95, x2: 540, y2: 95, dim: true, dashed: true, role: 'cluster' }));

    const wireReq = text({ class: 'scheme-label code dim', x: 560, y: 148, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    // State chips on the right: one per Pod plus a focus line.
    const pod1Chip  = valChip({ x: 830, y: 220, w: 350, h: 32, name: 'Pod A · Always',    value: 'Running', role: 'workloads' });
    const pod2Chip  = valChip({ x: 830, y: 262, w: 350, h: 32, name: 'Pod B · OnFailure', value: 'Running', role: 'workloads' });
    const pod3Chip  = valChip({ x: 830, y: 304, w: 350, h: 32, name: 'Pod C · Never',     value: 'Running', role: 'workloads' });
    const focusChip = valChip({ x: 830, y: 346, w: 350, h: 32, name: 'focus',             value: 'none', role: 'workloads' });
    [pod1Chip, pod2Chip, pod3Chip, focusChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
      items: [
        '1. policy    ·  Pod-level, all containers, default Always',
        '2. exit 0    ·  Always restarts, OnFailure and Never do not',
        '3. exit != 0 ·  Always and OnFailure restart, Never does not',
        '4. backoff   ·  Always and OnFailure share the restart backoff',
        '5. fit       ·  Always for services, OnFailure / Never for Jobs',
      ],
      role: 'cluster',
    });

    const nodeEl = node({ x: 320, y: 480, w: 860, h: 140, label: 'Node-1' });

    const POD_NAMES = ['Pod A', 'Pod B', 'Pod C'];
    const POD_SUBS  = ['restartPolicy: Always', 'restartPolicy: OnFailure', 'restartPolicy: Never'];
    const POD_XS    = [386, 642, 898];
    const podBoxes = [];
    const podWrappers = POD_XS.map((px, i) => {
      const shell = pod({ x: px, y: 497, w: 216, h: 106, label: POD_NAMES[i], sublabel: '', containers: 0, role: 'workloads' });
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: px + 10, y: 525, w: 196, h: 52, label: 'app', sublabel: POD_SUBS[i], role: 'workloads' });

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
    root.appendChild(kubelet);
    root.appendChild(apiserver);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      apiserver, kubelet, chain, nodeEl, connector,
      pod1Chip, pod2Chip, pod3Chip, focusChip,
      pod1, pod2, pod3, pod1Box, pod2Box, pod3Box,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['apiserver','kubelet','pod1Chip','pod2Chip','pod3Chip','focusChip','pod1Box','pod2Box','pod3Box'],
    [s.refs.pod1, s.refs.pod2, s.refs.pod3]);
}
function resetPodOpacity(s) {
  ['pod1','pod2','pod3'].forEach(k => { s.refs[k].style.opacity = '1'; });
}
// Set all three Pod chips plus the focus line in one call.
function setChips(s, { a, b, c, focus }) {
  setVal(s.refs.pod1Chip, a);
  setVal(s.refs.pod2Chip, b);
  setVal(s.refs.pod3Chip, c);
  setVal(s.refs.focusChip, focus);
}

function bouncePacket(s, ctx, { delay = 0 } = {}) {
  // Request up to the apiserver, then the response hop back (y=95) once it returns.
  const req = topPacket(s, ctx, { delay, role: 'workloads' });
  return topPacket(s, ctx, { from: 580, to: 540, y: 95, delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
}

// The container exit is an in-place event with no packet to anchor to: the Pods
// react this many ms into the step (pulse, plus a fade for the ones that stop).
const REACT_MS = 400;

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Three Pods run on Node-1, each declaring a different spec.restartPolicy: Pod A is Always, Pod B is OnFailure, Pod C is Never. The policy stays inert while a container runs. Kubelet consults it only at the moment a container process exits.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setChips(s, { a: 'Running', b: 'Running', c: 'Running', focus: 'none' });
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'policy',
    duration: 2000,
    narration: 'restartPolicy is a Pod-level field. A single value covers every main container in the Pod and is immutable once the Pod is created. The default is Always. Init containers may override it with their own restartPolicy (the native sidecar pattern, GA since 1.29). Kubelet reads the field from the Pod spec and applies it each time a container terminates.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setChips(s, { a: 'Running', b: 'Running', c: 'Running', focus: 'Pod-level, default Always' });
      setWire(s, 'req', 'Watch · spec.restartPolicy delivered · Status reported back');
      s.refs.apiserver.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) return;
      bouncePacket(s, ctx);
    },
  },
  {
    id: 'exit-zero',
    duration: 2400,
    narration: 'Scenario: a container exits 0, a clean success. Pod A (Always) restarts the container and stays Running. Pod B (OnFailure) does not restart a successful exit, so once the container is done the Pod phase becomes Succeeded. Pod C (Never) does not restart anything either and likewise ends Succeeded.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setChips(s, { a: 'Running (restarted)', b: 'Succeeded', c: 'Succeeded', focus: 'exit 0: only Always restarts' });
      setWire(s, 'req', 'Container exit 0 · Restart only if Always');
      s.refs.apiserver.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      s.refs.pod1Chip.classList.add('highlight');
      s.refs.pod2Chip.classList.add('highlight');
      s.refs.pod3Chip.classList.add('highlight');
      // Pin final opacities: A is back to Running, B and C are terminal.
      s.refs.pod1.style.opacity = '1';
      s.refs.pod2.style.opacity = '0.3';
      s.refs.pod3.style.opacity = '0.3';
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      bouncePacket(s, ctx);
      ctx.register(s.refs.pod2.animate(
        [{ opacity: 1 }, { opacity: 0.3 }],
        { duration: FADE.out, delay: REACT_MS, fill: 'both', easing: 'ease-in' }
      ));
      ctx.register(s.refs.pod3.animate(
        [{ opacity: 1 }, { opacity: 0.3 }],
        { duration: FADE.out, delay: REACT_MS, fill: 'both', easing: 'ease-in' }
      ));
      pulsePod(s.refs.pod1, ctx, REACT_MS);
      pulsePod(s.refs.pod2, ctx, REACT_MS);
      pulsePod(s.refs.pod3, ctx, REACT_MS);
    },
  },
  {
    id: 'exit-nonzero',
    duration: 2400,
    narration: 'Scenario: a container exits with a non-zero code, a failure. Pod A (Always) restarts it. Pod B (OnFailure) restarts it too, that is exactly what OnFailure means. Pod C (Never) restarts nothing, so a single failure drives the Pod phase to Failed.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setChips(s, { a: 'Running (restarted)', b: 'Running (restarted)', c: 'Failed', focus: 'exit != 0: only Never does not restart' });
      setWire(s, 'req', 'Exit != 0 · Restart if Always or OnFailure');
      s.refs.apiserver.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      s.refs.pod1Chip.classList.add('highlight');
      s.refs.pod2Chip.classList.add('highlight');
      s.refs.pod3Chip.classList.add('highlight');
      // Pin: A and B are restarted back to Running, C is terminal Failed.
      s.refs.pod1.style.opacity = '1';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '0.3';
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
      bouncePacket(s, ctx);
      ctx.register(s.refs.pod3.animate(
        [{ opacity: 1 }, { opacity: 0.3 }],
        { duration: FADE.out, delay: REACT_MS, fill: 'both', easing: 'ease-in' }
      ));
      pulsePod(s.refs.pod1, ctx, REACT_MS);
      pulsePod(s.refs.pod2, ctx, REACT_MS);
      pulsePod(s.refs.pod3, ctx, REACT_MS);
    },
  },
  {
    id: 'backoff',
    duration: 2400,
    narration: 'Every restart, whether driven by Always or by OnFailure, goes through the same exponential backoff. The delay starts at 10s and doubles on each subsequent restart (10s, 20s, 40s, 80s, 160s, capped at 300s). The container sits in Waiting with reason=CrashLoopBackOff during the wait, and the timer resets after the container has run successfully for 10 minutes. A Never Pod never restarts at all, so it cannot enter this loop.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setChips(s, { a: 'Waiting (backoff)', b: 'Waiting (backoff)', c: 'never enters backoff', focus: 'backoff 10s..300s, shared' });
      setWire(s, 'req', 'Restart backoff: 10s → 20s → ... → 300s cap');
      s.refs.apiserver.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      s.refs.pod1Chip.classList.add('highlight');
      s.refs.pod2Chip.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      // Pin: A and B sit at the mid backoff opacity, C runs normally.
      s.refs.pod1.style.opacity = '0.5';
      s.refs.pod2.style.opacity = '0.5';
      s.refs.pod3.style.opacity = '1';
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) return;
      bouncePacket(s, ctx);
      ctx.register(s.refs.pod1.animate(
        [{ opacity: 1 }, { opacity: 0.5 }],
        { duration: FADE.out, delay: REACT_MS, fill: 'both', easing: 'ease-in' }
      ));
      ctx.register(s.refs.pod2.animate(
        [{ opacity: 1 }, { opacity: 0.5 }],
        { duration: FADE.out, delay: REACT_MS, fill: 'both', easing: 'ease-in' }
      ));
      pulsePod(s.refs.pod1, ctx, REACT_MS);
      pulsePod(s.refs.pod2, ctx, REACT_MS);
      pulsePod(s.refs.pod3, ctx, REACT_MS);
    },
  },
  {
    id: 'fit',
    duration: 2200,
    narration: 'Long-running controllers (Deployment, ReplicaSet, DaemonSet, StatefulSet) only allow restartPolicy=Always, so their Pods always restart. Job uses OnFailure or Never to let its Pods reach a terminal Succeeded or Failed phase instead of looping forever.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { a: 'long-running services', b: 'Job (OnFailure)', c: 'Job (Never)', focus: 'long-running vs run-to-completion' });
      setWire(s, 'req', 'Always: long-running · OnFailure / Never: Jobs');
      s.refs.pod1Chip.classList.add('highlight');
      s.refs.pod2Chip.classList.add('highlight');
      s.refs.pod3Chip.classList.add('highlight');
      s.refs.pod1.style.opacity = '1';
      s.refs.pod2.style.opacity = '0.45';
      s.refs.pod3.style.opacity = '0.45';
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) return;
      ctx.register(s.refs.pod2.animate(
        [{ opacity: 1 }, { opacity: 0.45 }],
        { duration: FADE.out, delay: REACT_MS, fill: 'both', easing: 'ease-in' }
      ));
      ctx.register(s.refs.pod3.animate(
        [{ opacity: 1 }, { opacity: 0.45 }],
        { duration: FADE.out, delay: REACT_MS, fill: 'both', easing: 'ease-in' }
      ));
      pulsePod(s.refs.pod1, ctx, REACT_MS);
      pulsePod(s.refs.pod2, ctx, REACT_MS);
      pulsePod(s.refs.pod3, ctx, REACT_MS);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
