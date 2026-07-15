import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow, animateAlong } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, routeDur, makeInit, clearHighlights, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. Two stacked
// rows compare the two ways a Service can point at something that is not a selected Pod:
//   - top row (ROW_A): type ExternalName, a pure DNS alias. The client looks the name up (the query
//     rides to CoreDNS), CoreDNS answers a CNAME that rides on toward the external host. No ClusterIP
//     and no kube-proxy.
//   - bottom row (ROW_B): a ClusterIP Service with no selector. The client sends to the ClusterIP
//     (dst rides to kube-proxy), kube-proxy DNATs to a hand-attached EndpointSlice (the rewritten
//     dst rides on to the external IP).
// Each row is one independent one-way flow (two straight hops, no round trip, no return lane). The
// value each hop carries is NOT inline wire text: it rides ALONG on the ball (ridingLabel), so both
// hops in both rows tag their ball and no static label is needed. Each row has its own client Pod
// (pods pulse). CoreDNS, kube-proxy and the targets are infra (they light SYNCED to arrival, never
// pulse).
const ROW_A = 254;
const ROW_B = 474;
// x-coords are centered in the 1200 viewBox: content runs 115..1085 (client left edge to the wide
// external-target right edge), leaving equal 115px side margins.
const A_CLIENT_EDGE = 275;
const A_DNS_LEFT = 405, A_DNS_RIGHT = 605, A_HOST_LEFT = 765;
const B_CLIENT_EDGE = 275;
const B_PROXY_LEFT = 405, B_PROXY_RIGHT = 605, B_EP_LEFT = 765;
// Each hop as its own 2-point straight segment. The same array feeds the linear segmentPacket ball
// and the ridingLabel tag so the tag stays locked to the ball.
const A_HOP1 = [[A_CLIENT_EDGE, ROW_A], [A_DNS_LEFT, ROW_A]];   // client -> CoreDNS (query)
const A_HOP2 = [[A_DNS_RIGHT, ROW_A], [A_HOST_LEFT, ROW_A]];    // CoreDNS -> external host (CNAME)
const B_HOP1 = [[B_CLIENT_EDGE, ROW_B], [B_PROXY_LEFT, ROW_B]]; // client -> kube-proxy (ClusterIP dst)
const B_HOP2 = [[B_PROXY_RIGHT, ROW_B], [B_EP_LEFT, ROW_B]];    // kube-proxy -> EndpointSlice (DNAT dst)

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// A small label that rides ALONG with the ball on the same path, timing and easing, tagging it with
// the value the step narrates. It lives in the packet layer but is not a .scheme-packet, so it does
// not count as a packet to the tools. dur omitted => routeDur(points), matching a ball that also
// omits dur. Pass easing:'linear' for straight segmentPacket hops so the tag stays locked to the
// linear ball.
function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'ease-in-out' } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: -14, 'text-anchor': 'middle', 'data-cat': 'network' }, [txt]);
  lbl.style.opacity = '0';
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 160, fill: 'forwards', easing: 'ease-in' }));
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

    const clientA = podBlock({ x: 115, y: 200, w: 160, h: 108, label: 'Client Pod', ip: 'svc lookup' });
    const dns = box({ x: A_DNS_LEFT, y: 224, w: 200, h: 60, label: 'CoreDNS', sublabel: 'returns CNAME', cat: 'network' });
    const host = box({ x: A_HOST_LEFT, y: 224, w: 320, h: 60, label: 'db.example.com', sublabel: 'external host', cat: 'network' });

    const clientB = podBlock({ x: 115, y: 420, w: 160, h: 108, label: 'Client Pod', ip: 'svc:5432' });
    const proxy = box({ x: B_PROXY_LEFT, y: 444, w: 200, h: 60, label: 'kube-proxy', sublabel: 'ClusterIP 10.96.0.7', cat: 'network' });
    const ep = box({ x: B_EP_LEFT, y: 444, w: 320, h: 60, label: 'EndpointSlice', sublabel: 'manual · 203.0.113.5', cat: 'network' });

    const aWire1 = arrow({ x1: A_CLIENT_EDGE, y1: ROW_A, x2: A_DNS_LEFT, y2: ROW_A, dashed: true, dim: true, color: 'network' });
    const aWire2 = arrow({ x1: A_DNS_RIGHT, y1: ROW_A, x2: A_HOST_LEFT, y2: ROW_A, dashed: true, dim: true, color: 'network' });
    const bWire1 = arrow({ x1: B_CLIENT_EDGE, y1: ROW_B, x2: B_PROXY_LEFT, y2: ROW_B, dashed: true, dim: true, color: 'network' });
    const bWire2 = arrow({ x1: B_PROXY_RIGHT, y1: ROW_B, x2: B_EP_LEFT, y2: ROW_B, dashed: true, dim: true, color: 'network' });

    // Chip strip spans the block width 1:1: leftmost edge under the Client Pods (115), rightmost edge
    // under the external-target boxes (1085), with even 20px gaps. typeChip is widest for its long value.
    const typeChip  = valChip({ x: 115, y: 566, w: 270, h: 34, name: 'type', value: 'idle', cat: 'network' });
    const vipChip   = valChip({ x: 405, y: 566, w: 200, h: 34, name: 'ClusterIP', value: 'none', cat: 'network' });
    const epChip    = valChip({ x: 625, y: 566, w: 220, h: 34, name: 'endpoints', value: 'none', cat: 'network' });
    const proxyChip = valChip({ x: 865, y: 566, w: 220, h: 34, name: 'kube-proxy', value: 'none', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: clients + infra boxes, then wires above, then chips, then the packet layer (ball +
    // riding label) on top. All hop values ride on the ball, so there are no static wire text labels.
    [dns, host, proxy, ep].forEach(el => root.appendChild(el));
    root.appendChild(clientA.group);
    root.appendChild(clientB.group);
    [aWire1, aWire2, bWire1, bWire2].forEach(el => root.appendChild(el));
    [typeChip, vipChip, epChip, proxyChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, clientA: clientA.group, clientABox: clientA.innerBox, dns, host,
      clientB: clientB.group, clientBBox: clientB.innerBox, proxy, ep,
      typeChip, vipChip, epChip, proxyChip,
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  // clientABox/clientBBox are listed so a highlight set in a reduced-replay branch is cleared every
  // step and does not leak forward (reduced replay never runs the forward path that would re-clear it).
  clearHighlights(s, ['dns', 'host', 'proxy', 'ep', 'clientABox', 'clientBBox', 'typeChip', 'vipChip', 'epChip', 'proxyChip'], [s.refs.clientA, s.refs.clientB]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Most Services proxy to Pods chosen by a selector, but two kinds do not. A type ExternalName Service is just a DNS alias, and a ClusterIP Service with no selector lets you attach endpoints by hand. Both let a Service stand in for something outside the cluster.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
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
      s.refs.dns.classList.add('highlight');
      s.refs.typeChip.classList.add('highlight');
      s.refs.vipChip.classList.add('highlight');
      setVal(s.refs.typeChip, 'ExternalName');
      setVal(s.refs.vipChip, 'none');
      setVal(s.refs.proxyChip, 'not involved');
      if (ctx.reduced) { s.refs.clientABox.classList.add('highlight'); s.refs.host.classList.add('highlight'); return; }
      // Up-arrow then forward hop: the client pulses first, the query rides at BEAT.afterPulse to
      // CoreDNS (lights on arrival), then the resolved CNAME rides on to the external host, which
      // lights when the name reaches it. No round trip, both hops are one-way.
      pulsePod(s.refs.clientA, ctx, 0);
      const q = segmentPacket(s, ctx, { from: A_HOP1[0], to: A_HOP1[1], delay: BEAT.afterPulse, cat: 'network' });
      ridingLabel(s, ctx, 'db.default.svc', A_HOP1, { delay: BEAT.afterPulse, easing: 'linear' });
      lightBoxAt(s.refs.dns, ctx, q.arrivalMs);
      const r = segmentPacket(s, ctx, { from: A_HOP2[0], to: A_HOP2[1], delay: q.arrivalMs + BEAT.afterHop, cat: 'network' });
      ridingLabel(s, ctx, 'CNAME -> db.example.com', A_HOP2, { delay: q.arrivalMs + BEAT.afterHop, easing: 'linear' });
      lightBoxAt(s.refs.host, ctx, r.arrivalMs);
    },
  },
  {
    id: 'noselector',
    duration: 2800,
    narration: 'The other case keeps a real ClusterIP but defines no selector, so Kubernetes creates no endpoints automatically. You attach an EndpointSlice yourself, listing the external IP. kube-proxy then DNATs the ClusterIP to that address exactly as it would to a Pod, so a fixed external server looks like an in-cluster Service.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
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
      // Up-arrow then forward hop: the client pulses, the packet carries dst 10.96.0.7 to kube-proxy
      // (lights on arrival), then the DNAT-ed dst rides on to the manual endpoint, which lights when
      // the packet reaches it.
      pulsePod(s.refs.clientB, ctx, 0);
      const send = segmentPacket(s, ctx, { from: B_HOP1[0], to: B_HOP1[1], delay: BEAT.afterPulse, cat: 'network' });
      ridingLabel(s, ctx, 'dst 10.96.0.7', B_HOP1, { delay: BEAT.afterPulse, easing: 'linear' });
      lightBoxAt(s.refs.proxy, ctx, send.arrivalMs);
      const fwd = segmentPacket(s, ctx, { from: B_HOP2[0], to: B_HOP2[1], delay: send.arrivalMs + BEAT.afterHop, cat: 'network' });
      ridingLabel(s, ctx, 'DNAT -> 203.0.113.5', B_HOP2, { delay: send.arrivalMs + BEAT.afterHop, easing: 'linear' });
      lightBoxAt(s.refs.ep, ctx, fwd.arrivalMs);
    },
  },
  {
    id: 'recap',
    duration: 2400,
    narration: 'So ExternalName is resolution only, a CNAME with no proxy and no virtual IP, and it breaks if the client expects to talk TLS to the original name. The no-selector ClusterIP is a real proxied Service whose backends you curate by hand. Same Service object, two very different jobs.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.dns.classList.add('highlight');
      s.refs.proxy.classList.add('highlight');
      s.refs.typeChip.classList.add('highlight');
      setVal(s.refs.typeChip, 'two modes');
      setVal(s.refs.vipChip, 'none / real');
      setVal(s.refs.epChip, 'none / manual');
      setVal(s.refs.proxyChip, 'no / yes');
      // Packet-less, pod-less recap: the two middle boxes light via .highlight to distinguish the
      // modes. Blocks light, they never blink. Only Pods pulse.
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
