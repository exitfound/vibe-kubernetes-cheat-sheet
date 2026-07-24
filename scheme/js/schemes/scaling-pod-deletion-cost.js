import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, chainList, setChainActive } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, setPodSublabel,
  makeInit, clearHighlights, clearWires, flashChips, FADE,
} from '../lib/scaling-kit.js';

// DISRUPTION card. When a ReplicaSet scales down it must choose WHICH identical Pods to remove. The
// controller.kubernetes.io/pod-deletion-cost annotation biases the choice: lower cost goes first.
// Without it the controller falls back to heuristics, removing unready Pods first, then newer ones,
// then those with more restarts. A high cost on a Pod holding a long-running task makes scale-down
// spare it.
//
// GEOMETRY. The ReplicaSet box sits top center. A row of five replica Pods sits on y=360 below the
// overlay, each showing its deletion cost as a sublabel. On scale-down the chosen victims ghost out
// to 0.32 while the kept Pods stay; a spared Pod pulses. The ReplicaSet is infrastructure: it lights
// via .highlight, only Pods pulse.
const SPINE_X = 600;

const RS_X = 460, RS_Y = 104, RS_W = 280, RS_H = 74;       // 460..740, center 600

const SLOTS = 5;
const P_W = 96, P_H = 120, P_GAP = 28;
const ROW_Y = 360;
const ROW_W = SLOTS * P_W + (SLOTS - 1) * P_GAP;           // 592
const ROW_X0 = SPINE_X - ROW_W / 2;                        // 304
const slotX = i => ROW_X0 + i * (P_W + P_GAP);             // 304,428,552,676,800

const CHIPS_Y = 556;

const COSTS = ['cost 100', 'cost 0', 'cost 50', 'cost -10', 'cost 200'];

function makePod(i) {
  const shell = pod({ x: slotX(i), y: ROW_Y, w: P_W, h: P_H, label: 'web', sublabel: COSTS[i], containers: 0, cat: 'scaling' });
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
      'aria-label': 'Choosing which replica to remove on scale-down. A ReplicaSet ranks its identical Pods by a deletion cost set through the controller.kubernetes.io/pod-deletion-cost annotation, removing the lowest-cost Pods first. Without the annotation it falls back to heuristics that remove unready Pods first, then newer ones. Setting a high cost on a Pod holding a long-running task makes scale-down spare it.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const rs = box({ x: RS_X, y: RS_Y, w: RS_W, h: RS_H, label: 'ReplicaSet web', sublabel: 'ranks Pods on scale-down', cat: 'scaling' });

    // The tie-break order the controller walks to pick a victim, one rung lit per step.
    const chain = chainList({
      x: 800, y: 150, w: 380, rowH: 30, gap: 8,
      items: [
        '1. not-Ready / Pending first',
        '2. lower deletion-cost',
        '3. more replicas on node',
        '4. newer Pod',
        '5. more restarts',
      ],
      cat: 'scaling',
    });

    const pods = [];
    for (let i = 0; i < SLOTS; i++) pods.push(makePod(i));

    const note = text({ class: 'scheme-box-sublabel', x: SPINE_X, y: 512, 'text-anchor': 'middle', 'data-cat': 'scaling' }, [' ']);

    const targetChip = valChip({ x: 150, y: CHIPS_Y, w: 240, h: 34, name: 'target',   value: '5',            cat: 'scaling' });
    const removeChip = valChip({ x: 410, y: CHIPS_Y, w: 300, h: 34, name: 'removing',  value: 'none',         cat: 'scaling' });
    const ruleChip   = valChip({ x: 730, y: CHIPS_Y, w: 360, h: 34, name: 'rule',      value: 'deletion-cost', cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: ReplicaSet box, replica row, the note, the chip strip, the packet layer, then the
    // ladder LAST so its rungs read above everything.
    root.appendChild(rs);
    pods.forEach(p => root.appendChild(p.wrap));
    root.appendChild(note);
    [targetChip, removeChip, ruleChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);
    root.appendChild(chain);

    this.host.appendChild(root);
    this.refs = {
      svg: root, rs, chain, pods, note,
      targetChip, removeChip, ruleChip,
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
function setChips(s, { target, remove, rule }) {
  setChip(s.refs.targetChip, target);
  setChip(s.refs.removeChip, remove);
  setChip(s.refs.ruleChip, rule);
}

// Per-Pod opacity: 'up' full (1), 'mark' selected candidate (0.55), 'ghost' removed (0). A removed Pod
// fades fully out, a candidate sits mid-dim. Pinned above the reduced guard so a cancel and reduced
// motion land on the right picture.
const OP = { up: '1', mark: '0.55', ghost: '0' };
function setPods(s, states) {
  s.refs.pods.forEach((p, i) => { p.wrap.style.opacity = OP[states[i]]; });
}
function setCosts(s, costs) {
  s.refs.pods.forEach((p, i) => setPodSublabel(p.shell, costs[i]));
}

// Light exactly the given tie-break rungs (0-based indices). Single-index steps read as setChainActive,
// the default-heuristics step lights two rungs at once (not-Ready and newer).
function setChainRows(s, idxs) {
  if (idxs.length === 1) { setChainActive(s.refs.chain, idxs[0]); return; }
  s.refs.chain.querySelectorAll('.scheme-chip').forEach(row => {
    row.classList.toggle('highlight', idxs.includes(Number(row.getAttribute('data-idx'))));
  });
}

function clearHL(s) {
  clearHighlights(s, ['rs', 'targetChip', 'removeChip', 'ruleChip'], s.refs.pods.map(p => p.wrap));
  s.refs.note.textContent = ' ';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A ReplicaSet runs five identical Pods, and each carries a pod-deletion-cost annotation. The Pods look the same, but that cost is how the controller decides which ones to give up when it has to shrink.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainRows(s, []);
      setChips(s, { target: '5', remove: 'none', rule: 'deletion-cost' });
      setCosts(s, COSTS);
      setPods(s, ['up', 'up', 'up', 'up', 'up']);
    },
  },
  {
    id: 'scale-down',
    duration: 2400,
    narration: 'The desired count drops from five to three, so two of the five Pods have to be removed. They are interchangeable, so the ReplicaSet needs a rule to pick which two actually go.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainRows(s, []);
      setChips(s, { target: '3', remove: '2 to remove', rule: 'deletion-cost' });
      setCosts(s, COSTS);
      setPods(s, ['up', 'up', 'up', 'up', 'up']);
      s.refs.rs.classList.add('highlight');
      s.refs.targetChip.classList.add('highlight');
      // Packet-less and pod-less: flash the ReplicaSet and the target chip so the decision reads.
      if (ctx.reduced) return;
      flashChips(s, ctx, ['rs', 'targetChip']);
    },
  },
  {
    id: 'cost-order',
    duration: 2600,
    narration: 'The controller ranks the Pods by deletion cost, lowest first. Cost -10 and cost 0 sit at the bottom of that order, so they are the two candidates to remove, while the higher-cost Pods are safer.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainRows(s, [1]);
      setChips(s, { target: '3', remove: 'lowest cost first', rule: 'deletion-cost' });
      setCosts(s, COSTS);
      // The two lowest-cost Pods (idx3 = -10, idx1 = 0) are marked as candidates by dimming.
      setPods(s, ['up', 'mark', 'up', 'mark', 'up']);
      s.refs.ruleChip.classList.add('highlight');
      s.refs.note.textContent = 'ranked lowest first, cost -10 then cost 0';
      if (ctx.reduced) return;
      ctx.register(s.refs.pods[1].wrap.animate([{ opacity: 1 }, { opacity: 0.55 }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(s.refs.pods[3].wrap.animate([{ opacity: 1 }, { opacity: 0.55 }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'pick',
    duration: 2600,
    narration: 'The two lowest-cost Pods are the ones removed, and the higher-cost Pods stay. Deletion cost let you steer scale-down toward the Pods you care least about, keeping the count at three.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainRows(s, [1]);
      setChips(s, { target: '3', remove: 'cost -10 and cost 0', rule: 'deletion-cost' });
      setCosts(s, COSTS);
      setPods(s, ['up', 'ghost', 'up', 'ghost', 'up']);
      s.refs.removeChip.classList.add('highlight');
      // The two chosen Pods fade fully out. They are terminating, not running, so they fade, not pulse.
      if (ctx.reduced) return;
      ctx.register(s.refs.pods[1].wrap.animate([{ opacity: 0.55 }, { opacity: 0 }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(s.refs.pods[3].wrap.animate([{ opacity: 0.55 }, { opacity: 0 }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'default-heuristics',
    duration: 2800,
    narration: 'Without the annotation the controller falls back to heuristics. It removes unready Pods first, then Pods on busier nodes, then the newest ones, then those with more restarts. Here the unready Pod and the newest Pod are the ones chosen.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainRows(s, [0, 3]);
      setChips(s, { target: '3', remove: 'unready and newest', rule: 'heuristics' });
      setCosts(s, ['no cost', 'not Ready', 'no cost', 'no cost', 'newest']);
      // idx1 is unready and idx4 is newest, so both are removed under the default heuristics.
      setPods(s, ['up', 'ghost', 'up', 'up', 'ghost']);
      s.refs.ruleChip.classList.add('highlight');
      s.refs.note.textContent = 'no annotation, so unready and newest Pods go first';
      if (ctx.reduced) return;
      // This is a fresh scenario, not a continuation: without the annotation the cost picks no longer
      // apply. So the whole row first settles back to five (idx3 was removed before, idx1 and idx4 fade
      // in), then the two heuristic victims, the unready Pod and the newest Pod, fade out. The settle
      // keeps a reappearing Pod from reading as a rendering fault.
      ctx.register(s.refs.pods[3].wrap.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 340, fill: 'forwards', easing: 'ease-out' }));
      [1, 4].forEach(i => ctx.register(s.refs.pods[i].wrap.animate(
        [{ opacity: 0, offset: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 1, offset: 0.5 }, { opacity: 0, offset: 1 }],
        { duration: 1200, fill: 'forwards', easing: 'ease-in-out' },
      )));
    },
  },
  {
    id: 'use',
    duration: 3000,
    narration: 'Put this to work by setting a high cost on a Pod you want kept, like one running a long batch job. Give the middle Pod cost 9999 and scale-down passes it over, removing the two lowest-cost Pods around it instead. The important Pod survives and keeps running.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainRows(s, [1]);
      setChips(s, { target: '3', remove: 'cost -10 and cost 0', rule: 'high cost is spared' });
      setCosts(s, ['cost 100', 'cost 0', 'cost 9999', 'cost -10', 'cost 200']);
      setPods(s, ['up', 'ghost', 'up', 'ghost', 'up']);
      s.refs.ruleChip.classList.add('highlight');
      s.refs.note.textContent = 'high cost keeps the long-running Pod through scale-down';
      if (ctx.reduced) return;
      // The two lowest-cost Pods fade fully out while the high-cost Pod is spared and pulses (running).
      ctx.register(s.refs.pods[1].wrap.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(s.refs.pods[3].wrap.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' }));
      pulsePod(s.refs.pods[2].wrap, ctx, 200);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
