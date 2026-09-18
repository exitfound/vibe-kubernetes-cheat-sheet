import { box } from '../../lib/primitives.js';
import { P, F, defineCard, makeRidingLabel, strip, midX, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS/network-pod-localhost.md


// PANEL: right edge 396.55 and bottom 204.97, both at 1100x800, deepest on the poster step. The shell
// opens at x=420, so its whole body clears the wall and may stand as high as the card wants. The
// one block left of the wall is the client Pod, and it sits on the INTERFACE row rather than on the
// container row, which is what keeps it clear of the deepest panel.
const SHELL_X = 420, SHELL_Y = 168, SHELL_W = 720, SHELL_H = 340;   // 420..1140, 168..508
const IN_PAD = 30;
const IN_L = SHELL_X + IN_PAD, IN_R = SHELL_X + SHELL_W - IN_PAD;   // 450..1110

// THREE COLUMNS ARE THE WHOLE GRAMMAR: the interfaces, the containers and the socket table all
// resolve to the same x. `strip` derives the width, so 200 is a reading of the interior rather than
// a typed number (NET.L-01 clause c: a row the blocks are SIZED BY).
const COL = strip({ from: IN_L, to: IN_R, count: 3, gap: 30 });     // w 200, x 450 / 680 / 910
const CW = COL.w;
const COL_ETH = COL.x(0), COL_APP = COL.x(1), COL_SIDE = COL.x(2);  // 450, 680, 910
const cx = (x) => x + CW / 2;                                       // 550, 780, 1010

// Row 1 the two containers, row 2 the two interfaces, row 3 the socket table. The 98 units between
// row 1 and row 2 are what the two loopback taps measure, which is the shortest a hop may be and
// still read as travel rather than as a nudge.
const ROW1_Y = 206, BH = 56, ROW1_B = ROW1_Y + BH, ROW1_CY = ROW1_Y + BH / 2;   // 206..262, cy 234
const IF_Y = 360, IF_H = 48;                                                    // 360..408
const TABLE_Y = 442, CHIP_H = 34;                                               // 442..476

// lo spans the container PAIR exactly, so both of them stand on the one interface. Its top face
// midpoint is 895 and the two taps land at -115 and +115 from it, the deliberate mirrored pair
// L-12 admits and the shape network-namespaces already writes at -180 / 0 / +180.
const LO_X = COL_APP, LO_W = COL_SIDE + CW - COL_APP;               // 680..1110, w 430
const LO_CX = midX(LO_X, LO_X + LO_W);                              // 895
const SHELL_CY = SHELL_Y + SHELL_H / 2;                             // 338, and the face the call lands on

// The card's outer edges: the client opens on CONTENT_L and the shell closes on CONTENT_R, and the
// readout strip below spans exactly the same band, so every vertical edge of the card lines up.
const CONTENT_L = 60, CONTENT_R = SHELL_X + SHELL_W;                // 60 / 1140

// The client stands level with the MIDDLE of the shell and the call in stops ON its left face
// midpoint, which is `network-namespaces` read at Pod scale: the thing the outside reaches is the
// namespace as a whole, and what the arrival produced turns over after the pulse. CLIENT_Y is
// DERIVED from SHELL_CY, so moving the shell moves the client with it.
const CLIENT_W = 232, CLIENT_H = 116;
const CLIENT_X = CONTENT_L, CLIENT_Y = SHELL_CY - CLIENT_H / 2;     // 60..292, 280..396
const CLIENT_EDGE = CLIENT_X + CLIENT_W;                            // 292

const POD_IP = '10.244.1.5';

// The readout strip spans the card's own band, so it centres on the canvas by construction.
const READ_Y = 530;
const READ = strip({ from: CONTENT_L, to: CONTENT_R, count: 4, gap: 20 });  // w 255, x 60 / 335 / 610 / 885

// The four lanes, each of which carries a ball on some step (A-05).
const EXT_IN = [[CLIENT_EDGE, SHELL_CY], [SHELL_X, SHELL_CY]];
const EXT_UP = [[cx(COL_ETH), IF_Y], [cx(COL_ETH), ROW1_CY], [COL_APP, ROW1_CY]];
const LOOP_DOWN = [[cx(COL_APP), ROW1_B], [cx(COL_APP), IF_Y]];
const LOOP_UP = [[cx(COL_SIDE), IF_Y], [cx(COL_SIDE), ROW1_B]];

// The tag that rides a ball on this card. The external lane runs at SHELL_CY, 38 above the
// interface row, so the tag prints in the empty tap corridor whatever it overhangs. hold 0 plus
// emergeMode is what keeps it off the client face it flies out of.
const ridingLabel = makeRidingLabel({ role: 'network', dy: -15, inMs: 160, outMs: 170, hold: 0, emergeMode: true });
const tag = (p) => F.tag({ fn: ridingLabel, ...p });

// The four boxes drawn inside the Pod go INSIDE its group, so the pulse reaches them: a Pod blinks
// as one thing. buildPod carries exactly one `inner`, so these four peers are appended here.
const stack = (el, refs) => {
  refs.app  = box({ x: COL_APP,  y: ROW1_Y, w: CW,   h: BH,   label: 'app',     sublabel: 'server',        role: 'network' });
  refs.side = box({ x: COL_SIDE, y: ROW1_Y, w: CW,   h: BH,   label: 'sidecar', sublabel: 'proxy',         role: 'network' });
  refs.eth0 = box({ x: COL_ETH,  y: IF_Y,   w: CW,   h: IF_H, label: 'eth0',    sublabel: '10.244.1.5',    role: 'network' });
  refs.lo   = box({ x: LO_X,     y: IF_Y,   w: LO_W, h: IF_H, label: 'lo',      sublabel: '127.0.0.1',     role: 'network' });
  for (const k of ['app', 'side', 'eth0', 'lo']) el.appendChild(refs[k]);
};

// The list order IS the append order, which is the z-order: client + Pod shell with its four boxes,
// then lanes + wire above them, then the socket table and the readout strip, then the packet layer.
// The table chips are top-level parts and not children of the Pod on purpose: pulsePod animates
// `.scheme-box-rect` with `fill: forwards`, which a chip carries none of, so the table keeps
// painting through the pulse the external step fires.
export const SCENE = {
  'aria-label': 'Containers in one Pod share a network stack: the app and the sidecar stand on the same loopback and bind their ports in one shared space, so a call to 127.0.0.1 is delivered inside the Pod and a bind of a pair another container already holds comes back as address already in use, while a call from outside arrives on the Pod eth0 at the Pod address and the container holding the target port answers',
  parts: [
    P.defs(),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: CLIENT_X, y: CLIENT_Y, w: CLIENT_W, h: CLIENT_H,
      label: 'Client Pod', sublabel: '10.244.4.2',
      inner: { dx: 20, dy: 34, w: CLIENT_W - 40, h: 52, label: 'Client', sublabel: 'eth0' },
    }),
    P.pod({
      key: 'podGroup', x: SHELL_X, y: SHELL_Y, w: SHELL_W, h: SHELL_H,
      label: 'Pod', sublabel: 'one netns · one port space', tune: stack,
    }),
    P.arrow({ from: EXT_IN[0], to: EXT_IN[1], dashed: true, dim: true }),
    P.lane({ points: EXT_UP, dashed: true, dim: true }),
    P.arrow({ from: LOOP_DOWN[0], to: LOOP_DOWN[1], dashed: true, dim: true }),
    P.arrow({ from: LOOP_UP[0], to: LOOP_UP[1], dashed: true, dim: true }),
    // The loopback address prints on lo's top face midline, 115 clear of each tap. The external dst
    // rides on the ball instead (NET.T-01).
    P.wire({ key: 'local', x: LO_CX, y: IF_Y - 18 }),
    // The socket table: the shared thing on this card is a namespace of NUMBERS, so it is drawn
    // with the catalog's own named-value primitive, one slot per column under the block holding it.
    P.chip({ key: 'slotFree', x: COL_ETH,  y: TABLE_Y, w: CW, h: CHIP_H, name: ':9090',  value: 'free' }),
    P.chip({ key: 'slotApp',  x: COL_APP,  y: TABLE_Y, w: CW, h: CHIP_H, name: ':8080',  value: 'free' }),
    P.chip({ key: 'slotSide', x: COL_SIDE, y: TABLE_Y, w: CW, h: CHIP_H, name: ':15001', value: 'free' }),
    P.chip({ key: 'pathChip', x: READ.x(0), y: READ_Y, w: READ.w, h: CHIP_H, name: 'path',   value: 'idle' }),
    P.chip({ key: 'portChip', x: READ.x(1), y: READ_Y, w: READ.w, h: CHIP_H, name: 'ports',  value: 'all free' }),
    P.chip({ key: 'bindChip', x: READ.x(2), y: READ_Y, w: READ.w, h: CHIP_H, name: 'bind',   value: 'none' }),
    P.chip({ key: 'ipChip',   x: READ.x(3), y: READ_Y, w: READ.w, h: CHIP_H, name: 'Pod IP', value: POD_IP }),
    P.packets(),
  ],
  reset: {
    keys: ['clientBox', 'app', 'side', 'eth0', 'lo', 'slotFree', 'slotApp', 'slotSide', 'pathChip', 'portChip', 'bindChip', 'ipChip'],
    pods: ['client', 'podGroup'],
  },
};

// The table as it stands once both containers have bound, which is every step after the first.
const BOUND = { slotFree: 'free', slotApp: 'app', slotSide: 'sidecar' };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { pathChip: 'idle', portChip: 'all free', bindChip: 'none', ipChip: POD_IP, slotFree: 'free', slotApp: 'free', slotSide: 'free' },
  },
  {
    id: 'bind',
    duration: 2900,
    narration: 'Every container in this Pod joins one network namespace, so all of them share a single port space. The app binds :8080 in that space and the sidecar binds :15001, and neither of them gets a table of its own. A port claimed in there is claimed for the whole Pod rather than for one container.',
    chips: { pathChip: 'idle', portChip: 'one space', bindChip: 'app and sidecar', ipChip: POD_IP, slotFree: 'free', slotApp: 'app', slotSide: 'sidecar' },
    // A bind is a syscall and not traffic, so nothing travels here (M-27). What the step shows is
    // the two containers claiming their slots in the one table below them.
    lit: ['app', 'side', 'slotApp', 'slotSide', 'portChip', 'bindChip'],
  },
  {
    id: 'localhost',
    duration: 3000,
    narration: 'The app now calls 127.0.0.1:15001. Both containers stand on the same loopback, so the call goes down into lo and straight back up into the sidecar. There is no veth hop and nothing on the wire, just a loopback delivery inside the Pod.',
    chips: { pathChip: 'loopback via lo', portChip: 'one space', bindChip: 'app and sidecar', ipChip: POD_IP, ...BOUND },
    wires: { local: '127.0.0.1:15001' },
    lit: ['app', 'pathChip'],
    // Down into the shared interface, then back up out of it: the U-turn IS the loopback. The
    // second hop leaves lo, which the first one lit, so no ball departs a dark block (M-18a).
    flow: [
      F.route({ points: LOOP_DOWN, name: 'down', lights: ['lo'] }),
      F.route({ points: LOOP_UP, after: 'down', lights: ['side', 'slotSide'] }),
    ],
  },
  {
    id: 'conflict',
    duration: 3000,
    narration: 'A bind claims an address and a port together, so the shared space is where the two containers meet. The sidecar already holds 127.0.0.1:15001, and an app that asked for that same pair would be refused with address already in use. Any port the sidecar has not claimed, :9090 here, is still open to it.',
    chips: { pathChip: 'idle', portChip: 'one space', bindChip: ':15001 in use', ipChip: POD_IP, ...BOUND },
    // Static again, and the picture is the table: the slot the app wants is held, and the free slot
    // beside it is the one it may take instead.
    lit: ['app', 'slotSide', 'slotFree', 'pathChip', 'bindChip'],
  },
  {
    id: 'external',
    duration: 3400,
    narration: 'A call from outside arrives on eth0, the one interface in the Pod that faces the network, at 10.244.1.5. It carries a port, and the container holding that port answers, here the app on :8080. From the outside the Pod is one host with one address per family, however many containers run inside.',
    chips: { pathChip: 'eth0', portChip: 'one space', bindChip: 'app holds :8080', ipChip: POD_IP, ...BOUND },
    lit: ['pathChip', 'bindChip'],
    // The animated path says the client sent by PULSING it, which no lights list can name.
    reducedLit: ['clientBox'],
    // Up-arrow: the client pulses first, the ball stops ON the shell face, eth0 is the interface it
    // came in on and lights there, and the delivery leaves it a BEAT.afterHop later (M-18a).
    // NO POD PULSE HERE, and the MOTION block of the record carries the measurement that forbids it.
    flow: [
      F.pulse({ pod: 'client' }),
      F.route({ points: EXT_IN, delay: BEAT.afterPulse, name: 'hop', lights: ['eth0'] }),
      tag({ text: 'dst 10.244.1.5:8080', points: EXT_IN, delay: BEAT.afterPulse, emerge: 150 }),
      F.route({ points: EXT_UP, after: 'hop', lights: ['app', 'slotApp'] }),
    ],
  },
  {
    id: 'recap',
    duration: 3300,
    narration: 'So the network belongs to the Pod rather than to a container: the address, the loopback and the port space are shared, while each container keeps its own filesystem and process tree unless the Pod sets shareProcessNamespace. That is what lets a sidecar proxy take the app traffic on localhost without leaving the Pod.',
    chips: { pathChip: 'lo and eth0', portChip: 'one space', bindChip: 'one per pair', ipChip: POD_IP, ...BOUND },
    // Static summary: both interfaces and the whole table stand lit, no motion.
    lit: ['eth0', 'lo', 'slotFree', 'slotApp', 'slotSide', 'pathChip', 'portChip', 'bindChip', 'ipChip'],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
