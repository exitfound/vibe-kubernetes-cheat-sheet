# Scheme card design notes: cluster

The per-card design record for `js/schemes/cluster/`. It answers what the code cannot: why a number
is what it is, which alternative was measured and failed, and what must not be "fixed". The
constants themselves live in the card and are not repeated here.

**The rules are not here.** Catalog-wide rules are `scheme/CANON.md`, and this category's own rules
are `./CLAUDE.md`. A note records only where a card DEVIATES from them, or a number that needs
explaining. Sister records: `CARDS.md` in the other three category folders. Anything that is NOT
one card (the catalog barrels, `js/lib/`, the kits, the CSS) is recorded in a JSDoc note beside
the code it describes, not in a document. None of them ships (`S-41`).

**HOW TO READ THIS RECORD.** This file is the preamble and the index. **The notes themselves are
one file per card in `./CARDS/`**, named after the card id, which is the shape `workloads/` is in as
well: `network/` and `storage/` still keep every section in one `CARDS.md`.
`unit/docs.test.mjs` reads the shape off the tree rather than off a list of category names, so both
forms are checked by the same walk and neither is a special case.

**One card, one file, one block.** Each `./CARDS/<card-id>.md` opens with `## <card-id>` and carries
a single `### layout` section holding one fenced block. Inside it every note stands under a LABEL in
the first column, with its prose in the column at 9. Nothing else is a heading: a record has no
sub-sections, no per-line anchors and no poster note. A reason that belongs to ONE constant is a
comment ON that constant instead (`S-34`, `S-35`), where it cannot desync from the line it is about.

**Every `###` heading starts its own line.** A heading written onto the end of the closing fence of
the block above it (```` ```### layout ````) is swallowed by that fence: it renders as nothing and
is invisible to every reader keyed on `^### `, this record walk included.

The label vocabulary is ONE list for all four records, in `scheme/CANON.md` under "The record
vocabulary". Use the labels that apply, IN THAT ORDER, use each at most once, and add none of your
own. The order is not decoration: a reader looking for what binds a card's geometry reads down until
`PANEL`, and a record that puts `OPEN` in the middle or `CONTENT` before `MOTION` makes that a hunt.
Every record opens on `WHAT` and every record carries `PANEL`.

**Every one of them is written in the present tense** (`S-48`). A block says what the card draws and
what was measured, never what an edit did to it. A rejected alternative is a constraint with the
number that kills it, under `WHY NOT` or `DO NOT`, and not an account of the day it was rejected.
Dates, "used to", "the old", "this replaces" and the name of whoever ruled on something do not
appear.

**A `PANEL` block is MEASURED over the three standard viewports, never over one** (`L-06`), and it
is about this card's own bottom rather than the right edge, which `L-02` fixes catalog-wide.

**The extent itself is NOT stored here.** The right edge is `x<=397` catalog-wide, the BOTTOM varies
per card and per viewport inside the band `L-04` states, and it moves NON-MONOTONICALLY (`L-02`,
`L-04`, `L-05`), so a number copied into a record goes stale on the next prose edit with nothing
red. Every `PANEL` block names the command that prints it instead,
`OVERLAY_IDS=<card-id> node --test report/overlay.test.mjs` run from `scheme/test/`, and keeps only
what the reading is FOR: which step is deepest, what stands under the panel, how much clearance is
left, and any constant the card derives from it. Several cards here carry a hard character ceiling
and nothing in `npm test` enforces one (`L-08`).

A new card takes a new file in `./CARDS/` and a row in the index below, in the place `cards.js`
gives it: **the index is in CATALOG ORDER**, which is the order `cards.js` lists them and the order
the grid shows them. That is an editorial argument about what a reader meets first (`D-10`) rather
than an alphabet.

---

**THE INDEX.** (Deliberately not a `##` heading: `unit/docs.test.mjs` parses every `## ` in a
record as a card id, and a second-level heading anywhere else is reported as an orphan. This
file carries none, which is what lets the same walk read it alongside `./CARDS/`.)

**Control Plane**

- [`cluster-architecture`](./CARDS/cluster-architecture.md)
- [`cluster-object-create-path`](./CARDS/cluster-object-create-path.md)
- [`cluster-admission-chain`](./CARDS/cluster-admission-chain.md)
- [`cluster-resource-quota`](./CARDS/cluster-resource-quota.md)
- [`cluster-list-watch-informers`](./CARDS/cluster-list-watch-informers.md)
- [`cluster-server-side-apply`](./CARDS/cluster-server-side-apply.md)
- [`cluster-scheduler-decision`](./CARDS/cluster-scheduler-decision.md)
- [`cluster-taints-tolerations`](./CARDS/cluster-taints-tolerations.md)
- [`cluster-pod-priority-preemption`](./CARDS/cluster-pod-priority-preemption.md)
- [`cluster-cascading-deletion`](./CARDS/cluster-cascading-deletion.md)
- [`cluster-etcd-raft`](./CARDS/cluster-etcd-raft.md)
- [`cluster-leader-election`](./CARDS/cluster-leader-election.md)

**Node Runtime**

- [`cluster-kubelet-reconcile-loop`](./CARDS/cluster-kubelet-reconcile-loop.md)
- [`cluster-pod-sandbox-cri`](./CARDS/cluster-pod-sandbox-cri.md)
- [`cluster-static-pods`](./CARDS/cluster-static-pods.md)
- [`cluster-node-allocatable`](./CARDS/cluster-node-allocatable.md)
- [`cluster-pod-cgroup-hierarchy`](./CARDS/cluster-pod-cgroup-hierarchy.md)
- [`cluster-cpu-throttling`](./CARDS/cluster-cpu-throttling.md)
- [`cluster-oom-kill`](./CARDS/cluster-oom-kill.md)
- [`cluster-image-container-gc`](./CARDS/cluster-image-container-gc.md)

**Node Lifecycle**

- [`cluster-node-registration`](./CARDS/cluster-node-registration.md)
- [`cluster-node-conditions`](./CARDS/cluster-node-conditions.md)
- [`cluster-node-drain`](./CARDS/cluster-node-drain.md)
- [`cluster-graceful-node-shutdown`](./CARDS/cluster-graceful-node-shutdown.md)
- [`cluster-node-pressure-eviction`](./CARDS/cluster-node-pressure-eviction.md)
- [`cluster-node-restart`](./CARDS/cluster-node-restart.md)
- [`cluster-node-failure`](./CARDS/cluster-node-failure.md)
- [`cluster-node-eviction-rate`](./CARDS/cluster-node-eviction-rate.md)
