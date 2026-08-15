# CLAUDE.md `schemes/workloads/` (Pods and controllers)

What is true of Workloads cards ALONE. Everything catalog-wide is in **`scheme/CANON.md`** (the
rulebook: layout, arrows, motion, colour, text, chips, metadata, posters, module structure) and
`scheme/CLAUDE.md` (the contract: folder, module, catalog, checklists). **If a rule here would also
be true of another category, it is in the wrong file.**

The rows below carry `WL.*` ids and are indexed from `scheme/CANON.md`. **The TEXT of a `WL.*` rule
lives here and only here**: the canon carries the id and a subject label, never a second copy of the
rule. This is the folder that paid for the second copy: `WL.L-03`, `WL.L-04` and `WL.L-05` had come
to mean one thing here and a different thing there, and the numbering below is the one that stands.

## The folder

| File | Owns |
|---|---|
| `cards.js` | the 19 `SCHEMES` entries and the `SUBCATEGORIES` list for this category |
| `posters.js` | the 19 grid thumbnails, keyed by card id |
| `workloads-kit.js` | the tint, the two pulse wrappers, the `WL` layout constants and the `LAYOUT` A/B/C column presets, plus the `P` / `F` / `defineCard` bindings; everything else is re-exported from `lib/scheme-kit.js` and `lib/layout.js` |
| `workloads-*.js` | one module per card |

A card imports `../../lib/svg.js`, `../../lib/primitives.js` and `./workloads-kit.js`, and never
reaches past the kit (`S-21`). Nothing else may live here (`S-20`).

## Tint (`WL.C-01`)

```js
WORKLOADS_TINT = { base: 'rgb(91, 184, 255)', bright: 'rgb(142, 198, 247)' }   // sky blue
```

`base` is the Pod's resting stroke, measured under `reducedMotion` (`M-05`).

## Kit surface

The shared list (`S-22`), the `P` / `F` / `defineCard` bindings every category kit makes, `POD_VIOLET`
and the six `lib/layout.js` formulas (`laneY`, `ladder`, `strip`, `spread`, `midX`, `shade`), plus
`WORKLOADS_TINT` and its two pulses. Two names are workloads-only: `WL`, the layout canon below, and
`LAYOUT`, its A/B/C column presets.

The binding is `{ role: 'workloads', podRole: 'workloads', tint: null }`. `podRole` equals the
category role and the tint is null **because a workloads Pod is already the category blue**: only
cluster draws a FOREIGN Pod and therefore has to pin `POD_VIOLET`. A card writes no `role:` for its
own elements, so every surviving `role:` literal is a deliberate cross-category override.

## Subcategories (`WL.D-01`)

| key | label | cards | what belongs here |
|---|---|---|---|
| `pods-bootstrap` | Pods Bootstrap | 3 | what happens before the app container is running: init and sidecar ordering, image pull, the QoS class the Pod is born with |
| `pods-lifecycle` | Pods Lifecycle | 8 | one Pod's own state machine: phases, restart policy, hooks, probes, container states, crash loops, shutdown, force deletion |
| `controllers` | Controllers | 8 | an object that manages Pods rather than being one: Deployment, ReplicaSet, StatefulSet, DaemonSet, Job, CronJob |

The line between the first two is whether the app container has started.

## Exemplar

`workloads-probes.js`, 178 lines and fully declarative. **New cards go in this form.** Copy its
shape rather than inventing one:

- One import line from `./workloads-kit.js`, the `S-36` pointer comment, the geometry header,
  `SCENE`, step-local constants, `STEPS_SPEC`, then `init` last.
- The header keeps its MEASURED numbers as literals with their comments (`L-07`) and derives the
  rest through the kit's formulas. Columns come from `LAYOUT.A`, never from a raw x.
- `SCENE.parts` is an ordered list and the order IS the z-order, so it reproduces what a
  hand-written `build()` said by where a line sat. `reset.keys` and `reset.pods` are written out.
- The vertical down/up connector is a PAIR of lanes, one of them built at `opacity: 0`, and the step
  field `opacity: { connectorDown, connectorUp }` picks which is visible. The card states that pair
  once, in a `corridor(dir)` helper that RETURNS an object of fields: that shape (IV.7) is how every
  imperative writer in this category was replaced, and it keeps `A-16` in one place.
- Its four `role: 'cluster'` overrides are what a workloads card looks like when it draws the
  control plane acting ON the Pod.

## Rules of this category only (`WL.*`)

### The layout canon (`WL.L-01`)

The X grammar all 19 workloads cards share, exported from `workloads-kit.js`. Y values stay per
card, because each card's panel bottom is its own measurement (`L-04`).

```js
WL = { M: 60, L: 60, R: 1140, CX: 600, W: 1080,
       TOP_Y: 40, BOX_H: 80, TOP_BOTTOM: 120, SPINE_X: 600,
       COL_L: { x: 60, w: 480 }, COL_R: { x: 660, w: 480 }, CHIP_H: 34,
       ROW_H: 32, ROW_GAP: 10, LANE_DY: 12 }

LAYOUT = { A: { ladder: WL.COL_L, chips: WL.COL_R },
           B: { chips: WL.COL_L, ladder: WL.COL_R },
           C: { ladder: WL.COL_R, strip: { two: 532, three: 350.7 } } }
```

**The columns are named by POSITION, and that is the whole reason `LAYOUT` exists.** They used to be
`LADDER_X` and `CHIP_X`, named for their role in layout A, and B and C dominate: 16 of the 19 cards
opened with `const LAD_X = WL.CHIP_X`, a line whose name states the opposite of what it does. Picking
a layout is now one edit, `LAYOUT.A` / `.B` / `.C`, and the four role-named keys are gone.

The shape is an actor row clear of the narration panel, a pipeline ladder and a chip column
flanking a central spine, and a Node frame spanning `L..R` so the content bbox centres on `CX` by
construction.

| ID | Rule |
|---|---|
| `WL.L-02` | The columns are left `60..540` and right `660..1140`, both 480 wide. The Node frame stays full width, and the actor row is centred on `CX` and starts no further left than 420 |
| `WL.L-03` | **A** (`LAYOUT.A`) ladder left, chips right, Node on the floor. Needs `PANEL_B + 20 + LADDER_H + 20 + NODE_H <= 630` |
| `WL.L-04` | **B** (`LAYOUT.B`) the mirror, chips left and ladder right. **This is the common case, not A**: a 4-chip column is 160 tall where a 5-row ladder is 200, and the band left free below a real panel is at most about 214 |
| `WL.L-05` | **C** (`LAYOUT.C`) tall panel, neither column fits below it: ladder right, Node just under the panel, chips as a full-width bottom strip **two or three per row** (532 or 350.7 wide). Never four or five across: 258 and 205 are narrower than the strings, and that produced 79 chip collisions |
| `WL.L-06` | The choice itself is `L-08a`, which cluster obeys too. What is workloads alone: the split over these 19 cards, measured A 3, B 7, C 9 |
| `WL.L-07` | The trunk has to run in the `540..660` corridor to clear both columns and still leave a face midpoint, so **the actor box it leaves must be centred on `WL.SPINE_X`**. That is why several cards carry a first actor box of `420..780` rather than `420..640` |
| `WL.A-01` | The top-row lane PAIR: `REQ_Y = TOP_CY - LANE_DY` carries the request to the API and `RESP_Y = TOP_CY + LANE_DY` carries the answer back. 17 cards draw the pair and 6 ride the answer. Whether the answer lane is an arrow or a relation is decided by the step's own words (`A-06`) |
| `WL.A-02` | **The top-row wire label goes ABOVE the actor row**, at `WIRE_Y = WL.TOP_Y - 12`, never below it. Below, centred at `WIRE_X` on y=146, it lands on the lane and across the spine's step. Nine cards carry that constant identically |
| `WL.S-01` | Each card owns its own `SPINE` points array, and the same array feeds both the drawn wire and the ball. **There is no shared connector helper, and there must not be one**: the previous version kept the wire's points in the card and the ball's points in the kit, two independent copies of the same numbers |

`WL.L-05` is the rule that cost the most: the pass that introduced the 79 collisions closed a
`CENTRE` finding by stretching the chip strip to straddle 600, and the rule went green on a drawing
the author rejected. That is `L-16`, and four findings in the catalog are left open under it.

## The escape hooks this category still needs

All 19 cards are in the declarative form. **15 are fully declarative**; four carry a hook, and each
exists for something with no honest general verb. `step.enter`, `step.motion`, `F.run` and
`reset.extra` are used by NOBODY here, and migrating the category required the DSL to grow zero times.

| Card | Hook | What it wraps, and why no field expresses it |
|---|---|---|
| `workloads-crashloopbackoff` | `P.raw`, one factory over six rungs | The backoff ladder is built from `chip()` in `primitives.js`, a label-only chip no part kind builds. The six rungs carry their own keys (`rung0..rung5`), which is what `lit` and `reset.keys` address. **The `tune` that also collected them into `refs.ladderChips` was removed 2026-08-15**: nothing read the array |
| `workloads-cronjob` | `P.raw`, one factory over six rungs | The identical construct, for the schedule ticks, with keys `tick0..tick5` |
| `workloads-init-containers-and-sidecars` | `part.tune` on the `P.pod` | The Pod holds FOUR peer container boxes; `buildPod` carries exactly one `inner` and would hand it the Pod's own role, turning four `role: 'cluster'` boxes blue. They must also sit inside the shell group, because `pulsePod` reaches only what the Pod contains |
| `workloads-pod-image-pull` | `P.raw` | The registry cloud is a bare `<path>`, the only one in the category, and the only card importing `path` from `lib/svg.js` |

**A `P.raw` factory is the one place a card still writes its own `role:`**, because `P.raw` bypasses
the kit binding by construction and the primitive has to be handed the role by hand. `cronjob`'s tick
rung is the single `role: 'workloads'` literal left in the category for exactly that reason.

`reducedLit` is declared on **7 cards over 20 steps** (`rolling-update` 5, `deployment-rollback`,
`daemonset`, `replicaset`, `statefulset-ordered-startup` 3 each, `cronjob` 2, `force-deletion` 1),
against 2 steps in the whole of cluster. The shape is always the same: the animated path says "this
Pod is here now" by PULSING the wrapper, and no `lightBoxAt` names the inner box, so `flowLights`
cannot derive it. A wrong derivation lands on the HIGHLIGHT axis of `render/reduced.test.mjs`,
which is enforced, so `npm test` is what catches it.

## Four catalog-wide lane rules the canon sources here

`A-06`, `A-09`, `A-10` and `A-12` are catalog-wide rows in `scheme/CANON.md` and that is where the
rule text is. They were derived on this category's control-plane cards, so the canon's `Source`
column points at this file for the working that produced them. This section is that working, not a
second statement of the rules.

**Which of the two a lane IS (`A-06`).** Where a step NAMES something arriving from the API, the
lane gets a ball, and the receiving box goes dark at step entry and lights on arrival, because it is
a receiver now. Where no step names anything coming back, it is a relationship: `relationPath`, no
arrowhead, `stroke-opacity: 0.45`, category tint kept. Three things the ball costs, every time:

1. An added hop is about 800ms (a 60 unit gap sits on the `PKT_DUR_MIN` floor of 700, plus
   `BEAT.afterHop`), so `duration` usually has to rise and `render/duration.test.mjs` says by how much.
2. A return FLIPS THE SENDER INTO A RECEIVER, so a box lit at step entry has to go dark and light on
   arrival instead, or `R3` in `report/arrival.test.mjs` reports it.
3. `BEAT` missing from a card's imports throws a `ReferenceError` that `Timeline` swallows into
   `console.error`: the step plays its first packet and silently stops (`S-33`). Only the browser
   smoke sees it, so run it after touching any card's imports.

**A lane leaves the box that ACTS (`A-09`).** On a control-plane card the leftmost box writes to the
API and stops there, so what then happens on a Node is that write taking effect and the lane into
the Node band belongs to the API. `workloads-force-deletion` is the model. Two traps come with
moving one:

- Moving a lane is a TIMING change, because `routeDur` is length-based: moving a start 300 to 400
  units right adds 250 to 870ms per ball. Raise the duration, never shorten the motion (`A-11`).
- A box can be DERIVED FROM the lane (`KUBECTL_X = SPINE_X - BOX_W / 2`), so redefining the spine
  moves the box instead of the lane, and such a card needs its own constant (`A-12`).

**Two actors, one slot (`A-10`).** Draw two lanes over a shared drop rather than picking a winner.
Picking one is an editorial claim about which actor matters, made silently in geometry, and the
reader has no way to see that the other one was considered.
