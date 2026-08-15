import { P, F, defineCard, BEAT } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-container-filesystem


const POD_X = 440, POD_Y = 48, POD_W = 320, POD_H = 140;
const POD_BOTTOM = POD_Y + POD_H;                     // 188
const POD_CX = POD_X + POD_W / 2;                     // 600
const POD_RIGHT = POD_X + POD_W;                      // 760

const STK_X = 460, STK_W = 280;                       // stack centred on 600
const WR_Y = 234, WR_H = 48;                          // writable layer (upperdir)
const L3_Y = 292, L2_Y = 346, L1_Y = 400, LH = 44;    // read-only image layers, bottom 444

const VOL_W = 220, VOL_X = POD_CX - VOL_W / 2;        // 490, centred under the stack
const VOL_Y = 482, VOL_H = 96;                        // 482..578
const VOL_MY = VOL_Y + VOL_H / 2;                     // 530
const VOL_RIGHT = VOL_X + VOL_W;                      // 710

const BYPASS_X = 820;                                 // the volume wire descends right of the stack
const EXIT_Y = 130;                                   // where it leaves the Container side
const CHIPS_Y = 596;

const W_COPYUP = [[POD_CX, POD_BOTTOM], [POD_CX, WR_Y]];
const W_VOL    = [[POD_RIGHT, EXIT_Y], [BYPASS_X, EXIT_Y], [BYPASS_X, VOL_MY], [VOL_RIGHT, VOL_MY]];

const LAYER_FADE = 500;                               // the layer and its wire cross-fade as one

// Z-order (bottom -> top): blocks, wires and the mount label, the chip strip, then the packet layer
// so every ball rides above. The Container group holds shell and Process box as PEERS, so both pulse.
export const SCENE = {
  'aria-label': 'Container filesystem layers: a container root filesystem is read-only image layers stacked by overlayfs with one thin writable layer on top. A write copies the file up into the writable layer rather than changing the image, and that writable layer is discarded when the container is removed, which is why data written outside a volume vanishes. A mounted volume bypasses the overlay and writes straight to real storage.',
  parts: [
    P.defs(),
    P.group({
      key: 'ctr',
      parts: [
        P.pod({ key: 'ctrShell', x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Container', sublabel: 'root filesystem', containers: 0 }),
        P.box({ key: 'ctrBox', x: POD_X + 24, y: POD_Y + 46, w: POD_W - 48, h: 60, label: 'Process', sublabel: 'sees one tree at /' }),
      ],
    }),
    P.box({ key: 'l1', x: STK_X, y: L1_Y, w: STK_W, h: LH, label: 'Image layer: base', sublabel: 'read-only' }),
    P.box({ key: 'l2', x: STK_X, y: L2_Y, w: STK_W, h: LH, label: 'Image layer: deps', sublabel: 'read-only' }),
    P.box({ key: 'l3', x: STK_X, y: L3_Y, w: STK_W, h: LH, label: 'Image layer: app', sublabel: 'read-only' }),
    // Born hidden: the writable layer does not exist until its own step adds it.
    P.box({ key: 'writable', x: STK_X, y: WR_Y, w: STK_W, h: WR_H, label: 'Writable layer', sublabel: 'upperdir, starts empty', opacity: 0 }),
    // The primitive centers the label on the raw bbox, which reads high under the cap ellipse.
    P.cylinder({ key: 'volume', x: VOL_X, y: VOL_Y, w: VOL_W, h: VOL_H, label: 'Volume', labelY: VOL_H / 2 + 12 }),
    // The copy-up wire targets the writable layer, so it is born hidden with it and only ever shows
    // while the layer itself is on screen (STO.S-02).
    P.lane({ key: 'wCopyup', points: W_COPYUP, dashed: true, dim: true, opacity: 0 }),
    P.lane({ points: W_VOL, dashed: true, dim: true }),
    P.wire({ key: 'mount', x: BYPASS_X + 14, y: 346, anchor: 'start' }),
    P.chip({ key: 'fsChip', x: 100, y: CHIPS_Y, w: 320, h: 34, name: 'root fs', value: 'read-only image layers' }),
    P.chip({ key: 'writeChip', x: 440, y: CHIPS_Y, w: 320, h: 34, name: 'last write', value: 'none' }),
    P.chip({ key: 'persistChip', x: 780, y: CHIPS_Y, w: 320, h: 34, name: 'persists', value: 'no, in writable' }),
    P.packets(),
  ],
  reset: {
    keys: ['writable', 'l3', 'l2', 'l1', 'volume', 'ctrBox', 'fsChip', 'writeChip', 'persistChip'],
    pods: ['ctrShell'],
  },
};

const RO_FS = 'read-only image layers', RW_FS = 'RO image + RW top';
const IN_WRITABLE = 'no, in writable';

// STO.S-01 as a field: the writable layer and its wire come and go, so both are pinned on every
// step, alongside the Container that holds them.
const STACK_OFF = { ctr: 1, writable: 0, wCopyup: 0 };
const STACK_ON  = { ctr: 1, writable: 1, wCopyup: 1 };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    // The writable layer is hidden on the poster, so the chip must not claim an RW top yet.
    chipsCued: { fsChip: RO_FS, writeChip: 'none', persistChip: IN_WRITABLE },
    opacity: STACK_OFF,
  },
  {
    id: 'layers',
    duration: 2200,
    narration: 'The image layers are read-only. They come straight from the image and are shared between every container built on it, so nothing a container does can change them. This is the lower half of the overlay.',
    chipsCued: { fsChip: RO_FS, writeChip: 'none', persistChip: IN_WRITABLE },
    opacity: STACK_OFF,
    lit: ['l3', 'l2', 'l1'],
    // The container starts and assembles its root from the image layers, so the shell pulses.
    flow: [F.pulse({ pod: 'ctr' })],
  },
  {
    id: 'writable',
    duration: 2200,
    narration: 'On top sits one thin writable layer, the upperdir. Every file the container creates or changes at runtime lands here, and it starts empty. Nothing else in the root filesystem can be written to.',
    chipsCued: { fsChip: RW_FS, writeChip: 'none', persistChip: IN_WRITABLE },
    // The layer and its wire are present by the END of the step, so full opacity is the static
    // state the reduced path stops at, and rewind is what the fade-in starts from.
    opacity: STACK_ON,
    lit: ['writable'],
    rewind: { opacity: { writable: 0, wCopyup: 0 } },
    flow: [
      F.fade({ target: 'writable', from: 0, to: 1, dur: LAYER_FADE, fill: 'forwards', easing: 'ease-out' }),
      F.fade({ target: 'wCopyup', from: 0, to: 1, dur: LAYER_FADE, fill: 'forwards', easing: 'ease-out' }),
    ],
  },
  {
    id: 'copyup',
    duration: 2800,
    narration: 'A write to a path that lives in an image layer does not touch the image. The overlayfs driver copies the file up into the writable layer first, then applies the change there. The read-only layer underneath is left exactly as it was.',
    chipsCued: { fsChip: RW_FS, writeChip: '/app/config', persistChip: IN_WRITABLE },
    opacity: STACK_ON,
    // The process writes, so it is lit from entry on both paths. The writable layer RECEIVES, so it
    // earns its highlight on the arrival, which is also what flowLights hands the reduced path.
    lit: ['ctrBox'],
    flow: [
      F.pulse({ pod: 'ctr' }),
      F.route({ points: W_COPYUP, delay: BEAT.afterPulse, lights: ['writable'] }),
      F.tag({ text: 'copy-up', points: W_COPYUP, delay: BEAT.afterPulse }),
    ],
  },
  {
    id: 'discard',
    duration: 2600,
    narration: 'When the container is removed, its writable layer is thrown away with it. That is why anything written to the root filesystem, such as logs, temp files or a scratch database, is gone the moment the container restarts. The image layers remain, empty of your changes.',
    chipsCued: { fsChip: RW_FS, writeChip: 'discarded', persistChip: IN_WRITABLE },
    // The writable layer is discarded and its copy-up wire goes with it: no layer, no wire. The
    // Container block itself stays at full strength, the story is the vanishing layer.
    opacity: STACK_OFF,
    rewind: { opacity: { writable: 1, wCopyup: 1 } },
    flow: [
      F.fade({ target: 'writable', from: 1, to: 0, dur: LAYER_FADE, fill: 'forwards', easing: 'ease-in' }),
      F.fade({ target: 'wCopyup', from: 1, to: 0, dur: LAYER_FADE, fill: 'forwards', easing: 'ease-in' }),
    ],
  },
  {
    id: 'volume',
    duration: 3000,
    narration: 'The container comes back and gets a brand new empty writable layer, everything the old one held is gone. A mounted volume is a hole punched through the overlay straight to real storage: a write under /data skips the writable layer entirely and lands on the volume, so it survives the container being replaced. Persist anything you care about on a volume, never on the root filesystem.',
    chipsCued: { fsChip: RW_FS, writeChip: '/data on volume', persistChip: 'yes, on volume' },
    opacity: STACK_ON,
    wires: { mount: 'mounted at /data' },
    lit: ['ctrBox'],
    rewind: { opacity: { writable: 0, wCopyup: 0 } },
    // The fresh container gets its empty layer back, then writes to /data, which bypasses the
    // overlay and lands on the disk. The volume lights when that write arrives.
    flow: [
      F.fade({ target: 'writable', from: 0, to: 1, dur: LAYER_FADE, fill: 'forwards', easing: 'ease-out' }),
      F.fade({ target: 'wCopyup', from: 0, to: 1, dur: LAYER_FADE, fill: 'forwards', easing: 'ease-out' }),
      F.pulse({ pod: 'ctr' }),
      F.route({ points: W_VOL, delay: BEAT.afterPulse, lights: ['volume'] }),
      F.tag({ text: 'write /data', points: W_VOL, delay: BEAT.afterPulse }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
