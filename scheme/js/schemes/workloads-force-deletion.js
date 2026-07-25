import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, topPacket, makeInit, clearHighlights, clearWires, setWire, FADE } from '../lib/workloads-kit.js';


class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Force deletion and stuck Terminating Pods: an unreachable node leaves a Pod stuck, force delete risks two live instances',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubectl = box({ x: 320, y: 40, w: 220, h: 80, label: 'Kubectl', sublabel: 'delete pod pod-a', role: 'cluster' });
    const api     = box({ x: 580, y: 40, w: 220, h: 80, label: 'Api', sublabel: 'deletionTimestamp + etcd', role: 'cluster' });

    root.appendChild(arrow({ x1: 540, y1: 65, x2: 580, y2: 65, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: 580, y1: 95, x2: 540, y2: 95, dim: true, dashed: true, role: 'cluster' }));

    const wireReq = text({ class: 'scheme-label code dim', x: 560, y: 28, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const connector = pathArrow({
      points: [[680, 120], [680, 185], [280, 185], [280, 550], [320, 550]],
      dim: true, dashed: true, role: 'cluster',
    });
    root.appendChild(connector);

    const connectorRight = pathArrow({
      points: [[700, 120], [700, 185], [1198, 185], [1198, 450], [975, 450], [975, 480]],
      dim: true, dashed: true, role: 'cluster',
    });
    root.appendChild(connectorRight);

    // State chips on the right.
    const nodeChip    = valChip({ x: 830, y: 220, w: 350, h: 32, name: 'Node-1',      value: 'Ready', role: 'workloads' });
    const podChip     = valChip({ x: 830, y: 262, w: 350, h: 32, name: 'Pod A',       value: 'Running', role: 'workloads' });
    const replicaChip = valChip({ x: 830, y: 304, w: 350, h: 32, name: 'StatefulSet', value: 'replicas 1/1', role: 'workloads' });
    const focusChip   = valChip({ x: 830, y: 346, w: 350, h: 32, name: 'focus',       value: 'none', role: 'workloads' });
    [nodeChip, podChip, replicaChip, focusChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
      items: [
        '1. node lost   ·  Kubelet heartbeats stop, Node NotReady',
        '2. terminating ·  deletionTimestamp set, Kubelet cannot ack',
        '3. stuck       ·  identity held, no replacement is made',
        '4. force       ·  --grace-period=0 --force drops it from etcd',
        '5. risk        ·  partitioned node may still run the old one',
      ],
      role: 'cluster',
    });

    const node1 = node({ x: 320, y: 480, w: 410, h: 140, label: 'Node-1' });
    const node2 = node({ x: 770, y: 480, w: 410, h: 140, label: 'Node-2' });

    const podOldShell = pod({ x: 415, y: 497, w: 220, h: 106, label: 'Pod A', sublabel: '', containers: 0, role: 'workloads' });
    const podOldShellRect = podOldShell.querySelector('.scheme-pod-rect');
    if (podOldShellRect) podOldShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const podOldBox = box({ x: 425, y: 525, w: 200, h: 52, label: 'app', sublabel: 'StatefulSet Pod', role: 'workloads' });

    const podOld = g({ id: 'podOld' });
    podOld.appendChild(podOldShell);
    podOld.appendChild(podOldBox);

    const podNewShell = pod({ x: 865, y: 497, w: 220, h: 106, label: 'Pod B', sublabel: '', containers: 0, role: 'workloads' });
    const podNewShellRect = podNewShell.querySelector('.scheme-pod-rect');
    if (podNewShellRect) podNewShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const podNewBox = box({ x: 875, y: 525, w: 200, h: 52, label: 'app', sublabel: 'recreated replica', role: 'workloads' });

    const podNew = g({ id: 'podNew' });
    podNew.style.opacity = '0';
    podNew.appendChild(podNewShell);
    podNew.appendChild(podNewBox);

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(node1);
    root.appendChild(node2);
    root.appendChild(podOld);
    root.appendChild(podNew);
    root.appendChild(kubectl);
    root.appendChild(api);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubectl, api, connector, connectorRight, chain, node1, node2,
      nodeChip, podChip, replicaChip, focusChip,
      podOld, podNew, podOldBox, podNewBox,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['kubectl','api','nodeChip','podChip','replicaChip','focusChip','podOldBox','podNewBox'],
    [s.refs.podOld, s.refs.podNew]);
}

function recreationPacket(s, ctx, { delay = 0 } = {}) {
  const pts = [[700, 120], [700, 185], [1198, 185], [1198, 450], [975, 450], [975, 480]];
  return routePacket(s, ctx, pts, { delay, fadeIn: true, role: 'workloads' });
}
// Packet down the left connector from the Api to Pod A on Node-1.
// Mirrors recreationPacket but follows the left arrow (Api -> Node-1 Pod).
function node1Packet(s, ctx, { delay = 0 } = {}) {
  const pts = [[680, 120], [680, 185], [280, 185], [280, 550], [320, 550]];
  return routePacket(s, ctx, pts, { delay, fadeIn: true, role: 'workloads' });
}
function setChips(s, { node, pod, replica, focus }) {
  setVal(s.refs.nodeChip, node);
  setVal(s.refs.podChip, pod);
  setVal(s.refs.replicaChip, replica);
  setVal(s.refs.focusChip, focus);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Pod A, a Pod owned by a StatefulSet, runs on Node-1. The cluster is healthy: Node-1 posts Kubelet heartbeats, the Pod phase is Running, and the StatefulSet counts its single replica as ready. Node-2 is a second healthy node with spare capacity.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { node: 'Ready', pod: 'Running', replica: 'replicas 1/1', focus: 'none' });
      s.refs.podOld.style.opacity = '1';
      s.refs.podNew.style.opacity = '0';
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'node-lost',
    duration: 2500,
    narration: 'Node-1 stops posting Kubelet heartbeats, from a kernel panic, a power loss or a network partition. After node-monitor-grace-period, about 40s, the node controller sets the Node Ready condition to Unknown and marks Node-1 NotReady. The control plane can no longer observe what Pod A is actually doing.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { node: 'NotReady (Unknown)', pod: 'Running (last seen)', replica: 'replicas 1/1', focus: 'heartbeat lost' });
      setWire(s, 'req', 'Node controller: Ready → Unknown');
      s.refs.api.classList.add('highlight');
      s.refs.nodeChip.classList.add('highlight');
      // Node-1 is now unobservable: its Pod dims to a faint, unmanaged state.
      s.refs.podOld.style.opacity = '0.5';
      s.refs.podNew.style.opacity = '0';
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) return;
      // The node controller reaches toward Node-1 over the connector. When the
      // packet arrives the Pod pulses and dims to its faint, unobservable state.
      const probe = node1Packet(s, ctx);
      pulsePod(s.refs.podOld, ctx, probe.arrivalMs);
      ctx.register(s.refs.podOld.animate([{ opacity: 1 }, { opacity: 0.5 }], { duration: FADE.out, delay: probe.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'terminating',
    duration: 2200,
    narration: 'A delete is issued for Pod A, by you or by the node controller clearing Pods off the lost node. The Api stamps metadata.deletionTimestamp, so the Pod reads as Terminating. Normally the Kubelet would stop the container and let the Api remove the object, but Node-1 Kubelet is unreachable and nothing acknowledges the delete.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { node: 'NotReady', pod: 'Terminating', replica: 'replicas 1/1', focus: 'deletionTimestamp set' });
      setWire(s, 'req', 'DELETE .../pods/pod-a · deletionTimestamp');
      s.refs.kubectl.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      s.refs.podChip.classList.add('highlight');
      s.refs.podOld.style.opacity = '0.5';
      s.refs.podNew.style.opacity = '0';
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      topPacket(s, ctx, { role: 'workloads' });
    },
  },
  {
    id: 'stuck',
    duration: 2300,
    narration: 'Pod A is stuck in Terminating with no time limit, while status.phase stays Running. The StatefulSet will not create a replacement, because the sticky identity and its RWO volume are still held by the undeleted Pod A. A leftover metadata.finalizer causes the same stuck Terminating, cleared by removing the finalizer rather than by force.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { node: 'NotReady', pod: 'Terminating (stuck)', replica: 'replacement blocked', focus: 'identity still held by Pod A' });
      s.refs.podChip.classList.add('highlight');
      s.refs.replicaChip.classList.add('highlight');
      s.refs.podOld.style.opacity = '0.5';
      s.refs.podNew.style.opacity = '0';
      setChainActive(s.refs.chain, 2);
      // Nothing travels while the identity is held and the Pod is untouched: the blocked
      // state shows via the static highlight only (no chip pulse).
    },
  },
  {
    id: 'force',
    duration: 2200,
    narration: 'Kubectl delete pod pod-a --grace-period=0 --force tells the Api to drop the Pod object from etcd at once, with no wait for any Kubelet acknowledgement. The Api now reports the Pod as gone, and the StatefulSet identity is free again.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { node: 'NotReady', pod: 'force-deleted', replica: 'identity freed', focus: 'object dropped from etcd' });
      setWire(s, 'req', 'DELETE pod-a · --grace-period=0 --force');
      s.refs.kubectl.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      s.refs.podChip.classList.add('highlight');
      s.refs.podOld.style.opacity = '0.5';
      s.refs.podNew.style.opacity = '0';
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) return;
      topPacket(s, ctx, { role: 'workloads' });
    },
  },
  {
    id: 'risk',
    duration: 2900,
    narration: 'The StatefulSet immediately recreates the replica, here as Pod B on Node-2. The danger: if Node-1 was only network-partitioned, its Kubelet is alive and the original Pod A still runs there. Pod A and Pod B now share one StatefulSet identity and the same volume, which corrupts data. Force-delete only after the node is confirmed dead, or delete the Node object so its Pods are garbage-collected cleanly.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { node: 'partitioned, still live', pod: 'maybe still running', replica: 'identity live twice', focus: 'split-brain hazard' });
      setWire(s, 'req', 'StatefulSet recreates pod-b on Node-2');
      s.refs.replicaChip.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      s.refs.podOld.style.opacity = '0.5';
      s.refs.podNew.style.opacity = '1';
      setChainActive(s.refs.chain, 4);
      // podNew appears on arrival, so pulse it then. Lighting podNewBox in enter() would
      // auto-pulse it at delay 0 while the Pod is still invisible (and double with pulsePod).
      if (ctx.reduced) { s.refs.podNewBox.classList.add('highlight'); return; }
      const recreate = recreationPacket(s, ctx);
      ctx.register(s.refs.podNew.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: recreate.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.podNew, ctx, recreate.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
