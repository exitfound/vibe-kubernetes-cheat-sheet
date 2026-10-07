## network-policy

### layout

```
WHAT     A NetworkPolicy as the one exception to the flat promise: once a policy selects a Pod, a
         connection has to clear a checkpoint at each end, the sender's egress and the receiver's
         ingress, each judged on its own.
DEVIATES NET.L-01: the Pods are 232 by 100 with a 192 by 46 app box, the card's own height.
         L-10: each road carries a collinear point at every bar centre, so it ends on the checkpoint
         instead of crossing it. Removing one reddens the geometry check.
         P-03: the rule chips stand from entry beside a verdict that waits for its arrival, because
         the policy applies before the call leaves.
CONTENT  Sources: Network Policies, NetworkPolicy API reference (v1.35).
         `db-ingress` is the upstream default-deny narrowed to role=db, never called a default.
         `allow` adds one rule to that same object: the union across policies is out of scope.
         `everything the policy does not explicitly allow is dropped` stands unqualified. Its one
         counter-case, traffic from the Pod's own Node, is out of scope.
         `either-side` rules on the verdict, never on where a plugin enforces it.
OPEN     R3 fires on `isolate` and `either-side`: a bar stays lit on every step a ball reaches it,
         and going dark there dims the subject the moment it acts.
```
