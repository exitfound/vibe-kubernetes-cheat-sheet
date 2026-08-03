import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, topPacket, makeInit, clearHighlights, clearWires, setWire, lightBoxAt, BEAT } from '../lib/cluster-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#cluster-node-pressure-eviction

// Layout B: chips in the left column under the panel, ladder right, Node frame full width at the
// bottom. Panel worst case over 1600/1280/1100 is x<=397, y<=280, and the chip column starts at
// y=300, so there are 20 units of headroom: no narration here may pass 383 characters.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600, the canvas centre by construction

const KUBE_W = 320, KUBE_H = 80;
const TOP_Y = 40, TOP_BOTTOM = TOP_Y + KUBE_H;           // 40 / 120
const TOP_CY = TOP_Y + KUBE_H / 2;                       // 80, both top faces share it
const SPINE_X = CX;                                      // 600, between the two columns
const KUBE_X = SPINE_X - KUBE_W / 2;                     // 440..760
const KUBE_R = KUBE_X + KUBE_W;                          // 760

// Three of the five steps say the Kubelet writes to the API (the two condition flips and the Pod
// status after the kill) and the card used to draw no API at all, so that traffic was narrated and
// never shown. The box right-aligns on CONTENT_R with the ladder and the Node frame below it, which
// leaves the Kubelet centred on the spine that owns the drop into the Node. One lane, one direction:
// no step here names anything coming back, so a return would be decoration.
const API_W = 232, API_X = CONTENT_R - API_W;            // 908..1140

// The victim goes out slower than the catalog FADE.out (700). At 700 the Pod is gone 200ms before
// its own pulse ends, so the kill reads as a cut rather than as a death. 1200 lands the fade after
// the pulse and still finishes inside the step span, which the report packet already sets at 2142.
const VICTIM_FADE = 1200;
const WIRE_X = (KUBE_R + API_X) / 2;                     // 834, the gap midpoint
const WIRE_Y = TOP_Y - 14;                               // 26, above the row

const COL_BOTTOM = 456;                                  // both columns end here, 16 above the frame
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
// node() draws its own label at NODE_Y + 18, so the Pod row needs the family's 34 of top padding or
// the NODE-1 label lands inside the first Pod, which is what it was doing at +18. 34 + 106 + 12 of
// floor is 152, the same frame height cluster-node-drain uses, and the bottom stays on 624.
const NODE_H = 152, NODE_BOTTOM = 624, NODE_Y = NODE_BOTTOM - NODE_H;   // 472..624
const POD_W = 300, POD_H = 106, POD_Y = NODE_Y + 34;     // 506..612
const POD_PAD = 24;
const POD_XS = [0, 1, 2].map(i => NODE_X + POD_PAD + i * ((NODE_W - POD_PAD * 2 - POD_W) / 2));
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };

// The one lane on the card, addressed to the NODE rather than to a Pod inside it: a single drop from
// the Kubelet bottom face midpoint to the Node frame top face midpoint, both on the spine at x=600.
// Which Pod the kill lands on is carried by the pulse, not by a tap into the Pod row.
const CONNECTOR = [[SPINE_X, TOP_BOTTOM], [SPINE_X, NODE_Y]];



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

    // Top row: Kubelet, the eviction actor, clear of the narration panel, and the API it reports to.
    const kubelet = box({ x: KUBE_X, y: TOP_Y, w: KUBE_W, h: KUBE_H, label: 'Kubelet', sublabel: 'eviction manager + cAdvisor', role: 'cluster' });
    const api     = box({ x: API_X,  y: TOP_Y, w: API_W,  h: KUBE_H, label: 'API',     sublabel: 'Node and Pod status',        role: 'cluster' });
    root.appendChild(arrow({ x1: KUBE_R, y1: TOP_CY, x2: API_X, y2: TOP_CY, dim: true, dashed: true, role: 'cluster' }));
    const wireApi = text({ class: 'scheme-label code dim', x: WIRE_X, y: WIRE_Y, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireApi);

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
    root.appendChild(api);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubelet, api, chain, nodeEl, connector,
      memChip, thresholdChip, pressureChip, victimChip,
      pod1, pod2, pod3, pod1Box, pod2Box, pod3Box,
      packetLayer,
      wires: { api: wireApi },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['kubelet','api','memChip','thresholdChip','pressureChip','victimChip','pod1Box','pod2Box','pod3Box'],
    [s.refs.pod1, s.refs.pod2, s.refs.pod3]);
}

function resetPodOpacity(s) {
  ['pod1','pod2','pod3'].forEach(k => { s.refs[k].style.opacity = '1'; });
}

// The lane ends on the Node frame, which is on screen for the whole card, so it is not pinned to the
// presence of any Pod: nothing it points at can go away under it.
function setVictim(s, v) {
  s.refs.pod1.style.opacity = String(v);
}

// Runs fn at a point inside the step, or at once on the static path so the end state stays right.
function at(s, ctx, delay, fn) {
  if (ctx.reduced || delay <= 0) { fn(); return; }
  const a = s.refs.svg.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = fn;
  ctx.register(a);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
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
      clearWires(s);
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
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVal(s.refs.memChip, '500Mi');
      setVal(s.refs.pressureChip, 'True');
      setWire(s, 'api', 'PATCH Node.status.conditions · MemoryPressure=True');
      s.refs.kubelet.classList.add('highlight');
      s.refs.pressureChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) { s.refs.api.classList.add('highlight'); return; }
      // The condition flip IS a PATCH, so it rides the lane and the chip waits for it to land: the
      // Node does not carry MemoryPressure until the write reaches the API that stores it.
      setVal(s.refs.pressureChip, 'False');
      const patch = topPacket(s, ctx, { from: KUBE_R, to: API_X, y: TOP_CY, role: 'cluster' });
      lightBoxAt(s.refs.api, ctx, patch.arrivalMs);
      at(s, ctx, patch.arrivalMs, () => setVal(s.refs.pressureChip, 'True'));
    },
  },
  {
    id: 'rank',
    duration: 2200,
    narration: 'Eviction manager ranks running Pods by three things in order: whether each is using more of the starved resource than it requested, then Pod Priority, then how far over the request it sits. QoS class does not decide that order, it only estimates it, because a class derived from CPU and memory says nothing about the resource under pressure.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
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
    narration: 'Kubelet evicts the BestEffort Pod itself rather than through the Eviction API, so no PodDisruptionBudget is consulted and the terminationGracePeriodSeconds in the spec is ignored. For hard thresholds the grace period is forced to 0, an immediate SIGKILL, where normal termination gives 30s after SIGTERM. The Pod phase is set to Failed with reason Evicted and reported to the API.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.victimChip, 'BestEffort Pod evicted');
      setWire(s, 'api', 'PATCH Pod status · phase=Failed reason=Evicted');
      s.refs.kubelet.classList.add('highlight');
      s.refs.victimChip.classList.add('highlight');
      // Pin final state so cancel does not snap back to opacity 1.
      setVictim(s, 0);
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.api.classList.add('highlight'); return; }
      // The chip reads what the step STARTS from, which is what rank left, and turns over on the
      // same beat the Pod dies: evicted is a fact about the kill, not about the SIGKILL leaving.
      setVal(s.refs.victimChip, 'BestEffort Pod selected');
      // SIGKILL travels to the node, the victim reacts only on arrival. delay 0 means
      // routePacket starts the ball visible (fadeIn is delay-gated), matching the old call.
      const kill = routePacket(s, ctx, CONNECTOR, { role: 'cluster' });
      at(s, ctx, kill.arrivalMs, () => setVal(s.refs.victimChip, 'BestEffort Pod evicted'));
      pulsePod(s.refs.pod1, ctx, kill.arrivalMs);
      ctx.register(s.refs.pod1.animate(
        [{ opacity: 1 }, { opacity: 0 }], { duration: VICTIM_FADE, delay: kill.arrivalMs, fill: 'both', easing: 'ease-in' }));
      // The status report is the LAST thing the sentence says, and it can only be sent once the Pod
      // is actually dead, so it leaves after the kill lands rather than alongside it.
      const report = topPacket(s, ctx, { from: KUBE_R, to: API_X, y: TOP_CY, delay: kill.arrivalMs + BEAT.afterHop, role: 'cluster' });
      lightBoxAt(s.refs.api, ctx, report.arrivalMs);
    },
  },
  {
    id: 'relieve',
    duration: 2200,
    narration: 'Memory frees up, and cAdvisor reports memory.available back above the threshold. After --eviction-pressure-transition-period (default 5min) of staying clear, Kubelet flips MemoryPressure back to False. Scheduling resumes for new Pods.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.memChip, '3.5Gi');
      setVal(s.refs.pressureChip, 'False');
      setVal(s.refs.victimChip, 'none');
      setWire(s, 'api', 'PATCH Node.status.conditions · MemoryPressure=False');
      setVictim(s, 0);
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      s.refs.kubelet.classList.add('highlight');
      s.refs.memChip.classList.add('highlight');
      s.refs.pressureChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) { s.refs.api.classList.add('highlight'); return; }
      // Pressure cleared: the survivors pulse together, and only THEN does the condition flip back
      // over the same lane it flipped forward on. This is the up-arrow order (pulse first, packet at
      // BEAT.afterPulse) and it is also the sentence order: the memory frees up, and the Kubelet
      // flips MemoryPressure because of that. Firing both at once gave the eye two places to look.
      pulsePod(s.refs.pod2, ctx, 0);
      pulsePod(s.refs.pod3, ctx, 0);
      setVal(s.refs.pressureChip, 'True');
      const clear = topPacket(s, ctx, { from: KUBE_R, to: API_X, y: TOP_CY, delay: BEAT.afterPulse, role: 'cluster' });
      lightBoxAt(s.refs.api, ctx, clear.arrivalMs);
      at(s, ctx, clear.arrivalMs, () => setVal(s.refs.pressureChip, 'False'));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
