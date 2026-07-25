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
                          pulsePodWithTint, packetAlong + connector/top/route wrappers, clearHighlights/
                          clearWires/setWire, lightBoxAt, makeRidingLabel, setPodSublabel, BEAT/FADE
      workloads-kit.js    per-category wrapper: WORKLOADS_TINT (blue) pulsePod/pulsePodDim
      cluster-kit.js      per-category wrapper: CLUSTER_TINT (violet) pulsePod/pulsePodDim
      network-kit.js      per-category wrapper: NETWORK_TINT (cyan) pulsePod/pulsePodDim
      storage-kit.js      per-category wrapper: STORAGE_TINT (jade) pulsePod/pulsePodDim + setCylinderLabel
      inspector.js        ?inspect=1 grid + bbox overlay, exposes window.__schemeCtl
      tokens.js         dependency-free animation magnitude tokens (PULSE_POD, PULSE_BLOCK, OPACITY, BEAT, FADE) shared by timeline.js + the kits, no import cycle
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
8. **Motion canon (all via the kit).** Only pods pulse (`pulsePod` / `pulsePodDim` for dim pods); infrastructure blocks light via `.highlight` and never pulse. The only sanctioned block blink is `flashChips` / a local `flashBox` on a **packet-less, pod-less** step so it does not read frozen; value chips never blink. Packets: in-diagram hops use `segmentPacket` (linear), multi-point right-angle routes use `routePacket` / connector wrappers (eased, distance-normalized), top-row request/ack hops use `topPacket` (eased). Every packet returns `arrivalMs`; anchor pulses, next hops, and box-lights to `pkt.arrivalMs` + `BEAT.*`, never hard-coded delays.
9. **Packet vs pulse ordering.** Up-arrow (pod to infra): `pulsePod(...,0)` first, packet leaves at `delay: BEAT.afterPulse`. Down-arrow (infra to pod): packet first, `pulsePod(..., pkt.arrivalMs)` on arrival. Chained hops: `delay: prevHop.arrivalMs + BEAT.afterHop`. A rewrite "inside" a box (DNAT, conntrack) hides the ball at one edge and re-emerges it at the far edge instead of sliding over the box.
10. **Narration safe-zone.** Keep essential geometry out of the top-left band (x<=380, y<=300) where the overlay sits; cards reserve it explicitly.

What **varies by card / category** (do not try to unify these):

- Which kit is imported, and the pod tint: workloads blue (`#5bb8ff`), cluster violet (`#c0b0ff`), network cyan (`#4fe5ff`), storage jade (`#5eca94`). Each kit owns its `*_TINT` and its own `pulsePod` / `pulsePodDim`; everything else is re-exported from `scheme-kit` through an explicit 26-name list that is duplicated in all four kits **on purpose**. Collapsing it into `export * from './scheme-kit.js'` would work (a local export shadows a star export) and save 28 lines, but it would erase the boundary this project relies on: the list is what documents what a kit offers, and a card must never reach past its kit. `R-kitparity` keeps the four lists from drifting apart, which was the only real argument for collapsing them. The pulse `base` must equal the pod's **resting** stroke, which is the CSS value before any pulse has run: measure it under `reducedMotion` or a forwards-filled pulse will make you read its own end state back.
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
- [ ] `npm run gate` is green (run from `scheme/tools/`, needs a server at `http://localhost:8080`). It chains, stopping on the first failure: `check-canon` (source lint) then `smoke-all` (no console errors across all 103 cards, walked both statically and PLAYED so motion code actually runs) then `check-reduced` (the reduced-motion contract on every step, 103/103 clean) then `check-palette` (colour consistency, 1293 elements clean). The gate is intentionally cheap and baseline-free for the active-redesign phase; the pixel/packet baseline tools were retired.

## Adding a scheme

1. Create `js/schemes/<id>.js` following the contract (prefer composing `primitives.js` + the relevant kit).
2. Add a `SCHEMES` entry in `js/data.js` (`id`, `title`, `category`, `subcategory`, `desc`, `k8sVersion`, `module: './schemes/<id>.js'`, `tinted: true`, `sources`). Target **400-420 characters, 3 sentences** (tolerance one sentence), catalog-wide. This supersedes the older row-relative rule: sizing each desc against its own subcategory row is what let the spread reach 341 average in workloads against 567 in storage and 655 in the DNS row. The row still matters as a tiebreaker, because grid cards stretch to the tallest in their row, so within a row keep them even. **The existing descs have not been rewritten to this band yet**: that pass is open work, so expect current values well outside it.
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

- **Pulse rule**: block auto-pulse is OFF for every card (`autoPulse: false` is the `makeInit` default in `scheme-kit.js`). Only pods pulse, via `pulsePod`. `flashChips` is the sole block flash, used only on packet-less / pod-less steps. Value chips never flash. (`pulseActiveBlocks` was deleted.)
- **Pulse helper uses `filter: brightness(...)`**, NOT `transform: scale(...)`, because diagram elements are `<g transform="translate(...)">` and a scale would compose-clobber the existing translate.
- **Packets use WAAPI `transform: translate(Xpx, Ypx)`** on a `cx=0, cy=0` circle. Never animate SVG `cx`/`cy` directly (Safari support is uneven). Each packet must represent literal traffic the step narrates, not decoration on a connector.
- **Packet vs pod-pulse ordering**: up-arrow = pod blinks FIRST, packet at `BEAT.afterPulse`; down-arrow = packet first, pulse at `pkt.arrivalMs`; chained hops via `arrivalMs` + `BEAT.afterHop`. Dim pods need an opacity flash so the blink is visible.
- **Motion canon**: routes glide at `routeDur` speed (`PKT_SPEED` 0.45, no explicit dur); hops = `topPacket` (eased) + `segmentPacket` (linear); ripple always (no flag); wrappers return `arrivalMs`; `BEAT`/`FADE` tokens; the ball-on-top exception is kept for 3 control-plane flow cards.
- **Narration safe-zone**: keep essential scheme content out of the viewBox top-left panel (x<=380 & y<=300), where the narration overlay sits. This is a **worst case** sized for the longest narration in the catalog, not a measurement of any one card: see "Recurring traps" for how to measure a specific card's real overlay when a layout needs the room.
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

- **`lightBoxAt(boxEl, ctx, delay)`** adds `.highlight` to an infrastructure box **on packet arrival** (`pkt.arrivalMs`) rather than at step entry, via a zero-effect 1ms animation whose `onfinish` sets the class. Under `ctx.reduced` (or `delay <= 0`) it applies the class immediately, which keeps the reduced-motion static end-state correct. 50 cards call it (26 storage, 24 networking) and they all **import it from their category kit**. It is how a box (or a storage cylinder) "receives" a packet without pulsing, honoring the rule that only Pods pulse. Note the split it creates: the other 53 cards (all workloads, all cluster, 13 networking, 5 storage) still light their boxes at step entry rather than on arrival, which is the open R5 question.

`ridingLabel` is the reason `check-canon`'s `ALLOW_EXPLICIT_DUR` allowlist exists: 4 of its 5 entries deliberately slow a route so the tag stays legible. When adding a card that slows a route, add a `<file>.js:routePacket` entry there with the reason, or the lint fails.

### Recurring traps (each of these shipped in more than one card)

None of these are caught by the gate. All of them were found by `anim-dump` or by looking at a rendered frame, never by reading the source, which is why they survived review.

**The `pulsePod` descendant trap.** `pulsePod` finds its targets with `podEl.querySelectorAll('.scheme-pod, .scheme-box')`, and `querySelectorAll` matches **descendants only, never the element itself**. So a pod passed in as a bare `pod()` element matches its own `.scheme-pod-rect` child (the stroke half of the pulse) but never itself (the brightness half), and the pulse silently fires at half strength. Same bug if the inner box is appended to the root as a *sibling* of the shell instead of into the group. Always wrap: `const g = g({}); g.appendChild(shell); g.appendChild(innerBox);` and pulse the group. Bit `network-dns-coredns`, `network-dns-ndots` and `network-nodelocal-dnscache`. Symptom in `anim-dump`: the pod has `strokeOpacity` rows but no `filter` row.

**Every ball rides a drawn wire, and return traffic gets its own lane.** Two separate failures, both common:
- A ball animated to a target that has no wire under it. It flies over blank canvas. Draw one wire per destination: if a step can send a ball to any of N blocks, draw N wires. Build the wire and the ball from the **same points array** so they cannot drift.
- A return ball re-using the outbound arrow. It reads as the query bouncing, not as an answer coming home. Give each direction of each hop its own lane, offset by `LANE_DY` (12) around the flow line. Bit `network-dns-records`, `network-nodelocal-dnscache` and `network-headless-service`.

A static wire with **no** ball is fine (it is a relationship, not a route), but then it must have **no arrowhead** either, or it reads as traffic. `arrow()` always attaches a marker, so draw those as a bare dashed `path` (see the Service-to-CoreDNS line in `network-headless-service`).

**A block that does not exist yet dims, its lanes disappear.** Two different answers for two different shapes. Removing an absent BLOCK leaves a block-sized hole in its row, which reads as a rendering fault rather than as an absence, so draw it at a placeholder dim (0.45) with a sublabel stating it is not there yet, and bring it to full when it is created. Its LANES are the opposite: an arrow into an object that does not exist points at nothing, and unlike the box it leaves no hole when it goes, so pin lanes to 0. `storage-volumeattachment` pins the two on separate axes for exactly this reason. The same dim doubles as the terminal state after a delete.

**Widening a layout lengthens its routes, which changes its durations.** `routeDur` is length-based, so a composition change is silently also a timing change: re-widening `storage-volumeattachment` took one route from 152 to 952 units, 340ms to 2116ms, and pushed two step spans past their `duration` where the auto-advance would have cut the packet off mid-flight. After ANY geometry change, re-run `anim-dump` on every step, not just the one you moved.

**A step's `duration` must outlast its own motion.** `anim-dump` prints `span=<ms>` per step: that is when the last animation of the step finishes, pulses included. If `span > duration`, auto-advance cuts the step off mid-flight and the card silently under-shows what it narrates (a four-query walk that only ever plays two). Check every step, not just the one you edited: adding a pulse-on-arrival to the last hop pushes `span` out by `PULSE_POD.ms` (900).

**Chips.** Two rules, both about not lying to the reader:
- Every `enter()` must set **every** chip, not only the ones the step narrates. A chip left unset keeps the previous step's value, which is how a card came to display `conntrack: no entry` on the exact step where it opens a DNAT-ed connection. Give the card one `setChips(s, {...})` helper that writes all of them, and call it from every step.
- A chip must always mean what its name says. A chip labelled `DNS answer` showing `connect 10.244.3.4 direct` is not a DNS answer. If a step needs to report something else, that is a second chip, not a reused one.

**The safe-zone is an L, not a forbidden box.** The overlay covers the TOP-LEFT quadrant only, so the usable area is L-shaped: the full width below the overlay's bottom, plus the full height right of its right edge. Reading it as a box (content must be both right of x and below y) is how `storage-volumeattachment` ended up with two 176-wide columns squeezed into the middle third of a 1200 unit canvas under a 980 unit chip strip, with the entire bottom-left quadrant and the right third empty. Rebuilt on the L, the same content took 232-wide blocks, a 208 unit corridor, and put the disk in the free bottom-left corner. When a card feels cramped, check this first: the room is usually already there.

**The narration safe-zone is a worst case, not a measurement.** The blanket rule (keep content out of `x<=380 & y<=300`) is sized for the longest narration in the catalog. A given card is usually far under it, so if a layout needs the vertical room, measure that card's real overlay instead of assuming: step through every step with `_enterStep(i, {reduced: true})` and read `.narration-overlay`'s `getBoundingClientRect().bottom`, mapped back into viewBox units. Measured bottoms have come out at 143 and 163 against the 300 the rule reserves. If you rely on a measurement, say so in the card's header comment **and** note that a longer narration invalidates it.

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
- **One object, one label, across cards.** The same thing must not be `nodefs` on one card and `Node FS` on the next (it was, on `storage-ephemeral-storage-eviction` and `storage-csi-architecture`, until both became `NodeFS`). Block labels are title-capitalized, hyphenated names capitalize only the first segment (`External-attacher`), and bare identifiers keep their real casing (`va-7f`, `web-0`, `node-1`). A node frame is the exception you cannot fix in the string: `.scheme-node-label` is `text-transform: uppercase` catalog-wide, so `node-1` renders `NODE-1` on every card and must stay that way.

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
element carrying a role that paints nothing shows up as UNPAINTED. Currently 1293 painted elements
over 23 tuples, all consistent.

Two things it taught on its first run, both worth keeping in mind when extending it: state has to
be part of the key, because `.highlight` legitimately repaints to the bright tint stop and a lit
chip next to a resting one is not a defect; and it has to run under `reducedMotion`, because
`pulsePod` fills forwards onto the tint, so on a played card you read the animation's end state
back and "the pulse base equals the resting stroke" looks true whether or not it is.

Own `package.json` (Playwright + pngjs). Stripped from the deploy and release artifacts. Verify animation changes with these rather than eyeballed screenshots. When refactoring a card's animation, lead with `anim-dump` (motion as data) and `frame-strip` (motion as frames), then the gate. Browser is auto-resolved by Playwright (no hardcoded path); set `PLAYWRIGHT_CHROMIUM` only to point at a system browser, `BASE` to override the `:8080` dev server.

- `check-canon.mjs`: source lint for the packet-motion canon over all four categories (`COVERED = /^(workloads|cluster|network|storage)-.*\.js$/`). No browser, no baselines. Three rules: (1) no explicit `dur` on the multi-point route wrappers `routePacket` / `connectorPacket` / `connectorPacketDir`, barring an `ALLOW_EXPLICIT_DUR` allowlist of cards that deliberately slow a route so a riding src-IP tag stays legible (`segmentPacket` and `topPacket` are not linted, an explicit `dur` there is fine); (2) no removed symbols (`arrowPacket`, `wirePacket`, `pulseActiveBlocks`); (3) no per-call `ripple:` option, since ripple is unconditional. It does **not** check `makeInit` / `posterFirst`, kit-vs-`scheme-kit` imports, the `clearHL` prologue, or `ctx.reduced` guard placement: those are convention, enforced by review. It covers the whole catalog; a new category joins the `COVERED` regex once its cards are on the kit.

  Beyond those three hard rules it carries **report-only** rules, printed with a per-rule count and listed in full under `CANON_VERBOSE=1`. A new rule lands report-only so the gate stays a signal while the queue it opens is drained, and moves into the `ENFORCED` set (becoming a hard failure, hence a regression guard) once its finding list is empty. Current state: **enforced** are `R-rawpulse` (no direct `pulse()` from primitives), `R-ridinglabel`, and `R-kitparity` (the four category kits must re-export the same set from `scheme-kit`, currently 26 names). **Open, report-only** are `R-dash` (44, no em-dash or en-dash anywhere, and the scan reaches `cli/js/data.js`, `cli/css/styles.css`, `cli/js/app.js`, the root `index.html` and `README.md` by agreement), `R-opacity` (60, element opacity outside the `OPACITY` vocabulary, held until the fade-phase vocabulary is settled) and `R-viewbox` (12, all cluster cards).

  `R-ridinglabel` is worth reading as a template for writing a rule that can actually be enforced. It began by flagging any `ridingLabel` call with no easing in a card that mentioned `segmentPacket` anywhere: 33 findings, 15 of them false, unenforceable. A tag and its ball are built from the **same points array**, so the rule now looks up that array in the card's packet calls and reads whether THAT ball is linear. 41 tags ride a linear ball, all 41 name their easing, 0 findings, enforced. The lesson: a rule that cannot tell its true positives from its false ones is not a rule, it is a report. Rules about code read a **comment-stripped** copy of the source: this project's comments discuss the very things the rules hunt for, and scanning raw text made `the Pod pulse (900) ends at 2400` read as a `pulse()` call in 17 places.
- `smoke-all.mjs`: loads every scheme and walks every step **twice**, asserting no console error or page exception either time. The second walk is the load-bearing one: pass 1 uses `gotoStep` under no motion (the static path prev/reset takes), pass 2 uses `_shared.mjs`'s `enterStep`, which runs each step's real `enter()` with `reduced:false` and freezes it. Without pass 2 nothing below `if (ctx.reduced) return;` ever executes, so a ReferenceError in any packet, pulse or riding-label call passes the gate: the whole motion canon was uncovered until this was added. `Timeline` swallows a throwing `enter()` into `console.error`, which the listener turns into a failure. Discovers ids via `discoverIds`.
- `check-reduced.mjs`: enters every step twice, once played-and-seeked past its own span and once statically via `gotoStep`, and diffs the resting opacity of every block. That is the `ctx.reduced` contract: what prev/reset shows must equal what playing forward showed. Given ids it is verbose per card; given none it walks the whole catalog terse, which is the gate path. **In the gate.**
- `check-geometry.mjs`: geometry lint in viewBox units over every step. Reports `THROUGH` (a lane crossing a block it neither starts nor ends on), `DIAGONAL` (a slanted segment in an orthogonal grammar), `OFFEDGE` (a lane endpoint **alone** on a face and off its midpoint) and `CENTRE` / `CENTRE-LOW`. Three things make its output trustworthy, and all three were fixes to the TOOL, not to cards:
  - OFFEDGE judges a face as a whole, so two lanes meeting it at mirrored offsets (+d and -d) are a deliberate pair whatever d is. That alone took the count from 179 to 16 (13 until the legacy numeric allowance was dropped, which had been hiding 3 unpaired endpoints at blessed offsets).
  - `d` is parsed **per subpath**: every `M` starts a new polyline. Reading the numbers as one flat list fabricates a segment from the end of one subpath to the start of the next, and those phantoms were the entire DIAGONAL report (5 findings on `network-cni-invocation` and `network-model`, both of which draw a spine plus its taps in a single path). DIAGONAL is now 0. A phantom can also cross a block and surface as a false THROUGH, so this was never only about diagonals.
  - CENTRE measures the **real** narration overlay per card instead of assuming the blanket safe-zone, so `CENTRE-LOW` can single out content that sits below the overlay and is still off-centre with the full width free.

  **Not in the gate** while the R5 centring queue is open (16 OFFEDGE, 88 CENTRE, 46 CENTRE-LOW). DIAGONAL and THROUGH are both at zero and could be enforced on their own once the check grows a per-rule switch.
- `check-palette.mjs`: the colour half of the gate, see the note above. `node check-palette.mjs [<id> ...]`, verbose with ids and terse over the whole catalog. **In the gate.**
- `overlay-measure.mjs`: the same overlay measurement standalone, per step, when a layout needs to reclaim room.
- `anim-dump.mjs`: dump a card's motion AS DATA per step (target, animated props, dur/delay/easing, and transform/opacity sampled at fixed progress %), plus DOM facts (packet count, ball-on-top z-order, highlights, narration). `node anim-dump.mjs <id> [step] [--samples=0,25,50,75,100] [--json]`. Best tool for "is this packet/pulse doing what the narration says" since motion-as-text reads far better than pixels. Diffing two dumps partly replaces the retired play-probe.
- `frame-strip.mjs`: capture N frames per step and stitch them into one PNG. Frames are DETERMINISTIC (each step's play-path is entered with no auto-advance, then every WAAPI animation is frozen at an exact logical time via `currentTime` seeking, not wall-clock sampling). `node frame-strip.mjs <id> [step] [--frames=N] [--contact] [--inspect]`; `--contact` writes one labelled contact sheet (rows = steps, narration in a left gutter). Output under `output/`, gitignored. Manual aid, not in the gate.
- `_shared.mjs`: common Playwright plumbing shared by smoke-all + anim-dump + frame-strip so they cannot drift apart: `launch` (no hardcoded browser path), `setInspect`, `stepCount`, and the deterministic-seek trio `enterStep` / `stepSpan` / `seekStep`.
- The seek path needs a debug handle: `makeInit`'s controller exposes `_timeline` (the `Timeline` instance) on `window.__schemeCtl` under inspect mode, so a tool can run one step's play-path (`tl._enterStep(i, {withTimer:false, reduced:false})`) and seek its animations. Inert in normal use. A bespoke card without `makeInit` lacks it, so the tools fall back to a static frame and warn.
- `npm run gate` chains `check-canon` + `smoke-all` + `check-reduced` + `check-palette` (cheap, baseline-free, about 7 minutes). `check-geometry` is deliberately NOT in the gate yet: it still reports the open R5 centring queue, so it would be red for reasons nobody is working on that day. The retired pixel/packet baseline tools (`visual-regression`, `play-probe`) and the one-off scripts (`capframes`, `split-strip`, `pulse-probe`, `frame-strip-patched`, `strip-multiline-comments`) were deleted in the 2026-06-19 tools cleanup.
- `inspector.js` (`?inspect=1`): grid + bbox overlay in the browser, exposes `window.__schemeCtl`.

## Known constraints

- **No top-level browser globals at module load**, except in `motion.js` and `app.js` (intentional browser-only entry points). `lib/svg.js`, `primitives.js`, `timeline.js`, `data.js` parse cleanly in Node so they can be checked or pre-rendered.
- **`data-cat` is chrome, `data-role` is diagram.** Never merge them back. `app.js` sets `data-cat`
  from the card's category on the card, section, nav button and dialog; `primitives.js` and
  `scheme-kit.js` set `data-role` from the palette slot on diagram elements. `styles.css` selects the
  former, `diagrams.css` the latter, and the two files do not cross.
- **`lib/sidebar.js` is duplicated, not symlinked** with the cli copy. Each path prefix is served in isolation; if you change one copy, change the other.
- `primitives.js` `animateAlong` honors `options.delay` (a bug dropping it caused packets to teleport invisibly during the delay window; do not regress).
