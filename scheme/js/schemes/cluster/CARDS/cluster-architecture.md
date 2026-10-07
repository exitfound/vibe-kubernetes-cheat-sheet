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
CONTENT  Sources: Kubernetes Components, Cluster Architecture, the Pod API reference
         (`spec.nodeName`). cloud-controller-manager carries an `optional` sublabel, kube-proxy is
         optional in words only (T-23). The API is "the only way in for clients and controllers",
         the Scheduler writes once "on the ordinary path", ETCD has the API as its only client "in
         a standard cluster", and the desc keeps that qualifier. The controller-manager runs loops
         "roughly one per resource kind". The Kubelet status PATCH is said in words.
```
