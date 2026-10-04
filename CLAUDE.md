# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

One static, dependency-free site deployed to `kube.how`, made of three path-based sub-apps that share visual chrome but are otherwise independent:

| Path | Sub-app | What it is | Deep docs |
|---|---|---|---|
| `/` | **Hub** | One-viewport landing page: two entry panels (Commands, Schemes) over an aurora + canvas packet-graph background | this file (Hub section below) |
| `/cli/` | **Commands** | Searchable `kubectl`/Helm/Kustomize/K9s cheat sheet, 886 commands, copy + star | `cli/CLAUDE.md` |
| `/scheme/` | **Schemes** | Card grid of animated SVG Kubernetes architecture diagrams (click a card, a `<dialog>` plays a step-by-step animation) | `scheme/CLAUDE.md` (contract), `scheme/CANON.md` (the card rulebook, load on demand), plus `js/schemes/<category>/CARDS.md` for per-card geometry |

Each sub-app has its own nested `CLAUDE.md` with the full detail; Claude Code auto-loads it when you work inside that folder. This file stays an overview: the repo shape, how to run and ship, and the chrome shared across all three pages.

`README.md` at the repo root is the USER-facing description: what the site is, the command and diagram counts, the stack. It reaches nobody through the site (neither shipping mechanism copies it, and `.dockerignore` excludes it) and everybody through GitHub. No `CLAUDE.md` links to it, so it is the one document that goes stale without anything noticing: re-read its counts whenever a card or a command block is added or removed. `R-dash` does scan it.

No framework, no bundler, no npm at runtime. Everything is plain HTML/CSS and ES modules loaded directly by the browser via `<script type="module">`. The only external dependency is Google Fonts (Space Grotesk + JetBrains Mono), loaded by `preconnect` + `preload` in all three page heads. There is no `@font-face` anywhere: if you ever self-host, remember a new top-level directory is invisible to both shipping mechanisms (`deploy.yml` copies `images cli scheme` by name, `release.yml` zips a named list), so it would reach the container via the blanket `COPY . .` and 404 in production. `scheme/test/` has its own Node `package.json`, but that is a dev-only test harness, never shipped.

The earlier `scheme.kube.how` subdomain plan was abandoned: everything is one origin under path prefixes.

## Running

```bash
python3 -m http.server 8888 --bind 0.0.0.0
```

No build step. Open `http://localhost:8888/` (hub), `/cli/`, or `/scheme/`. All paths inside each sub-app are relative, so the same files work locally and in production.

Docker (nginx, serves the whole tree at once):
```bash
docker build -t kube-cheatsheet .
docker run -d --name kube-cheatsheet -p 8080:80 kube-cheatsheet
```
Rebuild after edits: `docker rm -f kube-cheatsheet && docker build -t kube-cheatsheet . && docker run -d --name kube-cheatsheet -p 8080:80 kube-cheatsheet`. `configs/nginx.conf` sets gzip, security headers, and `no-cache` on static assets for local iteration.

## Deployment

Two GitHub Actions run on every push to `main`:
- **`deploy.yml`** stages `index.html`, `favicon.svg`, `robots.txt`, `sitemap.xml`, `CNAME`, plus the `images/`, `cli/`, and `scheme/` directories, then strips `scheme/test/` and every `CLAUDE.md`, `CARDS.md` and `CANON.md` before publishing to GitHub Pages. `configs/`, `Dockerfile`, and `.dockerignore` are intentionally excluded (Docker-only).
- **`release.yml`** zips the shippable tree (`index.html`, `cli/`, `scheme/`, `images/`, `favicon.svg`, `robots.txt`, `sitemap.xml`, `CNAME`, `Dockerfile`, `configs/`, `.dockerignore`, minus `scheme/test/` and the same three internal filenames) into a tagged Release `vYYYY.MM.DD-<sha>`. Its `paths:` trigger matches that artifact list so any shippable change cuts a release while docs-only commits are skipped.

Internal docs never reach production. They are three filenames (`CLAUDE.md`, `CARDS.md`, `CANON.md`, anywhere in the tree) plus `scheme/test/`, which carries the whole `node:test` harness and the two text probes in its `tools/`. The design record lives in the folder it describes rather than in a `docs/` directory, so exclusion is by NAME, not by path. The three lists name the same set and `unit/files.test.mjs` S-41 asserts it: a name on two of the three ships through the third.

**Three mechanisms have to agree, and they are not symmetric.** `deploy.yml` (GitHub Pages) and `release.yml` (the zip) work off ALLOWLISTS, so a new internal file at the repo root is excluded by default there and only `.dockerignore` has to learn about it. Anything inside an already-copied directory (`scheme/`, `cli/`, `images/`) must be named in all three. The local container is the cheapest place to catch a miss, because `Dockerfile` is a blanket `COPY . .`: `curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/<path>` must return 404.

Any push to `main` ships immediately; there is no staging environment. Hosting is GitHub Pages + Cloudflare (custom domain, SSL, edge cache).

## Shared chrome (cross-cutting, applies to all three pages)

**Left sidebar switcher.** A fixed 38px vertical sidebar on the left edge of every page carries three icon buttons stacked at top: **Home** (`#sideHome` to `/`), **Commands** (`#sideCli` to `/cli/`), **Schemes** (`#sideScheme` to `/scheme/`). The button for the current page ships with `.active` + `aria-current="page"` hardcoded in that page's HTML (no JS toggle). Active state renders as a lavender (`--accent`) bar at the left edge plus a tinted icon. A bottom-anchored `.side-toggle` collapses the sidebar (`body.sidebar-collapsed` slides it out with `transform: translateX(-100%)` and zeros body padding-left); a `.side-expand` tab brings it back (at <=680px the tab narrows to 12px so it fits the 14px page gutter instead of covering cards and footer text, and an invisible `::before` strip keeps the tap target 30px wide). Collapse state persists in `localStorage` under `kube-how:sidebar-collapsed:v1`. Wiring lives in `cli/js/lib/sidebar.js` and a copy in `scheme/js/lib/sidebar.js` (duplicated, not symlinked, so each path stays self-contained); each `app.js` calls `setupSidebar()` once. The hub imports the cli copy directly. On `/cli/` and `/scheme/` (not the hub, which has no shortcuts) a `#sideKeys` keyboard button sits just above `.side-toggle` and opens the keyboard-shortcuts sheet, hidden on touch screens. Cross-link `href`s are plain relative paths (no env.js / hostname detection): the path-based layout is single-origin.

**Keyboard-shortcuts sheet.** `?` (or `#sideKeys`) opens a modal `<dialog class="keys-dialog">` listing the page's keys, built by `setupKeysHelp(groups)` in `cli/js/lib/keys.js` and its copy `scheme/js/lib/keys.js` (duplicated like `sidebar.js`). Each `app.js` passes its own groups, so the sheet is the one place a reader learns the keys: change a binding and change its row in the same edit. The same module exports `isSlash`, `isQuestion` and `isLetter`, which every shortcut goes through. They match the typed character first and fall back to the physical key only for a non-Latin layout, so `/`, `?`, `F`, `R` and `L` also fire on a Russian layout, where `/` types `.`, `Shift+/` types `,` and `F` types `а`. Matching on `e.key` alone was a shipped bug. Both search fields carry a `<kbd class="search-kbd">/</kbd>` hint, hidden on focus, with text, on touch, and at <=400px, where an empty field also gives up its right padding so the placeholder is not cut off.

**New since your last visit.** `cli/js/lib/fresh.js` and its copy `scheme/js/lib/fresh.js` keep, per browser, a map of every item it has seen to the time it first saw it: `kube-how:cli-seen:v1` (keyed by `hashKey(rawCommand)`) and `kube-how:scheme-seen:v1` (keyed by card id). The FIRST visit records everything as 0, a baseline that is never new, so a newcomer sees no badges at all. An item that turns up on a later visit reads NEW for `FRESH_DAYS` (14), until it is copied (`/cli/`) or opened (`/scheme/`). There are no dates in the content data on purpose: this needs no upkeep when a command or a card is added. Each item gets a filled-lavender `NEW` pill and each section header an `N new` chip (`.section-new`); the hub counts the same maps.

**Social previews.** Each page has its own 1200x630 `og:image` / `twitter:image`: `images/og-hub.png` (hub), `images/og-image.png` (`/cli/`), `images/og-scheme.png` (`/scheme/`). `README.md` shows all three. They are raster art with no source file in the repo: redrawing one means generating a new image, and any command or label painted into it is content that has to be true.

**The header carries no cross-navigation.** Site switching is the sidebar's job only. Header actions are GitHub / Contacts / Sponsor, and all three pages carry them, scheme included. They are powered by `contacts.js`, which exists **twice**: `cli/js/contacts.js` (lazy-imported by the hub and cli) and `scheme/js/contacts.js` (lazy-imported by scheme). The two copies are not identical, so deleting one only removes the buttons from the pages that import it. See `cli/CLAUDE.md` for its shape.

**Chrome parity.** The hub and scheme pages reuse `/cli/css/styles.css` so the header, sidebar, footer, tokens, and scrollbar stay pixel-identical across all three. Each page runs an `alignLogo()` that centers the logo icon over the position of the nav's "All" button; pages without a real nav (hub) carry an invisible "ghost ruler" nav replica purely so the same alignment math has something to measure against. `alignLogo()` skips the centering offset at viewports <=900px. If you change scrollbar styling, duplicate the `::-webkit-scrollbar` rules into every sister CSS or the centered content drifts on tab switch.

**First-paint flash handling.** Every page's `<head>` puts `color-scheme: dark` hints and a `background:#110f1f;color:#ece9ff` inline style first, before any other CSS, to kill the white flash on dark systems. `cli/js/app.js` additionally awaits one painted frame (`requestAnimationFrame` + `setTimeout(0)`) before building the heavy command list so the dark shell paints instantly. Do not reorder or remove these.

**Project-wide writing rules.** No em-dashes anywhere (rephrase, use colons/parentheses instead). No semicolons or apostrophes in `scheme/` narration/wire strings (they are single-quoted JS; an apostrophe breaks module load). These apply to all user-visible text.

**A write hook can hard-fail your edit.** `.claude/hooks/check-js.sh` is a PostToolUse hook: after any Edit or Write to a `scheme/js/**/*.js` file it parses it AS AN ES MODULE (`node --input-type=module --check`, file on stdin) and **exits 2** if it no longer parses, which is almost always an apostrophe that landed inside a single-quoted narration string. The plain `node --check <file>` form does NOT work here and was the hook's original bug: on a file that opens with `import` it returns 0 over a genuine syntax error. A semicolon in narration is valid JavaScript and is caught by the prose test, not here. The message comes back as tool feedback, not as a test failure. Nothing else in the repo has a hook.

## Working discipline (cross-cutting)

These encode recurring friction from past sessions. They apply to all three sub-apps. The `scheme/` sub-app additionally has a rulebook of its own, `scheme/CANON.md`: every rule a card is held to, with a stable id and a column naming the check (if any) behind it. It is not auto-loaded, so load it before designing, reviewing or repairing a card.

**Scope discipline.** Make ONLY the change asked for. Do not recolor, re-trim descriptions, restructure elements, or "improve" adjacent things that were not mentioned. Concrete traps that caused reverts: "darken" is not "recolor purple", "remove the flash/pulse" is not "remove all highlighting", "slow the ball glide" is not "slow the whole card". When matching a sibling card, match it exactly and do not over-trim. If a change seems to need touching more than the ask, stop and say so first rather than expanding silently.

**File safety.** Never overwrite or delete an untracked or user-authored file (helper `*.mjs` scripts, scratch files). Before `Write`-ing to a path that may already exist, check `git status` / read it first: an untracked file has no recovery path once overwritten.

**`.codegraph/` is never deleted.** It holds the CodeGraph index (`codegraph.db`), the local code-intelligence graph the MCP server and the `codegraph` CLI answer from. It is gitignored, so it reads as an untracked artefact left behind by something, and on 2026-08-28 a cleanup block that was reverting a subagent (`git checkout -- <card>` plus `git checkout -- .claude/settings.json`) swept `rm -rf .codegraph` along with it, three times in one session. Nothing in this repo produces that directory by accident and nothing ships it (`.dockerignore` carries it, and both workflows are allowlists), so it is never part of a revert, a tidy-up or a `git clean -fdx`. Rebuilding is `codegraph init` and costs about a second, but only if someone notices the loss: a missing index degrades silently into grep.

**Verify before claiming done, and a green check is not a looked-at page.** For any visual/animation change, confirm the specific issue is actually gone by opening the rendered frame, not by assumption, before reporting success. Measure DOM only after fonts have loaded. "I fixed the flicker" is only true after you have looked. See `scheme/CLAUDE.md` for the test suite and the two probes beside it.

The stronger version of this rule was paid for twice in one week. A pass relaid 35 diagrams to zero findings in the geometry lint and reported them done having opened six rendered frames out of thirty five; the author returned all three defects it had introduced, none of which any rule could see. The repair then introduced a fourth of the same family, again invisible to every check, again found only by opening the frames. **A rule can be satisfied and the picture ruined, and that is the ordinary case rather than the rare one.** Look at every item you touched, not a sample. When a rule can only be satisfied by making the artefact worse, leave the finding open and write down why.

**A mass automated pass over text must be followed by reading it.** A regex sweep, a codemod or a bulk find-and-replace over user-visible prose leaves the linters green and the meaning broken. Four separate times in one session: duplicated prefixes (`The The The startupProbe`), grammar broken by a reworded sentence opening (`You run kubectl set image ... PATCHes`), a word dropped so the question no longer parsed, and 29 qualifying conditions cut to fit a character band, each leaving a true sentence as a false absolute. An assertion that a pattern matches exactly once does NOT protect a prefix-style edit from a second run, because the old text is still a substring of the new one.

**Technical text gets a second pair of eyes.** Not for style, for accuracy. In this project 87 cards that one reviewer had closed yielded 31 real defects when someone else re-read them. The cheapest technique by far is looking for **internal contradiction**: a card disagreeing with its own other steps, its own diagram labels, its own `aria-label` or a sibling card. That found more than half of everything and needs no network access.

**Posters need concept sign-off.** Posters are the single biggest source of rework. Before rendering a full poster, describe the intended abstract technical-diagram concept in one line and get approval. No literal copies of the card diagram, no reused two-box layouts, no plain "dumb circles". (Full poster construction canon is the `R-` block of `scheme/CANON.md`.)

**Docs sync.** After adding or removing cards, update the `SCHEMES` count and category counts in `scheme/CLAUDE.md` to match `scheme/js/data.js` exactly, and verify they align. Only sync docs on an explicit request or at the end of a completed unit of work, not mid-refactor.

A count that has one executing home is stated only there. The number of checks the old harness chained used to be restated in three documents and was wrong in all three; today the suite is read out of `scheme/test/package.json`, where it runs, and no document repeats it. The per-card design notes in `js/schemes/<category>/CARDS.md` anchor themselves to a line of code and would rot silently when that line moves, which `test/unit/docs.test.mjs` machine-checks on every run.

**Commit cadence.** Long sessions with no commit leave hard-won work exposed (an over-reaching edit or an accidental overwrite then has no cheap revert). After each approved, green-suite card or refactor, offer to stage and commit it with a concise conventional-commit message. Do not commit without the user's go-ahead.

---

# `/` Landing hub (`index.html`)

A single self-contained file: all hub-specific CSS and JS are inline, only `/cli/css/styles.css`, `/cli/js/lib/sidebar.js`, and `/cli/js/contacts.js` (lazy, for the header dropdowns) are imported from cli, plus the two catalogs and `/cli/js/lib/fresh.js`, lazily after paint, for the live counts. It renders one viewport: two `<a class="hub-panel">` entry cards (Commands to `/cli/`, Schemes to `/scheme/`) over a drifting three-blob aurora and a canvas node-graph that spawns packets along soft links. A tiny inline script at the top rewrites incoming hashes: `#scheme=...` (a card) and `#at=...` (a filtered grid) redirect to `/scheme/`, any other `#hash` to `/cli/#hash`, so legacy deep links still resolve. The two prefixes are the whole reason `/scheme/` names its filter key instead of writing it bare the way `/cli/` writes its sections: the bare namespace belongs to the default target, and matching on a prefix keeps the hub from carrying a copy of the scheme catalog's section keys. The radial-gradient / rich-landing concept was explicitly rejected in favor of this restrained split-panel design; blob trajectories were hand-tuned. Under each panel description a `.hub-stat` line shows live counts (`886 commands · 35 sections`, `143 schemes · 4 categories`) plus an `N new` pill, filled after first paint by lazily importing `/cli/js/data.js`, `/scheme/js/data.js` and `/cli/js/lib/fresh.js` in `requestIdleCallback` (the same modules the two pages load, so this also warms the cache for the next click). The line keeps a 20px min-height so nothing jumps when it fills. A "Continue: <last scheme>" link was tried and rejected, do not bring it back. Hub-only color tokens (`--hub-scheme-*`, lavender) live inline; the rest come from the shared stylesheet. At <=900px, where the hub has no search box to share the second header row with, the three header actions fill that row as equal labelled buttons instead of hanging icon-only at its right end. In that stacked layout the panels are `flex: 1 0 auto` (with `overflow: hidden` a flex item's minimum height is 0, and the halves used to cut their own CTA off) and the spacing (24px padding, 10px gap, 56px icon) is tuned so the hub stays one viewport at 390x844 and 700x900 with the stat line in. Roomier values overflow; shorter phones (375x667, 360x740) scroll a little.
