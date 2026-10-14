## network-dns-egress-policy

### layout

```
WHAT     What an egress NetworkPolicy does to name resolution: the lookup to the cluster DNS Service
         is refused until a rule allows it, and that rule has to state port 53 for UDP and TCP,
         drawn as an egress wall around the Pod with one door per rule.
DEVIATES C-14: the wall is absent on `open`, not dim: a Pod no policy selects has no boundary.
CONTENT  Sources (v1.36, policy pages unchanged since v1.35): Network Policies, NetworkPolicy API,
         DNS for Services and Pods, Debugging DNS, the kubeadm 1.36 CoreDNS v1.14.2 manifest.
         Egress isolation follows from selection: `non-isolated for egress`, then only egress lists.
         Protocol defaults to TCP where a port omits it, so `tcp-default` refuses the UDP query.
         The rule picks kube-dns Pods by label, no policy names a Service. Port = targetPort = 53.
         `a resolver that retries over TCP` after TC (RFC 7766). `The address still works` stands.
OPEN     Arrival R3 fires on `isolate`, `by-ip` and `tcp-default`: the shut door is lit from entry,
         and lighting it on arrival credits the query with raising the wall.
```
