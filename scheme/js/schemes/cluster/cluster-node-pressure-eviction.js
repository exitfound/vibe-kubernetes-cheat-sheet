import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, node, box, chainList, setChainActive, arrow, pathArrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, topPacket, makeInit, clearHighlights, clearWires, setWire, relationPath, lightBoxAt, at, BEAT, OPACITY } from './cluster-kit.js';
// Design notes for this card: ./CARDS.md#cluster-node-pressure-eviction

// Layout B: chips left under the panel, ladder right, Node frame full width. Panel x<=397 y<=280
// against a chip column at 296, so 16 units of headroom. CEILING 383 characters. Re-measure.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600, the canvas centre by construction

const KUBE_W = 320, KUBE_H = 80;
const TOP_Y = 40, TOP_BOTTOM = TOP_Y + KUBE_H;           // 40 / 120
const TOP_CY = TOP_Y + KUBE_H / 2;                       // 80, both top faces share it
const SPINE_X = CX;                                      // 600, between the two columns
const KUBE_X = SPINE_X - KUBE_W / 2;                     // 440..760
const KUBE_R = KUBE_X + KUBE_W;                          // 760

// Three steps say the Kubelet writes to the API, so the API is drawn. It right-aligns on CONTENT_R,
// leaving the Kubelet on the spine. ONE lane, one direction: no step names anything coming back.
const API_W = 232, API_X = CONTENT_R - API_W;            // 908..1140

// Slower than FADE.out 700, where the Pod is gone 200ms before its own pulse ends and the kill
// reads as a cut. Ends on OPACITY.terminated, not 0, or it leaves a hole in the Node frame.
const VICTIM_FADE = 1200;
// 834 is the gap midpoint, but the label is NOT contained by that gap: the longest string measures
// 351 against 148, so it overhangs by 102 either side. WIRE_Y sits ABOVE the row for that reason.
const WIRE_X = (KUBE_R + API_X) / 2;                     // 834, the gap midpoint
const WIRE_Y = TOP_Y - 14;                               // 26, above the row

const COL_BOTTOM = 456;                                  // both columns end here, 16 above the frame
const LADDER_X = 660, LADDER_W = 480;                    // 660..1140
const ROW_H = 32, ROW_GAP = 10, LADDER_ROWS = 5;
const LADDER_Y = COL_BOTTOM - (LADDER_ROWS * ROW_H + (LADDER_ROWS - 1) * ROW_GAP);   // 256..456

// Chips as a left column, 480 wide: four across the bottom left 258 units and the names
// overlapped their own values.
const CHIP_H = 34, CHIP_VGAP = 8, CHIP_COUNT = 4;
const CHIP_X = CONTENT_L, CHIP_W = 480;                  // 60..540, clear of the spine
const CHIPS_Y = COL_BOTTOM - (CHIP_COUNT * CHIP_H + (CHIP_COUNT - 1) * CHIP_VGAP);   // 296..456
const CHIP_Y = i => CHIPS_Y + i * (CHIP_H + CHIP_VGAP);

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;// 60..1140
// node() draws its own label at NODE_Y + 18, so the Pod row needs the family's 34 of top padding or
// the label lands inside the first Pod. 34 + 106 + 12 is the family 152.
const NODE_H = 152, NODE_BOTTOM = 624, NODE_Y = NODE_BOTTOM - NODE_H;   // 472..624
const POD_W = 300, POD_H = 106, POD_Y = NODE_Y + 34;     // 506..612
const POD_PAD = 24;
const POD_XS = [0, 1, 2].map(i => NODE_X + POD_PAD + i * ((NODE_W - POD_PAD * 2 - POD_W) / 2));
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };

// The one lane, addressed to the NODE rather than a Pod inside it. Which Pod the kill lands on is
// carried by the pulse, not by a tap into the Pod row.
const CONNECTOR = [[SPINE_X, TOP_BOTTOM], [SPINE_X, NODE_Y]];

// The Kubelet owns EVERY ladder row, so the tie is a RELATIONSHIP: no ball, no arrowhead, or the
// ladder becomes a destination. Face midpoint to face midpoint, turn halfway between them.
const TIE_X = SPINE_X;                                   // 600
const TIE_LAND_X = LADDER_X + LADDER_W / 2;              // 900
const TIE_JOG_Y = (TOP_BOTTOM + LADDER_Y) / 2;           // 188
const KUBE_TO_CHAIN = [[TIE_X, TOP_BOTTOM], [TIE_X, TIE_JOG_Y], [TIE_LAND_X, TIE_JOG_Y], [TIE_LAND_X, LADDER_Y]];



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
    const wireApi = text({ class: 'scheme-label code dim', x: WIRE_X, y: WIRE_Y, 'text-anchor': 'middle' }, [' ']);
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
      const shell = podShell({ x: px, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
      shell.style.setProperty('--workloads-color', '#c0b0ff');

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

    // Kubelet.bottom -> ladder.top: the eviction loop below belongs to this box. See KUBE_TO_CHAIN.
    root.appendChild(relationPath({ points: KUBE_TO_CHAIN, role: 'cluster' }));

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
      kubelet, api, chain, nodeEl,
      memChip, thresholdChip, pressureChip, victimChip,
      pod1, pod2, pod3, pod1Box, pod2Box, pod3Box,
      packetLayer,
      wires: { api: wireApi },
    };
  }

  reset() { this.build(); }
}

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  clearHighlights(s,
    ['kubelet','api','memChip','thresholdChip','pressureChip','victimChip','pod1Box','pod2Box','pod3Box'],
    [s.refs.pod1, s.refs.pod2, s.refs.pod3]);
  clearWires(s);
}

function resetPodOpacity(s) {
  ['pod1','pod2','pod3'].forEach(k => { s.refs[k].style.opacity = '1'; });
}

// The lane ends on the Node frame, which is on screen for the whole card, so it is not pinned to the
// presence of any Pod: nothing it points at can go away under it.
function setVictim(s, v) {
  s.refs.pod1.style.opacity = String(v);
}


// Every enter() writes EVERY chip through this, which is what makes the deferred turnovers safe:
// Timeline fires oncancel, never onfinish, so clicking Next mid-flight loses whatever at() held.
const THRESHOLD = 'memory.available<1Gi';
function setChips(s, { mem, pressure, victim }) {
  setVal(s.refs.memChip, mem);
  setVal(s.refs.thresholdChip, THRESHOLD);
  setVal(s.refs.pressureChip, pressure);
  setVal(s.refs.victimChip, victim);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      resetStep(s);
      resetPodOpacity(s);
      setChips(s, { mem: '4Gi', pressure: 'False', victim: 'none' });
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'detect',
    duration: 2000,
    narration: 'The cAdvisor stats report memory.available has dropped to 500Mi. Eviction manager polls these stats every 10s in its own synchronize loop (separate from cAdvisor housekeeping) and compares against the --eviction-hard signals. The threshold is breached.',
    enter(s) {
      resetStep(s);
      resetPodOpacity(s);
      setChips(s, { mem: '500Mi', pressure: 'False', victim: 'none' });
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
      resetStep(s);
      resetPodOpacity(s);
      setChips(s, { mem: '500Mi', pressure: 'True', victim: 'none' });
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
    narration: 'Eviction manager ranks running Pods by three things in order: whether each is using more of the starved resource than it requested, then Pod Priority, then how far over the request it sits. QoS class does not decide that order, it only estimates it, because a class derived from CPU and memory says nothing about the resource under pressure. See the Pod QoS Classes card.',
    enter(s, ctx) {
      resetStep(s);
      resetPodOpacity(s);
      setChips(s, { mem: '500Mi', pressure: 'True', victim: 'BestEffort Pod selected' });
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
      resetStep(s);
      setChips(s, { mem: '500Mi', pressure: 'True', victim: 'BestEffort Pod evicted' });
      setWire(s, 'api', 'PATCH Pod status · phase=Failed reason=Evicted');
      s.refs.kubelet.classList.add('highlight');
      s.refs.victimChip.classList.add('highlight');
      // Pin final state so cancel does not snap back to opacity 1. The victim stays on screen as a
      // ghost at the terminated shade rather than leaving a hole in the Pod row.
      setVictim(s, OPACITY.terminated);
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
        [{ opacity: 1 }, { opacity: OPACITY.terminated }], { duration: VICTIM_FADE, delay: kill.arrivalMs, fill: 'both', easing: 'ease-in' }));
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
      resetStep(s);
      setChips(s, { mem: '3.5Gi', pressure: 'False', victim: 'none' });
      setWire(s, 'api', 'PATCH Node.status.conditions · MemoryPressure=False');
      // The evicted Pod is still drawn, at the terminated shade: gone from the Node, not a hole.
      setVictim(s, OPACITY.terminated);
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      s.refs.kubelet.classList.add('highlight');
      s.refs.memChip.classList.add('highlight');
      s.refs.pressureChip.classList.add('highlight');
      // The victim record clears here too, which is half of what "reset" in ladder row 5 means.
      // It used to drop from "BestEffort Pod selected" to "none" with nothing marking it.
      s.refs.victimChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) { s.refs.api.classList.add('highlight'); return; }
      // Survivors pulse first, and only THEN does the condition flip back: the up-arrow order, and
      // also the sentence order. Firing both at once gives the eye two places to look.
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
