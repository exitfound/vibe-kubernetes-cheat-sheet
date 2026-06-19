import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): the top-left band (x<=380, y<=300) is reserved for the
// narration overlay, so the client Pod sits at y300 and the BPF map sits at x400. This is the
// eBPF dataplane that replaces kube-proxy: an eBPF program at the socket hook reads a BPF service
// map and rewrites the destination to a backend at connect() time, so there is no per-packet
// iptables walk and no DNAT in the path.
// Standard contract: only Pods pulse, boxes light via .highlight (the hook and map flash only on
// their own packet-less steps), packet endpoints match the static wires.
const HOOK = [400, 330, 230, 90];     // x, y, w, h
const HOOK_CY = 375;
const W1_CY = 250, W2_CY = 470;       // backend Pod centres
const POD_X = 870;

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'The eBPF dataplane replaces kube-proxy: an eBPF program at the socket hook reads a BPF service map and rewrites the connection to a backend Pod at connect time, with no per-packet iptables rule walk and no DNAT',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = clientBlock({ x: 80, y: 300, w: 240, h: 150 });
    const hook = box({ x: HOOK[0], y: HOOK[1], w: HOOK[2], h: HOOK[3], label: 'eBPF program', sublabel: 'socket / TC hook', cat: 'network' });
    const bpfmap = box({ x: 400, y: 150, w: 230, h: 96, label: 'BPF maps', sublabel: 'service + endpoints', cat: 'network' });

    const w1 = podBlock({ x: POD_X, y: 190, w: 240, h: 120, label: 'Pod web', ip: '10.244.2.7:8080' });
    const w2 = podBlock({ x: POD_X, y: 410, w: 240, h: 120, label: 'Pod web', ip: '10.244.3.9:8080' });

    // Dim dashed wires with blank labels filled per step. The lookup goes up to the map, the
    // chosen-backend wire is bright on use, the alternative stays dim.
    const wConnect = arrow({ x1: 320, y1: HOOK_CY, x2: HOOK[0], y2: HOOK_CY, dashed: true, dim: true });
    const wLookup = arrow({ x1: 515, y1: HOOK[1], x2: 515, y2: 246, dashed: true, dim: true });
    const wDeliver1 = arrow({ x1: 630, y1: 360, x2: POD_X, y2: W1_CY, dashed: true, dim: true });
    const wDeliver2 = arrow({ x1: 630, y1: 390, x2: POD_X, y2: W2_CY, dashed: true, dim: true });
    const lConnect = text({ class: 'scheme-label code dim', x: 360, y: 363, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    const lLookup = text({ class: 'scheme-label code dim', x: 545, y: 292, 'text-anchor': 'start', 'font-size': 10 }, [' ']);
    const lDeliver = text({ class: 'scheme-label code dim', x: 752, y: 296, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    const svcChip = valChip({ x: 80, y: 560, w: 380, h: 34, name: 'BPF svc map', value: 'pending', cat: 'network' });
    const modeChip = valChip({ x: 480, y: 560, w: 280, h: 34, name: 'load balance', value: 'pending', cat: 'network' });
    const kpChip = valChip({ x: 790, y: 560, w: 300, h: 34, name: 'kube-proxy', value: 'present', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: map + hook + client + pods, then wires + labels ABOVE, then chips, then packets.
    root.appendChild(bpfmap);
    root.appendChild(hook);
    root.appendChild(client.group);
    root.appendChild(w1.group);
    root.appendChild(w2.group);
    [wConnect, wLookup, wDeliver1, wDeliver2, lConnect, lLookup, lDeliver].forEach(el => root.appendChild(el));
    [svcChip, modeChip, kpChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, hook, bpfmap, client: client.group, clientBox: client.innerBox,
      w1: w1.group, w1Box: w1.innerBox, w2: w2.group, w2Box: w2.innerBox,
      svcChip, modeChip, kpChip, packetLayer,
      wires: { connect: lConnect, lookup: lLookup, deliver: lDeliver },
    };
  }

  reset() { this.build(); }
}

function clientBlock({ x, y, w, h }) {
  const shell = pod({ x, y, w, h, label: 'client Pod', sublabel: '10.244.1.5', containers: 0, cat: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 40, w: w - 40, h: 56, label: 'socket', sublabel: 'connect() 10.96.0.10', cat: 'network' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, cat: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 34, w: w - 40, h: 52, label: 'app', sublabel: 'eth0', cat: 'network' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

function clearHL(s) {
  clearHighlights(s, ['hook', 'bpfmap', 'svcChip', 'modeChip', 'kpChip', 'clientBox', 'w1Box', 'w2Box'],
    [s.refs.client, s.refs.w1, s.refs.w2]);
  s.refs.w2.style.opacity = '1';
}

// One-shot box flash for a packet-less, pod-less step (the only sanctioned block blink).
function flashBox(s, ctx, key) {
  if (ctx.reduced) return;
  const el = s.refs[key];
  if (!el) return;
  ctx.register(el.animate(
    [{ filter: 'brightness(1)' }, { filter: 'brightness(1.5)' }, { filter: 'brightness(1)' }],
    { duration: 600, easing: 'ease-out' }
  ));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'In iptables mode a packet to a ClusterIP walks a long chain of rules on every Node, and that walk grows with the number of Services. The eBPF dataplane removes that walk entirely.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.svcChip, 'pending');
      setVal(s.refs.modeChip, 'pending');
      setVal(s.refs.kpChip, 'present');
    },
  },
  {
    id: 'attach',
    duration: 2300,
    narration: 'Instead of installing iptables rules, the CNI agent attaches small eBPF programs directly to kernel hooks, at the socket layer and on the network interfaces. There are no Service rule chains to traverse at all.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.hook.classList.add('highlight');
      setVal(s.refs.kpChip, 'present');
      // Packet-less, pod-less step: a single hook flash marks the program attaching.
      flashBox(s, ctx, 'hook');
    },
  },
  {
    id: 'maps',
    duration: 2400,
    narration: 'Service and endpoint state lives in BPF maps, kept in sync from the API by the agent. A lookup of 10.96.0.10 returns the backend set, here 10.244.2.7 and 10.244.3.9, as a constant-time hash lookup no matter how many Services exist.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.bpfmap.classList.add('highlight');
      s.refs.svcChip.classList.add('highlight');
      setVal(s.refs.svcChip, '10.96.0.10 -> .2.7 .3.9');
      // Packet-less, pod-less step: flash the map as it is populated.
      flashBox(s, ctx, 'bpfmap');
    },
  },
  {
    id: 'connect-time',
    duration: 2500,
    narration: 'When the client calls connect to the ClusterIP, the socket-level eBPF program looks the address up in the map and rewrites the destination to a chosen Pod right there, before the packet is even built. This is connect-time load balancing, not per-packet DNAT.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.hook.classList.add('highlight');
      s.refs.bpfmap.classList.add('highlight');
      s.refs.modeChip.classList.add('highlight');
      setWire(s, 'connect', 'connect() 10.96.0.10');
      setWire(s, 'lookup', 'map lookup');
      setVal(s.refs.modeChip, 'connect-time');
      if (ctx.reduced) { s.refs.hook.classList.add('highlight'); return; }
      // Up-arrow: the client pulses first, the connect call reaches the hook.
      pulsePod(s.refs.client, ctx, 0);
      segmentPacket(s, ctx, { from: [320, HOOK_CY], to: [HOOK[0], HOOK_CY], delay: BEAT.afterPulse, cat: 'network' });
    },
  },
  {
    id: 'deliver',
    duration: 2500,
    narration: 'The connection then goes straight to the Pod address, 10.244.2.7. Because the choice was made at the socket, the reply needs no connection-tracking reversal on the way back, and the path is fully identity-aware.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.hook.classList.add('highlight');
      s.refs.modeChip.classList.add('highlight');
      setWire(s, 'deliver', 'to 10.244.2.7');
      setVal(s.refs.modeChip, 'connect-time');
      s.refs.w2.style.opacity = '0.4';
      if (ctx.reduced) { s.refs.w1Box.classList.add('highlight'); return; }
      // Down-arrow: the rewritten connection rides to the chosen Pod, which pulses on arrival.
      const hop = segmentPacket(s, ctx, { from: [630, 360], to: [POD_X, W1_CY], cat: 'network' });
      pulsePod(s.refs.w1, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'no-kube-proxy',
    duration: 2400,
    narration: 'Because the whole dataplane is eBPF programs plus maps, kube-proxy and its iptables chains can be removed entirely. Lookups stay constant-time as the cluster grows to thousands of Services, which is the main reason large clusters adopt this mode.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.hook.classList.add('highlight');
      s.refs.bpfmap.classList.add('highlight');
      s.refs.kpChip.classList.add('highlight');
      setVal(s.refs.kpChip, 'not needed');
      // Packet-less, pod-less step: flash the hook to show the dataplane standing on its own.
      flashBox(s, ctx, 'hook');
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
