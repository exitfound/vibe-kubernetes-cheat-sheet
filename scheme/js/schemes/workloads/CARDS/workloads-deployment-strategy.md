## workloads-deployment-strategy

### layout

```
WHAT     One field decides the order of the two orders a Deployment issues, and that order decides
         whether the handover window holds both Pods or nobody.
DEVIATES WL.L-06: no LAYOUT preset. Two stacked full-width strategy tracks carry neither a ladder
         nor a column, and the strip comes from strip() at the 350.67 three-across width.
         WL.A-03: no Node frame. The subject is the order the controller issues, and a frame
         spanning both tracks would say the split is by Node.
         WL.A-02: no top-row wire. The order is already the label of the tile the ball leaves.
         L-10: track B is track A mirrored, first order on the left on both rows. The same Pod at
         the same x would send a first-order lane across the Pod between.
         A-13: every lane is 1 or 0, never min(source, sink). A not-created Pod carries its own
         0.4 (C-14), and chaining it draws the jog at y 340 in two shades.
CONTENT  Sources: Deployments (Strategy, Recreate Deployment), apps/v1 Deployment API (v1.35).
         Recreate terminates first only `on an upgrade`, per the page Note (T-19).
         The gap is bounded by the removal succeeding, and the outage is the removal plus the start.
         The 25% maxSurge default resolves to 1 at one replica, never `default maxSurge 1`.
         Readiness alone releases the second order only at the default minReadySeconds 0.
         `changes the path and not the result` holds only on an update that completes.
```
