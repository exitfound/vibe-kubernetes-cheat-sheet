---
name: card-poster
description: Design, redraw or adjust the poster of one scheme card, the still frame the grid shows. Reads the card to find its one sentence, renders the current poster next to its siblings at true size and at 3x, picks a composition family from the mined pattern library, gets the concept signed off in one line before drawing anything, writes the SVG fragment in posters.js, verifies it with the poster lint and a fresh montage, and records the choice in the card's CARDS.md poster note. Use when the user asks for a poster ("сделай постер", "перерисуй постер", "постер не нравится", "poster for this card", "change the poster"), or when a card review found the poster wrong. For everything else about a card use card-review, and for the truth of its text use card-facts.
---

# Card poster

The poster is the still frame the grid paints for a card, about 200px wide, held in
`scheme/js/schemes/<category>/posters.js` as an SVG fragment keyed by card id. It is the single
biggest source of rework in this project, and the reason is always the same: someone drew before
deciding what the picture had to say.

**What this skill owns:** `posters.js` and the `### poster` subsection of the card's record. Nothing
else. Geometry of the card itself, motion, dead code and the other records are `card-review`; the
truth of any text is `card-facts`. If the poster work turns up a defect in the card, hand it over
rather than fixing it here.

**The rules are `R-01` to `R-12` in `scheme/CANON.md` and they win over anything below.** This file
is the procedure and `reference/patterns.md` is the vocabulary. Neither restates a rule. Print them
with `cd scheme/test && node tools/canon.mjs --block=R`, which also prints how few of them a machine
covers: all but one are `review` rows, so a poster is the part of a card that nothing but a reader
judges.

---

## 0. Before anything

```bash
python3 -m http.server 8888 --bind 0.0.0.0        # from the repo root, if nothing is serving
node .claude/skills/card-poster/tools/montage.mjs <card-id> --out=/tmp/card-poster
node .claude/skills/card-poster/tools/poster-lint.mjs <card-id>
```

Both tools run from any directory. `montage.mjs` writes two images and you open BOTH: `-actual.png`
is the size a reader gets, `-montage.png` is where composition is judged. A poster that only works
in the montage is a poster nobody can read.

---

## 1. Find the sentence

Read, in this order:

1. `cards.js`: the card's `title` and `desc`. The desc opens with the question the card answers, and
   the poster is usually a picture of that question.
2. The card source: the `WHAT` line of its record, then the narration of step 1 and of the last
   step. The poster is the still that makes a reader want to press play, so it belongs closer to the
   question than to the ending.
3. The `### poster` note in that card's record (`CARDS.md`, or `CARDS/<card-id>.md` where the
   category has split it). If a note exists, it says what
   was tried and what was rejected. Do not rediscover it.

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
note. Its thresholds are calibrated against the posters that ship, so a finding is worth opening.

---

## 3. Pick the family

`reference/patterns.md` holds the composition families in use, mined from the catalog: hub and
spokes, row of peers, overlapping sets, chain of stages, stack of layers, stream into a cache, two
zones compared, ghost zone to solid, branch, ring of states, nested containment, segmented budget
bar, flatline into a wait, gauge columns, fan, the break, the wall, rank ladder, held object. Each
entry says what that shape SAYS, how its rhythm is built, and how it fails.

**That library is a SNAPSHOT and nothing re-mines it.** Redrawing a poster into a different family
falsifies the row that points at it, and the sweep in step 8 is the only thing that catches it: run
the wording grep over `--include=*.md`, not just the counts. When a redraw lands a composition the
library does not name, say so in the deliverable rather than adding it here: this skill owns
`posters.js` and the record, and the library is the user's to extend.

Choose in three steps: is the sentence about structure, sequence or quantity; which family says that
kind of sentence; what is the subject that gets the one accent.

---

## 4. Sign-off. This gate is not optional

**`R-01`: describe the intended concept in ONE line and get approval BEFORE rendering anything.**

The line names the family, the elements and the accent, and nothing else:

> two zones split at the middle, the left one ghosted with three dashed rows, the right one solid
> with two rows, one dashed leg between them, accent on the top right row

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

Iterate here, not in the source. Two or three passes is normal, and each pass is cheap because the
concept is already agreed.

For a whole category, `--sheet=<category>` renders every poster in it as one contact sheet, which is
how you catch a family used three times in a row.

---

## 7. Record the choice

In that card's record, under `## <card-id>`, the `### poster` subsection
(`R-12`, coverage is every card so a missing one is a regression). Three or four lines, in the
record's own voice:

- the sentence the poster says
- the family and why that one
- what was rejected, with the reason, so nobody rebuilds it to find out
- any deliberate deviation from the house idiom, named as deliberate

Do not touch any other part of the record: the rest of that section belongs to `card-review`, and
its `CONTENT` block belongs to `card-facts`.

---

## 8. Ship checks

```bash
cd scheme/test && npm run test:unit        # D-06 bijection card <-> poster, and the record parses
```

Then the LAST step, the markdown sweep in `card-review`'s phase 8, "sweep the numbers, do not judge
them". Adding or redrawing a poster moves a coverage count (`R-12` claims every card), which is a
claim about the tree stated in files this skill never opens. Run it and report its verdicts.

Then rebuild the local container, because a poster is served content:

```bash
docker rm -f kube-cheatsheet && docker build -t kube-cheatsheet . && docker run -d --name kube-cheatsheet -p 8080:80 kube-cheatsheet
```

Never commit unless the user asks.

---

## 9. Deliverable

- the sentence, and the family it was drawn in
- the two images, named, with the neighbours they were judged against
- what the lint says now
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
- A poster that was correct for a card that has since been rebuilt.
