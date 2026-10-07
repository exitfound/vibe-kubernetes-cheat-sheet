## cluster-object-create-path

### layout

```
WHAT     A manifest becoming a running Pod: every handoff after the write is a component reacting
         on its own watch, until the Kubelet drives the Runtime over CRI, which is a call.
DEVIATES S-17: `create-pod` declares `reducedLit`. Its animated path pulses the placedPod wrapper
         and lights no block, so the derived static path would show no cue at all.
         The client is 130 wide, not the API's 232: the band right of the 1030 column wall is 150.
CONTENT  Sources: Architecture, Controllers, Server-Side Apply, the Pod API reference.
         Server-side Apply is "the same PATCH under its own content type", never a verb, as
         cluster-server-side-apply says. `checks RBAC` stays: `authorization` says less. The Pod is
         drawn from `create-pod`, an empty `spec.nodeName` is a candidate. The Kubelet makes every
         CRI call. ETCD is drawn once, later writes are words.
```
