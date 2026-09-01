# After you touch a card

The shared tail of `card-new`, `card-review`, `card-facts` and `card-poster`. It is what a CHANGE
costs on the way out, in one place, so four procedures cannot drift into four answers.

**This file is procedure only.** How to report what you found belongs to the skill that found it:
`card-new` closes with a composition and the lever no sibling carries, `card-review` with ranked
findings, `card-facts` with a verdict table, `card-poster` with a sentence and a family. Do not let
this file's voice become theirs.

---

## 0. Preconditions

```bash
python3 -m http.server 8888 --bind 0.0.0.0      # from the repo root, if nothing is serving yet
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8888/scheme/
```

`npm test`, `npm run report` and `node --test` run from `scheme/test/`. Every helper under
`.claude/skills/*/tools/` resolves its imports relative to itself and runs from anywhere.

### Start the long runs before you read anything

Two of the runs below take minutes and neither needs you while it goes. Started FIRST, in the
background, they finish under the reading rather than after it, and a card that used to cost six
minutes of watching a progress line costs none:

```bash
cd scheme/test
npm run report > /tmp/report.txt 2>&1 &                                  # about 3 minutes
node ../../.claude/skills/card-review/tools/frames.mjs <id> --out=/tmp/frames/<id> > /tmp/frames.txt 2>&1 &
```

Then read (`ctx.mjs`, the record, the source) while they run, and collect them at the phase that
needs them. The full gate goes the same way at the END of the work, started before the record and
the count sweep are written rather than after.

**A backgrounded run that nobody read is worse than one that was never started**, because the work
looks verified and is not. Two rules, and they are not negotiable:

- A card is NOT closed until every run you launched has come back AND been read. Redirect to a file
  and grep it (section 1 says why `tail` alone lies), never judge it by the fact that it exited.
- Name each one in the deliverable with its result: `npm test` green at 1131 tests, `report`
  read, `frames` opened. A run you cannot name a result for did not happen.

**The server is not optional and its absence is silent.** Nine files under `render/` drive a real
browser against `http://localhost:8888`, so with nothing serving they all fail and a BEFORE list
taken in that state bakes nine bogus lines into whatever you are about to compare against. Take the
`curl` above before the gate, not after it.

### You are often not the only writer

Two Claude sessions and a person can hold this tree at once. On 2026-08-30 one of them rewrote
`scheme/js/schemes/workloads/posters.js` and a sibling record underneath a running agent, and the
agent noticed only because it re-read the file. Assume it can happen and it costs nothing:

- Never `Write` a whole shared file. `Edit` the smallest unique string, and **re-read the file
  immediately before every write**.
- After an edit lands, re-read once more and confirm the parts you did not touch are unchanged.
- If a file moved underneath you mid-edit, stop and say so rather than forcing the write.

A session listing is not this check. It cannot see a person in an editor or a `git` command, and it
answers a different question. The signals that work are free: `git status --porcelain`, the mtimes
of the files you are about to touch, and a diff against the copy you took.

### Back up first, because the recovery you know is banned here

`git checkout -- <path>` restores from the INDEX, so on a partially staged file it destroys the
unstaged work silently, and this tree is normally dirty with in-flight work that has no other copy.
It is never the recovery move. Take a copy instead, and take a fresh one after each stage that
lands, so a bad stage costs one stage rather than the session:

```bash
D=/tmp/cardwork/$(date +%H%M%S); mkdir -p "$D"
git status --porcelain | awk '{print $NF}' | tar czf "$D/dirty.tgz" -T -
```

Restoring one file is `tar xzf "$D/dirty.tgz" <path>` from the repo root, or into a scratch
directory first when you want to diff before overwriting.

---

## 1. Three loops, and running the wrong one is most of the wasted time

| Loop | Cost | What it proves |
|---|---|---|
| `npm run test:unit` | 1.5s | the whole catalog, no browser. Run it as often as you like |
| `SCHEME_IDS=<id> npm run test:render` | 6.5s | this card only, floors and censuses OFF |
| `npm run docs:sync` | 0.5s | writes every guarded count the tree has moved. Section 4 |
| `npm test` | 100s | THE GATE: `unit/**` and `render/**` over the whole catalog |
| `npm run report` | 100s | `report/**`, which the gate does NOT run |
| `npm run all` | 105s | BOTH, over one walk. What to run when you want the gate and the report |

Measured on 2026-09-01 at 123 cards. The two long ones were 190s and 147s the day before, and what
changed is not the checks: every browser-driven file now asserts over ONE walk of the catalog
(`test/tools/walk.mjs`) instead of opening all 123 cards in a Chromium of its own. Twelve files did
that, so 137 of the old 337 seconds went on re-opening cards another process had open a moment
earlier. **This is why `npm run all` costs barely more than either half: the walk is the cost, and
it is paid once.** Re-time rather than trusting the column (`{ time npm run all; } 2>&1 | tail -3`)
whenever a run feels longer than it says, and correct the number here when it has moved.

**The two long ones belong in the background** (section 0), and over a BATCH they are paid once for
the whole batch rather than once per card: `SCHEME_IDS=a,b,c` takes a list, and the walk they share
covers the catalog anyway. Per card that is eight seconds of machine time, not six minutes.

**Run the full gate ONCE, at the end.** Not after each edit, not again during the sweep. While
iterating, unit plus the filtered render is the loop, and it is seven seconds:

```bash
cd scheme/test
npm run test:unit
SCHEME_IDS=<card-id> npm run test:render > /tmp/r.txt 2>&1
grep -E '^# (tests|pass|fail|skipped)|^not ok' /tmp/r.txt
```

### The DETAIL loop, for a change that names its own scope

A change to one coordinate, one string, one chip value, one duration or one opacity used to pay the
same tail as an audit: `npm test` and `npm run report`, three and a half minutes of waiting for a
one-line edit, and six before the walk. It does not have to, because both of those runs answer questions about the
CATALOG, and the questions a detail change raises are about one card. Measured per card:

| Owed by | Run | Cost |
|---|---|---|
| every change | `npm run test:unit` | 2s |
| every change | `SCHEME_IDS=<id> npm run test:render` | 7s |
| geometry: a coordinate, a size, a lane endpoint | `GEOMETRY_IDS=<id> node --test report/geometry-soft.test.mjs` | 5s |
| prose: a narration, a wire string, a desc | `OVERLAY_IDS=<id> node --test report/overlay.test.mjs` | 5s |
| motion or state: a duration, an easing, an opacity | `motion.mjs`, then the `-0/-50/-95` frames of the touched steps | 20s |
| every change | the frames of every step the changed thing appears in | 19s |
| every change | the record measurement the change falsifies, and the container rebuild (0.85s) | |

**Route by what the change TOUCHED, and read the routing as additive rather than as a menu.** The
panel is text driven, so `L-02`, `L-04` and `L-05a` move when prose moves and not when a lane does.
The occlusion rules are per card and per block, so they move when geometry does. A change that is
both owes both.

**What is deferred is deferred INTO A WRITTEN LIST, never into nothing.** Keep the card ids whose
full gate is owed, and discharge them with ONE `npm run all` over the batch, before the commit and
before the session ends. `all` and not the two separately: both halves assert over one walk of the
catalog, so together they cost 105 seconds against 196. The rule that makes this safe rather than merely
faster: **no commit while the debt list is non-empty**, and the deliverable states the list and its
result. A detail loop that never ends in a gate is not a cheaper procedure, it is an unverified one.

Three things this tier does NOT shrink, because they are where a detail change actually goes wrong:
the frames of every step the change can be seen in, the card's own record, and the container
rebuild, which costs under a second on cached layers.

**The REPORTS are not the gate and a review is lost without them.** Everything under `report/` fails
on nothing and is where the findings a human has to rule on are already written down, per card, by
name:

```bash
cd scheme/test
npm run report > /tmp/report.txt 2>&1
grep -n '<card-id>' /tmp/report.txt
grep -nE 'queue to work|left to work|finding\(s\)' /tmp/report.txt
```

Read the rows AND the queue lines. `report/arrival.test.mjs` splits its R2 axis into findings
CARRIED with a written reason and findings "left to work"; a card in the second list is an open
defect nobody has ruled on, not noise. `report/geometry-soft.test.mjs` does the same for CENTRE,
CENTRE-LOW and OCCLUDED.

Notes that have cost time before:

- `SCHEME_IDS` is NOT the gate and says so on stdout: it prints a `SUBSET` banner and turns every
  catalog floor and census OFF, because a floor is a statement about a full walk. Nine tests skip
  themselves under it. A filtered green run proves this card is clean, never that the catalog is.
- `SCHEME_IDS=a,b,c` takes a list, so a batch amortises the one full gate over the whole batch.
- `SCHEME_IDS` is NOT the filter for the report files (it makes their census assertions fail on the
  short walk). TWO report files take a filter of their own and turn their census off under it:
  `OVERLAY_IDS` for the panel report and `GEOMETRY_IDS` for `geometry-soft`, and both also answer
  `SCHEME_IDS` so a filter set for the gate is not silently ignored. That pair is what makes the
  detail loop below cost seconds: 4.8s and 4.8s against 3 minutes for the whole report suite.
- **Never pipe a run through `tail` alone**: a single `not ok` scrolls past and the pipe hands back
  exit code 0, so the run reads green. Redirect to a file and grep it.
- When the tree already fails, take the BEFORE list and diff against it. Knowing which lines were
  already red is the difference between fixing your own damage and adopting somebody else's.

---

## 2. Frames: generate all of them, read the ones that carry something

```bash
cd scheme/test
node ../../.claude/skills/card-review/tools/frames.mjs <card-id> --out=/tmp/frames/<card-id>
node ../../.claude/skills/card-review/tools/motion.mjs <card-id>
```

`frames.mjs` writes three viewports by three freeze points per step, so nine images a step and 54
on a six step card. Rendering them costs 19 seconds and costs nothing to read later, so always
generate the full set. **Which of them you OPEN is triaged, and the triage is `motion.mjs`**, which
plays the card for real and lists every animation it actually runs, per step.

**Open the triaged set in ONE message, one Read call per frame, at full resolution.** Six frames
opened one message at a time is six round trips for a judgement that needs them side by side, and
side by side is also how a drift between two steps becomes visible at all. This is a batching rule
and nothing else: the same frames, the same count, the same pixels.

**A contact sheet or a montage is NOT a substitute for the frames, and never becomes one.** It
downsamples, and everything this phase is looking for lives under the downsample: a label 1.8 units
from a wall, a caption touching a frame face, two strings whose boxes just overlap. The clearance
rule is judged at 1100x800 because that is where the panel is deepest, and a tile of it is not that
viewport. Reading the sheet and calling the frames done is the same shortcut as opening six frames
out of thirty five, which this project has already paid for twice. A sheet is legitimate for what it
was built for, which is a POSTER beside its neighbours at true size (`card-poster/tools/montage.mjs`),
and there it is the whole point.

1. Open the `-0` frame of EVERY step at **1100x800**. The panel is deepest and widest on the
   smallest viewport, because a narrower panel wraps into more lines, so that is the worst case and
   the one a clearance is judged on.
2. Open the `-50` and `-95` frames only for the steps `motion.mjs` flagged as animating. On a step
   with no motion the three freeze points are the same picture.
3. Open 1600x1000 for the poster frame, and for any step where `extents.mjs` put a string near a
   canvas edge.
4. Where `motion.mjs` and the frames disagree, settle it with the pixel diff:
   ```bash
   compare -metric AE <dir>/*-1100x800-s03-0.png <dir>/*-1100x800-s03-50.png null:
   ```
   A step whose only motion is a packet differs by a couple of thousand pixels. Tens of thousands
   means a BLOCK is changing. A step that should be still and is not comes back as a number no
   still frame would have told you.

**This triage does not weaken the house rule that every card you touched gets looked at.** Every
STEP of every touched card is still opened. What is triaged is duplicate freeze points and duplicate
viewports of the SAME step, and the triage is driven by a real playthrough rather than by eye.

Per frame, ask:

- Does the picture, WITHOUT the panel, say the same thing the panel says?
- Is anything invisible rather than dim: a label under the panel, a string off the canvas, a part at
  opacity 0 that the step needs?
- Does every arrowhead point where the sentence points? Does every ball ride a lane that is drawn?
- Is anything lit that the step does not mention, or dark that it does?
- Do two strings collide, or does one cross a dashed lane?

Then the three states a frame cannot show:

- **Turnovers.** A seek never fires `onfinish`, so `at(...)` handoffs, arrival classes and deferred
  wire writes are missing from every frame (`M-35`). Read them from a real playthrough:
  `node tools/settled-dump.mjs <card-id>`.
- **Prev and reset.** Both replay a step statically with `ctx.reduced`, so anything written only by
  the animation is blank there (`T-30`). Check wire text and chip values after
  `__schemeCtl.gotoStep(n)`.
- **The build frame**, the picture standing before any step is entered:
  `node tools/buildframe.mjs <card-id>`.

---

## 3. Measure, never estimate

```bash
cd scheme/test
node ../../.claude/skills/card-review/tools/timing.mjs <card-id>
node ../../.claude/skills/card-review/tools/deadair.mjs <card-id>
node ../../.claude/skills/card-review/tools/pace.mjs <card-id>
node ../../.claude/skills/card-review/tools/extents.mjs <card-id> [--step=N] [--viewport=1100x800]
node ../../.claude/skills/card-review/tools/statics.mjs <card-id>
OVERLAY_IDS=<card-id> node --test report/overlay.test.mjs
```

- `timing.mjs`: span against duration (`M-19`), the real hold, characters of narration, ms per
  character, and where that pace ranks in the catalog. Reading time has NO machine: a step in the
  top few percent of the ranking is a step nobody can read, and the gate calls it green.
- `deadair.mjs`: how long a step stands STILL once its motion ends. `M-19` bounds that from below
  and nothing bounds it from above (`M-19a`). Read it TOGETHER with the pace ranking: still time is
  the price a long narration charges a short motion, so a high stillness rank alone is ordinary. The
  finding is a step high on stillness AND ordinary on ms per character, and the fix is the MOTION or
  the narration, never `duration` alone.
- `pace.mjs`: what a ball's LENGTH does to its SPEED. A lane short enough for `routeDur` to clamp to
  the 700ms floor (`M-13`) crawls with every check green, and MOVING a lane closer silently slows
  the ball on it. Read the siblings column before filing anything: a length other cards also run is
  the house reading.
- `extents.mjs`: every drawn string measured in viewBox units, with the panel rectangle. Character
  arithmetic is an estimate that has been off by 5 units on a string that then sat 1.8 from a wall.
- `statics.mjs`: a heuristic text sweep for dead constants, unread keys, blank wires. Not a verdict.
  Confirm every hit in the source.

**The two ways a measurement lies:**

1. **Fonts.** A string measured before the webfont lands is measured in the fallback face. The same
   label read 179.2 units with the font and 173.6 without, and the smaller number was written into a
   record as a correction of a number that had been right for months. Wait for `document.fonts.ready`.
2. **The viewBox mapping.** `viewBox.width / rect.width` is NOT the scale: `preserveAspectRatio`
   letterboxes on any viewport whose aspect differs, and that naive ratio reported a right-aligned
   label back on the LEFT corner at 1100x800. Use `getScreenCTM().inverse()`.

A drawn string is a fixed PIXEL size, so its width in viewBox units changes with the viewport.
Always name the viewport beside the number, and take the widest case for a clearance.

---

## 4. Sweep the counts, do not judge them

**A count in a markdown file is a claim about the tree, and any card edit can falsify one in a file
you never opened.** `S-49` machine-checks the guarded ones; the rest are yours, and the failure mode
is deciding by eye that a document "looks unaffected".

```bash
cd scheme/test
npm run docs:sync                            # writes every guarded count the tree has moved
npm run test:unit                            # S-49 CENSUS then has to be green, and it is the check
OVERLAY_IDS=<id> node --test report/overlay.test.mjs         # the L-02 / L-04 / L-05a verdicts
GEOMETRY_IDS=<id> node --test report/geometry-soft.test.mjs  # the soft geometry queue
grep -rn "<the old wording you replaced>" --include=*.md .
```

**Read what `docs:sync` printed, one line per number it moved, and put those lines in the sweep
table.** It rewrites the captured NUMBER of a claim and never a word around it, so it cannot reword a
sentence, and it deliberately repairs nothing whose pattern stopped matching: an UNMATCHED line means
somebody reworded the sentence a claim guards, and that is a decision, not arithmetic. Restore the
shape or update the pattern in `test/fixtures/census.mjs`, on purpose. Running the tool is not the
check either: `npm run test:unit` is, and a deliverable quotes the test rather than the tool.

**This sweep is 1.4 seconds plus two 5-second files, and it used to be `npm test` plus
`npm run report`, six minutes.** Neither long run answers anything the sweep asks. Every count the
registry guards is computed in `unit/docs-census.test.mjs`, which `npm run test:unit` runs in full
over the whole catalog with no browser: the `render/**` half of the gate has no opinion about a
number in a document. The two canon-cited measurements come from two report files that both take a
per-card id. The full gate and the unfiltered report are still owed, once, at the end of the unit of
work (section 1), and this sweep is not where they are paid.

- **Guarded counts**: `npm run docs:sync` then `npm run test:unit` is the whole answer. A green
  CENSUS means every count the registry in `test/fixtures/census.mjs` covers still matches the tree.
  Its failure message names the document, the claim and the number, so answer what it prints rather
  than reasoning about which files are affected.
- **Canon-cited MEASUREMENTS** (`L-02`, `L-04`, `L-05a`, the `T-28` shape split): the report prints a
  `verdict` line per axis. Diff it against the run taken before the edit: identical blocks mean you
  moved nothing. An attribution that already differed before your edit is not yours to fix.
- **Unguarded counts**, the ones that bite: a number stated in a SIBLING card's record, in a folder
  `CLAUDE.md`, in the root `README.md` which nothing links to and nothing checks, or **in these
  skill files**. Re-measure, do not reason: a median moves only if you compute it both ways and see
  two different numbers.

Report each as **updated**, **re-measured and still exact**, or **already stale before this pass**,
with the number behind the verdict. The third is a finding, not a chore to absorb.

---

## 5. The record

Whichever skill is running owns a different part of the `## <card-id>` section, and the split is not
negotiable: `card-facts` owns `CONTENT`, `card-poster` owns `### poster`, everything else is
`card-review`'s, and `card-new` writes the whole thing once. Two procedures rewriting one block is
how a settled wording gets quietly reworded.

House rules for writing any of it:

- The record vocabulary from `scheme/CANON.md` and no labels of your own, in its order.
- **A record states what IS, never what CHANGED** (`S-48`). No dates on edits, no "used to", no
  "was reworded". A rejected alternative is written as a constraint in the present tense.
- It holds only where this card DEVIATES, plus the numbers behind it. Do not restate a rule that
  lives in the canon or the folder contract.
- Numbers are MEASURED and fresh. A number carried over from before the change is a lie with a
  decimal point in it.
- An anchor (``### before `<line of code>` ``) is DATA copied off the source verbatim (`S-38`).
  Never reword one. If the anchored line itself changed, replace the anchor with the new line
  verbatim, and never leave an anchor with an empty body.
- No em-dashes, no semicolons in user-visible prose, and a code comment stays inside the two-line
  ceiling with anything longer moving into the record (`S-34`, `S-35`).

Then prove the records still parse:

```bash
cd scheme/test && npm run test:unit          # docs.test.mjs: anchors, sections, index, citations
```

---

## 6. Ship

A card, a narration and a poster are all served content, so rebuild the local container after the
edits:

```bash
docker rm -f kube-cheatsheet && docker build -t kube-cheatsheet . && docker run -d --name kube-cheatsheet -p 8080:80 kube-cheatsheet
```

**Never commit unless the user asks.** Finish, report, and leave the tree uncommitted.

---

## Tools

| Tool | What it answers |
|---|---|
| `_shared/tools/ctx.mjs` | the whole read set of ONE card in one run: catalog entry, record (either shape), source, poster fragment, category contract, and every sibling its prose names, with the `... card` phrases it could not resolve listed rather than dropped |
| `card-review/tools/frames.mjs` | every step, every viewport, as PNGs. Generate all, open the triaged set |
| `card-review/tools/motion.mjs` | what MOVES: every animation the card really runs, real time, CSS transitions live. The only probe here that is not a state reader, and the triage for the frames |
| `card-review/tools/timing.mjs` | span vs duration vs reading load, ranked against the catalog |
| `card-review/tools/deadair.mjs` | how long each step stands STILL after its motion ends, beside its reading pace |
| `card-review/tools/pace.mjs` | how fast each ball actually moves, with the cards running the same length |
| `card-review/tools/extents.mjs` | measured text boxes and the panel rectangle |
| `card-review/tools/statics.mjs` | dead constants, unread keys, blank wires, catalog wiring |
| `card-new/tools/kin.mjs` | the neighbours as composition signatures and levers, and `--id=` for one card |
| `card-poster/tools/montage.mjs` | a poster beside the two it will sit next to |
| `card-poster/tools/poster-lint.mjs` | the mechanical half of the poster contract |
| `card-facts/tools/claims.mjs` | every user-visible string as a claim inventory, plus the token table |
| `scheme/test/tools/canon.mjs` | the rulebook as a query: by block, by id, or narrowed to the rows no machine covers |
| `scheme/test/tools/settled-dump.mjs` | a REAL playthrough, the only reader of turnovers |
| `scheme/test/tools/buildframe.mjs` | the frame standing before any step is entered |
| `scheme/js/lib/inspector.js` (`?inspect=1`) | grid and bbox overlay in the browser, `window.__schemeCtl` |
