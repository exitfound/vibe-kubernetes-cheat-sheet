## network-flat-pod-network

### layout

```
WHAT     The flat Pod network as one band: four Pods on three Nodes in one L3 address space, and a
         packet crossing it with its src IP unchanged, so no NAT and no port mapping.
DEVIATES NET.L-01: Pods are 180 by 120. 180 is set by the row (at 232 the three frames want 1116
         against the 960 band), 120 is the card's own.
         A-21: the four Pod wires cross the Node frame and land on the Pod. A Pod attaches itself to
         the address space here, no actor lane reaches into a Node.
         A-05: the CNI connector is a headless `P.raw` path at full opacity with marching dashes and
         no ball. The plugin makes the flat space exist and sends nothing discrete along it.
CONTENT  Sources: Cluster Networking, The Kubernetes Network Model, Pod Lifecycle, Add-ons (v1.36).
         Calico, Cilium and Flannel checked as maintained releases current with 1.36.
         The runtime implements the model and reaches the CNI plugin `almost always`.
         Rule two keeps the doc's scope: `barring intentional segmentation such as a NetworkPolicy`.
         `Only a few parts` is the doc's. `the network probes`: an exec probe never dials the Pod.
         Pod IPs take one /24 per Node of 10.244.0.0/16, the slices `network-ipam-pod-cidr` carves.
         Rule one says `not on hostNetwork`: such a Pod shares the Node IP, the doc line is absolute.
OPEN     The riding tag crosses the band floor twice a step and sweeps the band sublabel on the way
         down: a tag that clears the band label on the rail has to sit outside the band.
         The Node-2 kubelet overhangs into Node-1. Its drop lands inside Node-2, and moving the box
         puts it off centre over the symmetric band on every other step (L-16).
```
