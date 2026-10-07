## cluster-node-conditions

### layout

```
WHAT     The five conditions kubectl describe node prints and the one that reaches a running Pod:
         one control plane block writing two kinds of taint, one lane onto the Node frame and one
         turning aside into the Pod it keeps out.
DEVIATES A-13: `nsLane` stands at full while web-2 rests at pending. It carries a ball (A-15), and
         the Pod's shade is a phase, not the lane's.
         P-05: `conditions` lights five chips that do not change. The step reads the table, and the
         lit column shows Ready reading True where the other four read False.
         S-07: `P.packets()` stays above the Pods. The NoSchedule ripple opens on web-2 and would
         run behind its fill.
         T-10: the actor is `Control Plane`, both words capitalised, the category's own label.
CONTENT  Sources: Node Status, Taint Nodes by Condition, Taint-Based Evictions, DaemonSet,
         Node-pressure Eviction, `kubelet_node_status.go` at release-1.35.
         The actor is never "node controller": taint-based eviction left it after 1.29. `rows like
         these five`, desc `Up to five`: the Kubelet never sets NetworkUnavailable. NoExecute runs
         on the default 300 s toleration. The `Pending · BestEffort` and `DaemonSet · hostNetwork`
         sublabels make their clauses true. unschedulable is absent: it is not a condition.
```
