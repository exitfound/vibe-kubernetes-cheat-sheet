import { svg, g, text, path } from '../lib/svg.js';
import { arrowDefs, box, pod, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, flashChips, BEAT,
} from '../lib/scaling-kit.js';

// FOUNDATIONS card: the three metrics APIs. The HPA can scale on three different kinds of metric, and
// each kind arrives through its OWN aggregated API: metrics.k8s.io (resource cpu/mem from
// metrics-server), custom.metrics.k8s.io (per-object application metrics from an adapter such as the
// Prometheus Adapter), and external.metrics.k8s.io (metrics not tied to any Kubernetes object, like a
// cloud queue length). The HPA picks the API by the metric type named in its spec, and all three are
// served as extension APIs through the aggregation layer.
//
// GEOMETRY. Three API boxes sit across the top (right of the overlay), the aggregation layer is a bar
// they all plug into, and the HPA sits centered below reading whichever one its spec names, then acts
// on a small workload row. The active source lights and sends a packet down to the HPA per step. Only
// the Pods pulse, every API and the HPA are infrastructure and light via .highlight.
const SPINE_X = 800;

const RS_X = 420, CU_X = 684, EX_X = 948;   // resource / custom / external API columns
const API_Y = 80, API_W = 232, API_H = 76;
const RS_CX = RS_X + API_W / 2, CU_CX = CU_X + API_W / 2, EX_CX = EX_X + API_W / 2;
const API_BOTTOM = API_Y + API_H;

const AG_X = 420, AG_Y = 182, AG_W = 760, AG_H = 36;   // aggregation layer bar

const HPA_X = 690, HPA_Y = 270, HPA_W = 220, HPA_H = 76;   // HPA, center 800
const HPA_TOP = HPA_Y, HPA_BOTTOM = HPA_Y + HPA_H;

const SLOTS = 5;
const P_W = 96, P_H = 110, P_GAP = 28;
const ROW_Y = 400;
const ROW_W = SLOTS * P_W + (SLOTS - 1) * P_GAP;
const ROW_X0 = SPINE_X - ROW_W / 2;
const slotX = i => ROW_X0 + i * (P_W + P_GAP);
const slotCX = i => slotX(i) + P_W / 2;

const API_BUS = 244;    // API lanes drop onto this bus (below the aggregation layer) before the HPA
const ROW_BUS = 378;    // the patch lane drops onto this bus above the row
const CHIPS_Y = 556;

const resourceLane = [[RS_CX, API_BOTTOM], [RS_CX, API_BUS], [SPINE_X, API_BUS], [SPINE_X, HPA_TOP]];
const customLane   = [[CU_CX, API_BOTTOM], [SPINE_X, HPA_TOP]];  // custom column is centered on the HPA
const externalLane = [[EX_CX, API_BOTTOM], [EX_CX, API_BUS], [SPINE_X, API_BUS], [SPINE_X, HPA_TOP]];
const patchLane = i => [[SPINE_X, HPA_BOTTOM], [SPINE_X, ROW_BUS], [slotCX(i), ROW_BUS], [slotCX(i), ROW_Y]];

function laneWire(points) {
  const d = 'M ' + points.map(p => p.join(' ')).join(' L ');
  return path({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-scaling', d, 'stroke-dasharray': '5 5', fill: 'none' });
}

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

function buildReplica(i) {
  const x = slotX(i), y = ROW_Y;
  const shell = pod({ x, y, w: P_W, h: P_H, label: 'web', containers: 0, cat: 'scaling' });
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
      'aria-label': 'The three metrics APIs that feed the HorizontalPodAutoscaler. metrics.k8s.io carries resource cpu and memory from metrics-server, custom.metrics.k8s.io carries per-object application metrics from an adapter, and external.metrics.k8s.io carries metrics not tied to any Kubernetes object such as a cloud queue length. The HPA picks the API by the metric type named in its spec, and all three plug into the aggregation layer as extension APIs.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const resourceBox = box({ x: RS_X, y: API_Y, w: API_W, h: API_H, label: 'metrics.k8s.io', sublabel: 'metrics-server', cat: 'scaling' });
    const customBox   = box({ x: CU_X, y: API_Y, w: API_W, h: API_H, label: 'custom.metrics.k8s.io', sublabel: 'Prometheus Adapter', cat: 'scaling' });
    const externalBox = box({ x: EX_X, y: API_Y, w: API_W, h: API_H, label: 'external.metrics.k8s.io', sublabel: 'cloud queue', cat: 'scaling' });
    const aggBox      = box({ x: AG_X, y: AG_Y, w: AG_W, h: AG_H, label: 'aggregation layer  extension APIs', cat: 'scaling' });
    const hpaBox      = box({ x: HPA_X, y: HPA_Y, w: HPA_W, h: HPA_H, label: 'HPA', sublabel: 'reads one API', cat: 'scaling' });

    const replicas = [];
    for (let i = 0; i < SLOTS; i++) replicas.push(buildReplica(i));
    const rowGroup = g({});
    replicas.forEach(r => rowGroup.appendChild(r.wrap));

    const resourceChip = valChip({ x: 120, y: CHIPS_Y, w: 300, h: 34, name: 'resource', value: 'cpu / mem',     cat: 'scaling' });
    const customChip   = valChip({ x: 450, y: CHIPS_Y, w: 320, h: 34, name: 'custom',   value: 'http_requests', cat: 'scaling' });
    const externalChip = valChip({ x: 800, y: CHIPS_Y, w: 300, h: 34, name: 'external', value: 'queue depth',   cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): the three APIs and aggregation layer and HPA, then the replica row,
    // then the chip strip, then the packet layer on top.
    [resourceBox, customBox, externalBox, aggBox, hpaBox].forEach(el => root.appendChild(el));
    root.appendChild(rowGroup);
    [resourceChip, customChip, externalChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, resourceBox, customBox, externalBox, aggBox, hpaBox, replicas,
      resourceChip, customChip, externalChip,
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
function setChips(s, { resource, custom, external }) {
  setChip(s.refs.resourceChip, resource);
  setChip(s.refs.customChip, custom);
  setChip(s.refs.externalChip, external);
}

function setRow(s, visibleCount) {
  s.refs.replicas.forEach((r, i) => {
    r.wrap.style.opacity = i < visibleCount ? '1' : '0';
    r.wrap.style.transform = 'translate(0px, 0px)';
  });
}

function clearHL(s) {
  clearHighlights(s, ['resourceBox', 'customBox', 'externalBox', 'aggBox', 'hpaBox', 'resourceChip', 'customChip', 'externalChip'],
    s.refs.replicas.map(r => r.wrap));
}

const RES = 'cpu / mem', CUS = 'http_requests', EXT = 'queue depth';

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'One HPA can scale on cpu, on requests per second, or on a cloud queue length. Each of those arrives through its own aggregated API. The HPA in the middle reads whichever one its spec names, and drives the workload below.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { resource: RES, custom: CUS, external: EXT });
      setRow(s, 3);
    },
  },
  {
    id: 'resource',
    duration: 2200,
    narration: 'The first API is metrics.k8s.io, the resource API. It carries cpu and memory usage and is served by metrics-server. This is the default and most common source, the one a plain cpu-target HPA reads.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { resource: RES, custom: CUS, external: EXT });
      setRow(s, 3);
      s.refs.resourceBox.classList.add('highlight');
      s.refs.aggBox.classList.add('highlight');
      s.refs.hpaBox.classList.add('highlight');
      s.refs.resourceChip.classList.add('highlight');
      if (ctx.reduced) return;
      s.refs.packetLayer.appendChild(laneWire(resourceLane));
      routePacket(s, ctx, resourceLane, { cat: 'scaling' });
      ridingLabel(s, ctx, 'GET metrics.k8s.io  cpu', resourceLane);
    },
  },
  {
    id: 'custom',
    duration: 2200,
    narration: 'The second API is custom.metrics.k8s.io. It carries per-object application metrics, such as http_requests per Pod, and is served by an adapter like the Prometheus Adapter. It lets the HPA scale on what the application itself reports.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { resource: RES, custom: CUS, external: EXT });
      setRow(s, 3);
      s.refs.customBox.classList.add('highlight');
      s.refs.aggBox.classList.add('highlight');
      s.refs.hpaBox.classList.add('highlight');
      s.refs.customChip.classList.add('highlight');
      if (ctx.reduced) return;
      s.refs.packetLayer.appendChild(laneWire(customLane));
      routePacket(s, ctx, customLane, { cat: 'scaling' });
      ridingLabel(s, ctx, 'GET custom.metrics.k8s.io  http_requests', customLane);
    },
  },
  {
    id: 'external',
    duration: 2200,
    narration: 'The third API is external.metrics.k8s.io. It carries metrics that are not tied to any Kubernetes object, like the depth of a cloud message queue. The HPA can scale a workload on a signal that lives entirely outside the cluster.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { resource: RES, custom: CUS, external: EXT });
      setRow(s, 3);
      s.refs.externalBox.classList.add('highlight');
      s.refs.aggBox.classList.add('highlight');
      s.refs.hpaBox.classList.add('highlight');
      s.refs.externalChip.classList.add('highlight');
      if (ctx.reduced) return;
      s.refs.packetLayer.appendChild(laneWire(externalLane));
      routePacket(s, ctx, externalLane, { cat: 'scaling' });
      ridingLabel(s, ctx, 'GET external.metrics.k8s.io  queue', externalLane);
    },
  },
  {
    id: 'routing',
    duration: 3400,
    narration: 'The HPA reads whichever API the metric type in its spec names. Here it targets custom.metrics.k8s.io, so it pulls http_requests from that API, computes a desired count, and PATCHes the workload, which grows. Point the spec at a different type and a different API answers.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { resource: RES, custom: CUS, external: EXT });
      setRow(s, 4);
      s.refs.customBox.classList.add('highlight');
      s.refs.hpaBox.classList.add('highlight');
      s.refs.customChip.classList.add('highlight');
      if (ctx.reduced) return;
      // The named API answers the HPA, then the HPA PATCHes the row and a new replica rises and
      // pulses on arrival (down-arrow: packet first, pulse on arrival).
      s.refs.packetLayer.appendChild(laneWire(customLane));
      const read = routePacket(s, ctx, customLane, { cat: 'scaling' });
      ridingLabel(s, ctx, 'GET custom.metrics.k8s.io  http_requests', customLane);
      const lane = patchLane(3);
      s.refs.packetLayer.appendChild(laneWire(lane));
      const give = routePacket(s, ctx, lane, { delay: read.arrivalMs + BEAT.afterHop, cat: 'scaling' });
      const w = s.refs.replicas[3].wrap;
      w.style.opacity = '0';
      w.style.transform = 'translate(0px, 14px)';
      ctx.register(w.animate(
        [{ opacity: 0, transform: 'translate(0px, 14px)' }, { opacity: 1, transform: 'translate(0px, 0px)' }],
        { duration: 360, delay: give.arrivalMs, fill: 'forwards', easing: 'ease-out' },
      ));
      pulsePod(w, ctx, give.arrivalMs + 120);
    },
  },
  {
    id: 'layer',
    duration: 2200,
    narration: 'All three are served the same way, as extension APIs plugged into the aggregation layer. That is why the HPA reads resource, custom, and external metrics through one uniform mechanism. The type in the spec is the only thing that changes which one answers.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { resource: RES, custom: CUS, external: EXT });
      setRow(s, 4);
      // Conceptual close, no packet and no Pod action: all three APIs and the layer flash together.
      s.refs.resourceBox.classList.add('highlight');
      s.refs.customBox.classList.add('highlight');
      s.refs.externalBox.classList.add('highlight');
      s.refs.aggBox.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['resourceBox', 'customBox', 'externalBox', 'aggBox']);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
