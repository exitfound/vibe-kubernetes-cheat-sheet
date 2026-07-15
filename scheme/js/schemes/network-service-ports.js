import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow, animateAlong } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, routeDur, makeInit, clearHighlights, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. One straight
// left-to-right flow along FLOW_Y, client Pod -> Service -> backend Pod, so every hop is a crisp
// horizontal segmentPacket (linear). The port translation happens INSIDE the Service box: kube-proxy
// DNATs port -> targetPort, so the ball fades in at the Service left edge on the dial hop, the map
// step flashes the box where the rewrite lives, then the ball re-emerges from the Service right edge
// on the deliver hop. The Service is infrastructure: it lights on packet arrival (lightBoxAt), it
// never pulses. Only Pods pulse. This card is a one-way flow (no reply is shown), so there is no
// return lane. The two values that travel do not sit as static wire text: they ride ON the ball
// (ridingLabel). The client dials web:80 on the dial hop, and the named-port resolution http -> 8080
// rides on the deliver hop. The chip strip below tracks the four port numbers as fixed facts.
const FLOW_Y = 312;                 // shared vertical center of both Pods and the Service box
const CLIENT_EDGE = 270;            // right edge of the Client Pod shell
const SVC_LEFT = 470;               // Service centered between the two Pods: equal 200px hops each side
const SVC_RIGHT = 710;
const POD_LEFT = 910;               // left edge of the backend Pod shell
// Each hop is a two-point straight path. The same array feeds both the ball and its riding label so
// the tag stays locked to the ball. Both ends sit at block edges so the ball never travels under a box.
const DIAL_PATH = [[CLIENT_EDGE, FLOW_Y], [SVC_LEFT, FLOW_Y]];      // client -> Service (up-arrow)
const DELIVER_PATH = [[SVC_RIGHT, FLOW_Y], [POD_LEFT, FLOW_Y]];     // Service -> backend Pod (down-arrow)

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// A small label that rides ALONG with the ball on the same path, timing and easing, tagging it with
// the port value the step narrates. It lives in the packet layer but is not a .scheme-packet, so it
// does not count as a packet to the tools. dur omitted => routeDur(points), matching a ball that also
// omits dur. Pass easing:'linear' for straight segmentPacket hops so the tag stays locked to the
// linear ball.
function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'ease-in-out' } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: -14, 'text-anchor': 'middle', 'data-cat': 'network' }, [txt]);
  lbl.style.opacity = '0';
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 160, fill: 'forwards', easing: 'ease-in' }));
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

    const client = podBlock({ x: 80, y: 252, w: 190, h: 120, label: 'Client Pod', ip: '10.244.1.5', container: 'curl', port: 'web:80' });
    const svc = box({ x: SVC_LEFT, y: 276, w: 240, h: 72, label: 'Service web', sublabel: 'port 80 -> targetPort http', cat: 'network' });
    const podX = podBlock({ x: POD_LEFT, y: 252, w: 210, h: 120, label: 'Pod web', ip: '10.244.2.7', container: 'http', port: 'containerPort 8080' });

    const cWire = arrow({ x1: CLIENT_EDGE, y1: FLOW_Y, x2: SVC_LEFT, y2: FLOW_Y, dashed: true, dim: true, color: 'network' });
    const pWire = arrow({ x1: SVC_RIGHT, y1: FLOW_Y, x2: POD_LEFT, y2: FLOW_Y, dashed: true, dim: true, color: 'network' });

    const dialChip   = valChip({ x: 80,  y: 560, w: 250, h: 34, name: 'client dials', value: 'web:80', cat: 'network' });
    const portChip   = valChip({ x: 350, y: 560, w: 250, h: 34, name: 'port', value: '80', cat: 'network' });
    const targetChip = valChip({ x: 620, y: 560, w: 250, h: 34, name: 'targetPort', value: 'http', cat: 'network' });
    const contChip   = valChip({ x: 890, y: 560, w: 230, h: 34, name: 'containerPort', value: '8080', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: pods + Service box, then the dashed wires above them, then chips, then the packet
    // layer (ball + riding label) on top.
    root.appendChild(svc);
    root.appendChild(client.group);
    root.appendChild(podX.group);
    [cWire, pWire].forEach(el => root.appendChild(el));
    [dialChip, portChip, targetChip, contChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, svc, client: client.group, clientBox: client.innerBox, podX: podX.group, podXBox: podX.innerBox,
      dialChip, portChip, targetChip, contChip,
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['svc', 'clientBox', 'podXBox', 'dialChip', 'portChip', 'targetChip', 'contChip'], [s.refs.client, s.refs.podX]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Service has two port numbers that are easy to confuse. The port is what clients dial, the stable front door. The targetPort is where the container actually listens. They do not have to match, and keeping them apart is what lets the front door stay stable while the app moves.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
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
      s.refs.dialChip.classList.add('highlight');
      s.refs.portChip.classList.add('highlight');
      setVal(s.refs.portChip, '80');
      if (ctx.reduced) { s.refs.clientBox.classList.add('highlight'); s.refs.svc.classList.add('highlight'); return; }
      // Up-arrow: the client pulses first, the packet leaves at BEAT.afterPulse and rides one straight
      // hop into the Service, which lights on arrival. The dialed address web:80 rides with the ball.
      pulsePod(s.refs.client, ctx, 0);
      const send = segmentPacket(s, ctx, { from: DIAL_PATH[0], to: DIAL_PATH[1], delay: BEAT.afterPulse, cat: 'network' });
      ridingLabel(s, ctx, 'dst web:80', DIAL_PATH, { delay: BEAT.afterPulse, easing: 'linear' });
      lightBoxAt(s.refs.svc, ctx, send.arrivalMs);
    },
  },
  {
    id: 'map',
    duration: 2400,
    narration: 'The Service definition maps port 80 to its targetPort. kube-proxy uses that mapping to rewrite the destination port as it DNATs the packet to a backend Pod IP. The port the client used and the port the container listens on are now two independent values joined only by this rule.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      // Packet-less, pod-less: the Service box lights via .highlight where the port translation lives.
      // Blocks light, they never blink. Only Pods pulse.
      s.refs.svc.classList.add('highlight');
      s.refs.portChip.classList.add('highlight');
      s.refs.targetChip.classList.add('highlight');
      setVal(s.refs.portChip, '80');
      setVal(s.refs.targetChip, 'http');
    },
  },
  {
    id: 'named',
    duration: 2600,
    narration: 'Here the targetPort is the name http rather than a number. Each Pod resolves that name to its own containerPort, so different Pods could expose http on different numbers and the Service still finds the right one. The packet is delivered to the container on its real listening port, 8080.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.targetChip.classList.add('highlight');
      s.refs.contChip.classList.add('highlight');
      setVal(s.refs.targetChip, 'http');
      setVal(s.refs.contChip, '8080');
      if (ctx.reduced) { s.refs.podXBox.classList.add('highlight'); return; }
      // Down-arrow: the packet re-emerges from the Service right edge (DNAT done inside) and is
      // delivered to the backend Pod, which pulses on arrival. The resolved named port http -> 8080
      // rides with the ball.
      const give = segmentPacket(s, ctx, { from: DELIVER_PATH[0], to: DELIVER_PATH[1], cat: 'network' });
      ridingLabel(s, ctx, 'http -> 8080', DELIVER_PATH, { easing: 'linear' });
      pulsePod(s.refs.podX, ctx, give.arrivalMs);
    },
  },
  {
    id: 'recap',
    duration: 2400,
    narration: 'So the client dials 80, the container listens on 8080, and the Service quietly bridges the two. The container port can move behind the Service without the client noticing, because it always keeps dialing the same stable Service port.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
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

export const init = makeInit(Scene, STEPS, { posterFirst: true });
