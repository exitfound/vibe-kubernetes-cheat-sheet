# CLAUDE.md `js/schemes/storage/` (Volume flow)

Storage covers what a volume is, how a claim finds a volume, how a CSI driver puts it on a Node,
and storage whose lifetime follows a workload. Rules: `scheme/CANON.md`. Module contract and the
test suite: `scheme/CLAUDE.md`. Per-card notes: `./CARDS/<id>.md`, indexed by `./CARDS.md`.

## Sections

| key | label | what belongs here |
|---|---|---|
| `volume-foundations` | Volume Foundations | a volume told with no PVC in the story |
| `volumes-claims` | Volumes & Claims | an API object and the controller reconciling it |
| `csi-mount-path` | CSI & Mount Path | what happens through a CSI call or on the Node |
| `stateful-data` | Stateful Data | a volume whose lifetime follows a workload or another volume |

An object whose whole job is to gate the Node side (VolumeAttachment, CSINode) counts as the Node
side. `storage-generic-ephemeral-volume` is not a foundation, its subject is the PVC it mints.
`storage-csi-ephemeral-volume` is not one either, its subject is the CSI call it goes straight to.

The order of `SUBCATEGORIES` and of the cards inside each is editorial (`D-10`), and `CARDS.md`
indexes the records in that same order.

## Tint and kit

`STORAGE_TINT = { bright: 'rgb(174, 224, 199)' }`, jade (`STO.C-01`). Only the pulse peak is
named (`M-05`).

Beyond the common set, `storage-kit.js` exports `setCylinderLabel(cylEl, txt)`, the `STO` chip
grammar (`CX` 600, `CHIP_H`, `CHIP_GAP`, `CHIP_W`, `CHIP_COUNT`) and `chipStrip({ cx, w, gap,
count })`, which fixes the width and the gap and centres the derived span. A card that fixes a
span and derives `CHIP_W` from it keeps its own formula. `chipsCued` is the usual chip writer
here, and a new card takes the writer of its nearest sibling (`P-09`).

## Geometry

- Actor block 232 by 80, Pod 232 by 104 around a 192 by 44 app box 26 under its label
  (the catalog size, `js/schemes/network/CLAUDE.md`). A card off it says so under `DEVIATES`.
- What is not an actor keeps its own size: listing rows, cells, bands, counters, cylinders.
- A claim chain stacks on one centre line (`STO.L-01`). A card with no claim starts from its
  sentence and `.claude/skills/card-new/reference/compositions.md`.
- Chip strip 232 wide, gap 16, `CHIP_H` 34, centred on 600 (`STO.L-03`, `L-13`).
- Cylinder labels re-centre at `h / 2 + 10` (`STO.L-02`). A cylinder that prints a spec line
  under its name does not re-centre. Copy your own card's offset.
- Frames pad 34 under the top and 12 over the floor (`L-23`). Out and back lanes sit 24 apart
  (`A-23`).
- No `LAYOUT` presets. A card pinned right of the panel writes its own `LEFT_X = 400`.

## Rules of this category only

| ID | Rule |
|---|---|
| `STO.C-01` | Jade is hue 150 at 50 percent saturation. A new shade moves lightness only |
| `STO.L-01` | An ownership chain stacks on one centre line: Pod, claim, then a `cylinder()` disk |
| `STO.L-02` | A cylinder label re-centres on its front face via `labelY`, derived from the height |
| `STO.L-03` | Chips are 232 wide, gap 16, height 34. Shorten the value, never widen (`P-07`) |
| `STO.L-04` | A card's own `900x650` row wins where stricter (`L-06`), its record says why |
| `STO.A-01` | An identity spine is dim and dashed, with no arrowhead and no ball |
| `STO.A-02` | A mount lane runs in its traffic direction, one lane per direction |
| `STO.C-02` | An inner container box lights only as a receiver, never left lit into a later step |
| `STO.S-01` | A step's `opacity` pins every element born or removed mid-story and every lane |
| `STO.S-02` | A block and its lanes are one construction and appear together (`A-16`) |
| `STO.S-03` | Z-order up: frames, blocks and disks, Pods, lanes and captions, chips, packets |
| `STO.S-04` | The exemplar below is the template a new card copies |
| `STO.S-05` | One record per card (`S-51`), every off-default size under `DEVIATES` |
| `STO.D-01` | A card sits in the section whose admission test its subject passes |

A volume is named like a claim, `PV web-0` (`T-11a`). On a card that draws no Kubelet box, a step
whose work only the Kubelet does may name it as the subject without drawing it.

## Exemplar

`storage-generic-ephemeral-volume`: fully declarative, the stack at catalog sizes, a `stage()`
that pins every block and lane on every step, every chip turned over on the arrival that earns it.
