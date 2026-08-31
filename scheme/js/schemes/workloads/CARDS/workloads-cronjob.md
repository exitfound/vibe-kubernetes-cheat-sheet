## workloads-cronjob

### layout

```
WHAT     A schedule firing Jobs, with ticks that are skipped by concurrencyPolicy or missed
         during downtime staying visibly dark.
LAYOUT   C (bottom strip). panel bottom 330.
           ladder 660..1140, 6 rows
           chips  full-width strip, THREE per row at 350.67, two rows 548..624, short row on CX
           ticks  left band under the panel, one chip per 5-minute tick
         Neither column beside the panel fits: the left band is 350..464 = 114, against a 242
         ladder and a 202 chip column.
         Chips two per row, which the WL brief prefers, is three rows (118 tall) and leaves the
         Node frame 64 units where the Pod alone is 106. Three per row is 350.67, the floor, and
         the widest value here needs 304.
         The ticks are not at x=830: there they run straight through the pipeline ladder.
         POD_PAD is 80, not the family 24. With the frame at 404 a pad of 24 draws the first Job
         slot over the frame's own NODE-1 label. The row still centres on CX by construction.
LANES    Trunk from the CronJob box at TOP1_CX straight down (no jog, there is no left column to
         clear) into a bus at NODE_Y-8, tapping only the two Job slots that ever receive a create.
         `LANES` is built ONCE, one array per tapped slot, and the `P.lane` and every `F.route`
         index it, so the wire and the ball are the same array (A-02 SHARED). All 3 routes read it
         and none is carried. Do not rebuild it as a `LANE(i)` factory: a fresh array per call
         leaves the lane and the ball two equal copies, free to drift on the first geometry edit.
CONTENT  The `create` step says a repeated create for one tick COLLIDES ON THE NAME, not that a tick
         "can only ever produce one Job". The deterministic suffix is what makes the retry idempotent,
         and the `missed` step four rows down says the controller is not exactly-once and may rarely
         create two Jobs or none, so the unqualified form contradicted the card's own later step.
CONTENT  A Forbid skip is NOT a run cancelled. `forbid` read "the controller skips the new tick
         entirely and records the Event JobAlreadyActive, it does not queue the run for later",
         which teaches the opposite of the doc: "Forbid: The CronJob does not allow concurrent runs
         ... Also note that when the previous Job run finishes, .spec.startingDeadlineSeconds is
         still taken into account and may result in a new Job run." and "when using
         concurrencyPolicy: Forbid, long-running Jobs may cause scheduled times to be skipped, but a
         new Job can be created once the previous Job completes." The controller writes no
         status.lastScheduleTime on a Forbid skip, so the missed time stays unmet and can still start
         inside the deadline. The step now ends "but once the previous run finishes that skipped tick
         can still start if it is inside startingDeadlineSeconds". `JobAlreadyActive` was verified in
         the controller itself and is correct.
         https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/
CONTENT  The 100-missed-schedules check and startingDeadlineSeconds are NOT alternatives. `missed`
         read "With no deadline set the controller instead refuses to schedule once it finds more
         than 100 missed start times", and the `desc` read "within startingDeadlineSeconds, or, with
         no deadline, until 100 ticks pile up". The "instead" and the "or" made them mutually
         exclusive. The doc: "For every CronJob, the CronJob Controller checks how many schedules it
         missed in the duration from its last scheduled time until now. If there are more than 100
         missed schedules, then it does not start the Job and logs the error." The check runs
         UNCONDITIONALLY, and the deadline only narrows the window it counts over: "if the
         startingDeadlineSeconds field is set (not nil), the controller counts how many missed Jobs
         occurred from the value of startingDeadlineSeconds until now rather than from the last
         scheduled time until now." The step now opens that sentence with "Whether or not a deadline
         is set", which is the whole repair: the falsehood was the EXCLUSIVITY, not the rule. The
         `desc` reads "bounded both by startingDeadlineSeconds and by a ceiling of 100 missed ticks",
         at the same 460 characters as before.
         The narrowing itself is deliberately NOT in the card, and that is a PANEL decision recorded
         under BUDGET below rather than an editorial one.
         https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/
CONTENT  "refuses to schedule" past 100 misses stands exactly as written, and the two words are
         load bearing. kubernetes.io says the controller "does not start the Job and logs the
         error", and the controller read on six branches from release-1.24 to master emits a
         TooManyMissedTimes Event and creates the Job anyway. So the DOCS PAGE is the stale party
         here, and which of the two a card follows is a product decision, not a defect to close.
         The wording above changes the framing of that clause and not its claim.
         https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/
BUDGET   Both repaired steps were sized by OPENING THE FRAME at 1100x800. A first `missed` that also
         explained the narrowing ran to 611 characters and covered the `Node-1` label 100%, clipping
         backup-28394400 with it. A first `forbid` that named startingDeadlineSeconds ran to 547 and
         buried the `schedule ticks · every 5 min` caption, which the ORIGINAL string cleared by 1.6
         units: this card sits one line off its caption on both these steps and has done all along.
         The shipped strings are 486 (`forbid`, was 483) and 504 (`missed`, was 511), both on the
         same line count as before, and `npm run report` has the card SHALLOWER than it found it,
         329.20 against 378.90 at 1100x800. Ceilings: about 490 for `forbid` and about 510 for
         `missed`, and the line boundary is between 486 and 497 characters, measured.
         Nothing in `npm test` or `npm run report` sees a covered caption, so re-open the frame.
         https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/
```

### before `id: 'suspend',`

```
The beat is the static highlight on the CronJob box, which is both the object spec.suspend is set on
and the actor that stops creating Jobs. The frame is otherwise all but identical to the step before
it, and the wire label is what separates them.
The same block as forbid and missed on purpose: all three mute steps are one controller deciding
not to create, and a different block per step would claim three different actors.
F.flash stays off all three. It animates filter brightness 1 to 1.55 to 1 on the block group,
which M-04 calls a pulse and M-01 forbids on infrastructure, and its 600ms equals the whole span
of each step, so no still frame can tell it from the highlight it replaced.
```

### poster

```
A clock on the left, a dashed leg with a chevron, and a Job frame on the right holding one filled
run. Direction is the sentence (the clock CAUSES the Job), so the chevron is earned here where most
posters do without one.
The four tick dots make the circle a clock rather than a node, at four marks instead of twelve: at
200px, twelve would read as noise.
```
