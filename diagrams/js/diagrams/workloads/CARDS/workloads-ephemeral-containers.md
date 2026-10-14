## workloads-ephemeral-containers

### layout

```
WHAT     A running Pod has two ordinary doors closed on it, exec by the image and the spec by the
         update rules, so a third list with a subresource of its own lets one more container in, a
         guest in the PID namespace of its target with none of the guarantees of a real container.
DEVIATES WL.L-06: no LAYOUT preset. Two chip columns flank the spine and no ladder, under a fan of
         three doors.
         WL.L-02: the content span is 120..1080, not full width. At 1080 the frame and both columns
         stand a quarter empty, and the columns keep the 540 / 660 inner edges.
         L-23: the frame floor is 632, past the category 624. Its top is held 12 under the chip
         columns at 444, and the floor then stands 8 above the canvas edge.
         WL.A-01: no lane pair. Nothing answers on this card, a closed door states its verdict in
         its own sublabel.
         M-19a: steps 4 and 6 stand still for their whole hold. They are packet-less and Pod-less
         (M-27), and the hold buys reading time.
         T-21: step 5 names the Kubelet and step 6 the container runtime, and nothing draws either.
         cluster-pod-sandbox-cri draws the CRI stack.
CONTENT  v1.36: Ephemeral Containers, Debug Running Pods, Share Process Namespace, Pod v1, Pods (Pod
         update), kubectl debug profiles.go. A Pod update THROUGH THAT DOOR changes only images,
         `immutable` is ruled out. exec is closed by the IMAGE, for a shell exec into app. Never
         restarted, changed or removed. Step 5 opens on the Kubelet seeing the entry, never `the
         write reaches the Node`. Step 3 gives debugger-8xzrl as the name example. No Pod phase. The
         default profile is general, adds SYS_PTRACE: Debug Running Pods says legacy, code wins.
```
