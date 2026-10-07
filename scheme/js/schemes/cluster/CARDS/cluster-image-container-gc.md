## cluster-image-container-gc

### layout

```
WHAT     Two stores on one disk: the image filesystem as a ruler carved per image and the dead
         containers as six slots, the Kubelet deleting out of both on two different rules.
DEVIATES CLU.L-01: the frame holds no Pod and reads 56 over the bar. Its topmost content is the
         caption and threshold row, and 34 over the bar prints the frame label on that row.
         C-09: a deleted segment or slot fades to 0, never to terminated. A ghost segment between
         the marks leaves open whether that disk is free.
CONTENT  Sources: Garbage Collection, Kubelet Configuration, Node-pressure Eviction, the kubelet
         reference, `cmd/kubelet/app/options/options.go` at release-1.35.
         Tick captions take the concept spelling. `MaxContainers caps the total and lowers the per
         Pod cap to fit`, chipped `all Pods`, never "the cluster". imagefs holds on the container
         step: writable layers live on nodefs. The cap of 2 is "here", the default is 1. The sweep
         stops at LowThresholdPercent. Names, ages and percentages are scenario.
OPEN     The collection clocks (5m images, 1m containers) are undrawn. The only free band under the
         panel is 227.9 wide, and the shortest honest chip needs 227.4 of glyph alone.
```
