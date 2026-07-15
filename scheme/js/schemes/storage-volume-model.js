import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// THE ANCHOR CARD of the storage category. Storage grammar is a VERTICAL STACK: the consumer (a
// Pod holding two containers) on top, the backing volume as a disk on the shelf at the bottom, and
// the recurring gesture is a MOUNT rising from the disk into a container.
//
// The point of the card is ownership. A volume is declared ONCE at spec.volumes (Pod level) and
// each container mounts it at volumeMounts (container level), possibly at a different path. The
// volume belongs to the POD, not to any container, so it survives a container crash and is shared
// between containers, and it dies only when the Pod dies.
//
// The IDENTITY COLUMN is the vertical spine at x=780 linking the Pod to its volume: a bare dashed
// line with NO arrowhead, because ownership is a relationship, not traffic. The MOUNT LANES on
// either side (x=720 into app, x=840 into the log shipper) are the only routes that carry a ball,
// so they alone get arrowheads. A separate WRITE lane at x=690 descends from the app to the volume.
// Only the two containers (Pods) pulse. The volume is infrastructure: it lights, it never pulses.
// The narration overlay owns x<=380 & y<=300, so every block starts well to the right of it.
const POD_X = 440, POD_Y = 60, POD_W = 680, POD_H = 210;
const POD_BOTTOM = POD_Y + POD_H;                    // 270

const APP_X = 490, APP_Y = 115, APP_W = 270, APP_H = 105;
const APP_CX = APP_X + APP_W / 2, APP_BOTTOM = APP_Y + APP_H;   // 625 / 220

const SIDE_X = 800, SIDE_Y = 115, SIDE_W = 270, SIDE_H = 105;
const SIDE_CX = SIDE_X + SIDE_W / 2, SIDE_BOTTOM = SIDE_Y + SIDE_H; // 935 / 220

const VOL_X = 670, VOL_Y = 440, VOL_W = 220, VOL_H = 110;
const VOL_TOP = VOL_Y, VOL_CX = VOL_X + VOL_W / 2;   // 440 / 780

const SPINE_X = 780;   // the identity column: the Pod owns the volume
const CHIPS_Y = 588;

// Each static wire and its ball share one array, so they cannot drift. Every endpoint is a block edge.
const W_MOUNT_APP  = [[720, VOL_TOP], [720, 330], [APP_CX, 330], [APP_CX, APP_BOTTOM]];   // vol -> app, up
const W_MOUNT_SIDE = [[840, VOL_TOP], [840, 330], [SIDE_CX, 330], [SIDE_CX, SIDE_BOTTOM]]; // vol -> log, up
const W_WRITE      = [[APP_CX, APP_BOTTOM], [APP_CX, 300], [690, 300], [690, VOL_TOP]];    // app -> vol, down

// Lights an infrastructure block ON PACKET ARRIVAL via a zero-effect animation whose onfinish sets
// the class. Under reduced motion it applies immediately so the static end-state stays correct.
function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// A tag that rides ALONG with the ball on the same path, timing and easing, so the packet visibly
// carries what the step narrates. It lives in the packet layer but is not a .scheme-packet.
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

// A container is a box wrapped in a bare g so pulsePod reaches BOTH the box and its rect
// (querySelectorAll matches descendants only). Its box is the .highlight target, the wrapper the pulse target.
function containerBlock({ x, y, w, h, label, sublabel }) {
  const b = box({ x, y, w, h, label, sublabel, cat: 'storage' });
  const wrap = g({});
  wrap.appendChild(b);
  return { wrap, box: b };
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
      'aria-label': 'Pod volume model: a volume is declared once at Pod level under spec.volumes and each container mounts it at volumeMounts, possibly at a different path. The volume belongs to the Pod, so a write by one container is seen by the other, it survives a container crash and restart, and it is deleted only when the Pod itself is deleted.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const shell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'spec.volumes: cache', containers: 0, cat: 'storage' });
    const shellRect = shell.querySelector('.scheme-pod-rect');
    if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
    const app  = containerBlock({ x: APP_X, y: APP_Y, w: APP_W, h: APP_H, label: 'app', sublabel: 'mounts cache at /data' });
    const side = containerBlock({ x: SIDE_X, y: SIDE_Y, w: SIDE_W, h: SIDE_H, label: 'log-shipper', sublabel: 'mounts cache at /backup' });
    const podGroup = g({});
    [shell, app.wrap, side.wrap].forEach(el => podGroup.appendChild(el));

    const volume = cylinder({ x: VOL_X, y: VOL_Y, w: VOL_W, h: VOL_H, label: 'volume cache', cat: 'storage' });

    // The identity column: the Pod owns the volume. Nothing travels it, so no arrowhead.
    const spine = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: SPINE_X, y1: POD_BOTTOM, x2: SPINE_X, y2: VOL_TOP, 'stroke-dasharray': '5 5', fill: 'none' });

    const wMountApp  = pathArrow({ points: W_MOUNT_APP,  dashed: true, dim: true, color: 'storage' });
    const wMountSide = pathArrow({ points: W_MOUNT_SIDE, dashed: true, dim: true, color: 'storage' });
    const wWrite     = pathArrow({ points: W_WRITE,      dashed: true, dim: true, color: 'storage' });

    const ownLbl = text({ class: 'scheme-label code dim', x: SPINE_X + 14, y: 360, 'text-anchor': 'start' }, [' ']);

    const volChip   = valChip({ x: 110, y: CHIPS_Y, w: 250, h: 34, name: 'volume', value: 'declared',            cat: 'storage' });
    const mountChip = valChip({ x: 380, y: CHIPS_Y, w: 430, h: 34, name: 'mounts', value: 'app /data  log /backup', cat: 'storage' });
    const dataChip  = valChip({ x: 830, y: CHIPS_Y, w: 260, h: 34, name: 'data',   value: 'empty',               cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): blocks, then the spine and mount wires and their label above them,
    // then the chip strip, then the packet layer so every ball rides above everything.
    [podGroup, volume].forEach(el => root.appendChild(el));
    [spine, wMountApp, wMountSide, wWrite, ownLbl].forEach(el => root.appendChild(el));
    [volChip, mountChip, dataChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, pod: podGroup, appC: app.wrap, appBox: app.box, sideC: side.wrap, sideBox: side.box,
      volume, spine,
      volChip, mountChip, dataChip,
      wires: { own: ownLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { vol, mounts, data }) {
  setVal(s.refs.volChip, vol);
  setVal(s.refs.mountChip, mounts);
  setVal(s.refs.dataChip, data);
}

function clearHL(s) {
  clearHighlights(s, ['appBox', 'sideBox', 'volume', 'volChip', 'mountChip', 'dataChip'],
    [s.refs.pod, s.refs.appC, s.refs.sideC]);
  s.refs.pod.style.opacity = '1';
  s.refs.appC.style.opacity = '1';
  s.refs.sideC.style.opacity = '1';
  s.refs.volume.style.opacity = '1';
}

const MOUNTS = 'app /data  log /backup';

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
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vol: 'declared', mounts: MOUNTS, data: 'empty' });
      s.refs.volume.classList.add('highlight');
      setWire(s, 'own', 'belongs to Pod');
      if (ctx.reduced) return;
      // The Pod is the actor here (it owns the volume), so the Pod pulses. No packet, no block flash.
      pulsePod(s.refs.pod, ctx, 0);
    },
  },
  {
    id: 'mount',
    duration: 3200,
    narration: 'Each container opts in with its own volumeMounts entry and may choose its own path. The app sees the volume at /data and the log shipper sees the very same bytes at /backup. Two mounts, two paths, one underlying volume.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vol: 'mounted x2', mounts: MOUNTS, data: 'empty' });
      s.refs.volume.classList.add('highlight');
      setWire(s, 'own', 'belongs to Pod');
      if (ctx.reduced) return;
      // Volume (infra) to containers (Pods): down-arrow, so the packet leaves first and the
      // container pulses on arrival. Two mounts rise on their own lanes.
      const toApp = routePacket(s, ctx, W_MOUNT_APP, { cat: 'storage' });
      ridingLabel(s, ctx, 'mount at /data', W_MOUNT_APP);
      pulsePod(s.refs.appC, ctx, toApp.arrivalMs);
      const toSide = routePacket(s, ctx, W_MOUNT_SIDE, { cat: 'storage' });
      ridingLabel(s, ctx, 'mount at /backup', W_MOUNT_SIDE);
      pulsePod(s.refs.sideC, ctx, toSide.arrivalMs);
    },
  },
  {
    id: 'shared',
    duration: 3800,
    narration: 'Because both containers mount one volume, a write by one is immediately visible to the other. The app writes foo under /data and the log shipper reads it back under /backup. This is how a sidecar shares files with the main container.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vol: 'mounted x2', mounts: MOUNTS, data: 'foo written' });
      s.refs.volume.classList.add('highlight');
      if (ctx.reduced) return;
      // Write: app (Pod) to volume (infra) is an up-arrow, so the app pulses first and the write
      // descends at BEAT.afterPulse. Read: volume to log shipper is a down-arrow chained after.
      pulsePod(s.refs.appC, ctx, 0);
      const write = routePacket(s, ctx, W_WRITE, { delay: BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'write foo', W_WRITE, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.volume, ctx, write.arrivalMs);
      const read = routePacket(s, ctx, W_MOUNT_SIDE, { delay: write.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'read foo', W_MOUNT_SIDE, { delay: write.arrivalMs + BEAT.afterHop });
      pulsePod(s.refs.sideC, ctx, read.arrivalMs);
    },
  },
  {
    id: 'restart',
    duration: 3400,
    narration: 'The volume outlives a container. When the app container crashes and kubelet restarts it, the fresh container remounts the same volume and foo is still there. A container is disposable, the Pod volume is not.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vol: 'survives restart', mounts: MOUNTS, data: 'foo intact' });
      s.refs.volume.classList.add('highlight');
      if (ctx.reduced) return;
      // The app container crashes (opacity to terminal) and is restarted (fade back plus a pulse),
      // then remounts and re-reads foo from the untouched volume. End-state opacity is 1, pinned
      // by clearHL, so the fade-out then fade-in lands back there without a snap.
      ctx.register(s.refs.appC.animate([{ opacity: 1 }, { opacity: 0.3 }], { duration: 500, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(s.refs.appC.animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 400, delay: 700, fill: 'forwards', easing: 'ease-out' }));
      const reread = routePacket(s, ctx, W_MOUNT_APP, { delay: 1200, cat: 'storage' });
      ridingLabel(s, ctx, 'foo still here', W_MOUNT_APP, { delay: 1200 });
      pulsePod(s.refs.appC, ctx, reread.arrivalMs);
    },
  },
  {
    id: 'delete',
    duration: 2600,
    narration: 'The volume is scoped to the Pod, so it dies with the Pod. Delete the Pod and the volume named cache is gone for good along with everything written to it. To outlive a Pod you need persistent storage, which the rest of this category covers.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { vol: 'gone with Pod', mounts: 'unmounted', data: 'lost' });
      // The Pod and its volume are gone by the end of the step, so terminal opacity is the static
      // end-state, pinned here above the guard.
      s.refs.pod.style.opacity = '0.25';
      s.refs.volume.style.opacity = '0.25';
      if (ctx.reduced) return;
      // Re-set the start values below the guard, then fade: the Pod first, then the volume follows it.
      s.refs.pod.style.opacity = '1';
      s.refs.volume.style.opacity = '1';
      ctx.register(s.refs.pod.animate([{ opacity: 1 }, { opacity: 0.25 }], { duration: 700, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(s.refs.volume.animate([{ opacity: 1 }, { opacity: 0.25 }], { duration: 700, delay: 450, fill: 'forwards', easing: 'ease-in' }));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
