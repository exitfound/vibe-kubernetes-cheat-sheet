import { svg, g, rect, path, text } from '../../lib/svg.js';
import { arrowDefs, box, pod, node, chainList, setChainActive, arrow, pathArrow } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, pulsePodDim, routePacket, topPacket, makeInit, clearHighlights, clearWires, setWire, lightBoxAt, FADE, BEAT, OPACITY, WL } from '../../lib/workloads-kit.js';

// Layout C on the Workloads canon (WL in the kit): the panel reaches y<=379 (worst of
// 1600/1440/1280/1100, x<=397), which leaves no column under it, so the pipeline keeps the right
// band and the chips form a two-across bottom strip.
// Design notes for this card: scheme/docs/CARDS.md#workloads-pod-image-pull
const PANEL_B = 379;

// Kubelet leads the row and is centred on CX, so the lane down to the Pod leaves its bottom
// midpoint. The Registry sits inside the cloud, which is why it is the narrower of the two.
const TOP1_X = 420, TOP1_W = 2 * (WL.CX - 420);          // 420..780, centred on CX
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = 260;  // 840..1100, inside the cloud
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const REQ_Y = TOP_CY - WL.LANE_DY, RESP_Y = TOP_CY + WL.LANE_DY;
const WIRE_X = WL.CX;

// The cloud is one hand-drawn path whose own centre is (685, 85). It is placed by transform so
// it wraps the Registry instead of straddling both actor boxes.
const CLOUD_CX = 685, CLOUD_CY = 85, CLOUD_SCALE = 1.05;
const CLOUD_DX = (TOP2_X + TOP2_W / 2) - CLOUD_CX * CLOUD_SCALE;
const CLOUD_DY = TOP_CY - CLOUD_CY * CLOUD_SCALE;

const LAD_X = WL.CHIP_X, LAD_W = WL.CHIP_W;              // 660..1140, the pipeline
const LAD_Y = 176;                                       // 5 rows -> 176..376, clear of the cloud

// Chips two across, 532 wide: four across was 258 and every name ran into its own value.
const CHIP_COLS = 2, CHIP_GAP = 16, CHIP_VGAP = 8;
const CHIP_W = (WL.W - CHIP_GAP * (CHIP_COLS - 1)) / CHIP_COLS;
const CHIPS_Y = 548;                                     // 2 rows -> 548..582 / 590..624
const CHIP_X = i => WL.L + (i % CHIP_COLS) * (CHIP_W + CHIP_GAP);
const CHIP_Y = i => CHIPS_Y + Math.floor(i / CHIP_COLS) * (WL.CHIP_H + CHIP_VGAP);

const NODE_Y = 396, NODE_H = 136;                        // 396..532, clear of the panel
const POD_W = 460, POD_X = WL.CX - 230;
const POD_H = 90, POD_Y = NODE_Y + 34;                   // 430..520
const CONT_W = 300, CONT_X = WL.CX - CONT_W / 2;
const CONT_H = 48, CONT_Y = POD_Y + 26;                  // 456..504

// The lane ends on the Pod it addresses, not on the Node frame edge above it.
const SPINE = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, POD_Y]];


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

    const kubelet  = box({ x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Kubelet',  sublabel: 'image puller',          role: 'cluster' });
    const registry = box({ x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'Registry', sublabel: 'OCI Distribution · out-of-cluster', role: 'cluster' });

    root.appendChild(arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }));

    const wireReq = text({ class: 'scheme-label code dim', x: WIRE_X, y: WL.TOP_Y - 12, 'text-anchor': 'middle' }, [' ']);
    root.appendChild(wireReq);

    const imageChip  = valChip({ x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'image',           value: 'app:v2', role: 'workloads' });
    const policyChip = valChip({ x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'imagePullPolicy', value: 'pending', role: 'workloads' });
    const layersChip = valChip({ x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'layers cached',   value: 'not probed', role: 'workloads' });
    const statusChip = valChip({ x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'container state', value: 'Waiting', role: 'workloads' });
    [imageChip, policyChip, layersChip, statusChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP,
      items: [
        '1. policy ·  Always | IfNotPresent | Never · default by tag',
        '2. auth   ·  imagePullSecrets · Pod + ServiceAccount',
        '3. cache  ·  CRI ImageStatus · digest hit on local store',
        '4. pull   ·  GET /v2/{repo}/blobs/<digest> · reuse cached layers',
        '5. start  ·  overlay rootfs · CreateContainer + Start',
      ],
      role: 'cluster',
    });

    const nodeEl = node({ x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' });

    const podShell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
    const podShellRect = podShell.querySelector('.scheme-pod-rect');
    if (podShellRect) podShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const containerBox = box({ x: CONT_X, y: CONT_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'container', role: 'workloads' });

    const podGroup = g({ id: 'podGroup' });
    podGroup.appendChild(podShell);
    podGroup.appendChild(containerBox);
    podGroup.style.opacity = String(OPACITY.pending);

    const connector = pathArrow({
      points: SPINE,
      dim: true, dashed: true, role: 'cluster',
    });

    const packetLayer = g({ id: 'packetLayer' });

    const cloud = path({
      d: 'M 555 80 Q 545 50, 580 50 Q 590 25, 630 30 Q 650 15, 690 25 Q 730 18, 750 35 Q 790 28, 810 60 Q 830 80, 815 105 Q 825 130, 790 138 Q 770 152, 730 142 Q 700 155, 670 145 Q 640 152, 610 142 Q 580 148, 565 125 Q 540 110, 555 80 Z',
      class: 'scheme-cloud',
      transform: `translate(${CLOUD_DX},${CLOUD_DY}) scale(${CLOUD_SCALE})`,
      fill: 'rgba(255,255,255,0.03)',
      stroke: 'var(--diag-stroke-soft)',
      'stroke-width': '1.2',
      'stroke-linejoin': 'round',
    });

    // Z-order: the Node frame is a 70% opaque fill, so the lane leg that runs inside it and the
    // ball that rides it are appended after it. Ladder, Pod and actors sit above the packets.
    root.appendChild(nodeEl);
    root.appendChild(connector);
    root.appendChild(packetLayer);
    root.appendChild(chain);
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
  clearHighlights(s,
    ['kubelet','registry','cloud','imageChip','policyChip','layersChip','statusChip'],
    [s.refs.podGroup]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.imageChip,  'app:v2');
      setVal(s.refs.policyChip, 'not read yet');
      setVal(s.refs.layersChip, 'not probed');
      setVal(s.refs.statusChip, 'Waiting');
      s.refs.podGroup.style.opacity = String(OPACITY.pending);
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
      s.refs.statusChip.classList.add('highlight');
      setWire(s, 'req', 'imagePullPolicy=IfNotPresent (default for v2 tag)');
      s.refs.kubelet.classList.add('highlight');
      s.refs.policyChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = String(OPACITY.pending);
      setChainActive(s.refs.chain, 0);
      // Policy resolution is a local Kubelet read, nothing travels: the resolved chips
      // and Kubelet take the static highlight only, no flash (info blocks do not pulse).
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
      s.refs.podGroup.style.opacity = String(OPACITY.pending);
      setChainActive(s.refs.chain, 1);
      // Credential lookup happens inside the Kubelet, nothing travels: the Kubelet
      // takes the static highlight only, no flash (info blocks do not pulse).
    },
  },
  {
    id: 'cache',
    duration: 2300,
    narration: 'Kubelet asks the runtime via the CRI ImageStatus call whether this exact image is already present on this Node. The layer store it queries is content-addressable, keyed by sha256 digest and shared across every Pod on the Node. The app:v2 image is only partially cached: 2 of its 4 layers are already in the store (shared with other images). If the policy were Always, the remote manifest would still be fetched to resolve the current digest, and the actual blob pulls skipped when it matches the local digest.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.imageChip,  'app:v2');
      setVal(s.refs.policyChip, 'IfNotPresent');
      setVal(s.refs.layersChip, '2 of 4');
      setVal(s.refs.statusChip, 'Waiting · ContainerCreating');
      setWire(s, 'req', 'CRI ImageStatus · Digest probe · 2 of 4 cached');
      s.refs.kubelet.classList.add('highlight');
      s.refs.layersChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = String(OPACITY.pending);
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
      // Pod stays dim while the probe travels, then blinks when it reaches the node.
      const probe = routePacket(s, ctx, SPINE, { role: 'workloads' });
      pulsePodDim(s.refs.podGroup, ctx, probe.arrivalMs);
    },
  },
  {
    id: 'pull',
    duration: 2400,
    narration: 'Kubelet has the runtime pull the 2 missing layers. The image manifest is fetched first, then for each missing layer a GET /v2/app/blobs/sha256:{digest} goes to the registry with the assembled Authorization header. Layers shared with previously-pulled images on this Node are reused from the store, so a partial cache hit shrinks the actual wire transfer. On error (404, auth fail, network timeout) the container goes Waiting with reason ErrImagePull, Kubelet retries on an exponential backoff (~10s, 20s, 40s, capped at 300s), surfaced as ImagePullBackOff after the first few failures.',
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
      s.refs.cloud.classList.add('highlight');
      s.refs.layersChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = String(OPACITY.pending);
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.registry.classList.add('highlight'); return; }
      // Blob GET reaches the registry, the 200 with the layers hops back after it lands. The
      // registry lights on the GET landing: it answers the request, it does not open the step.
      const get = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.registry, ctx, get.arrivalMs);
      topPacket(s, ctx, { from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, delay: get.arrivalMs + BEAT.afterHop, role: 'workloads' });
    },
  },
  {
    id: 'start',
    duration: 2300,
    narration: 'All 4 layers are present in the layer store. The container rootfs is assembled as an overlay filesystem: each layer mounts read-only and one top read-write layer holds the writes the running container makes. The layer store is shared across containers, so a second Pod using the same image reuses the same lower layers (only the upper RW layer is per-container). Kubelet calls CreateContainer to bind the rootfs and configure namespaces, then StartContainer to exec PID 1.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.imageChip,  'app:v2');
      setVal(s.refs.policyChip, 'IfNotPresent');
      setVal(s.refs.layersChip, '4 of 4');
      setVal(s.refs.statusChip, 'Running');
      setWire(s, 'req', 'overlay rootfs · CreateContainer · StartContainer');
      s.refs.kubelet.classList.add('highlight');
      s.refs.statusChip.classList.add('highlight');
      // Container created and started: the whole Pod block lifts to full opacity.
      s.refs.podGroup.style.opacity = '1';
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) return;
      const start = routePacket(s, ctx, SPINE, { role: 'workloads' });
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: OPACITY.pending }, { opacity: 1 }],
        { duration: FADE.in, delay: start.arrivalMs, fill: 'both', easing: 'ease-out' }
      ));
      // Container created and started: the Pod lights up and pulses on arrival.
      pulsePod(s.refs.podGroup, ctx, start.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
