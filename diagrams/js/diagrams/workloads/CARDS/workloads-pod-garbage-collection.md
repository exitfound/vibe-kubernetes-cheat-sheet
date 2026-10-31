## workloads-pod-garbage-collection

### layout

```
WHAT     A finished Pod is still an object, and PodGC decides when it stops being one: one rule
         counts terminated Pods against a threshold, three take a Pod nobody is left to acknowledge.
DEVIATES WL.A-03: no node() frame. These are records in the API, and a Node frame would draw the
         half of the page cluster-image-container-gc owns.
         T-21: three narrations name a Node that is not drawn. Each is a condition on the Pod, and
         two of them are its absence, so drawing a Node would say the opposite.
         A-13: a bus segment is a channel, open while any Pod downstream of it stands. Shading it
         by its nearest Pod is green under every check and fades a run still carrying a ball.
CONTENT  Sources: Garbage Collection of Pods, kube-controller-manager, Pod Disruption Conditions,
         node-shutdown (v1.36), podgc gc_controller.go. The sweep lands ON the threshold. Order is
         `evicted first, then oldest`. `the object stays` holds for both phases.
         Only the orphan RULE adds DeletionByPodGC, in
         the Failed status patch. An unscheduled Pod that stays is held by a finalizer. The taint
         rule needs a non-ready Node and an operator who confirmed shutdown. `terminating`
         lowercase.
```
