import { P, F, defineCard, BEAT, OPACITY, makeRidingLabel } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-csi-ephemeral-volume.md


// Two regions right of the panel (x<=397), both 420..1160: the claim path that is never made, and
// the Node-1 frame where the inline volume is. The two API objects that ARE read sit left, below it.
const RIGHT_X = 420, RIGHT_W = 740, RIGHT_CX = RIGHT_X + RIGHT_W / 2;       // 420..1160, centre 790

// The ghost row: four boxes on one pitch spanning exactly the frame width, so 4w + 3g = 740.
const GHOST_Y = 40, GHOST_H = 80, GHOST_GAP = 36;                          // 40..120, 56 above the frame
const GHOST_W = (RIGHT_W - 3 * GHOST_GAP) / 4;                            // 158
const ghostX = i => RIGHT_X + i * (GHOST_W + GHOST_GAP);                   // 420 / 614 / 808 / 1002
const GHOST_MID = GHOST_Y + GHOST_H / 2;                                   // 80

// The frame is placed by its CENTRE, not by its rows: the two face midpoints are the only doors
// anything outside uses, so everything else is derived from them. 176 hangs it 56 under the ghost
// row and puts its left door clear of the panel (229.82 at 1100x800) for the column beside it.
const NODE_Y = 176, NODE_H = 320;                                          // 176..496
const NODE_CY = NODE_Y + NODE_H / 2, NODE_BOT = NODE_Y + NODE_H;           // 336: the left door, 496

// Two columns inside the frame. The catalog block: 232 by 80, a Pod 232 by 104.
const BLOCK_W = 232, BLOCK_H = 80, POD_H = 104;
const K_X = 452, D_X = 896;                                                // 452..684, 896..1128
const D_CX = D_X + BLOCK_W / 2;                                            // 1012
const POD_Y = 212, POD_MID = POD_Y + POD_H / 2;                            // 212..316, mid 264
const VOL_H = BLOCK_H, VOL_Y = POD_MID - VOL_H / 2;                        // 224..304, mid on the Pod
// The lane row leaves 36 clear beneath itself, enough for the Node frame without a store duct
// inside it. The store pair meets the frame at its bottom face instead.
const ROW_Y = 380, ROW_MID = ROW_Y + BLOCK_H / 2;                          // 380..460, mid 420
const STORE_Y = 544, STORE_X = RIGHT_CX - BLOCK_W / 2;                     // 544..624, 674..906

// The two API objects stand mirrored about the left door, 52 each side, and their own lanes converge
// on it at one funnel x midway between the column and the frame. The column clears the panel by 14.
const L_X = 60, L_RIGHT = L_X + BLOCK_W;                                   // 60..292
const FUNNEL_X = (L_RIGHT + RIGHT_X) / 2;                                  // 356
const API_MID = NODE_CY - 52, CSID_MID = NODE_CY + 52;                     // 284 / 388
const API_Y = API_MID - BLOCK_H / 2, CSID_Y = CSID_MID - BLOCK_H / 2;      // 244..324 / 348..428

// The store round trip runs straight down and straight up the bottom face as a mirrored pair,
// 24 apart (LANE_DY 12, L-12), so no path runs from the Node face to the plugin. Both API lanes
// end at the left door.
const LANE_DY = 12;

const L_SPEC  = [[L_RIGHT, API_MID], [FUNNEL_X, API_MID], [FUNNEL_X, NODE_CY - LANE_DY],
  [FUNNEL_X, NODE_CY], [RIGHT_X, NODE_CY]];                                           // API server -> Node
const L_MODE  = [[L_RIGHT, CSID_MID], [FUNNEL_X, CSID_MID], [FUNNEL_X, NODE_CY + LANE_DY],
  [FUNNEL_X, NODE_CY], [RIGHT_X, NODE_CY]];                                           // CSIDriver -> Node
const L_PUB   = [[K_X + BLOCK_W, ROW_MID], [D_X, ROW_MID]];                        // Kubelet -> plugin
const L_GET   = [[RIGHT_CX - LANE_DY, NODE_BOT], [RIGHT_CX - LANE_DY, STORE_Y]];    // Node -> store
const L_ANS   = [[RIGHT_CX + LANE_DY, STORE_Y], [RIGHT_CX + LANE_DY, NODE_BOT]];    // store -> Node
const L_WRITE = [[D_CX, ROW_Y], [D_CX, VOL_Y + VOL_H]];                            // plugin -> volume
const L_READ  = [[D_X, POD_MID], [K_X + BLOCK_W, POD_MID]];                        // volume -> Pod

// Every ball carries a name, and at routeDur these 48 to 212 unit legs retire the tag unread.
const LEG_DUR = 1500;
// Every tag lives exactly as long as its ball (M-30a). The two funnel legs end at the Node left face,
// so their tags ride just inside the corridor. The publish leg ends head-on in a block ROOF, so its
// tag rides 50 up, since its string is wider than the 212 gap it crosses and can only clear the two roofs.
const lockstep = makeRidingLabel({ role: 'storage', inMs: 200, outMs: 200, hold: 0 });
// The store pair crosses the Node face directly, while the write and the read run head-on between
// two blocks. Each tag trails its ball on the side away from the block it heads for and emerges once
// clear of that face.
const trailing = makeRidingLabel({ role: 'storage', inMs: 200, outMs: 200, hold: 0, emergeMode: true });
const API_TAG = { fn: lockstep, dx: 46, dy: -6 };
const PUB_TAG = { fn: lockstep, dy: -50 };
// The store pair runs in the 48 unit gap under the frame, so each tag rides in the band its own
// lane leaves free, and each clears the face it ends on by leaving the other side of its ball.
const GET_TAG = { fn: trailing, dx: -50, dy: -12, emerge: 650 };
const ANS_TAG = { fn: trailing, dx: 60, dy: 14, emerge: 650 };
const WRITE_TAG = { fn: trailing, dx: 42, dy: 22, emerge: 700 };
const READ_TAG = { fn: trailing, dx: 45, dy: -14, emerge: 650 };

const ghost = (key, i, label, sublabel = 'not created') => P.box({
  key, x: ghostX(i), y: GHOST_Y, w: GHOST_W, h: GHOST_H, label, sublabel, opacity: OPACITY.notready,
});
const ghostLink = i => P.relation({ points: [[ghostX(i) + GHOST_W, GHOST_MID], [ghostX(i + 1), GHOST_MID]] });
const lane = (key, points) => P.lane({ key, points, dashed: true, dim: true });

// Z-order (bottom -> top): the frame, then the blocks and the Pod, then the ghost row with its
// relations and caption, then the lanes, then the packet layer.
export const SCENE = {
  'aria-label': 'CSI ephemeral volumes: Pod web-0 declares a CSI volume inline, with a driver name and volumeAttributes, and no claim. No PVC, PV or VolumeAttachment is ever created, and no StorageClass is read. Kubelet checks that the CSIDriver object lists the Ephemeral lifecycle mode, then calls NodePublishVolume on the node plugin directly, with no attach and no stage. Here the driver is the Secrets Store driver: its attributes name a SecretProviderClass, whose provider fetches db-password from an external store, and the driver creates the volume and writes the file. Only then does the container start and read it at /mnt/secrets. When the Pod is deleted and its containers have stopped, Kubelet calls NodeUnpublishVolume and the driver deletes the volume, so it lives and dies with the Pod.',
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
    P.tag({ x: RIGHT_CX, y: GHOST_Y - 14, text: 'the claim path: never taken by an inline volume' }),
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
    duration: 3600,
    narration: 'Pod web-0 declares a CSI volume inline: just the driver name and a few volumeAttributes. It names no claim, so no PVC, PV or VolumeAttachment is ever created, and no StorageClass is read. The Pod lands on Node-1 and Kubelet picks up its spec.',
    sublabels: NOT_YET,
    podSublabels: WAIT,
    opacity: stage(),
    // The API server acts first: lit at entry, it sends on BEAT.lead and Kubelet lights on arrival.
    lit: ['api'],
    flow: [
      F.route({ points: L_SPEC, delay: BEAT.lead, dur: LEG_DUR, lights: ['kubelet'] }),
      F.tag({ text: 'Pod web-0', points: L_SPEC, delay: BEAT.lead, dur: LEG_DUR, ...API_TAG }),
    ],
  },
  {
    id: 'gate',
    duration: 3800,
    narration: 'Kubelet checks the CSIDriver object for this driver. It lists Ephemeral in volumeLifecycleModes, so inline use is allowed. Without that mode Kubelet refuses the mount. The attributes come straight from the Pod author, so removing the mode, or a webhook, is how an admin says no.',
    sublabels: NOT_YET,
    podSublabels: WAIT,
    opacity: stage(),
    lit: ['csid'],
    flow: [
      F.route({ points: L_MODE, delay: BEAT.lead, dur: LEG_DUR, lights: ['kubelet'] }),
      F.tag({ text: 'Ephemeral', points: L_MODE, delay: BEAT.lead, dur: LEG_DUR, ...API_TAG }),
    ],
  },
  {
    id: 'publish',
    duration: 3600,
    narration: 'Kubelet calls NodePublishVolume on the node plugin directly. There is no ControllerPublishVolume and no NodeStageVolume. The volumeAttributes travel in the call as written, and the volume id is a hash Kubelet makes of the Pod UID and the volume name, since there is no PV to take a handle from.',
    sublabels: NOT_YET,
    podSublabels: WAIT,
    opacity: stage(),
    lit: ['kubelet'],
    flow: [
      F.route({ points: L_PUB, delay: BEAT.lead, dur: LEG_DUR, lights: ['plugin'] }),
      F.tag({ text: 'NodePublishVolume', points: L_PUB, delay: BEAT.lead, dur: LEG_DUR, ...PUB_TAG }),
    ],
  },
  {
    id: 'fetch',
    duration: 5000,
    narration: 'The driver has to create the volume inside that one call. Here it is the Secrets Store driver: its attributes name a SecretProviderClass, and the provider plugin that class names fetches db-password from the external store while the driver waits.',
    sublabels: NOT_YET,
    podSublabels: WAIT,
    opacity: stage(),
    // The store lights as the request lands, so the answer leaves a lit sender one hop later.
    lit: ['plugin'],
    flow: [
      F.route({ points: L_GET, delay: BEAT.lead, dur: LEG_DUR, name: 'get', lights: ['store'] }),
      F.tag({ text: 'get db-password', points: L_GET, delay: BEAT.lead, dur: LEG_DUR, ...GET_TAG }),
      F.route({ points: L_ANS, after: 'get', dur: LEG_DUR }),
      F.tag({ text: 'db-password', points: L_ANS, after: 'get', dur: LEG_DUR, ...ANS_TAG }),
    ],
  },
  {
    id: 'mount',
    duration: 5600,
    narration: 'With db-password in hand the driver creates the volume at the path Kubelet gave it and writes db-password into it. Only then does Kubelet start the container, so the Pod turns Running and the app reads db-password at /mnt/secrets like any other file.',
    sublabels: HOLDS,
    podSublabels: { pod: 'Running' },
    opacity: stage({ vol: 1 }),
    lit: ['plugin'],
    // The volume comes into existence as the write lands and the container starts, so the Pod turns
    // Running there. The app then reads the file. The rewind puts the animated path back to before.
    rewind: { sublabels: NOT_YET, podSublabels: WAIT, opacity: { vol: PEND } },
    flow: [
      F.route({ points: L_WRITE, delay: BEAT.lead, dur: LEG_DUR, name: 'write', lights: ['vol'] }),
      F.tag({ text: 'db-password', points: L_WRITE, delay: BEAT.lead, dur: LEG_DUR, ...WRITE_TAG }),
      F.reveal({ target: 'vol', from: PEND, at: 'write' }),
      F.set({ sublabels: HOLDS, podSublabels: { pod: 'Running' }, at: 'write' }),
      F.route({ points: L_READ, after: 'write', dur: LEG_DUR, name: 'read' }),
      F.tag({ text: 'db-password', points: L_READ, after: 'write', dur: LEG_DUR, ...READ_TAG }),
      F.pulse({ pod: 'pod', at: 'read' }),
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
    // The Pod blinks BEFORE it goes (M-08), Kubelet sends the unpublish once it is gone, and the
    // volume ghosts on that arrival. The rewind starts both at full for the animated path.
    rewind: { sublabels: HOLDS, podSublabels: { pod: 'Running' }, opacity: stage({ vol: 1 }) },
    flow: [
      F.route({ points: L_SPEC, delay: BEAT.lead, dur: LEG_DUR, name: 'kill', lights: ['kubelet'] }),
      F.tag({ text: 'Pod deleted', points: L_SPEC, delay: BEAT.lead, dur: LEG_DUR, ...API_TAG }),
      F.pulse({ pod: 'pod', at: 'kill' }),
      F.fade({ target: 'pod', to: T, dur: 700, at: 'kill', plus: BEAT.afterPulse, fill: 'forwards', name: 'gone' }),
      F.set({ podSublabels: { pod: 'Terminating' }, at: 'kill', plus: BEAT.afterPulse }),
      F.route({ points: L_PUB, after: 'gone', dur: LEG_DUR, name: 'unpub', lights: ['plugin'] }),
      F.tag({ text: 'NodeUnpublishVolume', points: L_PUB, after: 'gone', dur: LEG_DUR, ...PUB_TAG }),
      F.fade({ target: 'vol', to: T, dur: 700, at: 'unpub', fill: 'forwards' }),
      F.set({ sublabels: { vol: 'deleted' }, podSublabels: { pod: 'deleted' }, at: 'unpub' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
