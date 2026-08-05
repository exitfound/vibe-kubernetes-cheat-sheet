import { svg, g, rect, text } from '../../lib/svg.js';
import { arrowDefs, node, box, chainList, setChainActive, pathArrow, podShell } from '../../lib/primitives.js';
import { routePacket, valChip, setVal, pulsePod, pulsePodDim, setConnectorDir, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT, lightBoxAt, OPACITY, WL } from './workloads-kit.js';

// Layout A on the Workloads canon (WL in the kit): ladder left, chip column right, Node frame
// full width at the bottom. Panel measured at x<=397, y<=255 (worst of 1600/1440/1280/1100).
const PANEL_B = 255, PANEL_GAP = 21;
const TOP_W = 280, TOP_X = WL.CX - TOP_W / 2;            // 460..740, centred on CX

// Both columns start on the same line, one panel gap below the panel bottom.
const BAND_Y = PANEL_B + PANEL_GAP;                      // 276
const LAD_X = WL.LADDER_X, LAD_W = WL.LADDER_W;          // 60..540, the pipeline
const LAD_Y = BAND_Y;                                    // 5 rows -> 276..476

// Chips stack in the right column, clear of the panel by construction.
const CHIP_VGAP = 8;
const CHIP_Y = i => BAND_Y + i * (WL.CHIP_H + CHIP_VGAP);

const NODE_Y = 496, NODE_H = 128;                        // 496..624
const POD_W = 460, POD_H = 96, POD_X = WL.CX - POD_W / 2;
const POD_Y = NODE_Y + 22;                               // 518..614
const CONT_W = 300, CONT_H = 52, CONT_X = WL.CX - CONT_W / 2;
const CONT_Y = POD_Y + 30;                               // 548..600

// The lane runs down the corridor between the two columns and ends on the Pod it addresses.
const SPINE = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, POD_Y]];
const SPINE_UP = [...SPINE].reverse();

// Design notes for this card: ./CARDS.md#workloads-probes


class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Container probes: startupProbe gates liveness and readiness, liveness restarts the container, readiness toggles the EndpointSlice',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubelet = box({ x: TOP_X, y: WL.TOP_Y, w: TOP_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'prober + probeManager', role: 'cluster' });

    const connectorDown = pathArrow({
      points: SPINE,
      dim: true, dashed: true, role: 'cluster',
    });
    const connectorUp = pathArrow({
      points: SPINE_UP,
      dim: true, dashed: true, role: 'cluster',
    });
    connectorUp.style.opacity = '0';
    root.appendChild(connectorDown);
    root.appendChild(connectorUp);

    const wireReq = text({ class: 'scheme-label code dim', x: WL.CX, y: WL.TOP_Y - 12, 'text-anchor': 'middle' }, [' ']);
    root.appendChild(wireReq);

    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP,
      items: [
        '1. startup   ·  container boots, startupProbe gates the rest',
        '2. released  ·  startup passes, liveness + readiness run',
        '3. ready     ·  readiness passes, Pod IP joins endpoints',
        '4. liveness  ·  failure restarts container, ready=false',
        '5. recovery  ·  fresh container starts, readiness rejoins',
      ],
      role: 'cluster',
    });

    // State chips column on the right.
    const startupChip   = valChip({ x: WL.CHIP_X, y: CHIP_Y(0), w: WL.CHIP_W, h: WL.CHIP_H, name: 'startupProbe',   value: 'pending', role: 'workloads' });
    const livenessChip  = valChip({ x: WL.CHIP_X, y: CHIP_Y(1), w: WL.CHIP_W, h: WL.CHIP_H, name: 'livenessProbe',  value: 'not running', role: 'workloads' });
    const readinessChip = valChip({ x: WL.CHIP_X, y: CHIP_Y(2), w: WL.CHIP_W, h: WL.CHIP_H, name: 'readinessProbe', value: 'not running', role: 'workloads' });
    const restartChip   = valChip({ x: WL.CHIP_X, y: CHIP_Y(3), w: WL.CHIP_W, h: WL.CHIP_H, name: 'restartCount',   value: '0', role: 'workloads' });
    const endpointChip  = valChip({ x: WL.CHIP_X, y: CHIP_Y(4), w: WL.CHIP_W, h: WL.CHIP_H, name: 'EndpointSlice',  value: 'empty', role: 'workloads' });
    [startupChip, livenessChip, readinessChip, restartChip, endpointChip].forEach(c => root.appendChild(c));

    const nodeEl = node({ x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' });

    const shell = podShell({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });

    const containerBox = box({ x: CONT_X, y: CONT_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'container', role: 'workloads' });

    const podGroup = g({ id: 'podGroup' });
    podGroup.appendChild(shell);
    podGroup.appendChild(containerBox);

    // Packet layer.
    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeEl);
    root.appendChild(podGroup);
    root.appendChild(kubelet);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubelet, chain, nodeEl, podGroup, connectorDown, connectorUp,
      startupChip, livenessChip, readinessChip, restartChip, endpointChip,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  clearHighlights(s,
    ['kubelet','startupChip','livenessChip','readinessChip','restartChip','endpointChip'],
    [s.refs.podGroup]);
  clearWires(s);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      resetStep(s);
      setVal(s.refs.startupChip, 'pending');
      setVal(s.refs.livenessChip, 'not running');
      setVal(s.refs.readinessChip, 'not running');
      setVal(s.refs.restartChip, '0');
      setVal(s.refs.endpointChip, 'empty');
      // Booting, not Ready: the Pod sits dim. The poster carries the startup row,
      // so chain row 0 is lit on the rest frame to match the booting state.
      s.refs.podGroup.style.opacity = String(OPACITY.pending);
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 0);
    },
  },
  {
    id: 'startup-running',
    duration: 2300,
    narration: 'Kubelet runs startupProbe every periodSeconds against the container handler, which can be httpGet, tcpSocket, grpc or exec. A slow app gets failureThreshold attempts before Kubelet gives up and restarts the container. The livenessProbe and readinessProbe do not run yet, so a long boot is never mistaken for a failure.',
    enter(s, ctx) {
      resetStep(s);
      setVal(s.refs.startupChip, 'probing 4/30');
      setVal(s.refs.livenessChip, 'not running');
      setVal(s.refs.readinessChip, 'not running');
      setVal(s.refs.restartChip, '0');
      setVal(s.refs.endpointChip, 'empty');
      setWire(s, 'req', 'httpGet /healthz/start');
      s.refs.startupChip.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      s.refs.podGroup.style.opacity = String(OPACITY.pending);
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) return;
      const probe = routePacket(s, ctx, SPINE, { role: 'workloads' });
      // Pod is still booting (dim), so flash its opacity on probe arrival so the blink shows.
      pulsePodDim(s.refs.podGroup, ctx, probe.arrivalMs);
    },
  },
  {
    id: 'startup-success',
    duration: 2600,
    narration: 'The startupProbe passes once. Kubelet retires it permanently for the lifetime of this container instance and never runs it again. The livenessProbe and readinessProbe are released and now execute on their own periodSeconds.',
    enter(s, ctx) {
      resetStep(s);
      setVal(s.refs.startupChip, 'passed (retired)');
      setVal(s.refs.livenessChip, 'running');
      setVal(s.refs.readinessChip, 'running');
      setVal(s.refs.restartChip, '0');
      setVal(s.refs.endpointChip, 'empty');
      setWire(s, 'req', '200 OK · Startup done');
      s.refs.startupChip.classList.add('highlight');
      s.refs.livenessChip.classList.add('highlight');
      s.refs.readinessChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = String(OPACITY.pending);
      setConnectorDir(s, 'up');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) { s.refs.kubelet.classList.add('highlight'); return; }
      pulsePodDim(s.refs.podGroup, ctx, 0);
      const pkt = routePacket(s, ctx, SPINE_UP, { delay: BEAT.afterPulse, role: 'workloads' });
      lightBoxAt(s.refs.kubelet, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'ready',
    duration: 2600,
    narration: 'The readinessProbe passes successThreshold consecutive times. Kubelet flips the Pod Ready condition to True, and the EndpointSlice controller adds the Pod IP to the Service EndpointSlice. The Pod now receives traffic.',
    enter(s, ctx) {
      resetStep(s);
      setVal(s.refs.startupChip, 'passed (retired)');
      setVal(s.refs.livenessChip, 'passing');
      s.refs.livenessChip.classList.add('highlight');
      setVal(s.refs.readinessChip, 'passing');
      setVal(s.refs.restartChip, '0');
      setVal(s.refs.endpointChip, '10.244.1.5 Ready');
      setWire(s, 'req', '200 OK · Ready=True');
      s.refs.readinessChip.classList.add('highlight');
      s.refs.endpointChip.classList.add('highlight');
      // readiness passed: the Pod becomes Ready and lifts to full opacity.
      s.refs.podGroup.style.opacity = '1';
      setConnectorDir(s, 'up');
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) { s.refs.kubelet.classList.add('highlight'); return; }
      pulsePod(s.refs.podGroup, ctx, 0);
      // Pod lights up to Ready first (the visible blink), then reports up to Kubelet.
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: OPACITY.pending }, { opacity: 1 }],
        { duration: FADE.in, delay: 0, fill: 'both', easing: 'ease-out' }
      ));
      const pkt = routePacket(s, ctx, SPINE_UP, { delay: BEAT.afterPulse, role: 'workloads' });
      lightBoxAt(s.refs.kubelet, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'liveness-fail',
    duration: 2600,
    narration: 'The livenessProbe fails failureThreshold consecutive times. Kubelet kills the container and restarts it per restartPolicy, so restartCount becomes 1. readinessProbe fails too, so the EndpointSlice marks that endpoint ready=false at once rather than removing it, and kube-proxy stops sending new connections.',
    enter(s, ctx) {
      resetStep(s);
      setVal(s.refs.startupChip, 'reset');
      s.refs.startupChip.classList.add('highlight');
      setVal(s.refs.livenessChip, 'failed 3/3');
      setVal(s.refs.readinessChip, 'failed 3/3');
      setVal(s.refs.restartChip, '1');
      setVal(s.refs.endpointChip, '10.244.1.5 ready=false');
      setWire(s, 'req', '503 · Liveness failed');
      s.refs.livenessChip.classList.add('highlight');
      s.refs.readinessChip.classList.add('highlight');
      s.refs.restartChip.classList.add('highlight');
      s.refs.endpointChip.classList.add('highlight');
      // Container killed: the Pod drops to its dimmest state.
      s.refs.podGroup.style.opacity = String(OPACITY.notready);
      setConnectorDir(s, 'up');
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.kubelet.classList.add('highlight'); return; }
      // Pod is still bright here, so the pulse blink reads clearly. Ball leaves
      // after the blink, then the container is killed and the Pod dims.
      pulsePod(s.refs.podGroup, ctx, 0);
      const pkt = routePacket(s, ctx, SPINE_UP, { delay: BEAT.afterPulse, role: 'workloads' });
      lightBoxAt(s.refs.kubelet, ctx, pkt.arrivalMs);
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: 1 }, { opacity: OPACITY.notready }],
        { duration: FADE.out, delay: BEAT.afterPulse + BEAT.afterHop, fill: 'both', easing: 'ease-in' }
      ));
    },
  },
  {
    id: 'recovery',
    duration: 2300,
    narration: 'Kubelet probes the fresh container with startupProbe again. Once it passes, livenessProbe and readinessProbe are released, readinessProbe quickly succeeds, and the EndpointSlice controller rejoins the Pod IP. Traffic resumes while restartCount stays at 1.',
    enter(s, ctx) {
      resetStep(s);
      setVal(s.refs.startupChip, 'passed (retired)');
      setVal(s.refs.livenessChip, 'passing');
      setVal(s.refs.readinessChip, 'passing');
      setVal(s.refs.restartChip, '1');
      setVal(s.refs.endpointChip, '10.244.1.5 Ready');
      setWire(s, 'req', 'httpGet /healthz/start');
      s.refs.kubelet.classList.add('highlight');
      s.refs.startupChip.classList.add('highlight');
      s.refs.livenessChip.classList.add('highlight');
      s.refs.readinessChip.classList.add('highlight');
      s.refs.endpointChip.classList.add('highlight');
      // Replacement container is Ready: the Pod returns to full opacity.
      s.refs.podGroup.style.opacity = '1';
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) return;
      const probe = routePacket(s, ctx, SPINE, { role: 'workloads' });
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: OPACITY.notready }, { opacity: 1 }],
        { duration: FADE.in, delay: probe.arrivalMs, fill: 'both', easing: 'ease-out' }
      ));
      pulsePod(s.refs.podGroup, ctx, probe.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
