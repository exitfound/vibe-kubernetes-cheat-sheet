import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/network-kit.js';

// Gateway API (viewBox 1200x640): GatewayClass -> Gateway -> HTTPRoute -> Service -> Pod, a clean
// vertical stack owned by different roles, with a live request flowing down it. Standard contract:
// the Pod is a shell + inner box; only the Pod pulses; value chips never flash; a packet-less
// pod-less step gets one box flash; packets ride the wires and stop at block edges.
function flashBox(s, ctx, key) {
  if (ctx.reduced) return;
  const el = s.refs[key];
  if (!el) return;
  ctx.register(el.animate(
    [{ filter: 'brightness(1)' }, { filter: 'brightness(1.5)' }, { filter: 'brightness(1)' }],
    { duration: 600, easing: 'ease-out' }
  ));
}
function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, cat: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 32, w: w - 40, h: 50, label: 'app', sublabel: 'eth0', cat: 'network' });
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
      'aria-label': 'Gateway API: a GatewayClass names the controller, a Gateway owned by cluster operators declares listeners, and an HTTPRoute owned by app teams attaches with host and path rules and backendRefs to a Service',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const gwClass = box({ x: 360, y: 56,  w: 380, h: 72, label: 'GatewayClass: nginx', sublabel: 'controller implementation', cat: 'network' });
    const gw      = box({ x: 360, y: 192, w: 380, h: 84, label: 'Gateway', sublabel: 'listener :443 HTTPS', cat: 'network' });
    const route   = box({ x: 360, y: 336, w: 380, h: 84, label: 'HTTPRoute', sublabel: 'shop.io/ -> backendRefs', cat: 'network' });
    const svc     = box({ x: 410, y: 456, w: 280, h: 64, label: 'Service web', sublabel: '', cat: 'network' });
    const podW    = podBlock({ x: 850, y: 430, w: 210, h: 116, label: 'Pod web', ip: '10.244.1.5' });

    const linkClass = arrow({ x1: 550, y1: 128, x2: 550, y2: 192, dashed: true, dim: true, color: 'network' });
    const linkRoute = arrow({ x1: 550, y1: 276, x2: 550, y2: 336, dashed: true, dim: true, color: 'network' });
    const linkSvc   = arrow({ x1: 550, y1: 420, x2: 550, y2: 456, dashed: true, dim: true, color: 'network' });
    const linkPod   = arrow({ x1: 690, y1: 488, x2: 850, y2: 488, dashed: true, dim: true, color: 'network' });
    const entryWire = arrow({ x1: 220, y1: 234, x2: 360, y2: 234, dashed: true, dim: true, color: 'network' });
    const wireLabel = text({ class: 'scheme-label code dim', x: 255, y: 222, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    const roleA = text({ class: 'scheme-label code dim', x: 770, y: 96,  'text-anchor': 'start', 'font-size': 11 }, ['owned by: infra provider']);
    const roleB = text({ class: 'scheme-label code dim', x: 770, y: 238, 'text-anchor': 'start', 'font-size': 11 }, ['owned by: cluster operator']);
    const roleC = text({ class: 'scheme-label code dim', x: 770, y: 382, 'text-anchor': 'start', 'font-size': 11 }, ['owned by: app team']);

    const listenerChip = valChip({ x: 80,  y: 552, w: 280, h: 34, name: 'listener', value: ':443 HTTPS', cat: 'network' });
    const matchChip    = valChip({ x: 380, y: 552, w: 250, h: 34, name: 'match', value: 'shop.io /', cat: 'network' });
    const backendChip  = valChip({ x: 650, y: 552, w: 270, h: 34, name: 'backendRefs', value: 'Service web', cat: 'network' });
    const statusChip   = valChip({ x: 940, y: 552, w: 180, h: 34, name: 'API', value: 'GA v1', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    root.appendChild(gwClass);
    root.appendChild(gw);
    root.appendChild(route);
    root.appendChild(svc);
    root.appendChild(podW.group);
    [linkClass, linkRoute, linkSvc, linkPod, entryWire, wireLabel, roleA, roleB, roleC].forEach(el => root.appendChild(el));
    [listenerChip, matchChip, backendChip, statusChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, gwClass, gw, route, svc, podW: podW.group, podWBox: podW.innerBox,
      listenerChip, matchChip, backendChip, statusChip,
      packetLayer, wires: { w: wireLabel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['gwClass', 'gw', 'route', 'svc', 'listenerChip', 'matchChip', 'backendChip', 'statusChip'], [s.refs.podW]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'The Gateway API is the successor to Ingress, and its big idea is to split ingress into separate objects owned by separate teams. Three resources stack up, each one the responsibility of a different role.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.statusChip, 'GA v1');
    },
  },
  {
    id: 'gatewayclass',
    duration: 2100,
    narration: 'At the base, a GatewayClass names which controller implementation will serve Gateways of this class, much like a StorageClass names a provisioner. It is installed by the infrastructure provider and rarely touched after that.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.gwClass.classList.add('highlight');
      // Packet-less step, no Pod: a single box flash.
      flashBox(s, ctx, 'gwClass');
    },
  },
  {
    id: 'gateway',
    duration: 2300,
    narration: 'A Gateway references that class and declares the actual listeners: which ports, protocols and TLS the cluster will accept traffic on, here HTTPS on 443. This is owned by the cluster operator, who controls the entry points without deciding what routes through them.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.gw.classList.add('highlight');
      s.refs.listenerChip.classList.add('highlight');
      if (ctx.reduced) return;
      // The Gateway references the class: a clean hop down between the two boxes.
      segmentPacket(s, ctx, { from: [550, 128], to: [550, 192], cat: 'network' });
    },
  },
  {
    id: 'httproute',
    duration: 2400,
    narration: 'An HTTPRoute attaches to the Gateway and holds the routing rules: match shop.io and the path, then send to a backendRef, which is a Service. This is owned by the application team, so developers manage their own routing without needing rights on the shared Gateway.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.route.classList.add('highlight');
      s.refs.matchChip.classList.add('highlight');
      s.refs.backendChip.classList.add('highlight');
      if (ctx.reduced) return;
      segmentPacket(s, ctx, { from: [550, 276], to: [550, 336], cat: 'network' });
    },
  },
  {
    id: 'request',
    duration: 2700,
    narration: 'A live request now flows through the whole stack. It arrives on the Gateway listener, the controller matches it against the HTTPRoute rule, follows the backendRef to Service web, and lands on a Ready Pod. Cross-namespace references add a ReferenceGrant, but the path is otherwise this clean chain.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'w', 'GET shop.io/');
      s.refs.gw.classList.add('highlight');
      s.refs.route.classList.add('highlight');
      s.refs.svc.classList.add('highlight');
      if (ctx.reduced) { s.refs.podWBox.classList.add('highlight'); return; }
      // The request walks the stack, each hop stopping at a block edge, then pulses the Pod.
      const inb = segmentPacket(s, ctx, { from: [220, 234], to: [360, 234], cat: 'network' });
      const toRoute = segmentPacket(s, ctx, { from: [550, 276], to: [550, 336], delay: inb.arrivalMs + BEAT.afterHop, cat: 'network' });
      const toSvc = segmentPacket(s, ctx, { from: [550, 420], to: [550, 456], delay: toRoute.arrivalMs + BEAT.afterHop, cat: 'network' });
      const toPod = segmentPacket(s, ctx, { from: [690, 488], to: [850, 488], delay: toSvc.arrivalMs + BEAT.afterHop, cat: 'network' });
      pulsePod(s.refs.podW, ctx, toPod.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
