# After you touch a card

The shared tail of `card-new`, `card-review`, `card-facts` and `card-poster`: what a change costs
on the way out. Procedure only. How to report belongs to the skill that found the thing.

The harness, the gate and the reports are explained once, in `scheme/CLAUDE.md` "The checks".
This file says which runs a card change owes.

## 0. Preconditions

```bash
python3 -m http.server 8888 --bind 0.0.0.0      # from the repo root, if nothing is serving yet
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8888/scheme/
```

The walk that opens `npm test`, `test:render`, `report` and `all` drives a browser against
`:8888`. With nothing serving, nothing after it measures anything. Take the `curl` first.

**Every block anchors itself.** The Bash tool keeps its working directory between calls, so a
second `cd scheme/test` fails. Every block here opens with
`cd "$(git rev-parse --show-toplevel)"/scheme/test`. Run a block as one call. The helpers under
`.claude/skills/*/tools/` resolve their imports relative to themselves and run from anywhere.

### Start the long runs first

```bash
cd "$(git rev-parse --show-toplevel)"/scheme/test
npm run report > /tmp/report.txt 2>&1 &
node ../../.claude/skills/card-review/tools/frames.mjs <id> --out=/tmp/frames/<id> > /tmp/frames.txt 2>&1 &
```

Read the card while they run. **Walk snapshot race:** `npm run report` rewrites
`scheme/test/.snapshot/panel.json` as it runs. `OVERLAY_IDS`, `GEOMETRY_IDS` and
`SCHEME_IDS=<id> npm run test:render` read or overwrite that file, so start them only after the
background report has exited.

A background run nobody read is worse than none. A card is not closed until every run you launched
has come back and been read (redirect to a file, grep it). Name each run in the deliverable with
its result.

### You are often not the only writer

Other sessions and a person may hold the tree at once.

- Never `Write` a whole shared file. `Edit` the smallest unique string, and re-read the file
  immediately before every write.
- After an edit lands, re-read and confirm the parts you did not touch are unchanged.
- If a file moved underneath you, stop and say so rather than forcing the write.

`git status --porcelain`, file mtimes and a diff against your copy are the signals that work.

### Back up first

`git checkout -- <path>` restores from the index and silently destroys unstaged work. It is never
the recovery move here. Take a copy, and a fresh one after each stage that lands:

```bash
D=/tmp/cardwork/$(date +%H%M%S); mkdir -p "$D"
git status --porcelain | awk '{print $NF}' | tar czf "$D/dirty.tgz" -T -
```

Restore one file with `tar xzf "$D/dirty.tgz" <path>` from the repo root.

## 1. The loops

| Loop | What it proves |
|---|---|
| `npm run test:unit` | the whole catalog, no browser, seconds. Run it as often as you like |
| `SCHEME_IDS=<id> npm run test:render` | this card only, floors and censuses off |
| `npm test` | the gate: `unit/**` and `render/**` over the whole catalog |
| `npm run report` | `report/**`, which the gate does not run |
| `npm run all` | both over one walk. Use it instead of the two separately |

While iterating, the loop is unit plus the filtered render:

```bash
cd "$(git rev-parse --show-toplevel)"/scheme/test
npm run test:unit
SCHEME_IDS=<card-id> npm run test:render > /tmp/r.txt 2>&1
grep -E '^# (tests|pass|fail|skipped)|^not ok' /tmp/r.txt
```

Run the full gate once, at the end. `SCHEME_IDS=a,b,c` takes a list, so a batch pays for it once.

### The detail loop, for a change that names its own scope

Route by what the change touched. The rows add up, they are not a menu.

| Owed by | Run |
|---|---|
| every change | `npm run test:unit` and `SCHEME_IDS=<id> npm run test:render` |
| geometry: a coordinate, a size, a lane endpoint | `GEOMETRY_IDS=<id> node --test report/geometry-soft.test.mjs` |
| prose: a narration, a wire string, a desc | `OVERLAY_IDS=<id> node --test report/overlay.test.mjs` |
| motion or state: a duration, an easing, an opacity | `motion.mjs`, then the `-0/-50/-95` frames of the touched steps |
| every change | the frames of every step the changed thing appears in, the record line it falsifies, the container rebuild |

The panel is text driven, so `L-02`, `L-04` and `L-05a` move with prose. Occlusion moves with
geometry. A change that is both owes both.

**Deferred means written down.** Keep the card ids whose full gate is owed, and discharge them with
one `npm run all` over the batch before any commit. No commit while that list is non-empty, and
the deliverable states the list and its result.

### The reports

Everything under `report/` fails on nothing. It is where the findings a human rules on are printed,
per card:

```bash
cd "$(git rev-parse --show-toplevel)"/scheme/test
npm run report > /tmp/report.txt 2>&1
grep -n '<card-id>' /tmp/report.txt
grep -nE 'queue to work|left to work|finding\(s\)' /tmp/report.txt
```

Read the rows and the queue lines. A card in a "left to work" list is an open defect nobody has
ruled on.

Traps:

- `SCHEME_IDS` is not the gate. It prints a `SUBSET` banner and turns every floor and census off.
- `SCHEME_IDS` is not the filter for report files. `OVERLAY_IDS` and `GEOMETRY_IDS` are, and both
  also honour `SCHEME_IDS`.
- Never pipe a run through `tail` alone: a `not ok` scrolls past and the pipe exits 0.
- When the tree already fails, take the BEFORE list and diff against it.

## 2. Frames: generate all, open the triaged set

```bash
cd "$(git rev-parse --show-toplevel)"/scheme/test
node ../../.claude/skills/card-review/tools/frames.mjs <card-id> --out=/tmp/frames/<card-id>
node ../../.claude/skills/card-review/tools/motion.mjs <card-id>
```

`frames.mjs` writes three viewports by three freeze points per step. Always generate the full set.
`motion.mjs` plays the card for real and lists every animation per step, and that list decides
which frames to open.

Open the triaged set in one message, one Read per frame, at full resolution. A contact sheet or a
montage is never a substitute: it downsamples, and clearances live under the downsample. The one
legitimate sheet is a poster beside its neighbours (`card-poster/tools/montage.mjs`).

1. Open the `-0` frame of every step at **1100x800**, where the panel is deepest.
2. Open `-50` and `-95` only for steps `motion.mjs` flagged as animating.
3. Open 1600x1000 for the poster frame, and for any step where `extents.mjs` put a string near an
   edge.
4. Where `motion.mjs` and the frames disagree, diff the pixels:
   ```bash
   compare -metric AE <dir>/*-1100x800-s03-0.png <dir>/*-1100x800-s03-50.png null:
   ```
   A packet alone differs by a couple of thousand pixels. Tens of thousands means a block changes.

Every step of every touched card is opened. Only duplicate freeze points and viewports of the same
step are triaged.

Per frame:

- Does the picture without the panel say what the panel says?
- Is anything invisible rather than dim: under the panel, off the canvas, at opacity 0?
- Does every arrowhead point where the sentence points? Does every ball ride a drawn lane?
- Is anything lit the step does not mention, or dark that it does?
- Do two strings collide, or does one cross a dashed lane?

Three states a frame cannot show:

- **Turnovers.** A seek never fires `onfinish` (`M-35`). Read them from a real playthrough:
  `node tools/settled-dump.mjs <card-id>`.
- **Prev and reset** replay statically with `ctx.reduced` (`T-30`). Check wire text and chips
  after `__schemeCtl.gotoStep(n)`.
- **The build frame** before any step: `node tools/buildframe.mjs <card-id>`.

## 3. Measure, never estimate

```bash
cd "$(git rev-parse --show-toplevel)"/scheme/test
node ../../.claude/skills/card-review/tools/timing.mjs <card-id>
node ../../.claude/skills/card-review/tools/deadair.mjs <card-id>
node ../../.claude/skills/card-review/tools/pace.mjs <card-id>
node ../../.claude/skills/card-review/tools/extents.mjs <card-id> [--step=N] [--viewport=1100x800]
node ../../.claude/skills/card-review/tools/statics.mjs <card-id>
OVERLAY_IDS=<card-id> node --test report/overlay.test.mjs
```

- `timing.mjs`: span against duration (`M-19`), the hold, ms per character, and its catalog rank.
  Reading time has no machine: a step at the top of the ranking is one nobody can read.
- `deadair.mjs`: how long a step stands still after its motion ends (`M-19a`). Read it with the
  pace rank. The finding is high stillness and ordinary ms per character, and the fix is the
  motion or the narration, never `duration` alone.
- `pace.mjs`: what a lane's length does to its ball's speed (`M-13`). A short lane clamps to the
  floor and crawls. Read the siblings column before filing.
- `extents.mjs`: every drawn string in viewBox units, with the panel rectangle.
- `statics.mjs`: a heuristic sweep for dead constants, unread keys, blank wires. Confirm each hit.

Two ways a measurement lies:

1. **Fonts.** Measure after `document.fonts.ready`, or you measure the fallback face.
2. **The viewBox mapping.** `viewBox.width / rect.width` ignores letterboxing. Use
   `getScreenCTM().inverse()`.

A drawn string is a fixed pixel size, so its viewBox width changes with the viewport. Name the
viewport beside every number and take the widest case for a clearance.

## 4. Counts and baselines

Documents carry no counts, except the README headline counts that `S-49` guards.

```bash
cd "$(git rev-parse --show-toplevel)"/scheme/test
npm run docs:sync          # rewrites the README headline counts, numbers only
npm run test:unit          # the census and the catalog baselines must be green
```

- `docs:sync` prints one line per number it moved, and an UNMATCHED line when somebody reworded a
  guarded sentence. That is a decision, not arithmetic: restore the shape or change the pattern in
  `test/fixtures/census.mjs` on purpose.
- Adding or removing a card moves two test baselines: `CATALOG_BASELINE` in
  `test/fixtures/catalog.mjs` and `PER_CATEGORY` in `unit/catalog.test.mjs`. Changing them is how
  the change is acknowledged.
- The README per-category tables are guarded by nothing. Re-read them by hand.
- The canon-cited measurements (`L-02`, `L-04`, `L-05a`, `T-28`) print a verdict per axis in
  `report/overlay.test.mjs`. Diff against the run taken before the edit.

Report each as **updated**, **still exact**, or **already stale before this pass**.

## 5. The record

Each card has one record, `scheme/js/schemes/<category>/CARDS/<id>.md`, in the shape
`scheme/CANON.md` "The record vocabulary" defines and `S-51` to `S-53` hold:

````
## <card-id>

### layout

```
WHAT     One sentence: what the card shows.
DEVIATES <rule id>: what differs, and why, in one line.
CONTENT  Sources: <doc page names, versions>. Then only the wordings a fact forced.
OPEN     <a defect left open>, with the reason it stays open.
```
````

- Labels in that order, each at most once, only `WHAT` mandatory. Prose starts at column 10, and
  continuation lines are indented exactly 9 spaces.
- Ownership: `card-facts` owns `CONTENT`. `card-review` owns `DEVIATES` and `OPEN`. `card-new`
  writes the whole record once. `card-poster` owns nothing here: the poster note is the comment
  above the poster in `posters.js` (`R-12`).
- `DEVIATES` is one line per rule the card breaks on purpose. A choice a future editor would
  otherwise "fix" earns a `DEVIATES` line. Everything else the code or CANON can say stays out:
  no measurements, no panel readings, no motion notes.
- A record states what IS (`S-48`). No dates, no "used to", no rejected history.
- A reason for one constant is a comment on that constant (`S-34`, `S-35`).

Then `npm run test:unit` (group G of `unit/docs.test.mjs` checks the form).

## 6. Ship

A card, a narration and a poster are served content. Rebuild the local container after the edits:

```bash
docker rm -f kube-cheatsheet && docker build -t kube-cheatsheet . && docker run -d --name kube-cheatsheet -p 8080:80 kube-cheatsheet
```

Never commit unless the user asks. Finish, report, leave the tree uncommitted.

## Tools

| Tool | What it answers |
|---|---|
| `_shared/tools/ctx.mjs` | the read set of one card in one run: catalog entry, record, source, poster, category contract, and every sibling its prose names |
| `card-review/tools/frames.mjs` | every step at every viewport as PNGs |
| `card-review/tools/motion.mjs` | every animation the card really runs, with the ARRIVALS block. The triage for the frames |
| `card-review/tools/timing.mjs` | span vs duration vs reading load, ranked |
| `card-review/tools/deadair.mjs` | still time after the motion ends, beside reading pace |
| `card-review/tools/pace.mjs` | ball speed, with the cards running the same length |
| `card-review/tools/extents.mjs` | measured text boxes and the panel rectangle |
| `card-review/tools/statics.mjs` | dead constants, unread keys, blank wires, catalog wiring |
| `card-new/tools/kin.mjs` | the neighbours as composition signatures and levers, `--id=` for one card |
| `card-poster/tools/montage.mjs` | a poster beside the two it sits next to |
| `card-poster/tools/poster-lint.mjs` | the mechanical half of the poster contract |
| `card-facts/tools/claims.mjs` | every user-visible string as a claim inventory, plus the token table |
| `scheme/test/tools/canon.mjs` | the rulebook as a query: by block, by id, or the rows no machine covers |
| `scheme/test/tools/settled-dump.mjs` | a real playthrough, the only reader of turnovers |
| `scheme/test/tools/buildframe.mjs` | the frame before any step is entered |
| `scheme/js/lib/inspector.js` (`?inspect=1`) | grid and bbox overlay, `window.__schemeCtl` |
