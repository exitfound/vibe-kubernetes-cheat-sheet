# What no check can see, and what keeps coming back

Read in phase 3, before opening the frames. Neither list is a rulebook: `scheme/CANON.md` is, and
it wins. `cd scheme/test && node tools/canon.mjs --check=review` prints the live rows no machine
covers.

## What the gate cannot see

- whether a sentence is true, or whether the picture says what the sentence says
- whether a step is long enough to read (only `span <= duration` has a machine)
- how long a step stands still after its motion ends (`M-19a`). `deadair.mjs` is the only reader
- how fast a ball moves. A short lane clamps to the `routeDur` floor and crawls with `M-12` and
  `M-19` green. Moving a lane closer is a pacing change with no check
- a changed chip value nothing cues: `report/arrival.test.mjs` prints it, `npm test` does not run it
- a text under the narration panel, or a dashed lane through a string
- a node frame label covered by anything (occlusion excludes node frames)
- a step's `id`, its `duration` and the order of its keys: none reaches the DOM or WAAPI
- a deferred effect during a seek: turnovers, arrival classes, deferred wire writes (`M-35`)
- a block that pulses rather than lights: `M-26` accepts a box as a flash target, and no still
  frame separates a pulse from a static `.highlight`
- anything a `ctx.reduced` guard skips, which every prev, reset and `gotoStep` reader misses
- a WAAPI track and a CSS transition on one element: `test/fixtures/render.mjs` freezes transitions
- a counterfactual step that draws a state which never happened (`T-35`)
- a decorative packet on a lane the narration never mentions
- a stale record line, a poster that no longer matches the card
- a comment describing code that moved
- a ruling inside a green assertion: a baseline constant carries its reason in a comment, and a
  passing test prints neither. `grep -rn '<card-id>' . --include=*.mjs` from `scheme/test` finds
  it. Such a ruling is also unreviewed, so re-measure what it asserts

## Recurring defect families

- **The arrow into nothing**: a lane ends on a frame while the pulse names the box that reacted.
- **The credited wrong actor**: a block lit on its neighbour's beat rather than its own arrival.
- **The silent arrival**: a ball lands and nothing pulses or lights. Worst form: a fade on the frame
  or lane instead of the Pod reaction, read as the whole Node pulsing weakly. A record calling it
  deliberate is not evidence. `motion.mjs` prints `FADE-ONLY` or `NO CUE`.
- **The invisible label**: absent rather than dim, under the panel or off the canvas.
- **The bulk-edit wound**: `The The`, a broken opening, a dropped word, a trimmed qualifier.
- **The symmetric "fix"**: two deliberately different treatments made uniform.
- **The motion a still cannot show**: an oscillation whose span fits the step. Caught only by the
  `-0` against mid-span diff, or by `motion.mjs`.
- **The rule read instead of the picture**: a source line matched to a canon row and filed as
  correct without opening the frame.
- **The frozen tail**: the motion ends early and the picture stands still for seconds. Almost never
  a duration that is too long: a narrated exchange the picture never draws.
- **The stale record**: an `OPEN` line closed in code, a `DEVIATES` line whose deviation is gone.
