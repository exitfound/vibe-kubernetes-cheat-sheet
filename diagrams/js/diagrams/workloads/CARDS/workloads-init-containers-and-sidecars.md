## workloads-init-containers-and-sidecars

### layout

```
WHAT     Init containers running to completion in order, then a native sidecar starting and staying
         up alongside the app.
CONTENT  Sources: Sidecar Containers, Init Containers, Pod Lifecycle, Images (v1.36),
         kube_features.go, printers.go, kubelet getPhase (release-1.36). Sidecar GA in 1.33, and
         Init:0/3 counts it. Step 1 says `regular` init containers exit 0, and
         `its own or inherited` restartPolicy: ContainerRestartRules (beta, on) lets a container
         override the Pod. Started is the Kubelet verdict, so the wire carries started=true as
         derived. It unblocks the next container, not `the next entry`. PLEG is `then`. A failed
         init reads Init:Error, main reads Running.
```
