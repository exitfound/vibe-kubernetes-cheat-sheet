import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chip, chainList, setChainActive, pathArrow, packet } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, clearPodHighlight, setConnectorDir, makeInit } from '../lib/scheme-kit.js';


function connectorPacket(s, ctx, dir, { delay = 0, dur = 1100 } = {}) {
  const pts = dir === 'up'
    ? [[320, 550], [280, 550], [280, 80], [320, 80]]
    : [[320, 80], [280, 80], [280, 550], [320, 550]];
  const seg = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    seg.push(d);
    total += d;
  }
  let acc = 0;
  const frames = pts.map((pt, i) => {
    if (i > 0) acc += seg[i - 1];
    return { transform: `translate(${pt[0]}px, ${pt[1]}px)`, offset: total ? acc / total : 0 };
  });
  const p = packet({ x: pts[0][0], y: pts[0][1], cat: 'control' });
  p.style.opacity = '0';
  s.refs.packetLayer.appendChild(p);
  // Pre-move fade-in: packet appears AT source block BEFORE travelling.
  const fadeInDelay = Math.max(0, delay - 200);
  ctx.register(p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: fadeInDelay, fill: 'forwards', easing: 'ease-out' }));
  ctx.register(p.animate(frames, { duration: dur, delay, fill: 'forwards', easing: 'linear' }));
  ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: delay + dur, fill: 'forwards', easing: 'ease-in' }));
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
      'aria-label': 'CrashLoopBackOff: kubelet inserts an exponentially growing delay before each container restart',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Top row: Kubelet, the restart manager (x=320 w=280, single-block standard).
    const kubelet = box({ x: 320, y: 40, w: 280, h: 80, label: 'Kubelet', sublabel: 'restart manager + backoff', cat: 'control' });

    // Wire labels above and below the Kubelet block, set per step via setWire.
    const wireOut = text({ class: 'scheme-label code dim', x: 460, y: 28,  'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    const wireIn  = text({ class: 'scheme-label code dim', x: 460, y: 146, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);

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

    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
      items: [
        '1. running    ·  container healthy, no backoff active',
        '2. exit       ·  process exits non-zero, kubelet sees it',
        '3. waiting    ·  state Waiting, reason CrashLoopBackOff',
        '4. backoff    ·  delay doubles each crash, 40s 80s 160s',
        '5. cap        ·  delay clamped at the 300s ceiling',
        '6. reset      ·  healthy run resets backoff to 10s base',
      ],
      cat: 'control',
    });

    const stateChip   = valChip({ x: 830, y: 220, w: 350, h: 32, name: 'container state', value: 'Running' });
    const reasonChip  = valChip({ x: 830, y: 262, w: 350, h: 32, name: 'reason',          value: 'none' });
    const restartChip = valChip({ x: 830, y: 304, w: 350, h: 32, name: 'restartCount',    value: '0' });
    const delayChip   = valChip({ x: 830, y: 346, w: 350, h: 32, name: 'current backoff', value: '0s' });
    [stateChip, reasonChip, restartChip, delayChip].forEach(c => root.appendChild(c));

    const ladderLabels = ['10s', '20s', '40s', '80s', '160s', '300s'];
    const ladderX = 830, ladderY = 410, ladderW = 51, ladderGap = 8;
    const ladder = g({ class: 'scheme-ladder', transform: `translate(${ladderX},${ladderY})` });
    const ladderChips = ladderLabels.map((lbl, i) => {
      const c = chip({ x: i * (ladderW + ladderGap), y: 0, w: ladderW, h: 28, label: lbl, cat: 'control' });
      ladder.appendChild(c);
      return c;
    });

    const nodeEl = node({ x: 320, y: 480, w: 860, h: 140, label: 'Node-1' });

    const podShell = pod({ x: 520, y: 500, w: 460, h: 110, label: 'Pod', sublabel: '', containers: 0, cat: 'workloads' });
    const podShellRect = podShell.querySelector('.scheme-pod-rect');
    if (podShellRect) podShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const containerBox = box({ x: 600, y: 530, w: 300, h: 64, label: 'app', sublabel: 'restartPolicy: Always', cat: 'workloads' });

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
  ['kubelet','stateChip','reasonChip','restartChip','delayChip']
    .forEach(k => s.refs[k].classList.remove('highlight'));
  s.refs.chain.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
  s.refs.ladderChips.forEach(c => c.classList.remove('highlight'));
  clearPodHighlight(s.refs.podGroup);
}



function clearWires(s) {
  Object.values(s.refs.wires).forEach(t => { t.textContent = ''; });
}

function setWire(s, key, txt) {
  if (s.refs.wires[key]) s.refs.wires[key].textContent = txt;
}

// Show the connector copy whose arrowhead matches the packet direction.

function setLadder(s, idx) {
  s.refs.ladderChips.forEach((c, i) => c.classList.toggle('highlight', i <= idx));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'The container runs normally on Node-1. Its restartCount is 0 and no restart backoff is active. CrashLoopBackOff is a Waiting reason that only appears once a container starts failing repeatedly.',
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
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'first-crash',
    duration: 2000,
    narration: 'The container process exits with a non-zero code and kubelet observes the termination. With restartPolicy Always, kubelet schedules a restart after the 10s base delay. Once the new container starts, restartCount becomes 1.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podGroup.style.opacity = '1';
      setVal(s.refs.stateChip, 'Running (restarted)');
      setVal(s.refs.reasonChip, 'none');
      setVal(s.refs.restartChip, '1');
      setVal(s.refs.delayChip, '10s · base');
      setWire(s, 'in', 'Container exited, code 1');
      setWire(s, 'out', 'Restart after 10s');
      s.refs.kubelet.classList.add('highlight');
      s.refs.restartChip.classList.add('highlight');
      s.refs.delayChip.classList.add('highlight');
      setConnectorDir(s, 'up');
      setChainActive(s.refs.chain, 1);
      setLadder(s, 0);
      if (ctx.reduced) return;
      // Pod blinks first (the container just crashed), then the Node reports the
      // exit up the connector to Kubelet.
      pulsePod(s.refs.podGroup, ctx, 0);
      connectorPacket(s, ctx, 'up', { dur: 1000, delay: 800 });
    },
  },
  {
    id: 'backoff-named',
    duration: 2200,
    narration: 'The fresh container crashes again almost immediately. Kubelet doubles the wait from 10s to 20s. While kubelet holds off the restart the container state is Waiting with reason CrashLoopBackOff, which surfaces in kubectl get pods.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podGroup.style.opacity = '0.3';
      setVal(s.refs.stateChip, 'Waiting');
      setVal(s.refs.reasonChip, 'CrashLoopBackOff');
      setVal(s.refs.restartChip, '2');
      setVal(s.refs.delayChip, '20s · doubled');
      setWire(s, 'out', 'Hold restart, 20s');
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
        [{ opacity: 1 }, { opacity: 0.3 }],
        { duration: 600, fill: 'both', easing: 'ease-in' }
      ));
    },
  },
  {
    id: 'doubling',
    duration: 2300,
    narration: 'The crashes keep coming and the backoff delay doubles with each failure, climbing 40s then 80s then 160s. restartCount keeps incrementing on every attempt. The exponential growth is per container, so a hot-looping process cannot saturate the node.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podGroup.style.opacity = '0.3';
      setVal(s.refs.stateChip, 'Waiting');
      setVal(s.refs.reasonChip, 'CrashLoopBackOff');
      setVal(s.refs.restartChip, '5');
      setVal(s.refs.delayChip, '160s · doubling');
      setWire(s, 'out', 'Hold restart, 160s');
      s.refs.kubelet.classList.add('highlight');
      s.refs.reasonChip.classList.add('highlight');
      s.refs.restartChip.classList.add('highlight');
      s.refs.delayChip.classList.add('highlight');
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 3);
      setLadder(s, 4);
      if (ctx.reduced) return;
    },
  },
  {
    id: 'cap',
    duration: 2200,
    narration: 'The next doubling would exceed 300s, so the delay is clamped at the 300s ceiling and stays there. Kubelet now retries the container at most once every 5 minutes for as long as it keeps failing. restartCount continues to climb at this slow cadence.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podGroup.style.opacity = '0.3';
      setVal(s.refs.stateChip, 'Waiting');
      setVal(s.refs.reasonChip, 'CrashLoopBackOff');
      setVal(s.refs.restartChip, '7');
      setVal(s.refs.delayChip, '300s · capped');
      setWire(s, 'out', 'Retry every 5 min');
      s.refs.kubelet.classList.add('highlight');
      s.refs.delayChip.classList.add('highlight');
      s.refs.reasonChip.classList.add('highlight');
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 4);
      setLadder(s, 5);
      if (ctx.reduced) return;
    },
  },
  {
    id: 'reset',
    duration: 2400,
    narration: 'The bug is fixed and the new container runs stably. After a sustained healthy run kubelet resets the backoff counter, so the next crash would start over from the 10s base rather than the 300s cap. The container state returns to Running and the CrashLoopBackOff reason clears.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.stateChip, 'Running');
      setVal(s.refs.reasonChip, 'none');
      setVal(s.refs.restartChip, '7');
      setVal(s.refs.delayChip, '0s · reset to base');
      setWire(s, 'in', 'Healthy run, backoff reset');
      s.refs.kubelet.classList.add('highlight');
      s.refs.stateChip.classList.add('highlight');
      s.refs.delayChip.classList.add('highlight');
      // Pin final state inline so cancel between steps does not flash to default.
      s.refs.podGroup.style.opacity = '1';
      setConnectorDir(s, 'up');
      setChainActive(s.refs.chain, 5);
      setLadder(s, 0);
      if (ctx.reduced) return;
      // Pod recovers to full opacity first (the visible blink of a healthy run),
      // then reports the healthy status up to Kubelet which resets the backoff.
      pulsePod(s.refs.podGroup, ctx, 0);
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: 0.3 }, { opacity: 1 }],
        { duration: 500, delay: 0, fill: 'both', easing: 'ease-out' }
      ));
      connectorPacket(s, ctx, 'up', { dur: 1100, delay: 800 });
    },
  },
];

export const init = makeInit(Scene, STEPS);
