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
one file per card in `./CARDS/`**, named after the card id, and this is the only category in that
shape: the other three still keep every section in one `CARDS.md`. `unit/docs.test.mjs` reads the
shape off the tree rather than off a list of category names, so both forms are checked by the same
walk and neither is a special case.

Each `./CARDS/<card-id>.md` opens with `## <card-id>` and keeps the heading levels the monolith
uses, because the parser is the same one. `### layout` describes the whole card in labelled blocks,
`### poster` describes the grid thumbnail, and each ``### before `<line>` `` holds the note for one
line of code. `unit/docs.test.mjs` verifies every anchor still occurs in its card, so **an anchor is
DATA: never reword one** (`S-38`).

A new card takes a new file in `./CARDS/` and a row in the index below, in the place `cards.js`
gives it. **The index is in CATALOG ORDER**, which is the order `cards.js` lists them and the order
the grid shows them: an editorial argument about what a reader meets first (`D-10`) rather than an
alphabet.

Two things are on every card here and the rest are used where they apply. `### poster` opens with a
one-line `Sentence:`, the poster's whole subject in words, and `PANEL` carries this card's measured
overlay extent per viewport. A card with no `BUDGET` has no character ceiling its geometry imposes,
and a card with no ``### before `<line>` `` anchor has no single line of code that needs one:
neither absence is a gap.

The label vocabulary a `### layout` block uses is ONE list for all four records, in
`scheme/CANON.md` under "The record vocabulary". Use the labels that apply, in that order, and add
none of your own.

**A `PANEL` block is MEASURED over the three standard viewports, never over one** (`L-06`), and it
states this card's own bottom rather than the right edge, which `L-02` fixes catalog-wide. Neither
sentence is repeated in a card file.

Panel extent is per card: the right edge is `x<=397` catalog-wide, the BOTTOM varies per card
and per viewport inside the band `L-04` states, and it moves NON-MONOTONICALLY (`L-02`, `L-04`,
`L-05`). So a `PANEL_B` in a card is a measurement, not a convention. Re-measure after any
prose change with `npm run report` from `scheme/test/`, which prints the real extent per card,
per step, over the three viewports: several cards here carry a hard character ceiling and
nothing in `npm test` enforces one (`L-08`).

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
