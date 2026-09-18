## network-ipam-pod-cidr

### layout

```
WHAT     The kube-controller-manager carving the cluster CIDR into a per-Node podCIDR slice, and the
         CNI IPAM handing addresses out of that slice.
PANEL    Deepest at 1100x800: `OVERLAY_IDS=network-ipam-pod-cidr node --test
         report/overlay.test.mjs` from `scheme/test/`. NODE_Y 312 is what clears that bottom and the
         header comment says so on the constant. The controller column (cluster CIDR to kcm) stands
         right of the panel at x484..716, the family object width, and the three Node frames fill
         the y312..602 band.
LANES    All six wires are dashed and DIM, and every one of them carries the category role
         (`NET.A-04`), so the 1.4 weight is all `dim` contributes and the bright ball still reads
         against them. They sit ABOVE the blocks
         so the Node rects cannot hide them, and the Node-2 IPAM hand-out is revealed only on the
         final step, so its arrow starts hidden.
MOTION   The three allocation balls share ONE travel time, 1100ms, so they land together: the kcm
         carves every slice in one reconcile pass, where the length-based `routeDur` would land the
         short centre path first. `render/motion.test.mjs` carries the card in its `PACING` map for
         exactly that. On the final step Node-1's Pod keeps its settled IP with no highlight and the
         action is on Node-2: a second Pod with a non-overlapping IP out of its own slice is what
         proves uniqueness.
CONTENT  Claims read against k8s 1.35.
         THE /24 IS A DEFAULT, NOT A CONSEQUENCE OF THE FLAG. `--allocate-node-cidrs` is a boolean and
         the kube-controller-manager reference gives it as `Should CIDRs for Pods be allocated and set
         on the cloud provider. Requires --cluster-cidr`, with the block size on a separate flag,
         `--node-cidr-mask-size int32 Mask size for node cidr in cluster. Default is 24 for IPv4 and 64
         for IPv6`, which the dual-stack page repeats as `defaults to /24 for IPv4 and /64 for IPv6`.
         So the allocate step names that flag and its default. `Here each Node gets its own /24` is
         rejected: it states a default as the mechanism, which is the defect the fix is for. Naming the
         flag costs 32 characters and moves the step from 283 to 315, so its `duration` goes 2600 to
         2900 to hold the card pace of 9.21 to 9.34 ms per character.
         NODE-1 OWNS 10.244.1.0/24 AND 10.244.0.0/24 IS NOT DRAWN. No upstream page states an
         allocation ORDER, so the card cannot contradict one, and it never calls Node-1 the first Node
         registered. The slice is chosen the other way round: 10.244.1.5 is the catalog Pod IP on 121
         sites, `network-cni-invocation` narrates `The host-local plugin allocates 10.244.1.5 from this
         Node range`, and only a Node-1 slice of 10.244.1.0/24 contains it. 10.244.0.0/24 is live
         elsewhere in the catalog as well, as the edge proxy Pod 10.244.0.9 on
         `network-client-ip-preservation`. Drawing a fourth control-plane Node to account for it adds an
         actor no step narrates.
         THE NODE-2 POD IS 10.244.2.8 AND NOT THE CATALOG 10.244.2.7. 10.244.2.7 is `Pod web` on 24
         network cards, and this card draws a bare `Pod` with an `app` container, so reusing that
         address would say it is the same workload. `network-traffic-distribution` already carries
         10.244.2.8 as a second backend in the same slice, so the value is legal and in use.
         NODE-3 CARRIES A SLICE AND NO POD, AND THE UNIQUENESS STEP SAYS SO. Three equal Node frames
         and two Pods leave the Node-3 frame holding only its chip, so the step names it: `Node-3 holds
         10.244.3.0/24 with no Pod scheduled on it yet, because a block is carved at Node
         registration`. Nodes ties the carve to registration and to nothing about scheduling,
         `assigning a CIDR block to the node when it is registered`, so a Node with an allocated
         podCIDR and no Pod is an ordinary state rather than a defect of the drawing. Three wordings
         are rejected: `Node-3 is empty` reads as a property of that Node instead of the moment drawn,
         `a slice is carved once a Pod arrives` contradicts the quote, and `no Pod runs on Node-3`
         drops the `yet` that keeps a true state from reading as a rule. The clause costs 108
         characters and moves the step from 344 to 452, so its `duration` goes 3200 to 4200 to hold
         9.29 ms per character inside the card band. It also puts the step 4 panel bottom at 304.4 at
         1100x800, 7.6 units above `NODE_Y` 312: one line more covers the `Node-1` frame label at
         y 319..333.7.
         THE ROUTING ABSOLUTE STANDS UNQUALIFIED. `routing only has to track which Node owns which /24`
         holds for both dataplanes the catalog draws: `network-pod-to-pod-cross-node` gives an overlay
         plugin wrapping to the remote Node IP and a routed plugin advertising each Node podCIDR, and
         both key on the per-Node block. The contrast the sentence is making is per-Node aggregation
         against a route per Pod, and that survives encapsulation. An `on a route-based dataplane`
         qualifier is rejected because it implies the aggregation fails under an overlay, which is
         false.
         THE DESC FLAG CLAUSE IS LOOSE AND STAYS. `the controller-manager, whenever it is started with
         --allocate-node-cidrs` credits the binary rather than the `node-ipam-controller` the
         `--controllers` list names inside it, at the same grain the Nodes page uses when it writes
         `The node controller ... assigning a CIDR block to the node when it is registered (if CIDR
         assignment is turned on)`, and at the grain of the `controller-manager` block the card draws.
         The flag is a boolean, so `started with` reads it as true correctly. The desc sits at 455 of
         470 (`D-04`), and spending that headroom to say `node-ipam controller` would name an actor the
         canvas does not label.
         SOURCES. The cluster CIDR to per-Node podCIDR carve is carried by the
         kube-controller-manager flag reference and by Nodes. The Cluster Networking page is kept for
         the half it still states, `Kubernetes clusters require to allocate non-overlapping IP addresses
         for Pods, Services and Nodes` and `The network plugin is configured to assign IP addresses to
         Pods`, and it is not sufficient on its own: it names no podCIDR and no controller.
SCOPE    The POD address space only: the cluster CIDR, the per-Node podCIDR slice cut out of it and
         the Pod IP the CNI IPAM draws from that slice. The Service range, its static and dynamic
         bands and the ClusterIP an allocator picks out of them belong to `network-service-cidr`.
         That address space is never sliced per Node.
NOT A DEFECT
         The IPAM ball leaves the BOTTOM EDGE of the slice chip, and the narration reads `its address
         is drawn by the CNI IPAM strictly out of that Node slice`, so the drawn source and the
         grammatical one agree. The card has no CNI and no IPAM block anywhere, so the slice is the
         only candidate on the canvas.
         The three allocation lanes CROSS the Node frame top face at y 312 and end on the slice chip
         at y 350, which `report/frame-face.test.mjs` prints for `node1` and `node3` on its `into the
         interior` list, where the stop is the record's call. What travels here is not traffic to a
         workload, which is what `NET.A-02` governs, but the controller-manager WRITING
         `node.spec.podCIDR`, and that field IS the chip inside the frame, so the write has to reach
         it. Stopping on the face would also cut the centre lane from 104 units to 66 and drop its
         ball to 0.06 units per ms against a catalog median of 0.274, because all three share one
         1100ms travel time.
OPEN     CENTRE-LOW. The four blocks below the overlay span 130..700, centre 415. The rule cannot see
         Node frames, so what it measures is the two Pods, and those sit in Node-1 and Node-2 because
         the narration names those two Nodes. Moving either Pod to Node-3, reordering the Nodes, or
         inventing a third Pod would each make the card say something different. The composition
         itself is centred: three equal frames spanning 80..1120 under a control-plane column on
         their common centre line. `L-17` is why the rule cannot close.
         THE IPAM ARRIVAL LANDS ON THE POD TITLE. The ball stops on the Pod top edge at y 442, which
         `NET.A-01` requires of every endpoint, and `buildPod` prints `Pod` at y 445.7..461.7 and
         x 219..241, so the ball at radius 7 covers the top 3.3 units of the word and the ripple ring
         at radius 21 passes either side of it. Measured at 1100x800 on steps 3 and 4. The word stays
         legible and the state lasts 550ms. Lifting the endpoint clear of the edge breaks `A-19`, and
         moving the label is a `buildPod` change reaching every card that draws a Pod, so both fixes
         cost more than the finding.
```
