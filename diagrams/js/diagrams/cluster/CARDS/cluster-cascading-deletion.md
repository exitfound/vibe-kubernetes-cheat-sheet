## cluster-cascading-deletion

### layout

```
WHAT     A cascading delete: deletionTimestamp and a finalizer instead of removal, the Garbage
         collector walking ownerReferences, and the finalizers clearing up the chain.
DEVIATES S-17: `kubelet-stops` pulses the placedPod wrapper with no `reducedLit`, unlike
         `create-pod` on cluster-object-create-path. Its static path already dims the Pod.
         L-11: the Garbage collector return lands at 636 on the API bottom face, not 600. At the
         midpoint it crosses the Node return descending at 612.
CONTENT  Sources at 1.36: Garbage Collection, Owners and Dependents, Finalizers, Pod Lifecycle,
         `garbagecollector.go`, `handlers/delete.go`, registry `store.go`, kubelet
         `status_manager.go`, kubectl `delete.go`, the nginx Dockerfile.
         Deployment "marked for deletion", never "Terminating". Step 2 "sets", never "patches": a
         storage update inside the DELETE, no PATCH verb. ReplicaSet DELETE foreground, Pod's
         background after it. Grace counts from step 4. The Pod leaves ETCD by the Kubelet DELETE
         with grace 0, not by a finalizer: step 7 fades it first, and its one ETCD hop is the
         ReplicaSet and Deployment removal. Step 7 completes the step 1 DELETE and ends the
         kubectl wait.
         "202 Accepted" is ruled out: 202 needs orphanDependents=false, kubectl gets 200 and waits.
         nginx:1.30 stops on SIGQUIT.
OPEN     The `Control plane` frame label prints at (162, 114), under the panel on every viewport. It
         stays: the grid shared with cluster-architecture and cluster-object-create-path puts the
         frame at 150, and moving it moves all three cards.
```
