# Poster composition families

Mined from the shipped posters by rendering them with `tools/montage.mjs` and reading the grid.
Each family is in use unless marked otherwise, with the cards to open before drawing a new one.

This file holds no rules: `R-01` to `R-12` in `scheme/CANON.md` do, and they win. It is the
vocabulary they leave open.

**How to use it.** Write the sentence, pick the family that says that kind of sentence, pick the
marks from **Glyph vocabulary** below, then place the accent. Two posters in one family look nothing
alike when their blocks are furnished differently, and two in different families look identical
when both are empty outlines.

| Family | The sentence it says | Open these |
|---|---|---|
| Hub and spokes | everything talks to one thing | `cluster-architecture`, `network-containers-share-localhost` |
| Row of peers, one accented | several equals, and this is the one | `cluster-leader-election`, `storage-csi-architecture` |
| Overlapping sets | two owners, and the subject is what they share | `cluster-server-side-apply` |
| Chain of stages | a thing passes through steps in order | `cluster-admission-chain`, `storage-attach-mount-chain`, `storage-csi-ephemeral-volume` |
| Stack of layers | one thing is built out of layers | `storage-container-filesystem` (an offset cascade of equal sheets, each hiding most of the one behind), `storage-hostpath` (a ghost Pod over one Node filesystem band, pierced by one shaft into the cell it wrote), `storage-mount-propagation` (one mount list per sheet, one entry running through the front two) |
| Stream into a cache | a source feeds a copy that answers | `cluster-list-watch-informers` |
| Two zones compared | two regimes, and they differ | `storage-filesystem-vs-block`, `cluster-resource-quota`, `cluster-node-eviction-rate` |
| Ghost zone to solid zone | it moves from there to here, or dies there and lives here | `cluster-node-drain` |
| Branch | one input, two outcomes | `workloads-cronjob`, `storage-configmap-secret-mount` (a switch: one blade on a pivot between two whole versions) |
| Ring of states | it cycles, or it has phases | `storage-pv-lifecycle-phases`, `cluster-kubelet-reconcile-loop` |
| Nested containment | this lives inside that | `cluster-pod-sandbox-cri`, `network-namespaces` (three tenants standing directly over the one stack they share) |
| Segmented budget bar | one capacity, divided | `cluster-node-allocatable` |
| Flatline into a wait | a signal stops, and what follows is mostly waiting | `cluster-node-failure` |
| Gauge columns | a proportion consumed | `cluster-cpu-throttling` |
| Stepped counts | a count of discrete things moves between two states | no current user |
| Fan | one source to many, or many into one | `workloads-env-before-pid-1` |
| The break | something snaps, is crossed out, or is refused | `cluster-oom-kill`, `storage-multi-attach-error` |
| The wall | two things exist and one cannot reach the other | `storage-pv-reservation`, `storage-volumeattachment` (the bar is one FIELD: the device is already on the Node, the Pod waits on the other side) |
| Rank ladder | several things are ordered, and the order decides | `cluster-pod-priority-preemption` |
| Stepped rank | one object moved rank, and it is the same object | no current user |
| Held object | it is marked to go, and this is what keeps it | `cluster-cascading-deletion` |

---

## Hub and spokes

**Build:** a circle at (160, 90) with `r` 20 to 24, three or four blocks on the two axes, dashed
legs between. The centre carries stroke 2 and the brighter fill: this family weights by line, not
by an accent bar.

**Fails when:** the spokes get labels or a fifth block appears.

## Row of peers, one accented

**Build:** three blocks on one baseline, 76 to 80 wide, 40 to 50 tall, equal gaps. The subject
carries the `R-07` accent bar inside the block, the others the same bar at 0.3.

**Fails when:** the accent goes on the whole shape instead of the bar inside it.

## Overlapping sets

**Build:** two equal frames offset diagonally to cross near the centre, each at fill 0.04 with a 0.3
bar in its exclusive part. The shared region is redrawn as a path tracing both outlines (sharp at
the crossings, rounded where a corner belongs to a frame), with stroke 2 and the one 0.9 bar.

**Fails when:** the overlap is a sliver, or so large it reads as one frame with a shadow. Dim bars
centred in their frames land on the other frame's edge: pull them toward the far corners,
mirror-symmetric about the centre.

## Chain of stages

**Build:** three to five small blocks left to right, short dashed legs, one baseline. Direction
comes from order and legs, never an arrowhead (`R-08`). Vary the glyph per stage when the stages
differ in kind: a list, a wave, a check, a cylinder.

**Fails when:** the stages are the same rectangle five times.

## Stack of layers

**Build:** three to five bars of one width with a 4 to 6 unit gap, brightest at the layer the card
is about, the rest at 0.03 to 0.04.

**Fails when:** every layer carries the same fill.

## Stream into a cache

**Build:** one framed block on the left dense with stacked bars, so the copy reads as a mass, and a
loose drift of slivers on the right, with one dashed leg from the accented bar toward them. A sliver
is a rounded rect about half a cache row high and a fifth to a quarter as long: a fragment of what
the block holds whole. This is the one place an element under 20 units is right, because the stream
is a population. It needs a dozen slivers.

Grade them in three bands by distance from the leg (about 0.7, 0.5, 0.3) and fan the field wider
going right. Circles read pale at 200px, and a regular grid reads as a matrix. Keep the leg's own
line clear for the whole field.

## Two zones compared

**Build:** the canvas split about x=160 by a thin rule or a gap, the same skeleton on each side, so
the difference is the only thing that moves. Accent on the side the card is about.

**Fails when:** the two sides use different vocabularies.

**The split can run along Y**: two zones stacked on one x, fed from a shared source on the left.
Take it when the card's own diagram or a grid neighbour already splits left and right
(`workloads-deployment-strategy`).

**An empty zone is a positive mark**: the same frame at the same weight with dashed hollows where
the other zone has filled cells. A dashed frame against a solid one reads as unrendered at 200px.

## Ghost zone to solid zone

**Build:** the losing side dashed at 0.02 to 0.03 with rows at `opacity="0.3"`, the winning side
solid at 0.06 with rows at 0.10, one dashed leg between the frames.

**Fails when:** the ghost side is too faint at 200px. Check the actual-size montage.

## Branch

**Build:** one block at the top or left, two below or right, the taken outcome accented, the other
at the sibling fill. No arrowheads: the fork reads from the geometry.

## Ring of states

**Build:** four or five stations on a circle of radius 55 to 70 at (160, 90), joined by arcs that
leave a gap at each station. The accent goes on the station, not the arc. `R-08a` allows one
chevron when the whole sentence is the direction of travel, and `CHEVRON_OK` in `poster-lint.mjs`
names the posters that have one.

**Fails when:** the ring closes into a solid annulus.

## Nested containment

**Build:** an outer rounded rect at 0.04, one or two inner blocks at 0.06 to 0.10, a small circle
for a third held thing. Outer margin even, 20 to 24 units.

**Fails when:** the outer frame and the inner blocks are all dashed.

## Segmented budget bar

**Build:** one wide bar (about 240 units) cut by thin vertical rules into three or four segments,
the surviving segment accented and usually widest.

## Flatline into a wait

**Build:** a trace on the left third at stroke 2, two beats then flat, running into the left face
of the track on one spine (y=90). The track is two or three touching segments about 100 units tall.
The accent sits in the longest segment at 0.9, the others at 0.3. The wait is about twice the
trace: the proportion is the sentence.

**Fails when:** the beats are at full amplitude and out-shout the accent (`R-03`), so the trace
takes an `opacity` under 1. Or when dashed legs join trace and track instead of one spine.

## Gauge columns

**Build:** two or three tall columns (about 40 by 90) with an inner fill rising from the bottom,
level except the subject. A fill under about 15 units disappears at 200px.

Not Rank ladder, where the whole column height is the value and there is no inner fill.

## Stepped counts

No current user. Kept as vocabulary.

**Build:** two stacks of identical unit cells on one baseline, a real gap between cells, crossed by
one horizontal rule at the reference value. One stack sits at the rule, the other one cell above.
Accent at 0.9 on the cell that breaks the rule, every other cell at 0.3. Cells of 17.5px on 7.5px
gaps separate cleanly at true size.

**Fails when:** there are three stacks. Drop to the two states that differ, never shrink the cells.

## Fan

**Build:** three or four blocks on one side, a single point or block on the other, straight dashed
legs converging on a small point.

**Fails when:** it has more than four legs, or the legs cross.

## Rank ladder

**Build:** columns on one shared baseline, height is the value, no inner fill. Three or four in a
monotonic staircase with an even step (20 units). The subject stands apart, outside the frame that
holds the others, tallest by a clear margin. Accent at 0.9 in the subject, 0.3 in the ones it
outranks, a break glyph on the loser at the bottom.

**Fails when:** height reads as size or usage. The subject outside its container and a wide gap to
the tallest ranked column guard against that. Never order the ladder non-monotonically.

## Stepped rank

No current user. Kept as vocabulary.

**Build:** three equal blocks at the house size, no shared baseline, no inner fill, each higher than
the last. One rung is a dashed empty outline where a block was, with a solid leg from that vacancy
to the block that now holds the higher rank. Accent at 0.9 on the top rung.

**Fails when:** vacancy and leg carry the weight of the blocks and read as plumbing. A stepped
profile line under the blocks is redundant. More than three rungs do not fit at the house size.

## Held object

**Build:** two blocks of the same size either side of one centre line. Left, the object: a solid
block at 0.10 with stroke 2 inside a dashed stamp of the same footprint. Right, what holds it: a
frame of three short rows, the cleared ones ghosted, dashed and struck through, the holding one
solid with the only accent. One short dashed leg between the outer faces, on the centre line.

**Fails when:** the object is drawn as a ghost, which says it is already gone. Put the live row in
the middle, so the leg, the accent and both block centres share one spine.

## The break

**Build:** an X of two crossing lines over a block, or a jagged polyline through a frame. One break
per poster, on the thing that broke.

**Fails when:** the break gets a colour of its own. Everything is `currentColor` (`R-04`).

## The wall

The break's sibling: nothing is damaged, something is held off.

**Build:** two blocks on one baseline with a gap, and one upright bar in the gap at 0.9, the whole
accent. The bar overhangs both blocks top and bottom. The thing kept out is the smaller, lighter
block.

**The bar is upright.** Laid under the upper block it reads as a shelf, on a frame's top edge as a
lid. Only upright reads as a barrier.

**Fails when:** both blocks carry the same furniture. Give the sides different insides: a roster on
one, a ragged record on the other, or nothing on the lighter one.

## Glyph vocabulary

The family says how elements are arranged. This says what they are made of.

The reference alphabet is small: rectangles, straight lines, dashes and one heavy stroke, with arcs,
traces, circles and polylines rare. The cure for a dull poster is never a more exotic shape. Two
things separate the reference set from weak posters:

1. **Ink.** Nearly every reference poster lands a mark at 0.55 or brighter. The lint fails a poster
   under that line (`R-03b`, live numbers from `poster-lint.mjs --calibrate`).
2. **Interior furniture.** The reference median is about four marks inside a larger block. A block
   with nothing in it is a silhouette. This is not a lint check: a ring of states, a hub of circles
   or a bare fan are right without it.

### What the mark says

Pick the mark from the kind of claim, not from how the component looks.

| The claim is about | The mark | In use |
|---|---|---|
| a quantity held or consumed | a bar inside a frame, or a column of them | `cluster-node-allocatable`, `cluster-cpu-throttling` |
| a proportion of one capacity | one long bar cut into segments | `workloads-pod-resize` |
| a value over time | a jagged trace that ends flat | `workloads-pod-lifecycle-phases`, `cluster-node-failure` |
| a fixed order | a stack, or a ladder of rungs that shorten | `workloads-termination-order`, `cluster-pod-priority-preemption` |
| a cycle with no end | an arc or a broken ring | `workloads-rolling-update`, `cluster-kubelet-reconcile-loop` |
| belonging, scope, ownership | a frame around the thing, the thing furnished | `cluster-static-pods`, `workloads-pod-lifecycle-phases` |
| not real yet, leaving, optional | the same shape at `stroke-dasharray="4 3"` | most reference posters |
| refusal, death, a snap | two crossing lines, or a jag through a frame | `cluster-oom-kill`, `storage-multi-attach-error` |
| a population rather than an object | a field of slivers, a dozen of them | `cluster-list-watch-informers` |
| a roster, a list, a record | three or four short bars stacked inside a block | `cluster-node-conditions` |
| the one that matters | a `fill="currentColor"` bar at 0.9 inside its block | `R-07`, everywhere |

A cylinder for a disk, a cloud for a registry, a circle for a controller are nouns. The poster
says a verb.

## Choosing

1. What is the one sentence? With "and", pick one.
2. Structure (hub, nesting, layers, zones, held object, wall), sequence (chain, ring, branch, fan)
   or quantity (budget bar, gauge, rank ladder)? That picks the family.
3. What kind of claim, and what mark says it? What goes inside each block?
4. The subject gets the accent, and only it.
5. What do the neighbours look like? `poster-lint.mjs <card-id>` compares silhouettes (`R-05`),
   `montage.mjs <card-id>` shows them. If a neighbour uses the family, change the rhythm or the
   family.

## Combinations that already failed here

(`mine.mjs` skips this heading, `Choosing` and `Glyph vocabulary` by name: keep all three exact.)

- A miniature of the card diagram (`R-10`).
- A two-box layout reused because it was to hand.
- Plain circles for components with no circular meaning.
- A packet dot frozen on a wire (`R-09`).
- An arrowhead saying a direction the composition could say (`R-08`).
- More than one accent (`R-07`).
- No bright thing at all (`R-03b`).
- Blocks left as empty outlines.
- An unusual shape reached for to cure a dull poster.
- A barrier bar laid down instead of standing up (see **The wall**).
