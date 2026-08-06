# CLAUDE.md `schemes/cluster/` (Cluster internals)

What is true of Cluster cards ALONE. Everything catalog-wide is in **`scheme/CANON.md`** (the
rulebook: layout, arrows, motion, colour, text, chips, metadata, posters, module structure) and
`scheme/CLAUDE.md` (the contract: folder, module, catalog, checklists). **If a rule here would also
be true of another category, it is in the wrong file.**

The rows below carry `CLU.*` ids and are indexed from `scheme/CANON.md`.

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

The shared list (`S-22`), plus `CLUSTER_TINT`, `pulsePod`, `pulsePodDim`. No cluster-only helper.

## Subcategories

| key | label | cards | what belongs here |
|---|---|---|---|
| `control-plane` | Control Plane | 11 | anything whose subject is an API server, scheduler, controller-manager or ETCD behaviour: request path, admission, storage, election |
| `node-runtime` | Node Runtime | 6 | the Kubelet and the container runtime doing their steady-state work on one Node: sync loop, sandbox, allocatable, cgroup limits |
| `node-lifecycle` | Node Lifecycle | 4 | a Node changing state under pressure or command: eviction, drain, shutdown, failure |

The split between the last two is the question "is the Node still healthy": a Kubelet enforcing a
memory limit is `node-runtime`, a Kubelet evicting to reclaim one is `node-lifecycle`.

## Exemplar

`cluster-scheduler-decision.js`. Copy its shape for a new cluster card: a top-row
request/persist arrow strip over the control-plane actors, with the Node frame below.

## Rules of this category only (`CLU.*`)

| ID | Rule |
|---|---|
| `CLU.L-01` | The Node frame family geometry is catalog-wide (`L-23`, `L-24`) and this is the category that uses it most. `cluster-node-drain.js` is the card to copy it from |
| `CLU.S-01` | A cluster card states only what is true of ITSELF in its `CARDS.md` section. Unlike networking and storage, this category has no shared contract paragraph: what every card obeys is the canon |
