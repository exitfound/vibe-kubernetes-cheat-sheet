# CLAUDE.md `schemes/cluster/` (Cluster internals)

What is true of Cluster cards only. Everything else is in `scheme/CLAUDE.md`: the module contract,
the card construction standard, the motion canon, the opacity vocabulary, the reduced-motion
contract, the writing rules and the gate. If a rule here would also be true of another category,
it is in the wrong file.

**A comment in a card is at most TWO lines**, saying what the line beside it does or where a number
came from. It carries no date, no past defect and no account of an earlier version. Anything longer
is a rule (this file), a measurement (`./CARDS.md`) or history (delete it).

## The folder

| File | Owns |
|---|---|
| `cards.js` | the 21 `SCHEMES` entries and the `SUBCATEGORIES` list for this category |
| `posters.js` | the 21 grid thumbnails, keyed by card id |
| `cluster-kit.js` | the tint and the two pulse wrappers; everything else is re-exported from `lib/scheme-kit.js` |
| `cluster-*.js` | one module per card |

A card imports `../../lib/svg.js`, `../../lib/primitives.js` and `./cluster-kit.js`. Never reach
past the kit into `scheme-kit.js` directly. Nothing else may live here: `R-modulepath` reports any
other `.js` in this folder as unclaimed.

## Tint

```js
CLUSTER_TINT = { base: 'rgb(192, 176, 255)', bright: 'rgb(224, 214, 255)' }   // violet
```

`base` must equal the Pod's RESTING stroke, which is the CSS value before any pulse has run.
Measure it under `reducedMotion`, or a forwards-filled pulse hands you back its own end state.

The category's chrome colour (`#7d86ff` indigo, `css/tokens.css`) is a different value for a
different job: chrome keys off `data-cat`, diagram elements off `data-role`.

## Kit surface

The shared 30 names plus `CLUSTER_TINT`, `pulsePod`, `pulsePodDim`. No cluster-only helper.

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

## Node frames

A cluster card that draws a Node frame around Pods uses the family geometry
`POD_Y = NODE_Y + 34`, `POD_H = 106`, `NODE_H = 152` (34 of label padding, 106 of Pod, 12 of
floor). `node()` prints its own label at `NODE_Y + 18`, so less padding puts the frame label
inside the first Pod. `cluster-node-drain.js` is the card to copy it from. Growing the frame to
fix this grows it UPWARD if the bottom stays at 624, so re-check the gap to whatever sits above.
