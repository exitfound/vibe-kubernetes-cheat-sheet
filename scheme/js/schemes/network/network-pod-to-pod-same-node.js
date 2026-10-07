import { P, F, defineCard, laneY, midX, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS/network-pod-to-pod-same-node.md

// Both Pods and the bridge are centred on POD_MID. The frame opens left of x=420, so NODE_Y must
// clear the narration panel (`L-03`), and its height derives from what stands lowest inside it.
const NODE_Y = 279;
const POD_H = 130;
// The Pods stand the 34 label band under the frame top.
const POD_MID = NODE_Y + 34 + POD_H / 2;
const LANE = 12;              // half-gap between the two veth lanes
const { out: TOP_Y, back: BOT_Y } = laneY(POD_MID, LANE);   // forward A -> B, return B -> A

// Every block mirrors about the frame centre so the two veth gaps are equal: the halves are one
// journey reversed, and an unequal pair would draw two different journeys.
const MIRROR = 600;

// Category default width (`NET.L-01`). The gap it leaves holds the veth wire label.
const POD_W = 232, INNER_H = 56;
const PODA_X = 150, PODB_X = 2 * MIRROR - PODA_X - POD_W;
const PODA_R = PODA_X + POD_W;                // where the veth leaves Pod A
const POD_Y = POD_MID - POD_H / 2;
// dy centres the app box in the shell.
const POD_INNER = { dx: 20, dy: (POD_H - INNER_H) / 2, w: POD_W - 40, h: INNER_H, label: 'app', sublabel: 'eth0' };

// The bridge and its forwarding table share one x extent and no line joins them: extent plus
// adjacency is what says the table belongs to the bridge.
const BR_W = 232;                             // `NET.L-01`
const BR_X = MIRROR - BR_W / 2;
const BR_R = BR_X + BR_W;                     // where the bridge hands the frame to B
const CNI_H = 70;
const CNI_Y = POD_MID - CNI_H / 2;
const FDB_H = 56, FDB_Y = POD_Y + POD_H + 25;

// The frame holds the forwarding table with the 12 of floor every frame keeps (`L-23`).
const NODE_X = 80, NODE_W = 1040;
const NODE_BOT = FDB_Y + FDB_H + 12;
const NODE_H = NODE_BOT - NODE_Y;

// Four chips spanning the frame edge to edge. Each is sized to its own longest value, so this is a
// width array, not a computed strip. The widths plus gaps must sum to NODE_W.
const CHIP_Y = NODE_BOT + 18, CHIP_H = 34, CHIP_GAP = 20;
const CHIP_W = [250, 250, 250, 230];
const CHIP_X = CHIP_W.reduce((acc, w, i) => (i ? [...acc, acc[i - 1] + CHIP_W[i - 1] + CHIP_GAP] : [NODE_X]), []);

// The veth pair as four directional legs, every endpoint a block edge. Wire and ball share these
// arrays, so motion always has an arrow under it.
const A_OUT = [[PODA_R, TOP_Y], [BR_X, TOP_Y]];   // A    -> cni0
const B_IN  = [[BR_R, TOP_Y], [PODB_X, TOP_Y]];   // cni0 -> B
const B_OUT = [[PODB_X, BOT_Y], [BR_R, BOT_Y]];   // B    -> cni0 (reply)
const A_IN  = [[BR_X, BOT_Y], [PODA_R, BOT_Y]];   // cni0 -> A    (reply)

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
    // Every leg carries a ball on some step, so each is a route quieted by weight, never a
    // relation (A-18, NET.A-04).
    P.arrow({ from: A_OUT[0], to: A_OUT[1], dashed: true, dim: true }),
    P.arrow({ from: B_IN[0], to: B_IN[1], dashed: true, dim: true }),
    P.arrow({ from: B_OUT[0], to: B_OUT[1], dashed: true, dim: true }),
    P.arrow({ from: A_IN[0], to: A_IN[1], dashed: true, dim: true }),
    // The labels name what the lane is, not what a step sends, so every step writes both.
    P.wire({ key: 'a', x: midX(PODA_R, BR_X), y: TOP_Y - 12 }),
    P.wire({ key: 'b', x: midX(BR_R, PODB_X), y: TOP_Y - 12 }),
    P.packets(),
  ],
  // The inner app boxes are listed by key (NET.S-02).
  reset: {
    keys: ['cni0', 'fdb', 'podABox', 'podBBox', 'srcChip', 'dstChip', 'pathChip', 'natChip'],
    pods: ['podA', 'podB'],
  },
};

// The two packet-less steps land their one conclusion SETTLE before the step ends. Cued at
// `BEAT.afterPulse` it would be swallowed by the Pod pulse.
const SETTLE = 1000;
const ONLINK_MS = 2500, NONAT_MS = 2700;

const VETH = 'veth · eth0';
const SRC = '10.244.1.5';
const DST = '10.244.1.6';
// An FDB row is a MAC against the port it was learned on, both example values.
const FDB_EMPTY = 'empty';
// Only the newest row is spelled out and the title carries the count, so the picture never says
// an entry was dropped. Pod A's host end matches `network-pod-ip-and-veth`.
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
    // The datapath chip is the conclusion, so it is rewound and written back at the end.
    lit: [],
    // The two Pods pulse together because the claim is that they are peers in one subnet.
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
    // Both cues belong to an arrival, and `flowLights` derives them for the reduced path.
    lit: [],
    // Both Pods pulse in the animated path, which no cue names.
    reducedLit: ['podABox', 'podBBox'],
    rewind: { chips: { pathChip: 'dst on-link' }, labels: { fdb: FDB_TITLE }, sublabels: { fdb: FDB_EMPTY } },
    // The table is written twice, once per arrival that teaches the bridge a source MAC.
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
    // The table entry written last step is why this one works, so it stands lit from entry.
    lit: ['fdb'],
    // Both Pods pulse in the animated path, which no cue names.
    reducedLit: ['podABox', 'podBBox'],
    // The datapath chip settles once the frame is inside the bridge, where the switching happens.
    rewind: { chips: { pathChip: 'ARP who-has .6' } },
    // The bridge lights on arrival and never pulses (NET.S-01).
    flow: [
      F.pulse({ pod: 'podA' }),
      F.segment({ from: A_OUT[0], to: A_OUT[1], delay: BEAT.afterPulse, name: 'hop1', lights: ['cni0'] }),
      F.set({ chips: { pathChip: 'L2 bridge' }, at: 'hop1' }),
      F.light({ targets: ['pathChip'], at: 'hop1' }),
      F.segment({ from: B_IN[0], to: B_IN[1], after: 'hop1', pulse: 'podB' }),
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
    // src and dst are lit from entry: the claim is that they never moved. The NAT chip is the one
    // value this step writes.
    lit: ['srcChip', 'dstChip'],
    reducedLit: ['podBBox'],
    rewind: { chips: { natChip: 'none' } },
    flow: [
      F.pulse({ pod: 'podB' }),
      F.set({ chips: { natChip: 'none · src preserved' }, delay: NONAT_MS - SETTLE }),
      F.light({ targets: ['natChip'], delay: NONAT_MS - SETTLE }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
