import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setCylinderLabel, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, BEAT, FADE,
} from '../lib/storage-kit.js';

// hostPath. Storage grammar as a VERTICAL STACK inside one Node boundary, the same skeleton as the
// emptyDir card (Node holding a Pod of two containers over a backing cylinder, side-entry L-lanes),
// because hostPath is the other node-local volume and the two cards must read as a pair. The whole
// card is the CONTRAST with emptyDir: an emptyDir is scratch the kubelet makes FOR the Pod, a
// hostPath is a raw window onto a directory that ALREADY LIVES ON THE NODE and belongs to it.
//
// TWO DELIBERATE FAMILY VARIATIONS, both carrying the lesson:
//   1. NO OWNERSHIP SPINE. volume-model and emptyDir draw a dim spine from the Pod down to the disk
//      because the volume belongs to the Pod. Here the directory belongs to the NODE, not the Pod,
//      so that spine is intentionally absent: the Pod and the host directory read as two separate
//      things joined only by the mount lanes. The empty gap at x=600 IS the message.
//   2. THE reschedule STEP INVERTS emptyDir's dies STEP. emptyDir ghosts the Pod AND its directory
//      together (both owned by the Pod). hostPath ghosts ONLY the Pod and its mount lanes while the
//      host directory stays lit at full opacity, because the directory is the node's and outlives
//      the Pod on that node. That single visual inversion is why hostPath is not persistence.
//
// GEOMETRY is emptyDir's verbatim so the pair aligns: Node 180..1020, Pod 300..900 centered on 600,
// the two containers pushed to the Pod edges (centers 425 and 775, outside the cylinder span), the
// cylinder 470..730 centered on 600. The narration overlay reaches about (300, 163) here, and the
// Node top at 170 sits flush under it. A longer narration invalidates that measurement.
//
// PULSE MODEL (canon): the Pod is one unit, the SHELL pulses (shellWrap holds only the shell so the
// pulse never reaches the inner containers), the containers only take a static .highlight, never a
// pulse. Highlights are step-static, set above the reduced guard, and the shell pulse fires in the
// same beat. The cylinder is infrastructure: it lights, never pulses.
//
// WIRES: two directed L-lanes, exactly emptyDir's, each shared by its static pathArrow and its ball.
// The app writes DOWN into the cylinder side, the agent reads UP out of the far side.
const NODE_X = 180, NODE_Y = 170, NODE_W = 840, NODE_H = 380;   // 180..1020, center 600, bottom 550

const POD_X = 300, POD_Y = 186, POD_W = 600, POD_H = 170;       // 300..900, center 600
const POD_BOTTOM = POD_Y + POD_H;                               // 356

const C_Y = 232, C_W = 190, C_H = 84;                           // container row (volume-model grid)
const C_BOTTOM = C_Y + C_H;                                     // 316
const APP_X = 330,  APP_CX = APP_X + C_W / 2;                   // 330..520, center 425
const SIDE_X = 680, SIDE_CX = SIDE_X + C_W / 2;                 // 680..870, center 775

// The host directory is drawn with the family cylinder (260x104 centered on 600), the same block as
// the emptyDir disk, so the two node-local cards read as one family.
const HP_X = 470, HP_Y = 408, HP_W = 260, HP_H = 104;          // 470..730, center 600, bottom 512
const HP_TOP = HP_Y;
const HP_MY = HP_Y + HP_H / 2;                                  // 460, where the lanes meet the sides

const DISK_LBL_Y = 530;
const CHIPS_Y = 566;

// One L-shaped polyline per direction, shared by its static pathArrow and its ball, written in its
// one traffic direction so the arrowhead lands at the receiving end.
const LANE_WRITE = [[APP_CX, C_BOTTOM], [APP_CX, HP_MY], [HP_X, HP_MY]];              // app -> host dir
const LANE_READ  = [[HP_X + HP_W, HP_MY], [SIDE_CX, HP_MY], [SIDE_CX, C_BOTTOM]];     // host dir -> agent

// A tag that rides ALONG with the ball on the same path, timing and easing. Balls are routePacket
// (eased), so the label defaults to the same ease-in-out and the same routeDur, or it would drift
// off the ball mid-flight.
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
      'aria-label': 'hostPath volume: a hostPath mounts a file or directory that already exists on the node filesystem straight into the Pod. The directory belongs to the node, not the Pod, so writes land in real host state and stay on the node after the Pod is gone, but a Pod rescheduled to another node mounts the different directory that belongs to that node, so hostPath looks like persistence and is not. Pointed at a sensitive path it hands the whole node to the Pod, which is why the Baseline and Restricted Pod Security Standards forbid it.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const nd = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });

    // The pod shell lives alone in shellWrap so the pod pulse (which queries .scheme-pod
    // descendants) reaches ONLY the shell, never the inner container boxes.
    const shell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod log-agent', sublabel: 'volumes: varlog (hostPath)', containers: 0, cat: 'storage' });
    const shellRect = shell.querySelector('.scheme-pod-rect');
    if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
    const shellWrap = g({});
    shellWrap.appendChild(shell);

    const app  = containerBlock({ x: APP_X,  y: C_Y, w: C_W, h: C_H, label: 'App',   sublabel: 'writes /var/log' });
    const side = containerBlock({ x: SIDE_X, y: C_Y, w: C_W, h: C_H, label: 'Agent', sublabel: 'reads /var/log' });
    const podGroup = g({});
    [shellWrap, app.wrap, side.wrap].forEach(el => podGroup.appendChild(el));

    // The backing cylinder is the node's OWN directory, not a Pod-scoped disk. It carries the host
    // path as its label and is drawn inside the Node boundary. No spine ties it to the Pod.
    const hp = cylinder({ x: HP_X, y: HP_Y, w: HP_W, h: HP_H, label: '/var/log', cat: 'storage' });
    const hpLbl = hp.querySelector('.scheme-cylinder-label');
    if (hpLbl) hpLbl.setAttribute('y', 64);

    // One directed lane per container, each with its own arrowhead: the app writes into the cylinder
    // side, the agent reads out of the far side. No ownership spine (the directory is not the Pod's).
    const wWrite = pathArrow({ points: LANE_WRITE, dashed: true, dim: true, color: 'storage' });
    const wRead  = pathArrow({ points: LANE_READ,  dashed: true, dim: true, color: 'storage' });

    const diskLbl = text({ class: 'scheme-label code dim', x: 600, y: DISK_LBL_Y, 'text-anchor': 'middle' }, ['the node filesystem']);

    // The chip strip spans exactly the node width (180..1020): 3x270 + 2x15 = 840.
    const hostChip = valChip({ x: 180, y: CHIPS_Y, w: 270, h: 34, name: 'hostPath',  value: 'mounts /var/log', cat: 'storage' });
    const livesChip = valChip({ x: 465, y: CHIPS_Y, w: 270, h: 34, name: 'data lives', value: 'on the node',    cat: 'storage' });
    const expChip  = valChip({ x: 750, y: CHIPS_Y, w: 270, h: 34, name: 'exposure',  value: 'one directory',   cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): node, then blocks, then the two lanes and the disk label above them,
    // then the chip strip, then the packet layer so every ball rides above everything.
    root.appendChild(nd);
    [podGroup, hp].forEach(el => root.appendChild(el));
    [wWrite, wRead, diskLbl].forEach(el => root.appendChild(el));
    [hostChip, livesChip, expChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, pod: podGroup, shellWrap, appC: app.wrap, appBox: app.box, sideC: side.wrap, sideBox: side.box,
      hp, wWrite, wRead, diskLbl,
      hostChip, livesChip, expChip,
      wires: {},
      packetLayer,
    };
  }

  reset() { this.build(); }
}

// Sets each chip and statically highlights the ones whose value CHANGES on this step (the standard
// set by the volume-model anchor): a chip that changes glows for the step, a chip that stays the
// same does not. Steps are always entered in order, so the diff is deterministic.
function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}
function setChips(s, { host, lives, exposure }) {
  setChip(s.refs.hostChip, host);
  setChip(s.refs.livesChip, lives);
  setChip(s.refs.expChip, exposure);
}

function clearHL(s) {
  clearHighlights(s, ['appBox', 'sideBox', 'hp', 'hostChip', 'livesChip', 'expChip'],
    [s.refs.shellWrap, s.refs.appC, s.refs.sideC]);
  s.refs.pod.style.opacity = '1';
  s.refs.appC.style.opacity = '1';
  s.refs.sideC.style.opacity = '1';
  s.refs.hp.style.opacity = '1';
  // The reschedule step ghosts the Pod and its mount lanes, so every step restores them.
  [s.refs.wWrite, s.refs.wRead].forEach(el => { el.style.opacity = '1'; });
  // The security and reschedule steps rewrite the cylinder label and the disk label, so restore both.
  s.refs.diskLbl.textContent = 'the node filesystem';
  setCylinderLabel(s.refs.hp, '/var/log');
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A hostPath mounts a file or directory that already exists on the node filesystem straight into the Pod. Unlike an emptyDir, kubelet does not create it for the Pod. It is a raw window onto /var/log, which belongs to the node, not to this Pod.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { host: 'mounts /var/log', lives: 'on the node', exposure: 'one directory' });
    },
  },
  {
    id: 'mount',
    duration: 2600,
    narration: 'The Pod names a hostPath with a path and a type. kubelet checks the node first: type Directory requires /var/log to already exist, while DirectoryOrCreate makes it, owned by kubelet. It then bind-mounts that host directory into the container.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { host: 'bind-mounted in', lives: 'on the node', exposure: 'one directory' });
      // kubelet bind-mounts the existing host directory INTO the containers, so the cylinder AND both
      // container boxes light as the mount lands, and the shell pulses in the same beat. All static
      // above the guard so reduced motion holds the same lit end-state.
      s.refs.hp.classList.add('highlight');
      s.refs.appBox.classList.add('highlight');
      s.refs.sideBox.classList.add('highlight');
      if (ctx.reduced) return;
      pulsePod(s.refs.shellWrap, ctx, 0);
    },
  },
  {
    id: 'access',
    duration: 3800,
    narration: 'Inside the container /var/log is the real log directory of the node. The app writes an entry and the agent reads it straight back, and every byte lands in the node filesystem where it stays after the Pod is gone. This is live host state, not private scratch.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { host: 'reads host files', lives: 'on the node', exposure: 'one directory' });
      // Both containers and the host directory are in use this whole step: all three light at step
      // entry, and the shell pulse fires at the same instant, one beat.
      s.refs.hp.classList.add('highlight');
      s.refs.appBox.classList.add('highlight');
      s.refs.sideBox.classList.add('highlight');
      if (ctx.reduced) return;
      // The app WRITE leaves the Pod for the cylinder (up-arrow), so the shell pulses first and the
      // write ball descends at afterPulse. The agent READ returns the bytes INTO the Pod (down-arrow),
      // so the read ball leaves the far side first and the shell pulses AGAIN when it arrives back.
      pulsePod(s.refs.shellWrap, ctx, 0);
      const write = routePacket(s, ctx, LANE_WRITE, { delay: BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'write entry', LANE_WRITE, { delay: BEAT.afterPulse });
      const read = routePacket(s, ctx, LANE_READ, { delay: write.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'read entry', LANE_READ, { delay: write.arrivalMs + BEAT.afterHop });
      pulsePod(s.refs.shellWrap, ctx, read.arrivalMs);
    },
  },
  {
    id: 'reschedule',
    duration: 2800,
    narration: 'The directory belongs to the node, not the Pod, so deleting the Pod leaves /var/log untouched on Node-1, and here the Pod dims out while the directory stays lit. The replacement may land on Node-2, where hostPath mounts the different /var/log that belongs to that node. The data did not travel. hostPath looks like persistence and is not.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { host: 'stays behind', lives: 'on the old node', exposure: 'one directory' });
      // The exact inversion of emptyDir dies: only the Pod and its mount lanes ghost. The host
      // directory stays at full opacity and lit, because it belongs to the node and outlives the Pod.
      s.refs.hp.classList.add('highlight');
      s.refs.diskLbl.textContent = 'stays on Node-1';
      const GONE = [s.refs.pod, s.refs.wWrite, s.refs.wRead];
      GONE.forEach(el => { el.style.opacity = '0.22'; });
      if (ctx.reduced) return;
      GONE.forEach(el => {
        ctx.register(el.animate([{ opacity: 1 }, { opacity: 0.22 }], { duration: FADE.out, easing: 'ease-in' }));
      });
    },
  },
  {
    id: 'security',
    duration: 3000,
    narration: 'Point a hostPath at a sensitive path and the risk is plain. Mounting the host root or the container runtime socket gives the Pod control of the node itself, a container escape. This is why the Baseline and Restricted Pod Security Standards forbid hostPath outright.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { host: 'mounts / (root)', lives: 'on the node', exposure: 'the whole node' });
      // The cylinder now stands for the host root, and the reach into it is what the ball carries.
      setCylinderLabel(s.refs.hp, 'host /');
      s.refs.diskLbl.textContent = 'hands over the node';
      s.refs.hp.classList.add('highlight');
      s.refs.appBox.classList.add('highlight');
      if (ctx.reduced) return;
      pulsePod(s.refs.shellWrap, ctx, 0);
      // The Pod reaches down into the host root: a pod-to-infra hop, so the shell pulses first and
      // the ball leaves at afterPulse.
      routePacket(s, ctx, LANE_WRITE, { delay: BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'full node access', LANE_WRITE, { delay: BEAT.afterPulse });
    },
  },
  {
    id: 'bridge',
    duration: 3000,
    narration: 'Used narrowly, hostPath is right: a node agent in a DaemonSet reading /var/log or /proc genuinely needs the host. For an ordinary Pod that wants node-local storage to survive a reschedule, the portable answer is a local PersistentVolume, whose node affinity keeps the Pod pinned to its data. That is where the rest of this category begins.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { host: 'for node agents', lives: 'on the node', exposure: 'one directory' });
      s.refs.hp.classList.add('highlight');
      s.refs.sideBox.classList.add('highlight');
      if (ctx.reduced) return;
      // The agent reads the node logs: an infra-to-pod hop, so the ball leaves first and the shell
      // pulses when it arrives.
      const read = routePacket(s, ctx, LANE_READ, { cat: 'storage' });
      ridingLabel(s, ctx, 'reads node logs', LANE_READ);
      pulsePod(s.refs.shellWrap, ctx, read.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
