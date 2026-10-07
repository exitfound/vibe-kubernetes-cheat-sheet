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
CONTENT  Sources: Rolling Update Deployment (v1.35), the kubectl reference. The defaults at 3
         replicas resolve to maxSurge 1, maxUnavailable 0, and `maxUnavailable 1` is ruled out
         everywhere. `available` follows Ready only because minReadySeconds is 0. The write is
         `PUT .spec.replicas`, not `PATCH .scale`. `rollout complete` is lowercase: no Complete
         condition exists. The `spec` wire names only the create (T-22). The 0 then 1 replica split
         follows the cited page. No step names the Pod picked for deletion.
```
