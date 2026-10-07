## workloads-finished-job-cleanup

### layout

```
WHAT     A Job that succeeded is still an object, and a TTL clock started at its completion is what
         finally takes it and its Pods away.
DEVIATES WL.L-06: no LAYOUT preset. An object stack read top to bottom, with no ladder and no
         flanking column. It reads LAYOUT.C.strip.two only for the six chips, two per row.
         WL.L-07: the API sits centred and the controller right, the reverse of the replicaset
         pair. Both corridors leave the API, so the centre slot is the API's.
         L-23: the Node frame keeps a top pinned by the panel clearance and the Pods take the
         padding. A frame lifted 10 shortens the 56 unit pair corridor and spends that clearance.
         C-09: the finished Pods stay at full strength, never terminated. A finished Pod that is
         still a full object is the sentence of the card.
         M-18a: the Job sends its cascade ball while dark. The sender dies in the step it sends
         from, and lit plus an unlight (S-18) reddens the reduced HIGHLIGHT axis.
         P-03: `controller clock` never waits for an arrival. It is the premise a step acts on, and
         binding it to a ball draws a wall clock that advances because a packet landed.
CONTENT  Sources: Automatic Cleanup for Finished Jobs, TTL mechanism, kube-controller-manager.
         The timer starts at the finished condition, never at creation. The controller reads the
         condition, so no sentence says it reads status.completionTime.
         `eligible`, never `deleted at` or `0 removes it`. Unset means this controller never touches
         the Job, never `keeps it forever`. `Finishing removes nothing`, because PodGC exists.
         A running Job is `passed over`, not invisible. The job controller is never named.
```
