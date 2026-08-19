import { P, F, defineCard, OPACITY, chipStrip } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-configmap-secret-mount


const POD_X = 330, POD_Y = 56, POD_W = 540, POD_H = 120;        // 330..870, center 600
const POD_BOTTOM = POD_Y + POD_H;                               // 176
const APP_BX = 470, APP_BY = 90, APP_BW = 260, APP_BH = 56;     // inner app box, centered in the Pod

const VOL_X = 330, VOL_Y = 268, VOL_W = 540, VOL_H = 194;       // 330..870, bottom 462
const DATA_X = 510, DATA_Y = 300, DATA_W = 180, DATA_H = 48;    // ..data, center 600, bottom 348
const DATA_CX = 600;
const SYM_Y = DATA_Y + DATA_H / 2;                              // 324, the symlink pointer height

const DIR_Y = 380, DIR_W = 200, DIR_H = 64;                     // dir slot row, bottom 444
const DIR_BOTTOM = DIR_Y + DIR_H;
const OLD_X = 360, OLD_CX = 460;                                // v1 slot, 360..560
const NEW_X = 640, NEW_CX = 740;                                // v2 slot, 640..840

const KUBE_X = 430, KUBE_Y = 500, KUBE_W = 340, KUBE_H = 64;    // 430..770, center 600
const CM_X = 110, SEC_X = 890, SRC_Y = 500, SRC_W = 200, SRC_H = 64; // mirrored about 600
const SRC_MY = SRC_Y + SRC_H / 2;                               // 532, the source lane height

const CHIPS_Y = 594, CHIP_H = 34;
const CHIPS = chipStrip({ w: 320, gap: 20, count: 3 });         // 100 / 440 / 780

// Each static wire and its ball share one array. Every lane is a single straight segment.
const W_CM_READ   = [[CM_X + SRC_W, SRC_MY], [KUBE_X, SRC_MY]];          // ConfigMap -> kubelet
const W_SEC_READ  = [[SEC_X, SRC_MY], [KUBE_X + KUBE_W, SRC_MY]];        // Secret -> kubelet
const W_WRITE_OLD = [[OLD_CX, KUBE_Y], [OLD_CX, DIR_BOTTOM]];            // kubelet -> v1 dir
const W_WRITE_NEW = [[NEW_CX, KUBE_Y], [NEW_CX, DIR_BOTTOM]];            // kubelet -> v2 dir
const W_APP_READ  = [[DATA_CX, VOL_Y], [DATA_CX, POD_BOTTOM]];           // volume -> Pod (the spine)
// The subPath read leaves the v1 dir on its own centre line so it visibly misses ..data, then steps
// into the Pod-to-volume corridor and enters the Pod beside the spine rather than out at its corner.
const GAP_MY = (POD_BOTTOM + VOL_Y) / 2;                                 // 222
const SUB_IN_X = DATA_CX - 60;                                           // 540
const W_SUBPATH   = [[OLD_CX, DIR_Y], [OLD_CX, GAP_MY], [SUB_IN_X, GAP_MY], [SUB_IN_X, POD_BOTTOM]];

// The spine ends on the Pod floor, where the default -14 prints the tag over the mounts /etc/config
// sublabel. Riding 10 BELOW the ball parts the two, and clears the volume title under the start.
const READ_TAG_DY = 10;
// Only the sync step carries the clock caption, which starts at x 618 and takes 15 units of the tag
// as it climbs past: -20 is what its widest measured half needs to clear that caption.
const SYNC_TAG_DX = -20;
// The source lanes run through the middle of two 64-tall boxes, so a tag riding above the ball has to
// clear their tops: -36 is the least that does, measured on all four viewports.
const SRC_TAG_DY = -36;

const SYM_OLD = [[DATA_X, SYM_Y], [OLD_CX, SYM_Y], [OLD_CX, DIR_Y]];
const SYM_NEW = [[DATA_X + DATA_W, SYM_Y], [NEW_CX, SYM_Y], [NEW_CX, DIR_Y]];

// Nudge the mounts /etc/config sublabel up 2px off the pod bottom edge: an ATTRIBUTE, which no
// field writes.
const nudgeSublabel = (el) => {
  const sub = el.querySelector('.scheme-pod-sublabel');
  if (sub) sub.setAttribute('y', String(POD_H - 10));
};
// The volume frame is a washed container rather than an outlined block, and `fill` is likewise
// nothing any field reaches.
const washFrame = (el) => { el.querySelector('.scheme-box-rect').style.fill = 'rgba(255, 255, 255, 0.02)'; };

// Z-order (bottom -> top): the volume container, then blocks, then symlink lines and wires and
// labels above them, then the chip strip, then the packet layer so every ball rides above.
export const SCENE = {
  'aria-label': 'ConfigMap and Secret as files: each key becomes a file in the mounted directory. Kubelet writes the keys into a timestamped directory and points a ..data symlink at it, and on update it writes a new directory then flips the symlink atomically, so a reader never sees a half-written config. Updates arrive on the Kubelet sync period, a subPath mount opts out of the swap and never updates, and Secrets default to tmpfs.',
  parts: [
    P.defs(),
    // The mounted volume directory, named by a title centered on its top band. The title sits
    // between the two inner lanes (x=460 and x=600 never cross it) and above ..data.
    P.box({ x: VOL_X, y: VOL_Y, w: VOL_W, h: VOL_H, label: '', sublabel: '', tune: washFrame }),
    // shellWrap is the handle for code that wants the shell alone. The PULSE is not that:
    // it takes the whole Pod group, so the app box blinks with the Pod it belongs to.
    P.group({
      key: 'pod',
      parts: [
        P.pod({ key: 'shellWrap', x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod api-0', sublabel: 'mounts /etc/config', containers: 0, tune: nudgeSublabel }),
        P.box({ key: 'appBox', x: APP_BX, y: APP_BY, w: APP_BW, h: APP_BH, label: 'app', sublabel: 'reads /etc/config/app.conf' }),
      ],
    }),
    P.box({ key: 'dataLink', x: DATA_X, y: DATA_Y, w: DATA_W, h: DATA_H, label: '..data', sublabel: 'symlink' }),
    P.box({ key: 'dirOld', x: OLD_X, y: DIR_Y, w: DIR_W, h: DIR_H, label: '..2026_07_10', sublabel: 'app.conf v1' }),
    P.box({ key: 'dirNew', x: NEW_X, y: DIR_Y, w: DIR_W, h: DIR_H, label: '..2026_07_15', sublabel: 'app.conf v2', opacity: 0 }),
    // The source row: kubelet centered, fed from both sides.
    P.box({ key: 'kubelet', x: KUBE_X, y: KUBE_Y, w: KUBE_W, h: KUBE_H, label: 'Kubelet', sublabel: 'sync loop' }),
    P.box({ key: 'cm', x: CM_X, y: SRC_Y, w: SRC_W, h: SRC_H, label: 'ConfigMap app', sublabel: 'key: app.conf' }),
    P.box({ key: 'sec', x: SEC_X, y: SRC_Y, w: SRC_W, h: SRC_H, label: 'Secret TLS', sublabel: 'on tmpfs', opacity: OPACITY.notready }),
    // Symlink pointers: relationships, not traffic, so relationPath rather than a stripped pathArrow.
    // Only one is ever visible at a time, that is the whole flip.
    P.relation({ key: 'symOld', points: SYM_OLD }),
    P.relation({ key: 'symNew', points: SYM_NEW, opacity: 0 }),
    P.lane({ points: W_CM_READ, dashed: true, dim: true }),
    // Keyed because the Secret is a ghost until its own step, and its read lane is the Secret: an
    // arrowhead at full strength out of a dimmed block reads as traffic that block is not carrying.
    P.lane({ key: 'wSecRead', points: W_SEC_READ, dashed: true, dim: true }),
    P.lane({ points: W_WRITE_OLD, dashed: true, dim: true }),
    P.lane({ key: 'wWriteNew', points: W_WRITE_NEW, dashed: true, dim: true, opacity: 0 }),
    P.lane({ points: W_APP_READ, dashed: true, dim: true }),
    P.lane({ key: 'wSubpath', points: W_SUBPATH, dashed: true, dim: true, opacity: 0 }),
    P.tag({ cls: 'scheme-label code', x: 600, y: VOL_Y + 22, text: 'Volume /etc/config' }),
    // Corner tag naming what this block is: the kubelet-managed volume dir on the node. The path
    // holds for both sources (the Secret tmpfs is mounted at the same location).
    P.tag({ x: VOL_X + 12, y: VOL_Y + 22, anchor: 'start', text: '/var/lib/kubelet/pods/…' }),
    // The sync-period note sits right of the spine, vertically centered in the Pod-to-volume gap
    // (176..268, center 222, baseline compensated for the 11px font).
    P.wire({ key: 'clock', x: 618, y: 226, anchor: 'start' }),
    // Uniform chip strip: three chips of one size, centered on the scheme axis.
    P.chip({ key: 'modeChip', x: CHIPS.x(0), y: CHIPS_Y, w: CHIPS.w, h: CHIP_H, name: 'source', value: 'ConfigMap' }),
    P.chip({ key: 'swapChip', x: CHIPS.x(1), y: CHIPS_Y, w: CHIPS.w, h: CHIP_H, name: 'update', value: 'symlink to v1' }),
    P.chip({ key: 'valueChip', x: CHIPS.x(2), y: CHIPS_Y, w: CHIPS.w, h: CHIP_H, name: 'app reads', value: 'app.conf v1' }),
    P.packets(),
  ],
  reset: {
    keys: ['kubelet', 'cm', 'sec', 'dataLink', 'dirOld', 'dirNew', 'appBox', 'modeChip', 'swapChip', 'valueChip'],
    pods: ['shellWrap'],
  },
};

// STO.S-01 as a field: the v2 dir, its pointer and its write lane are born mid-story, the subPath
// lane and the Secret WITH ITS READ LANE change shade, so every one of them is pinned on EVERY step.
const STAGE = {
  symOld: 1, symNew: 0, dirNew: 0, wWriteNew: 0, wSubpath: 0,
  sec: OPACITY.notready, wSecRead: OPACITY.notready,
};
const FLIPPED = { ...STAGE, symOld: 0, symNew: 1, dirNew: 1, wWriteNew: 1 };
const UP = { pod: 1 };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: { modeChip: 'ConfigMap', swapChip: 'symlink to v1', valueChip: 'app.conf v1' },
    opacity: { ...UP, ...STAGE },
  },
  {
    id: 'keys',
    duration: 2600,
    narration: 'Kubelet reads the keys from the ConfigMap and writes them as files into a timestamped directory on the Node. Every key becomes one file, and the value of the key becomes the contents of that file.',
    chipsCued: { modeChip: 'ConfigMap', swapChip: 'v1 written to disk', valueChip: 'app.conf v1' },
    opacity: { ...UP, ...STAGE },
    lit: ['cm'],
    // The keys travel out of the ConfigMap, so the Kubelet lights when they reach it and writes
    // one hop later. Lit at entry it would be reading before anything had been sent.
    flow: [
      F.route({ points: W_CM_READ, name: 'read' }),
      F.tag({ text: 'app.conf', points: W_CM_READ }),
      F.light({ targets: ['kubelet'], at: 'read' }),
      F.route({ points: W_WRITE_OLD, after: 'read', lights: ['dirOld'] }),
      F.tag({ text: 'write v1', points: W_WRITE_OLD, after: 'read' }),
    ],
  },
  {
    id: 'symlink',
    duration: 2400,
    narration: 'The path the app opens is a chain of symlinks. The app.conf symlink points into ..data, and ..data points at the current timestamped directory. So one symlink, ..data, decides which version every file resolves to.',
    chipsCued: { modeChip: 'ConfigMap', swapChip: 'files are symlinks', valueChip: 'app.conf v1' },
    opacity: { ...UP, ...STAGE },
    lit: ['dataLink', 'dirOld', 'appBox'],
    // The app reads through ..data (infra to Pod, a down-arrow): the ball leaves first, the Pod
    // pulses on arrival.
    flow: [
      F.route({ points: W_APP_READ, name: 'read' }),
      F.tag({ text: 'resolves v1', points: W_APP_READ, dy: READ_TAG_DY }),
      F.pulse({ pod: 'pod', at: 'read' }),
    ],
  },
  {
    id: 'atomic',
    duration: 2800,
    narration: 'On update Kubelet does not edit the live files. It writes a whole new timestamped directory, then flips the single ..data symlink to point at it in one atomic step. A reader either sees all of v1 or all of v2, never a half-written mix.',
    chipsCued: { modeChip: 'ConfigMap', swapChip: 'atomic symlink flip', valueChip: 'v2 on next read' },
    // After the flip: the new dir exists and ..data points at it. That is the static end-state, and
    // rewind puts the pre-flip stage back for the animated path alone.
    opacity: { ...UP, ...FLIPPED },
    lit: ['cm', 'dataLink', 'dirNew'],
    rewind: { opacity: STAGE },
    // The updated ConfigMap reaches kubelet first, then kubelet writes the new dir and flips the
    // pointer the instant that dir is complete: old pointer out, new pointer in.
    flow: [
      F.route({ points: W_CM_READ, name: 'read' }),
      F.tag({ text: 'app.conf v2', points: W_CM_READ, dy: SRC_TAG_DY }),
      F.light({ targets: ['kubelet'], at: 'read' }),
      F.fade({ target: 'dirNew', from: 0, to: 1, dur: 400, after: 'read', fill: 'forwards', easing: 'ease-out' }),
      F.fade({ target: 'wWriteNew', from: 0, to: 1, dur: 400, after: 'read', fill: 'forwards', easing: 'ease-out' }),
      F.route({ points: W_WRITE_NEW, after: 'read', name: 'write' }),
      F.tag({ text: 'write v2', points: W_WRITE_NEW, after: 'read' }),
      F.fade({ target: 'symOld', from: 1, to: 0, dur: 250, at: 'write', fill: 'forwards', easing: 'ease-in' }),
      F.fade({ target: 'symNew', from: 0, to: 1, dur: 250, at: 'write', fill: 'forwards', easing: 'ease-out' }),
    ],
  },
  {
    id: 'sync',
    duration: 3000,
    narration: 'The flip is not instant across the cluster. A ConfigMap change reaches the file on the Kubelet sync period, up to about a minute, and even then nothing restarts the app. The process has to notice the file changed and re-read it on its own.',
    chipsCued: { modeChip: 'ConfigMap', swapChip: 'up to 60s to propagate', valueChip: 'app.conf v2' },
    opacity: { ...UP, ...FLIPPED },
    wires: { clock: 'kubelet sync period, then the app re-reads' },
    lit: ['dirNew', 'appBox'],
    // After the sync delay the app re-reads, and ..data now resolves to v2.
    flow: [
      F.route({ points: W_APP_READ, delay: 900, name: 'read' }),
      F.tag({ text: 'resolves v2', points: W_APP_READ, delay: 900, dy: READ_TAG_DY, dx: SYNC_TAG_DX }),
      F.pulse({ pod: 'pod', at: 'read' }),
    ],
  },
  {
    id: 'subpath',
    duration: 2600,
    narration: 'A subPath mount takes a single file out of the volume and mounts it directly, bypassing the ..data symlink. Because it points straight at one timestamped file, the flip never reaches it, so a subPath-mounted key is frozen at the value it had when the container started.',
    chipsCued: { modeChip: 'ConfigMap', swapChip: 'subPath opts out', valueChip: 'app.conf v1 forever' },
    opacity: { ...UP, ...FLIPPED, wSubpath: 1 },
    lit: ['dirOld'],
    // The subPath read rises straight from the old dir, visibly missing ..data on its way up.
    flow: [
      F.route({ points: W_SUBPATH, name: 'read' }),
      F.tag({ text: 'v1 forever', points: W_SUBPATH }),
      F.pulse({ pod: 'pod', at: 'read' }),
    ],
  },
  {
    id: 'secret',
    duration: 2400,
    narration: 'A Secret mounted as a volume works exactly the same way, keys become files behind the atomic symlink swap. The one difference is that a Secret directory defaults to tmpfs, so its files live in memory and never get written to the Node disk.',
    chipsCued: { modeChip: 'Secret (tmpfs)', swapChip: 'same symlink swap', valueChip: 'tls.crt from RAM' },
    opacity: { ...UP, ...FLIPPED, sec: 1, wSecRead: 1 },
    lit: ['sec'],
    flow: [
      F.route({ points: W_SEC_READ, lights: ['kubelet'] }),
      F.tag({ text: 'tls.crt in RAM', points: W_SEC_READ, dy: SRC_TAG_DY }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
