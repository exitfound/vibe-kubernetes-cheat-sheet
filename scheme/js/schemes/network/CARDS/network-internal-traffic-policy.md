## network-internal-traffic-policy

### layout

```
WHAT     internalTrafficPolicy decides which endpoints kube-proxy writes into each Node's rules:
         Cluster writes every ready one, Local only those on the caller's Node, and in iptables mode
         a Node with no ready local agent drops the call rather than reach the other Node.
DEVIATES L-23: the frame top stands 20 over kube-proxy. The other 14 push the chip strip to 2 short
         of the canvas edge.
         NET.L-01: the dataplane is 156 by 80 and the Pods 140 by 100, sized by the 540 frame row,
         14 + 140 + 38 + 156 + 38 + 140 + 14.
         P-03: the policy chip stands from entry, because the field is set before anything dials.
CONTENT  Sources: Service Internal Traffic Policy, Virtual IPs and Service Proxies (v1.35).
         With no ready local endpoint iptables writes a DROP: `hangs until it times out`, `drop`.
         `On the next sync`: the rules trail the field change by up to `minSyncPeriod`.
         The drop holds `in the default iptables mode`: IPVS gives the ClusterIP every endpoint.
         Local `never falls back to another Node`, it does fall back to terminating local ones.
         `while every Node with callers runs a ready agent`. The user story is a log shipper.
OPEN     The inner cross-leg tag crosses the Node-2 and Node-1 frame floors on its drop and rise:
         the lane stands 27 under the floor and the tag cannot clear it there.
```
