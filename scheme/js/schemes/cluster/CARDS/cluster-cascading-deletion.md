## cluster-cascading-deletion

### layout

```
WHAT     A cascading delete: deletionTimestamp and a finalizer instead of removal, the Garbage
         collector walking ownerReferences, and the finalizers clearing up the chain.
DEVIATES S-17: `kubelet-stops` pulses the placedPod wrapper with no `reducedLit`, unlike
         `create-pod` on cluster-object-create-path. Its static path already dims the Pod.
         L-11: the Garbage collector return lands at 636 on the API bottom face, not 600. At the
         midpoint it crosses the Node return descending at 612.
         A-05: no lane returns from the controller-manager. It only reads on this card.
         The `DELETE replicasets . pods` label sits under its own lane, never in the watch register:
         there it reads as the API issuing the DELETEs to the Garbage collector.
CONTENT  Sources: Garbage Collection, Owners and Dependents, Finalizers, Pod Lifecycle,
         `pkg/controller/garbagecollector/garbagecollector.go`.
         The Deployment is "marked for deletion", never "Terminating". The ReplicaSet DELETE is
         foreground, the Pod's is background because it owns nothing, and the two are ordered. The
         grace budget counts from the Pod's own stamp on step 4. Step 7 completes the delete step 3
         accepted, no second DELETE. The desc leaves `blockOwnerDeletion` unqualified (T-20).
```
