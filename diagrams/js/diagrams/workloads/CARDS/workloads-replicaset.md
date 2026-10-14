## workloads-replicaset

### layout

```
WHAT     A ReplicaSet holds its Pods against a mark at spec.replicas: it fills a gap, deletes
         past the mark, adopts a matching unowned Pod and releases one whose labels stop matching.
DEVIATES WL.L-06: no LAYOUT preset. Ownership is the vertical axis (two bands) and the count the
         horizontal one (the mark), and the card carries no ladder or chain.
         WL.A-03: no node() frame. Where these Pods run is not the story, so a frame is a block no
         step narrates.
         M-12: the `own` fan flies all three lanes for one fanTiming duration, the longest lane's
         routeDur, with one trunk corner, so the balls ride the trunk as one and land on one beat.
         M-08: pod3 leaves the owned band with NO pulse: it loses an owner and keeps running.
         M-08: pod2 leaves on `self-heal` with NO pulse: nothing drawn deletes it. Its replacement
         is its own Pod, web-8bjfs, which pulses as it lands, because a replacement gets a new name.
         C-04: the unowned band is drawn at 0.3, outside OPACITY, and is often empty: it says
         nothing is unowned (C-14).
CONTENT  Sources: ReplicaSet, Deployment, Owners and Dependents (v1.36), controller_utils.go 1.36.
         Scale-down follows the code: not ready ranks before deletion cost, which the page omits.
         Deletion cost stays `best effort`. Adoption needs `no controller ownerReference`, not
         `no owner`. The selector chip reads `matchLabels app=web` on every step. `standalone`: a
         Deployment-made one also selects on pod-template-hash. A lost Pod counts until evicted
         after its default 300 second toleration. ownerReferences point from Pod to ReplicaSet.
OPEN     CENTRE on the chip column (660..1140 against 600): the left column is under the panel, the
         bands own the floor, and the trunk crosses any strip on 600. Carried (L-16, L-17).
```
