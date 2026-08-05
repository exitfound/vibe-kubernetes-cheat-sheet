import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, pod, arrow, pathArrow } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, routePacket, makeInit, clearHighlights, clearWires, setWire, relationPath, lightBoxAt, BEAT, OPACITY } from './network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-ingress-routing


const FLOW_Y = 343;                  // (RULE_BOTTOM + CHIP_Y) / 2, the spine of the left-to-right flow
const ROW_DY = 70;                   // web branch sits this far above FLOW_Y, api the same below
const WEB_Y = FLOW_Y - ROW_DY;       // 273
const API_Y = FLOW_Y + ROW_DY;       // 413

const LB_X = 40, LB_W = 200, LB_H = 76;
const CTRL_W = 210, CTRL_H = 114;    // standard pod shell, same as the backends
const CTRL_X = 440;
const SVC_X = 730, SVC_W = 160, SVC_H = 66;
const POD_X = 950, POD_W = 210, POD_H = 114;

const LB_RIGHT = LB_X + LB_W;                 // 240
const CTRL_RIGHT = CTRL_X + CTRL_W;           // 650
const CTRL_CX = CTRL_X + CTRL_W / 2;          // 545
const CTRL_TOP = FLOW_Y - CTRL_H / 2;         // 286
const SVC_RIGHT = SVC_X + SVC_W;              // 890
const POD_RIGHT = POD_X + POD_W;              // 1160
const FAN_X = (CTRL_RIGHT + SVC_X) / 2;       // 690, the vertical bus the branches split on

const RULE_W = 260;
const RULE_CX = CTRL_CX;                      // the panel sits centred above the controller
const RULE_X = RULE_CX - RULE_W / 2;          // 415, clear of the narration overlay (399)
const RULE_BOTTOM = 146;                      // bottom edge of the lower rule chip
const CHIP_Y = 540;                           // bottom chip strip

// Each static wire and the packet that rides it share the same points array.
const ENTRY = [[LB_RIGHT, FLOW_Y], [CTRL_X, FLOW_Y]];
const TO_WEB = [[CTRL_RIGHT, FLOW_Y], [FAN_X, FLOW_Y], [FAN_X, WEB_Y], [SVC_X, WEB_Y]];
const TO_API = [[CTRL_RIGHT, FLOW_Y], [FAN_X, FLOW_Y], [FAN_X, API_Y], [SVC_X, API_Y]];
const WEB_HOP = [[SVC_RIGHT, WEB_Y], [POD_X, WEB_Y]];
const API_HOP = [[SVC_RIGHT, API_Y], [POD_X, API_Y]];


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
      'aria-label': 'Ingress controller routing: an Ingress controller Pod watches Ingress objects, matches the request host and path against the rules, terminates TLS, and proxies each request on to the backend Service and Pod its rule names, slash to Service web and slash api to Service api',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const ruleTitle = text({ class: 'scheme-label code dim', x: RULE_CX, y: 56, 'text-anchor': 'middle' }, ['Ingress "shop" · ingressClassName nginx']);
    const ruleA = valChip({ x: RULE_X, y: 66,  w: RULE_W, h: 36, name: 'shop.io/', value: '-> Service web:80', role: 'network' });
    const ruleB = valChip({ x: RULE_X, y: 110, w: RULE_W, h: 36, name: 'shop.io/api', value: '-> Service api:80', role: 'network' });

    // Every block is centred on its own row: extLB and the controller on FLOW_Y, each Service on the
    // same row as the backend Pod it fronts, so no wire ever meets a block off-centre.
    const extLB = box({ x: LB_X, y: FLOW_Y - LB_H / 2, w: LB_W, h: LB_H, label: 'External LB', sublabel: 'or NodePort', role: 'network' });
    const ctrl  = podBlock({ x: CTRL_X, y: CTRL_TOP, w: CTRL_W, h: CTRL_H, label: 'Ingress controller Pod', ip: 'watches Ingress' });

    const svcWeb = box({ x: SVC_X, y: WEB_Y - SVC_H / 2, w: SVC_W, h: SVC_H, label: 'Service web', sublabel: '', role: 'network' });
    const svcApi = box({ x: SVC_X, y: API_Y - SVC_H / 2, w: SVC_W, h: SVC_H, label: 'Service api', sublabel: '', role: 'network' });
    const podWeb = podBlock({ x: POD_X, y: WEB_Y - POD_H / 2, w: POD_W, h: POD_H, label: 'Pod web', ip: '10.244.1.5' });
    const podApi = podBlock({ x: POD_X, y: API_Y - POD_H / 2, w: POD_W, h: POD_H, label: 'Pod api', ip: '10.244.2.7' });

    const entryWire = arrow({ x1: ENTRY[0][0], y1: ENTRY[0][1], x2: ENTRY[1][0], y2: ENTRY[1][1], dashed: true, dim: true, role: 'network' });
    const rulesWire = relationPath({ points: [[CTRL_CX, CTRL_TOP], [CTRL_CX, RULE_BOTTOM]], role: 'network', dash: '5 5' });
    const fanWeb = pathArrow({ points: TO_WEB, dashed: true, dim: true, role: 'network' });
    const fanApi = pathArrow({ points: TO_API, dashed: true, dim: true, role: 'network' });
    const podWebWire = arrow({ x1: WEB_HOP[0][0], y1: WEB_HOP[0][1], x2: WEB_HOP[1][0], y2: WEB_HOP[1][1], dashed: true, dim: true, role: 'network' });
    const podApiWire = arrow({ x1: API_HOP[0][0], y1: API_HOP[0][1], x2: API_HOP[1][0], y2: API_HOP[1][1], dashed: true, dim: true, role: 'network' });

    const entryLabel = text({ class: 'scheme-label code dim', x: (LB_RIGHT + CTRL_X) / 2, y: FLOW_Y - 12, 'text-anchor': 'middle' }, [' ']);
    const webLabel = text({ class: 'scheme-label code dim', x: SVC_X + SVC_W / 2, y: WEB_Y - SVC_H / 2 - 10, 'text-anchor': 'middle' }, [' ']);
    const apiLabel = text({ class: 'scheme-label code dim', x: SVC_X + SVC_W / 2, y: API_Y + SVC_H / 2 + 18, 'text-anchor': 'middle' }, [' ']);

    const hostChip = valChip({ x: LB_X, y: CHIP_Y, w: 310, h: 34, name: 'Host', value: 'none', role: 'network' });
    const pathChip = valChip({ x: 370,  y: CHIP_Y, w: 290, h: 34, name: 'path', value: 'none', role: 'network' });
    const tlsChip  = valChip({ x: 680,  y: CHIP_Y, w: POD_RIGHT - 680, h: 34, name: 'TLS', value: 'terminated at controller', role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    root.appendChild(extLB);
    root.appendChild(svcWeb);
    root.appendChild(svcApi);
    root.appendChild(podWeb.group);
    root.appendChild(podApi.group);
    root.appendChild(ctrl.group);
    [ruleTitle, ruleA, ruleB, entryWire, rulesWire, fanWeb, fanApi, podWebWire, podApiWire, entryLabel, webLabel, apiLabel].forEach(el => root.appendChild(el));
    [hostChip, pathChip, tlsChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, extLB, ctrl: ctrl.group, ctrlBox: ctrl.innerBox, ruleA, ruleB, svcWeb, svcApi,
      podWeb: podWeb.group, podWebBox: podWeb.innerBox, podApi: podApi.group, podApiBox: podApi.innerBox,
      hostChip, pathChip, tlsChip,
      fanWeb, fanApi, podWebWire, podApiWire,
      packetLayer, wires: { w: entryLabel, web: webLabel, api: apiLabel },
    };
  }

  reset() { this.build(); }
}

// A branch is its Service, its Pod AND the two lanes that join them, because a lane into a Service
// the request did not choose is not a route on this step. Listing the blocks without their lanes is
// how the idle branch kept two arrows at full strength.
const BRANCH = {
  web: ['svcWeb', 'podWeb', 'fanWeb', 'podWebWire'],
  api: ['svcApi', 'podApi', 'fanApi', 'podApiWire'],
};

function clearHL(s) {
  clearHighlights(s, ['extLB', 'ruleA', 'ruleB', 'svcWeb', 'svcApi', 'hostChip', 'pathChip', 'tlsChip', 'ctrlBox', 'podWebBox', 'podApiBox'], [s.refs.ctrl, s.refs.podWeb, s.refs.podApi]);
  // Both branches back to full: each step re-dims the one it is not using, so a dim never leaks.
  [...BRANCH.web, ...BRANCH.api].forEach(k => { s.refs[k].style.opacity = '1'; });
}

// Dim the branch the current request is not taking, so the chosen path reads clearly. 'both' leaves
// the scheme neutral, before any rule has matched.
function branch(s, active) {
  if (active === 'both') return;
  const idle = active === 'web' ? BRANCH.api : BRANCH.web;
  idle.forEach(k => { s.refs[k].style.opacity = String(OPACITY.notready); });
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.hostChip, 'none');
      setVal(s.refs.pathChip, 'none');
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
      // No request yet, so the request chips stay empty and both branches stay neutral.
      setVal(s.refs.hostChip, 'none');
      setVal(s.refs.pathChip, 'none');
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
    narration: 'External traffic does not reach the controller magically: it arrives through a Service of its own, usually a LoadBalancer or NodePort in front of it. A client request for shop.io lands on the controller Pod, and it terminates TLS here before looking at anything else.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'w', 'GET shop.io/');
      setVal(s.refs.hostChip, 'shop.io');
      s.refs.hostChip.classList.add('highlight');
      setVal(s.refs.pathChip, '/');
      s.refs.pathChip.classList.add('highlight');
      s.refs.extLB.classList.add('highlight');
      s.refs.tlsChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.ctrlBox.classList.add('highlight'); return; }
      // Down-arrow: the request arrives at the controller (one hop), which pulses on arrival.
      const inb = segmentPacket(s, ctx, { from: ENTRY[0], to: ENTRY[1], role: 'network' });
      pulsePod(s.refs.ctrl, ctx, inb.arrivalMs);
    },
  },
  {
    id: 'match-proxy',
    // Motion runs pulse(800) + fan(420) + hop beat(100) + hop(420) = 1740ms, then the backend pulse
    // (900) lands at 2300 and ends at 3200. The floor leaves a ~400ms settle rather than snapping on.
    duration: 3600,
    narration: 'The controller reads the request Host header, shop.io, and the path, /, and matches them against its compiled rules. Only the / rule matches, so it proxies the request to Service web, and most controllers skip the ClusterIP and send straight to a Ready Pod IP read from the EndpointSlice. The api branch stays idle for this request.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      branch(s, 'web');
      setWire(s, 'web', 'proxy -> web');
      s.refs.ruleA.classList.add('highlight');
      s.refs.hostChip.classList.add('highlight');
      s.refs.pathChip.classList.add('highlight');
      setVal(s.refs.hostChip, 'shop.io');
      setVal(s.refs.pathChip, '/');
      if (ctx.reduced) { s.refs.ctrlBox.classList.add('highlight'); s.refs.svcWeb.classList.add('highlight'); s.refs.podWebBox.classList.add('highlight'); return; }
      // The controller proxies, so the Service is the destination of that hop and lights when the
      // ball lands on it, not before the controller has even chosen the branch.
      pulsePod(s.refs.ctrl, ctx, 0);
      const toSvc = routePacket(s, ctx, TO_WEB, { delay: BEAT.afterPulse, role: 'network' });
      lightBoxAt(s.refs.svcWeb, ctx, toSvc.arrivalMs);
      const toPod = segmentPacket(s, ctx, { from: WEB_HOP[0], to: WEB_HOP[1], delay: toSvc.arrivalMs + BEAT.afterHop, role: 'network' });
      pulsePod(s.refs.podWeb, ctx, toPod.arrivalMs);
    },
  },
  {
    id: 'api-request',
    duration: 2400,
    narration: 'A second request arrives through the same entry point, this time for shop.io/api. Same host, same controller, same terminated TLS. Only the request path is different, and no rule has been picked yet.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // Exact mirror of the entry step: a request lands and TLS is terminated, nothing is matched yet,
      // so no rule chip lights and BOTH branches stay neutral. The rule is chosen in api-proxy.
      branch(s, 'both');
      setWire(s, 'w', 'GET shop.io/api');
      setVal(s.refs.hostChip, 'shop.io');
      setVal(s.refs.pathChip, '/api');
      s.refs.pathChip.classList.add('highlight');
      s.refs.extLB.classList.add('highlight');
      s.refs.tlsChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.ctrlBox.classList.add('highlight'); return; }
      // Down-arrow: the request arrives at the controller (one hop), which pulses on arrival.
      const inb = segmentPacket(s, ctx, { from: ENTRY[0], to: ENTRY[1], role: 'network' });
      pulsePod(s.refs.ctrl, ctx, inb.arrivalMs);
    },
  },
  {
    id: 'api-proxy',
    duration: 3600,           // same beat budget as match-proxy, which it mirrors
    narration: 'This time both rules match, because the Prefix path / is a prefix of every path. Kubernetes breaks the tie by longest matching path, so shop.io/api wins and the controller proxies down the other branch, to Service api and on to a Ready Pod behind it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      branch(s, 'api');
      setWire(s, 'api', 'proxy -> api');
      setVal(s.refs.hostChip, 'shop.io');
      setVal(s.refs.pathChip, '/api');
      // Both rules matched, so BOTH chips light. The longest match, ruleB, is the one that wins, and it
      // is the only branch that carries the ball.
      s.refs.ruleA.classList.add('highlight');
      s.refs.ruleB.classList.add('highlight');
      s.refs.hostChip.classList.add('highlight');
      s.refs.pathChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.ctrlBox.classList.add('highlight'); s.refs.svcApi.classList.add('highlight'); s.refs.podApiBox.classList.add('highlight'); return; }
      // Exact mirror of match-proxy on the lower fan: the controller pulses first as the sender, the
      // ball leaves at BEAT.afterPulse, and the api backend Pod pulses on arrival.
      pulsePod(s.refs.ctrl, ctx, 0);
      const toSvc = routePacket(s, ctx, TO_API, { delay: BEAT.afterPulse, role: 'network' });
      lightBoxAt(s.refs.svcApi, ctx, toSvc.arrivalMs);
      const toPod = segmentPacket(s, ctx, { from: API_HOP[0], to: API_HOP[1], delay: toSvc.arrivalMs + BEAT.afterHop, role: 'network' });
      pulsePod(s.refs.podApi, ctx, toPod.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
