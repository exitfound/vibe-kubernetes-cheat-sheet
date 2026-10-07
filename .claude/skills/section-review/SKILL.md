---
name: section-review
description: Review one SECTION of the scheme catalog as a curriculum rather than as code, in either of two lanes. GAPS, the default, says what the section is MISSING: it fetches the kubernetes.io trees the section already cites, diffs their first-class topics against the cards that are here, filters out everything the user has already declined, and proposes what is left with a subject, a feature stage, an upstream URL and the two cards it would sit between. AUDIT, the rare one, says what is here that should NOT be: it places every card on two axes, gives each a fit verdict against the section's own admission sentence, argues the reading order, and prices every move it proposes. Reports both without editing a single file. Use when the user asks about a section or a category as a whole ("проанализируй секцию Control Plane", "review the storage section", "каких карточек не хватает", "what topics are missing in networking", "какие карточки лишние в этой категории", "is this section balanced"), with `<category>/<section>` or a bare `<category>` as the argument. For one card's geometry and motion use card-review, for the truth of its prose use card-facts, and for its grid thumbnail use card-poster.
---

# Section review

The card skills work on one card. This one works on a section, and asks whether a card belongs,
whether the neighbours add up to a subject, and what a reader hits when the section runs out.

| Question | Owner |
|---|---|
| Is this sentence true, does the picture agree with it | `card-facts` |
| Is this card drawn, timed and recorded correctly | `card-review` |
| Is this thumbnail the right one sentence | `card-poster` |
| What is this section missing, and where would it go | here, GAPS lane |
| Should this card be in this section at all | here, AUDIT lane |

## The two lanes

Pick one, run it, and say at the top of the report which ran and what it did not look at.

| | GAPS, the default | AUDIT, on request |
|---|---|---|
| The question | what is MISSING, and where would it go | what is HERE that should not be |
| Runs | `tools/gaps.mjs`, plus `tools/section.mjs` for the depth profile | `tools/section.mjs`, the two axes per card, the fit verdicts, `tools/overlap.mjs` |
| Skips | the two axes per card, the fit verdicts, the reading order | the upstream fetch, so nothing about what is missing |

| The user says | Lane |
|---|---|
| "чего не хватает", "what is missing", "what should I add next", "каких карточек не хватает", "what topics are missing" | GAPS |
| "какие карточки лишние", "is this section balanced", "review the section", "проанализируй секцию", "does this card belong here" | AUDIT |
| a bare `<category>` with no verb | GAPS for every section |
| both, explicitly | GAPS first, then AUDIT, one report with two headings |

Open the report with the lane and its omission, in the user's language:

> GAPS lane. Reads what is missing against the upstream trees this section cites. It does not
> judge whether the cards already here belong, and it does not touch the reading order: ask for
> the AUDIT lane for that.

**This skill writes nothing.** No `cards.js` edit, no manifest reorder, no card repair. An accepted
move is a separate job, priced by the costing block before anyone starts.

**Nothing in the catalog encodes level or order.** `D-01` fixes the `SCHEMES` entry and none of its
keys is a level, a depth or a prerequisite. Every verdict here is a judgement, only as good as the
evidence quoted beside it.

**The target level:** middle to middle-plus at the centre of mass, one or two junior on-ramps per
section, pre-senior at the edges only. `reference/depth-scale.md` is the rubric.

## 0. Inputs, both lanes

The argument is `<category>/<section>`, or a bare `<category>` for every section plus one
cross-section pass. With no argument, run
`node .claude/skills/section-review/tools/section.mjs --list` and ask.

Read, in order:

1. **The admission rule**: the section table in `scheme/js/schemes/<category>/CLAUDE.md`. Its "what
   belongs here" cell is the only written statement of what the section is for.
2. **The catalog rules**: `node tools/canon.mjs --block=D` from `scheme/test`.
   `D-02`, `D-10` and `D-11` decide what a move costs.
3. **The manifest**: `scheme/js/schemes/<category>/cards.js` in file order, the order the grid
   renders.
4. **What each card leaves to a sibling.** It lives in the card's `desc` and narration. Read every
   `desc` in full. `gaps.mjs` still annotates topics ceded by a `SCOPE` record block, a label the
   record form no longer carries, so its `ceded` disposition stays empty: the reading is yours.
5. **The declined ledger**: the last section of `reference/upstream.md`. `gaps.mjs` filters its rows
   and prints what it dropped. A topic refused for a reason that has since changed is worth
   reopening, and only a human can tell.

No server is needed. Run the tools from the repo root. Only `gaps.mjs` reads the network, and it
caches.

**Run flavour** is a word in the request ("глубже", "deeper", "broader"), not a flag. It changes
only which found gaps rank `MUST`: `deeper` toward mechanism, `broader` toward operator. Ratings
never move with it.

# The GAPS lane

## G1. The section in one line

Write the sentence the section says, from the admission cell and the cards that are there, never
from the label:

> control-plane teaches how a request becomes durable state and who reacts to it, and it stops at
> the Node boundary

It opens the report as a premise. If the user rejects it, re-run against theirs.

## G2. The depth profile

```
node .claude/skills/section-review/tools/section.mjs <category>/<section>
```

Read every `desc` in full. Then take the hole in the depth profile off the band histogram, the
strongest gap signal the rubric produces, and name it: `top-heavy`, `flat`, `hole at L<n>`, or
`healthy`. This lane does not rate every card.

## G3. The gap engine

```
node .claude/skills/section-review/tools/gaps.mjs <category>/<section>
node .claude/skills/section-review/tools/gaps.mjs <category>/<section> --absent --top=30
```

It reads the tree map in `reference/upstream.md`, fetches those kubernetes.io index pages, takes
each index's own children, and marks each `COVERED`, `PARTIAL` or `ABSENT`. It caches, and
`--refresh` fetches again.

- **A citation is not coverage.** A page a card merely cites reaches `PARTIAL`, never `COVERED`.
  `first source of <id>` beside a `PARTIAL` row names the likeliest promotion.
- **Verify, never recall.** Every proposal carries the URL fetched and the stage the page states.
  `UNVERIFIED` (answered from cache with no network) ranks below everything read live.
- **Read the whole listing.** `ABSENT WITH NO DISPOSITION` drops absences a sibling card owns by
  name. Those drops are claims about the boundary, worth checking once.
- **Not every absence is a gap.** Another section owns it, a card cedes it on purpose, or it does
  not deserve a diagram. Say which, in one line, for every absence not promoted.
- **The tool over-reports absence** (harmless) **and sometimes coverage** (not harmless): read
  the `named by` evidence on `COVERED` rows too (Appendix B).

## G4. Rank what is left

Sources, and a topic found by two outranks one found by one:

1. an `ABSENT` topic that survived the disposition filter
2. a hole in the depth profile, answered by whichever candidate sits in that band
3. a term several cards lean on that no card title owns:
   `node .claude/skills/section-review/tools/overlap.mjs <category>/<section>`, section 2. Weakest,
   often empty. Try `--min=2` before concluding, and never let it decide alone.

`MUST` a reader cannot follow the cards that are here without it
`SHOULD` the section is materially better with it
`NICE` a real topic that would not be missed

Every proposal carries:

- the subject, shaped like a `desc` opening (a question, then the answer)
- its depth band and level
- the upstream page and the stage read off it
- the two existing cards it sits between, by id. The tool prints a starting pair. Move it where the
  anchor is thin and say why
- what it takes from its neighbours
- whether it passes this section's admission sentence or belongs to a sibling section

Rank by what the gap costs a reader, never by how easy the card is to draw.

## G5. Report, GAPS

The lane line, the thesis, then:

- **The depth profile**: the histogram beside the healthy shape, and the diagnosis.
- **The gaps**, most costly first:
  ```
  | rank | topic | depth | level | upstream source + stage | sits between |
  ```
- **The absences not promoted**, one line each with the disposition.
- **Ledger rows** for anything the user turns down, in `reference/upstream.md`'s five-column shape.
  The user pastes them. This skill never writes the ledger.

A proposal that implies moving a card is priced with the A5 costing block.

# The AUDIT lane

## A1. The thesis, then the map

G1 unchanged, then:

```
node .claude/skills/section-review/tools/section.mjs <category>/<section>
node .claude/skills/section-review/tools/section.mjs <category>/<section> --markers
```

Read every `desc` in full. The tool prints position, prose size, step count, narration size, run
time, pages cited and the five-band signature. It is evidence, not a verdict. A card far under the
section's median `narr` is usually unfinished.

## A2. Place every card on two axes

Use the anchors in `reference/depth-scale.md`:

- Depth L1 to L5: where in the stack the subject sits.
- Level junior to pre-senior: how much the reader must already know.

Rate level second and independently. `network-netfilter-path` is L5 at middle,
`cluster-server-side-apply` is L2 at pre-senior. Where your reading disagrees with the tool's
signature, the reading wins and the row says so: either the prose hides the card's depth or promises
a depth it does not deliver.

## A3. Judge fit

One verdict per card, from this closed set:

| Verdict | Means |
|---|---|
| `CORE` | the section is incomplete without it |
| `SUPPORTING` | it earns its place and is not load bearing |
| `GATEWAY` | the deliberate way in, low depth and low level. A section wants one or two |
| `MISPLACED -> <section>` | it fails this admission line and passes another's |
| `REDUNDANT WITH <id>` | two cards teaching one thing |
| `OUT OF BAND` | depth or level outside what this section can carry |

Every verdict quotes the folder's admission sentence it passes or fails.

```
node .claude/skills/section-review/tools/overlap.mjs <category>/<section>
```

Section 1: duplication candidates by shared upstream page. Section 2: terms leaned on that no
title owns. Section 3: misplacement candidates by signature, the weakest: open every card it names.

## A4. The order is an argument

`D-10` makes the section list an editorial argument. Nothing orders the cards inside a section, so
propose a sequence only where the current one misleads, one line of argument per moved card.

- **Order by what a reader must know first, never by depth.** `cluster-etcd-raft` near the end of
  `control-plane` is right: it is the floor under the section, not the place to start.
- **A gateway belongs near the front.**

## A5. Report, AUDIT

The lane line, the thesis, then:

- **The section as it stands**, in manifest order:
  ```
  | # | id | title | depth | level | verdict | one line |
  ```
- **The depth profile** and its diagnosis.
- **The order**, only if it should change, with the argument column.
- **The costing**:

> **A move inside a category is one `subcategory:` string. A move across categories is not.**
> `D-02` derives the module path from the id, so a cross-category move is a new id (breaking every
> deep link, since there is no alias map, `D-11`), a file move, a `posters.js` key move, a record
> move (`S-44`), the `PER_CATEGORY` baseline in `test/unit/catalog.test.mjs`, and the README
> per-category tables. `npm run test:unit` names what it finds stale.

Say which kind every proposed move is. Close by saying this lane says nothing about what is
missing, and name the GAPS lane.

## Deliverable, both lanes

In the user's language:

- the lane that ran and what it skipped, first line
- the thesis, with an invitation to reject it
- the lane's tables
- the costing per proposed move
- **an explicit statement that nothing was edited**
- for an accepted proposal, the next step: `card-new` with the subject as its argument, then
  `card-poster`, whose `R-01` sign-off comes before any drawing
- for a declined proposal, its ledger row, ready to paste

Never commit unless the user asks.

## Appendix B: how this analysis goes wrong

- **The wrong lane.** "Чего не хватает" answered with fit verdicts, or "какие карточки лишние" with
  upstream pages.
- **Rating from the title.** `fsGroup and Volume Ownership` is L4 and says so nowhere. Rate from the
  `desc` and the middle steps.
- **Proposing what a card already cedes.** `storage-pv-lifecycle-phases` does not draw the backing
  disk because `storage-reclaim-policy` owns it. Read the `desc` before proposing.
- **Proposing what the ledger refused** without saying what changed.
- **Reading a small section as a gap.** A section is short because its subject is, until you can
  name a first-class upstream topic it drops. Size is not evidence.
- **Trusting `COVERED` without its evidence.** The match is a subset test over a card's name, so
  `Deployments` reads `COVERED` off `Deployment Rolling Update`. A topic whose tokens are all
  scenery cannot decide `COVERED`, and the general case stays open in `gaps.mjs`. A false `COVERED`
  removes the row instead of adding one, so it deserves the second look.
- **Mapping a parent tree when the citations live in a subtree.** `gaps.mjs` enumerates only an
  index's own children. Map the tree the tally in `reference/upstream.md` concentrates in.
- **A topic that left upstream or never arrived.** Read the stage off the fetched page. `not stated`
  is never reported as stable.
- **An opinion filed as a finding.** Every fit verdict quotes its admission sentence, every gap
  names its two neighbours and its page.

## Tools

| Tool | What it answers |
|---|---|
| `tools/gaps.mjs <cat>/<sec>` | what the section does not teach: the upstream trees it cites, their first-class topics, each COVERED, PARTIAL or ABSENT, with stage, URL and the two cards a new one sits between. `--absent`, `--top=`, `--min-cite=`, `--stage=none/gaps/all`, `--refresh`, `--offline`, `--json` |
| `tools/section.mjs <cat>/<sec>` | the section as data in manifest order: prose size, step count, narration size, pages cited, five-band signature, profile. `--list` for the section keys, `--markers`, `--json` |
| `tools/overlap.mjs <cat>/<sec>` | pages shared with another section, terms no card title owns, cards elsewhere whose signature sits nearer here. `--min=`, `--margin=` |
| `tools/bands.mjs` | not a command: the shared band vocabulary, string walk, source-path reader and scenery list |
| `reference/upstream.md` | the tree map `gaps.mjs` fetches and the declined ledger it filters on. Both are parsed |
| `reference/depth-scale.md` | the two axes, their anchors, the shape of a healthy profile |
