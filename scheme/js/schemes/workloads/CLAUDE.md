# CLAUDE.md `schemes/workloads/` (Pods and controllers)

What is true of Workloads cards ALONE. Everything catalog-wide is in **`scheme/CANON.md`** (the
rulebook: layout, arrows, motion, colour, text, chips, metadata, posters, module structure) and
`scheme/CLAUDE.md` (the contract: folder, module, catalog, checklists). **If a rule here would also
be true of another category, it is in the wrong file.**

The rows below carry `WL.*` ids and are indexed from `scheme/CANON.md`.

## The folder

| File | Owns |
|---|---|
| `cards.js` | the 19 `SCHEMES` entries and the `SUBCATEGORIES` list for this category |
| `posters.js` | the 19 grid thumbnails, keyed by card id |
| `workloads-kit.js` | the tint, the two pulse wrappers and the `WL` layout constants; everything else is re-exported from `lib/scheme-kit.js` |
| `workloads-*.js` | one module per card |

A card imports `../../lib/svg.js`, `../../lib/primitives.js` and `./workloads-kit.js`, and never
reaches past the kit (`S-21`). Nothing else may live here (`S-20`).

## Tint

```js
WORKLOADS_TINT = { base: 'rgb(91, 184, 255)', bright: 'rgb(142, 198, 247)' }   // sky blue
```

`base` is the Pod's resting stroke, measured under `reducedMotion` (`M-05`).

## Kit surface

The shared list (`S-22`), plus `WORKLOADS_TINT`, `pulsePod`, `pulsePodDim`, and `WL`, the layout
canon below.

## Subcategories

| key | label | cards | what belongs here |
|---|---|---|---|
| `pods-bootstrap` | Pods Bootstrap | 3 | what happens before the app container is running: init and sidecar ordering, image pull, the QoS class the Pod is born with |
| `pods-lifecycle` | Pods Lifecycle | 8 | one Pod's own state machine: phases, restart policy, hooks, probes, container states, crash loops, shutdown, force deletion |
| `controllers` | Controllers | 8 | an object that manages Pods rather than being one: Deployment, ReplicaSet, StatefulSet, DaemonSet, Job, CronJob |

The line between the first two is whether the app container has started.

## Exemplar

`workloads-probes.js`. Copy its shape for a new workloads card: a vertical down/up connector
driven with `setConnectorDir`.

## Rules of this category only (`WL.*`)

### The layout canon (`WL.L-01`)

The X grammar all 19 workloads cards share, exported from `workloads-kit.js`. Y values stay per
card, because each card's panel bottom is its own measurement (`L-04`).

```js
WL = { M: 60, L: 60, R: 1140, CX: 600, W: 1080,
       TOP_Y: 40, BOX_H: 80, TOP_BOTTOM: 120, SPINE_X: 600,
       LADDER_X: 60, LADDER_W: 480, CHIP_X: 660, CHIP_W: 480, CHIP_H: 34,
       ROW_H: 32, ROW_GAP: 10, LANE_DY: 12 }
```

The shape is an actor row clear of the narration panel, a pipeline ladder and a chip column
flanking a central spine, and a Node frame spanning `L..R` so the content bbox centres on `CX` by
construction.

| ID | Rule |
|---|---|
| `WL.L-02` | The columns are left `60..540` and right `660..1140`, both 480 wide. The Node frame stays full width, and the actor row is centred on `CX` and starts no further left than 420 |
| `WL.L-03` | **A** ladder left, chips right, Node on the floor. Needs `PANEL_B + 20 + LADDER_H + 20 + NODE_H <= 630` |
| `WL.L-04` | **B** the mirror, chips left and ladder right. **This is the common case, not A**: a 4-chip column is 160 tall where a 5-row ladder is 200, and the band left free below a real panel is at most about 214 |
| `WL.L-05` | **C** tall panel, neither column fits below it: ladder right, Node just under the panel, chips as a full-width bottom strip **two or three per row** (532 or 350.7 wide). Never four or five across: 258 and 205 are narrower than the strings, and that produced 79 chip collisions |
| `WL.L-06` | Pick the first of A / B / C that fits vertically against **that card's** measured panel bottom |
| `WL.L-07` | The trunk has to run in the `540..660` corridor to clear both columns and still leave a face midpoint, so **the actor box it leaves must be centred on `WL.SPINE_X`**. That is why several cards carry a first actor box of `420..780` rather than `420..640` |
| `WL.A-01` | The top-row lane PAIR: `REQ_Y = TOP_CY - LANE_DY` carries the request to the API and `RESP_Y = TOP_CY + LANE_DY` carries the answer back. 17 cards draw the pair and 6 ride the answer. Whether the answer lane is an arrow or a relation is decided by the step's own words (`A-06`) |
| `WL.A-02` | **The top-row wire label goes ABOVE the actor row**, at `WIRE_Y = WL.TOP_Y - 12`, never below it. Below, centred at `WIRE_X` on y=146, it lands on the lane and across the spine's step. Nine cards carry that constant identically |
| `WL.S-01` | Each card owns its own `SPINE` points array, and the same array feeds both the drawn wire and the ball. **There is no shared connector helper, and there must not be one**: the previous version kept the wire's points in the card and the ball's points in the kit, two independent copies of the same numbers |

`WL.L-05` is the rule that cost the most: the pass that introduced the 79 collisions closed a
`CENTRE` finding by stretching the chip strip to straddle 600, and the rule went green on a drawing
the author rejected. That is `L-16`, and four findings in the catalog are left open under it.
