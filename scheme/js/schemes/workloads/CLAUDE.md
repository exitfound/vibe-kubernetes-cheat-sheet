# CLAUDE.md `js/schemes/workloads/` (Pods and controllers)

## What this file is

The contract for the Workloads category and nothing wider. Three documents sit above it and are not
repeated here:

| Document | Holds |
|---|---|
| `scheme/CANON.md` | the rulebook: layout, arrows, motion, colour, text, chips, metadata, posters, module structure. Load it before designing, reviewing or repairing a card |
| `scheme/CLAUDE.md` | the sub-app contract: folder shape, module contract, catalog wiring, the test suite and its checklists |
| `./CARDS.md` | the preamble and the catalog-order index of the per-card design records in `./CARDS/` |

**If a rule stated here would also be true of another category, it belongs in the canon, not here.**

The section order is the one all four folder contracts share, so a reader who knows one knows the
others: what this file is, the folder, the catalog, the tint, the kit surface, the geometry, the
escape hooks, the reduced path, the records, the exemplar, then whatever `WL.*` rules no section
above holds. The closing section on the four catalog-wide lane rules is this category's own and has
no counterpart in the other three.

The rows below carry `WL.*` ids and are indexed from `scheme/CANON.md`. **The TEXT of a `WL.*` rule
lives here and only here**: the canon carries the id and a subject label, never a second copy of the
rule. Where an id could name two different rules, the FOLDER keeps it: `WL.L-03`, `WL.L-04` and
`WL.L-05` mean what the rows below say and nothing else.

Every count in this file is measured off the tree. `report/skeleton-census.test.mjs` prints the hook
and step censuses, `unit/docs-census.test.mjs` asserts the numbers stated below against the same
census, and `unit/docs.test.mjs` asserts the record structure. Do not edit a number here to make a
sentence read better: re-measure, or the assertion goes red.

## The folder

| File | Owns |
|---|---|
| `cards.js` | the 32 `SCHEMES` entries and the `SUBCATEGORIES` list for this category |
| `posters.js` | the 32 grid thumbnails, keyed by card id |
| `workloads-kit.js` | the tint, the two pulse wrappers, the `WL` layout constants and the `LAYOUT` A/B/C column presets, plus the `P` / `F` / `defineCard` bindings; everything else is re-exported from `lib/scheme-kit.js` and `lib/layout.js` |
| `workloads-*.js` | one module per card |
| `CARDS.md` | the record's preamble and its index, and no `## ` heading of its own |
| `CARDS/<id>.md` | the design record for ONE card, a single `### layout` block of labelled notes and no other heading, which `S-51` states and `test:docs/G1` holds. All four categories are in the split shape, and `recordFiles` in `test/fixtures/catalog.mjs` is what reads the shape off the tree, so no category is a special case |

A card reaches `./workloads-kit.js` and no further (`S-21`): all 32 import the kit, 14 also import
`lib/svg.js` and 6 `lib/primitives.js`. Those are element constructors no part kind builds, and they
are on the cards that draw raw SVG: `g`, `rect`, `path` and `text` from `lib/svg.js` on
`crashloopbackoff`, `cronjob`, `deployment-strategy`, `effective-pod-requests`, `env-before-pid-1`,
`ephemeral-containers`, `force-deletion`, `image-pull-registry-auth`, `pod-startup-conditions`,
`job-parallelism`, `poststart-prestop-hooks`, `replicaset`, `rolling-update` and
`termination-order`, in a mix per
card: `rect` reaches 11 of the fourteen, `g` 9, `text` 8 and `path` 3,
and `chip` or `box` from `lib/primitives.js` on `container-states`, `ephemeral-containers`,
`init-containers-and-sidecars`, `pod-pending-init-states`, `pod-startup-conditions` and
`termination-order`. Nothing else may live here (`S-20`).

## The catalog

32 cards, 207 declared steps, three subcategories. It is the largest step count in the catalogue,
though not the highest per card: at 6.5 it sits behind storage and cluster and well ahead of
network. The subject is a STATE MACHINE rather than a path, and a Pod with phases to walk or a
controller with a reconcile to finish takes more beats to narrate than a packet crossing a Node.

### Subcategories (`WL.D-01`)

| key | label | cards | what belongs here |
|---|---|---|---|
| `pods-bootstrap` | Pods Bootstrap | 8 | anything that has to be settled before the app container is running: what is holding a Pod that is not Running yet, the gates and the conditions it clears before a Node is chosen, what the Scheduler reserves for it, image pull, init and sidecar ordering, the environment assembled at launch, and the QoS class it is born with. A subject is admitted only if it finishes at or before the first app container process starts |
| `pods-lifecycle` | Pods Lifecycle | 12 | one Pod's own state machine: phases, restart policy, hooks, probes, container states, crash loops, in-place resize, shutdown, force deletion, and what removes the object once the Pod is done |
| `controllers` | Controllers | 12 | an object that manages Pods rather than being one: Deployment, ReplicaSet, StatefulSet, DaemonSet, Job, CronJob |

The line between the first two is whether the app container has started.

The order of `SUBCATEGORIES`, and of the cards inside each, is an editorial argument about what a
reader meets first (`D-10`). It is never alphabetical, and `CARDS.md` indexes the records in that
same order.

## Tint

```js
WORKLOADS_TINT = { bright: 'rgb(142, 198, 247)' }   // sky blue
```

Only the pulse peak is named: the blink ramps from and back to the rect's own stroke (`M-05`).

| ID | Rule |
|---|---|
| `WL.C-01` | Sky blue is the category tint, and a workloads Pod is drawn IN it rather than against it: the binding is `{ role: 'workloads', podRole: 'workloads', tint: null }`, so `podRole` equals the category role and no Pod tint is pinned. Three of the four kits are in that position and only `cluster-kit.js` differs, because cluster is the one category drawing a FOREIGN Pod and it has to pin `POD_VIOLET`. Retinting either half is `C-22` |

## Kit surface

The shared list (`S-22`), the `P` / `F` / `defineCard` bindings every category kit makes, `POD_VIOLET`
and the six `lib/layout.js` formulas (`laneY`, `ladder`, `strip`, `spread`, `midX`, `shade`), plus
`WORKLOADS_TINT` and its two pulses. Two names are workloads-only: `WL`, the layout canon below, and
`LAYOUT`, its A/B/C column presets.

The binding is the one `WL.C-01` states above. What follows from it here: a card writes no `role:`
for its own elements, so a surviving `role:` literal is either a deliberate CROSS-CATEGORY override
(a workloads card drawing a control-plane block in cluster indigo) or a primitive called past the
kit binding by a `P.raw` or a `part.tune`, which has to be handed its role by hand. The escape-hook
section below counts the second kind.

## Geometry

### The layout canon (`WL.L-01`)

The X grammar all 32 workloads cards share, exported from `workloads-kit.js`. Y values stay per
card, because each card's panel bottom is its own measurement (`L-04`).

```js
WL = { M: 60, L: 60, R: 1140, CX: 600, W: 1080,
       TOP_Y: 40, BOX_H: 80, TOP_BOTTOM: 120, SPINE_X: 600,
       COL_L: { x: 60, w: 480 }, COL_R: { x: 660, w: 480 }, CHIP_H: 34,
       ROW_H: 32, ROW_GAP: 10, LANE_DY: 12 }

LAYOUT = { A: { ladder: WL.COL_L, chips: WL.COL_R },
           B: { chips: WL.COL_L, ladder: WL.COL_R },
           C: { ladder: WL.COL_R, strip: { two: 532, three: 350.7 } } }
```

**The columns are named by POSITION, and that is the whole reason `LAYOUT` exists.** A role name
(`LADDER_X`, `CHIP_X`) states the job that column holds in layout A, and B and C dominate: on 15 of
the 17 cards that take a preset at all, such a name states the opposite of what it does. Picking a
layout is one edit, `LAYOUT.A` / `.B` / `.C`, and no role-named column key belongs here.

The shape is an actor row clear of the narration panel, a pipeline ladder and a chip column
flanking a central spine, and a Node frame spanning `L..R` so the content bbox centres on `CX` by
construction.

| ID | Rule |
|---|---|
| `WL.L-02` | The columns are left `60..540` and right `660..1140`, both 480 wide. The Node frame stays full width, and the actor row is centred on `CX` and starts no further left than 420 |
| `WL.L-03` | **A** (`LAYOUT.A`) ladder left, chips right, Node on the floor. Needs `PANEL_B + 20 + LADDER_H + 20 + NODE_H <= 630` |
| `WL.L-04` | **B** (`LAYOUT.B`) the mirror, chips left and ladder right. **This is the common case, not A**: a 4-chip column is 160 tall where a 5-row ladder is 200, and the band left free below a real panel is at most about 214 |
| `WL.L-05` | **C** (`LAYOUT.C`) tall panel, neither column fits below it: ladder right, Node just under the panel, chips as a full-width bottom strip **two or three per row** (532 or 350.7 wide). Never four or five across: 258 and 205 are narrower than the strings, and that produced 79 chip collisions |
| `WL.L-06` | The choice itself is `L-08a`, which cluster obeys too. What is workloads alone: the split over these 32 cards, measured off the CODE with comments stripped, A 0, B 2, C 8, and 22 that read no preset at all and state their own geometry, because a card carrying neither a ladder nor a flanking chip column has no columns for A / B / C to choose between. Comments are stripped because five cards name a preset only in one (`workloads-deployment-strategy`, `workloads-env-before-pid-1`, `workloads-pod-pending-init-states`, `workloads-pod-resize` and `workloads-pod-scheduling-gates`), and a mention is not a read. TWO of the eight C readers, `workloads-finished-job-cleanup` and `workloads-deployment-rollback`, take only `LAYOUT.C.strip.two` and no column at all: neither carries a ladder or a flanking column, and each reads C purely for the WL.L-05 two-across chip width. Nothing in `test/fixtures/census.mjs` guards this split the way it guards cluster's, so it is re-measured by hand |
| `WL.L-07` | The trunk has to run in the `540..660` corridor to clear both columns and still leave a face midpoint, so **the actor box it leaves must be centred on `WL.SPINE_X`**. That is why several cards carry a first actor box of `420..780` rather than `420..640` |

`WL.L-05` is the rule that cost the most: stretching the chip strip to straddle 600 closes a
`CENTRE` finding and produces the 79 collisions, so the rule goes green on a drawing that is
rejected under `L-16`.

## The escape hooks this category needs

All 32 cards are in the declarative form. **8 are fully declarative**; 24 carry a hook, **101
sites in all**, and migrating the category required the DSL to grow zero times. `step.enter`,
`step.motion`, `F.run` and `reset.extra` are used by NOBODY here, so every one of those sites is a
`P.raw` or a `part.tune`, which is what makes this the largest hook population in the catalogue and
the narrowest by KIND.

The counts are SITES the layer actually receives, read off the imported specs the way
`report/skeleton-census.test.mjs` totals them, never off grep.

| Card | Hook | What it wraps, and why no field expresses it |
|---|---|---|
| `workloads-crashloopbackoff` | `P.raw`, one factory over nine bars plus the axis and the ceiling rule | The backoff instrument is naked rects: a `box()` would be scored as a block by the geometry probe and as a body by `CENTRE`, and a bar 8 units tall is neither. Each bar sits in a keyed `P.group` (`bar0..bar8`) with its own `P.tag`, which is what `opacity` addresses per step |
| `workloads-cronjob` | `P.raw`, one factory over the time axis, a second over the seven slot cells and a third over the four verdict marks | The axis is a 2 unit rule with seven graduations and their tick labels, and a slot cell is a fill-less outline the size of a Job: a `box()` would be scored as a block by the geometry probe and as a body by `CENTRE`, and neither a graduation nor an empty cell is one. Axis and cells are unkeyed because they are true on every step and nothing addresses them, and the cells are also what every tap LANDS on, so no arrowhead points at blank canvas while a create is in flight. A verdict mark is a word plus its cause, keyed `mark0`, `mark1`, `mark5` and `mark6`, which is what `opacity` and `F.reveal` address per step: a word with no second line cannot tell four of them apart, so the pair reveals as one group. Like `workloads-effective-pod-requests` all three factories write no `role:` and carry no painted class, so `probePaint` never walks them. It takes no `part.tune`: its four lanes are whole arrays per tapped slot, so every one of them ENDS on a slot and keeps the arrowhead `pathArrow` attaches |
| `workloads-init-containers-and-sidecars` | `part.tune` on the `P.pod` | The Pod holds FOUR peer container boxes; `buildPod` carries exactly one `inner` and would hand it the Pod's own role, turning four `role: 'cluster'` boxes blue. They must also sit inside the shell group, because `pulsePod` reaches only what the Pod contains |
| `workloads-container-states` | `part.tune` on the `P.pod` | The Pod holds TWO peer container boxes, the live instance and the previous one, and `buildPod` carries exactly one `inner`. The second sits inside the shell group, because `pulsePod` reaches only what the Pod contains and the crash blinks the Pod with both instances in it. `box()` defaults its role to the empty string, so the kit binding is written out by hand |
| `workloads-pod-pending-init-states` | `part.tune` on the `P.pod` | The Pod holds THREE peer container boxes, the two init containers the STATUS counter counts and the app they gate, and `buildPod` carries exactly one `inner`. All three sit inside the shell group, because `pulsePod` reaches only what the Pod contains and every Kubelet arrival blinks the Pod with them in it. `box()` defaults its role to the empty string, so the kit binding is written out by hand three times |
| `workloads-ephemeral-containers` | `part.tune` on the `P.pod`, and on the trunk and the bus | The Pod holds TWO peer container boxes inside a dashed namespace region and `buildPod` carries exactly one `inner`. The second box and the region sit inside the shell group, because `pulsePod` reaches only what the Pod contains and the step that starts it blinks the Pod with the new box already in it. The region is a naked `rect` plus a caption, grouped so it fades as one, built inside the same `tune` rather than as a `P.raw` because it has to sit UNDER the app box the builder already made. `box()` defaults its role to the empty string, so the kit binding is written out by hand. The trunk and the bus carry every fan ball, and `tune` drops their marker the way `workloads-pod-qos-classes` does |
| `workloads-termination-order` | `part.tune` on the `P.pod` | The Pod holds FIVE peer container boxes in two zones, a caption over each zone and the gate rule between them, and `buildPod` carries exactly one `inner`. All eight sit inside the shell group, because `pulsePod` reaches only what the Pod contains and the step that marks the Pod terminating blinks the whole assembly with it. `box()` defaults its role to the empty string, so the kit binding is written out by hand in the one `container` factory the five boxes share |
| `workloads-poststart-prestop-hooks` | `P.raw`, one factory over seven bars, a second over four ticks, plus the axis | The container-lifetime rail is naked rects: a `box()` would be scored as a block by the geometry probe and as a body by `CENTRE`, and an 18 unit tread is neither. A tick is its rule AND its word in one keyed `g`, because a mark with no label is a decoration and the two have to reveal together. Every bar and tick carries its own key, which is what `opacity` and `F.reveal` address per step |
| `workloads-image-pull-registry-auth` | `P.raw` | The registry cloud is a bare `<path>`, the only CLOSED outline drawn that way here: the other two `path` importers, `workloads-force-deletion` and `workloads-termination-order`, draw open segments, a cross and a rail |
| `workloads-replicaset` | `P.raw`, one factory over the two ownership bands and one over the count mark, plus `part.tune` on the trunk and both bus segments | A band is a fill-less dashed boundary with a caption, which no part kind builds, and a `node()` there would draw a Node the card is not about. The mark is a 2 unit bar: a `box()` would be scored as a block by the geometry probe and as a body by `CENTRE`, and a graduation is neither. `P.raw` bypasses the kit binding, so the paint is written by hand. The three `tune` sites are the `workloads-pod-qos-classes` reason: trunk and bus carry every ball, so they are lanes rather than relations, and `tune` drops the head that belongs on the tap |
| `workloads-pod-startup-conditions` | `P.raw`, one factory over five treads plus two rail segments | The condition staircase is a two-line cell (`chip()` carries one centred label, `box()` is a component) and the phase rail is two label-only `chip()`s. Keys `rung0..rung4`, `railPending` and `railRunning`, which is what `lit`, `opacity` and `reset.keys` address |
| `workloads-pod-lifecycle-phases` | `part.tune` on the `Running` state box | The phase machine draws CrashLoopBackOff INSIDE Running, so that state box is 150 tall against the 58 of the other three. `box()` optically centres its label, which puts the word Running on the inner box. `tune` moves the label attribute `y` to the top of the rect, and no field reaches an SVG attribute |
| `workloads-deployment-rollback` | `part.tune` on the trunk and the bus | Same reason as `workloads-pod-qos-classes`, at the two sites one `busPath` factory covers: both carry every ball on the card, so both are lanes that `pathArrow` would give a head, and the four heads belong on the taps that reach the four ReplicaSet slots |
| `workloads-rolling-update` | `P.raw` on the two owner regions, plus `part.tune` on the trunk and all six bus segments | An owner region is a fill-less dashed rect, which no part kind builds, and a `node()` there would draw a Node: where these Pods run is not this card's subject and a frame around a column would say the split is by Node. `P.raw` bypasses the kit binding, so the paint is written by hand and carries no role, the way the bands of `workloads-replicaset` do. The seven `tune` sites are the `workloads-pod-qos-classes` reason: the trunk and the bus carry every ball, so all seven are lanes that `pathArrow` would give a head, and the heads belong on the six drops. The bus is split at the trunk and at every slot centre so each segment can die with the last Pod it still serves |
| `workloads-pod-qos-classes` | `part.tune` on the trunk and the bus | Both carry every fan ball, so they are lanes and not relations, and a lane always takes the arrowhead `pathArrow` attaches. `tune` drops the marker, because one head per run belongs on the tap that reaches the Node |
| `workloads-statefulset-ordered-rollout` | `part.tune` on the trunk and both bus halves | The `workloads-pod-qos-classes` reason at three sites: all three carry every ball, so all three are lanes that `pathArrow` would give a head, and the heads belong on the three taps that land on a Pod. The three ownership spines and the two gates take no hook: nothing rides them, so they are plain relations and keep the A-08 wash, the way `workloads-pod-lifecycle-phases` draws its state edges |
| `workloads-pod-garbage-collection` | `part.tune` on the trunk and on all four bus segments | Same reason as `workloads-pod-qos-classes`, at five sites rather than two: the bus is SPLIT at every Pod centre and at the trunk so each segment can die with the Pods it still serves, and every one of the five carries fan balls, so every one is a lane that `pathArrow` would give a head. The heads belong on the four taps |
| `workloads-env-before-pid-1` | `P.raw`, one factory over the two wall segments | The wall is a bare rect pair, because its two captions are `P.tag`s addressable per step and `chip()` carries its label as its own child. Each caption is centred in its own 316 half: they are two rules of one line, not one sentence halved. `P.raw` bypasses the kit binding, so the role is written by hand |
| `workloads-force-deletion` | `P.raw`, one `<path>` drawing a cross | The break ON the dead acknowledgement channel is a bare two-segment `path`, and no part kind emits one: an `arrow()` would attach a marker and read as traffic on a channel whose whole point is that nothing travels it. It carries the label class rather than an arrow class, so it is a MARK over a lane and `L-09` does not reach it. It is born at `opacity: 0` and fades in on the step that severs the channel |
| `workloads-deployment-strategy` | `P.raw`, one factory over the void mark, plus `part.tune` on the trunk and all four bus segments | The outage the Recreate window holds is a drawn thing and not a missing one, and what draws it is a fill-less dashed rect the size of the one Pod slot it stands in for, with its caption inside the same keyed `g`: a mark with no word is a decoration and the two have to reveal together. A `box()` there would be scored as a block by the geometry probe and as a body by `CENTRE`, and an empty slot is neither. Like `workloads-effective-pod-requests` it writes no `role:` and carries no painted class, so `probePaint` never walks it, and `gapMark` is the key `opacity` and the two `F.fade`s address, one raising it and one dropping it. The five `tune` sites are the `workloads-pod-qos-classes` reason at the sites one `busPath` factory covers: the trunk and both buses carry every ball, so all five are lanes that `pathArrow` would give a head, and the heads belong on the four taps. Each bus is SPLIT at track A so a segment can die with the tap it feeds |
| `workloads-job-parallelism` | `P.raw`, one factory over the three meter frames plus one per fill mark | Two meters and a slot row: five completion slots, six failure ticks, three worker slots, and one born-invisible mark inside each slot the card can fill. A `box()` would be scored as a block by the geometry probe and as a body by `CENTRE`, and an empty graduation is neither, so the whole card carries no value chip and every number it owns is a length instead. The frames are unkeyed because nothing addresses them, and each mark carries its own key (`fill0..fill4`, `spent0`), which is what `opacity` and `F.reveal` address per step. Like `workloads-effective-pod-requests` the factory writes no `role:` and carries no painted class, so `probePaint` never walks it |
| `workloads-pod-replacement-guarantees` | `part.tune` on the trunk and both bus halves | The `workloads-pod-qos-classes` reason at the three sites one `trunkPath` factory covers: all three carry every watch ball, so all three are lanes that `pathArrow` would give a head, and the five heads belong on the five taps that land on an owner. The four ownership spines keep their heads, because a replacement really does ride each of them, and the fifth is a plain relation rather than a tuned lane: a CronJob never creates a Pod, so nothing rides it at all |
| `workloads-statefulset-update-strategy` | `part.tune` on the trunk and the bus, and on the worklist chain | The `workloads-pod-qos-classes` reason at the first two sites: both carry every ball on the card, so both are lanes that `pathArrow` would give a head, and the heads belong on the two taps that land on a Pod slot. The third site is the SPLIT worklist: `chainList` lays every row on one pitch, and the gap the partition rule falls in has to be wider than the other two, so `tune` pushes the two rows below the rule down by the difference. A second chain instead would take a second key, and a step addresses a chain by row INDEX. The partition rule itself takes no hook: nothing rides a boundary, so it is a plain relation and keeps the A-08 wash |
| `workloads-effective-pod-requests` | `P.raw`, four naked rects | The instrument is a time axis, two graduations and the idle band. A `box()` would be scored as a block by the geometry probe and as a body by `CENTRE`, and a 3.5 unit rule is neither. They are the one raw factory here writing no `role:` at all: with no role and no painted class, `probePaint` never walks them, which is what a graduation wants |

**A `P.raw` factory and a `part.tune` calling a primitive directly are where a card still writes its
own `role:`**, because both bypass the kit binding by construction and the primitive has to be
handed the role by hand. Six `role: 'workloads'` literals survive in the category for exactly that
reason, and every one of them is a `part.tune` calling the primitive directly: the
debug container box `workloads-ephemeral-containers` appends, the
previous-instance box `workloads-container-states` appends, the one
`container` factory the five boxes of `workloads-termination-order` share, and the three
container boxes of `workloads-pod-pending-init-states`
append the same way. A `P.raw` factory drawing a naked instrument writes no role at all, which is
what `workloads-cronjob`, `workloads-effective-pod-requests`, `workloads-job-parallelism`,
`workloads-deployment-strategy` and `workloads-rolling-update` do.

## The reduced path

`reducedLit` is **declared on 10 cards over 34 steps here**, against 141 in network, 2 in cluster
and 0 in storage: the second largest population in the catalogue, and second by a wide margin.
The reason is the subject. 173 of the 207 steps light something through `lit:` or a `lights` list,
so `flowLights` derives most of the static path for free, and what it cannot derive is a step
whose whole animated statement is a PULSE: "this Pod is here now" is said by blinking the wrapper,
and no `lightBoxAt` names the inner box.

`workloads-force-deletion` is the second shape, a chip turned over inside an `F.set` at an
arrival, which carries no `lights` list either. One card, `workloads-cronjob`, is the limit case:
no step of it declares `lights:` or an `F.light` at all, so `flowLights` returns `[]` on every
step and its entire static path rests on `reducedLit`. A wrong derivation lands on the HIGHLIGHT
axis of `render/reduced.test.mjs`, which is enforced, so `npm test` is what catches it.

## The records

| ID | Rule |
|---|---|
| `WL.S-03` | **A record opens on `WHAT`, uses the canon's labels in the canon's ORDER, uses each at most once, and carries no heading but `### layout`.** That half is `S-51` and `S-52` catalog-wide, held on all 32 of these by `test:docs/G1` and `test:docs/G2`. What stays workloads-only is the panel reading below. A heading written onto the end of the closing fence above it is swallowed by that fence and is invisible to every `^### ` reader in the tree, the record walk included. Every record here carries a `PANEL` block, 32 of 32, naming the command that prints the extent rather than storing a number that goes stale with the next prose edit. These records are the longest in the catalogue after cluster's |

The block labels a record may use are ONE list for all four categories, in `scheme/CANON.md` under
"The record vocabulary", each used at most once and in that order. That is `S-52`, and
`test:docs/G2` reads the vocabulary off the canon and holds all 32 records here to it, so a label
outside the list, a duplicate or a run out of order fails the gate rather than a review.

A `PANEL` block states the READING, not the extent: the right edge is `x<=397` catalog-wide
(`L-02`), and the bottom moves non-monotonically per card and per viewport (`L-04`, `L-06`), so
each block names the command that prints it, `OVERLAY_IDS=<card-id> node --test
report/overlay.test.mjs` from `scheme/test/`, and keeps only which step is deepest, what stands
under the panel and how much clearance is left.

The length the rule row names is earned by measurement rather than by prose: this category carries
the deepest panel in the whole catalogue, 503 units on
`workloads-pod-lifecycle-phases` (`L-04`), so more of its cards had to be measured at three
viewports before their geometry could be settled. `tools/canon.mjs` prints the lengths when the
question is actually asked.

## Exemplar (`WL.S-02`)

**The exemplar is copied whole, so what it gets wrong is copied whole. Where it deviates from a rule
of this folder, the deviation is named HERE and in its own record, beside the shape a copy takes
instead.** Naming it is not a licence to leave it: it is what stops the next card inheriting it.

`workloads-pod-startup-conditions.js`, 256 lines and fully declarative. **New cards go in this
form.** Copy its shape rather than inventing one:

- One import line from `./workloads-kit.js`, plus `lib/svg.js` and `lib/primitives.js` where a `raw`
  factory needs them, the `S-36` pointer comment, the geometry header, `SCENE`, step-local
  constants, `STEPS_SPEC`, then `init` last.
- The header keeps its MEASURED numbers as literals with their comments (`L-07`) and derives the
  rest through the kit's formulas, and it is written in BANDS: each band opens with a comment saying
  what it is and why it sits where it does.
- `SCENE.parts` is an ordered list and the order IS the z-order, so it reproduces what a
  hand-written `build()` said by where a line sat. `reset.keys` and `reset.pods` are written out.
- Its corridor is `[[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, NODE_Y]]`, ending on the Node FRAME
  face and never on the Pod inside it, which is `WL.A-03` done right. This is the reason the
  exemplar is this card.
- The actor row is a PAIR at 232 wide, the left box centred on `WL.CX` because `WL.L-07` needs the
  spine to leave a face midpoint, the right box right-aligned on `WL.R` where the chip column below
  it also ends.
- It takes NO `LAYOUT` preset and says so in its record: A / B / C choose which column holds the
  ladder and which the chips, and a card carrying neither has nothing for them to choose. Copying
  the exemplar is copying its SHAPE, never its arrangement.

**The one thing not to copy.** Its `P.raw` staircase is five treads plus two rail segments built by
one factory, and a factory bypasses the kit binding, so every one of those calls writes its own
`role:` by hand. That is the price of a raw instrument and not a pattern: a card whose blocks are
blocks takes `P.box` and writes no role at all.

**`workloads-probes` was the exemplar until its redesign** and is no longer one. It now carries
seven lanes and a three-lane fan that no other card in this category has, which is a composition
answering its own subject rather than a shape to copy, and copying it would converge the section on
a fan. Its corridor pair idiom survives the move and is described above.

## Rules of this category only (`WL.*`)

| ID | Rule |
|---|---|
| `WL.A-01` | The top-row lane PAIR: `REQ_Y = TOP_CY - LANE_DY` carries the request to the API and `RESP_Y = TOP_CY + LANE_DY` carries the answer back. Measured over the 32: **17 draw the pair and 13 of those ride the answer**, and `workloads-pod-qos-classes` is the one card that rides a single answer lane on `TOP_CY` with no pair at all, because no step of it names anything going the other way. Whether the answer lane is an arrow or a relation is decided by the step's own words (`A-06`) |
| `WL.A-02` | **The top-row wire label goes ABOVE the actor row**, at `WIRE_Y = WL.TOP_Y - 12`, never below it. Below, centred at `WIRE_X` on y=146, it lands on the lane and across the spine's step. Nine cards carry that constant identically |
| `WL.A-03` | **A lane between the actor row and the Node band ends on the FRAME face midpoint, in both directions**, never on a Pod inside the frame. This is the cluster grammar and it holds here too: an endpoint on `POD_Y` makes the lane pierce the frame it crosses, which draws the Kubelet reaching THROUGH the Node rather than acting on it. The frame's top midpoint therefore has to equal `WL.SPINE_X`, so a frame narrower than the full width is centred on `WL.CX`. The catalog is NOT converted, and `report/frame-face.test.mjs` prints the queue: NO card here still ends on `POD_Y`, against 12 already on the rule (`workloads-daemonset`, `workloads-ephemeral-containers`, `workloads-finished-job-cleanup`, `workloads-force-deletion`, `workloads-graceful-shutdown`, `workloads-image-pull-registry-auth`, `workloads-init-containers-and-sidecars`, `workloads-pod-qos-classes`, `workloads-pod-resize`, `workloads-pod-pending-init-states`, `workloads-pod-startup-conditions`, `workloads-termination-order`), 4 whose every frame lane runs on the ground and is out of the rule's reach (`workloads-crashloopbackoff` among them: its Kubelet sits inside the frame), 1 whose only lane across the frame edge leaves the interior UPWARD, the Kubelet inside it reporting out (`workloads-container-states`, which the report prints apart as interior), and 15 that draw no `node()` frame at all, so nothing on them can meet it (`workloads-pod-replacement-guarantees` is the newest of them: its five columns are five unrelated owners, so a frame anywhere on it would say two of those five Pods share a Node, which nothing about five separate controllers promises, and the one Node it names is named in words. `workloads-statefulset-update-strategy`: its two Pod slots are the maxUnavailable BUDGET drawn as places, so a frame around the pair would say the two unavailable Pods share a Node, which nothing about an update promises. `workloads-cronjob`: its seven slots are the seven TICKS of a schedule rather than seven places, so one frame around the row would say the runs share a Node, which a CronJob does not promise, and the card was the last member of the queue above until its redesign took the frame out. `workloads-job-parallelism` is an instrument panel whose three worker slots are the `parallelism` cap drawn as a length, so a frame around all three would say a Job promises they share a Node, which it does not. `workloads-statefulset-ordered-rollout` carries the same argument, three ordinal columns whose subject is the ORDER they are created in and not where they run, so one frame around all three would say they share a Node, which a StatefulSet does not promise. `workloads-deployment-rollback` is an object board whose whole cast is a Deployment and four ReplicaSets, and `workloads-replicaset` states the argument they share: the subject is which ReplicaSet owns how many Pods and not where they run, so a frame there is a block no step narrates, and on `rolling-update` one frame spanning both owner columns would say the split is by Node). Nothing in the suite can see either shape, because `check-geometry` scores where a lane ENDS and both endpoints are legal to it |
| `WL.S-01` | Each card owns its own `SPINE` points array, and the same array feeds both the drawn wire and the ball. **There is no shared connector helper, and there must not be one**: a helper holding the ball's points in the kit while the card holds the wire's leaves two independent copies of the same numbers |

## Four catalog-wide lane rules the canon sources here

`A-06`, `A-09`, `A-10` and `A-12` are catalog-wide rows in `scheme/CANON.md` and that is where the
rule text is. They were derived on this category's control-plane cards, so the canon's `Source`
column points at this file for the working that produced them. This section is that working, not a
second statement of the rules.

**Which of the two a lane IS (`A-06`).** Where a step NAMES something arriving from the API, the
lane gets a ball, and the receiving box goes dark at step entry and lights on arrival, because it is
a receiver now. Where no step names anything coming back, it is a relationship: `relationPath`, no
arrowhead, `stroke-opacity: 0.45`, category tint kept. Three things the ball costs, every time:

1. An added hop is about 800ms (a 60 unit gap sits on the `PKT_DUR_MIN` floor of 700, plus
   `BEAT.afterHop`), so `duration` usually has to rise and `render/duration.test.mjs` says by how much.
2. A return FLIPS THE SENDER INTO A RECEIVER, so a box lit at step entry has to go dark and light on
   arrival instead, or `R3` in `report/arrival.test.mjs` reports it.
3. `BEAT` missing from a card's imports throws a `ReferenceError` that `Timeline` swallows into
   `console.error`: the step plays its first packet and silently stops (`S-33`). Only the browser
   smoke sees it, so run it after touching any card's imports.

**A lane leaves the box that ACTS (`A-09`).** On a control-plane card the leftmost box writes to the
API and stops there, so what then happens on a Node is that write taking effect and the lane into
the Node band belongs to the API. `workloads-force-deletion` is the model. Two traps come with
moving one:

- Moving a lane is a TIMING change, because `routeDur` is length-based: moving a start 300 to 400
  units right adds 250 to 870ms per ball. Raise the duration, never shorten the motion (`A-11`).
- A box can be DERIVED FROM the lane (`KUBECTL_X = SPINE_X - BOX_W / 2`), so redefining the spine
  moves the box instead of the lane, and such a card needs its own constant (`A-12`).

**Two actors, one slot (`A-10`).** Draw two lanes over a shared drop rather than picking a winner.
Picking one is an editorial claim about which actor matters, made silently in geometry, and the
reader has no way to see that the other one was considered.
