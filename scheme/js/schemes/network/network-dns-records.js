import { P, F, defineCard, laneY, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-dns-records


// Panel right <= 397, bottom <= 330, so the query row and the FQDN band both hang below it and only
// the record ladder, far right of 397, sits beside the panel.
const CONTENT_L = 80, CONTENT_R = 1120;

const FLOW_Y = 400;                       // client + CoreDNS centre line
const CLIENT_X = CONTENT_L, CLIENT_W = 210, CLIENT_H = 130;
const CLIENT_EDGE = CLIENT_X + CLIENT_W;  // 290: client Pod shell right edge
const CD_W = 230, CD_H = 96;
const CD_LEFT = 420, CD_RIGHT = CD_LEFT + CD_W;   // CoreDNS box left/right edges

// The record ladder owns the free top-right band, so the four answers climb into it.
const PANEL_X = 710, PANEL_W = 410;       // record ladder: 710..1120
const ROWS_Y = 56, ROW_H = 54, ROW_GAP = 8;
const ROWS = [0, 1, 2, 3].map(i => ROWS_Y + i * (ROW_H + ROW_GAP) + ROW_H / 2);   // 83 145 207 269
const FAN_X = 680;                        // vertical bus the four answer wires branch on
// The client leg is a PAIR, question out above the flow line and answer home below it: every record
// step says the CLIENT gets the record, and the ladder is a display, not an arrival.
const LANE_DY = 12;
const { out: Q_OUT_Y, back: Q_BACK_Y } = laneY(FLOW_Y, LANE_DY);   // 388 out, 412 back
const QUERY = [[CLIENT_EDGE, Q_OUT_Y], [CD_LEFT, Q_OUT_Y]];
const REPLY = [[CD_LEFT, Q_BACK_Y], [CLIENT_EDGE, Q_BACK_Y]];
const ANS = ROWS.map(cy => [[CD_RIGHT, FLOW_Y], [FAN_X, FLOW_Y], [FAN_X, cy], [PANEL_X, cy]]);

// The four name segments keep their relative widths (156:116:76:100, each sized by its own text) and
// stretch to span CD_LEFT..CONTENT_R, which puts the content bbox on 600 without a frame.
const SEG_Y = 490, SEG_H = 64;
const SEGS = [
  { key: 'seg1', x: CD_LEFT, w: 237 },
  { key: 'seg2', x: 663, w: 177 },
  { key: 'seg3', x: 846, w: 116 },
  { key: 'seg4', x: 968, w: 152 },
];

const CHIP_Y = 578, CHIP_H = 34;
const Q_CHIP_W = 660;                     // the question chip carries the longest SRV name
const ANS_CHIP_W = 250, ANS_CHIP_X = CONTENT_R - ANS_CHIP_W;   // 870
// The third segment is called `subdomain`, not `kind`: in Kubernetes `kind` already means the object
// kind (Pod, Service), whereas svc and pod here are the two DNS subdomains under the cluster domain.
const NAME_SVC      = [['web', 'service'], ['default', 'namespace'], ['svc', 'subdomain'], ['cluster.local', 'cluster domain']];
const NAME_SRV      = [['_http._tcp.web', 'port and protocol'], ['default', 'namespace'], ['svc', 'subdomain'], ['cluster.local', 'cluster domain']];
const NAME_HEADLESS = [['web', 'headless service'], ['default', 'namespace'], ['svc', 'subdomain'], ['cluster.local', 'cluster domain']];
const NAME_POD      = [['10-244-2-7', 'pod address'], ['default', 'namespace'], ['pod', 'subdomain'], ['cluster.local', 'cluster domain']];

// All six wires carry a ball, so all six take the category arrowhead. A lane that drops the role
// renders neutral-headed beside the identical client lanes, so all six state it.
const ANS_WIRE = { dashed: true, dim: true };

// The list order IS the append order, which is the z-order: the band, CoreDNS, the client and the
// ladder, then the wires ABOVE them, then the chips, then the packet layer on top.
export const SCENE = {
  'aria-label': 'Kubernetes DNS records: a Service name is a fully qualified name made of Service, namespace, svc and the cluster domain, and CoreDNS answers it with an A record to the ClusterIP, an SRV record for ports, multiple A records for a headless Service, or a per-Pod record',
  parts: [
    P.defs(),
    // FQDN band: the four segments of the name being asked. Built in the service form, rewritten per step.
    ...SEGS.map((spec, i) => P.box({
      key: spec.key, x: spec.x, y: SEG_Y, w: spec.w, h: SEG_H,
      label: NAME_SVC[i][0], sublabel: NAME_SVC[i][1],
    })),
    P.box({ key: 'coredns', x: CD_LEFT, y: FLOW_Y - CD_H / 2, w: CD_W, h: CD_H, label: 'CoreDNS', sublabel: 'kubernetes plugin' }),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: CLIENT_X, y: FLOW_Y - CLIENT_H / 2, w: CLIENT_W, h: CLIENT_H,
      label: 'Client Pod', sublabel: '10.244.1.5',
      inner: { dx: 20, dy: 36, w: CLIENT_W - 40, h: 50, label: 'Resolver', sublabel: 'getaddrinfo' },
    }),
    // Keyed `chain`, which is the name the `chain:` field writes through. The rows are named by
    // path in every dump, so the container key is free to be the conventional one.
    P.chain({
      key: 'chain', x: PANEL_X, y: ROWS_Y, w: PANEL_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        'A: web.default.svc -> 10.96.0.20',
        'SRV: _http._tcp.web -> :80',
        'Headless A: -> .2.7 .3.4 .1.9',
        'Pod A: 10-244-2-7.default.pod',
      ],
    }),
    // Dim dashed wires: the straight query lane client -> CoreDNS, then ONE wire per record row so
    // every answer ball has a line under it. Each wire is drawn from the same array the ball rides.
    P.arrow({ from: QUERY[0], to: QUERY[1], dashed: true, dim: true }),
    P.arrow({ from: REPLY[0], to: REPLY[1], dashed: true, dim: true }),
    ...ANS.map(points => P.lane({ points, ...ANS_WIRE })),
    P.chip({ key: 'qChip', x: CONTENT_L, y: CHIP_Y, w: Q_CHIP_W, h: CHIP_H, name: 'question', value: '-' }),
    P.chip({ key: 'ansChip', x: ANS_CHIP_X, y: CHIP_Y, w: ANS_CHIP_W, h: CHIP_H, name: 'answers', value: '-' }),
    P.packets(),
  ],
  reset: {
    keys: ['coredns', 'seg1', 'seg2', 'seg3', 'seg4', 'qChip', 'ansChip', 'clientBox'],
    pods: ['client'],
  },
};

// The name being asked, as FIELDS: the four segments are one fact, so one helper writes their text
// and their highlight together and no step can rewrite three of the four.
const asking = (parts, light = true) => {
  const labels = {}, sublabels = {};
  parts.forEach(([label, sublabel], i) => { labels[SEGS[i].key] = label; sublabels[SEGS[i].key] = sublabel; });
  return light ? { labels, sublabels, lit: SEGS.map(s => s.key) } : { labels, sublabels };
};

// One record lookup: query out, the record climbs into its ladder row, the answer goes home. The row
// and the answer count both land on the ANSWER arrival, through a timer hung on CoreDNS.
const lookup = (rowIdx, ans) => [
  F.pulse({ pod: 'client' }),
  F.segment({ from: QUERY[0], to: QUERY[1], delay: BEAT.afterPulse, name: 'q', lights: ['coredns'] }),
  F.route({ points: ANS[rowIdx], after: 'q', name: 'ans' }),
  F.set({ chain: rowIdx, chips: { ansChip: ans }, on: 'coredns', at: 'ans' }),
  // The record lights in the ladder, and THEN the same answer goes home: the client is what gets the
  // record, and the ladder is a display rather than an arrival.
  F.segment({ from: REPLY[0], to: REPLY[1], after: 'ans', name: 'reply' }),
  F.pulse({ pod: 'client', at: 'reply' }),
];

// A record step ends with its row lit and the count answered, which is what the static path shows at
// once. The animated path winds both back to what the step before left, so the answer earns them.
const record = (rowIdx, ans, was) =>
  ({ chain: rowIdx, rewind: { chain: -1, chips: { ansChip: was } }, flow: lookup(rowIdx, ans) });

// The answer counts, named because each is said twice: once as the state a step ends in, once as the
// state the step before it left behind.
const NO_ANS = '-', ONE_REC = '1 record', THREE_REC = '3 records';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { qChip: '-', ansChip: NO_ANS },
    ...asking(NAME_SVC, false),
    chain: -1,
  },
  {
    id: 'fqdn',
    duration: 2500,
    narration: 'The full name is web.default.svc.cluster.local: the Service, its namespace, the literal svc, then the cluster domain. A Pod resolv.conf carries search domains and ndots:5, so a short name like web is expanded to this fully qualified form before it leaves the Pod. Every record below is a variation on these four segments.',
    chips: { qChip: 'web expands to web.default.svc.cluster.local', ansChip: NO_ANS },
    ...asking(NAME_SVC),
    lit: [...SEGS.map(s => s.key), 'qChip'],
    chain: -1,
    // The expansion happens inside the Pod resolver, so the Pod is what moves and no lightBoxAt
    // names the resolver box: the static path has to say it instead.
    reducedLit: ['clientBox'],
    // No packet yet: the band lights but does not blink, since a blinking block would read as
    // traffic that is not there.
    flow: [F.pulse({ pod: 'client' })],
  },
  {
    id: 'a-record',
    // Motion: the query out, the record up into the ladder, then the answer home to the
    // client and its arrival pulse, ending at ~4100.
    duration: 4400,
    narration: 'Ask for the name itself and you get an A record, or AAAA on IPv6, pointing at the Service ClusterIP, 10.96.0.20. This is the common case: a name in, the stable virtual IP out, which kube-proxy then load-balances to a Pod. Note that this is the web Service address, not 10.96.0.10, which is the kube-dns ClusterIP the query was sent to.',
    chips: { qChip: 'web.default.svc.cluster.local  IN A', ansChip: ONE_REC },
    ...asking(NAME_SVC),
    lit: [...SEGS.map(s => s.key), 'qChip', 'ansChip'],
    ...record(0, ONE_REC, NO_ANS),
  },
  {
    id: 'srv-record',
    // Motion: the query out, the record up into the ladder, then the answer home to the
    // client and its arrival pulse, ending at ~4100.
    duration: 4400,
    narration: 'A named port also publishes an SRV record. The name grows a prefix, _http._tcp, naming the port and the protocol, and the answer carries the port number and the target host. It lets a client discover which port a Service exposes without that port being hard-coded anywhere.',
    chips: { qChip: '_http._tcp.web.default.svc.cluster.local  IN SRV', ansChip: ONE_REC },
    ...asking(NAME_SRV),
    lit: [...SEGS.map(s => s.key), 'qChip', 'ansChip'],
    ...record(1, ONE_REC, ONE_REC),
  },
  {
    id: 'headless-record',
    // Motion: the query out, the record up into the ladder, then the answer home to the
    // client and its arrival pulse, ending at ~4100.
    duration: 4400,
    narration: 'If the Service is headless, the name does not change at all: the client asks exactly what it asked for the A record. What changes is the answer, one A record per ready Pod instead of a single virtual IP, here three of them, and the client chooses an endpoint itself.',
    chips: { qChip: 'web.default.svc.cluster.local  IN A', ansChip: THREE_REC },
    ...asking(NAME_HEADLESS),
    lit: [...SEGS.map(s => s.key), 'qChip', 'ansChip'],
    ...record(2, THREE_REC, ONE_REC),
  },
  {
    id: 'pod-record',
    // Motion: the query out, the record up into the ladder, then the answer home to the
    // client and its arrival pulse, ending at ~4100.
    duration: 4400,
    narration: 'Finally a Pod can be addressed directly, and here the name changes twice: the Pod IP written with dashes takes the place of the Service, and the subdomain flips from svc to pod. CoreDNS only serves this when the kubernetes plugin has pods enabled, which kubeadm sets to insecure by default, and in that mode it reads the address straight back out of the name without checking that such a Pod exists. The stable way to reach one specific replica is a StatefulSet Pod hostname under a headless Service.',
    chips: { qChip: '10-244-2-7.default.pod.cluster.local  IN A', ansChip: ONE_REC },
    ...asking(NAME_POD),
    lit: [...SEGS.map(s => s.key), 'qChip', 'ansChip'],
    ...record(3, ONE_REC, THREE_REC),
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
