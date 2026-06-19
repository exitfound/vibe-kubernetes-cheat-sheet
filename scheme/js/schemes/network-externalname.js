import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. Two stacked
// rows compare the two ways a Service can point at something that is not a selected Pod:
//   - top row (y254): type ExternalName, a pure DNS alias, client -> CoreDNS returns a CNAME to an
//     external host, no ClusterIP and no kube-proxy.
//   - bottom row (y474): a ClusterIP Service with no selector, client -> kube-proxy DNATs to a
//     hand-attached EndpointSlice that lists an external IP.
// Each row has its own client Pod (pods pulse). CoreDNS, kube-proxy and the targets are infra
// (they light, never pulse).
const ROW_A = 254;
const ROW_B = 474;
const A_CLIENT_EDGE = 230;
const A_DNS_LEFT = 360, A_DNS_RIGHT = 560, A_HOST_LEFT = 720;
const B_CLIENT_EDGE = 230;
const B_PROXY_LEFT = 360, B_PROXY_RIGHT = 560, B_EP_LEFT = 720;

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
  const innerBox = box({ x: x + 18, y: y + 30, w: w - 36, h: 48, label: 'curl', sublabel: 'eth0', cat: 'network' });
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
      'aria-label': 'ExternalName and Services without selectors: a type ExternalName Service is a pure DNS alias where CoreDNS returns a CNAME to an external host with no ClusterIP and no kube-proxy, while a ClusterIP Service with no selector gets a hand-attached EndpointSlice listing an external IP that kube-proxy then DNATs to like any other Service',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const clientA = podBlock({ x: 70, y: 194, w: 160, h: 108, label: 'client Pod', ip: 'svc lookup' });
    const dns = box({ x: A_DNS_LEFT, y: 224, w: 200, h: 60, label: 'CoreDNS', sublabel: 'returns CNAME', cat: 'network' });
    const host = box({ x: A_HOST_LEFT, y: 224, w: 320, h: 60, label: 'db.example.com', sublabel: 'external host', cat: 'network' });

    const clientB = podBlock({ x: 70, y: 414, w: 160, h: 108, label: 'client Pod', ip: 'svc:5432' });
    const proxy = box({ x: B_PROXY_LEFT, y: 444, w: 200, h: 60, label: 'kube-proxy', sublabel: 'ClusterIP 10.96.0.7', cat: 'network' });
    const ep = box({ x: B_EP_LEFT, y: 444, w: 320, h: 60, label: 'EndpointSlice', sublabel: 'manual · 203.0.113.5', cat: 'network' });

    const aWire1 = arrow({ x1: A_CLIENT_EDGE, y1: ROW_A, x2: A_DNS_LEFT, y2: ROW_A, dashed: true, dim: true, color: 'network' });
    const aWire2 = arrow({ x1: A_DNS_RIGHT, y1: ROW_A, x2: A_HOST_LEFT, y2: ROW_A, dashed: true, dim: true, color: 'network' });
    const bWire1 = arrow({ x1: B_CLIENT_EDGE, y1: ROW_B, x2: B_PROXY_LEFT, y2: ROW_B, dashed: true, dim: true, color: 'network' });
    const bWire2 = arrow({ x1: B_PROXY_RIGHT, y1: ROW_B, x2: B_EP_LEFT, y2: ROW_B, dashed: true, dim: true, color: 'network' });
    const aLabel = text({ class: 'scheme-label code dim', x: 290, y: ROW_A - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    const aLabel2 = text({ class: 'scheme-label code dim', x: 640, y: ROW_A - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    const bLabel = text({ class: 'scheme-label code dim', x: 290, y: ROW_B - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    const bLabel2 = text({ class: 'scheme-label code dim', x: 640, y: ROW_B - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    const typeChip  = valChip({ x: 80,  y: 566, w: 250, h: 34, name: 'type', value: 'idle', cat: 'network' });
    const vipChip   = valChip({ x: 350, y: 566, w: 250, h: 34, name: 'ClusterIP', value: 'none', cat: 'network' });
    const epChip    = valChip({ x: 620, y: 566, w: 250, h: 34, name: 'endpoints', value: 'none', cat: 'network' });
    const proxyChip = valChip({ x: 890, y: 566, w: 230, h: 34, name: 'kube-proxy', value: 'none', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: clients + infra boxes, then wires + labels above, then chips, then the packet layer.
    [dns, host, proxy, ep].forEach(el => root.appendChild(el));
    root.appendChild(clientA.group);
    root.appendChild(clientB.group);
    [aWire1, aWire2, bWire1, bWire2, aLabel, aLabel2, bLabel, bLabel2].forEach(el => root.appendChild(el));
    [typeChip, vipChip, epChip, proxyChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, clientA: clientA.group, clientABox: clientA.innerBox, dns, host,
      clientB: clientB.group, clientBBox: clientB.innerBox, proxy, ep,
      typeChip, vipChip, epChip, proxyChip,
      packetLayer, wires: { a1: aLabel, a2: aLabel2, b1: bLabel, b2: bLabel2 },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['dns', 'host', 'proxy', 'ep', 'typeChip', 'vipChip', 'epChip', 'proxyChip'], [s.refs.clientA, s.refs.clientB]);
}

function flashBox(s, ctx, keys) {
  if (ctx.reduced) return;
  keys.forEach(key => {
    const el = s.refs[key];
    if (!el) return;
    ctx.register(el.animate(
      [{ filter: 'brightness(1)' }, { filter: 'brightness(1.5)' }, { filter: 'brightness(1)' }],
      { duration: 600, easing: 'ease-out' }
    ));
  });
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Most Services proxy to Pods chosen by a selector, but two kinds do not. A type ExternalName Service is just a DNS alias, and a ClusterIP Service with no selector lets you attach endpoints by hand. Both let a Service stand in for something outside the cluster.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.typeChip, 'idle');
      setVal(s.refs.vipChip, 'none');
      setVal(s.refs.epChip, 'none');
      setVal(s.refs.proxyChip, 'none');
    },
  },
  {
    id: 'externalname',
    duration: 2600,
    narration: 'A type ExternalName Service has no ClusterIP at all. When a client looks it up, CoreDNS simply returns a CNAME to an external name such as db.example.com, and the client connects straight there. kube-proxy is never involved, the Service is purely a name pointing at another name.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'a1', 'lookup');
      setWire(s, 'a2', 'CNAME -> db.example.com');
      s.refs.dns.classList.add('highlight');
      s.refs.typeChip.classList.add('highlight');
      s.refs.vipChip.classList.add('highlight');
      setVal(s.refs.typeChip, 'ExternalName');
      setVal(s.refs.vipChip, 'none');
      setVal(s.refs.proxyChip, 'not involved');
      if (ctx.reduced) { s.refs.clientABox.classList.add('highlight'); s.refs.host.classList.add('highlight'); return; }
      // Up-arrow: the client pulses first, the lookup leaves at BEAT.afterPulse to CoreDNS, which
      // lights and points the client at the external host (lit as the resolved target).
      pulsePod(s.refs.clientA, ctx, 0);
      const q = segmentPacket(s, ctx, { from: [A_CLIENT_EDGE, ROW_A], to: [A_DNS_LEFT, ROW_A], delay: BEAT.afterPulse, cat: 'network' });
      lightBoxAt(s.refs.dns, ctx, q.arrivalMs);
      lightBoxAt(s.refs.host, ctx, q.arrivalMs);
    },
  },
  {
    id: 'noselector',
    duration: 2800,
    narration: 'The other case keeps a real ClusterIP but defines no selector, so Kubernetes creates no endpoints automatically. You attach an EndpointSlice yourself, listing the external IP. kube-proxy then DNATs the ClusterIP to that address exactly as it would to a Pod, so a fixed external server looks like an in-cluster Service.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'b1', 'dst 10.96.0.7');
      setWire(s, 'b2', 'DNAT -> 203.0.113.5');
      s.refs.proxy.classList.add('highlight');
      s.refs.typeChip.classList.add('highlight');
      s.refs.vipChip.classList.add('highlight');
      s.refs.epChip.classList.add('highlight');
      s.refs.proxyChip.classList.add('highlight');
      setVal(s.refs.typeChip, 'ClusterIP · no selector');
      setVal(s.refs.vipChip, '10.96.0.7');
      setVal(s.refs.epChip, 'manual');
      setVal(s.refs.proxyChip, 'DNAT');
      if (ctx.reduced) { s.refs.clientBBox.classList.add('highlight'); s.refs.ep.classList.add('highlight'); return; }
      // Up-arrow then forward hop: client pulses, the packet reaches kube-proxy (lights), then the
      // DNAT-ed packet rides on to the manual endpoint, which lights on arrival.
      pulsePod(s.refs.clientB, ctx, 0);
      const send = segmentPacket(s, ctx, { from: [B_CLIENT_EDGE, ROW_B], to: [B_PROXY_LEFT, ROW_B], delay: BEAT.afterPulse, cat: 'network' });
      lightBoxAt(s.refs.proxy, ctx, send.arrivalMs);
      const fwd = segmentPacket(s, ctx, { from: [B_PROXY_RIGHT, ROW_B], to: [B_EP_LEFT, ROW_B], delay: send.arrivalMs + BEAT.afterHop, cat: 'network' });
      lightBoxAt(s.refs.ep, ctx, fwd.arrivalMs);
    },
  },
  {
    id: 'recap',
    duration: 2400,
    narration: 'So ExternalName is resolution only, a CNAME with no proxy and no virtual IP, and it breaks if the client expects to talk TLS to the original name. The no-selector ClusterIP is a real proxied Service whose backends you curate by hand. Same Service object, two very different jobs.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.dns.classList.add('highlight');
      s.refs.proxy.classList.add('highlight');
      s.refs.typeChip.classList.add('highlight');
      setVal(s.refs.typeChip, 'two modes');
      setVal(s.refs.vipChip, 'none / real');
      setVal(s.refs.epChip, 'none / manual');
      setVal(s.refs.proxyChip, 'no / yes');
      // Packet-less, pod-less recap: flash the two middle boxes that distinguish the modes.
      flashBox(s, ctx, ['dns', 'proxy']);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
