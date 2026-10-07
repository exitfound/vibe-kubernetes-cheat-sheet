# CLAUDE.md `js/schemes/workloads/` (Pods and controllers)

One Pod's life from Pending to deletion, and the controllers that manage Pods. The subject is a
state machine rather than a path. Rules: `scheme/CANON.md`. Module contract and the test suite:
`scheme/CLAUDE.md`. Per-card notes: `./CARDS/<id>.md`, indexed in grid order by `./CARDS.md`.

## Sections

| key | label | what belongs here |
|---|---|---|
| `pods-bootstrap` | Pods Bootstrap | what is settled before the first app container process starts: what holds a Pod short of Running, scheduling gates and conditions, what the Scheduler reserves, image pull, init and sidecar ordering, the environment built at launch, the QoS class |
| `pods-lifecycle` | Pods Lifecycle | one Pod's own state machine: phases, restart policy, hooks, probes, container states, crash loops, in-place resize, shutdown, force deletion, garbage collection |
| `controllers` | Controllers | an object that manages Pods rather than being one: Deployment, ReplicaSet, StatefulSet, DaemonSet, Job, CronJob |

The order of `SUBCATEGORIES` and of the cards inside each is editorial (`D-10`). `cards.js`
declares controllers first, and the grid shows Pods first.

## Tint and kit

`WORKLOADS_TINT = { bright: 'rgb(142, 198, 247)' }`, sky blue. Only the pulse peak is named
(`M-05`). The binding is `WL.C-01`.

Beyond the common kit set: `WL` (the shared `GRID` from `lib/layout.js`) and `LAYOUT` (the A / B / C
column presets). A `role:` literal in a card is either a cross-category override (`C-01`) or a
`P.raw` / `part.tune` calling a primitive past the kit binding, which has to be handed its role.

## Geometry

- `WL`: margins 60..1140, centre 600, top row 40..120, `SPINE_X` 600, columns `COL_L` 60..540 and
  `COL_R` 660..1140, `CHIP_H` 34, `ROW_H` 32, `ROW_GAP` 10. Y values stay per card (`L-04`).
- Columns are named by POSITION (`LAYOUT.A` / `.B` / `.C`), never by role: a role name states the
  opposite of what B and C do with that column.
- The shape: an actor row clear of the panel, a ladder and a chip column flanking a central spine,
  and a Node frame spanning 60..1140 so the content centres on 600 by construction.
- Node frames pad 34 under the top and 12 over the floor (`L-23`). Departures, each a `DEVIATES`
  line in its record: `force-deletion` (16 of label band), `ephemeral-containers` (floor at 632),
  `graceful-shutdown` (padding read to the Kubelet), `poststart-prestop-hooks` (the instrument wall
  floors under its tick words) and `daemonset` (roster captions on the label baseline).
- Lanes: `A-06` decides arrow or relation, `A-09` says a lane leaves the box that acts
  (`workloads-force-deletion` is the model), `A-10` draws two lanes over a shared drop, `A-11` and
  `A-12` cover moving a lane and a box derived from one. Lane pairs sit 24 apart (`A-23`).

## Rules of this category only

| ID | Rule |
|---|---|
| `WL.C-01` | A workloads Pod is drawn IN the category tint: the kit binds `{ role: 'workloads', podRole: 'workloads', tint: null }` and pins no Pod tint. Retinting either half is `C-22` |
| `WL.L-01` | The X grammar is `WL` from the kit, the grid cluster shares. Y values are per card, because each panel bottom is its own measurement |
| `WL.L-02` | The columns are left `60..540` and right `660..1140`, both 480 wide. The Node frame stays full width, and the actor row is centred on 600 and starts no further left than 420 |
| `WL.L-03` | **A** (`LAYOUT.A`): ladder left, chips right, Node on the floor. Needs `PANEL_B + 20 + LADDER_H + 20 + NODE_H <= 630` |
| `WL.L-04` | **B** (`LAYOUT.B`): chips left, ladder right, and the common case: a 4-chip column is 160 tall where a 5-row ladder is 200, and the band free below a real panel is at most about 214 |
| `WL.L-05` | **C** (`LAYOUT.C`): tall panel, ladder right, Node just under the panel, chips as a full-width bottom strip two or three per row (532 or 350.7 wide). Never four or five across: 258 and 205 are narrower than the strings |
| `WL.L-06` | A card with neither a ladder nor a flanking chip column takes no preset and states its own geometry, and a card may read `LAYOUT.C.strip.two` alone for the chip width. The choice itself is `L-08a` |
| `WL.L-07` | The trunk runs in the `540..660` corridor, so the actor box it leaves is centred on `WL.SPINE_X`: a first actor box of `420..780`, not `420..640` |
| `WL.A-01` | The top-row pair: `REQ_Y = TOP_CY - LANE_DY` carries the request to the API, `RESP_Y = TOP_CY + LANE_DY` the answer back. Whether the answer is an arrow or a relation is `A-06` |
| `WL.A-02` | The top-row wire label sits ABOVE the actor row at `WIRE_Y = WL.TOP_Y - 12`. Below it, it lands on the lane and across the spine's step |
| `WL.A-03` | A lane between the actor row and the Node band ends on the frame face midpoint in both directions (`A-21`), so a frame narrower than full width is centred on `WL.CX`. `report/frame-face.test.mjs` prints the queue |
| `WL.S-01` | Each card owns its `SPINE` points array, and the same array feeds the wire and the ball. There is no shared connector helper and there must not be one: it would hold a second copy of the ball's points |
| `WL.S-02` | The exemplar is copied whole, so any rule of this folder it breaks is named under Exemplar below and in its own record |
| `WL.S-03` | A record uses the canon vocabulary and nothing else (`S-51`, `S-52`). Every departure this file names for a card is a `DEVIATES` line in that card's record |
| `WL.D-01` | The split is the Sections table: whether the first app container has started divides bootstrap from lifecycle, and an object that manages Pods is a controller |

## Exemplar

`workloads-pod-startup-conditions`: the declarative form, a corridor ending on the Node frame face
(`WL.A-03`), an actor pair at 232. Do not copy its `P.raw` staircase, which writes `role:` by hand,
or its 600-wide Node frame, which breaks `WL.L-02` for a one-Pod card and says so in its record.
