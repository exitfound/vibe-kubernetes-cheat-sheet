# Scheme card design notes: cluster

One record per card in `./CARDS/<id>.md`, listed below in catalog order (`D-10`). A record holds
only what the code and `scheme/CANON.md` cannot say, in the labels of "The record vocabulary".
Category rules are `./CLAUDE.md`. A new card adds its record and a row here, in `cards.js` order.

**Control Plane**

- [`cluster-architecture`](./CARDS/cluster-architecture.md)
- [`cluster-object-create-path`](./CARDS/cluster-object-create-path.md)
- [`cluster-admission-chain`](./CARDS/cluster-admission-chain.md)
- [`cluster-resource-quota`](./CARDS/cluster-resource-quota.md)
- [`cluster-list-watch-informers`](./CARDS/cluster-list-watch-informers.md)
- [`cluster-server-side-apply`](./CARDS/cluster-server-side-apply.md)
- [`cluster-scheduler-decision`](./CARDS/cluster-scheduler-decision.md)
- [`cluster-taints-tolerations`](./CARDS/cluster-taints-tolerations.md)
- [`cluster-pod-priority-preemption`](./CARDS/cluster-pod-priority-preemption.md)
- [`cluster-cascading-deletion`](./CARDS/cluster-cascading-deletion.md)
- [`cluster-etcd-raft`](./CARDS/cluster-etcd-raft.md)
- [`cluster-leader-election`](./CARDS/cluster-leader-election.md)

**Node Runtime**

- [`cluster-kubelet-reconcile-loop`](./CARDS/cluster-kubelet-reconcile-loop.md)
- [`cluster-pod-sandbox-cri`](./CARDS/cluster-pod-sandbox-cri.md)
- [`cluster-static-pods`](./CARDS/cluster-static-pods.md)
- [`cluster-node-allocatable`](./CARDS/cluster-node-allocatable.md)
- [`cluster-pod-cgroup-hierarchy`](./CARDS/cluster-pod-cgroup-hierarchy.md)
- [`cluster-cpu-throttling`](./CARDS/cluster-cpu-throttling.md)
- [`cluster-oom-kill`](./CARDS/cluster-oom-kill.md)
- [`cluster-image-container-gc`](./CARDS/cluster-image-container-gc.md)

**Node Lifecycle**

- [`cluster-node-registration`](./CARDS/cluster-node-registration.md)
- [`cluster-node-conditions`](./CARDS/cluster-node-conditions.md)
- [`cluster-node-drain`](./CARDS/cluster-node-drain.md)
- [`cluster-graceful-node-shutdown`](./CARDS/cluster-graceful-node-shutdown.md)
- [`cluster-node-pressure-eviction`](./CARDS/cluster-node-pressure-eviction.md)
- [`cluster-node-restart`](./CARDS/cluster-node-restart.md)
- [`cluster-node-failure`](./CARDS/cluster-node-failure.md)
- [`cluster-node-eviction-rate`](./CARDS/cluster-node-eviction-rate.md)
