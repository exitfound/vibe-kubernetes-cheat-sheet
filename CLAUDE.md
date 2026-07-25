# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

One static, dependency-free site deployed to `kube.how`, made of three path-based sub-apps that share visual chrome but are otherwise independent:

| Path | Sub-app | What it is | Deep docs |
|---|---|---|---|
| `/` | **Hub** | One-viewport landing page: two entry panels (Commands, Schemes) over an aurora + canvas packet-graph background | this file (Hub section below) |
| `/cli/` | **Commands** | Searchable `kubectl`/Helm/Kustomize/K9s cheat sheet, 890 commands, copy + star | `cli/CLAUDE.md` |
| `/scheme/` | **Schemes** | Card grid of animated SVG Kubernetes architecture diagrams (click a card, a `<dialog>` plays a step-by-step animation) | `scheme/CLAUDE.md`, plus `scheme/docs/CARDS.md` for per-card geometry |

Each sub-app has its own nested `CLAUDE.md` with the full detail; Claude Code auto-loads it when you work inside that folder. This file stays an overview: the repo shape, how to run and ship, and the chrome shared across all three pages.

No framework, no bundler, no npm at runtime. Everything is plain HTML/CSS and ES modules loaded directly by the browser via `<script type="module">`. The only external dependency is Google Fonts (Space Grotesk + JetBrains Mono). `scheme/tools/` has its own Node `package.json`, but that is a dev-only test harness, never shipped.

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
- **`deploy.yml`** stages `index.html`, `favicon.svg`, `robots.txt`, `sitemap.xml`, `CNAME`, plus the `images/`, `cli/`, and `scheme/` directories, then strips `scheme/tools/`, `scheme/docs/` and every `CLAUDE.md` before publishing to GitHub Pages. `configs/`, `Dockerfile`, and `.dockerignore` are intentionally excluded (Docker-only).
- **`release.yml`** zips the shippable tree (`index.html`, `cli/`, `scheme/`, `images/`, `favicon.svg`, `robots.txt`, `sitemap.xml`, `CNAME`, `Dockerfile`, `configs/`, `.dockerignore`, minus `scheme/tools/`, `scheme/docs/` and the nested `CLAUDE.md` files) into a tagged Release `vYYYY.MM.DD-<sha>`. Its `paths:` trigger matches that artifact list so any shippable change cuts a release while docs-only commits are skipped.

Internal docs (`CLAUDE.md` anywhere, `scheme/tools/`, `scheme/docs/`, root `SCHEME-REVIEW.md`) never reach production. Three mechanisms have to agree: `deploy.yml` (GitHub Pages), `release.yml` (the zip) and `.dockerignore` (the container image). The first two are allowlists, so a new internal file at the repo root needs only `.dockerignore`; anything inside an already-copied directory (`scheme/`, `cli/`, `images/`) must be named in all three. The local container is the easiest place to catch a miss: `curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/<path>` must return 404. Any push to `main` ships immediately; there is no staging environment. Hosting is GitHub Pages + Cloudflare (custom domain, SSL, edge cache).

## Shared chrome (cross-cutting, applies to all three pages)

**Left sidebar switcher.** A fixed 38px vertical sidebar on the left edge of every page carries three icon buttons stacked at top: **Home** (`#sideHome` to `/`), **Commands** (`#sideCli` to `/cli/`), **Schemes** (`#sideScheme` to `/scheme/`). The button for the current page ships with `.active` + `aria-current="page"` hardcoded in that page's HTML (no JS toggle). Active state renders as a lavender (`--accent`) bar at the left edge plus a tinted icon. A bottom-anchored `.side-toggle` collapses the sidebar (`body.sidebar-collapsed` slides it out with `transform: translateX(-100%)` and zeros body padding-left); a `.side-expand` tab brings it back. Collapse state persists in `localStorage` under `kube-how:sidebar-collapsed:v1`. Wiring lives in `cli/js/lib/sidebar.js` and a copy in `scheme/js/lib/sidebar.js` (duplicated, not symlinked, so each path stays self-contained); each `app.js` calls `setupSidebar()` once. The hub imports the cli copy directly. Cross-link `href`s are plain relative paths (no env.js / hostname detection): the path-based layout is single-origin.

**The header carries no cross-navigation.** Site switching is the sidebar's job only. Header actions are GitHub / Contacts / Sponsor on the hub and cli, nothing on scheme. Those three optional ghost buttons are powered by `cli/js/contacts.js` (lazy-imported by both the hub and cli; delete the file to ship without them). See `cli/CLAUDE.md` for its shape.

**Chrome parity.** The hub and scheme pages reuse `/cli/css/styles.css` so the header, sidebar, footer, tokens, and scrollbar stay pixel-identical across all three. Each page runs an `alignLogo()` that centers the logo icon over the position of the nav's "All" button; pages without a real nav (hub) carry an invisible "ghost ruler" nav replica purely so the same alignment math has something to measure against. `alignLogo()` skips the centering offset at viewports <=900px. If you change scrollbar styling, duplicate the `::-webkit-scrollbar` rules into every sister CSS or the centered content drifts on tab switch.

**First-paint flash handling.** Every page's `<head>` puts `color-scheme: dark` hints and a `background:#110f1f;color:#ece9ff` inline style first, before any other CSS, to kill the white flash on dark systems. `cli/js/app.js` additionally awaits one painted frame (`requestAnimationFrame` + `setTimeout(0)`) before building the heavy command list so the dark shell paints instantly. Do not reorder or remove these.

**Project-wide writing rules.** No em-dashes anywhere (rephrase, use colons/parentheses instead). No semicolons or apostrophes in `scheme/` narration/wire strings (they are single-quoted JS; an apostrophe breaks module load). These apply to all user-visible text.

## Working discipline (cross-cutting)

These encode recurring friction from past sessions. They apply to all three sub-apps.

**Scope discipline.** Make ONLY the change asked for. Do not recolor, re-trim descriptions, restructure elements, or "improve" adjacent things that were not mentioned. Concrete traps that caused reverts: "darken" is not "recolor purple", "remove the flash/pulse" is not "remove all highlighting", "slow the ball glide" is not "slow the whole card". When matching a sibling card, match it exactly and do not over-trim. If a change seems to need touching more than the ask, stop and say so first rather than expanding silently.

**File safety.** Never overwrite or delete an untracked or user-authored file (helper `*.mjs` scripts, scratch files). Before `Write`-ing to a path that may already exist, check `git status` / read it first: an untracked file has no recovery path once overwritten.

**Verify before claiming done.** For any visual/animation change, confirm the specific issue is actually gone via a browser render or `anim-dump`, not by assumption, before reporting success. Measure DOM only after fonts have loaded. "I fixed the flicker" is only true after you have looked. See `scheme/CLAUDE.md` for the gate and the motion tools.

**Posters need concept sign-off.** Posters are the single biggest source of rework. Before rendering a full poster, describe the intended abstract technical-diagram concept in one line and get approval. No literal copies of the card diagram, no reused two-box layouts, no plain "dumb circles". (Full poster construction canon lives in `scheme/CLAUDE.md`.)

**Docs sync.** After adding or removing cards, update the `SCHEMES` count and category counts in `scheme/CLAUDE.md` to match `scheme/js/data.js` exactly, and verify they align. Only sync docs on an explicit request or at the end of a completed unit of work, not mid-refactor.

**Commit cadence.** Long sessions with no commit leave hard-won work exposed (an over-reaching edit or an accidental overwrite then has no cheap revert). After each approved, gate-green card or refactor, offer to stage and commit it with a concise conventional-commit message. Do not commit without the user's go-ahead.

---

# `/` Landing hub (`index.html`)

A single self-contained file: all hub-specific CSS and JS are inline, only `/cli/css/styles.css`, `/cli/js/lib/sidebar.js`, and `/cli/js/contacts.js` (lazy, for the header dropdowns) are imported from cli. It renders one viewport: two `<a class="hub-panel">` entry cards (Commands to `/cli/`, Schemes to `/scheme/`) over a drifting three-blob aurora and a canvas node-graph that spawns packets along soft links. A tiny inline script at the top rewrites incoming hashes: `#scheme=...` redirects to `/scheme/#scheme=...`, any other `#hash` to `/cli/#hash`, so legacy deep links still resolve. The radial-gradient / rich-landing concept was explicitly rejected in favor of this restrained split-panel design; blob trajectories were hand-tuned. Hub-only color tokens (`--hub-scheme-*`, lavender) live inline; the rest come from the shared stylesheet.
