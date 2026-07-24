import { svg, g, text, path } from '../lib/svg.js';
import { arrowDefs, box, pod, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, flashChips, BEAT, FADE,
} from '../lib/scaling-kit.js';

// scaling-hpa-custom-metrics: HPA v2 reads more than cpu and memory. A Pods metric averages an
// application value across the Pods (http_requests), an Object metric reads a value off one named
// object (rps on an Ingress), and an External metric pulls something from outside the cluster (a
// broker queue length). Each carries an AverageValue, Value, or Utilization target, and a single HPA
// can list all of them with the max rule choosing the winner.
//
// GEOMETRY. The HPA sits top center, the three metric sources stack to the right (clear of the
// overlay), the scale endpoint sits under the HPA, and the row sits low. Each source feeds the HPA
// (box to box) except the Pods metric, which is per-Pod and so rises from the row. Only Pods pulse.
const SPINE_X = 600;

const HPA_X = 460, HPA_Y = 88, HPA_W = 280, HPA_H = 72;    // center 600,124
const HPA_BOTTOM = HPA_Y + HPA_H;                          // 160

const SRC_X = 880, SRC_W = 250, SRC_H = 56;
const PODS_Y = 176, OBJ_Y = 250, EXT_Y = 324;             // three sources stacked
const PODS_CY = PODS_Y + SRC_H / 2, OBJ_CY = OBJ_Y + SRC_H / 2, EXT_CY = EXT_Y + SRC_H / 2; // 204,278,352

const SCALE_X = 520, SCALE_Y = 298, SCALE_W = 160, SCALE_H = 44; // center 600,320
const SCALE_BOTTOM = SCALE_Y + SCALE_H;                    // 342

const SLOTS = 6;
const P_W = 96, P_H = 118, P_GAP = 28;
const ROW_Y = 396;
const ROW_W = SLOTS * P_W + (SLOTS - 1) * P_GAP;           // 716
const ROW_X0 = SPINE_X - ROW_W / 2;                        // 242
const slotX = i => ROW_X0 + i * (P_W + P_GAP);
const slotCX = i => slotX(i) + P_W / 2;                    // 290,414,538,662,786,910

const CHIPS_Y = 556;
const BUS_Y = 368;

const PODS_TO_HPA = [[SRC_X, PODS_CY], [790, PODS_CY], [790, 124], [HPA_X + HPA_W, 124]];
const OBJ_TO_HPA  = [[SRC_X, OBJ_CY], [770, OBJ_CY], [770, 138], [HPA_X + HPA_W, 138]];
const EXT_TO_HPA  = [[SRC_X, EXT_CY], [758, EXT_CY], [758, 150], [HPA_X + HPA_W, 150]];
const PODS_FEED   = [[slotCX(3), ROW_Y], [slotCX(3), 344], [1005, 344], [1005, PODS_Y + SRC_H]];
const PATCH_LANE  = [[SPINE_X, HPA_BOTTOM], [SPINE_X, SCALE_Y]];
const createLane = i => [[SPINE_X, SCALE_BOTTOM], [SPINE_X, BUS_Y], [slotCX(i), BUS_Y], [slotCX(i), ROW_Y]];

function laneWire(points, { dim = true } = {}) {
  const cls = 'scheme-arrow scheme-arrow-dashed scheme-arrow-scaling' + (dim ? ' scheme-arrow-dim' : '');
  const d = 'M ' + points.map(p => p.join(' ')).join(' L ');
  return path({ class: cls, d, 'stroke-dasharray': '5 5', fill: 'none' });
}

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
  const shell = pod({ x, y, w: P_W, h: P_H, label: 'web', containers: 0, cat: 'scaling' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const wrap = g({});
  wrap.appendChild(shell);
  return { wrap, shell };
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
      'aria-label': 'HPA version two metric types. A Pods metric averages an application value such as http_requests across the Pods, an Object metric reads a single value off one named object such as an Ingress, and an External metric pulls a value from outside the cluster such as a broker queue length. Each carries an AverageValue, Value, or Utilization target, and a single HPA can list all of them, with the maximum desired count winning.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const hpa = box({ x: HPA_X, y: HPA_Y, w: HPA_W, h: HPA_H, label: 'HPA v2', sublabel: 'metrics list', cat: 'scaling' });
    const podsSrc = box({ x: SRC_X, y: PODS_Y, w: SRC_W, h: SRC_H, label: 'Pods metric', sublabel: 'custom.metrics.k8s.io', cat: 'scaling' });
    const objSrc  = box({ x: SRC_X, y: OBJ_Y,  w: SRC_W, h: SRC_H, label: 'Object metric', sublabel: 'custom.metrics.k8s.io', cat: 'scaling' });
    const extSrc  = box({ x: SRC_X, y: EXT_Y,  w: SRC_W, h: SRC_H, label: 'External metric', sublabel: 'external.metrics.k8s.io', cat: 'scaling' });
    const scaleBox = box({ x: SCALE_X, y: SCALE_Y, w: SCALE_W, h: SCALE_H, label: '/scale', cat: 'scaling' });

    const replicas = [];
    for (let i = 0; i < SLOTS; i++) replicas.push(buildReplica(i));
    const rowGroup = g({});
    replicas.forEach(r => rowGroup.appendChild(r.wrap));

    const typeChip   = valChip({ x: 120, y: CHIPS_Y, w: 280, h: 34, name: 'type',   value: '-', cat: 'scaling' });
    const targetChip = valChip({ x: 430, y: CHIPS_Y, w: 350, h: 34, name: 'target', value: '-', cat: 'scaling' });
    const sourceChip = valChip({ x: 810, y: CHIPS_Y, w: 300, h: 34, name: 'source', value: '-', cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): HPA, sources and scale endpoint, replica row, chip strip, packet layer.
    [hpa, podsSrc, objSrc, extSrc, scaleBox, rowGroup].forEach(el => root.appendChild(el));
    [typeChip, targetChip, sourceChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, hpa, podsSrc, objSrc, extSrc, scaleBox, replicas,
      typeChip, targetChip, sourceChip,
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
function setChips(s, { type, target, source }) {
  setChip(s.refs.typeChip, type);
  setChip(s.refs.targetChip, target);
  setChip(s.refs.sourceChip, source);
}

function setRow(s, visibleCount) {
  s.refs.replicas.forEach((r, i) => {
    r.wrap.style.opacity = i < visibleCount ? '1' : '0';
    r.wrap.style.transform = 'translate(0px, 0px)';
  });
}

function clearHL(s) {
  clearHighlights(s, ['hpa', 'podsSrc', 'objSrc', 'extSrc', 'scaleBox', 'typeChip', 'targetChip', 'sourceChip'],
    s.refs.replicas.map(r => r.wrap));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Cpu and memory are the built-in Resource and ContainerResource metrics. Version two of the autoscaling API lets an HPA read three more shapes of metric, each served by its own aggregated API. This one has all three available and a workload of four Pods.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { type: '-', target: '-', source: '-' });
      setRow(s, 4);
    },
  },
  {
    id: 'pods-metric',
    duration: 3800,
    narration: 'A Pods metric is an application value averaged across the target Pods, such as http_requests per second. Every Pod reports its own number, custom.metrics.k8s.io serves the average through an adapter, and the HPA compares it to an AverageValue target of one thousand.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { type: 'Pods', target: 'AverageValue 1k', source: 'http_requests per Pod' });
      setRow(s, 4);
      s.refs.podsSrc.classList.add('highlight');
      if (ctx.reduced) { s.refs.hpa.classList.add('highlight'); return; }
      // Per-Pod metric: the row pulses first, its average rises to the Pods source, which then hands
      // the value up to the HPA. Both boxes light on arrival.
      [0, 1, 2, 3].forEach(i => pulsePod(s.refs.replicas[i].wrap, ctx, 0));
      s.refs.packetLayer.appendChild(laneWire(PODS_FEED));
      const feed = routePacket(s, ctx, PODS_FEED, { delay: BEAT.afterPulse, cat: 'scaling' });
      ridingLabel(s, ctx, 'avg 1.4k', PODS_FEED, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.podsSrc, ctx, feed.arrivalMs);
      s.refs.packetLayer.appendChild(laneWire(PODS_TO_HPA));
      const up = routePacket(s, ctx, PODS_TO_HPA, { delay: feed.arrivalMs + BEAT.afterHop, cat: 'scaling' });
      lightBoxAt(s.refs.hpa, ctx, up.arrivalMs);
    },
  },
  {
    id: 'object-metric',
    duration: 2800,
    narration: 'An Object metric reads a single value off one named Kubernetes object, not off the Pods at all. Here it is requests per second measured on an Ingress. It is a plain Value target, so the raw number is compared directly, not averaged.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { type: 'Object', target: 'Value 10k rps', source: 'Ingress main' });
      setRow(s, 4);
      s.refs.objSrc.classList.add('highlight');
      if (ctx.reduced) { s.refs.hpa.classList.add('highlight'); return; }
      // Box to box hop: the Object value goes straight from its source to the HPA. No Pod is involved.
      s.refs.packetLayer.appendChild(laneWire(OBJ_TO_HPA));
      const up = routePacket(s, ctx, OBJ_TO_HPA, { cat: 'scaling' });
      ridingLabel(s, ctx, '12k rps', OBJ_TO_HPA);
      lightBoxAt(s.refs.hpa, ctx, up.arrivalMs);
    },
  },
  {
    id: 'external-metric',
    duration: 2800,
    narration: 'An External metric comes from outside the cluster entirely, tied to no Kubernetes object. A common one is the depth of a message broker queue. The HPA reads it through the external metrics API and compares it to a Value target of thirty.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { type: 'External', target: 'Value 30', source: 'broker queue depth' });
      setRow(s, 4);
      s.refs.extSrc.classList.add('highlight');
      if (ctx.reduced) { s.refs.hpa.classList.add('highlight'); return; }
      s.refs.packetLayer.appendChild(laneWire(EXT_TO_HPA));
      const up = routePacket(s, ctx, EXT_TO_HPA, { cat: 'scaling' });
      ridingLabel(s, ctx, 'queue 55', EXT_TO_HPA);
      lightBoxAt(s.refs.hpa, ctx, up.arrivalMs);
    },
  },
  {
    id: 'target-kinds',
    duration: 2400,
    narration: 'Each metric names how its target is measured. AverageValue divides by the Pod count, Value compares the raw number, and Utilization is a percentage of the request. The kind decides whether the reading is averaged before the ratio is taken.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { type: 'AverageValue', target: 'Value | Utilization', source: 'target kinds' });
      // Conceptual step: the three sources light and the target chip flashes once. No packet, no Pod.
      s.refs.podsSrc.classList.add('highlight');
      s.refs.objSrc.classList.add('highlight');
      s.refs.extSrc.classList.add('highlight');
      s.refs.targetChip.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['targetChip']);
    },
  },
  {
    id: 'one-hpa',
    duration: 3800,
    narration: 'A single HPA can list all three at once. It computes a desired count from each and, exactly like it does for cpu and memory, keeps the maximum. Here the queue depth demands the most, so it wins and the workload grows to six Pods.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { type: 'all three listed', target: 'max wins', source: 'External queue' });
      setRow(s, 6);
      s.refs.hpa.classList.add('highlight');
      if (ctx.reduced) { s.refs.scaleBox.classList.add('highlight'); return; }
      // The winning source patches the scale endpoint, which then creates the two new replicas. Down
      // the center spine, clear of the sources on the right.
      s.refs.packetLayer.appendChild(laneWire(PATCH_LANE));
      const patch = routePacket(s, ctx, PATCH_LANE, { cat: 'scaling' });
      ridingLabel(s, ctx, 'replicas 6', PATCH_LANE);
      lightBoxAt(s.refs.scaleBox, ctx, patch.arrivalMs);
      const NEW = [4, 5];
      NEW.forEach((i, k) => {
        const lane = createLane(i);
        s.refs.packetLayer.appendChild(laneWire(lane));
        const start = patch.arrivalMs + BEAT.afterHop + k * 200;
        const pkt = routePacket(s, ctx, lane, { delay: start, cat: 'scaling' });
        const w = s.refs.replicas[i].wrap;
        w.style.opacity = '0';
        w.style.transform = 'translate(0px, 14px)';
        ctx.register(w.animate(
          [{ opacity: 0, transform: 'translate(0px, 14px)' }, { opacity: 1, transform: 'translate(0px, 0px)' }],
          { duration: 360, delay: pkt.arrivalMs, fill: 'forwards', easing: 'ease-out' },
        ));
        pulsePod(w, ctx, pkt.arrivalMs + 120);
      });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
