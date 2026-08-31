## workloads-restart-policy

### layout

```
WHAT     restartPolicy Always, OnFailure and Never against the same exit, enforced in place by
         the Kubelet.
LAYOUT   C (bottom strip). panel bottom 355.
           ladder 660..1140
           chips  two across at 548 and 590
           actors Kubelet FIRST at 420..780 centred on CX, Api second
         Kubelet comes first because it is the node-facing actor and the line down to the Node has
         to leave a box midpoint inside the corridor. With the two swapped, `bounce()` would send
         its first hop OUT of the Api while its own comment has Kubelet watching the Api and the
         spec hopping back.
         Chips four across is 258 wide, and five strings collide, including "Pod B · OnFailure"
         against "Waiting (backoff)".
LANES    None down to the Node. restartPolicy is enforced in place and every packet is a top-row
         hop, so the vertical line is a RELATIONSHIP: it lands on the Node frame's top midpoint
         and carries NO ARROWHEAD, per the rule that a wire with no ball must not wear one.
CONTENT  Rung 1 reads `Pod-level default Always, container may override`, not `all containers`. The
         policy step cancels the absolute twice in its own narration: it covers every main container
         "that does not set its own", and since 1.35 ContainerRestartRules lets an individual
         container carry a restartPolicy that overrides the Pod one.
CONTENT  The first restart is IMMEDIATE and only the ones after it back off. Two sites must NOT say
         otherwise: the `desc` must not end "every restart still waits out the same backoff", and the
         `backoff` step must not open "Every restart, whether driven by Always or by OnFailure, goes
         through the same exponential backoff". Both are false for restart one. The doc: "Initial
         crash: Kubernetes attempts an immediate restart based on the Pod restartPolicy. Repeated
         crashes: After the initial crash Kubernetes applies an exponential backoff delay for
         subsequent restarts." The `desc` ends "the shared backoff only starts after the first
         restart" and the step opens "The first restart is immediate, and every restart after it
         ... waits out the same exponential backoff". Rung 4 and the sibling
         workloads-crashloopbackoff `aria-label` carry the same reading, so either wrong sentence
         contradicts both.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
CONTENT  An init container does not override the Pod value BY BEING an init container. The `policy`
         step must NOT gloss the override as "the native sidecar pattern, on by default since 1.29
         and GA in 1.33", which hangs the SidecarContainers version history on a capability wider
         than it. The doc: "The restartPolicy for a Pod applies to app containers in the Pod and to
         regular init containers." and "Sidecar containers ignore the Pod-level restartPolicy
         field: in Kubernetes, a sidecar is defined as an entry inside initContainers that has its
         container-level restartPolicy set to Always." Under ContainerRestartRules, 1.35 beta and
         on by default, a REGULAR init container may carry Never or OnFailure, and the doc's own
         worked example is a Pod with restartPolicy Always whose init container carries Never. The
         regular init container rides the sentence that already says what the Pod value covers
         ("every main and regular init container that does not set its own"), and the sidecar keeps a
         sentence of its own with its own dates.
CONTENT  `capped at 300s` carries `by default`. KubeletCrashLoopBackOffMax is beta and enabled by
         default at this card's declared 1.35, which makes the ceiling a per-node default rather
         than a constant: "you can reconfigure the maximum delay between container start retries
         from the default of 300s (5 minutes). This configuration is set per node using kubelet
         configuration." Nothing there was false, so the repair is two words and no more.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
BUDGET   Folding it in rather than adding a sixth sentence is a PANEL decision, and it was measured
         by OPENING THE FRAME at 1100x800, not by a rule. A first repair ran this step to 597
         characters and the `Node-1` frame label came back 32% covered, struck through by the panel
         bottom. Nothing reports that: OCCLUDED scores occluded AREA and a 4 unit strip off a 140
         unit frame is under its bar, and `npm run report` only prints the card extent, which stayed
         inside the 90..504 band the whole time. The shipped form is 567 characters, 7 UNDER the 574
         the step carried before this repair, and the frame label is clear. Treat 574 as the ceiling
         for this step and re-open the frame after any prose edit, because one line here is about a
         quarter of the gap to the Node frame.
         Two probes disagree on the absolute number by roughly 20 units at the same nominal
         viewport: a browser driven by hand read this step at 398.1 before and 375.0 after, where
         `npm run report` puts the whole card at 378.90 before and 354.05 after. Both agree on the
         SIGN and on the one line of difference, which is what the decision turned on. Prefer
         `npm run report` for a recorded number, and the opened frame for a verdict.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
```

### poster

```
Three identical Pods, and only their exit differs: a solid loop with an arrowhead, a dashed loop
with an arrowhead, and a straight 3px terminator. Always, OnFailure, Never, said with three
different marks and no words.
The two arrowheads are earned because a loop with no head does not say which way it goes, and the
difference between the two loops is the DASH, which is the conditional.
```
