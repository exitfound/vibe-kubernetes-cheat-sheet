import { P, F, defineCard, laneY, makeRidingLabel, BEAT } from './network-kit.js';
import { g, path } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/network-dns-egress-policy.md

// One Pod inside its own egress boundary, drawn as a ring 100 units out from each face with a DOOR
// in the wall facing each destination. RING_PAD 100 is the network-policy run-up: a refused ball
// needs that much travel to read as refused rather than as a ball that never fired.
const WEB_X = 484, WEB_W = 232, WEB_H = 104;         // NET.L-01, the Pod form
// 486 and not 432: the policy band has to stand BELOW the panel, because a mirrored pair of 232
// blocks about the Pod centre reaches x=368 even at a zero gap and the panel measures 396.55 wide
// and 244.54 deep at 1100x800. The band therefore opens at 252, as high as the panel allows, and
// everything under it follows. Raising it further is not free room, it is an overlap.
const FLOW_Y = 486;                                  // the Pod centre, and the axis every lane splits about
const WEB_Y = FLOW_Y - WEB_H / 2;                    // 434
const WEB_R = WEB_X + WEB_W;                         // 716
const WEB_CX = WEB_X + WEB_W / 2;                    // 600, the axis the whole card mirrors about

const BOX_W = 232, BOX_H = 80;                       // NET.L-01, the actor form
const SCHEME_L = 40, SCHEME_R = 1160;                // content edges, mirrored about x=600

// The ring. Its top at 374 stands under the policy band rather than under the panel: what the panel
// pins on this card is the BAND, and the ring follows the Pod.
const RING_PAD = 100, RING_VPAD = 60;
const RING_X = WEB_X - RING_PAD, RING_R = WEB_R + RING_PAD;      // 384 .. 816
const RING_Y = WEB_Y - RING_VPAD, RING_B = WEB_Y + WEB_H + RING_VPAD;   // 374 .. 598

// A door is the hole a rule opens: 24 wide so a ball dying in it reads as stopped, 56 tall so the
// DNS pair passes through one door, and drawn ONLY while it is shut. The wall carries a gap of the
// same height, so a shut door closes the ring to the unit.
const DOOR_W = 24, DOOR_H = 56;
const DOOR_Y = FLOW_Y - DOOR_H / 2;                  // 458
const DOOR_B = DOOR_Y + DOOR_H;                      // 514
const DNS_DOOR_X = RING_X - DOOR_W / 2;              // 372
const DB_DOOR_X = RING_R - DOOR_W / 2;               // 804

// The DNS pair, out and back about FLOW_Y at the house delta, and one lane to the database.
const LANE_DY = 12;
const { out: Q_Y, back: A_Y } = laneY(FLOW_Y, LANE_DY);          // 474 query, 498 answer

const DNS_X = SCHEME_L, DNS_R = DNS_X + BOX_W;       // 40 .. 272
const DNS_Y = FLOW_Y - BOX_H / 2;                    // 446
const DB_X = SCHEME_R - WEB_W;                       // 928: flush right, so the road spans the width

// Every lane carries a WAYPOINT at the centre of the door it meets. The points are collinear, so
// the drawn line does not move by a unit, and L-10 reads the road as terminating on the door
// instead of running past it: a door is a place the traffic arrives at.
const QUERY = [[WEB_X, Q_Y], [RING_X, Q_Y], [DNS_R, Q_Y]];
const ANSWER = [[DNS_R, A_Y], [RING_X, A_Y], [WEB_X, A_Y]];
const TO_DB = [[WEB_R, FLOW_Y], [RING_R, FLOW_Y], [DB_X, FLOW_Y]];
// Where a refused query stops: inside the door that refused it, 100 units out from the Pod.
const QUERY_REFUSED = [[WEB_X, Q_Y], [RING_X, Q_Y]];

// The policy band, above the ring. The two objects are a MIRRORED PAIR about WEB_CX at a 32 gap,
// because they are two policies of equal standing on one Pod and a reader who sees one nearer the
// centre reads it as the nearer cause. 252 is what buys that mirror: below 244.54 the panel takes
// no width, so the left block may stand at 352, which is 44.55 left of what L-03 allows above it.
// 7.46 of clearance, the floor, against the 7.34 network-pod-to-pod-cross-node closed its own
// finding at. The panel reads 246.43 deep on every step but `fix`, so the band cannot rise.
const POL_Y = 252, POL_B = POL_Y + BOX_H;            // 252 .. 332
const POL_GAP = 32;
const EG_POL_X = WEB_CX - POL_GAP / 2 - BOX_W, EG_POL_CX = EG_POL_X + BOX_W / 2;     // 352, 468
const DNS_POL_X = WEB_CX + POL_GAP / 2, DNS_POL_CX = DNS_POL_X + BOX_W / 2;          // 616, 732
// Both selections take the SAME shape, a drop into the corridor and a mirrored run onto the Pod
// top: two policies that select one Pod cannot be drawn with one leg straight and one bent, which
// is what a block standing off centre forces. The landings are WEB_CX -+ SEL_DY.
const SEL_DY = 64;                                   // the mirrored pair the two selections land on
const SEL_DNS_Y = POL_B + 20;                        // 352, the corridor between the band and the ring
const selectPod = (fromCx, dx) => [
  [fromCx, POL_B], [fromCx, SEL_DNS_Y], [WEB_CX + dx, SEL_DNS_Y], [WEB_CX + dx, WEB_Y],
];
const SEL_EGRESS = selectPod(EG_POL_CX, -SEL_DY);
const SEL_DNS = selectPod(DNS_POL_CX, SEL_DY);

// Captions. Each door is named OUTSIDE the ring, in the 112 unit CORRIDOR between the wall and the
// block that door faces, and on exactly the steps that door exists: a caption over a wall nobody
// has raised names nothing. The corridor is what forces TWO lines: a rule written on one runs out
// of it and ends up under the ring, reading as a label of the boundary instead of of the door.
const DNS_CAP_CX = (DNS_R + RING_X) / 2;             // 328, centred in 272..384
const DB_CAP_CX = (RING_R + DB_X) / 2;               // 872, centred in 816..928
// 20 under the block bottoms and 32 under the door, which is the first line clear of the query and
// answer lanes; 22 apart is the house line step for a stacked caption.
const CAP_Y = DNS_Y + BOX_H + 20, CAP_Y2 = CAP_Y + 22;           // 546, 568
// The address the query is really sent to sits directly UNDER the Pods that answer it, on the same
// line as the first caption line: the two never meet, because the caption stands in the corridor
// right of the block and this one is centred on the block itself.
const SVC_TAG_Y = CAP_Y;                             // 546
// The boundary names itself in its own bottom-left corner, inside the ring and under the Pod: both
// selections come down at WEB_CX -+ 64, so the top-left corner reads as belonging to neither.
const RING_CAP = [RING_X + 12, RING_B - 16];

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
  'aria-label': 'What a NetworkPolicy does to name resolution: a Pod that no policy selects reaches the cluster DNS Service and then the address it was given, a policy that selects that Pod for Egress allows only what its rules allow so the lookup dies on the way out while the one address the rules name still connects, an egress rule to the DNS Pods that states port 53 with no protocol opens TCP alone because protocol defaults to TCP, the same rule stating 53 UDP and 53 TCP lets the query out and the reply back in without a rule of its own, and the TCP half is what carries the retry when an answer comes back truncated.',
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
    P.tag({ x: DB_X + WEB_W / 2, y: WEB_Y - 20, text: 'headless Service db.shop' }),
    P.wire({ key: 'ringCap', x: RING_CAP[0], y: RING_CAP[1], anchor: 'start' }),
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
// Every door caption is a PAIR, the rule on line one and what it opens on line two, because the
// corridor it stands in is 112 wide. Each step states both halves of both captions.
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

// An answer leaves 100ms after its query lands, so the two tags are in flight together over the
// same 212 units. The answer tag rides UNDER its lane to keep 56 units between them.
const tagUnder = makeRidingLabel({ role: 'network', dy: 18 });

// The query leaves the Pod that asked, so web pulses first and its ball leaves on the next beat
// (M-18a). CoreDNS is a block and lights on arrival, and the answer lands on a Pod, which pulses.
const lookup = ({ answerTag }) => [
  F.pulse({ pod: 'web' }),
  F.route({ points: QUERY, delay: BEAT.afterPulse, name: 'q', lights: ['coredns'] }),
  F.tag({ text: Q_TAG, points: QUERY, delay: BEAT.afterPulse }),
  F.route({ points: ANSWER, after: 'q', name: 'a' }),
  F.tag({ fn: tagUnder, text: answerTag, points: ANSWER, after: 'q' }),
  F.pulse({ pod: 'web', at: 'a' }),
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
    narration: 'No NetworkPolicy selects any of these Pods, so Pod web is non-isolated for egress and nothing restricts what it opens. The app looks up db.shop, the query leaves on UDP port 53 for the kube-dns Service address in resolv.conf, and the CoreDNS Pods behind that Service answer with the address of Pod db-0.',
    ...stage({}),
    wires: { ringCap: '', ...caps(['', ''], ['', '']) },
    reducedLit: ['webBox', 'dbBox'],
    flow: [
      ...lookup({ answerTag: 'A 10.244.2.7' }),
      F.route({ points: TO_DB, after: 'a', name: 'conn' }),
      F.tag({ text: '10.244.2.7:5432', points: TO_DB, after: 'a' }),
      F.pulse({ pod: 'db', at: 'conn' }),
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
      F.route({ points: QUERY_REFUSED, delay: BEAT.afterPulse, name: 'q' }),
      F.tag({ text: Q_TAG, points: QUERY_REFUSED, delay: BEAT.afterPulse }),
    ],
  },
  {
    id: 'by-ip',
    duration: 3600,
    narration: 'Nothing else changed, which is what makes this hard to read from inside the Pod. A connection to the address of Pod db-0 on 5432 matches the one rule and goes straight out, while the same lookup dies at the boundary. Addresses still work and names do not, so the workload looks half broken rather than blocked.',
    ...stage({ ring: 1, dns: 1, policies: 1 }),
    wires: { ringCap: RING_CAPTION, ...caps(NO_DNS_RULE, DB_RULE) },
    lit: ['polEgress', 'doorDns'],
    reducedLit: ['webBox', 'dbBox'],
    flow: [
      F.pulse({ pod: 'web' }),
      // Both balls leave on the same beat, out of the one Pod that pulsed: the contrast IS the
      // step, and a connection sent 700 later would leave a Pod whose pulse is over (M-18a).
      F.route({ points: QUERY_REFUSED, delay: BEAT.afterPulse, name: 'q' }),
      F.tag({ text: Q_TAG, points: QUERY_REFUSED, delay: BEAT.afterPulse }),
      F.route({ points: TO_DB, delay: BEAT.afterPulse, name: 'conn' }),
      F.tag({ text: '10.244.2.7:5432', points: TO_DB, delay: BEAT.afterPulse }),
      F.pulse({ pod: 'db', at: 'conn' }),
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
      F.route({ points: QUERY_REFUSED, delay: BEAT.afterPulse, name: 'q' }),
      F.tag({ text: Q_TAG, points: QUERY_REFUSED, delay: BEAT.afterPulse }),
    ],
  },
  {
    id: 'fix',
    duration: 4400,
    narration: 'With 53 UDP and 53 TCP both listed the query passes the boundary, the CoreDNS Pods answer, and the reply comes back without a rule of its own, because replies on an allowed connection are allowed implicitly. Policies are additive, so this rule adds to the database rule rather than replacing it.',
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
      // The retry waits 300 past the ordinary gap: the truncated tag holds 160 and fades over 180,
      // and a TCP tag leaving earlier stands across it on the face the answer just reached.
      F.route({ points: QUERY, after: 'a', plus: 300, name: 'q2', lights: ['coredns'] }),
      F.tag({ text: TCP_Q_TAG, points: QUERY, after: 'a', plus: 300 }),
      F.route({ points: ANSWER, after: 'q2', name: 'a2' }),
      F.tag({ fn: tagUnder, text: 'the full answer', points: ANSWER, after: 'q2' }),
      F.pulse({ pod: 'web', at: 'a2' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
