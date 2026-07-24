import { svg, g } from '../lib/svg.js';
import { arrowDefs, box, pod } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod,
  makeInit, clearHighlights, clearWires, flashChips, FADE,
} from '../lib/scaling-kit.js';

// DISRUPTION card. A PodDisruptionBudget declares minAvailable (or maxUnavailable) for a set of Pods.
// Every VOLUNTARY disruption (a drain, an eviction) must keep that budget satisfied, so the row of
// replicas shrinks only as far as the budget allows and a further eviction is denied. A PDB does not
// govern INVOLUNTARY disruptions like a node crash, which still take Pods regardless. The value the
// API server actually checks is status.disruptionsAllowed, carried here as a live chip.
//
// GEOMETRY. The PDB gauge sits top center (right of the narration overlay). A row of four replica
// Pods sits on y=360, below the overlay, using the full width. A removed Pod (evicted or crashed)
// fades fully out to 0, and a replacement rises back to Ready and pulses. The graceful eviction fades
// slowly, the involuntary crash snaps out fast and hard so the two do not read alike. The PDB is
// infrastructure: it lights via .highlight and never pulses, only Pods pulse.
const SPINE_X = 600;

const PDB_X = 460, PDB_Y = 104, PDB_W = 280, PDB_H = 74;   // 460..740, center 600

const SLOTS = 4;
const P_W = 96, P_H = 120, P_GAP = 28;
const ROW_Y = 360;
const ROW_W = SLOTS * P_W + (SLOTS - 1) * P_GAP;           // 468
const ROW_X0 = SPINE_X - ROW_W / 2;                        // 366
const slotX = i => ROW_X0 + i * (P_W + P_GAP);             // 366,490,614,738
const slotCX = i => slotX(i) + P_W / 2;

const CHIPS_Y = 556;

function makePod(i) {
  const shell = pod({ x: slotX(i), y: ROW_Y, w: P_W, h: P_H, label: 'web', sublabel: 'Ready', containers: 0, cat: 'scaling' });
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
      'aria-label': 'PodDisruptionBudget. A PDB declares minAvailable Pods for a set, and any voluntary disruption like a drain or an eviction must keep the budget satisfied. With minAvailable three, evicting one of four Pods is allowed, but a second eviction that would leave only two is denied. A PDB guards voluntary disruptions only, so an involuntary node crash still takes a Pod regardless, and the budget recovers once a replacement Pod is Ready.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const pdb = box({ x: PDB_X, y: PDB_Y, w: PDB_W, h: PDB_H, label: 'PodDisruptionBudget', sublabel: 'minAvailable: 3', cat: 'scaling' });

    const pods = [];
    for (let i = 0; i < SLOTS; i++) pods.push(makePod(i));

    const minChip         = valChip({ x: 150, y: CHIPS_Y, w: 250, h: 34, name: 'minAvailable',        value: '3',       cat: 'scaling' });
    const healthyChip     = valChip({ x: 420, y: CHIPS_Y, w: 260, h: 34, name: 'healthy',             value: '4 Ready', cat: 'scaling' });
    const disruptionsChip = valChip({ x: 700, y: CHIPS_Y, w: 380, h: 34, name: 'disruptionsAllowed', value: '1',       cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: PDB gauge, replica row, the chip strip, then the packet layer on top.
    root.appendChild(pdb);
    pods.forEach(p => root.appendChild(p.wrap));
    [minChip, healthyChip, disruptionsChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, pdb, pods,
      minChip, healthyChip, disruptionsChip,
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
function setChips(s, { min, healthy, disruptions }) {
  setChip(s.refs.minChip, min);
  setChip(s.refs.healthyChip, healthy);
  setChip(s.refs.disruptionsChip, disruptions);
}

// removed = indices that are evicted / crashed (opacity 0, fully out). All others are Ready at full
// opacity. Every slot is pinned above the reduced guard so a cancel and reduced motion land right.
function setPods(s, removed = []) {
  s.refs.pods.forEach((p, i) => {
    p.wrap.style.opacity = removed.includes(i) ? '0' : '1';
    p.wrap.style.transform = 'translate(0px, 0px)';
  });
}

function clearHL(s) {
  clearHighlights(s, ['pdb', 'minChip', 'healthyChip', 'disruptionsChip'], s.refs.pods.map(p => p.wrap));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Four replica Pods run behind this workload, and a PodDisruptionBudget asks that at least three stay available. The API server tracks status.disruptionsAllowed, which is one here: exactly one Pod may be voluntarily removed.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { min: '3', healthy: '4 Ready', disruptions: '1' });
      setPods(s, []);
    },
  },
  {
    id: 'allowed',
    duration: 2600,
    narration: 'A drain asks to evict one Pod. Four are Ready, so removing one still leaves three, which meets minAvailable. disruptionsAllowed was one, so the eviction is admitted and the Pod is gracefully terminated. It fades slowly as it drains.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { min: '3', healthy: '3 Ready', disruptions: '0' });
      setPods(s, [3]);
      // The PDB evaluated and permitted this removal, so it lights for the step. The evicted Pod is
      // not running, so it fades fully out rather than pulses. Graceful, so the fade is slow.
      s.refs.pdb.classList.add('highlight');
      if (ctx.reduced) return;
      ctx.register(s.refs.pods[3].wrap.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'blocked',
    duration: 2600,
    narration: 'A second eviction is requested while only three Pods are Ready. disruptionsAllowed is now zero, because removing another would drop availability below minAvailable three, so the API server refuses it with 429. The Pod stays put and the drain must wait.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { min: '3', healthy: '3 Ready', disruptions: '0' });
      setPods(s, [3]);
      // The targeted Pod stays: no fade, no pulse. Only the PDB gauge lights as it denies the request,
      // and disruptionsAllowed reads zero, which is exactly why the request is refused.
      s.refs.pdb.classList.add('highlight');
      s.refs.disruptionsChip.classList.add('highlight');
      // Packet-less and pod-less, so flash the PDB gauge to avoid a frozen frame. The value chip only
      // takes a static highlight, it never blinks.
      if (ctx.reduced) return;
      flashChips(s, ctx, ['pdb']);
    },
  },
  {
    id: 'voluntary-only',
    duration: 2800,
    narration: 'A PDB governs voluntary disruptions only. When a node crashes the Pod on it is lost immediately, and the budget has no say over that. Availability drops to two, below the minimum, through an involuntary event that no gate could have stopped.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { min: '3', healthy: '2 Ready', disruptions: '0' });
      setPods(s, [2, 3]);
      // No PDB highlight: it cannot act here. The crashed Pod snaps out fast and hard, taking
      // availability below the budget, which the PDB is powerless to prevent. The abrupt fade sets it
      // apart from the graceful eviction two steps back.
      s.refs.healthyChip.classList.add('highlight');
      if (ctx.reduced) return;
      ctx.register(s.refs.pods[2].wrap.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, fill: 'forwards', easing: 'cubic-bezier(0.7, 0, 0.9, 0.2)' }));
    },
  },
  {
    id: 'replacement',
    duration: 2800,
    narration: 'The controller starts replacements, and once they are Ready availability is back to four. disruptionsAllowed returns to one, so the next voluntary eviction is permitted again. The PDB paces disruption to match how fast healthy Pods return.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { min: '3', healthy: '4 Ready', disruptions: '1' });
      // Both lost Pods are replaced and Ready (full).
      setPods(s, []);
      s.refs.pdb.classList.add('highlight');
      s.refs.disruptionsChip.classList.add('highlight');
      if (ctx.reduced) return;
      // The fresh Pods come up and pulse as they turn Ready (they are now running).
      [2, 3].forEach((i, k) => {
        s.refs.pods[i].wrap.style.opacity = '0';
        ctx.register(s.refs.pods[i].wrap.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: k * 160, fill: 'forwards', easing: 'ease-out' }));
        pulsePod(s.refs.pods[i].wrap, ctx, FADE.in + k * 160);
      });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
