import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, connectorPacket, topPacket, makeInit, clearHighlights, clearWires, setWire, flashChips, FADE, BEAT } from '../lib/control-kit.js';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 20 1200 620',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Node drain: cordon, list-and-skip, eviction API with PDB gating',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubectl   = box({ x: 320, y: 40, w: 220, h: 80, label: 'Kubectl',   sublabel: 'drain Node-1',    cat: 'control' });
    const apiserver = box({ x: 580, y: 40, w: 220, h: 80, label: 'Api', sublabel: 'eviction gateway', cat: 'control' });

    // Top-row arrows: kubectl → apiserver (request) at y=65, apiserver → kubectl (response) at y=95.
    root.appendChild(arrow({ x1: 540, y1: 65, x2: 580, y2: 65, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 580, y1: 95, x2: 540, y2: 95, dim: true, dashed: true, color: 'control' }));

    // Wire label centred in the 40px gap below the top row.
    const wireReq = text({ class: 'scheme-label code dim', x: 560, y: 148, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    // State chips column on the right. 350 wide, 4 rows at y=40,82,124,166.
    const cordonChip  = valChip({ x: 830, y: 40,  w: 350, h: 32, name: 'spec.unschedulable',     value: 'false' });
    const pdbChip     = valChip({ x: 830, y: 82,  w: 350, h: 32, name: 'web-pdb · minAvailable', value: '1' });
    const healthyChip = valChip({ x: 830, y: 124, w: 350, h: 32, name: 'currentHealthy',         value: '2 of 2' });
    const lastChip    = valChip({ x: 830, y: 166, w: 350, h: 32, name: 'last eviction',          value: '—' });
    [cordonChip, pdbChip, healthyChip, lastChip].forEach(c => root.appendChild(c));

    // Pipeline chain on the left, 5 stages of the drain sequence.
    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
      items: [
        '1. cordon   ·  PATCH Node spec.unschedulable=true',
        '2. list     ·  enumerate Pods, skip DaemonSet / mirror',
        '3. evict    ·  POST .../pods/{name}/eviction',
        '4. PDB gate ·  Api checks minAvailable, 200 or 429',
        '5. drained  ·  app Pods gone, DaemonSet stays',
      ],
      cat: 'control',
    });

    // Bottom: Node-1 with 3 Pods: web-1, web-2 (Deployment), fluentd (DaemonSet).
    const nodeEl = node({ x: 320, y: 480, w: 860, h: 140, label: 'Node-1' });

    const POD_NAMES = ['web-1', 'web-2', 'fluentd'];
    const POD_OWNER = ['Deployment', 'Deployment', 'DaemonSet'];
    const POD_XS    = [386, 642, 898];
    const podBoxes = [];
    const podWrappers = POD_XS.map((px, i) => {
      const shell = pod({ x: px, y: 497, w: 216, h: 106, label: 'Pod', sublabel: '', containers: 0, cat: 'workloads' });
      shell.style.setProperty('--workloads-color', '#c0b0ff');
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: px + 30, y: 525, w: 156, h: 52, label: POD_NAMES[i], sublabel: POD_OWNER[i], cat: 'workloads' });
      innerBox.style.setProperty('--workloads-color', '#c0b0ff');

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
      dim: true, dashed: true, color: 'control',
    });
    root.appendChild(connector);

    // Packet layer.
    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeEl);
    root.appendChild(pod1);
    root.appendChild(pod2);
    root.appendChild(pod3);
    root.appendChild(apiserver);
    root.appendChild(kubectl);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubectl, apiserver, chain, nodeEl, connector,
      cordonChip, pdbChip, healthyChip, lastChip,
      pod1, pod2, pod3, pod1Box, pod2Box, pod3Box,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['kubectl','apiserver','cordonChip','pdbChip','healthyChip','lastChip','pod1Box','pod2Box','pod3Box'],
    [s.refs.pod1, s.refs.pod2, s.refs.pod3]);
}

function resetPodOpacity(s) {
  ['pod1','pod2','pod3'].forEach(k => { s.refs[k].style.opacity = '1'; });
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Node-1 runs two Deployment-backed app Pods (web-1, web-2) and one Fluentd Pod from a DaemonSet. The Deployment has a PodDisruptionBudget with minAvailable=1, so at most one of the two web replicas may be Unavailable at any moment. The operator is about to run kubectl drain Node-1. Drain is kubectl-side orchestration of a cordon plus per-Pod eviction calls, there is no server-side drain verb.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVal(s.refs.cordonChip, 'false');
      setVal(s.refs.pdbChip, '1');
      setVal(s.refs.healthyChip, '2 of 2');
      setVal(s.refs.lastChip, '—');
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'cordon',
    duration: 2000,
    narration: 'Kubectl PATCHes Node-1 with spec.unschedulable=true. The Scheduler stops placing new Pods on this Node, and the status shows SchedulingDisabled. Already-running Pods stay put for now. Cordon is also exposed as a separate verb (kubectl cordon Node-1), drain just bundles it with the eviction loop.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVal(s.refs.cordonChip, 'true · SchedulingDisabled');
      setWire(s, 'req', 'PATCH /api/v1/nodes/Node-1 · spec.unschedulable=true');
      s.refs.kubectl.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.cordonChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) return;
      // kubectl, apiserver and cordonChip are all newly highlighted here, so the
      // Timeline auto-delta already pulses them. The PATCH rides the top hop.
      topPacket(s, ctx);
    },
  },
  {
    id: 'list',
    duration: 1900,
    narration: 'Kubectl lists Pods on Node-1 via fieldSelector=spec.nodeName=Node-1 and buckets each one. DaemonSet-owned Pods need --ignore-daemonsets (Kubectl refuses to proceed without it when DS Pods are present). Mirror Pods (the API representation of static Pods) are skipped because Kubelet would recreate them immediately. Pods with emptyDir volumes need --delete-emptydir-data or they are also refused. The remaining set, two Deployment-backed Pods here, queues for the Eviction API.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setWire(s, 'req', 'GET /api/v1/pods · fieldSelector=spec.nodeName=Node-1');
      s.refs.kubectl.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      // Listing is a read against Api: only the kubectl <-> apiserver hop
      // moves. No packet reaches the node, so no Pod reacts (the bucketing is
      // shown by the chain advancing, not by blinking a Pod the GET never touches).
      topPacket(s, ctx);
    },
  },
  {
    id: 'evict-A',
    duration: 2600,
    narration: 'Kubectl POSTs to /api/v1/namespaces/default/pods/web-1/eviction. Api reads the matching PDB, finds currentHealthy=2 and minAvailable=1, so disruptionsAllowed=1. The eviction is granted with 200 OK, disruptionsAllowed atomically decrements to 0 (via optimistic concurrency on the PDB status), and the Pod is deleted with the standard grace period. The owning ReplicaSet observes the deletion and creates a replacement, which the Scheduler places on another Ready Node, covered in the Deployment rolling update card.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVal(s.refs.healthyChip, '1 of 2');
      setVal(s.refs.lastChip, 'web-1 · 200 OK');
      setWire(s, 'req', 'POST .../pods/web-1/eviction · 200 OK');
      s.refs.kubectl.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.pdbChip.classList.add('highlight');
      s.refs.healthyChip.classList.add('highlight');
      s.refs.lastChip.classList.add('highlight');
      // Pin final state so cancel between steps does not flash to default.
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) { s.refs.pod1Box.classList.add('highlight'); return; }
      // Top packet: kubectl → apiserver (POST eviction), then the delete flows
      // down the connector. The Pod reacts only when the ball reaches the node.
      const req = topPacket(s, ctx);
      const evict = connectorPacket(s, ctx, { delay: req.arrivalMs + BEAT.afterHop });
      pulsePod(s.refs.pod1, ctx, evict.arrivalMs);
      ctx.register(s.refs.pod1.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, delay: evict.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'evict-B-retry',
    duration: 4200,
    narration: 'Kubectl POSTs eviction for web-2 next. With the web-1 replacement still spinning up, currentHealthy=1 equals minAvailable, so the PDB returns 429 Too Many Requests and the request is denied. Kubectl retries the eviction on a backoff. Once the replacement web-1 turns Ready elsewhere, currentHealthy bumps back to 2 and the next retry returns 200 OK, freeing web-2 to be evicted.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVal(s.refs.healthyChip, '1 of 2 → 2 of 2');
      setVal(s.refs.lastChip, 'web-2 · 429 → 200 OK');
      setWire(s, 'req', 'POST .../pods/web-2/eviction · 429 → retry → 200');
      s.refs.kubectl.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.pdbChip.classList.add('highlight');
      s.refs.healthyChip.classList.add('highlight');
      s.refs.lastChip.classList.add('highlight');
      // Pin final state.
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '0';
      s.refs.pod3.style.opacity = '1';
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.pod2Box.classList.add('highlight'); return; }
      // First attempt: blocked. Top packet out, 429 response back, no connector follow-up.
      const attempt = topPacket(s, ctx);
      const denied = topPacket(s, ctx, { from: 580, to: 540, y: 95, delay: attempt.arrivalMs + BEAT.afterHop });
      // Retry: kubectl → apiserver → connector → the Pod reacts on arrival.
      const retry = topPacket(s, ctx, { delay: denied.arrivalMs + BEAT.afterHop });
      const evict = connectorPacket(s, ctx, { delay: retry.arrivalMs + BEAT.afterHop });
      pulsePod(s.refs.pod2, ctx, evict.arrivalMs);
      ctx.register(s.refs.pod2.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, delay: evict.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'drained',
    duration: 2200,
    narration: 'Node-1 carries only the DaemonSet Pod now. Application traffic runs on the replacement web-1 and web-2 elsewhere. The Node is safe for kernel patch, reboot, or removal. To bring it back, kubectl uncordon Node-1 flips spec.unschedulable=false and the Scheduler can place new Pods on it again.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVal(s.refs.healthyChip, '2 of 2');
      setVal(s.refs.lastChip, '2 evicted · DS retained');
      setWire(s, 'req', 'drain complete · Node safe for maintenance');
      s.refs.kubectl.classList.add('highlight');
      s.refs.cordonChip.classList.add('highlight');
      s.refs.lastChip.classList.add('highlight');
      // Pin final state.
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '0';
      s.refs.pod3.style.opacity = '1';
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) return;
      // Nothing travels at the wrap-up: the recorded drain result flashes.
      flashChips(s, ctx, ['lastChip']);
      // fluentd (the DaemonSet Pod) is the lone survivor on Node-1: pulse it once
      // to call out that it is the only workload that stays after the drain.
      pulsePod(s.refs.pod3, ctx, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
