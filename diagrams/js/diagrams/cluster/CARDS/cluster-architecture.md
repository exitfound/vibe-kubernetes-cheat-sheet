## cluster-architecture

### layout

```
WHAT     The moving parts of a cluster and who talks to whom: control plane over a Node, with every
         controller watching the API and never ETCD.
DEVIATES A-21: the two Node-bound lanes end on the Kubelet and kube-proxy, not on the frame. There
         are no Pods and nothing pulses, so a lane on the frame would point at three boxes.
         A-14: a Node-bound lane out of play is not drawn, a control-plane lane dims to notready.
         The control plane is the subject and keeps its shape, the Node pair would read as traffic.
         L-11: API_TO_KPROXY crosses the ETCD read lane at (757, 192). The alternative takes the
         kube-proxy lane off the API face midpoint.
         T-21: the first step names clients and none is drawn. cluster-object-create-path draws the
         client in the band at 1060..1190, which this card leaves empty on purpose.
         ETCD right-aligns on the 1030 column wall, not on the Scheduler axis 914, and is 124 wide
         rather than 130: the `write . Raft quorum commit` label needs the gap to the API.
CONTENT  Sources (v1.36): Kubernetes Components, Cluster Architecture, Cloud Controller Manager,
         API Concepts (watch cache), Create static Pods, the Pod API reference (`spec.nodeName`).
         cloud-controller-manager has an `optional` sublabel, kube-proxy being optional and the
         status PATCH are in words only. The API is "the only way in for clients and controllers",
         the Scheduler writes once "on the ordinary path", ETCD has one client "in a standard
         cluster", controllers "roughly one per resource kind", static Pods "a local file or a URL".
```
