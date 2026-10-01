## network-dns-autoscaling

### layout

```
WHAT     The number of CoreDNS replicas as a quantity that follows another quantity: a separate
         controller reads the size of the cluster, turns it into a replica count through one
         parameter set, and writes that count to the Deployment that answers names.
LAYOUT   AN INSTRUMENT, not a path, and the only card in this section that is not one. The subject
         is arithmetic over two inputs, so the composition is the arithmetic: two axis meters stand
         on the outer edges of the content, the nodes axis left of the spine from x=60 and the cores
         axis right of it ending at x=1140, and the reading that is LONGER is the one the equation
         keeps. The write rail runs straight down the spine between them into the replica row, which
         is the same row a third time, so max() is read as a length rather than taken on trust.
         NO POD STANDS ON THIS CANVAS, which no other card in `dns-service-discovery` can say and
         24 other cards catalog-wide do. `NET.S-01` counts the Pod-less networking cards as the ones
         drawing the machinery UNDER the Pods, and this card draws the machinery ABOVE them: the
         replicas here are a COUNT and not actors, and six `podShell`s would put six pulsing bodies
         on a card whose whole argument is a division. The autoscaler and the API server are
         infrastructure and light rather than pulse, which is the same rule read the usual way.
         The top band carries the API server at y=60, which `L-01` leaves free right of x=420
         whatever the panel does.
PANEL    Measured per viewport, bottom lo..hi: 125.11..194.89 at 1600x1000, 150.17..235.17 at
         1280x860, 170.00..294.23 at 1100x800, right edge 396.55, which is the catalog worst `L-02`
         records. Deepest on `params`, the nine-line step, at 1100x800:
         `OVERLAY_IDS=network-dns-autoscaling node --test report/overlay.test.mjs` from
         `scheme/test/`.
         Nothing on this card starts left of x=420 above y=368, so the panel stands over no block on
         any step and the reading it pins is the meter band: the nodes trough opens at x=60, y=368,
         and clears the deepest reading by 73.77. That clearance is what the `params` narration
         spends, so it is prose and not geometry that holds it: 90 of that step's characters say
         where the parameter values come from and are worth 49.69 of panel depth, 294.23 with them
         against 244.54 without.
SIZES    The three actors are `NET.L-01` exactly, 232 by 80, and they share one column at x=484
         centred on the spine. Two departures, both under the third overrule clause of `NET.L-01`, a
         row the block is SIZED BY:
         A METER CELL is 40 by 22 at a 48 pitch. It is a reading and not an actor: it carries no
         string, so the width answers to how many of them a row has to hold, and eight at that pitch
         measure 376, which with 6 of trough padding a side is a 388 by 34 trough on each outer edge
         of the 60..1140 content span, spine clear between them. EIGHT and not six is the point of
         the number: the card never fills more than six, so a full trough never happens and the
         track cannot be read as a cap. This card states no `max` anywhere.
         The DEPLOYMENT FRAME is 450 by 60 and is the third trough, 376 plus 37 of padding a side.
         It carries no label of its own because `box()` prints one on the vertical centre, which is
         exactly where the row stands: the name is the `P.tag` at (470, 442) above its top-left
         corner instead, placed left of centre so the write rail lands on the top face midpoint at
         x=600 without crossing the string, which inks 408..532 at 1600x1000.
         The nine chips are laid by hand rather than by one `strip`, in two rows both spanning
         60..1140 so the chip bbox centres on 600. `preventSinglePointFailure` and
         `includeUnschedulableNodes` ink 172.3 on their NAMES alone at 1600x1000, so those two take
         370 each and every other chip is sized to its own longest value.
LANES    Three, and all three are ridden. The poll is a round trip and takes a mirrored PAIR about
         the top face midpoint x=600 (`L-12`), the request climbing at 588 and the answer coming
         down at 612, each 100 units. The write rail is one 132 unit segment down the spine from the
         autoscaler bottom face into the Deployment frame top face. The same points array feeds the
         wire and the ball on all three (`A-02`).
         No lane is ever opacity-dimmed on a step that leaves it idle: a lane says what it carries
         with its caption, and the down lane relabels between the counts and the ConfigMap.
         Nothing here is a `P.relation`, because no relationship on this card is not also traffic:
         the parameter set is FETCHED, the counts are FETCHED, and the replica number is WRITTEN.
MOTION   Eight balls, all with an explicit `dur` of HOP_MS 595, and `render/motion.test.mjs` PACING
         records all eight as explicit and all eight under the floor. MEASURED and not the quotient:
         the poll legs are 100 units and the write rail 132, which at the canon 0.45 u/ms would
         finish in 222 and 293 and therefore clamp to the `M-13` floor of 700, where a ball that
         short reads as crawling. `pace.mjs` puts them at 0.168 and 0.222 u/ms. 595 is the same 15
         percent off the floor that `network-nodelocal-dnscache` measured for its own short hops, so
         the two cards of this section that hop short distances run at one pace.
         `linear` is the one step that moves nothing across the canvas, and it earns its hold with
         the two readings LANDING one after the other: `F.reveal` draws the first cell of each row
         at BEAT.lead and BEAT.lead plus 500, and each meter LABEL lands with its own cell. That is
         the beat a chip flash would otherwise have carried, and a chip never flashes (`M-26`).
         A cell that stops being counted fades to nothing rather than vanishing on the frame, which
         is the `ladder` step taking the nodes row from 3 to 2, the cores row from 6 to 5 and the
         replica row from 6 to 5.
         `params` is the one READING-bound step and its 3900 is bought by prose, not by motion: 388
         characters against a span of 1955, so the narration and not the motion sets the hold. The
         other six run 10.1 to 15.4 ms per character with no help. Do not close the resulting 64
         percent still time by cutting the narration: those are the sentences that separate what the
         manifest PASSES from what the ConfigMap holds.
WIRE LABELS
         Six, three standing and three per step. `list, watch nodes` at (500, 172) and
         `deployments/scale` at (690, 345) are true on every step, so both are `P.tag` rather than
         step labels. `list, watch nodes` inks 441.4..558.6 and stands 29.4 clear of its own rail at
         588, and `deployments/scale` inks 631.4..748.6, 31.4 clear of the rail at 600: about 30 is
         the distance `network-dns-coredns` measured as the only one that works, since on the rail
         the text lies across its own line and far from it the caption reads as attached to nothing.
         `back` is per step because what comes DOWN changes, the counts on five steps and
         `configmap params` on `params`. The string is deliberately short: `configmap
         kube-dns-autoscaler` inks about 186 units and, centred where this label sits, would run
         into the lane at x=612.
         The two meter labels carry the ARITHMETIC, each centred over its own trough, and they are
         what makes the `ladder` step DRAW its table rather than assert a number: on that step they
         read the lookup and the two ladder chips beside them read the table it was looked up in.
         Each one is wound back with the cells it counts and lands with them, or it states a count
         over a row that is not showing it for the whole lead beat.
CONTENT  Every value is read against k8s 1.35 off one of two primary sources, both read raw, and
         none is recalled.
         The task page prints the manifest that enables it: a `kube-dns-autoscaler` Deployment in
         `kube-system` running `cluster-proportional-autoscaler`, with
         `--default-params={"linear":{"coresPerReplica":256,"nodesPerReplica":16,
         "preventSinglePointFailure":true,"includeUnschedulableNodes":true}}`.
         THE MANIFEST PASSES THOSE AS `--default-params`, WHICH IS NOT THE SAME AS SETTING THEM IN
         THE CONFIGMAP, and the `params` narration says so in the words the README forces: that flag
         `will create/re-create a ConfigMap with this default params if ConfigMap is not present`.
         `The manifest sets coresPerReplica 256` is REJECTED for that reason, since a ConfigMap that
         already exists wins over the flag.
         MIN IS NOT IN THAT MANIFEST, and the chip says `1 by default` because the README states
         that of `min`, `max`, `preventSinglePointFailure` and `includeUnschedulableNodes`, all
         optional, `If not set, min would be default to 1, preventSinglePointFailure will be default
         to false and includeUnschedulableNodes will be default to false`. The task page shows a
         DIFFERENT set on the ConfigMap it tells a reader to edit,
         `linear: {"coresPerReplica":256,"min":1,"nodesPerReplica":16}`, which carries min and
         neither flag. Where the two sources differ the card draws the manifest set and names the
         library default separately, which is the only way to state both without presenting one as
         the other. Neither flag is drawn as `true` before the step that reads the manifest.
         The equation is the task page's, `replicas = max( ceil( cores x 1/coresPerReplica ),
         ceil( nodes x 1/nodesPerReplica ) )`, and the two meter labels state each half in the
         README worked-example form, `ceil(13 / 2) = 7`, which is the same operation written as a
         division. Both `coresPerReplica` and `nodesPerReplica` are floats, which is why neither is
         drawn as an integer count of anything.
         The two clamps are `replicas = min(replicas, max)` then `replicas = max(replicas, min)`.
         `preventSinglePointFailure` is stated as the README states it, `controller ensures at least
         2 replicas if there are more than one node`, and never as a blanket floor of 2.
         `includeUnschedulableNodes` true means `the replicas will scale based on the total number of
         nodes`, and false means only the schedulable ones, with `cordoned and draining nodes`
         excluded. The `poll` step names no flag at all, because its chip still reads `-` there: the
         flag is introduced on `params`, the step that reads it, and `grow` then says `in total`,
         which is what the drawn `true` means.
         The ladder narration NAMES the two ladder keys, `coresToReplicas` and `nodesToReplicas`,
         which is the README schema for that mode. Leaving them unnamed is rejected: the linear
         chips read `coresPerReplica 256` and `nodesPerReplica 16`, so a ladder chip showing a bare
         table under the same `cores rule` name invites the reader to keep the linear key and change
         only the value. The keys do not go in the CHIPS, because `coresToReplicas [[1,1],[512,5]]`
         inks past the 250 the `cores rule` chip has and widening it is a geometry change.
         `preventSinglePointFailure` reads `absent` on the ladder step because the README states it
         for linear mode alone, while `includeUnschedulableNodes` stays `true` because the README
         lists it in the ladder schema as well. `min` reads `absent` for the same reason as the
         first: it is not in the ladder schema.
         The ladder table is the card's own example and not a default: the README ships a longer one
         and documents no default ladder. `[[1,1],[512,5]]` against 1536 cores gives 5 and
         `[[1,1],[2,2]]` against 48 Nodes gives 2, on the README rule that the entry taken is the
         one whose threshold the count passes, `3 (because 64 < 400 < 512)`, and `The lookup which
         yields the higher number of replicas will be used`. `Replicas can be set to 0 (unlike in
         linear mode)` is the source of the last clause of that narration.
         The poll period is `--poll-period-seconds=10`, printed in the README usage block, so `every
         10 seconds by default` is that flag default and not a claim about the manifest, which does
         not set it.
         `deployments/scale` with get and update is the ClusterRole the task page prints, and
         `list, watch nodes` its other rule, which is why both rails are lanes and not relationships.
         `the same answer` is REJECTED in the `aria-label`: ladder reaches 5 on this card where
         linear reached 6, so the label reads `answers the same two counts` instead.
         `linear` states the NODES axis before the cores axis, which is the order the two `F.reveal`
         beats land in and the order `dominate` states the same pair in. The cores-first wording is
         rejected: it has the reader reading about cores while the nodes cell is the one appearing,
         and it disagrees with its own sibling step.
         The `desc` clause `nothing here watches CPU the way a HorizontalPodAutoscaler does` takes
         the README comparison section, `The actual CPU or memory utilization of the target
         controller pods is not an input to the control loop, the sole inputs are number of
         schedulable cores and nodes in the cluster`.
         THE AUTOSCALER IS OPT-IN, so the `desc` says `When enabled`, the `aria-label` `where it is
         enabled` and `poll` `When DNS autoscaling is enabled` (`T-23`). The task page is written
         around enabling it, `If you see "kube-dns-autoscaler" in the output, DNS horizontal
         autoscaling is already enabled`, and then creates the Deployment itself. A bare `A separate
         kube-dns-autoscaler Deployment polls` is rejected: it reads as a component of every
         cluster, and a cluster without it keeps whatever replica count the CoreDNS Deployment sets.
         The README details are read against the upstream source as well as the README, because the
         card leans on them. `ladderParams` holds exactly `coresToReplicas`, `nodesToReplicas` and
         `includeUnschedulableNodes`, which is what the two `absent` chips on `ladder` rest on.
         `parseParams` in the linear controller sets `min` to 1 when it is 0 or unset, which is the
         `1 by default` chip and `A ladder may name 0 replicas, which linear may not`.
         The source applies `min` and `max` to EACH axis before taking the larger, and
         `preventSinglePointFailure` lifts the nodes axis to 2 when the counted nodes exceed one. On
         every input this card draws that gives the same number as the task page equation followed
         by the clamps, since no `max` is set, so `floor` keeps the task page order. A card that ever
         sets a `max` has to re-read this: the source does not cap the single-point-failure floor.
         The node count comes from a node informer (`list, watch nodes` in the ClusterRole) that the
         loop reads every poll period, and the cores are the sum of `status.allocatable` cpu. `polls
         the API server` is the task page wording, `An autoscaler Pod runs a client that polls the
         Kubernetes API server for the number of nodes and cores`, and is kept.
BUDGET   Nine lines at 1100x800 on `params`, 388 characters, reading 294.23. The meter band opens at
         368, so a tenth line is about 25 units and there is room for two more before a narration
         starts moving the meters. Re-measure after any prose edit: this card's clearance is spent
         by prose, not by geometry.
SCOPE    WHERE THE NUMBER COMES FROM, and nothing about what the replicas then do. How a CoreDNS
         replica answers a name is `network-dns-coredns`, and this card never opens one. An agent on
         every Node instead of more central replicas is `network-nodelocal-dnscache`, the other card
         in this section whose subject is how the resolver is deployed rather than how a lookup
         runs. How a Deployment turns a replica number into running Pods is
         `workloads-controller-kinds`. HorizontalPodAutoscaler is drawn on NO card in this catalog,
         so the `desc` names it as the thing this is not and no step reaches for it: the README
         comparison section is the authority for that clause and the card states nothing else about
         HPA.
NOTE     `deploy` is a frame with no label and the tag above it is what names it. That is the one
         place this card departs from how every other block on it is built, and the reason is in
         `SIZES`: the label would print exactly on the row.
         Every one of the 24 cells is stated on every step through `meters()`, which is the same
         discipline `P-01` asks of a chip. A cell left unstated keeps whatever the step before set,
         and on a card whose subject is a count that is a wrong number on the canvas.
         Every chip whose VALUE changes on a step is named in that step's `lit` (`P-05`), which is
         what takes `report/arrival.test.mjs` R2-STEP to zero here.
WHY NOT  Keeping all eight cells DRAWN and separating counted from uncounted by opacity alone, at
         `OPACITY.notready` 0.4 against 1. Measured on the rendered frames at all three viewports: a
         counted cell and an uncounted one are indistinguishable at 40 by 34, so the `dominate` step
         shows 3 against 6 and reads as two identical rows. The reading of this card is a LENGTH,
         and a length needs cells that are there or are not.
DO NOT   Fill a meter trough. The eighth cell is headroom and the card states no `max`: a full
         trough says there is a cap, and the only cap on this card is the one `floor` calls absent.
NOT A DEFECT
         `report/arrival.test.mjs` prints nine R2-ENTRY rows on this card, all CARRIED in
         `test/fixtures/carried.mjs` with their reasons. Every one of them is the frozen-sampling
         artefact that file documents: the card turns each value over MID-step, on the arrival of
         the ball that produced it, and lights it there, so an entry sample first sees the new value
         on the step after the one that wrote it, where the cue has legitimately been shown and
         cleared. R2-STEP, the axis that answers the canon question, reports none.
```
