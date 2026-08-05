import { svg, g } from '../../lib/svg.js';
import { arrowDefs, box, arrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, BEAT, lightBoxAt, makeRidingLabel } from './network-kit.js';
// Design notes for this card: ./CARDS.md#network-service-ports


const FLOW_Y = 312;                 // shared vertical center of both Pods and the Service box
const CLIENT_EDGE = 270;            // right edge of the Client Pod shell
const SVC_LEFT = 470;               // Service centered between the two Pods: equal 200px hops each side
const SVC_RIGHT = 710;
const POD_LEFT = 910;               // left edge of the backend Pod shell
// Each hop is a two-point straight path. The same array feeds both the ball and its riding label so
// the tag stays locked to the ball. Both ends sit at block edges so the ball never travels under a box.
const DIAL_PATH = [[CLIENT_EDGE, FLOW_Y], [SVC_LEFT, FLOW_Y]];      // client -> Service (up-arrow)
const DELIVER_PATH = [[SVC_RIGHT, FLOW_Y], [POD_LEFT, FLOW_Y]];     // Service -> backend Pod (down-arrow)

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'network' });

function podBlock({ x, y, w, h, label, ip, container, port }) {
  const shell = podShell({ x, y, w, h, label, sublabel: ip, containers: 0, role: 'network' });
  const innerBox = box({ x: x + 20, y: y + 34, w: w - 40, h: 52, label: container, sublabel: port, role: 'network' });
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
    const svc = box({ x: SVC_LEFT, y: 276, w: 240, h: 72, label: 'Service web', sublabel: 'port 80 -> targetPort http', role: 'network' });
    const podX = podBlock({ x: POD_LEFT, y: 252, w: 210, h: 120, label: 'Pod web', ip: '10.244.2.7', container: 'http', port: 'containerPort 8080' });

    const cWire = arrow({ x1: CLIENT_EDGE, y1: FLOW_Y, x2: SVC_LEFT, y2: FLOW_Y, dashed: true, dim: true, role: 'network' });
    const pWire = arrow({ x1: SVC_RIGHT, y1: FLOW_Y, x2: POD_LEFT, y2: FLOW_Y, dashed: true, dim: true, role: 'network' });

    const dialChip   = valChip({ x: 80,  y: 560, w: 250, h: 34, name: 'client dials', value: 'web:80', role: 'network' });
    const portChip   = valChip({ x: 350, y: 560, w: 250, h: 34, name: 'port', value: '80', role: 'network' });
    const targetChip = valChip({ x: 620, y: 560, w: 250, h: 34, name: 'targetPort', value: 'http', role: 'network' });
    const contChip   = valChip({ x: 890, y: 560, w: 230, h: 34, name: 'containerPort', value: '8080', role: 'network' });

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
      const send = segmentPacket(s, ctx, { from: DIAL_PATH[0], to: DIAL_PATH[1], delay: BEAT.afterPulse, role: 'network' });
      ridingLabel(s, ctx, 'dst web:80', DIAL_PATH, { delay: BEAT.afterPulse, easing: 'linear' });
      lightBoxAt(s.refs.svc, ctx, send.arrivalMs);
    },
  },
  {
    id: 'map',
    duration: 2400,
    narration: 'The Service definition maps port 80 to its targetPort. That mapping becomes a DNAT rule on the Node, written by kube-proxy, so the destination port is rewritten as the packet goes to a backend Pod IP. The port the client used and the port the container listens on are now two independent values joined only by this rule.',
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
      const give = segmentPacket(s, ctx, { from: DELIVER_PATH[0], to: DELIVER_PATH[1], role: 'network' });
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
