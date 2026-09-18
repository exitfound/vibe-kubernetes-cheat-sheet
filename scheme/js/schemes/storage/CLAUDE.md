# CLAUDE.md `js/schemes/storage/` (Volume flow)

## What this file is

The contract for the Storage category and nothing wider. Three documents sit above it and are not
repeated here:

| Document | Holds |
|---|---|
| `scheme/CANON.md` | the rulebook: layout, arrows, motion, colour, text, chips, metadata, posters, module structure. Load it before designing, reviewing or repairing a card |
| `scheme/CLAUDE.md` | the sub-app contract: folder shape, module contract, catalog wiring, the test suite and its checklists |
| `./CARDS.md` | the design records for this category's cards, one `## <card-id>` section each, in one file |

**If a rule stated here would also be true of another category, it belongs in the canon, not here.**

The section order is the one all four folder contracts share, so a reader who knows one knows the
others: what this file is, the folder, the catalog, the tint, the kit surface, the geometry, the
escape hooks, the reduced path, the records, the exemplar, then whatever `STO.*` rules no section
above holds. The section on where these rules bend is this category's own and has no counterpart in
the other three.

The rows below carry `STO.*` ids and are indexed from `scheme/CANON.md`. **The TEXT of a `STO.*`
rule lives here and only here**: the canon carries the id and a subject label, never a second copy
of the rule. Where an id could name two different rules, the FOLDER keeps it: `STO.S-02` and
`STO.S-03` mean what the rows below say. The exemplar is `STO.S-04`, below.

Every count in this file is measured off the tree. `report/skeleton-census.test.mjs` prints the hook
and step censuses, `unit/docs-census.test.mjs` asserts the numbers stated below against the same
census, and `unit/docs.test.mjs` asserts the record structure. Do not edit a number here to make a
sentence read better: re-measure, or the assertion goes red.

## The folder

| File | Owns |
|---|---|
| `cards.js` | the 31 `SCHEMES` entries and the `SUBCATEGORIES` list for this category |
| `posters.js` | the 31 grid thumbnails, keyed by card id |
| `storage-kit.js` | the tint, the two pulse wrappers and `setCylinderLabel`; everything else is re-exported from `lib/scheme-kit.js` |
| `storage-*.js` | one module per card, 31 of them |
| `CARDS.md` | every design record in ONE file, one `## <card-id>` section each, with a `### layout` block and a `### poster` block per card |

Nothing else may live here (`S-20`). A card reaches `./storage-kit.js` and no further (`S-21`): all
31 import the kit, 7 also import `lib/svg.js` and 2 `lib/primitives.js`, the element constructors no
part kind builds.

**Storage is the one category still on the MONOLITH record shape.** The other three keep one file
per card under `CARDS/`, which `S-51` states and `recordFiles` in `test/fixtures/catalog.mjs` reads
off the tree rather than off a list of category names, so both forms are walked by the same code and
neither is a special case. What the monolith still costs is recorded under "The records" below: this
category is the whole of the remaining `test:docs/G1` and `G2` ceiling.

## The catalog

31 cards, 205 declared steps, four subcategories. Its steps per card, 6.6, are the highest in the
catalogue by a hair, because a storage subject is a HANDOFF between objects that each have to be
drawn before the handoff can be narrated: a claim, a volume, a driver and a Node all appear before
anything is mounted.

### Subcategories (`STO.D-01`)

| key | label | cards | what belongs here |
|---|---|---|---|
| `volume-foundations` | Volume Foundations | 8 | what a volume IS before any claim exists: the model, the container filesystem, and the volume types that need no PV |
| `volumes-claims` | Volumes & Claims | 8 | the PV/PVC object dance: binding, provisioning, modes, expansion, protection, reclaim, phases |
| `csi-mount-path` | CSI & Mount Path | 8 | the driver and the path from API object to a mounted directory on a Node: attach, mount, ownership, limits, detach |
| `stateful-data` | Stateful Data | 7 | storage that outlives or follows a workload: templates, retention, topology, snapshots, clones |

The line between `volumes-claims` and `csi-mount-path` is whether the card's subject is an API
object or a Node-side action.

The order of `SUBCATEGORIES`, and of the cards inside each, is an editorial argument about what a
reader meets first (`D-10`). It is never alphabetical, and `CARDS.md` orders its records the same
way.

## Tint

```js
STORAGE_TINT = { base: 'rgb(94, 202, 148)', bright: 'rgb(174, 224, 199)' }   // jade
```

`base` is the Pod's resting stroke, measured under `reducedMotion` (`M-05`).

| ID | Rule |
|---|---|
| `STO.C-01` | Jade is hue 150 at 50 percent saturation, and that ceiling is the point: a green above roughly 50 percent goes acid on this canvas. If a new shade is needed, move LIGHTNESS, not saturation (`C-23`) |

## Kit surface

The shared list (`S-22`), the own set every kit adds (`P`, `F`, `defineCard`, `POD_VIOLET`, the six
`lib/layout.js` formulas), `STORAGE_TINT` and its two pulses, plus what only storage carries:

```js
setCylinderLabel(cylEl, txt)    // the label inside a cylinder(), the way setBoxLabel is for a box
STO                             // the category's X grammar, measured over the 31 cards
chipStrip({ cx, w, gap, count })  // fix w AND gap, derive the span, centre it -> { w, gap, x(i) }
```

`STO` holds the centre (`CX` 600, where 22 of the 23 cards naming a centre put it and where 30 of 31
chip strips sit) and the chip scalars to reach for, and nothing else: the canvas band and a
`SAFE_L` 400 were declared and read by no card, which the canon forbids outright, so they are gone
and the 9 cards clearing the panel keep saying 400 themselves. There is **no `LAYOUT.A/B/C`**, and
that is a measurement rather than an omission: cluster and
workloads carry presets because which column holds the ladder genuinely varies, while storage has one
composition and only 3 cards declare a column width at all, at 516 / 180 / 176.

`chipStrip` exists because `lib/layout.js` cannot say what 23 cards hand-roll: `strip()` fixes the
gap and derives the width, `spread()` fixes the width and derives the gap, and both span an exact
`from..to` instead of centring. **Match the derivation DIRECTION, not just the coordinates**: a card
that fixes the SPAN and derives `CHIP_W` from it keeps its own formula even where the x values agree.

## Geometry

### The layout grammar: the vertical stack (`STO.L-01`)

Storage does not use the left-to-right pipeline the other categories use. Its grammar is a stack
centered on a spine:

- a Pod on top, its containers inside it
- the backing volume below, drawn as a `cylinder()` disk
- a dim, arrowhead-less **identity spine** at the centre x, saying "this volume belongs to this
  Pod". Nothing travels it, so it carries no ball and no arrowhead (`STO.A-01`)
- one L-shaped **mount lane** per container, dropping from the container and entering the cylinder
  through its SIDE, written in its one traffic direction so the arrowhead lands at the receiving
  end. One-way traffic gets one lane, a round trip gets a lane each way (`STO.A-02`)

| ID | Rule |
|---|---|
| `STO.L-02` | A cylinder's label is re-centred on the visible front face (below the cap ellipse) by setting `labelY` on `P.cylinder`, because `cylinder()` centres on the raw bbox and the cap ellipse is not part of the face you see, so the default sits visibly high inside the body. **Derive the offset from the cylinder height rather than typing the resulting literal**, which is what the catalogue does: measured over the 43 cylinders here, **`h/2 + 10` is the family formula, on 23 of the 28 that re-centre**; four use `h/2 + 12` (which is where the old "`y: 64` standard" came from, and why `container-filesystem`'s 60 was never a deviation but the same formula on a 96-tall cylinder), one uses `h/2 + 9`, and **15 cylinders do not re-centre at all**. Copy your own card's offset; there is no single literal |
| `STO.L-03` | **`CHIP_W 232` is the family default**, with `CHIP_GAP 16`. Size a chip against the worst name+value pair on the card, and shorten the VALUE rather than widening (`P-07`) |
| `STO.L-04` | Several cards carry a measured table pinning their own panel floor, and some of those tables include a `900x650` row that is narrower than any of the three standard viewports `report/geometry-soft.test.mjs` samples. Where the two disagree the card takes the stricter number and says so (`L-06`) |

Storage's deepest panel is 354 units (`storage-ephemeral-storage-eviction`), not the catalog
maximum: that is 503 on `workloads-pod-lifecycle-phases` (`L-04`).

## The escape hooks this category needs

All 31 cards are in the declarative form. **16 are fully declarative**; 15 carry a hook, the highest
share of any category, and the DSL still did not have to grow. `reset.extra` and `step.motion` are
used by NOBODY here.

The counts are SITES the layer receives, not literals in the source, and a card that builds its hooks
in a factory hands over more than it writes. `part.tune` is 13 sites on `configmap-secret-mount`,
`ephemeral-vs-persistent`, `fsgroup-ownership`, `multi-attach-error`, `projected-volume` and
`volume-attach-limits`, and no other card here carries one. Read the counts off the imported specs,
the way `report/skeleton-census.test.mjs` totals them, never off grep.

| Hook | Cards | What it wraps, and why no field says it |
|---|---|---|
| `part.tune` | 6 cards, 13 sites | An SVG **attribute** on a nested element the part kind does not hand back (`.scheme-pod-sublabel`'s `y`, a `node()` caption's `y`, a box label's `y`), a `style.fill` on a `.scheme-box-rect`, or an ARRAY ref that later steps READ: `storage-fsgroup-ownership` collects its listing rows that way and seven `enter` hooks address them. **An ARRAY ref belongs in a `tune` only when later steps READ it**, which makes that card the one case: every other element carries its own `key:`, so an array over them would be read by nothing |
| `P.raw` | 8 cards, 11 sites | A markerless, role-less identity spine (`P.lane` adds a marker, `P.relation` adds the relation class and `data-role`), a bare `<line>` or `<rect>`, a frame border whose stroke is inline style, a bare `pod()` (`podShell()` is `pod()` PLUS the inline wash, so `P.pod` would add one), and the one Pod with two peer inner boxes |
| `step.enter` | 4 cards, 27 sites | Text no field reaches: `setCylinderLabel` writes `.scheme-cylinder-label` where `labels:` writes `.scheme-box-label`, a free `<text>`'s `textContent`, a per-step `style.fill` on 24 slot rects, and on `fsgroup-ownership` per-row `textContent` plus `.highlight` reached through an array ref |
| `F.run` at delay 0 | 5 cards, 8 sites | **An escape, but not a timer**: `at()` short-circuits on `delay <= 0` (`scheme-kit.js:262`) and runs the callback inline and registers nothing, so it is an imperative beat standing inside the flow order rather than a deferred one. It is still a hook, and all eight are inside the catalogue's count of 13 `F.run`. It is what reproduces a card-owned `onfinish` (`F.fade` carries only `unlight`), a deferred UNLIGHT, and any write through an array ref |

**A `P.wire` is unreachable by every opacity field.** Wires land in `refs.wires[key]` and `opacity:`,
`rewind.opacity`, `F.fade` and `F.reveal` all resolve `refs[key]`. Adding a scalar key to make one
reachable renames it in the `settled-dump.mjs` probe, which claims scalar keys before `wires.*` and
is first-wins. `render/reduced.test.mjs` cannot see that rename at all: it keys by DOM SHAPE (tag,
classes minus `highlight`, `data-role`, `data-idx`) and never reads a ref name. A wire that animates
needs `F.run` at delay 0.

**`chipsCued`, not `chips`, is this category's default.** Storage is the only consumer of `setChip`:
`storage-ephemeral-storage-eviction` and `storage-projected-volume` are pure `setVal` (so pure
`chips`), `storage-pvc-binding` mixes both, and the other 28 are pure `chipsCued`.

## The reduced path

**`reducedLit` is declared on ZERO steps here**, against 89 in network, 34 in workloads and 2 in
cluster, and that is a measurement rather than an omission: of the 205 steps, **165 light something**
through `lit:` or a `lights` list, so `flowLights` derives the whole static path. The 7 that pulse
and light nothing at all leave nothing behind on the animated path either, so there is nothing to
mirror.

That makes storage the one category with no reduced-path population at all, and the reason is the
`lights` habit rather than a gap: where the other three say "this Pod is here now" with a bare
pulse, a storage step almost always names its receiver, so `flowLights` has something to derive
from. No card here is dark on every step. A card that DID pulse and light nothing would need a
`reducedLit`, and `render/reduced.test.mjs` is what would say so.

## The records

| ID | Rule |
|---|---|
| `STO.S-05` | **The records here are one file, `./CARDS.md`, with a `## <card-id>` section per card**, and that section still carries a `### poster` block beside its `### layout` one. The other three categories are split one file per card and hold a single `### layout` block, which is what `S-51` and `S-52` state and what `test:docs/G1`, `G2` and `G3` enforce. Those two checks carry storage as a falling CEILING rather than an exemption, 31 sections off the block shape and 29 running their labels out of canon order, and the ceiling may only fall. A NEW storage card that arrives off the form pushes the count past it and fails the gate. `S-53`, the label-column half, is already at zero here as it is everywhere |

**The pointer a card carries follows the shape.** A storage module names its section with
`// Design notes for this card: ./CARDS.md#<card-id>`, against the `./CARDS/<card-id>.md` the other
three write, and `recordPointer` in `test/fixtures/catalog.mjs` derives the expected string off the
tree, so the two forms are checked by one walk (`S-36`).

The block labels a record may use are ONE list for all four categories, in `scheme/CANON.md` under
"The record vocabulary". Converting a section is free and reduces the ceiling: give it a single
`### layout` block, run the labels in canon order, move the poster note to a comment above that
card's entry in `./posters.js` (`R-12`), and drop the ceiling in `test/unit/docs.test.mjs` by one.

## Exemplar (`STO.S-04`)

`storage-volume-model.js`, the anchor card. Copy its shape for a new storage card, including the
Pod pulse model: the Pod is one unit and blinks as one, containers included, because they are part
of it rather than neighbours of it (`M-03`).

## Rules of this category only (`STO.*`)

True of every card here unless its own note in `./CARDS.md` says otherwise.

| ID | Rule |
|---|---|
| `STO.C-02` | **No `.highlight` is ever put on an inner CONTAINER box**, or the Pod keeps a lit rectangle after its blink decays. This is the storage reading of `S-19`: cylinders, bands, frames, controllers and claims ARE infrastructure and do light |
| `STO.S-01` | **A step's `opacity` field pins EVERY element born or removed mid-story, and every lane**, exactly as `chips` pins every chip (`P-01`). Eleven cards here state it through a card-local `stage()` factory so the whole set is one literal (`A-16`). `clearHighlights` clears classes, not inline styles, and the reduced replay walks 0..n, so without this a step entered out of order inherits the previous opacities |
| `STO.S-02` | **A block and its lanes are ONE construction and appear together**: there is no legal state where a lane is visible and the block on the end of it is not (`A-16`) |
| `STO.S-03` | **Z-order, bottom to top**: frames, then blocks and disks, then Pods so they sit above their own frame, then lanes and their captions, then the chip strip, then the packet layer (`S-07`) |

## Where these rules bend, measured rather than assumed

Both numbers come from reading the spec data after the migration, not from grep.

- **`STO.C-02` was written as an absolute and is not one.** It is stated below in the form the
  catalogue actually follows: a container box lights as a RECEIVER and is cleared by the reset. The
  absolute reading described nothing: **14 step/key pairs on 8 of the 31 cards here light one**, and
  network does it 110 times across 33 cards with its own rules written on that assumption.
- **`STO.S-01` holds on 29 of 31.** `volume-detach-on-node-loss` and `emptydir` pin only the
  elements their steps move, and stay correct because the replay always walks 0..n from a fresh
  build. Both are recorded in `./CARDS.md`; do not copy the shortcut into a new card, and do not
  "fix" them either, since writing the inherited value out changes the serialised DOM for nothing.

**A volume is named the way a claim is named** (`T-11a`): `PV web`, `PV x73a`, `PV web-0`, matching
the `PVC data-claim` this category writes 14 times. There is ONE form, the kind then a space then
the bare name: `PV-x73a` glued and `pv-web-0` lowercase are both wrong. Bare names belong in a YAML
field a tag quotes (`volumeName: x73a`) and nowhere else.

