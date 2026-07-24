import { svg, g, text, rect, line, path } from '../lib/svg.js';
import { arrowDefs, box, pod, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, flashChips, BEAT, FADE,
} from '../lib/scaling-kit.js';

// The one VERTICAL-subcategory card whose gesture is a GROWING ROW, because the concept is aggregate:
// a ResourceQuota caps the SUM of requests across a namespace. A budget meter fills as the replica
// row grows, one segment per Pod, and when the next Pod would push the sum past the cap its creation
// is rejected with 403 Forbidden. An HPA or a manual bump cannot grow past the namespace budget.
//
// GEOMETRY. A ResourceQuota frame holds a budget meter on top, the meter drawn in cpu units with a
// movable cap marker. A row of replica Pods sits below on y=ROW_Y, fed by create lanes that drop from
// the quota frame onto a bus and across to each slot. Chips along the bottom.
//
// PULSE MODEL: the quota frame is infrastructure, it lights via lightBoxAt on packet arrival and
// never pulses. Only the Pods pulse, and only the ones a create actually lands on. The refused Pod is
// a dim 403 ghost and never pulses (it was never created). The hpa-stalls step carries no packet and
// no Pod action, so it flashes its chip.
const CANVAS_CX = 600;

const QF_X = 400, QF_Y = 150, QF_W = 680, QF_H = 110;      // quota frame, 400..1080, center 740
const QF_BOTTOM = QF_Y + QF_H;                             // 260
const QSPINE = QF_X + QF_W / 2;                            // 740, where the create lanes originate

// The meter runs in cpu units, a fixed capacity of 6 cpu across the track, so used maps to px the
// same way on every step and the cap marker just slides to the current quota.
const MT_X = QF_X + 20, MT_Y = 206, MT_W = QF_W - 40, MT_H = 34;  // meter track
const CAP_TOTAL = 6;                                       // cpu units the track can show
const PX_PER = MT_W / CAP_TOTAL;                           // px per cpu
const POD_CPU = 0.75;                                      // each replica requests this
const SEG_W = POD_CPU * PX_PER;                            // one Pod worth of meter
const segX = i => MT_X + i * SEG_W;
const capX = q => MT_X + q * PX_PER;

const SLOTS = 6;
const P_W = 96, P_H = 112, P_GAP = 24;
const ROW_Y = 372, ROW_BOTTOM = ROW_Y + P_H;              // 372..484
const ROW_W = SLOTS * P_W + (SLOTS - 1) * P_GAP;          // 696
const ROW_X0 = CANVAS_CX - ROW_W / 2;                     // 252
const slotX = i => ROW_X0 + i * (P_W + P_GAP);
const slotCX = i => slotX(i) + P_W / 2;                   // 300,420,540,660,780,900

const BUS_Y = 322;
const CHIPS_Y = 556;

const createLane = i => [[QSPINE, QF_BOTTOM], [QSPINE, BUS_Y], [slotCX(i), BUS_Y], [slotCX(i), ROW_Y]];

function laneWire(points) {
  const d = 'M ' + points.map(p => p.join(' ')).join(' L ');
  return path({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-scaling scheme-arrow-dim', d, 'stroke-dasharray': '5 5', fill: 'none' });
}

// A tag riding along with the create ball on its lane, matching timing and easing so the packet
// visibly carries what it does. Balls are routePacket (eased), so the label defaults to ease-in-out.
function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'ease-in-out' } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: -14, 'text-anchor': 'middle', 'data-cat': 'scaling' }, [txt]);
  lbl.style.opacity = '0';
  lbl.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px)`;
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 160, fill: 'forwards', easing: 'ease-in' }));
}

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

function buildReplica(i) {
  const x = slotX(i), y = ROW_Y;
  const shell = pod({ x, y, w: P_W, h: P_H, label: 'web', sublabel: 'cpu 0.75', containers: 0, cat: 'scaling' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const sub = shell.querySelector('.scheme-pod-sublabel');
  const wrap = g({});
  wrap.appendChild(shell);
  return { wrap, sub };
}

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'A ResourceQuota caps aggregate scaling. It limits the sum of requests across a namespace, shown here as a budget meter that fills as the replica row grows. When the next Pod would push the sum past the cap, its creation is rejected with 403 Forbidden, so neither an HPA nor a manual replica bump can grow past the namespace budget. To fit more you raise the quota or lower the per-Pod requests.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const quota = box({ x: QF_X, y: QF_Y, w: QF_W, h: QF_H, label: '', cat: 'scaling' });
    const quotaLbl = text({ class: 'scheme-box-sublabel', x: QF_X + 16, y: QF_Y + 26, 'text-anchor': 'start' }, ['ResourceQuota  requests.cpu']);
    const meterTrack = rect({ x: MT_X, y: MT_Y, width: MT_W, height: MT_H, rx: 4, fill: 'rgba(255, 160, 77, 0.06)', stroke: 'var(--scaling-color)', 'stroke-width': 1, 'stroke-opacity': 0.35 });
    const segs = [];
    for (let i = 0; i < SLOTS; i++) {
      const seg = rect({ x: segX(i) + 2, y: MT_Y + 3, width: SEG_W - 4, height: MT_H - 6, rx: 2, fill: 'rgba(255, 160, 77, 0.55)', stroke: 'var(--scaling-color)', 'stroke-width': 1 });
      seg.style.opacity = '0';
      segs.push(seg);
    }
    const capLine = line({ class: 'scheme-arrow scheme-arrow-scaling', x1: capX(4), y1: MT_Y - 6, x2: capX(4), y2: MT_Y + MT_H + 6, fill: 'none', 'stroke-width': 2 });
    const capLbl = text({ class: 'scheme-box-sublabel', x: capX(4), y: MT_Y - 10, 'text-anchor': 'middle' }, ['quota']);

    const replicas = [];
    for (let i = 0; i < SLOTS; i++) replicas.push(buildReplica(i));
    const rowGroup = g({});
    replicas.forEach(r => rowGroup.appendChild(r.wrap));

    const quotaChip = valChip({ x: 130, y: CHIPS_Y, w: 320, h: 34, name: 'quota',   value: 'requests.cpu 4', cat: 'scaling' });
    const usedChip  = valChip({ x: 470, y: CHIPS_Y, w: 260, h: 34, name: 'used',    value: '1.5',            cat: 'scaling' });
    const vChip     = valChip({ x: 750, y: CHIPS_Y, w: 320, h: 34, name: 'verdict', value: 'ok',             cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): quota frame, its meter and cap, the replica row, chips, packet on top.
    root.appendChild(quota);
    [quotaLbl, meterTrack, ...segs, capLine, capLbl].forEach(el => root.appendChild(el));
    root.appendChild(rowGroup);
    [quotaChip, usedChip, vChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, quota, segs, capLine, capLbl, replicas,
      quotaChip, usedChip, vChip,
      wires: {}, packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}
function setChips(s, { quota, used, verdict }) {
  setChip(s.refs.quotaChip, quota);
  setChip(s.refs.usedChip, used);
  setChip(s.refs.vChip, verdict);
}

// visibleCount counted Pods (segments full + Pods full). ghostIdx is a refused Pod shown dim with a
// dim meter segment poking past the cap. label403 stamps that ghost with 403.
function setRow(s, visibleCount, { ghostIdx = null, ghostCounted = false } = {}) {
  s.refs.replicas.forEach((r, i) => {
    let op = i < visibleCount ? 1 : 0;
    if (ghostIdx === i && !ghostCounted) op = 0.3;
    if (ghostIdx === i && ghostCounted) op = 1;
    r.wrap.style.opacity = String(op);
    if (r.sub) r.sub.textContent = (ghostIdx === i && !ghostCounted) ? '403 Forbidden' : 'cpu 0.75';
  });
  s.refs.segs.forEach((seg, i) => {
    let op = i < visibleCount ? 1 : 0;
    if (ghostIdx === i) op = ghostCounted ? 1 : 0.28;
    seg.style.opacity = String(op);
  });
}

function setCap(s, q) {
  const x = capX(q);
  s.refs.capLine.setAttribute('x1', x);
  s.refs.capLine.setAttribute('x2', x);
  s.refs.capLbl.setAttribute('x', x);
}

function clearHL(s) {
  clearHighlights(s, ['quota', 'quotaChip', 'usedChip', 'vChip'], s.refs.replicas.map(r => r.wrap));
  s.refs.replicas.forEach(r => { r.wrap.style.opacity = '1'; });
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'This namespace has a ResourceQuota capping the sum of cpu requests at 4. Two Pods run today, using 1.5 in total, so the budget meter is only part full. A requests.cpu quota also forces every Pod to declare a cpu request, else it is rejected, which is why it pairs with a LimitRange.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { quota: 'requests.cpu 4', used: '1.5', verdict: 'ok' });
      setCap(s, 4);
      setRow(s, 2);
    },
  },
  {
    id: 'grow',
    duration: 3800,
    narration: 'The workload scales out and three more Pods are created. Each one adds its 0.75 request to the running total, so the meter climbs from 1.5 to 3.75. There is still a sliver of budget left under the cap.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { quota: 'requests.cpu 4', used: '3.75', verdict: 'ok' });
      setCap(s, 4);
      setRow(s, 5);
      if (ctx.reduced) return;
      // Each new Pod is admitted by the quota: a create rides its lane to the slot, the Pod rises and
      // pulses on arrival, its meter segment fills, and the quota frame lights as it accounts for it.
      const NEW = [2, 3, 4];
      NEW.forEach((i, k) => {
        const lane = createLane(i);
        s.refs.packetLayer.appendChild(laneWire(lane));
        const start = BEAT.afterHop + k * 220;
        const pkt = routePacket(s, ctx, lane, { delay: start, cat: 'scaling' });
        ridingLabel(s, ctx, 'create · requests.cpu +0.75', lane, { delay: start });
        const w = s.refs.replicas[i].wrap;
        w.style.opacity = '0';
        w.style.transform = 'translate(0px, 14px)';
        ctx.register(w.animate(
          [{ opacity: 0, transform: 'translate(0px, 14px)' }, { opacity: 1, transform: 'translate(0px, 0px)' }],
          { duration: 360, delay: pkt.arrivalMs, fill: 'forwards', easing: 'ease-out' },
        ));
        s.refs.segs[i].style.opacity = '0';
        ctx.register(s.refs.segs[i].animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: pkt.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
        pulsePod(w, ctx, pkt.arrivalMs);
        lightBoxAt(s.refs.quota, ctx, pkt.arrivalMs);
      });
    },
  },
  {
    id: 'ceiling',
    duration: 3200,
    narration: 'The workload asks for one more Pod. Its 0.75 would take the total to 4.5, over the cap of 4, so the meter segment pokes past the quota line. The apiserver refuses the creation with 403 Forbidden and that Pod never exists.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { quota: 'requests.cpu 4', used: '3.75', verdict: '403 Forbidden' });
      setCap(s, 4);
      // The sixth Pod is refused: it settles as a dim 403 ghost with a dim over-cap segment. Pinned.
      setRow(s, 5, { ghostIdx: 5 });
      s.refs.quota.classList.add('highlight');
      s.refs.vChip.classList.add('highlight');
      if (ctx.reduced) return;
      // A create is attempted down the lane, but the quota rejects it, so the ghost never pulses and
      // the frame lights as it does the rejecting.
      const lane = createLane(5);
      s.refs.packetLayer.appendChild(laneWire(lane));
      const pkt = routePacket(s, ctx, lane, { cat: 'scaling' });
      ridingLabel(s, ctx, 'create · requests.cpu +0.75', lane);
      lightBoxAt(s.refs.quota, ctx, pkt.arrivalMs);
      s.refs.replicas[5].wrap.style.opacity = '0';
      ctx.register(s.refs.replicas[5].wrap.animate([{ opacity: 0 }, { opacity: 0.3 }], { duration: FADE.in, delay: pkt.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      s.refs.segs[5].style.opacity = '0';
      ctx.register(s.refs.segs[5].animate([{ opacity: 0 }, { opacity: 0.28 }], { duration: FADE.in, delay: pkt.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'hpa-stalls',
    duration: 2600,
    narration: 'This is a hard ceiling on autoscaling. An HPA may compute that it wants eight replicas, but every creation past the budget is refused, so the actual replica count stalls below the desired count. The quota wins over the autoscaler.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { quota: 'requests.cpu 4', used: '3.75, capped', verdict: 'replicas below desired' });
      setCap(s, 4);
      setRow(s, 5, { ghostIdx: 5 });
      // Conceptual step, no packet and no Pod action, so the verdict chip flashes once.
      s.refs.vChip.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['vChip']);
    },
  },
  {
    id: 'headroom',
    duration: 3200,
    narration: 'To fit more Pods you change the budget, not the autoscaler. Raise the quota to 6, or lower the per-Pod requests, and the cap line moves out. Now that same sixth Pod is admitted, the total settles at 4.5, and scaling continues.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { quota: 'requests.cpu 6', used: '4.5', verdict: 'fits now' });
      setCap(s, 6);
      // The sixth Pod is now admitted and counted: full opacity, full meter segment.
      setRow(s, 6, { ghostIdx: 5, ghostCounted: true });
      s.refs.quotaChip.classList.add('highlight');
      if (ctx.reduced) return;
      const lane = createLane(5);
      s.refs.packetLayer.appendChild(laneWire(lane));
      const pkt = routePacket(s, ctx, lane, { cat: 'scaling' });
      const w = s.refs.replicas[5].wrap;
      w.style.opacity = '0.3';
      ctx.register(w.animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: FADE.in, delay: pkt.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      s.refs.segs[5].style.opacity = '0.28';
      ctx.register(s.refs.segs[5].animate([{ opacity: 0.28 }, { opacity: 1 }], { duration: FADE.in, delay: pkt.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(w, ctx, pkt.arrivalMs);
      lightBoxAt(s.refs.quota, ctx, pkt.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
