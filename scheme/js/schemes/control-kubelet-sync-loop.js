import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, chainList, arrow } from '../lib/primitives.js';
import { valChip, setVal, topPacket, segmentPacket, makeInit, clearHighlights, clearWires, setWire, flashChips, BEAT } from '../lib/control-kit.js';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '150 -90 1200 620',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Kubelet sync loop: watch, PLEG, SyncPod, CRI, status',
      'data-style': 'outline',
    });
    const content = g({ transform: 'translate(0, 0)' });
    content.appendChild(arrowDefs());

    const api     = box({ x: 320, y: 40, w: 220, h: 80, label: 'Api',  sublabel: 'spec source',  cat: 'control' });
    const kubelet = box({ x: 620, y: 40, w: 220, h: 80, label: 'Kubelet',    sublabel: 'on Node-1',    cat: 'control' });
    const runtime = box({ x: 920, y: 40, w: 240, h: 80, label: 'Containerd', sublabel: 'CRI gRPC',     cat: 'control' });

    // Top arrows, symmetric about each box centre (y=80, so +/-15 -> 65 and 95):
    // Api <-> Kubelet (watch + status PATCH), Kubelet <-> Runtime (CRI calls).
    content.appendChild(arrow({ x1: 540, y1: 65, x2: 620, y2: 65, dim: true, dashed: true, color: 'control' }));
    content.appendChild(arrow({ x1: 620, y1: 95, x2: 540, y2: 95, dim: true, dashed: true, color: 'control' }));
    content.appendChild(arrow({ x1: 840, y1: 65, x2: 920, y2: 65, dim: true, dashed: true, color: 'control' }));
    content.appendChild(arrow({ x1: 920, y1: 95, x2: 840, y2: 95, dim: true, dashed: true, color: 'control' }));

    // Wire labels (font-size: 9) in the gap between top row and pipeline.
    const wireApi = text({ class: 'scheme-label code dim', x: 580, y: 148, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    const wireRT  = text({ class: 'scheme-label code dim', x: 880, y: 148, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    [wireApi, wireRT].forEach(t => content.appendChild(t));

    // Pipeline chain: 5 stages of the Kubelet sync cycle.
    const chain = chainList({
      x: 320, y: 200, w: 460, rowH: 32, gap: 10,
      items: [
        '1. watch     ·  pod specs from Api',
        '2. PLEG      ·  observe containers via list-containers',
        '3. SyncPod   ·  reconcile desired vs observed',
        '4. CRI       ·  Create/Start container gRPC',
        '5. status    ·  PATCH Pod containerStatuses',
      ],
      cat: 'control',
    });

    // State chips column on the right.
    const podChip      = valChip({ x: 800, y: 200, w: 380, h: 32, name: 'Pod',         value: '—' });
    const desiredChip  = valChip({ x: 800, y: 242, w: 380, h: 32, name: 'desired',     value: '—' });
    const observedChip = valChip({ x: 800, y: 284, w: 380, h: 32, name: 'observed',    value: '—' });
    const lastOpChip   = valChip({ x: 800, y: 326, w: 380, h: 32, name: 'last CRI op', value: '—' });
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
    narration: 'Kubelet on Node-1 runs a continuous reconciliation loop. Pod specs come in from sources (mainly Api), and observed container state comes from the runtime via PLEG. SyncPod compares the two and issues CRI calls to converge.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.podChip, '—');
      setVal(s.refs.desiredChip, '—');
      setVal(s.refs.observedChip, '—');
      setVal(s.refs.lastOpChip, '—');
    },
  },
  {
    id: 'watch',
    duration: 1900,
    narration: 'Api streams an ADDED event for Pod my-app-7d4-abc bound to Node-1. The Kubelet source dispatcher routes the spec into podManager as desired state.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.podChip, 'my-app-7d4-abc');
      setVal(s.refs.desiredChip, '1 container');
      setVal(s.refs.observedChip, '—');
      setVal(s.refs.lastOpChip, '—');
      setWire(s, 'api', 'watch ADDED');
      s.refs.api.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      s.refs.podChip.classList.add('highlight');
      s.refs.desiredChip.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[0]) rows[0].classList.add('highlight');
      if (ctx.reduced) return;
      topPacket(s, ctx, { from: 540, to: 620 });
    },
  },
  {
    id: 'pleg',
    duration: 2000,
    narration: 'PLEG (Pod Lifecycle Event Generator) wakes on its 1s timer, calls ListContainers on the runtime, and sees no containers for the new Pod. The empty observed state is recorded for SyncPod to act on.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.observedChip, '0 containers');
      setVal(s.refs.lastOpChip, 'ListContainers');
      setWire(s, 'rt', 'ListContainers');
      s.refs.kubelet.classList.add('highlight');
      s.refs.runtime.classList.add('highlight');
      s.refs.observedChip.classList.add('highlight');
      s.refs.lastOpChip.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[1]) rows[1].classList.add('highlight');
      if (ctx.reduced) return;
      // ListContainers request out, the container list answers once it lands.
      const req = topPacket(s, ctx, { from: 840, to: 920 });
      topPacket(s, ctx, { from: 920, to: 840, y: 95, delay: req.arrivalMs + BEAT.afterHop });
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
      // No packet moves on the in-memory diff: the compared values flash.
      flashChips(s, ctx, ['desiredChip', 'observedChip']);
    },
  },
  {
    id: 'cri',
    duration: 2400,
    narration: 'Kubelet issues CRI gRPC calls in sequence: RunPodSandbox creates the pause container with shared namespaces, then CreateContainer + StartContainer launch each container in the spec. Details of the sandbox setup are covered in the Pod Sandbox via CRI card.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.lastOpChip, 'StartContainer');
      setWire(s, 'rt', 'RunPodSandbox · Create · Start');
      s.refs.kubelet.classList.add('highlight');
      s.refs.runtime.classList.add('highlight');
      s.refs.lastOpChip.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[3]) rows[3].classList.add('highlight');
      if (ctx.reduced) return;
      // Three packets sequenced for RunPodSandbox, CreateContainer, StartContainer.
      const sandbox = segmentPacket(s, ctx, { from: [840, 65], to: [920, 65] });
      const create = segmentPacket(s, ctx, { from: [840, 65], to: [920, 65], delay: sandbox.arrivalMs + BEAT.afterHop });
      segmentPacket(s, ctx, { from: [840, 65], to: [920, 65], delay: create.arrivalMs + BEAT.afterHop });
    },
  },
  {
    id: 'status',
    duration: 2000,
    narration: 'Next PLEG cycle observes the running container, observed state catches up to desired state, and SyncPod issues no new CRI calls. Kubelet PATCHes Pod status (containerStatuses) back to Api. The loop is ready for the next change.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.observedChip, '1 running');
      setVal(s.refs.lastOpChip, 'ListContainers');
      setWire(s, 'api', 'PATCH .../pods/{name}/status');
      s.refs.kubelet.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      s.refs.observedChip.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[4]) rows[4].classList.add('highlight');
      if (ctx.reduced) return;
      topPacket(s, ctx, { from: 620, to: 540, y: 95 });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
