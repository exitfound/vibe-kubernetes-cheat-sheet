# Scheme internals design notes

The design record for everything under `scheme/` that is **not one card**: `js/app.js`, the catalog
and poster barrels, the shared `js/lib/`, the four category kits and the CSS. A record about one
card lives in that category's `js/schemes/<category>/CARDS.md`, and posters go there too, under
their card id as a `### poster` subsection.

This file holds DECISIONS about specific code. The catalog-wide RULES a card is held to are
`./CANON.md`, and the sub-app contract is `./CLAUDE.md`.

Each entry is anchored by the line of code that followed it (`### before `<line>``), so a note can
be put back beside its code and `check-notes` can verify the line still exists. **An anchor is DATA:
never reword one.** Each source file links here from a single pointer comment near its top.

**Not deployed.** Four filenames are stripped by name (`CLAUDE.md`, `CARDS.md`, `INTERNALS.md`,
`CANON.md`) and three mechanisms have to agree: `deploy.yml` deletes them from the staged site,
`release.yml` excludes them from the zip, and `.dockerignore` names them too, which is not optional
because `Dockerfile` is a blanket `COPY . .`. Verify with
`curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/scheme/INTERNALS.md`,
which must return 404.

---

## scheme/js/data.js

### before `const byKey = (field) => Object.fromEntries(CATEGORIES.filter(c => c[field]).map(c => [c.key, c[field]]));`

```
CATEGORY_ICONS and CATEGORY_TAGLINE are PROJECTIONS of CATEGORIES, not data of their own, so a new
category or a reworded tagline is typed once.

`tagline` is the section subtitle. It is deliberately NOT called `sub`: SUBCATEGORIES is the list of
subcategories, and one word meaning both is how app.js came to carry a dead `sc.sub ||` branch that
assumed subcategories had taglines of their own. None do.

The concatenation order is the CATEGORIES order and does NOT reproduce the pre-reorg array order
(workloads sat in two blocks, so no per-category split can rebuild it). That is checked rather than
argued: buildUnits groups by category then by subcategory and filters inside one, which preserves
relative order among a category's own cards. All 15 pairs render as they did before.
```

### subcategory ordering

```
Each category's SUBCATEGORIES list is an ORDER, not a set, and the order is an argument. Recorded
here because it spans categories; the "what belongs here" column lives in each folder's CLAUDE.md.

Network Foundations   the promise, then the machinery that keeps it: flat model, the namespace a Pod
                      IP lives in, the two address ranges, the dataplane, the conntrack that pins a flow.
Pod Networking        deep to general: whose namespace the containers are in, how the wiring is built
                      (CIDR, CNI call, veth), and only then the traffic that rides it.
Services & Endpoints  the map, the ClusterIP dataplane, the endpoint set it is programmed from, how a
                      backend is chosen, the ports, what happens as one leaves, then the two Services
                      that skip the proxy entirely.
External Traffic      map first, then layer 4, then layer 7: north-south is the overview every later
                      card zooms into, NodePort/LoadBalancer is how the address exists, bare metal is
                      how it exists without a cloud, then what the path does to the source address.
Volume Foundations    what a volume IS before any persistence machinery, ending on
                      ephemeral-vs-persistent as the bridge into Volumes and Claims.
Volumes and Claims    one claim through its whole life in EVENT order: binding, provisioning, the two
                      spec fields, expansion, then the deletion arc (finalizer, reclaim, phases).
                      Everything after this category assumes the pairing.
CSI and Mount Path    the machinery: the two halves of a driver, the four-call chain, the
                      VolumeAttachment, the literal path, the fsGroup walk, then the three refusals in
                      order of how far the Pod got (attach ceiling, multi-attach, detach-on-node-loss).
Stateful Data         the operations layer, closing the loop back to the ephemeral foundations.
```

---

## scheme/js/posters.js

### before `export const POSTERS = {`

```
The four per-category poster maps merged into one, because app.js looks a poster up by card id and
has no category in hand at that point. Order does not matter; what matters is that all 108 keys
survive the spread and no two categories claim the same id. R-poster proves both halves: a card with
no poster and a poster with no card are each a finding.

THE cards.js / posters.js PAIR is the shape every category folder repeats, and the two files are
deliberately separate rather than one manifest. cards.js is DATA the linters parse (R-desc reads
desc, R-modulepath reads id against the folder, check-terms reads desc and narration), while
posters.js is 320x180 SVG markup as template literals. Merging them would put several hundred lines
of markup in the path of every tool that only wants the metadata, and would make a poster edit and a
description edit collide in one file.
```

---

## scheme/js/app.js

The largest module in the sub-app: grid, filtering, poster rendering, dialog lifecycle, hash routing
and the shared chrome. It is the one place besides `motion.js` allowed to touch browser globals at
module load.

### before `function buildUnits(list) {`

```
The grid is built as UNITS (a category, or a subcategory inside one) rather than as a flat list, so
a section header can carry its own count and tagline. The order is the CATEGORIES order, and
grouping by category then by subcategory preserves relative order among a category's own cards,
which is what makes the per-category manifests render the way the single pre-reorg array did.

`sc.sub ||` used to appear here as a dead branch assuming subcategories carried taglines of their
own. None do. See the data.js note on why `tagline` is not called `sub`.
```

### before `const POSTER_COLORS = {`

```
The gradient wash behind each grid thumbnail, keyed by category, and all four are now the exact
`--<cat>-color` from tokens.css.

Workloads was `#3da0ff` against a `--workloads-color` of `#5bb8ff` until 2026-08-06, the only one of
the four that did not match. It was carried as a known exception rather than fixed silently, because
it is a visible gradient on 19 thumbnails and not a cleanup, and it was aligned once the author
called it. The rule this restores: ONE colour per category, named once in tokens.css, and every
other place reads it (CANON.md C-22).
```

### before `const SCHEME_ALIASES = {`

```
Old card ids keep resolving. A rename is cheap only because this map exists: without it every
external link, bookmark and sitemap entry pointing at the old id opens the grid instead of the card.
Add an entry the moment an id changes, never later.
```

### before `async function openScheme(id, initialStep = null) {`

```
The dialog lifecycle, and the reason a card module is lazy: 108 modules are never all in memory. The
function tears down any live controller before building the next dialog, because two Timelines
running at once leave the first one's registered animations on the canvas of the second.
```

### before `function renderHeaderActions(CONTACTS, SPONSOR, GITHUB) {`

```
KNOWN DUPLICATION, kept on purpose. This function, `fallbackCopy`, `closeAllDropdowns` and the four
icon constants exist in THREE copies: here, in cli/js/app.js, and inline in the root index.html.
About 240 lines.

Collapsing them into one shared module would work and was costed. It is not done because it breaks
the principle the whole path-based layout is built on: each path prefix is self-contained, and a
shared chrome module makes /scheme/ fail to render its header when /cli/ moves a file. The
duplication is the price of that isolation, and it is written down here so nobody rediscovers it as
a finding.
```

### before `function alignLogo() {`

```
Chrome parity with the other two pages: the logo icon is centred over the position of the nav's
"All" button, and every page runs its own copy of this measurement. Pages without a real nav carry
an invisible ghost-ruler replica purely so the same arithmetic has something to measure. Skipped
below 900px, where the nav wraps and the offset would be wrong rather than absent.
```

---

## scheme/js/lib/scheme-kit.js

### before `import { svg, g, rect, text, circle, path } from './svg.js';`

```
The shared base kit for ALL FOUR categories. The four per-category kits are thin wrappers that
re-export everything here and override only the pod tint, so the base carries NO category of its own
and no card imports it directly.

Every function here arrived by being copy-pasted byte-for-byte into dozens of cards first. Each
hoist is behaviour-preserving, checked by diffing anim-dump before and after.

Conventions: `s` is the Scene instance, `ctx` is the Timeline step context
({ reduced, speed, register }), `podEl` is the wrapper <g> containing a `.scheme-pod` shell and a
`.scheme-box`.
```

### before `export function setChip(chip, val) {`

```
A chip whose value CHANGED this step lights, as a static highlight and never a flash. `valueText`
still holds the previous step's text at call time, because resetStep clears the class and not the
text, and steps are always entered in order, so the diff is deterministic per step.

RENAMING THIS BREAKS TWO LINTERS SILENTLY. `prose.mjs` resolves chip VALUES by finding a card-local
function that forwards both parameters to a known setter, and an imported one is invisible to that
search, so it seeds `setChip` BY NAME. A rename here has to be a rename there too, or check-inline
and check-labels quietly stop seeing two thirds of the values drawn on storage cards while still
reporting zero findings.
```

### before `export const laneOf = (from, to) => String(Math.min(Number(from), Number(to)));`

```
A lane is only as present as the FAINTER of the two things it joins, so it takes the MIN of its
endpoints. Deriving from one end alone is how an ownership lane came to leave a Pod that is a ghost
at OPACITY.terminated and arrive at its claim at full strength.

`R-kitparity` is what catches an omission when a name is added here: the four re-export lists are
formatted differently enough that a single find-and-replace across them does not work.
```

### before `export const REVEAL_MS = 500;`

```
How long a newborn construction takes to materialise, and the number the whole storage family
sequences off. It runs BEFORE the ball leaves (BEAT.lead is 800), so a block and its lanes are fully
present by the time anything is sent down them: the reader never sees a lane with no block on the
end of it. Exported because three cards sequence the NEXT beat off the end of a reveal, and a
private copy of the number is how those drift apart.

Deliberately NOT FADE.in (600), which is the general-purpose fade. This one is the landing beat.
```

### before `export function revealAt(el, ctx, delay = 0, from = 0) {`

```
Fades an element in from `from` to full at `delay`, leaving the caller free to pin the static end
state above the ctx.reduced guard. `from` is the shade the object rests at while a lane already
points AT it: hiding it outright aims the arrowhead at blank canvas for the whole flight.

DO NOT short-circuit on `delay <= 0` straight to opacity 1. Nine card-local copies did, so a reveal
at step entry silently played no fade AND threw `from` away, which put two live cards on the wrong
resting shade. Under ctx.reduced it snaps to full, which keeps a prev/reset replay correct; it never
snaps otherwise, not even at delay 0, because a zero-delay reveal is a real beat.
```

### before `export function relationPath({ points, d, role = null, dash = null }) {`

```
A wire that carries no ball on any step. The rule it serves: a static wire with no ball is a
RELATIONSHIP, not a route, and must not take an arrowhead, because a marker with no traffic under it
reads as traffic. Both `arrow()` and `pathArrow()` always attach one.

`points` is the ordinary case and the important one: passing the SAME array the card already owns is
what keeps a relationship line from drifting away from the blocks it connects. `d` is the escape
hatch for the three cards that build a multi-subpath spine by hand (network-model's spine plus
teeth, network-cni-invocation's plugin spine, storage-csi-architecture's fan).

`role` and `dash` are OPTIONAL rather than defaulted, because the hand-rolled copies this replaced
were carried across AS THEY RENDER rather than normalised: normalising would have been an undeclared
visual change to 29 lines in one pass. Some omitted the role suffix (which drops the stroke to a
fallback colour), some the dasharray, and one uses `4 6` where the rest use `5 5`.
```

### before `export function valChip({ x, y, w, h = 32, name, value, role = '' }) {`

```
`role` is required in practice and has NO category default. It used to default to `cluster`, which
tagged 82 workloads chips with the cluster palette, invisible only because a tinted dialog collapses
every role onto one tint. Omitting it now leaves the attribute off entirely, so the chip falls back
to the generic `.scheme-chip-rect` stroke rather than borrowing another category's.
```

### before `export function clearHighlights(s, keys, pods = []) {`

```
Clears `.highlight` from the given `s.refs` keys, every chain chip, and the pod stroke highlight on
the given pod elements. Card-specific extras stay in the card's own `resetStep`, which wraps this
call between the canvas clear and `clearWires`.

THE TWO ARGUMENTS ARE NOT INTERCHANGEABLE, and confusing them is a leak no check sees. The `pods`
argument runs `clearPodHighlight`, which resets the inline stroke styles a pulse leaves behind and
touches NO class at all. So a `.highlight` put on a Pod inner box has to be cleared BY NAME, in the
keys list. Five networking cards listed the pod GROUP and not the box while lighting that box in
their `ctx.reduced` branch, so on prev and reset the container stayed lit for the rest of the card,
gathering one more with every step.

Invisible to the gate by construction: check-reduced compares the two paths and both accumulate
identically once a card is replayed, check-arrival looks at receivers, and check-palette treats a
lit element as a legal state. Only a per-step dump of the class set shows it.
```

### before `autoPulse: false,`

```
Block auto-pulse (a brightness flash on any freshly highlighted block or chip) is OFF here. Only
Pods pulse, through explicit pulsePod calls. Override per card with `opts.autoPulse`.
```

### before `_timeline: tl,`

```
Inert debug handle for `scheme/tools`: lets a tool run a single step's play-path with no
auto-advance and then seek its WAAPI animations deterministically. Exposed only via
`window.__schemeCtl` under inspect mode.
```

### before `export function pulsePodWithTint(podEl, ctx, delay, { persist = false } = {}, tint) {`

```
The single source of truth for the pod pulse. `podEl` is the WRAPPER GROUP; the function queries the
shell and box rects inside it, so a bare `pod()` pulses at half strength. Each category kit calls it
through a thin wrapper binding its own tint.
```

### before `export function pulsePodDimWithTint(podEl, ctx, delay, { from = OPACITY.pending, peak = PULSE_POD.dimPeak, dur = PULSE_POD.ms } = {}, tint) {`

```
Pulse a dimmed pod (booting, not-Ready): the ordinary pulse plus an opacity flash up to `peak` and
back to `from`, so the blink reads against the faded shade instead of vanishing into it.
```

### before `export function flashChips(s, ctx, keys, delay = 0) {`

```
One-shot brightness flash for a step with NO packet motion and no Pod, so it does not read as a
frozen frame. The only sanctioned block flash: steps with packets keep the static highlight outline
only. Currently zero callers, and it stays exported because dropping it breaks `R-kitparity` unless
all four kits are updated together.
```

### before `export function makeRidingLabel({`

```
An address tag that travels WITH a ball instead of sitting as static wire text, so the packet
visibly carries `dst 10.96.0.10:80` in and `src 10.244.2.7` back out.

A FACTORY rather than a plain function, because the 51 hand-rolled copies it replaces differed only
in a handful of per-card constants (tag offset, fade durations, the hold before the fade-out, and
whether the tag emerges from inside a block). A card binds those once at module scope and its call
sites stay unchanged.

THE EASING MUST MATCH THE BALL IT RIDES. `segmentPacket` is linear, routes are eased, and
`animateAlong` defaults to ease-in-out, so a tag riding a linear hop has to be given `linear`
explicitly. Get it wrong and the tag drifts off the ball mid-flight, rejoining only at the endpoints
and the midpoint, which is exactly why no screenshot catches it. Whenever a ball takes an explicit
`dur`, its tag must be passed the same one.
```

### before `lbl.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px)`;`

```
Pin the tag at the route START. Without this it sits at the SVG origin until animateAlong's delay
elapses, so its fade-in plays in the top-left corner under the narration panel.
```

### before `export function lightBoxAt(boxEl, ctx, delay = 0) {`

```
Add `.highlight` to an infrastructure box ON PACKET ARRIVAL rather than at step entry, through a
zero-effect 1ms animation whose `onfinish` sets the class. Under `ctx.reduced` (or a non-positive
delay) it applies immediately, which keeps the reduced static end-state correct. This is how a box
receives a packet without pulsing.

THE KEYFRAME LIST IS EMPTY AND THAT IS LOAD-BEARING. `[{opacity: 1}, {opacity: 1}]` draws nothing
and still costs the block its rendering: Chrome composites an element for as long as an opacity
animation is attached to it, DELAY PHASE INCLUDED, and this timer is pending for exactly the flight
of the ball. So every block about to light was promoted to its own layer while the ball travelled
and dropped back on arrival, and its 72% opaque fill was blended by the compositor instead of in the
raster pass for that window: the canvas of the block shifts tone for a beat and snaps back. Worst on
cards where every block sits inside a node() frame and carries two translucent surfaces.

Confirmed with CDP LayerTree rather than by pixel diff, because headless software rendering blends
both ways identically and shows nothing: `g.scheme-box 222x82` appears in the layer list mid-flight
and is gone after. It CASCADES, because anything painted above a composited layer and overlapping it
is promoted too, which took three lanes and a wire label with it.

Empty keyframes animate nothing, so there is nothing to composite, and the animation stays a
first-class WAAPI object: same delay and duration, still in `document.getAnimations()`, still fires
`onfinish`, so check-reduced, anim-dump and the deterministic seek are unaffected. `at()` takes the
same treatment for the same reason, and there it matters more, because its timer hangs on the SVG
ROOT. Grep for `animate([{ opacity: 1 }, { opacity: 1 }]` to check none has come back.
```

### before `const HOP_MS = 700;`

```
THE SPEED CANON. Travel duration comes from path length (0.45 units per ms, clamped), so route calls
omit `dur` and the ball moves at one speed everywhere regardless of distance. An explicit `dur` is
reserved for narrative pacing and needs a one-line justification at the call site.

HOP_MS is the one comfortable-hop-time knob: it is both topPacket's fixed duration AND routeDur's
FLOOR. Below about 315 units a path would otherwise finish under it (a 220 unit control-plane arrow
at 489ms), which reads as a dart next to the long connector glide. Long routes stay
length-proportional. Tune pacing here, in one place.
```

### before `export function packetAlong(packetLayer, ctx, points, {`

```
Every packet ripples at its destination: the delivered cue is part of the arrival canon, with no
per-call opt-in. The returned packet element carries `arrivalMs = delay + travel`, so cards anchor
arrival pulses and fades to real geometry instead of hard-coded delays.
```

### before `export function arrivalRipple(packetLayer, ctx, point, delay, role = '') {`

```
A one-shot ring that expands and fades at `point`, reinforcing "delivered". It carries
`.scheme-ripple` rather than `.scheme-packet`, so anything counting packets sees ONE ball per hop
and not two. Exposed so a card animating packets by hand can still add the same cue.
```

### before `export function routePacket(s, ctx, points, {`

```
Multi-point ROUTES glide ease-in-out via animateAlong. Short hops come in exactly two flavours:
top-row request/ack hops use `topPacket` (eased, the stately top-strip pacing) and hops inside the
diagram body use `segmentPacket` (linear, crisp fades). The path array stays a local const in the
card, because geometry is card-specific, and is SHARED with the matching pathArrow so the static
wire and the packet cannot disagree.
```

---

## scheme/js/lib/tokens.js

Shared animation magnitude tokens, kept dependency-free (zero imports) so `timeline.js`,
`scheme-kit.js` and the four category kits can all read one source of truth without an import cycle.

### before `export const PULSE_POD = Object.freeze({ ms: 900, bright: 1.4, dimPeak: 0.8 });`

```
Pod pulse: a stroke ramp (1.2 to 2.4 width, base to bright tint) plus a brightness flash, 900ms
total (450 up, 450 down). The tint colour is supplied per card family.
```

### before `export const FADE = Object.freeze({ in: 600, out: 700 });`

```
Pod fade vocabulary: a pod materialises over `in` ms (ease-out) and dissolves over `out` (ease-in).
A card needing a narrative-slow fade keeps an explicit duration with a justification at the call.
```

### before `export const BEAT = Object.freeze({ afterPulse: 800, afterHop: 100, lead: 800 });`

```
Choreography beats. `afterPulse` is the up-arrow gap: the pod blinks first and the packet departs
once the blink has mostly landed (PULSE_POD is 900). `afterHop` is the down-arrow gap between a hop
arriving at a block and that block emitting the next packet. `lead` is the gap before a controller
self-initiates a packet with no preceding hop or pulse, so the lit source registers before the ball
leaves.
```

### before `export const OPACITY = Object.freeze({`

```
A LANE has no phase of its own, so it is not in the vocabulary: its opacity is min(source, sink).
Deriving it from one end is how the catalog came to draw a full-strength arrow out of a Pod that was
a ghost at 0.12, and a full-strength fan into a Node the step had just taken out of the path.

Three rules, in the order they get broken:
1. Pin an object and its lanes in ONE helper. Two separate assignments drift the moment a step is
   added, and the drift is invisible to every check in the gate.
2. A lane whose far end is gone goes to 0 rather than to a dim shade. A block leaves a hole when it
   vanishes, so it dims instead; an arrow into nothing leaves no hole and reads as a fault.
3. A lane CARRYING a ball this step has to be on screen for the whole flight: pin its end value
   above the ctx.reduced guard and animate down from 1 with `fill: 'both'`, so keyframe one is held
   through the delay window. Sinking it at step entry hides the ball it is supposed to be carrying.

Rule 3 bites twice: it can pass on the static path and fail on the played one, because the end state
is pinned correctly while the ANIMATION still takes only the block down. `check-reduced` is what
catches that, as a played-versus-reduced mismatch.
```

---

## scheme/js/lib/timeline.js

### before `this.autoPulse = autoPulse;`

```
Generic block auto-pulse, a brightness flash on every freshly highlighted block or chip. Off
catalog-wide through the makeInit default, so only Pods pulse.
```

### before `autoPlay(ms) {`

```
Auto-play after the opening dwell. Owned by the Timeline so any explicit action (pause, step,
gotoStep, restart, destroy) cancels it: no surprise playback after the user has interacted, and no
race with headless step-probing.
```

---

## scheme/js/lib/primitives.js

The SVG shape vocabulary every card composes: `box`, `pod`, `podShell`, `node`, `cylinder`, `arrow`,
`pathArrow`, `packet`, `chip`, `chainList`, plus `arrowDefs`, `animateAlong` and `fadeIn`. It parses
in Node (no browser globals at load) so the tools can read it.

### before `export const POD_SHELL_FILL = 'rgba(255, 255, 255, 0.03)';`

```
A Pod drawn as a SHELL is pod() with its rect washed to a near-transparent fill, and that fill stays
INLINE rather than moving to a class: a CSS class resolves differently against the .scheme-pod-rect
rules, so the shell would pick up the solid pod fill on some cards and not others.

podShell is what a card should call, not pod(). The pulse queries descendants of the wrapper group,
so a bare pod() with no inner box pulses at half strength (CANON.md M-03).
```

### before `export function arrow({ x1, y1, x2, y2, dashed = false, dim = false, role = '', cls = '' } = {}) {`

```
A two-point pathArrow, and nothing else. It carried its own copy of the marker ladder (four role
branches) and the class list until 2026-08-06, which is exactly how a role could come to mean one
thing on a straight lane and another on an elbow without either copy looking wrong.

The collapse is not free in the DOM and that is worth knowing before reading an oracle diff:
pathArrow sets `stroke-linejoin: miter` and the old arrow did not, so 864 arrow elements across 65
cards gained that attribute. A two-point path has no join, so nothing renders differently, and the
anim side of the oracle was byte-identical. Verified line by line rather than assumed: every changed
line is the old one with exactly one attribute inserted.
```

### before `export function animateAlong(packetEl, points, options = {}) {`

```
Walks an element along a points array as one WAAPI animation over a translate keyframe list.

IT HONORS options.delay, and that is not decoration. A bug dropping it made every packet teleport
invisibly through its delay window and appear already in flight, which reads as a dropped frame
rather than as a wrong number. Do not regress it.

The default easing is ease-in-out, which is why a tag riding a LINEAR segmentPacket has to be given
`linear` explicitly (CANON.md M-30).
```

---

## scheme/js/lib/svg.js

### before `const NS = 'http://www.w3.org/2000/svg';`

```
The element vocabulary, one thin createElementNS helper per tag. Sixteen exports, six of which
nothing imports today (`el`, `tspan`, `linearGradient`, `stop`, `title`, `desc`) and they STAY: this
is a library surface, not accumulated code. Do not read their absence from the import graph as dead
code, and do not delete them to make an unused-export count go to zero.

No browser globals at module load, so every tool that reads the source can import it in Node.
```

---

## scheme/js/lib/motion.js

### before `const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false, addEventListener() {} };`

```
Nine lines, and one of only two modules allowed to touch a browser global at load (app.js is the
other). The guard is not defensive style: the tools import several lib modules in Node, and an
unguarded matchMedia here would take the whole harness down rather than one check.

This is the SYSTEM preference. It is a different thing from `ctx.reduced`, which the Timeline also
sets true when prev or reset replays steps 0..target. A card must satisfy both through the same
static branch (CANON.md S-14).
```

---

## scheme/js/lib/inspector.js

### before `export function attachInspector(dialog) {`

```
`?inspect=1` only. Draws a coordinate grid and bbox overlay over the diagram so a geometry number
can be read off the canvas instead of guessed, and it is inert without the query parameter: no
listener, no DOM, no cost on a normal page load.
```

### before `function publishApi(dialog, svg) {`

```
Publishes `window.__schemeCtl`, which is the entire contract between the browser and scheme/tools.
Every check that walks steps goes through it (`gotoStep`, `total`, `_timeline`), so RENAMING
ANYTHING HERE BREAKS THE WHOLE HARNESS AT ONCE, and it breaks it as a timeout rather than as a
readable error.

`_timeline` is the deliberate escape hatch: it lets a tool run one step's real play path with no
auto-advance and then seek its WAAPI animations deterministically, which is what makes frame-strip
reproducible instead of wall-clock sampled.
```

---

## scheme/js/lib/sidebar.js

### before `const KEY = 'kube-how:sidebar-collapsed:v1';`

```
Twenty lines, and BYTE-IDENTICAL to cli/js/lib/sidebar.js. Duplicated, not symlinked, for the same
reason as the header chrome: each path prefix stays self-contained. Change one, change the other,
and `diff` them before believing they agree.

IT IS THE ONE FILE UNDER scheme/js/ WITH NO POINTER COMMENT, and that is deliberate: a pointer would
be the only differing byte, which costs the `diff` its usefulness as the whole verification.

The hub page imports the CLI copy directly rather than carrying a third, so there are two files and
three importers.
```

---

## scheme/css/tokens.css

### before `--network-color:    #4fe5ff;`

```
The category colour ramp, and the CHROME half of the palette: tokens.css is selected through
`data-cat`, diagrams.css through `data-role`, and the two never cross (CANON.md C-15). Each category
declares a colour plus a `-glow` and a `-border` alpha of it, used by the grid card, the section
header and the nav pill.

Measured hues, so a new category picks a free gap rather than a colour that reads as an existing
one: violet 236 (cluster) > blue 206 (workloads) > cyan 189 (network) > jade 150 (storage).

THE RETIRED LIFECYCLE CORAL IS NOT HERE. It was reserved by an older note and that reservation was
never written into this file; the only live `#ff668c` in the repo is `--ts-tools-color` in
cli/css/styles.css, an unrelated slot. A future category may take the coral, and nothing has to be
freed first.

A tinted DIALOG does not read these: it declares its own four channel lists in styles.css. Retinting
a category is therefore both places, plus the kit tint and POSTER_COLORS (CANON.md C-22).
```

---

## scheme/js/schemes/workloads/workloads-kit.js

### before `export {`

```
Per-category wrapper over scheme-kit for the Workloads cards. All four categories now reach the base
the same way, so the base has no category of its own and the workloads blue lives here.
```

### before `LANE_DY: 12,`

```
The top-row lane PAIR: `REQ_Y = TOP_CY - LANE_DY` carries the controller's request to the API and
`RESP_Y = TOP_CY + LANE_DY` carries the answer back. 17 cards draw the pair and 6 ride the answer.

WHETHER THE ANSWER LANE IS AN ARROW OR A RELATION IS DECIDED BY THE STEP'S OWN WORDS, not by
consistency. Where a step NAMES something arriving from the API, the lane gets a ball and the
receiving box goes dark at entry and lights on arrival, because it is a receiver now and
check-arrival R3 applies to it. Where no step names anything coming back, it is a relationship and
goes through `relationPath`: no arrowhead, `stroke-opacity: 0.45`, category tint kept. Do not read a
relation line on one card and an arrow on another as drift: the difference IS the content.

Three things this costs, every time:
1. An added hop costs about 800ms (a 60 unit gap sits on the PKT_DUR_MIN floor of 700, plus
   BEAT.afterHop), so `duration` usually has to rise and `check-duration` says by how much.
2. A return FLIPS THE SENDER INTO A RECEIVER, so a box lit at step entry has to go dark and light on
   arrival instead, or check-arrival R3 fires.
3. `BEAT` missing from a card's imports throws a ReferenceError that `Timeline` swallows into
   console.error: the step plays its first packet and silently stops. Only `smoke-all` sees it. Run
   it after touching any card's imports.

The same principle one axis over: A LANE LEAVES THE BOX THAT ACTS. On a control-plane card the
leftmost box writes to the API and stops there, so the lane into the Node band belongs to the API.
`workloads-force-deletion` is the model. Two traps come with moving one:
- It is a TIMING change, because routeDur is length-based: moving a start 300 to 400 units right
  adds 250 to 870ms per ball. Raise the duration, never shorten the motion.
- A box can be DERIVED FROM the lane (`KUBECTL_X = SPINE_X - BOX_W / 2`), so redefining the spine
  moves the box instead of the lane. Such a card needs its own constant.
- Where two actors reach one slot, draw TWO lanes over a shared drop rather than picking a winner.
```

### before `export const WORKLOADS_TINT = Object.freeze({ base: 'rgb(91, 184, 255)', bright: 'rgb(142, 198, 247)' });`

```
Workloads pods carry `--workloads-color`. `base` MUST equal the natural resting stroke, which is
what makes the pulse return to the original colour instead of settling on a paler tone: the
non-persist pulse fills forwards to `base`.
```

---

## scheme/js/schemes/cluster/cluster-kit.js

### before `export {`

```
Per-category wrapper over scheme-kit for the Cluster cards. The cluster-specific pieces are the
violet pod tint and its two pulse wrappers; everything else is re-exported.
```

---

## scheme/js/schemes/network/network-kit.js

### before `export {`

```
Per-category wrapper over scheme-kit for the Networking cards. The networking-specific pieces are
the cyan pod tint and its two pulse wrappers.
```

### before `export const NETWORK_TINT = Object.freeze({ base: 'rgb(79, 229, 255)', bright: 'rgb(158, 234, 247)' });`

```
`base` must be the exact resting stroke and `bright` the tint-bright stop, for the reason under
WORKLOADS_TINT: the non-persist pulse fills forwards to `base`.
```

---

## scheme/js/schemes/storage/storage-kit.js

### before `export {`

```
Per-category wrapper over scheme-kit for the Storage cards. The storage-specific pieces are the jade
pod tint, its two pulse wrappers and `setCylinderLabel`.
```

### before `export const STORAGE_TINT = Object.freeze({ base: 'rgb(94, 202, 148)', bright: 'rgb(174, 224, 199)' });`

```
`base` must be the exact resting stroke and `bright` the tint-bright stop, for the reason under
WORKLOADS_TINT.
```

---

## scheme/css/styles.css

### before `.scheme-dialog[data-tinted="true"][data-cat="workloads"] {`

```
===== TINTED DIALOG =====
The whole modal collapses onto one category's colour ramp. A category block declares FOUR opaque
colours as CHANNEL LISTS (`--tint-deep-rgb` / `-base-rgb` / `-bright-rgb` / `-canvas-rgb`) plus three
hand-mixed surface fills, and nothing else. The generic rule builds every alpha shade from those four
(glow, border, active, edge, panel), then remaps the category tokens, the accent trio, the diagram
stroke and arrow tokens and the dialog surface onto the result.

Channel lists rather than hex, because `rgba()` cannot take a hex through a `var()`:
`rgba(var(--tint-base), 0.15)` is invalid, and that invalidity is what an earlier attempt at deriving
these hit and why the file went to hand-copied literals instead. `color-mix` would express the same
thing in one step and is deliberately unused, so resolution stays fully deterministic.

THE LITERALS WERE THE BUG, NOT THE FIX. Restating each alpha shade per category by hand lets a
category disagree with itself, and two did: a `--tint-glow` that did not match its own `--tint-base`
put a duller fill inside `.scheme-pod-container` than the stroke drawn around it. Adding a shade
means ONE line in the generic block, never four.
```

### decision: clamping the panel was built, measured and reverted

```
`.narration-overlay` has a width (32%, capped at 360px) and NO height constraint, so it is sized by
its text. Two consequences, and they are different problems that look like one:

1. IT CHANGES HEIGHT BETWEEN STEPS of one card. Measured 2026-08-06: on 209 of 216 card+viewport
   pairs the panel height moves as the card plays, so the diagram area under it moves too. Nothing
   had ever recorded this.
2. IT CHANGES HEIGHT BETWEEN VIEWPORTS, and by a lot: up to 186 viewBox units
   (workloads-pod-phase-machine reaches 503 at 1100x800 and 317 at 1600x1000). Every card reserves
   the band its 1100 worst case needs, so at 1600 that band reads as a hole. FIVE card records call
   this out and leave a finding OPEN as "unavoidable while the panel is not clamped in CSS".

Pinning min-height to the card's tallest narration was implemented and measured against both.

It fixes (1) completely: 0 of 216 pairs move afterwards. It does NOTHING for (2), and the reason is
that (2) is not a height problem at all. The panel's WIDTH in viewBox units is already constant, so
the right edge is x<=397 on every viewport; what is not constant is the FONT, which is a fixed pixel
size. A wider viewport gives a wider panel in pixels, the same text wraps into fewer lines, and the
scale it is divided by is larger, so the panel shrinks in viewBox units twice over. Closing (2)
means typography that scales with the diagram, which changes the reading size of every narration at
every viewport, and that is a design decision and not a cleanup.

REVERTED, because the cost is visible and the benefit is not the one that was wanted. Pinned to its
tallest narration, a card with a wide spread of narration lengths shows a bordered box with an empty
strip at the bottom: on workloads-pod-phase-machine step 3 that strip is about 100px. An empty strip
inside a drawn border reads as a fault where empty canvas reads as space. Geometry was unaffected
either way: check-geometry returned the same 8 findings on the same 7 cards with the clamp on.

If (1) is worth solving on its own, the direction is a transition on the height rather than a clamp,
which keeps the panel snug and removes the jump. That was not tried.
```

### before `.scheme-dialog[data-tinted="true"] .narration-overlay {`

```
The panel is its category's canvas at 86%, so the diagram shows through it and only the border and
the accent edge draw the box.

DO NOT add a per-category `.narration-overlay` rule back: retint a category by changing its
`--tint-canvas-rgb` and the panel follows. It used to be one shared literal plus a hand-copied
override per category, and Cluster never got one, so a violet card carried a navy panel for as long
as the category had existed. Workloads looked right only by coincidence, because the shared default
WAS the Workloads canvas, near enough. Two of the four overrides were also inexact against the canvas
they named as their source, and nobody had ever compared them.
```

### before `.scheme-dialog[data-tinted="true"] .dialog-controls {`

```
Player-chrome gradation, so the modal reads as a three-step ramp instead of one flat tone: the canvas
is darkest, the controls bar the mid tone, the header and step-dots strip lightest.
```

### before `.scheme-dialog[data-tinted="true"] .scheme-box.highlight .scheme-box-rect,`

```
The bright end of the ramp: highlighted diagram elements, moving packets and the player progress lift
to `--tint-bright`, so the foreground reads lighter than the base-tone blocks. These rules sit AFTER
the per-category ones so they win the equal-specificity tie.
```

### before `.scheme-dialog[data-cat="network"][data-tinted="true"] .scheme-packet {`

```
Network `--tint-bright` is a pale cyan that washes the ball out, so packet and ripple are pinned to
the saturated network cyan for network dialogs only, at higher specificity than the generic rule.
```

### before `.scheme-dialog[data-tinted="true"] .ctl-btn,`

```
Player chrome with a wide gap between the two states: an idle control blends into the panel, and the
active Play, pressed Loop, hovered button and selected speed take a lit `--tint-active` fill with a
bright border and icon.
```

### before `.scheme-dialog[data-tinted="true"] .ctl-btn:disabled {`

```
A disabled control keeps the full chip so it stays uniform with its neighbours, and only the icon
dims. The base rule's blunt `opacity: 0.4` made the whole button look broken.
```

### before `.scheme-dialog[data-tinted="true"] .dialog-progress { background: var(--tint-glow); }`

```
Progress fill and the active and passed step dots drop from the bright tone to the base tone. The
track and idle dots keep the faint glow.
```

---

## scheme/css/diagrams.css

### decision: role beats dim on an arrow, and that is not the bug it looks like

```
`.scheme-arrow-dim` sits ABOVE the three `.scheme-arrow-<role>` rules at equal specificity, so the
role wins the stroke and `dim` survives only as `stroke-width: 1.4`. 315 of the catalog's 358
`dim: true` calls pass a role, so on the face of it `dim` is a no-op almost everywhere, and it was
filed as a catalog-wide bug worth fixing in two lines.

It was implemented and REVERTED the same day. The premise is wrong: **`dim` here is a stroke WEIGHT,
not a lifecycle state.** A wire a ball rides is normally drawn dim, measured rather than argued: a
probe over every step of every card found 601 dim lanes carrying a packet across 511 steps. Making
dim outrank role greys out most of the route wires in the catalog and breaks the per-category colour
identity. Verified on rendered frames: 94 of 103 cards changed, and the Networking exemplar's
kube-proxy fan went from cyan to grey.

What the real fix separates is a RELATIONSHIP line (no ball ever) from a resting ROUTE wire. `dim`
does not tell them apart, so `relationPath` adds `scheme-arrow-relation` and the CSS gives that class
`stroke-opacity: 0.45`. The line keeps its category hue and sinks behind the live wires instead of
turning neutral: a grey line loses the category identity the whole palette exists to carry.

`stroke-opacity` rather than a darker colour literal is deliberate. It keeps ONE colour token per
category, and it MULTIPLIES with any element `opacity` a card pins, so a relation line into a block
that is fading out fades with it.

That change exposed one real defect: a card drew its localhost loopback with `relationPath` while one
step sends a ball along it, a route wearing the relationship helper. It now raises that line to full
strength on the one step that uses it. A probe over all 26 cards and 128 steps found no second case.

Kept from the attempt: arrows carry `data-role`, and `.scheme-arrow` joined check-palette's `PAINTED`
list with `scheme-arrow-dim` as part of the state key. Arrows had never been colour-checked by
anything, which is why the original report could claim a catalog-wide repaint with no check arguing.
```

### before `fill: #abb0f5;`

```
Brighter than the base `--cluster-color` so the ball reads as vividly as a tinted packet does. Same
indigo hue, lighter: the cluster-family bright stop. Tinted dialogs override it at higher specificity.
```

### before `fill: #4fe5ff;`

```
The tinted dialog maps `--network-color` to the pale tint stop, which washes the ball out, so it is
pinned to the saturated network cyan and the packet pops against the paler pod-pulse tint.
```
