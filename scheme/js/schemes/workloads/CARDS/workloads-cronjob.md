## workloads-cronjob

### layout

```
WHAT     A schedule drawn as a time axis, where every tick either produced one Job or stayed empty
         for a named reason.
LAYOUT   Two bands and NO A / B / C preset: there is neither a ladder nor a flanking chip column for
         A / B / C to choose between, which is the exemplar's argument and
         `workloads-finished-job-cleanup`'s.
           actor  one box, CronJob, 240 wide at 480..720, centred on WL.SPINE_X (WL.L-07)
           runs   seven equal slots, strip(60..1140, count 7, gap 14) = 142.29 wide, at 396..496
           axis   a 2 unit rule at 512 across the full width, a 12 unit graduation at 506..518
                  under each slot centre, the tick label on 538 and the caption on 562
           chips  a full-width strip THREE across at 578..612, the WL.L-05 three-across width of
                  350.7, derived through strip() from the same gap of 14 the run row takes
         ONE actor and no API box. What a CronJob writes THROUGH is `cluster-object-create-path` and
         what runs the Pod is `workloads-job-parallelism`, so a second box here would be an actor no
         beat needs (T-21), and the one lane on the card leaves the box that ACTS by construction
         (A-09).
         NO `node()` frame. The seven slots are seven TICKS and not seven places, so a frame around
         the row would say the runs share a Node, which a CronJob does not promise. Same argument as
         `workloads-replicaset` and `workloads-job-parallelism`, and taking the frame out is what
         takes this card off the WL.A-03 queue.
         The seven slot CELLS are drawn from the first frame and never removed, and they are what
         every tap lands on. With the row empty a tap points its arrowhead at blank canvas for the
         whole BEAT.lead of 800 plus the flight, which on `create` is 2455 of 3800ms.
         The chip strip carries only what the picture cannot: the row draws how many runs are live
         and the axis draws when each one fired, so `status.active` and `lastScheduleTime` are not
         chips here and are named in no string.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport: `OVERLAY_IDS=workloads-cronjob node
         --test report/overlay.test.mjs`. Deepest on step 5 `missed` at 503 characters, with step 2
         `forbid` at 484 tying it on the narrowest viewport. The panel does not track character
         count monotonically (`L-05`): on this card 371 characters reads shallower than 375, because
         the number of LINES is what moves it.
         The bus at 352 is what the panel pins. It clears the deepest reading by 22.8 and the run
         row hangs 44 below it.
SIZES    A slot is 142.29 and the Job name floors it: `backup-28394400` measures 106.7 as a Pod
         label, leaving 17.8 at each wall. The inner Pod box is 106.29 and its widest sublabel,
         `Succeeded`, is 55.2. A verdict mark's second line meets the same wall: the widest, `past
         the deadline` and `spec.suspend=true`, both measure 104.3 and leave 19.0.
         A chip is 350.67 with 326.67 inside its padding, and the widest pair is `last event` at
         61.3 against `JobAlreadyActive · 12:05 skipped` at 196.3, which leaves 69.1 between the
         name and the value. The widest wire, `delete backup-28394400 ·
         successfulJobsHistoryLimit=3`, measures 325.2 centred on WL.CX and clears the panel's right
         edge by 41.
         The axis caption is 227 and the tick labels are 30.7 each with 125.6 between neighbours.
LANES    `LANES` is built ONCE, one array per tapped slot, and the `P.lane` and every `F.route`
         index it, so the wire and the ball are the same array (A-02 SHARED). Do not rebuild it as a
         `LANE(i)` factory at the call sites: a fresh array per call leaves the lane and the ball
         two equal copies, free to drift on the first geometry edit.
         Only slots 0, 2, 3 and 4 ever receive a create, so only those four carry a lane, and no
         drawn lane is unridden (A-05). Slot 3 sits ON the spine, so its array drops straight from
         the box with no turn and the redundant bus vertex is left out.
         A lane's shade is the run's: the CronJob is lit on every step, so `stage()` writes one
         value for the Job and its lane, and a lane appears with the run it created and goes with it
         when the prune takes it (A-13, A-16, A-14).
MOTION   `create` and `history` each send one ball down LANES[0], 744.9 units, which routeDur puts
         at 1655ms at the canon PKT_SPEED of 0.45, leaving at BEAT.lead.
         `next` sends three, in tick order, at BEAT.lead and +450 and +900, so the row fills left to
         right at the rhythm the schedule fires at rather than in one burst. LANES[2] and LANES[4]
         are 432.3 units at 961ms, LANES[3] is 276 and sits on the PKT_DUR_MIN floor of 700 (M-13).
         Arrivals land at 1761, 1950 and 2661.
         The even beat is on the DEPARTURE and cannot also be on the arrival: the middle flight is
         261ms shorter than its neighbours, so even departures give arrival gaps of 189 and 711, and
         even arrivals would give departure gaps of 711 and 189. The departure IS the tick, which is
         the thing the schedule owns and the thing the axis draws evenly spaced, so that is the end
         kept even. Equalising the three flights instead takes an explicit `dur`, and `M-12` gives
         no latitude to a card outside the `PACING` registry in `test/render/motion.test.mjs`, which
         carries no workloads card.
         On `history` the pulse and the fade share the arrival, which is M-08 read at its limit, and
         the `pruned` mark reveals FADE.out later so the slot is empty before it is named. The three
         steps where the controller declines to create carry NO packet: the reason mark reveals at
         BEAT.lead, and on the two of them that record an Event the chip turns over on that reveal,
         so no value is readable before the thing that produces it (P-03). Neither the box nor the
         chip flashes (M-26, M-01).
         Durations are sized off the MEASURED narration length, at 8.68 to 12.61 ms per character, a
         band that STRADDLES the catalog median rather than sitting under it. The number itself is
         not copied here: `timing.mjs` prints the median and the rank of every step beside it.
         ON `suspend` the beat is the static highlight on the CronJob box, which is both the object
         `spec.suspend` is set on and the actor that stops creating Jobs. The 12:30 tick is what
         separates that frame from the one before it: the clock still matches and the slot under it
         takes a suspended mark instead of a run. It takes the same block as `forbid` and `missed` on
         purpose, because all three mute steps are one controller deciding not to create and a
         different block per step would claim three different actors. `F.flash` stays off all three:
         it animates filter brightness 1 to 1.55 to 1 on the block group, which `M-04` calls a pulse
         and `M-01` forbids on infrastructure, and its 600ms equals the whole span of each step, so
         no still frame can tell it from the highlight it would replace.
CONTENT  The `create` step says a repeated create for one tick COLLIDES ON THE NAME, not that a tick
         "can only ever produce one Job". The deterministic suffix is what makes the retry
         idempotent, and the `missed` step says the controller is not exactly-once and may rarely
         create two Jobs or none, so the unqualified form contradicts the card's own later step. A
         Forbid skip is NOT a run cancelled. The doc: "Forbid: The CronJob does not allow concurrent
         runs ... Also note that when the previous Job run finishes, .spec.startingDeadlineSeconds
         is still taken into account and may result in a new Job run", and "when using
         concurrencyPolicy: Forbid, long-running Jobs may cause scheduled times to be skipped, but a
         new Job can be created once the previous Job completes". The controller writes no
         status.lastScheduleTime on a Forbid skip, so the missed time stays unmet and can still
         start inside the deadline. The step ends "Once the 12:00 run finishes, that skipped tick
         can still start if it is inside startingDeadlineSeconds". `JobAlreadyActive` is the
         controller's own name for it.
         https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/ The
         100-missed-schedules check and startingDeadlineSeconds are NOT alternatives. The doc: "For
         every CronJob, the CronJob Controller checks how many schedules it missed in the duration
         from its last scheduled time until now. If there are more than 100 missed schedules, then
         it does not start the Job and logs the error." The check runs UNCONDITIONALLY, and the
         deadline only narrows the window it counts over: "if the startingDeadlineSeconds field is
         set (not nil), the controller counts how many missed Jobs occurred from the value of
         startingDeadlineSeconds until now rather than from the last scheduled time until now." The
         step opens that sentence with "Whether or not a deadline is set", which is the whole
         repair: the falsehood is the EXCLUSIVITY, not the rule. The `desc` reads "bounded both by
         startingDeadlineSeconds and by a ceiling of 100 missed ticks". The narrowing itself is
         deliberately NOT in the card, which is a PANEL decision recorded under BUDGET rather than
         an editorial one.
         The threshold is a COUNTER and the card says so: "once its count of missed start times
         passes 100". Nothing drawn encodes it, and the seven graduations are the only countable
         thing on the canvas, so the wording keeps the number off the picture on purpose.
         https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/ Past 100 misses the
         step says the controller "refuses to catch up", and the verb is SCOPED on purpose.
         kubernetes.io says it "does not start the Job and logs the error" and then scopes that in
         the very next sentence, "This behavior is applicable for catch-up scheduling and does not
         mean the CronJob will stop running". So the unscoped "refuses to schedule" is rejected: it
         states the exact reading that sentence exists to deny, and a reader carries away a CronJob
         that has stopped. "catch up" is also the doc's own term and is the same nineteen
         characters, so the repair costs the panel nothing on the card's deepest step. Following the
         DOC at all is itself the decision here. The controller read from release-1.24 to master
         emits a TooManyMissedTimes Event inside `nextScheduleTime` and returns `mostRecentTime`
         regardless, so `syncCronJob` goes on to create the Job: the DOCS PAGE is the stale party,
         and which of the two a card follows is a product decision, not a defect to close.
         https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/
         https://github.com/kubernetes/kubernetes/blob/master/pkg/controller/cronjob/utils.go Every
         value on the `last event` chip is an Event the controller actually records, and two values
         that are not one are rejected. "created 3 Jobs · 12:10 to 12:20" on `next` is no Event at
         all: `SuccessfulCreate` fires once per Job, "Created job %v", so three creates are three
         Events and never one aggregate. The step states `created backup-28394420`, the last of the
         three, which is what a chip named `last event` promises and what the `F.set` on the third
         arrival earns. "suspend=true · creation paused" falls to the same rule: the suspend branch
         of `syncCronJob` logs and returns with no recorder call at all, so a suspended tick is the
         one decline on this card that emits NOTHING. That step therefore does not turn the chip
         over. It holds the 12:25 `MissSchedule`, which is still the last Event, keeps its mark
         reveal and carries no `F.set` and no `reducedLit`. Writing a state onto an Event chip is
         P-02, and loosening the chip NAME to admit such a value is rejected too, because
         `JobAlreadyActive` is an Event reason verbatim and the Event is the artefact `kubectl
         describe cronjob` shows.
         https://github.com/kubernetes/kubernetes/blob/master/pkg/controller/cronjob/cronjob_controllerv2.go
         The Job name suffixes stay as drawn. `getJobName` is the CronJob name plus
         `getTimeHashInMinutes`, which is `scheduledTime.Unix() / 60`, so the number is an absolute
         instant carrying no zone: 28394400 decodes to 08:00 UTC and the other three are 10, 15 and
         20 minutes past it. A tick labelled 12:00 therefore states a cluster whose CronJob clock is
         UTC+4, which is what a schedule with no `spec.timeZone` takes from the
         kube-controller-manager. Renumbering them to decode to 12:00 UTC is rejected: nothing on
         the card claims UTC, the caption says `wall clock`, and the swap moves six strings for a
         coincidence the card never promises. What the narration claims is only that the suffix is
         "the scheduled time in minutes", and that is exact.
         https://github.com/kubernetes/kubernetes/blob/master/pkg/controller/cronjob/utils.go The
         `next` step may not say a tick gets "its own Job or nothing at all". That is an exhaustive
         dichotomy and the `missed` step denies it two steps later, where a CronJob "may rarely
         create two Jobs or none for a tick". The doc: the scheduling "is approximate because there
         are certain circumstances where two Jobs might be created, or no Job might be created". The
         step reads "each of these ticks gets a Job of its own, and the skipped 12:05 tick gets
         none", which names the two cases the picture draws without claiming they are the only two.
         https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/ "the ticks missed
         while suspended are scheduled immediately" follows the DOC and not the controller, the same
         way "refuses to catch up" does. The doc: "When .spec.suspend changes from true to false on
         an existing CronJob without a starting deadline, the missed Jobs are scheduled
         immediately." `mostRecentScheduleTime` walks forward to the LAST schedule time at or before
         now and returns only that one, so the controller starts the most recent missed tick and
         skips the rest. Both readings are recorded because they disagree and the card keeps the doc
         wording.
         "scheduled at once" is rejected FOR that reason rather than on style. It reads two ways,
         and the second one, all of them together, is the reading the controller denies, so the
         ambiguity lands on exactly the sentence this card cannot afford it on. The doc's own word
         carries only the timing. It costs 4 characters and the step still measures 304.4 at
         1100x800, which is the same line count it had at 449.
         https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/ The `aria-label` may
         not list `pruned` among the reasons a tick "stays empty". The 12:00 tick DID create a run
         and the prune deletes it three steps later, so the pruned slot is the one empty cell that
         is not a tick the controller declined. The list carries the three declines and names the
         prune apart, "and where the oldest run is later pruned by the history limits".
         The `aria-label` keeps "each tick either creates one Job that runs its own Pod or stays
         empty for a named reason" even though the `next` entry above bans that dichotomy in a
         NARRATION. T-28 makes the label a description of the whole DRAWING, and the drawing has
         seven slots each holding either a run or a mark, so the pair is exhaustive over what is on
         the canvas rather than over what a CronJob can do. The trailing list of three declines and
         the prune is what pins it to this picture. The `desc` says a CronJob "creates a Job from
         its template" and not "one Job". The count is the defect the `create` entry above is held
         to, one step further out: `missed` denies exactly-once, `workloads-controller-kinds` writes
         "about one per tick and not exactly one" and "about one Job per tick" for this same
         mechanism, and the doc opens "A CronJob creates a Job object approximately once per
         execution time of its schedule". The `desc` is the one string on this card a dialog reader
         never sees, so no later step qualifies it and it has to stand alone. The indefinite article
         keeps the Job-not-Pod contrast the sentence exists for, which the closing "it only creates
         Jobs" states outright, and it spends nothing: 458 characters of the 400..470 band against
         460. "creates about one Job from its template" is rejected as a hedge landing on the wrong
         noun, because the sentence is contrasting a Job with a Pod and not one Job with two.
         https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/ Read against the 1.35
         the entry claims, and standing unchanged: `concurrencyPolicy` with Allow as the default and
         Forbid and Replace beside it, `successfulJobsHistoryLimit` 3 and `failedJobsHistoryLimit`
         1, `spec.suspend` defaulting to false and not reaching a Job already started, `*/5 * * * *`
         against the seven five-minute ticks, and `spec.jobTemplate`, `spec.startingDeadlineSeconds`
         and `spec.concurrencyPolicy` as field paths. The newest thing on the CronJob page at all is
         the v1.32 annotation `batch.kubernetes.io/cronjob-scheduled-timestamp`, which this card
         does not draw, so nothing here is younger than the version the entry states.
         https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/cron-job-v1/
BUDGET   The deepest step has 22.8 units between its panel floor and the bus, which is less than one
         line of narration: the same card measures a line at about 25 units. So no string here may
         grow by a LINE. The ceiling is measured, not assumed: `missed` at 528 characters reads 354
         and sits ON the bus, at 503 it reads 329.2 and clears it, and at 473 it reads 304.4.
         Character count alone does not predict which side of a line break a string lands on (see
         PANEL), so re-measure by opening the frame rather than by counting. The clause `may rarely
         create two Jobs or none for a tick` is what the step is sized AROUND:
         `workloads-controller-kinds` quotes it from here to keep its own `about one per tick`
         qualifier true, so it is not the clause to cut when the budget runs out.
         Nothing in `npm test` or `npm run report` sees a covered caption, so re-open the frame.
SCOPE    What a Job DOES once it exists is `workloads-job-parallelism`: `completions`,
         `parallelism`, `backoffLimit` and the run reaching Complete. Each Job here is one slot with
         one `Pod` box inside it, and `create` states the path CronJob then Job then Pod precisely
         so a reader does not read that Pod as this controller's own work.
         `ttlSecondsAfterFinished` is `workloads-finished-job-cleanup`, which states this same
         contrast from its side. `successfulJobsHistoryLimit` and `failedJobsHistoryLimit` on
         `history` are a COUNT-based prune this controller runs over the Jobs IT created, where the
         TTL is a CLOCK-based delete a different controller runs over any finished Job.
         Neither the field nor the clock is named here.
         The Pod of a pruned Job goes as a DEPENDENT, and the ownerReference walk behind that is
         `cluster-cascading-deletion`. The cluster-wide backstop that takes terminated Pods on
         `terminated-pod-gc-threshold` is `workloads-pod-garbage-collection`. Neither is drawn:
         `history` deletes a Job object and says its Pod goes with it.
         The write path itself belongs to `cluster-object-create-path`, which is why no API box
         stands here and no string says "through the API".
NOTE     The three mute steps hold still for 2899, 3299 and 2900ms, which is 69, 72 and 69 percent
         of the step and puts all three near the top of the stillness ranking. That is the reading
         time their narrations need, not dead air: the same three are the three FASTEST steps of
         this card on ms per character, and `deadair.mjs` prints both rankings side by side, which
         is the pair the verdict is read off rather than the stillness column alone. Cutting any of
         them takes reading time off the longest narrations on the card and buys the motion nothing.
         Nothing may travel on them either: no Job is created, so a ball would be traffic no beat
         narrates (M-10).
WHY NOT  A SPLIT bus, the trunk and three bus segments drawn as their own lanes with `part.tune`
         dropping their markers and every route assembled from those arrays. The argument for it was
         that four lanes sharing one trunk draw that trunk four times over itself and that the prune
         would then LIGHTEN it by removing one of the four copies. Measured on the rendered lane,
         both halves are false: `.scheme-arrow` sets no `stroke-opacity`, and the element reads
         `stroke-opacity: 1`, `opacity: 1`, `stroke: rgb(91, 184, 255)`, so N identical copies
         composite to the pixels of one and removing one changes nothing. Both forms render the same
         picture, so the split one costs four `part.tune` sites and drops the A-02 tier from SHARED
         to ASSEMBLED for a difference no frame shows.
DO NOT   Do not put the reason marks back inside their own dashed outline. The outline is the
         permanent slot CELL, and giving a mark a second one draws two boxes on one slot and makes
         the four empty ticks read as a different kind of object from the three full ones.
OPEN     CENTRE and CENTRE-LOW both report: the blocks the probe counts, four Job slots and the
         CronJob box, span 60..827 with their centre at 444 against a want of 600 +-40, and the
         eight blocks below the panel span the same. The DRAWN picture is dead centred: the axis,
         the seven slot cells and the chip strip each span 60..1140 for a centre of 600 and margins
         of 60 and 60, and the probe counts none of the three (L-17 says so for chips, and the axis
         and the cells are `P.raw` with no painted class by design).
         It cannot be closed without making the card worse. The four runs sit at 12:00, 12:10, 12:15
         and 12:20 because the story is chronological and a run has to stand under its own tick, and
         the ticks that produce nothing come last: a schedule reads left to right and what goes
         wrong comes after what works. Reordering to balance the row would put the prune before the
         fourth success. Drawing the empty cells as `P.box` would make the probe count them and put
         the centre on 600, and would also draw four ticks that produced nothing as four components
         that exist, which is the one thing this card must not say. A row whose every slot fills is
         symmetric by construction and reports nothing, and that is the shape this card gives up to
         draw a tick that produced no run.
```
