import { box } from '../../lib/primitives.js';
import { P, F, defineCard, makeRidingLabel, midX, routeDur, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-pod-localhost


const SHELL_X = 620, SHELL_Y = 174, SHELL_W = 500, SHELL_H = 320;  // [620..1120] spans the bind + Pod IP chips
const SHELL_CY = SHELL_Y + SHELL_H / 2;                            // 334
const CLIENT_W = 180, CLIENT_H = 124;
const CLIENT_X = 115;                                              // centre 205 == path chip centre
const CLIENT_Y = SHELL_CY - CLIENT_H / 2;                          // 272, centred on the shell
const CLIENT_EDGE = CLIENT_X + CLIENT_W;                           // 295, client right edge

// Symmetric 2x2 interior grid, centred in the wider shell. The inner block size is unchanged
// (BW/BH); only the columns spread out, to equal 70px side margins and an 80px centre gap.
const BW = 140, BH = 56;
const COL_L = SHELL_X + 70, COL_R = SHELL_X + 290;                 // 690, 910
const ROW_TOP = SHELL_Y + 60, ROW_BOT = SHELL_Y + 210;             // 234, 384
const LOCAL_Y = ROW_TOP + BH / 2;                                  // 262, app <-> sidecar lane
const APP_EDGE = COL_L + BW;                                       // 830, app right edge
const SIDE_LEFT = COL_R;                                           // 910, sidecar left edge
const GRID_MID_X = midX(COL_L, COL_R + BW);                        // 870, midpoint of the app/sidecar pair

const EXT_PATH = [[CLIENT_EDGE, SHELL_CY], [SHELL_X, SHELL_CY]];
const LOCAL_HOP = [[APP_EDGE, LOCAL_Y], [SIDE_LEFT, LOCAL_Y]];

// The tag that rides a ball on this card: hold 260 leaves the dialled address up while the Pod pulse
// and the eth0 and app lights land on arrival, so the address and what answered it read together.
const ridingLabel = makeRidingLabel({ role: 'network', dy: -15, inMs: 160, outMs: 200, hold: 260 });
const tag = (p) => F.tag({ fn: ridingLabel, ...p });

// The four boxes drawn inside the Pod go INSIDE its group, so the pulse reaches them: a Pod blinks
// as one thing. buildPod carries exactly one `inner`, so these four peers are appended here.
const containers = (el, refs) => {
  refs.app  = box({ x: COL_L, y: ROW_TOP, w: BW, h: BH, label: 'app',     sublabel: ':8080',        role: 'network' });
  refs.side = box({ x: COL_R, y: ROW_TOP, w: BW, h: BH, label: 'sidecar', sublabel: 'proxy :15001', role: 'network' });
  refs.eth0 = box({ x: COL_L, y: ROW_BOT, w: BW, h: BH, label: 'eth0',    sublabel: '10.244.1.5',   role: 'network' });
  refs.lo   = box({ x: COL_R, y: ROW_BOT, w: BW, h: BH, label: 'lo',      sublabel: '127.0.0.1',    role: 'network' });
  for (const k of ['app', 'side', 'eth0', 'lo']) el.appendChild(refs[k]);
};

// The list order IS the append order, which is the z-order: client + Pod shell with its four boxes,
// then wires + label above them, then chips, then the packet layer on top.
export const SCENE = {
  'aria-label': 'Containers in a Pod share localhost: every container joins the same network namespace, so app and sidecar reach each other over 127.0.0.1 with no network hop and share one port space, while outside traffic still arrives on the single shared eth0 and Pod IP',
  parts: [
    P.defs(),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: CLIENT_X, y: CLIENT_Y, w: CLIENT_W, h: CLIENT_H,
      label: 'Client Pod', sublabel: '10.244.4.2',
      inner: { dx: 20, dy: 34, w: CLIENT_W - 40, h: 52, label: 'Client', sublabel: 'eth0' },
    }),
    P.pod({
      key: 'podGroup', x: SHELL_X, y: SHELL_Y, w: SHELL_W, h: SHELL_H,
      label: 'Pod', sublabel: 'one netns · 10.244.1.5', tune: containers,
    }),
    P.arrow({ from: LOCAL_HOP[0], to: LOCAL_HOP[1], dashed: true, dim: true }),
    P.arrow({ from: EXT_PATH[0], to: EXT_PATH[1], dashed: true, dim: true }),
    // localhost label rides ABOVE the two containers (the 40px lane between them is too narrow for
    // the full address), so it never overlaps app or sidecar. The external dst rides on the ball.
    P.wire({ key: 'local', x: GRID_MID_X, y: ROW_TOP - 18 }),
    P.chip({ key: 'pathChip', x: 80,  y: 530, w: 250, h: 34, name: 'path',   value: 'idle' }),
    P.chip({ key: 'portChip', x: 350, y: 530, w: 250, h: 34, name: 'ports',  value: 'shared' }),
    P.chip({ key: 'bindChip', x: 620, y: 530, w: 230, h: 34, name: 'bind',   value: 'free' }),
    P.chip({ key: 'ipChip',   x: 870, y: 530, w: 250, h: 34, name: 'Pod IP', value: '10.244.1.5' }),
    P.packets(),
  ],
  reset: {
    keys: ['clientBox', 'app', 'side', 'eth0', 'lo', 'pathChip', 'portChip', 'bindChip', 'ipChip'],
    pods: ['client', 'podGroup'],
  },
};

const POD_IP = '10.244.1.5';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { pathChip: 'idle', portChip: 'shared', bindChip: 'free', ipChip: POD_IP },
  },
  {
    id: 'localhost',
    duration: 2300,
    narration: 'The app talks to its sidecar over 127.0.0.1:15001. Because both containers share the namespace, the call goes through the loopback interface lo and never touches eth0 or the network. There is no veth hop, no routing, just a loopback delivery inside the Pod.',
    chips: { pathChip: 'loopback via lo', portChip: 'shared', bindChip: 'free', ipChip: POD_IP },
    wires: { local: '127.0.0.1:15001' },
    lit: ['app', 'pathChip'],
    // localhost hop app -> sidecar, served entirely through loopback, so lo and the sidecar
    // light on arrival.
    flow: [
      F.segment({ from: LOCAL_HOP[0], to: LOCAL_HOP[1], lights: ['side', 'lo'] }),
    ],
  },
  {
    id: 'ports',
    duration: 2400,
    narration: 'Sharing the namespace also means sharing the port space. The sidecar already holds :15001, and if the app tried to bind that same port the kernel would reject it with address already in use. Two containers in one Pod cannot both listen on the same port.',
    chips: { pathChip: 'loopback via lo', portChip: 'one space', bindChip: ':15001 in use', ipChip: POD_IP },
    // The sidecar owns :15001, so it stays lit as the holder alongside the app that is refused
    // the same port. This is a static conflict state, no motion (nothing pulses).
    lit: ['side', 'app', 'portChip', 'bindChip'],
  },
  {
    id: 'external',
    duration: 2600,
    narration: 'Traffic from outside still arrives on the single shared eth0 at the Pod IP. Whichever container is listening on the target port answers, here the app on :8080. From the outside the Pod looks like one host with one address, regardless of how many containers run inside.',
    chips: { pathChip: 'eth0', portChip: 'one space', bindChip: 'app :8080', ipChip: POD_IP },
    lit: ['ipChip', 'pathChip', 'bindChip'],
    // The animated path says the client sent by PULSING it, which no lights list can name.
    reducedLit: ['clientBox'],
    // Up-arrow: the client pulses first, the ball leaves at BEAT.afterPulse carrying its dst, and the
    // Pod pulses on arrival with eth0 and the answering app lighting after the tag.
    flow: [
      F.pulse({ pod: 'client' }),
      F.route({ points: EXT_PATH, delay: BEAT.afterPulse, name: 'hop' }),
      tag({ text: 'dst 10.244.1.5:8080', points: EXT_PATH, delay: BEAT.afterPulse, dur: routeDur(EXT_PATH) }),
      F.pulse({ pod: 'podGroup', at: 'hop' }),
      F.light({ targets: ['eth0', 'app'], at: 'hop' }),
    ],
  },
  {
    id: 'recap',
    duration: 2400,
    narration: 'So the network is shared, one IP, one loopback, one port space, while each container keeps its own filesystem and process tree. This is exactly what lets a sidecar proxy intercept the app traffic on localhost without either container leaving the Pod.',
    chips: { pathChip: 'shared netns', portChip: 'one space', bindChip: 'per port', ipChip: POD_IP },
    // Static summary: the shared eth0 and lo both stay lit, no motion.
    lit: ['eth0', 'lo', 'portChip', 'ipChip', 'pathChip', 'bindChip'],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
