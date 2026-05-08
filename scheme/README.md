# scheme.kube.how — animated Kubernetes architecture diagrams

Sister site to `kube.how`. Same repo. Locally accessible at `/scheme/`, in production hosted on its own subdomain.

This file is the source of truth for what the `scheme/` subproject is, how it's wired up, what's done, and what's next. Read this first before touching `scheme/`.

---

## What it is

Card grid of Kubernetes architecture concepts. Click a card → native `<dialog>` modal opens → SVG diagram plays a step-by-step animation with narration text and play/pause/prev/next/reset/speed controls. Static-only — no backend, no bundler, no framework. ES modules + WAAPI + nativeg `<dialog>`.

Companion to `kube.how` (the CLI cheat sheet). The two are linked via a "Schemes" / "CLI" button in each header.

---

## Hosting plan

**Production target**: Cloudflare Pages free tier, **two projects on one repo**.

| CF Pages project | Root directory | Build command | Output | Custom domain |
|---|---|---|---|---|
| `kube-how`         | `/`        | `mkdir -p _site && cp -r index.html css js images favicon.svg robots.txt sitemap.xml _site/` | `_site` | `kube.how` |
| `scheme-kube-how`  | `/scheme`  | _(none)_ | `.` | `scheme.kube.how` |

Project A's build command intentionally excludes `scheme/` so `kube.how/scheme/` returns 404 in prod (no SEO duplication). Project B serves only `scheme/` content at the subdomain root.

DNS via Cloudflare zone (already used for Web Analytics). Migration from GH Pages: lower TTL → set up CF projects → verify via `*.pages.dev` → flip A/AAAA + add CNAME → drop GH Pages workflow.

**Locally**: same repo, served as one static tree by either `python3 -m http.server` or the existing `kube-cheatsheet` Docker image (nginx). Access scheme at `http://localhost:PORT/scheme/`. **All paths inside `scheme/` are relative**, so the same files work at `/scheme/` (local) and `/` (subdomain prod) without changes.

Cross-link buttons (main ↔ scheme) detect `location.hostname` and pick `localHref` for localhost.

---

## Tech stack

- **HTML/CSS/JS**, ES modules, no bundler, no framework — mirror of main repo philosophy.
- **SVG** for diagrams, hand-built via tiny `js/lib/svg.js` `createElementNS` helper.
- **Web Animations API** for animations, no library needed.
- **Native `<dialog>`** for modal (built-in focus trap, ESC, `::backdrop`).
- **IntersectionObserver, localStorage, URL hash** — built-ins.
- **No** React/Vue/Svelte, D3, Three.js, Canvas/WebGL, Mermaid, GSAP, Lottie, Rive.

---

## Directory structure

```
scheme/
├── index.html                    standalone HTML, all paths relative
├── favicon.svg                   own icon (network-graph motif)
├── robots.txt, sitemap.xml       includes scheme deep-links
├── README.md                     this file
├── css/
│   ├── tokens.css                :root vars copied from main + diagram tokens
│   ├── styles.css                layout, header, grid, dialog
│   └── diagrams.css              SVG primitive classes + per-cat theming
└── js/
    ├── app.js                    router, grid, modal lifecycle, kbd, hash routing, env-aware cross-link
    ├── data.js                   catalog: SCHEMES + CATEGORIES + CATEGORY_LABEL
    ├── lib/
    │   ├── env.js                isProd / mainUrl() / schemeUrl() — negative-match by hostname (copy of root js/lib/env.js)
    │   ├── sidebar.js            setupSidebar() — collapse/expand toggle + localStorage state (copy of root js/lib/sidebar.js)
    │   ├── svg.js                el(tag, attrs, children) + named factories
    │   ├── primitives.js         pod, node, box, chip, cylinder, arrow, packet, label, animateAlong, pulse, fadeIn/Out, flowDash, arrowDefs
    │   ├── timeline.js           Timeline class. play/pause/step/reset/setSpeed/destroy + isPlaying
    │   ├── motion.js             reducedMotion() + onReducedMotionChange()
    │   └── observer.js           IntersectionObserver helper (currently unused. for future poster lazy-load)
    └── schemes/
        ├── network-pod-to-pod-same-node.js
        ├── service-cluster-ip.js
        ├── deployment-rolling-update.js
        ├── volume-pvc-binding.js
        └── control-plane-apply-flow.js
```

---

## Module contract — schemes

Each scheme module is lazy-imported by `app.js` on dialog open. It exports `init(root, callbacks)` returning a controller:

```js
export function init(root, { onStepChange, onPlayingChange } = {}) {
  const scene = new Scene(root);     // builds initial SVG into root
  const tl = new Timeline({
    steps: STEPS,
    scene,
    onSceneReset: () => scene.reset(),
    onChange: onStepChange,            // (idx, step, total)
    onPlayingChange,
  });
  return {
    play, pause, reset,
    step: (dir) => tl.step(dir),       // 'next' | 'prev'
    setSpeed: (rate) => tl.setSpeed(rate),
    isPlaying: () => tl.isPlaying(),
    destroy,
  };
}
```

Each step:
```js
{
  id: 'string',
  duration: 1500,                       // ms; 1× speed
  narration: 'Text shown in narration panel.',
  enter(scene, ctx) {
    // ctx.reduced — true under prefers-reduced-motion or when prev/reset replays
    // ctx.speed — current speed multiplier
    // ctx.register(animation) — track WAAPI animation for cancel-on-step-change
  },
}
```

**Convention**: `Scene.build()` paints the **idle / step-0 visual state**. Step 0's `enter()` is essentially a no-op (clears packet layer, removes `.highlight`). Forward steps mutate state and register animations. Going prev → Timeline calls `scene.reset()` (rebuilds), then replays steps 0..target with `ctx.reduced = true` so they snap to final state without animating.

---

## URL routing & keyboard

- `#scheme=<id>` — opens that scheme's dialog on load or via direct link.
- Browser back closes the dialog.
- Closing the dialog clears the hash.
- Search input filters cards by `title + desc + category`, debounced 80ms.

Keyboard inside an open dialog:
- `Space` — play/pause
- `←` / `→` — prev / next step
- `R` — reset
- `Esc` — close dialog

---

## Categories & palette

Single-row category nav in scheme:
- All
- Networking — `--network-color` cyan (`#4fe5ff`)
- Workloads — `--workloads-color` sky blue (`#5cb1ff`)
- Storage — `--storage-color` indigo (`#7d86ff`)
- Control plane — `--control-color` yellow (`#ffd15c`)

Reserved for future schemes (tokens already in `css/tokens.css`):
- Scaling — orange `#ffa04d`
- Security — red `#ff5757`
- Lifecycle — coral `#ff668c`

To activate a reserved category: add a `{ key, label }` entry to `CATEGORIES` in `js/data.js`. CSS rules for `[data-cat="<key>"]` already exist for `.cat-btn.active`, `.card`, `.card-cat`, `.scheme-dialog`, and the SVG primitives.

---

## Adding a new scheme

1. Create `js/schemes/<id>.js` following the `init/STEPS` contract above.
2. Add an entry to `SCHEMES` in `js/data.js`:
   ```js
   {
     id: '<id>',
     title: '...',
     category: 'network' | 'workloads' | 'storage' | 'control',
     desc: '...',
     k8sVersion: '1.32',
     module: './schemes/<id>.js',
     sources: [{ label: 'K8s docs: ...', href: '...' }],
   }
   ```
3. Add a `<url>` entry to `sitemap.xml`.

For diagrams, prefer composing primitives from `js/lib/primitives.js` — keeps visual language consistent across schemes.

---

## Local development

```bash
# Option A: python http server (no rebuild needed)
python3 -m http.server 8888 --bind 0.0.0.0
# → http://localhost:8888/scheme/

# Option B: existing nginx Docker image (rebuild after edits per project memory)
docker stop kube-cheatsheet && docker rm kube-cheatsheet
docker build -t kube-cheatsheet . && docker run -d --name kube-cheatsheet -p 8080:80 kube-cheatsheet
# → http://localhost:8080/scheme/
```

The Docker setup serves both the main site (root) and the scheme subsite at `/scheme/`. This mirrors the local-dev URL the cross-link button uses (`localHref: '/scheme/'`).

---

## Cross-link integration with main

Both sites carry the same vertical site-switcher **sidebar** (left edge, fixed, 48px wide, full height) with two icon buttons stacked at top:
- **CLI** (terminal-arrow icon) → links to main `kube.how`
- **Schemes** (network-graph icon) → links to scheme subsite

The button matching the current site is marked `.active` in HTML (no JS toggle needed; each `index.html` ships with its own active state hardcoded). Active state is rendered as a 3px lavender (`--accent`) bar at the sidebar's left edge plus a tinted background on the icon. Tooltips on hover: "K8s Commands" / "K8s Schemes".

A bottom-anchored `.side-toggle` button (chevron-left) hides the sidebar via `body.sidebar-collapsed` (CSS slides sidebar with `transform: translateX(-100%)` and zeros body padding-left). When collapsed, a tiny `.side-expand` tab appears at the bottom-left edge with a chevron-right to bring it back. State persists across reloads in `localStorage` under `kube-how:sidebar-collapsed:v1` (in dev with same origin, state syncs across the two sites; in prod they're separate origins so localStorage is per-domain).

The header **no longer carries a cross-link button** on either site. Header actions on main are limited to GitHub / Contacts / Sponsor; on scheme there are no header actions at all. The sidebar is the single source of cross-navigation.

### URL resolution helper (`js/lib/env.js`)

Both sites share the same env detection logic, copied (not symlinked, for CF Pages compatibility) into `js/lib/env.js` and `scheme/js/lib/env.js`:

```js
export const isProd =
  location.hostname === 'kube.how' ||
  location.hostname === 'scheme.kube.how';

export const mainUrl   = () => isProd ? 'https://kube.how/'        : '/';
export const schemeUrl = () => isProd ? 'https://scheme.kube.how/' : '/scheme/';
```

**Negative-match by hostname**: prod = exactly the two real domains; everything else (localhost, 127.0.0.1, 0.0.0.0, LAN IP `192.168.x.x`, hosts-file aliases, `*.pages.dev` previews) is treated as dev. No whitelist of dev hostnames to maintain.

Each app.js sets the cross-link `href` from these helpers at module load:
- main `js/app.js` → `document.getElementById('sideScheme').href = schemeUrl()`
- scheme `js/app.js` → `document.getElementById('sideCli').href = mainUrl()` (also patches the footer `kube.how` link)

The shared collapse/expand wiring lives in `js/lib/sidebar.js` (and its scheme copy). Each app.js calls `setupSidebar()` once at module load.

### What got removed

- `SCHEMES` export from `js/contacts.js` is gone. Cross-link is structural now, not opt-in via `enabled` flag. To omit Schemes navigation entirely you'd have to edit HTML + JS both, which is a bigger surgery than flipping a flag.
- Mobile fallback button (`.action-btn-cross`) is gone. Sidebar is the only switcher across all viewports; users on small screens can collapse it via the bottom toggle if it's in the way.
- The `localHref` / hostname whitelist pattern (the old `['localhost','127.0.0.1','0.0.0.0'].includes(...)` checks) is gone. Replaced by the negative-match `isProd` check in env.js.

---

## MVP status (completed)

**Branch**: `feat/scheme-site` (uncommitted as of writing).

**Done**:
- Full `scheme/` scaffold (HTML, CSS layer, JS lib, app shell)
- 5 MVP scheme modules:
  1. `network-pod-to-pod-same-node` (4 steps) — packet through CNI bridge via veth pairs
  2. `service-cluster-ip` (5 steps) — selector → endpoints → kube-proxy DNAT
  3. `deployment-rolling-update` (6 steps) — maxSurge / maxUnavailable cycle
  4. `volume-pvc-binding` (5 steps) — PVC → CSI provisioner → PV → bind → mount
  5. `control-plane-apply-flow` (6 steps) — kubectl → apiserver → etcd → controller → scheduler → kubelet
- Vertical site-switcher sidebar (CLI ↔ Schemes) on both sites, with collapse/expand button and `localStorage` persistence
- Shared `js/lib/env.js` (negative-match prod detection, `mainUrl()` / `schemeUrl()`) and `js/lib/sidebar.js` (collapse wiring), copied into `scheme/js/lib/` for CF Pages root-isolation
- Main `js/app.js` `renderHeaderActions(CONTACTS, SPONSOR, GITHUB)` no longer takes a SCHEMES arg; cross-link removed from header on both sites
- Footer `kube.how` link in `scheme/index.html` patched at runtime via `mainUrl()` (so it stays inside localhost in dev)
- Docker rebuild verified — both sites serve correctly at localhost:8080

**Smoke results** (from `python3 -m http.server` + Docker):
- All 19 scheme assets serve 200
- All JS modules pass `node --check`
- `data.js` loads in node, 5 schemes registered
- `Timeline` instantiates with mocked DOM
- All `primitives.js` factories return DOM nodes without throwing

**Not yet validated** (requires browser):
- Visual rendering of each scheme
- WAAPI animations (`animateAlong`, `pulse`, `fadeIn/Out`)
- `<dialog>` modal lifecycle (open / close / hash sync)
- Cross-browser SVG behavior, especially Safari `transform` on packet motion
- `prefers-reduced-motion` final-frame fallback
- Mobile viewports (375 / 414 / 768 px)

---

## What's next

### Immediate (before merge to main)
- [ ] Open `localhost:8080/scheme/` in Chrome / Firefox / Safari and verify each MVP scheme plays smoothly
- [ ] Toggle `prefers-reduced-motion` in DevTools, verify schemes show final state with step controls usable
- [ ] Test deep-link `localhost:8080/scheme/#scheme=control-plane-apply-flow` opens that modal directly
- [ ] Test the sidebar Schemes button on main → resolves to `/scheme/` locally; CLI button on scheme → resolves to `/` locally
- [ ] Test sidebar collapse/expand: hide via bottom toggle, page reflows, state persists across reload and across the cross-link (same origin)
- [ ] Confirm `document.getAnimations().length === 0` after closing several schemes (no leaks)
- [ ] Mobile DevTools emulation — diagrams legible or fallback notice clear

### Hosting cutover (when ready)
- [ ] Create CF Pages project `kube-how` (root `/`, custom build command per table above) → verify preview URL renders main only (no `/scheme/`)
- [ ] Create CF Pages project `scheme-kube-how` (root `/scheme`, no build) → verify preview URL renders scheme
- [ ] Lower DNS TTL on `kube.how` A/AAAA to 5 min, wait 24h
- [ ] Flip DNS: `kube.how` A/AAAA → CF target; add `scheme` CNAME → CF target
- [ ] Verify HTTPS (CF auto-issues cert) and analytics
- [ ] Disable GH Pages in repo settings or delete `.github/workflows/deploy.yml`
- [ ] Update `release.yml` if kept — include `scheme/` in zipped artifact

### Authoring more schemes (path to v1: 15-20 total)
Candidate next schemes, roughly ordered by demand:
- DNS resolution (CoreDNS) — networking
- Ingress routing (Ingress controller → Service → Pod) — networking
- NetworkPolicy enforcement — security (activate `security` category)
- HPA scale-up cycle — scaling (activate `scaling` category)
- StatefulSet ordered startup — workloads
- Probes lifecycle (startup / liveness / readiness) — lifecycle (activate `lifecycle` category)
- ConfigMap / Secret injection — workloads
- Pod scheduling decision (affinity, taint, score) — control plane
- Cluster Autoscaler node addition — scaling
- RBAC authorization flow — security
- Init containers / sidecars order — lifecycle

Each scheme: budget 0.5–1 day for MVP-quality. Authoring follows the contract above; primitives library should cover most needs without expansion.

### Polish backlog (defer until after first browser pass)
- Static SVG poster files in `images/posters/<id>.svg` — currently `app.js` generates a stylized placeholder per category (works for grid display, won't show specifically what each scheme is until you click)
- OG / Twitter card images per scheme
- `<title>` / OG meta updated dynamically when modal opens (for nicer share)
- A `tools/render-posters.mjs` script using headless Chromium that snapshots first/last frame of each scheme into `images/posters/`
- Per-step `id` deep-link (`#scheme=foo&step=3`) so people can share a specific moment
- Speed control persists across opens via `localStorage`
- Telemetry — which schemes / steps get viewed (Cloudflare Analytics doesn't go that deep; would need a small custom event hook)

---

## Known constraints / things-not-to-do

- **No top-level browser globals at module load time**, except in `motion.js` and `app.js` which are intentionally browser-only entry points. `lib/svg.js`, `primitives.js`, `timeline.js`, `data.js` parse cleanly in Node so they can be unit-tested or pre-rendered.
- **Pulse helper uses `filter: brightness(...)`**, NOT `transform: scale(...)`. Reason: most diagram elements are `<g transform="translate(...)">` and adding a scale would compose-clobber the existing translate. Don't change pulse to use `transform` without also handling group transform composition.
- **Packet animation uses `transform: translate(Xpx, Ypx)` via WAAPI** with `cx=0, cy=0` on the circle. Don't try to animate `cx`/`cy` SVG attributes directly — Safari support is uneven.
- **Inline SVG literals in `app.js` for posters use literal hex colors**, not CSS variables. SVG presentation attributes don't reliably resolve `var(--token)` in some browsers — only inline `style=` does. Keep posters using `POSTER_COLORS` map.
- **CLAUDE.md should NOT be updated proactively** — per user feedback memory, only sync docs to code on explicit request.
- **No em-dashes anywhere in the project** — per user feedback memory, rephrase instead.
- **`js/lib/env.js` and `js/lib/sidebar.js` are duplicated, not symlinked**, between root and `scheme/js/lib/`. CF Pages reads each project's root in isolation; a symlink that escapes the project root would break in prod even though it works locally. If you change one copy, change the other.
