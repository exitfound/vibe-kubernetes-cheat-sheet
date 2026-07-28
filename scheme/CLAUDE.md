# CLAUDE.md `/scheme/` (Animated architecture diagrams)

This file is the source of truth for the `scheme/` sub-app. Read it before editing anything here. The root `../CLAUDE.md` has the repo overview, Running/Deployment, and shared chrome (left sidebar switcher, chrome parity, first-paint flash) that this page inherits.

## What it is

A card grid of Kubernetes architecture concepts. Click a card, a native `<dialog>` opens, an SVG diagram plays a step-by-step animation with narration text and play/pause/prev/next/reset/speed controls. Static-only: ES modules + Web Animations API (WAAPI) + native `<dialog>`. No backend, no bundler, no framework.

Deliberately **not** used: React/Vue/Svelte, D3, Three.js, Canvas/WebGL, Mermaid, GSAP, Lottie, Rive. SVG diagrams are hand-built via a tiny `createElementNS` helper. IntersectionObserver, localStorage, and URL hash are all built-ins.

## Directory layout

```
scheme/
  index.html              standalone, all paths relative
  favicon.svg             own icon (network-graph motif)
  css/
    tokens.css            :root vars (category colors) + diagram tokens
    styles.css            layout, header, grid, dialog
    diagrams.css          SVG primitive classes + per-category theming
  js/
    app.js                router, grid, modal lifecycle, keyboard, hash routing
    data.js               catalog: SCHEMES + CATEGORIES + SUBCATEGORIES (CATEGORY_LABEL/ICONS/TAGLINE are derived)
    posters.js            POSTERS map: per-scheme inline-SVG idle / first-frame art
    lib/
      svg.js              el(tag, attrs, children) + named factories
      primitives.js       pod, node, box, chip, cylinder, arrow, pathArrow, packet, chainList/setChainActive, animateAlong, fadeIn, arrowDefs
      timeline.js         Timeline class: play/pause/step/reset/setSpeed/destroy/isPlaying + cancellable autoPlay
      motion.js           reducedMotion() + onReducedMotionChange()
      sidebar.js          setupSidebar() (copy of cli sidebar; duplicated, not symlinked)
      scheme-kit.js       the shared BASE kit, no category of its own: valChip/setVal/setBox, makeInit,
                          pulsePodWithTint, packetAlong + top/route wrappers, clearHighlights/
                          clearWires/setWire, lightBoxAt, makeRidingLabel, setPodSublabel, BEAT/FADE/OPACITY
      workloads-kit.js    per-category wrapper: WORKLOADS_TINT (blue) pulsePod/pulsePodDim, plus WL,
                          the category's shared X layout canon (see "The Workloads layout canon")
      cluster-kit.js      per-category wrapper: CLUSTER_TINT (violet) pulsePod/pulsePodDim
      network-kit.js      per-category wrapper: NETWORK_TINT (cyan) pulsePod/pulsePodDim
      storage-kit.js      per-category wrapper: STORAGE_TINT (jade) pulsePod/pulsePodDim + setCylinderLabel
      inspector.js        ?inspect=1 grid + bbox overlay, exposes window.__schemeCtl
      tokens.js         dependency-free animation magnitude tokens (PULSE_POD, PULSE_BLOCK, OPACITY, BEAT, FADE) shared by timeline.js + the kits, no import cycle.
                        OPACITY is the FADE-PHASE VOCABULARY, five shades, one per lifecycle phase
    schemes/<id>.js       one module per diagram
  docs/                   NOT shipped (see "Where card notes live")
    CARDS.md              per-card design record: geometry derivations, measured overlay extents,
                          rejected alternatives, plus one "### poster" subsection per card
    INTERNALS.md          the same record for the shared files: data.js, the four kits,
                          scheme-kit, timeline, tokens, styles.css, diagrams.css
  tools/                  dev harness, NOT shipped
```

## Catalog and categories

`js/data.js` exports `SCHEMES` (currently 103 entries), plus `CATEGORIES` and `SUBCATEGORIES` (per-category sub-tab keys + labels). `CATEGORY_LABEL`, `CATEGORY_ICONS` and `CATEGORY_TAGLINE` are **projections** of `CATEGORIES` via one `byKey(field)` helper, not separate data: add a category in one place only. The tagline (`Traffic flow`) is deliberately called `tagline`, not `sub`: `SUBCATEGORIES` is the subcategory list, and one word for both is how a dead `sc.sub ||` branch got written on the assumption that subcategories have taglines. None do.

**The tagline does not currently render anywhere.** `buildUnits` subtitles a subcategory row with its CATEGORY label, and the two places that read `CATEGORY_TAGLINE` are fallbacks for shapes no category has today: an orphan row (a scheme whose `subcategory` is missing or unknown) and a category with no `SUBCATEGORIES` entry at all. Both are legitimate future states, so the code stays, but do not expect a tagline you add to appear until a category has no subcategories. Four active categories (label / key / color token in `css/tokens.css`):

**Every key matches its label 1:1.** That is a rule, not a coincidence: the category key was `control` while the label said `Cluster`, and `foundations` was used by two categories with different labels, so `subcategory: 'foundations'` could not be read without also reading `category`. Both are fixed; keep it that way.

| Label | key | color | cards | subcategories (`key` -> label) |
|---|---|---|---|---|
| Cluster | `cluster` | `#7d86ff` indigo | 15 | `control-plane` Control Plane, `worker-nodes` Worker Nodes |
| Workloads | `workloads` | `#5bb8ff` sky blue | 20 | `pods-bootstrap` Pods Bootstrap, `pods-lifecycle` Pods Lifecycle, `controllers` Controllers |
| Networking | `network` | `#4fe5ff` cyan | 37 | `network-foundations` Network Foundations, `pod-networking` Pod Networking, `services-endpoints` Services & Endpoints, `external-traffic` External Traffic, `dns-service-discovery` DNS & Service Discovery |
| Storage | `storage` | `#5eca94` jade | 31 | `volume-foundations` Volume Foundations, `volumes-claims` Volumes & Claims, `csi-mount-path` CSI & Mount Path, `stateful-data` Stateful Data |

The retired Lifecycle category (coral `#ff668c`) is reserved in `tokens.css`, not active. To activate a reserved category, add a `{ key, label, tagline, icon }` entry to `CATEGORIES`; the `[data-cat="<key>"]` chrome CSS already exists.

Each `SCHEMES` entry: `id`, `title`, `category`, `subcategory`, `desc`, `k8sVersion`, `module`, `tinted: true`, `sources: [{ label, href }]`. **All 103 cards are tinted**; Cluster was the last holdout and is no longer an exception.

Renaming a card id is fine as long as `SCHEME_ALIASES` in `app.js` keeps the old one resolving. It currently holds 28 entries, including all 15 `control-*` ids from before the Cluster rename.

## Scheme module contract

Each `js/schemes/<id>.js` is lazy-imported by `app.js` on dialog open and exports `init(root, callbacks)` returning a controller:

```js
export function init(root, { onStepChange, onPlayingChange } = {}) {
  const scene = new Scene(root);          // builds initial SVG into root
  const tl = new Timeline({
    steps: STEPS,
    scene,
    onSceneReset: () => scene.reset(),
    onChange: onStepChange,               // (idx, step, total)
    onPlayingChange,
  });
  return {
    play, pause, reset,
    step: (dir) => tl.step(dir),          // 'next' | 'prev'
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
  duration: 1500,            // ms at 1x speed
  narration: 'Text shown in the narration panel.',
  enter(scene, ctx) {
    // ctx.reduced: true under prefers-reduced-motion or when prev/reset replays
    // ctx.speed: current speed multiplier
    // ctx.register(animation): track a WAAPI animation for cancel-on-step-change
  },
}
```

`Scene.build()` paints the **idle / step-0 visual state**. Step 0's `enter()` is essentially a no-op (clears packet layer, removes `.highlight`). Forward steps mutate state and register animations. Going prev calls `scene.reset()` (rebuild) then replays steps 0..target with `ctx.reduced = true` so they snap to final state without animating.

Every card is built on its own category kit (`workloads-kit.js` / `cluster-kit.js` / `network-kit.js` / `storage-kit.js`), which wraps the shared `scheme-kit.js`, with flat `<category>-<name>` ids. Motion stays **local** in each card.

## Card construction standard (shared grammar)

Cards are not byte-identical, but they share one behavioral skeleton. When building or fixing a card, match these patterns rather than inventing a new shape. Four canonical exemplars, one per category, are the reference to copy from:

- Workloads: `js/schemes/workloads-probes.js`
- Cluster: `js/schemes/cluster-scheduler-decision.js`
- Networking: `js/schemes/network-service-clusterip.js`
- Storage: `js/schemes/storage-volume-model.js` (the anchor card; storage's grammar is a **vertical stack** centered on a spine: a Pod on top, the backing volume drawn as a `cylinder` disk below, and L-shaped **mount lanes** carrying the ball between a container and the disk)

What is **the same** in all four (this is the standard):

1. **Module skeleton.** `class Scene { constructor(host){ this.host=host; this.refs={}; this.build(); } build(){...} reset(){ this.build(); } }`, then `const STEPS = [...]`, then `export const init = makeInit(Scene, STEPS, { posterFirst: true })`. Import primitives from `svg.js` + `primitives.js` and all chip/packet/pulse helpers from the **category kit**, never past it into `scheme-kit` directly. All four categories now have a kit, so there is no exception: `scheme-kit` carries no category and no card imports it.
2. **`build()` shape.** `this.host.replaceChildren(); this.refs = {};` then a root `svg` with `viewBox: '0 0 1200 640'`, `preserveAspectRatio: 'xMidYMid meet'`, a full-sentence `aria-label`, `data-style: 'outline'`, and `root.appendChild(arrowDefs())` first. Build blocks, append in a deliberate **commented z-order**, `this.host.appendChild(root)`, then populate `this.refs = { svg: root, ...blocks, packetLayer, wires: {...} }`.
3. **Z-order discipline.** Body blocks first, then wires + wire-labels above them, then chips, then `packetLayer = g({ id: 'packetLayer' })` on top so packets ride above static content. Blocks that must sit above packets (top-row infra, the chain ladder) are appended **after** the packet layer. Each card states its z-order in a comment.
4. **Building blocks.** Pods = a `pod(...)` shell + an inner `box(...)` (container / eth0), wrapped in a `g` so `pulsePod` animates both; shell rect fill overridden to `rgba(255,255,255,0.03)`. State shown as a `valChip(...)` strip updated with `setVal`. A `chainList(...)` numbered ladder with one row highlighted per step. Wire labels are dim `text` at fixed positions, blank (`' '`) at build, filled per step with `setWire`. Connectors are `arrow`/`pathArrow`; the **same points array** feeds both the static wire and the packet route so they agree.
5. **Step object.** `{ id, duration, narration, enter(s, ctx) }`. Step 0 is `id: 'idle'`, `duration: 1500`, a pure reset (no motion, often `enter(s)` with no `ctx`).
6. **Every `enter()` repaints from scratch.** It opens with the same three lines: `s.refs.packetLayer.replaceChildren(); clearHL(s); clearWires(s);`. Then it sets all chip values, wire labels, `.highlight` classes, and **pins final opacities inline** (`s.refs.x.style.opacity = ...`) so a cancel mid-step lands on the right value, not the default. A card-local `clearHL(s)` delegates to `clearHighlights(s, [refKeys], [podGroups])`.
7. **The reduced-motion split is the load-bearing line.** Everything **above** `if (ctx.reduced) return;` is the complete static end-state of the step; everything **below** is motion, and every animation goes through `ctx.register(...)`. Prev/reset replays steps with `ctx.reduced = true`, so they snap to that static state. Never animate state that is not also pinned statically above the guard.
8. **Motion canon (all via the kit).** Only pods pulse (`pulsePod` / `pulsePodDim` for dim pods); infrastructure blocks light via `.highlight` and never pulse. **Nothing but a Pod blinks, and that is now measured, not assumed:** a probe walks every step's play path and asserts that each `filter: brightness(...)` animation targets an element inside a Pod (711 of them, all clean). The hand-rolled `flashBox` copies were removed in 2026-07 and `flashChips` lost every call site, because each one was blinking a value chip, which the rule forbids. `flashChips` itself is still exported by `scheme-kit.js` and still sits in the four kits' 25-name parity list with **zero callers**: do not call it, and do not drop the export without updating all four kits together, or `R-kitparity` fails. A packet-less, pod-less step carries its beat with `.highlight` instead. Packets: in-diagram hops use `segmentPacket` (linear), multi-point right-angle routes use `routePacket` / connector wrappers (eased, distance-normalized), top-row request/ack hops use `topPacket` (eased). Every packet returns `arrivalMs`; anchor pulses, next hops, and box-lights to `pkt.arrivalMs` + `BEAT.*`, never hard-coded delays.
9. **Packet vs pulse ordering.** Up-arrow (pod to infra): `pulsePod(...,0)` first, packet leaves at `delay: BEAT.afterPulse`. Down-arrow (infra to pod): packet first, `pulsePod(..., pkt.arrivalMs)` on arrival. Chained hops: `delay: prevHop.arrivalMs + BEAT.afterHop`. A rewrite "inside" a box (DNAT, conntrack) hides the ball at one edge and re-emerges it at the far edge instead of sliding over the box.
10. **Narration safe-zone.** Keep essential geometry out of the TOP-LEFT CORNER where the overlay sits, and read it as an **L**, not a box: the full width below the overlay's bottom is free, and so is the full height right of its right edge. The blanket `x<=380, y<=300` that used to stand here is **wrong and was never measured**: the panel reaches `x<=397`, and on the longest narration in the catalog it reaches `y<=504`. See "The narration panel is measured per card" below.

What **varies by card / category** (do not try to unify these):

- Which kit is imported, and the pod tint: workloads blue (`#5bb8ff`), cluster violet (`#c0b0ff`), network cyan (`#4fe5ff`), storage jade (`#5eca94`). Each kit owns its `*_TINT` and its own `pulsePod` / `pulsePodDim`; everything else is re-exported from `scheme-kit` through an explicit 25-name list that is duplicated in all four kits **on purpose**. Collapsing it into `export * from './scheme-kit.js'` would work (a local export shadows a star export) and save 28 lines, but it would erase the boundary this project relies on: the list is what documents what a kit offers, and a card must never reach past its kit. `R-kitparity` keeps the four lists from drifting apart, which was the only real argument for collapsing them. The pulse `base` must equal the pod's **resting** stroke, which is the CSS value before any pulse has run: measure it under `reducedMotion` or a forwards-filled pulse will make you read its own end state back.
- The `role` passed to pods, boxes, chips, cylinders, arrows and packets (`'cluster' | 'workloads' | 'network' | 'storage'`), which lands on the element as `data-role`.

  **`role` is a palette slot, not the card's category.** A workloads card writes `role: 'cluster'` on its kubelet box on purpose, to paint it in the control-plane colour. The chrome (card, section, nav button, dialog) uses `data-cat` for the real category; diagram elements use `data-role`. Two attributes, two namespaces, deliberately different names: they were both `data-cat` until the collision was split.

  Note what `role` does and does not do. Inside a tinted dialog `styles.css` remaps all four category colour tokens to the one `--tint-base`, so any role that paints through a token resolves to the same colour, and every card is tinted. Roles still differ where the CSS pins a literal: `.scheme-packet` and `.scheme-ripple` hold `#abb0f5` (cluster) and `#4fe5ff` (network) on purpose, because the tint stop made the ball read washed out. Do not "fix" those into tokens.

  Pass `role` explicitly, always. Nothing in the kit defaults it to a category any more, and the reason is worth knowing: `valChip` and every packet wrapper used to default to `'cluster'`. On the chips (388 calls, 82 of them workloads) and on the packets that was invisible, because a tinted dialog collapses those onto one tint. On the **arrival ripple** it was not: `.scheme-ripple[data-role="cluster"]` carries a literal, so 20 workloads cards drew indigo ripples inside a blue card. All 388 chip calls and all 527 packet-wrapper calls now name their role, and the default is neutral (`role || null`, the shape `box` / `chip` / `chainList` always used), which resolves to the card's own tint.

  `check-palette` cannot catch that class of bug, and it is worth understanding why before trusting it: `role` is part of its key, so `(workloads, .scheme-ripple, cluster, rest)` was perfectly self-consistent across all 20 cards. It catches a role that resolves inconsistently, not a role that is the wrong one to have asked for.
- Block size. `storage-csi-architecture` sets the storage family's "server box" at `232 x 76` and `storage-volumeattachment` matches it; Pods are `226 x 110` (`storage-csi-attach-mount`). Where a Pod and a plain block stack on one centre line, give the block the Pod's width rather than the family width: a 6 unit difference is invisible between columns and reads as a rendering slip within one.
- Diagram geometry, step count, and the connector style: a vertical down/up connector with `setConnectorDir` (workloads-probes), a top-row request/persist arrow strip (cluster-scheduler-decision), parallel forward/return flow lanes plus a right-angle fan (network-service-clusterip), or a centered vertical stack with a dim ownership spine plus L-shaped mount lanes into a `cylinder` disk (storage-volume-model).

Pre-flight checklist before declaring a card done (these are the recurring mistakes the checks below catch):

- [ ] Every `enter()` opens with `replaceChildren` + `clearHL` + `clearWires`, and all per-step state is set above the `ctx.reduced` guard.
- [ ] Every `enter()` repaints **every** chip, not only the ones this step talks about (see "Chips" below).
- [ ] All motion is `ctx.register`-ed; nothing animates that is not also pinned statically.
- [ ] No block or value chip pulses; only pods. Block flash only on a packet-less, pod-less step.
- [ ] Pulse/packet ordering matches the up/down arrow rule, timed off `arrivalMs` + `BEAT.*`.
- [ ] Every pulsed pod is a **wrapping `g`**, never a bare `pod()` (see "The `pulsePod` descendant trap" below).
- [ ] Every ball rides a **drawn wire**, and return traffic has its **own** lane (see "Wires" below).
- [ ] `anim-dump`'s `span=` for each step is **less than that step's `duration`** (see "Duration" below).
- [ ] Pod tint base equals the resting stroke for the category (no settling on a paler color).
- [ ] No apostrophes or semicolons in `narration` / `wire` / `chain` strings; no em-dashes anywhere.
- [ ] A `ridingLabel` passes the **same easing** as the ball it rides (see "Riding labels" below).
- [ ] Every shade between 0 and 1 comes from `OPACITY` (see "The fade-phase vocabulary" below).
- [ ] `npm run gate` is green (run from `scheme/tools/`, needs a server at `http://localhost:8080`). It chains **thirteen** checks, stopping on the first failure: `check-canon` (source lint) then `check-notes` (every design note still points at code that exists) then `check-terms` (terminology and casing in prose, including every `aria-label`) then `check-inline` (casing AND component names of strings drawn on the diagram) then `check-labels` (one object, one label) then `check-figures` (numbers and addresses inside one card) then `smoke-all` (no console errors across all 103 cards, walked both statically and PLAYED so motion code actually runs) then `check-reduced` (the reduced-motion contract on every step) then `check-palette` (colour consistency, 1294 elements) then `check-opacity` (the fade-phase vocabulary, measured in the browser) then `check-duration` (every step outlasts its own motion) then `check-chipfit` (no chip name overlaps its own value) then `check-geometry --rules=diagonal,through` (two of the six geometry rules; OCCLUDED and OFFEDGE are at zero since R5 closed and could be added). The gate is cheap and baseline-free; the pixel/packet baseline tools were retired.

## Adding a scheme

1. Create `js/schemes/<id>.js` following the contract (prefer composing `primitives.js` + the relevant kit).
2. Add a `SCHEMES` entry in `js/data.js` (`id`, `title`, `category`, `subcategory`, `desc`, `k8sVersion`, `module: './schemes/<id>.js'`, `tinted: true`, `sources`). Target **410-460 characters, 3 sentences** (tolerance one sentence), hard range 400-470, catalog-wide. Enforced by `R-desc` in `check-canon`, so a desc outside 400-470 fails the gate. All 103 are inside it. The band was 400-420 until 2026-07-26 and that ceiling was actively harmful: it forced qualifying conditions out of sentences and was the direct cause of 29 technical defects, because cutting a condition leaves an absolute standing ("the Kubelet never creates it", "they all read ETCD"). If a sentence needs a condition to be true, spend the characters. The row still matters as a tiebreaker, because grid cards stretch to the tallest in their row.
3. Add per-scheme idle art to the `POSTERS` map in `js/posters.js`. **A poster is one sentence, not a small diagram.** It renders about 200px wide on the grid, so a faithful miniature of the scheme is unreadable there: the `storage-volumeattachment` poster was first drawn as the whole card (controller, attacher, node frame, seven lanes, ~19 shapes), every part accurate and none of it legible, and was cut to ~10 shapes carrying one claim. Decide the sentence first, keep only the elements that carry it, and drop the rest even when they are on the card. Give the single brightest fill to the one element the sentence is about (there, the `status.attached` cell) so the eye lands on the idea rather than on the topology. Poster viewBox is `0 0 320 180`, `stroke="currentColor"`, fills as literal `rgba(255,255,255,...)`, never `var(--token)`.
4. Put the card's design record in `scheme/docs/CARDS.md` under `## <id>`, and leave a single
   pointer comment under the card's imports. Anything longer than two comment lines goes there, not
   into the card. See "Where card notes live".
5. Add a `<url>` to the repo-root `sitemap.xml` if it should be deep-linkable.

## URL routing and keyboard

- `#scheme=<id>` opens that scheme's dialog on load or via direct link.
- Browser back closes the dialog; closing the dialog clears the hash.
- Search filters cards by `title + desc + category`, debounced 80ms.
- Inside an open dialog: `Space` play/pause, `<-` / `->` prev / next, `R` reset, `Esc` close.

## Poster-first model

Idle = static poster. After ~1s the card auto-plays step 1 via the cancellable `Timeline.autoPlay` (replaces raw `setTimeout`). The poster previews step 1's **text** immediately (animation is delayed, text is not). `Next` from the last step wraps to poster, then step 1. The overlay starts `is-poster` to kill the open-flash. The `posterFirst` flag is on all 103 cards. Tools read total via `__schemeCtl.total`.

## Motion and design canon (load-bearing)

- **Pulse rule**: block auto-pulse is OFF for every card (`autoPulse: false` is the `makeInit` default in `scheme-kit.js`). Only pods pulse, via `pulsePod`. Nothing else blinks at all: `pulseActiveBlocks` and the local `flashBox` copies are deleted, and `flashChips` survives as an uncalled export (see "Motion canon" above). If a card draws a Pod's containers, it must also draw the Pod shell around them, or there is nothing for the pulse to belong to (`workloads-init-containers-and-sidecars` pulsed four bare boxes until it got one).
- **Pulse helper uses `filter: brightness(...)`**, NOT `transform: scale(...)`, because diagram elements are `<g transform="translate(...)">` and a scale would compose-clobber the existing translate.
- **Packets use WAAPI `transform: translate(Xpx, Ypx)`** on a `cx=0, cy=0` circle. Never animate SVG `cx`/`cy` directly (Safari support is uneven). Each packet must represent literal traffic the step narrates, not decoration on a connector.
- **Packet vs pod-pulse ordering**: up-arrow = pod blinks FIRST, packet at `BEAT.afterPulse`; down-arrow = packet first, pulse at `pkt.arrivalMs`; chained hops via `arrivalMs` + `BEAT.afterHop`. Dim pods need an opacity flash so the blink is visible.
- **Motion canon**: routes glide at `routeDur` speed (`PKT_SPEED` 0.45, no explicit dur); hops = `topPacket` (eased) + `segmentPacket` (linear); ripple always (no flag); wrappers return `arrivalMs`; `BEAT`/`FADE` tokens; the ball-on-top exception is kept for 3 control-plane flow cards.
- **Narration safe-zone**: keep essential scheme content out of the viewBox top-left corner where the overlay sits, and read it as an **L**. The panel's real extent is `x<=397` on every card, and its bottom is per card, from 171 to 504. Measure, do not assume: see "The narration panel is measured per card".
- **Fade phases**: every opacity between 0 and 1 comes from `OPACITY` in `tokens.js`, five shades, one per lifecycle phase. `check-opacity` enforces it in the browser.
- **Posters use literal hex colors**, not `var(--token)`. SVG presentation attributes do not reliably resolve CSS variables in some browsers.

### Riding labels and `lightBoxAt` (networking + storage cards)

Both live in `scheme-kit.js` now and are re-exported by every category kit. `lightBoxAt` had 52 byte-identical copies, so there was never anything per-card about it. `ridingLabel` had 51 copies differing along nine axes (`dy` -14/-15/-16, palette role, default easing, fade-in 140/150/160, fade-out 170/180/200, the hold before the fade-out, an `emerge` variant for balls that appear from inside a box, `dx`, and whether `dur` was required), which is why it became a **factory** rather than a function: a card binds its constants once at module scope and its call sites stay unchanged.

```js
const ridingLabel = makeRidingLabel({ role: 'storage' });                                  // the common case
const ridingLabel = makeRidingLabel({ role: 'network', dy: -15, inMs: 160, outMs: 200, hold: 0 });
```

Nine distinct bindings cover all 51 cards.

- **`ridingLabel(s, ctx, txt, points, { delay, dur, easing })`** paints an address tag that travels along with the ball instead of sitting as static wire text, so the packet visibly carries `dst 10.96.0.10:80` in and `src 10.244.2.7` back out (in storage it rides the mount lane carrying `mount /data`, `write`, `read`). It lives in the packet layer but is **not** a `.scheme-packet`, so the tools do not count it as a packet. 51 cards use it (31 storage, 20 networking).

  **The easing must match the ball it rides.** `segmentPacket` is `linear`; `routePacket` and the connector wrappers are eased. `animateAlong` defaults to `ease-in-out`, so a label riding a **linear** hop must pass `easing: 'linear'` explicitly. Get this wrong and the tag drifts off the ball mid-flight, rejoining it only at the endpoints and the midpoint, which is exactly why a static screenshot will not catch it. Confirm with `anim-dump` and compare the ball's and the label's `easing` column, not with frames.

  Whenever a ball uses an explicit `dur`, its riding label must be passed the **same** `dur` or the two desync the same way.

- **`makeRidingLabel({ role, dy, dx, easing, inMs, outMs, hold, emergeMode })`** returns the card's `ridingLabel`. It pins the tag at the route START before animating: without that the tag sits at the SVG origin until `animateAlong`'s delay elapses, so its fade-in plays in the top-left corner under the narration panel. 13 networking cards shipped that way and were fixed by the unification. Confirm with `anim-dump`: the tag's `transform` row must sample the route start at 0%, never `t(0,0)`.

- **`lightBoxAt(boxEl, ctx, delay)`** adds `.highlight` to an infrastructure box **on packet arrival** (`pkt.arrivalMs`) rather than at step entry, via a zero-effect 1ms animation whose `onfinish` sets the class. Under `ctx.reduced` (or `delay <= 0`) it applies the class immediately, which keeps the reduced-motion static end-state correct. 276 calls across the catalog, all **imported from the category kit**. It is how a box (or a storage cylinder) "receives" a packet without pulsing, honoring the rule that only Pods pulse. The R3 queue that this closed went 101 findings in 41 cards down to 1, and the survivor is correct (an enclosing directory block whose rows light on arrival). A lit block that is itself the packet SOURCE is correct and stays lit at entry; a destination that is a Pod pulses rather than lights.

  **Whatever lights on arrival must also light on the reduced path**, or prev/reset shows a different picture than playing forward. No check sees this: `check-reduced` compares opacity rather than classes, and `check-arrival` looks at receivers rather than senders. The canonical shape puts the class in the guard body: `if (ctx.reduced) { s.refs.api.classList.add('highlight'); return; }` above, `lightBoxAt(s.refs.api, ctx, pkt.arrivalMs)` below.

`ridingLabel` is the reason `check-canon`'s `ALLOW_EXPLICIT_DUR` allowlist exists: 4 of its 5 entries deliberately slow a route so the tag stays legible. When adding a card that slows a route, add a `<file>.js:routePacket` entry there with the reason, or the lint fails.

### The fade-phase vocabulary (`OPACITY` in `tokens.js`)

Five shades, one per lifecycle phase, catalog-wide. A card writes a bare `0` or `1` (an element is
drawn or it is not) and takes **every shade in between** from here, so a reader who learns a shade
on one card reads it correctly on the next.

| Token | Value | Means |
|---|---|---|
| `OPACITY.running` | 1.00 | in focus and working |
| `OPACITY.pending` | 0.55 | declared, not working yet |
| `OPACITY.notready` | 0.40 | alive but not serving, not observed, or outside this path |
| `OPACITY.terminating` | 0.25 | `deletionTimestamp` set, eviction or shutdown under way |
| `OPACITY.terminated` | 0.12 | gone from the API, or finished |

What it replaced, and why the rule is worth keeping: `GONE` meant 0.1, 0.12, 0.15 AND 0.35 in
different cards; `DIM` meant 0.4, 0.45, 0.5, 0.6 and 0.75; `workloads-force-deletion` held five
different phases on one 0.5, and `storage-volumeattachment` used one constant for both "not created
yet" and "already deleted". Enforced by `R-opacity` (source) and `check-opacity` (browser).

**What is NOT a phase and must not be forced into the vocabulary:** a pulse peak is a motion
magnitude and lives in `PULSE_POD.dimPeak`; presentation shades (a texture fill, a chip's second
line) belong in CSS or in a palette token. Both were moved out rather than renamed.

### The Workloads layout canon (`WL` in `workloads-kit.js`)

The X grammar all 20 workloads cards share. Y values stay per card, because each card's panel bottom
is its own measurement.

```js
WL = { M: 60, L: 60, R: 1140, CX: 600, W: 1080, PANEL_R: 400,
       TOP_Y: 40, BOX_H: 80, TOP_BOTTOM: 120, SPINE_X: 600,
       LADDER_X: 60, LADDER_W: 480, CHIP_X: 660, CHIP_W: 480, CHIP_H: 34,
       ROW_H: 32, ROW_GAP: 10, LANE_DY: 12 }
```

It replaced the **320 gutter**: the same number hardcoded in all 20 cards AND in the kit's connector,
reserving the whole left edge for a panel that only owns the top-left corner. The shape now is an
actor row clear of the panel, a pipeline ladder and a chip column flanking a central spine, and a
Node frame spanning `L..R` so the content bbox centres on `CX` by construction.

**Which column gets which content: the A/B/C choice (settled 2026-07-27 over all 35 cards).** The
columns are left `60..540` and right `660..1140`, both 480 wide; the Node frame stays full width; the
actor row is centred on `CX` and starts no further left than 420. Pick the first that fits vertically
against **that card's** measured panel bottom:

- **A** ladder left, chips right, Node on the floor. Needs `PANEL_B + 20 + LADDER_H + 20 + NODE_H <= 630`.
- **B** the mirror, chips left and ladder right. **This is the common case, not A**: a 4-chip column
  is 160 tall where a 5-row ladder is 200, and the band left free below a real panel is at most ~214.
- **C** tall panel, neither column fits below it: ladder right, Node just under the panel, chips as a
  full-width bottom strip **two or three per row** (532 or 350.7 wide). Never four or five across:
  258 and 205 are narrower than the strings, and that is what produced 79 chip collisions.

Two constraints the constant block does not state and that bit repeatedly. First, the trunk has to
run in the `540..660` corridor to clear both columns and still leave a face midpoint, so **the actor
box it leaves must be centred on `WL.SPINE_X`** (which is why several cards carry a first actor box
of `420..780` rather than `420..640`). Second, `node()` draws its own label at `NODE_Y + 18`, so the
Pod row needs about 24 units of top padding or the frame label lands inside the first Pod.

**Do not close a `CENTRE` finding by stretching a strip or widening a frame.** The pass that
introduced the collisions did exactly that, to make the chip strip straddle 600, and the rule went
green on a drawing the author rejected. If a finding can only be closed by making the picture worse,
leave it open and write the reason into `docs/CARDS.md`; four in the catalog are left that way.

**`LAYOUT.CONNECTOR_DOWN/UP`, `connectorPacket` and `connectorPacketDir` are gone.** They were one
hardcoded left-margin dogleg used only by workloads, and every card ALSO kept its own copy of the
same points in its `pathArrow`: the wire and the ball stood on two independent copies of the same
numbers, which the "same points array" rule exists to prevent. Each card now owns a `SPINE` that
feeds both. If you remove a shared kit export like this, **run `smoke-all` immediately**: `node
--check` does not catch a missing import, and neither does canon or geometry.

### Recurring traps (each of these shipped in more than one card)

None of these are caught by the gate. All of them were found by `anim-dump` or by looking at a rendered frame, never by reading the source, which is why they survived review.

**A green rule is not a looked-at card.** In 2026-07 an R5 pass relaid 35 cards to zero findings in `check-geometry` and reported them done on that basis, having actually looked at six rendered frames out of thirty five. All three regressions the author found were invisible to the rules: value chips whose name overlapped their value (79 of them), a composition pushed to the right, and a lane ending in empty space. `CENTRE` measures the bounding box of blocks, and a full-width Node frame dominates that box no matter where everything else sits, so the rule passes while the drawing is unbalanced. **Look at every card you touched, not a sample.**

All three were repaired later the same day, and the repair produced a fourth defect of the same family (taps that outlived their Pods on five cards), which again only a render showed. The rule that came out of it: **a card is done when someone has opened its rendered frames, not when the tool is quiet.** The whole R5 queue across all four categories was closed on that basis, 38 cards, every one looked at.

**The `pulsePod` descendant trap.** `pulsePod` finds its targets with `podEl.querySelectorAll('.scheme-pod, .scheme-box')`, and `querySelectorAll` matches **descendants only, never the element itself**. So a pod passed in as a bare `pod()` element matches its own `.scheme-pod-rect` child (the stroke half of the pulse) but never itself (the brightness half), and the pulse silently fires at half strength. Same bug if the inner box is appended to the root as a *sibling* of the shell instead of into the group. Always wrap: `const g = g({}); g.appendChild(shell); g.appendChild(innerBox);` and pulse the group. Symptom in `anim-dump`: the pod has `strokeOpacity` rows but no `filter` row.

**But "wrap" does not mean "wrap everything", and this note used to say it did.** A later author decision (2026-07-16, stated on `storage-emptydir`) settles what goes INSIDE the pulsed group: the Pod SHELL is the only thing that pulses, inner container blocks never do, and their `.highlight` goes on at step entry in the same beat. The way to get that is to wrap the **shell alone** so `pulsePod` cannot reach the inner boxes, which is the opposite of what this paragraph asks for. Both are right about different things: the bare-`pod()` case (no wrapper at all) really is a half-strength pulse and must be fixed, while a shell-only wrapper with sibling inner boxes is the decision working as intended. `network-dns-coredns` draws its three plugin boxes as siblings of the shell for exactly that reason and was filed as a defect on this paragraph's authority twice before the decision was found. Check the intent before "fixing" one.

**Every ball rides a drawn wire, and return traffic gets its own lane.** Two separate failures, both common:
- A ball animated to a target that has no wire under it. It flies over blank canvas. Draw one wire per destination: if a step can send a ball to any of N blocks, draw N wires. Build the wire and the ball from the **same points array** so they cannot drift.
- A return ball re-using the outbound arrow. It reads as the query bouncing, not as an answer coming home. Give each direction of each hop its own lane, offset by `LANE_DY` (12) around the flow line. Bit `network-dns-records`, `network-nodelocal-dnscache` and `network-headless-service`.

A static wire with **no** ball is fine (it is a relationship, not a route), but then it must have **no arrowhead** either, or it reads as traffic. `arrow()` always attaches a marker, so draw those as a bare dashed `path` or `line` carrying `class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-<role>'` plus `stroke-dasharray: '5 5'` and `fill: 'none'` (see the Service-to-CoreDNS line in `network-headless-service`). **Use `relationPath({ points, d, role, dash })` from your category kit.** It was added to `scheme-kit.js` on 2026-07-27 to retire 28 hand-rolled copies of that class string spread over 26 cards, and the copies had already drifted: five omitted the `scheme-arrow-<role>` suffix (which drops the stroke to a fallback colour), four omitted the dasharray, and three used `'4 6'` or `'4 4'` where the rest use `'5 5'`. Those values were carried across as they render rather than normalised, because normalising them would have been an undeclared visual change to 28 lines in one pass. Pass `points` (the same array the ball uses, so the two cannot drift); `d` is the escape hatch for the three cards that build a multi-subpath spine by hand. The one line NOT converted is `network-model`'s `podWire`, which wears the same class string but carries `marker-start` and `marker-end` and is animated as live traffic: it is a route, not a relationship. `network-hostnetwork-hostport` shipped an `arrow()` here whose lane no ball ever rode, on every step, until 2026-07-27.

**A block that does not exist yet dims, its lanes disappear.** Two different answers for two different shapes. Removing an absent BLOCK leaves a block-sized hole in its row, which reads as a rendering fault rather than as an absence, so draw it at a placeholder dim (0.45) with a sublabel stating it is not there yet, and bring it to full when it is created. Its LANES are the opposite: an arrow into an object that does not exist points at nothing, and unlike the box it leaves no hole when it goes, so pin lanes to 0. `storage-volumeattachment` pins the two on separate axes for exactly this reason. The same dim doubles as the terminal state after a delete.

**This is catalog-wide, not a storage note, and the trunk-plus-bus shape re-creates it one layer down.** The 2026-07-27 R5-a pass replaced "one spine that stops on the Node frame edge" with "a trunk to a horizontal bus, then one tap down into each Pod", which fixed the lane-into-nothing defect and immediately reproduced it on five cards, because the taps outlived their Pods: `cluster-node-drain` ended its last step drawing two arrowheads into an empty Node frame. Three rules, in order:

1. Pin Pod opacity and lane opacity in **one** helper (`setLanes` / `setPods`, or an `idx === SLOT_N` branch inside the card's existing `setPod`). Two independent assignments drift the moment a step is added.
2. **Split the bus.** Hiding only the tap leaves the bus running on to a slot with nothing under it, so cut it at the centre slot and give each half the opacity of the ordinal it reaches.
3. A lane that CARRIES a ball this step must be visible during the flight: pin its final value above the `ctx.reduced` guard and animate `[{opacity:1},{opacity:0}]` with `fill: 'both'` and the same `delay`/`duration` as the Pod fade below it. `fill: 'both'` holds keyframe one through the delay window, so the lane is on screen while the ball rides it.

Nothing in the gate sees any of this: `check-geometry` scores where a lane ENDS, not whether anything is drawn there. Only a render shows it.

**Widening a layout lengthens its routes, which changes its durations.** `routeDur` is length-based, so a composition change is silently also a timing change: re-widening `storage-volumeattachment` took one route from 152 to 952 units, 340ms to 2116ms, and pushed two step spans past their `duration` where the auto-advance would have cut the packet off mid-flight. After ANY geometry change, re-run `anim-dump` on every step, not just the one you moved.

**A step's `duration` must outlast its own motion.** `anim-dump` prints `span=<ms>` per step: that is when the last animation of the step finishes, pulses included. If `span > duration`, auto-advance cuts the step off mid-flight and the card silently under-shows what it narrates (a four-query walk that only ever plays two). Check every step, not just the one you edited: adding a pulse-on-arrival to the last hop pushes `span` out by `PULSE_POD.ms` (900).

This sat in the checklist unmeasured until 2026-07-26, when a sweep found **78 steps across 37 cards** already over budget, the worst at 5220ms against 3600ms. All were fixed by raising `duration`, never by shortening motion: the ball's pace is `routeLength / 0.45`, so a longer arrow takes longer on purpose, and speeding one up to fit a budget would break that. The catalog is at 0 today.

**The pace is only proportional in the middle of its range**, and that is worth knowing before tuning anything: `routeDur` clamps to `[700, 2600]`, and 443 of the catalog's 617 packets sit on the 700ms floor with route lengths from 24 to 314 units. A 24-unit hop and a 314-unit hop therefore take the same time. The floor exists because 24 units at 0.45 is 53ms, which is invisible, so it cannot simply be removed.

**Chips.** Two rules, both about not lying to the reader:
- Every `enter()` must set **every** chip, not only the ones the step narrates. This one is review-enforced on purpose: a check for it was written in 2026-07-26 and **deleted**, because it cannot tell its true positives from its false ones. It reported 132 steps, and the first checked by hand was correct behaviour (`cluster-admission-webhooks` leaves `objChip` alone on four steps because the object really does stay as the mutating stage left it). A machine can test the coding convention, not whether a carried-over value is still true, and the second is the thing that matters. A chip left unset keeps the previous step's value, which is how a card came to display `conntrack: no entry` on the exact step where it opens a DNAT-ed connection. Give the card one `setChips(s, {...})` helper that writes all of them, and call it from every step.
- A chip must always mean what its name says. A chip labelled `DNS answer` showing `connect 10.244.3.4 direct` is not a DNS answer. If a step needs to report something else, that is a second chip, not a reused one.

**The safe-zone is an L, not a forbidden box.** The overlay covers the TOP-LEFT quadrant only, so the usable area is L-shaped: the full width below the overlay's bottom, plus the full height right of its right edge. Reading it as a box (content must be both right of x and below y) is how `storage-volumeattachment` ended up with two 176-wide columns squeezed into the middle third of a 1200 unit canvas under a 980 unit chip strip, with the entire bottom-left quadrant and the right third empty. Rebuilt on the L, the same content took 232-wide blocks, a 208 unit corridor, and put the disk in the free bottom-left corner. When a card feels cramped, check this first: the room is usually already there.

**The narration panel is measured per card, and never on one viewport.** The old blanket rule (`x<=380 & y<=300`) was never a measurement, and it is wrong in both directions. Measured over 1600 / 1440 / 1280 / 1100:

- the RIGHT edge is `x<=397` on every card, so **nothing starts left of 420** unless it also sits below that card's panel bottom;
- the BOTTOM is per card and ranges **171 to 504**. `workloads-pod-phase-machine` carries the longest narration in the catalog and its panel covers more than three quarters of the canvas height on the left.

The extent in viewBox units changes with the viewport **non-monotonically**, which is the part that bites: the panel is HTML at a fraction of the dialog width while the diagram is an SVG that scales with it, so a WIDER dialog gives a WIDER panel that wraps into FEWER lines and is therefore SHORTER. The same card measures `x<=291, y<=212` at 1600 and `x<=397, y<=159` at 1280. A rule that samples one viewport reports false findings in one direction and misses real ones in the other, which is exactly what the first version of `OCCLUDED` did.

Every rebuilt card records its own measurement in its header comment together with the note that a longer narration invalidates it. `node check-geometry.mjs --rules=occluded` is the check; `overlay-measure.mjs` gives the raw numbers per step.

**On 2026-07-27 this was measured for the first time and 47 blocks across the catalog were sitting under the panel**, including the Scheduler box of `cluster-scheduler-decision`, the card this file names as the Cluster exemplar. Nothing had ever looked.

## Where card notes live (`docs/CARDS.md`)

**A card file carries code, not prose.** Any comment block of **three lines or more** belongs in
`scheme/docs/CARDS.md`, under a `## <card-id>` heading, anchored by the line of code it sat above.
One and two line clarifications stay next to the code they explain, and trailing comments on a
constant (`const STACK_TOP = (640 - STACK_H) / 2;  // 18, and the bottom margin matches it`) are
exactly right where they are. Each card links to its section with a single pointer under its imports:

```js
// Design notes for this card: scheme/docs/CARDS.md#storage-multi-attach-error
```

The rule covers the whole shipped tree, not only the cards. Card-scoped notes (including each
card's poster, since `POSTERS` is keyed by card id) go to `CARDS.md`; notes on the shared files go
to `docs/INTERNALS.md` under a `## <file path>` heading. `scheme/tools/` does not relocate (a standalone script's header is how you learn to run it) but it
is **capped at 2 to 3 lines per block**: the long version of any tool's reasoning belongs in the Dev
tools section below, and writing it in both places is how 330 comment lines piled up across nine
scripts before they were cut to 152. `cli/` is a different sub-app and outside this review.

This is not tidying, it is where the geometry record lives. **If you need to understand or change a
card's layout, read its `CARDS.md` section first, and for anything in `js/lib/` or the CSS read
`INTERNALS.md`.** It holds what the code cannot say: measured
overlay extents per viewport, why a width is what it is (`CONTENT_W 400` is solved for, not chosen,
because it puts `CONTENT_CX` exactly on 600 where the chip strip sets the visual centre), which
numbers are hard floors and what binds them, and which alternatives were tried and dropped. Deleting
a note is deleting a measurement someone had to take with a browser.

The split moved 3987 lines out of 86 cards (comment ratio 27% -> 4-7% per category) and a further
710 lines in 106 blocks out of the 11 shared files: `posters.js` went from 19% to 1%, `scheme-kit.js`
from 28% to 4%. When a new card or helper grows a design essay, it goes to the matching markdown the
same way. When a card is renamed, rename its heading too.

Neither markdown ever ships. Three separate exclusions keep the whole `docs/` directory out, and all
three must hold:
`deploy.yml` runs `rm -rf _site/scheme/docs` next to where it strips `scheme/tools`; `release.yml`
lists `scheme/docs/*` in the zip's `-x`; `.dockerignore` lists `scheme/docs`. The three are not symmetric, which is why the rule needs stating rather than inferring:
`deploy.yml` and `release.yml` work off explicit ALLOWLISTS, so a new internal file at the repo root
is excluded by default there and only `.dockerignore` has to know about it, while anything under an
already-copied directory (`scheme/`, `cli/`, `images/`) must be named in all three. The container is
the cheapest place to catch a miss, because `Dockerfile` is a blanket `COPY . .` and only
`.dockerignore` stops it: `curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/scheme/docs/CARDS.md`
must return 404. It returned 200 once, which is how this exclusion got found.

## Writing rules (scheme strings)

- **No apostrophes** in narration/wire/chain strings: they are single-quoted JS, and an apostrophe (`container's`, `don't`) breaks the module load. Reword. Verify with a browser smoke, not just `node --check`.
- **No semicolons** in narration prose: replace `;` with a comma, or a period + capital letter.
- **No em-dashes** anywhere.
- **Terminology is a dictionary, not taste.** `scheme/tools/terms.json` is the source of truth and `check-terms` enforces it. Two decisions there are deliberately NOT the upstream ones: the catalogue majority wins (so `Kubelet`, `ETCD` and `Node-1` keep their capitals although kubernetes.io writes them lowercase), and `Node`, `Pod`, `Service` are ALWAYS capitalised including in ordinary phrasing. `kubectl` is always lowercase, because 20 of its 22 prose occurrences are copy-pasteable commands.
- **Technical text gets read twice, by different eyes.** This is a rule, not a nicety: 87 cards that one reviewer had closed yielded 31 real defects on a second pass. Three techniques, in order of yield: (1) **internal contradiction**, where a card disagrees with its own other steps, its own diagram labels, its own `aria-label` or a sibling card, which found more than half of everything and needs no network; (2) a genuine **second opinion** from someone who did not write it; (3) **checking against kubernetes.io**, which is the expensive one but the only thing that catches staleness like the IPVS deprecation in 1.35 or `node-monitor-grace-period` rising to 50s.
- **A mass automated pass over text must be followed by reading it.** Four separate times in one session an automated pass produced green linters and broken prose: duplicated prefixes (`The The The startupProbe`), broken grammar after a reworded sentence opening (`You run kubectl set image ... PATCHes`), a word dropped so a question no longer parsed, and 29 conditions cut to fit a character band. The linters check form; what breaks is meaning.
- **One object, one label, across cards.** Enforced by `check-labels` since 2026-07-26. The same thing must not be `nodefs` on one card and `Node FS` on the next (it was, on `storage-ephemeral-storage-eviction` and `storage-csi-architecture`, until both became `NodeFS`). Block labels capitalize the FIRST word only (settled 2026-07-26 over Title Case, which held 34 labels against 95): a later word takes a capital only when it is an API object, an acronym or an identifier, so `Routing decision`, `CSI controller` and `Global staging mount`, but `ConfigMap app`, `Pod A bind mount` and `Ingress controller Pod`. Hyphenated names capitalize only the first segment (`External-attacher`), and bare identifiers keep their real casing (`va-7f`, `web-0`, `node-1`). A node frame is the exception you cannot fix in the string: `.scheme-node-label` is `text-transform: uppercase` catalog-wide, so `node-1` renders `NODE-1` on every card and must stay that way.

## Dev tools (`scheme/tools/`, Node, not shipped)

**The container serves a SNAPSHOT.** `Dockerfile` is `COPY . .` with no mounts, so after editing
anything under `scheme/` the container on `:8080` still serves the old files and every tool, the gate
included, silently checks stale content and passes. This has produced false green runs. Either point
the tools at the live tree with `BASE=http://localhost:8888 npm run gate` (the python server reads
from disk), or rebuild first. Confirm with
`curl -s http://localhost:8080/<path> | md5sum` against `md5sum <path>`.

**Colour is covered by `check-palette`, and that check is baseline-free on purpose.** It asserts
internal consistency rather than recorded values: one `(category, element class, role, state)`
tuple must resolve to ONE colour across the whole catalog. A selector typo that drops some cards
to the fallback stroke shows up as a SPREAD; a misspelled role value shows up as UNKNOWN; an
element carrying a role that paints nothing shows up as UNPAINTED. Currently 1294 painted elements
over 23 tuples, all consistent.

Two things it taught on its first run, both worth keeping in mind when extending it: state has to
be part of the key, because `.highlight` legitimately repaints to the bright tint stop and a lit
chip next to a resting one is not a defect; and it has to run under `reducedMotion`, because
`pulsePod` fills forwards onto the tint, so on a played card you read the animation's end state
back and "the pulse base equals the resting stroke" looks true whether or not it is.

Own `package.json` (Playwright + pngjs). Stripped from the deploy and release artifacts. Verify animation changes with these rather than eyeballed screenshots. When refactoring a card's animation, lead with `anim-dump` (motion as data) and `frame-strip` (motion as frames), then the gate. Browser is auto-resolved by Playwright (no hardcoded path); set `PLAYWRIGHT_CHROMIUM` only to point at a system browser, `BASE` to override the `:8080` dev server.

- `check-canon.mjs`: source lint for the packet-motion canon over all four categories (`COVERED = /^(workloads|cluster|network|storage)-.*\.js$/`). No browser, no baselines. Three rules: (1) no explicit `dur` on the multi-point route wrappers, barring an `ALLOW_EXPLICIT_DUR` allowlist of cards that deliberately slow a route so a riding src-IP tag stays legible. Today that means `routePacket` alone: the lint's `ROUTE_WRAPPERS` still lists `connectorPacket` and `connectorPacketDir`, but both were deleted from the kit in the R5 relayout (see "The Workloads layout canon"), so those two entries are dead names kept only so an old card cannot sneak back past the rule (`segmentPacket` and `topPacket` are not linted, an explicit `dur` there is fine); (2) no removed symbols (`arrowPacket`, `wirePacket`, `pulseActiveBlocks`); (3) no per-call `ripple:` option, since ripple is unconditional. It does **not** check `makeInit` / `posterFirst`, kit-vs-`scheme-kit` imports, the `clearHL` prologue, or `ctx.reduced` guard placement: those are convention, enforced by review. It covers the whole catalog; a new category joins the `COVERED` regex once its cards are on the kit.

  Beyond those three hard rules it carries **report-only** rules, printed with a per-rule count and listed in full under `CANON_VERBOSE=1`. A new rule lands report-only so the gate stays a signal while the queue it opens is drained, and moves into the `ENFORCED` set (becoming a hard failure, hence a regression guard) once its finding list is empty. Current state: **all nine rules are enforced, none is open.** `R-rawpulse` (no direct `pulse()` from primitives), `R-ridinglabel`, `R-kitparity` (the four category kits must re-export the same set from `scheme-kit`, currently 25 names), `R-desc` (every description inside 400-470 characters and 2 to 4 sentences), `R-dash` (no em-dash or en-dash anywhere, scanning `scheme/` plus `cli/js/data.js`, `cli/css/styles.css`, `cli/js/app.js`, the root `index.html` and `README.md` by agreement; `scheme/docs/*.md` is deliberately outside that area), `R-srclabel` (one source URL carries one label catalog-wide), `R-srcdup` (no card shows two sources under the same label), plus `R-opacity` and `R-viewbox`, both closed on 2026-07-27.

  `R-opacity` is worth reading next to `R-ridinglabel` as the second template for a rule that can be enforced. Its first version fired on a literal next to the word `opacity`, which made it blind to the named constants carrying most of the meaning (`GONE` was 0.1 / 0.12 / 0.15 / 0.35, `DIM` was 0.4 / 0.45 / 0.5 / 0.6 / 0.75) and would have blessed the very drift the vocabulary exists to close. It now judges the **expression, not the number**: a bare `0` or `1` passes, `OPACITY.*` passes, anything else is a finding. A named constant cannot smuggle a shade past it by construction rather than by the completeness of a list. Values that reach an element through a helper PARAMETER are out of a source lint's reach entirely, and that is what `check-opacity` is for.

  `R-viewbox` closed the same day: all 103 cards are on `0 0 1200 640`. A shifted camera is how an off-centre composition gets hidden instead of fixed, and `cluster-delete-flow` was a live example, its `-100 7 1200 620` making a composition centred on 500 look centred.

  `R-ridinglabel` is worth reading as a template for writing a rule that can actually be enforced. It began by flagging any `ridingLabel` call with no easing in a card that mentioned `segmentPacket` anywhere: 33 findings, 15 of them false, unenforceable. A tag and its ball are built from the **same points array**, so the rule now looks up that array in the card's packet calls and reads whether THAT ball is linear. 41 tags ride a linear ball, all 41 name their easing, 0 findings, enforced. The lesson: a rule that cannot tell its true positives from its false ones is not a rule, it is a report. Rules about code read a **comment-stripped** copy of the source: this project's comments discuss the very things the rules hunt for, and scanning raw text made `the Pod pulse (900) ends at 2400` read as a `pulse()` call in 17 places.
- `smoke-all.mjs`: loads every scheme and walks every step **twice**, asserting no console error or page exception either time. The second walk is the load-bearing one: pass 1 uses `gotoStep` under no motion (the static path prev/reset takes), pass 2 uses `_shared.mjs`'s `enterStep`, which runs each step's real `enter()` with `reduced:false` and freezes it. Without pass 2 nothing below `if (ctx.reduced) return;` ever executes, so a ReferenceError in any packet, pulse or riding-label call passes the gate: the whole motion canon was uncovered until this was added. `Timeline` swallows a throwing `enter()` into `console.error`, which the listener turns into a failure. Discovers ids via `discoverIds`.
- `check-reduced.mjs`: enters every step twice, once played-and-seeked past its own span and once statically via `gotoStep`, and diffs the resting opacity of every block. That is the `ctx.reduced` contract: what prev/reset shows must equal what playing forward showed. Given ids it is verbose per card; given none it walks the whole catalog terse, which is the gate path. **In the gate.**
- `check-geometry.mjs`: geometry lint in viewBox units over every step. Reports `THROUGH` (a lane crossing a block it neither starts nor ends on), `DIAGONAL` (a slanted segment in an orthogonal grammar), `OFFEDGE` (a lane endpoint **alone** on a face and off its midpoint), `OCCLUDED` (a block whose area sits under the narration panel, judged on area over several viewports, added 2026-07-27 and worth 47 findings on its first run) and `CENTRE` / `CENTRE-LOW`. Three things make its output trustworthy, and all three were fixes to the TOOL, not to cards:
  - OFFEDGE judges a face as a whole, so two lanes meeting it at mirrored offsets (+d and -d) are a deliberate pair whatever d is. That alone took the count from 179 to 16 (13 until the legacy numeric allowance was dropped, which had been hiding 3 unpaired endpoints at blessed offsets).
  - `d` is parsed **per subpath**: every `M` starts a new polyline. Reading the numbers as one flat list fabricates a segment from the end of one subpath to the start of the next, and those phantoms were the entire DIAGONAL report (5 findings on `network-cni-invocation` and `network-model`, both of which draw a spine plus its taps in a single path). DIAGONAL is now 0. A phantom can also cross a block and surface as a false THROUGH, so this was never only about diagonals.
  - CENTRE measures the **real** narration overlay per card instead of assuming the blanket safe-zone, so `CENTRE-LOW` can single out content that sits below the overlay and is still off-centre with the full width free.

  **Each rule counts a different set of elements, and knowing which one decides whether a finding is closable.** Read this before spending an afternoon on a CENTRE-family report:

  | rule | node frames | chips / ladder rows |
  |---|---|---|
  | CENTRE (content bbox) | **counted** | not counted |
  | CENTRE (chip strip) | not counted | **counted**, and `chainList` rows carry `.scheme-chip` |
  | CENTRE-LOW | **excluded** (`!b.isFrame`) | not counted |
  | OCCLUDED | excluded | not counted |
  | OFFEDGE | counted | not counted |

  Both of the opposite traps are live at once, of different rules: a full-width Node frame DOMINATES the CENTRE content bbox (which is how a lopsided drawing passed), while a card whose balance comes from a frame or a ladder is INVISIBLE to CENTRE-LOW (which is why three of the four survivors cannot be closed). The chip-strip rule pooling ladder rows is also useful in the other direction: putting the ladder in one column and the value chips in the other keeps the strip spanning `60..1140`, which is why the A/B layouts pass CENTRE without anything being stretched.

  One asymmetry is a plain inconsistency rather than a design choice: `ovBottom`, the threshold CENTRE-LOW uses for "below the overlay", accumulates **only in the 1600-wide loop**, while the 1280 and 1100 passes feed `ovRects` for OCCLUDED and never update it. So a block can be judged low against the shallowest panel and still be occluded on a narrow viewport. Left as is on purpose: changing it moves the CENTRE-LOW queue, and that is a decision, not a fix.

  **In the gate on `--rules=diagonal,through` only.** That is now conservative rather than necessary: R5 closed across all four categories on 2026-07-27, and a bare `node check-geometry.mjs` over the catalog returns **4 findings, all deliberate**, so DIAGONAL, THROUGH, OCCLUDED and OFFEDGE are all at zero and only CENTRE and CENTRE-LOW still report. Measured 2026-07-27:

  | card | rule | why it is left |
  |---|---|---|
  | `network-ipam-pod-cidr` | CENTRE-LOW | which Node holds the Pod IS the content, and the rule excludes Node frames from its span |
  | `network-externaltrafficpolicy` | CENTRE-LOW | same: "no local backend on Node-2" is the point, moving the Pod would lie |
  | `network-cni-invocation` | CENTRE-LOW | the right half is a `node()` frame full of `chainList` rows, and CENTRE-LOW counts neither frames nor chips |
  | `storage-reclaim-policy` | CENTRE | both columns are pinned by a PVC row that must clear the panel, and the only way to pass is a full-width strip, which is the metric-chasing that caused the R5-a regressions |

  So `--rules=occluded,offedge` could join the gate as regression guards; CENTRE and CENTRE-LOW cannot, because these four will not close. Run it bare to see the current state.
- `check-opacity.mjs`: the fade-phase rule, measured in the browser rather than read off the source. Two things a source lint cannot do: it resolves every helper parameter and ternary (53 cards route their shades through a `setStage`-style helper), and it sees the value a keyframe actually animates to. Three rules. **PHASE**: every opacity a card pins or animates is `0`, `1`, or an `OPACITY.*` shade. It reads `el.style.opacity` and the keyframes of registered animations, never the computed style, so a CSS presentation shade (`.scheme-pod-container`, `.scheme-grid-cell`) is out of scope by construction: those are presentation, the vocabulary is state. **ORDER**: a Pod that fades out must pulse first, because fading a Pod while it is still blinking reads as two events at once. **LIT**: nothing holds `.highlight` while sitting at the terminated shade. Two exclusions are load-bearing and were both false-positive fixes: the packet layer is motion, not state (a ripple opens at 0.95), and an opacity track that returns to where it started is a BLINK, so only its resting value is a phase. **In the gate.**
- `check-chipfit.mjs`: does a value chip's NAME collide with its VALUE? A chip is name-left, value-right inside one rect, so a chip too narrow for its longest value renders the two strings on top of each other. **Nothing else looks at this**: `check-inline` reads the strings, `check-labels` compares them across cards, `check-geometry` measures blocks, and none of them measures whether a string FITS. Written 2026-07-27 after an R5 pass narrowed value chips to build a full-width bottom strip and produced 79 collisions across 21 cards (`spec.unschedulabSehedulingDisabled`). It measures RENDERED text and walks every step, because a chip only overflows on the step carrying its longest value. Its queue closed on 2026-07-27 at 0 collisions catalog-wide and it went **into the gate** the same day, as a regression guard rather than a report: it is the only check that can tell you a chip has become unreadable. It needs a browser and walks every step of every card, so it is the second most expensive link in the chain after `smoke-all`. `npm run chipfit`.

  One false-positive class was fixed in the tool rather than in the cards, and it matters when reading the historical numbers: a chip that draws two STACKED texts (a heading over a sub-line, as in the event slots of `cluster-api-structure`) is not a name/value pair and cannot overlap horizontally, so texts whose vertical centres differ by more than 4 units are skipped. That plus one chip whose value is a single space means the famous "79 collisions" was really 73.
- `check-duration.mjs`: a step must outlast its own motion. `routeDur` is length-based, so any geometry change is silently also a timing change, and when `span > duration` the auto-advance cuts the step off mid-flight and the card under-shows what it narrates. This sat in the checklist unenforced until 2026-07-27; the R5 relayout of cluster and workloads pushed 9 steps over budget and this caught all nine. **In the gate.**
- `check-terms.mjs` + `terms.json`: terminology and casing in PROSE (`SCHEMES[].desc`, every `narration:` string, and every `aria-label`). No browser. **In the gate.** The `aria-label` was added 2026-07-26 and was worth it: 103 of them had never been scanned by anything, and the first run found 89 casing defects plus four cards whose aria-label still asserted what a text pass had just corrected in their narration. `OPEN` deliberately skips them, because an aria-label is a label read aloud rather than a sentence, so opening one with `hostNetwork` or `emptyDir` is right and the only rewrite the rule would allow is `Hostnetwork`. The dictionary has three classes and the difference decides what the tool says about a sentence opening: `hard` is one correct capitalised form, `hardLower` is a NAME that must never be capitalised (so opening a sentence with it is a REWORD, not a casing slip), `soft` is also an ordinary English noun so the tool prints the distribution and a human judges. `exceptions` lists contexts where a term is a literal and its casing is not ours: `kubernetes plugin`, `Service api`, `pod CIDR`, `nat table`, `node affinity`. Add one only after checking every occurrence catalog-wide, or the exception hides real defects.
- `fix-terms.mjs`: applies the CASE class of `check-terms` in place, importing the same matcher from `prose.mjs` so the fixer cannot disagree with the linter about what a defect is. Only CASE is automated: REWORD and OPEN need a human sentence. `--dry` first, always.
- `check-inline.mjs`: casing AND component names of strings drawn ON the diagram. Eleven sites, listed once in `prose.mjs` as `INLINE_SITES` and shared with `check-labels` so the two cannot disagree about what counts as drawn text: `label`, `setBoxLabel`, `sublabel`, `name`, `value`, `setVal`, `set*Sublabel`, `setWire`, the card-local helper params `ip` / `sub` / `tag` (53 cards define such a helper and 108 strings reach the canvas through one), and `chainList` rows. Those last two groups were added 2026-07-26 after four chain rows were found rendering `Api` and `Kubectl` beside blocks correctly labelled `API` and `kubectl`: no check had ever looked at a ladder row. **In the gate.** The casing half is system A. The NAME half reads `terms.json`'s `inline.components`, holds only names that are objectively wrong (a missing hyphen, a Title-cased acronym) and never names that are merely inconsistent, because those belong to `check-labels` where a human picks the winner. Its list of never-capitalise names is seeded from `hardLower` rather than repeating it, so correcting a label to `containerd` cannot make the casing rule demand the capital back. `--audit` prints what the classifier LEAVES ALONE with the reason, which is the only way to see what an exception list is hiding: it hid 936 strings and a read of them yielded 12 real fixes. System A: a block label is a heading and takes a capital, everything else on the canvas is body text and stays lowercase. Only the FIRST TOKEN decides, because the rule is about the first character, and a token that is an identifier, an acronym, a gRPC method or a published API word is untouchable. `--fix` applies it. A Title Case string across several words is reported `MANUAL` rather than fixed, because lowering only the first character would leave `root Filesystem`.
- `check-labels.mjs`: the OTHER half of B7, and the one `check-inline` cannot reach. It asks whether the catalog spells ONE object ONE way, which is the "one object, one label" rule below. **In the gate.** Two things make it a rule rather than a report. First, strings are compared only inside their own position class: a heading against a heading, body text against body text. `Conntrack` over a block and `conntrack` in a chip is system A working, not drift, and without that split the tool says otherwise. Second, the value class is printed but never fails, because that is where an API literal and an English word wear the same letters (`MemoryPressure False` against `cordon false`, `Terminated` against `terminated`) and only a human can tell them apart, exactly like the SOFT block of `check-terms`. Verified homographs live in `terms.json` under `inline.homographs`, each with its reason: `forward` is the CoreDNS plugin against the netfilter chain. Its first run found 11 drifts, including `App` on 15 storage cards against `app` on 59.
- `check-figures.mjs`: the arithmetic a reader does across one diagram. Two classes, both of which had only ever been found by accident: one Pod address on two different Pod blocks, and a request above its own limit (a Pod the API server rejects outright). Strings are anchored to the nearest preceding block label so a finding names the two blocks, and owner identity is the label's POSITION, not its text, because one card draws two distinct Pods both labelled `Pod web`. **In the gate.**
- `check-notes.mjs`: does every design note still point at code that exists? `docs/CARDS.md` anchors each note to the line it sat above (`### before `<code>``) and **nothing had ever verified those anchors**, so a rename, a codemod or a relayout silently turns a geometry record into a note about a line that is gone. It checks three things: every anchor still occurs in its card, every `## <id>` section has a file, and every card has a section. No browser and no server, so it is the second link in the chain. **In the gate.** Written 2026-07-27; the catalog is at 583 anchors, 0 stale. It also REPORTS (without failing) the cards that carry no design record at all, currently `cluster-admission-webhooks`, `cluster-etcd-raft` and `cluster-leader-election`. What it cannot check is whether a note is still TRUE: three cards were found recording a narration-panel bottom of `y <= 183` measured only on 900 and 1000 tall viewports, where the real worst case over the rule's own viewport set is 205 to 255. An anchor can be perfect and the sentence under it wrong.
- `inline-dump.mjs`: not a check, a reader. Prints a card as text with the `aria-label`, every block as `label -> sublabel`, every chip as `name -> every value it ever takes`, wire labels, chain rows, riding tags and each step's narration. Written because a chip's name is declared two hundred lines above the values it takes, so judging "does this chip mean what its name says" from the source is impractical. `npm run portrait -- <id>`.
- `check-sources.mjs`: liveness of every `sources` href. Four classes: DEAD, SOFT (landed on an ancestor path, a 404 wearing a 200), MOVED, ANCHOR (the fragment is not in the page). **NOT in the gate**, because it hits the network and the gate must be deterministic. Run it when `sources` changes. It caches every fetched page under `.cache/pages` (gitignored) so a text pass can verify claims offline.
- `check-arrival.mjs`: the R2/R3 detector. Enters every step frozen at t=0 and reads packet routes, `arrivalMs`, block bboxes, `.highlight` timing and chip values. R3: a block that RECEIVES a packet must not already be lit at step entry. R2: a value chip whose value changed must carry `.highlight`. Value chips are deliberately OUT of R3 (author decision). **Not in the gate** while its queue is open, which is now down to R3 1 and R2 15, and every survivor has been checked by hand and is correct behaviour rather than a defect.
- `prose.mjs`: the one sentence splitter plus the term matcher, shared by `check-terms`, `fix-terms` and `R-desc` so they cannot drift. Two guards paid for by a false finding: a version number is not a sentence break, and `e.g.` is not a sentence opening.
- `check-palette.mjs`: the colour half of the gate, see the note above. `node check-palette.mjs [<id> ...]`, verbose with ids and terse over the whole catalog. **In the gate.**
- `overlay-measure.mjs`: the same overlay measurement standalone, per step, when a layout needs to reclaim room.
- `anim-dump.mjs`: dump a card's motion AS DATA per step (target, animated props, dur/delay/easing, and transform/opacity sampled at fixed progress %), plus DOM facts (packet count, ball-on-top z-order, highlights, narration). `node anim-dump.mjs <id> [step] [--samples=0,25,50,75,100] [--json]`. Best tool for "is this packet/pulse doing what the narration says" since motion-as-text reads far better than pixels. Diffing two dumps partly replaces the retired play-probe.
- `frame-strip.mjs`: capture N frames per step and stitch them into one PNG. Frames are DETERMINISTIC (each step's play-path is entered with no auto-advance, then every WAAPI animation is frozen at an exact logical time via `currentTime` seeking, not wall-clock sampling). `node frame-strip.mjs <id> [step] [--frames=N] [--contact] [--inspect]`; `--contact` writes one labelled contact sheet (rows = steps, narration in a left gutter). Output under `output/`, gitignored. Manual aid, not in the gate.
- `_shared.mjs`: common Playwright plumbing shared by smoke-all + anim-dump + frame-strip so they cannot drift apart: `launch` (no hardcoded browser path), `setInspect`, `stepCount`, and the deterministic-seek trio `enterStep` / `stepSpan` / `seekStep`.
- The seek path needs a debug handle: `makeInit`'s controller exposes `_timeline` (the `Timeline` instance) on `window.__schemeCtl` under inspect mode, so a tool can run one step's play-path (`tl._enterStep(i, {withTimer:false, reduced:false})`) and seek its animations. Inert in normal use. A bespoke card without `makeInit` lacks it, so the tools fall back to a static frame and warn.
- `npm run gate` chains `check-canon` + `check-notes` + `check-terms` + `check-inline` + `check-labels` + `check-figures` + `smoke-all` + `check-reduced` + `check-palette` + `check-opacity` + `check-duration` + `check-chipfit` + `check-geometry --rules=diagonal,through` (baseline-free, about 35 minutes). `check-geometry` runs only two of its six rules. Since R5 closed, OCCLUDED and OFFEDGE are at zero too and could be added; CENTRE and CENTRE-LOW cannot, because their 4 remaining findings are deliberate (see `check-geometry.mjs` above). `check-sources` is deliberately OUT of the gate because it hits the network and the gate must be deterministic. The retired pixel/packet baseline tools (`visual-regression`, `play-probe`) and the one-off scripts (`capframes`, `split-strip`, `pulse-probe`, `frame-strip-patched`, `strip-multiline-comments`) were deleted in the 2026-06-19 tools cleanup.
- `inspector.js` (`?inspect=1`): grid + bbox overlay in the browser, exposes `window.__schemeCtl`.

## Known constraints

- **No top-level browser globals at module load**, except in `motion.js` and `app.js` (intentional browser-only entry points). `lib/svg.js`, `primitives.js`, `timeline.js`, `data.js` parse cleanly in Node so they can be checked or pre-rendered.
- **`data-cat` is chrome, `data-role` is diagram.** Never merge them back. `app.js` sets `data-cat`
  from the card's category on the card, section, nav button and dialog; `primitives.js` and
  `scheme-kit.js` set `data-role` from the palette slot on diagram elements. `styles.css` selects the
  former, `diagrams.css` the latter, and the two files do not cross.
- **`lib/sidebar.js` is duplicated, not symlinked** with the cli copy. Each path prefix is served in isolation; if you change one copy, change the other.
- `primitives.js` `animateAlong` honors `options.delay` (a bug dropping it caused packets to teleport invisibly during the delay window; do not regress).
