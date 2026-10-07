import { LANE_DY, P, F, defineCard, laneY, makeRidingLabel, BEAT } from './network-kit.js';
import { g, path } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/network-dns-egress-policy.md

// One Pod inside its own egress boundary, a ring with a DOOR in the wall facing each destination.
// RING_PAD is the network-policy run-up: a refused ball needs that travel to read as refused.
const WEB_X = 484, WEB_W = 232, WEB_H = 104;         // NET.L-01, the Pod form
// The policy band has to stand BELOW the panel and everything under it follows, so FLOW_Y cannot rise.
const FLOW_Y = 486;                                  // the Pod centre, and the axis every lane splits about
const WEB_Y = FLOW_Y - WEB_H / 2;
const WEB_R = WEB_X + WEB_W;
const WEB_CX = WEB_X + WEB_W / 2;                    // the axis the whole card mirrors about

const BOX_W = 232, BOX_H = 80;                       // NET.L-01, the actor form
const SCHEME_L = 40, SCHEME_R = 1160;                // content edges, mirrored about x=600

// The ring follows the Pod: what the panel pins on this card is the policy BAND.
const RING_PAD = 100, RING_VPAD = 60;
const RING_X = WEB_X - RING_PAD, RING_R = WEB_R + RING_PAD;
const RING_Y = WEB_Y - RING_VPAD, RING_B = WEB_Y + WEB_H + RING_VPAD;

// A door is the hole a rule opens: 24 wide so a ball dying in it reads as stopped, 56 tall so the
// DNS pair passes through one door, and drawn ONLY while it is shut. The wall carries a gap of the
// same height, so a shut door closes the ring to the unit.
const DOOR_W = 24, DOOR_H = 56;
const DOOR_Y = FLOW_Y - DOOR_H / 2;
const DOOR_B = DOOR_Y + DOOR_H;
const DNS_DOOR_X = RING_X - DOOR_W / 2;
const DB_DOOR_X = RING_R - DOOR_W / 2;

// The DNS pair, out and back about FLOW_Y at the house delta, and one lane to the database.
const { out: Q_Y, back: A_Y } = laneY(FLOW_Y, LANE_DY);

const DNS_X = SCHEME_L, DNS_R = DNS_X + BOX_W;
const DNS_Y = FLOW_Y - BOX_H / 2;
const DB_X = SCHEME_R - WEB_W;                       // flush right, so the road spans the width

// Every lane carries a WAYPOINT at the centre of the door it meets. The points are collinear, so
// the drawn line does not move by a unit, and L-10 reads the road as terminating on the door
// instead of running past it: a door is a place the traffic arrives at.
const QUERY = [[WEB_X, Q_Y], [RING_X, Q_Y], [DNS_R, Q_Y]];
const ANSWER = [[DNS_R, A_Y], [RING_X, A_Y], [WEB_X, A_Y]];
const TO_DB = [[WEB_R, FLOW_Y], [RING_R, FLOW_Y], [DB_X, FLOW_Y]];
// Where a refused query stops: inside the door that refused it.
const QUERY_REFUSED = [[WEB_X, Q_Y], [RING_X, Q_Y]];

// The policy band, above the ring: two policies of equal standing on one Pod, so a MIRRORED PAIR
// about WEB_CX, since a block nearer the centre reads as the nearer cause. The panel pins POL_Y.
const POL_Y = 252, POL_B = POL_Y + BOX_H;
const POL_GAP = 32;
const EG_POL_X = WEB_CX - POL_GAP / 2 - BOX_W, EG_POL_CX = EG_POL_X + BOX_W / 2;
const DNS_POL_X = WEB_CX + POL_GAP / 2, DNS_POL_CX = DNS_POL_X + BOX_W / 2;
// Both selections take the SAME shape, a drop into the corridor and a mirrored run onto the Pod top,
// landing at WEB_CX -+ SEL_DY.
const SEL_DY = 64;                                   // the mirrored pair the two selections land on
const SEL_DNS_Y = POL_B + 20;                        // the corridor between the band and the ring
const selectPod = (fromCx, dx) => [
  [fromCx, POL_B], [fromCx, SEL_DNS_Y], [WEB_CX + dx, SEL_DNS_Y], [WEB_CX + dx, WEB_Y],
];
const SEL_EGRESS = selectPod(EG_POL_CX, -SEL_DY);
const SEL_DNS = selectPod(DNS_POL_CX, SEL_DY);

// Each door is named OUTSIDE the ring, in the corridor between the wall and the block it faces, on
// exactly the steps that door exists. The corridor width forces TWO lines.
const DNS_CAP_CX = (DNS_R + RING_X) / 2;             // centred in the DNS corridor
const DB_CAP_CX = (RING_R + DB_X) / 2;               // centred in the database corridor
// The first line clear of the query and answer lanes, at the house line step for a stacked caption.
const CAP_Y = DNS_Y + BOX_H + 20, CAP_Y2 = CAP_Y + 22;
// The address the query is really sent to sits directly UNDER the Pods that answer it, on the line
// of the first caption line.
const SVC_TAG_Y = CAP_Y;
// The boundary names itself centred on the ring, inside its bottom wall and under the Pod: both
// selections come down onto the Pod top, so the bottom is the one face no road reaches.
const RING_CAP = [WEB_CX, RING_B - 16];

const RING_INK = 'rgba(79, 229, 255, 0.6)';          // the cyan literal C-21 keeps for this category

// The wall no part kind draws: four sides with a gap the height of a door in each side face.
const boundaryRing = () => {
  const d = [
    `M${RING_X} ${DOOR_Y} V${RING_Y} H${RING_R} V${DOOR_Y}`,
    `M${RING_R} ${DOOR_B} V${RING_B} H${RING_X} V${DOOR_B}`,
  ].join(' ');
  const wall = path({ class: 'ep-wall', d, fill: 'none' });
  wall.style.stroke = RING_INK;
  wall.style.strokeWidth = '2';
  return g({ 'data-role': 'network' }, [wall]);
};

const door = (key, x) => P.box({ key, x, y: DOOR_Y, w: DOOR_W, h: DOOR_H, rx: 3, opacity: 0 });

const POD_INNER = { dx: 20, dy: 34, w: WEB_W - 40, h: 44 };
const workload = (key, x, label, sublabel, inner) => P.pod({
  key, innerKey: `${key}Box`, x, y: WEB_Y, w: WEB_W, h: WEB_H, label, sublabel,
  inner: { ...POD_INNER, ...inner },
});

// The list order IS the append order, which is the z-order: blocks and Pods, the boundary over
// them, the lanes ON TOP of the boundary so each road runs visibly through its door, then the
// captions and the packet layer.
export const SCENE = {
  'aria-label': 'What a NetworkPolicy does to name resolution: a Pod that no policy selects reaches the cluster DNS Service and then the address it was given, a policy that selects that Pod for Egress allows only what its rules allow so the lookup dies on the way out while the one Pod the rules select still connects, an egress rule to the DNS Pods that states port 53 with no protocol opens TCP alone because protocol defaults to TCP, the same rule stating 53/UDP and 53/TCP lets the query out and the reply back in without a rule of its own, and the TCP half is what carries the retry when an answer comes back truncated.',
  parts: [
    P.defs(),
    P.box({ key: 'coredns', x: DNS_X, y: DNS_Y, w: BOX_W, h: BOX_H, label: 'CoreDNS Pods', sublabel: 'k8s-app=kube-dns' }),
    P.box({ key: 'polEgress', x: EG_POL_X, y: POL_Y, w: BOX_W, h: BOX_H, label: 'NetworkPolicy web-egress', sublabel: 'policyTypes Egress, to app=db', opacity: 0 }),
    P.box({ key: 'polDns', x: DNS_POL_X, y: POL_Y, w: BOX_W, h: BOX_H, label: 'NetworkPolicy allow-dns', sublabel: 'to kube-dns, port 53', opacity: 0 }),
    workload('web', WEB_X, 'Pod web', 'app=web, namespace shop', { label: 'app', sublabel: 'resolves db.shop' }),
    workload('db', DB_X, 'Pod db-0', 'app=db, 10.244.2.7', { label: 'DB', sublabel: 'port 5432' }),
    // The boundary fades in as ONE unit, because a Pod acquires the whole of it the moment a policy
    // selects it for Egress. A door inside it is shut or gone, which is the state of one rule.
    P.group({
      key: 'boundary',
      opacity: 0,
      parts: [
        P.raw({ make: () => boundaryRing() }),
        door('doorDns', DNS_DOOR_X),
        door('doorDb', DB_DOOR_X),
      ],
    }),
    P.relation({ key: 'selEgress', points: SEL_EGRESS, dash: '5 5', opacity: 0 }),
    P.relation({ key: 'selDns', points: SEL_DNS, dash: '5 5', opacity: 0 }),
    P.lane({ points: QUERY, dashed: true, dim: true }),
    P.lane({ points: ANSWER, dashed: true, dim: true }),
    P.lane({ points: TO_DB, dashed: true, dim: true }),
    P.tag({ x: DNS_X + BOX_W / 2, y: DNS_Y - 20, text: 'kubernetes.io/metadata.name=kube-system' }),
    P.tag({ x: DNS_X + BOX_W / 2, y: SVC_TAG_Y, text: 'behind Service kube-dns 10.96.0.10' }),
    P.tag({ x: DB_X + WEB_W / 2, y: WEB_Y - 20, text: 'headless Service db in shop' }),
    P.wire({ key: 'ringCap', x: RING_CAP[0], y: RING_CAP[1] }),
    P.wire({ key: 'dnsCap', x: DNS_CAP_CX, y: CAP_Y }),
    P.wire({ key: 'dnsCap2', x: DNS_CAP_CX, y: CAP_Y2 }),
    P.wire({ key: 'dbCap', x: DB_CAP_CX, y: CAP_Y }),
    P.wire({ key: 'dbCap2', x: DB_CAP_CX, y: CAP_Y2 }),
    P.packets(),
  ],
  reset: {
    keys: ['coredns', 'polEgress', 'polDns', 'doorDns', 'doorDb', 'webBox', 'dbBox'],
    pods: ['web', 'db'],
  },
};

// A-16: one factory owns the whole opacity field. A door exists only inside a boundary, so each one
// is the MIN of the ring and its own state, and a shut door is the one that is DRAWN.
const stage = ({ ring = 0, dns = 0, db = 0, policies = 0 }) => ({
  opacity: {
    boundary: ring,
    doorDns: Math.min(ring, dns),
    doorDb: Math.min(ring, db),
    polEgress: policies >= 1 ? 1 : 0, selEgress: policies >= 1 ? 1 : 0,
    polDns: policies >= 2 ? 1 : 0, selDns: policies >= 2 ? 1 : 0,
  },
});

const RING_CAPTION = 'egress boundary of Pod web';
// Every door caption is a PAIR, the rule on line one and what it opens on line two.
const DB_RULE = ['to app=db', '5432/TCP'];
const NO_DNS_RULE = ['no rule for', 'port 53'];
const TCP_ONLY = ['port 53', 'TCP only'];
const BOTH = ['port 53', 'UDP and TCP'];
// One call writes both lines of both captions, so no step can state half a caption.
const caps = (dns, db) => ({ dnsCap: dns[0], dnsCap2: dns[1], dbCap: db[0], dbCap2: db[1] });
const DNS_RULE_53 = 'to kube-dns, port 53';
const DNS_RULE_BOTH = 'to kube-dns, 53/UDP and 53/TCP';
const Q_TAG = 'UDP 53, db.shop';
const TCP_Q_TAG = 'TCP 53, db.shop';

// The answer tag rides UNDER its lane, apart from the query tag still in flight.
const tagUnder = makeRidingLabel({ role: 'network', dy: 18 });

// The query leaves the Pod that asked, so web pulses first and its ball leaves on the next beat
// (M-18a). CoreDNS is a block and lights on arrival, and the answer lands on a Pod, which pulses.
const lookup = ({ answerTag }) => [
  F.pulse({ pod: 'web' }),
  F.route({ points: QUERY, delay: BEAT.afterPulse, name: 'q', lights: ['coredns'], tag: { text: Q_TAG } }),
  F.route({ points: ANSWER, after: 'q', name: 'a', tag: { fn: tagUnder, text: answerTag }, pulse: 'web' }),
];

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    ...stage({}),
    wires: { ringCap: '', ...caps(['', ''], ['', '']) },
  },
  {
    id: 'open',
    duration: 5200,
    narration: 'No NetworkPolicy selects any of these Pods, so Pod web is non-isolated for egress and no egress rule limits it. The app looks up db.shop, the query leaves on UDP port 53 for the kube-dns Service address in resolv.conf, and the CoreDNS Pods behind that Service answer with the address of Pod db-0.',
    ...stage({}),
    wires: { ringCap: '', ...caps(['', ''], ['', '']) },
    reducedLit: ['webBox', 'dbBox'],
    flow: [
      ...lookup({ answerTag: 'A 10.244.2.7' }),
      F.route({ points: TO_DB, after: 'a', name: 'conn', tag: { text: '10.244.2.7:5432' }, pulse: 'db' }),
    ],
  },
  {
    id: 'isolate',
    duration: 3400,
    narration: 'One NetworkPolicy selects app=web for Egress, and its only rule allows app=db on port 5432. Selecting the Pod is what raises the boundary: from here the only connections out of web are the ones an egress rule allows. The lookup is not one of them, so the query dies on the way out and the name never resolves.',
    ...stage({ ring: 1, dns: 1, policies: 1 }),
    wires: { ringCap: RING_CAPTION, ...caps(NO_DNS_RULE, DB_RULE) },
    // The door is lit from entry rather than cued on arrival: it exists from the moment the policy
    // selects the Pod, and the ball demonstrates what it does rather than revealing that it is there.
    lit: ['polEgress', 'doorDns'],
    reducedLit: ['webBox'],
    flow: [
      F.pulse({ pod: 'web' }),
      F.route({ points: QUERY_REFUSED, delay: BEAT.afterPulse, name: 'q', tag: { text: Q_TAG } }),
    ],
  },
  {
    id: 'by-ip',
    duration: 3600,
    narration: 'Nothing else changed, which is what makes this hard to read from inside the Pod. A connection to the address of Pod db-0 on 5432 matches the one rule and goes straight out, while the same lookup dies at the boundary. The address still works and the name does not, so the workload looks half broken rather than blocked.',
    ...stage({ ring: 1, dns: 1, policies: 1 }),
    wires: { ringCap: RING_CAPTION, ...caps(NO_DNS_RULE, DB_RULE) },
    lit: ['polEgress', 'doorDns'],
    reducedLit: ['webBox', 'dbBox'],
    flow: [
      F.pulse({ pod: 'web' }),
      // Both balls leave on the same beat out of the one Pod that pulsed: the contrast IS the step (M-18a).
      F.route({ points: QUERY_REFUSED, delay: BEAT.afterPulse, name: 'q', tag: { text: Q_TAG } }),
      F.route({ points: TO_DB, delay: BEAT.afterPulse, name: 'conn', tag: { text: '10.244.2.7:5432' }, pulse: 'db' }),
    ],
  },
  {
    id: 'tcp-default',
    duration: 3400,
    narration: 'A second NetworkPolicy allows egress to the cluster DNS Service. Its one entry names the namespace by the kubernetes.io/metadata.name label and the Pods behind that Service by k8s-app=kube-dns, on port 53 with no protocol. Protocol defaults to TCP, so the door opens for TCP alone and the UDP query is still refused.',
    ...stage({ ring: 1, dns: 1, policies: 2 }),
    wires: { ringCap: RING_CAPTION, ...caps(TCP_ONLY, DB_RULE) },
    sublabels: { polDns: DNS_RULE_53 },
    lit: ['polDns', 'doorDns'],
    reducedLit: ['webBox'],
    flow: [
      F.pulse({ pod: 'web' }),
      F.route({ points: QUERY_REFUSED, delay: BEAT.afterPulse, name: 'q', tag: { text: Q_TAG } }),
    ],
  },
  {
    id: 'fix',
    duration: 4400,
    narration: 'With 53/UDP and 53/TCP both listed the query passes the boundary, the CoreDNS Pods answer, and the reply comes back without a rule of its own, because replies on an allowed connection are allowed implicitly. Policies are additive, so this rule adds to the database rule rather than replacing it.',
    ...stage({ ring: 1, policies: 2 }),
    wires: { ringCap: RING_CAPTION, ...caps(BOTH, DB_RULE) },
    sublabels: { polDns: DNS_RULE_BOTH },
    lit: ['polDns'],
    reducedLit: ['webBox'],
    flow: lookup({ answerTag: 'A 10.244.2.7' }),
  },
  {
    id: 'truncated',
    duration: 6500,
    narration: 'The TCP half of that rule is not decoration. An answer too large for a UDP reply comes back with the truncation flag set, and a resolver that retries over TCP asks the same question again on port 53 TCP. That retry is a fresh connection out of Pod web, so without the TCP port in the rule the large answer never arrives.',
    ...stage({ ring: 1, policies: 2 }),
    wires: { ringCap: RING_CAPTION, ...caps(BOTH, DB_RULE) },
    sublabels: { polDns: DNS_RULE_BOTH },
    lit: ['polDns'],
    reducedLit: ['webBox'],
    flow: [
      ...lookup({ answerTag: 'truncated' }),
      // The retry waits past the ordinary gap so its tag never stands across the truncated one.
      F.route({ points: QUERY, after: 'a', plus: 300, name: 'q2', lights: ['coredns'], tag: { text: TCP_Q_TAG } }),
      F.route({ points: ANSWER, after: 'q2', tag: { fn: tagUnder, text: 'the full answer' }, pulse: 'web' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
