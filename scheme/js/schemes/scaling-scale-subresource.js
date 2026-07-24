import { svg, g, text, path } from '../lib/svg.js';
import { arrowDefs, box, pod, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, flashChips, BEAT, FADE,
} from '../lib/scaling-kit.js';

// FOUNDATIONS card: the /scale subresource. replicas is not something a driver writes on the
// controller directly, it is exposed as a tiny separate REST endpoint, /scale, on a Deployment,
// ReplicaSet or StatefulSet. Two drivers, kubectl scale and the HorizontalPodAutoscaler, both PATCH
// that ONE endpoint, never the controller, and the controller reconciles whatever /scale says
// regardless of who wrote it. That decoupling is the whole point: any scaler drives any workload.
//
// GEOMETRY. The narration overlay owns the top-left, so the two driver boxes sit in the top band to
// the right of x=380 (kubectl left, HPA right). They both drop a PATCH packet onto one /scale
// endpoint box centered under them. The endpoint sits on the Deployment controller (a dim ownership
// spine links them), and the controller feeds the replica row on y=384, which grows or shrinks as the
// number in /scale changes. Only the Pod replicas pulse, the driver boxes and the endpoint light via
// .highlight and never pulse.
const SPINE_X = 660;

const KB_X = 395, KB_Y = 84, KB_W = 210, KB_H = 60;   // kubectl driver, center 500
const HP_X = 715, HP_Y = 84, HP_W = 210, HP_H = 60;   // HPA driver, center 820
const KB_CX = KB_X + KB_W / 2, KB_BOTTOM = KB_Y + KB_H;
const HP_CX = HP_X + HP_W / 2, HP_BOTTOM = HP_Y + HP_H;

const SC_X = 580, SC_Y = 196, SC_W = 160, SC_H = 64;  // /scale endpoint, center 660
const SC_TOP = SC_Y, SC_BOTTOM = SC_Y + SC_H;

const DEP_X = 520, DEP_Y = 286, DEP_W = 280, DEP_H = 74; // Deployment controller, center 660
const DEP_TOP = DEP_Y, DEP_BOTTOM = DEP_Y + DEP_H;       // 286..360

const DRIVER_BUS = 176;   // both driver lanes drop onto this bus, then across to the endpoint top

const SLOTS = 6;
const P_W = 88, P_H = 110, P_GAP = 24;
const ROW_Y = 384, ROW_BOTTOM = ROW_Y + P_H;
const ROW_W = SLOTS * P_W + (SLOTS - 1) * P_GAP;
const ROW_X0 = SPINE_X - ROW_W / 2;
const slotX = i => ROW_X0 + i * (P_W + P_GAP);
const slotCX = i => slotX(i) + P_W / 2;

const CREATE_BUS = 372;   // the controller drops create lanes onto this bus above the row
const CHIPS_Y = 556;

const kbLane = [[KB_CX, KB_BOTTOM], [KB_CX, DRIVER_BUS], [SPINE_X, DRIVER_BUS], [SPINE_X, SC_TOP]];
const hpLane = [[HP_CX, HP_BOTTOM], [HP_CX, DRIVER_BUS], [SPINE_X, DRIVER_BUS], [SPINE_X, SC_TOP]];
const createLane = i => [[SPINE_X, DEP_BOTTOM], [SPINE_X, CREATE_BUS], [slotCX(i), CREATE_BUS], [slotCX(i), ROW_Y]];

function laneWire(points, { dim = false } = {}) {
  const cls = 'scheme-arrow scheme-arrow-dashed scheme-arrow-scaling' + (dim ? ' scheme-arrow-dim' : '');
  const d = 'M ' + points.map(p => p.join(' ')).join(' L ');
  return path({ class: cls, d, 'stroke-dasharray': '5 5', fill: 'none' });
}

// A tag that rides ALONG with the ball on the same path, timing and easing, so the packet visibly
// carries the PATCH the step narrates. Balls are routePacket (eased), so the label defaults to the
// same ease-in-out and the same routeDur.
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
      'aria-label': 'The scale subresource. A Deployment exposes its replica count through a tiny separate REST endpoint called scale, and both kubectl scale and the HorizontalPodAutoscaler drive scaling by PATCHing that one endpoint rather than the controller directly. The controller reconciles whatever the scale endpoint says without caring which tool wrote it, which is why any scaler can drive any scale-capable workload.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubectlBox = box({ x: KB_X, y: KB_Y, w: KB_W, h: KB_H, label: 'kubectl scale', sublabel: 'imperative driver', cat: 'scaling' });
    const hpaBox     = box({ x: HP_X, y: HP_Y, w: HP_W, h: HP_H, label: 'HPA', sublabel: 'scaleTargetRef', cat: 'scaling' });
    const scaleBox   = box({ x: SC_X, y: SC_Y, w: SC_W, h: SC_H, label: '/scale', sublabel: 'spec.replicas', cat: 'scaling' });
    const depBox     = box({ x: DEP_X, y: DEP_Y, w: DEP_W, h: DEP_H, label: 'Deployment web', sublabel: 'reconciles the row', cat: 'scaling' });

    // Ownership link: the /scale endpoint belongs to the controller. Nothing travels it, so it is a
    // plain dim dashed line with no arrowhead, reading as a relationship rather than a route.
    const ownLink = laneWire([[SPINE_X, SC_BOTTOM], [SPINE_X, DEP_TOP]], { dim: true });

    const replicas = [];
    for (let i = 0; i < SLOTS; i++) replicas.push(buildReplica(i));
    const rowGroup = g({});
    replicas.forEach(r => rowGroup.appendChild(r.wrap));

    const specChip   = valChip({ x: 120, y: CHIPS_Y, w: 280, h: 34, name: 'spec.replicas',   value: '3',    cat: 'scaling' });
    const statusChip = valChip({ x: 440, y: CHIPS_Y, w: 300, h: 34, name: 'status.replicas', value: '3',    cat: 'scaling' });
    const driverChip = valChip({ x: 780, y: CHIPS_Y, w: 300, h: 34, name: 'driver',          value: 'idle', cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): controllers and endpoint, then the ownership link and replica row,
    // then the chip strip, then the packet layer on top so every ball rides above everything.
    [kubectlBox, hpaBox, scaleBox, depBox].forEach(el => root.appendChild(el));
    [ownLink, rowGroup].forEach(el => root.appendChild(el));
    [specChip, statusChip, driverChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, kubectlBox, hpaBox, scaleBox, depBox, ownLink, replicas,
      specChip, statusChip, driverChip,
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
function setChips(s, { spec, status, driver }) {
  setChip(s.refs.specChip, spec);
  setChip(s.refs.statusChip, status);
  setChip(s.refs.driverChip, driver);
}

function setRow(s, visibleCount) {
  s.refs.replicas.forEach((r, i) => {
    r.wrap.style.opacity = i < visibleCount ? '1' : '0';
    r.wrap.style.transform = 'translate(0px, 0px)';
  });
}

function clearHL(s) {
  clearHighlights(s, ['kubectlBox', 'hpaBox', 'scaleBox', 'depBox', 'specChip', 'statusChip', 'driverChip'],
    s.refs.replicas.map(r => r.wrap));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Deployment does not let a driver write its replica count directly. It exposes that count through a tiny separate endpoint called scale. This workload runs three replicas, and the next steps show who is allowed to change that number.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { spec: '3', status: '3', driver: 'idle' });
      setRow(s, 3);
    },
  },
  {
    id: 'anatomy',
    duration: 2200,
    narration: 'The scale object is deliberately tiny. It carries spec.replicas, the desired count, plus status.replicas and status.selector. It is one narrow REST endpoint on the workload, and every scaler talks to it instead of the full controller.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { spec: '3', status: '3', driver: 'idle' });
      setRow(s, 3);
      // A conceptual step: no packet and no Pod action, so the endpoint and the chips that describe
      // it flash once (the only sanctioned block flash).
      s.refs.scaleBox.classList.add('highlight');
      s.refs.specChip.classList.add('highlight');
      s.refs.statusChip.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['scaleBox', 'specChip', 'statusChip']);
    },
  },
  {
    id: 'kubectl-scale',
    duration: 3400,
    narration: 'kubectl scale sends a PATCH to the scale endpoint setting replicas to five. The controller reads the new number and reconciles, stamping two more Pods from the same template, and the row grows to five. kubectl never touched the controller, only the endpoint.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { spec: '5', status: '5', driver: 'kubectl' });
      setRow(s, 5);
      s.refs.kubectlBox.classList.add('highlight');
      s.refs.scaleBox.classList.add('highlight');
      s.refs.depBox.classList.add('highlight');
      if (ctx.reduced) return;
      // The PATCH rides the kubectl lane down onto the endpoint, then the controller reconciles and
      // creates the two new replicas, each rising and fading in as its create packet lands, then
      // pulsing (down-arrow: packet first, pulse on arrival).
      s.refs.packetLayer.appendChild(laneWire(kbLane));
      const patch = routePacket(s, ctx, kbLane, { cat: 'scaling' });
      ridingLabel(s, ctx, 'PATCH /scale replicas=5', kbLane);
      const NEW = [3, 4];
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
  {
    id: 'hpa-scale',
    duration: 2800,
    narration: 'Later the HorizontalPodAutoscaler PATCHes the very same endpoint, this time to four. It is a different driver going through the identical door, so the controller reconciles down and the row settles at four. The HPA has no special channel, it uses scale like kubectl does.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { spec: '4', status: '4', driver: 'HPA' });
      setRow(s, 4);
      s.refs.hpaBox.classList.add('highlight');
      s.refs.scaleBox.classList.add('highlight');
      s.refs.depBox.classList.add('highlight');
      if (ctx.reduced) return;
      s.refs.packetLayer.appendChild(laneWire(hpLane));
      const patch = routePacket(s, ctx, hpLane, { cat: 'scaling' });
      ridingLabel(s, ctx, 'PATCH /scale replicas=4', hpLane);
      // One replica is no longer wanted, so it ghosts out as the controller reconciles down. It is
      // leaving, so it does not pulse.
      const gone = s.refs.replicas[4].wrap;
      // fill:both so the backwards fill holds the Pod visible through the pre-fade delay window,
      // then it settles to the statically pinned opacity 0 (which reduced motion lands on directly).
      ctx.register(gone.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, delay: patch.arrivalMs + BEAT.afterHop, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'decoupling',
    duration: 2400,
    narration: 'The controller reconciles whatever scale says and does not care who wrote it. That single shared endpoint is why any scaler can drive any scale-capable workload, a Deployment, a ReplicaSet or a StatefulSet, without knowing what it is. Decoupling the number from the writer is the whole design.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { spec: '4', status: '4', driver: 'any scaler' });
      setRow(s, 4);
      // A conceptual close: the endpoint and the controller are the shared contract, so they flash
      // once together with the driver chip (no packet, no Pod action).
      s.refs.scaleBox.classList.add('highlight');
      s.refs.depBox.classList.add('highlight');
      s.refs.driverChip.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['scaleBox', 'depBox', 'driverChip']);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
