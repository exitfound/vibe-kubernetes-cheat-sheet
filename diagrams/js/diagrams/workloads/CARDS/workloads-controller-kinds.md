## workloads-controller-kinds

### layout

```
WHAT     Six controller kinds over one row of Pods, in two owner tiers, with three questions reading
         out whichever kind is in focus.
DEVIATES WL.L-06: no LAYOUT preset and no WL.L-05 strip. The chips stay a column, narrowed to 360
         so it centres on WL.CX with its left wall on the 420 L-03 allows.
         WL.A-03: no node() frame. One frame claims a DaemonSet has one Node, and the subject is
         which kind to write, which no Node acts in. No P.chain: the kinds are alternatives.
         T-21: ReplicationController is not drawn, so the desc and step 1 say `six main`. The Node
         is named only as the DaemonSet Pod block `One per matching Node`.
CONTENT  Sources: Workload Management, ReplicationController, Jobs, Deployments (v1.36), the apps/v1
         and batch/v1 API reference. `what sets the count` on `ends` reads spec.parallelism.
         `yes, at completions` is ruled out: a Job also succeeds on its successPolicy or ends
         Failed. The Job box keeps `runs to completion`, the docs' own name for the kind. Its Pod
         keeps `Exits when done`: the line is about one Pod, and the Failed ending is the endChip's.
         The CronJob step keeps `about one per tick`: creation is approximate. Its endChip reads
         `no, only each Job ends`. `owns a ReplicaSet` is ruled out: each rollout adds a ReplicaSet.
         ReplicationController is the legacy API a Deployment replaces, not a seventh kind. The Job
         and CronJob steps read `none, unless Indexed`: an Indexed Job numbers its Pods. On `nodes`
         `none, interchangeable` is ruled out: the DaemonSet controller pins each Pod to its Node.
OPEN     The band right of the chip column and the band under it carry nothing. The board cannot
         rise past the panel (L-03), and widening the column costs the centring (L-16).
```
