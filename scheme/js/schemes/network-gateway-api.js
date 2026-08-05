import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt } from '../lib/network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-gateway-api


// Panel measured 2026-07-27: right <= 397, bottom <= 330 (this card carries a long narration). The
// Client is the only block left of 397, so the whole request row hangs below that bottom. A longer
// narration invalidates the measurement.
const FLOW_Y = 380;                          // Client + Gateway share this row: a request enters here

const CLIENT_X = 40, CLIENT_W = 260, CLIENT_H = 72;
const CLIENT_Y = FLOW_Y - CLIENT_H / 2;        // 344, clear of the panel bottom above
const CLIENT_RIGHT = CLIENT_X + CLIENT_W;      // 300

const STACK_X = 410, STACK_W = 260;
const STACK_CX = STACK_X + STACK_W / 2;        // 540, the spine every stack wire runs on
const STACK_RIGHT = STACK_X + STACK_W;         // 670

const GW_H = 86;                               // the GatewayClass shares this height, they are peers
const CLASS_Y = 56, CLASS_H = GW_H;            // 56..142
const CLASS_BOTTOM = CLASS_Y + CLASS_H;        // 142
const GW_TOP = FLOW_Y - GW_H / 2;              // 337
const GW_BOTTOM = GW_TOP + GW_H;               // 423
const ROUTE_Y = 460, ROUTE_H = 84;             // 460..544
const ROUTE_CY = ROUTE_Y + ROUTE_H / 2;        // 502, the row the backend hangs off

const SVC_W = 160, SVC_H = 66, SVC_X = 730;
const SVC_RIGHT = SVC_X + SVC_W;               // 890
const POD_X = 950, POD_W = 210, POD_H = 114;
const POD_RIGHT = POD_X + POD_W;               // 1160

const ROLE_X = 700;                            // ownership captions, left-anchored just right of the stack
const CHIP_Y = 586;

const ENTRY = [[CLIENT_RIGHT, FLOW_Y], [STACK_X, FLOW_Y]];
const CLASS_REF = [[STACK_CX, GW_TOP], [STACK_CX, CLASS_BOTTOM]];      // Gateway -> its GatewayClass
const CONSULT = [[STACK_CX, GW_BOTTOM], [STACK_CX, ROUTE_Y]];          // Gateway -> the rules attached to it
const BACKEND = [[STACK_RIGHT, ROUTE_CY], [SVC_X, ROUTE_CY]];          // HTTPRoute -> backendRef Service
const DELIVER = [[SVC_RIGHT, ROUTE_CY], [POD_X, ROUTE_CY]];            // Service -> a Ready Pod

function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, role: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 34, w: w - 40, h: 52, label: 'app', sublabel: 'http :80', role: 'network' });
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
      'aria-label': 'Gateway API: a cluster-scoped GatewayClass names the controller implementation in controllerName, a Gateway owned by the cluster operator names that class in gatewayClassName and declares its listeners, and an HTTPRoute owned by the application team attaches to the Gateway through parentRefs, selects a hostname and matches a path, and forwards to a Service named in backendRefs. A client request enters on the Gateway listener, matches the route rule, and reaches a Ready backend Pod.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client  = box({ x: CLIENT_X, y: CLIENT_Y, w: CLIENT_W, h: CLIENT_H, label: 'Client', sublabel: 'browser · https', role: 'network' });
    // Each stack block carries the one field that makes it what it is. controllerName is a
    // domain-prefixed path by spec, not a bare word, so it is shown in that form.
    const gwClass = box({ x: STACK_X, y: CLASS_Y, w: STACK_W, h: CLASS_H, label: 'GatewayClass: nginx', sublabel: 'controllerName: nginx.org/gw', role: 'network' });
    const gw      = box({ x: STACK_X, y: GW_TOP,  w: STACK_W, h: GW_H,    label: 'Gateway', sublabel: 'listener :443 HTTPS', role: 'network' });
    const route   = box({ x: STACK_X, y: ROUTE_Y, w: STACK_W, h: ROUTE_H, label: 'HTTPRoute', sublabel: 'parentRefs: Gateway', role: 'network' });
    const svc     = box({ x: SVC_X, y: ROUTE_CY - SVC_H / 2, w: SVC_W, h: SVC_H, label: 'Service web', sublabel: '', role: 'network' });
    const podW    = podBlock({ x: POD_X, y: ROUTE_CY - POD_H / 2, w: POD_W, h: POD_H, label: 'Pod web', ip: '10.244.1.5' });

    const entryWire   = arrow({ x1: ENTRY[0][0], y1: ENTRY[0][1], x2: ENTRY[1][0], y2: ENTRY[1][1], dashed: true, dim: true, role: 'network' });
    // gatewayClassName: a reference, so the arrowhead points at the referent (the class), even though
    // no data-plane traffic ever runs it.
    const classWire   = arrow({ x1: CLASS_REF[0][0], y1: CLASS_REF[0][1], x2: CLASS_REF[1][0], y2: CLASS_REF[1][1], dashed: true, dim: true, role: 'network' });
    const parentWire  = arrow({ x1: CONSULT[0][0], y1: CONSULT[0][1], x2: CONSULT[1][0], y2: CONSULT[1][1], dashed: true, dim: true, role: 'network' });
    const backendWire = arrow({ x1: BACKEND[0][0], y1: BACKEND[0][1], x2: BACKEND[1][0], y2: BACKEND[1][1], dashed: true, dim: true, role: 'network' });
    const deliverWire = arrow({ x1: DELIVER[0][0], y1: DELIVER[0][1], x2: DELIVER[1][0], y2: DELIVER[1][1], dashed: true, dim: true, role: 'network' });

    // Static field names on the two stack wires: they say WHY the boxes are joined. Both sit beside
    // the spine, never on it. The backendRef gap is only 60 wide, so that one is carried by its chip.
    const classField  = text({ class: 'scheme-label code dim', x: STACK_CX + 16, y: (CLASS_BOTTOM + GW_TOP) / 2 + 4, 'text-anchor': 'start' }, ['gatewayClassName']);
    const parentField = text({ class: 'scheme-label code dim', x: STACK_CX + 16, y: (GW_BOTTOM + ROUTE_Y) / 2 + 4, 'text-anchor': 'start' }, ['match rules']);

    const roleA = text({ class: 'scheme-label code dim', x: ROLE_X, y: CLASS_Y + CLASS_H / 2 + 4, 'text-anchor': 'start' }, ['owned by: infra provider']);
    const roleB = text({ class: 'scheme-label code dim', x: ROLE_X, y: FLOW_Y + 4,   'text-anchor': 'start' }, ['owned by: cluster operator']);
    const roleC = text({ class: 'scheme-label code dim', x: STACK_X - 24, y: ROUTE_CY + 4, 'text-anchor': 'end' }, ['owned by: app team']);

    // Blank at build, filled per step: the request line rides above the entry hop, and the backend Pod
    // is tagged as the endpoint the route resolved to.
    const entryLabel = text({ class: 'scheme-label code dim', x: (CLIENT_RIGHT + STACK_X) / 2, y: FLOW_Y - 12, 'text-anchor': 'middle' }, [' ']);
    const podLabel   = text({ class: 'scheme-label code dim', x: POD_X + POD_W / 2, y: ROUTE_CY - POD_H / 2 - 11, 'text-anchor': 'middle' }, [' ']);

    const listenerChip  = valChip({ x: CLIENT_X, y: CHIP_Y, w: 200, h: 34, name: 'listener', value: ':443 HTTPS', role: 'network' });
    const hostnamesChip = valChip({ x: 260, y: CHIP_Y, w: 180, h: 34, name: 'hostnames', value: 'shop.io', role: 'network' });
    const matchChip     = valChip({ x: 460, y: CHIP_Y, w: 200, h: 34, name: 'match', value: 'PathPrefix /', role: 'network' });
    const backendChip   = valChip({ x: 680, y: CHIP_Y, w: 260, h: 34, name: 'backendRefs', value: 'Service web:80', role: 'network' });
    const requestChip   = valChip({ x: 960, y: CHIP_Y, w: POD_RIGHT - 960, h: 34, name: 'request', value: 'none', role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: body blocks, then wires + labels above them, then chips, then packets on top.
    root.appendChild(client);
    root.appendChild(gwClass);
    root.appendChild(gw);
    root.appendChild(route);
    root.appendChild(svc);
    root.appendChild(podW.group);
    [entryWire, classWire, parentWire, backendWire, deliverWire,
      classField, parentField, roleA, roleB, roleC, entryLabel, podLabel].forEach(el => root.appendChild(el));
    [listenerChip, hostnamesChip, matchChip, backendChip, requestChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, client, gwClass, gw, route, svc, podW: podW.group, podWBox: podW.innerBox,
      listenerChip, hostnamesChip, matchChip, backendChip, requestChip,
      packetLayer, wires: { entry: entryLabel, pod: podLabel },
    };
  }

  reset() { this.build(); }
}

// podWBox is listed by key so the .highlight a reduced replay puts on the inner app box is cleared
// too: clearPodHighlight only resets inline strokes.
function clearHL(s) {
  clearHighlights(s, ['client', 'gwClass', 'gw', 'route', 'svc', 'podWBox', 'listenerChip', 'hostnamesChip', 'matchChip', 'backendChip', 'requestChip'], [s.refs.podW]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.requestChip, 'none');
    },
  },
  {
    id: 'gatewayclass',
    duration: 2100,
    narration: 'At the base, a cluster-scoped GatewayClass names in controllerName which controller implementation will serve Gateways of this class, much like a StorageClass names a provisioner. It is installed by the infrastructure provider and rarely touched after that.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.requestChip, 'none');
      // Nothing references the class yet, so nothing moves: the block only lights. No flash, by design.
      s.refs.gwClass.classList.add('highlight');
    },
  },
  {
    id: 'gateway',
    duration: 2200,
    narration: 'A Gateway names that class in gatewayClassName and declares the actual listeners: which ports, protocols and TLS the cluster accepts traffic on, here HTTPS on 443. It is owned by the cluster operator, who controls the entry points and, through allowedRoutes on each listener, which namespaces may attach routes to them. What those routes actually match is not the operator decision.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.requestChip, 'none');
      s.refs.gw.classList.add('highlight');
      s.refs.listenerChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.gwClass.classList.add('highlight'); return; }
      // The Gateway resolves its class: the ball runs UP the reference wire, and the class lights when
      // it lands. This is a reconcile-time lookup, not data-plane traffic, which is why it goes up.
      const ref = segmentPacket(s, ctx, { from: CLASS_REF[0], to: CLASS_REF[1], role: 'network' });
      lightBoxAt(s.refs.gwClass, ctx, ref.arrivalMs);
    },
  },
  {
    id: 'httproute',
    duration: 2200,
    narration: 'An HTTPRoute attaches to the Gateway through parentRefs. A top-level hostnames list selects shop.io, and each rule matches on a path, here the default PathPrefix type, then forwards to a backendRef, which is a Service unless another kind is named. The route is owned by the application team, so developers manage their own routing without needing rights on the shared Gateway.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.requestChip, 'none');
      // The Gateway it attaches to lights with it: the two are now one parent-child pair.
      s.refs.gw.classList.add('highlight');
      s.refs.route.classList.add('highlight');
      // The three fields this object owns: hostnames, the path match, and the backendRef.
      s.refs.hostnamesChip.classList.add('highlight');
      s.refs.matchChip.classList.add('highlight');
      s.refs.backendChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.svc.classList.add('highlight'); return; }
      // The route resolves the backendRef it names, and the Service lights as the ball lands. Nothing
      // rides the parent wire here: that wire carries requests, and no request exists yet.
      const backend = segmentPacket(s, ctx, { from: BACKEND[0], to: BACKEND[1], role: 'network' });
      lightBoxAt(s.refs.svc, ctx, backend.arrivalMs);
    },
  },
  {
    id: 'request',
    // Four 700ms hops chained on BEAT.afterHop land the ball at 3100, and the Pod pulse (900) ends at
    // 4000. The floor leaves a settle rather than snapping straight on to the next step.
    duration: 4400,
    narration: 'With all three objects in place a live request finally has a path. A client hits the Gateway listener, the controller matches the request against the HTTPRoute rule and follows the backendRef to the Service. Most implementations then skip the ClusterIP and send straight to a Ready endpoint read from the EndpointSlice. A backendRef in another namespace would need a ReferenceGrant, while a route from another namespace is admitted by the listener allowedRoutes instead.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'entry', 'GET shop.io/');
      setWire(s, 'pod', 'Ready endpoint');
      setVal(s.refs.requestChip, 'GET shop.io/');
      // The whole chain is what serves this request, so every field the controller consults lights:
      // the listener it arrived on, the hostname and path it matched, and the backend it resolved to.
      s.refs.client.classList.add('highlight');
      s.refs.requestChip.classList.add('highlight');
      s.refs.listenerChip.classList.add('highlight');
      s.refs.hostnamesChip.classList.add('highlight');
      s.refs.matchChip.classList.add('highlight');
      s.refs.backendChip.classList.add('highlight');
      if (ctx.reduced) {
        ['gw', 'route', 'svc'].forEach(k => s.refs[k].classList.add('highlight'));
        s.refs.podWBox.classList.add('highlight');
        return;
      }
      // Down-arrow the whole way: the Client is infrastructure and only lights, each block receives on
      // arrival, and the ball re-emerges at the far edge of a block instead of sliding over it.
      const inb = segmentPacket(s, ctx, { from: ENTRY[0], to: ENTRY[1], role: 'network' });
      lightBoxAt(s.refs.gw, ctx, inb.arrivalMs);
      const consult = segmentPacket(s, ctx, { from: CONSULT[0], to: CONSULT[1], delay: inb.arrivalMs + BEAT.afterHop, role: 'network' });
      lightBoxAt(s.refs.route, ctx, consult.arrivalMs);
      const toSvc = segmentPacket(s, ctx, { from: BACKEND[0], to: BACKEND[1], delay: consult.arrivalMs + BEAT.afterHop, role: 'network' });
      lightBoxAt(s.refs.svc, ctx, toSvc.arrivalMs);
      const toPod = segmentPacket(s, ctx, { from: DELIVER[0], to: DELIVER[1], delay: toSvc.arrivalMs + BEAT.afterHop, role: 'network' });
      pulsePod(s.refs.podW, ctx, toPod.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
