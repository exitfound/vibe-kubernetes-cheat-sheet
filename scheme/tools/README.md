# `scheme/tools`

Dev harness for the `scheme/` sub-app. Node, its own `package.json` (Playwright + pngjs), never
shipped: all three publishing mechanisms exclude `scheme/tools`.

Most checks need a server serving the repo. `BASE` overrides the default `http://localhost:8080`;
`PLAYWRIGHT_CHROMIUM` points at a system browser, otherwise Playwright resolves its own.

```bash
python3 -m http.server 8888 --bind 0.0.0.0      # from the repo root
cd scheme/tools && BASE=http://localhost:8888 npm run gate
```

**The container serves a SNAPSHOT.** `Dockerfile` is a blanket `COPY . .` with no mounts, so after
editing anything under `scheme/` the container on `:8080` still serves the old files and every tool,
the gate included, silently checks stale content and passes. Either point `BASE` at the python server
(which reads from disk) or rebuild the image first. Confirm with
`curl -s http://localhost:8080/<path> | md5sum` against `md5sum <path>`.

`npm run gate` chains the checks below marked **yes**, stopping on the first failure. It is
baseline-free and takes about 35 minutes. The chain is defined in `package.json` and its length is
stated nowhere else, so it cannot drift out of agreement with itself.

## What each check catches, and what it is blind to

The second column is the load-bearing one. A green gate means these rules hold, not that the card is
right, and knowing which failure each tool cannot see is what stops a green run from being read as a
looked-at card.

The same information from the other side is `../CANON.md`: given a RULE, its `Check` column names
the tool that would notice it breaking, or says `review` when nothing would. When you teach a check
a new rule, add or update its row there.

| Check | Catches | Blind to | Gate |
|---|---|---|---|
| `check-canon` | source lint, 12 enforced rules (`R-desc`, `R-dash`, `R-kitparity`, `R-modulepath`, `R-poster`, `R-opacity`, `R-viewbox`, `R-rawpulse`, `R-ridinglabel`, `R-srclabel`, `R-srcdup`, `R-skeleton`), plus a skeleton CENSUS printed every run | kit-vs-`scheme-kit` imports (`S-21`), z-order (`S-07`), the slot-0 no-draw rule (`S-09`), where `ctx.reduced` sits in the source: convention, review-enforced. `makeInit`/`posterFirst` used to be here and is now inside `R-skeleton` | yes |
| `check-canonrows` | `../CANON.md` against the harness: a row claiming `gate:<check>` for a check the chain does not run, a check in the gate no rule names, a duplicated or skipped id | whether the rule TEXT is true, and whether `review` is the honest answer for a rule a check could enforce | yes |
| `check-notes` | every design-note anchor still points at code that exists | whether the note is still TRUE | yes |
| `check-terms` | terminology and casing in `desc`, `narration`, every `aria-label` | meaning | yes |
| `check-inline` | casing and component names of strings drawn ON the diagram, including chip values that reach the canvas through a wrapper. Holds a coverage FLOOR (702) and an unread CEILING (8), both enforced | non-chip indirect writes (`setBoxSublabel`, `setBoxLabel`, `setPodSublabel`, `setWire`); and a chip declared through a card-local FACTORY, whose every value it silently never reads (`P-15`) | yes |
| `check-labels` | one object spelled one way catalog-wide | the value class never fails: an API literal and an English word wear the same letters | yes |
| `check-figures` | one Pod address on two Pod blocks, a request above its own limit | any other arithmetic | yes |
| `smoke-all` | console errors, walking every step twice (statically, then really PLAYED so motion code runs) | whether the drawing is right | yes |
| `check-reduced` | played vs static end state: own and inherited opacity, wire text, `.highlight` sets | a class that both paths carry equally | yes |
| `check-palette` | one `(category, element class, role, state)` tuple resolves to ONE colour | a role that is the wrong one to have asked for | yes |
| `check-opacity` | every shade is `0`, `1` or `OPACITY.*`; a Pod pulses before it fades; nothing lit at the terminated shade | CSS presentation shades, out of scope by construction | yes |
| `check-duration` | a step outlasting its own motion | a step with no motion passes trivially | yes |
| `check-chipfit` | a chip name colliding with its value, measured RENDERED on every step | wire-label width, which nothing measures | yes |
| `check-geometry` | `DIAGONAL`, `THROUGH`, `OFFEDGE`, `CENTRE`, `CENTRE-LOW`, `OCCLUDED` | whether anything is DRAWN where a lane ends; occlusion below its area bar | `diagonal,through,offedge` |
| `check-arrival` | R3: a block receiving a packet must not be lit at entry (**0 findings**). R2: a changed chip must be cued | a turnover mid-step, because it samples t=0 only; and any cue that is not a `classList.add` on the chip itself (a Pod pulse, `walkRows` lighting a listing row by row) | no, and R2 cannot join as written |
| `check-sources` | liveness of every `sources` href (DEAD, SOFT, MOVED, ANCHOR) | **its own cache**: a url with a good record is never re-fetched, so a warm run proves nothing about today. `--refresh` is the only mode whose green means alive NOW | no, hits the network |

`check-geometry` runs three of its six rules in the gate. `OFFEDGE` joined on 2026-08-06 with an
empty queue, so an endpoint drifting off a face midpoint can now only ever be a regression.
`CENTRE`, `CENTRE-LOW` and `OCCLUDED` cannot join, because their remaining findings are deliberate
decisions with the reason written into the card's record (8 today, on 7 cards). Run it bare to see
the current state, and read a new finding against those notes before treating it as a regression.

**R2's queue is drained and the rule still cannot be gated.** All 29 findings were read on
2026-08-06: 20 are the t=0 sampling artefact (the chip turns over later in the step through
`at(...)`), and the other 9 are deliberate, each with the reason already in the card
(`cluster-api-structure` restores a steady state the aside interrupted, `network-endpointslice-reconcile`
cues with a Pod pulse, `network-client-ip-preservation` says in a comment that the panel goes back to
none and stays unlit, `storage-fsgroup-ownership` lights its listing through `walkRows`). Zero true
positives. To become a gate rule R2 needs to sample the END of a step, not its entry, and R3 needs
the entry, so the two want different sample points and the tool would have to walk twice.

`check-sources` caches every fetched page under `.cache/pages` (gitignored), so a later text pass can
verify a claim offline. That cache is also its blind spot: run it `--refresh` when you want liveness
rather than a re-read of what was alive whenever the cache was built. Last full refresh 2026-08-06,
149 unique urls, 0 findings.

## Readers, not checks

| Tool | Gives |
|---|---|
| `anim-dump` | a card's motion AS DATA per step: target, animated props, dur/delay/easing, transforms sampled at fixed progress, plus `span=` per step. The strongest analysis tool here, because motion-as-text reads far better than pixels |
| `frame-strip` | N deterministic frames per step (WAAPI seeked to an exact logical time, not wall-clock sampled), `--contact` for one labelled sheet. **Cannot see a deferred effect**: seeking never fires `onfinish`, so every `at(...)` turnover and every `lightBoxAt` arrival class is missing from its frames |
| `inline-dump` | a card as text: `aria-label`, every block as `label -> sublabel`, every chip as the values it takes, wire labels, chain rows, riding tags, narration. Resolves values reaching a chip through the card's own wrapper, and prints an `INCOMPLETE` block naming anything it cannot read |
| `overlay-measure` | the narration panel's extent per step, per viewport |
| `inspector.js` | `?inspect=1` in the browser: grid + bbox overlay, exposes `window.__schemeCtl` |

**The oracle pins motion and structure across a refactor that must not change the picture, and it is
THREE commands, not two.** `oracle:diff` compares two directories already on disk and never opens a
source file, so the run that reads the changed tree has to be issued explicitly:

```bash
BASE=http://localhost:8888 npm run oracle:base   # before, writes baselines/{anim,dom}-base
#   ... make the change ...
BASE=http://localhost:8888 npm run oracle        # after, writes baselines/{anim,dom}
npm run oracle:diff                              # compares the two, prints ORACLE CLEAN
```

Two traps. `oracle:diff` checks the `_complete` sentinel on the NEW side only, so a base captured by
an older tool version can be silently incomplete: verify both `_complete` files read the same card
and step count. And point `BASE` at the python server, because `:8080` serves the container's
snapshot and goes stale the moment you edit anything. `_shared.mjs` holds the Playwright plumbing (`launch`, `setInspect`, `stepCount`,
and the deterministic-seek trio `enterStep` / `stepSpan` / `seekStep`) so the tools cannot drift
apart. `prose.mjs` holds the sentence splitter, the term matcher, `INLINE_SITES` and the chip-value
resolver, shared by every tool that reads prose so they cannot disagree about what a drawn string is.

## Writing a check

A rule that cannot tell its true positives from its false ones is a report, not a rule. Land it
report-only, drain the queue, then put it in the exit code as a regression guard.

- **Judge the EXPRESSION, not the number**, so a named constant cannot smuggle a value past it.
- **Read a comment-stripped copy of the source.** This project's comments discuss the very things the
  rules hunt for, so raw text produces phantom findings.
- **Walk, do not enumerate.** A list of files has to be edited every time the tree moves, and it
  gives neither a finding nor an error when it silently stops covering something.

## Refactoring under the harness

- **Never `git checkout -- <file>` during uncommitted work**: it restores from the INDEX and wipes
  unstaged stages, and every check can stay green while it does, because nothing reads the field you
  just lost. Use a `cp` backup.
- **A codemod on names needs a self-shadowing check.** `pod(` to `podShell(` yields
  `const podShell = podShell({...})`, which `node --check` passes: the error is runtime, not syntax.
- **The acceptance criterion is a NUMBER, not "0 findings".** Record what a tool counted before the
  refactor and assert it after: coverage can collapse to a third at zero findings and exit 0.
- **An oracle needs a completeness sentinel and a cleared output directory**, or a run that dies
  partway reports "no changes" against the previous run's files.

## Comments in this folder

A standalone script's header is how you learn to run it, so headers stay here rather than moving to a
design record. They are capped at the same two to three lines as everything else: the long version of
any tool's reasoning belongs in this file.
