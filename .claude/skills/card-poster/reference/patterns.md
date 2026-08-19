# Poster composition families

Mined from the 108 posters that ship, by rendering them with `tools/montage.mjs` and reading the
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
| Row of peers, one accented | several equals, and this is the one | `cluster-server-side-apply`, `storage-ephemeral-storage-eviction` |
| Chain of stages | a thing passes through steps in order | `cluster-admission-webhooks`, `storage-csi-attach-mount`, `storage-mount-path-chain` |
| Stack of layers | one thing is built out of layers | `storage-container-filesystem`, `storage-mount-path-chain` |
| Stream into a cache | a source feeds a copy that answers | `cluster-api-structure` |
| Two zones compared | two regimes, and they differ | `storage-ephemeral-vs-persistent`, `storage-volume-mode`, `cluster-resource-quota` |
| Ghost zone to solid zone | it moves from there to here, or dies there and lives here | `cluster-node-drain`, `cluster-node-failure` |
| Branch | one input, two outcomes | `storage-reclaim-policy` |
| Ring of states | it cycles, or it has phases | `storage-pv-lifecycle-phases`, `cluster-kubelet-sync-loop` |
| Nested containment | this lives inside that | `cluster-pod-sandbox-cri`, `cluster-static-pods`, `storage-hostpath` |
| Segmented budget bar | one capacity, divided | `cluster-node-allocatable` |
| Gauge columns | a proportion consumed | `cluster-cpu-throttling` |
| Fan | one source to many, or many into one | `storage-projected-volume`, `storage-configmap-secret-mount`, `network-cni-invocation` |
| The break | something snaps, is crossed out, or is refused | `cluster-oom-kill`, `cluster-pod-priority-preemption`, `storage-multi-attach-error` |

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

**Build:** two or three bars stacked on the left, a run of small dots or specks on the right, dashed
legs from the bars to the dots. The dots are the only place where an element under 20 units is
correct, because they are a population rather than an object.

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

## Gauge columns

**Says:** a proportion is being consumed, and it is near the top.

**Build:** two or three tall columns (about 40 wide, 90 tall) with an inner fill rising from the
bottom, all at the same level except the subject. Read at 200px: a fill under about 15 units of
height disappears.

## Fan

**Says:** one source reaches many, or many sources land in one place.

**Build:** three or four blocks on one side, a single point or block on the other, straight legs
converging. Keep the legs dashed and the convergence point small.

**Fails when:** the fan has more than four legs, or the legs cross. Both turn into a scribble at
200px.

## The break

**Says:** something is refused, killed, crossed out or snapped.

**Build:** the house vocabulary is an X drawn with two crossing lines over a block, or a jagged
polyline through a frame. One break per poster, on the thing that broke, and the survivors stay
plain.

**Fails when:** the break gets a colour of its own. Everything is `currentColor` here (`R-04`), so a
break reads by shape only.

---

## Choosing

Ask, in this order:

1. What is the ONE sentence? Write it. If it needs "and", it is two posters and you must pick one.
2. Is the sentence about **structure** (hub, nesting, layers, zones), **sequence** (chain, ring,
   branch, fan) or **quantity** (budget bar, gauge)? That answers the family in one step.
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
