import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, chainList, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, topPacket, segmentPacket, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt } from '../lib/cluster-kit.js';

// Laid out on the L: the narration panel owns the top-left corner and nothing is drawn there.
// Measured worst case over 1600/1440/1280/1100 is x<=397, y<=195, so the API moves into the freed
// bottom-left and reaches Kubelet up a riser that clears the panel. That is what lets the content
// still span 60..1140 and centre on CX.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600
const PANEL_R = 400, PANEL_B = 215;                      // the reserved corner

const TOP_Y = 40, TOP_H = 80, TOP_BOTTOM = TOP_Y + TOP_H;// 40 / 120
const TOP_CY = TOP_Y + TOP_H / 2;                        // 80
const LANE_DY = 15;
const OUT_Y = TOP_CY - LANE_DY, BACK_Y = TOP_CY + LANE_DY;   // 65 / 95
const KUBE_X = 560, KUBE_W = 220, KUBE_R = KUBE_X + KUBE_W;  // 560..780
const RT_W = 240, RT_X = CONTENT_R - RT_W, RT_R = CONTENT_R; // 900..1140

const API_X = CONTENT_L, API_W = 240, API_H = 80;
const API_Y = 300, API_R = API_X + API_W;                // 60..300, 300..380
const API_CY = API_Y + API_H / 2;                        // 340
// Two risers, out left of back, so the vertical legs never share an x and never cross. Both clear
// the panel (x<=397). Each lane leaves its box offset by LANE_DY from that face centre, which is
// what the "symmetric about each box centre" comment on the arrows below has always claimed.
const RISER_OUT_X = 412, RISER_BACK_X = 436;
const API_OUT_Y = API_CY - LANE_DY, API_BACK_Y = API_CY + LANE_DY;   // 325 / 355
const API_TO_KUBE = [[API_R, API_OUT_Y], [RISER_OUT_X, API_OUT_Y], [RISER_OUT_X, OUT_Y], [KUBE_X, OUT_Y]];
const KUBE_TO_API = [[KUBE_X, BACK_Y], [RISER_BACK_X, BACK_Y], [RISER_BACK_X, API_BACK_Y], [API_R, API_BACK_Y]];

const LADDER_X = 640, LADDER_W = CONTENT_R - LADDER_X;   // 500, 640..1140
const LADDER_Y = 190, ROW_H = 32, ROW_GAP = 10;          // 5 rows -> 190..390

const CHIP_X = CONTENT_L, CHIP_W = 480;                  // 60..540, the category column width
const CHIP_H = 34, CHIP_GAP = 8;
const CHIP_Y = i => 430 + i * (CHIP_H + CHIP_GAP);       // 430 / 472 / 514 / 556

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Kubelet sync loop: watch, PLEG, SyncPod, CRI, status',
      'data-style': 'outline',
    });
    const content = g({ transform: 'translate(0, 0)' });
    content.appendChild(arrowDefs());

    const api     = box({ x: API_X, y: API_Y, w: API_W, h: API_H, label: 'API',  sublabel: 'spec source',  role: 'cluster' });
    const kubelet = box({ x: KUBE_X, y: TOP_Y, w: KUBE_W, h: TOP_H, label: 'Kubelet',    sublabel: 'on Node-1',    role: 'cluster' });
    const runtime = box({ x: RT_X, y: TOP_Y, w: RT_W, h: TOP_H, label: 'containerd', sublabel: 'CRI gRPC',     role: 'cluster' });

    // Top arrows, symmetric about each box centre (y=80, so +/-15 -> 65 and 95):
    // Api <-> Kubelet (watch + status PATCH), Kubelet <-> Runtime (CRI calls).
    content.appendChild(pathArrow({ points: API_TO_KUBE, dim: true, dashed: true, role: 'cluster' }));
    content.appendChild(pathArrow({ points: KUBE_TO_API, dim: true, dashed: true, role: 'cluster' }));
    content.appendChild(arrow({ x1: KUBE_R, y1: OUT_Y, x2: RT_X, y2: OUT_Y, dim: true, dashed: true, role: 'cluster' }));
    content.appendChild(arrow({ x1: RT_X, y1: BACK_Y, x2: KUBE_R, y2: BACK_Y, dim: true, dashed: true, role: 'cluster' }));

    // Wire labels (font-size: 9) in the gap between top row and pipeline.
    // Right-anchored just left of the out riser and above the API box: the longest string here is
    // ~135 units, three times the 112 unit gap it used to be centred in, so a centred label ran
    // through both risers.
    const wireApi = text({ class: 'scheme-label code dim', x: RISER_OUT_X - 8, y: API_Y - 12, 'text-anchor': 'end', 'font-size': 9 }, [' ']);
    const wireRT  = text({ class: 'scheme-label code dim', x: (KUBE_R + RT_X) / 2, y: TOP_BOTTOM + 28, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    [wireApi, wireRT].forEach(t => content.appendChild(t));

    // Pipeline chain: 5 stages of the Kubelet sync cycle.
    const chain = chainList({
      x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. watch     ·  pod specs from API',
        '2. PLEG      ·  observe containers via ListContainers',
        '3. SyncPod   ·  reconcile desired vs observed',
        '4. CRI       ·  Create/Start container gRPC',
        '5. status    ·  PATCH Pod containerStatuses',
      ],
      role: 'cluster',
    });

    // State chips column on the right.
    const podChip      = valChip({ x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'Pod',         value: 'none', role: 'cluster' });
    const desiredChip  = valChip({ x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'desired',     value: 'none', role: 'cluster' });
    const observedChip = valChip({ x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'observed',    value: 'none', role: 'cluster' });
    const lastOpChip   = valChip({ x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'last CRI op', value: 'none', role: 'cluster' });
    [podChip, desiredChip, observedChip, lastOpChip].forEach(c => content.appendChild(c));

    // Packet layer.
    const packetLayer = g({ id: 'packetLayer' });
    content.appendChild(packetLayer);

    // Chain LAST among middle blocks so it renders on top of packet layer.
    content.appendChild(chain);

    // Top-row blocks ABSOLUTE LAST.
    content.appendChild(api);
    content.appendChild(kubelet);
    content.appendChild(runtime);

    root.appendChild(content);
    this.host.appendChild(root);
    this.refs = {
      svg: root,
      api, kubelet, runtime, chain,
      podChip, desiredChip, observedChip, lastOpChip,
      packetLayer,
      wires: { api: wireApi, rt: wireRT },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['api','kubelet','runtime','podChip','desiredChip','observedChip','lastOpChip']);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.podChip, 'none');
      setVal(s.refs.desiredChip, 'none');
      setVal(s.refs.observedChip, 'none');
      setVal(s.refs.lastOpChip, 'none');
    },
  },
  {
    id: 'watch',
    duration: 1900,
    narration: 'The API streams an ADDED event for Pod my-app-7d4-abc bound to Node-1. The Kubelet source dispatcher routes the spec into podManager as desired state.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.podChip, 'my-app-7d4-abc');
      setVal(s.refs.desiredChip, '1 container');
      setVal(s.refs.observedChip, 'none');
      setVal(s.refs.lastOpChip, 'none');
      setWire(s, 'api', 'watch ADDED');
      s.refs.api.classList.add('highlight');
      s.refs.podChip.classList.add('highlight');
      s.refs.desiredChip.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[0]) rows[0].classList.add('highlight');
      if (ctx.reduced) { s.refs.kubelet.classList.add('highlight'); return; }
      const pkt = routePacket(s, ctx, API_TO_KUBE, { role: 'cluster' });
      lightBoxAt(s.refs.kubelet, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'pleg',
    duration: 2200,
    narration: 'PLEG (Pod Lifecycle Event Generator) wakes on its 1s timer, calls ListContainers on the runtime, and sees no containers for the new Pod. The empty observed state is recorded for SyncPod to act on.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.observedChip, '0 containers');
      setVal(s.refs.lastOpChip, 'ListContainers');
      setWire(s, 'rt', 'ListContainers');
      s.refs.kubelet.classList.add('highlight');
      s.refs.observedChip.classList.add('highlight');
      s.refs.lastOpChip.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[1]) rows[1].classList.add('highlight');
      if (ctx.reduced) { s.refs.runtime.classList.add('highlight'); return; }
      // ListContainers request out, the container list answers once it lands. PLEG asks, so the
      // Kubelet is lit from entry and the runtime lights when the call reaches it.
      const req = topPacket(s, ctx, { from: KUBE_R, to: RT_X, y: OUT_Y, role: 'cluster' });
      lightBoxAt(s.refs.runtime, ctx, req.arrivalMs);
      topPacket(s, ctx, { from: RT_X, to: KUBE_R, y: BACK_Y, delay: req.arrivalMs + BEAT.afterHop, role: 'cluster' });
    },
  },
  {
    id: 'syncpod',
    duration: 1900,
    narration: 'SyncPod runs for the new Pod, comparing desired state (1 container in spec) against observed state (0 containers). The diff is a single action: create and start the missing container. The per-Pod worker goroutine drives that sequence directly, with no separate action queue involved.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.kubelet.classList.add('highlight');
      s.refs.desiredChip.classList.add('highlight');
      s.refs.observedChip.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[2]) rows[2].classList.add('highlight');
      if (ctx.reduced) return;
    },
  },
  {
    id: 'cri',
    duration: 3000,
    narration: 'Kubelet issues CRI gRPC calls in sequence: RunPodSandbox creates the pause container with shared namespaces, then CreateContainer + StartContainer launch each container in the spec. Details of the sandbox setup are covered in the Pod Sandbox via CRI card.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.lastOpChip, 'StartContainer');
      setWire(s, 'rt', 'RunPodSandbox · Create · Start');
      s.refs.kubelet.classList.add('highlight');
      s.refs.lastOpChip.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[3]) rows[3].classList.add('highlight');
      if (ctx.reduced) { s.refs.runtime.classList.add('highlight'); return; }
      // Three packets sequenced for RunPodSandbox, CreateContainer, StartContainer.
      const sandbox = segmentPacket(s, ctx, { from: [KUBE_R, OUT_Y], to: [RT_X, OUT_Y], role: 'cluster' });
      lightBoxAt(s.refs.runtime, ctx, sandbox.arrivalMs);
      const create = segmentPacket(s, ctx, { from: [KUBE_R, OUT_Y], to: [RT_X, OUT_Y], delay: sandbox.arrivalMs + BEAT.afterHop, role: 'cluster' });
      segmentPacket(s, ctx, { from: [KUBE_R, OUT_Y], to: [RT_X, OUT_Y], delay: create.arrivalMs + BEAT.afterHop, role: 'cluster' });
    },
  },
  {
    id: 'status',
    duration: 2000,
    narration: 'Next PLEG cycle observes the running container, observed state catches up to desired state, and SyncPod issues no new CRI calls. Kubelet PATCHes Pod status (containerStatuses) back to the API. The loop is ready for the next change.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.observedChip, '1 running');
      setVal(s.refs.lastOpChip, 'ListContainers');
      s.refs.lastOpChip.classList.add('highlight');
      setWire(s, 'api', 'PATCH .../pods/{name}/status');
      s.refs.kubelet.classList.add('highlight');
      s.refs.observedChip.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[4]) rows[4].classList.add('highlight');
      if (ctx.reduced) { s.refs.api.classList.add('highlight'); return; }
      const pkt = routePacket(s, ctx, KUBE_TO_API, { role: 'cluster' });
      lightBoxAt(s.refs.api, ctx, pkt.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
