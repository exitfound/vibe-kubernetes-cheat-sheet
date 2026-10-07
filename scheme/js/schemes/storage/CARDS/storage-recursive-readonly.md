## storage-recursive-readonly

### layout

```
WHAT     readOnly true makes only that one mount read-only, so a tmpfs under the host directory
         stays writable in the container. recursiveReadOnly Enabled closes it only when five
         requirements hold, and IfPossible falls back to Disabled with the status as the only sign.
DEVIATES L-13: the tree centres on 630, so the left drop tag clears the panel edge. The spec and
         status chips stack beside the Pod whose fields they are, mirrored to the ladder.
         L-23: the frame top is held by the two drops that end on it, so its content moves instead.
         M-12: the tagged writes ride LEG_DUR 1500 over their 224 units, on the PACING list.
CONTENT  Sources: Volumes (read-only and recursive read-only mounts), RecursiveReadOnlyMounts gate
         (v1.35), KEP 3857, validation.go, kubelet_pods.go.
         Rows 1 and 2 hold for IfPossible too: "Checks 1 and 2 hold but not all of 3 to 5".
         Row 2 reads `None or unset`, since step 4 leaves mountPropagation unset. Status reads
         Disabled with the field unset. An unhonoured Enabled means "the container would not start".
         "The only sign on the Pod": the Node also reports its runtime handler features.
```
