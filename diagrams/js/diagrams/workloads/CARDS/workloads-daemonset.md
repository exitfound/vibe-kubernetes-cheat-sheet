## workloads-daemonset

### layout

```
WHAT     A four-Node roster where each frame states the labels it carries, so the three that match
         the Pod template nodeSelector hold a Pod and the one that does not stands empty.
DEVIATES WL.L-06: no LAYOUT preset. No ladder, a 2x2 chip board in COL_L and COL_R, which keeps the
         540..660 corridor open for the trunk. strip.two leaves it a 16 unit slot.
         L-23: the roster captions ride the Node label baseline inside the label band, so the
         roster costs the Node band no height.
         P-02: place, label and update write numberReady on the create arrival. No readinessProbe
         is drawn: update draws the not-ready dip, and place states the field definition in prose.
CONTENT  Sources (v1.36): DaemonSet, Rolling Update task, kubectl drain, DaemonSet v1 API, daemon
         and drain code. desiredNumberScheduled counts MATCHING Nodes. numberReady is an integer,
         never `3 / 4`, back on Ready at the create arrival (P-02). nodeAffinity pins, never the
         Kubelet. Drain never evicts RUNNING Pods. node-removed: Node object first, PodGC (not the
         controller) deletes. node-join: no `turns Ready`. desc: every ELIGIBLE Node, names
         updateStrategy. The task page caps a rollout at one Pod per Node, the code lets maxSurge
         add one: the card follows code.
```
