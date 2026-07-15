import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, cylinder, pathArrow, animateAlong, stateNode, setActiveState } from '../lib/primitives.js';
import {
  valChip, setVal, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// Layout (viewBox 1200x640). Unlike the other storage cards this one is a genuine state machine, so
// the middle band is a ROW of four phase boxes drawn with stateNode, exactly one lit at a time by
// setActiveState. The vertical storage grammar is still here: the objects that DRIVE the transitions
// sit above and below the row. The claim (the thing that binds and unbinds) is on top, and the one
// PV whose phase we are tracking is the disk on the bottom shelf, tied to the active phase by a bare
// arrowhead-free spine. Each transition is a real event, so it is drawn as an arrow that CARRIES a
// ball when it fires: the ball is the event propagating, and that is the only thing with an arrowhead.
// There is no Pod, so nothing pulses. The narration overlay owns x<=380 & y<=300, so every block
// starts at x>=400 (the phase row sits at y=250, clear of it since x>=420).
const ROW_Y = 250, ST_W = 150, ST_H = 66, ST_CY = ROW_Y + ST_H / 2; // 283
const AVAIL_X = 420, BOUND_X = 610, RELEASED_X = 800, FAILED_X = 990;
const AVAIL_CX = AVAIL_X + ST_W / 2, BOUND_CX = BOUND_X + ST_W / 2;   // 495 / 685
const RELEASED_CX = RELEASED_X + ST_W / 2, FAILED_CX = FAILED_X + ST_W / 2; // 875 / 1065

const PVC_X = 610, PVC_Y = 70, PVC_W = 150, PVC_H = 70;    // above the Bound phase
const PVC_CX = PVC_X + PVC_W / 2, PVC_BOTTOM = PVC_Y + PVC_H; // 685 / 140

const RECLAIM_X = 940, RECLAIM_Y = 70, RECLAIM_W = 220, RECLAIM_H = 70; // the reclaimer, above Failed
const RECLAIM_CX = RECLAIM_X + RECLAIM_W / 2, RECLAIM_BOTTOM = RECLAIM_Y + RECLAIM_H; // 1050 / 140

const DISK_Y = 450, DISK_H = 100, DISK_CX = 685, DISK_TOP = DISK_Y; // 450
const SPEC_Y = DISK_Y + 66;                                // 516
const CHIPS_Y = 585;

// Transitions along the row, each an event that carries a ball when it fires.
const W_AV_BO = [[AVAIL_X + ST_W, ST_CY], [BOUND_X, ST_CY]];
const W_BO_RE = [[BOUND_X + ST_W, ST_CY], [RELEASED_X, ST_CY]];
const W_RE_FA = [[RELEASED_X + ST_W, ST_CY], [FAILED_X, ST_CY]];
// The claim binding and unbinding, straight down onto the Bound phase.
const W_PVC_BIND = [[PVC_CX, PVC_BOTTOM], [PVC_CX, ROW_Y]];
// The reclaimer running when the claim is gone, down onto the Released phase.
const W_RECLAIM = [[RECLAIM_CX, RECLAIM_BOTTOM], [RECLAIM_CX, 200], [RELEASED_CX, 200], [RELEASED_CX, ROW_Y]];
// The admin escape: Released curls back under the row to Available.
const W_RECOVER = [[RELEASED_CX, ROW_Y + ST_H], [RELEASED_CX, 400], [AVAIL_CX, 400], [AVAIL_CX, ROW_Y + ST_H]];

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// The sole sanctioned block blink, used only on the packet-less Available step so it does not read
// frozen while the poster-first player is sitting on the first narrated frame.
function flashBox(el, ctx, delay = 0) {
  if (!el || ctx.reduced) return;
  ctx.register(el.animate(
    [{ filter: 'brightness(1)' }, { filter: 'brightness(1.55)' }, { filter: 'brightness(1)' }],
    { duration: 600, delay, easing: 'ease-out' },
  ));
}

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

function specText(cx, txt) {
  return text({ class: 'scheme-label code dim', x: cx, y: SPEC_Y, 'text-anchor': 'middle' }, [txt]);
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
      'aria-label': 'A PersistentVolume moves through four phases as a state machine. It starts Available, offered to any claim. When a claim binds it becomes Bound. When that claim is deleted it becomes Released, holding a stale reference and unable to rebind. If automatic reclamation errors it becomes Failed, a terminal phase that needs an administrator. From Released an administrator can clear the reference by hand and send the volume back to Available.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const stAvail    = stateNode({ id: 'Available', label: 'Available', x: AVAIL_X, y: ROW_Y, w: ST_W, h: ST_H, cat: 'storage' });
    const stBound    = stateNode({ id: 'Bound', label: 'Bound', x: BOUND_X, y: ROW_Y, w: ST_W, h: ST_H, cat: 'storage' });
    const stReleased = stateNode({ id: 'Released', label: 'Released', x: RELEASED_X, y: ROW_Y, w: ST_W, h: ST_H, cat: 'storage' });
    const stFailed   = stateNode({ id: 'Failed', label: 'Failed', x: FAILED_X, y: ROW_Y, w: ST_W, h: ST_H, cat: 'storage' });

    const pvc     = box({ x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data', sublabel: 'the claim', cat: 'storage' });
    const reclaim = box({ x: RECLAIM_X, y: RECLAIM_Y, w: RECLAIM_W, h: RECLAIM_H, label: 'reclaim controller', sublabel: 'Delete or Recycle', cat: 'storage' });
    pvc.style.opacity = '0';
    reclaim.style.opacity = '0';

    const disk = cylinder({ x: DISK_CX - 100, y: DISK_Y, w: 200, h: DISK_H, label: 'pv-data', cat: 'storage' });

    // The spine tying the tracked PV to the phase row, arrowhead-free because it is a relation, not
    // traffic. It runs from the phase row down onto the disk that the phases describe.
    const spine = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: DISK_CX, y1: ROW_Y + ST_H, x2: DISK_CX, y2: DISK_TOP, 'stroke-dasharray': '5 5', fill: 'none' });

    const wAvBo    = pathArrow({ points: W_AV_BO, dashed: true, dim: true, color: 'storage' });
    const wBoRe    = pathArrow({ points: W_BO_RE, dashed: true, dim: true, color: 'storage' });
    const wReFa    = pathArrow({ points: W_RE_FA, dashed: true, dim: true, color: 'storage' });
    const wPvcBind = pathArrow({ points: W_PVC_BIND, dashed: true, dim: true, color: 'storage' });
    const wReclaim = pathArrow({ points: W_RECLAIM, dashed: true, dim: true, color: 'storage' });
    const wRecover = pathArrow({ points: W_RECOVER, dashed: true, dim: true, color: 'storage' });
    wPvcBind.style.opacity = '0';
    wReclaim.style.opacity = '0';
    wRecover.style.opacity = '0';

    // Event labels under each transition, blank at build, filled per step by setWire.
    const bindLbl = text({ class: 'scheme-label code dim', x: (AVAIL_X + ST_W + BOUND_X) / 2, y: ST_CY - 16, 'text-anchor': 'middle' }, [' ']);
    const relLbl  = text({ class: 'scheme-label code dim', x: (BOUND_X + ST_W + RELEASED_X) / 2, y: ST_CY - 16, 'text-anchor': 'middle' }, [' ']);
    const failLbl = text({ class: 'scheme-label code dim', x: (RELEASED_X + ST_W + FAILED_X) / 2, y: ST_CY - 16, 'text-anchor': 'middle' }, [' ']);
    const recLbl  = text({ class: 'scheme-label code dim', x: AVAIL_CX, y: 426, 'text-anchor': 'middle' }, [' ']);

    const phaseChip    = valChip({ x: 120, y: CHIPS_Y, w: 240, h: 34, name: 'phase', value: 'Available', cat: 'storage' });
    const claimRefChip = valChip({ x: 390, y: CHIPS_Y, w: 300, h: 34, name: 'claimRef', value: 'none', cat: 'storage' });
    const eventChip    = valChip({ x: 720, y: CHIPS_Y, w: 360, h: 34, name: 'last event', value: 'PV created', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): the disk, then the transition arrows and spine, then the driving
    // objects (claim, reclaimer) and the phase row above them, then the event labels, then the chip
    // strip, then the packet layer so every ball rides above everything.
    root.appendChild(disk);
    [spine, wRecover, wAvBo, wBoRe, wReFa, wPvcBind, wReclaim].forEach(el => root.appendChild(el));
    [pvc, reclaim, stAvail, stBound, stReleased, stFailed].forEach(el => root.appendChild(el));
    [bindLbl, relLbl, failLbl, recLbl].forEach(el => root.appendChild(el));
    root.appendChild(specText(DISK_CX, 'the volume being tracked'));
    [phaseChip, claimRefChip, eventChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, states: root,
      stAvail, stBound, stReleased, stFailed, pvc, reclaim, disk,
      wPvcBind, wReclaim, wRecover,
      phaseChip, claimRefChip, eventChip,
      wires: { bind: bindLbl, rel: relLbl, fail: failLbl, rec: recLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { phase, claimRef, event }) {
  setVal(s.refs.phaseChip, phase);
  setVal(s.refs.claimRefChip, claimRef);
  setVal(s.refs.eventChip, event);
}

function clearHL(s) {
  clearHighlights(s, ['pvc', 'reclaim', 'disk', 'phaseChip', 'claimRefChip', 'eventChip'], []);
  setActiveState(s.refs.states, null);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A PersistentVolume has just been created and no claim points at it. Its phase is Available, which means the binding controller is free to hand it to the next claim that fits. This is the entry point of the phase machine.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Available', claimRef: 'none', event: 'PV created' });
      setActiveState(s.refs.states, 'Available');
      s.refs.pvc.style.opacity = '0';
      s.refs.reclaim.style.opacity = '0';
      s.refs.wPvcBind.style.opacity = '0';
      s.refs.wReclaim.style.opacity = '0';
      s.refs.wRecover.style.opacity = '0';
    },
  },
  {
    id: 'available',
    duration: 2200,
    narration: 'While it is Available the volume is a free agent. It carries no claimRef, so any claim whose size, class and access mode match can grab it. Nothing has happened to it yet, it is simply waiting to be picked up.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Available', claimRef: 'none', event: 'offered to binder' });
      setActiveState(s.refs.states, 'Available');
      s.refs.pvc.style.opacity = '0';
      s.refs.reclaim.style.opacity = '0';
      s.refs.wPvcBind.style.opacity = '0';
      s.refs.wReclaim.style.opacity = '0';
      s.refs.wRecover.style.opacity = '0';
      s.refs.disk.classList.add('highlight');
      if (ctx.reduced) return;
      // No packet on this step (the volume is simply waiting), so the Available phase gives one
      // blink to show it is the live state rather than a frozen frame.
      flashBox(s.refs.stAvail, ctx, 0);
    },
  },
  {
    id: 'bound',
    duration: 2800,
    narration: 'A claim binds. The event is the binding controller writing a claimRef on the volume, and that flips the phase to Bound. From here the volume is reserved for exactly one claim and no other claim can take it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Bound', claimRef: 'data', event: 'claim bound' });
      setActiveState(s.refs.states, 'Bound');
      s.refs.reclaim.style.opacity = '0';
      s.refs.wReclaim.style.opacity = '0';
      s.refs.wRecover.style.opacity = '0';
      s.refs.pvc.style.opacity = '1';
      s.refs.wPvcBind.style.opacity = '1';
      setWire(s, 'bind', 'claim binds');
      if (ctx.reduced) { s.refs.stBound.classList.add('highlight'); return; }
      const bindHop = routePacket(s, ctx, W_PVC_BIND, { cat: 'storage' });
      ridingLabel(s, ctx, 'claimRef: data', W_PVC_BIND);
      const evt = routePacket(s, ctx, W_AV_BO, { delay: bindHop.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'Available to Bound', W_AV_BO, { delay: bindHop.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.stBound, ctx, evt.arrivalMs);
    },
  },
  {
    id: 'released',
    duration: 2800,
    narration: 'The claim is deleted. The volume does not go back to Available on its own: it moves to Released. The claimRef is still there but now points at a claim that no longer exists, which is precisely what stops another claim from binding.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Released', claimRef: 'data, stale', event: 'claim deleted' });
      setActiveState(s.refs.states, 'Released');
      s.refs.reclaim.style.opacity = '0';
      s.refs.wReclaim.style.opacity = '0';
      s.refs.wRecover.style.opacity = '0';
      s.refs.pvc.style.opacity = '0.25';
      s.refs.wPvcBind.style.opacity = '0';
      setWire(s, 'rel', 'claim removed');
      if (ctx.reduced) { s.refs.stReleased.classList.add('highlight'); return; }
      const evt = routePacket(s, ctx, W_BO_RE, { cat: 'storage' });
      ridingLabel(s, ctx, 'Bound to Released', W_BO_RE);
      lightBoxAt(s.refs.stReleased, ctx, evt.arrivalMs);
    },
  },
  {
    id: 'failed',
    duration: 3000,
    narration: 'If the reclaim policy runs an automatic cleanup that errors, for example a DeleteVolume that the backend rejects, the volume lands in Failed. This phase is terminal and the machine will not leave it on its own. A human has to step in and sort out the mess.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Failed', claimRef: 'data, stale', event: 'reclaim errored' });
      setActiveState(s.refs.states, 'Failed');
      s.refs.pvc.style.opacity = '0.25';
      s.refs.wPvcBind.style.opacity = '0';
      s.refs.wRecover.style.opacity = '0';
      s.refs.reclaim.style.opacity = '1';
      s.refs.wReclaim.style.opacity = '1';
      setWire(s, 'fail', 'reclaim error');
      if (ctx.reduced) { s.refs.stFailed.classList.add('highlight'); return; }
      const run = routePacket(s, ctx, W_RECLAIM, { cat: 'storage' });
      ridingLabel(s, ctx, 'DeleteVolume failed', W_RECLAIM);
      const evt = routePacket(s, ctx, W_RE_FA, { delay: run.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'Released to Failed', W_RE_FA, { delay: run.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.stFailed, ctx, evt.arrivalMs);
    },
  },
  {
    id: 'recover',
    duration: 3000,
    narration: 'The way out of a stuck Released volume is manual. An administrator clears the stale claimRef, and with the reference gone the volume returns to Available and can be bound again. Automatic reclamation moves the machine forward, only a person can move it back.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Available', claimRef: 'cleared', event: 'admin cleared claimRef' });
      setActiveState(s.refs.states, 'Available');
      s.refs.pvc.style.opacity = '0';
      s.refs.wPvcBind.style.opacity = '0';
      s.refs.reclaim.style.opacity = '0';
      s.refs.wReclaim.style.opacity = '0';
      s.refs.wRecover.style.opacity = '1';
      setWire(s, 'rec', 'admin clears claimRef');
      if (ctx.reduced) { s.refs.stAvail.classList.add('highlight'); return; }
      const back = routePacket(s, ctx, W_RECOVER, { cat: 'storage' });
      ridingLabel(s, ctx, 'claimRef: null', W_RECOVER);
      lightBoxAt(s.refs.stAvail, ctx, back.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
