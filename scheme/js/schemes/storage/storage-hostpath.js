import { P, F, defineCard, setCylinderLabel, BEAT, FADE, OPACITY } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-hostpath


const NODE_X = 180, NODE_Y = 170, NODE_W = 840, NODE_H = 380;   // 180..1020, center 600, bottom 550

const POD_X = 300, POD_Y = 186, POD_W = 600, POD_H = 170;       // 300..900, center 600

const C_Y = 232, C_W = 190, C_H = 84;                           // container row (volume-model grid)
const C_BOTTOM = C_Y + C_H;                                     // 316
const APP_X = 330,  APP_CX = APP_X + C_W / 2;                   // 330..520, center 425
const SIDE_X = 680, SIDE_CX = SIDE_X + C_W / 2;                 // 680..870, center 775

// The host directory is drawn with the family cylinder (260x104 centered on 600), the same block as
// the emptyDir disk, so the two node-local cards read as one family.
const HP_X = 470, HP_Y = 408, HP_W = 260, HP_H = 104;          // 470..730, center 600, bottom 512
const HP_MY = HP_Y + HP_H / 2;                                  // 460, where the lanes meet the sides

const DISK_LBL_Y = 530;
const CHIPS_Y = 566;

// One L-shaped polyline per direction, shared by its static pathArrow and its ball, written in its
// one traffic direction so the arrowhead lands at the receiving end.
const LANE_WRITE = [[APP_CX, C_BOTTOM], [APP_CX, HP_MY], [HP_X, HP_MY]];              // app -> host dir
const LANE_READ  = [[HP_X + HP_W, HP_MY], [SIDE_CX, HP_MY], [SIDE_CX, C_BOTTOM]];     // host dir -> agent

// A container is a box inside a bare g so it can be highlighted on its own. It is NEVER pulsed and
// never lit as an inner box (STO.C-02): the Pod carries the pulse for everything in it.
const container = (key, x, label, sublabel) => P.group({
  key: `${key}C`,
  parts: [P.box({ key: `${key}Box`, x, y: C_Y, w: C_W, h: C_H, label, sublabel })],
});

// The list order IS the append order, which is the z-order: the node, then the Pod and the host
// directory, then the two lanes and the shelf caption above them, then the chips, then the packets.
export const SCENE = {
  'aria-label': 'hostPath volume: a hostPath mounts a file or directory from the Node filesystem straight into the Pod. Under type Directory or File the target must already exist, DirectoryOrCreate and FileOrCreate make it, and the default empty type checks nothing at all. The directory belongs to the Node, not the Pod, so writes land in real host state and stay on the Node after the Pod is gone, but a Pod rescheduled to another Node mounts the different directory that belongs to that Node, so hostPath looks like persistence and is not. Pointed at a sensitive path it hands the whole Node to the Pod, which is why the Baseline and Restricted Pod Security Standards forbid it.',
  parts: [
    P.defs(),
    P.node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.group({
      key: 'pod',
      parts: [
        // No `inner`: the two containers are peers below, so the Pod part is the shell alone and
        // the wrap it comes in IS shellWrap. The pulse takes `pod`, so they blink with it.
        P.pod({ key: 'shellWrap', x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod log-agent', sublabel: 'volumes: varlog (hostPath)', containers: 0 }),
        container('app', APP_X, 'app', 'writes /var/log'),
        container('side', SIDE_X, 'Agent', 'reads /var/log'),
      ],
    }),
    // The backing cylinder is the node's OWN directory, not a Pod-scoped disk. It carries the host
    // path as its label and is drawn inside the Node boundary. No spine ties it to the Pod.
    P.cylinder({ key: 'hp', x: HP_X, y: HP_Y, w: HP_W, h: HP_H, label: '/var/log', labelY: HP_H / 2 + 12 }),
    // One directed lane per container, each with its own arrowhead: the app writes into the cylinder
    // side, the agent reads out of the far side. No ownership spine (the directory is not the Pod's).
    P.lane({ key: 'wWrite', points: LANE_WRITE, dashed: true, dim: true }),
    P.lane({ key: 'wRead', points: LANE_READ, dashed: true, dim: true }),
    P.tag({ key: 'diskLbl', x: 600, y: DISK_LBL_Y, text: 'the node filesystem' }),
    // The chip strip spans exactly the node width (180..1020): 3x270 + 2x15 = 840.
    P.chip({ key: 'hostChip', x: 180, y: CHIPS_Y, w: 270, h: 34, name: 'hostPath', value: 'mounts /var/log' }),
    P.chip({ key: 'livesChip', x: 465, y: CHIPS_Y, w: 270, h: 34, name: 'data lives', value: 'on the node' }),
    P.chip({ key: 'expChip', x: 750, y: CHIPS_Y, w: 270, h: 34, name: 'exposure', value: 'one directory' }),
    P.packets(),
  ],
  reset: {
    keys: ['appBox', 'sideBox', 'hp', 'hostChip', 'livesChip', 'expChip'],
    pods: ['shellWrap', 'appC', 'sideC'],
  },
};

// The two faces of the host directory: the cylinder label and the shelf caption under it. NO field
// writes either one, `labels:` goes through setBoxLabel and queries .scheme-box-label, and a free
// <text> lands in the main ref bucket, so both are stated on every step as per-step state.
const faces = (s, cyl, shelf) => { setCylinderLabel(s.refs.hp, cyl); s.refs.diskLbl.textContent = shelf; };

// STO.S-01 as a field: the reschedule step ghosts the Pod and its mount lanes, so every other step
// states the stack at full. `diskLbl` is deliberately absent, because the legacy prologue never
// pinned it either: this card ghosts the Pod alone and the shelf caption stays with the directory.
const STACK_UP = { pod: 1, appC: 1, sideC: 1, hp: 1, wWrite: 1, wRead: 1 };
const GONE = ['pod', 'wWrite', 'wRead'];

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: { hostChip: 'mounts /var/log', livesChip: 'on the node', expChip: 'one directory' },
    opacity: STACK_UP,
    enter(s) { faces(s, '/var/log', 'the node filesystem'); },
  },
  {
    id: 'mount',
    duration: 2600,
    narration: 'The Pod names a hostPath with a path and a type. Kubelet checks the Node first: type Directory requires /var/log to already exist, while DirectoryOrCreate makes it, owned by Kubelet. It then bind-mounts that host directory into the container.',
    chipsCued: { hostChip: 'bind-mounted in', livesChip: 'on the node', expChip: 'one directory' },
    opacity: STACK_UP,
    // Kubelet bind-mounts the existing host directory INTO the containers, so the cylinder and both
    // container boxes light for the whole step and the Pod pulses in the same beat.
    lit: ['hp', 'appBox', 'sideBox'],
    enter(s) { faces(s, '/var/log', 'the node filesystem'); },
    flow: [F.pulse({ pod: 'pod' })],
  },
  {
    id: 'access',
    duration: 3800,
    narration: 'Inside the container /var/log is the real log directory of the Node. The app writes an entry and the agent reads it straight back, and every byte lands in the Node filesystem where it stays after the Pod is gone. This is live host state, not private scratch.',
    chipsCued: { hostChip: 'reads host files', livesChip: 'on the node', expChip: 'one directory' },
    opacity: STACK_UP,
    // The app container is the writer and is lit at entry. The host directory and the agent box
    // are receivers, so each lights as its own ball lands, and the pulse fires on the same beat.
    lit: ['appBox'],
    enter(s) { faces(s, '/var/log', 'the node filesystem'); },
    // The write descends into the cylinder side, the read returns out of the far side and up into
    // the Pod, which pulses again on that arrival. The cylinder cue is its OWN entry because the
    // hand-written step emitted it after the tag, and that order is observable.
    flow: [
      F.pulse({ pod: 'pod' }),
      F.route({ points: LANE_WRITE, delay: BEAT.afterPulse, name: 'write' }),
      F.tag({ text: 'write entry', points: LANE_WRITE, delay: BEAT.afterPulse }),
      F.light({ targets: ['hp'], at: 'write' }),
      F.route({ points: LANE_READ, after: 'write', name: 'read', lights: ['sideBox'] }),
      F.tag({ text: 'read entry', points: LANE_READ, after: 'write' }),
      F.pulse({ pod: 'pod', at: 'read' }),
    ],
  },
  {
    id: 'reschedule',
    duration: 2800,
    narration: 'The directory belongs to the Node, not the Pod, so deleting the Pod leaves /var/log untouched on Node-1, and here the Pod dims out while the directory stays lit. Schedule a replacement onto another Node and the /var/log it finds there is a different directory that belongs to that Node. The data did not travel. A hostPath volume looks like persistence and is not.',
    chipsCued: { hostChip: 'stays behind', livesChip: 'on the old node', expChip: 'one directory' },
    // The exact inversion of emptyDir dies: only the Pod and its mount lanes ghost. The host
    // directory stays at full opacity and lit, because it belongs to the node and outlives the Pod.
    opacity: { ...STACK_UP, ...Object.fromEntries(GONE.map(k => [k, OPACITY.terminated])) },
    lit: ['hp'],
    enter(s) { faces(s, '/var/log', 'stays on Node-1'); },
    // `fill` is stated because the hand-written fades took the WAAPI default of none where F.fade
    // defaults to both. The static opacity above is what holds the ghost, not the fill.
    flow: GONE.map(target => F.fade({ target, to: OPACITY.terminated, dur: FADE.out, fill: 'none' })),
  },
  {
    id: 'security',
    duration: 3000,
    narration: 'Point a hostPath at a sensitive path and the risk is plain. Mounting the host root or the container runtime socket gives the Pod control of the Node itself, a container escape. This is why the Baseline and Restricted Pod Security Standards forbid hostPath outright.',
    chipsCued: { hostChip: 'mounts / (root)', livesChip: 'on the node', expChip: 'the whole node' },
    opacity: STACK_UP,
    lit: ['appBox'],
    // The cylinder now stands for the host root, and the reach into it is what the ball carries.
    enter(s) { faces(s, 'host /', 'hands over the node'); },
    // The Pod reaches down into the host root: a pod-to-infra hop, so the shell pulses first and
    // the ball leaves at afterPulse.
    flow: [
      F.pulse({ pod: 'pod' }),
      F.route({ points: LANE_WRITE, delay: BEAT.afterPulse, lights: ['hp'] }),
      F.tag({ text: 'full node access', points: LANE_WRITE, delay: BEAT.afterPulse }),
    ],
  },
  {
    id: 'bridge',
    duration: 3000,
    narration: 'Used narrowly, hostPath is right: a Node agent in a DaemonSet reading /var/log or /proc genuinely needs the host. For an ordinary Pod that wants node-local storage to survive a reschedule, the portable answer is a local PersistentVolume, whose node affinity keeps the Pod pinned to its data. That is where the rest of this category begins.',
    chipsCued: { hostChip: 'for node agents', livesChip: 'on the node', expChip: 'one directory' },
    opacity: STACK_UP,
    lit: ['hp'],
    enter(s) { faces(s, '/var/log', 'the node filesystem'); },
    // The agent reads the node logs: an infra-to-pod hop, so the ball leaves first and the shell
    // pulses when it arrives.
    flow: [
      F.route({ points: LANE_READ, name: 'read', lights: ['sideBox'] }),
      F.tag({ text: 'reads node logs', points: LANE_READ }),
      F.pulse({ pod: 'pod', at: 'read' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
