## storage-recursive-readonly

### layout

```
WHAT     readOnly true makes only that one mount read-only, so a tmpfs under the host directory
         stays writable in the container until recursiveReadOnly Enabled closes it, which needs
         five requirements, while IfPossible falls back to Disabled with the status as the only
         sign.
DEVIATES L-13: the tree centres on 630, so the Node frame clears the requirements ladder (40..296)
         by 34. The spec and status chips stack beside the Pod whose fields they are, mirrored to
         the ladder.
CONTENT  Sources at 1.36: Volumes (release-1.36, no change from 1.35), RecursiveReadOnlyMounts gate
         (GA locked since 1.33, still present in v1.36.5), KEP 3857, validation.go, kubelet_pods.go.
         Rows 1 and 2 are API validation for Enabled and IfPossible alike: step 4 says
         the API server requires them, and "the container does not start" covers rows 3 to 5 only.
         Status reads Disabled with the field unset. Unmet Enabled: "the container would not start".
         "The only sign on the Pod": the Node also reports status.runtimeHandlers[].features.
```
