import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, cylinder, chainList, setChainActive, arrow, pathArrow, packet, animateAlong } from '../lib/primitives.js';
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
      'aria-label': 'StatefulSet PVC stickiness: a pod evicted from one node is recreated with the same ordinal, reattaches the same PVC, sees the previous on-disk state',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const controller = box({ x: 320, y: 40, w: 220, h: 80, label: 'StatefulSet', sublabel: 'sticky identity, sticky PVC', cat: 'control' });
    const apiserver  = box({ x: 580, y: 40, w: 220, h: 80, label: 'ApiServer',       sublabel: 'PVC retained on Pod delete', cat: 'control' });
    const pv         = cylinder({ x: 850, y: 30, w: 140, h: 100, label: 'PV cloud-vol-x', cat: 'storage' });

    root.appendChild(arrow({ x1: 540, y1: 65, x2: 580, y2: 65, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 580, y1: 95, x2: 540, y2: 95, dim: true, dashed: true, color: 'control' }));

    const wireReq = text({ class: 'scheme-label code dim', x: 560, y: 148, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const podChip  = valChip({ x: 830, y: 220, w: 350, h: 32, name: 'pod identity',  value: 'web-0 · Running' });
    const pvcChip  = valChip({ x: 830, y: 262, w: 350, h: 32, name: 'PVC name',      value: 'data-web-0 · Bound', cat: 'storage' });
    const pvChip   = valChip({ x: 830, y: 304, w: 350, h: 32, name: 'PV name',       value: 'cloud-vol-x · ReadWriteOnce', cat: 'storage' });
    const dataChip = valChip({ x: 830, y: 346, w: 350, h: 32, name: 'on-disk data',  value: 'rev=1234', cat: 'storage' });
    [podChip, pvcChip, pvChip, dataChip].forEach(c => root.appendChild(c));

    // Pipeline chain, 5 stages of the lifecycle.
    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
      items: [
        '1. running  ·  web-0 on Node-A · PV mounted at /data',
        '2. evict    ·  Pod deleted, PVC retained',
        '3. recreate ·  controller spawns web-0 again (same name)',
        '4. bind     ·  scheduler picks Node-B · PVC stays bound',
        '5. reattach ·  CSI mounts the same PV · /data preserved',
      ],
      cat: 'control',
    });

    const nodeA = node({ x: 320, y: 480, w: 410, h: 140, label: 'Node-A' });
    const nodeB = node({ x: 770, y: 480, w: 410, h: 140, label: 'Node-B' });

    // Pod web-0 on Node-A: starts visible, fades on evict.
    const podAShell = pod({ x: 415, y: 497, w: 220, h: 106, label: 'web-0', sublabel: '', containers: 0, cat: 'workloads' });
    const podAShellRect = podAShell.querySelector('.scheme-pod-rect');
    if (podAShellRect) podAShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
    const podABox = box({ x: 425, y: 525, w: 200, h: 52, label: 'app', sublabel: 'mount: /data', cat: 'workloads' });

    const podA = g({ id: 'podA' });
    podA.appendChild(podAShell);
    podA.appendChild(podABox);

    // Pod web-0 on Node-B: hidden initially, fades in on recreate.
    const podBShell = pod({ x: 865, y: 497, w: 220, h: 106, label: 'web-0', sublabel: '', containers: 0, cat: 'workloads' });
    const podBShellRect = podBShell.querySelector('.scheme-pod-rect');
    if (podBShellRect) podBShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
    const podBBox = box({ x: 875, y: 525, w: 200, h: 52, label: 'app', sublabel: 'mount: /data', cat: 'workloads' });

    const podB = g({ id: 'podB' });
    podB.style.opacity = '0';
    podB.appendChild(podBShell);
    podB.appendChild(podBBox);

    // Left connector: apiserver region down to Node-A's pod.
    const connector = pathArrow({
      points: [[320, 80], [280, 80], [280, 550], [320, 550]],
      dim: true, dashed: true, color: 'control',
    });
    root.appendChild(connector);

    // Right connector: apiserver down the gap between the chain and the chips, into Node-B
    // from the top. Kept off the far-right margin, which belongs to the storage connector.
    const connectorB = pathArrow({
      points: [[800, 80], [815, 80], [815, 460], [975, 460], [975, 480]],
      dim: true, dashed: true, color: 'control',
    });
    root.appendChild(connectorB);

    // Storage connector: always shown. From the PV out to the right margin, down the far
    // side past every block, then into Node-B from its right side (CSI attach + mount path).
    const pvConnector = pathArrow({
      points: [[990, 80], [1198, 80], [1198, 550], [1180, 550]],
      dim: true, dashed: true, color: 'storage',
    });
    root.appendChild(pvConnector);

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeA);
    root.appendChild(nodeB);
    root.appendChild(podA);
    root.appendChild(podB);
    root.appendChild(apiserver);
    root.appendChild(controller);
    root.appendChild(pv);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      controller, apiserver, pv, chain, nodeA, nodeB, connector, connectorB, pvConnector,
      podChip, pvcChip, pvChip, dataChip,
      podA, podB, podABox, podBBox,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['controller','apiserver','pv','podChip','pvcChip','pvChip','dataChip','podABox','podBBox']
    .forEach(k => s.refs[k].classList.remove('highlight'));
  s.refs.chain.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
  clearPodHighlight(s.refs.podA);
  clearPodHighlight(s.refs.podB);
}
function clearWires(s) { Object.values(s.refs.wires).forEach(t => { t.textContent = ''; }); }
function setWire(s, key, txt) { if (s.refs.wires[key]) s.refs.wires[key].textContent = txt; }


// Packet down the left connector from the apiserver region to web-0 on Node-A.
function connectorPacketA(s, ctx, { delay = 0, dur = 1100 } = {}) {
  const pts = [[320, 80], [280, 80], [280, 550], [320, 550]];
  const p = packet({ x: pts[0][0], y: pts[0][1], cat: 'control' });
  p.style.opacity = '0';
  s.refs.packetLayer.appendChild(p);
  const fadeInDelay = Math.max(0, delay - 200);
  ctx.register(p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: fadeInDelay, fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(p, pts, { duration: dur, delay }));
  ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: delay + dur, fill: 'forwards', easing: 'ease-in' }));
}
// Packet down the right connector from the apiserver region to web-0 on Node-B.
function connectorPacketB(s, ctx, { delay = 0, dur = 1000 } = {}) {
  const pts = [[800, 80], [815, 80], [815, 460], [975, 460], [975, 480]];
  const p = packet({ x: pts[0][0], y: pts[0][1], cat: 'control' });
  p.style.opacity = '0';
  s.refs.packetLayer.appendChild(p);
  const fadeInDelay = Math.max(0, delay - 200);
  ctx.register(p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: fadeInDelay, fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(p, pts, { duration: dur, delay }));
  ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: delay + dur, fill: 'forwards', easing: 'ease-in' }));
}
// Packet on the top arrow, controller to apiserver.
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
// Storage packet from the PV down to web-0 on Node-B (CSI attach + mount).
function pvPacket(s, ctx, { delay = 0, dur = 1100 } = {}) {
  const pts = [[990, 80], [1198, 80], [1198, 550], [1180, 550]];
  const p = packet({ x: pts[0][0], y: pts[0][1], cat: 'storage' });
  p.style.opacity = '0';
  s.refs.packetLayer.appendChild(p);
  const fadeInDelay = Math.max(0, delay - 200);
  ctx.register(p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: fadeInDelay, fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(p, pts, { duration: dur, delay }));
  ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: delay + dur, fill: 'forwards', easing: 'ease-in' }));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'web-0 (the only replica of StatefulSet web) runs on Node-A. PVC data-web-0 is Bound to PV cloud-vol-x, mounted at /data inside the container. The pod writes to /data, the on-disk revision is rev=1234. Identity is sticky to ordinal 0 by name (web-0) and by PVC (data-web-0), spun up from a volumeClaimTemplate that creates one PVC per ordinal.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podA.style.opacity = '1';
      s.refs.podB.style.opacity = '0';
      setVal(s.refs.podChip, 'web-0 · Running on Node-A');
      setVal(s.refs.pvcChip, 'data-web-0 · Bound');
      setVal(s.refs.pvChip, 'cloud-vol-x · ReadWriteOnce');
      setVal(s.refs.dataChip, 'rev=1234');
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'evict',
    duration: 2300,
    narration: 'Node-A goes NotReady (kernel panic, power loss, network partition). After the toleration on node.kubernetes.io/unreachable expires, taint-based eviction deletes the Pod object from the cluster. Critically, the PVC data-web-0 is NOT deleted, the StatefulSet retains it for the ordinal under the default PVC retention policy. The PV cloud-vol-x stays Bound, the cloud disk is intact, rev=1234 persists.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podB.style.opacity = '0';
      setVal(s.refs.podChip, 'web-0 · deleted (Pod object gone)');
      setVal(s.refs.pvcChip, 'data-web-0 · Bound (retained)');
      setVal(s.refs.pvChip, 'cloud-vol-x · on lost Node-A');
      setVal(s.refs.dataChip, 'rev=1234 · preserved');
      setWire(s, 'req', 'DELETE Pod web-0 · Keep PVC data-web-0');
      s.refs.controller.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.podChip.classList.add('highlight');
      s.refs.pvcChip.classList.add('highlight');
      s.refs.pvChip.classList.add('highlight');
      s.refs.dataChip.classList.add('highlight');
      // Pin final opacity inline (web-0 gone) so a cancel between steps does not flash it back.
      s.refs.podA.style.opacity = '0';
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      // The delete reaches Node-A over the left connector. podA is pinned to 0 above, the
      // animation back-fills 1 during the delay, then fades web-0 out on arrival. The PVC,
      // PV and data chips stay lit (retained).
      connectorPacketA(s, ctx, { dur: 1100 });
      ctx.register(s.refs.podA.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, delay: 1100, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'recreate',
    duration: 2300,
    narration: 'The StatefulSet controller observes the missing replica and creates a new Pod object with the same name web-0 (sticky identity). The Pod is unbound (spec.nodeName empty). Scheduler runs filter and score on the remaining Ready nodes. PVC data-web-0 stays Bound to PV cloud-vol-x throughout, so no re-provisioning is needed.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podA.style.opacity = '0';
      s.refs.podB.style.opacity = '0';
      setVal(s.refs.podChip, 'web-0 · Pending (created again)');
      setVal(s.refs.pvcChip, 'data-web-0 · Bound (reused)');
      setVal(s.refs.pvChip, 'cloud-vol-x · on lost Node-A');
      setVal(s.refs.dataChip, 'rev=1234 · preserved');
      setWire(s, 'req', 'Create Pod web-0 (sticky name)');
      s.refs.controller.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.podChip.classList.add('highlight');
      s.refs.pvcChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
      // Control-plane only: the controller posts the new Pod object to the apiserver.
      // The Pod is still Pending and unbound, so nothing lands on a node yet.
      arrowPacket(s, ctx);
    },
  },
  {
    id: 'bind',
    duration: 2300,
    narration: 'Scheduler binds web-0 to Node-B. POST .../pods/web-0/binding writes spec.nodeName=Node-B in etcd. PVC data-web-0 stays bound to the same PV cloud-vol-x. The cloud volume is ReadWriteOnce, so it can be safely attached to Node-B only because the old Pod is fully removed from ApiServer (force-delete a stuck Pod and you risk a dual mount, see the Force Deletion card).',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podA.style.opacity = '0';
      setVal(s.refs.podChip, 'web-0 · bound to Node-B');
      setVal(s.refs.pvcChip, 'data-web-0 · Bound (reused)');
      setVal(s.refs.pvChip, 'cloud-vol-x · attaching to Node-B');
      setVal(s.refs.dataChip, 'rev=1234 · preserved');
      setWire(s, 'req', 'POST .../pods/web-0/binding · Node-B');
      s.refs.apiserver.classList.add('highlight');
      s.refs.podChip.classList.add('highlight');
      s.refs.pvChip.classList.add('highlight');
      // Pin final opacity inline (web-0 now placed on Node-B) so a cancel does not hide it.
      s.refs.podB.style.opacity = '1';
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) return;
      // The binding is delivered to Node-B over the right connector (the scheduler posts it
      // to the apiserver, no separate scheduler block is drawn). podB is pinned to 1 above,
      // the animation back-fills 0 during the delay so web-0 materializes and pulses on
      // arrival, keeping the same sticky identity.
      connectorPacketB(s, ctx, { delay: 0, dur: 1000 });
      ctx.register(s.refs.podB.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: 1000, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.podB, ctx, 1000);
    },
  },
  {
    id: 'reattach',
    duration: 2300,
    narration: 'kubelet on Node-B starts the Pod. The CSI external-attacher detaches the PV from the lost Node-A (force-detached because that node is unreachable), then attaches it to Node-B via ControllerPublishVolume. The node driver runs NodeStageVolume and NodePublishVolume to mount the volume at /data inside the new container. The application reads the same files at rev=1234, no data loss. The cloud-vol-x identity, the PVC name, and the Pod name all stayed sticky to ordinal 0.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podA.style.opacity = '0';
      s.refs.podB.style.opacity = '1';
      setVal(s.refs.podChip, 'web-0 · Running on Node-B');
      setVal(s.refs.pvcChip, 'data-web-0 · Bound');
      setVal(s.refs.pvChip, 'cloud-vol-x · mounted on Node-B');
      setVal(s.refs.dataChip, 'rev=1234 · preserved');
      setWire(s, 'req', 'CSI attach to Node-B · NodeStage + NodePublish · /data');
      s.refs.pv.classList.add('highlight');
      s.refs.podChip.classList.add('highlight');
      s.refs.pvcChip.classList.add('highlight');
      s.refs.pvChip.classList.add('highlight');
      s.refs.dataChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) return;
      // CSI reattaches the same PV to Node-B. The volume packet travels from the PV down
      // to Node-B, and web-0 pulses once on arrival then settles back (mounted, data
      // preserved). No persist, so the pulse fades instead of pinning the outline bright.
      pvPacket(s, ctx, { dur: 1100 });
      pulsePod(s.refs.podB, ctx, 1100);
    },
  },
];

export const init = makeInit(Scene, STEPS);
