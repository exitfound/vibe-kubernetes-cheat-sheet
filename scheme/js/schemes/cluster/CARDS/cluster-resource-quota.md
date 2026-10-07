## cluster-resource-quota

### layout

```
WHAT     A namespace budget that accumulates: the bar is spec.hard, admitted Pods fill it left to
         right, and the refused request is drawn past the bar edge.
DEVIATES L-03: the ReplicaSet starts at 340, behind the panel corner. The actor pair centres its gap
         on 600, and pushing it clear of 420 leans the card 80 to the right.
         L-08a: the ladder is column 2, 780..1140, not the 400 or 480 family. Its longest row fills
         it, and every element under it centres on one of three 360 columns.
         P-02: the `ReplicaSet web` chip reports a count, then a condition on persist. It is named
         for the object, and a fifth chip breaks the 2 x 2 grid that ends on the 624 rail.
CONTENT  Sources: Resource Quotas, Limit Ranges, Admission Controllers, Pod Lifecycle, the
         ReplicaSet API reference, `AllOrderedPlugins` in the apiserver source.
         The ReplicaSet chip reads `N created`, never `N ready`, and the cells read `Pending`, never
         `Running`: no Node is drawn. The admission increment claims no exclusivity, the quota
         controller also recalculates. `exceeded quota` and 403 quote the API. Equality passes, so
         web-2 lands on the ceiling. Step 1 says `cannot count`, not `is rejected`.
OPEN     On the quota step both chips light at entry while `rewind` still shows the old values: a
         deferred cue would light nothing on the reduced, prev and reset paths.
```
