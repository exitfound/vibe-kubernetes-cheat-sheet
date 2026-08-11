import { P, F, defineCard, laneY, midX, shade, BEAT, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-ingress-routing


const FLOW_Y = 343;                  // (RULE_BOTTOM + CHIP_Y) / 2, the spine of the left-to-right flow
const ROW_DY = 70;                   // web branch sits this far above FLOW_Y, api the same below
const { out: WEB_Y, back: API_Y } = laneY(FLOW_Y, ROW_DY);   // 273 web, 413 api

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
const FAN_X = midX(CTRL_RIGHT, SVC_X);        // 690, the vertical bus the branches split on

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

const podBlock = ({ key, x, y, w, h, label, ip }) => P.pod({
  key, innerKey: `${key}Box`, x, y, w, h, label, sublabel: ip,
  inner: { dx: 20, dy: 34, w: w - 40, h: 52, label: 'app', sublabel: 'eth0' },
});

// The list order IS the append order, which is the z-order: the blocks first, then the rules panel
// and every wire above them, then the chip strip, then the packet layer carrying the ball.
export const SCENE = {
  'aria-label': 'Ingress controller routing: an Ingress controller Pod watches Ingress objects, matches the request host and path against the rules, terminates TLS, and proxies each request on to the backend Service and Pod its rule names, slash to Service web and slash api to Service api',
  parts: [
    P.defs(),
    // Every block is centred on its own row: extLB and the controller on FLOW_Y, each Service on the
    // same row as the backend Pod it fronts, so no wire ever meets a block off-centre.
    P.box({ key: 'extLB', x: LB_X, y: FLOW_Y - LB_H / 2, w: LB_W, h: LB_H, label: 'External LB', sublabel: 'or NodePort' }),
    P.box({ key: 'svcWeb', x: SVC_X, y: WEB_Y - SVC_H / 2, w: SVC_W, h: SVC_H, label: 'Service web', sublabel: '' }),
    P.box({ key: 'svcApi', x: SVC_X, y: API_Y - SVC_H / 2, w: SVC_W, h: SVC_H, label: 'Service api', sublabel: '' }),
    podBlock({ key: 'podWeb', x: POD_X, y: WEB_Y - POD_H / 2, w: POD_W, h: POD_H, label: 'Pod web', ip: '10.244.1.5' }),
    podBlock({ key: 'podApi', x: POD_X, y: API_Y - POD_H / 2, w: POD_W, h: POD_H, label: 'Pod api', ip: '10.244.2.7' }),
    podBlock({ key: 'ctrl', x: CTRL_X, y: CTRL_TOP, w: CTRL_W, h: CTRL_H, label: 'Ingress controller Pod', ip: 'watches Ingress' }),
    P.tag({ x: RULE_CX, y: 56, text: 'Ingress "shop" · ingressClassName nginx' }),
    P.chip({ key: 'ruleA', x: RULE_X, y: 66, w: RULE_W, h: 36, name: 'shop.io/', value: '-> Service web:80' }),
    P.chip({ key: 'ruleB', x: RULE_X, y: 110, w: RULE_W, h: 36, name: 'shop.io/api', value: '-> Service api:80' }),
    P.arrow({ x1: ENTRY[0][0], y1: ENTRY[0][1], x2: ENTRY[1][0], y2: ENTRY[1][1], dashed: true, dim: true }),
    P.relation({ points: [[CTRL_CX, CTRL_TOP], [CTRL_CX, RULE_BOTTOM]], dash: '5 5' }),
    P.lane({ key: 'fanWeb', points: TO_WEB, dashed: true, dim: true }),
    P.lane({ key: 'fanApi', points: TO_API, dashed: true, dim: true }),
    P.arrow({ key: 'podWebWire', x1: WEB_HOP[0][0], y1: WEB_HOP[0][1], x2: WEB_HOP[1][0], y2: WEB_HOP[1][1], dashed: true, dim: true }),
    P.arrow({ key: 'podApiWire', x1: API_HOP[0][0], y1: API_HOP[0][1], x2: API_HOP[1][0], y2: API_HOP[1][1], dashed: true, dim: true }),
    P.wire({ key: 'w', x: midX(LB_RIGHT, CTRL_X), y: FLOW_Y - 12 }),
    P.wire({ key: 'web', x: SVC_X + SVC_W / 2, y: WEB_Y - SVC_H / 2 - 10 }),
    P.wire({ key: 'api', x: SVC_X + SVC_W / 2, y: API_Y + SVC_H / 2 + 18 }),
    P.chip({ key: 'hostChip', x: LB_X, y: CHIP_Y, w: 310, h: 34, name: 'Host', value: 'none' }),
    P.chip({ key: 'pathChip', x: 370, y: CHIP_Y, w: 290, h: 34, name: 'path', value: 'none' }),
    P.chip({ key: 'tlsChip', x: 680, y: CHIP_Y, w: POD_RIGHT - 680, h: 34, name: 'TLS', value: 'terminated at controller' }),
    P.packets(),
  ],
  reset: {
    keys: ['extLB', 'ruleA', 'ruleB', 'svcWeb', 'svcApi', 'hostChip', 'pathChip', 'tlsChip', 'ctrlBox', 'podWebBox', 'podApiBox'],
    pods: ['ctrl', 'podWeb', 'podApi'],
  },
};

// A branch is its Service, its Pod AND the two lanes joining them: a lane into a Service the request
// did not choose is not a route on this step, and blocks listed without lanes leave arrows lit.
const BRANCH = {
  web: ['svcWeb', 'podWeb', 'fanWeb', 'podWebWire'],
  api: ['svcApi', 'podApi', 'fanApi', 'podApiWire'],
};

// Dim the branch the current request is not taking, as FIELDS: both branches are stated on every
// step, so a dim never leaks. 'both' leaves the scheme neutral, before any rule has matched.
const branch = (active) => ({
  opacity: {
    ...shade(BRANCH.web, active === 'api' ? OPACITY.notready : 1),
    ...shade(BRANCH.api, active === 'web' ? OPACITY.notready : 1),
  },
});

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { hostChip: 'none', pathChip: 'none' },
    ...branch('both'),
  },
  {
    id: 'rules',
    duration: 2200,
    narration: 'The controller watches the Ingress objects that name its ingressClassName. This Ingress shop says that requests to shop.io/ go to Service web and shop.io/api go to Service api. The controller compiles those rules into its proxy config and waits for traffic.',
    // No request yet, so the request chips stay empty and both branches stay neutral.
    chips: { hostChip: 'none', pathChip: 'none' },
    ...branch('both'),
    lit: ['ruleA', 'ruleB'],
    // The controller compiles the rules: it pulses, the rule chips just light.
    reducedLit: ['ctrlBox'],
    flow: [F.pulse({ pod: 'ctrl' })],
  },
  {
    id: 'entry',
    duration: 2200,
    narration: 'External traffic does not reach the controller magically: it arrives through a Service of its own, usually a LoadBalancer or NodePort in front of it. A client request for shop.io lands on the controller Pod, and it terminates TLS here before looking at anything else.',
    wires: { w: 'GET shop.io/' },
    chips: { hostChip: 'shop.io', pathChip: '/' },
    ...branch('both'),
    lit: ['hostChip', 'pathChip', 'extLB', 'tlsChip'],
    reducedLit: ['ctrlBox'],
    // Down-arrow: the request arrives at the controller (one hop), which pulses on arrival.
    flow: [
      F.segment({ from: ENTRY[0], to: ENTRY[1], name: 'inb' }),
      F.pulse({ pod: 'ctrl', at: 'inb' }),
    ],
  },
  {
    id: 'match-proxy',
    // Motion runs pulse(800) + fan(420) + hop beat(100) + hop(420) = 1740ms, then the backend pulse
    // (900) lands at 2300 and ends at 3200. The floor leaves a ~400ms settle rather than snapping on.
    duration: 3600,
    narration: 'The controller reads the request Host header, shop.io, and the path, /, and matches them against its compiled rules. Only the / rule matches, so it proxies the request to Service web, and most controllers skip the ClusterIP and send straight to a Ready Pod IP read from the EndpointSlice. The api branch stays idle for this request.',
    wires: { web: 'proxy -> web' },
    chips: { hostChip: 'shop.io', pathChip: '/' },
    ...branch('web'),
    lit: ['ruleA', 'hostChip', 'pathChip'],
    reducedLit: ['ctrlBox', 'podWebBox'],
    // The controller proxies, so the Service is the destination of that hop and lights when the
    // ball lands on it, not before the controller has even chosen the branch.
    flow: [
      F.pulse({ pod: 'ctrl' }),
      F.route({ points: TO_WEB, delay: BEAT.afterPulse, name: 'toSvc', lights: ['svcWeb'] }),
      F.segment({ from: WEB_HOP[0], to: WEB_HOP[1], after: 'toSvc', name: 'toPod' }),
      F.pulse({ pod: 'podWeb', at: 'toPod' }),
    ],
  },
  {
    id: 'api-request',
    duration: 2400,
    narration: 'A second request arrives through the same entry point, this time for shop.io/api. Same host, same controller, same terminated TLS. Only the request path is different, and no rule has been picked yet.',
    // Exact mirror of the entry step: a request lands and TLS is terminated, nothing is matched yet,
    // so no rule chip lights and BOTH branches stay neutral. The rule is chosen in api-proxy.
    wires: { w: 'GET shop.io/api' },
    chips: { hostChip: 'shop.io', pathChip: '/api' },
    ...branch('both'),
    lit: ['pathChip', 'extLB', 'tlsChip'],
    reducedLit: ['ctrlBox'],
    // Down-arrow: the request arrives at the controller (one hop), which pulses on arrival.
    flow: [
      F.segment({ from: ENTRY[0], to: ENTRY[1], name: 'inb' }),
      F.pulse({ pod: 'ctrl', at: 'inb' }),
    ],
  },
  {
    id: 'api-proxy',
    duration: 3600,           // same beat budget as match-proxy, which it mirrors
    narration: 'This time both rules match, because the Prefix path / is a prefix of every path. Kubernetes breaks the tie by longest matching path, so shop.io/api wins and the controller proxies down the other branch, to Service api and on to a Ready Pod behind it.',
    wires: { api: 'proxy -> api' },
    chips: { hostChip: 'shop.io', pathChip: '/api' },
    ...branch('api'),
    // Both rules matched, so BOTH chips light. The longest match, ruleB, is the one that wins, and it
    // is the only branch that carries the ball.
    lit: ['ruleA', 'ruleB', 'hostChip', 'pathChip'],
    reducedLit: ['ctrlBox', 'podApiBox'],
    // Exact mirror of match-proxy on the lower fan: the controller pulses first as the sender, the
    // ball leaves at BEAT.afterPulse, and the api backend Pod pulses on arrival.
    flow: [
      F.pulse({ pod: 'ctrl' }),
      F.route({ points: TO_API, delay: BEAT.afterPulse, name: 'toSvc', lights: ['svcApi'] }),
      F.segment({ from: API_HOP[0], to: API_HOP[1], after: 'toSvc', name: 'toPod' }),
      F.pulse({ pod: 'podApi', at: 'toPod' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
