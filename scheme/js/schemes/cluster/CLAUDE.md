# CLAUDE.md `js/schemes/cluster/` (Cluster internals)

The machinery under every workload: the API server and its request path, the scheduler, the
controllers and ETCD, then the Kubelet and the runtime on one Node, and a Node changing state.
Rules: `scheme/CANON.md`. Module contract and the test suite: `scheme/CLAUDE.md`. Per-card notes:
`./CARDS/<id>.md`, indexed in catalog order by `./CARDS.md`.

The folder holds `cards.js` (the `SCHEMES` entries and `SUBCATEGORIES`), `posters.js`,
`cluster-kit.js` and one `cluster-*.js` per card, and nothing else (`S-20`, `S-21`).

## Sections

| key | label | what belongs here |
|---|---|---|
| `control-plane` | Control Plane | API server, scheduler, controllers, ETCD, admission, election |
| `node-runtime` | Node Runtime | Kubelet and runtime on a healthy Node: sync, sandbox, cgroups |
| `node-lifecycle` | Node Lifecycle | a Node changing state: register, evict, drain, fail |

The test between the last two is "is the Node still healthy": a Kubelet enforcing a memory limit is
`node-runtime`, a Kubelet evicting to reclaim memory is `node-lifecycle`. The order of the sections
and of the cards inside each is editorial (`D-10`).

## Tint and kit

`CLUSTER_TINT = { bright: 'rgb(224, 214, 255)' }`, violet, the pulse peak only (`M-05`).

`cluster-kit.js` re-exports the shared surface (`S-22`) and adds `CLUSTER_TINT`, the two pulse
wrappers, `CLU` (the frozen X grammar and the `NODE` frame family) and `LAYOUT` (the `A` / `B` /
`C` column presets, picked by `L-08a`). There is no cluster-only behaviour helper: a card that
needs other timings on a riding label builds one with `makeRidingLabel` and passes it as `fn`.

## Geometry

- Margins 60 and 1140, centre 600, top row at y 40..120, boxes 232 by 80.
- Ladder rows 32 on a gap of 10, chips 34 tall, out-and-back lane pairs at `LANE_DY` 12.
- Columns 60..540 and 660..1140 for `LAYOUT.A` and `B`. `LAYOUT.C` strips the chips at 532 (two
  across) or 350.7 (three across) under the frame.
- Node frame family `CLU.NODE`: frame 152, Pod 106, Pod top at `NODE_Y + 34`. Copy it from
  `cluster-node-drain.js`. The chip strip ends on 624.
- `cluster-architecture`, `cluster-object-create-path` and `cluster-cascading-deletion` share one
  grid: frames 150..1050, control plane 96..440, Node top 475.

## Rules of this category only

| ID | Rule |
|---|---|
| `CLU.D-01` | The three sections above, split between the last two on whether the Node is healthy |
| `CLU.C-01` | Chrome indigo `#7d86ff` keys off `data-cat`, the diagram off `data-role` (`C-15`) |
| `CLU.L-01` | A frame pads 34 above and 12 below, Pods take `CLU.NODE`, a departure is DEVIATES |
| `CLU.S-01` | A record states only what is true of its own card: no shared contract paragraph |
| `CLU.S-02` | `cluster-scheduler-decision` is the card a new cluster card copies its shape from |
| `CLU.S-03` | A record past 300 lines says in its `WHAT` line why the card needs the length |

## Exemplar

`cluster-scheduler-decision`: the declarative form read top to bottom, measured inputs as literals
and everything else derived, a top-row request strip over the actors with the Node row below, and
the Kubelet with two lanes as the shape for something arriving on a Node.
