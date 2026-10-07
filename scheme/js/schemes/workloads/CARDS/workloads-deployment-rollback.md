## workloads-deployment-rollback

### layout

```
WHAT     A revision is a ReplicaSet carrying a revision annotation, so rollout history renders those
         objects and a rollback renumbers one of them forward instead of rewinding anything.
DEVIATES WL.A-03: no Node frame and no Pod. The subject is which ReplicaSet carries which revision,
         so a frame is a block no step narrates.
         WL.L-06: reads LAYOUT.C.strip.two for the chip strip only. No ladder, no flanking column.
         L-11: a crossing connector leaves its object 24 left of centre and reaches its row 18
         right. The rollback leaves a three-cycle that centred ends cannot separate.
         A-03: the upward read route enters the owner's left face, not a lane at WL.LANE_DY off the
         trunk. At 12 the pair reads as one doubled rail.
         A-13: a tap or connector stays at 1 while its object is idle and follows it only below
         notready. A strict min fades the shelf ends, which the replica count already states.
CONTENT  Sources: Deployments (Rolling Back, Clean up Policy) v1.35, kubectl and controller source.
         Rev 2 leaves the list and rev 5 appears: ViewHistory prints one row per live ReplicaSet.
         `reuse` never says one controller sync: rolloutRolling returns after a scale-up.
         revisionHistoryLimit counts OLD ReplicaSets, not zero-replica ones. Cleanup waits for a
         complete rollout. A revision is kept at zero only once it is old.
         The hash on the Deployment sublabel is the hash of the template, never a field of its own.
OPEN     chip-beat reads `condition` at entry on the ball steps. The condition is the premise that
         sends the ball, and binding it to an arrival inverts the dependency `prune` rests on.
         The braided caption stands 52.7 clear on its left and 88.7 on its right. It stays on
         WL.CX with the rest of the card.
```
