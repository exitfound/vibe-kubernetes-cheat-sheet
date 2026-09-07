---
name: section-review
description: Review one SECTION of the scheme catalog as a curriculum rather than as code, in either of two lanes. GAPS, the default, says what the section is MISSING: it fetches the kubernetes.io trees the section already cites, diffs their first-class topics against the cards that are here, filters out everything the user has already declined, and proposes what is left with a subject, a feature stage, an upstream URL and the two cards it would sit between. AUDIT, the rare one, says what is here that should NOT be: it places every card on two axes, gives each a fit verdict against the section's own admission sentence, argues the reading order, and prices every move it proposes. Reports both without editing a single file. Use when the user asks about a section or a category as a whole ("проанализируй секцию Control Plane", "review the storage section", "каких карточек не хватает", "what topics are missing in networking", "какие карточки лишние в этой категории", "is this section balanced"), with `<category>/<section>` or a bare `<category>` as the argument. For one card's geometry and motion use card-review, for the truth of its prose use card-facts, and for its grid thumbnail use card-poster.
---

# Section review

The other three skills work on ONE card. This one works one level up, on a section, and it asks a
different kind of question: not whether a card is right, but whether it BELONGS, whether its
neighbours add up to a subject, and what a reader hits when the section runs out.

| Question | Owner |
|---|---|
| Is this sentence true, does the picture agree with it | `card-facts` |
| Is this card drawn, timed and recorded correctly | `card-review` |
| Is this thumbnail the right one sentence | `card-poster` |
| What is this section missing, and where would it go | here, GAPS lane |
| Should this card be in this section at all | here, AUDIT lane |

---

## The two lanes

**They answer opposite questions and cost different amounts. Pick one, run it, and say at the top
of the report which one ran and what it therefore did not look at.**

| | GAPS, the default | AUDIT, on request |
|---|---|---|
| The question | what is MISSING, and where would it go | what is HERE that should not be |
| Runs | `tools/gaps.mjs`, plus `tools/section.mjs` for the depth profile | `tools/section.mjs`, the two axes per card, the six fit verdicts, `tools/overlap.mjs` |
| Costs | one tool run against a warm cache, plus reading every `desc` | reading every `desc` and rating every card twice |
| Skips | the two axes per card, the six fit verdicts, the reading order of what is already here | the upstream fetch, so it says nothing about what is missing |
| How often | whenever the user wants to know what to build next | per category, rarely, after a category has grown |

**Routing, from the request and nothing else.**

| The user says | Lane |
|---|---|
| "чего не хватает", "what is missing", "what should I add next", "каких карточек не хватает", "what topics are missing" | GAPS |
| "какие карточки лишние", "is this section balanced", "review the section", "проанализируй секцию", "does this card belong here" | AUDIT |
| a bare `<category>` with no verb | GAPS for every section, because that is the cheap read |
| both, explicitly | GAPS first, then AUDIT, in one report with two headings |

Open the report with the lane and its omission, in one line, in the user's language:

> GAPS lane. Reads what is missing against the upstream trees this section cites. It does not
> judge whether the cards already here belong, and it does not touch the reading order: ask for
> the AUDIT lane for that.

---

**This skill writes nothing.** Its output is an argument about a curriculum, and a curriculum
argument the user has not accepted is not a defect to be fixed. Do not edit `cards.js`, do not
reorder a manifest, do not open a card module to repair something you noticed on the way past. If
the user accepts a move, that move is a separate job with its own cost, and the costing block
prices it before anyone starts.

**The catalog has no opinion to inherit here.** `D-01` fixes the `SCHEMES` entry at eight keys and
none of them is a level, a depth or a prerequisite. `CANON.md` says outright that "the concept of a
card is not constrained". Nothing orders the cards inside a section, and nothing anywhere records a
coverage decision except the declined ledger this skill fills from below. So every verdict this
skill produces is a judgement, it is only as good as the evidence quoted beside it, and the one
thing that makes it worse is stating it as a rule.

**The level this whole skill is calibrated to:** middle to middle-plus at the centre of mass, one
or two junior on-ramps per section, pre-senior at the edges only, and never a section whose median
demands pre-senior. `reference/depth-scale.md` carries the rubric.

---

## 0. Inputs, both lanes

The argument is `<category>/<section>` for one section, or a bare `<category>` for every section of
it plus one cross-section pass at the end. With no argument, run
`node .claude/skills/section-review/tools/section.mjs --list` and ask which section is meant.

Read these before forming any opinion, in this order:

1. **The admission rule.** `scheme/js/schemes/<category>/CLAUDE.md`, the `## Subcategories` table.
   Its "what belongs here" cell and the boundary sentence under the table are the ONLY written
   statement of what this section is for. The GAPS lane measures a proposal against it. The AUDIT
   lane quotes it in every fit verdict.
2. **The catalog rules.** `cd scheme/test && node tools/canon.mjs --block=D`. Most of the rows are
   about metadata mechanics and do not touch this, but `D-02`, `D-10` and `D-11` decide what a
   proposed move actually costs.
3. **The manifest.** `scheme/js/schemes/<category>/cards.js` in file order, which IS the order the
   grid renders and the order a reader meets the cards in.
4. **The scope notes.** Every `SCOPE` block in that category's record, `CARDS.md` or the
   `CARDS/` folder beside it. Each one is a topic a card deliberately CEDES to a named sibling, and
   proposing a topic a `SCOPE` block already refused is the single most embarrassing finding this
   skill can produce. Read the LIST rather than a count of it, because the population grows with
   every card review:
   ```bash
   grep -rn '^SCOPE' scheme/js/schemes/*/CARDS.md scheme/js/schemes/*/CARDS/*.md
   ```
   `gaps.mjs` reads the same blocks and annotates a topic one of them already names, so this grep
   is the check on the tool rather than a substitute for it: it sees the wording, the tool sees
   only the words.
5. **The declined ledger.** `reference/upstream.md`, last section. `gaps.mjs` filters its rows out
   of its own output and prints what it dropped. Read what it dropped, because a topic refused once
   for a reason that has since changed is the one row worth reopening, and only a human can tell.

No server is needed. All three tools read source and the network, and run in about a second against
a warm cache. If a `desc` is genuinely ambiguous, `python3 -m http.server 8888 --bind 0.0.0.0` from
the repo root and open the card, but reading three cards to settle one rating is the normal cost and
opening a browser is not.

**Run flavour, which is a word in the REQUEST and not a tool flag.** No tool reads it: it is
something the user says ("глубже", "deeper", "broader") and it changes only the ranking. `deeper`
biases which gaps get promoted toward the mechanism end of the stack, `broader` toward the operator
end, and the default is balanced. **The ratings never move with the flavour**, only which of the
found gaps rank as `MUST`. A flavour that changed a card's depth would be a rating that measured
the request rather than the card.

---

# The GAPS lane

## G1. Say what the section is for, in one line

Before anything is proposed, write the sentence the section as a whole says. It is the premise
every later verdict is measured against, and a report that skips it is a list of opinions with no
shared standard behind them.

Write it from the `<CAT>.D-01` admission cell and the cards that are actually there, never from the
section's label. Labels are two words and decide nothing.

> control-plane teaches how a request becomes durable state and who reacts to it, and it stops at
> the Node boundary

**This is not a blocking gate.** Analysis is cheap, so the thesis opens the REPORT as a premise
rather than stopping the work. If the user rejects it, the whole analysis re-runs against theirs,
and that is a cheaper loop than asking first and waiting.

## G2. The section as it stands, and the shape of its profile

```
node .claude/skills/section-review/tools/section.mjs <category>/<section>
```

Read every `desc` in the section IN FULL. All of them, not a sample. A `desc` is 400 to 470
characters and there are at most eleven of them in the largest section, so the whole read is under
five thousand words and it is the only input that tells you what the author thought each card was
for.

Then take ONE thing from the tool that the gap engine cannot see: **the hole in the depth profile.**
A section whose cards jump L2 straight to L5 with nothing between is missing the step a reader
climbs on, and `reference/depth-scale.md` names that as the strongest gap signal the rubric
produces. Read it off the band histogram the tool prints, and name the diagnosis: `top-heavy`,
`flat`, `hole at L<n>`, or `healthy`.

This lane does NOT rate every card on both axes. That is the AUDIT lane. What it needs from the
rubric is the shape of the histogram and nothing else.

## G3. The gap engine

```
node .claude/skills/section-review/tools/gaps.mjs <category>/<section>
node .claude/skills/section-review/tools/gaps.mjs <category>/<section> --absent --top=30
```

It reads the tree map in `reference/upstream.md`, fetches those kubernetes.io index pages, takes
the pages each index lists as its own children, and marks every one of them `COVERED`, `PARTIAL` or
`ABSENT` against the cards here. It caches what it fetched, so a second run costs nothing and
`--refresh` is how you pay again.

**A citation is not coverage.** Fifteen of `volumes-claims`'s citations land in `/concepts/storage`,
which proves the section reads that tree and proves nothing about what it covers. Coverage means a
card has that page as its SUBJECT. The tool enforces this by construction, so a page a card merely
cites can reach `PARTIAL` and can never reach `COVERED`, and where it prints `first source of <id>`
beside a `PARTIAL` row it is naming its own likeliest promotion for you to rule on.

**Verify, never recall.** This is `card-facts`'s ground rule and it applies here unchanged. A
Kubernetes feature you remember is exactly the kind of claim this step exists to catch, and a
proposed card built on a feature that has left upstream costs a whole card to discover. Every
proposal carries the URL the tool fetched and the stage that page states. A topic the tool marks
`UNVERIFIED`, which is what it prints when it answered from cache with no network, is reported as
`UNVERIFIED` and ranked below everything that was read live.

**Read the whole listing, not the shortlist.** The `ABSENT WITH NO DISPOSITION` block is the tool's
own filter: it drops every absence a sibling card already owns by name and every absence a `SCOPE`
block of this section already cedes. Those dropped rows are still findings of a kind, because
"another section owns it" is a claim about the boundary and the boundary is worth checking once.

**Not every absence is a gap.** A page can be absent because another section owns it, because a
`SCOPE` block cedes it on purpose, or because it does not deserve a diagram. For every absence you
do not promote, say which of those it is, in one line. An absence list with no dispositions is a
list of homework.

**Where the tool is wrong, it is USUALLY wrong in one direction, and there is one exception.**
`COVERED` is decided from card names, so a large upstream page taught here by six cards under six
other names reads `PARTIAL`, and a topic taught here under a different word reads `ABSENT`. Both of
those over-report absence, which is the harmless direction: the row stays in the report with its
evidence beside it.

**It can also over-report coverage, and that direction is not harmless**, because a false `COVERED`
deletes the topic from the report instead of over-listing it. The match is a SUBSET test over the
card's name tokens, so a card whose name merely CONTAINS the topic's words reads `COVERED`:
`Deployments` reads `COVERED` off `Deployment Rolling Update`, which is named after a section of
that page and not after the page. The scenery-word case of this (`/concepts/workloads/controllers/`
reading `COVERED  named by workloads-daemonset`, on the single word `Controller`) is guarded in
`gaps.mjs` as of 2026-09-04. The general case is open, and the guard does not close it.

So read the evidence column on `COVERED` rows too, not only on the absences. A `COVERED` row whose
`named by` list is three cards, none of which has that page as its subject, is this failure and the
topic is really `PARTIAL`.

## G4. Rank what is left

Three independent sources, and a topic found by two of them outranks one found by one:

1. an `ABSENT` topic from `gaps.mjs` that survived its own disposition filter
2. a hole in the depth profile from G2, which names a BAND rather than a topic and is answered by
   whichever candidate sits in that band
3. a term three or more cards here lean on that no card title anywhere owns:
   `node .claude/skills/section-review/tools/overlap.mjs <category>/<section>`, section 2. It is the
   weakest of the three and it comes back EMPTY more often than not, so run it with `--min=2` before
   concluding the section assumes nothing, and never let a run of it decide the report on its own.

Rank them:

`MUST` a reader cannot follow the cards that ARE here without it
`SHOULD` the section is materially better with it
`NICE` a real topic that would not be missed

Every proposal carries six things, and one that cannot supply them is not ready to be proposed:

- the subject, in one sentence, in the shape a `desc` opens with (a question, then the answer)
- its depth band and its level
- the upstream page and the feature stage read off it
- **the two existing cards it would sit between**, by id. The tool prints a starting pair off its
  own lexical anchor and says how it got there. Move it where the anchor is thin and say why.
- what it takes from its neighbours, if anything, so the proposal is not silently a rewrite of two
  other cards
- whether it passes this section's admission sentence, or belongs to a sibling section instead

Rank by what the gap costs a READER, never by how easy the card would be to draw. That sentence is
in both sibling skills and it stays here.

## G5. Report, GAPS

In the user's language. The lane line, then the thesis, then two tables and the ledger rows.

**The depth profile.** The band histogram from `section.mjs`, with the healthy shape from
`reference/depth-scale.md` beside it and the named diagnosis.

**The gaps.** Ranked, most costly first:

```
| rank | topic | depth | level | upstream source + stage | sits between |
```

**The absences NOT promoted**, one line each, saying which disposition applies. This table is what
separates a review from a wish list.

Then close with the rows for the declined ledger, formatted for `reference/upstream.md`'s
five-column table, so anything the user turns down is filtered out of the next run automatically.
That is the only way the loop closes: the tool reads that table, this skill never writes it.

If a proposal implies moving an existing card, price it with the costing block from A5 before
saying it is cheap.

---

# The AUDIT lane

## A1. The thesis, then the map

G1 unchanged: the section's one sentence, written from the admission cell and the cards that are
there. Then

```
node .claude/skills/section-review/tools/section.mjs <category>/<section>
node .claude/skills/section-review/tools/section.mjs <category>/<section> --markers
```

and every `desc` read in full. The tool prints position, prose size, step count, narration size,
run time, the pages cited and the five-band signature. **It is evidence, not a verdict**, and its
own header lists what it cannot see. Its most useful column is the one nobody reads: `narr`, the
narration character count. A card running well under its section's median is usually a card that
was never finished.

## A2. Place every card on the two axes

`reference/depth-scale.md` is the rubric and it is calibrated against fifteen named shipped cards,
so use its anchors rather than your own sense of what feels deep.

- Depth L1 to L5, where in the stack the SUBJECT sits.
- Level junior to pre-senior, how much the reader must already know.

Rate the level second and independently. **A rating that always moves with the depth measured one
thing twice.** `network-netfilter-path` is L5 at middle, `cluster-server-side-apply` is L2 at
pre-senior, and a rubric that cannot separate those two is not being used.

Where your reading disagrees with the tool's signature, the reading wins and the row says so in one
line. That disagreement is usually the most interesting entry in the table: it is either a card
whose prose hides its depth or one whose prose promises a depth it does not deliver, and both are
findings in their own right.

## A3. Judge fit

One verdict per card, from this closed set and no other words:

| Verdict | Means |
|---|---|
| `CORE` | the section is incomplete without it |
| `SUPPORTING` | it earns its place and is not load bearing |
| `GATEWAY` | the deliberate way in, low depth and low level, and a section wants one or two |
| `MISPLACED -> <section>` | its subject fails this section's admission line and passes another's |
| `REDUNDANT WITH <id>` | two cards teaching one thing |
| `OUT OF BAND` | depth or level outside what this section can carry |

**The admission test is the folder's own sentence, quoted in the finding.** "It feels like a
networking card" is not a finding. "Its subject starts at an external client, and
`network/CLAUDE.md` says the line between `services-endpoints` and `external-traffic` is where the
client is" is one.

Then run the catalog-wide read, which finds what a section cannot see from inside itself:

```
node .claude/skills/section-review/tools/overlap.mjs <category>/<section>
```

Its section 1 is duplication candidates by shared upstream page, section 2 is terms this section
leans on that no card title anywhere owns, section 3 is misplacement candidates by signature. All
three are leads, and section 3 is the weakest by a wide margin: open every card it names before
believing any of it.

## A4. The order is an argument

`D-10` says the SUBCATEGORY list is "an editorial argument about what a reader has to know first".
Nothing says that about the cards inside a section, which is exactly why this step exists: the
order a reader meets eleven cards in is raw manifest position, decided once and checked by nothing.

Propose a sequence only where the current one actually misleads, and give one line of argument per
moved card. Two rules of thumb, both learned from what the shipped sections already do well:

**Order by what a reader must know first, never by depth.** A section that sorts itself L1 to L5
reads as a syllabus and teaches nothing about how the parts connect. `control-plane` puts
`cluster-etcd-raft` at position 10 and not at position 1, and that is right: raft is the floor
under the section and the wrong place to start.

**A gateway belongs near the front.** If the only L1 or L2 card in a section sits at position 8,
say so even when nothing else about the order is wrong.

## A5. Report, AUDIT

In the user's language. The lane line, the thesis, three tables and a costing paragraph.

**The section as it stands.** One row per card in manifest order:

```
| # | id | title | depth | level | verdict | one line |
```

**The depth profile.** The band histogram from `section.mjs`, with the healthy shape from
`reference/depth-scale.md` beside it and a named diagnosis where it differs: `top-heavy`, `flat`,
`hole at L<n>`, or `healthy`.

**The order**, only if it should change, with the argument column.

Then **the costing**, which is what keeps the report honest:

> **A move inside a category is one `subcategory:` string. A move ACROSS categories is not.**
> `D-02` derives the module path from the id, so a cross-category move is a new id (which
> breaks every deep link to the old one, since there is no alias map, `D-11`), a file move, a
> `posters.js` key move, a record section move
> (`S-44`), and a count update in three places: the folder's `cards.js` header, `scheme/CLAUDE.md`,
> and `PER_CATEGORY` in `test/unit/catalog.test.mjs`.

Say which kind every proposed move is. A report that prices a cross-category move as a field edit
has recommended a day of work while describing an afternoon.

**This lane says nothing about what is missing.** Say so in the closing line and name the GAPS lane
as the way to ask.

---

## Deliverable, both lanes

In the user's language:

- the lane that ran and what it therefore skipped, first line
- the thesis line, and an invitation to reject it, because everything else rests on it
- the tables that lane owns
- the costing, per proposed move, whichever lane proposed it
- **an explicit statement that nothing was edited and no count moved**
- if the user accepts a proposal, the next step by name: `scheme/CLAUDE.md`'s seven-step new-card
  checklist, whose step 1 is the canon and whose step 4 goes through `card-poster`'s `R-01`
  concept sign-off
- if the user turns a proposal down, the ledger row for it, ready to paste

Never commit unless the user asks.

---

## Appendix A: the two axes on one screen

Depth is where in the stack the subject sits. Level is how much the reader must already know. Full
rubric with the shipped anchors in `reference/depth-scale.md`.

| | L1 operator surface | L2 object contract | L3 control loop | L4 node mechanism | L5 kernel floor |
|---|---|---|---|---|---|
| what it opens | nothing, it maps | a field or a kind | a reaction | a call on a Node | the layer under it |
| anchor | `cluster-architecture` | `storage-access-modes` | `workloads-replicaset` | `storage-mount-path-chain` | `network-conntrack-nat` |

Levels: `junior` has applied a manifest, `middle` operates a cluster, `middle+` has debugged
something not in the error message, `pre-senior` designs the cluster. Target the centre of mass at
middle to middle-plus.

The GAPS lane uses this table for ONE thing, the shape of the histogram. Rating every card on both
axes is the AUDIT lane and it is the expensive half of this skill.

---

## Appendix B: how this analysis goes wrong

**Running the wrong lane.** The commonest failure of all now: answering "чего не хватает" with six
fit verdicts, or answering "какие карточки лишние" with a list of upstream pages. The request picks
the lane, and the first line of the report says which one it picked.

**Rating a card from its title.** Titles are two to five words and were never written to carry a
depth. `Where the Bytes Land` is L4 and reads like a poem. Rate from the `desc` and the middle
steps.

**Proposing what a `SCOPE` block already refused.** A `SCOPE` block names the sibling it cedes a
topic to on purpose, and every card review adds more of them, which is why phase 0 item 4 greps for
the list instead of trusting a number. `storage-pv-lifecycle-phases` deliberately does not draw the
backing disk because `storage-reclaim-policy` owns that. Proposing "a card about what happens to
the disk" there is not a gap, it is a failure to read phase 0 item 4. `gaps.mjs` annotates the
blocks it can match by words, and it cannot match one that cedes a topic in a sentence.

**Proposing what the ledger already refused.** The tool filters those rows out and prints what it
dropped. Re-promoting one of them without saying what changed since is the same failure one level
up, and it is the reason a report stops being read.

**Reading a small section as a gap.** The two smallest sections in the catalog are
`dns-service-discovery` and `stateful-data`, and neither is thin: each has a subject its folder
bounds in one sentence ("name resolution", "storage that outlives or follows a workload"). A
section is short because its subject is, until you can name a first-class upstream topic it drops.
Count is not coverage, in either direction, which is why no verdict in this skill takes a size as
evidence.

**Reading the tool's `ABSENT` as a gap.** It is a lead. It over-reports absence by construction,
because coverage is decided from card names. Every promotion is checked against the evidence
column, and every absence not promoted is dispositioned in one line.

**Trusting a `COVERED` row without reading its evidence, which is the expensive half of the same
habit.** `COVERED` is a SUBSET test: the topic's words have to appear in a card's name, and nothing
requires them to be the WHOLE of it. `Deployments` therefore reads `COVERED` off
`Deployment Rolling Update`. **OPEN, not fixed**, because closing it means reworking the matcher and
every section's output moves with it. The scenery-word half was closed on 2026-09-04, after
`workloads/controllers` reported the `/concepts/workloads/controllers/` index as
`COVERED  named by workloads-daemonset` on the single word `Controller`: a topic whose tokens are
all scenery can no longer decide `COVERED`. A false `COVERED` is worse than a false `ABSENT`, since
it removes the row from the report instead of adding one, so it is the one verdict worth spending a
second look on even though it is the quiet one.

**Mapping a parent tree when the section's citations live in a subtree.** `gaps.mjs` enumerates
only the pages an index lists as ITS OWN children. `workloads/controllers` was mapped to
`/concepts/workloads` while every one of its citations landed in `/concepts/workloads/controllers`,
so the eight topics the section is actually made of were never enumerated at all and two real
absences were found by a hand fetch instead. Map the tree the tally in `reference/upstream.md`
concentrates in, at whatever depth that is.

**Proposing a topic that left upstream, or never arrived.** Alpha, beta and deprecated are read off
the fetched page, never recalled. `not stated` on a page is not the same as stable and is never
reported as stable. This is the one failure in the list that costs a whole card before anyone
notices.

**Pricing a cross-category move as a field edit.** See A5. `D-02` makes the id carry the category,
so moving a card between categories renames it, and there is no alias map (`D-11`), so the rename
breaks every deep link that ever pointed at it.

**Letting the flavour move a rating.** `deeper` promotes deep gaps. It does not make an existing
card deeper. If two runs at two flavours disagree about a card's band, one of them was measuring
the flag.

**Filing an opinion as a finding.** Every fit verdict quotes the admission sentence it fails or
passes. Every gap names the two cards it sits between and the page it came from. A finding that
supplies neither is a preference, and this repository has paid before for a review that read the
rule instead of the thing.

---

## Appendix C: tools

| Tool | What it answers |
|---|---|
| `tools/gaps.mjs <cat>/<sec>` | what this section does NOT teach: the upstream trees it cites, the first-class topics under them, each marked COVERED, PARTIAL or ABSENT, with the stage, the URL and the two cards a new one would sit between. `--absent` to list only the absences, `--top=` how many get a detail block, `--min-cite=` to read only the heavier trees, `--stage=none/gaps/all`, `--refresh` and `--offline` for the cache, `--json` to diff two runs |
| `tools/section.mjs <cat>/<sec>` | the section as data in manifest order: prose size, step count, narration size, pages cited, five-band signature, section profile. `--list` for the 15 keys, `--markers` to see which words fired, `--json` to diff two runs |
| `tools/overlap.mjs <cat>/<sec>` | the three questions needing the whole catalog: pages shared with another section, terms this section leans on that no card title owns, cards elsewhere whose signature sits nearer here. `--min=` to loosen the second, `--margin=` the third |
| `tools/bands.mjs` | not a command. The five-band vocabulary, the string walk, the source-path reader and the scenery list all three tools share, so three readers cannot drift into three answers |
| `reference/upstream.md` | the tree map `gaps.mjs` fetches, and the declined ledger it filters on. Both are parsed, so both shapes are a contract |
| `reference/depth-scale.md` | the two axes, their anchors, and the shape of a healthy profile |
