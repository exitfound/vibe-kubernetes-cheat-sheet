## workloads-rolling-update

### layout

```
WHAT     A rolling update is a window of live Pods sliding from the old ReplicaSet to the new one,
         and it never leaves the band the two dials define.
DEVIATES WL.A-03: owner regions, not Node frames. A frame would say the split is by Node and would
         stop every drop on the frame face instead of the Pod slot.
         A-13: a feed is 0 or 1, never a shade. On `drain` a full feed hangs over a terminating Pod,
         because two half-strengths on one dashed run read as a line that failed to draw.
CONTENT  Sources: Rolling Update Deployment (v1.36), the kubectl reference, deployment sync.go
         (1.36). The 3-replica defaults are maxSurge 1, maxUnavailable 0, and `maxUnavailable 1` is
         ruled out. `available` follows Ready only at minReadySeconds 0. A scale write is
         `PUT .spec.replicas`, not `PATCH .scale`. `rollout complete` is lowercase: no Complete
         condition. `live` drops terminating Pods. The `spec` wire names only the create (T-22). No
         step names the Pod picked for deletion. `set image app=v2.0` is ruled out: the reference
         takes CONTAINER=IMAGE, so the narration reads `app=web:v2.0`.
         Doc vs code: the page reads create then scale to 1, the code creates RS-v2 at replicas 1 in
         one POST, so `spec` draws that create and no RS-v2 scale write exists until `repeat`.
         `surge` stays its own step, the ReplicaSet controller Pod create from the API: merged into
         `spec`, two actors and two writes would share one narration.
```
