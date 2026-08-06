# CLAUDE.md `schemes/storage/` (Volume flow)

What is true of Storage cards ALONE. Everything catalog-wide is in **`scheme/CANON.md`** (the
rulebook: layout, arrows, motion, colour, text, chips, metadata, posters, module structure) and
`scheme/CLAUDE.md` (the contract: folder, module, catalog, checklists). **If a rule here would also
be true of another category, it is in the wrong file.**

The rows below carry `STO.*` ids and are indexed from `scheme/CANON.md`.

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

The shared list (`S-22`), plus `STORAGE_TINT`, `pulsePod`, `pulsePodDim`, and one storage-only
helper:

```js
setCylinderLabel(cylEl, txt)    // the label inside a cylinder(), the way setBoxLabel is for a box
```

## Subcategories

| key | label | cards | what belongs here |
|---|---|---|---|
| `volume-foundations` | Volume Foundations | 8 | what a volume IS before any claim exists: the model, the container filesystem, and the volume types that need no PV |
| `volumes-claims` | Volumes & Claims | 8 | the PV/PVC object dance: binding, provisioning, modes, expansion, protection, reclaim, phases |
| `csi-mount-path` | CSI & Mount Path | 8 | the driver and the path from API object to a mounted directory on a Node: attach, mount, ownership, limits, detach |
| `stateful-data` | Stateful Data | 7 | storage that outlives or follows a workload: templates, retention, topology, snapshots, clones |

The line between `volumes-claims` and `csi-mount-path` is whether the card's subject is an API
object or a Node-side action.

## Exemplar

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
| `STO.L-02` | A cylinder's label is re-centred on the visible front face (below the cap ellipse) by setting `y: 64` on `.scheme-cylinder-label`, the family standard shared by `volume-model`, `emptydir` and `container-filesystem`. `cylinder()` centres on the raw bbox and the cap ellipse is not part of the face you see, so the default sits visibly high inside the body. **Derive the offset from the cylinder height rather than typing the resulting literal** |
| `STO.L-03` | **`CHIP_W 232` is the family default**, with `CHIP_GAP 16`. Size a chip against the worst name+value pair on the card, and shorten the VALUE rather than widening (`P-07`) |
| `STO.C-02` | **No `.highlight` is ever put on an inner CONTAINER box**, or the Pod keeps a lit rectangle after its blink decays. This is the storage reading of `S-19`: cylinders, bands, frames, controllers and claims ARE infrastructure and do light |
| `STO.S-01` | **`setStage` / `setBorn` pins EVERY element born or removed mid-story, and every lane**, exactly as `setChips` pins every chip (`P-01`). `clearHighlights` clears classes, not inline styles, and the reduced replay walks 0..n, so without this a step entered out of order inherits the previous opacities |
| `STO.S-02` | **A block and its lanes are ONE construction and appear together**: there is no legal state where a lane is visible and the block on the end of it is not (`A-16`) |
| `STO.S-03` | **Z-order, bottom to top**: frames, then blocks and disks, then Pods so they sit above their own frame, then lanes and their captions, then the chip strip, then the packet layer (`S-07`) |
| `STO.L-04` | Several cards carry a measured table pinning their own panel floor, and some of those tables include a `900x650` row that is stricter than anything `check-geometry` samples. Where the two disagree the card takes the stricter number and says so (`L-06`) |

Storage's deepest panel is 354 units (`storage-ephemeral-storage-eviction`), not the catalog
maximum: that is 503 on `workloads-pod-phase-machine` (`L-04`).
