import { LANE_DY, P, F, defineCard, laneY, midX, shade, BEAT, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS/network-ingress-routing.md

// Four columns: the controller Service left, the controller Pod under its Ingress, and the backend
// Pods on the right with each Service hung OFF its Pod as a lookup rather than standing in the path.
const LB_X = 40, LB_W = 232, LB_H = 80;           // NET.L-01
const LB_RIGHT = LB_X + LB_W;
const CTRL_W = 232, CTRL_H = 114;                 // this card's Pod shell, same as both backends
const RULE_W = 320;                               // the longest rule row inks under it
const RULE_X = 420;                               // L-03: the first x clear of the panel column
const RULE_CX = RULE_X + RULE_W / 2;
const CTRL_X = RULE_CX - CTRL_W / 2;              // the controller stands centred under its rules
const CTRL_RIGHT = CTRL_X + CTRL_W;
const POD_W = 232, POD_H = 114;
const POD_X = 1160 - POD_W;                       // mirrors LB_X about x=600
const POD_CX = POD_X + POD_W / 2;
const FAN_X = midX(CTRL_RIGHT, POD_X);            // the bus both branches split on

// The Ingress document: a caption, then one tls row and two rule rows.
const RULE_H = 34, RULE_GAP = 6;
const RULE_Y = 62;
const ruleY = (i) => RULE_Y + i * (RULE_H + RULE_GAP);
const RULE_BOTTOM = ruleY(2) + RULE_H;

// The request pair runs on FLOW_Y, the branches sit ROW_DY off it, and each Service hangs SVC_GAP
// beyond its own Pod, above web and below api, so no lane ever meets a Service.
const FLOW_Y = 344;
const { out: REQ_Y, back: BACK_Y } = laneY(FLOW_Y, LANE_DY);   // request, answer
const ROW_DY = 70;
const { out: WEB_Y, back: API_Y } = laneY(FLOW_Y, ROW_DY);     // web, api
const CTRL_TOP = FLOW_Y - CTRL_H / 2;
const SVC_H = 80, SVC_GAP = 24;                   // NET.L-01
const WEB_POD_TOP = WEB_Y - POD_H / 2;
const API_POD_BOTTOM = API_Y + POD_H / 2;
const SVC_WEB_Y = WEB_POD_TOP - SVC_GAP - SVC_H;
const SVC_API_Y = API_POD_BOTTOM + SVC_GAP;
const CHIP_Y = 592, CHIP_H = 34;

// Each static wire and the packet that rides it share the same points array.
const REQ = [[LB_RIGHT, REQ_Y], [CTRL_X, REQ_Y]];
const BACK = [[CTRL_X, BACK_Y], [LB_RIGHT, BACK_Y]];
const TO_WEB = [[CTRL_RIGHT, FLOW_Y], [FAN_X, FLOW_Y], [FAN_X, WEB_Y], [POD_X, WEB_Y]];
const TO_API = [[CTRL_RIGHT, FLOW_Y], [FAN_X, FLOW_Y], [FAN_X, API_Y], [POD_X, API_Y]];
const OWNS = [[RULE_CX, CTRL_TOP], [RULE_CX, RULE_BOTTOM]];
const WEB_SEL = [[POD_CX, SVC_WEB_Y + SVC_H], [POD_CX, WEB_POD_TOP]];
const API_SEL = [[POD_CX, API_POD_BOTTOM], [POD_CX, SVC_API_Y]];

const WEB_IP = '10.244.1.5', API_IP = '10.244.2.7';

const podBlock = ({ key, y, label, ip }) => P.pod({
  key, innerKey: `${key}Box`, x: POD_X, y, w: POD_W, h: POD_H, label, sublabel: ip,
  inner: { dx: 20, dy: 34, w: POD_W - 40, h: 52, label: 'app', sublabel: 'eth0' },
});

// The list order IS the append order, which is the z-order: the blocks first, then the Ingress
// document and every wire above them, then the chip strip, then the packet layer carrying the ball.
export const SCENE = {
  'aria-label': 'Ingress controller routing: a controller Pod behind a LoadBalancer or NodePort Service of its own watches Ingress shop, whose TLS entry names Secret shop-tls and whose two Prefix rules send shop.io/ to Service web and shop.io/api to Service api. It terminates TLS, matches the Host header and the longest path, reads the Ready endpoints of the chosen Service from its EndpointSlice and proxies straight to that Pod IP, and a request for a host no Ingress of its class names gets a 404 from the default backend of the controller itself',
  parts: [
    P.defs(),
    P.box({ key: 'extLB', x: LB_X, y: FLOW_Y - LB_H / 2, w: LB_W, h: LB_H, label: 'Controller Service', sublabel: 'LoadBalancer or NodePort' }),
    P.pod({
      key: 'ctrl', innerKey: 'ctrlBox', x: CTRL_X, y: CTRL_TOP, w: CTRL_W, h: CTRL_H,
      label: 'Ingress controller Pod', sublabel: 'watches Ingress, endpoints',
      inner: { dx: 20, dy: 34, w: CTRL_W - 40, h: 52, label: 'app', sublabel: 'eth0' },
    }),
    podBlock({ key: 'podWeb', y: WEB_POD_TOP, label: 'Pod web', ip: WEB_IP }),
    podBlock({ key: 'podApi', y: API_Y - POD_H / 2, label: 'Pod api', ip: API_IP }),
    P.box({ key: 'svcWeb', x: POD_X, y: SVC_WEB_Y, w: POD_W, h: SVC_H, label: 'Service web', sublabel: `EndpointSlice: ${WEB_IP}` }),
    P.box({ key: 'svcApi', x: POD_X, y: SVC_API_Y, w: POD_W, h: SVC_H, label: 'Service api', sublabel: `EndpointSlice: ${API_IP}` }),
    P.tag({ x: RULE_CX, y: RULE_Y - 10, text: 'Ingress shop · ingressClassName: nginx' }),
    P.chip({ key: 'tlsRow', x: RULE_X, y: ruleY(0), w: RULE_W, h: RULE_H, name: 'tls shop.io', value: '-> Secret shop-tls' }),
    P.chip({ key: 'ruleA', x: RULE_X, y: ruleY(1), w: RULE_W, h: RULE_H, name: 'shop.io / Prefix', value: '-> Service web:80' }),
    P.chip({ key: 'ruleB', x: RULE_X, y: ruleY(2), w: RULE_W, h: RULE_H, name: 'shop.io /api Prefix', value: '-> Service api:80' }),
    // Relations, never ridden: the controller reads its Ingress, and each Service selects its Pod.
    P.relation({ points: OWNS, dash: '5 5' }),
    P.relation({ key: 'webSel', points: WEB_SEL, dash: '5 5' }),
    P.relation({ key: 'apiSel', points: API_SEL, dash: '5 5' }),
    P.arrow({ from: REQ[0], to: REQ[1], dashed: true, dim: true }),
    P.arrow({ from: BACK[0], to: BACK[1], dashed: true, dim: true }),
    P.lane({ key: 'fanWeb', points: TO_WEB, dashed: true, dim: true }),
    P.lane({ key: 'fanApi', points: TO_API, dashed: true, dim: true }),
    P.wire({ key: 'req', x: midX(LB_RIGHT, CTRL_X), y: REQ_Y - 10 }),
    P.wire({ key: 'back', x: midX(LB_RIGHT, CTRL_X), y: BACK_Y + 18 }),
    P.chip({ key: 'hostChip', x: 40, y: CHIP_Y, w: 220, h: CHIP_H, name: 'Host', value: 'none' }),
    P.chip({ key: 'pathChip', x: 280, y: CHIP_Y, w: 200, h: CHIP_H, name: 'path', value: 'none' }),
    P.chip({ key: 'tlsChip', x: 500, y: CHIP_Y, w: 330, h: CHIP_H, name: 'TLS', value: 'none' }),
    P.chip({ key: 'servedChip', x: 850, y: CHIP_Y, w: 310, h: CHIP_H, name: 'served by', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: ['extLB', 'tlsRow', 'ruleA', 'ruleB', 'svcWeb', 'svcApi', 'hostChip', 'pathChip', 'tlsChip', 'servedChip', 'ctrlBox', 'podWebBox', 'podApiBox'],
    pods: ['ctrl', 'podWeb', 'podApi'],
  },
};

// A branch is its Service, its Pod, the selector between them and the lane into the Pod, all
// stated on every step as fields so a dim never leaks. 'both' is neutral, 'none' dims both.
const BRANCH = {
  web: ['svcWeb', 'podWeb', 'webSel', 'fanWeb'],
  api: ['svcApi', 'podApi', 'apiSel', 'fanApi'],
};
const branch = (active) => ({
  opacity: {
    ...shade(BRANCH.web, active === 'web' || active === 'both' ? 1 : OPACITY.notready),
    ...shade(BRANCH.api, active === 'api' || active === 'both' ? 1 : OPACITY.notready),
  },
});

// The three Ingress rows are the object drawn as a document: constants every step states.
const SPEC = { tlsRow: '-> Secret shop-tls', ruleA: '-> Service web:80', ruleB: '-> Service api:80' };
const TERMINATED = 'shop-tls, terminated';
const SERVED_WEB = `Pod ${WEB_IP}`, SERVED_API = `Pod ${API_IP}`, SERVED_404 = 'controller, 404';

// A tagged ball rides LEG_DUR near the catalog median so its tag is readable (M-12, PACING in motion.test).
const LEG_DUR = 1500;
// The Pod IP rides the ball (NET.T-01), TAG_DX right of it to clear the controller frame, on the side
// AWAY from the lane it turns into.
const TAG_DX = 54, TAG_DY_WEB = 18, TAG_DY_API = -14;
const tag = (p) => F.tag({ dur: LEG_DUR, dx: TAG_DX, ...p });
// The lookup lights the Service while the controller is still pulsing, before the ball leaves.
const LOOKUP_MS = 400;

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { hostChip: 'none', pathChip: 'none', tlsChip: 'none', servedChip: 'none', ...SPEC },
    ...branch('both'),
  },
  {
    id: 'rules',
    duration: 3000,
    narration: 'The controller watches the Ingress objects whose ingressClassName names its IngressClass. Ingress shop holds a TLS entry for shop.io and two rules, both with pathType Prefix: / goes to Service web and /api to Service api. The controller compiles them into its proxy config.',
    chips: { hostChip: 'none', pathChip: 'none', tlsChip: 'none', servedChip: 'none', ...SPEC },
    ...branch('both'),
    lit: ['tlsRow', 'ruleA', 'ruleB'],
    reducedLit: ['ctrlBox'],
    flow: [F.pulse({ pod: 'ctrl' })],
  },
  {
    id: 'entry',
    duration: 3000,
    narration: 'External traffic reaches the controller through a Service of its own, usually a LoadBalancer or NodePort. An HTTPS request for shop.io/ lands on the controller Pod, which serves the certificate from Secret shop-tls, the one its TLS entry names for that host, and terminates TLS.',
    wires: { req: 'HTTPS shop.io/' },
    chips: { hostChip: 'shop.io', pathChip: '/', tlsChip: TERMINATED, servedChip: 'none', ...SPEC },
    ...branch('both'),
    lit: ['extLB'],
    reducedLit: ['ctrlBox'],
    rewind: { chips: { hostChip: 'none', pathChip: 'none', tlsChip: 'none' } },
    flow: [
      F.segment({ from: REQ[0], to: REQ[1], name: 'inb', lights: ['hostChip', 'pathChip', 'tlsChip', 'tlsRow'] }),
      F.set({ at: 'inb', chips: { hostChip: 'shop.io', pathChip: '/', tlsChip: TERMINATED } }),
      F.pulse({ pod: 'ctrl', at: 'inb' }),
    ],
  },
  {
    id: 'match-web',
    duration: 4400,
    narration: 'Now it reads the Host header, shop.io, and the path, /. Only the / rule matches. The controller does not hand the request to the Service ClusterIP: it reads the Ready endpoints of Service web from its EndpointSlice and proxies straight to Pod IP 10.244.1.5.',
    chips: { hostChip: 'shop.io', pathChip: '/', tlsChip: TERMINATED, servedChip: SERVED_WEB, ...SPEC },
    ...branch('web'),
    lit: ['ruleA'],
    reducedLit: ['ctrlBox', 'podWebBox'],
    rewind: { chips: { servedChip: 'none' } },
    flow: [
      F.pulse({ pod: 'ctrl' }),
      F.light({ targets: ['svcWeb'], delay: LOOKUP_MS }),
      F.route({ points: TO_WEB, delay: BEAT.afterPulse, dur: LEG_DUR, name: 'toPod', lights: ['servedChip'] }),
      tag({ text: `to ${WEB_IP}`, points: TO_WEB, delay: BEAT.afterPulse, dy: TAG_DY_WEB }),
      F.set({ at: 'toPod', chips: { servedChip: SERVED_WEB } }),
      F.pulse({ pod: 'podWeb', at: 'toPod' }),
    ],
  },
  {
    id: 'match-api',
    duration: 5200,
    narration: 'A second HTTPS request asks for shop.io/api. Both rules match it, because Prefix / matches every path, and the Ingress spec gives precedence to the longest matching path, so /api wins. The controller reads the endpoints of Service api and proxies straight to Pod IP 10.244.2.7.',
    wires: { req: 'HTTPS shop.io/api' },
    chips: { hostChip: 'shop.io', pathChip: '/api', tlsChip: TERMINATED, servedChip: SERVED_API, ...SPEC },
    ...branch('api'),
    lit: ['extLB', 'ruleB'],
    reducedLit: ['ctrlBox', 'podApiBox'],
    rewind: { chips: { pathChip: '/', servedChip: SERVED_WEB } },
    flow: [
      F.segment({ from: REQ[0], to: REQ[1], name: 'inb', lights: ['pathChip'] }),
      F.set({ at: 'inb', chips: { pathChip: '/api' } }),
      F.pulse({ pod: 'ctrl', at: 'inb' }),
      F.light({ targets: ['svcApi'], at: 'inb', plus: LOOKUP_MS }),
      F.route({ points: TO_API, at: 'inb', plus: BEAT.afterPulse, dur: LEG_DUR, name: 'toPod', lights: ['servedChip'] }),
      tag({ text: `to ${API_IP}`, points: TO_API, at: 'inb', plus: BEAT.afterPulse, dy: TAG_DY_API }),
      F.set({ at: 'toPod', chips: { servedChip: SERVED_API } }),
      F.pulse({ pod: 'podApi', at: 'toPod' }),
    ],
  },
  {
    id: 'no-match',
    duration: 3400,
    narration: 'A plain HTTP request for other.io/ arrives. No Ingress of this class names that host and Ingress shop sets no defaultBackend, so the Ingress API leaves the answer to the controller. This one hands it to its own default backend, which answers 404, and neither Service is looked up.',
    wires: { req: 'HTTP other.io/', back: 'HTTP 404' },
    chips: { hostChip: 'other.io', pathChip: '/', tlsChip: 'none, plain HTTP', servedChip: SERVED_404, ...SPEC },
    ...branch('none'),
    lit: ['extLB'],
    reducedLit: ['ctrlBox'],
    rewind: { chips: { hostChip: 'shop.io', pathChip: '/api', tlsChip: TERMINATED, servedChip: SERVED_API } },
    flow: [
      F.segment({ from: REQ[0], to: REQ[1], name: 'inb', lights: ['hostChip', 'pathChip', 'tlsChip'] }),
      F.set({ at: 'inb', chips: { hostChip: 'other.io', pathChip: '/', tlsChip: 'none, plain HTTP' } }),
      F.pulse({ pod: 'ctrl', at: 'inb' }),
      F.segment({ from: BACK[0], to: BACK[1], at: 'inb', plus: BEAT.afterPulse, name: 'answer', lights: ['servedChip'] }),
      F.set({ at: 'answer', chips: { servedChip: SERVED_404 } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
