# CLAUDE.md `js/schemes/network/` (Traffic flow)

## What this file is

The contract for the Networking category and nothing wider. Three documents sit above it and are
not repeated here:

| Document | Holds |
|---|---|
| `scheme/CANON.md` | the rulebook: layout, arrows, motion, colour, text, chips, metadata, posters, module structure. Load it before designing, reviewing or repairing a card |
| `scheme/CLAUDE.md` | the sub-app contract: folder shape, module contract, catalog wiring, the test suite and its checklists |
| `./CARDS.md` | the preamble and the catalog-order index of the per-card design records in `./CARDS/` |

**If a rule stated here would also be true of another category, it belongs in the canon, not here.**

The rows below carry `NET.*` ids and are indexed from `scheme/CANON.md`. **The TEXT of a `NET.*`
rule lives here and only here**: the canon carries the id and a subject label, never a second copy
of the rule. Where an id could name two different rules, the FOLDER keeps the id. No `NET.*` id is
in that position, and keeping the text in one place is how that stays true.

Every count in this file is measured off the tree. `report/skeleton-census.test.mjs` prints the hook
and step censuses, `unit/docs-census.test.mjs` asserts the numbers stated below against the same
census, and `unit/docs.test.mjs` asserts the record structure. Do not edit a number here to make a
sentence read better: re-measure, or the assertion goes red.

## The folder

| File | Owns |
|---|---|
| `cards.js` | the 44 `SCHEMES` entries and the `SUBCATEGORIES` list for this category |
| `posters.js` | the 44 grid thumbnails, keyed by card id, each under the comment that says what its composition is |
| `network-kit.js` | the tint and the two pulse wrappers; everything else is re-exported from `lib/scheme-kit.js` |
| `network-*.js` | one module per card, 44 of them |
| `CARDS.md` | the record preamble and its index, and no `## ` heading of its own |
| `CARDS/<id>.md` | the design record for ONE card, a single `### layout` block of labelled notes and no other heading, which `S-51` states and `test:docs/G1` holds. This category, `cluster/` and `workloads/` are the three in the split shape, and `recordFiles` in `test/fixtures/catalog.mjs` reads that shape off the tree rather than off a list of category names |

Nothing else may live here (`S-20`). A card reaches `./network-kit.js` and no further (`S-21`): all
44 import the kit, 9 also import `lib/svg.js` and 3 `lib/primitives.js`. Those are element
constructors no part kind builds, on the cards that draw raw SVG or build a Pod by hand. From
`lib/svg.js`: `g`, `rect` and `text` on `kube-proxy-modes`, `model` and `proxy-rule-resync`, `g`,
`rect` and `line` on `service-terminating-endpoints`, `g` and `rect` on `gateway-traffic-splitting`,
`rect` alone on `namespaces`,
`line` on `model` and `proxy-rule-resync`, and `path` on `model`,
`cni-invocation`, `pod-ip-and-veth` and `dns-egress-policy`, the last two of which take `g` with it. From
`lib/primitives.js`: `box` or `podShell` on `namespaces`, `pod-ip-and-veth` and
`pod-localhost`, where a Pod carries more children than `buildPod` gives it. Read off the imports
rather than grouped by phrase: `namespaces` takes neither `g` nor `text`, and `pod-ip-and-veth` is
in both lists.

## The catalog

44 cards, 264 declared steps, five subcategories. It is the largest category in the catalogue by
cards and the smallest by steps per card, 6.0 against 6.5 to 6.6 in each of the other three: a
networking card is a PATH, and a path is shorter to narrate than a lifecycle.

### Subcategories (`NET.D-01`)

| key | label | cards | what belongs here |
|---|---|---|---|
| `network-foundations` | Network Foundations | 12 | the model and the machinery under every other card: the flat address promise, namespaces, CIDRs, the proxy and dataplane implementations |
| `pod-networking` | Pod Networking | 8 | one packet's path at Pod level: how an interface comes to exist and how a frame gets from one Pod to another |
| `services-endpoints` | Services & Endpoints | 8 | the Service abstraction and what backs it: VIP resolution, EndpointSlice reconciliation, port mapping, selection policies |
| `external-traffic` | External Traffic | 8 | traffic that starts outside the cluster: NodePort, LoadBalancer, Ingress, Gateway, weighted traffic splitting, and what happens to the source IP |
| `dns-service-discovery` | DNS & Service Discovery | 8 | name resolution: CoreDNS, record shapes, resolver behaviour, caching |

The line between `services-endpoints` and `external-traffic` is where the client is, not which
object appears: a Service card that starts at an external client belongs in `external-traffic`.

The order of `SUBCATEGORIES`, and of the cards inside each, is an editorial argument about what a
reader meets first (`D-10`). It is never alphabetical, and `CARDS.md` indexes the records in that
same order.

## Tint

```js
NETWORK_TINT = { base: 'rgb(79, 229, 255)', bright: 'rgb(158, 234, 247)' }   // cyan
```

`base` is the Pod's resting stroke, measured under `reducedMotion` (`M-05`).

| ID | Rule |
|---|---|
| `NET.C-01` | Networking is the one category whose colour appears as a LITERAL in `diagrams.css`: `.scheme-packet` and `.scheme-ripple` pin `#4fe5ff` on purpose, because the tint stop made the ball read washed out. Do not fold those into tokens (`C-21`) |

## Kit surface

`network-kit.js` re-exports the shared list (`S-22`) plus the set every kit adds (`P`, `F`,
`defineCard`, `POD_VIOLET`, the six `lib/layout.js` formulas), and adds `NETWORK_TINT` with its two
pulses. **There is no networking-only helper and no geometry grammar**, which is the one structural
difference from `cluster/` and `workloads/`: both of those carry an X grammar (`CLU`, `WL`) and a
`LAYOUT` A/B/C preset table in their kit, and this category has neither.

Why there is no grammar object here is a measurement, and it is the subject of the next section.

## Geometry

**This is the one category with no geometry grammar, and that is a measurement rather than a gap.**
The other three each export one from their kit: `CLU` and `LAYOUT` in cluster, `WL` and `LAYOUT` in
workloads, `STO` and `chipStrip` in storage. A grammar object is the MODE of a category made
reusable, and networking has no mode to be the mode of.

19 of the 44 cards draw a Node frame around a Pod and hang their content off it, one more draws
one with no Pod inside it, and the remaining 24 place their content from extents they declare
themselves, no two of them agreeing on a band. Not every one of those frames is a NODE: the part
kind is the category's only grouping frame, so `network-cni-invocation` labels one `CNI plugin
chain` and `network-gateway-traffic-splitting` labels two after the Services they hold. Those three
are the whole population of non-Node frames here, and `NET.A-02` below is about the Node ones. That is not carelessness: a path card's vertical
extent is set by where the path runs, and the path is the card's whole subject, so a shared band
would be a constraint on the one thing each card is free to choose. The one `NET.L-*` rule this
folder declares is a WIDTH DEFAULT and not a grammar (`NET.L-01`, below): it fixes what an actor box
measures, never where a card puts it.

What the category really does share is smaller than an object. The lane PAIR, out and back about a
centre line, is on 20 of the 44 cards, the ones drawing a round trip, and `lib/layout.js` already
carries the formula half of it in `laneY`. `CHIP_H` is the other and the weaker of the two: 36 cards
declare one for themselves, 33 of them at 34 and three at 32, where the other three categories state
it once in their own grammar object and the shared kit states it nowhere. Neither is worth an object:
one is a formula `lib/layout.js` already exports, and the other is a scalar that is nearly, but not
quite, one number.

Adding a `NET` grammar is therefore a real proposal and not a tidy-up: it needs a measured mode to
be the mode OF, and today the numbers say there is not one. The place to check before proposing it
is this section, re-measured.

### The one width that IS shared: 232

**232 is the de-facto object width of this catalog, and a networking card aims at it** (`NET.L-01`
states the rule, this section carries the measurements behind it). The other three categories state
it where they can: `CLU.BOX_W` is 232 and resolves on 14 cluster cards,
`STO.CHIP_W` is 232 on 12 storage cards, and 101 of the 135 modules type the number somewhere.
Networking has no grammar object to state it in, so each card types its own width: 147 `_W`
constants across the 44 cards, of which 232 is far the commonest at 53, against 200 on 12, 210 on 7,
320 and 180 on 6 each and 300 on 5. Where a width drifts off that, two actors side by side read as
two unrelated boxes instead of one row, and holding the number card by card is what this section
buys instead of a `NET` grammar.

**The height is 80, and it is a measurement rather than a habit.** Counted over the tree: 48 of the
135 modules carry an `_H` constant of 80, 64 such constants in all and 44 of them here, and the Pod
form of the same block is 232 by 104, a height 12 constants in this folder hold, with a 192 by 44
app box inside (`network-gateway-api`). 14 records here already write `232 by 80 (NET.L-01)` in
their `SIZES` block, which is the practice running ahead of the rule text. A card that picks its own
height reads as a different KIND of object beside its neighbours, which is the same defect a drifting
width causes one axis over.

So a block that stands in an actor row STARTS at 232 by 80, and anything else is a measurement written
down rather than a preference. Three things overrule it, and only these three:

- **A string that does not fit.** Measure the widest label and sublabel the card ever sets, at all
  three viewports, and give the text real clearance inside the box. Precedent:
  `workloads-container-states` keeps its three record slots at 248 because
  `Terminated · exitCode 137 · OOMKilled` inks 223.1, which a 232 box would leave 4.5 units a side.
- **The panel wall.** The narration panel is measured per card (`OVERLAY_IDS=<id> node --test
  report/overlay.test.mjs`), and a row centred on x=600 cannot be wider than the room the panel
  leaves: two 232 boxes centred on the spine start at 368 - gap/2, which is behind a wall that
  measures around 396.55 on the deepest viewport. Precedent: `workloads-effective-pod-requests`
  takes 232 by giving up the mirror and standing its pair right of the panel instead.
- **A column or a row the block is SIZED BY.** Where a card builds a band on one edge and derives
  its parts from that band, the derived width wins: two boxes across a 440 column at a 16 gap are
  212 each, and 232 apiece would want 480, which breaks the single edge the column exists to state.
  The record carries that arithmetic, and the actors OUTSIDE the band still take 232.

All three are decisions to settle BEFORE the build closes, because the readout, the lanes and the
wire labels all follow the choice, so meeting it late is a relayout rather than a nudge. A card that
departs says so in its own record, with the measurement that forced it: a number nobody can
re-derive is re-narrowed to 232 by the next pass in the name of consistency.

The third clause and the second are the SAME question answered opposite ways, deliberately.
A structure and a width are in conflict, and which one gives is settled by which one carries the
card's argument: `workloads-effective-pod-requests` gave up a mirror across WL.CX because the pair
being 232 mattered more than the pair being centred, while a card whose whole composition is one
column keeps the column and lets the width go. A rule that always resolved it the same way would be
wrong on one of the two.

## The escape hooks this category needs

All 44 cards are in the declarative form. **31 are fully declarative**; thirteen carry a hook, **37
sites in all**, and the DSL did not have to grow once. `step.motion` and `F.run` are used by NOBODY
here, and neither is `SCENE.reset.extra`, which now has no site anywhere in the catalogue.

The counts are SITES the layer actually receives, read off the imported specs the way
`report/skeleton-census.test.mjs` totals them, never off grep.

| Card | Hook | What it wraps, and why no field expresses it |
|---|---|---|
| `network-model` | `P.raw` x6, `tune` x4 | The flat-network band is a hand-forged `g.scheme-box` carrying `data-role` and six ordered children, which `P.group` cannot express. The four Pod wires are bare `<line>` with BOTH `marker-start` and `marker-end`, where the lane kinds emit a `<path>` with `marker-end` only. The CNI connector is a `<path>` at FULL stroke-opacity with no marker at all: `P.lane` and `P.arrow` always attach one and `P.relation` always sinks the line to 0.45, so neither expresses a ridden line that carries no head. The four `tune` hand the `.scheme-pod-sublabel` child up as a ref, because the IP fade needs a target no part kind keys |
| `network-cni-invocation` | `P.raw` | The plugin-chain spine is TWO claims and one element cannot carry both: a ball rides its trunk on the `chain` step, so that half is a `<path>` at full stroke-opacity, while the two taps stay a `P.relation` at 0.45 because nothing ever rides them. No lane kind draws a ridden line with no arrowhead |
| `network-kube-proxy-modes` | `P.raw` x2, `tune` x2 | The IPVS engine is a box plus a row of seven `.scheme-grid-cell` rects, and the pile the `scale` step reveals is nine more bare rects on the chain row segments, and no part kind emits a bare `<rect>`. The two `tune` file a `P.wire` into the MAIN ref bucket as well, because `F.anim` and `rewind` read `s.refs[k]` while a wire lands only in `refs.wires[k]` |
| `network-proxy-rule-resync` | `P.raw`, `tune` x1 | The sync loop is an INSTRUMENT: a `g.scheme-box` whose body is a time axis with five beat marks, a hundred change ticks in five bursts and three write fields, and no part kind emits a bare `<line>`. The one `tune` hands five of those groups up as literal refs, because each step moves a SIDE of the clock by opacity and nothing keys a child of a raw |
| `network-service-terminating-endpoints` | `P.raw`, `tune` x1 | The grace clock is a time axis: a 30 second track, four tick marks and two elapsed spans, and no part kind emits a bare `<rect>` or `<line>`. The one `tune` hands the two spans up as literal refs, because each step lights the elapsed time by opacity |
| `network-dns-egress-policy` | `P.raw` | The egress boundary is a WALL: one `<path>` of two open subpaths with a gap the height of a door in each side face, at full stroke-opacity and with no marker. `P.box` builds a closed rect, `P.lane` and `P.arrow` always attach a head, and `P.relation` sinks the line to 0.45, so no part kind emits an open outline a road passes through |
| `network-namespaces` | `P.raw` x2 | The netns shell is a lone `podShell` sitting as a plain sibling, where `P.pod` would wrap it in its own `g`. The stack band is a bare `<rect>` |
| `network-gateway-traffic-splitting` | `P.raw` x2, `tune` x1, `step.enter` x6 | The header rule row and the weighted rule's proportion bar are bare `<rect>` segments inside the Gateway block, and no part kind emits one. The one `tune` files the web-v1 share under the literal ref `barV1`. The six `enter` pin that share's width on every step, because `writeStatics` has no width field and the width must be right on prev, reset and reduced motion as well as under the slide. The `cluster-cpu-throttling` precedent |
| `network-endpointslice-reconcile` | `tune` x1 | The comb joining the three Pods is a relation, since no ball rides it, but at 0.45 it read fainter than the dashed arrows it meets. `P.relation` has no field for its stroke-opacity, so `tune` writes it inline at full |
| `network-loadbalancer-direct-to-pods` | `tune` x1 | The target ladder is a `P.chain`, which keys the whole list and none of its rows, and a row outside the target list stands at pending on every step. The one `tune` hands the four rows up as the literal refs `row0` to `row3`, so `opacity` reaches them on the static path, in `rewind` and in the `F.set` turnover |
| `network-mtu-overhead` | `tune` x1 | The path ceiling is a box laid OVER the three measure rows, so it must carry strokes only or it fills a second rectangle of canvas colour on top of the bars it is measuring against. `P.box` has no field for the fill of the rect it builds, and `P.relation` is a line rather than a frame |
| `network-pod-ip-and-veth`, `network-pod-localhost` | `tune` | The Pod holds three (pod-ip-and-veth) or four (localhost) peer container boxes against `buildPod`'s single `inner`, and they must sit INSIDE the shell group because `pulsePod` reaches only what the Pod contains. The `workloads-init-containers-and-sidecars` precedent |

**A `tune` or a `raw` factory must assign a LITERAL ref key** (`refs.podASub = ...`), never a computed
one (`refs[k] = ...`): `unit/spec-steps.test.mjs` reads escape bodies for `refs.x =`, and a computed
key is invisible to it, so every write through that ref is reported as naming nothing. That cost a
repair on `network-model`.

**A `raw` whose element deliberately imitates a kind is declared**, because the test cannot read
inside a `make()`: `RAW_SHAPED_AS` in `unit/spec-scene.test.mjs` carries `network-model.bus` as a box.
Growing that table is the coordinator's job, and so is SHRINKING it: the check adds every entry it
resolves to a used set and reports the ones nothing matched, so an entry left behind by a rebuilt
card turns the gate red rather than sitting there as litter.

## The reduced path

`reducedLit` is declared on **41 of the 44 cards over 142 steps**, against 34 steps in workloads and
2 in the whole of cluster. It is by a wide margin the largest reduced population in the catalogue,
and the reason is structural rather than stylistic: on a path card the animated path says "the
packet got here" by moving a ball and pulsing what it reached, and a pulse names nothing that
`flowLights` can derive, so almost every step has to declare its own static stand-in. Only **217 of
the 264 steps light something** through `lit:` or a `lights` list, the thinnest coverage of the
four, and the gap is what `reducedLit` fills.

The shape is nearly always the same, the inner app box of whichever Pod the ball reached. Two cards
show the limit case, `network-client-ip-preservation` and `network-model`: no step of either
declares `lights:` or an `F.light`, so `flowLights` returns `[]` on every step and the ENTIRE static
path rests on `reducedLit`. A wrong derivation there lands on the HIGHLIGHT axis of
`render/reduced.test.mjs`, which is enforced, so `npm test` is what catches it: on those two it is
the only thing that would.

## The records

| ID | Rule |
|---|---|
| `NET.S-04` | A networking card's record says what is true of THAT card. The category-wide contract is the `NET.*` rows below and the canon above them, and a record that restates either is repeating something with an executing home. What a network record owes beyond the catalog-wide form is the PATH: which lanes carry a ball and which are drawn alternatives that carry none (`NET.A-03`), and where a rewrite inside a box is drawn as a fade and a re-emergence (`NET.A-01`). Both are invisible to every check in the suite and both read as defects to anyone who did not build the card |

The block labels a record may use are ONE list for all four categories, in `scheme/CANON.md` under
"The record vocabulary", each used at most once and in that order. That is `S-52`, and
`test:docs/G2` reads the vocabulary off the canon and holds all 44 records here to it, so a label
outside the list, a duplicate or a run out of order fails the gate rather than a review.

Every record here carries `WHAT` and a `PANEL` block, 44 of 44. A `PANEL` block states the READING,
not the extent: the right edge is `x<=397` catalog-wide (`L-02`), and the bottom moves
non-monotonically per card and per viewport (`L-04`, `L-06`), so each block names the command that
prints it, `OVERLAY_IDS=<card-id> node --test report/overlay.test.mjs` from `scheme/test/`, and
keeps only which step is deepest, what stands under the panel and how much clearance is left. All
44 are clearances, and the narrowest is `network-pod-to-pod-cross-node` at 7.34: its Node frame
label inks from y=262 against a deepest panel reading of 254.66. That clearance is what the
`NODE_Y` 255 buys, the same value its own sibling `network-pod-to-pod-same-node` takes for this
reason, and a frame corner 35 units higher puts the label under the panel.

These records are the SHORTEST in the catalogue, and deliberately so. A card whose subject is one
packet on one path has less to explain than a lifecycle with six states, and `NET.S-04` is what a
long one has to earn: a measurement, never a re-derivation of the rules above. `tools/canon.mjs`
prints the lengths when the question is actually asked.

## Exemplar (`NET.S-03`)

`network-service-clusterip.js`, 258 lines. Copy its shape for a new networking card: parallel
forward and return flow lanes between a client and a dataplane box, plus a right-angle fan to a
mirrored pair of backends.

It is the reference for four things this category does that the other three do not, and it is
written to be read in that order:

- **Three extents, and everything derived from them.** `CX`, `SCHEME_L` and `SCHEME_R` are the only
  horizontal literals with a say: the client, the centre column, the backend column and both
  fan buses all move when one moves. The chip strip deliberately does NOT follow, because its four
  widths are sized to their own longest values, and the comment on the constant says to re-run
  `render/chipfit.test.mjs` after any change. That is the `S-34` shape: the reason sits on the line
  it is about.
- **The lane pair, through `laneY`.** `laneY(FLOW_Y, LANE_DY)` gives the forward and return lanes as
  a named pair rather than as two literals 24 apart, and the same call gives the fan's mirrored
  attach points at two different offsets. This is the one piece of shared geometry the category
  really has, and a card that draws a round trip takes it here.
- **A `P.relation` for ownership, and a `P.lane` for traffic.** The dashed link from kube-proxy
  down to the Node dataplane carries no arrowhead and no ball ever rides it, because kube-proxy
  WRITES the rules that box runs rather than forwarding anything through it (`A-06`). Every wire a
  ball rides is a lane or an arrow. Getting this backwards is the most common defect in a new
  networking card.
- **Both backends stated on EVERY step, as fields.** `serving(lit)` writes an `opacity` for podX and
  podY on every step that has an opinion, so a dim set by one flow cannot survive into the next, and
  `BOTH_UP` is the same statement when neither is chosen. `NET.S-02` is the box half of this and the
  `serving` helper is the shell half.

Read its `SCENE.parts` for the z-order the category assumes: boxes and Pods, then the wires ABOVE
them, then the chips, then `P.packets()` last so the ball and its riding tag sit on top. Read its
`send` step for the up-arrow beat order: the client pulses first, the ball leaves at
`BEAT.afterPulse`, and the receiving box lights on arrival.

New cards go in this form. No card in the catalogue is on the hand-written `class Scene` any more,
so writing one in it is a regression rather than a choice.

## Rules of this category only (`NET.*`)

True of every card here unless its own record in `./CARDS/<id>.md` says otherwise.

| ID | Rule |
|---|---|
| `NET.L-01` | **An actor block is 232 by 80, and a Pod 232 by 104, unless a measurement says otherwise.** The HEIGHT is measured the same way the width is: 80 is what 48 of the 135 modules hold in an `_H` constant, 44 of those constants standing here, 104 is the Pod height 12 constants in this folder hold, and 14 records here already state `232 by 80 (NET.L-01)` as though the rule always covered the height. 232 is the de-facto object width of the catalog (`CLU.BOX_W`, `STO.CHIP_W`, 101 of the 135 modules), and this category is the one with no grammar object to state it in. A new or rebuilt card starts at 232 and departs only for a measured string that does not fit, for the narration panel wall, or for a column or row the block is sized BY, with the arithmetic in its record. The Geometry section above carries the numbers, and says how a structure and a width in conflict are settled |
| `NET.S-01` | **A Pod is `podShell(...)` plus an inner `box(...)`** (app, eth0) in one `g`, which is what `P.pod` builds. The client, kube-proxy, CoreDNS, a bridge and a NIC are infrastructure and light rather than pulse. 41 of the 44 cards draw at least one Pod, and the three that draw none (`network-service-cidr`, `network-proxy-rule-resync`, `network-dns-autoscaling`) are drawing the machinery under the Pods rather than the Pods |
| `NET.A-01` | **Every endpoint sits on a block EDGE**, so a ball never travels under or over a block: it fades at one edge and re-emerges at the far edge. That is how a rewrite INSIDE a box (DNAT, SNAT, port remap, conntrack) is drawn, because the box is where the decision happens |
| `NET.A-02` | **Traffic is delivered TO A NODE.** A ball stops on the Node frame edge and the Pod inside pulses to show it was served. No wire and no ball crosses a Node border. It reaches every NODE frame here, the one that holds no Pod included: a ball that stops on the edge of an empty frame is still saying the Node was the destination. The three frames that are not Nodes (Geometry above names them) are a grouping and not a destination, so the rule does not reach them |
| `NET.A-03` | **N destinations get N wires.** A fan to three candidate backends draws all three even though a step takes one, so the reader sees the choice was made among drawn alternatives. Those unridden legs are NOT a defect, `test/fixtures/carried.mjs` carries them on the `A-05` axis with the record passage that argues each one, and several card records say so in their own words |
| `NET.A-04` | **No line in this category suppresses its role.** `A-22` is the rule and this row is the category that had to be brought to it: `role: ''` stands in for two different intentions, WEIGHT and RECESSION, and expresses neither, because it drops the category hue instead. Weight is `dim`, recession is `P.relation` at 0.45. A wire a ball rides on any step is a route at full opacity, one nothing ever rides is a relation, and `grep -rn "role: ''" js/schemes/` returning nothing is the whole check |
| `NET.T-01` | **Addresses ride the ball** (`ridingLabel`, `M-30`), never as inline wire text: a dst like `203.0.113.9:443` overflows an 80 unit gap and prints through a block border |
| `NET.S-02` | **`SCENE.reset.keys` must list the inner app boxes BY KEY**, which all 39 of the cards keying a Pod inner box do. `clearPodHighlight` only resets inline strokes, so a `.highlight` set inside a reduced-replay block leaks into later steps: reduced replay never runs the forward motion path that would re-clear it (`S-19`). The rule is stated against the declarative field because no card here writes a `resetStep` function any more |

Several cards leave a `CENTRE-LOW` finding OPEN because the rule counts neither `node()` frames nor
chips, so a card balanced by a frame full of chip rows still reports (`L-17`). Each says so in its
own record.
