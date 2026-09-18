---
name: card-poster
description: Design, redraw or adjust the poster of one scheme card, the still frame the grid shows: a 320x180 SVG fragment in posters.js, never the card's animated diagram. Opens the reference sheet first to calibrate against the posters the project reads as finished, reads the card for its one sentence, renders the current poster beside its siblings at true size and at 3x, picks a composition family AND a glyph vocabulary from the mined pattern library, gets the concept signed off in a five-slot line before drawing anything, writes the fragment, verifies it against the poster lint (the ink floor and the neighbour silhouette) and a fresh montage, and records the choice where the category still carries a poster note. Use when the user asks for a poster ("сделай постер", "перерисуй постер", "poster for this card"), equally when they say how one LOOKS is wrong ("постер не нравится", "вяло", "бледно", "тускло", "скучно", "без стиля", "the poster reads weak"), when they say a poster repeats its neighbours ("все постеры одинаковые", "как у соседней карточки"), or when a card review found the poster wrong. For everything else about a card use card-review, and for the truth of its text use card-facts. For all four skills run end to end over a SET of cards unattended, use card-cycle.
---

# Card poster

The poster is the still frame the grid paints for a card, about 200px wide, held in
`scheme/js/schemes/<category>/posters.js` as an SVG fragment keyed by card id. It is the single
biggest source of rework in this project, and the reason is always the same: someone drew before
deciding what the picture had to say.

**What this skill owns:** `posters.js`, and in `network/` and `storage/` the `### poster` subsection
of the card's record. Nothing else. `cluster/` and `workloads/` records carry no poster note: a
poster is drawn once and is not revised with the card, so nothing there is written back, and
`S-51` is held on those two by `unit/docs.test.mjs` G1, which fails the gate on a poster block
written into one. Geometry of
the card itself, motion, dead code and the other records are `card-review`; the truth of any text is
`card-facts`. If the poster work turns up a defect in the card, hand it over
rather than fixing it here.

**The rules are `R-01` to `R-12` in `scheme/CANON.md` and they win over anything below.** This file
is the procedure and `reference/patterns.md` is the vocabulary. Neither restates a rule. Print them
with `cd scheme/test && node tools/canon.mjs --block=R`, which also prints what a machine covers.
That answer changed on 2026-09-11: of the 14 rows only two, `R-01` and `R-10`, are review-only now,
and the rest carry a check. The two that are left are the two that matter most, because they are the
concept and the originality, so a poster is still the part of a card that a green lint says almost
nothing about.

---

## 0. Before anything

```bash
python3 -m http.server 8888 --bind 0.0.0.0        # from the repo root, if nothing is serving
node .claude/skills/card-poster/tools/montage.mjs --sheet=workloads --out=/tmp/card-poster   # THE BAR
node .claude/skills/card-poster/tools/montage.mjs <card-id> --out=/tmp/card-poster
node .claude/skills/card-poster/tools/poster-lint.mjs <card-id>
```

Every tool here runs from any directory. `montage.mjs` writes two images and you open BOTH: `-actual.png`
is the size a reader gets, `-montage.png` is where composition is judged. A poster that only works
in the montage is a poster nobody can read.

**Open the workloads sheet FIRST, every time, before looking at the card you are here for.** It is
the 32 posters the user reads as finished, and the point of opening it is calibration: a poster you
would have shipped looks thin the moment it is next to that sheet, and no amount of prose in this
file transmits what one look transmits. The reference set is `workloads` and `cluster`, and every
threshold in `poster-lint.mjs` is snapped to it (`--calibrate` prints how). What you are looking for
is not a style to copy, it is the weight: one thing at full brightness per poster, blocks that have
something inside them, and 32 silhouettes no two of which are the same.

---

## 1. Find the sentence

One command prints all three of the reads below, whichever shape the category's record is in:

```bash
node .claude/skills/_shared/tools/ctx.mjs <card-id>
```

1. The card's `title` and `desc` (section 1). The desc opens with the question the card answers, and
   the poster is usually a picture of that question.
2. The `WHAT` line of its record (section 2), then the narration of step 1 and of the last step
   (section 3, and the header lists every step with its duration). The poster is the still that
   makes a reader want to press play, so it belongs closer to the question than to the ending.
3. In `network/` and `storage/`, the `### poster` note inside that record: if one exists it says
   what was tried and what was rejected, so do not rediscover it. `cluster/` and `workloads/` carry
   none. Section 4 prints the poster fragment that is there now either way.

Then write ONE sentence, in words, in the user's language. Not "the architecture of a cluster", but
"everything talks to the API and the API alone talks to the store". If your sentence needs "and", it
is two posters and you have to choose.

---

## 2. Look at what is there and at what stands beside it

`montage.mjs <card-id>` renders the card with a neighbour on each side, because a poster is judged
next to its siblings (`R-05`), never alone. Read the actual-size image for these, which the source
cannot show you:

- does the drawing hold its weight next to the neighbours, or does it read lighter and emptier?
- does any element vanish? Anything under about 20 units is 13px on screen.
- is a quarter of the canvas dead air?
- do two neighbours already use the same composition? Then this one has to differ.

`poster-lint.mjs` covers the mechanical half in milliseconds: tokens that will not resolve,
arrowheads, packet dots, a flat drawing with no subject, a mostly empty canvas, a missing record
note, plus the two checks that carry most of the weight:

- **`R-03b`, the ink floor.** The brightest mark in the drawing, measured through every `<g>` above
  it, has to reach 0.55. This is the difference between the reference set and the rest, and it is
  not close: the reference lands a bright mark on 57 of its 60 posters, storage on 0 of 31, and 44
  of the 71 non-reference posters fail the line. A poster can have a correct sentence, a correct
  family and a correct composition and still read as absent, because nothing in it is bright.
- **`R-05`, the neighbour silhouette.** It signs each poster by how its big blocks are arranged and
  how many there are, and says so when a neighbour in the same section signs the same. 13 pairs on
  the grid do, which is the defect a reader meets as "these all look the same".

**Its thresholds are snapped to the REFERENCE SET, `workloads` + `cluster`, not to the catalog
average.** That changed on 2026-09-11 and it matters: calibrated against all 131 the lint concluded,
from 59 posters carrying no accent, that a missing accent is normal. It is not normal, it is two
categories that never got one. `--calibrate` prints the distributions and what each threshold
currently flags on each side, and it is how a threshold gets changed here: by measurement, never by
a round number.

---

## 3. Pick the family

`reference/patterns.md` holds the composition families in use, mined from the catalog: hub and
spokes, row of peers, overlapping sets, chain of stages, stack of layers, stream into a cache, two
zones compared, ghost zone to solid, branch, ring of states, nested containment, segmented budget
bar, flatline into a wait, gauge columns, fan, the break, the wall, rank ladder, held object. Each
entry says what that shape SAYS, how its rhythm is built, and how it fails.

**The library used to be a SNAPSHOT that nothing re-mined.** `tools/mine.mjs` now reads the catalog
back and says where the file has stopped being true:

```bash
node .claude/skills/card-poster/tools/mine.mjs [--verbose]
```

It reports rot (a row citing a card that is gone, or one whose comment now names a different
family), families nothing uses any more, and how many posters name no family at all. Run it before
picking, and again in step 8 if the redraw changed family. It reports and never writes: when a
redraw lands a composition the library does not name, say so in the deliverable rather than adding
it here, because this skill owns `posters.js` and the record, and the library is the user's to
extend.

**This is why the comment above the poster is load-bearing.** Step 5 has always asked it to name the
family, and `mine.mjs` is the first thing that checks. 53 of the 132 posters predate the convention
and name nothing, which is a debt that shrinks one redraw at a time rather than a thing to fix in a
sweep. Do not add a family name to a poster you are not redrawing: a mass pass over prose is how the
counts stay green and the meaning breaks.

**The family is only half of a poster.** `patterns.md` now carries a second section, **Glyph
vocabulary**, and it is the half that keeps getting skipped: what the elements are MADE OF, and what
sits INSIDE each block. Two posters in the same family look nothing alike when their blocks are
furnished differently, and two posters in different families look identical when both are four empty
outlines. That section is measured rather than argued: across the 60 reference posters only 5 carry
an arc and 2 carry a trace, so an unusual shape is never the cure for a dull poster. Ink and
furniture are. Read its table of claim to mark before choosing anything.

Choose in four steps: is the sentence about structure, sequence or quantity; which family says that
kind of sentence; what KIND of claim is it and what mark says that kind; what is the subject that
gets the one accent, at full brightness.

---

## 4. Sign-off. This gate is not optional

**`R-01`: describe the intended concept in ONE line and get approval BEFORE rendering anything.**

The line carries FIVE slots and nothing else. Three of them are new, and they are new because a
three-slot line was approvable while still describing a poster that would read as absent on the grid:

1. **the sentence**, in words, the one from step 1
2. **the family**, from `patterns.md`
3. **the glyph vocabulary**: what the marks are, and specifically what is INSIDE each block
4. **the accent**: the one mark at full brightness, and which element it belongs to
5. **what separates it from its two neighbours**, named. `poster-lint.mjs` prints their silhouettes
   as `R-05` and `montage.mjs` shows them

> two zones split at the middle, the left one ghosted with three dashed rows, the right one solid
> with two rows, one dashed leg between them, accent on the top right row, and the neighbours are
> both rings so a split canvas already differs

A line missing slot 3 or slot 4 is not a concept, it is a silhouette, and it gets sent back rather
than approved.

Wait for a yes. If the answer is no, propose a different family, not a redrawn version of the same
one. Posters are cheap to describe and expensive to draw, which is the whole reason this gate
exists.

**The exception, and it is narrow:** when the user asks for a small adjustment to an existing poster
("brighter accent", "move the accent to the middle block", "the left frame should be dashed"), do it
without a fresh concept line. Everything else, including "redraw it, I do not like it", goes through
the gate.

---

## 5. Draw

The contract, all of it in `R-04`, `R-06`, `R-07`:

- a FRAGMENT, never a nested `<svg>`: the grid owns the camera, and the coordinate space is
  `0 0 320 180`
- one wrapping `<g stroke="currentColor" fill="none" stroke-width="1.4">`, with heavier strokes (2)
  reserved for the element that carries the weight
- fills are literal `rgba(255,255,255,x)`, never `var(--token)`, which does not resolve in an SVG
  presentation attribute. Siblings sit at 0.03 to 0.10.
- blocks are 76 to 80 units on their long side, the size the rest of the catalog uses
- the accent is a `rect` with `fill="currentColor"` at `opacity="0.9"` INSIDE the block it belongs
  to, with the losers carrying the same bar at 0.3. Never a bright fill on a whole shape.
- no arrowheads (`R-08`), no packet dots (`R-09`), no literal miniature of the card diagram (`R-10`)
- dashes carry "not real yet", "leaving", "optional": `stroke-dasharray="4 3"` is the house value

Two more, and they are the ones this skill kept failing at rather than the ones above:

- **Something has to be BRIGHT.** One mark at 0.9 or at `fill="currentColor"`, and the lint fails the
  poster under 0.55 (`R-03b`). The accent bar of `R-07` is the usual way, a heavy stroke on the one
  centre is another, the single solid form in a field of outlines is a third. What is not allowed is
  a drawing whose brightest thing is 0.10, which is a drawing a reader's eye slides off.
- **Blocks get FURNITURE.** The reference median is 4 marks sitting inside a larger block, storage's
  is 1, and that is most of what separates "designed" from "one drawing repeated". A frame with
  nothing in it is a silhouette, and four silhouettes is a poster every category has already drawn.
  The furniture is also where the sentence usually lives: a roster of short bars, a segmented budget,
  a jagged trace, a pair of value slabs. Six of the 60 reference posters carry none and are right to,
  so this is a question to answer rather than a rule to satisfy.

Two real posters, because this is the one thing in the file that prose does not transmit. The frame
is nearly the same shape in both, and they do not read alike at all.

`workloads-pod-lifecycle-phases`, furnished. The outer frame is the phase, its top band is a readout
of three values with the winner held, and inside sits a dashed block carrying a jagged trace that
ends flat. Every mark states a piece of the sentence:

```html
<rect x="22" y="22" width="276" height="136" rx="12" fill="rgba(255,255,255,0.05)" stroke-width="2"/>
<rect x="44"  y="35" width="64" height="8" rx="1" fill="currentColor" opacity="0.3"/>
<rect x="128" y="35" width="64" height="8" rx="1" fill="currentColor" opacity="0.9"/>   <!-- the accent -->
<rect x="212" y="35" width="64" height="8" rx="1" fill="currentColor" opacity="0.3"/>
<rect x="82" y="70" width="156" height="70" rx="7" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3" opacity="0.7"/>
<path d="M 94 108 H 112 L 120 98 L 128 118 L 136 92 L 144 124 L 152 86 L 160 130 L 168 108 H 226" stroke-width="2"/>
```

`storage-hostpath`, unfurnished. Same outer frame, an inner frame, two empty boxes in it and a
cylinder below. Nothing is inside anything, nothing is bright, and the drawing says "a box near a
disk", which is a sentence forty other cards could also claim:

```html
<rect x="32" y="12" width="256" height="156" rx="10" fill="rgba(255,255,255,0.03)"/>
<rect x="64" y="28" width="192" height="54" rx="8" fill="rgba(255,255,255,0.05)"/>
<rect x="78"  y="40" width="56" height="30" rx="4" fill="rgba(255,255,255,0.07)"/>
<rect x="186" y="40" width="56" height="30" rx="4" fill="rgba(255,255,255,0.07)"/>
<ellipse cx="160" cy="124" rx="28" ry="6" fill="rgba(255,255,255,0.08)"/>
```

The second one is not missing a family, a sentence or a composition. It is missing the two things
above, and its brightest mark is 0.08.

Write it into `scheme/js/schemes/<category>/posters.js`, keyed by card id, with a short comment
above it naming the family and the accent. The comment is one or two lines: anything longer belongs
in the record.

---

## 6. Verify by looking, not by believing

```bash
node .claude/skills/card-poster/tools/poster-lint.mjs <card-id>
node .claude/skills/card-poster/tools/montage.mjs <card-id> --out=/tmp/card-poster
```

Open both images again. Then ask the three questions that catch what a lint cannot:

1. Cover the title with your hand. Does the picture still say the sentence?
2. Next to its two neighbours, is it obvious which one is about this card?
3. At actual size, is there exactly one thing your eye lands on first, and is it the subject?
4. Put it beside the workloads sheet from step 0. Does it hold, or does it read thin? This is the
   question the other three keep missing, because a poster judged only against its own two
   neighbours inherits whatever weight that section already settled for.

Iterate here, not in the source. Two or three passes is normal, and each pass is cheap because the
concept is already agreed.

For a whole category, `--sheet=<category>` renders every poster in it as one contact sheet, which is
how you catch a family used three times in a row.

---

## 7. Record the choice

Only in `network/` and `storage/`, and only where the record already carries a `### poster`
subsection under `## <card-id>` (`R-12`). Three or four lines, in the record's own voice:

- the sentence the poster says
- the family and why that one
- what was rejected, with the reason, so nobody rebuilds it to find out
- any deliberate deviation from the house idiom, named as deliberate

**In `cluster/` and `workloads/` this step is skipped and nothing is written to the record.** Those
records are one `### layout` block of labelled notes, and a poster note is not one of the things
they are for.

Do not touch any other part of the record: the rest of that section belongs to `card-review`, and
its `CONTENT` block belongs to `card-facts`.

---

## 8. Ship checks

```bash
node .claude/skills/card-poster/tools/poster-lint.mjs <card-id>               # clean, or every finding argued
node .claude/skills/card-poster/tools/mine.mjs                                # only if the family changed
cd "$(git rev-parse --show-toplevel)"/scheme/test && npm run test:unit        # D-06 bijection card <-> poster, and the record parses
```

Then the LAST step, the count sweep in `.claude/skills/_shared/card-verify.md` section 4, "sweep the
counts, do not judge them". Adding a poster moves the `D-06` bijection, which is a claim about the
tree stated in files this skill never opens. Run it and report its verdicts.

Then rebuild the local container, because a poster is served content:

```bash
docker rm -f kube-cheatsheet && docker build -t kube-cheatsheet . && docker run -d --name kube-cheatsheet -p 8080:80 kube-cheatsheet
```

Never commit unless the user asks.

---

## 9. Deliverable

- the sentence, the family it was drawn in, and what the marks inside the blocks are
- the two images, named, with the neighbours they were judged against
- what the lint says now, including the brightest mark it measured (`R-03b`) and whether either
  neighbour shares the silhouette (`R-05`)
- what the record note says
- anything handed over to `card-review` or `card-facts`

---

## Appendix: the failure modes that keep coming back

- Drawing before the sentence exists. Everything else in this list follows from it.
- A faithful miniature of the card diagram: unreadable at 200px and redundant with the card.
- A two-box layout reused because it was to hand.
- Plain circles for components that have nothing circular about them.
- Three accents, which is the same as none.
- An arrowhead saying a direction the composition could have said.
- A ghost side so faint it disappears at true size, verified only in the source.
- A poster with no bright mark anywhere. The most common defect in the catalog by a wide margin, and
  the one a correct sentence and a correct family do nothing to prevent.
- Blocks drawn as empty outlines, so the family carries the whole picture on its own.
- Reaching for an unusual shape to cure a dull poster. It produces a bag of mismatched details, which
  is worse than what it replaced. The cure is ink and furniture.
- A cylinder used as the house glyph for anything that stores bytes. Two of them in a row read as one
  shape, and that is most of how storage lost its variety: 22 of its 31 posters draw one. A cylinder
  is also not a ring, which `R-05` had to be taught explicitly before it could see storage's twins at
  all. Draw the CLAIM, not the noun.
- A poster that was correct for a card that has since been rebuilt.
