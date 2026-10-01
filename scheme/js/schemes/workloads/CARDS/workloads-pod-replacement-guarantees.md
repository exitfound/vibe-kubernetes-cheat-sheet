## workloads-pod-replacement-guarantees

### layout

```
WHAT     The same Pod is lost under five different controllers, and the five answers to what comes
         back are three: a replacement that owes the lost Pod nothing, a replacement bound to
         something the lost Pod had, or nothing at all.
LAYOUT   A verdict board. Five columns spanning WL.L..WL.R exactly, each one an owner over the Pod
         it had, with one actor above fanning a single event into all five and a per-step verdict
         under each column.
           actor   API 484..716, centred on WL.SPINE_X so the trunk leaves a face midpoint
           bus     257, split at the centre column, one tap per owner
           owners  300..360, five at 204 wide on a pitch of 219
           pods    496..588, the same five columns
           verdict 610, one wire per column
         The pitch is what makes it work: 5 at 204 on 219 spans WL.L..WL.R exactly and puts the
         THIRD column on WL.CX, so the trunk drops straight into it and the other four hang off a
         bus split there, which is the `workloads-statefulset-ordered-rollout` grammar at five
         columns rather than three.
         4 numbered steps plus the idle frame the poster shows, and the count is the argument: the
         steps are grouped by ANSWER and never by controller. A beat per controller would be five
         beats that each retell a neighbouring card, which is the one thing this card exists not to
         be. Grouped by answer they are three claims and a refinement, and the reader sees that the
         five kinds give fewer answers than there are kinds.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport:
         `OVERLAY_IDS=workloads-pod-replacement-guarantees node --test report/overlay.test.mjs`.
         Deepest on step 0 at 1100x800, shallowest on step 2 at 1600x1000, and step 0 is where the
         panel swings widest across the set, 69.82 units.
         Step 0 is the deepest because the poster frame previews the text of step 1 (`D-14`), and
         `the-blow` carries the longest narration on the card at 343 characters. `PANEL_B` 230 is
         derived from that deepest reading and it pins BAND_Y at 251, which the bus at 257 is the
         first thing to use. The whole band is 251 to the 610 the verdict row sits on, and it is
         spent on ONE thing that is not the picture: the gap between the two rows, which MOTION
         states.
SIZES    A Pod carries its name in a label no field can write (`setBoxLabel` reads
         `.scheme-box-label`), so every name here lives in the SUBLABEL, which `podSublabels`
         rewrites per step. That is not a workaround, it is what the card needs: the same slot has
         to show `web-7f9c8-4mzq` then `web-7f9c8-tp8vd` for a ReplicaSet and `web-1` then `web-1`
         for a StatefulSet, and the difference between those two pairs IS the card.
         The `through a Job` caption sits 62 left of its column centre and not on it. Centred, the
         CronJob ownership relation runs straight through the word. Measured at 1600x1000, where it
         is widest, the string inks 89.6 units at x 931.2..1020.8: it clears the relation at x=1038
         by 17.2, the right edge of the Job column at x=921 by 10.2, and the nearest ink inside that
         column, `import-h5trn` ending at 855.2, by 76.0.
         `ReplicaSet web-7f9c8` is the widest block label on the card and it fits with room to
         spare. Measured at 1600x1000 it inks 127.5 units at x 98.3..225.7 inside a column running
         60..264, so 38.3 of clear on the left and 38.3 on the right. `StatefulSet web` beside it
         inks 93.9. The verdict wires are the widest strings in the band and none of them collides.
         Measured at 1600x1000: `same ordinal, same claim` inks 165.4 centred on 381, with 101.8 of
         clear to the verdict left of it and 105.3 to the right. The longest, `nothing until the
         next tick`, ends inside WL.R with room, because a 219 pitch leaves more room than a 204
         column implies.
LANES    Trunk down WL.SPINE_X into a bus split at the centre column, one tap per owner, and five
         ownership spines.
         The trunk and both bus halves are LANES with the marker taken off, the
         `workloads-replicaset` form: they carry every watch ball, so they take the route weight,
         and `tune` drops only the head, which belongs on the tap that lands on an owner.
         FOUR of the five ownership spines are lanes and the fifth is a relation, and that split is
         a claim rather than a style. A ReplicaSet, a StatefulSet, a DaemonSet and a Job each create
         a Pod, so a replacement rides each of those four at some point in the card. A CronJob never
         creates a Pod at all, so nothing ever rides the fifth and an arrowhead on it would read as
         traffic (A-05). The caption on it says the rest.
         A-13 IS OVERRULED. No line is ever pinned to a slot: every slot is empty on at least one
         step and three of them are empty at the end, so pinning each spine to its sink would wash
         the delivery path out over most of the card. The one thing that takes a line down is the
         far end being GONE (A-14), once, on `none-at-all`, where `spine2` goes to 0 with the
         DaemonSet Pod. Its watch TAP stays at full on that step: the controller is still there and
         still watching, and only the Pod is not.
         Five far ends are equally empty in `the-blow` and NOTHING comes down there, which is the
         same rule and not an exception to it. What `none-at-all` severs is an ownership that will
         never be exercised again, because the Node is gone and no other Node is short of a copy. In
         `the-blow` every one of the five is about to be asked to refill its slot, and those four
         spines are the path the next two steps are entirely about.
MOTION   `the-blow` fires five watch hops at ONE delay and lands them on ONE beat, after every Pod
         has blinked and dissolved. The ARRIVAL is what carries the claim: the step says every owner
         reads the event in the same moment, and the moment a reader sees is the one the ball lands
         on.
         The landing is what `WATCH_DUR` buys. The paths run 180 to 618 units, so at the canon 0.45
         u/ms they take 700 to 1373ms and the arrivals fall 673ms apart, with the two `web` owners
         carrying 486 of that between them. Sharing the duration of the longest path costs the
         deviation on the middle three hops, once, on this one step, and it is registered in the
         `PACING` table of `render/motion.test.mjs` at `{ speed: 3, clamp: 0 }`: the two outer hops
         ARE their own routeDur, and the shared 1373 sits inside the [700, 2600] routeDur clamps to,
         so exemption is M-12 alone and never M-13.
         What it PAYS is the shared trunk. Five copies of one event ride `(600,120)..(600,257)` at
         three speeds, so they string out down it: measured live at 1600x1000, at t=1465 the five
         sit at y 224 / 187 / 150 / 187 / 224, a 74-unit spread on a 137-unit segment reading as
         three dots in a column. That is the cost taken deliberately, because the trunk is 137 units
         of shared wire and the arrival is five separate landings a reader compares side by side. DO
         NOT hand the five hops back to their own routeDur. 673ms of spread on five simultaneous
         watches draws the owners learning it in an order, which is the one thing the step exists to
         deny, and the two columns a reader compares first are the pair furthest apart.
         The empty slot sits at `OPACITY.terminated` 0.12, which is C-09 and not C-08: the step
         narrates the object LEAVING THE API, which is the sentence 0.12 is defined by. The shade is
         also what makes the next step legible, because the contrast IS the answer: at 0.55 five
         ghosts hold nearly the weight of the two slots that come back at full, and the board reads
         as five dimmed Pods rather than as an empty row.
         DO NOT lift it back to `pending`. That shade means declared and not working yet, which is
         the one state a Pod the API no longer holds cannot be in.
         The two rows are 136 units apart and the gap is sized by the BALL, not by the picture.
         `routeDur` clamps anything under 314 units to the 700ms floor (M-13), so a short spine
         crawls: at the first sizing the gap was 48 and the four replacements ran 0.069 u/ms, a
         third of the catalog median. 136 is the most the band holds with the verdict row still
         clear of 624, and it puts them on 0.194, the one other length `cluster-admission-chain`
         runs. No catalog RANK is quoted here on purpose: a rank moves whenever any card in any
         category adds a ball, and nothing reports it stale.
         Both replacements in a step leave at one delay for the same reason the watch fan does:
         neither controller waits on the other, and a beat between them would draw an order that
         does not exist.
         Durations are set per step from the reading, not from a pattern: 3800 / 3400 / 3600 / 3600
         over 343 / 287 / 335 / 326 characters puts every narrated step between 10.75 and 11.85 ms
         per character. `the-blow` is the widest of them because it also carries the longest span,
         2993, so 3600 would have left 607ms of hold behind 343 characters.
         `the-blow` is the one step that WINDS BACK. Its `rewind` restores the five names and blanks
         the five verdicts, so the step opens on the board it had and the `F.set` at
         `BEAT.afterPulse` is what takes them away. Without it `writeStatics` settles the answer at
         entry: the names go and every column reads `gone` 800ms BEFORE the Pods blink, and the
         `F.set` writes what is already written (T-30). The three steps after it wind back for the
         same reason.
CONTENT  Read against the `k8sVersion` the catalog entry states, on the four pages behind the four
         `sources` links.
         The four are one per claim the card cannot borrow from a sibling: retention for the
         StatefulSet, failure handling for the Job, and the DaemonSet and CronJob pages for the two
         columns that carry a whole step each. `#deployment-and-scaling-guarantees` is NOT among
         them and must not be added back: its content is the ordering guarantee, which this card
         explicitly rejects two paragraphs below, so citing it points a reader at the one page that
         disagrees with the step it would sit under.
         The DaemonSet answer is the page verbatim in substance: `As nodes are removed from the
         cluster, those Pods are garbage collected`. `nothing is rescheduled elsewhere` is the other
         half of the same sentence read against the DaemonSet definition, `ensures that all (or
         some) Nodes run a copy of a Pod`: with the Node gone no remaining Node is short of one. The
         Job answer is `When a Pod fails, then the Job controller starts a new Pod` plus `By
         default, each pod failure is counted towards the .spec.backoffLimit limit`, and the default
         is the page as well, `.spec.backoffLimit is set by default to 6`.
         The CronJob answer rests on what a CronJob OWNS: `A CronJob creates Jobs on a repeating
         schedule`. It owns Jobs and not Pods, so the Pod that vanished belonged to the Job the last
         tick created, and the CronJob itself starts nothing until the next tick. That ownership hop
         is why its spine is a relation and why the caption reads `through a Job`.
         `so the CronJob itself starts nothing` keeps its subject on purpose. Drop `itself` and the
         sentence becomes a false absolute: the Job the last tick created is still there and still
         under its own completions, so IT can start a replacement Pod, which is the answer the Job
         column of this same card gives four seconds earlier.
         The fan in `the-blow` says the deletion is equally TRUE of every column and never that
         every controller was notified. The CronJob controller is built with a Job informer and a
         CronJob informer and holds no Pod informer at all (`pkg/controller/cronjob`), so a sentence
         reading `every owner reads that off its own watch` is false for one column in five and
         contradicts `owns no Pods` two steps later. DO NOT put a watch back into that narration.
         The claim is upstream SOURCE and not documentation, which does not say which informers a
         controller holds, but the card contradicting itself needs no source at all.
         The StatefulSet answer is the retention page, which states this case directly: `if a Pod
         associated with a StatefulSet fails due to node failure, and the control plane creates a
         replacement Pod, the StatefulSet retains the existing PVC. The existing volume is
         unaffected, and the cluster will attach it to the node where the new Pod is about to
         launch`.
         A claim is BOUND and a volume is ATTACHED, and the step keeps them apart: the antecedent of
         `attach it to the node` in that sentence is the volume, not the PVC. The storage cards
         write `attach the volume to` throughout and never `attaches the claim to`.
         `and every ordinal behind it waits` is REJECTED on that step, and the rejection is the one
         correction this card makes to its own brief. The guarantee reads `Before a scaling
         operation is applied to a Pod, all of its predecessors must be Running and Ready`, and the
         worked example that follows is about an ordinal not yet LAUNCHED. Replacing a Pod in a set
         that is already fully deployed is not a scaling operation, so the successors already
         running are not stopped by it. What the page does support is the identity claim, and that
         is all the step makes.
         The names are shaped the way each controller shapes them, because the shape is half the
         answer: `web-7f9c8-4mzqd` is a ReplicaSet Pod, hash plus random suffix, and the replacement
         `web-7f9c8-tp8vd` keeps the hash and takes a new suffix. The hash IS the ReplicaSet, which
         is why the block over that column is labelled `ReplicaSet web-7f9c8` and not `ReplicaSet
         web`: a ReplicaSet actually named `web` would own `web-<suffix>`, and the page says the
         ReplicaSet name `will become the basis for the Pods which are created`. The cost is the
         `... web` parallel with the StatefulSet column beside it, and the alternative costs the
         hash, which is what makes the replacement recognisably the same ReplicaSet.
         Every generated suffix on the card is FIVE characters, from the no-vowel generator
         alphabet, because `generateName` appends exactly five. `web-1` is an ordinal and has no
         suffix to change. `report-28114500-2q9wv` is a CronJob Job name, the schedule stamp, plus
         the Pod suffix.
         `agent-9x2ld` is a DaemonSet Pod, controller name plus one generated suffix and no hash,
         and its replacement `agent-4tk8p` takes a NEW suffix. Only the StatefulSet returns an
         identical string, because only an ordinal is part of the identity the controller promises:
         the retention page speaks of the control plane creating a REPLACEMENT Pod and the
         StatefulSet page of a sticky identity each Pod maintains across rescheduling, and neither
         claim is made anywhere for a DaemonSet. What a DaemonSet holds is the PLACE, which is why
         its verdict wire reads `same Node` and not a name.
         DO NOT redraw the DaemonSet slot with the name it had. Two identical strings under two
         columns say the two controllers promise the same thing, and the whole card is the sentence
         that they do not.
SCOPE    This card draws an EVENT and a promise, and not one mechanism. Every sentence in it is a
         consequence of a card the reader has already passed, which is what lets four steps carry
         five controllers, and the mechanisms stay where they are:
         the reconcile loop and ownerReferences are `workloads-replicaset`, the OrderedReady gate
         and the per-ordinal claim are `workloads-statefulset-ordered-rollout`, what a Node being
         removed does to the Pods on it is `workloads-daemonset`, backoffLimit and completions are
         `workloads-job-parallelism`, and concurrencyPolicy and the schedule are
         `workloads-cronjob`.
         It is the mirror of `workloads-controller-kinds`, which opens the section: that card asks
         which kind to write and answers with three questions, this one asks what the choice bought
         and answers with one event drawn five times. Neither teaches a mechanism and both name
         their owners, which is the shape the entry card set.
         Where the Pods RUN is not the subject, so no `node()` frame is drawn: a frame anywhere here
         would say two of these five Pods share a Node, which nothing about five unrelated owners
         promises. The one Node the card names, in `none-at-all`, is named in words.
         The Pod object being deleted, the grace period and what a stuck Terminating Pod costs are
         `workloads-force-deletion` and `workloads-graceful-shutdown`: this card starts the moment
         the object is already gone.
NOT A DEFECT
         The card carries NO value chip, which is 7 of 128 in the catalog. Every state here is a
         verdict in words under a column, and a chip strip would either repeat those five strings or
         invent fields the card does not teach. `workloads-job-parallelism` made the same call for
         the same reason, that a card whose numbers are all lengths has nothing for a chip.
         `the-blow` runs five pulses, five fades and five hops in one step, which is the busiest
         step in the category. That is the premise drawn once rather than five times: the step
         exists to say the event is IDENTICAL, and staging it per column would say the opposite.
         `none-at-all` is the stillest step on the card, 2100ms and 58 percent of its own length
         against 1800 and 53 on the two hand-back steps, and it narrates two answers while drawing
         one. That is the subject and not dead air: the CronJob verdict appears in a column where
         nothing ever moves BECAUSE nothing ever moves there, and M-19a is met on the reading side
         at 307 characters over 11.73 ms each.
```
