---
name: card-facts
description: Fact-check one scheme card against the Kubernetes documentation and the API reference, then check that the animation says the same thing as the text and that every chip, label, sublabel, wire string and aria-label carries a valid value. Builds a claim inventory from the live card, ranks the claims by risk, verifies each against a citable source, reconciles the picture with the narration step by step, and finishes by updating the CONTENT block of the card record and the catalog entry. Use when the user asks to verify the technical content of a card ("проверь техническую часть", "check the facts", "is this card technically correct", "verify against the docs", "проверь текст карточки по докам"), with the card id as the argument. For layout, geometry, motion and dead code use card-review instead. For all four skills run end to end over a SET of cards unattended, use card-cycle.
---

# Card facts

Truth only. One card, every user-visible string, three questions:

- **A. Is the prose true** against the Kubernetes docs, the API reference and the card's version?
- **B. Does the animation say what the text says**, step by step: order, direction, actors?
- **C. Is every drawn value valid**: a real field path, a real call, a legal name, a plausible
  quantity, spelled the same way everywhere?

| Question | Owner |
|---|---|
| truth of a sentence, picture against sentence, validity of a chip or label, qualified absolutes (`T-19`), the `aria-label` | here |
| the `CONTENT` block of the record, plus `cards.js` `desc`, `k8sVersion`, `sources` | here |
| geometry, occlusion, timing, state, wires, dead code, dialog controls, the rest of the record | `card-review` |
| the poster and its note | `card-poster` |

A fix that needs a new drawn element, a moved lane or a re-placed label goes to `card-review`.

**Verify, never recall.** Every version-sensitive statement gets a fetched source or the verdict
`UNVERIFIED`. "I could not check this" is a result. Guessing is a defect.

## 0. Inputs

```bash
python3 -m http.server 8888 --bind 0.0.0.0      # from the repo root, if nothing is serving
cd "$(git rev-parse --show-toplevel)"/scheme/test
node ../../.claude/skills/card-facts/tools/claims.mjs <card-id>            # the inventory
node ../../.claude/skills/card-facts/tools/claims.mjs <card-id> --tokens   # just the token table
node tools/settled-dump.mjs <card-id>                                      # the settled state, as data
```

```bash
cd "$(git rev-parse --show-toplevel)" && node .claude/skills/_shared/tools/ctx.mjs <card-id>
```

`ctx.mjs` gives the source (section 3), the catalog entry (section 1) and the record (section 2),
whose `CONTENT` block holds the wordings a previous pass forced. Do not re-litigate one without a
source that overturns it. The prose rules are the `T-` block:
`cd scheme/test && node tools/canon.mjs --block=T`.

## 1. Build the claim inventory

`claims.mjs` prints per step the narration and every canvas string, the `aria-label`, and a token
table of what goes stale: field paths, kinds, calls, quantities, numbers, states, maturity words,
versions. Number the claims. A card is checked when every line has a verdict.

Keep the inventory from before any edit:

```bash
node ../../.claude/skills/card-facts/tools/claims.mjs <card-id> --json > /tmp/claims-before.json
# ... edits ...
node ../../.claude/skills/card-facts/tools/claims.mjs <card-id> --json > /tmp/claims-after.json
diff <(jq -S . /tmp/claims-before.json) <(jq -S . /tmp/claims-after.json)
```

The diff proves what a prose edit changed on the canvas (`T-31`).

Add by hand what the card does NOT say: a missing qualifier, a sentence true of the ordinary path
stated as the mechanism.

**The `desc`** is in the inventory under the marker `desc`, checked with a narration's weight:

- A dialog reader never sees it. A term the card draws but explains only in the `desc` is not
  explained.
- It is bounded (`D-04`, `D-05`). `claims.mjs` prints its live length and sentence count.
- A clause a fix needs never gives way to the band: something else in the sentence does (`T-20`).

## 2. Rank before you fetch

1. **Numbers and defaults**: timeouts, thresholds, grace periods, backoff, quorum, limits, ports.
2. **Version-sensitive statements**: feature gates, maturity, flipped defaults, API versions,
   deprecations, removals.
3. **Field paths and API shapes**: `spec.nodeName`, `status.conditions`, subresources, verbs.
4. **Absolutes** (`T-19`): `only`, `never`, `always`, `every`, `all`, `nothing`. Name the
   counter-case, then qualify or except it.
5. **Ownership**: which component does a thing.
6. **Everything else.**

## 3. Verify against sources

Order of authority:

1. The pages the card cites in `sources`. A cited page that no longer says it is a finding.
2. `https://kubernetes.io/docs/` concepts and tasks.
3. The API reference: `https://kubernetes.io/docs/reference/kubernetes-api/`.
4. `kubectl` reference, CRI, CSI and Gateway API specs, KEPs for gate status.
5. Upstream source only when the docs are silent, and say so.

- Quote the sentence you rely on, with its URL. A verdict with no quote is an opinion.
- Target the card's `k8sVersion`. True in an older release and false now is a finding.
- If the doc hedges, the card keeps the hedge.
- Load-bearing claims get the raw page read directly, never a summary of it.
- Offline: `UNVERIFIED (no network)`, and continue with the offline half.

## 4. Prose against the animation

Per step, sentence beside frame:

- **Existence.** Every named actor is drawn, or the narration says why not.
- **Direction.** Every ball travels the way the verb points.
- **Attribution.** What lights on arrival is what the sentence credits.
- **Order.** `then`, `after`, `first`, `next` match the beats and the step order.
- **State.** A claimed value matches the chip on screen. `settled-dump.mjs` compares all steps.
- **Silence.** Anything lit or moving the sentence never mentions is a defect or a `DEVIATES` line.
- **Counterfactual** (`T-35`): an alternative path carries a caption on the canvas.

The `aria-label` gets the same treatment.

## 5. Values: chips, labels, sublabels, wires

- **Object names** follow RFC 1123: lowercase alphanumerics and dashes.
- **Type plus name** (`T-11a`): `PVC data-claim`, `Pod web-0`. A quoted YAML field takes the bare
  name (`volumeName: x73a`).
- **Quantities** in API units: `100m`, `128Mi`, `1Gi`, `30s`.
- **Field paths** case-exact and real, checked against the API reference.
- **Calls** spelled as the interface spells them: `RunPodSandbox`, `NodePublishVolume`.
- **Addresses** inside documentation ranges, consistent across steps.
- **Consistency**: two spellings of one thing, or one disagreeing with the owning sibling, is a
  finding.

## 6. Siblings

Any mechanism another card owns: open it and reconcile, quoting both sentences. `ctx.mjs` section 6
lists the siblings by id and title, plus the `... card` phrases it could not resolve. Read those by
hand.

## 7. Report and fix

| # | claim (quoted) | where | verdict | source | fix |
|---|---|---|---|---|---|

Verdicts: `TRUE`, `FALSE`, `MISLEADING` (true words, false impression), `STALE`, `UNVERIFIED`. Rank
by what a reader would carry away wrong.

Fix rules:

- Take the doc's own qualifier.
- Never repair a fact by making the sentence vague.
- Add no claim the picture cannot support.
- No apostrophes in single-quoted drawn strings, no semicolons, no dashes (`T-01`, `T-03`, `T-04`),
  and the character budget the geometry imposes.

Apply only what the user approves. On an existing card read `_shared/card-edit.md` before the first
rewording. The write hook `check-js.sh` can hard-fail an edit with an apostrophe in a narration:
the message comes back as tool feedback.

After a prose edit the loop is `npm run test:unit` plus `SCHEME_IDS=<card-id> npm run test:render`,
and that is the whole check this skill owes: every catalog-wide prose rule lives in `unit/**`.
Re-read the changed sentences in the rendered panel (`T-31`).

## 8. Update the records

1. **The `CONTENT` block** of `scheme/js/schemes/<category>/CARDS/<card-id>.md`, at most 6 lines:
   first the sources (doc page names and versions), then only the wordings a fact forced or ruled
   out, one short clause each. No long quotations, no history. A rejected wording is a present-tense
   constraint: `"X" is ruled out: the page says Y`. The release in `k8sVersion` dates the claims,
   never a calendar date (`S-48`). Write a KEP as `KEP 2000`: an uppercase word, a dash and a
   number reads as a rule id, and `unit/docs.test.mjs` D1 fails on it.
2. **`cards.js`**: `desc` if it carried the defect, `k8sVersion` if the release changed, `sources`
   if a page no longer supports the card. After a `desc` edit run `npm run test:unit` (`D-04`,
   `D-05`) and read the whole `desc` again (`T-31`).

If nothing changed, the `CONTENT` block still names the sources it was checked against.

Leave `CANON.md`, the category `CLAUDE.md`, `scheme/CLAUDE.md` and `README.md` alone unless a
terminology rule changed, which is a separate decision.

Then `card-verify.md` sections 4 and 6: the count check, the container rebuild, no commit.

## 9. Deliverable

- claims checked, how many fetched, how many unverified and why
- the verdict table
- the wording that changed, before and after
- what the `CONTENT` block now says
- what stays open
