import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, node, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, topPacket, routePacket, makeInit, clearHighlights, clearWires, setWire, flashChips, BEAT } from '../lib/workloads-kit.js';


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

    const kubelet = box({ x: 320, y: 40, w: 220, h: 80, label: 'Kubelet', sublabel: 'container orchestrator', role: 'cluster' });
    const runtime = box({ x: 580, y: 40, w: 220, h: 80, label: 'Runtime', sublabel: 'Containerd · CRI',       role: 'cluster' });

    // Top-row arrows: Kubelet → Runtime (CRI request) at y=65, Runtime → Kubelet (PLEG event) at y=95.
    root.appendChild(arrow({ x1: 540, y1: 65, x2: 580, y2: 65, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: 580, y1: 95, x2: 540, y2: 95, dim: true, dashed: true, role: 'cluster' }));

    // Wire label centred in the 40px gap below the top row.
    const wireReq = text({ class: 'scheme-label code dim', x: 560, y: 148, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    // State chip column on the right: one chip per container.
    const waitDbChip  = valChip({ x: 830, y: 40,  w: 350, h: 32, name: 'wait-for-db',    value: 'Waiting', role: 'workloads' });
    const migrateChip = valChip({ x: 830, y: 82,  w: 350, h: 32, name: 'migrate-schema', value: 'Waiting', role: 'workloads' });
    const sidecarChip = valChip({ x: 830, y: 124, w: 350, h: 32, name: 'sidecar',        value: 'Waiting', role: 'workloads' });
    const mainChip    = valChip({ x: 830, y: 166, w: 350, h: 32, name: 'main',           value: 'Waiting', role: 'workloads' });
    [waitDbChip, migrateChip, sidecarChip, mainChip].forEach(c => root.appendChild(c));

    // Pipeline chain on the left, 5 phases of the container startup.
    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
      items: [
        '1. wait-for-db    ·  first init container, must exit 0',
        '2. migrate-schema ·  next init, after #1 succeeds',
        '3. sidecar        ·  Always-restart initC, gates main',
        '4. main           ·  starts when sidecar reports Started',
        '5. running        ·  sidecar + main in parallel until term',
      ],
      role: 'cluster',
    });

    const nodeEl = node({ x: 320, y: 480, w: 860, h: 140, label: 'Node-1' });

    const containerWaitDb   = box({ x: 336, y: 510, w: 195, h: 100, label: 'wait-for-db',    sublabel: 'init container',       role: 'cluster'   });
    const containerMigrate  = box({ x: 547, y: 510, w: 195, h: 100, label: 'migrate-schema', sublabel: 'init container',       role: 'cluster'   });
    const containerSidecar  = box({ x: 758, y: 510, w: 195, h: 100, label: 'sidecar',        sublabel: 'restartPolicy=Always', role: 'cluster'   });
    const containerMain     = box({ x: 969, y: 510, w: 195, h: 100, label: 'main',           sublabel: 'app-server',           role: 'cluster'   });

    // Connector arrow Kubelet → Node-1, standard left-margin route.
    const connector = pathArrow({
      points: [[320, 80], [280, 80], [280, 550], [320, 550]],
      dim: true, dashed: true, role: 'cluster',
    });
    root.appendChild(connector);

    // Packet layer.
    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    // Z-order: chain, node, containers, then top-row blocks last.
    root.appendChild(chain);
    root.appendChild(nodeEl);
    [containerWaitDb, containerMigrate, containerSidecar, containerMain].forEach(c => root.appendChild(c));
    root.appendChild(runtime);
    root.appendChild(kubelet);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubelet, runtime, chain, nodeEl, connector,
      waitDbChip, migrateChip, sidecarChip, mainChip,
      containerWaitDb, containerMigrate, containerSidecar, containerMain,
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
    [s.refs.containerWaitDb, s.refs.containerMigrate, s.refs.containerSidecar, s.refs.containerMain]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Pod spec declares two init containers (wait-for-db, migrate-schema), one native sidecar (an initContainer with restartPolicy=Always, on by default since 1.29 and GA since 1.33) and the main app container. Kubelet has received the spec via SyncPod and is about to run the containers in the order the spec demands. Pod phase stays Pending for the whole bootstrap, while the Kubectl STATUS column moves from Init:0/2 to PodInitializing as the containers progress.',
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
    narration: 'Kubelet asks the runtime to Create and Start wait-for-db via CRI. Init containers run strictly sequentially: each one must exit with code 0 before the next can start. A non-zero exit keeps the Pod in Init:0/2 with a Kubelet restart-backoff (respecting Pod.spec.restartPolicy).',
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
      s.refs.runtime.classList.add('highlight');
      s.refs.waitDbChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) { s.refs.containerWaitDb.classList.add('highlight'); return; }
      // CRI request hits the runtime (top hop), then the create travels down to
      // the node and the container box lights up on arrival.
      const req = topPacket(s, ctx, { role: 'workloads' });
      const create = routePacket(s, ctx, [[320, 80], [280, 80], [280, 550], [320, 550]], { delay: req.arrivalMs + BEAT.afterHop, fadeIn: true, role: 'workloads' });
      pulsePod(s.refs.containerWaitDb, ctx, create.arrivalMs);
    },
  },
  {
    id: 'migrate-schema',
    duration: 3400,
    narration: 'wait-for-db exits 0. Kubelet observes the exit via PLEG (Pod Lifecycle Event Generator) and immediately creates migrate-schema. The same rule applies, it must exit 0 before any later container can start. Each init container image is pulled lazily, just before that container is created, per its imagePullPolicy.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.waitDbChip, 'Completed');
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
      const pleg = topPacket(s, ctx, { from: 580, to: 540, y: 95, role: 'workloads' });
      const req = topPacket(s, ctx, { delay: pleg.arrivalMs + BEAT.afterHop, role: 'workloads' });
      const create = routePacket(s, ctx, [[320, 80], [280, 80], [280, 550], [320, 550]], { delay: req.arrivalMs + BEAT.afterHop, fadeIn: true, role: 'workloads' });
      pulsePod(s.refs.containerMigrate, ctx, create.arrivalMs);
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
      setVal(s.refs.sidecarChip, 'Started');
      setVal(s.refs.mainChip, 'Waiting');
      setWire(s, 'req', 'migrate-schema exit 0 · StartContainer · sidecar');
      s.refs.kubelet.classList.add('highlight');
      s.refs.runtime.classList.add('highlight');
      s.refs.sidecarChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) { s.refs.containerSidecar.classList.add('highlight'); return; }
      // CRI request hop, then the sidecar create lands on the node on arrival.
      const req = topPacket(s, ctx, { role: 'workloads' });
      const create = routePacket(s, ctx, [[320, 80], [280, 80], [280, 550], [320, 550]], { delay: req.arrivalMs + BEAT.afterHop, fadeIn: true, role: 'workloads' });
      pulsePod(s.refs.containerSidecar, ctx, create.arrivalMs);
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
      setVal(s.refs.mainChip, 'Starting');
      setWire(s, 'req', 'sidecar Started · StartContainer · main');
      s.refs.kubelet.classList.add('highlight');
      s.refs.runtime.classList.add('highlight');
      s.refs.mainChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.containerMain.classList.add('highlight'); return; }
      // CRI request hop, then the main create lands on the node on arrival.
      const req = topPacket(s, ctx, { role: 'workloads' });
      const create = routePacket(s, ctx, [[320, 80], [280, 80], [280, 550], [320, 550]], { delay: req.arrivalMs + BEAT.afterHop, fadeIn: true, role: 'workloads' });
      pulsePod(s.refs.containerMain, ctx, create.arrivalMs);
    },
  },
  {
    id: 'running',
    duration: 2000,
    narration: 'Pod is Running. The sidecar handles cross-cutting concerns (proxy, log shipping, secret rotation) alongside main. Kubelet restarts the sidecar independently if it crashes (because restartPolicy=Always on the init slot). On Pod termination the order reverses: regular containers terminate first, then sidecars, so cleanup paths can still talk through the proxy.',
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
      // Steady parallel run, nothing travels: the two settled state chips flash.
      flashChips(s, ctx, ['sidecarChip', 'mainChip']);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
