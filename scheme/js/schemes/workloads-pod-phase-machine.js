import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, pulsePod, routePacket, makeInit, clearHighlights, clearWires, setWire } from '../lib/workloads-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#workloads-pod-phase-machine


class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Pod lifecycle phases: Kubelet reconciles status.phase through Pending, Running and a terminal Succeeded or Failed, with CrashLoopBackOff sitting inside Running as a container waiting reason',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubelet = box({ x: 320, y: 40, w: 280, h: 80, label: 'Kubelet', sublabel: 'reconciles status.phase', role: 'cluster' });

    // L-connector Kubelet -> Node-1 via the left margin at x=280.
    const connector = pathArrow({
      points: [[320, 80], [280, 80], [280, 550], [320, 550]],
      dim: true, dashed: true, role: 'cluster',
    });
    root.appendChild(connector);

    // Wire label pinned just below the Kubelet box.
    const wireReq = text({ class: 'scheme-label code dim', x: 460, y: 146, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
      items: [
        '1. admit     ·  stored in etcd, no node yet',
        '2. schedule  ·  bound to node, sandbox + image pull',
        '3. start     ·  at least one container started',
        '4. crashloop ·  exit + backoff, waiting reason inside Running',
        '5. recover   ·  restart succeeds, container Running again',
        '6. terminal  ·  all containers exit, Succeeded or Failed',
      ],
      role: 'cluster',
    });

    const phaseChip   = valChip({ x: 830, y: 220, w: 350, h: 32, name: 'status.phase',     value: 'Pending', role: 'workloads' });
    const cStateChip  = valChip({ x: 830, y: 262, w: 350, h: 32, name: 'container state',  value: 'none', role: 'workloads' });
    const restartChip = valChip({ x: 830, y: 304, w: 350, h: 32, name: 'restartCount',     value: '0', role: 'workloads' });
    const policyChip  = valChip({ x: 830, y: 346, w: 350, h: 32, name: 'restartPolicy',    value: 'OnFailure', role: 'workloads' });
    [phaseChip, cStateChip, restartChip, policyChip].forEach(c => root.appendChild(c));

    const nodeEl = node({ x: 320, y: 480, w: 860, h: 140, label: 'Node-1' });

    const podShell = pod({ x: 520, y: 500, w: 460, h: 110, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
    const podShellRect = podShell.querySelector('.scheme-pod-rect');
    if (podShellRect) podShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const containerBox = box({ x: 600, y: 530, w: 300, h: 64, label: 'app', sublabel: 'no container yet', role: 'workloads' });

    // Wrap shell + container in a group so opacity animates uniformly.
    const podGroup = g({ id: 'podGroup' });
    podGroup.appendChild(podShell);
    podGroup.appendChild(containerBox);
    podGroup.style.opacity = '0.35';

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    // Z-order: chain, node, pod group, then Kubelet on top of the packet layer.
    root.appendChild(chain);
    root.appendChild(nodeEl);
    root.appendChild(podGroup);
    root.appendChild(kubelet);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubelet, chain, nodeEl, podGroup, podShell, containerBox, connector,
      phaseChip, cStateChip, restartChip, policyChip,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['kubelet','phaseChip','cStateChip','restartChip','policyChip','podShell','containerBox'],
    [s.refs.podGroup]);
}
function setChips(s, { phase, cstate, restart, policy = 'OnFailure' }) {
  setVal(s.refs.phaseChip, phase);
  setVal(s.refs.cStateChip, cstate);
  setVal(s.refs.restartChip, restart);
  setVal(s.refs.policyChip, policy);
}

function syncPacket(s, ctx, { delay = 0 } = {}) {
  const pts = [[320, 80], [280, 80], [280, 550], [320, 550]];
  return routePacket(s, ctx, pts, { delay, fadeIn: true, role: 'workloads' });
}

const PHASE_FADE_MS = 700, PHASE_FADE_DELAY = 400;

const STEPS = [
  {
    id: 'admit',
    duration: 1500,
    narration: 'The Pod object has been persisted in etcd through the Api, but spec.nodeName is empty so the scheduler has not yet bound it to a node. status.phase reports Pending and no container exists. Kubelet is unaware of the Pod, since each Kubelet only watches its own node.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Pending', cstate: 'none', restart: '0' });
      setBoxSublabel(s.refs.containerBox, 'no container yet');
      setWire(s, 'req', 'spec.nodeName not set · Waiting for scheduler');
      s.refs.podGroup.style.opacity = '0.35';
      setChainActive(s.refs.chain, 0);
    },
  },
  {
    id: 'schedule',
    duration: 2000,
    narration: 'The scheduler has bound the Pod to Node-1, so spec.nodeName is set and Kubelet picks the Pod up via its watch. Kubelet pulls images, creates the Pod sandbox and the container is in Waiting with reason ContainerCreating. status.phase is still Pending until at least one container has started.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Pending', cstate: 'Waiting · ContainerCreating', restart: '0' });
      setBoxSublabel(s.refs.containerBox, 'Waiting · ContainerCreating');
      setWire(s, 'req', 'spec.nodeName=node-1 · SyncPod · Image pull + sandbox');
      s.refs.kubelet.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      s.refs.cStateChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = '0.7';
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      syncPacket(s, ctx);
      ctx.register(s.refs.podGroup.animate([{ opacity: 0.35 }, { opacity: 0.7 }], { duration: PHASE_FADE_MS, delay: PHASE_FADE_DELAY, fill: 'both', easing: 'ease-out' }));
    },
  },
  {
    id: 'running',
    duration: 2000,
    narration: 'Every container has been created and at least one has started, so status.phase becomes Running. Each container reports a Running state, and the Pod does its work until its containers exit. status.phase Running covers the entire working life of the Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Running', cstate: 'Running', restart: '0' });
      setBoxSublabel(s.refs.containerBox, 'Running · serving');
      setWire(s, 'req', 'StartContainer OK · Phase Pending → Running');
      s.refs.kubelet.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      s.refs.cStateChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = '1';
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
      const sync = syncPacket(s, ctx);
      ctx.register(s.refs.podGroup.animate([{ opacity: 0.7 }, { opacity: 1 }], { duration: PHASE_FADE_MS, delay: PHASE_FADE_DELAY, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.podGroup, ctx, sync.arrivalMs);
    },
  },
  {
    id: 'crashloop',
    duration: 2400,
    narration: 'The container exits with a non-zero code. With restartPolicy OnFailure Kubelet restarts it inside the same sandbox, but repeated fast failures trigger an exponential backoff: the delay starts at 10s and doubles on each subsequent restart (10s, 20s, 40s, 80s, 160s, capped at 300s). The container sits in Waiting with reason=CrashLoopBackOff while the timer ticks. status.phase stays Running the whole time, because CrashLoopBackOff is a container-level waiting reason, never a phase of its own.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Running', cstate: 'CrashLoopBackOff', restart: '4' });
      setBoxSublabel(s.refs.containerBox, 'CrashLoopBackOff');
      setWire(s, 'req', 'Exit != 0 · CrashLoopBackOff · Phase stays Running');
      s.refs.kubelet.classList.add('highlight');
      s.refs.cStateChip.classList.add('highlight');
      s.refs.restartChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = '0.7';
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) return;
      syncPacket(s, ctx);
      ctx.register(s.refs.podGroup.animate([{ opacity: 1 }, { opacity: 0.7 }], { duration: PHASE_FADE_MS, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'recover',
    duration: 2000,
    narration: 'The backoff timer elapses and Kubelet retries the container. This time it starts cleanly and runs to its next reconcile, so the container state returns to Running and restartCount records how many times the container was restarted. status.phase was Running through the whole episode, only the container-level state moved.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Running', cstate: 'Running', restart: '5' });
      setBoxSublabel(s.refs.containerBox, 'Running · restarted');
      setWire(s, 'req', 'Backoff elapsed · StartContainer · restartCount++');
      s.refs.kubelet.classList.add('highlight');
      s.refs.cStateChip.classList.add('highlight');
      s.refs.restartChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = '1';
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) return;
      const sync = syncPacket(s, ctx);
      ctx.register(s.refs.podGroup.animate([{ opacity: 0.7 }, { opacity: 1 }], { duration: PHASE_FADE_MS, delay: PHASE_FADE_DELAY, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.podGroup, ctx, sync.arrivalMs);
    },
  },
  {
    id: 'terminal',
    duration: 2400,
    narration: 'The container finally exits 0. restartPolicy OnFailure does not restart a success, so every container is Terminated and status.phase becomes Succeeded, a terminal state common for Jobs. Under restartPolicy=Never a non-zero exit is not restarted either and ends at Failed instead. Both are terminal, the Pod will not run again. If the node hosting the Pod becomes unreachable, the Api does not set a new phase (the Unknown phase is deprecated since 1.21), the node-lifecycle controller instead marks the Pod for eviction via the NodeLost condition.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Succeeded', cstate: 'Terminated · Completed · exit 0', restart: '5' });
      setBoxSublabel(s.refs.containerBox, 'Terminated · Completed');
      setWire(s, 'req', 'Exit 0 · Phase Running → Succeeded · Terminal');
      s.refs.kubelet.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      s.refs.cStateChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = '0.35';
      setChainActive(s.refs.chain, 5);
      if (ctx.reduced) return;
      syncPacket(s, ctx);
      ctx.register(s.refs.podGroup.animate([{ opacity: 1 }, { opacity: 0.35 }], { duration: PHASE_FADE_MS, delay: PHASE_FADE_DELAY, fill: 'both', easing: 'ease-in' }));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
