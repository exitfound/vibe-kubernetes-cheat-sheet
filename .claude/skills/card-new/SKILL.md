---
name: card-new
description: Design ONE scheme card and build it, ending with a green gate and a written record. Places the subject in a category and a section, decides the one sentence and the step spine before any geometry, measures what the neighbouring cards already look like and picks a composition the section has not used, gets the concept signed off in one line, builds the module in the declarative form, wires the catalog, verifies at three viewports, and updates every count a new card falsifies. Use when the user asks for a new card ("сделай новую карточку", "добавь карточку про X", "new card for <topic>", "нарисуй схему про X"), and equally when they want an existing card REDESIGNED rather than adjusted: a different composition, a different cast of blocks, a different step spine ("переделай карточку", "перерисуй композицию", "другой набор шагов"), with the subject or the card id as the argument. A change to a coordinate, a string, a chip value, a duration or an opacity is a detail, not a design, and belongs to card-review. For the truth of a card's prose use card-facts, and for its grid thumbnail card-poster. For all four skills run end to end over a SET of cards unattended, use card-cycle.
---

# Card new

One card, from a subject to a green gate and a record. The argument is a topic, sometimes with a
category, or the id of a card being redesigned.

**The deliverable is a card a reader wants to open after the ones beside it.** A card that passes
every check and looks like its neighbour has failed, and nothing in the suite sees it. The
composition census (phase 3) and the sign-off (phase 4) exist for that.

**Nothing is written before the sign-off.** No file, no constant, no draft module.

**When the card already exists**, read `.claude/skills/_shared/card-edit.md` before phase 3.

The rules are `scheme/CANON.md`. This file is the procedure, `reference/compositions.md` the
composition vocabulary.

## 0. Preconditions

Server and working directory: `.claude/skills/_shared/card-verify.md` section 0.

```bash
cd "$(git rev-parse --show-toplevel)"/scheme/test && npm run test:unit > /tmp/new-before-unit.txt 2>&1; grep -E '^# (tests|pass|fail)|^not ok' /tmp/new-before-unit.txt
```

Keep this BEFORE reading, so you know which red lines were already red. Unit only: every baseline a
new card falsifies is computed there, and the full gate at phase 8 prints the rest.

## 1. Read before you decide anything

1. The design half of the canon:
   ```bash
   cd "$(git rev-parse --show-toplevel)"/scheme/test
   node tools/canon.mjs --block=L,A          # layout and lanes
   node tools/canon.mjs --block=S            # the module shape
   node tools/canon.mjs --check=review       # the rows no machine covers
   ```
2. `scheme/CLAUDE.md`: the folder contract, the declarative form, "Adding a card". That checklist
   is the short version of this skill.
3. `scheme/js/schemes/<category>/CLAUDE.md`: category rules, sections, exemplar.
4. The exemplar card in full. Copy its shape (module order, header, declarative form), never its
   arrangement (`reference/compositions.md`, part four).
5. The two or three closest siblings.

```bash
cd "$(git rev-parse --show-toplevel)"
node .claude/skills/_shared/tools/ctx.mjs <exemplar-id>
node .claude/skills/_shared/tools/ctx.mjs <nearest-sibling>
```

On a redesign, run `ctx.mjs` on the card itself first: its `DEVIATES` and `OPEN` lines say what must
not be "fixed", and its sibling list is what a new composition can falsify.

## 2. Place the card, and decide what it is NOT

Category and section decide the kit, the tint, the grammar and the id prefix (`D-02`).

```bash
cd "$(git rev-parse --show-toplevel)"
node .claude/skills/section-review/tools/section.mjs <category>/<section>
node .claude/skills/section-review/tools/overlap.mjs <category>/<section>
```

The admission rule for each section is in the folder `CLAUDE.md` section table. Then write down:

- **the subject**, one sentence, in the user's language
- **what it leaves to a named sibling**, said in the `desc` where a reader needs it
- **the sibling it will be confused with**, and the one difference

A sentence that needs an "and" is two cards (`R-02` says it for posters). Let the user choose.
"What is missing in this section" is `section-review`, not this skill.

## 3. The sentence, the spine, the census

### 3a. The sentence

One line, no elements in it. Not "how a PVC binds" but "a claim waits until something makes a
volume that fits it, and the binding makes them exclusive". It becomes the `WHAT` line, the seed
of the `desc`, and what the poster says later.

### 3b. The step spine

Five to seven beats, one line each, before any block exists. `kin.mjs` prints every sibling's step
count. Each beat states who acts, what travels, what changes.

- every actor a beat names is on the canvas (`T-21`)
- every ball is traffic a beat narrates (`M-10`)
- an added hop costs about 800ms (`M-34`)
- step 0 is a pure reset, not a beat (`S-09`)

### 3c. The composition census

```bash
cd "$(git rev-parse --show-toplevel)"
node .claude/skills/card-new/tools/kin.mjs <category>/<section>
node .claude/skills/card-new/tools/kin.mjs --levers
```

It prints each sibling as a signature, the bands, the chip layout and the special elements, then
the signatures already shared, the levers the section leans on, and the levers it never used.

Answer in writing:

1. Which family in `reference/compositions.md` says this kind of sentence?
2. Which signature would a straight copy of the exemplar land on, and how crowded is it?
3. Which levers does this card take that its siblings do not?

**The bar: at least one lever no sibling carries, and a reason the subject wants it.** A lever
chosen to be different is decoration.

## 4. Sign-off. Not optional

Describe the card in one block and get approval before creating any file:

> **Subject**: what the card teaches, one sentence
> **Section**: `<category>/<subcategory>`, and the sibling it sits next to
> **Steps**: the spine, one clause per beat
> **Composition**: the family, the bands, the cast, where the chips go
> **What makes it differ**: the lever no sibling carries, and why the subject wants it
> **Record rulings**: the `DEVIATES` or `OPEN` line this composition re-opens, quoted, and what
> overruling costs. On a new card: "no record yet"

Wait for a yes. On a no, propose a different composition or spine, not a redraw of the same one.
When the user hands over a fully specified card, the sign-off is given: say so and go.

## 5. Geometry, in the one order that works

Narration first, panel second, blocks third. The panel bottom is per card (`L-04`) and moves with
the prose (`L-08`).

1. Draft every narration string for real.
2. Estimate the panel from a sibling with a similar longest narration (`L-07`), as a start only.
3. Lay out against the L-shaped safe zone (`L-01`, `L-03`).
4. Take the category grammar: column presets (`L-08a`, `WL.L-06`), the vertical stack
   (`STO.L-01`), the frame family (`L-23`, `CLU.L-01`). Block sizes come from the same place, height
   included (`NET.L-01`: actor 232 by 80, Pod 232 by 104 with a 192 by 44 app box). A departure
   becomes a `DEVIATES` line.
5. Derive, do not type. Measured inputs stay literals with their comment (`L-07`).
6. Re-measure the panel on the rendered card at the smallest viewport, and move the band if needed.

Text clearances are measured (`L-20`, `L-21`), with the tools in `card-verify.md` section 3.

## 6. Write the module

`scheme/js/schemes/<category>/<card-id>.js`, in the declarative form only (`S-01`, `S-02`).

1. one import from `./<category>-kit.js`, plus `../../lib/svg.js` and `../../lib/primitives.js`
   only if a `raw` needs them (`S-21`)
2. the record pointer comment (`S-36`)
3. the geometry header: measured literals with comments, then everything derived
4. `SCENE`, whose `parts` order is the z-order (`S-07`)
5. step-local constants and small shared factories
6. `STEPS_SPEC`
7. `export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });`

Balls carry their own tag and arrival pulse:
`F.route({ points, tag: { text, dx, dy }, pulse: 'podKey' })`, the same for `F.segment` and
`F.top`. Both expand in `scheme/js/lib/step-spec.js` (`expandFlow`), so the tag shares the ball's
path and timing and the pulse fires on its arrival. Every ball and tag fades in 200ms (`M-30a`). A
separate `F.tag` is only for a tag emerging from a block.

What a first card gets wrong:

- an apostrophe in a narration: the write hook hard-fails the edit (`T-01`). Semicolons and dashes
  fail in the suite (`T-03`, `T-04`)
- `reset.keys` and `reset.pods` left implicit (`S-19`)
- a chip a step forgot to state (`P-01`)
- animated state not pinned above the reduced guard (`S-13`, `S-15`)
- a wire label written only by the animation (`T-30`)
- `duration` shorter than the motion (`M-19`): raise the duration
- an arrowhead nothing rides (`A-05`), a ball no step narrates (`M-10`)
- a ball leaving a dark block (`M-18a`): put the sender in `lit` with `BEAT.lead`, or light it
  through the previous hop's `lights`
- a missing import: the Timeline swallows the `ReferenceError` and the step stops (`S-33`)

The chip writer comes from the category (`P-09`, `P-10`). If the card seems to need a new flow
verb, stop and say so (`S-27`).

## 7. Wire it into the catalog

| File | What it gets | Rule |
|---|---|---|
| `js/schemes/<cat>/cards.js` | the `SCHEMES` entry | `D-01`, `D-04`, `D-05` |
| `js/schemes/<cat>/posters.js` | the thumbnail, drawn by `card-poster` | `D-06` |
| `js/schemes/<cat>/CARDS/<id>.md` | the record, plus a row in the folder's `CARDS.md` index | `S-45`, `S-43` |
| `scheme/card/<id>/index.html`, `sitemap.xml` | run `node tools/pages/build.mjs`, never hand-edit | `D-12` |

The poster is not drawn here: hand it to `card-poster` (`R-01`). The `desc` opens with the question
the card answers and carries the words a reader would search for (`D-15`).

## 8. Verify by looking

Loops, frames and measurement: `card-verify.md` sections 1 to 3. On a new card open the `-0` of
every step at every viewport, not only 1100x800.

Then the question this skill exists for:

```bash
cd "$(git rev-parse --show-toplevel)"
node .claude/skills/card-poster/tools/montage.mjs <card-id> --out=/tmp/card-new
node .claude/skills/card-new/tools/kin.mjs --id=<card-id>
```

Put a frame of the new card beside its two grid neighbours. **Cover the panel. Is it obvious which
card is which?** If not, the levers line says which axis is still shared, and the fix is a
composition change, not a relabel.

Then the full gate and the report, once. Inside a `card-cycle` run, skip it and end on the filtered
loop and its debt list.

```bash
cd "$(git rev-parse --show-toplevel)"/scheme/test && npm run all > /tmp/all.txt 2>&1; grep -E '^# (tests|pass|fail)|^not ok' /tmp/all.txt
grep -n '<card-id>' /tmp/all.txt
grep -nE 'queue to work|left to work|finding\(s\)' /tmp/all.txt
```

A new card entering a report queue with no ruling is an open defect.

## 9. Counts and baselines

A new card moves `CATALOG_BASELINE` and `PER_CATEGORY` and the README headline counts.
`card-verify.md` section 4 is the procedure. A redesign moves only the step baseline, and only if
the spine changed.

## 10. The record

`js/schemes/<category>/CARDS/<card-id>.md`, in the form of `card-verify.md` section 5:

- `WHAT`: the sentence from 3a
- `DEVIATES`: every rule the card breaks on purpose, including a block size off the category
  default, with the reason in one line
- `OPEN`: anything left unresolved, with the reason
- `CONTENT` is written by `card-facts`

## 11. Truth, delegated

Run `card-facts` on the finished card and fold its verdict table into the deliverable. Inside a
`card-cycle` run, name the technical questions in the handover instead. Without a network, do the
offline half: contradiction between sentence and picture, between steps, against the owning
sibling.

Then ship: `card-verify.md` section 6.

## 12. Deliverable

- the sentence, the section, the sibling it sits beside
- the composition family, and the lever no sibling carries
- the full gate result, and frames opened per viewport
- the montage path, and the covered-panel answer
- what `card-facts` returned and what `card-poster` drew
- the count check, with a verdict per item
- what stays open, with the reason
- the tree state (uncommitted unless the user asked)

## Tools

| Tool | What it answers |
|---|---|
| `tools/kin.mjs <cat>/<sec>` | the neighbours as signatures and levers, and the levers a section never used |
| `tools/kin.mjs --id=<card>` | one card's signature, and whether a sibling shares it |
