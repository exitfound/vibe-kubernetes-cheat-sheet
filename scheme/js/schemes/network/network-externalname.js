import { P, F, defineCard, laneY, shade, makeRidingLabel, BEAT, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS/network-externalname.md

// Three columns: C1 holds kube-proxy under the panel, C2 the DNS, client and dataplane spine, C3 the
// two Service objects and the two servers outside the cluster. Every actor is 232x80 (NET.L-01).
const COL_W = 232, BOX_H = 80;
const C1_X = 60, C2_X = 484, C3_X = 908;
const CX = C2_X + COL_W / 2;                        // 600
const C2_R = C2_X + COL_W;                          // 716

// The DNS row. CoreDNS reads Service api, so the two share one row joined by a relation.
const DNS_Y = 20, DNS_BOTTOM = DNS_Y + BOX_H;       // 100
const DNS_CY = DNS_Y + BOX_H / 2;                   // 60

// The one client, and the ExternalName host level with it on an out and back pair.
const CLIENT_Y = 180, CLIENT_H = 110;
const CLIENT_CY = CLIENT_Y + CLIENT_H / 2;          // 235
const CLIENT_BOTTOM = CLIENT_Y + CLIENT_H;          // 290
const { out: OUT_Y, back: BACK_Y } = laneY(CLIENT_CY, 12);   // 223 out, 247 back
const HOST_Y = CLIENT_CY - BOX_H / 2;               // 195
const Q_X = CX - 16, A_X = CX + 16;                 // query and answer, an L-12 pair about CX

// The TLS pair stands under the host it describes.
const CHIP_H = 34, CHIP_GAP = 10;
const SNI_Y = HOST_Y + BOX_H + 20;                  // 295
const CERT_Y = SNI_Y + CHIP_H + CHIP_GAP;           // 339

// The dataplane row: kube-proxy writes it, the client drops into it, the database leaves it.
const DP_Y = 400, DP_CY = DP_Y + BOX_H / 2;         // 440

// The hand-written slice: three header lines over one endpoint row, centred on CX. 320 wide because
// `kubernetes.io/service-name: pg` is a sublabel line a 232 frame leaves too little room around.
const SLICE_W = 320, SLICE_X = CX - SLICE_W / 2;    // 440..760
const SLICE_Y = 500, SLICE_H = 116;                 // bottom 616 in a 640 viewBox
const SLICE_CY = SLICE_Y + SLICE_H / 2;             // 558
const EP_PAD = 14, EP_Y = SLICE_Y + 68;

const HOP_Q = [[Q_X, CLIENT_Y], [Q_X, DNS_BOTTOM]];
const HOP_A = [[A_X, DNS_BOTTOM], [A_X, CLIENT_Y]];
const HOP_OUT = [[C2_R, OUT_Y], [C3_X, OUT_Y]];
const HOP_BACK = [[C3_X, BACK_Y], [C2_R, BACK_Y]];
const HOP_DROP = [[CX, CLIENT_BOTTOM], [CX, DP_Y]];
const HOP_EXIT = [[C2_R, DP_CY], [C3_X, DP_CY]];
const KP_CX = C1_X + COL_W / 2;                     // 176
const HOP_WATCH = [[SLICE_X, SLICE_CY], [KP_CX, SLICE_CY], [KP_CX, DP_Y + BOX_H]];

// Every tag is on from its ball leaving. A vertical tag leads its ball on the outer side of its lane
// and has faded out before its ink reaches the far face (hold negative, measured per ride).
const tag = makeRidingLabel({ role: 'network', outMs: 170, hold: 0 });
const Q_TAG = { fn: makeRidingLabel({ role: 'network', outMs: 170, hold: -405 }), dx: -54, dy: -12 };
const A_TAG = { fn: makeRidingLabel({ role: 'network', outMs: 170, hold: -375 }), dx: 86, dy: 16 };
const DROP_TAG = { fn: makeRidingLabel({ role: 'network', outMs: 170, hold: -330 }), dx: -65, dy: 18 };
// A tag travels the whole 192 gap with its ball, so a 115 to 151 unit tag in the face band inks over a
// face: each rides out of it, leading over the host top, in the gap under the host, above the dataplane.
const OUT_TAG = { dx: 64, dy: -36 };
const BACK_TAG = { dx: 80, dy: 41 };
const EXIT_TAG = { dy: -48 };
// Leads its ball below the lane, so on the climb it stands left of the trunk and under kube-proxy.
const WATCH_TAG = { dx: -70, dy: 16 };

export const SCENE = {
  'aria-label': 'ExternalName and Services without selectors: Service api of type ExternalName has no ClusterIP, the client looks up api.default.svc and after two search list misses api.default.svc.cluster.local matches, CoreDNS answers with a CNAME to api.partner.example and the address of that name, and the client connects there itself with no Service rule matching, while its TLS SNI and HTTP Host still say api.default.svc and the certificate for api.partner.example does not match. Service pg has no selector and ClusterIP 10.96.0.40, a hand-written EndpointSlice pg-ext labelled kubernetes.io/service-name: pg lists 203.0.113.5 on port 5432, kube-proxy watches it and writes Service rules, and the Node dataplane DNATs 10.96.0.40:5432 to that server outside the cluster',
  parts: [
    P.defs(),
    P.box({ key: 'dns', x: C2_X, y: DNS_Y, w: COL_W, h: BOX_H, label: 'CoreDNS', sublabel: 'cluster DNS' }),
    P.box({ key: 'svcApi', x: C3_X, y: DNS_Y, w: COL_W, h: BOX_H, label: 'Service api', sublabel: 'ExternalName api.partner.example' }),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: C2_X, y: CLIENT_Y, w: COL_W, h: CLIENT_H,
      label: 'Client Pod', sublabel: '10.244.1.5', inner: { dx: 20, dy: 34, w: COL_W - 40, h: 50, label: 'app', sublabel: 'eth0' },
    }),
    P.box({ key: 'host', x: C3_X, y: HOST_Y, w: COL_W, h: BOX_H, label: 'api.partner.example', sublabel: 'outside the cluster' }),
    P.box({ key: 'kproxy', x: C1_X, y: DP_Y, w: COL_W, h: BOX_H, label: 'kube-proxy', sublabel: 'watches slices · writes rules' }),
    P.box({ key: 'dp', x: C2_X, y: DP_Y, w: COL_W, h: BOX_H, label: 'Node dataplane', sublabel: 'Service rules' }),
    P.box({ key: 'server', x: C3_X, y: DP_Y, w: COL_W, h: BOX_H, label: '203.0.113.5', sublabel: 'database · outside the cluster' }),
    P.box({ key: 'slice', x: SLICE_X, y: SLICE_Y, w: SLICE_W, h: SLICE_H }),
    P.tag({ key: 'sliceTitle', x: CX, y: SLICE_Y + 22, text: 'EndpointSlice pg-ext', cls: 'scheme-box-label' }),
    P.tag({ key: 'sliceLabel', x: CX, y: SLICE_Y + 40, text: 'kubernetes.io/service-name: pg', cls: 'scheme-box-sublabel' }),
    P.tag({ key: 'slicePort', x: CX, y: SLICE_Y + 56, text: 'port 5432 · written by hand', cls: 'scheme-box-sublabel' }),
    P.box({ key: 'svcPg', x: C3_X, y: SLICE_CY - BOX_H / 2, w: COL_W, h: BOX_H, label: 'Service pg', sublabel: 'no selector · 10.96.0.40' }),
    // Standing relationships, nothing rides them: CoreDNS reads Service api, kube-proxy writes the
    // rules the dataplane runs, and the label ties the slice to Service pg.
    P.relation({ key: 'relDns', points: [[C2_R, DNS_CY], [C3_X, DNS_CY]] }),
    P.relation({ key: 'relKp', points: [[C1_X + COL_W, DP_CY], [C2_X, DP_CY]], dash: '5 5' }),
    P.relation({ key: 'relSlice', points: [[SLICE_X + SLICE_W, SLICE_CY], [C3_X, SLICE_CY]] }),
    P.arrow({ key: 'laneQ', from: HOP_Q[0], to: HOP_Q[1], dashed: true, dim: true }),
    P.arrow({ key: 'laneA', from: HOP_A[0], to: HOP_A[1], dashed: true, dim: true }),
    P.arrow({ key: 'laneOut', from: HOP_OUT[0], to: HOP_OUT[1], dashed: true, dim: true }),
    P.arrow({ key: 'laneBack', from: HOP_BACK[0], to: HOP_BACK[1], dashed: true, dim: true }),
    P.arrow({ key: 'laneDrop', from: HOP_DROP[0], to: HOP_DROP[1], dashed: true, dim: true }),
    P.arrow({ key: 'laneExit', from: HOP_EXIT[0], to: HOP_EXIT[1], dashed: true, dim: true }),
    P.lane({ key: 'laneWatch', points: HOP_WATCH, dashed: true, dim: true }),
    P.chip({ key: 'sniChip', x: C3_X, y: SNI_Y, w: COL_W, h: CHIP_H, name: 'SNI · Host', value: 'none' }),
    P.chip({ key: 'certChip', x: C3_X, y: CERT_Y, w: COL_W, h: CHIP_H, name: 'cert', value: 'none' }),
    P.chip({ key: 'epChip', x: SLICE_X + EP_PAD, y: EP_Y, w: SLICE_W - EP_PAD * 2, h: CHIP_H, name: 'endpoint', value: '203.0.113.5' }),
    P.packets(),
  ],
  reset: {
    keys: ['dns', 'svcApi', 'host', 'kproxy', 'dp', 'server', 'slice', 'svcPg', 'sniChip', 'certChip', 'epChip', 'clientBox'],
    pods: ['client'],
  },
};

// Which half is in play, as ONE opacity field from step entry: the other half recedes, and every
// headed lane stays at full on every step.
const DNS_HALF = ['dns', 'svcApi', 'host', 'sniChip', 'certChip', 'relDns'];
const PROXY_HALF = ['kproxy', 'dp', 'server', 'slice', 'sliceTitle', 'sliceLabel', 'slicePort', 'epChip', 'svcPg',
  'relKp', 'relSlice'];
const LANES = ['laneQ', 'laneA', 'laneOut', 'laneBack', 'laneDrop', 'laneExit', 'laneWatch'];
const stage = (out = []) => ({ opacity: { ...shade([...DNS_HALF, ...PROXY_HALF, ...LANES], 1), ...shade(out, OPACITY.notready) } });

const SNI = 'api.default.svc';
const CERT = 'api.partner.example';
const RULES = '10.96.0.40 -> 203.0.113.5';
const NO_TLS = { sniChip: 'none', certChip: 'none', epChip: '203.0.113.5' };
const TLS_SENT = { sniChip: SNI, certChip: 'none', epChip: '203.0.113.5' };
const TLS_SEEN = { sniChip: SNI, certChip: CERT, epChip: '203.0.113.5' };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: NO_TLS,
    sublabels: { dp: 'Service rules' },
    ...stage(),
  },
  {
    id: 'lookup',
    duration: 4000,
    narration: 'Service api is type ExternalName: no selector, no ClusterIP, only the name api.partner.example. The client looks up api.default.svc. Under ndots:5 the resolver walks the search list, and after two misses api.default.svc.cluster.local matches: CoreDNS reads that Service and answers with a CNAME to api.partner.example plus the address of that name. No endpoints and no Service rules exist for Service api.',
    chips: NO_TLS,
    sublabels: { dp: 'Service rules' },
    ...stage(PROXY_HALF),
    lit: ['svcApi'],
    reducedLit: ['clientBox'],
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: HOP_Q[0], to: HOP_Q[1], delay: BEAT.afterPulse, name: 'q', lights: ['dns'] }),
      F.tag({ fn: tag, text: SNI, points: HOP_Q, delay: BEAT.afterPulse, easing: 'linear', ...Q_TAG }),
      F.segment({ from: HOP_A[0], to: HOP_A[1], after: 'q', name: 'ans' }),
      F.tag({ fn: tag, text: `CNAME ${CERT}`, points: HOP_A, after: 'q', easing: 'linear', ...A_TAG }),
      F.pulse({ pod: 'client', at: 'ans' }),
    ],
  },
  {
    id: 'connect',
    duration: 3400,
    narration: 'With that address the client opens HTTPS to api.partner.example by itself. The connection is ordinary egress, and no Service rule matches it. The TLS hello names the server the client asked for, so SNI still says api.default.svc.',
    chips: TLS_SENT,
    sublabels: { dp: 'Service rules' },
    ...stage(PROXY_HALF),
    reducedLit: ['clientBox'],
    rewind: { chips: { sniChip: 'none' } },
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: HOP_OUT[0], to: HOP_OUT[1], delay: BEAT.afterPulse, name: 'hello', lights: ['host', 'sniChip'] }),
      F.tag({ fn: tag, text: `SNI ${SNI}`, points: HOP_OUT, delay: BEAT.afterPulse, easing: 'linear', ...OUT_TAG }),
      F.set({ at: 'hello', chips: { sniChip: SNI } }),
    ],
  },
  {
    id: 'mismatch',
    duration: 3600,
    narration: 'The partner server answers with its certificate, issued for api.partner.example. That is not api.default.svc, so the client rejects the handshake. Plain HTTP has the same problem: its Host header also says api.default.svc, a name that server does not recognize.',
    chips: TLS_SEEN,
    sublabels: { dp: 'Service rules' },
    ...stage(PROXY_HALF),
    lit: ['host'],
    reducedLit: ['clientBox'],
    rewind: { chips: { certChip: 'none' } },
    flow: [
      F.segment({ from: HOP_BACK[0], to: HOP_BACK[1], delay: BEAT.lead, name: 'cert', lights: ['sniChip', 'certChip'] }),
      F.tag({ fn: tag, text: `cert ${CERT}`, points: HOP_BACK, delay: BEAT.lead, easing: 'linear', ...BACK_TAG }),
      F.set({ at: 'cert', chips: { certChip: CERT } }),
      F.pulse({ pod: 'client', at: 'cert' }),
    ],
  },
  {
    id: 'slice',
    duration: 3600,
    narration: 'Service pg has no selector, and the EndpointSlice controller writes no slice for it. So EndpointSlice pg-ext is written by hand: the label kubernetes.io/service-name: pg ties it to pg, and it lists 203.0.113.5 on port 5432. kube-proxy watches it and writes Service rules for 10.96.0.40.',
    chips: TLS_SEEN,
    sublabels: { dp: RULES },
    ...stage(DNS_HALF),
    lit: ['slice', 'svcPg', 'epChip'],
    rewind: { sublabels: { dp: 'Service rules' } },
    flow: [
      F.route({ points: HOP_WATCH, delay: BEAT.lead, name: 'watch', lights: ['kproxy'] }),
      F.tag({ fn: tag, text: 'pg-ext · 203.0.113.5', points: HOP_WATCH, delay: BEAT.lead, ...WATCH_TAG }),
      // The write has no ball: the dataplane lights one beat after kube-proxy receives the slice.
      F.set({ after: 'watch', sublabels: { dp: RULES } }),
      F.light({ targets: ['dp'], after: 'watch' }),
    ],
  },
  {
    id: 'vip',
    duration: 3600,
    narration: 'The client dials 10.96.0.40:5432. The Service rules in the Node dataplane DNAT it to 203.0.113.5:5432, and the connection leaves the cluster for the database, exactly as a Pod-backed Service would send it to a Pod. The client only ever sees the Service address.',
    chips: TLS_SEEN,
    sublabels: { dp: RULES },
    ...stage(DNS_HALF),
    reducedLit: ['clientBox'],
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: HOP_DROP[0], to: HOP_DROP[1], delay: BEAT.afterPulse, name: 'drop', lights: ['dp'] }),
      F.tag({ fn: tag, text: 'dst 10.96.0.40:5432', points: HOP_DROP, delay: BEAT.afterPulse, easing: 'linear', ...DROP_TAG }),
      F.segment({ from: HOP_EXIT[0], to: HOP_EXIT[1], after: 'drop', name: 'exit', lights: ['server'] }),
      F.tag({ fn: tag, text: 'dst 203.0.113.5:5432', points: HOP_EXIT, after: 'drop', easing: 'linear', ...EXIT_TAG }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
