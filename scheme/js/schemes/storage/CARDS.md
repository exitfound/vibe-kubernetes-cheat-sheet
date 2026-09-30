# Scheme card design notes: storage

The per-card design record for `js/schemes/storage/`. It answers what the code cannot: why a number
is what it is, which alternative was measured and failed, and what must not be "fixed". The
constants themselves live in the card and are not repeated here.

**The rules are not here.** Catalog-wide rules are `scheme/CANON.md`, and this category's own rules
are `./CLAUDE.md`. A note records only where a card DEVIATES from them, or a number that needs
explaining. Sister records: `CARDS.md` in the other three category folders. Anything that is NOT
one card (the catalog barrels, `js/lib/`, the kits, the CSS) is recorded in a JSDoc note beside
the code it describes, not in a document. None of them ships (`S-41`).

**HOW TO READ THIS RECORD.** This file is the preamble and the index. **The notes themselves are
one file per card in `./CARDS/`**, named after the card id, which is the shape `cluster/`,
`workloads/` and `network/` are in as well. `unit/docs.test.mjs` reads the shape off the tree rather
than off a list of category names, so no category is a special case.

**One card, one file, one block.** Each `./CARDS/<card-id>.md` opens with `## <card-id>` and carries
a single `### layout` section holding one fenced block. Inside it every note stands under a LABEL in
the first column, with its prose in the column at 9. Nothing else is a heading: a record has no
sub-sections, no per-line anchors and no poster note. A reason that belongs to ONE constant is a
comment ON that constant instead (`S-34`, `S-35`), where it cannot desync from the line it is about,
and the note that explains a grid thumbnail sits on that thumbnail in `./posters.js` (`R-12`).

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

**The geometry is not repeated here.** `SCENE.parts` states it as data and `unit/spec-scene.test.mjs`
reads the same numbers off it, so a paragraph restating a coordinate is a second source that can only
rot. What a record keeps is what the code cannot say: a measurement a browser took, the string that
floors a width, the alternative that was tried and failed, and the defect a constraint prevents.

**A `PANEL` block is MEASURED over the three standard viewports, never over one** (`L-06`), and it
is about this card's own bottom rather than the right edge, which `L-02` fixes catalog-wide.

**The extent is not meant to be stored here.** The right edge is `x<=397` catalog-wide, the BOTTOM
varies per card and per viewport inside the band `L-04` states, and it moves NON-MONOTONICALLY
(`L-02`, `L-04`, `L-05`), so a number copied into a record goes stale on the next prose edit with
nothing red. A `PANEL` block names the command that prints it instead,
`OVERLAY_IDS=<card-id> node --test report/overlay.test.mjs` run from `scheme/test/` (or
`npm run report` for the whole catalog), and keeps only what the reading is FOR: which step is
deepest, what stands under the panel, how much clearance is left, and any constant the card
derives from it. All 35 records here are on that form, and a reading quoted anywhere else in a
record is re-measured with that command before it is trusted. Several cards here
carry a hard character ceiling and nothing in `npm test` enforces one (`L-08`).

Twelve records carry a `900x650` reading, a hand sample stricter than anything the harness takes,
and where the two disagree the card takes the stricter number and says so (`STO.L-04`). Over the
sampled viewports storage's own deepest panel is 329.20, on
`storage-volume-detach-on-node-loss` at 1100x800, and the catalog maximum of 378.90 belongs to
`workloads-pod-qos-classes`.

A new card takes a new file in `./CARDS/` and a row in the index below, in the place the grid gives
it: **the index is in GRID ORDER**, subcategory by subcategory in the `SUBCATEGORIES` order
`cards.js` declares, and inside one subcategory in the relative order `cards.js` lists its cards.
Here that IS the raw `CARDS` order, because this category declares its cards in the order it shows
them, as `cluster/` and `network/` do and `workloads/` alone does not. Both orders are the same
editorial argument about what a reader meets first (`D-10`) rather than an alphabet, so an insert
goes in the place the argument gives it in both files at once.

---

**THE INDEX.** (Deliberately not a `##` heading: `unit/docs.test.mjs` parses every `## ` in a
record as a card id, and a second-level heading anywhere else is reported as an orphan. This
file carries none, which is what lets the same walk read it alongside `./CARDS/`.)

**Volume Foundations**

- [`storage-volume-model`](./CARDS/storage-volume-model.md)
- [`storage-volume-data-homes`](./CARDS/storage-volume-data-homes.md)
- [`storage-container-filesystem`](./CARDS/storage-container-filesystem.md)
- [`storage-emptydir`](./CARDS/storage-emptydir.md)
- [`storage-hostpath`](./CARDS/storage-hostpath.md)
- [`storage-configmap-secret-mount`](./CARDS/storage-configmap-secret-mount.md)
- [`storage-downward-api-volume`](./CARDS/storage-downward-api-volume.md)
- [`storage-projected-volume`](./CARDS/storage-projected-volume.md)
- [`storage-image-volume`](./CARDS/storage-image-volume.md)
- [`storage-subpath`](./CARDS/storage-subpath.md)
- [`storage-ephemeral-storage-eviction`](./CARDS/storage-ephemeral-storage-eviction.md)
- [`storage-recursive-readonly`](./CARDS/storage-recursive-readonly.md)

**Volumes & Claims**

- [`storage-pvc-binding`](./CARDS/storage-pvc-binding.md)
- [`storage-default-storageclass`](./CARDS/storage-default-storageclass.md)
- [`storage-dynamic-provisioning`](./CARDS/storage-dynamic-provisioning.md)
- [`storage-access-modes`](./CARDS/storage-access-modes.md)
- [`storage-volume-mode`](./CARDS/storage-volume-mode.md)
- [`storage-topology-aware-provisioning`](./CARDS/storage-topology-aware-provisioning.md)
- [`storage-csi-capacity-tracking`](./CARDS/storage-csi-capacity-tracking.md)
- [`storage-volume-expansion`](./CARDS/storage-volume-expansion.md)
- [`storage-pvc-protection`](./CARDS/storage-pvc-protection.md)
- [`storage-reclaim-policy`](./CARDS/storage-reclaim-policy.md)
- [`storage-pv-lifecycle-phases`](./CARDS/storage-pv-lifecycle-phases.md)
- [`storage-pv-reservation`](./CARDS/storage-pv-reservation.md)

**CSI & Mount Path**

- [`storage-csi-architecture`](./CARDS/storage-csi-architecture.md)
- [`storage-csidriver`](./CARDS/storage-csidriver.md)
- [`storage-csi-attach-mount`](./CARDS/storage-csi-attach-mount.md)
- [`storage-volumeattachment`](./CARDS/storage-volumeattachment.md)
- [`storage-mount-path-chain`](./CARDS/storage-mount-path-chain.md)
- [`storage-csi-ephemeral-volume`](./CARDS/storage-csi-ephemeral-volume.md)
- [`storage-fsgroup-ownership`](./CARDS/storage-fsgroup-ownership.md)
- [`storage-volume-attach-limits`](./CARDS/storage-volume-attach-limits.md)
- [`storage-multi-attach-error`](./CARDS/storage-multi-attach-error.md)
- [`storage-volume-detach-on-node-loss`](./CARDS/storage-volume-detach-on-node-loss.md)

**Stateful Data**

- [`storage-volumeclaimtemplates`](./CARDS/storage-volumeclaimtemplates.md)
- [`storage-pvc-retention-policy`](./CARDS/storage-pvc-retention-policy.md)
- [`storage-generic-ephemeral-volume`](./CARDS/storage-generic-ephemeral-volume.md)
- [`storage-volume-snapshot`](./CARDS/storage-volume-snapshot.md)
- [`storage-pvc-clone`](./CARDS/storage-pvc-clone.md)
