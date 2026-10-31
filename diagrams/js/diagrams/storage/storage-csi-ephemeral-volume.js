import { FADE, LANE_DY, P, F, defineCard, BEAT, OPACITY } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-csi-ephemeral-volume.md


// Two regions right of the panel: the claim path that is never made, and the Node-1 frame.
// The two API objects that ARE read sit left, below the panel.
const RIGHT_X = 420, RIGHT_W = 740, RIGHT_CX = RIGHT_X + RIGHT_W / 2;

// The ghost row spans exactly the frame width on one pitch.
const GHOST_Y = 40, GHOST_H = 80, GHOST_GAP = 36;
const GHOST_W = (RIGHT_W - 3 * GHOST_GAP) / 4;
const ghostX = i => RIGHT_X + i * (GHOST_W + GHOST_GAP);
const GHOST_MID = GHOST_Y + GHOST_H / 2;

// The frame is placed by its CENTRE: its two face midpoints are the only doors anything outside
// uses, so the rest derives from them. Its height follows the catalog padding round its two columns.
const BLOCK_W = 232, BLOCK_H = 80, POD_H = 104, ROW_GAP = 64;
const NODE_CY = 336, NODE_H = 34 + POD_H + ROW_GAP + BLOCK_H + 12;
const NODE_Y = NODE_CY - NODE_H / 2, NODE_BOT = NODE_Y + NODE_H;
const K_X = 452, D_X = 896;
const D_CX = D_X + BLOCK_W / 2;
const POD_Y = NODE_Y + 34, POD_MID = POD_Y + POD_H / 2;
const VOL_H = BLOCK_H, VOL_Y = POD_MID - VOL_H / 2;
// The store pair meets the frame at its bottom face, so no store duct runs inside it.
const ROW_Y = POD_Y + POD_H + ROW_GAP, ROW_MID = ROW_Y + BLOCK_H / 2;
const STORE_Y = NODE_BOT + 48, STORE_X = RIGHT_CX - BLOCK_W / 2;

// The two API objects stand mirrored about the left door, their lanes converging on one funnel x.
const L_X = 60, L_RIGHT = L_X + BLOCK_W;
const FUNNEL_X = (L_RIGHT + RIGHT_X) / 2;
const API_MID = NODE_CY - 52, CSID_MID = NODE_CY + 52;
const API_Y = API_MID - BLOCK_H / 2, CSID_Y = CSID_MID - BLOCK_H / 2;

// The store round trip is a mirrored pair on the bottom face (L-12). Both API lanes end at the left door.

const L_SPEC  = [[L_RIGHT, API_MID], [FUNNEL_X, API_MID], [FUNNEL_X, NODE_CY - LANE_DY],
  [FUNNEL_X, NODE_CY], [RIGHT_X, NODE_CY]];                                           // API server -> Node
const L_MODE  = [[L_RIGHT, CSID_MID], [FUNNEL_X, CSID_MID], [FUNNEL_X, NODE_CY + LANE_DY],
  [FUNNEL_X, NODE_CY], [RIGHT_X, NODE_CY]];                                           // CSIDriver -> Node
const L_PUB   = [[K_X + BLOCK_W, ROW_MID], [D_X, ROW_MID]];                        // Kubelet -> plugin
const L_GET   = [[RIGHT_CX - LANE_DY, NODE_BOT], [RIGHT_CX - LANE_DY, STORE_Y]];    // Node -> store
const L_ANS   = [[RIGHT_CX + LANE_DY, STORE_Y], [RIGHT_CX + LANE_DY, NODE_BOT]];    // store -> Node
const L_WRITE = [[D_CX, ROW_Y], [D_CX, VOL_Y + VOL_H]];                            // plugin -> volume
const L_READ  = [[D_X, POD_MID], [K_X + BLOCK_W, POD_MID]];                        // volume -> Pod

// Every tag shows from departure, 16 clear of its ball, measured from its own width (6 units a
// character), on the side where it meets no block text at either end.
const beside = (side, dy) => (text) => ({ text, dx: side * (16 + 3 * text.length), dy });
// The API lanes lead below, so each tag leaves the object clear and lands under the Pod.
const apiTag = beside(1, 12);
// The publish tags ride centred over the ball, clear of both labels across the gap.
const pubTag = (text) => ({ text, dx: 0, dy: -18 });
// The store pair: each tag rides beside its own lane, above the store roof at that end.
const getTag = beside(-1, -12), ansTag = beside(1, -10);
// The write trails below, landing under the volume. The read leads, so it leaves the volume clear
// and lands between the Pod label and the app box.
const writeTag = beside(1, 12), readTag = beside(-1, -20);

const ghost = (key, i, label, sublabel = 'not created') => P.box({
  key, x: ghostX(i), y: GHOST_Y, w: GHOST_W, h: GHOST_H, label, sublabel, opacity: OPACITY.notready,
});
const ghostLink = i => P.relation({ points: [[ghostX(i) + GHOST_W, GHOST_MID], [ghostX(i + 1), GHOST_MID]] });
const lane = (key, points) => P.lane({ key, points, dashed: true, dim: true });

export const SCENE = {
  'aria-label': 'CSI ephemeral volumes: Pod web-0 declares a CSI volume inline, with a driver name, volumeAttributes and readOnly true, and refers to no claim. No PVC, PV or VolumeAttachment is ever created, and no StorageClass is read. Kubelet checks that the CSIDriver object lists the Ephemeral lifecycle mode, then calls NodePublishVolume on the node plugin directly, with no attach and no stage. Kubelet adds Pod info to the attributes because the CSIDriver sets podInfoOnMount. Here the driver is the Secrets Store driver, and it mounts an empty tmpfs at the path Kubelet gave it. The volume attributes point to a SecretProviderClass, whose provider fetches db-password from an external store, and the driver writes db-password into the tmpfs as a file. Only then does the container start and read db-password at /mnt/secrets. When the Pod is deleted and its containers have stopped, Kubelet calls NodeUnpublishVolume and the driver deletes the volume. So the volume lives and dies with the Pod.',
  parts: [
    P.defs(),
    P.node({ key: 'nodeFrame', x: RIGHT_X, y: NODE_Y, w: RIGHT_W, h: NODE_H, label: 'Node-1' }),
    P.pod({
      key: 'pod', innerKey: 'appBox', x: K_X, y: POD_Y, w: BLOCK_W, h: POD_H,
      label: 'Pod web-0', sublabel: 'ContainerCreating', containers: 0,
      inner: { dx: 20, dy: 34, w: BLOCK_W - 40, h: 44, label: 'app', sublabel: 'mounts /mnt/secrets' },
    }),
    P.box({ key: 'vol', x: D_X, y: VOL_Y, w: BLOCK_W, h: VOL_H, label: 'Inline volume', sublabel: 'not created yet' }),
    P.box({ key: 'kubelet', x: K_X, y: ROW_Y, w: BLOCK_W, h: BLOCK_H, label: 'Kubelet', sublabel: 'on Node-1' }),
    P.box({ key: 'plugin', x: D_X, y: ROW_Y, w: BLOCK_W, h: BLOCK_H, label: 'CSI node plugin', sublabel: 'secrets-store.csi.k8s.io' }),
    P.box({ key: 'store', x: STORE_X, y: STORE_Y, w: BLOCK_W, h: BLOCK_H, label: 'External store', sublabel: 'outside the Kubernetes API' }),
    P.box({ key: 'api', x: L_X, y: API_Y, w: BLOCK_W, h: BLOCK_H, label: 'API server', sublabel: 'Pod web-0, inline volume' }),
    P.box({ key: 'csid', x: L_X, y: CSID_Y, w: BLOCK_W, h: BLOCK_H, label: 'CSIDriver secrets-store.csi.k8s.io', sublabel: 'volumeLifecycleModes: Ephemeral' }),
    // The claim path an inline volume never takes: drawn, never made, never lit, nothing rides it.
    ghost('gSc', 0, 'StorageClass', 'not used'),
    ghost('gPvc', 1, 'PVC'),
    ghost('gPv', 2, 'PV'),
    ghost('gVa', 3, 'VolumeAttachment'),
    ghostLink(0), ghostLink(1), ghostLink(2),
    P.tag({ x: RIGHT_CX, y: GHOST_Y - 14, text: 'the claim path: never taken by an inline CSI volume' }),
    lane('lSpec', L_SPEC),
    lane('lMode', L_MODE),
    lane('lPub', L_PUB),
    lane('lGet', L_GET),
    lane('lAns', L_ANS),
    lane('lWrite', L_WRITE),
    lane('lRead', L_READ),
    P.packets(),
  ],
  reset: {
    keys: ['api', 'csid', 'kubelet', 'plugin', 'store', 'vol'],
    pods: ['pod'],
  },
};

// STO.S-01 as one literal: the two things born or removed mid-story, and every lane at full.
const T = OPACITY.terminated, PEND = OPACITY.pending;
const stage = ({ pod = 1, vol = PEND } = {}) => ({
  pod, vol, lSpec: 1, lMode: 1, lPub: 1, lGet: 1, lAns: 1, lWrite: 1, lRead: 1,
});
const WAIT = { pod: 'ContainerCreating' };
const NOT_YET = { vol: 'not created yet' };
const HOLDS = { vol: 'holds db-password' };
// The Secrets Store driver mounts its tmpfs before it asks the provider for anything.
const EMPTY = { vol: 'empty tmpfs' };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    sublabels: NOT_YET,
    podSublabels: WAIT,
    opacity: stage(),
  },
  {
    id: 'declare',
    duration: 3700,
    narration: 'Pod web-0 declares a CSI volume inline, with the driver name, a few volumeAttributes and readOnly true, which this driver requires. The Pod names no claim, so no PVC or PV is created and no StorageClass is read. An inline CSI volume is never attached, so no VolumeAttachment either. The Pod lands on Node-1 and Kubelet picks up its spec.',
    sublabels: NOT_YET,
    podSublabels: WAIT,
    opacity: stage(),
    // The API server acts first: lit at entry, it sends on BEAT.lead and Kubelet lights on arrival.
    lit: ['api'],
    flow: [
      F.route({ points: L_SPEC, delay: BEAT.lead, lights: ['kubelet'], tag: apiTag('Pod web-0') }),
    ],
  },
  {
    id: 'gate',
    duration: 3800,
    narration: 'Kubelet checks the CSIDriver object of this driver. The object lists Ephemeral in volumeLifecycleModes, so an inline volume is allowed. With no such mode, or no CSIDriver at all, Kubelet refuses the mount. The attributes come straight from the Pod author, so an admin says no by removing the mode or with a webhook.',
    sublabels: NOT_YET,
    podSublabels: WAIT,
    opacity: stage(),
    lit: ['csid'],
    flow: [
      F.route({ points: L_MODE, delay: BEAT.lead, lights: ['kubelet'], tag: apiTag('Ephemeral') }),
    ],
  },
  {
    id: 'publish',
    duration: 3600,
    narration: 'Kubelet calls NodePublishVolume on the node plugin directly, with no ControllerPublishVolume and no NodeStageVolume. The call carries the volumeAttributes plus Pod info, since this CSIDriver sets podInfoOnMount. With no PV to take a handle from, Kubelet also adds a volume id, a hash of the Pod UID and volume name.',
    sublabels: NOT_YET,
    podSublabels: WAIT,
    opacity: stage(),
    lit: ['kubelet'],
    flow: [
      F.route({ points: L_PUB, delay: BEAT.lead, lights: ['plugin'], tag: pubTag('NodePublishVolume') }),
    ],
  },
  {
    id: 'fetch',
    duration: 5000,
    narration: 'The driver has to create the volume inside that one call. Here it is the Secrets Store driver, and it mounts an empty tmpfs at the path Kubelet gave it. The volume attributes point to a SecretProviderClass, and the provider plugin that class names fetches db-password from the external store while the driver waits.',
    sublabels: EMPTY,
    podSublabels: WAIT,
    opacity: stage(),
    // The store lights as the request lands, so the answer leaves a lit sender one hop later.
    lit: ['plugin'],
    flow: [
      F.route({ points: L_GET, delay: BEAT.lead, name: 'get', lights: ['store'], tag: getTag('get db-password') }),
      F.route({ points: L_ANS, after: 'get', lights: ['plugin'], tag: ansTag('db-password') }),
    ],
  },
  {
    id: 'mount',
    duration: 5600,
    narration: 'With db-password in hand the driver writes it into that tmpfs as a file, and the call returns. Only then does Kubelet start the container, so the Pod turns Running and the app reads db-password at /mnt/secrets like any other file.',
    sublabels: HOLDS,
    podSublabels: { pod: 'Running' },
    opacity: stage({ vol: 1 }),
    lit: ['plugin'],
    // The volume turns ready as the write lands and the container starts.
    rewind: { sublabels: EMPTY, podSublabels: WAIT, opacity: { vol: PEND } },
    flow: [
      F.route({ points: L_WRITE, delay: BEAT.lead, name: 'write', lights: ['vol'], tag: writeTag('db-password') }),
      F.reveal({ target: 'vol', from: PEND, at: 'write' }),
      F.set({ sublabels: HOLDS, podSublabels: { pod: 'Running' }, at: 'write' }),
      F.route({ points: L_READ, after: 'write', tag: readTag('db-password'), pulse: 'pod' }),
    ],
  },
  {
    id: 'delete',
    duration: 6800,
    narration: 'Deleting the Pod takes the volume with it. Once its containers have stopped, Kubelet calls NodeUnpublishVolume and the driver deletes the volume, and only then is the Pod object gone. There is no claim to release and no PV to reclaim, because the volume lives and dies with the Pod.',
    sublabels: { vol: 'deleted' },
    podSublabels: { pod: 'deleted' },
    opacity: stage({ pod: T, vol: T }),
    lit: ['api'],
    // The Pod blinks BEFORE it goes (M-08), and the volume ghosts on the unpublish arrival.
    rewind: { sublabels: HOLDS, podSublabels: { pod: 'Running' }, opacity: stage({ vol: 1 }) },
    flow: [
      F.route({ points: L_SPEC, delay: BEAT.lead, name: 'kill', lights: ['kubelet'], tag: apiTag('Pod deleted'), pulse: 'pod' }),
      F.fade({ target: 'pod', to: T, dur: FADE.out, at: 'kill', plus: BEAT.afterPulse, fill: 'forwards', name: 'gone' }),
      F.set({ podSublabels: { pod: 'Terminating' }, at: 'kill', plus: BEAT.afterPulse }),
      F.route({ points: L_PUB, after: 'gone', name: 'unpub', lights: ['plugin'], tag: pubTag('NodeUnpublishVolume') }),
      F.fade({ target: 'vol', to: T, dur: FADE.out, at: 'unpub', fill: 'forwards' }),
      F.set({ sublabels: { vol: 'deleted' }, podSublabels: { pod: 'deleted' }, at: 'unpub' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
