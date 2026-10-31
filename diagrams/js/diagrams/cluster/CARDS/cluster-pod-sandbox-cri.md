## cluster-pod-sandbox-cri

### layout

```
WHAT     The Kubelet as a CRI client: containerd makes the netns, CNI wires it, pause starts, then
         the Kubelet pulls, creates and starts the app inside that sandbox.
DEVIATES L-03: the top row is 3 x 232 + 2 x 60 right-aligned on 1140, so the Kubelet starts at
         324, behind the panel at 1100x800 by 36 units. No glyph is lost.
         L-08a: the ladder is 430 wide and the chips start at 620, not LAYOUT.A. The 490..620
         corridor carries the containerd drop on x 600 to the Node frame.
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
CONTENT  Sources (v1.36): CRI api.proto, Container Runtimes, Network Plugins, Images, Pod Lifecycle,
         kuberuntime, image pull manager, kube_features.go, containerd 2.2 sandbox_run.go, nginx 1.30.5.
         One RunPodSandbox: NewNetNS, CNI, StartSandbox, so pause lands on `cni`, never step 1. Then
         pull, create, start. `sandbox ready` waits for `cni`. Skip only `unless it pulled that
         private image with other credentials`. `No workload`: pause is one. PID names both fields,
         `by default` covers hostUsers, Ready names readinessGates, cgroup on Start.
```
