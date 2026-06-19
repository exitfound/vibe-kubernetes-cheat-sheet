import { svg, g, line, text } from '../lib/svg.js';
import { arrowDefs, box, node, cylinder, arrow, pathArrow } from '../lib/primitives.js';
import { routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/control-kit.js';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Kubernetes control plane architecture',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Top row: Api (centre) + ETCD (top-right). All component boxes use the
    // workloads standard size (w:220 h:80) so every block reads at one scale.
    const apisrv = box({ x: 490, y: 80, w: 220, h: 80, label: 'Api',  cat: 'control' });
    const etcdC  = cylinder({ x: 960, y: 70, w: 130, h: 110, label: 'ETCD', cat: 'control' });
    root.appendChild(apisrv);
    root.appendChild(etcdC);

    // Middle row: ControllerManager sits above Runtime (left column),
    // Scheduler sits above KubeProxy (right column), same x as the node boxes.
    const ctrlMgr = box({ x: 170, y: 240, w: 220, h: 80, label: 'ControllerManager', cat: 'control' });
    const sched   = box({ x: 810, y: 240, w: 220, h: 80, label: 'Scheduler',         cat: 'control' });
    root.appendChild(ctrlMgr);
    root.appendChild(sched);

    const nodeEl = node({ x: 120, y: 420, w: 960, h: 180, label: 'worker Node' });
    root.appendChild(nodeEl);

    // Bottom row: Runtime (left), Kubelet (centre, straight under Api), KubeProxy (right).
    const runtime = box({ x: 170, y: 480, w: 220, h: 80, label: 'Runtime',   cat: 'control' });
    const kubelet = box({ x: 490, y: 480, w: 220, h: 80, label: 'Kubelet',   cat: 'control' });
    const kproxy  = box({ x: 810, y: 480, w: 220, h: 80, label: 'KubeProxy', cat: 'control' });
    root.appendChild(runtime);
    root.appendChild(kubelet);
    root.appendChild(kproxy);

    root.appendChild(arrow({ x1: 710, y1: 110, x2: 960, y2: 110, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 960, y1: 130, x2: 710, y2: 130, dim: true, dashed: true, color: 'control' }));
    // ControllerManager + Scheduler each get a parallel arrow PAIR (like the ETCD
    // write/read lanes): watch event in (Api -> block, upper lane) and the
    // reconcile / Binding write-back out (block -> Api, lower lane).
    root.appendChild(pathArrow({ points: [[540, 160], [540, 200], [270, 200], [270, 240]], dim: true, dashed: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[290, 240], [290, 220], [560, 220], [560, 160]], dim: true, dashed: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[660, 160], [660, 200], [930, 200], [930, 240]], dim: true, dashed: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[910, 240], [910, 220], [640, 220], [640, 160]], dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 600, y1: 160, x2: 600, y2: 420, dim: true, dashed: true, color: 'control' }));

    // Inside the node: Kubelet wired to Runtime and KubeProxy (solid binding lines, not flow).
    root.appendChild(line({ class: 'scheme-arrow scheme-arrow-control', x1: 390, y1: 520, x2: 490, y2: 520 }));
    root.appendChild(line({ class: 'scheme-arrow scheme-arrow-control', x1: 710, y1: 520, x2: 810, y2: 520 }));

    const wireEtcdWrite  = text({ class: 'scheme-label code dim', x: 835, y: 98,  'text-anchor': 'middle' }, [' ']);
    const wireEtcdRead   = text({ class: 'scheme-label code dim', x: 835, y: 152, 'text-anchor': 'middle' }, [' ']);
    const wireControllers = text({ class: 'scheme-label code dim', x: 415, y: 186, 'text-anchor': 'middle' }, [' ']);
    const wireScheduler  = text({ class: 'scheme-label code dim', x: 785, y: 186, 'text-anchor': 'middle' }, [' ']);
    const wireNode       = text({ class: 'scheme-label code dim', x: 618, y: 404, 'text-anchor': 'start' }, [' ']);
    [wireEtcdWrite, wireEtcdRead, wireControllers, wireScheduler, wireNode].forEach(t => root.appendChild(t));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, apisrv, etcdC, ctrlMgr, sched, nodeEl, kubelet, runtime, kproxy,
      wires: {
        'etcd-write':  wireEtcdWrite,
        'etcd-read':   wireEtcdRead,
        controllers:   wireControllers,
        scheduler:     wireScheduler,
        node:          wireNode,
      },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['apisrv','etcdC','ctrlMgr','sched','kubelet','runtime','kproxy']);
}

const STEPS = [
  {
    id: 'Overview',
    duration: 1500,
    narration: 'The Control Plane manages the desired cluster state. Worker Nodes run the actual workloads. Every component exchanges data through the Api.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
    },
  },
  {
    id: 'Api',
    duration: 1700,
    narration: 'The Api is the only entry point to the cluster. Every read and every write passes through it. Replicas are stateless and require no coordination, so the layer scales horizontally.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
    },
  },
  {
    id: 'etcd',
    duration: 1700,
    narration: 'ETCD is the only durable store in the cluster, and the Api is its only client. Every change is replicated through Raft, where a quorum of replicas must agree before the write is committed.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.etcdC.classList.add('highlight');
      setWire(s, 'etcd-write', 'write · Raft quorum commit');
      if (ctx.reduced) return;
      routePacket(s, ctx, [[710, 110], [835, 110], [960, 110]]);
    },
  },
  {
    id: 'etcd-response',
    duration: 1700,
    narration: 'ETCD returns the requested data to the Api. When the Api subscribes via a watch, ETCD keeps that stream open and pushes subsequent changes through it without another round trip.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.etcdC.classList.add('highlight');
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'etcd-read', 'read · watch stream open');
      if (ctx.reduced) return;
      routePacket(s, ctx, [[960, 130], [835, 130], [710, 130]]);
    },
  },
  {
    id: 'controllers',
    duration: 2600,
    narration: 'The ControllerManager runs many small control loops, one per resource kind (Deployment, ReplicaSet, Job and so on). Each watches the Api and writes back to reconcile observed state with desired state.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.ctrlMgr.classList.add('highlight');
      setWire(s, 'controllers', 'watch · reconcile loop');
      if (ctx.reduced) return;
      // Watch event in (Api -> ControllerManager, upper lane), then the reconcile
      // write-back out (ControllerManager -> Api, lower lane).
      const watch = routePacket(s, ctx, [[540, 160], [540, 200], [270, 200], [270, 240]]);
      routePacket(s, ctx, [[290, 240], [290, 220], [560, 220], [560, 160]], { delay: watch.arrivalMs + BEAT.afterHop });
    },
  },
  {
    id: 'scheduler',
    duration: 2600,
    narration: 'The Scheduler watches Pods that have no Node assignment yet, filters and scores the candidates, then posts a Binding back to the Api. That single write is its entire job. The Kubelet on the chosen Node takes it from there.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.sched.classList.add('highlight');
      setWire(s, 'scheduler', 'watch Pods · post Binding');
      if (ctx.reduced) return;
      // Watch Pods in (Api -> Scheduler, upper lane), then the Binding posted back
      // to the Api (Scheduler -> Api, lower lane).
      const watch = routePacket(s, ctx, [[660, 160], [660, 200], [930, 200], [930, 240]]);
      routePacket(s, ctx, [[910, 240], [910, 220], [640, 220], [640, 160]], { delay: watch.arrivalMs + BEAT.afterHop });
    },
  },
  {
    id: 'node-side',
    duration: 2200,
    narration: 'On a worker Node, the Kubelet watches the Api for Pods assigned to it and drives the Runtime to start their containers. KubeProxy installs the local rules that steer Service traffic.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      s.refs.runtime.classList.add('highlight');
      s.refs.kproxy.classList.add('highlight');
      setWire(s, 'node', 'watch Pods · spec.nodeName=Node');
      if (ctx.reduced) return;
      routePacket(s, ctx, [[600, 160], [600, 420]]);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
