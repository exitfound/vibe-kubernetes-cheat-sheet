---
name: card-cycle
description: Orchestrate the four card skills over a SET of cards as one unattended run: card-new, then card-review, then card-facts, then card-poster, per card, with every finding fixed in the run that found it and the sign-off gates approved by the orchestrator instead of by the user. Owns only what no single skill can see: the stage order, who approves, what each stage hands the next, and what the earlier cards already took. Use when the user asks for the WHOLE cycle over one or more cards, or for an unattended pass with no questions ("полный цикл", "прогони по всем скилам", "все четыре скила", "переделай карточки целиком и без вопросов", "run the full cycle", "unattended pass"), with the card ids as the argument. One card and one concern is that skill directly: card-new for a composition, card-review for a detail or an audit, card-facts for the truth of the prose, card-poster for the thumbnail.
---

# Card cycle

The four card skills run end to end over a named set of cards, with the user asked nothing. **This
file owns the orchestration and nothing else.** Every procedure it would otherwise repeat lives in
`.claude/skills/_shared/card-verify.md`, and the stages own their own rules. A fifth copy of a rule
is how four procedures become five answers, so read that file, do not re-read it here.

**The contract:** the user gets back finished cards and one report, not a queue of questions.

---

## 1. Order

Per card: `card-new`, `card-review`, `card-facts`, `card-poster`. Cards one at a time.

**Within one section this is mandatory**, and the reason is not file contention. The point of a
redesign is to LEAVE a shared composition signature, and `kin.mjs` judges that against the siblings
in the same subcategory. An agent that cannot see what the previous card just took will take it too,
which re-creates the problem the run was called in to fix.

**Across sections the constraint is weaker and it is worth saying so.** Sibling sets are disjoint
there, so the census is honest either way. What still collides is global: the counts in
`scheme/CLAUDE.md`, the root `README.md`, `sitemap.xml`, `scheme/test/fixtures/`, and the shared
gate. If a user with cards in two categories wants them in parallel, that is a real conversation and
the answer is about those files, not about the census.

---

## 2. The two sign-off gates, and who passes them

`card-new` stops for a concept sign-off, `card-poster` for `R-01`. **Neither is skipped and neither
is self-approved by the agent that wrote the block.**

Tell the agent to stop, return the block, **write nothing, and end its turn** rather than wait.
Verify that with `git status` before you answer. Then read it yourself and reply with an approval or
a directed redirection. **Do not forward the block to the user:** they asked not to be consulted, and
a gate they never see is still a gate as long as the author is not the approver.

Bound the loop. If a second redirection does not settle it, take the disagreement to the user rather
than trading blocks, because with the user out of the loop nothing else can break a tie.

An approval is worth more when it carries guards. The ones that have caught things: a measurement
being RE-USED when the prose it measured is being replaced (`L-08`), a number spoken in narration and
drawn nowhere, an element whose size encodes a quantity that exists nowhere, and a claim of visual
identity that has not been checked at true size.

---

## 3. What only the orchestrator can put in a brief

The stages carry their own procedure. These five are invisible from inside one stage:

- **That findings are FIXED, not reported.** This REVERSES `card-review`, which says in bold "Never
  widen the diff on your own. Report first, fix on the user's go-ahead", and it suspends the standing
  preference behind it. It holds only because the user asked for an unattended run, so say that in
  the brief and let it lapse the moment they are back in the loop.
- **The BEFORE gate, by failing line number**, taken once centrally so no stage re-runs it or adopts
  it. Preconditions and the diff-against-BEFORE rule are `_shared/card-verify.md` section 0 and 1.
  **Triage the BEFORE list before ring-fencing it:** a line red for a real defect that the cycle then
  moves is a line the cycle can no longer see.
- **Which cards are OFF LIMITS**, by id: finished ones, and anything another session holds.
- **What the earlier cards took**, one line: levers, signature, bands, step count, family.
- **The named handovers from the previous stage.** This is where the cycle earns its keep. A review
  that spots a technical question and leaves it for `card-facts` gets a better answer than either
  stage reaches alone.

---

## 4. When a stage does not land

- **A stage comes back red outside the BEFORE list.** Stop that card, do not start its next stage,
  and do not start the next card. Restore it from the stage snapshot (`_shared/card-verify.md`
  section 0) and re-run the stage with the failure named in the brief. A cycle that walks past a red
  line carries it into every stage after it.
- **A stage cannot fix a finding.** That is a legitimate outcome and it belongs in the report with
  the reason, not in a retry. The rule that a finding gets fixed does not survive a fix that would
  make the artefact worse.
- **`card-facts` has no network.** Say so, run its offline half, and mark the affected claims
  unverified in the report. Do not let an unreachable source read as a verified one.
- **The run is interrupted.** The stage that was mid-flight is the one to distrust: its shared files
  may be half written and its sign-off may be approved but unbuilt. Restore that card from its last
  snapshot and re-run the whole stage rather than resuming inside it.

---

## 5. Cost, before you accept the set

A frame generation and a container rebuild end every stage, so the run is roughly four of each per
card. Hoist what you can: the rebuild is defensible once per CARD rather than once per stage. Say the
arithmetic to the user before starting on more than two cards, and skip a stage a card does not need
rather than running it for symmetry.

**The full gate is not four per card and it is not one per card: it is ONE PER RUN, at the end, over
the whole set.** The stage files no longer carry one each (`card-poster` and `card-facts` carry
none), and the reason the batch form is not a weaker check is arithmetic rather than tolerance:
`npm test` is a statement about the CATALOG, and the catalog is in the same state after the last
card as it would have been checked in after each. What each card owes individually is the filtered
loop, `npm run test:unit` plus `SCHEME_IDS=<id> npm run test:render`, 8 seconds, and that is run
after every edit rather than once a stage. The debt rule from `_shared/card-verify.md` section 1
is what keeps this honest: **no commit while the debt list is non-empty**, and the run report states
the list and the one gate that discharged it.

**The four hoists that pay for themselves, measured on 2026-08-31 at 121 cards.** None of them
removes a check, and each one is a real answer to where the minutes actually went:

| Hoist | What it costs now | Why it is safe |
|---|---|---|
| `_shared/tools/ctx.mjs <id>` once per card, instead of the read set arriving file by file | one run, one turn | the same bytes. It reads the catalog entry, the record in either shape, the source, the poster fragment, the category contract and the siblings the prose names |
| the report and the frames started in the BACKGROUND at the top of a card (`_shared/card-verify.md` section 0) | zero waiting | they are read before the card is closed, and the deliverable names the result of each |
| the full gate ONCE for the RUN, at the end, and `SCHEME_IDS=<id>` for the per-card loop | 2m10s for the run, 8s per loop | nine tests skip under `SCHEME_IDS` and all nine are catalog CENSUSES, which are batch statements by construction. The unfiltered gate is what closes the RUN |
| the count sweep on `npm run test:unit` and two per-card report files, never on `npm test` plus `npm run report` | 11s instead of 6 minutes, per sweep | every guarded count is computed in `unit/**` with no browser, and the two canon-cited measurements come from two report files that both take a per-card id (`_shared/card-verify.md` section 4) |
| the frames of one step opened in ONE message, all of them, full size | one turn per step set | a batching rule and nothing else. **A contact sheet is not a substitute**: it downsamples, and the clearances this run is judged on live under the downsample |

What must NOT be hoisted, because the cycle exists to catch what a green gate does not: the frames
of every card the run touched are still opened, one card's green run still proves nothing about the
next, and a stage's sign-off is still written down before the next stage starts.

---

## 6. The report

One report for the run, not four. Per card: the composition and the lever no sibling carries, the
defects fixed, what the facts stage corrected and against which source, what the poster became, the
gate as BEFORE against AFTER by number, and frames opened per viewport. Once for the run: what stays
open and why, which counts were left to the user, whether another session wrote to the tree, and the
tree state. Leave it uncommitted and offer the commit.

---

## Appendix: what the cycle has caught that a green gate did not

All from the 2026-08-30 run over `workloads-effective-pod-requests` and `workloads-pod-pending-init-states`. Every one
passed the gate, and most passed a whole stage before the next stage found them.

- `workloads-effective-pod-requests`: narration said "eight seconds" on a card that draws no time scale
  and carries no value chips. The sentence that had held the number was deleted in the redesign and
  the number stayed.
- `workloads-effective-pod-requests`: one step said init containers run strictly one at a time while the
  next explained that the sidecar shares that array and is counted with the app containers. The same
  contradiction sat inside the `aria-label`.
- `workloads-effective-pod-requests`: a marker merged completely into the lit top edge of the bar beneath
  it. Deleted rather than made visible, which is the honest fix when a rule can only be satisfied by
  making the picture worse.
- `workloads-pod-pending-init-states`: the NODE cell read `<none>` under a fully lit `Node-1` frame around the Pod.
  The picture contradicted its own table.
- `workloads-pod-pending-init-states`: RESTARTS read 3 where `kubectl` prints 0. Settled from the printer source
  and its test, not from any documentation page, because no page states it.
- `workloads-pod-pending-init-states`: AGE read `5m02s`, a string the upstream duration formatter never prints in
  that range.
- `workloads-pod-pending-init-states`: two actors shared a corridor in which one of them owned twenty units at
  relation weight, so the rule was satisfied in code and refuted on the canvas.
- A fetched documentation page came back summarised as "the sum of" where the document says "the
  higher of". Load-bearing claims get the raw document, read directly.
