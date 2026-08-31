---
name: card-review
description: Work on ONE existing scheme card, in either of two lanes, and leave its records true. REVIEW when nothing is named wrong: runs the machine gate filtered to that card, opens the rendered frames at three viewports, measures text and timing, hunts what no check can see (geometry, motion, state, wire placement, dead code, stale records, the poster), and reports findings ranked. DIRECTED CHANGE when the user names a DETAIL to change: a coordinate, a string, a chip value, a duration, an opacity. Use when the user asks to check, review, audit or re-verify a card ("проверь карточку <id>", "check card <id>", "перепроверь карточку"), and equally when they name a detail to change on one that exists ("сдвинь эту линию", "перепиши шаг", "поменяй значение чипа", "edit this step"), with the card id or title as the argument. A change that moves the COMPOSITION, the cast or the step spine is a design change and belongs to card-new even on an existing card. For a card that does not exist yet use card-new, for the truth of its prose card-facts, and for its grid thumbnail card-poster. For all four skills run end to end over a SET of cards unattended, use card-cycle.
---

# Card review and change

One card that ALREADY EXISTS. The argument is a card id (`cluster-architecture`), a title
(`Cluster Architecture`) or a hash from the site. Resolve it to an id first.

**The contract of this skill:** a green gate is NOT the deliverable. This project has paid twice for
that mistake, most recently when a pass relaid 35 diagrams to zero lint findings, opened six frames
out of thirty five, and shipped three defects no rule could see. The deliverable is a ranked list of
findings, each with evidence a human can check, plus updated records.

**Never widen the diff on your own.** Report first, fix on the user's go-ahead.

The one sanctioned exception, so it is not a surprise arriving from outside: an unattended
`card-cycle` run inverts this and asks for every finding to be FIXED in the run that found it,
because the user has stood down from the loop for that run. It holds only while the brief says so
and lapses the moment they are back.

Two files carry what this skill shares with its siblings, and neither is optional:

- **`.claude/skills/_shared/card-edit.md`** before any edit: the ruling check, the blast radius, the
  smallest-diff rule.
- **`.claude/skills/_shared/card-verify.md`** after it: the three loops, the frame protocol, the
  measurement tools, the count sweep, the container, the commit rule.

---

## 0. Resolve the card

```bash
node .claude/skills/_shared/tools/ctx.mjs <card-id>           # resolves an id OR a title, and prints phase 1
grep -n "'<card-id>'" scheme/js/app.js                        # old hashes forwarding here
```

`ctx.mjs` resolves off the catalog, so a card that does not exist comes back as an error with the
near misses named, and that is the answer: this is the wrong skill and `card-new` builds one. What
it prints is phase 1 below, so run it once here and do not run it twice. Server and working
directories are `_shared/card-verify.md` section 0, and its "start the long runs first" subsection
applies from this line onward: launch the report and the frames NOW, in the background, so they
land under the reading instead of after it.

---

## Which lane, and when it is not this skill at all

Picking wrong is the difference between ten minutes and an afternoon, in both directions.

**Lane A, REVIEW.** Nothing is named wrong: "проверь карточку", "перепроверь", "audit this one",
"что-то тут не так". Finding out IS the job, so the diagnosis cannot be skipped. Run phases 1 to 8.

**Lane B, DIRECTED CHANGE.** A DETAIL is named: a coordinate, a lane endpoint, a size, a narration,
a wire string, a chip value, a duration, an easing, an opacity, a reset key, a colour. **The request
is the finding**, so phases 1 to 5 have nothing left to discover. Read
`_shared/card-edit.md`, edit, then run phases 6 to 8.

**The verification is ROUTED here, not skipped**: `_shared/card-verify.md` section 1 carries the
detail loop, which is 35 seconds of machine time chosen by what the change touched (geometry owes
`GEOMETRY_IDS`, prose owes `OVERLAY_IDS`, motion owes `motion.mjs`), with the full gate and the full
report deferred into a WRITTEN debt list and discharged once over the batch before any commit. The
frames of every step the change can be seen in, and the record it falsifies, are not part of what
is deferred.

**The test that separates a detail from a design change is mechanical**, so run it rather than
judging:

```bash
node .claude/skills/card-new/tools/kin.mjs --id=<card-id>
    signature  box1 pod1 node1 chip5 cyl0 chain1 raw0
    bands      40,496,518
```

Would the change move `box` / `pod` / `node` / `cyl` / `chain` / `raw`, the `bands` list, or the step
count? Then it is a DESIGN change and it belongs to `card-new`, which owns the composition census
and the one-line sign-off. A change to `chip<N>` alone, or to nothing in the signature, is a detail
and stays here.

**Three more requests that look like lane B and are not:**

| The request | Where it goes |
|---|---|
| a change inside `js/lib/*`, a kit or a primitive | lane A, and wider: it reaches every card, and one card's frames prove nothing about the rest |
| "is this sentence true", "does this match the docs" | `card-facts` |
| "the thumbnail is wrong" | `card-poster`, which starts from its own one-line sign-off |

**The verification does NOT shrink with the lane.** What shrinks is the search.

---

## 1. Read before you look

Skipping this phase is what turns a review into an opinion. It is TWO commands, and the reason it is
two rather than ten is that it used to be ten: the category contract, the record, the source, the
catalog entry, the poster fragment and then every sibling the prose names, each arriving as its own
round trip, ten turns and about 35k tokens before a single finding on a card whose machine pass
costs seven seconds. The bytes were never the cost.

```bash
node .claude/skills/_shared/tools/ctx.mjs <card-id>      # already run in phase 0. Read it, do not re-run it
cd scheme/test && node tools/canon.mjs --check=review    # the rows NO machine covers. This review is FOR these
```

`ctx.mjs` prints, in one run: the catalog entry (title, desc, subcategory, k8sVersion, sources), the
design record in whichever shape the category is in, the card source line-numbered and whole with
every comment, the poster fragment, the category contract (`CLU.*`, `WL.*`, `NET.*`, `STO.*`), and
**every sibling the desc, the aria-label, a narration or the record names**, with the siblings named
in user-visible prose printed in full and the record-only ones as one line (`--siblings=all`
promotes them, `--siblings=full` prints their sources).

That last block is step 7 of the old list and the highest-yield technique in this repository: 87
cards one reviewer had closed yielded 31 real defects when someone else re-read them, and more than
half were a card disagreeing with its own other steps, its own labels, its own aria-label or a
sibling. A card is named by TITLE far more often than by id, so `ctx.mjs` matches both, and it
prints every `... card` phrase it could NOT resolve with a candidate beside it. **Read that list by
hand.** It is the half no match can close.

`canon.mjs` is the other half: the canon holds rules a machine already ran in phase 2, and the rows
whose Check column says `review` are what this skill exists for. `--block=L,A --ids` is a checklist
for the geometry pass, and a finished review can say how many of those rows it walked.

**What neither command reads, and when to read it yourself:**

- `scheme/CLAUDE.md`, the sub-app contract. Once per SESSION, not once per card.
- `scheme/CANON.md` in full. Query it; it is 1286 lines and phase 2 already ran most of it.
- the category kit (`<category>-kit.js`), when a finding reaches the grammar rather than the card.
- `scheme/js/data.js`, when the category wiring itself is in question.
- the rendered frames, which are phase 3 and which no amount of reading substitutes for.

---

## 2. The machine pass

The loops, the reports and their traps are `_shared/card-verify.md` section 1. Run the review loop
and the reports here; the full gate waits for the end.

```bash
cd scheme/test
npm run test:unit                                          # 2s
SCHEME_IDS=<card-id> npm run test:render > /tmp/r.txt 2>&1  # 7s
grep -E '^# (tests|pass|fail|skipped)|^not ok' /tmp/r.txt
OVERLAY_IDS=<card-id> node --test report/overlay.test.mjs
# npm run report was started in phase 0 and takes 3 minutes. Collect it here:
grep -n '<card-id>' /tmp/report.txt
grep -nE 'queue to work|left to work|finding\(s\)' /tmp/report.txt
```

If the report was not started in the background, start it now and go on to phase 3 rather than
watching it. **It is still not optional**, and a review that never read it is unfinished: collect it
before the axes in phase 5, which is where its rows are ruled on.

**The reports are the step a review is lost without.** `npm test` is `unit/**` and `render/**` only.
A card review that skips `report/` re-derives by eye what the repository has been printing all along.

The gate is necessary and not sufficient. `reference/blind-spots.md` beside this file lists what it
cannot see, which is where the rest of this skill spends its time.

---

## 3. Look at the frames

**Read `reference/blind-spots.md` first.** It is the two lists this phase works from: what the gate
cannot see, and the defect families this repository produces again and again. It is what you are
hunting for, and it is longer than a procedure step should be.

The generate-all, read-triaged protocol and the per-frame questions are `_shared/card-verify.md`
section 2. What belongs to a REVIEW rather than to any edit:

- **A still cannot show that something OSCILLATES**, and that is not a rare case here. A 600ms flash
  on a step whose whole span is 600ms sits at peak at half span and is still lit at 95 percent, so
  both frames read as an ordinary static highlight, and three of them in a row shipped. `motion.mjs`
  and the `-0` against `-50` pixel diff are the two readers.
- **`motion.mjs` marks SUSPECT any `filter: brightness(...)` track on something that is not a Pod**,
  because `M-04` calls that a PULSE and `M-01` says only Pods pulse. Read what the card RUNS, not
  what the source looks like.
- The poster frame (step 0): does it draw anything it should not, and does it preview step 1 text
  (`S-09`, `D-14`)?

---

## 4. Measure

Tools, what each answers, and the two ways a measurement lies are `_shared/card-verify.md` section 3.
Run them all. The two with no machine on either side, and therefore the two this skill exists to
read, are `timing.mjs` (reading load) and `deadair.mjs` (still time after the motion ends).

---

## 5. The axes

Eleven, and the first one is somebody else's.

| Question | Owner |
|---|---|
| is a sentence TRUE, does the picture agree with it, is a drawn value valid, are the absolutes qualified, does the `aria-label` promise what is drawn | `card-facts` |
| does the code agree with its own RECORD and with the catalog wiring | here, axis B |
| geometry, motion, state, wire placement, dead code, poster, controls, every markdown except the record's `CONTENT` block | here, axes C to K |

### A. Facts and truth: delegated

**Run the `card-facts` skill on the same card and fold its verdict table into your report.** It owns
the claim inventory, the source fetching, the prose-against-animation reconciliation, the absolutes
sweep (`T-19`), the validity of every chip and label, the truth of the `aria-label`, and the
`CONTENT` block. Do not repeat any of it here.

Without a network, do the offline half yourself: internal contradiction between a sentence and the
picture, between two steps, and against the sibling that owns the mechanism. That half needs no
source and finds more than half of everything.

### B. The code against its own record

- the `## <card-id>` section against the code it describes: a measurement taken before the thing it
  measured moved, a constraint guarding something that no longer exists, an anchor whose line was
  reworded
- the record against `CANON.md` and the category `CLAUDE.md`: a rule restated in two homes drifts,
  and the record is only allowed to hold DEVIATIONS and measurements
- the catalog wiring: `cards.js` fields present, `posters.js` carrying an entry, an alias in
  `app.js` still resolving, counts in `scheme/CLAUDE.md` and `README.md` when the catalog changed

### C. Prose mechanics

The gate already reads every drawn string for apostrophes, semicolons and dashes (`T-01`, `T-03`,
`T-04` in `inline.test.mjs`), so do not re-grep for them. What has no machine:

- the write hook `check-js.sh` fails an EDIT, not a test, when an apostrophe lands in a
  single-quoted string. The message arrives as tool feedback and is easy to scroll past.
- after ANY bulk edit over prose, READ the result (`T-31`).

### D. Layout and geometry

- The panel column: nothing essential at `x<=397`, and the depth is per card and per viewport.
- Frame labels: `node()` prints at the top-left corner, which is exactly where the panel sits.
- Text against text and text against lane: `geometry.test.mjs` scores lanes against BLOCKS, and a
  text is not a block, so a dashed lane through a string is invisible to it.
- Wall clearances: measure the gap from a string to the box or frame beside it, and record the
  character ceiling that gap imposes.
- Category geometry families (`L-23`, `L-24` and the category `CLAUDE.md`) before moving any row.

### E. Motion and choreography

- `span <= duration` (`M-19`), and moving a lane is a timing change because `routeDur` is
  length-based (`A-11`).
- Packet against pulse order: up-arrow means the Pod blinks first, then the packet; down-arrow means
  the packet first and the pulse on arrival.
- A block lights when the ball LANDS, not when its neighbour starts, or the picture credits the
  wrong actor.
- **Compare the ARRIVALS of one card against each other, not each against the rule.** The same lane
  onto the same target, cued on one step and silent on two others, is the `P-04` asymmetry and it is
  what a reader actually sees. It survived a full review here because the silent steps carried a
  comment explaining themselves and the reviewer matched the comment to a canon row instead of
  opening the frame at the arrival. `settled-dump.mjs` gives the whole card's highlight sets in one
  read: put them side by side before believing any per-step reason.
- **A cue that starts on the same frame as the fade that kills its block is not a cue.** Both the
  highlight and the removal ran from the arrival here, so the entry was never lit while it was
  still there. Read the delays out of `motion.mjs`, not out of the source: two entries both saying
  `at: 'write'` look deliberate and render as nothing.
- Every ball represents literal traffic the step narrates. A decorative packet on a connector is a
  defect even though it animates beautifully (`M-10`).
- Only Pods pulse (`M-01`), and value chips never flash (`M-26`). **Do not close this one by reading
  the source and matching it to `M-27`.** That row sanctions `F.flash`, `M-01` forbids a pulse on
  infrastructure, and `flashChips` implements the sanctioned flash AS a brightness pulse, brighter
  (1.55) than the Pod pulse it is measured against (1.4), so the two rows permit and forbid the same
  motion. Read what the card RUNS with `motion.mjs`, decide per target, and write the decision into
  the record whichever way it goes.
- **How long the step stands STILL once the motion is over** (`M-19a`). The one axis a viewer
  notices before any other and the only one with no machine on either side. The usual cause is not
  the duration: it is an exchange the narration promises and the picture never draws, so the step
  spends its hold on one hop where its siblings spend it on three.

### F. State: opacity, lit, reset

- Does every step declare the state it needs, or inherit from the step before by luck?
- Does `reset.keys` cover everything a step lights, and does `rewind` wind back everything it writes?
- Is a dim treatment a WEIGHT rather than a state? Dim on a role-carrying lane is deliberate in this
  catalog and must not be "fixed".
- **Does every chip whose VALUE changed carry a cue (`P-05`), and does no chip carry one for a
  change that did not happen (`P-09a`)?** `P-01` is machine-checked and answers a different question.
  Whether a CHANGED value is cued is `report/arrival.test.mjs`, axis R2-STEP, which the gate does not
  run: its "left to work" list is the live queue. Doing this to one chip and not its neighbour is
  worse than doing it to neither (`P-04`).
- Step 0 is a pure reset, draws nothing, carries no narration (`S-09`).

### G. Wire labels

- One per drawn exchange. A route with a ball and no label leaves the frame silent about what rode.
- Stated in `wires`, wound back blank in `rewind`, so prev and reset show the same string as play
  (`T-30`).
- Placed under the component doing the work, out of the panel column and off the lane corridors.

### H. Dead code and staleness

`statics.mjs` covers the mechanical half. Confirm each hit, then read for the half it cannot see:

- a constant that survived a refactor with nothing reading it (canon: zero, catalog-wide)
- a part key nothing addresses, a wire nothing writes, a lane nothing rides
- a comment describing code that moved, or one past the two-line ceiling (`S-34`)
- an alias in `app.js` pointing at a renamed card
- a helper kept for one call site that no longer exists

### I. Catalog and records

- `cards.js`: title, category, subcategory, desc, `k8sVersion`, `sources` all present. Their TRUTH
  is `card-facts`, their presence and shape are here.
- Counts in `scheme/CLAUDE.md` against `data.js`, and the root `README.md` counts, which nothing
  links to and nothing checks.
- Record anchors still occur in the card verbatim (`unit/docs.test.mjs` group A checks this).

### J. The poster: detect only, then hand over

Look at it, do not redraw it. `card-poster` owns `posters.js` and the `### poster` note, and drawing
one starts with a concept signed off in one line (`R-01`).

```bash
node .claude/skills/card-poster/tools/montage.mjs <card-id> --out=/tmp/card-poster
node .claude/skills/card-poster/tools/poster-lint.mjs <card-id>
```

Report it as a finding, with the montage path, when the thumbnail is a literal miniature of the card
diagram (`R-10`), when it reuses a neighbour's layout, when it has no subject, or when the card was
rebuilt and the poster stayed behind.

### K. The dialog itself

Cheap, and nothing else in the review touches it (`D-15`):

- `Space` plays and pauses, arrows step, `R` resets, `Esc` closes
- `Next` from the last step wraps to the poster and then to step 1 (`D-14`)
- the speed buttons hold their state, and a reset lands on the poster rather than mid-flight

---

## 6. Report

Rank by what it costs a reader, not by how easy it is to fix. For each finding give:

- one sentence stating the defect
- where: `path:line`
- the evidence: a measured number, a frame path, a quote from the card and the quote it contradicts
- why it matters, and what the fix would be
- confidence, and the check that would settle it if you are unsure

Add a short "checked and correct" list. It stops the next reviewer from re-deriving the same ground,
and it is where a deliberate asymmetry belongs so nobody "fixes" it later.

---

## 7. Fix, on approval

**In lane B the request IS the finding** and the approval came with it. In lane A, report first.
Either way the editing rules, the ruling check and the blast radius are
`_shared/card-edit.md`, and they are read before the first edit rather than after it.

Re-verify after every change: the module still parses, and the FRAMES for every step you touched,
opened and looked at.

---

## 8. Records, counts and ship

`_shared/card-verify.md` sections 4, 5 and 6: the count sweep, the record rules, the container
rebuild, the commit rule. Two things belong to this skill rather than to the shared file:

- **The `CONTENT` block belongs to `card-facts`.** If the fact check ran on this card, leave that
  block to it and edit the rest. Two procedures rewriting one block is how a settled wording gets
  quietly reworded.
- **Counts stated in prose** (how many wire labels, how many lanes, how many steps) are updated in
  the record when the review moved one.
- **In lane B the sweep is routed the same way the loop is.** A coordinate falsifies a MEASUREMENT
  written into the record (`LAYOUT`, `SIZES`, `LANES`) and moves no character count; a reworded
  narration moves character counts and the panel measurements and no coordinate. Re-measure what the
  change actually touched, and say in the deliverable which of the two it was. `S-49`, the guarded
  half, rides in the deferred gate: it is discharged with the debt list, not skipped with it.

---

## 9. Deliverable

In the user's language:

- **which lane ran**, and for lane B the scope, what the record ruled (quoted, or "the record says
  nothing about this"), and every blast-radius row re-checked with the number behind it
- what was run: the FULL gate result with numbers, not the filtered one, plus how many frames were
  opened and at which viewports, and how many of the 94 review rows were walked
- findings, ranked, with evidence
- what was fixed and what was verified after the fix
- the count sweep as a table: every file touched or checked, marked **updated**, **re-measured and
  still exact**, or **already stale before this review**, with the number behind the verdict.
  "Nothing else needed changing" without a number is not an answer
- what stays open, with the reason
- the tree state (uncommitted unless the user asked)

---

## Appendix: what no check can see

`reference/blind-spots.md` beside this file: what the gate cannot see, and the defect families this
repository produces again and again. **Read it in phase 3.**
`node tools/canon.mjs --check=review` from `scheme/test/` asks the same question of the rulebook
itself, which is the copy that cannot go stale.
