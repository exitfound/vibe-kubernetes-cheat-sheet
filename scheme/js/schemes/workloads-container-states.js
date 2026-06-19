import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, setConnectorDir, connectorPacketDir, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT } from '../lib/scheme-kit.js';


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

    const kubelet = box({ x: 320, y: 40, w: 280, h: 80, label: 'Kubelet', sublabel: 'writes containerStatuses[]', cat: 'control' });

    const connectorDown = pathArrow({
      points: [[320, 80], [280, 80], [280, 550], [320, 550]],
      dim: true, dashed: true, color: 'control',
    });
    const connectorUp = pathArrow({
      points: [[320, 550], [280, 550], [280, 80], [320, 80]],
      dim: true, dashed: true, color: 'control',
    });
    connectorUp.style.opacity = '0';
    root.appendChild(connectorDown);
    root.appendChild(connectorUp);

    // Single wire label pinned just below the Kubelet box, set per step.
    const wireReq = text({ class: 'scheme-label code dim', x: 460, y: 146, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    // Pipeline chain on the left. Row 0 is the baseline shown at idle.
    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
      items: [
        '1. running    ·  state is Running, the container is up',
        '2. exit       ·  process exits, state becomes Terminated',
        '3. restart    ·  the Terminated record rolls into lastState',
        '4. lastState  ·  the prior-death record, read it to debug',
        '5. exitCode   ·  decode the number into a cause of death',
        '6. describe   ·  Kubectl shows State and Last State',
      ],
      cat: 'control',
    });

    // State field chips on the right: the containerStatuses fields you read.
    const stateChip   = valChip({ x: 830, y: 220, w: 350, h: 32, name: 'state',        value: 'Running' });
    const detailChip  = valChip({ x: 830, y: 262, w: 350, h: 32, name: 'state detail', value: 'startedAt 09:20:14Z' });
    const lastChip    = valChip({ x: 830, y: 304, w: 350, h: 32, name: 'lastState',    value: 'Terminated · exitCode 1 · Error' });
    const restartChip = valChip({ x: 830, y: 346, w: 350, h: 32, name: 'restartCount', value: '2' });
    [stateChip, detailChip, lastChip, restartChip].forEach(c => root.appendChild(c));

    const nodeEl = node({ x: 320, y: 480, w: 860, h: 140, label: 'Node-1' });

    const podShell = pod({ x: 520, y: 500, w: 460, h: 110, label: 'Pod', sublabel: '', containers: 0, cat: 'workloads' });
    const podShellRect = podShell.querySelector('.scheme-pod-rect');
    if (podShellRect) podShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const containerBox = box({ x: 600, y: 530, w: 300, h: 64, label: 'app', sublabel: 'container', cat: 'workloads' });

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
    narration: 'A container runs on Node-1. Its status.containerStatuses entry carries a state object that holds exactly one of Waiting, Running or Terminated. State is Running now, but restartCount already reads 2, so this container has crashed and been replaced twice before.',
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
      s.refs.kubelet.classList.add('highlight');
      s.refs.stateChip.classList.add('highlight');
      s.refs.detailChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = '0.3';
      setConnectorDir(s, 'up');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      // Pod blinks and dims first (the container just died), then the CRI exit
      // report travels up the connector to Kubelet.
      pulsePod(s.refs.podGroup, ctx, 0);
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: 1 }, { opacity: 0.3 }],
        { duration: FADE.out, fill: 'both', easing: 'ease-in' }
      ));
      connectorPacketDir(s, ctx, 'up', { delay: BEAT.afterPulse });
    },
  },
  {
    id: 'restart',
    duration: 2300,
    narration: 'Kubelet restarts the container in the same Pod sandbox. As the fresh instance comes up, state goes back to Running, and the Terminated record just produced is rolled into lastState. restartCount ticks to 3. The earlier lastState is overwritten, only the most recent termination is kept.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { state: 'Running', detail: 'startedAt 09:24:30Z', last: FRESH, restart: '3' });
      setWire(s, 'req', 'Restart container · lastState recorded');
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
      const restart = connectorPacketDir(s, ctx, 'down');
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: 0.3 }, { opacity: 1 }],
        { duration: FADE.in, delay: restart.arrivalMs, fill: 'both', easing: 'ease-out' }
      ));
      pulsePod(s.refs.podGroup, ctx, restart.arrivalMs);
    },
  },
  {
    id: 'read',
    duration: 2200,
    narration: 'This is the field you debug with. The live state says Running, so the container is fine right now and reveals nothing about the failure. lastState holds the answer: a Terminated record with exitCode 137 and reason OOMKilled, which is why the previous instance died.',
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
    narration: 'Kubectl describe pod surfaces both records, State for the live instance and Last State for the prior one. Together with restartCount, which counts every restart, these three fields are what you read to diagnose a container that has been restarting.',
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
