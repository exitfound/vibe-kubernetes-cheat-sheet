import { svg, g, text, path } from '../lib/svg.js';
import { arrowDefs, box, pod, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, flashChips, BEAT, FADE,
} from '../lib/scaling-kit.js';

// scaling-hpa-owns-replicas: once an HPA targets a Deployment, the manifest must stop setting
// spec.replicas. The HPA continuously PATCHes replicas, so a kubectl apply that also carries a replica
// count fights the HPA and the number ping-pongs. The fix is to remove replicas from the manifest so
// the HPA is the sole writer, and apply then only ever changes the template.
//
// GEOMETRY. Two writers sit on top: the manifest apply on the left, the HPA on the right, both wired
// down into one shared /scale endpoint on the center spine. The replica row sits low. When both write
// they conflict at the endpoint. The fix greys the manifest writer so only the HPA drives the row.
// Only Pods pulse, boxes light via .highlight.
const SPINE_X = 600;

const MAN_X = 420, MAN_Y = 90, MAN_W = 250, MAN_H = 72;    // manifest apply, center 545,126
const MAN_CX = MAN_X + MAN_W / 2, MAN_BOTTOM = MAN_Y + MAN_H; // 545, 162
const HPA_X = 740, HPA_Y = 90, HPA_W = 250, HPA_H = 72;    // HPA, center 865,126
const HPA_CX = HPA_X + HPA_W / 2, HPA_BOTTOM = HPA_Y + HPA_H; // 865, 162

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

// Two writers into one endpoint, entering its top on opposite sides so the paths never overlap.
const MAN_LANE = [[MAN_CX, MAN_BOTTOM], [MAN_CX, 262], [570, 262], [570, SCALE_Y]];
const HPA_LANE = [[HPA_CX, HPA_BOTTOM], [HPA_CX, 278], [630, 278], [630, SCALE_Y]];
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
      'aria-label': 'The HPA must own the replica count. If the manifest keeps setting spec.replicas, every kubectl apply writes spec.replicas on the Deployment while the HPA PATCHes the scale subresource, so both mutate the same replicas field and the count ping-pongs. The fix is to remove replicas from the manifest so the HPA is the sole writer of the count, after which apply only ever changes the Pod template.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const manifest = box({ x: MAN_X, y: MAN_Y, w: MAN_W, h: MAN_H, label: 'kubectl apply', sublabel: 'spec.replicas: 3', cat: 'scaling' });
    const hpa = box({ x: HPA_X, y: HPA_Y, w: HPA_W, h: HPA_H, label: 'HPA', sublabel: 'min 2  max 10', cat: 'scaling' });
    const scaleBox = box({ x: SCALE_X, y: SCALE_Y, w: SCALE_W, h: SCALE_H, label: '/scale', cat: 'scaling' });

    const replicas = [];
    for (let i = 0; i < SLOTS; i++) replicas.push(buildReplica(i));
    const rowGroup = g({});
    replicas.forEach(r => rowGroup.appendChild(r.wrap));

    const manChip = valChip({ x: 150, y: CHIPS_Y, w: 260, h: 34, name: 'manifest', value: '3', cat: 'scaling' });
    const hpaChip = valChip({ x: 450, y: CHIPS_Y, w: 260, h: 34, name: 'hpa',      value: '6', cat: 'scaling' });
    const replicasChip = valChip({ x: 750, y: CHIPS_Y, w: 260, h: 34, name: 'replicas', value: '3', cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): writer boxes and endpoint, replica row, chip strip, packet layer.
    [manifest, hpa, scaleBox, rowGroup].forEach(el => root.appendChild(el));
    [manChip, hpaChip, replicasChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, manifest, hpa, scaleBox, replicas,
      manChip, hpaChip, replicasChip,
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
function setChips(s, { manifest, hpa, replicas }) {
  setChip(s.refs.manChip, manifest);
  setChip(s.refs.hpaChip, hpa);
  setChip(s.refs.replicasChip, replicas);
}

function setRow(s, visibleCount) {
  s.refs.replicas.forEach((r, i) => {
    r.wrap.style.opacity = i < visibleCount ? '1' : '0';
    r.wrap.style.transform = 'translate(0px, 0px)';
  });
}

function clearHL(s) {
  clearHighlights(s, ['manifest', 'hpa', 'scaleBox', 'manChip', 'hpaChip', 'replicasChip'],
    s.refs.replicas.map(r => r.wrap));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'This Deployment manifest still pins spec.replicas at three, and an HPA also targets it with a range of two to ten. Two independent things now believe they decide the replica count, which is the setup for a fight.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { manifest: '3', hpa: '6', replicas: '3' });
      setRow(s, 3);
      s.refs.manifest.style.opacity = '1';
    },
  },
  {
    id: 'conflict',
    duration: 3800,
    narration: 'A kubectl apply writes spec.replicas three on the Deployment object, while on its own tick the HPA PATCHes the scale subresource to six. Both mutate the exact same underlying field. Whichever wrote last wins for a moment, and here the HPA has just pushed the row up to six.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { manifest: '3', hpa: '6', replicas: '3 vs 6' });
      setRow(s, 6);
      s.refs.manifest.style.opacity = '1';
      s.refs.manifest.classList.add('highlight');
      s.refs.hpa.classList.add('highlight');
      if (ctx.reduced) { s.refs.scaleBox.classList.add('highlight'); return; }
      // Both writers PATCH the same endpoint. The two balls converge on /scale, which lights, then the
      // HPA value of six wins the render and three new replicas rise and pulse.
      s.refs.packetLayer.appendChild(laneWire(MAN_LANE));
      const man = routePacket(s, ctx, MAN_LANE, { cat: 'scaling' });
      ridingLabel(s, ctx, 'replicas 3', MAN_LANE);
      s.refs.packetLayer.appendChild(laneWire(HPA_LANE));
      const hpaPkt = routePacket(s, ctx, HPA_LANE, { cat: 'scaling' });
      ridingLabel(s, ctx, 'replicas 6', HPA_LANE);
      const landed = Math.max(man.arrivalMs, hpaPkt.arrivalMs);
      lightBoxAt(s.refs.scaleBox, ctx, landed);
      const NEW = [3, 4, 5];
      NEW.forEach((i, k) => {
        const lane = createLane(i);
        s.refs.packetLayer.appendChild(laneWire(lane));
        const start = landed + BEAT.afterHop + k * 170;
        const pkt = routePacket(s, ctx, lane, { delay: start, cat: 'scaling' });
        const w = s.refs.replicas[i].wrap;
        w.style.opacity = '0';
        w.style.transform = 'translate(0px, 14px)';
        ctx.register(w.animate(
          [{ opacity: 0, transform: 'translate(0px, 14px)' }, { opacity: 1, transform: 'translate(0px, 0px)' }],
          { duration: 340, delay: pkt.arrivalMs, fill: 'forwards', easing: 'ease-out' },
        ));
        pulsePod(w, ctx, pkt.arrivalMs + 120);
      });
    },
  },
  {
    id: 'who-wins',
    duration: 2600,
    narration: 'This repeats forever. The next apply knocks it back to three, the next HPA tick pushes it to six, and the count ping-pongs on every apply and every tick. The workload never settles, and each swing means Pods created and torn down for nothing.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { manifest: '3', hpa: '6', replicas: 'ping-pong' });
      setRow(s, 6);
      s.refs.manifest.style.opacity = '1';
      // Conceptual step: no packet, no Pod acts. Both writer chips and the replicas chip flash once to
      // stand in for the endless back and forth.
      s.refs.manChip.classList.add('highlight');
      s.refs.hpaChip.classList.add('highlight');
      s.refs.replicasChip.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['manChip', 'hpaChip', 'replicasChip']);
    },
  },
  {
    id: 'fix',
    duration: 2800,
    narration: 'The fix is to delete spec.replicas from the manifest entirely. With no replica count in the applied object, kubectl apply no longer touches spec.replicas, so the manifest stops being a writer of the count at all.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { manifest: 'removed', hpa: '6', replicas: '6' });
      setRow(s, 6);
      // The manifest writer is greyed out: it no longer touches replicas. Pinned dim above the guard.
      s.refs.manifest.querySelector('.scheme-box-sublabel').textContent = 'no spec.replicas';
      s.refs.manifest.style.opacity = '0.32';
      s.refs.manChip.classList.add('highlight');
      if (ctx.reduced) return;
      ctx.register(s.refs.manifest.animate([{ opacity: 1 }, { opacity: 0.32 }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'coexist',
    duration: 3400,
    narration: 'Now the HPA is the only writer of replicas and the count holds steady at whatever it decides. A future apply still updates the image and the rest of the template, it just never fights over the number again. One owner, no ping-pong.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { manifest: 'removed', hpa: '6', replicas: '6' });
      setRow(s, 6);
      s.refs.manifest.querySelector('.scheme-box-sublabel').textContent = 'no spec.replicas';
      s.refs.manifest.style.opacity = '0.32';
      s.refs.hpa.classList.add('highlight');
      if (ctx.reduced) { s.refs.scaleBox.classList.add('highlight'); return; }
      // Only the HPA writes now: a single PATCH from the HPA lands on the endpoint, which lights, and
      // the steady row pulses to show it is settled.
      s.refs.packetLayer.appendChild(laneWire(HPA_LANE));
      const hpaPkt = routePacket(s, ctx, HPA_LANE, { cat: 'scaling' });
      ridingLabel(s, ctx, 'replicas 6', HPA_LANE);
      lightBoxAt(s.refs.scaleBox, ctx, hpaPkt.arrivalMs);
      [0, 1, 2, 3, 4, 5].forEach(i => pulsePod(s.refs.replicas[i].wrap, ctx, hpaPkt.arrivalMs));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
