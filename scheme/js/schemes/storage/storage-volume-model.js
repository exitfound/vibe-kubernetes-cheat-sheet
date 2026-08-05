import { svg, g, text, path } from '../../lib/svg.js';
import { arrowDefs, box, cylinder, pathArrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, relationPath, makeInit, clearHighlights, clearWires, BEAT, FADE, makeRidingLabel, lightBoxAt, OPACITY } from './storage-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#storage-volume-model


const SPINE_X = 600;

const POD_X = 300, POD_Y = 150, POD_W = 600, POD_H = 170;  // 300..900, center 600
const POD_BOTTOM = POD_Y + POD_H;                          // 320

const C_Y = 196, C_W = 190, C_H = 84;                      // container row
const C_BOTTOM = C_Y + C_H;                                // 280
const APP_X = 330,  APP_CX = APP_X + C_W / 2;              // 330..520, center 425
const SIDE_X = 680, SIDE_CX = SIDE_X + C_W / 2;            // 680..870, center 775

const VOL_X = 470, VOL_Y = 452, VOL_W = 260, VOL_H = 104;  // 470..730, center 600
const VOL_TOP = VOL_Y;                                     // 452
const VOL_MY = VOL_Y + VOL_H / 2;                          // 504, where the lanes enter the sides
const CHIPS_Y = 596;

const LANE_DX = 10, LANE_DY = 10;
const LANE_APP_UP    = [[VOL_X, VOL_MY - LANE_DY], [APP_CX + LANE_DX, VOL_MY - LANE_DY], [APP_CX + LANE_DX, C_BOTTOM]];
const LANE_APP_DOWN  = [[APP_CX - LANE_DX, C_BOTTOM], [APP_CX - LANE_DX, VOL_MY + LANE_DY], [VOL_X, VOL_MY + LANE_DY]];
const LANE_SIDE_UP   = [[VOL_X + VOL_W, VOL_MY - LANE_DY], [SIDE_CX - LANE_DX, VOL_MY - LANE_DY], [SIDE_CX - LANE_DX, C_BOTTOM]];
const LANE_SIDE_DOWN = [[SIDE_CX + LANE_DX, C_BOTTOM], [SIDE_CX + LANE_DX, VOL_MY + LANE_DY], [VOL_X + VOL_W, VOL_MY + LANE_DY]];

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

// A container is a box wrapped in a bare g so it can be highlighted and faded independently. It is
// NEVER pulsed: the pod shell carries the pulse, the container only takes .highlight.
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
      'aria-label': 'Pod volume model: a volume is declared once at Pod level under spec.volumes and each container mounts it at volumeMounts, possibly at a different path. The volume belongs to the Pod, so a write by one container is seen by the other, it survives a container crash and restart, and an ephemeral volume like this one is deleted only when the Pod itself is deleted.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // shellWrap survives as a handle for code that wants the shell alone. The PULSE is not that:
    // it takes the whole Pod group, so the containers blink with the Pod they belong to (2026-07-29).
    const shell = podShell({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'spec.volumes: cache', containers: 0, role: 'storage' });
    const shellWrap = g({});
    shellWrap.appendChild(shell);

    const app  = containerBlock({ x: APP_X,  y: C_Y, w: C_W, h: C_H, label: 'app',         sublabel: 'mounts cache at /data' });
    const side = containerBlock({ x: SIDE_X, y: C_Y, w: C_W, h: C_H, label: 'Log-shipper', sublabel: 'mounts cache at /backup' });
    const podGroup = g({});
    [shellWrap, app.wrap, side.wrap].forEach(el => podGroup.appendChild(el));

    const volume = cylinder({ x: VOL_X, y: VOL_Y, w: VOL_W, h: VOL_H, label: 'Volume cache', role: 'storage' });
    // The primitive centers the label on the raw bbox, which reads high because the top cap
    // ellipse is not part of the visible front face. Re-center on the face (below the cap).
    const volLbl = volume.querySelector('.scheme-cylinder-label');
    if (volLbl) volLbl.setAttribute('y', 64);

    // The identity column: the Pod owns the volume. Nothing travels it, so no arrowhead, and dim.
    const spine = laneWire([[SPINE_X, POD_BOTTOM], [SPINE_X, VOL_TOP]], { dim: true });
    // Two one-way lanes per side, each with an arrowhead for its direction, the pair centered on
    // its container and entering / leaving the cylinder through its sides.
    const wAppUp    = pathArrow({ points: LANE_APP_UP,    dashed: true, dim: true, role: 'storage' });
    const wAppDown  = pathArrow({ points: LANE_APP_DOWN,  dashed: true, dim: true, role: 'storage' });
    const wSideUp   = pathArrow({ points: LANE_SIDE_UP,   dashed: true, dim: true, role: 'storage' });
    // The sidecar READS: the shared step has the app write foo and the log shipper read it back, so
    // the write half of the sidecar's pair never carries anything. It is the mount drawn as a
    // relationship, and the app's write lane keeps its arrowhead because a ball does ride that one.
    const wSideDown = relationPath({ points: LANE_SIDE_DOWN, role: 'storage' });

    // The ownership label is permanent chrome: the volume belongs to the Pod on every step, so it is
    // filled once here and kept out of the per-step wire sweep (clearWires never blanks it).
    const ownLbl = text({ class: 'scheme-label code dim', x: SPINE_X + 16, y: 374, 'text-anchor': 'start' }, ['belongs to Pod']);

    const volChip   = valChip({ x: 110, y: CHIPS_Y, w: 250, h: 34, name: 'volume', value: 'declared',            role: 'storage' });
    const mountChip = valChip({ x: 380, y: CHIPS_Y, w: 430, h: 34, name: 'mounts', value: 'app /data  log /backup', role: 'storage' });
    const dataChip  = valChip({ x: 830, y: CHIPS_Y, w: 260, h: 34, name: 'data',   value: 'empty',               role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): blocks, then the spine and mount lanes and their label above them,
    // then the chip strip, then the packet layer so every ball rides above everything.
    [podGroup, volume].forEach(el => root.appendChild(el));
    [spine, wAppUp, wAppDown, wSideUp, wSideDown, ownLbl].forEach(el => root.appendChild(el));
    [volChip, mountChip, dataChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, pod: podGroup, shellWrap, appC: app.wrap, appBox: app.box, sideC: side.wrap, sideBox: side.box,
      volume, spine, wAppUp, wAppDown, wSideUp, wSideDown, ownLbl,
      volChip, mountChip, dataChip,
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
function setChips(s, { vol, mounts, data }) {
  setChip(s.refs.volChip, vol);
  setChip(s.refs.mountChip, mounts);
  setChip(s.refs.dataChip, data);
}

function clearHL(s) {
  clearHighlights(s, ['appBox', 'sideBox', 'volume', 'volChip', 'mountChip', 'dataChip'],
    [s.refs.shellWrap, s.refs.appC, s.refs.sideC]);
  s.refs.pod.style.opacity = '1';
  s.refs.appC.style.opacity = '1';
  s.refs.sideC.style.opacity = '1';
  s.refs.volume.style.opacity = '1';
  // The delete step ghosts the whole stack (wires and the ownership label included), so every
  // other step starts by restoring them.
  [s.refs.spine, s.refs.wAppUp, s.refs.wAppDown, s.refs.wSideUp, s.refs.wSideDown, s.refs.ownLbl]
    .forEach(el => { el.style.opacity = '1'; });
}

const MOUNTS = 'app /data  log /backup';

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vol: 'declared', mounts: MOUNTS, data: 'empty' });
    },
  },
  {
    id: 'declare',
    duration: 2200,
    narration: 'The declaration lives at Pod level. The spec.volumes list names the volume once, cache, and that one declaration is what every container in the Pod is allowed to reach. Where each container puts it is a separate decision, taken next, and the volume exists as part of the Pod either way.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vol: 'declared', mounts: MOUNTS, data: 'empty' });
      // The Pod is not acting on this step, so it does not pulse. Only the volume lights.
      s.refs.volume.classList.add('highlight');
    },
  },
  {
    id: 'mount',
    duration: 2600,
    narration: 'Each container opts in with its own volumeMounts entry and may choose its own path. The app sees the volume at /data and the log shipper sees the very same bytes at /backup. Two mounts, two paths, one underlying volume.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vol: 'mounted x2', mounts: MOUNTS, data: 'empty' });
      // Both containers mount the volume, so all three light for the whole step (static, so it also
      // holds under reduced motion). The Pod pulse fires at the same instant, one beat.
      s.refs.volume.classList.add('highlight');
      if (ctx.reduced) { s.refs.appBox.classList.add('highlight'); s.refs.sideBox.classList.add('highlight'); return; }
      pulsePod(s.refs.pod, ctx, 0);
      // The two mounts leave the volume sides and rise into the containers in lockstep (the lanes
      // are mirror images, so routeDur gives them the same duration). Mounts ride the UP lanes.
      const appBoxPkt = routePacket(s, ctx, LANE_APP_UP, { role: 'storage' });
      lightBoxAt(s.refs.appBox, ctx, appBoxPkt.arrivalMs);
      ridingLabel(s, ctx, 'mount at /data', LANE_APP_UP);
      const sideBoxPkt = routePacket(s, ctx, LANE_SIDE_UP, { role: 'storage' });
      lightBoxAt(s.refs.sideBox, ctx, sideBoxPkt.arrivalMs);
      ridingLabel(s, ctx, 'mount at /backup', LANE_SIDE_UP);
    },
  },
  {
    id: 'shared',
    duration: 3400,
    narration: 'Because both containers mount one volume, a write by one is immediately visible to the other. The app writes foo under /data and the log shipper reads it back under /backup. This is how a sidecar shares files with the main container.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vol: 'mounted x2', mounts: MOUNTS, data: 'foo written' });
      // The app container is the writer, so it is lit from entry. The volume takes the write before
      // it can serve the read, so it lights when the ball lands on it, like the sidecar box below.
      s.refs.appBox.classList.add('highlight');
      if (ctx.reduced) { s.refs.volume.classList.add('highlight'); s.refs.sideBox.classList.add('highlight'); return; }
      pulsePod(s.refs.pod, ctx, 0);
      // The app write descends its DOWN lane into the volume side, then the log shipper reads the
      // same bytes back out of the far side and up its own UP lane.
      const write = routePacket(s, ctx, LANE_APP_DOWN, { delay: BEAT.afterPulse, role: 'storage' });
      ridingLabel(s, ctx, 'write foo', LANE_APP_DOWN, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.volume, ctx, write.arrivalMs);
      const sideBoxPkt = routePacket(s, ctx, LANE_SIDE_UP, { delay: write.arrivalMs + BEAT.afterHop, role: 'storage' });
      lightBoxAt(s.refs.sideBox, ctx, sideBoxPkt.arrivalMs);
      ridingLabel(s, ctx, 'read foo', LANE_SIDE_UP, { delay: write.arrivalMs + BEAT.afterHop });
    },
  },
  {
    id: 'restart',
    duration: 2800,
    narration: 'The volume outlives a container. When the app container crashes and Kubelet restarts it, the fresh container remounts the same volume and foo is still there. A container is disposable, the Pod volume is not.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vol: 'survives restart', mounts: MOUNTS, data: 'foo intact' });
      s.refs.volume.classList.add('highlight');
      if (ctx.reduced) { s.refs.appBox.classList.add('highlight'); return; }
      pulsePod(s.refs.pod, ctx, 0);
      // The fresh container re-reads foo from the untouched volume, up the app UP lane.
      const appBoxPkt = routePacket(s, ctx, LANE_APP_UP, { delay: BEAT.afterPulse, role: 'storage' });
      lightBoxAt(s.refs.appBox, ctx, appBoxPkt.arrivalMs);
      ridingLabel(s, ctx, 'foo still here', LANE_APP_UP, { delay: BEAT.afterPulse });
    },
  },
  {
    id: 'delete',
    duration: 2200,
    narration: 'An ephemeral volume like cache is scoped to the Pod, so it dies with the Pod. Delete the Pod and the volume is gone for good along with everything written to it. To outlive a Pod you need persistent storage, which the rest of this category covers.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vol: 'gone with Pod', mounts: 'unmounted', data: 'lost' });
      const GONE = [s.refs.pod, s.refs.volume, s.refs.spine, s.refs.wAppUp, s.refs.wAppDown, s.refs.wSideUp, s.refs.wSideDown, s.refs.ownLbl];
      GONE.forEach(el => { el.style.opacity = String(OPACITY.terminated); });
      if (ctx.reduced) return;
      GONE.forEach(el => {
        ctx.register(el.animate([{ opacity: 1 }, { opacity: OPACITY.terminated }], { duration: FADE.out, easing: 'ease-in' }));
      });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
