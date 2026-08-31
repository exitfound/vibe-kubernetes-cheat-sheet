# What no check can see, and what keeps coming back

Two lists this skill works from, moved out of `SKILL.md` so the procedure stays the thing that gets
read every time and these stay the thing that gets read while hunting.

**Read this file in phase 3, before opening the frames.** The first list is what you are looking
for; the second is what it has turned out to be before.

**Neither list is a rulebook.** `scheme/CANON.md` is, and where the two disagree the canon wins.
`cd scheme/test && node tools/canon.mjs --check=review` prints the live subset of rows no machine
covers, which is the same question asked of the source of truth rather than of a snapshot.

## What the gate cannot see

A working index, not a second rulebook: `CANON.md` is the source, and where the two disagree the
canon wins. Assume nothing in this list is covered by a test, because none of it is:

- whether a sentence is TRUE, or whether the picture says the same thing as the sentence
- whether a step is long enough to READ (only `span <= duration` has a machine)
- **how long a step stands STILL after its motion ends** (`M-19a`). `M-19` bounds `duration - span`
  from below and nothing bounds it from above, so a step whose ball lands at 700ms and whose hold is
  3800 is green everywhere and reads on screen as a card that froze. `deadair.mjs` is the only
  reader, and `timing.mjs` has both numbers without ever subtracting them
- how FAST a ball moves. `M-19` and `M-12` are both satisfied by a 56 unit lane crawling for 700ms
  at 0.080 units per ms against the 0.45 canon, because `routeDur` clamps to a floor and nothing
  prints the quotient. Moving a lane CLOSER is a pacing change with no check at all
- a chip whose value CHANGED and which nothing cues. `report/arrival.test.mjs` prints it and
  `npm test` does not run that file, so it is invisible to a review that stops at the gate
- a text under the narration panel, or a dashed lane drawn through a string
- a node frame label covered by anything, since the occlusion rule excludes node frames
- a step's `id`, its `duration` and the ORDER of its keys: none of the three reaches the DOM or WAAPI
- a deferred effect during a seek: turnovers, arrival classes, deferred wire writes (`M-35`)
- **a block that PULSES rather than lights.** `spec-steps/M-26` reads the part kind behind every
  flash target and a box is a legal one, so a `PULSE_BLOCK` track on infrastructure is permitted by
  the only check that looks. Nor can any still frame separate it from a static `.highlight`
- anything a `ctx.reduced` guard skips: `flashChips` returns on that path, so every reduced, prev,
  reset and `gotoStep` reader is blind to it by construction
- a WAAPI track and a CSS transition landing on one element: `test/fixtures/render.mjs` freezes
  transitions for every render test on purpose, so no test in the tree runs with them live
- a counterfactual step that draws a state which never happened (`T-35`)
- a decorative packet on a lane the narration never mentions
- a stale record, a stale README count, a poster that no longer matches the card
- a comment that describes code which has moved
- **a ruling sitting inside a GREEN assertion.** A baseline constant (`EXPECTED_COMBINATIONS`,
  `EXPECTED_PAINTED`, a carried-finding list) carries its reason in the comment above it, and a
  passing test prints neither. It is invisible to the gate, to the reports and to a full read of the
  record and the canon, and it surfaces only when your change breaks it, which is one cycle too
  late. `cd scheme/test && grep -rn '<card-id>' . --include=*.mjs` before the first edit is the only
  thing that finds it. It cuts both ways: such a ruling is also unreviewed, so re-measure any number
  or shade it asserts rather than obeying it on sight

## Recurring defect families in this repository

- The arrow into nothing: a lane that ends on a frame while the pulse says which box reacted.
- The credited wrong actor: a block lit on its neighbour's beat rather than on its own arrival.
- The invisible label: a string that is not dim but absent, under the panel or off the canvas.
- The bulk-edit wound: `The The`, a broken sentence opening, a dropped word, an absolute created by
  trimming a qualifier.
- The symmetric "fix": two treatments that differ deliberately, made uniform by a later pass.
- **The motion a still cannot show**: a flash, a pulse or any oscillation whose whole span fits
  inside the step, so every freeze point lands mid-motion and reads as a static state. Caught only
  by diffing the `-0` frame against a mid-span one, or by `motion.mjs`.
- **The rule read instead of the picture**: a reviewer greps the source, matches it to a canon row,
  and files it under "checked and correct" without ever looking at what it does on screen. Two canon
  rows disagreeing is what makes this cheap to do and expensive to miss.
- **The frozen tail**: the motion ends a third of the way into the step and the picture then stands
  still for seconds. Every check is green, because the only rule on that difference bounds it from
  the wrong side. It is almost never a duration that is too long: it is a narrated exchange the
  picture never draws, so one hop is carrying a hold sized for three.
- The stale record: an `OPEN` entry closed in code and still open in the record.
- The number that was never re-measured after the thing it measured moved.

