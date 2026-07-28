# Scheme internals design notes

Design record moved out of the shipped `scheme/` sources that are not cards: the poster map,
the catalog, the shared kits, the CSS. Every comment block of three lines or more now lives
here; one and two line clarifications, and trailing comments on a line of code, stayed next to
the code they explain. `scheme/docs/CARDS.md` is the sister file, holding the per-card record
for `scheme/js/schemes/*.js`.

This file is NOT deployed. Three separate exclusions keep the whole `scheme/docs` directory out
of production, and all three must hold: `.github/workflows/deploy.yml` runs
`rm -rf _site/scheme/tools _site/scheme/docs`, `.github/workflows/release.yml` lists
`"scheme/docs/*"` in the release zip's `-x` list, and `.dockerignore` lists `scheme/docs`.

Each entry is anchored by the line of code that followed the block, so a note can be put back
beside its code when needed. Each source file links here from a single pointer comment near
its top.

Generated 2026-07-25 from 10 files, 251 lines relocated.

Per-poster notes are not here: they live in `CARDS.md` under their own card id, as a
`### poster` subsection.

---

## scheme/js/data.js

### before `const byKey = (field) => Object.fromEntries(CATEGORIES.filter(c => c[field]).map(c => [c.key, c[field]]));`

```
These are projections of CATEGORIES, not data of their own. They used to be
hand-maintained copies, so a new category or a reworded tagline had to be typed in
two places and the second place was the one that got forgotten. CATEGORY_LABEL at
the bottom of this file was already derived, these two now match it.

`tagline` is the section subtitle ('Traffic flow'). It is deliberately NOT called
`sub`: SUBCATEGORIES below is the list of subcategories, and one word meaning both
is how app.js came to carry a dead `sc.sub ||` branch that assumed subcategories
had taglines of their own. None do.
```

### before `{`

```
Network Foundations runs from the promise to the machinery that keeps it: the flat model, the namespace
a Pod IP actually lives in, the two address ranges, then the dataplane that turns a Service address
into a Pod one (iptables/IPVS first, its eBPF replacement after) and the conntrack that pins a flow.
```

### before `{`

```
Pod Networking runs deep to general: whose namespace the containers are in (their own, then the two
ways of giving that up), then how the wiring is built (the CIDR each Node draws from, the CNI call, the
veth it lands), and only then the traffic that rides it (same Node, across Nodes, out to the internet).
```

### before `{`

```
Services & Endpoints opens on the map (which type does what), then the ClusterIP dataplane, then the
endpoint set that dataplane is programmed from, how a backend is chosen out of it, the ports it is
reached on, what happens as one leaves, and finally the two Services that skip the proxy entirely.
```

### before `{`

```
External Traffic runs map first, then layer 4, then layer 7: the north-south path is the overview
every later card zooms into, NodePort and LoadBalancer is how the address exists, bare metal is how
it exists without a cloud, externalTrafficPolicy and client-IP preservation are the two things that
path does to the source address, and Ingress, TLS and Gateway API are the layer 7 edge on top.
```

### before `{`

```
Volume Foundations teaches what a volume even is before any persistence machinery: it belongs to
the Pod, the container filesystem underneath is throwaway, emptyDir lives and dies with the Pod.
ConfigMap/Secret and projected mounts and the ephemeral-storage limits round out the local model,
then ephemeral-vs-persistent is the bridge that hands off to Volumes and Claims.
```

### before `{`

```
Volumes and Claims follows one claim through its whole life, in the order the events actually
happen. A claim is only a statement of need, so binding is what turns it into real storage and
dynamic provisioning is what happens when there is nothing to bind to. Access modes and
volumeMode are the two spec fields that decide what the workload is handed, expansion is the one
thing you can change while the volume is live, and the last three are the deletion arc in event
order: the finalizer holds the claim, the reclaim policy decides the ending, and the phase
machine is the map of all of it. Everything in the categories after this one (how the volume is
attached, where the bytes land, how a StatefulSet gets one per replica) assumes this pairing.
```

### before `{`

```
CSI and Mount Path is the machinery: the two halves of a driver, the four-call attach and mount
chain, the VolumeAttachment object that records the attach, the literal path the bytes take on a
node, the fsGroup ownership walk at mount time, then the three ways the attach layer refuses:
the per-node attach ceiling (a scheduling-time refusal, the Pod never gets a node), the
multi-attach error (a placed Pod cannot get an RWO disk off a live peer), and detach-on-node-loss
(a placed Pod cannot get it off a silent peer). Those three run in order of how far the Pod got.
```

### before `{`

```
Stateful Data is the operations layer: per-replica claims and their retention, the two ways the
scheduler stays storage-aware (topology binding and capacity tracking), snapshots and clones, and
finally inline generic ephemeral volumes, which close the loop back to the ephemeral foundations.
```

---

## scheme/js/lib/scheme-kit.js

### before `export const REVEAL_MS = 500;`

```
How long a newborn construction takes to materialise, and the one number the whole storage family
sequences off. It runs BEFORE the ball leaves (BEAT.lead is 800), so a block and its lanes are
fully present and at full strength by the time anything is sent down them, which is the whole
point: the reader never sees a lane with no block on the end of it. Three cards add REVEAL_MS to a
later delay for exactly that reason, which is why it is exported rather than private.

Deliberately not FADE.in (600). That one is the general-purpose fade, this one is the landing beat
and the two were never the same number in any of the nine card-local copies.
```

### before `export function revealAt(el, ctx, delay = 0, from = 0) {`

```
Fades an element in from `from` to full at `delay`, leaving the caller free to pin the static end
state above the ctx.reduced guard. `from` is the shade the object rests at while a lane already
points AT it: hiding it outright aims the arrowhead at blank canvas for the whole flight.

Hoisted 2026-07-29 out of NINE near-identical copies across the storage category, which is also
what fixed them. Every copy short-circuited on `delay <= 0` straight to opacity 1, so a reveal at
step entry silently played no fade and threw `from` away. Two cards were live victims:
storage-pvc-clone rested its clone PVC on full instead of the placeholder shade, and
storage-volume-snapshot popped its restore claim in with no fade. The tenth copy, in
storage-csi-attach-mount, was the only one WITHOUT that short-circuit, and it carried `to` and
`dur` parameters that all five of its call sites passed defaults for.

Under ctx.reduced it snaps to full, which is what keeps a prev/reset replay's static end state
correct. It never snaps otherwise, not even at delay 0, because a zero-delay reveal is a real beat
rather than a shortcut.
```

### before `export function relationPath({ points, d, role = null, dash = null }) {`

```
relationPath: a wire that carries no ball on any step.

Added 2026-07-27 to retire 29 hand-rolled copies of one class string spread over 26
cards. The rule it serves is old: a static wire with no ball is a RELATIONSHIP, not a
route, and must not take an arrowhead, because a marker with no traffic under it reads
as traffic. Both `arrow()` and `pathArrow()` always attach one, so every card that
needed a relationship line built a bare `path` or `line` by hand, and the copies had
already drifted: some omitted the `scheme-arrow-<role>` suffix (which drops the stroke
to a fallback colour), some omitted `stroke-dasharray`, and `storage-ephemeral-vs-
persistent` uses '4 6' where the rest use '5 5'.

`points` is the ordinary case and is the important one: passing the SAME array the
card already owns is what keeps a relationship line from drifting away from the blocks
it connects. `d` is the escape hatch for the three cards that build a multi-subpath
spine string by hand (network-model's spine plus teeth, network-cni-invocation's
plugin spine, storage-csi-architecture's fan), where there is no single polyline.

`role` and `dash` are deliberately OPTIONAL rather than defaulted: the drifted copies
were carried across as they render today, not normalised, because normalising them
would have been an undeclared visual change to 29 lines in one pass.
```


### before `import { g, rect, text, circle, path } from './svg.js';`

```
scheme-kit.js: the shared base kit for ALL FOUR scheme categories.

workloads-kit, cluster-kit, network-kit and storage-kit are thin per-category wrappers
that re-export everything here and override only the pod tint. No card imports this
file directly: a card family always goes through its own kit, so the base carries no
category of its own. The pod tints live in the four kits, not here.

Every function here arrived by being copy-pasted byte-for-byte into dozens of cards
first. The bodies are reproduced verbatim from those cards, so each hoist is
behaviour-preserving, checked by diffing anim-dump before and after.

Conventions:
  - `s` is the Scene instance (uses s.refs.packetLayer, s.refs.connectorDown/Up).
  - `ctx` is the Timeline step context ({ reduced, speed, register }).
  - `podEl` is the wrapper <g> that contains a `.scheme-pod` shell and a `.scheme-box`.
```

### before `export function valChip({ x, y, w, h = 32, name, value, role = '' }) {`

```
---- chip + label setters ----
`role` is required in practice and has no category default: it used to default to
'cluster', which meant 82 workloads chips were tagged with the cluster palette. That was
invisible only because a tinted dialog collapses every role onto one tint. Omitting role
now leaves the attribute off entirely (the neutral shape box/chip/chainList already use),
so the chip falls back to the generic .scheme-chip-rect stroke rather than borrowing some
other category's.
```

### before `export function clearHighlights(s, keys, pods = []) {`

```
---- step-reset helpers (were byte-identical in every card) ----
Clears .highlight from the given s.refs keys, every chain chip (when the card
has a chain strip), and the pod stroke highlight on the given pod elements.
Card-specific extras (tick ladders, event slots) stay in the card's clearHL.
```

### before `autoPulse: false,`

```
Workloads + cluster cards: only pods pulse. The generic block auto-pulse
(brightness flash on any freshly highlighted block/chip) is off here; pods
pulse via explicit pulsePod calls. Override per card with opts.autoPulse.
```

### before `_timeline: tl,`

```
Inert debug handle for scheme/tools (anim-dump, frame-strip): lets a tool run a
single step's play-path with no auto-advance and then seek its WAAPI animations
deterministically. Never touched in normal use; exposed only via window.__schemeCtl
when inspect mode is on.
```

### before `export function pulsePodWithTint(podEl, ctx, delay, { persist = false } = {}, tint) {`

```
---- pod pulse (unified, element-based, tinted) ----
podEl is the wrapper group; the function queries the shell/box rects inside it.
Single-pod cards pass s.refs.podGroup; multi-pod cards pass s.refs.pod1 etc.
pulsePodWithTint is the single source of truth; both card families call it through
a thin tinted wrapper (workloads blue here, cluster violet in cluster-kit).
```

### before `export function pulsePodDimWithTint(podEl, ctx, delay, { from = OPACITY.pending, peak = PULSE_POD.dimPeak, dur = PULSE_POD.ms } = {}, tint) {`

```
Pulse a dimmed pod (booting / not-Ready): pulsePod plus an opacity flash up to
`peak` and back to `from`, so the highlight reads on the faded pod. Replaces the
hand-rolled "pulse + opacity blink" idiom. cluster-kit binds the violet tint.
```

### before `export function flashChips(s, ctx, keys, delay = 0) {`

```
One-shot brightness flash for chips/blocks whose value changes on a step that
has no packet motion, so the step does not read as a frozen frame. This is the
only sanctioned block flash: steps with packets keep the static highlight
outline only (blocks do not blink, pods do).
```

### before `export function makeRidingLabel({`

```
An address tag that travels WITH a ball instead of sitting as static wire text, so the
packet visibly carries `dst 10.96.0.10:80` in and `src 10.244.2.7` back out (on storage
it rides a mount lane carrying `mount /data`, `write`, `read`).

This is a factory, not a plain function, because the 51 hand-rolled copies it replaces
differed only in a handful of per-card constants (tag offset, fade durations, the hold
before the fade-out, and whether the tag emerges from inside a block instead of leading
the travel). A card binds those once at module scope and its call sites stay unchanged:

  const ridingLabel = makeRidingLabel({ role: 'storage' });
  const ridingLabel = makeRidingLabel({ role: 'network', dy: -15, inMs: 160, outMs: 200, hold: 0 });

THE EASING MUST MATCH THE BALL IT RIDES. segmentPacket is linear, routePacket and the
connector wrappers are eased, and animateAlong defaults to ease-in-out, so a tag riding
a linear hop has to be given easing 'linear' explicitly. Get it wrong and the tag drifts
off the ball mid-flight, rejoining it only at the endpoints and the midpoint, which is
exactly why no screenshot catches it. Whenever a ball takes an explicit dur, its tag
must be passed the same dur.
```

### before `lbl.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px)`;`

```
Pin the tag at the route START. Without this it sits at the SVG origin until
animateAlong's delay elapses, so its fade-in (which leads the travel) plays in the
top-left corner, under the narration panel. 13 networking cards shipped that way.
```

### before `export function lightBoxAt(boxEl, ctx, delay = 0) {`

```
Add .highlight to an infrastructure box ON PACKET ARRIVAL rather than at step entry,
via a zero-effect 1ms animation whose onfinish sets the class. Under ctx.reduced (or
a non-positive delay) it applies immediately, which keeps the reduced-motion static
end-state correct. This is how a box or a cylinder "receives" a packet without
pulsing, honouring the rule that only Pods pulse. Was copy-pasted byte-identically
into 52 cards before it was hoisted here.
```

### before `const HOP_MS = 700;`

```
---- packet travel: one core + thin route wrappers ----
easing 'ease-in-out' => animateAlong (even-by-distance). easing 'linear' => explicit
keyframes; offsets null => even-by-distance, else use the provided offset array.
Travel duration from path length (0.45 px/ms, clamped). This is THE speed canon:
route calls omit `dur` so the ball moves at one speed everywhere regardless of
distance. An explicit `dur` is reserved for narrative pacing and needs a one-line
justification at the call site. Length math mirrors animateAlong's accumulator.

HOP_MS is the one comfortable-hop-time knob: it is both topPacket's fixed duration
AND routeDur's floor. A SHORT routed hop reads as a calm hop, not a dart. Below
~315 units a path would otherwise finish under HOP_MS (e.g. a 220u control-plane
arrow at 489ms), which reads as too fast next to the long connector glide. Long
routes stay length-proportional and are unaffected. Tune pacing here, in one place.
```

### before `export function packetAlong(packetLayer, ctx, points, {`

```
Every packet ripples at its destination (the "delivered" cue is part of the
arrival canon, no per-call opt-in). The returned packet element carries
`arrivalMs = delay + travel` so cards anchor arrival pulses and fades to real
geometry instead of hard-coded delays.
```

### before `export function arrivalRipple(packetLayer, ctx, point, delay, role = '') {`

```
Arrival ripple: a one-shot ring that expands and fades at `point` at time `delay`,
reinforcing "delivered". It carries its own .scheme-ripple class rather than
.scheme-packet, so anything counting packets (anim-dump, check-geometry) sees one ball
per hop and not two. Exposed so cards that animate packets by hand (not via the route
wrappers) can still add the same arrival cue.
```

### before `export function routePacket(s, ctx, points, {`

```
---- unified packet wrappers ----
Easing + hop canon: multi-point ROUTES (connectors) glide ease-in-out via
animateAlong. Short hops come in exactly two flavours: top-row request/ack
hops use topPacket (eased, the stately top-strip pacing) and hops inside the
diagram body use segmentPacket (linear, crisp fades). dur omitted =>
distance-based (routeDur).

Multi-point route along an explicit path. Generalizes every per-card
connectorPacket and the raw `packet()+animateAlong()+manual fade` idiom. The
path array stays a local const in the card (geometry is card-specific) and is
shared with the matching pathArrow so the static wire and the packet agree.
```

---

## scheme/js/lib/tokens.js

Shared animation magnitude tokens. Kept dependency-free (zero imports) so `timeline.js`,
`scheme-kit.js` and the four category kits can all read one source of truth without an
import cycle.

### before `export const PULSE_POD = Object.freeze({ ms: 900, bright: 1.4, dimPeak: 0.8 });`

```
Pod pulse: stroke ramp (1.2->2.4 width, base->bright tint) + a brightness flash,
the richer two-part highlight used for pods and their container boxes.
900ms total (450 up + 450 down). Tint colour is supplied per card family.
```

### before `export const FADE = Object.freeze({ in: 600, out: 700 });`

```
Pod fade vocabulary: a pod materializes over `in` ms (ease-out) and dissolves
over `out` ms (ease-in). Cards that need a narrative-slow fade keep an explicit
duration with a one-line justification next to the call.
```

### before `export const BEAT = Object.freeze({ afterPulse: 800, afterHop: 100, lead: 800 });`

```
Choreography beats. `afterPulse` is the up-arrow gap: the pod blinks first and
the packet departs once the blink has mostly landed (PULSE_POD is 900ms).
`afterHop` is the down-arrow gap between a top-row hop arriving at a block and
that block emitting the next packet. `lead` is the gap before a controller
self-initiates a command packet down the connector with no preceding hop or
pulse, so the lit source block registers before the ball leaves.
```

---

## scheme/js/lib/timeline.js

### before `this.autoPulse = autoPulse;`

```
Generic block auto-pulse (a brightness flash on every freshly highlighted block/
chip). Workloads + cluster cards set this false so only pods pulse; the other
categories keep it on. Pods pulse via explicit pulsePod calls regardless.
```

### before `autoPlay(ms) {`

```
Auto-play after an opening dwell. Owned by the Timeline so any explicit action
(pause/step/gotoStep/restart/destroy) cancels it — no surprise playback firing
after the user has interacted, and no race with headless step-probing.
```

---

## scheme/js/lib/workloads-kit.js

### before `export {`

```
workloads-kit.js: per-category wrapper over scheme-kit for the Workloads cards.

The other three categories had a kit of their own while workloads cards imported the
base directly, which left scheme-kit playing two parts at once: the shared base AND
the workloads kit. That is why the workloads blue sat in the base as TINT_BASE. It
lives here now, so all four categories reach the base the same way and the base has
no category of its own.
```

### before `export const WORKLOADS_TINT = Object.freeze({ base: 'rgb(91, 184, 255)', bright: 'rgb(142, 198, 247)' });`

```
Workloads pods carry --workloads-color (#5bb8ff). base == the natural stroke is what
makes the pulse return to the original colour instead of settling on a paler tone
(the non-persist pulse fills forwards to `base`).
```

---

## scheme/js/lib/cluster-kit.js

### before `export {`

```
cluster-kit.js: per-category wrapper over scheme-kit for the Cluster cards.

Generic chip/label/init/packet helpers are re-exported from scheme-kit.js so
both card families share one source of truth. The cluster-specific pieces
(violet pod tint, pulsePod, pulsePodDim) live here; hops use the shared
topPacket (top row, eased) and segmentPacket (in-diagram, linear).
```

---

## scheme/js/lib/network-kit.js

### before `export {`

```
network-kit.js — shared helpers for the networking scheme cards.

Generic chip/label/init/packet helpers are re-exported from scheme-kit.js so
every card family shares one source of truth. The networking-specific pieces
(cyan pod tint, pulsePod, pulsePodDim) live here; hops use the shared
topPacket (top row, eased) and segmentPacket (in-diagram, linear).
```

### before `export const NETWORK_TINT = Object.freeze({ base: 'rgb(79, 229, 255)', bright: 'rgb(158, 234, 247)' });`

```
Networking pods carry --network-color (#4fe5ff = rgb(79,229,255)), so the pulse
must REST on that exact stroke and flash up to the brighter --tint-bright stop
(#9eeaf7 = rgb(158,234,247)). base == the natural stroke is what makes the pulse
return to the original colour instead of settling on a paler/warmer tone (the
non-persist pulse fills forwards to `base`). Mirrors scheme-kit's workloads tint.
```

---

## scheme/js/lib/storage-kit.js

### before `export {`

```
storage-kit.js — shared helpers for the storage scheme cards.

Generic chip/label/init/packet helpers are re-exported from scheme-kit.js so
every card family shares one source of truth. The storage-specific pieces
(teal pod tint, pulsePod, pulsePodDim, setCylinderLabel) live here; hops use
the shared topPacket (top row, eased) and segmentPacket (in-diagram, linear).
```

### before `export const STORAGE_TINT = Object.freeze({ base: 'rgb(94, 202, 148)', bright: 'rgb(174, 224, 199)' });`

```
Storage pods carry --storage-color (#5eca94 = rgb(94,202,148)), so the pulse must
REST on that exact stroke and flash up to the brighter --tint-bright stop
(#aee0c7 = rgb(174,224,199)). base == the natural stroke is what makes the pulse
return to the original colour instead of settling on a paler/warmer tone (the
non-persist pulse fills forwards to `base`). Mirrors the networking tint.
```

---

## scheme/css/styles.css

### before `.scheme-dialog[data-tinted="true"][data-cat="workloads"] {`

```
===== TINTED DIALOG =====
The whole modal collapses onto one category's colour ramp. Each category
supplies a literal 3-stop ramp (deep / base / bright) plus glow, border and
surface values. The generic rule then remaps every category token, the
accent trio, the diagram stroke/arrow tokens and the dialog surface onto
that ramp. Literal hex values are used on purpose: a var() chain back to the
category tokens is what made the previous version cyclic and invalid, and
color-mix is avoided so resolution is fully deterministic everywhere.
```

### before `.scheme-dialog[data-tinted="true"] .dialog-controls {`

```
Player-chrome gradation: the modal reads as a three-step ramp instead of one
flat tone. The canvas (--tint-canvas) is darkest, the controls bar
(--tint-chrome) is the mid tone, the header and step-dots strip (--bg-card,
from --tint-surface) are lightest. --tint-chrome falls back to the old
--tint-fill-node for any category that has not defined it.
```

### before `.scheme-dialog[data-tinted="true"] .scheme-box.highlight .scheme-box-rect,`

```
Tinted dialog, bright end of the ramp. Highlighted diagram elements, moving
packets and the player progress/dots lift to --tint-bright, so the
foreground reads lighter than the base-tone blocks and the deep-tone
structure. These rules sit after the per-category ones so they win the
equal-specificity tie.
```

### before `.scheme-dialog[data-cat="network"][data-tinted="true"] .scheme-packet {`

```
Network --tint-bright is a pale cyan (#9eeaf7), which washes the ball out. The
saturated network cyan reads far more vividly, so pin packet + ripple to it for
network dialogs only (higher specificity than the generic tinted rule above).
```

### before `.scheme-dialog[data-tinted="true"] .ctl-btn,`

```
Player chrome, mirrored from the non-tinted cluster cards but with a wider
gap between the two states. Idle controls blend into the panel: same fill as
the controls bar, a barely-there border, calm light icon. The active Play,
pressed Loop, hovered button and selected speed take a clear accent: a lit
--tint-active fill, bright border and bright icon. The idle chip recedes,
the active chip plainly stands out.
```

### before `.scheme-dialog[data-tinted="true"] .ctl-btn:disabled {`

```
Disabled control (Prev on step 0, Next on the last step): keep the full chip
so it stays uniform with its neighbours, only the icon dims to the deep
tone. The base rule's blunt opacity: 0.4 made the whole button look broken.
```

### before `.scheme-dialog[data-tinted="true"] .dialog-progress { background: var(--tint-glow); }`

```
Progress fill and the active/passed step dots drop from the bright tone to
the base tone, a touch darker, as requested. The track and idle dots keep
the faint glow.
```

---

## scheme/css/diagrams.css

### decision: role beats dim on an arrow, and that is not the bug it looks like (2026-07-29)

`.scheme-arrow-dim` sits ABOVE the three `.scheme-arrow-<role>` rules at equal specificity, so the
role wins the stroke and `dim` survives only as `stroke-width: 1.4`. `arrow()` and `pathArrow()` in
`primitives.js` read the same way round for the marker. 315 of the catalog's 358 `dim: true` calls
pass a role, so on the face of it `dim` is a no-op almost everywhere, and item 2.4 of the review
filed it as defect S1, a catalog-wide bug worth fixing in two lines.

It was implemented and reverted the same day. The premise is wrong: **`dim` here is a stroke
WEIGHT, not a lifecycle state.** A wire that a ball rides is normally drawn dim, which was measured
rather than argued: a probe over every step of every card found 601 dim lanes carrying a packet
across 511 steps. Making dim outrank role therefore does not quieten a handful of inactive lanes,
it greys out most of the route wires in the catalog and breaks the per-category colour identity.
Verified on rendered before/after frames: 94 of 103 cards changed, the mount lanes carrying `write`
and `read` on `storage-volume-model` went from jade to grey, and the kube-proxy fan on
`network-service-clusterip`, the card this project names as the Networking exemplar, went from cyan
to grey.

What the real fix separates is a RELATIONSHIP line (no ball ever, already its own helper
`relationPath`) from a resting ROUTE wire. `dim` does not tell them apart, so `relationPath` now
adds `scheme-arrow-relation` and the CSS gives that class `stroke-opacity: 0.45`. The line keeps
its category hue and sinks behind the live wires instead of turning neutral, which was the author
call: a grey line loses the category identity the whole palette exists to carry. 28 calls over 26
cards, every one of them reviewed as a before/after frame pair.

Read `stroke-opacity` rather than a darker colour literal as deliberate. It keeps ONE colour token
per category (a darker variant would be a second token per category to keep in step with the
first), and it multiplies with any element `opacity` a card pins, so a relation line into a block
that is fading out still fades with it.

That change exposed one real defect, now fixed: `network-pod-ip-and-veth` drew its localhost
loopback with `relationPath`, but its `shared` step sends a ball along it. It is a route wearing
the relationship helper, the same mis-classification the sweep of 2026-07-27 deliberately avoided
on `network-model`'s `podWire`. The card now raises that line to full strength on the one step that
uses it and lets it rest recessed on the others, which is family J rule 3 applied to a relation
line. A probe over all 26 cards and 128 steps found no second case.

What was kept from the attempt: arrows now carry `data-role`, and `.scheme-arrow` joined
`check-palette`'s `PAINTED` list with `scheme-arrow-dim` as part of the state key. Arrows had never
been colour-checked by anything, which is why the S1 report could claim a catalog-wide repaint with
no check disagreeing. The catalog is consistent under the new rule: 1762 painted elements over 30
combinations, up from 1294 over 23.

### before `fill: #abb0f5;`

```
Brighter than the base --cluster-color #7d86ff so the ball reads as vividly
as the workloads (tinted) packet does. Same indigo hue, just lighter: this is
the cluster-family bright stop (matches --tint-bright for a tinted cluster
card). Tinted dialogs override this with --tint-bright at higher specificity.
```

### before `fill: #4fe5ff;`

```
The tinted dialog maps --network-color to the pale tint stop, which made the
ball read as washed-out. Pin it to the saturated network cyan so the packet
pops against the paler pod-pulse tint.
```
