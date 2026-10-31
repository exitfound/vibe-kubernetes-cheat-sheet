## cluster-kubelet-reconcile-loop

### layout

```
WHAT     The Kubelet's reconcile loop: watch, PLEG, SyncPod, CRI, status, running forever.
DEVIATES M-27: `syncpod` lights `desired` and `observed` though neither changes. The step compares
         the two, and `.highlight` is its whole beat.
CONTENT  At 1.36: Kubelet sync loop, Components, KEP 3386 at fda8866 (the master rewrite drops the
         300s relist that `relists far less often` rests on), CRI api.proto, and kubelet.go,
         pod_workers.go, pleg/generic.go, kuberuntime_manager.go, kube_features.go at v1.36.0.
         PodConfig merges the sources, no `source dispatcher`. PullImage `a call imagePullPolicy
         can skip`. EventedPLEG alpha, off. "Next PLEG cycle" is ruled out on
         `status`: PLEGOnDemandRelist is beta, on in code (the changelog "off" was reverted).
         SyncPod `finds nothing left to create or start`, never "issues no new CRI calls". Diff
         `two actions`. The loop `queued the Pod for its Pod worker`, which `calls SyncPod`
         (podWorkerLoop calls podSyncer.SyncPod), never the reverse. A relist calls ListPodSandbox
         and ListContainers (getPods). PATCH `again`: SyncPod and OnPodSandboxReady write earlier.
```
