---
name: card-facts-ru
description: Write, rewrite or re-verify the Russian text of one diagram card (its desc, its aria sentence, every narration step) so it says exactly what the English says, agrees with the Kubernetes documentation the card cites, and reads as the site owner writes. Reads the English and the sources card-facts checked it against, fetches the same pages, builds the anchors from the English, composes the Russian in the owner's voice, then proves parity, fit and meaning with the tools and an independent reader. Also owns the Russian of /cli/ and the dialog chrome, without the documentation step. Use when the user asks to translate, rewrite, restyle, humanize or check the Russian of a card or of the site ("переведи карточку", "проверь русский текст карточки", "перепиши русский", "очеловечь описания", "подровняй длину", "русский читается топорно"), and from card-facts or card-new whenever an English line changed, with the card id as the argument. For the truth of the English itself use card-facts.
---

# Card facts, Russian

The Russian is a rendering of the English, checked against the same documentation. Three questions
per string:

- **A. Does the Russian say what the English says**: every actor, verb strength, condition, count,
  scope word, negation, order, token and search term?
- **B. Does it agree with the docs**: the term the Kubernetes documentation uses for the thing, the
  mechanism as the cited page tells it, no hedge lost and none added?
- **C. Does it read as the owner writes and fit**: a connected chain with a landing, no colon as a
  joint, a capital at every sentence start (`STYLE.md` sections 1 and 2), the English length
  (section 3)?

| Question | Owner |
|---|---|
| the Russian of any string, its voice, length, parity with the English and with the docs | here |
| whether the English is true, the `CONTENT` block, `cards.js` | `card-facts` |
| the panel geometry a narration lands in | `card-review` |

**The English is the only source of facts on the page.** The docs check the Russian, they never
add to it. If the docs and the English disagree, stop and hand the card to `card-facts`: never fix
a fact in the Russian alone. A Russian line never carries a claim its English line does not.

## 0. Inputs

```bash
python3 -m http.server 8888 --bind 0.0.0.0      # from the repo root, if nothing is serving
cd "$(git rev-parse --show-toplevel)" && node .claude/skills/_shared/tools/ctx.mjs <card-id>
cd diagrams/test && node ../../.claude/skills/card-facts/tools/claims.mjs <card-id>
```

Read `STYLE.md` first, all of it, and `.claude/skills/humanizer-ru/SKILL.md`: its patterns table
is the list of what to remove, and its rule "the author's sample beats the rules" makes `STYLE.md`
section 1 the sample.

From `ctx.mjs` take the catalog entry (`desc`, `sources`, `k8sVersion`) and the `CONTENT` block of
the record: the sources the English was checked against and the wordings a fact forced or ruled
out. A ruled out English wording is ruled out in Russian too.

The strings of a card: the `desc` in `diagrams/js/lang/ru.js` (`S-57`), the aria sentence and every
narration in `diagrams/js/lang/steps/<card-id>.js` (`S-58`), each keyed by the exact English.
Export them to a JSON array of `{ id, en, ru }` in your scratch directory, keep an untouched copy as
`before.json`, and write back only after step 6.

## 1. Anchors from the English

Per string, list what the English carries: tokens (kinds, fields, flags, statuses, numbers), the
actor and verb of every clause, conditions, the order of events, and every scope word in
`STYLE.md` section 4. The anchors come from the ENGLISH, never from the old Russian: an old
Russian line can carry an old defect.

## 2. The docs

Fetch the pages in the card's `sources` and the ones its `CONTENT` block names. For each anchor
that names a mechanism, find the sentence that states it and keep the quote with its URL. Then:

- **Terms.** Where `kubernetes.io/ru/docs/` has the same page, read it for the Russian term of a
  concept (it is often older than the English, so it decides the word, never the fact). The
  `STYLE.md` glossary wins over it: a term the glossary fixes stays.
- **Strength.** A hedge in the doc («may», «typically», «by default») stays a hedge in the Russian,
  and a firm statement is not softened.
- **Disagreement.** English and doc disagree: stop, report it as a `card-facts` finding, keep the
  current Russian of that line.
- Offline: `UNVERIFIED (no network)`, and continue with the English as the only check.

## 3. Write

- A heavy line is rewritten as a whole paragraph, not phrase by phrase. A line that already says
  what the English says and reads well is kept.
- A `desc` is the situation, then the question (`STYLE.md` section 6).
- Narration is spoken and keeps the pace of the English. On-diagram labels stay verbatim, the
  reader sees them in English on the picture.
- Win length by word choice (`STYLE.md` section 3), never by dropping an anchor.
- Check every synonym against the ledger in `STYLE.md` section 4.

## 4. Mechanical parity

```bash
node .claude/skills/card-facts-ru/tools/parity.mjs --chunk=draft.json --before=before.json
node .claude/skills/card-facts-ru/tools/parity.mjs            # no flags: every live card desc
```

`ERROR` is a lost token or number, a banned character or a lowercase sentence start: fix all. A
`check` is a scope or negation word with no Russian marker, or a softer word than before (from
humanizer-ru `check_facts.py`): read each and decide. A clean run proves nothing about meaning.

## 5. Fit

```bash
cd diagrams/test && node ../../.claude/skills/card-facts-ru/tools/fit.mjs --chunk=draft.json --widths=1920 --lines=4 --tail=0.75
cd diagrams/test && node ../../.claude/skills/card-facts-ru/tools/fit.mjs --try=variants.json --widths=1920
```

Rendered text lines of each `desc`, English beside Russian. A `desc` is tuned at 1920 px only
(`STYLE.md` section 3): four lines, the last at least 75% full and at most about 95%, so a font
hiccup cannot wrap it. `LINES` is an English or Russian `desc` of any other line count and `tail` one
whose last line is too short: fix all. Other widths are not tuned. `--try` takes
`[{ id, ru: [variant, ...] }]` and measures each variant in place in about two seconds (`--lang=en`
for English): put the current text in as variant 0, then pick the variant that fits.
A narration is measured by its panel (`card-review`, `L-` rules): keep it within about 10% of the
English length.

## 6. The second reader

One independent agent per card, given `STYLE.md`, the English, the NEW Russian and the doc quotes
from step 2, never the old Russian (it would read the change, not the result). It goes sentence by
sentence through the English and reports `fact`, `doc`, `grammar`, `term` and clear `voice`
findings, each fix no longer than what it replaces. Apply the fact and doc findings, judge the
rest, and re-run steps 4 and 5 on anything changed. A reverted rewording becomes a line in the
`STYLE.md` ledger.

## 7. Write back and gate

Write the draft into its map (`diagrams/js/lang/ru.js`, `diagrams/js/lang/steps/<id>.js`), keyed by
the exact English. Then:

```bash
cd diagrams/test && npm run test:unit
```

`unit/diagrams-i18n.test.mjs`, `unit/steps-i18n.test.mjs` and `unit/cli-i18n.test.mjs` hold the
mechanical rules (`S-57`, `S-58`, `S-59`). Look at the result: the narration panel of each changed
step in Russian at 1440 and 390 px after fonts load, and for a changed `desc` the /diagrams/ grid in
Russian, rows even. Then `_shared/card-verify.md` section 6: the container rebuild, no commit.

## 8. /cli/ and the dialog chrome

The same steps without step 2: `cli/js/lang/ru.js` and `UI_RU` in `diagrams/js/dialog.js`. The
anchors are the English line, the voice is `STYLE.md` section 6, the gate is the same.

## 9. Deliverable

- strings changed, and the line counts before and after
- the doc pages read, and every term or hedge they decided
- parity: errors fixed, checks read and how each was decided
- the reader's findings and what was applied
- ledger lines added
- what stays open, and every English line handed back to `card-facts`
