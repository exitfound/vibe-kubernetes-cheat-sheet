# Scheme card design notes: network

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

## network-client-ip-preservation

### before `const FLOW_Y = 410;                            // Client top lands at 372, clear of PANEL_B`

```
Preserving the client IP (viewBox 1200x640). The card answers one question: the backend Pod sees the
proxy address on its socket, so where did the client go, and how does it come back. The flow is a
straight left-to-right line, client -> edge proxy Pod -> backend Pod, with a header panel hanging
above the proxy holding the two headers the edge writes. What each hop actually CARRIES is the whole
point, so every ball wears a riding tag: the true source on the way in, the proxy source on the way
out, then the header, then the PROXY protocol preamble.

Standard contract: both Pods are shell + inner box; only Pods pulse; the client is infrastructure and
only lights; value chips never flash; packets stop at block edges.

GEOMETRY. Every wire and every packet is derived from a block edge, never hand-typed, so a block and
the ball that rides to it cannot drift apart.

Vertical: one spine, FLOW_Y, placed low so the client block (the only block on the left) clears the
narration overlay. The header panel is the only other thing that high, and it lives at x >= 415.

SUPERSEDED NUMBERS. This paragraph was first written against the blanket `x 0..399, y 0..300`, put
FLOW_Y at 372 and derived a client top of 334. The blanket was never a measurement and is wrong in
both directions, so those numbers are gone. The card now carries its own measurement instead, and it
is the only networking card that does:

```js
const PANEL_B = 355;    // measured worst case over 1600x1000 / 1280x860 / 1100x800
const FLOW_Y  = 410;    // client top lands at 372, clear of PANEL_B
```

Beware a name collision inside this card: `PANEL_B` is the narration panel bottom, while
`PANEL_BOTTOM = 190` is the bottom edge of the drawn header chip. They are unrelated.
See "The narration panel is measured per card" in `scheme/CLAUDE.md`.

Horizontal: the panel is centred ON THE PROXY, since those headers are what that Pod writes, and the
ownership line rises straight up from the proxy top centre. A 260-wide panel centred on PROXY_CX 545
spans 415..675, clear of the overlay with 16 to spare, exactly as in the Ingress card. The row then
spans CLIENT_X..POD_RIGHT = 40..1110 and the chip strip spans the same extent 1:1.
```

### before `const panelWire = relationPath({ points: [[PROXY_CX, PROXY_TOP], [PROXY_CX, PANEL_BOTTOM]], role: 'network', dash: '5 5' });`

```
Ownership marker, NOT a traffic path: the proxy is what writes these headers. No packet ever
travels it, so it is a plain dashed line with NO arrowhead, to read as an association rather than
a wire missing its ball.
```

### before `const srcChip   = valChip({ x: CHIP_X(0), y: CHIP_Y, w: CHIP_WS[0], h: CHIP_H, name: 'src at backend', value: 'none', role: 'network' });`

```
The four chips span the scheme 1:1, from the Client left edge to the backend Pod right edge, with
even 20px gaps. Widths are tuned to their content. What the backend sees is an OUTCOME of a
request, so those three read none until traffic actually flows. The edge mode is a property of the
setup, so it is true from the start.
```

### before `function clearHL(s) {`

```
The inner app boxes (proxyBox/podWBox) are listed so their .highlight is cleared every step:
clearPodHighlight only resets inline strokes, so without them a highlight set in a reduced-replay
block leaks into later steps, since reduced replay never runs the forward motion path.
```

### before `pulsePod(s.refs.proxy, ctx, 0);`

```
Up-arrow, the proxy is the sender: it pulses FIRST as it opens the new connection, and only then
does the proxied request leave, carrying the proxy address as its source. The backend pulses on
arrival.
```

### poster

```
Mirrors the diagram: client, edge proxy Pod, backend Pod on one line, with the two header bars the
edge writes docked above the proxy. No ball rides the legs: the poster states the composition, and
what each leg actually carries is what the steps go on to answer.
Geometry: everything is centred on the flow line y=118, the panel is centred on the proxy (cx 160)
and its link drops onto the proxy top edge, and every dash starts and ends on a shape edge.
```

---

## network-cni-invocation

### before `const RAISE = 64;                           // lift the whole diagram up ~10% of the viewBox height`

```
CNI plugin invocation (viewBox 1200x640). This is a control-plane handoff, not Pod traffic:
kubelet -> CRI runtime -> CNI plugin chain, and the allocated IP is wired back into the sandbox
namespace as eth0. The narration overlay owns the top-left corner, so the actor row
sits just below it at y352.

The CNI plugin is one dashed node container holding a vertical dashed spine that taps each plugin
row (bridge, IPAM, result). The CNI block is aligned so its top tap sits at the runtime row and
its bottom tap sits at the sandbox row, which keeps the ADD and result arrows dead straight (no
mid-run jog). One ball walks the whole chain across the steps:
  CRI -> bridge -> IPAM -> result -> sandbox, touching every block and every dashed segment.

Standard contract (matches network-model / network-service-clusterip):
  - only the Pod sandbox pulses, boxes + ladder light via .highlight, never pulse.
  - the same point array feeds the static wire and the packet that rides it.
  - one clear motion per step, all routed through ctx.register via the kit wrappers.
```

### before `const SBX = [360, 442 - RAISE, 240, 116];   // x, y, w, h  -> top 378  right 600  centre y 436 = PAUSE_Y`

```
Pod sandbox: compact, dropped below the runtime. Its pause/eth0 row sets the result-tap height so
the result arrow runs straight back into it.
Height is tuned so the block centre lands exactly on PAUSE_Y, where the result and join arrows
enter, so those arrows read as centred on the block (without moving them and grazing the CNI box).
```

### before `const cniBox = node({ x: CNI[0], y: CNI[1], w: CNI[2], h: CNI[3], label: 'CNI plugin' });`

```
CENTRE-LOW is OPEN here on purpose (recorded in the R5 pass, 2026-07-27, moved here 2026-07-30 so it
survives the working documents). The whole right half of the picture is this `node()` frame with
`chainList` rows inside it, and CENTRE-LOW counts neither frames nor chips: it sees only boxes, pods
and cylinders. The drawing is centred, the rule is not. Shifting the boxes it CAN see to make the
number go green would decentre the picture a reader actually looks at.
```

---

## network-conntrack-nat

### before `const POD_Y = 252, POD_H = 120;                    // both Pod shells stand on one baseline`

```
Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. The flow
runs client -> netfilter (NAT + conntrack) -> server Pod and back, on TWO stacked lanes so the
ball always has a matching arrow: the request lane (REQ_Y, arrows point right) carries the
outbound packet, the reply lane (REP_Y, arrows point left) carries the return. The NAT rewrite
happens INSIDE the netfilter box, so the ball fades at one edge and re-emerges at the far edge,
never sliding over it. netfilter is infrastructure: it lights, it never pulses. Only Pods pulse.
The four state chips sit in one plane under the block each describes: orig dst under the client,
ct state + reply under netfilter, translated (the backend address) under the server. The row spans
70..1130 and so centres on x=600, which is also why the server Pod ends on 1130 rather than 1110.
```

### before `const CHIP_L = CLIENT_X, CHIP_Y = 530, CHIP_H = 34;`

```
Chips sit in one plane with the blocks above. The outer two are flush with the pod footprints:
orig dst left edge = client Pod left edge (CHIP_L, 70), translated right edge = server Pod right
edge (CHIP_R, 1130). ct state + reply stay centred under netfilter (NF_CX, 590), which is why the
middle pair is not on the same rhythm as the outer two: they belong to the box above them, not to
the strip. orig dst -> client, conntrack bookkeeping -> netfilter, translated -> server.
```

### poster

```
The scheme in miniature, vertically centred: client Pod -> netfilter (holding a 2x2 conntrack
table mapping the original tuple to the translated one) -> server Pod. Two lanes carry the flow
with explicit chevrons: the request runs left to right on the top lane, the reply runs right to
left on the bottom lane, each with its own packet.
```

### before `setVal(s.refs.dirChip, 'reverse NAT, no walk');`

```
The chip is named `reply` and this step animates a REQUEST only, so its value has to stay true of the
reply rather than describe the ball on screen. It read `fast path`, which is the outbound path,
sitting next to the previous step's `reverse NAT`, and the reuse made it look like an answer to a
question nobody had asked. What is actually true of the reply on an established flow is that it takes
the same entry and the same reverse translation and no longer costs a rule walk.
```

---

## network-dns-coredns

### before `const CONTENT_L = 70, CONTENT_R = 1130;`

```
DNS resolution via CoreDNS (viewBox 1200x640). Standard contract: the client is a shell + inner
eth0 box; CoreDNS is a shell wrapping its plugin boxes; value chips never flash; only Pods pulse.
Packets ride the dashed wires edge-to-edge.

The client and the CoreDNS Pod share one center line (FLOW_Y) so the query lane enters CoreDNS at
its exact middle. Forward (query) and return (answer) traffic ride SEPARATE lanes offset by
LANE_DY around that line, so a lookup reads as a loop rather than a retrace.

Layout, rebuilt 2026-07-27 against the MEASURED panel (right <= 397, bottom <= 305, one of the
deepest in the catalog). The client column used to sit at y 175, which put its whole app box and
three quarters of its shell under the panel on the narrow viewports. The row now hangs below that
bottom (FLOW_Y 400, client top 325) and the CoreDNS Pod holds the right edge of the canvas
(CONTENT_R 1130), so the two blocks centre the content bbox on x=600 without a frame to lean on.
The query lane is 510 units as a consequence, which is why the query step carries a 3000ms budget.
resolv.conf hangs under the client and the two readouts stack above CoreDNS, so the chip strip
spans CONTENT_L..CONTENT_R and centres on 600 as well.
```

### before `const corednsShell = podShell({ x: DNS_LEFT, y: DNS_Y, w: DNS_W, h: DNS_H, label: 'CoreDNS Pod', sublabel: '10.24`

```
CoreDNS Pod centered on FLOW_Y (DNS_Y = FLOW_Y - DNS_H/2), so the query lane enters at its middle.
The shell is wrapped in a `g` (like podBlock) because pulsePod uses querySelectorAll, which only
matches descendants: pulsing the bare pod element would find its rect but never the .scheme-pod
itself, so the brightness half of the pulse would silently not fire.
```

### before `const pCache = box({ x: PLUGIN_X, y: PLUGIN_Y[0], w: PLUGIN_W, h: PLUGIN_H, label: 'Cache', sublabel: 'answ`

```
The three plugin boxes are spread wider apart and sit symmetric about FLOW_Y (kubernetes on the
line, cache above, forward below), leaving equal 37px margins to the pod label and sublabel. Their
offsets are held relative to the shell top (PLUGIN_Y), so moving the Pod cannot leave them behind.
Order is the CoreDNS plugin chain order (compiled into the binary, not the Corefile line order).
```

### before `clearHighlights(s, ['pCache', 'pK8s', 'pFwd', 'rcNS', 'rcSearch', 'rcNdots', 'queryChip', 'ansChip', 'clientBo`

```
clientBox is listed so its .highlight is cleared every step: reduced replay lights it in the
resolv / query / answer steps, and without clearing it here that highlight leaks into the
plugin-chain step (reduced replay never runs the forward path that would re-clear it).
```

### poster

```
A name goes in, an address comes out: the whole poster is one left-to-right transform on the flow
line y=90. A NAME is one unbroken bar (a single string), an ADDRESS is four short segments split by
dots (a quad), so the two ends read as different kinds of thing at a glance. Between them the
CoreDNS chain: three plugin bars, cache and forward dimmed to 0.45 and kubernetes brightened,
because that is the one that answers. Deliberately no Pod boxes: the siblings already open with a box-and-dashed-line row,
and the subject here is the transform, not the topology. The lanes carry no packet dots, so the
only circles left are the three tiny ones separating the address segments.
```

---

## network-dns-ndots

### before `const CONTENT_L = 70, CONTENT_R = 1130;`

```
Search domains and ndots (viewBox 1200x640). Everything hangs off one flow line (FLOW_Y): the client
Pod on the left, CoreDNS opposite it on the right, and the candidate ladder in the free top-right band
above CoreDNS. The two BLOCKS span CONTENT_L..CONTENT_R, which is what centres the content bbox on 600.

The lane used to be deliberately SHORT (190 units, CoreDNS pulled in close), on the argument that the
card is about how MANY queries are sent rather than how far they travel. Relaying it for R5 traded that
for the centring: the ladder is chips, so the only things the CENTRE rule can see are the Pod and the
CoreDNS box, and centring them means putting them on opposite margins. The lane is 380 units now, which
costs the walk step ~1.2s (9200 -> 10400). The four round trips still read as four identical beats,
which is the part that carries the lesson.

Forward (query) and return (answer) traffic ride SEPARATE lanes around the line, because the whole
point of the card is the cost of a ROUND TRIP: a miss is not just a packet out, it is a packet out
and an NXDOMAIN back, four times over.

The resolv.conf is drawn as its own chips (search + options) under the Pod, exactly as in
network-dns-coredns, rather than as a box whose sublabel repeats a chip that sits next to it.
The panel was re-measured 2026-07-27 over the three viewports the OCCLUDED rule uses: right <= 397,
bottom <= 230. The earlier note here read y=143 off ONE viewport, and the Pod top at 225 was clearing
it by luck rather than by margin. FLOW_Y 400 puts the Pod top at 335, well below the measured bottom,
and the resolv.conf chips take the space under it. A longer narration invalidates the measurement.
```

### before `const CANDIDATES = ['api.ns.svc.cluster.local', 'api.svc.cluster.local', 'api.cluster.local', 'api'];`

```
The real search list for a Pod in namespace ns is `ns.svc.cluster.local svc.cluster.local
cluster.local`, so a short name is tried against each in turn and only then as it was written.
Four candidates, so four round trips per address family.
```

### before `const namesChip = valChip({ x: CNT_X1, y: CNT_Y, w: CNT_W, h: RC_H, name: 'names tried', value: '0', role:`

```
The live cost readout, under CoreDNS on the right so that the two chip groups (resolv.conf on the
left, the counters on the right) span the content edge to edge. It counts NAMES TRIED, not DNS messages: getaddrinfo asks for A and AAAA in
parallel, so each name costs two queries on the wire. Calling this chip `queries` and showing 1 for
a hit would contradict the walk step, which tells the reader the IPv4 plus IPv6 total doubles.
The answer is the real DNS rcode, so NOERROR and NXDOMAIN read as the pair they are.
```

### before `function roundTrip(s, ctx, { start, lead, name, result, row = -1, pulseOnSend = true }) {`

```
One query as a full ROUND TRIP: the Pod pulses, the question goes out on the forward lane, CoreDNS
lights on arrival, and the reply comes back on the return lane. Returns the ms at which the reply
lands, so the caller can chain the next attempt onto it. `lead` is the pause before the question
leaves: the canon BEAT.afterPulse for a fresh lookup, tighter for the retries of a search-list walk,
which the resolver fires back to back.
```

### before `if (pulseOnSend) pulsePod(s.refs.podGroup, ctx, start);`

```
Up-arrow: the Pod pulses BEFORE its question leaves. `pulseOnSend` is false only for the retries of
a search-list walk, where the Pod has just pulsed on the NXDOMAIN landing 300ms earlier and a second
pulse on top of it would smear into one long blink rather than read as two beats.
```

### before `duration: 10400,`

```
Four full round trips on the 380 unit lane run ~9.3s, and the last NXDOMAIN pulse rings on until
~10.2s. The step must outlast its own motion, or auto-advance clips the walk halfway and the card
silently under-counts the very cost it teaches. The budget was 9200 while the lane was 190 units:
routeDur is length-based, so the R5 relayout moved it.
```

### poster

```
The staircase of guesses. A short name is not asked once: the resolver walks the search list, and
each attempt drops one suffix, so the candidate names get SHORTER row by row until only the bare
name is left. The rows are a descending staircase, the dashed rail on the left is the walk down it,
and the dot trailing each row is the query that attempt costs. The staircase IS the cost, which is
the whole point of ndots, so the poster spends everything on that one shape and draws no topology.
```

### before `setWire(s, 'q', 'api');`

```
roundTrip writes BOTH lane labels from inside the motion path, so on the static path (prev, reset,
reduced motion) the two lanes stood empty while the ladder and the counters carried the whole
story. Each query step now restates its own end-state labels inside the guard body. The walk step
ends on the LAST candidate and its NXDOMAIN, because that is the pair the fourth round trip leaves
on the wire, not the first.

The fqdn step restates the name WITH its trailing dot, which is why check-labels reports
api.ns.svc.cluster.local. against api.ns.svc.cluster.local as an ambiguous pair. The pair is the
subject of that step and is meant to stand: one name is absolute and the other is not.
```

---

## network-dns-records

### before `const CONTENT_L = 80, CONTENT_R = 1120;`

```
Layout, rebuilt 2026-07-27 against the MEASURED panel (right <= 397, bottom <= 330: this card
carries one of the longest narrations in the category). Read it as an L. Only the record ladder,
which starts at x=710, may sit beside the panel; everything else hangs below y=330.

  top right : the four-row record ladder (chips), ROWS_Y 56 down to 296
  middle    : client Pod -> CoreDNS on FLOW_Y 400, one straight hop with no jog
  bottom    : the FQDN band, then the question / answers chips

The vertical budget is what forces that order: below the panel there is room for the flow row, one
64 unit band and the chip strip, but not for a 240 unit ladder as well, so the ladder is the one
thing that goes up top. The BAND is then the only block that can reach the right margin, which is
why it is stretched to CONTENT_R: CENTRE measures blocks, the ladder is chips, and CoreDNS has to
stay in the middle for the fan to work. Content and chip strip both span 80..1120, centre 600.

Each record row is reached by its OWN dashed wire: a trunk out of the CoreDNS right edge, a vertical
bus at FAN_X, then a horizontal leg entering the row square-on at its left edge (the same fan idiom
as network-service-clusterip). The four wires share the trunk and diverge at the bus, climbing to
the ladder above. The answer ball rides ANS[i], the exact same array that drew wire i, so a ball is
never travelling over blank canvas.
Standard contract: only the client Pod pulses, boxes/ladder light via .highlight.
```

### before `const SEG_Y = 490, SEG_H = 64;`

```
The FQDN band is NOT decoration and NOT a one-step cameo: it is the live query name, and it MUTATES
per step, because the whole point of the card is that a different record kind is a different name.
SRV prefixes the name with _port._proto, a Pod record swaps the service label for the dashed Pod
address AND swaps the kind from svc to pod, while headless asks the exact same name as A (that is
the lesson: same name, three answers instead of one). Segments light statically and never flash.
Band spans CD_LEFT..CONTENT_R (420..1120), left-aligned with CoreDNS above it and flush with the
right margin. The four widths keep their old 156:116:76:100 ratio, each sized by its own text, and
are scaled x1.52 to fill that span. It sits at the BOTTOM now rather than the top: the ladder needed
the free top-right band, and the band is the only block able to reach the right margin, which is what
puts the content bbox on x=600.
```

### before `const qChip = valChip({ x: CONTENT_L, y: CHIP_Y, w: Q_CHIP_W, h: CHIP_H, name: 'question', value: '-', ro`

```
The two readouts are the DNS exchange itself, and neither repeats what the band or ladder says:
the QUESTION is the exact qname plus type the resolver puts on the wire, and ANSWERS is how many
records come back. That count is the whole difference between a normal and a headless Service
(1 record vs one per ready Pod), which nothing else on the diagram states.
```

### before `function resolve(s, ctx, rowIdx) {`

```
Resolve one record kind: pulse the client, run the query straight along the flow line into CoreDNS,
then send the answer out along the fan wire belonging to THIS record row. Shared by the four record
steps. The answer rides ANS[rowIdx], which is the array wire rowIdx was drawn from, so the ball
tracks a visible dashed line the whole way and enters the row square-on.
```

### poster

```
One name, several shapes of answer. The FQDN is a band of four identical segments joined by the
dots of the name itself, and it forks into three identical record chips. The ONLY difference the
poster draws is the answer count: the middle chip carries three dots (headless: one record per
Pod), the others carry one. No resolver box and no record ladder: the card already draws those,
and the poster only has to say what the card is ABOUT.
```

---

## network-dualstack

### before `const CONFIG_X = 480, CONFIG_W = 600;        // band spans Service..Pod only (480..1080), clear of the client`

```
Layout zones (viewBox 1200x640): the narration overlay is a fixed panel over the top-left
(about x<=250, y<=152, worst case over the viewports x<=397, y<=230). The dual-stack config band
sits below it (y=136) and spans only the Service..Pod half (480..1080), so it no longer reaches over
the client Pod on the left. The client / Service / Pod web row sits lower still (ROW_Y 286). The
config band drops into BOTH the Service (its ClusterIP) and the Pod (its address), as a MIRRORED
PAIR about the band centre (CONFIG_CX +/- TAP_DX) rather than one tap per target centre: two lanes
leaving one face at mirrored offsets read as a deliberate pair, and each still lands 15 units off
its target midpoint, which is invisible on a 240 and a 300 wide face. The bottom info chips span the
whole row instead of the band (CLIENT_X..ROW_RIGHT, 120..1080), so the strip centres on x=600 like
the blocks above it: the two ClusterIP chips on one row, ipFamilyPolicy stretched below them.
Dual-stack means two parallel address families: the Pod gains a second IP, the Service gains a
second ClusterIP, the client picks a family at connect time.
Standard contract: only Pods pulse, boxes light via .highlight; the config band feeds the Pod and
the Service with short packets dropping from it, packet endpoints match the static wires.
```

### before `const CONFIG_Y = 136, CONFIG_H = 80;`

```
Whole scheme raised ~10% of the 640 viewBox (64px) versus the earlier layout. The band lives at
x>=480, clear of the narration overlay (x<=250), so it can sit higher without touching it. The
content stays horizontally centred (client + Pod symmetric about x=600); only the vertical offset
changes.
```

### before `const wClient = arrow({ x1: HOP_CLIENT[0][0], y1: LANE_Y, x2: HOP_CLIENT[1][0], y2: LANE_Y, dashed: true,`

```
Dim dashed wires (uniform style): client -> Service -> Pod data lane (equal-length hops), plus
two drops from the config band into the Service (ClusterIP) and the Pod (CNI address). Each
drop shares its points with the per-step packet that rides it.
```

### before `s.refs.config.classList.add('highlight');`

```
Enabling the feature is a config change with no per-object traffic, so the band just lights
up steadily: no flash, no packet. ipFamilyPolicy is a per-Service field and stays SingleStack
until a Service opts in, so that chip does not change yet.
```

### before `s.refs.config.classList.add('highlight');`

```
The Service opts into dual-stack here: ipFamilyPolicy becomes PreferDualStack and it is given
a second ClusterIP from the v6 service CIDR. The config band is the source of that ClusterIP
(the service CIDR lives there), so it stays lit too, matching the Pod step.
```

### before `s.refs.svc.classList.add('highlight');`

```
The client picks a family at connect time, the Service policy is unchanged (still
PreferDualStack). Show the client dialing the IPv6 ClusterIP and highlight that address,
rather than overloading the ipFamilyPolicy chip with a client-side choice. The Service is on
the path (kube-proxy DNATs here), so it lights steadily via .highlight, it does not pulse.
```

### before `const HOP1 = HOP_CLIENT, HOP2 = HOP_SVC;`

```
Up-arrow into the Service then on to the Pod: client pulses first, two linear hops, the Pod
pulses on arrival. A riding label rides each hop to make the chosen family visible on the
wire and to show the kube-proxy DNAT: the client dials the IPv6 ClusterIP, then the
destination is rewritten to the Pod IPv6 on the way out.
```

---

## network-ebpf-dataplane

### before `const CONTENT_L = 70, CONTENT_R = 1130;`

```
Layout zones (viewBox 1200x640): the narration overlay sits over the top-left, so the flow runs
left to right along y312 (client -> eBPF program -> backend Pod) with the BPF maps box ABOVE the
program, mirroring the ClusterIP reference card. This is the eBPF dataplane that replaces
kube-proxy: an eBPF program at the socket hook reads a BPF service map and rewrites the
connection to a backend at connect() time, so there is no per-packet iptables walk and no DNAT.
Standard contract: only Pods pulse, boxes light via .highlight only (no block flash anywhere),
packet routes are right-angle and shared by the static wires and the moving packets.

The composition spans CONTENT_L..CONTENT_R (70..1130): the client Pod holds the left margin and the
backend Pod column the right one, so the content bbox centres on x=600, and the three chips are one
even row across that same span. The backend column used to stop at 1030, which left the whole card
50 units left of centre. FAN_X is derived (midway between the program right edge and the Pod left
edge), so widening the card moved the fan turn with it rather than leaving it behind.
```

### before `const lDeliver = text({ class: 'scheme-label code dim', x: (HOOK_RIGHT + FAN_X) / 2, y: FLOW_Y + 20, 'text`

```
Destination label sits UNDER the first fan segment, just as the rewritten connection leaves the
program (the riding src tag rides ABOVE the ball at y312, this sits below it). Centring the fan
turn put the riser under the old slot, so the dst label moved here where it never collides.
```

### before `const TO_PODY = [[HOOK_RIGHT, FLOW_Y], [FAN_X, FLOW_Y], [FAN_X, PODY_Y], [POD_X, PODY_Y]];`

```
Review stage 2.4 family B listed `TO_PODY` as a lane nobody rides. DECLINED 2026-07-30: it is the
ALTERNATIVE backend, drawn so the reader can see that the map lookup picked one of two, and the card
says so in words. N destinations, N wires. `LOOKUP` was on the same finding and is now ridden, because
family D gave the map lookup the round trip its sentence names.
```

---

## network-endpointslice-reconcile

### before `const CTLR_TOP = 350;                       // top edge of the controller box`

```
Service / EndpointSlice reconciliation (viewBox 1200x640). This is a control-plane pipeline, not
a traffic flow. Read it bottom to top and then right:
  Pods (the live source)  --watched by-->  EndpointSlice controller  --writes-->  EndpointSlice
  (the derived Ready-only address list)  --read by-->  kube-proxy.
The Service sits on top: it owns the selector and NAMES the slice, but stores no addresses.

Layout zones (top-left band kept clear for the narration overlay: the Service, the
slice rows and the controller are all centred at x600, well right of it). The slice is three
valChip rows stacked between the Service and the controller. The controller sits below them and
writes UP into the slice, kube-proxy sits to the RIGHT of the slice and reads it, the live Pods
sit along the BOTTOM and are watched from above.

Standard contract: Pods are shell + inner box and pulse as one; the controller / kube-proxy
boxes light but never pulse; value chips (the endpoints) never flash, they just light via
lightBoxAt on packet arrival. The endpoint rows are the durable state (setVal + .highlight),
they hold the addresses. What MOVES rides on the ball: the controller write hop carries the
endpoint address it is committing, the kube-proxy read hop carries a short read tag, each via
ridingLabel so there is no static inline wire text to collide with the boxes.
```

### before `pulsePod(s.refs.podA, ctx, 0);`

```
The Ready Pods are observed (they pulse together), then the controller writes the slice: one
packet up from the controller carrying the endpoint address it commits, and the two Ready
endpoint rows light together as it lands.
```

### poster

```
The scheme abstracted to its essence: live Pods on the left (the source, the notReady one
dimmed) are reconciled into the EndpointSlice on the right (the derived list, one endpoint row
per Pod, notReady dimmed). Straight horizontal wires carry the one-row-per-Pod mapping.
```

### before `if (ctx.reduced) { s.refs.podBBox.classList.add('highlight'); s.refs.ep2`

```
Pod B going notReady is the whole of this step, so its shade is static end-state and belongs above
the guard, next to Pod C which was already pinned there. It sat below the guard until 2026-07-29,
so prev and reset drew Pod B at full brightness directly beneath its own sublabel reading
10.244.2.7 notReady, and beside a slice row reading dropped (notReady).

Pinning the shade exposed a second thing, fixed 2026-07-30: the Pod was pulsed with plain pulsePod
while sitting at 0.40, and that pulse ramps the STROKE from the resting tint, which on an already
dim Pod is close to invisible. It takes pulsePodDim with `from: OPACITY.notready` instead, which
adds the opacity flash the dim variant exists for. The signature in anim-dump is an `opacity` track
on the Pod group next to the `filter` one, and the peak sits between the sampled percentages because
a blink returns to where it started.
```

---

## network-externalname

### before `const CLIENT_X = 115, CLIENT_W = 160, CLIENT_H = 108;`

```
Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay, measured
2026-07-27 at right <= 397, bottom <= 230. Both rows hang BELOW that bottom (ROW_A 300, ROW_B 480,
Pod tops 246 and 426): row A used to sit at 254 and put a quarter of its Client Pod under the panel
on the narrow viewports. The top band is therefore empty by construction on wide viewports, which is
the price of two full-width rows on a card whose panel reaches a third of the way down. Two stacked
rows compare the two ways a Service can point at something that is not a selected Pod:
  - top row (ROW_A): type ExternalName, a pure DNS alias. The client looks the name up (the query
    rides to CoreDNS), CoreDNS answers a CNAME that rides on toward the external host. No ClusterIP
    and no kube-proxy.
  - bottom row (ROW_B): a ClusterIP Service with no selector. The client sends to the ClusterIP
    (dst rides to kube-proxy), kube-proxy DNATs to a hand-attached EndpointSlice (the rewritten
    dst rides on to the external IP).
Each row is one independent one-way flow (two straight hops, no round trip, no return lane). The
value each hop carries is NOT inline wire text: it rides ALONG on the ball (ridingLabel), so both
hops in both rows tag their ball and no static label is needed. Each row has its own client Pod
(pods pulse). CoreDNS, kube-proxy and the targets are infra (they light SYNCED to arrival, never
pulse).
```

### before `pulsePod(s.refs.clientA, ctx, 0);`

```
Up-arrow then forward hop: the client pulses first, the query rides at BEAT.afterPulse to
CoreDNS (lights on arrival), then the resolved CNAME rides on to the external host, which
lights when the name reaches it. No round trip, both hops are one-way.
```

### before `pulsePod(s.refs.clientB, ctx, 0);`

```
Up-arrow then forward hop: the client pulses, the packet carries dst 10.96.0.7 to kube-proxy
(lights on arrival), then the DNAT-ed dst rides on to the manual endpoint, which lights when
the packet reaches it.
```

### poster

```
Abstract, not the literal diagram: two balanced lanes share one client column (left) and one
external-target column (right), crossing one dashed cluster edge. The whole contrast is hollow
vs solid. Top lane (type ExternalName) is a pure DNS alias: hollow client ring to a hollow
resolver ring to a hollow external host, no ClusterIP and no proxy anywhere on the path. Bottom
lane (no-selector ClusterIP) is machinery: a lit cyan VIP straight into a kube-proxy box, on to a
hand-attached EndpointSlice (dashed chip), then a DNAT hop across the edge to a lit cyan endpoint.
```

---

## network-externaltrafficpolicy

### before `const MID_X = 600;`

```
externalTrafficPolicy Cluster vs Local (viewBox 1200x640). Client above the LB, the LB fans down
to two Nodes; Node-1 has a local backend, Node-2 has none. In Cluster mode the packet that lands
on Node-2 is SNAT-ed and forwarded across the underlay lane to the Pod on Node-1; in Local mode
the Node-1 path is straight. Standard contract: Pod is shell + inner box; only the Pod pulses;
value chips never flash; packets ride wires and the underlay, stopping at edges.

GEOMETRY. Every wire is derived from a block edge, never hand-typed, so a block and the packet that
rides to it cannot drift apart. The backend is a standard podBlock (POD_W x POD_H, the same shell as
every other card) and it is centred BOTH ways inside Node-1, on N1_CX and on the node rect centre, so
the fan drops straight down the Pod axis onto the Node edge above it.

Horizontal: the two Nodes are the widest row, mirrored about MID_X with NODE_GAP between them, so the
scheme spans SCHEME_LEFT..SCHEME_RIGHT = 180..1020 and centres on 600. The chip strip spans that same
extent 1:1. Vertical: the stack is client / LB / Nodes / underlay / chips with deliberate gaps, and
the totals leave an equal 40 margin above the client and below the chips, so it centres on the canvas.

CENTRE-LOW is OPEN here on purpose (2 blocks below the overlay span 255..465, centre 360). Those two
blocks are the backend Pod and its inner box, and everything else in that band is Node frames, which
the rule deliberately ignores. The Pod cannot move to the centre: it is inside Node-1 because Node-1
is the Node WITH a local backend, and Node-2 having none is the entire subject of the card. Drawing a
ghost Pod in Node-2 to balance the count would contradict its own label.
```

### before `const CROSS = [[N2_CX, NODE_BOTTOM], [N2_CX, UNDER_Y], [N1_CX, UNDER_Y], [N1_CX, NODE_BOTTOM]]; // Node-2 -> u`

```
Traffic is delivered TO A NODE, never drawn as entering the Pod: a packet stops at the Node boundary
it arrives on (the top edge coming down from the LB, the bottom edge coming up off the underlay) and
the Pod inside pulses to show it was served. So no wire and no ball ever crosses a Node border.
```

### poster

```
Mirrors the diagram: client above an LB that fans down to two Nodes, only Node-1 holding a backend,
plus the underlay lane that carries the Cluster-mode second hop from Node-2 back to Node-1. That
lane is the whole point of the card, so the poster shows it.
Geometry, same rules as the diagram: client and LB centred on x=160, the two Nodes mirrored about it,
the Pod centred BOTH ways inside Node-1 (cx 81, cy 124), the fan leaving the LB bottom edge and
landing on each Node top, and the underlay running Node edge to Node edge without ever crossing one.
```

### before `const fan2 = pathArrow({ points: TO_N2, dashed: true, dim: true, role: 'network' });`

```
Review stage 2.4 family J listed `fan2` and `crossWire` here as bright lanes pointing into a dimmed
block. DECLINED 2026-07-30, and the reason is not judgement: this card never changes an opacity at all,
on any of its five steps, so it has no dimmed end for a lane to point at. The premise is vacuous.

`C_WIRE` on this card belonged to family B, not J, and is a separate matter.
```

---

## network-gateway-api

### before `const FLOW_Y = 380;                          // Client + Gateway share this row: a request enters here`

```
Gateway API (viewBox 1200x640). The card is about OWNERSHIP: GatewayClass, Gateway and HTTPRoute
are three objects belonging to three roles, and the request only becomes a path once all three
exist. Standard contract: the Pod is a shell + inner box; only the Pod pulses; value chips never
flash; packets ride the wires and stop at block edges. NOTHING here flashes, not even the
packet-less gatewayclass step: a declarative object being installed has no motion to show.

GEOMETRY. Every wire and every packet below is derived from a block edge, never hand-typed, so a
block and the ball that rides to it cannot drift apart.

Vertical: the ownership stack is one column on STACK_CX. The Gateway sits on FLOW_Y, which is the
row a real request enters on, so the Client block can sit beside it on the left. FLOW_Y is pinned
below the narration overlay, and that measurement was corrected on 2026-07-27: the panel reaches
y <= 330 on this card, not 300, so FLOW_Y moved 339 -> 380 and the Client top edge is now
FLOW_Y - CLIENT_H/2 = 344 instead of 303, which had been 36 percent under the panel. The HTTPRoute
row and the chip strip moved down with it (ROUTE_Y 460, CHIP_Y 586) keeping their old gaps.
The GatewayClass is the only block above the panel bottom, and it lives at x >= 410, so it clears.

Horizontal: the Service and the backend Pod hang off the HTTPRoute row to the RIGHT rather than
continuing the column, because a fifth stacked block plus a bottom chip strip does not fit in 640
units. That also frees the right column for the three ownership captions, one per stack block.
The composition spans CLIENT_X..POD_RIGHT = 40..1160, so it centres in the 1200-wide viewBox, and
the chip strip spans exactly the same 40..1160.
```

### before `const ENTRY = [[CLIENT_RIGHT, FLOW_Y], [STACK_X, FLOW_Y]];`

```
Each static wire and the packet that rides it share the same endpoints. Every wire carries an
arrowhead pointing the way its ball travels: CLASS_REF is a reference the Gateway resolves upward,
the other three are the request path running down and out to the Pod.
```

### before `const parentWire  = arrow({ x1: CONSULT[0][0], y1: CONSULT[0][1], x2: CONSULT[1][0], y2: CONSULT[1][1], dashed`

```
Gateway -> HTTPRoute. The attachment is declared the other way (the route names the Gateway in
parentRefs, which is why that field is the route sublabel), but the only ball that ever runs this
wire is a request being matched against the rules, so the arrowhead points down, with the ball.
```

### before `const roleA = text({ class: 'scheme-label code dim', x: ROLE_X, y: CLASS_Y + CLASS_H / 2 + 4, 'text-anchor': '`

```
The point of the card: one caption per stack block, each sitting on its own block row. The top
two go in the right column, which is free at those rows. The HTTPRoute row is not free there
(the backendRef wire and the Service occupy it), and a caption parked above the Service reads as
labelling the Service, so that one goes to the LEFT of the route instead, where it also fills
the quadrant the narration panel leaves empty. Sitting on ROUTE_CY (502) keeps it clear of the
panel, whose measured bottom on this card is 330.
```

### before `const listenerChip  = valChip({ x: CLIENT_X, y: CHIP_Y, w: 200, h: 34, name: 'listener', value: ':443 HTTPS', `

```
The strip spans the scheme 1:1, from the Client left edge to the backend Pod right edge, with
even 20px gaps. Each chip is one real API field, which is why hostnames and match are SEPARATE:
in an HTTPRoute the hostname lives in the top-level `hostnames` list, while the path lives in
`rules[].matches[].path`, whose default type is PathPrefix. Folding them into one "match" chip
would state the spec wrongly. The request chip reads none until a request actually arrives.
```

---

## network-headless-service

### before `const CY = 320;                      // canvas centre line: Pods column + CoreDNS are centred on it`

```
Headless Service (viewBox 1200x640). clusterIP None means there is no VIP hop: DNS hands back the
backing Pod IPs and the client connects to a Pod itself. The three backends are a StatefulSet
(web-0..web-2) so the stable per-Pod name lands.

Geometry, all of it symmetric about the canvas centre line CY=320:
  - The three Pods are a column on the right, centred on CY (web-1 sits ON it, web-0/web-2 mirror).
  - CoreDNS is centred on CY too, so its fan to the three Pods is symmetric: a trunk out of its right
    edge, a vertical bus at FAN_X, then a horizontal leg entering each Pod square-on at its left edge.
  - The client sits low-left. Its DNS lane leaves the TOP of the Pod, rises, and turns into CoreDNS
    at 90 degrees. Query and answer ride SEPARATE lanes (20px apart) so the answer never retraces the
    query arrow.
  - The data path leaves the MIDDLE of the client's right edge (CLIENT_CY), steps down at
    DATA_STEP_X to the trunk level, runs under everything at y=520, and rises on its own bus at
    DATA_X to enter a Pod square-on. The step exists because the trunk has to pass BELOW the Service
    box (430..500) while still leaving the Pod at its face midpoint: leaving at y=520 direct put a
    lone endpoint 35 units off that midpoint, which is what OFFEDGE reports. It is drawn to ALL THREE
    Pods, because a headless client may pick any of them, and every ball rides one of these wires.
Content spans x 80..1120 (centre 600) so it is centred on the canvas.

Narration safe-zone: this card's panel was measured at right <= 397, bottom <= 205. Every element
left of 397 sits well below that (the client at y>=420, the DNS lane turning at CY +/- 10 = 310/330),
so nothing can slide under the panel.
```

### before `const wSvc = relationPath({ points: [[CORE_CX, SVC_Y], [CORE_CX, CY + CORE_H / 2]], dash: '5 5' });`

```
Service <-> CoreDNS is a plain dashed line with NO arrowhead: it is not a packet route, it is the
static fact that this Service backs those records. An arrowhead here would read as traffic, and no
ball ever rides it. Drawn as a bare path because arrow() always attaches a marker.
```

### before `const vipChip = valChip({ x: CLIENT_X, y: CHIP_Y, w: CLIENT_W, h: CHIP_H, name: 'clusterIP', value: 'None`

```
Three readouts, each of which always means exactly what its name says. The old card showed
`connect 10.244.3.4 direct` under a chip labelled `DNS answer`, which is not a DNS answer.

Each chip sits directly UNDER the column it reports on and shares that column's exact x and width:
clusterIP under the client (80..290), the DNS answer under CoreDNS and the Service (430..680), the
connection under the Pods (880..1120). So the footer spans the diagram end to end and every chip
edge lines up vertically with the blocks above it.
```

### poster

```
Where a normal Service keeps a VIP, headless keeps an ANSWER. The middle of the path is not a box
that rewrites the destination (there is none to rewrite: clusterIP None, so kube-proxy programs
nothing) but the DNS reply itself, a sheet of three A records. Each record leaves on its own leg to
its own Pod, so the record count and the Pod count are visibly the same number, which IS headless:
one record per ready Pod, and the client dials the Pod IP straight.
```

### before `const fans = [W0, W1, W2].map(cy => relationPath({ points: fanTo(cy), role: 'network' }));`

```
Review stage 2.4 family B listed the three `fans` as lanes nobody rides, and the comment above them
claimed the opposite in so many words ("both are drawn from the exact arrays their balls fly"), which
was true of the data fan and false of this one. Converted 2026-07-30.

The endpoint fan is CoreDNS knowing which Pods back the Service, and no packet belongs on it in either
direction: CoreDNS never calls a Pod, and the read that populates the answer comes from the
EndpointSlice, which this card does not draw. Dropping the arrowhead also settles a direction the arrow
had wrong: it pointed CoreDNS -> Pod while the narration says CoreDNS READS the endpoints.

The DATA fan beside it keeps its arrowheads and its balls. Two fans that look alike and mean different
things was the actual defect, and the pair now differs at a glance. `TO_W2` in the data fan still rides
nothing, which is the separate sanctioned case: N destinations get N wires so the reader can see the
client picked one of three.
```

---

## network-hostnetwork-hostport

### before `const NODE_X = 40, NODE_Y = 305, NODE_W = 1120, NODE_H = 265;`

```
hostNetwork and hostPort (viewBox 1200x640). Every other Pod Networking card assumes the Pod has its
OWN namespace, its own IP and a veth into the bridge. This card is the two sanctioned ways out of that,
and the composition is one Node seen from the LAN side.

Standard contract: Pods are shell + inner box; only Pods pulse; the client, the NIC, the bridge and the
portmap rule are infrastructure and only light; value chips never flash; packets stop at block edges.
The two reflective steps carry no motion at all: they compare, they do not move traffic.

GEOMETRY. A strict three-column grid, so nothing sits at a random x. Every wire and every packet is
derived from a block edge, never hand-typed.

  COL1 (cx 240)          COL2 (cx 600)          COL3 (cx 960)
  portmap rule           Node eth0              (empty: the lane to the agent runs through it)
  Pod app                cni0 bridge            Pod node-agent

The NIC is the hub and it exits three ways, one per direction: LEFT along its own row into the portmap
rule, RIGHT along that same row into the hostNetwork Pod, and DOWN into the bridge. That last one drops
on BR_IN_ORD rather than dead on COL2_CX, because the portmap route comes down onto the same bridge
face: the two land as a mirrored pair either side of the bridge midpoint (COL2_CX +/- BR_IN_DX), which
is what a face shared by two lanes is supposed to look like. Each
block therefore sits under or beside the block it belongs to: the rule above the Pod it maps to, the
bridge under the NIC that routes into it, and the hostNetwork Pod alone in a column, because it hangs
off nothing.

Vertical: the narration overlay owns the top-left corner, and the Node spans the full width, so
its frame starts at 305, just under the panel, and runs to 570, which is as deep as the chip strip
allows. The client is the only block above the Node and it sits at x >= 450, clear of the panel, dead
centred on the NIC so the entry hop is one clean vertical with no dogleg.
```

### before `const PM_TO_BRIDGE = [[COL1_CX, R1_BOTTOM], [COL1_CX, BUS_Y], [BR_IN_PM, BUS_Y], [BR_IN_PM, BR_TOP]];`

```
The rewrite happens INSIDE the rule box, so the ball re-emerges at its bottom edge already carrying the
Pod address, and only then joins the ordinary path. It lands on the bridge left of the NIC route so the
two never overlap, and the two are mirrored about the bridge midpoint so neither reads as a slip.
```

### before `const theNode = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });`

```
The frame label sits at the Node top-left (x+12, y+18), which puts it above and left of the portmap
box at x=110, so Node-1 clears it. Do not lengthen it much further or it runs under that box. The
Node address stays on the eth0 block, which is where it belongs anyway.
```

### before `const nsChip   = valChip({ x: SCHEME_LEFT, y: CHIP_Y, w: 260, h: CHIP_H, name: 'netns', value: 'own', role: 'ne`

```
The four chips span the Node 1:1, with even 20px gaps. They are the four things these two fields
actually change, and each is a property of the setup rather than of a request, so they all carry the
ordinary-Pod truth from the start and the steps flip them.
```

### before `function clearHL(s) {`

```
The inner app boxes are listed by key so the .highlight a reduced replay puts on them is cleared too:
clearPodHighlight only resets inline strokes. Every dimmable block goes back to full opacity so the dim
one case puts on the other cannot leak into the next step.
```

### before `const inb = segmentPacket(s, ctx, { from: ENTRY[0], to: ENTRY[1], role: 'network' });`

```
Down-arrow chain: the request lands on the NIC, is matched by the portmap rule, and the rewrite
happens INSIDE that box, so the ball re-emerges at its bottom edge already carrying the Pod
address. From there it takes the ordinary path, bridge then veth, and the Pod pulses on arrival.
```

### poster

```
One Node seen from the LAN, in the same composition language as its siblings: a client bar on top, the
Node frame under it, the NIC as the hub inside, and the blocks hanging off the NIC in a three column
grid. Left column is the hostPort path, and it is the FULL ordinary wiring: the portmap rule that maps
the Node port onto the Pod, plus the cni0 bridge and the veth that actually deliver into it, so the Pod
there is a shell with its own container box, its own namespace, its own IP. Right column is the
hostNetwork Pod, wired to the NIC by ONE straight line and nothing else: no rule, no bridge, no veth,
because it has no namespace to be wired into. That missing wiring, next to the wiring drawn in full, is
the whole card.
Geometry: columns at cx 60 / 160 / 262, the NIC is the only block the client lands on, and every dash
starts and ends on a shape edge.
```

---

## network-ingress-routing

### before `const FLOW_Y = 343;                  // (RULE_BOTTOM + CHIP_Y) / 2, the spine of the left-to-right flow`

```
Ingress controller routing (viewBox 1200x640). External LB -> controller Pod -> matched Service
-> backend Pod, left to right. The card runs BOTH rules: the / request is proxied to Service web,
then a second /api request is proxied to Service api, so each branch carries real traffic.
Standard contract: controller and backends are shell + inner box; only Pods pulse; value chips
never flash; packets ride the wires and stop at block edges.

GEOMETRY. Every wire below is derived from a block edge, never hand-typed, so a block and the
packet that rides to it can never drift apart. The Ingress controller Pod is a standard podBlock
(POD_W x POD_H, the same shell used by the web and api backends) rather than an oversized box.

Vertical: everything hangs off FLOW_Y, the midpoint between the rules panel bottom (RULE_BOTTOM)
and the chip strip top (CHIP_Y). The web and api branches are exact mirrors at FLOW_Y -/+ ROW_DY,
so each fan leg, Service and backend Pod share one row.

Horizontal: the rules panel is centred ON THE CONTROLLER (RULE_CX == CTRL_CX), since the rules are
what that Pod watches, and the ownership wire rises straight up from the controller top centre.
The narration overlay really covers user-space x 0..399, y 0..190, and the panel lives at y<190,
so it must start past 399. Centring a panel on the controller therefore FORCES the controller
rightward: at CTRL_CX 485 the widest overlay-clearing centred panel is 150, and the rule chips
need 234. CTRL_CX 545 admits a 260-wide panel (415..675) with 16 to spare. The four columns then
span LB_X..POD_RIGHT = 40..1160, so the scheme still centres in the 1200-wide viewBox.
```

### before `const rulesWire = relationPath({ points: [[CTRL_CX, CTRL_TOP], [CTRL_CX, RULE_BOTTOM]], role: 'network', dash: '5 5' });`

```
Ownership marker, NOT a traffic path: the controller watches these rules. No packet ever travels
it, so it is a plain dashed line with NO arrowhead, to read as an association rather than a wire
missing its ball. It rises from the controller top centre into the panel centre, so the two read
as one column.
```

### before `const entryLabel = text({ class: 'scheme-label code dim', x: (LB_RIGHT + CTRL_X) / 2, y: FLOW_Y - 12, 'text-an`

```
Three wire labels: the request line rides above the entry hop, and each branch carries the proxy
target the controller chose. The branch labels sit clear of the Service box they name (above the
web one, below the api one, mirrored) rather than in the FAN_X..SVC_X gap, which is only 40 wide
and would put the text straight through the Service border. Blank at build, filled per step.
```

### before `const hostChip = valChip({ x: LB_X, y: CHIP_Y, w: 310, h: 34, name: 'Host', value: 'none', role: 'network' });`

```
The three chips span the scheme 1:1, from the extLB left edge to the backend Pod right edge,
with even 20px gaps. Widths are tuned to their content (TLS carries the longest value).
Host and path are properties of the REQUEST being served, so they read none until one arrives.
```

### before `clearHighlights(s, ['extLB', 'ruleA', 'ruleB', 'svcWeb', 'svcApi', 'hostChip', 'pathChip', 'tlsChip', 'ctrlBox`

```
The inner app boxes (ctrlBox/podWebBox/podApiBox) are listed so their .highlight is cleared every
step: clearPodHighlight only resets inline strokes, so without them a highlight set in a
reduced-replay block leaks into later steps, since reduced replay never runs the forward motion
path that would otherwise re-clear them.
```

### before `setVal(s.refs.hostChip, 'shop.io');`

```
The request is now on the wire, so its Host and path are known. They are not highlighted yet:
the controller reads them in the next step, this one only terminates TLS. No rule has matched,
so both branches stay neutral.
```

### before `pulsePod(s.refs.ctrl, ctx, 0);`

```
Up-arrow, the controller is the sender: it pulses FIRST as it matches the rule, and only then
does the proxied request leave, at BEAT.afterPulse. The ball rides the right-angle fan to
Service web and hops on to the backend Pod, which pulses on arrival.
```

### poster

```
A routing junction, not another box-and-line row: one request enters a square decision node, which
splits it into two CURVED paths sweeping out to a pair of rounded backend pills. The Ingress rule
table (two bars, the shorter one the more specific rule) docks above the junction and feeds it.
Curves + pills keep this poster from reading like the rectangle rows of its siblings.
Geometry: the junction sits on the flow line y=100, the two pills mirror it at -/+34 (66 and 134),
and every path starts and ends exactly on a shape edge, as everywhere else in this project: the
entry dash meets the square left edge (96), both curves leave its right edge (128), and the rule
table drops onto its top edge (84).
```

---

## network-internal-traffic-policy

### before `const FLOW_Y = 405;`

```
internalTrafficPolicy Cluster vs Local (viewBox 1200x640). The east-west twin of the External Traffic
card: same two values, same Service, but the traffic starts INSIDE the cluster. So the sender is a
client Pod on Node-1, and the question is which endpoints the kube-proxy on THAT Node is allowed to
program: every ready endpoint in the cluster (Cluster), or only the ones sitting on Node-1 (Local).
The third step is the one that separates it from externalTrafficPolicy: Local has no fallback and no
health check, so with no local backend kube-proxy drops the packets instead of forwarding them.

Standard contract: Pods are shell + inner box; only Pods pulse; the Service and kube-proxy are
infrastructure and only light; value chips never flash; packets stop at block edges. A ball never
crosses a Node border: the cross-node leg starts on the Node-1 bottom edge (the packet has left the
Node by then) and ends on the Node-2 bottom edge, and the Pod inside pulses to show it was served.

GEOMETRY. Every wire and every packet is derived from a block edge, never hand-typed.

Vertical: the Service sits alone on top, the Node row carries the whole flow on FLOW_Y, and the
underlay lane below the Nodes carries the cross-node hop. The narration overlay really covers
the top-left corner, so the Node row starts at 312 and the Service (the only block that high) lives at
x >= 450, clear of it.

Horizontal: Node-1 is wide because it holds the whole local path (client, dataplane, local backend),
Node-2 only holds the remote backend. The two span 40..1160, so the scheme centres in the viewBox and
the chip strip spans that same extent 1:1.
```

### before `const OWN = [[SVC_CX, SVC_BOTTOM], [SVC_CX, 240], [N1_CX, 240], [N1_CX, NODE_Y]];`

```
Ownership marker, NOT a traffic path: the Service and its EndpointSlices are what kube-proxy on
each Node is programmed from. No packet ever travels it (the ClusterIP never appears on a wire),
so it is a plain dashed polyline with NO arrowhead: an association, not a wire missing its ball
(pathArrow always carries a head, hence the raw path). It drops out of the Service, turns onto the
Node axis and STOPS on the Node top edge rather than reaching into kube-proxy: the Service is an
API object that lives outside any Node, and what it programs inside one is the Node business.
N1_CX and KP_CX happen to be the same 390, so the line still reads as landing on the dataplane.
```

### before `const policyChip = valChip({ x: SCHEME_LEFT, y: CHIP_Y, w: 290, h: CHIP_H, name: 'internalTrafficPolicy', valu`

```
The four chips span the scheme 1:1, from the Node-1 left edge to the Node-2 right edge, with even
20px gaps. The policy is a property of the Service, so it is true from the start. The scope, the
hop and the result are outcomes of a call, so they read none until traffic actually flows.
```

### before `function clearHL(s) {`

```
The inner app boxes are listed by key so the .highlight a reduced replay puts on them is cleared too:
clearPodHighlight only resets inline strokes. Every Node and Pod opacity goes back to full so a dim
set by one policy cannot leak into the next step.
```

### before `pulsePod(s.refs.client, ctx, 0);`

```
Up-arrow: the client Pod is the sender, so it pulses FIRST and the packet leaves at
BEAT.afterPulse carrying the ClusterIP. kube-proxy lights as it catches it, the DNAT happens
inside the box, and the ball re-emerges below it on the Node edge already carrying the remote
Pod address. The remote backend pulses as the underlay leg lands on its Node.
```

### before `pulsePod(s.refs.client, ctx, 0);`

```
Same opening as Cluster: the client pulses, the ball carries the ClusterIP to kube-proxy. This
time the DNAT resolves to the local Pod, so the ball leaves the far edge of kube-proxy and stays
inside the Node, and the local backend pulses on arrival.
```

### poster

```
A diptych: the same little scene twice, and the ONLY thing the policy changes is the Node border.
Left is Cluster, so the border is a faint dashed hint: the call reaches the backend inside the Node,
and it also climbs out over that border to the one outside. Right is Local, so the same border is
drawn solid, as a wall: the leg that would leave the Node is cut short and crossed out at the wall,
and the outside backend with its would-be path fade to a ghost, leaving only the short leg that stays
home. Same caller, same two backends, one boundary that either lets traffic through or does not. No
kube-proxy box, no endpoint list and no packets: the card draws those, the poster only has to say
what the switch DOES.
Geometry: two 128-wide Node frames mirrored about the centre divider (16..144 and 176..304), caller
and local backend on one row inside each, the remote backend directly above the local one and outside
the frame, and every leg starting and ending on a shape edge.
```

---

## network-ipam-pod-cidr

### before `const NODE_Y = 312, NODE_W = 300, NODE_H = 290;`

```
Layout zones (viewBox 1200x640):
  - top band (top-left) is reserved for the narration overlay, measured 2026-07-27 at
    right <= 397, bottom <= 255.
  - the controller column (cluster CIDR -> kcm) is centred at x460..740 so it clears the
    overlay; the three Nodes fill the y312..602 band and span 80..1120, centred on 600.
  - every x on the card is derived from NODE_X / NODE_CX, so the Node columns, their slice
    chips, their Pods and the allocation bus cannot drift apart.

CENTRE-LOW is OPEN here on purpose (4 blocks below the overlay span 130..700, centre 415). The
rule cannot see Node frames, so what it measures is the two Pods, which sit in Node-1 and Node-2
because the narration names those two Nodes ("A Pod scheduled to Node-2 gets 10.244.2.8"). Moving
either Pod to Node-3, reordering the Nodes, or inventing a third Pod would each make the card say
something different. The composition itself is centred: three equal Node frames spanning 80..1120
under a control-plane column on their common centre line.
Lessons carried over from network-pod-to-pod-same-node:
  - the Pod is the canonical shell + inner-box block (so the whole group pulses as one).
  - arrows are DIM dashed (no colour override) so the bright ball reads on a muted wire,
    and they sit ABOVE the blocks so they are not hidden under the node rects.
  - only the Pod pulses; boxes/chips get the static highlight + the packet arrival ripple.
  - packets ride exactly along the arrows (segmentPacket endpoints == arrow endpoints).
```

### before `const BRANCH_Y = 264;`

```
The two side allocation arrows turn at right angles: down from the controller to a shared
branch level, then horizontally out to the node, then down into its podCIDR chip. The static
pathArrow and the moving packet share the same point array. The centre arrow stays straight.
```

### before `const cfgArrow   = arrow({ x1: SPINE_X, y1: CFG_Y + CFG_H, x2: SPINE_X, y2: KCM_Y, dashed: true, dim: tru`

```
Dim dashed arrows: config (pool -> kcm), allocation (kcm -> each node slice), and the IPAM
hand-out from each node slice to its Pod. The Node-2 hand-out is revealed only on the final
step, so its arrow starts hidden. They are appended ABOVE the blocks.
```

### before `const dur = 1100;`

```
The kcm carves a slice into each node.spec.podCIDR in one reconcile pass: all three
packets leave together and share one travel time, so the short centre path and the long
side paths all reach their slice at the same moment. The centre simply moves slower.
```

### before `if (ctx.reduced) {`

```
Node-1 pod just keeps its settled IP with no highlight; the action is on Node-2. Reveal
the Node-2 pod and show its own IPAM hand-out: a second pod with a non-overlapping IP
out of its slice proves uniqueness.
```

### before `const IPAM1 = [[NODE_CX[0], SLICE_BOTTOM], [NODE_CX[0], POD_Y]];`

```
Review stage 2.4 family C listed the `ipam` step here as a ball leaving the wrong block. DECLINED
2026-07-30: the ball leaves the BOTTOM EDGE of the Node-1 slice chip, and after the family K rewrite
the sentence reads "its address is drawn by the CNI IPAM strictly out of that Node slice", so the drawn
source and the grammatical one now agree. The card has no CNI and no IPAM block anywhere, so there is
nothing else for it to leave: the slice the address comes out of is the only candidate on the canvas.
```

---

## network-kube-proxy-modes

### before `const CX = 600;                        // canvas centre: the chip strip is built on it`

```
Concept "two routes" (viewBox 1200x640): the same kind of connection to the ClusterIP is resolved
to a backend two ways. The TOP route is iptables, a chain (KUBE-SERVICES -> KUBE-SVC -> KUBE-SEP)
the packet WALKS box by box, stopping at each (O(n)). The BOTTOM route is IPVS, one in-kernel hash
hop (O(1)). Mirror-symmetric about the flow axis: the chain row and the equally wide hash box sit
at equal distance above and below, and each delivers to its own backend Pod through a centred turn,
the chain DOWN to the upper Pod and IPVS UP to the lower Pod (so neither arrow curves back).
Wires and packets ride only the GAPS and stop at box edges; only Pods pulse; boxes light via
.highlight; the inactive lane dims on each mode step.

GEOMETRY (R5, 2026-07-27). Horizontal: SCHEME_L 40 .. SCHEME_R 1160, mirrored about CX 600, and the
three chips are 350 wide with even gaps so the strip centres on 600 by construction. Vertical: the
narration panel measures bottom <= 280 on this card, so AXIS moved 322 -> 352 and the Client Pod
shell (AXIS +/- 64) now clears it. The chain row does NOT centre on 600: its boxes sit ABOVE the
panel bottom, so the row has to start right of the panel edge and ENGINE_L is pinned at 420. That
asymmetry is paid for by the client on the left and the backend column on the right, which is what
puts the CONTENT bbox on 600.
```

---

## network-loadbalancer-bare-metal

### before `const MID_X = 600;`

```
LoadBalancer on bare metal (viewBox 1200x640). The question the card answers is not how a packet is
balanced inside the cluster, it is how the external address becomes REACHABLE at all when no cloud
provisions anything. So the top of the scheme is the upstream router, and the three Nodes below it
are candidates for the address: in L2 mode exactly one of them answers ARP for it, in BGP mode all
three advertise it and the router hashes flows across them.

Standard contract: Pods are shell + inner box; only Pods pulse; the client and the router are
infrastructure and only light; value chips never flash; packets stop at block edges. Traffic is
delivered TO A NODE, never drawn as entering the Pod: a ball stops on the Node top edge and the Pod
inside pulses to show it was served, so no ball ever crosses a Node border.

GEOMETRY. Every wire and every packet is derived from a block edge, never hand-typed.

Vertical: client, router, the fan bus, the Node row, the chip strip. The narration overlay really
covers the top-left corner, so the Node row starts at 310 and the client and router (the only blocks
above 300) sit at x >= 450, clear of it.

Horizontal: the three Nodes are the widest row, mirrored about MID_X, so the scheme spans
SCHEME_LEFT..SCHEME_RIGHT = 50..1150 and centres on 600. The chip strip spans that same extent 1:1.
```

### before `const statusChip = valChip({ x: SCHEME_LEFT, y: CHIP_Y, w: 300, h: CHIP_H, name: 'status.loadBalancer', value:`

```
The four chips span the scheme 1:1, from the Node-1 left edge to the Node-3 right edge, with even
20px gaps. The pool is declared by the operator but means nothing until an implementation exists,
and the mode and the path are outcomes of announcing, so all three read none at the start.
```

### before `function clearHL(s) {`

```
The inner app boxes are listed by key so the .highlight a reduced replay puts on them is cleared too:
clearPodHighlight only resets inline strokes. Every Node and Pod opacity goes back to full so the dim
the failover step puts on Node-1 cannot leak into a later step.
```

### before `},`

```
An address is allocated by a write, not by a packet: nothing travels here, so nothing moves and
nothing flashes. The two chips it fills simply light. Same reading as a declarative object being
installed.
```

### before `FANS.forEach((fan, i) => {`

```
Three separate client flows, staggered so they read as three, each hashed by the router onto a
different Node. Every flow is literal traffic: it runs the client wire, the router lights as the
first one lands, and each flow then rides its own fan to the Node it hashed to, whose Pod pulses
on arrival. No riding tags here: all three carry the same destination, and three copies of it
sweeping over the router at once would be noise rather than information.
```

### poster

```
Mirrors the diagram: clients above an upstream router, which fans down to three Nodes that each
hold a backend Pod. All three Pods carry the same tint and no ball rides the fan: the poster states
the composition, and which Node actually owns the address is what the steps go on to answer.
Geometry, same rules as the diagram: client and router centred on x=160, the three Nodes mirrored
about it, each Pod centred inside its Node, and every fan leg leaving the router bottom edge and
landing on a Node top edge without ever crossing one.
```

### before `narration: 'On bare metal there is no cloud-controller-manager, so nothing answers a Service of `

```
This narration carries the premise the deleted step-0 text used to supply: no
cloud-controller-manager, so nothing answers a Service of type LoadBalancer and it sits pending.

Deleting every step-0 narration catalog-wide on 2026-07-29 was right (the poster shows step 1's text,
so step 0's was read by nobody) and harmless on 102 cards. Here it orphaned a pronoun: the first
sentence a reader ever saw became `That gap is filled in-cluster instead`, with no gap named anywhere
on the card, and `status.loadBalancer: pending` lost its only explanation. Kept under 471 characters,
the length of this card's `bgp` narration, so the measured panel worst case stays where it was.
```

---

## network-model

### before `const RAISE = 64;                        // band/Pods/chips: net +10% up (lowered 5% from the old 96)`

```
Layout zones (viewBox 1200x640):
  - the kubelet box sits centred above the flat-network band. After the RAISE the band reaches
    up near the narration overlay, but only its empty left edge does, no essential text.
  - the CNI badge is tucked under the RIGHT END of the band (its right edge on SCHEME_R 1080)
    rather than parked past it. R5 measured the alternative: with the badge outside the band the
    content bbox can never centre, because the badge always adds CNI_W/4 to the centre no matter
    how the band is sized. Its connector is therefore a straight drop from the badge bottom-centre
    onto the bus spine INSIDE the band, which is the line it was always aiming at, instead of a
    dogleg into the band's right face.
  - one wide band represents the flat Pod network (a single L3 address space). Four Pods hang
    below it on different Nodes, each wired up to the band. Packets ride up the wire, along a
    dashed rail INSIDE the band, and down to the destination: one flat space, no NAT.
Standard contract (matches network-ipam-pod-cidr):
  - Pods are the shell + inner eth0 box, grouped so pulsePod animates both.
  - the band is infrastructure: it lights and flashes, it never pulses. Only Pods pulse.
  - the static wires and the moving packet share the same point arrays.
  - the one place a line sits BELOW blocks not above: the dashed rail lives inside the band.
Band, Pods and chips are raised by RAISE. The kubelet keeps its own higher raise, so the gap
between it and the flat-network band is wider.
```

### before `const POD_W = 180;                       // Pod block width (matches podBlock)`

```
Pod centres along the band, left to right, centred under it: equal end-margins and inner gaps
so the four blocks sit symmetric about the band centre (600) with no overflow. The cross-Node
hop runs A -> C.
```

### before `const CNI_W = 180, CNI_H = 72;`

```
CNI plugin badge: revealed on the last step, pushed to the far top-right, wired from its
bottom-centre down and into the RIGHT SIDE of the band (centred on that edge), to show it is
what implements the flat space.
```

### before `const podLocalX = [AX, BX, CX, DX].map(x => x - BAND_X);`

```
Flat dashed bus inside the band: a horizontal spine with a short tooth turning down toward
each Pod, so the bus abuts every Pod drop-wire at the band edge. No arrowheads here, the
bidirectional arrows live on the Pod wires.
```

### before `pulsePod(s.refs.podA, ctx, 0);`

```
Pod-to-Pod: the sender pulses first, the packet leaves at BEAT.afterPulse and rides the
band to the far Pod, which pulses on arrival. A src-IP tag rides WITH the packet and
arrives unchanged, which is the no-NAT point made visible.
```

### before `s.refs.natChip.classList.add('highlight');`

```
The src tag belonged to the Pod-to-Pod steps. The agent path is not a Pod source, so
clear it rather than leaving a stale 10.244.1.5. The value changes here, so the chip
stays highlighted as a participant rather than going dim beside its lit neighbour.
```

### before `const CNI_CONNECTOR = [[CNI_X, CNI_BOTTOM], [CNI_X, BUS_Y]];`

```
Review stage 2.4 family B listed `CNI_CONNECTOR` as a lane nobody rides. FALSE, snapped 2026-07-30: the
lane IS animated, with `marchWire` rather than a ball, which is this card's vocabulary for "this is
what implements the model" on the step that reveals the CNI plugin. No packet rides it because nothing
discrete travels: the plugin is not sending a message, it is the thing that makes the flat space exist.
```

---

## network-namespaces

### before `const POD_TOP = 160;      // Pod netns shell top`

```
Layout (viewBox 1200x640). The host stack and the Pod namespace line up so the veth reads as a
straight cross-namespace link landing dead on eth0, and the host block is vertically centered on
the Pod netns block.

  Host netns ╌╌veth╌╌> [ Pod netns ]   the dashed veth plugs into the Pod namespace boundary.

Inside the Pod netns shell every block plugs into ONE shared stack, drawn as a dashed rail (a bus)
that runs across the stack band. The two interfaces of that single stack hang off the rail: eth0
(the external door, in-Pod end of the veth) and lo (loopback). The two tenant containers (app,
sidecar) tap the same rail from above. So app, sidecar, eth0 and lo are all peers on one stack,
not wired one-to-one.

Connector convention (matches network-model / network-cni-invocation): every dashed line, the veth
and all five interior taps, is drawn ONCE in the same constant dim-dashed style and its opacity is
never changed per step. Progression is shown only by which blocks get .highlight and by the packets
that ride the connectors, never by fading wires in and out.

Choreography (motion follows the steps, blocks light via .highlight, only the Pod shell pulses):
  fresh  - only lo is live: lo lights and flashes, nothing flows yet.
  veth   - a packet crosses the veth, eth0 lights on arrival, the pod pulses.
  shared - app, sidecar and eth0 all light, a localhost packet rides app -> rail -> sidecar, lo lights.
  isolation - host, eth0 and lo stay lit (the live host link), the whole shared stack pulses as one
              private unit that lives and dies together.
```

### before `const band = rect({ class: 'netns-stack-band', x: BAND_CX - 204, y: 276, w: 408, h: 122, rx: 10,`

```
The shared network stack: a faint band, and inside it a dashed rail (the bus). app + sidecar tap
the rail from above, eth0 + lo from below, so all four are peers on ONE stack. The band, rail and
taps live in podGroup so they pulse as one unit with the pod.
```

### before `const hop = routePacket(s, ctx, LOCAL_PATH, { role: 'network' });`

```
One localhost packet rides app -> rail -> sidecar over the shared stack: it drops down the app
tap, crosses the rail and climbs the sidecar tap, so it traces both joins and the localhost
hop in a single motion. lo (the loopback that serves it) lights on arrival.
```

### poster

```
Host netns on the left, one centered dashed veth crossing into the Pod netns box. Inside, app +
sidecar on top and eth0 + lo below are all joined by one H-shaped shared-stack rail. Symmetric
about the Pod centre.
```

---

## network-netfilter-path

### before `const NODE_X = 40, NODE_Y = 305, NODE_W = 1120, NODE_H = 251;`

```
The netfilter path a packet takes (viewBox 1200x640). Every other Network Foundations card names an
OPERATION on a packet (kube-proxy DNATs, conntrack pins the flow, egress MASQUERADEs) without ever
saying WHERE in the kernel it runs. This card is that missing floor: the hooks, in order, with the
packet walking them. The order is the lesson, so the whole composition is one left-to-right chain and
the packet never doubles back on it: PREROUTING, the routing decision, FORWARD, POSTROUTING, the wire.

Standard contract: the Pod is a shell + inner box; only Pods pulse; the hooks, the conntrack table and
the NIC are infrastructure and light on packet arrival, never pulse; value chips never flash; packets
stop at block edges. The closing eBPF step carries no motion at all: it is a comparison, not traffic.

GEOMETRY. Every wire and every packet is derived from a block edge, never hand-typed.

Horizontal: the five blocks of the chain span the Node 1:1, from the PREROUTING left edge (70) to the
eth0 right edge (1140), with even gaps, and the chip strip spans exactly that same extent. The
conntrack table sits under the four hooks it belongs to (70..950) and stops where the wire begins,
because a packet on the wire is past it.

Vertical: the narration overlay really covers the top-left corner, so the Node frame starts at 305 and
the client Pod, the only block above it, sits at x >= 450, clear of the panel. Its packet drops
straight down and only turns left once it is INSIDE the Node, below the panel. The reply rides its own
lane (RETURN, y 360) above the chain rather than retracing the forward wires backwards, the same rule
every round-trip card here follows.

The conntrack ownership marker (CT_LINK) is a BRACKET, not a stub: it leaves PREROUTING at its
bottom-edge midpoint, steps across in the gap between the two rows, and lands on the conntrack
table's own top-edge midpoint (510). A straight stub from PREROUTING landed 335 units off that
midpoint, which reads as a lane pointing at nothing in particular and is what OFFEDGE reports. Both
ends of the bracket now sit on a face midpoint. Same shape on network-north-south-path.
```

### before `const hookChip = valChip({ x: CHIP_X[0], y: CHIP_Y, w: CHIP_W[0], h: CHIP_H, name: 'hook', value: 'none', role: 'network' });`

```
The four chips span the SCHEME 1:1, edge to edge with the Node frame (40..1160), which is the widest
element on the canvas, so the strip and the frame share both verticals and the composition reads as
one column. hook is where the packet is right now, dst and src are what it carries there, and
conntrack is what the kernel remembers about it. All four are outcomes of a packet in flight, so
they read the values it starts with and the steps rewrite them exactly where the kernel does.
```

### before `function clearHL(s) {`

```
The inner app box is listed by key so the .highlight a reduced replay puts on it is cleared too:
clearPodHighlight only resets inline strokes. Every dimmable block goes back to full opacity so the dim
the eBPF step puts on the chain cannot leak into a replay of an earlier step.
```

### poster

```
Mirrors the diagram: a Pod above the Node, and inside it the netfilter chain as one left-to-right row
of hooks ending at the wire, with the conntrack table docked under the hooks it belongs to. The row IS
the card (the order of the hooks is the lesson), so the poster is that chain and nothing else. No ball
rides it: where the packet gets rewritten is what the steps answer.
Geometry, same rules as the diagram: every dash starts and ends on a shape edge, and the entry only
turns left once it is inside the Node.
Three shapes on the way in, one band on the way back, nothing else. The two NAT hooks are the boxes,
and each carries the same rewrite glyph, one address chip becoming another: the destination on the way
in, the source on the way out. Between them the routing decision is a diamond, the only shape that is
not a box because it is the only one that CHOOSES, and it sits AFTER the first rewrite, which is the
whole reason the order matters: routing only ever sees the already rewritten address. The reply walks
none of it: the conntrack band under the rail IS the way back, unattached to any hook because it skips
them all, the reply riding it right to left. Walk the chain one way, ride the memory back.
FORWARD, the filter hook and the Node frame are left out on purpose: the card draws the full chain, the
poster only has to say why its ORDER is the point.
Geometry: the rail on y=65 symmetric about the diamond at x=160, the band under it, every dash starting
and ending on a shape edge.
```

---

## network-nodelocal-dnscache

### before `const FLOW_Y = 300;`

```
NodeLocal DNSCache (viewBox 1200x640). A Node box holds the client Pod and the node-local-dns agent,
with the upstream CoreDNS outside it on the right. Everything is centred on one flow line (FLOW_Y).

There are TWO hops, and each has its OWN pair of lanes: query out on FWD_Y, answer back on RET_Y.
A single shared wire would force the returning ball to retrace the outbound arrow, which reads as the
query bouncing rather than as an answer coming home. Every ball rides the wire that was drawn for it.

Content spans x 70..1120 (centre 595) and y 200..484, so it sits centred on the canvas. It cannot go
higher: the Node box starts at x=70, under the narration overlay, whose longest step here reaches
y=163 (measured, not assumed). 200 leaves ~37px of clearance.
```

### before `function setChips(s, { path, cache, up, ct }, lit = []) {`

```
Every step repaints ALL four readouts. Setting only the chips a step talks about leaves the others
showing the previous step: that is how the miss step came to claim `conntrack: no entry` while it was
busy opening a DNAT-ed TCP connection to the kube-dns ClusterIP, which does create one.
```

### before `setChips(s, { path: 'agent -> CoreDNS', cache: 'miss -> fill', up: 'TCP keep-alive', ct: '1 long-lived' }, ['c`

```
conntrack is NOT `no entry` here: the upstream leg is a real connection to the kube-dns
ClusterIP, so kube-proxy DNATs it and it is tracked. The win is that it is ONE long-lived entry
reused by every miss, not one fresh UDP entry per lookup.
```

### note (anchor dropped: `const asked = ask(s, ctx, { start: 0, label: 'dst 169.254.20` is not unique in the file)

```
Four hops, because the narration promises all four: the Pod asks, the agent misses and forwards
upstream, CoreDNS answers back to the agent, and only then does the agent answer the Pod. The
old version stopped at the upstream query, so the answer it claimed to cache never arrived.
```

### poster

```
Near traffic and far traffic. Everything the Pods ask stays on one short rail inside the Node,
where the local agent answers it, and a single thin thread climbs OUT of the Node to the cluster
resolver: that is the miss, and it is the only lookup that pays for the trip. The meaning is in the
distances, not the topology, so the poster keeps the Node boundary (the line the thread has to
cross) and drops everything else the card already draws, packet dots included.
```

---

## network-nodeport-loadbalancer

### before `const CX = 600;                        // canvas centre: the client, the LB and the fan origin sit on it`

```
NodePort and LoadBalancer (viewBox 1200x640). External client sits above the LB (top-left is the
narration zone), the LB fans down to every Node through a right-angle bus, and the chosen Node
DNATs to a backing Pod. Standard contract: Pods are shell + inner box; only Pods pulse; value
chips never flash; a packet-less pod-less step gets one box flash. Packets stop at block edges.

GEOMETRY (R5, 2026-07-27). One Node grid drives everything: three frames of 300 spanning
SCHEME_L 80 .. SCHEME_R 1120, and NODE_CX centres the nodePort chip, the backend Pod and the bottom
info chip of each column. The two backend Pods sit on the OUTER Nodes (1 and 3), not on 1 and 2:
that is what puts the low-block bbox on 600, and it also puts the Pod-less Node in the middle,
where the nodePort step wants it ("even on Nodes that run no backend Pod"). The Node-3 Pod IP moved
from 10.244.2.7 to 10.244.3.9 with it, so the per-Node CIDR the card sets up by example still holds.
```

### before `const toLb = segmentPacket(s, ctx, { from: C_TO_LB[0], to: C_TO_LB[1], role: 'network' });`

```
client -> LB (down), then LB picks Node-1 along the right-angle fan; the nodePort lights.
The tag on the LB leg names the Node and its nodePort, since the balancer has already rewritten both: it emerges from the client into the first gap,
vanishes into the LB, then re-emerges out of the LB bottom and rides the fan to the Node. Each
leg only shows the text in the open gap between blocks, never sliding it over the LB itself.
```

### poster

```
Client to LB, fanning out to node ports across three nodes.
External client on top -> cloud LoadBalancer (ccm provisioning it from the right) -> a right-angle
fan down to three Nodes, backend Pods only under two of them (the third Node runs no Pod).
```

### before `const TO_N2 = [[CX, LB_BOTTOM], [CX, NODE_Y]];`

```
Review stage 2.4 family B listed `TO_N2` and `TO_N3` as lanes nobody rides. DECLINED 2026-07-30 under
the canon rule that N destinations get N wires: a NodePort opens the SAME port on EVERY Node, which is
the card's whole first claim, so all three lanes have to exist for the reader to see that any Node
would have served the request. One step takes one of them, and which one is the arbitrary part.

`network-headless-service`'s `TO_W2` was already accepted on this basis and is the precedent.
```

---

## network-north-south-path

### before `const FLOW_Y = 356;                 // spine: client, cloud LB, kube-proxy and the Pod are centred on it`

```
North-south request path (viewBox 1200x640). NORTH-SOUTH is the name of the thing being drawn:
traffic crossing the cluster boundary, as opposed to east-west Pod to Pod traffic. Instead of a bare
full-height divider line, the composition is framed by two faint regions: an outside-the-cluster box
on the left holding the client and cloud LB, and the Node box on the right holding kube-proxy,
conntrack and the Pod. The empty GAP between the two regions IS the boundary, and the ball visibly
crosses it once on the way in (LB2KP) and once on the way out (KP2LB).

Standard contract: the Pod is a shell + inner box; only the Pod pulses; infrastructure (client, LB,
kube-proxy, conntrack) lights via lightBoxAt and never pulses; value chips never flash; packets ride
the wires and stop at block edges.

GEOMETRY. Every wire and every packet is derived from a block edge, never hand-typed.

Vertical: two lanes, FWD_Y above and RET_Y below the spine, because this card is a ROUND TRIP. A
single retraced lane would send the reply backwards along a right-pointing arrowhead. Every block on
the path is centred on FLOW_Y, so both lanes meet every block on its edge. The narration overlay
really covers the top-left corner, so the client and LB blocks sit at y >= 315 while the faint region
boxes frame up to REGION_TOP to fill the top of the canvas and pull the whole scheme up and centred.

Horizontal: client and cloud LB live in the outside region, kube-proxy, conntrack and the backend Pod
live inside the Node region. conntrack is a real block here rather than a word in the narration: it is
what pins the flow on the way in and what unwinds the DNAT on the way out, and it fills the Node
interior. The framed diagram and the info-chip strip both span the same width, from the outside region
left edge (22) to the Node region right edge (1176), so the scheme reads as one column.

The conntrack ownership marker (CT_LINK) is a BRACKET: it leaves kube-proxy at its bottom-edge
midpoint, steps across in the gap between the rows, and lands on the conntrack table's own top-edge
midpoint (860). A straight stub down from kube-proxy landed 175 units off that midpoint, which is
what OFFEDGE reports. Same shape as network-netfilter-path.

Addresses ride ALONG with the ball (ridingLabel) instead of sitting as static wire text. That is the
whole point of the card: the same packet carries dst 203.0.113.9:443, then dst 192.168.1.20:31000,
then dst 10.244.2.7:8080, and the reply unwinds those same three values as src. As inline wire text
the longest of them overflowed its 80-unit gap and printed straight through the Pod border.
```

### before `const REGION_TOP = 264, REGION_BOT = 488;`

```
Two faint framing regions replace the old full-height divider line. Both share the same top and
height so they read as a matched pair, and the empty gap between them (EXT right 492 .. Node left 540)
is the cluster boundary the north-south hops cross.
```

### before `const extRegion = node({ x: EXT_X, y: REGION_TOP, w: EXT_W, h: REGION_H, label: '' });`

```
The two faint framing regions. Both use the node() primitive so they read as one matched pair of
barely-visible dashed containers: left is everything outside Kubernetes, right is the Node. The
outside region carries its title at the BOTTOM-left instead of the top so the narration overlay
(which sits over the top-left) never hides it.
```

### poster

```
Client and cloud LB outside a full-height cluster edge, kube-proxy + conntrack + Pod inside the
Node. Two lanes (request above, reply below) make the round trip read as a loop, not a retrace.
North-south = crossing the cluster boundary and coming straight back. Two faint framed regions
(outside | Node) separated by a gap that IS the boundary: a request packet crosses it left to right
on the top lane, the reply crosses right to left on the bottom lane. Inside the outside region a
client square feeds a LB pill, inside the Node a kube-proxy pill hands off to the backend Pod while
a 2x2 conntrack/NAT table sits under it. Abstracted from the dialog so it reads as a boundary
crossing and a round trip, not a row of boxes.
```

---

## network-pod-egress-snat

### before `const EGRESS_Y = 360;               // vertical center of the Pod and masquerade boxes: both lanes sit symmetr`

```
Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. A Node box
holds the client Pod and the MASQUERADE box; the Internet box sits OUTSIDE it in its own right-hand
column, its top level with the Node frame (NET_Y = NODE_Y), above the egress lanes. It used to be
lifted to y110, i.e. above the panel bottom (measured 181 here), which left the three blocks that
DO sit below the panel spanning 110..630 and centring on 370: CENTRE-LOW. Levelling it with the
Node frame is what puts that row on 600, and the forward leg still turns UP out of the Node into
it. Forward and return traffic ride SEPARATE parallel lanes so the round trip
reads as a loop: the request goes out along the upper lane (FWD_Y) and turns up into the Internet
box, the reply comes down and returns along the lower lane (RET_Y). Both lanes sit inside the box
heights so a ball never travels under a box. The Node left edge and the Internet right edge line up
with the leftmost (src) and rightmost (dst) chips below, so the top row and the info strip share
extremes. The SNAT and the reverse SNAT happen INSIDE the masquerade box, so the ball fades at one
edge and re-emerges at the far edge. masquerade/net are infrastructure: they light, they never
pulse. Only the Pod pulses. Source/destination IPs are not inline wire text: they ride ALONG with
the ball on each hop (ridingLabel), forward on send/masquerade and in reverse on reply/deliver.
```

### before `const OUT_PATH = [[MASQ_RIGHT, FWD_Y], [FWD_UP_X, FWD_Y], [FWD_UP_X, NET_BOTTOM]];`

```
Forward leg as one right-angle path: out from MASQ_RIGHT along FWD_Y, then up at FWD_UP_X into the
box bottom. Return leg mirrors it on the lower lane: down at RET_DOWN_X, then back along RET_Y to
MASQ_RIGHT. Each static wire and its moving ball share the exact array. Both ends sit at block
edges so the ball never travels under a box.
```

### before `const back = routePacket(s, ctx, RET_PATH, { role: 'network' });`

```
Return lane: the reply ball descends out of the Internet box and runs back along RET_Y into
the masquerade box (reverse SNAT inside), which lights on arrival. The dst it still carries
(node IP) rides along.
```

### poster

```
A Node wrapping a client Pod (outer shell + inner app) and a MASQUERADE box, with the Internet as
a small globe off to the right. Two dashed lanes cross the SNAT boundary as a round trip: the
request runs left to right on the top lane, the reply runs right to left on the bottom lane,
chevrons mark the direction. Pod, masq and internet share one centre row.
```

---

## network-pod-ip-and-veth

### before `const LINK_Y = 396; // shared y for the veth link, the loopback link and the packets on them`

```
Layout zones (viewBox 1200x640): top band reserved for the narration overlay, the Node and
everything inside it sit in the y228..528 band (lifted for balance, with a gap to the chip
strip at y560), so the CNI plugin stays inside the Node box and nothing touches the panel.
Every packet rides exactly along a dashed link (segmentPacket endpoints == link endpoints).

Horizontally the inner row is CENTRED IN ITS FRAME, and that is a derivation rather than a set of
typed x values: INNER_W = Pod shell + the veth run + the bridge column, and POD_X = NODE_X +
(NODE_W - INNER_W) / 2. Before R5 the row sat at 150..960 inside a frame spanning 80..1120, i.e. 70
of margin on the left against 160 on the right, which CENTRE-LOW reported as a bbox centred on 555.
```

### before `root.appendChild(nodeEl);`

```
Z-order (bottom -> top): Node background, then the boxes, then the wires + their
labels ON TOP of the boxes (so a connector that crosses a box stays visible and the
text is selectable), then the value-chip strip, and finally the packet layer so the
ball rides above everything.
```

### before `s.refs.appBox.classList.add('highlight');`

```
Sequence (no pulses, just persistent highlight borders like the workloads cards):
the app block lights first and stays lit, then the loopback ball travels, then the
pause block lights on arrival.
```

### poster

```
The scheme in miniature, workloads/cluster style (brightness hierarchy + one bright accent):
the Pod netns holds pause (bright, the netns owner) and app (dim), a single bright IP bar spans
both (one address, shared), and the hero is the veth pair: two lit end-nodes (eth0 in the Pod
and its host-side peer) joined by a dashed link out to the cni0 host bridge.
```

---

## network-pod-localhost

### before `const SHELL_X = 620, SHELL_Y = 174, SHELL_W = 500, SHELL_H = 320;  // [620..1120] spans the bind + Pod IP chip`

```
Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. The two blocks
positioned over the chip strip below: the client Pod is centred over the leftmost chip (path),
centre x205, and the Pod shell spans the two rightmost chips (bind + Pod IP), x620 to x1120.
They share one vertical centre (y334), so the external lane between them is a straight,
centred horizontal hop. Inside the shell a symmetric 2x2 grid holds the two containers up top
(app, sidecar) and the two shared interfaces down low (eth0, lo). Two lanes: the localhost lane
(app <-> sidecar, y262) never leaves the Pod and is served by lo, and the external lane carries
outside traffic across the gap to the shared eth0. The Pod is the unit that pulses, the containers
and interface boxes are infrastructure that light.
```

### before `const EXT_PATH = [[CLIENT_EDGE, SHELL_CY], [SHELL_X, SHELL_CY]];`

```
External lane: one straight, centred horizontal hop across the gap, at the shared vertical centre
of both Pods. The destination address rides ON the moving ball (ridingLabel), so there is no
static inline label to collide with anything.
```

### before `pulsePod(s.refs.client, ctx, 0);`

```
Pod to Pod: the sending client pulses first, the packet leaves at BEAT.afterPulse and rides
one straight hop to the shared eth0, carrying its dst address as a riding label. On arrival
the receiving Pod pulses to acknowledge the packet, and the shared eth0 plus the answering
app light.
```

### poster

```
One Pod box with two containers linked over a short localhost lane.
Two containers side by side, both wired into one shared loopback node (lo, 127.0.0.1) in the
middle: they share localhost and one network stack. Sub-blocks centred inside the Pod.
```

---

## network-pod-to-pod-cross-node

### before `const VETH_Y = 338;       // veth links inside each node + the short packets on them`

```
Layout zones (viewBox 1200x640):
  - top band y<210 is reserved for the narration overlay; nothing essential lives there.
  - topology band y220..450 carries both Nodes, each with a Pod (shell + eth0 box) and the
    node cni0 dataplane box. Lifted ~50px from the first cut for vertical balance.
  - the physical underlay runs BELOW the nodes at UNDERLAY_Y; the cni0-to-cni0 link is ONE
    continuous turning path (cni1 bottom -> underlay -> cni2 bottom), not three arrows.
  - value-chip strip at y538 spans exactly Node-1's left edge to Node-2's right edge.
Each Pod is the canonical shell+inner-box block (matches the same-node / veth cards): a
translucent pod shell wraps an eth0 container box in one <g>, so pulsePod animates both
rects together and the whole Pod blinks as a unit. The pod and cni0 blocks are spaced so the
veth wire label fits in the gap without touching a block, while the cni0 stays inside the Node.
Every packet rides ONLY along the visible dashed wires in the gaps between blocks, never
over or under a block: a hop ends at a block edge (the ball fades out there) and the next
hop starts from the far edge of that block, so the ball appears to enter the block and
re-emerge on the other side. Short veth hops use segmentPacket (linear); the cross-underlay
leg uses routePacket over the SAME point array as the underlay pathArrow so wire and ball agree.
```

### before `const UNDERLAY_PATH = [[CNI1_X, CNI_BOTTOM], [CNI1_X, UNDERLAY_Y], [CNI2_X, UNDERLAY_Y], [CNI2_X, CNI_BOTTOM]]`

```
The cross-underlay leg, cni1 bottom -> underlay -> cni2 bottom, as one turning polyline. It
starts and ends at the block bottom EDGES, so the ball never travels under a cni0 box. The
static underlay pathArrow and the moving packet share this exact array.
```

### before `root.appendChild(node1);`

```
Z-order (bottom -> top): Node backgrounds, then the cni0 boxes and Pods, then the wires +
labels ON TOP of the blocks (so dashed links and text stay crisp), then the chip strip, and
finally the packet layer so the ball rides above everything. The ball never overlaps a block
anyway (every hop lives in a gap and stops at a block edge), so no occlusion trick is needed.
```

### before `pulsePod(s.refs.podA, ctx, 0);`

```
Up-arrow: A pulses first, then the packet travels the full Pod A -> Pod B journey as three
wire-only hops. Each hop ends at a block edge and the next starts from the block's far edge,
so the ball visibly enters a cni0 and re-emerges on the other side, never sliding over it.
```

### poster

```
Two nodes joined by an underlay carrying an encapsulated packet.
The hero is encapsulation itself: Pod A on Node-1 to Pod B on Node-2, and mid-gap the packet is
a packet-in-packet, a bright inner Pod frame wrapped inside an outer Node header. Source Pod is
bright, dest dim, the wrapped packet crosses the inter-Node gap on a dashed flow. Nesting reads
as the Pod frame carried between Nodes inside an outer envelope (VXLAN, or bare when routed).
```

---

## network-pod-to-pod-same-node

### before `const POD_MID = 380;          // vertical centre of the pod / cni0 blocks`

```
Layout zones (viewBox 1200x640):
  - top band y<255 is reserved for the narration overlay; nothing essential lives there.
  - topology band y255..505 carries the Node, both Pods (shell + eth0 box) and the cni0 bridge.
  - value-chip strip sits at y540, below everything and clear of the overlay.
Each Pod is the canonical shell+inner-box block (matches the workloads/cluster cards):
a translucent pod shell holds an eth0 container box, so the whole group pulses as one.
The veth pair is drawn as TWO directional lanes, symmetric about the block centre:
  - top lane  (TOP_Y) carries the forward direction A -> B (ARP request + data frame)
  - bottom lane (BOT_Y) carries the return direction B -> A (the ARP reply)
Every packet rides exactly along its lane's arrow (segmentPacket endpoints == arrow
endpoints == block edges, no overshoot into a box).
```

### before `pulsePod(s.refs.podA, ctx, 0);                // A broadcasts the request (blink first)`

```
A pulses FIRST and fully; the request ball departs only once that blink has
landed (BEAT.afterPulse), per the up-arrow choreography. The ARP exchange is a
round trip: request floods A -> bridge -> B on the top lane, then B unicasts its
reply B -> bridge -> A on the bottom lane.
```

### poster

```
Two pods on the same node, bridged through cni0.
Same shape as the cross-node card but wholly inside ONE big Node block (both Pods share it): Pod
A (bright source) and Pod B (dim dest) flank the cni0 bridge, joined by clean dashed veths (no
packet dots). The hero is the bright frame sitting BARE inside the bridge, no outer wrapper,
which is the same-node point: switched at layer 2 with no NAT and no encapsulation.
```

---

## network-service-cidr

### before `const SCHEME_L = 120, SCHEME_R = 1080;   // content edges, mirrored about x=600`

```
Layout zones (viewBox 1200x640):
  - the top-left band is reserved for the narration overlay, so the pool box
    sits at x>=440 and the bands start at y=320.
Sibling card: network-ipam-pod-cidr (the pod-CIDR allocation analog). This is the Service-side
twin: one configured Service CIDR splits into a static and a dynamic band, hand-picked IPs come
out of the static band, the allocator draws ClusterIPs from the dynamic band, and a second
ServiceCIDR can be added to grow the range. There are no Pods, so motion is packets + box
.highlight + an arrival ripple (only Pods pulse, and this card has none).

Alignment grammar (the common rule every wire follows, mirrors ipam-pod-cidr):
  - One horizontal distribution rail per fork. The pool forks on the y230 rail to each band
    centre, the bands fork on the y428 rail to their Services. Every drop lands on a box centre.
  - Services sit on an even 260 / 600 / 940 grid, edges flush with the band bar (120..1080).
  - The add-on CIDR is stacked directly over the web column (x940), so add-on -> dynamic band ->
    web read as one vertical line on the extend step instead of a stray top-right box.
  - The static pathArrow and the moving packet share the same point array so the ball rides
    exactly on the wire.
  - The IPAddress chip is a FULL-WIDTH bottom strip (SCHEME_L..SCHEME_R), not a 280-wide cell
    parked under the web column. Two findings closed at once: a lone 280-wide chip at 800..1080 is
    a chip strip centred on 940, and the value it carries (10.96.137.42 . default/web) did not fit
    beside its own name in 280, the one chipfit collision the catalog carried into R5. The binding
    to web is not lost, because the value names the Service.
```

### before `const aSplit1 = pathArrow({ points: SPLIT_STATIC, dashed: true, dim: true });`

```
Dim dashed wires: pool splits into both bands, static band feeds the two well-known
Services, dynamic band feeds web, and the add-on CIDR feeds the dynamic band (hidden until
the extend step). They sit ABOVE the blocks so the bright ball reads on a muted wire.
```

---

## network-service-clusterip

### before `const FLOW_Y = 312;                 // center line: client, kube-proxy and the two fans are symmetric about it`

```
Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. The client sits
on the center line (FLOW_Y) facing kube-proxy, and the two backend Pods sit SYMMETRIC above and
below that line, podY the exact vertical mirror of podX. Each backend is wired to kube-proxy by a
forward fan (kube-proxy -> Pod) and a return fan (Pod -> kube-proxy) of the identical shape, so the
arrows travel the same on top and bottom and always meet a Pod at its left edge. The virtual
ClusterIP is lifted ABOVE kube-proxy (it owns no interface, the packet never reaches it, kube-proxy
intercepts). Forward and return traffic ride SEPARATE lanes so a round trip reads as a loop, never a
retrace. The DNAT and the reverse NAT happen INSIDE kube-proxy, so the ball fades at one edge and
re-emerges at the far edge. vip and kube-proxy are infrastructure: they light, they never pulse.
Only Pods pulse. Addresses ride ALONG with the ball on each hop (ridingLabel), not as inline wire
text: the ClusterIP dst on the way in, the Pod IP after DNAT, the Pod IP then the reversed ClusterIP
src on the way back. Flow 1 runs to podX (send/dnat/reply), flow 2 to podY (balance/balance-reply).

GEOMETRY (R5, 2026-07-27). This card is the Networking exemplar, so its extents are the ones other
networking cards copy: CX 600, SCHEME_L 60, SCHEME_R 1140, the same L/R/CX the Workloads canon (WL)
uses. Everything is derived from those three: the client on SCHEME_L, the ClusterIP and kube-proxy
column mirrored about CX (KP_LEFT/KP_RIGHT = CX -/+ KP_W/2), the backend column flush on SCHEME_R,
and the two fan buses offset from KP_RIGHT. Before R5 the whole drawing sat 50 units left of that,
so the middle column stood on 550 and the content bbox on 550 with margins 70 / 170.

The chip strip spans SCHEME_L..SCHEME_R with even gaps but UNEQUAL widths (270 / 310 / 225 / 215),
each sized for its own longest value: DNAT carries `-> 10.244.2.7:8080` and needs the widest cell.
Four cells in one row cannot all reach the 350 floor a bottom strip normally wants, and this row
predates that floor; check-chipfit measures it clean, which is the test that matters.
```

### before `const LANE_FWD = [[CLIENT_EDGE, FWD_Y], [KP_LEFT, FWD_Y]];`

```
Each static wire and its moving ball share the exact same array, and podY's fans are the vertical
mirror of podX's, so both backends are wired identically. Both ends sit at block edges so a ball
never travels under a box.
```

### before `const SLOWMO = 1.1;`

```
This card glides its packets 10% slower than the shared canon speed (routeDur). Only the ball
travel is slowed, via an explicit dur; every other beat (pulses, hops, step floors) stays on the
standard canon, so the overall process matches every other card. Riding src/dst-IP labels use the
same slowDur so they stay locked to the ball. Registered in tools/check-canon.mjs ALLOW_EXPLICIT_DUR.
```

### before `const cWireFwd = arrow({ x1: CLIENT_EDGE, y1: FWD_Y, x2: KP_LEFT, y2: FWD_Y, dashed: true, dim: true, role: 'network' });`

```
Client <-> kube-proxy lanes (upper forward, lower return). The vip->kproxy ownership link. Then
the four backend fans: forward and return for podX (top) and their vertical mirror for podY
(bottom), so both Pods are wired to kube-proxy identically.
```

### before `const ownLink  = relationPath({ points: [[CX, VIP_BOTTOM], [CX, KP_TOP]], role: 'network', dash: '5 5' });`

```
Ownership marker, NOT a traffic path: kube-proxy realizes this virtual IP. No packet ever
travels it (the ClusterIP never appears on a wire), so it is a plain dashed line with no
arrowhead, to read as an association rather than a wire missing its ball.
```

### before `const vipChip  = valChip({ x: CHIP_X[0], y: CHIP_Y, w: CHIP_W[0], h: CHIP_H, name: 'clusterIP', value: '10.96.0.20:80', role: 'network' });`

```
The four chips span the full block width of the scheme 1:1: the leftmost starts at the Client
Pod left edge (x=70) and the rightmost ends at the backend Pod right edge (POD_LEFT+POD_W=1030),
with even 20px gaps. Widths are tuned to their content (DNAT carries the longest value).
```

### before `clearHighlights(s, ['vip', 'kproxy', 'vipChip', 'dnatChip', 'ctChip', 'backChip', 'clientBox', 'podXBox', 'pod`

```
The inner app boxes (clientBox/podXBox/podYBox) are listed so their .highlight is cleared every
step: without them a highlight set in a reduced-replay block would leak into later steps, since
reduced replay never runs the forward motion path that would otherwise re-clear them. Both Pod
opacities reset to 1 so a dim set by an earlier flow does not persist into the next.
```

### before `},`

```
The endpoint IPs the rules point at are named in the DNAT chip. The backend Pods are NOT
highlighted yet: nothing has been DNAT-ed to them at this stage, they light only when a flow
actually lands on them (dnat / balance). Here only kube-proxy is the actor.
```

### before `const give = routePacket(s, ctx, FAN_FWD_X, { dur: slowDur(FAN_FWD_X), role: 'network' });`

```
Down-arrow: the DNAT-ed packet emerges from kube-proxy (the rewrite happened inside it) and
rides the forward fan to the chosen Pod, which pulses on arrival. The rewritten Pod IP rides
with the ball.
```

### before `pulsePod(s.refs.podX, ctx, 0);`

```
Up-arrow first: the chosen Pod pulses, then the reply leaves along the return fan carrying the
Pod source IP and reaches kube-proxy, which lights as it reverses the NAT inside the box. The
ball hides at the kube-proxy right edge and re-emerges at the left edge carrying the restored
ClusterIP source, then runs the return lane to the client, which pulses on arrival.
```

### before `pulsePod(s.refs.client, ctx, 0);`

```
Second connection, mirror of the first flow but to podY: the client pulses, the packet runs the
forward lane to kube-proxy carrying the ClusterIP dst, then the DNAT-ed packet emerges and rides
podY forward fan (down) to the OTHER backend, which pulses on arrival. Flow 1 stays on podX.
```

### before `pulsePod(s.refs.podY, ctx, 0);`

```
Exact mirror of reply, but for podY on the lower fans: podY pulses, the reply rides podY return
fan (up) to kube-proxy, which lights as it reverses the NAT inside the box, then the ball hides
at the right edge, re-emerges at the left with the restored ClusterIP source and runs the return
lane to the client, which pulses on arrival.
```

### poster

```
Abstract, not the literal diagram: a client feeds a dashed virtual ClusterIP ring (it owns no
interface), which kube-proxy intercepts at a solid pivot and fans to two symmetric backends, one
chosen (lit) and one alternative (dim). The one-of-many DNAT, distilled to a hub and a fan.
```

---

## network-service-ports

### before `const FLOW_Y = 312;                 // shared vertical center of both Pods and the Service box`

```
Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. One straight
left-to-right flow along FLOW_Y, client Pod -> Service -> backend Pod, so every hop is a crisp
horizontal segmentPacket (linear). The port translation happens INSIDE the Service box: kube-proxy
DNATs port -> targetPort, so the ball fades in at the Service left edge on the dial hop, the map
step flashes the box where the rewrite lives, then the ball re-emerges from the Service right edge
on the deliver hop. The Service is infrastructure: it lights on packet arrival (lightBoxAt), it
never pulses. Only Pods pulse. This card is a one-way flow (no reply is shown), so there is no
return lane. The two values that travel do not sit as static wire text: they ride ON the ball
(ridingLabel). The client dials web:80 on the dial hop, and the named-port resolution http -> 8080
rides on the deliver hop. The chip strip below tracks the four port numbers as fixed facts.
```

### before `const give = segmentPacket(s, ctx, { from: DELIVER_PATH[0], to: DELIVER_PATH[1], role: 'network' });`

```
Down-arrow: the packet re-emerges from the Service right edge (DNAT done inside) and is
delivered to the backend Pod, which pulses on arrival. The resolved named port http -> 8080
rides with the ball.
```

### poster

```
Abstract, not the literal diagram: the client-facing port lives on one level and the container
targetPort on another. Traffic enters the Service high on the front-door plane and leaves low on
the container plane, and the vertical step through the box is the port -> targetPort remap. A ring
centred on each dashed hop marks the port on that plane: the front-door port and the container port.
```

---

## network-service-terminating-endpoints

### before `const FLOW_Y = 326;                     // center line: client and kube-proxy are centred on it`

```
Terminating endpoints and connection draining during a rollout (viewBox 1200x640). This is the
story of the few seconds while a backing Pod shuts down, and why a clean rollout drops nothing.
Layout: the Client sits left on the center line facing kube-proxy in the middle, and two backend
Pods sit on the right, web-a (stays Ready, top) and web-c (the one being retired, bottom). Two
right-angle fans run from kube-proxy to each Pod (entering the Pod at 90). The bottom chip strip is the endpoint state that
actually drives routing: web-c endpoint conditions (ready / serving / terminating), where new
connections are allowed to land, and the grace-period window.

Standard contract: Pods are shell + inner box and pulse as one, kube-proxy is infrastructure (it
lights, never pulses), value chips never flash (they light via lightBoxAt or carry .highlight as
durable state). What MOVES rides on the ball: each hop tags itself new conn or in-flight via
ridingLabel, so there is no inline wire text to collide with the boxes. web-c dims as it leaves
the serving set but keeps a serving flow during the drain window.
```

### before `const LANE  = [[CLIENT_EDGE, FLOW_Y], [KP_LEFT, FLOW_Y]];                                              // clie`

```
across every step so the fade never reads as a new state
Each static wire and its moving ball share the exact same array. The fans are right-angle routes:
out of kube-proxy horizontally, up or down the shared bus, then straight into the Pod left edge at 90.
```

### before `const drain = routePacket(s, ctx, FAN_C, { delay: 0, role: 'network' });`

```
Two flows at once. The in-flight connection keeps draining to web-c (a packet on the web-c fan,
web-c pulses through its dimmed state on arrival). As it lands, a fresh connection starts from
the client, runs the lane and the web-a fan, and web-a pulses. New and in-flight, side by side.
```

### poster

```
Client to kube-proxy, which fans at right angles to two symmetric backends: web-a (Ready, top,
solid, neutral endpoint bar) takes new connections, while web-c (Terminating, bottom, dashed) is
still serving one in-flight flow, shown by the cyan drain lane and its cyan serving bar. The solid
vs dashed pair is the whole idea: one healthy backend and one that is draining before it leaves.
```

---

## network-service-types

### before `const TYPE_X = 210, TYPE_W = 280;          // type column: left edge + width (right edge 490)`

```
Layout zones (viewBox 1200x640): this is a MAP card, not a traffic flow, so there is no round
trip, no return lane and no bottom chip strip. The whole composition is centred on the canvas:
the type column and the target column sit symmetric about x600 (210..990), with the narration
overlay floating over the empty top-left margin. The type column starts at x210, LEFT of the
panel's right edge, so the rows have to clear the panel by height instead: ROW0 moved 132 -> 186
in R5 because the panel measures bottom <= 181 here and the top ClusterIP row was 46% under it.
Moving the columns right instead was measured and rejected: it puts the content bbox on 740.
Five Service-type rows on the left point STRAIGHT ACROSS to their targets on the right, one row
each. ClusterIP, NodePort and LoadBalancer all proxy to the same shared backend node (they stack,
each builds on the one above), while ExternalName and Headless are the odd ones out (no proxy, no
selector) and point at their own boxes.
Standard contract (Jul motion canon + core-networking pod build, as a map card):
  - Only Pods pulse. Boxes and the backend node light via lightBoxAt, SYNCED to the packet
    arriving on that row, never instantly.
  - Pods are the core-networking build: a shell plus an inner app/eth0 box, grouped so pulsePod
    animates both (matches network-model / network-service-clusterip).
  - Every arrow is a straight horizontal hop at its row centre. Exits are centred on the type box
    right edge, entries are centred on the target left edge. The three proxy entries land on the
    backend node symmetric about its vertical centre (221 / 309 / 397 about 309), so the fan reads
    balanced with no angled lines.
  - Each hop carries a short ridingLabel tagging the MECHANISM the row uses (via kube-proxy for the
    three proxy types, CNAME for ExternalName, Pod IP direct for Headless).
  - The three proxy rows forward to a backend, so they read down-arrow: packet first, then the
    receiving Pod pulses on arrival. ExternalName and Headless target boxes, not Pods, so there is
    no pulse there, only the arrival ripple plus the target box lighting.
  - Each static arrow shares the exact endpoints of the packet route on that row.
```

### before `const aCI = arrow({ x1: TYPE_EDGE, y1: cy(Y_CI), x2: TGT_X, y2: cy(Y_CI), dashed: true, dim: true, role: 'network' });`

```
Straight horizontal arrows, each from a type box right edge to its target left edge at the row
centre. The three proxy entries sit symmetric about the node centre. Endpoints match the packet
routes exactly.
```

### poster

```
A stack of Service-type rows fanning into one shared backend block.
The scheme in miniature, centred: five service-type rows on the left point STRAIGHT ACROSS to
their targets. The three proxy types (top) share one dashed backend node holding two Pods, while
ExternalName and Headless each get their own box.
```

---

## network-tls-termination

### before `const FLOW_Y = 312;`

```
Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. The flow runs
left to right along y312, external client -> Ingress controller -> backend Pod, with the TLS
Secret sitting above the Ingress as the source of the certificate. TLS is decrypted INSIDE the
Ingress box. The client and Ingress are infrastructure (they light, never pulse); only the
backend Pod pulses.
```

### poster

```
Client -> Ingress (the termination point, fed by a TLS Secret) -> backend Pod. Abstraction: a
CLOSED padlock rides the inbound leg (encrypted https) and an OPEN padlock rides the outbound leg
(decrypted plain http), so the poster reads the encrypted-to-plaintext handoff at a glance.
```

---

## network-traffic-distribution

### before `const FLOW_Y = 320;                          // central flow line`

```
Layout zones (viewBox 1200x640): the narration overlay is a fixed panel over the top-left
(measured bottom <= 255 here), so the client sits on the left below it. The two setting chips used
to stack under the client, which put the chip strip at 120..440 and centred it on 280: the zone
frames own everything right of 740 from y340 down, so no arrangement in that left band can reach
x=600. They are a full-width BOTTOM strip now (two 530-wide cells spanning SCHEME_L 60 ..
SCHEME_R 1140), which is the grammar the rest of the networking category already uses, and the
client moved to SCHEME_L so the content bbox lands on 600 with it. The whole
flow is centred on y=320 (client -> kube-proxy -> zones) and on x=600. Each zone stacks its two
Pods VERTICALLY, so the fan from kube-proxy reaches every Pod at its own left edge over a shared
vertical rail at x=700, with no route crossing another Pod. The client and the two zones are
symmetric about y=320.
Standard contract: only Pods pulse, boxes light via .highlight, the fan routes are shared by the
static wires and the moving packets. A connection is client -> kube-proxy (the decision point)
-> the chosen backend, so the client pulse always leads into real traffic.
```

### before `const FAN_SLOW = 1.6;`

```
kube-proxy forwards to one backend: a packet rides the fan route, the Pod pulses on arrival. When
ipTag is given, the client source IP rides with the ball so the chosen backend is tagged. The fan
is deliberately slowed (routeDur * FAN_SLOW) so the tag stays readable, and the label rides the
SAME dur so it stays locked to the ball. Speed stays distance-normalized: one shared multiplier.
```

### before `const FAN_A2 = [KP, [RAIL_X, FLOW_Y], [RAIL_X, A2Y], [POD_L, A2Y]];`

```
Review stage 2.4 family B listed `FAN_A2` as a lane nobody rides. DECLINED 2026-07-30, same reason as
the nodeport fan: it is the endpoint the traffic distribution did NOT pick on this step, and the point
of the card is that the choice was made among the drawn candidates rather than forced.
```

### before `const arr2 = clientHop(s, ctx, BEAT.afterPulse + 540);`

```
The narration says TWO connections from the same client can land in different zones, and the step used
to fire both fans at the identical delay off ONE client hop, which reads as a single connection being
split across two backends: the one thing a connection cannot do. The step's own inline comment said
`one connection` and contradicted its own narration.

A second client hop, staggered by the same 540 `session-affinity` uses, makes the two rides read as
two connections. No second pod pulse: `PULSE_POD.ms` is 900 against a 540 stagger, so the second would
composite over the first on the same element, and `session-affinity` already establishes one pulse per
step with two rides. Duration 4600 for a 4412ms span, the figure its sibling carries.
```

---
