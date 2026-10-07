---
name: card-cycle
description: Orchestrate the four card skills over a SET of cards as one unattended run: card-new, then card-review, then card-facts, then card-poster, per card, with every finding fixed in the run that found it and the sign-off gates approved by the orchestrator instead of by the user. Owns only what no single skill can see: the stage order, who approves, what each stage hands the next, and what the earlier cards already took. Use when the user asks for the WHOLE cycle over one or more cards, or for an unattended pass with no questions ("полный цикл", "прогони по всем скилам", "все четыре скила", "переделай карточки целиком и без вопросов", "run the full cycle", "unattended pass"), with the card ids as the argument. One card and one concern is that skill directly: card-new for a composition, card-review for a detail or an audit, card-facts for the truth of the prose, card-poster for the thumbnail.
---

# Card cycle

The four card skills end to end over a named set of cards, with the user asked nothing. This file
owns the orchestration only. Shared procedure is `.claude/skills/_shared/card-verify.md`, and each
stage owns its own rules.

**The contract:** the user gets back finished cards and one report, not a queue of questions.

## 1. Order

Per card: `card-new`, `card-review`, `card-facts`, `card-poster`. Cards one at a time.

**Within one section this is mandatory.** A redesign exists to leave a shared composition
signature, and `kin.mjs` judges that against the siblings. An agent that cannot see what the
previous card just took will take it too.

Across sections the sibling sets are disjoint, so the census is honest either way. What still
collides: the README counts, `sitemap.xml`, `scheme/test/fixtures/`, the catalog baselines and the
shared gate. Parallel work across categories is a conversation about those files.

## 2. The two sign-off gates

`card-new` stops for a concept sign-off, `card-poster` for `R-01`. Neither is skipped, and neither
is approved by the agent that wrote the block.

Tell the agent to return the block, write nothing, and end its turn. Check with `git status`. Read
the block yourself and reply with an approval or a directed redirection. Do not forward it to the
user: the gate holds as long as the author is not the approver.

If a second redirection does not settle it, take the disagreement to the user.

Guards worth attaching to an approval: a measurement re-used while the prose it measured is
replaced (`L-08`), a number spoken in narration and drawn nowhere, a size that encodes a quantity
that exists nowhere, a claim of visual identity not checked at true size.

## 3. What only the orchestrator can put in a brief

- **Findings are FIXED, not reported.** This reverses `card-review`'s "report first" rule, and holds
  only because the user asked for an unattended run. Say so, and let it lapse when they are back.
- **The BEFORE gate, by failing line**, taken once centrally. Triage it before ring-fencing: a line
  red for a real defect the cycle then moves is a line the cycle can no longer see.
- **Which cards are off limits**, by id.
- **What the earlier cards took**, one line: levers, signature, bands, step count, family.
- **The named handovers from the previous stage**, for example a technical question the review
  leaves to `card-facts`.
- **No full gate inside a stage.** The stage ends on the filtered loop and its debt list.
- **`card-new` and `card-review` do not run `card-facts`.** They name their technical questions as
  a handover instead.

## 4. When a stage does not land

- **Red outside the BEFORE list.** Stop that card, start nothing after it, restore from the stage
  snapshot (`card-verify.md` section 0), re-run the stage with the failure named.
- **A finding cannot be fixed** without making the artefact worse. Report it with the reason, and
  it becomes an `OPEN` line.
- **`card-facts` has no network.** Run its offline half and mark the claims unverified.
- **The run is interrupted.** Distrust the stage that was mid-flight. Restore that card from its
  last snapshot and re-run the whole stage.

## 5. Cost

Each stage ends with frames and a container rebuild. Hoist the rebuild to once per card. Say the
arithmetic before starting on more than two cards, and skip a stage a card does not need.

**The full gate is one per run, at the end, over the whole set** (`npm run all`). Each card owes
the filtered loop after every edit. No commit while the debt list is non-empty, and the report
states the list and the gate that discharged it.

Hoists that remove no check:

- `_shared/tools/ctx.mjs <id>` once per card instead of the read set file by file.
- The report and the frames started in the background at the top of a card, read before the card
  closes. Nothing that reads the walk snapshot starts until the report has exited.
- The count check on `npm run test:unit` and the two per-card report files.
- The frames of a step opened in one message, all at full size. A contact sheet is no substitute.

Never hoisted: the frames of every touched card are opened, one card's green run proves nothing
about the next, and each sign-off is written down before the next stage starts.

## 6. The report

One report for the run. Per card: the composition and the lever no sibling carries, defects fixed,
what the facts stage corrected and against which source, what the poster became, the gate BEFORE
against AFTER, frames opened per viewport. Once for the run: what stays open and why, counts left
to the user, whether another session wrote to the tree, the tree state. Leave it uncommitted and
offer the commit.

## Appendix: what a stage after the first tends to catch

- A number spoken in narration on a card that draws no scale, left over from a deleted sentence.
- Two steps that contradict each other, with the same contradiction inside the `aria-label`.
- A marker merged into the lit edge beneath it. Deleting it is the honest fix when the rule can only
  be satisfied by making the picture worse.
- A table cell contradicting a lit frame around it.
- A value `kubectl` never prints in that position, settled from the printer source.
- Two actors sharing a corridor: the rule satisfied in code, refuted on the canvas.
- A fetched page summarised as "the sum of" where it says "the higher of".
