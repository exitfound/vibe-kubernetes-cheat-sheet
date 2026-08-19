# Scheme card design notes: storage

The per-card design record for `js/schemes/storage/`. It answers what the code cannot: why a number
is what it is, which alternative was measured and failed, and what must not be "fixed". The
constants themselves live in the card and are not repeated here.

**The rules are not here.** Catalog-wide rules are `scheme/CANON.md`, and this category's own rules
are `./CLAUDE.md`. A note below records only where a card DEVIATES from them, or a number that needs
explaining. Sister records: `CARDS.md` in the other three category folders. Anything that is NOT
one card (the catalog barrels, `js/lib/`, the kits, the CSS) is recorded in a JSDoc note beside
the code it describes, not in a document. None of them ships (`S-41`).

**HOW TO READ THIS FILE.** (Deliberately not a `##` heading: every `## ` here is a card id, and
`test/unit/docs.test.mjs` parses it that way. A second-level heading anywhere else is an orphan.)

One `## <card-id>` section per card. `### layout` describes the whole card in labelled blocks,
`### poster` describes the grid thumbnail, and each ``### before `<line>` `` holds the note for one
line of code. `unit/docs.test.mjs` verifies every anchor still occurs in its card, so **an anchor is
DATA: never reword one** (`S-38`).

The label vocabulary a `### layout` block uses is ONE list for all four records, in
`scheme/CANON.md` under "The record vocabulary". Use the labels that apply, in that order, and add
none of your own.

**The geometry is not repeated here.** `SCENE.parts` states it as data and `unit/spec-scene.test.mjs`
reads the same numbers off it, so a paragraph restating a coordinate is a second source that can only
rot. What is below is what the code cannot say: a measurement a browser took, the string that floors
a width, the alternative that was tried and failed, and the defect a constraint prevents.

Panel extent is per card: the right edge is `x<=397` catalog-wide, the BOTTOM ranges 90 to 504 over
the standard viewport set, and it moves NON-MONOTONICALLY (`L-02`, `L-04`, `L-05`). So a `PANEL_B`
in a card is a measurement, not a convention. Re-measure with `npm run report`
(`report/overlay.test.mjs`, which walks every card at 1600x1000, 1280x860 and 1100x800) after any
prose change: several cards here carry a hard character ceiling and nothing enforces them (`L-08`).

Several tables below carry a `900x650` row, a hand sample stricter than anything the harness takes,
and where the two disagree the card takes the stricter number and says so (`STO.L-04`). Over the
sampled viewports storage's own deepest panel is 354 (`storage-ephemeral-storage-eviction`); the
catalog maximum of 503 belongs to `workloads-pod-phase-machine`.

---

## storage-access-modes

### layout

```
WHAT     Which node, and which Pod, may hold the volume at the same time. A block disk that can only
         do single-attach against a shared filesystem that can do many.
LAYOUT   The tiers do NOT all share one centre, and the split is the point: the node row is pinned to
         LEFT_X by the panel band and lands on 647, while everything below the panel floor has the
         full width and centres on the CANVAS. The driver band takes that width on the LEFT and keeps
         its right edge flush with the node row, which is what fills the empty lower-left corner.
PANEL    Worst step, right edge / bottom edge by viewport:
           1920x1080 -> 203 / 146    1440x900 -> 319 / 183    1280x800 -> 358 / 213
           1100x800  -> 397 / 230     900x650 -> 398 / 375
         So x<=398 and y<=375. LEFT_X 400 has about 2 units of slack and cannot move left at all.
         The driver band is the one tier that does NOT clear that band, and only its BOTTOM edge is
         on 375: it spans 306..894 on x and 305..375 on y, so at the 900x650 hand row its left 92
         units sit behind the panel over the band's whole height, about 16 percent of its area. Over
         the three viewports the harness samples it is clean, its top clearing the 230 bottom by 75,
         which is why nothing reports it. That is the same disagreement between the hand row and the
         sampled set that storage-csi-attach-mount records, and the band has nowhere to go: the disks
         hold everything below 375, and the width it gains on the left is what fills the empty
         lower-left corner.
DO NOT   Re-derive LEFT_X from the panel measured at your own window size. A left edge picked from one
         wide-window sample looks centred on the machine it was tuned on and slides under the panel on
         a laptop.
LANES    Every mount is a DESCENT through the driver, the rewrite-inside-a-box idiom, because the
         driver is where the decision is made. A refused attach stops AT it and never reaches a disk.
WHY NOT  Dropping each Pod straight down: that puts three arrows across a 588 unit face, none of them
         near its midpoint. The shared bus above the band and the fan below it avoid that by meeting
         the band at one point instead.
DO NOT   Collapse the three NFS lanes to a single wire down NFS_CX with balls flying at NFS_CX +/- 7:
         then no ball rides the drawn line, they skim 7 units either side of it. Three lanes rather
         than two because ReadWriteMany excludes nobody: app-2 sits on the same node as app-1 and can
         mount it just as well, and leaving it out made the step look like RWX still rations access.
SIZES    POD_W decides how far the NODE ROW sits off the canvas centre, because that row's centre is
         LEFT_X + (3*POD_W + 110)/2 and LEFT_X is pinned by the panel. Every extra unit of POD_W costs
         1.5 units of rightward shift: at 156 the row centre lands on 689, which reads as a visible
         shift right, at 128 it lands on 647. WHY NOT 112: the Pods come out narrower than they are
         tall and read as squeezed.
         SPEC_GAP is 14 below the cylinder name, which `cylinder()` puts on the baseline h/2+5, the
         same gap storage-pvc-binding uses. WHY NOT a flat PV_Y+66: against a 100 tall cylinder that
         leaves 11 units between two baselines whose text is 11 units tall, so the two lines touch.
BUDGET   POD_W is floored by the WIDEST TEXT INSIDE A POD. The container sublabel is `read/write` at 59
         units; `reads and writes` renders 94 and puts a hard floor of ~146 under POD_W. DO NOT
         lengthen that string without re-deriving the row centre.
         CHIP_W 232 is one width for all four chips, measured worst cases in viewBox units:
           accessModes 76 + ReadWriteOncePod 110 = 186   <- the binding one, neither string can shorten
           attached to 76 + `Node-1, Node-2`      96 = 172
           sharing     48 + `app-1, app-2, app-3` 131 = 179
           enforced by 76 + `CSI driver`           69 = 145
         232 clears the worst pair with ~22 units between name and value.
NAMING   The multi-value chips read as comma lists because `Node-1 and Node-2` and `app-1, app-2 and
         app-3` would force a wider uniform chip, and the strip is already more than twice the width
         of the diagram it captions.
CONTENT  `enforced by` is a real value, not a constant caption: every mode here is honoured by the
         driver EXCEPT ReadWriteOncePod, which Kubernetes itself enforces. DO NOT hardcode it back to
         `CSI driver`, that makes it dead weight and wrong on the one step where it matters.
         `sharing` answers exactly one question: which Pods hold the volume right now. DO NOT let it
         double as a refusal report (`node-2 refused`, `block cannot span nodes`). That puts a refusal
         in the chip on the very step where a ball flies out of a refused Pod, so the chip reads as a
         caption for that ball. Refusal reasons belong on the driver wire label, which carries them.
MOTION   On a refusal the Pod still blinks FIRST exactly as `grantMount` has it: it is the actor either
         way, and without the blink the narration names a Pod that is never seen doing anything, the
         ball just materialising out of a dim block. Refused Pods stay dim, so that blink takes the
         dim variant with an opacity lift.
         On the refusal step the block disk stays LIT: it is still attached to node-1 and still in use,
         and it is the REASON app-3 is refused, so leaving it unlit contradicts both the wire label and
         the narration.
DO NOT   Dim the not-yet-mounted Pods. Dim means the access mode REFUSES this Pod, never `has not
         mounted yet`: the poster auto-plays step 1, so that is the frame you stare at on open, and it
         showed two of three Pods greyed out for no reason a viewer could name. It also conflated
         app-2, which mounts fine one step later, with app-3, which is genuinely refused. Who HOLDS the
         volume is carried by the ball, the lit disk and the sharing chip instead.
```

### before `const LEFT_X = 400;`

```
The panel wall, with about 2 units of slack, and the ONLY thing pinning the node row. The row centre
is LEFT_X + (3*POD_W + 110)/2, so LEFT_X and POD_W together decide how far off canvas centre that
tier sits. It cannot move left at any window size.
```

### before `const CHIP_W = 232;`

```
ONE width for all four chips, sized against the accessModes + ReadWriteOncePod pair at 186, neither
of which can shorten. Below ~190 the name and the value touch.
```

### before `const DENY_LEAD = 450, MOUNT_LEAD = 520;`

```
These are TAG spacing, not pacing. Both refusals park at the driver top and all three RWX mounts land
within 32 units of the disk top, so each tag has to fade before the next one lands. At the previous
220 and 200 they printed on each other for 100ms and 400ms, at baseline gaps of 0.49 and 0.00. After:
35 and 23 units of ink gap on all four viewports. The rwx-nfs duration follows to 4300 for a span of
3900 (`M-19`). Separating them in SPACE was measured first and does not exist here, because the three
arrivals share one point.
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

## storage-configmap-secret-mount

### layout

```
WHAT     ConfigMap and Secret as files, in the vertical-stack family with volume-model and emptydir.
         Reading the card bottom to top IS the mechanism: a source object becomes files via kubelet,
         the files resolve through the ..data symlink, the app reads the result.
CONTENT  The mechanism is the ATOMIC SYMLINK SWAP. kubelet writes the keys into a timestamped directory
         and points a ..data symlink at it. On update it writes a brand new timestamped dir, then flips
         the single ..data symlink in one step, so a reader never sees a half-written config. Updates
         land on the kubelet sync period (up to about a minute) and the app must re-read the file
         itself. A subPath mount pins one file and opts OUT of the swap, so it never updates. A Secret
         uses the same machinery but on tmpfs.
LANES    The subPath lane rises STRAIGHT out of the v1 dir, bypassing ..data, which is exactly its
         meaning, then steps across the Pod-to-volume corridor to enter the Pod 60 left of the spine.
         WHY NOT take it straight to the top: it ends at the Pod's corner, 140 off the midpoint of a
         540 wide face and alone there, which reads as a lane that missed rather than as a second read
         path. The step is in the corridor, so it crosses nothing and clears the sync-period label.
         The symlink pointers are `P.relation` because a symlink is a relationship rather than
         traffic. DO NOT hand-roll them as stripped `P.lane`s or give them a marker.
PANEL    The Pod starts at x=330, y=56, clear of the panel measured on the family cards ((300, 163) on
         a comfortable 1600px viewport). On narrow windows the panel may brush the Pod corner, the
         accepted family trade. A longer narration invalidates this.
MOTION   Kubelet is the case that pins the source-versus-receiver rule: lit at entry it would be shown
         reading before anything had been sent, so it waits for the read to arrive and writes one hop
         later.
         The atomic step's `opacity` states the state AFTER the flip, because that is where the step
         ends, and `rewind` puts the pre-flip stage back for the animated path alone.
```

### before `const POD_X = 330, POD_Y = 56, POD_W = 540, POD_H = 120;`

```
The Pod spans 330..870, centred on 600 with the volume and source rows below it. It starts at x=330,
clear of the panel measured on the family cards at (300, 163); on narrow windows the panel may brush
its corner, the accepted family trade.
```

### before `const READ_TAG_DY = 10;`

```
The spine ends on the Pod floor at 176, where -14 parks the tag on the `mounts /etc/config` sublabel:
66.3 x 9.0 units of ink for 400ms, baseline gap 0.24. Below the ball only 10 and 12 clear all four
viewports, and 10 is taken: at 12 the tag starts inside the volume frame and grazes the
`Volume /etc/config` title by 1.0 unit at the sync step, where the ball waits 900ms before departing.
```

### before `const SYNC_TAG_DX = -20;`

```
Only the sync step writes the `clock` caption, anchored start at x 618, which took 15.2 units of the
tag as it climbed past, for 100ms. The tag runs 66 to 69 units wide over the four viewports, so -20
is what its widest half needs. The other steps on this lane leave the caption blank and stay centred.
```

### before `const SRC_TAG_DY = -36;`

```
The two source lanes run through the middle of 64 tall boxes, so at -14 the tag is cut by the
ConfigMap or Secret side face for 600ms. -36 is the least that clears their tops on all four
viewports. `app.conf` on the keys step cannot take the same number: `write v1` rides the neighbouring
lane at the same height there, and the pair only parts at -58.
```

### poster

```
The card in miniature: the app reads down the spine through ..data, whose bare right-angle pointer
(no arrowheads, as on the card) has flipped off the dim v1 dir onto the fresh v2 dir. The short lines
inside each dir are the keys sitting as files.
```

## storage-container-filesystem

### layout

```
WHAT     Container filesystem layers, as a vertical stack: the Container over its overlay layers over
         the real volume disk.
CONTENT  The teaching contrast. The container root filesystem is read-only image layers (lowerdir)
         with ONE thin writable layer (upperdir) on top, combined by overlayfs. A write copies up into
         the writable layer, never into the image, and that writable layer is DISCARDED when the
         container is removed. A mounted volume is a hole punched through the overlay straight to real
         storage, bypassing the writable layer, so it survives.
LANES    The bypass is drawn literally: the volume wire leaves the Container SIDE and zigzags around
         the whole stack down to the disk, the literal picture of bypassing every overlay layer.
MOTION   The writable layer does not exist until its step, so its copy-up wire does not either: the
         layer and the wire fade in together, are discarded together, and return together for the fresh
         container. That reappearing layer is the restart made visible, not the old layer returning:
         its contents are gone and the sublabel still reads starts empty.
         Only the Container (a Pod-like consumer) pulses; the layer boxes and the disk light. The
         `ctr` group holds the shell and the Process box as PEERS, so pulsing the GROUP blinks both.
         DO NOT aim the pulse at the shell alone: it then cannot reach the Process box.
NOTE     The writable layer is not on screen at build time, so the root-fs chip starts honest: only the
         read-only image layers exist until the writable step adds the RW top. The same holds on the
         way out: the discard step throws the layer away, so the chip returns to the read-only value
         and never claims an RW top the picture does not have.
```

### before `const POD_X = 440, POD_Y = 48, POD_W = 320, POD_H = 140;`

```
POD_CX falls out at 600 and the overlay stack plus the disk are centred under it, so the whole column
is symmetric on one axis. The chip strip (3x320 + 2x20 = 1000) is centred on the same 600.
```

### poster

```
One writable layer at 0.09 over three read-only ones dimmed to 0.45 as a group, with a cylinder
below and a dashed hook running from the container down PAST the stack into it. The sentence is
that one of the four layers is different from the other three, and the volume bypasses all of them.
The dimming is applied to the three as a GROUP rather than per rect, so they read as one immutable
stack instead of three ranked things. The hook takes the long way round on purpose: a straight leg
would look like it passes through the layers instead of around them.
```


## storage-csi-architecture

### layout

```
WHAT     The CSI component map. STRUCTURAL rather than a single descent, so it does not use the
         vertical mount-lane stack of storage-volume-model: it reads left to right as
         core -> bridge -> vendor -> machine, with the controller plugin (a Deployment running
         off-node) and the node plugin (a DaemonSet on every node) as the two frames.
MOTION   NO Pod at all, on purpose, so nothing pulses anywhere and that is correct: every element here
         is Kubernetes core, a vendor process or the machine.
DO NOT   Draw the controller plugin or the node plugin as pod() shells. They are the two things a
         reader could mistake for Pods, and they are labelled by their CONTROLLER (Deployment /
         DaemonSet), so a Pod shell would name the wrong object.
PANEL    Worst step, right / bottom by viewport:
           1920x1080 -> 203 / 130    1440x900 -> 319 / 163    1280x800 -> 358 / 189
           1100x800  -> 397 / 205     900x650 -> 398 / 313
         x<=398 and y<=313: under the blanket y<=300 on the y axis, slightly OVER it on x. Everything
         left of 420 therefore starts at y>=350, clearing the measured bottom by 37 (apiserver row,
         kubelet row, chip strip, both left-hand wire captions). The controller frame's left border
         is the leftmost thing sitting high on the canvas, at 420, clearing the right edge by 22.
BUDGET   A LONGER NARRATION INVALIDATES BOTH NUMBERS, and not theoretically: one added sentence on the
         `controller` step took the 900x650 bottom from 313 to 344, swallowing the apiserver row.
LAYOUT   ONE pair of constants fixes the content band and every tier hangs off it. WHY NOT hand-typed
         margins: they drift. Content ran 60..1180, a 60 unit left margin against a 20 unit right
         one, centre 620, visibly shoved right.
         Top margin 48 (the frame border), bottom 16 (the chip strip), unequal on purpose: the top
         element is a dashed border whose caption is inset 22, so it reads airier than the number
         suggests, while the chip strip is solid ink to its last pixel. DO NOT put CHIPS_Y at 616: a
         34 high chip then runs to 650 and is CLIPPED by the 640 viewBox, silently cutting 10 units
         off all four.
SIZES    Kube-apiserver, Kubelet and the cloud API share ONE width, the meaningful mirrored pair being
         the apiserver and the cloud API, the two worlds the driver bridges. The floor under SIDE_W is
         kubelet's sublabel `asks node plugin to mount` at 150.7 units; 232 leaves ~40 either side and
         below ~200 it touches.
         420 is the first tidy value clear of the panel right edge at 398, and it leaves a box-to-box
         gutter on the node row exactly as long as the node driver to node fs gutter on the far side,
         so the two horizontal wires on that row are a matched pair.
         The four sidecar widths are SOLVED, not picked: each box needs its widest string plus air and
         the leftovers are spread so every box ends with the SAME air. Measured needs 120.6 / 144.7 /
         108.5 / 132.7 = 506.5 against an inner span of 654 after the gaps, so ~37 per box. DO NOT
         shrink CF_W: the attacher sublabel is the first string to touch its edge.
         The driver is centred on the sidecar ROW, not on the frame, because it is what all four call,
         and its width echoes SIDE_W so the three "servers" come out at one size.
         CHIP width is derived so the strip spans exactly the content band rather than being a fifth
         hand-typed margin. Worst pair `node plugin` 75.8 + `mounts the disk` 103.4 = 179.2, so 258
         leaves ~55 units of clear gap.
LANES    The run out to the cloud leaves the driver from the CENTRE of its bottom edge, the same
         anchor the inbound gRPC wire uses on the top edge, so the driver reads as one block with
         traffic on its spine. It runs 128 units, long enough to read as a run and not a stub.
         The provisioner is the only block with traffic on BOTH sides, so each direction gets its own
         lane offset around the box centre. DO NOT run both through the box centre: the 28 units
         between the sidecar row and the bus (S_BOTTOM 158 to BUS_Y 186, the gap BUS_Y's own comment
         names) are then drawn twice, and the ball retraces its own inbound path.
         The bus the other three sidecars share into the driver is DRAWN rather than implied, because
         that sharing is the point of the card. No ball rides it, so it carries NO arrowhead.
NOTE     A frame is a label for a SET, not a thing traffic touches, so it stays fill-less with a
         sparser `3 6` dash and reads as subordinate to a real node. Its caption baseline leaves 12
         units of air above the row inside.
DO NOT   shrink that 12 or the caption touches the box tops.
DO NOT   give its border a flat white at 0.22, which sits outside the category tint: it takes the
         catalog node-rect token (--diag-node-stroke), being the same kind of grouping element.
NAMING   External-provisioner and Node-driver-registrar are one identifier each, not a phrase, so
         capitalizing every segment would read as three separate proper nouns (`T-11`).
WIRE LABELS
         Three captions, all on horizontal runs, all pushed BELOW their wire: a riding tag renders 14
         units ABOVE its ball, so a caption on the same side gets sat on.
         There is deliberately NO caption on the provisioner -> driver lane. That hop is what the card
         is named after, so the BALL carries `CreateVolume`, and a caption on the same lane would be
         run over by the tag. For the same reason the apiserver hop carries no tag: its ball and the
         CreateVolume ball both terminate on the provisioner's bottom edge 28 units apart, so two
         tags there overlap for ~390ms. The Pending PVC is named by the caption instead, where it is
         standing still and readable.
DO NOT   Hang `CreateVolume` on the wire caption of the DRIVER to CLOUD line two hops further on:
         that labels a vendor API call as if it were the sidecar call.
NOTE     Three chained hops measure span 3122ms against a duration of 3600, so ~480ms of headroom.
         A route's flight time comes from its LENGTH, so moving a block here is silently a timing
         change: anything added has to be re-checked by `render/duration.test.mjs`.
NOTE     Every chip means exactly what its name says.
DO NOT   let `bridge` report `registered`, `touches fs` or `gRPC NodePublish`: none of the three is
         a bridge, all are node-plugin facts, and the last one also repeated the riding tag on the
         step that draws it. On the fstoucher step the bridge fact is that there is no sidecar in
         the mount path at all, so the value states that ABSENCE, `no sidecar in path`.
DO NOT   write `Kubelet calls direct` there, true though it is (the registrar docs say Kubelet
         issues NodeGetInfo, NodeStageVolume and NodePublishVolume against the driver itself). The
         sentence beside it says Kubelet never mounts vendor storage itself, so a chip pairing
         Kubelet with `direct` is read as Kubelet doing the mount, which is the one thing the step
         denies. The name+value pair measures 165.3 against the 258 chip, so it is not a width
         question either.
NOTE     The last step is a static highlight only, with no motion at all. The usual argument for a
         flash on a packet-less step does not apply to the LAST step, which is supposed to come to
         rest: lighting the whole chain at once IS the summary, and it wants to be read.
```

### before `const M = 60;`

```
One margin both sides, so CONTENT_L / CONTENT_R and CX fall out of it and the canvas centre is
construction rather than a typed 600. Changing M re-solves every tier.
```

### before `id: 'core',`

```
core, controller and bridge are the three mute steps of this card, 7100ms in which nothing travels
and nothing animates. There is no Pod anywhere here, so nothing may pulse, and M-27 makes the static
`.highlight` the whole of the beat: on this card a mute step is mute (M-01).

core lights api. The sentence is about Kubernetes core knowing nothing about any vendor, and the
apiserver is the only block on the card that IS core. The chips reporting its state are values and
are lit rather than flashed (M-26), so the cue is the box going bright and staying bright.

controller lights all four sidecars as ONE set, which is what its `lit` already names. The
narration names each of the four and gives it its job, so the actor is the set rather than any
member of it.
WHY NOT the controller frame: it is a label for a set, drawn as a keyless P.group, so no ref
reaches it at all.
WHY NOT the provisioner alone: "follow one sidecar" is the NEXT step's opening line, and singling
the provisioner out here spends that sentence a step early.
WHY NOT drv: nothing calls the driver until translate, and this step does not light it.

bridge lights seven blocks and adds nothing on top. The seven ARE the summary and it wants to be
read, so a beat on the last step works against it, and there is no honest single target either:
every block the sentence names was already the actor on an earlier step.
DO NOT   Put F.flash back on core or controller. It animates filter brightness 1 to 1.55 to 1 on the
block group, which M-04 calls a pulse and M-01 forbids on infrastructure, and no still frame can
tell it from the static highlight it replaced, because its 600ms equals the whole span of the step.
```

### poster

```
Two halves and one bridge. The control-plane frame on top carries four sidecars over the controller
plugin, joined by a drawn bracket, and the Node frame below carries Kubelet and the node plugin.
The two dashed legs out to the left and right stubs are the API and the storage backend, and one
dashed spine joins the halves. The sentence is that a driver is TWO deployments, not one.
The controller at 0.07 is the only box brighter than its siblings: it is the thing the four
sidecars exist to wrap.
```


## storage-csi-attach-mount

### layout

```
WHAT     THE LADDER CARD. The four gRPC calls between a bound claim and a writable /data are a
         numbered ladder down the LEFT, one rung lit per step, and the RIGHT is the topology those
         calls act on, descending from the cloud disk to the two Pods that share one staging mount.
CONTENT  The descent is literal. CreateVolume makes the disk, ControllerPublishVolume moves it into
         the node as a device, NodeStageVolume mounts it once at the global path, NodePublishVolume
         bind-mounts that one staged filesystem into each Pod. Stage is once per NODE, publish is
         once per POD, which is exactly how two Pods on one node share one disk.
LAYOUT   Two columns of EQUAL width sharing one centre: 2*M + 2*COL_W + G = 1200 solves COL_W. Not a
         chosen number, it is what makes the ladder and the node column mirror each other about 600.
         Change M or G and COL_W has to be re-solved. WHY NOT hand-typed 508 / 560: the content bbox
         lands at 60..1178, centre 619, visibly shoved right.
         The chip strip is the one tier spanning the WHOLE content width rather than one column, so
         it reads as a rail under both.
NOTE     The CSI controller lives in the LEFT column, because it is the one actor NOT on the node.
WHY NOT  leave it inside the node column level with the cloud disk: that puts EVERY block in the
         right half, content bbox 624..1140 centre 882, with the whole left half below the panel
         blank apart from the ladder. Moving the one off-node actor to the off-node side puts a
         block on each side and takes the low content to centre 592.
NOTE     CreateVolume pays for it with two corners: it leaves the controller's right face, turns up
         at x=520 (right of the panel at every viewport) and runs to the cloud disk's left face in
         the free band above the frame.
PANEL    Worst step, right / bottom by viewport:
           1920x1080 -> 203 / 146    1440x900 -> 319 / 183    1280x800 -> 358 / 213
           1100x800  -> 397 / 230     900x650 -> 398 / 375
         x<=398 AND y<=375: well inside the blanket rule on x but PAST it on y, because this card
         carries some of the longest narration in the catalog. That is what pins the ladder: LAD_Y
         388 clears the measured 375 by 13 units and cannot move up.
OPEN     TWO STANDARDS, AND THEY DISAGREE. The harness samples 1600x1000, 1280x860 and 1100x800 only
         (`report/geometry-soft.test.mjs` OCCLUDED, `report/overlay.test.mjs`), where this card's
         panel bottoms out at 230. The 900x650 row above is a wider hand sample and is the stricter
         number by 145 units. The CSI controller at y=268 clears 230 by 38 and is reported CLEAN, but at 900x650 it
         would be behind the panel, and so would the top rung of the ladder. There is nowhere else
         for it: below 375 the left column is the ladder, and the whole point of moving it was to get
         a block out of the right half. If the panel is ever clamped in CSS, this card gets margin back.
BUDGET   Text widths are MEASURED via getBoundingClientRect and mapped back into viewBox units. Chip
         text and dim code labels are both 11px JetBrains Mono, so one number sizes the chip strip
         and the band caption: 6.89 u/char, zero variance because it is monospace, so one sample is
         enough. Longer strings measure slightly under (ladder rows 6.54 to 6.62) only because of the
         narrow separator glyph.
         DO NOT measure before `document.fonts.ready`. An early sample reads 5.54 u/char, from which
         a 42-character ceiling and 46 units of caption clearance were derived, and both were wrong:
         that is the fallback monospace, about 20 percent narrower. Do not eyeball off a screenshot.
SIZES    The widest ladder rung is 51 characters and renders ~338 units at the 6.62 u/char chain rows
         measure at, plus the primitive's 10 unit inset, so 348 of ink in a 516 wide rung. The extra
         width is DELIBERATE, so the rungs read as a stacked bar chart of the chain. DO NOT shrink
         them to the text: that breaks the column mirror.
         POD_W falls out of 2*POD_W + POD_GAP = IN_W. The widest string inside a Pod is `private bind
         mount`, 18 characters, which is 108.5 at the canon 10px mono rate (`L-20`, 6.03), so the
         width is set by the TIER MATHS and not by the text, with ~58.7 units of air either side.
         DO NOT measure at 5.54 per character (99.7 for that string): it is the pre-`fonts.ready`
         fallback the BUDGET block below forbids measuring on.
         CHIP_W is solved from the content width. Worst pair `bind mounts` 75.8 + `2 (Pod A + Pod B)`
         117.1 + 24 of inset = 216.9, so 41 units of air at the tightest step.
         The band caption's nearest obstacles are the two publish lanes, so the clear width is 258;
         keeping 12 off each arrowhead leaves 234, a HARD CEILING of 33 characters at 6.89. The
         longest in use is 26.
NOTE     The cloud disk sits ABOVE the node frame because it does not live on a node: the first two
         calls are cluster-scope. It stays on the node column so the descent reads as one vertical
         story, the cloud disk over the device it becomes.
         The staging mount is a FULL-WIDTH band, not a centred box, for the reason the card is about:
         one mount serving every Pod on the node, so it has to physically span all of them.
LANES    No lane carries return traffic, so none needs an offset twin: this card is one-way all the
         way down.
         The stage lane elbows LEFT to STAGE_IN_X 999 before it drops, so the device does not land in
         the corner directly under itself: 999 is OWNS_X 765 mirrored about NODE_CX 882, so the two
         lanes touching the staging band's top face read as a pair either side of its midpoint rather
         than one lane out on its own, and the staging mount reads as belonging to the whole node.
         It also makes the run 96 units instead of a 46 unit straight stub. That elbow turns at the
         MIDPOINT of the gap it crosses (STAGE_ELBOW_Y 327 in the 46 unit device gap), so it stays
         centred if either block moves; DO NOT hand-type it, or changing DEV_H strands it mid-gap
         with no test catching it.
         W_OWNS is ownership, not traffic: the node plugin performs both node calls, so it owns the
         staging mount below it. No ball rides it, so it is a bare dashed path, not a pathArrow.
NOTE     A BLOCK AND ITS LANES ARE ONE CONSTRUCTION AND APPEAR TOGETHER (`STO.S-02`). Only the
         standing topology is drawn from the first frame.
DO NOT   hide only the blocks and leave the four lanes drawn from frame one: the card then opens on
         an arrowhead pointing into empty canvas and two more pointing at Pods that do not exist,
         and it gives away the punchline (one staged mount serves many Pods) three steps before the
         narration gets there.
NOTE     The device and both its lanes finish materialising BEFORE the call is sent (REVEAL_MS 500
         against BEAT.lead 800).
MOTION   A Pod arrives at FULL strength. DO NOT fade it in at 0.5 and ramp to 1, on the theory that a
         Pod with no volume yet has not started: Pod A then sits visibly greyed out for three steps
         next to blocks at full and looks broken rather than pending. A Pod that is not there yet is
         simply not drawn.
DO NOT   Name the container box in a `lights` list at packet arrival: /data stays outlined for the
         rest of the step after the blink has decayed, so the Pod reads as permanently mid-event.
NAMING   Two labels are deliberately EXEMPT from `T-10` because capitalizing them would make them
         WRONG rather than merely styled: the device is a literal kernel path and there is no
         /dev/Nvme1n1 on any machine, and node-1 is a hostname the primitive uppercases anyway.
         The Pod sublabel names what NodePublishVolume creates and deliberately does not repeat
         `/data`, which the container box carries: two labels saying the same path made the Pod read
         as one fact printed twice.
NOTE     `P.node` carries its own label RELATIVE to the frame group. Let it place it: appending a text
         with an ABSOLUTE x into a group already carrying translate(624,192) renders x=640 at 1264,
         past the viewBox.
NOTE     Z-order puts the LADDER last of all: it is the reader's index into the story and its lit
         rung must stay crisp even when a ball is passing.
```

### before `const M = 60, GUTTER = 48;`

```
COL_W is solved from the margin and the gutter (516), so the two columns and the ladder inside the
left one re-size together. The chips are solved the same way: 4*CHIP_W + 3*16 = 1080.
```

### poster

```
Four identical bars, a bracket collecting all four into one vertical, and a single dashed leg from
that vertical to the disk. The sentence is that four separate calls add up to ONE outcome, so the
bars are byte-identical and the bracket carries the whole meaning.
The bracket is drawn solid where the leg to the disk is dashed: the chain is structure, the reach
to the backend is a call. Numbering the bars was rejected, it would make the poster a list.
```


## storage-csi-capacity-tracking

### layout

```
WHAT     CSIStorageCapacity. With local or topology-constrained storage the scheduler can pick a node
         whose storage pool is already full. Provisioning then fails there, and because the Pod cannot
         bind until its volume does, it never schedules and stays Pending forever. CSIStorageCapacity
         objects, one per topology segment, let the scheduler SEE the free capacity and filter out the
         nodes that cannot fit the claim before it commits. No driver is drawn anywhere here and the
         publish balls leave the POOLS, so DO NOT let a string name the driver as the publisher
         (`T-21`): the objects report the free space, and who writes them is off this card.
LAYOUT   Each frame HOLDS its capacity object and its pool, so the frames carry content instead of
         framing empty canvas. The scheduler and the pending Pod stack on the centre line above them,
         because there is one scheduler and one Pod and the whole question is which of the two
         symmetric nodes they pick.
         The pool sits ABOVE the object so that BOTH lanes inside a node can run down the column centre
         line. With the object on top, provisioning has to detour around it and meets the node frame
         170 units off its edge midpoint, which reads as a lane stopping at a random point on an edge
         rather than as an arrival.
WHY NOT  Hanging the pools outside and below the frames: each frame is then a mostly empty 400 by 180
         box with one small block floating at its bottom, and the emptiness reads as a missing element
         rather than as a boundary.
PANEL    Measured, panel bottom-right in viewBox units:
           1920x900  right 102  bottom 183      1600x1000 right 291  bottom 143
           1280x900  right 378  bottom 173      1100x900  right 397  bottom 149
           1280x860  right 397  bottom 255      1100x800  right 397  bottom 255
         Worst case x<=397 and y<=255: the four taller rows are all 900 or 1000 tall, so the deeper
         reading comes from the SHORTER window (`L-05`). The occlusion rule samples the two 255 rows,
         so 255 is the number this layout is built against. The scheduler (y=36) and the Pod (y=148)
         both sit inside that y band, so both start at x>=400. Everything from the node row down
         (y>=300) clears it by 45. A longer narration invalidates this.
LANES    ZERO wire crossings, and it is ONE axis per node that buys that: the read, the provision and
         the publish lane all share their node's own centre line, which they can do because no step
         shows two of them, and the reads clear the Pod on the canvas centre line.
         The bind is the one lane that turns, leaving the Pod through the SIDE facing its own node
         rather than from underneath.
MOTION   The scheduler's decision lands ON the Pod (down-arrow), so the Pod takes its full pulse on
         arrival. It is only being scheduled, not Running, so it stays dim and needs pulsePodDim with
         an opacity lift, or the blink is invisible against the 0.55 it sits at. Same on the failure
         step, where the Pod never went Ready.
BUDGET   The three explicit durs (see the `DECIDE_DUR` note below) are why the card is registered in
         the `PACING` map of `render/motion.test.mjs`, which allows six balls moving at a speed their
         route does not explain. The number there is a CEILING: a new deviation turns it red.
         Family CHIP_W 232: worst case is `result` + `scheduled and mounted` at 27 characters, so
         27 * 6.89 + 24 of padding is 210 against the 232 available.
```

### before `const CX = 600;`

```
The two node frames are mirrored about CX and the scheduler and Pod stack on it, so the picture is
symmetric and neither node reads as the important one. NODE_CX is derived from the node width and
gap rather than typed.
```

### before `const DECIDE_DUR = 850, BIND_DUR = 1000, READ_DUR = 1000;`

```
Three explicit durs, deliberately slower than routeDur would pick, so the decision beat reads: ball
in, full Pod pulse, then the bind ball. Registered in `PACING`, `render/motion.test.mjs`.
```

### before `const PROV_TAG_DY = -40;`

```
Both numbers are absolute, against the family default of -14. At -14 the node frame top edge cuts the
provisioning tags, and `provision ok` lands on the parked bind tag: 72.4 x 10.0 units of ink at a
baseline gap of 0.00 for 300ms. At -40 the provisioning tags clear the frame and the pair gap is 12.6
on all four viewports. `READ_TAG_DY` -38 is the same correction for the two reads, which ran into the
Scheduler side edges for 500ms and now pass over its top.
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

## storage-dynamic-provisioning

### layout

```
WHAT     Same grammar as storage-pvc-binding: the IDENTITY COLUMN is the spine (PVC on top, the PV that
         ends up bound to it directly below, both the same width and x), and the machinery sits in a
         column to the RIGHT. The difference is that here the disk does not exist yet: the cylinder is
         invisible until CreateVolume returns, and the Bound link is drawn only once the PV object has
         been written.
LAYOUT   The drawing's centre is NOT the canvas centre and cannot be, and the chip strip is the one
         exception, centring on CANVAS_CX because it sits below everything with the full width.
         The two columns come out at 400..860, centre 630. What moved to get there was the RIGHT edge,
         narrowing the machinery column to 220 and the elbow channel to 40, both of which had slack
         (`provisioner: ebs.csi.aws.com` is the widest string in that column at about 150 units). At
         240 and 80 the bbox ran 400..920, off centre by 60.
PANEL    Measured right edge by viewport: 185 at 1920 wide, 275 at 1600, 322 at 1400, 342 at 1280, 379
         at 1100 and below. The blanket x<=380 is that worst case, not a pessimistic guess, so LEFT_X
         400 keeps a real margin at every window size. DO NOT slide LEFT_X leftward after measuring the
         panel at your own window size: a left edge picked from a single wide-window measurement looks
         centred on the machine it was tuned on and slides under the panel on a laptop.
         The Bound caption is anchored to the RIGHT of the spine, growing away from the panel. Left
         anchored it reaches back to x=286 at its current length, and the panel drops to y=342 on a
         small window (measured at 900x650), which puts it at y=296 squarely underneath.
LANES    The descent (CreateVolume) and the ascent (the volume handle coming back) take SEPARATE lanes
         so the round trip reads as a loop.
         The identity spine and the PV write BOTH run down the centre of the identity column. They can
         share that x because they are never on screen together: the write arrow shows only while the
         PV is being created, the spine only once it is bound. Any other arrangement puts one of them
         off centre.
         ELBOW_X is the ONE vertical channel between the two columns, derived from the gap so it stays
         centred if either column is resized. The claim descending into the provisioner and the PV
         write leaving it both turn on this x, and their vertical runs do not overlap in y (122..279
         above, 311..396 below), so sharing it reads as one clean lane. Those four y values are
         MIRRORED lane offsets, not free numbers: two lanes meet the claim's right face at 110 +/- 12
         and two meet the provisioner's left face at 295 +/- 16. WHY NOT a 4 unit offset: far too
         small to register as a deliberate lane split (those use LANE_DY, 15), so it just looks like a
         misalignment, and a single lane off a face midpoint on its own reads as a slip.
         The provisioner-to-PV wire is hidden until the step that writes the PV: it points AT the
         cylinder, and the cylinder does not exist until CreateVolume has returned, so drawing it from
         step 0 is an arrow aimed at blank canvas. It appears at the ENTRY of that step (the ball has
         to have a wire to ride) while the cylinder appears later, on the ball landing.
DO NOT   Rebuild the class reference and the Bound link from hand-copied coordinates. Both are driven
         FROM their points arrays, and with W_SC_REF and W_BOUND left unused, editing either constant
         moves nothing and the two silently drift apart. The class reference carries no arrowhead:
         nothing travels it, the claim only NAMES its class.
MOTION   This card has no Pod at all, so NOTHING pulses or blinks. The packet-less first step is fully
         static by design and its read is carried by the .highlight outline alone: a box flash would be
         canon-legal there but is wrong, because the StorageClass is being READ, not acting.
         Both values a ball EARNS wait for that ball (`P-03`). The `disk` chip holds the `none` the
         provision step left and takes vol-0abc123 when the handle comes back up (`back`, 1500ms),
         which is the arrival of the ball whose riding tag carries that same string. The `PV` chip and
         the `backed by vol-0abc123` caption hold what createvolume left until the write lands in the
         cylinder (`write`, 700ms), the beat that reveals the cylinder itself, so the caption never
         describes a link that is not on screen yet. Both use the `rewind` form and leave `chipsCued`
         and `wires` carrying the END value, so the static path lands exactly where it did before.
NAMING   The backend sublabel names the CSI driver because the narration says CreateVolume is called ON
         the driver, and the driver has no box of its own: the ball lands here, so this box has to
         admit it is the driver plus the backend behind it, or the text names an actor the picture does
         not have.
```

### before `const LEFT_X = 400;`

```
The panel wall, measured at 380 worst case over 1920 down to 1100. The two columns therefore centre on
630 and stay there: sliding the drawing left to reach 600 drags the claim under the panel, which is
what LEFT_X exists to prevent. CANVAS_CX is separate on purpose, because the chip strip alone has the
full width.
```

### before `const CHIP_W = [210, 250, 240, 230];`

```
Four unequal widths, laid out from their own total so the strip centres on CANVAS_CX. They are NOT
sized to their own values and do not have to be, because none of the four is anywhere near tight: the
neediest pair is `disk` + `vol-0abc123`, 127 of the 240 it gets, while the WIDEST chip carries the
shortest pair, `class` + `gp3` at 79 of 250. The widths are a rhythm across the strip, not a fit.
Hand-placed x values had it spanning 90..1080, a centre of 585.
```

### before `const RETURN_TAG_DX = -30;`

```
The call tag parks on the backend top where the return tag leaves 100ms later, so the pair needs to
be apart on x. At 101 and 69 units of ink and dx 0 the two printed as `voCr@ate1V2i5lume 5Gi` for
200ms at a baseline gap of 0.00, and +-30 cleared that but put the call tag across the static
`CreateVolume` wire over 58 units of x. Both are gone because the call tag is now three characters.
NAMING   The riding tag says what the ball CARRIES, the wire says what the lane IS. `CreateVolume
         5Gi` said both, and the wire beside it already said the verb, so the two printed the word
         `CreateVolume` twice within 58 units of each other. The tag is `5Gi`, which is the size the
         claim asked for and the one thing on that ball the wire does not name.
NOTE     At 18 units of ink the call tag needs no offset at all: on its own lane it clears the wire,
         which starts 22 right of that lane, by 13, and the return tag beside it by 16.4 at
         1280x860. Only the return tag keeps an offset, which is why the constant is named for it.
`PARAMS_TAG_DY` -6 keeps the params tag inside the class box instead of astride its bottom edge, and
`PV_TAG_DX` -2 clears the provisioner edge.
```

### poster

```
Abstract, not the literal diagram: a claim on the left, a class "gear" in the middle, and a disk
being drawn into existence on the right (dashed outline, not yet solid). Made to order, not picked
off a shelf, so the shelf is absent entirely.
```

## storage-emptydir

### layout

```
WHAT     emptyDir lifecycle. A vertical stack, but the whole thing lives INSIDE one node boundary,
         because that is the point of an emptyDir: it is born on the node, lives on the node disk, and
         dies when the Pod leaves the node.
LAYOUT   The composition is centred on the canvas and lifted as high as the panel allows: measured at
         every step, the panel reaches (300, 163) on a comfortable 1600px viewport, so the node top
         sits flush under it. On narrower windows it grows to (399, 223) and may brush the node's
         top-left corner, an accepted trade. A longer narration invalidates the measurement.
LANES    volume-model grammar: the dim centre spine (ownership, no traffic) plus one L-shaped directed
         lane per container. Traffic is one-way per container (the app only writes, the worker only
         reads), so each side carries a SINGLE lane with an arrowhead for its one direction. The
         containers are pushed toward the Pod edges so their centres land outside the cylinder span,
         which is what makes the lanes L-shaped and lets them enter the cylinder through its SIDE.
MOTION   FADES exist for exactly one meaning: an object CEASING TO EXIST. The dies step ghosts the Pod
         and its directory in one simultaneous fade, so the delete reads as a single event, with the
         ghost opacities pinned statically so reduced motion and a mid-step cancel land on the dimmed
         state. Nothing else fades, the sizeLimit step included: it holds the directory at full opacity
         and carries its beat with the Pod pulse and the over-limit write instead. DO NOT give a
         container a crash flicker.
NOTE     The cylinder is visible from idle, deliberately, and the Pod is already on the node, so the
         truthful idle state is an existing empty directory. The create step then narrates how it came
         to be, flipping the chip to created empty.
```

### before `const NODE_X = 180, NODE_Y = 170, NODE_W = 840, NODE_H = 380;`

```
The Node frame is the outer extent and the chip strip spans exactly its width. NODE_Y 170 sits flush
under the panel measured at (300, 163) on a 1600px viewport, so a longer narration invalidates the
placement. storage-hostpath copies these numbers verbatim so the pair aligns.
```

### poster

```
The card in miniature: one node boundary holding the Pod (two containers) over a dashed, ephemeral
scratch cylinder. The signature side-entry L-lanes with chevrons tell the story in one frame: the
left container writes INTO the disk, the right container reads OUT of it.
```

## storage-ephemeral-storage-eviction

### layout

```
WHAT     Ephemeral storage limits. The whole scene is one node, CANVAS-CENTRED (210..990, centre 600),
         holding a vertical stack of the focus Pod over the three things that make up its ephemeral
         usage over the nodefs disk. The neighbour Pods, which matter only for the node-wide path, are
         a right-hand column INSIDE the node: they cannot leave it, because DiskPressure on THIS node
         is what evicts them.
CONTENT  The card must keep TWO eviction paths distinct. Path A is per-Pod: writable + emptyDir + logs
         going over limits.ephemeral-storage evicts THIS Pod at once, regardless of node health. Path B
         is node-wide: nodefs usage crossing the eviction threshold taints the node DiskPressure, and
         kubelet then evicts Pods ranked by Pod Priority and by how far each is over its request, which
         can hit a Pod that was within its own limit. DO NOT write QoS class as the ranking: the card's
         own distinct step contradicts it.
PANEL    COL_CX is 620 rather than the node's own 600, and that 20 unit offset is the whole story on
         this card. This narration is the longest in the storage set, so the panel reaches x<=397 all
         the way down to y=355, which covers BOTH the Pod tier and the contributor tier. At the old 480
         the Writable box (250..390) was 100 percent behind the panel, the Pod 21 percent and its app
         box 16. Shifting the stack right by 140 clears all three (the Writable box now starts at 390,
         seven units inside the panel's right edge at its worst, five percent of its area), and 620 is
         as far left as it can go while doing so. The disk moves with the row, so its three contributor
         lanes still drop on +/-160 either side of its own midpoint and stay a mirrored pair.
LANES    Every lane is ONE straight vertical segment: the disk is wide enough (440..800) that all three
         contributor centres drop straight onto its top, no corners anywhere.
NOTE     The `usage` chip reports what the Pod is USING and nothing else. On the request step, whose
         sentence exists to separate the two, it says the request does not cap that usage: a value
         reading `reserved by request` there makes the chip report the reservation instead.
SIZES    The `rank` caption is the tightest thing on the card and it is placed by MEASUREMENT, not by
         eye. It is 227 units wide and 14.6 tall, right-aligned on the neighbour column so it ends on
         970 and clears the node edge at 990 by 20, and it sits in the only free band there is: the
         19 units between the lower neighbour Pod (bottom 249) and the Logs box (top 268), leaving
         1.8 above and 2.6 below. DO NOT centre it on the column at y 284, which is where it was: at
         that x it runs straight through the Logs box and 4 units past the node frame. Lengthening
         the string is what breaks this, not moving it, because the right edge is pinned.
NOT A DEFECT
         Centring the node puts its top-left corner, and the node tag on narrow viewports, under the
         panel. That is the accepted price of the centring: a node frame is a container, not content,
         and the rule that counts occlusion skips it. Every content BLOCK stays clear.
         Kubelet is an accepted off-card actor, and this ruling covers the WHOLE CATEGORY. The
         `sources`, `podLimit`, `diskPressure` and `rankEvict` steps all make the Kubelet the
         grammatical subject although the card draws no Kubelet block, and every one of those
         statements is true of work only the Kubelet does. Storage has almost no Kubelet box by design,
         so the alternatives were a prose sweep over two whole cards into the passive voice, which
         throws the mechanism away, or drawing a Kubelet block, which is geometry. storage-hostpath is
         exempt on the same grounds. Do not file these again.
MOTION   THE CLOSING STEP LEAVES BOTH NEIGHBOURS WHERE THE RANKING PUT THEM. `rankEvict` takes pod-b and
         then pod-c, both to OPACITY.terminating, and `distinct` must name BOTH of them at that shade.
         Naming only pod-b restores pod-c to 1: measured off the settled frames, `rankEvict` ends at
         0.25 / 0.25 and `distinct` has to end there too, not at 0.25 / 1. No narration on the recap
         brings either Pod back, and a Pod that returns unannounced reads as the eviction being undone.
OPEN     The left third of the frame is empty for the same reason the node is centred. On a wide
         viewport, where the panel is short, it reads as empty rather than as reserved. Clamping the
         panel height in CSS is what would let this card put something there.
OPEN     Four chip values still stand at step entry ahead of the ball that earns them, and the card names
         them as the news of the step in `lit` (`sources` nodeChip, and usageChip / limitChip / nodeChip
         on `podLimit`), which is `FORM-B` of `P-03` rather than the weaker A. Read one by one, THREE OF
         THE FOUR MUST NOT MOVE. `sources` nodeChip is `filling`, and that step's own sentence says
         kubelet adds the three up CONTINUOUSLY, so cueing it on the last ball would say the disk starts
         filling when a ball lands. `podLimit` nodeChip is `below threshold`, a state of the NODE that
         holds all through the step and is the contrast the DiskPressure step turns over. `podLimit`
         usageChip is the SUM the three balls illustrate, the premise of the sentence rather than its
         news. The one that genuinely reads early is `podLimit` limitChip: it says `1Gi exceeded,
         evicted` from entry while the card animates the eviction it announces, the Pod fading at
         `land` + 150. Cueing that one ALONE breaks `P-04` against its neighbour usageChip, which must
         not move, so this stays open on the beat argument rather than on the cost.
```

### before `const COL_CX = 620;`

```
Not the node's own 600, and the 20 unit offset is the whole story: this narration is the longest in
the storage set, so the panel reaches x<=397 down to y=355 and covers both the Pod and contributor
tiers. 620 is as far LEFT as the stack can go and still clear it.
```

### poster

```
The node holds a low nodefs disk (clean outline, no fill) with its three ephemeral contributors
(writable + emptyDir + logs) raised just above it and tied down to the disk top by short lines,
linked by a dashed line to the Pod that draws on it. Everything sits inside the one node boundary.
```

## storage-ephemeral-vs-persistent

### layout

```
WHAT     The side-by-side card. One Pod straddling the spine mounts two volumes, an even distance left
         and right of it: LEFT ephemeral (an emptyDir owned by the node), RIGHT persistent (a PVC
         bound to a PV whose disk is a separate object, tied by a dim identity link, no arrowhead).
CONTENT  The Pod writes to both, is deleted, and is rescheduled onto another node. The emptyDir comes
         back empty (it was tied to the old node) while the PVC reattaches the very same disk with the
         data intact.
LANES    Each column carries TWO lanes so every direction has its own arrow: an OUTER write lane down
         to the volume and an INNER remount lane back up to the Pod.
PANEL    Because the diagram is centred on the canvas, the Pod's left shell edge passes under the
         panel. This card's panel bottoms out at y=181 (measured over 1600/1280/1100), and the Pod is
         sized and placed against that: 560 wide at y=90 leaves about a tenth of its area behind the
         panel at the worst viewport, against a sixth at 620 wide at y=66, which the OCCLUDED rule
         counted as a lost block. It cannot clear the panel outright without landing on the volume tier
         (the columns start at y=306 and the write lanes would shrink to stubs), so a tenth is the
         trade. Nothing essential is hidden: the pod() label and the app box are centre-anchored at the
         spine, and every volume sits below y=306.
         The divider between the halves starts under the Pod (POD_BOTTOM + 16) rather than at a typed
         206, so it can never poke into the Pod when the Pod moves. The three state chips are a single
         width on one pitch, centred on the canvas.
MOTION   THE DELETED POD BLINKS BEFORE IT GOES (`M-08`). The pulse stands alone at 0 and the fade of the
         Pod and its four lanes waits `BEAT.afterPulse`, so the blink is over before the shade moves and
         the two do not read as one event, which is the ordering `storage-volume-detach-on-node-loss`
         uses on `evict`. DO NOT fade the Pod at delay 0 with no pulse anywhere in the step, which
         `render/opacity.test.mjs` ORDER cannot see: it skips a fade that carries no pulse at all. The
         emptyDir keeps its 250 offset behind the POD FADE rather than behind step entry, so the mirror
         with the reschedule holds on that beat. Measured span 1700 against a duration of 2800.
MOTION   All three volumes are attached from the start of the remount step, so they light at entry.
         Then the two mount balls ride up their INNER lanes (volume to Pod) and the Pod pulses on
         arrival: the left mount carries nothing, the right mount carries the surviving row.
         THE RESCHEDULE OPENS ON WHAT THE DELETE LEFT, emptyDir included. Its rewind restores the Pod,
         the four lanes AND `ed` to the terminated shade. Leaving `ed` at the factory default of 1 opens
         the frame on a full-strength emptyDir over a ghost Pod, and an emptyDir outliving its Pod is
         the single claim this card exists to deny (`STO.S-02`). Measured at 350ms into the step: Pod
         0.78 with its lanes, emptyDir 0.22, so the directory follows the Pod up instead of predating
         it.
NOTE     The directory comes back 250 after the Pod, the exact mirror of the delete step, where it was
         wiped 250 AFTER the Pod went. A fresh emptyDir is made for the Pod on the node it lands on, so
         the Pod leads in both directions.
```

### before `const SPINE_X = 600;`

```
The Pod straddles this spine and each volume hangs an equal distance either side of it, so the halves
are a true mirror. The divider between them starts from POD_BOTTOM rather than a typed y, so it can
never poke into the Pod when the Pod moves.
```

### before `const MOUNT_TAG_DY = 12;`

```
Both remounts end on the Pod floor, and at -14 each tag spends 100ms cut by it and 400ms inside the
Pod. 12 below the ball is the ONLY offset that clears on all four viewports: at 14 and beyond the tag
meets the emptyDir cap and the PVC top, which sit 100 units under the Pod.
```

### poster

```
One Pod, two volumes, one split down the middle: after a reschedule the ephemeral emptyDir (left,
dashed and faded) comes back WIPED EMPTY, while the persistent PVC/PV (right, solid) reattaches the
very same disk with its data rows INTACT. The empty-versus-full contrast is the whole card.
```

## storage-fsgroup-ownership

### layout

```
WHAT     fsGroup and volume ownership. A volume mounts owned by root, so a container running as a
         non-root user cannot write to it. securityContext.fsGroup tells kubelet to chown and setgid
         the whole volume tree to that GID before the container starts. fsGroupChangePolicy then
         decides whether kubelet walks the entire tree on every start (Always, the default) or checks
         only the top-level directory and skips the walk when it already matches (OnRootMismatch),
         which is what keeps a volume of millions of files from adding minutes to every Pod start.
CONTENT  Two things this card asserted that are not true unqualified, both settled at
         https://kubernetes.io/docs/tasks/configure-pod-container/security-context/ .
         1. OnRootMismatch WEIGHS TWO THINGS, not one. "OnRootMismatch: Only change permissions and
            ownership if the permission and the ownership of root directory does not match with
            expected permissions of the volume". The API type agrees, at v1.FSGroupChangeOnRootMismatch
            ("only when permission and ownership of root directory does not match"). A tree whose root
            carries the right GID and the wrong MODE still gets the whole walk. The aria-label was
            already right, saying only "the top-level directory"; the last narration was the outlier
            and now names the owner AND the permission bits.
         2. KUBELET IS NOT ALWAYS THE ACTOR. FEATURE STATE Kubernetes v1.26 stable: "If you deploy a
            Container Storage Interface (CSI) driver which supports the VOLUME_MOUNT_GROUP
            NodeServiceCapability, the process of setting file ownership and permissions based on the
            fsGroup specified in the securityContext will be performed by the CSI driver instead of
            Kubernetes. In this case, since Kubernetes doesn't perform any ownership and permission
            change, fsGroupChangePolicy does not take effect". That retires the whole second half of
            the card wherever it applies, so it is a SCOPE limit rather than a wrong word, and it is
            paid for in the three strings that stated the mechanism as universal and nowhere else: the
            chown narration, which is where the actor claim is made and which precedes both policy
            steps, the desc, which is read on the grid with no narration under it, and the aria-label,
            which is the standalone summary of the drawn scene.
            DO NOT also qualify the Kubelet box sublabel ("applies fsGroup before start") or the
            fsgroup step ("Kubelet reads this before it ever starts the container"). Both survive the
            exception: kubelet applies fsGroup either way, by chowning or by handing the GID to the
            driver, which pkg/volume/csi/csi_client.go does as
            mountVolume.VolumeMountGroup = strconv.FormatInt(*fsGroup, 10) on the mount access type.
         3. ONCE IS PER MOUNT, NOT ONCE EVER. The chown step must NOT say the work is "done once at
            mount time" while the Always step says the default "walks and re-checks the entire tree on
            every single Pod start" and the desc says "The default walks the whole tree every start".
            Both cannot be the reader's takeaway, and the chown step is the outlier: it is where the
            mechanism is taught, three steps before the policy. It reads "done once per mount", which
            keeps the contrast the clause is written for (paid at mount, not per write), drops the
            false absolute, and is 4 characters SHORTER than it, which is the direction the PANEL
            budget wants. The `writes` step is scoped correctly, at "paid for once at startup".
LAYOUT   ONE spine, nothing beside it, in storage stack grammar: Pod app-0 over kubelet over the
         volume tree over the disk the tree lives on.
         WHY NOT put the disk and the tree SIDE BY SIDE on a shelf: that one choice causes most of
         what is wrong with the card. A shelf pushes the tree centre 95 units right of the spine, so
         the chown lane cannot land on the middle of the thing it is chowning, the write lane has to
         come down as a third off-centre line, and the disk is joined to the tree by a horizontal
         stub carrying no traffic. Stacking puts every arrow back on the block it points at.
         securityContext is an inner ROW of the Pod rather than a box under it, which is both truer
         (a field OF the Pod, not a peer of it) and what buys back the room the listing needs.
         Tier heights and gaps are declared once, summed, and the leftover split evenly, so the card
         centres by moving one number.
PANEL    Worst right / bottom across all 7 steps, the worst step being the chown:
           1920x1080 -> 203 / 177    1600x1000 -> 291 / 195    1440x900 -> 319 / 222
           1280x860  -> 378 / 235    1280x800  -> 358 / 259    1100x800 -> 397 / 280
           900x650   -> 386 / 495
         Reserved rectangle x<=397 AND y<=495. The narrowest block on the spine is the Pod at 226
         wide (left edge 487) and the widest the tree at 340 (left edge 430), so the x condition
         alone keeps every block out of the panel at any height and the stack is free to be centred
         vertically. The ONE thing that reaches left of the panel edge is the chip strip, whose first
         chip starts at x=134, and it sits at y=582: the 495 at 900x650 clears it by 87 units, which is
         the whole remaining budget on this card. A longer narration invalidates these.
         The chown narration is the deepest by a wide margin because it carries the VOLUME_MOUNT_GROUP
         scope limit (CONTENT 2 above): at 1100x800 it costs 75 units against the next deepest step.
NOTE     The container and securityContext share the Pod's inset, so their edges line up and read as
         two fields of one object. pod() puts its own label baseline at y+16, so the first row starts
         at 26 to clear it. The Pod carries NO sublabel of its own: runAsUser belongs to the
         container row, which is the thing actually running as that user.
NOTE     THE VOLUME TREE IS THE LOAD-BEARING ELEMENT.
WHY NOT  five blank rectangles with a ball swept across them: the one thing that actually happens
         during a chown, the ownership CHANGING, is then nowhere on screen and the sweep reads as
         decoration.
NOTE     Row 0 is the TOP-LEVEL DIRECTORY, and that is not cosmetic: OnRootMismatch is defined in
         terms of exactly that directory, so a labelled row is what lets the last step SHOW the rule
         instead of asserting it. Row 2 stands in for the rest of the tree, which is what makes the
         "minutes per start" claim on the Always step something the reader can see. A row is a
         `P.chip`, the same part kind as the strip along the bottom, because a row is also a name
         with a value against it: that brings the chip weight and colour, and it brings .highlight,
         which is how a row shows it has been visited.
DO NOT   hand-roll rows out of a scheme-box-rect at 3% inside a group at 0.75: that reads as grey
         furniture sitting BEHIND the tree rather than as content on it.
BUDGET   The gap between the name column and the owner column is where the walk lane runs, so it is
         sized off the longest string on each side:
           name  `... 4.2M more`  13 ch = 89, from local 12  -> ends local 101
           owner `root:2000 g+s`  13 ch = 89, to local 296   -> starts local 207
         The lane sits at local 154, with 53 units of clear space either side.
         CHIP_W 300 is the family EXCEPTION: fsGroupChangePolicy 131 + `Always (default)` 110 = 265,
         against owner 131 and write 107, so 300 clears the worst by 35.
LANES    The two lanes reaching the tree arrive on DIFFERENT EDGES on purpose, so neither shares an
         edge nor lands off centre. The chown comes down the spine into the TOP edge, kubelet acting
         on the volume, and the write comes in from the RIGHT on its own BYPASS, the container writing
         directly and never through kubelet. That bypass is the one structural fact this diagram can
         state that the narration cannot, which is why it survives as the only thing off the spine.
         The chown does not stop at the listing: it lands on the VOLUME, which is the whole reason it
         survives a restart and therefore the whole reason OnRootMismatch is allowed to trust it.
         DO NOT make W_PERSIST a bare markerless line on the reasoning that the disk backing the tree
         is a relationship: that is what made the disk read as scenery. A chown rewrites inodes ON it.
MOTION   The walk deliberately LEAVES the PKT_SPEED canon, because a walk is WORK and not transit.
         Both sweeps run at the SAME speed and differ only in how far they travel, which is the
         honest shape: OnRootMismatch is not a faster walk, it is a walk that STOPS after one entry.
         At WALK_SPEED the full listing takes about 1470ms and the single-directory check about
         470ms, a ratio the eye can compare directly. WALK_MIN_MS floors the short one so it stays
         longer than its own fade and reads as a check rather than as a glitch. The ball is LINEAR, so
         a row's moment is a pure ratio of distance, which is why the walk is `F.segment` not `F.route`.
         A row KEEPS its highlight for the rest of the step, so the listing fills in behind the scan
         and the finished frame shows how far kubelet got, which is what makes the last two steps
         comparable at a glance. Rows are readouts, not actors, so it is a static highlight, never a
         blink.
         The `owner` chip SUMMARISES that walk, so it waits for it (`P-03`). It holds the root:root
         the fsgroup step left and turns over when the ball reaches the last entry (`walk`, 2271ms),
         behind the three rows flipping at 1094, 1594 and 2094. Stated at t=0 it announced the outcome
         of a walk the reader then watches happen, against a listing the walk had just reset to
         root:root. `rewind` carries the roll-back, `chipsCued` keeps the end value.
NOTE     Every step writes EVERY row, so no row can be left displaying an ownership the current step
         has moved past. The state is whole-tree, because the tree is only ever entirely before the
         chown or entirely after it.
DO NOT   Let `walkMarks` alone carry the rows. It rides `F.run`, which is the ANIMATED path only, so
         every walking step also states its finished listing through `enter: showRows(...)`, which
         runs on BOTH paths; `walkMarks` then winds that state back and re-marks row by row as the
         ball crosses. Drop the `enter` and the static path shows an unvisited listing on the one
         card whose subject is the walk.
DO NOT   fire a ball with no pulse, or the one block the packet came out of is the only inert thing
         on the step.
NOTE     The volume is lit FROM ENTRY on the two policy steps, because there it is the SOURCE: every
         entry the scan re-checks is an inode read off this disk, which is where the narrated cost
         comes from, and on the OnRootMismatch step the ownership it trusts is the ownership sitting
         on that disk from the last start. Without it the rule looks like kubelet guessing.
NOTE     The `denied` step animates the write attempt as literal traffic: the process really does
         issue it and it really does reach the tree. What differs from `writes` is everything around
         it, so the same lane and tag read as a refusal here and success there. The disk stays dark,
         and that is the point: a refused write never reaches the volume.
NOTE     The last step draws the full-length lane underneath on purpose while the ball stops beside
         the top row, with the two rows below resting: seeing the scan NOT travel the listing is the
         whole point, and it is directly comparable with the step before. No block flash, it should
         come to rest.
```

### before `const CONTENT_CX = 600;`

```
Both columns are centred on this line, and POD_W / KUBE_H are the storage-category standards taken
from storage-csi-attach-mount and storage-csi-architecture, so the card sizes with its siblings
rather than on its own numbers.
```

### before `const CHIP_W = 300, CHIP_GAP = 16, CHIP_COUNT = 3;`

```
The family EXCEPTION: fsGroupChangePolicy + `Always (default)` measures 265, so 232 would collide and
300 clears it by 35.
```

### before `const WRITE_TAG_DX = 26;`

```
Both write tags ride the W_WRITE elbow, whose ends sit on the Pod and the tree side faces, so a
centred tag is cut for 600ms. The clear band starts at 20 for `EACCES` and at 26 for `write ok` over
the four viewports, and ONE number is taken for both, since two tags on one lane with different
offsets read as a slip.
NOTE     The fsgroup step carries NO riding tag, and that is the resolution of a finding, not an
         omission. `fsGroup: 2000` on that ball printed the securityContext sublabel a second time
         over itself, 81.8 x 7.8 of ink for 300ms at a baseline gap of 2.22, and it is not a
         geometry question: the two strings share the centre line, the corridor between the Pod
         floor (152) and Kubelet (192) is 40 units against a ball that travels all 40 and a tag ink
         box 10 tall, and no dy exists that clears both ends.
WHY NOT  Rewording it. Every candidate restates something already drawn: the field itself is the
         secBox sublabel it launches from, and what Kubelet does with it is the Kubelet sublabel it
         is flying at (`applies fsGroup before start`). With no honest string the tag is not
         information, and the ball on a lit `securityContext` box reads the step on its own, the way
         the untagged watch route does on `storage-volumeattachment`.
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
because the rows themselves are peers. Content sits 17..163 in a 180 tall box, symmetric about x=160.
```

## storage-generic-ephemeral-volume

### layout

```
WHAT     An inline volumeClaimTemplate written directly on the Pod under ephemeral. It gets a real PVC,
         a real StorageClass, real dynamic provisioning and a real CSI mount, so unlike emptyDir it can
         be large, of a specific class, and even snapshotted. But its lifetime is the Pod: the PVC
         carries an ownerReference back to the Pod and is garbage-collected when the Pod dies, which
         is why the identity column is the Pod owning its PVC owning its PV and the last gesture is
         that whole column collapsing.
LAYOUT   The identity column runs straight down the canvas centre line, with the StorageClass and the
         provisioner flanking the claim row equidistant from it. The gap above the claim row equals
         the gap below it, so the ownership and the binding read as one rhythm rather than as two
         different distances.
PANEL    Measured, panel bottom-right in viewBox units:
           1920x900  right 102  bottom 183      1600x1000 right 291  bottom 143
           1280x900  right 378  bottom 173      1100x900  right 397  bottom 149
           1280x860  right 397  bottom 205      1100x800  right 397  bottom 205
         Worst case x<=397 and y<=205, the deeper reading coming from the SHORTER window (`L-05`).
         Only the Pod sits inside that y band, and at 487..713 it clears on x while staying centred on
         CX. The claim row at y=212 clears the real floor by SEVEN units, so it must not move up. A
         longer narration invalidates this.
LANES    ONE axis, on CX itself, and EVERY wire on this card carries an arrowhead: there are no
         undirected lines left. The four column lanes share that axis (two up, two down) because no
         step shows both directions, and each goes out behind the cascade it carries on the closing
         step, so nothing is left pointing at a ghost.
WHY NOT  Hanging the ownerReference, the Bound link and the class reference as static dashed strokes:
         that puts three arrow-shaped things on the card that never fire, and forces all the real
         traffic 12 units off the block centre lines to get around them. Each of those three facts is
         carried by something that moves or by text that stays:
           ownerReference  a ball down the column on the step where the claim is created, stamping it,
                           plus the claim sublabel (owned by Pod), the caption beside the column, and
                           the lifetime chip. The same lane carries the cascade on the way out.
           Bound           the claim sublabel flips to Bound and the chip says so.
           the class       the ball out to the provisioner carries storageClassName: fast-ssd, which is
                           the field itself, and the class block lights as it is read.
MOTION   The owner step carries no packet and no Pod pulse, and the canon would allow it the one
         sanctioned block blink so it does not read as frozen. It deliberately does not take it: that
         step states a fact rather than moves something, and a brightness blink on a block that is only
         being pointed at reads as traffic that never arrives. DO NOT add it back.
         The ownership is a BALL, not a static undirected line hanging under the Pod: the claim is
         stamped with its ownerReference at the moment it is created, so the tag rides down and the
         claim comes up to full on its arrival.
         The claim defaults to OPACITY.pending rather than to 0: it is the middle block of a
         three-block row, and cutting it out leaves a hole in that row rather than an absence.
MOTION   THE DELETED POD BLINKS BEFORE IT GOES (`M-08`). On gc the pulse stands alone at 0 and the Pod
         fade waits `BEAT.afterPulse`, so the blink is over before the shade moves, and the cascade
         leaves at `GC_SEND` 1600, a `BEAT.afterHop` after the Pod has finished going rather than while
         it is still fading. Measured span 3800 against a duration of 4200, so the beat costs nothing.
BUDGET   Family CHIP_W 232: worst case is `backing` + `mounted at /scratch` at 26 characters, so
         26 * 6.89 + 24 of padding is 203 against the 232 available.
```

### before `const CX = 600;`

```
Pod, PVC and PV all sit on this axis and the two machinery blocks flank it symmetrically. Every one
of the four column lanes runs on CX itself, which is what lets each arrowhead land dead centre on the
face it enters.
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

## storage-hostpath

### layout

```
WHAT     hostPath, on the same skeleton as the emptyDir card, because hostPath is the other node-local
         volume and the two must read as a pair. The whole card is the CONTRAST: an emptyDir is
         scratch the kubelet makes FOR the Pod, a hostPath is a raw window onto a directory that
         ALREADY LIVES ON THE NODE and belongs to it.
LAYOUT   TWO DELIBERATE FAMILY VARIATIONS, both carrying the lesson:
           1. NO OWNERSHIP SPINE. volume-model and emptyDir draw a dim spine from the Pod down to the
              disk because the volume belongs to the Pod. Here the directory belongs to the NODE, so
              that spine is intentionally absent: the Pod and the host directory read as two separate
              things joined only by the mount lanes. The empty gap at x=600 IS the message.
           2. THE reschedule STEP INVERTS emptyDir's dies STEP. emptyDir ghosts the Pod AND its
              directory together (both owned by the Pod). hostPath ghosts ONLY the Pod and its mount
              lanes while the host directory stays lit at full opacity, because the directory is the
              node's and outlives the Pod on that node. That single visual inversion is why hostPath is
              not persistence.
         Geometry is emptyDir's VERBATIM so the pair aligns tier for tier.
PANEL    The panel reaches about (300, 163) here and the Node top sits flush under it. A longer
         narration invalidates that measurement.
LANES    Two directed L-lanes, exactly emptyDir's. The app writes DOWN into the cylinder side, the
         agent reads UP out of the far side.
MOTION   The mount step is the one that carries no ball at all: kubelet bind-mounts the existing host
         directory INTO the containers, so the cylinder AND both container boxes are lit from entry
         and the pulse falls in the same beat.
NOT A DEFECT
         The `mount` step names the Kubelet as the subject although this card draws no Kubelet block
         (it is the only narrated step that does; `idle` carries no narration at all). Left as
         written, under the category-wide ruling recorded on storage-ephemeral-storage-eviction. Do
         not file it again.
```

### before `const NODE_X = 180, NODE_Y = 170, NODE_W = 840, NODE_H = 380;`

```
Geometry is storage-emptydir's VERBATIM, so the two node-local cards align tier for tier and the only
differences a reader sees are the two deliberate ones: no ownership spine, and the directory
surviving the Pod.
```

### poster

```
Pair to the emptyDir poster, same node + Pod + side-entry L-lanes, but the backing cylinder is SOLID,
not dashed: a hostPath is a raw window onto a real directory that already lives on the node, not
ephemeral scratch. The left container writes INTO it, the right reads OUT.
```

## storage-mount-path-chain

### layout

```
WHAT     Where the bytes land. The literal mount chain on ONE node: the single attached block device
         is mounted exactly ONCE at a global staging path, and that one staged filesystem is then
         bind-mounted into each Pod private directory, surfacing as /data. Two Pods share one staged
         device through two SEPARATE bind mounts: that fan out is the point.
         A mount RISES, then a write DESCENDS that same chain along the same lines turned around,
         because it is the same mounts traversed the other way and not a second path.
LAYOUT   Every tier is symmetric about ONE derived centre. WHY NOT two centres: the block stack
         symmetric about 720 (shoved right to clear the panel) with the chip strip running 60..1004
         for a centre of 532 gives 60 units of margin on the left against 180 on the right, with a
         dead band down the right edge. The two-column width is the only lever on where the diagram
         sits, and it is solved for: 2*COL_W + COL_GAP = CONTENT_W puts CONTENT_CX exactly on 600.
         Every corridor between two tiers is the same 60 units, so every hop is the same length and
         therefore the same 700ms (routeDur floors short paths), which keeps the chain reading as one
         steady walk rather than a set of unequal jumps.
         The stack is CHAINED off one origin rather than carrying five hand-typed tier positions, so
         it centres by moving a single number. Typed tier by tier from 44 it put the content at
         44..622 in a 640 canvas: 44 units of air above against 18 below, sitting visibly low.
PANEL    Worst step, right / bottom by viewport:
           1920x1080 -> 203 / 130    1440x900 -> 319 / 163    1280x800 -> 358 / 189
           1100x800  -> 397 / 205     900x650 -> 398 / 344
         x<=398 and y<=344. LEFT_X 400 has about 2 units of slack and cannot move left at all. The y
         reading never has to be cleared on its own, because the x reading already does the work:
         every block starts at 400 or further right, so nothing lands under the panel at any height.
         That is what lets the stack be centred vertically for free.
BUDGET   COL_W is floored by the longest string any block carries, and here that is a filesystem PATH,
         because showing the real paths is the point. Measured, scheme-box-sublabel at 5.9 u/char:
           `/pods/uid-a/volumes/vol-1`          147.5  -> the bind boxes, the binding constraint
           `/plugins/.../csi/vol-1/globalmount` 200.6  -> the staging box, 400 wide, so free
           `mount point`                         64.9  -> the container box inside a Pod, 152 wide
         COL_W 180 leaves 16 units of air either side of the bind path.
         WHY NOT an enclosing node() frame, even though everything lives on one node: a frame needs 16
         units of padding per side, which drags COL_W to 164 and forces the bind path to be
         abbreviated. The narration says "on the node" for free; the path string cannot be bought back.
         CHIP_W 232 clears the worst pair with ~29 units, at 6.88 u/char:
           bind mounts 75.7 + `Pod A and Pod B` 103.2 = 178.9    device 41.3 + `/dev/nvme1n1` 82.6 = 123.9
           disk mounted 82.6 + `not yet` 48.2 = 130.8            data copies 75.7 + `none` 27.5 = 103.2
         Corridor captions sit at the vertical middle of their corridor. The innermost lanes are the
         two column centres, 490 and 710, so a caption centred on CONTENT_CX has 110 units either
         side; holding 8 off the nearest lane gives a half-width of 102, a CEILING of 29 characters.
         The disk caption goes UNDER the cylinder, in the 32 units between the disk and the chips.
LANES    A corridor never shows more than one arrow at a time: when the write descends, the mount
         arrow is replaced IN PLACE by one pointing the other way and the ball rides that. So a given
         corridor is one single line that points up while the chain is being built and down while the
         write is followed, which is both what the reader sees and what actually happens.
         WHY NOT give each direction its own lane at -12 and +12: that balances only on the final
         step, the one step where a descent lane is visible at all. On the four mount steps before it
         every arrow sits 12 units left of its own block with nothing on the right, so the whole
         diagram reads as skewed. WHY NOT centre only the corridors that never carry a descent: worse,
         because Pod A and Pod B are drawn as mirror columns and that leaves one centred and one not.
         The card-local `flip()` crossfades the reversed pair as two `F.fade` entries so it reads as a
         ROTATION rather than as one line being swapped for another: both run the same 300ms on the
         same centre line, scheduled just before the ball sets off, so the line always points where
         the ball is about to go.
NOTE     Column L and the spine carry the chain from the FIRST step, because that chain IS the
         diagram and the reader should see its shape immediately. Pod B is held back and faded in
         when the card first claims it: a new fact, not standing structure.
MOTION   Pod A is driven back to OPACITY.pending, 0.55, and faded up in step with its arrival pulse,
         because it is dim until the volume actually surfaces inside it.
         Each corridor turns around just before its ball uses it, so the chain visibly reverses ONE
         LINK AT A TIME ahead of the write.
         The static end-state of the write step is the WHOLE CHAIN lit, because by then the ball has
         arrived at each of the three blocks in turn. Lighting only the device would make a
         prev/reset replay show a different ending than a forward play.
DO NOT   Put .highlight on a container box, here or at step entry. Lighting ctrA on arrival and again
         statically on the write step leaves /data outlined long after the ball is gone and makes the
         blink read as a state change rather than an event.
NOTE     Two of the four chips never change on purpose: the device is the fixed bottom of the chain,
         and `data copies: none` holding from the first step to the last IS the claim the card makes.
NOTE     The card-local `stage()` builds the whole `opacity` field, and EVERY step states it, so a
         prev/reset replay lands on the right skeleton and a mid-step cancel cannot leave a lane
         stranded at the opacity some earlier animation was driving it toward (`STO.S-01`). Mount and
         write are one exclusive pair inside it rather than two independent flags, which is the whole
         point: `rewind` then restages that pair from the end state for the animated path alone.
```

### before `const LEFT_X = 400;`

```
The panel wall. CONTENT_W is COL_W * 2 + COL_GAP rather than typed, so the two columns re-solve
together and the corridor between them stays centred.
```

### before `const CHIP_W = 232, CHIP_GAP = 16, CHIP_COUNT = 4;`

```
Sized against `bind mounts` + `Pod A and Pod B` at 178.9, ~29 units of air at 6.88 u/char.
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

## storage-multi-attach-error

### layout

```
WHAT     The consequence card for storage-access-modes. An RWO volume may be attached to ONE node at
         a time: the old Pod holds it on node-1 through a VolumeAttachment saying attached true, a
         rolling update stands the replacement up on node-2 before the old one is gone, the attach
         and detach controller cannot write a second attachment for the same volume, and the new Pod
         hangs in ContainerCreating with "Multi-Attach error for volume".
SCOPE    node-1 is HEALTHY from the first frame to the last, and that is the whole boundary against
         storage-volume-detach-on-node-loss. Nothing is broken here: the volume is legitimately held
         by a Pod that is legitimately running, and the only reason the new Pod waits is that its own
         rollout strategy created it before deleting the old one. An ORDERING problem with an
         ordering fix (Recreate).
DO NOT   Re-tell the unreachable-node case, the unreachable-toleration and force-detach clocks, the
         roughly six minutes, or the two-writers-corrupt-one-filesystem argument. Those belong to the
         detach-on-node-loss card, and told on both the pair reads as one card shown twice. If a
         timeout shows up in this file again, it has drifted.
LAYOUT   FOUR tiers, one per object in the chain: the claimants, the decider, the two records it
         writes, the contended disk.
         A MIRRORED PAIR about CONTENT_CX, lanes included, so the only thing that differs between the
         halves is state, never geometry. The tiers narrow and widen symmetrically rather than running
         as a straight column: widest at the fork, narrowest at the decider, which is the shape of the
         sentence: one component, two records, one disk.
         Heights and gaps are declared once, summed, and the leftover split evenly, so the whole card
         centres by moving one number. WHY NOT typing each tier y: they sat 44..628, which left the
         node row 30 units of air while the three lower tiers were packed at 52.
NOTE     CONTENT_W puts CONTENT_CX exactly on 600, and that exactness matters because the chip strip
         at 976 units is far wider than the diagram above it and is therefore the tier that sets the
         visual centre: on 600 it spans 112..1088, so the margins agree at 112.
DO NOT   widen CONTENT_W, or the strip slides right while every other tier still looks internally
         symmetric, which is the failure mode that shipped in the sibling cards.
PANEL    Worst step, right / bottom by viewport:
           1920x1080 -> 203 / 130    1440x900 -> 319 / 163    1280x800 -> 358 / 189
           1100x800  -> 397 / 205     900x650 -> 398 / 344
         So x<=398 and y<=344, read as an L: above 344 nothing may sit left of 400, below it the full
         width is free. The two upper tiers start at LEFT_X or inside it, while the VolumeAttachment
         row at y=359 hangs 96 units further left on each side because it clears the panel's bottom.
BUDGET   The longest narration is 350 characters (`fix`), and that headroom is BOUGHT. The panel grows
         one ~31 unit line at a time at 900x650, and at 383 characters the bottom lands at 406 and
         buries the left VolumeAttachment. The line counts under that model, seven of the eight
         positions on the 313 line and only the POSTER wrapping one further to 344, were taken against
         a ~290 character worst case and are STALE at 350: the 344 in PANEL is the figure they set and
         it has not been re-taken. Clearance over the VA row is 16 units, ONE line of narration.
         Re-measure after editing prose, not only after moving geometry, and measure the poster:
         `idle` carries no narration of its own, it shows step one's text, and that is the reading
         that binds here. The three standard viewports come back from
         `OVERLAY_IDS=storage-multi-attach-error node --test report/overlay.test.mjs` run in
         `scheme/test`; the 900x650 row is a hand sample and stays one.
SIZES    Block sizes follow storage-csi-architecture (family box 232 x 76). The controller is the one
         exception on width and it is FORCED: `Attach/Detach controller` renders about 252 units, so
         a 232 box clips its own label. It keeps 300, leaving ~24 of air.
         NODE_W is floored by the widest string in a column, the Pod sublabel `Multi-Attach error` at
         ~113 units, leaving ~17 either side.
         APP_H is centred in the Pod's free band, leaving 10 under the Pod label and 13 above the
         sublabel. DO NOT run it 40..86: the sublabel glyphs start at 87 and collide on both Pods.
         CHIP_W 232 clears the worst name+value pair with ~44 units between the halves. Each total is
         the name plus the value plus the 24 units of chip inset, against the 232:
           new Pod 44 + `scheduled on Node-2` 120 = 188        blocked by 63 + `old Pod running` 95 = 182
           accessModes 69 + `ReadWriteOnce` 82 = 175           attached to 69 + `Node-1` 38 = 131
NOTE     The controller is 300 rather than spanning the node columns at 400, and that is what makes
         the fan below possible: its two output lanes leave its SIDE WALLS at mid-height and step
         outward before dropping, so the narrower it is the more room they have before the hard left
         limit at 398. At 400 wide the left lane starts travelling left from 400 itself and runs
         under the panel; at 300 it starts at 450 with 30 units of clear step-out.
NOTE     VA_CX 420 / 780 is a HARD FLOOR on the left. Each lane drops from BAND_MID_Y 265 to VA_TOP
         359, all of it above the panel bottom at 344, so the lane must stay right of 398; 420 keeps
         22 units. The BOXES are free to hang much further out, because at VA_TOP 359 they are
         already below the panel: at 232 wide the left one spans 304..536, reaching 94 units past the
         limit binding its own lane. That asymmetry between where a LANE may go and where a BOX may
         go is the whole reason this tier can be the widest in the diagram.
LANES    Traffic is NOT mirrored even though the boxes are: only the new Pod ever asks for anything,
         so only column B has a request lane, and an arrow under the old Pod would point at a request
         that is never made.
         That request lane starts at the NODE frame, not the Pod inside it: the controller acts on
         nodes, and what it is asked for is an attachment to node-2. It steps IN to the controller's
         top face centre, because a bare vertical down the column meets the controller 40 units short
         of its centre and reads as stopping on a random point of an edge.
         The controller's two outputs leave its SIDE WALLS at BAND_MID_Y. DO NOT drop them straight
         out of the underside: that reads as two lines threaded through a slab rather than as two
         outputs of one component.
         Each attach lane then makes one 90 degree turn into the disk's SIDE WALL, so the two Ls face
         each other and the pair reads as two claimants closing on one volume from opposite sides,
         with the middle of the corridor left free for the band caption. WHY NOT a funnel into the top
         face: both lanes then share a final vertical and land one arrowhead on one point, losing the
         mirrored pair that is the whole shape of the card.
BUDGET   The band caption sits in the corridor 303..359, centred on CONTENT_CX, running between the
         two descending lanes at 420 and 780: 360 units of clear width. The longest, `each side waits
         for the other`, measures ~193. Overrun 360 and the caption sits on an arrowhead.
MOTION   THE REFUSAL is the idiom shared with storage-access-modes: a ball travels to the deciding
         block and STOPS there. Through the BLOCKED STRETCH nothing continues past the controller,
         va-2 never lights, and no lane is drawn under it at all, because the object is wanted, not
         wired up. Both of those end on the `attach` step, which is where the write is finally
         allowed: va-2 lights on that arrival and its two lanes come up with it, and they stay up on
         the closing step.
         DO NOT fade va-2 in AT FULL as the refused request lands: that says the object was created
         and then blocked. The controller reports the Multi-Attach error BEFORE writing anything, so
         through the whole blocked stretch there is no va-2 in the API, which is why it sits at
         OPACITY.pending and why its sublabel says `wanted, not written`.
         The deadlock step animates NOTHING, deliberately: its subject is that neither side does
         anything at all. DO NOT use the sanctioned packet-less block flash on va-1, because a
         blinking attachment reads as activity. The closing step also comes to rest, no packet, no
         pulse, no flash: the reader is meant to sit and read it.
MOTION   THE CHIP BEATS (`P-03`), measured with a real-time probe rather than a frozen one, because a
         deferred `F.set` rides an `onfinish` and a paused animation never fires one. On `detach` the
         two chips read what `wait` left (`Node-1` / `old Pod running`) until the detach ball reaches
         the disk at 2300, and va-1's own state line turns to `deleted` on the earlier delete arrival
         at 1500: the object is removed then, the volume only belongs to nobody once the detach lands.
         On `attach` there are three beats, 1500 / 2300 / 2400: the write creates va-2 (`Node-2,
         attached: false`), the attach makes the field true and the `attached to` chip read Node-2, and
         the Pod chip and the Pod state line both reach `Running` on the blink, together (`P-04`).
         `attached: false` is not an invented state: it is the same two-beat vocabulary
         `storage-volumeattachment` is built on, and without it the box read `attached: true` for the
         800ms between the write landing and the attach landing.
WHY NOT  Turning `blocked by` over on the delete arrival (1500) instead of the detach (2300): the chip
         answers what blocks the NEW Pod, and what blocks it is the volume being held, not the object
         existing. Both chips therefore ride one arrival and stay on one beat.
MOTION   THE HAND FROM OUTSIDE LANDS ON THE POD FIRST, and two constraints below ride on that order. The old Pod blinks at 0, fades over `FADE.out` from `BEAT.afterPulse`, and its state
         line turns to `deleted` on that same beat, so the va-1 delete ball (`BEAT.lead`, the same 800)
         leaves as the deletion that causes it happens. Measured composite alpha on the animated path:
         1.0 at 800, 0.90 at 1000, 0.65 at 1200, 0.12 from 1500, va-1 and its two lanes following at
         2300..3000. THE BLINK COMES FIRST AND THE FADE FOLLOWS IT (`M-08`): a Pod that fades with NO
         pulse anywhere in the step is invisible to `render/opacity.test.mjs` ORDER, which skips a fade
         that carries no pulse. `deleted` must not stand from step entry over a Pod at full strength.
         What carries this is the ORDER and not the timing: the delete and detach arrivals are 1500 and
         2300 and the span is 3001 against a duration of 3400.
         The blink is the right cue here even though the deletion comes from outside the card: the Pod
         is what the hand acts ON, which is the same reading `cluster-node-drain` and
         `workloads-force-deletion` take for an evicted and a force-deleted Pod.
NOTE     va-1 gives its highlight up once it has finished fading: a deleted object must not wear the
         border that means "acting right now" (unlightAt).
NOTE     The new Pod has NO dim `booting` state.
DO NOT   sit it at 0.55 and pulse it through pulsePodDim, which stacks an opacity swing on the
         standard blink and reads as a faster, busier pulse at the identical 900ms. The OLD Pod
         stays at FULL through step 4: the entire problem is that it is still very much alive and
         still holding the attachment.
NOTE     node-2 is ABSENT at rest, not empty. An empty frame from the first frame says the second
         node is already part of the picture and merely unused, the opposite of the setup. The
         request lane is likewise OFF until the step that rides it: a lane appears when it first
         carries traffic.
NOTE     The kubelet mount is not drawn as a hop: it is the subject of the CSI cards, and a lane from
         the centred disk back up into the right column would cut across the VA row and the
         controller. The Pod blinks one beat after the attach lands instead.
CONTENT  `old Pod running`, not `old Pod still running`: the longer string measures ~131 against a 69
         unit name, leaving 8 units between the halves, which reads as one run-on field.
NOTE     `P.node` places its caption in GROUP-LOCAL coordinates. Use it: appending a caption with an
         ABSOLUTE x into the translated group displaces it a second time and puts node-2 at x=1614,
         outside the viewBox. Its local y is dropped from 18 to 14 so it titles the frame rather than
         floating inside it.
WHY NOT  The controller alone in the bottom LEFT corner at x=60 with the nodes and disk up and right:
         a large dead region through the middle, and content under the panel.
```

### before `const LEFT_X = 400;`

```
The panel wall, read as an L: above y=344 nothing may sit left of it, below that the full width is
free. The two upper tiers obey it, the VolumeAttachment row at y=359 does not have to.
```

### before `const G_NODE_BAND = 56, G_BAND_VA = 56, G_VA_DK = 48, G_DK_CHIPS = 22;`

```
Heights and gaps are declared once, summed, and the leftover split evenly, so the whole card
re-centres by changing one number. Typing each tier y is what left the node row 30 units of air
while the three lower tiers were packed at 52.
```

### before `const WRITE_TAG_DX = 32;`

```
The write leaves the controller right face, so a centred tag straddles that edge for 500ms. There is
no clear dy in +-80 on three of the four viewports, so the fix is on x: +32 is the least that clears
all four, where +30 clears 1600x1000 alone.
OPEN: `delete va-1`, the mirror on the detach step, needs -36 and stays where it is.
```

### poster

```
The disk locked inside a closed circuit of waiting. The card's subject is not that a node died, it is
that nothing is broken at all: the controller will not delete the attachment while the old Pod runs,
and the rollout will not delete that Pod until the new one is ready, which it cannot be without the
disk. That is a CYCLE, and a cycle is a shape, so the poster draws it literally: a continuous dashed
track with the volume sitting inside it, unable to leave.

WHY NOT one solid claim against one dashed one: the same picture as half the catalog, saying only
"one is denied", putting the emphasis on a rejection when the interesting part is that both claimants
are legitimate and alive. The two blocks on the ring are IDENTICAL, at equal weight, because neither
of them is the problem.
WHY NOT a break in the track: an opening promises a way out, and there is not one until something
outside the loop (Recreate) cuts it.

The loop is two ARCS BETWEEN the blocks, not one continuous track with the blocks laid over it. That
fails in a way only a render shows: a rounded rect passing behind a translucent box still shows its
dashes straight through the fill, so the line reads as crossing the block rather than arriving at it.
Arcs that START and END on the block edges make the two blocks stations ON the cycle.

Both arcs run to the CENTRE of each block and the track is MASKED by the two block rectangles, which
cannot be done with z-order: the blocks are filled translucent white, so a dashed line underneath
still shows through. One ellipse, rx 100, ry 59, centred on (160, 90), so the apexes land on 31 and
149. The two chevrons sit there, top pointing right and bottom pointing left, which resolves to
clockwise and gives the eye a direction to travel and never finish.

The disk carries 0.04, the fill the rest of the storage posters give a cylinder body. At 0.14 it
reads as a different material from every sibling in the grid.
```

## storage-projected-volume

### layout

```
WHAT     Projected volumes: one directory assembled from several sources at once. The gesture is a
         FAN-IN, and EVERY source mid-height equals its file row mid-height so all four lanes are
         pure horizontal segments.
CONTENT  The card leads to the serviceAccountToken source, the one that matters. Unlike the old
         forever-valid Secret-based token, a projected token is short-lived and audience-bound, and
         kubelet ROTATES it in place before it expires, rewriting the same file with a fresh token and
         no restart. The rotation is the beat the card builds to.
LAYOUT   The Pod sits over the DIRECTORY column only, and the sources are cluster objects, so their
         column sits out from under it. Content is centred on the canvas.
WHY NOT  Running the Pod flush over both columns: the source column then sits under it as though the
         ConfigMap and the Secret lived inside the Pod, and it drags the drawing into 330..970 (centre
         650) with the lower left third of the canvas empty.
LANES    The two Pod lanes are four-point Z shapes and each turns TWICE: they meet the Pod floor 100
         either side of its centre, run out along a corridor of their own (META_ELBOW_Y 232 down,
         READ_ELBOW_Y 200 up) and then turn again into the column they address.
         downwardAPI sits FIRST in the source column exactly so the metadata drop crosses nothing.
         The pair either side of the Pod centre is the point: a 640 wide face with one lane out at 440
         and another at 800 reads as two lanes that missed, and both were reported as such. 100 is also
         inside the 18 percent of the face that the rule treats as still on the midpoint, so the pair
         is legible as a pair rather than as a tolerance.
PANEL    This card's panel bottoms out at y=181 (measured over 1600/1280/1100). The Pod at y=56 is the
         only tier inside that band and starts at x=330, and the source column below it starts at
         y=264, well clear. The metadata corridor at y=232 is what those 181 units pin: it cannot rise.
         A longer narration invalidates this.
MOTION   Only the Pod pulses: it is the source of downwardAPI metadata and the reader of the token.
NOTE     The directory draws ONE downwardAPI row, `labels`, so the narration, the source sublabel and
         the riding tag all say labels and stop there. Listing four kinds of Pod metadata as what is
         projected, while one file is drawn, gave that step three different inventories at once.
NOTE     Each chip reports the token that is DRAWN, the projected one. The `expiry` chip therefore
         says that token expires even on the closing comparison step, and the legacy token that never
         expired is left to the narration, where the contrast belongs.
NOT A DEFECT
         The projected directory is an ENCLOSURE, not a receiver, and this stays open in the tool on
         purpose. `report/arrival.test.mjs` R3 reports the block as lit at step entry while four balls
         land inside it at 700ms. The finding is correct about the facts and wrong about the defect:
         each ROW lights on its own ball arriving, which is the arrival the reader is meant to see, and
         dimming the enclosing frame until the first ball lands would draw a directory that does not
         exist yet on the step whose whole subject is four sources feeding one directory that does.
         The rule cannot tell an enclosure from a destination, and a card-level exception list would
         hide the real ones, so the finding is left reported. The downward step on this same card is
         the opposite case and R3 binds there: `srcDown` lights `at: 'meta'`, on the arrival, because
         downwardAPI is a genuine mid-chain receiver.
```

### before `const POD_X = 330, POD_Y = 56, POD_W = 640, POD_H = 120;`

```
The Pod sits over the DIRECTORY column only. Running it flush over both columns puts the source
column under it, as though the ConfigMap and the Secret lived inside the Pod, and drags the content
bbox to 650.
```

### before `const READ_TAG_DY = 14;`

```
The read lane ends on the Pod floor, where -14 puts the tag under the shell edge, 100ms of cut and
400ms inside the Pod. Below the ball only 12 and 14 clear all four viewports, and 14 is taken so the
ball does not print on the top of the line.
```

### poster

```
The essence, not the layout: four scattered sources converge fan-wise on ONE mount point at the
folder edge, inside it the keys sit as even file lines, and the token thread (bottom source, its
lane, its file line) burns brighter than the rest.
```

## storage-pv-lifecycle-phases

### layout

```
WHAT     The one genuine state machine in the storage family. The middle band is a ROW of the four
         phases a PV status field can hold, with exactly one lit at a time. The row is the BOARD, not
         the object: the phases are places and the volume is whichever place is lit. That distinction
         is what lets the card show the Delete outcome honestly, because a deleted PV does not move
         to some final phase, it LEAVES the board and every box goes dark.
CONTENT  Four phases, not five. k8s.io/api/core/v1 also defines VolumePending, so the API type has
         five constants, but the upstream Phase docs list only Available, Bound, Released and Failed,
         and Pending is not something a PV is observed sitting in on a modern cluster. The card
         teaches the documented four and the narration says the lifecycle runs through them, never
         that the status field can hold only these. DO NOT "complete" the row with a fifth box.
CONTENT  Reclaim policy defaults are PER-ORIGIN and the narration says so explicitly: Delete for
         dynamically provisioned volumes, Retain for a PV created by hand. Calling Delete "the
         default" flat out is only half true.
SCOPE    Deliberately NOT drawn: the backing disk. Every other storage card puts a cylinder on a
         bottom shelf, and this one does not, because its subject is the PHASE FIELD of the API
         object rather than the bytes behind it. What happens to the real storage asset under each
         reclaim policy is the whole subject of storage-reclaim-policy. A cylinder here would either
         duplicate that card or need a spine the backward edge would have to cross.
LAYOUT   ONE pitch governs the card: the phase box width plus the gap each forward transition lane
         lives in. Four phases at that pitch centre the row on the CANVAS, and every other x derives
         from the same grid.
         The two top actors reuse it: the claim sits dead above Bound, the phase it puts the volume
         into, and the PV controller dead above Released, the only phase it ever acts on, so its lane
         is a straight vertical drop with no dog-leg. Their band is centred on 600 too, so the pair
         reads as concentric with the wider row beneath it.
PANEL    A centred four-phase row cannot dodge the panel HORIZONTALLY, because staying centred on 600
         is the whole point and its leftmost box lands at 182, deep inside the panel column. So the
         row dodges it VERTICALLY, sitting below the panel over every sampled viewport. WHY NOT keep
         the row at y=250 inside the panel band and pay horizontally: all four boxes then shove right
         to x>=420, which puts the row centre at 780 against a canvas centre of 600 and leaves a 420
         unit left margin against a 60 unit right one. Dropping the row under the panel buys back the full width and
         costs only vertical room, which this card has to spare because it carries no disk shelf.
         MEASURED across widths 1920 down to 900. Worst step (reclaim-delete, 344 characters), right
         / bottom by viewport:
           1920x1080 -> 203 / 146    1440x900 -> 319 / 183    1280x800 -> 358 / 213
           1100x800  -> 397 / 255     900x650 -> 398 / 406
         The right edge is driven by the VIEWPORT, not the text, so the 398.29 at 900 wide is a
         property of every card in the catalog, and the house value of x>=400 clears it by 1.7 units.
         The BOTTOM is driven by the text, so it is this card's own number and lengthening any
         narration invalidates it. DO NOT quote 201 for it: that figure reproduces at no width and on
         no step, and the two measurements nearest it are 212.67 on reclaim-delete at 1280x800 and
         204.97 on recover at 1100x800. So the card splits the
         difference: the actors live in the top band held to x>=400, and everything reaching left of
         400 (the phase row and the dog-leg feeding it) is kept as low as the card can put it, which
         is low enough over the sampled viewports and not low enough at 900x650, see the OPEN below.
         Both the bind dog-leg and the backward arc turn in ONE corridor at TRANSIT_Y, the exact
         midpoint of the gap it crosses, so the horizontal run sits centred in its band rather than
         hugging the row. It also has to clear the panel, because both runs reach left of 400, and
         the number that binds is the panel on the STEPS THAT DRAW THEM rather than the card worst:
         the dog-leg is on stage on bind alone (deepest sampled 166.30, at 1280x800) and the arc on
         recover alone (deepest sampled 204.97, at 1100x800), so at 214 the corridor clears by 9.0.
         Those two constraints very nearly collide, which
         is what sets the height of everything above: the actor band cannot go lower and the row
         cannot go higher without pushing the corridor into the panel.
OPEN     TWO STANDARDS, AND THEY DISAGREE. Over the three viewports the harness samples
         (`report/geometry-soft.test.mjs` OCCLUDED, `report/overlay.test.mjs`) the deepest this panel
         goes is 254.66, which the phase row at y=300 clears by 45.3 and which the corridor at 214
         clears on both of the steps that draw it, so nothing reports. The 900x650 hand row is
         stricter by 151 units: there the panel reaches 405.51 on reclaim-delete and the Available
         box, measured ink x 182..346 over y 300..372, is ENTIRELY behind it. The same box is 61
         percent covered on retain-parked (343.94), 18 percent on reclaim-failed and on recover
         (313.16), and clear by 17.6 on the other three steps. The corridor is buried on both of its
         own steps too, by 68.4 on bind and 99.2 on recover. Nothing can be moved to close it: the
         row cannot drop, because the event labels sit at 392, the admin actor at 440..508 and the
         chip strip at 548..582, and it cannot shift right without giving up the centre on 600 the
         whole card is composed around, which the WHY NOT above prices at a 420 unit left margin.
LANES    Actors that DRIVE transitions sit above the row, and the one actor driving the single
         backward edge sits below it. Each transition is a real event, so it is a lane that CARRIES a
         ball when it fires.
         The backward edge runs OVER the row rather than under it. WHY NOT loop underneath: it lands
         in the same band as the admin lane, and the two then arrive at the underside of the row
         pointing the same way, so the pair reads as one broken fork instead of two unrelated events.
         It leaves from exactly the same x the controller lane arrives on, which is only safe because
         the two are never on stage together.
         Everything except the standing row appears only on the step that uses it, so the card is
         never crossed by a lane belonging to somebody who is not on stage.
MOTION   There is no Pod anywhere, so nothing pulses: boxes light. Two rules govern that light:
           1. A box is lit at step entry ONLY if a ball departs from it. Pre-lighting a destination is
              the single easiest way to ruin one of these steps: it answers the question before the
              ball carrying the answer has arrived.
           2. Chips light on the step their value CHANGES, so the reader sees the phase field flip
              rather than having to remember what it said one step ago.
DO NOT   Give a box up its highlight part way through a step, and note there is deliberately no
         unlightAt here. WHY NOT have the source phase go dark the instant the destination lights, on
         the theory that a state machine shows exactly one live state: it reads as a bug every time,
         because the eye is following the ball, so a box dimming behind it looks like something being
         switched off rather than a phase being left. A phase only goes dark at a step boundary.
         In particular, DO NOT have Released go dark on arrival to say "the object left the machine":
         a box dimming under an incoming ball reads as the ball breaking something. The disappearance
         is carried by the three chips and the verdict line, none of which can be mistaken for a
         lighting bug.
NOTE     No block blink anywhere, unlike the sibling cards. The sanctioned blink exists so a step with
         no packet and no Pod does not read frozen, and this card has no such step: idle is the static
         poster and all six narrated steps carry at least one ball.
NOTE     The claim is DELETED on its step, so it ends at zero rather than as a ghost.
DO NOT   settle it at a dim 0.45 and leave it on canvas for the rest of the card: it then reads as
         an object that is still somehow around and pulls the eye away from the row.
WIRE LABELS
         The verdict reports an outcome that moves the volume NOWHERE, exactly the case the row lanes
         cannot express: a successful Delete and a Retain that declines to act. It centres on
         Released, which it can do because the backward arc runs over the row instead of under it.
         The backward edge gets its own name, centred under its own horizontal run. DO NOT park it in
         the Available-to-Bound gap: that puts the caption for a right-to-left event on the one lane
         that runs left to right.
         THE COUNTERFACTUAL CAPTION (`T-35`). The three reclaim steps are branches of ONE moment, the
         controller reading the policy on a Released volume, and they play in sequence, so the PV object
         is removed on reclaim-delete and exists again one step later. THREE captions, one per branch,
         each naming the condition that selects it (`if the policy is Delete`, `if instead the backend
         rejects it`, `if instead the policy is Retain`). A fan of alternatives needs every arm marked:
         marking the second and third only leaves the first reading as the story rather than as one of
         three, which is the defect this rule is about.
         It sits in the empty band above the phase row, ending 22 left of the reclaim lane, so the line
         stops at the lane the ball comes down. Anchored `end` for that reason rather than centred: the
         lane owns x=712 and a centred caption would have the dashes run through the glyphs.
         MEASURED IN THE BROWSER, worst string `if instead the backend rejects it` at 227.4 / 207.8 /
         202.5 units over 1600x1000 / 1280x860 / 1100x800, and 200.7 at 900x650. The widest is the
         WIDEST viewport, not the narrowest, so a caption measured at 900x650 alone under-reads by 13
         percent. Nearest neighbour is the reclaim lane at 22 units, then the row top 32.3 below the
         ink. The panel never reaches it: the worst horizontal clearance is 91.0 units, on reclaim-failed
         at both 1100x800 and 900x650. At 1100x800 on reclaim-delete the caption SHARES a band with the
         panel bottom (ink 252.96..267.68 against a bottom of 254.66) and is kept clear by x alone,
         which holds because this card's panel right edge is driven by the viewport and not by the text.
```

### before `const PITCH = 224;`

```
One pitch drives the whole phase row: ST_W and GAP fall out of it and each phase centre is the
previous one plus PITCH. Re-typing a centre is what breaks the even rhythm the row depends on.
```

### poster

```
Abstract, not the literal diagram: the machine drawn as a RING that does not close by itself.
Available, Bound and Released sit on the cycle. The two forward edges are solid because the control
plane walks them unasked, and the closing edge back up to Available is dashed because that is the one
hop nothing performs on its own. The point is that the eye completes the ring and the drawing does
not, so the dashed quarter reads as a gap in a circle rather than as one more arrow. WHY NOT the
diagram in miniature, four cells in a row with a back-arc: it says state machine but not what is
interesting about this one.

Failed is deliberately NOT here, though it is a real phase and the card teaches it. It only ever
fitted as a faint satellite hung outside the ring, and that cost more than it paid: it was the one
thing keeping the composition off-centre, since a dim shape on one side pads the bounding box without
carrying visual weight. Dropping it makes the ring symmetric about x=160 by construction.

TWO dots, and the difference between them is the whole idea. The FILLED one rides the first solid
edge, a hop the control plane is making right now. The HOLLOW one sits on the dashed edge, a hop that
is possible and is not happening, because nothing takes it without a person. The dashed edge is drawn
as TWO arc segments with a gap where that hollow dot sits: run as one path it passes straight through
the dot and renders it as a struck-out circle.

The nodes are concentric cells rather than plain circles: at poster scale three empty outlines go
thin and washed out, and a core gives each weight without adding a shape the reader has to decode.
Available carries the heavier stroke and brighter fill because it is where the volume is at rest.
Ring centred on (160, 99), R=62, r=18 nodes, node angles at -90, 30 and 150. The 99 is not a typo for
90: the top node sticks a full node radius above the ring while the bottom is bare arc, so the circle
has to sit low for the drawn bounding box to land on the canvas centre.
```

## storage-pvc-binding

### layout

```
WHAT     A claim, three candidate volumes, and the controller that matches them. The identity column
         Pod -> PVC -> PV x73a shares one centred spine, because binding is what fuses those three
         into one chain.
PANEL    The panel owns the top-left band and every block clears it.
LANES    The spine is a SINGLE dead-centre lane, the mount ascent (the volume rising PV -> PVC -> Pod),
         and the only vertical the tops of the Pod and the centre cylinder touch. DO NOT add headless
         relationship lines beside it: the centre then reads as a crowded pair rather than as one
         clean arrowed axis.
         The binding controller's vertical centre is aligned with the PVC, so the watch and the bind
         write are STRAIGHT horizontal hops, no zigzag.
         Crucially the controller scans the shelf FROM BELOW: the probe wraps down its outer edge
         (clear of PV b22), runs a bus under the whole shelf, and rises into each cylinder BOTTOM.
         That keeps every probe off the cylinder tops, so a ball never travels underneath a box.
NOTE     A disk is a cylinder plus its spec line, wrapped in a g so dimming a rejected volume fades the
         spec WITH it. The cylinder is returned separately because .highlight must sit on the
         .scheme-cylinder element itself, not on the wrapper.
         Each disk states all THREE things the claim is matched on (capacity, access mode, class), so a
         viewer can verify the verdict the match step narrates instead of taking it on trust. Access
         mode is identical on all three on purpose: the two rejections must turn on size and class only.
DO NOT   Leave appBox out of `reset.keys`. A highlight set during a reduced replay leaks forward,
         because replay never runs the motion path that would re-clear it. The disk OPACITIES and the
         two late-appearing elements are a different mechanism and must not be moved here: `reset`
         takes back CLASSES, not inline styles, so those SIX are pinned on EVERY step through the
         `opacity` field instead (`STO.S-01`). Two lane keys are pinned the same way: a branch whose
         far end is a ghost dims with it, or the arrowhead lands at full strength on nothing.
MOTION   The opening step is deliberately motionless and must STAY that way. The claim is a statement of
         need, nothing acts: the Pod does not pulse (it is the subject being blocked, not an actor) and
         the PVC takes a static .highlight only. A block flash would be canon-legal there (packet-less
         and Pod-less) and is wrong, it reads as the PVC doing something when it is not.
         All three probes leave the controller TOGETHER: the scan is one sweep of the shelf, not a
         queue, and the simultaneous fan-out is the whole read of that step. They land at their own
         pace (1222 / 1933 / 2600 ms for slow / match / small) because routeDur normalizes speed and
         the routes are very different lengths. DO NOT stagger them to make the verdicts resolve in
         narration order: that turns one sweep into three separate errands.
         The Pod stays dim until the volume actually reaches it, so `rewind` re-dims it on the
         animated path and the fade carries it back to the 1 the step's own `opacity` pins. Without
         that the Pod sits at full and snaps BACK to 0.5 the instant the animation becomes active.
CONTENT  The `binding` chip turns over on the probe arrival, not at t=0. It named `candidate PV x73a`
         from the first frame, between 1.2 and 2.6s before the sweep that decides it had run (the
         three arrivals just above, 1222 to 2600), on the one card whose whole subject is that the
         decision is made by scanning. So `rewind` rolls it back to `none` for the animated path and
         the turnover rides the arrival that lights the winning cylinder. This is the one card in the
         category mixing the two chip writers: `chips` (`setVal`) for the roll-back, `chipsCued`
         (`setChip`) for the turnover, so the highlight
         fires on the verdict rather than on the reset. The three wire verdicts already turn over on
         their own probe arrivals.
         The `bind` step is the same repair on three chips at once, and each waits for a DIFFERENT
         ball (`P-04`): the claim turns Bound when the volumeName write reaches it (`toClaim`, 700ms),
         and the volume plus the `binding` pair turn over on the claimRef arrival (`toVolume`,
         1933ms), which is the moment the pairing exists on both objects. All three were stated at
         t=0, up to 1.9s before the write that earns them.
```

### before `const CX = 600;`

```
The identity column Pod -> PVC -> PV shares this one line, because binding is what fuses the three
into one chain. It is the only vertical the tops of the Pod and the centre cylinder touch, so a
second line beside it turns the centre into a crowded pair.
```

### before `const WATCH_TAG_DY = -28;`

```
The watch lane runs between the claim and the controller at their shared mid height, so a centred tag
is cut by one box face or the other for the whole 800ms flight. -28 is the least that clears both
tops on all four viewports.
OPEN: `volumeName: x73a` on the bind step is the same geometry one lane lower and needs -38, which is
past the offset ceiling that keeps a tag reading as its own ball's address.
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

## storage-pvc-clone

### layout

```
WHAT     Cloning a PVC. A new PVC whose dataSource points at an EXISTING PVC, not a snapshot. The
         storage system makes an exact duplicate server-side and there is no snapshot object in
         between, which is the whole contrast with the snapshot card.
CONTENT  Quoted rather than paraphrased, from kubernetes.io CSI Volume Cloning:
           `Cloning is supported with a different Storage Class. Destination volume can be the same or
            a different storage class as the source.`  <- the card must NOT require the SAME class
           `The source PVC must be bound and available (not in use).`
                                                      <- the card must NOT promise the source stays up
           `Cloning can only be performed between two volumes that use the same VolumeMode setting`
           `You can only clone a PVC when it exists in the same namespace as the destination PVC`
           `the value you specify must be the same or larger than the capacity of the source volume`
           `the back end device creates an exact duplicate of the specified Volume`
           `the source is not linked in any way to the newly created clone, it may also be modified or
            deleted without affecting the newly created clone`
         CreateVolume is a call into the DRIVER that produces a volume, so its ball lands on the new
         DISK in the backend. DO NOT land it on the clone CLAIM: that is neither where the call goes
         nor what it creates.
LAYOUT   A mirror about the canvas centre, with the disks on the same two centre lines so the
         reflection holds on every tier. The provisioner sits alone on the centre line because it
         belongs to neither side, and the backend frame holds both disks because the copy never leaves
         the storage system: that frame IS the word server-side.
         Every horizontal run of every zigzag sits at the midpoint of what it crosses and the backend
         frame insets are equal, so nothing is pinned to a free gap. It is deliberately the same
         rhythm as storage-volume-snapshot from the frame down, since the two cards sit in one row.
         The disks sit DEAD CENTRE in the frame: one inset used both above and below, so the frame is
         sized from its contents, the top band carrying the frame label (`P.node` puts its label
         baseline 18 below the frame top) and the bottom band the disk captions.
PANEL    Measured, panel bottom-right in viewBox units:
           1920x900  right 102  bottom 183      1600x1000 right 291  bottom 160
           1280x900  right 378  bottom 173      1100x900  right 397  bottom 173
           1280x860  right 397  bottom 230      1100x800  right 397  bottom 230
         The four taller rows read 47 units too kind, because the deeper number comes from the SHORTER
         window (`L-05`). The occlusion rule samples the two 230 rows, so 230 is the number this
         layout is built against.
         At 196 the claim row was inside that band and the source claim (180..460) was 38 percent behind
         the panel. The row starts at 236, clear of 230 outright, and everything under it moved down by
         40 to follow: the constraint lines lost 2 units of leading (22 to 20) to pay for part of it,
         and the chip strip took the rest out of the bottom margin. The provisioner still sits inside
         the band and still clears it on x, at 420..780. The request corridor at y=170 is inside the
         band too, but it only ever runs between x=600 and x=880, far right of any panel. A longer
         narration invalidates all of this.
LANES    ZERO crossings, and every lane meets its blocks on a face midpoint. The call and the
         duplicate meet the new disk from OPPOSITE sides, which is what keeps them apart.
         The horizontal run of a zigzag belongs at the MIDPOINT OF WHAT IT CROSSES, not in whatever gap
         happens to be free, so REQ_CORRIDOR_Y splits the provisioner-to-claim gap in half. The call
         has no corridor of its own: it drops the outer column straight to the disk mid height and
         turns in through the SIDE face of the cap.
         The call takes the long way round, out to x=1060 and down the outside, and that is not
         decoration: the dataSource link runs straight across the gap between the two claims at their
         mid height, so ANY descent from the provisioner through that gap crosses it, and the gap is
         the only opening in the claim row. Hiding the link for one step would make it blink out and
         back. Going around the outside keeps both a permanent dataSource line and a crossing-free
         card, and it reads correctly on its own terms: every lane lives in the right half, because the
         clone side is where all the work happens and the source side is only ever read.
         Both identity links are dashed and carry no arrowhead: each claim to its own volume, and the
         dataSource between the claims. The clone identity link is held back until the claim binds.
DO NOT   Turn the call in over the cap and drop onto the disk top: that puts two arrowheads on one disk
         pointing from the same direction as the copy.
MOTION   Nothing pulses and nothing blinks: there is no Pod. The constraints step and the contrast step
         carry no packet, and the canon would allow them the one sanctioned block blink so they do not
         read as frozen. They deliberately do not take it: both state a fact rather than move something,
         and a brightness blink on a block that is only being pointed at reads as traffic that never
         arrives. DO NOT add it back.
         The clone claim and the clone disk default to OPACITY.pending, not to 0. Family rule: an object
         that does not exist yet is drawn dim, not hidden, because hiding one half of a mirrored pair
         leaves a block-sized hole and a half empty frame, which reads as a rendering fault rather than
         as an absence.
BUDGET   The provision step is 5900 for three chained hops: the claim picked up, the CreateVolume call
         out and down into the backend, and the duplicate made on the shelf once the target exists.
         The span measures 5394 with the call routed around the outside: the duplicate lands at 4834
         and its arrival ring runs the 560 past it. Routes are length-based, so
         re-measure after ANY geometry change here rather than trusting this number:
         `render/duration.test.mjs` is the only guard: a declared duration reaches neither WAAPI nor
         the DOM.
NAMING   External-provisioner, capitalised like every other CSI sidecar block in the family
         (External-attacher, External-snapshotter, External-resizer). The narration keeps it lowercase
         mid-sentence, as those cards do.
         Family CHIP_W 232: worst case here is `dataSource` + `kind: PVC` at 19 characters, so
         19 * 6.89 + 24 of padding is 155 against the 232 available.
```

### before `const CX = 600;`

```
The mirror axis: CLAIM_CX is CX -/+ SPREAD and the disks hang on the same two centre lines, so the
reflection holds on every tier. The provisioner sits alone on CX because it belongs to neither side.
```

### before `const CHIP_W = 232, CHIP_GAP = 16;`

```
Family width. Worst case here is `dataSource` + `kind: PVC` at 155 against the 232 available.
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

## storage-pvc-protection

### layout

```
WHAT     Why a deleted PVC does not go away.
CONTENT  1. The finalizer is put on the claim WHEN THE CLAIM IS CREATED, not when a Pod picks it up.
         The pvc-protection controller adds kubernetes.io/pvc-protection to every PVC whose
         deletionTimestamp is nil and that does not carry it yet, use or no use. What being in use
         changes is the REMOVAL: the controller refuses to take the finalizer off while a Pod still
         consumes the claim. DO NOT say the finalizer appears "the moment a Pod started using it":
         that invents a trigger that does not exist and makes standing protection sound reactive.
         2. status.phase NEVER becomes Terminating. A PVC phase is Pending, Bound or Lost. What
         prints Terminating is KUBECTL: its printer swaps the phase out for that literal string
         whenever deletionTimestamp is non-nil. So the object under a stuck delete is still phase
         Bound, and the word the user is staring at in the STATUS column is a display convention
         rather than a field. That gap IS the card: the reason a stuck PVC is confusing is that its
         status looks like a state it is not in. The claim keeps the sublabel `phase Bound` the whole
         way through and a chip reports what kubectl shows next to it.
         3. What finally removes the object is the API SERVER, not the garbage collector. The GC
         walks ownerReferences to delete dependents; a finalizer is settled in the API server itself,
         where a deletionTimestamp plus an empty finalizers list completes the outstanding delete.
LAYOUT   The centred vertical stack, with the spine drawn as the mount ASCENT, the same single arrowed
         axis storage-pvc-binding settled on: balls really travel it, so the arrowheads are earned and
         nothing here is a headless relationship.
         The two actors that drive the delete sit ONE ON EACH SIDE of the spine, placed so that every
         lane is a straight run or a single right angle: no dog-leg anywhere and no lane turns twice.
         The two forces of the card, the request to delete and the release that finally allows it,
         then reach the claim from opposite sides, which is the composition saying what the narration
         says.
WHY NOT  Stacking both actors in ONE right-hand column, kubectl at the Pod tier and the controller
         below the claim: that puts every block in 480..1070, centre 775, with the whole left half
         below the panel empty. kubectl cannot move left, because it sits in the panel's y band. The
         controller can, because its tier (396..468) is well below the panel floor of 230, so it
         takes the left column and the content spans 130..1070, centre 600. Dropping kubectl to the
         claim tier pays for it twice over: it also turns the delete-PVC lane into a straight
         horizontal and leaves the Pod lane as the only turning one.
PANEL    Measured across widths 1920 down to 900: right peaks at 399, bottom at 230 on the 1100x800
         sample the occlusion rule uses. The verdict caption beside the claim is anchored end at
         x=464 and runs back to about 306 on its longest string, and it sits BELOW the claim (y=324)
         rather than level with it, because the controller's lane now occupies the claim's mid height
         on that side. The caption at 324 and the controller at 396 clear 230 by 94 and 166.
         LENGTHENING ANY NARRATION INVALIDATES THIS: re-measure, or move the caption back to the
         right of the axis.
LANES    The pair into the claim BOTH land dead centre on their face, at PVC_MID exactly. WHY NOT
         split them by a lane gap, the usual way to keep two routes from overlapping: the two are
         never on stage together (kubectl only on the delete step, the controller only on the release
         step), so the gap buys nothing and costs the thing that matters, which is that an arrow
         arriving off centre reads as aimed at a corner of the block instead of at the block.
         Both actors appear only on the steps they act on, so the frame reads as the centred stack
         plus one visitor rather than a permanent crowd.
WIRE LABELS
         The two captions take one side of the axis each, so neither can be mistaken for the other's
         lane. The VERDICT caption reports the state of the CLAIM, not of any lane, and it changes
         kind across the card (a binding, then a block on removal, then a removal), so it is named for
         its JOB and sits hard against the claim. DO NOT park it beside the lower lane: it then reads
         as that lane's name, which it never was.
BUDGET   A four-chip strip over the card's own width, derived rather than hand-placed, so the readout
         is concentric with the stack. deletionTimestamp and the kubectl column sit next to each
         other on purpose: the second is a DISPLAY of the first, and seeing them light together is
         the lesson. The four are NOT one width: the first carries both the longest name and the
         longest value (deletionTimestamp against `gone with object`), and at a shared 252 those two
         meet with one unit to spare, a collision on any re-measure or font change. It takes 312 and
         the other three give it back.
MOTION   There is deliberately NO block blink. The sanctioned one exists so a step with no packet and
         no Pod does not read frozen, and no step here is in that position. DO NOT brighten the claim
         on the finalizer-holds step: that puts a blink on infrastructure for no reason. That step
         carries the MOUNT ball instead, which is both real traffic and the actual point being made:
         the claim is still mounted, which is exactly why it cannot go.
DO NOT   Strip `unlight` from the card's `removeAt` on the grounds that nothing is lit at any of its
         four call sites. That is true (`web` and `lMountHigh` fade under `lit: ['kubectl']`, and the
         closing step lights nothing at all) and it is not the point: `unlight` is what DECLARES the
         `onfinish` handler on the fade, and a frozen probe never fires one, so the flag is the only
         way the handler is visible at all. Dropping it changes what a WAAPI dump records for the
         step, since `onfinish` is a per-animation flag, and silently removes the guard the day one
         of those blocks IS lit when it goes.
         On the delete step the order is down-arrow and the Pod is the one thing allowed to pulse:
         the ball lands, the Pod BLINKS to acknowledge, and only once that blink has landed does it
         start to go. DO NOT fade straight from arrival: that skips the acknowledgement, and the Pod
         dimming under an arriving ball reads as the ball erasing it.
MOTION   THE CONSUMER COUNT is bound to the Pod's fade COMPLETION (2113), not to the delete arrival
         (813) and not to step entry (`P-03`). Measured on the animated path: at 2033 the Pod still
         stands at 0.34 and the chip still reads 1 Pod, and both reach their end together. The claim
         loses its last consumer when the Pod has actually gone, so a chip reading 0 Pods over a Pod at
         full or half strength is the one frame this step must not have.
WHY NOT  Binding it to the delete arrival at 813, which is where the tag and the pulse already are: the
         Pod is alive for the whole 1300ms that follows, mount and all, and the mount lane only leaves
         at 2113 with it. The count would then contradict the picture beside it for longer than it
         agreed with it.
NAMING   The lowercase pvc-protection in the finalizers chip and the narration is not a lapse from the
         capitalized block labels: it is the literal finalizer string kubernetes.io/pvc-protection,
         spelled as the API spells it.
```

### before `const CX = 600;`

```
The identity spine, and TIER is the one vertical pitch on the card. storage-volume-expansion reuses
both numbers so the two cards in this subcategory read as one family.
```

### before `const DEL_TAG_DY = -40, RM_TAG_DY = -38;`

```
Both requests travel at PVC_MID, half a box height below the claim top, so at -14 each tag rides
inside the boxes at its ends: 800ms for the delete, 400ms for the finalizer patch. -40 and -38 are
the least that clear on all four viewports, and they differ only because the two strings differ in
width. They are large because the boxes are 68 and 72 tall and the lane is at their middle.
```

### before `const MOUNT_TAG_DY = 12;`

```
The mount ascent ends on the Pod floor, where -14 parks the tag on the `volumes: data-claim` sublabel
for 500ms (90.4 x 6.1 units of ink). At 12 below the ball the tag stops short of the floor instead and
never enters the Pod. It cannot go further: at 22 it would meet the `still mounted` caption at 204.
That caption is still grazed in transit for 100ms, which no offset removes, because the tag has to
cross its band. Ink depth there went 3.9 to 6.8 units, the price of the 500ms pair being closed.
```

### poster

```
Abstract, not the literal diagram: the claim is MARKED for deletion (dashed outline) and yet still
whole (its content rows intact on both sides), because a closed PADLOCK sits dead centre on it. The
lock is the finalizer, and the live mount dropping in from the consumer above is why it stays shut.
Consumer on top, claim in the middle, disk below, so the poster carries the card's own centred stack.

WHY NOT an X across the object: an X reads as deleted, the exact opposite of the card, where the
delete is the thing that has NOT happened.
WHY NOT side clamps: they read as two brackets parked near the object rather than as anything holding
it. The object is locked in place, not struck out and not squeezed.

Vertical rhythm: BOTH gaps are 18, and the disk's gap is measured from the top of its ELLIPSE
(cy - ry = 131), not from cy. Measuring to cy makes the lower gap look bigger than the upper one: the
numbers read 16 and 19 while the two connectors are drawn the same length, because the ellipse bulges
ry=6 up past the point the connector stopped at. The stack runs 15..164, centred in the 180 canvas.
Move any tier and the two 18s have to be re-derived.
```

## storage-pvc-retention-policy

### layout

```
WHAT     persistentVolumeClaimRetentionPolicy has two independent knobs, whenScaled and whenDeleted,
         each Retain or Delete. Retain leaves the claim and its disk in place, which is safe but
         silently leaks storage. Delete reclaims both, at the cost of the data.
LAYOUT   The SAME grammar as its sibling storage-volumeclaimtemplates: three ordinal ROWS, one per
         replica, the Pod and the disk mirrored about the claim on the canvas spine. Every connector
         is a dashed, arrow-headed lane exactly like the sibling, and every one carries a ball on some
         step, because a relationship with no ball would read as traffic that never runs.
         Each Pod is a full window like the rest of the storage cards, which keeps the shape uniform
         with the family even though no Pod here ever pulses on arrival.
LANES    THE THREE FAMILIES ARE BUILT ONCE PER ROW, as `SPINE` / `OWN` / `RECLAIM`, and the `P.lane`
         and every `F.route` over them read the SAME array (`A-02`). DO NOT make them factories called
         once for the lane and again for the ball: the 11 routes over policy, scaled-delete and
         deleted-delete then each ride an equal COPY of the numbers under them, which comes apart the
         first time a row moves. Sharing the array is a pure identity change, the 18 lane arrays across
         this card and its sibling being equal in value either way, so no span moves (`A-11`).
PANEL    The panel covers only the top-left band (measured bottom ~173, right ~397 worst case). The
         policy box spans x 430..770, clear of the x<=397 band, and the first Pod row starts at y=195,
         below the panel. A much longer narration invalidates this.
MOTION   The sibling flows CREATION down the spine and up into the Pods; this card flows the POLICY the
         other way. On the policy step a governance ball cascades DOWN the spine and each claim lights
         as it lands, the spine being hidden on every other step as in the sibling. A Delete then
         sweeps a reclaim ball across the row, each block lighting as the ball lands, holding a beat
         and fading with its lane as the ball moves on: the claim first because the PVC is deleted
         first, the disk when the reclaim reaches it. A Retain fades only the Pod.
         Nothing is ever highlighted before a ball reaches it, and nothing fades without a ball or a
         Pod removal behind it. Pods pulse only as they are removed: one blink, then the fade.
         Lane opacities are the MIN of their two ends (`laneOf`), never one end alone, so a lane is
         only as present as the fainter block it touches and no arrow is ever left pointing at a
         ghost. The governance SPINE is the one exception and does follow a single end, its own
         claim, because the policy box on the other end of it is drawn on every step.
DO NOT   Touch the spine inside a reclaim: it only exists on the policy step, so animating it would
         wrongly flash a segment into view.
         Leave the .highlight on a reclaimed block. The ball lights each claim and disk as it lands,
         through an `F.set` carrying `lit` rather than a `lights` cue so the static path never shows
         it, the card-local `vanish` fades the block away behind, and the class has to come back off
         when the fade finishes: otherwise the block ends its step lit at the terminated shade, which
         is the thing the step points at and the thing that no longer exists, at once. The static
         path never reproduces it, because it pins the shade and lights nothing, which is how this
         surfaced as eight reduced-motion findings rather than as a drawing complaint. Dropping the
         class on finish settles both paths and matches what `render/opacity.test.mjs` LIT enforces
         wherever the shade is pinned rather than animated.
BUDGET   Family CHIP_W 232: worst case is `disks` + `3 kept, 1 leaks` at 20 characters, so
         20 * 6.89 + 24 of padding is 162 against the 232 available.
```

### before `const CX = 600;`

```
The same spine grammar as storage-volumeclaimtemplates: three ordinal rows, claim in the centre, Pod
and disk mirrored about it. The policy box above is centred on CX too.
```

### before `const TAG_DY = -32;`

```
The reclaim lane enters the claim at its own mid height, so at -16 the tag is cut by the claim and
the ghost Pod for 600ms. -32 is the least that clears them on all four viewports.
```

### poster

```
One policy, two knobs, forking to two fates. A dashed fork drops from the policy box (its two knob
cells one solid, one hollow) to two disks: left stands whole and bright (Retain kept it), right is
dashed and faded (Delete reclaimed it). Echoes the volumeClaimTemplates sibling's top-box + fork
grammar, but diverges to two outcomes instead of stamping three copies.
```

## storage-reclaim-policy

### layout

```
WHAT     A side-by-side comparison, so the storage stack is drawn TWICE, a Delete column against a
         Retain column. Between the volumes and the disks runs ONE full-width band, the PV controller
         and CSI driver, because both columns are reclaimed by the same controller reading the same
         field: the band is where the two stories split.
LANES    Every reclaim is a DESCENT through the band, as in storage-access-modes: PV to controller
         (the policy is read), then controller to disk (the disk is wiped). Retain is the branch
         where the second hop never happens, and that ABSENCE is the whole point, so the first hop is
         still drawn and still lands on the band.
         Two line vocabularies, and the difference is the whole point of reading the card: a dashed
         arrow is a ROUTE, including the Retain lane down to the disk, a real route this policy simply
         never uses, while the solid headless Bound link is a RELATION nothing travels.
LAYOUT   Three equal 54 unit gaps between the four tiers, so no hop is a blink and no tier reads as
         belonging to its neighbour. The whole stack is pulled UP rather than centred vertically,
         because FIVE text rows queue up under the disk shelf (cylinder name, spec line, verdict line
         and two rows of chips) and sitting the shelf lower crushes them into each other.
         The stack is centred on the CANVAS at 600, not merely placed right of the panel, and that
         costs width non-negotiably: the top two tiers sit inside the panel's vertical band, so the
         leftmost the columns may start is 400, and centring on 600 from a left edge of 400 pins the
         stack to exactly 400 wide. DO NOT "fix" the narrowness by sliding LEFT_X left after
         measuring the panel on your own screen: the measured right edge is 185 at 1920 but 379 at
         1100 and below. 400 is that worst case plus a hair.
NOTE     The human sits in the right margin and is the one element breaking the symmetry, which it
         has to: the left margin is the panel and nothing may be parked there. It is kept close to
         the Retain column rather than pushed to the canvas edge, and it appears on exactly one step,
         so the composition reads as centred on the six steps where it is absent.
MOTION   There is no Pod anywhere, so nothing pulses: boxes, the band and the cylinders light. The
         one packet-less step, `delete-pvc`, would be ALLOWED a box flash and does not take one: its
         span is ZERO, and `flashChips` has no callers anywhere in the tree, so no card can fire one.
         What marks that step is the static highlight on the two PVs plus both claims dropping to the
         terminating shade. A lit stroke is a CLAIM about the object, so
         only the SOURCE of a ball is lit at step entry (the card never announces an outcome before
         the act) and a block below full opacity NEVER carries one, because a dimmed block still
         glowing reads as deleted-but-somehow-live. removeAt enforces the second for the mid-flight
         case by dropping the class as the fade lands.
DO NOT   Light `retDisk` on the Retain step. lightBoxAt is this catalog's cue for a block that
         RECEIVED a packet, and firing it at the same millisecond as the band with no ball on the
         lane between them turns the one step whose entire point is that the disk is never touched
         into the step where the disk lights up on arrival. Retain is a STATE, not an arrival: the
         disk holds full opacity while the whole Delete column sits at OPACITY.terminated beside it,
         and that contrast is what says the data survived. The band keeps its own lightBoxAt, because
         the policy ball really does reach it.
SIZES    cylinder() puts its own name on the baseline h/2+5, and the spec line goes 14 BELOW that,
         the same fix and number as storage-access-modes. WHY NOT a flat DISK_Y+66: that leaves 11
         units between two baselines whose text is 11 units tall, so the two lines visually touch.
         The verdict line clears the cylinder bottom by a full row rather than 16 units, and the chip
         strip clears the verdict by another one, both derived so raising the shelf carries them.
NOTE     The readout is a 2x2 GRID, not a row of four: each column of the diagram gets its own pair
         of chips stacked directly under it, at exactly the column x and width. One row per kind of
         object, so reading ACROSS compares the two policies and reading DOWN walks one stack.
WHY NOT  a single row of four: four chips wide enough for their text come to 920 units against a 400
         unit stack, so the strip would be more than twice the width of what it reports on.
BUDGET   The cost is a hard 152 units of text per chip (176 minus 12 of padding each end), so values
         are kept to about 12 characters. The longest pair is `vol-bbb` plus `in use again`, 19
         characters, about 48 + 83 units of 11px JetBrains Mono at 6.89, with `vol-aaa` plus
         `wiped, gone` behind it at 18. Anything longer collides in the middle of the chip, so
         shorten the VALUE, never the width.
NOTE     Each chip names ONE object and reports only that object's state, so a value can never be
         read as a caption for something else. The two PV chips carry the PHASE, which is why the PV
         boxes keep their reclaim policy as a fixed sublabel instead of flipping between meanings.
NOTE     The claim that arrives AFTER the first is deleted is its OWN box, not the old one turned
         back on.
DO NOT   reuse the element with a new sublabel: the step narrating a brand new claim then shows the
         deleted claim rising from the dead under its original name.
NOTE     The spec line is a SIBLING of the cylinder, not a child, so it must be faded BY HAND when
         the disk it describes is deleted, or a bright `real disk, EBS` hangs under a wiped disk.
NOTE     On the delete step the two VOLUMES light because their phase flipped to Released. The two
         CLAIMS do not, even though they are what you deleted: they end the step faded, and a faded
         block never keeps a lit stroke. What marks them is that fade plus their Terminating sublabel.
         That sublabel is true for ONE step only. From the next step on both claims read `deleted`,
         because every sentence after it (a claimRef pointing at a claim that no longer exists, a
         brand new claim asking for the same storage) is written on a claim that is already gone.
NOTE     `retBound` and `wRetBind` are drawn on the SAME segment, so on the one step where both are
         true they HAND OVER rather than stack.
DO NOT   have `rebind` pass `retBound: 0` like the refused `retain-stuck` step does: that shows an
         identical picture for a claim that binds and a claim that is skipped.
NOTE     Raising it alone is not enough either: with retBindLane also at 1 the solid arrowhead-free
         link renders underneath a dashed arrowhead. The end state is the link alone, the lane is
         re-raised below the guard so the ball has something to ride, and the two cross-fade on
         bind.arrivalMs.
OPEN     CENTRE is open here on purpose. Content spans 400..1010, centre 705 against a wanted ~600.
         Both columns are locked by the PVC row above them, which has to sit right of the panel, and
         the only way to pull the centre left is to stretch the policy band across the full width.
         That is exactly the fit-the-metric edit that produced regressions elsewhere, so the number
         stays red and the picture stays honest.
```

### before `const PVC_Y = 30, PVC_H = 68, PVC_BOTTOM = PVC_Y + PVC_H;`

```
Every tier declares its own bottom alongside its top, so the lanes between tiers are built from those
edges rather than from typed y values and re-solve when a tier moves.
```

### poster

```
Abstract, not the literal diagram, built on the sentence the card opens with: you delete a claim and
the disk full of data disappears, or it does not. So the poster is ONE deleted claim (dashed, because
it is on its way out) dropping into ONE controller band, and two fates leaving the other side of it.
The band is the whole point and is why this is not just a fork: the two outcomes are not chance, they
are one field being read by one controller.

Left, Delete: the disk is dashed and faint, mid-dissolve. Right, Retain: the disk is solid and
filled, and carries a PADLOCK, because Retain does not hand the data back either. It survives and
stays locked behind a stale claimRef until a human clears it, and a poster showing only "kept" would
promise a happy ending the card spends three steps taking away. The two lanes are symmetric about the
claim above them, so neither outcome reads as the default.

The padlock is centred on the cylinder FACE (the band between the bottom of the cap at 122 and the
bottom arc at 160, so 141), not on the shape's bounding box: the cap is drawn as a rim seen edge-on,
and a glyph centred on the box sits visibly high inside the body you actually see.
```

## storage-topology-aware-provisioning

### layout

```
WHAT     WaitForFirstConsumer. Two zones side by side, each a worker node with its own zonal disk on
         the shelf below it.
CONTENT  volumeBindingMode: Immediate provisions the disk the instant the claim exists, in whatever
         zone the provisioner happens to pick. The scheduler then honors that already-bound disk, but
         if the Pod only fits the other zone on capacity and affinity, no node satisfies both the Pod
         and its zonal disk, so the Pod stays Pending forever with a volume node affinity conflict. It
         is never scheduled and never reaches ContainerCreating. WaitForFirstConsumer inverts the
         order: the scheduler picks the node first, and only then is the volume provisioned in that
         same topology.
LAYOUT   The two zones are mirrored about the canvas centre, so neither reads as the important one,
         and the StorageClass and the claim stack on that same line because the whole card is about
         ONE claim and ONE class resolved into ONE of two zones. Content spans 140..1060.
         NODE_H hugs the Pod rather than framing canvas. WHY NOT 180: the frames stand 88 units taller
         than the Pod they hold, and zone-a, which holds nothing at all in the WaitForFirstConsumer
         path, reads as a large empty box rather than as an empty zone.
         `node()` carries no sublabel, so the zone is its own dim caption, sharing the frame HEADER
         line with the node label. WHY NOT centre it under the label at NODE_Y + 24: it lands on the
         top edge of the Pod the frame holds, since NODE_H now hugs the Pod.
WHY NOT  Running the nodes at 400..720 and 820..1140: the pair centre lands at 770 and leaves 400
         units of dead canvas on the left against 60 on the right.
PANEL    Measured, panel bottom-right in viewBox units:
           1920x900  right 102  bottom 183      1600x1000 right 291  bottom 143
           1280x900  right 378  bottom 173      1100x900  right 397  bottom 149
           1280x860  right 397  bottom 230      1100x800  right 397  bottom 230
         Worst case x<=397 and y<=230, the deeper reading coming from the SHORTER window (`L-05`).
         The StorageClass (y=36) and the claim (y=136) both sit inside that y band, so both start at
         x>=400. The node row at y=236 clears the real floor by SIX units, so it must not move up.
         A longer narration invalidates this.
LANES    Both provisioning routes wrap down the same outer margin clear of both zones and run a bus
         along the shelf midline, so one route shape serves either zone. DO NOT wrap left: the lane
         and its ball then run straight through the panel. zone-a simply runs further left along that
         midline, passing over where the zone-b disk sits, but that disk is invisible during the
         zone-a step so nothing is crossed on screen.
         The mount lane and the doomed cross-zone reach both meet the node-2 frame at its BOTTOM edge,
         entering the NODE rather than the Pod inside it, and are never drawn in the same step. The
         cross-zone reach is a bare dashed line with NO arrowhead, because the attach never succeeds.
DO NOT   Leave the lanes permanently visible. The step `opacity` field pins them, or the zone-a
         provisioning lane is still drawn during the zone-b step, pointing into a disk that does
         not exist there.
MOTION   On the failure step the scheduler keeps re-queuing the Pending Pod and rejecting it, so the
         Pod blinks, but it never went Ready: pulsePodDim with an opacity lift.
NOTE     BOTH FRAMES CARRY THE FILTERED-OUT SHADE on the two Immediate steps, because the narration
         rejects both nodes: `STRANDED` dims node-1 for room and node-2 for the zone. Dimming node-1
         alone leaves node-2 at 1 while the sentence beside it says it is rejected, and the Pod at
         OPACITY.pending inside a full-strength frame. The shade is also the ONLY thing separating
         these steps from `wffc-schedule`: the Pod occupies 765..925 / 256..356 on all three, and on the
         WaitForFirstConsumer step it is genuinely placed there, with node-2 at 1 AND lit. Measured:
         0.4 / 0.4 on `imm-schedule` and `imm-fail`, 1 / 1 with node-2 lit on `wffc-schedule`.
WHY NOT  Moving the Pod OUT of the node-2 frame on the two failure steps so an unplaced Pod is not drawn
         inside a node: the Pod's x and y are scene geometry, so a per-step move needs a transform hook,
         and the only clear canvas at that tier is under the panel (which reaches x<=397, y<=230) or in
         the 60 unit gap between the frames. Both cost more than the shade buys, and the shade says the
         same thing: neither frame took it.
NOT A DEFECT
         The cross-zone reach stays at 1 while the frame it leaves is at 0.4. It is a RELATION, not a
         lane: no ball rides it and it has no arrowhead, and its real ends are the Pod (0.55) and the
         zone-a disk (1), not the frame edge it happens to touch. It is also the subject of the step, so
         the caption `volume node affinity conflict` names it.
BUDGET   The WaitForFirstConsumer step is 5800, not 4400: it provisions, materialises the disk and then
         mounts it, and the pulse on arrival adds PULSE_POD.ms on top, which measures out at a 5047ms
         span (mount lands at 4147, the blink runs the 900 past it). At 4400 the auto-advance cuts
         the mount off before the Pod ever blinks, so the card under-shows exactly what it narrates.
         Family CHIP_W 232: worst case is `mode` + `WaitForFirstConsumer` at 24 characters, so
         24 * 6.89 + 24 of padding is 189 against the 232 available.
```

### before `const CX = 600;`

```
NODE_CX is CX -/+ SPREAD, derived from the node width and the gap rather than typed, so the two zones
stay mirrored. The StorageClass and the claim stack on CX because the card is about ONE claim
resolving into ONE of two zones.
```

### before `const CHIP_W = 232, CHIP_GAP = 16;`

```
Family width. Worst case `mode` + `WaitForFirstConsumer` at 189 against 232.
```

### before `const MOUNT_TAG_EMERGE = 300;`

```
CAPTION_Y is DISK_TOP-14, which is exactly where a tag riding W_MOUNT_B sits when its ball leaves the
disk, so the two printed on each other for 300ms: 96.5 x 9.0 units of ink and a baseline gap of 0.00,
the worst pair in the catalogue. No dx or dy fixes it, the corridor is 68 units with the caption at
430 and the Pod sublabel at 348. The tag emerges 300ms into the flight instead, by which point it is
25 units clear when first readable and 40 clear at full alpha.
```

### poster

```
The Pod's zone (bright, centred) among faint sibling zones: the scheduler placed the Pod first, so
its volume is provisioned into that same zone, the jade disk directly beneath it. The empty flanking
zones are the topologies the volume did NOT land in.
```

## storage-volume-attach-limits

### layout

```
WHAT     The one CSI failure that happens BEFORE anything is bound, attached or mounted: the Pod
         never gets a node at all. Every node has a hard ceiling on how many volumes one CSI driver
         may have attached at once, and running out puts the Pod in Pending reporting "node(s) exceed
         max volume count" while every node still has spare CPU and spare memory.
SCOPE    The only card in the csi row whose subject is SCHEDULING. Its six siblings all begin with a
         Pod that already has a node, so the whole vocabulary of the section (VolumeAttachment,
         stage, publish, fsGroup, force-detach) is downstream of a decision this card is about.
CONTENT  Three points checked against source, each of which the card had wrong:
         1. The node-driver-registrar does NOT write CSINode. It runs a registration socket naming
            the driver and its endpoint, and nothing more. KUBELET calls NodeGetInfo
            (pkg/volume/csi/csi_plugin.go, RegistrationHandler.RegisterPlugin) and hands
            maxVolumePerNode to the node info manager, which writes
            spec.drivers[].allocatable.count.
         2. NodeVolumeLimits does NOT run on every scheduling attempt: PreFilter returns Skip when
            the Pod has no PVC, no generic ephemeral volume and nothing inline-migratable, which
            suppresses Filter for that Pod entirely. Verbatim, from
            pkg/scheduler/framework/plugins/nodevolumelimits/csi.go at release-1.35:
            `if vol.PersistentVolumeClaim != nil || vol.Ephemeral != nil ||
            pl.translator.IsInlineMigratable(vol) { return nil, nil }` over pod.Spec.Volumes, and
            `fwk.NewStatus(fwk.Skip)` when the loop finds none. DO NOT let the `ask` narration close
            on "it skips Pods that ask for no volumes", which contradicts this very note: a Pod
            carrying only an emptyDir, a configMap or a secret ASKS for volumes and is skipped anyway.
            It says "a Pod that claims no volume is skipped", keyed on the claim the way the code is.
         3. What Filter counts changed in 1.32 (PR 127757, issue 126502). Before, it counted only the
            volumes of Pods assigned to the node, so deleting a Pod freed its slot instantly and the
            replacement landed in ContainerCreating with FailedAttachVolume. Since 1.32 the count is
            the de-duplicated union of those Pod volumes AND every live VolumeAttachment for the
            node, so the slot is held until the VolumeAttachment is deleted: "released by a detach,
            not by a Pod dying". A QueueingHint on VolumeAttachment delete requeues it when the slot
            really opens. This card targets 1.35, so the `filter` step names both terms of the sum.
CONTENT  Node-specific volume limits, checked: the DEFAULTS are EBS 39, GCE PD 16, Azure Disk 16, but
         with dynamic limits the real ceiling is per instance type: EBS 25 on M5/C5/R5/T3/Z1D and 39
         elsewhere, Azure up to 64, GCE up to 127. Not 128 for GCE, the off-by-one everyone makes.
LAYOUT   A vertical stack of the claimant, the decider, then the ceiling stated TWICE: as an API
         object (CSINode holding allocatable.count) and as reality (three node frames, each an 8-slot
         attachment strip). Those two tiers are deliberately adjacent, because the mechanism is that
         the number in the object has to agree with how many disks really hang off a machine, and the
         card asks the reader to compare the two rows.
         CONTENT_W puts CONTENT_CX exactly on 600, forced by the chip strip: at 976 units it is far
         wider than anything above it and is therefore the tier that sets the visual centre. On 600 it
         spans 112..1088 and the two margins agree.
PANEL    Worst step, right / bottom by viewport:
           1920x1080 -> 203 / 130    1440x900 -> 319 / 163    1280x800 -> 358 / 189
           1100x800  -> 397 / 220     900x650 -> 398 / 375
         x<=398 and y<=375, and the bound is an L: above 375 nothing may sit left of 400, below it
         the full width is free.
BUDGET   ~300 characters, and that 375 is BOUGHT: it is what pays for the node row being wide. At up
         to 470 characters the bottom lands at 498 and the node tier has to squeeze inside 400..800.
         Held under ~300 the panel sits at 375, the node row clears it by 31, and the row can spread
         to 720 units. Overrun and the widest node goes back under the panel.
         The upper three tiers all live inside 400..800 because they sit ABOVE 375 where the L is
         still closed. Only the node row and the chip strip cross to the left, and both are below it.
         That is the whole reason the report lanes CONVERGE instead of running straight up: the row
         underneath is wider than the object it reports into, and the object cannot grow to meet it.
SIZES    PVC_H is centred in the Pod's free band. DO NOT sit it at 40..86 against a sublabel whose
         glyphs start at 95: the box is then pinned against the Pod floor with all the slack on top,
         which reads as the Pod being mis-drawn.
         The node row is deliberately WIDER than the tiers above and hangs outside CONTENT_W on both
         flanks. WHY NOT pack it inside at 120 per node: that makes a whole machine the smallest
         object on a card whose subject is what a machine can hold.
         CHIP_W 232 clears the worst pair with ~22 units between the halves:
           allocatable.count 117 + `8 per node` 69 = 186    Pod web-0 62 + `Running on node-3` 117 = 179
           blocked by 69 + `max volume count` 110 = 179     attached 55 + `24 of 24` 55 = 110
NOTE     ONE CSINode box spanning the full node tier, not three stacked over three columns.
WHY NOT  three: they are identical in every field that matters, so the row reads as a repetition the
         card never uses, and the story is about that number against the slots. Spanning the tier
         also lets all three report lanes converge into one face.
SIZES    CSI_W 280 rather than 400, narrowed so the two outer report lanes have somewhere to travel:
         they rise on their own node centres, 350 and 850, and run IN to a side wall, so every unit
         the box gives up on each flank is a unit of visible horizontal run. At 280 the box is
         460..740 and each run is 110 units; at 400 it reaches 400..800, the run drops to 50 and the
         turn all but collapses onto the rise. The label needs ~150 and the sublabel ~121.
LANES    Each report lane leaves its node dead centre of the top face, so the three read as rising
         straight out of the three machines, and takes ONE 90 degree turn at most.
         WHY NOT two turns on the outer pair along a shared mid-corridor: a zigzag, three segments to
         say one thing, and the corridor between the tiers then reads as plumbing.
         The filter read runs dead down the spine, which is also where node-2 reports in from below,
         so the CSINode box has ONE vertical axis through it rather than two near-misses.
         The Pod and the Scheduler talk BOTH ways, each direction on its own lane. LANE_DX 40 is not
         cosmetic: the return lane carries a riding tag that comes to rest in the corridor, and at 14
         that tag (about 96 units) prints straight over the outbound lane.
MOTION   ONE duration for all three report balls, so they leave together and LAND together. Their
         paths differ (186 units on the flanks against 48 up the spine) and routeDur is length-based,
         so left alone the centre ball arrives first and the object lights before two thirds of the
         report has got there. Both currently fall under the PKT_DUR_MIN floor and would coincide
         anyway, which is precisely why it is pinned: the first time a tier moves far enough to push
         a flank past 315 units the three would silently desync. Registered in ALLOW_EXPLICIT_DUR.
         The riding label takes the SAME dur, or it drifts off its ball and rejoins at the endpoints.
         All three fire together rather than in sequence: three copies of one mechanism, and walking
         them would suggest an ordering that does not exist.
         The placement on `detachlag` is ONE number, PLACE_MS 2000: the freed slot is retaken at 1600
         plus a 400 fade, the Pod blinks on that instant, and the Pod chip, the Pod sublabel and the
         PVC sublabel all turn over on it as one family (`P-04`). Stated at t=0 the three read
         `Running on node-3` while the reader is still watching the slot free at about 900ms. Same
         shape as `fill` two steps up, whose chip waits for FILL_END.
NOTE     The newly taken slots fade in one after another, left to right and node by node, so the
         strip reads as FILLING rather than cutting to a full state. Pinned full above the guard
         first, so a cancel mid-fill lands on eight of eight. `seq` is a running counter across ALL
         THREE nodes: computing the delay from i and the node's own starting count double-counts
         node-1 and pushes the last slot past the step's duration, so auto-advance cuts the fill off.
NOTE     The last step's transient (slot empties, counter reads seven of eight, slot comes back
         bright) is OPACITY ONLY, never fill.
DO NOT   drive the fill through onfinish: the step's END state then depends on a callback firing, so
         a seek or early cancel leaves the slot showing the transient instead of the pinned `fresh`.
NOTE     The counter text is the one thing that still rides onfinish, and it self-heals because the
         next step rewrites every counter.
NOTE     The slots are plain rects, not box() primitives: they are not blocks that can act, so they
         must never take .highlight, pulse or receive a packet. They are a gauge, and the only thing
         they ever do is change fill.
DO NOT   add a `detaching` fill: the detach that frees a slot is a transient, and a resting colour
         invites the reader to look for it in the end state.
NOTE     The Pod is ABSENT at rest, not dim: a ghost Pod from the first frame says the scheduling
         attempt is already under way, the opposite of the setup. The three report lanes stand at full
         from the first frame, unlike every other lane here, because what they carry is a standing
         relationship that was true before the card started.
NOTE     Every step calls setSlots with all three nodes, for the same reason every step writes every
         chip: a node left unset keeps the previous reading, and a counter disagreeing with its own
         slot strip is the one error on this card a reader cannot catch.
DO NOT   Put a wire caption back in the Scheduler-to-CSINode corridor. It carries nothing the
         narration and the chip strip do not already say, and it sits off to one side of the one
         corridor that should read as a single clean axis. `wires` stays an empty map so the family
         clearWires prologue is still valid if a caption is ever wanted back.
NOTE     The FailedScheduling answer comes back DOWN its own lane rather than up the request lane,
         because that event is a thing the scheduler PRODUCES, not the request bouncing. Its tag rides
         BELOW the ball: pod() puts the sublabel 8 units above the shell bottom, and a tag at the
         default -14 prints on top of it for the last beat of the flight.
OPEN     At 900x650 the panel bottom is 375 and its right edge 398, so the LEFT report lane's rise
         from y=406 to CSI_MID_Y 330 clips the panel between 375 and 330. Pulling the lanes in to
         400 / 800 clears it and costs the dead-centre exit on both outer nodes.
OPEN     A read lane PAIR is declined and the finding stays open. The finding is real as far as it
         goes: the filter step narrates a read and only the question is drawn. But a pair is by
         definition two axes, which would put three verticals through a box the note above records
         the work of getting down to one. What answers the read is already on screen and is why the
         step lights what it lights: CSINode carries `allocatable.count: 8` in its own sublabel and
         all three Node counters are lit for the whole step precisely because they are the values
         being compared against. A ball would restate what two blocks already say, at the cost of the
         axis.
```

### before `const LEFT_X = 400;`

```
The panel wall. CONTENT_W 400 then puts CONTENT_CX exactly on 600, forced by the chip strip, which
at 976 units is far wider than any tier above it and therefore sets the visual centre. The node row
is the one tier allowed outside CONTENT_W, because it sits below the panel floor.
```

### before `const CHIP_W = 232, CHIP_GAP = 16, CHIP_COUNT = 4;`

```
Sized against allocatable.count + `8 per node` at 186, leaving ~22 units between the halves.
```

### before `const CAP_TAG_DX = [-16, 0, 16];`

```
The two outer report lanes end on the CSINode side faces, so a centred tag straddles them for 400ms.
Each outer tag steps 16 further out, mirrored, which is the least that clears on all four viewports.
The middle entry stays 0 on x: that lane enters the box floor dead centre, where
`allocatable.count: 8` sits, and the only clear band on x is 74 units away, far past the offset
ceiling. It takes CAP_TAG_DY instead and rides BELOW its ball.
NOTE     CAP_TAG_DY is [-14, 22, -14] because the three lanes do not land on the same face. The
         outer two arrive at the side faces and keep the family offset. The middle one arrives at
         the FLOOR, where -14 parked it on `allocatable.count: 8` (31.5 x 7.8 of ink, 400ms at a
         baseline gap of 1.22) and inside the box for 500ms more. At 22 it parks 14 clear of the
         floor, in the corridor above node-2, and 22 rather than 16 because the ball is r=5 with a
         6 unit glow and at 16 it prints on the line.
NOTE     `read allocatable.count` on the filter step was the widest text-on-text pair in the
         catalogue (138.5 x 5.8, 200ms), and no offset could close it: the Scheduler sublabel and
         the tag are both centred on 600, so they overlap on x at every dx, and the corridor is only
         44 units. Shortening the string does not help for the same reason. It is closed by TIME:
         READ_TAG_EMERGE 300 is half the flight, which is what the ball needs to put 22 of the 44
         units between its tag and the Scheduler floor. The 100ms cut on the same tag went with it.
OPEN     The middle `cap 8` crosses the node-2 frame TOP at 406 on its way out, 80ms of ink on a
         20ms grid, and every dy that clears the CSINode floor starts the tag inside that frame,
         because the lane runs from one to the other. It replaces an 80ms cut of the CSINode BOX
         floor plus 500ms inside that box, which is the trade: a dashed room instead of a filled
         body, and no text under it.
```

### poster

```
A request that branches looking for somewhere to go, and a rack of sockets with nothing free at the
end of every branch. The shape is a scheduling DECISION, which is what makes this card different from
its six siblings: they all start with a Pod that already has a node.

The sockets are drawn DARK (0.03) rather than as bright cells. They are holes, not contents, and a
rack of dark recesses in a barely-lit frame reads as hardware at a glance, where a 0.20 fill reads as
eight grey tiles and flattens the lower half into a keypad. Dropping them also frees the brightest
fill for the block the sentence is about: the request at the top, the one thing that wants something
and cannot have it.

The branch is doing real work: one request forks into two candidates and both wires run the full way
down to the rack, meeting its top edge at x=112 and x=208, so the decision layer above is fully wired
to the hardware below. Everything above the rack is the decision, everything below it is the
machines, and the four dashed wires connect them at one weight.

Content sits 13..167 in a 180 tall box and is symmetric about x=160: rack side margins agree at 15,
socket rows and columns are both gapped at 6, and the sockets clear the rack by 9 above and below.
```

## storage-volume-detach-on-node-loss

### layout

```
WHAT     Detach on node failure. A node goes NotReady and its kubelet falls silent. The old Pod cannot
         be confirmed dead, so Kubernetes deliberately WILL NOT detach the volume yet: detaching while
         the old Pod might still be writing means two nodes writing one filesystem. The stall is a
         chain of timeouts walked one rung at a time on the ladder, and the out-of-service taint is
         the operator escape hatch that asserts the node is dead.
SCOPE    Held deliberately against storage-multi-attach-error, or the pair reads as one card shown
         twice. Both end with one RWO disk moving between nodes, and the difference is not the outcome
         but what is being waited on. There, node-1 is HEALTHY and the volume is legitimately held by
         a Pod that is legitimately running: an ordering problem with an ordering fix. Here NOTHING is
         contending for the volume. The wait is on DOUBT, because a silent kubelet cannot confirm its
         Pod stopped writing. So THIS card owns the unreachable-toleration and force-detach clocks,
         the roughly six minutes, the two-writers-corrupt-one-filesystem argument, and the
         out-of-service taint. None of those appear on the other card.
LAYOUT   TWO vertical stacks side by side, because the story is one disk moving between two nodes.
         The two columns are deliberately IDENTICAL in width: the only thing that differs is which one
         is answering, so anything else that differed would read as a difference the card is not about.
         The node tier width is the ONLY lever on where the diagram sits, and it is solved for:
         2*192 + 16 = 400 puts CONTENT_CX exactly on 600, and NODE_W then sets POD_W. The frames are
         192 wide against a tight 16 gap so the pair reads as two substantial machines rather than two
         thin columns, and the disk below is 190 wide, wider than the gap, so it still bridges both.
         That exactness matters because of the bottom band. The node tier is symmetric about
         CONTENT_CX wherever it sits, so on its own it would look fine anywhere. The chip strip does
         not: at 662 units it is more than half again the width of the node tier, so it sets the
         visual centre. WHY NOT nodes at 430..1140: that puts the whole card 186 units right of the
         canvas centre with a dead left third.
         The bottom band does NOT sit inside the chip strip's edges, for a reason a purely horizontal
         reading cannot see: the escape box is a BLOCK, and the only other block below the panel is
         the disk. Two blocks are what the low-content check measures, so an escape box parked at
         701..931 puts the low half at centre 718 however well the chip strip behaves. It stands on
         the SPINE under the disk it acts on, which also turns its taint lane into a straight climb
         into the disk floor instead of an elbow into its right face. The ladder and the chips then
         take one side each, so the strip still spans 60..1140 and centres on 600.
PANEL    Worst step (evict, 483 characters, the longest narration on the card), right / bottom by
         viewport:
           1920x1080 -> 203 / 209    1440x900 -> 319 / 262    1280x800 -> 358 / 305
           1100x800  -> 397 / 329     900x650 -> 398 / 498
         x<=398 and y<=498. LEFT_X 400 has about 2 units of slack against a measured 398.29 and
         cannot move left at all. The row above is the EVICT step, the deepest on the card. The
         161 / 203 / 236 / 255 / 436 are the ESCAPE step, which is only the second deepest: LAD_Y 448 clears escape's 436.29 by 11.7 at
         900x650, and against evict it clears every sampled width but not 900x650, which is the OPEN
         below. DO NOT re-derive either number from a single wide-window screenshot, and note that a
         longer narration invalidates both.
OPEN     TWO STANDARDS, AND THEY DISAGREE. The harness samples 1600x1000, 1280x860 and 1100x800 only
         (`report/geometry-soft.test.mjs` OCCLUDED, `report/overlay.test.mjs`), and over those three
         the deepest this panel goes is 329.20, which the ladder top at 448 clears by 118.8, so
         nothing reports. The 900x650 row above is a hand sample and is the stricter number by 169
         units: on evict the panel reaches 497.86 and takes the top rung (measured ink x 60..440,
         y 448..486) over 338 of its 380 units, plus the top 2.9 units of the second rung at
         y 495..533. The ladder has nowhere to go. Below it the chip strip stands at y=598, to its
         right the escape box holds x 485..715 over y 478..550, and lifting the rungs walks them
         further INTO the panel. The only lever is the evict narration, and that is the one step that
         has to explain why a Pod which cannot be confirmed dead is not enough to detach.
SIZES    The floor under POD_W is the widest string inside a Pod, the sublabel `marked for deletion`,
         114.6 units (10px mono at 6.03), so POD_W 168 (NODE_W less two NODE_PAD) keeps ~26.7 either
         side. The rate is PER CLASS (`L-20`).
         CHIP_W 210 rather than the family 232, measured IN THE BROWSER rather than estimated, because
         the rate under-reads on strings full of wide glyphs:
           Node-1 41 + `NotReady, tainted` 117 = 158     volume 41 + `attached to Node-1` 124 = 165
           new Pod 48 + `ContainerCreating` 117 = 165
         210 clears the worst pair with 21 units, the floor for the two halves reading as separate.
         The LADDER rows carry the longest strings on the card and are the one place a per-character
         estimate is not good enough: the rungs are full of wide glyphs, so the longest renders 338
         units where 6.0 per character predicts 307. MEASURE them. chainList insets its text 10 from
         the row edge, so LAD_W 380 leaves 32 of margin on the worst rung; at 350 it clears the row
         border by 2 and reads as text jammed against the frame. ESC_W shrinks to 230 to buy the
         ladder that width back: its widest sublabel is 175 units, so 230 leaves ~27 either side, and
         centred on the spine it keeps 45 units to the ladder.
LANES    The attach lanes stop at NODE_BOTTOM rather than running up into the Pod: the disk attaches
         to a NODE, and the Pod is what runs once the node has the volume. Both are built IDENTICALLY
         and both are real arrows in the FULL storage colour (dim: false), so the left lane does not
         read as a lesser arrow than the right, and only its OPACITY drops on force-detach.
         WHY NOT elbow the taint lane into the disk's RIGHT flank rather than climbing the spine into
         its floor: the disk caption anchors at x=711 on y=340, inside the disk's own 282..386 band,
         and the longest wire string (`do not detach yet`, 17 characters of 11px mono at 6.89) reaches
         x=828, so a side-on approach runs its dashed line through the caption before it turns in.
         Straight up the spine needs no elbow and clears the ladder and both node frames.
         The ladder and the packet lanes do not overlap at all (lanes above 478, ladder below 448), so
         the ladder needs no exemption from the packet layer.
MOTION   DO NOT give the unconfirmed Pod a dim `unknown` state pulsed with pulsePodDim: that stacks an
         opacity swing on the blink and reads as a faster, busier pulse than the same beat elsewhere.
         Not knowing whether a Pod runs is not a phase of its own, so it is carried by the sublabel
         and the chip instead.
         Being MARKED is a phase, and the card walks the old Pod down the vocabulary in the two steps
         that earn it: the sublabel reading `marked for deletion` IS Terminating and drawing that at
         full is a catalog-wide defect. Rung 1 of the ladder is on that same vocabulary and says
         `old Pod marked`, not `old Pod deleted`: on an unreachable Node the deletion is exactly what
         cannot be confirmed, which is the whole reason the disk is still held. The fade to terminated STARTS at terminating rather than at 1,
         because an animation keyframed from full brightens a marked Pod back up for one frame before
         killing it. A Pod at either shade never pulses.
         The replacement Pod is not drawn at all until it EXISTS. DO NOT fade it in on the notready
         step: no controller could do that, because while the old web-0 is a live object with no
         deletionTimestamp nothing may create a second Pod under that name.
         Both Pods carry a sublabel tracking their state, written on EVERY step like the chips: a Pod
         still reading `Running` three steps after its node went silent is a lie the reader cannot
         catch. Same for the chips: unset, the volume chip reads `force-detached` on the step that is
         explaining why nothing has been detached yet.
         The disk does NOT flash on force-detach. It is a static receiver, shown by its highlight plus
         the sublabel and the chip flipping; the severing is carried by the two fades. On the closing
         taint step no Pod acts (the operator does), so there is no pulse and no block flash.
WIRE LABELS
         THE COUNTERFACTUAL CAPTION (`T-35`). The escape step plays AFTER the card has ended: attachb
         closes with the volume on Node-2 and the new Pod Running, and escape then draws the taint path
         as real state, chips and lane included. ONE caption, `if instead the taint lands first`, is what
         stops that frame reading as a seventh thing that happened to this cluster.
         It sits in the empty band between the disk floor and the escape box, anchored `start` 20 right
         of the spine, so it reads as a condition on the box below it. WHY NOT centred on the escape
         box: the taint lane owns x=600 through that whole band, so a centred caption takes the dashed
         line through its glyphs. WHY NOT anchored `end` left of the spine: 220 units of string then
         reach back to x=380, and on THIS step at 900x650 the panel is x<=398.29 with a bottom of
         436.29, so the opening words go under it.
         MEASURED IN THE BROWSER at 220.5 / 201.5 / 196.3 units over 1600x1000 / 1280x860 / 1100x800,
         and 194.6 at 900x650, so the widest is the widest viewport. Nearest neighbour is the taint lane
         at 20 units, then the escape box top 34.6 below the ink and the disk floor 42.8 above it. The
         ink bottom lands at 443.4, which is 4.6 above LAD_Y, and the ladder is 180 units to the left in
         any case. Panel clearance on the escape step at 900x650 is 221.7 units horizontally.
         The wording stays off the Pod on purpose: this card names the old Pod's end three ways across
         its steps already, and a caption is not the place to add a fourth.
NOT A DEFECT
         W_ATTACH_A is reported as a lane nobody rides, and converting it to a relationPath is
         DECLINED: sinking one half of a deliberately symmetric pair makes the left lane the lesser
         arrow, which is the thing this card goes out of its way not to do. Both halves are
         relationships by nature here, and the card already says which is live through OPACITY.
NOTE     node() puts its own label RELATIVE to the frame group. Use the primitive: hand-rolling these
         out of box() and appending an absolutely positioned caption renders `node-1` at 874, on top
         of the other column's App box, and `node-2` at 1614, past the viewBox edge.
```

### before `const LEFT_X = 400;`

```
The panel wall, ~2 units of slack against a measured 398.29. LAD_Y 448 clears the deepest SAMPLED
bottom of 329.20 by 119, and does not clear the 497.86 the evict step reaches at 900x650, so the
bottom band is the tier a longer narration takes out first.
```

### before `const NODE_W = 192, NODE_GAP = 16, NODE_PAD = 12;`

```
2*192 + 16 = 400 puts CONTENT_CX exactly on 600, and NODE_W then sets POD_W. The two columns must
stay IDENTICAL in width: anything that differed between them would read as a difference the card is
not about.
```

### poster

```
A technical diagram curated to one sentence: a live VolumeAttachment still binds the volume to a DEAD
node, and the move to the live node is gated by a timeout. Two machine frames stand left and right:
the left one dim with a dark status LED (failed, kubelet silent), the right one lit with its Pod
still dashed (pending, waiting on the disk). The volume sits between them with the faint 0.04 body
fill the rest of the poster cylinders use, so it reads by its jade rim, not as a grey slab.

Both wires LEAVE THE CYLINDER HORIZONTALLY and are identically dashed, then turn up into the node
above: only the badge versus the clock, and the dim versus the lit node, tell the two sides apart. A
small badge carrying an attached:true check rides the left wire to the dead node, the attachment that
has not been deleted, and a CLOCK sits on the right wire to the live node, the roughly six minute
force-detach wait. The clock is the signature: the whole card is that a healthy-looking cluster still
waits out a timer. Both wires break cleanly around the badge and the clock. Content spans y=28..158.
```

## storage-volume-expansion

### layout

```
WHAT     Growing a bound volume, in two phases.
CONTENT  The allowVolumeExpansion gate is enforced by the API SERVER on the edit, not by the
         external-resizer afterwards. Raising the request on a claim whose StorageClass does not allow
         expansion is refused at admission with `only dynamically provisioned pvc can be resized and
         the storageclass that provisions the pvc must support resize`, so the resizer never sees such
         a request at all. DO NOT have the resizer consult the class before acting: that puts the gate
         one component too far downstream and makes a rejected edit look like a resize that quietly
         declined to run.
         The second phase is where a FILESYSTEM is grown and a raw block volume has none, but skipping
         it is a DRIVER OPTION, never Kubernetes behaviour. The CSI spec says MAY twice, at
         https://raw.githubusercontent.com/container-storage-interface/spec/master/spec.md : on
         NodeExpandVolumeRequest.volume_capability, "if volume is being used as a block device the SP
         MAY choose to skip expanding the filesystem in NodeExpandVolume implementation but still
         perform rest of the housekeeping needed for expanding the volume", and on
         ControllerExpandVolumeRequest.volume_capability, "the SP MAY set node_expansion_required to
         false in ControllerExpandVolumeResponse to skip invocation of NodeExpandVolume on the node by
         the CO". Kubernetes makes the call either way: pkg/volume/csi/csi_client.go sets
         req.VolumeCapability.AccessType to VolumeCapability_Block inside NodeExpandVolume when fsType
         is the block sentinel, and operation_generator.go runs node expansion out of the block MAP
         path as well (the "MapVolume.NodeExpandVolume failed with %v" log), with no block short
         circuit anywhere in nodeExpandVolume. So all three strings say a driver MAY skip that work.
         ONLINE IS A CONDITION, not a given: "File system expansion is either done when a Pod is
         starting up or when a Pod is running and the underlying file system supports online
         expansion", https://kubernetes.io/docs/concepts/storage/persistent-volumes/ , which also
         limits filesystem resize to XFS, Ext3 and Ext4. The desc hedges it ("Where that filesystem
         grows online"), and the pod-sees narration has to hedge it too: it says "because this
         filesystem grows online".
         TWO PHASES IS THE COMMON SHAPE, not the rule. A driver may implement EXPAND_VOLUME on the
         controller, on the node, or both, and the external-resizer sidecar runs either way, doing a
         NO-OP expansion when the driver has no controller capability,
         https://kubernetes-csi.github.io/docs/volume-expansion.html . Judged worth exactly two words
         in the desc, which reads "runs one or two phases" and sits at 467 of the 470 characters D-04
         allows: the node-only NO-OP case is recorded here rather than bought with those 3 characters.
         Shrinking: the API refuses a request below the size already provisioned. What newer clusters
         do allow is walking a request back DOWN while an expansion is still pending, which cancels a
         grow that has not happened yet. That is not shrinking a volume and the narration is worded not
         to promise it.
LAYOUT   The centred vertical stack, with tier heights and block footprints taken from
         storage-pvc-protection so the two cards in this subcategory read as one family: the vertical
         pitch is 162 again, measured between midpoints. The spine is the mount ascent and balls
         travel it, so its arrowheads are earned.
         What differs from the sibling is FOUR actors, placed so that not one lane needs more than a
         single turn. The top right slot is SHARED by Kubectl Patch and the StorageClass, which are
         never on stage together (Kubectl acts on the edit and the shrink steps, the class only on the
         gate step), so they occupy one slot and send their ball down ONE lane into the claim. The
         external-resizer and Kubelet sit level with the disk and mirrored about the spine, so the two
         phases arrive at it from opposite sides at the same height: the control plane grows the
         device from one side, the node grows the filesystem from the other, and the disk between them
         is the one object both touch. The 234..306 band in the right column is deliberately left
         empty so the claim lane can drop through it without crossing anybody.
PANEL    Kubelet sits at x=130, well inside the panel's horizontal reach, and clears it only on the y
         axis, at y=396. That clearance was argued from the blanket `y<=300`, which is not a
         measurement: the panel bottom is PER CARD and reaches 504 on the longest narration in the
         catalog. Kubelet is therefore safe only while THIS card's own bottom stays under 396, which
         the table below shows holding on the three sampled viewports and failing at 900x650.
         Re-measure with `npm run report` from `scheme/test/`, whose OCCLUDED block prints the extent.
         The one element placed on a MEASUREMENT is the verdict caption left of the claim, anchored end
         at x=464, y=274, reaching back to about x=273 on its longest string. Worst step of the seven,
         right / bottom by viewport:
           1920x1080 -> 203 / 161    1600x1000 -> 291 / 177    1440x900 -> 319 / 203
           1280x860  -> 378 / 214    1280x800  -> 358 / 236    1100x800 -> 397 / 255
           900x650   -> 386 / 430
         Over the three standard viewports the bottom peaks at 254.66 at 1100x800. MEASURE THE CAPTION
         BY ITS RECT, NOT BY ITS BASELINE: y=274 is where the baseline sits, so the 19 units that
         follow from 254.66 are baseline clearance, while the INK starts at 262.7 and the real
         clearance is 8.3, a third of a narration line. A bottom of 231 for this card, and the 43 units
         that follow from it, reproduce at no viewport in the list: do not reinstate either number.
         The bottom is driven by the TEXT, so it is a per-card number: storage-pvc-protection's same
         caption is shallower purely because its strings are shorter. Every correction to prose here is
         sized against the 255 rather than against a sibling. LENGTHENING ANY NARRATION MOVES IT.
MOTION   The two phases are DRAWN. Measured before the gauge landed: the card held ONE cylinder and not
         one of its 7 steps changed its size, so a fourfold growth was carried by chip text alone.
         The gauge under the disk is four cells of 5Gi in three layers, a track that is always there,
         a device wash, and a brighter filesystem core inset inside that wash. Cell 0 is the original
         5Gi and never moves, which is why only three of each layer carry a ref.
         controller-expand reveals the device wash on cells 1 to 3, 140ms apart, from the moment the
         call LANDS (`at: 'exp'`, never step entry). node-expand reveals the filesystem core on the
         same beat. The settled frame between the two is the teaching point: three cells holding a
         device and no filesystem. Longest span about 1480ms against a duration of 3200.
NAMING   The three riding tags say what the call CARRIES, never what it is CALLED: the block the ball
         leaves already prints the method name as its sublabel, and all three tags were once a
         verbatim copy of it. `checked at admission` adds WHERE the gate runs, and the two phase tags
         carry the extent each call moves.
         Re-measured at 1600x1000 at the instant each tag is fully opaque at the END of its flight,
         which is where a block can print through it: the two claim-lane tags clear the claim by 1.7
         units and the two disk-lane tags clear the disk by 4.4, both of which are the DY above and
         not the text. Only `filesystem 5Gi to 20Gi` grew, 93.4 units to 128.5, and at the START of
         its flight it still clears Kubelet by 11.4. The rate behind those numbers is 5.84 units per
         character on `.scheme-box-sublabel`, measured here rather than taken off L-20.
NOTE     The verdict slot reports the state of the CLAIM, which changes kind across the card, so it is
         named for its job rather than for a lane, and it sits hard against the claim instead of
         beside a lane it does not describe.
         The four chips (CHIP_W 252) are the whole lesson: they hold the same number at the start, then
         change ONE AT A TIME in order, so the staggered highlight walking left to right IS the
         two-phase story.
WHY NOT  Scaling the cylinder GROUP, measured in the browser at 1600x1000 on the controller-expand
         step. Composed honestly against the group's own translate, `scale(1.6, 1)` stretches the
         label `PV data-vol` from 79.00px to 122.32px wide while its height goes 18.00 to 17.24, so
         the glyphs are distorted rather than scaled. The scale is about the group's local origin, so
         the disk grows to the RIGHT only: its centre travels 80.1px (69 viewBox units), its right
         edge reaches 853 against the External-resizer at x=850, and the mount spine at x=600 stops
         landing on the face midpoint L-11 measures it against. Written the way a keyframe would
         write it, as a bare `scale(1.6, 1)`, the CSS transform property REPLACES the SVG transform
         attribute and the disk teleports 483px left, under the narration panel. M-04 as a number.
DO NOT   Do not write "a raw block volume skips this phase entirely", in the narration, the desc or the
         aria-label, however natural it reads. It has been restored once as a lost qualification and it
         is false: the CSI spec says the SP MAY skip the filesystem step and MAY answer
         node_expansion_required false, so the option is the DRIVER's and Kubernetes issues
         NodeExpandVolume for a block volume all the same. The two MAY quotations and the two source
         files that settle it are in the CONTENT block above. The honest verb is "may skip".
         Do not caption the gauge. Its two layers are named by the two chips that move with them
         (`real disk` and `filesystem`), and a caption would be the defect the three riding tags were
         repaired for: a string carrying nothing the reader does not already have two lines away.
         Do not give a cell a class instead of an inline fill: no field writes a fill, and a class
         here is a `diagrams.css` rule owned by one card.
OPEN     BELOW THE STANDARD SET THIS CARD DOES NOT HOLD, and the cost is per element rather than one
         panel number. At 900x650 the panel measures right 386.10 / bottom 430.03 on `gate`,
         `node-expand` and `no-shrink`, 397.38 on `controller-expand` and `pod-sees`, and 364.74 on
         `idle` and `edit`, re-measured step by step (`overlayProbe`, rects through `__toRoot`):
           verdict caption   y 262.7..277.2, right edge pinned at 464, so its LEFT end is under the
                             panel on every step: 109.1 of the 187 units of `request raised, nothing
                             moved` (58 percent) and 25.2 of the 103.2 of `filesystem grown`.
           Kubelet           x 130..350, y 396..468, so the top 34 units (47 percent of its height) sit
                             under the 430. It is drawn on ONE step, `node-expand` through NODE_ON, and
                             that step is one of the three at 430.
         NO CHEAP CLEARANCE EXISTS. The caption is anchored `end` hard against the claim and its only
         free direction is DOWN, into the disk cap at 389 and the two phase lanes on DISK_MID 432.
         Kubelet is the LEFT half of the mirrored pair the whole layout is built on (the two phases
         reaching the disk from opposite sides at one height), so moving it right or down says something
         false about which side each phase comes from, and the panel still reaches 430 whatever it does.
         The remaining lever is prose, and CONTENT above is why each of these narrations is at its
         floor. 900x650 is a hand sample no check takes (`STO.L-04`, `L-06`), which is why this is OPEN
         rather than a regression: over the three sampled viewports every element clears, the caption by
         8.3 units.
```

### before `const CX = 600;`

```
Pod, claim and disk all sit on this axis, and the 162 pitch above it is the same as
storage-pvc-protection, which is what makes the pair read as one family. The four actors are placed so no lane needs more
than a single turn.
```

### before `const CHIP_W = 252, CHIP_GAP = 24;`

```
Four chips, derived rather than hand-placed. They hold the same number at the start and change ONE
AT A TIME, so the staggered highlight walking left to right IS the two-phase story.
```

### before `const GAUGE_X = DISK_LEFT, GAUGE_W = DISK_W;`

```
Four cells of 5Gi, sized off the disk so the strip reads as THAT disk's capacity axis rather than as
a fifth chip. 488..516 is the whole clearance this band has: the cylinder ends at 475 and the chip
strip starts at 545, so a taller gauge is bought from one of those two.
The six moving cells are filed as scalar refs inside the one `make()` hook, by literal assignment.
A computed key (`refs['dev' + i]`) is invisible to the ESCAPE_ASSIGN regex three test readers share,
and every `opacity` and `F.reveal` key on this card resolves against that set.
```

### poster

```
One cylinder with a jade band filling its LOWER two thirds and a bright ellipse with a 2.4 stroke
marking where the old ceiling was, plus a faint up-arrow above it. The bright ellipse is the whole
sentence: the disk did not move, its top did.
The arrow sits at 0.5 and is short. Making it the subject would say the growth is an event, and the
card is about the new boundary being real and visible to the Pod.
```


## storage-volume-mode

### layout

```
WHAT     The sibling of storage-access-modes: accessModes and volumeMode are the two spec fields that
         sit side by side on both the PV and the PVC. Where access modes answer WHO may hold the
         volume, volumeMode answers WHAT the workload is handed.
LAYOUT   TWO vertical stacks side by side inside ONE node, because the fork this card is about happens
         on the node, in kubelet and the CSI node service, and not in any control-plane controller.
         The two disks are deliberately identical (same size, class and backend): the only thing that
         differs between the columns is the one field.
         LEFT_X cannot move, so NODE_W is the ONLY lever on where the diagram sits, and it is solved
         for: NODE_W 400 puts CONTENT_CX exactly on 600. That exactness matters because of the CHIP
         STRIP: the narrow tiers look fine wherever they sit, but at 976 units the strip is more than
         twice the width of the node above it, so it sets the visual centre.
WHY NOT  NODE_W 456, giving CONTENT_CX 628: the strip then spans 140..1116, so 140 units of margin on
         the left against 84 on the right. Symmetric about the diagram, visibly shoved right on the
         canvas. At 600 the strip is 112..1088 and the two readings agree, so do not widen NODE_W back
         without re-checking the strip margins.
PANEL    Worst step, right / bottom by viewport:
           1920x1080 -> 203 / 193    1440x900 -> 319 / 242    1280x800 -> 358 / 282
           1100x800  -> 397 / 304     900x650 -> 398 / 498
         So x<=398 and y<=498, and the 498 is the 900x650 hand row, narrower than any viewport the
         harness samples, which is why the card takes it (`STO.L-04`): over the sampled set this card
         bottoms out at 304. It is NOT the catalog's deepest panel, and the two are not comparable at
         face value, being taken at different viewports: the preamble gives storage's deepest over the
         sampled set as 354 (`storage-ephemeral-storage-eviction`) and the catalog maximum as 503
         (`workloads-pod-phase-machine`). LEFT_X 400 has about 2 units of slack and cannot move left
         at all. The 498 also pins the disk shelf: the left cylinder starts at x=410, which clears
         the panel by only 12 units at 900x650, so PV_W cannot grow leftward either. DO NOT re-derive
         any of this from a single wide-window screenshot.
LANES    Each direction has its OWN lane offset LANE around the column centre, so a mount rising into
         a container never re-uses the arrow the request came down on.
         Column separation is POD_W + POD_GAP = 204, so PV_W has to stay under that or the two disks
         touch: PV_W 176 leaves a 28 unit gap, enough that they read as two objects rather than one
         wide shelf, and it keeps the left disk starting at 410, the clearance the panel needs.
BUDGET   POD_W falls out of NODE_W: 2*POD_W + POD_GAP = NODE_W - 2*NODE_PAD = 368. The floor under
         POD_W is the widest string inside a Pod, the sublabel `volumeMode: Filesystem` at 133 units,
         so POD_W 164 keeps ~15 units of air either side and POD_GAP takes the remainder.
         The BAND CAPTION sits between the band and the disk shelf, centred on CONTENT_CX, running
         through the corridor between the two columns. The nearest lanes are the inner ones at 510 and
         690, so 180 units of clear width, and 11px JetBrains Mono measures 6.9 units per character
         (measured: `raw, unformatted` renders 110.2 over 16 characters). A band caption therefore has
         a hard ceiling of 26 CHARACTERS. Overrun it and the first and last letters sit on a lane
         arrowhead, which is how two captions shipped before this was written down.
         Family CHIP_W 232, worst cases in viewBox units:
           node does  62 + `no mkfs, no mount`  117 = 179
           container  62 + `device /dev/xvda`   110 = 172
           volumeMode 69 + `Filesystem`          69 = 138
           fsGroup    48 + `not applied`         76 = 124
MOTION   What a Pod must NOT have is a lingering state: no .highlight is ever put on the container box
         (`STO.C-02`). DO NOT split the shell into its own wrapper to keep the pulse off the
         container, the Pod then blinks around a dead rectangle, which reads as the container being
         excluded from whatever the Pod is doing. The problem was never the pulse, it was the
         highlight left behind.
         The summary step compares the two columns, so BOTH disks light: static highlight only and
         deliberately no motion, because it is a closing step the reader is meant to sit and read and
         the two disks are the comparison, not an event. A flash there also blinks the disks a beat
         after the narration has moved on to fsGroup and subPath, which points at nothing.
DO NOT   Put `immutable` in the volumeMode chip. That makes the chip contradict its own name, because
         the mode is Block and immutability is a property of the field, not a value it can hold. That
         fact lives in the narration and the band caption instead.
NOT A DEFECT
         `W_BLK_STAGE` is reported as a lane nobody rides, and it is the strongest case of that family:
         block mode has NO staging step. There is no mkfs and no mount, which is the entire contrast
         the card is built on, so the lane exists to be visibly empty beside the fs branch that uses
         its twin. Its sibling `W_FS_DEV` was on the same finding and is now ridden, because the fs
         branch really does get the formatted device back.
         `A-05` asks the follow-up question, whether it should therefore be a `P.relation`, and the
         answer here is NO, on a measurement. A dim storage lane renders at `stroke-opacity` 1 with
         `marker-end` `url(#arrowhead-storage)`, and `.scheme-arrow-relation` pins 0.45 and drops the
         marker (read off the live tree: this card against `storage-volume-model`). Both repairs, the
         relation and the `P.arrow` plus a `tune` that removes only the marker, act on ONE lane of a
         MIRRORED pair, so the Block column would then be drawn as the weaker structure while the card
         claims in words and in the layout that the two columns are identical and only the field
         differs. That is the `storage-volume-detach-on-node-loss` argument, arrived at from the other
         side: there the pair is left and right of one action, here it is the two columns of the
         comparison. Opened all 7 steps at 1600x1000 and at 1100x800 to check it: the two columns carry
         four identically drawn lanes each on every step, and the closing `trade` step, which is the
         frame the reader sits on, is exactly the frame the asymmetry would show in. The lane keeps its
         arrowhead and says so at its declaration, in the form `storage-reclaim-policy` already uses for
         `W_RET_WIPE`: `drawn, never travelled`.
```

### before `const LEFT_X = 400;`

```
The panel wall, ~2 units of slack, and the left edge of the node. NODE_W is then the only lever on
CONTENT_CX and is solved so it lands on 600. Every tier hangs off that centre, so widening the node
slides the chip strip off the canvas centre while each tier still looks internally symmetric.
```

### before `const CHIP_W = 232;`

```
One width for all four chips, sized against `node does` + `no mkfs, no mount` at 179.
```

### before `const STAGE_TAG_DX = -46;`

```
The stage tag parks on the disk top and the return tag leaves it 100ms later, lanes 24 apart against
57 and 69 units of ink, so the two printed as `mkfexb4tdevice` for 200ms at a baseline gap of 0.00.
-46 puts the stage tag left of its own lane and the worst gap after is 7.0 at 1280x860.
WHY NOT  Splitting them +-24: it clears the pair but widens two grazes, of the band sublabel and of
         `stage: mkfs then mount`, from 28 and 14 units to 69 and 35.
```

### before `const MOUNT_TAG_DY = 22;`

```
Four tags park on a Pod sublabel at the default (tag ink at POD_BOTTOM-14 against the sublabel at
-8): 88.1 x 8.0 of ink on fs-mount, 91.9 x 7.0 on block-claim, 75.5 x 8.0 on fs-claim and on
block-publish, all at a baseline gap of 2.03. No offset within +-80 clears any of them, because the
sublabel is centred on the same x the lane rides and the tag sweeps the entire 97 units the ball
does. It takes two levers, not one.
NOTE     The two tags LEAVING the Pod keep -14 and fade in at delay + TAG_EMERGE instead of at
         delay - 150, so they are first readable about 250ms out, past the Pod floor. The two
         LANDING on the Pod floor cannot be helped by timing at all, because they come to REST 6
         above the sublabel and stay there for the hold: those ride 22 BELOW the ball instead.
WHY NOT  12 below, the number `storage-ephemeral-vs-persistent` takes on the same landing: the ball
         is r=5 with a 6 unit glow, and at 12 it prints on the line. 22 is the offset
         `storage-volumeattachment` already took for the same reason.
WHY NOT  Moving the Pod sublabel, which the earlier reading of this finding called the only fix. The
         band it could move into is the 30 units between the container box floor (178) and the Pod
         floor (208), and the parked tag ink tops out at 186.8, so the sublabel would have 8.8 units
         to live in and would touch both edges.
OPEN     All four still cross the NODE-1 frame bottom at 241, 20 to 60ms of ink measured on a 20ms
         grid at 1280x860. That crossing is in every version of this card, the one before this
         repair included, where it was measured as part of a 140ms em-box cut alongside the pod-face
         cut that is now gone. The lane runs from the Pod through the frame edge to the band, so no
         offset removes it, and a dim dashed room is the cheapest thing left for a tag to cross.
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

## storage-volume-model

### layout

```
WHAT     THE ANCHOR CARD of the storage category. A VERTICAL STACK, and the recurring gesture is a
         MOUNT travelling the lane between a container and the disk.
CONTENT  The point of the card is OWNERSHIP. A volume is declared ONCE at spec.volumes (Pod level) and
         each container mounts it at volumeMounts, possibly at a different path. The volume belongs to
         the POD, not to any container, so it survives a container crash and is shared between
         containers, and it dies only when the Pod dies.
LAYOUT   The Pod sits BELOW the panel (measured at (335, 143) for this card, Pod top at 150 clears it),
         which frees the full canvas width: the Pod is stretched to 600 and the two containers are
         pushed toward its edges, so each container centre lands OUTSIDE the cylinder span. That is
         deliberate: the mount lanes are L-shaped, dropping straight from a container and entering the
         cylinder through its SIDE, symmetric left and right about the ownership spine.
LANES    The centre OWNERSHIP SPINE carries no arrowhead, because ownership is a relationship, not
         traffic.
         Balls travel BOTH directions, so each side carries a PAIR of one-way L-shaped lanes, offset
         LANE_DX around the container centre (the pair centred on its block) and LANE_DY around the
         cylinder midline so the horizontal runs do not overlap. THREE of the four carry their own
         arrowhead showing its one direction. The sidecar's DOWN half is the exception and is built as
         a relation, arrowhead and all removed: the log shipper only READS, so no ball ever rides it,
         and an arrowhead on a lane nothing travels reads as traffic the card never shows. The app's
         DOWN half keeps its arrowhead, because the write ball does ride that one.
MOTION   HIGHLIGHTS ARE STEP-STATIC: every block a step uses lights at step entry (above the reduced
         guard) and stays lit for the whole step, and the Pod pulse fires at the same instant, so pulse
         and highlights land in one beat. The balls only illustrate the traffic, they do not drive
         highlight timing. Step 1 (declare) is the exception: the Pod is not acting, so only the volume
         lights. On the crash step only the app and the volume are involved, the log shipper untouched.
         DO NOT add a crash flicker: too blinky.
         On the delete step the chips flip to gone / unmounted / lost and the whole stack (Pod, volume,
         lanes, spine, ownership label) settles to a ghost so the picture matches the words. Ghost
         opacities are pinned statically so reduced motion and a mid-step cancel land on the dimmed
         state, and the fade below only eases into it.
```

### before `const SPINE_X = 600;`

```
The ownership spine, and the axis both mount lanes are symmetric about. The Pod is stretched to 600
wide so the two containers sit OUTSIDE the cylinder span, which is what makes the lanes L-shaped and
lets them enter the cylinder through its side.
```

### poster

```
A Pod with two containers over one cylinder, two dashed mount lanes rising from the disk to the
containers, and a third fainter line at 0.5 on the centre axis. The two lanes are the mounts and the
faint centre line is the declaration: the sentence is that a volume is declared ONCE at Pod level
and mounted twice.
This is the category's anchor card and its poster is the grammar in miniature: stack on a spine,
side-entry lanes, no packet dot anywhere.
```


## storage-volume-snapshot

### layout

```
WHAT     The snapshot API mirrors the volume API exactly: VolumeSnapshot is the namespaced request
         (like a PVC) and VolumeSnapshotContent is the cluster-scoped object it binds to (like a PV).
         The snapshot data physically lands BESIDE the source volume, in the same storage system,
         which is exactly why a snapshot is not a backup.
CONTENT  Who does what, in which order, is the part most diagrams get wrong. TWO components, and they
         are not the same thing:
           snapshot-controller   one per cluster, shipped independently of any CSI driver, watching
                                 the API for VolumeSnapshot and VolumeSnapshotContent objects. In
                                 dynamic provisioning it is what CREATES the VolumeSnapshotContent
                                 and binds it one to one, and that creation is what triggers the
                                 external-snapshotter sidecar.
           csi-snapshotter       the sidecar next to the driver. From v4.0.0 it ONLY watches
                                 VolumeSnapshotContent, never the VolumeSnapshot, and it is what
                                 calls CreateSnapshot, DeleteSnapshot and ListSnapshots.
         So the object exists BEFORE the snapshot is taken, and the sidecar never reads the user
         request. DO NOT have the sidecar pick up the VolumeSnapshot itself and write the Content
         afterwards carrying the handle: that inverts both the actor and the causality.
LAYOUT   Three bands, every one centred on CX, and the widest (the chip strip at 112..1088) sets the
         margins the rest answer to. The top band holds the two objects the USER writes, and since the
         top-left is unusable the request box starts at 420 and the pair leans right, balancing the
         panel. The middle band is the control plane, running RIGHT TO LEFT in the order the story
         goes: the controller that creates and binds, the object it creates, the sidecar it wakes.
         That direction is forced, see PANEL. The bottom band is the storage backend holding all three
         disks, so the shared-fate point is made by the picture rather than by a caption.
         The Content and the snapshot disk sit on CX, so the lanes the Content shares with the request
         run as one straight vertical and the CreateSnapshot zigzag lands on that same line.
         The middle row and everything under it sits 72 units lower than centred midpoints would put
         it, which is why the two corridors are PINNED rather than halved.
PANEL    Measured, bottom-right in viewBox units:
           1920x900  102 / 163      1600x1000 291 / 143     1440x1080 335 /  94
           1280x900  378 / 152      1100x900  397 / 149
           1280x860  397 / 280      1100x800  397 / 280
         The last two rows are the ones that matter, 117 units deeper than anything the taller sample
         sees (`L-05`), and they are the viewports the occlusion rule takes. Worst case x<=397 and
         y<=280, and two things follow that are the whole shape of this card:
           1. The middle row is three 232 wide boxes on one line, so its LEFT box lands at 144..376
              whatever the spread. At y=210 that box is 100 percent behind the panel. The row
              therefore starts at 282, below the floor, and the frame and disks move down with it.
           2. The request from the top row has to REACH that left box, and any lane going there from
              above crosses the panel band. So the chain runs RIGHT TO LEFT: the controller, the one
              box the request addresses, sits at 940 where the lane reaches it in the clear, and the
              content and sidecar follow leftward. The request corridor can then stay at 157.
         The request box at y=36 sits inside the y band, so it starts at 420, clear of the widest
         measured panel by 23. A longer narration invalidates all of this.
LANES    Three zigzags, and NEITHER corridor is halfway between the block it leaves and the block it
         enters: the request drops 53 to REQ_CORRIDOR_Y and then 125 into the mid row, and the create
         pair drops 28 to CORRIDOR_Y and then 60 into the disk top. The answer lane is the create lane
         MIRRORED: same corridor, opposite arrowhead, leaving through the TOP of the disk rather than
         a side face. The two never appear in one step, which is what makes sharing the corridor safe.
         The corridors are pinned to what they must not touch, not to a midpoint:
           CORRIDOR_Y      18 above the frame edge, so the lane and the frame do
                           not read as one doubled dashed line. The true midpoint 394 is INSIDE the
                           frame, so the midpoint rule cannot be kept here.
           REQ_CORRIDOR_Y  157, 53 below the request box and 125 above the mid row. It runs RIGHT to
                           940, so the panel does not reach it at all. Running LEFT to 260 it cleared
                           every measured panel floor but the tag riding it would not, which is why
                           that hop still rides its label BELOW the ball (dy 22). The offset also
                           keeps the tag off the request box floor, which the ball leaves from.
         The two lanes touching the request box bottom face are a MIRRORED PAIR, 16 either side of
         its centre, because dead centre would stack them for the whole run. 16 reads as one column
         with two directions and, at 7 percent of a 232 wide face, still counts as centred on the
         Content top face at the other end.
         The ONE link carrying no ball is the dataSource reference across the top band, dashed and
         undirected because it is a reference and not a route. The binding between the request and
         its content is stated by the request sublabel and the Content chip instead of by a line: an
         undirected dashed line hanging under the request box, in the same column two directed lanes
         use on the steps either side, reads as a third route that never runs.
MOTION   Nothing pulses and nothing blinks: there is no Pod. The class step carries no packet and the
         canon would allow it the one sanctioned block blink, and it deliberately does not take it:
         that step states a FACT rather than moves something. DO NOT add it back.
         The create step is three chained hops (content wakes the sidecar, CreateSnapshot down into
         the backend, the copy taken once the target has materialised). Routes are length-based, so
         re-measure off `getAnimations()` after ANY geometry change.
         The snapshot data is where the answer departs from, so it is lit at entry. The controller is
         lit for the whole step because the last hop, the status mirrored onto the snapshot, is its
         work: the ball runs straight up the bound column rather than detouring through the block.
SIZES    The restore claim is a user-authored object exactly like the snapshot request, so it belongs
         in the same band rather than among the controllers. Sitting beside snap-1 also turns its
         dataSource into a 60 unit horizontal reference between two adjacent boxes.
         The disks sit DEAD CENTRE in the backend frame: one inset used both above and below, so the
         frame label band and the disk-caption band come out the same height, which is what makes the
         frame read as a container rather than a box with its contents pushed up.
         CHIP_W 232: worst case `snapshotHandle` + `snap-0c41` at 23 characters is 183 against 232.
DO NOT   Put the disk captions ABOVE the disks: they collide with the tag riding the CreateSnapshot
         hop, which lands on a disk top, and the two strings print into one unreadable smear. 24
         below the disk leaves 18 to the frame floor.
NOTE     An object a lane already points AT but which has not been created yet is drawn DIM, not
         hidden: hiding it leaves the arrowhead aimed at blank canvas for the whole flight. The three
         objects that live INSIDE a structure default to OPACITY.pending (the content in the middle
         row, the two disks in the frame). The restore claim is the exception and stays at 0, because
         the top band holds nothing else on that side, so its absence leaves no hole to explain.
```

### before `const CX = 600;`

```
The request, the snapshot object and the restore claim all sit on or beside this axis, and the
backend frame below is centred on it. The rhythm from the frame down is shared with
storage-pvc-clone, since the two cards sit in one row.
```

### before `const CHIP_W = 232, CHIP_GAP = 16;`

```
Family width. Worst case `snapshotHandle` + `snap-0c41` at 183 against 232.
```

### poster

```
One volume with one instant lifted off it. The SAME cylinder is drawn twice on the x=160 axis: whole
and live below, a thin frozen slice of it above, joined by a dashed riser on the axis. Both bodies
are the same width because it is one volume seen twice, not two volumes, and the slice carries the
brightest fill because it is the thing the card is about. Four elements and one line: no frame, no
API objects, no restored disk.

Deliberately VERTICAL, because storage-pvc-clone is the horizontal pair (two disks side by side with
a copy running between them) and the two sit in the same subcategory row. A clone is a second disk, a
snapshot is a moment of the same disk, and the two posters have to say that apart at 200 units wide.

Mirror-symmetric about x=160, bodies 132 wide with 94 of margin a side: sized to sit level with the
disks on the neighbouring posters rather than to fill the frame, because at 168 wide it outweighed
every card around it in the row.
```

## storage-volumeattachment

### layout

```
WHAT     WHO owns the attach. Not the Pod, not kubelet: the attach and detach controller inside
         kube-controller-manager writes a VolumeAttachment, the external-attacher watches it and
         calls ControllerPublishVolume, and on success stamps status.attached true back onto the same
         object. Kubelet is blocked on that one field the whole time, and DELETING the object is what
         triggers detach. So the composition puts the whole control-plane chain in ONE column and the
         node in the other: every arrow crossing between them is a read or a write of the object.
PANEL    Worst step, right / bottom by viewport:
           1920x1080 -> 203 / 146    1440x900 -> 319 / 183    1280x800 -> 358 / 213
           1100x800  -> 397 / 205     900x650 -> 398 / 344
         x<=398 and y<=344, a rectangle over the TOP-LEFT quadrant only. A longer narration than the
         ones below invalidates these numbers.
LAYOUT   The usable area is an L and this card uses the L: the top band (y 24..420) is held to
         x>=400, the free bottom-left corner (y>344) takes the disk, and the chip strip spans the full
         content band, so the widest tier is the canvas-centred one.
         WHY NOT read the L as a BOX, pinning the diagram to x>=400 AND keeping it centred: that
         forces BAND_W to 400 and leaves the two columns 176 wide, squeezed into the middle third of
         a 1200 unit canvas under a 980 unit chip strip. Using the L buys 340 units, which go into the
         blocks (176 -> 232) and the corridor between the columns (48 -> 208).
         Moving the disk out from under the columns is not only a space fix: the disk is REMOTE
         storage that has to be attached to a node, and drawing it directly beneath node-1 quietly
         says it is already local to it. Off in its own corner, with a long ControllerPublish call
         reaching across the whole card, the picture says what the narration says.
         node-1 is a real node() frame rather than left implicit, because `this disk is on THAT node`
         is the whole claim the VolumeAttachment makes.
         Read top to bottom, the control-plane column is the CAUSAL order: the controller decides, the
         object records, the attacher acts. Its bottom edge is pinned to the node frame's, so the two
         columns are one band, and the ROW GAP is SOLVED, not typed: three equal blocks spread across
         the frame's exact vertical span, so changing BOX_H re-solves the column rather than stranding
         a row.
SIZES    BOX_W / BOX_H are storage-csi-architecture's block size, a SIZE match only: the spacing
         between blocks is this card's own. It also clears the widest string in a right-column box,
         the sublabel `watches VolumeAttachment` at 144.7 units (10px mono, 6.03 per character), so
         BOX_W 232 leaves 43.6 either side against 15.6 at 176. DO NOT mix the per-class text rates
         when re-deriving that (`L-20`).
         LEFT_X is the panel wall: 398 measured, 400 taken, and it cannot move left.
         The Pod is 226x110, the catalog Pod size, and it is the one block that does not take BOX_H
         because it is a shell around an inner box. Kubelet takes BOX_H but its WIDTH follows the POD,
         not BOX_W: the two are stacked on one centre line, so at 232 against 226 their edges miss by
         3 a side, which reads as a rendering slip. Six units is invisible between columns and glaring
         within one, so the node column aligns to itself.
         DISK 200x114 rather than 152x96: it is the only object on its side and carries that side on
         its own. DISK_Y 400 clears the panel floor by 56 and its caption at 386 by 42. That caption
         goes ABOVE the disk, because below is where the ControllerPublish lane runs and under that is
         the chip strip.
         ONE width for all four chips, the strip spanning CONTENT_L..CONTENT_R. WHY NOT run it from
         the DISK's left edge (130) to the control column's right edge (1140), so both ends are real
         block edges: that span centres on 635, and the chip strip is the one tier free to sit on the
         CANVAS centre. The 70 units it gains on the left are exactly the empty bottom-left corner the
         other span leaves behind. Worst cases at 6.89 per character with the 24 unit inset:
           status.attached 103.4 + `no object` 62.0 = 189.4   <- the binding one
           VolumeAttachment 110.3 + `deleted` 48.2 = 182.5
           disk on Node-1 96.5 + `yes` 20.7 = 141.2           Kubelet 48.2 + `released` 55.1 = 127.3
         CHIP_W falls out at 258. The FLOOR is what matters: below ~190 the longest name and value
         touch.
LANES    Each direction of the VolumeAttachment conversation gets its OWN lane, so the status write
         never rides the arrow the watch came down. The wider column lets LANE grow 26 -> 40, which is
         what makes the two read as two lanes at a glance.
         The publish call runs the whole width of the card, which is the point: the attacher is
         talking to a backend nowhere near the node. Its horizontal leg hangs BELOW the disk, because
         above it there is no room (the disk cap is at 400, both columns end at 420, so a lane between
         them is drawn through the node frame). A ridingLabel sits 14 above its ball, so
         `ControllerUnpublish` rides at 532, 18 clear of the disk face and 60 clear of the chip strip,
         derived from DISK_BOTTOM so the lane follows the disk if the disk moves.
         W_GATE is the ONLY lane crossing the corridor: the object gating the node. It enters kubelet
         from the right while W_ONNODE enters from below, so the card has ZERO wire crossings.
         Only two static wire captions, both where there is measured room: the write caption anchored
         12 right of the W_WRITE lane with 138 units (20 characters at 6.89), which is why the tag
         riding that lane is offset (WIRE LABELS below), and the disk caption
         centred in the empty strip above it, longest string 241 units spanning 110..350. Everything
         else is carried by a ridingLabel, because the inter-row gaps in the control column cannot
         hold a static caption without it landing on a lane arrowhead.
MOTION   The VolumeAttachment is BORN MID-STORY but its SLOT is drawn the whole time, at
         OPACITY.pending with the sublabel `not created yet`: at full it would contradict the
         narration, at zero it leaves a block-sized hole in the middle of the control column. Its four
         LANES are the part that genuinely goes away, so the two are pinned separately. The MOUNT lane
         is the exception and belongs to the POD: when the Pod leaves, an arrowhead aimed at empty
         canvas reads as traffic to a block the reader has failed to spot.
         The disk stays on canvas after the detach because it still exists in the backend, it is just
         no longer on this node, so it DIMS rather than leaving: a STATE, not a placeholder, and the
         one dim left on this card. DO NOT sit the Pod at 0.5 for five of seven steps as a stand-in
         for `not started yet`: a block held at half strength next to full-strength neighbours reads
         as a rendering fault. The Pod is simply present, and it leaves on the step that says so.
         The FIRST step has NO pulse, deliberately. DO NOT blink the Pod on the grounds that it is the
         reason an attach is needed: this is the step the poster auto-plays into about a second after
         the card opens, so the blink lands on a frame the reader has only just started looking at and
         reads as a flicker. The step is also not ABOUT the Pod, it is about who owns the decision.
         The attach step is three chained hops and the middle one crosses the whole card: routeDur is
         length-based, so the 952 unit publish call runs 2116ms alone and the span is 4276. Duration
         4800 is not taste: below 4276 the auto-advance cuts the call off before it reaches the disk.
         The detach step is FIVE beats, span 5076 against a duration of 5400.
         The App box is never given a .highlight: the blink is the whole signal and must end with it.
         va-7f is lit from entry as the SOURCE of the watch but does not KEEP that light once it is
         gone: the class comes off when the fade to the terminated shade finishes, so the static path
         has nothing to mirror. `render/opacity.test.mjs` LIT reads inline style on the played path only, so it
         sees neither version, which is why the answer is written down. Same shape as removeAt
         (storage-reclaim-policy) and vanish (storage-pvc-retention-policy).
MOTION   ON `write` the name, the field and the state line are all bound to the create arrival at 1500
         (`P-03`, `P-04`): before it the chips read `none` / `no object` and the box reads `not created
         yet`. The SLOT still materialises first, at 0..500, because a lane may not be aimed at a block
         that is absent, so the object is on canvas as a placeholder for the 1000ms the write is in
         flight and its sublabel is what says so.
         ON `attach` the third hop turns the DEVICE chip over (`no` -> `yes` at 3716) and Kubelet is NOT
         lit. The step's own narration says Kubelet will not touch the device and its chip reads
         `blocked`, so lighting the box the ball lands on said the opposite of the sentence beside it: a
         lit block in this catalogue means acting now. Kubelet lights two steps later, on the gate that
         frees it, which is the contrast the card is built on.
MOTION   THE DELETED POD BLINKS BEFORE IT GOES (`M-08`). On detach the pulse stands alone at 0 and the
         Pod fade waits `BEAT.afterPulse`, its mount lane on the same beat because a lane goes with the
         block on the end of it (`STO.S-02`). The fade ends at 1300 against a span of 5076 and a
         duration of 5400, so nothing downstream moved: the delete still leaves at `BEAT.lead`.
WHY NOT  Re-aiming that hop at the NODE FRAME instead of at the Kubelet face, so the delivery lands on
         something the step does not deny: the frame's bottom edge is y=420 and Kubelet's bottom face is
         y=400, so the two arrowheads would sit 20 units apart and no reader could tell which was meant.
         The frame also carries no ref key, so nothing could cue the arrival. Landing it back on the
         disk was rejected too: that is where the ball came FROM.
DO NOT   Animate the create half of the delete step and drop the delete half. The clause this card
         exists to teach, that the CONTROLLER writes AND deletes the object, has to be animated on
         BOTH halves, or the step opens on the attacher's watch while W_WRITE sits drawn, aimed and at
         full opacity carrying nothing.
NAMING   External-attacher is the name of one binary, so it takes the capital on its first segment
         only (`T-11`). Bare identifiers keep their real casing: va-7f, web-0, vol-1, which
         `.scheme-node-label` uppercases to NODE-1 in CSS, and that form is catalog-wide (`T-12`).
WIRE LABELS
         THE WRITE TAG RIDES 46 UNITS LEFT OF ITS LANE, and the number comes off the caption beside it.
         `vol-1 on Node-1` is 90.4 units wide and anchored middle on the lane at x=1024, so at dx 0 it
         spans 978.8..1069.2 and runs over the static `create` caption at 1036..1077.3, y 134.8..149.4:
         about 200ms of glyph on glyph, from the moment the tag crosses y=121.9 (measured at 1600x1000
         with `__toRoot`). At dx -46 it spans 932.8..1023.2 and clears the caption by 12.8. The rect is
         the SAME at 1100x800: a tag is viewBox geometry and does not move with the viewport, so the
         finding was never viewport-specific. Only the `write` step needs the offset, because the
         caption is blank on `detach`, where the same lane carries `delete va-7f`.
NOTE     The first 14 units of that flight are inside the Attach/Detach controller box, and NO
         offset closes it: W_WRITE is 84 units long between two 76-tall boxes, so a constant dy that
         clears both ends would need the tag baseline at or below 100 at the start and at or above
         184 at the end, which is not one number (clear of both boxes means baseline >= 109.8 at the
         start and <= 180.9 at the end, and the ball travels exactly that span). Clearing the column
         outright takes dx -161, which reads as a tag that has come off its ball, and riding below
         the ball trades the source box for the DESTINATION box at the arrival, where the tag would
         sit 5.7 above the box label for 340ms while that label turns over. What closes it is not an
         offset: the tag is not DRAWN until it is out, which is what TAG_EMERGE is for.
NOT A DEFECT
         The `status` and `detach` steps say `when the backend confirms the attach` and `only when the
         backend has detached`, and this card draws no storage-backend block. Both are subordinate
         time clauses rather than the visible action of the step, so the reader is not being pointed
         at a missing box. Do not file these again.
```

### before `const M = 60;`

```
One margin both sides, so CONTENT_L / CONTENT_R and CX fall out of it. LEFT_X is a separate wall at
400 that only the TOP band obeys: the usable area is an L and the disk lives in its free bottom-left
corner.
```

### before `const DRIVER_TAG_DY = 22;`

```
The publish lane leaves the attacher floor at 420 and enters the disk at 514, so a tag riding the
family -14 is cut by both faces for 200ms and sits inside the attacher for 600ms more. Measured on
the four viewports, the clear band below the ball is 12..42, and 22 is taken rather than the minimum
because at 12 the ink starts 4 units from the ball centre and the ball prints on the line.
NOTE     The four tags on the right column (`vol-1 on Node-1`, `delete va-7f`, `va-7f deleted` and
         `attached: true`) could not be fixed by an offset at all, and are not fixed by one. Those
         lanes are 84 units between 76-tall boxes, so a 10 unit line riding any fixed distance off
         its ball is inside a block whenever the ball is within 23 of a face, which it is at both
         ends of every flight. Three of them start inside a block and are fixed by TIME: they fade
         in at delay + TAG_EMERGE, which is the 252ms their ball needs to clear the face it left,
         so 200ms of INSIDE and a 100ms edge cut each become nothing.
NOTE     `attached: true` on the status step is the one that ENDS inside, printing under the
         object's own `Node-1, attached: true` for 400ms and reading as a second sublabel. Timing
         cannot touch a tag that comes to rest, so it takes STATUS_TAG_DY as well and parks 14 below
         the object floor, in the same corridor the write tag parks in.
```

### poster

```
Three things in a row, and the MIDDLE one is the brightest at 0.08 while the controller and the disk
sit at 0.05 and 0.04. That inversion is the sentence: the API object is the subject, not the actor
that writes it or the hardware it describes.
The object box carries a header bar and two fields, which is the only place in the storage posters
where a block is drawn as a RECORD rather than as a component. Both legs are dashed, because
neither is traffic.
```


## storage-volumeclaimtemplates

### layout

```
WHAT     StatefulSet volumeClaimTemplates, angled at the PVC OBJECT: how it is named, minted, bound,
         retained and rebound.
LAYOUT   THREE HORIZONTAL ORDINAL ROWS, one per replica. The claim is the subject of the card, so it
         sits in the CENTRE of every row on the canvas spine, with its consumer Pod and its backing
         disk mirrored either side, and the three claims stack into one central column the StatefulSet
         mints straight DOWN. Every connector is a straight axis run, so no ball ever travels a bent
         corridor.
         Each Pod is a full window like the rest of the storage cards, its shell fill knocked back so
         the inner container reads as nested inside it.
WHY NOT  One column PER ORDINAL with the mints fanned in through bent side corridors: three claims then
         sit side by side and the mint routes enter each claim from the corner. Turning each ordinal on
         its side makes the claim the centred hub of its own row, the mint a single vertical spine, and
         the mount and bind pure horizontal runs. Identity (Pod, claim and disk are one object under
         one name data-web-N) is then read ACROSS a row rather than DOWN a column, carried by the
         shared name in the three block labels plus the row alignment.
PANEL    The panel covers only the top-left band, and this card has TWO panel depths because two of its
         narrations are much longer than the rest. Measured with `overlayProbe`: right 290.77 / bottom
         142.56 at 1600x1000, right 377.76 / bottom 171.42 at 1280x860, and at 1100x800 right 396.55
         with bottom 180.12 on the short steps but 204.97 on `rebind` and `scale`.
         ROW_CY IS SET AGAINST THE 204.97, not against the 142.56. At the old [245, 385, 525] the row-0
         Pod LABEL `web-0` spanned y 198.7..214.7 (`__toRoot`, x 286.6..323.4, well inside the panel's
         396.55 right edge), so its top 6.3 units sat under the panel on both long steps. At
         [261, 395, 529] the label ink starts at 214.7 and clears the 204.97 by 9.7. The source box
         spans x 430..770, clear of the x<=397 band at any depth.
         WHY NOT move the Pod column right instead: the claim is centred at 500..700, so a Pod whose
         label cleared x=397 would have to start at 415 and the mount lane feeding it would be 10 units
         long. There is no horizontal escape on this card, only a vertical one.
NOTE     The pitch is 134 rather than 140 because row 2 STAYS where it was: the clearance is bought at
         the top of the stack and nothing at the bottom gets tighter (the row-2 Pod still ends at 579
         against the chip strip at 600). All three trunk segments (117 / 78 / 78 units) stay under the
         314 unit flat-pace band, so every mint hop still floors at `HOP_MS` 700 and the geometry change
         is not a timing change (`A-11`, `M-20`). The 34 units left between rows still hold the row tag:
         TAG_DY puts its baseline 3 above the Pod top and it is 13 tall.
BUDGET   That 9.7 units of label clearance is 0.39 of a narration LINE at 1100x800, where one line
         measures 24.85 (180.12 short against 204.97 long). LENGTHENING `rebind` OR `scale` BY ONE LINE
         BURIES `web-0` AGAIN, and there is no further vertical room to buy: the next move would have to
         come out of the 21 units between the row-2 Pod and the chip strip.
LANES    The mint spine relays the deterministic name into each claim in turn (data-web-0, then -1,
         then -2) and appears once the template stamps. The two horizontal lanes per row point INWARD
         toward the consumer, and both are permanent dim structure.
         THE THREE FAMILIES ARE BUILT ONCE PER ROW, as `TRUNK` / `BIND` / `MOUNT`, and the `P.lane`
         and every `F.route` over them read the SAME array (`A-02`). DO NOT make them factories called
         once for the lane and again for the ball, which returns two equal copies of one set of
         numbers: 14 routes across mint, bind, mount and rebind, every one of them a copy that would
         survive any check until the day somebody moved a row. Sharing the array is a pure identity
         change, the 18 lane arrays being equal in value either way, so no span moves (`A-11`).
MOTION   The three replica Pods are declared from the start, so they sit at FULL opacity the whole way
         through and never dim between steps, and mounting is shown by the pulse plus the container
         lighting. DO NOT fade a Pod up from a dim resting state on each mount: that up-and-down
         flicker on every step reads as noise. The ONLY Pods that fade are the ones genuinely removed,
         so a fade here always means a Pod left: web-1 blinks out and back on the rebind step, web-2
         fades to a ghost on scale-down.
         The rebind is deliberately slower than the FADE tokens, with a real HOLD at the ghost
         (OUT 850, HOLD 550, IN 800), so the delete and the recreate read as two distinct beats rather
         than one quick blink. The claim and its disk stay at full opacity throughout: not being
         deleted is the whole point of the step.
         A claim that has not been minted yet is drawn dim rather than hidden. Removing it leaves a
         claim-sized hole in the row that reads as a rendering fault, and it leaves the mount arrowhead
         aimed at nothing for the whole flight.
         A GHOST GOES THROUGH `stage()`, never over it (`A-13`, `A-16`). `scale` spread the factory and
         then overrode `p2` after it, so `mount2` kept the value the factory had already computed from a
         live Pod: measured at t=1500 the row-3 Pod group stood at 0.12 with its mount lane at 1.0, a
         full-strength arrow into a ghost. Passing the shade in as `pods: [1, 1, GONE]` lets `laneOf`
         take the MIN, and the lane now fades with the Pod (0.65 / 0.65 mid-fade, 0.12 / 0.12 settled).
         The same held on `rebind`, where nothing overrode anything: the flow faded `p1` alone, so for
         the whole 550ms ghost hold the mount lane stood at 1 over a Pod at 0.12. It now leaves with the
         Pod and returns exactly as the recreate finishes at REBORN + IN, which is when the rebind ball
         starts riding it.
MOTION   THE MINT COUNTER steps 1, 2, 3 on the three arrivals (1500, 2300, 3100), and each claim takes
         its `Pending` line on its OWN arrival rather than all three at entry (`P-03`, `P-04`). Read at
         1900 on the animated path: `1 minted`, claim 0 at full and `Pending`, claims 1 and 2 still
         placeholders reading `not created yet`. The static field still carries the end state, so the
         reduced path and a mid-step cancel land on `3 minted` and three Pending claims.
BUDGET   Family CHIP_W 232: worst case is `on delete` + `retained` at 17 characters, so
         17 * 6.89 + 24 of padding is 141 against the 232 available.
         The intermediate counter values are shorter than the final one, so the strip is unaffected:
         `1 minted` measures under `3 (1 idle)`, which is this chip's own worst case.
MOTION   THE REMOVED POD BLINKS BEFORE IT GOES on `scale` (`M-08`): `p2` pulses at 0 and it and its
         mount lane fade from `BEAT.afterPulse`, so the blink is spent before the fade starts. A fade
         at `BEAT.afterHop` with no pulse anywhere in the step is invisible to
         `render/opacity.test.mjs` ORDER. Span 1500 against a duration of 3000.
OPEN     THE `rebind` DELETE IS THE ONE POD FADE HERE WITH NO PULSE IN FRONT OF IT, and it stays that
         way on a number. `p1` fades from delay 0 and the only pulse on it answers the RETURN (the
         remount, at 3700), which `render/opacity.test.mjs` ORDER correctly discounts and then skips
         the fade entirely. Putting a blink in front of it costs `BEAT.afterPulse` on every beat of the
         step: the fade, the 550 hold, the recreate, the rebind hops and the closing pulse all move
         800 later, so the measured span goes 4600 to 5400 against a duration of 4900 and the duration
         has to rise with it. That is a pacing change to the longest step here in exchange for a cue
         the shape already carries, since a Pod dissolving over 850ms with a 550ms hold at the ghost is
         two readable beats on its own.
```

### before `const CX = 600;`

```
The claim is the subject, so it sits in the CENTRE of every ordinal row on this spine, with its Pod
and its disk mirrored about it at CX -/+ FLANK. The mint spine drops straight down the same line.
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

