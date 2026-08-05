import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, node, cylinder, pathArrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, setChip, setCylinderLabel, pulsePod, routePacket, makeInit, clearHighlights, clearWires, BEAT, FADE, makeRidingLabel, lightBoxAt, OPACITY } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-hostpath


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

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

function containerBlock({ x, y, w, h, label, sublabel }) {
  const b = box({ x, y, w, h, label, sublabel, role: 'storage' });
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
      'aria-label': 'hostPath volume: a hostPath mounts a file or directory from the Node filesystem straight into the Pod. Under type Directory or File the target must already exist, DirectoryOrCreate and FileOrCreate make it, and the default empty type checks nothing at all. The directory belongs to the Node, not the Pod, so writes land in real host state and stay on the Node after the Pod is gone, but a Pod rescheduled to another Node mounts the different directory that belongs to that Node, so hostPath looks like persistence and is not. Pointed at a sensitive path it hands the whole Node to the Pod, which is why the Baseline and Restricted Pod Security Standards forbid it.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const nd = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });

    // shellWrap survives as a handle for code that wants the shell alone. The PULSE is not that:
    // it takes the whole Pod group, so the containers blink with the Pod they belong to (2026-07-29).
    const shell = podShell({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod log-agent', sublabel: 'volumes: varlog (hostPath)', containers: 0, role: 'storage' });
    const shellWrap = g({});
    shellWrap.appendChild(shell);

    const app  = containerBlock({ x: APP_X,  y: C_Y, w: C_W, h: C_H, label: 'app',   sublabel: 'writes /var/log' });
    const side = containerBlock({ x: SIDE_X, y: C_Y, w: C_W, h: C_H, label: 'Agent', sublabel: 'reads /var/log' });
    const podGroup = g({});
    [shellWrap, app.wrap, side.wrap].forEach(el => podGroup.appendChild(el));

    // The backing cylinder is the node's OWN directory, not a Pod-scoped disk. It carries the host
    // path as its label and is drawn inside the Node boundary. No spine ties it to the Pod.
    const hp = cylinder({ x: HP_X, y: HP_Y, w: HP_W, h: HP_H, label: '/var/log', role: 'storage' });
    const hpLbl = hp.querySelector('.scheme-cylinder-label');
    if (hpLbl) hpLbl.setAttribute('y', 64);

    // One directed lane per container, each with its own arrowhead: the app writes into the cylinder
    // side, the agent reads out of the far side. No ownership spine (the directory is not the Pod's).
    const wWrite = pathArrow({ points: LANE_WRITE, dashed: true, dim: true, role: 'storage' });
    const wRead  = pathArrow({ points: LANE_READ,  dashed: true, dim: true, role: 'storage' });

    const diskLbl = text({ class: 'scheme-label code dim', x: 600, y: DISK_LBL_Y, 'text-anchor': 'middle' }, ['the node filesystem']);

    // The chip strip spans exactly the node width (180..1020): 3x270 + 2x15 = 840.
    const hostChip = valChip({ x: 180, y: CHIPS_Y, w: 270, h: 34, name: 'hostPath',  value: 'mounts /var/log', role: 'storage' });
    const livesChip = valChip({ x: 465, y: CHIPS_Y, w: 270, h: 34, name: 'data lives', value: 'on the node',    role: 'storage' });
    const expChip  = valChip({ x: 750, y: CHIPS_Y, w: 270, h: 34, name: 'exposure',  value: 'one directory',   role: 'storage' });

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

function setChips(s, { host, lives, exposure }) {
  setChip(s.refs.hostChip, host);
  setChip(s.refs.livesChip, lives);
  setChip(s.refs.expChip, exposure);
}

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
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
  clearWires(s);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      resetStep(s);
      setChips(s, { host: 'mounts /var/log', lives: 'on the node', exposure: 'one directory' });
    },
  },
  {
    id: 'mount',
    duration: 2600,
    narration: 'The Pod names a hostPath with a path and a type. Kubelet checks the Node first: type Directory requires /var/log to already exist, while DirectoryOrCreate makes it, owned by Kubelet. It then bind-mounts that host directory into the container.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { host: 'bind-mounted in', lives: 'on the node', exposure: 'one directory' });
      s.refs.hp.classList.add('highlight');
      s.refs.appBox.classList.add('highlight');
      s.refs.sideBox.classList.add('highlight');
      if (ctx.reduced) return;
      pulsePod(s.refs.pod, ctx, 0);
    },
  },
  {
    id: 'access',
    duration: 3800,
    narration: 'Inside the container /var/log is the real log directory of the Node. The app writes an entry and the agent reads it straight back, and every byte lands in the Node filesystem where it stays after the Pod is gone. This is live host state, not private scratch.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { host: 'reads host files', lives: 'on the node', exposure: 'one directory' });
      // The app container is the writer and is lit at entry. The host directory and the agent box
      // are receivers, so each lights as its own ball lands, and the pulse fires on the same beat.
      s.refs.appBox.classList.add('highlight');
      if (ctx.reduced) { s.refs.hp.classList.add('highlight'); s.refs.sideBox.classList.add('highlight'); return; }
      pulsePod(s.refs.pod, ctx, 0);
      const write = routePacket(s, ctx, LANE_WRITE, { delay: BEAT.afterPulse, role: 'storage' });
      ridingLabel(s, ctx, 'write entry', LANE_WRITE, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.hp, ctx, write.arrivalMs);
      const read = routePacket(s, ctx, LANE_READ, { delay: write.arrivalMs + BEAT.afterHop, role: 'storage' });
      lightBoxAt(s.refs.sideBox, ctx, read.arrivalMs);
      ridingLabel(s, ctx, 'read entry', LANE_READ, { delay: write.arrivalMs + BEAT.afterHop });
      pulsePod(s.refs.pod, ctx, read.arrivalMs);
    },
  },
  {
    id: 'reschedule',
    duration: 2800,
    narration: 'The directory belongs to the Node, not the Pod, so deleting the Pod leaves /var/log untouched on Node-1, and here the Pod dims out while the directory stays lit. Schedule a replacement onto another Node and the /var/log it finds there is a different directory that belongs to that Node. The data did not travel. A hostPath volume looks like persistence and is not.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { host: 'stays behind', lives: 'on the old node', exposure: 'one directory' });
      // The exact inversion of emptyDir dies: only the Pod and its mount lanes ghost. The host
      // directory stays at full opacity and lit, because it belongs to the node and outlives the Pod.
      s.refs.hp.classList.add('highlight');
      s.refs.diskLbl.textContent = 'stays on Node-1';
      const GONE = [s.refs.pod, s.refs.wWrite, s.refs.wRead];
      GONE.forEach(el => { el.style.opacity = String(OPACITY.terminated); });
      if (ctx.reduced) return;
      GONE.forEach(el => {
        ctx.register(el.animate([{ opacity: 1 }, { opacity: OPACITY.terminated }], { duration: FADE.out, easing: 'ease-in' }));
      });
    },
  },
  {
    id: 'security',
    duration: 3000,
    narration: 'Point a hostPath at a sensitive path and the risk is plain. Mounting the host root or the container runtime socket gives the Pod control of the Node itself, a container escape. This is why the Baseline and Restricted Pod Security Standards forbid hostPath outright.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { host: 'mounts / (root)', lives: 'on the node', exposure: 'the whole node' });
      // The cylinder now stands for the host root, and the reach into it is what the ball carries.
      setCylinderLabel(s.refs.hp, 'host /');
      s.refs.diskLbl.textContent = 'hands over the node';
      s.refs.appBox.classList.add('highlight');
      if (ctx.reduced) { s.refs.hp.classList.add('highlight'); return; }
      pulsePod(s.refs.pod, ctx, 0);
      // The Pod reaches down into the host root: a pod-to-infra hop, so the shell pulses first and
      // the ball leaves at afterPulse.
      const hpPkt = routePacket(s, ctx, LANE_WRITE, { delay: BEAT.afterPulse, role: 'storage' });
      lightBoxAt(s.refs.hp, ctx, hpPkt.arrivalMs);
      ridingLabel(s, ctx, 'full node access', LANE_WRITE, { delay: BEAT.afterPulse });
    },
  },
  {
    id: 'bridge',
    duration: 3000,
    narration: 'Used narrowly, hostPath is right: a Node agent in a DaemonSet reading /var/log or /proc genuinely needs the host. For an ordinary Pod that wants node-local storage to survive a reschedule, the portable answer is a local PersistentVolume, whose node affinity keeps the Pod pinned to its data. That is where the rest of this category begins.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { host: 'for node agents', lives: 'on the node', exposure: 'one directory' });
      s.refs.hp.classList.add('highlight');
      if (ctx.reduced) { s.refs.sideBox.classList.add('highlight'); return; }
      // The agent reads the node logs: an infra-to-pod hop, so the ball leaves first and the shell
      // pulses when it arrives.
      const read = routePacket(s, ctx, LANE_READ, { role: 'storage' });
      lightBoxAt(s.refs.sideBox, ctx, read.arrivalMs);
      ridingLabel(s, ctx, 'reads node logs', LANE_READ);
      pulsePod(s.refs.pod, ctx, read.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
