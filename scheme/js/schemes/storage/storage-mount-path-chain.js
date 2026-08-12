import { P, F, defineCard, chipStrip, BEAT, OPACITY } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-mount-path-chain


const LEFT_X = 400;
const COL_W = 180, COL_GAP = 40;
const CONTENT_W = COL_W * 2 + COL_GAP;                   // 400
const CONTENT_CX = LEFT_X + CONTENT_W / 2;               // 600, the canvas centre, shared by every tier

const L_X = LEFT_X;                                      // 400, the Pod A column
const R_X = LEFT_X + COL_W + COL_GAP;                    // 620, the Pod B column
const L_CX = L_X + COL_W / 2;                            // 490
const R_CX = R_X + COL_W / 2;                            // 710, and (490 + 710) / 2 == CONTENT_CX

const CORRIDOR = 60;                                     // the gap between two tiers, uniform
const POD_H = 116, BIND_H = 64, STG_H = 64, DEV_H = 88;
const DISK_LBL_GAP = 32;                                 // disk bottom to chip strip
const CHIP_H = 34;
// Total ink height, top of the Pods to the bottom of the chip strip.
const STACK_H = POD_H + CORRIDOR + BIND_H + CORRIDOR + STG_H + CORRIDOR + DEV_H + DISK_LBL_GAP + CHIP_H;
const STACK_TOP = (640 - STACK_H) / 2;                   // 31, so the margin is 31 above and below

const POD_Y = STACK_TOP;                                 // 31
const POD_BOTTOM = POD_Y + POD_H;                        // 147
const BIND_Y = POD_BOTTOM + CORRIDOR;                    // 207
const BIND_TOP = BIND_Y, BIND_BOTTOM = BIND_Y + BIND_H;  // 207 / 271
const STG_Y = BIND_BOTTOM + CORRIDOR;                    // 331
const STG_TOP = STG_Y, STG_BOTTOM = STG_Y + STG_H;       // 331 / 395
const DEV_W = 180;
const DEV_X = CONTENT_CX - DEV_W / 2;                    // 510
const DEV_Y = STG_BOTTOM + CORRIDOR, DEV_TOP = DEV_Y;    // 455
const DEV_BOTTOM = DEV_Y + DEV_H;                        // 543

const LBL_POD_Y = POD_BOTTOM + 36;                       // 183, corridor 147..207
const LBL_BIND_Y = BIND_BOTTOM + 36;                     // 307, corridor 271..331
const LBL_DISK_Y = DEV_BOTTOM + 20;                      // 563, corridor 543..575
const CHIPS_Y = DEV_BOTTOM + DISK_LBL_GAP;               // 575

const CHIP_W = 232, CHIP_GAP = 16, CHIP_COUNT = 4;
const STRIP = chipStrip({ cx: CONTENT_CX, w: CHIP_W, gap: CHIP_GAP, count: CHIP_COUNT });   // 112 .. 1088

const lane = (cx, y1, y2) => [[cx, y1], [cx, y2]];

const W_DEV_UP    = lane(CONTENT_CX, DEV_TOP, STG_BOTTOM);       // NodeStage: the one real mount
const W_STG_A_UP  = lane(L_CX, STG_TOP, BIND_BOTTOM);            // NodePublish: bind into Pod A
const W_STG_B_UP  = lane(R_CX, STG_TOP, BIND_BOTTOM);            // NodePublish: bind into Pod B
const W_A_POD_UP  = lane(L_CX, BIND_TOP, POD_BOTTOM);            // runtime maps it to /data
const W_B_POD_UP  = lane(R_CX, BIND_TOP, POD_BOTTOM);
// The write: the same three corridors, reversed. Column B never carries one, so it has no pair.
const W_POD_A_DN  = lane(L_CX, POD_BOTTOM, BIND_TOP);
const W_A_STG_DN  = lane(L_CX, BIND_BOTTOM, STG_TOP);
const W_STG_DEV_DN = lane(CONTENT_CX, STG_BOTTOM, DEV_TOP);

const RIDE_UP = { dy: 18 };      // trailing side of an ascending ball

const podBlock = (key, innerKey, x, label, opacity) => P.pod({
  key, innerKey, opacity, x, y: POD_Y, w: COL_W, h: POD_H, label,
  sublabel: 'uses vol-1 at /data', containers: 0,
  inner: { dx: 14, dy: 40, w: COL_W - 28, h: 50, label: '/data', sublabel: 'mount point' },
});

// The list order IS the append order, which is the z-order: the disk and the blocks, then the Pods,
// then every corridor lane and its caption, then the chip strip, then the packet layer.
export const SCENE = {
  'aria-label': 'Where the bytes land. One attached block device is mounted exactly once on the Node, at a global staging path under the Kubelet plugins directory. That single staged filesystem is then bind-mounted into a directory that belongs to one Pod alone, under the Kubelet Pods directory and the Pod uid, and the container runtime maps that directory to slash data inside the container. A second Pod on the same Node gets its own directory and its own bind mount off the same staging path, so two Pods share one disk through two separate bind mounts with no second attach and no second filesystem mount. A write to slash data descends the same chain, through the bind mount into the staging mount and onto the device, with no copy made at any hop.',
  parts: [
    P.defs(),
    // cylinder() centres its label on the raw bbox, which reads high because the top cap is not part
    // of the visible face. Re-centre on the face, derived from the height rather than typed.
    P.cylinder({ key: 'dev', x: DEV_X, y: DEV_Y, w: DEV_W, h: DEV_H, label: '/dev/nvme1n1', labelY: DEV_H / 2 + 10 }),
    P.box({
      key: 'stg', x: LEFT_X, y: STG_Y, w: CONTENT_W, h: STG_H,
      label: 'Global staging mount', sublabel: '/plugins/.../csi/vol-1/globalmount',
    }),
    P.box({ key: 'bindA', x: L_X, y: BIND_Y, w: COL_W, h: BIND_H, label: 'Pod A bind mount', sublabel: '/pods/uid-a/volumes/vol-1' }),
    // Pod B and its half of the chain are held back and revealed when the card first claims them.
    P.box({ key: 'bindB', x: R_X, y: BIND_Y, w: COL_W, h: BIND_H, label: 'Pod B bind mount', sublabel: '/pods/uid-b/volumes/vol-1', opacity: 0 }),
    podBlock('podA', 'ctrA', L_X, 'Pod A'),
    podBlock('podB', 'ctrB', R_X, 'Pod B', 0),
    P.lane({ key: 'wDevUp', points: W_DEV_UP, dashed: true, dim: true }),
    P.lane({ key: 'wStgAUp', points: W_STG_A_UP, dashed: true, dim: true }),
    P.lane({ key: 'wAPodUp', points: W_A_POD_UP, dashed: true, dim: true }),
    P.lane({ key: 'wStgBUp', points: W_STG_B_UP, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wBPodUp', points: W_B_POD_UP, dashed: true, dim: true, opacity: 0 }),
    // Each descent arrow is the reversed twin of a mount arrow and only ever REPLACES it, so all
    // three start hidden and are crossfaded in one corridor at a time.
    P.lane({ key: 'wPodADn', points: W_POD_A_DN, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wAStgDn', points: W_A_STG_DN, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wStgDevDn', points: W_STG_DEV_DN, dashed: true, dim: true, opacity: 0 }),
    P.wire({ key: 'pod', x: CONTENT_CX, y: LBL_POD_Y }),
    P.wire({ key: 'bind', x: CONTENT_CX, y: LBL_BIND_Y }),
    P.wire({ key: 'disk', x: CONTENT_CX, y: LBL_DISK_Y }),
    P.chip({ key: 'devChip', x: STRIP.x(0), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'device', value: '/dev/nvme1n1' }),
    P.chip({ key: 'mountChip', x: STRIP.x(1), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'disk mounted', value: 'not yet' }),
    P.chip({ key: 'bindChip', x: STRIP.x(2), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'bind mounts', value: 'none' }),
    P.chip({ key: 'copyChip', x: STRIP.x(3), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'data copies', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: ['bindA', 'bindB', 'stg', 'dev', 'devChip', 'mountChip', 'bindChip', 'copyChip'],
    pods: ['podA', 'podB'],
  },
};

// Two of the four never change on purpose: the device is the fixed bottom of the chain, and
// `data copies: none` holding from the first step to the last IS the claim the card makes.
const chips = (mounted, binds) => ({
  devChip: '/dev/nvme1n1', mountChip: mounted, bindChip: binds, copyChip: 'none',
});

// STO.S-01 as a field: every step pins the whole skeleton, Pod B's half included, so a prev/reset
// replay lands on the right one and a cancel mid-flight cannot strand a lane. Mount and descent are
// mutually exclusive rather than independently toggled, which is the whole point of the pairing.
const stage = ({ podB = 0, binds = 0, descent = 0, podA = 1 } = {}) => ({
  podA, podB, bindB: binds, wStgBUp: binds, wBPodUp: binds,
  wDevUp: descent ? 0 : 1, wStgAUp: descent ? 0 : 1, wAPodUp: descent ? 0 : 1,
  wPodADn: descent, wAStgDn: descent, wStgDevDn: descent,
});

// A corridor turns around just before its ball uses it: the mount arrow fades out and its reversed
// twin fades in over the same 300ms on the same centre line, so it reads as a ROTATION. The static
// opacity above already holds the descent end-state, so `rewind` is what puts the pair back to the
// mount state for the animated path alone, and under ctx.reduced it simply snaps.
const flip = (up, dn, when) => [
  F.fade({ target: up, from: 1, to: 0, dur: 300, ...when, fill: 'forwards', easing: 'ease-in' }),
  F.fade({ target: dn, from: 0, to: 1, dur: 300, ...when, fill: 'forwards', easing: 'ease-out' }),
];

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('not yet', 'none'),
    wires: { disk: 'attached to node-1' },
    opacity: stage({ podA: OPACITY.pending }),
  },
  {
    id: 'stage',
    duration: 2600,
    narration: 'The device is mounted exactly once, at a global staging path under the Kubelet plugins directory. This is the only place the filesystem itself is mounted on the Node. Everything above this point is not another mount of the disk, it is a view onto this one.',
    chipsCued: chips('once', 'none'),
    wires: { disk: 'mounted once, here' },
    opacity: stage({ podA: OPACITY.pending }),
    lit: ['dev'],
    // No Pod is involved in NodeStage, so nothing pulses: the ball leaves after BEAT.lead so the
    // lit device registers as the source before it departs, and the staging mount lights on arrival.
    flow: [
      F.route({ points: W_DEV_UP, delay: BEAT.lead, name: 'stage' }),
      F.tag({ text: 'NodeStage', points: W_DEV_UP, delay: BEAT.lead, ...RIDE_UP }),
      F.light({ targets: ['stg'], at: 'stage' }),
    ],
  },
  {
    id: 'bind',
    duration: 2800,
    narration: 'NodePublish does not touch the disk again. It bind-mounts the staged directory into a directory that belongs to Pod A alone, under /var/lib/kubelet/pods and the Pod uid. A bind mount is a second doorway onto the exact same files, not a copy.',
    chipsCued: chips('once', 'Pod A'),
    wires: { bind: 'NodePublish: bind mount', disk: 'still mounted once' },
    opacity: stage({ podA: OPACITY.pending }),
    lit: ['stg'],
    flow: [
      F.route({ points: W_STG_A_UP, delay: BEAT.lead, name: 'bind' }),
      F.tag({ text: 'bind', points: W_STG_A_UP, delay: BEAT.lead, ...RIDE_UP }),
      F.light({ targets: ['bindA'], at: 'bind' }),
    ],
  },
  {
    id: 'surface',
    duration: 3000,
    narration: 'That per-Pod directory is what the container runtime maps to /data inside Pod A. From the container it looks like a plain folder. Underneath, it is a bind mount of a bind mount of one staged device. Pod A can now read and write.',
    chipsCued: chips('once', 'Pod A'),
    wires: { pod: 'the runtime maps it' },
    opacity: stage(),                                   // Pod A comes up to full opacity here
    lit: ['bindA'],
    // Infrastructure reaching a Pod is down-arrow ordering: the ball flies first, and Pod A is held
    // dim until the volume actually surfaces inside it, then faded up in step with its own pulse.
    rewind: { opacity: { podA: OPACITY.pending } },
    flow: [
      F.route({ points: W_A_POD_UP, name: 'surface' }),
      F.tag({ text: 'mount /data', points: W_A_POD_UP, ...RIDE_UP }),
      F.fade({ target: 'podA', from: OPACITY.pending, to: 1, dur: 500, at: 'surface', fill: 'forwards', easing: 'ease-out' }),
      F.pulse({ pod: 'podA', at: 'surface' }),
    ],
  },
  {
    id: 'second',
    duration: 3600,
    narration: 'A second Pod on the same Node gets its own directory and its own bind mount off the same global staging path. The disk is not attached twice and not staged twice. Two Pods, two bind mounts, one device underneath. That is how a single disk is shared across Pods on a Node.',
    chipsCued: chips('once', 'Pod A and Pod B'),
    wires: { bind: 'a second bind mount', disk: 'still mounted once' },
    opacity: stage({ podB: 1, binds: 1 }),
    lit: ['stg', 'bindA'],
    rewind: { opacity: { podB: 0 } },
    // The Pod B column materializes as the chain claims it: its lanes and bind box first, then the
    // Pod itself once the bind mount has landed under it.
    flow: [
      F.reveal({ target: 'wStgBUp', delay: 1 }),
      F.reveal({ target: 'wBPodUp', delay: 1 }),
      F.reveal({ target: 'bindB', delay: 1 }),
      F.route({ points: W_STG_B_UP, delay: BEAT.lead, name: 'bind' }),
      F.tag({ text: 'bind', points: W_STG_B_UP, delay: BEAT.lead, ...RIDE_UP }),
      F.light({ targets: ['bindB'], at: 'bind' }),
      F.route({ points: W_B_POD_UP, after: 'bind', name: 'surface' }),
      F.tag({ text: 'mount /data', points: W_B_POD_UP, after: 'bind', ...RIDE_UP }),
      F.fade({ target: 'podB', from: 0, to: 1, dur: 500, at: 'bind', fill: 'forwards', easing: 'ease-out' }),
      F.pulse({ pod: 'podB', at: 'surface' }),
    ],
  },
  {
    id: 'write',
    duration: 4400,
    narration: 'Follow a write the other way. Pod A writes to /data, and the bytes pass down through its bind mount, into the global staging mount, and onto the device. No copy is made at any hop. All the mounts are windows onto the same blocks on the same disk.',
    chipsCued: chips('once', 'Pod A and Pod B'),
    wires: { pod: 'same files, no copy', disk: 'the bytes land here' },
    opacity: stage({ podB: 1, binds: 1, descent: 1 }),
    // No `lit`: the static end-state is the WHOLE CHAIN lit, and all three of those blocks earn it
    // from an arrival, so flowLights re-derives exactly bindA, stg, dev for the reduced path.
    rewind: { opacity: { wAPodUp: 1, wPodADn: 0, wStgAUp: 1, wAStgDn: 0, wDevUp: 1, wStgDevDn: 0 } },
    // Pod A is the WRITER, so up-arrow ordering applies: the Pod blinks first and the write leaves at
    // BEAT.afterPulse. Each hop chains off the previous hop's real arrival.
    flow: [
      F.pulse({ pod: 'podA' }),
      ...flip('wAPodUp', 'wPodADn', { delay: 1 }),
      F.route({ points: W_POD_A_DN, delay: BEAT.afterPulse, name: 'h1' }),
      F.tag({ text: 'write', points: W_POD_A_DN, delay: BEAT.afterPulse }),
      F.light({ targets: ['bindA'], at: 'h1' }),
      ...flip('wStgAUp', 'wAStgDn', { at: 'h1' }),
      F.route({ points: W_A_STG_DN, after: 'h1', name: 'h2' }),
      F.tag({ text: 'same blocks', points: W_A_STG_DN, after: 'h1' }),
      F.light({ targets: ['stg'], at: 'h2' }),
      ...flip('wDevUp', 'wStgDevDn', { at: 'h2' }),
      F.route({ points: W_STG_DEV_DN, after: 'h2', name: 'h3' }),
      F.tag({ text: 'bytes land', points: W_STG_DEV_DN, after: 'h2' }),
      F.light({ targets: ['dev'], at: 'h3' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
