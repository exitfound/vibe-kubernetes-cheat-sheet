import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, cylinder, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, makeInit, clearHighlights, clearWires, setWire, FADE } from '../lib/control-kit.js';

// Shared connectors. Heartbeat: Node-1 top-centre up into the Lease bottom-centre,
// the vertical riding the gap (x=790) between the chain and the chips column.
// Evict: controller left margin down into Node-1. Reschedule: the workload relocates
// from the failed Node-1 across to the healthy Node-2; the packet bridges the two
// node blocks (right edge x=680 -> left edge x=740) and the replacement Pod only
// materialises inside Node-2 once the packet lands on the node.
const HEARTBEAT_CONNECTOR = [[500, 480], [500, 468], [790, 468], [790, 150]];
const EVICT_CONNECTOR     = [[320, 112], [290, 112], [290, 550], [320, 550]];
const RESCHED_CONNECTOR   = [[680, 550], [740, 550]];

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 20 1200 620',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Node failure and eviction: lease heartbeat loss, Ready flips to Unknown, NoExecute taint, taint-eviction delete, reschedule',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const ctrl  = box({ x: 320, y: 40, w: 300, h: 110, label: 'Kube-controller-manager', sublabel: 'node-lifecycle-controller', cat: 'control' });
    // Lease centred on x=790 so the heartbeat connector drops into its bottom centre.
    const lease = cylinder({ x: 725, y: 40, w: 130, h: 110, label: 'Lease', cat: 'control' });

    // Top-row arrows, symmetric about the control-plane centre (y=95, so +/-15 -> 80 and 110).
    root.appendChild(arrow({ x1: 620, y1: 80,  x2: 725, y2: 80,  dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 725, y1: 110, x2: 620, y2: 110, dim: true, dashed: true, color: 'control' }));

    // Heartbeat connector: Node-1 top centre up and over into the Lease bottom centre.
    root.appendChild(pathArrow({ points: HEARTBEAT_CONNECTOR, dim: true, dashed: true, color: 'control' }));

    // Controller -> failing-node connector so the eviction DELETE is carried by a
    // visible packet the Pod reacts to on arrival; reschedule bridges node to node.
    root.appendChild(pathArrow({ points: EVICT_CONNECTOR,   dim: true, dashed: true, color: 'control' }));
    root.appendChild(pathArrow({ points: RESCHED_CONNECTOR, dim: true, dashed: true, color: 'control' }));

    const wireCtrl = text({ class: 'scheme-label code dim', x: 470, y: 174, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireCtrl);

    const chain = chainList({
      x: 320, y: 220, w: 460, rowH: 32, gap: 10,
      items: [
        '1. heartbeat   ·  Lease renewed every 10s, Ready=True',
        '2. missed      ·  Kubelet stops renewing',
        '3. NotReady    ·  Ready flips to Unknown after grace',
        '4. tainted     ·  Controller adds NoExecute taint',
        '5. evicted     ·  Toleration expires, Pod deleted',
        '6. rescheduled ·  Scheduler binds replacement',
      ],
      cat: 'control',
    });

    // State chips column on the right, each tracking one Node/Lease/Taint field.
    const readyChip = valChip({ x: 800, y: 220, w: 380, h: 32, name: 'Ready',          value: 'True' });
    const leaseChip = valChip({ x: 800, y: 262, w: 380, h: 32, name: 'Lease age',      value: '2s · Fresh' });
    const taintChip = valChip({ x: 800, y: 304, w: 380, h: 32, name: 'Taint',          value: 'none' });
    const tolerChip = valChip({ x: 800, y: 346, w: 380, h: 32, name: 'Toleration',     value: 'none' });
    const evictChip = valChip({ x: 800, y: 388, w: 380, h: 32, name: 'Eviction timer', value: 'none' });
    [readyChip, leaseChip, taintChip, tolerChip, evictChip].forEach(c => root.appendChild(c));

    // Bottom row: two worker nodes side-by-side. Node-1 is the failing one, Node-2 the target.
    const nodeA = node({ x: 320, y: 480, w: 360, h: 140, label: 'Node-1' });
    const nodeB = node({ x: 740, y: 480, w: 360, h: 140, label: 'Node-2' });

    // Failing node hosts the running Pod that gets evicted.
    const podAShell = pod({ x: 392, y: 497, w: 216, h: 106, label: 'Pod', sublabel: ' ', containers: 0, cat: 'workloads' });
    podAShell.style.setProperty('--workloads-color', '#c0b0ff');
    const podAShellRect = podAShell.querySelector('.scheme-pod-rect');
    if (podAShellRect) podAShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const podABox = box({ x: 422, y: 525, w: 156, h: 52, label: 'app-pod', sublabel: 'nginx:1.27', cat: 'workloads' });
    podABox.style.setProperty('--workloads-color', '#c0b0ff');

    const podA = g({ id: 'podA' });
    podA.appendChild(podAShell);
    podA.appendChild(podABox);

    // Target node receives the rescheduled replacement Pod (hidden until reschedule).
    const podBShell = pod({ x: 812, y: 497, w: 216, h: 106, label: 'Pod', sublabel: ' ', containers: 0, cat: 'workloads' });
    podBShell.style.setProperty('--workloads-color', '#c0b0ff');
    const podBShellRect = podBShell.querySelector('.scheme-pod-rect');
    if (podBShellRect) podBShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const podBBox = box({ x: 842, y: 525, w: 156, h: 52, label: 'app-pod', sublabel: 'nginx:1.27', cat: 'workloads' });
    podBBox.style.setProperty('--workloads-color', '#c0b0ff');

    const podB = g({ id: 'podB' });
    podB.style.opacity = '0';
    podB.appendChild(podBShell);
    podB.appendChild(podBBox);

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeA);
    root.appendChild(nodeB);
    root.appendChild(podA);
    root.appendChild(podB);
    root.appendChild(ctrl);
    root.appendChild(lease);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      ctrl, lease,
      readyChip, leaseChip, taintChip, tolerChip, evictChip,
      chain,
      nodeA, nodeB, podA, podB, podABox, podBBox,
      packetLayer,
      wires: { ctrl: wireCtrl },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['ctrl', 'lease', 'readyChip', 'leaseChip', 'taintChip', 'tolerChip', 'evictChip'],
    [s.refs.podA, s.refs.podB]);
}
function resetNodeOpacity(s) {
  s.refs.nodeA.style.opacity = '1';
  s.refs.nodeB.style.opacity = '1';
  s.refs.podA.style.opacity = '1';
}

const STEPS = [
  {
    id: 'healthy',
    duration: 1500,
    narration: 'Node-1 is Ready and a Pod runs on it. The Lease in kube-node-lease is fresh, and the Node-lifecycle-controller sees no anomaly on its watch. Steady state.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetNodeOpacity(s);
      setVal(s.refs.readyChip, 'True');
      setVal(s.refs.leaseChip, '2s · Fresh');
      setVal(s.refs.taintChip, 'none');
      setVal(s.refs.tolerChip, 'none');
      setVal(s.refs.evictChip, 'none');
      s.refs.podB.style.opacity = '0';
      // Idle baseline: nothing is happening yet, no chain row highlighted.
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'heartbeat',
    duration: 2400,
    narration: 'Kubelet on Node-1 proves liveness with two heartbeats. It renews its Lease in kube-node-lease every 10s and PATCHes Node.status every 5 min. The Node-lifecycle-controller treats the fast Lease renewal as its primary liveness signal.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetNodeOpacity(s);
      setVal(s.refs.readyChip, 'True');
      setVal(s.refs.leaseChip, '2s · Fresh · renewed');
      s.refs.podB.style.opacity = '0';
      setWire(s, 'ctrl', 'Kubelet · PUT lease renewTime · every 10s');
      s.refs.lease.classList.add('highlight');
      s.refs.leaseChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) return;
      routePacket(s, ctx, HEARTBEAT_CONNECTOR);
    },
  },
  {
    id: 'kubelet-stops',
    duration: 2000,
    narration: 'The Kubelet on Node-1 stops renewing (kernel panic, network partition, or Kubelet crash). The Lease grows stale, but Pods on the Node keep running for now.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetNodeOpacity(s);
      s.refs.podB.style.opacity = '0';
      setVal(s.refs.readyChip, 'True (Stale Lease)');
      setVal(s.refs.leaseChip, '30s · Stale');
      s.refs.readyChip.classList.add('highlight');
      s.refs.leaseChip.classList.add('highlight');
      // Pin opacity inline so cancel between steps does not flash to default.
      s.refs.nodeA.style.opacity = '0.55';
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      ctx.register(s.refs.nodeA.animate([{ opacity: 1 }, { opacity: 0.55 }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'not-ready',
    duration: 2000,
    narration: 'After --node-monitor-grace-period (default 50s), the Node-lifecycle-controller flips Ready from True to Unknown: it cannot tell whether Node-1 died or is just unreachable. Pods are still on the Node, and eviction has not started.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.nodeA.style.opacity = '0.55';
      s.refs.nodeB.style.opacity = '1';
      s.refs.podA.style.opacity = '1';
      s.refs.podB.style.opacity = '0';
      setVal(s.refs.readyChip, 'Unknown · unreachable');
      setVal(s.refs.leaseChip, '52s · Expired');
      s.refs.readyChip.classList.add('highlight');
      s.refs.ctrl.classList.add('highlight');
      setWire(s, 'ctrl', 'PATCH /api/v1/nodes/Node-1/status');
      setChainActive(s.refs.chain, 2);
      // The status flip is computed on the controller from the expired Lease:
      // nothing travels and no block flashes, the changed Ready value carries it.
    },
  },
  {
    id: 'taint-applied',
    duration: 2100,
    narration: 'The controller adds the taint node.kubernetes.io/unreachable:NoExecute. The DefaultTolerationSeconds admission plugin already gave every Pod a 300s toleration for this taint, and that timer now ticks down.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.nodeA.style.opacity = '0.55';
      s.refs.nodeB.style.opacity = '1';
      s.refs.podA.style.opacity = '1';
      s.refs.podB.style.opacity = '0';
      setVal(s.refs.taintChip, 'node.kubernetes.io/unreachable:NoExecute');
      setVal(s.refs.tolerChip, 'NoExecute · 300s');
      setVal(s.refs.evictChip, '300s · Counting down');
      s.refs.taintChip.classList.add('highlight');
      s.refs.tolerChip.classList.add('highlight');
      s.refs.evictChip.classList.add('highlight');
      s.refs.ctrl.classList.add('highlight');
      setWire(s, 'ctrl', 'PATCH /api/v1/nodes/Node-1 · spec.taints');
      setChainActive(s.refs.chain, 3);
      // The taint lands as a field write on the controller: nothing travels and
      // no block flashes, the new taint and toleration timer carry the step.
    },
  },
  {
    id: 'evict',
    duration: 2200,
    narration: 'Toleration expires. The taint-eviction-controller deletes the Pod with a plain DELETE that bypasses PodDisruptionBudgets (unlike kubectl drain, which uses the PDB-aware Eviction API). Api removes the Pod from ETCD, while the unreachable Node-1 still holds the orphaned container.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.nodeA.style.opacity = '0.55';
      s.refs.nodeB.style.opacity = '1';
      s.refs.podB.style.opacity = '0';
      setVal(s.refs.evictChip, '0s · Deleted');
      s.refs.evictChip.classList.add('highlight');
      s.refs.ctrl.classList.add('highlight');
      setWire(s, 'ctrl', 'DELETE /api/v1/.../pods/{name} · taint-eviction');
      setChainActive(s.refs.chain, 4);
      // Pin final state so cancel does not snap back to opacity 1.
      s.refs.podA.style.opacity = '0';
      if (ctx.reduced) return;
      // The DELETE travels from the controller down the left margin to the Pod on
      // Node-1; the Pod flinches and disappears only when the packet reaches it.
      const del = routePacket(s, ctx, EVICT_CONNECTOR);
      pulsePod(s.refs.podA, ctx, del.arrivalMs);
      ctx.register(s.refs.podA.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, delay: del.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'reschedule',
    duration: 2200,
    narration: 'The owning controller (Deployment via its ReplicaSet) sees the missing replica and creates a replacement Pod. Scheduler picks the healthy Node-2 and Kubelet there starts it. End-to-end recovery takes about 50s plus 300s by default, the grace period plus the toleration.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.nodeA.style.opacity = '0.55';
      s.refs.nodeB.style.opacity = '1';
      s.refs.podA.style.opacity = '0';
      s.refs.ctrl.classList.add('highlight');
      setWire(s, 'ctrl', 'Deployment recreates replica · Scheduler binds Node-2');
      setChainActive(s.refs.chain, 5);
      // Pin final state inline.
      s.refs.podB.style.opacity = '1';
      if (ctx.reduced) return;
      // The bind packet bridges Node-1 across to Node-2 (node block to node block);
      // the replacement Pod materialises and pulses only when it lands on Node-2.
      const bind = routePacket(s, ctx, RESCHED_CONNECTOR);
      ctx.register(s.refs.podB.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: bind.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.podB, ctx, bind.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
