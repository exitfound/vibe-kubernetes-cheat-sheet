## workloads-job-parallelism

### layout

```
WHAT     A Job holds three workers running at once and fills a five slot completion ledger, and a
         run that fails fills nothing and spends a failure against a limit of six instead.
LAYOUT   An INSTRUMENT panel, four bands, no `LAYOUT` preset and no `node()` frame.
           40..120    one actor, the Job box at 484..716, centred on WL.SPINE_X per WL.L-07
           170..192   the failure budget, six ticks 44 wide at 816..1140, caption at 214
           300..406   three worker slots 300 wide at 84 / 450 / 816, caption at 430
           470..528   the completions ledger, five slots 201.6 wide at 60..1140, caption at 554
         Every number the subject owns is a LENGTH here and none of it is a chip: five ledger slots
         are `completions`, six ticks are `backoffLimit`, three worker slots are `parallelism`, and
         the filled counts are `succeeded` and `failed`. Each caption reads its own array length, so
         a caption cannot state a number the meter does not draw.
         The two meters are deliberately NOT peers. Completing is the ordinary outcome and failing
         is the rare one, so the ledger takes the full 1080 at the foot of the card and the budget
         takes 324 on the wall beside the controller. Two equal meters side by side would say the
         Job is as likely to fail as to finish.
         The worker slots are drawn whether a worker stands in one or not, on the Pod rect exactly
         (`podShell` draws rx 8 on the same box, so an occupied slot shows one outline). Without
         them the parallelism caption labels an empty band on the poster frame, which is the first
         thing a reader sees.
         THE CAST IS SIX PODS IN THREE SLOTS, two waves of three, and only three are ever visible at
         once. `succeed` says a Pod that has succeeded is never restarted or reused, so the three
         the controller creates on `refill` cannot be the first three relabelled back to Running:
         each is its own element stacked in the freed slot, which is the grammar
         `workloads-replicaset` states for the same reason and which no card in the catalog breaks.
         Reusing `worker-1` to `worker-3` for the second wave put one name in two lives and made the
         picture argue against its own narration.
         The slot band is the RUNNING window, not a register of Pod objects, so a worker that has
         exited VACATES its slot when the next wave takes it, on `refill` and not on the step that
         ended its run. Nothing is being deleted there, which `fail` says in words: what carries a
         finished run afterwards is the ledger mark it wrote, and what carries the failed one is the
         budget tick it spent. That is the whole argument for drawing the two meters.
         No `node()` frame: where these three Pods run is not the subject, the same argument
         `workloads-replicaset` and `workloads-statefulset-ordered-rollout` carry, and one frame
         around all three would say a Job promises they share a Node. The card therefore has no lane
         that can meet WL.A-03 and is out of `report/frame-face.test.mjs`'s queue.
         No API box either. The Job controller is the only thing that acts, and a second actor box
         no step narrates is what every sibling in this section already draws.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport: `OVERLAY_IDS=workloads-job-parallelism
         node --test report/overlay.test.mjs`. Deepest on `fail` at 1100x800, the one step whose
         narration runs to a further line, and it is what the worker band clears: at POD_Y 300 the
         leftmost slot stands 70 below that reading. Nothing else on the card starts left of 484
         above y=203.
SIZES    Measured at 1100x800, the widest case. The budget caption is 306.7 wide, ends at x 1131.4
         against the 1140 wall, and its box ends at y 217.7. The wire label beside the trunk opens
         at y 251, so the two stand 33.3 apart.
         At BUD_Y 190 they stood 13.3 apart over 74.5 units of horizontal overlap, which is why the
         budget band sits at 170.
         The three captions measure 306.7, 263.8 and 300.6 and each clears its own meter: the
         parallelism caption at y 419..433.7 stands 13 under the worker slots and 36 over the
         ledger, and the completions caption ends at 557.7 against the 624 floor.
LANES    One trunk off the Job box bottom face at WL.SPINE_X, a bus at BUS_Y 274 and one tap per
         worker. `LANES` is built ONCE, one array per worker, and both `P.lane` and the `F.route`
         inside `create` index it, so the wire and the ball are the same array (A-02 SHARED). Do not
         rebuild it as a factory: a fresh array per call leaves two equal copies free to diverge on
         the first geometry edit.
         The middle worker centres on WL.SPINE_X, so its lane skips the bus point rather than
         drawing a zero-length segment, and that is what makes the three taps unequal: the outer two
         run 546 units and the middle one the bare 180. All three fly for `CREATE_DUR`, the longest
         of the three at 1213ms, so the wave leaves on one beat and lands on one beat. On its own
         routeDur the middle tap sits on the 700ms `PKT_DUR_MIN` floor and delivers worker-2 513ms
         before its two peers, which reads as three unrelated creations rather than the one parallel
         batch under a single cap the card is about. The explicit `dur` is M-12's exemption and is
         registered in `render/motion.test.mjs` as `workloads-job-parallelism: speed 2`: the two
         outer balls ARE their own routeDur, so the deviation bought is the middle ball alone, once
         per create step. It flies at 0.148 u/ms, rank 223 of 844, against a catalog floor of 0.034.
         Nothing rides UPWARD. A worker reporting its exit is drawn as the meter moving on the beat
         its pulse hands over, not as a ball, because no step names anything travelling back and
         A-06 decides that per step.
MOTION   3400 / 2600 / 2600 / 3400 / 3000 against spans of 2913 / 1500 / 1500 / 2913 / 1800. The two
         create steps are sized to the 1213ms CREATE_DUR plus its BEAT.lead and its pulse. The three
         exit steps carry pulses, reveals and fades only, and every worker in a wave acts on ONE
         beat: the pulses fire together at 0, the labels turn over and the meter marks reveal
         together at BEAT.afterPulse, and the workers and the lanes that fed them settle to the
         tombstone shade together on that same beat. The workers are peers under one parallelism cap
         and no narration here gives them an order, so a stagger draws a sequence the subject does
         not have. An earlier build spread them 220 apart to keep the meters off one beat, and what
         it actually read as was three unrelated exits. `complete` is the one step that keeps a
         second beat: the condition follows the ledger by REVEAL_MS, so Complete=True lands as the
         consequence of the fifth slot filling rather than racing it. Still time runs 14 / 42 / 42 /
         14 / 40 percent against a catalog median of 42, and every step ranks between 85 and 478 of
         652 on reading pace, so no step is either hurried or parked.
         Every meter mark is born at opacity 0 and PINNED by every step through one `stage()`
         factory, so prev and reset replay the instrument rather than a blank one. Verified by
         `gotoStep` over all six steps forwards and backwards: the two readings are identical. A
         chipless card has nothing to fall back on if a mark is written by the animation alone, so
         the pinning is a build requirement rather than a refinement.
         Four steps open on the state their first clause describes and turn the worker labels over
         on the beat, through `rewind` plus one `F.set` per wave. Without it `refill`
         opens on three Pods reading Running while its narration says none is.
         `refill` empties the window before it refills it: the three that exited fade out and the
         three lanes come back to full, both inside `FADE.out` 700, and only then do the balls leave
         at `BEAT.lead` 800. So no ball rides a tombstone lane (A-15) and no new worker lands on a
         slot another Pod still stands in. Both waves are pinned by `stage()` on every step and
         every label of both is stated by `labels()`, so prev and reset replay the wave that is off
         screen rather than the state the step before happened to leave.
CONTENT  `completions` is 5, not 6, and the number is forced by the wave count the card DRAWS. Six
         completions with parallelism 3 and one failure needs SEVEN Pod runs and therefore three
         waves: wave 1 yields 2 successes, wave 2 is the failed unit retried plus two more and takes
         the count to 5, and a sixth would then run alone. This card draws two waves, so it is a
         five-completion Job.
         At 5 the arithmetic closes on the drawing: 2 succeed, 1 fails, 3 completions remain,
         `min(parallelism 3, remaining 3)` is 3, and the three that follow fill slots 3, 4 and 5. No
         slot is filled by a run the card does not show and no run the card shows fills nothing
         except the one failure, which is what the budget tick is for. `backoffLimit` is the count
         of failures the Job SURVIVES, so the caption reads `exceeding it marks the Job Failed` and
         the six drawn ticks are a budget rather than six deaths. Under the `restartPolicy` Never
         this card draws, the controller tests `.status.failed > .spec.backoffLimit`, so a limit of
         6 is spent by six failures and killed by the seventh. `reaching it` is rejected because it
         is the OnFailure comparison, where the summed container restart count is tested with `>=`,
         and OnFailure is the policy this card does not draw.
         kubernetes.io states it both ways, and the outlier is the sentence under Pod backoff
         failure policy: "If either of the calculations reaches the .spec.backoffLimit, the Job is
         considered failed."
         https://kubernetes.io/docs/concepts/workloads/controllers/job/#pod- backoff-failure-policy
         The same page contradicts it under Terminal Job conditions: "The number of Pod failures
         exceeded the specified .spec.backoffLimit in the Job specification."
         https://kubernetes.io/docs/concepts/workloads/controllers/job/#terminal-job-conditions The
         API reference agrees with the second and carries the default: "Specifies the number of
         retries before marking this job failed. Defaults to 6, unless backoffLimitPerIndex (only
         Indexed Job) is specified."
         https://kubernetes.io/docs/reference/kubernetes- api/batch/job-v1/ Upstream breaks the tie,
         and it is named here because a controller comparison is an implementation detail rather
         than a contract: `exceedsBackoffLimit := jobCtx.failed > *job.Spec.BackoffLimit` against
         `pastBackoffLimitOnFailure` returning `result >= *job.Spec.BackoffLimit` for OnFailure
         alone, in `pkg/controller/job/job_controller.go`.
         The same reading is what `fail` narrates and what the `aria-label` and the `desc` say, so
         the four move together or not at all. `fail` names `restartPolicy` Never because only that
         policy sends a failing Pod to phase Failed, and `.status.failed` is defined as "The number
         of pods which reached phase Failed". Under OnFailure the container restarts inside the same
         Pod and the restarts, not the Pod, are what count against the limit, so the drawn shape
         holds for Never alone. The comparison itself stays ceded to `workloads-pod-restart-policy`.
         `succeed` says a Pod that HAS SUCCEEDED is never restarted or reused. The unqualified form,
         a finished Pod, is false under OnFailure, where a failing container is restarted in place.
         A Pod that exited 0 is restarted under no policy a Job may set. The Job object is drawn as
         `Job resize-images`. A Job named `batch` states the API group of the kind (`batch/v1`) as
         the name of the object, which is the one name this card must not use. `refill` says the
         controller creates 3 NEW Pods and not 3 more, because `succeed` states that a succeeded Pod
         is never restarted or reused while the three slots come back carrying the three names that
         just retired. The words are the whole of what carries the newness here: the Pod parts are
         built once off `POD_NAMES`, no step verb reaches a Pod NAME (`labels` resolves to the inner
         box), and a second cast of three moves the composition rather than the wording. The
         contradiction is reduced by the wording and is not closed by it. `spawn` opens on a Job
         with a fixed completion count and names the 5 in its next sentence, which is the qualifier.
         The bare opening is kept because the whole card draws that type: a Job with
         `.spec.completions` null is a work queue, where "Setting to null means that the success of
         any pod signals the success of all pods"
         https://kubernetes.io/docs/reference/kubernetes-api/batch/job-v1/ and there is no fixed
         number of successes to run to.
SCOPE    `ttlSecondsAfterFinished` is the last clause of `complete` and nothing more. The TTL clock,
         the ttl-after-finished controller and the cascading delete that takes the Pods out with the
         Job are `workloads-finished-job-cleanup`, which sits immediately after this card and is
         what that clause hands the reader over to. This card ends with the Job and its Pods still
         there, which is that card's first frame.
         Nothing here says who created the Job: it exists at step 1. A schedule, a `jobTemplate` and
         one Job per tick are `workloads-cronjob`.
         The API server is not drawn. That every write goes through it is
         `cluster-object-create-path`, and putting the box here would make the card two hops about a
         path it does not teach.
         `restartPolicy` is named ONCE, on `fail`, and only as the Never that puts a failing Pod in
         phase Failed. Every replacement on this card is a NEW Pod, which `refill` states in words
         AND the second wave draws, and Never against OnFailure inside one Pod is
         `workloads-pod-restart-policy`.
         The exponential backoff on `refill` is the JOB controller's, counted per Job against
         `backoffLimit`, and it is NOT the Kubelet ladder `workloads-crashloopbackoff` draws. The
         two start at the same 10s and are run by different controllers over different objects, so
         that card is ceded nothing here and `CrashLoopBackOff` is named nowhere on this one.
         `completionMode: Indexed` and `JOB_COMPLETION_INDEX` are named nowhere either, and the
         ledger slots carry no unit numbers for the same reason: a NonIndexed Job, which is the
         default this card draws, has no unit identity to number.
NOTE     The card draws two WAVES where a controller refills a slot as soon as it frees. The drawing
         holds because the three runs are equal work released on one beat, so the three exits fall
         inside one controller sync and nothing is created between `succeed` and `fail`. Separating
         the exits in time would owe two replacements on `succeed`. The failure is drawn on the
         BUDGET and never on the ledger. A failed run records no completion, so a ledger cell marked
         as failed would state a completion that does not exist, and the two meters carry the two
         counts they each name. `SuccessCriteriaMet` is a real Job condition and is not drawn. Since
         1.31 the controller adds it, or `FailureTarget`, as soon as the success or the failure
         criteria are met, to trigger Pod termination, and the terminal `Complete` follows only once
         every Pod of the Job is terminal: "The Job controller adds the FailureTarget condition or
         the SuccessCriteriaMet condition to the Job to trigger Pod termination after a Job meets
         either the success or failure criteria."
         https://kubernetes.io/docs/concepts/workloads/controllers/job/#termination-of-job-pods
         Tying it to `successPolicy` is rejected: `SuccessPolicy` is one REASON it carries and not
         its only trigger, and reaching `.spec.completions` is a success criterion of its own. It
         stays undrawn because all three workers are already terminal on the beat the fifth
         completion lands, so both conditions would fall on that one beat and the card would draw
         two condition tags where the reader needs the one the Job ends on.
```
