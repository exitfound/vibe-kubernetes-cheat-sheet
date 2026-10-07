## workloads-pod-replacement-guarantees

### layout

```
WHAT     The same Pod is lost under five different controllers, and the five answers to what comes
         back are three: a replacement that owes the lost Pod nothing, one bound to something the
         lost Pod had, or nothing at all.
DEVIATES WL.L-06: no LAYOUT preset and no value chip. A verdict board of five columns at 204 on a
         219 pitch spans L..R and puts the third column on CX under the trunk.
         WL.A-03: no Node frame. The five columns are five unrelated owners, and a frame would say
         two of their Pods share a Node. The one Node the card names is named in words.
         A-05: the CronJob spine is a relation, the other four are lanes. A CronJob owns Jobs and
         never creates a Pod, so nothing rides it.
         A-13: no line is pinned to a slot, every slot is empty on some step. Only spine2 goes to 0,
         on none-at-all, with the DaemonSet Pod (A-14).
         M-12: the-blow lands five watch hops on one beat at WATCH_DUR, the longest path's routeDur.
         Own speeds spread them 673ms. Registered in render/motion.test.mjs PACING.
         C-09: an emptied slot sits at OPACITY.terminated, never pending. The object left the API.
CONTENT  Sources: PVC Retention Policy, Handling Pod and Container Failures, DaemonSet, CronJob.
         The fan says the deletion is true of every column, never that every owner watched it: the
         CronJob controller holds no Pod informer. `the CronJob itself starts nothing` keeps itself.
         `and every ordinal behind it waits` is ruled out: replacing a Pod is not a scaling step.
         A claim is BOUND and a volume ATTACHED. Suffixes are five characters, the hash kept on the
         ReplicaSet replacement. Only the StatefulSet keeps the name, the DaemonSet keeps the place.
```
