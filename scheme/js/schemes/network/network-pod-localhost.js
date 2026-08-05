import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, pod, arrow } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, routePacket, routeDur, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt, makeRidingLabel} from '../../lib/network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-pod-localhost


const SHELL_X = 620, SHELL_Y = 174, SHELL_W = 500, SHELL_H = 320;  // [620..1120] spans the bind + Pod IP chips
const SHELL_CY = SHELL_Y + SHELL_H / 2;                            // 334
const CLIENT_W = 180, CLIENT_H = 124;
const CLIENT_X = 115;                                              // centre 205 == path chip centre
const CLIENT_Y = SHELL_CY - CLIENT_H / 2;                          // 272, centred on the shell
const CLIENT_EDGE = CLIENT_X + CLIENT_W;                           // 295, client right edge

// Symmetric 2x2 interior grid, centred in the wider shell. The inner block size is unchanged
// (BW/BH); only the columns spread out, to equal 70px side margins and an 80px centre gap.
const BW = 140, BH = 56;
const COL_L = SHELL_X + 70, COL_R = SHELL_X + 290;                 // 690, 910
const ROW_TOP = SHELL_Y + 60, ROW_BOT = SHELL_Y + 210;            // 234, 384
const LOCAL_Y = ROW_TOP + BH / 2;                                 // 262, app <-> sidecar lane
const APP_EDGE = COL_L + BW;                                       // 975, app right edge
const SIDE_LEFT = COL_R;                                           // 1015, sidecar left edge
const GRID_MID_X = (COL_L + COL_R + BW) / 2;                       // 995, midpoint of the app/sidecar pair

const EXT_PATH = [[CLIENT_EDGE, SHELL_CY], [SHELL_X, SHELL_CY]];

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'network', dy: -15, inMs: 160, outMs: 200, hold: 260 });

function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, role: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 34, w: w - 40, h: 52, label: 'Client', sublabel: 'eth0', role: 'network' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
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
      'aria-label': 'Containers in a Pod share localhost: every container joins the same network namespace, so app and sidecar reach each other over 127.0.0.1 with no network hop and share one port space, while outside traffic still arrives on the single shared eth0 and Pod IP',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = podBlock({ x: CLIENT_X, y: CLIENT_Y, w: CLIENT_W, h: CLIENT_H, label: 'Client Pod', ip: '10.244.4.2' });

    const shell = pod({ x: SHELL_X, y: SHELL_Y, w: SHELL_W, h: SHELL_H, label: 'Pod', sublabel: 'one netns · 10.244.1.5', containers: 0, role: 'network' });
    const shellRect = shell.querySelector('.scheme-pod-rect');
    if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
    const podGroup = g({});
    podGroup.appendChild(shell);

    const app  = box({ x: COL_L, y: ROW_TOP, w: BW, h: BH, label: 'app',     sublabel: ':8080',       role: 'network' });
    const side = box({ x: COL_R, y: ROW_TOP, w: BW, h: BH, label: 'sidecar', sublabel: 'proxy :15001', role: 'network' });
    const eth0 = box({ x: COL_L, y: ROW_BOT, w: BW, h: BH, label: 'eth0', sublabel: '10.244.1.5', role: 'network' });
    const lo   = box({ x: COL_R, y: ROW_BOT, w: BW, h: BH, label: 'lo',   sublabel: '127.0.0.1',  role: 'network' });

    const localWire = arrow({ x1: APP_EDGE, y1: LOCAL_Y, x2: SIDE_LEFT, y2: LOCAL_Y, dashed: true, dim: true, role: 'network' });
    const extWire   = arrow({ x1: CLIENT_EDGE, y1: SHELL_CY, x2: SHELL_X, y2: SHELL_CY, dashed: true, dim: true, role: 'network' });
    // localhost label rides ABOVE the two containers (the 40px lane between them is too narrow for
    // the full address), so it never overlaps app or sidecar. The external dst rides on the ball.
    const localLabel = text({ class: 'scheme-label code dim', x: GRID_MID_X, y: ROW_TOP - 18, 'text-anchor': 'middle' }, [' ']);

    const pathChip = valChip({ x: 80,  y: 530, w: 250, h: 34, name: 'path', value: 'idle', role: 'network' });
    const portChip = valChip({ x: 350, y: 530, w: 250, h: 34, name: 'ports', value: 'shared', role: 'network' });
    const bindChip = valChip({ x: 620, y: 530, w: 230, h: 34, name: 'bind', value: 'free', role: 'network' });
    const ipChip   = valChip({ x: 870, y: 530, w: 250, h: 34, name: 'Pod IP', value: '10.244.1.5', role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: client + Pod shell + container/interface boxes, then wires + label above them,
    // then chips, then the packet layer on top.
    root.appendChild(client.group);
    // The four boxes drawn inside the Pod go INSIDE its group, so the pulse reaches them: a Pod
    // blinks as one thing and everything drawn inside it blinks with it (2026-07-29).
    [app, side, eth0, lo].forEach(el => podGroup.appendChild(el));
    root.appendChild(podGroup);
    [localWire, extWire, localLabel].forEach(el => root.appendChild(el));
    [pathChip, portChip, bindChip, ipChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, client: client.group, clientBox: client.innerBox, podGroup, app, side, eth0, lo,
      pathChip, portChip, bindChip, ipChip,
      packetLayer, wires: { local: localLabel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['clientBox', 'app', 'side', 'eth0', 'lo', 'pathChip', 'portChip', 'bindChip', 'ipChip'], [s.refs.client, s.refs.podGroup]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.pathChip, 'idle');
      setVal(s.refs.portChip, 'shared');
      setVal(s.refs.bindChip, 'free');
      setVal(s.refs.ipChip, '10.244.1.5');
    },
  },
  {
    id: 'localhost',
    duration: 2300,
    narration: 'The app talks to its sidecar over 127.0.0.1:15001. Because both containers share the namespace, the call goes through the loopback interface lo and never touches eth0 or the network. There is no veth hop, no routing, just a loopback delivery inside the Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'local', '127.0.0.1:15001');
      s.refs.app.classList.add('highlight');
      s.refs.pathChip.classList.add('highlight');
      setVal(s.refs.pathChip, 'loopback via lo');
      if (ctx.reduced) { s.refs.side.classList.add('highlight'); s.refs.lo.classList.add('highlight'); return; }
      // localhost hop app -> sidecar, served entirely through loopback, so lo and the sidecar
      // light on arrival.
      const hop = segmentPacket(s, ctx, { from: [APP_EDGE, LOCAL_Y], to: [SIDE_LEFT, LOCAL_Y], role: 'network' });
      lightBoxAt(s.refs.side, ctx, hop.arrivalMs);
      lightBoxAt(s.refs.lo, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'ports',
    duration: 2400,
    narration: 'Sharing the namespace also means sharing the port space. The sidecar already holds :15001, and if the app tried to bind that same port the kernel would reject it with address already in use. Two containers in one Pod cannot both listen on the same port.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // The sidecar owns :15001, so it stays lit as the holder alongside the app that is refused
      // the same port. This is a static conflict state, no motion (nothing pulses).
      s.refs.side.classList.add('highlight');
      s.refs.app.classList.add('highlight');
      s.refs.portChip.classList.add('highlight');
      s.refs.bindChip.classList.add('highlight');
      setVal(s.refs.portChip, 'one space');
      setVal(s.refs.bindChip, ':15001 in use');
    },
  },
  {
    id: 'external',
    duration: 2600,
    narration: 'Traffic from outside still arrives on the single shared eth0 at the Pod IP. Whichever container is listening on the target port answers, here the app on :8080. From the outside the Pod looks like one host with one address, regardless of how many containers run inside.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.ipChip.classList.add('highlight');
      setVal(s.refs.pathChip, 'eth0');
      s.refs.pathChip.classList.add('highlight');
      setVal(s.refs.bindChip, 'app :8080');
      s.refs.bindChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.clientBox.classList.add('highlight'); s.refs.eth0.classList.add('highlight'); s.refs.app.classList.add('highlight'); return; }
      pulsePod(s.refs.client, ctx, 0);
      const dur = routeDur(EXT_PATH);
      const hop = routePacket(s, ctx, EXT_PATH, { delay: BEAT.afterPulse, role: 'network' });
      ridingLabel(s, ctx, 'dst 10.244.1.5:8080', EXT_PATH, { delay: BEAT.afterPulse, dur });
      pulsePod(s.refs.podGroup, ctx, hop.arrivalMs);
      lightBoxAt(s.refs.eth0, ctx, hop.arrivalMs);
      lightBoxAt(s.refs.app, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'recap',
    duration: 2400,
    narration: 'So the network is shared, one IP, one loopback, one port space, while each container keeps its own filesystem and process tree. This is exactly what lets a sidecar proxy intercept the app traffic on localhost without either container leaving the Pod.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.eth0.classList.add('highlight');
      s.refs.lo.classList.add('highlight');
      s.refs.portChip.classList.add('highlight');
      s.refs.ipChip.classList.add('highlight');
      setVal(s.refs.pathChip, 'shared netns');
      s.refs.pathChip.classList.add('highlight');
      setVal(s.refs.portChip, 'one space');
      setVal(s.refs.bindChip, 'per port');
      s.refs.bindChip.classList.add('highlight');
      // Static summary: the shared eth0 and lo both stay lit, no motion.
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
