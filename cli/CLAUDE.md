# CLAUDE.md `/cli/` (Commands cheat sheet)

Guidance for the commands sub-app. The root `../CLAUDE.md` has the repo overview, Running/Deployment, and the **shared chrome** (left sidebar switcher, chrome parity / `alignLogo`, first-paint flash handling) that this page inherits. This file covers only what is specific to `/cli/`.

Self-contained: `cli/index.html`, `cli/css/styles.css`, `cli/js/{app,data,contacts}.js`, `cli/js/lib/{sidebar,keys,fresh,commands}.js`. Beside them sit the generated static section pages in `cli/section/` (written by `tools/pages/build.mjs`, never edited by hand) and `cli/css/page.css`, which styles only those pages, on top of `styles.css`. No framework, no bundler. The only runtime dependency is Google Fonts.

## Architecture

**`js/data.js`**: all content: `SECTIONS` array, `ICONS` object, `COPY_ICON`/`CHECK_ICON`/`STAR_ICON`/`LINK_ICON`/`DOCS_ICON`/`CONTACT_ICON`/`SPONSOR_ICON` SVGs.

**`js/contacts.js`**: optional file. Exports `CONTACTS`, `SPONSOR`, and `GITHUB` config objects, dynamically imported by `app.js` at runtime; if absent the header renders without those buttons and everything else works. Delete it to ship without GitHub/Contacts/Sponsor. Structure:
```js
export const CONTACTS = { enabled: true, links: [{ label, href, icon }] };
export const GITHUB   = { enabled: true, label, href, icon };
export const SPONSOR  = { enabled: true, donate: { label, href, icon }, wallets: [{ coin, net, addr }] };
```
The three header buttons are ghost-style: GitHub is a plain `<a>`, Contacts and Sponsor open dropdown popovers (click-outside or `Esc` closes). Wallet rows copy the full `addr` despite truncated display, reusing the `COPY_ICON`/`CHECK_ICON` pattern. `.header-actions` carries `margin-left: auto`. The same `contacts.js` is also lazily imported by the root hub.

**`js/app.js`**: runtime logic.
- `GROUPS` maps top-level group keys (`kubernetes`, `tools`, `troubleshooting`, `starred`) to arrays of category keys. `starred` is a pseudo-group with an empty array: it carries no categories and is filtered per-command via the in-memory `starred` Set.
- `CATEGORIES` maps category keys (`installation`, `cluster`, `workloads`, `helm`, `kustomize`, `k9s`, `troubleshooting-kubernetes`, `troubleshooting-tools`) to section ID arrays. Order inside a category array = order in the sub-nav.
- `GROUP_LABELS` / `CATEGORY_LABELS` provide display names; helpers `groupOfCategory(cat)` and `categoryOfSection(id)` do reverse lookups.
- `SUB_LABELS` is auto-derived from `SECTIONS`, no manual maintenance.
- `hl()` and `sortCmds()` live in `js/lib/commands.js`, shared with the static section pages so they show exactly what this page does. `hl()` tokenizes commands into highlighted HTML spans (HTML-escaped, XSS-safe). A flag (any token starting with `-`) or a token of 30 characters or fewer is wrapped whole in an unbreakable inline-block `.tok`, so a line never breaks inside `--token` or `$(id -u)`. A longer token (a URL, a path) stays inline with a `<wbr>` after every `/`, because the browser offers no break after a slash on its own, and `.cmd-code` carries `overflow-wrap: anywhere` for the rare token wider than the line. `applyMark()` matches inside one text node and a `<wbr>` splits the node, so a search whose query contains `/` re-renders with `hl(raw, { slashBreaks: false })`.
- `sortCmds()` sorts commands by subcommand, then flag count, then full string.
- All content renders into `<main id="main">` on `init()`; copy and star clicks handled by event delegation on `main` (star wins over copy when both are clicked).
- Search input is debounced (~80ms) and re-runs `hl()` plus `<mark>` highlighting on each keystroke.
- `renderHeaderActions(CONTACTS, SPONSOR, GITHUB)` renders the GitHub link plus Contacts and Sponsor dropdowns into `#headerActions`.
- `alignSubNav()` runs after `renderSubNav()` and on resize, computing the X of the first cat-btn in the mid row and applying matching `padding-left` to `navSubInner` (plus a 6px `SUB_NUDGE`). The sub row's leftmost chip thus always starts at the same X regardless of active category.
- `alignLogo()` centers the logo icon over the "All" button (skipped at <=900px), re-run on RAF, resize, and after `document.fonts.ready`.
- Separately, at module top level, `app.js` awaits one painted frame before building the heavy command list (first-paint flash mitigation, see root).

## Navigation: three sticky rows below the header

- **Top (`#navTop`)** always visible: All | Kubernetes | Tools | Troubleshooting | ... | Starred. `.top-btn` 33px tall. Both "All" buttons (top and mid) anchored to `min-width: 48px` so their right edges and the trailing `nav-sep` align across rows. The Starred button is pushed far-right via `margin-left: auto` into a "personal zone".
- **Mid (`#navMid`)** visible when a normal group is selected (hidden in Starred mode). Mirrors top: leading "All" + nav-sep + category buttons (`.cat-btn` 29px, opacity 0.9 idle / 1 active+hover). Carries `data-group="<group>"`.
- **Sub (`#navSub`)** visible only when a category is selected. Compact section chips (`.sec-btn` 24px, opacity 0.75 idle / 1 active+hover). Semi-transparent whisper layer (`rgba(17,15,31,0.55)` + `backdrop-filter: blur(14px)`). No "All" button; default state is "all sections of category". Carries `data-cat="<category>"`.

Each row is sticky and presents as one continuous block with no visible 1px borders. Separation comes from a soft lavender gradient `::before` at the bottom of `nav-top` and `nav-mid` (`rgba(221,202,250,0.2)` peak, transparent edges). A `box-shadow: 0 1px 0 0 <bg>` on every `.nav` extends each row's bg 1px downward to fill any sub-pixel gap on scroll. `nav-sub` overrides bg and shadow at 0.55 alpha.

**Color flow.** Top buttons stay monotone lavender (`--accent`) by default (global navigation). When a category is selected, JS sets `data-cat="<category>"` on the active top-btn and CSS `.top-btn.active[data-cat="..."]` tints it with the category color. Switching groups (`applyGroup`) clears `data-cat` from every top-btn so the tint resets. The Starred button is intentionally exempt (no rule) so it stays lavender. Re-clicking the active category collapses the sub row; re-clicking the active section deselects. Each section in `<main>` carries `data-cat` and `data-group` so CSS can theme by either. `applyGroup` clears mid+sub (skips `renderMidNav` for `starred`), `applyCategory` opens/closes the sub row and propagates the tint, `applySub` only toggles `.active` on chips. `applyCategory`/`applySub` are toggles.

**URL hash routing.** `applyGroup`/`applyCategory`/`applySub` write to `history.replaceState`. `restoreFromHash()` resolves any `#hash` to its level (group/category/section IDs are all unique). Deep links like `/cli/#pod`, `/cli/#workloads`, `/cli/#kubernetes`, `/cli/#starred` all work and auto-select parent levels.

**Keyboard.** `/` focuses the search field and selects its text (skipped while typing in a field or with Ctrl/Cmd/Alt held). `Esc` clears the search field. `?` opens the keyboard-shortcuts sheet (`js/lib/keys.js`, see the root `CLAUDE.md`), and while it is open the page ignores its other keys. `/` and `?` go through `isSlash` / `isQuestion`, so they work on a Russian layout too. The search field shows a `/` hint (`.search-kbd`) while it is empty and unfocused.

## Starred commands

A 4th top-row button **Starred** (rightmost) hosts a favourites view. Each command card has a `.star-btn` left of `.copy-btn`; clicking toggles a star. State persists in `localStorage` under `kube-how:starred:v1` (JSON array of raw command strings), loaded into an in-memory `Set` at boot, written back on every toggle (try/catch, degrades to session-only).

Starred mode is a **filter, not a separate render path**. `applyGroup('starred')` adds `body.starred-mode`, hides nav-mid/nav-sub, and `applySearch()` ANDs in a `starred.has(rawCmd)` predicate. Existing card-empty / section-empty roll-up then collapses what becomes empty for free. Search still works inside Starred mode. `#starred` deep-links work because `starred: []` is in `GROUPS` and `'Starred'` in `GROUP_LABELS`; `sectionInScope` short-circuits to `true` for `activeGroup === 'starred'`.

**New commands.** A command this browser had not seen on its previous visit carries `.cmd-item.is-new`, drawn as a `NEW` pill after the description by `.cmd-desc::after` (a pseudo-element, so `applySearch()` resetting the description text cannot wipe it). The section header gets an `N new` chip at the start of `.section-meta`. Copying a command clears it everywhere it appears and recounts the chips (`clearNew()`). The rule itself lives in `js/lib/fresh.js`, see the root `CLAUDE.md`.

Identity key is the **raw command string**. Commands that appear in two sections toggle in lockstep: `toggleStar()` updates every `.cmd-item[data-raw="..."]` in the DOM (selector built via `escapeAttr()`). The active Starred top-btn stays lavender. The cyan `--starred-color` is reserved for the inline star icon: gray hollow by default, cyan filled + glow when starred. On touch screens `.star-btn` enlarges to 44x44 and `.cmd-item` padding-right grows to match. Empty state: `#emptyState` swaps to a star-icon variant ("No starred commands yet...") in Starred mode, and is reused for "No results for ..." otherwise.

## Section count badge

Each `.section-header` carries a right-aligned `.section-count` chip showing `N commands` (`N command` for n=1), computed in `renderSection()` by summing `g.cmds.length`. Rectangular, JetBrains Mono 13px @ 600, colored by the section's category tokens (lavender fallback). It shows the section total, not the visible-after-filter count, so it does not react to search or Starred mode.

The count sits in a `.section-meta` wrapper (which carries the `margin-left: auto`) together with `.section-version`, the quiet `version` label from the section data, in `--text-dim` mono 12px like the `k8s` label on scheme cards. Beside the title, `.section-actions` holds up to three icon buttons, always visible in `--text-muted`: `.section-link` copies `<origin>/cli/#<section-id>` and shows the shared toast, a book icon opens the section's `docs` URL in a new tab, and a flag icon opens a new GitHub issue prefilled by `reportUrl(section)` (title `[cli] <section>: `, a body naming the section, its link, and empty `Command:` / `What is wrong:` lines). At <=680px `.section-header` wraps, so a long title with its actions drops the version and count to a second, right-aligned line instead of clipping them.

## Sections

The section list (id, title, group, category) is `SECTIONS` in `js/data.js` plus the `CATEGORIES`
map in `js/app.js`. Array order in `SECTIONS` = display order in "All" view: Installation, Cluster, Workloads (kubernetes), Helm, Kustomize, K9s (tools), Troubleshooting Kubernetes, Troubleshooting Tools (always last). The `sub` field on each section is the capitalised category label shown in the section header.

## Editing content

**Adding commands:** edit only `SECTIONS` in `js/data.js`. Each group has `cmds: [{ cmd, desc }]`. Every group needs a `desc`. Commands sort automatically. Then run `node tools/pages/build.mjs` from the repo root: every section has a static page `/cli/section/<id>/` built from the same data, and `npm test` in `scheme/test` fails while one is stale. Every section's `sub` label has to be a key of `CLI_CAT` in the generator, which throws if it is not, so only a section that brings a NEW label (a new category, below) needs an entry there.

**Adding a section to an existing category:** add it to `SECTIONS` (with `sub` matching the category label) at the right position, then add its ID to the right `CATEGORIES.<category>` array in `js/app.js`. Give it a `version` (the tool and release its commands were checked against, e.g. `'k8s 1.35'`, `'Helm 4.3'`) and a `docs` URL (the official page for the section, opened from the header's book icon). Both are optional in code, a section without them just renders without the label or the icon, so nothing fails when one is forgotten.

**Changing a command string:** a saved star is keyed on the raw string, so a rewritten command loses its star silently. Add the old string to `STAR_RENAMES` in `js/app.js`, mapped to the new one, and the star follows it on the next load. A deleted command needs no entry.

**Adding a new category to an existing group:**
1. Add sections to `SECTIONS` in `js/data.js`.
2. Add a key + array to `CATEGORIES` in `js/app.js`.
3. Add the category key to the parent `GROUPS.<group>` array.
4. Add label to `CATEGORY_LABELS`.
5. Add `--<cat>-color/glow/border` vars in `:root` in `css/styles.css`.
6. Add `.cat-btn.active[data-cat="<cat>"]`, `.top-btn.active[data-cat="<cat>"]`, and `#navSub[data-cat="<cat>"] .sec-btn.active` rules.
7. Add `.section[data-cat="<cat>"]` color rules (header underline, icon, `.section-count` chip, sub label, card hover, card-desc separator, cmd-item hover stripe).
8. In `tools/pages/build.mjs`, add the category's `sub` label to `CLI_CAT` (mapped to `[<cat>, <group>]`) and a case in `cliHeading()` unless its default heading (`<title> commands`) fits, then rerun the generator.

**Adding a new top-level group:** define categories first, then add a key + array to `GROUPS`, a label to `GROUP_LABELS`, a `<button class="nav-btn top-btn top-<group>" data-group="<group>" ...>` in `index.html`. No colour vars of its own (a group has no hue, see Color system), no `.top-<group>.active` rule (top buttons stay monotone), no nav-mid border tint, no keyboard shortcut.

## Responsive breakpoints

Three nav rows: top (inner 41px), mid (38px), sub (32px whisper). Sticky offsets per breakpoint (these account for the header's 1px border-bottom; navs have no border, only a `box-shadow` filler):
- **Desktop**: `nav` (top) `top: 69px`, `nav-mid` `110px`, `nav-sub` `148px`. `.section` `scroll-margin-top: 192px`.
- **<=900px** (header becomes two rows: logo row 1, search + actions row 2, icon-only labels): `nav` `110px`, `nav-mid` `151px`, `nav-sub` `189px`, `scroll-margin-top: 233px`.
- **<=680px**: cards grid collapses to one column.
- **<=400px**: logo + action buttons shrink (`height: 30px`). `nav` `97px`, `nav-mid` `138px`, `nav-sub` `176px`, `scroll-margin-top: 220px`.

On touch (`@media (hover: none)`), `top-btn`/`cat-btn`/`sec-btn` get tighter min-heights (40/34/28), and the star and copy buttons grow to 44x44 (see Starred commands). On every screen `.main` has padding-top 20px and `.section-header` padding-bottom 6px, margin-bottom 10px.

## Conventions

**Group names:** use "Manage" (not "Create & Delete") for mutation-heavy groups; "List & Inspect" (not "View") for read-only groups, always last.

**Duplicate commands:** troubleshooting sections take priority. Remove duplicates from main sections, keep in troubleshooting. Exceptions: `kubectl describe pod` stays in Pods; `kubectl get all -n` stays in Namespaces; `kubectl api-resources` and `kubectl explain` exist in both `cluster-health` (discovery framing) and `troubleshooting-cluster` (debug framing) on purpose; `kubectl debug -it <pod> --image=nicolaka/netshoot --target=<container> --profile=general` exists in both `troubleshooting-cluster` and `troubleshooting-network`; `helm history` and `helm status` live only in `troubleshooting-helm`.

**Troubleshooting philosophy.** Cards must be genuinely diagnostic, not duplicates of `get`/`describe`. Prefer `exec`-based checks, unique flags (`--previous`, jsonpath for `lastState`/`restartCount`), debug tools (`kubectl debug`, `nicolaka/netshoot`), and cluster-wide one-liners (events by time, pods by restart count).

## Color system

Two families, one tier per member, all CSS custom properties in `:root` in `css/styles.css`. There are no group-level `--<group>-*` vars: a top-btn is monotone lavender and tints only via `data-cat` routing to the category color.
- **Category-level** `--<cat>-color/glow/border`: mid-row active button, sub-row active chip, per-section chrome.
- **TS-pseudo-category** `--ts-kubernetes-*` (red) and `--ts-tools-*` (coral): explicit selectors, no `^=` prefix matching.

Palette: Installation `#7d86ff`, Cluster `#5cb1ff`, Workloads `#4fe5ff`; Helm `#fffb7a`, Kustomize `#ffd15c`, K9s `#ffa04d`; TS-Kubernetes `#ff5757`, TS-Tools `#ff668c`; `--starred-color` `#5cd9ff` (star icon only). When changing a color, update all three vars AND grep for hardcoded rgba in gradient rules (`section-header::after`, `card-desc::after`, sub-nav fade), since CSS cannot vary opacity on a custom property inside a gradient.

Brightness ladder: top-row text opacity 1, mid 0.9, sub 0.75; hover/active restore to 1. Syntax-highlight tokens in `hl()`: pos 0 = `hl-cmd` (binary), pos 1 non-flag = `hl-sub`, pos 2 lowercase = `hl-res`, `--flag` = `hl-flag`, `--flag=val` splits to `hl-flag` + `hl-val`, `<placeholder>` = `hl-ph`, `'str'`/`{json}` = `hl-str`, `-- | > >>` = `hl-sep`. `--workloads-color` drives Kubernetes-group chrome; `--hl-cmd` is only for highlighting (intentionally separate).
