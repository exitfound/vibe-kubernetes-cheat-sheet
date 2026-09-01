# CLAUDE.md `js/schemes/cluster/` (Cluster internals)

## What this file is

The contract for the Cluster category and nothing wider. Three documents sit above it and are not
repeated here:

| Document | Holds |
|---|---|
| `scheme/CANON.md` | the rulebook: layout, arrows, motion, colour, text, chips, metadata, posters, module structure. Load it before designing, reviewing or repairing a card |
| `scheme/CLAUDE.md` | the sub-app contract: folder shape, module contract, catalog wiring, the test suite and its checklists |
| `./CARDS.md` | the preamble and the catalog-order index of the per-card design records in `./CARDS/` |

**If a rule stated here would also be true of another category, it belongs in the canon, not here.**

The rows below carry `CLU.*` ids and are indexed from `scheme/CANON.md`. **The TEXT of a `CLU.*`
rule lives here and only here**: the canon carries the id and a subject label, never a second copy
of the rule. Where an id could name two different rules, the FOLDER keeps the id and the canon's
version takes a new one, which is why the canon's subject sits here as `CLU.S-02` and not as
`CLU.S-01`.

Every count in this file is measured off the tree. `report/skeleton-census.test.mjs` prints the hook
and step censuses, `unit/docs-census.test.mjs` asserts the numbers stated below against the same
census, and `unit/docs.test.mjs` asserts the record structure. Do not edit a number here to make a
sentence read better: re-measure, or the assertion goes red.

## The folder

| File | Owns |
|---|---|
| `cards.js` | the 28 `SCHEMES` entries and the `SUBCATEGORIES` list for this category |
| `posters.js` | the 28 grid thumbnails, keyed by card id |
| `cluster-kit.js` | the tint, the two pulse wrappers, the `CLU` grammar and the `LAYOUT` presets. Everything else is re-exported from `lib/scheme-kit.js` |
| `cluster-*.js` | one module per card, 28 of them |
| `CARDS.md` | the record preamble and its index, and no `## ` heading of its own |
| `CARDS/<id>.md` | the design record for ONE card. This category and `workloads/` are the two in the split shape, and `recordFiles` in `test/fixtures/catalog.mjs` reads that shape off the tree rather than off a list of category names |

Nothing else may live here (`S-20`). A card reaches `./cluster-kit.js` and no further (`S-21`): all
28 import the kit, 4 also import `lib/svg.js` and 1 `lib/primitives.js`. Those are element
constructors no part kind builds, on the four cards that draw raw SVG: `rect` on `cpu-throttling`,
`image-container-gc`, `list-watch-informers` and `pod-sandbox-cri`, `g` and `text` on the last two,
and the one `box` on `pod-sandbox-cri`.

## The catalog

28 cards, 184 declared steps, three subcategories.

### Subcategories (`CLU.D-01`)

| key | label | cards | what belongs here |
|---|---|---|---|
| `control-plane` | Control Plane | 12 | anything whose subject is an API server, scheduler, controller-manager or ETCD behaviour: request path, admission, storage, election |
| `node-runtime` | Node Runtime | 8 | the Kubelet and the container runtime doing their steady-state and bootstrap work on one Node: sync loop, sandbox, allocatable, cgroup limits |
| `node-lifecycle` | Node Lifecycle | 8 | a Node changing state under pressure or command: eviction, drain, shutdown, failure |

The split between the last two is the question "is the Node still healthy": a Kubelet enforcing a
memory limit is `node-runtime`, a Kubelet evicting to reclaim one is `node-lifecycle`.

The order of `SUBCATEGORIES`, and of the cards inside each, is an editorial argument about what a
reader meets first (`D-10`). It is never alphabetical, and `CARDS.md` indexes the records in that
same order.

## Colour

```js
CLUSTER_TINT = { base: 'rgb(192, 176, 255)', bright: 'rgb(224, 214, 255)' }   // violet
```

`base` is the Pod's resting stroke, measured under `reducedMotion` (`M-05`).

| ID | Rule |
|---|---|
| `CLU.C-01` | The category's CHROME colour (`#7d86ff` indigo, `css/tokens.css`) is a different value for a different job: chrome keys off `data-cat`, diagram elements off `data-role` (`C-15`). Retinting either is `C-22` |

## The kit surface

`cluster-kit.js` re-exports the shared list (`S-22`) plus the set every kit adds (`P`, `F`,
`defineCard`, `POD_VIOLET`, the `lib/layout.js` formulas), and adds `CLUSTER_TINT` with its two
pulses. Two names are cluster-only, and both are frozen geometry rather than behaviour:

- **`CLU`**, the X grammar: margins, the top-row band, box and chip sizes, lane offsets, and the
  `NODE` frame family below. Each value is the MODE of the category, and the count of cards taking
  it from the kit is a comment on the constant itself (`S-34`, `S-35`), where it cannot desync.
- **`LAYOUT`**, the `A` / `B` / `C` column presets. Which one a card takes is `L-08a`, the rule this
  category shares with workloads: pick the first that fits against THAT card's measured panel
  bottom. 12 of the 28 cards take a preset in code (A on 2, B on 2, C on 8); 6 more name one only
  in a comment beside a width they write as a literal, which is the `S-34` shape rather than a
  preset user; the remaining 10 place their columns from their own constants, because their subject
  is not a ladder beside a chip column.

There is no cluster-only behaviour helper. A card that needs other timings on a riding label builds
its own with `makeRidingLabel` and hands it to `F.tag` as `fn`.

## Geometry

15 of the 28 cards draw a Node frame around a Pod. Nine are on the family, and the six that are not
each carry a record that says why.

| ID | Rule |
|---|---|
| `CLU.L-01` | The Cluster Node frame family is `NODE_H 152`, `POD_H 106`, `POD_Y = NODE_Y + 34`: 34 of label padding, 106 of Pod, 12 of floor. It is the largest single frame family in the catalogue and every card on it is in this folder (`L-23`, `L-24`), 9 of the 15 cluster cards that draw a frame around Pods: `cpu-throttling`, `graceful-node-shutdown`, `node-conditions`, `node-drain`, `node-pressure-eviction`, `node-restart`, `pod-priority-preemption`, `static-pods`, `taints-tolerations`. `cluster-node-drain.js` is the card to copy it from. A SECOND family of two is explained rather than unexplained: `cascading-deletion` and `object-create-path` both measure 153/106/28 because they share one grid to the unit, frames on 150..1050 and rows off `NODE_Y + 41`, and each record says so. The remaining four measure `node-failure` 132/106/16, `node-registration` 126/80/34, `oom-kill` 144/110/20 and `pod-sandbox-cri` 158/116/22. All four have a record that says why: `pod-sandbox-cri` because its Pod shell carries a sublabel that changes on every step, and the 26 unit band the family leaves under the inner row cannot hold it, `oom-kill` because its Pod row clears the frame label horizontally rather than below it, which is what buys the short 20 unit top padding, and `node-failure` because six chips wrap to two rows below the band and the family height would push the second row off the 640 canvas, the 20 units coming off both paddings on the same horizontal-label licence `oom-kill` uses, and `node-registration` because two of its three slots are plain boxes rather than Pod shells, where a 106 shell around a label and a sublabel is 60 units of nothing: it keeps the family's 34 of padding and 12 of floor and pays the whole 26 out of the slot |

## The escape hooks this category needs

All 28 cards are in the declarative form. **20 are fully declarative**; eight carry a hook, **44
sites in all**, and the DSL did not have to grow once. `step.motion` is used by NOBODY here, and by
nobody in the catalogue.

The counts are SITES the layer actually receives, not `tune:` literals in the source, because four
of the eight build their hooks in a factory: `cluster-node-allocatable`'s `segment()` reads as one
`tune` and hands the layer four. Read them off the imported specs, the way
`report/skeleton-census.test.mjs` totals them, never off grep.

| Hook | Cards | What it wraps, and why no field says it |
|---|---|---|
| `part.tune` | 6 cards, 12 sites | Three jobs, none of them a field. A `style.fill` (plus a `strokeDasharray` on `resource-quota`) on the `.scheme-box-rect` NESTED inside a `P.box`, which hands back the wrapping `g` and not the rect: `node-allocatable` x4 through one `segment()` factory, `resource-quota` x3 through `budgetBlock()`, `server-side-apply` x1, all three so a stroke-only piece laid over a bar does not double the fill under it. The same job on a chain rather than a box: `node-allocatable` x1 more, the ladder rows repainted in their own rendered colour SOLID so the residency line crossing them at x 600 stops showing through the glyphs. A nested element captured AS A REF: `scheduler-decision` takes Node-4's `.scheme-box-label` and `.scheme-box-sublabel` so the placed Pod can hide the text it covers, and `list-watch-informers` takes the chain's `[data-idx="3"]` row and pins it hidden, because `P.chain` hands back one element and not its rows. And on `pod-sandbox-cri`, a SECOND inner box built inside the Pod shell, because `buildPod` carries exactly one `inner` and `pulsePod` reaches only what the Pod group contains |
| `P.raw` | 3 cards, 13 sites | A bare `<rect>` carrying inline `fill`, `stroke` and `width`: `cpu-throttling` x6, a track and a fill bar per CFS period through one `period(i)` factory, where a `P.box` would drag the low content centre off 600 toward the 900 the stack is centred on. Two STACKED `<text>` nodes in one chip group, which no part kind builds: `list-watch-informers` x4 over `SLOT_KEYS`, its watch-event slots. And `image-container-gc` x3 through one `bare()` factory: the imagefs ruler track and its two threshold marks, naked because a `P.box` would carry a label the ruler must not have and a mark is three units wide |
| `step.enter` | 3 cards, 14 sites | Text and an ATTRIBUTE, on elements the card made itself. `list-watch-informers` x6: `setSlot` writes the `textContent` of BOTH stacked texts on a slot. `cpu-throttling` x6: `setBars` writes `style.width` in px on the three fill rects and `textContent` on the three standing captions, and every step writes every bar, or one left alone reads as a period that behaved differently. `node-allocatable` x2: `setReqWidth` writes the SVG **attribute** `width` on the rect inside `reqBar`, and no field writes a geometry attribute at all (`opacity:` goes to `style.opacity`, a different property) |
| `F.run` | 1 card, 5 sites | All five on `cpu-throttling`, and only **two are the delay-0 form, which is an escape but not a timer**: `at()` short-circuits on `delay <= 0`, runs the callback inline and registers no timer, so it is an imperative beat standing in flow order, here back-filling the bars to empty under the fill animation. The other **three carry a real delay** (`FILL_MS`, twice it and three times it) and ARE deferred callbacks, which no other category has: no flow verb writes an inline rect width or a standing tag's text, so a bar filling and a caption landing have to be a function. The `cpu.stat` counter that closes the same period does NOT, and that is deliberate: it rides an `F.set` at the same delay, so the animated path ends in a field every reader models |
| `SCENE.reset.extra` | **0 here.** A reset hook clearing `style.strokeDasharray` on `list-watch-informers`'s watch lane would guard a door that cannot open: `dashed: true` writes the dash as an ATTRIBUTE (`primitives.js:103`) that an inline style never touches. The one `reset.extra` in the catalogue is on `network-pod-ip-and-veth`, where it is live and paired with its `enter` |

**`pod-sandbox-cri`'s `tune` creates a ref no PART declares.** `reset.pods` names `appGroup`, which
that `tune` builds and no `key:` does. `report/skeleton-census.test.mjs` counts a name landed by an
escape hook as a created ref, so **Q1 prints 0 findings**. The construction still deserves reading
before you touch it: a reset key here can be born in a `tune` and not in a part.

## The reduced path

**`reducedLit` is declared on 2 steps here**, `cluster-object-create-path`'s `create-pod` and
`cluster-node-pressure-eviction`'s `rank`, against 89 in network, 23 in workloads and 0 in storage.
That is the lowest non-zero count in the catalogue, and the reason is that cluster's steps name
their receivers in `lights:`, so `flowLights` derives most of the static path for free.

**It does NOT mean a bare Pod pulse is rare here: it is the norm.** Counted off the imported specs,
37 cluster steps pulse a Pod over 44 pulse sites, and on 35 of those steps no pulse target carries
anything at all on the static path, no `reducedLit` and no `lights:` naming the Pod or its inner
box. The site count is off the SPECS and not off grep, for the same reason the hook counts are:
`cluster-node-restart` spreads one `F.pulse` over `POD_KEYS` and hands the layer three, so the
source shows 42 calls where the data holds 44. A pulse that shows nothing under `ctx.reduced` is what this category ordinarily does, and the
two steps above are the exception rather than the closed set. Read a missing stand-in as the house
reading, and add one only where the step's own record says why.

## The records

| ID | Rule |
|---|---|
| `CLU.S-01` | A cluster card states only what is true of ITSELF in its `CARDS/<id>.md` record. Unlike networking and storage, this category has no shared contract paragraph: what every card obeys is the canon |
| `CLU.S-03` | **A record over 300 lines opens its `### layout` by saying what makes this card need one**, as a `WHAT` line naming the measurement that fills it. Length is measured per `## ` section rather than per file, so the split shape and the monolith read the same and a preamble is charged to nobody. This category's records are the longest in the catalogue by a wide margin, and the reason is not uniform. It is measurement: a card carrying `PANEL` at three viewports, a `MOTION` block with spans and a `CONTENT` block from a fact pass is long because someone opened a browser for it, and that length is earned. What is NOT earned is a record that grows by restating the canon, by re-deriving a catalog-wide argument a sibling already carries, or by narrating the sequence of edits `S-48` sends to the bin. The ceiling is a prompt to say which of the two a long record is, never a licence to cut a measurement. The band this row used to state in eight numbers is gone on purpose: it measured the RECORDS rather than the tree, so every prose edit moved it and no reader ever acted on it. `tools/canon.mjs` prints the lengths when the question is actually asked |

Five records stand past the ceiling today: `node-eviction-rate`, `taints-tolerations`,
`node-conditions`, `pod-priority-preemption` and `node-failure`, the last of them the longest in the
catalogue. All five are frames-and-timings records whose length is measurement rather than bloat,
each opens with the `WHAT` line the rule asks for, and none is a target for trimming.

The block labels a record may use are ONE list for all four categories, in `scheme/CANON.md` under
"The record vocabulary". Every record here carries `WHAT`, `PANEL`, `MOTION` and `CONTENT`, and a
one-line `Sentence:` under `### poster`. A `PANEL` block states the reading, not the extent: the
right edge is `x<=397` catalog-wide (`L-02`), and the bottom moves non-monotonically per card and
per viewport (`L-04`, `L-06`), so each block names the command that prints it,
`OVERLAY_IDS=<card-id> node --test report/overlay.test.mjs` from `scheme/test/`, and keeps only what
stands under the panel and how much clearance is left. All 28 name the command. `LAYOUT` is not on
that list of four: `node-failure` carries none, and its frame arithmetic sits under `SIZES` beside
the chip widths that force it, which is where a reader of that card looks. Nothing in `npm test`
enforces the character ceilings a `BUDGET` block states (`L-08`).

## Exemplar (`CLU.S-02`)

`cluster-scheduler-decision.js`, 262 lines. Copy its shape for a new cluster card: a top-row
request/persist arrow strip over the control-plane actors, with the Node frame below.

It is also the reference for the declarative form (`scheme/CLAUDE.md`, the module contract), and it
is written to be read in that order:

- The header keeps the MEASURED inputs as literals (`SCHED_X = 420`, the panel note) and derives
  everything else through the kit's formulas, so `laneY`, `ladder`, `spread` and `midX` carry the
  arithmetic and nothing restates a number a formula already knows.
- `LADDER_X` and `CHIP_X` come from `LAYOUT.A`, not from `60` and `660`. Picking a layout is
  therefore one edit. The chip WIDTH is this card's one departure from the preset and it says why at
  the constant: a card that needs a channel through the right column takes it there, in one line.
- The `Kubelet` and its two lanes are the shape to copy when a card narrates something ARRIVING on
  a Node. A block the step names has to be on the canvas (`T-21`), and a Pod that materialises with
  nothing travelling to it is a defect no check in the suite can see.
- `SCENE.parts` is ordered by z-order, and the card says so out loud: chips and lanes first, the
  packet layer under the chain, the three top-row blocks absolute last.
- `reset.keys` lists what `clearHighlights` takes back. `placedPod` is deliberately NOT in a `pods`
  list, and the comment beside it says why, which is the form a deviation takes here.
- Its steps show the three common `flow` shapes: a single `F.segment` with `lights`, a chain of
  three hops joined by `name` and `after`, and a fade plus a pulse sharing one delay. Nothing on
  the card touches `ctx.reduced`.
- `FILTERED` and `SCORED` spread into `chips`, which is how `P-01` is satisfied without repeating
  four verdict strings on four steps.

New cards go in this form. No card in the catalogue is on the hand-written `class Scene` any more,
so writing one in it is a regression rather than a choice.
