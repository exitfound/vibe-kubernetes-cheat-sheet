import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow, packet, animateAlong } from '../lib/primitives.js';
import { valChip, setVal, makeInit } from '../lib/control-kit.js';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Node drain: cordon, list-and-skip, eviction API with PDB gating',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubectl   = box({ x: 320, y: 40, w: 220, h: 80, label: 'kubectl',   sublabel: 'drain node-1',    cat: 'control' });
    const apiserver = box({ x: 580, y: 40, w: 220, h: 80, label: 'ApiServer', sublabel: 'eviction gateway', cat: 'control' });

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
        '4. PDB gate ·  ApiServer checks minAvailable, 200 or 429',
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
  ['kubectl','apiserver','cordonChip','pdbChip','healthyChip','lastChip','pod1Box','pod2Box','pod3Box']
    .forEach(k => s.refs[k].classList.remove('highlight'));
  s.refs.chain.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
}

function clearWires(s) {
  Object.values(s.refs.wires).forEach(t => { t.textContent = ''; });
}

function setWire(s, key, txt) {
  if (s.refs.wires[key]) s.refs.wires[key].textContent = txt;
}

function resetPodOpacity(s) {
  ['pod1','pod2','pod3'].forEach(k => { s.refs[k].style.opacity = '1'; });
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Node-1 runs two Deployment-backed app Pods (web-1, web-2) and one Fluentd Pod from a DaemonSet. The Deployment has a PodDisruptionBudget with minAvailable=1, so at most one of the two web replicas may be Unavailable at any moment. The operator is about to run kubectl drain node-1. Drain is kubectl-side orchestration of a cordon plus per-Pod eviction calls, there is no server-side drain verb.',
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
    narration: 'kubectl PATCHes Node-1 with spec.unschedulable=true. The Scheduler stops placing new Pods on this node, and the status shows SchedulingDisabled. Already-running Pods stay put for now. Cordon is also exposed as a separate verb (kubectl cordon node-1), drain just bundles it with the eviction loop.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVal(s.refs.cordonChip, 'true · SchedulingDisabled');
      setWire(s, 'req', 'PATCH /api/v1/nodes/node-1 · spec.unschedulable=true');
      s.refs.kubectl.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.cordonChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) return;
      const p = packet({ x: 540, y: 65, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[540, 65], [580, 65]], { duration: 800 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 800, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'list',
    duration: 1900,
    narration: 'kubectl lists Pods on Node-1 via fieldSelector=spec.nodeName=node-1 and buckets each one. DaemonSet-owned Pods need --ignore-daemonsets (kubectl refuses to proceed without it when DS Pods are present). Mirror Pods (the API representation of static Pods) are skipped because Kubelet would recreate them immediately. Pods with emptyDir volumes need --delete-emptydir-data or they are also refused. The remaining set, two Deployment-backed Pods here, queues for the Eviction API.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setWire(s, 'req', 'GET /api/v1/pods · fieldSelector=spec.nodeName=node-1');
      s.refs.kubectl.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.pod3Box.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      const p = packet({ x: 540, y: 65, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[540, 65], [580, 65]], { duration: 800 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 800, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'evict-A',
    duration: 2500,
    narration: 'kubectl POSTs to /api/v1/namespaces/default/pods/web-1/eviction. ApiServer reads the matching PDB, finds currentHealthy=2 and minAvailable=1, so disruptionsAllowed=1. The eviction is granted with 200 OK, disruptionsAllowed atomically decrements to 0 (via optimistic concurrency on the PDB status), and the Pod is deleted with the standard grace period. The owning ReplicaSet observes the deletion and creates a replacement, which the Scheduler places on another Ready node, covered in the Deployment rolling update card.',
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
      s.refs.pod1Box.classList.add('highlight');
      // Pin final state so cancel between steps does not flash to default.
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
      // Top packet: kubectl → apiserver (POST eviction).
      const pReq = packet({ x: 540, y: 65, cat: 'control' });
      s.refs.packetLayer.appendChild(pReq);
      ctx.register(animateAlong(pReq, [[540, 65], [580, 65]], { duration: 700 }));
      ctx.register(pReq.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 700, fill: 'forwards', easing: 'ease-in' }));
      // Connector packet: ApiServer instructs Kubelet to delete the Pod.
      const pDel = packet({ x: 320, y: 80, cat: 'control' });
      s.refs.packetLayer.appendChild(pDel);
      ctx.register(animateAlong(pDel, [[320, 80], [280, 80], [280, 550], [320, 550]], { duration: 1100, delay: 600 }));
      ctx.register(pDel.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1700, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(s.refs.pod1.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, delay: 1700, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'evict-B-retry',
    duration: 3200,
    narration: 'kubectl POSTs eviction for web-2 next. With the web-1 replacement still spinning up, currentHealthy=1 equals minAvailable, so the PDB returns 429 Too Many Requests and the request is denied. kubectl retries the eviction on a backoff. Once the replacement web-1 turns Ready elsewhere, currentHealthy bumps back to 2 and the next retry returns 200 OK, freeing web-2 to be evicted.',
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
      s.refs.pod2Box.classList.add('highlight');
      // Pin final state.
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '0';
      s.refs.pod3.style.opacity = '1';
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) return;
      // First attempt: blocked. Top packet out and back (no connector follow-up).
      const pTry1 = packet({ x: 540, y: 65, cat: 'control' });
      s.refs.packetLayer.appendChild(pTry1);
      ctx.register(animateAlong(pTry1, [[540, 65], [580, 65]], { duration: 600 }));
      ctx.register(pTry1.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 600, fill: 'forwards', easing: 'ease-in' }));
      // Response 429 flows back apiserver → kubectl at y=95.
      const p429 = packet({ x: 580, y: 95, cat: 'control' });
      s.refs.packetLayer.appendChild(p429);
      ctx.register(animateAlong(p429, [[580, 95], [540, 95]], { duration: 600, delay: 700 }));
      ctx.register(p429.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1300, fill: 'forwards', easing: 'ease-in' }));
      // Retry: kubectl → apiserver → connector → pod fade.
      const pTry2 = packet({ x: 540, y: 65, cat: 'control' });
      s.refs.packetLayer.appendChild(pTry2);
      ctx.register(animateAlong(pTry2, [[540, 65], [580, 65]], { duration: 600, delay: 1500 }));
      ctx.register(pTry2.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 2100, fill: 'forwards', easing: 'ease-in' }));
      const pDel = packet({ x: 320, y: 80, cat: 'control' });
      s.refs.packetLayer.appendChild(pDel);
      ctx.register(animateAlong(pDel, [[320, 80], [280, 80], [280, 550], [320, 550]], { duration: 900, delay: 2000 }));
      ctx.register(pDel.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 2900, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(s.refs.pod2.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, delay: 2900, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'drained',
    duration: 2200,
    narration: 'Node-1 carries only the DaemonSet Pod now. Application traffic runs on the replacement web-1 and web-2 elsewhere. The node is safe for kernel patch, reboot, or removal. To bring it back, kubectl uncordon node-1 flips spec.unschedulable=false and the Scheduler can place new Pods on it again.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVal(s.refs.healthyChip, '2 of 2');
      setVal(s.refs.lastChip, '2 evicted · DS retained');
      setWire(s, 'req', 'drain complete · node safe for maintenance');
      s.refs.kubectl.classList.add('highlight');
      s.refs.cordonChip.classList.add('highlight');
      s.refs.lastChip.classList.add('highlight');
      s.refs.pod3Box.classList.add('highlight');
      // Pin final state.
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '0';
      s.refs.pod3.style.opacity = '1';
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) return;
    },
  },
];

export const init = makeInit(Scene, STEPS);
