import { svg, g, text, path } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, BEAT, FADE,
} from '../lib/storage-kit.js';

// THE ANCHOR CARD of the storage category. Storage grammar is a VERTICAL STACK centered on the
// canvas: the consumer (a Pod holding two containers) on top, the backing volume as a disk on the
// shelf below, and the recurring gesture is a MOUNT travelling the lane between a container and the
// disk. The whole stack is centered on SPINE_X so the diagram sits in the middle of the player.
//
// GEOMETRY. The Pod sits BELOW the narration overlay (measured at (335, 143) for this card, pod top
// at 150 clears it), which frees the full canvas width: the Pod is stretched to 600 and the two
// containers are pushed toward its edges, so each container center lands OUTSIDE the cylinder span.
// That is deliberate: the mount lanes are L-shaped, dropping straight from a container and entering
// the cylinder through its SIDE, symmetric left and right about the ownership spine.
//
// The point of the card is OWNERSHIP. A volume is declared ONCE at spec.volumes (Pod level) and each
// container mounts it at volumeMounts, possibly at a different path. The volume belongs to the POD,
// not to any container, so it survives a container crash and is shared between containers, and it
// dies only when the Pod dies.
//
// PULSE MODEL: the Pod is one unit. The Pod SHELL pulses as a whole (shellWrap holds only the shell,
// so the pulse never reaches the inner containers). The two containers are internal parts, so they
// only take a static .highlight, never a pulse. HIGHLIGHTS ARE STEP-STATIC: every block a step uses
// lights at step entry (above the reduced guard) and stays lit for the whole step, and the Pod pulse
// fires at the same instant, so pulse and highlights land in one beat. The balls only illustrate the
// traffic, they no longer drive highlight timing. The volume is infrastructure: it lights, never
// pulses. Step 1 (declare) is the exception: the Pod is not acting, so only the volume lights.
//
// WIRES: the center OWNERSHIP SPINE (x=SPINE_X, dim, no arrowhead) links the Pod to its volume,
// because ownership is a relationship, not traffic. The two L-shaped MOUNT LANES are brighter bare
// channels that carry a ball in whichever direction the step needs (mount out, write in, read out),
// so the ball shows direction. Balls ride routePacket (eased, routeDur speed) and every riding
// label shares the same points, duration and easing so it stays glued to its ball.
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

// Balls travel BOTH directions, so each side carries a PAIR of one-way L-shaped lanes, offset
// LANE_DX around the container center (the pair is centered on its block) and LANE_DY around the
// cylinder midline so the horizontal runs do not overlap. Each lane has its own arrowhead showing
// its one direction: the UP lane points into the container (mount, read), the DOWN lane points
// into the cylinder side (write). Every array is shared by the static pathArrow and its ball.
const LANE_DX = 10, LANE_DY = 10;
const LANE_APP_UP    = [[VOL_X, VOL_MY - LANE_DY], [APP_CX + LANE_DX, VOL_MY - LANE_DY], [APP_CX + LANE_DX, C_BOTTOM]];
const LANE_APP_DOWN  = [[APP_CX - LANE_DX, C_BOTTOM], [APP_CX - LANE_DX, VOL_MY + LANE_DY], [VOL_X, VOL_MY + LANE_DY]];
const LANE_SIDE_UP   = [[VOL_X + VOL_W, VOL_MY - LANE_DY], [SIDE_CX - LANE_DX, VOL_MY - LANE_DY], [SIDE_CX - LANE_DX, C_BOTTOM]];
const LANE_SIDE_DOWN = [[SIDE_CX + LANE_DX, C_BOTTOM], [SIDE_CX + LANE_DX, VOL_MY + LANE_DY], [VOL_X + VOL_W, VOL_MY + LANE_DY]];

// A tag that rides ALONG with the ball on the same path, timing and easing, so the packet visibly
// carries what the step narrates. Balls are routePacket (eased), so the label defaults to the same
// ease-in-out and the same routeDur, or it would drift off the ball mid-flight.
function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'ease-in-out' } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: -14, 'text-anchor': 'middle', 'data-cat': 'storage' }, [txt]);
  lbl.style.opacity = '0';
  lbl.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px)`;
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 160, fill: 'forwards', easing: 'ease-in' }));
}

// A container is a box wrapped in a bare g so it can be highlighted and faded independently. It is
// NEVER pulsed: the pod shell carries the pulse, the container only takes .highlight.
function containerBlock({ x, y, w, h, label, sublabel }) {
  const b = box({ x, y, w, h, label, sublabel, cat: 'storage' });
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

    // The pod shell lives alone in shellWrap so the pod pulse (which queries .scheme-pod descendants)
    // reaches ONLY the shell, never the inner container boxes.
    const shell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'spec.volumes: cache', containers: 0, cat: 'storage' });
    const shellRect = shell.querySelector('.scheme-pod-rect');
    if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
    const shellWrap = g({});
    shellWrap.appendChild(shell);

    const app  = containerBlock({ x: APP_X,  y: C_Y, w: C_W, h: C_H, label: 'App',         sublabel: 'mounts cache at /data' });
    const side = containerBlock({ x: SIDE_X, y: C_Y, w: C_W, h: C_H, label: 'Log-Shipper', sublabel: 'mounts cache at /backup' });
    const podGroup = g({});
    [shellWrap, app.wrap, side.wrap].forEach(el => podGroup.appendChild(el));

    const volume = cylinder({ x: VOL_X, y: VOL_Y, w: VOL_W, h: VOL_H, label: 'Volume Cache', cat: 'storage' });
    // The primitive centers the label on the raw bbox, which reads high because the top cap
    // ellipse is not part of the visible front face. Re-center on the face (below the cap).
    const volLbl = volume.querySelector('.scheme-cylinder-label');
    if (volLbl) volLbl.setAttribute('y', 64);

    // The identity column: the Pod owns the volume. Nothing travels it, so no arrowhead, and dim.
    const spine = laneWire([[SPINE_X, POD_BOTTOM], [SPINE_X, VOL_TOP]], { dim: true });
    // Two one-way lanes per side, each with an arrowhead for its direction, the pair centered on
    // its container and entering / leaving the cylinder through its sides.
    const wAppUp    = pathArrow({ points: LANE_APP_UP,    dashed: true, dim: true, color: 'storage' });
    const wAppDown  = pathArrow({ points: LANE_APP_DOWN,  dashed: true, dim: true, color: 'storage' });
    const wSideUp   = pathArrow({ points: LANE_SIDE_UP,   dashed: true, dim: true, color: 'storage' });
    const wSideDown = pathArrow({ points: LANE_SIDE_DOWN, dashed: true, dim: true, color: 'storage' });

    // The ownership label is permanent chrome: the volume belongs to the Pod on every step, so it is
    // filled once here and kept out of the per-step wire sweep (clearWires never blanks it).
    const ownLbl = text({ class: 'scheme-label code dim', x: SPINE_X + 16, y: 374, 'text-anchor': 'start' }, ['belongs to Pod']);

    const volChip   = valChip({ x: 110, y: CHIPS_Y, w: 250, h: 34, name: 'volume', value: 'declared',            cat: 'storage' });
    const mountChip = valChip({ x: 380, y: CHIPS_Y, w: 430, h: 34, name: 'mounts', value: 'App /data  Log /backup', cat: 'storage' });
    const dataChip  = valChip({ x: 830, y: CHIPS_Y, w: 260, h: 34, name: 'data',   value: 'empty',               cat: 'storage' });

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

// Sets each chip and statically highlights the ones whose value CHANGES on this step: a status chip
// that changes is lit for the step, a chip that stays the same is not. The chip still holds the
// previous step's text at call time (clearHL clears the highlight class, not the text), and steps are
// always entered in order (gotoStep rebuilds then replays 0..target), so this diff is deterministic.
// Highlight, never flash: chips glow within the steps that touch them.
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

const MOUNTS = 'App /data  Log /backup';

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A volume is declared once on the Pod at spec.volumes, and each container mounts it under volumeMounts. The volume belongs to the Pod, not to any single container. This Pod runs two containers that will share one volume named cache.',
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
    narration: 'The declaration lives at Pod level. spec.volumes names the volume once, cache, and that one declaration is what every container in the Pod is allowed to reach. Nothing is mounted yet, the volume simply exists as part of the Pod.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vol: 'declared', mounts: MOUNTS, data: 'empty' });
      // Nothing is mounted yet and the Pod is not acting, so it does not pulse. Only the volume lights.
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
      s.refs.appBox.classList.add('highlight');
      s.refs.sideBox.classList.add('highlight');
      if (ctx.reduced) return;
      pulsePod(s.refs.shellWrap, ctx, 0);
      // The two mounts leave the volume sides and rise into the containers in lockstep (the lanes
      // are mirror images, so routeDur gives them the same duration). Mounts ride the UP lanes.
      routePacket(s, ctx, LANE_APP_UP, { cat: 'storage' });
      ridingLabel(s, ctx, 'mount at /data', LANE_APP_UP);
      routePacket(s, ctx, LANE_SIDE_UP, { cat: 'storage' });
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
      // Both containers share the volume this whole step (app writes, log shipper reads), so both
      // stay lit for the entire step. The Pod pulses at the same instant.
      s.refs.volume.classList.add('highlight');
      s.refs.appBox.classList.add('highlight');
      s.refs.sideBox.classList.add('highlight');
      if (ctx.reduced) return;
      pulsePod(s.refs.shellWrap, ctx, 0);
      // The app write descends its DOWN lane into the volume side, then the log shipper reads the
      // same bytes back out of the far side and up its own UP lane.
      const write = routePacket(s, ctx, LANE_APP_DOWN, { delay: BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'write foo', LANE_APP_DOWN, { delay: BEAT.afterPulse });
      routePacket(s, ctx, LANE_SIDE_UP, { delay: write.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'read foo', LANE_SIDE_UP, { delay: write.arrivalMs + BEAT.afterHop });
    },
  },
  {
    id: 'restart',
    duration: 2800,
    narration: 'The volume outlives a container. When the app container crashes and kubelet restarts it, the fresh container remounts the same volume and foo is still there. A container is disposable, the Pod volume is not.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vol: 'survives restart', mounts: MOUNTS, data: 'foo intact' });
      // Only the app and the volume are involved (the log shipper is untouched), so those two light
      // for the whole step (static highlight only, no crash flicker: rejected as too blinky) and
      // the Pod pulses with them, one beat.
      s.refs.volume.classList.add('highlight');
      s.refs.appBox.classList.add('highlight');
      if (ctx.reduced) return;
      pulsePod(s.refs.shellWrap, ctx, 0);
      // The fresh container re-reads foo from the untouched volume, up the app UP lane.
      routePacket(s, ctx, LANE_APP_UP, { delay: BEAT.afterPulse, cat: 'storage' });
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
      // The Pod and its volume are gone. The chips flip to gone / unmounted / lost and the whole
      // stack (Pod, volume, lanes, spine, ownership label) settles to a ghost so the picture
      // matches the words. Ghost opacities are pinned statically so reduced motion and a mid-step
      // cancel land on the dimmed state, the fade below only eases into it.
      setChips(s, { vol: 'gone with Pod', mounts: 'unmounted', data: 'lost' });
      const GONE = [s.refs.pod, s.refs.volume, s.refs.spine, s.refs.wAppUp, s.refs.wAppDown, s.refs.wSideUp, s.refs.wSideDown, s.refs.ownLbl];
      GONE.forEach(el => { el.style.opacity = '0.25'; });
      if (ctx.reduced) return;
      GONE.forEach(el => {
        ctx.register(el.animate([{ opacity: 1 }, { opacity: 0.25 }], { duration: FADE.out, easing: 'ease-in' }));
      });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
