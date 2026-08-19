---
name: card-review
description: Re-verify one existing scheme card end to end and leave its records true. Runs the machine gate filtered to that card, looks at every rendered frame at three viewports, measures text and timing, then hunts what no check can see (geometry, motion, state, wire placement, dead code, stale records, the poster), delegates the technical truth of the prose to the card-facts skill, reports findings ranked, applies the fixes the user approves, and finishes by updating every markdown file that describes the card. Use when the user asks to check, review, audit or re-verify a card ("проверь карточку <id>", "check card <id>", "review this diagram", "перепроверь карточку"), with the card id or title as the argument.
---

# Card review

One card, end to end, ending with the records true. The argument is a card id (`cluster-architecture`),
a title (`Cluster Architecture`) or a hash from the site. Resolve it to an id first.

**The contract of this skill:** a green gate is NOT the deliverable. This project has paid twice for
that mistake, most recently when a pass relaid 35 diagrams to zero lint findings, opened six frames
out of thirty five, and shipped three defects no rule could see. The deliverable is a ranked list of
findings, each with evidence a human can check, plus updated records.

**Never widen the diff on your own.** Report first, fix on the user's go-ahead. If the user already
said "fix it", still report what you are about to change before changing anything structural.

---

## 0. Preconditions

```bash
python3 -m http.server 8888 --bind 0.0.0.0      # from the repo root, if nothing is serving yet
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8888/scheme/
```

`npm test` and `node --test` must run from `scheme/test/`. The four helper scripts of this skill,
in `tools/` beside this file, resolve their imports relative to themselves and run from anywhere,
including the repo root: the paths below simply keep one working directory for the whole session.

Resolve the card:

```bash
grep -rn "id: '<card-id>'" scheme/js/schemes/*/cards.js       # category + catalog entry
ls scheme/js/schemes/<category>/<card-id>.js                  # the source
grep -n "'<card-id>'" scheme/js/app.js                        # old hashes forwarding here
```

---

## 1. Read before you look

In this order. Skipping this phase is what turns a review into an opinion.

1. `scheme/CANON.md`. The rulebook: every rule, its id, and whether a machine stands behind it. It is
   not auto-loaded. Read it whole, once, at the start, then narrow it to the half this review is
   actually for:

   ```bash
   cd scheme/test
   node tools/canon.mjs                       # the census: rows per block, by Check kind
   node tools/canon.mjs --check=review        # the rows NO machine covers
   node tools/canon.mjs --check=review --block=L,A --ids   # a checklist for the geometry pass
   ```

   Everything a `test:` row names is what the gate in phase 2 already did. The `review` rows are the
   ones a human is the only machine for, so they are what this review spends its attention on, and
   a finished review can say how many of them it walked.
2. `scheme/CLAUDE.md`. The sub-app contract: kits, the spec layer, the test suite, the tools.
3. `scheme/js/schemes/<category>/CLAUDE.md`. The category rules (`CLU.*`, `WL.*`, `NET.*`, `STO.*`).
4. `scheme/js/schemes/<category>/CARDS.md`, the `## <card-id>` section. This is the design record:
   what was measured, what was rejected and why, what must not be "fixed". Read the neighbouring
   sections it names too.
5. The card source, in full, including every comment. Comments carry the reasons.
6. `cards.js` (title, desc, subcategory, k8sVersion, sources), `posters.js` (the grid still),
   `scheme/js/data.js` if the card's category wiring is in question.
7. Every sibling card the narration, the desc or the record names. Contradiction hunting needs them
   open, and it is the highest-yield technique in this repository: 87 cards one reviewer had closed
   yielded 31 real defects when someone else re-read them, and more than half were a card
   disagreeing with its own other steps, its own labels, its own aria-label or a sibling.

---

## 2. The machine pass

Two loops, and using the wrong one is what turns a review into an afternoon. Measured on 4 cores:
the full gate is about 70 seconds because every render file walks the whole
catalog, and the card you are reviewing is about a second of that.

**The review loop, about 7 seconds, run it as often as you like:**

```bash
cd scheme/test
npm run test:unit                                        # 1.7s, no browser, the whole catalog
SCHEME_IDS=<card-id> npm run test:render > /tmp/r.txt 2>&1   # about 6s, this card only
grep -E '^# (tests|pass|fail|skipped)|^not ok' /tmp/r.txt
OVERLAY_IDS=<card-id> node --test report/overlay.test.mjs    # the panel rows for this card
node ../../.claude/skills/card-review/tools/statics.mjs <card-id>
```

**The gate, run it once at the end and before any commit:**

```bash
cd scheme/test && npm test > /tmp/gate.txt 2>&1; grep -E '^# (tests|pass|fail)|^not ok' /tmp/gate.txt
```

Notes that have cost time before:

- `SCHEME_IDS` is NOT the gate and says so on stdout: it prints a `SUBSET` banner and turns every
  catalog floor and census OFF, because a floor is a statement about a full walk. Eight tests skip
  themselves under it (the catalog-wide censuses and the two finding registries). A filtered green
  run proves this card is clean, never that the catalog is.
- Reviewing several cards? `SCHEME_IDS=a,b,c` takes a list, and a batch amortises the one full gate
  over the whole batch.
- Never pipe a run through `tail` alone: a single `not ok` scrolls past and the pipe hands back exit
  code 0, so the run reads green. Redirect to a file and grep it.
- Report files cannot fail. They print rows for a human, and a subset says so in its header.
- `statics.mjs` is a heuristic text sweep, not a verdict. Confirm every hit in the source.

The gate is necessary and not sufficient. Appendix A lists what it cannot see, which is where the
rest of this skill spends its time.

---

## 3. Look at every frame

```bash
cd scheme/test
node ../../.claude/skills/card-review/tools/frames.mjs <card-id> --out=/tmp/card-review/<card-id>
```

Three viewports, three freeze points per step (0, half span, 95 percent), poster included.
**Open every image.** Not a sample. A rule can be satisfied and the picture ruined, and that is the
ordinary case rather than the rare one.

**A still cannot show that something OSCILLATES, so compare the frames against each other before
reading any one of them.** The `-0` frame is the resting state, so anything that differs between
`-0.png` and `-50.png` is MOVING:

```bash
for s in 01 02 03 04 05; do
  echo -n "step $s: "; compare -metric AE <dir>/*-1600x1000-s$s-0.png <dir>/*-1600x1000-s$s-50.png null:; echo
done
```

A step whose only motion is a packet differs by a couple of thousand pixels. A step that differs by
tens of thousands is changing a BLOCK, and a step that should be still and is not comes back as a
number no still frame would have told you. This is not optional: a 600ms flash on a step whose whole
span is 600ms sits at peak brightness at half span and is still lit at 95 percent, so both frames
read as an ordinary static highlight and three of them in a row shipped.

Per frame, ask:

- Does the picture, WITHOUT the panel, say the same thing the panel says?
- Is anything invisible rather than dim: a label under the narration panel, a string off the canvas,
  a part at opacity 0 that the step needs?
- Does every arrowhead point where the sentence points? Does every ball ride a lane that is drawn?
- Is anything lit that the step does not mention, or dark that it does?
- Do two strings collide, or does one cross a dashed lane?
- On the poster (step 0): does it draw anything it should not, and does it preview step 1 text
  (`S-09`, `D-14`)?

Then the paths the frames cannot show:

- **What MOVES, as opposed to what it looks like.** Every other probe here reads a STATE:
  `frames.mjs` freezes one, `settled-dump.mjs` reads the one left after the motion ended,
  `buildframe.mjs` reads the one before step 0. None of them answers "what is animating", which is
  how a block pulsing on three steps running passed a full review. Run the one reader there is:

  ```bash
  node ../../.claude/skills/card-review/tools/motion.mjs <card-id>
  ```

  It PLAYS the card for real (so nothing is lost to the `ctx.reduced` guard that `gotoStep`, prev
  and reset all take) and leaves CSS transitions LIVE (so a transition racing a WAAPI track on one
  element is visible, which `test/fixtures/render.mjs` deliberately freezes for every render test).
  It marks `SUSPECT` any `filter: brightness(...)` track on something that is not a Pod, because
  `M-04` calls that a PULSE and `M-01` says only Pods pulse.
- **Turnovers.** A seek never fires `onfinish`, so `at(...)` handoffs, arrival classes and deferred
  wire writes are missing from every frame this tool produces (`M-35`). Read them from a real
  playthrough: `node tools/settled-dump.mjs <card-id>`.
- **Prev and reset.** Both replay a step statically with `ctx.reduced`, so anything written only by
  the animation is blank there (`T-30`). Check the wire text and the chip values after
  `__schemeCtl.gotoStep(n)`.
- **The build frame**, the picture standing before any step is entered:
  `node tools/buildframe.mjs <card-id>`.

---

## 4. Measure, never estimate

```bash
cd scheme/test
node ../../.claude/skills/card-review/tools/timing.mjs <card-id>
node ../../.claude/skills/card-review/tools/extents.mjs <card-id> [--step=N] [--viewport=1100x800]
OVERLAY_IDS=<card-id> node --test report/overlay.test.mjs
```

- `timing.mjs`: span against duration (`M-19`), the real hold, characters of narration, ms per
  character, and where that pace ranks in the catalog. Reading time has NO machine: a step in the
  top few percent of the catalog ranking is a step nobody can read, and the gate will call it green.
- `extents.mjs`: every drawn string measured in viewBox units, with the panel rectangle, and a flag
  on any text whose box intersects the panel. Character arithmetic (about 6.89 units per mono
  character) is an estimate that has been off by 5 units on a string that then sat 1.8 from a box
  wall. Measure.
- The overlay report gives the panel extent per viewport per step. The panel is widest and deepest
  on the SMALLEST viewport, because a narrower panel wraps into more lines, so 1600x1000 alone
  proves nothing. Re-measure after any prose change.

**The two ways a measurement lies, both paid for on 2026-08-18 in one session:**

1. **Fonts.** A string measured before the webfont lands is measured in the fallback face. The same
   label read 179.2 units with the font and 173.6 without, and the smaller number was written into
   the record as a correction of a number that had been right for months. Wait for
   `document.fonts.ready` before reading any box. Both tools here do.
2. **The viewBox mapping.** `viewBox.width / rect.width` is NOT the scale: `preserveAspectRatio`
   letterboxes the diagram on any viewport whose aspect differs, and that naive ratio reported a
   right-aligned frame label back on the LEFT corner at 1100x800. Use `getScreenCTM().inverse()`.

And one that is not a lie but reads like one: a drawn string is a fixed PIXEL size, so its width in
viewBox units changes with the viewport. Always name the viewport beside the number, and take the
widest case for a clearance.

---

## 5. The axes

Eleven, and the first one is somebody else's. What each skill owns:

| Question | Owner |
|---|---|
| is a sentence TRUE, does the picture agree with it, is a drawn value valid, are the absolutes qualified, does the `aria-label` promise what is drawn | `card-facts` |
| does the code agree with its own RECORD and with the catalog wiring | here, axis B |
| geometry, motion, state, wire placement, dead code, poster, controls, every markdown file except the record's `CONTENT` block | here, axes C to K |

### A. Facts and truth: delegated

**Run the `card-facts` skill on the same card and fold its verdict table into your report.** It owns
the claim inventory, the source fetching, the prose-against-animation reconciliation, the absolutes
sweep (`T-19`), the validity of every chip and label, the truth of the `aria-label`, and the
`CONTENT` block of the record. Do not repeat any of it here.

Without a network, do the offline half of it yourself: internal contradiction between a sentence and
the picture, between two steps, and against the sibling that owns the mechanism. That half needs no
source and finds more than half of everything.

### B. The code against its own record

The one contradiction axis that is NOT a fact check, so it stays here:

- the `## <card-id>` section of `CARDS.md` against the code it describes: an `OPEN` entry closed
  months ago, a `DO NOT` guarding something that no longer exists, a number taken before the thing
  it measured moved, an anchor whose line was reworded
- the record against `CANON.md` and the category `CLAUDE.md`: a rule restated in two homes drifts,
  and the record is only allowed to hold DEVIATIONS and measurements
- the catalog wiring: `cards.js` fields present, `posters.js` carrying an entry, an alias in
  `app.js` still resolving, counts in `scheme/CLAUDE.md` and `README.md` when the catalog changed

### C. Prose mechanics, the part with a machine behind it

The gate already reads every drawn string for apostrophes, semicolons and dashes (`T-01`, `T-03`,
`T-04` in `inline.test.mjs`), so do not re-grep for them. What has no machine:

- the write hook `check-js.sh` fails an EDIT, not a test, when an apostrophe lands in a
  single-quoted string. The message arrives as tool feedback and is easy to scroll past.
- after ANY bulk edit over prose, READ the result (`T-31`). Four times in one session a regex sweep
  left the linters green and the meaning broken: `The The The startupProbe`, a reworded opening that
  broke the grammar, a dropped word, and 29 qualifying conditions cut to fit a character band, each
  leaving a true sentence as a false absolute.

### D. Layout and geometry

- The panel column: nothing essential at `x<=397`, and the depth is per card and per viewport.
- Frame labels: `node()` prints at the top-left corner, which is exactly where the panel sits.
- Text against text and text against lane: `geometry.test.mjs` scores lanes against BLOCKS, and a
  text is not a block, so a dashed lane through a string is invisible to it.
- Wall clearances: measure the gap from a string to the box or the frame it sits beside, and record
  the character ceiling that gap imposes.
- Category geometry families (`L-23`, `L-24` and the category `CLAUDE.md`) before moving any row.

### E. Motion and choreography

- `span <= duration` (`M-19`), and moving a lane is a timing change because `routeDur` is
  length-based (`A-11`).
- Packet against pulse order: up-arrow means the Pod blinks first, then the packet; down-arrow means
  the packet first and the pulse on arrival.
- A block lights when the ball LANDS, not when its neighbour starts, or the picture credits the
  wrong actor.
- Every ball represents literal traffic the step narrates. A decorative packet on a connector is a
  defect even though it animates beautifully.
- Only Pods pulse (`M-01`), and value chips never flash (`M-26`). **Do not close this one by reading
  the source and matching it to `M-27`.** That row sanctions `F.flash`, `M-01` forbids a pulse on
  infrastructure, and `flashChips` implements the sanctioned flash AS a brightness pulse, brighter
  (1.55) than the Pod pulse it is measured against (1.4), so the two rows permit and forbid the same
  motion. Read what the card actually RUNS with `motion.mjs`, decide per target, and write the
  decision into the record whichever way it goes.
- Reading load against the hold: `timing.mjs` ranks the pace against the catalog, and nothing else
  in the repository does.

### F. State: opacity, lit, reset

- Does every step declare the state it needs, or does it inherit from the step before by luck?
- Does `reset.keys` cover everything a step lights, and does `rewind` wind back everything a step
  writes?
- Is a dim treatment a WEIGHT rather than a state? Dim on a role-carrying lane is deliberate in this
  catalog and must not be "fixed".
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
- `CARDS.md` anchors still occur in the card verbatim (`unit/docs.test.mjs` group A checks this).

### J. The poster: detect only, then hand over

Look at it, do not redraw it. `card-poster` owns `posters.js` and the `### poster` note, and drawing
one starts with a concept signed off in one line (`R-01`).

```bash
node .claude/skills/card-poster/tools/montage.mjs <card-id> --out=/tmp/card-poster
node .claude/skills/card-poster/tools/poster-lint.mjs <card-id>
```

Report it as a finding, with the montage path, when the thumbnail is a literal miniature of the card
diagram, when it reuses a neighbour's layout, when it has no subject, or when the card was rebuilt
and the poster stayed behind.

### K. The dialog itself

Cheap, and nothing else in the review touches it (`D-15`):

- `Space` plays and pauses, arrows step, `R` resets, `Esc` closes
- `Next` from the last step wraps to the poster and then to step 1 (`D-14`)
- the speed buttons hold their state, and a reset lands on the poster rather than mid-flight

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

- One finding at a time, smallest diff that closes it. Do not recolor, re-trim or restructure
  anything nobody mentioned.
- Prefer a card-local mechanism over changing a primitive 108 cards share. `tune(el, refs)` on a
  part is the sanctioned escape for nudging one attribute.
- Re-verify after every change: the module still parses, the full gate, and the FRAMES for every
  step you touched, opened and looked at. Not a sample of them.
- Expect self-inflicted regressions in exactly these places: a comment run past two lines (`S-34`),
  an anchored line reworded (`unit/docs.test.mjs`), a wire written by the animation alone (`T-30`),
  a duration now shorter than the motion (`M-19`).
- Rebuild the container after any change to served content:
  `docker rm -f kube-cheatsheet && docker build -t kube-cheatsheet . && docker run -d --name kube-cheatsheet -p 8080:80 kube-cheatsheet`
- Do not commit unless the user says so.

---

## 8. Update the records. This phase is part of the job, not an extra

Every markdown file that describes the card gets brought back into line, in this order:

1. **`scheme/js/schemes/<category>/CARDS.md`, the `## <card-id>` section.** The one that always
   needs work. **Its `CONTENT` block belongs to `card-facts`**: if the fact check ran on this card,
   leave that block to it and edit the rest. Two procedures rewriting one block is how a settled
   wording gets quietly reworded.
   - An `OPEN` entry that the fixes closed becomes a `NOTE` stating what was done, keeping the
     measurement that made the old state a defect, plus `WHY NOT` blocks for the alternatives that
     were rejected. A reader must not be able to re-open a settled question for free.
   - Counts stated in prose (how many wire labels, how many lanes, how many steps) are updated.
   - Numbers are MEASURED and fresh. A number carried over from before the change is a lie with a
     decimal point in it.
   - New blocks use the record vocabulary in `CANON.md` under "The record vocabulary" and no labels
     of your own: `WHAT LAYOUT PANEL SIZES LANES MOTION WIRE LABELS CONTENT BUDGET NAMING SCOPE NOTE
     WHY NOT DO NOT NOT A DEFECT OPEN`, in that order.
   - An anchor (``### before `<line of code>` ``) is DATA copied off the source. Never reword one. If
     the anchored line itself changed, replace the anchor with the new line verbatim.
   - Do not restate a rule that lives in `CANON.md` or in the category `CLAUDE.md`. The record holds
     only where this card DEVIATES, and the numbers behind it.
2. **`scheme/js/schemes/<category>/CLAUDE.md`**, only if a category rule or a category-wide count
   moved. A rule has ONE declaration site and `CANON.md` indexes it with a label, never a copy.
3. **`scheme/CLAUDE.md`**, only if cards were added or removed: the `SCHEMES` count and the
   per-category counts, which must match `data.js` exactly.
4. **`scheme/CANON.md`**, only if a rule changed or a measurement the rulebook CITES moved (an
   `L-02` attribution, a control number). Never add a second copy of a rule.
5. **root `README.md`**, only if the catalog size changed. Nothing links to it and nothing checks
   it, which is why it goes stale.
6. **`cards.js`**: only the fields whose SHAPE this review touched. The `desc` text,
   `k8sVersion` and `sources` are `card-facts` territory, because changing them is a claim
   about what is true.

House rules while writing any of it: no em-dashes, no semicolons in user-visible prose, a count is
stated only where it executes, and a code comment stays inside the two-line ceiling with anything
longer moving into the record (`S-34`, `S-35`).

Then prove the records still parse:

```bash
cd scheme/test && npm run test:unit          # docs.test.mjs: anchors, sections, index, citations
```

---

## 9. Deliverable

Close with, in the user's language:

- what was run (the FULL gate result with numbers, not the filtered one, plus how many frames were
  opened and at which viewports)
- findings, ranked, with evidence
- what was fixed and what was verified after the fix
- which markdown files were updated and what changed in each
- what stays open, with the reason it stays open
- the tree state (uncommitted unless the user asked)

---

## Appendix A: what the gate cannot see

A working index, not a second rulebook: `CANON.md` is the source, and where the two disagree the
canon wins. Assume nothing in this list is covered by a test, because none of it is:

- whether a sentence is TRUE, or whether the picture says the same thing as the sentence
- whether a step is long enough to READ (only `span <= duration` has a machine)
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

## Appendix B: recurring defect families in this repository

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
- The stale record: an `OPEN` entry closed in code and still open in `CARDS.md`.
- The number that was never re-measured after the thing it measured moved.

## Appendix C: tools

| Tool | What it answers |
|---|---|
| `.claude/skills/card-review/tools/frames.mjs` | every step, every viewport, as PNGs to open. Diff `-0` against `-50` per step before reading one |
| `.claude/skills/card-review/tools/motion.mjs` | what MOVES: every animation the card really runs, per step, real time, CSS transitions live. The only probe here that is not a state reader |
| `.claude/skills/card-review/tools/timing.mjs` | span vs duration vs reading load, ranked against the catalog |
| `.claude/skills/card-review/tools/extents.mjs` | measured text boxes and the panel rectangle |
| `.claude/skills/card-review/tools/statics.mjs` | dead constants, unread keys, blank wires, dead paths, prose mechanics, catalog wiring |
| `scheme/test/tools/settled-dump.mjs` | a REAL playthrough, the only reader of turnovers |
| `scheme/test/tools/buildframe.mjs` | the frame that stands before any step is entered |
| `scheme/js/lib/inspector.js` (`?inspect=1`) | grid and bbox overlay in the browser, `window.__schemeCtl` |
| `npm test` / `npm run report` in `scheme/test` | the gate, and the report-only rows per card |
| the `card-facts` skill | the technical truth of every drawn string, and whether the animation says what the text says |
| the `card-poster` skill | the grid still: its concept, its composition, and the record note behind it |
