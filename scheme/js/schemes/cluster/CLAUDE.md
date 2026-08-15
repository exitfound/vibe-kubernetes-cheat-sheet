# CLAUDE.md `schemes/cluster/` (Cluster internals)

What is true of Cluster cards ALONE. Everything catalog-wide is in **`scheme/CANON.md`** (the
rulebook: layout, arrows, motion, colour, text, chips, metadata, posters, module structure) and
`scheme/CLAUDE.md` (the contract: folder, module, catalog, checklists). **If a rule here would also
be true of another category, it is in the wrong file.**

The rows below carry `CLU.*` ids and are indexed from `scheme/CANON.md`. **The TEXT of a `CLU.*`
rule lives here and only here**: the canon carries the id and a subject label, never a second copy
of the rule. Six ids across the four folders had drifted into meaning two different things, and
`CLU.S-01` was one of them: what the canon carried under it now lives here as `CLU.S-02`.

## The folder

| File | Owns |
|---|---|
| `cards.js` | the 21 `SCHEMES` entries and the `SUBCATEGORIES` list for this category |
| `posters.js` | the 21 grid thumbnails, keyed by card id |
| `cluster-kit.js` | the tint and the two pulse wrappers; everything else is re-exported from `lib/scheme-kit.js` |
| `cluster-*.js` | one module per card |

A card imports `../../lib/svg.js`, `../../lib/primitives.js` and `./cluster-kit.js`, and never
reaches past the kit (`S-21`). Nothing else may live here (`S-20`).

## Tint

```js
CLUSTER_TINT = { base: 'rgb(192, 176, 255)', bright: 'rgb(224, 214, 255)' }   // violet
```

`base` is the Pod's resting stroke, measured under `reducedMotion` (`M-05`).

| ID | Rule |
|---|---|
| `CLU.C-01` | The category's CHROME colour (`#7d86ff` indigo, `css/tokens.css`) is a different value for a different job: chrome keys off `data-cat`, diagram elements off `data-role` (`C-15`) |

## Kit surface

The shared list (`S-22`) and the own set every kit adds (`P`, `F`, `defineCard`, `POD_VIOLET`, the
`lib/layout.js` formulas), plus `CLUSTER_TINT` and its two pulses. Two names are cluster-only:
`CLU`, the X grammar, and `LAYOUT`, its `A` / `B` / `C` column presets. There is no cluster-only
behaviour helper: both are frozen geometry.

## The escape hooks this category needs

All 21 cards are in the declarative form. **14 are fully declarative**; seven carry a hook, **42
sites in all**, and the DSL did not have to grow once. `step.motion` is used by NOBODY here, and by
nobody in the catalogue.

The counts are SITES the layer actually receives, not `tune:` literals in the source, because four
of the seven build their hooks in a factory: `cluster-node-allocatable` reads as one `tune` and
hands the layer four. Read them off the imported specs, the way `report/skeleton-census.test.mjs`
totals them, never off grep.

| Hook | Cards | What it wraps, and why no field says it |
|---|---|---|
| `part.tune` | 6 cards, 11 sites | Three jobs, none of them a field. A `style.fill` (plus a `strokeDasharray` on `resource-quota`) on the `.scheme-box-rect` NESTED inside a `P.box`, which hands back the wrapping `g` and not the rect: `node-allocatable` x4 through one `segment()` factory, `resource-quota` x3 through `budgetBlock()`, `server-side-apply` x1, all three so a stroke-only piece laid over a bar does not double the fill under it. A nested element captured AS A REF: `scheduler-decision` takes Node-4's `.scheme-box-label` and `.scheme-box-sublabel` so the placed Pod can hide the text it covers, and `api-structure` takes the chain's `[data-idx="3"]` row and pins it hidden, because `P.chain` hands back one element and not its rows. And on `pod-sandbox-cri`, a SECOND inner box built inside the Pod shell, because `buildPod` carries exactly one `inner` and `pulsePod` reaches only what the Pod group contains |
| `P.raw` | 3 cards, 11 sites | A bare `<rect>` carrying inline `fill`, `stroke` and `width`: `cpu-throttling` x6, a track and a fill bar per CFS period through one `period(i)` factory, where a `P.box` would drag the content centre to 750 against 600. Two STACKED `<text>` nodes in one chip group, which no part kind builds: `api-structure` x4 over `SLOT_KEYS`, its watch-event slots. A label-only `chip()` from `primitives.js`, a command rather than the name/value pair `P.chip` writes: `resource-quota` x1 |
| `step.enter` | 3 cards, 14 sites | Text and an ATTRIBUTE, on elements the card made itself. `api-structure` x6: `setSlot` writes the `textContent` of BOTH stacked texts on a slot. `cpu-throttling` x6: `setBars` writes `style.width` in px on the three fill rects and `textContent` on the three standing captions, and every step writes every bar, or one left alone reads as a period that behaved differently. `node-allocatable` x2: `setReqWidth` writes the SVG **attribute** `width` on the rect inside `reqBar`, and no field writes a geometry attribute at all (`opacity:` goes to `style.opacity`, a different property) |
| `F.run` | 1 card, 5 sites | All five on `cpu-throttling`, and only **two are the delay-0 form, which is not an escape**: `at()` short-circuits on `delay <= 0`, runs the callback inline and registers no timer, so it is an imperative beat standing in flow order, here back-filling the bars to empty under the fill animation. The other **three carry a real delay** (`FILL_MS`, twice it and three times it) and ARE deferred callbacks, which no other category has: a period closing and the `cpu.stat` counter it moves are ONE beat, and no flow verb writes a rect width and a chip value together |
| `SCENE.reset.extra` | 1 card, 1 site | `api-structure`'s `resetWatchArrow`, one of the two in the whole catalogue. It clears `strokeDasharray` and `strokeDashoffset` inline on the watch lane, which no field writes. It clears nothing today and stands as the arrow's guard for the first step that ever dashes it |

**`pod-sandbox-cri`'s `tune` creates a ref no static reader can see.** `reset.pods` names `appGroup`,
which that `tune` builds, so `report/skeleton-census.test.mjs` prints it under Q1 as a reset key no
declared part creates. The card is correct and the entry stays: what Q1 is waiting on is a decision
about escape-created refs, not a repair here.

**`reducedLit` is declared on 2 steps here**, `cluster-apply-flow`'s `create-pod` and
`cluster-node-pressure-eviction`'s `rank`, against 89 in network, 20 in workloads and 0 in storage.
That is the lowest non-zero count in the catalogue and it is a measurement rather than an omission:
cluster's steps name their receivers in `lights:`, so `flowLights` derives the whole static path,
and those two are the only ones where the animated path PULSES a Pod wrapper and no `lightBoxAt`
names the inner box, which is the one thing no derivation can reach.

## Subcategories (`CLU.D-01`)

| key | label | cards | what belongs here |
|---|---|---|---|
| `control-plane` | Control Plane | 11 | anything whose subject is an API server, scheduler, controller-manager or ETCD behaviour: request path, admission, storage, election |
| `node-runtime` | Node Runtime | 6 | the Kubelet and the container runtime doing their steady-state work on one Node: sync loop, sandbox, allocatable, cgroup limits |
| `node-lifecycle` | Node Lifecycle | 4 | a Node changing state under pressure or command: eviction, drain, shutdown, failure |

The split between the last two is the question "is the Node still healthy": a Kubelet enforcing a
memory limit is `node-runtime`, a Kubelet evicting to reclaim one is `node-lifecycle`.

## Exemplar (`CLU.S-02`)

`cluster-scheduler-decision.js`, 214 lines. Copy its shape for a new cluster card: a top-row
request/persist arrow strip over the control-plane actors, with the Node frame below.

It is also the reference for the declarative form (`scheme/CLAUDE.md`, the module contract), and it
was written to be read in that order:

- The header keeps the MEASURED inputs as literals (`SCHED_X = 420`, the panel note) and derives
  everything else through the kit's formulas, so `laneY`, `ladder`, `spread` and `midX` carry the
  arithmetic and nothing restates a number a formula already knows.
- `LADDER_X` and `CHIP_X` come from `LAYOUT.A`, not from `60` and `660`. Picking a layout is
  therefore one edit, and `L-06` decides which of `A` / `B` / `C` against that card's own panel.
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

## Rules of this category only (`CLU.*`)

| ID | Rule |
|---|---|
| `CLU.L-01` | The Node frame family geometry is catalog-wide (`L-23`, `L-24`) and this is the category that uses it most. `cluster-node-drain.js` is the card to copy it from |
| `CLU.S-01` | A cluster card states only what is true of ITSELF in its `CARDS.md` section. Unlike networking and storage, this category has no shared contract paragraph: what every card obeys is the canon |
