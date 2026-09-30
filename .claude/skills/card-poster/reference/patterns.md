# Poster composition families

Mined from the posters that ship, by rendering them with `tools/montage.mjs` and reading the
grid, not by invention. Each family below is in use today, with the card ids to open before drawing
a new one.

**This file holds no rules.** The rules are `R-01` to `R-12` in `scheme/CANON.md` and they win. What
is here is the vocabulary the rules leave open: which composition says which kind of sentence, how
its rhythm is built, and how it fails.

**How to use it.** Write the sentence first, in words, then pick the family that says that KIND of
sentence, then pick the MARKS from the glyph vocabulary near the bottom of this file, then place the
accent. A poster fails when the family is chosen first and the sentence is bent to fit it.

**The family is only half of a poster and it is the half that gets all the attention.** Two posters
in the same family look nothing alike when their blocks are furnished differently, and two posters
in different families look identical when both are four empty outlines. See **Glyph vocabulary**.

| Family | The sentence it says | Open these |
|---|---|---|
| Hub and spokes | everything talks to one thing | `cluster-architecture`, `network-pod-localhost` |
| Row of peers, one accented | several equals, and this is the one | `cluster-leader-election`, `storage-csi-architecture` |
| Overlapping sets | two owners, and the subject is what they share | `cluster-server-side-apply`, `storage-mount-path-chain` |
| Chain of stages | a thing passes through steps in order | `cluster-admission-chain`, `storage-csi-attach-mount`, `storage-csi-ephemeral-volume` |
| Stack of layers | one thing is built out of layers | `storage-container-filesystem` (an offset cascade of equal sheets, each hiding most of the one behind), `storage-hostpath` (equal strata pierced by one shaft, ordered by exposure) |
| Stream into a cache | a source feeds a copy that answers | `cluster-list-watch-informers` |
| Two zones compared | two regimes, and they differ | `storage-volume-mode`, `cluster-resource-quota`, `cluster-node-eviction-rate` |
| Ghost zone to solid zone | it moves from there to here, or dies there and lives here | `cluster-node-drain` |
| Branch | one input, two outcomes | `storage-reclaim-policy`, `storage-configmap-secret-mount` (a switch: one blade on a pivot between two whole versions) |
| Ring of states | it cycles, or it has phases | `storage-pv-lifecycle-phases`, `cluster-kubelet-reconcile-loop` |
| Nested containment | this lives inside that | `cluster-pod-sandbox-cri`, `storage-ephemeral-storage-eviction` (the container frame inside the Pod frame, with the emptyDir share spilling out through a gap in the Pod wall) |
| Segmented budget bar | one capacity, divided | `cluster-node-allocatable` |
| Flatline into a wait | a signal stops, and what follows is mostly waiting | `cluster-node-failure` |
| Gauge columns | a proportion consumed | `cluster-cpu-throttling` |
| Fan | one source to many, or many into one | `workloads-env-before-pid-1` |
| The break | something snaps, is crossed out, or is refused | `cluster-oom-kill`, `storage-multi-attach-error` |
| The wall | two things exist and one cannot reach the other | `cluster-node-registration`, `storage-volumeattachment` (the bar is one FIELD: the device is already on the Node, the Pod waits on the other side) |
| Rank ladder | several things are ordered, and the order decides | `cluster-pod-priority-preemption` |
| Held object | it is marked to go, and this is what keeps it | `cluster-cascading-deletion` |

---

## Hub and spokes

**Says:** one component is the centre and the others exist in relation to it.

**Build:** a circle at (160, 90) with `r` 20 to 24, three or four blocks around it on the two axes,
dashed legs between. The centre carries the heavier stroke (2 against 1.4) and the brighter fill,
which is this family's accent mechanism: it **weights by LINE, not by an accent bar**.

**Fails when:** the spokes get labels or a fifth block appears. Four is the ceiling, and the moment
the ring stops being obvious the poster reads as a small diagram.

## Row of peers, one accented

**Says:** here are three equals, and the story is about this one.

**Build:** three blocks on one baseline, 76 to 80 units wide, 40 to 50 tall, equal gaps. The subject
carries the house accent from `R-07`: a `rect` with `fill="currentColor"` at `opacity="0.9"` INSIDE
the block, with the losers carrying the same bar at 0.3.

**Fails when:** the accent goes on the whole shape instead of the bar inside it. That is a different
poster, and it is the single most common way the house idiom gets broken.

## Overlapping sets

**Says:** two actors each hold a set, and the thing the card is about is the region they share.

**Build:** two frames of the same size, offset diagonally so they cross near the canvas centre, each
at fill 0.04 and each carrying its own 0.3 bar in its EXCLUSIVE part. The shared region gets no
frame of its own: it is redrawn as a path tracing the two outlines, sharp at the crossing corners
and rounded where a corner belongs to a frame, and it takes the heavier stroke (2) plus the one 0.9
accent bar. This family weights by LINE as well as by bar, because the subject has no fill of its
own to brighten.

**Fails when:** the two frames are offset so far that the overlap is a sliver, or so little that the
composition reads as one frame with a shadow. And when the dim bars are centred in their frames:
they then land exactly on the other frame's edge and read as sitting on its line, so pull them out
toward the far corners, mirror-symmetric about the canvas centre.

## Chain of stages

**Says:** a request, a volume or an object passes through steps in a fixed order.

**Build:** three to five small blocks left to right with short dashed legs between them, all on one
baseline. Direction comes from the ORDER and from the legs, never from an arrowhead (`R-08`). Vary
the glyph per stage when the stages are different in kind: a list, a wave, a check, a cylinder.

**Fails when:** the stages are the same rectangle five times. Then it is a row, not a chain, and the
reader gets no sense of progression.

## Stack of layers

**Says:** one thing is composed of layers, and the top one is where the change lands.

**Build:** three to five bars of the same width stacked with a 4 to 6 unit gap, brightest at the
layer the card is about, the rest at 0.03 to 0.04.

**Fails when:** all layers carry the same fill. A stack with no ramp is a texture.

## Stream into a cache

**Says:** a source pushes changes into a local copy that answers questions.

**Build:** one framed block on the left dense with stacked bars, so the copy reads as a MASS and the
size contrast carries the sentence, and a loose drift of SLIVERS on the right, with one dashed leg
from the accented bar out toward them. A sliver is a rounded rect about half the height of a cache
row and a fifth to a quarter of its length, which says the picture twice: what travels the wire is a
fragment of what the block holds whole, and it rhymes with the bars instead of standing beside them
as unrelated marks. This is the only place where an element under 20 units is correct, because the
stream is a population rather than an object, but it needs volume and area: a dozen slivers, and
five or six of anything reads as leftovers rather than as a stream.

Grade them in three bands by distance from the leg (roughly 0.7, 0.5, 0.3) and let the field fan
wider going right, so the population has a direction instead of being a blob. Circles were the
original glyph here and were replaced: at the 200px the grid renders, radius 3 to 4 covers about a
third of a sliver's area and a field of them reads pale and inert whatever the count. A regular grid
of either reads as a matrix. Keep the leg's own line CLEAR for the whole field, not just near the
block: a mark on it reads as a ball parked at the end of a wire, and a sliver on it reads as the
wire simply continuing, which is worse.

## Two zones compared

**Says:** two regimes exist side by side and behave differently.

**Build:** the canvas split about x=160, a thin vertical rule or a gap between them, each side
carrying the same skeleton so the DIFFERENCE is the only thing that moves. Accent on the side the
card is about.

**Fails when:** the two sides are drawn with different vocabularies. The reader then compares
drawings instead of behaviours.

**The split can run along Y instead of X**, two zones stacked on one x and fed from a shared source
on the left. Take the stacked reading when the card's own diagram already splits left and right, or
when a grid neighbour does: side by side, the two would read as cousins at 200px. Stacked, the
reader compares straight DOWN one x rather than tracing which column is which, which is also what
makes it survive a comparison of more than two things later. `workloads-deployment-strategy` is the
first stacked one and the family's first user outside storage and cluster.

**One zone may hold nothing, and that is the hardest half to draw.** An empty zone must be a
POSITIVE mark: the same frame at the same weight with dashed hollows where the other zone has filled
cells. Do not carry the void on a dashed FRAME while the full zone gets a solid one, because a dash
is the first thing 200px eats and the reader is then left with one drawn zone and one that looks
unrendered. Ink against no ink inside two identical frames survives any downsample.

## Ghost zone to solid zone

**Says:** it leaves there and arrives here, or it fails there and survives here.

**Build:** the losing side dashed at 0.02 to 0.03 with its rows ghosted at `opacity="0.3"`, the
winning side solid at 0.06 with its rows at 0.10, and one dashed leg between the two frames.

**Fails when:** the ghost side is TOO faint to read at 200px. Check on the actual-size montage, not
on the source.

## Branch

**Says:** one input, two possible outcomes.

**Build:** one block at the top or left, two below or right, the taken outcome accented and the
other at the sibling fill. No arrowheads: the fork reads from the geometry.

## Ring of states

**Says:** it cycles, or it moves through phases and comes back.

**Build:** four or five stations on a circle of radius 55 to 70 centred at (160, 90), joined by arcs
that leave a visible gap at the station. The accent goes on the station the card is about, not on
the arc. `R-08a` allows ONE chevron here when the whole sentence is the direction of travel, and the
registry in `poster-lint.mjs` names the two posters that have earned it.

**Fails when:** the ring closes into a solid circle. A perfect annulus reads as a shape, not a loop.

## Nested containment

**Says:** this lives inside that, and the boundary is the point.

**Build:** an outer rounded rect at 0.04, one or two inner blocks at 0.06 to 0.10, and a small
circle if a third thing is held. Keep the outer margin even: 20 to 24 units on all four sides.

**Fails when:** the outer frame is dashed AND the inner blocks are dashed. Then nothing is real.

## Segmented budget bar

**Says:** one capacity, cut into named parts, and this part is what survives.

**Build:** a single wide bar (about 240 units) divided by thin vertical rules into three or four
segments, the surviving segment accented and usually the widest. This is the only family where a
very wide, short shape is correct.

## Flatline into a wait

**Says:** a signal stops, and what follows is mostly waiting.

**Build:** a trace on the left third at stroke 2, two beats and then flat, running INTO the left face
of the track on one horizontal spine (y=90). The track is two or three segments filling most of the
canvas height (100 of 180), touching along their shared edges rather than spaced. The accent goes in
the LONGEST segment at 0.9 and the shorter ones carry the same bar at 0.3. Keep the wait about
twice the trace (190 against 98 on the card that runs it): the proportion is the sentence.

**Not to be confused with Segmented budget bar**, which divides a CAPACITY. Here the bar is a
DURATION, and the trace is what makes it read as time rather than as space. Drop the trace and the
picture goes back to saying "one thing, cut into parts".

**Fails when:** the beats are drawn at full amplitude. They out-shout the accent, which belongs to
the wait and not to the event that started it (`R-03`), so the trace takes an `opacity` under 1.
It also fails when the trace is joined to the track by dashed legs instead of running into it on one
spine: trace plus two legs plus track reads as a hollow rectangle with a squiggle beside it.

## Gauge columns

**Says:** a proportion is being consumed, and it is near the top.

**Build:** two or three tall columns (about 40 wide, 90 tall) with an inner fill rising from the
bottom, all at the same level except the subject. Read at 200px: a fill under about 15 units of
height disappears.

**Not to be confused with Rank ladder**, which uses column geometry for an ORDERING rather than a
fraction: there the whole column height is the value and there is no inner fill at all.

## Stepped counts

**Says:** a quantity moves between two states, and the two states are a COUNT of discrete things
rather than a proportion.

**Build:** two stacks of unit cells on one baseline, the cells identical and separated by a real
gap, crossed by a single horizontal rule at the reference value. One stack sits at the rule and the
other stands one cell above it. Accent at 0.9 on the single cell that breaks the rule, every other
cell carrying the same bar at 0.3.

**Not to be confused with Gauge columns**, where the value is a fill height inside a column, or with
Rank ladder, where height is an ordering. Here the value is how many cells you can COUNT, so the
cells have to separate at true size: `workloads-rolling-update` measured 17.5px cells on 7.5px gaps.

**Fails when:** there are three stacks instead of two. Three equal-based stacks of near-equal height
read as a GRID with something floating above it, and the counts become a table rather than three
quantities. That was a real failure on the first draw of `workloads-rolling-update` and the fix was
to drop to the two states that differ, never to shrink the cells until three fit.

## Fan

**Says:** one source reaches many, or many sources land in one place.

**Build:** three or four blocks on one side, a single point or block on the other, straight legs
converging. Keep the legs dashed and the convergence point small.

**Fails when:** the fan has more than four legs, or the legs cross. Both turn into a scribble at
200px.

## Rank ladder

**Says:** several things are ordered, and the order is what decides the outcome.

**Build:** columns on ONE shared baseline, where the whole column height is the value and there is
no inner fill. Three or four of them in a MONOTONIC staircase with an even step (20 units reads
cleanly at 200px), because a staircase is a ranking and three boxes of different sizes are only a
set. The subject stands apart from the others, outside the frame that holds them, and is the tallest
by a clear margin. Accent bar at 0.9 inside the subject, the same bar at 0.3 inside the ones it
outranks, and the loser at the bottom of the ladder takes a break glyph instead of a bar.

**Fails when:** height gets read as SIZE or as resource usage rather than as rank. Two things guard
against it: the subject standing outside its container, and the gap between the subject and the
tallest of the ranked staying wide. Close that gap to parity and the sentence goes. Do not order the
ranked ones non-monotonically to shorten a leg: the ladder is the whole argument.

## Stepped rank

**Says:** one object moved from one rank to another, and it is the same object.

**Build:** three EQUAL blocks at the house size, no shared baseline and no inner fill, each one
higher than the last so position alone carries the rank. One rung is a dashed empty outline where a
block used to be, and a solid leg runs from that vacancy to the block that now holds the higher
rank. Accent at 0.9 inside the block on the top rung.

**Not to be confused with Rank ladder**, which is columns on ONE baseline where HEIGHT is the value.
Here the blocks are identical and only their POSITION moves, which is what lets the drawing say the
object did not change while its rank did. Calling this one a rank ladder falsifies that entry and
invites a later reader to "correct" the blocks into columns.

**Fails when:** the vacancy and the leg are drawn at the same weight as each other and as the
blocks. They then read as one run of plumbing under the drawing rather than as one object's move,
which is what happened on the first draw of `workloads-deployment-rollback`. The blocks' own rise
states the rank, so a stepped profile line under them is redundant and it is what to delete. Also
fails at more than three rungs: five blocks at the house size need a NEGATIVE gap on a 320 canvas,
so the rung count gives way, never the block size.

## Held object

**Says:** it is marked to go, and something is keeping it here.

**Build:** two blocks of the SAME size either side of one centre line. Left is the object, a solid
block at 0.10 with stroke 2 standing INSIDE a dashed stamp of the same footprint as the right-hand
block: solid within dashed is the sentence, marked but present. Right is what holds it, a frame of
three short rows, the ones that have cleared ghosted, dashed and struck with a single horizontal
line, the one still holding solid and carrying the only accent. One short dashed leg between the two
outer faces, on the centre line, so it points at the live row.

**Fails when:** the object is drawn as a ghost. A faded object says it is already gone, which is the
opposite sentence and the reason the family exists. Put the live row in the MIDDLE rather than at
the top or bottom of the list: that is what lands the leg, the accent and both block centres on one
horizontal spine, and a strike-through on a middle row would otherwise sit on the leg's own line.

## The break

**Says:** something is refused, killed, crossed out or snapped.

**Build:** the house vocabulary is an X drawn with two crossing lines over a block, or a jagged
polyline through a frame. One break per poster, on the thing that broke, and the survivors stay
plain.

**Fails when:** the break gets a colour of its own. Everything is `currentColor` here (`R-04`), so a
break reads by shape only.

## The wall

**Says:** two things both exist, and one of them cannot get to the other. It is the break's
sibling: the break is about something that HAPPENED to a thing, the wall about something that is
being HELD OFF, so nothing is damaged and the survivors are both intact.

**Build:** two blocks on one baseline with a gap between them, and one bar standing UPRIGHT in that
gap, `fill="currentColor"` at 0.9, which is the poster's whole accent. The bar overhangs both
blocks top and bottom so it cannot be read as belonging to either. The two blocks differ in weight,
because the sentence has a subject: the thing being kept out is the smaller and lighter one.

**The bar is upright and that is the family, not a preference.** Laid down under the upper block it
reads as a SHELF that block is standing on, which inverts the sentence, and moved onto a frame's top
edge it reads as a LID and strands the other block in an empty band. Only the upright reads as a
barrier, because nothing about gravity supports it. `cluster-node-registration` was drawn in all
three and the record keeps the two that failed.

**Fails when:** the two blocks are given the same inner furniture. A wall between two frames each
holding equal slabs is a silhouette several other families already produce, so give the two sides
different insides: a roster on one, a ragged written record on the other, or nothing at all on the
lighter one.

---

## Glyph vocabulary

The family says how the elements are ARRANGED. This section says what the elements are MADE OF, and
it is the axis that decides whether a category reads as designed or as one drawing repeated.

**Measured 2026-09-11, and the first surprise is how small the alphabet is.** Across the 60
reference posters, 5 carry an arc, 2 carry a jagged trace, 6 carry a circle and 2 carry a polyline.
Everything else is rectangles, straight lines, dashes and one heavy stroke. So the cure for a dull
poster is NEVER a more exotic shape. A poster assembled out of unusual marks is the bag-of-mismatched-details
failure, which is a worse picture than the dull one it replaced. Two things separate the
reference set from the weak categories, and both are boring:

1. **Ink.** The reference set lands a mark at 0.55 or brighter on 57 of its 60 posters. Storage did
   it on 0 of 31 at that date, with 0.20 its brightest mark anywhere, and does it on 15 of 35 today
   (`poster-lint.mjs --calibrate`, 2026-09-19), its median brightest mark still 0.17. The lint fails
   a poster under that line (`R-03b`), and that one line is most of the gap.
2. **Interior furniture.** The reference median is 4 marks sitting INSIDE a larger block. Storage's
   median was 1 at that date, and 12 of its 31 posters then had none at all. A block with nothing in it is a
   silhouette, and four silhouettes is the same poster every category already drew. The furniture is
   what makes a Node frame read as a Node holding Pods rather than as a rounded rectangle.

   This is deliberately not a lint check. 6 of the 60 reference posters carry no furniture and are
   right to (a ring of states, a hub of circles, a bare fan). It is a question to ask, not a rule.

### What the mark says

Pick the mark from the KIND of claim, not from what the component looks like in real life. A
PersistentVolume is not obliged to be a cylinder, and drawing it as one three cards in a row is how
storage lost its variety.

| The claim is about | The mark | In use |
|---|---|---|
| a quantity held or consumed | a bar inside a frame, or a column of them | `cluster-node-allocatable`, `cluster-cpu-throttling` |
| a proportion of one capacity | one long bar cut into segments | `workloads-pod-resize` |
| a value over time | a jagged trace that ends flat | `workloads-pod-lifecycle-phases`, `cluster-node-failure` |
| a fixed order | a stack, or a ladder of rungs that shorten | `workloads-termination-order`, `cluster-pod-priority-preemption` |
| a cycle with no end | an arc or a broken ring | `workloads-rolling-update`, `cluster-kubelet-reconcile-loop` |
| belonging, scope, ownership | a frame around the thing, with the thing furnished | `cluster-static-pods`, `workloads-pod-lifecycle-phases` |
| not real yet, leaving, optional | the same shape at `stroke-dasharray="4 3"` | 46 of the 60 reference posters |
| refusal, death, a snap | two crossing lines, or a jag through a frame | `cluster-oom-kill`, `storage-multi-attach-error` |
| a population rather than an object | a field of slivers, a dozen of them | `cluster-list-watch-informers` |
| a roster, a list, a record | three or four short bars stacked inside a block | `cluster-node-conditions` |
| the one that matters | a `fill="currentColor"` bar at 0.9 inside its block | `R-07`, everywhere |

### The three questions this section exists to force

- **What is inside each block?** If the honest answer is "nothing", the poster is a set of
  silhouettes and the family is carrying the whole picture on its own.
- **Does the mark say the claim, or does it say the component?** A cylinder for a disk, a cloud for a
  registry and a circle for a controller are pictures of NOUNS. The poster has to say a VERB.
- **Which single mark is at full brightness?** If the answer is none, the poster will fail `R-03b`
  and, more to the point, a reader's eye will land nowhere.

---

## Choosing

Ask, in this order:

1. What is the ONE sentence? Write it. If it needs "and", it is two posters and you must pick one.
2. Is the sentence about **structure** (hub, nesting, layers, zones, held object, wall), **sequence**
   (chain, ring, branch, fan) or **quantity** (budget bar, gauge, rank ladder)? That answers the
   family in one step.
3. What KIND of claim is it, and what mark says that kind? Read **Glyph vocabulary**, and answer
   what goes inside each block while you are there. This is the step that gets skipped.
4. What is the subject of the sentence? That gets the accent, at full brightness, and only that.
5. What does the sibling on each side look like? `poster-lint.mjs <card-id>` answers this as `R-05`
   by comparing silhouettes, and `montage.mjs <card-id>` shows you the two. If a neighbour already
   uses that family, either differentiate the rhythm or pick the next family.

## Combinations that already failed here

- A faithful miniature of the card diagram (`R-10`). It is unreadable at 200px and it makes the
  poster redundant with the card.
- The two-box layout reused from another card because it was to hand.
- Plain circles standing in for components that have no circular meaning.
- A packet dot frozen on a wire (`R-09`): it reads as a paused animation, not as traffic.
- An arrowhead used to say a direction that the composition could have said (`R-08`).
- More than one accent (`R-07`): with three bright things, none of them is bright.
- NO bright thing at all (`R-03b`). A drawing that tops out at 10 percent white reads as absent on
  the grid however correct its composition is, and it is the single most common defect in the
  catalog: 44 of the 71 non-reference posters fail this line.
- Blocks left as empty outlines. Four silhouettes is a poster every category has already drawn, and
  the furniture inside them is what makes this one this one. See **Glyph vocabulary**.
- Reaching for an unusual shape to cure a dull poster. The reference set has 3 arcs and 1 trace in
  60 posters: the cure is ink and furniture, not a new glyph.
- A barrier bar laid DOWN instead of standing up. Under the thing it blocks it reads as a shelf
  that thing is standing on, and on a frame's top edge it reads as a lid. See **The wall**.
