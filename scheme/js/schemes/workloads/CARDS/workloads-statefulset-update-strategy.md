## workloads-statefulset-update-strategy

### layout

```
WHAT     A template change becomes a new revision, and RollingUpdate carries it from the largest
         ordinal to the smallest, one Pod at a time, until the set is done or a partition stops it.
DEVIATES WL.L-06: no LAYOUT preset. A worklist chain in the right column and a two-slot window in
         the left, with the chips as a full-width strip under both.
         WL.A-03: no Node frame. The two slots are the maxUnavailable budget drawn as places, and a
         frame would say the two unavailable Pods share a Node.
         WL.L-01: the chain gap the partition rule falls in is 22, not WL.ROW_GAP. A dashed rule in
         a 10 gap reads as a row border. A tune pushes the rows below it down.
         M-24: an empty slot rests at OPACITY.terminating, not pending. At 0.55 the window reads as
         two Pods on every step.
         M-12: max-unavailable fires both routes at one explicit dur, PAIR_DUR, so the pair lands
         together. At canon speed they land 356ms apart and read as one at a time.
         A-13: no line is pinned to a slot. The window stands empty on most steps.
CONTENT  Sources: Update Strategies, Partitioned Rolling Updates (v1.35), Feature Gates, source.
         `from the largest ordinal to the smallest`, gated on Running and Ready, never on a probe.
         The partition chip reads 0, never `not set`: SetDefaults_StatefulSet writes 0.
         The maxUnavailable gate is off by default from 1.35.4. The page note saying enabled is
         stale, so the card follows the per-patch gate table. No Recreate strategy exists at 1.35.
         A strategy type change records no revision. Only a spec.template edit records rev 4.
OPEN     CENTRE-LOW: the blocks below the panel centre on 210. Moving the window to the middle opens
         a CENTRE finding instead (L-16).
```
