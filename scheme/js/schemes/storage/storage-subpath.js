import { P, F, defineCard, BEAT, makeRidingLabel } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-subpath.md


// Kubelet centred over the Pod with ConfigMap level with it on the right, both right of the panel.
// The Pod holds the volume (spec.volumes is a Pod field), so every read stays inside the Pod frame
// and the one lane that reaches the Pod, the Kubelet write, ends on its top face midpoint.
const MID_X = 600;                                                // the Pod, Kubelet and ..data axis
const COL_W = 232, BLK_H = 80;                                    // NET.L-01
const TOP_Y = 140, TOP_MY = TOP_Y + BLK_H / 2;                    // the actor row
const KUBE_X = MID_X - COL_W / 2;
const CM_X = 860;

// One Pod, the volume row across its top, two peer containers under it, and a 2x2 ledger below.
const POD_X = 100, POD_Y = 282, POD_W = 1000, POD_H = 250;
const ROW_Y = 312, ROW_H = 48, ROW_MY = ROW_Y + ROW_H / 2;        // the volume row
const DIR_W = 164, DATA_W = 140;                                  // the two version directories, ..data
// The row and the containers mirror about MID_X: each directory sits over its container.
const SIDE_DX = 260;
const PROXY_CX = MID_X - SIDE_DX, WEB_CX = MID_X + SIDE_DX;
const V1_CX = PROXY_CX, V2_CX = WEB_CX;
const V1_X = V1_CX - DIR_W / 2, V2_X = V2_CX - DIR_W / 2, DATA_X = MID_X - DATA_W / 2;
const CT_W = 232, CT_H = 80, CT_Y = 416;                          // NET.L-01
const GRID_Y = 548, CHIP_H = 34, ROW_GAP = 12, CHIP_W = 300;

// Each static wire and its ball share one array. The two reads start on the volume row floor and
// end on a container top, inside the Pod: the ..data read turns along the gap between the rows.
const GAP_Y = (ROW_Y + ROW_H + CT_Y) / 2;
const W_DIR = [[MID_X, ROW_Y + ROW_H], [MID_X, GAP_Y], [WEB_CX, GAP_Y], [WEB_CX, CT_Y]];
const W_SUB = [[V1_CX, ROW_Y + ROW_H], [PROXY_CX, CT_Y]];
const W_CM = [[CM_X, TOP_MY], [KUBE_X + COL_W, TOP_MY]];
const W_WRITE = [[MID_X, TOP_Y + BLK_H], [MID_X, POD_Y]];
const SYM_V1 = [[DATA_X, ROW_MY], [V1_X + DIR_W, ROW_MY]];
const SYM_V2 = [[DATA_X + DATA_W, ROW_MY], [V2_X, ROW_MY]];

// Every tagged ball rides LEG_DUR: on the 700ms floor of these short legs the tag retires before
// it can be read.
const LEG_DUR = 1500;
// Every tag trails its ball out of the block it leaves, so each emerges once clear of that block.
const trailLabel = makeRidingLabel({ role: 'storage', inMs: 200, outMs: 200, hold: 0, emergeMode: true });
// The ConfigMap tag rides over its lane and behind the ball, landing short of the Kubelet right
// face. The write tag rides right of its drop and lands over the Pod top.
const CM_TAG = { fn: trailLabel, dx: 42, dy: -10, emerge: 150 };
const WRITE_TAG = { fn: trailLabel, dx: 40, dy: -6, emerge: 500 };
// The ..data read tag rides ahead of the ball, over the gap lane and under the v2 directory, and
// lands over the web top. The v1 tag rides right of the short drop between v1 and proxy.
const DIR_TAG = { fn: trailLabel, dx: 44, dy: -6, emerge: 300 };
const SUB_TAG = { fn: trailLabel, dx: 38, dy: -6, emerge: 550 };
// Z-order: the Pod and everything it holds, the actor blocks, pointers and lanes, the captions,
// the chip ledger, then the packet layer.
export const SCENE = {
  'aria-label': 'subPath mounts: one config volume, two containers in one Pod. The web container mounts the whole volume at a directory, so every read resolves through the ..data symlink. The proxy container mounts only app.conf with subPath, and Kubelet resolves that path to the v1 file when the container starts. When the ConfigMap changes, Kubelet writes a v2 directory, flips ..data and deletes the v1 directory: web now reads v2, and proxy keeps reading the v1 file its bind mount still holds until its container restarts.',
  parts: [
    P.defs(),
    P.group({
      key: 'pod',
      parts: [
        // The Pod name sits top left: centred, the Kubelet write would land on it.
        P.pod({ key: 'shellWrap', x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: '', sublabel: '', containers: 0 }),
        P.tag({ cls: 'scheme-pod-label', anchor: 'start', x: POD_X + 16, y: POD_Y + 20, text: 'Pod web-0' }),
        P.box({ key: 'proxyBox', x: PROXY_CX - CT_W / 2, y: CT_Y, w: CT_W, h: CT_H, label: 'proxy', sublabel: 'mounts /etc/nginx/app.conf' }),
        P.box({ key: 'webBox', x: WEB_CX - CT_W / 2, y: CT_Y, w: CT_W, h: CT_H, label: 'web', sublabel: 'mounts /etc/app' }),
        // The volume row is drawn inside the Pod, so it pulses with it.
        P.box({ key: 'dataLink', x: DATA_X, y: ROW_Y, w: DATA_W, h: ROW_H, label: '..data', sublabel: 'symlink' }),
        P.box({ key: 'dirV1', x: V1_X, y: ROW_Y, w: DIR_W, h: ROW_H, label: '..2026_09_19_10_00', sublabel: 'app.conf v1' }),
        P.box({ key: 'dirV2', x: V2_X, y: ROW_Y, w: DIR_W, h: ROW_H, label: '..2026_09_19_10_07', sublabel: 'app.conf v2', opacity: 0 }),
      ],
    }),
    P.box({ key: 'cm', x: CM_X, y: TOP_Y, w: COL_W, h: BLK_H, label: 'ConfigMap app', sublabel: 'key: app.conf' }),
    P.box({ key: 'kubelet', x: KUBE_X, y: TOP_Y, w: COL_W, h: BLK_H, label: 'Kubelet', sublabel: 'writes volume, binds subPath' }),
    // The ..data pointers are relationships, not traffic: no ball ever rides them.
    P.relation({ key: 'symV1', points: SYM_V1 }),
    P.relation({ key: 'symV2', points: SYM_V2, opacity: 0 }),
    P.lane({ key: 'wCm', points: W_CM, dashed: true, dim: true }),
    P.lane({ key: 'wWrite', points: W_WRITE, dashed: true, dim: true }),
    P.lane({ key: 'wDir', points: W_DIR, dashed: true, dim: true }),
    P.lane({ key: 'wSub', points: W_SUB, dashed: true, dim: true }),
    // The volume row has no frame of its own: a frame would put both reads through its floor.
    P.tag({ cls: 'scheme-label code', x: (POD_X + V1_X) / 2, y: ROW_MY + 4, text: 'volume config' }),
    // Why proxy takes one file: the directory it lands in keeps what the image put there.
    P.tag({ x: PROXY_CX, y: CT_Y + CT_H + 22, text: 'image files mime.types, nginx.conf stay' }),
    P.chip({ key: 'proxyMount', x: PROXY_CX - CHIP_W / 2, y: GRID_Y, w: CHIP_W, h: CHIP_H, name: 'proxy mount', value: 'subPath app.conf' }),
    P.chip({ key: 'webMount', x: WEB_CX - CHIP_W / 2, y: GRID_Y, w: CHIP_W, h: CHIP_H, name: 'web mount', value: 'whole volume' }),
    P.chip({ key: 'proxyReads', x: PROXY_CX - CHIP_W / 2, y: GRID_Y + CHIP_H + ROW_GAP, w: CHIP_W, h: CHIP_H, name: 'proxy reads', value: 'nothing yet' }),
    P.chip({ key: 'webReads', x: WEB_CX - CHIP_W / 2, y: GRID_Y + CHIP_H + ROW_GAP, w: CHIP_W, h: CHIP_H, name: 'web reads', value: 'nothing yet' }),
    P.packets(),
  ],
  reset: {
    keys: ['cm', 'kubelet', 'dataLink', 'dirV1', 'dirV2', 'proxyBox', 'webBox', 'proxyMount', 'webMount', 'proxyReads', 'webReads'],
    pods: ['shellWrap'],
  },
};

// STO.S-01: the v2 directory and both pointers change on the update step, so every one of them is
// pinned on every step, with every lane at full.
const STAGE = { pod: 1, symV1: 1, symV2: 0, dirV2: 0, wWrite: 1, wCm: 1, wDir: 1, wSub: 1 };
const FLIPPED = { ...STAGE, symV1: 0, symV2: 1, dirV2: 1 };
const MOUNTS = { proxyMount: 'subPath app.conf', webMount: 'whole volume' };
const BEFORE = { proxyBox: 'mounts /etc/nginx/app.conf', webBox: 'mounts /etc/app' };
// After the flip the v1 directory is deleted, and only the v1 file its bind mount pins is left.
const V1_LABEL = { dirV1: '..2026_09_19_10_00' }, V1_SUB = { dirV1: 'app.conf v1' };
const GONE_LABEL = { dirV1: 'app.conf v1' }, GONE_SUB = { dirV1: 'deleted, bind holds it' };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: { ...MOUNTS, proxyReads: 'nothing yet', webReads: 'nothing yet' },
    sublabels: BEFORE,
    opacity: STAGE,
  },
  {
    id: 'dir',
    duration: 3400,
    narration: 'The web container mounts the whole config volume as a directory at /etc/app. Every read of app.conf goes through the ..data symlink, which points at the v1 directory, so web reads app.conf v1.',
    chipsCued: { ...MOUNTS, proxyReads: 'nothing yet', webReads: 'app.conf v1' },
    sublabels: { ...BEFORE, webBox: 'reads app.conf v1' },
    opacity: STAGE,
    lit: ['dataLink', 'dirV1'],
    flow: [
      F.route({ points: W_DIR, delay: BEAT.lead, dur: LEG_DUR, name: 'read', lights: ['webBox'], tag: { text: 'app.conf v1', ...DIR_TAG }, pulse: 'pod' }),
    ],
  },
  {
    id: 'subpath',
    duration: 3400,
    narration: 'The proxy container needs only app.conf, in /etc/nginx next to the files its image ships. A whole-volume mount there would hide them, so it sets subPath: app.conf. When the container starts, Kubelet resolves that path to the v1 file and bind-mounts the file itself.',
    chipsCued: { ...MOUNTS, proxyReads: 'app.conf v1', webReads: 'app.conf v1' },
    sublabels: { proxyBox: 'reads app.conf v1', webBox: 'reads app.conf v1' },
    opacity: STAGE,
    lit: ['kubelet', 'dirV1'],
    flow: [
      F.route({ points: W_SUB, delay: BEAT.lead, dur: LEG_DUR, lights: ['proxyBox'], tag: { text: 'bind v1', ...SUB_TAG }, pulse: 'pod' }),
    ],
  },
  {
    id: 'update',
    duration: 5000,
    narration: 'The ConfigMap changes. Kubelet does not edit the files in place: it writes the new version into a fresh v2 directory, flips ..data to point at it, then deletes the v1 directory.',
    chipsCued: { ...MOUNTS, proxyReads: 'app.conf v1', webReads: 'app.conf v1' },
    labels: GONE_LABEL,
    sublabels: { proxyBox: 'reads app.conf v1', webBox: 'reads app.conf v1', ...GONE_SUB },
    // The static end state is after the flip, and rewind puts the pre-flip stage back for the
    // animated path alone.
    opacity: FLIPPED,
    rewind: { opacity: STAGE, labels: V1_LABEL, sublabels: V1_SUB },
    lit: ['cm'],
    // The pointer swap lands one hop after the write arrives, never while the ball is in flight.
    flow: [
      F.route({ points: W_CM, delay: BEAT.lead, dur: LEG_DUR, name: 'read', lights: ['kubelet'], tag: { text: 'app.conf v2', ...CM_TAG } }),
      F.route({ points: W_WRITE, after: 'read', dur: LEG_DUR, name: 'write', lights: ['dirV2'], tag: { text: 'write v2', ...WRITE_TAG } }),
      // The write ends on the Pod top: the v2 directory comes into existence and the Pod blinks
      // as it lands.
      F.fade({ target: 'dirV2', from: 0, to: 1, dur: 400, at: 'write', fill: 'forwards', easing: 'ease-out' }),
      F.pulse({ pod: 'pod', at: 'write' }),
      F.fade({ target: 'symV1', from: 1, to: 0, dur: 300, after: 'write', fill: 'forwards', easing: 'ease-in' }),
      F.fade({ target: 'symV2', from: 0, to: 1, dur: 300, after: 'write', fill: 'forwards', easing: 'ease-out' }),
      F.light({ targets: ['dataLink'], after: 'write' }),
      // The old directory goes only after ..data points away from it.
      F.set({ after: 'write', plus: 400, labels: GONE_LABEL, sublabels: GONE_SUB }),
    ],
  },
  {
    id: 'dir-v2',
    // The payoff beats hold 800 past the Pod blink so the split can be read off the ledger.
    duration: 4000,
    narration: 'The web container reads app.conf again. Its path still runs through ..data, so the same read now resolves into the v2 directory and web gets the new config without a restart.',
    chipsCued: { ...MOUNTS, proxyReads: 'app.conf v1', webReads: 'app.conf v2' },
    labels: GONE_LABEL,
    sublabels: { proxyBox: 'reads app.conf v1', webBox: 'reads app.conf v2', ...GONE_SUB },
    opacity: FLIPPED,
    lit: ['dataLink', 'dirV2'],
    flow: [
      F.route({ points: W_DIR, delay: BEAT.lead, dur: LEG_DUR, name: 'read', lights: ['webBox'], tag: { text: 'app.conf v2', ...DIR_TAG }, pulse: 'pod' }),
    ],
  },
  {
    id: 'pinned',
    // The payoff beats hold 800 past the Pod blink so the split can be read off the ledger.
    duration: 4000,
    narration: 'Proxy reads app.conf too. Its bind mount never goes through ..data and still holds the v1 file, readable although its directory is deleted, so proxy gets v1. The docs say it for ConfigMap, Secret, downward API and projected volumes: a subPath mount does not receive updates. Proxy sees v2 once its container restarts and Kubelet resolves the path again.',
    chipsCued: { ...MOUNTS, proxyReads: 'still app.conf v1', webReads: 'app.conf v2' },
    labels: GONE_LABEL,
    sublabels: { proxyBox: 'still reads app.conf v1', webBox: 'reads app.conf v2', ...GONE_SUB },
    opacity: FLIPPED,
    lit: ['dirV1'],
    flow: [
      F.route({ points: W_SUB, delay: BEAT.lead, dur: LEG_DUR, name: 'read', lights: ['proxyBox'], tag: { text: 'still v1', ...SUB_TAG }, pulse: 'pod' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
