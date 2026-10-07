## workloads-init-containers-and-sidecars

### layout

```
WHAT     Init containers running to completion in order, then a native sidecar starting and staying
         up alongside the app.
DEVIATES M-19a: the last step holds 2700 against a 900 span, by choice. Matching the 3800 of the
         steps before it only adds still air, and their 3800 is an M-19 floor, not a rhythm.
CONTENT  Sources: Sidecar Containers, Init Containers, Pod Lifecycle, Images, Feature Gates (v1.35),
         printers.go. The sidecar is beta in 1.29 and GA in 1.33, and Init:0/3 counts it.
         Step 1 says `regular` init containers exit 0: the sidecar is still running at main start.
         Started is a running process or a passed startupProbe, the Kubelet's verdict, so the wire
         carries started=true as derived. It unblocks the next container, not `the next entry`.
         PLEG is `then`, a relist. A failed init reads Init:Error, main reads Running.
```
