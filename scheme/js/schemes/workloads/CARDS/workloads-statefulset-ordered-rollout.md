## workloads-statefulset-ordered-rollout

### layout

```
WHAT     Ordinals 0, 1 and 2 created in order, each waiting on the previous becoming Ready, and
         registering with the headless Service.
LAYOUT   A. PANEL_B 255.
           ladder left  60..540 from BAND_Y 276
           chips  right 660..1140 from the same line
           node   full width, 496..624, three ordinal slots
           actors StatefulSet 420..780 centred on CX; headless Service hanging UNDER the Api at
                  840..1140 x 152..232, joined by a vertical arrow between the face midpoints,
                  its wire label below it
         The Service is not in the actor row: at 840..1060 against an Api at 700..920 the two
         boxes overlap by 80 units, and so do their wire labels.
LANES    Trunk, a bus at NODE_Y + 12, one tap per ordinal. `ordinals` pins each tap to the SAME
         opacity as the Pod it lands on and splits the bus at the centre slot (busL with ordinal
         0, busR with ordinal 2), so no lane points into a slot whose Pod does not exist yet: on
         idle all three ordinals are 0 and the Node frame is empty. A step turns its own tap on at
         entry, and the ball that rides it is what materializes that Pod.
```

### poster

```
Three Pods each over its own disk, ramping 0.10 / 0.06 / 0.03 with the third dashed, and two
chevrons between them. Ordinal 0 is ready, 1 is coming up, 2 has not started: the ramp is the
ordering and the chevrons are what stop it reading as three states of one Pod.
The whole group is mirrored with a scale(-1,1) so the READY end sits on the right, against the
narration panel's corner rather than under it.
```
