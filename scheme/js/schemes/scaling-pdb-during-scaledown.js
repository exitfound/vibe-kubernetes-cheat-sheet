import { svg, g, text, path } from '../lib/svg.js';
import { arrowDefs, box, node, pod, chainList, setChainActive, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, segmentPacket, routeDur,
  makeInit, clearHighlights, clearWires, flashChips, BEAT, FADE,
} from '../lib/scaling-kit.js';

// DISRUPTION card. During a node drain the PodDisruptionBudget throttles how fast Pods leave. The
// drain cordons the node, evicts one Pod, waits for a replacement to become Ready elsewhere, then
// evicts the next, repeating until the node is empty, so the number of Ready Pods never dips below the
// budget. An all-at-once outage becomes a careful one-out one-in march. The drain ladder in the center
// names those four stages and lights one per step.
//
// GEOMETRY. The PDB gauge sits top center, the drain ladder in the free band between the two nodes.
// The draining node-1 sits lower-left (below the overlay) holding three app Pods, and the receiving
// node-2 sits lower-right where replacements come up. A drained Pod ghosts out of node-1 to 0.32, its
// replacement rises on node-2 and pulses as it turns Ready. Each eviction cycle rides an evict ball
// along the drain spine. The nodes and the PDB are infrastructure: they light via .highlight, only
// Pods pulse.
const PDB_X = 460, PDB_Y = 96, PDB_W = 280, PDB_H = 66;    // 460..740, center 600

const NODE_Y = 306, NODE_W = 320, NODE_H = 225;
const N1_X = 90, N2_X = 760;                               // 90..410, 760..1080

const P_W = 88, P_H = 100, SLOT_Y = 414;
const slotX = (nodeX, i) => nodeX + 16 + i * 100;

const CHIPS_Y = 556;

function makePod(x, label) {
  const shell = pod({ x, y: SLOT_Y, w: P_W, h: P_H, label, sublabel: 'Ready', containers: 0, cat: 'scaling' });
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
      'aria-label': 'A PodDisruptionBudget guarding a node drain. The budget asks that at least two of the three app Pods stay Ready. The drain cordons node-1 and evicts one Pod, waits for a replacement to become Ready on node-2, then evicts the next, pacing the disruption so availability never dips below the budget until node-1 is empty.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const pdb = box({ x: PDB_X, y: PDB_Y, w: PDB_W, h: PDB_H, label: 'PDB', sublabel: 'minAvailable: 2 across the app', cat: 'scaling' });

    const node1 = node({ x: N1_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'node-1 draining' });
    const node2 = node({ x: N2_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'node-2' });

    const n1 = ['web-a', 'web-b', 'web-c'].map((lbl, i) => makePod(slotX(N1_X, i), lbl));
    const n2 = ['web-d', 'web-e', 'web-f'].map((lbl, i) => makePod(slotX(N2_X, i), lbl));

    // A dim spine from the draining node to the receiving node: the drain relationship, not traffic,
    // so no arrowhead.
    const spine = path({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-scaling scheme-arrow-dim', d: `M ${N1_X + NODE_W} ${NODE_Y + NODE_H / 2} L ${N2_X} ${NODE_Y + NODE_H / 2}`, 'stroke-dasharray': '5 5', fill: 'none' });

    const drainChip   = valChip({ x: 90,  y: CHIPS_Y, w: 320, h: 34, name: 'draining', value: 'not started', cat: 'scaling' });
    const healthyChip = valChip({ x: 440, y: CHIPS_Y, w: 240, h: 34, name: 'healthy',  value: '3 Ready',     cat: 'scaling' });
    const budgetChip  = valChip({ x: 710, y: CHIPS_Y, w: 370, h: 34, name: 'budget',   value: 'min 2 ok',    cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: PDB gauge and node frames, the drain spine, the Pods on top of the frames, the chip
    // strip, then the packet layer.
    [pdb, node1, node2, spine].forEach(el => root.appendChild(el));
    n1.concat(n2).forEach(p => root.appendChild(p.wrap));
    [drainChip, healthyChip, budgetChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, pdb, node1, node2, spine, n1, n2,
      drainChip, healthyChip, budgetChip,
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
function setChips(s, { draining, healthy, budget }) {
  setChip(s.refs.drainChip, draining);
  setChip(s.refs.healthyChip, healthy);
  setChip(s.refs.budgetChip, budget);
}

// State codes: 'up' Ready (1), 'boot' starting (0.55), 'ghost' evicted (0.32), 'off' not created (0).
const OP = { up: '1', boot: '0.55', ghost: '0.32', off: '0' };
function setPods(s, n1States, n2States) {
  s.refs.n1.forEach((p, i) => { p.wrap.style.opacity = OP[n1States[i]]; });
  s.refs.n2.forEach((p, i) => { p.wrap.style.opacity = OP[n2States[i]]; });
}

function clearHL(s) {
  clearHighlights(s, ['pdb', 'node1', 'node2', 'drainChip', 'healthyChip', 'budgetChip'],
    s.refs.n1.concat(s.refs.n2).map(p => p.wrap));
}

// Fade a Pod from one opacity to another (ghost-out or rise-in), pinned statically by setPods above.
function fadeTo(s, ctx, wrap, from, to, { delay = 0, easing = 'ease-in' } = {}) {
  ctx.register(wrap.animate([{ opacity: from }, { opacity: to }], { duration: FADE.out, delay, fill: 'forwards', easing }));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Three app Pods run on node-1, and a PodDisruptionBudget asks that at least two stay Ready at all times. node-2 has room to receive replacements. The drain about to begin must honor that budget throughout.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { draining: 'not started', healthy: '3 Ready', budget: 'min 2 ok' });
      setPods(s, ['up', 'up', 'up'], ['off', 'off', 'off']);
    },
  },
  {
    id: 'drain-start',
    duration: 2200,
    narration: 'The drain cordons node-1 so no new Pods land there, then prepares to evict its Pods one at a time. Nothing has been removed yet, all three Pods are still Ready and the budget is comfortably met.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { draining: 'cordoned', healthy: '3 Ready', budget: 'min 2 ok' });
      setPods(s, ['up', 'up', 'up'], ['off', 'off', 'off']);
      s.refs.node1.classList.add('highlight');
      // Packet-less and pod-less: flash the cordoned node and the draining chip so the step reads.
      if (ctx.reduced) return;
      flashChips(s, ctx, ['node1', 'drainChip']);
    },
  },
  {
    id: 'evict-one',
    duration: 2800,
    narration: 'The drain evicts the first Pod, web-a. It ghosts off node-1, and the controller immediately starts a replacement on node-2 which is not Ready yet. Availability is momentarily two Ready, exactly at the minimum the budget allows.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { draining: 'evict web-a', healthy: '2 Ready', budget: 'at minimum' });
      setPods(s, ['ghost', 'up', 'up'], ['boot', 'off', 'off']);
      s.refs.node1.classList.add('highlight');
      s.refs.node2.classList.add('highlight');
      s.refs.healthyChip.classList.add('highlight');
      // The evicted Pod ghosts out (not running, so it fades) and its replacement rises to a booting
      // dim, still not counted as Ready. Neither pulses yet.
      if (ctx.reduced) return;
      fadeTo(s, ctx, s.refs.n1[0].wrap, 1, 0.32);
      fadeTo(s, ctx, s.refs.n2[0].wrap, 0, 0.55, { easing: 'ease-out' });
    },
  },
  {
    id: 'wait',
    duration: 2800,
    narration: 'The drain does not touch the next Pod until the replacement is Ready. Once web-d passes its readiness check on node-2, availability is back to three Ready. Only now is the budget clear for the next eviction.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { draining: 'web-a replaced', healthy: '3 Ready', budget: 'min 2 ok' });
      setPods(s, ['ghost', 'up', 'up'], ['up', 'off', 'off']);
      s.refs.node2.classList.add('highlight');
      // The replacement turns Ready: it rises from booting to full and pulses (it is now running).
      if (ctx.reduced) return;
      s.refs.n2[0].wrap.style.opacity = '0.55';
      ctx.register(s.refs.n2[0].wrap.animate([{ opacity: 0.55 }, { opacity: 1 }], { duration: FADE.in, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.n2[0].wrap, ctx, FADE.in);
    },
  },
  {
    id: 'throttled',
    duration: 3000,
    narration: 'The march continues at the pace the budget sets. web-b is evicted and its replacement web-e comes up Ready on node-2, and because each eviction waits for a replacement, at least two Pods are Ready the entire time. The PDB is what throttles it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { draining: 'evict web-b', healthy: '3 Ready', budget: 'held >= 2' });
      setPods(s, ['ghost', 'ghost', 'up'], ['up', 'up', 'off']);
      s.refs.node1.classList.add('highlight');
      s.refs.node2.classList.add('highlight');
      s.refs.budgetChip.classList.add('highlight');
      if (ctx.reduced) return;
      // web-b ghosts off node-1 while its replacement rises Ready and pulses on node-2, so the count
      // never falls below the budget.
      fadeTo(s, ctx, s.refs.n1[1].wrap, 1, 0.32);
      s.refs.n2[1].wrap.style.opacity = '0';
      ctx.register(s.refs.n2[1].wrap.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: 200, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.n2[1].wrap, ctx, FADE.in + 200);
    },
  },
  {
    id: 'done',
    duration: 3000,
    narration: 'The last Pod web-c is evicted and web-f comes up Ready, leaving node-1 empty and every replica now on node-2. The node drained fully without ever breaching the budget. A potential outage became an orderly one-out one-in handover.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { draining: 'node-1 empty', healthy: '3 Ready', budget: 'never breached' });
      setPods(s, ['ghost', 'ghost', 'ghost'], ['up', 'up', 'up']);
      s.refs.node2.classList.add('highlight');
      if (ctx.reduced) return;
      fadeTo(s, ctx, s.refs.n1[2].wrap, 1, 0.32);
      s.refs.n2[2].wrap.style.opacity = '0';
      ctx.register(s.refs.n2[2].wrap.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: 200, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.n2[2].wrap, ctx, FADE.in + 200);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
