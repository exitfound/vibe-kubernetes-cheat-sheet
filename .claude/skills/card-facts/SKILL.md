---
name: card-facts
description: Fact-check one scheme card against the Kubernetes documentation and the API reference, then check that the animation says the same thing as the text and that every chip, label, sublabel, wire string and aria-label carries a valid value. Builds a claim inventory from the live card, ranks the claims by risk, verifies each against a citable source, reconciles the picture with the narration step by step, and finishes by updating the CONTENT block of the card record and the catalog entry. Use when the user asks to verify the technical content of a card ("проверь техническую часть", "check the facts", "is this card technically correct", "verify against the docs", "проверь текст карточки по докам"), with the card id as the argument. For layout, geometry, motion and dead code use card-review instead.
---

# Card facts

Truth only. One card, every user-visible string, three questions:

- **A. Is the prose true** against the Kubernetes documentation, the API reference and the version
  the card claims to describe?
- **B. Does the animation say the same thing as the text**, step by step, in the same order, with
  the same direction and the same actors?
- **C. Is every drawn value valid**: a real field path, a real call, a legal name, a plausible
  quantity, spelled the same way here as everywhere else?

What each skill owns, so nothing is checked twice:

| Question | Owner |
|---|---|
| is a sentence TRUE, does the picture agree with it, is a chip or label valid, is an absolute qualified (`T-19`), does the `aria-label` promise what is drawn | here |
| geometry, panel occlusion, timing and reading load, state and reset, wire placement, dead code, the dialog controls | `card-review` |
| the grid poster: its concept, its composition, its record note | `card-poster` |
| the `CONTENT` block of the card record, plus `cards.js` desc, `k8sVersion` and `sources` | here |
| every other markdown that describes the card | `card-review` |

If a fix found here needs a new drawn element, a lane moved or a label re-placed, say so and hand it
to `card-review` rather than reshaping the card inside a fact check.

**Ground rule: verify, never recall.** A model's memory of a Kubernetes default is exactly the kind
of claim this skill exists to catch. Every version-sensitive statement gets a fetched source or the
verdict `UNVERIFIED`. Saying "I could not check this" is a result. Guessing is a defect.

---

## 0. Inputs

`claims.mjs` resolves its imports relative to itself and runs from any directory, including the repo
root. `node --test` and `npm run` need `scheme/test/`.

```bash
python3 -m http.server 8888 --bind 0.0.0.0      # from the repo root, if nothing is serving
cd scheme/test
node ../../.claude/skills/card-facts/tools/claims.mjs <card-id>            # the inventory
node ../../.claude/skills/card-facts/tools/claims.mjs <card-id> --tokens   # just the token table
node tools/settled-dump.mjs <card-id>                                      # the settled state, as data
```

Read alongside it:

- the card source (`scheme/js/schemes/<category>/<card-id>.js`), for what each step declares
- the catalog entry in `cards.js`: `title`, `desc`, `k8sVersion`, `sources`
- the `CONTENT` block of the `## <card-id>` section in that folder's `CARDS.md`: it already holds
  the claims a previous pass checked and the wording those checks forced. Do not re-litigate a
  settled wording without a source that overturns it.
- `scheme/CANON.md`, the `T-` group: the terminology and prose rules the fixes must land inside.
  `cd scheme/test && node tools/canon.mjs --block=T` prints it, and `--check=review` narrows it to
  the rows the prose test cannot see.

---

## 1. Build the claim inventory

`claims.mjs` prints, per step, the narration and every string on the canvas (labels, sublabels,
chips, wire text, chains, captions), plus the `aria-label`, plus a token table of the things that go
stale: field paths, API kinds, calls, quantities, bare numbers, states, maturity words, versions.

A claim is any sentence or fragment that could be false. Number them. The inventory is the work
list, and a card is only checked when every line of it has a verdict.

Keep the `--json` inventory from BEFORE any edit:

```bash
node ../../.claude/skills/card-facts/tools/claims.mjs <card-id> --json > /tmp/claims-before.json
# ... edits ...
node ../../.claude/skills/card-facts/tools/claims.mjs <card-id> --json > /tmp/claims-after.json
diff <(jq -S . /tmp/claims-before.json) <(jq -S . /tmp/claims-after.json)
```

The diff is the proof of what a prose edit actually changed on the canvas, which is exactly what a
bulk edit over prose hides (`T-31`): a sentence you did not mean to touch shows up in that diff.

One thing the inventory cannot show you, so add it by hand:

- **What the card does NOT say.** A missing qualifier is the most common defect in this repository:
  a sentence true of the ordinary path, stated as the mechanism.

**The `desc` is in the inventory and in the token table, under the marker `desc` rather than a step
number**, and it is fact-checked with the same weight as a narration. Three things make it different
from every other string on the card, and all three are yours:

- **It is the only card prose a dialog reader never sees.** It shows under the poster on the grid and
  in search, and nowhere else. So a term the card DRAWS but explains only in the `desc` is not
  explained at all: check every chip name, block label and value against the narrations, not against
  the `desc`.
- **It is hard-bounded**: 400 to 470 characters (`D-04`) and 2 to 4 sentences (`D-05`), both red in
  `unit/catalog.test.mjs`. `claims.mjs` prints the two live numbers beside it so a qualifier is
  costed before you write it. Many cards sit within a few characters of the ceiling.
- **Which means the band is where `T-20` gets broken.** If a fix needs a clause and the clause does
  not fit, something else in the sentence gives way: never the clause. Cutting a condition to fit a
  band leaves a true sentence standing as a false absolute, which is the defect the fix was for.

---

## 2. Rank before you fetch

You cannot fetch a source for all of it, so spend the budget where claims break. In order:

1. **Numbers and defaults**: timeouts, thresholds, grace periods, backoff, quorum sizes, limits,
   ports. These change between releases and are the easiest to state from memory and get wrong.
2. **Version-sensitive statements**: anything about a feature gate, a maturity level, a default that
   flipped, an API version, a deprecation or a removal.
3. **Field paths and API shapes**: `spec.nodeName`, `status.conditions`, subresources, verbs.
4. **Absolutes** (`T-19`): `only`, `never`, `always`, `every`, `all`, `nothing`. Each one needs its
   counter-case named out loud, then either a qualifier or an exception in the same breath.
5. **Ownership claims**: which component does a thing. "The Kubelet does X" when the controller
   manager does it is the defect a reader cannot recover from.
6. **Everything else**: descriptive prose that has no moving parts.

---

## 3. Verify against sources

Order of authority:

1. The pages the card itself cites in `cards.js` `sources`. Open them first: if the card cites a
   page that no longer says what the card says, that is a finding on its own.
2. `https://kubernetes.io/docs/` concepts and tasks for behaviour.
3. The API reference for field names, types, defaults and subresources:
   `https://kubernetes.io/docs/reference/kubernetes-api/`.
4. `kubectl` reference for command shape and output, CRI, CSI and Gateway API specs for their own
   surfaces, KEPs for gate status and graduation targets.
5. Upstream source (`kubernetes/kubernetes`) only when the docs are silent, and say so in the
   finding, because source behaviour can be an implementation detail rather than a contract.

Rules:

- Quote the sentence you are relying on, with its URL, in the finding. A verdict with no quote is an
  opinion.
- Target the version the card claims. `k8sVersion` in `cards.js` is the card's own answer, and the
  site as a whole targets a current release. A claim true in an older release and false now is a
  finding even if nothing else changed.
- If the doc hedges, the card may not un-hedge it. Take the doc's own qualifier.
- Offline or blocked: mark the claim `UNVERIFIED (no network)` and continue. The internal
  consistency pass below needs no network and finds more than half of everything anyway.

---

## 4. Prose against the animation

For each step, put the sentence and the frame side by side and ask:

- **Existence.** Every actor the sentence names is on the canvas, or the sentence says why it is
  not drawn (this catalog accepts a narrated actor with no block, and the record says so).
- **Direction.** Every ball travels the way the verb points. A sentence that says the Kubelet CALLS
  the runtime must not be drawn as an arrow from the runtime.
- **Attribution.** The thing that lights when a ball lands is the thing the sentence credits.
- **Order.** `then`, `after`, `first`, `next` in the prose match the order of the beats, and match
  the step order of the card.
- **State.** A claim about a value ("commitIndex is still 8", "the Pod has no nodeName yet") matches
  the chip on screen at that moment. `tools/settled-dump.mjs` prints the settled text and the
  highlight set as data, which is the cheapest way to compare all steps at once.
- **Silence.** Anything lit, pulsing or moving that the sentence never mentions is either a defect
  or a deliberate choice that belongs in the record.
- **The counterfactual** (`T-35`): if a step plays an alternative path, the canvas has to say so
  with a caption. A reader looking at the frame without the panel must not see a state that never
  happened.

The `aria-label` gets the same treatment: it is the card for a reader who cannot see it, and it
often promises a part or a relationship the steps do not draw.

---

## 5. Values: chips, labels, sublabels, wires

Every drawn value is a claim with a narrow definition of correct:

- **Object names** follow RFC 1123: lowercase alphanumeric and dashes. `PV-x73a` states a name the
  API would reject.
- **Type plus name grammar** (`T-11a`): `PVC data-claim`, `Pod web-0`, `PV x73a`. Never glued with a
  hyphen. A YAML field quoted in a tag takes the bare name (`volumeName: x73a`).
- **Quantities** use the units the API uses: `100m`, `128Mi`, `1Gi`, seconds as `30s`. Mixed units
  inside one card, or `100M` where the API means `Mi`, are findings.
- **Field paths** are case-exact and real: `spec.nodeName`, `status.podIP`,
  `spec.template.spec.containers`. Check them against the API reference, not against a memory of
  the YAML.
- **Calls** are spelled as the interface spells them: `RunPodSandbox`, `NodePublishVolume`,
  `AppendEntries`.
- **Addresses** stay inside documentation ranges and are consistent across the card: a Pod IP in one
  step and a different subnet for the same Pod in the next is a defect the token table surfaces.
- **Consistency**: the token table lists the steps each token appears on. Two spellings of one thing
  inside a card, or a spelling that disagrees with the sibling card owning that mechanism, is a
  finding even when both spellings are individually legal.

---

## 6. Siblings

Any mechanism this card touches that another card owns: open that card and reconcile them. Quote
both sentences in the finding. In this project, cross-reading cards that one reviewer had already
closed turned up 31 real defects across 87 cards, and most were a card disagreeing with a sibling,
with its own other steps, or with its own labels.

---

## 7. Report

One table, one row per claim:

| # | claim (quoted) | where | verdict | source | fix |
|---|---|---|---|---|---|

Verdicts: `TRUE`, `FALSE`, `MISLEADING` (true words, false impression), `STALE` (was true),
`UNVERIFIED`. Rank the findings by what a reader would carry away wrong, not by how easy the fix is.

Then propose wording. Fix rules:

- Take the doc's own qualifier rather than inventing one.
- Never repair a fact by making the sentence vague. A card that says less than it knows is a
  different defect.
- Do not add a claim the picture cannot support. If the fix needs a new drawn element, say so and
  leave it to `card-review`.
- Respect the prose mechanics: no apostrophes in the single-quoted drawn strings, no semicolons in
  narration, no em-dashes, and the character budget the card's geometry imposes.

Apply only what the user approves, and once approved, three project rituals come with a prose edit:

- **The write hook can hard-fail the edit.** `.claude/hooks/check-js.sh` re-parses a
  `scheme/js/**/*.js` file as an ES module after every Edit or Write and exits 2 when it stops
  parsing, which is almost always an apostrophe that landed in a single-quoted narration. It comes
  back as tool feedback, not as a test failure, so it is easy to scroll past.
- **A narration is served content**, so rebuild the local container after the edits:
  `docker rm -f kube-cheatsheet && docker build -t kube-cheatsheet . && docker run -d --name kube-cheatsheet -p 8080:80 kube-cheatsheet`
- **Never commit unless the user asks.** Finish, report, and leave the tree uncommitted.

After any prose edit, the fast loop is
`SCHEME_IDS=<card-id> npm run test:render` (about 6s, this card only, floors off) plus
`npm run test:unit`, and the full `npm test` once at the end. Re-read
the changed sentences in the rendered panel, because a bulk edit over prose leaves the linters green
and the meaning broken (`T-31`).

---

## 8. Update the records

The fact check owns two places, and it is not finished until both are true:

1. **The `CONTENT` block** of the `## <card-id>` section in
   `scheme/js/schemes/<category>/CARDS.md`. Its vocabulary definition is exactly this: a technical
   claim checked against the reference, and the wording it forced. For each claim you changed or
   deliberately kept, one entry: the wording that ships, the wording that was rejected, and the
   reason. That is what stops the next pass from "simplifying" a qualifier back out.
2. **`cards.js`**: `desc` if the description carried the same defect, `k8sVersion` if the card now
   describes a different release, and `sources` if a cited page no longer supports the card or a
   better one exists. After ANY `desc` edit re-run `cd scheme/test && npm run test:unit`: `D-04` and
   `D-05` are red, the band is narrow, and a qualifier that pushes past 470 is a real edit to make
   elsewhere in the sentence and never a reason to drop the qualifier (`T-20`). Then READ the new
   `desc` whole (`T-31`): it is 2 to 4 sentences, so a reworded opening breaks the grammar of the
   rest more often than in a narration.

If a check changed nothing, still record the claims you verified and the date, in one line. A claim
verified once and not written down is a claim that gets re-verified every time.

Leave `CANON.md`, the category `CLAUDE.md`, `scheme/CLAUDE.md` and `README.md` alone unless a
terminology RULE changed, in which case it is a rulebook edit and belongs to a separate decision.

Then:

```bash
cd scheme/test && npm run test:unit      # docs.test.mjs: the record still parses and its anchors hold
```

---

## 9. Deliverable

- what was checked: number of claims, how many fetched, how many unverified and why
- the verdict table
- the wording that changed, before and after
- what the record now says
- what stays open

---

## Appendix: claims that have actually been wrong here

- A component credited with work another component does.
- A number stated as the mechanism when it is a default that a field overrides.
- An optional component drawn as core, or a core one labelled optional.
- A sentence true of the ordinary path, written as an absolute, after a qualifier was trimmed to fit
  a character budget: 29 of those in one session.
- A repeated word or a broken sentence opening left by a bulk edit over prose.
- A chip value that contradicts the narration of the same step.
- A label naming a call the card does not draw.
- A page cited in `sources` that no longer contains the statement it was cited for.
