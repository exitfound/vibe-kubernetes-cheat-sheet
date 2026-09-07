## workloads-pod-restart-policy

### layout

```
WHAT     restartPolicy Always, OnFailure and Never against the same exit, enforced in place by the
         Kubelet.
LAYOUT   C (bottom strip). panel bottom 355.
           ladder 660..1140
           chips  two across at 548 and 590
           actors Kubelet FIRST at 484..716 centred on CX, Api second at 908..1140, both 232
           wide and placed as in workloads-pod-startup-conditions (right edge on the ladder column)
         Kubelet comes first because it is the node-facing actor and the line down to the Node has
         to leave a box midpoint inside the corridor. With the two swapped, `bounce()` would send
         its first hop OUT of the Api while its own comment has Kubelet watching the Api and the
         spec hopping back.
         Chips four across is 258 wide, and five strings collide, including "Pod B · OnFailure"
         against "Waiting (backoff)".
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport:
         `OVERLAY_IDS=workloads-pod-restart-policy node --test report/overlay.test.mjs`. Nothing on
         the card is derived from the reading. What it binds is the `Node-1` frame label, which
         BUDGET states as a character ceiling on the one step that reaches it.
LANES    None down to the Node. restartPolicy is enforced in place and every packet is a top-row
         hop, so the vertical line is a RELATIONSHIP: it lands on the Node frame's top midpoint and
         carries NO ARROWHEAD, per the rule that a wire with no ball must not wear one.
         The return lane rides on the `policy` step only (the spec coming back off the watch). The
         three exit steps send ONE ball, Kubelet to Api, the status PATCH: the restart decision is
         taken on the Node and nothing answers a status write, so a return hop there would be
         traffic no sentence names (M-10, T-22). The `fit` step draws no flow at all.
MOTION   Exit steps run up-arrow order: all three Pods pulse at 400, the stopping ones fade from 700
         (the blink lands at full weight before the fade), and the status ball leaves at 1200 (400 +
         BEAT.afterPulse). Span 2460 live on every exit step, and the durations are sized so the
         still time after the ball lands tracks the reading load rather than being equal:
         `policy` 3800 for 567 characters (6.70 ms per character, 1740 still), `exit-zero` 3200 for
         297 (740 still), `exit-nonzero` 3000 for 245 (540 still), `backoff` 3600 for 419 (1140
         still). `policy` at 2200 reads 3.88 ms per character, which is not a readable pace, and
         above 4200 its still time is felt as a pause between step 1 and step 2.
         The `fit` step leaves all three Pods at 1 and pulses nothing: nothing happens to a Pod on
         it, and a `notready` shade there read as Always being the healthier policy.
CONTENT  Rung 1 reads `Pod-level default Always, container may override`, not `all containers`. The
         policy step cancels the absolute twice in its own narration: it covers every main container
         "that does not set its own", and since 1.35 ContainerRestartRules lets an individual
         container carry a restartPolicy that overrides the Pod one.
         The `desc` says the same thing in the same breath as the field: "the Pod-level default a
         container can override". "the Pod-level answer Kubernetes follows" is rejected, because at
         the declared 1.35 ContainerRestartRules is beta and on by default (`stage: beta,
         defaultValue: true, fromVersion: "1.35"`) and the doc has "you can specify restartPolicy
         and restartPolicyRules on individual containers to override the Pod restart policy", so the
         Pod field is a default a container overrides and not the answer. The desc is the one string
         a grid reader sees without opening the card, so leaving the override to the `policy` step
         alone left the grid contradicting the card. The clause costs 7 characters and "That choice
         separates" gives them back as "It separates", taking the desc to 465 of the hard 400..470
         band. Naming the release in the desc as well, "the Pod-level default, which since 1.35 a
         container may override", measures 468 only after "The Job controller relies on" is cut to
         "Job relies on", which hands the reliance to the API kind instead of the controller, so the
         release stays on the `policy` step that already dates it.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-restart-rules
         The first restart is IMMEDIATE and only the ones after it back off. Two sites must NOT say
         otherwise: the `desc` must not end "every restart still waits out the same backoff", and
         the `backoff` step must not open "Every restart, whether driven by Always or by OnFailure,
         goes through the same exponential backoff". Both are false for restart one. The doc:
         "Initial crash: Kubernetes attempts an immediate restart based on the Pod restartPolicy.
         Repeated crashes: After the initial crash Kubernetes applies an exponential backoff delay
         for subsequent restarts." The `desc` ends "the shared backoff only starts after the first
         restart" and the step opens "The first restart is immediate, and every restart after it ...
         waits out the same exponential backoff". Rung 4 and the sibling workloads-crashloopbackoff
         `aria-label` carry the same reading, so either wrong sentence contradicts both.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/ An init container does
         not override the Pod value BY BEING an init container. The `policy` step must NOT gloss the
         override as "the native sidecar pattern, on by default since 1.29 and GA in 1.33", which
         hangs the SidecarContainers version history on a capability wider than it. The doc: "The
         restartPolicy for a Pod applies to app containers in the Pod and to regular init
         containers." and "Sidecar containers ignore the Pod-level restartPolicy field: in
         Kubernetes, a sidecar is defined as an entry inside initContainers that has its
         container-level restartPolicy set to Always." Under ContainerRestartRules, 1.35 beta and on
         by default, a REGULAR init container may carry Never or OnFailure, and the doc's own worked
         example is a Pod with restartPolicy Always whose init container carries Never. The regular
         init container rides the sentence that already says what the Pod value covers ("every main
         and regular init container that does not set its own"), and the sidecar keeps a sentence of
         its own with its own dates. The exit-step wire labels name the one thing that rides the
         lane, the status PATCH, and the phase it carries: `B and C Succeeded` on exit 0 (Succeeded
         is every container terminated in success and none to be restarted) and `C Failed` on exit
         != 0 (Failed is at least one container terminated in failure and not set for automatic
         restarting). The `policy` wire names two things for two hops, the watch and the spec
         delivered, and nothing for a third.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-phase A Never Pod is
         never described as one that "never restarts at all". The `backoff` step reads "A Never Pod
         whose containers set no policy of their own never restarts", and the `fit` step reads "so
         their containers restart unless one carries its own policy" rather than "so their Pods
         always restart", because under ContainerRestartRules (beta, on by default at 1.35) a
         container overrides the Pod value in either direction and the doc says "The container
         restarts will follow the same exponential backoff as pod restart policy". The controller
         validation constrains the TEMPLATE's Pod-level field only. The bare absolute contradicts
         the card's own `policy` step, which already names the override.
         Rung 5 and the `fit` chip say `long-running apps`, not `services`: Service is an API kind
         and the doc says "keep applications running continuously".
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-restart-rules
         Claims read against 1.35 and holding: spec.restartPolicy is immutable on a live Pod
         (`updatablePodSpecFields` in pkg/apis/core/validation lists image, activeDeadlineSeconds,
         tolerations and terminationGracePeriodSeconds and nothing else), SidecarContainers Beta
         1.29 and Stable 1.33, KubeletCrashLoopBackOffMax Beta 1.35, the backoff resets after 10
         minutes of a container running, and Deployment, ReplicaSet, DaemonSet and StatefulSet admit
         only Always (the StatefulSet rule is apps validation, the other three are on their doc
         pages). The exit-step wire word `status PATCH` is the Kubelet status manager calling
         `statusutil.PatchPodStatus`, an upstream reading rather than a doc sentence. Rungs 2 and 3
         are the doc's own "Restart behavior comparison" table read across: exit 0 restarts under
         Always alone, non-zero restarts under Always and OnFailure, and Never restarts under
         neither. The sidecar clause on `policy` matches "Sidecar containers ignore the Pod-level
         restartPolicy field: in Kubernetes, a sidecar is defined as an entry inside initContainers
         that has its container-level restartPolicy set to Always", and the SidecarContainers gate
         file carries `beta, defaultValue: true, fromVersion: "1.29"` then `stable, fromVersion:
         "1.33"`, which is the pair the clause states. `backoff` keeps `by default` and lost only
         the RUNGS: it reads "a 10s base to a 5 minute ceiling by default", and the rung by rung
         walk is workloads-crashloopbackoff's (CANON.md:411). The qualifier stays because
         KubeletCrashLoopBackOffMax is beta and on by default at the declared 1.35: the 300s maximum
         is "set per node using kubelet configuration", not a constant.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
BUDGET   574 characters is the ceiling for this step, and it is measured by OPENING THE FRAME at
         1100x800 rather than derived from a rule. At 597 characters the `Node-1` frame label comes
         back 32% covered, struck through by the panel bottom, and nothing reports it: `OCCLUDED`
         scores occluded AREA and a 4 unit strip off a 140 unit frame is under its bar, and `npm run
         report` prints only the card extent, which stays inside the 90..504 band throughout. The
         shipped form is 567 characters and the frame label is clear. Re-open the frame after any
         prose edit, because one line here is about a quarter of the gap to the Node frame. The two
         probes disagree on the absolute number by roughly 20 units at the same nominal viewport,
         and they agree on the SIGN and on the one line of difference, which is what a verdict turns
         on. Prefer `npm run report` for a recorded number and the opened frame for a verdict.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
SCOPE    workloads-crashloopbackoff owns the ladder itself. The `backoff` step names the shape and
         its two ends, an immediate first restart and a doubling from a 10s base to a 5 minute
         ceiling by default, and leaves the rung by rung walk to that card: a pointer is not
         duplication, a paragraph is (CANON.md:411). The rungs written out, 10s, 20s, 40s, 80s, 160s
         and the 300s cap, run this step to 478 characters and a panel bottom of 329.2 at 1100x800,
         where the 419 it carries reads 279.5, two lines higher. Neither is this card's deepest
         panel, which is the `policy` step the BUDGET block above measures.
```
