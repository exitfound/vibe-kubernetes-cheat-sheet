import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, chainList, setChainActive, arrow, chip } from '../../lib/primitives.js';
import { valChip, setVal, setBoxLabel, setBoxSublabel, segmentPacket, makeInit, clearHighlights, clearWires, setWire, relationPath, laneOf, BEAT, lightBoxAt, at, revealAt, REVEAL_MS, OPACITY } from './cluster-kit.js';
// Design notes for this card: ./CARDS.md#cluster-resource-quota

// A budget that ACCUMULATES: one bar whose width IS spec.hard, slots filling left to right, and the
// refused request drawn past the edge. Scale exact at 480 units per CPU. CEILING 460 characters.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140

// TWO actors, both at the family 232. The LimitRange stood here as a third until 2026-08-04 and is
// not an actor at all: it moved down beside the two ladder rows that read it.
const BOX_W = 232, BOX_H = 80;
const TOP_Y = 40, TOP_BOTTOM = TOP_Y + BOX_H;            // 40 / 120
const TOP_CY = TOP_Y + BOX_H / 2;                        // 80
const RS_X = 420, RS_R = RS_X + BOX_W;                   // 420..652, left edge on the bar rail
const LADDER_W = 400;
// The API sits where its own ladder ends on the content right edge, so the gap to the ReplicaSet
// is 172 rather than the family 56. Both numbers are under the packet floor, see ./CARDS.md.
const API_CX = CONTENT_R - LADDER_W / 2;                 // 940
const API_X = API_CX - BOX_W / 2, API_R = API_X + BOX_W; // 824..1056
const LANE_DY = 12;
const OUT_Y = TOP_CY - LANE_DY, BACK_Y = TOP_CY + LANE_DY;   // 68 / 92

// No gap this row can take holds a wire label between the two blocks, so the request takes a
// register above the row and the answer one below it, both centred on the gap they describe.
const WIRE_REQ_Y = TOP_Y - 14;                           // 26
const WIRE_ACK_Y = TOP_BOTTOM + 20;                      // 140, ink centred in the 120..152 corridor
const WIRE_RA_X = (RS_R + API_X) / 2;                    // 738

const RS_TO_API = [[RS_R, OUT_Y], [API_X, OUT_Y]];
const API_TO_RS = [[API_X, BACK_Y], [RS_R, BACK_Y]];

// The pipeline hangs under the API and is centred on it, so the tie is one straight drop onto a
// face midpoint. The five stages ARE the API, so no ball rides down there either.
const LADDER_X = API_CX - LADDER_W / 2;                  // 740..1140
const LADDER_Y = 152, ROW_H = 32, ROW_GAP = 10;          // 5 rows -> 152..352
const API_TO_CHAIN = [[API_CX, TOP_BOTTOM], [API_CX, LADDER_Y]];

// The LimitRange is an OBJECT the LimitRanger plugin reads, so it stands beside the two rows that
// plugin occupies and is exactly as tall as the pair, in the same column as the ReplicaSet.
const LR_X = RS_X, LR_W = BOX_W;                         // 420..652
const LR_Y = LADDER_Y, LR_H = ROW_H * 2 + ROW_GAP;       // 152..226, rows 1 and 2 exactly
const LR_CY = LR_Y + LR_H / 2;                           // 189, the seam between the two rows
// Nothing travels here, so the line takes no arrowhead and its LimitRange end is a face midpoint.
const LR_TO_CHAIN = [[LR_X + LR_W, LR_CY], [LADDER_X, LR_CY]];

// The budget. CPU_W is one whole CPU, REQ_W is the 500m every Pod in this example asks for, and
// the bar is exactly spec.hard wide, so the drawing and the arithmetic cannot disagree.
const CPU_W = 480, REQ_W = CPU_W / 2;                    // 480 / 240
const BAR_X = 420, BAR_W = CPU_W;                        // 420..900, spec.hard requests.cpu 1
const BAR_Y = 386, BAR_H = 64;                           // 386..450
const BAR_R = BAR_X + BAR_W;                             // 900, the hard edge
const SLOT_X = i => BAR_X + i * REQ_W;                   // 420 / 660
const OVER_X = BAR_R, OVER_W = REQ_W;                    // 900..1140, past the ceiling
const CAP_Y = BAR_Y - 10;                                // 376
const OVER_CX = OVER_X + OVER_W / 2;                     // 1020
const OVER_WIRE_Y = BAR_Y + BAR_H + 18;                  // 468

// What a reader can actually observe, in the corner the panel frees once its text ends. Three
// rows, one per desired replica, because the whole point of the card is that the third is absent.
const LIST_X = CONTENT_L, LIST_W = 340;                  // 60..400
const LIST_Y = BAR_Y, LIST_H = 40, LIST_GAP = 12;        // 386..426 / 438..478 / 490..530
const LIST_ROW_Y = i => LIST_Y + i * (LIST_H + LIST_GAP);

const CHIP_H = 34, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = 548;                                     // second row ends on 624
const CHIP_W = (CONTENT_R - CONTENT_L - CHIP_GAP * (CHIP_COLS - 1)) / CHIP_COLS;   // 532
const CHIP_X = i => CONTENT_L + (i % CHIP_COLS) * (CHIP_W + CHIP_GAP);
const CHIP_Y = i => CHIPS_Y + Math.floor(i / CHIP_COLS) * (CHIP_H + CHIP_VGAP);

// The command is a chip, not a floating caption, so the three rows read as one answer. It takes the
// row width exactly and stands off by more than the row gap: the question above the answer.
const LIST_CX = LIST_X + LIST_W / 2;                     // 230
const CMD_W = LIST_W, CMD_H = CHIP_H;                    // 340 x 34, the width of the row below it
const CMD_X = LIST_X;                                    // 60..400, flush with the listing
const CMD_GAP = 32;                                      // deliberately wider than the 12 row gap
const CMD_Y = LIST_Y - CMD_GAP - CMD_H;                  // 320..354
// Every tie spans exactly the row gap, so the column keeps one rhythm from the command down to
// web-3, and every endpoint is a face midpoint.
const CMD_TIE = [[LIST_CX, CMD_Y + CMD_H], [LIST_CX, LIST_Y]];
const ROW_TIE = i => [[LIST_CX, LIST_ROW_Y(i) + LIST_H], [LIST_CX, LIST_ROW_Y(i + 1)]];

const REQ_500 = 'requests.cpu 500m';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'ResourceQuota and LimitRange: a quota caps what one namespace may request in total and is checked at admission, so the Pod that does not fit is never created and the 403 lands on the ReplicaSet that asked for it',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    root.appendChild(relationPath({ points: API_TO_CHAIN, role: 'cluster' }));
    // A lane is only as present as the fainter of its ends, so this one dims with the LimitRange.
    const lrLine = relationPath({ points: LR_TO_CHAIN, role: 'cluster' });
    root.appendChild(lrLine);

    // The whole ceiling, undivided. The slots below carve it and carry strokes only, so the fill
    // never doubles up where a slot sits on the bar.
    const bar = box({ x: BAR_X, y: BAR_Y, w: BAR_W, h: BAR_H, rx: 6, role: 'cluster' });
    root.appendChild(bar);
    root.appendChild(text({ class: 'scheme-label code dim', x: BAR_X, y: CAP_Y, 'text-anchor': 'start' }, ['ResourceQuota team-quota · namespace team-a']));
    root.appendChild(text({ class: 'scheme-label code dim', x: BAR_R, y: CAP_Y, 'text-anchor': 'middle' }, ['spec.hard 1']));

    const budgetBlock = ({ x, w, label, dashed = false }) => {
      const b = box({ x, y: BAR_Y, w, h: BAR_H, rx: 0, label, sublabel: REQ_500, role: 'cluster' });
      const r = b.querySelector('.scheme-box-rect');
      if (r) {
        r.style.fill = 'transparent';
        if (dashed) r.style.strokeDasharray = '5 5';
      }
      b.style.opacity = '0';
      root.appendChild(b);
      return b;
    };
    const slot0 = budgetBlock({ x: SLOT_X(0), w: REQ_W, label: 'web-1' });
    const slot1 = budgetBlock({ x: SLOT_X(1), w: REQ_W, label: 'web-2' });
    // Past the bar edge and dashed, because it is a request that never became an object.
    const over  = budgetBlock({ x: OVER_X, w: OVER_W, label: 'web-3', dashed: true });

    const overWire = text({ class: 'scheme-label code dim', x: OVER_CX, y: OVER_WIRE_Y, 'text-anchor': 'middle' }, [' ']);
    root.appendChild(overWire);

    // Ties under the rows they join, so a row edge covers the join rather than the line crossing it.
    const laneCmd = relationPath({ points: CMD_TIE, role: 'cluster' });
    const lane01 = relationPath({ points: ROW_TIE(0), role: 'cluster' });
    const lane12 = relationPath({ points: ROW_TIE(1), role: 'cluster' });
    [laneCmd, lane01, lane12].forEach(l => root.appendChild(l));

    const cmdChip = chip({ x: CMD_X, y: CMD_Y, w: CMD_W, h: CMD_H, label: 'kubectl get pods -n team-a', role: 'cluster' });
    root.appendChild(cmdChip);
    const listRows = ['web-1', 'web-2', 'web-3'].map((n, i) =>
      box({ x: LIST_X, y: LIST_ROW_Y(i), w: LIST_W, h: LIST_H, label: n, sublabel: 'not created yet', role: 'cluster' }));
    listRows.forEach(r => root.appendChild(r));

    // Wire and ball are built from the SAME points array, so the two cannot drift apart.
    const lane = pts => arrow({ x1: pts[0][0], y1: pts[0][1], x2: pts[1][0], y2: pts[1][1], dim: true, dashed: true, role: 'cluster' });
    [RS_TO_API, API_TO_RS].forEach(p => root.appendChild(lane(p)));

    const wireReq = text({ class: 'scheme-label code dim', x: WIRE_RA_X, y: WIRE_REQ_Y, 'text-anchor': 'middle' }, [' ']);
    const wireAck = text({ class: 'scheme-label code dim', x: WIRE_RA_X, y: WIRE_ACK_Y, 'text-anchor': 'middle' }, [' ']);
    [wireReq, wireAck].forEach(t => root.appendChild(t));

    const hardChip  = valChip({ x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'spec.hard',      value: 'requests.cpu 1',      role: 'cluster' });
    const usedChip  = valChip({ x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'status.used',    value: 'requests.cpu 0',      role: 'cluster' });
    const admitChip = valChip({ x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'last admission', value: 'none',                role: 'cluster' });
    const rsChip    = valChip({ x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'ReplicaSet web', value: '3 desired · 0 ready', role: 'cluster' });
    [hardChip, usedChip, admitChip, rsChip].forEach(c => root.appendChild(c));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    // Ladder above the packet layer, so no ball rides over its rows.
    const chain = chainList({
      x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. mutating    ·  LimitRanger sets defaultRequest',
        '2. validating  ·  LimitRanger checks min and max',
        '3. validating  ·  webhooks and policies get a say',
        '4. validating  ·  ResourceQuota runs after them all',
        '5. persist     ·  the Pod object is written to ETCD',
      ],
      role: 'cluster',
    });
    root.appendChild(chain);
    // The object the first two rows read, on the ladder band and above the packet layer with them.
    const lr = box({ x: LR_X, y: LR_Y, w: LR_W, h: LR_H, label: 'LimitRange', sublabel: 'defaultRequest cpu 500m', role: 'cluster' });
    root.appendChild(lr);

    // Top-row blocks last, so a ball passes behind them rather than over their labels.
    const rs  = box({ x: RS_X,  y: TOP_Y, w: BOX_W, h: BOX_H, label: 'ReplicaSet web', sublabel: 'spec.replicas 3',    role: 'cluster' });
    const api = box({ x: API_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'API',            sublabel: 'admission pipeline', role: 'cluster' });
    [rs, api].forEach(b => root.appendChild(b));

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      rs, api, lr, lrLine, bar, chain,
      slot0, slot1, over,
      cmdChip, laneCmd, lane01, lane12,
      list0: listRows[0], list1: listRows[1], list2: listRows[2],
      hardChip, usedChip, admitChip, rsChip,
      packetLayer,
      wires: { req: wireReq, ack: wireAck, over: overWire },
    };
  }

  reset() { this.build(); }
}

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  clearHighlights(s, [
    'rs', 'api', 'lr', 'bar', 'slot0', 'slot1', 'over',
    'list0', 'list1', 'list2',
    'hardChip', 'usedChip', 'admitChip', 'rsChip',
  ]);
  clearWires(s);
}

// Every step writes every chip. A chip left alone keeps the previous step's reading, and on this
// card that would let status.used claim a total the admission it names has not reached yet.
function setChips(s, { used, admission, rs }) {
  setVal(s.refs.hardChip, 'requests.cpu 1');
  setVal(s.refs.usedChip, used);
  setVal(s.refs.admitChip, admission);
  setVal(s.refs.rsChip, rs);
}

// One helper for the three budget blocks and the LimitRange, so a step cannot pin three of four
// and drift on the fourth. Each block entry is null (not drawn) or { label, sublabel, opacity }.
function setBudget(s, { slot0 = null, slot1 = null, over = null, limitRange = 1 }) {
  [['slot0', slot0], ['slot1', slot1], ['over', over]].forEach(([key, spec]) => {
    const el = s.refs[key];
    if (!spec) { el.style.opacity = '0'; return; }
    setBoxLabel(el, spec.label);
    setBoxSublabel(el, spec.sublabel);
    el.style.opacity = String(spec.opacity === undefined ? 1 : spec.opacity);
  });
  s.refs.lr.style.opacity = String(limitRange);
  s.refs.lrLine.style.opacity = String(limitRange);
}

// The observable listing, one row per desired replica. A row left alone would keep the previous
// step's status, and the third row is the payload of the whole card.
function setList(s, rows) {
  rows.forEach((r, i) => {
    const el = s.refs['list' + i];
    setBoxSublabel(el, r.sublabel);
    el.style.opacity = String(r.opacity);
  });
  // A tie is only as present as the fainter of its ends. The command is on screen whatever the
  // listing says, so the head tie takes the shade of the one row it points at.
  s.refs.laneCmd.style.opacity = String(rows[0].opacity);
  s.refs.lane01.style.opacity = laneOf(rows[0].opacity, rows[1].opacity);
  s.refs.lane12.style.opacity = laneOf(rows[1].opacity, rows[2].opacity);
}

// revealAt always lands on 1, and this block must land on the shade of a thing that was never
// created, so it gets its own four lines rather than a wrong call to the shared helper.
function ghostAt(el, ctx, delay) {
  el.style.opacity = '0';
  ctx.register(el.animate([{ opacity: 0 }, { opacity: OPACITY.pending }],
    { duration: REVEAL_MS, delay, fill: 'forwards', easing: 'ease-out' }));
}

const PENDING_ROW = { sublabel: 'not created yet', opacity: OPACITY.pending };
const RUNNING_ROW = { sublabel: 'Running',         opacity: 1 };
const ABSENT_ROW  = { sublabel: 'no Pod object',   opacity: OPACITY.terminated };

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      resetStep(s);
      setChips(s, { used: 'requests.cpu 0', admission: 'none', rs: '3 desired · 0 ready' });
      setBudget(s, {});
      setList(s, [PENDING_ROW, PENDING_ROW, PENDING_ROW]);
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'quota',
    duration: 2600,
    narration: 'A ResourceQuota caps what one namespace may request in total. The field spec.hard is the ceiling and status.used is the running sum, and this one allows requests.cpu 1 across the namespace team-a. A quota can count objects as well, like count/pods 10 or count/deployments.apps 5.',
    enter(s) {
      resetStep(s);
      setChips(s, { used: 'requests.cpu 0', admission: 'none', rs: '3 desired · 0 ready' });
      setBudget(s, {});
      setList(s, [PENDING_ROW, PENDING_ROW, PENDING_ROW]);
      // No packet and no Pod on this step, so the highlights carry the beat on their own.
      s.refs.bar.classList.add('highlight');
      s.refs.hardChip.classList.add('highlight');
      s.refs.usedChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
    },
  },
  {
    id: 'limitrange',
    duration: 2600,
    narration: 'The Pod template names no cpu at all, so the LimitRange in this namespace supplies one. LimitRanger runs in both phases: it injects defaultRequest.cpu 500m while the object can still be rewritten, then checks min, max and maxLimitRequestRatio once it cannot.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { used: 'requests.cpu 0', admission: 'mutating · requests.cpu 500m injected', rs: '3 desired · 0 ready' });
      setBudget(s, {});
      setList(s, [PENDING_ROW, PENDING_ROW, PENDING_ROW]);
      setWire(s, 'req', 'POST pod web-1 · no cpu named');
      s.refs.rs.classList.add('highlight');
      s.refs.lr.classList.add('highlight');
      s.refs.admitChip.classList.add('highlight');
      // Both LimitRanger rows, because the point of the step is that one plugin sits in two phases.
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[0]) rows[0].classList.add('highlight');
      if (rows[1]) rows[1].classList.add('highlight');
      if (ctx.reduced) { s.refs.api.classList.add('highlight'); return; }
      // The chip holds what admission DID, so it turns over when the request reaches admission.
      setVal(s.refs.admitChip, 'none');
      const pkt = segmentPacket(s, ctx, { from: RS_TO_API[0], to: RS_TO_API[1], role: 'cluster' });
      lightBoxAt(s.refs.api, ctx, pkt.arrivalMs);
      at(s, ctx, pkt.arrivalMs, () => setVal(s.refs.admitChip, 'mutating · requests.cpu 500m injected'));
    },
  },
  {
    id: 'admit',
    duration: 3400,
    narration: 'ResourceQuota runs after every other validating plugin, and it admits web-1 because 0 plus 500m is inside the ceiling. Admission itself adds that 500m to status.used, so the count is not a controller catching up afterwards. Pod web-2 follows the same way and takes used to 1.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { used: 'requests.cpu 1', admission: 'admitted · web-1 and web-2', rs: '3 desired · 2 ready' });
      setBudget(s, {
        slot0: { label: 'web-1', sublabel: REQ_500 },
        slot1: { label: 'web-2', sublabel: REQ_500 },
      });
      setList(s, [RUNNING_ROW, RUNNING_ROW, PENDING_ROW]);
      setWire(s, 'req', 'POST pod web-2 · requests.cpu 500m');
      s.refs.bar.classList.add('highlight');
      s.refs.slot0.classList.add('highlight');
      s.refs.slot1.classList.add('highlight');
      s.refs.usedChip.classList.add('highlight');
      s.refs.admitChip.classList.add('highlight');
      s.refs.rsChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.api.classList.add('highlight'); return; }
      // The sum IS the step, so each slot appears on its own beat: web-1 lands first, then web-2
      // rides the wire and its slot appears where the request arrives.
      setVal(s.refs.usedChip, 'requests.cpu 0');
      setVal(s.refs.admitChip, 'none');
      setVal(s.refs.rsChip, '3 desired · 0 ready');
      s.refs.slot1.style.opacity = '0';
      revealAt(s.refs.slot0, ctx, 0);
      at(s, ctx, REVEAL_MS, () => {
        setVal(s.refs.usedChip, REQ_500);
        setVal(s.refs.admitChip, 'admitted · web-1');
        setVal(s.refs.rsChip, '3 desired · 1 ready');
      });
      const pkt = segmentPacket(s, ctx, { from: RS_TO_API[0], to: RS_TO_API[1], delay: REVEAL_MS, role: 'cluster' });
      lightBoxAt(s.refs.api, ctx, pkt.arrivalMs);
      revealAt(s.refs.slot1, ctx, pkt.arrivalMs);
      at(s, ctx, pkt.arrivalMs, () => {
        setVal(s.refs.usedChip, 'requests.cpu 1');
        setVal(s.refs.admitChip, 'admitted · web-1 and web-2');
        setVal(s.refs.rsChip, '3 desired · 2 ready');
      });
    },
  },
  {
    id: 'reject',
    duration: 4000,
    narration: 'Pod web-3 would take used to 1.5 against a ceiling of 1, so admission answers 403 with exceeded quota and no Pod object is ever written. The ReplicaSet asked for it, so the ReplicaSet is what hears the refusal, as a FailedCreate event and a ReplicaFailure condition. There is no third Pod for kubectl get pods to list and none to describe.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { used: 'requests.cpu 1', admission: '403 · exceeded quota', rs: 'ReplicaFailure · FailedCreate' });
      setBudget(s, {
        slot0: { label: 'web-1', sublabel: REQ_500 },
        slot1: { label: 'web-2', sublabel: REQ_500 },
        over:  { label: 'web-3', sublabel: REQ_500, opacity: OPACITY.pending },
      });
      setList(s, [RUNNING_ROW, RUNNING_ROW, ABSENT_ROW]);
      setWire(s, 'req', 'POST pod web-3 · requests.cpu 500m');
      setWire(s, 'ack', 'HTTP 403 Forbidden · exceeded quota');
      setWire(s, 'over', 'used 1 plus 500m is over hard 1');
      s.refs.bar.classList.add('highlight');
      s.refs.over.classList.add('highlight');
      s.refs.usedChip.classList.add('highlight');
      s.refs.admitChip.classList.add('highlight');
      s.refs.rsChip.classList.add('highlight');
      // Row 5 stays dark on purpose: the request never reaches persist, so nothing is written.
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.api.classList.add('highlight'); s.refs.rs.classList.add('highlight'); return; }
      // Out, refused, back. The ReplicaSet is the receiver of the 403, so it lights on arrival
      // rather than at entry, and its condition chip turns over on that same beat.
      setVal(s.refs.admitChip, 'admitted · web-1 and web-2');
      setVal(s.refs.rsChip, '3 desired · 2 ready');
      const req = segmentPacket(s, ctx, { from: RS_TO_API[0], to: RS_TO_API[1], role: 'cluster' });
      lightBoxAt(s.refs.api, ctx, req.arrivalMs);
      ghostAt(s.refs.over, ctx, req.arrivalMs);
      at(s, ctx, req.arrivalMs, () => setVal(s.refs.admitChip, '403 · exceeded quota'));
      const ack = segmentPacket(s, ctx, { from: API_TO_RS[0], to: API_TO_RS[1], delay: req.arrivalMs + BEAT.afterHop, role: 'cluster' });
      lightBoxAt(s.refs.rs, ctx, ack.arrivalMs);
      at(s, ctx, ack.arrivalMs, () => setVal(s.refs.rsChip, 'ReplicaFailure · FailedCreate'));
    },
  },
  {
    id: 'no-request',
    duration: 3000,
    narration: 'Take the LimitRange away and web-1 would not have got in either. Once a quota constrains requests.cpu, every new Pod in that namespace must name requests.cpu or limits.cpu, because a Pod carrying neither is a Pod the quota cannot count. That is what makes a LimitRange structural here rather than a convenience.',
    enter(s) {
      resetStep(s);
      setChips(s, { used: 'requests.cpu 0', admission: '403 · no requests.cpu on the Pod', rs: '3 desired · 0 ready' });
      // The counterfactual: with no LimitRange nothing was ever admitted, so the first request sits
      // outside the bar, refused for being uncountable rather than for being too big.
      setBudget(s, {
        over: { label: 'web-1', sublabel: 'no requests.cpu', opacity: OPACITY.pending },
        limitRange: OPACITY.terminated,
      });
      setList(s, [ABSENT_ROW, ABSENT_ROW, ABSENT_ROW]);
      setWire(s, 'over', 'nothing here for the quota to count');
      s.refs.bar.classList.add('highlight');
      s.refs.over.classList.add('highlight');
      s.refs.hardChip.classList.add('highlight');
      s.refs.usedChip.classList.add('highlight');
      s.refs.admitChip.classList.add('highlight');
      s.refs.rsChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
