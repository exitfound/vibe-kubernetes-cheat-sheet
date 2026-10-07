## workloads-pod-startup-conditions

### layout

```
WHAT     The five lifecycle conditions a Pod climbs before it is Ready, who writes each one, and
         what status.phase does while they climb.
DEVIATES WL.L-06: no LAYOUT preset. The canvas is stacked bands (actors, readings, Node, staircase,
         rail), and the A / B / C form shares its signature with
         workloads-init-containers-and-sidecars.
         WL.L-02: the Node frame is 600 wide, not full width. It holds one Pod, and the CENTRE
         reading of 720 is taken with the staircase and rail dropped as chips (L-17).
         L-10: the Node band sits above the staircase on purpose. The corridor reaches the frame
         down 540..660 and a full-width staircase above it would be crossed.
         T-21: the container runtime and the CNI plugin are named by the sandbox step and not drawn.
         cluster-pod-sandbox-cri and network-wiring-pod-via-cni draw them.
CONTENT  Sources: Pod Lifecycle, EndpointSlices, Network Plugins, Feature Gates (v1.35), upstream
         BindingREST. Conditions are an array, so the desc asks which are still False.
         `roughly in this order`, never fixed: without init containers Initialized flips first.
         The Kubelet DECIDES four of five. The runtime, not the Kubelet, calls the CNI plugin.
         PodReadyToStartContainers is beta at 1.35. The endpoint is in the slice at ready=false
         from the sandbox step. Ready lags ContainersReady only through a readinessGate.
```
