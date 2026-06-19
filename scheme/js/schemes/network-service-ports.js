import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. The flow
// runs left to right along y312, client -> Service -> backend Pod. The port translation happens
// INSIDE the Service box (kube-proxy DNATs port -> targetPort), so the ball fades at one edge and
// re-emerges at the far edge. The Service is infrastructure: it lights, it never pulses. Only
// Pods pulse.
const FLOW_Y = 312;
const CLIENT_EDGE = 260;
const SVC_LEFT = 450;
const SVC_RIGHT = 690;
const POD_LEFT = 900;

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

function podBlock({ x, y, w, h, label, ip, container, port }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, cat: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 34, w: w - 40, h: 52, label: container, sublabel: port, cat: 'network' });
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
      'aria-label': 'Service ports: a client dials the Service port, the stable front-door number, the Service maps it to the Pod targetPort where the container actually listens, and a named targetPort lets each Pod resolve the name to its own container port number so the two ports stay decoupled',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = podBlock({ x: 70, y: 252, w: 190, h: 120, label: 'client Pod', ip: '10.244.1.5', container: 'curl', port: 'web:80' });
    const svc = box({ x: SVC_LEFT, y: 276, w: 240, h: 72, label: 'Service web', sublabel: 'port 80 -> targetPort http', cat: 'network' });
    const podX = podBlock({ x: 900, y: 252, w: 210, h: 120, label: 'Pod web', ip: '10.244.2.7', container: 'http', port: 'containerPort 8080' });

    const cWire = arrow({ x1: CLIENT_EDGE, y1: FLOW_Y, x2: SVC_LEFT, y2: FLOW_Y, dashed: true, dim: true, color: 'network' });
    const pWire = arrow({ x1: SVC_RIGHT, y1: FLOW_Y, x2: POD_LEFT, y2: FLOW_Y, dashed: true, dim: true, color: 'network' });
    const cLabel = text({ class: 'scheme-label code dim', x: 355, y: FLOW_Y - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    const pLabel = text({ class: 'scheme-label code dim', x: 795, y: FLOW_Y - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    const dialChip   = valChip({ x: 80,  y: 560, w: 250, h: 34, name: 'client dials', value: 'web:80', cat: 'network' });
    const portChip   = valChip({ x: 350, y: 560, w: 250, h: 34, name: 'port', value: '80', cat: 'network' });
    const targetChip = valChip({ x: 620, y: 560, w: 250, h: 34, name: 'targetPort', value: 'http', cat: 'network' });
    const contChip   = valChip({ x: 890, y: 560, w: 230, h: 34, name: 'containerPort', value: '8080', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: pods + Service box, then wires + labels above, then chips, then packet layer.
    root.appendChild(svc);
    root.appendChild(client.group);
    root.appendChild(podX.group);
    [cWire, pWire, cLabel, pLabel].forEach(el => root.appendChild(el));
    [dialChip, portChip, targetChip, contChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, svc, client: client.group, clientBox: client.innerBox, podX: podX.group, podXBox: podX.innerBox,
      dialChip, portChip, targetChip, contChip,
      packetLayer, wires: { c: cLabel, p: pLabel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['svc', 'dialChip', 'portChip', 'targetChip', 'contChip'], [s.refs.client, s.refs.podX]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Service has two port numbers that are easy to confuse. The port is what clients dial, the stable front door. The targetPort is where the container actually listens. They do not have to match, and keeping them apart is what lets the front door stay stable while the app moves.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.dialChip, 'web:80');
      setVal(s.refs.portChip, '80');
      setVal(s.refs.targetChip, 'http');
      setVal(s.refs.contChip, '8080');
    },
  },
  {
    id: 'dial',
    duration: 2200,
    narration: 'The client connects to the Service name on port 80. That is the only number it knows. It has no idea what port the container behind the Service is really listening on, and it does not need to.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'c', 'web:80');
      s.refs.dialChip.classList.add('highlight');
      s.refs.portChip.classList.add('highlight');
      setVal(s.refs.portChip, '80');
      if (ctx.reduced) { s.refs.clientBox.classList.add('highlight'); s.refs.svc.classList.add('highlight'); return; }
      // Up-arrow: the client pulses first, the packet leaves at BEAT.afterPulse and reaches the
      // Service, which lights on arrival.
      pulsePod(s.refs.client, ctx, 0);
      const send = segmentPacket(s, ctx, { from: [CLIENT_EDGE, FLOW_Y], to: [SVC_LEFT, FLOW_Y], delay: BEAT.afterPulse, cat: 'network' });
      lightBoxAt(s.refs.svc, ctx, send.arrivalMs);
    },
  },
  {
    id: 'map',
    duration: 2400,
    narration: 'The Service definition maps port 80 to its targetPort. kube-proxy uses that mapping to rewrite the destination port as it DNATs the packet to a backend Pod IP. The port the client used and the port the container listens on are now two independent values joined only by this rule.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.svc.classList.add('highlight');
      s.refs.portChip.classList.add('highlight');
      s.refs.targetChip.classList.add('highlight');
      setVal(s.refs.portChip, '80');
      setVal(s.refs.targetChip, 'http');
      // Packet-less, pod-less: flash the Service box where the port translation lives. Chips light
      // only, they never blink.
      flashBox(s, ctx, 'svc');
    },
  },
  {
    id: 'named',
    duration: 2600,
    narration: 'Here the targetPort is the name http rather than a number. Each Pod resolves that name to its own containerPort, so different Pods could expose http on different numbers and the Service still finds the right one. The packet is delivered to the container on its real listening port, 8080.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'p', 'http -> 8080');
      s.refs.targetChip.classList.add('highlight');
      s.refs.contChip.classList.add('highlight');
      setVal(s.refs.targetChip, 'http');
      setVal(s.refs.contChip, '8080');
      if (ctx.reduced) { s.refs.podXBox.classList.add('highlight'); return; }
      // The packet emerges from the Service (DNAT done inside) and is delivered to the backend Pod,
      // which pulses on arrival.
      const give = segmentPacket(s, ctx, { from: [SVC_RIGHT, FLOW_Y], to: [POD_LEFT, FLOW_Y], cat: 'network' });
      pulsePod(s.refs.podX, ctx, give.arrivalMs);
    },
  },
  {
    id: 'recap',
    duration: 2400,
    narration: 'So the client dials 80, the container listens on 8080, and the Service quietly bridges the two. Change the container port and you only update targetPort, every client keeps dialing the same stable Service port.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.dialChip.classList.add('highlight');
      s.refs.contChip.classList.add('highlight');
      setVal(s.refs.dialChip, 'web:80');
      setVal(s.refs.contChip, '8080');
      if (ctx.reduced) return;
      // No new traffic: the backend Pod pulses to mark where the real listening port lives.
      pulsePod(s.refs.podX, ctx, 0);
    },
  },
];

function flashBox(s, ctx, key) {
  if (ctx.reduced) return;
  const el = s.refs[key];
  if (!el) return;
  ctx.register(el.animate(
    [{ filter: 'brightness(1)' }, { filter: 'brightness(1.5)' }, { filter: 'brightness(1)' }],
    { duration: 600, easing: 'ease-out' }
  ));
}

export const init = makeInit(Scene, STEPS, { posterFirst: true });
