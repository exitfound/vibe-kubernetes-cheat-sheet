## workloads-replicaset

### layout

```
WHAT     A ReplicaSet holds its Pods against a mark at spec.replicas: it fills a gap, deletes
         past the mark, adopts a matching unowned Pod and releases one whose labels stop matching.
DEVIATES WL.L-06: no LAYOUT preset. Ownership is the vertical axis (two bands) and the count the
         horizontal one (the mark), and the card carries no ladder or chain.
         WL.A-03: no node() frame. Where these Pods run is not the story, so a frame is a block no
         step narrates.
         Slots are 216 wide and Pods 80 tall: four slots and the doubled mark gaps span the width.
         SLOT_X(3) hangs off MARK_X, so moving the mark is a layout and a timing change.
         M-21: a Pod materialising on an arrival fades over LAND_MS 260, not FADE.in 600.
         pod3 leaves the owned band with NO pulse: it loses an owner and keeps running.
         The unowned band is drawn at 0.3 and often empty: it says nothing is unowned (C-14).
         Spec.replicas and the observed count are never chips: the mark and the band carry them.
CONTENT  Sources: ReplicaSet, Owners and Dependents (v1.35), upstream controller_utils.go.
         Scale-down names the two published tiers and keeps `best-effort`, readiness is not in it.
         Adoption needs `no controller ownerReference`, not `no owner`. The selector chip reads
         `matchLabels app=web` on every step. The ReplicaSet is `standalone · no Deployment`, since
         a Deployment-made one also selects on pod-template-hash. A lost Pod counts until evicted
         after its default 300 second toleration. Ownership points from the Pod to the ReplicaSet.
OPEN     `self-heal` redraws the replacement as web-b2, but a replacement takes a new generated
         name. The narration names no Pod, so the fix is a new element in the picture.
         CENTRE on the chip column (660..1140 against 600): the left column is under the panel, the
         bands own the floor, and the trunk crosses any strip on 600. Carried (L-16, L-17).
```
