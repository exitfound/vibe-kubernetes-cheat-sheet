## cluster-object-create-path

### layout

```
WHAT     A manifest becoming a running Pod: every handoff after the write is a component reacting
         on its own watch, until the Kubelet drives the Runtime over CRI, which is a call.
DEVIATES S-17: `create-pod` declares `reducedLit`. Its animated path pulses the placedPod wrapper
         and lights no block, so the derived static path would show no cue at all.
CONTENT  Sources (v1.36): Architecture, Controllers, Controlling Access, Server-Side Apply,
         Scheduler Configuration, Pod Lifecycle, the Deployment, Pod and Binding API references,
         kubelet `config/apiserver.go`, `kuberuntime_manager.go`, `cache_watcher.go`. SSA is "the
         same PATCH under its own content type", never a verb. `checks RBAC` stays. ADDED on a
         newly matching field selector. Pod drawn from `create-pod`, short hash, 5-char suffix. The
         Kubelet makes every CRI call, sandbox first. ETCD drawn once. No controller calls another.
OPEN     The `Control plane` frame label prints at (162, 114), under the panel on every viewport
         (on the shallowest steps at most its last 3 units show). It stays: the grid shared with
         cluster-architecture and cluster-cascading-deletion puts the frame at 150, and moving it
         moves all three cards.
```
