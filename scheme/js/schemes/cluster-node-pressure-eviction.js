import { svg, g } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, makeInit, clearHighlights, FADE } from '../lib/cluster-kit.js';

// Layout B: chips in the left column under the panel, ladder right, Node frame full width at the
// bottom. Panel worst case over 1600/1280/1100 is x<=397, y<=280.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600, the canvas centre by construction
const PANEL_R = 400, PANEL_B = 280;                      // the reserved corner, measured

const KUBE_W = 320, KUBE_H = 80;
const TOP_Y = 40, TOP_BOTTOM = TOP_Y + KUBE_H;           // 40 / 120
const SPINE_X = CX;                                      // 600, between the two columns
const KUBE_X = SPINE_X - KUBE_W / 2;                     // 440..760

const COL_BOTTOM = 460;                                  // both columns end here, above the frame
const LADDER_X = 660, LADDER_W = 480;                    // 660..1140
const ROW_H = 32, ROW_GAP = 10, LADDER_ROWS = 5;
const LADDER_Y = COL_BOTTOM - (LADDER_ROWS * ROW_H + (LADDER_ROWS - 1) * ROW_GAP);   // 260..460

// Chips as a left column, 480 wide: four across the bottom left 258 units and the names
// overlapped their own values.
const CHIP_H = 34, CHIP_VGAP = 8, CHIP_COUNT = 4;
const CHIP_X = CONTENT_L, CHIP_W = 480;                  // 60..540, clear of the spine
const CHIPS_Y = COL_BOTTOM - (CHIP_COUNT * CHIP_H + (CHIP_COUNT - 1) * CHIP_VGAP);   // 300..460
const CHIP_Y = i => CHIPS_Y + i * (CHIP_H + CHIP_VGAP);

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;// 60..1140
const NODE_Y = 484, NODE_H = 140;                        // 484..624, below both columns
const POD_W = 300, POD_H = 106, POD_Y = NODE_Y + 18;     // 502..608
const POD_PAD = 24;
const POD_XS = [0, 1, 2].map(i => NODE_X + POD_PAD + i * ((NODE_W - POD_PAD * 2 - POD_W) / 2));
const POD_CXS = POD_XS.map(x => x + POD_W / 2);          // 234 / 600 / 966
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };

// The one lane on the card: Kubelet down to the Pod it evicts, which is always the BestEffort one.
// It ends on that Pod, not on the Node frame edge above it.
const BUS_Y = (COL_BOTTOM + NODE_Y) / 2;                 // 472, midway between the columns and the frame
const CONNECTOR = [[SPINE_X, TOP_BOTTOM], [SPINE_X, BUS_Y], [POD_CXS[0], BUS_Y], [POD_CXS[0], POD_Y]];



class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Node-pressure eviction: detect, condition, rank, evict, relieve',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Top row: Kubelet, the eviction actor, clear of the narration panel.
    const kubelet = box({ x: KUBE_X, y: TOP_Y, w: KUBE_W, h: KUBE_H, label: 'Kubelet', sublabel: 'eviction manager + cAdvisor', role: 'cluster' });

    // State chips, one column in the free band left of the spine and below the panel.
    const memChip       = valChip({ x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'memory.available',  value: '4Gi', role: 'cluster' });
    const thresholdChip = valChip({ x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: '--eviction-hard',   value: 'memory.available<1Gi', role: 'cluster' });
    const pressureChip  = valChip({ x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'MemoryPressure',    value: 'False', role: 'cluster' });
    const victimChip    = valChip({ x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'victim',            value: 'none', role: 'cluster' });
    [memChip, thresholdChip, pressureChip, victimChip].forEach(c => root.appendChild(c));

    // Pipeline chain, right of the spine.
    const chain = chainList({
      x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. detect    ·  cAdvisor stats vs threshold',
        '2. condition ·  set MemoryPressure on Node',
        '3. rank      ·  over request, then priority',
        '4. evict     ·  SIGKILL victim, grace 0',
        '5. relieve   ·  pressure clears, reset',
      ],
      role: 'cluster',
    });

    // Bottom row: Node-1 container with three Pods of different QoS classes.
    const nodeEl = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });

    const QOS_LABELS = ['BestEffort', 'Burstable', 'Guaranteed'];
    const podBoxes = [];
    const podWrappers = POD_XS.map((px, i) => {
      const shell = pod({ x: px, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
      shell.style.setProperty('--workloads-color', '#c0b0ff');
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: px + POD_INNER.dx, y: POD_Y + POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: QOS_LABELS[i], role: 'workloads' });
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
      points: CONNECTOR,
      dim: true, dashed: true, role: 'cluster',
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
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      resetPodOpacity(s);
      setVal(s.refs.memChip, '4Gi');
      setVal(s.refs.thresholdChip, 'memory.available<1Gi');
      setVal(s.refs.pressureChip, 'False');
      setVal(s.refs.victimChip, 'none');
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'detect',
    duration: 2000,
    narration: 'The cAdvisor stats report memory.available has dropped to 500Mi. Eviction manager polls these stats every 10s in its own synchronize loop (separate from cAdvisor housekeeping) and compares against the --eviction-hard signals. The threshold is breached.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      resetPodOpacity(s);
      setVal(s.refs.memChip, '500Mi');
      setVal(s.refs.pressureChip, 'False');
      setVal(s.refs.victimChip, 'none');
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
    narration: 'Kubelet PATCHes Node.status.conditions: MemoryPressure flips from False to True. The node controller translates this into a NoSchedule taint (node.kubernetes.io/memory-pressure), so Pods that do not tolerate it can no longer be scheduled here. By default only BestEffort workloads carry no such toleration, the control plane adds it to every Pod in the Burstable or Guaranteed class.',
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
    narration: 'Eviction manager ranks running Pods by three things in order: whether each is using more of the starved resource than it requested, then Pod Priority, then how far over the request it sits. QoS class does not decide that order, it only estimates it, because a class derived from CPU and memory says nothing about the resource under pressure.',
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
    duration: 2700,
    narration: 'Kubelet evicts the BestEffort Pod. For hard thresholds the grace period is forced to 0 (immediate SIGKILL), unlike normal Pod termination which gives 30s after SIGTERM before SIGKILL. The Pod is removed locally and its status is reported to the API.',
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
      const kill = routePacket(s, ctx, CONNECTOR, { role: 'cluster' });
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
      setVal(s.refs.victimChip, 'none');
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
