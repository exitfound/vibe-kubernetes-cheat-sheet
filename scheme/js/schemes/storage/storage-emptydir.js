import { svg, g, text, path } from '../../lib/svg.js';
import { arrowDefs, box, pod, node, cylinder, pathArrow } from '../../lib/primitives.js';
import { valChip, setVal, setCylinderLabel, pulsePod, routePacket, makeInit, clearHighlights, clearWires, BEAT, makeRidingLabel, lightBoxAt, OPACITY } from './storage-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#storage-emptydir


const NODE_X = 180, NODE_Y = 170, NODE_W = 840, NODE_H = 380;   // 180..1020, center 600, bottom 550

const POD_X = 300, POD_Y = 186, POD_W = 600, POD_H = 170;       // 300..900, center 600
const POD_BOTTOM = POD_Y + POD_H;                               // 356

const C_Y = 232, C_W = 190, C_H = 84;                           // container row (volume-model grid)
const C_BOTTOM = C_Y + C_H;                                     // 316
const APP_X = 330,  APP_CX = APP_X + C_W / 2;                   // 330..520, center 425
const SIDE_X = 680, SIDE_CX = SIDE_X + C_W / 2;                 // 680..870, center 775

// The disk is the volume-model cylinder verbatim (260x104 centered on 600) so the two foundation
// cards read as one family.
const ED_X = 470, ED_Y = 408, ED_W = 260, ED_H = 104;           // 470..730, center 600, bottom 512
const ED_TOP = ED_Y;
const ED_MY = ED_Y + ED_H / 2;                                  // 460, where the lanes meet the sides

const SPINE_X = 600;
const DISK_LBL_Y = 530;
const CHIPS_Y = 566;

// Each lane is one L-shaped polyline shared by its static pathArrow and its ball, written in its
// one traffic direction so the arrowhead lands at the receiving end.
const LANE_WRITE = [[APP_CX, C_BOTTOM], [APP_CX, ED_MY], [ED_X, ED_MY]];              // app -> disk
const LANE_READ  = [[ED_X + ED_W, ED_MY], [SIDE_CX, ED_MY], [SIDE_CX, C_BOTTOM]];     // disk -> worker

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

function containerBlock({ x, y, w, h, label, sublabel }) {
  const b = box({ x, y, w, h, label, sublabel, role: 'storage' });
  const wrap = g({});
  wrap.appendChild(b);
  return { wrap, box: b };
}

function laneWire(points, { dim = false } = {}) {
  const cls = 'scheme-arrow scheme-arrow-dashed scheme-arrow-storage' + (dim ? ' scheme-arrow-dim' : '');
  const d = 'M ' + points.map(p => p.join(' ')).join(' L ');
  return path({ class: cls, d, 'stroke-dasharray': '5 5', fill: 'none' });
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
      'aria-label': 'emptyDir lifecycle: an emptyDir is created empty when the Pod is assigned to a Node, lives on that Node disk, and is shared by every container in the Pod. It survives a container crash but is deleted forever when the Pod is removed from the Node. With medium Memory it is backed by tmpfs that counts against the memory limit, where a sizeLimit sizes the tmpfs itself so a write past it fails, while on the Node disk an exceeded sizeLimit gets the Pod evicted.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const nd = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });

    // shellWrap survives as a handle for code that wants the shell alone. The PULSE is not that:
    // it takes the whole Pod group, so the containers blink with the Pod they belong to (2026-07-29).
    const shell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'volumes: scratch (emptyDir)', containers: 0, role: 'storage' });
    const shellRect = shell.querySelector('.scheme-pod-rect');
    if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
    const shellWrap = g({});
    shellWrap.appendChild(shell);

    const app  = containerBlock({ x: APP_X,  y: C_Y, w: C_W, h: C_H, label: 'app',    sublabel: 'writes /cache' });
    const side = containerBlock({ x: SIDE_X, y: C_Y, w: C_W, h: C_H, label: 'Worker', sublabel: 'reads /cache' });
    const podGroup = g({});
    [shellWrap, app.wrap, side.wrap].forEach(el => podGroup.appendChild(el));

    const ed = cylinder({ x: ED_X, y: ED_Y, w: ED_W, h: ED_H, label: 'emptyDir', role: 'storage' });
    // Label re-centered on the visible front face (below the cap ellipse), the family standard
    // shared with volume-model and container-filesystem.
    const edLbl = ed.querySelector('.scheme-cylinder-label');
    if (edLbl) edLbl.setAttribute('y', 64);

    // The identity spine: the directory is owned by this Pod. Nothing travels it, so dim, no head.
    const spine = laneWire([[SPINE_X, POD_BOTTOM], [SPINE_X, ED_TOP]], { dim: true });
    // One directed lane per container, each with an arrowhead for its one direction: the app
    // writes into the cylinder side, the worker reads out of the far side.
    const wWrite = pathArrow({ points: LANE_WRITE, dashed: true, dim: true, role: 'storage' });
    const wRead  = pathArrow({ points: LANE_READ,  dashed: true, dim: true, role: 'storage' });

    const diskLbl = text({ class: 'scheme-label code dim', x: 600, y: DISK_LBL_Y, 'text-anchor': 'middle' }, ['on the node disk']);

    // The chip strip spans exactly the node width (180..1020) so the column reads as one block,
    // and all three chips share one size: 3x270 + 2x15 = 840.
    const edChip     = valChip({ x: 180, y: CHIPS_Y, w: 270, h: 34, name: 'emptyDir',  value: 'empty', role: 'storage' });
    const mediumChip = valChip({ x: 465, y: CHIPS_Y, w: 270, h: 34, name: 'medium',    value: 'node disk',   role: 'storage' });
    const limitChip  = valChip({ x: 750, y: CHIPS_Y, w: 270, h: 34, name: 'sizeLimit', value: 'none',        role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): node, then blocks, then spine and lanes and the disk label above
    // them, then the chip strip, then the packet layer so every ball rides above everything.
    root.appendChild(nd);
    [podGroup, ed].forEach(el => root.appendChild(el));
    [spine, wWrite, wRead, diskLbl].forEach(el => root.appendChild(el));
    [edChip, mediumChip, limitChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, pod: podGroup, shellWrap, appC: app.wrap, appBox: app.box, sideC: side.wrap, sideBox: side.box,
      ed, spine, wWrite, wRead, diskLbl,
      edChip, mediumChip, limitChip,
      wires: {},
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}
function setChips(s, { ed, medium, limit }) {
  setChip(s.refs.edChip, ed);
  setChip(s.refs.mediumChip, medium);
  setChip(s.refs.limitChip, limit);
}

function clearHL(s) {
  clearHighlights(s, ['appBox', 'sideBox', 'ed', 'edChip', 'mediumChip', 'limitChip'],
    [s.refs.shellWrap, s.refs.appC, s.refs.sideC]);
  s.refs.pod.style.opacity = '1';
  s.refs.appC.style.opacity = '1';
  s.refs.sideC.style.opacity = '1';
  // The dies step ghosts the spine, lanes and disk label with the Pod, so every step restores them.
  [s.refs.spine, s.refs.wWrite, s.refs.wRead, s.refs.diskLbl]
    .forEach(el => { el.style.opacity = '1'; });
  // The memory step rewrites both the cylinder label and the disk label, so restore both.
  s.refs.diskLbl.textContent = 'on the node disk';
  setCylinderLabel(s.refs.ed, 'emptyDir');
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ed: 'empty', medium: 'node disk', limit: 'none' });
    },
  },
  {
    id: 'create',
    duration: 2400,
    narration: 'The moment the Pod is placed on Node-1, an empty directory is created for it on the Node disk. There is nothing to provision and nothing to bind, the directory simply appears, owned by this one Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ed: 'created empty', medium: 'node disk', limit: 'none' });
      // The step is told by the highlight and the chips: the disk lights as the thing kubelet
      // just created, the shell pulses in the same beat. No materialize animation.
      s.refs.ed.classList.add('highlight');
      if (ctx.reduced) return;
      pulsePod(s.refs.pod, ctx, 0);
    },
  },
  {
    id: 'shared',
    duration: 3800,
    narration: 'Every container in the Pod mounts the same emptyDir, so it is a shared scratch space. The app writes a chunk under /cache and the worker reads it straight back. And because the directory is tied to the Pod rather than to a container, a container crash and restart leaves it untouched.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ed: 'shared scratch', medium: 'node disk', limit: 'none' });
      s.refs.ed.style.opacity = '1';
      // The app container is the writer and is lit at entry. The directory and the worker box are
      // both receivers, so each lights as its own ball lands, and the pulse fires on the same beat.
      s.refs.appBox.classList.add('highlight');
      if (ctx.reduced) { s.refs.ed.classList.add('highlight'); s.refs.sideBox.classList.add('highlight'); return; }
      pulsePod(s.refs.pod, ctx, 0);
      // The app writes down its lane into the cylinder side, then the worker reads the same bytes
      // out of the far side and up its own lane: two mirrored one-way hops.
      const write = routePacket(s, ctx, LANE_WRITE, { delay: BEAT.afterPulse, role: 'storage' });
      ridingLabel(s, ctx, 'write /cache', LANE_WRITE, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.ed, ctx, write.arrivalMs);
      const sideBoxPkt = routePacket(s, ctx, LANE_READ, { delay: write.arrivalMs + BEAT.afterHop, role: 'storage' });
      lightBoxAt(s.refs.sideBox, ctx, sideBoxPkt.arrivalMs);
      ridingLabel(s, ctx, 'read /cache', LANE_READ, { delay: write.arrivalMs + BEAT.afterHop });
    },
  },
  {
    id: 'dies',
    duration: 2600,
    narration: 'When the Pod is removed from the Node the emptyDir is deleted forever, and the diagram dims them out together: nothing of the Pod or its directory stays on the Node. A container crash it survives, a Pod deletion it does not. That single rule is the whole lifecycle of an emptyDir.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ed: 'deleted forever', medium: 'node disk', limit: 'none' });
      const GONE = [s.refs.pod, s.refs.ed, s.refs.spine, s.refs.wWrite, s.refs.wRead, s.refs.diskLbl];
      GONE.forEach(el => { el.style.opacity = String(OPACITY.terminated); });
      if (ctx.reduced) return;
      GONE.forEach(el => {
        ctx.register(el.animate([{ opacity: 1 }, { opacity: OPACITY.terminated }], { duration: 900, easing: 'ease-in' }));
      });
    },
  },
  {
    id: 'memory',
    duration: 3000,
    narration: 'Set medium to Memory and the same emptyDir is backed by a tmpfs instead of the Node disk. Reads and writes are fast, but every byte counts against the Pod memory limit, and filling it can get the Pod OOM-killed the way a heap leak would.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // No sizeLimit is set in this scenario, so that chip stays none: chips report state, not
      // trivia. The 512Mi cap belongs to the next step only.
      setChips(s, { ed: 'backed by RAM', medium: 'Memory (tmpfs)', limit: 'none' });
      s.refs.ed.style.opacity = '1';
      setCylinderLabel(s.refs.ed, 'emptyDir tmpfs');
      // With medium Memory the directory is NOT on the node disk, the shelf label must not lie.
      s.refs.diskLbl.textContent = 'tmpfs in RAM';
      // The app writes and the tmpfs receives: both light at entry, the shell pulses same beat.
      s.refs.appBox.classList.add('highlight');
      if (ctx.reduced) { s.refs.ed.classList.add('highlight'); return; }
      pulsePod(s.refs.pod, ctx, 0);
      const edPkt = routePacket(s, ctx, LANE_WRITE, { delay: BEAT.afterPulse, role: 'storage' });
      lightBoxAt(s.refs.ed, ctx, edPkt.arrivalMs);
      ridingLabel(s, ctx, 'held in RAM', LANE_WRITE, { delay: BEAT.afterPulse });
    },
  },
  {
    id: 'sizelimit',
    duration: 3600,
    narration: 'A sizeLimit caps how large the emptyDir may grow. On the Node disk, writing past the limit gets the Pod evicted rather than left to fill the disk, while on tmpfs the limit sizes the filesystem itself and the write fails instead. Either way an unbounded emptyDir is a way to lose the Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ed: 'over limit', medium: 'node disk', limit: '512Mi, evicted' });
      s.refs.ed.style.opacity = '1';
      // The app writes past the cap into the disk: both light at entry, the shell pulses same
      // beat. The eviction itself is told by the chips (512Mi, evicted), no fade on this step.
      s.refs.appBox.classList.add('highlight');
      if (ctx.reduced) { s.refs.ed.classList.add('highlight'); return; }
      pulsePod(s.refs.pod, ctx, 0);
      const pkt = routePacket(s, ctx, LANE_WRITE, { delay: BEAT.afterPulse, role: 'storage' });
      lightBoxAt(s.refs.ed, ctx, pkt.arrivalMs);
      ridingLabel(s, ctx, 'over 512Mi', LANE_WRITE, { delay: BEAT.afterPulse });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
