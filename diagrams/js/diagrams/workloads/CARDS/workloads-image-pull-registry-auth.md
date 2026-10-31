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
         A-09: the step 4 GET leaves the Kubelet, though the runtime sends it. The runtime is the
         Node frame (T-21), and a lane from the frame to the Registry crosses the right-band ladder,
         a new lane and a composition change. The Kubelet issues PullImage with the authConfig and
         owns the backoff, so its lane stands for the CRI hop and the GET together.
CONTENT  Sources: Images, Secret, credential provider task (v1.36), CRI, OCI Distribution,
         kubelet.go. Step 2 credits the ServiceAccount admission plugin: one list with two fillers,
         no union. ImageStatus answers about the image, never layers. `2 of 4` is credited to no
         call. `a matching entry`, not `the`: several can match. Only dockerconfigjson is named, no
         claim of exclusivity. Backoff 10s doubling to 300s is kubelet.go. CreateContainer: no
         namespaces. Upper layer scoped to overlayfs. Step 3 names the
         KubeletEnsureSecretPulledImages re-pull. The aria has the runtime pull layers, as step 4.
OPEN     `StartContainer to exec PID 1` is false under shareProcessNamespace. Hedging it here alone
         splits the catalog, where PID 1 names the app process, so it is a catalog decision.
         The cache step stands 68 percent still. Closing it draws the answer back up the corridor,
         which needs a second lane and is a composition change.
```
