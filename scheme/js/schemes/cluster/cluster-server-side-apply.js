import { P, F, defineCard, laneY, ladder, strip, midX, shade, CLU, FADE, OPACITY, REVEAL_MS } from './cluster-kit.js';

// Design notes for this card: ./CARDS.md#cluster-server-side-apply

// The ledger IS the card, so the object is drawn as a three column table (field, value, manager) and
// everything else is sized around it. Measured panel and the character ceiling it implies: ./CARDS.md.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140

// Top row: the two field managers flanking the API, all three right of the panel at x=420.
const BOX_W = 200, BOX_H = CLU.BOX_H, TOP_GAP = 60;
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;     // 40 / 120
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);                  // 80
const KCTL_X = 420, KCTL_R = KCTL_X + BOX_W;             // 420..620
const API_X = KCTL_R + TOP_GAP, API_R = API_X + BOX_W;   // 680..880
const API_CX = midX(API_X, API_R);                       // 780
const HPA_X = API_R + TOP_GAP;                           // 940..1140
const LANE_DY = CLU.LANE_DY;
const { out: OUT_Y, back: BACK_Y } = laneY(TOP_CY, LANE_DY);   // 68 / 92

// A 60 unit gap cannot hold a wire label between two blocks, so requests take a register above the
// row and answers one below it, each centred on its own gap.
const WIRE_REQ_Y = TOP_Y - 14;                           // 26
const WIRE_ACK_Y = TOP_BOTTOM + 26;                      // 146
const WIRE_KA_X = midX(KCTL_R, API_X);                   // 650
const WIRE_AH_X = midX(API_R, HPA_X);                    // 910

const KCTL_TO_API = [[KCTL_R, OUT_Y], [API_X, OUT_Y]];
const API_TO_KCTL = [[API_X, BACK_Y], [KCTL_R, BACK_Y]];
const HPA_TO_API  = [[HPA_X, OUT_Y], [API_R, OUT_Y]];
const API_TO_HPA  = [[API_R, BACK_Y], [HPA_X, BACK_Y]];

// The object, centred on API_CX so the tie from the API is one straight drop onto a face midpoint.
const OBJ_X = KCTL_X, OBJ_W = CONTENT_R - OBJ_X;         // 420..1140
const OBJ_CX = midX(OBJ_X, CONTENT_R);                   // 780, equal to API_CX by construction
const OBJ_Y = 180, OBJ_PAD = 18;
const ROW_H = 56, ROW_GAP = 16, ROWS = 4;
const OBJ_H = OBJ_PAD * 2 + ROWS * ROW_H + (ROWS - 1) * ROW_GAP;   // 308, so 180..488
const ROW_Y = ladder({ y: OBJ_Y + OBJ_PAD, rowH: ROW_H, gap: ROW_GAP });
const CELL_GAP = 12;
const COL_L = OBJ_X + OBJ_PAD, COL_R = OBJ_X + OBJ_W - OBJ_PAD;    // 438 / 1122
const MGR_W = 170, VAL_W = 120;
const MGR_X = COL_R - MGR_W;                             // 952..1122
const VAL_X = MGR_X - CELL_GAP - VAL_W;                  // 820..940
const FLD_X = COL_L, FLD_W = VAL_X - CELL_GAP - COL_L;   // 438..808
// The API HOLDS this object, it never drives it, so no ball rides this and it takes no arrowhead.
const API_TO_OBJ = [[API_CX, TOP_BOTTOM], [OBJ_CX, OBJ_Y]];
const CAP_Y = OBJ_Y - 10;                                // 170, left anchored so the drop misses it

// The mechanism this replaces, in the corner the panel frees once its text ends.
const LEG_X = CONTENT_L, LEG_W = 340;                    // 60..400
const LEG_CAP_Y = 366;
const LEG_Y = 380, LEG_H = 40, LEG_GAP = 10;             // 380..420 / 430..470 / 480..520
const LEG_ROW_Y = ladder({ y: LEG_Y, rowH: LEG_H, gap: LEG_GAP });

const CHIP_H = CLU.CHIP_H, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = 548;                                     // second row ends on 624
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;                               // 532
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// The strip is read as a GRID: the index wraps across the two columns and steps down every second.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

const FIELDS = [
  'spec.replicas',
  'spec.minReadySeconds',
  'metadata.labels.app',
  'spec.template.spec.containers[0].image',
];

// PATCH with application/apply-patch+yaml is a standing fact about the verb rather than a per-step
// state, the same shape failurePolicy has on the webhook card, so every step restates it.
const REQUEST = 'PATCH · application/apply-patch+yaml';

// The list order IS the append order, so it is the z-order: the three top-row blocks go absolute
// last, so a ball passes BEHIND them.
export const SCENE = {
  'aria-label': 'Server-side apply and field ownership: the API records a field manager for every field an apply sets, keeps that ledger in managedFields on the object, and refuses a second manager that tries to change a field it does not own',
  parts: [
    P.defs(),
    // The API holds the object below it. A relationship, so no arrowhead and no ball on any step.
    P.relation({ points: API_TO_OBJ }),
    // The object frame carries stroke only, so the row cells inside do not double its fill.
    P.box({
      key: 'obj', x: OBJ_X, y: OBJ_Y, w: OBJ_W, h: OBJ_H, rx: 8,
      tune: (el) => { const r = el.querySelector('.scheme-box-rect'); if (r) r.style.fill = 'transparent'; },
    }),
    P.tag({ x: OBJ_X, y: CAP_Y, anchor: 'start', text: 'Deployment web · metadata.managedFields' }),
    // One wrapping g per row, so a field that leaves the object dims as a whole rather than in parts.
    ...FIELDS.map((f, i) => P.group({
      id: `row${i}`, key: `r${i}`,
      parts: [
        P.box({ key: `f${i}`, x: FLD_X, y: ROW_Y(i), w: FLD_W, h: ROW_H, label: f }),
        P.box({ key: `v${i}`, x: VAL_X, y: ROW_Y(i), w: VAL_W, h: ROW_H, label: 'Not set' }),
        P.box({ key: `m${i}`, x: MGR_X, y: ROW_Y(i), w: MGR_W, h: ROW_H, label: 'none', sublabel: 'not owned' }),
      ],
    })),
    // The client-side path, held at OPACITY.notready until the step that compares the two.
    P.tag({ x: LEG_X, y: LEG_CAP_Y, anchor: 'start', text: 'client-side apply · the three-way merge' }),
    P.box({ key: 'leg0', x: LEG_X, y: LEG_ROW_Y(0), w: LEG_W, h: LEG_H, label: 'last-applied-configuration' }),
    P.box({ key: 'leg1', x: LEG_X, y: LEG_ROW_Y(1), w: LEG_W, h: LEG_H, label: 'The file on your disk' }),
    P.box({ key: 'leg2', x: LEG_X, y: LEG_ROW_Y(2), w: LEG_W, h: LEG_H, label: 'The live object' }),
    // Wire and ball are built from the SAME points array, so the two cannot drift apart.
    ...[KCTL_TO_API, API_TO_KCTL, HPA_TO_API, API_TO_HPA].map(p => P.arrow({ from: p[0], to: p[1], dim: true, dashed: true })),
    P.wire({ key: 'req-k', x: WIRE_KA_X, y: WIRE_REQ_Y }),
    P.wire({ key: 'ack-k', x: WIRE_KA_X, y: WIRE_ACK_Y }),
    P.wire({ key: 'req-h', x: WIRE_AH_X, y: WIRE_REQ_Y }),
    P.wire({ key: 'ack-h', x: WIRE_AH_X, y: WIRE_ACK_Y }),
    P.chip({ key: 'applyChip',    x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'last apply',             value: 'none' }),
    P.chip({ key: 'ledgerChip',   x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'metadata.managedFields', value: 'no entries' }),
    P.chip({ key: 'conflictChip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'last conflict',          value: 'none' }),
    P.chip({ key: 'requestChip',  x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'apply request',          value: REQUEST }),
    P.packets(),
    // Top row last, so a ball passes behind the blocks rather than over their labels.
    P.box({ key: 'kctl', x: KCTL_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'kubectl',        sublabel: 'apply --server-side' }),
    P.box({ key: 'api',  x: API_X,  y: TOP_Y, w: BOX_W, h: BOX_H, label: 'API',            sublabel: 'tracks field ownership' }),
    P.box({ key: 'hpa',  x: HPA_X,  y: TOP_Y, w: BOX_W, h: BOX_H, label: 'hpa-controller', sublabel: 'applies spec.replicas' }),
  ],
  // No pods on this card, so no pods list: nothing here is ever pulsed.
  reset: {
    keys: [
      'kctl', 'api', 'hpa', 'obj',
      'f0', 'f1', 'f2', 'f3', 'v0', 'v1', 'v2', 'v3', 'm0', 'm1', 'm2', 'm3',
      'leg0', 'leg1', 'leg2',
      'applyChip', 'ledgerChip', 'conflictChip', 'requestChip',
    ],
  },
};

// The three row phases. A field that has left the object dims rather than vanishing, because a
// removed row would leave a row-sized hole in a table that is on screen for the whole card.
const PENDING = 0, LIVE = 1, GONE = 2;
const ROW_SHADE = [OPACITY.pending, 1, OPACITY.terminated];

// The worked example, one row per field. The two right hand cells are spelled with the primitive's
// own key names so the inline casing lint reads them where they are written.
const NOT_SET  = { val: { label: 'Not set' },    mgr: { label: 'none',           sublabel: 'not owned' },       state: PENDING };
const REMOVED  = { val: { label: 'Removed' },    mgr: { label: 'none',           sublabel: 'not owned' },       state: GONE };
const REPLICAS = { val: { label: '3' },          mgr: { label: 'kubectl',        sublabel: 'operation Apply' }, state: LIVE };
const MINREADY = { val: { label: '10' },         mgr: { label: 'kubectl',        sublabel: 'operation Apply' }, state: LIVE };
const APPLABEL = { val: { label: 'web' },        mgr: { label: 'kubectl',        sublabel: 'operation Apply' }, state: LIVE };
const IMAGE    = { val: { label: 'nginx:1.27' }, mgr: { label: 'kubectl',        sublabel: 'operation Apply' }, state: LIVE };
const FORCED   = { val: { label: '5' },          mgr: { label: 'hpa-controller', sublabel: 'operation Apply' }, state: LIVE };

// Ownership state for every row in ONE pass. A row left unset keeps the previous step's owner, and
// on a card whose whole subject is a mutating ledger that is the defect most likely to bite.
const rowState = (spec) => ({
  labels: Object.fromEntries(spec.flatMap((r, i) => [[`v${i}`, r.val.label], [`m${i}`, r.mgr.label]])),
  sublabels: Object.fromEntries(spec.map((r, i) => [`m${i}`, r.mgr.sublabel])),
  opacity: Object.fromEntries(spec.map((r, i) => [`r${i}`, ROW_SHADE[r.state]])),
});
const IDLE_ROWS    = rowState([NOT_SET, NOT_SET, NOT_SET, NOT_SET]);
const OWNED_ROWS   = rowState([REPLICAS, MINREADY, APPLABEL, IMAGE]);
const DROPPED_ROWS = rowState([REPLICAS, REMOVED, APPLABEL, IMAGE]);
const FORCED_ROWS  = rowState([FORCED, REMOVED, APPLABEL, IMAGE]);

// Every step writes EVERY chip through this, the request chip included, and the three inputs of the
// client-side merge are one switch rather than three assignments that drift as steps are added.
const chipsOf = (apply, ledger, conflict) => ({ applyChip: apply, ledgerChip: ledger, conflictChip: conflict, requestChip: REQUEST });
const LEG_KEYS = ['leg0', 'leg1', 'leg2'];
const LEGACY_ON = shade(LEG_KEYS, 1), LEGACY_OFF = shade(LEG_KEYS, OPACITY.notready);

const OWNER_CELLS = ['m0', 'm1', 'm2', 'm3'];

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: chipsOf('none', 'no entries', 'none'),
    labels: IDLE_ROWS.labels,
    sublabels: IDLE_ROWS.sublabels,
    opacity: { ...IDLE_ROWS.opacity, ...LEGACY_OFF },
  },
  {
    id: 'first-apply',
    duration: 2400,
    narration: 'You run kubectl apply --server-side, a PATCH sent with the content type application/apply-patch+yaml. Every apply has to name a field manager, and kubectl sends the name kubectl by default. The API records that name against every field the request sets, so all four fields of Deployment web end up owned by kubectl.',
    chips: chipsOf('kubectl · 201 Created', '1 entry · kubectl owns 4 fields', 'none'),
    labels: OWNED_ROWS.labels,
    sublabels: OWNED_ROWS.sublabels,
    opacity: { ...OWNED_ROWS.opacity, ...LEGACY_OFF },
    wires: { 'req-k': 'apply · fieldManager=kubectl', 'ack-k': 'HTTP 201 Created' },
    lit: ['kctl', 'applyChip', 'ledgerChip'],
    // The ledger is what the API STORES, so it turns over when the apply lands there. The response
    // chip is what the client LEARNS, so it waits for the answer to come home.
    rewind: {
      chips: chipsOf('none', 'no entries', 'none'),
      labels: IDLE_ROWS.labels, sublabels: IDLE_ROWS.sublabels, opacity: IDLE_ROWS.opacity,
    },
    flow: [
      F.segment({ from: KCTL_TO_API[0], to: KCTL_TO_API[1], name: 'req', lights: ['api', ...OWNER_CELLS] }),
      F.set({
        at: 'req', chips: { ledgerChip: '1 entry · kubectl owns 4 fields' },
        labels: OWNED_ROWS.labels, sublabels: OWNED_ROWS.sublabels, opacity: OWNED_ROWS.opacity,
      }),
      F.segment({ from: API_TO_KCTL[0], to: API_TO_KCTL[1], after: 'req', name: 'ack' }),
      F.set({ at: 'ack', chips: { applyChip: 'kubectl · 201 Created' } }),
    ],
  },
  {
    id: 'ledger',
    duration: 2800,
    narration: 'The ledger sits on the object under metadata.managedFields, one entry per manager: its name, the operation Apply or Update, the apiVersion and a fieldsV1 tree of the paths it owns. It is hidden unless you pass --show-managed-fields. Non-apply writes land here as operation Update, where the name is optional and the API infers it from the User-Agent.',
    chips: chipsOf('kubectl · 201 Created', '1 entry · kubectl owns 4 fields', 'none'),
    labels: OWNED_ROWS.labels,
    sublabels: OWNED_ROWS.sublabels,
    opacity: { ...OWNED_ROWS.opacity, ...LEGACY_OFF },
    // Nothing travels: the ledger is read where it lives, so the object frame and its owner column
    // carry the beat, and the API is lit because keeping that record is the API server work.
    lit: ['api', 'obj', 'ledgerChip', ...OWNER_CELLS],
  },
  {
    id: 'drop-a-field',
    duration: 2600,
    narration: 'Delete spec.minReadySeconds from the file and apply again. The API compares the request against what you owned last time, so a field you stop sending is deleted from the live object, or reset to its default if it has one. That happens only when no other manager owns it too. If one does, you drop out of that entry and the value stays.',
    chips: chipsOf('kubectl · 200 OK', '1 entry · kubectl owns 3 fields', 'none'),
    labels: DROPPED_ROWS.labels,
    sublabels: DROPPED_ROWS.sublabels,
    opacity: { ...DROPPED_ROWS.opacity, ...LEGACY_OFF },
    wires: { 'req-k': 'apply without minReadySeconds', 'ack-k': 'HTTP 200 OK' },
    lit: ['kctl', 'applyChip', 'ledgerChip'],
    // The field is still there while the apply is in flight, and goes when the request lands. The
    // row is never lit on the way out, because a lit block at the terminated shade is a defect.
    rewind: {
      chips: chipsOf('kubectl · 201 Created', '1 entry · kubectl owns 4 fields', 'none'),
      labels: OWNED_ROWS.labels, sublabels: OWNED_ROWS.sublabels, opacity: OWNED_ROWS.opacity,
    },
    flow: [
      F.segment({ from: KCTL_TO_API[0], to: KCTL_TO_API[1], name: 'req', lights: ['api'] }),
      F.set({
        at: 'req', chips: { ledgerChip: '1 entry · kubectl owns 3 fields' },
        labels: DROPPED_ROWS.labels, sublabels: DROPPED_ROWS.sublabels, opacity: DROPPED_ROWS.opacity,
      }),
      F.fade({ target: 'r1', to: OPACITY.terminated, dur: FADE.out, at: 'req' }),
      F.segment({ from: API_TO_KCTL[0], to: API_TO_KCTL[1], after: 'req', name: 'ack' }),
      F.set({ at: 'ack', chips: { applyChip: 'kubectl · 200 OK' } }),
    ],
  },
  {
    id: 'conflict',
    duration: 2600,
    narration: 'The autoscaler applies spec.replicas 5 under the field manager name hpa-controller, but kubectl owns that field at 3, so the API refuses the whole request with HTTP 409 and names the conflict. Nothing on the object changes. A plain update never fails this way, it takes the field quietly and your next apply is what finds out.',
    chips: chipsOf('hpa-controller · 409 Conflict', '1 entry · kubectl owns 3 fields', 'spec.replicas · refused with 409'),
    labels: DROPPED_ROWS.labels,
    sublabels: DROPPED_ROWS.sublabels,
    opacity: { ...DROPPED_ROWS.opacity, ...LEGACY_OFF },
    wires: { 'req-h': 'apply · spec.replicas=5', 'ack-h': 'HTTP 409 Conflict' },
    lit: ['hpa', 'applyChip', 'conflictChip'],
    // The refusal is the whole step, so it rides home down its own lane: the request lands, the
    // owner cell for spec.replicas answers for it, and the 409 goes back to the caller.
    rewind: { chips: chipsOf('kubectl · 200 OK', '1 entry · kubectl owns 3 fields', 'none') },
    flow: [
      F.segment({ from: HPA_TO_API[0], to: HPA_TO_API[1], name: 'req', lights: ['api', 'm0'] }),
      F.set({ at: 'req', chips: { conflictChip: 'spec.replicas · refused with 409' } }),
      F.segment({ from: API_TO_HPA[0], to: API_TO_HPA[1], after: 'req', name: 'ack' }),
      F.set({ at: 'ack', chips: { applyChip: 'hpa-controller · 409 Conflict' } }),
    ],
  },
  {
    id: 'force',
    duration: 2600,
    narration: 'Repeating it with --force-conflicts sets force=true in the query and the apply lands: spec.replicas becomes 5 and the field moves from kubectl to hpa-controller. Controllers are told to force on objects they own, since they cannot resolve a conflict alone. Two appliers setting the same value share the field, and the next change by either conflicts.',
    chips: chipsOf('hpa-controller · 200 OK', '2 entries · kubectl 2 · hpa-controller 1', 'spec.replicas · forced through'),
    labels: FORCED_ROWS.labels,
    sublabels: FORCED_ROWS.sublabels,
    opacity: { ...FORCED_ROWS.opacity, ...LEGACY_OFF },
    wires: { 'req-h': 'apply · force=true', 'ack-h': 'HTTP 200 OK' },
    lit: ['hpa', 'applyChip', 'ledgerChip', 'conflictChip'],
    // Ownership moves when the forced apply lands, not while it is still on the wire.
    rewind: {
      chips: chipsOf('hpa-controller · 409 Conflict', '1 entry · kubectl owns 3 fields', 'spec.replicas · refused with 409'),
      labels: DROPPED_ROWS.labels, sublabels: DROPPED_ROWS.sublabels, opacity: DROPPED_ROWS.opacity,
    },
    flow: [
      F.segment({ from: HPA_TO_API[0], to: HPA_TO_API[1], name: 'req', lights: ['api', 'v0', 'm0'] }),
      F.set({
        at: 'req',
        chips: { ledgerChip: '2 entries · kubectl 2 · hpa-controller 1', conflictChip: 'spec.replicas · forced through' },
        labels: FORCED_ROWS.labels, sublabels: FORCED_ROWS.sublabels, opacity: FORCED_ROWS.opacity,
      }),
      F.segment({ from: API_TO_HPA[0], to: API_TO_HPA[1], after: 'req', name: 'ack' }),
      F.set({ at: 'ack', chips: { applyChip: 'hpa-controller · 200 OK' } }),
    ],
  },
  {
    id: 'versus-merge',
    duration: 3000,
    narration: 'This is what server-side apply replaces. Plain kubectl apply keeps your file in the kubectl.kubernetes.io/last-applied-configuration annotation and diffs the annotation, the file and the live object on your own machine. Removals are found by reading the annotation, so a value another actor wrote is invisible to it.',
    chips: chipsOf('hpa-controller · 200 OK', '2 entries · kubectl 2 · hpa-controller 1', 'spec.replicas · forced through'),
    labels: FORCED_ROWS.labels,
    sublabels: FORCED_ROWS.sublabels,
    opacity: { ...FORCED_ROWS.opacity, ...LEGACY_ON },
    lit: ['kctl', ...LEG_KEYS],
    // Three inputs, three beats. The merge is client side, so nothing travels to the API at all.
    rewind: { opacity: LEGACY_OFF },
    flow: [
      F.reveal({ target: 'leg0', from: OPACITY.notready }),
      F.reveal({ target: 'leg1', from: OPACITY.notready, delay: REVEAL_MS / 2 }),
      F.reveal({ target: 'leg2', from: OPACITY.notready, delay: REVEAL_MS }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
