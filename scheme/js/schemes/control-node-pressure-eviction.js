import { svg, g } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, makeInit, clearHighlights, FADE } from '../lib/control-kit.js';

const CONNECTOR = [[320, 80], [280, 80], [280, 550], [320, 550]];

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 20 1200 620',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Node-pressure eviction: detect, condition, rank, evict, relieve',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Top row: Kubelet (the eviction actor) on the left, state chips column on the right.
    const kubelet = box({ x: 320, y: 40, w: 320, h: 80, label: 'Kubelet', sublabel: 'eviction manager + cAdvisor', cat: 'control' });

    // State chips column (right of Kubelet, starting at the same Y).
    const memChip       = valChip({ x: 700, y: 40,  w: 480, h: 32, name: 'memory.available',  value: '4Gi' });
    const thresholdChip = valChip({ x: 700, y: 82,  w: 480, h: 32, name: '--eviction-hard',   value: 'memory.available<1Gi' });
    const pressureChip  = valChip({ x: 700, y: 124, w: 480, h: 32, name: 'MemoryPressure',    value: 'False' });
    const victimChip    = valChip({ x: 700, y: 166, w: 480, h: 32, name: 'victim',            value: '—' });
    [memChip, thresholdChip, pressureChip, victimChip].forEach(c => root.appendChild(c));

    // Pipeline chain on the left, 5 stages of node-pressure eviction.
    const chain = chainList({
      x: 320, y: 240, w: 400, rowH: 32, gap: 10,
      items: [
        '1. detect    ·  cAdvisor stats vs threshold',
        '2. condition ·  set MemoryPressure on Node',
        '3. rank      ·  by QoS class and priority',
        '4. evict     ·  SIGKILL victim, grace 0',
        '5. relieve   ·  pressure clears, reset',
      ],
      cat: 'control',
    });

    // Bottom row: Node-1 container with three Pods of different QoS classes.
    const nodeEl = node({ x: 320, y: 480, w: 860, h: 140, label: 'Node-1' });

    const QOS_LABELS = ['BestEffort', 'Burstable', 'Guaranteed'];
    const POD_XS     = [386, 642, 898];
    const podBoxes = [];
    const podWrappers = POD_XS.map((px, i) => {
      const shell = pod({ x: px, y: 497, w: 216, h: 106, label: 'Pod', sublabel: '', containers: 0, cat: 'workloads' });
      shell.style.setProperty('--workloads-color', '#c0b0ff');
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: px + 30, y: 525, w: 156, h: 52, label: 'app', sublabel: QOS_LABELS[i], cat: 'workloads' });
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

    // Append in z-order: chain, node, pods, top-row block last so they render on top of packets.
    root.appendChild(chain);
    root.appendChild(nodeEl);
    root.appendChild(pod1);
    root.appendChild(pod2);
    root.appendChild(pod3);
    root.appendChild(kubelet);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubelet, chain, nodeEl, connector,
      memChip, thresholdChip, pressureChip, victimChip,
      pod1, pod2, pod3, pod1Box, pod2Box, pod3Box,
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['kubelet','memChip','thresholdChip','pressureChip','victimChip','pod1Box','pod2Box','pod3Box'],
    [s.refs.pod1, s.refs.pod2, s.refs.pod3]);
}

function resetPodOpacity(s) {
  ['pod1','pod2','pod3'].forEach(k => { s.refs[k].style.opacity = '1'; });
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Kubelet on Node-1 monitors local resource usage via cAdvisor. While usage stays below the configured eviction thresholds, all Pods run normally regardless of QoS class.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      resetPodOpacity(s);
      setVal(s.refs.memChip, '4Gi');
      setVal(s.refs.thresholdChip, 'memory.available<1Gi');
      setVal(s.refs.pressureChip, 'False');
      setVal(s.refs.victimChip, '—');
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'detect',
    duration: 2000,
    narration: 'cAdvisor reports memory.available has dropped to 500Mi. Eviction manager polls these stats every 10s in its own synchronize loop (separate from cAdvisor housekeeping) and compares against the --eviction-hard signals. The threshold is breached.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      resetPodOpacity(s);
      setVal(s.refs.memChip, '500Mi');
      setVal(s.refs.pressureChip, 'False');
      setVal(s.refs.victimChip, '—');
      s.refs.kubelet.classList.add('highlight');
      s.refs.memChip.classList.add('highlight');
      s.refs.thresholdChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      // Local stats comparison: nothing travels and no block flashes, the
      // changed memory.available reading and lit threshold carry the step.
    },
  },
  {
    id: 'condition',
    duration: 2000,
    narration: 'Kubelet PATCHes Node.status.conditions: MemoryPressure flips from False to True. TaintNodesByCondition controller translates this into a NoSchedule taint (node.kubernetes.io/memory-pressure), so Pods that do not tolerate it can no longer be scheduled here. By default BestEffort and Burstable workloads carry no such toleration.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      resetPodOpacity(s);
      setVal(s.refs.memChip, '500Mi');
      setVal(s.refs.pressureChip, 'True');
      s.refs.kubelet.classList.add('highlight');
      s.refs.pressureChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      // The condition flip is a status PATCH with no node-side effect yet:
      // nothing travels and no block flashes, the MemoryPressure value carries it.
    },
  },
  {
    id: 'rank',
    duration: 2200,
    narration: 'Eviction manager ranks running Pods by victim priority: BestEffort first (no requests, easiest to lose), then Burstable Pods using more than their requests, then Guaranteed last. Within ties, lower PriorityClass loses first.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      resetPodOpacity(s);
      setVal(s.refs.victimChip, 'BestEffort Pod selected');
      s.refs.kubelet.classList.add('highlight');
      s.refs.victimChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) { s.refs.pod1Box.classList.add('highlight'); return; }
      // The ranking lands on the BestEffort Pod: mark the victim with a pulse.
      pulsePod(s.refs.pod1, ctx, 400);
    },
  },
  {
    id: 'evict',
    duration: 2500,
    narration: 'Kubelet evicts the BestEffort Pod. For hard thresholds the grace period is forced to 0 (immediate SIGKILL), unlike normal Pod termination which gives 30s after SIGTERM before SIGKILL. The Pod is removed locally and its status is reported to Api.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.victimChip, 'BestEffort Pod evicted');
      s.refs.kubelet.classList.add('highlight');
      s.refs.victimChip.classList.add('highlight');
      // Pin final state so cancel does not snap back to opacity 1.
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) return;
      // SIGKILL travels to the node, the victim reacts only on arrival. delay 0 means
      // routePacket starts the ball visible (fadeIn is delay-gated), matching the old call.
      const kill = routePacket(s, ctx, CONNECTOR);
      pulsePod(s.refs.pod1, ctx, kill.arrivalMs);
      ctx.register(s.refs.pod1.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, delay: kill.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'relieve',
    duration: 2200,
    narration: 'Memory frees up, and cAdvisor reports memory.available back above the threshold. After --eviction-pressure-transition-period (default 5min) of staying clear, Kubelet flips MemoryPressure back to False. Scheduling resumes for new Pods.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.memChip, '3.5Gi');
      setVal(s.refs.pressureChip, 'False');
      setVal(s.refs.victimChip, '—');
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      s.refs.kubelet.classList.add('highlight');
      s.refs.memChip.classList.add('highlight');
      s.refs.pressureChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) return;
      // Pressure cleared: the survivors pulse together.
      pulsePod(s.refs.pod2, ctx, 0);
      pulsePod(s.refs.pod3, ctx, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
