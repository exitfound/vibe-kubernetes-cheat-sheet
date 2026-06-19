import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, pulsePod, routePacket, topPacket, makeInit, clearHighlights, clearWires, setWire, FADE } from '../lib/control-kit.js';

// Kubelet->Node left-margin connector, shared by the static pathArrow and the packet route.
const NODE_CONNECTOR = [[320, 80], [260, 80], [260, 550], [320, 550]];

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 20 1200 620',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Container OOMKill: cgroup memory.max, kernel cgroup OOM killer, Kubelet observation via PLEG, restart',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubelet = box({ x: 320, y: 40, w: 220, h: 80, label: 'Kubelet',      sublabel: 'PLEG + status patch', cat: 'control' });
    const kernel  = box({ x: 580, y: 40, w: 220, h: 80, label: 'Linux kernel', sublabel: 'cgroup OOM killer',    cat: 'control' });

    root.appendChild(arrow({ x1: 540, y1: 65, x2: 580, y2: 65, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 580, y1: 95, x2: 540, y2: 95, dim: true, dashed: true, color: 'control' }));

    const wireKernel = text({ class: 'scheme-label code dim', x: 560, y: 148, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireKernel);

    const memChip         = valChip({ x: 820, y: 40,  w: 360, h: 32, name: 'memory.current / max', value: '100Mi / 256Mi' });
    const oomScoreChip    = valChip({ x: 820, y: 82,  w: 360, h: 32, name: 'oom_score_adj',         value: '900 (Burstable)' });
    const terminationChip = valChip({ x: 820, y: 124, w: 360, h: 32, name: 'termination',           value: 'Running' });
    const restartChip     = valChip({ x: 820, y: 166, w: 360, h: 32, name: 'restartCount',          value: '0' });
    [memChip, oomScoreChip, terminationChip, restartChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: 320, y: 220, w: 460, rowH: 32, gap: 10,
      items: [
        '1. allocate ·  workload pushes memory.current up',
        '2. cgroup   ·  usage hits memory.max, kernel notified',
        '3. OOMKill  ·  cgroup OOM killer SIGKILLs the container',
        '4. observe  ·  PLEG sees terminated, PATCH Pod status',
        '5. restart  ·  same sandbox, new container, count++',
      ],
      cat: 'control',
    });

    const nodeEl = node({ x: 320, y: 480, w: 860, h: 140, label: 'Node-1' });

    const podShell = pod({ x: 510, y: 500, w: 480, h: 110, label: 'Pod', sublabel: '', containers: 0, cat: 'workloads' });
    podShell.style.setProperty('--workloads-color', '#c0b0ff');
    const podShellRect = podShell.querySelector('.scheme-pod-rect');
    if (podShellRect) podShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const containerBox = box({ x: 600, y: 530, w: 300, h: 64, label: 'app', sublabel: 'using 100Mi of 256Mi', cat: 'workloads' });
    containerBox.style.setProperty('--workloads-color', '#c0b0ff');

    // Grouped for z-order and shared pulse. The shell (the Pod sandbox) keeps full opacity
    // through the kill; only the inner container box dims, because the sandbox survives.
    const podGroup = g({ id: 'podGroup' });
    podGroup.appendChild(podShell);
    podGroup.appendChild(containerBox);

    const connector = pathArrow({
      points: NODE_CONNECTOR,
      dim: true, dashed: true, color: 'control',
    });
    root.appendChild(connector);

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order canon: packetLayer first (under the blocks) so a packet tucks under
    // its destination on arrival; then chain, node, pod, then top-row blocks last.
    root.appendChild(packetLayer);
    root.appendChild(chain);
    root.appendChild(nodeEl);
    root.appendChild(podGroup);
    root.appendChild(kubelet);
    root.appendChild(kernel);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubelet, kernel, chain, nodeEl, podGroup, podShell, containerBox, connector,
      memChip, oomScoreChip, terminationChip, restartChip,
      packetLayer,
      wires: { kernel: wireKernel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['kubelet','kernel','memChip','oomScoreChip','terminationChip','restartChip'],
    [s.refs.podGroup]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Pod runs on Node-1 with a memory limit of 256Mi. Kubelet has written this limit into the container cgroup as memory.max. Current usage sits well under the cap, and the container reports Running.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.containerBox.style.opacity = '1';
      setBoxSublabel(s.refs.containerBox, 'using 100Mi of 256Mi');
      setVal(s.refs.memChip, '100Mi / 256Mi');
      setVal(s.refs.oomScoreChip, '900 (Burstable)');
      setVal(s.refs.terminationChip, 'Running');
      setVal(s.refs.restartChip, '0');
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'allocate',
    duration: 2000,
    narration: 'The workload grows, and memory.current keeps rising toward memory.max as the container allocates anonymous pages, page caches, and slab. The cgroup memory controller accounts every byte against the limit.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.containerBox.style.opacity = '1';
      setBoxSublabel(s.refs.containerBox, 'using 220Mi of 256Mi');
      setVal(s.refs.memChip, '220Mi / 256Mi · climbing');
      setWire(s, 'kernel', 'memory.current rising · charged to the cgroup');
      s.refs.memChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) return;
      // Pulse marks the new reading the container block just showed (220Mi).
      pulsePod(s.refs.podGroup, ctx, 0);
    },
  },
  {
    id: 'cgroup',
    duration: 2000,
    narration: 'memory.current reaches memory.max. The cgroup memory controller cannot reclaim enough (swap is disabled on most Kubernetes Nodes), so the kernel raises an out-of-memory event scoped to this one cgroup.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.containerBox.style.opacity = '1';
      setBoxSublabel(s.refs.containerBox, 'using 256Mi of 256Mi · at limit');
      setVal(s.refs.memChip, '256Mi / 256Mi · at limit');
      setWire(s, 'kernel', 'memory.current == memory.max · cgroup OOM event');
      s.refs.memChip.classList.add('highlight');
      s.refs.kernel.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      // Pulse marks the container block hitting the cap (256Mi of 256Mi).
      pulsePod(s.refs.podGroup, ctx, 0);
    },
  },
  {
    id: 'oomkill',
    duration: 2300,
    narration: 'The container is over its own memory.max and reclaim has failed, so the kernel invokes the cgroup-scoped OOM killer. It looks only at processes inside this cgroup and sends SIGKILL to the worst offender by badness score (memory footprint biased by oom_score_adj). Kubelet had set that value from the QoS class at container start: Guaranteed -997, BestEffort 1000, Burstable scaled from 3 to 999 by memory request. The container main process takes the SIGKILL.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'kernel', 'cgroup OOM killer · SIGKILL to the container');
      s.refs.kernel.classList.add('highlight');
      s.refs.oomScoreChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      // Pin final state inline so cancel between steps does not flash to default.
      setBoxSublabel(s.refs.containerBox, 'OOMKilled · SIGKILL');
      s.refs.containerBox.style.opacity = '0.4';
      if (ctx.reduced) return;
      // OOM is an in-place kernel event, nothing travels: the container flinches (pulse a
      // beat in) then goes dark (dissolve, a beat after the flinch). The shell/sandbox stays lit.
      pulsePod(s.refs.podGroup, ctx, 200);
      ctx.register(s.refs.containerBox.animate(
        [{ opacity: 1 }, { opacity: 0.4 }],
        { duration: FADE.out, delay: 700, fill: 'both', easing: 'ease-in' }
      ));
    },
  },
  {
    id: 'observe',
    duration: 2100,
    narration: 'PLEG (Pod Lifecycle Event Generator) spots the dead container on its next relist of the container runtime. Kubelet PATCHes the container status to terminated with reason OOMKilled and exitCode 137 (128 + 9 for SIGKILL). After the restart this record moves to lastState.terminated, which is what kubectl describe and get show.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.containerBox.style.opacity = '0.4';
      setBoxSublabel(s.refs.containerBox, 'terminated · exit 137');
      setVal(s.refs.terminationChip, 'OOMKilled · exitCode=137');
      setWire(s, 'kernel', 'container exited 137 · PLEG relist · PATCH status');
      s.refs.terminationChip.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      s.refs.kernel.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) return;
      // The exit status surfaces from the kernel/runtime up to kubelet (bottom arrow).
      topPacket(s, ctx, { from: 580, to: 540, y: 95 });
    },
  },
  {
    id: 'restart',
    duration: 2500,
    narration: 'restartPolicy is Always (the default), so Kubelet starts a fresh container inside the same Pod sandbox. The Pod IP and Linux namespaces are preserved and restartCount increments. Repeated OOMKills trip CrashLoopBackOff, so each retry is delayed exponentially starting at 10s and capped at 5 min.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setBoxSublabel(s.refs.containerBox, 'using 120Mi of 256Mi');
      setVal(s.refs.memChip, '120Mi / 256Mi');
      setVal(s.refs.terminationChip, 'Running (restarted)');
      setVal(s.refs.restartChip, '1');
      setWire(s, 'kernel', 'new container · write memory.max + oom_score_adj');
      s.refs.kubelet.classList.add('highlight');
      s.refs.kernel.classList.add('highlight');
      s.refs.memChip.classList.add('highlight');
      s.refs.terminationChip.classList.add('highlight');
      s.refs.restartChip.classList.add('highlight');
      // Pin final state inline.
      s.refs.containerBox.style.opacity = '1';
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) return;
      // Kubelet creates the new container on the node (connector) and rewrites its cgroup
      // (top arrow to the kernel, a beat after so the two signals read as near-simultaneous,
      // not chained). The container pulses and re-materialises on arrival.
      const create = routePacket(s, ctx, NODE_CONNECTOR);
      topPacket(s, ctx, { delay: 200 });
      pulsePod(s.refs.podGroup, ctx, create.arrivalMs);
      ctx.register(s.refs.containerBox.animate(
        [{ opacity: 0.4 }, { opacity: 1 }],
        { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }
      ));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
