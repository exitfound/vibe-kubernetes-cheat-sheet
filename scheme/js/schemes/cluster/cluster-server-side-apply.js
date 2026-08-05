import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, arrow } from '../../lib/primitives.js';
import { valChip, setVal, setBoxLabel, setBoxSublabel, segmentPacket, makeInit, clearHighlights, clearWires, setWire, relationPath, revealAt, REVEAL_MS, FADE, BEAT, lightBoxAt, at, OPACITY } from './cluster-kit.js';
// Design notes for this card: ./CARDS.md#cluster-server-side-apply

// The ledger IS the card, so the object is drawn as a three column table (field, value, manager) and
// everything else is sized around it. Measured panel and the character ceiling it implies: ./CARDS.md.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140

// Top row: the two field managers flanking the API, all three right of the panel at x=420.
const BOX_W = 200, BOX_H = 80, TOP_GAP = 60;
const TOP_Y = 40, TOP_BOTTOM = TOP_Y + BOX_H;            // 40 / 120
const TOP_CY = TOP_Y + BOX_H / 2;                        // 80
const KCTL_X = 420, KCTL_R = KCTL_X + BOX_W;             // 420..620
const API_X = KCTL_R + TOP_GAP, API_R = API_X + BOX_W;   // 680..880
const API_CX = API_X + BOX_W / 2;                        // 780
const HPA_X = API_R + TOP_GAP;                           // 940..1140
const LANE_DY = 12;
const OUT_Y = TOP_CY - LANE_DY, BACK_Y = TOP_CY + LANE_DY;   // 68 / 92

// A 60 unit gap cannot hold a wire label between two blocks, so requests take a register above the
// row and answers one below it, each centred on its own gap.
const WIRE_REQ_Y = TOP_Y - 14;                           // 26
const WIRE_ACK_Y = TOP_BOTTOM + 26;                      // 146
const WIRE_KA_X = (KCTL_R + API_X) / 2;                  // 650
const WIRE_AH_X = (API_R + HPA_X) / 2;                   // 910

const KCTL_TO_API = [[KCTL_R, OUT_Y], [API_X, OUT_Y]];
const API_TO_KCTL = [[API_X, BACK_Y], [KCTL_R, BACK_Y]];
const HPA_TO_API  = [[HPA_X, OUT_Y], [API_R, OUT_Y]];
const API_TO_HPA  = [[API_R, BACK_Y], [HPA_X, BACK_Y]];

// The object, centred on API_CX so the tie from the API is one straight drop onto a face midpoint.
const OBJ_X = KCTL_X, OBJ_W = CONTENT_R - OBJ_X;         // 420..1140
const OBJ_CX = OBJ_X + OBJ_W / 2;                        // 780, equal to API_CX by construction
const OBJ_Y = 180, OBJ_PAD = 18;
const ROW_H = 56, ROW_GAP = 16, ROWS = 4;
const OBJ_H = OBJ_PAD * 2 + ROWS * ROW_H + (ROWS - 1) * ROW_GAP;   // 308, so 180..488
const ROW_Y = i => OBJ_Y + OBJ_PAD + i * (ROW_H + ROW_GAP);
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
const LEG_ROW_Y = i => LEG_Y + i * (LEG_H + LEG_GAP);

const CHIP_H = 34, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = 548;                                     // second row ends on 624
const CHIP_W = (CONTENT_R - CONTENT_L - CHIP_GAP * (CHIP_COLS - 1)) / CHIP_COLS;   // 532
const CHIP_X = i => CONTENT_L + (i % CHIP_COLS) * (CHIP_W + CHIP_GAP);
const CHIP_Y = i => CHIPS_Y + Math.floor(i / CHIP_COLS) * (CHIP_H + CHIP_VGAP);

const FIELDS = [
  'spec.replicas',
  'spec.minReadySeconds',
  'metadata.labels.app',
  'spec.template.spec.containers[0].image',
];

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Server-side apply and field ownership: the API records a field manager for every field an apply sets, keeps that ledger in managedFields on the object, and refuses a second manager that tries to change a field it does not own',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // The API holds the object below it. A relationship, so no arrowhead and no ball on any step.
    root.appendChild(relationPath({ points: API_TO_OBJ, role: 'cluster' }));

    // The object frame carries stroke only, so the row cells inside do not double its fill.
    const obj = box({ x: OBJ_X, y: OBJ_Y, w: OBJ_W, h: OBJ_H, rx: 8, role: 'cluster' });
    const objRect = obj.querySelector('.scheme-box-rect');
    if (objRect) objRect.style.fill = 'transparent';
    root.appendChild(obj);
    root.appendChild(text({ class: 'scheme-label code dim', x: OBJ_X, y: CAP_Y, 'text-anchor': 'start' }, ['Deployment web · metadata.managedFields']));

    // One wrapping g per row, so a field that leaves the object dims as a whole rather than in parts.
    const rows = FIELDS.map((f, i) => {
      const y = ROW_Y(i);
      const fld = box({ x: FLD_X, y, w: FLD_W, h: ROW_H, label: f, role: 'cluster' });
      const val = box({ x: VAL_X, y, w: VAL_W, h: ROW_H, label: 'Not set', role: 'cluster' });
      const mgr = box({ x: MGR_X, y, w: MGR_W, h: ROW_H, label: 'none', sublabel: 'not owned', role: 'cluster' });
      const wrap = g({ id: `row${i}` });
      [fld, val, mgr].forEach(c => wrap.appendChild(c));
      root.appendChild(wrap);
      return { wrap, fld, val, mgr };
    });

    // The client-side path, held at OPACITY.notready until the step that compares the two.
    root.appendChild(text({ class: 'scheme-label code dim', x: LEG_X, y: LEG_CAP_Y, 'text-anchor': 'start' }, ['client-side apply · the three-way merge']));
    const legs = [
      box({ x: LEG_X, y: LEG_ROW_Y(0), w: LEG_W, h: LEG_H, label: 'last-applied-configuration', role: 'cluster' }),
      box({ x: LEG_X, y: LEG_ROW_Y(1), w: LEG_W, h: LEG_H, label: 'The file on your disk', role: 'cluster' }),
      box({ x: LEG_X, y: LEG_ROW_Y(2), w: LEG_W, h: LEG_H, label: 'The live object', role: 'cluster' }),
    ];
    legs.forEach(b => root.appendChild(b));

    // Wire and ball are built from the SAME points array, so the two cannot drift apart.
    const lane = pts => arrow({ x1: pts[0][0], y1: pts[0][1], x2: pts[1][0], y2: pts[1][1], dim: true, dashed: true, role: 'cluster' });
    [KCTL_TO_API, API_TO_KCTL, HPA_TO_API, API_TO_HPA].forEach(p => root.appendChild(lane(p)));

    const wireReqK = text({ class: 'scheme-label code dim', x: WIRE_KA_X, y: WIRE_REQ_Y, 'text-anchor': 'middle' }, [' ']);
    const wireAckK = text({ class: 'scheme-label code dim', x: WIRE_KA_X, y: WIRE_ACK_Y, 'text-anchor': 'middle' }, [' ']);
    const wireReqH = text({ class: 'scheme-label code dim', x: WIRE_AH_X, y: WIRE_REQ_Y, 'text-anchor': 'middle' }, [' ']);
    const wireAckH = text({ class: 'scheme-label code dim', x: WIRE_AH_X, y: WIRE_ACK_Y, 'text-anchor': 'middle' }, [' ']);
    [wireReqK, wireAckK, wireReqH, wireAckH].forEach(t => root.appendChild(t));

    const applyChip    = valChip({ x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'last apply',             value: 'none',       role: 'cluster' });
    const ledgerChip   = valChip({ x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'metadata.managedFields', value: 'no entries', role: 'cluster' });
    const conflictChip = valChip({ x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'last conflict',          value: 'none',       role: 'cluster' });
    const requestChip  = valChip({ x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'apply request',          value: 'PATCH · application/apply-patch+yaml', role: 'cluster' });
    [applyChip, ledgerChip, conflictChip, requestChip].forEach(c => root.appendChild(c));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    // Top row last, so a ball passes behind the blocks rather than over their labels.
    const kctl = box({ x: KCTL_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'kubectl',        sublabel: 'apply --server-side',    role: 'cluster' });
    const api  = box({ x: API_X,  y: TOP_Y, w: BOX_W, h: BOX_H, label: 'API',            sublabel: 'tracks field ownership', role: 'cluster' });
    const hpa  = box({ x: HPA_X,  y: TOP_Y, w: BOX_W, h: BOX_H, label: 'hpa-controller', sublabel: 'applies spec.replicas',  role: 'cluster' });
    [kctl, api, hpa].forEach(b => root.appendChild(b));

    this.host.appendChild(root);
    this.refs = {
      svg: root, kctl, api, hpa, obj,
      r0: rows[0].wrap, f0: rows[0].fld, v0: rows[0].val, m0: rows[0].mgr,
      r1: rows[1].wrap, f1: rows[1].fld, v1: rows[1].val, m1: rows[1].mgr,
      r2: rows[2].wrap, f2: rows[2].fld, v2: rows[2].val, m2: rows[2].mgr,
      r3: rows[3].wrap, f3: rows[3].fld, v3: rows[3].val, m3: rows[3].mgr,
      leg0: legs[0], leg1: legs[1], leg2: legs[2],
      applyChip, ledgerChip, conflictChip, requestChip,
      packetLayer,
      wires: { 'req-k': wireReqK, 'ack-k': wireAckK, 'req-h': wireReqH, 'ack-h': wireAckH },
    };
  }

  reset() { this.build(); }
}

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  clearHighlights(s, [
    'kctl', 'api', 'hpa', 'obj',
    'f0', 'f1', 'f2', 'f3', 'v0', 'v1', 'v2', 'v3', 'm0', 'm1', 'm2', 'm3',
    'leg0', 'leg1', 'leg2',
    'applyChip', 'ledgerChip', 'conflictChip', 'requestChip',
  ]);
  clearWires(s);
}

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

const IDLE_ROWS    = [NOT_SET, NOT_SET, NOT_SET, NOT_SET];
const OWNED_ROWS   = [REPLICAS, MINREADY, APPLABEL, IMAGE];
const DROPPED_ROWS = [REPLICAS, REMOVED, APPLABEL, IMAGE];
const FORCED_ROWS  = [FORCED, REMOVED, APPLABEL, IMAGE];

// Ownership state for every row in ONE pass. A row left unset keeps the previous step's owner, and
// on a card whose whole subject is a mutating ledger that is the defect most likely to bite.
function setRows(s, spec) {
  spec.forEach((r, i) => {
    setBoxLabel(s.refs['v' + i], r.val.label);
    setBoxLabel(s.refs['m' + i], r.mgr.label);
    setBoxSublabel(s.refs['m' + i], r.mgr.sublabel);
    s.refs['r' + i].style.opacity = String(ROW_SHADE[r.state]);
  });
}

// Every enter() writes EVERY chip through this, the request chip included: it is a standing fact
// about the verb rather than a per-step state, the same shape failurePolicy has on the webhook card.
function setChips(s, { apply, ledger, conflict }) {
  setVal(s.refs.applyChip, apply);
  setVal(s.refs.ledgerChip, ledger);
  setVal(s.refs.conflictChip, conflict);
  setVal(s.refs.requestChip, 'PATCH · application/apply-patch+yaml');
}

function setLegacy(s, on) {
  [s.refs.leg0, s.refs.leg1, s.refs.leg2].forEach(b => { b.style.opacity = on ? '1' : String(OPACITY.notready); });
}

const OWNER_CELLS = ['m0', 'm1', 'm2', 'm3'];

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      resetStep(s);
      setRows(s, IDLE_ROWS);
      setChips(s, { apply: 'none', ledger: 'no entries', conflict: 'none' });
      setLegacy(s, false);
    },
  },
  {
    id: 'first-apply',
    duration: 2400,
    narration: 'You run kubectl apply --server-side, a PATCH sent with the content type application/apply-patch+yaml. Every apply has to name a field manager, and kubectl sends the name kubectl by default. The API records that name against every field the request sets, so all four fields of Deployment web end up owned by kubectl.',
    enter(s, ctx) {
      resetStep(s);
      setRows(s, OWNED_ROWS);
      setChips(s, { apply: 'kubectl · 201 Created', ledger: '1 entry · kubectl owns 4 fields', conflict: 'none' });
      setLegacy(s, false);
      setWire(s, 'req-k', 'apply · fieldManager=kubectl');
      setWire(s, 'ack-k', 'HTTP 201 Created');
      s.refs.kctl.classList.add('highlight');
      s.refs.applyChip.classList.add('highlight');
      s.refs.ledgerChip.classList.add('highlight');
      if (ctx.reduced) {
        s.refs.api.classList.add('highlight');
        OWNER_CELLS.forEach(k => s.refs[k].classList.add('highlight'));
        return;
      }
      // The ledger is what the API STORES, so it turns over when the apply lands there. The response
      // chip is what the client LEARNS, so it waits for the answer to come home.
      setRows(s, IDLE_ROWS);
      setChips(s, { apply: 'none', ledger: 'no entries', conflict: 'none' });
      const req = segmentPacket(s, ctx, { from: KCTL_TO_API[0], to: KCTL_TO_API[1], role: 'cluster' });
      lightBoxAt(s.refs.api, ctx, req.arrivalMs);
      OWNER_CELLS.forEach(k => lightBoxAt(s.refs[k], ctx, req.arrivalMs));
      at(s, ctx, req.arrivalMs, () => {
        setRows(s, OWNED_ROWS);
        setVal(s.refs.ledgerChip, '1 entry · kubectl owns 4 fields');
      });
      const ack = segmentPacket(s, ctx, { from: API_TO_KCTL[0], to: API_TO_KCTL[1], delay: req.arrivalMs + BEAT.afterHop, role: 'cluster' });
      at(s, ctx, ack.arrivalMs, () => setVal(s.refs.applyChip, 'kubectl · 201 Created'));
    },
  },
  {
    id: 'ledger',
    duration: 2800,
    narration: 'The ledger sits on the object under metadata.managedFields, one entry per manager: its name, the operation Apply or Update, the apiVersion and a fieldsV1 tree of the paths it owns. It is hidden unless you pass --show-managed-fields. Non-apply writes land here as operation Update, where the name is optional and the API infers it from the User-Agent.',
    enter(s, ctx) {
      resetStep(s);
      setRows(s, OWNED_ROWS);
      setChips(s, { apply: 'kubectl · 201 Created', ledger: '1 entry · kubectl owns 4 fields', conflict: 'none' });
      setLegacy(s, false);
      // Nothing travels: the ledger is read where it lives, so the object frame and its owner column
      // carry the beat, and the API is lit because keeping that record is the API server work.
      s.refs.api.classList.add('highlight');
      s.refs.obj.classList.add('highlight');
      s.refs.ledgerChip.classList.add('highlight');
      OWNER_CELLS.forEach(k => s.refs[k].classList.add('highlight'));
    },
  },
  {
    id: 'drop-a-field',
    duration: 2600,
    narration: 'Delete spec.minReadySeconds from the file and apply again. The API compares the request against what you owned last time, so a field you stop sending is deleted from the live object, or reset to its default if it has one. That happens only when no other manager owns it too. If one does, you drop out of that entry and the value stays.',
    enter(s, ctx) {
      resetStep(s);
      setRows(s, DROPPED_ROWS);
      setChips(s, { apply: 'kubectl · 200 OK', ledger: '1 entry · kubectl owns 3 fields', conflict: 'none' });
      setLegacy(s, false);
      setWire(s, 'req-k', 'apply without minReadySeconds');
      setWire(s, 'ack-k', 'HTTP 200 OK');
      s.refs.kctl.classList.add('highlight');
      s.refs.applyChip.classList.add('highlight');
      s.refs.ledgerChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.api.classList.add('highlight'); return; }
      // The field is still there while the apply is in flight, and goes when the request lands. The
      // row is never lit on the way out, because a lit block at the terminated shade is a defect.
      setRows(s, OWNED_ROWS);
      setChips(s, { apply: 'kubectl · 201 Created', ledger: '1 entry · kubectl owns 4 fields', conflict: 'none' });
      const req = segmentPacket(s, ctx, { from: KCTL_TO_API[0], to: KCTL_TO_API[1], role: 'cluster' });
      lightBoxAt(s.refs.api, ctx, req.arrivalMs);
      at(s, ctx, req.arrivalMs, () => {
        setRows(s, DROPPED_ROWS);
        setVal(s.refs.ledgerChip, '1 entry · kubectl owns 3 fields');
      });
      ctx.register(s.refs.r1.animate(
        [{ opacity: 1 }, { opacity: OPACITY.terminated }],
        { duration: FADE.out, delay: req.arrivalMs, fill: 'both', easing: 'ease-in' }));
      const ack = segmentPacket(s, ctx, { from: API_TO_KCTL[0], to: API_TO_KCTL[1], delay: req.arrivalMs + BEAT.afterHop, role: 'cluster' });
      at(s, ctx, ack.arrivalMs, () => setVal(s.refs.applyChip, 'kubectl · 200 OK'));
    },
  },
  {
    id: 'conflict',
    duration: 2600,
    narration: 'The autoscaler applies spec.replicas 5 under the field manager name hpa-controller, but kubectl owns that field at 3, so the API refuses the whole request with HTTP 409 and names the conflict. Nothing on the object changes. A plain update never fails this way, it takes the field quietly and your next apply is what finds out.',
    enter(s, ctx) {
      resetStep(s);
      setRows(s, DROPPED_ROWS);
      setChips(s, { apply: 'hpa-controller · 409 Conflict', ledger: '1 entry · kubectl owns 3 fields', conflict: 'spec.replicas · refused with 409' });
      setLegacy(s, false);
      setWire(s, 'req-h', 'apply · spec.replicas=5');
      setWire(s, 'ack-h', 'HTTP 409 Conflict');
      s.refs.hpa.classList.add('highlight');
      s.refs.applyChip.classList.add('highlight');
      s.refs.conflictChip.classList.add('highlight');
      if (ctx.reduced) {
        s.refs.api.classList.add('highlight');
        s.refs.m0.classList.add('highlight');
        return;
      }
      // The refusal is the whole step, so it rides home down its own lane: the request lands, the
      // owner cell for spec.replicas answers for it, and the 409 goes back to the caller.
      setChips(s, { apply: 'kubectl · 200 OK', ledger: '1 entry · kubectl owns 3 fields', conflict: 'none' });
      const req = segmentPacket(s, ctx, { from: HPA_TO_API[0], to: HPA_TO_API[1], role: 'cluster' });
      lightBoxAt(s.refs.api, ctx, req.arrivalMs);
      lightBoxAt(s.refs.m0, ctx, req.arrivalMs);
      at(s, ctx, req.arrivalMs, () => setVal(s.refs.conflictChip, 'spec.replicas · refused with 409'));
      const ack = segmentPacket(s, ctx, { from: API_TO_HPA[0], to: API_TO_HPA[1], delay: req.arrivalMs + BEAT.afterHop, role: 'cluster' });
      at(s, ctx, ack.arrivalMs, () => setVal(s.refs.applyChip, 'hpa-controller · 409 Conflict'));
    },
  },
  {
    id: 'force',
    duration: 2600,
    narration: 'Repeating it with --force-conflicts sets force=true in the query and the apply lands: spec.replicas becomes 5 and the field moves from kubectl to hpa-controller. Controllers are told to force on objects they own, since they cannot resolve a conflict alone. Two appliers setting the same value share the field, and the next change by either conflicts.',
    enter(s, ctx) {
      resetStep(s);
      setRows(s, FORCED_ROWS);
      setChips(s, { apply: 'hpa-controller · 200 OK', ledger: '2 entries · kubectl 2 · hpa-controller 1', conflict: 'spec.replicas · forced through' });
      setLegacy(s, false);
      setWire(s, 'req-h', 'apply · force=true');
      setWire(s, 'ack-h', 'HTTP 200 OK');
      s.refs.hpa.classList.add('highlight');
      s.refs.applyChip.classList.add('highlight');
      s.refs.ledgerChip.classList.add('highlight');
      s.refs.conflictChip.classList.add('highlight');
      if (ctx.reduced) {
        s.refs.api.classList.add('highlight');
        s.refs.v0.classList.add('highlight');
        s.refs.m0.classList.add('highlight');
        return;
      }
      // Ownership moves when the forced apply lands, not while it is still on the wire.
      setRows(s, DROPPED_ROWS);
      setChips(s, { apply: 'hpa-controller · 409 Conflict', ledger: '1 entry · kubectl owns 3 fields', conflict: 'spec.replicas · refused with 409' });
      const req = segmentPacket(s, ctx, { from: HPA_TO_API[0], to: HPA_TO_API[1], role: 'cluster' });
      lightBoxAt(s.refs.api, ctx, req.arrivalMs);
      lightBoxAt(s.refs.v0, ctx, req.arrivalMs);
      lightBoxAt(s.refs.m0, ctx, req.arrivalMs);
      at(s, ctx, req.arrivalMs, () => {
        setRows(s, FORCED_ROWS);
        setVal(s.refs.ledgerChip, '2 entries · kubectl 2 · hpa-controller 1');
        setVal(s.refs.conflictChip, 'spec.replicas · forced through');
      });
      const ack = segmentPacket(s, ctx, { from: API_TO_HPA[0], to: API_TO_HPA[1], delay: req.arrivalMs + BEAT.afterHop, role: 'cluster' });
      at(s, ctx, ack.arrivalMs, () => setVal(s.refs.applyChip, 'hpa-controller · 200 OK'));
    },
  },
  {
    id: 'versus-merge',
    duration: 3000,
    narration: 'This is what server-side apply replaces. Plain kubectl apply keeps your file in the kubectl.kubernetes.io/last-applied-configuration annotation and diffs the annotation, the file and the live object on your own machine. Removals are found by reading the annotation, so a value another actor wrote is invisible to it.',
    enter(s, ctx) {
      resetStep(s);
      setRows(s, FORCED_ROWS);
      setChips(s, { apply: 'hpa-controller · 200 OK', ledger: '2 entries · kubectl 2 · hpa-controller 1', conflict: 'spec.replicas · forced through' });
      setLegacy(s, true);
      s.refs.kctl.classList.add('highlight');
      ['leg0', 'leg1', 'leg2'].forEach(k => s.refs[k].classList.add('highlight'));
      if (ctx.reduced) return;
      // Three inputs, three beats. The merge is client side, so nothing travels to the API at all.
      setLegacy(s, false);
      [s.refs.leg0, s.refs.leg1, s.refs.leg2].forEach((b, i) => revealAt(b, ctx, i * (REVEAL_MS / 2), OPACITY.notready));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
