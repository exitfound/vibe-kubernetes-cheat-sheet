import { svg, g } from '../lib/svg.js';
import { arrowDefs, pod, chainList } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod,
  makeInit, clearHighlights, clearWires, flashChips, FADE,
} from '../lib/scaling-kit.js';

// SCALING behavior card: THE STABILIZATION WINDOW. To avoid flapping, the HPA keeps a window of its
// recent recommendations. For scale DOWN it uses the HIGHEST recommendation over the last 300s, so a
// brief dip does not immediately shrink the workload. The scale-up window defaults to 0, so scale up
// reacts at once.
//
// GEOMETRY. A chainList LADDER of recent recommendation ticks (t-4 .. now) runs in the upper-center
// band, right of the narration overlay. Each row is a tick and its recommended replica count, and the
// rows carrying the recent maximum light up on the scale-down step. The replica ROW sits below. There
// is no controller box and no create packet on this card on purpose: the story is the recommendation
// history and the window, so growth and shrink are shown by the row itself, not by a controller loop.
//
// PULSE MODEL. Only Pods pulse, and only on the two steps where the row actually changes (expire
// shrinks it, scaleup-fast grows it). The recommendation / guard / dip steps are packet-less and
// pod-less (the count holds), so nothing pulses. Ladder rows never pulse: they light via a static
// highlight (setChainState), the recommendations step reveals them as a dial fade, and the guard / dip
// steps flash the recent-max chip so they do not read frozen.
const SPINE_X = 600;

// The recommendation ladder. idx 0..4 are the history already recorded, idx 5 is a fresh upward
// recommendation that only appears on the scale-up step.
const TICKS = [
  't-4   ·  rec 6',
  't-3   ·  rec 6',
  't-2   ·  rec 4',
  't-1   ·  rec 6',
  'now   ·  rec 4',
  'next  ·  rec 6',
];
const CHAIN_X = 430, CHAIN_Y = 140, CHAIN_W = 340, CHAIN_ROWH = 30, CHAIN_GAP = 8;

const SLOTS = 6;
const P_W = 96, P_H = 120, P_GAP = 28;
const ROW_Y = 388;
const ROW_W = SLOTS * P_W + (SLOTS - 1) * P_GAP;           // 716
const ROW_X0 = SPINE_X - ROW_W / 2;                        // 242
const slotX = i => ROW_X0 + i * (P_W + P_GAP);
const CHIPS_Y = 556;

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
      'aria-label': 'The HPA stabilization window. For scale down the autoscaler looks back over the last five minutes of its own recommendations and uses the highest one, so a brief drop is outvoted by the recent highs and the workload holds steady. A ladder shows the recent recommendation ticks with the maximum rows highlighted, the replica row holds while two dips to four are ignored, and only once the window rolls past those highs does the lower count take effect and the row shrinks. The scale-up window is zero, so an upward recommendation applies at once.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const chain = chainList({
      x: CHAIN_X, y: CHAIN_Y, w: CHAIN_W, rowH: CHAIN_ROWH, gap: CHAIN_GAP,
      items: TICKS, cat: 'scaling',
    });

    const replicas = [];
    for (let i = 0; i < SLOTS; i++) replicas.push(buildReplica(i));
    const rowGroup = g({});
    replicas.forEach(r => rowGroup.appendChild(r.wrap));

    const windowChip = valChip({ x: 150, y: CHIPS_Y, w: 300, h: 34, name: 'window',     value: 'scaleDown 300s', cat: 'scaling' });
    const maxChip    = valChip({ x: 480, y: CHIPS_Y, w: 300, h: 34, name: 'recent max',  value: '6',              cat: 'scaling' });
    const repChip    = valChip({ x: 810, y: CHIPS_Y, w: 240, h: 34, name: 'replicas',    value: '6',              cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: replica row, then chips, then the packet layer, then the chain ladder LAST so it renders
    // above the packet layer (mirrors the control canon).
    root.appendChild(rowGroup);
    [windowChip, maxChip, repChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);
    root.appendChild(chain);

    this.host.appendChild(root);
    this.refs = {
      svg: root, chain, replicas,
      windowChip, maxChip, repChip,
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
function setChips(s, { win, max, rep }) {
  setChip(s.refs.windowChip, win);
  setChip(s.refs.maxChip, max);
  setChip(s.refs.repChip, rep);
}

function chainRows(s) { return s.refs.chain.querySelectorAll('.scheme-chip'); }

// Paint every ladder row from a per-row state array: 'hidden' | 'dim' | 'base' | 'max'. The row is
// never pulsed, only lit via the static .highlight (max) or dimmed by opacity.
const CHAIN_OP = { hidden: '0', dim: '0.3', base: '1', max: '1' };
function setChainState(s, states) {
  chainRows(s).forEach((row, i) => {
    const st = states[i] || 'base';
    row.classList.toggle('highlight', st === 'max');
    row.style.opacity = CHAIN_OP[st];
  });
}

function setRow(s, visibleCount) {
  s.refs.replicas.forEach((r, i) => {
    r.wrap.style.opacity = i < visibleCount ? '1' : '0';
    r.wrap.style.transform = 'translate(0px, 0px)';
  });
}

function clearHL(s) {
  clearHighlights(s, ['windowChip', 'maxChip', 'repChip'], s.refs.replicas.map(r => r.wrap));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'The HPA does not act on a single recommendation. It keeps a window of its recent recommendations, and for scale down that window is three hundred seconds by default. This workload holds six replicas.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { win: 'scaleDown 300s', max: '6', rep: '6' });
      setChainState(s, ['dim', 'dim', 'dim', 'dim', 'dim', 'hidden']);
      setRow(s, 6);
    },
  },
  {
    id: 'recommendations',
    duration: 2600,
    narration: 'Over the last few ticks the controller has recommended six, six, four, six, then four. Each recommendation is recorded inside the window rather than acted on immediately. Together they form the recent history the scale-down decision reads.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { win: 'scaleDown 300s', max: '6', rep: '6' });
      setChainState(s, ['base', 'base', 'base', 'base', 'base', 'hidden']);
      setRow(s, 6);
      s.refs.maxChip.classList.add('highlight');
      if (ctx.reduced) return;
      // Packet-less and pod-less: the ladder rows fade in one after another as history is plotted, and
      // the recent-max chip flashes. Revealing a row is a dial fade, not a pulse.
      const rows = chainRows(s);
      for (let i = 0; i < 5; i++) {
        ctx.register(rows[i].animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 300, delay: i * 220, fill: 'forwards', easing: 'ease-out' }));
      }
      flashChips(s, ctx, ['maxChip'], 1200);
    },
  },
  {
    id: 'scaledown-guard',
    duration: 2600,
    narration: 'A scale-down decision does not use the latest recommendation, it uses the maximum over the whole window. The highest recent recommendation is six, so even though newer readings are lower the workload is held at six. The recent highs outvote the rest.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { win: 'scaleDown 300s', max: 'max 6', rep: '6' });
      setChainState(s, ['max', 'max', 'base', 'max', 'base', 'hidden']);
      setRow(s, 6);
      s.refs.maxChip.classList.add('highlight');
      if (ctx.reduced) return;
      // Still packet-less and pod-less: the three high rows light as the winning maximum and the
      // recent-max chip flashes. The row does not move.
      flashChips(s, ctx, ['maxChip'], 200);
    },
  },
  {
    id: 'dip',
    duration: 2400,
    narration: 'The two dips to four, one in the middle of the window and one at the latest tick, are exactly what the window is there to absorb. Because the maximum is still six, those momentary fours are ignored and no Pod is removed. A brief drop cannot shrink the workload on its own.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { win: 'scaleDown 300s', max: 'max 6', rep: '6' });
      setChainState(s, ['max', 'max', 'dim', 'max', 'dim', 'hidden']);
      setRow(s, 6);
      s.refs.maxChip.classList.add('highlight');
      if (ctx.reduced) return;
      // Packet-less and pod-less: the two dip rows dim as ignored while the highs stay lit, and the
      // recent-max chip flashes.
      flashChips(s, ctx, ['maxChip'], 200);
    },
  },
  {
    id: 'expire',
    duration: 3200,
    narration: 'Only once time moves on and the earlier sixes fall out of the three hundred second window does the maximum finally drop. With just the lower recommendations left, the governing value becomes four, and the workload shrinks. Two Pods are removed.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { win: 'scaleDown 300s', max: '4', rep: '4' });
      // The early highs age out of the window (dim), the later four becomes the new max.
      setChainState(s, ['dim', 'dim', 'dim', 'dim', 'max', 'hidden']);
      setRow(s, 4);
      s.refs.repChip.classList.add('highlight');
      if (ctx.reduced) return;
      // The row actually shrinks, so the two removed Pods pulse and then ghost out. Pinned final state
      // above the guard is the four-Pod row (setRow), the play path re-shows the victims to fade them.
      [4, 5].forEach((i, k) => {
        const w = s.refs.replicas[i].wrap;
        w.style.opacity = '1';
        pulsePod(w, ctx, k * 120);
        ctx.register(w.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, delay: 500 + k * 120, fill: 'forwards', easing: 'ease-in' }));
      });
    },
  },
  {
    id: 'scaleup-fast',
    duration: 3200,
    narration: 'Scaling up is different. Its stabilization window is zero by default, so there is nothing to hold it back. When load rises and a fresh recommendation of six arrives, the HPA grows the workload straight away rather than waiting out a window.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { win: 'scaleUp 0s', max: '6', rep: '6' });
      // A new upward recommendation of six appears at the head of the ladder and applies at once.
      setChainState(s, ['dim', 'dim', 'dim', 'dim', 'dim', 'max']);
      setRow(s, 6);
      s.refs.repChip.classList.add('highlight');
      if (ctx.reduced) return;
      // The fresh recommendation row reveals, then the row grows immediately: the two new Pods rise and
      // pulse (no window to wait out, no controller packet on this card).
      const rows = chainRows(s);
      ctx.register(rows[5].animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards', easing: 'ease-out' }));
      [4, 5].forEach((i, k) => {
        const w = s.refs.replicas[i].wrap;
        w.style.opacity = '0';
        w.style.transform = 'translate(0px, 14px)';
        const delay = 500 + k * 200;
        ctx.register(w.animate(
          [{ opacity: 0, transform: 'translate(0px, 14px)' }, { opacity: 1, transform: 'translate(0px, 0px)' }],
          { duration: 360, delay, fill: 'forwards', easing: 'ease-out' },
        ));
        pulsePod(w, ctx, delay + 120);
      });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
