import { P, F, defineCard, laneY, midX, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS/network-pod-to-pod-same-node.md


// POD_MID is the one horizontal axis of the card: both Pods and the bridge are centred on it, and
// the two veth lanes are POD_MID -/+ LANE, a symmetric forward / reply pair. The Node FRAME is NOT
// centred on it any more: it grows downward to hold the forwarding table, so its top is a measured
// literal and its height is derived off what stands lowest inside it.
const POD_MID = 380;          // vertical centre of the frame content, the pods and cni0
const LANE = 12;              // half-gap between the two veth lanes
const { out: TOP_Y, back: BOT_Y } = laneY(POD_MID, LANE);   // 368 forward (A -> B), 392 return (B -> A)

// MIRROR is the axis every block on this card is placed against, and it is the frame centre, so
// the two veth gaps are equal. They have to be: the card's whole claim is that its two halves are
// one journey reversed, and an unequal pair draws two different journeys.
const MIRROR = 600;

// The two Pods take the category default width, 232 (`NET.L-01`): none of that rule's three
// overrules reaches this card. The gap it leaves is 102 against a wire label measured at 75.8
// units, so the label stands 13.1 clear of a block face either side.
const POD_W = 232, POD_H = 130, INNER_H = 56;
const PODA_X = 150, PODB_X = 2 * MIRROR - PODA_X - POD_W;   // 818
const PODA_R = PODA_X + POD_W;                // 382: where the veth leaves Pod A
const POD_Y = POD_MID - POD_H / 2;            // 315
// dy centres the app box in the shell, 37 of shell above it and 37 below.
const POD_INNER = { dx: 20, dy: (POD_H - INNER_H) / 2, w: POD_W - 40, h: INNER_H, label: 'app', sublabel: 'eth0' };

// The bridge and its forwarding table share ONE x extent, 484..716, and no line joins them: the
// shared extent plus the adjacency is what says the table belongs to the bridge. A relation line
// would say it too, and the record rules this card holds none.
const BR_W = 232;                             // the category default (`NET.L-01`), unforced here
const BR_X = MIRROR - BR_W / 2;               // 484
const BR_R = BR_X + BR_W;                     // 716: where the bridge hands the frame to B
const CNI_H = 70;
const CNI_Y = POD_MID - CNI_H / 2;            // 345
const FDB_H = 56, FDB_Y = 470;                // 25 below the Pod floor at 445, 34 above the frame floor

// The Node frame. NODE_Y is a measured literal and not a derivation: the panel is deepest at
// 1100x800 and the frame opens left of x=420, so `L-03` pins this edge and nothing may rise above
// it. The height is then whatever holds the forwarding table with the same 34 it gives the chips.
const NODE_X = 80, NODE_W = 1040;
const NODE_Y = 255;
const NODE_BOT = FDB_Y + FDB_H + 34;          // 560
const NODE_H = NODE_BOT - NODE_Y;             // 305

// Four chips under the frame, spanning it edge to edge: the three 250s and the 230 plus three 20
// gaps total the 1040 frame width exactly. They are UNEQUAL by measurement, each sized to its own
// longest value, so this is a width array and not a computed strip, whose four 245s would move
// three chips of the four. `render/chipfit.test.mjs` is what re-measures them.
const CHIP_Y = NODE_BOT + 18, CHIP_H = 34, CHIP_GAP = 20;
const CHIP_W = [250, 250, 250, 230];
const CHIP_X = CHIP_W.reduce((acc, w, i) => (i ? [...acc, acc[i - 1] + CHIP_W[i - 1] + CHIP_GAP] : [NODE_X]), []);

// The veth pair as four directional legs, two per lane, every endpoint a block edge. The dim dashed
// wire and the bright ball share these arrays exactly, so motion always has an arrow under it.
// No hop carries an explicit `dur`: a leg is 102 units, which `routeDur` would run in 227ms and
// floors at PKT_DUR_MIN 700 instead (`M-13`), so every ball takes the length its geometry gives it
// and the card declares no pacing deviation (`M-12`).
const A_OUT = [[PODA_R, TOP_Y], [BR_X, TOP_Y]];   // A    -> cni0
const B_IN  = [[BR_R, TOP_Y], [PODB_X, TOP_Y]];   // cni0 -> B
const B_OUT = [[PODB_X, BOT_Y], [BR_R, BOT_Y]];   // B    -> cni0 (reply)
const A_IN  = [[BR_X, BOT_Y], [PODA_R, BOT_Y]];   // cni0 -> A    (reply)

// The list order IS the append order, which is the z-order: chips first, then the Node frame and
// its blocks, then the veth wires + labels ABOVE them, and the packet layer on the very top.
export const SCENE = {
  'aria-label': 'Pod-to-Pod traffic on the same Node: both Pods draw from one podCIDR so the destination is on-link, ARP resolves its MAC through the cni0 bridge, which records the port the answer came in on, the data frame is then switched out that one port at layer 2, and no NAT and no encapsulation touch it',
  parts: [
    P.defs(),
    P.chip({ key: 'srcChip', x: CHIP_X[0], y: CHIP_Y, w: CHIP_W[0], h: CHIP_H, name: 'src', value: '10.244.1.5' }),
    P.chip({ key: 'dstChip', x: CHIP_X[1], y: CHIP_Y, w: CHIP_W[1], h: CHIP_H, name: 'dst', value: '10.244.1.6' }),
    P.chip({ key: 'pathChip', x: CHIP_X[2], y: CHIP_Y, w: CHIP_W[2], h: CHIP_H, name: 'datapath', value: 'one subnet' }),
    P.chip({ key: 'natChip', x: CHIP_X[3], y: CHIP_Y, w: CHIP_W[3], h: CHIP_H, name: 'NAT', value: 'none' }),
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1   ·   10.244.1.0/24' }),
    P.box({ key: 'cni0', x: BR_X, y: CNI_Y, w: BR_W, h: CNI_H, label: 'cni0', sublabel: 'L2 bridge' }),
    P.box({ key: 'fdb', x: BR_X, y: FDB_Y, w: BR_W, h: FDB_H, label: 'Forwarding table', sublabel: 'empty' }),
    P.pod({ key: 'podA', innerKey: 'podABox', x: PODA_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod A', sublabel: '10.244.1.5', inner: POD_INNER }),
    P.pod({ key: 'podB', innerKey: 'podBBox', x: PODB_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod B', sublabel: '10.244.1.6', inner: POD_INNER }),
    // All four veth legs get ONE treatment, the route: every one of them carries a ball on at least
    // one step, so each keeps full stroke-opacity, the category cyan and the network arrowhead. The
    // axis that quiets them is WEIGHT, `dim`, which is stroke-width 1.4 and keeps the hue (A-18).
    // None is a relation: recession at 0.45 is for a line no ball ever rides, and none of these is
    // that line. The role is left to the kit binding (S-42) rather than written at the call site.
    P.arrow({ from: A_OUT[0], to: A_OUT[1], dashed: true, dim: true }),
    P.arrow({ from: B_IN[0], to: B_IN[1], dashed: true, dim: true }),
    P.arrow({ from: B_OUT[0], to: B_OUT[1], dashed: true, dim: true }),
    P.arrow({ from: A_IN[0], to: A_IN[1], dashed: true, dim: true }),
    // Both wire labels sit at their gap centre, which the mirror makes 433 and 767. They ink 75.8
    // units in a gap of 102, so each stands 13.1 clear of a block face on either side of it.
    // They name what the LANE is rather than what any step sends over it, so every step
    // including the poster writes both: a lane labelled on three steps of five read as a lane that
    // stops being a veth on the other two.
    P.wire({ key: 'a', x: midX(PODA_R, BR_X), y: TOP_Y - 12 }),
    P.wire({ key: 'b', x: midX(BR_R, PODB_X), y: TOP_Y - 12 }),
    P.packets(),
  ],
  // The inner app boxes are listed BY KEY (NET.S-02): a pod group only has its pulse strokes reset,
  // so a .highlight left inside one by a reduced replay would ride into every later step.
  reset: {
    keys: ['cni0', 'fdb', 'podABox', 'podBBox', 'srcChip', 'dstChip', 'pathChip', 'natChip'],
    pods: ['podA', 'podB'],
  },
};

// The two packet-less steps have ONE beat each, the value they conclude with, and it lands SETTLE
// before the step ends: the reader gets the premise, the conclusion, and a full second holding it.
// `BEAT.afterPulse` is 800 and a Pod pulse rings for 900, so a conclusion cued there is swallowed by
// the pulse and the whole statement is over at 900ms, which is the 68 percent of still time
// `deadair.mjs` measured. Both steps now read 40 and 37 percent, under the catalog median of 42.
const SETTLE = 1000;
const ONLINK_MS = 2500, NONAT_MS = 2700;

const VETH = 'veth · eth0';
const SRC = '10.244.1.5';
const DST = '10.244.1.6';
// An FDB row is a MAC against the port it was learned on. Both halves are EXAMPLES and neither is
// a claim: a valid locally administered unicast address, and a host end name in the shape
// `network-pod-ip-and-veth` draws for Pod A, eight hex digits as upstream `RandomVethName` emits.
// Why `0a:58` plus the IP octets is NOT used is in CONTENT.
const FDB_EMPTY = 'empty';
// A learns FIRST, on the request, which is why the table carries two rows and not one. Only the
// newest row is spelled out, and the title carries the count, so the picture never says an entry
// was dropped. A host end is `vethb3f8a2c7` on `network-pod-ip-and-veth`, the card that owns Pod A.
const FDB_A = '6a:c2:0f:91:3d:e4 · vethb3f8a2c7';
const FDB_LEARNED = 'ae:19:c7:4b:22:d6 · veth7c41d9e8';
const FDB_TITLE = 'Forwarding table';
const FDB_ONE = 'Forwarding table · 1 entry';
const FDB_TWO = 'Forwarding table · 2 entries';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { pathChip: 'one subnet', natChip: 'none', srcChip: SRC, dstChip: DST },
    labels: { fdb: FDB_TITLE },
    sublabels: { fdb: FDB_EMPTY },
    wires: { a: VETH, b: VETH },
  },
  {
    id: 'onlink',
    duration: ONLINK_MS,
    narration: 'Pod A and Pod B draw from the same Node subnet 10.244.1.0/24, so B is on-link. The route A finds for it carries no gateway: the frame will go straight onto the wire to B, with no hop in between. What A still lacks is the MAC behind 10.244.1.6.',
    chips: { pathChip: 'dst on-link', natChip: 'none', srcChip: SRC, dstChip: DST },
    labels: { fdb: FDB_TITLE },
    sublabels: { fdb: FDB_EMPTY },
    wires: { a: VETH, b: VETH },
    // The datapath chip is NOT lit from entry: it is the conclusion the step reaches, so it is
    // rewound and written back once both peers have been named.
    lit: [],
    // Nothing travels on this step: the decision happens inside A before any frame exists. The two
    // Pods pulse TOGETHER because the step says they are peers in one subnet, which is the whole
    // claim. The Node frame carrying the subnet CANNOT be cued: `.scheme-node` has no `.highlight`
    // rule and naming it in `lit` renders nothing at all, silently (scheme/CLAUDE.md).
    reducedLit: ['podABox', 'podBBox'],
    rewind: { chips: { pathChip: 'one subnet' } },
    flow: [
      F.pulse({ pod: 'podA' }),
      F.pulse({ pod: 'podB' }),
      F.set({ chips: { pathChip: 'dst on-link' }, delay: ONLINK_MS - SETTLE }),
      F.light({ targets: ['pathChip'], delay: ONLINK_MS - SETTLE }),
    ],
  },
  {
    id: 'arp',
    duration: 5600,
    narration: 'A broadcasts an ARP request out eth0 asking who holds 10.244.1.6. The veth peer hands it to cni0, the Node Linux bridge, which learns the port A sits on and floods the request out every port but that one. B answers with a unicast reply carrying its MAC, and as that reply crosses cni0 the bridge learns the port B sits on too.',
    chips: { pathChip: 'ARP who-has .6', natChip: 'none', srcChip: SRC, dstChip: DST },
    labels: { fdb: FDB_TWO },
    sublabels: { fdb: FDB_LEARNED },
    wires: { a: VETH, b: VETH },
    // NOTHING is lit from entry. Both cues belong to an arrival, and `flowLights` derives them for
    // the reduced path off the two `F.light` entries below, so naming either here would only point
    // at a value the step has rewound and has not written back yet.
    lit: [],
    // The animated path says both Pods handled the exchange by PULSING them, which no cue names.
    reducedLit: ['podABox', 'podBBox'],
    // Everything above is the settled end state. The animated path rewinds what this step CHANGES
    // and plays each back on the arrival that causes it: the chip and the first table row when the
    // request is inside the bridge, the second row when the reply crosses it.
    rewind: { chips: { pathChip: 'dst on-link' }, labels: { fdb: FDB_TITLE }, sublabels: { fdb: FDB_EMPTY } },
    // A broadcasts first (blink, then the request departs at BEAT.afterPulse). The request floods
    // A -> bridge -> B on the top lane, the reply comes back B -> bridge -> A on the bottom. The
    // table is written TWICE, once per arrival that teaches the bridge something: the request
    // carries A source MAC and the reply carries B.
    flow: [
      F.pulse({ pod: 'podA' }),
      F.segment({ from: A_OUT[0], to: A_OUT[1], delay: BEAT.afterPulse, name: 'req1', lights: ['cni0'] }),
      F.set({ chips: { pathChip: 'ARP who-has .6' }, labels: { fdb: FDB_ONE }, sublabels: { fdb: FDB_A }, at: 'req1' }),
      F.light({ targets: ['pathChip', 'fdb'], at: 'req1' }),
      F.segment({ from: B_IN[0], to: B_IN[1], after: 'req1', name: 'req2' }),
      F.segment({ from: B_OUT[0], to: B_OUT[1], after: 'req2', name: 'rep1' }),
      F.set({ labels: { fdb: FDB_TWO }, sublabels: { fdb: FDB_LEARNED }, at: 'rep1' }),
      F.light({ targets: ['fdb'], at: 'rep1' }),
      F.segment({ from: A_IN[0], to: A_IN[1], after: 'rep1', name: 'rep2' }),
      F.pulse({ pod: 'podB', at: 'req2' }),
      F.pulse({ pod: 'podA', at: 'rep2' }),
    ],
  },
  {
    id: 'forward',
    duration: 3600,
    narration: 'With the MAC for B known and its port in the forwarding table, A sends the data frame as a unicast. It crosses the veth onto cni0, which now switches it out that one port instead of flooding. This is plain layer 2 forwarding inside the Node, so the packet never touches the physical NIC.',
    chips: { pathChip: 'L2 bridge', natChip: 'none', srcChip: SRC, dstChip: DST },
    labels: { fdb: FDB_TWO },
    sublabels: { fdb: FDB_LEARNED },
    wires: { a: VETH, b: VETH },
    // The table entry was written LAST step and is the reason this one works, so it stands lit from
    // entry. The datapath chip is not: this step rewinds it and lights it on the bridge arrival.
    lit: ['fdb'],
    // Both Pods are said to send and receive by PULSING them, and no cue names either inner box.
    reducedLit: ['podABox', 'podBBox'],
    // The datapath chip settles only once the frame is inside the bridge, which is the moment the
    // switching decision is taken.
    rewind: { chips: { pathChip: 'ARP who-has .6' } },
    // A pulses FIRST and fully, the data frame departs only after that blink lands, then rides the
    // forward lane A -> bridge -> B in two hops. The bridge lights on arrival and never pulses.
    flow: [
      F.pulse({ pod: 'podA' }),
      F.segment({ from: A_OUT[0], to: A_OUT[1], delay: BEAT.afterPulse, name: 'hop1', lights: ['cni0'] }),
      F.set({ chips: { pathChip: 'L2 bridge' }, at: 'hop1' }),
      F.light({ targets: ['pathChip'], at: 'hop1' }),
      F.segment({ from: B_IN[0], to: B_IN[1], after: 'hop1', name: 'hop2' }),
      F.pulse({ pod: 'podB', at: 'hop2' }),
    ],
  },
  {
    id: 'no-nat',
    duration: NONAT_MS,
    narration: 'B receives the packet with the source IP of A intact. Traffic addressed to a Pod IP is never rewritten: no SNAT, no DNAT, no overlay encapsulation, just one bridge hop between two veth ports. Every Pod IP is routable cluster-wide, which is the flat-network promise.',
    chips: { pathChip: 'L2 bridge', natChip: 'none · src preserved', srcChip: SRC, dstChip: DST },
    labels: { fdb: FDB_TWO },
    sublabels: { fdb: FDB_LEARNED },
    wires: { a: VETH, b: VETH },
    // src and dst hold the value they have held all card, so they are lit from entry: the claim is
    // that they never moved. The NAT chip is the one value this step WRITES, so it is rewound and
    // lands on the pulse that delivers the packet, not before it.
    lit: ['srcChip', 'dstChip'],
    reducedLit: ['podBBox'],
    rewind: { chips: { natChip: 'none' } },
    // Info chips get the strict static highlight only, no flash.
    flow: [
      F.pulse({ pod: 'podB' }),
      F.set({ chips: { natChip: 'none · src preserved' }, delay: NONAT_MS - SETTLE }),
      F.light({ targets: ['natChip'], delay: NONAT_MS - SETTLE }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
