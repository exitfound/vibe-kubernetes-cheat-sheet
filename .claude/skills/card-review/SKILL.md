---
name: card-review
description: Work on ONE existing scheme card, in either of two lanes, and leave its records true. REVIEW when nothing is named wrong: runs the machine gate filtered to that card, opens the rendered frames at three viewports, measures text and timing, hunts what no check can see (geometry, motion, state, wire placement, dead code, stale records, the poster), and reports findings ranked. DIRECTED CHANGE when the user names a DETAIL to change: a coordinate, a string, a chip value, a duration, an opacity. Use when the user asks to check, review, audit or re-verify a card ("проверь карточку <id>", "check card <id>", "перепроверь карточку"), and equally when they name a detail to change on one that exists ("сдвинь эту линию", "перепиши шаг", "поменяй значение чипа", "edit this step"), with the card id or title as the argument. A change that moves the COMPOSITION, the cast or the step spine is a design change and belongs to card-new even on an existing card. For a card that does not exist yet use card-new, for the truth of its prose card-facts, and for its grid thumbnail card-poster. For all four skills run end to end over a SET of cards unattended, use card-cycle.
---

# Card review and change

One card that already exists. The argument is an id, a title or a hash from the site.

**A green gate is not the deliverable.** The deliverable is a ranked list of findings, each with
evidence a human can check, plus a true record. A rule can be satisfied and the picture ruined.

**Never widen the diff on your own.** Report first, fix on the user's go-ahead. The one exception is
an unattended `card-cycle` run, whose brief asks for every finding to be fixed. It lapses when the
user is back.

Two shared files, neither optional:

- `.claude/skills/_shared/card-edit.md` before any edit: the ruling check, the blast radius.
- `.claude/skills/_shared/card-verify.md` after it: loops, frames, measurement, counts, record,
  container, commit rule.

## 0. Resolve the card

```bash
cd "$(git rev-parse --show-toplevel)"
node .claude/skills/_shared/tools/ctx.mjs <card-id>           # resolves an id OR a title, and prints phase 1
```

There is no alias map (`D-11`). A card that does not exist comes back as an error with near misses:
that is `card-new`. Launch the frames now in the background (`card-verify.md` section 0). In lane A
launch the unfiltered report with them. In lane B take the two report files filtered by id.

## Which lane

**Lane A, REVIEW.** Nothing is named wrong ("проверь карточку", "audit this one"). Run phases 1 to 9.

**Lane B, DIRECTED CHANGE.** A detail is named: a coordinate, a lane endpoint, a size, a narration,
a wire string, a chip value, a duration, an easing, an opacity, a reset key, a colour. The request
is the finding. Read `_shared/card-edit.md`, edit, then run phases 6 to 9 with the detail loop of
`card-verify.md` section 1.

**Detail or design: test it, do not judge it.**

```bash
cd "$(git rev-parse --show-toplevel)" && node .claude/skills/card-new/tools/kin.mjs --id=<card-id>
    signature  box1 pod1 node1 chip5 cyl0 chain1 raw0
    bands      40,496,518
```

Would the change move `box` / `pod` / `node` / `cyl` / `chain` / `raw`, the `bands` list, or the
step count? Then it is a design change and belongs to `card-new`. A change to `chip<N>` alone, or to
nothing in the signature, stays here.

| The request | Where it goes |
|---|---|
| a change inside `js/lib/*`, a kit or a primitive | lane A, wider: it reaches every card |
| "is this sentence true", "does this match the docs" | `card-facts` |
| "the thumbnail is wrong" | `card-poster` |

The verification does not shrink with the lane. Only the search does.

## 1. Read before you look

```bash
cd "$(git rev-parse --show-toplevel)" && node .claude/skills/_shared/tools/ctx.mjs <card-id>      # already run in phase 0
cd "$(git rev-parse --show-toplevel)"/scheme/test && node tools/canon.mjs --check=review    # the rows no machine covers
```

`ctx.mjs` prints the catalog entry, the record, the source with every comment, the poster fragment,
the category contract, and every sibling the desc, aria-label, narration or record names. Read its
list of unresolved `... card` phrases by hand. Internal contradiction (a card against its own
steps, labels, aria-label or a sibling) is the highest-yield check there is.

`--check=review` lists the rows this skill exists for. `--block=L,A --ids` is the geometry
checklist.

Read yourself when needed: `scheme/CLAUDE.md` once per session, the category kit when a finding
reaches the grammar, `scheme/js/data.js` when the wiring is in question.

## 2. The machine pass

```bash
cd "$(git rev-parse --show-toplevel)"/scheme/test
npm run test:unit
# the report started in phase 0. Collect it first:
grep -n '<card-id>' /tmp/report.txt
grep -nE 'queue to work|left to work|finding\(s\)' /tmp/report.txt
# only after the report has exited (walk snapshot race, card-verify.md section 0):
SCHEME_IDS=<card-id> npm run test:render > /tmp/r.txt 2>&1
grep -E '^# (tests|pass|fail|skipped)|^not ok' /tmp/r.txt
OVERLAY_IDS=<card-id> node --test report/overlay.test.mjs
```

The report is not optional. `npm test` does not run `report/`, and a review that skips it re-derives
by eye what the repository already prints.

## 3. Look at the frames

Read `reference/blind-spots.md` first: what the gate cannot see and the defect families that recur.
The frame protocol is `card-verify.md` section 2. What belongs to a review:

- **A still cannot show an oscillation.** A flash whose span fits the step reads as a static
  highlight at every freeze point. `motion.mjs` and the `-0` against `-50` diff are the readers.
- **`motion.mjs` marks SUSPECT any brightness track on a non-Pod** (`M-01`, `M-04`). Read what the
  card runs, not the source.
- **The ARRIVALS block** of `motion.mjs`: `FADE-ONLY` is a finding. `WRITE-ONLY` and `NO CUE` are a
  queue: each is a finding until the frame at that arrival says otherwise. Compare every row with
  the card's other arrivals.
- The poster frame: draws nothing it should not, previews step 1 text (`S-09`, `D-14`).

## 4. Measure

`card-verify.md` section 3. Run all of it. `timing.mjs` and `deadair.mjs` have no machine on either
side, so they are the two this skill exists to read.

## 5. The axes

| Question | Owner |
|---|---|
| is a sentence true, does the picture agree, is a drawn value valid, is an absolute qualified, does the `aria-label` promise what is drawn | `card-facts` |
| does the code agree with its record and the catalog wiring | here, axis B |
| geometry, motion, state, wires, dead code, poster, controls, the record except `CONTENT` | here, axes C to K |

### A. Facts: delegated

Run `card-facts` on the same card and fold its verdict table into the report. Inside a `card-cycle`
run, do not: name the technical questions in the handover. Without a network, do the offline half
yourself: contradiction between sentence and picture, between steps, and against the sibling that
owns the mechanism.

### B. The code against its record

- Every `DEVIATES` line still true of the code, and every `OPEN` line still open.
- No record line restates a rule CANON or the category `CLAUDE.md` holds.
- Catalog wiring: `cards.js` fields, a `posters.js` entry, the id resolving in `app.js` (`D-11`).

### C. Prose mechanics

The gate reads drawn strings for apostrophes, semicolons and dashes (`T-01`, `T-03`, `T-04`). The
write hook `check-js.sh` fails an edit, not a test, on an apostrophe in a single-quoted string: the
message comes back as tool feedback. After any bulk edit, read the result (`T-31`).

### D. Layout and geometry

- Nothing essential in the panel column, measured per viewport (`L-01`, `L-02`).
- `node()` prints its label at the top-left corner, where the panel sits.
- Text against text, text against lane: the geometry test scores lanes against blocks only.
- Measure wall clearances from each string to the box beside it.
- Category geometry families (`L-23`, `L-24`, the category `CLAUDE.md`) before moving a row.

### E. Motion and choreography

- `span <= duration` (`M-19`). Moving a lane is a timing change (`A-11`).
- Packet against pulse order (`M-15`, `M-16`).
- A block lights when the ball lands, and the block it leaves is lit before it leaves (`M-18a`):
  in that step's `lit` with its ball on `BEAT.lead`, or named in the previous hop's `lights`.
  `report:arrival/R4` prints the queue.
- Compare one card's arrivals against each other, not each against the rule (`P-04`).
  `settled-dump.mjs` gives every step's highlight set in one read.
- A cue that starts on the frame of the fade that kills its block is not a cue. Read delays from
  `motion.mjs`.
- A riding tag and an arrival pulse are declared on their ball (`card-new` section 6). A separate
  `F.tag` is only for a tag emerging from a block. Every ball and tag fades in 200ms (`M-30a`).
- Every ball is traffic the step narrates (`M-10`). Only Pods pulse (`M-01`), value chips never
  flash (`M-26`), and `F.flash` is not an option (`M-27`). Treat a brightness track on a non-Pod
  as the finding.
- Still time after the motion ends (`M-19a`). The usual cause is an exchange the narration promises
  and the picture never draws.

### F. State: opacity, lit, reset

- Every step declares its state rather than inheriting it by luck.
- `reset.keys` covers everything a step lights, `rewind` winds back everything it writes.
- Dim on a role-carrying lane is a weight, deliberate in this catalog. Do not "fix" it.
- Every changed chip value is cued (`P-05`) and no unchanged one is (`P-09a`). The live queue is
  `report/arrival.test.mjs` R2-STEP, "left to work".
- Step 0 is a pure reset with no narration (`S-09`).

### G. Wire labels

One per drawn exchange, stated in `wires` and wound back blank in `rewind` (`T-30`), placed under
the component doing the work, off the panel column and the lane corridors.

### H. Dead code and staleness

`statics.mjs` covers the mechanical half. Confirm each hit, then read for: a constant nothing
reads, a part key nothing addresses, a wire nothing writes, a lane nothing rides, a comment
describing moved code or past six lines (`S-34`), a helper whose call site is gone.

### I. Catalog and record form

- `cards.js`: every field present. Their truth is `card-facts`.
- The record form (`S-51` to `S-53`) is held by `unit/docs.test.mjs` group G in the gate.

### J. The poster: detect, then hand over

```bash
cd "$(git rev-parse --show-toplevel)"
node .claude/skills/card-poster/tools/montage.mjs <card-id> --out=/tmp/card-poster
node .claude/skills/card-poster/tools/poster-lint.mjs <card-id>
```

Report it with the montage path when it is a miniature of the diagram (`R-10`), reuses a
neighbour's layout, has no subject, or stayed behind a rebuilt card. `card-poster` redraws it.

### K. The dialog (`D-15`)

`Space` plays and pauses, arrows step, `R` resets, `Esc` closes. `Next` from the last step wraps to
the poster, then step 1 (`D-14`). Speed buttons hold state, and a reset lands on the poster.

## 6. Report

Rank by what it costs a reader. Per finding: the defect in one sentence, `path:line`, the evidence
(a measured number, a frame path, two contradicting quotes), why it matters and the fix, and your
confidence with the check that would settle it.

Add a "checked and correct" list, where a deliberate asymmetry belongs so nobody "fixes" it.

## 7. Fix, on approval

Lane B came with its approval. Lane A reports first. Either way read `_shared/card-edit.md` before
the first edit. After every change: the module parses, and the frames of every touched step are
opened.

## 8. Record and ship

`card-verify.md` sections 4, 5 and 6. `CONTENT` belongs to `card-facts`: if it ran, leave that block
alone. A deliberate choice you confirmed earns a `DEVIATES` line. A defect you leave open earns an
`OPEN` line with its reason.

## 9. Deliverable

In the user's language:

- the lane that ran. For lane B: the scope, what the record ruled (quoted, or "nothing, grep run"),
  and every blast-radius row re-checked with its number
- what was run. Lane A ends in the full gate, once (inside a `card-cycle` run, the filtered loop).
  Lane B reports its detail-loop runs by name, plus the debt list and how it was discharged. Frames
  opened per viewport, and review rows walked against `tools/canon.mjs --check=review`
- findings ranked, with evidence
- what was fixed and verified after the fix
- the count check, each item **updated**, **still exact** or **already stale**
- what stays open, with the reason
- the tree state (uncommitted unless the user asked)
