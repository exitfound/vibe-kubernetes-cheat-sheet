import { P, F, defineCard, laneY, strip, midX } from './cluster-kit.js';

// Design notes for this card: ./CARDS.md#cluster-admission-webhooks

// Laid out on the L. Panel x<=397 y<=230, kubectl at KCTL_Y 300: 70 units of clearance. The depth
// is a LINE count, not a character count, so measure it: ./CARDS.md BUDGET says with what.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
// Reserved narration corner: 400 x 230. Nothing on this card derives from it, and the measured
// worst case per viewport is in the header note above.

// The flanks stand on one inset band, not on the content edges: kubectl, ETCD and the chip strip
// share BAND_L / BAND_R, so their edges line up by construction and the card still centres on 600.
const BAND_INSET = 40;
const BAND_L = CONTENT_L + BAND_INSET, BAND_R = CONTENT_R - BAND_INSET;   // 100 / 1100

const KCTL_X = BAND_L, KCTL_W = 240, KCTL_H = 80;       // 100..340
const KCTL_Y = 300;                                      // 300..380
const KCTL_CX = KCTL_X + KCTL_W / 2;                     // 220, both lanes straddle this

const TOP_Y = 60, TOP_H = 80, TOP_BOTTOM = TOP_Y + TOP_H;// 60 / 140
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);                  // 100
const API_X = 420, API_W = 400, API_R = API_X + API_W;   // 420..820
const API_CX = midX(API_X, API_R);                       // 620
// Optical, not geometric: a straight cylinder wall flush with a rounded rect READS as overhanging,
// because rx=4 pulls the chip's own edge in. Pull the cylinder in by that rx.
const ETCD_OPTICAL = 4;
const ETCD_W = 140, ETCD_X = BAND_R - ETCD_OPTICAL - ETCD_W;   // 956..1096
const LANE_DY = 15;
const { out: OUT_Y, back: BACK_Y } = laneY(TOP_CY, LANE_DY);   // 85 / 115
// The 136-unit gutter between the Api and ETCD, which is what the two ETCD wire labels have.
const ETCD_MID = midX(API_R, ETCD_X);                    // 888

// Both lanes leave the kubectl TOP face, one right angle each, out left of back at both ends so they
// never cross. 78% and 61% of the two runs sit behind the panel: an accepted cost, see ./CARDS.md.
const { out: KCTL_OUT_X, back: KCTL_BACK_X } = laneY(KCTL_CX, LANE_DY);   // 205 / 235
const KCTL_TO_API = [[KCTL_OUT_X, KCTL_Y], [KCTL_OUT_X, OUT_Y], [API_X, OUT_Y]];
const API_TO_KCTL = [[API_X, BACK_Y], [KCTL_BACK_X, BACK_Y], [KCTL_BACK_X, KCTL_Y]];

const LADDER_X = API_X, LADDER_W = API_W;                // the pipeline hangs under the API
const LADDER_Y = 220;
// A relationship, not a route: the five stages below ARE the API, so nothing travels down there.
// No arrowhead, and it lands ON the ladder edge rather than short of it.
const API_TO_CHAIN = [[API_CX, TOP_BOTTOM], [API_CX, LADDER_Y]];

const CHIP_H = 34, CHIPS_Y = 520, CHIP_GAP = 20;
// Fixed gap, derived width: the pair must span the inset band exactly, so the gap is the input.
const { w: CHIP_W, x: CHIP_X } = strip({ from: BAND_L, to: BAND_R, count: 2, gap: CHIP_GAP });  // 490, 100 / 610

// The list order IS the append order, so it is the z-order: chips and lanes first, the packet layer
// under the chain, and the three top-row blocks absolute last.
export const SCENE = {
  'aria-label': 'The write path through the API: authentication and authorization, then mutating admission, schema validation and validating admission, then the write to ETCD',
  parts: [
    P.defs(),
    // Chip strip: it spans the same inset band as the flanks, so its left edge is the kubectl left
    // edge and its right edge is the ETCD right edge, one vertical line down each side.
    P.chip({ key: 'objChip', x: CHIP_X(0), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'Pod object', value: '{cpu=100m}' }),
    // A STANDING configuration value, not a per-step state: failurePolicy is a field on the webhook
    // configurations and does not become "none" while the request sits in the schema step.
    P.chip({ key: 'failurePolicy', x: CHIP_X(1), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'failurePolicy', value: 'Fail | Ignore' }),
    // Out (request) at y=85, return (response) at y=115: the pair straddles the API face centre
    // (y=100) symmetrically, the same way both lanes straddle the kubectl top face centre at x=220.
    P.lane({ points: KCTL_TO_API, dim: true, dashed: true }),
    P.lane({ points: API_TO_KCTL, dim: true, dashed: true }),
    P.arrow({ x1: API_R, y1: OUT_Y, x2: ETCD_X, y2: OUT_Y, dim: true, dashed: true }),
    P.arrow({ x1: ETCD_X, y1: BACK_Y, x2: API_R, y2: BACK_Y, dim: true, dashed: true }),
    P.relation({ points: API_TO_CHAIN }),
    P.wire({ key: 'req', x: API_CX, y: 46 }),
    // Centred under kubectl now that both lanes leave its top face: the gap to its right is down to
    // 80 units, and the whole band below the box is empty until the chip strip at y=520.
    P.wire({ key: 'resp', x: KCTL_CX, y: KCTL_Y + KCTL_H + 26 }),
    // One label per ETCD hop, stacked in the gutter: above the out lane at y=85, below the back
    // lane at y=115. Both clear the Api right edge at 820 and the cylinder left edge at 956.
    P.wire({ key: 'write', x: ETCD_MID, y: 74 }),
    P.wire({ key: 'commit', x: ETCD_MID, y: 137 }),
    P.packets(),
    P.chain({
      key: 'chain', x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: 32, gap: 12,
      // ONE row per STEP, or every number runs ahead of the step counter the reader is watching.
      // The runs of spaces are SOURCE alignment only: SVG <text> collapses them. Do not size off them.
      items: [
        '1. authn, authz ·  who the caller is, what they may do',
        '2. mutating     ·  plugins and webhooks rewrite it',
        '3. schema       ·  required fields and values checked',
        '4. validating   ·  plugins, policies and webhooks',
        '5. persist      ·  write final object to ETCD',
      ],
    }),
    // The Api and its ladder hold the middle column; kubectl and ETCD are the flanks, both standing
    // on the inset band so the drawing centres on 600 without either of them touching a content edge.
    P.box({ key: 'kubectl', x: KCTL_X, y: KCTL_Y, w: KCTL_W, h: KCTL_H, label: 'kubectl', sublabel: 'POST /api/v1/...' }),
    P.box({ key: 'api', x: API_X, y: TOP_Y, w: API_W, h: TOP_H, label: 'API', sublabel: 'admission pipeline' }),
    // labelY centres the cylinder label optically: the default h/2 baseline reads high under the cap,
    // and a full nudge to the body-below-cap centre reads low. y=60 (glyph centre ~106) balances both.
    P.cylinder({ key: 'etcdC', x: ETCD_X, y: TOP_Y - 10, w: ETCD_W, h: TOP_H + 20, label: 'ETCD', labelY: 60 }),
  ],
  reset: { keys: ['kubectl', 'api', 'etcdC', 'objChip', 'failurePolicy'] },
};

const AT_REST = { objChip: '{cpu=100m}', failurePolicy: 'Fail | Ignore' };
// One field per half of the step: sa=default is ServiceAccount, an always-on plugin, and
// runAsNonRoot=true is the policy webhook, so both actors the narration names leave a trace.
const MUTATED = { objChip: '{cpu=100m, sa=default, runAsNonRoot=true}', failurePolicy: 'Fail | Ignore' };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: AT_REST,
  },
  {
    id: 'authn-authz',
    // The top-face exit makes the request route 430 units, a 956ms glide. One ball, span 1516.
    duration: 2800,
    narration: 'Already done, and not admission at all. Admission runs after authentication, so every caller has an identity, even system:anonymous. Authorizers run in configured order, commonly Node then RBAC, and the first to allow or to deny ends it, so no later one runs. Nothing allowing it means 403.',
    chips: AT_REST,
    wires: { req: 'POST /api/v1/namespaces/default/pods' },
    lit: ['kubectl'],
    chain: [0],
    // One hop, Kubectl → Api. The Api is its receiver, so it lights when the request lands rather
    // than at entry. Nothing rides down to the ladder: those five stages are the Api itself.
    flow: [F.route({ points: KCTL_TO_API, lights: ['api'] })],
  },
  {
    id: 'mutating',
    duration: 3400,
    narration: 'Pluggable plus built-in. Always-on mutating plugins like ServiceAccount, LimitRanger and DefaultTolerationSeconds rewrite the Pod here, and MutatingWebhookConfiguration adds external policy webhooks (Kyverno, OPA Gatekeeper, sidecar injectors) on top, all before validation. Their failurePolicy decides whether a timeout blocks the write.',
    chips: MUTATED,
    // Everything this stage touches is a STATIC highlight, the Api included: a chip never flashes
    // (M-26) and infrastructure never pulses (M-01). Nothing on this step moves.
    lit: ['objChip', 'failurePolicy', 'api'],
    chain: [1],
  },
  {
    id: 'schema',
    duration: 1700,
    narration: 'Built-in. The API validates the mutated object for its kind, so a missing required field or a value outside its allowed range fails here, before any validating webhook runs.',
    chips: MUTATED,
    // Schema validation happens inside the Api, so the Api is what lights, statically, and the
    // object under check is lit beside it (M-26, M-01).
    lit: ['objChip', 'api'],
    chain: [2],
  },
  {
    id: 'validating',
    duration: 2700,
    // NOT "called last": AllOrderedPlugins ends validatingwebhook, resourcequota, deny, so a webhook
    // that admits an object can still be followed by a quota denial.
    narration: 'Pluggable plus built-in. LimitRanger is back to check min and max, ValidatingAdmissionPolicy runs in process, validating webhooks call out over HTTPS, and ResourceQuota runs after all of them. None may mutate, and any deny aborts the request. See the ResourceQuota and LimitRange card.',
    chips: MUTATED,
    // Lit, never flashed or pulsed (M-26, M-01): the policy chip, the Api, and objChip for the
    // reason the schema step lights it, this stage checks that same object. Why: ./CARDS.md
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
    // Three arrow segments, sequenced. Each packet is visible only on its own arrow. The Api is
    // the source and stays lit from entry; ETCD lights on the write landing, like kubectl below.
    flow: [
      F.segment({ from: [API_R, OUT_Y], to: [ETCD_X, OUT_Y], name: 'write', lights: ['etcdC'] }),
      F.segment({ from: [ETCD_X, BACK_Y], to: [API_R, BACK_Y], after: 'write', name: 'commit' }),
      F.route({ points: API_TO_KCTL, after: 'commit', lights: ['kubectl'] }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
