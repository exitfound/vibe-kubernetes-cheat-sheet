## cluster-taints-tolerations

### layout

```
WHAT     A taint on Node-1 and a toleration on one of its Pods: the Scheduler refusing, then only
         scoring down, a Pod that tolerates nothing, and the taint-eviction controller deleting the
         two untolerating Pods once the taint turns NoExecute.
DEVIATES L-08a: Layout C with no ladder. The right column is spent on the Taint-eviction controller
         at 304..536 by 252..332, whose top sits under the deepest panel bottom.
         C-14: Pod web-2's slot is empty, not dim, on the poster and steps 1 to 3. A dim Pod inside
         Node-1 draws it on the Node `noschedule` refuses, so the `Pod web-2` chip carries it.
CONTENT  Sources: Taints and Tolerations, the scheduler configuration reference, feature gates.
         A toleration matches on key and effect, then the operator (Equal by default). db-1's empty
         effect matches every effect, so its chip reads `dedicated · any effect`. The 300 seconds
         are added for not-ready and unreachable only to a Pod that sets none (T-20). Gt and Lt
         are alpha and not drawn. PreferNoSchedule is `scored down`, never `ranks last`. db-1 is
         never evicted, not "bound as long as the taint lasts". API paths are lowercase.
OPEN     `taint` lands its ball on the Node frame, which renders no arrival cue: the frame header
         and the two chips turning over carry it instead.
```
