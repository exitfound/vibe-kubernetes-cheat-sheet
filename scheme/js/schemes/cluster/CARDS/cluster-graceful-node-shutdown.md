## cluster-graceful-node-shutdown

### layout

```
WHAT     systemd telling the Kubelet a shutdown is coming, and the Kubelet spending the grace budget
         in two buckets, regular Pods then critical ones.
LAYOUT   Three tiers on the L. The top row is the systemd/Kubelet exchange at y 40..120, right of
         the panel and spined on CX so the lane below it is a straight drop. Kubelet is 484..716 on
         that spine, systemd is 908..1140 with its right edge derived from CONTENT_R rather than
         from a gap, so the top row and the band under it close on ONE right wall at 1140.
         The ladder is 60..540 over 250..450 and the chip column is 620..1140 over 290..450: the
         two columns end on one line and the shorter one takes its slack at the TOP, where an empty
         250..290 band under the panel reads as air and not as a missing row. The Node frame is
         472..624 on the CLU.L-01 family 152/106/34, read out of CLU.NODE rather than typed.
         The lane corridor is 540..620, between the ladder edge and the chip column, so the drop
         from the Kubelet to the Node crosses nothing. That corridor is what pins CHIP_X to this
         card's own 620 instead of LAYOUT.A.chips at 660.
PANEL    Measured over the standard set: 290.8 wide and 142.6..177.4 deep at 1600x1000, 377.8 and
         171.4..213.9 at 1280x860, 396.5 and 205.0..229.8 at 1100x800. The deepest reading belongs
         to the condition and terminate-critical steps, whose narrations are the longest, and it
         leaves 20.2 units over LADDER_Y.
SIZES    Four chips of CLU.CHIP_H 34 on the cluster house vertical gap of 8, so the column measures
         160 and is hung off LADDER_BOTTOM 450 instead of off LADDER_Y 250. The ladder runs 32 on
         10 over five rows, so the two columns cannot both start at 250 and end at 450: one edge
         has to give, and the shared one is the BOTTOM, where the eye reads the two as a pair.
         CHIP_GAP was 21, a number picked only to make four chips fill 250..450, and at that
         spacing the chips read as four separate strips rather than as one column.
LANES    Two top-row lanes of 192, one per direction, straddling the row centre by LANE_DY: SIG_Y
         68 for the signal in, REL_Y 92 for the release out. SIG_LANE is ONE 352 unit drop
         addressed to the Node frame, and both SIGTERM phases ride it.
MOTION   Both terminate steps are down-arrow, so ball first and pulse on arrival: ball 0..782,
         pulses 782..1682, fade 782..1982. Nothing fires simultaneously.
         Ball speed: the 352 unit drop runs 0.450 u/ms, the canon PKT_SPEED. The two top-row hops
         are 192 and still floor-bound on the 700ms PKT_DUR_MIN, at 0.274 u/ms, mid-table among the
         balls `pace.mjs` ranks. 192 is a house length six cards run, cluster-node-drain,
         cluster-oom-kill and cluster-cpu-throttling among them, so the floor here is M-13 catalog
         wide rather than this card's own.
         Reading load sets the durations, not the motion: 8.81, 8.85, 10.11, 10.13 and 10.03 ms per
         character over the five narrated steps. The yardstick here is NOT the catalog median but
         the cohort of narrations 290 characters or more, whose own median is lower because a long
         narration is read faster per character. `report/baselines.test.mjs` section 2 prints that
         cohort's size, median and p75, and the two lowest steps here sit on its median rather than
         above it: the first goes still for 1540ms once the ball lands and the second animates
         nothing at all, so a hold at the catalog median buys neither of them anything. Every step
         still outlasts its own span.
         A prose edit therefore moves a duration: growing the two terminate steps to 262 and 316
         characters drops them to 9.16 and 7.59, well under that cohort, until the durations
         follow.
WIRE LABELS
         ONE P.wire at 812, centred in the 192 unit gap and 26 under the top row, serves both
         top-row lanes: only one of them carries traffic on any given step, and the narration names
         which. At 1600x1000 the longer of the two strings measures 179.2 and sits 722.4..901.6, so
         it clears BOTH box walls by 6.4 rather than running under them, which is what the wider
         gap bought beyond the ball speed.
CONTENT  Claims read against the release in `k8sVersion`.
         The inhibitor lock is HELD BEFORE the signal, which is why the chip reads `held by
         Kubelet` from the poster on. `managerImpl.start` calls `acquireInhibitLock` and only then
         `MonitorShutdown`, and a delay lock taken after `PrepareForShutdown` would have nothing
         left to delay. So the `aria-label` states the lock first and the signal second, and the
         `desc` says `while already holding`: an `and` between the two reads as a sequence and
         contradicts the card's own step 0.
         The shutdown lock is `what = "shutdown"` and the watched signal is `PrepareForShutdown`
         alone, so the trigger list is poweroff, reboot and halt. `hibernate` is REJECTED: systemd
         splits the two, "sleep inhibits system suspend and hibernation" against "shutdown inhibits
         high-level system power-off and reboot", and suspend and hibernate raise `PrepareForSleep`,
         which the Kubelet does not subscribe to. Naming hibernate promises a run that never happens.
         Both grace windows are CEILINGS, not allowances, which is why both narrations say `the
         window is` and both ladder rows say `await up to`. The Kubelet takes the group period and
         then lowers it to `pod.Spec.TerminationGracePeriodSeconds` when that is smaller. At the
         default 30, an ordinary Pod on this card gets 30s against a 40s window, so stating 40s as
         what a Pod GETS is rejected.
         Termination inside a bucket is concurrent: one goroutine per Pod under one `sync.WaitGroup`.
         That is what `in parallel` means on both terminate steps.
         Step 2 is `condition`, not `cordon`. The doc's first fact after the intro is that the
         Kubelet sets a NotReady condition with reason `node is shutting down`, and the scheduler
         honours it. There is no spec.unschedulable anywhere in this feature, so cordon is the wrong
         word, and "flips its admission state" is the SECOND half of the mechanism, not the one that
         stops the Scheduler.
         The second half is `rejects even Pods tolerating the not-ready taint`, which is the reason
         the doc gives it: "The kubelet also rejects Pods during the PodAdmission phase if an
         ongoing node shutdown has been detected, so that even Pods with a toleration for
         node.kubernetes.io/not-ready:NoSchedule do not start there." `rejects Pods that were
         already bound` is REJECTED: `Admit` rejects every Pod put to it once the node is shutting
         down, so binding is not the condition it tests, and naming binding hides the one case the
         NotReady condition alone does not cover. The taint is named and not drawn, the same licence
         the Scheduler already takes on this step.
         The release step says the Node has carried NotReady since the Kubelet set it and the stale
         Lease additionally makes it unreachable. Saying the cluster marks it NotReady at the END
         contradicts the card's own first step. The Lease wording matches `cluster-node-failure`,
         which owns that mechanism.
         `node is shutting down` is an API reason string in lower case and lives in terms.json under
         exceptions.Node. It is the only occurrence in the catalog. KEP 2000 writes it capitalised
         and the doc is the current source, so the lower case stands.
         The non-critical window is shutdownGracePeriod minus shutdownGracePeriodCriticalPods, so
         60 and 20 give the 40 the chain row and the narration both state, and `periodRequested`
         sums the two groups back to shutdownGracePeriod, which is the one budget the desc claims.
         The 2e9 sublabel is scheduling.SystemCriticalPriority, defined as twice
         HighestUserDefinablePriority, and the cutoff `migrateConfig` buckets on when
         shutdownGracePeriodByPodPriority is not configured: it returns exactly two ranges, priority
         0 carrying the ordinary window and SystemCriticalPriority carrying the critical one.
         `at or above` is the exact boundary and not a rounding: `groupByPriority` sends a Pod to
         the lower group whenever `groups[index].Priority > priority`, so 2e9 itself lands critical
         and 1e9, the highest user-definable priority, lands ordinary. The two named classes agree
         with the number: `system-cluster-critical` IS 2e9 and `system-node-critical` is above it.
         Termination is ordered by that sort, low priority group first, which is what puts the
         non-critical step before the critical one.
         `Reason: Terminated` is `nodeShutdownReason` and the status the doc quotes.
         The desc says the two windows come out of ONE budget. `a second window of their own` is
         REJECTED: `migrateConfig` computes the ordinary window as requested minus critical, so an
         additive reading contradicts the card's own third step.
BUDGET   The ceiling is the panel against LADDER_Y = 250, and it is a LINE COUNT rather than a
         character count: at 1100x800 the panel bottom is 229.8, leaving 20.2 units, and a line
         costs about 25 there, so one more line puts the panel on the first ladder row. Measured at
         that viewport, 262 characters read 205.0 and 316, 322 and 326 all read 229.8, so the eight
         line band runs at least to 326, which the condition step spends. 323 is NOT the ceiling: it
         was the highest measured reading plus one, and the ninth line has not been found yet.
         Re-measure with `OVERLAY_IDS` before spending characters past 326, never extrapolate.
NAMING   The systemd box sublabel is `logind`, which is the subsystem step 1 names and the thing
         KEP 2000 credits with both the PrepareForShutdown signal and the inhibitor locks. It also
         leaves `inhibitor lock` naming exactly one thing on the canvas, the chip whose value says
         who holds it.
         The fourth chip is `shutdown phase`, not `phase`. Bare `phase` is REJECTED: it is an API
         field on `storage-pv-lifecycle-phases`, where the values really are PersistentVolume
         phases, and none of the six values here is a phase from any API. Its three neighbours are
         literal KubeletConfiguration field names, so a bare `phase` reads as a fourth one.
SCOPE    Only the two-field configuration is drawn. `shutdownGracePeriodByPodPriority` replaces the
         whole split with an arbitrary priority table, and this card leaves it to the doc.
NOTE     systemd right-aligns on CONTENT_R, the same construction and the same argument
         `cluster-oom-kill` writes for its kernel block: a fixed 56 from the Kubelet puts it at
         772..1004, 136 short of the content edge and flush with nothing, while 908..1140 lands it
         on the chip column, the ladder and the Node frame at once. `cluster-node-drain` made the
         identical move for the identical reason and its record calls it a pacing GAIN, which it is
         here too: the hop went 0.080 to 0.274 u/ms with no `dur` written anywhere, because `F.top`
         runs at the fixed HOP_MS 700 whatever the distance.
NOTE     terminate-normal sends ONE ball and both non-critical Pods react to it, which is a better
         reading of `in parallel` than two balls whose arrivals differed anyway, because the two taps
         were different lengths.
NOTE     All four chips wait for the packet that earns them. systemd is not free to proceed until the
         release actually arrives, so showing `released` at step entry is the lock being dropped a
         second before the ball that drops it.
NOTE     Every value that hands over on a beat is a constant, so the static END of the step and the
         `rewind` of that same step cannot drift apart: the six phase strings plus LOCK_HELD and
         LOCK_FREE, the two readings of the lock chip.
NOTE     No stand-in highlight to take back here: neither terminate step has ever set one. If a
         stand-in is ever added, it has to be dropped on BOTH paths, because the Pod now ends dim
         rather than absent.
WHY NOT  A chip column top-aligned on LADDER_Y at 250, which is what CHIP_GAP 21 bought. Four chips
         of 34 cannot fill 250..450 on the house gap of 8, so holding both edges means inventing a
         spacing, and 21 is what that invention looked like: two columns that start together, end
         together, and read as two different rhythms in between. The bottom is the edge worth
         sharing because it is the one the Node frame below answers to.
WHY NOT  A Pod row at NODE_Y + 22. node() draws its label at NODE_Y + 18, so the row prints NODE-1
         four units above the first Pod and overlapping it. 34 + 106 + 12 is the family 152.
WHY NOT  A bus at NODE_Y - 14 with one tap per Pod. Two lanes crossing the frame and splitting over
         the Pod row read as plumbing rather than as a shutdown. WHICH Pod reacts is carried by the
         pulse.
DO NOT   Fade a shut-down Pod to 0. An absent block reads as a rendering fault rather than as an
         absence. Both the pins and the fade land on OPACITY.terminated, the shade for gone. Same
         conversion cluster-node-drain and cluster-node-pressure-eviction took.
NOT A DEFECT
         `priority: 2e9` is the catalog spelling for this cutoff, shared with
         `cluster-pod-priority-preemption`. Do not expand it to 2000000000 on one card alone.
OPEN     Step 1 states that the delay inhibitor lock makes systemd pause the shutdown, and does not
         say what sets the length of that pause. logind caps a delay lock at InhibitDelayMaxSec,
         5s by default against the 60s this card draws, and `managerImpl.start` reads
         `CurrentInhibitDelay`, then writes /etc/systemd/logind.conf.d/kubelet.conf through
         `OverrideInhibitDelay`, SIGHUPs logind and polls on an exponential backoff until the new
         value takes. `min(InhibitDelayMaxSec, shutdownGracePeriod)` is REJECTED as the description:
         the manager does not degrade to the smaller number, it FAILS TO START and returns
         "node shutdown manager was timed out ... waiting for logind InhibitDelayMaxSec to update".
         There is no room for the clause. It runs about 140 characters, four more lines at 1100x800
         against 20.2 units of headroom, which is not even one line (BUDGET). Moving LADDER_Y to 280
         runs the rows to 480 against a Node frame at 472, and trimming a qualifier to fit the band
         is what T-20 forbids.
OPEN     A node() frame cannot take a cue. Step 2 narrates the Kubelet setting NotReady ON THE NODE
         and is the one step here that registers no animation at all, so the actor whose state
         changes is the only thing on screen that does not react. `lit: [nodeEl]` does not close it:
         diagrams.css carries no `.scheme-node.highlight` rule, and a frame rendered with the key
         added differs from one without it only by glyph antialiasing. Closing it means a new
         catalog-wide CSS rule reaching all 69 node frames on 53 cards, which is outside one card's
         scope. cluster-taints-tolerations lights nodeEl on the same belief.
```

### poster

```
Sentence: shutdown is a COUNTDOWN spending an ordered sequence, not an event.

A clock with four tick dots on the left, a dashed leg into a dashed Node frame holding three Pods
at 0.08, 0.04 and 0.03. The three fills are the order, not three different kinds of Pod.
The frame is dashed because the Node is on its way out. The clock is the only closed shape, so it
reads as the actor even though nothing points at it.
```
