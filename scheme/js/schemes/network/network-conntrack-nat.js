import { LANE_DY, P, F, defineCard, laneY, BEAT, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS/network-conntrack-nat.md

// netfilter is the hinge, with the COST above it and the MEMORY below, so both bands centre on NF_CX
// and their stubs are straight verticals. The corridor and the chip strip span the same band.
const NF_W = 232, NF_H = 80;                       // NET.L-01
const NF_CX = 600;                                 // the spine of the whole card
const NF_X = NF_CX - NF_W / 2;
const NF_LEFT = NF_X, NF_RIGHT = NF_X + NF_W;

const SCHEME_L = 70, SCHEME_R = 1130;              // the corridor and the chip strip share both

const POD_Y = 268, POD_H = 110;                    // both Pod shells stand on one baseline
const POD_W = 232;
const CLIENT_X = SCHEME_L, CLIENT_EDGE = CLIENT_X + POD_W;
const CLIENT_CX = CLIENT_X + POD_W / 2;
const SERVER_X = SCHEME_R - POD_W, SERVER_CX = SERVER_X + POD_W / 2;
const POD_BOTTOM = POD_Y + POD_H;

const FLOW_Y = POD_Y + POD_H / 2;   // the face midpoint both lanes are mirrored about
const NF_Y = FLOW_Y - NF_H / 2;     // netfilter is centred on the same line
const NF_BOTTOM = NF_Y + NF_H;
const { out: REQ_Y, back: REP_Y } = laneY(FLOW_Y, LANE_DY);

// Four cells with even gaps spanning the corridor 1:1, all one width: no value here needs more.
const CHIP_Y = 566, CHIP_H = 34, CHIP_GAP = 20;
const CHIP_W = (SCHEME_R - SCHEME_L - 3 * CHIP_GAP) / 4;
const CHIP_X = [0, 1, 2, 3].map(i => SCHEME_L + i * (CHIP_W + CHIP_GAP));

// The rule ladder takes the strip cell exactly, so the rows above netfilter and the readout below are
// one family. RULE_Y makes the stub up from netfilter as long as the stub down to the entry.
const RULE_ROW_H = CHIP_H, RULE_GAP = 5;
const RULE_BOTTOM = 214, RULE_Y = RULE_BOTTOM - 3 * RULE_ROW_H - 2 * RULE_GAP;
const RULE_W = CHIP_W, RULE_X = NF_CX - RULE_W / 2;

// The conntrack entry: wide, below netfilter, two tuple rows read as one record. Wider than a strip
// cell by design, so a row cannot be mistaken for another chip.
const ENT_W = 480, ENT_X = NF_CX - ENT_W / 2;
const ENT_R = ENT_X + ENT_W;
const ENT_ROW_H = CHIP_H, ENT_GAP = 8;
const ORIG_Y = 432, ORIG_CY = ORIG_Y + ENT_ROW_H / 2;
const REPLY_Y = ORIG_Y + ENT_ROW_H + ENT_GAP;
const REPLY_CY = REPLY_Y + ENT_ROW_H / 2;

// Two lanes per gap: request (top, ->) and reply (bottom, <-), so every ball has a matching arrow.
const C_REQ = [[CLIENT_EDGE, REQ_Y], [NF_LEFT, REQ_Y]];
const C_REP = [[NF_LEFT, REP_Y], [CLIENT_EDGE, REP_Y]];
const S_REQ = [[NF_RIGHT, REQ_Y], [SERVER_X, REQ_Y]];
const S_REP = [[SERVER_X, REP_Y], [NF_RIGHT, REP_Y]];

// Four relationships, none of them traffic. Two say what netfilter OWNS, and two say whose view each
// tuple is: the original row is what the client sent, the reply row is what the backend sends back.
const R_RULES = [[NF_CX, RULE_BOTTOM], [NF_CX, NF_Y]];
const R_TABLE = [[NF_CX, NF_BOTTOM], [NF_CX, ORIG_Y]];
const R_ORIG = [[ENT_X, ORIG_CY], [CLIENT_CX, ORIG_CY], [CLIENT_CX, POD_BOTTOM]];
const R_REPLY = [[ENT_R, REPLY_CY], [SERVER_CX, REPLY_CY], [SERVER_CX, POD_BOTTOM]];

const POD_INNER = { dx: 20, dy: 34, h: 52, w: POD_W - 40, label: 'app', sublabel: 'eth0' };
// The table format stands from the first frame at `pending` with both rows blank, because an entry
// that does not exist yet is a slot nothing has been written into, not a thing that is absent. One
// factory states the whole opacity field so no step can write half of it.
const entryStage = (on) => ({ entry: on });
const REVEAL = { keyframes: [{ opacity: OPACITY.pending }, { opacity: 1 }], options: { duration: 500, fill: 'forwards', easing: 'ease-out' } };

// The list order IS the append order, which is the z-order: the ladder and the body blocks, then the
// lanes and their labels, then the entry group, then the strip, then the packet layer.
export const SCENE = {
  'aria-label': 'Connection tracking and NAT: the first packet of a new flow matches no conntrack entry, so the NAT rules are walked once to pick a backend, and conntrack then records the flow as one entry holding the original tuple and the reply tuple it expects back, which lets the reply be reverse-translated with no rule read at all and every later packet be translated straight off the stored entry',
  parts: [
    P.defs(),
    P.tag({ x: NF_CX, y: RULE_Y - 13, text: 'NAT rules · iptables mode' }),
    P.chain({
      key: 'chain', x: RULE_X, y: RULE_Y, w: RULE_W, rowH: RULE_ROW_H, gap: RULE_GAP,
      items: [
        'KUBE-SERVICES · dst 10.96.0.20:80',
        'KUBE-SVC · picks one backend',
        'KUBE-SEP · DNAT 10.244.2.7:8080',
      ],
    }),
    P.box({ key: 'nf', x: NF_X, y: NF_Y, w: NF_W, h: NF_H, label: 'netfilter', sublabel: 'NAT + conntrack' }),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: CLIENT_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Client Pod', sublabel: '10.244.1.5', inner: POD_INNER,
    }),
    P.pod({
      key: 'server', innerKey: 'serverBox', x: SERVER_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Server Pod', sublabel: '10.244.2.7:8080', inner: POD_INNER,
    }),
    P.arrow({ from: C_REQ[0], to: C_REQ[1], dashed: true, dim: true }),
    P.arrow({ from: C_REP[0], to: C_REP[1], dashed: true, dim: true }),
    P.arrow({ from: S_REQ[0], to: S_REQ[1], dashed: true, dim: true }),
    P.arrow({ from: S_REP[0], to: S_REP[1], dashed: true, dim: true }),
    P.relation({ points: R_RULES }),
    // The record does not exist until conntrack writes it, and neither do the lines pointing at it,
    // so the whole assembly is one group that fades in on a single beat.
    P.group({
      key: 'entry', opacity: OPACITY.pending,
      parts: [
        P.relation({ points: R_TABLE }),
        P.relation({ points: R_ORIG }),
        P.relation({ points: R_REPLY }),
        P.chip({ key: 'origRow', x: ENT_X, y: ORIG_Y, w: ENT_W, h: ENT_ROW_H, name: 'original', value: ' ' }),
        P.chip({ key: 'replyRow', x: ENT_X, y: REPLY_Y, w: ENT_W, h: ENT_ROW_H, name: 'reply', value: ' ' }),
        P.tag({ x: NF_CX, y: ORIG_Y - 13, text: 'conntrack entry' }),
      ],
    }),
    P.chip({ key: 'ctChip', x: CHIP_X[0], y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'ct state', value: 'none' }),
    P.chip({ key: 'walkChip', x: CHIP_X[1], y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'rule walk', value: 'none' }),
    P.chip({ key: 'backendChip', x: CHIP_X[2], y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'backend', value: 'none' }),
    P.chip({ key: 'tableChip', x: CHIP_X[3], y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'table', value: 'no entry' }),
    P.packets(),
  ],
  // The inner boxes are keys, not pod groups: a pod group only has its pulse strokes reset, so a
  // .highlight left on a container would ride along into every later step.
  reset: {
    keys: ['nf', 'clientBox', 'serverBox', 'origRow', 'replyRow', 'ctChip', 'walkChip', 'backendChip', 'tableChip'],
    pods: ['client', 'server'],
  },
};

const ORIG_TUPLE = '10.244.1.5:34512 -> 10.96.0.20:80';
const REPLY_TUPLE = '10.244.2.7:8080 -> 10.244.1.5:34512';
const BACKEND = '10.244.2.7:8080';
const TABLE_ONE = '1 of nf_conntrack_max';
const WALK_READ = 'chain read';
// Every address RIDES its ball (NET.T-01).
const REQ_TAG = 'dst 10.96.0.20:80';
const NAT_TAG = 'dst 10.244.2.7:8080';
const RIDE = { easing: 'linear' };
// A reply rides the LOWER lane, so its tag rides under the ball and outside the pair, off the
// request lane.
const RIDE_BACK = { ...RIDE, dy: 18 };
// The record is blank until the step that writes it, and blank means a space: an empty string would
// leave the row with no text node for a later write to land in.
const BLANK = { origRow: ' ', replyRow: ' ' };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { ...BLANK, ctChip: 'none', walkChip: 'none', backendChip: 'none', tableChip: 'no entry' },
    opacity: entryStage(OPACITY.pending),
    chain: -1,
  },
  {
    id: 'send',
    duration: 2400,
    narration: 'The client dials a Service address that no host owns, and the first packet of the flow reaches netfilter. There is no conntrack entry matching this packet, so nothing about this connection has been decided yet.',
    chips: { ...BLANK, ctChip: 'no match', walkChip: 'pending', backendChip: 'none', tableChip: 'no entry' },
    opacity: entryStage(OPACITY.pending),
    chain: -1,
    lit: [],
    // The animated path says the client sent this packet by PULSING it, which no lights list names.
    reducedLit: ['clientBox'],
    // Up-arrow: the client pulses first, then the packet leaves on the request lane, and the miss is
    // only known once the packet is inside the box, so both chips land on that arrival.
    rewind: { chips: { ctChip: 'none', walkChip: 'none' } },
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: C_REQ[0], to: C_REQ[1], delay: BEAT.afterPulse, name: 'in', lights: ['nf'] }),
      F.tag({ text: REQ_TAG, points: C_REQ, delay: BEAT.afterPulse, ...RIDE }),
      F.set({ chips: { ctChip: 'no match', walkChip: 'pending' }, at: 'in' }),
      F.light({ targets: ['ctChip', 'walkChip'], at: 'in' }),
    ],
  },
  {
    id: 'walk',
    duration: 2800,
    narration: 'With no entry to match, the NAT rules have to be walked. The chain is read top to bottom until a rule claims the destination and a backend is chosen for this connection. Every first packet of every new flow pays this walk, and no later packet of it pays again while the entry lives.',
    chips: { ...BLANK, ctChip: 'no match', walkChip: WALK_READ, backendChip: BACKEND, tableChip: 'no entry' },
    opacity: entryStage(OPACITY.pending),
    chain: [0, 1, 2],
    lit: ['nf'],
    // Nothing travels here on purpose: the packet is held inside the box while the ladder is read,
    // which is the whole cost this card is about. The rungs light in reading order, one per beat.
    rewind: { chain: -1, chips: { walkChip: 'pending', backendChip: 'none' } },
    flow: [
      F.set({ chain: [0] }),
      F.set({ chain: [0, 1], delay: 600 }),
      F.set({ chain: [0, 1, 2], chips: { backendChip: BACKEND }, delay: 1200 }),
      F.set({ chips: { walkChip: WALK_READ }, delay: 1200 }),
      F.light({ targets: ['walkChip', 'backendChip'], delay: 1200 }),
    ],
  },
  {
    id: 'insert',
    duration: 3000,
    narration: 'The flow is now recorded by conntrack as one entry holding two tuples: the original direction the client sent, and the reply direction it expects back. The destination is rewritten to the chosen backend and the packet is delivered, with the mapping stored for the life of the connection.',
    chips: { origRow: ORIG_TUPLE, replyRow: REPLY_TUPLE, ctChip: 'NEW', walkChip: WALK_READ, backendChip: BACKEND, tableChip: TABLE_ONE },
    opacity: entryStage(1),
    chain: -1,
    lit: ['nf'],
    // The animated path says the server was served by PULSING it, which no lights list names.
    reducedLit: ['serverBox'],
    // The record is born first, then the rewritten packet leaves the far edge of the box: the DNAT
    // happened inside it, which is why no ball crosses the box (NET.A-01).
    rewind: { opacity: entryStage(OPACITY.pending), chips: { ...BLANK, ctChip: 'no match', tableChip: 'no entry' } },
    flow: [
      F.anim({ target: 'entry', ...REVEAL, name: 'write' }),
      F.set({ chips: { origRow: ORIG_TUPLE, replyRow: REPLY_TUPLE, ctChip: 'NEW', tableChip: TABLE_ONE }, at: 'write' }),
      F.light({ targets: ['origRow', 'replyRow', 'ctChip', 'tableChip'], at: 'write' }),
      F.segment({ from: S_REQ[0], to: S_REQ[1], delay: 520, name: 'give' }),
      F.tag({ text: NAT_TAG, points: S_REQ, delay: 520, ...RIDE }),
      F.pulse({ pod: 'server', at: 'give' }),
    ],
  },
  {
    id: 'reply',
    duration: 3600,
    narration: 'The backend answers from its own address, and the packet matches the reply tuple of the stored entry. That match alone is enough to undo the translation, so the client sees an answer from the Service address it dialed, and the entry moves to ESTABLISHED. Not one NAT rule is read on the way back.',
    chips: { origRow: ORIG_TUPLE, replyRow: REPLY_TUPLE, ctChip: 'ESTABLISHED', walkChip: 'none on the reply', backendChip: BACKEND, tableChip: TABLE_ONE },
    opacity: entryStage(1),
    chain: -1,
    lit: [],
    // The animated path says the client got the reply by PULSING it, which no lights list names.
    reducedLit: ['clientBox'],
    // Up-arrow, the same beat order the client gets on `send`: the Pod that answers blinks FIRST
    // and its packet leaves at BEAT.afterPulse. The row that matches is the REPLY one, and it
    // matches the moment the packet reaches the box, so the row and the new state land there.
    rewind: { chips: { ctChip: 'NEW', walkChip: WALK_READ } },
    flow: [
      F.pulse({ pod: 'server' }),
      F.segment({ from: S_REP[0], to: S_REP[1], delay: BEAT.afterPulse, name: 'h1', lights: ['nf'] }),
      F.tag({ text: 'src 10.244.2.7:8080', points: S_REP, delay: BEAT.afterPulse, ...RIDE_BACK }),
      F.set({ chips: { ctChip: 'ESTABLISHED', walkChip: 'none on the reply' }, at: 'h1' }),
      F.light({ targets: ['replyRow', 'ctChip', 'walkChip'], at: 'h1' }),
      F.segment({ from: C_REP[0], to: C_REP[1], after: 'h1', name: 'h2' }),
      F.tag({ text: 'src 10.96.0.20', points: C_REP, after: 'h1', ...RIDE_BACK }),
      F.pulse({ pod: 'client', at: 'h2' }),
    ],
  },
  {
    id: 'fastpath',
    duration: 3600,
    narration: 'Every later packet of this flow matches the original tuple and is translated straight off the entry, with the rule ladder left untouched. That is why a flow stays on one backend for as long as its entry lives, and why a Node opening huge numbers of short connections can fill its conntrack table and start dropping new ones.',
    chips: { origRow: ORIG_TUPLE, replyRow: REPLY_TUPLE, ctChip: 'ESTABLISHED', walkChip: 'skipped', backendChip: BACKEND + ' · pinned', tableChip: TABLE_ONE },
    opacity: entryStage(1),
    // The ladder stays dark, and that darkness against the `walk` step IS the lesson of this step.
    chain: -1,
    lit: [],
    // The animated path says the server was served by PULSING it, which no lights list names.
    reducedLit: ['serverBox'],
    // A later packet runs the whole corridor without pausing: the lookup that replaces the walk is
    // the original row lighting as the packet reaches the box.
    rewind: { chips: { walkChip: 'none on the reply', backendChip: BACKEND } },
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: C_REQ[0], to: C_REQ[1], delay: BEAT.afterPulse, name: 'h1', lights: ['nf'] }),
      F.tag({ text: REQ_TAG, points: C_REQ, delay: BEAT.afterPulse, ...RIDE }),
      F.set({ chips: { walkChip: 'skipped', backendChip: BACKEND + ' · pinned' }, at: 'h1' }),
      F.light({ targets: ['origRow', 'walkChip', 'backendChip'], at: 'h1' }),
      F.segment({ from: S_REQ[0], to: S_REQ[1], after: 'h1', name: 'h2' }),
      F.tag({ text: NAT_TAG, points: S_REQ, after: 'h1', ...RIDE }),
      F.pulse({ pod: 'server', at: 'h2' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
