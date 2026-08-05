import { svg, g } from '../../lib/svg.js';
import { arrowDefs, box, arrow, pathArrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, routePacket, makeInit, clearHighlights, clearWires, BEAT, lightBoxAt, makeRidingLabel, relationPath } from './network-kit.js';
// Design notes for this card: ./CARDS.md#network-externalname


// Panel right <= 397, bottom <= 230, and BOTH rows hang below that bottom: at 254 the top of row A's
// Client Pod goes under the panel on the narrow viewports.
const CLIENT_X = 115, CLIENT_W = 160, CLIENT_H = 108;
const ROW_A = 300;                     // Pod 246..354, clear of the panel
const ROW_B = 480;
// x-coords are centered in the 1200 viewBox: content runs 115..1085 (client left edge to the wide
// external-target right edge), leaving equal 115px side margins.
const A_CLIENT_EDGE = CLIENT_X + CLIENT_W;   // 275
const A_DNS_LEFT = 405, A_DNS_RIGHT = 605, A_HOST_LEFT = 765;
const B_CLIENT_EDGE = A_CLIENT_EDGE;
const B_PROXY_LEFT = 405, B_PROXY_RIGHT = 605, B_EP_LEFT = 765;
const BOX_H = 60;                      // the four infra boxes share one height, centred on their row
const TARGET_W = 320;                  // the two external-target boxes: 765..1085
// Each hop as its own array, feeding both its ball and its ridingLabel tag so the two cannot drift.
// Row A carries three lanes: query, answer, and the connection the CLIENT makes to the external host.
const LANE_DY = 12;                                             // query above the row centre, answer below
const A_CONNECT_Y = 390;                                        // the free band between the rows: 354..426
const A_CLIENT_CX = CLIENT_X + CLIENT_W / 2;                    // 195
const A_CLIENT_BOTTOM = ROW_A + CLIENT_H / 2;                   // 354
const A_HOST_CX = A_HOST_LEFT + TARGET_W / 2;                   // 925
const A_HOST_BOTTOM = ROW_A + BOX_H / 2;                        // 330
const A_HOP1 = [[A_CLIENT_EDGE, ROW_A - LANE_DY], [A_DNS_LEFT, ROW_A - LANE_DY]];  // client -> CoreDNS (query)
const A_HOP2 = [[A_DNS_LEFT, ROW_A + LANE_DY], [A_CLIENT_EDGE, ROW_A + LANE_DY]];  // CoreDNS -> client (CNAME)
const A_HOP3 = [                                                                   // client -> external host
  [A_CLIENT_CX, A_CLIENT_BOTTOM], [A_CLIENT_CX, A_CONNECT_Y],
  [A_HOST_CX, A_CONNECT_Y], [A_HOST_CX, A_HOST_BOTTOM],
];
const B_HOP1 = [[B_CLIENT_EDGE, ROW_B], [B_PROXY_LEFT, ROW_B]]; // client -> kube-proxy (ClusterIP dst)
const B_HOP2 = [[B_PROXY_RIGHT, ROW_B], [B_EP_LEFT, ROW_B]];    // kube-proxy -> EndpointSlice (DNAT dst)

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'network' });

function podBlock({ x, y, w, h, label, ip }) {
  const shell = podShell({ x, y, w, h, label, sublabel: ip, containers: 0, role: 'network' });
  const innerBox = box({ x: x + 18, y: y + 30, w: w - 36, h: 48, label: 'curl', sublabel: 'eth0', role: 'network' });
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

    const clientA = podBlock({ x: CLIENT_X, y: ROW_A - CLIENT_H / 2, w: CLIENT_W, h: CLIENT_H, label: 'Client Pod', ip: 'svc lookup' });
    const dns = box({ x: A_DNS_LEFT, y: ROW_A - BOX_H / 2, w: A_DNS_RIGHT - A_DNS_LEFT, h: BOX_H, label: 'CoreDNS', sublabel: 'returns CNAME', role: 'network' });
    const host = box({ x: A_HOST_LEFT, y: ROW_A - BOX_H / 2, w: TARGET_W, h: BOX_H, label: 'db.example.com', sublabel: 'external host', role: 'network' });

    const clientB = podBlock({ x: CLIENT_X, y: ROW_B - CLIENT_H / 2, w: CLIENT_W, h: CLIENT_H, label: 'Client Pod', ip: 'svc:5432' });
    const proxy = box({ x: B_PROXY_LEFT, y: ROW_B - BOX_H / 2, w: B_PROXY_RIGHT - B_PROXY_LEFT, h: BOX_H, label: 'kube-proxy', sublabel: 'ClusterIP 10.96.0.7', role: 'network' });
    const ep = box({ x: B_EP_LEFT, y: ROW_B - BOX_H / 2, w: TARGET_W, h: BOX_H, label: 'EndpointSlice', sublabel: 'manual · 203.0.113.5', role: 'network' });

    const aWire1 = arrow({ x1: A_HOP1[0][0], y1: A_HOP1[0][1], x2: A_HOP1[1][0], y2: A_HOP1[1][1], dashed: true, dim: true, role: 'network' });
    const aWire2 = arrow({ x1: A_HOP2[0][0], y1: A_HOP2[0][1], x2: A_HOP2[1][0], y2: A_HOP2[1][1], dashed: true, dim: true, role: 'network' });
    const aWire3 = pathArrow({ points: A_HOP3, dashed: true, dim: true, role: 'network' });
    // CoreDNS to the external host is a RELATIONSHIP, not a route: the CNAME names that host, and
    // nothing on this card ever travels it. An ExternalName Service never proxies.
    const aRel = relationPath({ points: [[A_DNS_RIGHT, ROW_A], [A_HOST_LEFT, ROW_A]], role: 'network' });
    const bWire1 = arrow({ x1: B_CLIENT_EDGE, y1: ROW_B, x2: B_PROXY_LEFT, y2: ROW_B, dashed: true, dim: true, role: 'network' });
    const bWire2 = arrow({ x1: B_PROXY_RIGHT, y1: ROW_B, x2: B_EP_LEFT, y2: ROW_B, dashed: true, dim: true, role: 'network' });

    // Chip strip spans the block width 1:1: leftmost edge under the Client Pods (115), rightmost edge
    // under the external-target boxes (1085), with even 20px gaps. typeChip is widest for its long value.
    const typeChip  = valChip({ x: 115, y: 566, w: 270, h: 34, name: 'type', value: 'idle', role: 'network' });
    const vipChip   = valChip({ x: 405, y: 566, w: 200, h: 34, name: 'clusterIP', value: 'none', role: 'network' });
    const epChip    = valChip({ x: 625, y: 566, w: 220, h: 34, name: 'endpoints', value: 'none', role: 'network' });
    const proxyChip = valChip({ x: 865, y: 566, w: 220, h: 34, name: 'kube-proxy', value: 'none', role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: clients + infra boxes, then wires above, then chips, then the packet layer (ball +
    // riding label) on top. All hop values ride on the ball, so there are no static wire text labels.
    [dns, host, proxy, ep].forEach(el => root.appendChild(el));
    root.appendChild(clientA.group);
    root.appendChild(clientB.group);
    [aRel, aWire1, aWire2, aWire3, bWire1, bWire2].forEach(el => root.appendChild(el));
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

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  // clientABox/clientBBox are listed so a highlight set in a reduced-replay branch is cleared every
  // step and does not leak forward (reduced replay never runs the forward path that would re-clear it).
  clearHighlights(s, ['dns', 'host', 'proxy', 'ep', 'clientABox', 'clientBBox', 'typeChip', 'vipChip', 'epChip', 'proxyChip'], [s.refs.clientA, s.refs.clientB]);
  clearWires(s);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      resetStep(s);
      setVal(s.refs.typeChip, 'idle');
      setVal(s.refs.vipChip, 'none');
      setVal(s.refs.epChip, 'none');
      setVal(s.refs.proxyChip, 'none');
    },
  },
  {
    id: 'externalname',
    duration: 5700,
    narration: 'A type ExternalName Service has no ClusterIP at all. When a client looks it up, CoreDNS simply returns a CNAME to an external name such as db.example.com, and the client connects straight there. The kube-proxy is never involved, the Service is purely a name pointing at another name.',
    enter(s, ctx) {
      resetStep(s);
      s.refs.typeChip.classList.add('highlight');
      s.refs.vipChip.classList.add('highlight');
      setVal(s.refs.typeChip, 'ExternalName');
      setVal(s.refs.vipChip, 'none');
      setVal(s.refs.proxyChip, 'not involved');
      s.refs.proxyChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.clientABox.classList.add('highlight'); s.refs.dns.classList.add('highlight'); s.refs.host.classList.add('highlight'); return; }
      pulsePod(s.refs.clientA, ctx, 0);
      const q = segmentPacket(s, ctx, { from: A_HOP1[0], to: A_HOP1[1], delay: BEAT.afterPulse, role: 'network' });
      ridingLabel(s, ctx, 'db.default.svc', A_HOP1, { delay: BEAT.afterPulse, easing: 'linear' });
      lightBoxAt(s.refs.dns, ctx, q.arrivalMs);
      // The answer comes back to the CLIENT. CoreDNS hands over a name and stops there.
      const ans = segmentPacket(s, ctx, { from: A_HOP2[0], to: A_HOP2[1], delay: q.arrivalMs + BEAT.afterHop, role: 'network' });
      ridingLabel(s, ctx, 'CNAME -> db.example.com', A_HOP2, { delay: q.arrivalMs + BEAT.afterHop, easing: 'linear' });
      pulsePod(s.refs.clientA, ctx, ans.arrivalMs);
      // Holding the name, the client connects to the external host itself, on a lane that never
      // touches CoreDNS. Eased route, so the tag rides it on the wrapper default easing.
      const conn = routePacket(s, ctx, A_HOP3, { delay: ans.arrivalMs + BEAT.afterPulse, role: 'network' });
      ridingLabel(s, ctx, 'connect db.example.com', A_HOP3, { delay: ans.arrivalMs + BEAT.afterPulse });
      lightBoxAt(s.refs.host, ctx, conn.arrivalMs);
    },
  },
  {
    id: 'noselector',
    duration: 3000,
    narration: 'The other case keeps a real ClusterIP but defines no selector, so Kubernetes creates no endpoints automatically. You attach an EndpointSlice yourself, listing the external IP. The kube-proxy then DNATs the ClusterIP to that address exactly as it would to a Pod, so a fixed external server looks like an in-cluster Service.',
    enter(s, ctx) {
      resetStep(s);
      s.refs.typeChip.classList.add('highlight');
      s.refs.vipChip.classList.add('highlight');
      s.refs.epChip.classList.add('highlight');
      s.refs.proxyChip.classList.add('highlight');
      setVal(s.refs.typeChip, 'ClusterIP · no selector');
      setVal(s.refs.vipChip, '10.96.0.7');
      setVal(s.refs.epChip, 'manual');
      setVal(s.refs.proxyChip, 'DNAT');
      if (ctx.reduced) { s.refs.clientBBox.classList.add('highlight'); s.refs.proxy.classList.add('highlight'); s.refs.ep.classList.add('highlight'); return; }
      pulsePod(s.refs.clientB, ctx, 0);
      const send = segmentPacket(s, ctx, { from: B_HOP1[0], to: B_HOP1[1], delay: BEAT.afterPulse, role: 'network' });
      ridingLabel(s, ctx, 'dst 10.96.0.7', B_HOP1, { delay: BEAT.afterPulse, easing: 'linear' });
      lightBoxAt(s.refs.proxy, ctx, send.arrivalMs);
      const fwd = segmentPacket(s, ctx, { from: B_HOP2[0], to: B_HOP2[1], delay: send.arrivalMs + BEAT.afterHop, role: 'network' });
      ridingLabel(s, ctx, 'DNAT -> 203.0.113.5', B_HOP2, { delay: send.arrivalMs + BEAT.afterHop, easing: 'linear' });
      lightBoxAt(s.refs.ep, ctx, fwd.arrivalMs);
    },
  },
  {
    id: 'recap',
    duration: 2400,
    narration: 'So ExternalName is resolution only, a CNAME with no proxy and no virtual IP, and it breaks if the client expects to talk TLS to the original name. The no-selector ClusterIP is a real proxied Service whose backends you curate by hand. Same Service object, two very different jobs.',
    enter(s) {
      resetStep(s);
      s.refs.dns.classList.add('highlight');
      s.refs.proxy.classList.add('highlight');
      s.refs.typeChip.classList.add('highlight');
      setVal(s.refs.typeChip, 'two modes');
      setVal(s.refs.vipChip, 'none / real');
      s.refs.vipChip.classList.add('highlight');
      setVal(s.refs.epChip, 'none / manual');
      s.refs.epChip.classList.add('highlight');
      setVal(s.refs.proxyChip, 'no / yes');
      s.refs.proxyChip.classList.add('highlight');
      // Packet-less, pod-less recap: the two middle boxes light via .highlight to distinguish the
      // modes. Blocks light, they never blink. Only Pods pulse.
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
