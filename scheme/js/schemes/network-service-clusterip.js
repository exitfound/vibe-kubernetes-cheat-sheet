import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay; the flow
// runs left to right along y312 (client -> kube-proxy -> backend Pod), the virtual ClusterIP
// sits ABOVE kube-proxy (it owns no interface and the packet never reaches it, kube-proxy
// intercepts), and the chip strip is at the bottom.
// Standard contract (matches the pod-networking cards):
//   - Pods are the shell + inner eth0 box, grouped so pulsePod animates both.
//   - Packets ride only the dashed wires in the gaps and stop at block edges; the DNAT and the
//     reverse NAT happen INSIDE kube-proxy, so the ball fades at one edge and re-emerges at the
//     far edge, never sliding over the box.
//   - kube-proxy is infrastructure: it lights, it never pulses. Only Pods pulse.
const FLOW_Y = 312;     // client <-> kube-proxy horizontal lane
const FAN_X = 705;      // vertical bus where the kube-proxy -> Pod fan turns
const PODX_Y = 247;     // chosen backend centre
const PODY_Y = 477;     // alternative backend centre

// kube-proxy -> chosen backend, as one right-angle path (right, up, right). Reused for the
// reverse direction on the reply.
const TO_PODX = [[660, FLOW_Y], [FAN_X, FLOW_Y], [FAN_X, PODX_Y], [820, PODX_Y]];
const FROM_PODX = [[820, PODX_Y], [FAN_X, PODX_Y], [FAN_X, FLOW_Y], [660, FLOW_Y]];

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
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

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'ClusterIP routing via kube-proxy: a client sends to a virtual ClusterIP that no interface owns, kube-proxy intercepts and DNATs the packet to a backing Pod, and connection tracking rewrites the reply so the client never sees the Pod address',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = podBlock({ x: 70, y: 252, w: 190, h: 120, label: 'client Pod', ip: '10.244.1.5' });
    const vip    = box({ x: 440, y: 120, w: 220, h: 72, label: 'ClusterIP 10.96.0.10:80', sublabel: 'virtual · no interface', cat: 'network' });
    const kproxy = box({ x: 440, y: 276, w: 220, h: 72, label: 'kube-proxy', sublabel: 'DNAT dataplane', cat: 'network' });
    const podX = podBlock({ x: 820, y: 190, w: 210, h: 114, label: 'Pod web', ip: '10.244.2.7:8080' });
    const podY = podBlock({ x: 820, y: 420, w: 210, h: 114, label: 'Pod web', ip: '10.244.3.9:8080' });

    // client -> kube-proxy lane, the vip->kproxy ownership link, and the right-angle fan to the
    // two backend Pods (the chosen lane bright on use, the alternative stays dim).
    const cWire  = arrow({ x1: 260, y1: FLOW_Y, x2: 440, y2: FLOW_Y, dashed: true, dim: true, color: 'network' });
    const ownLink = arrow({ x1: 550, y1: 192, x2: 550, y2: 276, dashed: true, dim: true, color: 'network' });
    const fanX = pathArrow({ points: TO_PODX, dashed: true, dim: true, color: 'network' });
    const fanY = pathArrow({ points: [[660, FLOW_Y], [FAN_X, FLOW_Y], [FAN_X, PODY_Y], [820, PODY_Y]], dashed: true, dim: true, color: 'network' });
    const cWireLabel = text({ class: 'scheme-label code dim', x: 350, y: FLOW_Y - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    const vipChip  = valChip({ x: 80,  y: 548, w: 270, h: 34, name: 'dst', value: '10.96.0.10:80', cat: 'network' });
    const dnatChip = valChip({ x: 370, y: 548, w: 270, h: 34, name: 'DNAT', value: 'none', cat: 'network' });
    const ctChip   = valChip({ x: 660, y: 548, w: 230, h: 34, name: 'conntrack', value: 'none', cat: 'network' });
    const backChip = valChip({ x: 910, y: 548, w: 210, h: 34, name: 'backend', value: 'none', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: boxes/pods, then wires + labels ABOVE them, then chips, then the packet layer on top.
    root.appendChild(vip);
    root.appendChild(kproxy);
    root.appendChild(client.group);
    root.appendChild(podX.group);
    root.appendChild(podY.group);
    [cWire, ownLink, fanX, fanY, cWireLabel].forEach(el => root.appendChild(el));
    [vipChip, dnatChip, ctChip, backChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, vip, kproxy, client: client.group, clientBox: client.innerBox,
      podX: podX.group, podXBox: podX.innerBox, podY: podY.group, podYBox: podY.innerBox,
      vipChip, dnatChip, ctChip, backChip,
      packetLayer, wires: { c: cWireLabel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['vip', 'kproxy', 'vipChip', 'dnatChip', 'ctChip', 'backChip'], [s.refs.client, s.refs.podX, s.refs.podY]);
  s.refs.podY.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'The web Service has a ClusterIP, 10.96.0.10, and two Ready backend Pods. That ClusterIP is a stable address clients connect to, but as the next steps show, nothing actually owns it on the network.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.dnatChip, 'none');
      setVal(s.refs.ctChip, 'none');
      setVal(s.refs.backChip, 'none');
    },
  },
  {
    id: 'virtual',
    duration: 2100,
    narration: 'The ClusterIP is virtual. No network interface holds it and no Pod answers ARP for it, so it never appears on a wire. It exists only as a target that kube-proxy has taught every Node how to intercept.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.vip.classList.add('highlight');
      // Packet-less step, no Pod to pulse: a single box flash keeps the frame from reading frozen.
      flashBox(s, ctx, 'vip');
    },
  },
  {
    id: 'program',
    duration: 2300,
    narration: 'kube-proxy watches the Service and its EndpointSlices and installs the dataplane rules: any packet whose destination is 10.96.0.10:80 should be DNAT-ed to one of the backend Pod IPs. The rules are in place before any traffic arrives.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.kproxy.classList.add('highlight');
      s.refs.dnatChip.classList.add('highlight');
      setVal(s.refs.dnatChip, '-> .2.7 / .3.9');
      // Packet-less step, no Pod: flash the box only. The value chip just lights, it never blinks.
      flashBox(s, ctx, 'kproxy');
    },
  },
  {
    id: 'send',
    duration: 2300,
    narration: 'The client opens a connection to the ClusterIP 10.96.0.10:80. As the packet leaves the client it is caught by the kube-proxy rules on the Node before it can go anywhere, because there is no real host at that address to route to.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'c', 'dst 10.96.0.10:80');
      s.refs.vipChip.classList.add('highlight');
      setVal(s.refs.vipChip, '10.96.0.10:80');
      if (ctx.reduced) { s.refs.clientBox.classList.add('highlight'); s.refs.kproxy.classList.add('highlight'); return; }
      // Up-arrow: the client pulses first, the packet leaves at BEAT.afterPulse and is caught at
      // kube-proxy, which lights on arrival.
      pulsePod(s.refs.client, ctx, 0);
      const send = segmentPacket(s, ctx, { from: [260, FLOW_Y], to: [440, FLOW_Y], delay: BEAT.afterPulse, cat: 'network' });
      lightBoxAt(s.refs.kproxy, ctx, send.arrivalMs);
    },
  },
  {
    id: 'dnat',
    duration: 2500,
    narration: 'kube-proxy picks one backend and rewrites the destination to that Pod IP, here 10.244.2.7:8080. Connection tracking records the mapping so every later packet of the same flow takes the same backend. The DNAT-ed packet is then delivered to the chosen Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.kproxy.classList.add('highlight');
      s.refs.dnatChip.classList.add('highlight');
      s.refs.ctChip.classList.add('highlight');
      s.refs.backChip.classList.add('highlight');
      setVal(s.refs.dnatChip, '-> 10.244.2.7:8080');
      setVal(s.refs.ctChip, 'flow pinned');
      setVal(s.refs.backChip, '10.244.2.7');
      s.refs.podY.style.opacity = '0.4';
      if (ctx.reduced) { s.refs.podXBox.classList.add('highlight'); return; }
      // The DNAT-ed packet emerges from kube-proxy (the rewrite happened inside it) and rides the
      // right-angle fan to the chosen Pod, which pulses on arrival.
      const give = routePacket(s, ctx, TO_PODX, { cat: 'network' });
      pulsePod(s.refs.podX, ctx, give.arrivalMs);
    },
  },
  {
    id: 'reply',
    duration: 2500,
    narration: 'The Pod replies from its own IP, but conntrack reverses the translation on the way back so the source looks like 10.96.0.10 again. The client only ever sees the ClusterIP it dialed, never the Pod address it was actually served by.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'c', 'src rewritten to 10.96.0.10');
      s.refs.kproxy.classList.add('highlight');
      s.refs.ctChip.classList.add('highlight');
      setVal(s.refs.ctChip, 'reverse NAT');
      setVal(s.refs.backChip, '10.244.2.7');
      s.refs.podY.style.opacity = '0.4';
      if (ctx.reduced) { s.refs.clientBox.classList.add('highlight'); return; }
      // Reply rides back Pod -> kube-proxy (where conntrack reverses the NAT, ball hidden inside
      // the box) -> client, which pulses on arrival.
      const h1 = routePacket(s, ctx, FROM_PODX, { cat: 'network' });
      const h2 = segmentPacket(s, ctx, { from: [440, FLOW_Y], to: [260, FLOW_Y], delay: h1.arrivalMs + BEAT.afterHop, cat: 'network' });
      pulsePod(s.refs.client, ctx, h2.arrivalMs);
    },
  },
];

// One-shot box flash for a packet-less, pod-less step (the only sanctioned block blink). Value
// chips never flash, so this is boxes only.
function flashBox(s, ctx, key) {
  if (ctx.reduced) return;
  const el = s.refs[key];
  if (!el) return;
  ctx.register(el.animate(
    [{ filter: 'brightness(1)' }, { filter: 'brightness(1.5)' }, { filter: 'brightness(1)' }],
    { duration: 600, easing: 'ease-out' }
  ));
}

export const init = makeInit(Scene, STEPS, { posterFirst: true });
