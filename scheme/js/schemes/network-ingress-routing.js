import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/network-kit.js';

// Ingress controller routing (viewBox 1200x640). External LB -> controller Pod -> matched Service
// -> backend Pod, left to right. The Ingress rules sit on top (clear of the narration zone).
// Standard contract: controller and backends are shell + inner box; only Pods pulse; value chips
// never flash; packets ride the wires and stop at block edges.
const TO_WEB = [[610, 335], [655, 335], [655, 273], [700, 273]];
const TO_API = [[610, 335], [655, 335], [655, 403], [700, 403]];

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
      'aria-label': 'Ingress controller routing: an Ingress controller Pod watches Ingress objects, matches the request host and path against the rules, terminates TLS, and proxies on to the chosen backend Service and Pod',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const ruleTitle = text({ class: 'scheme-label code dim', x: 595, y: 56, 'text-anchor': 'middle', 'font-size': 11 }, ['Ingress "shop" · ingressClassName nginx']);
    const ruleA = valChip({ x: 360, y: 66,  w: 470, h: 36, name: 'shop.io/', value: '-> Service web:80', cat: 'network' });
    const ruleB = valChip({ x: 360, y: 110, w: 470, h: 36, name: 'shop.io/api', value: '-> Service api:80', cat: 'network' });

    const extLB = box({ x: 70, y: 286, w: 200, h: 76, label: 'external LB', sublabel: 'or NodePort', cat: 'network' });
    const ctrl  = podBlock({ x: 320, y: 250, w: 290, h: 170, label: 'Ingress controller Pod', ip: 'watches Ingress' });

    const svcWeb = box({ x: 700, y: 240, w: 180, h: 66, label: 'Service web', sublabel: '', cat: 'network' });
    const svcApi = box({ x: 700, y: 370, w: 180, h: 66, label: 'Service api', sublabel: '', cat: 'network' });
    const podWeb = podBlock({ x: 950, y: 220, w: 210, h: 114, label: 'Pod web', ip: '10.244.1.5' });
    const podApi = podBlock({ x: 950, y: 360, w: 210, h: 114, label: 'Pod api', ip: '10.244.2.7' });

    const entryWire = arrow({ x1: 270, y1: 335, x2: 320, y2: 335, dashed: true, dim: true, color: 'network' });
    const rulesWire = arrow({ x1: 465, y1: 250, x2: 465, y2: 146, dashed: true, dim: true, color: 'network' });
    const fanWeb = pathArrow({ points: TO_WEB, dashed: true, dim: true, color: 'network' });
    const fanApi = pathArrow({ points: TO_API, dashed: true, dim: true, color: 'network' });
    const podWebWire = arrow({ x1: 880, y1: 273, x2: 950, y2: 273, dashed: true, dim: true, color: 'network' });
    const podApiWire = arrow({ x1: 880, y1: 403, x2: 950, y2: 403, dashed: true, dim: true, color: 'network' });
    const wireLabel = text({ class: 'scheme-label code dim', x: 295, y: 323, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    const hostChip = valChip({ x: 80,  y: 540, w: 270, h: 34, name: 'Host', value: 'shop.io', cat: 'network' });
    const pathChip = valChip({ x: 370, y: 540, w: 250, h: 34, name: 'path', value: '/', cat: 'network' });
    const tlsChip  = valChip({ x: 640, y: 540, w: 320, h: 34, name: 'TLS', value: 'terminated at controller', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    root.appendChild(extLB);
    root.appendChild(svcWeb);
    root.appendChild(svcApi);
    root.appendChild(podWeb.group);
    root.appendChild(podApi.group);
    root.appendChild(ctrl.group);
    [ruleTitle, ruleA, ruleB, entryWire, rulesWire, fanWeb, fanApi, podWebWire, podApiWire, wireLabel].forEach(el => root.appendChild(el));
    [hostChip, pathChip, tlsChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, extLB, ctrl: ctrl.group, ctrlBox: ctrl.innerBox, ruleA, ruleB, svcWeb, svcApi,
      podWeb: podWeb.group, podWebBox: podWeb.innerBox, podApi: podApi.group, podApiBox: podApi.innerBox,
      hostChip, pathChip, tlsChip,
      packetLayer, wires: { w: wireLabel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['extLB', 'ruleA', 'ruleB', 'svcWeb', 'svcApi', 'hostChip', 'pathChip', 'tlsChip'], [s.refs.ctrl, s.refs.podWeb, s.refs.podApi]);
  s.refs.podApi.style.opacity = '0.55';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'An Ingress object is just a set of host and path rules; it routes nothing by itself. The work is done by an Ingress controller, a Pod running a reverse proxy that turns those rules into live configuration and serves the traffic.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
    },
  },
  {
    id: 'rules',
    duration: 2200,
    narration: 'The controller watches the Ingress objects that name its ingressClassName. This Ingress shop says that requests to shop.io/ go to Service web and shop.io/api go to Service api. The controller compiles those rules into its proxy config and waits for traffic.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.ruleA.classList.add('highlight');
      s.refs.ruleB.classList.add('highlight');
      if (ctx.reduced) { s.refs.ctrlBox.classList.add('highlight'); return; }
      // The controller compiles the rules: it pulses, the rule chips just light.
      pulsePod(s.refs.ctrl, ctx, 0);
    },
  },
  {
    id: 'entry',
    duration: 2200,
    narration: 'External traffic does not reach the controller magically: it arrives through the controller own Service, usually a LoadBalancer or NodePort in front of it. A client request for shop.io lands on the controller Pod, and it terminates TLS here before looking at anything else.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'w', 'GET shop.io/');
      s.refs.extLB.classList.add('highlight');
      s.refs.tlsChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.ctrlBox.classList.add('highlight'); return; }
      // Down-arrow: the request arrives at the controller (one hop), which pulses on arrival.
      const inb = segmentPacket(s, ctx, { from: [270, 335], to: [320, 335], cat: 'network' });
      pulsePod(s.refs.ctrl, ctx, inb.arrivalMs);
    },
  },
  {
    id: 'match',
    duration: 2300,
    narration: 'The controller reads the request Host header, shop.io, and the path, /, and matches them against its compiled rules. The most specific match wins, so / routes to Service web while /api would have routed to Service api. The api branch stays idle for this request.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.ruleA.classList.add('highlight');
      s.refs.hostChip.classList.add('highlight');
      s.refs.pathChip.classList.add('highlight');
      setVal(s.refs.hostChip, 'shop.io');
      setVal(s.refs.pathChip, '/');
      if (ctx.reduced) { s.refs.ctrlBox.classList.add('highlight'); return; }
      // The controller does the matching: it pulses, the matched rule and chips just light.
      pulsePod(s.refs.ctrl, ctx, 0);
    },
  },
  {
    id: 'proxy',
    duration: 2500,
    narration: 'The controller then proxies the request on to the matched backend. It targets Service web, and most controllers skip the ClusterIP and send straight to a Ready Pod IP they read from the EndpointSlice. The Pod serves the response, which the controller relays back to the client.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'w', 'proxy -> web');
      s.refs.svcWeb.classList.add('highlight');
      if (ctx.reduced) { s.refs.podWebBox.classList.add('highlight'); return; }
      // The controller proxies to Service web (right-angle fan), then on to the backend Pod, which
      // pulses on arrival.
      const toSvc = routePacket(s, ctx, TO_WEB, { cat: 'network' });
      const toPod = segmentPacket(s, ctx, { from: [880, 273], to: [950, 273], delay: toSvc.arrivalMs + BEAT.afterHop, cat: 'network' });
      pulsePod(s.refs.podWeb, ctx, toPod.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
