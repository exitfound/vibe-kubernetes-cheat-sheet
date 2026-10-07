# Diagram composition families

Mined from the shipped cards by reading every `SCENE.parts` with `tools/kin.mjs` and opening the
frames it grouped. Each family is in use, with the cards to open before drawing a new one.

This file holds no rules: `scheme/CANON.md` and the folder contracts do, and they win. It is the
vocabulary they leave open, the diagram twin of `card-poster/reference/patterns.md`.
`kin.mjs` is the live census. When a card lands in a composition this file does not name, say so
in the deliverable: the library is the user's to extend.

## Part one: what never varies

House grammar. A deviation is a `DEVIATES` line in the record, not a way to be interesting.

| Fixed | Where it is stated |
|---|---|
| the camera: one `viewBox`, one `preserveAspectRatio` | `S-04`, `S-05` |
| the L-shaped safe zone the panel leaves | `L-01`, `L-02`, `L-03` |
| the category tint, the role bound once in the kit | `C-01`, `C-02`, `S-42` |
| what a Pod is built from, and that only Pods pulse | `S-08a`, `M-01`, `M-03` |
| the opacity vocabulary | `C-04` to `C-09` |
| lane grammar: orthogonal, face midpoints, arrowhead only where a ball rides | `L-09`, `L-11`, `A-05` |
| ball speed, arrival ripple, pulse order | `M-12`, `M-14`, `M-15`, `M-16` |
| chip anatomy, every step states every chip | `P-01`, `P-07` |
| the z-order | `S-07` |
| step 0 draws nothing, the poster previews step 1 | `S-09`, `D-14` |

Everything else varies. Cluster and workloads carry an A/B/C column preset, storage a vertical
stack, networking no layout grammar of its own.

## Part two: the families

| Family | The sentence it says | Open these |
|---|---|---|
| Actor strip over a Node floor | someone up there acts, and it lands on a Node down here | `cluster-scheduler-decision`, `workloads-probes`, `cluster-node-drain` |
| Ladder and chip column | a pipeline of named stages, with the state it moves beside it | `cluster-admission-chain`, `workloads-init-containers-and-sidecars` |
| Mirrored flow line | traffic goes out along one lane and comes back along another | `network-service-clusterip`, `network-conntrack-nat` |
| Vertical stack on an identity spine | this thing belongs to that thing, and data moves between them | `storage-pvc-binding`, `storage-dynamic-provisioning`, `storage-generic-ephemeral-volume` |
| Two zones compared | two regimes, side by side, and they differ | `network-kube-proxy-modes`, `cluster-resource-quota` |
| Peer ring | several equals, and one of them is currently the one | `cluster-etcd-raft`, `cluster-leader-election` |
| Fan to N | one source, several drawn alternatives, one taken | `network-service-clusterip` |
| Multi-Node band | the same thing on several Nodes, and they are not alike | `workloads-daemonset`, `network-loadbalancer-without-cloud`, `storage-volume-attach-limits`, `storage-emptydir` |
| Nested containment | this lives inside that, which lives inside that | `cluster-pod-cgroup-hierarchy`, `network-namespaces`, `storage-hostpath` |
| Precedence grid | which stacked source answers depends on row order, per key | `storage-container-filesystem` |
| Instrument panel | a quantity, a budget or a countdown, drawn as a measure | `cluster-cpu-throttling`, `cluster-node-allocatable`, `cluster-image-container-gc` |
| Object board, no Pod | the story is about API objects and no Pod is in it | `storage-pv-lifecycle-phases`, `cluster-server-side-apply`, `storage-reclaim-policy` |
| Chain into a store | a request passes stages and ends in something that keeps it | `cluster-admission-chain`, `cluster-object-create-path` |
| Hub and spokes | everything talks to one thing | `cluster-architecture` |
| Branch | one input, two outcomes, one of them counterfactual | `storage-reclaim-policy`, `storage-detach-on-node-failure`, `network-dns-ndots` |
| Timeline | time is the axis, and most of the card is waiting | `cluster-node-failure`, `cluster-node-eviction-rate`, `storage-projected-volume` |

### Actor strip over a Node floor

**Build:** an actor row on `TOP_Y`, clear of the panel and centred, a corridor down the middle, a
`node()` frame on the floor with the Pods inside. Frame sizing is per category (`L-23`). The lane
leaves the box that acts (`A-09`).

**Fails when:** every card in the section is this, the most crowded arrangement in the catalog. A
subject with no control-plane actor gets an actor row out of habit.

### Ladder and chip column

**Build:** a `P.chain` of five or six rows in one column, value chips in the other, both starting
on one line below the panel (`L-08a`, the category preset). The chain is lit by index per step.

**Fails when:** the rows restate the narration. A row is a three or four word label. A ladder plus
one Pod is a list with decoration.

### Mirrored flow line

**Build:** one horizontal centre line, mirrored, a lane pair split by a small `LANE_DY` so the
return has its own lane (`A-03`). Addresses ride the ball (`NET.T-01`). A rewrite inside a box is a
fade at one edge and a re-emergence at the far edge (`A-19`).

**Fails when:** the return re-uses the outbound lane, or the mirror is perfect on a mechanism that
is not symmetric.

### Vertical stack on an identity spine

**Build:** `STO.L-01`. Pod on top with its containers, the claim, the disk below, one centre line.
A line nothing travels is the markerless identity spine (`STO.A-01`). A line a ball rides is a
mount lane with its arrowhead at the receiving end (`STO.A-02`). One-way traffic gets one lane, a
round trip a lane each way.

**Fails when:** a line nothing rides grows an arrowhead, or a second disk appears without a second
reason.

### Two zones compared

**Build:** two halves split at the centre, the same structure on each side, a caption per side. A
side that does not apply yet is dim rather than absent (`C-14`).

**Fails when:** the halves differ in size (reads as importance), or a third regime is squeezed in.
Switch one half with a step instead.

### Peer ring

**Build:** three or more identical members on an arc or a row, joined by relationship lines, the
current holder highlighted. Any size difference reads as rank.

**Fails when:** the relationships are arrows. `A-06` decides per step whether a line is a lane.

### Fan to N

**Build:** `NET.A-03`. Every destination gets its own drawn lane, even unridden. A vertical bus at a
fixed x keeps the legs orthogonal.

**Fails when:** it has more than three or four legs. Then one lane into a box labelled with the
count says it better.

### Multi-Node band

**Build:** two or three `node()` frames across the width, one Pod each, sized off one formula.
States differ by opacity phase, never size. The leftmost frame label sits where the panel is
(`L-03`).

**Fails when:** the Nodes stay identical for the whole card.

### Nested containment

**Build:** rectangles inside rectangles, three levels at most, each labelled with a visible margin.
The innermost thing is the subject: smallest box, brightest state.

**Fails when:** the margins are equal at every level. Vary the inset.

### Precedence grid

**Build:** rows are layers in precedence order, columns are keys, a cell only where that layer
holds that key. Lanes run inside their column through empty slots.

**Fails when:** every slot is filled. A full grid is a table.

### Instrument panel

**Build:** a hand-forged track with a fill, a ruler with threshold marks, a row of slots, or a
ladder of rungs, through `P.raw`. Every raw factory names its ref keys as literals.

**Fails when:** a chip and a bar show the same value and disagree at some step.

### Object board, no Pod

**Build:** boxes for objects, relationship lines for references, each object's state in its
sublabel. A Pod is not the price of admission.

**Fails when:** the objects sit in one row because there are four. Reference direction decides who
sits above whom.

### Chain into a store

**Build:** the stages as a row or chain, the store as a `cylinder()` set apart at the end, the write
as the last hop.

**Fails when:** the store is drawn the size of a stage.

### Hub and spokes

**Build:** the hub at the canvas centre, everything around it, no traffic between spokes. It says
the hub is the only route, which is true of very few subjects.

**Fails when:** one lane skips the hub.

### Branch

**Build:** a trunk to a decision block, then two legs. The leg not taken this step is dim. A step
that draws a state which never happened carries a caption (`T-35`).

**Fails when:** both legs are drawn as equals when one is the ordinary case.

### Timeline

**Build:** a horizontal ruler with marks at the deadlines, the subject riding it, chips carrying the
counters. The waiting gets the width.

**Fails when:** the marks are unlabelled.

## Part three: the difference levers

When the family is right and the card still looks like its neighbour, move these, cheapest first.
`kin.mjs` reports each per section with the catalog-wide count.

| Lever | The move | Cost |
|---|---|---|
| band count | two tiers instead of four, or four instead of two | free |
| chip layout | a column, a wide strip, a grid of two rows | free |
| chip count | four is the default. Six says state, one says picture | free |
| actor count | one actor instead of three, or none | free |
| frame count | no `node()` frame, one, or three | cheap, but a frame is 1000 units wide |
| Pod count | none, one, a row of four | cheap |
| lane topology | a pair, a fan, a bus, a ring, a single trunk | cheap, but a timing change (`A-11`, `M-20`) |
| a disk | a `cylinder()` says persistence | cheap |
| a standing caption | a `P.tag` true on every step | cheap |
| a group | wrapping an assembly so it fades as one | cheap |
| a raw instrument | a bar, a ruler, a rung ladder, a row of slots | expensive, the most distinctive |
| step count | four or eight against the usual six | expensive: every step is narration to repay |

Two cards may share a signature and look nothing alike, and the reverse. The signature starts the
argument, the montage settles it.

## Part four: how a card ends up looking like its neighbour

- **The exemplar copied whole.** Copy its shape, not its arrangement.
- **The composition chosen before the sentence.** The tell is a block no step mentions (`T-21`).
- **The actor row added out of habit.**
- **Four chips because the last card had four.**
- **A ladder used as a summary** of the narrations.
- **Symmetry applied to an asymmetric mechanism.**
- **Differences only in the strings.** Same blocks, lanes and bands, different labels. The signature
  census catches it, and every check in the suite passes it.
