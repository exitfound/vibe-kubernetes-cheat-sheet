import { P, F, defineCard } from './network-kit.js';

// Design notes for this card: ./CARDS/network-service-cidr.md

// Everything that is a FACT ABOUT THE RANGE stands in one right-hand column of RANGE_W wide parts,
// so the two ServiceCIDR objects, the address ladder and the chip column share one left edge.
const SCHEME_L = 130, SCHEME_R = 1140;     // content edges
const RANGE_X = 700;                       // left edge of the range column
const RANGE_W = SCHEME_R - RANGE_X;

// Two ServiceCIDR objects side by side, the second born hidden, their width solved from the column.
const CIDR_Y = 44, CIDR_H = 72, CIDR_GAP = 16;
const CIDR_W = (RANGE_W - CIDR_GAP) / 2;
const CIDR2_X = RANGE_X + CIDR_W + CIDR_GAP;
const CIDR_CY = CIDR_Y + CIDR_H / 2;       // both feeds leave a SIDE face, so this is the one y

// The address ladder: the Service range read top to bottom in address order, low band first.
const LADDER_Y = 152, ROW_H = 34, ROW_GAP = 16, ROWS = 4;
const rowCY = (i) => LADDER_Y + i * (ROW_H + ROW_GAP) + ROW_H / 2;
const DYN_ROW = ROWS - 1;                  // the dynamic band, the row every allocation lands in

// The chip column carries only what the ladder cannot: a chip restating a row would read as one more
// identical bar. It stands on the Service band rather than under the ladder for the same reason.
const CHIP_H = 34, CHIP_PITCH = 44, CHIP_Y0 = 510;
const CHIP_Y = [0, 1].map(i => CHIP_Y0 + i * CHIP_PITCH);

// The allocation side is a HUB with one job per face, which keeps every lane straight: the API
// server pinned to the dynamic row, the Service under it, the store off the free left face (NET.L-01).
const ACTOR_W = 232, ACTOR_H = 80;         // NET.L-01 width, catalog block height
const API_CX = 420;                        // the L-03 line: the range lane drops on it clear of the panel
const API_X = API_CX - ACTOR_W / 2;
const API_W = ACTOR_W, API_H = ACTOR_H;
const API_CY = rowCY(DYN_ROW);             // pinned to the dynamic row, which straightens the pick
const API_Y = API_CY - API_H / 2;
const API_RIGHT = API_X + API_W;
const API_BOTTOM = API_Y + API_H;

// The Service shares the API server's centre line, so the two lanes between them are verticals.
const SVC_CX = API_CX, SVC_W = ACTOR_W, SVC_H = ACTOR_H;
const SVC_X = SVC_CX - SVC_W / 2;
const SVC_Y = CHIP_Y0;                     // the Service stands on the chip band

// The store at the catalog size, the cylinder overhanging the Service band by 10 a side.
const ETCD_W = 140, ETCD_H = 100;
const ETCD_CX = SCHEME_L + ETCD_W / 2;
const ETCD_X = SCHEME_L, ETCD_Y = SVC_Y - 10;

// CREATE_SPINE is the store's own centre line, so the write drops straight onto its cap.
const CREATE_SPINE = ETCD_CX;
const EXT_RAIL_X = 1180;        // the add-on leaves SIDEWAYS and comes back in outside the column

// The API server bottom and the Service top each carry a MIRRORED PAIR (L-12): the claim left of
// centre, the answer right of it, so the two verticals run parallel down one corridor.
const FACE_DX = 12;
const LANE_ASK = API_CX - FACE_DX, LANE_SET = API_CX + FACE_DX;

const L_RANGE  = [[RANGE_X, CIDR_CY], [API_CX, CIDR_CY], [API_CX, API_Y]];
const L_PICK   = [[API_RIGHT, API_CY], [RANGE_X, API_CY]];
const L_CLAIM  = [[LANE_ASK, SVC_Y], [LANE_ASK, API_BOTTOM]];
const L_SET    = [[LANE_SET, API_BOTTOM], [LANE_SET, SVC_Y]];
const L_CREATE = [[API_X, API_CY], [CREATE_SPINE, API_CY], [CREATE_SPINE, ETCD_Y]];
// The add-on joins the ladder at the DYNAMIC row: at the ladder centre the arrowhead would read as
// pointing at kube-dns.
const L_EXTEND = [[SCHEME_R, CIDR_CY], [EXT_RAIL_X, CIDR_CY], [EXT_RAIL_X, rowCY(DYN_ROW)], [SCHEME_R, rowCY(DYN_ROW)]];

// `dashed` says an address is being carved out of a range rather than a packet on a network. `dim`
// is a stroke weight only, the role stays cyan.
const WIRE = { dashed: true, dim: true };

// A part that comes into existence mid-card: born hidden, revealed by its own 350ms fade.
const REVEAL = { keyframes: [{ opacity: 0 }, { opacity: 1 }], options: { duration: 350, fill: 'forwards', easing: 'ease-out' } };

// The list order IS the append order, which is the z-order: the ladder and the blocks, then the
// wires above them so the dim lines read, then the chips, then the packet layer on top.
export const SCENE = {
  'aria-label': 'Service CIDR and ClusterIP allocation: one ServiceCIDR object declares the Service range 10.96.0.0/16, which the allocator inside the API server reads as a low static band holding the well-known addresses 10.96.0.1 and 10.96.0.10 and a high dynamic band it draws from first, and an address is allocated by writing an IPAddress object of that name into ETCD before the clusterIP field is set, with a second ServiceCIDR able to add a range with nothing restarted',
  parts: [
    P.defs(),
    // The range itself, read top to bottom in address order. The two well-known addresses are rows
    // of the ladder rather than boxes, because they are entries in a range and not actors.
    P.chain({
      key: 'chain', x: RANGE_X, y: LADDER_Y, w: RANGE_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        'static band · 10.96.0.1 to 10.96.1.0, 256 of the /16',
        '10.96.0.1 · Service kubernetes',
        '10.96.0.10 · Service kube-dns',
        'dynamic band · 10.96.1.1 to 10.96.255.254',
      ],
    }),
    P.box({ key: 'cidr', x: RANGE_X, y: CIDR_Y, w: CIDR_W, h: CIDR_H, label: 'ServiceCIDR', sublabel: '10.96.0.0/16' }),
    P.box({ key: 'cidr2', x: CIDR2_X, y: CIDR_Y, w: CIDR_W, h: CIDR_H, label: 'ServiceCIDR add-on', sublabel: '10.97.0.0/16', opacity: 0 }),
    // The allocator is not a controller of its own, it runs inside the API server, and the SUBLABEL
    // is what says so. The label is the catalog word `API` and not the binary name (`T-13`).
    P.box({ key: 'api', x: API_X, y: API_Y, w: API_W, h: API_H, label: 'API', sublabel: 'ClusterIP allocator' }),
    P.box({ key: 'svcWeb', x: SVC_X, y: SVC_Y, w: SVC_W, h: SVC_H, label: 'Service web', sublabel: 'clusterIP pending' }),
    P.cylinder({ key: 'etcd', x: ETCD_X, y: ETCD_Y, w: ETCD_W, h: ETCD_H, label: 'ETCD', labelY: 60 }),
    P.lane({ points: L_RANGE, ...WIRE }),
    P.lane({ points: L_CLAIM, ...WIRE }),
    P.lane({ points: L_PICK, ...WIRE }),
    P.lane({ points: L_CREATE, ...WIRE }),
    P.lane({ points: L_SET, ...WIRE }),
    P.lane({ key: 'aExtend', points: L_EXTEND, ...WIRE, opacity: 0 }),
    P.chip({ key: 'rangeChip', x: RANGE_X, y: CHIP_Y[0], w: RANGE_W, h: CHIP_H, name: 'ranges in play', value: ' ' }),
    P.chip({ key: 'ipaddrChip', x: RANGE_X, y: CHIP_Y[1], w: RANGE_W, h: CHIP_H, name: 'IPAddress', value: ' ', opacity: 0 }),
    P.packets(),
  ],
  reset: {
    keys: ['cidr', 'cidr2', 'api', 'svcWeb', 'etcd', 'rangeChip', 'ipaddrChip'],
  },
};

const PENDING = 'clusterIP pending';
const WEB_IP = 'clusterIP 10.96.137.42';
// The address and the object recording it are ONE fact, so the two strings are written from one
// pair of constants and each lands on the hop the narration gives it.
const IPADDR = '10.96.137.42 · default/web';
const ONE_RANGE = '10.96.0.0/16', TWO_RANGES = '10.96.0.0/16 and 10.97.0.0/16';
// The add-on CIDR, its wire and the IPAddress object are revealed only on later steps.
const LATER_HIDDEN = { cidr2: 0, aExtend: 0, ipaddrChip: 0 };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { rangeChip: ONE_RANGE, ipaddrChip: ' ' },
    sublabels: { svcWeb: PENDING },
    opacity: LATER_HIDDEN,
    chain: -1,
  },
  {
    id: 'range',
    duration: 3000,
    narration: 'One ServiceCIDR object declares the whole Service range, here 10.96.0.0/16, and the allocator reads it as two bands. Automatic allocation takes the high dynamic band first and the low static band only once that runs out. The low band is for addresses picked by hand, so the two in it are unlikely to be taken rather than reserved.',
    chips: { rangeChip: ONE_RANGE, ipaddrChip: ' ' },
    sublabels: { svcWeb: PENDING },
    opacity: LATER_HIDDEN,
    chain: [0, DYN_ROW],
    lit: ['cidr'],
    // The split is what the allocator DOES on arrival, not a state the step opens with, and the
    // order the narration gives it is drawn: dynamic on the arrival, static as the fallback after.
    rewind: { chain: -1 },
    flow: [
      F.route({ points: L_RANGE, fadeIn: true, name: 'read', lights: ['api'] }),
      F.set({ chain: [DYN_ROW], at: 'read' }),
      F.set({ chain: [0, DYN_ROW], at: 'read', plus: 700 }),
    ],
  },
  {
    id: 'claim',
    duration: 2600,
    narration: 'A new Service web is created with its clusterIP field left empty, so the API server hands the request to the ClusterIP allocator. It looks in the high dynamic band, which is tried first for every automatic address, and takes one that is free, here 10.96.137.42.',
    chips: { rangeChip: ONE_RANGE, ipaddrChip: ' ' },
    sublabels: { svcWeb: PENDING },
    opacity: LATER_HIDDEN,
    chain: [DYN_ROW],
    lit: ['svcWeb'],
    // The row the address comes out of lights when the second ball lands in it, so the static path
    // has to be wound back to no row at all first.
    rewind: { chain: -1 },
    flow: [
      F.route({ points: L_CLAIM, fadeIn: true, name: 'ask', lights: ['api'] }),
      F.route({ points: L_PICK, after: 'ask', name: 'pick' }),
      F.set({ chain: [DYN_ROW], at: 'pick' }),
    ],
  },
  {
    id: 'write',
    duration: 2800,
    narration: 'The allocation is the write. The allocator creates an IPAddress object named 10.96.137.42 that points back at the Service, and only once that object exists is the clusterIP field set. Two Services cannot end up on one address, because two objects cannot share one name.',
    chips: { rangeChip: ONE_RANGE, ipaddrChip: IPADDR },
    sublabels: { svcWeb: WEB_IP },
    opacity: { cidr2: 0, aExtend: 0, ipaddrChip: 1 },
    chain: [DYN_ROW],
    // The store is NOT in `lit`: the ball reaches it later and `lights` cues it there.
    lit: ['api', 'ipaddrChip'],
    // Both halves of the allocation end the step present, which is what the static path shows. The
    // animated path winds both back so each lands on the hop the narration gives it: the object on
    // the write into the store, the field on the answer coming back to the Service.
    rewind: { opacity: { ipaddrChip: 0 }, chips: { ipaddrChip: ' ' }, sublabels: { svcWeb: PENDING } },
    flow: [
      F.route({ points: L_CREATE, fadeIn: true, name: 'store', lights: ['etcd'] }),
      F.anim({ target: 'ipaddrChip', ...REVEAL, at: 'store' }),
      F.set({ chips: { ipaddrChip: IPADDR }, at: 'store' }),
      F.route({ points: L_SET, after: 'store', name: 'set', lights: ['svcWeb'] }),
      F.set({ sublabels: { svcWeb: WEB_IP }, at: 'set' }),
    ],
  },
  {
    id: 'extend',
    duration: 2800,
    narration: 'When the range fills up, the old fix was to widen the API server service-cluster-ip-range flag and restart it, a disruptive operation. Now you add a second ServiceCIDR object, here 10.97.0.0/16, the allocator has a second range to draw from, and the Service IP space grows with nothing restarted.',
    chips: { rangeChip: TWO_RANGES, ipaddrChip: IPADDR },
    sublabels: { svcWeb: WEB_IP },
    opacity: { cidr2: 1, aExtend: 1, ipaddrChip: 1 },
    chain: [DYN_ROW],
    lit: ['cidr2'],
    // The add-on and its wire arrive with the step on the static path and fade in on the animated
    // one, and the range chip takes its second value AND its cue where the feed joins the ladder.
    rewind: { opacity: { cidr2: 0, aExtend: 0 }, chips: { rangeChip: ONE_RANGE } },
    flow: [
      F.anim({ target: 'cidr2', ...REVEAL }),
      F.anim({ target: 'aExtend', ...REVEAL }),
      F.route({ points: L_EXTEND, delay: 420, name: 'grow' }),
      F.set({ chips: { rangeChip: TWO_RANGES }, at: 'grow' }),
      F.light({ targets: ['rangeChip'], at: 'grow' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
