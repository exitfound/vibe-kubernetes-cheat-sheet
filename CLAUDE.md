# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running

```bash
python3 -m http.server 8888 --bind 0.0.0.0
```

No build step. Static HTML/CSS/JS. Deployed to GitHub Pages at `kube.how`.

Docker (nginx):
```bash
docker build -t kube-cheatsheet .
docker run -d --name kube-cheatsheet -p 8080:80 kube-cheatsheet
```

## Architecture

Single-page app, no framework, no bundler. Dependencies: Google Fonts only (Space Grotesk + JetBrains Mono). All scripts are ES modules loaded directly by the browser via `<script type="module">`.

**`js/data.js`** — all content: `SECTIONS` array, `ICONS` object, `COPY_ICON`/`CHECK_ICON` SVGs.

**`js/contacts.js`** — optional file. Exports `CONTACTS` and `SPONSOR` config objects. Dynamically imported by `app.js` at runtime; if the file is absent the header renders without those buttons and everything else works normally. Delete to ship a build without Contacts/Sponsor.

**`js/app.js`** — runtime logic:
- `GROUPS` maps top-level group keys (`kubernetes`, `tools`, `troubleshooting`) to arrays of category keys.
- `CATEGORIES` maps category keys (`installation`, `cluster`, `workloads`, `helm`, `kustomize`, `k9s`, `troubleshooting-kubernetes`, `troubleshooting-tools`) to section ID arrays. Order inside a category array = order in the sub-nav.
- `GROUP_LABELS` / `CATEGORY_LABELS` provide display names; helpers `groupOfCategory(cat)` and `categoryOfSection(id)` do reverse lookups.
- `SUB_LABELS` is auto-derived from `SECTIONS` — no manual maintenance
- `hl()` tokenizes commands into highlighted HTML spans (HTML-escaped, XSS-safe)
- `sortCmds()` sorts commands by subcommand, then flag count, then full string
- All content rendered into `<main id="main">` on `init()`; copy clicks handled by event delegation on `main`
- Search input is debounced (~80ms) and re-runs `hl()` plus `<mark>` highlighting on each keystroke
- `renderHeaderActions(CONTACTS, SPONSOR)` renders Contacts and Sponsor dropdown buttons into `#headerActions` from `contacts.js` config
- `alignSubNav()` runs after `renderSubNav()` and on resize, computing the X position of the first cat-btn in mid row and applying matching `padding-left` to `navSubInner` (plus a 6px nudge constant). The sub row's leftmost chip thus always starts at the same X regardless of which category is active.

**Navigation:** three sticky rows.
- **Top (`#navTop`)** — always visible: All | Kubernetes | Tools | Troubleshooting (groups). `.top-btn` 33px tall, 16px @ 600, padding 0 13. Both "All" buttons (top and mid) anchored to `min-width: 56px` with padding 0 12 so their right edges align and the trailing `nav-sep` lines up across rows.
- **Mid (`#navMid`)** — visible when a group is selected. Mirrors top: leading "All" + nav-sep + category buttons (`.cat-btn` 29px tall, 15px @ 500, padding 0 13, opacity 0.85 idle / 1 active+hover). Inner row 38px. Carries `data-group="<group>"`.
- **Sub (`#navSub`)** — visible only when a category is selected. Compact section chips (`.sec-btn` 24px tall, 14px @ 500, opacity 0.7 idle / 1 active+hover). Inner row 32px. Semi-transparent: `background: rgba(17,15,31,0.55)` + `backdrop-filter: blur(14px)` so it reads as a softer "whisper" layer below the main rows. No "All" button — default state is "all sections of category". Carries `data-cat="<category>"` so active chip and chevron inherit the category color.

Each row is sticky-positioned and presents as one continuous block with no visible 1px borders. Visual separation comes from a soft lavender gradient `::before` at the bottom of `nav-top` and `nav-mid` (`rgba(221,202,250,0.2)` peak, transparent edges — echoes `card-desc::after`). A `box-shadow: 0 1px 0 0 <bg>` drop on every `.nav` extends each row's bg 1px downward to fill any sub-pixel gap between sticky rows on scroll, so content never peeks through and the rows don't "jump" between scroll states. `nav-sub` overrides both bg and shadow at 0.55 alpha to keep its softer feel.

**Color flow.** Top buttons stay monotone (lavender `--accent`) by default — they're "global navigation". When a category is selected, JS sets `data-cat="<category>"` on the active top-btn and CSS `.top-btn.active[data-cat="..."]` rules tint it with the category's color. Switching groups (`applyGroup`) clears `data-cat` from every top-btn, so the tint resets cleanly.

Re-clicking the active category collapses the sub row (back to all-of-group, top-btn lavender). Re-clicking the active section deselects (back to all-of-category). Each section in `<main>` carries `data-cat="<category>"` and `data-group="<group>"` so CSS can theme by either.

`renderMidNav()` and `renderSubNav()` are separate rendering entries. `applyGroup` clears both, `applyCategory` opens/closes the sub row and propagates the category tint to the active top-btn, `applySub` only toggles `.active` on existing chips. `applyCategory` and `applySub` are toggles: clicking the active item deselects it.

**URL hash routing:** `applyGroup`/`applyCategory`/`applySub` write to `history.replaceState`. `restoreFromHash()` resolves any `#hash` to its level: group keys, category keys, and section IDs are all unique. Deep links like `kube.how/#pod` (section), `kube.how/#workloads` (category), and `kube.how/#kubernetes` (group) all work and auto-select parent levels.

**Keyboard:** `1`–`4` switch top groups (All, Kubernetes, Tools, Troubleshooting), `/` focuses search, `Esc` clears the search field. There is no in-app shortcuts modal — the bindings are intentionally invisible utility.

## Deployment

Two GitHub Actions run on every push to `main`:
- **`deploy.yml`** — stages `index.html`, `css/`, `js/`, `images/`, `favicon.svg`, `robots.txt`, `sitemap.xml`, `CNAME` and publishes to GitHub Pages. Note `configs/` and `Dockerfile` are intentionally excluded — they're for the Docker build, not Pages.
- **`release.yml`** — creates a tagged GitHub Release (`vYYYY.MM.DD-<sha>`) with a ZIP of all shippable assets. Path-filtered to skip docs-only commits.

Any push to `main` ships immediately. There is no staging environment.

## Header actions

Two optional ghost-style buttons on the right side of the header — **Contacts** and **Sponsor** — each opens a dropdown popover anchored below the button. Powered entirely by `contacts.js`; `index.html` and `app.js` need no changes to add or remove them. `.header-actions` carries `margin-left: auto` so it parks at the right edge of the header even when there are no other elements between it and the logo.

**`contacts.js` structure:**
```js
export const CONTACTS = {
  enabled: true,          // false hides the button without deleting the file
  links: [{ label, href, icon }],
};

export const SPONSOR = {
  enabled: true,
  donate: { label, href, icon },
  wallets: [{ coin, net, addr }],  // addr is copied in full despite display truncation
};
```

Dropdown behavior: click outside or `Esc` closes. Copy buttons on wallet rows reuse the existing `COPY_ICON`/`CHECK_ICON` pattern from `data.js`.

## Sections

| id | title | group | category |
|---|---|---|---|
| `install-kubeadm` | Kubeadm | kubernetes | installation |
| `install-k3s` | k3s | kubernetes | installation |
| `install-k3d` | k3d | kubernetes | installation |
| `install-kind` | KinD | kubernetes | installation |
| `install-minikube` | Minikube | kubernetes | installation |
| `cluster-health` | Cluster Health | kubernetes | cluster |
| `node` | Nodes | kubernetes | cluster |
| `crd` | Custom Resources | kubernetes | cluster |
| `context` | Contexts | kubernetes | cluster |
| `pod` | Pods | kubernetes | workloads |
| `deployment` | Deployments | kubernetes | workloads |
| `statefulset` | StatefulSets | kubernetes | workloads |
| `daemonset` | DaemonSets | kubernetes | workloads |
| `service` | Services | kubernetes | workloads |
| `config` | ConfigMaps & Secrets | kubernetes | workloads |
| `job` | Jobs & CronJobs | kubernetes | workloads |
| `volume` | Volumes | kubernetes | workloads |
| `network` | Networking | kubernetes | workloads |
| `rbac` | RBAC | kubernetes | workloads |
| `namespace` | Namespaces | kubernetes | workloads |
| `helm-releases` | Releases | tools | helm |
| `helm-charts` | Charts | tools | helm |
| `kustomize-manage` | Manage | tools | kustomize |
| `kustomize-edit` | Edit | tools | kustomize |
| `k9s-cli` | CLI & Launch | tools | k9s |
| `k9s-ui` | UI Shortcuts | tools | k9s |
| `troubleshooting-installation` | Installation | troubleshooting | troubleshooting-kubernetes |
| `troubleshooting-cluster` | Cluster | troubleshooting | troubleshooting-kubernetes |
| `troubleshooting-network` | Network | troubleshooting | troubleshooting-kubernetes |
| `troubleshooting-storage` | Storage | troubleshooting | troubleshooting-kubernetes |
| `troubleshooting-resources` | Resources | troubleshooting | troubleshooting-kubernetes |
| `troubleshooting-scheduling` | Scheduling | troubleshooting | troubleshooting-kubernetes |
| `troubleshooting-helm` | Helm | troubleshooting | troubleshooting-tools |
| `troubleshooting-kustomize` | Kustomize | troubleshooting | troubleshooting-tools |
| `troubleshooting-k9s` | K9s | troubleshooting | troubleshooting-tools |

Array order in `SECTIONS` = display order in "All" view. Current order: Installation → Cluster → Workloads (kubernetes group), Helm → Kustomize → K9s (tools group), Troubleshooting Kubernetes → Troubleshooting Tools (always last).

The `sub` field on each section is the category label shown in the section header (e.g. `'Workloads'`, `'Cluster'`). Always capitalised.

## Editing content

**Adding commands:** edit only `SECTIONS` in `js/data.js`. Each group has `cmds: [{ cmd, desc }]`. Every group needs a `desc`. Commands are sorted automatically.

**Adding a section to an existing category:**
1. Add section to `SECTIONS` in `js/data.js` at the correct position (with `sub` matching the category label)
2. Add its ID to the right `CATEGORIES.<category>` array in `js/app.js`

**Adding a new category to an existing group:**
1. Add sections to `SECTIONS` in `js/data.js`
2. Add a new key + array to `CATEGORIES` in `js/app.js`
3. Add the new category key to the parent `GROUPS.<group>` array in `js/app.js`
4. Add label to `CATEGORY_LABELS` in `js/app.js`
5. Add `--<cat>-color`, `--<cat>-glow`, `--<cat>-border` vars in `:root` in `css/styles.css`
6. Add `.cat-btn.active[data-cat="<cat>"]`, `.top-btn.active[data-cat="<cat>"]`, and `#navSub[data-cat="<cat>"] .sec-btn.active` rules in `css/styles.css` — the `.top-btn` rule lets the active group button inherit the category tint.
7. Add `.section[data-cat="<cat>"]` color rules in `css/styles.css` (header underline gradient, icon, sub label, card hover, card-desc separator, cmd-item hover stripe)

**Adding a new top-level group:**
1. Define categories first (see above), then add a new key + array to `GROUPS` in `js/app.js`
2. Add label to `GROUP_LABELS` in `js/app.js`
3. Add keyboard shortcut to `TOP_KEYS` in `js/app.js`
4. Add `<button class="nav-btn top-btn top-<group>" data-group="<group>" aria-controls="navMid" aria-expanded="false">` in `index.html`
5. Add `--<group>-color`, `--<group>-glow`, `--<group>-border` vars in `:root` in `css/styles.css` — currently only used as a colour anchor for the family; the top-btn itself stays monotone. Categories under the group should be shades of these values.

No `.top-<group>.active` rule needed (top buttons are intentionally monotone). No nav-mid border tint either (the lavender `::before` separator handles visual flow). No shortcuts-modal row to update — that feature has been removed.

## Responsive breakpoints

Three nav rows: top (groups, inner 41px), mid (categories, inner 38px), sub (sections, inner 32px — semi-transparent whisper row shown only when a category is active). Sticky offsets per breakpoint (these account for header's 1px border-bottom; navs themselves have no border, only a `box-shadow` filler):

- **Desktop** — `nav` (top) at `top: 69px`, `nav-mid` at `top: 110px`, `nav-sub` at `top: 148px`. `.section` uses `scroll-margin-top: 192px` so deep links land below the deepest stack.
- **≤900px** (tablets, iPads, phones in landscape) — header switches to two-row layout: logo fills row 1 full-width; search + action buttons share row 2. Button labels hidden, icon-only. `nav` at `top: 110px`, `nav-mid` at `top: 151px`, `nav-sub` at `top: 189px`, `scroll-margin-top: 233px`.
- **≤680px** (phones) — cards grid collapses to single column; main padding tightened.
- **≤400px** — logo icon and text shrink further; action buttons reduced to `height: 30px`. `nav` at `top: 97px`, `nav-mid` at `top: 138px`, `nav-sub` at `top: 176px`, `scroll-margin-top: 220px`.

On touch screens (`@media (hover: none)`), `top-btn` / `cat-btn` / `sec-btn` get tighter min-heights (40 / 34 / 28) so the context rows stay compact while remaining tappable.

`.main` padding-top is 20px (tightened from 28); `.section-header` has `padding-bottom: 6px` and `margin-bottom: 10px` — global spacing values that apply to every section.

`alignLogo()` in `app.js` skips the logo-centering offset for viewports ≤900px.

## Conventions

**Group names:** use "Manage" (not "Create & Delete") for mutation-heavy groups; use "List & Inspect" (not "View") for read-only groups, always placed last.

**No em-dashes** anywhere in the project — not in group titles, desc fields, or any user-visible text. Rephrase instead.

**Duplicate commands:** troubleshooting sections take priority. Remove duplicates from main sections, keep in troubleshooting. Exceptions: `kubectl describe pod` stays in Pods; `kubectl get all -n` stays in Namespaces; `kubectl api-resources` and `kubectl explain` exist in both `cluster-health` (API discovery framing) and `troubleshooting-cluster` (debug framing) on purpose; `kubectl debug -it <pod> --image=nicolaka/netshoot --target=<container>` exists in both `troubleshooting-cluster` (general debug toolkit) and `troubleshooting-network` (shared net namespace for traffic inspection); `helm history` and `helm status` live only in `troubleshooting-helm`.

## Color system

Three families, one tier per family member. All colors are CSS custom properties in `:root` in `css/styles.css`.

- **Group-level** — `--<group>-color/glow/border`. Anchor colour for the family. The top-btn itself is monotone (lavender `--accent`); the group var defines the family hue but isn't applied directly. When a category is selected, JS adds `data-cat` to the active top-btn and CSS routes that to the matching `.top-btn.active[data-cat="..."]` rule, which uses the **category** colour. So top-btn cycles between lavender (no category picked) and category tint.
- **Category-level** — `--<cat>-color/glow/border`. Drives mid-row active button, sub-row active chip, and per-section chrome (`.section[data-cat="..."]`).
- **TS-pseudo-category** — `--ts-kubernetes-*` and `--ts-tools-*` — the two troubleshooting subgroups have their own tokens (red and coral) so they read as related but distinct shades. Selectors are explicit (`.section[data-cat="troubleshooting-kubernetes"]`, `[data-cat="troubleshooting-tools"]`) — no `^=` prefix matching anywhere.

When changing a color, update all three vars AND grep for hardcoded rgba values in gradient rules (`section-header::after`, `card-desc::after`, sub-nav fade) — CSS can't vary opacity on a custom property inside a gradient.

**Final palette** (canonical values live in `css/styles.css`, mirrored here):

- Kubernetes group `#7dbcff` — Installation `#5cd9ff` (cyan-azure), Cluster `#8e94ff` (indigo), Workloads `#5fb4ff` (sky)
- Tools group `#71dc78` — Helm `#4dd6b1` (mint-teal), Kustomize `#b8e35a` (lime), K9s `#5ed87a` (emerald)
- Troubleshooting group `#ff7e6e` — TS-Kubernetes `#ff6b61` (red), TS-Tools `#ff9171` (coral)

**Brightness ladder.** Top-row text at `opacity: 1`, mid-row text at `opacity: 0.85`, sub-row text at `opacity: 0.7` — fades from bright to dim down the stack. Hover and `.active` always restore opacity to 1 so the picked item is fully readable.

**Row separators.** No `border-bottom` on any `.nav` (was the source of through-bleed gaps on scroll). Visible separators come from `.nav-top::before` and `.nav-mid::before` pseudo-elements: a soft lavender gradient (`rgba(221,202,250,0.2)` peak, transparent edges) absolutely positioned at the bottom 1px of the row, sits inside the box so it survives sticky stack boundaries. Beneath that, every `.nav` has `box-shadow: 0 1px 0 0 rgba(17,15,31,0.96)` (drop) to extend the row's bg one pixel downward and fill any sub-pixel gap with the next row. `.nav-sub` overrides both the bg and the shadow at `0.55` alpha to keep its softer feel. The header keeps its own `--border-subtle` border-bottom.

Syntax highlighting tokens (in `hl()`): pos 0 = `hl-cmd` (binary), pos 1 non-flag = `hl-sub`, pos 2 lowercase = `hl-res`, `--flag` = `hl-flag`, `--flag=val` splits to `hl-flag` + `hl-val`, `<placeholder>` = `hl-ph`, `'str'`/`{json}` = `hl-str`, `-- | > >>` = `hl-sep`.

`--workloads-color` drives Kubernetes-group UI chrome. `--hl-cmd` is only for syntax highlighting. Intentionally separate.

## Troubleshooting philosophy

Troubleshooting cards must be genuinely diagnostic, not simple duplicates of `get`/`describe`. Prefer:
- `exec`-based commands (DNS checks, volume verification, traffic diagnostics)
- Unique flags not elsewhere (`--previous`, jsonpath for `lastState`/`restartCount`)
- Debug tools (`kubectl debug`, `nicolaka/netshoot`)
- Cluster-wide one-liners (events by time, pods by restart count)
