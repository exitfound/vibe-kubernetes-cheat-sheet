import { svg, g, rect, path, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, chainList, setChainActive, arrow, pathArrow, packet, animateAlong } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, clearPodHighlight, makeInit } from '../lib/scheme-kit.js';


class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Image pull policy and registry auth: Kubelet evaluates imagePullPolicy, resolves imagePullSecrets, checks the local layer store, pulls missing layers by digest',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubelet  = box({ x: 320, y: 40, w: 220, h: 80, label: 'Kubelet',  sublabel: 'image puller',          cat: 'control' });
    const registry = box({ x: 580, y: 40, w: 220, h: 80, label: 'Registry', sublabel: 'OCI Distribution · out-of-cluster', cat: 'control' });

    root.appendChild(arrow({ x1: 540, y1: 65, x2: 580, y2: 65, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 580, y1: 95, x2: 540, y2: 95, dim: true, dashed: true, color: 'control' }));

    const wireReq = text({ class: 'scheme-label code dim', x: 560, y: 163, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const imageChip  = valChip({ x: 830, y: 40,  w: 350, h: 32, name: 'image',           value: 'app:v2' });
    const policyChip = valChip({ x: 830, y: 82,  w: 350, h: 32, name: 'imagePullPolicy', value: 'pending' });
    const layersChip = valChip({ x: 830, y: 124, w: 350, h: 32, name: 'layers cached',   value: 'not probed' });
    const statusChip = valChip({ x: 830, y: 166, w: 350, h: 32, name: 'container state', value: 'Waiting' });
    [imageChip, policyChip, layersChip, statusChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
      items: [
        '1. policy ·  Always | IfNotPresent | Never (tag default)',
        '2. auth   ·  imagePullSecrets · Pod + ServiceAccount',
        '3. cache  ·  CRI ListImages · digest hit on local store',
        '4. pull   ·  GET /v2/{repo}/blobs/<digest> · reuse cached layers',
        '5. start  ·  overlay rootfs · CreateContainer + Start',
      ],
      cat: 'control',
    });

    const nodeEl = node({ x: 320, y: 480, w: 860, h: 140, label: 'Node-1' });

    const podShell = pod({ x: 520, y: 500, w: 460, h: 110, label: 'Pod', sublabel: '', containers: 0, cat: 'workloads' });
    const podShellRect = podShell.querySelector('.scheme-pod-rect');
    if (podShellRect) podShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const containerBox = box({ x: 600, y: 530, w: 300, h: 64, label: 'app', sublabel: 'container', cat: 'workloads' });

    const podGroup = g({ id: 'podGroup' });
    podGroup.appendChild(podShell);
    podGroup.appendChild(containerBox);
    podGroup.style.opacity = '0.55';

    const connector = pathArrow({
      points: [[320, 80], [280, 80], [280, 550], [320, 550]],
      dim: true, dashed: true, color: 'control',
    });
    root.appendChild(connector);

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    const cloud = path({
      d: 'M 555 80 Q 545 50, 580 50 Q 590 25, 630 30 Q 650 15, 690 25 Q 730 18, 750 35 Q 790 28, 810 60 Q 830 80, 815 105 Q 825 130, 790 138 Q 770 152, 730 142 Q 700 155, 670 145 Q 640 152, 610 142 Q 580 148, 565 125 Q 540 110, 555 80 Z',
      class: 'scheme-cloud',
      fill: 'rgba(255,255,255,0.03)',
      stroke: 'var(--diag-stroke-soft)',
      'stroke-width': '1.2',
      'stroke-linejoin': 'round',
    });

    root.appendChild(chain);
    root.appendChild(nodeEl);
    root.appendChild(podGroup);
    root.appendChild(cloud);
    root.appendChild(registry);
    root.appendChild(kubelet);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubelet, registry, cloud, chain, nodeEl, connector,
      imageChip, policyChip, layersChip, statusChip,
      podGroup,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['kubelet','registry','cloud','imageChip','policyChip','layersChip','statusChip']
    .forEach(k => s.refs[k].classList.remove('highlight'));
  s.refs.chain.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
  clearPodHighlight(s.refs.podGroup);
}
function clearWires(s) {
  Object.values(s.refs.wires).forEach(t => { t.textContent = ''; });
}
function setWire(s, key, txt) {
  if (s.refs.wires[key]) s.refs.wires[key].textContent = txt;
}


const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Pod has been scheduled to Node-1. Its single container references image registry.example.com/app:v2 which is built from 4 layers (base OS, runtime, app dependencies, app binary). Kubelet is about to materialize the image before the container can start. What it actually does depends on imagePullPolicy and on which layers are already cached in the local layer store on this node.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.imageChip,  'app:v2');
      setVal(s.refs.policyChip, 'pending');
      setVal(s.refs.layersChip, 'not probed');
      setVal(s.refs.statusChip, 'Waiting');
      s.refs.podGroup.style.opacity = '0.55';
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'policy',
    duration: 1900,
    narration: 'Kubelet reads spec.containers[0].imagePullPolicy. The default depends on the image reference: :latest defaults to Always (re-resolve the digest on every container start), while every other explicit tag (v2 here) or a pinned digest defaults to IfNotPresent (skip the pull when the image is already in the local store). The explicit value Never disables pulling entirely (the image must be preloaded out-of-band, otherwise the container fails with ErrImageNeverPull). Pull is per-container, not per-Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.imageChip,  'app:v2');
      setVal(s.refs.policyChip, 'IfNotPresent');
      setVal(s.refs.layersChip, 'not probed');
      setVal(s.refs.statusChip, 'Waiting · ContainerCreating');
      setWire(s, 'req', 'imagePullPolicy=IfNotPresent (default for v2 tag)');
      s.refs.kubelet.classList.add('highlight');
      s.refs.policyChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = '0.55';
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) return;
    },
  },
  {
    id: 'auth',
    duration: 1900,
    narration: 'For private registries Kubelet needs credentials. It walks two lists: Pod.spec.imagePullSecrets and the imagePullSecrets attached to the Pod ServiceAccount. Each Secret of type kubernetes.io/dockerconfigjson stores a base64-encoded docker config with per-registry auth tokens. Kubelet picks the matching entry and passes credentials to the runtime via the CRI PullImage request. For cloud-managed registries (ECR, GCR, ACR) a Kubelet image credential provider plugin can produce credentials dynamically instead. Public images skip this step.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.imageChip,  'app:v2');
      setVal(s.refs.policyChip, 'IfNotPresent');
      setVal(s.refs.layersChip, 'not probed');
      setVal(s.refs.statusChip, 'Waiting · ContainerCreating');
      setWire(s, 'req', 'authConfig from Pod + ServiceAccount imagePullSecrets');
      s.refs.kubelet.classList.add('highlight');
      s.refs.podGroup.style.opacity = '0.55';
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
    },
  },
  {
    id: 'cache',
    duration: 2000,
    narration: 'Kubelet asks the runtime via the CRI ListImages call which images are already present on this node. The runtime keeps a content-addressable layer store keyed by sha256 digest and shared across every Pod on the node. app:v2 is only partially cached: 2 of its 4 layers are already in the store (shared with other images). If the policy were Always, the runtime would still fetch the remote manifest to resolve the current digest and skip the actual blob pulls when it matches the local digest.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.imageChip,  'app:v2');
      setVal(s.refs.policyChip, 'IfNotPresent');
      setVal(s.refs.layersChip, '2 of 4');
      setVal(s.refs.statusChip, 'Waiting · ContainerCreating');
      setWire(s, 'req', 'CRI ListImages · Digest probe · 2 of 4 cached');
      s.refs.kubelet.classList.add('highlight');
      s.refs.layersChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = '0.55';
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
      const pCache = packet({ x: 320, y: 80, cat: 'control' });
      s.refs.packetLayer.appendChild(pCache);
      ctx.register(animateAlong(pCache, [[320, 80], [280, 80], [280, 550], [320, 550]], { duration: 1100 }));
      ctx.register(pCache.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1100, fill: 'forwards', easing: 'ease-in' }));
      // Pod stays dim while the probe travels, then blinks when it reaches the node.
      pulsePod(s.refs.podGroup, ctx, 1100);
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: 0.55 }, { opacity: 0.8 }, { opacity: 0.55 }],
        { duration: 900, delay: 1100, fill: 'both', easing: 'ease-in-out' }
      ));
    },
  },
  {
    id: 'pull',
    duration: 2400,
    narration: 'The 2 missing layers are pulled. The runtime fetches the image manifest, then for each missing layer issues GET /v2/app/blobs/sha256:{digest} to the registry with the assembled Authorization header. Layers shared with previously-pulled images on this node are reused from the store, so a partial cache hit shrinks the actual wire transfer. On error (404, auth fail, network timeout) the container goes Waiting with reason ErrImagePull, Kubelet retries on an exponential backoff (~10s, 20s, 40s, capped at 300s), surfaced as ImagePullBackOff after the first few failures.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.imageChip,  'app:v2');
      setVal(s.refs.policyChip, 'IfNotPresent');
      setVal(s.refs.layersChip, '4 of 4');
      setVal(s.refs.statusChip, 'Waiting · ContainerCreating');
      setWire(s, 'req', 'GET /v2/app/blobs/sha256:... · 200 · 2 new layers · 4 of 4 cached');
      s.refs.kubelet.classList.add('highlight');
      s.refs.registry.classList.add('highlight');
      s.refs.cloud.classList.add('highlight');
      s.refs.layersChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = '0.55';
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) return;
      const pOut = packet({ x: 540, y: 65, cat: 'control' });
      s.refs.packetLayer.appendChild(pOut);
      ctx.register(animateAlong(pOut, [[540, 65], [580, 65]], { duration: 700 }));
      ctx.register(pOut.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 700, fill: 'forwards', easing: 'ease-in' }));
      const pBack = packet({ x: 580, y: 95, cat: 'control' });
      pBack.style.opacity = '0';
      s.refs.packetLayer.appendChild(pBack);
      ctx.register(pBack.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 600, fill: 'forwards', easing: 'ease-out' }));
      ctx.register(animateAlong(pBack, [[580, 95], [540, 95]], { duration: 700, delay: 800 }));
      ctx.register(pBack.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1500, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'start',
    duration: 2000,
    narration: 'All 4 layers are present in the layer store. The runtime assembles the container rootfs via an overlay filesystem: each layer mounts read-only and one top read-write layer holds the writes the running container makes. The layer store is shared across containers, so a second Pod using the same image reuses the same lower layers (only the upper RW layer is per-container). Kubelet calls CreateContainer to bind the rootfs and configure namespaces, then StartContainer to exec PID 1.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.imageChip,  'app:v2');
      setVal(s.refs.policyChip, 'IfNotPresent');
      setVal(s.refs.layersChip, '4 of 4');
      setVal(s.refs.statusChip, 'Running');
      setWire(s, 'req', 'Overlay rootfs · CreateContainer · StartContainer');
      s.refs.kubelet.classList.add('highlight');
      s.refs.statusChip.classList.add('highlight');
      // Container created and started: the whole Pod block lifts to full opacity.
      s.refs.podGroup.style.opacity = '1';
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) return;
      const pCon = packet({ x: 320, y: 80, cat: 'control' });
      s.refs.packetLayer.appendChild(pCon);
      ctx.register(animateAlong(pCon, [[320, 80], [280, 80], [280, 550], [320, 550]], { duration: 1100 }));
      ctx.register(pCon.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1100, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: 0.55 }, { opacity: 1 }],
        { duration: 700, delay: 1100, fill: 'both', easing: 'ease-out' }
      ));
      // Container created and started: the Pod lights up and pulses on arrival.
      pulsePod(s.refs.podGroup, ctx, 1100);
    },
  },
];

export const init = makeInit(Scene, STEPS);
