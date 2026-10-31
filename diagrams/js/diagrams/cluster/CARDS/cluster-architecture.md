## cluster-architecture

### layout

```
WHAT     The moving parts of a cluster and who talks to whom: control plane over a Node, with every
         controller watching the API and never ETCD.
DEVIATES A-21: the two Node-bound lanes end on the Kubelet and kube-proxy, not on the frame. There
         are no Pods and nothing pulses, so a lane on the frame would point at three boxes.
         A-14: a Node-bound lane out of play is not drawn, a control-plane lane dims to notready.
         The control plane is the subject and keeps its shape, the Node pair would read as traffic.
         T-21: the first step names clients and none is drawn. cluster-object-create-path draws the
         client in the band at 1060..1190, which this card leaves empty on purpose.
CONTENT  Sources (v1.36): Components, Architecture, Cloud Controller Manager, API Concepts, API
         Server Bypass Risks, static Pods, Pod API (`spec.nodeName`). kube-proxy optional and the
         status PATCH are words only. A static Pod is "one of the few paths": Bypass Risks also
         lists the kubelet API, etcd, the runtime socket. "That one write is all it does" is ruled
         out: the Scheduler also posts an Event. Kept: "only way in for clients and controllers",
         "in a standard cluster", "roughly one per resource kind", "a local file or a URL".
OPEN     The `Control plane` frame label prints at (162, 114), under the panel on every viewport. It
         stays: the grid shared with cluster-object-create-path and cluster-cascading-deletion puts
         the frame at 150, and moving it moves all three cards.
```
