## workloads-pod-garbage-collection

### layout

```
WHAT     A finished Pod is still an object, and PodGC decides when it stops being one: one rule
         counts terminated Pods against a threshold, three take a Pod nobody is left to acknowledge.
DEVIATES WL.L-07: the API is the centred box and PodGC the flanking one. The objects live in the
         API, so the write leaves the API (A-09) and the trunk leaves the centred box.
         WL.A-03: no node() frame. These are records in the API, and a Node frame would draw the
         half of the page cluster-image-container-gc owns.
         T-21: three narrations name a Node that is not drawn. Each is a condition on the Pod, and
         two of them are its absence, so drawing a Node would say the opposite.
         A-13: a bus segment is a channel, open while any Pod downstream of it stands. Shading it
         by its nearest Pod is green under every check and fades a run still carrying a ball.
         The four Pods carry no count: web-1 reads `Succeeded, one of many` so the row is never
         read as the 12501 the chip states.
CONTENT  Sources: Garbage Collection of Pods, kube-controller-manager, Pod Disruption Conditions
         (v1.35), upstream pkg/controller/podgc. The sweep lands ON the threshold, not under it.
         Order is `evicted first, then oldest`. `the object stays` holds for both phases. Only the
         orphan RULE adds DeletionByPodGC, a claim about rules, not Pods. An unscheduled Pod that
         stays is held by a finalizer, so force delete is not offered. `out-of-service` waits for
         an operator. `terminating` stays lowercase: it is a deletionTimestamp, not a phase.
```
