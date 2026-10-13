import { LANE_DY, P, F, defineCard, laneY, strip, midX, CLU } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-admission-chain.md

const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;

// kubectl, ETCD and the chip strip share one inset band, so their edges line up by construction.
const BAND_INSET = 40;
const BAND_L = CONTENT_L + BAND_INSET, BAND_R = CONTENT_R - BAND_INSET;

const KCTL_X = BAND_L, KCTL_W = 232, KCTL_H = 80;
const KCTL_Y = 300;
const KCTL_CX = KCTL_X + KCTL_W / 2;                     // both lanes straddle this

const TOP_Y = 60, TOP_H = 80, TOP_BOTTOM = TOP_Y + TOP_H;
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);
// The column is as wide as the longest ladder rung, and the API is centred over it.
const COL_X = 420, COL_W = 400;
const API_W = 232, API_CX = midX(COL_X, COL_X + COL_W);
const API_X = API_CX - API_W / 2, API_R = API_X + API_W;
// Optical: a cylinder wall flush with a rounded rect reads as overhanging, so pull it in by the rx.
const ETCD_OPTICAL = 4;
const ETCD_W = 140, ETCD_X = BAND_R - ETCD_OPTICAL - ETCD_W;
const { out: OUT_Y, back: BACK_Y } = laneY(TOP_CY, LANE_DY);
const ETCD_MID = midX(API_R, ETCD_X);                    // the gutter the two ETCD wire labels share

// Both lanes leave the kubectl TOP face, out left of back at both ends so they never cross.
const { out: KCTL_OUT_X, back: KCTL_BACK_X } = laneY(KCTL_CX, LANE_DY);
const KCTL_TO_API = [[KCTL_OUT_X, KCTL_Y], [KCTL_OUT_X, OUT_Y], [API_X, OUT_Y]];
const API_TO_KCTL = [[API_X, BACK_Y], [KCTL_BACK_X, BACK_Y], [KCTL_BACK_X, KCTL_Y]];

const LADDER_X = COL_X, LADDER_W = COL_W;                // the pipeline hangs under the API
const LADDER_Y = 220;
// A relation, not a route: the five stages ARE the API, so nothing travels down there.
const API_TO_CHAIN = [[API_CX, TOP_BOTTOM], [API_CX, LADDER_Y]];

const CHIP_H = 34, CHIPS_Y = 520, CHIP_GAP = 20;
const { w: CHIP_W, x: CHIP_X } = strip({ from: BAND_L, to: BAND_R, count: 2, gap: CHIP_GAP });

// The list order is the z-order: the three top-row blocks go last.
export const SCENE = {
  'aria-label': 'The write path through the API: authentication and authorization, then mutating admission, schema validation and validating admission, then the write to ETCD',
  parts: [
    P.defs(),
    P.chip({ key: 'objChip', x: CHIP_X(0), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'Pod object', value: '{cpu=100m}' }),
    // A standing configuration value, not a per-step state: it never reads "none".
    P.chip({ key: 'failurePolicy', x: CHIP_X(1), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'failurePolicy', value: 'Fail | Ignore' }),
    P.lane({ points: KCTL_TO_API, dim: true, dashed: true }),
    P.lane({ points: API_TO_KCTL, dim: true, dashed: true }),
    P.arrow({ x1: API_R, y1: OUT_Y, x2: ETCD_X, y2: OUT_Y, dim: true, dashed: true }),
    P.arrow({ x1: ETCD_X, y1: BACK_Y, x2: API_R, y2: BACK_Y, dim: true, dashed: true }),
    P.relation({ points: API_TO_CHAIN }),
    P.wire({ key: 'req', x: API_CX, y: 46 }),
    P.wire({ key: 'resp', x: KCTL_CX, y: KCTL_Y + KCTL_H + 26 }),
    P.wire({ key: 'write', x: ETCD_MID, y: OUT_Y - 11 }),
    P.wire({ key: 'commit', x: ETCD_MID, y: BACK_Y + 22 }),
    P.packets(),
    P.chain({
      key: 'chain', x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: 32, gap: 12,
      // One row per step. The runs of spaces are source alignment only: SVG <text> collapses them.
      items: [
        '1. authn, authz ·  who the caller is, what they may do',
        '2. mutating     ·  plugins, policies and webhooks',
        '3. schema       ·  required fields and values checked',
        '4. validating   ·  plugins, policies and webhooks',
        '5. persist      ·  write final object to ETCD',
      ],
    }),
    P.box({ key: 'kubectl', x: KCTL_X, y: KCTL_Y, w: KCTL_W, h: KCTL_H, label: 'kubectl', sublabel: 'POST /api/v1/...' }),
    P.box({ key: 'api', x: API_X, y: TOP_Y, w: API_W, h: TOP_H, label: 'API', sublabel: 'admission pipeline' }),
    // labelY centres the label optically under the cap.
    P.cylinder({ key: 'etcdC', x: ETCD_X, y: TOP_Y - 10, w: ETCD_W, h: TOP_H + 20, label: 'ETCD', labelY: 60 }),
  ],
  reset: { keys: ['kubectl', 'api', 'etcdC', 'objChip', 'failurePolicy'] },
};

const AT_REST = { objChip: '{cpu=100m}', failurePolicy: 'Fail | Ignore' };
// sa=default is the ServiceAccount plugin, runAsNonRoot=true the policy webhook: both actors leave a trace.
const MUTATED = { objChip: '{cpu=100m, sa=default, runAsNonRoot=true}', failurePolicy: 'Fail | Ignore' };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: AT_REST,
  },
  {
    id: 'authn-authz',
    duration: 2800,
    narration: 'Already done, and not admission at all. Admission runs after authentication, so every caller has an identity, even system:anonymous. Authorizers run in configured order, commonly Node then RBAC, and the first to allow or to deny ends it, so no later one runs. Nothing allowing it means 403.',
    chips: AT_REST,
    wires: { req: 'POST /api/v1/namespaces/default/pods' },
    lit: ['kubectl'],
    chain: [0],
    flow: [F.route({ points: KCTL_TO_API, lights: ['api'] })],
  },
  {
    id: 'mutating',
    duration: 4000,
    narration: 'Pluggable plus built-in. Always-on mutating plugins like ServiceAccount, LimitRanger and DefaultTolerationSeconds rewrite the Pod here, MutatingAdmissionPolicy runs CEL mutations in process, and MutatingWebhookConfiguration adds external policy webhooks (Kyverno, OPA Gatekeeper, sidecar injectors) on top, all before validation. Their failurePolicy decides whether a timeout blocks the write.',
    chips: MUTATED,
    // Static highlights only (M-26, M-01).
    lit: ['objChip', 'failurePolicy', 'api'],
    chain: [1],
  },
  {
    id: 'schema',
    duration: 1700,
    narration: 'Built-in. The API validates the mutated object for its kind, so a missing required field or a value outside its allowed range fails here, before any validating webhook runs.',
    chips: MUTATED,
    // Static highlights only (M-26, M-01).
    lit: ['objChip', 'api'],
    chain: [2],
  },
  {
    id: 'validating',
    duration: 2700,
    // Not "called last": ResourceQuota runs after the validating webhooks (AllOrderedPlugins).
    narration: 'Pluggable plus built-in. LimitRanger is back to check min and max, ValidatingAdmissionPolicy runs in process, validating webhooks call out over HTTPS, and ResourceQuota runs after all of them. None may mutate, and any deny aborts the request. See the ResourceQuota and LimitRange card.',
    chips: MUTATED,
    // Static highlights only (M-26, M-01).
    lit: ['objChip', 'failurePolicy', 'api'],
    chain: [3],
  },
  {
    id: 'persist',
    duration: 3300,
    narration: 'Built-in. The API writes the final object to ETCD via Raft. Once ETCD commits, the API returns HTTP 201 Created to the client and every watch that matches the new Pod receives an ADDED event so informers can update their caches.',
    chips: MUTATED,
    wires: { write: 'final object', commit: 'commit ack', resp: 'HTTP 201 Created' },
    lit: ['api'],
    chain: [4],
    flow: [
      F.segment({ from: [API_R, OUT_Y], to: [ETCD_X, OUT_Y], name: 'write', lights: ['etcdC'] }),
      F.segment({ from: [ETCD_X, BACK_Y], to: [API_R, BACK_Y], after: 'write', name: 'commit' }),
      F.route({ points: API_TO_KCTL, after: 'commit', lights: ['kubectl'] }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
