import { svg, g, text, rect, path } from '../lib/svg.js';
import { arrowDefs, box, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, routePacket, routeDur, makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// CSI Architecture (viewBox 1200x640). Storage grammar, but the story is STRUCTURAL rather than a
// single descent, so this card does not use the vertical mount-lane stack of storage-volume-model.
// It has no Pod at all, on purpose: every element here is either Kubernetes core, a vendor process,
// or the machine. The two things a reader could mistake for Pods, the controller plugin and the node
// plugin, are labelled by their CONTROLLER (Deployment / DaemonSet), so drawing them as pod() shells
// would have named the wrong object. Nothing pulses anywhere as a result, and that is correct: the
// pulse is reserved for Pods, and infrastructure lights with .highlight.
//
// The picture reads left to right as "core -> bridge -> vendor -> machine":
//   left column   kube-apiserver (top row) and kubelet (bottom row): Kubernetes core, no vendor code
//   upper frame   the CONTROLLER PLUGIN, a Deployment that runs off-node: four sidecars on a shared
//                 gRPC bus into one vendor driver
//   right of it   the cloud storage API, the only thing the controller ever calls outward
//   lower frame   the NODE PLUGIN, a DaemonSet on every node, and the node filesystem beside it
//
// ---- Narration safe-zone (MEASURED for this card, not assumed) ----
// The overlay is HTML laid over the SVG, so the NARROWER the window the MORE viewBox units it eats.
// Worst step per viewport, mapped into viewBox units:
//   1920x1080 -> right 203 / bottom 130    1440x900 -> 319 / 163    1280x800 -> 358 / 189
//   1100x800  -> 397 / 205                  900x650 -> 398 / 313
// So this card's real worst case is x<=398 and y<=313, well under the blanket x<=380 & y<=300 rule
// on the y axis but slightly OVER it on x. Everything left of x=420 therefore starts at y>=350,
// which clears the measured bottom by 37 units: the apiserver row, the kubelet row, the chip strip
// and the two left-hand wire captions. The controller frame's left border is the leftmost thing that
// sits high on the canvas and it is at x=420, clearing the measured right edge by 22.
// A LONGER NARRATION INVALIDATES BOTH NUMBERS. This is not theoretical: an earlier draft of this
// pass added one sentence to the 'controller' step and the 900x650 bottom went 313 -> 344, which
// swallowed the apiserver row. If you edit any narration here, re-measure before shipping.
//
// ---- Horizontal composition ----
// The previous pass hand-typed margins and drifted: content ran x 60..1180, so a 60 unit left margin
// against a 20 unit right one and a centre at 620, visibly shoved right. Now ONE pair of constants
// fixes the band and every tier is hung off it, so the composition cannot drift again.
const M = 60;                                    // one margin, both sides
const CONTENT_L = M, CONTENT_R = 1200 - M;       // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;          // 600, the canvas centre by construction

// kube-apiserver, kubelet and the cloud API all share ONE width. The two of them that face each
// other across the diagram, the apiserver and the cloud API, are the meaningful mirrored pair: they
// are the two worlds the driver bridges, Kubernetes on the left and the vendor on the right, so they
// are equidistant from CX by construction (60..292 and 908..1140). The floor under SIDE_W is the
// widest string any of them carries, kubelet's sublabel 'asks node plugin to mount' at 150.7 units
// measured in the browser (JetBrains Mono 11px runs 6.9 units per character). 232 leaves ~40 either
// side of it. Do not shrink below ~200 or that sublabel starts touching the box edge.
const SIDE_W = 232;
const API_X = CONTENT_L, API_R = API_X + SIDE_W;             // 60 / 292
const KUBE_X = CONTENT_L, KUBE_R = KUBE_X + SIDE_W;          // 60 / 292
const CLOUD_X = CONTENT_R - SIDE_W;                          // 908, right edge lands on CONTENT_R

// Both frames start at the same x so they read as two halves of one driver. 420 is not chosen for
// looks: it is the first tidy value clear of the measured overlay right edge of 398, and it also
// happens to leave a 140 unit box-to-box gutter on the node row (kubelet 292 -> registrar 432),
// which is the same length as the node driver -> node fs gutter on the far side, so the two
// horizontal wires on that row are an exactly matched pair.
const FRAME_X = 420, FRAME_PAD = 12;
const CF_W = CONTENT_R - FRAME_X;                            // 720
const CF_INNER_L = FRAME_X + FRAME_PAD;                      // 432
const CF_INNER_R = CONTENT_R - FRAME_PAD;                    // 1128

// ---- Vertical composition ----
// Top margin 48 (the frame border), bottom margin 16 (the chip strip). Unequal on purpose and this
// matches the catalog: the top element is a dashed border whose caption is inset 22 below it, so the
// top reads airier than the number suggests, while the chip strip is solid ink to its last pixel.
// The previous pass put CHIPS_Y at 616, which with a 34 high chip ran to 650 and was CLIPPED by the
// 640 unit viewBox: the bottom 10 units of all four chips were silently cut off. 590 is the catalog
// value (storage-volume-model uses it) and leaves a real 16 unit margin.
const CF_Y = 48;
const S_Y = 82, S_H = 76;                                    // sidecar row 82..158
const S_BOTTOM = S_Y + S_H;                                  // 158
const BUS_Y = 186;                                           // the shared gRPC bus, 28 below the row
const DRV_Y = 208, DRV_H = 68;                               // 208..276
const DRV_BOTTOM = DRV_Y + DRV_H;                            // 276
const CF_H = (DRV_BOTTOM + 22) - CF_Y;                       // 250 -> frame 48..298

const MID_Y = 350, MID_H = 72;                               // apiserver + cloud row, 350..422
const MID_CY = MID_Y + MID_H / 2;                            // 386

const NF_Y = 448;
const B_Y = 480, B_H = 72;                                   // node-row boxes 480..552
const B_CY = B_Y + B_H / 2;                                  // 516
const NF_H = (B_Y + B_H + 20) - NF_Y;                        // 124 -> frame 448..572

const CHIPS_Y = 590, CHIP_H = 34;                            // 590..624, 16 clear of the viewBox

// Four sidecars on one row. The widths are solved, not picked: each box needs its widest string plus
// air, and the leftovers are spread so every box ends up with the SAME air. Measured strings:
//   external-provisioner 120.6 / watches PVC 66.3            -> needs 120.6
//   external-attacher 103.4 / watches VolumeAttachment 144.7 -> needs 144.7
//   external-resizer 92.2 / watches PVC resize 108.5         -> needs 108.5
//   external-snapshotter 124.9 / watches VolumeSnapshot 132.7-> needs 132.7
// Sum 506.5. The inner span is 696 and three 14 unit gaps eat 42, leaving 654 for the boxes, so
// there are 147.5 units of air to share: ~37 per box, which is what the widths below deliver.
// Shrink CF_W and the attacher sublabel is the first string to touch its box edge.
const S_GAP = 14;
const S_W = [158, 182, 146, 168];
const S_X = S_W.reduce((acc, w, i) => {
  acc.push(i === 0 ? CF_INNER_L : acc[i - 1] + S_W[i - 1] + S_GAP);
  return acc;
}, []);                                                      // 432 / 604 / 800 / 960, last ends 1128
const S_CX = S_X.map((x, i) => x + S_W[i] / 2);              // 511 / 695 / 873 / 1044

// The driver is what all four sidecars call, so it is centred on the sidecar ROW rather than on the
// frame: the row spans CF_INNER_L..CF_INNER_R, whose centre is 780. Its width echoes SIDE_W, which
// puts the three "servers" in the picture (apiserver, driver, cloud API) at one size.
const DRV_CX = (CF_INNER_L + CF_INNER_R) / 2;                // 780
const DRV_W = SIDE_W;
const DRV_X = DRV_CX - DRV_W / 2;                            // 664, right edge 896
// The run out to the cloud leaves the driver from the CENTRE of its bottom edge, the same anchor the
// inbound gRPC wire uses on the top edge, so the driver reads as one block with traffic entering and
// leaving on its spine rather than off to one side. The drop lands on MID_CY and then runs 128 units
// right into the cloud box, which is a long enough horizontal leg to read as a run and not a stub.
const DRV_EXIT_X = DRV_CX;                                   // 780

// Node frame: same left edge as the controller frame, right edge set so the node driver ends 140
// from the node fs disk, matching the kubelet gutter on the other side.
const NF_INNER_L = FRAME_X + FRAME_PAD;                      // 432
const REG_W = 216, B_GAP = 24, ND_W = 184;
const REG_X = NF_INNER_L, REG_R = REG_X + REG_W;             // 432 / 648
const ND_X = REG_R + B_GAP, ND_R = ND_X + ND_W;              // 672 / 856
const NF_W = (ND_R + FRAME_PAD) - FRAME_X;                   // 448 -> frame 420..868

const GUTTER = REG_X - KUBE_R;                               // 140, the matched wire length
const FS_X = ND_R + GUTTER, FS_W = CONTENT_R - FS_X;         // 996 / 144, flush to the right edge
const FS_H = 116;
// A cylinder's straight side edges run from y+8 to y+h-8, so the middle of its FACE is y + h/2. Pin
// that to the node-row centre and the wire from the node driver enters the disk dead on its side.
const FS_Y = B_CY - FS_H / 2;                                // 456 -> 456..572, inside the node band
const FS_CY = B_CY;                                          // 514

// One chip width for all four, derived so the strip spans exactly the content band. That makes the
// strip agree with the diagram above it instead of being a fifth hand-typed margin. Worst measured
// name + value pair is 'node plugin' 75.8 + 'mounts the disk' 103.4 = 179.2, and valChip insets the
// name 12 from the left and the value 12 from the right, so 258 leaves ~55 units of clear gap.
const CHIP_GAP = 16, CHIP_COUNT = 4;
const CHIPS_W = CONTENT_R - CONTENT_L;                                              // 1080
const CHIP_W = (CHIPS_W - CHIP_GAP * (CHIP_COUNT - 1)) / CHIP_COUNT;                // 258
// Laid out from CX outwards rather than from the left edge inwards, so the strip is centred on the
// canvas by construction and stays centred if the band or the chip count ever changes.
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) =>
  CX - CHIPS_W / 2 + i * (CHIP_W + CHIP_GAP));

// Each static wire and its ball share ONE points array, so they cannot drift apart. Every endpoint
// is a real block edge, never a hand-typed coordinate.
//
// The provisioner is the only block with traffic on both sides of it, and each direction gets its
// OWN lane offset LANE around the box centre: the watch arrives on the left lane and the gRPC call
// leaves on the right one. The previous pass ran both through S_CX, so 32 units of the two arrows
// were drawn exactly on top of each other and the ball retraced its own inbound path.
const LANE = 14;
const W_API_PROV   = [[API_R, MID_CY], [S_CX[0] - LANE, MID_CY], [S_CX[0] - LANE, S_BOTTOM]];
const W_PROV_DRV   = [[S_CX[0] + LANE, S_BOTTOM], [S_CX[0] + LANE, BUS_Y], [DRV_CX, BUS_Y], [DRV_CX, DRV_Y]];
const W_DRV_CLOUD  = [[DRV_EXIT_X, DRV_BOTTOM], [DRV_EXIT_X, MID_CY], [CLOUD_X, MID_CY]];
const W_REG_KUBE   = [[REG_X, B_CY], [KUBE_R, B_CY]];
const W_ND_FS      = [[ND_R, B_CY], [FS_X, FS_CY]];

// The other three sidecars share the same bus into the same driver, which is the whole point of the
// card, so the structure is DRAWN: a stub down from each sidecar onto the bus, and the length of bus
// to the right of the driver drop. No ball ever rides these, so they carry NO arrowhead: an
// arrowhead with no traffic behind it reads as a flow the card never shows.
const W_BUS_TAIL   = [[DRV_CX, BUS_Y], [S_CX[3], BUS_Y]];
const W_STUB_ATT   = [[S_CX[1], S_BOTTOM], [S_CX[1], BUS_Y]];
const W_STUB_RES   = [[S_CX[2], S_BOTTOM], [S_CX[2], BUS_Y]];
const W_STUB_SNAP  = [[S_CX[3], S_BOTTOM], [S_CX[3], BUS_Y]];

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// A tag that rides with the ball on the same path, timing and easing, so the packet visibly carries
// what the step narrates. Not a .scheme-packet, so the tools do not count it. Every ball on this
// card is a routePacket, which is eased, so the default ease-in-out matches and the tag stays glued
// to the ball. Pass a linear easing here against a linear hop or the tag drifts off mid-flight and
// only rejoins at the endpoints, which no screenshot will catch.
function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'ease-in-out' } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: -14, 'text-anchor': 'middle', 'data-cat': 'storage' }, [txt]);
  lbl.style.opacity = '0';
  lbl.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px)`;
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 160, fill: 'forwards', easing: 'ease-in' }));
}

// A relationship line, not a route: same dim dashed storage styling as pathArrow but with no
// marker-end, because nothing ever travels along it.
function wireNoHead(points) {
  const d = points.map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' ');
  return path({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', d, fill: 'none' });
}

// A dim, arrowhead-free frame that groups one half of the driver. It carries no traffic, so no
// marker. The caption baseline sits 22 below the border, and the row inside starts 34 below it, so
// there are 12 units of air between the caption and the first box: shrink that and the caption
// starts touching the box tops.
function frame(x, y, w, h, label) {
  const grp = g({});
  const r = rect({ x, y, width: w, height: h, rx: 12, fill: 'none' });
  // The border reads as the same kind of grouping element as a node frame, so it takes the same
  // token the catalog node rect takes (--diag-node-stroke, the jade --tint-deep inside a tinted
  // storage dialog, exactly what node-1 uses on storage-csi-attach-mount). Earlier this was a flat
  // white at 0.22, which sat outside the category tint and read as a different family of line.
  // The frame stays fill-less and keeps its sparser '3 6' dash, so it still reads as subordinate to
  // a real node: a frame here is a label for a set, not a thing traffic ever touches.
  r.style.stroke = 'var(--diag-node-stroke)';
  r.style.strokeDasharray = '3 6';
  grp.appendChild(r);
  grp.appendChild(text({ class: 'scheme-label dim', x: x + 16, y: y + 22, 'text-anchor': 'start' }, [label]));
  return grp;
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
      'aria-label': 'CSI driver architecture: Kubernetes core knows nothing about any storage vendor, so a CSI driver ships in two halves, a controller plugin that runs as a Deployment with four sidecars that each watch one kind of Kubernetes object and turn it into one gRPC call on a shared bus into a single vendor driver, and a node plugin that runs as a DaemonSet on every node, registers itself with the local kubelet, and is the only component that ever touches the node filesystem',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const ctrlFrame = frame(FRAME_X, CF_Y, CF_W, CF_H, 'CSI CONTROLLER PLUGIN  ·  Deployment, runs off-node');
    const nodeFrame = frame(FRAME_X, NF_Y, NF_W, NF_H, 'CSI NODE PLUGIN  ·  DaemonSet on every node');

    // Block LABELS are sentence-capitalized. Hyphenated names take the capital on the first word only
    // (External-provisioner, Node-driver-registrar): they are one identifier, not a phrase, so
    // capitalizing every segment would read as three separate proper nouns. Sublabels stay lowercase
    // prose, and so do the literal object names quoted inside narration and riding tags.
    const api  = box({ x: API_X, y: MID_Y, w: SIDE_W, h: MID_H, label: 'Kube-apiserver', sublabel: 'core, no vendor code', cat: 'storage' });
    const prov = box({ x: S_X[0], y: S_Y, w: S_W[0], h: S_H, label: 'External-provisioner', sublabel: 'watches PVC', cat: 'storage' });
    const att  = box({ x: S_X[1], y: S_Y, w: S_W[1], h: S_H, label: 'External-attacher', sublabel: 'watches VolumeAttachment', cat: 'storage' });
    const res  = box({ x: S_X[2], y: S_Y, w: S_W[2], h: S_H, label: 'External-resizer', sublabel: 'watches PVC resize', cat: 'storage' });
    const snap = box({ x: S_X[3], y: S_Y, w: S_W[3], h: S_H, label: 'External-snapshotter', sublabel: 'watches VolumeSnapshot', cat: 'storage' });
    const drv  = box({ x: DRV_X, y: DRV_Y, w: DRV_W, h: DRV_H, label: 'CSI controller driver', sublabel: 'one vendor gRPC server', cat: 'storage' });
    const cloud = box({ x: CLOUD_X, y: MID_Y, w: SIDE_W, h: MID_H, label: 'Cloud storage API', sublabel: 'makes + attaches disks', cat: 'storage' });

    const kube = box({ x: KUBE_X, y: B_Y, w: SIDE_W, h: B_H, label: 'Kubelet', sublabel: 'asks node plugin to mount', cat: 'storage' });
    const reg  = box({ x: REG_X, y: B_Y, w: REG_W, h: B_H, label: 'Node-driver-registrar', sublabel: 'sidecar, registers driver', cat: 'storage' });
    const nd   = box({ x: ND_X, y: B_Y, w: ND_W, h: B_H, label: 'CSI node driver', sublabel: 'the only fs toucher', cat: 'storage' });
    const fs   = cylinder({ x: FS_X, y: FS_Y, w: FS_W, h: FS_H, label: 'NodeFS', cat: 'storage' });
    // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse
    // is not part of the visible front face. Re-centre on the face, as storage-volume-model does.
    const fsLabelEl = fs.querySelector('.scheme-cylinder-label');
    if (fsLabelEl) fsLabelEl.setAttribute('y', FS_H / 2 + 10);

    const routes = [W_API_PROV, W_PROV_DRV, W_DRV_CLOUD, W_REG_KUBE, W_ND_FS]
      .map(points => pathArrow({ points, dashed: true, dim: true, color: 'storage' }));
    const relations = [W_BUS_TAIL, W_STUB_ATT, W_STUB_RES, W_STUB_SNAP].map(wireNoHead);

    // Three wire captions, all on horizontal runs, all pushed BELOW their wire. A riding tag renders
    // 14 units ABOVE its ball, so a caption on the same side of a lane the ball uses gets sat on.
    //
    // There is deliberately NO caption on the provisioner -> driver lane. That hop is the one this
    // card is named after, so the ball itself carries 'CreateVolume', and a caption on the same lane
    // would be run over by the tag as it travels the bus. For the same reason the apiserver hop
    // carries no tag: its ball and the CreateVolume ball both terminate on the provisioner's bottom
    // edge 28 units apart, so two tags there overlapped for ~390ms of the step. The Pending PVC is
    // named by this caption instead, which is where it is standing still and readable.
    const watchLbl = text({ class: 'scheme-label code dim', x: (API_R + S_CX[0] - LANE) / 2, y: MID_CY + 20, 'text-anchor': 'middle' }, [' ']);
    const regLbl   = text({ class: 'scheme-label code dim', x: (KUBE_R + REG_X) / 2, y: B_CY + 22, 'text-anchor': 'middle' }, [' ']);
    const fsLbl    = text({ class: 'scheme-label code dim', x: (ND_R + FS_X) / 2, y: B_CY + 22, 'text-anchor': 'middle' }, [' ']);

    const coreChip = valChip({ x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'K8s core',    value: 'vendor-agnostic', cat: 'storage' });
    const ctrlChip = valChip({ x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'controller',  value: 'idle',            cat: 'storage' });
    const nodeChip = valChip({ x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'node plugin', value: 'idle',            cat: 'storage' });
    const brdgChip = valChip({ x: CHIP_X[3], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'bridge',      value: 'sidecars',        cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: frames first (behind), then blocks, then the relationship lines and routes above
    // them, then wire captions, then chips, then the packet layer on top so every ball rides above
    // everything.
    [ctrlFrame, nodeFrame].forEach(el => root.appendChild(el));
    [api, prov, att, res, snap, drv, cloud, kube, reg, nd, fs].forEach(el => root.appendChild(el));
    relations.forEach(el => root.appendChild(el));
    routes.forEach(el => root.appendChild(el));
    [watchLbl, regLbl, fsLbl].forEach(el => root.appendChild(el));
    [coreChip, ctrlChip, nodeChip, brdgChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, api, prov, att, res, snap, drv, cloud, kube, reg, nd, fs,
      coreChip, ctrlChip, nodeChip, brdgChip,
      wires: { watch: watchLbl, reg: regLbl, fs: fsLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

// A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText
// still holds the previous step's text at call time (clearHL clears the class, not the text) and
// steps are always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}
// Every step writes EVERY chip, and every chip means exactly what its name says. The previous pass
// let the 'bridge' chip report 'registered' and 'touches fs', neither of which is a bridge: those
// are node-plugin facts and they belong in the 'node plugin' chip. A chip that reports somebody
// else's state is how a card comes to contradict its own narration.
function setChips(s, { core, ctrl, node, bridge }) {
  setChip(s.refs.coreChip, core);
  setChip(s.refs.ctrlChip, ctrl);
  setChip(s.refs.nodeChip, node);
  setChip(s.refs.brdgChip, bridge);
}

function clearHL(s) {
  clearHighlights(s, ['api', 'prov', 'att', 'res', 'snap', 'drv', 'cloud', 'kube', 'reg', 'nd', 'fs',
    'coreChip', 'ctrlChip', 'nodeChip', 'brdgChip'], []);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A CSI driver is how a storage vendor plugs into Kubernetes without a line of vendor code living in Kubernetes itself. Every driver ships in two halves: a controller that runs once, off to the side, and a node component that runs on every machine. Neither half is part of Kubernetes core.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { core: 'vendor-agnostic', ctrl: 'idle', node: 'idle', bridge: 'sidecars' });
    },
  },
  {
    id: 'core',
    duration: 2100,
    // Packet-less and Pod-less, and still NO blink: the pulse is reserved for Pods, and this card has
    // none, so an infrastructure box states itself with a steady .highlight outline and nothing else.
    narration: 'Kubernetes core deals only in objects: a PVC, a VolumeAttachment, a VolumeSnapshot. It has no idea how any particular disk is made or attached. That deliberate ignorance is what lets one Kubernetes talk to dozens of storage backends it was never taught about.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { core: 'objects only', ctrl: 'idle', node: 'idle', bridge: 'sidecars' });
      s.refs.api.classList.add('highlight');
    },
  },
  {
    id: 'controller',
    duration: 2400,
    // Structural step: the four sidecars light and STAY lit. No blink here either, same reason as
    // the core step: this is a set of four boxes to be read side by side, not a beat to be noticed.
    narration: 'The controller plugin is a Deployment, and inside it ride the sidecars. Each watches one kind of object and does one job: provisioner for claims, attacher for attachments, resizer for resizes, snapshotter for snapshots. All four call one driver.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { core: 'objects only', ctrl: 'four sidecars', node: 'idle', bridge: 'one call each' });
      s.refs.prov.classList.add('highlight');
      s.refs.att.classList.add('highlight');
      s.refs.res.classList.add('highlight');
      s.refs.snap.classList.add('highlight');
    },
  },
  {
    id: 'translate',
    // Three chained hops measure span=3122ms, so the duration keeps ~480ms of headroom. Anything
    // added to this step has to be re-checked against anim-dump: if span passes duration, the
    // auto-advance cuts the cloud call off mid-flight and the step under-shows what it narrates.
    duration: 3600,
    narration: 'Follow one sidecar. external-provisioner sees a Pending PVC in the apiserver and turns it into a single gRPC call, CreateVolume, into the vendor driver. The driver is the only part that speaks to the cloud API and asks it to carve out a real disk. Object in, gRPC out.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { core: 'PVC Pending', ctrl: 'CreateVolume', node: 'idle', bridge: 'object -> gRPC' });
      s.refs.api.classList.add('highlight');
      s.refs.prov.classList.add('highlight');
      setWire(s, 'watch', 'PVC Pending');
      if (ctx.reduced) { s.refs.drv.classList.add('highlight'); s.refs.cloud.classList.add('highlight'); return; }
      // Three chained hops, each timed off the previous arrival rather than a hard-coded delay:
      // object out of the apiserver, one gRPC call into the driver, one vendor call out to the cloud.
      const watch = routePacket(s, ctx, W_API_PROV, { cat: 'storage' });
      const call = routePacket(s, ctx, W_PROV_DRV, { delay: watch.arrivalMs + BEAT.afterHop, cat: 'storage' });
      // The gRPC call is the thing this step is named after, so the ball carries it by name. The
      // previous pass hung 'CreateVolume' on the wire caption of the DRIVER to CLOUD line instead,
      // two hops further on, where it labelled a vendor API call as if it were the sidecar call.
      ridingLabel(s, ctx, 'CreateVolume', W_PROV_DRV, { delay: watch.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.drv, ctx, call.arrivalMs);
      const out = routePacket(s, ctx, W_DRV_CLOUD, { delay: call.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'make a disk', W_DRV_CLOUD, { delay: call.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.cloud, ctx, out.arrivalMs);
    },
  },
  {
    id: 'node',
    duration: 2800,
    narration: 'The other half is the node plugin, a DaemonSet, so a copy runs on every node. It cannot mount anything until kubelet knows it exists, so the node-driver-registrar sidecar registers the driver with the local kubelet. From then on kubelet routes mount requests for this driver to this node plugin.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { core: 'objects only', ctrl: 'idle', node: 'registered', bridge: 'registrar sidecar' });
      s.refs.reg.classList.add('highlight');
      setWire(s, 'reg', 'plugin socket');
      if (ctx.reduced) { s.refs.kube.classList.add('highlight'); return; }
      const r = routePacket(s, ctx, W_REG_KUBE, { cat: 'storage' });
      ridingLabel(s, ctx, 'driver ready', W_REG_KUBE);
      lightBoxAt(s.refs.kube, ctx, r.arrivalMs);
    },
  },
  {
    id: 'fstoucher',
    duration: 2800,
    narration: 'One rule holds the whole design together: only the node plugin ever touches the node filesystem. The controller talks to the cloud and never sees a mount, and kubelet never mounts vendor storage itself. When bytes finally land on disk, it is the CSI node driver that put them there.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { core: 'objects only', ctrl: 'never mounts', node: 'mounts the disk', bridge: 'gRPC NodePublish' });
      s.refs.nd.classList.add('highlight');
      setWire(s, 'fs', 'mount');
      if (ctx.reduced) { s.refs.fs.classList.add('highlight'); return; }
      const m = routePacket(s, ctx, W_ND_FS, { cat: 'storage' });
      ridingLabel(s, ctx, 'NodePublish', W_ND_FS);
      lightBoxAt(s.refs.fs, ctx, m.arrivalMs);
    },
  },
  {
    id: 'bridge',
    duration: 2600,
    narration: 'So the sidecars are the bridge. Kubernetes core writes plain objects and knows nothing about the vendor. The sidecars translate each object into a gRPC call, the driver runs it, and the node plugin does the one privileged thing of touching the disk. Swap the driver, keep the objects.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { core: 'objects only', ctrl: 'translates', node: 'mounts the disk', bridge: 'the sidecars' });
      // Static highlight only, and deliberately no motion at all. The usual argument for a flash on
      // a packet-less step (so it does not read as a frozen frame) does not apply to the LAST step,
      // which is supposed to come to rest: the previous pass flashed five boxes here, a beat after
      // the narration had already moved on to the summary. Lighting the whole chain at once IS the
      // summary, and it wants to be read, not blinked at.
      s.refs.api.classList.add('highlight');
      s.refs.prov.classList.add('highlight');
      s.refs.att.classList.add('highlight');
      s.refs.res.classList.add('highlight');
      s.refs.snap.classList.add('highlight');
      s.refs.drv.classList.add('highlight');
      s.refs.nd.classList.add('highlight');
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
