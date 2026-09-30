# CLAUDE.md `js/schemes/storage/` (Volume flow)

## What this file is

The contract for the Storage category and nothing wider. Three documents sit above it and are not
repeated here:

| Document | Holds |
|---|---|
| `scheme/CANON.md` | the rulebook: layout, arrows, motion, colour, text, chips, metadata, posters, module structure. Load it before designing, reviewing or repairing a card |
| `scheme/CLAUDE.md` | the sub-app contract: folder shape, module contract, catalog wiring, the test suite and its checklists |
| `./CARDS.md` | the preamble and the grid-order index of the per-card design records in `./CARDS/` |

**If a rule stated here would also be true of another category, it belongs in the canon, not here.**

The section order is the one all four folder contracts share, so a reader who knows one knows the
others: what this file is, the folder, the catalog, the tint, the kit surface, the geometry, the
escape hooks, the reduced path, the records, the exemplar, then whatever `STO.*` rules no section
above holds. The closing section on where these rules bend is this category's own and has no
counterpart in the other three.

The rows below carry `STO.*` ids and are indexed from `scheme/CANON.md`. **The TEXT of a `STO.*`
rule lives here and only here**: the canon carries the id and a subject label, never a second copy
of the rule. Where an id could name two different rules, the FOLDER keeps it: `STO.S-02` and
`STO.S-03` mean what the rows below say. No `STO.*` id has been retired, and none may be: a rule
whose subject moved is reworded onto what still holds its job, which is what happened to
`STO.L-01` and `STO.S-04` below.

Every count in this file is measured off the tree. `report/skeleton-census.test.mjs` prints the hook
and step censuses, `unit/docs-census.test.mjs` asserts the numbers stated below against the same
census, and `unit/docs.test.mjs` asserts the record structure. Do not edit a number here to make a
sentence read better: re-measure, or the assertion goes red. The census guards the catalog line, the
subcategory table, the import line, the declarative split, the four hook rows and the lit-step
count. Every other number here is a hand measurement, and the section that states it says what it
was measured over, so the next pass can repeat it rather than trust it.

## The folder

| File | Owns |
|---|---|
| `cards.js` | the 39 `SCHEMES` entries and the `SUBCATEGORIES` list for this category |
| `posters.js` | the 39 grid thumbnails, keyed by card id, each under the comment that says what its composition is (`R-12`), 39 of 39 |
| `storage-kit.js` | the tint, the two pulse wrappers, `setCylinderLabel`, the `STO` chip grammar and `chipStrip`, plus the `P` / `F` / `defineCard` bindings. Everything else is re-exported from `lib/scheme-kit.js` and `lib/layout.js` |
| `storage-*.js` | one module per card, 39 of them |
| `CARDS.md` | the record preamble and its index, and no `## ` heading of its own |
| `CARDS/<id>.md` | the design record for ONE card, a single `### layout` block of labelled notes and no other heading, which `S-51` states and `test:docs/G1` holds. All four categories are in the split shape, and `recordFiles` in `test/fixtures/catalog.mjs` reads that shape off the tree rather than off a list of category names, so no category is a special case |

Nothing else may live here (`S-20`). A card reaches `./storage-kit.js` and no further (`S-21`): all
39 import the kit, 7 also import `lib/svg.js` and 1 `lib/primitives.js`. Those are element
constructors no part kind builds, on the cards that draw raw SVG. From `lib/svg.js`: `rect` on
`csi-architecture`, `volume-attach-limits` and `pvc-retention-policy`, `rect` and `line` on `ephemeral-storage-eviction`,
`g` and `rect` on `volume-expansion` and `csi-capacity-tracking`, and `g`, `rect` and `path` on
`projected-volume`. From
`lib/primitives.js`: `podShell` on `fsgroup-ownership`, the one Pod here with two peer inner boxes.

## The catalog

39 cards, 256 declared steps, four subcategories. At 6.56 steps per card it sits just below cluster's
6.57 (256 over 39 against 184 over 28) and above workloads' 6.5 and network's 6.0,
because a storage subject is a HANDOFF between objects that each have to be drawn before the handoff
can be narrated: a claim, a volume, a driver and a Node all appear before anything is mounted.

### Subcategories (`STO.D-01`)

| key | label | cards | what belongs here |
|---|---|---|---|
| `volume-foundations` | Volume Foundations | 12 | what a volume IS before any claim exists: the Pod volume model, where each kind of volume data lives, the container filesystem, the volume types that need no PersistentVolume (emptyDir, hostPath, ConfigMap and Secret files, projected and image volumes) and the mount behaviours every volume shares (subPath, recursive read-only, the ephemeral-storage limit). A subject is admitted only if it can be told with no PersistentVolumeClaim in the story |
| `volumes-claims` | Volumes & Claims | 12 | the PV/PVC object dance: binding, provisioning and where it lands (binding mode, capacity), access and volume modes, expansion, protection, reclaim, phases. A subject is admitted when an API OBJECT and the controller reconciling it are the subject |
| `csi-mount-path` | CSI & Mount Path | 10 | the driver and the path from API object to a mounted directory on a Node: the driver architecture, attach, VolumeAttachment, staging and bind mounts and the mount propagation that carries them to the host, the inline CSI ephemeral volume that skips the claim and the attach, ownership, attach limits, Multi-Attach and detach on Node loss. A subject is admitted when it happens through a CSI call or on the Node |
| `stateful-data` | Stateful Data | 5 | storage whose lifetime follows a workload or is copied from another volume: StatefulSet claim templates and their retention, generic ephemeral volumes, snapshots, clones |

The line between `volume-foundations` and `volumes-claims` is whether a claim exists: a volume type
that works with no PVC is a foundation, and `storage-generic-ephemeral-volume` is NOT one, because
its whole subject is the PVC it mints. The line between `volume-foundations` and `csi-mount-path`
is whether the story needs a CSI driver: a volume Kubelet fills on its own is a foundation, and
`storage-csi-ephemeral-volume` is NOT one, because its whole subject is the NodePublishVolume call
it goes straight to. The line between `volumes-claims` and `csi-mount-path` is whether the card's
subject is an API object or a Node-side action, and an object whose whole job is to gate or cap
the Node side (VolumeAttachment, CSINode) counts as the Node side. The line between `volumes-claims`
and `stateful-data` is whose lifetime the volume answers to: a claim on its own, or a workload or
another volume.

The order of `SUBCATEGORIES`, and of the cards inside each, is an editorial argument about what a
reader meets first (`D-10`). It is never alphabetical, and `CARDS.md` indexes the records in that
same order.

## Tint

```js
STORAGE_TINT = { bright: 'rgb(174, 224, 199)' }   // jade
```

Only the pulse peak is named: the blink ramps from and back to the rect's own stroke (`M-05`).

| ID | Rule |
|---|---|
| `STO.C-01` | Jade is hue 150 at 50 percent saturation, and that ceiling is the point: a green above roughly 50 percent goes acid on this canvas. If a new shade is needed, move LIGHTNESS, not saturation (`C-23`) |

## Kit surface

`storage-kit.js` re-exports the shared list (`S-22`) plus the set every kit adds (`P`, `F`,
`defineCard`, `POD_VIOLET`, the six `lib/layout.js` formulas), and adds `STORAGE_TINT` with its two
pulses. Three names are storage-only:

```js
setCylinderLabel(cylEl, txt)    // the label inside a cylinder(), the way setBoxLabel is for a box
STO                             // the category's chip grammar: CX, CHIP_H, CHIP_GAP, CHIP_W, CHIP_COUNT
chipStrip({ cx, w, gap, count })  // fix w AND gap, derive the span, centre it -> { w, gap, x(i) }
```

`STO` holds the centre and the chip scalars, and nothing else. Measured over the 39 modules: 21
cards name a canvas centre constant and all 21 put it at 600, 33 carry a chip strip (every card but
`storage-csi-ephemeral-volume`, `storage-volume-model`, `storage-default-storageclass` and `storage-pvc-retention-policy`, which carry no chip, and
`storage-csidriver` and `storage-pvc-clone`, whose chips are the fields of their two objects in two columns, six on the first and ten on the second) and 27 of those strips centre on 600. The six that do not are
deliberate: `storage-volume-data-homes` stands its four chips as a ledger column at the left,
`storage-volume-detach-on-node-loss` gives the ladder one side of the floor and the chips the other,
`storage-recursive-readonly` stacks its spec and status chips beside the Pod whose fields they are,
`storage-volume-mode` runs its row along the top of the Node frame it reports on,
`storage-pv-lifecycle-phases` stacks the fields of its PV as a column bottom left, and
`storage-pv-reservation` stands its six chips as two columns under the two objects they belong to.
There is **no `LAYOUT.A/B/C`**, and that is a measurement rather than an omission: cluster and
workloads carry presets because which column holds the ladder genuinely varies, while only 4
storage cards declare a column width at all, at 516 / 176 / 232 / 260 (`csi-attach-mount`,
`reclaim-policy`, `subpath`, and `pv-lifecycle-phases` for its chip column). The 6 cards pinned right of the panel each write their own
`LEFT_X = 400`: a constant the kit exported and no card read would be litter.

`chipStrip` exists because `lib/layout.js` cannot say what 15 cards here call it for: `strip()`
fixes the gap and derives the width, `spread()` fixes the width and derives the gap, and both span
an exact `from..to` instead of centring. **Match the derivation DIRECTION, not just the
coordinates**: a card that fixes the SPAN and derives `CHIP_W` from it (`csi-architecture`,
`csi-attach-mount`, `volumeattachment`) keeps its own formula even where the x values agree. Six
cards also read `STO.CHIP_H` by name.

There is no storage-only behaviour helper. The kit binds a default riding label, and a card that
needs other timings builds its own with `makeRidingLabel` and hands it to `F.tag` as `fn`, which 34
cards here do. A factory called outside the kit binding does not inherit the role, so each of those
calls writes `role: 'storage'` by hand: 43 of the 44 role literals in the card modules are that,
and the 44th is the `podShell` of `storage-fsgroup-ownership`, a primitive reached past the binding
by a `P.raw`.

## Geometry

### The layout grammar: the vertical stack (`STO.L-01`)

Where a card draws a volume's OWNERSHIP chain, the Pod, the claim and the volume that backs it, it
stacks the chain vertically on one centre line rather than running it left to right the way the
other categories run a pipeline:

- a Pod on top, its containers inside it
- the backing volume below, drawn as a `cylinder()` disk
- where a line only says "this belongs to that", a dim, arrowhead-less **identity spine** on the centre line. Nothing travels it, so it carries no ball and no arrowhead (`STO.A-01`)
- where data really moves, a **mount lane** written in its one traffic direction so the arrowhead lands at the receiving end, entering the block it reaches at a face midpoint. One-way traffic gets one lane, a round trip gets a lane each way (`STO.A-02`)

Read off every module and its record's `LAYOUT`, the stack is the grammar of the claim cards and not
of the category. **10 cards draw it**: `pvc-binding`, `dynamic-provisioning`,
`generic-ephemeral-volume`, `pvc-protection`, `volume-expansion`, `reclaim-policy` (two columns of
it), `fsgroup-ownership`, `volume-attach-limits`, `multi-attach-error`, and
`volume-detach-on-node-loss`, two stacks side by side with one disk moving between them. The identity spine in its bare form survives on two of them: the Bound
link from claim to volume on `dynamic-provisioning` and the three on `reclaim-policy`, each a
`P.relation` dashed 5 5, with no marker and no ball. Most stack cards run a ball-carrying mount lane up the
centre line instead, which `pvc-protection` and `volume-expansion` call the mount ascent: that is
the second bullet on the spine, not a departure from the first.

**The other 29 leave the stack deliberately, and each names its own composition in its record.**
The whole of `volume-foundations` leaves it, because nothing there is a claim: `volume-model` is
nested containment over a time axis (one disk under three containers inside the Pod shell, a spec
ladder beside it and a lifetime row per object under it, since the subject is ownership), `volume-data-homes` a depth map (Pod, homes on the Node, homes off it),
`container-filesystem` a layer-precedence grid, `emptydir` a multi-Node band with a chip row,
`hostpath` two Nodes of unequal width over a row of Node path cells, `configmap-secret-mount` a directory
listing, `projected-volume` a listing over a time axis, `image-volume` two frames with one object
moving between them, `subpath` two readers of one volume, `ephemeral-storage-eviction` a to-scale gauge, and
`recursive-readonly` two zones compared, the container view over the host tree, and
`downward-api-volume` two listings level with each other across one writer, the Pod object and
the labels file it becomes, line for line. Outside it,
`csi-ephemeral-volume` is a bypass under a ghost row of the objects it skips, `mount-path-chain`
three mount tables side by side, one per mount namespace, with entries repeated across them,
`volumeclaimtemplates` draws three ordinal ROWS with the claim on the spine, `pvc-retention-policy`
a 2x2 policy matrix, one row per field and one column per position, `pv-lifecycle-phases` a state row, `volume-mode` two rows through one Node frame, one of
them through two stations and the other through none, and `access-modes`, `topology-aware-provisioning`,
`csi-capacity-tracking`, `csi-architecture`, `csi-attach-mount` and `volumeattachment` each an
arrangement of tiers, frames or mirrored zones their `LAYOUT` argues, `pvc-clone` two spec listings
level with each other across a column of gates, the fit test the provisioner runs row by row
between the source claim and the clone, `volume-snapshot` an
instrument panel, the volume as rows of block cells in one pool frame (live, snapshot, restore),
and `default-storageclass` an object board: four claims in creation order between the writer that
acts at creation above them and the one that acts afterwards below, since nothing there is owned by a Pod,
and `pv-reservation` an object board in two bands: the writers above, and below them the PV and the
claim it is reserved for facing each other across the lock of claimRef and volumeName, and
`csidriver` two zones compared, one driver per half, mirrored about a spine of the two consumers
that read both CSIDriver objects.

A new card that has a claim chain in it starts from the stack. A new card that does not starts from
its sentence, and `.claude/skills/card-new/reference/compositions.md` is the library of families.

### The one block size this category shares: 232 by 80

**An actor block here is 232 by 80, a Pod 232 by 104 around a 192 by 44 app box 26 under the Pod
label, unless a measurement says otherwise.** That is the catalog's de-facto object size, stated as
a rule in the networking folder and cited from there by 33 of the 39 records here in their `SIZES`
line. This category has no grammar object for it (`STO.CHIP_W` is the CHIP default and says nothing
about blocks), so each card types the number, and this section is what holds it to one value.

Measured over the 39 modules, off the parts rather than off grep: 100 `P.box` parts are 232 by 80,
on 32 cards, and 27 `P.pod` parts are 232 by 104, all 27 around a 192 by 44 inner box, on 21 of the
30 cards that build a Pod with `P.pod`. Every record carries a `SIZES` block, 39 of 39, and the
departures below are each argued there with the measurement that forced them. **21 cards hold the
size on every actor**: `configmap-secret-mount`, `projected-volume`, `image-volume`,
`ephemeral-storage-eviction`, `hostpath`, `pvc-binding`, `topology-aware-provisioning`, `csi-capacity-tracking`,
`volume-expansion`, `pvc-protection`, `csi-attach-mount`, `volumeattachment`,
`volume-attach-limits`, `generic-ephemeral-volume`, `pvc-clone`, `recursive-readonly`,
`pv-lifecycle-phases`, `default-storageclass`, `pv-reservation`, `downward-api-volume` and
`volume-snapshot`.

The other 18 depart, and only the three reasons the rule allows ever move one:

- **A string that does not fit.** `volumeclaimtemplates` source box 280 (239.3). It widens the one
  box and keeps every other actor at 232.
- **The panel wall.** A pair of 232 columns from `LEFT_X` 400 centres on 652, off the 600 every
  other tier holds, so the columns narrow instead: `dynamic-provisioning` 220, `access-modes` Pods
  128, `multi-attach-error` Pods 148,
  `volume-detach-on-node-loss` Pods 168 and `reclaim-policy` columns 176. Every one of those Pods keeps the 104 height.
  `csidriver` narrows its two CSIDriver objects and their field chips to 172, the pair starting
  at the wall and centring on 600, and its one Pod is 952 by 104, spanning both of its halves.
- **A row, a column or a frame the block is SIZED BY.** `volume-mode` stations 160 by 80, two of
  them and the Pod sharing the 860 units of a Node frame that starts under the panel. `volume-model` containers 200 by 80, three peers
  in a 736 wide Pod shell right of the panel, where a 232 row plus two lane gaps runs past it. `volume-data-homes` homes 120
  wide, each centred on a lane of a mirrored six lane grid, and a 720 by 120 Pod every one of
  its six lanes leaves. `container-filesystem` grid cells 126 wide so four columns fit beside a row
  header sized by its widest string, 208. `csi-architecture` sidecars 134 to 204, solved to one
  span inside the controller frame. `csi-ephemeral-volume` ghost row 158, solved as 4w + 3g = 740. `mount-path-chain` Pods 220 by
  408, each sized by the four mount rows it holds, three tables in a 740 frame. `emptydir` Pods
  480 by 104, two 192 by 44 containers side by side. `fsgroup-ownership` Pod 232 by 130, two peer
  inner boxes stacked. `subpath` a 1000 by 188 Pod along the bottom holding two 232
  by 80 containers. `pvc-retention-policy` claims 116 by 44, three to a matrix
  cell, where two cells, the owner column and two gaps span 60..1140.

**What is not an actor keeps its own size**, and a pass that narrows it to 232 by 80 is a defect:
the listing rows of `configmap-secret-mount` and `projected-volume` (232 by 56, entries of one
directory), the phase cells of `pv-lifecycle-phases` (150 by 72, sized by pitch), the bands a row
or a node sizes (`access-modes`, `reclaim-policy`, the staging band of
`csi-attach-mount`), the mount-table rows of `mount-path-chain` (180 by 64), the mount-path boxes
of `subpath`, the attachment
counters of `volume-attach-limits`, the volume tree of `fsgroup-ownership`, the three
system path cells of `hostpath` (112 by 80, what is left of Node-1 beside its check corridor), and
every cylinder.

All three reasons are settled BEFORE the build closes, because the lanes, the tags and the chip
strip follow the width, so meeting one late is a relayout rather than a nudge. A number nobody can
re-derive is re-narrowed to 232 by the next pass in the name of consistency, which is why the
measurement goes in the record.

### Cylinders, chips and the panel

| ID | Rule |
|---|---|
| `STO.L-02` | A cylinder's label is re-centred on the visible front face (below the cap ellipse) by setting `labelY` on `P.cylinder`, because `cylinder()` centres on the raw bbox and the cap ellipse is not part of the face you see, so the default sits visibly high inside the body. **Derive the offset from the cylinder height rather than typing the resulting literal.** Measured over the 50 cylinders on 25 cards: **`h/2 + 10` is the family formula, on 33 of the 35 that re-centre**; `container-filesystem` uses `h/2 + 12` and `volume-detach-on-node-loss` `h/2 + 9`, and **15 cylinders do not re-centre at all**, because their card sets a spec line 14 under the name `cylinder()` prints on its own baseline instead. Copy your own card's offset; there is no single literal |
| `STO.L-03` | **`CHIP_W 232` is the family default**, with `CHIP_GAP 16`. Size a chip against the worst name+value pair on the card, and shorten the VALUE rather than widening (`P-07`) |
| `STO.L-04` | Several cards carry a measured table pinning their own panel floor, and some of those tables include a `900x650` row that is narrower than any of the three standard viewports `report/geometry-soft.test.mjs` samples. Where the two disagree the card takes the stricter number and says so (`L-06`) |

The chip strips, measured over the 33 cards carrying one: `CHIP_H` 34 on 29 (32 on
`csi-attach-mount`, `fsgroup-ownership`, `volume-attach-limits` and `volume-detach-on-node-loss`),
a 16 gap on 23, one uniform width of 232 on 15, and four chips on 22. `STO.L-03` is the default a
new card starts from, and a width off it is a measured string written into that card's `SIZES`.
12 records carry the `900x650` row `STO.L-04` is about.

Storage's deepest panel is 329.20 units (`storage-volume-detach-on-node-loss`, at 1100x800), not
the catalog maximum: that is 378.90 on
`workloads-pod-qos-classes` (`L-04`). The panel's right edge is `x<=397` on every card.

**Text is measured, never estimated** (`L-20`). A width a record states is the ink after
`document.fonts.ready` at 1100x800. Several older `SIZES` blocks size a chip off a rate, 6.89 units
per character of the 11px mono chip text plus 24 of inset, which is fine for a floor with room to
spare and wrong for a tight one: `storage-volume-detach-on-node-loss` records a rung of wide glyphs
rendering 338 units where 6.0 per character predicts 307. Where the margin is under about 20 units,
measure in the browser.

**15 of the 39 cards draw a Node frame around a Pod**, and no two share a frame shape. That is not
a family and nothing here states one: where a Node frame appears it is sized by what it holds.

## The escape hooks this category needs

All 39 cards are in the declarative form. **28 are fully declarative**; 11 carry a hook, and the DSL
did not have to grow. `reset.extra` and `step.motion` are used by NOBODY here.

The counts are SITES the layer receives, not literals in the source, and a card that builds its hooks
in a factory hands over more than it writes: `fsgroup-ownership`'s `row(i)` reads as one `tune` and
hands the layer three. Read the counts off the imported specs, the way
`report/skeleton-census.test.mjs` totals them, never off grep.

| Hook | Cards | What it wraps, and why no field says it |
|---|---|---|
| `part.tune` | 3 cards, 9 sites | Two jobs. An SVG **attribute** on a nested element the part kind does not hand back: the `.scheme-node-label` `y` on the two frames of `multi-attach-error` and the three of `volume-attach-limits` (`node()` has no `labelY` knob the way `cylinder()` does), and the label and sublabel `y` of the volume tree on `fsgroup-ownership`. And an ARRAY ref that later steps READ: the three listing rows of `fsgroup-ownership` collect into `refs.rows` and `refs.rowOwners`, which its seven `enter` hooks and three `F.run` sites address by index, and the same `tune` on `volume-attach-limits` appends eight bare slot rects to each frame and files them as `refs.nodes[i].slots`, which its eight `enter` hooks and two `F.run` sites read. **An ARRAY ref belongs in a `tune` only when later steps READ it**, which makes those two cards the whole population: every other element carries its own `key:`, so an array over them would be read by nothing |
| `P.raw` | 7 cards, 21 sites | What no part kind emits. `ephemeral-storage-eviction` x10, the to-scale gauge: its frame, two tracks, five segments whose inline width IS the value, the limit line and the request tick. `csi-architecture` x2, a dashed frame border whose stroke is inline style. `volume-expansion` x1, the capacity gauge as one group of cells, filed by hand so `opacity` and `F.reveal` reach them by name. `projected-volume` x1, a bar with no right edge, a token that never expires. `fsgroup-ownership` x1, a bare `podShell`, because its Pod holds two peer inner boxes and a `P.pod` with no inner would wrap the shell in a second group. `csi-capacity-tracking` x2, one gauge row per CSIStorageCapacity object, a track and a fill under one key so `opacity` reveals and dims the object whole. `pvc-retention-policy` x4, the dashed frame of each policy-matrix cell, its stroke inline as on `csi-architecture` |
| `step.enter` | 4 cards, 29 sites | What no field reaches, written on every step so prev, reset and reduced motion land on the same picture. `emptydir` x7, `setCylinderLabel`, which writes `.scheme-cylinder-label` where `labels:` writes `.scheme-box-label`. `ephemeral-storage-eviction` x7, the inline width of the five gauge segments and the fill of the request caption. `fsgroup-ownership` x7, per-row `textContent` and `.highlight` through the array refs. `volume-attach-limits` x8, a per-step `style.fill` on the 24 slot rects |
| `F.run` at delay 0 | 4 cards, 7 sites | **An escape, but not a timer**: `at()` in `lib/scheme-kit.js` short-circuits on `delay <= 0`, runs the callback inline and registers nothing, so it is an imperative beat standing inside the flow order rather than a deferred one. All seven are that form, seven of the nine delay-0 `F.run` in the catalogue. `fsgroup-ownership` x3, the scan whose timers hang on each listing row. `volume-attach-limits` x2, twenty slot fades and a detach lag whose completion rewrites a counter. `volumeclaimtemplates` x1, a recreate fade whose completion renames the Pod sublabel. `multi-attach-error` x1, a deferred UNLIGHT on the deleted VolumeAttachment. A card-owned `onfinish` has no other door: `F.fade` carries only `unlight` |

**A `tune` or a `raw` factory assigns a LITERAL ref key** (`refs.rows = ...`, `refs.nodes = ...`),
never a computed one, because `unit/spec-steps.test.mjs` reads escape bodies for `refs.x =` and a
computed key is invisible to it. All three `tune` cards here are on that form.

**A `P.wire` is unreachable by every opacity field.** Wires land in `refs.wires[key]` and `opacity:`,
`rewind.opacity`, `F.fade` and `F.reveal` all resolve `refs[key]`. Adding a scalar key to make one
reachable renames it in the `settled-dump.mjs` probe, which claims scalar keys before `wires.*` and
is first-wins. `render/reduced.test.mjs` cannot see that rename at all: it keys by DOM SHAPE (tag,
classes minus `highlight`, `data-role`, `data-idx`) and never reads a ref name. A wire that animates
needs `F.run` at delay 0.

**`chipsCued`, not `chips`, is this category's default**, and storage carries 200 of the
catalogue's 204 `chipsCued` steps (the other 4 are on `workloads-poststart-prestop-hooks`). Measured
per card: `storage-configmap-secret-mount`, `storage-projected-volume`,
`storage-ephemeral-storage-eviction`, `storage-recursive-readonly` and
`storage-downward-api-volume` are pure `setVal` (so pure
`chips`). `storage-container-filesystem`, `storage-emptydir` and
`storage-hostpath` mix both: a value earned by a landing ball is written through `chips` and turned
over by an arrival `F.set`. `storage-csi-ephemeral-volume`, `storage-volume-model`, `storage-default-storageclass` and `storage-pvc-retention-policy` carry no chip at all, and the other 27
are pure `chipsCued`. Swapping a card's writer is a visible change (`P-09`), so a new card takes the
writer its nearest sibling uses.

## The reduced path

**`reducedLit` is declared on ZERO steps here**, against 142 in network, 34 in workloads and 2 in
cluster, and that is a measurement rather than an omission: of the 256 steps, **214 light something**
through `lit:` or a `lights` list, so `flowLights` derives the whole static path. Of the 42 that
light nothing, 38 carry no `flow` at all (the idle steps), 2 pulse a Pod and name no receiver in a
`lights` list (the `gc` step of `storage-generic-ephemeral-volume` and the `reschedule` step of
`storage-multi-attach-error`), and 2 only fade something out. `render/reduced.test.mjs` holds the
static frame of every one of them equal to where the animated path settles, so none needs a
`reducedLit`: whatever they light on the way, through an arrival `F.set`, is taken off again before
the step ends.

That makes storage the one category with no reduced-path population at all, and the reason is the
`lights` habit rather than a gap: a storage step almost always names its receiver, so `flowLights`
has something to derive from. It does NOT mean the Pod is what gets lit. Counted off the imported
specs, 95 storage steps pulse a Pod over 103 pulse sites, and on 92 of those steps nothing on the
static path names the pulsed Pod or its inner box: the receiver that lights is the claim, the disk
or the chip, and the Pod's pulse shows nothing under `ctx.reduced`, which is the house reading. No
card here is dark on every step. A card that DID pulse and light nothing on a step whose static
frame needs to show it would need a `reducedLit`, and `render/reduced.test.mjs` is what would say
so.

## The records

| ID | Rule |
|---|---|
| `STO.S-05` | **The records here are one file per card, `./CARDS/<card-id>.md`, each a single `### layout` block**, indexed in grid order by `./CARDS.md`. That is what `S-51`, `S-52` and `S-53` state and what `test:docs/G1`, `G2` and `G3` enforce, with no ceiling: storage stands at zero on all three, as the other three categories do. A poster note is a comment above that card's entry in `./posters.js` (`R-12`), never a block in the record. What a storage record owes beyond the catalog-wide form is its `SIZES` line: which blocks are the catalog size and, for each one that is not, the measurement that moved it |

**The pointer a card carries follows the shape.** A storage module names its record with
`// Design notes for this card: ./CARDS/<card-id>.md`, and `recordPointer` in
`test/fixtures/catalog.mjs` derives the expected string off the tree (`S-36`).

The block labels a record may use are ONE list for all four categories, in `scheme/CANON.md` under
"The record vocabulary", each used at most once and in that order. That is `S-52`, and
`test:docs/G2` reads the vocabulary off the canon and holds all 39 records here to it, so a label
outside the list, a duplicate or a run out of order fails the gate rather than a review. A NEW
storage card takes a new file in `./CARDS/` on that form and a row in the `./CARDS.md` index.

Every record here carries `WHAT`, `PANEL` and `SIZES`, 39 of 39. **A `PANEL` block states the
READING, not the extent**: the right edge is `x<=397` catalog-wide (`L-02`), and the bottom moves
non-monotonically per card and per viewport (`L-04`, `L-06`), so the block names the command that
prints it, `OVERLAY_IDS=<card-id> node --test report/overlay.test.mjs` from `scheme/test/`, and keeps
only which step is deepest, what stands under the panel and how much clearance is left. Fifteen
records are on that form today (`csidriver`, `csi-architecture`, `csi-attach-mount`, `pvc-binding`,
`pv-lifecycle-phases`, `mount-path-chain`, `multi-attach-error`, `volume-detach-on-node-loss`,
`default-storageclass`, `pv-reservation`, `fsgroup-ownership`, `volume-attach-limits`,
`downward-api-volume`, `pvc-retention-policy`, `generic-ephemeral-volume`). The other
24 still store per-viewport
readings, which go stale on the next prose edit with nothing red, so a reading copied out of one of
them is re-measured before it is trusted, and a record touched for any other reason is moved onto
the command form in the same pass. Nothing in `npm test` enforces the character ceilings a `BUDGET`
block states (`L-08`).

The `OPEN` findings in these records are counted in `scheme/CLAUDE.md` with the other three
categories, and none is closed without a reason (`L-16`). These records run shorter than
cluster's and workloads' and none reaches the 300 line length cluster holds its own to:
`tools/canon.mjs` prints the lengths when the question is actually asked.

## Exemplar (`STO.S-04`)

**The exemplar is copied whole, so what it gets wrong is copied whole.** Where it departs from a
rule of this folder, the departure is named here and in its own record.

`storage-generic-ephemeral-volume.js`, 245 lines and fully declarative. **New cards go in this
form.** Copy its shape rather than inventing one:

- One import line from `./storage-kit.js`, the `S-36` pointer comment, the geometry header, `SCENE`,
  the step-local helpers, `STEPS_SPEC`, then `init` last.
- The header keeps its MEASURED numbers as literals with their comments and derives the rest: `CX`
  is 600, the Pod and the claim row hang off it, `PV_Y` is derived so the gap under the claim row
  equals the gap above it, and `chipStrip` centres the strip on `CX` with the family 232 and 16.
- Every block is the catalog size: the Pod 232 by 104 around a 192 by 44 app box 26 under its
  label, the claim, the StorageClass and the provisioner 232 by 80. The cylinder re-centres its
  label with `labelY: PV_H / 2 + 10`, the `STO.L-02` formula.
- The ownership chain is the stack, Pod over claim over disk on one centre line, its out and back
  lanes a pair 24 apart mirrored about it, and every lane carries a ball on some step and ends on
  the face it enters, so its arrowheads are earned.
- `STO.S-01` as a field: a card-local `stage()` pins the Pod, the claim, the disk and all six lanes
  on every step, each lane derived from its two ends, full whenever both stand, so no opacity is
  inherited from the step before and no lane is hidden to say "not now". A `chips()` helper states all four
  chips on every step (`P-01`), all through `chipsCued`, the category default.
- The Pod is one unit and blinks as one, container included (`M-03`), and nothing inside it
  lights: on `mint` first, from its dim shade, before the ball it sends leaves (`M-18a`), on
  `mount` only once the ball that reaches it lands, and on `gc` first, before it fades (`M-08`).
- Every tag lives as long as its ball (`M-30a`) and every chip turns over on the arrival that
  earns it, through an arrival `F.set` with `rewind` holding the old value until then.

Nothing in the module departs from a rule of this folder. Its `CARDS/` record carries the
measurements behind the numbers, and its `PANEL` names the command rather than storing readings.

**`storage-volume-model` was the exemplar until the volume-foundations redesign** and is no longer
one. It now answers its own subject, ownership, with nested containment over a time axis: the volume
sits INSIDE the Pod shell under the containers, the containers are 200 by 80 because the shell
sizes them, and it carries no chip at all, the timeline and the file boxes standing where a strip
would. All three are right for that card and wrong as a template.

## Rules of this category only (`STO.*`)

True of every card here unless its own record in `./CARDS/<id>.md` says otherwise.

| ID | Rule |
|---|---|
| `STO.C-02` | **No `.highlight` is ever put on an inner CONTAINER box**, or the Pod keeps a lit rectangle after its blink decays. This is the storage reading of `S-19`: cylinders, bands, frames, controllers and claims ARE infrastructure and do light |
| `STO.S-01` | **A step's `opacity` field pins EVERY element born or removed mid-story, and every lane**, exactly as `chips` pins every chip (`P-01`). Twenty-three cards here state it through a card-local `stage()` factory so the whole set is one literal (`A-16`). `clearHighlights` clears classes, not inline styles, and the reduced replay walks 0..n, so without this a step entered out of order inherits the previous opacities |
| `STO.S-02` | **A block and its lanes are ONE construction and appear together**: there is no legal state where a lane is visible and the block on the end of it is not (`A-16`) |
| `STO.S-03` | **Z-order, bottom to top**: frames, then blocks and disks, then Pods so they sit above their own frame, then lanes and their captions, then the chip strip, then the packet layer (`S-07`) |

**A volume is named the way a claim is named** (`T-11a`): `PV web`, `PV x73a`, `PV web-0`, matching
the `PVC data-claim` four cards here draw. There is ONE form, the kind then a space then the bare
name: `PV-x73a` glued and `pv-web-0` lowercase are both wrong, and no card here carries either.
Bare names belong in a YAML field a tag quotes (`volumeName: x73a`) and nowhere else.

## Where these rules bend, measured rather than assumed

All three readings come from the spec data, not from grep.

- **`STO.C-02` was written as an absolute and is not one.** The catalogue follows it in a narrower
  form: a container box lights as a RECEIVER, when a ball lands on it, and is cleared by the reset.
  Counted as every step whose `lit`, `lights`, `F.light` or `F.set` names a box inside a Pod shell,
  **32 step/key pairs on 11 of the 39 cards here light one**, and every such box is in its card's
  `reset.keys`. Network does it 198 times on 40 of its 44 cards by the same count, with its own
  rules written on that assumption. What the rule still forbids is a container box left lit into a
  step that did not light it.
- **`STO.S-01` holds on 37 of the 39 in the form the row states.** 35 cards pin every element that
  changes and every keyed lane on every step, and 2 (`csi-architecture`, `fsgroup-ownership`)
  change no element's opacity at all, so they carry no field and need none.
  `volume-expansion` leaves its two mount lanes out of the field: they are keyed, full on every step
  and moved by nothing, so the omission cannot leak. `volume-detach-on-node-loss` is the one real
  exception: it pins only the elements its steps move, and stays correct because the replay always
  walks 0..n from a fresh build. Do not copy the shortcut into a new card, and do not "fix" it
  either, since writing the inherited value out changes the serialised DOM for nothing.
- **The stack of `STO.L-01` is a claim-chain grammar, not a category grammar.** 10 cards draw it and
  29 leave it, the whole of `volume-foundations` among them, each with its composition named in its
  own record. A card that leaves it says why under `LAYOUT`, and a card that has a claim chain and
  leaves it owes that reason more than one that has none.
