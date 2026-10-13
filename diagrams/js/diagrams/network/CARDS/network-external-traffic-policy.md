## network-external-traffic-policy

### layout

```
WHAT     externalTrafficPolicy on a 2/1/0 Pod row: Cluster spreads over every ready Pod but SNATs
         the client away, Local keeps the client IP but drops on a Node with no Pod until a health
         check steers the balancer off it, and then spreads load per Node, a share under each Pod.
DEVIATES L-23: Node-3 runs no Pod and keeps the row height with a caption, a peer of the other two.
         NET.L-01: a Pod is 128 wide because Node-1 holds two, (300 - 2 x 14 - 16) / 2.
         M-12: every ball on an outer leg takes `LEG_DUR` 1500, registered in `PACING`. At the 733
         of `routeDur` the tag retires before it is read.
         P-03: `local` turns the policy and `healthCheckNodePort` at entry, the premise of the step.
CONTENT  Sources: Virtual IPs, Source IP tutorial, Caveats (v1.36), release-1.36 kube-proxy code.
         Shares are expected values: `at random`. An unweighted balancer splits per Node: `reduces`.
         Cluster masquerades every external connection, even one served locally: `a Node-1 address`.
         Caveats says the service controller allocates `healthCheckNodePort`, 1.36 code says the API
         server registry: `The API server allocates`. A failing Node stays probed, never taken out.
         /healthz counts only ready local endpoints, JSON `localEndpoints`, not the tutorial text.
OPEN     CENTRE and CENTRE-LOW: the share chips pool with the strip and the Pods sit 2/1/0. A Pod on
         Node-3 removes the drop and the imbalance the card exists for (L-17).
```
