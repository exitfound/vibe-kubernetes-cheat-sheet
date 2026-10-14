## storage-csi-ephemeral-volume

### layout

```
WHAT     A CSI volume written inline in the Pod spec skips the claim path: Kubelet checks the
         CSIDriver lists Ephemeral and calls NodePublishVolume, which creates the volume, and
         NodeUnpublishVolume deletes it.
CONTENT  Sources (1.36): Ephemeral Volumes, pkg/volume/csi v1.36.5, kubernetes-csi Ephemeral Local
         Volumes, Secrets Store driver v1.6.1 (concepts, nodeserver.go, csidriver.yaml
         podInfoOnMount). Ephemeral is checked at mount time, also with no CSIDriver. CanAttach is
         false inline. `as written` is ruled out: podInfoOnMount adds Pod info. readOnly true: the
         driver rejects false. The tmpfs mounts before the fetch (DOC-VS-CODE: concepts says
         fetch, then tmpfs). The provider fetches. Store `outside the Kubernetes API`, `lives and
         dies with the Pod`, no lowercase `secret`.
```
