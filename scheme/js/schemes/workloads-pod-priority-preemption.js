import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, connectorPacket, topPacket, routePacket, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT } from '../lib/scheme-kit.js';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Pod priority and preemption: scheduler preempts the lowest-priority victim to make room for a high-priority Pod on a full node',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const scheduler = box({ x: 320, y: 40, w: 220, h: 80, label: 'Scheduler', sublabel: 'Filter + Score + Preempt', cat: 'control' });
    const apiserver = box({ x: 580, y: 40, w: 220, h: 80, label: 'Api', sublabel: 'PriorityClass + delete + bind', cat: 'control' });

    root.appendChild(arrow({ x1: 540, y1: 65, x2: 580, y2: 65, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 580, y1: 95, x2: 540, y2: 95, dim: true, dashed: true, color: 'control' }));

    const wireReq = text({ class: 'scheme-label code dim', x: 560, y: 148, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const newPodChip  = valChip({ x: 830, y: 40,  w: 350, h: 32, name: 'Pod NEW · pri', value: '2e9 (system-cluster-critical)' });
    const attemptChip = valChip({ x: 830, y: 82,  w: 350, h: 32, name: 'sched attempt',      value: 'none' });
    const victimChip  = valChip({ x: 830, y: 124, w: 350, h: 32, name: 'victim',             value: 'none' });
    const focusChip   = valChip({ x: 830, y: 166, w: 350, h: 32, name: 'focus',              value: 'none' });
    [newPodChip, attemptChip, victimChip, focusChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
      items: [
        '1. spec    ·  priorityClassName → spec.priority',
        '2. attempt ·  Filter + Score · NoFit on every node',
        '3. preempt ·  find min-priority victim set',
        '4. delete  ·  standard DELETE · no PDB check',
        '5. bind    ·  NominatedNodeName → bind freed slot',
      ],
      cat: 'control',
    });

    const nodeEl = node({ x: 320, y: 480, w: 860, h: 140, label: 'Node-1' });

    const POD_DEFS = [
      { name: 'Pod A',   sub: 'priority: 100',  x: 386 },
      { name: 'Pod B',   sub: 'priority: 1000', x: 642 },
      { name: 'Pod C',   sub: 'priority: 100',  x: 898 },
      { name: 'Pod NEW', sub: 'priority: 2e9',  x: 386 },
    ];
    const podBoxes = [];
    const podWrappers = POD_DEFS.map((d, i) => {
      const shell = pod({ x: d.x, y: 497, w: 216, h: 106, label: d.name, sublabel: '', containers: 0, cat: 'workloads' });
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: d.x + 10, y: 525, w: 196, h: 52, label: 'app', sublabel: d.sub, cat: 'workloads' });

      const wrap = g({ id: d.name === 'Pod NEW' ? 'podNew' : `pod${i + 1}` });
      wrap.appendChild(shell);
      wrap.appendChild(innerBox);
      podBoxes.push(innerBox);
      return wrap;
    });
    const [pod1, pod2, pod3, podNew] = podWrappers;
    const [pod1Box, pod2Box, pod3Box, podNewBox] = podBoxes;
    podNew.style.opacity = '0';

    const connector = pathArrow({
      points: [[320, 80], [280, 80], [280, 550], [320, 550]],
      dim: true, dashed: true, color: 'control',
    });
    root.appendChild(connector);

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeEl);
    [pod1, pod2, pod3, podNew].forEach(p => root.appendChild(p));
    root.appendChild(apiserver);
    root.appendChild(scheduler);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      scheduler, apiserver, chain, nodeEl, connector,
      newPodChip, attemptChip, victimChip, focusChip,
      pod1, pod2, pod3, podNew, pod1Box, pod2Box, pod3Box, podNewBox,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['scheduler','apiserver','newPodChip','attemptChip','victimChip','focusChip','pod1Box','pod2Box','pod3Box','podNewBox'],
    [s.refs.pod1, s.refs.pod2, s.refs.pod3, s.refs.podNew]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Three Pods are running on Node-1: Pod A and Pod C at priority 100, Pod B at priority 1000. Their cpu and memory requests sum to the node allocatable, so the node is full and cannot accept new Pods. A new Pod is about to land at the Api with priorityClassName=system-cluster-critical (numeric priority 2000000000, far above any current occupant).',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.newPodChip,  '2e9 (system-cluster-critical)');
      setVal(s.refs.attemptChip, 'none');
      setVal(s.refs.victimChip,  'none');
      setVal(s.refs.focusChip,   'none');
      s.refs.pod1.style.opacity   = '1';
      s.refs.pod2.style.opacity   = '1';
      s.refs.pod3.style.opacity   = '1';
      s.refs.podNew.style.opacity = '0';
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'spec',
    duration: 1900,
    narration: 'Pod NEW arrives at the Api. The PriorityClass admission plugin resolves spec.priorityClassName to a numeric value (system-cluster-critical → 2000000000) and writes it into spec.priority on the Pod object. PriorityClass is the only sanctioned way to express priority, raw spec.priority on a user Pod is rejected by validation. Built-in classes are system-cluster-critical and system-node-critical (slightly higher).',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.newPodChip,  '2e9 (system-cluster-critical)');
      setVal(s.refs.attemptChip, 'pending');
      setVal(s.refs.victimChip,  'none');
      setVal(s.refs.focusChip,   'priority resolved at admission');
      setWire(s, 'req', 'PriorityClass admission · spec.priority=2e9');
      s.refs.apiserver.classList.add('highlight');
      s.refs.newPodChip.classList.add('highlight');
      s.refs.pod1.style.opacity   = '1';
      s.refs.pod2.style.opacity   = '1';
      s.refs.pod3.style.opacity   = '1';
      s.refs.podNew.style.opacity = '0';
      setChainActive(s.refs.chain, 0);
      // Admission resolves the priority in place, nothing travels: the changed chips
      // take the static highlight only, no flash (info chips do not pulse).
    },
  },
  {
    id: 'attempt',
    duration: 2000,
    narration: 'Scheduler picks Pod NEW from its queue and runs the scheduling cycle. Filter plugins drop every node that fails predicates (taints, ports, requests vs allocatable, etc.). Every node here fails on capacity. Scheduler records the Pod as Unschedulable. If the Pod PriorityClass has preemptionPolicy=PreemptLowerPriority (the default), Scheduler enters preemption mode. PriorityClasses with preemptionPolicy=Never never preempt anyone, those Pods just wait in the queue.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.newPodChip,  '2e9 (system-cluster-critical)');
      setVal(s.refs.attemptChip, 'NoFit on all nodes');
      setVal(s.refs.victimChip,  'none');
      setVal(s.refs.focusChip,   'Unschedulable · entering preempt mode');
      setWire(s, 'req', 'Filter all nodes · NoFit · Event Unschedulable');
      s.refs.scheduler.classList.add('highlight');
      s.refs.attemptChip.classList.add('highlight');
      s.refs.pod1.style.opacity   = '1';
      s.refs.pod2.style.opacity   = '1';
      s.refs.pod3.style.opacity   = '1';
      s.refs.podNew.style.opacity = '0';
      setChainActive(s.refs.chain, 1);
      // The scheduling cycle fails inside the Scheduler, nothing travels: the verdict
      // chips take the static highlight only, no flash (info chips do not pulse).
    },
  },
  {
    id: 'preempt',
    duration: 2200,
    narration: 'Preemption enumerates running Pods on each node and looks for the smallest victim set whose deletion would let Pod NEW fit, with the constraint that every victim has strictly lower priority. Greedy: try lowest-priority candidates first. Pod A (priority 100) is enough on its own, freeing its 1 CPU and 1Gi memory matches Pod NEW requests. Pod C is also priority 100 but unnecessary (Pod A alone fits the resource ask). Pod B at 1000 is a valid candidate by priority but the greedy strategy prefers lower-priority victims first.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.newPodChip,  '2e9 (system-cluster-critical)');
      setVal(s.refs.attemptChip, 'preempt mode');
      setVal(s.refs.victimChip,  'Pod A · priority 100');
      setVal(s.refs.focusChip,   'min victim set · smallest, lowest pri');
      setWire(s, 'req', 'Preempt scan · Victim set: {Pod A}');
      s.refs.scheduler.classList.add('highlight');
      s.refs.victimChip.classList.add('highlight');
      s.refs.pod1.style.opacity   = '1';
      s.refs.pod2.style.opacity   = '1';
      s.refs.pod3.style.opacity   = '1';
      s.refs.podNew.style.opacity = '0';
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
      // Scheduler scans the node over the connector to find the victim set.
      // Pod A pulses when the scan reaches it (victim flagged in victimChip).
      const scan = connectorPacket(s, ctx);
      pulsePod(s.refs.pod1, ctx, scan.arrivalMs);
    },
  },
  {
    id: 'delete',
    duration: 2600,
    narration: 'Scheduler issues a standard DELETE to /api/v1/.../pods/pod-a. Preemption uses delete (not the eviction API), so PodDisruptionBudget gates are bypassed at the API layer. The preemption algorithm does try to minimize PDB violations when picking victims, but it can violate them when no PDB-friendly victim set fits. Pod A enters Terminating with its terminationGracePeriodSeconds (preStop hook → SIGTERM → SIGKILL fallback after grace expires). Pod NEW gets status.nominatedNodeName=Node-1 written by the scheduler so other Pods do not race into the freed slot during this window.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.newPodChip,  '2e9 (system-cluster-critical)');
      setVal(s.refs.attemptChip, 'preempt · nominated Node-1');
      setVal(s.refs.victimChip,  'Pod A · Terminating');
      setVal(s.refs.focusChip,   'DELETE · no PDB check for preempt');
      setWire(s, 'req', 'DELETE .../pods/pod-a · Graceful · nominatedNodeName=Node-1');
      s.refs.scheduler.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.victimChip.classList.add('highlight');
      // Pin final state inline so cancel does not flash to default.
      s.refs.pod1.style.opacity   = '0';
      s.refs.pod2.style.opacity   = '1';
      s.refs.pod3.style.opacity   = '1';
      s.refs.podNew.style.opacity = '0';
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) return;
      // DELETE hits the apiserver (top hop), then travels down the connector.
      // Pod A pulses and fades out only when the DELETE reaches the node.
      const del = topPacket(s, ctx);
      const evict = routePacket(s, ctx, [[320, 80], [280, 80], [280, 550], [320, 550]], { delay: del.arrivalMs + BEAT.afterHop, fadeIn: true });
      pulsePod(s.refs.pod1, ctx, evict.arrivalMs);
      ctx.register(s.refs.pod1.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, delay: evict.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'bind',
    duration: 2600,
    narration: 'Pod A has exited gracefully and is gone. Its allocatable capacity returns to Node-1. Scheduler picks Pod NEW again, Filter+Score now passes, and binds via POST /api/v1/.../pods/pod-new/binding. Kubelet on Node-1 starts the new Pod. The controller that owns Pod A (Deployment, StatefulSet) creates a replacement which the scheduler may place on another node, or queue if no node has capacity. Preemption is distinct from node-pressure eviction (covered separately), which uses QoS class instead of priority.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.newPodChip,  '2e9 (system-cluster-critical)');
      setVal(s.refs.attemptChip, 'bound to Node-1');
      setVal(s.refs.victimChip,  'Pod A · gone');
      setVal(s.refs.focusChip,   'nominatedNodeName cleared');
      setWire(s, 'req', 'POST .../pods/pod-new/binding · Node-1');
      s.refs.scheduler.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.attemptChip.classList.add('highlight');
      // Pin final state.
      s.refs.pod1.style.opacity   = '0';
      s.refs.pod2.style.opacity   = '1';
      s.refs.pod3.style.opacity   = '1';
      s.refs.podNew.style.opacity = '1';
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) return;
      // Bind hits the apiserver (top hop), then travels down the connector.
      // Pod NEW pulses once (pulse fades) and materializes in the freed slot when the bind reaches the node.
      const bind = topPacket(s, ctx);
      const place = routePacket(s, ctx, [[320, 80], [280, 80], [280, 550], [320, 550]], { delay: bind.arrivalMs + BEAT.afterHop, fadeIn: true });
      pulsePod(s.refs.podNew, ctx, place.arrivalMs);
      ctx.register(s.refs.podNew.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: place.arrivalMs, fill: 'both', easing: 'ease-out' }));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
