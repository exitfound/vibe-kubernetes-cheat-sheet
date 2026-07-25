import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt, makeRidingLabel } from '../lib/network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-ebpf-dataplane


const FLOW_Y = 312;                    // client <-> eBPF program lane
const FAN_X = 740;                     // fan turn, exactly midway between the program (660) and Pods (820)
const PODX_Y = 182;                    // chosen backend centre (symmetric about FLOW_Y)
const PODY_Y = 442;                    // alternative backend centre (symmetric about FLOW_Y)
const HOOK_X = 440, HOOK_W = 220;      // eBPF program box
const HOOK_RIGHT = HOOK_X + HOOK_W;    // 660: fan origin
const POD_X = 820;                     // backend Pod left edge
const DELIVER_DUR = 1200;              // slowed so the riding src-IP tag stays readable
const CLIENT_IP = 'src 10.244.1.5';

// eBPF program -> chosen / alternative backend, each as one right-angle path (right, up/down, right).
const TO_PODX = [[HOOK_RIGHT, FLOW_Y], [FAN_X, FLOW_Y], [FAN_X, PODX_Y], [POD_X, PODX_Y]];
const TO_PODY = [[HOOK_RIGHT, FLOW_Y], [FAN_X, FLOW_Y], [FAN_X, PODY_Y], [POD_X, PODY_Y]];

function clientBlock({ x, y, w, h }) {
  const shell = pod({ x, y, w, h, label: 'client Pod', sublabel: '10.244.1.5', containers: 0, role: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  // The socket dials the Service ClusterIP (10.96.0.10), not a Pod: shown here against the client own
  // Pod IP on the shell, so the two address kinds read side by side. Fits the 160-wide inner box.
  const innerBox = box({ x: x + 20, y: y + 34, w: w - 40, h: 52, label: 'socket', sublabel: 'connect() 10.96.0.10', role: 'network' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, role: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 34, w: w - 40, h: 52, label: 'app', sublabel: 'eth0', role: 'network' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
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
      'aria-label': 'The eBPF dataplane replaces kube-proxy: an eBPF program at the socket hook reads a BPF service map and rewrites the connection to a backend Pod at connect time, with no per-packet iptables rule walk and no DNAT',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = clientBlock({ x: 70, y: 252, w: 200, h: 120 });
    const hook = box({ x: HOOK_X, y: 276, w: HOOK_W, h: 72, label: 'eBPF program', sublabel: 'socket hook', role: 'network' });
    const bpfmap = box({ x: HOOK_X, y: 120, w: HOOK_W, h: 72, label: 'BPF maps', sublabel: 'service + endpoints', role: 'network' });

    // Pod top edge = centre - h/2, so both backends sit symmetric about FLOW_Y (PODX_Y / PODY_Y).
    const w1 = podBlock({ x: POD_X, y: PODX_Y - 57, w: 210, h: 114, label: 'Pod web', ip: '10.244.2.7:8080' });
    const w2 = podBlock({ x: POD_X, y: PODY_Y - 57, w: 210, h: 114, label: 'Pod web', ip: '10.244.3.9:8080' });

    // Dim dashed wires with blank labels filled per step: client -> program (connect), the program
    // -> map lookup link, and the right-angle fan to the two backends (chosen bright on use).
    const wConnect = arrow({ x1: 270, y1: FLOW_Y, x2: HOOK_X, y2: FLOW_Y, dashed: true, dim: true });
    const wLookup = arrow({ x1: 550, y1: 276, x2: 550, y2: 192, dashed: true, dim: true });
    const fanX = pathArrow({ points: TO_PODX, dashed: true, dim: true });
    const fanY = pathArrow({ points: TO_PODY, dashed: true, dim: true });
    // No connect-wire label: the connect target (ClusterIP) now lives on the client socket box.
    const lLookup = text({ class: 'scheme-label code dim', x: 565, y: 238, 'text-anchor': 'start', 'font-size': 10 }, [' ']);
    const lDeliver = text({ class: 'scheme-label code dim', x: 700, y: FLOW_Y + 20, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    // Info chips: three equal widths spanning the diagram content exactly, from the client left edge
    // (70) to the backend Pod right edge (1030), so the strip lines up with the blocks above it.
    const svcChip = valChip({ x: 70, y: 548, w: 300, h: 34, name: 'BPF svc map', value: 'pending', role: 'network' });
    const modeChip = valChip({ x: 400, y: 548, w: 300, h: 34, name: 'load balance', value: 'per-packet DNAT', role: 'network' });
    const kpChip = valChip({ x: 730, y: 548, w: 300, h: 34, name: 'kube-proxy', value: 'present', role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: map + program + client + pods, then wires + labels ABOVE, then chips, then packets.
    root.appendChild(bpfmap);
    root.appendChild(hook);
    root.appendChild(client.group);
    root.appendChild(w1.group);
    root.appendChild(w2.group);
    [wConnect, wLookup, fanX, fanY, lLookup, lDeliver].forEach(el => root.appendChild(el));
    [svcChip, modeChip, kpChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, hook, bpfmap, client: client.group, clientBox: client.innerBox,
      w1: w1.group, w1Box: w1.innerBox, w2: w2.group, w2Box: w2.innerBox,
      svcChip, modeChip, kpChip, packetLayer,
      wires: { lookup: lLookup, deliver: lDeliver },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['hook', 'bpfmap', 'svcChip', 'modeChip', 'kpChip', 'clientBox', 'w1Box', 'w2Box'],
    [s.refs.client, s.refs.w1, s.refs.w2]);
  s.refs.w2.style.opacity = '1';
}

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'network', dy: -15, inMs: 160, outMs: 200, hold: 260 });

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
      setVal(s.refs.modeChip, 'per-packet DNAT');
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
      s.refs.modeChip.classList.add('highlight');
      setWire(s, 'lookup', 'map lookup');
      setVal(s.refs.modeChip, 'connect-time');
      if (ctx.reduced) { s.refs.hook.classList.add('highlight'); s.refs.bpfmap.classList.add('highlight'); return; }
      // Up-arrow: the client pulses first, the connect call reaches the socket hook, which lights on
      // arrival. The map lights a beat later, as the program looks the address up.
      pulsePod(s.refs.client, ctx, 0);
      const send = segmentPacket(s, ctx, { from: [270, FLOW_Y], to: [HOOK_X, FLOW_Y], delay: BEAT.afterPulse, role: 'network' });
      lightBoxAt(s.refs.hook, ctx, send.arrivalMs);
      lightBoxAt(s.refs.bpfmap, ctx, send.arrivalMs + BEAT.afterHop);
    },
  },
  {
    id: 'deliver',
    duration: 2500,
    narration: 'The connection then goes straight to the Pod address, 10.244.2.7. Because the destination was chosen at the socket, this in-cluster connection needs no connection-tracking reversal on the way back, the socket talks to the Pod as if it had dialed that address directly.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.hook.classList.add('highlight');
      s.refs.modeChip.classList.add('highlight');
      setWire(s, 'deliver', 'to .2.7');
      setVal(s.refs.modeChip, 'connect-time');
      s.refs.w2.style.opacity = '0.4';
      if (ctx.reduced) { s.refs.w1Box.classList.add('highlight'); return; }
      // Down-arrow: the rewritten connection rides the right-angle route to the chosen Pod, which
      // pulses on arrival. The client source IP rides with it and arrives unchanged (no NAT).
      const give = routePacket(s, ctx, TO_PODX, { dur: DELIVER_DUR, role: 'network' });
      ridingLabel(s, ctx, CLIENT_IP, TO_PODX, { delay: 0, dur: DELIVER_DUR });
      pulsePod(s.refs.w1, ctx, give.arrivalMs);
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
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
