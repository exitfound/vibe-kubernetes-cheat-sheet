## workloads-image-pull-registry-auth

### layout

```
WHAT     Kubelet pulling an image from a registry, through imagePullPolicy and the backoff that
         follows a failure.
DEVIATES L-10: the two top arrows cross the cloud outline over their last 26.4 units. The cloud is
         a container round the Registry, not an obstacle, the reading L-10 gives a Node frame.
         M-19a: steps 1 and 2 stand fully still. Reading a field and resolving one imagePullSecrets
         list are local to the Kubelet, and nothing travels.
         T-21: the container runtime and the layer store are named and not drawn. They are ceded to
         cluster-pod-sandbox-cri and cluster-image-container-gc, and the Node frame stands for both.
CONTENT  Sources: Images, Pod Lifecycle, OCI Distribution Spec, CRI Spec (v1.35), kubelet.go.
         Step 2 credits the ServiceAccount admission plugin: one list with two fillers, no union.
         ImageStatus answers about the image, never layers. `2 of 4` is credited to no call.
         `a matching entry`, not `the`: several can match. Only dockerconfigjson is named, no claim
         of exclusivity. Backoff 10s doubling to 300s is the image pair in kubelet.go.
         CreateContainer says nothing of namespaces. The upper layer is scoped to overlayfs.
OPEN     `StartContainer to exec PID 1` is false under shareProcessNamespace. Hedging it here alone
         splits the catalog, where PID 1 names the app process, so it is a catalog decision.
         The cache step stands 54 percent still. Closing it draws the answer back up the corridor,
         which needs a second lane and is a composition change.
```
