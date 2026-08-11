import { P, F, defineCard, BEAT } from './network-kit.js';

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

const POD_TOP = 252, POD_H = 120;
const CLIENT_W = 190, BACKEND_W = 210;
const POD_INNER = { dx: 20, dy: 34, h: 52 };
const CHIP_Y = 560, CHIP_H = 34;

// The list order IS the append order, which is the z-order: the Service box and both Pods, then the
// dashed wires above them, then the chips, then the packet layer carrying the ball and its tag on top.
export const SCENE = {
  'aria-label': 'Service ports: a client dials the Service port, the stable front-door number, the Service maps it to the Pod targetPort where the container actually listens, and a named targetPort lets each Pod resolve the name to its own container port number so the two ports stay decoupled',
  parts: [
    P.defs(),
    P.box({ key: 'svc', x: SVC_LEFT, y: 276, w: 240, h: 72, label: 'Service web', sublabel: 'port 80 -> targetPort http' }),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: 80, y: POD_TOP, w: CLIENT_W, h: POD_H,
      label: 'Client Pod', sublabel: '10.244.1.5',
      inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: CLIENT_W - POD_INNER.dx * 2, h: POD_INNER.h, label: 'curl', sublabel: 'web:80' },
    }),
    P.pod({
      key: 'podX', innerKey: 'podXBox', x: POD_LEFT, y: POD_TOP, w: BACKEND_W, h: POD_H,
      label: 'Pod web', sublabel: '10.244.2.7',
      inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: BACKEND_W - POD_INNER.dx * 2, h: POD_INNER.h, label: 'http', sublabel: 'containerPort 8080' },
    }),
    P.arrow({ x1: CLIENT_EDGE, y1: FLOW_Y, x2: SVC_LEFT, y2: FLOW_Y, dashed: true, dim: true }),
    P.arrow({ x1: SVC_RIGHT, y1: FLOW_Y, x2: POD_LEFT, y2: FLOW_Y, dashed: true, dim: true }),
    P.chip({ key: 'dialChip', x: 80, y: CHIP_Y, w: 250, h: CHIP_H, name: 'client dials', value: 'web:80' }),
    P.chip({ key: 'portChip', x: 350, y: CHIP_Y, w: 250, h: CHIP_H, name: 'port', value: '80' }),
    P.chip({ key: 'targetChip', x: 620, y: CHIP_Y, w: 250, h: CHIP_H, name: 'targetPort', value: 'http' }),
    P.chip({ key: 'contChip', x: 890, y: CHIP_Y, w: 230, h: CHIP_H, name: 'containerPort', value: '8080' }),
    P.packets(),
  ],
  reset: {
    keys: ['svc', 'clientBox', 'podXBox', 'dialChip', 'portChip', 'targetChip', 'contChip'],
    pods: ['client', 'podX'],
  },
};

// The four port numbers are fixed facts of this card: every step states all four, so none of them
// can be inherited from a step the reader did not see.
const PORTS = { dialChip: 'web:80', portChip: '80', targetChip: 'http', contChip: '8080' };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: PORTS,
  },
  {
    id: 'dial',
    duration: 2200,
    narration: 'The client connects to the Service name on port 80. That is the only number it knows. It has no idea what port the container behind the Service is really listening on, and it does not need to.',
    chips: PORTS,
    lit: ['dialChip', 'portChip'],
    // The animated path says the client DIALED by pulsing it, which no lights list can name.
    reducedLit: ['clientBox'],
    // Up-arrow: the client pulses first, the packet leaves at BEAT.afterPulse and rides one straight
    // hop into the Service, which lights on arrival. The dialed address web:80 rides with the ball.
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: DIAL_PATH[0], to: DIAL_PATH[1], delay: BEAT.afterPulse, name: 'send' }),
      F.tag({ text: 'dst web:80', points: DIAL_PATH, delay: BEAT.afterPulse, easing: 'linear' }),
      F.light({ targets: ['svc'], at: 'send' }),
    ],
  },
  {
    id: 'map',
    duration: 2400,
    narration: 'The Service definition maps port 80 to its targetPort. That mapping becomes a DNAT rule on the Node, written by kube-proxy, so the destination port is rewritten as the packet goes to a backend Pod IP. The port the client used and the port the container listens on are now two independent values joined only by this rule.',
    chips: PORTS,
    // Packet-less, pod-less: the Service box lights via .highlight where the port translation lives.
    // Blocks light, they never blink. Only Pods pulse.
    lit: ['svc', 'portChip', 'targetChip'],
  },
  {
    id: 'named',
    duration: 2600,
    narration: 'Here the targetPort is the name http rather than a number. Each Pod resolves that name to its own containerPort, so different Pods could expose http on different numbers and the Service still finds the right one. The packet is delivered to the container on its real listening port, 8080.',
    chips: PORTS,
    lit: ['targetChip', 'contChip'],
    // Nothing lights on arrival here, so the static path has no cue to inherit: the backend Pod
    // PULSES to say it was served, and only the inner box can say that without motion.
    reducedLit: ['podXBox'],
    flow: [
      F.segment({ from: DELIVER_PATH[0], to: DELIVER_PATH[1], name: 'give' }),
      F.tag({ text: 'http -> 8080', points: DELIVER_PATH, easing: 'linear' }),
      F.pulse({ pod: 'podX', at: 'give' }),
    ],
  },
  {
    id: 'recap',
    duration: 2400,
    narration: 'So the client dials 80, the container listens on 8080, and the Service quietly bridges the two. The container port can move behind the Service without the client noticing, because it always keeps dialing the same stable Service port.',
    chips: PORTS,
    lit: ['dialChip', 'contChip'],
    // No new traffic: the backend Pod pulses to mark where the real listening port lives.
    flow: [F.pulse({ pod: 'podX' })],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
