# CLAUDE.md `schemes/storage/` (Volume flow)

What is true of Storage cards ALONE. Everything catalog-wide is in **`scheme/CANON.md`** (the
rulebook: layout, arrows, motion, colour, text, chips, metadata, posters, module structure) and
`scheme/CLAUDE.md` (the contract: folder, module, catalog, checklists). **If a rule here would also
be true of another category, it is in the wrong file.**

The rows below carry `STO.*` ids and are indexed from `scheme/CANON.md`. **The TEXT of a `STO.*`
rule lives here and only here**: the canon carries the id and a subject label, never a second copy
of the rule. `STO.S-02` and `STO.S-03` had come to mean one thing here and a different thing there,
and the numbering below is the one that stands. The exemplar the canon used to carry as `STO.S-03`
is now `STO.S-04`, below.

## The folder

| File | Owns |
|---|---|
| `cards.js` | the 31 `SCHEMES` entries and the `SUBCATEGORIES` list for this category |
| `posters.js` | the 31 grid thumbnails, keyed by card id |
| `storage-kit.js` | the tint, the two pulse wrappers and `setCylinderLabel`; everything else is re-exported from `lib/scheme-kit.js` |
| `storage-*.js` | one module per card |

A card imports `../../lib/svg.js`, `../../lib/primitives.js` and `./storage-kit.js`, and never
reaches past the kit (`S-21`). Nothing else may live here (`S-20`).

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
chipStrip({ cx, w, gap, count })  // fix w AND gap, derive the span, centre it
```

`STO` holds the centre (`CX` 600, where 22 of the 23 cards naming a centre put it and where 30 of 31
chip strips sit), the canvas band, the panel-clearing `SAFE_L` 400, and the chip scalars to reach
for. There is **no `LAYOUT.A/B/C`**, and that is a measurement rather than an omission: cluster and
workloads carry presets because which column holds the ladder genuinely varies, while storage has one
composition and only 3 cards declare a column width at all, at 516 / 180 / 176.

`chipStrip` exists because `lib/layout.js` cannot say what 23 cards hand-roll: `strip()` fixes the
gap and derives the width, `spread()` fixes the width and derives the gap, and both span an exact
`from..to` instead of centring. **Match the derivation DIRECTION, not just the coordinates**: a card
that fixes the SPAN and derives `CHIP_W` from it keeps its own formula even where the x values agree.

## The escape hooks this category needs

All 31 cards are in the declarative form. **15 are fully declarative**; 16 carry a hook, the highest
share of any category, and the DSL still did not have to grow. `reset.extra` and `step.motion` are
used by NOBODY here.

| Hook | Cards | What it wraps, and why no field says it |
|---|---|---|
| `part.tune` | 10 | An SVG **attribute** on a nested element the part kind does not hand back (`.scheme-pod-sublabel`'s `y`, a `node()` caption's `y`, a box label's `y`), a `style.fill` on a `.scheme-box-rect`, or **an ARRAY ref**: no part kind produces one, and both dumps name array members `key[n]`, so the array is load-bearing vocabulary |
| `P.raw` | 8 sites | A markerless, role-less identity spine (`P.lane` adds a marker, `P.relation` adds the relation class and `data-role`), a bare `<line>` or `<rect>`, a frame border whose stroke is inline style, a bare `pod()` (`podShell()` is `pod()` PLUS the inline wash, so `P.pod` would add one), and the one Pod with two peer inner boxes |
| `step.enter` | 3 cards | Text no field reaches: `setCylinderLabel` writes `.scheme-cylinder-label` where `labels:` writes `.scheme-box-label`, a free `<text>`'s `textContent`, and a per-step `style.fill` on 24 slot rects |
| `F.run` at delay 0 | 5 cards | **Not an escape, and not a timer**: `at()` short-circuits on `delay <= 0` and runs the callback inline, registering nothing, so it is an imperative beat standing exactly where the hand-written call stood. It is what reproduces a card-owned `onfinish` (`F.fade` carries only `unlight`), a deferred UNLIGHT, and any write through an array ref |

**A `P.wire` is unreachable by every opacity field.** Wires land in `refs.wires[key]` and `opacity:`,
`rewind.opacity`, `F.fade` and `F.reveal` all resolve `refs[key]`. Adding a scalar key to make one
reachable renames it in the reduced AND settled dumps, because both claim scalar keys before
`wires.*` and naming is first-wins. A wire that animates needs `F.run` at delay 0.

**`chipsCued`, not `chips`, is this category's default.** Storage is the only consumer of `setChip`:
`storage-ephemeral-storage-eviction` and `storage-projected-volume` are pure `setVal` (so pure
`chips`), `storage-pvc-binding` mixes both, and the other 28 are pure `chipsCued`.

## Two rules this category does not actually follow

Measured from the spec data after migration, not by grep. Both are recorded rather than enforced,
because closing either means changing pictures that are not wrong.

- **`STO.C-02`** forbids `.highlight` on an inner container box. **14 step/key pairs on 8 of the 31
  cards do it.** It is not a storage habit either: network does it 110 times across 33 cards, and
  that folder's own rules are written on the assumption that it does. The rule's stated reason (a lit rectangle
  outliving the Pod's blink) is real, but the rule as written describes neither this category nor
  the catalogue.
- **`STO.S-01`** says every element born or removed mid-story is pinned on every step. **2 of 31
  cards pin only partially** (`volume-detach-on-node-loss`, `emptydir`), latent only because the
  replay always walks 0..n from a fresh build.

## Subcategories (`STO.D-01`)

| key | label | cards | what belongs here |
|---|---|---|---|
| `volume-foundations` | Volume Foundations | 8 | what a volume IS before any claim exists: the model, the container filesystem, and the volume types that need no PV |
| `volumes-claims` | Volumes & Claims | 8 | the PV/PVC object dance: binding, provisioning, modes, expansion, protection, reclaim, phases |
| `csi-mount-path` | CSI & Mount Path | 8 | the driver and the path from API object to a mounted directory on a Node: attach, mount, ownership, limits, detach |
| `stateful-data` | Stateful Data | 7 | storage that outlives or follows a workload: templates, retention, topology, snapshots, clones |

The line between `volumes-claims` and `csi-mount-path` is whether the card's subject is an API
object or a Node-side action.

## Exemplar (`STO.S-04`)

`storage-volume-model.js`, the anchor card. Copy its shape for a new storage card, including the
Pod pulse model: the Pod is one unit and blinks as one, containers included, because they are part
of it rather than neighbours of it (`M-03`).

## Rules of this category only (`STO.*`)

True of every card here unless its own note in `./CARDS.md` says otherwise.

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
| `STO.C-02` | **No `.highlight` is ever put on an inner CONTAINER box**, or the Pod keeps a lit rectangle after its blink decays. This is the storage reading of `S-19`: cylinders, bands, frames, controllers and claims ARE infrastructure and do light |
| `STO.S-01` | **`setStage` / `setBorn` pins EVERY element born or removed mid-story, and every lane**, exactly as `setChips` pins every chip (`P-01`). `clearHighlights` clears classes, not inline styles, and the reduced replay walks 0..n, so without this a step entered out of order inherits the previous opacities |
| `STO.S-02` | **A block and its lanes are ONE construction and appear together**: there is no legal state where a lane is visible and the block on the end of it is not (`A-16`) |
| `STO.S-03` | **Z-order, bottom to top**: frames, then blocks and disks, then Pods so they sit above their own frame, then lanes and their captions, then the chip strip, then the packet layer (`S-07`) |
| `STO.L-04` | Several cards carry a measured table pinning their own panel floor, and some of those tables include a `900x650` row that is stricter than anything `check-geometry` samples. Where the two disagree the card takes the stricter number and says so (`L-06`) |

Storage's deepest panel is 354 units (`storage-ephemeral-storage-eviction`), not the catalog
maximum: that is 503 on `workloads-pod-phase-machine` (`L-04`).
