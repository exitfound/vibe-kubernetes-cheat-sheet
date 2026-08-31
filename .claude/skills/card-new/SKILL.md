---
name: card-new
description: Design ONE scheme card and build it, ending with a green gate and a written record. Places the subject in a category and a section, decides the one sentence and the step spine before any geometry, measures what the neighbouring cards already look like and picks a composition the section has not used, gets the concept signed off in one line, builds the module in the declarative form, wires the catalog, verifies at three viewports, and updates every count a new card falsifies. Use when the user asks for a new card ("сделай новую карточку", "добавь карточку про X", "new card for <topic>", "нарисуй схему про X"), and equally when they want an existing card REDESIGNED rather than adjusted: a different composition, a different cast of blocks, a different step spine ("переделай карточку", "перерисуй композицию", "другой набор шагов"), with the subject or the card id as the argument. A change to a coordinate, a string, a chip value, a duration or an opacity is a detail, not a design, and belongs to card-review. For the truth of a card's prose use card-facts, and for its grid thumbnail card-poster. For all four skills run end to end over a SET of cards unattended, use card-cycle.
---

# Card new

One card, from a subject to a green gate and a record. The argument is a topic (`PodDisruptionBudget`),
sometimes with a category (`networking: gateway listeners`), sometimes the id of a card that exists
and is being redesigned.

**The contract of this skill:** the deliverable is a card a reader wants to open AFTER the ones
beside it. A card that passes every check and looks like its neighbour with different words on it
has failed, and nothing in the suite can see that failure. Two gates exist for it: the composition
census in phase 3 and the concept sign-off in phase 4.

**Nothing is written before the sign-off.** No file, no constant, no draft module. Posters are the
biggest source of rework in this project and a whole card is the same mistake at ten times the
price.

**When the card already exists**, read `.claude/skills/_shared/card-edit.md` before phase 3. A
redesign lands on measurements somebody took with a browser, and that file is how they get quoted
instead of overwritten. Everything else below runs unchanged, except that phase 7 has a catalog
entry already and phase 9 moves fewer counts.

**The rules are `scheme/CANON.md`, and they win over anything below.** This file is the procedure,
`reference/compositions.md` is the composition vocabulary. Neither restates a rule.

---

## 0. Preconditions

Server, loops and working directories are `.claude/skills/_shared/card-verify.md` section 0.

```bash
cd scheme/test && npm test > /tmp/gate-before.txt 2>&1; grep -E '^# (tests|pass|fail)|^not ok' /tmp/gate-before.txt
```

**Take the BEFORE gate and keep it.** A card lands in a tree somebody else was working in, and the
counts a new card falsifies (phase 9) fail loudly. Knowing which lines were already red is the
difference between fixing your own damage and adopting somebody else's.

---

## 1. Read before you decide anything

In this order, and this phase is not skippable: a card designed without it reproduces a card that
already exists.

1. The canon, narrowed to the half that is about design:
   ```bash
   cd scheme/test
   node tools/canon.mjs --block=L,A          # layout and lanes, what geometry is allowed to do
   node tools/canon.mjs --block=S            # the module shape a new card has to be born in
   node tools/canon.mjs --check=review       # the rows no machine covers, which is most of design
   ```
2. `scheme/CLAUDE.md`: the folder contract, the declarative form, the "Adding a card" checklist.
   That checklist is the SHORT version of this skill and the two must not disagree.
3. `scheme/js/schemes/<category>/CLAUDE.md`: the category rules, its exemplar, its escape-hook
   table, its subcategory admission rules.
4. The category's exemplar card, in full. Copy its SHAPE (module order, header discipline, the
   declarative form). Its ARRANGEMENT is a solution to its own subject and copying that is how a
   section converges (`reference/compositions.md`, part four).
5. The record of the two or three siblings closest to your subject. Their `SCOPE` blocks say what
   they left to a neighbour, and one of those sentences may already name the card you are about to
   write.

**Items 3, 4 and 5 are one command per card**, and it prints the category contract with them:

```bash
node .claude/skills/_shared/tools/ctx.mjs <exemplar-id>       # the exemplar, its record, the contract
node .claude/skills/_shared/tools/ctx.mjs <nearest-sibling>   # its SCOPE block, and who it names
```

On a REDESIGN, where the card already exists, run it on that card first: the record says what was
measured and what must not be "fixed", and section 6 names every sibling whose prose points here,
which is the list a new composition can falsify.

---

## 2. Place the card, and decide what it is NOT

**Category and section first, because they decide the kit, the tint, the grammar and the id.** The
id MUST start with the category folder (`D-02`), so getting this wrong renames every file later.

```bash
node .claude/skills/section-review/tools/section.mjs <category>/<section>
node .claude/skills/section-review/tools/overlap.mjs <category>/<section>
```

The admission rule for each section is in that folder's `CLAUDE.md` subcategory table, and each one
carries a line saying where the boundary runs. Read it rather than guessing from the title.

Then write down, before any drawing:

- **the subject**, in one sentence, in the user's language
- **what it deliberately leaves to a named sibling**, which becomes the `SCOPE` block of the record
- **the sibling it will be confused with**, and the one difference that separates them

If the user asked for "a card about X" and X is really two cards, say so now and let them choose.
A card whose sentence needs an "and" is two cards, exactly as a poster is (`R-02` says it for the
thumbnail and it is truer at full size).

**When the question is "what is missing in this section" rather than "build this card", that is
`section-review`, not this skill.** Run it, bring back a subject, then start here.

---

## 3. The sentence, the step spine, and the composition census

Three things, in this order. Geometry is last, and every attempt to do it first has produced a card
looking for a subject.

### 3a. The sentence

One line, in words, no elements in it. Not "how a PVC binds" but "a claim waits until something
makes a volume that fits it, and the binding is what makes them exclusive". This sentence is the
card's `WHAT` block, the seed of its `desc` and what the poster will have to say later.

### 3b. The step spine

Five to seven beats, one line each, before any block exists. The count is a real choice rather than
a default: `kin.mjs` prints the step count of every sibling, and the `long` and `short` levers say
where this section already sits against the rest of the catalog.

Each beat states WHO acts, WHAT travels and WHAT changes as a result. A beat with no actor and
nothing travelling ends up as a step with no animation, which is legal (`M-27`) and expensive: it
has to be earning its hold in reading instead.

Rules that bite here, before a line of code:

- every actor a beat names has to be on the canvas (`T-21`), so the spine decides the cast
- every ball has to be traffic a beat narrates (`M-10`), so decoration is decided against here
- an added hop costs about 800ms (`M-34`), so a seven-hop beat is a step nobody can watch
- step 0 is not a beat: it is a pure reset that draws nothing (`S-09`)

### 3c. The composition census. This is the gate the catalog needs

```bash
node .claude/skills/card-new/tools/kin.mjs <category>/<section>
node .claude/skills/card-new/tools/kin.mjs --levers
```

The first prints every sibling as a composition SIGNATURE, the horizontal bands it uses, its chip
layout and the special elements it carries, then three things a designer cannot get any other way:
which signatures are already shared inside the section, which levers the section leans on, and
which levers it has NEVER used with the catalog-wide count beside each.

Read it and answer, in writing:

1. Which family in `reference/compositions.md` says this card's KIND of sentence?
2. Which signature would a straight copy of the exemplar land on, and how crowded is it already?
3. Which levers does this card take that its siblings do not?

**The bar: at least one lever no sibling in the section carries, and a reason it belongs to this
subject.** A lever chosen to be different is decoration. A lever chosen because the subject has a
budget in it, or two Nodes in it, or no Pod in it, is a composition.

The tool reports and never fails, and it is blind to whether the picture is any good: two cards
with one signature often look nothing alike. It says what a reader of that section has already
seen, which is the thing no check in the suite knows.

---

## 4. Sign-off. This gate is not optional

**Describe the whole card in ONE block and get approval BEFORE creating any file.** Same gate as
`R-01` for a poster, and for the same reason: a card is cheap to describe and expensive to build.

The block is six lines and nothing else:

> **Subject**: what the card teaches, one sentence
> **Section**: `<category>/<subcategory>`, and the sibling it sits next to
> **Steps**: the spine, one clause per beat
> **Composition**: the family, the bands, the cast, where the chips go
> **What makes it differ**: the lever no sibling carries, and why the subject wants it
> **Record rulings**: the measurement or constraint this composition re-opens, quoted, and what it
> costs to overrule. On a card being born this reads "no record yet"

That last line is the whole cost of the ruling check, and it sits here rather than in a phase of its
own because a sign-off is what the user actually reads: a gate they approve cannot be silently
skipped, and a phase can.

Wait for a yes. If the answer is no, propose a different COMPOSITION or a different SPINE, not a
redrawn version of the same one.

**The exception, and it is narrow:** when the user hands over a fully specified card (the steps, the
blocks and the layout all named in their request), the sign-off is already given. Say so and go.

---

## 5. Geometry, in the one order that works

**Narration first, panel second, blocks third.** The panel bottom is a per-card measurement
(`L-04`), it moves with the PROSE (`L-08`), and it is what the whole content band hangs off. Writing
geometry before the narration exists means measuring it twice.

1. **Draft every narration string.** Real sentences, not placeholders: a placeholder measures the
   panel at the wrong depth and every y below it is then wrong.
2. **Estimate the panel from a sibling** whose longest narration is about the same length. Take its
   `PANEL_B` out of its header comment (`L-07`) as a starting number, never as the answer.
3. **Lay out against the L-shaped safe zone** (`L-01`): the whole width is free below the panel
   bottom, and the whole height is free right of `x=420` (`L-03`). A cramped card usually has the
   room already.
4. **Take the category grammar** rather than typing coordinates: the A/B/C column presets where the
   category has them (`L-08a`, `WL.L-06`), the vertical stack where it does not (`STO.L-01`), the
   frame family from the category record (`L-23`, `CLU.L-01`).
5. **Derive, do not type.** Measured inputs stay as literals with the comment that says where they
   came from (`L-07`); everything else comes through the kit formulas. A constant nothing reads is
   a defect the catalog has zero of.
6. **Re-measure the panel on the real card** as soon as it renders, and move the band if it moved.
   The panel is deepest and widest on the SMALLEST viewport, so 1600x1000 alone proves nothing.

Text clearances are MEASURED, never estimated from character counts (`L-20`, `L-21`). The tools are
in `_shared/card-verify.md` section 3.

---

## 6. Write the module

`scheme/js/schemes/<category>/<card-id>.js`, in the declarative form and no other (`S-02`). The
hand-written `class Scene` form is a regression rather than an alternative (`S-01`).

The file order, which every card follows:

1. one import line from `./<category>-kit.js`, plus `../../lib/svg.js` and
   `../../lib/primitives.js` only if a `raw` needs them (`S-21`)
2. the record pointer comment (`S-36`), in the shape that category's record is in
3. the geometry header: measured literals with their comments, then everything derived
4. `SCENE`, whose `parts` list order IS the z-order (`S-07`)
5. step-local constants and any small factory the steps share
6. `STEPS_SPEC`
7. `export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });`

What a first card gets wrong, in the order it gets caught:

- **an apostrophe in a narration string.** The write hook exits 2 and hard-fails the edit (`T-01`).
  Semicolons and dashes fail in the suite instead (`T-03`, `T-04`).
- **`reset.keys` and `reset.pods` left to be inferred.** They are written out, never derived, and a
  `.highlight` on a Pod inner box has to be named in `keys` or it accumulates (`S-19`).
- **a chip a step forgot to state.** Every step states every chip (`P-01`), which is the shape of
  the data and not a habit.
- **state animated but not pinned above the guard** (`S-13`, `S-15`). Everything above the reduced
  split is the complete static end state.
- **a wire label written only by the animation**, which leaves prev and reset showing a blank lane
  while the narration names the string (`T-30`).
- **`duration` shorter than the motion** (`M-19`). Raise the duration, never shorten the motion.
- **a lane with an arrowhead that nothing rides** (`A-05`), and its mirror, a ball on a lane no step
  narrates (`M-10`).
- **a missing import**, which throws a `ReferenceError` the Timeline swallows: the step plays its
  first packet and stops silently (`S-33`). Only the browser smoke sees it.

Which chip writer the card uses is inherited from its CATEGORY, not chosen (`P-09`, `P-10`), and
the escape hooks are narrow: read the category's hook table before reaching for one, and if the card
seems to need a new flow verb, stop and say so (`S-27`).

---

## 7. Wire it into the catalog

One folder, plus two files outside it. A redesign of an existing card already has the first row and
usually the fourth.

| File | What it gets | Rule |
|---|---|---|
| `js/schemes/<cat>/cards.js` | the `SCHEMES` entry: eight fields, `desc` 410 to 460 characters in 3 sentences | `D-01`, `D-04`, `D-05` |
| `js/schemes/<cat>/posters.js` | the grid thumbnail | `D-06`, and `card-poster` owns the drawing |
| the category record | the `## <card-id>` section, or its own `CARDS/<id>.md` plus an index row | `S-45`, `S-43` |
| repo-root `sitemap.xml` | a `<url>` if the card should be deep-linkable | `D-12` |

**The poster is not drawn here.** Hand it to `card-poster`, which starts from its own one-line
sign-off (`R-01`) and judges the result against the siblings (`R-05`). A card with no poster falls
back to a shape that breaks the poster idiom on purpose (`R-11`), so shipping without one is visible.

The `desc` opens with the question the card answers. It is prose a search box reads (`D-15`), so it
carries the words a reader would type.

---

## 8. Verify by looking

The loops, the frame protocol and the measurement tools are `_shared/card-verify.md` sections 1 to 3.
Run them. Two things belong to a NEW card and to nothing else:

**Open every frame the triage names, at all three viewports, including the poster frame.** On a
brand new card the ordinary case is that a rule is satisfied and the picture is ruined, so the
triage floor is higher here than on a review of a card that has shipped: open the `-0` of every step
at every viewport, not only at 1100x800.

**Then the question this skill exists for, and it is asked at the montage rather than in the source:**

```bash
node .claude/skills/card-poster/tools/montage.mjs <card-id> --out=/tmp/card-new
node .claude/skills/card-new/tools/kin.mjs --id=<card-id>
```

Put a frame of the new card beside a frame of the two siblings it will sit next to in the grid.
**Cover the narration panel. Is it obvious which card is which?** If the answer is no, the levers
line from `kin.mjs` says which axis is still shared, and the fix is a composition change, not a
relabel.

Then the full gate, once, and the report:

```bash
cd scheme/test && npm test > /tmp/gate.txt 2>&1; grep -E '^# (tests|pass|fail)|^not ok' /tmp/gate.txt
npm run report > /tmp/report.txt 2>&1
grep -n '<card-id>' /tmp/report.txt
grep -nE 'queue to work|left to work|finding\(s\)' /tmp/report.txt
```

A report file cannot fail, and a new card is exactly what its queues are for: an uncued chip whose
value changed, a soft geometry finding, a panel extent, a link that does not resolve. **A new card
entering a queue with no ruling is an open defect nobody has looked at.**

---

## 9. Every count a new card falsifies

**A new card is the single most count-breaking change this repository has.** `S-49` makes the
guarded ones fail loudly, and the failure message names the document, the claim and the number, so
the procedure is to run the gate and answer what it prints rather than to reason about which files
are affected. A REDESIGN of an existing card moves far fewer: the card count does not move at all,
and only a changed spine moves the step baseline.

```bash
cd scheme/test && npm test 2>&1 | grep -A4 'CENSUS'
```

Guarded, so `npm test` is the whole answer: `test/fixtures/catalog.mjs` (`CATALOG_BASELINE`, a
baseline rather than a floor, and changing it is how a new card is acknowledged on purpose),
`scheme/CANON.md` headline counts, `scheme/CLAUDE.md` catalog size and category tables, and the
folder `CLAUDE.md` rows.

Unguarded, so they go stale in silence and are yours to sweep: the folder `CLAUDE.md` table row for
how many `SCHEMES` entries `cards.js` holds, the record's index row, the root `README.md` counts,
and a number stated in a SIBLING card's record or in these skill files.

The full sweep procedure and its three verdicts are `_shared/card-verify.md` section 4.

---

## 10. The record

The card's own section, in `js/schemes/<category>/CARDS.md` or `CARDS/<card-id>.md`. Every card has
one, and a card with no record is how a measurement gets lost (`S-45`). The vocabulary, the present
tense rule and the anchor rule are `_shared/card-verify.md` section 5.

What a NEW card owes beyond what a review would add:

- `WHAT`: the sentence from phase 3a
- `LAYOUT`: the composition family, and why the subject wanted it rather than the section default.
  **This is the block that stops the next card from being a copy of this one.**
- `PANEL`: the measured extent per viewport, and what it pins
- `SIZES`, `LANES`, `MOTION`: the numbers that were measured rather than chosen
- `SCOPE`: what this card leaves to a named sibling, from phase 2
- `### poster`: written by `card-poster` (`R-12`)

---

## 11. Truth, delegated

**Run the `card-facts` skill on the finished card** and fold its verdict table into the deliverable.
It owns the claim inventory, the sources, the prose-against-animation reconciliation, the absolutes
sweep (`T-19`), the validity of every drawn value, the `aria-label`, and the `CONTENT` block of the
record plus `desc`, `k8sVersion` and `sources` in `cards.js`.

A new card is the highest-risk input that skill ever gets: every string in it is new, and a card
built from memory rather than from the documentation is exactly the failure it exists to catch.
Without a network, do the offline half: internal contradiction between a sentence and the picture,
between two steps, and against the sibling that owns the mechanism.

Then ship: `_shared/card-verify.md` section 6, container rebuild included. Do not commit unless the
user says so.

---

## 12. Deliverable

- the sentence, the section, and the sibling it sits beside
- the composition family, and the lever no sibling carries
- the FULL gate result with numbers, plus how many frames were opened at which viewports
- the montage path, and the answer to the covered-panel question
- what `card-facts` returned, and what `card-poster` drew
- the count sweep from phase 9, as a table with a verdict and a number per file
- what stays open, with the reason
- the tree state (uncommitted unless the user asked)

---

## Appendix A: what no check can see about a NEW card

Every item here passes a green gate. They are the reason phases 3, 4 and 8 exist.

- **that the card looks like its neighbour.** Nothing in the suite compares two cards as pictures.
  `kin.mjs` compares their declared scenes, which is the closest anything gets.
- **that the composition argues against the sentence**: a symmetric drawing of an asymmetric
  mechanism, a hub whose spokes talk to each other, a fan whose legs are not real alternatives.
- **that a block is on the canvas that no step ever mentions.** `T-21` is a review row.
- **that a step is long enough to READ.** Only `span <= duration` has a machine, and how long the
  step then stands STILL has none at all (`M-19a`).
- **that the six beats are the right six.** A spine that skips the step a reader would ask about is
  invisible to every check and obvious to anyone who knows the subject.
- **that the card belongs in this section**, or that it duplicates one three sections away.
- **that a value is TRUE.** That is `card-facts`, and a card built from memory is where it earns
  its keep.

## Appendix B: the first-card failure list

Ranked by how often each one costs a rebuild rather than an edit.

1. **Geometry before narration.** The panel bottom is a function of the prose, so every y is
   provisional until the sentences are real.
2. **The exemplar copied whole.** Its arrangement solved its own subject.
3. **A cast decided before the spine.** Blocks appear, then steps are invented to justify them, and
   the tell is a block nothing narrates.
4. **Too many hops.** Six beats with three hops each is a card nobody watches to the end.
5. **A ladder that restates the narration.** The panel already carries the sentence.
6. **Four chips because the last card had four.** The chip strip is the cheapest thing on the
   canvas to make specific and the most often left generic.
7. **A poster drawn to match the diagram.** It is a different sentence at a different size, and it
   has its own skill and its own sign-off.
8. **The counts left for later.** They fail loudly, they fail in files nobody opened, and they are
   part of the card rather than an afterthought.

## Appendix C: tools

The full table is `_shared/card-verify.md`. The two this skill owns:

| Tool | What it answers |
|---|---|
| `tools/kin.mjs <cat>/<sec>` | what the neighbours already look like, as signatures and levers, and which levers a section has never used |
| `tools/kin.mjs --id=<card>` | one card's own signature, and whether any sibling shares it |
