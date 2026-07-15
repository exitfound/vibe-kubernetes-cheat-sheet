# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

One static, dependency-free site deployed to `kube.how`, made of three path-based sub-apps that share visual chrome but are otherwise independent:

| Path | Sub-app | What it is | Deep docs |
|---|---|---|---|
| `/` | **Hub** | One-viewport landing page: two entry panels (Commands, Schemes) over an aurora + canvas packet-graph background | this file (Hub section below) |
| `/cli/` | **Commands** | Searchable `kubectl`/Helm/Kustomize/K9s cheat sheet, 600+ commands, copy + star | `cli/CLAUDE.md` |
| `/scheme/` | **Schemes** | Card grid of animated SVG Kubernetes architecture diagrams (click a card, a `<dialog>` plays a step-by-step animation) | `scheme/CLAUDE.md` |

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
- **`deploy.yml`** stages `index.html`, `favicon.svg`, `robots.txt`, `sitemap.xml`, `CNAME`, plus the `images/`, `cli/`, and `scheme/` directories, then strips `scheme/tools/` and every `CLAUDE.md` before publishing to GitHub Pages. `configs/`, `Dockerfile`, and `.dockerignore` are intentionally excluded (Docker-only).
- **`release.yml`** zips the shippable tree (`index.html`, `cli/`, `scheme/`, `images/`, `favicon.svg`, `robots.txt`, `sitemap.xml`, `CNAME`, `Dockerfile`, `configs/`, `.dockerignore`, minus `scheme/tools/` and the nested `CLAUDE.md` files) into a tagged Release `vYYYY.MM.DD-<sha>`. Its `paths:` trigger matches that artifact list so any shippable change cuts a release while docs-only commits are skipped.

Internal docs (`CLAUDE.md` anywhere, `scheme/tools/`) never reach production. Any push to `main` ships immediately; there is no staging environment. Hosting is GitHub Pages + Cloudflare (custom domain, SSL, edge cache).

## Shared chrome (cross-cutting, applies to all three pages)

**Left sidebar switcher.** A fixed 38px vertical sidebar on the left edge of every page carries three icon buttons stacked at top: **Home** (`#sideHome` to `/`), **Commands** (`#sideCli` to `/cli/`), **Schemes** (`#sideScheme` to `/scheme/`). The button for the current page ships with `.active` + `aria-current="page"` hardcoded in that page's HTML (no JS toggle). Active state renders as a lavender (`--accent`) bar at the left edge plus a tinted icon. A bottom-anchored `.side-toggle` collapses the sidebar (`body.sidebar-collapsed` slides it out with `transform: translateX(-100%)` and zeros body padding-left); a `.side-expand` tab brings it back. Collapse state persists in `localStorage` under `kube-how:sidebar-collapsed:v1`. Wiring lives in `cli/js/lib/sidebar.js` and a copy in `scheme/js/lib/sidebar.js` (duplicated, not symlinked, so each path stays self-contained); each `app.js` calls `setupSidebar()` once. The hub imports the cli copy directly. Cross-link `href`s are plain relative paths (no env.js / hostname detection): the path-based layout is single-origin.

**The header carries no cross-navigation.** Site switching is the sidebar's job only. Header actions are GitHub / Contacts / Sponsor on the hub and cli, nothing on scheme. Those three optional ghost buttons are powered by `cli/js/contacts.js` (lazy-imported by both the hub and cli; delete the file to ship without them). See `cli/CLAUDE.md` for its shape.

**Chrome parity.** The hub and scheme pages reuse `/cli/css/styles.css` so the header, sidebar, footer, tokens, and scrollbar stay pixel-identical across all three. Each page runs an `alignLogo()` that centers the logo icon over the position of the nav's "All" button; pages without a real nav (hub) carry an invisible "ghost ruler" nav replica purely so the same alignment math has something to measure against. `alignLogo()` skips the centering offset at viewports <=900px. If you change scrollbar styling, duplicate the `::-webkit-scrollbar` rules into every sister CSS or the centered content drifts on tab switch.

**First-paint flash handling.** Every page's `<head>` puts `color-scheme: dark` hints and a `background:#110f1f;color:#ece9ff` inline style first, before any other CSS, to kill the white flash on dark systems. `cli/js/app.js` additionally awaits one painted frame (`requestAnimationFrame` + `setTimeout(0)`) before building the heavy command list so the dark shell paints instantly. Do not reorder or remove these.

**Project-wide writing rules.** No em-dashes anywhere (rephrase, use colons/parentheses instead). No semicolons or apostrophes in `scheme/` narration/wire strings (they are single-quoted JS; an apostrophe breaks module load). These apply to all user-visible text.

---

# `/` Landing hub (`index.html`)

A single self-contained file: all hub-specific CSS and JS are inline, only `/cli/css/styles.css`, `/cli/js/lib/sidebar.js`, and `/cli/js/contacts.js` (lazy, for the header dropdowns) are imported from cli. It renders one viewport: two `<a class="hub-panel">` entry cards (Commands to `/cli/`, Schemes to `/scheme/`) over a drifting three-blob aurora and a canvas node-graph that spawns packets along soft links. A tiny inline script at the top rewrites incoming hashes: `#scheme=...` redirects to `/scheme/#scheme=...`, any other `#hash` to `/cli/#hash`, so legacy deep links still resolve. The radial-gradient / rich-landing concept was explicitly rejected in favor of this restrained split-panel design; blob trajectories were hand-tuned. Hub-only color tokens (`--hub-scheme-*`, lavender) live inline; the rest come from the shared stylesheet.
