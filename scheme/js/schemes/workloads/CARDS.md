# Scheme card design notes: workloads

The per-card design record for `js/schemes/workloads/`. It answers what the code cannot: why a
number is what it is, which alternative was measured and failed, and what must not be "fixed".
The constants themselves live in the card and are not repeated here.

**The rules are not here.** Catalog-wide rules are `scheme/CANON.md`, and this category's own rules
are `./CLAUDE.md`. A note records only where a card DEVIATES from them, or a number that needs
explaining. Sister records: `CARDS.md` in the other three category folders. Anything that is NOT
one card (the catalog barrels, `js/lib/`, the kits, the CSS) is recorded in a JSDoc note beside
the code it describes, not in a document. None of them ships (`S-41`).

**HOW TO READ THIS RECORD.** This file is the preamble and the index. **The notes themselves are
one file per card in `./CARDS/`**, named after the card id, which is the shape `cluster/` is in as
well. `unit/docs.test.mjs` reads the shape off the tree rather than off a list of category names,
so both forms are checked by the same walk and neither is a special case.

Each `./CARDS/<card-id>.md` opens with `## <card-id>` and keeps the heading levels the monolith
uses, because the parser is the same one. `### layout` describes the whole card in labelled blocks,
`### poster` describes the grid thumbnail, and each ``### before `<line>` `` holds the note for one
line of code. `unit/docs.test.mjs` verifies every anchor that is here still occurs in its card, so
**an anchor is DATA: never reword one** (`S-38`), and nothing counts them.

**Every `###` heading starts its own line.** A heading written onto the end of the closing fence of
the block above it (```` ```### poster ````) is swallowed by that fence: it renders as nothing and
is invisible to every reader keyed on `^### `, this record walk included. One record carried that
for as long as it existed and no check saw it.

**What a record here carries** is `WL.S-03` in `./CLAUDE.md`, and it is short: open on `WHAT`, use
the labels below in the order they are listed, and carry a `### poster` block. A `PANEL` block is
taken where the panel BINDS the geometry, which is 8 of the 25 cards, and is not a form the other 17
fill in.

A new card takes a new file in `./CARDS/` and a row in the index below, in the place the grid gives
it: **the index is in GRID ORDER**, subcategory by subcategory in the `SUBCATEGORIES` order
`cards.js` declares, and inside one subcategory in the relative order `cards.js` lists its cards.
That is an editorial argument about what a reader meets first (`D-10`) rather than an alphabet, and
here it is not the raw `CARDS` order: this category declares its cards controllers-first and shows
them Pods first.

The label vocabulary a `### layout` block uses is ONE list for all four records, in
`scheme/CANON.md` under "The record vocabulary". Use the labels that apply, IN THAT ORDER, and add
none of your own. The order is not decoration: a reader looking for what binds a card's geometry
reads down until `PANEL`, and a record that puts `OPEN` in the middle or `CONTENT` after `SCOPE`
makes that a hunt. All 25 records here run in order.

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

**Pods Bootstrap**

- [`workloads-pod-pending-init-states`](./CARDS/workloads-pod-pending-init-states.md)
- [`workloads-pod-scheduling-gates`](./CARDS/workloads-pod-scheduling-gates.md)
- [`workloads-pod-startup-conditions`](./CARDS/workloads-pod-startup-conditions.md)
- [`workloads-image-pull-registry-auth`](./CARDS/workloads-image-pull-registry-auth.md)
- [`workloads-init-containers-and-sidecars`](./CARDS/workloads-init-containers-and-sidecars.md)
- [`workloads-env-before-pid-1`](./CARDS/workloads-env-before-pid-1.md)
- [`workloads-effective-pod-requests`](./CARDS/workloads-effective-pod-requests.md)
- [`workloads-pod-qos-classes`](./CARDS/workloads-pod-qos-classes.md)

**Pods Lifecycle**

- [`workloads-pod-lifecycle-phases`](./CARDS/workloads-pod-lifecycle-phases.md)
- [`workloads-restart-policy`](./CARDS/workloads-restart-policy.md)
- [`workloads-probes`](./CARDS/workloads-probes.md)
- [`workloads-container-states`](./CARDS/workloads-container-states.md)
- [`workloads-crashloopbackoff`](./CARDS/workloads-crashloopbackoff.md)
- [`workloads-hooks`](./CARDS/workloads-hooks.md)
- [`workloads-graceful-shutdown`](./CARDS/workloads-graceful-shutdown.md)
- [`workloads-force-deletion`](./CARDS/workloads-force-deletion.md)
- [`workloads-pod-resize`](./CARDS/workloads-pod-resize.md)

**Controllers**

- [`workloads-replicaset`](./CARDS/workloads-replicaset.md)
- [`workloads-rolling-update`](./CARDS/workloads-rolling-update.md)
- [`workloads-deployment-rollback`](./CARDS/workloads-deployment-rollback.md)
- [`workloads-statefulset-ordered-rollout`](./CARDS/workloads-statefulset-ordered-rollout.md)
- [`workloads-pvc-stickiness`](./CARDS/workloads-pvc-stickiness.md)
- [`workloads-daemonset`](./CARDS/workloads-daemonset.md)
- [`workloads-job-parallelism`](./CARDS/workloads-job-parallelism.md)
- [`workloads-cronjob`](./CARDS/workloads-cronjob.md)
