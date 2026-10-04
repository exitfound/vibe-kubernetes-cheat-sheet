## workloads-replicaset

### layout

```
WHAT     A ReplicaSet holding a set of Pods it owns against a mark at spec.replicas: it fills a gap
         before the mark, deletes what runs past it, adopts a matching Pod that no controller owns,
         and releases one whose labels stop matching.
LAYOUT   TWO OWNERSHIP BANDS AND A COUNT MARK, and no `LAYOUT` preset: A / B / C choose which column
         holds the ladder and which the chips, and this card carries neither.
           actors  484..716 (ReplicaSet, centred on CX) and 908..1140 (API), y 40..120
           chips   right column 660..1140, y 150..268, THREE values
           owned   full width, 344..494, four slots at y 406..486, Pods 216 x 80
           unowned full width, 506..618, two slots at y 530..610
           mark    x 846, y 386..490, caption `spec.replicas = 3` on the band label baseline
         OWNERSHIP IS THE VERTICAL AXIS AND THE COUNT IS THE HORIZONTAL ONE, which is what buys the
         card its two devices. A Pod in the upper band carries a controller ownerReference and one
         in the lower band carries none, so adoption and release are the same crossing in opposite
         directions rather than two spellings of a sublabel. The mark then separates the three slots
         inside the desired count from the fourth past it, so a shortfall is a GAP and a surplus is
         a Pod over a LINE. Neither fact is legible on a card that states the count in a chip.
         The section runs 7 of 10 cards on a chain and 7 of 10 on a `node()` frame, and this card
         carries neither. The chain went because its six rows restated the six narrations, and its
         242 units of right column are what pays for the second band. The frame went because where
         these Pods run is not in this story: a Node frame here is a block no step narrates.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport: `OVERLAY_IDS=workloads-replicaset node
         --test report/overlay.test.mjs`. Deepest at 1100x800 on the poster frame, shallowest at
         1600x1000. `PANEL_B` rounds that reading to 330 and the owned band clears it by 14.8. THE
         BOTTOM IS WHAT PINS THE WHOLE CARD: 624 less 330 leaves 294 units for two bands and the gap
         between them, which is 150 + 12 + 112 = 274, so neither band can grow without the other
         shrinking. Nothing in the suite reads it: `OCCLUDED` skips frames and these bands are raw
         groups, so only the 1100x800 frame shows a band standing under the panel. The chips escape
         the panel ENTIRELY by starting at x=660: only the free height right of the panel makes room
         for two full-width bands under it, and a chip column on the left would cost one of them.
SIZES    The actor pair is 232 x 80, taken WHOLE from the exemplar
         `workloads-pod-startup-conditions`: same width, same centring on WL.CX, same right edge on
         WL.R. Workloads declares no box width of its own, so 232 is a literal here rather than an
         import past the kit (S-21).
         Slots are 216 wide against the family 220, and Pods 80 high against the 106 the section
         runs. Four slots plus two normal gaps plus two doubled mark gaps is 4*216 + 2*30 + 2*54 =
         1032, the full width less 24 of padding a side, so the row is centred on CX by
         construction. The doubled gap around the mark is what makes the break read as a break
         rather than as a wider pitch. THE MARK IS THE ONLY PLACE THE DESIRED COUNT IS WRITTEN, and
         the slot arithmetic hangs off it rather than the other way round: SLOT_X(3) is `MARK_X +
         MARK_GAP`, so the surplus slot cannot drift to the wrong side of the line it is defined
         against. Moving the mark is therefore a layout change and a TIMING change at once.
         SLOT_CX(3) feeds BUS_TAIL and LANE(3), routeDur is length-based, and both `adopt` and
         `converge` fly the full run to that slot. Re-run the duration check after any move, not
         only the step that looks affected.
LANES    Trunk from the ReplicaSet bottom midpoint (484..716, centred on CX, so WL.L-07 is met) down
         to a bus at 372, and one tap per slot down to the Pod top midpoint.
         The trunk, the bus and the tail are LANES with the marker dropped through `tune`, the
         `workloads-pod-qos-classes` idiom, and not relations. They carry the ball on every animated
         step, which is what A-06 makes a lane, and `relationPath` paints at stroke-opacity 0.45, so
         drawn as relations they read half-dark beside the taps and the actor arrows, which carry no
         such rule. The arrowhead still belongs to the tap alone. THE TAP IS THE OWNERREFERENCE. It
         is drawn for an owned Pod and absent for an unowned one, which is the device ownership
         needs: said in a sublabel string instead it takes three different wordings and none of them
         is visible.
         The bus is SPLIT at the third slot. The tail beyond it serves the surplus slot alone, which
         is empty on four of the seven steps, and it goes with tap4 rather than per step. Taps are
         34 units and the ball rides the whole trunk-bus-tap run rather than the tap alone, so the
         length that sets `routeDur` is the run. The mark starts at BUS_Y + 14 so the bus and the
         rule never cross.
MOTION   Every number here is read off `card-review/tools/motion.mjs` and not computed: `after:`
         adds BEAT.afterHop on top of the arrival, and an arithmetic reading of this card once put
         every adopt figure 100ms light.
         `own` sends one ball down each of the three taps at BEAT.lead, longest arrival 2342 and its
         pulse closing at 3242 against a duration of 3700.
         `self-heal` is a Pod fade, a watch event IN, a create OUT, then the lane: the controller is
         dark until the watch lands because it acts on what it receives. The watch hop is what puts
         the duration at 4700.
         `adopt` is two beats: the Pod surfaces in the unowned band at 600, the PATCH leaves at 700
         and lands at 1400, the claim rides to 3042 and the pulse closes at 3942, against a duration
         of 4400.
         EACH CHIP TURNS OVER ON THE EVENT THAT MAKES IT TRUE, in the rewind + `F.set` form, with the
         chip in `lit` from entry and no writer swap. `reconcile` is the DECISION and the `req` wire
         is the request carrying it, so the two turn over together, when the ReplicaSet decides: on
         `self-heal` at the watch arrival (1500), on `adopt` as the PATCH leaves (700), on `orphan` as
         the release leaves (800). Until then `reconcile` holds the previous step's value and the
         wire is blank, because a wire naming a request beside a chip still naming the last decision
         is two answers on one frame. `ownerReferences` is the FIELD, so it turns over where the
         field changes: on `adopt` at the claim landing on the slot (3042), the same beat the Pod
         crosses up, and on `orphan` at the release landing on the API (1500), the same beat the Pod
         drops. Turned over at the PATCH landing on `adopt` instead, the chip says `owner set` for
         1.6s while web-d4 still stands in the unowned band reading `owner: none`.
         `converge` lands its delete at 2342 and holds the dissolve a full BEAT.afterPulse behind
         the blink, so the fade runs 3142..3842 against a duration of 3900. Run together, as they
         were, the Pod reached 0 at 3002 with 200ms of its own pulse still to go and the blink and
         the dissolve read as one event, which is what the `storage-volume-detach-on-node-loss`
         ruling forbids. `orphan` is 3700.
         `reconcile` holds 4500 and moves nothing. The duration IS the reading time there, and 446
         characters at the catalog median of 10.18 ms/char want 4540. At 2000 it was the 4th most
         hurried step of 638.
         A Pod that materialises ON an arrival fades over LAND_MS 260 and not over FADE.in 600. At
         600 the ball has landed and the Pod is still coming up, so the pulse fired on the same beat
         spends most of itself on something not yet drawn, and the gap reads as a wait. The spans do
         NOT move: the 900 of the pulse binds every one of them, not the fade, so the durations are
         unchanged and M-19 still holds with the dead air where it was. pod3 LEAVES THE OWNED BAND
         WITH NO PULSE. It is losing an owner and it keeps running, so a blink would read as a
         create, which is the defect the adoption step on this same card is built to avoid.
         `report/pod-fade.test.mjs` carries the ruling under the key `workloads-replicaset orphan
         pod3`, which is the step id and the ref together. The relabel is done to the Pod from
         OUTSIDE, so `app=debug` is on the web-c3 box at step entry while the box still reads `owner:
         rs` and its tap is still drawn: relabelled, still owned. The ReplicaSet acts on that first,
         its release leaves at BEAT.lead, and only the release landing makes web-c3 unowned, so
         the crossing (pod3 and tap3 out, free3 in), the box reading `released · no owner` and
         `ownerReferences` all hang off that arrival. The `req` wire names only what the ReplicaSet
         sends, `remove ownerReference · create replacement`: the relabel is not its request.
         tap3 comes back at the arrival while pod3 stays gone: the tap belongs to whatever owns the
         slot, and after the replacement lands that is web-e5. ADOPTION IS A CHANGE OF OWNER, NOT A
         BIRTH, and the step is two beats because of it. The Pod surfaces in the UNOWNED band first,
         at OPACITY.notready, the shade for alive but outside this path. Only then does the
         ReplicaSet see a selector match and PATCH, and the crossing is a HANDOVER between the two
         bands: free4 fades out as pod4 fades in on the same beat, so the Pod is on screen for the
         whole step and nothing about it reads as a create. That is what the two bands buy against a
         single row, which can only fade the same element 0 -> notready -> 1 in place. In ONE row,
         rewinding pod4 to 0 and fading it 0 -> 1 is forbidden, because there that shape is byte for
         byte the grammar `self-heal` uses for a genuine CREATE. Across two bands pod4 DOES fade 0
         -> 1 and the rule is still met, by a different mechanism: the Pod it stands for is visibly
         alive one band below at the moment the fade starts. The PATCH waits FADE.in +
         BEAT.afterHop, the same idiom `self-heal` uses to put an event before the control-plane
         reaction it causes. The RS cannot match a selector against a Pod that is not on screen yet.
         The bus tail does not wind back with the Pod. LANE(3) runs along it, so the ball would fly
         its last two legs over blank canvas.
CONTENT  Read against k8s 1.35 and the two pages in `sources`.
         THE SCALE-DOWN ORDER IS THE ONE CLAIM THAT WAS WRONG. `converge` said it ranks `unscheduled
         and not-ready Pods first, then by the controller.kubernetes.io/ pod-deletion-cost
         annotation, and issues a delete`. Readiness is NOT in the published order: the ReplicaSet
         page gives pending and unschedulable, then pod-deletion-cost with the lower value first,
         then nodes carrying more replicas, then the more recently created Pod, then random.
         Readiness is in the internal sort of the controller and is an implementation detail rather
         than a contract. The page also says the ordering `is honored on a best-effort basis, so it
         does not offer any guarantees on pod deletion order`, so a sentence stating the order as
         deterministic is REJECTED. The wording that ships names the two published tiers and carries
         the disclaimer, and dropping the disclaimer to save characters is rejected: it is the qualifier
         that makes the sentence true.
         ADOPTION IS CONDITIONED ON THE OWNER, NOT ON THE CREATOR, and the card says so. The page
         reads `If there is a Pod that has no OwnerReference or the OwnerReference is not a
         Controller and it matches the selector of a ReplicaSet, it will be immediately acquired by
         said ReplicaSet`. So `no controller ownerReference` in the `adopt` narration and `no other
         controller already owns` in the desc are both exact, and `no owner` alone would be wrong: a
         Pod owned by a non-controller is still adoptable.
         RELEASE BY RELABEL IS DOCUMENTED AND SO IS THE REPLACEMENT. `You can remove Pods from a
         ReplicaSet by changing their labels`, and `Pods that are removed in this way will be
         replaced automatically`, which is exactly the two halves `orphan` draws. The page carries
         one qualifier the narration does not, `assuming that the number of replicas is not also
         changed`, and it is left out because the mark on the band holds spec.replicas at 3 for the
         whole card and the picture already states the condition.
         `A ReplicaSet never settles above its desired count` is kept as an absolute. It is the
         controller contract and the convergence the page describes. The counter-case is a Pod the
         API will not remove, a finalizer or a stuck terminate, and that is a statement about the
         cluster rather than about what the controller does, so it does not qualify this sentence.
         THE `selector` CHIP SHOWS THE ReplicaSet SELECTOR AND NEVER A Pod LABEL (P-02), and it reads
         `matchLabels app=web` on every step. `spec.selector` is a `LabelSelector`, `a label query
         over pods that should match the replica count` (apps/v1 ReplicaSetSpec), whose equality
         half is `matchLabels`, `a map of {key,value} pairs` (meta/v1 LabelSelector), and the page
         shows it as `matchLabels: tier: frontend`. `app=debug on web-c3` on `orphan` is rejected:
         it is the label of one Pod, written into the chip of a field the relabel never touches,
         and it says the selector changed on the one step whose whole point is that the POD did.
         The selector stands still and the released Pod box carries `app=debug`. A bare `app=web`
         is rejected too: it is letter for letter the label drawn on every owned Pod box, so the
         chip read as a fourth Pod label rather than as the query matching them.
         VERIFIED AND UNCHANGED: `controller: true` on the ownerReference, quoted in the page YAML.
         Garbage collection removing the Pods when the ReplicaSet goes, from the Owners and
         Dependents page. Scaling the Deployment writing spec.replicas on the ReplicaSet. The
         level-triggered loop working off observed state. A bare Pod having no owner to recreate it.
         `Deployments never manage Pods directly, they manage ReplicaSets` in the desc. Every drawn
         Pod name is RFC 1123. Both cited pages still carry the statements they are cited for.
NAMING   The replacement `orphan` creates is `web-e5` and a DIFFERENT element from the released
         `web-c3`, stacked in the same slot. One name cannot stand in both bands at once, and no
         writer reaches a Pod shell label, so relabelling the released Pod back would have put
         web-c3 in the owned band and the unowned band simultaneously.
SCOPE    The Deployment is on the canvas once, as the ReplicaSet sublabel `owned by Deployment web`,
         and it never acts. The rollout it drives, `maxSurge` and `maxUnavailable` are
         `workloads-rolling-update`. The revisions it keeps, `revisionHistoryLimit` and `kubectl
         rollout undo` are `workloads-deployment-rollback`: ONE ReplicaSet is drawn and never a
         second, which is what a revision would need.
         Garbage collection is NAMED by the `own` narration, as what the ownerReference link is for,
         and taught nowhere. The dependent walk, `blockOwnerDeletion`, the foreground cascade and
         finalizers are `cluster-cascading-deletion`.
         Which of the six kinds a workload wants is `workloads-controller-kinds`, whose own SCOPE
         names this card as the owner of the reconcile loop, ownerReferences, adoption and release.
         PodGC is deliberately NOT ceded. Every delete here is the controller removing a LIVE Pod
         through the API, where `workloads-pod-garbage-collection` is the backstop over Pods that
         have already reached a terminal phase, so a cession would pair two different mechanisms.
NOTE     A frozen frame cannot see an `F.set`: a SEEK never fires the `onfinish` an `at()` hangs its
         write on, which `card-review/tools/frames.mjs` states in its own header. The end state of a
         step whose write lands at an arrival has to be read from `settled-dump` or in real time,
         never off a `-95` frame.
DO NOT   Do not state `spec.replicas` or the observed count in a chip. The mark carries the first
         and the band carries the second, and a chip repeating either is the one way this
         composition can contradict itself, which is the failure the Instrument panel family is
         named for. THREE chips is the count, not four.
NOT A DEFECT
         `converge` keeps `reconcile` at entry: the ReplicaSet acts first, lit at entry, and its
         DELETE leaves at 0ms, so `delete -1` stands at the moment of decision, which on this step
         is entry. The three other action steps decide later and turn over later. `ownerReferences` goes from `PATCH · owner set` back to
         `controller=true` on `converge` with no cue, because the owner was set on `adopt` and the
         string returns from the action to the standing field: the fact did not change. Both are
         carried in `test/fixtures/carried.mjs` with those reasons. The unowned band is
         EMPTY on five of the seven steps. It is the second zone of a two-zone composition and its
         emptiness is the statement that nothing is unowned right now, which is why it is drawn at
         0.3 stroke opacity against the owned band's 0.55 and is the faintest thing on the canvas
         (C-14: a side that does not apply yet is dim rather than absent). Removing it would take
         both crossings with it.
OPEN     `CENTRE`: the chip strip spans 660..1140, centre 900 against a want of 600 +-6, and it is
         CARRIED in `test/fixtures/carried.mjs`. The right column is the only place three chips fit.
         The left column at this y is under the panel (396.55 x 329.20 at 1100x800), a bottom strip
         has nowhere to go because the two bands own 344..618 of a 624 canvas, and a strip
         straddling 600 would be crossed by the trunk, which runs down x=600 from 120 to the bus at
         372 through exactly the band the chips occupy. The CONTENT bbox centres and is not
         reported, so it is the pooled-strip metric that leans, not the picture (`L-16`, `L-17`).
```
