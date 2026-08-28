---
name: section-review
description: Review one SECTION of the scheme catalog as a curriculum rather than as code, and say what belongs in it, what does not, and what is missing. Reads the section's admission rule and every card in it, places each card on two axes (depth in the stack, level of the reader it needs), judges whether each one earns its place there, reconciles the set against the kubernetes.io tree it maps to, proposes the cards that are missing with a subject and two neighbours each, argues the reading order, and reports it all without editing a single file. Use when the user asks about a section or a category as a whole ("проанализируй секцию Control Plane", "review the storage section", "каких карточек не хватает", "what topics are missing in networking", "какие карточки лишние в этой категории", "is this section balanced"), with `<category>/<section>` or a bare `<category>` as the argument. For one card's geometry and motion use card-review, for the truth of its prose use card-facts, and for its grid thumbnail use card-poster.
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
| Should this card be in this section at all | here |
| What is this section missing, and in what order should it read | here |

**This skill writes nothing.** Its output is an argument about a curriculum, and a curriculum
argument the user has not accepted is not a defect to be fixed. Do not edit `cards.js`, do not
reorder a manifest, do not open a card module to repair something you noticed on the way past. If
the user accepts a move, that move is a separate job with its own cost, and phase 8 prices it
before anyone starts.

**The catalog has no opinion to inherit here.** `D-01` fixes the `SCHEMES` entry at eight keys and
none of them is a level, a depth or a prerequisite. `CANON.md` says outright that "the concept of a
card is not constrained". Nothing orders the cards inside a section, and nothing anywhere records a
coverage decision. So every verdict this skill produces is a judgement, it is only as good as the
evidence quoted beside it, and the one thing that makes it worse is stating it as a rule.

**The level this whole skill is calibrated to:** middle to middle-plus at the centre of mass, one
or two junior on-ramps per section, pre-senior at the edges only, and never a section whose median
demands pre-senior. `reference/depth-scale.md` carries the rubric.

---

## 0. Inputs

The argument is `<category>/<section>` for one section, or a bare `<category>` for every section of
it plus one cross-section pass at the end. With no argument, run
`node .claude/skills/section-review/tools/section.mjs --list` and ask which of the 15.

Read these before forming any opinion, in this order:

1. **The admission rule.** `scheme/js/schemes/<category>/CLAUDE.md`, the `## Subcategories` table.
   Its "what belongs here" cell and the boundary sentence under the table are the ONLY written
   statement of what this section is for, and every fit verdict in phase 4 quotes one of them.
2. **The catalog rules.** `cd scheme/test && node tools/canon.mjs --block=D`. Thirteen of the
   fifteen rows are about metadata mechanics and do not touch this, but `D-02`, `D-10` and `D-11`
   decide what a proposed move actually costs.
3. **The manifest.** `scheme/js/schemes/<category>/cards.js` in file order, which IS the order the
   grid renders and the order a reader meets the cards in.
4. **The scope notes.** Every `SCOPE` block in that category's record, `CARDS.md` or the
   `CARDS/` folder beside it. There are
   six in the whole catalog and each one is a topic a card deliberately CEDES to a named sibling.
   Proposing a topic a `SCOPE` block already refused is the single most embarrassing finding this
   skill can produce.
5. **The declined ledger.** `reference/upstream.md`, second half. Anything already turned down does
   not come back as a proposal.

No server is needed. Both tools read source and run in under a second from anywhere. If a `desc`
is genuinely ambiguous, `python3 -m http.server 8888 --bind 0.0.0.0` from the repo root and open
the card, but reading three cards to settle one rating is the normal cost and opening a browser is
not.

**Run flavour.** `--axis=deeper` biases which gaps get promoted toward the mechanism end of the
stack, `--axis=broader` toward the operator end, and the default is balanced. **The ratings never
move with the flavour**, only which of the found gaps rank as `MUST`. A flavour that changed a
card's depth would be a rating that measured the flag rather than the card.

---

## 1. Say what the section is for, in one line

Before any card is judged, write the sentence the section as a whole says. It is the premise every
later verdict is measured against, and a report that skips it is a list of opinions with no shared
standard behind them.

Write it from the `<CAT>.D-01` admission cell and the cards that are actually there, never from the
section's label. Labels are two words and decide nothing.

> control-plane teaches how a request becomes durable state and who reacts to it, and it stops at
> the Node boundary

**This is not a blocking gate.** Analysis is cheap, so the thesis opens the REPORT as a premise
rather than stopping the work. If the user rejects it, the whole analysis re-runs against theirs,
and that is a cheaper loop than asking first and waiting.

---

## 2. Build the section map

```
node .claude/skills/section-review/tools/section.mjs <category>/<section>
node .claude/skills/section-review/tools/section.mjs <category>/<section> --markers
```

Then read every `desc` in the section IN FULL. All of them, not a sample. A `desc` is 400 to 470
characters and there are at most eleven of them in the largest section, so the whole read is under
five thousand words and it is the only input that tells you what the author thought each card was
for.

The tool prints position, prose size, step count, narration size, run time, the pages cited and the
five-band signature. **It is evidence, not a verdict**, and its own header lists what it cannot
see. Its most useful column is the one nobody reads: `narr`, the narration character count. A card
running well under its section's median is usually a card that was never finished.

---

## 3. Place every card on the two axes

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

---

## 4. Judge fit

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
believing any of it. If section 2 comes back empty, re-run it with `--min=2` before concluding the
section assumes nothing.

---

## 5. Reconcile against upstream

`reference/upstream.md` maps this section to the documentation trees its cards already cite. Fetch
those trees, take what the documentation treats as a first-class topic, and mark each one
`COVERED`, `PARTIAL` or `ABSENT` against the cards here.

**Verify, never recall.** This is `card-facts`'s ground rule and it applies here unchanged. A
Kubernetes feature you remember is exactly the kind of claim this phase exists to catch, and a
proposed card built on a feature that has left upstream costs a whole card to discover. Every
proposal carries the URL that was fetched and the feature stage that page states. A topic you could
not check is reported as `UNVERIFIED` and ranked below everything you could.

**A citation is not coverage.** Fifteen of `volumes-claims`'s citations land in
`/concepts/storage`, which proves the section reads that tree and proves nothing about what it
covers. Coverage means a card has that page as its SUBJECT.

**Not every absence is a gap.** A page can be absent because another section owns it, because a
`SCOPE` block cedes it on purpose, or because it does not deserve a diagram. For every absence you
do not promote, say which of those it is, in one line. An absence list with no dispositions is a
list of homework.

---

## 6. Find the gaps

Three independent sources, and a topic found by two of them outranks one found by one:

1. an upstream first-class topic marked `ABSENT` in phase 5
2. a term three or more cards here lean on and no card title anywhere owns, from `overlap.mjs`
   section 2
3. a hole in the depth profile, a section whose cards jump L2 straight to L5 with nothing between,
   which means the step a reader climbs on is missing

Rank them:

`MUST` a reader cannot follow the cards that ARE here without it
`SHOULD` the section is materially better with it
`NICE` a real topic that would not be missed

Every proposal carries five things, and one that cannot supply them is not ready to be proposed:

- the subject, in one sentence, in the shape a `desc` opens with (a question, then the answer)
- its depth band and its level
- the upstream page and the feature stage read off it
- **the two existing cards it would sit between**, by id
- what it takes from its neighbours, if anything, so the proposal is not silently a rewrite of two
  other cards

Rank by what the gap costs a READER, never by how easy the card would be to draw. That sentence is
in both sibling skills and it stays here.

---

## 7. The order is an argument

`D-10` says the SUBCATEGORY list is "an editorial argument about what a reader has to know first".
Nothing says that about the cards inside a section, which is exactly why this phase exists: the
order a reader meets eleven cards in is raw manifest position, decided once and checked by nothing.

Propose a sequence only where the current one actually misleads, and give one line of argument per
moved card. Two rules of thumb, both learned from what the shipped sections already do well:

**Order by what a reader must know first, never by depth.** A section that sorts itself L1 to L5
reads as a syllabus and teaches nothing about how the parts connect. `control-plane` puts
`cluster-etcd-raft` at position 10 and not at position 1, and that is right: raft is the floor
under the section and the wrong place to start.

**A gateway belongs near the front.** If the only L1 or L2 card in a section sits at position 8,
say so even when nothing else about the order is wrong.

---

## 8. Report

Four tables and a costing paragraph. In the user's language.

**The thesis**, from phase 1, one line, stated as the premise everything below is judged against.

**The section as it stands.** One row per card in manifest order:

```
| # | id | title | depth | level | verdict | one line |
```

**The depth profile.** The L1 to L5 histogram from `section.mjs`, with the healthy shape from
`reference/depth-scale.md` beside it and a named diagnosis where it differs: `top-heavy`, `flat`,
`hole at L<n>`, or `healthy`.

**The gaps.** Ranked, most costly first:

```
| rank | topic | depth | level | upstream source + stage | sits between |
```

**The order**, only if it should change, with the argument column.

Then **the costing**, which is what keeps the report honest:

> **A move inside a category is one `subcategory:` string. A move ACROSS categories is not.**
> `D-02` derives the module path from the id, so a cross-category move is a new id, a
> `SCHEME_ALIASES` entry (`D-11`), a file move, a `posters.js` key move, a record section move
> (`S-44`), and a count update in three places: the folder's `cards.js` header, `scheme/CLAUDE.md`,
> and `PER_CATEGORY` in `test/unit/catalog.test.mjs`.

Say which kind every proposed move is. A report that prices a cross-category move as a field edit
has recommended a day of work while describing an afternoon.

Close with the rows for the declined ledger, formatted for `reference/upstream.md`, so anything the
user turns down does not come back on the next run.

---

## 9. Deliverable

In the user's language:

- the thesis line, and an invitation to reject it, because everything else rests on it
- the four tables
- the ranked gaps, each with its two neighbours named
- the costing, per proposed move
- **an explicit statement that nothing was edited and no count moved**
- if the user accepts a proposal, the next step by name: `scheme/CLAUDE.md`'s seven-step new-card
  checklist, whose step 1 is the canon and whose step 4 goes through `card-poster`'s `R-01`
  concept sign-off

Never commit unless the user asks.

---

## Appendix A: the two axes on one screen

Depth is where in the stack the subject sits. Level is how much the reader must already know. Full
rubric with fifteen shipped anchors in `reference/depth-scale.md`.

| | L1 operator surface | L2 object contract | L3 control loop | L4 node mechanism | L5 kernel floor |
|---|---|---|---|---|---|
| what it opens | nothing, it maps | a field or a kind | a reaction | a call on a Node | the layer under it |
| anchor | `cluster-architecture` | `storage-access-modes` | `workloads-replicaset` | `storage-mount-path-chain` | `network-conntrack-nat` |

Levels: `junior` has applied a manifest, `middle` operates a cluster, `middle+` has debugged
something not in the error message, `pre-senior` designs the cluster. Target the centre of mass at
middle to middle-plus.

---

## Appendix B: how this analysis goes wrong

**Rating a card from its title.** Titles are two to five words and were never written to carry a
depth. `Where the Bytes Land` is L4 and reads like a poem. Rate from the `desc` and the middle
steps.

**Proposing what a `SCOPE` block already refused.** Six cards in the catalog carry one, and each
names the sibling it cedes a topic to on purpose. `storage-pv-lifecycle-phases` deliberately does
not draw the backing disk because `storage-reclaim-policy` owns that. Proposing "a card about what
happens to the disk" there is not a gap, it is a failure to read phase 0 item 4.

**Reading a small section as a gap.** `pods-bootstrap` is three cards and `node-lifecycle` is four.
Neither is thin: they are sections whose subject is genuinely small, bounded by one sentence each
("whether the app container has started", "is the Node still healthy"). Count is not coverage, in
either direction.

**Proposing a topic that left upstream, or never arrived.** Alpha, beta and deprecated are read off
the fetched page, never recalled. This is the one failure in the list that costs a whole card
before anyone notices.

**Pricing a cross-category move as a field edit.** See phase 8. `D-02` makes the id carry the
category, so moving a card between categories renames it, and a rename without a `SCHEME_ALIASES`
entry breaks every deep link that ever pointed at it.

**Letting the flavour move a rating.** `--axis=deeper` promotes deep gaps. It does not make an
existing card deeper. If two runs at two flavours disagree about a card's band, one of them was
measuring the flag.

**Filing an opinion as a finding.** Every fit verdict quotes the admission sentence it fails or
passes. Every gap names the two cards it sits between. A finding that supplies neither is a
preference, and this repository has paid before for a review that read the rule instead of the
thing.

---

## Appendix C: tools

| Tool | What it answers |
|---|---|
| `tools/section.mjs <cat>/<sec>` | the section as data in manifest order: prose size, step count, narration size, pages cited, five-band signature, section profile. `--list` for the 15 keys, `--markers` to see which words fired, `--json` to diff two runs |
| `tools/overlap.mjs <cat>/<sec>` | the three questions needing the whole catalog: pages shared with another section, terms this section leans on that no card title owns, cards elsewhere whose signature sits nearer here. `--min=` to loosen the second, `--margin=` the third |
| `tools/bands.mjs` | not a command. The five-band vocabulary, the string walk and the source-path reader both tools share, so two readers cannot drift into two answers |
