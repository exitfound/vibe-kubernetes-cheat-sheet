# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the project

```bash
python3 -m http.server 8888 --bind 0.0.0.0
```

No build step. Plain HTML/CSS/JS served as static files. Intended for deployment on GitHub Pages with custom domain `kube.how`.

Docker (production-like, nginx):

```bash
docker build -t kube-cheatsheet .
docker run -d --name kube-cheatsheet -p 8080:80 kube-cheatsheet
```

nginx config lives in `configs/nginx.conf` and is copied into the image at build time. It is not served as a static file.

## Architecture

Single-page app with no framework, no bundler, no dependencies except Google Fonts (Space Grotesk + JetBrains Mono).

**`data.js`** holds all static content, imported as an ES module by `app.js`:
- `SECTIONS` array: the entire cheat sheet data (all sections, groups, commands)
- `ICONS` object: SVG icon strings keyed by section id
- `COPY_ICON` / `CHECK_ICON`: SVG strings for the copy button states

**`app.js`** is the runtime core, imports from `data.js` and handles all logic:
- `CATEGORIES` maps top-level nav keys (`workloads`, `cluster`, `helm`, `k9s`, `troubleshoot`) to arrays of section IDs
- `SUB_LABELS`: auto-derived from SECTIONS via `Object.fromEntries(SECTIONS.map(s => [s.id, s.title]))`, no manual maintenance needed
- `hl()` tokenizes and syntax-highlights command strings into HTML spans
- `sortCmds()` sorts commands within a group by subcommand, then flag count, then full string
- `renderSection/renderCard/renderCmd()` build the DOM from data
- `renderSection()` derives `data-cat` from `CATEGORIES` and sets it on each `<section>`, used for category-colored CSS
- `applyTop()` / `applySub()` handle the two-level navigation state
- `applySearch()` filters visible sections/cards/items by query string; `applyMark()` wraps matches in `<mark>`
- `alignLogo()` aligns the logo icon center precisely over the "All" nav button, recalculates on resize and `fonts.ready`
- All content is rendered into `<main id="main">` on `init()`

**Two-level navigation:**
- Top row: All | Workloads | Cluster | Helm | K9s | Troubleshooting
- Sub row: appears for any top category. Workloads has 11 sub-sections, Cluster has 3, Helm has 2 (Releases, Charts), K9s has 2 (CLI & Launch, UI Shortcuts), Troubleshooting has 3 (Kubectl, K9s, Helm)
- Sub-nav buttons are generated dynamically from `CATEGORIES` + `SUB_LABELS`, no HTML changes needed when adding a sub-section
- State is held in `activeTop` and `activeSub` module-level vars

**Keyboard shortcuts:**
- `1` = All, `2` = Workloads, `3` = Cluster, `4` = Helm, `5` = K9s, `6` = Troubleshooting
- `/` focuses search, `Esc` clears and blurs search

**Adding a new top-level category** requires:
1. Add section objects to `SECTIONS` in `data.js` with unique `id` values
2. Add the category to `CATEGORIES` in `app.js` with its section IDs
3. Add the keyboard shortcut to `TOP_KEYS` in `app.js`
4. Add `<button class="nav-btn top-btn top-<name>" data-top="<name>" aria-expanded="false">` in `index.html`
5. Add `.top-<name>.active` color rule in `styles.css`
6. Add category color rules for `.section[data-cat="<name>"]` (icon, sub label, header underline, cmd-item hover border, card-desc separator)
7. Add `#navSub[data-cat="<name>"] .nav-btn.active` rule in `styles.css`

**Adding a new workloads sub-section** requires only:
1. Add the section object to `SECTIONS` in `data.js` at the correct position (array order = display order in "All" view)
2. Add the ID to `CATEGORIES.workloads` in `app.js` at the correct position (array order = sub-nav order)

**Adding commands:** edit only `SECTIONS` in `data.js`. Each section has `groups[]`, each group has `cmds[]` with `{ cmd, desc }`. Every group must have a `desc` field. Commands within each group are sorted automatically by `sortCmds()`.

**Duplicate commands policy:** troubleshooting sections take priority. Remove duplicates from the main section, keep in troubleshooting. Exceptions: `kubectl describe pod` stays in Pods, `kubectl get all -n` stays in Namespaces. For Helm: `helm history` and `helm status` live only in `troubleshoot-helm/Failed Releases`.

**Group naming conventions:**
- Use "Manage" (not "Create & Delete") when a group contains mutations beyond simple create/delete (e.g. scale, rollout, patch, label)
- Use "List & Inspect" (not "View") for the read-only listing group; always place it last among a section's groups
- No em-dashes anywhere in the project: not in group titles, not in `desc` fields, not in any user-visible text, not in any file. Rephrase sentences to avoid needing them entirely.

## Sections

| id | title | category |
|---|---|---|
| `pod` | Pods | workloads |
| `deployment` | Deployments | workloads |
| `statefulset` | StatefulSets | workloads |
| `daemonset` | DaemonSets | workloads |
| `service` | Services | workloads |
| `config` | ConfigMaps & Secrets | workloads |
| `job` | Jobs & CronJobs | workloads |
| `volume` | Volumes | workloads |
| `network` | Networking | workloads |
| `rbac` | RBAC | workloads |
| `namespace` | Namespaces | workloads |
| `cluster-health` | Cluster Health | cluster |
| `node` | Nodes | cluster |
| `context` | Contexts | cluster |
| `helm-releases` | Releases | helm |
| `helm-charts` | Charts | helm |
| `k9s-cli` | CLI & Launch | k9s |
| `k9s-ui` | UI Shortcuts | k9s |
| `troubleshoot-kubectl` | Kubectl | troubleshoot |
| `troubleshoot-k9s` | K9s | troubleshoot |
| `troubleshoot-helm` | Helm | troubleshoot |

The `sub` field on each section shows the category label (e.g. `'Workloads'`, `'Cluster'`, `'Helm'`, `'K9s'`, `'Troubleshooting'`). Always capitalised. This label appears in the section header below the section title.

Physical order in the `SECTIONS` array controls display order in the "All" view. Current order: Workloads sections, then Cluster sections, then Helm sections, then K9s sections, then Troubleshooting sections. Troubleshooting is always last.

## Logo & favicon

**Header logo:** isometric cube SVG (`viewBox="0 0 40 40"`) with three gradient polygon faces (top/left/right) and edge lines. Defined inline in `index.html`.

**Favicon** (`favicon.svg`): dark rounded square (`rx="7"`) with a `>_` terminal prompt symbol in a blue-to-purple gradient.

**OG image** (`images/og-image.png`, source in `images/og-image.svg`): 1200x630 social preview in site style. Cube logo, title, command cards with syntax highlighting, search bar mockup. The `og:image` meta tag points to `https://kube.how/images/og-image.png`. When editing `images/og-image.svg`, export to PNG manually (no build step).

## Color system

All colors are CSS custom properties in `:root` in `styles.css`. Current values:

```
--bg:            #110f1f
--bg-card:       #1a1538
--bg-card-hover: #1e1a38
--border:        #2e274e
--border-subtle: #1e1935
--text:          #dbd8ef
--text-bright:   #f2f0fc
--text-muted:    #847fa0
--text-dim:      #9b95b8
--text-nav:      #c9c6e0
--text-card-desc:#c4bedc
--accent:        #e0cdff
--accent-hover:  #ede0ff
--accent-glow:   rgba(224, 205, 255, 0.16)
--accent-border: rgba(224, 205, 255, 0.28)
--helm-color:    #f0c8ee
--helm-glow:     rgba(240, 200, 238, 0.14)
--helm-border:   rgba(240, 200, 238, 0.28)
--cluster-color: #6ac4be
--cluster-glow:  rgba(106, 196, 190, 0.12)
--cluster-border:rgba(106, 196, 190, 0.25)
--troubleshoot-color: #f0a84a
--k9s-color:     #e8d44a
--k9s-glow:      rgba(232, 212, 74, 0.12)
--k9s-border:    rgba(232, 212, 74, 0.25)
--bg-nav:        #110f1f
--toast-bg:      #1e1438
--toast-text:    #c4a8ff
```

Hardcoded `rgba(...)` values in the file mirror the CSS vars. When changing a color variable, also update matching rgba values via grep.

Workloads category color (separate from syntax highlighting):
```
--workloads-color: #8db9ff
```

Syntax highlighting colors:
```
--hl-cmd:  #7aabff   kubectl/helm/k9s binary
--hl-sub:  #f0c860   subcommand (get, apply...)
--hl-res:  #89d468   resource type (pods...)
--hl-flag: #3ecdd8   --flags
--hl-ph:   #e89c50   <placeholders>
--hl-val:  #8796aa   values
--hl-str:  #f06878   'strings'/json
--hl-sep:  #5a6475   -- | > >>
```

`--workloads-color` drives section icons, sub labels, nav button active states, and hover borders for workloads. `--hl-cmd` is only for syntax highlighting of the kubectl/helm/k9s token in commands. They are intentionally separate.

## Category color system

Every section element has a `data-cat` attribute set by `renderSection()` based on the `CATEGORIES` lookup. This drives a consistent color system across all UI elements:

| Element | workloads | cluster | helm | k9s | troubleshoot |
|---|---|---|---|---|---|
| Section icon | blue `#8db9ff` | teal `#6ac4be` | pink `#f0c8ee` | yellow `#e8d44a` | orange `#f0a84a` |
| Section sub label | blue 75% | teal 75% | pink 75% | yellow 75% | orange 75% |
| Section header underline | blue gradient | teal gradient | pink gradient | yellow gradient | orange gradient |
| cmd-item hover border | blue | teal | pink | yellow | orange |
| card-desc separator | blue tint | teal tint | pink tint | yellow tint | orange tint |

Nav button active colors and sub-nav active colors mirror the same palette.

When adding a new category, add CSS custom properties in `:root` and apply rules for all five elements, plus the nav button and sub-nav button active states.

## Background & cards

**Page background:** diagonal linear gradient on `html` element with `background-attachment: fixed`:
```css
background: linear-gradient(135deg, #0c1022 0%, #110f1f 50%, #18091e 100%);
```
On mobile (`≤680px`), `background-attachment: scroll` overrides `fixed` — iOS Safari does not support fixed attachment on the html element.
Header and nav use matching hardcoded rgba: `rgba(17, 15, 31, 0.95)` / `rgba(17, 15, 31, 0.96)`.
Scrollbar track uses `#110f1f`. Scrollbar thumb uses `#3a3260`.

**Card backgrounds:** multi-layer gradient (not `--bg-card` flat color). Active style, neutral cool-purple:
```css
background:
  linear-gradient(180deg, rgba(167,139,250,0.05) 0%, transparent 28%),
  linear-gradient(155deg, #1a1538 0%, #161233 55%, #110f28 100%);
```

Alternative variant kept as comment in `styles.css`:
- Variant D (warm magenta-purple): `rgba(240,200,238,0.06)` glow, `#211538 -> #1c1230 -> #16102b`

**Card grid:** `repeat(3, 1fr)` fixed 3-column layout.

**Card separator:** `.card-desc::after` renders a gradient line between group description and command list. Color tint matches the section category.

**Card title:** `14.5px`, weight `700`, uppercase, `letter-spacing: 0.9px`, color `var(--text)`.

**Card hover:** border brightens + subtle glow shadow. Left border stripe on `.cmd-item` uses category color.

**Section header:** `.section-header::after` renders a gradient underline in the category color, separating the section title from the card grid.

## SEO

`index.html` contains full OG and Twitter meta tags. Canonical URL and og:url point to `https://kube.how/`. og:image references `https://kube.how/images/og-image.png`. `sitemap.xml` is present in the project root and referenced in `robots.txt`.

## Syntax highlighter

`hl(cmd)` in `app.js` splits commands by space and classifies each token by position and prefix:
- pos 0: `hl-cmd` (kubectl/helm/k9s)
- pos 1, not a flag: `hl-sub` (get/apply/...)
- pos 2, lowercase: `hl-res` (pods/deployments/...)
- `--flag` or `-f`: `hl-flag`; `--flag=val` splits into `hl-flag` + `hl-val`
- `<placeholder>`: `hl-ph`
- `'strings'`/`{json}`: `hl-str`
- `--`, `|`, `>`, `>>`: `hl-sep`

## Copy to clipboard

Uses `navigator.clipboard` when available (HTTPS/localhost), falls back to `execCommand('copy')` for plain HTTP access from external IPs.

## UI elements

- **Scroll-to-top button:** fixed `bottom: 24px; right: 8px`, close to scrollbar. Appears after 300px scroll.
- **Toast notification:** shown on copy (`#1e1438` background), auto-hides after 2s.
- **Keyboard shortcuts:** `/` focuses search, `Esc` clears it, `1`-`6` switch top nav tabs (1=All, 2=Workloads, 3=Cluster, 4=Helm, 5=K9s, 6=Troubleshooting).
- Shortcuts modal was removed and does not exist in HTML, CSS, or JS.
- **Logo alignment:** `alignLogo()` runs on init and resize, sets `margin-left` on `.logo` so the SVG icon center sits directly above the center of the "All" button. On mobile (`≤680px`) the calculation is skipped and margin is reset to `0` — otherwise the logo flies left when the nav is horizontally scrolled and search is focused.
- **Logo link:** the `.logo` element is an `<a href="/">` — clicking the logo or title returns to the homepage.
- **Search clear button:** `#searchClear` (×) appears inside the search input when text is present. Clicking it clears the input and calls `applySearch('')`. Hidden by default, shown via `.visible` class toggled on `input` event. `Esc` also hides it.
- **Search count:** `#searchCount` element exists in the DOM but is not activated — the clear button replaced it as the right-side search indicator.
- **URL hash / deep linking:** `restoreFromHash()` reads `location.hash` on load and `hashchange`. Top categories (`#workloads`, `#cluster`, `#helm`, `#k9s`) and sub-sections (`#rbac`, `#node`, `#k9s-ui`) both work.
- **Mobile copy button:** `@media (hover: none)` shows copy button at 0.55 opacity (touch devices have no hover state).
- **Sub-nav mobile fade:** `@media (max-width: 1024px)` adds a right-edge gradient on `.nav-sub` via `::after` to hint at horizontal scroll.
- **Mobile header:** `@media (max-width: 680px)` switches to two-row layout — logo row + search row. `.search-container` becomes `position: relative; flex: 0 0 100%`. `.logo-sub` (Quick CLI Reference) stays visible at `font-size: 12px`. At `≤400px` logo-text shrinks to `15px`, icon to `26px`.
- **Print stylesheet:** `@media print` hides nav/header/interactive elements, switches to white background, single-column layout, dark readable text.

## Troubleshooting section philosophy

Troubleshooting cards should contain commands that are genuinely diagnostic, not simple duplicates of `get`/`describe` found in other sections. Priority goes to:
- `exec`-based commands that run inside a container (DNS checks, process inspection, volume verification, traffic diagnostics)
- Commands with unique diagnostic flags not present elsewhere (`--previous`, `--watch`, jsonpath for `lastState`/`restartCount`)
- Commands using debug tools (`kubectl debug`, `nicolaka/netshoot`)
- One-liners that surface problems cluster-wide (events sorted by time, pods sorted by restart count)

Generic `get` and `describe` commands that belong in their respective sections should not be duplicated in troubleshooting.

**`troubleshoot-kubectl` group structure** (6 groups):
1. **Events:** cluster events filtered by object, type, namespace, or sorted by time
2. **Debug Pods:** `kubectl debug`, log inspection, jsonpath state queries, `kubectl wait`
3. **Network & DNS:** DNS resolution, HTTP/TCP connectivity, listening ports and sockets (all `exec`-based)
4. **Container Internals:** processes, memory limits, env vars, volume mounts, disk usage (all `exec`-based)
5. **Cluster Health:** `cluster-info`, `cluster-info dump`, `get componentstatuses`, `version`
6. **Pod Queries:** field-selector queries, sorting one-liners, job status jsonpath

**`troubleshoot-helm` group structure** (2 groups):
1. **Failed Releases:** `helm list --failed`, `helm history`, `helm status`
2. **Inspect & Debug:** `helm get *`, `helm lint`, `helm template --debug`, `helm test`

**`troubleshoot-k9s` group structure** (3 groups):
1. **Diagnose K9s:** `k9s info` (prints all runtime paths), `k9s version`, `--logLevel debug`, `--readonly`
2. **K9s Logs:** `tail -f` the K9s log file on Linux (`~/.local/share/k9s/k9s.log`) and macOS (`~/Library/Logs/k9s/k9s.log`), plus grep for errors
3. **Permission Errors:** `kubectl auth can-i` commands to diagnose RBAC errors that K9s surfaces in its UI

## K9s section

K9s is a terminal UI for Kubernetes. It was added as a top-level nav category with two sub-sections:

**`k9s-cli` (CLI & Launch)** (2 groups):
1. **Install K9s:** Homebrew, official webi script, and direct binary install via curl/tar from GitHub releases (Linux amd64 example)
2. **Launch Options:** flags for context, namespace, kubeconfig, readonly, log level, refresh interval, impersonation (`--as`, `--as-group`), cluster name override, user override, and TLS skip

**`k9s-ui` (UI Shortcuts)** (6 groups):
1. **Global Shortcuts:** `:`, `?`, `Ctrl+a`, `Ctrl+d`, `Ctrl+e`, `Ctrl+l`, `q`
2. **Table Navigation:** `j`/`k`, `g`/`G`, `Ctrl+f`/`Ctrl+b`, `/`, `Esc`, `Enter`, `l`
3. **Resource Views:** `d`, `e`, `v`, `y`, `Ctrl+y`, `x`
4. **Resource Actions:** `Ctrl+d`, `Ctrl+k`, `s`, `u`, `r`, `Shift+r`
5. **Pod Actions:** `a`, `t`, `f`, `Shift+f`, `p`, `i`, `Ctrl+p`
6. **Log View:** `0`-`9`, `1`-`9` (container switch), `f`, `p`, `s`, `Shift+f`, `w`

K9s color in CSS: `--k9s-color: #e8d44a` (yellow). Category key in `CATEGORIES`: `k9s`.
