# CLAUDE.md `schemes/storage/` (Volume flow)

What is true of Storage cards only. Everything else is in `scheme/CLAUDE.md`: the module contract,
the card construction standard, the motion canon, the opacity vocabulary, the reduced-motion
contract, the writing rules and the gate. If a rule here would also be true of another category,
it is in the wrong file.

**A comment in a card is at most TWO lines**, saying what the line beside it does or where a number
came from. It carries no date, no past defect and no account of an earlier version. Anything longer
is a rule (this file), a measurement (`./CARDS.md`) or history (delete it).

## The folder

| File | Owns |
|---|---|
| `cards.js` | the 31 `SCHEMES` entries and the `SUBCATEGORIES` list for this category |
| `posters.js` | the 31 grid thumbnails, keyed by card id |
| `storage-kit.js` | the tint, the two pulse wrappers and `setCylinderLabel`; everything else is re-exported from `lib/scheme-kit.js` |
| `storage-*.js` | one module per card |

A card imports `../../lib/svg.js`, `../../lib/primitives.js` and `./storage-kit.js`. Never reach
past the kit into `scheme-kit.js` directly. Nothing else may live here: `R-modulepath` reports any
other `.js` in this folder as unclaimed.

## Tint

```js
STORAGE_TINT = { base: 'rgb(94, 202, 148)', bright: 'rgb(174, 224, 199)' }   // jade
```

`base` must equal the Pod's RESTING stroke, which is the CSS value before any pulse has run.
Measure it under `reducedMotion`, or a forwards-filled pulse hands you back its own end state.

Jade is hue 150 at 50% saturation, and that ceiling is the point: a green above roughly 50% goes
acid on this canvas. If a new shade is needed, move lightness, not saturation.

## Kit surface

The shared 30 names, plus `STORAGE_TINT`, `pulsePod`, `pulsePodDim`, and one storage-only helper:

```js
setCylinderLabel(cylEl, txt)    // the label inside a cylinder(), the way setBoxLabel is for a box
```

## Layout grammar: the vertical stack

Storage does not use the left-to-right pipeline the other categories use. Its grammar is a stack
centered on a spine:

- a Pod on top, its containers inside it
- the backing volume below, drawn as a `cylinder()` disk
- a dim, arrowhead-less **identity spine** at the centre x, saying "this volume belongs to this
  Pod". Nothing travels it, so it carries no ball and no arrowhead
- one L-shaped **mount lane** per container, dropping from the container and entering the cylinder
  through its SIDE, written in its one traffic direction so the arrowhead lands at the receiving
  end. One-way traffic gets one lane; a round trip gets a lane each way

A cylinder's label is re-centred on the visible front face (below the cap ellipse) by setting
`y: 64` on `.scheme-cylinder-label`, which is the family standard shared by `volume-model`,
`emptydir` and `container-filesystem`. `cylinder()` centres on the raw bbox, and the cap ellipse is
not part of the face you see, so the default sits visibly high inside the body. Derive the offset
from the cylinder height rather than typing the resulting literal.

## The storage card contract

Storage deltas on top of the shared canon in `scheme/CLAUDE.md`. True of every card here unless its
own note in `./CARDS.md` says otherwise.

- **No `.highlight` is ever put on an inner container box**, or the Pod keeps a lit rectangle after
  its blink decays. Cylinders, bands, frames, controllers and claims are infrastructure and light.
- **`setStage` / `setBorn` pins EVERY element born or removed mid-story, and every lane**, exactly as
  `setChips` pins every chip. `clearHighlights` clears classes, not inline styles, and the reduced
  replay walks 0..n, so without this a step entered out of order inherits the previous opacities.
  **A block and its lanes are ONE construction and appear together**: there is no legal state where a
  lane is visible and the block on the end of it is not.
- **Every endpoint is a block edge MIDPOINT**, never a hand-typed coordinate.
- **Z-order, bottom to top**: frames, then blocks and disks, then Pods so they sit above their own
  frame, then lanes and their captions, then the chip strip, then the packet layer.
- **`CHIP_W 232` is the family default**, with `CHIP_GAP 16`. `valChip` anchors the name 12 from the
  left and the value 12 from the right, so a chip needs name + value + 24 plus a readable gap. Size
  it against the worst name+value pair on the card, and shorten the VALUE rather than widening.
- **Text rates are PER CLASS and are measured, never estimated.** `.scheme-box-sublabel` is 10px
  JetBrains Mono at 6.03 viewBox units per character; `.scheme-chip-text` and `.scheme-label code`
  are 11px JetBrains Mono at 6.89; box labels are 12px Space Grotesk and proportional, so they vary
  by string. Monospace has zero variance, so one sample is enough. **Await `document.fonts.ready`
  before measuring** or you measure the fallback, which is about 20 percent narrower and flatters
  you. Do not eyeball a width off a screenshot.
- The panel bottom reaches **498** on the longest narration here, the deepest in the catalog, so
  several cards below carry a measured table pinning their own floor.

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
of it rather than neighbours of it.

## Riding labels

Storage and Networking both ride a tag on the ball; in storage it rides the mount lane carrying
`mount /data`, `write`, `read`. That rule is shared and lives once, in `scheme/CLAUDE.md` under
"Riding labels and `lightBoxAt`". Read it before adding a tag: the easing has to match the ball it
rides, and a wrong one drifts off mid-flight in a way no static screenshot shows.
