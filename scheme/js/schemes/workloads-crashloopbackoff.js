import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chip, chainList, setChainActive, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, setConnectorDir, routePacket, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT, lightBoxAt, OPACITY, WL } from '../lib/workloads-kit.js';

// Layout B of the Workloads canon (WL): chips and the backoff ladder left, pipeline right.
// Panel worst case x<=397, y<=205; a longer narration invalidates that measurement.
// Design notes for this card: scheme/docs/CARDS.md#workloads-crashloopbackoff
const PANEL_B = 225;
const TOP_W = 280, TOP_X = WL.CX - TOP_W / 2;            // 460..740, centred on CX
const WIRE_OUT_Y = 28, WIRE_IN_Y = 146, WIRE_IN_DX = 14;

const LAD_X = WL.CHIP_X, LAD_W = WL.CHIP_W;              // 660..1140, the pipeline
const LAD_Y = 160;                                       // 6 rows -> 160..402

const VCHIP_X = WL.LADDER_X, VCHIP_W = WL.LADDER_W;      // 60..540, below the panel
const VCHIP_Y = i => 240 + i * (WL.CHIP_H + 8);          // 240 / 282 / 324 / 366

const BACKOFF_X = WL.LADDER_X, BACKOFF_Y = 410, BACKOFF_W = 51, BACKOFF_H = 28, BACKOFF_GAP = 8;

const NODE_Y = 470, NODE_H = 140;                        // 470..610
const POD_W = 460, POD_H = 110, POD_X = WL.CX - POD_W / 2;   // 370..830
const POD_Y = NODE_Y + 22;                               // 492..602
const CONT_W = 300, CONT_X = WL.CX - CONT_W / 2, CONT_H = 64;
const CONT_Y = POD_Y + 30;                               // 522..586

// The spine reaches the Pod it addresses, not the frame edge above it.
const SPINE = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, POD_Y]];
const SPINE_UP = [...SPINE].reverse();


class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'CrashLoopBackOff: Kubelet inserts an exponentially growing delay before each container restart',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Top row: Kubelet, the restart manager, centred on CX and clear of the narration panel.
    const kubelet = box({ x: TOP_X, y: WL.TOP_Y, w: TOP_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'restart manager + backoff', role: 'cluster' });

    // Wire labels above and below the Kubelet block, set per step via setWire. The lower one
    // hangs off the SIDE of the spine, because a centred one sits on the lane and is struck out.
    const wireOut = text({ class: 'scheme-label code dim', x: WL.CX, y: WIRE_OUT_Y, 'text-anchor': 'middle' }, [' ']);
    const wireIn  = text({ class: 'scheme-label code dim', x: WL.SPINE_X + WIRE_IN_DX, y: WIRE_IN_Y, 'text-anchor': 'start' }, [' ']);

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

    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP,
      items: [
        '1. running    ·  container healthy, no backoff active',
        '2. exit       ·  process exits non-zero, Kubelet sees it',
        '3. waiting    ·  state Waiting, reason CrashLoopBackOff',
        '4. backoff    ·  delay doubles each crash, 40s 80s 160s',
        '5. cap        ·  delay clamped at the 300s ceiling',
        '6. reset      ·  healthy run resets backoff to 10s base',
      ],
      role: 'cluster',
    });

    const stateChip   = valChip({ x: VCHIP_X, y: VCHIP_Y(0), w: VCHIP_W, h: WL.CHIP_H, name: 'container state', value: 'Running', role: 'workloads' });
    const reasonChip  = valChip({ x: VCHIP_X, y: VCHIP_Y(1), w: VCHIP_W, h: WL.CHIP_H, name: 'reason',          value: 'none', role: 'workloads' });
    const restartChip = valChip({ x: VCHIP_X, y: VCHIP_Y(2), w: VCHIP_W, h: WL.CHIP_H, name: 'restartCount',    value: '0', role: 'workloads' });
    const delayChip   = valChip({ x: VCHIP_X, y: VCHIP_Y(3), w: VCHIP_W, h: WL.CHIP_H, name: 'current backoff', value: '0s', role: 'workloads' });
    [stateChip, reasonChip, restartChip, delayChip].forEach(c => root.appendChild(c));

    const ladderLabels = ['10s', '20s', '40s', '80s', '160s', '300s'];
    const ladderX = BACKOFF_X, ladderY = BACKOFF_Y, ladderW = BACKOFF_W, ladderGap = BACKOFF_GAP;
    const ladder = g({ class: 'scheme-ladder', transform: `translate(${ladderX},${ladderY})` });
    const ladderChips = ladderLabels.map((lbl, i) => {
      const c = chip({ x: i * (ladderW + ladderGap), y: 0, w: ladderW, h: BACKOFF_H, label: lbl, role: 'cluster' });
      ladder.appendChild(c);
      return c;
    });

    const nodeEl = node({ x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' });

    const podShell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
    const podShellRect = podShell.querySelector('.scheme-pod-rect');
    if (podShellRect) podShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const containerBox = box({ x: CONT_X, y: CONT_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'restartPolicy: Always', role: 'workloads' });

    const podGroup = g({ id: 'podGroup' });
    podGroup.appendChild(podShell);
    podGroup.appendChild(containerBox);

    // Packet layer.
    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(ladder);
    root.appendChild(nodeEl);
    root.appendChild(podGroup);
    root.appendChild(kubelet);
    root.appendChild(wireOut);
    root.appendChild(wireIn);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubelet, chain, nodeEl, podGroup, connectorDown, connectorUp,
      stateChip, reasonChip, restartChip, delayChip,
      ladder, ladderChips,
      packetLayer,
      wires: { out: wireOut, in: wireIn },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['kubelet','stateChip','reasonChip','restartChip','delayChip'],
    [s.refs.podGroup]);
  s.refs.ladderChips.forEach(c => c.classList.remove('highlight'));
}

function setLadder(s, idx) {
  s.refs.ladderChips.forEach((c, i) => c.classList.toggle('highlight', i <= idx));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podGroup.style.opacity = '1';
      setVal(s.refs.stateChip, 'Running');
      setVal(s.refs.reasonChip, 'none');
      setVal(s.refs.restartChip, '0');
      setVal(s.refs.delayChip, '0s');
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 0);
    },
  },
  {
    id: 'first-crash',
    duration: 2600,
    narration: 'The container process exits with a non-zero code and Kubelet observes the termination. With restartPolicy Always, Kubelet restarts it immediately the first time and arms a 10s base delay for the next one. Once the new container starts, restartCount becomes 1.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podGroup.style.opacity = '1';
      setVal(s.refs.stateChip, 'Running (restarted)');
      s.refs.stateChip.classList.add('highlight');
      setVal(s.refs.reasonChip, 'none');
      setVal(s.refs.restartChip, '1');
      setVal(s.refs.delayChip, '10s · base');
      setWire(s, 'in', 'container exited, code 1');
      setWire(s, 'out', 'restart now, next wait 10s');
      s.refs.restartChip.classList.add('highlight');
      s.refs.delayChip.classList.add('highlight');
      setConnectorDir(s, 'up');
      setChainActive(s.refs.chain, 1);
      setLadder(s, 0);
      if (ctx.reduced) { s.refs.kubelet.classList.add('highlight'); return; }
      // Pod blinks first (the container just crashed), then the Node reports the
      // exit up the connector to Kubelet.
      pulsePod(s.refs.podGroup, ctx, 0);
      const pkt = routePacket(s, ctx, SPINE_UP, { delay: BEAT.afterPulse, role: 'workloads' });
      lightBoxAt(s.refs.kubelet, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'backoff-named',
    duration: 2200,
    narration: 'The fresh container crashes again almost immediately. This restart is the one that waits, and each further crash doubles the delay, so 10s becomes 20s. While Kubelet holds off the restart the container state is Waiting with reason CrashLoopBackOff, which surfaces in kubectl get pods.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podGroup.style.opacity = String(OPACITY.notready);
      setVal(s.refs.stateChip, 'Waiting');
      setVal(s.refs.reasonChip, 'CrashLoopBackOff');
      setVal(s.refs.restartChip, '2');
      s.refs.restartChip.classList.add('highlight');
      setVal(s.refs.delayChip, '20s · doubled');
      setWire(s, 'out', 'hold restart, 20s');
      s.refs.kubelet.classList.add('highlight');
      s.refs.stateChip.classList.add('highlight');
      s.refs.reasonChip.classList.add('highlight');
      s.refs.delayChip.classList.add('highlight');
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 2);
      setLadder(s, 1);
      if (ctx.reduced) return;
      pulsePod(s.refs.podGroup, ctx, 0);
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: 1 }, { opacity: OPACITY.notready }],
        { duration: FADE.out, fill: 'both', easing: 'ease-in' }
      ));
    },
  },
  {
    id: 'doubling',
    duration: 2300,
    narration: 'The crashes keep coming and the backoff delay doubles with each failure, climbing 40s then 80s then 160s. The restartCount keeps incrementing on every attempt. The exponential growth is per container, so a hot-looping process cannot saturate the Node.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podGroup.style.opacity = String(OPACITY.notready);
      setVal(s.refs.stateChip, 'Waiting');
      setVal(s.refs.reasonChip, 'CrashLoopBackOff');
      setVal(s.refs.restartChip, '5');
      setVal(s.refs.delayChip, '160s · doubling');
      setWire(s, 'out', 'hold restart, 160s');
      s.refs.kubelet.classList.add('highlight');
      s.refs.reasonChip.classList.add('highlight');
      s.refs.restartChip.classList.add('highlight');
      s.refs.delayChip.classList.add('highlight');
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 3);
      setLadder(s, 4);
    },
  },
  {
    id: 'cap',
    duration: 2200,
    narration: 'The next doubling would exceed 300s, so the delay is clamped at the 300s ceiling and stays there. Kubelet now retries the container at most once every 5 minutes for as long as it keeps failing. The restartCount continues to climb at this slow cadence.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podGroup.style.opacity = String(OPACITY.notready);
      setVal(s.refs.stateChip, 'Waiting');
      setVal(s.refs.reasonChip, 'CrashLoopBackOff');
      setVal(s.refs.restartChip, '7');
      s.refs.restartChip.classList.add('highlight');
      setVal(s.refs.delayChip, '300s · capped');
      setWire(s, 'out', 'retry every 5 min');
      s.refs.kubelet.classList.add('highlight');
      s.refs.delayChip.classList.add('highlight');
      s.refs.reasonChip.classList.add('highlight');
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 4);
      setLadder(s, 5);
      // The cap holds: the clamped 300s ceiling shows via the full ladder and the
      // static chip highlight (no chip pulse).
    },
  },
  {
    id: 'reset',
    duration: 2600,
    narration: 'The bug is fixed and the new container runs stably. After a sustained healthy run Kubelet resets the backoff counter, so the next crash would start over from the 10s base rather than the 300s cap. The container state returns to Running and the CrashLoopBackOff reason clears.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.stateChip, 'Running');
      setVal(s.refs.reasonChip, 'none');
      s.refs.reasonChip.classList.add('highlight');
      setVal(s.refs.restartChip, '7');
      setVal(s.refs.delayChip, '0s · reset to base');
      setWire(s, 'in', 'healthy run, backoff reset');
      s.refs.stateChip.classList.add('highlight');
      s.refs.delayChip.classList.add('highlight');
      // Pin final state inline so cancel between steps does not flash to default.
      s.refs.podGroup.style.opacity = '1';
      setConnectorDir(s, 'up');
      setChainActive(s.refs.chain, 5);
      setLadder(s, 0);
      if (ctx.reduced) { s.refs.kubelet.classList.add('highlight'); return; }
      // Pod recovers to full opacity first (the visible blink of a healthy run),
      // then reports the healthy status up to Kubelet which resets the backoff.
      pulsePod(s.refs.podGroup, ctx, 0);
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: OPACITY.notready }, { opacity: 1 }],
        { duration: FADE.in, fill: 'both', easing: 'ease-out' }
      ));
      const pkt = routePacket(s, ctx, SPINE_UP, { delay: BEAT.afterPulse, role: 'workloads' });
      lightBoxAt(s.refs.kubelet, ctx, pkt.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
