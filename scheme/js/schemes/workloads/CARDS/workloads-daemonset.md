## workloads-daemonset

### layout

```
WHAT     A four-Node roster where each frame states the labels it carries, so the three that match
         the Pod template nodeSelector hold a Pod and the one that does not stands empty.
DEVIATES WL.L-06: no LAYOUT preset. No ladder, a 2x2 chip board in COL_L and COL_R, which keeps the
         540..660 corridor open for the trunk. strip.two leaves it a 16 unit slot.
         A-09: the API is the centred box and the DaemonSet sits right of it, the reverse of the
         exemplar pair. The lane into the Node band leaves the API.
         L-23: the roster captions ride the Node label baseline inside the label band, so the
         roster costs the Node band no height.
         P-02: place and label write numberReady on the create arrival. No readinessProbe is drawn,
         update draws the difference, and place states the field definition in prose.
         A-14: the bus still runs over the empty Node-2 slot, because it reaches Node-1 past it.
         The tap, Pod, caption and frame of Node-2 go together.
         A-09: node-removed sends no req from the DaemonSet. PodGC deletes the Pod when the Node
         object goes, and a req hop credits the DaemonSet with a delete it does not issue.
CONTENT  Sources: DaemonSet, Perform a Rolling Update on a DaemonSet, kubectl drain (v1.35), source.
         desiredNumberScheduled counts MATCHING Nodes. numberReady is an integer, never `3 / 4`.
         The Pod is pinned by nodeAffinity, never placed by the Kubelet. A drain never evicts
         RUNNING DaemonSet Pods. node-removed puts the cause first: the Node object goes.
         node-join never says `turns Ready`: the controller does not wait for it.
         The desc opens on the no-selector case, every ELIGIBLE Node, and names updateStrategy.
```
