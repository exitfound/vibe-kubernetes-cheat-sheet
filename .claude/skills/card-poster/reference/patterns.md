# Poster composition families

Mined from the posters that ship, by rendering them with `tools/montage.mjs` and reading the
grid, not by invention. Each family below is in use today, with the card ids to open before drawing
a new one.

**This file holds no rules.** The rules are `R-01` to `R-12` in `scheme/CANON.md` and they win. What
is here is the vocabulary the rules leave open: which composition says which kind of sentence, how
its rhythm is built, and how it fails.

**How to use it.** Write the sentence first, in words, then pick the family that says that KIND of
sentence, then place the accent. A poster fails when the family is chosen first and the sentence is
bent to fit it.

| Family | The sentence it says | Open these |
|---|---|---|
| Hub and spokes | everything talks to one thing | `cluster-architecture`, `network-pod-localhost` |
| Row of peers, one accented | several equals, and this is the one | `cluster-leader-election`, `storage-ephemeral-storage-eviction` |
| Overlapping sets | two owners, and the subject is what they share | `cluster-server-side-apply` |
| Chain of stages | a thing passes through steps in order | `cluster-admission-chain`, `storage-csi-attach-mount`, `storage-mount-path-chain` |
| Stack of layers | one thing is built out of layers | `storage-container-filesystem`, `storage-mount-path-chain` |
| Stream into a cache | a source feeds a copy that answers | `cluster-list-watch-informers` |
| Two zones compared | two regimes, and they differ | `storage-ephemeral-vs-persistent`, `storage-volume-mode`, `cluster-resource-quota`, `cluster-node-eviction-rate` |
| Ghost zone to solid zone | it moves from there to here, or dies there and lives here | `cluster-node-drain` |
| Branch | one input, two outcomes | `storage-reclaim-policy` |
| Ring of states | it cycles, or it has phases | `storage-pv-lifecycle-phases`, `cluster-kubelet-reconcile-loop` |
| Nested containment | this lives inside that | `cluster-pod-sandbox-cri`, `cluster-static-pods`, `storage-hostpath` |
| Segmented budget bar | one capacity, divided | `cluster-node-allocatable` |
| Flatline into a wait | a signal stops, and what follows is mostly waiting | `cluster-node-failure` |
| Gauge columns | a proportion consumed | `cluster-cpu-throttling` |
| Fan | one source to many, or many into one | `storage-projected-volume`, `storage-configmap-secret-mount`, `network-cni-invocation` |
| The break | something snaps, is crossed out, or is refused | `cluster-oom-kill`, `storage-multi-attach-error` |
| The wall | two things exist and one cannot reach the other | `cluster-node-registration` |
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
the arc. `R-08a` allows ONE chevron here when the whole sentence is the direction of travel, and 11
posters in the catalog have earned that.

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

## Choosing

Ask, in this order:

1. What is the ONE sentence? Write it. If it needs "and", it is two posters and you must pick one.
2. Is the sentence about **structure** (hub, nesting, layers, zones, held object, wall), **sequence**
   (chain, ring, branch, fan) or **quantity** (budget bar, gauge, rank ladder)? That answers the
   family in one step.
3. What is the subject of the sentence? That gets the accent, and only that.
4. What does the sibling on each side look like? Open `montage.mjs` before drawing: if a neighbour
   already uses that family, either differentiate the rhythm or pick the next family.

## Combinations that already failed here

- A faithful miniature of the card diagram (`R-10`). It is unreadable at 200px and it makes the
  poster redundant with the card.
- The two-box layout reused from another card because it was to hand.
- Plain circles standing in for components that have no circular meaning.
- A packet dot frozen on a wire (`R-09`): it reads as a paused animation, not as traffic.
- An arrowhead used to say a direction that the composition could have said (`R-08`).
- More than one accent (`R-07`): with three bright things, none of them is bright.
- A barrier bar laid DOWN instead of standing up. Under the thing it blocks it reads as a shelf
  that thing is standing on, and on a frame's top edge it reads as a lid. See **The wall**.
