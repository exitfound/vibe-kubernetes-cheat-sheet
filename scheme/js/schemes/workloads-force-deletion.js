import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, chainList, setChainActive, arrow, pathArrow, packet, animateAlong } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, clearPodHighlight, makeInit } from '../lib/scheme-kit.js';


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

    const kubectl = box({ x: 320, y: 40, w: 220, h: 80, label: 'kubectl', sublabel: 'delete pod app-pod-0', cat: 'control' });
    const api     = box({ x: 580, y: 40, w: 220, h: 80, label: 'kube-apiserver', sublabel: 'deletionTimestamp + etcd', cat: 'control' });

    root.appendChild(arrow({ x1: 540, y1: 65, x2: 580, y2: 65, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 580, y1: 95, x2: 540, y2: 95, dim: true, dashed: true, color: 'control' }));

    const wireReq = text({ class: 'scheme-label code dim', x: 560, y: 28, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const connector = pathArrow({
      points: [[690, 120], [690, 185], [280, 185], [280, 550], [320, 550]],
      dim: true, dashed: true, color: 'control',
    });
    root.appendChild(connector);

    const connectorRight = pathArrow({
      points: [[710, 120], [710, 185], [1198, 185], [1198, 450], [975, 450], [975, 480]],
      dim: true, dashed: true, color: 'control',
    });
    root.appendChild(connectorRight);

    // State chips on the right.
    const nodeChip    = valChip({ x: 830, y: 220, w: 350, h: 32, name: 'Node-2',      value: 'Ready' });
    const podChip     = valChip({ x: 830, y: 262, w: 350, h: 32, name: 'app-pod-0',   value: 'Running' });
    const replicaChip = valChip({ x: 830, y: 304, w: 350, h: 32, name: 'StatefulSet', value: 'replicas 1/1' });
    const focusChip   = valChip({ x: 830, y: 346, w: 350, h: 32, name: 'focus',       value: 'none' });
    [nodeChip, podChip, replicaChip, focusChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
      items: [
        '1. node lost   ·  kubelet heartbeats stop, Node NotReady',
        '2. terminating ·  deletionTimestamp set, kubelet cannot ack',
        '3. stuck       ·  identity held, no replacement is made',
        '4. force       ·  --grace-period=0 --force drops it from etcd',
        '5. risk        ·  partitioned node may still run the old one',
      ],
      cat: 'control',
    });

    const node2 = node({ x: 320, y: 480, w: 410, h: 140, label: 'Node-2' });
    const node1 = node({ x: 770, y: 480, w: 410, h: 140, label: 'Node-1' });

    const podOldShell = pod({ x: 415, y: 497, w: 220, h: 106, label: 'app-pod-0', sublabel: '', containers: 0, cat: 'workloads' });
    const podOldShellRect = podOldShell.querySelector('.scheme-pod-rect');
    if (podOldShellRect) podOldShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const podOldBox = box({ x: 425, y: 525, w: 200, h: 52, label: 'app', sublabel: 'StatefulSet Pod', cat: 'workloads' });

    const podOld = g({ id: 'podOld' });
    podOld.appendChild(podOldShell);
    podOld.appendChild(podOldBox);

    const podNewShell = pod({ x: 865, y: 497, w: 220, h: 106, label: 'app-pod-0', sublabel: '', containers: 0, cat: 'workloads' });
    const podNewShellRect = podNewShell.querySelector('.scheme-pod-rect');
    if (podNewShellRect) podNewShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const podNewBox = box({ x: 875, y: 525, w: 200, h: 52, label: 'app', sublabel: 'recreated replica', cat: 'workloads' });

    const podNew = g({ id: 'podNew' });
    podNew.style.opacity = '0';
    podNew.appendChild(podNewShell);
    podNew.appendChild(podNewBox);

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(node2);
    root.appendChild(node1);
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
  ['kubectl','api','nodeChip','podChip','replicaChip','focusChip','podOldBox','podNewBox']
    .forEach(k => s.refs[k].classList.remove('highlight'));
  s.refs.chain.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
  clearPodHighlight(s.refs.podOld);
  clearPodHighlight(s.refs.podNew);
}



function recreationPacket(s, ctx, { delay = 0, dur = 1300 } = {}) {
  const pts = [[710, 120], [710, 185], [1198, 185], [1198, 450], [975, 450], [975, 480]];
  const p = packet({ x: pts[0][0], y: pts[0][1], cat: 'control' });
  p.style.opacity = '0';
  s.refs.packetLayer.appendChild(p);
  const fadeInDelay = Math.max(0, delay - 200);
  ctx.register(p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: fadeInDelay, fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(p, pts, { duration: dur, delay }));
  ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: delay + dur, fill: 'forwards', easing: 'ease-in' }));
}
// Packet down the left connector from the apiserver to app-pod-0 on Node-2.
// Mirrors recreationPacket but follows the left arrow (apiserver -> Node-2 Pod).
function node2Packet(s, ctx, { delay = 0, dur = 1100 } = {}) {
  const pts = [[690, 120], [690, 185], [280, 185], [280, 550], [320, 550]];
  const p = packet({ x: pts[0][0], y: pts[0][1], cat: 'control' });
  p.style.opacity = '0';
  s.refs.packetLayer.appendChild(p);
  const fadeInDelay = Math.max(0, delay - 200);
  ctx.register(p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: fadeInDelay, fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(p, pts, { duration: dur, delay }));
  ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: delay + dur, fill: 'forwards', easing: 'ease-in' }));
}
function clearWires(s) {
  Object.values(s.refs.wires).forEach(t => { t.textContent = ''; });
}
function setWire(s, key, txt) {
  if (s.refs.wires[key]) s.refs.wires[key].textContent = txt;
}
function setChips(s, { node, pod, replica, focus }) {
  setVal(s.refs.nodeChip, node);
  setVal(s.refs.podChip, pod);
  setVal(s.refs.replicaChip, replica);
  setVal(s.refs.focusChip, focus);
}
function arrowPacket(s, ctx, { delay = 0 } = {}) {
  const p = packet({ x: 540, y: 65, cat: 'control' });
  if (delay > 0) p.style.opacity = '0';
  s.refs.packetLayer.appendChild(p);
  if (delay > 0) {
    const fadeInDelay = Math.max(0, delay - 200);
    ctx.register(p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: fadeInDelay, fill: 'forwards', easing: 'ease-out' }));
  }
  ctx.register(animateAlong(p, [[540, 65], [580, 65]], { duration: 700, delay }));
  ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: delay + 700, fill: 'forwards', easing: 'ease-in' }));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'app-pod-0, a Pod owned by a StatefulSet, runs on Node-2. The cluster is healthy: Node-2 posts kubelet heartbeats, the Pod phase is Running, and the StatefulSet counts its single replica as ready. Node-1 is a second healthy node with spare capacity.',
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
    duration: 2100,
    narration: 'Node-2 stops posting kubelet heartbeats, from a kernel panic, a power loss or a network partition. After node-monitor-grace-period, about 40s, the node controller sets the Node Ready condition to Unknown and marks Node-2 NotReady. The control plane can no longer observe what app-pod-0 is actually doing.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { node: 'NotReady (Unknown)', pod: 'Running (last seen)', replica: 'replicas 1/1', focus: 'heartbeat lost' });
      setWire(s, 'req', 'Node controller: Ready → Unknown');
      s.refs.api.classList.add('highlight');
      s.refs.nodeChip.classList.add('highlight');
      // Node-2 is now unobservable: its Pod dims to a faint, unmanaged state.
      s.refs.podOld.style.opacity = '0.5';
      s.refs.podNew.style.opacity = '0';
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) return;
      // The node controller reaches toward Node-2 over the connector. When the
      // packet arrives the Pod pulses and dims to its faint, unobservable state.
      node2Packet(s, ctx, { dur: 1100 });
      pulsePod(s.refs.podOld, ctx, 1100);
      ctx.register(s.refs.podOld.animate([{ opacity: 1 }, { opacity: 0.5 }], { duration: 700, delay: 1100, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'terminating',
    duration: 2200,
    narration: 'A delete is issued for app-pod-0, by you or by the node controller clearing Pods off the lost node. The apiserver stamps metadata.deletionTimestamp, so the Pod reads as Terminating. Normally the kubelet would stop the container and let the apiserver remove the object, but Node-2 kubelet is unreachable and nothing acknowledges the delete.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { node: 'NotReady', pod: 'Terminating', replica: 'replicas 1/1', focus: 'deletionTimestamp set' });
      setWire(s, 'req', 'DELETE .../pods/app-pod-0 · deletionTimestamp');
      s.refs.kubectl.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      s.refs.podChip.classList.add('highlight');
      s.refs.podOld.style.opacity = '0.5';
      s.refs.podNew.style.opacity = '0';
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      arrowPacket(s, ctx);
    },
  },
  {
    id: 'stuck',
    duration: 2300,
    narration: 'app-pod-0 is stuck in Terminating with no time limit, while status.phase stays Running. The StatefulSet will not create a replacement, because the sticky identity app-pod-0 and its RWO volume are still held by the undeleted Pod. A leftover metadata.finalizer causes the same stuck Terminating, cleared by removing the finalizer rather than by force.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { node: 'NotReady', pod: 'Terminating (stuck)', replica: 'replacement blocked', focus: 'identity app-pod-0 still held' });
      s.refs.podChip.classList.add('highlight');
      s.refs.replicaChip.classList.add('highlight');
      s.refs.podOld.style.opacity = '0.5';
      s.refs.podNew.style.opacity = '0';
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
    },
  },
  {
    id: 'force',
    duration: 2200,
    narration: 'kubectl delete pod app-pod-0 --grace-period=0 --force tells the apiserver to drop the Pod object from etcd at once, with no wait for any kubelet acknowledgement. The API now reports the Pod as gone, and the StatefulSet identity app-pod-0 is free again.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { node: 'NotReady', pod: 'force-deleted', replica: 'identity freed', focus: 'object dropped from etcd' });
      setWire(s, 'req', 'DELETE app-pod-0 · --grace-period=0 --force');
      s.refs.kubectl.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      s.refs.podChip.classList.add('highlight');
      s.refs.podOld.style.opacity = '0.5';
      s.refs.podNew.style.opacity = '0';
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) return;
      arrowPacket(s, ctx);
    },
  },
  {
    id: 'risk',
    duration: 2500,
    narration: 'The StatefulSet immediately recreates app-pod-0, here on Node-1. The danger: if Node-2 was only network-partitioned, its kubelet is alive and the original container still runs there. Two Pods now share the identity app-pod-0 and the same volume, which corrupts data. Force-delete only after the node is confirmed dead, or delete the Node object so its Pods are garbage-collected cleanly.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { node: 'partitioned, still live', pod: 'recreated on Node-1', replica: 'app-pod-0 live twice', focus: 'split-brain hazard' });
      setWire(s, 'req', 'StatefulSet recreates app-pod-0 on Node-1');
      s.refs.replicaChip.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      s.refs.podOld.style.opacity = '0.5';
      s.refs.podNew.style.opacity = '1';
      setChainActive(s.refs.chain, 4);
      // podNew appears on arrival, so pulse it then. Lighting podNewBox in enter() would
      // auto-pulse it at delay 0 while the Pod is still invisible (and double with pulsePod).
      if (ctx.reduced) { s.refs.podNewBox.classList.add('highlight'); return; }
      recreationPacket(s, ctx);
      ctx.register(s.refs.podNew.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: 1300, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.podNew, ctx, 1300);
    },
  },
];

export const init = makeInit(Scene, STEPS);
