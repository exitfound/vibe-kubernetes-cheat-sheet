## cluster-image-container-gc

### layout

```
WHAT     Two stores on one disk: the image filesystem as a ruler carved per image and the dead
         containers as six slots, the Kubelet deleting out of both on two different rules.
DEVIATES CLU.L-01: the frame holds no Pod and reads 56 over the bar. Its topmost content is the
         caption and threshold row, and 34 over the bar prints the frame label on that row.
         C-09: a deleted segment or slot fades to 0, never to terminated. A ghost segment between
         the marks leaves open whether that disk is free.
CONTENT  Sources at 1.36: Garbage Collection, Kubelet Configuration, Node-pressure Eviction, the
         kubelet reference, `options.go`, `image_gc_manager.go`, `eviction_manager.go`,
         `kuberuntime_gc.go` at v1.36.0. Tick captions take the concept spelling. imageMaximumGCAge
         reads off through the sweep and turns on in its own step: `GarbageCollect` runs the age
         rule before the threshold check, so on at 168h it would have taken envoy and fluentd
         first. MaxPerPodContainer counts dead instances per container in a Pod (the evict unit is
         Pod UID plus container name, the flag says "per container"), where the docs page says
         "each Pod": the code wins. `MaxContainers caps the total and lowers that cap to fit`,
         chipped `all Pods`, never "the cluster". imagefs holds on the container step: writable
         layers live on nodefs. The cap of 2 is "here", the default is 1. The sweep stops at
         LowThresholdPercent. Images go before Pods fail, "every unused image past
         imageMinimumGCAge" because `DeleteUnusedImages` skips younger ones where the docs say
         "all unused images". Names, ages, usage are scenario.
OPEN     The collection clocks (5m images, 1m containers) are said on `stores` and not drawn. A
         chip fits under the panel, left of the 588 delete drop and above the `del` label at 285:
         drawing one is a composition change.
```
