## cluster-kubelet-reconcile-loop

### layout

```
WHAT     The Kubelet's reconcile loop: watch, PLEG, SyncPod, CRI, status, running forever.
DEVIATES M-27: `syncpod` lights `desired` and `observed` though neither changes. The step compares
         the two, and `.highlight` is its whole beat.
CONTENT  Sources: Kubelet sync loop, Kubernetes Components, the Evented PLEG KEP, feature gates, the
         CRI api.proto.
         No `source dispatcher`: PodConfig merges the sources into one channel. PullImage is in the
         path every time, `which imagePullPolicy can skip`. EventedPLEG is alpha (`false Alpha
         1.26`). On `status` SyncPod `finds nothing left to create or start`, never "issues no new
         CRI calls". The loop queues work for the Pod worker (T-07).
```
