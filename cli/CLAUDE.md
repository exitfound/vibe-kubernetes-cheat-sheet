# CLAUDE.md `/cli/` (Commands cheat sheet)

The root `../CLAUDE.md` covers running, shipping, the shared chrome and the working discipline.
This file covers what is specific to `/cli/`: the data contracts, the editing recipes and the
invariants the code does not show.

Files: `index.html`, `css/{chrome,styles,page}.css`, `js/{app,data,contacts}.js`, `js/lang/ru.js`,
`js/lib/{chrome,sidebar,keys,fresh,lang,commands}.js`. `chrome.css` and
`lib/{chrome,sidebar,keys,fresh,lang}.js` are the site-wide chrome, loaded from here by every page. `page.css` styles only the generated
static pages in `section/` (on top of `styles.css`), which are never edited by hand.

## Data

- `js/data.js` holds all content: `SECTIONS`, an array of `{ id, title, icon, sub, version, docs,
  groups: [{ title, desc, cmds: [{ cmd, desc }] }] }`. Array order is the display order of "All".
  `sub` is the category label shown in the section header.
- `js/app.js` holds the navigation maps: `GROUPS` (group key to category keys, `starred` is a
  pseudo-group with no categories), `CATEGORIES` (category key to section ids, in sub-nav order),
  `GROUP_LABELS`, `CATEGORY_LABELS`. `SUB_LABELS` derives from `SECTIONS`. Group, category and
  section ids share one namespace, so any `#hash` resolves to its level. `HASH_REDIRECTS` maps
  retired section ids.
- `js/contacts.js` is optional. `setupHeader()` in `js/lib/chrome.js` imports it on every page, and
  without it the header renders no GitHub, Contacts or Sponsor button. Shape:

```js
export const CONTACTS = { enabled: true, links: [{ label, href, icon }] };
export const GITHUB   = { enabled: true, label, href, icon };
export const SPONSOR  = { enabled: true, donate: { label, href, icon }, wallets: [{ coin, net, addr }] };
```

- `js/lang/ru.js` is `RU`, the Russian for every group `desc` and command `desc`, keyed by the
  exact English text and imported only while Russian is on (root `CLAUDE.md`, Language). A switch
  rewrites the descriptions in place, search matches both languages while Russian is on, the PDF follows the switch.
  The static section pages stay English.
- `js/lib/commands.js` (`hl()`, `sortCmds()`) is shared with the static pages, so both show a
  command the same way. A flag or a token of 30 characters or fewer never breaks inside, a longer
  token breaks after each `/`. A search whose query holds `/` re-renders with
  `hl(raw, { slashBreaks: false })`, because `applyMark()` matches inside one text node.

## Behaviour a reader of the code can miss

- **Navigation.** Three sticky rows: group, category, section. Clicking the active category or
  section again deselects it. The top row stays lavender and only the active button takes the
  category tint, through `data-cat`. `applyGroup` clears it. Starred has no tint rule on purpose.
  Every level writes the hash with `replaceState`, so `/cli/#pod`, `#workloads`, `#kubernetes`
  and `#starred` deep-link.
- **Starred** is a filter, not a render path: `applySearch()` ANDs `starred.has(rawCmd)`, and the
  empty-card and empty-section roll-up does the rest. A star is keyed on the raw command string in
  `kube-how:starred:v1`, so a command listed in two sections toggles in both. The star icon
  takes its section's category tint (`--sec-*`). The cyan `--starred-color`, shared with `/diagrams/`,
  is only the fallback of a star with no section tint: the Starred nav button stays lavender here and
  on `/diagrams/`.
- **NEW** is the `.cmd-desc::after` pseudo-element on `.cmd-item.is-new`, so `applySearch()`
  rewriting the description cannot wipe it. A copy clears it everywhere (`clearNew()`). The rule is
  `js/lib/fresh.js` (root `CLAUDE.md`).
- **Section header.** The count is the section total and ignores search and Starred. The title
  links to `/cli/section/<id>/`. The actions copy that link, open `docs` and open a prefilled GitHub
  issue (`reportUrl`). `version` and `docs` are optional: a section without them simply lacks the
  label or the icon.
- **PDF.** After `setupHeader()`, `addPdfButton()` prepends a PDF button. It lays every command out
  as A4 sheets in a hidden iframe (`buildBook()`, the dark `.print-dark` look) and prints that.
  Ctrl+P prints the current view in a paper theme, the `@media print` block in `styles.css`.
  `fitPlaceholder()` shortens the search placeholder when the five header buttons crowd it, and
  empties it when even the short one does not fit (320px): the magnifier and the aria-label remain.
- **Sticky offsets.** The three rows stack under the header at fixed `top` values per breakpoint
  (desktop, <=900px, <=400px), and `.section` `scroll-margin-top` is their sum. A change to the
  header or a row height changes every one of them. On a phone held sideways (<=900 wide, <=500
  tall) only the header and the group row stay pinned, the category and section rows scroll away.
  The right-edge fade on a row shows only while it overflows (`watchNavFade()` in `js/lib/chrome.js`).
- **Keys.** `/` focuses and selects the search, `Esc` clears it, `?` opens the shortcuts sheet,
  and while it is open the page ignores its own keys. `/` and `?` go through `isSlash` and
  `isQuestion`.

## Editing content

**Commands.** Edit `SECTIONS`. Every group needs a `desc`, commands sort themselves. A new or
reworded `desc` needs its line in `js/lang/ru.js` (`unit/cli-i18n.test.mjs` names the missing ones). Then run
`node tools/pages/build.mjs` from the repo root, and `npm run docs:sync` in `diagrams/test` when the
command count changed.

**A rewritten command** loses its star silently: map the old string to the new one in
`STAR_RENAMES` in `js/app.js`. A deleted command needs no entry.

**A section in an existing category.** Add it to `SECTIONS` at its position, with `sub` set to the
category label, a `version` (the release its commands were checked against, e.g. `'k8s 1.36'`) and
a `docs` URL. Add its id to `CATEGORIES.<category>`. Add it to the table in `cli/README.md`.

**A new category in an existing group:**
1. Sections in `SECTIONS`, a key and its array in `CATEGORIES`, the key in `GROUPS.<group>`, a label
   in `CATEGORY_LABELS`.
2. `--<cat>-color/glow/border` in `:root` of `css/styles.css`, and the print colour in its
   `@media print` block.
3. The `.cat-btn.active`, `.top-btn.active` and `#navSub .sec-btn.active` rules keyed on
   `data-cat="<cat>"`, and the `.section[data-cat="<cat>"]` colour rules.
4. In `tools/pages/build.mjs`, the `sub` label in `CLI_CAT` (the generator throws without it) and a
   case in `cliHeading()` unless `<title> commands` fits. Rerun the generator.
5. A row in `cli/README.md`, and `npm run docs:sync` (the README states the category count).

**A new top-level group.** Categories first, then `GROUPS`, `GROUP_LABELS` and a
`<button class="nav-btn top-btn top-<group>" data-group="<group>">` in `index.html`. A group has no
colour of its own and no keyboard shortcut.

## Conventions

- **Group names.** "Manage" for mutation, "List & Inspect" for read-only, which comes last except
  where a discovery group follows it (`crd` ends on "API Discovery").
- **Duplicates.** A command lives in one main section. A Troubleshooting section may repeat a
  command from a main section when it is part of the diagnosis there, and `cluster-health`, `crd`
  and `troubleshooting-cluster` all carry `kubectl api-resources` and `kubectl explain` in their own
  framing. `helm history` and `helm status` live only in `troubleshooting-helm`.
- **Troubleshooting** cards are diagnostic, not copies of `get` and `describe`: `exec` checks,
  flags such as `--previous`, jsonpath on `lastState` and `restartCount`, `kubectl debug` with
  `nicolaka/netshoot`, cluster-wide one-liners.

## Colour

Every colour is a custom property in `:root` of `css/styles.css`, one family per category
(`--<cat>-color/glow/border`) and two Troubleshooting families (`--ts-kubernetes-*`,
`--ts-tools-*`) matched by explicit selectors, never a `^=` prefix. There are no group colours.
`--workloads-color` drives the Kubernetes-group chrome, while `--hl-cmd` is for highlighting only.
When a colour changes, change its three vars, its print value, and the hardcoded rgba in the
gradient rules (`section-header::after`, `card-desc::after`, the sub-nav fade), since a gradient
cannot vary the opacity of a custom property.
