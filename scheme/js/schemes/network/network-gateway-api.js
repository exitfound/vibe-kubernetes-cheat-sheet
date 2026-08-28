import { P, F, defineCard, midX } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-gateway-api


// Panel right <= 397, bottom <= 330 (a long narration here). The Client is the only block left of
// 397, so the whole request row hangs below that bottom.
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

// The list order IS the append order, which is the z-order: body blocks, then wires + labels above
// them, then the chips, then the packet layer on top.
export const SCENE = {
  'aria-label': 'Gateway API: a cluster-scoped GatewayClass names the controller implementation in controllerName, a Gateway owned by the cluster operator names that class in gatewayClassName and declares its listeners, and an HTTPRoute owned by the application team attaches to the Gateway through parentRefs, selects a hostname and matches a path, and forwards to a Service named in backendRefs. A client request enters on the Gateway listener, matches the route rule, and reaches a Ready backend Pod.',
  parts: [
    P.defs(),
    P.box({ key: 'client', x: CLIENT_X, y: CLIENT_Y, w: CLIENT_W, h: CLIENT_H, label: 'Client', sublabel: 'browser · https' }),
    // Each stack block carries the one field that makes it what it is. controllerName is a
    // domain-prefixed path by spec, not a bare word, so it is shown in that form.
    P.box({ key: 'gwClass', x: STACK_X, y: CLASS_Y, w: STACK_W, h: CLASS_H, label: 'GatewayClass: nginx', sublabel: 'controllerName: nginx.org/gw' }),
    P.box({ key: 'gw', x: STACK_X, y: GW_TOP, w: STACK_W, h: GW_H, label: 'Gateway', sublabel: 'listener :443 HTTPS' }),
    P.box({ key: 'route', x: STACK_X, y: ROUTE_Y, w: STACK_W, h: ROUTE_H, label: 'HTTPRoute', sublabel: 'parentRefs: Gateway' }),
    P.box({ key: 'svc', x: SVC_X, y: ROUTE_CY - SVC_H / 2, w: SVC_W, h: SVC_H, label: 'Service web', sublabel: '' }),
    P.pod({
      key: 'podW', innerKey: 'podWBox', x: POD_X, y: ROUTE_CY - POD_H / 2, w: POD_W, h: POD_H,
      label: 'Pod web', sublabel: '10.244.1.5',
      inner: { dx: 20, dy: 34, w: POD_W - 40, h: 52, label: 'app', sublabel: 'http :80' },
    }),
    P.arrow({ x1: ENTRY[0][0], y1: ENTRY[0][1], x2: ENTRY[1][0], y2: ENTRY[1][1], dashed: true, dim: true }),
    // gatewayClassName: a reference, so the arrowhead points at the referent (the class), even though
    // no data-plane traffic ever runs it.
    P.arrow({ x1: CLASS_REF[0][0], y1: CLASS_REF[0][1], x2: CLASS_REF[1][0], y2: CLASS_REF[1][1], dashed: true, dim: true }),
    P.arrow({ x1: CONSULT[0][0], y1: CONSULT[0][1], x2: CONSULT[1][0], y2: CONSULT[1][1], dashed: true, dim: true }),
    P.arrow({ x1: BACKEND[0][0], y1: BACKEND[0][1], x2: BACKEND[1][0], y2: BACKEND[1][1], dashed: true, dim: true }),
    P.arrow({ x1: DELIVER[0][0], y1: DELIVER[0][1], x2: DELIVER[1][0], y2: DELIVER[1][1], dashed: true, dim: true }),
    // Static field names on the two stack wires: they say WHY the boxes are joined. Both sit beside
    // the spine, never on it. The backendRef gap is only 60 wide, so that one is carried by its chip.
    P.tag({ x: STACK_CX + 16, y: midX(CLASS_BOTTOM, GW_TOP) + 4, anchor: 'start', text: 'gatewayClassName' }),
    P.tag({ x: STACK_CX + 16, y: midX(GW_BOTTOM, ROUTE_Y) + 4, anchor: 'start', text: 'match rules' }),
    P.tag({ x: ROLE_X, y: CLASS_Y + CLASS_H / 2 + 4, anchor: 'start', text: 'owned by: infra provider' }),
    P.tag({ x: ROLE_X, y: FLOW_Y + 4, anchor: 'start', text: 'owned by: cluster operator' }),
    P.tag({ x: STACK_X - 24, y: ROUTE_CY + 4, anchor: 'end', text: 'owned by: app team' }),
    // Blank at build, filled per step: the request line rides above the entry hop, and the backend Pod
    // is tagged as the endpoint the route resolved to.
    P.wire({ key: 'entry', x: midX(CLIENT_RIGHT, STACK_X), y: FLOW_Y - 12 }),
    P.wire({ key: 'pod', x: POD_X + POD_W / 2, y: ROUTE_CY - POD_H / 2 - 11 }),
    P.chip({ key: 'listenerChip', x: CLIENT_X, y: CHIP_Y, w: 200, h: 34, name: 'listener', value: ':443 HTTPS' }),
    P.chip({ key: 'hostnamesChip', x: 260, y: CHIP_Y, w: 180, h: 34, name: 'hostnames', value: 'shop.io' }),
    P.chip({ key: 'matchChip', x: 460, y: CHIP_Y, w: 200, h: 34, name: 'match', value: 'PathPrefix /' }),
    P.chip({ key: 'backendChip', x: 680, y: CHIP_Y, w: 260, h: 34, name: 'backendRefs', value: 'Service web:80' }),
    P.chip({ key: 'requestChip', x: 960, y: CHIP_Y, w: POD_RIGHT - 960, h: 34, name: 'request', value: 'none' }),
    P.packets(),
  ],
  // podWBox is listed by key so the .highlight a reduced replay puts on the inner app box is cleared
  // too: clearPodHighlight only resets inline strokes.
  reset: {
    keys: ['client', 'gwClass', 'gw', 'route', 'svc', 'podWBox', 'listenerChip', 'hostnamesChip', 'matchChip', 'backendChip', 'requestChip'],
    pods: ['podW'],
  },
};

// The four field chips restate fields of objects the card draws from its first frame, and the
// Gateway sublabel spells the listener already, so they are constants every step states.
const SPEC = { listenerChip: ':443 HTTPS', hostnamesChip: 'shop.io', matchChip: 'PathPrefix /', backendChip: 'Service web:80' };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { requestChip: 'none', ...SPEC },
  },
  {
    id: 'gatewayclass',
    duration: 2100,
    narration: 'At the base, a cluster-scoped GatewayClass names in controllerName which controller implementation will serve Gateways of this class, much like a StorageClass names a provisioner. It is installed by the infrastructure provider and rarely touched after that.',
    chips: { requestChip: 'none', ...SPEC },
    // Nothing references the class yet, so nothing moves: the block only lights. No flash, by design.
    lit: ['gwClass'],
  },
  {
    id: 'gateway',
    duration: 2200,
    narration: 'A Gateway names that class in gatewayClassName and declares the actual listeners: which ports, protocols and TLS the cluster accepts traffic on, here HTTPS on 443. It is owned by the cluster operator, who controls the entry points and, through allowedRoutes on each listener, which namespaces may attach routes to them. What those routes actually match is not the operator decision.',
    chips: { requestChip: 'none', ...SPEC },
    lit: ['gw', 'listenerChip'],
    // The Gateway resolves its class: the ball runs UP the reference wire, and the class lights when
    // it lands. This is a reconcile-time lookup, not data-plane traffic, which is why it goes up.
    flow: [
      F.segment({ from: CLASS_REF[0], to: CLASS_REF[1], lights: ['gwClass'] }),
    ],
  },
  {
    id: 'httproute',
    duration: 2200,
    narration: 'An HTTPRoute attaches to the Gateway through parentRefs. A top-level hostnames list selects shop.io, and each rule matches on a path, here the default PathPrefix type, then forwards to a backendRef, which is a Service unless another kind is named. The route is owned by the application team, so developers manage their own routing without needing rights on the shared Gateway.',
    chips: { requestChip: 'none', ...SPEC },
    // The Gateway it attaches to lights with it: the two are now one parent-child pair, and the three
    // fields the object owns are hostnames, the path match, and the backendRef.
    lit: ['gw', 'route', 'hostnamesChip', 'matchChip', 'backendChip'],
    // The route resolves the backendRef it names, and the Service lights as the ball lands. Nothing
    // rides the parent wire here: that wire carries requests, and no request exists yet.
    flow: [
      F.segment({ from: BACKEND[0], to: BACKEND[1], lights: ['svc'] }),
    ],
  },
  {
    id: 'request',
    // Four 700ms hops chained on BEAT.afterHop land the ball at 3100, and the Pod pulse (900) ends at
    // 4000. The floor leaves a settle rather than snapping straight on to the next step.
    duration: 4400,
    narration: 'With all three objects in place a live request finally has a path. A client hits the Gateway listener, the Gateway matches the request against the HTTPRoute rule and follows the backendRef to the Service. The Service then resolves to a Ready endpoint read from the EndpointSlice. A backendRef in another namespace would need a ReferenceGrant, while a route from another namespace is admitted by the listener allowedRoutes instead.',
    chips: { requestChip: 'GET shop.io/', ...SPEC },
    wires: { entry: 'GET shop.io/', pod: 'Ready endpoint' },
    // The whole chain is what serves this request, so every field the controller consults lights:
    // the listener it arrived on, the hostname and path it matched, and the backend it resolved to.
    lit: ['client', 'requestChip', 'listenerChip', 'hostnamesChip', 'matchChip', 'backendChip'],
    // The animated path says the Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['podWBox'],
    // Down-arrow the whole way: the Client is infrastructure and only lights, each block receives on
    // arrival, and the ball re-emerges at the far edge of a block instead of sliding over it.
    flow: [
      F.segment({ from: ENTRY[0], to: ENTRY[1], name: 'inb', lights: ['gw'] }),
      F.segment({ from: CONSULT[0], to: CONSULT[1], after: 'inb', name: 'consult', lights: ['route'] }),
      F.segment({ from: BACKEND[0], to: BACKEND[1], after: 'consult', name: 'toSvc', lights: ['svc'] }),
      F.segment({ from: DELIVER[0], to: DELIVER[1], after: 'toSvc', name: 'toPod' }),
      F.pulse({ pod: 'podW', at: 'toPod' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
