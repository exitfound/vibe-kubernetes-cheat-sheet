# Diagram composition families

Mined from the cards that ship, by reading every `SCENE.parts` as data with
`tools/kin.mjs` and opening the rendered frames of the ones it grouped together. Each family below
is in use today, with the card ids to open before drawing a new one.

**This file holds no rules.** The rules are `scheme/CANON.md` and the four folder contracts, and
they win. What is here is the vocabulary those rules leave open: which arrangement of blocks says
which kind of sentence, what its rhythm is built from, and how it fails. It is the diagram twin of
`card-poster/reference/patterns.md`, which does the same job for the 320x180 grid still.

**It is a SNAPSHOT and nothing re-mines it.** `tools/kin.mjs` recomputes the counts on demand, so
read a number here as an example and the tool as the census. When a card lands in a composition
this file does not name, say so in the deliverable rather than adding it here: the library is the
user's to extend.

---

## Part one: what never varies

A card is recognisable as a card of this catalog before a reader has read a word of it, and that
recognition is worth more than any single card's originality. Everything in this list is house
grammar. Deviating from one is a deviation to declare in the record, not a way to be interesting.

| Fixed | Where it is stated |
|---|---|
| the camera: one `viewBox`, one `preserveAspectRatio`, no card owns it | `S-04`, `S-05` |
| the L-shaped safe zone the narration panel leaves | `L-01`, `L-02`, `L-03` |
| the category tint, and the role bound once in the kit | `C-01`, `C-02`, `S-42` |
| what a Pod is built from, and that only Pods pulse | `S-08a`, `M-01`, `M-03` |
| the opacity vocabulary: five phases and nothing between them | `C-04` to `C-09` |
| lane grammar: orthogonal, face midpoints, arrowhead only where a ball rides | `L-09`, `L-11`, `A-05` |
| ball speed, arrival ripple, pulse order | `M-12`, `M-14`, `M-15`, `M-16` |
| chip anatomy, and that every step states every chip | `P-01`, `P-07` |
| the z-order: bodies, wires, chips, packet layer, then whatever must ride above the ball | `S-07` |
| step 0 draws nothing, the poster previews step 1 | `S-09`, `D-14` |

**What varies is everything else**, and the four folder contracts already prove it: cluster and
workloads carry an A/B/C column preset, storage carries a vertical stack and no preset at all, and
networking carries no geometry grammar of its own by measurement rather than by omission. A card is
free to arrange its blocks the way its subject wants them.

---

## Part two: the families

| Family | The sentence it says | Open these |
|---|---|---|
| Actor strip over a Node floor | someone up there acts, and it lands on a Node down here | `cluster-scheduler-decision`, `workloads-probes`, `cluster-node-drain` |
| Ladder and chip column | a pipeline of named stages, with the state it moves beside it | `workloads-probes`, `cluster-admission-chain`, `workloads-container-states` |
| Mirrored flow line | traffic goes out along one lane and comes back along another | `network-service-clusterip`, `network-conntrack-nat`, `network-service-ports` |
| Vertical stack on an identity spine | this thing belongs to that thing, and data moves between them | `storage-volume-model`, `storage-hostpath`, `storage-emptydir` |
| Two zones compared | two regimes, side by side, and they differ | `storage-ephemeral-vs-persistent`, `network-kube-proxy-modes`, `cluster-resource-quota` |
| Peer ring | several equals, and one of them is currently the one | `cluster-etcd-raft`, `cluster-leader-election` |
| Fan to N | one source, several drawn alternatives, one taken | `network-service-clusterip`, `storage-projected-volume`, `network-cni-invocation` |
| Multi-Node band | the same thing on several Nodes, and they are not alike | `workloads-daemonset`, `network-loadbalancer-bare-metal`, `storage-volume-attach-limits` |
| Nested containment | this lives inside that, which lives inside that | `cluster-pod-cgroup-hierarchy`, `network-namespaces`, `storage-container-filesystem` |
| Instrument panel | a quantity, a budget or a countdown, drawn as a measure | `cluster-cpu-throttling`, `cluster-node-allocatable`, `cluster-image-container-gc` |
| Object board, no Pod | the story is about API objects and no Pod is in it | `storage-pv-lifecycle-phases`, `cluster-server-side-apply`, `storage-reclaim-policy` |
| Chain into a store | a request passes stages and ends in something that keeps it | `cluster-admission-chain`, `cluster-object-create-path` |
| Hub and spokes | everything talks to one thing | `cluster-architecture` |
| Branch | one input, two outcomes, and one of them is counterfactual | `storage-reclaim-policy`, `storage-volume-detach-on-node-loss`, `network-dns-ndots` |
| Timeline | time is the axis, and most of the card is waiting | `cluster-node-failure`, `cluster-node-eviction-rate` |

---

### Actor strip over a Node floor

**Says:** a control-plane actor decides something and a Node carries it out.

**Build:** an actor row on `TOP_Y`, clear of the panel and centred on the canvas centre, a corridor
down the middle, and a `node()` frame on the floor with the Pods inside it. Frame sizing is per
category (`L-23`), and the lane leaves the box that ACTS rather than the leftmost one (`A-09`).

**Fails when:** every card in the section is this. It is the single most crowded arrangement in the
catalog, and `kin.mjs` prints the sections where it has become the default. When the subject does
not have a control-plane actor in it, an actor row is a habit rather than a composition.

### Ladder and chip column

**Says:** a named sequence of stages, and here is the state each one leaves behind.

**Build:** a `P.chain` of five or six rows in one column, value chips in the other, both starting on
one line below the panel. Which column holds which is `L-08a` and the category preset. The chain is
lit by index per step, which is what turns a static list into a position in a story.

**Fails when:** the rows restate the narration. A chain row is a LABEL for a stage, three or four
words, and a row that reads like a sentence competes with the panel that already carries one. It
also fails when a card carries a chain with nothing else to say: a ladder plus one Pod is a list
with decoration, and the reader gets the same thing from the panel alone.

### Mirrored flow line

**Says:** a packet goes out and an answer comes home.

**Build:** one horizontal centre line, everything mirrored about it, a lane pair split by a small
`LANE_DY` so the return has its own lane (`A-03`). Addresses ride the ball rather than sitting as
wire text (`NET.T-01`), and a rewrite inside a box is drawn as a fade at one edge and a
re-emergence at the far edge (`A-19`).

**Fails when:** the return re-uses the outbound lane, which reads as the query bouncing. And when
the mirror is perfect on a card whose two halves are NOT symmetric: a symmetric drawing of an
asymmetric mechanism is a lie the composition tells before any word is read.

### Vertical stack on an identity spine

**Says:** this volume belongs to this Pod, and containers reach it.

**Build:** `STO.L-01`. Pod on top with its containers inside, the disk below, a dashed markerless
spine between them saying ownership, and one L-shaped mount lane per container entering the
cylinder through its SIDE. One-way traffic gets one lane, a round trip gets a lane each way.

**Fails when:** the spine grows an arrowhead, which turns ownership into traffic. And when a second
disk is added without a second reason: two cylinders say two volumes, and a reader counts them.

### Two zones compared

**Says:** the same thing happens differently in two regimes.

**Build:** two halves split at the centre, each with its own small stack or row, and a caption per
side. The two sides carry the SAME structure so the difference is visible as a difference, and the
shading vocabulary does the arguing: a side that does not apply yet is dim rather than absent
(`C-14`).

**Fails when:** the two halves are drawn at different sizes, which reads as importance rather than
as difference. And when the card has three regimes: a third column makes each one too narrow for
its strings, and the answer is a step that switches one half rather than a third half.

### Peer ring

**Says:** several equals, and the story is about which one currently holds the role.

**Build:** three or more identical members, placed on an arc or a row, joined by relationship lines
rather than lanes, with the current holder carrying the highlight. The members are identical to the
unit: any difference in size reads as a difference in rank the card does not mean.

**Fails when:** the relationships are drawn as arrows. Nothing rides a peer link until a step says
something does, and `A-06` decides which of the two a line is per step.

### Fan to N

**Says:** there were several candidates and one was taken.

**Build:** `NET.A-03`. Every destination gets its own drawn lane even though the step takes one, so
the reader sees a choice among drawn alternatives. The unridden legs are not a defect. A vertical
bus at a fixed x keeps the legs orthogonal and gives the fan a spine.

**Fails when:** the fan has more than three or four legs. Past that the legs stop reading as
alternatives and start reading as a mesh, and the card is better served by one lane into a box
labelled with the count.

### Multi-Node band

**Says:** the same object exists on several Nodes, and they are not in the same state.

**Build:** two or three `node()` frames across the width, each holding one Pod, sized off one
formula so they are peers. The states differ by opacity phase, never by size. A frame label prints
at its own top-left corner, which is where the panel sits on the leftmost frame (`L-03`).

**Fails when:** all three Nodes stay identical for the whole card. Three frames cost the whole
width, so at least one step has to make them differ or two of them are scenery.

### Nested containment

**Says:** the boundary is the subject.

**Build:** rectangles inside rectangles, three levels at most, each level with its own label and a
visible margin. The innermost thing is what the card is about, so it carries the smallest box and
the brightest state.

**Fails when:** the nesting is drawn with equal margins at every level, which flattens it back into
a grid. Vary the inset, and let the outermost frame carry a label and nothing else.

### Instrument panel

**Says:** a quantity, a budget, a countdown or a rate.

**Build:** a hand-forged track with a fill, a ruler with threshold marks, a row of slots, or a
ladder of rungs. `P.raw` is the door, because no part kind emits a bare `rect` or a stacked pair of
texts, and every raw factory names its ref keys as literals so the spec reader can see them.

**Fails when:** the card writes a value in a chip AND draws it as a bar, and the two disagree at
some step. One of the two is the subject: the other is a caption for it.

### Object board, no Pod

**Says:** this is a story about API objects, and no Pod appears in it.

**Build:** boxes for the objects, relationship lines for the references between them, and the state
of each object in its own sublabel. 22 cards in the catalog carry no Pod at all, so a Pod is not the
price of admission: adding one to a card whose subject is a PV and a PVC puts an actor on stage who
never speaks.

**Fails when:** the objects are laid out in one row because there are four of them. Reference
direction is the composition: what points at what decides who sits above whom.

### Chain into a store

**Says:** a request passes through stages in a fixed order and ends in something that keeps it.

**Build:** the stages as a row or a chain, the store as a `cylinder()` at the end, and the write as
the last hop. The store sits apart from the stages, because the point is that the stages are
transient and it is not.

**Fails when:** the store is drawn the same size as a stage, which makes it look like one more step.

### Hub and spokes

**Says:** one component is the centre and everything else exists in relation to it.

**Build:** the hub at the canvas centre, everything else around it, and no traffic between the
spokes. It is the strongest statement in the library and the least reusable: it says the hub is the
only route, which is true of very few subjects.

**Fails when:** the spokes talk to each other. The moment one lane skips the hub, the composition
argues against the sentence it exists to make.

### Branch

**Says:** the same input produces one of two outcomes.

**Build:** a common trunk to a decision block, then two legs. The leg the card is NOT taking this
step is dim rather than absent. Where a step draws a state that never happened, the branch carries
a caption saying so, which is `T-35` and its one grammar.

**Fails when:** the two legs are drawn as equals on a card where one is the ordinary case. Weight
follows the story, and the rare leg is the dim one until the step that takes it.

### Timeline

**Says:** time is the axis, and most of what happens is waiting.

**Build:** a horizontal ruler with marks at the deadlines, the subject riding it, and chips
carrying the counters. The waiting is what the card is about, so it gets the width.

**Fails when:** the marks are unlabelled, which turns the ruler into a decoration. Every mark on a
timeline is a number a reader wants, and a mark with no label is asking them to guess.

---

## Part three: the difference levers

When the family is right and the card still looks like its neighbour, these are the axes to move,
cheapest first. `tools/kin.mjs` reports each one per section, with the catalog-wide count beside it,
so a lever nobody has used in a section is visible before the card is written.

| Lever | The move | Cost |
|---|---|---|
| band count | two tiers instead of four, or four instead of two | free, it is the y literals |
| chip layout | a column, a wide strip, or a grid of two rows | free, and it changes the whole balance |
| chip count | four is the family default. Six says the card is about state, one says it is about a picture | free |
| actor count | one actor instead of three, or none at all | free |
| frame count | no `node()` frame, one, or three | cheap, but a frame is 1000 units of width |
| Pod count | none, one, or a row of four | cheap |
| lane topology | a pair, a fan, a bus, a ring, a single trunk | cheap, but every lane move is a timing change (`A-11`, `M-20`) |
| a disk | a `cylinder()` says persistence, and nothing else in the vocabulary does | cheap |
| a standing caption | a `P.tag` that is true on every step, which no wire label can be | cheap |
| a group | wrapping an assembly so it fades as one unit | cheap |
| a raw instrument | a bar, a ruler, a rung ladder, a row of slots | the expensive one, and the most distinctive |
| step count | four steps or eight, against the six most cards carry | expensive: every step is narration a reader has to be repaid for |

**Two cards may share a signature and look nothing alike, and two cards with different signatures
may read as the same picture.** The signature is where the argument starts. The frames are where it
is settled, which is why the diversity gate ends at a montage and not at this table.

---

## Part four: how a card ends up looking like its neighbour

The failure modes, in the order they happen.

- **The exemplar is copied whole.** Every folder contract names an exemplar and says to copy its
  SHAPE. Its shape is the module order, the header discipline, the declarative form. Its
  ARRANGEMENT is a solution to its own subject.
- **The composition is chosen before the sentence.** Then the subject is bent to fit the picture,
  and the tell is a block on the canvas that no step ever mentions (`T-21`).
- **The actor row is added out of habit.** A card whose subject has no control-plane actor gets one
  anyway, because the file it was copied from had one.
- **Four chips because the last card had four.** The chip strip is the cheapest thing on the canvas
  to make specific to a subject, and the most often left generic.
- **A ladder used as a summary.** Six rows restating the six narrations, which gives a reader
  nothing the panel did not already give them.
- **Symmetry applied to an asymmetric mechanism.** A mirrored drawing is a claim that the two sides
  are alike.
- **The differences are all in the strings.** Same blocks, same lanes, same bands, different labels.
  This is the one the signature census catches, and the one that survives every check in the suite.
