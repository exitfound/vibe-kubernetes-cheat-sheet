import { LANE_DY, P, F, defineCard, laneY, ladder, strip, midX, shade, CLU, FADE, OPACITY, REVEAL_MS } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-server-side-apply.md

// The ledger is a three-column table (field, value, manager) and everything is sized around it.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;

// The two field managers flank the API, right-aligned on CONTENT_R.
const BOX_W = CLU.BOX_W, BOX_H = CLU.BOX_H, TOP_GAP = 60;
const ROW_W = 3 * BOX_W + 2 * TOP_GAP;
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);
const KCTL_X = CONTENT_R - ROW_W, KCTL_R = KCTL_X + BOX_W;
const API_X = KCTL_R + TOP_GAP, API_R = API_X + BOX_W;
const API_CX = midX(API_X, API_R);
const SCALER_X = API_R + TOP_GAP;
const { out: OUT_Y, back: BACK_Y } = laneY(TOP_CY, LANE_DY);

// The gaps are too narrow for labels: requests sit above the row, answers below.
const WIRE_REQ_Y = TOP_Y - 14;
const WIRE_ACK_Y = TOP_BOTTOM + 26;
const WIRE_KA_X = midX(KCTL_R, API_X);
const WIRE_AS_X = midX(API_R, SCALER_X);

const KCTL_TO_API = [[KCTL_R, OUT_Y], [API_X, OUT_Y]];
const API_TO_KCTL = [[API_X, BACK_Y], [KCTL_R, BACK_Y]];
const SCALER_TO_API = [[SCALER_X, OUT_Y], [API_R, OUT_Y]];
const API_TO_SCALER = [[API_R, BACK_Y], [SCALER_X, BACK_Y]];

// Centred on API_CX, so the tie from the API is one straight drop onto a face midpoint.
const OBJ_X = KCTL_X, OBJ_W = CONTENT_R - OBJ_X;
const OBJ_CX = midX(OBJ_X, CONTENT_R);
const OBJ_PAD = 18;
const ROW_H = 56, ROW_GAP = 16, ROWS = 4;
const OBJ_H = OBJ_PAD * 2 + ROWS * ROW_H + (ROWS - 1) * ROW_GAP;
// The ledger and the client-side column both end on this line, so they read as one band.
const BAND_BOTTOM = 520;
const OBJ_Y = BAND_BOTTOM - OBJ_H;
const ROW_Y = ladder({ y: OBJ_Y + OBJ_PAD, rowH: ROW_H, gap: ROW_GAP });
const CELL_GAP = 12;
const COL_L = OBJ_X + OBJ_PAD, COL_R = OBJ_X + OBJ_W - OBJ_PAD;
const MGR_W = 170, VAL_W = 120;
const MGR_X = COL_R - MGR_W;
const VAL_X = MGR_X - CELL_GAP - VAL_W;
const FLD_X = COL_L, FLD_W = VAL_X - CELL_GAP - COL_L;
// The API holds the object, never drives it: no ball, no arrowhead.
const API_TO_OBJ = [[API_CX, TOP_BOTTOM], [OBJ_CX, OBJ_Y]];
// Starts clear of the panel wall rather than on the table edge. Left anchored, so the drop misses it.
const CAP_X = 412, CAP_Y = OBJ_Y - 10;

// The client-side mechanism this replaces, in the corner the panel frees.
const LEG_X = CONTENT_L, LEG_W = OBJ_X - 20 - LEG_X;
const LEG_H = 40, LEG_GAP = 10, LEG_ROWS = 3;
const LEG_Y = BAND_BOTTOM - (LEG_ROWS * LEG_H + (LEG_ROWS - 1) * LEG_GAP);
const LEG_ROW_Y = ladder({ y: LEG_Y, rowH: LEG_H, gap: LEG_GAP });

const CHIP_H = CLU.CHIP_H, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = 548;                                     // second row ends on 624
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// The strip is read as a GRID: the index wraps across the two columns and steps down every second.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

const FIELDS = [
  'spec.replicas',
  'spec.minReadySeconds',
  'metadata.labels.app',
  'spec.progressDeadlineSeconds',
];

// A standing fact about the verb, not a per-step state, so every step restates it.
const REQUEST = 'PATCH · application/apply-patch+yaml';

// Parts order is z-order: the top row last, so a ball passes behind it.
export const SCENE = {
  'aria-label': 'Server-side apply and field ownership: the API records a field manager for every field an apply sets, keeps that ledger in managedFields on the object, refuses a second manager that tries to change a field it does not own until that apply is forced, and the client-side three-way merge it replaces stands in the corner',
  parts: [
    P.defs(),
    P.relation({ points: API_TO_OBJ }),
    // Stroke only, so the row cells inside do not double its fill.
    P.box({
      key: 'obj', x: OBJ_X, y: OBJ_Y, w: OBJ_W, h: OBJ_H, rx: 8,
      tune: (el) => { const r = el.querySelector('.scheme-box-rect'); if (r) r.style.fill = 'transparent'; },
    }),
    P.tag({ x: CAP_X, y: CAP_Y, anchor: 'start', text: 'Deployment web · metadata.managedFields' }),
    // One g per row, so a field that leaves the object dims as a whole.
    ...FIELDS.map((f, i) => P.group({
      id: `row${i}`, key: `r${i}`,
      parts: [
        P.box({ key: `f${i}`, x: FLD_X, y: ROW_Y(i), w: FLD_W, h: ROW_H, label: f }),
        P.box({ key: `v${i}`, x: VAL_X, y: ROW_Y(i), w: VAL_W, h: ROW_H, label: 'Not set' }),
        P.box({ key: `m${i}`, x: MGR_X, y: ROW_Y(i), w: MGR_W, h: ROW_H, label: 'none', sublabel: 'not owned' }),
      ],
    })),
    // The client-side path, held at OPACITY.notready until the step that compares the two.
    P.box({ key: 'leg0', x: LEG_X, y: LEG_ROW_Y(0), w: LEG_W, h: LEG_H, label: 'last-applied-configuration' }),
    P.box({ key: 'leg1', x: LEG_X, y: LEG_ROW_Y(1), w: LEG_W, h: LEG_H, label: 'The file on your disk' }),
    P.box({ key: 'leg2', x: LEG_X, y: LEG_ROW_Y(2), w: LEG_W, h: LEG_H, label: 'The live object' }),
    ...[KCTL_TO_API, API_TO_KCTL, SCALER_TO_API, API_TO_SCALER].map(p => P.arrow({ from: p[0], to: p[1], dim: true, dashed: true })),
    P.wire({ key: 'req-k', x: WIRE_KA_X, y: WIRE_REQ_Y }),
    P.wire({ key: 'ack-k', x: WIRE_KA_X, y: WIRE_ACK_Y }),
    P.wire({ key: 'req-s', x: WIRE_AS_X, y: WIRE_REQ_Y }),
    P.wire({ key: 'ack-s', x: WIRE_AS_X, y: WIRE_ACK_Y }),
    P.chip({ key: 'applyChip',    x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'last apply',             value: 'none' }),
    P.chip({ key: 'ledgerChip',   x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'metadata.managedFields', value: 'no entries' }),
    P.chip({ key: 'conflictChip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'last conflict',          value: 'none' }),
    P.chip({ key: 'requestChip',  x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'apply request',          value: REQUEST }),
    P.packets(),
    P.box({ key: 'kctl', x: KCTL_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'kubectl',        sublabel: 'apply --server-side' }),
    P.box({ key: 'api',  x: API_X,  y: TOP_Y, w: BOX_W, h: BOX_H, label: 'API',            sublabel: 'tracks field ownership' }),
    P.box({ key: 'scaler', x: SCALER_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'scale-controller', sublabel: 'applies spec.replicas' }),
  ],
  reset: {
    keys: [
      'kctl', 'api', 'scaler', 'obj',
      'f0', 'f1', 'f2', 'f3', 'v0', 'v1', 'v2', 'v3', 'm0', 'm1', 'm2', 'm3',
      'leg0', 'leg1', 'leg2',
      'applyChip', 'ledgerChip', 'conflictChip', 'requestChip',
    ],
  },
};

// A field that leaves the object dims rather than vanishing, so the table keeps no hole.
const PENDING = 0, LIVE = 1, GONE = 2;
const ROW_SHADE = [OPACITY.pending, 1, OPACITY.terminated];

// The cells use the primitive's own key names so the inline casing lint reads them.
const NOT_SET  = { val: { label: 'Not set' },    mgr: { label: 'none',           sublabel: 'not owned' },       state: PENDING };
const REMOVED  = { val: { label: 'Removed' },    mgr: { label: 'none',           sublabel: 'not owned' },       state: GONE };
const REPLICAS = { val: { label: '3' },          mgr: { label: 'kubectl',        sublabel: 'operation Apply' }, state: LIVE };
const MINREADY = { val: { label: '10' },         mgr: { label: 'kubectl',        sublabel: 'operation Apply' }, state: LIVE };
const APPLABEL = { val: { label: 'web' },        mgr: { label: 'kubectl',        sublabel: 'operation Apply' }, state: LIVE };
const DEADLINE = { val: { label: '600' },        mgr: { label: 'kubectl',        sublabel: 'operation Apply' }, state: LIVE };
const FORCED   = { val: { label: '5' },          mgr: { label: 'scale-controller', sublabel: 'operation Apply' }, state: LIVE };

// Every row in one pass: a row left unset would keep the previous step's owner.
const rowState = (spec) => ({
  labels: Object.fromEntries(spec.flatMap((r, i) => [[`v${i}`, r.val.label], [`m${i}`, r.mgr.label]])),
  sublabels: Object.fromEntries(spec.map((r, i) => [`m${i}`, r.mgr.sublabel])),
  opacity: Object.fromEntries(spec.map((r, i) => [`r${i}`, ROW_SHADE[r.state]])),
});
const IDLE_ROWS    = rowState([NOT_SET, NOT_SET, NOT_SET, NOT_SET]);
const OWNED_ROWS   = rowState([REPLICAS, MINREADY, APPLABEL, DEADLINE]);
const DROPPED_ROWS = rowState([REPLICAS, REMOVED, APPLABEL, DEADLINE]);
const FORCED_ROWS  = rowState([FORCED, REMOVED, APPLABEL, DEADLINE]);

// Every step writes every chip through this, the request chip included (P-01).
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
    duration: 3100,
    narration: 'You run kubectl apply --server-side, a PATCH sent with the content type application/apply-patch+yaml. Every apply has to name a field manager, and kubectl sends the name kubectl by default. The API records that name against every field the request sets, so all four fields of Deployment web end up owned by kubectl.',
    chips: chipsOf('kubectl · 201 Created', '1 entry · kubectl owns 4 fields', 'none'),
    labels: OWNED_ROWS.labels,
    sublabels: OWNED_ROWS.sublabels,
    opacity: { ...OWNED_ROWS.opacity, ...LEGACY_OFF },
    wires: { 'req-k': 'apply · fieldManager=kubectl', 'ack-k': 'HTTP 201 Created' },
    lit: ['kctl', 'applyChip', 'ledgerChip'],
    // The ledger turns over when the apply lands, the response chip when the answer comes home.
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
    duration: 3900,
    narration: 'The ledger sits on the object under metadata.managedFields, one entry per manager and operation: the name, Apply or Update, the apiVersion and a fieldsV1 tree of the paths it owns. It stays hidden unless you ask kubectl for json or yaml output and pass --show-managed-fields. Non-apply writes land here as operation Update, where the name is optional and the API infers it from the User-Agent.',
    chips: chipsOf('kubectl · 201 Created', '1 entry · kubectl owns 4 fields', 'none'),
    labels: OWNED_ROWS.labels,
    sublabels: OWNED_ROWS.sublabels,
    opacity: { ...OWNED_ROWS.opacity, ...LEGACY_OFF },
    lit: ['api', 'obj', 'ledgerChip', ...OWNER_CELLS],
  },
  {
    id: 'drop-a-field',
    duration: 3300,
    narration: 'Delete spec.minReadySeconds from the file and apply again. The API compares the request against what you owned last time, so a field you stop sending is deleted from the live object, or reset to its default if it has one. That happens only when no other manager owns it too. If one does, you drop out of that entry and the value stays.',
    chips: chipsOf('kubectl · 200 OK', '1 entry · kubectl owns 3 fields', 'none'),
    labels: DROPPED_ROWS.labels,
    sublabels: DROPPED_ROWS.sublabels,
    opacity: { ...DROPPED_ROWS.opacity, ...LEGACY_OFF },
    wires: { 'req-k': 'apply without minReadySeconds', 'ack-k': 'HTTP 200 OK' },
    lit: ['kctl', 'applyChip', 'ledgerChip'],
    // The row is never lit on the way out: a lit block at the terminated shade is a defect.
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
    duration: 3300,
    narration: 'A scaling controller applies spec.replicas 5 under the field manager name scale-controller, but kubectl owns that field at 3, so the API refuses the whole request with HTTP 409 and names the conflict. Nothing on the object changes. A plain update never fails this way, it takes the field quietly and your next apply is what finds out.',
    chips: chipsOf('scale-controller · 409 Conflict', '1 entry · kubectl owns 3 fields', 'spec.replicas · refused with 409'),
    labels: DROPPED_ROWS.labels,
    sublabels: DROPPED_ROWS.sublabels,
    opacity: { ...DROPPED_ROWS.opacity, ...LEGACY_OFF },
    wires: { 'req-s': 'apply · spec.replicas=5', 'ack-s': 'HTTP 409 Conflict' },
    lit: ['scaler', 'applyChip', 'conflictChip'],
    rewind: { chips: chipsOf('kubectl · 200 OK', '1 entry · kubectl owns 3 fields', 'none') },
    flow: [
      F.segment({ from: SCALER_TO_API[0], to: SCALER_TO_API[1], name: 'req', lights: ['api', 'm0'] }),
      F.set({ at: 'req', chips: { conflictChip: 'spec.replicas · refused with 409' } }),
      F.segment({ from: API_TO_SCALER[0], to: API_TO_SCALER[1], after: 'req', name: 'ack' }),
      F.set({ at: 'ack', chips: { applyChip: 'scale-controller · 409 Conflict' } }),
    ],
  },
  {
    id: 'force',
    duration: 3450,
    narration: 'Repeating it with --force-conflicts sets force=true in the query and the apply lands: spec.replicas becomes 5 and the field moves from kubectl to scale-controller. Controllers are told to force on objects they own, since they may not be able to resolve one. Two appliers setting the same value share the field, and the next change by either conflicts.',
    chips: chipsOf('scale-controller · 200 OK', '2 entries · kubectl 2 fields · scale-controller 1', 'spec.replicas · forced through'),
    labels: FORCED_ROWS.labels,
    sublabels: FORCED_ROWS.sublabels,
    opacity: { ...FORCED_ROWS.opacity, ...LEGACY_OFF },
    wires: { 'req-s': 'apply · force=true', 'ack-s': 'HTTP 200 OK' },
    lit: ['scaler', 'applyChip', 'ledgerChip', 'conflictChip'],
    rewind: {
      chips: chipsOf('scale-controller · 409 Conflict', '1 entry · kubectl owns 3 fields', 'spec.replicas · refused with 409'),
      labels: DROPPED_ROWS.labels, sublabels: DROPPED_ROWS.sublabels, opacity: DROPPED_ROWS.opacity,
    },
    flow: [
      F.segment({ from: SCALER_TO_API[0], to: SCALER_TO_API[1], name: 'req', lights: ['api', 'v0', 'm0'] }),
      F.set({
        at: 'req',
        chips: { ledgerChip: '2 entries · kubectl 2 fields · scale-controller 1', conflictChip: 'spec.replicas · forced through' },
        labels: FORCED_ROWS.labels, sublabels: FORCED_ROWS.sublabels, opacity: FORCED_ROWS.opacity,
      }),
      F.segment({ from: API_TO_SCALER[0], to: API_TO_SCALER[1], after: 'req', name: 'ack' }),
      F.set({ at: 'ack', chips: { applyChip: 'scale-controller · 200 OK' } }),
    ],
  },
  {
    id: 'versus-merge',
    duration: 3400,
    narration: 'This is what server-side apply replaces. Plain kubectl apply keeps your file in the kubectl.kubernetes.io/last-applied-configuration annotation, then runs a three-way merge across the annotation, the file and the live object on your own machine. Removals are found by reading the annotation, so a value another actor wrote is invisible to it.',
    chips: chipsOf('scale-controller · 200 OK', '2 entries · kubectl 2 fields · scale-controller 1', 'spec.replicas · forced through'),
    labels: FORCED_ROWS.labels,
    sublabels: FORCED_ROWS.sublabels,
    opacity: { ...FORCED_ROWS.opacity, ...LEGACY_ON },
    lit: [...LEG_KEYS],
    // The merge is client side: nothing travels, and kctl stays dark (its sublabel names the contrast).
    rewind: { opacity: LEGACY_OFF },
    flow: [
      F.reveal({ target: 'leg0', from: OPACITY.notready }),
      F.reveal({ target: 'leg1', from: OPACITY.notready, delay: REVEAL_MS / 2 }),
      F.reveal({ target: 'leg2', from: OPACITY.notready, delay: REVEAL_MS }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
