import { P, F, defineCard, BEAT, FADE, OPACITY } from './storage-kit.js';
import { path } from '../../lib/svg.js';
// Design notes for this card: ./CARDS.md#storage-volume-model


const SPINE_X = 600;

const POD_X = 300, POD_Y = 150, POD_W = 600, POD_H = 170;  // 300..900, center 600
const POD_BOTTOM = POD_Y + POD_H;                          // 320

const C_Y = 196, C_W = 190, C_H = 84;                      // container row
const C_BOTTOM = C_Y + C_H;                                // 280
const APP_X = 330,  APP_CX = APP_X + C_W / 2;              // 330..520, center 425
const SIDE_X = 680, SIDE_CX = SIDE_X + C_W / 2;            // 680..870, center 775

const VOL_X = 470, VOL_Y = 452, VOL_W = 260, VOL_H = 104;  // 470..730, center 600
const VOL_TOP = VOL_Y;                                     // 452
const VOL_MY = VOL_Y + VOL_H / 2;                          // 504, where the lanes enter the sides
const CHIPS_Y = 596;

const LANE_DX = 10, LANE_DY = 10;
const LANE_APP_UP    = [[VOL_X, VOL_MY - LANE_DY], [APP_CX + LANE_DX, VOL_MY - LANE_DY], [APP_CX + LANE_DX, C_BOTTOM]];
const LANE_APP_DOWN  = [[APP_CX - LANE_DX, C_BOTTOM], [APP_CX - LANE_DX, VOL_MY + LANE_DY], [VOL_X, VOL_MY + LANE_DY]];
const LANE_SIDE_UP   = [[VOL_X + VOL_W, VOL_MY - LANE_DY], [SIDE_CX - LANE_DX, VOL_MY - LANE_DY], [SIDE_CX - LANE_DX, C_BOTTOM]];
const LANE_SIDE_DOWN = [[SIDE_CX + LANE_DX, C_BOTTOM], [SIDE_CX + LANE_DX, VOL_MY + LANE_DY], [VOL_X + VOL_W, VOL_MY + LANE_DY]];

// The identity spine is the ONE element no part kind emits: it is a dashed category-coloured path
// with NO arrowhead and NO data-role, where P.lane adds a marker and P.relation adds both the
// relation class and the role attribute. STO.A-01 is the reason it must stay markerless.
const spine = () => path({
  class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-storage scheme-arrow-dim',
  d: `M ${SPINE_X} ${POD_BOTTOM} L ${SPINE_X} ${VOL_TOP}`,
  'stroke-dasharray': '5 5',
  fill: 'none',
});

// A container is a box inside a bare g so it can be highlighted and faded on its own. It is NEVER
// pulsed and never lit as an inner box (STO.C-02): the Pod carries the pulse for everything in it.
const container = (key, x, label, sublabel) => P.group({
  key: `${key}C`,
  parts: [P.box({ key: `${key}Box`, x, y: C_Y, w: C_W, h: C_H, label, sublabel })],
});

// The list order IS the append order, which is the z-order: the Pod and the disk, then the spine
// and the mount lanes and their caption above them, then the chip strip, then the packet layer.
export const SCENE = {
  'aria-label': 'Pod volume model: a volume is declared once at Pod level under spec.volumes and each container mounts it at volumeMounts, possibly at a different path. The volume belongs to the Pod, so a write by one container is seen by the other, it survives a container crash and restart, and an ephemeral volume like this one is deleted only when the Pod itself is deleted.',
  parts: [
    P.defs(),
    P.group({
      key: 'pod',
      parts: [
        // No `inner`: the two containers are peers below, so the Pod part is the shell alone and
        // the wrap it comes in IS shellWrap. The pulse takes `pod`, so they blink with it.
        P.pod({ key: 'shellWrap', x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'spec.volumes: cache', containers: 0 }),
        container('app', APP_X, 'app', 'mounts cache at /data'),
        container('side', SIDE_X, 'Log-shipper', 'mounts cache at /backup'),
      ],
    }),
    // The primitive centers the label on the raw bbox, which reads high because the top cap
    // ellipse is not part of the visible front face. Re-center on the face (below the cap).
    P.cylinder({ key: 'volume', x: VOL_X, y: VOL_Y, w: VOL_W, h: VOL_H, label: 'Volume cache', labelY: VOL_H / 2 + 12 }),
    P.raw({ key: 'spine', make: spine }),
    // Two one-way lanes per side, each with an arrowhead for its direction, the pair centered on
    // its container and entering / leaving the cylinder through its sides.
    P.lane({ key: 'wAppUp', points: LANE_APP_UP, dashed: true, dim: true }),
    P.lane({ key: 'wAppDown', points: LANE_APP_DOWN, dashed: true, dim: true }),
    P.lane({ key: 'wSideUp', points: LANE_SIDE_UP, dashed: true, dim: true }),
    // The sidecar READS, so the write half of its pair never carries anything: it is the mount drawn
    // as a RELATIONSHIP. The app's write lane keeps its arrowhead, because a ball does ride that one.
    P.relation({ key: 'wSideDown', points: LANE_SIDE_DOWN }),
    // Permanent chrome, not a wire: the volume belongs to the Pod on every step, so it is filled
    // once here and stays out of the per-step wire sweep that clearWires runs.
    P.tag({ key: 'ownLbl', x: SPINE_X + 16, y: 374, anchor: 'start', text: 'belongs to Pod' }),
    P.chip({ key: 'volChip', x: 110, y: CHIPS_Y, w: 250, h: 34, name: 'volume', value: 'declared' }),
    P.chip({ key: 'mountChip', x: 380, y: CHIPS_Y, w: 430, h: 34, name: 'mounts', value: 'app /data  log /backup' }),
    P.chip({ key: 'dataChip', x: 830, y: CHIPS_Y, w: 260, h: 34, name: 'data', value: 'empty' }),
    P.packets(),
  ],
  reset: {
    keys: ['appBox', 'sideBox', 'volume', 'volChip', 'mountChip', 'dataChip'],
    pods: ['shellWrap', 'appC', 'sideC'],
  },
};

const MOUNTS = 'app /data  log /backup';

// STO.S-01 as a field: the delete step ghosts the whole stack, so every other step states the whole
// stack at full. Nothing here is inherited from the step before it.
const STACK_UP = {
  pod: 1, appC: 1, sideC: 1, volume: 1,
  spine: 1, wAppUp: 1, wAppDown: 1, wSideUp: 1, wSideDown: 1, ownLbl: 1,
};
const GONE = ['pod', 'volume', 'spine', 'wAppUp', 'wAppDown', 'wSideUp', 'wSideDown', 'ownLbl'];

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: { volChip: 'declared', mountChip: MOUNTS, dataChip: 'empty' },
    opacity: STACK_UP,
  },
  {
    id: 'declare',
    duration: 2200,
    narration: 'The declaration lives at Pod level. The spec.volumes list names the volume once, cache, and that one declaration is what every container in the Pod is allowed to reach. Where each container puts it is a separate decision, taken next, and the volume exists as part of the Pod either way.',
    chipsCued: { volChip: 'declared', mountChip: MOUNTS, dataChip: 'empty' },
    opacity: STACK_UP,
    // The Pod is not acting on this step, so it does not pulse. Only the volume lights.
    lit: ['volume'],
  },
  {
    id: 'mount',
    duration: 2600,
    narration: 'Each container opts in with its own volumeMounts entry and may choose its own path. The app sees the volume at /data and the log shipper sees the very same bytes at /backup. Two mounts, two paths, one underlying volume.',
    chipsCued: { volChip: 'mounted x2', mountChip: MOUNTS, dataChip: 'empty' },
    opacity: STACK_UP,
    // Both containers mount the volume, so all three light for the whole step. The volume is static
    // on both paths; the two boxes are cued by their arrivals, which is what flowLights derives.
    lit: ['volume'],
    // The two mounts leave the volume sides and rise into the containers in lockstep (the lanes
    // are mirror images, so routeDur gives them the same duration). Mounts ride the UP lanes.
    flow: [
      F.pulse({ pod: 'pod' }),
      F.route({ points: LANE_APP_UP, lights: ['appBox'] }),
      F.tag({ text: 'mount at /data', points: LANE_APP_UP }),
      F.route({ points: LANE_SIDE_UP, lights: ['sideBox'] }),
      F.tag({ text: 'mount at /backup', points: LANE_SIDE_UP }),
    ],
  },
  {
    id: 'shared',
    duration: 3400,
    narration: 'Because both containers mount one volume, a write by one is immediately visible to the other. The app writes foo under /data and the log shipper reads it back under /backup. This is how a sidecar shares files with the main container.',
    chipsCued: { volChip: 'mounted x2', mountChip: MOUNTS, dataChip: 'foo written' },
    opacity: STACK_UP,
    // The app container is the writer, so it is lit from entry. The volume takes the write before
    // it can serve the read, so it lights when the ball lands on it, like the sidecar box below.
    lit: ['appBox'],
    // The app write descends its DOWN lane into the volume side, then the log shipper reads the
    // same bytes back out of the far side and up its own UP lane. The volume's cue is its OWN entry
    // because the hand-written step emitted it after the tag, and that order is observable.
    flow: [
      F.pulse({ pod: 'pod' }),
      F.route({ points: LANE_APP_DOWN, delay: BEAT.afterPulse, name: 'write' }),
      F.tag({ text: 'write foo', points: LANE_APP_DOWN, delay: BEAT.afterPulse }),
      F.light({ targets: ['volume'], at: 'write' }),
      F.route({ points: LANE_SIDE_UP, after: 'write', lights: ['sideBox'] }),
      F.tag({ text: 'read foo', points: LANE_SIDE_UP, after: 'write' }),
    ],
  },
  {
    id: 'restart',
    duration: 2800,
    narration: 'The volume outlives a container. When the app container crashes and Kubelet restarts it, the fresh container remounts the same volume and foo is still there. A container is disposable, the Pod volume is not.',
    chipsCued: { volChip: 'survives restart', mountChip: MOUNTS, dataChip: 'foo intact' },
    opacity: STACK_UP,
    lit: ['volume'],
    // The fresh container re-reads foo from the untouched volume, up the app UP lane.
    flow: [
      F.pulse({ pod: 'pod' }),
      F.route({ points: LANE_APP_UP, delay: BEAT.afterPulse, lights: ['appBox'] }),
      F.tag({ text: 'foo still here', points: LANE_APP_UP, delay: BEAT.afterPulse }),
    ],
  },
  {
    id: 'delete',
    duration: 2200,
    narration: 'An ephemeral volume like cache is scoped to the Pod, so it dies with the Pod. Delete the Pod and the volume is gone for good along with everything written to it. To outlive a Pod you need persistent storage, which the rest of this category covers.',
    chipsCued: { volChip: 'gone with Pod', mountChip: 'unmounted', dataChip: 'lost' },
    // The containers keep their own full opacity and ghost with the Pod group that holds them.
    opacity: { ...STACK_UP, ...Object.fromEntries(GONE.map(k => [k, OPACITY.terminated])) },
    // fill is stated: the hand-written fades took the WAAPI default of 'none', where F.fade defaults
    // to 'both'. The static opacity above is what holds the ghost, not the fill.
    flow: GONE.map(target => F.fade({ target, to: OPACITY.terminated, dur: FADE.out, fill: 'none' })),
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
