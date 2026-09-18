import { P, F, defineCard, makeRidingLabel, laneY, ladder, BEAT, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS/network-gateway-api.md


// A ladder of consent on the right edge: GatewayClass, Gateway, HTTPRoute and Service, joined by the
// reference fields that name each other. Every condition chip stands on the row of the object that
// reports it, so the column left of the ladder reads as one table of state. The data rail runs along
// the floor, Client to the proxy and the proxy to Pod web, which hangs under the Service it backs.
const BOX_W = 232, BOX_H = 80;                    // NET.L-01, every block on the card
const LAD_X = 928;                                // 928..1160
const LAD_CX = LAD_X + BOX_W / 2;                 // 1044, the spine every reference runs on
const rungY = ladder({ y: 40, rowH: BOX_H, gap: 24 });           // 40 / 144 / 248 / 352
const rungCY = (i) => rungY(i) + BOX_H / 2;       // 80 / 184 / 288 / 392
const rungB = (i) => rungY(i) + BOX_H;
const seamCY = (i) => (rungB(i) + rungY(i + 1)) / 2;             // 132 / 236 / 340

// The chip column stands 28 left of the ladder and starts at the L-03 line. The HTTPRoute reports two
// conditions, stacked inside its 80 rung at an 8 gap.
const CHIP_W = 476, CHIP_H = 34, CHIP_GAP = 8;
const CHIP_R = LAD_X - 28;                        // 900
const CHIP_X = CHIP_R - CHIP_W;                   // 424
const chipAt = (cy) => cy - CHIP_H / 2;
const pairAt = (cy, k) => cy - CHIP_H - CHIP_GAP / 2 + k * (CHIP_H + CHIP_GAP);
// The ReferenceGrant stands on the Service rung, centred under the chip column above it.
const GRANT_X = CHIP_X + (CHIP_W - BOX_W) / 2;    // 546

// The data rail, 48 under the Service rung: Client, proxy and Pod web at two equal 212 gaps, the
// proxy centred on 600 between the Client at 40 and Pod web under the ladder.
const POD_H = 104, POD_Y = rungB(3) + 48;         // 480
const DATA_Y = POD_Y + POD_H / 2;                 // 532
const CLIENT_X = 40;
const CLIENT_R = CLIENT_X + BOX_W;                // 272
const PROXY_X = (CLIENT_R + LAD_X) / 2 - BOX_W / 2;              // 484
const PROXY_R = PROXY_X + BOX_W;                  // 716
const { out: REQ_Y, back: ANS_Y } = laneY(DATA_Y, 12);          // 520 request, 544 answer

const REQ = [[CLIENT_R, REQ_Y], [PROXY_X, REQ_Y]];
const ANSWER = [[PROXY_X, ANS_Y], [CLIENT_R, ANS_Y]];
const TO_POD = [[PROXY_R, DATA_Y], [LAD_X, DATA_Y]];
const CLASS_REF = [[LAD_CX, rungY(1)], [LAD_CX, rungB(0)]];
const PARENT_REF = [[LAD_CX, rungY(2)], [LAD_CX, rungB(1)]];
const BACKEND_REF = [[LAD_CX, rungB(2)], [LAD_CX, rungY(3)]];
const GRANT_REF = [[GRANT_X + BOX_W, rungCY(3)], [LAD_X, rungCY(3)]];
const SELECTS = [[LAD_CX, rungB(3)], [LAD_CX, POD_Y]];

const WEB_IP = '10.244.1.5';

const box = (key, x, y, label, sublabel) => P.box({ key, x, y, w: BOX_W, h: BOX_H, label, sublabel });
const pod = (key, x, label, ip) => P.pod({
  key, innerKey: `${key}Box`, x, y: POD_Y, w: BOX_W, h: POD_H, label, sublabel: ip,
  inner: { dx: 20, dy: 26, w: BOX_W - 40, h: 44, label: 'app', sublabel: 'eth0' },
});
const fieldTag = (i, text) => P.tag({ x: LAD_CX + 10, y: seamCY(i) + 4, anchor: 'start', text });

// The list order IS the append order, which is the z-order: the ladder, the grant and the rail,
// then relations and lanes, the captions, the chips, then the packet layer.
export const SCENE = {
  'aria-label': 'Gateway API: a ladder of references on the right, with each condition beside the object that reports it. The cluster-scoped GatewayClass example names the controller that implements it in controllerName and reads Accepted True. Gateway shared-gw in namespace infra uses it and declares an HTTPS listener on 443 whose allowedRoutes admits only its own namespace by default. HTTPRoute web in namespace shop names the Gateway in parentRefs and is not Accepted, reason NotAllowedByListeners, until allowedRoutes selects shop. Its backendRef to Service web in namespace web then reports ResolvedRefs False, reason RefNotPermitted, and a client request matching the rule gets HTTP 500. ReferenceGrant from-shop in namespace web allows the reference, and the next request reaches the proxy, which here forwards it to Pod web by its endpoint',
  parts: [
    P.defs(),
    box('gwClass', LAD_X, rungY(0), 'GatewayClass example', 'example.com/gateway-controller'),
    box('gw', LAD_X, rungY(1), 'Gateway shared-gw', 'namespace infra · HTTPS :443'),
    box('route', LAD_X, rungY(2), 'HTTPRoute web', 'namespace shop · shop.io/'),
    box('svc', LAD_X, rungY(3), 'Service web', 'namespace web'),
    box('grant', GRANT_X, rungY(3), 'ReferenceGrant from-shop', 'not created yet'),
    box('client', CLIENT_X, DATA_Y - BOX_H / 2, 'Client', 'https'),
    pod('proxy', PROXY_X, 'Pod gateway-proxy', '10.244.0.9'),
    pod('podWeb', LAD_X, 'Pod web', WEB_IP),
    // References, which no ball ever rides: the fields that join the objects across namespaces.
    P.relation({ points: CLASS_REF, dash: '5 5' }),
    P.relation({ points: PARENT_REF, dash: '5 5' }),
    P.relation({ points: BACKEND_REF, dash: '5 5' }),
    P.relation({ points: GRANT_REF, dash: '5 5' }),
    P.relation({ points: SELECTS, dash: '5 5' }),
    P.arrow({ from: REQ[0], to: REQ[1], dashed: true, dim: true }),
    P.arrow({ from: ANSWER[0], to: ANSWER[1], dashed: true, dim: true }),
    P.arrow({ from: TO_POD[0], to: TO_POD[1], dashed: true, dim: true }),
    P.tag({ x: LAD_X, y: rungY(0) - 10, anchor: 'start', text: 'cluster-scoped' }),
    fieldTag(0, 'gatewayClassName'),
    fieldTag(1, 'parentRefs'),
    fieldTag(2, 'backendRefs'),
    // The request lanes are a pair, so the request label stands over the Client that sends it.
    P.wire({ key: 'req', x: CLIENT_X + BOX_W / 2, y: DATA_Y - BOX_H / 2 - 10 }),
    P.chip({ key: 'classChip', x: CHIP_X, y: chipAt(rungCY(0)), w: CHIP_W, h: CHIP_H, name: 'GatewayClass Accepted', value: 'none' }),
    P.chip({ key: 'allowChip', x: CHIP_X, y: chipAt(rungCY(1)), w: CHIP_W, h: CHIP_H, name: 'listener allowedRoutes', value: 'none' }),
    P.chip({ key: 'acceptChip', x: CHIP_X, y: pairAt(rungCY(2), 0), w: CHIP_W, h: CHIP_H, name: 'HTTPRoute Accepted', value: 'none' }),
    P.chip({ key: 'refsChip', x: CHIP_X, y: pairAt(rungCY(2), 1), w: CHIP_W, h: CHIP_H, name: 'HTTPRoute ResolvedRefs', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: ['client', 'gwClass', 'gw', 'route', 'svc', 'grant', 'classChip', 'allowChip', 'acceptChip', 'refsChip', 'proxyBox', 'podWebBox'],
    pods: ['proxy', 'podWeb'],
  },
};

// An object that does not exist yet stands at pending: the Gateway and its proxy until `platform`,
// the route until `rejected`, the grant until `grant`. Every line stays at full on every step, and
// a grant not yet there says so in its sublabel. Stated on every step, so no shade leaks.
const stage = (n) => {
  const gw = n >= 1 ? 1 : OPACITY.pending;
  return {
    opacity: {
      gw, proxy: gw,
      route: n >= 2 ? 1 : OPACITY.pending,
      grant: n >= 5 ? 1 : OPACITY.pending,
    },
    sublabels: { grant: n >= 5 ? 'HTTPRoute in shop to Service' : 'not created yet' },
  };
};

const SEL = 'from: Selector · shop';
const REJECTED = 'False · NotAllowedByListeners';
const NOT_PERMITTED = 'False · RefNotPermitted';
const HTTPS = 'HTTPS shop.io/';

// Both tagged legs ride LEG_DUR 1500 rather than the 700 floor, where a tag is gone before it can be
// read (M-12, PACING). Each tag emerges once clear of the face it leaves and retires before its text
// reaches the face it heads for: 212 units for the answer and for the leg to Pod web.
const LEG_DUR = 1500;
const podLabel = makeRidingLabel({ role: 'network', easing: 'linear', outMs: 170, hold: -530, emergeMode: true });
const answerLabel = makeRidingLabel({ role: 'network', easing: 'linear', outMs: 170, hold: -400, emergeMode: true });
// The Service lights while the proxy is still pulsing, as the lookup that picks the endpoint.
const LOOKUP_MS = 400;
// A status condition turns over this long after the change that causes it, so cause reads first.
const STATUS_MS = 800;
// The Gateway appears this long after the class is taken, so the two read as two beats.
const GW_AFTER_CLASS = 400;

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    ...stage(0),
    wires: { req: '' },
    chips: { classChip: 'none', allowChip: 'none', acceptChip: 'none', refsChip: 'none' },
  },
  {
    id: 'platform',
    // Motion: the class turns over at 800, the Gateway reveals from 1200 to 1700, the proxy pulse 900.
    duration: 3600,
    narration: 'Gateway API is an add-on whose kinds are custom resources. The cluster-scoped GatewayClass example names the controller that implements it in controllerName, and reads Accepted True once that controller takes it. Gateway shared-gw in namespace infra uses that class and declares an HTTPS listener on 443 with its certificate in certificateRefs. Its allowedRoutes keeps the default, from Same, and here the implementation runs a proxy for the Gateway.',
    ...stage(1),
    wires: { req: '' },
    chips: { classChip: 'True', allowChip: 'from: Same', acceptChip: 'none', refsChip: 'none' },
    lit: ['gwClass'],
    reducedLit: ['proxyBox'],
    rewind: { chips: { classChip: 'none', allowChip: 'none' } },
    flow: [
      F.set({ delay: STATUS_MS, chips: { classChip: 'True' }, lights: ['classChip'], name: 'taken' }),
      F.reveal({ target: 'gw', from: OPACITY.pending, at: 'taken', plus: GW_AFTER_CLASS, name: 'made' }),
      F.reveal({ target: 'proxy', from: OPACITY.pending, at: 'taken', plus: GW_AFTER_CLASS }),
      F.set({ at: 'made', chips: { allowChip: 'from: Same' }, lights: ['allowChip', 'gw'] }),
      F.pulse({ pod: 'proxy', at: 'made' }),
    ],
  },
  {
    id: 'rejected',
    duration: 3000,
    narration: 'HTTPRoute web is created in namespace shop: parentRefs names shared-gw, and one rule sends shop.io/ to Service web in namespace web. The listener admits routes from infra alone, so the route reads Accepted False, reason NotAllowedByListeners.',
    ...stage(2),
    wires: { req: '' },
    chips: { classChip: 'True', allowChip: 'from: Same', acceptChip: REJECTED, refsChip: 'none' },
    lit: ['route'],
    rewind: { chips: { acceptChip: 'none' } },
    flow: [
      F.reveal({ target: 'route', from: OPACITY.pending, name: 'made' }),
      F.set({ at: 'made', plus: STATUS_MS, chips: { acceptChip: REJECTED }, lights: ['acceptChip'] }),
    ],
  },
  {
    id: 'admitted',
    duration: 3000,
    narration: 'Gateway shared-gw is edited: allowedRoutes becomes from Selector, matching namespace shop, and the route turns Accepted True. Its backendRef points into namespace web, where no ReferenceGrant allows it, so ResolvedRefs reads False, reason RefNotPermitted, and the implementation configures no backend for the rule.',
    ...stage(3),
    wires: { req: '' },
    chips: { classChip: 'True', allowChip: SEL, acceptChip: 'True', refsChip: NOT_PERMITTED },
    lit: ['gw'],
    // Cause, then its two consequences, a STATUS_MS apart: the edit, the admission, the refused ref.
    rewind: { chips: { allowChip: 'from: Same', acceptChip: REJECTED, refsChip: 'none' } },
    flow: [
      F.set({ delay: BEAT.afterHop, chips: { allowChip: SEL }, lights: ['allowChip'], name: 'edit' }),
      F.set({ at: 'edit', plus: STATUS_MS, chips: { acceptChip: 'True' }, lights: ['acceptChip'], name: 'ok' }),
      F.set({ at: 'ok', plus: STATUS_MS, chips: { refsChip: NOT_PERMITTED }, lights: ['refsChip'] }),
    ],
  },
  {
    id: 'refused',
    // Motion: lead 800, the request 700, the proxy pulse, the answer leaves at 2300 and rides
    // LEG_DUR to 3800.
    duration: 4800,
    narration: 'A client sends HTTPS for shop.io/ to the Gateway address. The proxy terminates TLS and matches the accepted rule, but the only backendRef of that rule is invalid and the rule has no filters, so the request must get HTTP 500 instead of being forwarded.',
    ...stage(4),
    wires: { req: HTTPS },
    chips: { classChip: 'True', allowChip: SEL, acceptChip: 'True', refsChip: NOT_PERMITTED },
    lit: ['client'],
    reducedLit: ['proxyBox'],
    flow: [
      F.segment({ from: REQ[0], to: REQ[1], delay: BEAT.lead, name: 'inb' }),
      F.pulse({ pod: 'proxy', at: 'inb' }),
      F.segment({ from: ANSWER[0], to: ANSWER[1], at: 'inb', plus: BEAT.afterPulse, dur: LEG_DUR, lights: ['client'] }),
      F.tag({ fn: answerLabel, text: 'HTTP 500', points: ANSWER, at: 'inb', plus: BEAT.afterPulse, dur: LEG_DUR, dy: 18, emerge: 230, easing: 'linear' }),
    ],
  },
  {
    id: 'grant',
    duration: 3000,
    narration: 'ReferenceGrant from-shop is created in namespace web, allowing HTTPRoutes in namespace shop to reference its Services. The backendRef resolves and ResolvedRefs turns True, so the rule now has a backend: Service web, which selects Pod web.',
    ...stage(5),
    wires: { req: '' },
    chips: { classChip: 'True', allowChip: SEL, acceptChip: 'True', refsChip: 'True' },
    lit: ['grant'],
    rewind: { chips: { refsChip: NOT_PERMITTED } },
    flow: [
      F.reveal({ target: 'grant', from: OPACITY.pending, name: 'made' }),
      F.set({ at: 'made', plus: STATUS_MS, chips: { refsChip: 'True' }, lights: ['refsChip', 'svc'] }),
    ],
  },
  {
    id: 'request',
    // Motion: lead 800, the request 700, the proxy pulse, the leg at LEG_DUR from 2300, the Pod
    // pulse 900: 4700.
    duration: 5500,
    narration: 'The same request now matches Host and path against a configuration built from the Gateway and the HTTPRoute, and the rule has a backend. An implementation may send it to the Service IP or to the backing EndpointSlices, and here the proxy forwards straight to Pod web at 10.244.1.5.',
    ...stage(6),
    wires: { req: HTTPS },
    chips: { classChip: 'True', allowChip: SEL, acceptChip: 'True', refsChip: 'True' },
    lit: ['client'],
    reducedLit: ['proxyBox', 'podWebBox'],
    flow: [
      F.segment({ from: REQ[0], to: REQ[1], delay: BEAT.lead, name: 'inb' }),
      F.pulse({ pod: 'proxy', at: 'inb' }),
      F.light({ targets: ['svc'], at: 'inb', plus: LOOKUP_MS }),
      F.segment({ from: TO_POD[0], to: TO_POD[1], at: 'inb', plus: BEAT.afterPulse, dur: LEG_DUR, name: 'toPod' }),
      F.tag({ fn: podLabel, text: `to ${WEB_IP}`, points: TO_POD, at: 'inb', plus: BEAT.afterPulse, dur: LEG_DUR, emerge: 360, easing: 'linear' }),
      F.pulse({ pod: 'podWeb', at: 'toPod' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
