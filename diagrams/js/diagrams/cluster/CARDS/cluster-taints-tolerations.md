## cluster-taints-tolerations

### layout

```
WHAT     A taint on Node-1 and a toleration on one of its Pods: the Scheduler refusing, then only
         scoring down, a Pod that tolerates nothing, and the taint-eviction controller deleting the
         two untolerating Pods once the taint turns NoExecute.
DEVIATES L-08a: Layout C with no ladder. The mid band holds the Taint-eviction controller at
         304..536 by 252..332, centred on the L-03 riser x 420, below the deepest panel bottom.
         C-14: Pod web-2's slot is empty, not dim, on the poster and steps 1 to 3. A dim Pod inside
         Node-1 draws it on the Node `noschedule` refuses, so the `Pod web-2` chip carries it.
CONTENT  Sources (v1.36): Taints and Tolerations, scheduler config, Node and Toleration API refs,
         feature gates, DefaultTolerationSeconds and TaintToleration at v1.36.0. A taint `carries`
         key, value, effect (plus timeAdded). A toleration matches key and effect, then the operator
         (Equal by default): db-1's empty effect is `any effect`. 300 goes per built-in taint a Pod
         sets no toleration for. Filter says `untolerated taint`, never `NoFit`. Gt, Lt are alpha.
         Node-1 is filtered and `scored down`, never the Pod. db-1 never evicted. Evictor per code.
OPEN     `taint` lands its ball on the Node frame, which renders no arrival cue: the frame header
         and the two chips turning over carry it instead.
```
