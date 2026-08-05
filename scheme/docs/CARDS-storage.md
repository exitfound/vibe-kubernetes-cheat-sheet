# Scheme card design notes: storage

The per-card design record for `js/schemes/storage/`. It answers what the code cannot: why a number
is what it is, which alternative was measured and failed, and what must not be "fixed". The
constants themselves live in the card and are not repeated here.

Sister files: `CARDS-<category>.md` for the other three categories, `INTERNALS.md` for the shared
sources (catalog, kits, CSS).

**Not deployed.** Three exclusions keep `scheme/docs` out of production and all three must hold:
`deploy.yml` runs `rm -rf _site/scheme/tools _site/scheme/docs`, `release.yml` lists
`"scheme/docs/*"` in the zip's `-x` list, and `.dockerignore` lists `scheme/docs`. The last is not
optional, because `Dockerfile` is a blanket `COPY . .`. Verify with
`curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/scheme/docs/CARDS-storage.md`,
which must return 404.

**HOW TO READ THIS FILE.** (Deliberately not a `##` heading: every `## ` here is a card id, and
`check-notes` parses it that way. A second-level heading anywhere else is reported as an orphan.)

One `## <card-id>` section per card. Each ``### before `<line>` `` holds the note for one line of
code, and `check-notes` verifies that line still occurs in the card, so **an anchor is DATA: never
reword one.** Where a card has a header note it hangs off the card's first constant and carries the
whole layout in labelled blocks. `### poster` describes the grid thumbnail. Two shapes deliberately
carry no anchor and say so: `### opacity phases`, whose constant was replaced by `OPACITY.*`, and
`### note (anchor dropped: ...)`, whose target line appears more than once in the card.

The labels, in this order, only the ones that apply:

| | |
|---|---|
| `WHAT` | what the card draws, in one sentence |
| `LAYOUT` | the tiers, and the geometry that follows from the panel |
| `PANEL` | the measured overlay extent for THIS card, and what it pins |
| `LANES` | wire topology, and which array feeds both the wire and the ball |
| `MOTION` | pulse and packet order, durations where they were sized deliberately |
| `CONTENT` | a technical claim checked against the reference, and the wording it forced |
| `BUDGET` | the narration or caption ceiling this card's geometry imposes |
| `WHY NOT` | an alternative that was measured and fails, with the number that kills it |
| `DO NOT` | a constraint, with the defect it prevents |
| `NOT A DEFECT` | something a lint or a reader reports that is correct as drawn |
| `NAMING` | why a block, a card or a string carries the wording it does |
| `SCOPE` | what this card deliberately leaves to a named sibling |
| `OPEN` | known and unresolved |

**The family contract is not repeated per card.** The Pod pulse model and the wrapping `g`, only
Pods pulse, every step writes every chip, `setStage` pins every born element, lanes pin to 0 and
blocks to `OPACITY.pending`, one points array per wire and its ball, z-order, `CHIP_W 232`, the
per-class text rates, the panel behaviour, and no packet dot on a poster: all of that is in
`js/schemes/storage/CLAUDE.md` under "The storage card contract". A note here states only its card's
delta.

**Panel extent is per card.** The right edge is `x<=398` catalog-wide, but the BOTTOM ranges 130 to
498 and moves with viewport HEIGHT as well as width, so a measured table is a measurement and a
blanket `y<=300` is not. `check-geometry`'s OCCLUDED rule samples 1600x1000, 1280x860 and 1100x800
only. Several tables below carry a 900x650 row that is stricter than anything the rule sees, and
where the two disagree the card takes the stricter number and says so.

---

## storage-access-modes

### before `const LEFT_X = 400;                                      // leftmost the NODE ROW may go, all viewports`

```
WHAT  Which node, and which Pod, may hold the volume at the same time. Two worker nodes carrying
Pods on top, the CSI driver as a full-width band under them, two PVs on the bottom shelf: a block
disk that can only do single-attach and a shared filesystem that can do many.

LAYOUT  Tiers are derived, but they do NOT all share one centre, and the split is the point. The
node row sits inside the panel's vertical band, so it starts at LEFT_X 400 and its own centre works
out to 647. Everything BELOW the panel floor has the full width free, so the driver band, the disk
shelf and the chip strip centre on the CANVAS (600). The band reaches 600 without moving its right
edge: it stays flush with the node row at 894 and takes the width it gains on the left, 306..894,
which is also what fills the empty lower-left corner.

PANEL  Worst step, right edge / bottom edge by viewport:
  1920x1080 -> 203 / 146    1440x900 -> 319 / 183    1280x800 -> 358 / 213
  1100x800  -> 397 / 230     900x650 -> 398 / 375
So x<=398 and y<=375. LEFT_X 400 has about 2 units of slack and cannot move left at all, and the
driver band (bottom 375) is only just clear at the smallest window.
DO NOT re-derive LEFT_X from the panel measured at your own window size: a left edge picked from one
wide-window sample looks centred on the machine it was tuned on and slides under the panel on a
laptop.

LANES  Every mount is a DESCENT through the driver: Pod to driver (the attach request), then driver
to disk (the attach). A ball entering the driver at the Pod column and re-emerging at the disk column
is the rewrite-inside-a-box idiom, because the driver is where the decision is made. A refused attach
stops AT the driver and never reaches a disk.
Because the band is no longer under the Pods that feed it, the three attach requests drop onto a bus
at y=260 (clear of the panel floor at 230) and enter the band on its centre line.
WHY NOT drop each Pod straight down: that puts three arrows across a 588 unit face, none of them near
its midpoint. The fan below the band avoids the same defect by leaving the band at one point and
fanning out inside the disk column.

MOTION  Only Pods pulse. The driver and the disks light.
```

### before `const POD_Y = 82, POD_W = 128, POD_H = 126;`

```
Pod and node sizes drive everything else: the node row width is DERIVED from what it has to hold, and
the driver band and disk shelf follow that. Nothing here is a hand-typed x.

POD_W decides how far the NODE ROW sits off the canvas centre, because that row's centre is
LEFT_X + (3*POD_W + 102)/2 and LEFT_X is pinned by the panel. Every extra unit of POD_W costs 1.5
units of rightward shift, since three Pods sit in the row: at 156 the row centre lands on 692, which
reads as a visible shift right, at 128 it lands on 647.

BUDGET  POD_W is floored by the WIDEST TEXT INSIDE A POD. The container sublabel is 'read/write' at
59 units; 'reads and writes' renders 94 and puts a hard floor of ~146 under POD_W.
DO NOT lengthen that string without re-deriving the row centre.
WHY NOT 112: the Pods come out narrower than they are tall and read as squeezed. 128 is the widest
the row can go while the whole diagram still reads as centred.
```

### before `const SPEC_GAP = 14;`

```
cylinder() puts its own name on the baseline h/2+5, and this spec line goes 14 BELOW that, the same
gap storage-pvc-binding uses.
WHY NOT a flat PV_Y+66: against a 100 tall cylinder that leaves 11 units between two baselines whose
text is 11 units tall, so the two lines visually touch.
```

### before `const CHIP_W = 232;`

```
ONE width for all four chips. Measured worst cases, in viewBox units:
  accessModes 76 + ReadWriteOncePod 110 = 186   <- the binding one, and neither string can shorten
  attached to 76 + 'node-1, node-2'     96 = 172
  sharing     48 + 'app-1, app-2, app-3' 131 = 179
  enforced by 76 + 'CSI driver'          69 = 145
232 clears the worst pair with ~22 units between name and value.
NAMING  The multi-value chips read as comma lists because 'node-1 and node-2' and
'app-1, app-2 and app-3' are wide enough to force a wider uniform chip, and the strip is already
more than twice the width of the diagram it captions.
```

### opacity phases (was `const DIM = 0.75`, now OPACITY.*)

```
Dim means the access mode REFUSES this Pod. It does NOT mean "has not mounted yet": a Pod that simply
has not been shown mounting is a perfectly healthy Pod and must look like one.
DO NOT dim the not-yet-mounted Pods. The poster auto-plays step 1, so that is the frame you stare at
on open, and it showed two of three Pods greyed out for no reason a viewer could name. It also
conflated app-2, which mounts fine one step later, with app-3, which is genuinely refused.
Who currently HOLDS the volume is carried by the ball, the lit disk and the sharing chip instead.
```

### before `const NFS_LANE = 16;`

```
The shared filesystem is reached on THREE lanes, one per mounting Pod, and all three are drawn.
DO NOT collapse them to a single wire down NFS_CX with balls flying at NFS_CX +/- 7: then no ball
rides the drawn line, they skim 7 units either side of it.
Three lanes rather than two because ReadWriteMany excludes nobody: app-2 sits on the same node as
app-1 and can mount it just as well, and leaving it out made the step look like RWX still rations
access somehow.
```

### before `[nodeA, nodeB, driver, pvBlock, pvNfs, podA1.group, podA2.group, podB1.group].forEach(el => root.appendChild(e`

```
Family z-order, with the Pods above their node frame.
```

### before `function setChips(s, { mode, attach, share, enforcer = 'CSI driver' }) {`

```
enforcer is a real value, not a constant caption: every mode here is honoured by the driver EXCEPT
ReadWriteOncePod, which Kubernetes itself enforces.
DO NOT hardcode it back to 'CSI driver': that makes it dead weight and wrong on the one step where it
matters.
'sharing' answers exactly one question: which Pods hold the volume right now.
DO NOT let it double as a refusal report ('node-2 refused', 'block cannot span nodes'). That puts a
refusal in the chip on the very step where a ball flies out of a refused Pod, so the chip reads as a
caption for that ball. Refusal reasons belong on the driver wire label, which already carries them.
```

### before `function denyMount(s, ctx, { podEl, reqPts, tag, lead = 0 }) {`

```
A refused attach: the request reaches the gate and stops there. No disk lights.
The Pod blinks FIRST, exactly as in grantMount. It is the actor either way, and without the blink the
narration names a Pod that is never seen doing anything: the ball just materialises out of a dim
block. Refused Pods stay dim, so the blink takes the dim variant with an opacity lift.
```

### before `s.refs.pvBlock.classList.add('highlight');`

```
The disk stays lit: it is still attached to node-1 and still in use by app-1 and app-2. It is the
REASON app-3 is refused, so leaving it unlit contradicts both the wire label and the narration, which
say in so many words that the disk is already attached.
```

### poster

```
Abstract, not the literal diagram, built around the one thing the card is about: the access mode is a
GATE, and the gate answers per NODE rather than per Pod. Three tiers, the same descent the diagram
uses: two node enclosures on top, one full-width gate band across the middle, one disk below.

Three Pods ask. Two lanes come out the bottom of the band and converge into a single disk; the third
stops dead ON the band under an X and never re-emerges. The surprise is carried by the left node:
BOTH of its Pods pass, because the gate grants a node, not a Pod.
Below the band ONE lane leaves, straight down the disk column, and it does not trace back to either
Pod. Two requests go in and a single attachment comes out, which is exactly what "the mode grants a
node, not a Pod" means. Two lanes out would say each Pod got its own.

DO NOT dim the X. The refused lane is dashed and its node is dim, but the X is drawn at full strength:
a dim refusal reads as an unfinished drawing rather than as a denial.
All three lanes ARRIVE at the band as arrows, landing on its top edge rather than crossing it: every
attach is a request made TO the gate, and a line drawn straight through would say the gate is scenery
the traffic ignores. The granted pair re-emerges from the bottom edge, the same enters-one-edge-leaves-
another idiom the card uses for the driver.
Node widths stay close on purpose, so the difference reads as "which node holds it", never as size.
```

---

## storage-configmap-secret-mount

### before `const POD_X = 330, POD_Y = 56, POD_W = 540, POD_H = 120;        // 330..870, center 600`

```
WHAT  ConfigMap and Secret as files. A vertical stack symmetric about x=600, in family with
volume-model and emptydir: the consumer Pod on top, the mounted /etc/config volume in the middle, and
the source row at the bottom, ConfigMap on the left feeding kubelet in the centre fed by Secret on the
right. Reading the card bottom to top IS the mechanism: a source object becomes files via kubelet, the
files resolve through the ..data symlink, the app reads the result.

CONTENT  The mechanism is the ATOMIC SYMLINK SWAP. kubelet writes the keys into a timestamped
directory and points a ..data symlink at it. On update it writes a brand new timestamped dir, then
flips the single ..data symlink in one step, so a reader never sees a half-written config. Updates
land on the kubelet sync period (up to about a minute) and the app must re-read the file itself. A
subPath mount pins one file and opts OUT of the swap, so it never updates. A Secret uses the same
machinery but on tmpfs.

LANES  Almost every lane is ONE straight segment. The two source lanes mirror each other on the
bottom row, the two write lanes rise vertically into the dir slots at x=460 and x=740 (symmetric
about the spine), and the read lane rides the spine itself (x=600, ..data up to the Pod).
The subPath lane is the exception: it rises STRAIGHT out of the v1 dir at x=460, bypassing ..data,
which is exactly its meaning, then steps across the Pod-to-volume corridor at y=222 to enter the Pod
at x=540, 60 left of the spine.
WHY NOT take it straight to the top: it ends at the Pod's corner, 140 off the midpoint of a 540 wide
face and alone there, which reads as a lane that missed rather than as a second read path. The step
is in the corridor, so it crosses nothing, and it stays clear of the sync-period label at x=618.
Symlink pointers are dashed right-angle Ls out of the sides of ..data, each dropping into the dir slot
it points at, bare and arrowhead-free, so the slot columns read kubelet -> dir -> ..data top to bottom.

PANEL  The Pod starts at x=330, y=56, clear of the panel measured on the family cards ((300, 163) on a
comfortable 1600px viewport). On narrow windows the panel may brush the Pod corner, the accepted
family trade. A longer narration invalidates this.

MOTION  Highlights are STEP-STATIC: every block a step uses lights at step entry, above the reduced
guard, never on packet arrival.
The v2 dir slot and its write lane stay empty until the update step creates them.
```

### before `const SYM_OLD = [[DATA_X, SYM_Y], [OLD_CX, SYM_Y], [OLD_CX, DIR_Y]];`

```
Symlink pointers: strict right-angle Ls into the directory they point at, drawn with relationPath
because a symlink is a relationship rather than traffic, so they carry no arrowhead and sit recessed
behind the live lanes. Each exits the SIDE of ..data at its mid height, turns 90 degrees over its dir
slot and drops into the slot top, mirroring the write lane below the slot so the column reads
kubelet -> dir -> ..data.
DO NOT hand-roll these as stripped pathArrows, and do not give them a marker.
```

### before `function setStage(s, { symOld = 1, symNew = 0, dirNew = 0, writeNew = 0, subpath = 0, sec = OPACITY.notready } = {}) {`

```
Family setStage. The v2 dir, its symlink pointer and its write lane exist only from the atomic step
on, the subPath lane only on its step, and the Secret sits dim until its step brightens it.
```

### poster

```
The card in miniature: the app reads down the spine through ..data, whose bare right-angle pointer
(no arrowheads, as on the card) has flipped off the dim v1 dir onto the fresh v2 dir. The short lines
inside each dir are the keys sitting as files.
```

---

## storage-container-filesystem

### before `const POD_X = 440, POD_Y = 48, POD_W = 320, POD_H = 140;`

```
WHAT  Container filesystem layers. A vertical stack centred on the canvas: the Container (consumer)
on top, its overlay layers stacked directly beneath it, and the real volume disk on the shelf at the
bottom, centred under the stack so the whole column is symmetric on 600.

CONTENT  The teaching contrast. The container root filesystem is read-only image layers (lowerdir)
with ONE thin writable layer (upperdir) on top, combined by overlayfs. A write copies up into the
writable layer, never into the image, and that writable layer is DISCARDED when the container is
removed. A mounted volume is a hole punched through the overlay straight to real storage, bypassing
the writable layer, so it survives.

LANES  The bypass is drawn literally: the volume wire leaves the Container SIDE and zigzags in right
angles around the stack down to the disk.

MOTION  The writable layer does not exist until its step, so its copy-up wire does not either: the
layer and the wire fade in together, are discarded together, and return together for the fresh
container. Only the Container (a Pod-like consumer) pulses; the layer boxes and the disk light.
```

### before `const W_COPYUP = [[POD_CX, POD_BOTTOM], [POD_CX, WR_Y]];`

```
The copy-up write descends onto the writable layer. The volume write leaves the Container SIDE and
zigzags in right angles around the whole stack down to the disk: the literal picture of bypassing
every overlay layer.
```

### before `function podBlock({ x, y, w, h, label, sublabel }) {`

```
Family pulse model: the pulse takes the whole Container group, so the Process box inside blinks with
the Container it belongs to. shellWrap survives as a handle for code that wants the shell alone.
DO NOT aim the pulse at shellWrap: it then cannot reach the Process box.
```

### before `const volLbl = volume.querySelector('.scheme-cylinder-label');`

```
Family cylinder-label re-centring: the face spans 2*ry..h, so the baseline sits at its middle plus
half the font x-height.
```

### before `const fsChip      = valChip({ x: 100, y: CHIPS_Y, w: 320, h: 34, name: 'root fs', value: 'read-only image laye`

```
The writable layer is not on screen yet at build time, so the chip starts honest: only the read-only
image layers exist until the writable step adds the RW top.
One uniform chip size, and the strip (3x320 + 2x20 = 1000) is centred on x=600, the axis of the whole
column above, so the bottom row is symmetric with the diagram.
```

### before `s.refs.writable.style.opacity = '1';`

```
A fresh container is running again, so a fresh EMPTY writable layer and its copy-up wire fade back in
together: the reappearing layer is the restart made visible, not the old layer returning. Its
contents are gone, and the sublabel still reads starts empty.
```

---

## storage-csi-architecture

### before `const M = 60;                                    // one margin, both sides`

```
WHAT  The CSI component map. The story is STRUCTURAL rather than a single descent, so this card does
not use the vertical mount-lane stack of storage-volume-model. It reads left to right as
core -> bridge -> vendor -> machine:
  left column   Kube-apiserver (top row) and Kubelet (bottom row): Kubernetes core, no vendor code
  upper frame   the CONTROLLER PLUGIN, a Deployment that runs off-node: four sidecars on a shared
                gRPC bus into one vendor driver
  right of it   the cloud storage API, the only thing the controller ever calls outward
  lower frame   the NODE PLUGIN, a DaemonSet on every node, and the node filesystem beside it

MOTION  It has NO Pod at all, on purpose, so nothing pulses anywhere and that is correct: the pulse
is reserved for Pods and infrastructure lights with .highlight. Every element here is either
Kubernetes core, a vendor process or the machine.
DO NOT draw the controller plugin or the node plugin as pod() shells. They are the two things a
reader could mistake for Pods, and they are labelled by their CONTROLLER (Deployment / DaemonSet),
so a Pod shell would name the wrong object.

PANEL  Worst step, right / bottom by viewport:
  1920x1080 -> 203 / 130    1440x900 -> 319 / 163    1280x800 -> 358 / 189
  1100x800  -> 397 / 205     900x650 -> 398 / 313
So x<=398 and y<=313, under the blanket y<=300 on the y axis but slightly OVER it on x. Everything
left of x=420 therefore starts at y>=350, clearing the measured bottom by 37: the apiserver row, the
kubelet row, the chip strip and the two left-hand wire captions. The controller frame's left border
is the leftmost thing that sits high on the canvas, at x=420, clearing the right edge by 22.
BUDGET  A LONGER NARRATION INVALIDATES BOTH NUMBERS, and this is not theoretical: one added sentence
on the 'controller' step took the 900x650 bottom from 313 to 344, which swallowed the apiserver row.
Re-measure before shipping any narration edit.

LAYOUT  ONE pair of constants fixes the content band and every tier hangs off it.
WHY NOT hand-typed margins: they drift. Content ran x 60..1180, a 60 unit left margin against a 20
unit right one, centre 620, visibly shoved right.
```

### before `const SIDE_W = 232;`

```
Kube-apiserver, Kubelet and the cloud API share ONE width. The meaningful mirrored pair is the
apiserver and the cloud API: they are the two worlds the driver bridges, Kubernetes on the left and
the vendor on the right, so they are equidistant from CX by construction (60..292 and 908..1140).

BUDGET  The floor under SIDE_W is the widest string any of them carries, kubelet's sublabel
'asks node plugin to mount' at 150.7 units. 232 leaves ~40 either side.
DO NOT shrink below ~200 or that sublabel starts touching the box edge.
```

### before `const FRAME_X = 420, FRAME_PAD = 12;`

```
Both frames start at the same x so they read as two halves of one driver. 420 is not chosen for
looks: it is the first tidy value clear of the measured panel right edge of 398, and it also leaves a
140 unit box-to-box gutter on the node row (kubelet 292 to registrar 432), the same length as the
node driver to node fs gutter on the far side, so the two horizontal wires on that row are an exactly
matched pair.
```

### before `const CF_Y = 48;`

```
Top margin 48 (the frame border), bottom margin 16 (the chip strip). Unequal on purpose, and it
matches the catalog: the top element is a dashed border whose caption is inset 22 below it, so the
top reads airier than the number suggests, while the chip strip is solid ink to its last pixel.
DO NOT put CHIPS_Y at 616. With a 34 high chip that runs to 650 and is CLIPPED by the 640 unit
viewBox, silently cutting the bottom 10 units off all four chips. 590 is the catalog value
(storage-volume-model uses it) and leaves a real 16 unit margin.
```

### before `const S_GAP = 14;`

```
Four sidecars on one row. The widths are solved, not picked: each box needs its widest string plus
air, and the leftovers are spread so every box ends up with the SAME air. Measured strings:
  external-provisioner 120.6 / watches PVC 66.3            -> needs 120.6
  external-attacher 103.4 / watches VolumeAttachment 144.7 -> needs 144.7
  external-resizer 92.2 / watches PVC resize 108.5         -> needs 108.5
  external-snapshotter 124.9 / watches VolumeSnapshot 132.7-> needs 132.7
Sum 506.5. The inner span is 696 and three 14 unit gaps eat 42, leaving 654 for the boxes, so there
are 147.5 units of air to share: ~37 per box.
DO NOT shrink CF_W. The attacher sublabel is the first string to touch its box edge.
```

### before `const DRV_CX = (CF_INNER_L + CF_INNER_R) / 2;                // 780`

```
The driver is what all four sidecars call, so it is centred on the sidecar ROW rather than on the
frame: the row spans CF_INNER_L..CF_INNER_R, whose centre is 780. Its width echoes SIDE_W, which puts
the three "servers" in the picture (apiserver, driver, cloud API) at one size.
```

### before `const DRV_EXIT_X = DRV_CX;                                   // 780`

```
The run out to the cloud leaves the driver from the CENTRE of its bottom edge, the same anchor the
inbound gRPC wire uses on the top edge, so the driver reads as one block with traffic entering and
leaving on its spine rather than off to one side. The drop lands on MID_CY and then runs 128 units
right into the cloud box, a long enough horizontal leg to read as a run and not a stub.
```

### before `const CHIP_GAP = 16, CHIP_COUNT = 4;`

```
One chip width for all four, derived so the strip spans exactly the content band, which makes the
strip agree with the diagram above it instead of being a fifth hand-typed margin. Worst measured
name + value pair is 'node plugin' 75.8 + 'mounts the disk' 103.4 = 179.2, so 258 leaves ~55 units of
clear gap.
```

### before `const LANE = 14;`

```
The provisioner is the only block with traffic on both sides of it, and each direction gets its OWN
lane offset LANE around the box centre: the watch arrives on the left lane and the gRPC call leaves
on the right one.
DO NOT run both through S_CX: 32 units of the two arrows are then drawn exactly on top of each other
and the ball retraces its own inbound path.
```

### before `const W_BUS_TAIL   = [[DRV_CX, BUS_Y], [S_CX[3], BUS_Y]];`

```
The other three sidecars share the same bus into the same driver, which is the whole point of the
card, so the structure is DRAWN: a stub down from each sidecar onto the bus, and the length of bus to
the right of the driver drop. No ball ever rides these, so they carry NO arrowhead.
```

### before `function frame(x, y, w, h, label) {`

```
A dim, arrowhead-free frame that groups one half of the driver. It carries no traffic, so no marker.
The caption baseline sits 22 below the border and the row inside starts 34 below it, leaving 12 units
of air between the caption and the first box.
DO NOT shrink that 12: the caption starts touching the box tops.
```

### before `r.style.stroke = 'var(--diag-node-stroke)';`

```
The border reads as the same kind of grouping element as a node frame, so it takes the same token the
catalog node rect takes (--diag-node-stroke, the jade --tint-deep inside a tinted storage dialog,
exactly what node-1 uses on storage-csi-attach-mount).
DO NOT use a flat white at 0.22: it sits outside the category tint and reads as a different family of
line. The frame stays fill-less and keeps its sparser '3 6' dash, so it still reads as subordinate to
a real node: a frame here is a label for a set, not a thing traffic ever touches.
```

### before `const api  = box({ x: API_X, y: MID_Y, w: SIDE_W, h: MID_H, label: 'Kube-apiserver', sublabel: 'core, no vendo`

```
NAMING  Block LABELS are sentence-capitalized. Hyphenated names take the capital on the first word
only (External-provisioner, Node-driver-registrar): they are one identifier, not a phrase, so
capitalizing every segment would read as three separate proper nouns. Sublabels stay lowercase prose,
and so do the literal object names quoted inside narration and riding tags.
```

### before `const watchLbl = text({ class: 'scheme-label code dim', x: (API_R + S_CX[0] - LANE) / 2, y: MID_CY + 20, 'text`

```
Three wire captions, all on horizontal runs, all pushed BELOW their wire. A riding tag renders 14
units ABOVE its ball, so a caption on the same side of a lane the ball uses gets sat on.

There is deliberately NO caption on the provisioner -> driver lane. That hop is the one this card is
named after, so the ball itself carries 'CreateVolume', and a caption on the same lane would be run
over by the tag as it travels the bus. For the same reason the apiserver hop carries no tag: its ball
and the CreateVolume ball both terminate on the provisioner's bottom edge 28 units apart, so two tags
there overlap for ~390ms of the step. The Pending PVC is named by this caption instead, where it is
standing still and readable.
```

### before `[ctrlFrame, nodeFrame].forEach(el => root.appendChild(el));`

```
Family z-order, with the two frames behind everything they contain.
```

### before `function setChips(s, { core, ctrl, node, bridge }) {`

```
Family setChips, and every chip means exactly what its name says.
DO NOT let 'bridge' report 'registered' or 'touches fs': neither is a bridge, both are node-plugin
facts, and they belong in the 'node plugin' chip. A chip that reports somebody else's state is how a
card comes to contradict its own narration.
```

### before `duration: 3600,`

```
Three chained hops measure span=3122ms, so the duration keeps ~480ms of headroom. Anything added to
this step has to be re-checked against anim-dump: if span passes duration, the auto-advance cuts the
cloud call off mid-flight and the step under-shows what it narrates.
```

### before `ridingLabel(s, ctx, 'CreateVolume', W_PROV_DRV, { delay: watch.arrivalMs + BEAT.afterHop });`

```
The gRPC call is the thing this step is named after, so the ball carries it by name.
DO NOT hang 'CreateVolume' on the wire caption of the DRIVER to CLOUD line, two hops further on: that
labels a vendor API call as if it were the sidecar call.
```

### before `s.refs.api.classList.add('highlight');`

```
Static highlight only, and deliberately no motion at all. The usual argument for a flash on a
packet-less step (so it does not read as a frozen frame) does not apply to the LAST step, which is
supposed to come to rest. Lighting the whole chain at once IS the summary, and it wants to be read,
not blinked at.
DO NOT flash the five boxes here: the beat lands after the narration has already moved on to the
summary.
```

---

## storage-csi-attach-mount

### before `const M = 60, GUTTER = 48;`

```
WHAT  THE LADDER CARD. The four gRPC calls that stand between a bound claim and a writable /data are
a numbered ladder down the LEFT (chainList, one rung lit per step), and the RIGHT is the topology
those calls act on: the cloud disk up top outside any node, then node-1 holding the node plugin, the
attached block device, the ONE global staging mount, and the two Pods that share it.

CONTENT  The descent is literal. CreateVolume makes the disk, ControllerPublishVolume moves it into
the node as a device, NodeStageVolume mounts it once at the global path, NodePublishVolume
bind-mounts that one staged filesystem into each Pod. Stage is once per node, publish is once per
Pod, which is exactly how two Pods on one node share one disk.

LAYOUT  Two columns of EQUAL width sharing one centre. The canvas centre is 600 and both margins are
M=60, with a gutter G=48 between the columns, so 2*M + 2*COL_W + G = 1200 solves COL_W to 516. That
is not a chosen number: it is what makes the ladder (60..576) and the node column (624..1140) mirror
each other about 600. Change M or G and COL_W has to be re-solved.
WHY NOT hand-typed LAD_W 508 / NF_W 560: the content bbox lands at 60..1178, centre 619, visibly
shoved right.
Every tier inside the node column is symmetric about NODE_CX = 882 (= NF_X + NF_W/2), never about a
hand-typed margin: the two Pods sit at 753 and 1011, midpoint 882, and the staging band and the node
driver both hang off the same NODE_PAD. The chip strip is the one tier that spans the WHOLE content
width (60..1140) rather than one column, so it reads as a rail under both columns and its own centre
is 600, agreeing with the composition centre rather than fighting it.

The CSI controller lives in the LEFT column at 60..312, y 268..332, because it is the one actor that
is NOT on the node.
WHY NOT leave it inside the node column, level with the cloud disk: that puts EVERY block on the card
in the right half. The content bbox runs 624..1140, centre 882, and the whole left half below the
panel is blank apart from the ladder. Moving the one off-node actor to the off-node side puts a block
on each side and the low content spans 60..1124, centre 592. CreateVolume pays for it with two
corners instead of none: it leaves the controller's right face, turns up at x=520 (right of the
panel's 397 at every viewport) and runs to the cloud disk's left face in the free band above the node
frame.

PANEL  Worst step, right / bottom by viewport:
  1920x1080 -> 203 / 146    1440x900 -> 319 / 183    1280x800 -> 358 / 213
  1100x800  -> 397 / 230     900x650 -> 398 / 375
So x<=398 AND y<=375, well inside the blanket rule on x but PAST it on y, because this card carries
some of the longest narration in the catalog. That is what pins the ladder: LAD_Y 388 clears the
measured 375 by 13 units and cannot move up. Lengthening any narration invalidates these numbers.

OPEN  TWO STANDARDS, AND THEY DISAGREE. `check-geometry`'s OCCLUDED rule samples 1600x1000, 1280x860
and 1100x800 only, where this card's panel bottoms out at 230, and `overlay-measure` measures the
same 230. The 900x650 row above is a wider hand sample and is the stricter number by 145 units. The
CSI controller at y=268 clears 230 by 38 and is reported clean, but at 900x650 it would be behind the
panel, and so would the top rung of the ladder. There is nowhere else for it: below 375 the left
column is the ladder, and the whole point of moving it was to get a block out of the right half. If
the panel is ever clamped in CSS, this is one of the cards that gets its margin back.

BUDGET  Text widths are MEASURED via getBoundingClientRect and mapped back into viewBox units. Both
the chip text and the dim code labels are 11px JetBrains Mono, so one number sizes the chip strip and
the band caption:
  .scheme-chip-text      6.89 u/char  ('attached to node-1' = 124.0 over 18 chars)
  .scheme-label code dim 6.89 u/char  ('one mount, two bind mounts' = 179.2 over 26 chars)
It is monospace, so that rate has zero variance and one sample is enough. Longer strings measure
slightly under (the ladder rows run 6.54 to 6.62) only because of the narrow separator glyph.
DO NOT measure before `document.fonts.ready`. A sample taken early reads 5.54 u/char, from which a
42-character ceiling and 46 units of caption clearance were derived, and both were wrong: that is the
fallback monospace, about 20 percent narrower than JetBrains Mono. Nothing overflowed then only
because the captions in use are short. Do not eyeball these off a screenshot either.
```

### before `const LAD_X = M, LAD_W = COL_W, LAD_Y = 388, LAD_ROW = 40, LAD_GAP = 10;`

```
The left column: the four-call ladder. The widest rung renders at 271.5 units plus the primitive's 10
unit text inset, so 282 of ink in a 516 wide rung. The extra width is deliberate: the rungs read as a
stacked bar chart of the chain.
DO NOT shrink them to the text: that breaks the column mirror the whole layout is built on.
```

### before `const DISK_W = 150;`

```
The cloud disk sits ABOVE the node frame because it does not live on a node: the first two calls are
cluster-scope. It aligns with the node column so the descent reads as one vertical story, the cloud
disk over the device it becomes.
CDISK_FACE_CY is the anchor for CreateVolume's last run: the lane arrives at the disk's LEFT face on
its mid height, horizontally, whatever the disk's height becomes. CTRL_Y is derived from the panel
floor rather than from CDISK_FACE_CY, because the controller now stands in the other column and the
level-face trick moved with it to the far end of the lane.
```

### before `const STG_X = IN_X, STG_Y = 350, STG_W = IN_W, STG_H = 58;`

```
The staging mount is a FULL-WIDTH band, not a centred box, for the reason the card is about: it is
one mount serving every Pod on the node, so it has to physically span all of them. It also gives the
device drop somewhere to land anywhere along its top edge.
```

### before `const POD_W = 226;`

```
2*POD_W + POD_GAP = IN_W = 484, so POD_W 226 leaves POD_GAP 32. The widest string inside a Pod is the
sublabel 'private bind mount' at a measured 99.7 units, so the width is set by the tier maths, not by
the text, and there are ~63 units of air either side of the longest label.
```

### before `const CHIPS_Y = 596, CHIP_H = 32, CHIP_GAP = 16, CHIP_COUNT = 4;`

```
Four calls, four facts, so each chip is the visible outcome of one rung of the ladder. The strip
spans the full content width, so 4*CHIP_W + 3*CHIP_GAP = 1080 with CHIP_GAP 16 solves CHIP_W to 258.
Worst name+value pair at the measured 6.89 u/char is 'bind mounts' (75.8) + '2 (Pod A + Pod B)'
(117.1) + the primitive's 24 units of inset = 216.9, so 258 leaves 41 units of air at the tightest
step.
```

### before `const STG_LBL_Y = 434;`

```
BUDGET  The band caption sits in the corridor between the staging band and the Pods, centred on
NODE_CX. The nearest obstacles are the two publish lanes at 753 and 1011, so the clear width is 258
units. Keeping 12 units off each arrowhead leaves 234, which at the measured 6.89 u/char is a hard
ceiling of 33 characters. The longest caption in use is 26 characters (179.2 units, 27 units of
clearance either side). Overrun the ceiling and the first and last letters sit on a lane arrowhead.
```

### before `const STAGE_ELBOW_Y  = (DEV_BOTTOM + STG_TOP) / 2;        // 327, centred in the 46 unit device gap`

```
The one remaining elbowed lane turns at the MIDPOINT of the gap it crosses, so the corner is centred
in its own corridor and stays centred if either block moves.
DO NOT hand-type it as 327. That value happened to be right, but nothing tied it to the blocks it
sits between, so changing DEV_H would strand the elbow mid-gap with no test and no screenshot
catching it.
```

### before `const W_CREATE  = [[CTRL_RIGHT, CTRL_CY], [CREATE_TURN_X, CTRL_CY], [CREATE_TURN_X, CDISK_FACE_CY], [DISK_X, CDISK_`

```
All four calls in the chain get a lane and a ball, and no lane carries return traffic, so no lane
needs an offset twin: this card is one-way all the way down. Each lane leaves its source from the
CENTRE of an edge, never off to one side.
CreateVolume is a single straight segment: controller right edge to disk left edge, both at y=96.
```

### before `const W_STAGE   = [[DISK_CX, DEV_BOTTOM], [DISK_CX, STAGE_ELBOW_Y], [STAGE_IN_X, STAGE_ELBOW_Y], [STAGE_IN_X, STG_TO`

```
The stage lane elbows in to NODE_CX before it drops, so the device visibly arrives at the MIDDLE of
the band rather than at the corner under itself: the staging mount belongs to the whole node, not to
the column the device happens to sit in. It also makes the run 217 units instead of a 46 unit stub.
```

### before `const W_OWNS = `M ${OWNS_X} ${ND_Y + ND_H} L ${OWNS_X} ${STG_TOP}`;`

```
Ownership, not traffic: the node plugin performs both node calls, so it owns the staging mount below
it. No ball ever rides this, so it is a bare dashed path rather than a pathArrow.
```

### before `function podBlock({ x, label }) {`

```
Family pulse model. The whole Pod lights for exactly as long as its ball is in flight and nothing is
left lit afterwards.
DO NOT call lightBoxAt on the container box at packet arrival: /data stays outlined for the rest of
the step after the blink has decayed, so the Pod reads as permanently mid-event.
```

### before `const shell = podShell({ x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel: 'private bind mount', containers: 0, role: 'storage' });`

```
The sublabel names what NodePublishVolume actually creates for this Pod, a per-Pod bind mount off the
shared staging path. It deliberately does not repeat '/data', which the container box below already
carries: two labels saying the same path made the Pod read as one fact printed twice.
```

### before `const ctrl  = box({ x: CTRL_X, y: CTRL_Y, w: CTRL_W, h: CTRL_H, label: 'CSI controller', sublabel: 'attacher +`

```
NAMING  Block labels capitalize the FIRST word only. A later word takes a capital only when it is an
API object, an acronym or an identifier: 'CSI controller', 'Global staging mount', but 'ConfigMap
app' and 'Pod A bind mount'. Sublabels stay lowercase prose.
Two labels are deliberately exempt because capitalizing them would make them WRONG rather than merely
styled: the device is a literal kernel path and there is no /dev/Nvme1n1 on any machine, and node-1
is a hostname whose primitive uppercases its own label in CSS anyway, so editing that string would be
a no-op that only looked like a change. Identifiers inside a name (vol-1) keep their real casing for
the same reason.
```

### before `const nodeFrame = node({ x: NF_X, y: NF_Y, w: NF_W, h: NF_H, label: 'Node-1' });`

```
The node primitive carries its own label at a position RELATIVE to the frame group. Let it place it.
DO NOT append a text with an ABSOLUTE x into the translated group: the group already carries
translate(624,192), so an x of 640 renders at 1264, past the 1200 viewBox, and the outer svg clips it.
```

### before `[dev, wAttach, wStage, podA.group, wPubA, podB.group, wPubB].forEach(el => { el.style.opacity = '0'; });`

```
A BLOCK AND ITS LANES ARE ONE CONSTRUCTION AND APPEAR TOGETHER.
Only the standing topology (controller, cloud disk, node driver, staging mount, and the ownership
spine between the last two) is drawn from the first frame. Everything BORN mid-story is hidden here
and revealed as a unit on the step that creates it:
  step 2  the device, with the lane that attaches it and the lane that stages off it
  step 4  Pod A, with its bind-mount lane
  step 5  Pod B, with its bind-mount lane
DO NOT hide only the blocks and leave the four lanes drawn from frame one. The card then opens on an
arrowhead pointing into empty canvas above the device and two more pointing at Pods that do not
exist, then pops a cylinder in underneath arrows already aimed at it. An arrow to nothing reads as
traffic that never runs, and it gives away the punchline (that one staged mount serves many Pods)
three steps before the narration gets there.
```

### before `root.appendChild(nodeFrame);`

```
Family z-order. The ladder goes last of all: it is the reader's index into the story and its lit rung
must stay crisp even when a ball is passing. Nothing overlaps it today, but the intent is stated.
```

### before `function setBorn(s, { device = 0, podA = 0, podB = 0 } = {}) {`

```
Family setBorn. A block and its lanes share one flag on purpose: they are one construction and there
is no legal state where a lane is visible and the block on the end of it is not.
```

### before `function call(s, ctx, { points, tag, target, delay = BEAT.lead }) {`

```
One infra-to-infra call: the source block is already lit at step entry, so the ball leaves after
BEAT.lead to let that registration land, and the destination lights on arrival. Returns arrivalMs so
anything that follows chains off real geometry instead of a hard-coded delay.
```

### before `function publishInto(s, ctx, { podEl, lane, points, tag }) {`

```
Reveal a Pod together with its own bind-mount lane, then run NodePublishVolume into it. This is infra
reaching a Pod, so it takes the down-arrow ordering: the ball flies first and the Pod pulses on its
ARRIVAL, never before.
The Pod arrives at FULL strength and simply pulses when the mount lands.
DO NOT fade it in at 0.5 and ramp to 1 on arrival, on the theory that a Pod with no volume yet is a
Pod that has not started. Pod A then sits visibly greyed out for the first three steps next to blocks
at full strength, so it looks broken rather than pending. A Pod that is not there yet is simply not
drawn, which says the same thing without dimming anything.
```

### before `revealAt(s.refs.dev, ctx, 0);`

```
The device and BOTH of its lanes materialise as one construction and finish materialising before the
call is sent (REVEAL_MS 500 against BEAT.lead 800), so the reader never sees an arrowhead aimed at a
block that is not there yet.
```

---

## storage-csi-capacity-tracking

### before `const CX = 600;`

```
WHAT  CSIStorageCapacity. With local or topology-constrained storage the scheduler can pick a node
whose storage pool is already full. Provisioning then fails there, and because the Pod cannot bind
until its volume does, it never schedules and stays Pending forever. CSIStorageCapacity objects,
published by the driver per topology segment, let the scheduler SEE the free capacity and filter out
the nodes that cannot fit the claim before it commits.

LAYOUT  Two nodes mirrored about the canvas centre: NODE_CX = [CX - SPREAD, CX + SPREAD] with CX=600,
derived from the node width and gap rather than typed. Each frame HOLDS its capacity object and its
pool, so the frames carry content instead of framing empty canvas. Content spans 195..1005, margins
195 a side.
The scheduler and the pending Pod stack on the centre line above the nodes, because there is one
scheduler and one Pod and the whole question is which of the two symmetric nodes they pick.

PANEL  Measured, panel bottom-right in viewBox units:
  1920x900  right 102  bottom 183      1600x1000 right 291  bottom 143
  1280x900  right 378  bottom 173      1100x900  right 397  bottom 149
  1280x860  right 397  bottom 255      1100x800  right 397  bottom 255
Worst case x<=397 and y<=**255**. The four taller rows are all 900 or 1000 tall, and a SHORTER window
shrinks the diagram while the panel, HTML at a fixed size, keeps its pixels and so eats more viewBox
units. The occlusion rule samples the two 255 rows, so 255 is the number this layout is built
against. The scheduler (y=36) and the Pod (y=136) both sit inside that y band, so both start at
x>=400. Everything from the node row down (y>=300) clears it by 45. A longer narration invalidates
this.

LANES  ZERO wire crossings. Each capacity read leaves the node frame through its TOP edge at the node
centre, rises straight up and enters the scheduler through the side midpoint facing it. The read and
the bind lane never appear in the same step, so sharing the node-centre column is fine, and the reads
clear the Pod on the centre line, so the two are exact mirrors that cross nothing. The publish lane
rises from the pool to the object on the column axis, offset by LANE so it meets the object beside its
Bound centre rather than on it, while the provision lane drops down the inner margin at PROV_INSET,
outboard of the capacity object, and enters the pool through its side face, so the two never share a
segment.

MOTION  On the failure step the Pod never went Ready, so it takes pulsePodDim with an opacity lift.
```

### before `const POOL_W = 168, POOL_H = 84, POOL_Y = 336;`

```
The pool and the capacity object both live INSIDE their node frame, the pool above and the object
below it.
WHY NOT hang the pools outside and below the frames: each frame is then a mostly empty 400 by 180 box
with one small block floating at its bottom, and the emptiness reads as a missing element rather than
as a boundary.
The pool sits ABOVE the object so that BOTH lanes inside a node can run down the column centre line:
bind arrives at the node top, provisioning drops straight into the pool, and the pool publishes
straight down into the object. With the object on top, provisioning has to detour around it and meets
the node frame 170 units off its edge midpoint, which reads as a lane stopping at a random point on
an edge rather than as an arrival.
```

### before `const wBind = (cx) => {`

```
The bind leaves the Pod through its SIDE (left edge for the left node, right edge for the right one),
runs out to the node centre line and drops into the node top, so the arrow exits the Pod on the side
facing its node rather than from underneath.
```

### before `function podBlock() {`

```
Family pulse model: the wrapping g is not optional.
```

### before `const CHIP_W = 232, CHIP_GAP = 16;`

```
Family chip width. Worst case here is 'result' + 'scheduled and mounted' at 27 characters, so
27 * 6.89 + 24 of padding is 210 against the 232 available.
```

### before `[...nodes, sched, ...pools, ...caps, podB.group].forEach(el => root.appendChild(el));`

```
Family z-order, with the Pod above its node frame.
```

### before `const DECIDE_DUR = 850, BIND_DUR = 1000, READ_DUR = 1000;`

```
The scheduler-decision walk (decide ball, Pod pulse, bind ball) is paced deliberately slower than
routeDur would pick, so the beat reads clearly: the ball glides in, the Pod takes its full pulse, and
only then does the bind ball leave, departing BEAT.afterPulse later once the 900ms blink has landed.
READ_DUR likewise slows the capacity-read balls up from the node tops so the reported numbers read
calmly. These explicit durs are why this card sits on check-canon's ALLOW_EXPLICIT_DUR list.
```

### before `function setStage(s, { caps = [0, 0], nodes = [1, 1], pools = [1, 1], lanes = [] } = {}) {`

```
Family setStage, lanes included.
```

### note (anchor dropped: `pulsePodDim(s.refs.podB, ctx, decide.arrivalMs, { from: POD_` is not unique in the file)

```
The scheduler's decision lands ON the Pod (down-arrow), so the Pod takes its full pulse on arrival.
It is only being scheduled, not Running, so it stays dim and needs the dim variant with an opacity
lift or the blink is invisible against the 0.55 it sits at.
```

### poster

```
The capacity record sitting between the pools that publish it and the scheduler that reads it: two
pools, one per topology segment, each advertise their free space up into their OWN value cell of a
single CSIStorageCapacity object, which the scheduler reads before it commits. The pair is mirrored
about the x=160 centre line, so the comparison (this pool against that one) is the shape of the
poster rather than a caption on it. Every link runs edge to edge, and each publish lane leaves its
cylinder at the midpoint of the side face it is drawn on, never inside the body, then turns up into
the exact x of the cell it fills.
```

---

## storage-dynamic-provisioning

### before `const LEFT_X = 400;                                   // leftmost the TOP ROW may go, all viewports`

```
WHAT  Same grammar as storage-pvc-binding: the IDENTITY COLUMN is the spine (PVC on top, the PV that
ends up bound to it directly below, both the same width and x), and the machinery sits in a column to
the RIGHT. The difference is that here the disk does not exist yet: the cylinder is invisible until
CreateVolume returns, and the Bound link is drawn only once the PV object has been written.

LANES  The descent is provisioner to backend (CreateVolume) and the ascent is the volume handle
coming back, on SEPARATE lanes so the round trip reads as a loop.

MOTION  This card has no Pod at all, so NOTHING pulses or blinks. The packet-less first step is fully
static by design and its read is carried by the .highlight outline alone.

LAYOUT  The two columns share ONE centre, CONTENT_CX, instead of each carrying hand-typed margins.
That centre is NOT the canvas centre and cannot be: the panel permanently occupies the top left and
the top row sits inside its band, which pins the left edge at LEFT_X 400. The chip strip is the
exception and centres on the CANVAS (600), because it sits below everything and has the full width.
CONTENT_CX is 630. The drawing does not slide left to reach 600: sliding it drags the claim under the
panel, which is what LEFT_X exists to prevent. What moves is the RIGHT edge, by narrowing the
machinery column from 240 to 220 and the elbow channel from 80 to 40, both of which had slack
('provisioner: ebs.csi.aws.com' is the widest string in that column at about 150 units). At 660 the
content bbox was 400..920 and the tool called it off centre by 60; at 630 it is 400..860.

PANEL  Measured right edge by viewport: 185 at 1920 wide, 275 at 1600, 322 at 1400, 342 at 1280, 379
at 1100 and below. The blanket x<=380 is that worst case, not a pessimistic guess, so LEFT_X 400
keeps a real margin at every window size.
DO NOT slide LEFT_X leftward after measuring the panel at your own window size. A left edge picked
from a single wide-window measurement looks centred on the machine it was tuned on and slides under
the panel on a laptop.
```

### before `const SPINE_X = PV_CX;  // 440`

```
The identity spine and the PV write BOTH run down the centre of the identity column. They can share
that x because they are never on screen together: the write arrow shows only while the PV is being
created, the spine only once it is bound. Any other arrangement puts one of them off centre.
```

### before `const ELBOW_X = PVC_RIGHT + COL_GAP / 2;   // 620`

```
The ONE vertical channel in the gap between the PVC column and the provisioner column. Both the claim
descending into the provisioner and the PV write leaving it turn on this x, and their vertical runs
do not overlap in y (122..279 above, 311..396 below), so sharing the channel reads as one clean lane.
Those four y values are a pair of MIRRORED lane offsets, not free numbers: two lanes meet the claim's
right face at 110 +/- 12 and two meet the provisioner's left face at 295 +/- 16.
WHY NOT 686 and 690, a 4 unit offset: far too small to register as a deliberate lane split (those use
LANE_DY, 15), so it just looks like a misalignment. A single lane sitting off a face midpoint on its
own reads as a slip, which is what the old 130 and 312 were.
ELBOW_X is derived from the gap so it stays centred in it if either column is resized.
```

### before `const cloud = box({ x: CLOUD_X, y: CLOUD_Y, w: CLOUD_W, h: CLOUD_H, label: 'Storage backend', sublabel: 'reached via the CSI driver', role: 'storage' });`

```
NAMING  The sublabel names the CSI driver because the narration says CreateVolume is called ON the
driver, and the driver has no box of its own: the ball lands here, so this box has to admit it is the
driver plus the backend behind it, or the text names an actor the picture does not have.
```

### before `const scRef = relationPath({ points: W_SC_REF, role: 'storage', dash: '5 5' });`

```
The claim NAMES its class. Nothing travels this line, so it carries no arrowhead.
Both of these are driven FROM their points arrays, not from repeated literals.
DO NOT rebuild them from hand-copied coordinates while W_SC_REF and W_BOUND sit unused: editing
either constant then moves nothing and the two silently drift apart.
```

### before `const wProvToPv    = pathArrow({ points: W_PROV_TO_PV, dashed: true, dim: true, role: 'storage' });`

```
Hidden until the step that writes the PV. This wire points AT the cylinder, and the cylinder does not
exist until CreateVolume has returned, so drawing it from step 0 is an arrow aimed at blank canvas.
It appears at the ENTRY of the createpv step (the ball has to have a wire to ride) while the cylinder
itself appears later, on that ball landing.
```

### before `const boundLbl = text({ class: 'scheme-label code dim', x: SPINE_X + 22, y: 296, 'text-anchor': 'start' }, [' `

```
Anchored to the RIGHT of the spine, growing away from the panel. Left-anchored it reaches back to
x=286 at its current length, and the panel drops to y=342 on a small window (measured at 900x650),
which puts this label at y=296 squarely underneath it. It only looks safe on a wide window, where the
panel stops at y=172.
```

### before `const chipX = CHIPS_X0;`

```
The strip is laid out from its own total width so it centres on CANVAS_CX, the same centre the blocks
above use.
WHY NOT hand-placed x values: they had it spanning 90..1080, a centre of 585, so the whole bottom row
sat 15 units left of the diagram it belongs to.
```

### before `narration: 'With static provisioning an administrator has to create the volume by hand before anyone can claim`

```
Deliberately motionless. A box flash would be canon-legal here (packet-less and Pod-less) but is
wrong: the StorageClass is being READ in this step, not acting, and a blink reads as the block doing
something. The static .highlight outline carries it.
```

### poster

```
Abstract, not the literal diagram: a claim on the left, a class "gear" in the middle, and a disk
being drawn into existence on the right (dashed outline, not yet solid). Made to order, not picked
off a shelf, so the shelf is absent entirely.
```

---

## storage-emptydir

### before `const NODE_X = 180, NODE_Y = 170, NODE_W = 840, NODE_H = 380;   // 180..1020, center 600, bottom 550`

```
WHAT  emptyDir lifecycle. A vertical stack, but the whole thing lives INSIDE one node boundary,
because that is the point of an emptyDir: it is born on the node, lives on the node disk, and dies
when the Pod leaves the node. The Pod (two containers) sits at the top of the node, the emptyDir disk
sits on the shelf below it, and the IDENTITY SPINE at x=600 (bare dashed, dim, no arrowhead) marks
that the directory is owned by this one Pod.

LAYOUT  The whole composition (node, Pod, disk, chip strip) is centred on x=600 and lifted as high as
the panel allows so it reads vertically centred: the panel was measured at every step and reaches
(300, 163) on a comfortable 1600px viewport, so the node top sits at 170, flush under it. On narrower
windows it grows to (399, 223) and may brush the node's top-left corner, an accepted trade. A longer
narration invalidates the measurement. The node keeps extra background below the disk so the inner
blocks do not crowd it, and the chip strip spans exactly the node width (180..1020).

LANES  volume-model grammar: the dim centre spine (ownership, no traffic) plus one L-shaped directed
lane per container, dropping from the container and entering the cylinder through its SIDE. Traffic
is one-way per container (the app only writes, the worker only reads), so each side carries a SINGLE
lane with an arrowhead for its one direction: the app lane points into the cylinder, the worker lane
points into the container. The containers are pushed toward the Pod edges so their centres land
outside the cylinder span, symmetric about the spine.

MOTION  Highlights are STEP-STATIC: every block a step uses lights at step entry, above the reduced
guard, and the Pod pulse fires at the same instant, one beat, no arrival delays.
FADES exist for exactly one meaning: an object CEASING TO EXIST. The dies step ghosts the Pod and its
directory in one simultaneous fade. Nothing else fades, the sizeLimit step included: it holds the
directory at full opacity and carries its beat with the Pod pulse and the over-limit write instead.
DO NOT give a container a crash flicker.
```

### before `setChips(s, { ed: 'empty', medium: 'node disk', limit: 'none' });`

```
The cylinder is visible from idle, deliberately, and the Pod is already on the node, so the truthful
idle state is an existing empty directory. The create step then narrates how it came to be, flipping
the chip to created empty.
```

### before `const GONE = [s.refs.pod, s.refs.ed, s.refs.spine, s.refs.wWrite, s.refs.wRead, s.refs.diskLbl];`

```
The Pod and its directory are gone. One simultaneous ghost fade for everything that belonged to the
Pod, so the delete reads as a single event. Ghost opacities are pinned statically so reduced motion
and a mid-step cancel land on the dimmed state.
```

### poster

```
The card in miniature: one node boundary holding the Pod (two containers) over a dashed, ephemeral
scratch cylinder. The signature side-entry L-lanes with chevrons tell the story in one frame: the
left container writes INTO the disk, the right container reads OUT of it.
```

---

## storage-ephemeral-storage-eviction

### note: Kubelet is an accepted off-card actor in storage

NOT A DEFECT, and this ruling covers the whole category. The `sources`, `podLimit`, `diskPressure`
and `rankEvict` steps all make the Kubelet the grammatical subject although the card draws no Kubelet
block, and every one of those statements is true of work only the Kubelet does. Storage has almost no
Kubelet box by design, so the alternatives were a prose sweep over two whole cards into the passive
voice, which throws the mechanism away, or drawing a Kubelet block, which is geometry. Accepted as an
off-card actor instead. `storage-hostpath` is exempt on the same grounds. Do not file these again.

### before `const NODE_X = 210, NODE_Y = 45, NODE_W = 780, NODE_H = 485; // 210..990, canvas-centered`

```
WHAT  Ephemeral storage limits. The whole scene is one node, CANVAS-CENTRED (210..990, centre 600).
Inside it the main column (the focus Pod, the three things that make up its ephemeral usage, the
nodefs disk) is a VERTICAL STACK symmetric about COL_CX = 620: the Pod centred over the contributor
row, the row centred over the disk. The other Pods, which matter only for the node-wide path, are a
right-hand column inside the node (they cannot leave it: DiskPressure on THIS node is what evicts
them), top-aligned with the focus Pod. The chip strip spans exactly the node width.

CONTENT  The card must keep TWO eviction paths distinct. Path A is per-Pod: writable + emptyDir +
logs going over limits.ephemeral-storage evicts THIS Pod at once, regardless of node health. Path B
is node-wide: nodefs usage crossing the eviction threshold taints the node DiskPressure, and kubelet
then evicts Pods ranked by Pod Priority and by how far each is over its request, which can hit a Pod
that was within its own limit.
DO NOT write QoS class as the ranking: the card's own distinct step contradicts it.

PANEL  COL_CX is 620 rather than the node's own 600, and that 20 unit offset is the whole story on
this card. This narration is the longest in the storage set, so the panel reaches x<=397 all the way
down to y=355, which covers BOTH the Pod tier and the contributor tier. At the old 480 the Writable
box (250..390) was 100 percent behind the panel, the Pod 21 percent and its app box 16. Shifting the
stack right by 140 clears all three (the Writable box now starts at 390, seven units inside the
panel's right edge at its worst, five percent of its area), and 620 is as far left as it can go while
doing so. The disk moves with the row, so its three contributor lanes still drop on +/-160 either
side of its own midpoint and stay a mirrored pair.

LANES  Every lane is ONE straight vertical segment: the disk is wide enough (440..800) that all three
contributor centres drop straight onto its top, no corners anywhere.

NOT A DEFECT  Centring the node puts its top-left corner, and the node tag on narrow viewports, under
the panel. That is the accepted price of the centring: a node frame is a container, not content, and
the rule that counts occlusion skips it. Every content BLOCK stays clear.
OPEN  The left third of the frame is empty for the same reason. On a wide viewport, where the panel
is short, it reads as empty rather than as reserved. Clamping the panel height in CSS is what would
let this card put something there.
```

### poster

```
The node holds a low nodefs disk (clean outline, no fill) with its three ephemeral contributors
(writable + emptyDir + logs) raised just above it and tied down to the disk top by short lines,
linked by a dashed line to the Pod that draws on it. Everything sits inside the one node boundary.
```

---

## storage-ephemeral-vs-persistent

### before `const SPINE_X = 600;`

```
WHAT  The side-by-side card. One Pod on top mounts two volumes, and the whole scheme is a SYMMETRIC
STACK centred on the canvas spine (SPINE_X = 600): the Pod straddles the spine, and each volume hangs
an even distance left and right of it. LEFT is ephemeral (an emptyDir owned by the node), RIGHT is
persistent (a PVC bound to a PV whose disk is a separate object, tied by a dim dashed identity link,
Bound, no arrowhead).

CONTENT  The Pod writes to both, is deleted, and is rescheduled onto another node. The emptyDir comes
back empty (it was tied to the old node) while the PVC reattaches the very same disk with the data
intact.

LANES  Each column carries TWO straight vertical lanes so every direction has its own arrow: an OUTER
write lane (Pod down to the volume, the ball descends) and an INNER remount lane (volume up to the
Pod, the ball rises).

PANEL  Because the diagram is centred on the canvas, the Pod's left shell edge passes under the
panel. This card's panel bottoms out at y=181 (measured over 1600/1280/1100), and the Pod is sized
and placed against that: 560 wide at y=90 leaves about a tenth of its area behind the panel at the
worst viewport, against a sixth at 620 wide at y=66, which the OCCLUDED rule counted as a lost block.
It cannot clear the panel outright without landing on the volume tier (the columns start at y=306 and
the write lanes would shrink to stubs), so a tenth is the trade. Nothing essential is hidden: the
pod() label and the app box are centre-anchored at the spine, and every volume sits below y=306.
The divider between the halves starts under the Pod (POD_BOTTOM + 16) rather than at a typed 206, so
it can never poke into the Pod when the Pod moves. The three state chips are a single width on one
pitch, centred on the canvas.
```

### before `s.refs.ed.classList.add('highlight');`

```
All three volumes are attached from the start of the step, so they light at entry. Then the two mount
balls ride up their INNER lanes (volume to Pod), and the Pod pulses on arrival. The left mount
carries nothing, the right mount carries the surviving row.
```

### poster

```
One Pod, two volumes, one split down the middle: after a reschedule the ephemeral emptyDir (left,
dashed and faded) comes back WIPED EMPTY, while the persistent PVC/PV (right, solid) reattaches the
very same disk with its data rows INTACT. The empty-versus-full contrast is the whole card.
```

---

## storage-fsgroup-ownership

### before `const CONTENT_CX = 600;`

```
WHAT  fsGroup and volume ownership. A volume mounts owned by root, so a container running as a
non-root user cannot write to it. securityContext.fsGroup tells kubelet to chown and setgid the whole
volume tree to that GID before the container starts. fsGroupChangePolicy then decides whether kubelet
walks the entire tree on every start (Always, the default) or checks only the top-level directory and
skips the walk when it already matches (OnRootMismatch), which is what keeps a volume of millions of
files from adding minutes to every Pod start.

LAYOUT  One spine, nothing beside it. Everything sits on a single vertical spine at CONTENT_CX, in
storage stack grammar:
  Pod app-0   (App + securityContext as its two inner rows)
  kubelet
  volume tree (a real directory listing, three rows, each showing its owner)
  PV-app      (the disk the tree lives on)
WHY NOT put the disk and the tree SIDE BY SIDE on a shelf: that one choice causes most of what is
wrong with the card. A shelf pushes the tree centre 95 units right of the spine, so the chown lane
cannot land on the middle of the thing it is chowning, the write lane has to come down as a third
off-centre line, and the disk is joined to the tree by a horizontal stub that carries no traffic.
Stacking them puts every arrow back on the block it points at and makes the card symmetric about 600.
securityContext is an inner row of the Pod rather than a box under it, which is both truer (it is a
field OF the Pod, not a peer of it) and what buys back the vertical room the listing needs.

PANEL  Worst right / bottom across all 7 steps, by viewport:
  1920x1080 -> 203 / 146    1440x900 -> 319 / 183    1280x800 -> 358 / 213
  1100x800  -> 397 / 205     900x650 -> 398 / 375
So the reserved rectangle is x<=398 AND y<=375. The narrowest block on the spine is the Pod at 226
wide, left edge 487, and the widest is the tree at 340, left edge 430. Both clear 398, so the x
condition alone keeps every block out of the panel at any height and the stack is free to be centred
vertically. A longer narration invalidates these.
```

### before `const POD_W = 226, POD_H = 126;          // the storage-category Pod standard (storage-csi-attach-mount)`

```
Tier heights and the gaps between them are declared once, summed, and the leftover space split evenly
above and below, so the whole card centres by moving a single number. Nothing here is a hand-typed y.
```

### before `const IN_INSET = 16, IN_W = POD_W - IN_INSET * 2, IN_H = 42;   // 194 wide`

```
The container and the securityContext share the Pod's inset, so their edges line up and read as two
fields of one object. The pod primitive puts its own label baseline at y+16, so the first row starts
at 26 to clear it. The Pod carries no sublabel of its own: runAsUser belongs to the container row,
which is the thing actually running as that user.
```

### before `const ROW_COUNT = 3, ROW_H = 24, ROW_GAP = 10, ROW_PAD = 16;`

```
The volume tree, drawn as a directory listing. Three rows, each carrying a name on the left and its
owner on the right. This is the load-bearing element of the card.
WHY NOT five blank rectangles with a ball swept across them: the one thing that actually happens
during a chown, the ownership changing, is then nowhere on screen and the sweep reads as decoration.
Row 0 is the TOP-LEVEL DIRECTORY, and that is not cosmetic: OnRootMismatch is defined in terms of
exactly that directory, so having it as a labelled row is what lets the last step show the rule
instead of asserting it. Row 2 stands in for the rest of the tree, which is what makes the 'minutes
per start' claim on the Always step something the reader can see rather than take on trust.

A row is built with valChip, the SAME primitive as the readouts in the strip along the bottom, and
for the same reason: a row is a name with a value against it. It brings the chip fill, the category
stroke and the bright chip text, so the listing matches the strip below it in weight and colour, and
it brings .highlight, which is how a row shows it has been visited.
DO NOT hand-roll rows out of a scheme-box-rect at 3% fill inside a group held at 0.75 opacity: that
combination reads as grey furniture sitting BEHIND the tree rather than as content on it.

BUDGET  The gap between the name column and the owner column is where the walk lane runs, so it is
sized off the longest string on each side:
  name  '... 4.2M more'  13 ch = 89, from local 12  -> ends local 101
  owner 'root:2000 g+s'  13 ch = 89, to local 296   -> starts local 207
The lane sits at local 154, with 53 units of clear space either side.
```

### before `const W_SEC_KUBE = [[CONTENT_CX, POD_BOTTOM], [CONTENT_CX, KUBE_TOP]];`

```
Two lanes reach the tree and they arrive on DIFFERENT EDGES on purpose, so neither has to share an
edge with the other and neither lands off centre. The chown comes down the spine into the TOP edge,
because that is kubelet acting on the volume. The write comes in from the RIGHT edge on its own
bypass, because the container writes to the volume directly and never through kubelet. That bypass is
the one structural fact this diagram can state that the narration cannot, which is why it survives
even though it is the only thing on the card that is not on the spine.
```

### before `const W_PERSIST = [[CONTENT_CX, TREE_BOTTOM], [CONTENT_CX, CYL_Y]];`

```
The chown does not stop at the listing: it lands on the volume, which is the whole reason it survives
a restart and therefore the whole reason OnRootMismatch is allowed to trust it. So the disk is a real
destination, not a backdrop, and the same spine carries the change one tier further down into it.
```

### before `const WALK_SPEED = 0.068, WALK_MIN_MS = 420;`

```
The walk deliberately leaves the PKT_SPEED canon, because a walk is WORK and not transit. Both sweeps
run at the SAME speed and differ only in how far they travel, which is the honest shape of the thing:
OnRootMismatch is not a faster walk, it is a walk that stops after one entry. At WALK_SPEED the full
listing takes about 1470ms and the single-directory check about 470ms, a ratio the eye can compare
directly. WALK_MIN_MS floors the short one so it stays longer than its own fade in and out and reads
as a check rather than as a glitch.
```

### before `const CHIP_W = 300, CHIP_GAP = 16, CHIP_COUNT = 3;`

```
ONE width for all three chips. Measured worst cases, in viewBox units: owner 41 + 'root:2000 g+s' 90
= 131, write 35 + 'allowed' 48 = 107, fsGroupChangePolicy 131 + 'Always (default)' 110 = 265. So 300
clears the worst by 35. This card is the family exception on chip width.
```

### before `function podBlock({ x, y }) {`

```
Family pulse model. Neither inner row is ever given a .highlight, so nothing stays lit after the blink
has decayed.
```

### before `const wires = [W_SEC_KUBE, W_CHOWN, W_WRITE, W_WALK, W_PERSIST]`

```
All five wires carry a ball on some step, which is what earns them an arrowhead.
DO NOT make W_PERSIST a bare markerless line on the reasoning that the disk backing the tree is a
relationship and not traffic. That is what made the disk read as scenery: a chown is not an
abstraction over the volume, it rewrites inodes ON it, so there IS traffic down that line.
```

### before `[cyl, tree].forEach(el => root.appendChild(el));`

```
Family z-order, with the listing rows above the tree face so they sit ON it.
```

### before `function setRows(s, chowned) {`

```
Every step writes EVERY row, so no row can be left displaying an ownership the current step has
already moved past. `chowned` is the whole state, because on this card the tree is only ever entirely
before the chown or entirely after it.
```

### before `function walkRows(s, ctx, { delay = 0, only = ROW_COUNT, chown = false } = {}) {`

```
Sweep the scan down the listing, lighting each row as the ball crosses its centre and, when the step
is the chown itself, flipping that row's owner at the same instant. `only` is how many entries
kubelet actually inspects: the whole listing under Always, exactly one under OnRootMismatch. The ball
is LINEAR, so a row's moment is a pure ratio of distance and needs no easing correction, which is why
this is a segmentPacket and not a routePacket. Returns the arrival time so the caller can chain the
tree light off real geometry.

A row lights by taking .highlight as the ball crosses it and KEEPS it for the rest of the step, so
the listing fills in behind the scan and the finished frame shows exactly how far kubelet got. That
is what makes the last two steps comparable at a glance: three lit rows under Always, one lit row and
two untouched under OnRootMismatch. Rows are readouts, not actors, so this is a static highlight and
never a blink.
```

### before `if (chown) s.refs.rowOwners[i].textContent = OWNER_BEFORE;`

```
A zero-effect timer animation lands the visit exactly on the beat the ball crosses the row, the same
trick lightBoxAt uses. On the chown step the final owner values are already pinned above the reduced
guard, so this only has to stage the before-value and schedule the change.
```

### before `if (ctx.reduced) { s.refs.tree.classList.add('highlight'); return; }`

```
The tree lights only when the write actually gets there.
DO NOT light it above the guard: the destination is then already lit while the ball is still in
flight, which reads as the tree reacting before anything reached it.
```

### before `pulsePod(s.refs.appPod, ctx, 0);`

```
Pod to infra, so up-arrow ordering: the Pod blinks first because it is the actor, and the write leaves
at BEAT.afterPulse down the bypass. The write attempt is literal traffic the step narrates, not
decoration: the process really does issue it and it really does reach the tree. What differs from the
'writes' step is everything around it, so the same lane and the same shape of tag read as a refusal
here and as success there. The disk stays dark, and that is the point: a refused write never reaches
the volume.
```

### before `pulsePod(s.refs.appPod, ctx, 0);`

```
The field being read out belongs to the Pod, and the ball leaves the Pod carrying it, so this is
up-arrow ordering like any other Pod-to-infra hop: the Pod blinks first as the source and the ball
departs at BEAT.afterPulse.
DO NOT fire the ball with no pulse: the one block the packet came out of is then the only inert thing
on the step.
```

### before `const r = routePacket(s, ctx, W_CHOWN, { role: 'storage' });`

```
Three chained hops that read as one continuous movement down the spine: kubelet issues the chown, the
scan carries straight on into the listing, and the change lands on the volume. Every time comes off
arrivalMs and BEAT, never a typed delay.
```

### before `pulsePod(s.refs.appPod, ctx, 0);`

```
The Pod blinks as the writer, then the write leaves at BEAT.afterPulse down the same lane it was
refused on. Unlike the 'denied' step the bytes get through, so the volume lights with the tree: the
two together are what 'the write landed' looks like.
```

### before `s.refs.cyl.classList.add('highlight');`

```
The volume is lit from entry rather than on a ball, because here it is the SOURCE: every entry the
scan re-checks is an inode read off this disk, which is precisely where the cost being narrated comes
from.
```

### before `s.refs.cyl.classList.add('highlight');`

```
Lit from entry, and this is the step where that matters most: the ownership OnRootMismatch trusts is
the ownership sitting on this disk from the last start. Without the volume lit here the rule looks
like kubelet guessing rather than kubelet reading persisted state.
```

### before `const walkEnd = walkRows(s, ctx, { delay: 0, only: 1 });`

```
Only the top-level directory is inspected, and the ball stops beside it. The full-length lane stays
drawn underneath on purpose and the two rows below it stay resting: seeing the scan NOT travel the
listing is the whole point, and it is directly comparable with the step before because both start
from the same place at the same speed. No block flash to close on, this is the last step and it
should come to rest.
```

### poster

```
Ownership of a tree: a non-root Pod cannot touch a row of root-owned files until a sweep re-owns
them, entry by entry. Kubelet reaches one directory listing and it is the TOP row that decides
everything: under OnRootMismatch that row alone is read, and if its ownership already matches,
nothing below it is touched.

So the poster is the listing, and the owner cells step DOWN a gradient, 0.20 / 0.13 / 0.07, rather
than being one bright cell over two identical dim ones. The ramp says the same thing the flat pair
did, that attention belongs at the top, but it reads as a deliberate scale instead of as one odd cell
out. Only the small cells carry the ramp: the three row rectangles behind them stay identical,
because the rows themselves are peers.
Content sits 17..163 in a 180 tall box, symmetric about x=160.
```

### before `walkRows(s, ctx, { chown: true });`

```
walkRows carries its own ctx.reduced branch (light every row it would visit, no packet), and the
three steps that call it must call it from INSIDE the guard body too.
DO NOT call it below the guard only: that branch is then unreachable and the static path shows an
unvisited listing on the one card whose subject is the walk. The guard body calls it for the whole
tree on chown and always, and the top directory alone on onmismatch, which is exactly the picture
that step argues for.
```

---

## storage-generic-ephemeral-volume

### before `const CX = 600;`

```
WHAT  An inline volumeClaimTemplate written directly on the Pod under ephemeral. It gets a real PVC,
a real StorageClass, real dynamic provisioning and a real CSI mount, so unlike emptyDir it can be
large, of a specific class, and even snapshotted. But its lifetime is the Pod: the PVC carries an
ownerReference back to the Pod and is garbage-collected when the Pod dies. This card is the bridge
between the ephemeral world and the persistent machinery, so the identity column is the Pod owning
its PVC owning its PV, and the last gesture is that whole column collapsing when the Pod goes away.

LAYOUT  The identity column runs straight down the canvas centre line (Pod, PVC, PV, all on CX=600)
and the two machinery blocks flank it symmetrically: the StorageClass the claim names on the left,
the provisioner that acts on it on the right, both on the claim row and equidistant from it. Content
spans 112..1088 with the chip strip, margins equal a side.
The identity column is evenly spaced, so the ownership above the claim and the binding below it read
as one rhythm rather than as two different distances:
  36    canvas top margin
  36    Pod                110 tall, to 146
  66    gap, ownerReference link and the mount and GC lanes that flank it
  212   claim row          72 tall, to 284, with the class and the provisioner on the same line
  66    gap, the Bound link and the lower half of those same lanes
  350   the volume         110 tall, to 460
  500   mount caption
  570   chip strip         34 tall, to 604
  36    canvas bottom margin, equal to the top one

PANEL  Measured, panel bottom-right in viewBox units:
  1920x900  right 102  bottom 183      1600x1000 right 291  bottom 143
  1280x900  right 378  bottom 173      1100x900  right 397  bottom 149
  1280x860  right 397  bottom 205      1100x800  right 397  bottom 205
Worst case x<=397 and y<=**205**: the four taller rows are all 900 or 1000, and a shorter window
shrinks the diagram while the HTML panel keeps its pixels. Only the Pod sits inside that y band, and
at 487..713 it clears on x while staying centred on CX. The claim row at y=212 clears the real floor
by **7 units**, so this row must not move up. A longer narration invalidates this.

MOTION  The owner step carries no packet and no Pod pulse, and the canon would allow it the one
sanctioned block blink so it does not read as frozen. It deliberately does not take it: that step
states a fact rather than moves something, and a brightness blink on a block that is only being
pointed at reads as traffic that never arrives. DO NOT add it back.

LANES  ONE axis, on CX itself, and EVERY wire on this card carries an arrowhead. There are no
undirected lines left.
WHY NOT hang the ownerReference, the Bound link and the class reference as static dashed strokes:
that puts three arrow-shaped things on the card that never fire, and forces all the real traffic 12
units off the block centre lines to get around them. Each of those three facts is carried by
something that moves or by text that stays:
  ownerReference  a ball down the column on the step where the claim is created, stamping it, plus
                  the claim sublabel (owned by Pod), the caption beside the column, and the lifetime
                  chip. The same lane carries the cascade on the way out.
  Bound           the claim sublabel flips to Bound and the chip says so.
  the class       the ball out to the provisioner carries storageClassName: fast-ssd, which is the
                  field itself, and the class block lights as it is read.
Four column lanes share the one axis (two up, two down) because no step shows both directions, and
every one of them meets its block on the centre of the face it enters. Each lane goes out behind the
cascade it carries on the closing step, so nothing is left pointing at a ghost.
```

### before `const W_CLAIM_PROV = [[CX + CLAIM_W / 2, ROW_MY], [PROV_CX - SIDE_W / 2, ROW_MY]];`

```
Every endpoint is a block edge MIDPOINT, and all four column lanes run on CX itself, so every
arrowhead lands dead centre on the face it enters. Up and down never appear in the same step, which
is what lets them share the one axis.
```

### before `function podBlock() {`

```
Family pulse model: the wrapping g is not optional.
```

### before `const CHIP_W = 232, CHIP_GAP = 16;`

```
Family chip width. Worst case here is 'backing' + 'mounted at /scratch' at 26 characters, so
26 * 6.89 + 24 of padding is 203 against the 232 available.
```

### before `[podB.group, pvc, sc, prov, pv].forEach(el => root.appendChild(el));`

```
Family z-order.
```

### before `const LANES = ['wClaimProv', 'wCreate', 'wDownHigh', 'wDownLow', 'wUpHigh', 'wUpLow'];`

```
Family setStage, lanes included. The claim defaults to OPACITY.pending rather than to 0: it is the
middle block of a three-block row, and cutting it out leaves a hole in that row rather than an
absence.
```

### before `setStage(s, { lanes: ['wDownHigh'] });`

```
The ownership is a BALL, not a static undirected line hanging under the Pod: the claim is stamped
with its ownerReference at the moment it is created, so the tag rides down and the claim comes up to
full on its arrival.
```

### poster

```
The owned column: a Pod, the claim it owns, and the volume behind that claim, hanging off one dashed
ownership spine and tapering as it goes down, so the two lower tiers read as derived from the Pod
rather than as neighbours of it.

The grammar is the card's own. SOLID stroke means a real object: the whole point of a generic
ephemeral volume is that the claim and the volume are genuine API objects with genuine provisioning
behind them, not a folder on the node, so drawing them dashed says the opposite of the card. DIMMED
means a borrowed lifetime: they exist fully, they just do not outlive the Pod above them. DASHED is
kept for the spine alone, because ownership is a relationship and not traffic, which is also why no
packet sits on that spine: nothing travels down an ownerReference.
The claim carries the brightest fill because it is the pivot the card turns on.
```

---

## storage-hostpath

### note: Kubelet is an accepted off-card actor here too

NOT A DEFECT. The `idle` and `mount` steps name the Kubelet as the subject although this card draws
no Kubelet block. Left as written, under the category-wide ruling recorded on
`storage-ephemeral-storage-eviction`. Do not file these again.

### before `const NODE_X = 180, NODE_Y = 170, NODE_W = 840, NODE_H = 380;   // 180..1020, center 600, bottom 550`

```
WHAT  hostPath. A vertical stack inside one Node boundary, the same skeleton as the emptyDir card
(Node holding a Pod of two containers over a backing cylinder, side-entry L-lanes), because hostPath
is the other node-local volume and the two cards must read as a pair. The whole card is the CONTRAST
with emptyDir: an emptyDir is scratch the kubelet makes FOR the Pod, a hostPath is a raw window onto
a directory that ALREADY LIVES ON THE NODE and belongs to it.

TWO DELIBERATE FAMILY VARIATIONS, both carrying the lesson:
  1. NO OWNERSHIP SPINE. volume-model and emptyDir draw a dim spine from the Pod down to the disk
     because the volume belongs to the Pod. Here the directory belongs to the NODE, so that spine is
     intentionally absent: the Pod and the host directory read as two separate things joined only by
     the mount lanes. The empty gap at x=600 IS the message.
  2. THE reschedule STEP INVERTS emptyDir's dies STEP. emptyDir ghosts the Pod AND its directory
     together (both owned by the Pod). hostPath ghosts ONLY the Pod and its mount lanes while the
     host directory stays lit at full opacity, because the directory is the node's and outlives the
     Pod on that node. That single visual inversion is why hostPath is not persistence.

LAYOUT  Geometry is emptyDir's verbatim so the pair aligns: Node 180..1020, Pod 300..900 centred on
600, the two containers pushed to the Pod edges (centres 425 and 775, outside the cylinder span), the
cylinder 470..730 centred on 600. The panel reaches about (300, 163) here and the Node top at 170
sits flush under it. A longer narration invalidates that measurement.

LANES  Two directed L-lanes, exactly emptyDir's. The app writes DOWN into the cylinder side, the
agent reads UP out of the far side.

MOTION  Highlights are step-static, set above the reduced guard, and the Pod pulse fires in the same
beat.
```

### before `s.refs.hp.classList.add('highlight');`

```
kubelet bind-mounts the existing host directory INTO the containers, so the cylinder AND both
container boxes light as the mount lands, and the Pod pulses in the same beat. All static above the
guard so reduced motion holds the same lit end-state.
```

### before `pulsePod(s.refs.pod, ctx, 0);`

```
The app WRITE leaves the Pod for the cylinder (up-arrow), so the Pod pulses first and the write ball
descends at afterPulse. The agent READ returns the bytes INTO the Pod (down-arrow), so the read ball
leaves the far side first and the Pod pulses AGAIN when it arrives back.
```

### poster

```
Pair to the emptyDir poster, same node + Pod + side-entry L-lanes, but the backing cylinder is SOLID,
not dashed: a hostPath is a raw window onto a real directory that already lives on the node, not
ephemeral scratch. The left container writes INTO it, the right reads OUT.
```

---

## storage-mount-path-chain

### before `const LEFT_X = 400;`

```
WHAT  Where the bytes land. The literal mount chain on ONE node: the disk on the shelf at the bottom,
the global staging mount above it, the per-Pod bind mounts above that, the Pods on top. The single
attached block device is mounted exactly ONCE at a global staging path, and that one staged
filesystem is then bind-mounted into each Pod private directory, which surfaces as /data in the
container. Two Pods share one staged device through two SEPARATE bind mounts: that fan out is the
whole point. A mount rises (device, staging, bind, Pod), then a write descends that same chain along
the same lines turned around, because it is the same mounts being traversed the other way and not a
second path.

LAYOUT  Every tier (Pods, bind mounts, staging, disk, chip strip) is symmetric about ONE derived
centre, CONTENT_CX.
WHY NOT two centres: the card this replaces had the block stack symmetric about 720 (shoved right to
clear the panel) while the chip strip ran 60..1004 for a centre of 532. Combined bbox 60..1020, so 60
units of margin on the left against 180 on the right, with a dead band down the right edge.
CONTENT_CX = LEFT_X + CONTENT_W/2, and LEFT_X cannot move, so the two-column width is the only lever
on where the diagram sits. It is solved for: 2*COL_W + COL_GAP = 400 puts CONTENT_CX exactly on 600.

PANEL  Worst step, right / bottom by viewport:
  1920x1080 -> 203 / 130    1440x900 -> 319 / 163    1280x800 -> 358 / 189
  1100x800  -> 397 / 205     900x650 -> 398 / 344
So x<=398 and y<=344. LEFT_X 400 has about 2 units of slack and cannot move left at all. The y
reading never has to be cleared on its own, because the x reading already does the work: every block
starts at x=400 or further right, so nothing lands under the panel at any height. That is what lets
the stack be centred vertically for free.

BUDGET  COL_W is floored by the longest string any block carries, and here that is a filesystem path,
because showing the real paths is the point. Measured in viewBox units, scheme-box-sublabel at 5.9
units per character:
  '/pods/uid-a/volumes/vol-1'          147.5   -> the bind boxes, and the binding constraint
  '/plugins/.../csi/vol-1/globalmount' 200.6   -> the staging box, which is 400 wide, so free
  'mount point'                         64.9   -> the container box inside a Pod, 152 wide
COL_W 180 leaves 16 units of air either side of the bind path.
WHY NOT an enclosing node() frame, even though everything lives on one node: a frame needs 16 units
of padding per side, which drags COL_W down to 164 and forces the bind path to be abbreviated. The
narration says "on the node" for free; the path string cannot be bought back.
```

### before `const CORRIDOR = 60;                                     // the gap between two tiers, uniform`

```
Every corridor between two tiers is 60 units, so every hop is the same length and therefore the same
700ms (routeDur floors short paths at HOP_MS), which keeps the chain reading as one steady walk
rather than a set of unequal jumps.
The stack is CHAINED off one origin rather than carrying five hand-typed tier positions, so the whole
thing can be centred by moving a single number. Typed tier by tier starting at 44 it put the content
at 44..622 in a 640 canvas: 44 units of air above against 18 below, so the diagram sat visibly low
and the chip strip nearly touched the bottom edge. STACK_TOP is solved for, and every tier follows.
```

### before `const LBL_POD_Y = POD_BOTTOM + 36;                       // 183, corridor 147..207`

```
Corridor captions sit at the vertical middle of their corridor. The disk caption goes UNDER the
cylinder, in the 32 units between the disk and the chip strip, the same slot storage-volume-mode uses
for its disk labels.
```

### before `const CHIP_W = 232, CHIP_GAP = 16, CHIP_COUNT = 4;`

```
Family chip width. Worst cases, in viewBox units at 6.88 per character:
  bind mounts   75.7 + 'Pod A and Pod B' 103.2 = 178.9
  device        41.3 + '/dev/nvme1n1'     82.6 = 123.9
  disk mounted  82.6 + 'not yet'          48.2 = 130.8
  data copies   75.7 + 'none'             27.5 = 103.2
232 clears the worst pair with ~29 units between name and value.
```

### before `const lane = (cx, y1, y2) => [[cx, y1], [cx, y2]];`

```
EVERY corridor runs dead on the centre line of the blocks it connects, and a corridor never shows
more than one arrow at a time. When the write descends, the mount arrow that was there is replaced in
place by an arrow pointing the other way, and the ball rides that. So across the whole card a given
corridor is one single line that happens to point up while the chain is being built and down while
the write is followed, which is both what the reader sees and what actually happens: there is no
second path down, it is the same mount traversed in the other direction.

WHY NOT give each direction its own lane, mount at -12 and write at +12 either side of centre: that
balances only on the final step, the one step where a descent lane is visible at all. On the four
mount steps before it every arrow sits 12 units left of its own block with nothing on the right, so
the whole diagram reads as skewed.
WHY NOT centre only the corridors that never carry a descent: worse, because Pod A and Pod B are
drawn as mirror columns and that leaves one centred and the other not.
The up and down arrays are therefore the SAME two points in reverse order, which is what flips the
arrowhead, and the pair is crossfaded by flipAt() so it reads as a rotation rather than as one line
being swapped for another.

BUDGET  The innermost lanes are the two column centres, 490 and 710, so a corridor caption centred on
CONTENT_CX has 110 units of clear space either side. Holding 8 units off the nearest lane gives a
caption half-width of 102, and at 6.88 units per character that is a ceiling of 29 characters.
Overrun it and the first and last letters sit on a lane.
```

### before `[s.refs.wStgBUp, s.refs.wBPodUp, s.refs.bindB].forEach(el => revealAt(el, ctx, 1));`

```
Fades the element in while leaving the caller free to pin opacity 1 statically above the ctx.reduced
guard. Used for the Pod B column, which is a fact the card introduces partway through rather than
structure it starts with. A corridor changing direction uses flipAt instead.
```

### before `function podBlock({ x, label }) {`

```
Family pulse model. What a Pod must NOT have is a lingering state: no .highlight is ever put on the
container box, here or at step entry.
DO NOT light podABox on arrival and again statically on the write step: that leaves the /data box
outlined long after the ball is gone and makes the blink read as a state change rather than an event.
```

### before `{`

```
Family cylinder-label re-centring: the default for h=88 is 49, and +5 lands it on the middle of the
body.
```

### before `const mk = points => pathArrow({ points, dashed: true, dim: true, role: 'storage' });`

```
Column L and the spine carry the chain from the first step, because that chain IS the diagram and the
reader should see its shape immediately. Pod B is held back and faded in when the card first claims
it: that is a new fact, not standing structure. The three write arrows are built here too but start
hidden, because each one is the reversed twin of a mount arrow already on the canvas and only ever
replaces it, never joins it.
```

### before `[dev, stg, bindA, bindB, podA.group, podB.group].forEach(el => root.appendChild(el));`

```
Family z-order.
```

### before `function setChips(s, { device, mounted, binds, copies }) {`

```
Family setChips. Two of the four never change on purpose: the device is the fixed bottom of the
chain, and 'data copies: none' holding at none from the first step to the last is the claim the whole
card is making.
```

### before `function setStage(s, { podB = 0, binds = 0, descent = 0, podA = 1 }) {`

```
Family setStage. Called from every enter() above the ctx.reduced guard so a prev/reset replay lands
on the right skeleton, and so a mid-step cancel cannot leave a lane stranded at the opacity some
earlier animation was driving it toward.
```

### before `const mount = descent ? '0' : '1';`

```
The three reversible corridors hold ONE arrow at a time: while the chain is being built it points up,
and on the write step the same line points down instead. Mount and write are mutually exclusive
rather than independently toggled, which is the whole point of the pairing.
```

### before `function flipAt(upEl, dnEl, ctx, delay = 0) {`

```
Turn one corridor around in place: its mount arrow fades out and its write arrow fades in over the
same 300ms on the same centre line, so the eye reads one arrow rotating rather than a swap. Called
just before the ball that uses the corridor sets off, so the line always points where the ball is
about to go. Under ctx.reduced it snaps, which keeps the static end-state honest.
```

### before `const p = routePacket(s, ctx, W_A_POD_UP, { role: 'storage' });`

```
Infrastructure reaching a Pod, so down-arrow ordering: the ball flies first and Pod A pulses on its
arrival. Pod A is dim until the volume actually surfaces inside it, so it is driven back to 0.5 and
faded up on arrival, in step with the pulse.
```

### before `if (ctx.reduced) {`

```
The static end-state of this step is the whole chain lit, because by the time the write has finished
the ball has arrived at each of the three blocks in turn. Lighting only the device here would make a
prev/reset replay show a different ending than a forward play.
```

### before `pulsePod(s.refs.podA, ctx, 0);`

```
Pod A is the writer, so up-arrow ordering applies at the top of the chain: the Pod blinks first and
the write leaves at BEAT.afterPulse. Each hop chains off the previous hop's real arrival time rather
than a hard-coded delay, and each corridor turns around just before its ball uses it, so the chain
visibly reverses one link at a time ahead of the write rather than flipping all three at once on step
entry.
```

### poster

```
One staged device, two doorways: a single disk mounts once, then bind-mounts fan to two Pods. Every
link is a straight vertical drop, never a diagonal, and every one of the three is the same 26 units
long: the staging band spans exactly the outer edges of the two bind mounts above it, so each drop
lands on a block centre and the whole thing is symmetric about x=160. The disk link runs edge to
edge, from the top of the cap at 127 to the bottom of the band at 101, rather than disappearing into
the cap. Content sits 15..165 in a 180 tall box, so the margin above and below matches.
```

---

## storage-multi-attach-error

### before `const LEFT_X = 400;`

```
WHAT  The consequence card for storage-access-modes: its ReadWriteOnce step ends with a Pod on the
wrong node getting refused, and this card is the whole life of that refusal. An RWO volume may be
attached to ONE node at a time. The old Pod holds it on node-1 through a VolumeAttachment that says
attached true, a rolling update creates the replacement on node-2 before the old one is gone, the
attach and detach controller cannot write a second attachment for the same volume, and the new Pod
hangs in ContainerCreating with "Multi-Attach error for volume".

SCOPE  node-1 is HEALTHY here from the first frame to the last, and that is the whole boundary
against storage-volume-detach-on-node-loss. Here nothing is uncertain and nothing is broken: the
volume is legitimately held by a Pod that is legitimately still running, and the only reason the new
Pod waits is that its own rollout strategy created it before deleting the old one. It is an ORDERING
problem with an ordering fix (Recreate).
DO NOT re-tell the unreachable-node case, the unreachable-toleration and force-detach clocks, the
roughly six minutes, or the argument about two writers corrupting one filesystem. Those belong to the
detach-on-node-loss card. Told on both cards in nearly the same sentences, the pair reads as one card
shown twice. If a timeout shows up in this file again, it has drifted.

LAYOUT  FOUR tiers, because the story is a chain of four objects and each has to be visible as its
own thing:
  1. two node frames, each holding one Pod                   (the two claimants)
  2. the attach and detach controller, one 300 wide box      (the decider)
  3. the two VolumeAttachment objects, one per node          (what it writes)
  4. the disk on the bottom shelf                            (what is contended)
The card is a MIRRORED PAIR about CONTENT_CX: for every box on the left there is one of identical
size at the identical offset on the right, and the two attach lanes are mirror images, so the only
thing that ever differs between the halves is state, never geometry. That is why the tiers narrow and
widen symmetrically rather than in a straight column: node row 400 wide, controller 300, the
VolumeAttachment fork 592, the contended disk 240. Widest in the middle, narrowest at the decider,
which is the shape of the sentence: one component, two records, one disk.

CONTENT_CX = LEFT_X + CONTENT_W/2 and LEFT_X cannot move, so CONTENT_W is the only lever on where the
diagram sits. CONTENT_W 400 puts CONTENT_CX exactly on 600. That exactness matters because of the
chip strip, which at 976 units is far wider than the diagram above it and is therefore the tier that
sets the visual centre. On 600 it spans 112..1088, so the margins agree at 112.
DO NOT widen CONTENT_W: the strip slides right while every other tier still looks internally
symmetric, which is the failure mode that shipped in the sibling cards.

PANEL  Worst step, right / bottom by viewport:
  1920x1080 -> 203 / 130    1440x900 -> 319 / 163    1280x800 -> 358 / 189
  1100x800  -> 397 / 205     900x650 -> 398 / 344
So x<=398 and y<=344, and it is an L: above y=344 nothing may sit left of 400, below it the full
width is free. The two upper tiers (node row, controller) therefore start at LEFT_X or inside it,
while the VolumeAttachment row at y=359 hangs 96 units further left on each side because it is clear
of the panel's bottom edge.

BUDGET  That headroom is BOUGHT and it is the reason the row can spread at all. The panel grows one
~31 unit line at a time at 900x650. At 383 characters the bottom lands at 406 and buries the left
VolumeAttachment. Everything is held under ~290 characters: eight of the nine steps sit on the 313
line and only `idle` wraps one line further, to 344, which is what sets the number above. So the
clearance over the VA row is 16 units, not 47. It is still positive, but it is ONE line of narration,
and trimming `idle` by a few words is what would buy the margin back. Re-measure after editing
narration, not just after moving geometry, and measure the poster step too: it carries step one's
text and is the step that binds here.

DO NOT put the controller alone in the bottom LEFT corner at x=60 with the nodes and the disk up and
to the right: that leaves a large dead region through the middle and puts content under the panel.
```

### before `const NODE_H = 156, BAND_H = 76, VA_H = 76, DK_H = 86, CHIP_H = 34;`

```
Heights and gaps are declared once, summed, and the leftover space split evenly, so the whole card
centres by moving one number.
WHY NOT type each tier y: the tiers sat 44..628, which left the top looser than the bottom and gave
the node row only 30 units of air above the controller while the three lower tiers were packed at 52.
That reads as a flat, crowded bottom half under a floating top one.
Block sizes follow storage-csi-architecture, which sets the family box at 232 x 76. Both the
controller and the two VolumeAttachments take that 76, and the VolumeAttachments take the 232 exactly.
The controller is the one exception on width and it is forced, not chosen: 'Attach/Detach controller'
renders about 252 units, so a 232 box would clip its own label. It keeps 300, leaving ~24 of air.
```

### before `const POD_W = NODE_W - NODE_PAD * 2;                     // 148`

```
NODE_W is floored by the widest string inside a column, the Pod sublabel 'Multi-Attach error' at
about 113 units: NODE_W 180 leaves ~17 units of air either side. The VolumeAttachment strings no
longer floor it, because those boxes do not live in a node's column any more and set their own width.
```

### before `const APP_DY = 30, APP_H = 44;`

```
The App box inside a Pod, in Pod-local coordinates. pod() draws its own label on the baseline at y=16
and its state sublabel on the baseline at y=h-8, so the free band inside a 102 tall Pod runs 20..84.
APP_H 44 centred in it leaves 10 units under the Pod label and 13 above the sublabel.
DO NOT run it 40..86: the sublabel glyphs start at 87, so 'Running' and 'ContainerCreating' collide
with the box edge on both Pods.
```

### before `const BAND_W = 300;`

```
The controller is 300 wide rather than spanning the node columns at 400, and that is what makes the
fan below possible. Its two output lanes leave its SIDE WALLS at mid-height and step outward before
dropping, so the narrower the controller, the more room those lanes have before they hit the hard
left limit at x=398. At 400 wide the left lane has to start travelling left from x=400 itself and
runs straight under the panel. At 300 it starts at 450 and has 30 units of clear step-out.
```

### before `const VA_W = 232;                                        // storage family box width, from csi-architecture`

```
The VolumeAttachment row is the widest tier in the diagram, deliberately: it is the only place where
the two claimants are separate objects rather than two halves of one band, so the eye should read it
as a fork. At 60 apart directly under their node columns the whole lower half looks vertically
compressed; at 190 apart they hang 65 units outside the node columns on each side.

VA_CX 420 / 780 is a HARD FLOOR on the left, not a preference. Each lane drops vertically from
BAND_MID_Y 265 down to VA_TOP 359, and that whole descent happens above the panel's bottom edge
(measured 344 at 900x650), so the lane must stay right of the panel's right edge at 398. 420 keeps 22
units of clearance. Push the pair further apart and the left lane goes under the panel, which is the
one thing on this tier that cannot be fixed by moving anything else.
The BOXES are free to hang much further out than their lanes, because at VA_TOP 359 they are already
below the panel: at 232 wide the left one spans 304..536, reaching 94 units past the limit that binds
its own lane. That asymmetry between where a lane may go and where a box may go is the whole reason
this tier can be the widest in the diagram.
```

### before `const DK_SIDE_Y = DK_Y + DK_H / 2;                       // 526`

```
Each attach lane drops STRAIGHT DOWN from its VolumeAttachment and makes one 90 degree turn into the
disk's SIDE WALL. The two Ls face each other across the disk, so the pair reads as two claimants
closing on one volume from opposite sides, and the middle of the corridor stays free for the band
caption.
WHY NOT a funnel into the top face: both lanes then share a final vertical segment and land one
arrowhead on one point, which loses the mirrored pair that is the whole shape of the card.
DK_SIDE_Y is the vertical CENTRE of the 86 tall body, so the two lanes enter each side wall dead
centre rather than up in the top third. The arrowheads land at x 480 and 720 while the centred
'PV-web RWO' label sits at x 600, so centring the entry height does not collide with it. The cap
ellipse (483..499) is well clear above.
```

### before `const BAND_LBL_Y = 337;`

```
BUDGET  The band caption sits in the corridor between the controller and the VA row (303..359),
centred on CONTENT_CX so it runs between the two descending lanes at 420 and 780. That leaves 360
units of clear width, and the longest caption here, 'each side waits for the other', measures about
193, so it keeps ~83 units clear of each lane. Overrun 360 and the caption sits on an arrowhead.
```

### before `const CHIP_W = 232;`

```
Family chip width. Worst cases, in viewBox units:
  blocked by   63 + 'force-detach ~6 min'  119 = 206
  new Pod      44 + 'Multi-Attach error'   113 = 181
  accessModes  69 + 'ReadWriteOnce'         82 = 175
  attached to  69 + 'node-1'                38 = 131
232 clears the worst pair with ~26 units between name and value.
```

### before `const NODE_BAND_TURN_Y = (NODE_BOTTOM + BAND_TOP) / 2;             // 199`

```
Five lanes, every one of them carrying a ball in some step, which is why every one is drawn with an
arrowhead. Traffic is NOT mirrored even though the boxes are: only the new Pod ever asks for
anything, so only column B has a request lane. An arrow drawn under the old Pod would be an arrowhead
pointing at a request that is never made.

That request lane starts at the NODE frame, not at the Pod inside it. The attach and detach
controller acts on nodes: what it is asked for is an attachment to node-2, and the Pod is only the
reason the ask exists. Starting the lane at the Pod draws the Pod talking to the controller directly,
which is not what happens and reads as one box overlapping another.

The controller's two output lanes leave its SIDE WALLS at exactly mid-height (BAND_MID_Y), step
outward, and drop into the TOP EDGE of their VolumeAttachment at exactly its centre, so every
endpoint is a face midpoint and the pair cannot drift out of symmetry when the controller or the row
is resized.
DO NOT drop them straight out of the controller's underside at x 420 and 780: that reads as two lines
threaded through a slab instead of as two outputs of one component.
The request lane leaves node-2 at its own column centre (710) and steps IN to enter the controller at
the top face centre (600). A bare vertical at 710 meets the controller 40 units short of its centre
and reads as a line stopping on a random point of an edge rather than as an arrival.
```

### before `function podBlock({ x, label, sublabel }) {`

```
Family pulse model. No .highlight is ever put on the container box, so a Pod never keeps a lit
outline after its blink decays.
```

### before `const nodeA = node({ x: NODE_A_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });`

```
node() places its caption in GROUP-LOCAL coordinates (x 12, y 18 inside its own translate). Use the
primitive.
DO NOT append a caption with an ABSOLUTE x into the translated group: it is displaced by the
translate a second time and node-2 lands at x=1614, outside the 1200 wide viewBox and clipped away.
```

### before `[nodeA, nodeB].forEach(n => {`

```
node() drops its caption at local y=18, which on a frame this tall reads as floating inside the box
rather than as titling it. 14 tucks it up against the top edge. Placement only: the uppercase
rendering is catalog-wide styling and is left alone.
```

### before `[nodeA, nodeB, ctrl, vaA, vaB, disk, podOld.group, podNew.group].forEach(el => root.appendChild(el));`

```
Family z-order, with the Pods above their node frame.
```

### before `function setChips(s, { mode = 'ReadWriteOnce', attached, newPod, blocked }) {`

```
Family setChips. Each name means exactly one thing: 'attached to' is where the disk is right now,
never where it is wanted, and 'blocked by' is the reason the new Pod cannot start, never the Pod
state itself.
```

### before `function setStage(s, {`

```
Family setStage, pinning every mutable opacity and every mutable sublabel.

The new Pod has NO dim 'booting' state. A Pod that exists is drawn at full strength and blinks with
the ordinary pulsePod.
DO NOT sit it at 0.55 from scheduling until the last step and pulse it through pulsePodDim: that
stacks an opacity swing on top of the standard blink and reads as a faster, busier pulse than the
same beat elsewhere in the catalog, even though the timing is the identical 900ms.
The only opacity a Pod carries here is the terminated shade, for the old one after it is deleted,
which is the one fade the catalog does sanction.
```

### before `function unlightAt(el, ctx, delay = 0) {`

```
Drop a highlight at `delay`, used on blocks that fade out mid-step. A block on its way to 0.25 must
not still be wearing a lit border when it gets there: the highlight says 'this is the thing acting
right now', and a deleted object is the opposite of that. Pairs with the fade so the two land
together.
```

### before `setChips(s, { attached: 'node-1', newPod: 'not scheduled', blocked: 'nothing' });`

```
node-2 is absent, not empty. An empty frame sitting there from the first frame says the second node
is already part of the picture and merely unused, which is the opposite of the setup: at this point
there is one node, one Pod, one attachment, and no contention at all.
```

### before `narration: 'Now the Pod moves. A rolling update stands the replacement up on Node-2 while the old one is still running, which is exactly what RollingUpdate is designed to do. Node-1 stays healthy throughout. A second Pod now exists on the other Node, and it wants the same volume.',`

```
The OLD Pod deliberately stays at full opacity here and through step 4: the entire problem is that
the old side is still very much alive and still holding the attachment. Fading it early says the
opposite.
```

### before `setStage(s, { nodeBOp: 1, newOp: 1 });`

```
The request lane stays OFF here. On this step node-2 has only just been given a Pod and has asked for
nothing yet, so an arrow from it into the controller would draw a request one full step before it is
made. It arrives on the next step together with the ball that rides it, which is the catalog rule: a
lane appears when it first carries traffic.
```

### before `narration: 'The attach and detach controller tries to attach the volume to Node-2, which means writing a second VolumeAttachment.`

```
THE REFUSAL, and the reason this card exists. The idiom, shared with storage-access-modes, is a ball
that travels to the deciding block and STOPS there. Nothing continues past the controller, va-2 never
lights, and no lane is drawn under va-2 at all: the object is wanted, not wired up. A ball carrying
on to va-2 would show the attach succeeding.

CONTENT  va-2 appears at OPACITY.pending and stays there until the attach step really writes it.
DO NOT fade it in AT FULL STRENGTH as the refused request lands: that says the object was created and
then blocked. It is not. The controller checks that a ReadWriteOnce volume is already attached
elsewhere and reports the Multi-Attach error BEFORE writing anything, so through the whole blocked
stretch there is no va-2 in the API at all. The sublabel says `wanted, not written` for the same
reason, and the narration does not stop at "a second cannot be satisfied", which was true but left
the reader to assume an object had been made.
```

### before `narration: 'What clears it is the old attachment going away, and nothing else will. The controller will not de`

```
Nothing moves on this step, deliberately: the subject is a deadlock in which neither side does
anything at all. The state is carried by the lit va-1, its sublabel and the blocked-by chip.
DO NOT use the sanctioned packet-less block flash on va-1: a blinking attachment reads as activity
and this is the one step whose whole content is that there is none.
SCOPE  This step is the circular wait, not the roughly six minute force-detach for an unreachable
node. That is the subject of the detach-on-node-loss card. What blocks a HEALTHY rollout is the
circular wait, and that belongs to this card alone.
```

### before `setChips(s, { attached: 'node-1', newPod: 'Multi-Attach error', blocked: 'old Pod running' });`

```
BUDGET  'old Pod running' rather than 'old Pod still running': the chip budget is name + value + 24
inside CHIP_W 232, and the longer string measures about 131 units against a 69 unit name, which
leaves 8 units between the two halves and reads as one run-on field.
```

### before `s.refs.ctrl.classList.add('highlight');`

```
The controller self-initiates, with no preceding pulse or hop, so it is lit from step entry and the
first ball leaves after BEAT.lead: a ball must never depart from an unlit block, or it reads as
coming from nowhere. It keeps that highlight to the end of the step, because unlike va-1 it does not
go anywhere.
```

### before `if (ctx.reduced) { s.refs.disk.classList.add('highlight'); return; }`

```
The disk is a RECEIVER on this step, so it must not be lit at entry. Lighting it above the guard puts
its border on from the first frame, and the detach ball then spends its whole flight travelling
towards a block that already looks reached. Only the reduced path lights it statically, because that
path has no ball to arrive: in the animated path lightBoxAt turns it on at det.arrivalMs. Same rule
as storage-volumeattachment.
```

### before `s.refs.vaA.style.opacity = '1';`

```
va-1 lights when the delete reaches it, so it is lit as the detach departs from it in turn, and gives
the highlight up once it has finished fading: a deleted object must not be left wearing the border
that means 'acting right now'.
```

### before `if (ctx.reduced) { s.refs.vaB.classList.add('highlight'); s.refs.disk.classList.add('highlight'); return; }`

```
va-2 and the disk are both RECEIVERS here, in that order, so neither may be lit at step entry: the
write has to reach va-2 before it lights, and the attach has to reach the disk before it does.
Statically lit only on the reduced path, which has no balls to wait for.
```

### before `pulsePod(s.refs.podNew, ctx, att.arrivalMs + BEAT.afterHop);`

```
The kubelet mount is not drawn as a hop: it is the subject of the CSI cards, and a lane from the
centred disk back up into the right-hand column would cut across the VA row and the controller. What
the reader needs here is the consequence, so the Pod blinks one beat after the attach lands.
```

### before `narration: 'This is why a Deployment on ReadWriteOnce storage stalls whenever the replacement Pod lands on another Node. RollingUpdate creates the new Pod before deleting the old one, so both want one single-node volume and the new one is refused. Set it to Recreate, which deletes the old Pod before making the new one, the way a StatefulSet handles an ordinal.',`

```
The closing step, so it deliberately comes to rest: no packet, no pulse, and no block flash either.
The usual argument for flashing something on a packet-less step does not apply to the LAST step,
which the reader is meant to sit and read.
```

### poster

```
The disk locked inside a closed circuit of waiting. The card's real subject is not that a node died,
it is that nothing is broken at all: the controller will not delete the attachment while the old Pod
runs, and the rollout will not delete that Pod until the new one is ready, which it cannot be without
the disk. That is a CYCLE, and a cycle is a shape, so the poster draws it literally: a continuous
dashed track with the volume sitting inside it, unable to leave.

WHY NOT one solid claim against one dashed one: it is the same picture as half the catalog, it says
only 'one is denied', and it puts the emphasis on a rejection when the interesting part is that both
claimants are legitimate and alive. So the two blocks on the ring are IDENTICAL, at equal weight,
because neither of them is the problem.
WHY NOT a break in the track: an opening promises a way out, and the whole point is that there is not
one until something outside the loop (Recreate) cuts it.

The loop is two ARCS BETWEEN the blocks, not one continuous track with the blocks laid over it. That
failed in a way only a render shows: a rounded rect passing behind a translucent box still shows its
dashes straight through the fill, so the line reads as crossing the block rather than as arriving at
it. Arcs that START and END on the block edges make the two blocks stations ON the cycle, and the
circuit closes through them: block, arc, block, arc, back again.

The two chevrons are what turn a pair of arcs into a circuit. Top points right, bottom points left,
which resolves to clockwise and gives the eye a direction to travel and never finish. They sit at the
arc apexes, the two points furthest from everything else on the canvas.

Both arcs RUN TO THE CENTRE of each block, (60, 90) and (260, 90), and the track is MASKED by the two
block rectangles so the part inside a block is not drawn. That is the trick, and it cannot be done
with z-order: the blocks are filled translucent white over the poster background, so a dashed line
painted underneath still shows through. A mask removes those spans outright. The visible arc leaves
each block through its TOP edge at x=64, four units off the block centre, and the bottom arc through
the bottom edge at the same x, so the line meets the middle of the block and disappears under it.
Geometry: one ellipse, rx 100, ry 59, centred on (160, 90), so the two apexes land on 31 and 149 and
the chevrons sit on them without moving.

The disk carries 0.04, the fill the rest of the storage posters give a cylinder body (0.03 to 0.04).
At 0.14 it reads as a different material from every sibling poster in the grid. Content sits 25..155
in a 180 tall box, symmetric about x=160 and about y=90.
```

---

## storage-projected-volume

### before `const POD_X = 330, POD_Y = 56, POD_W = 640, POD_H = 120;  // 330..970, over the projected directory`

```
WHAT  Projected volumes: one directory assembled from several sources at once. TWO ALIGNED COLUMNS,
the four sources on the left and the projected directory with one file row per source on the right,
and EVERY source mid-height equals its file row mid-height, so all four fan-in lanes are pure
horizontal segments. The gesture is a FAN-IN: four parallel lanes converge on the one dir.

CONTENT  The card leads to the serviceAccountToken source, the one that matters. Unlike the old
forever-valid Secret-based token, a projected token is short-lived and audience-bound, and kubelet
ROTATES it in place before it expires, rewriting the same file with a fresh token and no restart.
The rotation is the beat the card builds to.

LAYOUT  The Pod sits over the DIRECTORY column only, and the sources are cluster objects, so their
column sits out from under it at 230..450. Content spans 230..970, centred on the canvas.
WHY NOT run the Pod flush over both columns: the source column then sits under it as though the
ConfigMap and the Secret lived inside the Pod, and it drags the drawing into 330..970 (centre 650)
with the lower left third of the canvas empty.

LANES  The four source lanes run horizontally on shared mid-heights, zero corners. The two Pod lanes
each turn ONCE: the metadata drop leaves the Pod floor 100 left of its centre, steps out to the
source column in the corridor at y=232 and drops into downwardAPI (which sits FIRST in the column
exactly so that drop crosses nothing), and the app read leaves the dir top, steps in at y=200 and
rises into the Pod floor 100 right of its centre.
The pair either side of the Pod centre is the point: a 640 wide face with one lane out at 440 and
another at 800 reads as two lanes that missed, and both were reported as such. 100 is also inside the
18 percent of the face that the rule treats as still on the midpoint, so the pair is legible as a
pair rather than as a tolerance.

MOTION  Only the Pod pulses: it is the source of downwardAPI metadata and the reader of the token.

PANEL  This card's panel bottoms out at y=181 (measured over 1600/1280/1100). The Pod at y=56 is the
only tier inside that band and starts at x=330, and the source column below it starts at y=264, well
clear. The metadata corridor at y=232 is what those 181 units pin: it cannot rise. A longer narration
invalidates this.
```

### note: the projected dir is an enclosure, not a receiver

```
NOT A DEFECT, and it stays open in the tool on purpose. `check-arrival --rules=r3` reports the
projected directory block as lit at step entry while four balls land inside it at 700ms. The finding
is correct about the facts and wrong about the defect: the block is not the receiver, it is the
CONTAINER the four file rows sit in, and each ROW lights on its own ball arriving, which is the
arrival the reader is meant to see. Dimming the enclosing frame until the first ball lands would draw
a directory that does not exist yet on the step whose whole subject is four sources feeding one
directory that does.

The rule cannot tell an enclosure from a destination, and a card-level exception list would hide the
real ones, so the finding is left reported. The downward step on this same card WAS a real finding
and was fixed: there downwardAPI is a genuine mid-chain receiver.
```

### before `const W_DOWN = [[SRC_RIGHT, midOf(DOWN_Y)], [ROW_X, midOf(DOWN_Y)]];`

```
The four source lanes fan into the file rows on shared mid-heights as single straight segments, and
the two Pod lanes turn once each: the Pod drops its own metadata into downwardAPI, and the app reads
a file back out of the dir.
```

### poster

```
The essence, not the layout: four scattered sources converge fan-wise on ONE mount point at the
folder edge, inside it the keys sit as even file lines, and the token thread (bottom source, its
lane, its file line) burns brighter than the rest.
```

---

## storage-pv-lifecycle-phases

### before `const PITCH = 224;`

```
WHAT  The one genuine state machine in the storage family. The middle band is a ROW of the four
phases a PV status field can hold, with exactly one lit at a time. The row is the BOARD, not the
object: the phases are places, and the volume is whichever place is currently lit. That distinction
is what lets the card show the Delete outcome honestly, because a deleted PV does not move to some
final phase, it leaves the board and every box goes dark.

CONTENT  Four phases, not five. k8s.io/api/core/v1 also defines VolumePending ("used for
PersistentVolumes that are not available"), so the API type has five constants, but the upstream
Phase docs list only Available, Bound, Released and Failed, and Pending is not something a PV is
observed sitting in on a modern cluster. The card teaches the documented four and the narration says
the lifecycle runs through them, never that the status field can hold only these.
DO NOT "complete" the row with a fifth box.
CONTENT  Reclaim policy defaults are per-origin and the narration says so explicitly: Delete is the
default for dynamically provisioned volumes, Retain for a PV created by hand. Calling Delete "the
default" flat out is only half true.

SCOPE  Deliberately NOT drawn: the backing disk. Every other storage card puts a cylinder on a bottom
shelf, and this one does not, because its subject is the phase field of the API object rather than
the bytes behind it. What happens to the real storage asset under each reclaim policy is the whole
subject of storage-reclaim-policy, which draws the disks properly and in both branches. A cylinder
here would either duplicate that card or need a spine that the backward edge below the row would have
to cross.

MOTION  Actors that DRIVE transitions sit above the row, and the one actor that drives the single
backward edge sits below it. Each transition is a real event, so it is drawn as a lane that CARRIES a
ball when it fires. There is no Pod anywhere, so nothing pulses: boxes light, and the one packet-less
step is allowed a box flash.
Two rules govern that light:
  1. A box is lit at step entry ONLY if a ball departs from it. Every box a ball arrives at starts
     the step looking ordinary and earns its highlight at the moment of arrival (lightBoxAt at
     pkt.arrivalMs), with no pulse. Once lit, nothing goes dark again until the step boundary, so by
     the end of a transition both of its ends are lit. Pre-lighting a destination is the single
     easiest way to ruin one of these steps: it answers the question before the ball that carries the
     answer has arrived, and the arrival then registers as nothing at all.
  2. Chips light on the step their value CHANGES, which is how the reader sees the phase field flip
     rather than having to remember what it said one step ago.

LAYOUT  The row is centred on the CANVAS at 600 and every other x is derived from it. One pitch
governs the card: PITCH 224, the phase box width 164 plus the 60 unit gap each forward transition
lane lives in. Four phases at that pitch put their centres at 264 / 488 / 712 / 936, so the row spans
182..1018 and its midpoint is exactly 600.
The two top actors reuse that grid: the claim sits at 488, dead above Bound, which is the phase it
puts the volume into, and the PV controller sits at 712, dead above Released, the only phase it ever
acts on. So the controller lane is a straight vertical drop with no dog-leg. Their band spans
400..800, centred on 600, so the pair reads as concentric with the wider row beneath it.
```

### before `const ACT_Y = 60, ACT_H = 68, ACT_BOTTOM = ACT_Y + ACT_H;      // 60 / 128`

```
PANEL  A centred four-phase row cannot dodge the panel horizontally, because staying centred on 600
is the whole point and its leftmost box lands at x=182, deep inside the panel column. So the ROW
dodges it VERTICALLY, sitting below the panel entirely.
WHY NOT keep the row up at y=250 inside the panel band and pay for it horizontally: all four boxes
then shove right to x>=420, which puts the row centre at 780 against a canvas centre of 600 and
leaves a 420 unit left margin against a 60 unit right one. Dropping the row under the panel buys back
the full width and costs only vertical room, which this card has to spare because it carries no disk
shelf.

MEASURED, not assumed. This card's own panel was measured across viewport widths 1920 down to 900:
right edge peaks at 399 and bottom peaks at 201, both at the narrow end. Two things follow:
  - The right edge is driven by the VIEWPORT, not by the text, so 399 at 900px is a property of every
    card in the catalog and is already past the 380 the blanket rule quotes. The house value of
    x>=400 for top-band content does clear it, but by a single unit, so nothing here is placed left
    of 400 above y=201.
  - The bottom IS driven by the text, so 201 is this card's own number. Lengthening any narration
    invalidates it and the stack has to be re-measured.
So the card splits the difference. The actors live in the top band and are held to x>=400. Everything
that has to reach left of 400, which is the phase row itself (leftmost box at x=182) and the dog-leg
that feeds it, is kept BELOW y=201, where the panel cannot reach at any width.
Both the bind dog-leg and the backward arc turn in ONE corridor between the actor band and the row,
at TRANSIT_Y, the exact midpoint of the gap it crosses ((128 + 300) / 2 = 214), so the horizontal run
sits centred in its band rather than hugging the row beneath it. It also has to clear the panel
bottom of 201, because both runs reach left to x=264, and 214 does that by 13. Those two constraints
very nearly collide, which is what sets the height of everything above: the actor band cannot go
lower and the row cannot go higher without pushing the corridor into the panel.
```

### before `const W_RECOVER = [[RELEASED_CX, ROW_Y], [RELEASED_CX, TRANSIT_Y], [AVAIL_CX, TRANSIT_Y], [AVAIL_CX, ROW_Y]];`

```
The one backward edge, and it runs OVER the row rather than under it: out of the top centre of
Released, back along the corridor, and down into the top centre of Available.
WHY NOT loop underneath: it lands in the same band as the admin lane, and the two then arrive at the
underside of the row pointing the same way, so the pair reads as one broken fork instead of as two
unrelated events. Above the row it has the corridor to itself.
It leaves from exactly the same x as the controller lane arrives on (RELEASED_CX), which is only safe
because the two are never on stage together: the arc is pinned visible on the recover step alone, and
that step hides the controller. Same story for its descent into Available at x=264, which the bind
dog-leg also uses one step earlier.
```

### before `// Fades an object out of existence when the delete that removes it lands, and takes its lit stroke`

```
There is deliberately no unlightAt here. A box NEVER gives up its highlight part way through a step.
WHY NOT have the source phase go dark the instant the destination lights, on the theory that a state
machine should show exactly one live state: it reads as a bug every time, because the eye is
following the ball, so a box dimming behind it looks like something being switched off rather than
like a phase being left. Both ends of a transition stay lit, and it is the ball and the arrowhead
that carry the direction of travel. A phase only goes dark at a step boundary, when clearHL wipes the
board.
```

### before `// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.`

```
No flashBox helper here, unlike its sibling cards. The sanctioned block blink exists so a step with
no packet and no Pod does not read frozen, and this card has no such step: idle is the static poster,
and all six narrated steps carry at least one ball.
```

### before `const lBind = lane(W_BIND);`

```
Everything else appears only on the step that uses it, so the card is never crossed by a lane
belonging to somebody who is not on stage. The backward arc is in this group rather than drawn
permanently because it shares the corridor above the row with the bind dog-leg and shares its exit x
with the controller lane.
```

### before `const verdictLbl = text({ class: 'scheme-label code dim', x: RELEASED_CX, y: WIRE_LBL_Y, 'text-anchor': 'middl`

```
The verdict reports an outcome that moves the volume nowhere, which is exactly the case the row lanes
cannot express: a successful Delete and a Retain that declines to act. No step ever fills it at the
same time as a neighbouring gap label.
It centres on Released, which it can do because the backward arc runs over the row instead of under
it. While the arc was below, this label had to dodge the point where it dropped out of the box, which
cost it half its usable width.
```

### before `const recoverLbl = text({ class: 'scheme-label code dim', x: (AVAIL_CX + RELEASED_CX) / 2, y: RECOVER_LBL_Y, '`

```
The backward edge gets its own name, centred under its own horizontal run rather than borrowed from a
forward gap.
DO NOT park it in the Available-to-Bound gap: that puts the caption for a right-to-left event on the
one lane that runs left to right.
```

### before `s.refs.stAvail.classList.remove('highlight');`

```
Only the claim is lit from the start, because only the claim sends a ball. The two phases are both
destinations here and each waits for its own arrival: Available for the claimRef write landing on it,
Bound for the phase flip that follows.
```

### before `setStage(s, { pvc: 0, ctrl: 0, admin: 0, bindLane: 0, reclaimLane: 0, adminLane: 0, recoverLane: 0 });`

```
The claim is deleted on this step, so it ends at zero rather than as a ghost.
DO NOT settle it at a dim 0.45 and leave it on the canvas for the rest of the card: it then reads as
an object that is still somehow around and pulls the eye away from the row.
```

### before `s.refs.stReleased.classList.add('highlight');`

```
Released stays lit for the whole step: it is the phase the volume is in when the call runs, and it is
where the ball is heading.
DO NOT have it go dark on arrival to say "the object left the machine": a box dimming under an
incoming ball reads as the ball breaking something. The disappearance is carried by the three chips
and the verdict line instead, none of which can be mistaken for a lighting bug.
```

### poster

```
Abstract, not the literal diagram: the machine drawn as a RING that does not close by itself.
Available, Bound and Released sit on the cycle. The two forward edges are solid because the control
plane walks them unasked, and the closing edge back up to Available is dashed because that is the one
hop nothing performs on its own. The point is that the eye completes the ring and the drawing does
not, so the dashed quarter reads as a gap in a circle rather than as one more arrow.
WHY NOT the diagram in miniature, four cells in a row with a back-arc: it says state machine but not
what is interesting about this one.

Failed is deliberately NOT here, though it is a real phase and the card teaches it. It only ever
fitted as a faint satellite hung outside the ring, and that cost more than it paid: it was the one
thing keeping the composition off-centre, since a dim shape on one side pads the bounding box without
carrying any visual weight, so the geometry read as centred while the picture read as shifted.
Dropping it makes the ring symmetric about x=160 by construction and lets it grow into the freed
space. The poster is a hook, not an index, and the dialog covers Failed properly.

TWO dots, and the difference between them is the whole idea. The filled one rides the first solid
edge, a hop the control plane is making right now. The hollow one sits on the dashed edge, a hop that
is possible and is not happening, because nothing takes it without a person. The dashed edge is drawn
as TWO arc segments with a gap where that hollow dot sits: run as one path it passes straight through
the dot and renders it as a struck-out circle, and sitting the dot in a break reads better anyway.

The nodes are concentric cells rather than plain circles: at poster scale three empty outlines go
thin and washed out, and a core gives each one weight without adding a shape the reader has to
decode. Available carries the heavier stroke and the brighter fill because it is where the volume is
at rest.
Geometry: ring centred on (160, 99) with R=62 and r=18 nodes, and the three node angles at -90, 30
and 150 make it symmetric about x=160 by construction. The 99 is not a typo for 90: the top node
sticks a full node radius above the ring while the bottom of the ring is bare arc, so the circle has
to sit low for the drawn bounding box to land on the canvas centre. It measures out at 87.3 units of
margin on both sides and a vertical centre of 89.9 against 90.
```

---

## storage-pvc-binding

### before `const CX = 600;                                     // canvas + identity-spine center`

```
WHAT  A claim, three candidate volumes, and the controller that matches them. A CENTRED vertical
spine: the identity column Pod -> PVC -> PV-x73a shares one line down the canvas centre (CX=600),
because binding is what fuses those three into one chain.

LANES  The spine is a SINGLE dead-centre lane, the mount ascent, drawn with arrowheads (the volume
rising PV -> PVC -> Pod). It is the only vertical the tops of the Pod and the centre cylinder touch.
DO NOT add headless relationship lines beside it: the centre then reads as a crowded pair rather than
as one clean arrowed axis.
The disk shelf holds three PVs spread SYMMETRICALLY around the spine. The binding controller sits at
the right, its vertical centre aligned with the PVC so the watch and the bind write are STRAIGHT
horizontal hops, no zigzag.
Crucially the controller scans the shelf FROM BELOW: the probe EXITS the controller from its right
side (centred), wraps down its outer edge (clear of PV-b22), runs a bus under the whole shelf, and
rises into each cylinder BOTTOM with a generous gap before the turn. That keeps every probe off the
cylinder tops. The second claim of the exclusive step sits above the controller, denied by a short
straight hop up.

PANEL  The panel owns the top-left band and every block clears it.
```

### before `const W_PVC_TO_CTRL = [[PVC_RIGHT, PVC_MID - LANE], [CTRL_LEFT, PVC_MID - LANE]];   // watch, straight`

```
Every endpoint sits on a block edge, so a ball never travels underneath a box. The watch and the bind
write are single straight horizontal hops off the PVC. The scan EXITS the controller's right side
(centred), turns down its outer edge, turns left along the bus, then rises into each cylinder.
```

### before `function diskBlock(cx, w, label, spec) {`

```
A disk is a cylinder plus its spec line, wrapped in a g so dimming a rejected volume fades the spec
WITH it (the name already rides inside the cylinder). The cylinder is returned separately because
.highlight must sit on the .scheme-cylinder element itself, not on the wrapper.
```

### before `const pvA = diskBlock(SMALL_CX, 200, 'PV-a01', '2Gi, RWO, local-ssd');`

```
Each disk states all THREE things the claim is matched on (capacity, access mode, class), so a viewer
can verify the verdict the match step narrates instead of taking it on trust. Access mode is
identical on all three on purpose: the two rejections must turn on size and class only.
```

### before `[ctrl, pvc, pvcB, appPod.group, pvSmall, pvMatch, pvSlow].forEach(el => root.appendChild(el));`

```
Family z-order, with the wires and their labels ABOVE the blocks so a connector that crosses a block
stays visible and the text stays legible, and the static disk specs above those.
```

### before `function clearHL(s) {`

```
appBox is listed so its .highlight is cleared every step.
DO NOT leave it out: a highlight set during a reduced replay leaks forward, because replay never runs
the motion path that would re-clear it. The disk opacities and the two late-appearing elements are
reset here for the same reason.
```

### before `narration: 'A PersistentVolumeClaim is a request, not storage. It states only what the workload needs: at leas`

```
Deliberately motionless, and it must STAY that way. The claim is a statement of need, nothing acts in
this step: the Pod does not pulse (it is the subject being blocked, not an actor) and the PVC takes a
static .highlight only. A block flash would be canon-legal here (packet-less and Pod-less) and is
wrong: it reads as the PVC doing something when it is not.
```

### before `const toSmall = routePacket(s, ctx, W_SCAN_SMALL, { role: 'storage' });`

```
All three probes leave the controller TOGETHER: the scan is one sweep of the shelf, not a queue, and
the simultaneous fan-out is the whole read of this step. They land at their own pace (1222 / 1933 /
2600 ms for slow / match / small) because routeDur normalizes speed and the routes are very different
lengths.
DO NOT stagger them to make the verdicts resolve in narration order: that turns one sweep into three
separate errands.
```

### note (anchor dropped: `s.refs.appPod.style.opacity = '0.5';` is not unique in the file)

```
The Pod stays dim until the volume actually reaches it, so the motion path re-dims it and the
animation carries it back to the 1 pinned above. Without the re-dim the Pod sits at full opacity and
then snaps BACK to 0.5 the instant the animation becomes active.
```

### poster

```
Abstract, not the literal diagram. The whole point of binding is that it is TWO-WAY and it is
EXCLUSIVE, so both are drawn: the claim document and the one disk that fits are joined by a pair of
opposed lanes (volumeName going down, claimRef coming back up), and a dashed capsule closes around
just those two, sealing them off as a pair. The two disks that lost sit outside the capsule, dim and
unconnected.
The two rejected disks are deliberately IDENTICAL in size: making them differ reads as an accidental
mismatch rather than as meaningful, and the eye should be spending its attention on the pair inside
the capsule. All three disks share one baseline (y=146) and near-identical tops, so the centre one
stands out by width and fill, not by height.
```

### before `setVal(s.refs.bindChip, 'none');`

```
The `binding` chip turns over on the probe arrival, not at t=0. It named `candidate PV-x73a` from the
first frame, between 1.4 and 2.8s before the sweep that decides it had run, on the one card whose
whole subject is that the decision is made by scanning. The three wire verdicts already turn over on
their own probe arrivals.
Rolled back to `none` below the guard and written inside the same `at(...)` that lights the winning
cylinder and writes its wire. `setVal` for the roll-back, `setChip` for the turnover, so the
highlight fires on the verdict rather than on the reset.
```

---

## storage-pvc-clone

### before `const CX = 600;`

```
WHAT  Cloning a PVC. A new PVC whose dataSource points at an EXISTING PVC, not a snapshot. The
storage system makes an exact duplicate server-side and there is no snapshot object in between, which
is the whole contrast with the snapshot card.

CONTENT  Quoted rather than paraphrased, from kubernetes.io CSI Volume Cloning:
  "Cloning is supported with a different Storage Class. Destination volume can be the same or a
   different storage class as the source."     <- so the card must NOT require the SAME StorageClass
  "The source PVC must be bound and available (not in use)."
                                               <- so the card must NOT promise the source stays online
  "Cloning can only be performed between two volumes that use the same VolumeMode setting"
  "You can only clone a PVC when it exists in the same namespace as the destination PVC"
  "the value you specify must be the same or larger than the capacity of the source volume"
  "the back end device creates an exact duplicate of the specified Volume"
  "the source is not linked in any way to the newly created clone, it may also be modified or
   deleted without affecting the newly created clone"
CreateVolume is a call into the DRIVER that produces a volume, so its ball lands on the new DISK in
the backend.
DO NOT land it on the clone CLAIM: that is neither where the call goes nor what it creates.

LAYOUT  A mirror: source on the left, clone on the right, reflected about the canvas centre.
CLAIM_CX = [CX - SPREAD, CX + SPREAD] with CX=600, and the disks hang on the same two centre lines,
so the reflection holds on every tier. The provisioner sits alone on the centre line above them
because it belongs to neither side, and the backend frame below holds both disks because the copy
never leaves the storage system: that frame IS the word server-side.
Every horizontal run of every zigzag sits at the midpoint of what it crosses, and the backend frame
insets are equal, so the column is symmetric and nothing is pinned to a free gap. It is deliberately
the same rhythm as storage-volume-snapshot from the frame down, since the two cards sit in one row:
  36    canvas top margin
  36    External-provisioner   68 tall, to 104
  170   request corridor       66 below the provisioner, 66 above the claim row
  236   claim row              68 tall, to 304
  320   the constraint list    four lines, 20 apart, on the centre line, to 380
  396   storage backend frame  174 tall, to 570
  438   disks                  90 tall, to 528, frame insets 42 above and below
  552   disk captions          18 above the frame floor
  588   chip strip             34 tall, to 622
  18    canvas bottom margin

PANEL  Measured, panel bottom-right in viewBox units:
  1920x900  right 102  bottom 183      1600x1000 right 291  bottom 160
  1280x900  right 378  bottom 173      1100x900  right 397  bottom 173
  1280x860  right 397  bottom 230      1100x800  right 397  bottom 230
The four taller rows made the old worst case (y<=183) too kind by 47 units: a SHORTER window gives
the dialog less height, the diagram scales down with it, and the panel keeps its pixels. The
occlusion rule samples the two 230 rows, so 230 is the number this layout is built against.
At 196 the claim row was inside that band and the source claim (180..460) was 38 percent behind the
panel. The row starts at 236, clear of 230 outright, and everything under it moved down by 40 to
follow: the constraint lines lost 2 units of leading (22 to 20) to pay for part of it, and the chip
strip took the rest out of the bottom margin. The provisioner still sits inside the band and still
clears it on x, at 420..780. The request corridor at y=170 is inside the band too, but it only ever
runs between x=600 and x=880, far right of any panel. A longer narration invalidates all of this.

MOTION  Nothing pulses and nothing blinks: there is no Pod. The constraints step and the contrast
step carry no packet, and the canon would allow them the one sanctioned block blink so they do not
read as frozen. They deliberately do not take it: both state a fact rather than move something, and a
brightness blink on a block that is only being pointed at reads as traffic that never arrives.
DO NOT add it back.

LANES  ZERO crossings, and every lane meets its blocks on a face midpoint: the request leaves the
clone claim through the middle of its top face and arrives dead centre under the provisioner, and the
call leaves the provisioner through the midpoint of its right face and enters the new volume through
the midpoint of its right side, on the same line the duplicate arrives on from the left. The two meet
the disk from opposite sides, which is what keeps them apart.
The call takes the long way round, out to x=1060 and down the outside, and that is not decoration:
the dataSource link runs straight across the gap between the two claims at their mid height, so ANY
descent from the provisioner through that gap crosses it, and the gap is the only opening in the
claim row. Hiding the link for one step would make it blink out and back. Going around the outside
keeps both a permanent dataSource line and a crossing-free card, and it reads correctly on its own
terms: every lane lives in the right half, because the clone side is where all the work happens and
the source side is only ever read.
Both identity links are dashed and carry no arrowhead: each claim to its own volume, and the
dataSource between the claims. The clone identity link is held back until the claim actually binds.
```

### before `const DISK_W = 200, DISK_H = 90;`

```
The disks sit DEAD CENTRE in the backend frame: one inset used both above and below, so the frame is
sized from its contents. The top band carries the frame label (node() puts its label baseline 18
below the frame top) and the bottom band carries the disk captions, and the two come out equal.
```

### before `const REQ_CORRIDOR_Y = (PROV_BOTTOM + CLAIM_TOP) / 2;                   // 170`

```
The horizontal run of a zigzag belongs at the MIDPOINT OF WHAT IT CROSSES, not in whatever gap
happens to be free: REQ_CORRIDOR_Y is provisioner bottom 104 to claim row top 196, so the request
rises 46 and 46.
The call has no corridor of its own: it drops the outer column straight to the disk mid height and
turns in through the SIDE face of the cap, so its only horizontal runs are the two short ones at the
faces it leaves and enters.
DO NOT turn it in over the cap and drop onto the top: that puts two arrowheads on one disk pointing
from the same direction as the copy.
```

### opacity phases (was `const PLACEHOLDER = 0.4`, now OPACITY.pending)

```
Family rule: an object that does not exist yet is drawn dim, not hidden. Hiding it leaves a
block-sized hole in a mirrored row and a half empty frame, which reads as a rendering fault rather
than as an absence, so both halves of the mirror are always drawn and the absent one is dim.
```

### before `const prov = box({ x: PROV_X, y: PROV_Y, w: PROV_W, h: PROV_H, label: 'External-provisioner', sublabel: 'drive`

```
NAMING  External-provisioner, capitalised like every other CSI sidecar block in the family
(External-attacher, External-snapshotter, External-resizer): a hyphenated name capitalises its first
segment only. The narration keeps it lowercase mid-sentence, as those cards do.
```

### before `const CHIP_W = 232, CHIP_GAP = 16;`

```
Family chip width. Worst case here is 'dataSource' + 'kind: PVC' at 19 characters, so 19 * 6.89 + 24
of padding is 155 against the 232 available.
```

### before `[frame, prov, srcPvc, clonePvc, srcDisk, cloneDisk].forEach(el => root.appendChild(el));`

```
Family z-order, with the backend frame behind the blocks it holds.
```

### before `function setStage(s, { clone = OPACITY.pending, cloneDisk = OPACITY.pending, bound = 0, ds = 0, lanes = [] } = {}) {`

```
Family setStage. The clone claim and the clone disk default to OPACITY.pending, not to 0: they are
one half of a mirrored pair each, and cutting one half out leaves a hole rather than an absence.
```

### before `duration: 5900,`

```
Three chained hops: the claim picked up, the CreateVolume call out and down into the backend, and the
duplicate made on the shelf once the target exists. anim-dump puts the span at 5338 with the call
routed around the outside. Routes are length-based, so re-measure after ANY geometry change here
rather than trusting this number.
```

### poster

```
Two claims, two equal volumes, and one duplicate made INSIDE the storage system: the dashed enclosure
around the pair is the word server-side, which is the whole claim of the card, and the line between
the volumes runs straight from one to the other because there is no object in the middle. That is
also what tells this poster apart from storage-volume-snapshot beside it in the row: a snapshot is a
thin slice lifted off ONE volume, drawn vertically, while a clone is a full equal twin drawn beside
its source. The clone carries the brightest fill because it is the thing the card is about, and both
claim links are dashed like the card, since a solid line between two objects reads as a route that
never runs.
Mirror-symmetric about x=160: content 24..296 and 20..160, so 24 of margin a side and 20 top and
bottom, with the volumes centred in the enclosure at 14 above and below.
```

---

## storage-pvc-protection

### before `const CX = 600;                                                // canvas + identity-spine center`

```
WHAT  Why a deleted PVC does not go away. Three points the obvious version of this card gets wrong:

CONTENT  1. The finalizer is put on the claim WHEN THE CLAIM IS CREATED, not when a Pod picks it up.
The pvc-protection controller adds kubernetes.io/pvc-protection to every PVC whose deletionTimestamp
is nil and that does not carry it yet, use or no use. What being in use changes is the REMOVAL: the
controller refuses to take the finalizer off while a Pod still consumes the claim.
DO NOT say the finalizer appears "the moment a Pod started using it": that invents a trigger that
does not exist and makes the protection sound reactive when it is standing.

CONTENT  2. status.phase NEVER becomes Terminating. A PVC phase is Pending, Bound or Lost. What
prints Terminating is kubectl: its printer swaps the phase out for the literal string Terminating
whenever deletionTimestamp is non-nil. So the object under a stuck delete is still phase Bound, and
the word the user is staring at in the STATUS column is a display convention rather than a field.
That gap IS the card: the reason a stuck PVC is confusing is that its status looks like a state it is
not actually in. The claim keeps the sublabel 'phase Bound' the whole way through and a chip reports
what kubectl shows next to it.

CONTENT  3. What finally removes the object is the API SERVER, not the garbage collector. The GC
walks ownerReferences to delete dependents. A finalizer is settled in the API server itself: with a
deletionTimestamp set and the finalizers list empty, the outstanding delete completes and the record
leaves etcd.

LAYOUT  The centred vertical stack: the consumer Pod on top, the claim under it, the backing disk on
the shelf below, all three on ONE axis at CX=600, so the identity chain reads as a single column
rather than as three boxes that happen to be near each other. The spine is drawn as the mount ASCENT
(disk to claim to Pod), the same single arrowed axis storage-pvc-binding settled on, and balls really
travel it, so the arrowheads are earned. Nothing here is a headless relationship line.

The two actors that drive the delete sit ONE ON EACH SIDE of the spine, sharing a footprint, and they
are placed so that every lane is a straight run or a single right angle. There is no dog-leg anywhere
and no lane turns twice.
The vertical rhythm is one pitch, TIER=162, doing double duty:
  - the claim sits at 270 and the controller at 432, one tier below it
  - kubectl is level with the claim it deletes (centre 270), so kubectl to PVC is a STRAIGHT
    horizontal into the claim's right face, and deleting the Pod climbs its own column first and
    turns once into the Pod's right face at the Pod centre, 108
  - the two lanes that reach the claim, the delete from kubectl on the right and the finalizer patch
    from the controller on the left, land dead centre on opposite faces
The two forces of the card, the request to delete and the release that finally allows it, arrive from
opposite sides. That is the composition saying what the narration says.

WHY NOT stack both actors in ONE right-hand column, kubectl at the Pod tier and the controller below
the claim: that puts every block in the band 480..1070, centre 775, with the whole left half below
the panel empty. kubectl cannot move left, because it sits in the panel's y band. The controller can,
because its tier (396..468) is well below the panel floor of 230, so it takes the left column at
130..350 and the content spans 130..1070, centre 600. Dropping kubectl to the claim tier pays for it
twice over: it also turns the delete-PVC lane into a straight horizontal and leaves the Pod lane as
the only turning one.

PANEL  This card's panel was measured across viewport widths 1920 down to 900: right peaks at 399 and
bottom at 230 on the 1100x800 sample the occlusion rule uses. The verdict caption beside the claim is
anchored end at x=464 and runs back to about x=306 on its longest string, and it sits BELOW the claim
(y=324) rather than level with it, because the controller's lane now occupies the claim's mid height
on that side. The caption at 324 and the controller at 396 clear 230 by 94 and 166.
LENGTHENING ANY NARRATION INVALIDATES THIS: re-measure before doing it, or move the caption back to
the right of the axis.
```

### before `const MOUNT_LBL_X = CX + 16, MOUNT_LBL_Y = 204;`

```
The two captions take one side of the axis each, so neither can be mistaken for the other's lane. The
mount caption names the lane it sits beside. The VERDICT caption reports the state of the CLAIM, not
of any lane, so it sits hard against the claim at its own midline instead.
DO NOT park it beside the lower lane: it then reads as that lane's name, which it never was.
```

### before `const W_DEL_PVC = [[ACT_R_X, PVC_MID], [PVC_RIGHT, PVC_MID]];`

```
The pair into the claim, one from each side, and BOTH land dead centre on their face, at PVC_MID
exactly, rather than on lanes offset either side of it.
WHY NOT split them by a lane gap, the usual way to keep two routes from overlapping: the two are
never on stage together (kubectl appears only on the delete step, the controller only on the release
step), so the gap buys nothing and costs the thing that matters, which is that an arrow arriving off
centre reads as aimed at a corner of the block instead of at the block.
```

### before `// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.`

```
There is deliberately NO flashBox in this card. The sanctioned block blink exists so that a step with
no packet and no Pod does not read frozen, and no step here is in that position: every narrated step
carries a ball, a Pod pulse or a fade.
DO NOT brighten the claim on the finalizer-holds step: that puts a blink on infrastructure for no
reason. That step carries the mount ball instead, which is both real traffic and the actual point
being made: the claim is still mounted, which is exactly why it cannot go.
```

### before `const kubectl = box({ x: ACT_R_X, y: KUBECTL_Y, w: ACT_W, h: ACT_H, label: 'kubectl delete', sublabel: 'issues t`

```
NAMING  Block labels lead with the capitalized object TYPE, matching the sibling cards (PV
controller, PVC default/data in storage-pv-lifecycle-phases). The lowercase pvc-protection in the
finalizers chip and the narration is a different thing: that is the literal finalizer string
kubernetes.io/pvc-protection, so it stays exactly as the API spells it.
```

### before `kubectl.style.opacity = '0';`

```
Both actors appear only on the steps they act on, so the card is never crossed by a lane belonging to
somebody who is not on stage, and the six-block frame reads as the centred stack plus one visitor
rather than as a permanent crowd.
```

### before `const mountLbl = text({ class: 'scheme-label code dim', x: MOUNT_LBL_X, y: MOUNT_LBL_Y, 'text-anchor': 'start'`

```
Lane captions, blank at build and filled per step by setWire. The lower one is a VERDICT slot: it
reports whatever the claim currently is, which changes kind across the card (a binding, then a block
on removal, then a removal), so it is named for its job rather than for one lane.
```

### before `const CHIP_GAP = 24, CHIP_WS = [312, 232, 244, 220];`

```
A four-chip strip over the card's own width, derived rather than hand-placed, so the readout is
concentric with the stack above it. deletionTimestamp and the kubectl column sit next to each other
on purpose: the second is a display of the first, and seeing them light together is the lesson.
The four are NOT one width, and that is the fix for the last chip collision in the catalog. The first
carries both the longest name on the card and its longest value (deletionTimestamp against 'gone with
object'); at the shared 252 those two strings meet with one unit to spare, which is a collision on
any re-measure or font change. It takes 312 and the other three give it back.
```

### before `[pvc, kubectl, ctrl, disk].forEach(el => root.appendChild(el));`

```
Family z-order, with the Pod above the axis that ends on its edge.
```

### before `s.refs.app.classList.remove('highlight');`

```
The claim is the source here: the mount it still serves is what the step is about, so the write rides
up the same axis it did before the delete. No block flash is needed or wanted, the traffic itself is
the proof that nothing has changed.
```

### before `pulsePod(s.refs.web, ctx, del.arrivalMs);`

```
Down-arrow order, and the Pod is the one thing on stage allowed to pulse: the ball lands, the Pod
BLINKS to acknowledge the delete, and only once that blink has landed does it start to go.
DO NOT fade straight from arrival: that skips the acknowledgement entirely and the Pod just dims
under an arriving ball, which reads as the ball erasing it rather than as the Pod receiving a delete
and then terminating.
```

### poster

```
Abstract, not the literal diagram: the claim is MARKED for deletion (dashed outline) and yet still
whole (its content rows are intact on both sides), because a closed padlock sits dead centre on it.
The lock is the finalizer, and the live mount dropping in from the consumer above is why it stays
shut. Consumer on top, claim in the middle, disk below, so the poster carries the same centred
vertical stack as the card.

WHY NOT an X across the object: an X reads as deleted, which is the exact opposite of the card, where
the delete is the thing that has NOT happened.
WHY NOT side clamps: they read as two brackets parked near the object rather than as anything holding
it. The object is locked in place, not struck out and not squeezed.
Vertical rhythm: BOTH gaps are 18, and the disk's gap is measured from the top of its ELLIPSE
(cy - ry = 131), not from cy. Measuring to cy makes the lower gap look bigger than the upper one: the
numbers read 16 and 19 while the two connectors are drawn the same length, because the ellipse bulges
ry=6 up past the point the connector stopped at. The stack runs 15..164 (24 + 18 + 56 + 18 + 33),
which is 149 tall and centred in the 180 canvas with 15 and 16 of margin. Move any tier and the two
18s have to be re-derived.
```

---

## storage-pvc-retention-policy

### before `const CX = 600;`

```
WHAT  persistentVolumeClaimRetentionPolicy has two independent knobs, whenScaled and whenDeleted,
each Retain or Delete. Retain leaves the claim and its disk in place, which is safe but silently
leaks storage. Delete reclaims both, at the cost of the data.

LAYOUT  The SAME grammar as its sibling storage-volumeclaimtemplates. Three ordinal ROWS, one per
replica, each a straight triad centred on the canvas spine x=CX:

       Pod web-N   ->   PVC data-web-N   ->   pv-web-N
       (consumer)         (the claim)         (the disk)

with the Pod flanking the claim on the left and its disk on the right, mirrored about the spine.
Every connector is a dashed, arrow-headed lane exactly like the sibling, and every one carries a ball
on some step (a relationship with no ball would read as traffic that never runs).

MOTION  The sibling flows CREATION down the spine and up into the Pods; this card flows the policy
the other way:
  - policy step: the one policy reaches every claim, a governance ball cascades DOWN the spine and
    each claim lights as it lands (the spine is hidden except on this step, as in the sibling)
  - a Delete: a reclaim ball sweeps straight across the row Pod -> PVC -> PV, and the claim, then the
    disk, fade AS THE BALL REACHES THEM, taking the lanes in its wake. One clear ball-driven fade
  - a Retain: only the Pod fades. The claim and disk stay, shown by opacity plus their labels
Nothing is ever highlighted before a ball reaches it, and nothing fades without a ball or a Pod
removal behind it. Only Pods pulse, and only as they are removed: a Pod about to be scaled or deleted
away pulses once, then fades.

PANEL  The panel covers only the top-left band (measured bottom ~173, right ~397 worst case). The
policy box spans x 430..770, clear of the x<=397 band, and the first Pod row starts at y=195, below
the panel. A much longer narration invalidates this.
```

### before `function podBlock({ cy, label }) {`

```
A full Pod window like the rest of the storage cards: the ordinal name on top, a real container box
on the Pod centre line, and the mount path as the Pod sublabel at the bottom. The wrapping g keeps
the shape uniform with the family even though no Pod on this card ever pulses on arrival.
```

### before `const CHIP_W = 232, CHIP_GAP = 16;`

```
Family chip width. Worst case here is 'disks' + '3 kept, 1 leaks' at 20 characters, so 20 * 6.89 + 24
of padding is 162 against the 232 available.
```

### before `function setStage(s, { pods = [1, 1, 1], claims = [1, 1, 1], disks = [1, 1, 1], govern = false } = {}) {`

```
Family setStage. Lane opacities are DERIVED from the block they point AT (the ownership lane and the
spine from the claim, the reclaim lane from the disk), so a reclaimed claim or disk takes its own
lanes with it and no arrow is ever left pointing at a ghost. The spine only shows on the governance
step.
```

### before `function reclaimRow(s, ctx, i, { delay = 0, tag = null } = {}) {`

```
One ordinal reclaimed: a ball sweeps straight across the row Pod -> PVC -> PV. Each block LIGHTS as
the ball lands on it, holds a beat, then fades (with its lane) as the ball moves on: the claim goes
first because the PVC is deleted first, the disk follows when the reclaim reaches it. Every light and
every fade is tied to the ball, nothing fades on its own.
DO NOT touch the spine here: it only exists on the policy step, so animating it would wrongly flash a
segment into view.
```

### poster

```
One policy, two knobs, forking to two fates. A dashed fork drops from the policy box (its two knob
cells one solid, one hollow) to two disks: left stands whole and bright (Retain kept it), right is
dashed and faded (Delete reclaimed it). Echoes the volumeClaimTemplates sibling's top-box + fork
grammar, but diverges to two outcomes instead of stamping three copies.
```

### before `const dark = () => el.classList.remove('highlight');`

```
The ball lights each claim and each disk as it lands (lightBoxAt), then vanishAt fades the block away
behind it, and the class has to come back off when the fade finishes.
DO NOT leave the class on: a reclaimed block then ends its step lit at the terminated shade, which is
the thing the step points at and the thing that no longer exists, at once. The static path never
reproduces it, because it pins the shade and lights nothing, which is how this surfaced as eight
reduced-motion findings rather than as a drawing complaint. Dropping the class on finish settles both
paths at once and matches what check-opacity LIT enforces everywhere the shade is pinned rather than
animated.
```

---

## storage-reclaim-policy

### before `const PVC_Y = 30, PVC_H = 68, PVC_BOTTOM = PVC_Y + PVC_H;      // 98`

```
WHAT  A side-by-side comparison, so the storage stack is drawn TWICE: a Delete column on the left and
a Retain column on the right, each a claim on top, its bound volume under it, and the real disk on
the shelf at the bottom. Between the volumes and the disks runs ONE full-width band, the PV
controller and CSI driver, because both columns are reclaimed by the same controller reading the same
field: the band is where the two stories split.

LANES  Every reclaim is a DESCENT through it, exactly as in storage-access-modes: PV to controller
(the policy is read), then controller to disk (the disk is wiped). Retain is the branch where the
second hop never happens, and that absence is the whole point, so the first hop is still drawn and
still lands on the band.

MOTION  There is no Pod anywhere, so nothing pulses: boxes, the band and the cylinders light, and the
one packet-less step is allowed a box flash. Two rules govern that light, and both exist because a
lit stroke is a claim about the object:
  1. Only the SOURCE of a ball is lit at step entry. Every destination earns its light on arrival
     (lightBoxAt at pkt.arrivalMs), so the card never announces an outcome before the act.
  2. A block that is not at full opacity never carries one. Faded means gone or refused, and a dimmed
     block still glowing reads as deleted-but-somehow-live. removeAt enforces this for the mid-flight
     case by dropping the class as the fade lands.

LAYOUT  Four tiers with three equal 54 unit gaps, so no hop is a blink and no tier reads as belonging
to its neighbour. The whole stack is pulled UP rather than centred vertically, because FIVE text rows
queue up under the disk shelf: the cylinder name, the spec line, the verdict line and two rows of
chips. Sitting the shelf lower crushes those five into each other. Everything above the shelf is
spaced backwards from it.
The panel owns the top-left corner, so every block starts at x>=400.
```

### before `const LEFT_X = 400, STACK_W = 400;                             // 400..800, so the center is 600`

```
The stack is centred on the CANVAS, at 600, not merely placed somewhere to the right of the panel.
That costs width and the cost is not negotiable: the panel permanently owns the top left, the top two
tiers sit inside its vertical band, so the leftmost the columns may start is 400. Centring on 600
with a left edge of 400 pins the stack to exactly 400 wide. Everything horizontal is derived from
those two numbers, so the two columns split what is left rather than each carrying a hand-typed x.
DO NOT "fix" the narrowness by sliding LEFT_X left after measuring the panel on your own screen:
measured right edge is 185 at 1920 wide but 379 at 1100 and below. LEFT_X 400 is that worst case plus
a hair, not a pessimistic guess.
```

### before `const ADMIN_W = 160, ADMIN_H = 68, ADMIN_X = 850, ADMIN_Y = PVC_Y;`

```
The human sits in the right margin and is the one element that breaks the symmetry, which it has to:
the left margin is the panel and nothing may be parked there, so an actor that is not part of either
stack has only one place to go. It is kept close to the Retain column rather than pushed to the
canvas edge, and it appears on exactly one step, so the composition reads as centred on the six steps
where it is absent and as centred-plus-a-visitor on the one where it is.
```

### before `const SPEC_GAP = 14;`

```
cylinder() puts its own name on the baseline h/2+5, and this spec line goes 14 BELOW that. Same fix,
same number, as storage-access-modes.
WHY NOT a flat DISK_Y+66: that leaves 11 units between two baselines whose text is 11 units tall, so
the two lines visually touch.
```

### before `const VERDICT_Y = DISK_Y + DISK_H + 28;                        // 518`

```
The verdict line clears the bottom of the cylinder by a full row rather than 16 units, and the chip
strip clears the verdict by another one. Both are derived so raising the shelf again carries them
with it.
```

### before `const CHIP_W = COL_W;                        // each chip is exactly as wide as the column above it`

```
The readout is a 2x2 GRID, not a row of four: each column of the diagram gets its own pair of chips
stacked directly under it, at exactly the column x and exactly the column width. One row per kind of
object (the volumes, then their disks), so reading across compares the two policies and reading down
walks one stack.
WHY NOT a single row of four: four chips wide enough to hold their text come to 920 units against a
400 unit stack, so the strip would be more than twice the width of the thing it reports on, and no
chip would line up with anything above it.
BUDGET  The cost is a hard 152 units of room for text per chip (176 minus 12 of padding at each end),
so values are kept to about 12 characters. The longest pair here, 'vol-aaa' plus 'wiped, gone', comes
to roughly 46 + 73 units of 11px JetBrains Mono, which leaves a clear gap between name and value.
Anything longer collides in the middle of the chip, so shorten the VALUE, never the width.
```

### before `function removeAt(el, ctx, delay = 0, to = OPACITY.terminated) {`

```
Fades an object out of existence when the delete that removes it lands, and takes its lit stroke with
it. A block that has gone dark must not keep glowing: the highlight means "this is live and in play",
so a ghost at 0.12 still wearing it reads as a deleted object that is somehow still working. This is
the one place the class cannot simply be pinned per step, because the fade is mid-flight, so the
class comes off when the fade lands.
```

### before `function lane(points) {`

```
Two line vocabularies, and the difference is the whole point of reading the card:
  dashed + arrowhead = a ROUTE, something travels it. Every reclaim lane is one of these, including
    the Retain lane down to the disk, which is a real route that this policy simply never uses.
  solid, no arrowhead = a RELATION, the Bound link. Nothing travels a relation, so it gets no head.
Routes are built with pathArrow so the head, the dash pattern and the storage tint all come from one
place, and from the SAME points array the ball is animated along.
```

### before `const retPvc2 = box({ x: RET_X, y: PVC_Y, w: COL_W, h: PVC_H, label: 'PVC data-c', sublabel: 'Pending', role: '`

```
The claim that arrives AFTER the first one is deleted is its own box, not the old one turned back on.
DO NOT reuse the same element with a new sublabel: the step that narrates a brand new claim then
shows the deleted claim rising from the dead under its original name.
```

### before `const delChip     = valChip({ x: DEL_X, y: CHIP_ROW_1, w: CHIP_W, h: CHIP_H, name: 'PV-del', value: 'Bound', role: 'storage' });`

```
Each chip names ONE object and reports only that object's state, so a value can never be read as a
caption for something else. The two PV chips carry the phase, which is why the PV boxes keep their
reclaim policy as a fixed sublabel instead of flipping between the two meanings.
```

### before `const delSpec = specText(DEL_CX, 'real disk, EBS');`

```
The spec line is a sibling of the cylinder, not a child of it, so it has to be faded BY HAND when the
disk it describes is deleted.
DO NOT leave it alone: that leaves a bright "real disk, EBS" hanging under a disk the step has just
wiped out of existence.
```

### before `s.refs.delPv.classList.add('highlight');`

```
The two volumes light because their phase flipped to Released. The two claims do NOT, even though
they are what you deleted: they end this step faded, and a faded block never keeps a lit stroke. What
marks them is the flash below plus their new Terminating sublabel.
```

### before `s.refs.delPv.classList.add('highlight');`

```
The PV is the block the ball leaves from, so it lights at once: it is the actor here, not a bystander
that happens to be above the lane. The disk lights when the wipe REACHES it and only then starts
dissolving, so the hit registers before the object stops existing.
```

### before `s.refs.band.classList.remove('highlight');`

```
Played forward, only the SOURCE of the ball is lit from the start. The band and the disk have to earn
their light: the band when the ball lands on it, the disk at the same instant, because that is the
moment the policy is read and the disk is spared.
DO NOT light the disk at step entry: that announces the outcome before the ball that decides it has
left the volume.
```

### before `setStage(s, { delPvc: 1, delPv: 1, delDisk: 1, retPvc: 1, retPvc2: 0, admin: 0, delBound: 1, retBound: 1, retBindLane: 0, adminLane: 0 });`

```
A ball travels this segment on this step, so the segment is a ROUTE and is drawn dashed with a head,
not as the solid Bound relation. The solid line is reserved for the resting state, where nothing
moves along it. That the claim ended up bound is carried by its own sublabel, the PV-ret chip and the
verdict line, all three of which say Bound on this step.
```

### before `s.refs.retDisk.classList.remove('highlight');`

```
Only the claim, the ball's source, is lit from the start. The volume lights when the bind reaches it,
and the disk lights at the same moment, because the disk becoming reachable IS that arrival.
DO NOT light it at step entry: that shows the payoff before the act.
```

### poster

```
Abstract, not the literal diagram, built on the sentence the card opens with: you delete a claim and
the disk full of data disappears, or it does not. So the poster is ONE deleted claim (dashed, because
it is on its way out) dropping into ONE controller band, and two fates leaving the other side of that
band. The band is the whole point and is the reason this is not just a fork: the two outcomes are not
chance, they are one field being read by one controller.
Left, Delete: the disk is dashed and faint, mid-dissolve. Right, Retain: the disk is solid and
filled, and carries a padlock, because Retain does not hand the data back either. It survives and
stays locked behind a stale claimRef until a human clears it, and a poster that showed only "kept"
would promise a happy ending the card spends three steps taking away.
The two lanes are symmetric about the claim above them, so neither outcome reads as the default.
The padlock is centred on the cylinder FACE (the band between the bottom of the cap at 122 and the
bottom arc at 160, so 141), not on the shape's bounding box: the cap is drawn as a rim seen edge-on,
and a glyph centred on the box sits visibly high inside the body you actually see.
```

### before `const DEL_X = LEFT_X, RET_X = LEFT_X + COL_W + COL_GAP;        // 400 / 624`

```
OPEN  CENTRE is open here on purpose. Content spans 400..1010, centre 705 against a wanted ~600. Both
columns are locked by the PVC row above them, which has to sit right of the panel, and the only way
to pull the centre left is to stretch the policy band across the full width. That is exactly the
fit-the-metric edit that produced regressions elsewhere, so the number stays red and the picture
stays honest.
```

### before `ridingLabel(s, ctx, 'policy: Retain', W_RET_POLICY);`

```
The disk is deliberately NOT lit on this step, on either path. `lightBoxAt` is this catalog's cue for
a block that RECEIVED a packet.
DO NOT fire it on `retDisk` at the same millisecond as the band with no ball on the lane between
them: that turns the one step whose entire point is that the disk is never touched into the step
where the disk lights up on arrival.
Retain is a state, not an arrival. `setStage` never pins `retDisk`, so it holds full opacity while
the whole Delete column sits at `OPACITY.terminated` beside it, and that contrast is what says the
data survived. The band keeps its own `lightBoxAt`, because the policy ball really does reach it.
```

### before `removeAt(s.refs.wRetBind, ctx, bind.arrivalMs, 0);`

```
`retBound` and `wRetBind` are drawn on the SAME segment, so on the one step where both are true they
hand over rather than stack.
DO NOT have `rebind` pass `retBound: 0`, exactly as the refused `retain-stuck` does: that shows an
identical picture for a claim that binds and a claim that is skipped, and breaks the distinction the
card teaches one step earlier in so many words. Raising it alone is not enough either: with
`retBindLane` also at 1 the solid arrowhead-free Bound link renders underneath a dashed arrowhead.
The end state is the link alone, the lane is re-raised below the guard so the ball has something to
ride, and the two cross-fade on `bind.arrivalMs`.
```

---

## storage-topology-aware-provisioning

### before `const CX = 600;`

```
WHAT  WaitForFirstConsumer. Two zones side by side, each a worker node with its own zonal disk on the
shelf below it.

CONTENT  volumeBindingMode: Immediate provisions the disk the instant the claim exists, in whatever
zone the provisioner happens to pick. The scheduler then honors that already-bound disk, but if the
Pod only fits the other zone on capacity and affinity, no node satisfies both the Pod and its zonal
disk, so the Pod stays Pending forever with a volume node affinity conflict. It is never scheduled
and never reaches ContainerCreating. WaitForFirstConsumer inverts the order: the scheduler picks the
node first, and only then is the volume provisioned in that same topology.

LAYOUT  The two zones are mirrored about the canvas centre, so the picture is symmetric and neither
zone reads as the important one: NODE_CX = [CX - SPREAD, CX + SPREAD] with CX=600, derived from the
node width and the gap rather than typed. Content spans 140..1060, margins 140 a side.
WHY NOT run the nodes at 400..720 and 820..1140: the pair centre lands at 770 and leaves 400 units of
dead canvas on the left against 60 on the right.
The StorageClass and the claim sit stacked on the centre line above the zones, both centred on CX,
because the whole card is about ONE claim and ONE class being resolved into ONE of two zones.

PANEL  Measured, panel bottom-right in viewBox units:
  1920x900  right 102  bottom 183      1600x1000 right 291  bottom 143
  1280x900  right 378  bottom 173      1100x900  right 397  bottom 149
  1280x860  right 397  bottom 230      1100x800  right 397  bottom 230
Worst case x<=397 and y<=**230**: the four taller rows are all 900 or 1000, and a shorter window
shrinks the diagram while the HTML panel keeps its pixels. The StorageClass (y=36) and the claim
(y=136) both sit inside that y band, so both start at x>=400. The node row at y=236 clears the real
floor by **6 units**, not the 53 the old number implied, so it must not move up. A longer narration
invalidates this.

LANES  The provisioning route leaves the StorageClass from its RIGHT edge midpoint, wraps down the
outer margin clear of both zones, runs a bus UNDER the whole disk shelf and rises into the chosen
disk through its BOTTOM. That keeps it out of every block and lets one route shape serve either zone.
The doomed cross-zone reach uses its own corridor in the gap between the node frames and the shelf,
drawn as a bare dashed line the Pod aims at its stranded disk, entering it dead centre on the top
edge. It has NO arrowhead because the attach never actually succeeds.

MOTION  On the failure step the Pod never went Ready, so it takes pulsePodDim with an opacity lift.
```

### before `const NODE_W = 430, NODE_GAP = 60, NODE_Y = 236, NODE_H = 140;`

```
NODE_H hugs the Pod rather than framing canvas.
WHY NOT 180: the frames stand 88 units taller than the Pod they hold, and zone-a, which holds nothing
at all in the WaitForFirstConsumer path, reads as a large empty box rather than as an empty zone.
```

### before `const W_PROV_B = [[SC_RIGHT, SC_MY], [PROV_WRAP_X, SC_MY], [PROV_WRAP_X, DISK_MY], [NODE_CX[1] + DISK_W / 2, D`

```
Both provisioning routes leave the StorageClass through its RIGHT edge midpoint and wrap down the
same outer margin, then turn in along the shelf midline and enter their disk through the near RIGHT
SIDE with two right-angle turns.
DO NOT wrap left: the lane and its ball then run straight through the panel.
zone-a simply runs further left than zone-b along that midline: it passes over where the zone-b disk
sits, but that disk is invisible during the zone-a provisioning step, so nothing is crossed on screen.
```

### before `const W_MOUNT_B = [[NODE_CX[1], DISK_TOP], [NODE_CX[1], NODE_BOTTOM]];`

```
The mount lane and the cross-zone reach both meet the node-2 frame at its bottom edge (the line
enters the NODE, not the Pod sitting inside it), and they are never drawn in the same step, so each
runs straight down the node centre line and enters its disk dead centre.
```

### before `function podBlock() {`

```
Family pulse model: the wrapping g is not optional.
```

### before `const zoneLbls = NODE_X.map((x, i) => text({ class: 'scheme-label code dim', x: x + NODE_W - 12, y: NODE_Y + 1`

```
node() carries no sublabel, so the zone is its own dim caption. It shares the frame HEADER line with
the node label, right-anchored.
WHY NOT centre it under the label at NODE_Y + 24: it lands on the top edge of the Pod the frame
holds, since NODE_H now hugs the Pod.
```

### before `[wProvA, wProvB, wMountB, crossLink].forEach(w => { w.style.opacity = '0'; });`

```
Lanes are pinned per step by setStage.
DO NOT leave them permanently visible: the zone-a provisioning lane is then still drawn during the
zone-b provisioning step, pointing into a disk that does not exist on that path.
```

### before `const CHIP_W = 232, CHIP_GAP = 16;`

```
Family chip width. Worst case here is 'mode' + 'WaitForFirstConsumer' at 24 characters, so
24 * 6.89 + 24 of padding is 189 against the 232 available.
```

### before `[...nodes, ...zoneLbls, sc, pvc, ...disks, podB.group].forEach(el => root.appendChild(el));`

```
Family z-order, with the Pod above its node frame.
```

### before `pulsePodDim(s.refs.podB, ctx, BEAT.lead, { from: OPACITY.pending, peak: 0.95 });`

```
The scheduler keeps re-queuing the Pending Pod and rejecting it, so the Pod blinks. It never went
Ready, so it stays dim and needs the dim variant with an opacity lift.
```

### before `duration: 5800,`

```
5800, not 4400: this step provisions, materialises the disk and then mounts it, and the pulse on
arrival adds PULSE_POD.ms on top, which anim-dump puts at a 5473ms span. At 4400 the auto-advance
cuts the mount off before the Pod ever blinks, so the card under-shows exactly what it narrates.
```

### poster

```
The Pod's zone (bright, centred) among faint sibling zones: the scheduler placed the Pod first, so
its volume is provisioned into that same zone, the jade disk directly beneath it. The empty flanking
zones are the topologies the volume did NOT land in.
```

---

## storage-volume-attach-limits

### before `const LEFT_X = 400;`

```
WHAT  The one CSI failure that happens BEFORE anything is bound, attached or mounted: the Pod never
gets a node at all. Every node has a hard ceiling on how many volumes one CSI driver may have
attached to it at once. Run out of slots and the Pod sits in Pending reporting "node(s) exceed max
volume count" while every node still has spare CPU and spare memory, which is what makes it so hard
to recognise the first time.

SCOPE  This is the only card in the csi row whose subject is SCHEDULING. Its six siblings all begin
with a Pod that already has a node, so the whole vocabulary of the section (VolumeAttachment, stage,
publish, fsGroup, force-detach) is downstream of a decision this card is entirely about.

CONTENT  Three points checked against source, each of which the card had wrong:
1. The node-driver-registrar does NOT write CSINode. It runs a registration socket that tells kubelet
   the driver's name and endpoint, and nothing more. KUBELET calls NodeGetInfo
   (pkg/volume/csi/csi_plugin.go, RegistrationHandler.RegisterPlugin) and hands maxVolumePerNode to
   the node info manager, which writes spec.drivers[].allocatable.count.
2. NodeVolumeLimits does NOT run on every scheduling attempt. Its PreFilter returns Skip when the Pod
   has no PVC, no generic ephemeral volume and nothing inline-migratable, which suppresses the Filter
   phase for that Pod entirely. A storage-free workload costs one volume-list scan.
3. What the Filter counts changed in 1.32 (PR 127757, issue 126502). Before that it counted only the
   volumes of Pods assigned to the node, so deleting a Pod freed its slot instantly and the
   replacement was scheduled onto a node whose disks were still detaching, landing in
   ContainerCreating with FailedAttachVolume. Since 1.32 the count is the de-duplicated union of
   those Pod volumes AND every live VolumeAttachment for the node, so the slot is held until the
   VolumeAttachment is deleted, which is what "released by a detach, not by a Pod dying" means and
   why the Pod stays Pending rather than getting placed. A QueueingHint on VolumeAttachment delete
   requeues it the moment the slot really opens. This card targets 1.35, so it tells the 1.32+ story,
   and the `filter` step names both terms of the sum because `detachlag` is their payoff.

LAYOUT  A vertical stack reading top to bottom as three layers of authority:
  1. Pod web-0, unplaced                                      (the claimant)
  2. the Scheduler and its NodeVolumeLimits filter            (the decider)
  3. CSINode, one per node, holding allocatable.count         (the ceiling, as an object)
  4. three node frames, each an 8-slot attachment strip       (the ceiling, as physical reality)
Tiers 3 and 4 are deliberately adjacent: the whole mechanism is that a number written in an API
object has to agree with how many disks are really hanging off a machine, and the card is asking the
reader to compare the two rows.
CONTENT_CX = LEFT_X + CONTENT_W/2, and LEFT_X cannot move, so CONTENT_W is the only lever on where
the card sits. CONTENT_W 400 puts CONTENT_CX exactly on 600. That exactness is forced by the chip
strip, which at 976 units is far wider than anything above it and is therefore the tier that sets the
visual centre. On 600 it spans 112..1088 and the two margins agree.

PANEL  Worst step, right / bottom by viewport:
  1920x1080 -> 203 / 130    1440x900 -> 319 / 163    1280x800 -> 358 / 189
  1100x800  -> 397 / 220     900x650 -> 398 / 375
So x<=398 and y<=375, and the bound is an L, not a box: above y=375 nothing may sit left of 400,
below it the full width is free.

BUDGET  That 375 is BOUGHT and it is what pays for the node row being wide. At up to 470 characters,
the longest in the csi row, the bottom lands at 498 and the node tier has no choice but to squeeze
inside 400..800 at 120 units per node. Held under ~300 characters the panel sits at 375, and the node
row at y=418 clears it by 43, so the row can spread to 584 units and each node frame gets 176.
Overrun ~300 on any step and the widest node goes back under the panel. Re-measure after editing
narration, not only after moving geometry.
The upper three tiers (Pod, Scheduler, CSINode) all live inside 400..800 because they sit ABOVE y=375
where the L is still closed. Only the node row and the chip strip cross to the left, and both are
below it. That is the whole reason the report lanes converge instead of running straight up: the row
underneath is wider than the object it reports into, and the object cannot grow to meet it.
```

### before `const PVC_DY = 34, PVC_H = 46;`

```
The PVC box inside the Pod, in Pod-local coordinates. pod() puts its own label on the baseline at
y=16 and its state sublabel on the baseline at y=h-8, so on a 110 tall Pod the free band runs 20..93.
PVC_H 46 centred in it leaves 14 above and 15 below.
DO NOT sit it at 40..86 against a sublabel whose glyphs start at 95: the box is then pinned against
the floor of the Pod with all the slack piled on top of it, which reads as the Pod being mis-drawn
rather than as a gap.
```

### before `const CSI_W = 280;`

```
ONE CSINode box spanning the full node tier rather than three boxes stacked over three columns.
WHY NOT three: they are identical in every field that matters here, so the row reads as a repetition
the card never uses. The number is the same on all three nodes, and the story is about that number
against the slots, not about the objects differing. Spanning the whole tier also lets all three
report lanes converge into one face, which is what the registrar actually does.

CSI_W 280 rather than the full 400 of the tiers above. It is narrowed so the two outer report lanes
have somewhere to travel: they must rise at x>=400 and then run IN to a side wall, so every unit the
box gives up on each flank is a unit of visible horizontal run. At 280 the wall sits at 460 and each
run is 60 units. At 400 the wall is at 400, the run is zero, and the turn collapses onto the rise.
The label needs about 150 units and the sublabel about 121, so 280 still leaves ~65 units of air on
the wider of the two.
```

### before `const NODE_W = 220, NODE_GAP = 30;`

```
Three node frames, 176 wide with a 28 unit gap, spanning 584 and centred on CONTENT_CX, so the row
runs 308..892 and hangs 92 units outside the tiers above it.
WHY NOT 120 wide packed inside CONTENT_W: that makes a whole machine the smallest object on a card
whose entire subject is what a machine can hold, and the eye reads them as three little widgets under
the real diagram. 176 is what the panel allows once the narrations come under ~300 characters, and it
is enough for the slot grid to be drawn at a size that can actually be counted.
```

### before `const LANE_X = NODE_CX;                                  // 350 / 600 / 850`

```
Each report lane LEAVES its node dead centre of the node's top face, so the three lanes read as
rising straight out of the three machines rather than out of a point offset inboard. The outer two
therefore start at the node centres 350 and 850.
OPEN  At 900x650 the panel bottom is 375 and its right edge x>=398, so the left lane's rise from
y=406 to CSI_MID_Y 330 clips the panel between y=375 and y=330. Pulling the lanes in to 400 / 800
clears it and costs the dead-centre exit on both outer nodes. The node row itself is free of all of
this because it starts at y=406, below the panel.
```

### before `const SLOT_N = 8, SLOT_COLS = 4, SLOT_W = 26, SLOT_HGT = 26, SLOT_GAP = 10;`

```
The attachment strip, in frame-local coordinates. Eight slots is the DIAGRAM's cap, not a real
driver's, and the mechanism is identical at any number: eight is what can be drawn as countable
squares at this width.
CONTENT  Checked against the node-specific volume limits doc. The DEFAULTS are EBS 39, GCE PD 16,
Azure Disk 16, but with dynamic limits the real ceiling is per instance type: EBS 25 on
M5/C5/R5/T3/Z1D and 39 elsewhere, Azure up to 64, GCE up to 127. Not 128 for GCE, which is the
off-by-one everyone makes.
Everything inside the frame is derived from NODE_W, so widening the node widens its contents instead
of leaving a bigger empty box around the same small gauge. At 220 the sockets go to 26 with a 10 unit
gap (134 for the row, 43 of margin each side) and the counter to 172 x 30.
```

### before `const CHIP_W = 232, CHIP_GAP = 16, CHIP_COUNT = 4;`

```
Family chip width. Worst cases, in viewBox units:
  allocatable.count  117 + '8 per node'         69 = 186
  Pod web-0           62 + 'Running on node-3' 117 = 179
  blocked by          69 + 'max volume count'  110 = 179
  attached            55 + '24 of 24'           55 = 110
232 clears the worst pair with ~22 units between name and value.
```

### before `const LANE_DX = 40;`

```
The Pod and the Scheduler talk BOTH ways, so each direction gets its own lane rather than a ball
bouncing back down the arrow it came up. LANE_DX 40 is not cosmetic: the return lane carries a riding
tag that comes to rest in the corridor between the two blocks, and at 14 that tag (about 96 units
wide) prints straight over the outbound lane. At 40 the two lanes stand 80 apart and the tag clears
the other one with room.
```

### before `const W_SCHED_CSI = [[CONTENT_CX, SCHED_BOTTOM], [CONTENT_CX, CSI_TOP]];`

```
The filter read runs dead down the spine, which is also where node-2 reports in from below, so the
CSINode box has one vertical axis through it rather than two near-misses.
WHY NOT push it out to 480 to dodge a wire caption centred on 700 in the same corridor: the corridor
then carries a lane left of centre and a line of text right of it and reads as neither aligned nor
deliberate. The caption is gone (see build) and the lane is back on CONTENT_CX.

OPEN  A read lane pair is declined here, and the finding stays open with the reason written down. The
finding is real as far as it goes: the filter step narrates a read ("reads allocatable.count out of
each CSINode and compares it") and only the question was ever drawn. The prescribed fix is a lane
pair, and a pair is by definition two axes, which would put three verticals through this box where
the note above records the work of getting it down to one.
What answers the read is already on screen and is why the step lights what it lights: the CSINode
carries `allocatable.count: 8` in its own sublabel, and all three Node counters are lit for the whole
step precisely because they are the values being compared against. A ball would restate what two
blocks already say, at the cost of the axis. If a rule can only be satisfied by making the picture
worse, the finding stays open.
```

### before `const W_NODE_CSI = [`

```
Each node reports its own cap into the shared CSINode box. Three lanes, one shape each, and every one
of them is a single move or a single 90 degree turn:
  node-1  rise, then ONE turn right into the LEFT side wall at CSI_MID_Y
  node-2  straight up the spine into the BOTTOM face, dead centre
  node-3  rise, then ONE turn left into the RIGHT side wall at CSI_MID_Y
WHY NOT two turns on the outer pair, out of the frame, along a shared mid-corridor line and then up
into the bottom face: that is a zigzag, three segments to say one thing, and it makes the corridor
between the tiers read as plumbing. Entering the side walls says the same thing with one bend.
```

### before `const REPORT_DUR = Math.max(...W_NODE_CSI.map(routeDur));`

```
ONE duration for all three report balls, so they leave together and LAND together. Their paths are
not the same length (136 units on the flanks against 48 up the spine), and routeDur is length-based,
so left to itself the centre ball arrives first and the object lights before two thirds of the report
has got there. Both lengths currently fall under the PKT_DUR_MIN floor of 700ms and would coincide
anyway, which is precisely why this is pinned: that is an accident of the present geometry, and the
first time a tier moves far enough to push a flank past 315 units the three would silently desync.
Registered in check-canon's ALLOW_EXPLICIT_DUR.
```

### before `const SLOT_FILL = Object.freeze({`

```
Slot fills. `free` is the empty socket, `used` a volume already attached, `fresh` the one that web-0
finally takes, drawn brighter so the last step has a static change and not only a sublabel edit.
DO NOT add a `detaching` fill: the detach that frees a slot is a transient, and giving it a resting
colour invites the reader to look for it in the end state.
```

### before `function podBlock() {`

```
Family pulse model: the wrapping g is not optional.
```

### before `function nodeBlock({ x, label }) {`

```
A node frame is its own little instrument: a caption, a strip of attachment sockets, and a counter
that reads them back as a number. The slots are plain rects rather than box() primitives on purpose.
They are not blocks that can act, so they must never be able to take .highlight, pulse, or receive a
packet: they are a gauge, and the only thing they ever do is change fill.
```

### before `const cap = frame.querySelector('.scheme-node-label');`

```
node() drops its caption at local y=18, which on a frame this short reads as floating inside the box
rather than as titling it. 14 tucks it up against the top edge. Placement only.
```

### before `const capChip   = valChip({ x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'allocatable.count', value: `

```
No wire caption in the Scheduler-to-CSINode corridor.
DO NOT put one back: it carries nothing the narration and the chip strip do not already say, and it
sits off to one side of a lane that was itself off-centre, so the one corridor that should read as a
single clean axis has two competing things in it. `wires` stays as an empty map so the family
prologue (clearWires) is still valid if a caption is ever wanted back.
```

### before `nodes.forEach(n => root.appendChild(n.frame));`

```
Family z-order, with the counter boxes above their own node frame.
```

### before `function setChips(s, { cap = '8 per node', attached, pod: podVal, blocked }) {`

```
Family setChips. Each name means exactly one thing: 'attached' is slots in use across the whole
cluster, never one node, and 'blocked by' is the reason web-0 cannot be placed, never the Pod state
itself.
```

### before `function setSlots(s, counts) {`

```
The gauge. `counts` is one entry per node: a number, or a number plus a `fresh` flag marking the last
filled slot as the one web-0 just took. Every step calls this with all three, for the same reason
every step writes every chip: a node left unset keeps the previous step's reading, and a counter that
disagrees with its own slot strip is the one error on this card a reader cannot catch.
```

### before `function setStage(s, {`

```
Family setStage.
The lanes each track the thing they represent. The three report lanes are the exception and stand at
full from the first frame, because what they carry (a node telling the cluster its own ceiling) is a
standing relationship that was true long before this card started.
```

### before `setChips(s, { attached: '4 of 24', pod: 'not created', blocked: 'nothing' });`

```
The Pod is absent, not dim. It has not been created yet, and a ghost Pod sitting at the top of the
card from the first frame would say the scheduling attempt is already under way, which is the
opposite of the setup: right now there is simply a cluster with room in it.
```

### before `narration: 'The ceiling is not a Kubernetes setting. It is reported by the CSI node plugin as max_volumes_`

```
Where the number comes from, which is the one CSI object the rest of the row never touches. All three
report lanes fire together rather than one after another: they are three copies of one mechanism, and
walking them in sequence would suggest an ordering that does not exist.
```

### before `W_NODE_CSI.forEach(pts => {`

```
No Pod acts here and no block emits: the node plugins do, and they are drawn as the frames
themselves. So the balls leave after BEAT.lead with no preceding pulse, and CSINode lights when the
first one lands rather than at step entry.
All three share REPORT_DUR so they land on the same frame: three nodes reporting one number each, not
a staggered relay. The riding label is passed the SAME dur, or it drifts off its own ball mid-flight
and only rejoins it at the endpoints.
```

### before `const prev = [2, 1, 1];`

```
The newly taken slots fade in one after another, left to right and node by node, so the strip reads
as filling rather than as cutting to a full state. Pinned full above the guard first: a cancel
mid-fill must land on eight of eight, not on however far the stagger had got.
`seq` is a running counter across ALL THREE nodes, not a per-node index.
DO NOT compute the delay from i and the node's own starting count: that double-counts node-1 and
pushes the last slot to 2620ms, past this step's 2600ms duration, so auto-advance cuts the fill off
with the final slot still fading in. 90ms per slot over the 20 slots that actually change lands the
last one at 1930ms, well inside the step.
```

### before `narration: 'So web-0 stays Pending, and its event reads zero of three Nodes are available, three Nodes exceed max volume count. Every one of those Nodes has spare CPU and spare memory, which is what makes this hard to recognise: the cluster looks half empty and the Pod will not schedule.',`

```
The sentence of the whole card. The answer comes back DOWN its own lane rather than up the request
lane, because a FailedScheduling event is a thing the scheduler produces, not the request bouncing.
```

### before `const ans = routePacket(s, ctx, W_SCHED_POD, { delay: BEAT.lead, role: 'storage' });`

```
Down-arrow ordering: infra reaching a Pod, so the ball goes first and the Pod blinks on arrival. The
tag rides BELOW the ball (dy positive) because a lane ending at a Pod cannot carry its tag above it:
pod() puts the sublabel 8 units above the shell bottom, and a tag at the default -14 prints on top of
it for the last beat of the flight.
```

### before `setSlots(s, [8, 8, { used: 8, fresh: true }]);`

```
node-3 ends back at eight of eight, and the eighth slot is drawn `fresh` so the end state shows WHICH
slot web-0 took. The seven of eight in the narration is a transient the motion below plays through,
never a resting state: a slot that opens and is taken in the same breath is exactly the race the step
is about.
```

### before `const slot = s.refs.nodes[2].slots[SLOT_N - 1];`

```
The transient: the last slot empties, the counter reads seven of eight for a beat, then the slot
comes back bright as web-0 takes it and the counter goes back to eight. Everything here only replays
what is already pinned above, so a cancel mid-step still lands correctly.
Opacity only, never fill.
DO NOT drive the fill through onfinish handlers: the step's END state then depends on a callback
firing, so a seek or an early cancel leaves the slot showing the transient instead of the pinned
`fresh`. The fill is set once, statically, above the guard, and the motion just takes the slot away
and brings it back. The counter text is the one thing that still rides onfinish, and that self-heals
because the next step calls setSlots and rewrites every counter from scratch.
```

### before `narration: 'Every lever here is about the ceiling and none is about CPU. Fewer volumes per Pod is the cheapest`

```
The closing step, so it deliberately comes to rest: no packet, no pulse, and no block flash either.
```

### poster

```
A request that branches looking for somewhere to go, and a rack of sockets with nothing free at the
end of every branch. The shape is a scheduling decision, which is what makes this card different from
its six siblings: they all start with a Pod that already has a node.

The sockets are drawn DARK (0.03) rather than as bright cells. They are holes, not contents, and a
rack of dark recesses in a barely-lit frame reads as hardware at a glance, where a 0.20 fill reads as
eight grey tiles and flattens the whole lower half into a keypad. Dropping them also frees the
brightest fill for the block the sentence is actually about: the request at the top, the one thing
here that wants something and cannot have it.

The branch is the original part and it is doing real work: one request forks into two candidates, and
both wires run the full way down to the rack, meeting its top edge at x=112 and x=208, so the
decision layer above is fully wired to the hardware below. Everything above the rack is the decision,
everything below it is the machines, and the four dashed wires connect them at one weight so the
whole path from request to socket reads as continuous.

Content sits 13..167 in a 180 tall box, so the canvas margins agree at 13, and it is symmetric about
x=160: rack side margins agree at 15, socket rows and columns are both gapped at 6, and the sockets
clear the rack by 9 above and below.
```

---

## storage-volume-detach-on-node-loss

### before `const LEFT_X = 400;`

```
WHAT  Detach on node failure. A node goes NotReady and its kubelet falls silent. The old Pod cannot
be confirmed dead, so Kubernetes deliberately WILL NOT detach the volume yet: detaching while the old
Pod might still be writing means two nodes writing one filesystem. The stall is a chain of timeouts,
walked one rung at a time on the ladder, and the out-of-service taint is the operator escape hatch
that asserts the node is dead and skips the whole chain.

SCOPE  Held deliberately against storage-multi-attach-error, or the pair reads as one card shown
twice. Both end with one RWO disk moving from one node to another, and the difference is not the
outcome, it is what is being waited on. There, node-1 is HEALTHY and the volume is legitimately held
by a Pod that is legitimately still running: an ordering problem, fixed by ordering (Recreate). Here
nothing is contending for the volume at all. The wait is on DOUBT, because a silent kubelet cannot
confirm its Pod stopped writing. So THIS card owns the unreachable-toleration and force-detach
clocks, the roughly six minutes, the argument that two writers corrupt one filesystem, and the
out-of-service taint. None of those appear on the other card.

LAYOUT  TWO vertical stacks side by side, because the whole story is one disk moving between two
nodes. node-1 and node-2 are equal columns, the shared RWO disk sits on the shelf between and below
them, and the timeout ladder plus the escape hatch form one band across the bottom. The two columns
are deliberately IDENTICAL in width: the only thing that differs between them is which one is
answering, so anything else that differed would read as a difference the card is not about.

CONTENT_CX = LEFT_X + (2*NODE_W + NODE_GAP)/2, and LEFT_X cannot move, so the node tier width is the
ONLY lever on where the diagram sits. It is solved for: 2*188 + 24 = 400 puts CONTENT_CX exactly on
600. NODE_W then sets POD_W (NODE_W - 2*NODE_PAD = 168).

BUDGET  The floor under POD_W is the widest string inside a Pod, the sublabel 'marked for deletion',
a .scheme-pod-sublabel at 10px JetBrains Mono. That class measures 6.03 viewBox units per character,
so the sublabel is 114.6 units and POD_W 152 keeps ~19 units of air either side. The rate is per
class: 11px chip text and dim code labels are 6.89, and 12px box labels are Space Grotesk and
proportional, so they vary by string.

That exactness matters because of the bottom band. The node tier is 400 wide and symmetric about
CONTENT_CX wherever it sits, so on its own it would look fine anywhere. The chip strip does not: at
662 units it is more than half again the width of the node tier, so it is the tier that actually sets
the visual centre.
WHY NOT nodes at 430..1140 and chips at 430..1142: that puts the whole card 186 units right of the
canvas centre with a dead left third. Pulling everything onto 600 makes the strip 269..931 and both
readings agree.

The bottom band does not sit inside the chip strip's edges, for a reason a purely horizontal reading
cannot see: the escape box is a BLOCK, and the only other block below the panel is the disk. Two
blocks are what the low-content check measures, so an escape box parked at 701..931 puts the low half
of the card at 505..931, centre 718, however well the chip strip behaves. It stands on the spine
under the disk it acts on (485..715), which also turns its taint lane into a straight climb into the
disk floor instead of an elbow into the disk's right face.
The ladder and the chips then take one side each, ladder at the left margin (60..440) and chips at
the right (478..1140), so between them the .scheme-chip strip still spans the full 60..1140 and still
centres on 600. Both are pooled into one strip by the check, which is why the ladder can be moved to
balance the chips rather than having to sit under them.

PANEL  Worst step (the escape step, which carries the longest narration), right / bottom by viewport:
  1920x1080 -> 203 / 161    1440x900 -> 319 / 203    1280x800 -> 358 / 236
  1100x800  -> 397 / 255     900x650 -> 398 / 436
So x<=398 and y<=436. LEFT_X 400 has about 2 units of slack and cannot move left at all, and BAND_Y
448 clears the 436 bottom by 12.
DO NOT re-derive either from a single wide-window screenshot, and note that a narration longer than
the ones below invalidates both.
```

### before `const NODE_Y = 48, NODE_H = 160;`

```
The node frames are as wide as the tier allows (192) with a tight 16 gap, so the pair reads as two
substantial machines rather than two thin columns, while 2*192 + 16 still sums to 400 and keeps
CONTENT_CX on the canvas centre. They are also shorter (160): the Pod inside was too tall against the
rest of the storage family, so it drops to the family two-column size (104 tall, App box 44) and the
frame shrinks to hug it, which also makes the frame read as wider. The disk below is 190 wide, wider
than the 16 gap, so it still bridges both columns as one shared volume.
```

### before `const CHIP_W = 210, CHIP_GAP = 16, CHIP_COUNT = 3, CHIP_H = 32;`

```
CHIP_W 210 rather than the family 232. Rendered worst cases, measured in the browser rather than
estimated from a per-character rate (the rate under-reads on strings full of wide glyphs):
  node-1   41 + 'NotReady, tainted'  117 = 158
  volume   41 + 'attached to node-1' 124 = 165
  new Pod  48 + 'ContainerCreating'  117 = 165
So 210 clears the worst pair with 21 units between name and value, which is the floor for the two
halves still reading as separate fields.
```

### before `const LAD_X = M, LAD_Y = 448, LAD_W = 380, LAD_ROW = 38, LAD_GAP = 9;`

```
BUDGET  The ladder rows carry the longest strings on the card, and they are the one place a
per-character estimate is not good enough: the rungs are full of wide glyphs (the separator, the
tilde, the digits), so the longest rung renders 338 units where 6.0 units per character predicts 307.
Measure them. chainList insets its text 10 from the row edge, so LAD_W 380 leaves 32 units of margin
on the worst rung. At 350 that rung clears the row border by 2 units and reads as text jammed against
the frame.
```

### before `const ESC_W = 230, ESC_H = 72;`

```
ESC_W shrinks to 230 to buy the ladder that extra width back: the widest string inside the box is the
sublabel at 175 units, so 230 still leaves ~27 either side. The box is centred on the spine
(485..715), so the gap it keeps is to the ladder's right edge (440), 45 units.
```

### opacity phases (was `const GONE = 0.35`, now OPACITY.*)

```
A Pod that EXISTS and is not yet marked is drawn at full strength and blinks with the ordinary
pulsePod, exactly as the rest of the storage family does.
DO NOT give it a dim 'unknown' state pulsed with pulsePodDim: that stacks an opacity swing on top of
the blink and reads as a faster, busier pulse than the same beat elsewhere in the catalog. The old
Pod being UNCONFIRMED is carried by its sublabel and its chip, not by a faded opacity: not knowing
whether a Pod runs is not a phase of its own.

Being MARKED is a phase, and the card walks the old Pod down the vocabulary in the two steps that
earn it. On evict it pulses at full and then sinks to OPACITY.terminating, because the sublabel
reading 'marked for deletion' IS the Terminating phase, and drawing that at full strength is a
catalog-wide defect. On forcedetach it goes the rest of the way to OPACITY.terminated, and it starts
that fade AT terminating rather than at 1: an animation keyframed from full brightens a marked Pod
back up for one frame before killing it. A Pod at either shade never pulses.
```

### before `const LANE = 22, CORRIDOR_Y = 260;`

```
Each attach lane leaves the disk top LANE either side of the spine and rises to the BOTTOM EDGE of
its node frame, at the frame's exact horizontal centre (A_CX / B_CX), so the two are exact mirrors
about CONTENT_CX and every endpoint is a face midpoint. The lanes stop at NODE_BOTTOM rather than
running on up into the Pod: the disk attaches to a NODE, and the Pod is what runs once the node has
the volume, not the thing the attachment terminates on. CORRIDOR_Y is the clear strip between the
node frames (bottom 238) and the disk (top 282).
```

### before `const DK_RIGHT = DK_X + DK_W, DK_MID_Y = DK_Y + DK_H / 2;   // 695 / 334`

```
The taint lane rises out of the top of the escape box and turns LEFT into the right flank of the
disk, at the disk's vertical midpoint.
WHY NOT approach the disk from underneath: that route crosses y=410, where the disk caption sits
centred on the spine, and a caption up to 20 characters wide reaches x=663, so the lane draws a
dashed line straight through the last word of its own label. Coming in side-on also keeps the whole
lane clear of the ladder, which ends at x=649, and of the node frames, which bottom out at y=238 and
end at x=800, 16 units left of the lane.
```

### before `function podBlock({ x, label, sublabel }) {`

```
Family pulse model. Nothing here ever puts .highlight on the App box either.
```

### before `const nodeA = node({ x: A_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });`

```
node() puts its own label at coordinates RELATIVE to the frame group. Use the primitive: it cannot be
got wrong.
DO NOT hand-roll these frames out of box() and append an absolutely positioned caption into the
translated group: 'node-1' then renders at 874, on top of the other column's App box, and 'node-2' at
1614, past the right edge of the viewBox and therefore invisible.
```

### before `const wAttachA = pathArrow({ points: W_ATTACH_A, dashed: true, dim: false, role: 'storage' });`

```
Both node-disk lanes are built identically, so the mirrored pair reads as the same relationship on
either side, differing only in which node currently holds the volume. Each is a real arrow in the
FULL storage colour (dim: false), not the muted dim variant, so the left lane to node-1 does not read
as a lesser arrow than the right one: they are one colour. wAttachA is shown from the first frame
(the volume starts on node-1) and only its OPACITY drops on force-detach as the attachment is
severed. wAttachB starts hidden and is drawn in when the volume moves to node-2.

NOT A DEFECT  `W_ATTACH_A` is reported as a lane nobody rides, and converting it to a relationPath is
declined. Sinking one half of a deliberately symmetric pair makes the left lane the lesser arrow,
which is the thing this card goes out of its way not to do. Both halves are relationships by nature
here, and the card already says which one is live through OPACITY. Declined for the symmetry, not for
the ridership.
```

### before `[nodeA, nodeB, disk, escape, oldPod.group, newPod.group].forEach(el => root.appendChild(el));`

```
Family z-order, with the bottom band (chips + ladder) above the lanes. The ladder and the packet
lanes do not overlap at all (the lanes live above y=478, the ladder below y=448), so the ladder needs
no exemption from the packet layer.
```

### before `function setChips(s, { nodeA, volume, newPod }) {`

```
Family setChips. On a card built entirely out of state transitions, a chip left unset is how the
volume chip comes to read 'force-detached' on the step that is explaining why nothing has been
detached yet.
```

### before `function setPods(s, { oldSub, newSub }) {`

```
Both Pods carry a sublabel that tracks their state, and like the chips it is written on EVERY step: a
Pod still reading 'Running' three steps after its node went silent is a lie the reader has no way to
catch.
```

### before `s.refs.oldPod.style.opacity = '1';`

```
Through notready and refuse, both node FRAMES and both Pods stay at full strength. node-1 being
unreachable and its Pod being unconfirmed are carried by the chip and the Pod sublabels, not by a
faded opacity: a Pod that might still be running is a Pod that exists, and the family draws an
existing Pod at full. The old Pod leaves full only on evict, where it is marked.

The replacement Pod is the other half of that rule and is not drawn at all until it exists.
DO NOT fade it in on the notready step: no controller could do that, because while the old web-0 is a
live object with no deletionTimestamp, nothing may create a second Pod under that name. It appears on
the evict step, the step that writes the mark, and node-2 stays an empty frame until then.
```

### note (anchor dropped: `s.refs.oldPod.style.opacity = GONE;` is not unique in the file)

```
The old Pod is now assumed dead and the standing attachment to node-1 is severed, so both drop to the
terminated shade. Pinned here, above the guard, so a cancel mid-fade still lands on the right value:
the animation below only eases into what is already set.
```

### before `},`

```
The disk does NOT flash here. It is a static receiver of the detach, shown by its highlight above
plus the sublabel and the volume chip flipping to force-detached. The severing is carried by the two
fades (old Pod and the node-1 attachment lane), which is event enough.
```

### before `s.refs.disk.classList.add('highlight');`

```
The disk is the SOURCE of the attach hop, so it is lit from step entry: a ball must never leave an
unlit block. node-2 is the destination and lights on ARRIVAL, carried by the Pod blink below rather
than a static highlight at entry.
```

### before `s.refs.wAttachB.style.opacity = '0';`

```
Infra reaching a Pod, so down-arrow ordering: the lane draws itself in, the ball leaves after
BEAT.lead so the new attachment registers before anything moves on it, and the Pod blinks on ARRIVAL.
The Pod is already at full strength, so the arrival is carried by the ordinary pulsePod alone: it is
the disk showing up that starts the container.
```

### before `const t = routePacket(s, ctx, W_TAINT, { delay: BEAT.lead, role: 'storage' });`

```
No Pod acts here: the operator does. So there is no pulse, the ball leaves after BEAT.lead so the lit
escape box registers as the source, and the disk lights on arrival rather than at step entry. No
block flash on this, the closing step, which should come to rest.
```

### poster

```
A technical diagram curated to one sentence: a live VolumeAttachment still binds the volume to a DEAD
node, and the move to the live node is gated by a timeout. Two machine frames stand left and right:
the left one is dim with a dark status LED (failed, kubelet silent), the right one is lit with its
Pod still dashed (pending, waiting on the disk). The volume sits between them with the faint 0.04
body fill the rest of the poster cylinders use, so it reads by its jade rim, not as a grey slab.
Both wires LEAVE THE CYLINDER HORIZONTALLY and are identically dashed, then turn up into the node
above: only the badge versus the clock, and the dim versus the lit node, tell the two sides apart. A
small badge carrying an attached:true check rides the left wire to the dead node, the attachment that
has not been deleted, and a CLOCK sits on the right wire to the live node, the roughly six minute
force-detach wait that has to elapse first. The clock is the signature: the whole card is that a
healthy-looking cluster still waits out a timer. Both wires break cleanly around the badge and the
clock so nothing draws through them. Content spans y=28..158, centred.
```

---

## storage-volume-expansion

### before `const CX = 600;`

```
WHAT  Growing a bound volume, in two phases.

CONTENT  The allowVolumeExpansion gate is enforced by the API SERVER on the edit, not by the
external-resizer afterwards. Raising the request on a claim whose StorageClass does not allow
expansion is refused at admission with "only dynamically provisioned pvc can be resized and the
storageclass that provisions the pvc must support resize", so the resizer never sees such a request
at all.
DO NOT have the resizer consult the class before acting: that puts the gate one component too far
downstream and makes a rejected edit look like a resize that quietly declined to run.
CONTENT  The second phase is for FILESYSTEM volumes only. A raw block volume has no filesystem to
grow, so NodeExpandVolume does not apply and the bigger device is visible as soon as phase one lands.
The node-expand narration says so rather than implying every volume needs both halves.
CONTENT  Shrinking: the API refuses a request below the size already provisioned. What newer clusters
do allow is walking a request back DOWN while an expansion is still pending, which cancels a grow
that has not happened yet. That is not shrinking a volume and the narration is worded not to promise
it.

LAYOUT  The centred vertical stack: Pod on top, its claim under it, the real disk on the shelf below,
all three on ONE axis at CX=600. Tier heights and block footprints are the same numbers as
storage-pvc-protection, so the two cards in this subcategory read as one family. The spine is the
mount ascent (disk to claim to Pod) and balls travel it, so its arrowheads are earned.
The vertical pitch is TIER=162 again: 108, 270, 432. What differs from the sibling is that this card
has FOUR actors, placed so that not one lane needs more than a single turn:
  - Slot A, top right at 108, is shared by Kubectl Patch and the StorageClass. They are never on
    stage together (Kubectl acts on the edit and the shrink steps, the class only on the gate step),
    so they occupy one slot and send their ball down ONE lane into the claim.
  - The external-resizer sits right at 432, dead level with the disk, so ControllerExpandVolume is a
    STRAIGHT horizontal into the disk's right edge.
  - Kubelet sits LEFT at 432, mirrored about the spine, so NodeExpandVolume is a straight horizontal
    into the disk's left edge.
The two phases therefore arrive at the disk from opposite sides at the same height, which is the
composition stating the thing the card is about: the control plane grows the device from one side,
the node grows the filesystem from the other, and the disk between them is the one object both touch.
The 234..306 band in the right column is deliberately left empty so the claim lane can drop through
it without crossing anybody.

PANEL  Kubelet sits at x=130, well inside the panel's horizontal reach, and clears it only on the y
axis, at y=396. That clearance was argued from the blanket `y<=300`, which is not a measurement: the
panel bottom is PER CARD and reaches 504 on the longest narration in the catalog. Kubelet is
therefore safe only while THIS card's own bottom stays under 396, so lengthening any narration here
can put the panel over it. Re-measure with `node check-geometry.mjs --rules=occluded`.
The one element placed on a MEASUREMENT is the verdict caption left of the claim, anchored end at
x=464, y=274, reaching back to about x=273 on its longest string. This card's own panel was measured
across viewport widths 1920 down to 900: right peaks at 399 and bottom peaks at 231, both at the
narrow end, so the caption clears that bottom by 43 units. This card runs 30 units LOWER than
storage-pvc-protection, whose same caption measured 201, purely because the node-expand narration is
longer: the bottom is driven by the text, so it is a per-card number and copying a sibling's is not
safe. LENGTHENING ANY NARRATION HERE INVALIDATES THE 231.
```

### before `const mountLbl = text({ class: 'scheme-label code dim', x: MOUNT_LBL_X, y: MOUNT_LBL_Y, 'text-anchor': 'start'`

```
Lane captions, blank at build and filled per step by setWire. The verdict slot reports the state of
the CLAIM, which changes kind across the card, so it is named for its job rather than for a lane, and
it sits hard against the claim instead of beside a lane it does not describe.
```

### before `const CHIP_W = 252, CHIP_GAP = 24;`

```
A centred four-chip strip, derived rather than hand-placed. These four are the whole lesson: they
hold the same number at the start, then change ONE AT A TIME in order, so the staggered highlight
walking left to right IS the two-phase story.
```

### before `[pvc, kubectl, klass, resizer, kubelet, disk].forEach(el => root.appendChild(el));`

```
Family z-order, with the Pod above the axis that ends on its edge.
```

---

## storage-volume-mode

### before `const LEFT_X = 400;`

```
WHAT  The sibling of storage-access-modes: accessModes and volumeMode are the two spec fields that
sit side by side on both the PV and the PVC, and this card is the second half of that pair. Where
access modes answer WHO may hold the volume, volumeMode answers WHAT the workload is handed.

LAYOUT  TWO vertical stacks side by side inside ONE node, because the fork this card is about happens
on the node, in kubelet and the CSI node service, and not in any control-plane controller. Two Pods
on top, the node service as a full-width band under them, and the two backing disks on the bottom
shelf. The disks are deliberately identical (same size, same class, same backend): the only thing
that differs between the columns is the one field, so anything else that differed would muddy the
comparison.

Every tier (node, band, disk shelf, chip strip) shares ONE centre, CONTENT_CX. CONTENT_CX works out
to LEFT_X + NODE_W/2, and LEFT_X cannot move, so NODE_W is the ONLY lever on where the diagram sits.
It is solved for: NODE_W 400 puts CONTENT_CX exactly on 600.
That exactness matters because of the chip strip. Every tier is symmetric about CONTENT_CX, so at any
CONTENT_CX the diagram is internally symmetric and the narrow tiers look fine wherever they sit. The
strip does not: at 976 units it is more than twice the width of the node above it, so it is the tier
that actually sets the visual centre.
WHY NOT NODE_W 456, giving CONTENT_CX 628: the strip then spans 140..1116, so 140 units of margin on
the left against 84 on the right. Symmetric about the diagram, visibly shoved right on the canvas.
At 600 the strip is 112..1088 and the two readings agree, so do not widen NODE_W back without
re-checking the strip margins.

BUDGET  POD_W falls out of NODE_W: 2*POD_W + POD_GAP = NODE_W - 2*NODE_PAD = 368. The floor under
POD_W is the widest string inside a Pod, the sublabel 'volumeMode: Filesystem' at 133 units, so
POD_W 164 keeps ~15 units of air either side. POD_GAP takes the remainder.

PANEL  Worst step, right / bottom by viewport:
  1920x1080 -> 203 / 193    1440x900 -> 319 / 242    1280x800 -> 358 / 282
  1100x800  -> 397 / 304     900x650 -> 398 / 498
So x<=398 and y<=498, the deepest panel in the catalog. LEFT_X 400 has about 2 units of slack and
cannot move left at all. The 498 also pins the disk shelf: the left cylinder starts at x=410, which
clears the panel by only 12 units at 900x650, so PV_W cannot grow leftward either.
DO NOT re-derive any of this from a single wide-window screenshot.

LANES  Every hop is a straight vertical run inside a column, and each direction has its OWN lane
offset LANE around the column centre, so a mount rising into a container never re-uses the arrow the
request came down.
```

### before `const BAND_LBL_Y = 408;`

```
BUDGET  The band caption sits between the band and the disk shelf, centred on CONTENT_CX, so it runs
through the corridor between the two columns. The nearest lanes are the inner ones at 510 and 690,
which leaves 180 units of clear width, and 11px JetBrains Mono measures 6.9 units per character
(measured: 'raw, unformatted' renders 110.2 units over 16 characters). So a band caption has a hard
ceiling of 26 characters. Overrun it and the first and last letters sit on a lane arrowhead, which is
how two captions shipped before this was written down.
```

### before `const PV_Y = 442, PV_H = 96, PV_W = 176;`

```
The disks are centred under their own column, so every lane in a column is one straight vertical run.
Column separation is POD_W + POD_GAP = 204, so PV_W has to stay under that or the two disks touch.
PV_W 176 leaves a 28 unit gap (410..586 and 614..790), enough that they read as two objects rather
than one wide shelf, and it keeps the left disk starting at 410, the clearance the panel needs.
```

### before `const CHIP_W = 232;`

```
Family chip width. Worst cases, in viewBox units:
  node does  62 + 'no mkfs, no mount'  117 = 179
  container  62 + 'device /dev/xvda'   110 = 172
  volumeMode 69 + 'Filesystem'          69 = 138
  fsGroup    48 + 'not applied'         76 = 124
232 clears the worst pair with ~29 units between name and value.
```

### before `const LANE = 12;`

```
Each direction of each hop gets its own lane, offset LANE around the column centre, so a ball never
rides an arrow drawn for the opposite direction.
```

### before `function podBlock({ x, label, sublabel, ctr, ctrSub }) {`

```
Family pulse model. What a Pod must NOT have is a lingering state: no .highlight is ever put on the
container box.
DO NOT split the shell into its own wrapper to keep the pulse off the container: the Pod then blinks
around a dead rectangle, which reads as the container being excluded from whatever the Pod is doing.
The problem was never the pulse, it was the highlight left behind.
```

### before `[nodeBox, band, pvFs, pvBlk, podFs.group, podBlk.group].forEach(el => root.appendChild(el));`

```
Family z-order, with the Pods above their node container.
```

### before `function publishUp(s, ctx, { podEl, points, tag, lead = BEAT.lead }) {`

```
The node service hands the volume up into the container. Semantically this is infra reaching a Pod,
so it takes the down-arrow ordering: the packet flies first and the Pod pulses on its arrival. The
container box is never lit, here or at step entry.
```

### before `setChips(s, { mode: 'Block', nodeDoes: 'no mkfs, no mount', container: 'device /dev/xvda', fsgroup: 'not appli`

```
The chips still report the Block column, unchanged from the previous step.
DO NOT put 'immutable' in the volumeMode chip: that makes the chip contradict its own name, because
the mode is Block and immutability is a property of the field, not a value it can hold. That fact
lives in the narration and the band caption instead.
```

### before `s.refs.pvFs.classList.add('highlight');`

```
The summary step compares the two columns, so BOTH disks light. Static highlight only, and
deliberately no motion at all: this is a closing step the reader is meant to sit and read, and the
two disks are the comparison, not an event. A flash here also blinks the disks a beat after the
narration has already moved on to fsGroup and subPath, which points at nothing.
```

### poster

```
Two columns, one difference. The whole poster is an ASYMMETRY between two otherwise identical stacks:
same container on top, same disk at the bottom, and the only thing that differs is what happens on
the way down. The left lane is interrupted by a gate (the mkfs the node service runs) and its disk
carries file lines, because there is a filesystem in it now. The right lane runs straight through,
dashed and unbroken because nothing acts on it, and its disk is left empty. The empty right-hand disk
is load-bearing: the point of Block is the absence.
WHY NOT a fork out of one object: these are two separate claims, so drawing them as one splitting
would say the wrong thing, and it would collide with the reclaim-policy poster below, which IS a fork.
File lines are inset inside the cylinder FACE (below the cap rim at 118, above the bottom arc at
160), not centred on the bounding box, or they ride up over the rim.
Column centres are 88 and 232.
WHY NOT 70 and 250: the two stacks then sit against the left and right edges with a dead 96 unit
corridor between them, so the poster reads as two unrelated drawings rather than one comparison.
Pulled in to a 60 unit gap against 46 unit outer margins, which puts more air outside the pair than
inside it and makes them read as a pair. The asymmetry between the columns is the content, so the
spacing has to stay symmetric or it competes with it.
```

### before `const W_BLK_STAGE = laneDown(BLK_CX, BAND_BOTTOM, PV_TOP);`

```
NOT A DEFECT  `W_BLK_STAGE` is reported as a lane nobody rides, and it is the strongest case of that
family: block mode has NO staging step. There is no mkfs and no mount, which is the entire contrast
the card is built on, so the lane exists to be visibly empty beside the fs branch that uses its twin.
Its sibling `W_FS_DEV` was on the same finding and is now ridden, because the fs branch really does
get the formatted device back.
```

---

## storage-volume-model

### before `const SPINE_X = 600;`

```
WHAT  THE ANCHOR CARD of the storage category. A VERTICAL STACK centred on the canvas: the consumer
(a Pod holding two containers) on top, the backing volume as a disk on the shelf below, and the
recurring gesture is a MOUNT travelling the lane between a container and the disk.

CONTENT  The point of the card is OWNERSHIP. A volume is declared ONCE at spec.volumes (Pod level)
and each container mounts it at volumeMounts, possibly at a different path. The volume belongs to the
POD, not to any container, so it survives a container crash and is shared between containers, and it
dies only when the Pod dies.

LAYOUT  The Pod sits BELOW the panel (measured at (335, 143) for this card, Pod top at 150 clears
it), which frees the full canvas width: the Pod is stretched to 600 and the two containers are pushed
toward its edges, so each container centre lands OUTSIDE the cylinder span. That is deliberate: the
mount lanes are L-shaped, dropping straight from a container and entering the cylinder through its
SIDE, symmetric left and right about the ownership spine.

LANES  The centre OWNERSHIP SPINE (x=SPINE_X, dim, no arrowhead) links the Pod to its volume, because
ownership is a relationship, not traffic. The two L-shaped MOUNT LANES are brighter bare channels
that carry a ball in whichever direction the step needs (mount out, write in, read out), so the ball
shows direction. Balls ride routePacket (eased, routeDur speed) and every riding label shares the
same points, duration and easing so it stays glued to its ball.

MOTION  HIGHLIGHTS ARE STEP-STATIC: every block a step uses lights at step entry (above the reduced
guard) and stays lit for the whole step, and the Pod pulse fires at the same instant, so pulse and
highlights land in one beat. The balls only illustrate the traffic, they do not drive highlight
timing. Step 1 (declare) is the exception: the Pod is not acting, so only the volume lights.
```

### before `const LANE_DX = 10, LANE_DY = 10;`

```
Balls travel BOTH directions, so each side carries a PAIR of one-way L-shaped lanes, offset LANE_DX
around the container centre (the pair is centred on its block) and LANE_DY around the cylinder
midline so the horizontal runs do not overlap. Each lane has its own arrowhead showing its one
direction: the UP lane points into the container (mount, read), the DOWN lane points into the
cylinder side (write).
```

### before `s.refs.volume.classList.add('highlight');`

```
Only the app and the volume are involved (the log shipper is untouched), so those two light for the
whole step, static highlight only, and the Pod pulses with them, one beat.
DO NOT add a crash flicker: too blinky.
```

### before `setChips(s, { vol: 'gone with Pod', mounts: 'unmounted', data: 'lost' });`

```
The Pod and its volume are gone. The chips flip to gone / unmounted / lost and the whole stack (Pod,
volume, lanes, spine, ownership label) settles to a ghost so the picture matches the words. Ghost
opacities are pinned statically so reduced motion and a mid-step cancel land on the dimmed state, and
the fade below only eases into it.
```

---

## storage-volume-snapshot

### before `const CX = 600;`

```
WHAT  The snapshot API mirrors the volume API exactly: VolumeSnapshot is the namespaced request (like
a PVC) and VolumeSnapshotContent is the cluster-scoped object it binds to (like a PV). The snapshot
data physically lands BESIDE the source volume, in the same storage system, which is exactly why a
snapshot is not a backup.

CONTENT  Who does what, and in which order, is the part most diagrams get wrong. TWO components are
involved and they are not the same thing (kubernetes-csi docs, snapshot-controller and
external-snapshotter):
  snapshot-controller   one per cluster, shipped independently of any CSI driver, "watching the
                        Kubernetes API server for VolumeSnapshot and VolumeSnapshotContent CRD
                        objects". In dynamic provisioning it is the component that CREATES the
                        VolumeSnapshotContent object and binds it one to one, and that creation is
                        what "triggers the CSI external-snapshotter sidecar".
  csi-snapshotter       the sidecar next to the driver. From v4.0.0 it "only watches the Kubernetes
                        API server for VolumeSnapshotContent CRD objects", never the VolumeSnapshot,
                        and it is "responsible for calling the CSI RPCs CreateSnapshot,
                        DeleteSnapshot, and ListSnapshots".
So the object exists BEFORE the snapshot is taken, and the sidecar never reads the user request.
DO NOT have the sidecar pick up the VolumeSnapshot itself and write the Content afterwards carrying
the handle: that inverts both the actor and the causality.

LAYOUT  Three bands, every one centred on CX, and the widest of them (the chip strip at 112..1088)
sets the margins the rest answer to:
  top    the two objects the USER writes: VolumeSnapshot snap-1 centred on CX, and the restore claim
         beside it on the right, joined by the dataSource reference. The top-left is unusable, so the
         request box starts at x=420 and the pair leans right, which balances the panel rather than
         fighting it.
  middle the control plane, RIGHT TO LEFT in the order the story runs: the controller that creates
         and binds (940), the object it creates (600), the sidecar the object wakes (260). 232 wide,
         the family default. The direction is not a preference, see PANEL.
  bottom the storage backend, holding all three disks so the shared-fate point is made by the picture
         rather than by the caption: source, snapshot, restore, left to right in the order they exist.
The Content sits on CX so the two lanes it shares with the request run as one straight vertical on
the centre line of both blocks, and the snapshot disk sits on CX under it so the CreateSnapshot
zigzag lands on that same line.

Every horizontal run of every zigzag sits at the MIDPOINT OF THE TWO BLOCKS IT JOINS, and both frame
insets are equal, so the whole column is symmetric and nothing is pinned to a free gap:
  36    canvas top margin
  36    VolumeSnapshot request and restore claim   68 tall, to 104
  157   request corridor                          53 below the request box, 125 above the mid row
  282   middle row                                68 tall, to 350
  378   CreateSnapshot corridor                   28 below the mid row, 18 above the frame
  396   storage backend frame                     174 tall, to 570
  438   disks                                     90 tall, to 528, frame insets 42 above and below
  552   disk captions                             18 above the frame floor
  588   chip strip                                34 tall, to 622
  18    canvas bottom margin
The middle row and everything under it sits 72 units lower than the centred midpoints would put it,
which is why the two corridors are pinned rather than halved: the request corridor stays at 157 (see
PANEL) and the CreateSnapshot corridor is placed 18 above the frame rather than halfway, because
halfway is 373, five units from the frame edge.

PANEL  Measured, panel bottom-right in viewBox units:
  1920x900  right 102  bottom 163      1600x1000 right 291  bottom 143
  1440x1080 right 335  bottom  94      1280x900  right 378  bottom 152
  1100x900  right 397  bottom 149      1280x860  right 397  bottom 280
  1100x800  right 397  bottom 280
The last two rows are the ones that matter, and they are 117 units deeper than anything the taller
sample sees, because a SHORTER window (860 and 800 tall against 900 and 1080) shrinks the diagram
while the panel keeps its pixels. Those are the viewports the occlusion rule samples. Worst case
x<=397 and y<=280. Two things follow, and together they are the whole shape of this card:
  1. The middle row is three 232 wide boxes on one line, so its LEFT box lands at 144..376 whatever
     the spread. At y=210 that box is 100 percent behind the panel. The row therefore starts at 282,
     below the floor, and the frame and disks move down with it.
  2. The request from the top row has to REACH that left box, and any lane going there from above
     crosses the panel band on its way. So the chain runs RIGHT TO LEFT: the controller, the one box
     the request addresses, sits at 940 where the lane can reach it in the clear, and the content and
     the sidecar follow leftward. The request corridor can then stay at 157, where only the viewports
     with a SHALLOW panel reach right of it.
The request box at y=36 sits inside the y band, so it starts at x=420, clear of the widest measured
panel by 23. A longer narration invalidates all of this.

MOTION  Nothing pulses and nothing blinks: there is no Pod. The class step carries no packet, and the
canon would allow it the one sanctioned block blink so it does not read as frozen. It deliberately
does not take it: that step states a fact rather than moves something.
DO NOT add it back.

LANES  Three of them are zigzags (down, across, down) and all three are drawn symmetric, with the
horizontal run exactly halfway between the block it leaves and the block it enters: the request into
the controller (53 and 53), CreateSnapshot down into the snapshot disk (60 and 60), and the answer
back up out of that disk (60 and 60). The answer lane is the create lane mirrored: same corridor,
same columns, opposite arrowhead, and it leaves through the TOP of the disk rather than a side face.
The two never appear in one step, which is what makes sharing the corridor safe, and the same is true
of the two lanes that meet the request box from below.
The ONE remaining link that carries no ball is the dataSource reference across the top band, dashed
and undirected because it is a reference and not a route. The binding between the request and its
content is stated by the request sublabel and the Content chip instead of by a line: an undirected
dashed line hanging under the request box, in the same column two directed lanes use on the steps
either side of it, reads as a third route that never runs.
```

### before `const RST_X = 840, RST_W = 240;`

```
The restore claim is a user-authored object exactly like the snapshot request, so it belongs in the
same band rather than down among the controllers. Sitting beside snap-1 also turns its dataSource
into a 60 unit horizontal reference between two adjacent boxes, which is the shortest honest way to
draw "this claim names that snapshot".
```

### before `const CYL_W = 176, CYL_H = 90;`

```
The disks sit DEAD CENTRE in the backend frame: one inset used both above and below, so the frame is
sized from its contents rather than typed. The top band carries the frame label (node() puts its
label baseline 18 below the frame top) and the bottom band carries the disk captions, and the two
bands come out the same height, which is what makes the frame read as a container rather than as a
box with its contents pushed up. FRAME_Y is then the one number that positions the whole backend, and
it is set so the CreateSnapshot corridor clears the frame edge.
```

### before `const CORRIDOR_Y = FRAME_Y - 18;                            // 378`

```
The horizontal run of a zigzag belongs at the MIDPOINT OF THE TWO BLOCKS IT JOINS, and each corridor
here is pinned instead, to what it must not touch:
  CORRIDOR_Y     18 above the frame edge, so the lane and the frame do not read as one doubled dashed
                 line. That clearance is FRAME_INSET / 2. The midpoint of the mid row bottom (350)
                 and the disk top (438) is 394, which is INSIDE the frame, so the midpoint rule
                 cannot be kept here: the gap it would halve is 28 units of gap and 60 of frame inset.
  REQ_CORRIDOR_Y 157, 53 below the request box and 125 above the mid row. It runs RIGHT to x=940, so
                 the panel does not reach it at all. Running LEFT to x=260 it cleared every measured
                 panel floor but the tag riding it would not, which is why that hop still rides its
                 label BELOW the ball (dy 22). The offset is kept because it also keeps the tag off
                 the request box floor, which the ball leaves from.
```

### before `const CAPTION_Y = CYL_Y + CYL_H + 24;             // 552`

```
The disk captions sit BELOW the disks, inside the frame.
DO NOT put them above: they collide with the tag riding the CreateSnapshot hop, which lands on a disk
top, and the two strings print over each other into one unreadable smear. 24 below the disk leaves 18
to the frame floor.
```

### before `const W_REQ_CTRL  = [[CX - REQ_LANE, REQ_BOTTOM], [CX - REQ_LANE, REQ_CORRIDOR_Y], [CTRL_CX, REQ_CORRIDOR_Y], [CTRL_CX, MID_Y]];`

```
The two lanes that touch the request box bottom face are a mirrored pair, 16 either side of its
centre. They ran dead centre while the request went down the middle of the card and the status came
back up the same middle: they never shared a step, so neither needed a lane of its own. Now the
request turns right to reach the controller at 940 while the mirrored status still climbs straight
out of the Content at 600, so the two would sit on top of each other for the whole run between the
request floor and the corridor. 16 is small enough to read as one column with two directions and, at
7 percent of a 232 wide face, still counts as centred on the Content top face at the other end.
```

### opacity phases (was `const PLACEHOLDER = 0.4`, now OPACITY.pending)

```
Family rule: an object a lane already points AT but which has not been created yet is drawn dim, not
hidden. Hiding it leaves the arrowhead aimed at blank canvas for the whole flight, which reads as a
rendering fault rather than as an absence.
```

### before `const CHIP_W = 232, CHIP_GAP = 16;`

```
Family chip width. Worst case here is 'snapshotHandle' + 'snap-0c41' at 23 characters, so
23 * 6.89 + 24 of padding is 183 against the 232 available.
```

### before `[frame, req, restore, ctrl, vsc, snapper, src, snapData, restored].forEach(el => root.appendChild(el));`

```
Family z-order, with the backend frame behind the blocks it holds.
```

### before `function setStage(s, { vsc = OPACITY.pending, restore = 0, snapData = OPACITY.pending, restored = OPACITY.pending, ds = 0, lanes = [] } = {}) {`

```
Family setStage, lanes included.
The three objects that live INSIDE a structure default to OPACITY.pending: the content in the middle
row and the two disks that do not exist yet in the backend frame. Hiding them leaves a block-sized
hole in a row and a frame three quarters empty around one floating disk. The restore claim is the
exception and stays at 0, because the top band holds nothing else on that side, so its absence leaves
no hole to explain.
```

### before `duration: 5200,`

```
Three chained hops: the content waking the sidecar, the CreateSnapshot call down into the backend,
and the copy taken on the shelf once the target has materialised. Routes are length-based, so
re-measure with anim-dump after ANY geometry change here.
```

### before `s.refs.snapData.classList.add('highlight');`

```
The snapshot data is where the answer departs from, so it is lit at entry. The controller is lit for
the whole step because the last hop, the status mirrored onto the snapshot, is its work: the ball
runs straight up the bound column rather than detouring through the block.
```

### poster

```
One volume with one instant lifted off it. The SAME cylinder is drawn twice on the x=160 axis: whole
and live below, a thin frozen slice of it above, joined by a dashed riser on the axis. Both bodies
are the same width because it is one volume seen twice, not two volumes, and the slice carries the
brightest fill on the poster because it is the thing the card is about. Four elements and one line,
which is the whole poster: no frame, no API objects, no restored disk.

Deliberately VERTICAL, because storage-pvc-clone is the horizontal pair (two disks side by side with
a copy running between them) and the two cards sit in the same subcategory row. A clone is a second
disk, a snapshot is a moment of the same disk, and the two posters have to say that apart at 200
units wide.
Mirror-symmetric about x=160, bodies 132 wide with 94 of margin a side: sized to sit level with the
disks on the neighbouring posters rather than to fill the frame, because at 168 wide it outweighed
every card around it in the row.
```

---

## storage-volumeattachment

### note: the backend is named but not drawn, on purpose

NOT A DEFECT. The `status` and `detach` steps say "when the backend confirms the attach" and "only
when the backend has detached", and this card draws no storage-backend block. Both are subordinate
time clauses rather than the visible action of the step, so the reader is not being pointed at a
missing box. Do not file these again.

### before `const M = 60;`

```
WHAT  The point of the card is WHO owns the attach. Not the Pod, not kubelet: the attach and detach
controller inside kube-controller-manager writes a VolumeAttachment, the external-attacher watches it
and calls ControllerPublishVolume, and on success stamps status.attached true back onto the same
object. Kubelet is blocked on that one field the whole time. Deleting the object is what triggers
detach. So the composition puts the whole control-plane chain in ONE column and the node in the
other: every arrow that crosses between them is a read or a write of the object, which is exactly the
relationship the card is about.

PANEL  Worst step, right / bottom by viewport:
  1920x1080 -> 203 / 146    1440x900 -> 319 / 183    1280x800 -> 358 / 213
  1100x800  -> 397 / 205     900x650 -> 398 / 344
So x<=398 and y<=344: a rectangle over the TOP-LEFT quadrant only. A narration longer than the ones
below invalidates these numbers.

LAYOUT  That is an L-shaped usable area, and this card uses the L:
  TOP BAND     y 24..420, x 400..1140. Everything the panel forbids lives here, running flush to the
               right content edge.
  BOTTOM LEFT  x 60..400, y >344. Free. The disk lives there.
  CHIP STRIP   the full content band 60..1140, so the widest tier is also the canvas-centred one.
WHY NOT read the L as a box, pinning the diagram to x>=400 AND keeping it centred on the canvas: that
forces BAND_W to 400 and leaves the two columns 176 wide, squeezed into the middle third of a 1200
unit canvas under a 980 unit chip strip. The card looks like it is rationing space it has plenty of.
Using the L buys 340 units, which go into the blocks (176 to 232 wide) and the corridor between the
columns (48 to 208), so the card is roomier BOTH inside the boxes and between them.

Moving the disk out from under the columns is not only a space fix. The disk is REMOTE storage that
has to be attached to a node, and drawing it directly beneath node-1 quietly says it is already local
to it. Off in its own corner, with a long ControllerPublish call reaching across the whole card to
get to it, the picture says what the narration says.

BUDGET  BOX_W / BOX_H are storage-csi-architecture's block size, which is the size the catalog reads
as a "server" box: its Kube-apiserver, CSI controller driver and Cloud storage API are all SIDE_W
232, and its rows run 68 to 76 tall. Matching it is what makes this card sit in the same family, and
it is a SIZE match only: the spacing between the blocks is this card's own.
It also clears the widest string inside a right-column box, the sublabel 'watches VolumeAttachment'.
That is a .scheme-box-sublabel at 10px JetBrains Mono, 6.03 units per character, so the sublabel is
144.7 units and BOX_W 232 leaves 43.6 units of air either side, against 15.6 at the old width.
DO NOT mix the per-class rates: 10px mono sublabels are 6.03, 11px mono chip text and dim code labels
are 6.89, and 12px Space Grotesk box labels are proportional (6.0 to 6.7 depending on the letters).
```

### before `const LEFT_X = 400;`

```
LEFT_X is the panel wall: 398 measured, 400 taken, and it cannot move left. The node frame hangs off
it, and the control-plane column is right-ALIGNED to CONTENT_R rather than sized to fill, so the top
band and the chip strip share a right edge while the blocks stay at BOX_W.
```

### before `const NODE_Y = 24, NODE_H = 396;                         // 24..420`

```
node-1 is drawn as a real node() frame rather than left implicit, because "this disk is on THAT node"
is the whole claim the VolumeAttachment makes, and a card about it with no node on screen makes the
reader supply the most important half. Pod on top, kubelet at the bottom, and the gap between them is
where the mount lane runs.
The Pod is 226x110, the catalog Pod size (storage-csi-attach-mount uses it for both of its Pods). A
Pod is a shell around an inner box, so it is the one block that does not take BOX_H. Kubelet takes
BOX_H, but its WIDTH follows the Pod rather than BOX_W: the two are stacked on the same centre line,
so at 232 against 226 their edges miss by 3 units a side, which reads as a rendering slip rather than
as two different sizes. Six units is invisible between columns and glaring within one, so the node
column aligns to itself and the control column keeps BOX_W.
```

### before `const ROWS = 3;`

```
Read top to bottom the control-plane column is the causal order: the controller decides, the object
records, the attacher acts. Every hop inside this column is therefore a straight vertical run and
nothing crosses. Its bottom edge is pinned to the node frame's, so the two columns are one band and
the lane that leaves the attacher for the disk clears BOTH of them at the same height.
All three are BOX_H, and the ROW GAP is solved rather than typed: three equal blocks spread across
the node frame's exact vertical span, top edge on its top edge and bottom edge on its bottom edge,
which leaves 84 units between rows. Nothing here is hand-placed, so changing BOX_H or the frame
height re-solves the column instead of stranding one row.
```

### before `const DISK_W = 200, DISK_H = 114;`

```
Sits in the quadrant the panel leaves free (x<400 needs y>344). DISK_Y 400 clears that by 56, and the
caption above it at 386 clears it by 42. It is 200x114 rather than 152x96: it is the only object on
its side of the card, so it carries that side on its own.
```

### before `const DISK_LBL_Y = DISK_TOP - 14;                        // 386`

```
The caption goes ABOVE the disk, not below it. Below is where the ControllerPublish lane runs, and
under that is the chip strip: there is no room for a text line between them that is not sitting on
one or the other. Above, the whole strip from the panel floor to the disk cap is empty.
```

### before `const CHIPS_Y = 592, CHIP_H = 34;                        // 592..626, 14 clear of the viewBox`

```
ONE width for all four chips, and the strip spans the card's own margins, CONTENT_L..CONTENT_R.
WHY NOT run it from the DISK's left edge (130) to the control column's right edge (1140), on the
argument that both ends are then real block edges and the strip cannot drift if a column moves: that
is true and it is still the wrong span, because 130..1140 has its centre at 635, and the chip strip
is the one tier on any card that is free to sit on the canvas centre, since nothing above it
constrains it. The 70 units it gains on the left are exactly the empty bottom-left corner the old
span left behind, and CHIP_W grows with them.
Measured worst cases, in viewBox units, .scheme-chip-text at 6.89 per character:
  status.attached  103.4 + 'no object' 62.0 + 24 inset = 189.4   <- the binding one
  VolumeAttachment 110.3 + 'deleted'   48.2 + 24 inset = 182.5
  disk on node-1    96.5 + 'yes'       20.7 + 24 inset = 141.2
  kubelet           48.2 + 'released'  55.1 + 24 inset = 127.3
The strip's width sets the chips', so this is the number to re-check whenever it moves: CHIP_W falls
out at 258, which clears the binding pair with 69 units between name and value. It is the floor that
matters, not the exact value: below ~190 the longest name and value would touch.
```

### before `const LANE = 40;`

```
Each direction of the VolumeAttachment conversation gets its OWN lane, offset LANE around the column
centre, so the status write never rides the arrow the watch came down. The wider column lets LANE
grow 26 to 40, which is what makes the watch and the status write read as two lanes at a glance
rather than as one thick one.
```

### before `const PUBLISH_JOG_Y = DISK_BOTTOM + 32;                  // 546`

```
The publish call runs the whole width of the card, which is the point: the attacher is talking to a
storage backend that is nowhere near the node. Its horizontal leg is hung BELOW the disk rather
than above it, because above it there is no room: the disk cap is at 400 and both columns end at
420, so a lane between them would be drawn through the node frame. A ridingLabel sits 14 above its
ball, so 'ControllerUnpublish' rides at 532 on this leg, 18 clear of the disk face and 60 clear of
the chip strip. Derived from DISK_BOTTOM, so the lane follows the disk if the disk moves.
```

### before `const W_GATE    = [[COL_R_X, VA_CY], [CORRIDOR_X, VA_CY], [CORRIDOR_X, KUBE_CY], [KUBE_RIGHT, KUBE_CY]];`

```
The only lane that crosses the corridor: the object gating the node. It leaves the VolumeAttachment
at its vertical middle, runs down the corridor at CORRIDOR_X, and enters kubelet from the right,
while W_ONNODE enters from below. Nothing else uses the corridor, so this route crosses no other wire
anywhere on the card, and neither does any other lane: the card has zero wire crossings.
```

### opacity phases (was `const DISK_DIM = 0.3`, now OPACITY.*)

```
The disk stays on canvas after the detach because it still exists in the backend, it is just no
longer on this node, so it dims rather than leaving. That is a STATE, not a placeholder, which is why
it is the one dim left on this card.
DO NOT sit the Pod at 0.5 for five of the seven steps as a stand-in for "not started yet": a block
held at half strength next to full-strength neighbours reads as a rendering fault rather than as a
state. The Pod is simply present, and it leaves the canvas entirely on the step where the narration
says it is gone.
```

### opacity phases (was `const VA_PLACEHOLDER = 0.45`, now OPACITY.pending)

```
The same dim, for the same reason, on the VolumeAttachment box: on the steps where the object does
not exist (before the controller writes it, and after it is deleted) the box stays drawn as a slot
rather than vanishing. At full strength it would contradict the narration, and at zero it leaves a
block-sized hole in the middle of the control column. Dim is the third answer: the reader sees where
the object goes, reads 'not created yet' under it, and watches it come up to full on write.
```

### before `function fadeTo(el, ctx, from, to, delay = 0, dur = LAND_MS) {`

```
The mirror of lightBoxAt for everything that arrives or leaves rather than lighting: a construction
materialising, the Pod going away, the disk coming off the node. Under ctx.reduced it snaps to `to`,
which is what keeps a prev/reset replay landing on the correct static state.
```

### before `function podBlock() {`

```
Family pulse model. No .highlight is ever put on the App box.
```

### before `const nodeBox = node({ x: COL_L_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });`

```
NAMING  Block LABELS capitalize the FIRST word only, and a later word takes a capital only when it is
an API object, an acronym or an identifier. A HYPHENATED name likewise capitalizes only its first
segment, since it is one identifier rather than a phrase (External-attacher is the name of one
binary). Bare identifiers keep their real casing: va-7f, web-0, vol-1, and node-1, which
.scheme-node-label uppercases to NODE-1 in CSS. That uppercase form is catalog-wide and every node
frame in every card carries it, so it is left alone here: a card-local override would make this the
one node that is titled differently. Sublabels and narration stay lowercase prose, so kubelet is
Kubelet on the box and kubelet in a sentence.
```

### before `const diskLabel = disk.querySelector('.scheme-cylinder-label');`

```
Family cylinder-label re-centring, derived from DISK_H rather than typed as a literal 58, so it
follows the disk if the disk is resized.
```

### before `const wWrite = mkWire(W_WRITE), wWatch = mkWire(W_WATCH);`

```
The four lanes that BELONG TO the VolumeAttachment: written by the controller, read by the attacher,
written back by the attacher, and read by kubelet. They live and die with the object (see setBorn),
because a lane into an object that does not exist is a lane to nowhere.
```

### before `const wMount = mkWire(W_MOUNT);`

```
The mount lane is the exception: it is the lane INTO the Pod, so it belongs to the Pod and is pinned
by the same flag. When the Pod leaves on the detach step the arrow that fed it has nothing left to
point at, and an arrowhead aimed at empty canvas reads as traffic to a block the reader has simply
failed to spot.
```

### before `va.style.opacity = String(OPACITY.pending);`

```
BORN MID-STORY, but the SLOT is drawn the whole time. The VolumeAttachment does not exist until the
controller writes it on step 3, and the whole card turns on that, so the object cannot be at full
strength in the opening frame while the narration says "no such object exists". Removing it outright
is worse: it leaves a block-sized hole in the middle of the control column. So the box is drawn at
OPACITY.pending, the same dim the disk uses for "exists but not here", with the sublabel saying 'not
created yet'.
Its four LANES are the part that genuinely goes away: an arrow into an object that does not exist is
an arrow to nowhere, and unlike the box it leaves no hole when it is gone. So the two are pinned
separately, and the write step brings them up together.
```

### before `const writeLbl = text({ class: 'scheme-label code dim', x: COL_R_CX + 12, y: (ADC_BOTTOM + VA_TOP) / 2 + 4, 't`

```
BUDGET  Only two static wire captions, and both sit where there is measured room for them. The write
caption is anchored 12 right of the W_WRITE lane, in the gap between the controller and the object,
so it has 1140 - 1002 = 138 units, 20 characters at 6.89. The disk caption is centred on the disk in
the empty strip above it: its longest string is 35 characters, 241 units, which centred on DISK_CX
spans 110..350 and clears both the left margin and the node frame.
Everything else the traffic needs to say is carried by a ridingLabel instead: the inter-row gaps in
the control column cannot hold a static caption without it landing on a lane arrowhead.
```

### before `[nodeBox, adc, va, att, disk, appPod.group, kube].forEach(el => root.appendChild(el));`

```
Family z-order, with the Pod and kubelet above their node frame.
```

### before `function setChips(s, { va, attached, disk, kubelet }) {`

```
Family setChips. On a card whose whole subject is one object changing state, a chip left unset is the
fastest way to tell the reader a lie: the strip has to be readable as the object's current record on
any step you pause on.
```

### before `function setBorn(s, { object = OPACITY.pending, lanes = 0, pod = 1 } = {}) {`

```
Family setBorn. The object and its four lanes share ONE flag because they are one construction, and
the Pod carries its own because it is present from the first frame and leaves on the last.
```

### before `narration: 'It is not Kubelet that decides a volume needs attaching. The attach and detach controller runs inside kube-controller-manager, sees a Pod bound to a Node with a volume that is not attached there, and takes ownership of making it happen.',`

```
NO pulse here, deliberately.
DO NOT blink the Pod on the grounds that it is the reason an attach is needed. This is the step the
poster auto-plays into, about a second after the card opens, so the blink lands on a frame the reader
has only just started looking at and reads as a flicker in the render rather than as a beat. The step
is also not ABOUT the Pod: the narration is about who owns the decision, and the owner is the
controller. So it is a packet-less, Pod-less step where the subject registers by lighting and staying
lit, exactly as storage-csi-architecture's 'core' and 'controller' steps do. No block flash either: a
set of boxes to be read, not a beat to notice.
```

### before `duration: 4800,`

```
Three chained hops, and the middle one crosses the whole card: routeDur is length-based, so the
952-unit publish call runs 2116ms on its own and anim-dump puts the step span at 4276 (the last hop
lands at 3716, and its ripple and fade-out run on past that). The duration is 4800, not a taste
change: below 4276 the auto-advance cuts the call off before it reaches the disk. 4800 keeps 524ms of
headroom.
```

### before `const watch = routePacket(s, ctx, W_WATCH, { role: 'storage' });`

```
Three chained hops, each leaving BEAT.afterHop after the previous one lands: the attacher reads the
object, calls the driver, and the disk surfaces on node-1. No Pod is involved in any of them, so
nothing pulses and the blocks light on arrival.
```

### before `const mount = routePacket(s, ctx, W_MOUNT, { delay: gate.arrivalMs + BEAT.afterHop, role: 'storage' });`

```
Infra reaching a Pod, so down-arrow ordering: the ball flies first and the Pod blinks on its arrival.
The Pod is already at full strength, so the mount landing is signalled by the pulse alone rather than
by an opacity ramp out of a dim placeholder. The App box is never given a .highlight, here or at step
entry: the blink is the whole signal and it has to end when the ball does.
```

### before `duration: 5400,`

```
Five beats, not four: the Pod leaves, the CONTROLLER deletes the object on the same lane it created
it on, the attacher reads the deletion, the object leaves with its lanes, the disk comes off. The
unpublish call is the same full-width route as the attach step, so the span is 5076 against 4276
before the delete write existed. 5400 keeps the same 324ms of headroom.
```

### note (anchor dropped: `setBorn(s, { object: VA_PLACEHOLDER, lanes: 0, pod: 0 });` is not unique in the file)

```
The end-state of the card is the mirror of its opening frame: no Pod, no object, no lanes into the
object, and the disk off the node. Pinned statically here so a reduced replay or a cancel mid-step
lands on the torn-down state rather than the lit one.
```

### before `setBorn(s, { object: 1, lanes: 1, pod: 1 });`

```
Played in the causal order the narration gives. The Pod goes first, which is what frees the volume.
Then the attacher reads the deletion, and the object leaves WITH its four lanes, the same
construction that arrived together on step 3. Then the unpublish call reaches the disk.
```

### before `gone.onfinish = () => s.refs.va.classList.remove('highlight');`

```
va-7f is the subject of the step and is lit from entry as the source of the watch, but it does not
KEEP that light once it is gone: the class comes off when the fade to the terminated shade finishes,
so the static path has nothing to mirror and does not light it at all.
Both readings end the step consistently, so the tie is broken by the rule already in the gate:
check-opacity LIT says nothing may hold .highlight at the terminated shade, because a block that is
gone cannot also be the thing the step points at. LIT reads inline style on the played path only, so
it sees neither version here, which is exactly why the answer has to be written down rather than left
to whichever card is edited next. The same shape lives in removeAt (storage-reclaim-policy) and
vanishAt (storage-pvc-retention-policy, storage-csi-capacity-tracking).
```

### before `const del = routePacket(s, ctx, W_WRITE, { delay: BEAT.lead, role: 'storage' });`

```
The one clause this card exists to teach, that the CONTROLLER and not the Pod and not Kubelet writes
and deletes the object, has to be animated on BOTH halves.
DO NOT animate the create half and drop the delete half: the step then opens on the attacher's watch
while `W_WRITE` sits drawn, aimed and at full opacity carrying nothing.
The delete rides the same lane the create did, and the watch can only follow it. The object is the
receiver of that write, so it lights on arrival instead of at entry, and the ADC takes the entry
light as the actor.
```

---

## storage-volumeclaimtemplates

### before `const CX = 600;`

```
WHAT  StatefulSet volumeClaimTemplates, angled at the PVC OBJECT: how it is named, minted, bound,
retained and rebound.

LAYOUT  THREE HORIZONTAL ORDINAL ROWS, one per replica, each a straight triad:

       Pod web-N  ->  PVC data-web-N  <-  pv-web-N
       (consumer)        (the claim)       (the disk)

The claim is the subject of the card, so it sits in the CENTRE of every row on the canvas spine
x=CX, with its consumer Pod flanking it on the left and its backing disk on the right, mirrored about
the spine. The three claims stack into one central column, and the StatefulSet mints them straight
DOWN that column. Every connector is a straight axis run (vertical mint, horizontal mount and bind),
so no ball ever travels a bent corridor, and the picture is symmetric by construction: column centres
are POD_CX, CX, PV_CX = CX - FLANK, CX, CX + FLANK.

WHY NOT one column PER ORDINAL with the mints fanned in through bent side corridors: three claims
then sit side by side and the mint routes enter each claim from the corner. Turning each ordinal on
its side makes the claim the centred hub of its own row, the mint a single vertical spine, and the
mount and bind pure horizontal runs. Identity (Pod, claim and disk are one object under one name
data-web-N) is then read ACROSS a row rather than DOWN a column, carried by the shared name in the
three block labels plus the row alignment.

PANEL  Measured, the panel covers only the top-left band: right edge ~291, bottom ~143 in viewBox
units for these narrations. The source box spans x 430..770 (clear of the x<=397 band) and the first
Pod row starts at y=209, below the panel. A much longer narration invalidates this.

MOTION  Only the Pods pulse. The three replica Pods are declared from the start, so they sit at FULL
opacity the whole way through and never dim between steps. Mounting is shown by the pulse plus the
container lighting.
DO NOT fade a Pod up from a dim resting state on each mount: that up-and-down flicker on every step
reads as noise. The ONLY Pods that fade are the ones genuinely removed: web-1 blinks out and back on
the rebind step, and web-2 fades to a ghost on scale-down. A fade here always means a Pod left.

LANES  The central mint spine drops straight down x=CX, relaying the deterministic name into each
claim in turn (data-web-0, then -1, then -2). The two horizontal lanes per row point INWARD toward
the consumer: the bind lane carries the disk to the claim (pv to PVC), the mount lane carries the
claim up into the Pod (PVC to Pod).
```

### before `function podBlock({ cy, label }) {`

```
Family pulse model: the wrapping g is not optional.
```

### before `const shell = podShell({ x: POD_X, y, w: POD_W, h: POD_H, label, sublabel: 'mounts /data', containers: 0, role: 'sto`

```
A full Pod window like the rest of the storage cards: the ordinal name on top, a real container box
(label plus what it does to the volume) in the middle, and the mount path as the Pod sublabel at the
bottom. The shell fill is knocked back so the inner container reads as nested inside it.
```

### before `const trunkW = ROW_CY.map((_, i) => lane(trunkSeg(i)));`

```
Straight connectors. The mint spine drops down the centre through the stacked claims. The bind and
mount lanes run level into each claim and Pod. Lanes are permanent dim structure; the mint spine
appears once the template stamps.
```

### before `const CHIP_W = 232, CHIP_GAP = 16;`

```
Family chip width. Worst case here is 'on delete' + 'kept, leaks' at 20 characters, so 20 * 6.89 + 24
of padding is 162 against the 232 available.
```

### opacity phases (was `const POD_PRESENT = 1`)

```
Family setStage. The Pods rest at full opacity (see MOTION in the header note): only a genuine delete
fades one.
```

### opacity phases (was `const CLAIM_PLACEHOLDER = 0.4`, now OPACITY.pending)

```
Family rule: a claim that has not been minted yet is drawn dim rather than hidden. Removing it leaves
a claim-sized hole in the row that reads as a rendering fault, and it leaves the mount arrowhead
aimed at nothing for the whole flight.
```

### before `function mountRow(s, ctx, i, { delay = 0, tag = null } = {}) {`

```
One row mounting its own disk: the ball crosses the bind lane from the disk into the claim, then the
mount lane from the claim up into the Pod, and the Pod pulses when the mount actually reaches it.
Down-arrow ordering, so the ball leads and the pulse lands on arrival, never at step entry.
```

### before `const GONE = OPACITY.terminated, OUT = 850, HOLD = 550, IN = 800;`

```
web-1 is deleted, then recreated. Deliberately slower than the FADE tokens, with a real HOLD at the
ghost, so the delete and the recreate read as two distinct beats and not one quick blink: it fades
out reading 'deleted', stays gone for a moment, then fades back reading 'recreated'. The claim and
its disk stay at full opacity throughout: not being deleted is the whole point of the step.
```

### poster

```
volumeClaimTemplates: one template stamps a DEDICATED disk per ordinal, and the point is that each
replica gets its OWN stable disk rather than sharing one the way a Deployment would. So the poster is
a template box up top and three IDENTICAL ordinal columns below it, each a Pod wired straight down to
its own cylinder.
The fan-out is orthogonal, matching the card, which mints every claim straight down an axis: one
vertical drop out of the template into a horizontal bus, then one 90 degree drop into each column, so
the branch reads as deliberate wiring rather than a spray of diagonals. It is symmetric about x=160
with columns on 60 / 160 / 260.
The three solid vertical spines are the signature (a spine per ordinal, never a shelf they fight
over): the fan is dashed because the template is minting instances, the spines are solid because each
Pod OWNS its disk. The small dashed rect inside the template box is the claim template itself.
Content spans y=18..158, centred.
```

---
