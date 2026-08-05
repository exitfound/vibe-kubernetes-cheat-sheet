# CLAUDE.md `schemes/storage/` (Volume flow)

What is true of Storage cards only. Everything else is in `scheme/CLAUDE.md`: the module contract,
the card construction standard, the motion canon, the opacity vocabulary, the reduced-motion
contract, the writing rules and the gate. If a rule here would also be true of another category,
it is in the wrong file.

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

True of every card here unless its own note in `docs/CARDS-storage.md` says otherwise. It used to be
restated in up to twelve card records each; it lives once, here.

- **A Pod is ONE unit and blinks as one.** The shell and every inner box live in the returned `group`
  and `group` is what `pulsePod` gets. **The wrapping `g` is not optional**: `pulsePod` finds its
  targets with `querySelectorAll`, which matches descendants only and never the element itself, so
  pulsing a bare `pod()` catches the `.scheme-pod-rect` child but not the group and the pulse fires
  at half strength. The anim-dump symptom is strokeOpacity rows with no filter row. No `.highlight`
  is ever put on an inner container box, or the Pod keeps a lit rectangle after its blink decays.
- **Only Pods pulse.** Cylinders, bands, frames, controllers, claims and chips are infrastructure:
  they light via `.highlight` or `lightBoxAt` and never pulse. Value chips never flash. A Pod that
  never went Ready sits dim, so it needs `pulsePodDim` with an opacity lift or the blink is invisible
  against the 0.55 it sits at.
- **Every step writes EVERY chip.** A chip left unset keeps the previous step's value, which is how a
  card comes to report a blocked state on the step where the thing is already running. Each chip name
  means exactly one thing and never reports a neighbour's state.
- **`setStage` / `setBorn` pins EVERY element born or removed mid-story, and every lane**, exactly as
  `setChips` pins every chip, so a step can never silently inherit a block or a lane from the one
  before it. `clearHighlights` clears classes, not inline styles, and the reduced-motion replay path
  walks 0..n, so without this a step entered out of order inherits the previous step's opacities.
  **A block and its lanes are ONE construction and appear together**: there is no legal state where a
  lane is visible and the block on the end of it is not.
- **Lanes pin to 0, blocks pin to `OPACITY.pending`.** A lane into an object that does not exist
  points at nothing and leaves no hole when it goes. A block does leave a hole: cutting one out of a
  mirrored row or a framed shelf reads as a rendering fault rather than as an absence, so an object
  that does not exist yet is drawn as a dim slot with a sublabel saying so.
- **Each static wire and its ball share ONE points array**, so the drawn lane and the packet cannot
  drift apart. Every endpoint is a block edge MIDPOINT, never a hand-typed coordinate. A wire nothing
  rides carries NO arrowhead (`relationPath` or a bare dashed path, since `arrow()` always attaches a
  marker); a lane that carries a ball on any step earns one.
- **Z-order, bottom to top**: frames, then blocks and disks, then Pods so they sit above their own
  frame, then lanes and their captions above the blocks, then the chip strip, then the packet layer
  so every ball rides above everything.
- **`CHIP_W 232` is the family default**, with `CHIP_GAP 16`. `valChip` anchors the name 12 from the
  left and the value 12 from the right, so a chip needs name + value + 24 plus a readable gap. Size
  it against the worst name+value pair on the card, and shorten the VALUE rather than widening.
- **Text rates are PER CLASS and are measured, never estimated.** `.scheme-box-sublabel` is 10px
  JetBrains Mono at 6.03 viewBox units per character; `.scheme-chip-text` and `.scheme-label code`
  are 11px JetBrains Mono at 6.89; box labels are 12px Space Grotesk and proportional, so they vary
  by string. Monospace has zero variance, so one sample is enough. **You must await
  `document.fonts.ready` before measuring** or you measure the fallback monospace, which is about 20
  percent narrower and will flatter you. Do not eyeball a width off a screenshot.
- **The narration panel is HTML laid over the SVG, so the NARROWER the window the MORE viewBox units
  it eats.** Its right edge is `x<=398` catalog-wide; its BOTTOM is per card and driven by the text,
  and it reaches 498 on the longest narration here. A card that keeps content left of 400 must keep
  it below its own measured floor, and several cards below carry the measured table that pins theirs.
  **Editing narration invalidates the measurement, not just moving geometry.** Re-measure with
  `node check-geometry.mjs --rules=occluded`, or `VW=1100 VH=800 node overlay-measure.mjs <card>`.
- **A poster carries no packet dot.** A ball frozen on a wire reads as a paused animation.

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
