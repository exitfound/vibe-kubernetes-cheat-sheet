## workloads-rolling-update

### layout

```
WHAT     A rolling update is a window of live Pods sliding from the old ReplicaSet to the new one,
         and it never leaves the band the two dials define.
DEVIATES WL.L-06: no LAYOUT preset. Two owner regions sit on the house columns and the dials take
         LAYOUT.C.strip.two only, for the two-across chip width.
         WL.A-03: owner regions, not Node frames. A frame would say the split is by Node and would
         stop every drop on the frame face instead of the Pod slot.
         A-13: a feed is 0 or 1, never a shade. On `drain` a full feed hangs over a terminating Pod,
         because two half-strengths on one dashed run read as a line that failed to draw.
         Six slots, never four: a Pod does not change version, so position carries the owner.
         The two later cycles are compressed into one step each, every leaving Pod still hit.
         The RS-v2 region arrives on the create it names, while its header reads from `idle` on.
         Build-time Pod sublabels are non-empty on purpose: box() drops an empty one silently.
CONTENT  Sources: Rolling Update Deployment (v1.36), the kubectl reference, deployment sync.go
         (1.36). The 3-replica defaults are maxSurge 1, maxUnavailable 0, and `maxUnavailable 1` is
         ruled out. `available` follows Ready only at minReadySeconds 0. A scale write is
         `PUT .spec.replicas`, not `PATCH .scale`. `rollout complete` is lowercase: no Complete
         condition. `live` drops terminating Pods. The `spec` wire names only the create (T-22). No
         step names the Pod picked for deletion.
         Doc vs code: the page reads create then scale to 1, the code creates RS-v2 at replicas 1 in
         one POST, so `spec` draws that create and no RS-v2 scale write exists until `repeat`.
         `surge` stays its own step, the ReplicaSet controller Pod create from the API: merged into
         `spec`, two actors and two writes would share one narration.
```
