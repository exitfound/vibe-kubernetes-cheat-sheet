# Scheme card design notes: cluster

Per-card design record moved out of `scheme/js/schemes/*.js`, where it had grown into
walls of prose above the code. Every comment block of three lines or more now lives here;
one and two line clarifications stayed next to the code they explain.

This file is NOT deployed. Three separate exclusions keep the whole `scheme/docs` directory out
of production and all three must hold: `.github/workflows/deploy.yml` runs
`rm -rf _site/scheme/tools _site/scheme/docs`, `.github/workflows/release.yml` lists
`"scheme/docs/*"` in the release zip's `-x` list, and `.dockerignore` lists `scheme/docs`. The
last one is not optional: `Dockerfile` is a blanket `COPY . .`, and this directory did serve at
`http://localhost:8080/scheme/docs/CARDS.md` until it was added there.

Each entry is anchored by the line of code that followed the block, so a note can be put
back beside its code when needed. The card files link here from a single pointer comment
under their imports.

Generated 2026-07-25 from 86 cards, 3987 lines relocated.

A second pass added the `### poster` subsections: the `POSTERS` map in `js/posters.js` is keyed by
card id, so each poster note sits under the card it draws. That moved 59 blocks, 459 lines. The
non-card scheme sources (catalog, kits, CSS) are in the sister file `INTERNALS.md`.

**READ THIS BEFORE TRUSTING A NOTE BELOW.** (Deliberately not a `##` heading: every `## ` in this
file is a card id, and tools parse it that way.)

**A note is a record of what was true when someone wrote it, not a live description of the code.**
Nothing verifies these entries, so check two things before you act on one.

1. **The narration safe-zone `x<=380, y<=300` was never a measurement, and no note below states it
   as fact any more.** Measured over 1600 / 1440 / 1280 / 1100, the panel's right edge is `x<=397`
   catalog-wide, and its BOTTOM is per card, from 171 to 504, changing with viewport width
   NON-monotonically. A note that justifies a placement by "clears y=300" proves nothing. On
   2026-07-27 the blanket appeared in 17 notes: 13 derived a placement from it and were corrected,
   and 4 named it and then gave their own per-viewport measurement. **Those 4 are the pattern to
   copy** (`storage-csi-architecture`, `storage-csi-attach-mount`, `storage-dynamic-provisioning`,
   `storage-pv-lifecycle-phases`). Re-measure with `node check-geometry.mjs --rules=occluded`, and
   read "The narration panel is measured per card" in `scheme/CLAUDE.md`.

   One correction there is worth knowing about because it is not cosmetic: `storage-volume-expansion`
   argued that its Kubelet at x=130 was safe because y=396 cleared the blanket `y<=300`. Since the
   real bottom is per card and reaches 504, that block is only safe while THIS card's panel stays
   above 396, so lengthening its narration can occlude it. The note now says so.
2. **A stale anchor means a stale note, so anchors are kept live.** Each entry is anchored by the
   line of code that followed it, so a note can be put back beside its code. On 2026-07-27, 62 of
   557 anchors had gone stale, almost all in cards the R5 relayout touched, and all 62 were resolved:
   43 re-anchored, 8 turned into `### opacity phases` topics after R4 replaced their constant with
   `OPACITY.*`, 10 stripped of an anchor that matched several identical lines, 1 deleted outright
   because the behaviour it described was removed. **Every anchor in this file now matches a real
   line.** A dead anchor never meant a worthless note: most carried reasoning (why a lane has no
   arrowhead, why an absent object is dimmed rather than hidden) that outlived its coordinates.

Two shapes here deliberately carry no anchor, and both are honest about it: `### opacity phases`,
whose constant no longer exists, and `### note (anchor dropped: ...)`, whose target line appears
more than once in the card so no anchor can name it.

The reverse case has no detector at all: a note whose anchor still matches while its prose went
stale. Only reading catches those, and 17 of them are named in point 1.

---

## cluster-admission-webhooks

### layout

Written 2026-07-27, when a check found this card had no design record at all. The card was never
part of an R5 relayout because it already reported zero on all six geometry rules, which is exactly
why the record was missing: nothing forced anyone to write it down.

The shape is the L read correctly. The narration panel owns the top-left corner, so the API row
starts at `API_X = 420` and the request from `kubectl` cannot come in from the left at that height.
Instead `kubectl` sits in the freed BOTTOM-left and its request climbs a riser in the narrow corridor
between the panel edge (397) and the API face (420) before turning into the API's left face. That is
the storage grammar borrowed into a cluster card, and it is what lets the content centre on
`CX = 600` without anything being stretched to make it.

| constant | value | derived from |
|---|---|---|
| `CONTENT_L` / `CONTENT_R` | 60 / 1140 | the shared content band, `M = 60` off each edge |
| `CX` | 600 | `(CONTENT_L + CONTENT_R) / 2`, not a chosen number |
| `BAND_L` / `BAND_R` | 100 / 1100 | the content band inset by `BAND_INSET = 40`, see the 2026-07-31 note below |
| `API_X` | 420 | first multiple of 20 clear of the panel's measured right edge (397) |
| `KCTL_OUT_X` / `KCTL_BACK_X` | 205 / 235 | `KCTL_CX` +/- `LANE_DY`, one riser per direction off the kubectl top face, out left of back so they never cross |
| `ETCD_X` | 956 | `BAND_R - ETCD_OPTICAL - ETCD_W`, 4 inside the band so the cylinder reads flush with the rounded chip below it |
| `LADDER_X` / `LADDER_W` | 420 / 400 | the pipeline hangs under the API and inherits its width, so the six admission stages read as belonging to it |
| `CHIP_W` | 490 | `(BAND_R - BAND_L - CHIP_GAP) / 2`, two chips spanning the inset band, so the strip centres on CX by construction |

**Why the chips are two across and not four.** The longest value on this card is
`{cpu=100m, runAsNonRoot=true}` on the `Pod object` chip. At 490 it clears its name comfortably; at
the four-across width of 258 that the 2026-07-27 relayout used elsewhere it would overlap, which is
the defect `check-chipfit` was written for. Two across is the floor for this card, not a preference.
Re-measured at 490 after the 2026-07-31 inset: still clean.

---

### the inset band and the top-face exit (2026-07-31)

```
Three author changes, one composition.

The flanks stopped standing on the content edges. kubectl, ETCD and the chip strip now share
BAND_L/BAND_R (CONTENT inset by 40), which does two things at once: it pulls kubectl and ETCD a
little toward the centre, and it makes the left edge of kubectl the left edge of the Pod object
chip and the right edge of ETCD the right edge of the failurePolicy chip. One vertical line down
each side. Centring is unaffected by construction, because the inset is applied to both ends:
content and chip strip both span 100..1100 and both centre on CX.

Both kubectl lanes moved from its RIGHT face to its TOP face, straddling KCTL_CX by LANE_DY the
same way they straddle the API face centre by LANE_DY at the other end, and each is ONE right angle:
up, then across. Out is left of back at both ends, which is what keeps them from crossing.

That shape was reached second. The first attempt jogged each lane right at y=245/275 into the free
404..416 corridor before rising, to keep every segment out from under the narration panel, and the
author rejected it as a zigzag. The single right angle is his call, made knowing the cost, and the
cost is real: x=205 and x=235 are both inside the panel (x<=397, y<=230 since 2026-08-04, y<=205
before it), so each riser runs behind the overlay from that bottom up to its turn, and the left
third of the out lane's crossing at y=85 is
hidden too. At 1100x800 with the longest narration that leaves two dashed stubs entering the API
and two verticals below the panel, with the join invisible. At 1280 and wider most of it returns.

There is no third option, which is why this is written down rather than left to be rediscovered.
The API face the lanes must reach sits at y=85/115, ABOVE the panel bottom, so any lane reaching it
from the left crosses the panel band. Moving kubectl so its centre clears x=397 collides with the
ladder column at 420..820 or, below the ladder, with the chip strip at y=520. Widening kubectl to
push its centre right breaks the left-edge alignment the band exists to give.

ETCD is pulled 4 units inside BAND_R while the chips sit flush on it. That is an OPTICAL correction,
not a geometric one, and the measurement is the point: flush, the two right edges differ by a single
antialiased pixel, yet the cylinder reads as overhanging because its right wall is a straight line
down the full height while the chip is a rounded rect whose rx=4 corners pull its own edge in. The
inset is that rx. Same family as the ETCD label nudge the card already carries.

The API-to-ladder connector became a relationPath, matching the sibling cluster-scheduler-decision:
no arrowhead, no ball, and it lands ON the ladder edge at LADDER_Y instead of 2 short of it, since
the 2 was clearance for the arrowhead. The routePacket that used to drop from the API into ladder
row 1 went with it. The six stages ARE the API, so nothing travels down to reach them.

The response wire label moved with the lanes: it was right-anchored at 396 because the gap beside
kubectl was 116 units and a centred string overran into the ladder. With both lanes gone from that
face the gap is down to 80, and the band directly under kubectl is empty to y=520, so the label is
simply centred on KCTL_CX.

Timing, as always after a geometry change: the request route went 360 -> 430 units and its glide
800 -> 956ms, which put authn-authz 116ms past its 2200 duration. It was raised to 2500 and then
put back to 2200 in the same session, because dropping the ladder ball took the step span to 1516.
Never the ball slowed, either way: the pace is length-based.

PANEL_B and the header comment were corrected to the measured 205 while here. They previously said
195 (a widths-only sampling) and reserved 215, two numbers that disagreed with each other and with
the measurement. The pre-existing check-arrival R2 pair on the failurePolicy chip was verified
against the unmodified file and is not from this change: it is the recorded benign shape, a marker
from the previous step being cleared rather than an event of this one.
```

---

### review pass (2026-07-31)

```
Four defects, found by reading the card against itself and against kubernetes.io.

The Api box was DARK on mutating, schema and validating, and lit only on authn-authz (on arrival)
and persist (at entry). Those three steps also carry no motion at all, so with the Api unlit the
only thing happening on screen was one ladder row, and the block whose own pipeline the whole card
is about read as idle for half its length. One line each, above the guard, since those steps have
no guard to be below. Same family as the score step of cluster-scheduler-decision.

DefaultStorageClass was named as the always-on mutating example on a card that follows a Pod. It
acts on PersistentVolumeClaims, which the reference confirms, so the example did not apply to the
object in the chip or in POST /api/v1/pods. Replaced with DefaultTolerationSeconds: enabled by
default, mutating, and it acts on Pods.

Ladder rows 3 and 5 credited the whole stage to webhooks while their own steps open with
"Pluggable plus built-in" and then name the always-on plugins. A block label contradicting the step
it labels, which is the cheapest defect class in this project and one no check sees. Now
"plugins and webhooks rewrite it" and "plugins, policies and webhooks".

ValidatingAdmissionPolicy was missing. It sits in the default-enabled controller list, so the
validating stage has THREE paths and the card named two. Added to the narration, and row 5 says
"policies" for the same reason.

Narration length fought back, as it does here. Both rewrites came out SHORTER in characters and the
validating panel still gained a line, because ValidatingAdmissionPolicy and
ValidatingWebhookConfiguration are two unbreakable 25-plus character tokens in one sentence and the
wrap is token-bound, not character-bound. Dropping the second name (the mutating step already
establishes the ...WebhookConfiguration pattern) bought the line back and kept the ResourceQuota and
LimitRanger examples, which teach more than a CRD name. Panel worst case is 205 again, unchanged.

NOT changed: LimitRanger stays under validating, and the REASON recorded here on 2026-07-31 was
wrong. It said the kubernetes.io reference classifies it as validating. The reference types it
"Mutating and Validating" and lists it among the default-enabled plugins, so there is no arbiter to
appeal to: the placement is a choice, and the choice is that the validating step describes checking
the final object against a LimitRange, which is what a reader meets it doing. Its defaulting side is
covered by the mutating step naming always-on plugins as a class. Corrected 2026-08-01.

REVERSED on 2026-08-04, on the author's explicit call. LimitRanger is now named in BOTH steps, which
is what the reference types it and what the new cluster-resource-quota card spells out at length.

The sequence is worth keeping, because the first half of it was a reviewer overstepping. Building
cluster-resource-quota surfaced that this card named LimitRanger only under validating while the new
card asserts both phases. A pass added it to the mutating list, then found the 2026-08-01 paragraph
above, saw that it had already weighed this exact argument, and reverted itself: a recorded author
decision is not a reviewer's to overturn. It was put to the author instead, and the author chose the
reversal. So the 2026-08-01 reasoning is superseded rather than wrong: it held while LimitRanger's
defaulting side was covered only by "always-on plugins as a class", and it stopped holding the
moment a sibling card taught that side by name.

Naming it twice needed the repeat to read as deliberate rather than as a duplication bug, so the
validating step now opens `LimitRanger is back to check min and max`. Same step also carries the
hand-off `See the ResourceQuota and LimitRange card.`, in the shape cluster-node-pressure-eviction
uses for its QoS reference.

That step went 211 to 284 characters and the mutating step 261 to 274, and the panel was measured
rather than assumed at every stage. It moved: 160 / 178 / 193 / 205 becomes 160 / 178 / 193 / 230
over 1600x1000, 1440x920, 1280x860 and 1100x800, with the worst case back on this step. 230 is safe
because the nearest thing under the panel corner is kubectl at KCTL_Y = 300, so 70 units of
clearance. The header comment carries the new number. Two intermediate measurements worth recording,
because they show the budget here is a LINE count and not a character count: the validating step at
257 characters still measured 205, and 274 tipped it to 230. Do not count characters on this card,
measure it.
```

---

### review pass (2026-08-01)

```
One defect, in the ladder row and the step that share a stage.

Row 4 read "validate against OpenAPI schema" and its step said the object "is validated against the
OpenAPI schema for its resource. Type errors and required-field violations are caught here". The
STAGE is right and sits where the reference request-flow diagram puts it, between the two admission
phases. The mechanism named is not: for a built-in kind like the Pod this card follows, the API
server runs its own validation for that kind in Go, an OpenAPI structural schema is what a CUSTOM
resource is checked against, and type errors are caught earlier still, when the request body is
decoded. One sentence claiming all three.

Row 4 is "types and required fields checked" and the step names the API rather than a schema
format, which is true of a built-in and of a custom resource alike. The new narration is 148
characters against 177, so the panel cannot have got deeper and the measured 205 stands.
```

---

### the authn-authz step became a handoff, and then took the mechanics back (2026-08-04)

```
Both halves happened on the same day, so this is one record rather than two.

FIRST, the step was thinned to a handoff. It used to compress authentication, authorization, RBAC,
the Node authorizer, the Webhook authorizer and both failure status codes into one sentence of about
40 words, and once cluster-authn-authz existed all of it was said better a card away. It was NOT
deleted, because the ORDER is what this card owes the reader: admission runs after authn and authz,
and only for a request that cleared both. So the step kept its ball, its wire label and its chips,
and the prose became a cross-reference in the style cluster-delete-flow, cluster-node-drain and
cluster-node-pressure-eviction already use.

THEN cluster-authn-authz was removed from the catalog, and the handoff had nothing left to hand off
to. The author is planning a Security category later and wants authn, authz and RBAC to arrive there
whole rather than split. A control-plane flavoured rewrite of that card was considered and rejected,
because what would have remained of it (the authenticator chain, the authorizer chain, 401 and 403)
is the first stage this card already draws, so the two would have duplicated rather than
complemented each other.

So the premise of the thinning is gone and the decision reverses: the step carries the authorization
mechanics itself again. What it says now is narrower than the 40 word original on purpose, and the
boundary is the one the future Security card sets. In: the request arrives already authenticated,
authorizers run in the order the API server was configured with (commonly Node then RBAC), the first
to allow or to deny ends it, and nothing allowing it means 403. Out: the RBAC object model, the
authentication modules, and 401, all of which belong to Security.

Ladder rows 1 and 2 stay as the first half left them, "who the caller is" and "what the caller may
do". They were narrowed from "identity from x509 / token / OIDC" and "RBAC + Node + Webhook chain"
because a row must not say more than the step it labels, and that reason survives the reversal: the
rows name the stage and its question, and the step now answers the second one.

The desc in data.js was checked and left alone across both halves. It lists "authenticated,
authorized" among the gauntlet stages, and that stays true either way.

Length, which is what constrains this step. 173 characters originally, 188 as a handoff, 265 now.
The mutating step at 261 had been setting the panel and this one is 4 characters longer, so the
panel was re-measured rather than assumed. It did not move: over check-geometry's own viewport set
(1600x1000, 1280x860, 1100x800) the bottom is 160 / 193 / 205 before the rewrite and 160 / 193 / 205
after it, so the recorded worst case of x<=397, y<=205 in the header comment still stands. What
changed is only WHICH step sets it at 1100x800: the mutating step did, this one does now, and the
two land on the same line because the wrap is token-bound and not character-bound. The practical
ceiling for this step is therefore the mutating step's line count, not its character count.
```

---

### poster

```
One sentence: a write passes a rewrite gate and a check gate before it reaches storage. Four
elements left to right, chained by dashed links: the request as a small box with three text lines,
the mutating gate as a dashed box carrying a squiggle (the object being rewritten), the validating
gate as a dashed box carrying a tick, and the etcd cylinder. The two gates are DASHED while the
request and the cylinder are solid, which is the whole idea in one attribute: the ends of the chain
are fixed, the middle is pluggable.

No ladder, no kubectl, no chips, no API frame. The six stages are what makes it a card and what
would make it unreadable at 200px.

Emphasis is FLAT on purpose, and that is now a decision rather than an oversight. All four elements
sit at 0.04 to 0.06, where the canon asks for one brightest element to land the eye on what the
sentence is about.

Tried and rejected by the author, 2026-07-31: raising the two gates to 0.16 while leaving the
request box and cylinder at 0.04 and 0.06. It did what the rule wants, the eye went to the bright
dashed middle between two quiet solid ends, and it was reverted on sight. Do not re-apply it as a
canon fix. If the flat emphasis is ever revisited, the open question is whether a poster whose
subject is a PAIR can take the single-brightest treatment at all: brightening both is two focal
points, and brightening one means choosing between mutating and validating on a card about both.
```

## cluster-api-structure

### layout (R5-a, 2026-07-27)

```
The two ETCD lanes used to drop at ETCD_CX +/- 12 from the top row, which ran both risers
straight down through all three state chips. They now leave the API on its right face, run down
the corridor between the Informer column and the chip column (RISER_OUT_X 764, RISER_BACK_X 740,
out to the RIGHT of back so the two never cross) and enter ETCD on its LEFT face at
ETCD_CY -/+ 12. The watch wire label moved to the left of the watch arrow (anchor end at x=580)
to clear that corridor. Chips stay at 840..1140: the chip strip pools with the GVR ladder at
60..360 and the event slots, and moving the column left is what breaks CENTRE.
```

The 5 findings check-chipfit reported here were all FALSE: `eventSlot` draws two STACKED texts
(type over sub-line), not a name/value pair. `check-chipfit.mjs` now skips chips whose two texts
sit on different baselines.

---

### before `const IDX_Y = 390, IDX_H = 80;`

```
The Indexer was a cylinder until 2026-08-04, and ETCD is a cylinder 400 units to its right on
the same card. In this catalog that glyph means a DURABLE STORE, so the card drew the informer
cache and the cluster datastore as the same object in one frame, on a card whose list step
exists to say the controller reconciles from local memory without going back to the API. It is
a box with an `in-memory cache` sublabel now, and ETCD is the only cylinder on the card.

The height came down from 110 to 80 with it. 80 is the family block height here (API and Client
are both 80), and at 390..470 the Indexer now shares its row exactly with the Client, so the low
band reads as three peers of which only one wears the store glyph. Nothing derives from IDX_H:
FEED_LANE lands on IDX_Y, so no route length and no packet timing moved (spans are unchanged at
1716 / 3460 / 1260 / 3593 / 1260 / 600).
```

### before `const gvr = chainList({`

```
Left: the GVR catalogue the Api serves. Same 32px row height / 38px pitch as the chips on
the right, and its first THREE rows (the built-ins, always visible) are centred on the
Informer exactly like the 3 chips — rows at y=217/255/293, midpoint cy=271. The 4th row
(the CRD, hidden until the crd step) then falls below at y=331. Sits a symmetric 110px off
the Informer's left edge (mirror of the chips' 110px off its right edge).
```

### before `const streamLabel = text({ class: 'scheme-label dim code', x: CX, y: STREAM_LABEL_Y, 'text-anchor': 'middle' }, ['watch event stream (resourceVersion grows)']);`

```
Bottom: watch event stream timeline, centred under the spine. The label is centred on
cx=600 — the midpoint of the four slots (290..910) and the Indexer above them. It is
hidden until the ADDED slots appear and tracks their visibility from then on.
```

### before `const ask = routePacket(s, ctx, API_TO_ETCD, { role: 'cluster' });`

```
Four balls, but TWO independent chains rather than one, and that is the whole point of the step.

The answer chain: Api -> Informer (the full set, straight down the watch lane) then
Informer -> Indexer (fills the cache). It is gated on nothing and leaves at delay 0.
The background chain: Api -> ETCD and ETCD -> Api, the Api keeping its own watch cache current,
running alongside.

WHAT THE PAIR MEANS CHANGED ON 2026-08-01 while the motion stayed identical, and that is what
left the card contradicting itself for three days. The lanes used to be narrated as this LIST
being read through to ETCD. The narration was corrected to "answers the list from there, with no
quorum read" and the wire labels were relabelled as the cache fill, but the CHAIN was left as it
was: `stream` still waited on the ETCD return, so the reader watched a ball cross to ETCD and come
back before the Informer was answered, under a panel saying no quorum read had happened. Two
comments in the same enter() then argued both readings at once.

Ungated on 2026-08-04. The Api is now lit at ENTRY, because it is the source of both outbound
balls (the answer and the list-watch) rather than a relay, which is what the R3 sender-lit rule
wants. Motion ends at 3460 instead of 5140. `duration` was deliberately NOT cut to match: 5400 is
reading time for the longest narration on the card, not motion time.
```

### before `s.refs.slots.slice(0, 3).forEach((slot, i) => {`

```
The three LIST items land on the timeline once the set has reached the Indexer. Staggered
durations are deliberate: the items appear one after another. fill:'both' back-fills opacity
0 through the flight so the slots stay hidden until then.
```

### before `ctx.register(fourth.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: toCache.arrivalMs, f`

```
The slot only lands once the ball has finished its whole journey into the Indexer.
fill:'both' back-fills opacity 0 through the flight so it stays hidden until then (no
flicker), inline 1 is the cancel/reduced final.
```

---

### review pass (2026-08-01)

```
Two defects, both about the card teaching a mechanism it does not have.

THE INITIAL LIST IS NOT READ THROUGH TO ETCD. The step said "The API reads from ETCD and
returns the full set at a snapshot resourceVersion", and the aria-label said the same. A
reflector lists at resourceVersion 0 on its first pass, and the reference is explicit about
what that means: unset is "served from etcd via a quorum read", 0 is "always served from
watch cache". The client-go comment says so in the code that picks it:

  For performance reasons, initial list performed by reflector uses "0" as resource version
  to allow it to be served from the watch cache if it is enabled.

The sibling cluster-architecture had it right all along on its etcd-response step ("Clients
watch the API, never ETCD, and it answers them from its own cache"), so the catalog was
disagreeing with itself about the one mechanism both cards exist to explain.

Fixed WITHOUT touching the geometry or a single duration, because the drawn pair is true of
something else that belongs on this step: the watch cache is filled from ETCD. The req wire
carries rv=0 rather than rv=842 (the 842 is what comes BACK, and the chip already shows it),
the two ETCD lanes gained the labels they never had, and the narration and the aria-label say
cache. What was NOT done: adding an Informer -> Api request lane. The card draws every flow
downward and the LIST request itself is nowhere on it, which is a real gap and a geometry
change, so it is left open here rather than half-made.

SLOT 0 WAS NOT A RESET. `discovery` sat in slot 0, so at the poster position the card drew
its request ball, lit Client and Api and set two wire labels (GET /api + GET /apis, GVR
catalogue) UNDER the panel text of the step after it, which talks about the LIST. On top of
that the discovery exchange was the one thing on the card no narration ever explained, and
its routePacket never ran at all, because the poster position enters reduced. Discovery is
its own narrated step now and slot 0 clears. The card goes from 5 shown steps to 6.

Two dead things went with the pass. `ETCD_CX` lost its last caller when the ETCD registers were
re-anchored to the bottom legs, and `wireEvent` was a sixth wire register that build() created,
positioned at 620/352, appended to the DOM and registered as `wires.event`, which no step had ever
set: a permanent blank on the canvas. The card has five registers now, and all five are written.
```

---

### review pass (2026-08-04): the process frame is OPEN, and here is the measurement

```
THE FINDING IS REAL. Client (client-go controller), Informer and Indexer are ONE process drawn
as three independent blocks on three levels with no boundary, so the Client reads as an actor
talking to an informer it actually contains. The suggested fix is one dashed frame around the
three, the way cluster-architecture frames its Node. It is NOT DONE, and not because it was
not tried: every placement that passes check-geometry costs more than the finding does.

WHAT BLOCKS IT. The bbox of the three blocks as they stand is 60..690 x 235..470. The GVR
ladder is 60..360 x 217..363, so a plain rectangle swallows the whole width of the catalogue
and 128 of its 146 units of height. The catalogue is the API's document, not the controller's
memory, so it cannot be inside. That leaves three ways out and all three were measured.

1. MOVE THE LADDER OUT OF THE LEFT COLUMN. Measured, not argued: GVR_X 60 -> 840 and
   `check-geometry cluster-api-structure` returns

     CENTRE    chip strip spans 290..1140, centre 715 (want 600)

   which is the finding this card does not have today. The strip pools value chips AND
   chainList rows AND the event slots, and it centres on 600 precisely BECAUSE the ladder
   holds 60 while the chips hold 1140. Nothing else on the card can hold 60: the event slots
   start at 290 and widening them to reach 60 moves the whole timeline off the spine.

2. MOVE THE LADDER UP, ABOVE THE FRAME, in the same column. The panel was re-measured on
   2026-08-04 at 1600x1000 (x<=291, y<=125), 1440x900 (319/143), 1280x860 (378/150) and
   1100x800 (397/180), so 180 is the floor the left column starts under. Best case the ladder
   runs 190..336, the frame top is then 356, node() spends 34 on its own label, the Informer
   72 and the Indexer 80, and the frame bottom lands at 584 or lower. The stream caption sits
   at 536 and the slot row at 548..592. It does not fit with every gap set to zero.

3. MOVE THE LADDER DOWN, BELOW THE FRAME. The frame bottom cannot be above 482 (Indexer 470
   plus a floor), so the ladder runs 502..648 on a 640 canvas, and it crosses the slot row at
   290..910 as well. Narrowing it to clear the slots is not available: the longest row string
   `/apis/example.com/v1/widgets (CRD)` measures 234.3 units rendered and chainList draws it
   at x=10, so a row cannot go below about 245, and the band left of the slots is 230 wide.

WHAT WAS FOUND AND NOT TAKEN. A notched outline (a hexagon enclosing the three blocks with a
rectangular bite taken out of the top-left where the ladder sits) is geometrically free: it
moves nothing, and as a `.scheme-node` it is excluded from THROUGH, OCCLUDED and CENTRE-LOW
while adding nothing to the content bbox that 60..1140 does not already cover. It was declined
because it is not what the sibling card does and a Tetris-shaped process boundary asserts a
shape the mechanism does not have. A frame around two of the three was never on the table: it
would assert a boundary excluding a box the label says is inside, which is worse than none.

WHAT A FUTURE ATTEMPT HAS TO BUY. Not the frame: a home for the discovery catalogue that keeps
a chip on x=60, keeps the API -> Informer -> Indexer spine straight on CX, and does not push
the event timeline off that spine. Until one exists, the finding stays open here, which is the
project rule for a finding that can only be closed by making the picture worse.
```

### poster (reverted 2026-08-04, author preference)

```
WHAT SHIPS is the original: three stacked 160 x 22 rows on the left standing for the listed
objects, three short dashed legs off their right edges, and six dots trailing away to the right in
two sizes and three opacities, the stream of later changes arriving over the open watch.

WHAT WAS TRIED AND DECLINED. A pipe version was built to an approved concept on 2026-08-04: an API
block on the left, a cache block on the right, one long horizontal channel between them carrying
four event cells with the newest at 0.9, for the sentence "one connection stays open and events keep
arriving on it". Its purpose was to take this card out of the stack-of-rows family it shared with
cluster-authn-authz and cluster-server-side-apply. It was built, montaged and shipped, and the
author asked for the original back. A preference, not a defect report: the pipe passed every check.

That family is a PAIR now, not a trio: cluster-authn-authz was removed from the catalog later the
same day, so this poster and cluster-server-side-apply are the two rectangles-joined-by-dashes left
in the section. The argument below is weaker by one card and is not withdrawn.

WHAT THAT LEAVES OPEN. The review called this poster one of three that read as rectangles joined by
dashes at grid size, and restoring it restores that. The dots are also the specks the poster rules
warn about: 2 and 2.5 radius marks are near-invisible at the 200px the grid actually renders. Both
are known and this poster is to be reworked FROM this shape rather than replaced by the pipe.
```

---

## cluster-apply-flow

### layout as it stands (2026-08-05, one grid shared with cluster-architecture)

```
Read this one first. Every note after it is how the card got here and what was rejected, and they
contain numbers that were true at the time and are not now. In particular this replaces the
2026-08-04 record wholesale: the client left the frame and came back and left again, the whole
stack moved down under the narration panel, the frame grew upward, and the tier-2 lane band
changed shape twice.

THE INSTRUCTION (2026-08-05) was one sentence: take cluster-architecture's block layout and delete
the cloud-controller-manager. It was first carried out as a MIRROR, with ETCD moved to the left
slot of the top row, and THE MIRROR WAS REVERSED THE SAME DAY: ETCD went back to the right wall,
which is where architecture has it. So nothing on this card is mirrored, and a note that says it is
predates that reversal. What the card is now is architecture's grid with the tier-2 centre column
empty, one Node block instead of three, and a client standing outside the frame.

Rows and columns, measured off the rendered DOM at 1600x1000, not off the source:

  Control plane frame  150..1050 x  90..440
  Node-1 frame         150..1050 x 475..628

  top row      140..220   API 490..710, ETCD 900..1030 (cylinder 130..240). The LEFT slot of the
                          row, 170..390, is EMPTY, which is what keeps this card out of the
                          narration panel's column.
  kubectl      225..305   1060..1190, OUTSIDE the frame, centred on its right wall
  tier 2       328..408   controller-manager 170..390, Scheduler 810..1030, CENTRE COLUMN EMPTY
  Node-1       475..628   Kubelet 170..390 at 522..602, Pod 810..1030 at 509..615
  drawing       34..628   the client labels are the topmost ink, at y=34

Every row and every column above is cluster-architecture's to the unit, and that was verified by
measuring both cards the same way rather than by reading either source. The blocks that differ are
only the ones the two cards do not share: this card has kubectl and a Pod, that one has the
cloud-controller-manager, the Runtime and kube-proxy.

Everything horizontal derives from FRAME_X 150 and FRAME_W 900 through PAD 20: IN_L 170 and IN_R
1030 are the walls every block inside either frame sits on, and CX 600 is the frames' centre, the
API's, and the midpoint the Node lane drops on. FLANK_W 130 is architecture's ETCD width and is
used twice, once for ETCD and once for the client.

WHY THE STACK SITS THIS LOW, AND WHY IT NO LONGER HAS TO. The frame starts at 90 and the top row at
140 because, while ETCD held the LEFT slot, the cylinder stood in the narration panel's column
(x<=397 at the worst viewport) and no block can dodge that panel sideways from there. At
architecture's old y=70 the cylinder was 73% behind the panel at 1280x860 and 100% behind it at
1100x800, which is the state the author called broken, so the stack cleared the panel's FLOOR
instead. That drop cost the Node frame 27 units, 153 where the card had 180, and it was paid once.

THEN ETCD WENT BACK TO THE RIGHT AND THE PREMISE DIED WITH IT. Nothing on either card sits in the
panel's column any more, and a bare check-geometry reports NO occlusion finding for this card where
it reported one at 46% the day before. So the drop is currently unpaid for, on BOTH cards, because
architecture then copied these rows. What it still buys is that the two cards agree in both axes.
Raising the rows is available and is a real decision rather than a cleanup: it is also a timing
change, because routeDur is length-based and every vertical lane on both cards would shorten. Left
as it stands on purpose, and written down here so nobody re-derives the dead reason from the shape.

THE CLIENT IS OUTSIDE THE FRAME AND ITS LANES GO OVER THE TOP. kubectl runs on your machine, so it
cannot sit inside a box labelled Control plane. It was put INSIDE for part of the day, in the top
row slot ETCD vacated, and taken back out by instruction. Where it stands now is the 150 unit band
the frames leave on the right, 10 clear of the wall and 10 of the canvas edge, centred on the
wall's midpoint 265. Its two lanes leave its TOP face, climb into the free band above the frame,
run level across it and drop into the frame's TOP face either side of the midpoint 600:

  POST      (1135, 225) -> (1135, 50) -> (590, 50) -> (590, 90)
  POST_ACK  (610, 90) -> (610, 70) -> (1115, 70) -> (1115, 225)

WHICH SIDE OF EACH FACE EACH LANE TAKES IS NOT FREE, and it is the one way this shape tangles. The
out lane runs on the upper level 50 and the return on the lower 70, so an out vertical standing
LEFT of where the return lane turns down cuts straight through the return horizontal. It did, and
it was visible on the render and on nothing else. At the client the out lane therefore takes the
OUTER slot and the return the inner one, and at the frame it is the mirror. Both pairs still
straddle their own face midpoint, so no endpoint stands alone on a face.

The lanes are addressed to the CONTROL PLANE, not to the API, exactly as the Node lane lower down
is addressed to the Node. What receives the POST inside is still the API, which is why the API
still lights on arrival: it is the door rather than a stop along the way.

WHY THE CLIENT IS 130 AND NOT THE API's 220, because this was asked and measured. The band outside
the wall is 150 units, and 130 is that band minus two 10 unit margins. Widening it needs either the
frames moved, which is forbidden because they carry the centring, or a wider viewBox. The viewBox
was measured rather than guessed, at the dialog, with the scale the browser resolves:

  window       svg in dialog   limited by   viewBox width available at THAT scale
  1920x1080    1732x817        height       1358
  1600x1000    1438x743        height       1239
  1440x900     1291x651        height       1269
  1280x860     1144x614        WIDTH        1200
  1100x800      978x559        WIDTH        1200
  1000x1000     886x743        WIDTH        1200

So there is slack only while the dialog is wider than about 1.88:1, it is 39 units at 1600x1000,
and half of that would go on keeping the drawing where it is. Giving the client 220 needs +90,
which shrinks the whole card by 7% at 1280x860, fonts included, and R-viewbox in check-canon holds
all 108 cards on 0 0 1200 640. Declined on those numbers, not on taste.

WHAT THE CENTRE FINDINGS SAY NOW. A bare check-geometry leaves this card with exactly two, and
OCCLUDED is no longer one of them. CENTRE reports content 150..1190 centred on 670, and CENTRE-LOW
reports the same span again because every block sits below the overlay. Both are the client hanging
off the right of a composition that is centred on the frames, and both are left open on purpose:
the frames are architecture's 150..1050 and centre on 600 exactly, which is what keeps the Node
lane one straight segment. Do not close them by re-centring, it drags the frames off 600.

Narration panel, re-measured per step on 2026-08-05 AFTER the technical pass grew two narrations,
over 1600x1000 / 1280x860 / 1100x800 with overlay-measure. Right edge 291 / 378 / 397. Bottom,
worst step, 143 / 171 / 205. Per step at 1100x800:

  step 0 180   1 post 180   2 persist 155   3 etcd-response 155
  step 4 controller 205   5 schedule 155   6 kubelet-watch 180   7 create-pod 180

What the panel threatens is no longer the top row, which left its column with ETCD: the first block
under it is the controller-manager at 170..390 x 328..408, so there are 123 units of slack at the
worst viewport, down from 148 before the pass. That is still a generous budget rather than a tight
one, but it is a budget and it just spent a quarter of itself on one sentence. Re-check after any
prose edit with VW=1100 VH=800 node overlay-measure.mjs cluster-apply-flow.
```

---

### technical read against the docs (2026-08-05)

```
Every step was read against kubernetes.io and against the sibling cards. The HTTP mechanics all
check out and are worth stating so nobody re-derives them: POST to the collection path
/apis/apps/v1/namespaces/default/deployments on a create, 201 Created back, PATCH on an object that
already exists (which is what plain client-side apply sends, and cluster-server-side-apply does not
contradict it), the field selector /api/v1/pods?fieldSelector=spec.nodeName=, the binding
subresource, watch event type ADDED, and the name chain my-app -> my-app-7d4 -> my-app-7d4-abc,
which is deployment -> template hash -> random suffix. rv=842 is the same number in both steps that
use it.

TWO THINGS THE MOTION WAS NOT SAYING, and both were the card's own subject.

  step controller   The narration names TWO handoffs by TWO controllers, and the card's own desc
                    makes it the whole point: "Every handoff after the write is one component
                    reacting to a change on its own watch rather than a call from the component
                    before it". The motion was ONE out-and-back, so the mechanism the card is about
                    was the one thing not on screen. It is four balls now, watch the Deployment,
                    create the ReplicaSet, watch the ReplicaSet, create the Pod, with the wire label
                    turning over from `watch ADDED Deployment my-app` to `watch ADDED ReplicaSet
                    my-app-7d4` on the second watch leaving, through `at`. Span went 2340 to 4220
                    and `duration` 2700 to 4400. The narration gained "Nobody calls anybody", which
                    is the sentence the four balls now draw.

  step create-pod   The narration named a container runtime that the card did not draw, and one
                    ball went Kubelet to Pod, which reads as the Kubelet creating the container
                    itself. The Runtime is a block now, in architecture's centre Node column
                    (490..710 on the Kubelet's own line), so the Node row reads Kubelet, Runtime,
                    Pod on one line exactly like that card. Two hops: CRI from the Kubelet, then
                    the container coming up from the Runtime into the Pod. Span 2400, `duration`
                    2500 to 3300.

THAT SUPERSEDES A RECORDED DECISION. The note under the Node lane said "What happens next is the
Node's own business and is drawn inside it on the following step, Kubelet to Pod along START". The
compression was the thing that made the sentence untrue, so the lane keeps its call (it still lands
on the Node frame midpoint, that part is unchanged) and the row inside the frame grew a third block.

The aria-label gained the Runtime with it, because it is a separate carrier of the same fact and
the project rule is to check it before trusting a narration.
```

### how the layout got here, and what was rejected (2026-07-27 to 2026-07-31)

```
Kept because each step records either a measurement or an alternative that was tried and dropped.
Numbers inside this note are historical.

R5-a, 2026-07-27. The four top-row lanes were still drawn from pre-relayout literals (400..490 and
710..900 at y=110/130), so the kubectl lane sat inside the kubectl block and the ETCD lane inside
the API block, while the balls flew over blank canvas. All four are now drawn with pathArrow from
the same arrays the balls ride, and the Kubelet-to-Pod arrow from START.

Then the row was kubectl 420..550, API 610..830, ETCD 950..1080: gaps of 60 and 120, not symmetric,
and the 60 held nothing, so HTTP 201 Created (110 units, measured in the browser) was drawn across
both block borders and the two long request labels lived above the row.

REJECTED: widening the row in place. It cannot centre the API, and the arithmetic is the whole
reason the card is laid out the way it is: the panel reaches x<=397 down to y<=180, the row stood
at 80..160 INSIDE that band, a centred 220-wide API starts at 490, and a 130-wide kubectl touching
it with ZERO gap already starts at 360. That is 37 units under the panel before any gap exists. No
arrangement of widths fixes it while the row is up there.

So the row moved DOWN to 195, clear of the panel, and the API was pinned to CX with its flanks
derived from GAP. Tier 2 was mirrored about CX too (T2_D=320), because a centred API over an
off-centre tier reads worse than the old asymmetry did. All four top wire labels moved BETWEEN
their blocks. Three of the four fit. The fourth did not at any gap this canvas allows (POST
/apis/apps/v1/namespaces/default/deployments measures 338) and was elided to POST .../deployments,
the card's own idiom, which step 5 already uses for the Binding. Nothing is lost: step 1 spells the
full path out.

The cost was an empty top band and a drawing sitting low in the frame, and on 2026-07-31 the author
took it back: TOP_Y went 190 -> 108. REJECTED-THEN-OVERRULED: a note here used to argue 190 was a
hard ceiling because kubectl would go under the panel. It does, and the raise happened anyway. The
occlusion is recorded as an open state in the note above rather than as a reason not to.

The rows below the top one then moved three times, and the end state matches none of the first two:

  1. Node lower, tier 2 exactly midway, arrows midway too. Equal gaps make V the only free term:
     TOP_BOTTOM(188) + V + T2_H(80) + V + NODE_H(150) + bottom margin = 640, and V=74 makes all
     three intervals equal, the margin under the frame included.
  2. Both rows lower again: V=86, tier 2 down 12 and the frame down 24, out of the margin.
  3. Tier 2 alone lower, everything else held. Not expressible while NODE_Y derived from V, because
     V fed both gaps, so NODE_Y was pinned at the value step 2 left it at and V went to 98.

Older gap history, since it was asked about repeatedly: 60 above tier 2 and FIVE below it, then
52/52, then 62/62, then 74/74, then 86/86, now 98/74.

The tier-2 lanes were fixed in the same pass. Both levels were offsets from TOP_BOTTOM (+25 and
+40), which glued them to the row they left and left 22 units of dead air under them, so they read
as belonging to the API rather than as spanning the gap. They hang off BAND_CY now.

Every one of these was also a TIMING change, because routeDur is length-based: widening the band
lengthened the tier-2 routes and put the schedule step 11ms over its own duration, which is why
that step carries 2400 rather than 2200. Re-run check-duration after any geometry edit here.
```
---

### one padding for both walls of the Node frame (2026-07-31)

```
The two blocks inside the frame were placed by hand: KUBELET_X = 135 and POD_X = 720 as literals.
Against a frame spanning 110..1090 that left 25 units of inset on the left and 154 on the right, so
the pair read as having slid leftwards inside the Node, which is what the author saw.

Both are now derived from ONE padding applied to the frame's own edges:

  NODE_PAD = M = 60
  KUBELET_X = NODE_X + NODE_PAD                        170..390
  POD_X     = NODE_X + NODE_W - NODE_PAD - POD_W       814..1030

so the insets are equal by construction rather than by arithmetic anyone has to redo, and reusing
the canvas margin M means the frame breathes the way the canvas does. The Pod keeps its 216 width
against the Kubelet's 220: the two are not meant to match, they are a runtime and a workload.

The alignment that falls out is worth not breaking: the Kubelet now occupies 170..390, exactly the
controller-manager column above it, and the Pod ends on 1030, exactly where the Scheduler does.
That was a consequence of NODE_PAD=M rather than the goal.

This lengthened START, the Kubelet-to-Pod hop, from 365 to 424 units. routeDur is length-based and
both ends are above its 700ms floor, so the ball went 811ms to 942ms and the Pod pulse with it.
Step 7 has 2500 against a span of about 1840, so nothing needed raising, but this is the third time
in one session a composition change was silently a timing change. Always re-run check-duration.
```

---

### kubectl grows right, and the row stops being symmetric (2026-07-31)

```
kubectl was 130 wide and DERIVED backwards from the API through GAP: KCTL_R = API_X - GAP, then
KCTL_X = KCTL_R - KCTL_W. That is what made the row symmetric about CX, both flanks 130 wide with
190 either side of a centred API.

The instruction was to widen the block to the RIGHT without moving it, so the derivation had to be
inverted: KCTL_X is pinned at 170 (the value the symmetric layout left it at), KCTL_W is 160, and
KCTL_R = 330 follows. The gap on that side is now 160 against ETCD's 190, and the widths are 160
against 130. The row is no longer symmetric and that is the instruction, not drift. ETCD is still
derived from GAP, so nothing on the right moved.

160 is near the ceiling rather than a free number. The gap has to hold POST .../deployments,
measured at 133 units in the browser, and at KCTL_GAP=160 that leaves 13.5 a side. About 27 more
units of width exist before the label stops fitting between the blocks, and past that the label
would have to go back above the row, which is the thing the 2026-07-31 relayout existed to undo.

Two things follow for free because they were already derived from the edges: KCTL_GAP_CX, which
centres the POST and HTTP 201 Created labels, moved 365 -> 410 with the block, and the POST /
POST_ACK routes shortened from 190 to 160 units. The routes are on routeDur's 700ms floor at both
lengths, so nothing about the timing changed.

Widening does NOT help the occlusion: kubectl now spans 170..330 and the panel reaches x<=397, so
the block is still entirely inside the panel's column.
```

---

### text pass: what each step claims against what it draws (2026-07-31)

```
A step-by-step read of the narration against the motion, after the layout settled. Six of seven
steps already agreed. What changed:

DESC. It ended on an absolute the card's own first half contradicts: "Every handoff is one
component reacting to a change on its own watch rather than a call from the component before it."
Steps 1 to 3 are calls, not watches: kubectl POSTs to the API, the API writes to ETCD, ETCD answers.
Only steps 4 to 6 are watch-driven. Now reads "Every handoff AFTER THE WRITE", 460 characters, still
inside R-desc's 400-470 band. The same sentence's "the scheduler" was lowercased while the block
label and every narration say Scheduler, so it was capitalised. check-terms classes Scheduler as
SOFT (26 lowercase against 11 capital catalog-wide), so no rule was going to say either way, but
one card should not spell one actor two ways.

WIRE REGISTER, tier 2. POST .../binding was drawn at WIRE_T2_Y, above the OUT lane, which is the
watch carrying the unscheduled Pod TO the Scheduler. The Binding is the Scheduler's answer and
rides the RETURN lane. The band now has two registers like the top row does, WIRE_T2_OUT_Y 221 and
WIRE_T2_BACK_Y 259, and each label sits over its own lane. Measured after the move: the label
occupies x 655..855 y 248..262, directly under the return run at 245 (which spans 630..880) and
clear of the Scheduler box top at 286 by 24.

WIRE TEXT, persist. write committed rv=842 sat on the REQUEST register above the outbound
API-to-ETCD lane, so it claimed the commit while the ball was still in flight, and step 3 already
brings the same fact back as ack rv=842 on the ack register. It is write Deployment my-app now,
which is what the ball actually carries. Side effect on GAP, recorded above.

STEP 2. Authorization was missing between authentication and admission. "authenticates the caller
using credentials from your kubeconfig" became "authenticates the caller from your kubeconfig,
checks RBAC", which adds the stage and is SHORTER, so the panel got shallower rather than deeper.

STEP 5. "scores the survivors" said nothing about what scoring weighs. Now "scores the survivors on
free resources and topology spread", the two default score plugins a reader is most likely to meet.

STEP 6. The words said the API streams the Pod "to it", meaning the Kubelet, while the lane now
lands on the Node frame. Reworded to stream it "down that watch to Node-1, where the Kubelet picks
it up", so the sentence and the picture end in the same place. This is the one step that gained a
wrapped line.

STEP 7. The payoff step said the least of any on the card (121 characters). It now names the CRI
sandbox and what the sandbox buys (the network namespace and the IP) before the image pull. What it
deliberately does NOT say is that the Kubelet reports status back to the API: that is true of real
Kubernetes, but the card draws no lane from the Node to the API, and a narration that promises a
return the motion never delivers is a defect family this project has paid for repeatedly. Adding
the lane would mean splitting the straight API-to-Node spine into a mirrored pair, which would undo
the note below, so it was left alone deliberately rather than overlooked.

ARIA-LABEL. "kubectl apply flow through the control plane" omitted the half of the card that is a
Node, a Kubelet and a Pod, so it gained the ending "to the Kubelet on a Node". That ending is
load-bearing and survived the 2026-08-04 retitle, which replaced only the opening: the label now
reads "How a manifest becomes a running Pod, from the client through the control plane to the
Kubelet on a Node". The opening had to go for the same reason the title did, see the rename note
below.

NOT changed, and worth knowing why: step 4 fires ONE return ball for two API writes (the ReplicaSet
create and then the Pod create by a second controller), and that return carries no wire label. The
compression is honest, the narration names both, and a second ball would need a second lane the
band cannot hold.
```

---

### the Kubelet lane is addressed to the Node, not to the Kubelet (2026-07-31)

```
TO_KUBELET is TWO points now, and there is no turn anywhere in it:

  [[API_CX, TOP_BOTTOM], [API_CX, NODE_Y]]     600,188 -> 600,440

It leaves the API bottom face on that face's midpoint and lands on the Node frame TOP face on ITS
midpoint, and the two are the same x for free: the API is centred on CX and the frame spans
110..1090, so both midpoints are 600. The ball drops into the Node and stops. What happens next is
the Node's own business and is drawn inside the frame on the following step, Kubelet to Pod along
START, which was not touched.

Two earlier shapes are superseded, and both made the same mistake in different amounts, so the
mistake is the thing to remember rather than the coordinates. The lane was reading as addressed to
the KUBELET when what it carries is a watch stream arriving at the NODE:

  1. A jog INSIDE the frame at NODE_Y + 28. The ball crossed the frame edge at x=600, a long way
     from the Kubelet, then crawled left across the floor of the Node before turning down into it.
     It read as arriving and then hunting for its destination.
  2. The same jog lifted into the open band above the frame, so the entry was a clean vertical,
     but it still landed on the Kubelet top face at x=245. Straighter, same address.

Fixing 1 into 2 and then 2 into this is worth noting as a review lesson: the first repair made the
picture better and left the actual defect standing, and only a second look at the words ("into the
Node") caught it. Nothing in the gate reported any of the three states.

The wire label is the one on this card that does NOT sit between two blocks, because its lane is
vertical and a horizontal string centred on a vertical lane is cut in half by it. It is
right-anchored at API_CX - 14 = 586, on the middle of the open band between tier 2 and the frame
(366..440), so it reads to the left of the spine with the whole band to itself.

KUBELET_CX went with it. The Kubelet lane was its only consumer.
```

---

### before `const client = box({ x: KCTL_X, y: KCTL_Y, w: KCTL_W, h: BOX_H, label: 'kubectl', role: 'cluster' });`

```
The client is the only block on the card that is not in a frame, and both of its numbers are
solved rather than chosen. KCTL_X is FRAME_R + 10 and KCTL_W is the band minus two such margins,
so 130, which is also ETCD's width: the two blocks flanking the frame then read at one scale.
KCTL_Y is CP_CY - BOX_H / 2, so the block is centred on the wall its lanes are addressed to.

Do not hardcode an x or a y here. Both derive from the frame, and the frame is what the drawing is
centred on, so a literal would survive the next time the frame moves and be wrong.

This note used to describe a 130x80 kubectl at the LEFT end of the top row, next to an API centred
on CX with both flanks derived from one GAP. That row is gone: the client is outside the frame
entirely, and the left slot of the top row is empty (ETCD held it for part of 2026-08-05 and then
went back to the right wall).
```

### before `root.appendChild(pathArrow({ points: POST,        dim: true, dashed: true, role: 'cluster' }));`

```
This is where all nine static lanes are drawn, and every one of them is built from the SAME points
array its ball rides, which is the rule that stops a wire and its packet drifting apart.

Two go to the client, and they are the only lanes on the card that leave the frame: up out of the
client's top face, level across the band above the frame at 50 and 70, down into the frame's top
face at 590 and 610. Two go to ETCD, a mirrored pair on the row centre line at OUT_Y and BACK_Y,
LANE_DY either side, so no hop reuses the other direction's lane. Four go into tier 2, the same
shape rotated: the watch goes out and lands on the OUTER side of its box (CM_CX - 10, SCHED_CX +
10), the write comes back from the INNER side, and the two levels are JOG_DOWN and JOG_UP, which
are centred in the band rather than hung off the row. Then the Node lane, a single straight
vertical down the spine, which has its own note above.

This note used to describe a top row of four lanes with the client on it. The client left the row
on 2026-08-05 and its pair became the over-the-top shape above.
```

### before `const WIRE_REQ_Y = OUT_Y - 12, WIRE_ACK_Y = BACK_Y + 18;     // 158 / 208`

```
Two registers for the ETCD pair, both BETWEEN the blocks: the request above its out lane at 158,
the ack below its return lane at 208, both centred on ETCD_GAP_CX 805, which is the middle of the
190 unit gap. write Deployment my-app measures 153 rendered and ack . rv=842 measures 80, so both
clear their blocks with air either side.

The CLIENT pair does not use this register and cannot: its lanes are 100 units above the row, in
the band over the frame. Its two labels share ONE register at y=34, centred at 862 on the level run
they ride, and they can share it because they never share a step. The POST is step 1 and the 201 is
step 3. Two earlier placements were tried and both were wrong on the render rather than in the
source: inside the frame at the lane heights, where they crossed the two Scheduler lanes turning at
264 and 284, and hugging the client's own faces, where the climbing verticals crossed them.

The old note here quoted a KCTL_GAP_CX of 890 over a 360 unit gap, and before that a POST riding at
y=68. Both belonged to rows that no longer exist.
```

### before `ctx.register(s.refs.kubeletPodArrow.animate(`

```
The arrow and the Pod fade in together in their resting outline; the pulse waits
for the start-container packet to land (the Pod lives inside Node-1, so it keeps
the pod pulse).
```

### before `pulsePod(s.refs.placedPod, ctx, start.arrivalMs);`

```
The whole Pod pulses once when the start-container packet lands: the shell AND the inner
box brighten together and both ease straight back to their normal outline, in sync, the
same way a workloads Pod pulses. Nothing is left pinned bright afterwards.
```

### poster (rebuilt 2026-08-04, concept signed off)

```
Sentence: a manifest walks DOWN a chain and comes out the far end as a Pod.

A descending staircase of four 72 x 38 blocks, each one 76 units right and 40 units lower than the
last: manifest, API, controller, Pod. Three dashed legs leave a block's right face, run 40 units
right and turn down into the next block's top face, so the risers read as the handoffs. Only the
last block is lit (fill 0.10 against 0.04) and only it carries the house accent bar at 0.9, the
first three at 0.3: the sentence is about what the chain PRODUCES, not about the chain.

The vertical drop is deliberately larger than a token offset. 40 units of drop against a 38 unit
block means consecutive steps barely overlap in y, which is what makes the diagonal silhouette
survive the ~200px the grid actually renders. The staircase is the whole differentiator, so it gets
the full 8..166 of vertical room and the blocks lose width to pay for it.

WHAT IT REPLACED and why. The old poster was three rectangles joined by dashed lines on one
horizontal axis, with a lined "document" on the left and a rounded Pod on the right. On the grid it
was indistinguishable from cluster-delete-flow (same row of boxes, same dashes) and close to
cluster-server-side-apply, and a 2026-08-04 review named the three as reading like one thing. It
also carried no accent at all, so nothing in it said what the sentence was about. The mirror-of-
delete-flow idea it was built on (fills rising left to right against fills falling left to right)
is invisible at grid size: nobody sees two posters side by side and reads a fill ramp. Direction is
now carried by shape rather than by a fill gradient.
```

### before `const D10 = 10, JOG_DOWN = BAND_CY - D10, JOG_UP = BAND_CY + D10;   // 264 / 284`

```
Each tier-2 box carries a mirrored pair on its top face: the watch out on the outer lane at
JOG_DOWN, the write back on the inner lane at JOG_UP, so the two never cross.

BOTH LEVELS ARE DERIVED FROM THE BAND, not offset from the row above. BAND_CY is the exact middle
of the gap between the row and tier 2, so the pair re-centres itself whenever either moves, and it
moved four times on 2026-08-05. The band is 108 units now, half again the 80 architecture used to
carry, and at that depth its fixed +40 / +60 would glue both lanes to the API and leave the dead air
under them, which is the defect this card had before they were hung off BAND_CY in the first place.

The controller-manager half was added 2026-07-30. The `controller` step narrates two creates back to
the API (a ReplicaSet, then a Pod) and only the watch moved, while the very next step drew both
halves of the identical shape for the Scheduler. Two adjacent steps taught two different rules about
where a controller's output goes. Adding `FROM_CM` needed the Node lane off that slot, so it moved
to the spine at CX, where it still is.

This note was anchored to `const T2_LANE_DX = 20;` until 2026-08-05. That constant is gone: the
lanes take D10 off their box centres now, which is architecture's own offset.
```

### retitled (2026-08-04)

```
`Kubectl Apply Flow` became `From Manifest to Running Pod`, and cluster-delete-flow became
`Cascading Deletion and Finalizers` in the same pass. The two were the ONLY cards of the 21 in
Cluster named after a CLI verb rather than after the mechanism, and the only two carrying the filler
noun `Flow`, which says a sequence happens and is therefore true of all 21. Worse, the old title
described one step of seven: kubectl appears in the `post` step and nowhere else, while this card's
own desc names the payload as "every handoff after the write is one component reacting to a change
on its own watch rather than a call from the component before it". There was also a live collision,
because `Server-side Apply and Field Ownership` sits two cards away and `Kubectl Apply` beside
`Server-side Apply` invites the reader to guess which is which.

REJECTED, and worth recording so it is not re-proposed: naming this card with `Watch` or `Reconcile`,
which is what the mechanism actually is. The catalog already holds `List-Watch and Informers` and
`Kubelet Reconcile Loop`, so a third watch-flavoured title would make three cards guess-alike. The
symmetric pair `Object Create Path` / `Object Delete Path` was also rejected: it reads as a pair but
teaches nothing, and it hides the finalizers that are the whole point of the delete card.

SEARCH was checked before renaming, not after. app.js builds its haystack from
`title + desc + category + subcategory`, so dropping `kubectl` from a title costs discoverability
unless the desc carries it. This card's desc already opened "What actually happens between kubectl
apply and a running Pod?" and was left alone. cluster-delete-flow's did NOT contain the string at
all, so its desc opening was rewritten to "You run kubectl delete and the prompt returns at once, so
why is the object still there?", which restores the search term and states the card's real subject
in the same breath. Both ids were left untouched: they sit in URL hashes, and renaming one would
have needed a SCHEME_ALIASES entry for nothing.
```


---

## cluster-architecture

### layout as it stands (2026-08-05, rows copied from cluster-apply-flow)

```
Two dashed node() frames of the same width, one over the other, each holding its own tiers:

  Control plane   150..1050 x  90..440    (x 150, y 90, w 900, h 350)
  Node-1          150..1050 x 475..628    (x 150, y 475, w 900, h 153)

EVERY VERTICAL ON THIS CARD IS cluster-apply-flow's, to the unit (author instruction,
2026-08-05), and the direction of that copy is the reverse of the horizontal one: apply-flow
took its COLUMNS from this card and this card then took its ROWS from that one, so the two read
as one family in both axes. What it replaces is the geometry this note used to record: frames
40..352 and 420..600, rows at 80, 240 and 480. Both cards were measured off the rendered DOM on
2026-08-05 and every shared row and column agrees to the unit.

The columns were copied MIRRORED for part of that day, with apply-flow's ETCD on the left, and
the mirror was reversed before the day ended. Nothing on either card is mirrored now: apply-flow
is this card's grid with the tier-2 centre column empty and one Node block instead of three.

THIS CARD DOES NOT NEED THE DROP FOR ITSELF, and neither does apply-flow any more. Its top-left
slot is empty, ETCD is on the right, and nothing of its own sits under the narration panel.
apply-flow dropped because ETCD held ITS left slot, which is the panel's column, and then ETCD
went back to the right and that premise died: a bare check-geometry reports no occlusion finding
for either card. So the bill is currently paid for nothing except the two cards agreeing, and
the bill is: the Node frame is 153 where it was 180, the band between the frames 35 where it was
68, the canvas floor 12 where it was 40, and there are 100 units of empty band over the top row
that nothing draws in. Raising both cards is available and is a decision rather than a cleanup,
because routeDur is length-based and every vertical lane on both would shorten with them.

ONE NUMBER COULD NOT BE COPIED UNCHANGED. The wire register under tier 3 was T3_Y + BOX_H + 20,
the tier-2 rhythm repeated, and the shorter Node frame leaves only 26 units under that row, so
+20 puts the string 3 units off the frame floor. It is +14 now, which gives it the same 12 units
of clearance the tier-2 register has under the frame above, so the two registers read alike
instead of one of them being tight. T3_Y itself is NODE_Y + 47, apply-flow's offset, which is a
floor there rather than a choice: that card's Node row holds a 106 tall Pod needing 34 units
under the frame label. Copied rather than re-derived, so the two rows sit on one line across the
pair.

Both frames were 120..1080 until 2026-08-04, when they were pulled in by author request: the
band of empty canvas between a frame wall and the block nearest it read as a gap rather than
as padding. The first attempt took 10 units a side and the author could not see it, which is
the useful part of this note: 10 viewBox units is about 12 rendered pixels on a 1600 wide
dialog, so a frame move under about 25 units is not a visible change and is not worth making.
The frames stay symmetric about CX=600, which is what keeps the CENTRE content bbox on 600.
The label constant went with that pass: CP_LABEL_X is gone and both frames now carry the label
node() draws for them, at their own top-left corner. What that costs is the paragraph below.

20 units of padding is what the card can hold, and it is uniform on both walls only because
ETCD moved to 900..1030 in the same pass: every block on the card now lives inside 170..1030
exactly, so one number describes all four walls. Tighter than 20 and the blocks read as glued
to the frame. The frame label follows the frame (node() draws it at x + 12), so CP_LABEL_X
went 320 -> 290 to hold the CONTROL PLANE string on the same absolute 440.

  tier 1   API 490..710 x 140..220         ETCD cylinder 900..1030 x 130..240
  tier 2   controller-manager 170..390, cloud-controller-manager 490..710,
           Scheduler 810..1030, all y 328..408
  tier 3   Runtime 170..390, Kubelet 490..710, kube-proxy 810..1030, all y 522..602

Every block is the workloads standard 220 x 80 apart from the ETCD cylinder (130 x 110).
ETCD moved left twice on 2026-08-04. First from 960 to 920, so that it sits INSIDE the new
frame at all (at 960 it would run to 1090, past the frame edge). Then from 920 to 900, which
puts its RIGHT edge on 1030, the right edge of the Scheduler under it and of kube-proxy under
that. Right-edge alignment rather than centre alignment is deliberate: the card is built as
three columns whose outer walls are 170 and 1030, and a 130 wide cylinder centred on the
Scheduler axis (920) would sit at 855..985 and break that wall while lining up an axis nobody
can see. It also costs nothing, where centring costs the ETCD write label its home: that
string needs 179 units and the gap between the API and a cylinder starting at 855 is 145.

The three numbers the two Node-bound lanes turn on are solved, not chosen:
  L_CORR 440  midpoint of the free corridor between controller-manager (ends 390) and
              cloud-controller-manager (starts 490)
  R_CORR 760  midpoint between cloud-controller-manager (ends 710) and Scheduler (starts 810)
  BAND_Y 457  the middle of the free band between the two frames (440..475)
Those three are what keep both lanes clear of every tier-2 block, which is what THROUGH scores.
Frames are not obstacles to that rule (isFrame), so crossing the frame edges is fine.

The API bottom face carries six endpoints, mirrored in pairs about its midpoint 600:
540/660 (TO_CM, TO_SCHED), 560/640 (FROM_CM, FROM_SCHED), 590/610 (TO_CCM, FROM_CCM). The
left and right faces carry one endpoint each and both sit exactly on the face midpoint
y = 180, which is what OFFEDGE requires of an endpoint that is alone on its face. The ETCD
pair shares that right face at 170/190, inside OFFEDGE's FACE_FRAC allowance for an 80 tall
face (0.18 * 80 = 14.4).

The two levels the tier-2 lanes turn on are DERIVED from the band now rather than pinned at
200 and 220: BAND_CY is the middle of the gap between the row and tier 2, and the pair sits
D10 either side of it, so it re-centres itself whenever either row moves. The band is 108 units
after the copy, half again the 80 it used to be, and at that depth a fixed +40 / +60 glues both
levels to the API and leaves the dead air under them.

One lane crossing is accepted and is the price of that face midpoint: API_TO_KPROXY turns
down at x = 760 from y = 180, so it crosses the ETCD read lane at (760, 190). Nothing scores
a lane against a lane, and the alternative is taking the kube-proxy lane off the API face
midpoint, which OFFEDGE does score. Both are dashed and dim, so the crossing reads as a
junction rather than as a fault.

The two Node-bound lanes end ON their target box (Kubelet top midpoint 600, kube-proxy top
midpoint 920), not on the Node frame edge. That is deliberate and it is the OPPOSITE call
from the four cluster Node cards, where a lane stops on the frame top face because the Pod
row underneath changes from step to step and the pulse carries which Pod reacts. Here there
are no Pods and nothing pulses, so a lane that stopped on the frame would point at three
boxes at once, and the two lanes have to be consistent with each other.

What the Control plane frame costs: everything it draws at x <= 397 and y <= 180 (its
top-left corner and the CONTROL PLANE label, at 162,108 since the rows dropped) renders behind
the narration panel.
OCCLUDED cannot report it, because the rule excludes node frames by construction. Accepted
for the same reason cluster-apply-flow accepts its part-occluded ETCD cylinder: the frame has to
start left of controller-manager (x 170) to contain it, node() draws its label at a fixed
x + 12, and the alternative is not drawing the frame at all. Note that apply-flow's cylinder is
no longer part-occluded: that sentence dates from the day ETCD sat on its left.

THE LABEL ITSELF IS NOW INSIDE THAT COST, by author decision on 2026-08-04, and this is the
one thing on the card that is knowingly INVISIBLE rather than merely dimmed. It used to be
pushed right to an absolute 440 by a CP_LABEL_X override, clear of the panel and readable on
every viewport, which made it the only frame label in the catalog not sitting on its own
corner. The author asked for it back on the corner, level with NODE-1 at (162, 493), and took
the consequence. Measured with overlay-measure over 1600x1000 / 1280x860 / 1100x800, the panel
reaches x <= 397 and y <= 230 at its worst and x <= 291, y <= 125 at its best, so CONTROL PLANE
at (162, 108) is fully covered on every one of them: there is no viewport where it reads.
Nothing in the gate says so, for the reason above.

Per step at 1100x800, re-measured 2026-08-05 after the technical pass grew three narrations:

  step 0 230   1 api 230   2 etcd 155   3 etcd-response 205
  step 4 controllers 155   5 cloud-controllers 205   6 scheduler 205   7 node-side 205

That 230 is a character budget now, and it moved 50 units in one pass. The first block in the
panel's column is the controller-manager at 170..390 x 328..408, so the slack is 98 units, which
is about two more wrapped lines on the longest step. The top-row LEFT slot is empty on this card,
which is the only reason there is any slack at all.

Do not "fix" this by shortening the narrations. The panel is five lines on its longest step
and even a ONE line panel reaches x <= 291 at 1600 wide, which still covers x 162 onward. The
only placements that keep the string readable are the old 440, or moving NODE-1 to match it,
and both were the road not taken here.
```

### technical read against the docs (2026-08-05)

```
Every step was read against kubernetes.io Components and Cluster Architecture, from the cached raw
pages rather than a summary, and against the sibling cards. Four things were wrong and all four
were text or a missing qualifier rather than geometry.

TWO FALSE ABSOLUTES, both of the shape this project keeps producing: a sentence that is true on the
ordinary path and states itself without the condition.

  step api        was "The API is the only entry point to the cluster"
                  cluster-static-pods exists to show the path that skips it, and the kubelet doc
                  says PodSpecs arrive "through various mechanisms". Now "the only way in for
                  clients and controllers", with the static Pod named as the exception.

  step scheduler  was "That one write is the whole of its job"
                  cluster-pod-priority-preemption/delete has the Scheduler sending a DELETE for a
                  victim and writing status.nominatedNodeName. Now "on the ordinary path that one
                  write is all it does, and preemption is the exception where it also deletes".

ONE OPTIONAL COMPONENT DRAWN AS CORE. Components lists it literally as `cloud-controller-manager
(optional)` and Cluster Architecture says on-premises clusters "do not have a cloud controller
manager". This card gave it the centre column of tier 2, straight under the API, which is the most
prominent slot on the drawing, and said nothing. It carries the sublabel `optional` now and the
narration says a cluster on your own hardware has none. kube-proxy is `(optional)` upstream too and
network-ebpf-dataplane says it can be removed entirely, so the node-side narration says that as
well, in words rather than on the block: kube-proxy is present in almost every cluster and a second
`optional` sublabel in the same drawing would read as a pattern rather than as a fact.

ONE LABEL PROMISING A CALL THE CARD DOES NOT DRAW. The cloud lane was labelled `watch Nodes . call
provider API` on a lane pair whose two ends are both the API. No provider is drawn and no ball goes
to one. The label names what actually rides it now, `watch Nodes . write Node and Service status`,
and the provider call stayed in the narration where it belongs.

ONE SEQUENCE THAT READ AS A ROUND TRIP. Step etcd-response opened "ETCD returns the requested data",
directly after a step whose lane is labelled `write . Raft quorum commit`, so the pair read as the
answer to that write. It is a different exchange. It says so now. cluster-apply-flow gets the
equivalent right already ("ETCD acks the committed write").

What was checked and is correct: the three cloud-controller-manager loops match the doc list word
for word (Node, Route, Service), the Scheduler's watch-filter-score-bind, kube-proxy on Services and
EndpointSlices, controllers watching the API and never ETCD (the kube-controller-manager page says
"watches the shared state of the cluster through the apiserver"), and the API server being stateless
and horizontally scalable. Two simplifications are left standing on purpose: "the API is its only
client" for ETCD, where the doc hedges with "ideally only the API server should have access", and
"a quorum of replicas" spoken over a single drawn cylinder, which cluster-etcd-raft owns.
```

### the Kubelet to Runtime binding (2026-08-01, halved 2026-08-04)

```
Kubelet to Runtime and Kubelet to kube-proxy were hand-rolled `line()` elements carrying
`scheme-arrow scheme-arrow-cluster` and nothing else. That is the copy `relationPath` was written to
retire in 2026-07-27, and this card was missed along with `cluster-etcd-raft` because both spell it
with `line()` rather than `arrow()`, and no rule reads either. Both became `relationPath` calls on
2026-08-01.

The kube-proxy one is GONE as of 2026-08-04: that relationship does not exist in Kubernetes.
kube-proxy is a separate process that watches the API for Services and EndpointSlices itself,
and it now has its own lane off the API (API_TO_KPROXY). Kubelet to Runtime stays, because it
is CRI and it is real.

IT QUALIFIED AS A RELATIONSHIP UNTIL 2026-08-05 AND IT NO LONGER DOES. The test that decides it is
the step's own words, and the last step says the Kubelet CALLS the Runtime over CRI, which the
aria-label repeats. So it is a route now: KUBELET_TO_RUNTIME, built by the same `lane()` helper as
every other lane on the card, carrying a ball that leaves at `toKubelet.arrivalMs + BEAT.afterHop`.

Two things came with that and both are the point of the change. The direction was REVERSED: the
relationPath ran Runtime to Kubelet, which no arrowhead ever showed, and a ball on those points
would have travelled backwards against the sentence. And the Runtime no longer lights at
`toKubelet.arrivalMs`, which was the real defect: measured, the Kubelet and the Runtime both lit at
1227ms, so the picture said the API lit the Runtime while the words said the Kubelet drove it. It
lights on the CRI ball landing at 2027ms now, and `duration` went 2400 to 3100 to cover the span of
2587. Nothing in the gate saw any of this: `check-duration` only asks whether a step outlasts its
own motion, and a lane with no ball passes every rule there is.

After the 2026-08-01 pass the whole catalog had FOUR hand-rolled arrow class strings left, and one
of them is deliberate: `network-model`'s podWire wears the string but carries two markers and is
animated as live traffic, which is a route. The other three are in `storage-dynamic-provisioning`
(boundLink) and `storage-reclaim-policy` (delBound, retBound). Same miss, different section.
```

### before `const wireControllers = text({ class: 'scheme-label code dim', x: CM_CX, y: T2_BELOW, 'text-anchor': 'middle' }, [' ']);`

```
Where the seven wire labels sit, and why none of them is where it used to be.

Until 2026-08-04 this label sat at (CM_CX + 135, 186) and the scheduler one at
(SCHED_CX - 135, 186), just under the API. That put this one INSIDE the panel
column: measured 2026-07-30 over 1600x1000, 1280x860 and 1100x800, the panel
is widest and deepest on the SMALLEST viewport (a narrower panel wraps into
more lines), reaching x <= 397 with one line = 25 viewBox units, five lines
bottom 155 and six 180. So the controllers step was capped at FIVE lines,
about 200 characters, and a six-line version written on 2026-07-30 rendered
with watch . reconcile loop half behind the panel. Nothing catches that:
OCCLUDED scores blocks, not wire labels, and reports the card clean either way.

The 2026-08-04 rebuild retired that cap and replaced it with a different one.
The two Node-bound lanes run vertical corridors at x = 440 and x = 760 from
the API centre line all the way down to BAND_Y, which cuts straight through the
band these labels used to live in. Those two y values were 120 and 386 when this
was written and are 180 and 457 since the 2026-08-05 row copy, which moves the
corridors without changing the argument. Measured on the first render, FOUR of the seven
had a dashed lane drawn through the string: read . watch stream open (732..898
crossed by 760), watch . reconcile loop (crossed by 440), watch Pods . post
Binding (crossed by 760) and both Node lane labels. check-geometry cannot see
any of it: it scores lanes against BLOCKS, and a text is not a block.

So the labels moved to the two bands the corridors do not reach:
  T2_BELOW       one label centred under each tier-2 box, controllers at
                 CM_CX 280, cloud at CX 600, scheduler at SCHED_CX 920. The
                 band between tier 2 and the frame floor is free, and 440 and
                 760 both fall in the gaps between those three strings. It read
                 340 when this was written and reads 428 since the row copy.
  BAND_Y - 12    the two Node lane labels, centred on the column they end in
                 (KUBE_CX 600 and KP_CX 920) rather than on the horizontal run,
                 which is what keeps them off the 440 and 760 verticals.

  THE TWO NODE LABELS MOVED AGAIN on 2026-08-04, to T3_BELOW (580 then, 616
  since the row copy dropped the tier and tightened the register), under the
  Kubelet and under kube-proxy, which is the tier-2 rhythm (a label under its
  own box) repeated inside the Node frame. Author request, and it reads better
  for a reason worth writing down: a watch label belongs next to the component
  doing the watching, not out in the band between the frames where it described
  a lane rather than a block. Measured on the render, the two strings occupy
  491..709 and 818..1022 at y 569..583, so each sits under its own block to the
  unit (490..710 and 810..1030), 9 units below the block and 17 above the Node
  frame floor at 600. Nothing else lives in that band. What the move gives back
  is the band between the frames, which is now empty except for the two lanes
  crossing it, so those read as one straight drop rather than as text on a run.
  ETCD write stays above its own lane, which is ABOVE where the x = 760
  corridor starts, so it was never at risk. ETCD read went to (840, 152), the
  midpoint of the only free corridor left to it, 760..920. At 6.9 units per
  character that corridor held 22 characters, and read . watch stream open is
  24, so the string lost its last word. That is the whole reason it reads
  read . watch stream: it is a width, not a wording preference.

  BOTH OF THOSE ARE OVER as of 2026-08-04 and the two labels now share one
  centre line, ETCD_LABEL_X 805, the midpoint of the 190 unit gap between the
  API right face and the cylinder. Two things freed them. The Node-bound lanes
  are no longer drawn except on the last step, where these two registers are
  blank, so the x = 760 corridor and the read label are never on screen at the
  same time. And ETCD moved left to 900, which widens the gap they live in.
  write . Raft quorum commit is 26 characters, 179 units, spanning 716..895
  inside a gap running 710..900. The read register has 27 characters of room
  and spends 19, so the word the old corridor cut could come back: it was left
  out because restoring it is a prose decision, not a geometry one.

What survives of the old constraint: the panel bottom still has to clear the
controller-manager top at y = 240. The card is written to 240 characters a
step, which is six lines and a bottom of 180 on the worst viewport, 60 units
of margin. Spend that budget and this note is wrong again.
```

### before `const cpLanes = [API_TO_ETCD, ETCD_TO_API, TO_CM, FROM_CM, TO_CCM, FROM_CCM, TO_SCHED, FROM_SCHED].map(lane);`

```
controller-manager, cloud-controller-manager and Scheduler each get a parallel
arrow PAIR (like the ETCD write/read lanes): watch event in (API -> block,
upper lane) and the reconcile / provider call / Binding write-back out
(block -> API, lower lane). The two flanking columns dogleg through
JOG_DOWN 200 and JOG_UP 220; the centre column sits straight under the API,
so TO_CCM and FROM_CCM are plain verticals at 590 and 610 and need no jog.

The ten lanes are built as TWO NAMED GROUPS rather than ten appendChild lines,
because the card shows one half of the diagram at a time (2026-08-04, author
request): ten dashed lanes live at once is more than a reader can follow.
cpLanes holds the eight control-plane exchanges, nodeLanes the two Node-bound
lanes PLUS the Kubelet-to-Runtime CRI relation, which belongs to the Node half.
setLanes writes both groups on every step, so the two cannot drift, and it is
called ABOVE the ctx.reduced guard so prev/reset lands on the same picture.

THE TWO GROUPS TAKE DIFFERENT TREATMENTS, which is the part to not "fix" into
symmetry. A control-plane lane out of play is DIMMED to OPACITY.notready, whose
meaning is exactly this: outside this path. It stays on screen because the
control plane is what the card is about and its shape should not flicker.
A Node-bound lane out of play is NOT DRAWN, opacity 0: the card spends six
steps inside the control plane, and a permanent pair of lanes crossing into the
Node band reads as traffic that is not happening. They arrive at full strength
on node-side, the one step that uses them, and the control-plane lanes dim
behind them. Slot 0 is the same as the control-plane steps rather than a third
state, so the poster shows the control plane whole and the Node band quiet.

This is the sanctioned pattern rather than a local invention: a block that does
not exist yet dims, its lanes disappear. The reason the lanes are the ones that
vanish is that an absent lane leaves no hole, where an absent block does.
Nothing in the gate sees any of this, so the states were read off a render.
```

**Review stage 2.4 family B listed all four of these as lanes nobody rides. FALSE, snapped 2026-07-30.**
Every one of them carries a ball: the `controllers` and `scheduler` steps send two each, and since
2026-08-04 the `cloud-controllers` step sends two more. A grep for the constant name could not see it,
because the routes were written as literals at the call site and the
numbers were verified identical to these arrays, to the unit. What the finding did surface is a real
defect of a different family: seven inline literal routes duplicating named arrays, the same shape that
reopened on cluster-delete-flow. All seven now ride the arrays, and anim-dump gives byte-identical spans
before and after.

### poster (rebuilt 2026-08-04, then REVERTED by author preference)

```
WHAT SHIPS is the hub-and-spoke poster this section was written to replace: the apiserver ring in
the centre, four satellite blocks on dashed spokes, a 3.5 radius dot in the middle. The rebuild
below was declined, so everything after this paragraph is the road not taken and does NOT describe
the file. The one change the shipped poster has taken since is a heavier ring, stroke-width 2
against the 1.4 everything else carries, plus the fill at 0.10 rather than 0.06 (2026-08-04,
author request): the hub is the significant element and this poster weights it by line rather
than by an accent bar. It was tried at 3 first and came back one point, so 2 is a settled
value between two rejected ones rather than a first guess.

Sentence: there is a boundary, and everything crosses it through one door.

Two dashed bands, one over the other. The upper band (288 x 78) is the control plane and holds three
80 x 46 blocks; the middle one is the API and carries the accent bar at 0.9 plus the brighter fill
(0.10 against 0.04), the two flanking it carry the same bar at 0.3. The lower band (288 x 56) is a
Node and holds two 125 x 32 blocks, each with the bar at 0.3. One dashed leg drops out of the API
bottom face, crosses the control plane band's own bottom edge, and lands on the Node band's top
edge. That is the only thing joining the two halves, and that is the sentence.

The leg stops ON the Node boundary rather than reaching a block inside it, which is the
cluster-static-pods idiom (its one leg does the same into the Node band's top edge). The door is
the crossing, not a component: running it further would have to end in the gap between the two
lower blocks, which is the arrow-into-nothing defect this project has paid for repeatedly.

The lower blocks are 125 wide rather than the 80 the upper band uses so that both bands carry the
same 14 unit inner padding. Two 80 wide blocks centred in a 288 wide band left 54 units of dead air
at each end, which showed up on the 260% montage and nowhere in the file.

WHAT IT REPLACED and why. The old poster was hub-and-spoke: an apiserver circle in the centre with
four satellite boxes on dashed spokes and a 3.5 radius dot in the middle. It had NO accent bar at
all, so nothing in it said what the card is about, and the composition said "five components talk to
each other" rather than "the control plane and the Node are separated and the API is the only way
across". The card itself grew a `Control plane` frame on 2026-08-04, so the poster now also agrees
with the drawing it fronts.
```

---

## cluster-delete-flow

### layout as it stands (2026-07-31)

```
Read this one first. This card is the sibling of cluster-apply-flow and was given the same pass on
the same day, so the two now share a grammar: the API pinned to the canvas centre, both flanks
DERIVED from it through one gap, every row mirrored about CX, one padding on both walls of the Node
frame, and every lane level derived from its band's centre rather than written as a literal.

EVERY ROW IS BUILT ABOUT CX=600, and four things line up on each side by construction:

  left  170:  kubectl left edge = controller-manager left edge = Kubelet left edge
  right 1030: ETCD right edge  = Garbage collector right edge = Pod right edge

The one deliberate asymmetry is kubectl, which is 160 wide against ETCD's 130 and grows to the
RIGHT from a pinned left edge. That is the sibling card's shape and the same instruction produced
both. Its gap is therefore 160 against ETCD's 190.

Rows, measured off the rendered DOM:

  top row      110..190   kubectl 170..330, API 490..710 (centred on CX), ETCD 900..1030, whose
                          cylinder runs 100..200 so its centre sits on the row centre at 150
  tier 2       300..380   controller-manager 170..410, Garbage collector 790..1030
  Node-1       440..590   Kubelet 170..390 at 481..561, Pod 814..1030 at 468..574
  drawing      100..590   100 units of margin above, 50 below

What is PINNED and what is DERIVED:

  API_X   from CX and API_W; ETCD from API_R through GAP=190. kubectl is NOT derived: its left
          edge is pinned at 170 and it grows right, exactly as on the sibling card.
  T2_D    SOLVED, not chosen: whatever puts the tier-2 row's outer edges NODE_PAD inside the Node
          frame, the same inset the Kubelet and the Pod get. That is where the four-way alignment
          above comes from. 310.
  NODE_*  frame 440..590, NODE_PAD = M = 60 on BOTH walls. This was identical to
          cluster-apply-flow until 2026-08-05, when that card's whole stack moved down under
          the panel and its Node frame became 475..628. The two are no longer the same card
          vertically, so do not copy a number across without opening both.
  BAND1_CY  the band's own centre, so the lane pair cannot end up glued to the row it left.
  TOP_Y   = 110, and it is a floor rather than a preference: see the cost below.

The vertical gaps are 110 above tier 2 and 60 below, deliberately unequal and NOT a rhythm to even
out. Tier 2 cannot rise because the panel reaches 282, and the two bands carry different loads:
band 1 holds a lane pair AND both tier-2 wire labels, band 2 holds one label and no horizontal lane
at all, because the Node pair runs straight down.

THE COST, stated because it is real and was taken knowingly. Centring the row puts kubectl at
170..330 inside the panel's column, and unlike the sibling card, where kubectl is 90% covered, here
it is 100% covered at its worst, along with the two wire labels in the left gap and part of the
controller-manager label on the deepest step. check-geometry reports it. The alternative was tried
first and rejected by the author: the top row RIGHT of the panel at 420..1080, nothing occluded,
and the row's centre 150 units off the centre every other row uses. Symmetry won. The levers left
are shortening the two deepest narrations or accepting it.

Narration panel, measured per step over 1600x1000 / 1280x860 / 1100x800. Right edge 300 / 378 / 397
on every step. Bottoms at 1100x800, the column that binds:

  0:213  1:213  2:189  3:166  4:282  5:189  6:236  7:213

Step 4 is the floor under T2_Y: 282 against a row starting at 300. If that narration ever grows a
line, tier 2 has to move or the text has to come down.
```

---

### how the layout got here (2026-07-27 to 2026-07-31)

```
R5-a, 2026-07-27. Same defect as the sibling card: the four top-row lanes were drawn from stale
literals (260..390 and 610..750), so one pair floated under the narration panel pointing at nothing
and the other sat inside the API block, while DELETE / DELETE_ACK / PERSIST / PERSIST_ACK carried
the balls. All four are drawn from those arrays now and STOP_POD feeds the Kubelet-to-Pod arrow.

2026-07-31, the pass that brought this card in line with cluster-apply-flow. What was wrong, all of it
invisible to the gate:

  1. The top row was three hand-placed blocks at 420..550 / 610..830 / 950..1080, gaps of 60 and
     120, centre 750 against a drawing centred on 600. Now the API is on CX and the flanks derive.
  2. Tier 2 was at 240..480 and 825..1065, mirrored about 652.5, while the comment above it claimed
     a spine at x=500 and centres at 250 and 750. All three numbers were dead.
  3. Inside the Node frame the Kubelet sat 25 from the left wall and the Pod 154 from the right.
  4. The gap below tier 2 was THIRTY units against 160 above it, and the Kubelet lane pair squeezed
     its horizontal legs into that strip at y=392 and 402.
  5. Every lane level was a literal (200, 220, 392, 402), as were three wire-label positions.
  6. The acks sat at BACK_Y + 26 = 136, INSIDE the row band, so HTTP 202 Accepted was drawn across
     the kubectl and API borders on every replay of step 3.
  7. DELETE replicasets · pods was centred on a run crowded by five verticals and struck through by
     two of them. It was moved off the lane entirely as a result, and brought back over it once the
     recentring had made the run 260 units long. See its own note below.

An intermediate version kept the row right of the panel and equalised its gaps at 90. It fixed 3
through 7 and left 1 and 2 standing in a new form, and was rejected: see THE COST above.

Two things the recentring bought that were not asked for. The Node pair could collapse from four
points to two, because once the API sits on CX its bottom-face offsets and the frame's top-face
offsets are the same line, so each lane is a single straight vertical with no turn in it. It took
one more pass on the same day to actually get there, and the slot note below has that story. And a
THROUGH violation that the intermediate version had introduced (the return lane climbing through
the Garbage collector box) disappeared with it.
```

---

### before `const etcd = cylinder({ x: ETCD_X, y: TOP_Y - 10, w: ETCD_W, h: TOP_H + 20, label: 'ETCD', role: 'cluster' });`

```
ETCD narrowed to w=130 (was 140) so the label is not lost in a squat-wide cylinder and the
two control-plane cards match. Top/height unchanged (y=50, h=100) so its centre stays level
with the Api row (y=100) and the top wire labels keep their clearance above the cap.
```

### before `root.appendChild(pathArrow({ points: DELETE,      dim: true, dashed: true, role: 'cluster' }));`

```
Where all nine static lanes are drawn, each from the SAME points array its ball rides.

Four on the top row as two mirrored pairs, request out at OUT_Y and answer back at BACK_Y. Three
into tier 2: the MODIFIED event to the controller-manager, and an out-and-back pair on the Garbage
collector where the event lands on the OUTER lane (GC_CX + D20) and the DELETEs leave on the INNER
one (GC_CX - D20), so the pair never crosses itself. Then the Node pair, which has its own note.

Five lanes meet the API's bottom face at 540 / 590 / 610 / 630 / 660. Which lane gets which slot is
forced rather than chosen and has its own note below.

This note used to describe the Garbage collector return lane and a lane y of 220, anchored to the
kubectl DELETE line. Both the subject and the number were wrong. The sibling cluster-apply-flow card
carried the identical misplaced note, which is how it was found: check-notes verifies that an
anchor points at code that still exists, never that the sentence under it is about that code.
```

### which lane gets which slot on the API face (2026-07-31)

```
Five lanes meet the API's bottom face at 540 / 590 / 610 / 630 / 660. The rule that decides the
ORDER is one sentence: every lane except the Node pair turns and runs horizontally through band 1,
so each of them has to leave the face OUTSIDE the pair, or it cuts across one of the two verticals
dropping to the frame. The Node pair therefore takes the two innermost slots.

Two earlier versions got it wrong, in opposite ways, and both are worth keeping written down.

FIRST, the Garbage collector's return took the midpoint at 600 and the Node's return took 630. The
Garbage collector is on the RIGHT of the canvas, so its return ran leftwards along the back lane to
reach 600, and anything joining the 600 slot from the right must cross whatever descends at 630.
The two returns crossed on their way into the API.

SECOND, they were swapped: the return that comes from the RIGHT entered on the right at 630, and
the return that comes straight UP from the Node took the midpoint. That killed the crossing and
paid for it with a 30 unit jog on FROM_NODE, in band 2. It was the wrong trade. The jog was the
only turn on the only straight run of the card, it sat in an otherwise empty band where nothing
explained it, and the author read it as a defect on sight.

The resolution keeps both properties instead of trading one for the other. FROM_GC stays at 630 and
the Node pair moves INSIDE it, to API_CX +/- LANE_DY, reusing the same half-offset the top row uses
for its request/answer pairs. The API, the Node frame and the canvas share one centre, so both
lanes are single straight verticals from the API face to the frame face with no turn in either, and
they are 20 apart rather than the 30/60 the earlier version spread them over, which reads as one
exchange rather than as two errands. FROM_GC's horizontal run stops at 630, right of both, so
nothing crosses. Verified by a probe that intersects every horizontal lane segment against every
vertical one: the card has ZERO lane crossings.

OFFEDGE stays quiet through the change, but NOT because every endpoint is paired or centred, which
is what an earlier version of this note claimed. It is the face-fraction exemption doing the work:
check-geometry ignores any offset within 18% of the face, which on a 220 wide API is 39 units, so
590 / 610 / 630 are all out of its reach and only the 540 / 660 pair needs its mirror. Nothing on
this face is required to sit on the midpoint.

The pair still addresses the Node frame's TOP face, not the Kubelet's, which is the sibling card's
decision recorded there in full: a watch stream arrives at a Node and a status report leaves one,
and what the Kubelet does about it is drawn INSIDE the frame on its own step, along STOP_POD.
Before all of this the pair aimed at the Kubelet top face at KUBELET_CX +/- D20 and squeezed
through the thirty unit strip between tier 2 and the frame. KUBELET_CX went with the change;
nothing else used it.

The watch wire label in band 2 is right-anchored beside the vertical it labels, because a
horizontal string centred on a vertical lane is cut in half by it.
```

### before `const wireGc           = text({ class: 'scheme-label code dim', x: (API_CX + D30 + GC_CX - D20) / 2, y: WIRE_T2_BACK_Y, 'text-anchor': 'middle' }, [' ']);`

```
Both band-1 labels are centred on the midpoint of the horizontal run they name. They are NOT on one
register: wireController sits 8 above the OUT lane at 229, wireGc sits 14 below the BACK lane at
267, which is the same OUT/BACK split the top row and the sibling cluster-apply-flow card use.

THIS REVERSES THE NOTE THAT STOOD HERE, and the reversal is worth reading because both positions
were written into the same commit (8e0c93d). The old note argued that wireGc belongs above the OUT
lane although both strings it carries name BACK traffic (DELETE replicasets · pods on the cascade
step, clear finalizer on the finalizer step): the pair is only 16 apart so nothing fits between
them, and putting both labels on ONE register makes them read as a matched pair rather than as two
unrelated notes. Against that, the SAME commit split cluster-apply-flow into WIRE_T2_OUT_Y and
WIRE_T2_BACK_Y for the opposite reason, recorded there as "Both tier-2 labels used to share the out
register, which put POST .../binding, the Scheduler's answer, over the watch lane that delivered
the question to it". Twin cards cannot hold both rules. The reader-comprehension argument wins over
the matched-pair one: a label sitting on a lane names the traffic on THAT lane, and a reader who
takes "DELETE replicasets · pods" off the TO_GC lane reads the API as issuing the DELETEs to the
Garbage collector, which is backwards.

What did NOT change is the horizontal placement, which is a recorded author instruction: the label
stays centred on the FROM_GC run rather than parked over the Garbage collector box.

It used to be parked at GC_CX + 120, over the Garbage collector box itself, on the reasoning that
FROM_GC's run was 80 units long and a 167 unit string centred on it would be struck by two
verticals. That measurement was taken before the row was recentred and never retaken. After the
recentring the run is 630..890, 260 units, and the five verticals it feared are the API bundle at
540..660, every one of them LEFT of the string. The author asked for the label to come back over
the lane, which is where it was meant to be.
```

### text pass: what each step claims against what it draws (2026-07-31)

```
Read against the motion, step by step, the way the sibling card was. Six of seven steps already
agreed. What changed, and what was checked against kubernetes.io rather than against taste:

STEP 2 said "The Deployment is now Terminating". Terminating is a Pod PHASE word; a Deployment
carrying a deletionTimestamp is marked for deletion and has no such phase. Reworded to "marked for
deletion". Everything else in the step is right: the API does set deletionTimestamp and the
foregroundDeletion finalizer rather than removing the object.

STEP 5, the same fix the sibling card needed for the same reason. The words said the API streams
the event "to it", meaning the Kubelet, while the lane now lands on the Node frame. It now streams
the event "down that watch to Node-1", so the sentence and the picture end in the same place.

STEP 6 contradicted another card, which is the class of defect this project prizes finding. It said
the Kubelet "sends SIGTERM to the container, waits up to terminationGracePeriodSeconds (30s
default)", which reads as the full budget being available AFTER the signal. The Graceful Pod
Shutdown card, which this very step tells the reader to go and read, says the budget "starts
counting at the delete and is spent in two parts: the preStop hook, then the SIGTERM drain". Both
cannot be true. Reworded to start the budget and put SIGTERM inside it, without duplicating what
the other card covers. The cross-reference itself was verified: workloads-graceful-shutdown exists
and is titled Graceful Pod Shutdown.

ARIA-LABEL said "through the control plane" while half the card is a Node, a Kubelet and a Pod. Now
matches the sibling card's shape, ending "to the Kubelet on a Node".

CHECKED AND LEFT ALONE. Step 1's --cascade=foreground plus propagationPolicy=Foreground in the body
is right. Step 3's HTTP 202 Accepted is what a foreground delete returns. Step 4's claim that the
DELETEs "only stamp a deletionTimestamp rather than removing it from ETCD yet" holds because both
dependents acquire finalizers of their own in a foreground cascade. Step 7's order (finalizer
cleared up the chain, then real DELETEs, then DELETED events) is right. The description spends its
first half on the DEFAULT background behaviour that this card never draws, which is context rather
than contradiction, so it stays.
```

---

### poster (rebuilt 2026-08-04, concept signed off)

```
Sentence: the owner goes first and the dependents follow one by one.

A cascade of fading. One 96 x 42 owner block on top, drawn dashed at fill 0.03 and opacity 0.12
because it is ALREADY GONE: the poster opens after the delete, not before it. Three 80 x 52
dependents in a row below it, reached by three dashed legs in the catalog L form (out of the owner
bottom face, along a bus at y=84, down into each top face, the middle one straight down). The three
accent bars fall 0.9 then 0.4 then 0.12 left to right, and the third block itself is dashed at 0.12
to match the owner, so the row reads as a wave of deletion travelling along it and arriving.

That gradient of ghosts appears nowhere else in the catalog, and it is what separates this poster
from cluster-scheduler-decision, which is the same one-over-three composition: the scheduler poster
is about CHOOSING (solid top block, accent in the middle, everything else present), this one is
about DISAPPEARING (ghost top block, accent on the far left, the far right nearly gone).

0.12 was checked on the grid at 100%, not just on a 260% montage. It survives: the owner and the
third dependent read as faint dashed outlines rather than vanishing. Do not raise it to make the
file look more like its siblings, and do not lower it either.

WHAT IT REPLACED and why. The old poster was a Pod, a box and a struck-through Pod on one
horizontal axis joined by dashes, built as the deliberate mirror of the cluster-apply-flow poster. Two
faults. The mirror was invisible: no visitor sees the two cards side by side and reads one fill
ramp against the other, so the idea cost two posters their identity and bought nothing. And on the
grid it read as the same row-of-boxes as cluster-apply-flow and cluster-server-side-apply, which a 2026-08-04
review called out as three cards reading as one thing.
```

---

### review pass (2026-08-01)

```
The Garbage collector was drawn as a component, not as a controller.

Two boxes on tier 2, same size, same band, mirrored about CX, no frame around either and no
sublabel on either: controller-manager on the left, Garbage collector on the right. Nothing on the
card said where the collector runs, so the drawing asserts it is a peer of the controller-manager.
It is a controller INSIDE kube-controller-manager, and the sibling cluster-apply-flow card is careful about
exactly this on the same tier ("The Deployment controller, inside the controller-manager").

Closed with a sublabel, `in controller-manager`, and not in the narration. The gc-cascade step is
the deepest text on this card (panel bottom 282 against tier 2 at 300), so words there cost the
drawing 18 units of the 18 it has left. The sublabel costs nothing: the box was the only one on the
tier without one, and box() draws it under the label inside the existing 240x80.

What was NOT changed: the collector keeps its own box rather than moving inside a controller-manager
frame. The two act on different things on this card (rollouts stop on one side, ownerReferences are
walked on the other) and each owns a lane pair to the API. Nesting them would put one lane pair
inside another block and cost the tier its mirror about CX.
```

### retitled (2026-08-04)

```
`Kubectl Delete Flow` became `Cascading Deletion and Finalizers`. Full reasoning for the pair is
under cluster-apply-flow, `retitled (2026-08-04)`. The short version for this card: the title named
a CLI verb that appears in one step of seven, while the card is about deletionTimestamp, the
foreground and background cascade policies, the Garbage collector walking ownerReferences, and the
finalizers that gate the whole thing. `Cascading deletion` is the term kubernetes.io itself uses, so
the new title is the documented name of the mechanism rather than a coinage.

The desc opening changed with it, from "Deleting an object is not as instant as it looks, so what
runs behind the scenes?" to "You run kubectl delete and the prompt returns at once, so why is the
object still there?". That was NOT a style edit: app.js searches `title + desc`, the old title was
the only place the string `kubectl delete` appeared in either field, and removing it from the title
would have made the card unfindable by the command that opens it. The new opening carries the term
and states the paradox the card exists to resolve.

ARIA-LABEL followed the title: "kubectl delete flow from the client through the control plane to the
Kubelet on a Node" became "How a cascading delete unwinds through finalizers, from the client
through the control plane to the Kubelet on a Node". The ending is unchanged for the same reason it
is unchanged on the sibling, see that card's ARIA-LABEL note.
```


---

## cluster-resource-quota

### layout (2026-08-04, new card)

```
The subject is a budget that ACCUMULATES rather than one that is carved, which is what separates
this card's picture from cluster-node-allocatable next door. There the Node capacity is one bar cut
by internal rules into pieces that are taken AWAY; here the bar IS spec.hard and the slots fill it
left to right, so the last request is drawn PAST the bar edge rather than as a strip overhanging it.
Both cards are exact to scale for the same reason: 480 units per CPU, so a 500m request is 240
units on the two admitted slots and on the refused block alike, and a reader can measure the
picture and get the same answer as the chips.

Why hard is requests.cpu 1 and every Pod asks for 500m. The numbers come off the LimitRange page's
own worked example (defaultRequest.cpu 500m, min 100m, max 1), so the injected default IS the
arithmetic and step 2 is load-bearing instead of a digression. Two 500m Pods land exactly on the
ceiling, which is why the admit step animates TWO beats: 500m plus 500m is 1 and the third would
be 1.5, and there is no set of equal requests that rejects on the second Pod without leaving the
first one short of the ceiling.

Horizontal budget. The bar is 420..900 and the refused block 900..1140, so the drawing right of
the panel is exactly 3 request widths wide. The composition centres on 600 by the listing in the
freed bottom-left corner (60..400), not by a frame: content bbox 60..1140, chip strip 60..1140 with
the ladder pooled inside it, and the low-block span the same. There is no node() frame on this card
because there is no Node in the story: a quota is a namespace fact and namespaces have no frame
primitive, so the bar caption carries the namespace instead of a box drawn around everything.

Vertical budget, from the bottom up: chips 548..624 (two per row at 532), listing 386..530, bar
386..450 with its captions on 376, ladder 152..352 in the right column with the LimitRange beside
its first two rows, actor row 40..120. The listing and the bar share a top edge on 386 so the two
halves of the lower band read as one line.

Relaid on 2026-08-04, second pass. The card was drawn about 17 percent smaller than every sibling
in its own section (BOX_W 200 against the family 232, ROW_H 28 and ROW_GAP 8 against 32 and 10),
because THREE blocks at 232 do not fit in the 720 units right of the panel: 3 x 232 + 2 x 56 is 808.
The fix was not to shrink the family, it was to notice that only two of the three are actors.
LimitRange is an object, nothing travels to or from it on any step (its tie has always been a
relationPath with no arrowhead and no ball), so it left the row and the two that remain are at 232
with the ladder at the family pitch. Every number in that band follows from three fixed points:
nothing may start left of 420 (the panel reaches x<=397), the ladder is centred on the API because
the tie between them is one straight drop onto a face midpoint, and the ladder bottom has to clear
the bar captions whose ink starts at 364.8.

So the ladder ends on the content right edge (740..1140), the API is centred on it (824..1056), the
ReplicaSet keeps the 420 rail it shares with the bar, and the gap between the two actors comes out
at 172 rather than the family 56. That gap is a consequence, not a choice, and it costs nothing:
172 units at PKT_SPEED 0.45 is 382ms, under the 700ms PKT_DUR_MIN floor the old 60 unit gap also
sat on, so not one span on this card moved. The ladder stays 400 wide rather than the family 480,
twice measured: its longest row inks 337.7 units, so 400 leaves 52 of trailing space where 480
would leave 132, and 480 would also push the LimitRange column down to 180 wide.

The middle band now carries mass where it used to carry a hole: LimitRange 420..652 and the ladder
740..1140 hold the same 420..1140 span the bar and the refused block hold below, and the top row
sits inside it at 420..1056. Vertically the row-to-ladder corridor is 120..152, which is
where the answer wire label lives: its ink is 128.8..143.4 at WIRE_ACK_Y 140, so 8.8 units under
the row and 8.6 above the ladder, which is as centred as an 11px line gets in a 32 unit corridor.
The request label above the row inks to 14.8..29.4, 10.6 clear of the row top. Below the ladder,
its last row bottom is 352 and the bar caption ink starts at 364.8, so 12.8 units. Those three
numbers are why LADDER_Y is 152 and not 170: at the family pitch the ladder is 200 tall, not 172.

The ladder is the admission ORDER, not the step order, which is why step 1 and steps 3 to 5 all
light row 4. That is deliberate: the card's whole point is that one plugin at one position in that
list decides all three outcomes. Row 5 (persist) is never lit by any step, and on reject that is
the payload rendered as an absence: the request stops one row short of the write.

Rejected alternatives. A namespace drawn with node() was tried and dropped: the frame class is
.scheme-node and .scheme-node-label is uppercase catalog-wide, so it would have rendered
NAMESPACE TEAM-A on a frame the geometry rules treat as a Node. A relationPath from the ladder down
to the bar was also dropped: the bar's top face midpoint is 660, which is exactly the seam between
slot0 and slot1, so the lane would land on a join rather than on a face.
```

---

### before `const LR_TO_CHAIN = [[LR_X + LR_W, LR_CY], [LADDER_X, LR_CY]];`

```
A relationship, not a route. The LimitRanger plugin reads the LimitRange object out of the API
server's own cache, so nothing travels over this line and it takes no arrowhead, the same call
cluster-node-allocatable makes for KUBELET_TO_NODE and cluster-scheduler-decision for API_TO_CHAIN.

Where it points is the whole reason the box moved out of the actor row on 2026-08-04. It used to
run from the API right face to a LimitRange standing third in the row, which said no more than
"the API knows about this object". It now runs from the LimitRange right face to the ladder, level
with the seam between row 1 (mutating, LimitRanger sets defaultRequest) and row 2 (validating,
LimitRanger checks min and max), which is where that object is actually consumed. The box is
exactly ROW_H * 2 + ROW_GAP tall, so it spans those two rows and no others, and the line leaves it
on its own face midpoint, which is that seam by construction. The ladder end lands on no face at
all: chainList rows are chips, and check-geometry counts neither chips nor ladder rows as blocks,
so OFFEDGE has nothing to say about it either way. What makes it read is the pairing of the box
height with the two rows, not the endpoint.

The ResourceQuota object is NOT drawn as a second box beside it. It is the bar, captioned with its
own name, because a quota is a budget and a budget is a length. Drawing it twice, once as a block
and once as a bar, would have put two representations of one object on the same card.
```

---

### before `const budgetBlock = ({ x, w, label, dashed = false }) => {`

```
The three request blocks carry STROKES only: their rect fill is overridden to transparent so the
soft box fill does not double up where a slot sits on the bar underneath it. rx is 0 on the slots
and 6 on the bar, because two rounded rects side by side read as two separate blocks rather than as
one bar filling.

The refused block is the only dashed one, and it is dashed on both steps that use it, because on
both of them it is a request that never became an object. It is the one element on the card drawn
in a slot it shares with a second identity: web-3 on reject (refused for being too big) and web-1
on no-request (refused for being uncountable). The position means "did not get into the budget" in
both readings, and the sublabel carries which reason, the same one-slot-two-identities shape
cluster-pod-priority-preemption uses for Pod A and Pod NEW.

It lands on OPACITY.pending rather than on 1, which is why ghostAt exists next to the shared
revealAt: revealAt always ends at 1 by construction, and a thing that was never created must not.
```

---

### before `function setChips(s, { used, admission, rs }) {`

```
Four chips, three of which turn over on a beat rather than at entry. status.used and last admission
hold what the API DID, so they wait for the request to reach admission, and ReplicaSet web holds
what the controller KNOWS, so it waits for the 403 to land back on it. Each is pinned to its end
value above the ctx.reduced guard and rolled back on the played path, the cluster-node-drain shape.

The admit step turns three of them over TWICE, once per Pod, because a chip reading "admitted ·
web-1 and web-2" from step entry would skip the half of the sentence that is the whole point: the
sum grows per admission, not per step.

spec.hard never changes, and that is what the field is. A standing value is not a defect here, it
is the answer to "what is the number everything else is measured against".
```

---

### poster

```
One sentence: what fits is in, and what does not fit is left outside the line. One budget track
spanning 20..300 carries two filled slots up to a thin hard tick at x=180, and the request that
would have crossed it sits past the tick as a dashed block. The tick runs 36..144, taller than the
76 unit track, so it reads as a ceiling rather than as another internal rule.

The accent follows the house idiom: a currentColor rect inside the block it belongs to, 0.3 on the
two admitted slots and 0.9 on the block that did not fit, so the eye lands on the refusal rather
than on the budget. The used region also carries a second 0.08 fill over the track fill, the same
trick cluster-node-allocatable uses on its Allocatable segment.

No arrowheads, no text, no actors, no ladder. Direction is not part of the sentence: the tick is,
and everything past it is the answer.
```

---

## cluster-server-side-apply

### before `const BOX_W = 200, BOX_H = 80, TOP_GAP = 60;`

```
THE LEDGER IS THE CARD, so the object is drawn as a three column table (field, value, field manager)
and everything else is sized around it. The alternative that was rejected first is the one this
family reaches for by reflex: two boxes and an arrow, with the ownership stated only in prose. The
whole reason this card exists is that managedFields is a table nobody has ever seen, so it is drawn.

Panel measured at 1600x1000 / 1280x860 / 1100x800: x<=291 y<=177, x<=378 y<=214, x<=397 y<=255. The
worst is the ledger step, the longest narration on the card at 350 characters. Calibration was taken
rather than guessed: padding a narration from 410 to 610 characters measured 404 at 1100x800, so 200
characters cost 124 units, about 40 characters per line.

The CEILING is 500 characters per narration. The top row and the whole table start at x=420 and are
therefore panel-proof at any length, so what has to be cleared is the client-side column in the
bottom left, whose caption baseline is 366 and whose glyph top is about 355. 500 characters lands the
panel at roughly 336, which leaves a full line of margin. Re-measure with
VW=1100 VH=800 node overlay-measure.mjs cluster-server-side-apply after any prose edit.

The row is BOX_W 200 with TOP_GAP 60 rather than the family 232, because three actors have to fit in
the 720 units right of the panel: 3 x 200 + 2 x 60 is exactly 720. A 60 unit gap is the same one
cluster-node-allocatable carries and it is too narrow to hold a wire label BETWEEN two blocks, which
is why requests take a register above the row (y=26) and answers one below it (y=146).
```

### before `const API_TO_OBJ = [[API_CX, TOP_BOTTOM], [OBJ_CX, OBJ_Y]];`

```
The object table spans 420..1140, so its centre is 780, and 780 is also the API centre because the
top row is 420 + 200 + 60 + 100. That equality is the whole reason the API sits in the MIDDLE of the
row rather than on one end: the tie from the API down to the object is then one straight vertical
drop with both endpoints on a face midpoint, and it never crosses the panel or a wire label. Putting
the API on the left or the right would need a jog through the band at y=120..180 where both answer
labels live, and a jog to the left would run the line under the panel.

It is a relationPath, not an arrow. The API HOLDS this object, it never drives it, so no ball rides
this line on any step and it takes no arrowhead. Every ball on this card stays in the top row.

Four lanes, one pair per manager, mirrored about the API faces on LANE_DY 12 so OFFEDGE reads each
face as a deliberate pair. Every one of them carries a ball on some step, so all four are arrows
rather than relations: kubectl applies on steps 1 and 3, hpa-controller on steps 4 and 5, and each
apply is answered. The 409 on the conflict step is drawn coming home for exactly that reason, since
a return the narration promises and the motion never delivers is a named defect family here.
```

### before `const LEG_CAP_Y = 366;`

```
The three inputs of the client-side three-way merge (the last-applied-configuration annotation, the
file on disk and the live object) sit in the bottom left corner, which is the corner the panel frees
once its text ends. They hold OPACITY.notready, "outside this path", for five of six steps and come
to full on the step that compares the two mechanisms.

That corner is not filler. Without it the card is a top row and a table both starting at x=420, with
the entire left third empty below the panel, and the L-shaped safe zone says that room is usable.
The alternative considered was a six row pipeline ladder in the band between the top row and the
table: it was dropped because a ladder there sits between the API and the object and the tie from
one to the other would have to cross it, which is a THROUGH finding by construction.
```

### before `const PENDING = 0, LIVE = 1, GONE = 2;`

```
A field that has left the object dims to OPACITY.terminated rather than being removed, because a
removed row leaves a row-sized hole in a table that is on screen for the whole card, and a hole reads
as a rendering fault rather than as an absence. It keeps its field path and its value cell says
Removed, so the reader can still see WHICH field went.

The two right hand cells are spelled with the primitive own key names (`label:` and `sublabel:`)
inside the row constants, so check-inline reads them where they are written rather than not at all.
Writing them under a `val:` or `mgr:` key would have hidden nine drawn strings from the lint, and
writing them under a `value:` key would have had the lint demand lowercase for a string that reaches
the canvas as a block LABEL, which the same lint wants capitalised.
```

### before `function setRows(s, spec) {`

```
THE WORKED EXAMPLE, and it has to add up because check-figures reads the numbers and a reader follows
the values themselves. One Deployment called web, four fields, two managers:

  step 1 first-apply   replicas 3, minReadySeconds 10, labels.app web, image nginx:1.27
                       all four owned by kubectl        chip: 1 entry, kubectl owns 4 fields
  step 3 drop-a-field  minReadySeconds Removed          chip: 1 entry, kubectl owns 3 fields
  step 4 conflict      nothing changes                  chip: 1 entry, kubectl owns 3 fields
  step 5 force         replicas 5, owner hpa-controller chip: 2 entries, kubectl 2, hpa-controller 1

The last line is the one to check: after the force, kubectl owns labels.app and the image, which is
2, and hpa-controller owns replicas, which is 1, and 2 + 1 is the 3 live rows on screen.

WHERE EACH CHIP TURNS OVER. `metadata.managedFields` holds what the API STORES, so it moves when the
request lands there. `last apply` holds what the CLIENT LEARNS, so it waits for the answer to come
home, which is a full 800ms later. `last conflict` moves with the API decision, on the request
landing. `apply request` never moves at all: PATCH with application/apply-patch+yaml is a standing
fact about the verb, not a per-step state, the same shape failurePolicy has on the webhook card.

check-arrival reports five R2s on this card and all five are its documented blind spot: it samples
chips at t=0 and compares against t=0 of the PREVIOUS step, so a chip rolled back below the guard and
turned over through at() looks like an uncued change on the NEXT step. Every one of them IS cued, on
the step where it happens. Do not "fix" them by lighting a chip on a step where nothing happens.
```

### poster (rebuilt 2026-08-04, concept signed off)

```
Sentence: two actors, one field, and only one of them owns it.

A tug of war. Two 88 x 104 manager blocks pinned to the left and right edges, one 68 x 80 field
block centred between them, and a short dashed leg reaching in from each manager to the field's near
face. The field takes the bright fill (0.10 against 0.04) and the one accent bar at 0.9; both
managers carry the same bar at 0.3. Nothing marks WHICH manager owns it, and that is on purpose:
the poster asserts only that the field is what is being fought over.

The two legs are dashed and symmetric, so direction comes from the composition being closed around
the centre rather than from an arrowhead, which no poster in this catalog uses.

WHAT IT REPLACED and why. The old poster, built earlier the same day, was a framed four-row table:
the managedFields ledger, with an ownership tag at one end of each row and a tag at BOTH ends of the
last. It was accurate and it was a small diagram rather than one sentence. Worse, it was the THIRD
stack-of-rows poster in the Control Plane section (cluster-authn-authz and the old
cluster-api-structure being the other two), so at grid size it read as a sibling of cards it has
nothing to do with. The ledger is still the card, drawn full size inside the dialog where a reader
can actually see four rows and five tags. The poster now carries the claim the ledger exists to
make, in three blocks.

One of the two siblings is gone: cluster-authn-authz was removed from the catalog later the same
day. That does not undo this replacement, it only means the count above is history rather than a
description of the section as it stands.
```

---

## cluster-etcd-raft

### layout

Written 2026-07-27 together with the vertical rebalance. The card was never part of an R5 pass
because it reported zero on all six geometry rules before and after, which is precisely why nobody
had looked at it: **`check-geometry` judges the horizontal centre and has no rule for vertical
balance at all.** The block band ran `y 258..558` in a 640 canvas, so its centre sat at 408 against
the canvas centre of 320: the drawing was 88 units low, the whole top-right quadrant was blank and
an 82-unit dead strip ran along the bottom.

The fix moves the band up and lets the replication arc, not the cylinders, carry its top edge.

| constant | value | derived from |
|---|---|---|
| `CYL_Y` | 230 | the API is level with the ETCD row and starts at `CONTENT_L`, so `API_Y = CYL_Y + CYL_H/2 - API_H/2` must clear `PANEL_B`. That gives `CYL_Y >= 215`; 230 leaves 15 units under the reserved corner and 25 under the measured panel bottom |
| `ARC_RISE` | 80 | new named constant replacing an inline `32`. It is what puts something in the previously blank top-right, so the arc reads as a route rather than a decorative notch |
| `ARC_Y` | 150 | `CYL_Y - ARC_RISE` |
| everything below | follows | `CYL_CY`, `CYL_BOTTOM`, `ROLE_Y`, `LOG_Y`, `API_Y` and the three state chips are all offsets from `CYL_Y` and moved with it |

Resulting band `150..498`, height 348, centre **324** against the canvas centre 320, margins 150 top
and 142 bottom.

**Alternatives measured and rejected.**

1. Pure slide-up keeping `ARC_RISE = 32`: band `198..498`, centre 348, still 28 low, and the top-right stays a 198-unit empty strip.
2. `CYL_Y = 215`, the mathematical minimum: the API's top edge lands exactly on `PANEL_B` with zero clearance. At 1100x800, where the panel is widest, that is one narration line away from an OCCLUDED finding.
3. Stretching the row gaps to fill the full 640: breaks the only thing tying a role chip and a log chip to their replica. This is one semantic band, so the fix is to centre the band, not to inflate it.
4. Moving the API into the free bottom-left with an L-lane up into ETCD-1: every cylinder's bottom face is already taken by its role-chip binding line, and the straight API-to-Leader lane is the literal "single point that orders all changes".

**Timing.** `REPLICATE` grew 584 to 680 units (the `32+520+32` legs become `80+520+80`), `routeDur`
1298 to 1511 ms, the `replicate` step span 1858 to **2071 ms**. That still fitted the 2100 budget,
but by 29 ms, so `duration` went to 2400 for a beat of headroom. Motion untouched. `API_TO_E1` is
unchanged at 140 units and stays on the 700 ms floor.

**Superseded 2026-07-30.** `replicate` is 3800 now, and the numbers above are the R5 relayout's, not
the card's current ones. Review stage 2.4 family D gave every exchange on this card the answer it was
missing (two Follower acks, the durable report, the whole of `apply`), so `replicate` runs to 3629 and
`quorum` and `apply` went 1900 -> 2500 each. The row became a lane PAIR to carry them: see the note
under `LANE_DY` in `docs/INTERNALS.md`.

**Closed 2026-07-30, and not by the fix proposed here.** The wire label `write Pod · via Leader`
measures **152** units (`getBBox`, not the estimate) with `text-anchor: middle` at
`(API_R + CYL_XS[0]) / 2 = 350`, so it wanted 176 with clearance and had a 140-unit gap: it sat on
the API's right border and on the ETCD-1 cylinder, on every viewport.

The fix on file was to tighten the cylinder pitch (`CYL_XS = [440, 690, 940]`, gap 60 to 50) and
leave the margins at 60. What shipped instead widens the gap from both ends and leaves the row
spacing alone, on the author's call:

| constant | was | is | why |
|---|---|---|---|
| `M` | 60 | **40** | the only way to buy the label its gap without narrowing the API off the 220 standard box width. Both sides take it, so the bbox is `40..1160` and still centred on 600 |
| `CYL_XS` | literal `[420, 680, 940]` | derived from `CONTENT_R - ROW_W` | `[440, 700, 960]`, right edge on `CONTENT_R` by construction rather than by a comment |
| `SCHIP_W` | 320 | `API_W` (220) | the API and the three state chips are ONE column and used to end 100 units apart, which is what made the left stack read as two |
| `wireProposal` y | `CYL_CY - 12` | `ROW_OUT - 14` | `CYL_CY - 12` IS `ROW_OUT` to the unit, because `LANE_DY` is also 12, so the dashed lane ran through the glyphs. 14 above the lane is what the sibling control-plane cards use |

Label clearance is now 14 units at each end (`API_R` 260, label `274..426`, `CYL_XS[0]` 440).
`check-chipfit` passes at the narrower chip width (the widest pair, `acks (entry 9)` + `1 (then 2)`,
is 165 of the 196 available). **No timing change**: `API_TO_E1` went 140 to 180 units, both under
the 700 ms `routeDur` floor, and `anim-dump` gives the same spans as before, 3629 / 2060 / 2071.

**Header measurement corrected at the same time**: the card recorded `y <= 220`, the real worst case
over the viewport set `check-geometry` judges against is **230**.

### the two arcs crossed, and which end had to be swapped (2026-08-01)

```
The outbound arc and its ack cut through each other one dash above ETCD-3, and it was there from
the day the ack was drawn (review stage 2.4 family D) because the pair was built by mirroring:
outbound on `CX - LANE_DY` at BOTH ends, ack on `CX + LANE_DY` at both.

Work it through and the crossing is forced rather than accidental. The ack horizontal runs at
y=162 from 1052 to 532. The outbound vertical comes down into E3 at x=1028, from y=150 to the
cylinder top at 230, so it passes y=162 at a point that is INSIDE 532..1052. One lane through the
other. The E1 end is clean by luck, not by symmetry: the ack vertical there stops at y=162 and
never reaches the outbound horizontal at 150.

The fix is to swap the two stubs at ONE end, which the author called before the geometry did. E3
now RECEIVES on its right stub and SENDS from its left, the opposite of E1, and the two arcs become
concentric: outer 508 -> 150 -> 1052 -> down, inner 1028 -> 162 -> 532 -> down, nested on all three
sides. Written down it looks unsymmetric, and that is the point: mirrored stubs are what crossed.

Nothing is traded. Each cylinder top still carries a mirrored pair straddling its own midpoint,
which is the whole of what OFFEDGE judges, and both lanes still leave and arrive on the face they
did. Timing moves a little, because the arcs changed length: REPLICATE 680 -> 704 units (routeDur
1511 -> 1564) and ACK_E3 656 -> 632. That lands `replicate` at 3628 of its 3800 budget and `apply`
at about 2124 of 2500, both still inside, so no duration moved.
```

### the cylinder bindings, and the 14 units under them (2026-08-01)

```
The three lines tying each cylinder to its role chip were hand-rolled `line()` elements carrying
`scheme-arrow scheme-arrow-cluster` and nothing else: no dasharray, no dim, no relation class. So
the one thing on the card that is NOT traffic drew brighter and more solid than every lane that
carries a ball, and it sat in front of them rather than behind. That class string is exactly what
`relationPath` was added to retire in 2026-07-27, and this card was missed because its copies are
`line()` rather than `arrow()` and no rule reads either.

All three go through `relationPath` now, one forEach over CYL_CXS rather than three near-identical
statements, so the wire and its style come from one place.

ROLE_Y went `CYL_BOTTOM + 16` to `CYL_BOTTOM + 30`, on the author's ask, and the two changes belong
together: at 16 units a `5 5` dash renders a tick and a half, which reads as a rendering slip rather
than as a relationship. At 30 it is three dashes and the chip stack under every cylinder gets air.

The left column follows, because `SCHIP_Y` is derived from `ROLE_Y` and the term chip shares its top
edge with the role row: breaking that to hold the left column still would trade one alignment the
card has for none. What it costs, stated rather than hidden: the band goes 150..498 to 150..512, so
its centre moves 324 to 331 against the canvas centre of 320, and the bottom margin goes 142 to 128.
The row itself cannot rise to pay for it, because `CYL_Y >= 215` is set by the panel and 230 is
already only 15 clear (see alternative 2 above, measured and rejected for that reason).
```

### review pass (2026-08-01)

```
The acks chip contradicted the step it sits under, and the card carried two denominators at once.

On the quorum step the chip read `acks (entry 9): 2 / 2 ✓` beside `quorum: 2 of 3`, while the
narration says the Leader counts "itself plus at least one Follower makes 2 of 3, which meets
quorum". A tick on the SECOND ack teaches that the commit waits for both Followers. It does not:
in a group of three the Leader plus one Follower is already the majority, which is why the
replicate step can honestly say `1 (then 2)` and why a three-node cluster survives losing a Node.

The chip counts now and does not judge: `0 of 2` on append-log, `1 (then 2)` on replicate,
`2 of 2` on quorum. The verdict moved to the chip whose threshold it actually is, which becomes
`2 of 3 ✓ at ack 1` on the quorum step and carries that value into apply, where it is still true.
One denominator on screen with a tick, one plain count beside it.

Values only, so no geometry and no timing moved. Widths: the acks pair is unchanged at its
recorded 165 of 196 available, and the new quorum value is 17 characters against a 6-character
name, well inside the same 196.
```

### the sixth step, and the promise the desc had been making (2026-08-04)

```
The desc ends `Lose the majority and it stops writing until quorum returns.` and the card spent
five steps on the happy path and never showed it. For a middle to senior reader the two practical
Raft questions are why an odd number of replicas and what happens when quorum is gone, and the
second is the one they meet in production. The picture was already built, so the step is values
plus one fade: no new geometry, no new block, no new lane.

WHAT THE STEP ASSERTS, and where each fact came from. Read raw, not summarised.

1. The Leader does not simply keep leading. etcd's raft `Config.CheckQuorum` is documented as
   `Leader steps down when quorum is not active for an electionTimeout`, `stepLeader` logs
   `%x stepped down to follower since quorum is not active` and calls `becomeFollower`, and
   `server/etcdserver/raft.go` sets `CheckQuorum: true` unconditionally on every raft.Config it
   builds. So ETCD-1's role chip goes Leader -> Follower and the card ends with no Leader on it.
2. Writes fail, and the client sees a timeout. `server/etcdserver/errors.go` carries
   `ErrTimeout = etcdserver: request timed out`, which is the string the narration quotes.
   (`ErrNoLeader = etcdserver: no leader` is the other one a caller can get once the step-down has
   happened. Only one fits the character budget and the timeout is the one operators report.)
3. Reads split, and that split is the whole value of the step. etcd's api_guarantees page:
   `etcd ensures linearizability for all other operations by default. Linearizability comes with a
   cost, however, because linearized requests must go through the Raft consensus process.` and the
   Range API reference: `a serializable range request is served locally without needing to reach
   consensus with other nodes in the cluster.` So `reads keep working` is wrong and
   `nothing works` is wrong.
4. It ends when a majority comes back. etcd FAQ, failure tolerance: `If quorum is lost through
   transient network failures (e.g., partitions), etcd automatically and safely resumes once the
   network recovers and restores quorum`. kubernetes.io, Operating etcd clusters: `If the majority
   of etcd members have permanently failed, the etcd cluster is considered failed. In this
   scenario, Kubernetes cannot make any changes to its current state.` The snapshot-restore half
   of the recovery story did not fit the budget and is deliberately left to the sources.

THE CHARACTER CEILING. `CYL_Y` is 230 and the measured panel bottom is 230, so the panel is one
unit off the artwork and the longest narration on this card IS the layout constraint. The new step
is 331 characters against the `proposal` step's 334, which is the longest on the card and therefore
the ceiling. `proposal` was 332 when this note was written and was reworded on 2026-08-04; the panel
was re-measured at all three viewports afterwards and did not move. Measured per step with `overlay-measure.mjs`
after it was written: 291/160 at 1600x1000, 378/193 at 1280x860, 397/230 at 1100x800, and the new
step matches the existing worst on all three rather than raising it. The ceiling is now stated as a
number in the card header, per the rule in scheme/CLAUDE.md.

THE APPLY STEP WAS LEFT WITH A FALSE ABSOLUTE. It ended `every read from here on returns it
consistently`, which was true while the card stopped there and is contradicted by the step after
it. It reads `while quorum holds every read returns it consistently` now: 325 -> 331 characters,
re-measured, no change to the panel. This is the internal-contradiction check finding a defect the
ADDITION created, which is the usual shape of it.

HOW THE SILENT PAIR IS DRAWN. `OPACITY.notready` (0.40), because the vocabulary defines it as
`alive but not serving, not observed, or outside this path` and an unreachable replica is exactly
that: it has not left the world, the Leader has stopped hearing it. Not `terminated`, which would
also put the card one `.highlight` away from a `check-opacity` LIT finding.

A replica does not dim alone. `setReplicas(s, o)` writes TWELVE elements from one list: both
cylinders, both role chips, both log chips, both dashed ties, and the four lanes joining them to
the Leader, whose shade is `laneOf(OPACITY.running, o)` because a lane is only as present as the
fainter of its ends. It is called by EVERY step including idle, with `OPACITY.running`, because two
independent assignments drift the moment a step is added. That is what forced the two structural
changes in `build()`: the six-lane `forEach` became a `lane()` helper keeping the four Follower
lanes by name, and the tie `forEach` became a `map` so `ties[1]` and `ties[2]` have refs. They had
none, which is why nothing could dim with them before.

NO BALL, ON PURPOSE. A packet into a member that is not answering says the opposite of the step,
and nothing comes back either, so there is no return to draw. The step carries its beat with the
fade and with `.highlight` on the four chips that move. Neither silent replica takes a highlight on
either path. Spans: the twelve fades run 0..700 (`FADE.out`), the two counters turn over on that
beat through `at`, the role chip an election beat (`BEAT.lead`) after it, so `anim-dump` gives
span=1501 against a 2600 duration.

THE ACKS CHIP WAS RENAMED. `acks (entry 9)` showed `2 of 2` directly above `quorum: 2 of 3`, both
about entry 9, and their denominators count different populations: two Followers against three
replicas. Neither was wrong and together they read as a contradiction. It is `acks from Followers`
now, which states its own population and does not go stale on a step about entry 10. Measured with
`check-chipfit`'s own probe: the tightest pair is `acks from Followers` + `0 of 2` at a 24 unit
clear gap, against a MIN_GAP of 4, so it fits with room. The quorum chip takes a third value,
`1 of 3 · lost`, at a 65 unit gap.
```

## cluster-graceful-node-shutdown

### layout (R5-a, 2026-07-27)

```
Already Layout A (ladder 60..540, chips 620..1140, Node frame full width) and left that way. The one
change is the lane: a single spine stopped on the Node frame's top edge between Pods, while the step
that fires it makes two different Pods react. It now drops to a bus at BUS_Y = NODE_Y - 14 and taps
down into each of the three Pods; all three lanes are drawn, and SIG_LANE(i) feeds both pathArrow and
routePacket. terminate-normal sends one ball per non-critical Pod (lanes 0 and 1), terminate-critical
one on lane 2. The frame moved 468 -> 476 so the bus has 14 units of clearance either side.
terminate-normal 2700 -> 2900, terminate-critical 2600 -> 3000ms.
```

### rework (2026-08-03): one lane, taller frame, chips on arrival

```
GEOMETRY. `node()` draws its label at `NODE_Y + 18` and the Pod row started at `NODE_Y + 22`, so
NODE-1 was printed four units above the first Pod and overlapped it. The Pod row moved to the
family's `NODE_Y + 34` and the frame grew 140 -> 152 (34 label padding, 106 Pod, 12 floor), with the
bottom pinned on 624, so `NODE_Y` went 476 -> 472. The ladder and the chip column both end around
450 and did NOT have to move: the gap to the frame is 22.

THE LANE. The bus-and-taps fan added by R5-a is withdrawn, the same author call made on
`cluster-node-drain` and `cluster-node-pressure-eviction` the same day. `SIG_LANE` is two points now,
`[[600, 120], [600, 472]]`, one straight drop from the Kubelet bottom face midpoint to the Node frame
top face midpoint. That needed `SPINE_X` to move 580 -> `CX`, because the frame midpoint is 600 and a
lane leaving a box off its own face midpoint is an OFFEDGE finding: since `KUBE_X` is DERIVED from
`SPINE_X` the whole top row shifted with it, Kubelet 464..696 -> 484..716 and systemd 752..984 ->
772..1004, both still clear of the panel at x<=397 and of the 1140 edge. The lane runs the 540..620
corridor between the ladder and the chip column and crosses nothing.

`BUS_Y`, `POD_CXS` and the three-lane `sigLanes` array are gone with it, and `setPods` no longer pins
lane opacity: the lane ends on a frame that is on screen for the whole card.

**terminate-normal now sends ONE ball and both non-critical Pods react to it**, which is a better
reading of `in parallel` than the two balls it had (whose arrivals differed anyway, because the two
taps were different lengths). terminate-critical sends one ball for the critical Pod.

BALL AND PULSE ORDER, checked because it was asked for and not because it was broken: both terminate
steps are down-arrow (infra to Pod), so the canon is ball first and pulse on arrival, which is what
they already did. Measured: ball 0..782, pulses 782..1682, fade 782..1982. Nothing fires
simultaneously, and the up-arrow steps (`signal` in, `release` out) have no Pod pulse at all to
sequence against.

CHIPS. All four now wait for the packet that earns them, the treatment the sibling cluster cards got:
`phase` turns over when the D-Bus signal LANDS on the Kubelet (`signal`), when the SIGTERM lands
(both terminate steps), and `inhibitor lock` plus `phase` when the release reaches systemd
(`release`). systemd is not free to proceed until the release actually arrives, so showing `released`
at step entry was the lock being dropped a second before the ball that drops it.

DEAD CODE. `PANEL_R` and `PANEL_B` were read by nothing and are dropped, with the measurement folded
into the header comment next to what it constrains. Four near-identical `ctx.register(...animate...)`
fade blocks collapsed into one local `fadeOut(s, ctx, key, delay)` with the 1200ms held in `POD_FADE`.

DURATIONS. The lane went 748 -> 352 units, so both terminate spans dropped 2809/2898 -> 1982 and the
two steps were left with about 900ms of stillness. Both cut 2900/3000 -> 2400.
```

### technical pass (2026-08-03)

```
Checked against the raw text of the Graceful Node Shutdown page, not a summary.

THE BIG GAP, and it was the first thing the doc says after the intro: `Once the kubelet is notified
of a node shutdown, it sets a NotReady condition on the Node, with the reason set to "node is
shutting down". The kube-scheduler honors this condition and does not schedule any Pods onto the
affected node.` The card had none of it. Step 2 was called `cordon` and said only that the Kubelet
`flips its admission state and rejects any new Pod assignments`, which is the SECOND half of the
mechanism and not the one that stops the Scheduler. Cordon is also the wrong word: there is no
`spec.unschedulable` anywhere in this feature. The step id, the ladder row and the phase chip all say
condition / NotReady now, and the narration names the reason string.

That gap had a knock-on that made the card contradict itself. The `release` step said `While the Node
is down, the Lease in kube-node-lease grows stale, so the cluster marks it NotReady`, which puts the
NotReady at the END, on a card where the Kubelet sets it at the START. Reworded: the Node has carried
NotReady since the Kubelet set that condition, and the stale Lease is what additionally makes it
unreachable.

POD OUTCOME. Added to terminate-normal: the Pods end up with the status reason Terminated. The doc
records that `kubectl get pods` shows Terminated and describe shows
`Message: Pod was terminated in response to imminent node shutdown`. The message itself did not fit
the character budget.

VERIFIED AND LEFT ALONE: PrepareForShutdown is the logind D-Bus signal, the delay-type inhibitor lock
is right, `shutdownGracePeriod` minus `shutdownGracePeriodCriticalPods` is the regular-Pod window
(the doc works the same subtraction with 30/10), the 2,000,000,000 critical threshold is
`scheduling.SystemCriticalPriority`, and DaemonSet infra sitting in the critical bucket is fair. Not
added for want of characters: static and mirror Pods count as critical regardless of priority, and
`shutdownGracePeriodByPodPriority` allows more than two buckets.

TERMS. `node is shutting down` is an API reason string in lower case, so it went into
`terms.json` under `exceptions.Node` rather than being capitalised into a value that does not exist.
It is the only occurrence in the catalog.
```

### the terminated Pods no longer leave a hole (2026-08-04)

```
`terminate-normal`, `terminate-critical` and `release` pinned their finished Pods to 0 and `fadeOut`
animated them to 0, so after the first SIGTERM the Node frame carried two block-sized empty slots and
after the second it was an empty dashed rectangle. An absent block reads as a rendering fault rather
than as an absence, which is the catalog-wide rule under "A block that does not exist yet dims, its
lanes disappear". Both the pins and the fade land on `OPACITY.terminated` now, the vocabulary's shade
for "gone from the API, or finished", so a shut-down Pod stays on screen as a ghost in its own slot.
`OPACITY` is imported from `cluster-kit.js` the way `cluster-node-drain` imports it.

This is the same conversion `cluster-node-drain` had on 2026-08-04 and
`cluster-node-pressure-eviction` had the same day, and the three Node cards now agree.

WHAT WAS LEFT AT 0, deliberately: nothing. Every `0` on this card was a finished Pod. The lane is not
in the argument at all, because it ends on the Node frame top face and the frame is on screen for the
whole card (see the rework note above), so there is no lane pinned to a Pod here to send to 0.

NO STAND-IN HIGHLIGHT TO TAKE BACK. `cluster-node-drain` needed its `fadeOut` to drop a `.highlight`
in the fade's `onfinish` (the `removeAt` shape) because its static path used to light the dying Pod's
inner box in place of the pulse. Neither terminate step here has ever set one: both reduced branches
are a bare `return`, so `check-opacity`'s LIT and `check-reduced`'s HIGHLIGHT have nothing to catch
and `fadeOut` stays a two-line helper. If a stand-in is ever added here, it has to be taken back on
both paths, because the Pod now ends dim rather than absent.

TIMINGS UNTOUCHED. The end value of a fade is not a duration: `POD_FADE` stays 1200 and both
terminate spans stay 1982 against `duration: 2400`. The pulses still precede the fades on
`sig.arrivalMs`, which is `check-opacity`'s ORDER rule and was already correct.
```

---

## cluster-kubelet-sync-loop

### layout (R5-a, 2026-07-27)

```
Untouched apart from the chip column, which was 380 wide against a 500 wide ladder. Widened to the
category's 480 (60..540). The card is Layout B by shape (API and chips in the left column, ladder
right) and has none of the three regressions: no chip collision, no lane into empty space, and the
left band is occupied.
```

---

### technical pass (2026-08-03)

```
NAMED COMPONENTS. The watch step said `The Kubelet source dispatcher routes the spec into podManager`.
There is no source dispatcher in the Kubelet. The three spec sources (apiserver, file, http) are
merged by `PodConfig` into ONE update channel, `syncLoop` reads it, and `HandlePodAdditions` puts the
Pod into `podManager`. This card names real internals everywhere else (podManager, PLEG, SyncPod,
CRI, containerStatuses), so one invented component was the odd sentence out. Now it reads `merges its
spec sources into one update channel, and the sync loop records the Pod in podManager`.

PULLIMAGE. The CRI sequence for a new container is RunPodSandbox, PullImage, CreateContainer,
StartContainer, and the card named three of the four. PullImage is the ImageService half of the CRI
and it is in this path every time, so it is now in the narration, in the wire label
(`RunPodSandbox · Pull · Create · Start`), in ladder row 4 (`Pull/Create/Start container gRPC`) and,
crucially, in the MOTION: the cri step animates four packets, not three, and the chip names each call
as its ball lands. That cost the step 800ms (a 120 unit hop sits on the PKT_DUR_MIN floor of 700,
plus BEAT.afterHop), span 2860 -> 3660, so `duration` went 3000 -> 3800.

THE OBSERVED CHIP CHANGED UNITS MID-CARD. It read `0 containers` and then `1 running`, next to a
`desired` chip reading `1 container`, so the reader had to translate `1 container` into `1 running`
to see that the loop had converged. It is `0 containers` -> `1 container running` now, directly
comparable with `desired` at a glance, which is the entire point of putting the two chips together.

THE PANEL MEASUREMENT WAS RECORDED TWICE AND WRONG BOTH TIMES. The header comment claimed a worst
case of `y<=195` measured over 1600/1440/1280/1100, and `PANEL_B` two lines below it said 215, while
the real worst at 1100x800 was 205. Neither number was read by anything: `PANEL_R` and `PANEL_B` were
both dead constants, the exact shape `scheme/CLAUDE.md` says not to re-add. Both dropped, and the
comment now carries the measurement, re-taken after the narrations grew: `x<=397, y<=230` (160 / 183
/ 193 / 230 over the four viewports, 269 at 1024x768). What the bottom has to clear is the API box at
y=300, so there is 70 units of headroom at the rule worst case. Grow a narration here and re-measure.

SETCHAINACTIVE. Five hand-rolled copies of `chain.querySelectorAll('.scheme-chip')` plus
`rows[i].classList.add('highlight')`, with no import of the helper every other card in the catalog
uses. Behaviourally identical, because `clearHighlights` clears ladder rows itself. Replaced, and
slot 0 now says `setChainActive(s.refs.chain, -1)` out loud instead of relying on the clear.
```

### poster (rebuilt 2026-08-03, concept signed off)

```
Sentence: a closed cycle of five stages that never stops.

Five stage blocks (76 x 50, `rx="8"`) wired head to tail into a closed ring: three across the top at
x = 20 / 120 / 220, two under the outer pair at y=110, five dashed legs joining them face midpoint to
face midpoint, and the long bottom leg reading as the return. The blocks are the card ladder in
order, clockwise from the top left: watch, PLEG, SyncPod, CRI, status. SyncPod is the reconcile
itself, which is the card title, so it takes the winner treatment: a stronger box fill (0.10 against
0.04) and the one bright `currentColor` bar at `opacity="0.9"`, twice the width of the four dim bars
at 0.3. Fifteen shapes, and they are three repeated motifs rather than fifteen ideas.

**This is the second attempt and the first one is worth knowing about, because it failed on STYLE
rather than on concept.** The concept (signed off) was the same closed cycle, but drawn as one thin
rounded track at `opacity="0.45"` with five 14 unit marks on it and an arrowhead. Three faults, all
only visible next to the siblings: the marks were specks at the 200px the grid actually renders,
the dimmed track made the dominant shape faint, and 240 x 116 of the canvas was empty air where
every sibling poster carries mass. It also broke the vocabulary twice over. **No poster in the
catalog uses an arrowhead** (grep for a closing `Z"` and you get nothing), and the house accent is
not a bright FILL on a shape, it is a `rect` with `fill="currentColor"` at `opacity="0.9"`, which is
what `cluster-scheduler-decision` uses and why that one reads best on the sheet. Direction is now
carried by the ring being closed rather than by an arrowhead.

Before either attempt: three rounded boxes in a triangle with two dashed legs and a curved return,
a miniature of the card diagram (API, Kubelet, containerd) rather than a sentence about it. The
canon calls that out twice, no literal copies of the card diagram and no reused two-box layouts.

**If you redraw a poster here, put it side by side with two siblings at 260% before deciding.** All
three faults of attempt one were invisible on the file and obvious on a montage.
```

### chips wait for the packet that earns them (2026-08-03)

```
Every chip on this card reports something the Kubelet has LEARNED or DONE, and all four were pinned
at step entry, so on three of the five steps the answer stood on screen for a second and a half
before the ball that produces it. Same defect the node-drain card carried, same fix: pin the end
value above the `ctx.reduced` guard for the reduced contract, then on the played path set the chip
back to what the step STARTS from and turn it over through a local 1ms `at(...)`.

What each chip now waits for, and why that beat and not another:

  watch      Pod, desired         the spec ARRIVES at the Kubelet (~1160ms). podManager cannot hold
                                  a spec the Node has not been handed yet.
  pleg       last CRI op          the call REACHES the runtime. That is when the op happens.
  pleg       observed             the ANSWER comes home. The Kubelet learns the container list from
                                  the reply, not from having asked.
  cri        last CRI op          four turnovers, one per call as its ball lands: RunPodSandbox,
                                  PullImage, CreateContainer, StartContainer. The step IS a sequence,
                                  and a chip reading StartContainer from entry skipped three
                                  quarters of what the sentence describes.
  status     last CRI op          the ListContainers of the next PLEG cycle lands on the runtime.
  status     observed             the answer comes home, and only then does the PATCH leave.

Verified by real-time sampling rather than by frames, because `frame-strip` seeks and never fires
`onfinish`, so every `at(...)` turnover is invisible to it. `check-reduced` passing is the proof the
end state still lands.

**`check-arrival` R2 now reports three findings on this card and all three are the tool artefact,
not defects.** R2 samples chip values at t=0 and compares against t=0 of the previous step, so a
turnover that happens mid-step gets attributed to the NEXT step, where the chip is not highlighted
because that step is not about it. It reports `Pod` and `desired` at the pleg step and `last CRI op`
at the syncpod step. This is the same known blind spot that produces three of the tool's twenty
catalog-wide survivors, and check-arrival is deliberately out of the gate.
```

### evented PLEG is named on the pleg step (2026-08-04)

```
The card presented the 1s relist as the only thing that wakes the loop, which is the immediate
follow-up question on a card whose whole subject is that loop. The `pleg` narration now closes with
`The EventedPLEG feature gate (alpha, off by default) has the runtime push lifecycle events over CRI
instead of relisting.`

ALPHA, not beta, and that is the one fact worth re-checking if this sentence is ever edited. The
kubernetes.io feature-gates table for the current release lists `EventedPLEG false Alpha 1.26`, with
no beta row: the gate WAS beta in 1.27 and went back to alpha, so a card written to 1.35 that says
beta is stale. Read the raw table rather than a summary of it.

Length was the binding constraint, not accuracy. pleg went 196 -> 318 characters, deliberately one
under the cri step at 319, so cri stays the card worst case and the panel measurement above still
holds to the unit: re-measured 2026-08-04 at 160 / 183 / 193 / 230 over 1600x1000 / 1440x900 /
1280x860 / 1100x800, and 269 at 1024x768. A 354 character draft (it also called the relist a slower
backstop, which is true and unaffordable) took 1100x800 to 255 and 1024x768 to 296, four units off
the API box at y=300.
```

---

## cluster-leader-election

### layout

Written 2026-07-27 together with the vertical rebalance, same story as `cluster-etcd-raft`: zero
geometry findings throughout, because no rule looks at vertical balance. The band ran `y 50..481`,
centre 265 against the canvas centre 320, so the drawing sat 55 units high with a 159-unit dead band
under the field chips and only 50 units above the replica row.

**The card had five independent absolutes** (`ROLE_Y 170`, `CORRIDOR_Y 252`, `LEASE_Y 300`,
`HOLDER_Y 400`, `FIELD_Y 447`). Each is now derived from `REP_Y` through the gap it already had, so
the whole stack moves as one and only a single number decides where it sits:

| constant | value | derived from |
|---|---|---|
| `CY` | 320 | `640 / 2`, the canvas centre |
| `BAND_H` | 431 | `FIELD_Y + ROW_H - REP_Y`, the card's own height, unchanged |
| `REP_Y` | 105 | `Math.round(CY - BAND_H / 2)`. Centred by construction, not by a number anyone liked |
| `ROLE_Y` | 225 | `REP_BOTTOM + 40` |
| `LANE_RUN` | 48 | new name for the corridor leg length the card already used twice |
| `CORRIDOR_Y` | 307 | `ROLE_BOTTOM + LANE_RUN` |
| `LEASE_Y` | 355 | `CORRIDOR_Y + LANE_RUN` |
| `HOLDER_Y` | 455 | `LEASE_Y + LEASE_H + 20` |
| `FIELD_Y` | 502 | `HOLDER_Y + ROW_H + 13` |

Every gap (40 / 48 / 48 / 20 / 13) is the card's existing gap. The only value that changed is
`REP_Y`, by +55. Band `105..536`, margins 105 top and 104 bottom.

**Alternatives measured and rejected.**

1. Keeping `REP_Y = 50` and stretching the gaps to reach the floor: the corridor legs grow past 48 and the L-shaped CAS pair stops reading as one tight request and response. It also lengthens every route for no compositional gain.
2. `REP_Y = 110`, a rounder +60: band `110..541`, 5.5 off centre, no advantage over deriving it from `CY` and `BAND_H`.
3. Moving the three Lease field chips into the free bottom-left as a column: destroys "fields grouped directly under their object", which is the entire bottom half of the card.

**A real defect was found by the rebalance and fixed.** The three CAS packets rode hardcoded centres
`470 / 700 / 930` while the drawn lanes sit at `REP_CXS = 530 / 780 / 1030`. `anim-dump` before the
fix put the balls at `t(460,204) t(690,204) t(920,204)` against wires at `520/540`, `770/790`,
`1020/1040`: **every ball flew 60 to 90 units beside its own dashed lane on three of the five
steps**, and a stale comment reading `Centres 470 / 700 / 930` said so out loud. The call site is now
`putPacket(s, ctx, REP_CXS[i])`, so the wire and the ball come from one array, which is the rule this
project has written down twice.

**Timing.** The vertical move is a pure translation and changes no route length, but the lane fix
does: mgr-3's corridor leg goes 330 to 430 units (total 426 to 526), `routeDur` 947 to 1169 ms, so
the `acquire` and `failover` spans went 2554 to **2998 ms**, over their 2700 budget. Both raised to
3200. Motion untouched.

**Header measurement corrected at the same time**: the card recorded `y <= 195`, the real worst case
over the viewport set `check-geometry` judges against is **205**.

**`check-arrival` baseline for this card is R2 3**, all three checked by hand and correct behaviour.

### centred column, one Lease entry per replica, 2026-07-30

**Everything above about the horizontal is superseded**, including `REP_XS = [420, 670, 920]` and
every row below it. The vertical reasoning still reads correctly as history, but `REP_Y` is no longer
derived from `CY`: read the constants in the card.

The rebalance had fixed the vertical and left the horizontal alone, which left three defects that
were reported together and are really one:

- the replica row spanned `420..1140` while the Lease and its chips spanned the full `60..1140`, so
  the bottom read as a different object from the top;
- with the row pinned right by the panel, the drawing sat at `420..1140`, centre **780**;
- all six CAS routes shared one horizontal corridor, so every PUT lay on top of its own answer and
  it was unreadable which answer belonged to which replica.

The corridor is gone rather than split. **Each replica now reaches the Lease on its own axis**: a
PUT straight down at `cx - 10` and its answer straight up at `cx + 10`, from the role chip to the
Lease top. Six independent endpoints on that face, at `340/360`, `590/610`, `840/860`, mirrored in
pairs about its midpoint 600, so OFFEDGE stays quiet and a reader can follow one exchange without
tracing a shared line.

With no corridor to route around, the column is free to sit where the canvas wants it:

| constant | value | derived from |
|---|---|---|
| `STACK_W` | 720 | `3 * REP_W + 2 * REP_GAP`, the replica row |
| `STACK_L` | 240 | `CX - STACK_W / 2`. Content spans `240..960`, centre **600** |
| `REP_XS` | 240 / 490 / 740 | mapped off `STACK_L`, centres 350 / 600 / 850 |
| `REP_Y` | 170 | `PANEL_B + 15`. The row is pinned by the PANEL now, not by the canvas centre: centred horizontally, its left third is in the panel's column, so it has to clear the panel bottom |
| `LANE_RUN` | 56 | the straight drop, role chip to Lease |
| `LEASE_Y` | 352 | `ROLE_BOTTOM + LANE_RUN` |
| `FIELD_Y` | 492 | band bottom 526 |

`check-geometry` is **clean on all six rules**, CENTRE included, where the previous attempt at this
opened two CENTRE findings by aligning everything to the right-pinned row.

**The vertical is now a trade with the narration, and the arithmetic is worth stating.** With the
column centred, the row sits under the panel, so the band top is `panel bottom + 15` and every
narration line costs the drawing 25 units of viewBox at 1100x800, where the panel is deepest. Moving
the band up by one line moves its CENTRE up by only 12.5, because the top is pinned and the height is
not. Measured at each length:

| narration | panel bottom | `REP_Y` | band | centre vs 320 |
|---|---|---|---|---|
| 7 lines (as written) | 205 | 220 | 220..609 | 414, 94 low |
| 6 lines | 180 | 195 | 195..551 | 373, 53 low |
| **5 lines (shipped)** | **155** | **170** | **170..526** | **348, 28 low** |
| 4 lines | 130 | 145 | 145..501 | 323, centred |

All four narrations were rewritten to hold five lines (189 to 205 characters), and the band lost 33
units of gap (`LANE_RUN` 80 to 56, role gap 14 to 12, Lease gap 20 to 16, field gap 13 to 10). Four
lines would centre it exactly and is **not** taken: at about 160 characters the qualifying clauses
start coming out, which is the failure this project has already paid for once. **A narration that
grows past five lines silently pushes the panel onto the replica row**, and nothing checks it:
OCCLUDED scores block area against the panel and would report the overlap, but only if someone runs
it, and `check-geometry`'s gate profile does not include that rule.

**Timing.** Every route is now the drop from the role chip to the Lease, under the 700 ms `routeDur`
floor, so `acquire` and `failover` fall 2998 -> 2198 -> **2060 ms** across the passes of this day.
Their `duration` is 2700, the card's own pre-lane-fix budget (they had been at 3200 to cover 2998).

### text pass, 2026-07-30

- **`failover` lit only mgr-2**, while mgr-3 races in that step too: it sends a CAS-PUT, its wire
  label reports the 409 and its role chip changes. Both survivors light now, and that also closed one
  of the card's three recorded `check-arrival` R2 findings (baseline is **R2 2** from here on, both
  on `renew`, where the standby chips only drop the previous step's 409 marker).
- **The standbys do not WATCH the Lease, they GET it.** client-go leader election calls
  `Get` on the lock every retry period (2s by default against a 15s lease); there is no watch in that
  loop. The narration said "keep watching", the chips said `standby · watching` and the catalog
  description said "stand by and watch". All three now say polling or GET.
- Everything else checked against the two sources on the card: the CAS on `resourceVersion` and its
  409, the 15s `--leader-elect-lease-duration` default, `leaseTransitions` incrementing only when the
  holder changes, and the Lease living at `coordination.k8s.io/v1` under the name
  `kube-controller-manager`.
- **The first acquisition is a CREATE, and the card called it a PUT** (corrected 2026-08-01). The
  step said "All three replicas race to PUT the Lease, each write guarded by a compare-and-swap on
  resourceVersion", with `holderIdentity: none` and `renewTime: none` on the idle chips. Those chips
  describe a Lease that exists and has never been held, which Kubernetes does not produce: client-go
  Gets the lock, and on NotFound it CREATEs it, so the winner of the first race takes a 201 and the
  losers an AlreadyExists 409. Compare-and-swap on resourceVersion is the UPDATE path, which is what
  every renewal and the failover race use, and the card now draws the difference: `POST 201 Created`
  and `POST 409` on acquire against `PUT 200 OK` and `PUT 409` on failover. The narration holds its
  five lines at 201 characters, inside the 189 to 205 band this card is written to.
- **The Lease box is drawn at idle although the object does not exist yet**, and that is deliberate
  rather than an oversight the canon missed. The dim-a-block-that-is-not-there-yet rule would take
  the Lease AND its four field chips to a placeholder shade for one step that a reader never sees on
  its own (the poster occupies that position), and it would cost the card its anchor: the Lease is
  the object the whole drawing is about. Left solid, with the create said in words instead.
- **`renew` now answers too** (approved the same day). It sent a PUT and rode nothing home, so
  mgr-1's answer lane was the one drawn lane on the card idle while its twin carried a ball, against
  the card's own rule under `casPut` that a replica acts on the answer rather than on the write. A
  renewal is the same CAS-PUT and returns 200. `casPut` instead of `putPacket`, span 1260 -> 2060,
  `duration` 2000 -> 2700, which is what the two racing steps already use.

### poster (rebuilt 2026-08-04, concept signed off)

```
Sentence: three want it, one has it.

Three 80 x 46 replica blocks across the top, the middle one lit (fill 0.10 against 0.04) and
carrying the accent bar at 0.9 while the other two carry the same bar at 0.3. Below them one wide
240 x 52 Lease block holding a row of five 34 x 24 slots of which EXACTLY ONE is filled, a
currentColor rect at 0.9 sitting under the middle replica. The middle replica's leg is the one
SOLID line on the poster and it runs past the Lease boundary into that filled slot; the two
standbys drop dashed at opacity 0.4 and stop on the Lease top edge without getting in.

Five slots rather than three on purpose: three would sit one under each replica and assert that
every replica has a slot of its own, which is the opposite of what a Lease is. Five reads as a row
of cells with one taken.

The bright block is the MIDDLE one while the card elects Controller-mgr-1, the leftmost. Raised
2026-08-01, still open, still deliberate: the poster blocks carry no names so it asserts nothing
about which replica wins, and handing the win to the left block would put the one bright element on
the edge and send the solid leg across two other legs to reach the slot.

WHAT IT REPLACED and why. The old poster had the same three replicas but the Lease was a plain box
with two horizontal rules standing in for its fields, the holder was a small filled circle floating
inside the winning replica, and all three legs were dashed. "Exactly one holder", which is the whole
card, was nowhere in it: two rules do not say a field is taken, a 3.6 radius dot is a speck at the
~200px the grid renders, and three dashed legs say all three replicas are equally attached. The
filled slot in a row of empty ones says it in one mark, and the solid-versus-dashed legs say which
one got in.
```

```
One helper for both outcomes. The winner used to send only, so an arrowheaded lane labelled
`PUT 200 OK` sat empty beside two lanes visibly carrying their 409s, and the card taught that only
rejection travels back. The answer, not the write, is what a replica acts on, so all three PUTs are
answered now.

Durations stay at 3200: the span is set by mgr-3's long corridor leg at 2998ms and the winner's ack
lands at 2060ms, so the added return costs nothing.
```

## cluster-node-allocatable

### layout (2026-08-04, new card)

```
The Node family idiom is a ladder plus a Node frame full of Pods, and this card breaks the second
half of it on purpose: the subject is an ARITHMETIC, not a sequence of things happening to Pods, so
the frame holds ONE horizontal capacity bar that gets carved segment by segment and the ladder in
the right column carries the running subtraction. Nothing is a Pod here, so nothing pulses: the
beats are packets, block highlights and the four segment reveals. That is a deliberate reading of
"only Pods pulse", not an oversight.

The scale is exact, and that is the load-bearing decision. GI = 56 units per Gi, BAR_W = 16 * GI =
896, so every segment width IS its number: kubeReserved 56, systemReserved 28, evictionHard 28,
Allocatable 784. A reader can measure the picture and get the same answer as the chips, which is
what check-figures asks of the strings and nothing asks of the geometry.

Why 56 and not a rounder 60 or 64. The request strip starts at ALLOC_X and a 15Gi request is 15 * GI
wide, so its right end is ALLOC_X + 15 * GI. At GI = 64 that lands on 1176, past the content margin
at 1140; at GI = 60 it lands exactly ON the Node frame edge. 56 puts it on 1104, 36 units inside the
frame, and still overhangs the end of the bar (1048) by exactly one Gi, which is the whole answer
the card exists to give: the request does not fit in what is left, and the overhang IS the 1Gi it is
short by. BAR_X = CX - BAR_W / 2 = 152, so the bar is centred on 600 by construction.

Vertical budget, from the bottom up: chips 548..624 (two per row at 532, never four across), Node
frame 336..532, ladder 140..315 in the right column, actor row 40..120. The frame is 196 tall rather
than the family 152 because it holds four things stacked: 34 of label padding (node() draws NODE-1
at +18), the 64 bar, the 22 request strip, and three caption tiers.

The three narrow segments cannot hold a label at 56, 28 and 28 units wide, so their captions
stagger on three tiers below the strip, each centred on its own segment. That is 54 units spent on
the left third of the frame and it leaves the right third of the band under the strip empty. The
alternative was to widen the reserved segments out of proportion, which would make the picture lie
about the one thing it exists to show. Left as is, on purpose.

The idle frame is mostly empty for the same reason: at the poster position nothing is carved yet,
so the Node holds one undivided 16Gi bar and the band below it is the room the carve will use. A
progressive-carve card cannot both reveal and be full at rest.
```

---

### before `const KUBELET_TO_NODE = [[KUBELET_CX, TOP_BOTTOM], [KUBELET_CX, JOG_Y], [CX, JOG_Y], [CX, NODE_Y]];`

```
A relationship, not a route: this Kubelet runs on this Node and is what computes its Allocatable.
No step on the card names anything travelling that way (the Kubelet PATCHes the API, and the
arithmetic below is its own local work), so it is a relationPath with no arrowhead and no ball,
the same call cluster-scheduler-decision makes for API_TO_CHAIN. It leaves the Kubelet bottom face
midpoint (520) and lands on the Node frame top face midpoint (600), turning at JOG_Y = 228, which is
halfway between the two faces. Without it the top row and the Node band read as two unrelated
drawings.
```

---

### before `const kube  = segment({ x: KUBE_X,  w: KUBE_W,  caption: 'kubeReserved 1Gi',     tier: 0 });`

```
The segments carry STROKES only: their rect fill is overridden to transparent so the soft box fill
does not double up where a segment sits on the capacity bar underneath it. The bar keeps the fill,
the segments draw the internal rules, and the carve is those rules appearing one step at a time.
rx is 0 on the segments and 6 on the bar, because four rounded rects side by side read as four
separate blocks rather than as one bar divided.

Each segment is wrapped in a g with its caption so ONE opacity reveals both, which is also what
keeps setSegs honest: five names, five assignments, no chance of pinning the box and forgetting
the caption.
```

---

### before `const reqBar = box({ x: ALLOC_X, y: REQ_Y, w: ALLOC_W, h: REQ_H, rx: 4, role: 'cluster' });`

```
Pod requests are only ever measured from where Allocatable starts, so the strip starts there too and
its width is set per step by setReqWidth in whole Gi. On schedule it is 15Gi and overhangs the bar,
on overcommit it is 12Gi and sits inside the Allocatable segment: the two frames next to each other
are the card's argument.

Its label goes through the wires map rather than through a box sublabel, because a box sublabel is
positioned at w / 2 and w changes between the two steps, so the label would drift off centre. A
start-anchored text at ALLOC_X + 10 is stable at any width, and clearWires already resets it.

The label names REQUESTS only, on both steps. The overcommit step talks about 24Gi of limits and
that number is deliberately not drawn: nothing on the bar measures limits, and a 24Gi strip would
run 1344 units off a 1200 unit canvas. The ladder row and the narration carry it instead.
```

---

### before `function setChips(s, { cap, alloc, fit }) {`

```
Four chips, and two of them turn over on a beat rather than at entry. status.capacity.memory holds
what the API STORES, so it reads "not reported" until the Kubelet report lands there, and
status.allocatable.memory the same. NodeResourcesFit holds the Scheduler's verdict, so it waits for
the number it judges against to arrive. Each is pinned to its end value above the ctx.reduced guard
and rolled back on the played path, the cluster-node-drain shape.

enforceNodeAllocatable never changes, and that is what the field is: the Kubelet enforces Allocatable
across Pods by default and the other two values are opt-in. A standing value is not a defect, it is
the answer to "which of these three reservations is actually a cgroup cap".

check-arrival reports two R2 findings here, both the documented blind spot: it samples at t=0 and
compares against t=0 of the previous step, so a chip written on arrival through at() looks like it
changed on the NEXT step, unlit. Both changes are cued on the step where they happen.
```

---

### poster

```
One sentence: one bar, four segments, and only the last one is for you. A single outlined rect
spanning 20..300 stands for the whole Capacity, cut by three internal rules into kubeReserved,
systemReserved, the eviction threshold and Allocatable. Inside each segment sits the house accent,
a currentColor rect, at 0.3 on the three reserved slices and 0.9 on Allocatable, so the eye lands
on the only region a Pod may be scheduled into. The Allocatable segment also carries a second 0.05
fill over the bar fill, which is the same trick cluster-scheduler-decision uses on its winning Node.

The reserved segments are 44, 36 and 36 wide against 164 for Allocatable, which is WIDER than the
card's own proportion (56, 28, 28 against 784). At 320 units scaled to the ~200px the grid renders,
a truthful 512Mi slice would be 5 units of accent, which is the speck the kubelet-sync-loop poster
was rebuilt to remove. The sentence is "three narrow, one wide", and it survives the widening.

No arrowheads, no text, no ladder, no actors. Direction is not part of the sentence.
```

## cluster-node-drain

### layout (R5-a, 2026-07-27)

```
Layout C. Panel measures x<=397, y<=380 here, the tallest in the category: 5 ladder rows (200) plus
the Node frame (152) plus the chips do not fit under it, so the left column above the frame stays
empty and the ladder keeps the right column (660..1140). That emptiness is Layout C's known cost.
Chips went from four across (258, both names overlapped their values) to TWO per row at 532, two
rows, 548..624. The Node frame moved up to the panel bottom (380..532) to pay for the second row.
The request wire label moved above the top row (WIRE_Y = TOP_Y - 14): at y=146 it spanned 539..907
and the spine at x=580 struck through it.
The eviction lane no longer stops on the frame edge between Pods. EVICT_ROUTE(i) drops to a bus at
BUS_Y=398 inside the frame and taps down into web-1 or web-2; both lanes are drawn, and each step feeds
the SAME array to pathArrow and routePacket. evict-A: 3100 -> 3300ms.

**That fan was withdrawn on 2026-08-03, by author decision** (and later the same day the lane lost
its jog too, see the top-row note above). Two lanes crossing the Node frame and
splitting over the Pod row read as plumbing rather than as an eviction, so there is ONE lane now and
it stops on the Node frame top face midpoint (`x=CX=600`, `y=NODE_Y=380`): the eviction is addressed
to a Pod ON this Node, and WHICH Pod is carried by the pulse, which is unchanged on both evict steps.
`BUS_Y` and `POD_CXS` are gone with it, and so is `setLanes`: the lane ends on a frame that is on
screen for the whole card, so nothing it points at can go away under it and the catalog-wide
"a lane lives and dies with its Pod" rule has nothing to bind here. The Pod fades stay, they just no
longer drag a lane with them.
Both evict steps got SHORTER rather than longer, and by different amounts, because the two lanes were
never the same length: the web-1 lane ran 928 units and the web-2 lane 602, against 528 for the single
lane. evict-A span 3762 -> 2873 against `duration: 3900`, evict-B 4638 -> 4473 against 4700. Both
durations were left where they are, so evict-A now holds about a second of stillness after web-1 is
gone. That is the one open cost of this change.

**Two changes since, both 2026-07-30.** The lane leaves the API, not kubectl (review stage 2.4 family
C): kubectl POSTs to the eviction subresource and the API is what reads the PDB, grants the 200 OK and
DELETES the Pod, which both evict steps say in those words. `SPINE_X` could not simply be redefined
because `KUBECTL_X` is DERIVED from it, so the route got its own `API_CX` = 868 and a jog at y=145 that
clears the ladder; evict-A went 3300 -> 3900. And the 200 OK itself is now animated on the answer lane
(family D), which the card had drawn and used only for the 429 on the retry step.
```

### top row moved under the panel (2026-08-03, author decision, OCCLUDED left OPEN)

```
The API box is centred on the Node frame (`API_X = CX - BOX_W / 2`, 484..716, so `API_CX` is 600) and
the whole top row moved left by the same 268 units to keep the pair rigid, which puts kubectl at
196..428. The eviction lane is now a single vertical drop, `[[600, 120], [600, 380]]`: API bottom
face midpoint straight down to the Node frame top face midpoint, no jog, no corridor. `SPINE_X` and
`JOG_Y` are gone, and `KUBECTL_X` derives from `API_X` rather than the other way round.

**`check-geometry` reports OCCLUDED on kubectl at 86% and that finding stays open.** It is real, not
a tool artefact, and it is viewport-dependent in a way the rule cannot express. Measured right edge
of the panel against kubectl at 196..428:

  2560x1440  154   0% covered, fully clear
  1920x1080  203   3%, the left border only
  1728x1080  272   33%
  1600x1000  291   41%
  1440x900   319   53%
  1280x860   378   78%
  1100x800   397   87%

So the crossover is around 1920: wider than that and nothing is covered at all, narrower and kubectl
is progressively eaten, at 1280 and below down to a sliver of its right edge. The author looked at
the real page, judged the centred API and the straight lane worth it, and accepted the cost. Do NOT
"fix" this by sliding the row right: with `BOX_W` at 232 and the panel reaching x=397, a box on the
left of a centred API has 420..484 to live in, 64 units, so there is no position that satisfies both.
The only layouts that close it are kubectl to the RIGHT of the API (772..1004, which reverses the
request direction of the top row) or a much narrower box family. Both were considered and declined.

Two consequences were repaired rather than accepted, because neither was part of the trade:

WIRE_X. It was the midpoint of the gap between the boxes, which is `(428 + 484) / 2 = 456`. The
label runs about 300 units wide against a 56 unit gap, so it overhangs both boxes by roughly 120 on
each side, and at 456 its left end lands on x=305: the panel ate its first 73 units at 1280 and 89 at
1100, rendering `POST .../pod` as `ls/`. It is `CX` now, centred over the API, 435..765 at the worst
viewport against a panel that stops at 397. Note the label was ALWAYS wider than its gap, on both
layouts. What changed is only whether the overhang lands on empty canvas or under the panel.

DURATIONS. The lane went 528 units to 260, which is below the `PKT_DUR_MIN` floor, so both evict
steps got shorter: evict-A 2873 -> 2400 and evict-B 4473 -> 4000. Left at 3900 and 4700 that is 1.5s
and 0.7s of stillness at the end of a step. Now 2550 and 4150, back to the tight margin the card used
before (138 and 62 at the time). This is the third time on this card that a geometry change turned
out to be a timing change, in both directions.
```

---

### technical pass (2026-08-03)

```
A read of the card against kubernetes.io (API-initiated Eviction, Safely Drain a Node, the
PodDisruptionBudget API reference) turned up four technical defects and three rule defects.

WHO DOES WHAT AT THE PDB GATE. The card had the API server doing the arithmetic: `finds
currentHealthy=2 and minAvailable=1, so disruptionsAllowed=1`, and ladder row 4 read `API checks
minAvailable`. The disruption controller is what computes `status.disruptionsAllowed`, and the
eviction admission path only READS it and decrements it. Row 4 is now `API reads
disruptionsAllowed`, and the narration names the controller as the thing that keeps the status.
Same defect one step later, from the other side: evict-B said `the PDB returns 429`, where the PDB
is an object and the API server is what answers. That one also contradicted the card, since row 4
had already said the API answers 200 or 429.

DAEMONSET PODS IN THE DESC. It read `DaemonSet Pods are skipped only when you pass
--ignore-daemonsets`, which says that without the flag they would be evicted. The task page is
explicit that the subcommand does not drain DaemonSet Pods at all and that the flag exists so the
drain does not abort. The card own step 2 had it right, so the desc was contradicting its own card.
439 -> 459 characters, inside the 400-470 band.

RETRY CADENCE. `It retries the eviction on a backoff` became `retries the eviction every 5
seconds`: kubectl sleeps a fixed 5s on a 429 and tries again, there is no backoff curve.

THE CORDON ABSOLUTE. `The Scheduler stops placing new Pods on this Node` is false for anything
tolerating `node.kubernetes.io/unschedulable`, and the DaemonSet Pod this very card keeps on the
Node is exactly that. The toleration is now named in the same sentence.

Also added to step 2: bare Pods with no owning controller need --force. It was the one bucket of
the list-and-skip step that the narration did not name.

**THE NARRATION LENGTHS ON THIS CARD ARE LOAD-BEARING AND THE FIRST DRAFT OF THIS PASS BROKE THEM.**
`NODE_Y` IS `PANEL_B` here, so the Node frame starts exactly where the panel ends, and the measured
worst case at 1100x800 was 379 against a frame at 380: one unit of clearance, spent. Growing three
narrations for accuracy took the panel bottom to 404 at 1100x800 and 456 at 1024x768, which put it
over the frame edge and its NODE-1 label. `check-geometry --rules=occluded` stayed CLEAN through all
of that, because it scores occluded AREA and a 25 unit strip off a 152 tall frame is under its bar,
so nothing in the gate would ever have said a word.

What sets the panel bottom is the LONGEST narration on the card, so the budget is a single number:
no step may exceed 528 characters, which is what evict-A was before. The accuracy edits were paid
for inside the same step rather than by moving the frame. evict-A dropped `which the Scheduler places
on another Ready Node` to `elsewhere` (the Scheduler placement is the rolling-update card subject and
the pointer to it survives) and lost one pair of parentheses: 570 back to exactly 528. Step 2 dropped
`or they are also refused`, which `need` already implies: 540 to 515. Re-measured at 1600/1280/1100,
back to 379 and 397, the HEAD numbers.

If you add a sentence to any step here, measure with `VW=1100 VH=800 node overlay-measure.mjs
cluster-node-drain` and pay for it in the same step. Do not trust the gate on this one.

The 379 / 397 numbers in this block are the 2026-08-03 state and are SUPERSEDED. The 2026-08-04
trims took the panel to 304, see "narration trim and the terminated shade" below. The 528 ceiling
is not superseded, because it belongs to the frame rather than to the text.

Left alone deliberately: the card says the granted eviction is `200 OK`, which is what the doc
lists (200 / 429 / 500). The apiserver create handler actually answers 201 Created for a successful
eviction. Following the doc is the right call for a teaching card, but do not "fix" the 201 in
either direction without deciding that first.

Also left alone: `web-1` and `web-2` are named like StatefulSet members while their sublabel says
Deployment, which really produces `web-<rs-hash>-<random>`. Legibility wins here and the naming is
consistent across every step, chip and wire label on the card, so this is a recorded simplification
rather than an oversight.
```

---

### poster

```
Two Node frames, the drained one left and the destination right, with three Pod slots left and two
right. Sentence: a drain empties a Node of everything except its DaemonSet Pod.

Until 2026-08-03 the fills said the opposite and did not even agree with themselves: the left Node
held TWO solid slots and one ghost while TWO solid Pods stood on the right, so one Pod had left and
two had arrived, on a card where two leave and one stays. The two upper slots are the ghosts now
and the bottom slot (the DaemonSet Pod) carries the single brightest fill on the poster at 0.16,
because it is what the sentence is about. Shape count is unchanged.
```

---

### note (anchor dropped: `topPacket(s, ctx);` is not unique in the file)

```
Listing is a read against Api: only the kubectl <-> apiserver hop
moves. No packet reaches the node, so no Pod reacts (the bucketing is
shown by the chain advancing, not by blinking a Pod the GET never touches).
```

### before `setVal(s.refs.healthyChip, '2 of 2');`

```
The step narrates the API READING `currentHealthy=2` and only then granting the eviction, which is
what takes the count to 1. The chip is literally named `currentHealthy`, and it read `1 of 2` from
step entry, so for the whole 3900ms the number beside the sentence contradicted it.

The end value stays pinned above the guard for the reduced contract. The played path rolls back to
`2 of 2` and turns over on `evict.arrivalMs`, the same instant the Pod pulses and its lane fades.
`at(...)` is the standard 1ms zero-effect carrier, the `network-ipam-pod-cidr` shape. It was a
card-local helper when this was written. All twelve copies were retired into `scheme-kit.js` on
2026-08-04 and it is now imported from the category kit. Import it, never write another local copy.

**Extended to the other three chip values on 2026-08-03**, because doing this to ONE chip while its
neighbour ran ahead was the tell: `last eviction` read `web-1 · 200 OK` from entry, beside a
`currentHealthy` that correctly waited. The two chips answer different questions and so turn over on
different beats. `currentHealthy` is PDB status, so it moves when the eviction takes effect on the
Pod (`evict.arrivalMs`). `last eviction` is what kubectl KNOWS, so it moves when the answer lands
back on kubectl: `granted.arrivalMs` on evict-A, `denied.arrivalMs` on evict-B. Capturing the return
hop into `granted` is the only reason that packet stopped being a bare call.

evict-B was the worse of the two, because both of its pinned values are TRANSITIONS
(`1 of 2 → 2 of 2`, `web-2 · 429 → 200 OK`): showing them at entry announced the 429 and the retry
that clears it before either had been drawn. The played path now starts from what evict-A left, puts
`web-2 · 429` up when the denial reaches kubectl, bumps the count as the RETRY LEAVES (the narration
has the replacement turning Ready before the retry is granted, not after) and settles on the pinned
strings at `evict.arrivalMs`. Spans are untouched: `at(...)` is 1ms and every beat it hangs off was
already inside the step.

The `drained` step no longer writes `2 evicted · DS retained` into this chip. That is a tally, not a
last eviction, and it is the exact shape the catalog-wide chip-name rule exists to stop. Nothing was
lost: ladder row 5 and the wire label already carry the summary, and the chip settles on
`web-2 · 200 OK`, shedding the retry marker the way `currentHealthy` sheds its own on the same step.
```

---

### narration trim and the terminated shade (2026-08-04)

```
THREE STEPS TRIMMED. The panel had become a paragraph of documentation on three steps, with one ball
moving under a wall of text and the animation carrying none of the explanation. Nothing was deleted
that the card does not still say somewhere: each cut moved to a carrier that already existed or was
made to exist.

evict-A 528 -> 388. The eviction URL went, because the wire label already prints
`POST .../pods/web-1/eviction · 200 OK` and ladder row 3 prints the templated form. The parenthetical
`(currentHealthy=2 minus minAvailable=1)` went, because both numbers are lit chips on this very step.
The disruption controller keeping the status, the 200 OK, the atomic decrement under optimistic
concurrency, the grace period and the pointer to the rolling update card all stay.

list 515 -> 393. The `(kubectl refuses to proceed without it when DS Pods are present)` clause went,
because the `desc` in data.js states it in those words. The three drain FLAGS moved out of the prose
and into ladder row 2, which now reads `2. list · --ignore-daemonsets --delete-emptydir-data
--force` and is a lookup rather than a sentence. Measured 413 units against a 480 row. The narration
keeps every bucket and now says the emptyDir and bare-Pod cases abort the drain until the matching
flag is passed, which is what the row supplies.

evict-B-retry 431 -> 368. Redundancy only: `denying the request` after a 429, `web-1` restated on the
replacement, `the API server` shortened to `the API` (the block is labelled API), and `freeing web-2
to be evicted` to `evicting web-2`.

THE EVICTED PODS NO LONGER LEAVE A HOLE. `evict-A`, `evict-B-retry` and `drained` pinned the evicted
wrappers to 0 and `fadeOut` animated them to 0, so after each eviction the Node frame carried a
block-sized empty slot in its left third, which reads as a rendering fault rather than as an absence.
Both the pins and the fade now land on `OPACITY.terminated`, the vocabulary's shade for "gone from
the API". `PANEL_B` went with this, see the header note below.

Two traps came with it, both of which a check would have caught only after the fact. First, the
static path used to stand a `.highlight` on `pod1Box` / `pod2Box` in for the pulse it cannot show,
and a highlight at the terminated shade is `check-opacity`'s LIT on one path and `check-reduced`'s
HIGHLIGHT on the other. Neither branch sets it now, and `fadeOut` takes the class back in the fade's
`onfinish`, which is the `removeAt` shape from `storage-reclaim-policy`. Second, `check-opacity`'s
ORDER wants the pulse before the fade: both still hang off `evict.arrivalMs` and are untouched.

RE-MEASURED, AND THE FRAME DID NOT MOVE. Panel bottom over 1600x1000 / 1280x860 / 1100x800:
195 / 235 / 304, worst at the poster position, which previews the `cordon` text (396 characters, now
the longest on the card). It was 379 at 1100x800. The frame top stays on 380, so the clearance went
from 1 unit to 76. Closing that gap by moving `NODE_Y` up would change the eviction route length and
therefore every packet timing on the card, which is the third time this card has had a geometry
change turn into a timing change, so it was not done. `PANEL_B` is gone as a name: it meant "the
measured panel bottom" and it no longer equals one. `NODE_Y = 380` is now a plain constant with the
measurement in the header comment, which is where CLAUDE.md says a measurement belongs.

THE CEILING IS UNCHANGED AT 528 and that is not an oversight. The ceiling is the longest narration
that keeps the panel off the frame at 380, which is a property of the frame, not of the current text.
Both measured points agree on it: 528 characters gave 379 and 396 characters gives 304, about 0.57
units per character, so 380 is reached at roughly 530.
```

---

## cluster-node-failure

### layout (R5-a, 2026-07-27)

```
Layout C, and the card had to be re-budgeted vertically: six ladder rows (242) were laid out as
five, so the ladder ran from 190 to 432 and its last row was drawn over the two Node frames. The
top row dropped from 110 to the family's 80 to buy the space back, which puts the ladder at
152..394, the frames at 406..538 and the chips at 552..624. Chips went from five across (206, and
the unreachable taint value alone needs 335) to THREE per row at 350.67, two rows.
Lanes: the heartbeat used to rise at LEASE_CX straight through all six ladder rows. Both lanes now
share a two-lane corridor above the frames (EV_JOG_Y 340 outbound, HB_JOG_Y 362 return) and meet
the top row through GUTTER_X 620 and UNDER_TOP_Y 136, left of the ladder.
The wire label moved above the row: the heartbeat riser used to strike it. heartbeat 2400 -> 2600,
evict 2200 -> 2400.

**Re-aimed at the frames 2026-08-03.** R5-a had landed both Node-1 lanes on the POD's top face at
POD_A_CX -/+ 12 and run the reschedule Pod face to Pod face. Every lane now starts and ends on a
NODE FRAME face; which Pod the step lands on is carried by the pulse. The heartbeat gains accuracy
from the same move, because it used to leave the Pod and no Pod renews a Lease: the Kubelet on the
Node does, which is what the narration says in its first six words.

**Frames shrunk 15% inwards, same pass.** Each is anchored on its OUTER edge, Node-1 on CONTENT_L
and Node-2 on CONTENT_R, and gives up width on the inner side only: 520 -> 442, inner edges on 502
and 698, still mirrored about CX. The corridor between them goes 40 -> 196, which is what finally
gives the reschedule lane a real 98 unit run into Node-2 rather than a stub, and it let GUTTER_X
move off 620 (where it had nowhere else to be) to 640, so the heartbeat riser and the reschedule
drop sit 40 apart instead of 20 and stop reading as one of the card's LANE_DX pairs.

**Two spec findings, closed 2026-08-03.** The box sublabel read `node-lifecycle-controller`, and
step 5 of the same card has the **taint-eviction-controller** issue the DELETE. Since 1.29 those are
two independent components (the docs say the eviction implementation "has been moved out of node
controller into a separate, and independent component"), so the box was denying the actor its own
next step names. It reads `node-lifecycle + taint-eviction` now. Step 6 is a third controller again,
the replicaset controller, and its narration calls that out in words rather than on the box.

The taint step also said the toleration was given to "every Pod", which is the false-absolute trap
this project keeps paying for. Kubernetes adds it to any Pod that does not set one itself, and
DaemonSet Pods set theirs with no `tolerationSeconds`, so this path never evicts them. That is not a
footnote on a Node-failure card: it is why the DaemonSet agents survive the eviction the card shows.

**Six chips, not five.** The grid is three wide, so five left a hole in the second row. The one
worth adding was the THRESHOLD: `grace period`, sitting beside `Lease age` exactly as
`--eviction-hard` sits beside `memory.available` on cluster-node-pressure-eviction. It is what makes
30s of staleness harmless and 52s fatal, which two steps narrate and nothing on the canvas showed,
and it makes the "50s plus 300s" arithmetic in the last step readable off the strip. The rows are
meaningful now instead of arbitrary: Ready / Lease age / grace period is "is the Node alive", and
Taint / Toleration / eviction timer is "what happens to its Pods".

**All six go through one setChips, 2026-08-04.** Five of the seven steps wrote a subset and the
reschedule step wrote none at all, so the last frame of the card sat under `eviction timer: 0s ·
Terminating`, a countdown running on a Pod its own narration had already replaced. The last step
now takes terminal values: Ready and grace period stay where the controller left them (nothing on
an unreachable Node moves them back), the Lease age reads `over 350s · Expired` because that is the
card's own 50 plus 300 arithmetic, and the eviction timer reads `none · Node-2 has no taint`, which
is the only settled answer for a timer that has already fired and has nothing to run against on the
Node the replacement landed on.
```

---

### before `const HEARTBEAT_CONNECTOR = [[NODE_A_CX + LANE_DX, NODE_Y], [NODE_A_CX + LANE_DX, HB_JOG_Y], [GUTTER_X, HB_JOG_Y], [GUTTER_X, UNDER_TOP_Y], [LEASE_CX, UNDER_TOP_Y], [LEASE_CX, TOP_BOTTOM]];`

```
Shared connectors. Heartbeat: the Node-1 frame top face up into the Lease bottom-centre, the
vertical riding GUTTER_X between the ladder and the frames. Evict: controller down into the Node-1
frame top face, the two of them a mirrored LANE_DX pair on that one face. Reschedule: controller
straight down the corridor into the Node-2 frame left face.

It crosses the heartbeat's return leg at HB_JOG_Y, and that is structural rather than sloppy: the
heartbeat has to travel left-to-right along the band and the reschedule has to travel top-to-bottom
through the same corridor. It costs nothing, because no step ever puts a ball on both.
```

---

### before `s.refs.podA.style.opacity = String(OPACITY.terminating);`

```
Family A, closed 2026-07-29 (SCHEME-2.4-PLAN.md, stage 2.1). Both the evict step and the
reschedule step after it used to draw Pod A at opacity 0, on both the Pod and its two Node-1
lanes, while the narration said the Pod sits in Terminating and the chip read '0s Terminating'.
Terminating is a phase in the vocabulary, not an absence: an object with a deletionTimestamp that
the API cannot finish deleting is exactly the thing this card is about, and drawing it as gone
deleted the subject of its own sentence. Pod and lanes now hold OPACITY.terminating.

The LANES stopped following the Pod when they were re-aimed at the frames, and the shade was
re-derived on 2026-08-04: both end on the Node-1 FRAME, so each carries the shade of the dimmer of
its two ends (laneOf), which is the frame from kubelet-stops onward because the controller and the
Lease stay at full all card. Until then they were still pinned to the Pod, which put a full-strength
lane on a 0.4 frame for three steps and a 0.25 lane on it for two. The reschedule step brings only
the replacement Pod to full, because a Pod carrying a deletionTimestamp no longer counts towards the
replica total, which is what lets the controller create the replacement while the old one is still
on screen.
```

### before `const EVICT_CONNECTOR     = [[EV_X, TOP_BOTTOM], [EV_X, EV_JOG_Y], [NODE_A_CX - LANE_DX, EV_JOG_Y], [NODE_A_CX - LANE_DX, NODE_Y]];`

```
Both Node-band lanes leave the CONTROLLER, because the controller is the actor both steps name: the
taint-eviction controller DELETEs the Pod on Node-1, and the owning controller CREATES the replacement
on Node-2.

The reschedule lane used to run Pod A's right edge to Pod B's left edge. That drew the dying Pod
migrating across to Node-2, on a card whose previous step has just left it Terminating with an
orphaned container on an unreachable Node, which is the one thing a Node-failure card must not teach.
The step's own comment claimed the packet bridged node block to node block and the coordinates said
otherwise.

It cannot mirror the eviction lane and jog right along `EV_JOG_Y`, because that y is inside the ladder
(152..394) and the clearance under it is 12 units, so it takes the corridor between the two Node
frames (40 wide when this was written, 196 since the frames shrank).

**The pair stopped being mirrored on 2026-08-03**, and Node-2 is why. Its TOP face midpoint is x=880,
directly under the ladder, with only those same 12 units left over, so that face cannot be reached at
all: the reschedule enters the LEFT face midpoint instead. To get there its vertical has to fall
inside the corridor, whose centre (600) is also the controller's bottom face midpoint. So the
reschedule takes the midpoint outright and the eviction steps aside by twice `LANE_DX`. At the old
mirrored +12 in the old 40 wide corridor the run into Node-2 was 8 units, an arrowhead hanging off
its own vertical; with the frames shrunk it is 98. OFFEDGE is unbothered either way: 24 off a 300
unit face is 8%, well inside the 18% the rule allows a lone endpoint.
```

---

## cluster-node-pressure-eviction

### layout (R5-a, 2026-07-27)

```
Layout B: with a panel bottom of 280 the sum PANEL_B + 20 + chip column (160) + 20 + Node frame (140)
is 620, so the chips fit in the left column and only the ladder needs the right. Chips left the
four-across bottom strip (258, --eviction-hard overlapped its own value) for a 480 wide column at
60..540, and both columns ended together on COL_BOTTOM = 460 with the Node frame at 484..624.
**Those three numbers are the 2026-07-27 state and not what the code says today.** The frame grew
140 -> 152 on 2026-08-03 to stop NODE-1 printing on the first Pod, which pushed its top edge up:
COL_BOTTOM is 456, the frame is 472..624, and the arithmetic above reads 632 rather than 620 with
the taller frame. The migration and its clearances are recorded under "vertical rework" below.
The lane used to stop on the frame's top edge above the MIDDLE Pod while the Pod that is always
evicted is the BestEffort one on the left. It now turns at BUS_Y (472, midway between the columns
and the frame) and lands on POD_CXS[0]. evict: 2500 -> 2700ms.
```

### the lane goes back to the frame (2026-08-03, author decision)

```
The tap into the BestEffort Pod is withdrawn, the same call the author made on `cluster-node-drain`
the same day and for the same reason: a lane that crosses the Node frame and picks a Pod out of the
row reads as plumbing rather than as a kill. `CONNECTOR` is now two points,
`[[SPINE_X, TOP_BOTTOM], [SPINE_X, NODE_Y]]`, a single drop on the spine from the Kubelet bottom face
midpoint to the Node frame top face midpoint, both exactly x=600, so OFFEDGE stays quiet by
construction. It passes between the chip column (ends 540) and the ladder (starts 660). Which Pod
dies is carried by the pulse, which is untouched.

`BUS_Y` and `POD_CXS` are gone with it, and `setVictim` no longer pins the lane: it ends on a frame
that is on screen for the whole card, so the catalog-wide "a lane lives and dies with its Pod" rule
has nothing to bind here. The Pod fade stays, it just no longer drags a lane with it.

Route 748 -> 364 units, so the evict span went 2562 -> 1709ms. **`duration` was deliberately NOT cut
to match**, unlike on node-drain. On this card the durations are reading time, not motion time: three
of the five steps animate nothing at all, `condition` gives 2000ms to 383 characters, and the evict
narration GREW to 380 characters in the same pass. 2700 against 1709 is the same relationship rank
already has (2200 against 1300).
```

### technical pass (2026-08-03)

```
Checked against the Node-pressure Eviction page and, for the toleration claim, the raw text of the
Taints and Tolerations page. Most of the card held up: the three ranking keys are the doc list in the
doc order, the "QoS class does not decide that order, it only estimates it" line is the doc's own
Note almost word for word, the 10s eviction manager period is right, the 5m
`--eviction-pressure-transition-period` default is right, and the toleration sentence is exact
(`The control plane also adds the node.kubernetes.io/memory-pressure toleration on pods that have a
QoS class other than BestEffort`). One caveat worth knowing if you re-verify it: asking a summariser
for that Note returned a confident and completely invented answer about the kube-system namespace.
Fetch the raw page.

THE ONE REAL GAP was the largest fact on the page and the card did not have it anywhere. The doc's
own second paragraph: `Node-pressure eviction is not the same as API-initiated eviction. The kubelet
does not respect your configured PodDisruptionBudget or the pod's terminationGracePeriodSeconds.`
That is the whole difference between this card and `cluster-node-drain`, which sits in the same
subcategory and spends five steps on PDB gating, so a reader crossing from one to the other would
reasonably conclude a PDB protects against this. Both halves are now in the evict narration, and the
desc carries the short version (`no PodDisruptionBudget applies here`, 412 -> 453 characters).

Also added: the Pod does not merely get `removed locally`, the Kubelet sets `phase` to Failed with
reason Evicted, which is why evicted Pods sit in the API afterwards.

CHIP TIMING. `victim` read `BestEffort Pod evicted` from step entry while the SIGKILL was still on
the wire. It now holds what rank left it (`BestEffort Pod selected`) and turns over on
`kill.arrivalMs`, the same beat the Pod pulses and fades. `at(...)` as everywhere else, imported
from `cluster-kit` since the twelve local copies were retired on 2026-08-04.

DEAD CONSTANTS. `PANEL_R` and `PANEL_B` were declared and read by nothing, the shape CLAUDE.md says
not to re-add. Dropped, with the measurement folded into the header comment together with the thing
it constrains: the panel bottom is 280 at 1100x800 and the chip column starts at 296 (the 2026-08-04
COL_BOTTOM migration to 456 moved it, this paragraph said 300 until then), so there are 16 units of
headroom and NO narration on this card may pass 383 characters. That budget is why the
evict rewrite landed at 380 rather than at the 408 it wanted.

THE API BLOCK, added the same day on the author's call after being raised as an open finding. Three
of the five steps say the Kubelet writes to the API and the card drew no API at all, so that traffic
was narrated and never shown, and two of those steps animated NOTHING (`condition` and `relieve` both
had span=0 and 900 with zero packets, which no check can see: `check-duration` only asks whether a
step outlasts its own motion and a step without motion passes trivially).

`API` is 232 wide at `CONTENT_R - API_W` = 908..1140, so it right-aligns with the ladder AND with the
Node frame below it, and the Kubelet stays centred on the spine that owns the drop into the Node. The
whole left half of the top row stays empty because that is the narration panel's corner, which is the
L-shaped safe zone being used rather than fought.

ONE lane, one direction, at the shared face midpoint y=80. No step on this card names anything coming
back from the API, so a return pair would be decoration, which is the rule stated the other way round
from how it usually bites. Three steps ride it: `condition` (MemoryPressure=True), `evict` (the Pod
status after the kill) and `relieve` (MemoryPressure=False). `detect` and `rank` stay silent on it and
that is correct, both are local to the Kubelet.

Ordering inside `relieve` was wrong on the first cut and the author caught it: the two survivors
pulsed and the PATCH left the Kubelet on the same beat, which gives the eye two places to look at
once. The packet now goes at `BEAT.afterPulse`, which is the catalog up-arrow rule (pod acts first,
packet leaves at 800) and is also the sentence order, since the Kubelet flips the condition BECAUSE
the memory freed up. Pulse runs 0..900, the ball fades in at 600 and moves at 800, so the tail of the
pulse and the head of the ball still overlap by design, the way every other card in the catalog
staggers them. Span 1260 -> 2060 against `duration: 2200`, and the last thing that CHANGES is the
chip at the ball arrival on 1500, so there is still 700ms of settle before the step wraps.

Ordering inside `evict` matters and is not arbitrary: the status report leaves at
`kill.arrivalMs + BEAT.afterHop`, after the SIGKILL lands, because the phase cannot be reported Failed
until the Pod is actually dead. Both condition chips now turn over on the PATCH arriving rather than
at step entry, for the same reason the victim chip does: a Node does not carry MemoryPressure until
the write reaches the API that stores it. Spans: condition 0 -> 1260, evict 1709 -> 2142,
relieve 900 -> 1260, all inside their existing durations.
```

### vertical rework (2026-08-03)

```
`node()` draws its own label at `NODE_Y + 18` and the Pod row started at `NODE_Y + 18` too, so NODE-1
was printed on top of the first Pod. This is the trap written down in `scheme/CLAUDE.md` under the
Workloads layout canon, and it had been live on this card since the frame was laid out.

The Pod row moved to the family's `NODE_Y + 34` and the frame grew 140 -> 152 to pay for it, which is
the same frame height `cluster-node-drain` uses with the same 300 x 106 Pods: 34 of label padding,
106 of Pod, 12 of floor. The frame bottom stays on 624, so `NODE_Y` went 484 -> 472 and the frame
grew UPWARD, which is why the columns had to move too: `COL_BOTTOM` 460 -> 456, chips 300..460 ->
296..456, ladder 260..460 -> 256..456. Gap from the chip column to the frame is 16.

That leaves 16 units between the measured panel bottom (280 at 1100x800) and the chip column at 296,
down from 20. It is the tightest clearance on the card and it is why the 383 character narration
budget above is not negotiable: the panel is the thing that would close it.

The lane shortened with the frame move (364 units, evict span 2562 -> 1709 before the API packet was
added back on top of it). `duration` was left alone throughout, see the lane note above for why.

**The victim fade is the one place this card leaves the catalog token, `VICTIM_FADE = 1200` against
`FADE.out = 700`.** Author call, on the reading that the kill happened too fast. It is also the more
correct choreography: the fade and the pulse both start on `kill.arrivalMs`, and at 700 against a
900ms pulse the Pod reached its end shade two hundred milliseconds BEFORE it finished blinking, so
the tail of its own pulse played on something that had already gone dark. At 1200 the Pod is still
near full at 0.91 through the middle of the pulse and settles at 1982, after it. The step span is set
by the status-report packet at 2142 either way, so nothing downstream moved. `FADE` is no longer
imported here, it had no other call site on this card.

The shade the fade settles ON is a separate decision, taken on 2026-08-04: see "the evicted Pod no
longer leaves a hole" below. The 1200 is unchanged by it.
```

### the QoS card is named on rank (2026-08-04)

```
`rank` has said since the technical pass that QoS class does not decide the eviction order, and the
catalog card that DOES own QoS (`workloads-pod-qos-classes`, in Workloads) was never named, so a
reader who wanted the classes themselves had nowhere to go. `See the Pod QoS Classes card.` is
appended: the catalog has two forms of this pointer, `covered in the <title> card`
(`cluster-delete-flow`, `cluster-node-drain`, `cluster-kubelet-sync-loop`) and the shorter
`see the <title> card` (`workloads-pvc-stickiness`), and only the short one fits the budget below.
The card lists Pod QoS Classes among its own sources, so the pointer only says on the canvas what
the source strip says under it.

rank 341 -> 370 characters, inside the 383 ceiling, so `condition` at 383 is still the card worst
case and the panel bottom at 1100x800 is still 280 against the chip column at 296. Re-measured
2026-08-04.
```

### the evicted Pod no longer leaves a hole (2026-08-04)

```
`evict` and `relieve` pinned the victim wrapper to 0 and the fade animated it to 0, so from the
moment the SIGKILL landed the Node frame carried a block-sized empty slot in its left third, on a
card whose last step is about the OTHER two Pods still running. An absent block reads as a rendering
fault rather than as an absence, which is the catalog-wide rule under "A block that does not exist
yet dims, its lanes disappear". `setVictim` and the fade both land on `OPACITY.terminated` now, the
shade for "gone from the API", which is exactly what an evicted Pod is: the Kubelet sets phase Failed
with reason Evicted and the object stays in the API, which the evict narration already says.
`OPACITY` is imported from `cluster-kit.js` the way `cluster-node-drain` imports it.

Same conversion as `cluster-node-drain` and `cluster-graceful-node-shutdown`, all three on 2026-08-04.

WHAT WAS LEFT AT 0, deliberately: nothing. The only two opacity zeroes on the card were the victim
pin and the victim fade. The lane is not in the argument, because it ends on the Node frame top face
and the frame is on screen for the whole card (see the lane note above), so `setVictim` has had no
lane to pin since 2026-08-03.

THE STAND-IN HIGHLIGHT WAS ALREADY IN THE RIGHT PLACE, which is worth recording because it is the
trap that had to be repaired on `cluster-node-drain`. `rank` is the one step whose reduced branch
lights `pod1Box` in place of the pulse it cannot show, and `rank` leaves the Pod at full: by `evict`
the class is gone, because `pod1Box` is in `clearHL`'s key list and every `enter()` opens with it.
`evict` and `relieve` light the API, never the dying Pod. So nothing holds `.highlight` at the
terminated shade (`check-opacity` LIT) and the two paths carry the same class set
(`check-reduced` HIGHLIGHT), and the fade needs no `onfinish`. If a stand-in is ever added to `evict`,
it has to be dropped on both paths.

TIMINGS UNTOUCHED. The end value of a fade is not a duration: `VICTIM_FADE` stays 1200, the evict
span stays 2142 against `duration: 2700`, and the pulse still precedes the fade on `kill.arrivalMs`,
which is `check-opacity`'s ORDER rule.
```

---

## cluster-cpu-throttling

### layout (new card, 2026-08-04)

```
The deliberate TWIN of `cluster-oom-kill`: memory limit exceeded against CPU limit exceeded. It
copies that card's skeleton on purpose so the pair reads as a pair, and changes exactly one thing.
Same top row (`Kubelet` centred on the spine at 484..716, `Linux kernel` flush to CONTENT_R at
908..1140, request lane on 68 and answer lane on 92, wire label above the row at y=26), same
full-width Node frame with one Pod and one container box inside it, same two-per-row 532 wide chip
strip ending on 624. The sibling's five-row ladder in the right column (660..1140) is replaced by
the TIME SCALE, which is the whole reason the card exists: a 100ms period bar with its run portion
filled and its stall left empty says in one glance what four sentences of narration cannot.

The Node frame is the family value the four Node cards were corrected to on 2026-08-03:
`POD_Y = NODE_Y + 34`, `POD_H = 106`, `NODE_H = 152` (34 of label padding, 106 of Pod, 12 of floor).
`node()` draws NODE-1 at `y + 18`, so anything under 34 prints the frame label on the Pod. The frame
sits at 380..532 rather than the sibling's 388, because 152 is 8 taller than the sibling's 144 and
the chip strip still has to end on 624: `CHIPS_Y = NODE_Y + NODE_H + 16` solves to 380.

THE TIME SCALE IS THREE BARS AT 660..1140, STACKED, NOT SIDE BY SIDE. Side by side inside 480 units
gives three 150 wide bars whose 50% fill is 75 units, and the caption that says what the empty tail
is has nowhere to go. Stacked gives each period the full 480, a 240 unit fill and a right-aligned
caption sitting over the stall it names. Stacking also reads as one clock running down the page
rather than as three containers standing next to each other, which is what a row would have said.

`BAR_H 44`, `BAR_GAP 16`, tops on 176 / 236 / 296, stack bottom 340, axis caption baseline 166. The
gap to the frame at 380 is 40 units and the gap up to the top row at 120 is 46.

The bars are BARE `rect`s, not `box()`, and that is a check-geometry decision rather than a style
one. Three 480 wide blocks at y 236 and 296 land inside CENTRE-LOW's span (blocks below the overlay
bottom, node frames excluded), which would put the low content centre on 750 against a want of 600
on a card whose composition is centred on 600 by construction. `storage-volume-attach-limits` draws
its 24 attachment slots the same way for the same class of reason. The cost is that `check-palette`
never sees them either, so their colours are pinned in one frozen `BAR` block instead: the channel
list `125, 134, 255` is the cluster `--tint-base-rgb` from `styles.css`, copied rather than
referenced because an SVG presentation attribute cannot resolve a token reliably.

The scale is not ENFORCING before the `quota` step and that is a fact, not a flourish. With
`cpu.max` at its default `max 100000` there is no bandwidth enforcement and `nr_periods` is
genuinely 0, so the whole group rests at `OPACITY.pending` (declared, not working yet) and comes up
to 1 on `quota`.

It was first built to rest at 0 and appear on `quota`, and the rendered frames of steps `idle` and
`request` killed that: with the right column blank and the left column owned by the panel, the two
opening frames were two boxes and a Node band with a 480 x 164 hole between them, and `idle` is the
poster, which is the first thing anyone sees. Nothing in the gate says a word about it. The dim
rest keeps the composition stable from frame one and still spends the `quota` step's beat on the
scale coming to life.

TWO RELATIONSHIP LINES, NO ARROWHEADS AND NO BALLS. Whether a lane is a route or a relationship is
decided by the card's own words, and no step here names anything travelling from the Kubelet into
the Node frame or from the kernel into the scale. The Kubelet lane leaves the Kubelet bottom
midpoint (600, 120) and lands on the Node frame top midpoint (600, 380), the shape the four Node
cards were converted to on 2026-08-03. The scale lane leaves the kernel bottom midpoint (1024, 120)
and jogs on `JOG_Y 148`, the midpoint of the 120..176 band, onto the bar stack top midpoint
(900, 176). It lives INSIDE the scale group, so it cannot outlive what it points at.

The panel budget: right edge x<=397 and bottom 195 / 235 / 280 over 1600x1000 / 1280x860 / 1100x800,
worst on the `observe` step, the longest narration at 386 characters. The Node frame top is 380 and
nothing else on the card is drawn left of 420 above it, so the clearance is 100 units and the
per-step ceiling is roughly 550 characters (the sibling card measures about 0.6 units of panel per
character). Re-measure with `VW=1100 VH=800 node overlay-measure.mjs` after any prose edit rather
than trusting that number.
```

---

### before `const RUN_W = SCALE_W / 2;`

```
THE WORKED EXAMPLE, and the arithmetic every number on the card is derived from.

  requests.cpu 250m, limits.cpu 500m, one busy thread, the default 100ms period.
  quota          500m x 100ms      = 50ms of run time per 100ms period
  cpu.max        50000 100000      (microseconds, quota first, period second)
  run portion    50ms of 100ms     = half the bar, RUN_W = SCALE_W / 2 = 240
  stall          100ms - 50ms      = 50ms per period
  three periods  3 x 50ms          = throttled_usec 150000, nr_throttled 3 of 3
  ten seconds    100 x 50ms        = throttled_usec 5000000, which is the 5 the metric reports

ONE THREAD IS THE POINT OF THE HALF FILL. The bar is WALL CLOCK, not CPU time, so with one runnable
thread on one CPU the two coincide and the fill lands exactly on the quota. A two-thread example
fills a quarter of the bar and a four-thread example fills an eighth, and either one makes the
picture say something the arithmetic beside it does not: a reader who divides 50 by 100 and gets
half would be looking at a bar filled to 12.5%. The multi-thread case is the more interesting fact
and it is kept, but in WORDS, inside the `throttle` narration where nothing on the canvas argues
with it: four busy threads empty the same 50ms budget 12.5ms in and stall for 87.5ms.

NO NUMERIC cpu.weight ANYWHERE, deliberately. The chip names the file and says what set it
(`weighted by requests.cpu 250m`) rather than printing a value, because the value is not one
number. The Kubelet computes CFS shares from the request (`MilliCPUToShares`, 250m -> 256) and hands
those to the runtime over CRI, and the shares-to-weight conversion belongs to the runtime, which
has changed shape at least once (`ConvertCPUSharesToCgroupV2Value` in opencontainers/cgroups is a
quadratic in log2(shares) today, and was linear before that). 256 shares is 35 under the current
formula and was 20 under the old one. A card that printed either would be making a claim about one
runtime at one version while presenting it as the general case. The kernel default of 100 IS
printed, because the kernel documents it.
```

### before `const SCALE_RELATION = [[KERN_CX, TOP_BOTTOM], [KERN_CX, JOG_Y], [SCALE_CX, JOG_Y], [SCALE_CX, SCALE_Y]];`

```
Why the scale hangs off the KERNEL and not off the Kubelet. `cpu.max` is what makes the kernel
account in periods at all, and the throttling decision is the kernel's alone: the Kubelet does not
learn about it until it scrapes `cpu.stat`, which is the last step. Hanging the scale off the
Kubelet would say the Kubelet runs the clock, which is the one thing the card exists to deny, the
same argument the sibling card uses for refusing to hang its ladder off any single block.

`check-geometry` OFFEDGE judges an endpoint against BLOCK faces, and the bars are bare rects, so
the (900, 176) end is invisible to it. That is not licence to be sloppy about it: 900 is the stack
midpoint by construction (`SCALE_CX`), so the line is centred on the thing it points at whether or
not any rule can see it.
```

### before `const scaleG = g({ id: 'timeScale' });`

```
The fill grows by ANIMATING THE rect WIDTH, which is a real WAAPI animation on an SVG geometry
property (verified in Chromium before the card was built: seeking a 0px -> 200px width animation to
50% reads back 100px). It is not a packet, so nothing in the packet canon applies to it, and
`check-opacity` never sees it because it touches no opacity. `check-duration` does see it: three
fills at 700ms each, staggered 700 apart, put the `throttle` span at 2100 plus the pulse, which is
why that step has the longest duration on the card at 3400.

Every `enter()` writes EVERY bar through `setBars`, exactly as every `enter()` writes every chip
through `setChips`. A bar left alone keeps the previous step's fill and its previous caption, which
on a time scale does not read as a stale value, it reads as a period that behaved differently.

The captions turn over on the beat that earns them, the `network-dns-ndots` shape: end state pinned
above the `ctx.reduced` guard, played path rolled back to what the step starts from, turnover on
the fill finishing through the shared `at(...)`. `spend` holds `quota spent 50ms in` until the fill
reaches the middle of the bar, and `throttle` turns `cpu.stat` over once per period as each fill
closes, 1 of 1, 2 of 2, 3 of 3, because a counter reading 3 from step entry skips two thirds of
what the sentence describes. `frame-strip` cannot show any of this: it seeks and never fires
`onfinish`, so the frames show the rolled-back value. `check-reduced` passing is the proof.

`check-arrival` R2 reports one finding on this card and it is the documented blind spot, not a
defect: R2 samples at t=0 and compares against t=0 of the previous step, so a chip written on
arrival through `at(...)` always looks like an uncued change on the step AFTER the one that moves
it. `cpu.weight` turns over on `request`, where the chip IS lit, and the tool sees it at `quota`.
Do not close it by lighting `cpu.weight` on `quota`, which would point the eye at the one chip that
step does not touch.

`cpu.stat` deliberately does NOT move on `spend`, and that is exact rather than lazy. The kernel
increments `nr_periods` and `nr_throttled` from the period TIMER, when an interval elapses, so half
way through the first period both are still 0 whatever the quota has done. An earlier draft read
`nr_throttled 0 of 1` there, which claims a period has already closed on the step whose whole
subject is the middle of one.
```

### before `const pkt = topPacket(s, ctx, { from: KERN_X, to: KUBE_X + BOX_W, y: DOWN_Y, role: 'cluster' });`

```
The same lane, the same direction and the same shape as the `observe` step of `cluster-oom-kill`,
on purpose: on both cards the last step is the Kubelet finding out about something the kernel
already did. There the carrier is PLEG relisting a dead container, here it is cAdvisor reading the
cgroup files, and both land on the Kubelet, which lights on arrival rather than at entry.

The Pod does NOT pulse here and does NOT fade anywhere on this card. The sibling dims its whole Pod
group to `OPACITY.terminated` on the kill. This one never touches Pod opacity at all, because the
container surviving IS the answer to the question the description asks, and a Pod that flinches
when a metric is scraped would be saying that something happened to it.
```

---

### poster

```
One sentence: the budget runs out before the period does, every period, forever.

Three identical outlined blocks in a row (80 x 92 at x 20 / 120 / 220, y 44..136), each one a 100ms
CFS period, each carrying the house accent idiom, a `rect fill="currentColor"` at `opacity="0.9"`
filling exactly the LEFT HALF of the block with the right half left empty. Block fill 0.05, inside
the 0.03 to 0.10 band the siblings use, block width inside the 76 to 80 range.

The accent is FLUSH: inset 2 on the left, top and bottom so it meets the block's own stroke, and
its right edge lands exactly on the block midpoint (x + 2, width 38 of 80). The first build inset
it 6 all round with `rx="3"`, and on the montage that read as a smaller bright block floating
inside a bigger one rather than as a block filled half way from the left, which is the entire
sentence. It is the only detail of this poster that the file cannot show you: both versions are
legal SVG and only the tiled screenshot tells them apart.

The repetition is the whole sentence, which is why there are three and not one: one filled block is
a progress bar, three identical ones are a rhythm that does not end. Nothing else is drawn. No
clock, no threads, no Node frame, no ladder, no arrowhead (no poster in the catalog has one). The
card's Kubelet, kernel, Pod and chips are what makes it a card and would be illegible at the 200px
the grid actually renders.

Emphasis is deliberately EQUAL across the three, which is the one place this poster departs from
the single-brightest-element rule. Brightening one period would say that period was special, and
the claim is the opposite.
```

---

## cluster-oom-kill

### layout (R5-a, 2026-07-27)

```
Layout C (no left column fits above the Node frame). Chips went from four across (258) to TWO per
row at 532, killing the memory.current / container state overlaps; the frame moved to 388..532 to
pay for the second row (548..624). The wire label moved above the top row: at y=146 it spanned
574..877 and the spine cut it.

**Reversed 2026-08-03.** R5-a had ended NODE_CONNECTOR on POD_Y, the Pod shell, on the argument that
the Pod is what reacts. It now ends on NODE_Y, the Node frame top face midpoint, and the spine moved
from x=580 to CX so that drop is straight. Which container the kill lands on is carried by the pulse,
not by an arrowhead reaching inside the frame. This is the same correction the four sibling Node
cards took, and it moved the whole top row 20 units right (Kubelet 484..716, kernel 772..1004).

The kernel block right-aligns on CONTENT_R (908..1140) since 2026-08-03, so its right edge is level
with the right chip column, the ladder and the Node frame. It used to sit a fixed 56 units from the
Kubelet and end on 984, flush with nothing.

**The kill dims the whole Pod group, shell included.** It used to fade only the inner container box
on the argument that the sandbox survives, and a dimmed inner box inside a full-brightness frame
read as a half-finished render rather than as a statement. Opacity now lives on `podGroup` and
never on `containerBox`, or the two multiply into a shade that is in no vocabulary. The cost is
real and accepted: the picture no longer says the sandbox outlives the container. That fact moved
into the restart step, which carries it in words ("inside the same Pod sandbox", "the Pod IP and
Linux namespaces are preserved") where nothing on the canvas argues back.

The panel budget: worst case x<=397, y<=280 at 1100x800 on the oomkill step, 395 characters since
the 2026-08-04 trim, against a frame top at 388. It was y<=329 at 477 characters.

**No relationship line to the ladder, deliberately.** The tie is only honest when one drawn block
owns every row. Here `allocate` is the workload, `cgroup` and `OOMKill` are the kernel, `observe`
and `restart` are the Kubelet: three owners in five rows. Hanging the ladder off the Kubelet would
say it performs all five, which is exactly what the card exists to deny.
```

---

### before `const create = routePacket(s, ctx, NODE_CONNECTOR, { role: 'cluster' });`

```
Kubelet creates the new container on the node (connector) and rewrites its cgroup
(top arrow to the kernel, a beat after so the two signals read as near-simultaneous,
not chained). The container pulses and re-materialises on arrival.

The connector now stops on the Node frame rather than the Pod shell, so this route is 20 units
shorter than it was and every ball on it lands sooner. routeDur is length-based, so re-read the
span before assuming a timing here is unchanged.
```

### before `const pkt = topPacket(s, ctx, { from: KERN_X, to: KUBE_X + BOX_W, y: DOWN_Y, role: 'cluster' });`

```
Review stage 2.4 family D listed the `observe` step here as a return the narration promises and the
motion never delivers. DECLINED 2026-07-30. What the step animates IS the claimed return: PLEG spotting
the dead container travels kernel -> Kubelet on the lower lane, which is the answer lane of this pair
and the correct direction. The other movement the sentence names, Kubelet PATCHing the container status
to terminated, goes to an API this card does not draw, and the Kubelet sublabel already accounts for it
in words (`PLEG + status patch`). A return has to have somewhere on the canvas to go.
```

### the oomkill step writes every chip (2026-08-04)

```
`oomkill` set no chip at all, so all four carried the cgroup step's values, and `container state`
read a bare `Running` beside a container block already saying `OOMKilled · SIGKILL` and a ladder row
saying the kernel SIGKILLs the container. The value itself is not wrong and was NOT turned over
early: `containerStatuses[].state` really is still Running until PLEG relists and the Kubelet
PATCHes, which is exactly what the observe step is about. So the value stays and now says why,
`Running · not yet observed`, and observe turns it over to `Terminated · OOMKilled · 137`.

The other three are written at what is true at the instant the killer fires: `256Mi / 256Mi · at
limit` (usage IS at the cap, which is why it fires), the oom_score_adj (a standing value on this
card, it never changes, though the string it carries grew later the same day) and restartCount `0`
(it increments on restart). Those were the values being carried anyway, so nothing the reader sees
on any later step moved.

Two gaps of the same family were LEFT OPEN here, both pre-existing: `observe` writing only
`container state`, and `restart` never writing `oom_score_adj`. Both closed the next day, see
"setChips closes the last two chip gaps" below.

`check-arrival` R2 will now report `container state` changing on `oomkill` without a highlight. That
is deliberate: the state has not changed, only the caveat printed next to it, and lighting the chip
would point the eye at the one thing this step does not do.
```

### setChips closes the last two chip gaps (2026-08-04)

```
One `setChips(s, { mem, state, restarts })` writes all four chips and every step calls it, idle
included: the shape `cluster-kubelet-sync-loop` and `cluster-node-pressure-eviction` already use.
`oom_score_adj` is not a parameter because it is a standing value on this card, so the helper writes
the module constant.

What each step now says, and why. `observe` used to leave `memory.current / max` at `256Mi / 256Mi ·
at limit` beside a container the same step calls terminated. It reads `near 0 / 256Mi · processes
killed` there: the SIGKILL took the processes and their charged pages went with them. It is `near 0`
rather than `0` on purpose, because a terminated container's cgroup outlives it until the Kubelet
garbage-collects it and still holds residual charge, and a flat `0` would be one of the false
absolutes this project keeps paying for. The chip is lit, because the value changed and a real
change with no cue is `check-arrival`'s R2. `restart` used to skip `oom_score_adj` entirely.

TWO DEFERRED TURNOVERS came with it, both the `network-dns-ndots` shape: end value pinned above the
`ctx.reduced` guard, played path rolled back to what the step starts from, turnover on `arrivalMs`
through the shared `at(...)`.
  - `observe` holds `container state` at `Running · not yet observed` until the PLEG relist result
    lands on the Kubelet (`pkt.arrivalMs`, 700ms). That is the whole subject of the step, and the
    chip used to announce the answer at step entry. Sampled live: it flips between 600 and 800ms.
  - `restart` holds the container sublabel AND the three moving chips at what `observe` left until
    `create.arrivalMs`, the same beat the Pod pulses and fades back in. Pinning them at entry put a
    running container with `restartCount 1` on screen while the box was still a 0.12 ghost. The
    sublabel is deferred WITH the chips deliberately: moving one and not the other would have put
    `using 120Mi of 256Mi` on the box beside a chip reading `near 0`.

The oomkill narration paid for the chip work. 479 -> 395: the ranking table
`(Guaranteed -997, BestEffort 1000, Burstable 3 to 999 by memory request)` was a whole sentence of
reference material inside a nine-line panel, and it moved onto the chip it belongs to, which now
carries `900 Burstable 3 to 999, Guaranteed -997, BestEffort 1000`. Measured 386 units against a name
ending at 102 in a 532 chip, so 33 units of clearance. Three longer phrasings were built and
measured first and all three came in at 413 units, 5 units clear of the name, which passes
`check-chipfit` and is unreadable. The opening sentence lost its restatement of the cgroup step.

**`by memory request` was kept in the narration on that pass and has since been removed, and the
reason it was kept was wrong.** The argument recorded here was that it is the derivation rather than
the table, so it belonged in the sentence while the numbers went to the chip. It is not the
derivation of `oom_score_adj`, it is the derivation of ONE of the three classes: Burstable scales
with the memory request across 3 to 999, Guaranteed is a flat -997 and BestEffort a flat 1000, and
neither of those two reads a request at all. Attached to a sentence about all containers it was a
false absolute of exactly the shape this project keeps producing when a qualifying condition is cut
to fit a budget. The narration now says the `oom_score_adj` is applied at container start **from the
QoS class**, which is true of all three, and the per-class detail (including the Burstable range that
IS request-derived) stays on the chip where the numbers already are.

One wording fix rode along: the narration said the oom_score_adj was `written` at container start,
while the restart step's comment fifteen lines below insists on `applied`, not `written`, because
the Kubelet passes it in the CRI create call and the runtime is what touches
`/proc/PID/oom_score_adj`. It says `applied` now.

RE-MEASURED after the trim. Panel bottom over 1600x1000 / 1280x860 / 1100x800: 195 / 235 / 280,
worst still on the oomkill step. It was 329. The frame top stays on 388, so the clearance went from
59 units to 108, and the frame was NOT moved up to spend it. The ceiling is unchanged at roughly
570: it is the longest narration that keeps the panel off a frame at 388, which is a property of the
frame and not of the current text.

ONE THING WAS LOST AND IT IS WORTH KNOWING. `inline-dump` finds chip values by matching
`setVal(s.refs.X, '...')` in the source, so every value that now reaches a chip through `setChips`
is invisible to it: this card's `memory.current / max` and `restartCount` rows print one value each.
That is not new and not specific to this card, `cluster-node-pressure-eviction` and
`cluster-kubelet-sync-loop` have the same hole, and it is the price of the helper the chip rule asks
for. To read the chip story on a card using `setChips`, walk the steps in a browser and read the
rendered chips instead.
```

---

## cluster-pod-sandbox-cri

### layout (R5-a, 2026-07-27)

```
**The lane leaves containerd since 2026-07-30, not Kubelet** (review stage 2.4 family C). Kubelet is
the one block on this card that never touches the sandbox: the whole subject is that it is a CRI client
and containerd is what materialises the pause container, pulls, creates and starts. All four steps that
ride the lane say so, and one said it in a code comment two lines above its own call. `SPINE_X` is
`RT_X + RT_W / 2`, and moving it right by 270 units added 244ms to every ball, which put all four
steps 131ms over their 2800 budget: they are 3100 now.

**Reversed and re-aimed 2026-08-03.** R5-a had ended the lane on the Pod sandbox's top midpoint,
turning at `BUS_Y = NODE_Y - 16`, and the comment beside it claimed that turn kept the lane "in the
gutter between the ladder and the chip column, so it still crosses nothing". That was false for the
whole run of the drop. containerd centres on x=782, which is inside the chip column (620..1140,
y 235..437), so the 326 unit vertical leg went straight through all four value chips, on every one
of the four steps that ride it. Nothing caught it: `check-geometry THROUGH` scores blocks, and a
value chip is not a block. **Where a lane turns decides what it crosses, and the only witness for
the chip column is a rendered frame.**

The lane is now a centred zigzag into the NODE: off the containerd bottom midpoint, across on
`JOG_Y = (TOP_BOTTOM + LADDER_Y) / 2`, then straight down x=600 onto the Node frame top midpoint.
The turn has to go above both columns, because 120..235 is the only horizontal band on this card
that is free of them, and the long leg then falls through the 490..620 gutter. Route length went
554 -> 523 units, both under the `routeDur` floor, so no span moved.

**Top row rebuilt right to left, 2026-08-03.** It was anchored on a fixed `KUBE_X = 420` with 30 unit
gaps and read as three boxes shoved together. CNI now ends on `CONTENT_R` and the row is derived
leftwards.

**404 is a hard stop, not taste**: the panel measures x<=397 at 1100 width at every height, and the
top row at y 40..120 sits inside that band, so seven units is the entire clearance, checked on a
1100x1000 render and not only on the number. The cap is a viewport-width effect (the panel reaches
its own max width), not a text-length one, so a longer narration cannot eat it.

Which means the room for the arrows could not come from moving left, and had to come out of the
BOXES. They carried 70 to 95 units of dead padding per side against measured widest inner labels of
60 (Kubelet), 90 (containerd `CRI gRPC server`) and 66 (CNI `veth + IPAM`). Widths went
200/280/180 -> 180/210/180, leaving 60/60/57 per side, and `TOP_GAP` went 30 -> 83. Each call and
return lane pair now has better than twice its old run. `SPINE_X` follows containerd to 772, which
shortened the zigzag by another 10 units, still under the `routeDur` floor.
```

---

### before `const shellEl = podShell({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod sandbox', sublabel: ' ', containers: 0, role: 'workloads' });`

```
The Pod sandbox: shell holds the pause container (created at RunPodSandbox)
and the workload container (created at CreateContainer, started at StartContainer).
Centred on CX, under the point where the zigzag enters the Node frame.
```

### before `const packetLayer = g({ id: 'packetLayer' });`

```
Z-order canon: packetLayer rides above the static wires but below the
blocks, so the ball reads on its connector and arrival is told by the pulse
(matches every other node card; the center connector travels in open space).
```

---

## cluster-scheduler-decision

### layout (R5-a, 2026-07-27)

```
The Cluster exemplar, rebuilt on Layout A so the rest of the category has a shape to copy: actor row
40..140 clear of the panel, pipeline ladder in the LEFT column (60..540, was centred at 400..800),
state chips in the RIGHT column (660..1140 at 480 wide, were 240 wide at 900..1140 with the whole
left band under the panel empty), candidate Node row and its verdict chips full width at the bottom.
Chips share the ladder's row rhythm (ROW_H 32, ROW_GAP 12) so the two columns read as one grid.
API_TO_CHAIN turns at JOG_Y and lands on the ladder's top midpoint.
CENTRE still passes because the chip strip pools EVERY .scheme-chip: the ladder rows (60..540) and
the verdict chips (60..1140) keep the strip centred on 600 with the value chips on the right.
Three packets were still on the coordinates of a much older top row (380..440 and 760..820) and flew
over blank canvas: they now use SCHED_R / API_X / API_R / ETCD_X, the same numbers as their arrows.
queue: 2200 -> 2800ms.
```

---

### API_TO_CHAIN is a relationship, not a route (2026-07-31)

```
It shipped as a pathArrow carrying a routePacket on the queue step: the watch event hopped
Api -> Scheduler on the return lane and then a second ball dropped from the API down into ladder
row 1. That second ball was wrong twice over. The queue, filter and score stages are the
Scheduler's OWN work and nothing travels from the API to reach them, and the arrowhead made a
legend for the scheduling cycle read as a traffic destination. It is now a relationPath: no
arrowhead, no ball, stroke-opacity 0.45, and it states only that the cycle below works on the Pod
objects the API holds. queue span fell 2300 -> 1260ms against its unchanged 2800ms duration.

The turn moved JOG_Y 200 -> 180, the exact midpoint of the API bottom face (140) and the ladder
top face (220), on the author's call that the horizontal run should sit equidistant from both
rather than hugging the ladder. It ends ON the ladder edge at 220 now, not 2 short of it: the 218
was clearance for an arrowhead that no longer exists.

The cost is measured and accepted, not overlooked. The narration panel bottom at 1100x800 is
exactly 180, so at the NARROWEST viewport the leftmost ~97 units of the horizontal run (x 300..397)
and the corner turn itself pass behind the panel, and the line reads as emerging from under its
bottom-left edge. At 1280 and wider (panel bottom 150 and less) the whole route is clear. The two
constraints are mutually exclusive here: the equidistant point IS the worst-case panel bottom.
JOG_Y=190 would clear every viewport at 50/30 instead of 50/50, and is the fallback if the panel
ever grows.

Narration length is therefore load-bearing on this card. Panel bottom at 1100x800 goes 155 -> 180
-> 205 in one-line steps, and 205 swallows the turn entirely. The 2026-07-31 text pass was held to
that ceiling: bind was drafted at 275 characters, measured 205, and was cut to 245. Measure with
overlay-measure.mjs at 1100x800 after ANY narration edit here, not at the default 1600.
```

---

### the commit ack, and why score lights the Scheduler (2026-07-31)

```
Two findings from the same read that produced the relationPath above, both closed the same day.

The ETCD -> Api return lane at BACK_Y wore an arrowhead that no ball had ever ridden: the exact
defect the API_TO_CHAIN line was just cured of, one row up. It was NOT demoted to a relationPath.
The four top-row lanes are two mirrored request/answer pairs, and sinking half of a pair is what
docs/CARDS.md#storage-volume-detach-on-node-loss argues against, because the surviving half then
reads as the senior lane. Instead the answer was drawn: bind now runs three hops, POST -> persist
-> commit ack, chained on arrivalMs + BEAT.afterHop like every other chain in the catalog. rv=903
on the persist wire was always etcd ANSWERING, so the ball carries a value the card already showed.
The narration had to name it or the lane would not have earned a ball ("which acks the Raft
commit"), and naming it inside the panel-height ceiling cost "in its cache" from the assume clause.
span 2060 -> 2860, so duration 2400 -> 3000.

score did not light the Scheduler while filter did, on two steps that are equally the Scheduler's
own internal work and neither of which moves a packet. On a step with no motion at all the
highlight is the entire beat, so the card was reading as if the Scheduler went idle to do its
scoring. One line, above the guard, so both paths carry it.
```

---

### text pass (2026-07-31)

```
queue: "lands on the Scheduler queue ... begins the per-pod cycle" -> "reaches the Scheduler on its
watch ... pops it off the active queue and runs one scheduling cycle". per-pod cycle was invented
vocabulary, and cluster-pod-priority-preemption already says "runs the scheduling cycle", which
is also the upstream name.
filter: added that a large cluster stops filtering once enough Nodes fit (percentageOfNodesToScore).
"evaluate every Node" was a naked absolute that is only true at this card's four-Node scale.
score: "the values are weighted-summed" -> "the weighted sum is the final score". duration 1400 ->
2200: it was the shortest step on the card, carries the densest text, and has no motion at all, so
reading time is the only thing setting it.
bind: added the assume step, which is why the next Pod in the queue already sees Node-4 as taken,
and the commit ack that earns the ETCD -> Api lane its ball (see the section above).
placed: "Node-4 sees the Pod through a filtered watch" -> "The Kubelet on Node-4 watches ...". A
Node does not watch anything, its Kubelet does, and the Scheduler box one row up is the card's own
example of an actor that watches.

desc: "filters out EVERY Node that cannot fit it" -> "filters out THE Nodes that cannot fit it".
Caught by the internal-contradiction pass over the whole card after the filter narration grew its
early-stop clause: a scheduler that stops once enough Nodes fit does not filter out every unfit
Node, so the summary and the step disagreed the moment the step was corrected. 456 -> 452 chars.
The desc needed nothing for the assume step or the commit ack, and got nothing: it is a summary,
and a claim added there has to be carried by a step.

Worth recording that the desc is what CONVICTED the placed narration. It has said "the Kubelet on
the chosen Node picks the Pod up on its own watch" since it was written, while the step said
"Node-4 sees the Pod". Two carriers of one fact, one of them wrong, and reading them side by side
is the whole technique.

NOT changed: chain row 2 keeps "fail predicates". It is legacy vocabulary next to "Filter plugins",
but cluster-pod-priority-preemption uses the same word and kubernetes.io still glosses Filter
plugins as the successor to predicates, so changing it here alone would buy cross-card drift.
```

---

### poster

```
The scheduler decision: the Pod is scored against three candidate nodes, then BOUND to the
highest-scoring winner (a bright dashed link) while the passed-over nodes get the same dashed
links but dim, with shorter score bars. The winner reads through its bright box + score bar.

The three links were DIAGONAL until 2026-07-30. They are a trunk and bus now: both losing lanes
leave the Pod bottom, turn 90 degrees at y=82 and drop into their own Node top face at its centre
(64 and 256), and the winner runs straight down. Unlike the leader-election poster, the turn cannot
land on a Node SIDE face here, because a lane reaching the left Node's right edge would cross the
middle Node on the way. Every lane ends on the Node top edge at 104, not short of it.

Three Nodes with the middle one winning, while the card scores four and binds to Node-4, the
rightmost. Raised 2026-08-01 and left standing, same reasoning as the leader-election poster: the
boxes are unnamed, and moving the win to an edge box would send the straight lane to a loser and
the turning lane to the winner. The poster says one Node wins on score, which is the sentence.
```

---

### the preemption card is named on score (2026-08-04)

```
The card walks filter and score and never named `cluster-pod-priority-preemption`, which is the
same Scheduler one stage further on: when filtering leaves no feasible Node, PostFilter preempts.
`See the Pod Priority and Preemption card.` is appended to `score`, 208 -> 250 characters.

It went on `score` rather than on `filter`, where PostFilter belongs by subject, purely for the
character ceiling recorded above. `filter` is already the card worst case at 248 and one more line
takes the panel from 180 to 205, which swallows the API_TO_CHAIN turn. Measured, not assumed:
`PostFilter preemption is covered in the Pod Priority and Preemption card.` on score (282 characters)
gave 205 at 1100x800 and was cut. At 250 the worst step is still `filter` and the worst bottom is
still 180.
```

---

## cluster-static-pods

### before `const API_X = CX - BOX_W / 2, API_R = API_X + BOX_W;     // 484..716`

```
Three tiers, not the Node family's two. The card has to draw the API band and the Node band at once,
because its whole subject is the asymmetry between them, so tier 1 is the API plus kubectl, tier 2 is
the mirror Pod, and tier 3 is the Node frame on the family numbers (NODE_Y 380, NODE_H 152,
POD_Y = NODE_Y + 34, POD_H 106) with the chip strip two per row at 548..624 underneath.

Measured panel over 1600x1000 / 1280x860 / 1100x800: x<=291 y<=160, x<=378 y<=193, x<=397 y<=230.
The worst is the drain step, 322 characters. Nothing in tiers 1 and 2 starts left of 450, so the
panel cannot reach them at any length. The only block left of 420 is the manifest file at y=427, and
what actually has to be cleared is the Node frame at 380, so the character ceiling is 390: the same
number cluster-node-drain carries, for the same panel geometry and the same frame top.

WHY kubectl IS ON THE RIGHT. The API is centred on CX so the mirror Pod hangs straight below it and
the Kubelet's create lane is one vertical drop with no jog, both endpoints on face midpoints. That
leaves 420..484 for a 232 wide box on the left, which is 64 units, so the only left slot is
cluster-node-drain's 196..428 and that is 86% under the panel at 1100x800. Its OCCLUDED finding is a
recorded author decision on THAT card, not a licence to add a second one, so kubectl went right
(772..1004) and check-geometry is clean on all six rules. The cost is that the top row reads right to
left. It carries an arrowhead per direction and the wire label sits over the gap at x=744, so the
reading is unambiguous, and this is the trade cluster-node-drain explicitly named and declined for
its own layout because the drain row could not be reversed without reversing its subject.
```

### before `const KUBE_TO_MIRROR = [[CX, BOX_TOP], [CX, MIR_BOTTOM]];`

```
THE ASYMMETRY IS THE CARD, so it is built into the lanes rather than stated in prose. Four routes and
one relationship, and NOT ONE of them points from the API down at the Node:

  Manifest file -> Kubelet   the Pod spec off the disk. The Kubelet is the actor (it scans), but what
                            TRAVELS is the spec, so the arrowhead is on the Kubelet.
  Kubelet -> static Pod      the container being started, and restarted on the edit step.
  Kubelet -> mirror Pod      the create, and the recreate after the delete. UP, out of the Node band.
  kubectl <-> API            one lane per direction, mirrored on LANE_DY, for the delete and the drain.
  API .... mirror Pod        a relationPath. No arrowhead and no ball on any step: the API HOLDS the
                            object, it never drives it. If the delete ever rides this line the card
                            stops being true.

The delete on step 4 therefore never travels below the API. It lands on the API, and what the reader
sees next is the object under it going dark, which is what a delete of a mirror Pod actually is. The
Kubelet then puts it back up its own lane, and the container in the Node band does not move once.

The lane from the Kubelet crosses the Node frame's top edge. That is not a THROUGH finding: a node
frame is a container, and check-geometry excludes isFrame blocks from that rule by construction.
```

### before `function setStage(s, { file, pod: podOn, mirror }) {`

```
Three blocks come into existence on three different beats, and their lanes with them, so all six are
pinned in ONE pass. A block that is not there yet holds OPACITY.pending and says so in its sublabel
(`no file yet`, `not started`, `not in the API yet`) rather than being removed, because removing it
leaves a block-sized hole in a row that is on screen for the whole card. Each lane takes the shade of
the fainter of its ends: the spec lane follows the file, the run lane and the create lane follow the
Pod each one lands in, and the API tie follows the object it holds. The first draft left all four
lanes at full and the render is what showed it: three arrowheads at full strength pointing into
ghosts. No rule sees this.

ONE lane is deliberately exempt, on the delete step. The mirror goes to OPACITY.terminated and the
API tie goes with it, but the Kubelet's create lane stays at full, because it is the lane the
recreate rides a beat later and a lane carrying a ball has to be on screen for the flight. The
catalog rule that an absent block's lanes go to 0 is about a lane with nothing on it.
```

### before `const MIRROR_FADE = 1200;`

```
1200 rather than FADE.out (700) for the reason cluster-node-drain records: at 700 the block is gone
200ms before its own pulse has finished and the deletion reads as a cut. It is the same constant that
POD_FADE on cluster-node-drain and VICTIM_FADE on cluster-node-pressure-eviction carry.

STEP 4 IS THE LONGEST STEP ON THE CARD and its 4700 is not padding: request 700, answer home 1500,
the mirror pulses and dissolves from 1600, the recreate leaves at 2900 and lands at 3600 with a pulse
behind it. anim-dump reports span 3700.
```

### before `const [mirrorPod, mirrorBox] = mkPod('mirrorPod', MIR_X, MIR_Y, 'static-web-Node-1', 'not in the API yet');`

```
THE MIRROR POD NAME. Upstream suffixes the mirror Pod with the node hostname and a leading hyphen
(`static-web-my-node1` in the task page, where the node is `my-node1`). This catalog's Node is
`Node-1` by a settled decision in terms.json, so the name is `static-web-Node-1`: the suffix is
visibly the Node name, which is the point of the sentence, and both linters read it as the catalog's
own spelling. Writing `static-web-node-1` would put a bare lowercase `node` into narration prose,
where check-terms is right to fail it.

CHECK-ARRIVAL REPORTS TWO R2s HERE AND BOTH ARE THE TOOL'S DOCUMENTED BLIND SPOT. It samples chips at
t=0 and compares against t=0 of the previous step, so a chip that turns over mid-step through `at()`
looks like an uncued change on the NEXT step. `static Pod` is written on arrival on `kubelet-starts`
and on `edit-file`, and those are the two steps that carry its highlight. Do not "fix" it by lighting
the chip on `mirror` or on `drain`, where nothing happens to the container.
```

### before `narration: 'A drain evicts or deletes the Pods on Node-1 and skips every mirror Pod, because removing one through the API would stop nothing.`

```
THE FIRST DRAFT OF THIS STEP CONTRADICTED STEP 4. It read `never a mirror Pod, which cannot be
deleted through the API server at all`, which is the kubectl drain reference's own parenthesis, and
the card had just spent a whole step deleting one through the API server. The reference means the
delete accomplishes nothing, not that it is refused, and the docs show the command reporting success.
The step now gives the mechanism instead of the phrase, and it agrees with the one clause the catalog
already carried on this subject (`Mirror Pods (the API record of static Pods) are skipped because
Kubelet would recreate them`, cluster-node-drain step 2).

Two other absolutes were cut on the same read. `moving the file out of the directory stops it for
good` was false, moving it back brings the Pod straight back, so it is `removes the Pod` now. And
`the file is nearly all it gets` was a weasel that said nothing: the documented limitation is that
the spec cannot refer to other API objects such as a ServiceAccount, a ConfigMap or a Secret, so the
sentence names those three and then says where the container's inputs do come from.
```

### poster

```
The sentence: the file on disk is the real thing and the API object is its shadow. A dashed Node band
in the lower two thirds holds two solid blocks, the manifest file and the container it starts, tied
by a dashed leg. The file carries the house accent (a currentColor bar at 0.9, the cluster-scheduler-
decision idiom) because the file is what the sentence is about, and the container carries the same
bar at 0.3. Above the band, over clear air and on one dashed leg, sits a single dim dashed block for
the mirror Pod (fill 0.03, opacity 0.45, the cluster-graceful-node-shutdown idiom for a block that is
a lesser copy). No arrowheads, like every poster in the catalog.

The inner blocks are 80 x 52 with fills 0.06 and 0.10, inside the 76 to 80 unit band the cluster
siblings use, and the dim block is 108 x 44 so the top third is not one small shape marooned in air.
The API server is NOT drawn. It would have needed a fourth block for a poster whose whole claim is
about two, and the dim dashed block already reads as "somewhere else, and lesser".
```

---

## cluster-pod-priority-preemption

### move: Workloads to Cluster / Control Plane (2026-08-04)

Preemption is the PostFilter stage of the same scheduling cycle `cluster-scheduler-decision` walks,
so the card was moved out of Workloads and renamed from `workloads-pod-priority-preemption`. It
sits immediately after Scheduler Decision Cycle in the catalog, and the old id still resolves
through `SCHEME_ALIASES` in `js/app.js`.

Three things changed with it and nothing else did: the kit import moved from `workloads-kit.js` to
`cluster-kit.js` (so the pulse now carries `CLUSTER_TINT`), the chips and packets took `role:
'cluster'` in place of `role: 'workloads'`, and the four Pods kept `role: 'workloads'` but gained
the family violet override (`--workloads-color: #c0b0ff`) that every other Cluster card with a Pod
on it already carries, so the resting stroke matches the pulse base. `WL` is a Workloads-kit export
and does not exist on `cluster-kit`, so the X grammar the card used through it is restated as local
constants with identical values: `CONTENT_L/R/W`, `CX`, `TOP_Y`, `BOX_H`, `TOP_BOTTOM`, `LANE_DY`,
`ROW_H`, `ROW_GAP`, `CHIP_H`, and the ladder band spelled out as `LAD_X = 660, LAD_W = 480`.
Geometry, steps, narration, chips, motion and poster artwork are unchanged.

### decision: two off-card actors in `bind` are deliberate (2026-07-29)

Family K of item 2.4 rewrote one sentence of this step (Kubelet starting the new Pod became "Pod
NEW then starts on Node-1"). The two that remain are deliberate. "The controller that owns Pod A
(Deployment, StatefulSet) creates a replacement" and "the Kubelet evicts Pods that are over their
requests first" both describe events explicitly OFF this card: a replacement placed elsewhere, and
a mechanism the sentence itself marks as covered separately. Neither points the reader at a box
that should be on the diagram. Do not file these again.

### layout (R5-a, 2026-07-27)

```
Layout C. Panel x<=397, y<=404, so the pipeline keeps 660..1140 and the chips are a two-across
bottom strip 532 wide. Four across was 258 and six of the eight chip strings collided,
including "Pod NEW · pri" against "2e9 (system-cluster-critical)".

Scheduler is 420..780, centred on CX. Everything the Scheduler sends down addresses slot 0: it
**TWO lanes since 2026-07-30, not one** (review stage 2.4 family C): `SCAN_LANE` from the Scheduler,
which is the preemption scan evaluating the Pods already on the Node, and `NODE_LANE` from the API,
which is what the API sets in motion once a write has landed on it (the graceful delete of the victim,
the start of the bound Pod). The Scheduler never reaches a Node, it writes to the API and the Node acts
on what it reads, so picking one owner would have lied about the other. Both share the drop, so they
read as one wiring tree with two sources. `delete` and `bind` went 3400 -> 4200. The paragraph below is
the R5 reasoning for the single lane it replaced.

is the victim it preempts (Pod A) and the slot Pod NEW is bound into. So there is ONE lane, not
a bus, and it doglegs at BUS_Y = NODE_Y + 12 to land on that slot Pod top midpoint. The wire
and the ball are built from that one LANE array.
```

---

### before `s.refs.pod1.style.opacity   = String(OPACITY.terminating);`

```
Family A, closed 2026-07-29 (SCHEME-2.4-PLAN.md, stage 2.1). The delete step used to pin Pod A to
0 and animate it 1 -> 0 on the eviction packet arriving, while the victim chip on the same step
read 'Pod A · Terminating' and the narration spent two sentences on the grace period it is serving.
A Pod inside its terminationGracePeriodSeconds is the most present thing on the diagram, not an
absence, so it now holds OPACITY.terminating and keeps its slot. It leaves the slot on the bind
step, where the narration says it has exited and its capacity has returned to the Node.

OPACITY was not imported in this file at all before the fix, which is why the step had no shade to
reach for.
```

---
