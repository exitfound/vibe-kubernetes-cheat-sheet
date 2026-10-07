## network-dns-egress-policy

### layout

```
WHAT     What an egress NetworkPolicy does to name resolution: the lookup to the cluster DNS Service
         is refused until a rule allows it, and that rule has to state port 53 for UDP and TCP,
         drawn as an egress wall around the Pod with one door per rule.
DEVIATES L-10: each lane carries a collinear waypoint at the door centre, so it ends on the door
         instead of crossing it. Removing one reddens the geometry check.
         C-14: the wall is absent on `open`, not dim: a Pod no policy selects has no boundary.
CONTENT  Sources: Network Policies, NetworkPolicy API, DNS for Services and Pods, Debugging DNS.
         Egress isolation follows from selection, and only the egress lists then allow anything.
         Protocol defaults to TCP where a port omits it, so `tcp-default` refuses the UDP query.
         The rule selects the kube-dns Pods by namespace and label: a policy cannot name a Service.
         `non-isolated for egress`, and `The address still works and the name does not`.
         A truncated answer sets TC and `a resolver that retries over TCP` asks again (RFC 7766).
OPEN     R3 fires on `isolate`, `by-ip` and `tcp-default`: the shut door is lit from entry, and
         lighting it on arrival credits the query with raising the wall.
```
