import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, chainList, setChainActive, arrow, pathArrow } from '../../lib/primitives.js';
import { valChip, setVal, topPacket, segmentPacket, routePacket, makeInit, clearHighlights, clearWires, setWire, relationPath, BEAT, lightBoxAt, at } from './cluster-kit.js';
// Design notes for this card: ./CARDS.md#cluster-kubelet-sync-loop

// Laid out on the L. Panel x<=397 y<=255 (269 at 1024x768) against the API box at y=300, so the
// CEILING is 360 characters per narration: 362 costs one more line and lands 1024x768 on 296.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600

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
// the panel, each offset by LANE_DY from its face centre.
const RISER_OUT_X = 412, RISER_BACK_X = 436;
const API_OUT_Y = API_CY - LANE_DY, API_BACK_Y = API_CY + LANE_DY;   // 325 / 355
const API_TO_KUBE = [[API_R, API_OUT_Y], [RISER_OUT_X, API_OUT_Y], [RISER_OUT_X, OUT_Y], [KUBE_X, OUT_Y]];
const KUBE_TO_API = [[KUBE_X, BACK_Y], [RISER_BACK_X, BACK_Y], [RISER_BACK_X, API_BACK_Y], [API_R, API_BACK_Y]];

const LADDER_X = 640, LADDER_W = CONTENT_R - LADDER_X;   // 500, 640..1140
const LADDER_Y = 190, ROW_H = 32, ROW_GAP = 10;          // 5 rows -> 190..390

// The Kubelet owns EVERY ladder row, so the tie is a RELATIONSHIP: no ball, no arrowhead. Face
// midpoint to face midpoint, turn halfway between, and the whole band stays free for it.
const KUBE_CX = KUBE_X + KUBE_W / 2;                     // 670
const LADDER_CX = LADDER_X + LADDER_W / 2;               // 890
const TIE_JOG_Y = (TOP_BOTTOM + LADDER_Y) / 2;           // 155
const KUBE_TO_CHAIN = [[KUBE_CX, TOP_BOTTOM], [KUBE_CX, TIE_JOG_Y], [LADDER_CX, TIE_JOG_Y], [LADDER_CX, LADDER_Y]];

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

    // Kubelet.bottom -> ladder.top: the loop below belongs to this box. See KUBE_TO_CHAIN above.
    content.appendChild(relationPath({ points: KUBE_TO_CHAIN, role: 'cluster' }));

    // Wire labels between top row and pipeline, right-anchored left of the out riser: the longest
    // string is 193 units against a 112 unit gap, so a centred label runs through both risers.
    const wireApi = text({ class: 'scheme-label code dim', x: RISER_OUT_X - 8, y: API_Y - 12, 'text-anchor': 'end' }, [' ']);
    // ABOVE the top row, not below it: the band below belongs to the Kubelet-to-ladder tie now.
    // TOP_Y - 14 is where cluster-node-drain, cluster-oom-kill and cluster-node-failure put theirs.
    const wireRT  = text({ class: 'scheme-label code dim', x: (KUBE_R + RT_X) / 2, y: TOP_Y - 14, 'text-anchor': 'middle' }, [' ']);
    [wireApi, wireRT].forEach(t => content.appendChild(t));

    // Pipeline chain: 5 stages of the Kubelet sync cycle.
    const chain = chainList({
      x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. watch     ·  pod specs from API',
        '2. PLEG      ·  observe containers via ListContainers',
        '3. SyncPod   ·  reconcile desired vs observed',
        '4. CRI       ·  Pull/Create/Start container gRPC',
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

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  clearHighlights(s, ['api','kubelet','runtime','podChip','desiredChip','observedChip','lastOpChip']);
  clearWires(s);
}

// Every chip reports what the Kubelet has LEARNED or DONE, so each waits for the packet that earns
// it. Every enter() writes EVERY one, or clicking Next mid-flight loses whatever at() was holding.
function setChips(s, { pod, desired, observed, lastOp }) {
  setVal(s.refs.podChip, pod);
  setVal(s.refs.desiredChip, desired);
  setVal(s.refs.observedChip, observed);
  setVal(s.refs.lastOpChip, lastOp);
}
const POD_NAME = 'my-app-7d4-abc', SPEC = '1 container';

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      resetStep(s);
      setChips(s, { pod: 'none', desired: 'none', observed: 'none', lastOp: 'none' });
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'watch',
    duration: 1900,
    narration: 'The API streams an ADDED event for Pod my-app-7d4-abc bound to Node-1. The Kubelet merges its spec sources into one update channel, and the sync loop records the Pod in podManager as desired state.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { pod: POD_NAME, desired: SPEC, observed: 'none', lastOp: 'none' });
      setWire(s, 'api', 'watch ADDED');
      s.refs.api.classList.add('highlight');
      s.refs.podChip.classList.add('highlight');
      s.refs.desiredChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) { s.refs.kubelet.classList.add('highlight'); return; }
      // podManager holds the spec once the event REACHES the Kubelet, so both chips wait for the
      // ball rather than describing a desired state the Node has not been told about yet.
      setVal(s.refs.podChip, 'none');
      setVal(s.refs.desiredChip, 'none');
      const pkt = routePacket(s, ctx, API_TO_KUBE, { role: 'cluster' });
      lightBoxAt(s.refs.kubelet, ctx, pkt.arrivalMs);
      at(s, ctx, pkt.arrivalMs, () => {
        setVal(s.refs.podChip, 'my-app-7d4-abc');
        setVal(s.refs.desiredChip, '1 container');
      });
    },
  },
  {
    id: 'pleg',
    duration: 2200,
    narration: 'PLEG (Pod Lifecycle Event Generator) wakes on its 1s timer, calls ListContainers on the runtime, and sees no containers for the new Pod. The empty observed state is recorded for SyncPod. The EventedPLEG feature gate (alpha, off by default) has the runtime push lifecycle events over CRI, so the Kubelet relists at a reduced rate rather than on its 1s timer.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { pod: POD_NAME, desired: SPEC, observed: '0 containers', lastOp: 'ListContainers' });
      setWire(s, 'rt', 'ListContainers');
      s.refs.kubelet.classList.add('highlight');
      s.refs.observedChip.classList.add('highlight');
      s.refs.lastOpChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) { s.refs.runtime.classList.add('highlight'); return; }
      // PLEG asks, so the Kubelet is lit from entry and the runtime lights on arrival. The two chips
      // land on different beats: the op when the call arrives, the observation when the answer does.
      setVal(s.refs.observedChip, 'none');
      setVal(s.refs.lastOpChip, 'none');
      const req = topPacket(s, ctx, { from: KUBE_R, to: RT_X, y: OUT_Y, role: 'cluster' });
      lightBoxAt(s.refs.runtime, ctx, req.arrivalMs);
      at(s, ctx, req.arrivalMs, () => setVal(s.refs.lastOpChip, 'ListContainers'));
      const ans = topPacket(s, ctx, { from: RT_X, to: KUBE_R, y: BACK_Y, delay: req.arrivalMs + BEAT.afterHop, role: 'cluster' });
      at(s, ctx, ans.arrivalMs, () => setVal(s.refs.observedChip, '0 containers'));
    },
  },
  {
    id: 'syncpod',
    duration: 1900,
    narration: 'SyncPod runs for the new Pod, comparing desired state (1 container in spec) against observed state (0 containers). The diff is a single action: create and start the missing container. The per-Pod worker goroutine drives that sequence directly, with no separate action queue involved.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { pod: POD_NAME, desired: SPEC, observed: '0 containers', lastOp: 'ListContainers' });
      s.refs.kubelet.classList.add('highlight');
      s.refs.desiredChip.classList.add('highlight');
      s.refs.observedChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
    },
  },
  {
    id: 'cri',
    // Four calls, four packets: 3660ms. PullImage cost the step 800 (a 120 unit hop sits on the
    // PKT_DUR_MIN floor of 700, plus BEAT.afterHop), so duration follows it up from 3000.
    duration: 3800,
    narration: 'Kubelet issues CRI gRPC calls in sequence: RunPodSandbox creates the pause container with shared namespaces, PullImage fetches the image unless it is already on the Node, then CreateContainer and StartContainer launch each container in the spec. Details of the sandbox setup are covered in the Pod Sandbox via CRI card.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { pod: POD_NAME, desired: SPEC, observed: '0 containers', lastOp: 'StartContainer' });
      setWire(s, 'rt', 'RunPodSandbox · Pull · Create · Start');
      s.refs.kubelet.classList.add('highlight');
      s.refs.lastOpChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.runtime.classList.add('highlight'); return; }
      // One packet per call the narration names, in order, and the chip names each as it lands: the
      // step is a SEQUENCE, so a chip reading StartContainer from entry skips three quarters of it.
      setVal(s.refs.lastOpChip, 'ListContainers');
      const CALLS = ['RunPodSandbox', 'PullImage', 'CreateContainer', 'StartContainer'];
      let delay = 0;
      CALLS.forEach((name, i) => {
        const pkt = segmentPacket(s, ctx, { from: [KUBE_R, OUT_Y], to: [RT_X, OUT_Y], delay, role: 'cluster' });
        if (i === 0) lightBoxAt(s.refs.runtime, ctx, pkt.arrivalMs);
        at(s, ctx, pkt.arrivalMs, () => setVal(s.refs.lastOpChip, name));
        delay = pkt.arrivalMs + BEAT.afterHop;
      });
    },
  },
  {
    id: 'status',
    // Motion: the PLEG round trip to the runtime (700 out, 700 back with a beat between), then
    // the PATCH down the riser to the API, ending at 3316.
    duration: 3600,
    narration: 'Next PLEG cycle observes the running container, observed state catches up to desired state, and SyncPod issues no new CRI calls. Kubelet PATCHes Pod status (containerStatuses) back to the API. The loop is ready for the next change.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { pod: POD_NAME, desired: SPEC, observed: '1 container running', lastOp: 'ListContainers' });
      s.refs.lastOpChip.classList.add('highlight');
      setWire(s, 'api', 'PATCH .../pods/{name}/status');
      s.refs.kubelet.classList.add('highlight');
      s.refs.observedChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) { s.refs.runtime.classList.add('highlight'); s.refs.api.classList.add('highlight'); return; }
      // The sentence OPENS with the next PLEG cycle observing the container and only THEN PATCHes,
      // so both ride. The chips carry the same order: the step starts holding what CRI left.
      setVal(s.refs.observedChip, '0 containers');
      setVal(s.refs.lastOpChip, 'StartContainer');
      const list = topPacket(s, ctx, { from: KUBE_R, to: RT_X, y: OUT_Y, role: 'cluster' });
      lightBoxAt(s.refs.runtime, ctx, list.arrivalMs);
      at(s, ctx, list.arrivalMs, () => setVal(s.refs.lastOpChip, 'ListContainers'));
      const seen = topPacket(s, ctx, { from: RT_X, to: KUBE_R, y: BACK_Y, delay: list.arrivalMs + BEAT.afterHop, role: 'cluster' });
      at(s, ctx, seen.arrivalMs, () => setVal(s.refs.observedChip, '1 container running'));
      const pkt = routePacket(s, ctx, KUBE_TO_API, { delay: seen.arrivalMs + BEAT.afterHop, role: 'cluster' });
      lightBoxAt(s.refs.api, ctx, pkt.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
