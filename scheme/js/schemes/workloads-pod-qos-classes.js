import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, pulsePod, connectorPacket, topPacket, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT } from '../lib/workloads-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#workloads-pod-qos-classes


function setSublabels(s, a, b, c) {
  setBoxSublabel(s.refs.pod1Box, a);
  setBoxSublabel(s.refs.pod2Box, b);
  setBoxSublabel(s.refs.pod3Box, c);
}

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Pod QoS classes: Api derives qosClass from requests vs limits at admission, Kubelet applies cgroup config and oom_score_adj by tier',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubelet   = box({ x: 320, y: 40, w: 220, h: 80, label: 'Kubelet',   sublabel: 'cgroups + eviction',            role: 'cluster' });
    const apiserver = box({ x: 580, y: 40, w: 220, h: 80, label: 'Api', sublabel: 'admission · qosClass · binding', role: 'cluster' });

    root.appendChild(arrow({ x1: 540, y1: 65, x2: 580, y2: 65, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: 580, y1: 95, x2: 540, y2: 95, dim: true, dashed: true, role: 'cluster' }));

    const wireReq = text({ class: 'scheme-label code dim', x: 560, y: 148, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const pod1Chip  = valChip({ x: 830, y: 40,  w: 350, h: 32, name: 'Pod A · qosClass', value: 'pending', role: 'workloads' });
    const pod2Chip  = valChip({ x: 830, y: 82,  w: 350, h: 32, name: 'Pod B · qosClass', value: 'pending', role: 'workloads' });
    const pod3Chip  = valChip({ x: 830, y: 124, w: 350, h: 32, name: 'Pod C · qosClass', value: 'pending', role: 'workloads' });
    const focusChip = valChip({ x: 830, y: 166, w: 350, h: 32, name: 'focus',            value: 'none', role: 'workloads' });
    [pod1Chip, pod2Chip, pod3Chip, focusChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
      items: [
        '1. spec      ·  3 Pods, different resource shapes',
        '2. classify  ·  Api derives qosClass at admission',
        '3. schedule  ·  scheduler bins by requests only',
        '4. cgroups   ·  Kubelet sets memory.max + oom_score_adj',
        '5. tiers     ·  evict: BestEffort → Burstable → Guaranteed',
      ],
      role: 'cluster',
    });

    const nodeEl = node({ x: 320, y: 480, w: 860, h: 140, label: 'Node-1' });

    const POD_NAMES = ['Pod A', 'Pod B', 'Pod C'];
    const POD_SUBS  = ['no requests · no limits', 'req only · 500m / 256Mi', 'req == limits · 1 / 1Gi'];
    const POD_XS    = [386, 642, 898];
    const podBoxes = [];
    const podWrappers = POD_XS.map((px, i) => {
      const shell = pod({ x: px, y: 497, w: 216, h: 106, label: POD_NAMES[i], sublabel: '', containers: 0, role: 'workloads' });
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: px + 10, y: 525, w: 196, h: 52, label: 'app', sublabel: POD_SUBS[i], role: 'workloads' });

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
      dim: true, dashed: true, role: 'cluster',
    });
    root.appendChild(connector);

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeEl);
    [pod1, pod2, pod3].forEach(p => root.appendChild(p));
    root.appendChild(kubelet);
    root.appendChild(apiserver);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      apiserver, kubelet, chain, nodeEl, connector,
      pod1Chip, pod2Chip, pod3Chip, focusChip,
      pod1, pod2, pod3, pod1Box, pod2Box, pod3Box,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['apiserver','kubelet','pod1Chip','pod2Chip','pod3Chip','focusChip','pod1Box','pod2Box','pod3Box'],
    [s.refs.pod1, s.refs.pod2, s.refs.pod3]);
}
function resetPodOpacity(s) {
  ['pod1','pod2','pod3'].forEach(k => { s.refs[k].style.opacity = '1'; });
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Three new Pods arrive at the Api. Each has a different shape of the resources block: Pod A leaves it empty, Pod B sets requests only, Pod C sets requests equal to limits. From this shape K8s derives a QoS class for each Pod, which later decides how aggressively the kernel and Kubelet protect or evict it under memory pressure.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setSublabels(s, 'no requests · no limits', 'req only · 500m / 256Mi', 'req == limits · 1 / 1Gi');
      setVal(s.refs.pod1Chip, 'pending');
      setVal(s.refs.pod2Chip, 'pending');
      setVal(s.refs.pod3Chip, 'pending');
      setVal(s.refs.focusChip, 'none');
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'spec',
    duration: 1700,
    narration: 'The classification rule has three outcomes. BestEffort: no container has any requests or limits at all. Guaranteed: every container has CPU and memory requests and limits set, with requests equal to limits. Burstable: anything in between (at least one resource declared but does not match the Guaranteed pattern).',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setSublabels(s, 'no requests · no limits', 'req only · 500m / 256Mi', 'req == limits · 1 / 1Gi');
      setVal(s.refs.pod1Chip, 'pending');
      setVal(s.refs.pod2Chip, 'pending');
      setVal(s.refs.pod3Chip, 'pending');
      setVal(s.refs.focusChip, '3 shapes inspected');
      setWire(s, 'req', 'Rule: empty → BestEffort · req==lim → Guaranteed · Else Burstable');
      s.refs.apiserver.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      // The rule is read inside the Api, nothing travels: the focus chip takes the
      // static highlight only, no flash (info chips do not pulse).
    },
  },
  {
    id: 'classify',
    duration: 2100,
    narration: 'Api applies the rule and tags each Pod with its class on status.qosClass. Pod A becomes BestEffort (empty resources). Pod B becomes Burstable (requests only, no limits). Pod C becomes Guaranteed (requests equal limits everywhere). This tag is set once at creation and never changes for the rest of the Pod life.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setSublabels(s, 'BestEffort', 'Burstable', 'Guaranteed');
      setVal(s.refs.pod1Chip, 'BestEffort');
      setVal(s.refs.pod2Chip, 'Burstable');
      setVal(s.refs.pod3Chip, 'Guaranteed');
      setVal(s.refs.focusChip, 'status.qosClass written');
      setWire(s, 'req', 'status.qosClass · A=BestEffort · B=Burstable · C=Guaranteed');
      s.refs.apiserver.classList.add('highlight');
      s.refs.pod1Chip.classList.add('highlight');
      s.refs.pod2Chip.classList.add('highlight');
      s.refs.pod3Chip.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      // Api tags all three Pods with their qosClass at once: they pulse together.
      pulsePod(s.refs.pod1, ctx, 0);
      pulsePod(s.refs.pod2, ctx, 0);
      pulsePod(s.refs.pod3, ctx, 0);
    },
  },
  {
    id: 'schedule',
    duration: 2600,
    narration: 'Scheduler picks a node for each Pod. It looks only at requests, ignoring both limits and the QoS class. Pod A asks for nothing and fits anywhere. Pod B competes for 500m CPU and 256Mi memory. Pod C competes for 1 CPU and 1Gi memory. Once a node passes the checks, the Pod is bound to it via POST .../pods/{name}/binding.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setSublabels(s, 'BestEffort', 'Burstable', 'Guaranteed');
      setVal(s.refs.pod1Chip, 'BestEffort');
      setVal(s.refs.pod2Chip, 'Burstable');
      setVal(s.refs.pod3Chip, 'Guaranteed');
      setVal(s.refs.focusChip, 'scheduler · requests only');
      setWire(s, 'req', 'POST .../pods/{name}/binding · Scheduler reads requests');
      s.refs.apiserver.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
      // Api writes the binding, the kubelet observes it and places each Pod on the node.
      // Top packet Api -> Kubelet (binding delivered), then the connector ball Kubelet -> node.
      const bind = topPacket(s, ctx, { from: 580, to: 540, y: 95, role: 'workloads' });
      const place = connectorPacket(s, ctx, { delay: bind.arrivalMs + BEAT.afterHop, role: 'workloads' });
      pulsePod(s.refs.pod1, ctx, place.arrivalMs);
      pulsePod(s.refs.pod2, ctx, place.arrivalMs);
      pulsePod(s.refs.pod3, ctx, place.arrivalMs);
    },
  },
  {
    id: 'cgroups',
    duration: 2300,
    narration: 'Kubelet on the chosen node writes the Linux cgroup config for each Pod. The container memory cap (memory.max) and CPU cap (cpu.max) come from limits. If limits are absent (Pod A is BestEffort) there is no cap at all. Kubelet also writes oom_score_adj for each container process, a number the kernel uses to choose which process to kill first under memory pressure. BestEffort gets 1000 (kernel picks it first). Guaranteed gets -997 (almost never picked). Burstable sits in between, scaled by its memory request via 1000 - 1000*(request/capacity), clamped to range 3..999.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setSublabels(s, 'BestEffort · oom_score=1000', 'Burstable · oom_score~scaled', 'Guaranteed · oom_score=-997');
      setVal(s.refs.pod1Chip, 'BestEffort');
      setVal(s.refs.pod2Chip, 'Burstable');
      setVal(s.refs.pod3Chip, 'Guaranteed');
      setVal(s.refs.focusChip, 'memory.max · oom_score_adj');
      setWire(s, 'req', 'Cgroup v2 · memory.max + cpu.max + oom_score_adj');
      s.refs.kubelet.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) return;
      // Kubelet pushes cgroup config down to the node, each Pod pulses as it is written.
      const cg = connectorPacket(s, ctx, { role: 'workloads' });
      pulsePod(s.refs.pod1, ctx, cg.arrivalMs);
      pulsePod(s.refs.pod2, ctx, cg.arrivalMs);
      pulsePod(s.refs.pod3, ctx, cg.arrivalMs);
    },
  },
  {
    id: 'tiers',
    duration: 2200,
    narration: 'When the node runs low on memory, Kubelet picks victims by QoS class. Pod A (BestEffort) is killed first regardless of how much memory it actually uses. Pod B (Burstable) is next, ordered by how much it consumed above its request. Pod C (Guaranteed) survives last and is only touched by the kernel OOMKiller in extreme cases. This is QoS-based eviction, a separate mechanism from priority-based preemption (which is covered in its own card).',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setSublabels(s, 'BestEffort · evicted 1st', 'Burstable · evicted 2nd', 'Guaranteed · survives');
      setVal(s.refs.pod1Chip, 'BestEffort');
      setVal(s.refs.pod2Chip, 'Burstable');
      setVal(s.refs.pod3Chip, 'Guaranteed');
      setVal(s.refs.focusChip, 'evict order: A → B → C');
      setWire(s, 'req', 'Eviction order: BestEffort → Burstable → Guaranteed');
      s.refs.kubelet.classList.add('highlight');
      s.refs.pod1Chip.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      s.refs.pod1.style.opacity = '0.4';
      s.refs.pod2.style.opacity = '0.4';
      s.refs.pod3.style.opacity = '1';
      if (ctx.reduced) return;
      const evict = connectorPacket(s, ctx, { role: 'workloads' });
      pulsePod(s.refs.pod1, ctx, evict.arrivalMs);
      pulsePod(s.refs.pod2, ctx, evict.arrivalMs);
      pulsePod(s.refs.pod3, ctx, evict.arrivalMs);
      ctx.register(s.refs.pod1.animate([{ opacity: 1 }, { opacity: 0.4 }], { duration: FADE.out, delay: evict.arrivalMs, fill: 'both', easing: 'ease-in' }));
      ctx.register(s.refs.pod2.animate([{ opacity: 1 }, { opacity: 0.4 }], { duration: FADE.out, delay: evict.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
