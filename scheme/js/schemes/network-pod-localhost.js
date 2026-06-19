import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. An external
// client sits on the left, the Pod shell on the right holds app + sidecar containers up top and
// the shared lo + eth0 down low. Two lanes: the localhost lane (app <-> sidecar, y307) never
// leaves the Pod, and the external lane (client -> eth0, y466) carries outside traffic to the
// shared Pod IP. The Pod is the unit that pulses, the containers and interface boxes are infra
// that light only.
const LOCAL_Y = 307;
const EXT_Y = 466;
const APP_EDGE = 620;
const SIDE_LEFT = 676;
const CLIENT_EDGE = 270;
const ETH0_LEFT = 470;

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, cat: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 34, w: w - 40, h: 52, label: 'client', sublabel: 'eth0', cat: 'network' });
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

    const client = podBlock({ x: 90, y: 398, w: 180, h: 124, label: 'client Pod', ip: '10.244.4.2' });

    const shell = pod({ x: 440, y: 214, w: 400, h: 320, label: 'Pod', sublabel: 'one netns · 10.244.1.5', containers: 0, cat: 'network' });
    const shellRect = shell.querySelector('.scheme-pod-rect');
    if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
    const podGroup = g({});
    podGroup.appendChild(shell);

    const app  = box({ x: 470, y: 278, w: 150, h: 58, label: 'app',     sublabel: ':8080',       cat: 'network' });
    const side = box({ x: 676, y: 278, w: 150, h: 58, label: 'sidecar', sublabel: 'proxy :15001', cat: 'network' });
    const eth0 = box({ x: 470, y: 438, w: 150, h: 56, label: 'eth0', sublabel: '10.244.1.5', cat: 'network' });
    const lo   = box({ x: 676, y: 438, w: 150, h: 56, label: 'lo',   sublabel: '127.0.0.1',  cat: 'network' });

    const localWire = arrow({ x1: APP_EDGE, y1: LOCAL_Y, x2: SIDE_LEFT, y2: LOCAL_Y, dashed: true, dim: true, color: 'network' });
    const extWire   = arrow({ x1: CLIENT_EDGE, y1: EXT_Y, x2: ETH0_LEFT, y2: EXT_Y, dashed: true, dim: true, color: 'network' });
    const localLabel = text({ class: 'scheme-label code dim', x: 648, y: LOCAL_Y - 10, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    const extLabel   = text({ class: 'scheme-label code dim', x: 370, y: EXT_Y - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    const pathChip = valChip({ x: 80,  y: 562, w: 250, h: 34, name: 'path', value: 'idle', cat: 'network' });
    const portChip = valChip({ x: 350, y: 562, w: 250, h: 34, name: 'ports', value: 'shared', cat: 'network' });
    const bindChip = valChip({ x: 620, y: 562, w: 230, h: 34, name: 'bind :8080', value: 'free', cat: 'network' });
    const ipChip   = valChip({ x: 870, y: 562, w: 250, h: 34, name: 'Pod IP', value: '10.244.1.5', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: client + Pod shell + container/interface boxes, then wires + labels above them,
    // then chips, then the packet layer on top.
    root.appendChild(client.group);
    root.appendChild(podGroup);
    [app, side, eth0, lo].forEach(el => root.appendChild(el));
    [localWire, extWire, localLabel, extLabel].forEach(el => root.appendChild(el));
    [pathChip, portChip, bindChip, ipChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, client: client.group, clientBox: client.innerBox, podGroup, app, side, eth0, lo,
      pathChip, portChip, bindChip, ipChip,
      packetLayer, wires: { local: localLabel, ext: extLabel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['app', 'side', 'eth0', 'lo', 'pathChip', 'portChip', 'bindChip', 'ipChip'], [s.refs.client, s.refs.podGroup]);
}

function flashBox(s, ctx, key) {
  if (ctx.reduced) return;
  const el = s.refs[key];
  if (!el) return;
  ctx.register(el.animate(
    [{ filter: 'brightness(1)' }, { filter: 'brightness(1.5)' }, { filter: 'brightness(1)' }],
    { duration: 600, easing: 'ease-out' }
  ));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Pod can run more than one container, and they all join the same network namespace. That means one shared loopback, one shared eth0 and one shared Pod IP across every container in the Pod. The classic case is an app plus a sidecar proxy.',
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
    narration: 'The app talks to its sidecar over 127.0.0.1:15001. Because both containers share the namespace, the call goes through loopback and never touches eth0 or the network. There is no veth hop, no routing, just a loopback delivery inside the Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'local', '127.0.0.1:15001');
      s.refs.app.classList.add('highlight');
      s.refs.pathChip.classList.add('highlight');
      setVal(s.refs.pathChip, 'loopback');
      if (ctx.reduced) { s.refs.side.classList.add('highlight'); s.refs.lo.classList.add('highlight'); return; }
      // localhost hop app -> sidecar, served entirely through loopback, so lo and the sidecar
      // light on arrival.
      const hop = segmentPacket(s, ctx, { from: [APP_EDGE, LOCAL_Y], to: [SIDE_LEFT, LOCAL_Y], cat: 'network' });
      lightBoxAt(s.refs.side, ctx, hop.arrivalMs);
      lightBoxAt(s.refs.lo, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'ports',
    duration: 2400,
    narration: 'Sharing the namespace also means sharing the port space. The sidecar already holds :15001, and if the app tried to bind the same port the kernel would reject it with address already in use. Two containers in one Pod cannot both listen on the same port.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.app.classList.add('highlight');
      s.refs.portChip.classList.add('highlight');
      s.refs.bindChip.classList.add('highlight');
      setVal(s.refs.portChip, 'one space');
      setVal(s.refs.bindChip, 'in use -> reject');
      // Packet-less, pod-less: flash the app box to show the rejected bind attempt. The chips just
      // light, they never blink.
      flashBox(s, ctx, 'app');
    },
  },
  {
    id: 'external',
    duration: 2400,
    narration: 'Traffic from outside still arrives on the single shared eth0 at the Pod IP. Whichever container is listening on the target port answers, here the app on :8080. From the outside the Pod looks like one host with one address, regardless of how many containers run inside.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'ext', 'dst 10.244.1.5:8080');
      s.refs.eth0.classList.add('highlight');
      s.refs.ipChip.classList.add('highlight');
      setVal(s.refs.pathChip, 'eth0');
      setVal(s.refs.bindChip, 'app :8080');
      if (ctx.reduced) { s.refs.clientBox.classList.add('highlight'); s.refs.app.classList.add('highlight'); return; }
      // Up-arrow: the external client pulses first, the packet leaves at BEAT.afterPulse and lands
      // on the shared eth0, which lights on arrival.
      pulsePod(s.refs.client, ctx, 0);
      const hop = segmentPacket(s, ctx, { from: [CLIENT_EDGE, EXT_Y], to: [ETH0_LEFT, EXT_Y], delay: BEAT.afterPulse, cat: 'network' });
      lightBoxAt(s.refs.eth0, ctx, hop.arrivalMs);
      lightBoxAt(s.refs.app, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'recap',
    duration: 2400,
    narration: 'So the network is shared, one IP, one loopback, one port space, while each container keeps its own filesystem and process tree. This is exactly what lets a sidecar proxy intercept the app traffic on localhost without either container leaving the Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.eth0.classList.add('highlight');
      s.refs.lo.classList.add('highlight');
      s.refs.portChip.classList.add('highlight');
      s.refs.ipChip.classList.add('highlight');
      setVal(s.refs.pathChip, 'shared netns');
      setVal(s.refs.portChip, 'one space');
      setVal(s.refs.bindChip, 'per port');
      if (ctx.reduced) return;
      // No new traffic: the Pod itself pulses to mark it as the single shared network unit.
      pulsePod(s.refs.podGroup, ctx, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
