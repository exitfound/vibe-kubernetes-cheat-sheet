import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// Layout (viewBox 1200x640). Storage grammar: the consumer Pod on top, the claim in the middle, the
// disk on the shelf below, all sharing the identity column at x=540 (the mount reference above the
// claim, the Bound link below it, both arrowhead-free because they are relations, not traffic). The
// actors that drive deletion sit to the right: kubectl issues the delete, and the pvc-protection
// controller is what eventually lets the object go. The whole point of the card is that a delete does
// NOT remove the object while a Pod still holds it: the finalizer keeps it in Terminating. Only the
// Pod pulses, the boxes and the disk light. The narration overlay owns x<=380 & y<=300, so every
// block starts at x>=400.
const POD_X = 400, POD_Y = 55, POD_W = 210, POD_H = 120;
const POD_CX = POD_X + POD_W / 2, POD_BOTTOM = POD_Y + POD_H; // 505 / 175

const PVC_X = 420, PVC_Y = 255, PVC_W = 240, PVC_H = 92;
const PVC_CX = PVC_X + PVC_W / 2, PVC_RIGHT = PVC_X + PVC_W;  // 540 / 660
const PVC_TOP = PVC_Y, PVC_BOTTOM = PVC_Y + PVC_H;           // 255 / 347

const KUBECTL_X = 790, KUBECTL_Y = 60, KUBECTL_W = 300, KUBECTL_H = 78;
const KUBECTL_LEFT = KUBECTL_X, KUBECTL_BOTTOM = KUBECTL_Y + KUBECTL_H; // 790 / 138

const CTRL_X = 790, CTRL_Y = 255, CTRL_W = 320, CTRL_H = 92;
const CTRL_LEFT = CTRL_X, CTRL_CY = CTRL_Y + CTRL_H / 2;     // 790 / 301

const DISK_CX = 540, DISK_Y = 450, DISK_H = 100, DISK_TOP = DISK_Y; // 450
const SPEC_Y = DISK_Y + 66;                                 // 516
const CHIPS_Y = 585;

const SPINE_X = 540;   // the identity column

// kubectl deletes the claim: sets the deletionTimestamp on the PVC.
const W_DEL_PVC = [[KUBECTL_LEFT, 110], [700, 110], [700, 285], [PVC_RIGHT, 285]];
// kubectl deletes the Pod that was holding the claim.
const W_DEL_POD = [[KUBECTL_LEFT, 92], [POD_CX + 40, 92], [POD_CX + 40, POD_Y]];
// The controller removes the finalizer once no Pod consumes the claim.
const W_CTRL_PVC = [[CTRL_LEFT, 305], [PVC_RIGHT + 15, 305], [PVC_RIGHT + 15, 320], [PVC_RIGHT, 320]];

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
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

function podBlock() {
  const shell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'mounts data-claim', containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: POD_X + 22, y: POD_Y + 44, w: POD_W - 44, h: 48, label: 'app', sublabel: 'writes to /data', cat: 'storage' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
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
      'aria-label': 'Delete a PVC while a Pod still mounts it and it does not disappear. The kubernetes.io slash pvc-protection finalizer holds the claim in the Terminating phase: the deletionTimestamp is set but the object stays because a consumer is still using it. Only when the last mounting Pod is gone does the pvc-protection controller remove the finalizer, and only then does the garbage collector delete the object for real.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const web = podBlock();
    const pvc = box({ x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-claim', sublabel: 'Bound', cat: 'storage' });
    const kubectl = box({ x: KUBECTL_X, y: KUBECTL_Y, w: KUBECTL_W, h: KUBECTL_H, label: 'kubectl delete', sublabel: 'issues the delete', cat: 'storage' });
    const ctrl = box({ x: CTRL_X, y: CTRL_Y, w: CTRL_W, h: CTRL_H, label: 'pvc-protection controller', sublabel: 'removes the finalizer', cat: 'storage' });
    const disk = cylinder({ x: DISK_CX - 100, y: DISK_Y, w: 200, h: DISK_H, label: 'pv-data', cat: 'storage' });

    // The identity column: the Pod references the claim (above), the claim is bound to the volume
    // (below). Both are relations, so neither carries an arrowhead.
    const refLink   = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: SPINE_X, y1: POD_BOTTOM, x2: SPINE_X, y2: PVC_TOP, 'stroke-dasharray': '5 5', fill: 'none' });
    const boundLink = line({ class: 'scheme-arrow scheme-arrow-storage', x1: SPINE_X, y1: PVC_BOTTOM, x2: SPINE_X, y2: DISK_TOP, fill: 'none' });

    const wDelPvc = pathArrow({ points: W_DEL_PVC, dashed: true, dim: true, color: 'storage' });
    const wDelPod = pathArrow({ points: W_DEL_POD, dashed: true, dim: true, color: 'storage' });
    const wCtrlPvc = pathArrow({ points: W_CTRL_PVC, dashed: true, dim: true, color: 'storage' });
    wDelPvc.style.opacity = '0';
    wDelPod.style.opacity = '0';
    wCtrlPvc.style.opacity = '0';

    const finalLbl = text({ class: 'scheme-label code dim', x: PVC_CX, y: 372, 'text-anchor': 'middle' }, [' ']);

    const phaseChip = valChip({ x: 90,  y: CHIPS_Y, w: 230, h: 34, name: 'PVC phase', value: 'Bound', cat: 'storage' });
    const finalChip = valChip({ x: 340, y: CHIPS_Y, w: 330, h: 34, name: 'finalizers', value: 'pvc-protection', cat: 'storage' });
    const tsChip    = valChip({ x: 690, y: CHIPS_Y, w: 240, h: 34, name: 'deletionTimestamp', value: 'none', cat: 'storage' });
    const usersChip = valChip({ x: 950, y: CHIPS_Y, w: 200, h: 34, name: 'consumers', value: '1 Pod', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): blocks and disk, then the identity links and route wires and labels
    // above them, then the Pod so it sits above its links, then the chip strip, then the packet layer.
    [pvc, kubectl, ctrl, disk].forEach(el => root.appendChild(el));
    [refLink, boundLink, wDelPvc, wDelPod, wCtrlPvc].forEach(el => root.appendChild(el));
    root.appendChild(web.group);
    root.appendChild(finalLbl);
    root.appendChild(specText(DISK_CX, 'the backing disk'));
    [phaseChip, finalChip, tsChip, usersChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, web: web.group, app: web.innerBox,
      pvc, kubectl, ctrl, disk, refLink, boundLink,
      wDelPvc, wDelPod, wCtrlPvc,
      phaseChip, finalChip, tsChip, usersChip,
      wires: { final: finalLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { phase, finalizers, ts, users }) {
  setVal(s.refs.phaseChip, phase);
  setVal(s.refs.finalChip, finalizers);
  setVal(s.refs.tsChip, ts);
  setVal(s.refs.usersChip, users);
}

function clearHL(s) {
  clearHighlights(s, ['pvc', 'kubectl', 'ctrl', 'disk', 'app',
    'phaseChip', 'finalChip', 'tsChip', 'usersChip'], [s.refs.web]);
  // Only the final step fades the claim, so reset it here to keep a wrap-to-poster clean.
  s.refs.pvc.style.opacity = '1';
}

const GONE = 0.12;

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Pod web-0 is running and mounts data-claim, which is Bound to a real disk. The claim carries one finalizer, kubernetes.io slash pvc-protection, put there automatically the moment a Pod started using it. That finalizer is about to matter.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Bound', finalizers: 'pvc-protection', ts: 'none', users: '1 Pod' });
      setBoxSublabel(s.refs.pvc, 'Bound');
      s.refs.web.style.opacity = '1';
      s.refs.refLink.style.opacity = '1';
      s.refs.boundLink.style.opacity = '1';
      s.refs.wDelPvc.style.opacity = '0';
      s.refs.wDelPod.style.opacity = '0';
      s.refs.wCtrlPvc.style.opacity = '0';
    },
  },
  {
    id: 'delete-request',
    duration: 2800,
    narration: 'You run kubectl delete pvc data-claim. The Api accepts it and stamps a deletionTimestamp on the object. This is the request to delete, not the deletion itself. Watch what the object actually does next.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Bound', finalizers: 'pvc-protection', ts: 'set now', users: '1 Pod' });
      setBoxSublabel(s.refs.pvc, 'delete requested');
      s.refs.web.style.opacity = '1';
      s.refs.refLink.style.opacity = '1';
      s.refs.boundLink.style.opacity = '1';
      s.refs.wDelPvc.style.opacity = '1';
      if (ctx.reduced) { s.refs.pvc.classList.add('highlight'); return; }
      const del = routePacket(s, ctx, W_DEL_PVC, { cat: 'storage' });
      ridingLabel(s, ctx, 'delete pvc', W_DEL_PVC);
      lightBoxAt(s.refs.pvc, ctx, del.arrivalMs);
    },
  },
  {
    id: 'finalizer-holds',
    duration: 2600,
    // Packet-less: the phase change and the still-present object carry the step. There IS a Pod on
    // screen, but it is not the actor here, so this reads through the finalizer text, no pod pulse.
    narration: 'The object does not vanish. Its phase becomes Terminating, but because the finalizers list is not empty, the garbage collector refuses to remove it. The deletionTimestamp is set and yet the PVC is still fully there, still mounted by the Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Terminating', finalizers: 'pvc-protection', ts: 'set', users: '1 Pod' });
      setBoxSublabel(s.refs.pvc, 'Terminating, not gone');
      s.refs.web.style.opacity = '1';
      s.refs.refLink.style.opacity = '1';
      s.refs.boundLink.style.opacity = '1';
      s.refs.pvc.classList.add('highlight');
      setWire(s, 'final', 'finalizer blocks removal');
      if (ctx.reduced) return;
      // No packet and the Pod is not acting, so a lone box flash on the held claim keeps the frame
      // from reading frozen. This is the sanctioned use of flashBox: no packet, no pulsing Pod.
      ctx.register(s.refs.pvc.animate(
        [{ filter: 'brightness(1)' }, { filter: 'brightness(1.55)' }, { filter: 'brightness(1)' }],
        { duration: 600, delay: 0, easing: 'ease-out' },
      ));
    },
  },
  {
    id: 'why',
    duration: 2400,
    narration: 'The finalizer exists for a reason. Pulling the claim out from under a running Pod would break the mount and could lose in-flight writes. So the protection is deliberate: the object is pinned open for exactly as long as a Pod is still consuming it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Terminating', finalizers: 'pvc-protection', ts: 'set', users: '1 Pod' });
      setBoxSublabel(s.refs.pvc, 'held by web-0');
      s.refs.web.style.opacity = '1';
      s.refs.refLink.style.opacity = '1';
      s.refs.boundLink.style.opacity = '1';
      s.refs.pvc.classList.add('highlight');
      s.refs.app.classList.add('highlight');
      setWire(s, 'final', 'a Pod still mounts it');
      // The Pod is the actor here (it is the reason the claim is pinned), so it pulses.
      if (ctx.reduced) return;
      pulsePod(s.refs.web, ctx, 0);
    },
  },
  {
    id: 'pod-gone',
    duration: 2800,
    narration: 'Now the Pod is deleted, or it finishes and is cleaned up. As it goes, the mount is released and the count of consumers drops to zero. This is the event the protection controller has been waiting for.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Terminating', finalizers: 'pvc-protection', ts: 'set', users: '0 Pods' });
      setBoxSublabel(s.refs.pvc, 'Terminating, no consumers');
      s.refs.refLink.style.opacity = '0';
      s.refs.boundLink.style.opacity = '1';
      s.refs.pvc.classList.add('highlight');
      s.refs.wDelPod.style.opacity = '1';
      setWire(s, 'final', 'last consumer gone');
      // The Pod ends this step gone.
      s.refs.web.style.opacity = GONE;
      if (ctx.reduced) return;
      s.refs.web.style.opacity = '1';
      const del = routePacket(s, ctx, W_DEL_POD, { cat: 'storage' });
      ridingLabel(s, ctx, 'delete pod', W_DEL_POD);
      ctx.register(s.refs.web.animate([{ opacity: 1 }, { opacity: GONE }], { duration: 500, delay: del.arrivalMs, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'finalizer-removed',
    duration: 2800,
    narration: 'With no Pod left mounting the claim, the pvc-protection controller does its one job: it removes the finalizer from the object. The finalizers list is now empty. Nothing is holding the deletion back any more.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Terminating', finalizers: 'none', ts: 'set', users: '0 Pods' });
      setBoxSublabel(s.refs.pvc, 'finalizer removed');
      s.refs.web.style.opacity = GONE;
      s.refs.refLink.style.opacity = '0';
      s.refs.boundLink.style.opacity = '1';
      s.refs.ctrl.classList.add('highlight');
      s.refs.wCtrlPvc.style.opacity = '1';
      setWire(s, 'final', 'finalizers now empty');
      if (ctx.reduced) { s.refs.pvc.classList.add('highlight'); return; }
      const rm = routePacket(s, ctx, W_CTRL_PVC, { cat: 'storage' });
      ridingLabel(s, ctx, 'patch finalizers: []', W_CTRL_PVC);
      lightBoxAt(s.refs.pvc, ctx, rm.arrivalMs);
    },
  },
  {
    id: 'gone',
    duration: 2600,
    narration: 'The garbage collector sees an empty finalizers list and a deletionTimestamp in the past, so it finally deletes the object. The PVC is gone, and the disk is now reclaimed according to its policy. The lesson of a stuck Terminating PVC is simple: find the Pod that still mounts it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'deleted', finalizers: 'none', ts: 'past', users: '0 Pods' });
      s.refs.web.style.opacity = GONE;
      s.refs.refLink.style.opacity = '0';
      s.refs.boundLink.style.opacity = '0';
      setWire(s, 'final', 'object removed');
      // The claim ends this step gone.
      s.refs.pvc.style.opacity = GONE;
      if (ctx.reduced) return;
      s.refs.pvc.style.opacity = '1';
      ctx.register(s.refs.pvc.animate([{ opacity: 1 }, { opacity: GONE }], { duration: 600, delay: 200, fill: 'forwards', easing: 'ease-in' }));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
