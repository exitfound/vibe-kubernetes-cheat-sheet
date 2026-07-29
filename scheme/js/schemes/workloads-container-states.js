import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, pathArrow } from '../lib/primitives.js';
import { routePacket, valChip, setVal, pulsePod, setConnectorDir, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT, lightBoxAt, OPACITY, WL } from '../lib/workloads-kit.js';

// Layout B of the Workloads canon (WL): chips left, pipeline right, spine into the Pod.
// Panel worst case x<=397, y<=230; a longer narration invalidates that measurement.
// Design notes for this card: scheme/docs/CARDS.md#workloads-container-states
const PANEL_B = 230;
const TOP_W = 280, TOP_X = WL.CX - TOP_W / 2;
const WIRE_Y = WL.TOP_Y - 12;                            // above the actor box
const NODE_H = 140, CANVAS_B = 624;
const NODE_Y = CANVAS_B - NODE_H;                        // 484..624, the frame rests on the floor

const LAD_X = WL.CHIP_X, LAD_W = WL.CHIP_W;              // 660..1140, the pipeline
const LAD_Y = 160;                                       // 6 rows -> 160..402

const POD_W = 460, POD_H = 110, POD_X = WL.CX - POD_W / 2;
const POD_Y = NODE_Y + (NODE_H - POD_H) / 2;             // 499..609, centred in the frame
const CONT_W = 300, CONT_H = 64, CONT_X = WL.CX - CONT_W / 2;
const CONT_Y = POD_Y + 30;

// The spine reaches the Pod it addresses, not the frame edge above it.
const SPINE = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, POD_Y]];
const SPINE_UP = [...SPINE].reverse();

// Chips as a column in the left band, which only opens below the panel.
const CHIP_GAP = 8;
const CHIPS_TOP = PANEL_B + 20;                          // 250, clear of the panel
const CHIP_X = WL.LADDER_X, CHIP_W = WL.LADDER_W;        // 60..540
const CHIP_Y = i => CHIPS_TOP + i * (WL.CHIP_H + CHIP_GAP);



class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Container restarts and lastState: Kubelet preserves the previous termination record so a restart can be debugged',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubelet = box({ x: TOP_X, y: WL.TOP_Y, w: TOP_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'writes containerStatuses[]', role: 'cluster' });

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

    // Single wire label pinned just below the Kubelet box, set per step.
    const wireReq = text({ class: 'scheme-label code dim', x: WL.CX, y: WIRE_Y, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    // Pipeline chain on the right. Row 0 is the baseline shown at idle.
    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP,
      items: [
        '1. running    ·  state is Running, the container is up',
        '2. exit       ·  process exits, state becomes Terminated',
        '3. restart    ·  the Terminated record rolls into lastState',
        '4. lastState  ·  the prior-death record, read it to debug',
        '5. exitCode   ·  decode the number into a cause of death',
        '6. describe   ·  kubectl shows State and Last State',
      ],
      role: 'cluster',
    });

    // State field chips in the left band: the containerStatuses fields you read.
    const stateChip   = valChip({ x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'state',        value: 'Running', role: 'workloads' });
    const detailChip  = valChip({ x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'state detail', value: 'startedAt 09:20:14Z', role: 'workloads' });
    const lastChip    = valChip({ x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'lastState',    value: 'Terminated · exitCode 1 · Error', role: 'workloads' });
    const restartChip = valChip({ x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'restartCount', value: '2', role: 'workloads' });
    [stateChip, detailChip, lastChip, restartChip].forEach(c => root.appendChild(c));

    const nodeEl = node({ x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' });

    const podShell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
    const podShellRect = podShell.querySelector('.scheme-pod-rect');
    if (podShellRect) podShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const containerBox = box({ x: CONT_X, y: CONT_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'container', role: 'workloads' });

    const podGroup = g({ id: 'podGroup' });
    podGroup.appendChild(podShell);
    podGroup.appendChild(containerBox);

    // Connector packet layer.
    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    // Z-order: chain, node, pod shell, container box, then the Kubelet block.
    root.appendChild(chain);
    root.appendChild(nodeEl);
    root.appendChild(podGroup);
    root.appendChild(kubelet);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubelet, chain, nodeEl, podGroup, connectorDown, connectorUp,
      stateChip, detailChip, lastChip, restartChip,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['kubelet','stateChip','detailChip','lastChip','restartChip'],
    [s.refs.podGroup]);
}

// Set all four status chips in one call so every step pins the full record.
function setChips(s, { state, detail, last, restart }) {
  setVal(s.refs.stateChip, state);
  setVal(s.refs.detailChip, detail);
  setVal(s.refs.lastChip, last);
  setVal(s.refs.restartChip, restart);
}

const PRIOR = 'Terminated · exitCode 1 · Error';
const FRESH = 'Terminated · exitCode 137 · OOMKilled';

const STEPS = [
  {
    id: 'running',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { state: 'Running', detail: 'startedAt 09:20:14Z', last: PRIOR, restart: '2' });
      s.refs.podGroup.style.opacity = '1';
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 0);
    },
  },
  {
    id: 'crash',
    duration: 2600,
    narration: 'The process hits its memory limit and the kernel kills it. Kubelet sets state to Terminated, a record carrying exitCode, reason, startedAt and finishedAt. Here exitCode is 137 and reason is OOMKilled. This live Terminated record exists only for an instant.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { state: 'Terminated', detail: 'exitCode 137 · OOMKilled', last: PRIOR, restart: '2' });
      setWire(s, 'req', 'CRI: container exited · 137');
      s.refs.stateChip.classList.add('highlight');
      s.refs.detailChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = String(OPACITY.notready);
      setConnectorDir(s, 'up');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) { s.refs.kubelet.classList.add('highlight'); return; }
      // Pod blinks and dims first (the container just died), then the CRI exit
      // report travels up the connector to Kubelet.
      pulsePod(s.refs.podGroup, ctx, 0);
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: 1 }, { opacity: OPACITY.notready }],
        { duration: FADE.out, fill: 'both', easing: 'ease-in' }
      ));
      const pkt = routePacket(s, ctx, SPINE_UP, { delay: BEAT.afterPulse, role: 'workloads' });
      lightBoxAt(s.refs.kubelet, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'restart',
    duration: 2300,
    narration: 'Kubelet restarts the container in the same Pod sandbox. As the fresh instance comes up, state goes back to Running, and the Terminated record just produced is rolled into lastState. The restartCount ticks to 3. The earlier lastState is overwritten, only the most recent termination is kept.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { state: 'Running', detail: 'startedAt 09:24:30Z', last: FRESH, restart: '3' });
      s.refs.detailChip.classList.add('highlight');
      setWire(s, 'req', 'restart container · lastState recorded');
      s.refs.kubelet.classList.add('highlight');
      s.refs.stateChip.classList.add('highlight');
      s.refs.lastChip.classList.add('highlight');
      s.refs.restartChip.classList.add('highlight');
      // Fresh container running: the container box returns to full opacity.
      s.refs.podGroup.style.opacity = '1';
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
      // The restart order travels down to the node, the fresh container comes up
      // and the Pod pulses on arrival.
      const restart = routePacket(s, ctx, SPINE, { role: 'workloads' });
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: OPACITY.notready }, { opacity: 1 }],
        { duration: FADE.in, delay: restart.arrivalMs, fill: 'both', easing: 'ease-out' }
      ));
      pulsePod(s.refs.podGroup, ctx, restart.arrivalMs);
    },
  },
  {
    id: 'read',
    duration: 2200,
    narration: 'This is the field you debug with. The live state says Running, so the container is fine right now and reveals nothing about the failure. The lastState field holds the answer: a Terminated record with exitCode 137 and reason OOMKilled, which is why the previous instance died.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { state: 'Running', detail: 'startedAt 09:24:30Z', last: FRESH, restart: '3' });
      s.refs.podGroup.style.opacity = '1';
      s.refs.stateChip.classList.add('highlight');
      s.refs.lastChip.classList.add('highlight');
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 3);
      // Reading status is local, nothing travels and the Pod is untouched, so the
      // fields you read light up via the static highlight only (no chip pulse).
    },
  },
  {
    id: 'exitcodes',
    duration: 2400,
    narration: 'The exitCode names the cause. 0 is Completed, a clean exit. 1 is a generic application Error. Codes above 128 carry a signal: 137 is 128 plus 9 for SIGKILL, paired with reason OOMKilled when the kernel did it, and 143 is 128 plus 15 for SIGTERM. The number alone tells you how the container died.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { state: 'Running', detail: 'startedAt 09:24:30Z', last: FRESH, restart: '3' });
      s.refs.podGroup.style.opacity = '1';
      s.refs.lastChip.classList.add('highlight');
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 4);
      // Decoding the code is a local lookup, nothing travels and the Pod is untouched,
      // so the record being read lights up via the static highlight only (no chip pulse).
    },
  },
  {
    id: 'describe',
    duration: 2100,
    narration: 'Running kubectl describe pod surfaces both records, State for the live instance and Last State for the prior one. Together with restartCount, which counts every restart, these three fields are what you read to diagnose a container that has been restarting.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { state: 'Running', detail: 'startedAt 09:24:30Z', last: FRESH, restart: '3' });
      s.refs.podGroup.style.opacity = '1';
      s.refs.stateChip.classList.add('highlight');
      s.refs.lastChip.classList.add('highlight');
      s.refs.restartChip.classList.add('highlight');
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 5);
      // kubectl only reads, nothing travels and the Pod is untouched, so the three
      // diagnostic fields light up via the static highlight only (no chip pulse).
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
