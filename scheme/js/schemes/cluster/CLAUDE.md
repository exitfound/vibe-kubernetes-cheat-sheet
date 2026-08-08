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

New cards go in this form. The legacy hand-written `class Scene` remains legal only until the
category it lives in is migrated.

## Rules of this category only (`CLU.*`)

| ID | Rule |
|---|---|
| `CLU.L-01` | The Node frame family geometry is catalog-wide (`L-23`, `L-24`) and this is the category that uses it most. `cluster-node-drain.js` is the card to copy it from |
| `CLU.S-01` | A cluster card states only what is true of ITSELF in its `CARDS.md` section. Unlike networking and storage, this category has no shared contract paragraph: what every card obeys is the canon |
