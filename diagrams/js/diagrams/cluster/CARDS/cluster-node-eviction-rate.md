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
         Opacity: a lit slot is never left at the NotReady shade. It rises to full as it lights,
         and its sublabel keeps the NotReady or tainted state. Unlit, it drops back next step.
CONTENT  Sources (v1.36): Rate Limits on Eviction, kube-controller-manager, Taint-Based Evictions,
         the taint reference, `node_lifecycle_controller.go` at v1.36.0. The rate limits the taint,
         never a Pod delete, and "stops evicting" is ruled out: the node-lifecycle-controller only
         taints. `50 Nodes or fewer` per zone, as the code decides against the flag "smaller than".
         `at or over 0.55` with the 3 Node floor. The stop needs every zone at 60 of 60, a fully
         down zone runs at the normal rate. Key `unreachable`, Ready Unknown. `resumed` evicts Pods.
         Entering the stop calls `markNodeAsReachable` on every Node, so Node-17 loses its taint
         and is queued again. On exit `SwapLimiter` drains each new limiter, so every first taint
         waits one interval: Node-42 at 10s, nothing in us-east-1a within the step. The
         taint-eviction-controller is placed `in the controller-manager` because no box draws it
         (T-21). Zones show the label value, the code keys on region plus zone.
```
