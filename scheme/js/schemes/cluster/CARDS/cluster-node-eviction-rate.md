## cluster-node-eviction-rate

### layout

```
WHAT     The node controller throttling itself: a per zone queue of NotReady Nodes tainted one at a
         time, at the normal rate, at the reduced secondary rate, and at no rate at all.
DEVIATES CLU.L-01: the zone frames are 126/80/34. Two plain-box slots per frame, and a 106 shell
         round a label pair leaves 60 units of nothing.
         M-19a: `zone-unhealthy` animates nothing and stands still for its whole duration. The next
         taint is 100 seconds away, and a ball would draw the reduced rate as the normal one.
         Each zone draws only the head of its queue. Six Nodes per zone makes the cluster 12, under
         the threshold of 50 where the secondary rate is 0, against the chips.
CONTENT  Sources: Rate Limits on Eviction, kube-controller-manager, Taint-Based Evictions, the taint
         reference, `node_lifecycle_controller.go` at release-1.35.
         What is rate limited is the taint, never a Pod delete. `50 Nodes or fewer`, per zone, as
         the code decides against the flag's "smaller than". `at or over 0.55` with the 3 Node floor
         as a conjunct. The stop needs every zone at 60 of 60, a fully down zone runs at the normal
         rate. The key is `unreachable`: Ready is Unknown. `resumed` evicts Pods, never Nodes.
```
