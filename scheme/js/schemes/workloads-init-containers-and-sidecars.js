import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, topPacket, routePacket, makeInit, clearHighlights, clearWires, setWire, lightBoxAt, BEAT, WL } from '../lib/workloads-kit.js';

// Layout B of the Workloads canon (WL): chips left, pipeline right, spine into the Pod.
// Panel worst case x<=397, y<=255; a longer narration invalidates that measurement.
// Design notes for this card: scheme/docs/CARDS.md#workloads-init-containers-and-sidecars
const PANEL_B = 255;
const TOP1_X = 420, TOP1_W = 220;
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = 220;
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const REQ_Y = TOP_CY - WL.LANE_DY, RESP_Y = TOP_CY + WL.LANE_DY;
const WIRE_X = (TOP1_X + TOP1_W + TOP2_X) / 2;
const WIRE_Y = WL.TOP_Y - 12;                            // above the actor row, off the spine

const LAD_X = WL.CHIP_X, LAD_W = WL.CHIP_W;              // 660..1140, the pipeline
const LAD_Y = 160;                                       // 5 rows -> 160..360

// Chips as a column in the left band, which only opens below the panel.
const CHIP_GAP = 8;
const CHIPS_TOP = PANEL_B + 20;                          // 275
const CHIP_X = WL.LADDER_X, CHIP_W = WL.LADDER_W;        // 60..540
const CHIP_Y = i => CHIPS_TOP + i * (WL.CHIP_H + CHIP_GAP);   // 275..435

const NODE_H = 140, CANVAS_B = 624;
const NODE_Y = CANVAS_B - NODE_H;                        // 484..624, the frame rests on the floor

// Pod shell and its four containers, solved once so the row stays centred in the Node frame.
const POD_W = 828, POD_H = 106;
const POD_X = WL.CX - POD_W / 2;                            // 186..1014, centred on CX
const POD_Y = NODE_Y + (NODE_H - POD_H) / 2;                // 501..607, centred in the frame
const C_PAD = 10, C_GAP = 16, C_H = 52;
const C_W = (POD_W - C_PAD * 2 - C_GAP * 3) / 4;            // 190
const C_Y = POD_Y + 28;                                     // the family inner-box offset

// The spine steps into the central corridor between the two columns and reaches the Pod itself,
// not the frame edge above it.
const TOP1_CX = TOP1_X + TOP1_W / 2;                     // 530
const JOG_Y = WL.TOP_BOTTOM + 20;                        // 140, below the boxes, above the ladder
const SPINE = [[TOP1_CX, WL.TOP_BOTTOM], [TOP1_CX, JOG_Y], [WL.SPINE_X, JOG_Y], [WL.SPINE_X, POD_Y]];

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Init containers and native sidecars: strictly sequential bootstrap, sidecar gates main, then parallel run',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubelet = box({ x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'container orchestrator', role: 'cluster' });
    const runtime = box({ x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'Runtime', sublabel: 'containerd · CRI',       role: 'cluster' });

    root.appendChild(arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }));

    // Wire label above the top row, so the spine leaving the Kubelet box does not strike it.
    const wireReq = text({ class: 'scheme-label code dim', x: WIRE_X, y: WIRE_Y, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    // State chip column in the left band: one chip per container.
    const waitDbChip  = valChip({ x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'wait-for-db',    value: 'Waiting', role: 'workloads' });
    const migrateChip = valChip({ x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'migrate-schema', value: 'Waiting', role: 'workloads' });
    const sidecarChip = valChip({ x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'sidecar',        value: 'Waiting', role: 'workloads' });
    const mainChip    = valChip({ x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'main',           value: 'Waiting', role: 'workloads' });
    [waitDbChip, migrateChip, sidecarChip, mainChip].forEach(c => root.appendChild(c));

    // Pipeline chain on the right, 5 phases of the container startup.
    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP,
      items: [
        '1. wait-for-db    ·  first init container, must exit 0',
        '2. migrate-schema ·  next init, after #1 succeeds',
        '3. sidecar        ·  Always-restart initC, gates main',
        '4. main           ·  starts when sidecar reports Started',
        '5. running        ·  sidecar + main in parallel until term',
      ],
      role: 'cluster',
    });

    const nodeEl = node({ x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' });

    // These four are containers of ONE Pod, so the Pod has to be on the canvas: without a shell
    // there was nothing for a pulse to belong to.
    const podShell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod app-7d4', sublabel: ' ', containers: 0, role: 'workloads' });
    const podShellRect = podShell.querySelector('.scheme-pod-rect');
    if (podShellRect) podShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const cx = i => POD_X + C_PAD + i * (C_W + C_GAP);
    const containerWaitDb   = box({ x: cx(0), y: C_Y, w: C_W, h: C_H, label: 'wait-for-db',    sublabel: 'init container',       role: 'cluster'   });
    const containerMigrate  = box({ x: cx(1), y: C_Y, w: C_W, h: C_H, label: 'migrate-schema', sublabel: 'init container',       role: 'cluster'   });
    const containerSidecar  = box({ x: cx(2), y: C_Y, w: C_W, h: C_H, label: 'sidecar',        sublabel: 'restartPolicy=Always', role: 'cluster'   });
    const containerMain     = box({ x: cx(3), y: C_Y, w: C_W, h: C_H, label: 'main',           sublabel: 'app-server',           role: 'cluster'   });

    const podGroup = g({ id: 'podGroup' });
    podGroup.appendChild(podShell);
    [containerWaitDb, containerMigrate, containerSidecar, containerMain].forEach(c => podGroup.appendChild(c));

    // Connector from the Kubelet box into the Pod, down the central corridor.
    const connector = pathArrow({
      points: SPINE,
      dim: true, dashed: true, role: 'cluster',
    });
    root.appendChild(connector);

    // Packet layer.
    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    // Z-order: chain, node, containers, then top-row blocks last.
    root.appendChild(chain);
    root.appendChild(nodeEl);
    root.appendChild(podGroup);
    root.appendChild(runtime);
    root.appendChild(kubelet);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubelet, runtime, chain, nodeEl, connector,
      waitDbChip, migrateChip, sidecarChip, mainChip,
      podShell, podGroup, containerWaitDb, containerMigrate, containerSidecar, containerMain,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['kubelet','runtime','waitDbChip','migrateChip','sidecarChip','mainChip',
     'containerWaitDb','containerMigrate','containerSidecar','containerMain'],
    [s.refs.podGroup]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Pod spec declares two init containers (wait-for-db, migrate-schema), one native sidecar (an initContainer with restartPolicy=Always, on by default since 1.29 and GA since 1.33) and the main app container. Kubelet has received the spec via SyncPod and is about to run the containers in the order the spec demands. Pod phase stays Pending for the whole bootstrap, while the kubectl STATUS column moves from Init:0/3 to PodInitializing as the containers progress.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.waitDbChip, 'Waiting');
      setVal(s.refs.migrateChip, 'Waiting');
      setVal(s.refs.sidecarChip, 'Waiting');
      setVal(s.refs.mainChip, 'Waiting');
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'wait-for-db',
    duration: 2600,
    narration: 'Kubelet asks the runtime to Create and Start wait-for-db via CRI. Init containers run strictly sequentially: each one must exit with code 0 before the next can start. A non-zero exit keeps the Pod in Init:0/3 with a Kubelet restart-backoff (respecting Pod.spec.restartPolicy).',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.waitDbChip, 'Running');
      setVal(s.refs.migrateChip, 'Waiting');
      setVal(s.refs.sidecarChip, 'Waiting');
      setVal(s.refs.mainChip, 'Waiting');
      setWire(s, 'req', 'CreateContainer · StartContainer · wait-for-db');
      s.refs.kubelet.classList.add('highlight');
      s.refs.waitDbChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) { s.refs.containerWaitDb.classList.add('highlight'); s.refs.runtime.classList.add('highlight'); return; }
      // CRI request hits the runtime (top hop), then the create travels down to
      // the node and the container box lights up on arrival.
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.runtime, ctx, req.arrivalMs);
      const create = routePacket(s, ctx, SPINE, { delay: req.arrivalMs + BEAT.afterHop, fadeIn: true, role: 'workloads' });
      lightBoxAt(s.refs.containerWaitDb, ctx, create.arrivalMs);
    },
  },
  {
    id: 'migrate-schema',
    duration: 3400,
    narration: 'The wait-for-db container exits 0. Kubelet observes the exit via PLEG (Pod Lifecycle Event Generator) and immediately creates migrate-schema. The same rule applies, it must exit 0 before any later container can start. Each init container image is pulled lazily, just before that container is created, per its imagePullPolicy.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.waitDbChip, 'Completed');
      s.refs.waitDbChip.classList.add('highlight');
      setVal(s.refs.migrateChip, 'Running');
      setVal(s.refs.sidecarChip, 'Waiting');
      setVal(s.refs.mainChip, 'Waiting');
      setWire(s, 'req', 'wait-for-db exit 0 (PLEG) · StartContainer · migrate-schema');
      s.refs.kubelet.classList.add('highlight');
      s.refs.runtime.classList.add('highlight');
      s.refs.migrateChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) { s.refs.containerMigrate.classList.add('highlight'); return; }
      // PLEG callback Runtime -> Kubelet, then the next CRI request Kubelet -> Runtime,
      // then the create travels down to the node, each hop chained on the previous arrival.
      const pleg = topPacket(s, ctx, { from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, role: 'workloads' });
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, delay: pleg.arrivalMs + BEAT.afterHop, role: 'workloads' });
      const create = routePacket(s, ctx, SPINE, { delay: req.arrivalMs + BEAT.afterHop, fadeIn: true, role: 'workloads' });
      lightBoxAt(s.refs.containerMigrate, ctx, create.arrivalMs);
    },
  },
  {
    id: 'sidecar-start',
    duration: 2600,
    narration: 'Both regular init containers exited 0. The sidecar (declared as an initContainer with restartPolicy=Always since 1.29) is started next, allowed to run for the full lifetime of the Pod. Once it reports Started (its startupProbe succeeded, or immediately if no probe is set), Kubelet treats the bootstrap phase as complete and unblocks the main container.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.waitDbChip, 'Completed');
      setVal(s.refs.migrateChip, 'Completed');
      s.refs.migrateChip.classList.add('highlight');
      setVal(s.refs.sidecarChip, 'Started');
      setVal(s.refs.mainChip, 'Waiting');
      setWire(s, 'req', 'migrate-schema exit 0 · StartContainer · sidecar');
      s.refs.kubelet.classList.add('highlight');
      s.refs.sidecarChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) { s.refs.containerSidecar.classList.add('highlight'); s.refs.runtime.classList.add('highlight'); return; }
      // CRI request hop, then the sidecar create lands on the node on arrival.
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.runtime, ctx, req.arrivalMs);
      const create = routePacket(s, ctx, SPINE, { delay: req.arrivalMs + BEAT.afterHop, fadeIn: true, role: 'workloads' });
      lightBoxAt(s.refs.containerSidecar, ctx, create.arrivalMs);
    },
  },
  {
    id: 'main-start',
    duration: 2600,
    narration: 'As soon as the sidecar Started flag flips true, Kubelet creates and starts the main container. From here both run in parallel. Pod phase flips from Pending to Running once the main container has started.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.waitDbChip, 'Completed');
      setVal(s.refs.migrateChip, 'Completed');
      setVal(s.refs.sidecarChip, 'Running');
      s.refs.sidecarChip.classList.add('highlight');
      setVal(s.refs.mainChip, 'Starting');
      setWire(s, 'req', 'sidecar Started · StartContainer · main');
      s.refs.kubelet.classList.add('highlight');
      s.refs.mainChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.containerMain.classList.add('highlight'); s.refs.runtime.classList.add('highlight'); return; }
      // CRI request hop, then the main create lands on the node on arrival.
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.runtime, ctx, req.arrivalMs);
      const create = routePacket(s, ctx, SPINE, { delay: req.arrivalMs + BEAT.afterHop, fadeIn: true, role: 'workloads' });
      lightBoxAt(s.refs.containerMain, ctx, create.arrivalMs);
    },
  },
  {
    id: 'running',
    duration: 2000,
    narration: 'Pod is Running. The sidecar handles cross-cutting concerns (proxy, log shipping, credential rotation) alongside main. Kubelet restarts the sidecar independently if it crashes (because restartPolicy=Always on the init slot). On Pod termination the order reverses: regular containers terminate first, then sidecars, so cleanup paths can still talk through the proxy.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.waitDbChip, 'Completed');
      setVal(s.refs.migrateChip, 'Completed');
      setVal(s.refs.sidecarChip, 'Running');
      setVal(s.refs.mainChip, 'Running');
      setWire(s, 'req', 'Pod Running · sidecar + main in parallel');
      s.refs.sidecarChip.classList.add('highlight');
      s.refs.mainChip.classList.add('highlight');
      s.refs.containerSidecar.classList.add('highlight');
      s.refs.containerMain.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) return;
      // The Pod is what changed state here, so the Pod is what pulses.
      pulsePod(s.refs.podGroup, ctx, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
