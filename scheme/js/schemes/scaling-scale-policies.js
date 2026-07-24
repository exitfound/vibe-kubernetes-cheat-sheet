import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, chainList, setChainActive } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod,
  makeInit, clearHighlights, clearWires, flashChips,
} from '../lib/scaling-kit.js';

// SCALING behavior card: SCALE RATE POLICIES. behavior.scaleUp and scaleDown define policies that cap
// the RATE of change (for example at most 4 Pods per 60s AND at most 100 percent per 60s), with
// selectPolicy Max, Min, or Disabled choosing between them. This turns a huge desired jump into a
// series of bounded steps. scaleDown selectPolicy Disabled means never scale down automatically.
//
// GEOMETRY. A small HPA header box sits top center, and a chainList ladder below it carries the three
// scaleUp policies (Pods cap, Percent cap, selectPolicy), one row lit per step. Below the ladder a
// WIDE ROW of small replica cells shows all twenty desired Pods at once: the ones already created are
// solid and the rest are a dim GHOST of the desired count of twenty, so the gap between current and
// desired is always visible. The row fills in capped steps 4 to 8 to 16 rather than jumping to twenty.
//
// PULSE MODEL. Only Pods pulse, on the two step-in steps where the row actually grows (the new cells
// rise and pulse). The policy, selectPolicy and disabled steps are packet-less and pod-less (the count
// is being reasoned about, not changed), so the HPA header is flashed via flashChips instead. No create
// packet is drawn: the cap, not a controller loop, is the subject here. Ladder rows light via
// setChainActive and never pulse.
const SPINE_X = 600;

const HDR_X = 430, HDR_Y = 96, HDR_W = 400, HDR_H = 60;   // header box, center 630
const CHAIN_X = 430, CHAIN_Y = 176, CHAIN_W = 400;        // policy ladder, right of the overlay

const CELL_W = 46, CELL_H = 64, CELL_GAP = 10;
const CELLS = 20;
const ROW_W = CELLS * CELL_W + (CELLS - 1) * CELL_GAP;     // 1110
const ROW_X0 = (1200 - ROW_W) / 2;                         // 45
const ROW_Y = 424;
const cellX = i => ROW_X0 + i * (CELL_W + CELL_GAP);
const CHIPS_Y = 556;

function buildCell(i) {
  const shell = pod({ x: cellX(i), y: ROW_Y, w: CELL_W, h: CELL_H, label: '', containers: 0, cat: 'scaling' });
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
      'aria-label': 'HPA scale rate policies. Each direction can cap the rate of change, for example at most four Pods or a hundred percent every sixty seconds, and selectPolicy chooses between the caps with Max, Min, or Disabled. A desired jump from four Pods to twenty does not happen in one move: the row of Pods fills in bounded steps, four to eight to sixteen, with the remaining desired Pods shown as a dim ghost. Setting scaleDown to Disabled stops the workload from ever shrinking on its own.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const hpa = box({ x: HDR_X, y: HDR_Y, w: HDR_W, h: HDR_H, label: 'HorizontalPodAutoscaler', sublabel: 'behavior policies', cat: 'scaling' });

    // The scaleUp policy ladder: the two rate caps plus the selectPolicy that chooses between them.
    const chain = chainList({
      x: CHAIN_X, y: CHAIN_Y, w: CHAIN_W, rowH: 42, gap: 14,
      items: [
        '1. Pods          ·  4 per 60s',
        '2. Percent       ·  100% per 60s',
        '3. selectPolicy  ·  Max',
      ],
      cat: 'scaling',
    });

    const desiredLbl = text({ class: 'scheme-label code dim', x: cellX(CELLS - 1) + CELL_W, y: ROW_Y - 14, 'text-anchor': 'end' }, ['desired 20']);

    const cells = [];
    for (let i = 0; i < CELLS; i++) cells.push(buildCell(i));
    const rowGroup = g({});
    cells.forEach(c => rowGroup.appendChild(c.wrap));

    const desiredChip   = valChip({ x: 70,  y: CHIPS_Y, w: 210, h: 34, name: 'desired',   value: '20',   cat: 'scaling' });
    const appliedChip   = valChip({ x: 300, y: CHIPS_Y, w: 330, h: 34, name: 'applied',   value: '-',    cat: 'scaling' });
    const repChip       = valChip({ x: 650, y: CHIPS_Y, w: 200, h: 34, name: 'replicas',  value: '4',    cat: 'scaling' });
    const scaleDownChip = valChip({ x: 870, y: CHIPS_Y, w: 260, h: 34, name: 'scaleDown', value: 'auto', cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): header box, desired label, replica row, chip strip, packet layer, then
    // the ladder LAST so its rows read above everything.
    [hpa, desiredLbl, rowGroup].forEach(el => root.appendChild(el));
    [desiredChip, appliedChip, repChip, scaleDownChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);
    root.appendChild(chain);

    this.host.appendChild(root);
    this.refs = {
      svg: root, hpa, chain, cells,
      desiredChip, appliedChip, repChip, scaleDownChip,
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
function setChips(s, { desired, applied, rep, scaleDown }) {
  setChip(s.refs.desiredChip, desired);
  setChip(s.refs.appliedChip, applied);
  setChip(s.refs.repChip, rep);
  setChip(s.refs.scaleDownChip, scaleDown);
}

// Light exactly the given ladder rows (an array of 0-based indices). Single-index steps still read as
// setChainActive, but the policy step needs both rate-cap rows lit at once.
function setChainRows(s, idxs) {
  if (idxs.length === 1) { setChainActive(s.refs.chain, idxs[0]); return; }
  s.refs.chain.querySelectorAll('.scheme-chip').forEach(row => {
    row.classList.toggle('highlight', idxs.includes(Number(row.getAttribute('data-idx'))));
  });
}

// Solid up to realCount, dim ghost from there to the desired twenty, so the gap is always on screen.
function setRow(s, realCount) {
  s.refs.cells.forEach((c, i) => {
    c.wrap.style.opacity = i < realCount ? '1' : '0.26';
    c.wrap.style.transform = 'translate(0px, 0px)';
  });
}

function clearHL(s) {
  clearHighlights(s, ['hpa', 'desiredChip', 'appliedChip', 'repChip', 'scaleDownChip'], s.refs.cells.map(c => c.wrap));
}

// Grow the row from `from` to `to`: those cells go from ghost to solid, rising and pulsing on the way.
function growTo(s, ctx, from, to) {
  for (let i = from; i < to; i++) {
    const w = s.refs.cells[i].wrap;
    w.style.opacity = '0.26';
    w.style.transform = 'translate(0px, 12px)';
    const delay = 350 + (i - from) * 130;
    ctx.register(w.animate(
      [{ opacity: 0.26, transform: 'translate(0px, 12px)' }, { opacity: 1, transform: 'translate(0px, 0px)' }],
      { duration: 320, delay, fill: 'forwards', easing: 'ease-out' },
    ));
    pulsePod(w, ctx, delay + 100);
  }
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Load spikes and the HPA computes a desired count of twenty, up from four. Without any behavior policy it would jump straight there in one move. The dim cells show that desired target of twenty against the four Pods that exist today.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainRows(s, []);
      setChips(s, { desired: '20', applied: '-', rep: '4', scaleDown: 'auto' });
      setRow(s, 4);
    },
  },
  {
    id: 'policy',
    duration: 2400,
    narration: 'behavior.scaleUp caps how fast the count may climb. Two policies apply here: at most four Pods per sixty seconds, and at most one hundred percent of the current count per sixty seconds. Each is a ceiling on a single scaling period.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainRows(s, [0, 1]);
      setChips(s, { desired: '20', applied: '-', rep: '4', scaleDown: 'auto' });
      setRow(s, 4);
      s.refs.hpa.classList.add('highlight');
      if (ctx.reduced) return;
      // Packet-less and pod-less: the HPA header is flashed while its two rate caps are read.
      flashChips(s, ctx, ['hpa']);
    },
  },
  {
    id: 'selectPolicy',
    duration: 2400,
    narration: 'When several policies apply, selectPolicy decides between them. Max takes the larger allowed step so scaling is as responsive as the caps permit, Min takes the smaller for caution. This HPA uses Max.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainRows(s, [2]);
      setChips(s, { desired: '20', applied: '-', rep: '4', scaleDown: 'auto' });
      setRow(s, 4);
      s.refs.hpa.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['hpa']);
    },
  },
  {
    id: 'step1',
    duration: 3000,
    narration: 'In the first period the caps are four Pods, or one hundred percent of four which is also four. Max picks four, so the row grows from four to eight, not straight to twenty. The desired count is still twenty, but this period may only add four.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // The flat Pods cap governs this period, so its ladder row lights.
      setChainRows(s, [0]);
      setChips(s, { desired: '20', applied: '+4 to 8', rep: '8', scaleDown: 'auto' });
      setRow(s, 8);
      s.refs.repChip.classList.add('highlight');
      s.refs.appliedChip.classList.add('highlight');
      if (ctx.reduced) return;
      // The row actually grows, so the four new cells rise and pulse.
      growTo(s, ctx, 4, 8);
    },
  },
  {
    id: 'step2',
    duration: 3800,
    narration: 'The next period recomputes the caps against the new count. One hundred percent of eight is eight, larger than the flat four Pods, so Max now allows eight and the row grows from eight to sixteen. The bounded climb keeps closing the gap toward twenty.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // Now the Percent cap wins, so its ladder row lights instead.
      setChainRows(s, [1]);
      setChips(s, { desired: '20', applied: '+8 to 16', rep: '16', scaleDown: 'auto' });
      setRow(s, 16);
      s.refs.repChip.classList.add('highlight');
      s.refs.appliedChip.classList.add('highlight');
      if (ctx.reduced) return;
      growTo(s, ctx, 8, 16);
    },
  },
  {
    id: 'disabled',
    duration: 2600,
    narration: 'The other direction has its own policies. Setting scaleDown selectPolicy to Disabled means the HPA will never remove Pods automatically. Once it has grown, the workload holds at sixteen until something raises the count again.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // scaleDown is a separate direction, so no scaleUp ladder row is lit here.
      setChainRows(s, []);
      setChips(s, { desired: '20', applied: '-', rep: '16', scaleDown: 'Disabled' });
      setRow(s, 16);
      s.refs.hpa.classList.add('highlight');
      s.refs.scaleDownChip.classList.add('highlight');
      if (ctx.reduced) return;
      // Packet-less and pod-less: the row is steady, the HPA header flashes to mark the rule.
      flashChips(s, ctx, ['hpa']);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
