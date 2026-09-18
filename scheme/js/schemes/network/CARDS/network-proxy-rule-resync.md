## network-proxy-rule-resync

### layout

```
WHAT     A loop with a clock on it. One axis is time: every Service or EndpointSlice change kube-proxy
         has seen stands above it, every resync it has written to the kernel stands below it, and the
         card is the gap between the two counts.
LAYOUT   Instrument panel, and the only one in this category. The narration column owns the top left,
         the EndpointSlice sits right of it on the top band, the instrument fills the height right of
         x=420, and the kernel stands BESIDE it, in the column the panel vacates. Four content bands,
         40 / 250 / 322 / 548, and only two lanes, both of them one straight segment.
         BOTH ACTOR BLOCKS ARE 232 (`NET.L-01`) AND NEITHER HAS A MEASUREMENT TO OVERRULE IT. The
         three clauses that could were checked at 1100x800, the widest reading: the slice label inks
         139.9 and its sublabel 116.6, the kernel label 69.9 and its longest sublabel
         `iptables rules for Service web` 184.0, so 232 leaves 46 and 24 a side. Neither block stands
         in a band it is sized BY, and neither reaches the panel wall.
         THE CARD LINES UP ON THE CHIP STRIP AND NOT ON THE CONTENT EDGES. The kernel takes the strip
         left edge 60 and the instrument takes its right edge 1140, so the two outer walls of the
         picture are the two outer walls of the readout under it. Taking 40 and 1160 instead hangs
         both blocks 20 off the column they stand on, which is the whole defect.
         The slice centres on the INSTRUMENT at 780 and not on the canvas spine, and the kernel takes
         the instrument face midpoint for its own, so BOTH lanes are single straight segments with no
         jog anywhere on the card: the update falls, the write leaves sideways.
         The kernel therefore does NOT stand on the chip grid, and that is a choice between two
         readings that cannot both hold. A straight side lane needs the two face midpoints on one
         line, and the instrument face midpoint is 372 while a kernel resting on the chips would put
         its own at 490. Closing that gap means dropping the instrument under the chip strip or
         stretching the kernel until its own midpoint reaches 372, which with its floor on the chip
         top means 352 tall and makes the kernel an empty block. The straight lane takes it, and the
         price is the 136 units of ground between the kernel floor at 412 and the chip top at 548.
         Nothing on the card is a request path, so the exemplar geometry (NET.S-03, parallel forward
         and return lanes plus a fan) is not used here.
         THE INSTRUMENT BOX IS A DIAL AND NOT A ROOM. The clock fills its envelope: the axis runs
         512..1104 of the 720 and the comb 512..1024. A block reads bloated when it is empty rather
         than when it is large, so what answers a bloated instrument is ink and not a smaller box.
         The frame itself may NOT be deleted: `.scheme-box.highlight` paints through
         `.scheme-box-rect` alone, so a frameless instrument makes `lit: ['loop']` on four steps and
         the `lights` on the watch route silent no-ops that no check can see.
         NO POD IS DRAWN. A Pod here would carry no ball on any step and would stand at
         `OPACITY.terminated` from step 2 to the end, and step 1 says in words that a dying Pod
         reaches this loop ONLY as a change to the slice, so the block would argue against its own
         card.
PANEL    Deepest at 1100x800 on the POSTER frame, which previews step 1's text (`D-14`):
         `OVERLAY_IDS=network-proxy-rule-resync node --test report/overlay.test.mjs` from
         `scheme/test/`. Every part of the instrument and of the top band starts at x >= 420, so no
         prose edit can occlude either. The kernel is the one block in the panel column, 60..292,
         and it opens at y=332: MEASURED, the deepest panel bottom is 229.82 at 1100x800 on the
         poster frame, so it stands 102.18 clear, and a prose edit on this card has that much to eat
         before it reaches
         anything. CENTRE, CENTRE-LOW and OCCLUDED all report zero at three viewports.
         The kernel y is DERIVED and not chosen: it hangs off `LOOP_CY`, so moving the instrument
         moves the kernel with it and the write lane cannot stop being straight by accident.
SIZES    The instrument is 720 x 244, and its height is a FLOOR rather than a preference.
         THE BOX LABEL AND THE `window` BRACKET CAPTION DO NOT COLLIDE, whatever a reading taken down
         the page rather than across it says. MEASURED at 1100x800 on the `window` step they never
         can: the label inks x 716.8..843.2 and the caption x 497.7..614.3, 102 apart. What sets the
         floor is the bracket stack in its OWN column, caption ink 25, then 14 to the bracket line,
         18 of legs, then the 60 comb, the axis, the 62 write side and the state wire.
         THE AXIS IS NOT ON THE BOX CENTRE, AND A PASS THAT PUTS IT THERE BREAKS THE TOP BAND. Centred
         it reads well on the write lane, which then leaves exactly on the clock line, and it prints
         the bracket caption on the SAME baseline as the box label, 285 against 286, two titles on one
         row 102 apart in x. The axis stands at 388 instead, which is the floor the top band sets: label
         276, caption 296, bracket 310, comb 328. The write lane keeps the box face midpoint at 372
         because `L-11` gives it no choice, and 16 units off the axis still reads as leaving the
         clock.
         On the five steps that draw no bracket the band above the comb reads as empty because the
         thing it is reserved for is not there, and that is the cost of the `window` step.
         The chip strip pulls in off the content edges to 60..1140 and takes a gap of 12, so w is 352.
         352 is also a floor: at 338.67 `render/chipfit.test.mjs` fails `kube-proxy watches` plus
         `all Services, EndpointSlices` by 6, and at 352 the same pair MEASURES a gap of 11 against
         the floor of 4, which is the tightest cell on the card.
         The axis starts at 512 rather than at the box wall because the two standing side captions
         live to its left: measured at 1100x800 they ink 440..482.9, and a caption over the comb would
         print through a hundred tick marks. An axis at 560 leaves 77 units of clear, more than the
         rule needs, where 512 still leaves 29 and gives the other 48 to the comb, whose bursts are 88
         wide.
         The kernel is 232 x 80 (`NET.L-01`) and stands in the column beside the instrument, which is
         a 380 x 226 band nothing else fills. A kernel spanning the content edges at 1120 x 68 instead
         carries the same two centred strings, inking about 160, 14 percent of its own width, which is
         the emptiest block the card can hold.
         The slice is 232 wide and centred on the INSTRUMENT rather than on the canvas, which puts
         SLICE_CX on `LOOP_CX` 780 and drops the watch lane straight down that x with no jog.
         The watch chip reads `all Services, EndpointSlices` and not `Services and EndpointSlices`
         for two reasons at once. A chip value is body text and opens lowercase (`T-09`), and the
         longer `and` form inks 190.2 units against a name of 110.4 in a 352 cell, which
         `render/chipfit.test.mjs` measures as a gap of -2 against a floor of 4.
LANES    Two lanes, no relationship and NO JOG ANYWHERE. The watch lane falls straight from the slice
         into the instrument, 110 units. The write lane leaves the instrument LEFT face and runs
         straight into the kernel right face, 128 units. Both are single segments because the slice
         centres on the instrument and the kernel takes its face midpoint.
         BOTH ARE FLOOR-BOUND AT 700ms, measuring 0.157 and 0.183 u/ms. Neither takes an explicit
         `dur` and the card stays off the `M-12` registry: several siblings run each length, so
         `M-13` answers both catalog-wide. Where they rank is `card-review/tools/pace.mjs`, which is
         the one home for a ball-speed ranking, and no number from it is copied here.
         A drop of 46 units, which is what a slice standing one band above the instrument leaves, puts
         the watch ball at 0.066. The instrument sits low enough to meet the kernel instead, which is
         why the two lanes are laid out around one shared face height rather than for symmetry.
         The three write steps hold duration over span with room, the worst being `batched` at 2760
         against 4800 and the tightest `period` at 2060 against 3500.
MOTION   Every step moves a SIDE of the clock, never a block. The change comb fades in on the arrival
         of the watch ball, so the changes appear when the update lands. The batched step crossfades:
         the dense write side out over FADE.out, the sparse one in behind it, and the write ball
         leaves at BEAT.lead + FADE.out so it never rides while the side it reports is mid-swap.
         Durations are 3500 to 4800 against spans of 2060 to 2760, which measures 12.8 to 15.6 ms per
         character and 46 to 64 percent still, the generous end on both axes, which is what
         identifier-dense prose costs (`card-review/tools/deadair.mjs` prints the still-time ranking
         and `report/baselines.test.mjs` the reading pace). The watch step is the stillest at 64
         percent: its narration ties `batched` for the longest on the card at 328 characters and its
         motion is one ball, and the answer to that is neither a shorter hold nor an invented second
         beat.
CONTENT  THE `desc` CARRIES THE DOCS OWN PARENTHETICAL AND MAY NOT DROP IT. The source opens
         `Every node in a Kubernetes cluster runs a kube-proxy (unless you have deployed your own
         alternative component in place of kube-proxy)`, and the bare `Each Node runs a kube-proxy`
         is rejected on two counts at once: it states the ordinary path as the mechanism, and
         `network-ebpf-dataplane` narrates in the same section that `kube-proxy and its iptables
         chains can be removed entirely`, so a bare form puts the two cards in contradiction. `unless
         you replaced it` is the shortest carrier of that qualifier, 11 characters against a desc
         standing at the 470 ceiling, so the room for any clause comes from elsewhere in the desc and
         never from the qualifier itself (`T-20`).
         The only quantities drawn are the two the narration states. The change side is exactly 100
         ticks in five bursts of twenty, the sparse write side is exactly five bars, and both numbers
         come from the upstream example (a 100-Pod Deployment deleted, about 5 updates of 20 endpoints
         each). syncPeriod is NOT a forced full reconciliation: the reference gives it re-synchronizing
         and cleanup operations that are not DIRECTLY related to changes in individual Services and
         EndpointSlices, and in particular how quickly kube-proxy notices an outside hand in its rules.
         Two absolutes this card may not take, both of which it would otherwise contradict itself on.
         A change does not write nothing to the kernel on its own, because at minSyncPeriod 0s it
         writes immediately, so the watch step hands that question to the floor instead of answering
         it. And syncPeriod is not unrelated to individual changes, only not directly related, so the
         closing step says it is not tied to any individual change.
         The card is scoped to iptables mode, which is where the reference documents both periods and
         where the 100 and the 5 come from. The same two fields sit under the ipvs and nftables blocks
         of the config API and the card claims nothing about either, so nothing here contradicts the
         IPVS deprecation `network-kube-proxy-modes` carries.
         `k8sVersion` is the section value 1.35 because nothing on the card is gated: the reference
         subsection carries no feature-state banner at all, which is NOT the same as Stable and is not
         reported as one.
NAMING   The id says `proxy-rule-resync` and not `kube-proxy-sync-loop` on purpose: sharing the
         `network-kube-proxy-` prefix with the modes card would read as a variant of it in every id
         list, and the two cards answer different questions about the same actor.
SCOPE    The CONSUMER side of an EndpointSlice and its timing: what kube-proxy does with a change once
         it arrives, how many changes one write carries and how long the kernel therefore trails the
         API server. Who watches the Pods and computes the slice belongs to
         `network-endpointslice-reconcile`. What the rules LOOK like once written, the chain walk and
         the mode they are written in, belong to `network-kube-proxy-modes`. A client dialling the
         virtual IP those rules realize belongs to `network-service-clusterip`, which treats the
         ruleset as a standing fixture and says nothing about when it was written.
NOTE     The instrument is pinned at x >= 420: the panel is a character budget on a card whose
         narration is its longest element, and an instrument starting at x=40 would sit 20 units under
         the deepest measured bottom and move with every prose edit. The column that pinning leaves
         free holds the KERNEL instead, and the two are not the same bet: the kernel is a receiver
         carrying two short strings 102 units below the deepest bottom, so a prose edit has a real
         margin to eat before it reaches anything, where the instrument would have 20.
         What still stands empty is the top band either side of the slice, x 420..664 and 896..1140,
         and the left column under the kernel, y 427..548. Both are the price of decisions taken on
         purpose: 232 by `NET.L-01`, the slice centred on the instrument, and the kernel pinned to
         the instrument face so the write lane is one straight segment. The instrument stands beside
         the lower void and fills that band, which is why it reads as a column and not as a hole.
         The five beat marks under the axis stand on every step, the idle frame included. Without
         them the poster frame is a 720 x 244 box holding one horizontal line, and a sparse write
         landing ON a beat is what says the aggregation happened on the clock.
```
