# CLAUDE.md `schemes/workloads/` (Pods and controllers)

What is true of Workloads cards only. Everything else is in `scheme/CLAUDE.md`: the module
contract, the card construction standard, the motion canon, the opacity vocabulary, the
reduced-motion contract, the writing rules and the gate. If a rule here would also be true of
another category, it is in the wrong file.

## The folder

| File | Owns |
|---|---|
| `cards.js` | the 19 `SCHEMES` entries and the `SUBCATEGORIES` list for this category |
| `posters.js` | the 19 grid thumbnails, keyed by card id |
| `workloads-kit.js` | the tint, the two pulse wrappers and the `WL` layout constants; everything else is re-exported from `lib/scheme-kit.js` |
| `workloads-*.js` | one module per card |

A card imports `../../lib/svg.js`, `../../lib/primitives.js` and `./workloads-kit.js`. Never reach
past the kit into `scheme-kit.js` directly. Nothing else may live here: `R-modulepath` reports any
other `.js` in this folder as unclaimed.

## Tint

```js
WORKLOADS_TINT = { base: 'rgb(91, 184, 255)', bright: 'rgb(142, 198, 247)' }   // sky blue
```

`base` must equal the Pod's RESTING stroke, which is the CSS value before any pulse has run.
Measure it under `reducedMotion`, or a forwards-filled pulse hands you back its own end state.

## Kit surface

The shared 30 names, plus `WORKLOADS_TINT`, `pulsePod`, `pulsePodDim`, and `WL`, the layout canon
below.

## Subcategories

| key | label | cards | what belongs here |
|---|---|---|---|
| `pods-bootstrap` | Pods Bootstrap | 3 | what happens before the app container is running: init and sidecar ordering, image pull, the QoS class the Pod is born with |
| `pods-lifecycle` | Pods Lifecycle | 8 | one Pod's own state machine: phases, restart policy, hooks, probes, container states, crash loops, shutdown, force deletion |
| `controllers` | Controllers | 8 | an object that manages Pods rather than being one: Deployment, ReplicaSet, StatefulSet, DaemonSet, Job, CronJob |

The line between the first two is whether the app container has started.

## The layout canon (`WL`)

The X grammar all 19 workloads cards share. Y values stay per card, because each card's panel
bottom is its own measurement.

```js
WL = { M: 60, L: 60, R: 1140, CX: 600, W: 1080, PANEL_R: 400,
       TOP_Y: 40, BOX_H: 80, TOP_BOTTOM: 120, SPINE_X: 600,
       LADDER_X: 60, LADDER_W: 480, CHIP_X: 660, CHIP_W: 480, CHIP_H: 34,
       ROW_H: 32, ROW_GAP: 10, LANE_DY: 12 }
```

The shape is an actor row clear of the narration panel, a pipeline ladder and a chip column
flanking a central spine, and a Node frame spanning `L..R` so the content bbox centres on `CX` by
construction.

### Which column gets which content: A / B / C

The columns are left `60..540` and right `660..1140`, both 480 wide. The Node frame stays full
width, and the actor row is centred on `CX` and starts no further left than 420. Pick the first
that fits vertically against **that card's** measured panel bottom:

- **A** ladder left, chips right, Node on the floor. Needs `PANEL_B + 20 + LADDER_H + 20 + NODE_H <= 630`.
- **B** the mirror, chips left and ladder right. **This is the common case, not A**: a 4-chip
  column is 160 tall where a 5-row ladder is 200, and the band left free below a real panel is at
  most about 214.
- **C** tall panel, neither column fits below it: ladder right, Node just under the panel, chips as
  a full-width bottom strip **two or three per row** (532 or 350.7 wide). Never four or five
  across: 258 and 205 are narrower than the strings, and that produced 79 chip collisions.

### Two constraints the constant block does not state

The trunk has to run in the `540..660` corridor to clear both columns and still leave a face
midpoint, so **the actor box it leaves must be centred on `WL.SPINE_X`**. That is why several cards
carry a first actor box of `420..780` rather than `420..640`.

Node frame label clearance is a catalog-wide rule, not a workloads one: it is in
`schemes/cluster/CLAUDE.md`, where the family geometry lives.

### Do not close a `CENTRE` finding by stretching a strip or widening a frame

The pass that introduced the 79 collisions did exactly that, to make the chip strip straddle 600,
and the rule went green on a drawing the author rejected. If a finding can only be closed by making
the picture worse, leave it open and write the reason into `docs/CARDS-workloads.md`. Four in the
catalog are left that way.

## Exemplar

`workloads-probes.js`. Copy its shape for a new workloads card: a vertical down/up connector
driven with `setConnectorDir`.

Each card owns its own `SPINE` points array, and the same array feeds both the drawn wire and the
ball. There is no shared connector helper, and there must not be one: the previous version kept the
wire's points in the card and the ball's points in the kit, two independent copies of the same
numbers, which is exactly what the "same points array" rule exists to prevent.
