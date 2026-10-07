---
name: card-poster
description: Design, redraw or adjust the poster of one scheme card, the still frame the grid shows: a 320x180 SVG fragment in posters.js, never the card's animated diagram. Opens the reference sheet first to calibrate against the posters the project reads as finished, reads the card for its one sentence, renders the current poster beside its siblings at true size and at 3x, picks a composition family AND a glyph vocabulary from the mined pattern library, gets the concept signed off in a five-slot line before drawing anything, writes the fragment, verifies it against the poster lint (the ink floor and the neighbour silhouette) and a fresh montage, and records the choice in the comment above the poster in posters.js. Use when the user asks for a poster ("сделай постер", "перерисуй постер", "poster for this card"), equally when they say how one LOOKS is wrong ("постер не нравится", "вяло", "бледно", "тускло", "скучно", "без стиля", "the poster reads weak"), when they say a poster repeats its neighbours ("все постеры одинаковые", "как у соседней карточки"), or when a card review found the poster wrong. For everything else about a card use card-review, and for the truth of its text use card-facts. For all four skills run end to end over a SET of cards unattended, use card-cycle.
---

# Card poster

The poster is the still the grid paints for a card, about 200px wide, held in
`scheme/js/schemes/<category>/posters.js` as an SVG fragment keyed by card id. Rework always has
the same cause: drawing before deciding what the picture has to say.

**This skill owns** `posters.js`: the fragments and the comment above each one, which is the poster
note (`R-12`). Nothing in the record. Defects found in the card go to `card-review`, text to
`card-facts`.

The rules are `R-01` to `R-12` in `scheme/CANON.md`
(`cd scheme/test && node tools/canon.mjs --block=R`). `R-01` (the concept) and `R-10` (originality)
are review only, so a green lint says little about a poster. `reference/patterns.md` is the
vocabulary.

## 0. Before anything

```bash
python3 -m http.server 8888 --bind 0.0.0.0        # from the repo root, if nothing is serving
node .claude/skills/card-poster/tools/montage.mjs --sheet=workloads --out=/tmp/card-poster   # THE BAR
node .claude/skills/card-poster/tools/montage.mjs <card-id> --out=/tmp/card-poster
node .claude/skills/card-poster/tools/poster-lint.mjs <card-id>
```

Every tool runs from any directory. `montage.mjs` writes `-actual.png` (the size a reader gets) and
`-montage.png` (where composition is judged). Open both.

**Open the workloads sheet first, every time.** The reference set is `workloads` and `cluster`, and
every lint threshold is snapped to it (`--calibrate` prints how). Look for the weight: one thing at
full brightness per poster, blocks with something inside them, no two silhouettes alike.

## 1. Find the sentence

```bash
node .claude/skills/_shared/tools/ctx.mjs <card-id>
```

1. `title` and `desc` (section 1). The desc opens with the card's question, and the poster is
   usually a picture of it.
2. The record's `WHAT` line (section 2), the first and last narrations (section 3). The poster sits
   closer to the question than to the ending.
3. The comment above the poster (section 4 prints the fragment). A rejected composition named there
   is not rediscovered.

Write one sentence in the user's language: not "the architecture of a cluster" but "everything
talks to the API and the API alone talks to the store". A sentence with "and" is two posters.

## 2. Look at what stands beside it

A poster is judged next to its neighbours (`R-05`). On the actual-size image:

- does it hold its weight, or read lighter and emptier?
- does any element vanish (under about 20 units is 13px on screen)?
- is a quarter of the canvas dead air?
- do the neighbours already use this composition?

`poster-lint.mjs` covers the mechanical half: tokens that will not resolve, arrowheads, packet dots,
no subject, an empty canvas, a missing note (`R-12`), and the two checks that carry most weight:

- **`R-03b`, the ink floor**: the brightest mark, through every `<g>` above it, reaches 0.55.
- **`R-05`, the neighbour silhouette**: block arrangement and count, compared with section
  neighbours.

Thresholds move only by measurement with `--calibrate`, never to a round number.

## 3. Pick the family and the glyphs

`reference/patterns.md` holds the families and, in its second half, the glyph vocabulary: what the
marks are made of and what sits inside each block. The family is half a poster. The furniture is
the other half, and the cure for a dull poster is ink and furniture, never an unusual shape.

```bash
node .claude/skills/card-poster/tools/mine.mjs [--verbose]
```

`mine.mjs` reports where the library stopped being true: rows citing gone cards, families nothing
uses, posters naming no family. It never writes. A composition the library does not name goes in
the deliverable: the library is the user's to extend. Do not add a family name to a poster you are
not redrawing.

Choose: is the sentence about structure, sequence or quantity, which family says that, what mark
says that kind of claim, which subject gets the one accent.

## 4. Sign-off. Not optional

**`R-01`: one line, approved before anything is rendered.** Five slots:

1. **the sentence**, from step 1
2. **the family**, from `patterns.md`
3. **the glyph vocabulary**: the marks, and what is inside each block
4. **the accent**: the one mark at full brightness, and its element
5. **what separates it from its two neighbours**, named

> two zones split at the middle, the left one ghosted with three dashed rows, the right one solid
> with two rows, one dashed leg between them, accent on the top right row, and the neighbours are
> both rings so a split canvas already differs

A line missing slot 3 or 4 is a silhouette, and goes back. On a no, propose a different family.

The exception: a small adjustment to an existing poster ("brighter accent", "the left frame should
be dashed") needs no concept line. "Redraw it, I do not like it" goes through the gate.

## 5. Draw

The contract is `R-04`, `R-06`, `R-07`:

- a fragment, never a nested `<svg>`, in `0 0 320 180`
- one wrapping `<g stroke="currentColor" fill="none" stroke-width="1.4">`, stroke 2 for the element
  that carries the weight
- literal `rgba(255,255,255,x)` fills, never `var(--token)`. Siblings at 0.03 to 0.10
- blocks 76 to 80 units on their long side
- the accent is a `rect` with `fill="currentColor"` at `opacity="0.9"` inside its block, the losers
  carrying the same bar at 0.3. Never a bright fill on a whole shape
- no arrowheads (`R-08`), no packet dots (`R-09`), no miniature of the diagram (`R-10`)
- `stroke-dasharray="4 3"` for "not real yet", "leaving", "optional"

And the two that fail most:

- **Something is bright** (`R-03b`): an accent bar, a heavy stroke on the one centre, or the single
  solid form among outlines.
- **Blocks get furniture**: a roster of short bars, a segmented budget, a jagged trace, a pair of
  slabs. A frame with nothing in it is a silhouette. Some families (a ring, a hub, a bare fan) are
  right without it, so it is a question, not a rule.

Furnished, from `workloads-pod-lifecycle-phases`. The frame is the phase, its top band a readout of
three values with the winner held, and inside a dashed block a jagged trace ending flat:

```html
<rect x="22" y="22" width="276" height="136" rx="12" fill="rgba(255,255,255,0.05)" stroke-width="2"/>
<rect x="44"  y="35" width="64" height="8" rx="1" fill="currentColor" opacity="0.3"/>
<rect x="128" y="35" width="64" height="8" rx="1" fill="currentColor" opacity="0.9"/>   <!-- the accent -->
<rect x="212" y="35" width="64" height="8" rx="1" fill="currentColor" opacity="0.3"/>
<rect x="82" y="70" width="156" height="70" rx="7" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3" opacity="0.7"/>
<path d="M 94 108 H 112 L 120 98 L 128 118 L 136 92 L 144 124 L 152 86 L 160 130 L 168 108 H 226" stroke-width="2"/>
```

Write it into `posters.js`, keyed by card id, with the note above it (step 7).

## 6. Verify by looking

```bash
node .claude/skills/card-poster/tools/poster-lint.mjs <card-id>
node .claude/skills/card-poster/tools/montage.mjs <card-id> --out=/tmp/card-poster
```

Open both images, then:

1. Cover the title. Does the picture still say the sentence?
2. Beside its two neighbours, is it obvious which is about this card?
3. At actual size, is there exactly one thing the eye lands on first, and is it the subject?
4. Beside the workloads sheet, does it hold or read thin?

Iterate here, two or three passes. `--sheet=<category>` renders a whole category, which catches a
family used three times in a row.

## 7. The poster note

The comment directly above the entry in `posters.js` (`R-12`), three to five lines, never a
restatement of the SVG:

- the family and the sentence
- the accent
- what was rejected, with the reason
- any deliberate departure from the house idiom, named as deliberate

Nothing goes in the record.

## 8. Ship checks

```bash
node .claude/skills/card-poster/tools/poster-lint.mjs <card-id>               # clean, or every finding argued
node .claude/skills/card-poster/tools/mine.mjs                                # only if the family changed
cd "$(git rev-parse --show-toplevel)"/scheme/test && npm run test:unit        # D-06 bijection card <-> poster
```

Then `card-verify.md` section 6: the container rebuild, no commit.

## 9. Deliverable

- the sentence, the family, and what is inside the blocks
- the two images, named, with the neighbours they were judged against
- the lint now, with the brightest mark (`R-03b`) and any shared silhouette (`R-05`)
- what the poster note says
- anything handed to `card-review` or `card-facts`
