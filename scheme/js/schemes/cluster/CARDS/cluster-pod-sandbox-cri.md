## cluster-pod-sandbox-cri

### layout

```
WHAT     The Kubelet as a CRI client: containerd materialises the pause container, pulls, creates
         and starts, and CNI wires the sandbox namespace.
DEVIATES L-03: the top row is 3 x 232 right-aligned on 1140, so the Kubelet starts at 324, behind
         the panel at 1100 and 1280 widths. No glyph is lost.
         CLU.L-01: the frame is 162/116/34. The Pod is 10 taller than 106 for a sublabel that
         changes on every step.
         L-10: the containerd lane turns above both columns, never at `NODE_Y - 16`, where its leg
         cuts all four value chips.
         A-06: `sandbox` writes the sandbox id with no ball on the return lane. The step does not
         name the return, `create` does and rides it.
         T-21: `image` names the registry and the image store, neither drawn. The card is the CRI
         boundary, and a registry would be the one block outside the Node.
         M-17: `conf` leaves at 800 beside the CNI return, not after it. The arrival order already
         tells the causality, and chaining costs 600 ms of duration.
         P-02: `status` reports the newest milestone, sandbox then image then container. The Pod
         sublabel keeps the IP after `cni`.
CONTENT  Sources: CRI Spec, Container Runtimes, Network Plugins, Images, the Pod API reference,
         containerd, the docker-nginx Dockerfile at 1.27.5.
         The skip belongs to the policy: `under IfNotPresent Kubelet skips the call`, row 3 `fetch
         image (policy can skip)`. `No workload container exists yet`: pause is a container.
         `sandbox` names `spec.shareProcessNamespace` and `spec.hostPID` (T-19). The containers are
         the Ready gate, the probe its qualifier. The cgroup lands on StartContainer, never Create.
```
