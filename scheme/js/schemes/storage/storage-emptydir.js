import { P, F, defineCard, setCylinderLabel, BEAT, OPACITY } from './storage-kit.js';
import { path } from '../../lib/svg.js';
// Design notes for this card: ./CARDS.md#storage-emptydir


const NODE_X = 180, NODE_Y = 170, NODE_W = 840, NODE_H = 380;   // 180..1020, center 600, bottom 550

const POD_X = 300, POD_Y = 186, POD_W = 600, POD_H = 170;       // 300..900, center 600
const POD_BOTTOM = POD_Y + POD_H;                               // 356

const C_Y = 232, C_W = 190, C_H = 84;                           // container row (volume-model grid)
const C_BOTTOM = C_Y + C_H;                                     // 316
const APP_X = 330,  APP_CX = APP_X + C_W / 2;                   // 330..520, center 425
const SIDE_X = 680, SIDE_CX = SIDE_X + C_W / 2;                 // 680..870, center 775

// The disk is the volume-model cylinder verbatim (260x104 centered on 600) so the two foundation
// cards read as one family.
const ED_X = 470, ED_Y = 408, ED_W = 260, ED_H = 104;           // 470..730, center 600, bottom 512
const ED_TOP = ED_Y;
const ED_MY = ED_Y + ED_H / 2;                                  // 460, where the lanes meet the sides

const SPINE_X = 600;
const DISK_LBL_Y = 530;
const CHIPS_Y = 566;

// Each lane is one L-shaped polyline shared by its static pathArrow and its ball, written in its
// one traffic direction so the arrowhead lands at the receiving end.
const LANE_WRITE = [[APP_CX, C_BOTTOM], [APP_CX, ED_MY], [ED_X, ED_MY]];              // app -> disk
const LANE_READ  = [[ED_X + ED_W, ED_MY], [SIDE_CX, ED_MY], [SIDE_CX, C_BOTTOM]];     // disk -> worker

// The identity spine: the directory is owned by this Pod. Nothing travels it, so dim, no head, and
// no part kind emits it: P.lane adds a marker and P.relation adds the relation class and the role.
const spine = () => path({
  class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-storage scheme-arrow-dim',
  d: `M ${SPINE_X} ${POD_BOTTOM} L ${SPINE_X} ${ED_TOP}`,
  'stroke-dasharray': '5 5',
  fill: 'none',
});

// A container is a box inside a bare g so it can be highlighted on its own. It is NEVER pulsed and
// never lit as an inner box (STO.C-02): the Pod carries the pulse for everything in it.
const container = (key, x, label, sublabel) => P.group({
  key: `${key}C`,
  parts: [P.box({ key: `${key}Box`, x, y: C_Y, w: C_W, h: C_H, label, sublabel })],
});

// The list order IS the append order, which is the z-order: the node, then the Pod and the disk,
// then the spine and the lanes and the shelf caption above them, then the chips, then the packets.
export const SCENE = {
  'aria-label': 'emptyDir lifecycle: an emptyDir is created empty when the Pod is assigned to a Node, lives on that Node disk, and is shared by every container in the Pod. It survives a container crash but is deleted forever when the Pod is removed from the Node. With medium Memory it is backed by tmpfs that counts against the memory limit, where a sizeLimit sizes the tmpfs itself so a write past it fails, while on the Node disk an exceeded sizeLimit gets the Pod evicted.',
  parts: [
    P.defs(),
    P.node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.group({
      key: 'pod',
      parts: [
        // No `inner`: the two containers are peers below, so the Pod part is the shell alone and
        // the wrap it comes in IS shellWrap. The pulse takes `pod`, so they blink with it.
        P.pod({ key: 'shellWrap', x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'volumes: scratch (emptyDir)', containers: 0 }),
        container('app', APP_X, 'app', 'writes /cache'),
        container('side', SIDE_X, 'Worker', 'reads /cache'),
      ],
    }),
    // Label re-centered on the visible front face (below the cap ellipse), the family standard
    // shared with volume-model and container-filesystem.
    P.cylinder({ key: 'ed', x: ED_X, y: ED_Y, w: ED_W, h: ED_H, label: 'emptyDir', labelY: ED_H / 2 + 12 }),
    P.raw({ key: 'spine', make: spine }),
    // One directed lane per container, each with an arrowhead for its one direction: the app
    // writes into the cylinder side, the worker reads out of the far side.
    P.lane({ key: 'wWrite', points: LANE_WRITE, dashed: true, dim: true }),
    P.lane({ key: 'wRead', points: LANE_READ, dashed: true, dim: true }),
    P.tag({ key: 'diskLbl', x: 600, y: DISK_LBL_Y, text: 'on the node disk' }),
    // The chip strip spans exactly the node width (180..1020) so the column reads as one block,
    // and all three chips share one size: 3x270 + 2x15 = 840.
    P.chip({ key: 'edChip', x: 180, y: CHIPS_Y, w: 270, h: 34, name: 'emptyDir', value: 'empty' }),
    P.chip({ key: 'mediumChip', x: 465, y: CHIPS_Y, w: 270, h: 34, name: 'medium', value: 'node disk' }),
    P.chip({ key: 'limitChip', x: 750, y: CHIPS_Y, w: 270, h: 34, name: 'sizeLimit', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: ['appBox', 'sideBox', 'ed', 'edChip', 'mediumChip', 'limitChip'],
    pods: ['shellWrap', 'appC', 'sideC'],
  },
};

// The two faces of the disk: the cylinder label and the shelf caption under it. NO field writes
// either one, `labels:` goes through setBoxLabel and queries .scheme-box-label, and a free <text>
// lands in the main ref bucket, so both are stated on every step as the per-step state they are.
const faces = (s, cyl, shelf) => { setCylinderLabel(s.refs.ed, cyl); s.refs.diskLbl.textContent = shelf; };

// STO.S-01 as a field: the dies step ghosts the Pod, the spine, the lanes and the shelf caption,
// so every other step states them at full. `ed` is deliberately absent, because the legacy
// prologue never pinned it either and only the three steps that write it carry it.
const STACK_UP = { pod: 1, appC: 1, sideC: 1, spine: 1, wWrite: 1, wRead: 1, diskLbl: 1 };
const GONE = ['pod', 'ed', 'spine', 'wWrite', 'wRead', 'diskLbl'];

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: { edChip: 'empty', mediumChip: 'node disk', limitChip: 'none' },
    opacity: STACK_UP,
    enter(s) { faces(s, 'emptyDir', 'on the node disk'); },
  },
  {
    id: 'create',
    duration: 2400,
    narration: 'The moment the Pod is placed on Node-1, an empty directory is created for it on the Node disk. There is nothing to provision and nothing to bind, the directory simply appears, owned by this one Pod.',
    chipsCued: { edChip: 'created empty', mediumChip: 'node disk', limitChip: 'none' },
    opacity: STACK_UP,
    // The step is told by the highlight and the chips: the disk lights as the thing kubelet
    // just created, the shell pulses in the same beat. No materialize animation.
    lit: ['ed'],
    enter(s) { faces(s, 'emptyDir', 'on the node disk'); },
    flow: [F.pulse({ pod: 'pod' })],
  },
  {
    id: 'shared',
    duration: 3800,
    narration: 'Every container in the Pod mounts the same emptyDir, so it is a shared scratch space. The app writes a chunk under /cache and the worker reads it straight back. And because the directory is tied to the Pod rather than to a container, a container crash and restart leaves it untouched.',
    chipsCued: { edChip: 'shared scratch', mediumChip: 'node disk', limitChip: 'none' },
    opacity: { ...STACK_UP, ed: 1 },
    // The app container is the writer and is lit at entry. The directory and the worker box are
    // both receivers, so each lights as its own ball lands, and the pulse fires on the same beat.
    lit: ['appBox'],
    enter(s) { faces(s, 'emptyDir', 'on the node disk'); },
    // The app writes down its lane into the cylinder side, then the worker reads the same bytes
    // out of the far side and up its own lane: two mirrored one-way hops. The disk cue is its OWN
    // entry because the hand-written step emitted it after the tag, and that order is observable.
    flow: [
      F.pulse({ pod: 'pod' }),
      F.route({ points: LANE_WRITE, delay: BEAT.afterPulse, name: 'write' }),
      F.tag({ text: 'write /cache', points: LANE_WRITE, delay: BEAT.afterPulse }),
      F.light({ targets: ['ed'], at: 'write' }),
      F.route({ points: LANE_READ, after: 'write', lights: ['sideBox'] }),
      F.tag({ text: 'read /cache', points: LANE_READ, after: 'write' }),
    ],
  },
  {
    id: 'dies',
    duration: 2600,
    narration: 'When the Pod is removed from the Node the emptyDir is deleted forever, and the diagram dims them out together: nothing of the Pod or its directory stays on the Node. A container crash it survives, a Pod deletion it does not. That single rule is the whole lifecycle of an emptyDir.',
    chipsCued: { edChip: 'deleted forever', mediumChip: 'node disk', limitChip: 'none' },
    opacity: { ...STACK_UP, ...Object.fromEntries(GONE.map(k => [k, OPACITY.terminated])) },
    enter(s) { faces(s, 'emptyDir', 'on the node disk'); },
    // 900 is this card's own fade, not FADE.out, and `fill` is stated because the hand-written
    // fades took the WAAPI default of none where F.fade defaults to both. The static opacity above
    // is what holds the ghost, not the fill.
    flow: GONE.map(target => F.fade({ target, to: OPACITY.terminated, dur: 900, fill: 'none' })),
  },
  {
    id: 'memory',
    duration: 3000,
    narration: 'Set medium to Memory and the same emptyDir is backed by a tmpfs instead of the Node disk. Reads and writes are fast, but every byte counts against the Pod memory limit, and filling it can get the Pod OOM-killed the way a heap leak would.',
    // No sizeLimit is set in this scenario, so that chip stays none: chips report state, not
    // trivia. The 512Mi cap belongs to the next step only.
    chipsCued: { edChip: 'backed by RAM', mediumChip: 'Memory (tmpfs)', limitChip: 'none' },
    opacity: { ...STACK_UP, ed: 1 },
    // The app writes and the tmpfs receives: both light at entry, the shell pulses same beat.
    lit: ['appBox'],
    // With medium Memory the directory is NOT on the node disk, the shelf label must not lie.
    enter(s) { faces(s, 'emptyDir tmpfs', 'tmpfs in RAM'); },
    flow: [
      F.pulse({ pod: 'pod' }),
      F.route({ points: LANE_WRITE, delay: BEAT.afterPulse, lights: ['ed'] }),
      F.tag({ text: 'held in RAM', points: LANE_WRITE, delay: BEAT.afterPulse }),
    ],
  },
  {
    id: 'sizelimit',
    duration: 3600,
    narration: 'A sizeLimit caps how large the emptyDir may grow. On the Node disk, writing past the limit gets the Pod evicted rather than left to fill the disk, while on tmpfs the limit sizes the filesystem itself and the write fails instead. Either way an unbounded emptyDir is a way to lose the Pod.',
    chipsCued: { edChip: 'over limit', mediumChip: 'node disk', limitChip: '512Mi, evicted' },
    opacity: { ...STACK_UP, ed: 1 },
    // The app writes past the cap into the disk: both light at entry, the shell pulses same
    // beat. The eviction itself is told by the chips (512Mi, evicted), no fade on this step.
    lit: ['appBox'],
    enter(s) { faces(s, 'emptyDir', 'on the node disk'); },
    flow: [
      F.pulse({ pod: 'pod' }),
      F.route({ points: LANE_WRITE, delay: BEAT.afterPulse, lights: ['ed'] }),
      F.tag({ text: 'over 512Mi', points: LANE_WRITE, delay: BEAT.afterPulse }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
