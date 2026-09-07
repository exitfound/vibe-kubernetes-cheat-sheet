# Scheme card design notes: workloads

The per-card design record for `js/schemes/workloads/`. It answers what the code cannot: why a
number is what it is, which alternative was measured and failed, and what must not be "fixed". The
constants themselves live in the card and are not repeated here.

**The rules are not here.** Catalog-wide rules are `scheme/CANON.md`, and this category's own rules
are `./CLAUDE.md`. A note records only where a card DEVIATES from them, or a number that needs
explaining. Sister records: `CARDS.md` in the other three category folders. Anything that is NOT
one card (the catalog barrels, `js/lib/`, the kits, the CSS) is recorded in a JSDoc note beside
the code it describes, not in a document. None of them ships (`S-41`).

**HOW TO READ THIS RECORD.** This file is the preamble and the index. **The notes themselves are
one file per card in `./CARDS/`**, named after the card id, which is the shape `cluster/` is in as
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

A new card takes a new file in `./CARDS/` and a row in the index below, in the place the grid gives
it: **the index is in GRID ORDER**, subcategory by subcategory in the `SUBCATEGORIES` order
`cards.js` declares, and inside one subcategory in the relative order `cards.js` lists its cards.
Here that is not the raw `CARDS` order, because this category declares its cards controllers-first
and shows them Pods first. That is an editorial argument about what a reader meets first (`D-10`)
rather than an alphabet.

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
- [`workloads-pod-restart-policy`](./CARDS/workloads-pod-restart-policy.md)
- [`workloads-crashloopbackoff`](./CARDS/workloads-crashloopbackoff.md)
- [`workloads-container-states`](./CARDS/workloads-container-states.md)
- [`workloads-ephemeral-containers`](./CARDS/workloads-ephemeral-containers.md)
- [`workloads-probes`](./CARDS/workloads-probes.md)
- [`workloads-pod-resize`](./CARDS/workloads-pod-resize.md)
- [`workloads-poststart-prestop-hooks`](./CARDS/workloads-poststart-prestop-hooks.md)
- [`workloads-graceful-shutdown`](./CARDS/workloads-graceful-shutdown.md)
- [`workloads-termination-order`](./CARDS/workloads-termination-order.md)
- [`workloads-force-deletion`](./CARDS/workloads-force-deletion.md)
- [`workloads-pod-garbage-collection`](./CARDS/workloads-pod-garbage-collection.md)

**Controllers**

- [`workloads-controller-kinds`](./CARDS/workloads-controller-kinds.md)
- [`workloads-replicaset`](./CARDS/workloads-replicaset.md)
- [`workloads-rolling-update`](./CARDS/workloads-rolling-update.md)
- [`workloads-deployment-strategy`](./CARDS/workloads-deployment-strategy.md)
- [`workloads-deployment-rollback`](./CARDS/workloads-deployment-rollback.md)
- [`workloads-statefulset-ordered-rollout`](./CARDS/workloads-statefulset-ordered-rollout.md)
- [`workloads-statefulset-update-strategy`](./CARDS/workloads-statefulset-update-strategy.md)
- [`workloads-daemonset`](./CARDS/workloads-daemonset.md)
- [`workloads-job-parallelism`](./CARDS/workloads-job-parallelism.md)
- [`workloads-finished-job-cleanup`](./CARDS/workloads-finished-job-cleanup.md)
- [`workloads-cronjob`](./CARDS/workloads-cronjob.md)
- [`workloads-pod-replacement-guarantees`](./CARDS/workloads-pod-replacement-guarantees.md)
