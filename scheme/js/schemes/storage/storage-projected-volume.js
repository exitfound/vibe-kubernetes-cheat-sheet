import { LANE_DY, P, F, defineCard, BEAT } from './storage-kit.js';
import { g, rect, path } from '../../lib/svg.js';
// Design notes for this card: ./CARDS/storage-projected-volume.md


// One mount as three file rows in the middle, the writer and its source in a column right of them,
// the Pod left of them and a time axis across the floor. The columns are evenly spaced, so the row
// stack and the chip strip centre on the canvas.
const BOX_W = 232, BOX_H = 80;                                    // NET.L-01
const COL_X = 868, COL_CX = COL_X + BOX_W / 2;
const API_Y = 38, API_B = API_Y + BOX_H;
const KUBE_Y = 234, KUBE_MY = KUBE_Y + BOX_H / 2;                 // the gap between the boxes holds the riding tags
const UP_X = COL_CX - LANE_DY, DOWN_X = COL_CX + LANE_DY;

// The mount, in ls order. The middle row is level with the Kubelet, so the write fan is symmetric
// about a straight middle leg, and the read fan out of the rows mirrors it.
const ROW_X = 484, ROW_W = 232, ROW_H = 56, ROW_GAP = 12;
const ROW_R = ROW_X + ROW_W, ROW_CX = ROW_X + ROW_W / 2;
const ROW_Y0 = 178;
const rowY = (i) => ROW_Y0 + i * (ROW_H + ROW_GAP);
const rowMY = (i) => rowY(i) + ROW_H / 2;
const CA = 0, NS = 1, TOK = 2;
const MID_Y = rowMY(NS);                                          // level with KUBE_MY
const BUS_X = 780;                                                // the write bus, rows to Kubelet

// The catalog Pod (NET.L-01), centred on the row stack like the Kubelet, so both fans leave on MID_Y.
const POD_X = 100, POD_W = 232, POD_H = 104;
const POD_Y = MID_Y - POD_H / 2;
const POD_R = POD_X + POD_W;
const DROP_X = 420;                                               // the shared read drop, BUS_X mirrored about 600

// The clock: one scale for every bar, PER_MIN units a minute, so a bar length is a lifetime. The
// axis spans the chip strip exactly, so the floor centres on 600 with the rows and the strip.
const T0_X = 134, PER_MIN = 7, AXIS_R = 1066;
const tx = (min) => T0_X + min * PER_MIN;
const BAR_H = 30;
const BAR1_Y = 400, BAR2_Y = 438, LEGACY_Y = 504;
const LEGACY_CAP_Y = 494, AXIS_Y = 554, TICK_Y = 574;

const CHIP_W = 300, CHIP_GAP = 16, CHIP_H = 34, CHIPS_Y = 592;
const chipX = (i) => 600 - (3 * CHIP_W + 2 * CHIP_GAP) / 2 + i * (CHIP_W + CHIP_GAP);

// Each static wire and its ball share one array.
const W_UP = [[UP_X, KUBE_Y], [UP_X, API_B]];
const W_DOWN = [[DOWN_X, API_B], [DOWN_X, KUBE_Y]];
// The middle row's write and read are straight, the other two turn the same distance either side.
const writeTo = (i) => (i === NS
  ? [[COL_X, KUBE_MY], [ROW_R, MID_Y]]
  : [[COL_X, KUBE_MY], [BUS_X, KUBE_MY], [BUS_X, rowMY(i)], [ROW_R, rowMY(i)]]);
const W_CA = writeTo(CA), W_NS = writeTo(NS), W_TOK = writeTo(TOK);
const readFrom = (i) => (i === NS
  ? [[ROW_X, MID_Y], [POD_R, MID_Y]]
  : [[ROW_X, rowMY(i)], [DROP_X, rowMY(i)], [DROP_X, MID_Y], [POD_R, MID_Y]]);
const R_CA = readFrom(CA), R_NS = readFrom(NS), R_TOK = readFrom(TOK);

// Every ball rides routeDur, which puts all six lanes on the 700ms floor: one leg is one beat.
// Tags ride beside the vertical lanes at the ball's height, since the gap between the boxes is the
// whole leg and any vertical offset would put a tag inside a box.
const UP_TAG = { dx: -66, dy: 0 };
const DOWN_TAG = { dx: 66, dy: 0 };
// Writes and reads carry no tag: the row on the far end is the payload. Only the vertical pair is
// tagged, where what rides is written on neither end.

// Closed at both ends like bar1 and bar2: the caption inside carries the no-expiry meaning.
// P.raw because P.box gives neither the soft fill nor a sublabel-class string.
const legacyBar = () => {
  const y0 = LEGACY_Y, y1 = LEGACY_Y + BAR_H, r = 6;
  const fill = rect({ x: T0_X, y: y0, width: AXIS_R - T0_X, height: BAR_H });
  fill.style.fill = 'var(--diag-fill-soft)';
  const edge = path({ d: `M${T0_X + r},${y0} H${AXIS_R - r} Q${AXIS_R},${y0} ${AXIS_R},${y0 + r} V${y1 - r} Q${AXIS_R},${y1} ${AXIS_R - r},${y1} H${T0_X + r} Q${T0_X},${y1} ${T0_X},${y1 - r} V${y0 + r} Q${T0_X},${y0} ${T0_X + r},${y0} Z` });
  edge.style.fill = 'none';
  edge.style.stroke = 'var(--storage-color)';
  edge.style.strokeWidth = '1.4';
  return g({}, [fill, edge]);
};

export const SCENE = {
  'aria-label': 'Projected volume: Pod api-0 mounts one directory, /var/run/secrets/app, filled from three sources. Kubelet writes ca.crt from ConfigMap vault-ca, namespace from the Pod object through downwardAPI, and token from a serviceAccountToken source: a TokenRequest for the audience vault with a one hour lifetime, bound to the Pod. The app reads three plain files. At 80 percent of the lifetime, or after 24 hours if that comes first, here minute 48, Kubelet requests a fresh token and swaps it into the same file, and the app picks it up when it re-reads. A legacy Secret-based token never expires and never rotates.',
  parts: [
    P.defs(),
    P.box({ key: 'caRow', x: ROW_X, y: rowY(CA), w: ROW_W, h: ROW_H, label: 'ca.crt', sublabel: 'configMap vault-ca', opacity: 0 }),
    P.box({ key: 'nsRow', x: ROW_X, y: rowY(NS), w: ROW_W, h: ROW_H, label: 'namespace', sublabel: 'downwardAPI', opacity: 0 }),
    P.box({ key: 'tokRow', x: ROW_X, y: rowY(TOK), w: ROW_W, h: ROW_H, label: 'token', sublabel: 'serviceAccountToken, aud vault', opacity: 0 }),
    P.pod({
      key: 'pod', innerKey: 'appBox', x: POD_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Pod api-0', sublabel: 'mounts /var/run/secrets/app',
      inner: { dx: 20, dy: 26, w: POD_W - 40, h: 44, label: 'app', sublabel: 'reads three files' },
    }),
    P.box({ key: 'api', x: COL_X, y: API_Y, w: BOX_W, h: BOX_H, label: 'API server', sublabel: 'ConfigMaps, TokenRequest' }),
    P.box({ key: 'kubelet', x: COL_X, y: KUBE_Y, w: BOX_W, h: BOX_H, label: 'Kubelet', sublabel: 'fills the projected volume' }),
    P.box({ key: 'bar1', x: tx(0), y: BAR1_Y, w: tx(60) - tx(0), h: BAR_H, label: 'Token 1, until min 60', opacity: 0 }),
    P.box({ key: 'bar2', x: tx(48), y: BAR2_Y, w: tx(108) - tx(48), h: BAR_H, label: 'Token 2, until min 108', opacity: 0 }),
    P.group({
      key: 'legacyG', opacity: 0,
      parts: [
        P.raw({ make: legacyBar }),
        P.tag({ cls: 'scheme-box-sublabel', x: (T0_X + AXIS_R) / 2, y: LEGACY_Y + BAR_H / 2 + 4, text: 'no expiry, no rotation' }),
      ],
    }),
    P.lane({ key: 'wUp', points: W_UP, dashed: true, dim: true }),
    P.lane({ key: 'wDown', points: W_DOWN, dashed: true, dim: true }),
    P.lane({ key: 'wCa', points: W_CA, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wNs', points: W_NS, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wTok', points: W_TOK, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'rCa', points: R_CA, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'rNs', points: R_NS, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'rTok', points: R_TOK, dashed: true, dim: true, opacity: 0 }),
    // The time axis: one line, and its ticks are text only.
    P.relation({ points: [[T0_X, AXIS_Y], [AXIS_R, AXIS_Y]] }),
    P.tag({ x: tx(0), y: TICK_Y, text: 'min 0' }),
    P.tag({ x: tx(48), y: TICK_Y, text: '48, 80%' }),
    P.tag({ x: tx(60), y: TICK_Y, text: '60' }),
    P.tag({ x: tx(108), y: TICK_Y, text: '108' }),
    // Born with the listing it captions: the Pod sublabel already names the path.
    P.tag({ key: 'mountCap', cls: 'scheme-label code', x: ROW_CX, y: ROW_Y0 - 18, text: '/var/run/secrets/app', opacity: 0 }),
    P.wire({ key: 'legacy', x: (T0_X + AXIS_R) / 2, y: LEGACY_CAP_Y }),
    P.chip({ key: 'dirChip', x: chipX(0), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'dir holds', value: 'nothing yet' }),
    P.chip({ key: 'tokChip', x: chipX(1), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'token file', value: 'not written' }),
    P.chip({ key: 'appChip', x: chipX(2), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'app uses', value: 'nothing yet' }),
    P.packets(),
  ],
  reset: {
    keys: ['caRow', 'nsRow', 'tokRow', 'api', 'kubelet', 'bar1', 'bar2', 'dirChip', 'tokChip', 'appChip'],
    pods: ['pod'],
  },
};

// STO.S-01 as a field: every row, bar, caption and lane born mid-story is pinned on EVERY step, and
// a lane goes with the row on its end (STO.S-02, A-14).
const stage = (o) => ({
  pod: 1, wUp: 1, wDown: 1, mountCap: 0,
  caRow: 0, nsRow: 0, tokRow: 0, wCa: 0, wNs: 0, wTok: 0, rCa: 0, rNs: 0, rTok: 0,
  bar1: 0, bar2: 0, legacyG: 0, ...o,
});
const EMPTY = stage({});
const TWO = stage({ mountCap: 1, caRow: 1, nsRow: 1, wCa: 1, wNs: 1, rCa: 1, rNs: 1 });
const THREE = { ...TWO, tokRow: 1, wTok: 1, rTok: 1, bar1: 1 };
const REFRESHED = { ...THREE, bar2: 1 };
const LEGACY = { ...REFRESHED, legacyG: 1 };

const C_EMPTY = { dirChip: 'nothing yet', tokChip: 'not written', appChip: 'nothing yet' };
const C_CA = { ...C_EMPTY, dirChip: 'ca.crt' };
const C_TWO = { ...C_EMPTY, dirChip: 'ca.crt, namespace' };
const C_THREE = { ...C_TWO, dirChip: 'ca.crt, namespace, token', tokChip: 'token 1, until min 60' };
const C_READ = { ...C_THREE, appChip: 'token 1' };
const C_WRITTEN = { ...C_READ, tokChip: 'token 2, until min 108' };
const C_REREAD = { ...C_WRITTEN, appChip: 'token 2' };
const SHOW = (target) => ({ target, from: 0, to: 1, dur: 300, fill: 'forwards', easing: 'ease-out' });
const NO_CAPTION = { legacy: ' ' };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: C_EMPTY,
    wires: NO_CAPTION,
    opacity: EMPTY,
  },
  {
    id: 'inject',
    duration: 4800,
    narration: 'Pod api-0 mounts one projected volume at /var/run/secrets/app, filled from three sources. Kubelet gets ConfigMap vault-ca from the API server and writes its key as ca.crt, then writes namespace from the Pod object through downwardAPI.',
    chips: C_TWO,
    wires: NO_CAPTION,
    opacity: TWO,
    rewind: { chips: C_EMPTY, opacity: EMPTY },
    lit: ['api'],
    flow: [
      F.route({ points: W_DOWN, delay: BEAT.lead, name: 'cm', lights: ['kubelet'], tag: { text: 'ConfigMap vault-ca', ...DOWN_TAG } }),
      // Each row and its lanes appear together before the write into it leaves (STO.S-02, A-15),
      // and the mount-path caption comes up with the first of them.
      F.fade({ ...SHOW('mountCap'), at: 'cm' }),
      F.fade({ ...SHOW('caRow'), at: 'cm' }),
      F.fade({ ...SHOW('wCa'), at: 'cm' }),
      F.fade({ ...SHOW('rCa'), at: 'cm' }),
      F.route({ points: W_CA, after: 'cm', plus: 250, name: 'ca', lights: ['caRow'] }),
      F.set({ at: 'ca', chips: C_CA }),
      F.light({ targets: ['dirChip'], at: 'ca' }),
      F.fade({ ...SHOW('nsRow'), at: 'ca' }),
      F.fade({ ...SHOW('wNs'), at: 'ca' }),
      F.fade({ ...SHOW('rNs'), at: 'ca' }),
      F.route({ points: W_NS, after: 'ca', plus: 250, name: 'ns', lights: ['nsRow'] }),
      F.set({ at: 'ns', chips: C_TWO }),
    ],
  },
  {
    id: 'request',
    duration: 4800,
    narration: 'The third source, serviceAccountToken, lives in no object. Kubelet sends a TokenRequest for the audience vault and one hour, gets back a token bound to Pod api-0, and writes it as token. A recipient outside that audience should reject it.',
    chips: C_THREE,
    wires: NO_CAPTION,
    opacity: THREE,
    rewind: { chips: C_TWO, opacity: TWO },
    lit: ['kubelet'],
    flow: [
      F.route({ points: W_UP, delay: BEAT.lead, name: 'req', lights: ['api'], tag: { text: 'TokenRequest', ...UP_TAG } }),
      F.route({ points: W_DOWN, after: 'req', plus: 250, name: 'tok', lights: ['kubelet'], tag: { text: 'token 1', ...DOWN_TAG } }),
      F.fade({ ...SHOW('tokRow'), at: 'tok' }),
      F.fade({ ...SHOW('wTok'), at: 'tok' }),
      F.fade({ ...SHOW('rTok'), at: 'tok' }),
      F.route({ points: W_TOK, after: 'tok', plus: 250, name: 'write', lights: ['tokRow', 'bar1'] }),
      F.fade({ ...SHOW('bar1'), at: 'write' }),
      F.set({ at: 'write', chips: C_THREE }),
      F.light({ targets: ['dirChip', 'tokChip'], at: 'write' }),
    ],
  },
  {
    id: 'read',
    duration: 4800,
    narration: 'The app sees one directory, not three sources. It opens ca.crt, namespace and token as plain files and never calls the Kubernetes API to fetch any of them. The token is what it authenticates with.',
    chips: C_READ,
    wires: NO_CAPTION,
    opacity: THREE,
    rewind: { chips: C_THREE },
    lit: ['caRow', 'nsRow', 'tokRow'],
    flow: [
      F.route({ points: R_CA, delay: BEAT.lead, name: 'a', pulse: 'pod' }),
      F.route({ points: R_NS, after: 'a', plus: 100, name: 'b', pulse: 'pod' }),
      F.route({ points: R_TOK, after: 'b', plus: 100, name: 'c', pulse: 'pod' }),
      F.set({ at: 'c', chips: C_READ }),
      F.light({ targets: ['appChip'], at: 'c' }),
    ],
  },
  {
    id: 'refresh',
    duration: 6400,
    narration: 'Kubelet does not wait for the expiry. At 80 percent of the lifetime, or after 24 hours, it requests a fresh token, here at minute 48, and swaps it into the same file atomically. The other two files stay. The app gets token 2 only when it re-reads.',
    chips: C_REREAD,
    wires: NO_CAPTION,
    opacity: REFRESHED,
    rewind: { chips: C_READ, opacity: THREE },
    lit: ['kubelet'],
    flow: [
      F.route({ points: W_UP, delay: BEAT.lead, name: 'req', lights: ['api'], tag: { text: 'TokenRequest', ...UP_TAG } }),
      F.route({ points: W_DOWN, after: 'req', plus: 250, name: 'tok', lights: ['kubelet'], tag: { text: 'token 2', ...DOWN_TAG } }),
      F.route({ points: W_TOK, after: 'tok', plus: 250, name: 'write', lights: ['tokRow', 'bar2'] }),
      F.fade({ ...SHOW('bar2'), at: 'write' }),
      F.set({ at: 'write', chips: C_WRITTEN }),
      F.light({ targets: ['tokChip'], at: 'write' }),
      // The app holds token 1 until it opens the file again.
      F.route({ points: R_TOK, after: 'write', plus: 400, name: 'reread', pulse: 'pod' }),
      F.set({ at: 'reread', chips: C_REREAD }),
      F.light({ targets: ['appChip'], at: 'reread' }),
    ],
  },
  {
    id: 'legacy',
    duration: 3000,
    narration: 'If instead the Pod used a legacy Secret-based token, it would never expire or rotate, and a leaked copy would stay valid until that Secret or its ServiceAccount is deleted. The projected token ends at its expiry, and the API server rejects it once Pod api-0 or its ServiceAccount is deleted.',
    chips: C_REREAD,
    wires: { legacy: 'if instead a legacy Secret token' },
    opacity: LEGACY,
    rewind: { opacity: REFRESHED },
    flow: [
      F.fade({ ...SHOW('legacyG'), dur: 600 }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
