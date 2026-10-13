## cluster-node-registration

### layout

```
WHAT     A machine becoming a Node object, and the gap between the object existing and the Node
         taking a Pod: self-registration, published status, Ready False under the not-ready taint,
         Ready True, and the Lease heartbeat.
DEVIATES CLU.L-01: the frame is 126/80/34. Two of the three slots are plain boxes, and a 106 shell
         round a label pair leaves 60 units of nothing. The paddings stay the family's.
         A-09: the Kubelet writes and the heartbeat leave the frame top, not the Kubelet box. The
         Kubelet is the Node, and every lane on the card ends on the frame.
CONTENT  Sources (v1.36): Nodes, Node Status, Node Labels, Admission Controllers, the Node API
         reference, `nodestatus/setters.go`, `kubelet_node_status.go`, the NodeRestriction and
         TaintNodesByCondition plugins at v1.36.0.
         The POST carries the whole status (`initialNode` ends in `setNodeStatus`) and the taint is
         added at create, so `status` and `not-ready` are later PATCHes: Ready False `keeps` the
         taint, never "puts" it. The InternalIP is private, as on the network cards' Node addresses.
         The DNS subdomain rule stays unstated: the card draws `Node-1` (T-07). `Its own labels sit
         on the object, not the status` matches the status PATCH wire, and only the kubernetes.io
         ones are held to a list. `takes no ordinary Pod yet`, never "holds every Pod off". The
         taint removal is passive: the sources disagree on the actor. `not registered`, not `none`.
```
