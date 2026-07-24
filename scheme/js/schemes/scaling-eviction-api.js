import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, segmentPacket, routeDur,
  makeInit, clearHighlights, clearWires, BEAT, FADE,
} from '../lib/scaling-kit.js';

// DISRUPTION card. Disruption-aware tools remove Pods through the Eviction API: a POST to
// .../pods/<p>/eviction that the API server checks against the PodDisruptionBudget, answering 429 Too
// Many Requests if the removal would breach a budget. A plain DELETE bypasses PDBs entirely and
// removes the Pod at once. That is why kubectl drain and autoscalers use eviction, not raw deletion.
//
// GEOMETRY. kubectl is on the left, the API server on the center line, the PodDisruptionBudget above
// it (consulted, not on a traffic wire, so the link has no arrowhead), and the target Pod on the
// right. Requests ride a forward lane to the API server, a denied request bounces back a 429 on its
// OWN return lane offset from the forward one, and an allowed removal rides on to the Pod, which
// ghosts out. kubectl, the API server and the PDB are infrastructure: they light, they never pulse.
const FLOW_Y = 346;                 // center line: kubectl and API server share it
const LANE_DY = 8;                  // half-gap between the forward and return kubectl <-> apiserver lanes
const FWD_Y = FLOW_Y - LANE_DY;     // 338: kubectl -> apiserver
const RET_Y = FLOW_Y + LANE_DY;     // 354: apiserver -> kubectl (429 bounce)

const KC_X = 80,  KC_W = 200, KC_RIGHT = KC_X + KC_W;      // 280
const API_X = 500, API_W = 220, API_RIGHT = API_X + API_W; // 720
const PDB_X = 520, PDB_Y = 150, PDB_W = 180, PDB_H = 64;
const POD_X = 900, POD_W = 170, POD_H = 120;               // center y = FLOW_Y (286..406)

const LANE_FWD  = [[KC_RIGHT, FWD_Y], [API_X, FWD_Y]];
const LANE_RET  = [[API_X, RET_Y], [KC_RIGHT, RET_Y]];
const LANE_TERM = [[API_RIGHT, FLOW_Y], [POD_X, FLOW_Y]];

const CHIPS_Y = 556;

// lightBoxAt: add .highlight on packet arrival, not at step entry, so a box "receives" a packet
// without pulsing (only Pods pulse). Under reduced motion or a non-positive delay it applies at once.
function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// A tag that rides ALONG with the ball on the same path, timing and easing, so the packet visibly
// carries the verb the step narrates. These lanes are straight hops carried by segmentPacket, which
// is linear, so the label rides linear too or it drifts off the ball mid-flight.
function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'linear' } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: -14, 'text-anchor': 'middle', 'data-cat': 'scaling' }, [txt]);
  lbl.style.opacity = '0';
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 160, fill: 'forwards', easing: 'ease-in' }));
}

function makePod() {
  const shell = pod({ x: POD_X, y: FLOW_Y - POD_H / 2, w: POD_W, h: POD_H, label: 'web-7f', sublabel: 'Running', containers: 0, cat: 'scaling' });
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
      'aria-label': 'The Eviction API versus deletion. Disruption-aware tools remove a Pod by posting to the Eviction API, which the API server checks against the PodDisruptionBudget, returning 429 Too Many Requests when the removal would breach the budget so the caller retries later. A plain DELETE bypasses budgets entirely and removes the Pod immediately, which is why drains and autoscalers use eviction instead.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubectl = box({ x: KC_X, y: FLOW_Y - 40, w: KC_W, h: 80, label: 'kubectl drain', sublabel: 'disruption-aware caller', cat: 'scaling' });
    const api     = box({ x: API_X, y: FLOW_Y - 40, w: API_W, h: 80, label: 'API server', sublabel: 'checks the PDB', cat: 'scaling' });
    const pdb     = box({ x: PDB_X, y: PDB_Y, w: PDB_W, h: PDB_H, label: 'PDB', sublabel: 'minAvailable: 3', cat: 'scaling' });
    const target  = makePod();

    // kubectl <-> apiserver lanes: forward request (upper), 429 return (lower, its own lane). The
    // apiserver -> Pod removal lane. The apiserver consults the PDB, which is a relationship not a
    // traffic path, so that link is a plain dashed line with no arrowhead.
    const wFwd  = arrow({ x1: KC_RIGHT, y1: FWD_Y, x2: API_X, y2: FWD_Y, dashed: true, dim: true, color: 'scaling' });
    const wRet  = arrow({ x1: API_X, y1: RET_Y, x2: KC_RIGHT, y2: RET_Y, dashed: true, dim: true, color: 'scaling' });
    const wTerm = arrow({ x1: API_RIGHT, y1: FLOW_Y, x2: POD_X, y2: FLOW_Y, dashed: true, dim: true, color: 'scaling' });
    const consult = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-scaling', x1: 610, y1: PDB_Y + PDB_H, x2: 610, y2: FLOW_Y - 40, 'stroke-dasharray': '5 5', fill: 'none' });

    const verbChip   = valChip({ x: 80,  y: CHIPS_Y, w: 300, h: 34, name: 'verb',      value: 'none',    cat: 'scaling' });
    const checkChip  = valChip({ x: 410, y: CHIPS_Y, w: 300, h: 34, name: 'pdb-check', value: 'n/a',     cat: 'scaling' });
    const resultChip = valChip({ x: 740, y: CHIPS_Y, w: 330, h: 34, name: 'result',    value: 'Running', cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: boxes and the Pod, then the wires above them, then the chips, then the packet layer.
    [kubectl, api, pdb, target.wrap].forEach(el => root.appendChild(el));
    [wFwd, wRet, wTerm, consult].forEach(el => root.appendChild(el));
    [verbChip, checkChip, resultChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, kubectl, api, pdb, target,
      verbChip, checkChip, resultChip,
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
function setChips(s, { verb, check, result }) {
  setChip(s.refs.verbChip, verb);
  setChip(s.refs.checkChip, check);
  setChip(s.refs.resultChip, result);
}

function clearHL(s) {
  clearHighlights(s, ['kubectl', 'api', 'pdb', 'verbChip', 'checkChip', 'resultChip'], [s.refs.target.wrap]);
  s.refs.pdb.style.opacity = '1';
  s.refs.target.wrap.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A running Pod is protected by a PodDisruptionBudget. Two ways exist to remove it: the Eviction API, which respects that budget, and a raw DELETE, which does not. The API server is what tells them apart.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { verb: 'none', check: 'n/a', result: 'Running' });
    },
  },
  {
    id: 'eviction-request',
    duration: 2200,
    narration: 'kubectl drain posts an eviction request for the Pod to the API server. Rather than delete the Pod directly, this asks the API server to remove it, and the API server first consults the PodDisruptionBudget that covers the Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { verb: 'POST eviction', check: 'consulting', result: 'pending' });
      if (ctx.reduced) { s.refs.api.classList.add('highlight'); s.refs.pdb.classList.add('highlight'); return; }
      // The request rides the forward lane to the API server, which lights on arrival and consults
      // the PDB. No Pod acts yet, so nothing pulses.
      const req = segmentPacket(s, ctx, { from: LANE_FWD[0], to: LANE_FWD[1], cat: 'scaling' });
      ridingLabel(s, ctx, 'POST .../pods/web-7f/eviction policy/v1', LANE_FWD);
      lightBoxAt(s.refs.api, ctx, req.arrivalMs);
      lightBoxAt(s.refs.pdb, ctx, req.arrivalMs);
    },
  },
  {
    id: 'allowed',
    duration: 2400,
    narration: 'The budget still holds with one fewer Pod, so the API server admits the eviction. It marks the Pod for deletion and the kubelet gracefully terminates it. The eviction succeeded because the PodDisruptionBudget was satisfied.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { verb: 'POST eviction', check: 'budget ok', result: 'terminated' });
      s.refs.api.classList.add('highlight');
      s.refs.pdb.classList.add('highlight');
      // The admitted removal is delivered to the Pod, which ghosts out as it terminates. A dying Pod
      // is not running, so it fades rather than pulses.
      s.refs.target.wrap.style.opacity = '0.32';
      if (ctx.reduced) return;
      s.refs.target.wrap.style.opacity = '1';
      const term = segmentPacket(s, ctx, { from: LANE_TERM[0], to: LANE_TERM[1], delay: BEAT.afterHop, cat: 'scaling' });
      ridingLabel(s, ctx, 'terminate', LANE_TERM, { delay: BEAT.afterHop });
      ctx.register(s.refs.target.wrap.animate([{ opacity: 1 }, { opacity: 0.32 }], { duration: FADE.out, delay: term.arrivalMs, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'denied',
    duration: 2800,
    narration: 'On a different attempt the budget is already at its minimum, so removing this Pod would breach it. The API server refuses and answers 429 Too Many Requests. The Pod stays running and the caller is expected to back off and retry later.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { verb: 'POST eviction', check: 'would breach', result: '429 retry later' });
      s.refs.api.classList.add('highlight');
      s.refs.pdb.classList.add('highlight');
      s.refs.resultChip.classList.add('highlight');
      // The Pod is untouched: no ghost, no pulse. The request rides in, and the 429 bounces back on
      // its OWN return lane offset from the forward one, so the round trip reads as a refusal.
      if (ctx.reduced) return;
      const req = segmentPacket(s, ctx, { from: LANE_FWD[0], to: LANE_FWD[1], cat: 'scaling' });
      ridingLabel(s, ctx, 'POST .../pods/web-7f/eviction policy/v1', LANE_FWD);
      const back = segmentPacket(s, ctx, { from: LANE_RET[0], to: LANE_RET[1], delay: req.arrivalMs + BEAT.afterHop, cat: 'scaling' });
      ridingLabel(s, ctx, '429 Too Many Requests', LANE_RET, { delay: req.arrivalMs + BEAT.afterHop });
      void back;
    },
  },
  {
    id: 'raw-delete',
    duration: 3000,
    narration: 'A plain DELETE skips all of this. It goes straight to the API server, no budget is consulted, and the Pod is removed at once even if that breaks the PodDisruptionBudget. This is exactly why disruption-aware tools use eviction and never raw deletion.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { verb: 'DELETE', check: 'bypassed', result: 'removed now' });
      s.refs.api.classList.add('highlight');
      // The PDB is not consulted at all, so it dims to show it was bypassed.
      s.refs.pdb.style.opacity = '0.35';
      s.refs.target.wrap.style.opacity = '0.32';
      if (ctx.reduced) return;
      s.refs.target.wrap.style.opacity = '1';
      const del = segmentPacket(s, ctx, { from: LANE_FWD[0], to: LANE_FWD[1], cat: 'scaling' });
      ridingLabel(s, ctx, 'DELETE .../pods/web-7f', LANE_FWD);
      const term = segmentPacket(s, ctx, { from: LANE_TERM[0], to: LANE_TERM[1], delay: del.arrivalMs + BEAT.afterHop, cat: 'scaling' });
      ridingLabel(s, ctx, 'remove', LANE_TERM, { delay: del.arrivalMs + BEAT.afterHop });
      ctx.register(s.refs.target.wrap.animate([{ opacity: 1 }, { opacity: 0.32 }], { duration: FADE.out, delay: term.arrivalMs, fill: 'forwards', easing: 'ease-in' }));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
