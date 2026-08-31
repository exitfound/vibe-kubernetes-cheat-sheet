## workloads-force-deletion

### layout

```
WHAT     A force-delete drops the Pod object without Kubelet acknowledgement, so on a partitioned
         Node the container keeps running beside its replacement.
LAYOUT   B (chips left, ladder right). PANEL_B 280.
           chips  60..540, bottom at 460
           nodes  TWO frames, 60..580 and 620..1140, NODE_H 134, Pods centred on 320 and 880
         NODE_H is 134 rather than 140 to open the 15 unit corridor between the chip column's
         bottom at 460 and the frames.
LANES    ONE trunk serving both frames, which the mirrored Pod centres are what allow: it leaves
         the API box's bottom midpoint (both node-band actions here are control-plane actions
         issued through the API), steps to WL.SPINE_X at y=140, drops to a bus at NODE_Y-15 and
         taps left and right. Both routes use NODE1_LANE / NODE2_LANE, the arrays the wires are
         built from.
         No ball carries a literal points array of its own: such a pair follows no drawn wire, and
         one of them left the content band entirely at x=1198. A lane down x=810 goes through the
         pipeline ladder rows.
CONTENT  Read against the `k8sVersion` the entry carries.
         `status.phase stays Running` on the `stuck` step, against the Pod lifecycle page saying
         `If a node dies or is disconnected from the rest of the cluster, Kubernetes applies a
         policy for setting the phase of all Pods on the lost node to Failed`. The two do not meet,
         because that policy is `podgc` and BOTH of its paths are shut on the state this card draws.
         `gcOrphaned` reaches only Pods bound to a Node that no longer exists, and this Node object
         is still there, unreachable rather than deleted. `gcTerminating` needs two conditions and
         has only one: `!nodeutil.IsNodeReady(node)` holds, and
         `taints.TaintKeyExists(node.Spec.Taints, v1.TaintNodeOutOfService)` does not, because
         nothing has applied `node.kubernetes.io/out-of-service`. `gcUnscheduledTerminating` takes
         only an empty `NodeName`. So `markFailedAndDeletePodWithCondition`, the one writer of
         `newStatus.Phase = v1.PodFailed`, is never reached and the Pod keeps the last phase its
         Kubelet reported.
         The card already names the escape rather than hiding it: `delete the Node object so its
         Pods are garbage-collected cleanly` on the `risk` step IS `gcOrphaned`, stated as the safe
         route. The doc sentence describes what happens once an operator takes that route or taints
         the Node out of service, and this card is the interval BEFORE either.
         The card's own cited task page is the loose one and must not be copied from: it says the
         Pods `enter the Terminating or Unknown state`, which mixes the kubectl display with the
         phase. `Unknown` is rejected as the chip value for the same reason.
```

---

### before `rewind: { opacity: { podOld: OPACITY.terminated, connector: OPACITY.terminated } },`

```
The RISE is the step, so it has to be MOTION: Pod A must not reach OPACITY.notready in the static
block at t=0 while Pod B fades in at 1942, which puts the picture two sentences ahead of the words:
the narration recreates Pod B first and only then says Pod A may still be running. Pod A and its
lane wind back to the shade `force` left and rise at `recreate` + FADE.in, the end of Pod B's own
fade-in, so Pod B is fully on screen before Pod A comes back.

The delay is `plus: FADE.in` rather than a literal: the beat is the end of the fade above it, not a
number. The step closes at 3142 against a duration of 3500.
```

### poster

```
Two Node frames, the left dashed and dimmed to 0.6 with its Pod at 0.5, the right solid, and a
lightning bolt struck between them. The bolt is the force, and it sits BETWEEN the two rather than
on either: the API is what gives up, not the Node and not the Pod.
The left Pod is still drawn, at half strength, because it is exactly the thing that has not gone
away. Deleting it would draw the outcome the card says does NOT happen on its own.
```
