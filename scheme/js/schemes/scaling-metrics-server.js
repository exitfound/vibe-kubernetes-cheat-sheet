import { svg, g, text, path } from '../lib/svg.js';
import { arrowDefs, box, pod, node, pathArrow, animateAlong, chainList, setChainActive } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, segmentPacket, routeDur,
  makeInit, clearHighlights, clearWires, flashChips, BEAT,
} from '../lib/scaling-kit.js';

// FOUNDATIONS card: the resource metrics pipeline. On each node the kubelet, through cAdvisor,
// samples every container cpu and memory. metrics-server scrapes each kubelet on a short interval,
// aggregates the samples IN MEMORY, and serves them through the metrics.k8s.io API via the
// aggregation layer. kubectl top and the HPA both read that API. It is a small SLIDING WINDOW of
// current usage, not a historical store, so it is meant only for autoscaling and top.
//
// GEOMETRY. The signature gesture is a FAN-IN from the node kubelets up to metrics-server, then a
// FAN-OUT up to the two consumers. Consumers sit in the top band (right of x=380), the aggregation
// layer and metrics-server stack below them centered on x=660, and the two node frames sit across the
// bottom, each holding a Pod and a kubelet. Only the Pods pulse, every box is infrastructure and
// lights via .highlight.
const SPINE_X = 660;

const KT_X = 430, KT_Y = 64, KT_W = 200, KT_H = 56;   // kubectl top consumer, center 530
const HP_X = 690, HP_Y = 64, HP_W = 200, HP_H = 56;   // HPA consumer, center 790
const KT_CX = KT_X + KT_W / 2, HP_CX = HP_X + HP_W / 2;

const AGG_X = 430, AGG_Y = 148, AGG_W = 460, AGG_H = 40;   // aggregation layer, center 660
const AGG_TOP = AGG_Y, AGG_BOTTOM = AGG_Y + AGG_H;

const MS_X = 490, MS_Y = 232, MS_W = 340, MS_H = 72;       // metrics-server, center 660
const MS_TOP = MS_Y, MS_BOTTOM = MS_Y + MS_H;

const N1_X = 120, N2_X = 640, N_Y = 360, N_W = 440, N_H = 180;   // node frames
const POD_W = 150, POD_H = 120;
const P1_X = 160, P2_X = 680, POD_Y = 388;                        // Pods inside the nodes
const KL_W = 160, KL_H = 84, KL_Y = 406;                          // kubelets inside the nodes
const K1_X = 360, K2_X = 880;
const P1_CY = POD_Y + POD_H / 2, K1_CX = K1_X + KL_W / 2;
const K2_CX = K2_X + KL_W / 2;

const FAN_BUS = 330;   // scrape lanes drop onto this bus below metrics-server
const CON_BUS = 134;   // consumer lanes drop onto this bus above the aggregation layer
const CHIPS_Y = 556;

// sample: Pod -> kubelet inside each node. scrape: kubelet -> metrics-server (fan-in). serve:
// metrics-server -> aggregation layer. consumers: aggregation layer -> each consumer (fan-out).
const sampleLane1 = [[P1_X + POD_W, P1_CY], [K1_X, P1_CY]];
const sampleLane2 = [[P2_X + POD_W, P1_CY], [K2_X, P1_CY]];
const scrapeLane1 = [[K1_CX, KL_Y], [K1_CX, FAN_BUS], [SPINE_X, FAN_BUS], [SPINE_X, MS_BOTTOM]];
const scrapeLane2 = [[K2_CX, KL_Y], [K2_CX, FAN_BUS], [SPINE_X, FAN_BUS], [SPINE_X, MS_BOTTOM]];
const serveLane = [[SPINE_X, MS_TOP], [SPINE_X, AGG_BOTTOM]];
const conLaneKt = [[SPINE_X, AGG_TOP], [SPINE_X, CON_BUS], [KT_CX, CON_BUS], [KT_CX, KT_Y + KT_H]];
const conLaneHp = [[SPINE_X, AGG_TOP], [SPINE_X, CON_BUS], [HP_CX, CON_BUS], [HP_CX, HP_Y + HP_H]];

function laneWire(points) {
  const d = 'M ' + points.map(p => p.join(' ')).join(' L ');
  return path({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-scaling', d, 'stroke-dasharray': '5 5', fill: 'none' });
}

// A tag that rides ALONG with the ball on the same path, timing and easing, so the packet visibly
// carries the request the step narrates. The scrape balls are routePacket (eased), so the label
// defaults to the same ease-in-out and the same routeDur.
function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'ease-in-out' } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: -14, 'text-anchor': 'middle', 'data-cat': 'scaling' }, [txt]);
  lbl.style.opacity = '0';
  lbl.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px)`;
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 160, fill: 'forwards', easing: 'ease-in' }));
}

function buildPod(x, y, label) {
  const shell = pod({ x, y, w: POD_W, h: POD_H, label, sublabel: 'cpu + mem', containers: 2, cat: 'scaling' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const wrap = g({});
  wrap.appendChild(shell);
  return { wrap, shell };
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
      'aria-label': 'The resource metrics pipeline. On each node the kubelet, through cAdvisor, samples every container cpu and memory, and metrics-server scrapes each kubelet on a short interval, aggregates the samples in memory, and serves them through the metrics.k8s.io API via the aggregation layer. kubectl top and the HPA both read that API. It is a small sliding window of current usage, not a historical store.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubectlBox = box({ x: KT_X, y: KT_Y, w: KT_W, h: KT_H, label: 'kubectl top', sublabel: 'reads the API', cat: 'scaling' });
    const hpaBox     = box({ x: HP_X, y: HP_Y, w: HP_W, h: HP_H, label: 'HPA', sublabel: 'reads the API', cat: 'scaling' });
    const aggBox     = box({ x: AGG_X, y: AGG_Y, w: AGG_W, h: AGG_H, label: 'aggregation layer  metrics.k8s.io', cat: 'scaling' });
    const metricsBox = box({ x: MS_X, y: MS_Y, w: MS_W, h: MS_H, label: 'metrics-server', sublabel: 'aggregates in memory', cat: 'scaling' });

    const node1 = node({ x: N1_X, y: N_Y, w: N_W, h: N_H, label: 'node-1' });
    const node2 = node({ x: N2_X, y: N_Y, w: N_W, h: N_H, label: 'node-2' });
    const pod1 = buildPod(P1_X, POD_Y, 'Pod web');
    const pod2 = buildPod(P2_X, POD_Y, 'Pod web');
    const kubelet1 = box({ x: K1_X, y: KL_Y, w: KL_W, h: KL_H, label: 'kubelet', sublabel: 'cAdvisor', cat: 'scaling' });
    const kubelet2 = box({ x: K2_X, y: KL_Y, w: KL_W, h: KL_H, label: 'kubelet', sublabel: 'cAdvisor', cat: 'scaling' });

    const sourceChip    = valChip({ x: 120, y: CHIPS_Y, w: 340, h: 34, name: 'source',    value: 'kubelet cAdvisor', cat: 'scaling' });
    const windowChip    = valChip({ x: 490, y: CHIPS_Y, w: 300, h: 34, name: 'window',    value: 'latest sample',   cat: 'scaling' });
    const consumersChip = valChip({ x: 820, y: CHIPS_Y, w: 300, h: 34, name: 'consumers', value: 'top + HPA',       cat: 'scaling' });

    // The pipeline ladder sits in the free top-right gutter, right of the consumer boxes (which end at
    // x=890) and above node-2 (which starts at y=360). One row lights per step to anchor the stage.
    const chain = chainList({
      x: 900, y: 96, w: 290, rowH: 30, gap: 10,
      items: [
        '1. sample  ·  kubelet cAdvisor',
        '2. scrape  ·  GET /metrics/resource',
        '3. serve   ·  metrics.k8s.io API',
        '4. consume ·  kubectl top + HPA',
        '5. window  ·  latest sample only',
      ],
      cat: 'scaling',
    });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): node frames, then consumers, aggregation layer, metrics-server, then
    // the Pods and kubelets inside the nodes, then the chip strip, then the packet layer, then the
    // chain ladder LAST so it renders above the packet layer.
    [node1, node2].forEach(el => root.appendChild(el));
    [kubectlBox, hpaBox, aggBox, metricsBox].forEach(el => root.appendChild(el));
    [pod1.wrap, kubelet1, pod2.wrap, kubelet2].forEach(el => root.appendChild(el));
    [sourceChip, windowChip, consumersChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);
    root.appendChild(chain);

    this.host.appendChild(root);
    this.refs = {
      svg: root, node1, node2, pod1: pod1.wrap, pod2: pod2.wrap, kubelet1, kubelet2,
      kubectlBox, hpaBox, aggBox, metricsBox, chain,
      sourceChip, windowChip, consumersChip,
      wires: {}, packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}
function setChips(s, { source, window, consumers }) {
  setChip(s.refs.sourceChip, source);
  setChip(s.refs.windowChip, window);
  setChip(s.refs.consumersChip, consumers);
}

function clearHL(s) {
  clearHighlights(s, ['kubectlBox', 'hpaBox', 'aggBox', 'metricsBox', 'kubelet1', 'kubelet2', 'sourceChip', 'windowChip', 'consumersChip'],
    [s.refs.pod1, s.refs.pod2]);
}

const SRC = 'kubelet cAdvisor', WIN = 'latest sample', CON = 'top + HPA';

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Two nodes run Pods, and something has to turn their live cpu and memory into numbers an autoscaler can read. That job is a pipeline: the kubelet on each node measures, metrics-server collects, and consumers read. The next steps walk it end to end.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { source: SRC, window: WIN, consumers: CON });
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'sample',
    duration: 3000,
    narration: 'On each node the kubelet, through cAdvisor, samples every container cpu and memory. This is the only place raw usage is actually measured, right next to the running Pod. Both nodes sample independently and locally.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { source: SRC, window: WIN, consumers: CON });
      setChainActive(s.refs.chain, 0);
      s.refs.kubelet1.classList.add('highlight');
      s.refs.kubelet2.classList.add('highlight');
      s.refs.sourceChip.classList.add('highlight');
      if (ctx.reduced) return;
      // Up-arrow: each Pod pulses first, then the sample crosses to its kubelet.
      pulsePod(s.refs.pod1, ctx, 0);
      pulsePod(s.refs.pod2, ctx, 0);
      s.refs.packetLayer.appendChild(laneWire(sampleLane1));
      s.refs.packetLayer.appendChild(laneWire(sampleLane2));
      segmentPacket(s, ctx, { from: sampleLane1[0], to: sampleLane1[1], delay: BEAT.afterPulse, cat: 'scaling' });
      segmentPacket(s, ctx, { from: sampleLane2[0], to: sampleLane2[1], delay: BEAT.afterPulse, cat: 'scaling' });
    },
  },
  {
    id: 'scrape',
    duration: 2600,
    narration: 'metrics-server scrapes every kubelet resource endpoint on a short interval and pulls those samples up off the nodes. Two node readings fan into one central place. Nothing is written to disk, it is held in memory.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { source: SRC, window: WIN, consumers: CON });
      setChainActive(s.refs.chain, 1);
      s.refs.kubelet1.classList.add('highlight');
      s.refs.kubelet2.classList.add('highlight');
      s.refs.metricsBox.classList.add('highlight');
      if (ctx.reduced) return;
      // Fan-in: both kubelet readings rise into metrics-server. Boxes are infrastructure, no pulse.
      // The scrape hop is the resource endpoint, so one lane carries the real request string.
      s.refs.packetLayer.appendChild(laneWire(scrapeLane1));
      s.refs.packetLayer.appendChild(laneWire(scrapeLane2));
      routePacket(s, ctx, scrapeLane1, { cat: 'scaling' });
      routePacket(s, ctx, scrapeLane2, { cat: 'scaling' });
      ridingLabel(s, ctx, 'GET /metrics/resource', scrapeLane1);
    },
  },
  {
    id: 'serve',
    duration: 2200,
    narration: 'metrics-server aggregates the samples and exposes them as the metrics.k8s.io API through the aggregation layer. That is what makes the usage numbers look like a normal Kubernetes API to anyone who asks. The data itself still lives only in memory.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { source: SRC, window: WIN, consumers: CON });
      setChainActive(s.refs.chain, 2);
      s.refs.metricsBox.classList.add('highlight');
      s.refs.aggBox.classList.add('highlight');
      if (ctx.reduced) return;
      s.refs.packetLayer.appendChild(laneWire(serveLane));
      routePacket(s, ctx, serveLane, { cat: 'scaling' });
    },
  },
  {
    id: 'consumers',
    duration: 2200,
    narration: 'kubectl top and the HorizontalPodAutoscaler both read the metrics.k8s.io API. The same in-memory usage feeds a human running top and an autoscaler making decisions. These are the two intended consumers, nothing else should depend on it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { source: SRC, window: WIN, consumers: CON });
      setChainActive(s.refs.chain, 3);
      s.refs.aggBox.classList.add('highlight');
      s.refs.kubectlBox.classList.add('highlight');
      s.refs.hpaBox.classList.add('highlight');
      s.refs.consumersChip.classList.add('highlight');
      if (ctx.reduced) return;
      // Fan-out: the API answers both consumers.
      s.refs.packetLayer.appendChild(laneWire(conLaneKt));
      s.refs.packetLayer.appendChild(laneWire(conLaneHp));
      routePacket(s, ctx, conLaneKt, { cat: 'scaling' });
      routePacket(s, ctx, conLaneHp, { cat: 'scaling' });
    },
  },
  {
    id: 'caveat',
    duration: 2200,
    narration: 'Remember what this is not. metrics-server keeps only the latest scrape in memory and derives cpu as a rate over the last two samples, with no history at all. It is built for autoscaling and top, so do not treat it as monitoring, that is a separate system.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { source: SRC, window: WIN, consumers: CON });
      setChainActive(s.refs.chain, 4);
      // Conceptual close, no packet and no Pod action: the window fact flashes with metrics-server.
      s.refs.metricsBox.classList.add('highlight');
      s.refs.windowChip.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['metricsBox', 'windowChip']);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
